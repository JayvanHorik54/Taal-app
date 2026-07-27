import type { LanguagePack } from "../types.ts";
import { decks } from "./vocab.ts";
import { curriculum } from "./curriculum.ts";
import { lessons } from "./lessons.ts";
import { scenarios } from "./scenarios.ts";
import { placement } from "./placement.ts";

export const english: LanguagePack = {
  code: "en",
  name: "Engels",
  endonym: "English",
  flag: "🇬🇧",
  speechLang: "en-GB",
  // Het Engels heeft geen tekens die op een Nederlands toetsenbord ontbreken.
  specialChars: [],
  pronouns: ["I", "you", "he / she / it", "we", "you (mv.)", "they"],
  articles: ["a", "an", "the"],
  themes: [
    "Dagelijks leven",
    "Eten & drinken",
    "Reizen",
    "Small talk",
    "Werk & school",
    "Gevoelens",
    "Uitgaan",
    "Wonen",
    "Gezondheid",
    "Natuur & weer",
  ],
  games: { chat: "Chit-chat", blitz: "Lightning" },
  decks,
  curriculum,
  lessons,
  scenarios,
  placement,
};
