import type { Deck, GrammarExercise, Lesson, LanguagePack, Level, Word } from "../content/types.ts";
import { LEVELS } from "../content/types.ts";
import { freshSchedule, isDue, mastery, type Schedule } from "./srs.ts";

/**
 * Voortgang bewaart uitsluitend wat van de leerling is: planning, cijfers,
 * zelf gemaakte lijsten. De woorden en lessen zelf blijven in de content
 * staan, zodat een correctie daar meteen overal doorwerkt.
 */

/**
 * Elk profiel en elke taal hebben een eigen opslagsleutel, zodat voortgang
 * niet mengt. Dit is de plaatselijke kopie; de database is de waarheid.
 */
export const progressKey = (profileId: string, language: string) =>
  `azulejo:progress:v3:${profileId}:${language}`;

/**
 * De sleutel van vóór de profielen. Wie de app al gebruikte heeft hier nog
 * voortgang staan; de muur biedt aan om die over te nemen.
 */
export const oudeProgressKey = (language: string) => `azulejo:progress:v3:${language}`;

export type GradeEntry = {
  id: string;
  name: string;
  kind: "toets" | "examen" | "grammatica";
  score: number;
  total: number;
  cijfer: number;
  date: number;
};

export type TopicProgress = {
  attempts: number;
  /** Beste score als fractie (0–1). */
  best: number;
  /** Door de AI aangevulde uitleg voor hoofdstukken die niet in de content staan. */
  lesson?: Lesson;
};

export type Progress = {
  version: 3;
  language: string;
  level: Level;
  streak: number;
  lastDay: string | null;
  answers: number;
  blitzBest: number;
  /** cardId → planning. cardId = `${deckId}::${term}` */
  cards: Record<string, Schedule>;
  grammar: Record<string, TopicProgress>;
  grades: GradeEntry[];
  exams: Partial<Record<Level, { cijfer: number; date: number }>>;
  /** Door de AI gemaakte lijsten. Die bestaan alleen hier. */
  customDecks: Deck[];
};

export function emptyProgress(language: string): Progress {
  return {
    version: 3,
    language,
    level: "A1",
    streak: 0,
    lastDay: null,
    answers: 0,
    blitzBest: 0,
    cards: {},
    grammar: {},
    grades: [],
    exams: {},
    customDecks: [],
  };
}

export const cardId = (deckId: string, term: string) => `${deckId}::${term}`;

/* ── afgeleide gegevens ─────────────────────────────────── */

export type StudyCard = {
  id: string;
  deckId: string;
  deckTitle: string;
  level: Level;
  word: Word;
  schedule: Schedule;
};

export function allDecks(pack: LanguagePack, progress: Progress): Deck[] {
  return [...pack.decks, ...progress.customDecks];
}

export function buildCards(pack: LanguagePack, progress: Progress): StudyCard[] {
  const cards: StudyCard[] = [];
  for (const deck of allDecks(pack, progress)) {
    for (const word of deck.words) {
      const id = cardId(deck.id, word.term);
      cards.push({
        id,
        deckId: deck.id,
        deckTitle: deck.title,
        level: deck.level,
        word,
        schedule: progress.cards[id] ?? freshSchedule(),
      });
    }
  }
  return cards;
}

export const dueCards = (cards: StudyCard[], now = Date.now()) =>
  cards.filter((c) => c.schedule.reps > 0 && isDue(c.schedule, now));

export const newCards = (cards: StudyCard[]) => cards.filter((c) => c.schedule.reps === 0);

/**
 * Wat een sessie te doen krijgt: eerst wat herhaald moet worden, daarna
 * nieuwe woorden aanvullen tot de sessie vol is. Herhaling gaat voor —
 * anders stapel je nieuwe woorden op die je toch weer vergeet.
 */
export function sessionQueue(cards: StudyCard[], size: number, deckId?: string): StudyCard[] {
  const pool = deckId ? cards.filter((c) => c.deckId === deckId) : cards;
  const due = dueCards(pool).sort((a, b) => a.schedule.due - b.schedule.due);
  const fresh = newCards(pool);
  const queue = [...due.slice(0, size)];
  for (const card of fresh) {
    if (queue.length >= size) break;
    queue.push(card);
  }
  if (queue.length === 0) {
    // Niets te doen: laat de zwakste woorden nog eens langskomen.
    return [...pool].sort((a, b) => a.schedule.interval - b.schedule.interval).slice(0, size);
  }
  return queue;
}

export function topicLevel(pack: LanguagePack, topicId: string): Level {
  return pack.curriculum.find((t) => t.id === topicId)?.level ?? "A1";
}

export function topicMastery(entry: TopicProgress | undefined): 0 | 1 | 2 | 3 {
  if (!entry || !entry.attempts) return 0;
  if (entry.best < 0.6) return 1;
  if (entry.best < 0.85) return 2;
  return 3;
}

export function lessonFor(
  pack: LanguagePack,
  progress: Progress,
  topicId: string
): Lesson | undefined {
  return pack.lessons[topicId] ?? progress.grammar[topicId]?.lesson;
}

export function exercisesFor(
  pack: LanguagePack,
  progress: Progress,
  topicId: string
): GrammarExercise[] {
  return lessonFor(pack, progress, topicId)?.exercises ?? [];
}

/* ── toelating tot het eindexamen ───────────────────────── */

export const MIN_WORDS = 30;
export const KNOWN_RATIO = 0.8;
export const TOPIC_PASS = 0.7;

export type Readiness = {
  words: number;
  known: number;
  needed: number;
  topics: number;
  passed: number;
  wordsOk: boolean;
  grammarOk: boolean;
  ok: boolean;
};

export function readiness(pack: LanguagePack, progress: Progress, level: Level): Readiness {
  const cards = buildCards(pack, progress).filter((c) => c.level === level);
  const known = cards.filter((c) => mastery(c.schedule) >= 2).length;
  const needed = Math.max(MIN_WORDS, Math.ceil(cards.length * KNOWN_RATIO));
  const topics = pack.curriculum.filter((t) => t.level === level);
  const passed = topics.filter((t) => (progress.grammar[t.id]?.best ?? 0) >= TOPIC_PASS).length;
  const wordsOk = cards.length >= MIN_WORDS && known >= needed;
  const grammarOk = topics.length > 0 && passed >= topics.length;
  return {
    words: cards.length,
    known,
    needed,
    topics: topics.length,
    passed,
    wordsOk,
    grammarOk,
    ok: wordsOk && grammarOk,
  };
}

export const unlockedLevels = (progress: Progress): Level[] =>
  LEVELS.slice(0, LEVELS.indexOf(progress.level) + 1);

/* ── niveautest ─────────────────────────────────────────── */

export const PLACEMENT_BLOCK = 6;
export const PLACEMENT_PASS = 4;

/**
 * Verwerkt de uitslag van de niveautest.
 *
 * Woorden van niveaus die je hebt gehaald krijgen alvast een planning mee, in
 * plaats van als nieuw te beginnen. Je krijgt ze dan meteen als vraag in
 * plaats van eerst als introkaartje — en wat je toch niet blijkt te kennen,
 * valt bij het eerste foute antwoord vanzelf terug naar nieuw. Optimistisch
 * dus, maar zelfcorrigerend.
 *
 * De vervaldatums worden over een paar dagen uitgesmeerd; anders staat je hele
 * woordenschat morgen in één keer klaar.
 */
export function applyPlacement(
  pack: LanguagePack,
  progress: Progress,
  level: Level,
  correctTerms: Set<string>,
  now = Date.now()
): Progress {
  const passed = LEVELS.slice(0, LEVELS.indexOf(level)); // alles ónder je nieuwe niveau
  const cards = { ...progress.cards };

  for (const deck of allDecks(pack, progress)) {
    if (!passed.includes(deck.level)) continue;
    for (const word of deck.words) {
      const id = cardId(deck.id, word.term);
      if (progress.cards[id]) continue; // al eens geoefend: niet overschrijven

      const zeker = correctTerms.has(word.term);
      cards[id] = {
        ease: 2.3,
        interval: zeker ? 4 : 1,
        reps: zeker ? 2 : 1,
        lapses: 0,
        due: now + Math.floor(Math.random() * (zeker ? 4 : 3)) * 86_400_000,
      };
    }
  }

  return { ...progress, level, cards };
}

/* ── streak ─────────────────────────────────────────────── */

export function bumpStreak(progress: Progress, now = Date.now()): Progress {
  const today = new Date(now).toDateString();
  if (progress.lastDay === today) return progress;
  const yesterday = new Date(now - 86_400_000).toDateString();
  const streak = progress.lastDay === yesterday ? progress.streak + 1 : 1;
  return { ...progress, streak, lastDay: today };
}
