import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { db, zetVerbindingVoorTest, type SqlUitvoerder } from "./db.ts";
import {
  alleProfielen,
  bewaarVoortgang,
  haalVoortgang,
  maakProfiel,
  meldAanMetPin,
  profielOpId,
  wisVoortgang,
} from "./profielen.ts";
import { emptyProgress, type Progress } from "./progress.ts";

/**
 * Deze tests draaien tegen PGlite: een echte Postgres in dit proces. Dat is
 * expres — het schema, de `on conflict`-clausules en het teruglezen van een
 * bigint zijn precies de dingen die je in TypeScript niet ziet en pas in
 * productie merkt.
 */

let pg: PGlite;

before(async () => {
  pg = new PGlite();
  const uitvoerder: SqlUitvoerder = async (strings, ...waarden) => {
    const query = strings.reduce(
      (uit, deel, i) => uit + deel + (i < waarden.length ? `$${i + 1}` : ""),
      ""
    );
    const { rows } = await pg.query(query, waarden as unknown[]);
    return rows as never[];
  };
  zetVerbindingVoorTest(uitvoerder);
});

after(async () => {
  zetVerbindingVoorTest(null);
  await pg.close();
});

beforeEach(async () => {
  // Elke test begint schoon, maar het schema mag zichzelf opnieuw opbouwen.
  await pg.exec("drop table if exists voortgang; drop table if exists profielen;");
  zetVerbindingVoorTest(await Promise.resolve(db()));
});

const metVoortgang = (deel: Partial<Progress>): Progress => ({
  ...emptyProgress("es"),
  ...deel,
});

describe("profielen aanmaken", () => {
  it("maakt een profiel en geeft het terug", async () => {
    const uit = await maakProfiel("Jay", "1234");
    ok(uit.ok);
    strictEqual(uit.profiel.naam, "Jay");
    ok(uit.profiel.id.length > 10);
  });

  it("zet het schema zelf klaar bij de eerste aanroep", async () => {
    // Geen expliciete migratie gedraaid; dit moet gewoon werken.
    deepStrictEqual(await alleProfielen(), []);
  });

  it("weigert een naam die al bezet is, ook met andere hoofdletters", async () => {
    ok((await maakProfiel("Els", "1111")).ok);

    const tweede = await maakProfiel("  els  ", "2222");
    strictEqual(tweede.ok, false);
    if (!tweede.ok) strictEqual(tweede.reden, "bezet");
  });

  it("geeft de profielen terug in de volgorde waarin ze gemaakt zijn", async () => {
    await maakProfiel("Jay", "1111");
    await maakProfiel("Els", "2222");
    await maakProfiel("Fleur", "3333");

    deepStrictEqual(
      (await alleProfielen()).map((p) => p.naam),
      ["Jay", "Els", "Fleur"]
    );
  });

  it("vindt een profiel op id, en niets op een onbekend id", async () => {
    const gemaakt = await maakProfiel("Jay", "1234");
    ok(gemaakt.ok);

    strictEqual((await profielOpId(gemaakt.profiel.id))?.naam, "Jay");
    strictEqual(await profielOpId("bestaat-niet"), null);
  });
});

describe("aanmelden met een pincode", () => {
  beforeEach(async () => {
    await maakProfiel("Els", "4321");
  });

  it("laat je binnen met de juiste pincode", async () => {
    const uit = await meldAanMetPin("Els", "4321");
    ok(uit.ok);
    strictEqual(uit.profiel.naam, "Els");
  });

  it("kijkt niet naar hoofdletters in de naam", async () => {
    ok((await meldAanMetPin("ELS", "4321")).ok);
  });

  it("weigert een verkeerde pincode", async () => {
    const uit = await meldAanMetPin("Els", "0000");
    strictEqual(uit.ok, false);
    if (!uit.ok) strictEqual(uit.reden, "mis");
  });

  it("weigert een onbekende naam", async () => {
    const uit = await meldAanMetPin("Niemand", "4321");
    strictEqual(uit.ok, false);
    if (!uit.ok) strictEqual(uit.reden, "onbekend");
  });

  it("zet het profiel op slot na vijf misgrepen", async () => {
    for (let poging = 0; poging < 4; poging++) {
      const tussentijds = await meldAanMetPin("Els", "0000");
      strictEqual(tussentijds.ok, false);
      if (!tussentijds.ok) strictEqual(tussentijds.reden, "mis");
    }

    const vijfde = await meldAanMetPin("Els", "0000");
    strictEqual(vijfde.ok, false);
    if (!vijfde.ok) strictEqual(vijfde.reden, "geblokkeerd");

    // Ook de júiste pincode komt er tijdens de blokkade niet meer door.
    const metGoedePin = await meldAanMetPin("Els", "4321");
    strictEqual(metGoedePin.ok, false);
    if (!metGoedePin.ok) strictEqual(metGoedePin.reden, "geblokkeerd");
  });

  it("wist de teller zodra je er wel in komt", async () => {
    await meldAanMetPin("Els", "0000");
    await meldAanMetPin("Els", "0000");
    ok((await meldAanMetPin("Els", "4321")).ok);

    // Weer vier misgrepen mogen nu geen blokkade opleveren.
    for (let poging = 0; poging < 4; poging++) await meldAanMetPin("Els", "0000");
    const vijfde = await meldAanMetPin("Els", "4321");
    ok(vijfde.ok);
  });

  it("laat je weer toe zodra de blokkade verlopen is", async () => {
    for (let poging = 0; poging < 5; poging++) await meldAanMetPin("Els", "0000");

    // De blokkade een uur terugzetten, alsof het kwartier voorbij is.
    await pg.query("update profielen set geblokkeerd_tot = $1", [Date.now() - 3_600_000]);

    ok((await meldAanMetPin("Els", "4321")).ok);
  });
});

describe("voortgang bewaren", () => {
  let profielId: string;

  beforeEach(async () => {
    const gemaakt = await maakProfiel("Jay", "1234");
    ok(gemaakt.ok);
    profielId = gemaakt.profiel.id;
  });

  it("geeft een lege voortgang terug voor wie nog niets deed", async () => {
    deepStrictEqual(await haalVoortgang(profielId, "es"), emptyProgress("es"));
  });

  it("bewaart en leest terug", async () => {
    await bewaarVoortgang(profielId, "es", metVoortgang({ answers: 12, level: "A2" }));

    const terug = await haalVoortgang(profielId, "es");
    strictEqual(terug.answers, 12);
    strictEqual(terug.level, "A2");
  });

  it("voegt samen in plaats van te overschrijven", async () => {
    await bewaarVoortgang(
      profielId,
      "es",
      metVoortgang({ answers: 40, cards: { "d::casa": planning(5) } })
    );

    // Een tweede apparaat dat achterliep en minder wist.
    const samen = await bewaarVoortgang(
      profielId,
      "es",
      metVoortgang({ answers: 10, cards: { "d::perro": planning(2) } })
    );

    strictEqual(samen.answers, 40);
    deepStrictEqual(Object.keys(samen.cards).sort(), ["d::casa", "d::perro"]);
    // En wat teruggelezen wordt is hetzelfde als wat er terugkwam.
    deepStrictEqual(await haalVoortgang(profielId, "es"), samen);
  });

  it("houdt talen uit elkaar", async () => {
    await bewaarVoortgang(profielId, "es", metVoortgang({ answers: 30 }));
    await bewaarVoortgang(profielId, "en", { ...emptyProgress("en"), answers: 7 });

    strictEqual((await haalVoortgang(profielId, "es")).answers, 30);
    strictEqual((await haalVoortgang(profielId, "en")).answers, 7);
  });

  it("houdt profielen uit elkaar", async () => {
    const ander = await maakProfiel("Els", "9999");
    ok(ander.ok);

    await bewaarVoortgang(profielId, "es", metVoortgang({ answers: 30 }));
    strictEqual((await haalVoortgang(ander.profiel.id, "es")).answers, 0);
  });

  it("wist alleen de taal die je wist", async () => {
    await bewaarVoortgang(profielId, "es", metVoortgang({ answers: 30 }));
    await bewaarVoortgang(profielId, "en", { ...emptyProgress("en"), answers: 7 });

    await wisVoortgang(profielId, "es");

    strictEqual((await haalVoortgang(profielId, "es")).answers, 0);
    strictEqual((await haalVoortgang(profielId, "en")).answers, 7);
  });

  it("laat wissen echt wissen, ook na een nieuwe opslag", async () => {
    await bewaarVoortgang(profielId, "es", metVoortgang({ answers: 30 }));
    await wisVoortgang(profielId, "es");
    const na = await bewaarVoortgang(profielId, "es", metVoortgang({ answers: 2 }));

    strictEqual(na.answers, 2);
  });
});

function planning(reps: number) {
  return { ease: 2.3, interval: reps, reps, lapses: 0, due: 1_000 };
}
