import type { PlacementItem } from "../types";

/**
 * Zes vragen per niveau. De test loopt de niveaus af van laag naar hoog en
 * stopt zodra je een ronde niet haalt — hoe verder je komt, hoe hoger je
 * begint. Elke vraag heeft één duidelijk juist antwoord; twijfelgevallen
 * (waar meerdere vormen in spreektaal kunnen) zijn er bewust uit gelaten.
 */
export const placement: PlacementItem[] = [
  /* ── A1 ─────────────────────────────────────────────────── */
  {
    level: "A1",
    prompt: "___ ventana está abierta.",
    options: ["El", "La", "Los"],
    answer: "La",
    why: "Ventana eindigt op -a en is vrouwelijk enkelvoud.",
  },
  {
    level: "A1",
    prompt: "Yo ___ de los Países Bajos.",
    options: ["soy", "estoy", "es"],
    answer: "soy",
    why: "Herkomst gaat met ser, eerste persoon: soy.",
  },
  {
    level: "A1",
    prompt: "La estación ___ muy cerca de aquí.",
    options: ["es", "está", "hay"],
    answer: "está",
    why: "Plaats gaat altijd met estar, ook als iets nooit verplaatst.",
  },
  {
    level: "A1",
    prompt: "Nosotros ___ en un restaurante.",
    options: ["como", "comemos", "coméis"],
    answer: "comemos",
    why: "Comer is een -er werkwoord; nosotros krijgt -emos.",
  },
  {
    level: "A1",
    prompt: "___ un supermercado en esta calle.",
    options: ["Hay", "Está", "Es"],
    answer: "Hay",
    why: "Iets onbekends introduceren gaat met hay, niet met está.",
  },
  {
    level: "A1",
    prompt: "Tengo dos hermanas ___.",
    options: ["alto", "alta", "altas"],
    answer: "altas",
    why: "Het bijvoeglijk naamwoord past zich aan: vrouwelijk meervoud.",
  },

  /* ── A2 ─────────────────────────────────────────────────── */
  {
    level: "A2",
    prompt: "Ayer ___ al cine con mi hermana.",
    options: ["voy", "fui", "iba"],
    answer: "fui",
    why: "Ayer wijst op één afgeronde gebeurtenis: indefinido.",
  },
  {
    level: "A2",
    prompt: "A mí ___ mucho las películas españolas.",
    options: ["me gusta", "me gustan", "gusto"],
    answer: "me gustan",
    why: "Gustar richt zich naar wat bevalt; películas is meervoud.",
  },
  {
    level: "A2",
    prompt: "Cuando era pequeño, ___ mucho al fútbol.",
    options: ["jugué", "jugaba", "juego"],
    answer: "jugaba",
    why: "Een gewoonte in het verleden gaat met imperfecto.",
  },
  {
    level: "A2",
    prompt: "Esta semana ___ tres libros.",
    options: ["leí", "he leído", "leía"],
    answer: "he leído",
    why: "Esta semana is nog bezig, dus pretérito perfecto.",
  },
  {
    level: "A2",
    prompt: "¿Me das el pan? Sí, ahora ___ doy.",
    options: ["lo te", "te lo", "le lo"],
    answer: "te lo",
    why: "Eerst het meewerkend voorwerp, dan het lijdend voorwerp.",
  },
  {
    level: "A2",
    prompt: "___ la puerta, por favor.",
    options: ["Cierra", "Cierras", "Cerrar"],
    answer: "Cierra",
    why: "Gebiedende wijs tú van cerrar.",
  },

  /* ── B1 ─────────────────────────────────────────────────── */
  {
    level: "B1",
    prompt: "Mañana ___ a Sevilla en tren.",
    options: ["iré", "iba", "fui"],
    answer: "iré",
    why: "Mañana wijst vooruit: futuro simple.",
  },
  {
    level: "B1",
    prompt: "Si tuviera dinero, ___ un coche nuevo.",
    options: ["compro", "compraría", "compraré"],
    answer: "compraría",
    why: "Bij si + subjuntivo imperfecto hoort de condicional.",
  },
  {
    level: "B1",
    prompt: "Espero que ___ pronto.",
    options: ["vienes", "vengas", "vendrás"],
    answer: "vengas",
    why: "Na een wens of hoop volgt de subjuntivo.",
  },
  {
    level: "B1",
    prompt: "Estudio español ___ trabajar en España.",
    options: ["por", "para", "a"],
    answer: "para",
    why: "Para geeft het doel aan, por de oorzaak.",
  },
  {
    level: "B1",
    prompt: "Ahora mismo estamos ___ la cena.",
    options: ["preparar", "preparando", "preparado"],
    answer: "preparando",
    why: "Estar + gerundio voor iets dat nu bezig is.",
  },
  {
    level: "B1",
    prompt: "No creo que ___ verdad.",
    options: ["es", "sea", "será"],
    answer: "sea",
    why: "Een ontkende mening trekt de subjuntivo aan.",
  },

  /* ── B2 ─────────────────────────────────────────────────── */
  {
    level: "B2",
    prompt: "Ojalá ___ más tiempo ayer.",
    options: ["tuve", "tenía", "hubiera tenido"],
    answer: "hubiera tenido",
    why: "Een onvervulde wens over het verleden vraagt de subjuntivo pluscuamperfecto.",
  },
  {
    level: "B2",
    prompt: "Cuando llegué, ellos ya ___.",
    options: ["se fueron", "se habían ido", "se iban"],
    answer: "se habían ido",
    why: "Iets dat vóór een ander verledenmoment gebeurde: pluscuamperfecto.",
  },
  {
    level: "B2",
    prompt: "El puente ___ en 1920.",
    options: ["fue construido", "estuvo construido", "era construido"],
    answer: "fue construido",
    why: "De lijdende vorm van een handeling gaat met ser.",
  },
  {
    level: "B2",
    prompt: "El chico ___ padre conoces vive aquí.",
    options: ["que", "quien", "cuyo"],
    answer: "cuyo",
    why: "Cuyo geeft bezit aan: de jongen wiens vader je kent.",
  },
  {
    level: "B2",
    prompt: "Me dijo que ___ al día siguiente.",
    options: ["viene", "vendrá", "vendría"],
    answer: "vendría",
    why: "In de indirecte rede schuift de toekomende tijd naar de condicional.",
  },
  {
    level: "B2",
    prompt: "Aunque ___ tarde, seguiremos trabajando.",
    options: ["es", "sea", "será"],
    answer: "sea",
    why: "Aunque + subjuntivo maakt er een toegeving van: ook al zou het laat zijn.",
  },

  /* ── C1 ─────────────────────────────────────────────────── */
  {
    level: "C1",
    prompt: "No es que ___ mal, es que no me convence.",
    options: ["está", "esté", "estará"],
    answer: "esté",
    why: "Na no es que volgt altijd de subjuntivo: je ontkent de reden, niet het feit.",
  },
  {
    level: "C1",
    prompt: "—¿Dónde está Ana? —No sé, ___ en casa.",
    options: ["está", "estará", "esté"],
    answer: "estará",
    why: "De futuro drukt hier geen toekomst uit maar een vermoeden: ze zal wel thuis zijn.",
  },
  {
    level: "C1",
    prompt: "___ tres años trabajando en esta empresa.",
    options: ["Llevo", "Hago", "Tengo"],
    answer: "Llevo",
    why: "Llevar + tijd + gerundio geeft aan hoe lang iets al aan de gang is.",
  },
  {
    level: "C1",
    prompt: "En esta oficina ___ mucho los viernes.",
    options: ["se trabaja", "se trabajan", "trabajarse"],
    answer: "se trabaja",
    why: "Het onpersoonlijke se blijft enkelvoud: er wordt gewerkt, zonder wie.",
  },
  {
    level: "C1",
    prompt: "___ la lluvia, la fiesta fue un éxito.",
    options: ["Pese a", "Debido a", "Gracias a"],
    answer: "Pese a",
    why: "Pese a zet twee dingen tegenover elkaar; debido a en gracias a geven juist de oorzaak.",
  },
  {
    level: "C1",
    prompt: "Me ___ igual lo que digan los demás.",
    options: ["da", "hace", "pone"],
    answer: "da",
    why: "Dar igual is een vaste uitdrukking: het maakt mij niet uit.",
  },
];
