import { ok, strictEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { LEVELS } from "../content/types.ts";
import { spreeksnelheid, TEMPO, TRAAGST } from "./tempo.ts";

describe("spreeksnelheid", () => {
  it("gaat omhoog naarmate je verder komt", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      const trager = spreeksnelheid(LEVELS[i - 1]);
      const sneller = spreeksnelheid(LEVELS[i]);
      ok(
        trager < sneller,
        `${LEVELS[i - 1]} (${trager}) hoort langzamer te zijn dan ${LEVELS[i]} (${sneller})`
      );
    }
  });

  it("laat een beginner merkbaar langzamer horen dan de oude vaste 0,9", () => {
    ok(spreeksnelheid("A1") < 0.9);
    ok(spreeksnelheid("A2") < 0.9);
  });

  it("praat op het hoogste niveau op normale snelheid", () => {
    strictEqual(spreeksnelheid("B2"), 1);
  });

  it("blijft overal binnen wat de spraaksynthese aankan", () => {
    for (const niveau of LEVELS) {
      for (const trager of [false, true]) {
        const snelheid = spreeksnelheid(niveau, trager);
        ok(snelheid >= TRAAGST, `${niveau} (trager=${trager}) is ${snelheid}, onder ${TRAAGST}`);
        ok(snelheid <= 1, `${niveau} (trager=${trager}) is ${snelheid}, boven 1`);
      }
    }
  });

  it("maakt 'langzamer' op elk niveau echt langzamer", () => {
    for (const niveau of LEVELS) {
      ok(spreeksnelheid(niveau, true) < spreeksnelheid(niveau));
    }
  });

  it("levert ronde getallen, geen 0,5499999999999999", () => {
    for (const niveau of LEVELS) {
      const snelheid = spreeksnelheid(niveau, true);
      strictEqual(Math.round(snelheid * 100) / 100, snelheid);
    }
  });

  it("kent elk niveau uit de leerlijn", () => {
    for (const niveau of LEVELS) ok(TEMPO[niveau] !== undefined, `${niveau} ontbreekt in TEMPO`);
  });
});
