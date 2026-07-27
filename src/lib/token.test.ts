import { ok, strictEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { leesToken, maakToken } from "./token.ts";
import { geldigePin, hashPin, pinKlopt } from "./pincode.ts";

/**
 * Het sessiekoekje is het enige bewijs van wie je bent. Als een token te
 * vervalsen is, is elk profiel open — dus juist de mislukgevallen staan hier.
 */
describe("sessietokens", () => {
  it("leest terug wie erin zit", () => {
    strictEqual(leesToken(maakToken("profiel-7"))?.profielId, "profiel-7");
  });

  it("weigert rommel", () => {
    strictEqual(leesToken(undefined), null);
    strictEqual(leesToken(""), null);
    strictEqual(leesToken("zomaar-wat"), null);
    strictEqual(leesToken("geen.punten.maar.wel.veel"), null);
  });

  it("weigert een token waarvan de inhoud is aangepast", () => {
    const echt = maakToken("profiel-7");
    const [, handtekening] = echt.split(".");

    // Iemand die zich voor een ander uitgeeft maar de handtekening laat staan.
    const vervalst =
      Buffer.from(JSON.stringify({ p: "profiel-8", v: Date.now() + 10_000 })).toString(
        "base64url"
      ) + `.${handtekening}`;

    strictEqual(leesToken(vervalst), null);
  });

  it("weigert een token zonder handtekening", () => {
    const lading = Buffer.from(
      JSON.stringify({ p: "profiel-7", v: Date.now() + 10_000 })
    ).toString("base64url");

    strictEqual(leesToken(lading), null);
    strictEqual(leesToken(`${lading}.`), null);
  });

  it("weigert een verlopen token", () => {
    // Negentig dagen en één seconde geleden uitgegeven.
    const oud = maakToken("profiel-7", Date.now() - 90 * 24 * 60 * 60 * 1000 - 1_000);
    strictEqual(leesToken(oud), null);
  });

  it("laat een token dat bijna verloopt nog toe", () => {
    const bijna = maakToken("profiel-7", Date.now() - 89 * 24 * 60 * 60 * 1000);
    strictEqual(leesToken(bijna)?.profielId, "profiel-7");
  });
});

describe("pincodes", () => {
  it("neemt vier tot acht cijfers aan", () => {
    ok(geldigePin("1234"));
    ok(geldigePin("12345678"));
  });

  it("weigert te kort, te lang en alles wat geen cijfer is", () => {
    strictEqual(geldigePin("123"), false);
    strictEqual(geldigePin("123456789"), false);
    strictEqual(geldigePin("12a4"), false);
    strictEqual(geldigePin(""), false);
    strictEqual(geldigePin(" 1234 "), false);
  });

  it("herkent de eigen pincode terug", async () => {
    const hash = await hashPin("4321");
    ok(await pinKlopt("4321", hash));
  });

  it("wijst een andere pincode af", async () => {
    const hash = await hashPin("4321");
    strictEqual(await pinKlopt("1234", hash), false);
    strictEqual(await pinKlopt("", hash), false);
  });

  it("geeft twee keer dezelfde pincode een andere hash", async () => {
    // Anders zie je in de database wie dezelfde code heeft gekozen.
    const eerste = await hashPin("1111");
    const tweede = await hashPin("1111");
    ok(eerste !== tweede);
    ok(await pinKlopt("1111", eerste));
    ok(await pinKlopt("1111", tweede));
  });

  it("valt niet om over een beschadigde hash", async () => {
    strictEqual(await pinKlopt("1234", "onzin"), false);
    strictEqual(await pinKlopt("1234", "scrypt$abc"), false);
    strictEqual(await pinKlopt("1234", "bcrypt$aa$bb"), false);
    strictEqual(await pinKlopt("1234", "scrypt$aa$bb"), false);
  });
});
