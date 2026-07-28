import type { LanguagePack } from "../types.ts";
import { decks } from "./vocab.ts";
import { curriculum } from "./curriculum.ts";
import { lessons } from "./lessons.ts";
import { scenarios } from "./scenarios.ts";
import { placement } from "./placement.ts";

export const greek: LanguagePack = {
  code: "el",
  name: "Grieks",
  endonym: "ελληνικά",
  flag: "🇬🇷",
  speechLang: "el-GR",
  /*
   * Bij Spaans zijn dit de tekens die op een NL-toetsenbord ontbreken; bij
   * Grieks is dat het hele alfabet. Zonder deze rij kun je geen enkel antwoord
   * typen, dus staat hij er compleet in: de vierentwintig letters, de sigma aan
   * het eind van een woord, en de klinkers met tonos en trema.
   */
  specialChars: [
    "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ",
    "ν", "ξ", "ο", "π", "ρ", "σ", "ς", "τ", "υ", "φ", "χ", "ψ", "ω",
    "ά", "έ", "ή", "ί", "ό", "ύ", "ώ", "ϊ", "ϋ",
  ],
  pronouns: ["εγώ", "εσύ", "αυτός / αυτή / αυτό", "εμείς", "εσείς", "αυτοί / αυτές / αυτά"],
  /*
   * Het lidwoord verbuigt mee met naamval en getal, dus staan alle vormen
   * erin — anders zou "τον καφέ" niet als "de koffie" herkend worden.
   */
  articles: [
    "ο", "η", "το", "οι", "τα",
    "τον", "την", "του", "της", "των", "τους", "τις",
    "ένας", "μια", "μία", "έναν", "ένα",
  ],
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
  games: { chat: "Κουβέντα", blitz: "Αστραπή" },
  decks,
  curriculum,
  lessons,
  scenarios,
  placement,
};
