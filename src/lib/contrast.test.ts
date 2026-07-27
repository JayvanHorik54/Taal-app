import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/**
 * Leest de echte kleuren uit globals.css en rekent na of ze WCAG AA halen.
 * Zo kan een "even een tintje lichter" niet ongemerkt de leesbaarheid slopen.
 */

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function palette(scope: "licht" | "donker"): Record<string, string> {
  // Het donkere thema staat in het prefers-color-scheme-blok, het lichte ervoor.
  const donkerStart = css.indexOf("@media (prefers-color-scheme: dark)");
  const bron = scope === "licht" ? css.slice(0, donkerStart) : css.slice(donkerStart);
  const kleuren: Record<string, string> = {};
  for (const [, naam, waarde] of bron.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6});/gi)) {
    kleuren[naam] = waarde;
  }
  return kleuren;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const ACHTERGRONDEN = ["shell", "surface", "surface-2"];
const TEKSTKLEUREN = ["ink", "ink-soft", "ink-faint", "brand", "accent", "ok", "bad"];
const AA = 4.5;

for (const scope of ["licht", "donker"] as const) {
  describe(`kleurcontrast — ${scope}`, () => {
    const kleuren = palette(scope);

    it("kent alle tokens", () => {
      for (const naam of [...ACHTERGRONDEN, ...TEKSTKLEUREN]) {
        assert.ok(kleuren[naam], `--${naam} ontbreekt in ${scope}`);
      }
    });

    for (const tekst of TEKSTKLEUREN) {
      it(`--${tekst} is leesbaar op elke achtergrond`, () => {
        for (const bg of ACHTERGRONDEN) {
          const ratio = contrast(kleuren[tekst], kleuren[bg]);
          assert.ok(
            ratio >= AA,
            `--${tekst} op --${bg} haalt maar ${ratio.toFixed(2)}:1 (nodig: ${AA}:1)`
          );
        }
      });
    }

    // De gekleurde vlakken: badges, tips en de goed/fout-terugkoppeling.
    for (const naam of ["brand", "accent", "ok", "bad"]) {
      it(`--${naam} is leesbaar op --${naam}-soft`, () => {
        const ratio = contrast(kleuren[naam], kleuren[`${naam}-soft`]);
        assert.ok(
          ratio >= AA,
          `--${naam} op --${naam}-soft haalt maar ${ratio.toFixed(2)}:1 (nodig: ${AA}:1)`
        );
      });
    }

    // Witte tekst op de primaire knop.
    it("--on-brand is leesbaar op --brand", () => {
      const ratio = contrast(kleuren["on-brand"], kleuren.brand);
      assert.ok(ratio >= AA, `knoptekst haalt maar ${ratio.toFixed(2)}:1`);
    });
  });
}
