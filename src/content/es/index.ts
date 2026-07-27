import type { LanguagePack } from "../types.ts";
import { decks } from "./vocab.ts";
import { curriculum } from "./curriculum.ts";
import { lessons } from "./lessons.ts";
import { scenarios } from "./scenarios.ts";
import { placement } from "./placement.ts";

export const spanish: LanguagePack = {
  code: "es",
  name: "Spaans",
  endonym: "español",
  flag: "🇪🇸",
  speechLang: "es-ES",
  specialChars: ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"],
  pronouns: ["yo", "tú", "él / ella", "nosotros", "vosotros", "ellos / ellas"],
  articles: ["el", "la", "los", "las", "un", "una", "unos", "unas"],
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
  games: { chat: "Charla", blitz: "Relámpago" },
  decks,
  curriculum,
  lessons,
  scenarios,
  placement,
};
