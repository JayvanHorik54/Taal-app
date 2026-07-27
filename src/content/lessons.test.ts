import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { judge } from "../lib/answer.ts";
import { languageList } from "./registry.ts";

/**
 * De hoofdstukken zijn met de hand geschreven. Deze test bewaakt de vorm:
 * of elk hoofdstuk compleet is, of elk antwoord bij zijn eigen vraag past,
 * en of de vervoegingsrijtjes evenveel vormen hebben als er personen zijn.
 * Inhoudelijk Spaans kan een test niet controleren — vorm wel.
 */

for (const pack of languageList()) {
  const { lessons, curriculum, pronouns } = pack;
  const geschreven = Object.entries(lessons);

describe(`${pack.name}: dekking van de leerlijn`, () => {
  it("heeft minstens A1 volledig uitgeschreven", () => {
    for (const topic of curriculum.filter((t) => t.level === "A1")) {
      assert.ok(lessons[topic.id], `${topic.id} (${topic.title}) ontbreekt nog`);
    }
  });

  it("schrijft geen hoofdstuk dat niet in de leerlijn staat", () => {
    const bekend = new Set(curriculum.map((t) => t.id));
    for (const [id] of geschreven) {
      assert.ok(bekend.has(id), `${id} hoort bij geen enkel hoofdstuk`);
    }
  });
});

describe(`${pack.name}: elk hoofdstuk is compleet`, () => {
  for (const [id, les] of geschreven) {
    it(`${id} heeft alles wat het scherm toont`, () => {
      assert.ok(les.core.length > 20, "de kernzin is te kort of ontbreekt");
      assert.ok(les.intro.length >= 2, "minstens twee alinea's uitleg");
      assert.ok(les.intro.every((p) => p.length > 40), "een alinea is verdacht kort");
      assert.ok(les.rules.length >= 2, "minstens twee losse regels");
      assert.ok(les.examples.length >= 3, "minstens drie voorbeelden");
      assert.ok(les.pitfall && les.pitfall.length > 40, "de valkuil ontbreekt");
      assert.equal(les.exercises.length, 6, "elk hoofdstuk heeft zes oefeningen");
    });

    it(`${id} heeft een kloppende tabel`, () => {
      if (!les.table) return;
      assert.ok(les.table.title.length > 0);
      assert.ok(les.table.rows.length >= 2);
      for (const rij of les.table.rows) {
        assert.equal(rij.length, 2, "een tabelrij heeft precies twee kolommen");
        assert.ok(rij[0].length > 0 && rij[1].length > 0, "lege cel in de tabel");
      }
    });

    it(`${id} heeft oefeningen die zichzelf goedkeuren`, () => {
      for (const oef of les.exercises) {
        assert.ok(oef.why.length > 10, `uitleg ontbreekt bij een oefening in ${id}`);

        if (oef.type === "conjugate") {
          assert.equal(
            oef.answers.length,
            pronouns.length,
            `${oef.verb} heeft ${oef.answers.length} vormen, er zijn er ${pronouns.length} nodig`
          );
          for (const vorm of oef.answers) {
            assert.ok(vorm.trim().length > 0, `lege vorm bij ${oef.verb}`);
            assert.ok(judge(vorm, vorm).correct, `${vorm} keurt zichzelf af`);
          }
          continue;
        }

        assert.ok(oef.prompt.trim().length > 0, "lege vraag");
        assert.ok(oef.answer.trim().length > 0, `leeg antwoord bij "${oef.prompt}"`);
        assert.ok(judge(oef.answer, oef.answer).correct, `"${oef.answer}" keurt zichzelf af`);

        if (oef.type === "choice") {
          assert.ok(
            oef.options.includes(oef.answer),
            `"${oef.prompt}" heeft een antwoord dat niet tussen de opties staat`
          );
          assert.equal(
            new Set(oef.options).size,
            oef.options.length,
            `"${oef.prompt}" heeft een dubbele optie`
          );
          assert.ok(oef.options.length >= 2, "een keuzevraag heeft minstens twee opties");
        }
      }
    });
  }
});

describe(`${pack.name}: geen dubbele vragen`, () => {
  it("stelt elke oefenvraag maar één keer in de hele leerlijn", () => {
    const gezien = new Map<string, string>();
    for (const [id, les] of geschreven) {
      for (const oef of les.exercises) {
        const sleutel = oef.type === "conjugate" ? `${oef.verb} ${oef.tense}` : oef.prompt;
        const eerder = gezien.get(sleutel);
        assert.equal(eerder, undefined, `"${sleutel}" staat in zowel ${eerder} als ${id}`);
        gezien.set(sleutel, id);
      }
    }
  });
});
}
