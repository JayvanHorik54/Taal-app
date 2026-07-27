import { deepStrictEqual, strictEqual, throws } from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyProgress, type GradeEntry, type Progress } from "./progress.ts";
import { leesVoortgang, voegSamen } from "./samenvoegen.ts";
import type { Schedule } from "./srs.ts";

const planning = (deel: Partial<Schedule> = {}): Schedule => ({
  ease: 2.3,
  interval: 1,
  reps: 1,
  lapses: 0,
  due: 1_000,
  ...deel,
});

const cijfer = (id: string, deel: Partial<GradeEntry> = {}): GradeEntry => ({
  id,
  name: "Toets",
  kind: "toets",
  score: 8,
  total: 10,
  cijfer: 8.2,
  date: 1_000,
  ...deel,
});

const met = (deel: Partial<Progress>): Progress => ({ ...emptyProgress("es"), ...deel });

describe("voortgang samenvoegen", () => {
  it("houdt het hoogste niveau aan", () => {
    strictEqual(voegSamen(met({ level: "A2" }), met({ level: "B1" })).level, "B1");
    strictEqual(voegSamen(met({ level: "B1" }), met({ level: "A2" })).level, "B1");
  });

  it("telt antwoorden niet op, want dan telt elke synchronisatie dubbel", () => {
    strictEqual(voegSamen(met({ answers: 40 }), met({ answers: 25 })).answers, 40);
  });

  it("neemt van elk woord de planning met de meeste beurten erop", () => {
    const telefoon = met({ cards: { "deck::casa": planning({ reps: 4, interval: 12 }) } });
    const laptop = met({ cards: { "deck::casa": planning({ reps: 1, interval: 1 }) } });

    deepStrictEqual(voegSamen(telefoon, laptop).cards["deck::casa"].reps, 4);
    deepStrictEqual(voegSamen(laptop, telefoon).cards["deck::casa"].reps, 4);
  });

  it("telt een terugval mee als beurt, zodat opnieuw beginnen niet verliest", () => {
    // Op de laptop ging het woord onderuit: reps terug naar 0, maar lapses omhoog.
    const laptop = met({ cards: { "deck::casa": planning({ reps: 0, lapses: 2 }) } });
    const telefoon = met({ cards: { "deck::casa": planning({ reps: 1, lapses: 0 }) } });

    strictEqual(voegSamen(telefoon, laptop).cards["deck::casa"].lapses, 2);
  });

  it("houdt woorden die maar op één apparaat staan", () => {
    const a = met({ cards: { "deck::casa": planning() } });
    const b = met({ cards: { "deck::perro": planning() } });

    deepStrictEqual(Object.keys(voegSamen(a, b).cards).sort(), ["deck::casa", "deck::perro"]);
  });

  it("voegt cijferlijsten samen zonder dubbele regels", () => {
    const a = met({ grades: [cijfer("toets-1"), cijfer("toets-2", { date: 2_000 })] });
    const b = met({ grades: [cijfer("toets-2", { date: 2_000 }), cijfer("toets-3", { date: 3_000 })] });

    const uit = voegSamen(a, b).grades;
    deepStrictEqual(
      uit.map((g) => g.id),
      ["toets-3", "toets-2", "toets-1"]
    );
  });

  it("houdt de cijferlijst op veertig regels", () => {
    const veel = Array.from({ length: 30 }, (_, i) => cijfer(`a-${i}`, { date: i }));
    const nogmeer = Array.from({ length: 30 }, (_, i) => cijfer(`b-${i}`, { date: 100 + i }));

    strictEqual(voegSamen(met({ grades: veel }), met({ grades: nogmeer })).grades.length, 40);
  });

  it("laat een examencijfer nooit omlaag gaan", () => {
    const a = met({ exams: { A1: { cijfer: 8.4, date: 1_000 } } });
    const b = met({ exams: { A1: { cijfer: 6.1, date: 5_000 } } });

    strictEqual(voegSamen(a, b).exams.A1!.cijfer, 8.4);
    strictEqual(voegSamen(b, a).exams.A1!.cijfer, 8.4);
  });

  it("neemt een examen over dat de andere kant nog niet kende", () => {
    const uit = voegSamen(met({}), met({ exams: { A2: { cijfer: 7, date: 1 } } }));
    strictEqual(uit.exams.A2!.cijfer, 7);
  });

  it("houdt bij grammatica de beste poging aan", () => {
    const a = met({ grammar: { ser: { attempts: 3, best: 0.9 } } });
    const b = met({ grammar: { ser: { attempts: 5, best: 0.4 } } });

    deepStrictEqual(voegSamen(a, b).grammar.ser, { attempts: 5, best: 0.9, lesson: undefined });
  });

  it("houdt de laatste dag van de streak aan", () => {
    const oud = met({ streak: 9, lastDay: new Date(1_000_000_000_000).toDateString() });
    const nieuw = met({ streak: 2, lastDay: new Date(1_700_000_000_000).toDateString() });

    const uit = voegSamen(oud, nieuw);
    strictEqual(uit.lastDay, nieuw.lastDay);
    strictEqual(uit.streak, 9);
  });

  it("neemt eigen woordenlijsten van beide kanten mee", () => {
    const a = met({ customDecks: [{ id: "eigen-1", title: "Markt", level: "A1", words: [] }] });
    const b = met({ customDecks: [{ id: "eigen-2", title: "Dokter", level: "A2", words: [] }] });

    deepStrictEqual(
      voegSamen(a, b).customDecks.map((d) => d.id),
      ["eigen-1", "eigen-2"]
    );
  });

  it("weigert voortgang van twee verschillende talen", () => {
    throws(() => voegSamen(emptyProgress("es"), emptyProgress("en")), /niet samenvoegen/);
  });

  /* De twee eigenschappen waar de hele opzet op rust. */

  const telefoon = met({
    level: "A2",
    answers: 120,
    blitzBest: 31,
    streak: 4,
    lastDay: new Date(1_700_000_000_000).toDateString(),
    cards: { "deck::casa": planning({ reps: 5 }), "deck::gato": planning({ reps: 2 }) },
    grades: [cijfer("toets-1")],
    exams: { A1: { cijfer: 7.5, date: 10 } },
  });

  const laptop = met({
    level: "A1",
    answers: 90,
    blitzBest: 44,
    streak: 6,
    lastDay: new Date(1_600_000_000_000).toDateString(),
    cards: { "deck::casa": planning({ reps: 3 }), "deck::perro": planning({ reps: 8 }) },
    grades: [cijfer("toets-2", { date: 4_000 })],
    exams: { A1: { cijfer: 6.0, date: 20 }, A2: { cijfer: 6.5, date: 30 } },
  });

  it("is idempotent — nog eens samenvoegen verandert niets meer", () => {
    const eenmaal = voegSamen(telefoon, laptop);
    deepStrictEqual(voegSamen(telefoon, eenmaal), eenmaal);
    deepStrictEqual(voegSamen(eenmaal, laptop), eenmaal);
    deepStrictEqual(voegSamen(eenmaal, eenmaal), eenmaal);
  });

  it("geeft dezelfde uitkomst, welk apparaat ook eerst synchroniseert", () => {
    deepStrictEqual(voegSamen(telefoon, laptop), voegSamen(laptop, telefoon));
  });
});

describe("voortgang inlezen", () => {
  it("maakt van rommel een bruikbare lege voortgang", () => {
    deepStrictEqual(leesVoortgang(null, "es"), emptyProgress("es"));
    deepStrictEqual(leesVoortgang("kapot", "es"), emptyProgress("es"));
    deepStrictEqual(leesVoortgang(42, "es"), emptyProgress("es"));
  });

  it("vult velden aan die een oudere versie nog niet had", () => {
    const uit = leesVoortgang({ level: "B1", answers: 12 }, "en");
    strictEqual(uit.level, "B1");
    strictEqual(uit.answers, 12);
    strictEqual(uit.language, "en");
    deepStrictEqual(uit.cards, {});
    deepStrictEqual(uit.customDecks, []);
  });

  it("zet de taal recht, ook als er een andere in het blok staat", () => {
    strictEqual(leesVoortgang({ language: "es" }, "en").language, "en");
  });
});
