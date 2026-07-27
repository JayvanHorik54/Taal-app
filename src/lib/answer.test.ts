import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { judge, normalize, variants } from "./answer.ts";

const ARTICLES = ["el", "la", "los", "las", "un", "una"];
const correct = (given: string, expected: string) =>
  judge(given, expected, ARTICLES).correct;

describe("normalize", () => {
  it("laat leestekens vallen maar houdt accenten", () => {
    assert.equal(normalize("¿Qué tal?"), "qué tal");
  });

  // Dit is waar het oude prototype op stukliep: /[^a-z0-9 ]/ maakte van elk
  // niet-Latijns antwoord een lege string.
  it("houdt Cyrillisch en Grieks heel", () => {
    assert.equal(normalize("Привет, мир!"), "привет мир");
    assert.equal(normalize("Καλημέρα κόσμε."), "καλημέρα κόσμε");
  });
});

describe("variants", () => {
  it("splitst meerdere betekenissen", () => {
    assert.deepEqual(variants("de kaart, de plattegrond"), ["de kaart", "de plattegrond"]);
    assert.deepEqual(variants("wonen, leven"), ["wonen", "leven"]);
  });

  it("laat een hele zin heel", () => {
    assert.deepEqual(variants("Mientras trabajaba, llamó."), ["Mientras trabajaba, llamó."]);
    assert.deepEqual(variants("¿De dónde eres?"), ["¿De dónde eres?"]);
  });
});

describe("judge", () => {
  it("keurt exact goed", () => {
    assert.ok(correct("hola", "hola"));
    assert.ok(correct("Hola!", "hola"));
    assert.ok(correct("  hola ", "hola"));
  });

  it("keurt fout wat fout is", () => {
    assert.ok(!correct("hallo", "hola"));
    assert.ok(!correct("", "hola"));
  });

  it("rekent een vergeten accent goed, maar zegt het erbij", () => {
    const verdict = judge("adios", "adiós", ARTICLES);
    assert.ok(verdict.correct);
    assert.match(verdict.note ?? "", /adiós/);
  });

  it("rekent een vergeten lidwoord goed, maar zegt het erbij", () => {
    const verdict = judge("cafe", "el café", ARTICLES);
    assert.ok(verdict.correct);
    assert.match(verdict.note ?? "", /lidwoord/);
  });

  it("accepteert elke opgegeven betekenis", () => {
    assert.ok(correct("de kaart", "de kaart, de plattegrond"));
    assert.ok(correct("de plattegrond", "de kaart, de plattegrond"));
  });

  // Hier ging het mis: een zin met een komma werd opgeknipt tot losse
  // brokstukken, waardoor het volledige juiste antwoord werd afgekeurd.
  it("keurt een hele zin met een komma erin goed", () => {
    assert.ok(correct("Mientras trabajaba, llamó.", "Mientras trabajaba, llamó."));
    assert.ok(correct("mientras trabajaba llamó", "Mientras trabajaba, llamó."));
    assert.ok(!correct("Mientras trabajaba", "Mientras trabajaba, llamó."));
  });

  it("werkt in andere schriften", () => {
    assert.ok(correct("привет", "привет"));
    assert.ok(correct("Привет!", "привет"));
    assert.ok(!correct("пока", "привет"));
    assert.ok(correct("καλημέρα", "καλημέρα"));
    assert.ok(!correct("γεια", "καλημέρα"));
  });
});
