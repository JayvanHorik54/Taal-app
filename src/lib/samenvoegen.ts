import { LEVELS, type Level } from "../content/types.ts";
import { emptyProgress, type GradeEntry, type Progress, type TopicProgress } from "./progress.ts";
import type { Schedule } from "./srs.ts";

/**
 * Twee versies van dezelfde voortgang tot één maken.
 *
 * Dit is wat accounts op meer dan één apparaat mogelijk maakt. "Laatste
 * schrijver wint" over het hele blok zou een sessie op de telefoon wissen
 * zodra de laptop iets opslaat. Dat hoeft niet, want bijna alles hier groeit
 * maar één kant op: een woord dat je vaker hebt geoefend, een cijfer dat erbij
 * komt, een teller die oploopt.
 *
 * Twee eisen waar elke regel hieronder aan moet voldoen:
 *
 * 1. **Idempotent** — `voeg(a, voeg(a, b))` geeft hetzelfde als `voeg(a, b)`.
 *    De client voegt zijn cache bij het serverantwoord, de server voegt dat
 *    weer bij wat hij al had; dezelfde gegevens komen dus meermaals langs.
 *    Daarom `max` en nooit `+`: optellen zou bij elke synchronisatie
 *    dubbeltellen.
 * 2. **Volgorde maakt niet uit** — welk apparaat het eerst synchroniseert mag
 *    de uitkomst niet bepalen.
 *
 * Wat je hiermee inlevert: twee apparaten die tegelijk offline dezelfde twintig
 * antwoorden geven, tellen als twintig en niet als veertig. Dat is de goede
 * kant om te missen — een teller die iets te laag staat is beter dan een
 * planning die je woorden te vroeg terugbrengt.
 */

/** Van twee planningen die met de meeste beurten erop: die weet het meest. */
function verstePlanning(a: Schedule, b: Schedule): Schedule {
  const beurtenA = a.reps + a.lapses;
  const beurtenB = b.reps + b.lapses;
  if (beurtenA !== beurtenB) return beurtenA > beurtenB ? a : b;
  // Even ver: de latere vervaldatum komt van de recentste beurt.
  return a.due >= b.due ? a : b;
}

function voegKaarten(
  a: Record<string, Schedule>,
  b: Record<string, Schedule>
): Record<string, Schedule> {
  const uit: Record<string, Schedule> = { ...a };
  for (const [id, planning] of Object.entries(b)) {
    const bestaand = uit[id];
    uit[id] = bestaand ? verstePlanning(bestaand, planning) : planning;
  }
  return uit;
}

function voegGrammatica(
  a: Record<string, TopicProgress>,
  b: Record<string, TopicProgress>
): Record<string, TopicProgress> {
  const uit: Record<string, TopicProgress> = { ...a };
  for (const [id, entry] of Object.entries(b)) {
    const bestaand = uit[id];
    uit[id] = bestaand
      ? {
          attempts: Math.max(bestaand.attempts, entry.attempts),
          best: Math.max(bestaand.best, entry.best),
          // Een door de AI gemaakte uitleg is er of niet; twee versies zijn
          // even geldig, dus de eerste die er was blijft staan.
          lesson: bestaand.lesson ?? entry.lesson,
        }
      : entry;
  }
  return uit;
}

/** Cijfers hebben een eigen id, dus samenvoegen is ontdubbelen op dat id. */
function voegCijfers(a: GradeEntry[], b: GradeEntry[]): GradeEntry[] {
  const opId = new Map<string, GradeEntry>();
  for (const cijfer of [...a, ...b]) opId.set(cijfer.id, cijfer);
  return [...opId.values()].sort((x, y) => y.date - x.date).slice(0, 40);
}

function voegExamens(
  a: Progress["exams"],
  b: Progress["exams"]
): Progress["exams"] {
  const uit: Progress["exams"] = { ...a };
  for (const niveau of LEVELS) {
    const links = a[niveau];
    const rechts = b[niveau];
    // Een herkansing verbetert je cijfer, nooit omlaag — net als in de app zelf.
    if (!links) {
      if (rechts) uit[niveau] = rechts;
    } else if (rechts && rechts.cijfer > links.cijfer) {
      uit[niveau] = rechts;
    }
  }
  return uit;
}

/** Eigen lijsten hebben een id; dubbele lijsten tellen als één. */
function voegLijsten(a: Progress["customDecks"], b: Progress["customDecks"]) {
  const opId = new Map(a.map((deck) => [deck.id, deck]));
  for (const deck of b) if (!opId.has(deck.id)) opId.set(deck.id, deck);
  return [...opId.values()];
}

const hoogsteNiveau = (a: Level, b: Level): Level =>
  LEVELS.indexOf(a) >= LEVELS.indexOf(b) ? a : b;

/**
 * Streak hoort bij een dag, niet bij een teller. De laatste dag wint, en de
 * langste reeks blijft staan — wie op twee apparaten oefent verliest zijn
 * reeks niet doordat het ene apparaat achterloopt.
 */
function voegStreak(a: Progress, b: Progress): Pick<Progress, "streak" | "lastDay"> {
  const dagA = a.lastDay ? Date.parse(a.lastDay) : -Infinity;
  const dagB = b.lastDay ? Date.parse(b.lastDay) : -Infinity;
  return {
    streak: Math.max(a.streak, b.streak),
    lastDay: dagA >= dagB ? a.lastDay : b.lastDay,
  };
}

export function voegSamen(a: Progress, b: Progress): Progress {
  if (a.language !== b.language) {
    throw new Error(`kan voortgang van ${a.language} en ${b.language} niet samenvoegen`);
  }

  return {
    version: 3,
    language: a.language,
    level: hoogsteNiveau(a.level, b.level),
    ...voegStreak(a, b),
    answers: Math.max(a.answers, b.answers),
    blitzBest: Math.max(a.blitzBest, b.blitzBest),
    cards: voegKaarten(a.cards, b.cards),
    grammar: voegGrammatica(a.grammar, b.grammar),
    grades: voegCijfers(a.grades, b.grades),
    exams: voegExamens(a.exams, b.exams),
    customDecks: voegLijsten(a.customDecks, b.customDecks),
  };
}

/**
 * Wat er uit de database of uit localStorage komt is niet te vertrouwen: het
 * kan van een oudere versie zijn, of half. Dit maakt er weer een hele
 * `Progress` van, zodat de rest van de app nooit op ontbrekende velden stuit.
 */
export function leesVoortgang(ruw: unknown, taal: string): Progress {
  const leeg = emptyProgress(taal);
  if (!ruw || typeof ruw !== "object") return leeg;
  const deel = ruw as Partial<Progress>;

  return {
    ...leeg,
    ...deel,
    language: taal,
    version: 3,
    cards: deel.cards ?? {},
    grammar: deel.grammar ?? {},
    grades: deel.grades ?? [],
    exams: deel.exams ?? {},
    customDecks: deel.customDecks ?? [],
  };
}
