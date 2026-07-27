import type { Level } from "../content/types.ts";

/**
 * Hoe snel de app voorleest.
 *
 * Stond op 0,9 voor iedereen. Dat is voor een beginner te snel: op A1 hoor je
 * geen losse woorden maar één brij, en dan valt er niets na te zeggen. Een
 * gevorderde heeft juist niets aan slepend gepraat — die moet wennen aan hoe
 * het buiten klinkt.
 *
 * Vandaar een oplopende schaal. Hij hangt aan het niveau van de leerling en
 * niet aan dat van het woord: het gaat erom wat jóuw oor aankan, niet hoe
 * moeilijk het woord is.
 *
 * Niet lager dan 0,5 — daaronder gaan de stemmen van de browser vervormen en
 * hoor je klanken die in de taal niet bestaan. Dan leer je iets verkeerds.
 */
export const TEMPO: Record<Level, number> = {
  A1: 0.75,
  A2: 0.83,
  B1: 0.9,
  B2: 0.95,
  C1: 1,
};

/** Wat de knop "langzamer" eraf haalt. */
export const STAP_TRAGER = 0.2;

/** Onder deze snelheid gaat de spraaksynthese rammelen. */
export const TRAAGST = 0.5;

export function spreeksnelheid(level: Level, trager = false): number {
  const basis = TEMPO[level] ?? TEMPO.A2;
  if (!trager) return basis;
  // Afronden op twee cijfers, anders krijg je 0.5499999999999999.
  return Math.max(TRAAGST, Math.round((basis - STAP_TRAGER) * 100) / 100);
}
