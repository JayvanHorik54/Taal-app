import type { StudyCard } from "./progress.ts";

/**
 * Welke vraag krijg je over een woord?
 *
 * Dit is engine-werk, geen schermwerk: welke vorm past bij hoe goed je een
 * woord kent, en hoe voorkom je dat een sessie aanvoelt als één oefening die
 * twaalf keer langskomt. De componenten tekenen alleen wat hier gekozen is.
 */

/**
 * De vraagvormen, van makkelijk naar moeilijk.
 *
 * De drie keuzevormen zijn er niet om het simpel te houden maar om de sprong
 * te dempen: van "kies de vertaling" meteen naar "typ het woord uit je hoofd"
 * is een gat waar je op afhaakt. Kiezen uit vier doelwoorden zit daartussen —
 * je moet de vorm herkennen, maar je hoeft hem nog niet op te diepen.
 */
export type VocabKind =
  | "recognize" // doelwoord zien, de betekenis kiezen
  | "produce-choice" // betekenis zien, het doelwoord kiezen
  | "listen-choice" // woord horen, de betekenis kiezen
  | "recall" // betekenis zien, het doelwoord schrijven
  | "listen" // woord horen en opschrijven
  | "cloze" // het woord invullen in een zin
  | "build" // de zin zelf bouwen uit losse woorden
  | "speak"; // het woord hardop zeggen

/** Vormen waar je het antwoord uitschrijft en dus zelf op "Nakijken" drukt. */
export const TYPEVORMEN: VocabKind[] = ["recall", "listen", "cloze"];

/* ── het woord uit de zin halen ─────────────────────────── */

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Zet het woord in de voorbeeldzin om in een invulgat, of null als het er niet in staat. */
export function blankOut(sentence: string, term: string): string | null {
  const core = term.split(" ").slice(-1)[0];
  const pattern = new RegExp(`(^|[^\\p{L}])(${escapeRegExp(core)})([^\\p{L}]|$)`, "iu");
  if (!pattern.test(sentence)) return null;
  return sentence.replace(pattern, (_m, before, _word, after) => `${before}_____${after}`);
}

/* ── zinnen bouwen ──────────────────────────────────────── */

/**
 * Een zin is te bouwen als hij niet uit twee woorden bestaat — dan is er geen
 * volgorde om fout te doen — en ook geen alinea is, want dan wordt het op een
 * telefoon een puzzel van twintig knopjes.
 */
export const BOUW_MIN = 3;
export const BOUW_MAX = 10;

export function bouwbaar(zin: string | undefined): boolean {
  if (!zin) return false;
  const woorden = zin.trim().split(/\s+/).filter(Boolean);
  return woorden.length >= BOUW_MIN && woorden.length <= BOUW_MAX;
}

/* ── de keuze ───────────────────────────────────────────── */

/**
 * Welke vraagvorm past bij dit woord op dit moment?
 *
 * Hoe beter je een woord kent, hoe meer er van je gevraagd wordt: eerst
 * aanwijzen, dan zelf opdiepen, dan verstaan, dan in een zin, en uiteindelijk
 * uitspreken.
 *
 * `vorige` is de vorm van de vraag hiervoor, en die valt af. Puur willekeurig
 * trekken levert makkelijk drie keer achter elkaar hetzelfde op, en dan voelt
 * het als één oefening — ook als de verdeling over honderd kaarten klopt.
 */
/** Welke vormen komen voor deze kaart überhaupt in aanmerking? */
export function vormenVoor(card: StudyCard): VocabKind[] {
  const { reps } = card.schedule;
  const zin = card.word.exampleTarget;
  const heeftGat = Boolean(zin && blankOut(zin, card.word.term));
  const heeftBouw = Boolean(zin && card.word.exampleNative && bouwbaar(zin));

  const vormen: VocabKind[] = ["recall", "produce-choice", "listen-choice"];
  if (reps <= 1) vormen.push("recognize");
  if (reps >= 2) vormen.push("listen");
  if (reps >= 2 && heeftGat) vormen.push("cloze");
  if (reps >= 2 && heeftBouw) vormen.push("build");
  if (reps >= 3) vormen.push("speak");
  return vormen;
}

export function pickKind(card: StudyCard, vorige?: VocabKind): VocabKind {
  const vormen = vormenVoor(card);
  const zonderVorige = vormen.filter((kind) => kind !== vorige);
  // Alleen als er niets overblijft mag dezelfde vorm alsnog: beter herhaling
  // dan geen vraag.
  const pool = zonderVorige.length ? zonderVorige : vormen;
  return pool[Math.floor(Math.random() * pool.length)];
}
