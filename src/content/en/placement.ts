import type { PlacementItem } from "../types.ts";

/**
 * Zes vragen per niveau voor de niveautest. Gekozen op wat écht onderscheidt
 * tussen niveaus bij Nederlandstaligen — do-support, de present perfect, de
 * conditionals — en niet op wat toevallig moeilijke woorden zijn.
 */
export const placement: PlacementItem[] = [
  /* ── A1 ─────────────────────────────────────────────────── */
  {
    level: "A1",
    prompt: "She ___ a teacher at our school.",
    options: ["am", "is", "are"],
    answer: "is",
    why: "Bij she hoort is.",
  },
  {
    level: "A1",
    prompt: "I would like ___ apple, please.",
    options: ["a", "an", "the"],
    answer: "an",
    why: "Voor een klinkerklank gebruik je an.",
  },
  {
    level: "A1",
    prompt: "He ___ in Amsterdam.",
    options: ["live", "lives", "living"],
    answer: "lives",
    why: "Bij he, she en it krijgt het werkwoord een -s.",
  },
  {
    level: "A1",
    prompt: "___ you speak English?",
    options: ["Do", "Are", "Have"],
    answer: "Do",
    why: "Een vraag met een gewoon werkwoord begint met do of does.",
  },
  {
    level: "A1",
    prompt: "There ___ two chairs in the kitchen.",
    options: ["is", "are", "have"],
    answer: "are",
    why: "Bij een meervoud hoort there are.",
  },
  {
    level: "A1",
    prompt: "This is ___ car.",
    options: ["the my", "my", "mine car"],
    answer: "my",
    why: "Een bezittelijk voornaamwoord staat er zonder lidwoord voor.",
  },

  /* ── A2 ─────────────────────────────────────────────────── */
  {
    level: "A2",
    prompt: "Look, it ___ outside.",
    options: ["rains", "is raining", "rained"],
    answer: "is raining",
    why: "Iets dat op dit moment gebeurt vraagt om de present continuous.",
  },
  {
    level: "A2",
    prompt: "We ___ to Paris last summer.",
    options: ["go", "went", "have gone"],
    answer: "went",
    why: "Last summer is afgesloten, dus past simple.",
  },
  {
    level: "A2",
    prompt: "I ___ my keys. I can't find them anywhere.",
    options: ["lost", "have lost", "was losing"],
    answer: "have lost",
    why: "Het gevolg telt nu nog, dus present perfect.",
  },
  {
    level: "A2",
    prompt: "This book is ___ than the other one.",
    options: ["more good", "better", "gooder"],
    answer: "better",
    why: "Good heeft een onregelmatige vergrotende trap: better.",
  },
  {
    level: "A2",
    prompt: "You ___ wear a helmet. It's the law.",
    options: ["must", "can", "would"],
    answer: "must",
    why: "Must drukt een verplichting uit.",
  },
  {
    level: "A2",
    prompt: "She didn't ___ the film.",
    options: ["liked", "like", "likes"],
    answer: "like",
    why: "Na didn't komt de infinitief zonder verleden tijd.",
  },

  /* ── B1 ─────────────────────────────────────────────────── */
  {
    level: "B1",
    prompt: "If it rains tomorrow, we ___ at home.",
    options: ["stay", "will stay", "would stay"],
    answer: "will stay",
    why: "First conditional: if + present simple, dan will.",
  },
  {
    level: "B1",
    prompt: "If I had more time, I ___ Spanish too.",
    options: ["will learn", "would learn", "learn"],
    answer: "would learn",
    why: "Second conditional: if + past simple, dan would.",
  },
  {
    level: "B1",
    prompt: "The bridge ___ in 1890.",
    options: ["built", "was built", "is building"],
    answer: "was built",
    why: "De lijdende vorm: was plus het voltooid deelwoord.",
  },
  {
    level: "B1",
    prompt: "That's the woman ___ helped me yesterday.",
    options: ["which", "who", "what"],
    answer: "who",
    why: "Voor personen gebruik je who, niet which.",
  },
  {
    level: "B1",
    prompt: "I enjoy ___ in the mornings.",
    options: ["to run", "running", "run"],
    answer: "running",
    why: "Na enjoy volgt altijd een gerund.",
  },
  {
    level: "B1",
    prompt: "There isn't ___ milk left.",
    options: ["many", "much", "a lot"],
    answer: "much",
    why: "Milk is ontelbaar, dus much.",
  },

  /* ── B2 ─────────────────────────────────────────────────── */
  {
    level: "B2",
    prompt: "If I had known, I ___ you.",
    options: ["would tell", "would have told", "had told"],
    answer: "would have told",
    why: "Third conditional: would have plus voltooid deelwoord.",
  },
  {
    level: "B2",
    prompt: "By the time we arrived, the film ___.",
    options: ["already started", "had already started", "was already starting"],
    answer: "had already started",
    why: "Iets dat vóór een ander verledenmoment gebeurde: past perfect.",
  },
  {
    level: "B2",
    prompt: "She said she ___ the next day.",
    options: ["will come", "would come", "comes"],
    answer: "would come",
    why: "In de indirecte rede schuift will door naar would.",
  },
  {
    level: "B2",
    prompt: "He isn't answering. He ___ his phone at home.",
    options: ["must leave", "must have left", "should leave"],
    answer: "must have left",
    why: "Een sterk vermoeden over het verleden: must have plus deelwoord.",
  },
  {
    level: "B2",
    prompt: "I wish I ___ more languages.",
    options: ["speak", "spoke", "will speak"],
    answer: "spoke",
    why: "Na I wish over het heden gebruik je de past simple.",
  },
  {
    level: "B2",
    prompt: "Never ___ such a beautiful view.",
    options: ["I have seen", "have I seen", "I saw"],
    answer: "have I seen",
    why: "Na een ontkennend woord vooraan draait de zin om.",
  },
];
