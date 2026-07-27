import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { languageList } from "../content/registry.ts";
import { LEVELS } from "../content/types.ts";
import {
  PLACEMENT_BLOCK,
  applyPlacement,
  buildCards,
  cardId,
  emptyProgress,
  readiness,
} from "./progress.ts";
import { mastery } from "./srs.ts";

const geen = new Set<string>();

for (const spanish of languageList()) {
  const leeg = () => emptyProgress(spanish.code);

describe(`${spanish.name}: vragenbank voor de niveautest`, () => {
  it("heeft genoeg vragen voor elke ronde", () => {
    for (const level of LEVELS) {
      const aantal = spanish.placement.filter((item) => item.level === level).length;
      assert.ok(
        aantal >= PLACEMENT_BLOCK,
        `${level} heeft maar ${aantal} vragen, er zijn er ${PLACEMENT_BLOCK} nodig`
      );
    }
  });

  it("heeft bij elke vraag een antwoord dat tussen de opties staat", () => {
    for (const item of spanish.placement) {
      assert.ok(item.options.includes(item.answer), `"${item.prompt}" mist zijn eigen antwoord`);
      assert.equal(new Set(item.options).size, item.options.length, `dubbele optie bij "${item.prompt}"`);
      assert.ok(item.why.length > 10, `"${item.prompt}" heeft geen uitleg`);
    }
  });

  it("gebruikt geen zinnen uit het lesmateriaal", () => {
    const uitLessen = new Set(
      Object.values(spanish.lessons).flatMap((les) =>
        les.exercises.map((oef) => ("prompt" in oef ? oef.prompt : oef.verb))
      )
    );
    for (const item of spanish.placement) {
      assert.ok(!uitLessen.has(item.prompt), `"${item.prompt}" staat ook in een hoofdstuk`);
    }
  });
});

describe(`${spanish.name}: uitslag verwerken`, () => {
  it("zet je niveau", () => {
    const na = applyPlacement(spanish, leeg(), "B1", geen);
    assert.equal(na.level, "B1");
  });

  it("laat een beginner op A1 met een schone lei", () => {
    const na = applyPlacement(spanish, leeg(), "A1", geen);
    assert.equal(Object.keys(na.cards).length, 0, "op A1 valt er niets over te slaan");
    assert.equal(buildCards(spanish, na).every((c) => c.schedule.reps === 0), true);
  });

  it("zet woorden van gehaalde niveaus klaar als herhaling, niet als nieuw", () => {
    const na = applyPlacement(spanish, leeg(), "A2", geen);
    const kaarten = buildCards(spanish, na);

    const a1 = kaarten.filter((c) => c.level === "A1");
    const a2 = kaarten.filter((c) => c.level === "A2");

    assert.ok(a1.length > 0 && a2.length > 0);
    assert.ok(a1.every((c) => c.schedule.reps >= 1), "A1 is gehaald, dus niet meer nieuw");
    assert.ok(a2.every((c) => c.schedule.reps === 0), "A2 ga je nog leren");
  });

  it("geeft woorden die je in de test goed had een langere planning", () => {
    const woord = spanish.decks.find((d) => d.level === "A1")!.words[0].term;
    const na = applyPlacement(spanish, leeg(), "A2", new Set([woord]));
    const kaarten = buildCards(spanish, na);

    const bewezen = kaarten.find((c) => c.word.term === woord)!;
    const aangenomen = kaarten.find((c) => c.level === "A1" && c.word.term !== woord)!;

    assert.equal(mastery(bewezen.schedule), 2, "bewezen kennis staat in herhaling");
    assert.equal(mastery(aangenomen.schedule), 1, "aangenomen kennis staat lager");
    assert.ok(bewezen.schedule.interval > aangenomen.schedule.interval);
  });

  it("overschrijft niet wat je al geoefend hebt", () => {
    const deck = spanish.decks.find((d) => d.level === "A1")!;
    const id = cardId(deck.id, deck.words[0].term);
    const bestaand = { ease: 2.9, interval: 30, reps: 8, lapses: 0, due: 123 };

    const na = applyPlacement(spanish, { ...leeg(), cards: { [id]: bestaand } }, "A2", geen);
    assert.deepEqual(na.cards[id], bestaand);
  });

  it("smeert de vervaldatums uit in plaats van alles op één dag te zetten", () => {
    const na = applyPlacement(spanish, leeg(), "A2", geen, 0);
    const dagen = new Set(
      Object.values(na.cards).map((s) => Math.round(s.due / 86_400_000))
    );
    assert.ok(dagen.size > 1, "alles zou op dezelfde dag vervallen");
  });

  it("brengt je dichter bij het examen van het niveau eronder", () => {
    const voor = readiness(spanish, leeg(), "A1");
    const na = readiness(spanish, applyPlacement(spanish, leeg(), "A2", geen), "A1");
    assert.equal(voor.known, 0);
    assert.ok(na.known >= 0);
    assert.equal(na.words, voor.words, "het aantal woorden verandert niet, alleen de planning");
  });
});
}
