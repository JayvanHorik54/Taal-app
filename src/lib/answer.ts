/**
 * Antwoorden vergelijken — script-onafhankelijk.
 *
 * Het originele prototype gebruikte /[^a-z0-9 ]/ om te normaliseren.
 * Daar overleeft geen Cyrillisch of Grieks teken: een Russisch antwoord
 * werd een lege string en dus altijd fout. Hier gebruiken we Unicode
 * property escapes (\p{L}, \p{N}), zodat elk alfabet werkt.
 */

const PUNCTUATION = /[^\p{L}\p{N}\s]/gu;
const DIACRITICS = /\p{Diacritic}/gu;

/** Kleine letters, leestekens weg, spaties samengevouwen. Accenten blijven staan. */
export function normalize(input: string): string {
  return (input ?? "")
    .toLowerCase()
    .replace(PUNCTUATION, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Zelfde, maar zonder accenten — voor de 'bijna goed'-check. */
export function normalizeLoose(input: string): string {
  return normalize(input).normalize("NFD").replace(DIACRITICS, "").normalize("NFC");
}

/**
 * "de kaart, de plattegrond" → ["de kaart", "de plattegrond"]
 *
 * Een komma betekent alleen "of" in een lijstje betekenissen. In een hele zin
 * is het gewoon een leesteken, en dan mag je hem niet opknippen — anders zou
 * "Mientras trabajaba" volstaan als vertaling van "Mientras trabajaba, llamó."
 */
export function variants(expected: string): string[] {
  const trimmed = expected.trim();
  const isZin = /[.!?]$/.test(trimmed);
  const scheiding = isZin ? /[;/]|\bof\b/gi : /[,;/]|\bof\b/gi;
  return trimmed
    .split(scheiding)
    .map((v) => v.trim())
    .filter(Boolean);
}

function withoutArticles(value: string, articles: string[]): string {
  const words = value.split(" ");
  const dutch = ["de", "het", "een"];
  const strip = new Set([...articles, ...dutch].map((a) => a.toLowerCase()));
  while (words.length > 1 && strip.has(words[0])) words.shift();
  return words.join(" ");
}

export type Verdict = {
  correct: boolean;
  /** Goed gerekend, maar er viel iets op. Bijvoorbeeld een missend accent. */
  note?: string;
  /** Het antwoord waar we op uitkwamen — handig om te tonen. */
  matched?: string;
};

/**
 * Vergelijkt wat de leerling typte met het verwachte antwoord.
 *
 * Accent- en lidwoordfouten worden goed gerekend maar wél benoemd: streng
 * afkeuren op één accent haalt het tempo uit een oefensessie, maar
 * stilzwijgend goedkeuren leert je de fout aan.
 */
export function judge(given: string, expected: string, articles: string[] = []): Verdict {
  const answer = normalize(given);
  if (!answer) return { correct: false };

  // Het hele antwoord gaat vóór de losse varianten. Anders sneuvelt elke zin
  // met een komma erin: "Mientras trabajaba, llamó." zou opgeknipt worden tot
  // twee brokstukken die allebei niet kloppen.
  const options = [expected, ...variants(expected)].filter(
    (value, i, all) => value.trim() && all.indexOf(value) === i
  );

  for (const option of options) {
    if (answer === normalize(option)) return { correct: true, matched: option };
  }

  for (const option of options) {
    if (normalizeLoose(given) === normalizeLoose(option)) {
      return { correct: true, note: `Let op de schrijfwijze: ${option}`, matched: option };
    }
  }

  for (const option of options) {
    const bare = withoutArticles(normalizeLoose(given), articles);
    const target = withoutArticles(normalizeLoose(option), articles);
    if (bare && bare === target) {
      return { correct: true, note: `Het lidwoord hoort erbij: ${option}`, matched: option };
    }
  }

  return { correct: false };
}

/** Losse woorden vergelijken voor de vervoegingstabel. */
export function judgeAll(given: string[], expected: string[]): boolean[] {
  return expected.map((e, i) => judge(given[i] ?? "", e).correct);
}
