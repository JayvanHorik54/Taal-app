import type { Scenario } from "../types.ts";

/** Gespreksituaties voor Charla in het Grieks. */
export const scenarios: Scenario[] = [
  { id: "kafeneio", title: "Στο καφενείο", description: "Je bestelt iets en raakt aan de praat" },
  { id: "dromos", title: "Στον δρόμο", description: "Je vraagt de weg in een vreemde stad" },
  { id: "agora", title: "Στη λαϊκή αγορά", description: "Je koopt fruit en vraagt naar de prijs" },
  { id: "gnorimia", title: "Μια γνωριμία", description: "Je stelt jezelf voor aan iemand nieuw" },
  { id: "xenodocheio", title: "Στο ξενοδοχείο", description: "Je checkt in en er klopt iets niet met de kamer" },
  { id: "kouventa", title: "Ελεύθερη κουβέντα", description: "Gewoon kletsen, over wat je maar wilt" },
];
