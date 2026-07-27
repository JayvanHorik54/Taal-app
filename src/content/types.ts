/**
 * Taalonafhankelijke contentmodellen.
 *
 * De engine (SRS, oefeningen, examens) kent géén Spaans. Alles wat
 * taalspecifiek is zit in een LanguagePack. Een taal toevoegen =
 * één map onder src/content/<code>/ en één regel in registry.ts.
 */

export type Level = "A1" | "A2" | "B1" | "B2";

export const LEVELS: Level[] = ["A1", "A2", "B1", "B2"];
export const NEXT_LEVEL: Record<Level, Level | null> = {
  A1: "A2",
  A2: "B1",
  B1: "B2",
  B2: null,
};

export type Word = {
  /** Het woord in de doeltaal, inclusief lidwoord waar dat hoort. */
  term: string;
  /** Nederlandse vertaling. Varianten scheiden met een komma. */
  translation: string;
  exampleTarget?: string;
  exampleNative?: string;
};

export type Deck = {
  id: string;
  title: string;
  level: Level;
  words: Word[];
  /** Door de AI aangemaakt in plaats van meegeleverd. */
  generated?: boolean;
};

export type Topic = {
  id: string;
  level: Level;
  title: string;
};

export type GrammarExercise =
  | { type: "choice"; prompt: string; options: string[]; answer: string; why: string }
  | { type: "fill"; prompt: string; answer: string; why: string }
  | { type: "transform"; prompt: string; answer: string; why: string }
  | { type: "conjugate"; verb: string; tense: string; answers: string[]; why: string };

export type Lesson = {
  /** Eén zin die de hele regel samenvat. */
  core: string;
  intro: string[];
  table?: { title: string; rows: [string, string][] };
  rules: { title: string; text: string }[];
  examples: { target: string; native: string }[];
  pitfall?: string;
  exercises: GrammarExercise[];
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
};

/**
 * Vragen voor de niveautest. Bewust los van het lesmateriaal: je wilt niet
 * getoetst worden op de zinnen die je straks moet leren, en de test moet
 * hoger kunnen reiken dan de hoofdstukken die al uitgeschreven zijn.
 */
export type PlacementItem = {
  level: Level;
  prompt: string;
  options: string[];
  answer: string;
  why: string;
};

export type LanguagePack = {
  code: string;
  /** Naam in het Nederlands, bv. "Spaans". */
  name: string;
  /** Naam in de taal zelf, bv. "español". */
  endonym: string;
  /** Vlag-emoji voor de taalkeuze. */
  flag: string;
  /** BCP-47 tag voor spraak (synthese én herkenning). */
  speechLang: string;
  /** Toetsenbordknoppen voor tekens die niet op een NL-toetsenbord staan. */
  specialChars: string[];
  /** Persoonsvormen in de volgorde die de conjugatie-oefening gebruikt. */
  pronouns: string[];
  /** Lidwoorden die bij een 'bijna goed'-check genegeerd mogen worden. */
  articles: string[];
  themes: string[];
  /** Namen van de twee spelvormen, in de doeltaal zelf. */
  games: { chat: string; blitz: string };
  decks: Deck[];
  curriculum: Topic[];
  lessons: Record<string, Lesson>;
  scenarios: Scenario[];
  placement: PlacementItem[];
};
