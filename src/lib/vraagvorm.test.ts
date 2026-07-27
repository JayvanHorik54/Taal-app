import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import type { StudyCard } from "./progress.ts";
import type { Word } from "../content/types.ts";
import {
  BOUW_MAX,
  BOUW_MIN,
  blankOut,
  bouwbaar,
  pickKind,
  vormenVoor,
  type VocabKind,
} from "./vraagvorm.ts";

const kaart = (reps: number, word: Partial<Word> = {}): StudyCard => ({
  id: "deck::casa",
  deckId: "deck",
  deckTitle: "Thuis",
  level: "A1",
  word: {
    term: "la casa",
    translation: "het huis",
    exampleTarget: "La casa es muy grande.",
    exampleNative: "Het huis is heel groot.",
    ...word,
  },
  schedule: { ease: 2.3, interval: 1, reps, lapses: 0, due: 0 },
});

describe("het woord uit de zin halen", () => {
  it("maakt een gat op de plek van het woord", () => {
    strictEqual(blankOut("La casa es grande.", "la casa"), "La _____ es grande.");
  });

  it("kijkt niet naar hoofdletters", () => {
    strictEqual(blankOut("Casa bonita.", "la casa"), "_____ bonita.");
  });

  it("geeft null als het woord er niet in staat", () => {
    strictEqual(blankOut("El perro corre.", "la casa"), null);
  });

  it("pakt geen woord dat er toevallig in zit", () => {
    // "casa" zit in "casarse", maar dat is een ander woord.
    strictEqual(blankOut("Quiero casarme pronto.", "la casa"), null);
  });
});

describe("is een zin te bouwen", () => {
  it("neemt zinnen van drie tot tien woorden", () => {
    ok(bouwbaar("La casa es grande."));
    ok(bouwbaar(Array(BOUW_MIN).fill("woord").join(" ")));
    ok(bouwbaar(Array(BOUW_MAX).fill("woord").join(" ")));
  });

  it("weigert wat te kort of te lang is", () => {
    strictEqual(bouwbaar(Array(BOUW_MIN - 1).fill("woord").join(" ")), false);
    strictEqual(bouwbaar(Array(BOUW_MAX + 1).fill("woord").join(" ")), false);
  });

  it("valt niet om over ontbrekende of lege zinnen", () => {
    strictEqual(bouwbaar(undefined), false);
    strictEqual(bouwbaar(""), false);
    strictEqual(bouwbaar("   "), false);
  });
});

describe("welke vormen komen in aanmerking", () => {
  it("geeft een beginner alleen de vormen die hij aankan", () => {
    const vormen = vormenVoor(kaart(0));
    ok(vormen.includes("recognize"));
    ok(vormen.includes("produce-choice"));
    ok(!vormen.includes("speak"), "hardop zeggen hoort niet bij een nieuw woord");
    ok(!vormen.includes("cloze"));
    ok(!vormen.includes("build"));
  });

  it("doet er zinsvormen bij zodra je het woord kent", () => {
    const vormen = vormenVoor(kaart(2));
    ok(vormen.includes("cloze"));
    ok(vormen.includes("build"));
    ok(vormen.includes("listen"));
  });

  it("vraagt pas om uitspreken als je het woord echt kent", () => {
    strictEqual(vormenVoor(kaart(2)).includes("speak"), false);
    ok(vormenVoor(kaart(3)).includes("speak"));
  });

  it("laat zinsvormen weg als er geen bruikbare voorbeeldzin is", () => {
    const zonder = vormenVoor(kaart(3, { exampleTarget: undefined, exampleNative: undefined }));
    ok(!zonder.includes("cloze"));
    ok(!zonder.includes("build"));
    // Er moet wél iets overblijven, anders krijg je geen vraag.
    ok(zonder.length >= 3);
  });

  it("laat bouwen weg als de zin het woord niet bevat maar wel bouwbaar is", () => {
    const anders = vormenVoor(kaart(2, { exampleTarget: "El perro corre mucho." }));
    ok(!anders.includes("cloze"), "zonder het woord valt er niets in te vullen");
    ok(anders.includes("build"), "de zin zelf is nog steeds te bouwen");
  });

  it("laat bouwen weg bij een zin zonder vertaling", () => {
    ok(!vormenVoor(kaart(2, { exampleNative: undefined })).includes("build"));
  });

  it("geeft altijd minstens één vorm, hoe kaal het woord ook is", () => {
    const kaal = kaart(0, { exampleTarget: undefined, exampleNative: undefined });
    ok(vormenVoor(kaal).length > 0);
  });
});

describe("een vorm kiezen", () => {
  it("kiest altijd iets wat in aanmerking komt", () => {
    for (const reps of [0, 1, 2, 3, 8]) {
      const card = kaart(reps);
      const mogelijk = vormenVoor(card);
      for (let poging = 0; poging < 60; poging++) {
        ok(mogelijk.includes(pickKind(card)));
      }
    }
  });

  it("geeft nooit twee keer achter elkaar dezelfde vorm", () => {
    const card = kaart(3);
    let vorige: VocabKind | undefined;
    for (let poging = 0; poging < 300; poging++) {
      const kind = pickKind(card, vorige);
      ok(kind !== vorige, `${kind} kwam twee keer achter elkaar`);
      vorige = kind;
    }
  });

  it("geeft toch een vorm als die ene mogelijkheid net geweest is", () => {
    // Een kaal woord op reps 0 heeft een korte lijst; ook dan moet er iets komen.
    const kaal = kaart(0, { exampleTarget: undefined, exampleNative: undefined });
    const enige = vormenVoor(kaal);
    const kind = pickKind(kaal, enige[0]);
    ok(enige.includes(kind));
  });

  it("komt op den duur bij elke mogelijke vorm uit", () => {
    const card = kaart(3);
    const gezien = new Set<VocabKind>();
    let vorige: VocabKind | undefined;
    for (let poging = 0; poging < 800; poging++) {
      vorige = pickKind(card, vorige);
      gezien.add(vorige);
    }
    deepStrictEqual([...gezien].sort(), [...vormenVoor(card)].sort());
  });
});
