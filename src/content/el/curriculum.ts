import type { Topic } from "../types.ts";

/**
 * De grammatica-leerlijn Grieks, opgebouwd vanuit waar Nederlandstaligen
 * daadwerkelijk over struikelen: een ander alfabet, naamvallen, het geslacht
 * dat overal doorwerkt, en een taal die geen infinitief heeft.
 *
 * Het alfabet staat bewust als eerste hoofdstuk. Bij Spaans en Engels kun je
 * meteen beginnen met woorden; hier moet je eerst kunnen lézen.
 */
export const curriculum: Topic[] = [
  { id: "el01", level: "A1", title: "Het alfabet en de klanken" },
  { id: "el02", level: "A1", title: "Lidwoorden: ο, η en το" },
  { id: "el03", level: "A1", title: "Naamvallen: onderwerp en lijdend voorwerp" },
  { id: "el04", level: "A1", title: "Zelfstandige naamwoorden en het meervoud" },
  { id: "el05", level: "A1", title: "Είμαι en έχω" },
  { id: "el06", level: "A1", title: "Werkwoorden op -ω in de tegenwoordige tijd" },
  { id: "el07", level: "A1", title: "Bijvoeglijke naamwoorden die meebuigen" },
  { id: "el08", level: "A1", title: "Persoonlijke voornaamwoorden weglaten" },
  { id: "el09", level: "A1", title: "Bezit: μου, σου en de genitief" },
  { id: "el10", level: "A1", title: "Vragen stellen: τι, πού, πώς, πότε" },
  { id: "el11", level: "A2", title: "Werkwoorden op -άω en -ώ" },
  { id: "el12", level: "A2", title: "Voorzetsels: σε, από, με, για" },
  { id: "el13", level: "A2", title: "Werkwoorden op -μαι" },
  { id: "el14", level: "A2", title: "Aoristos: regelmatige stammen" },
  { id: "el15", level: "A2", title: "Aoristos: onregelmatige stammen" },
  { id: "el16", level: "A2", title: "Paratatikos: de duur in het verleden" },
  { id: "el17", level: "A2", title: "Aoristos of paratatikos?" },
  { id: "el18", level: "A2", title: "Toekomst: θα met twee stammen" },
  { id: "el19", level: "A2", title: "Zwakke voornaamwoorden: μου, σου, τον, τη" },
  { id: "el20", level: "A2", title: "Gebiedende wijs" },
  { id: "el21", level: "B1", title: "De genitief in het dagelijks gebruik" },
  { id: "el22", level: "B1", title: "Voltooide tijden met έχω" },
  { id: "el23", level: "B1", title: "Να-zinnen in plaats van de infinitief" },
  { id: "el24", level: "B1", title: "Ontkennen: δεν of μην?" },
  { id: "el25", level: "B1", title: "Trappen van vergelijking" },
  { id: "el26", level: "B1", title: "Voorwaardelijke zinnen met αν" },
  { id: "el27", level: "B2", title: "Betrekkelijke bijzinnen: που en ο οποίος" },
  { id: "el28", level: "B2", title: "Κάποιος, όποιος, ό,τι en κανείς" },
  { id: "el29", level: "B2", title: "Deelwoorden op -οντας en -μένος" },
  { id: "el30", level: "B2", title: "De lijdende vorm en από" },
  { id: "el31", level: "B2", title: "Woordvolgorde en de plaats van het voornaamwoord" },
  { id: "el32", level: "B2", title: "Indirecte rede en tijdverschuiving" },
  { id: "el33", level: "B2", title: "Vaste voorzetsels bij werkwoorden" },
  { id: "el34", level: "B2", title: "Ενώ, αφού, μόλις en παρόλο που" },
  /* C1 — waar het niet meer om regels gaat maar om register en nuance. */
  { id: "el35", level: "C1", title: "Resten van de katharevousa" },
  { id: "el36", level: "C1", title: "Naamvallen in vaste uitdrukkingen" },
  { id: "el37", level: "C1", title: "Woordvorming: voor- en achtervoegsels" },
  { id: "el38", level: "C1", title: "Aspect: doorlopend of afgerond?" },
  { id: "el39", level: "C1", title: "Nadruk en woordvolgorde" },
  { id: "el40", level: "C1", title: "Verbindingswoorden voor betoog en tegenwerping" },
  { id: "el41", level: "C1", title: "Register: formeel, informeel en schrijftaal" },
  { id: "el42", level: "C1", title: "Idioom met κάνω, βάζω en παίρνω" },
];
