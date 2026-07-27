"use client";

import { languageList } from "@/content/registry";
import { useStore } from "@/lib/store";
import { Tile } from "./tiles";
import { TekstKeuze } from "./tekstgrootte";

/**
 * Het allereerste scherm. Zolang er geen taal gekozen is heeft de rest van de
 * app geen betekenis — welke woorden, welke leerlijn, welke stem.
 */
export function Taalkeuze() {
  const { setLanguage } = useStore();
  const talen = languageList();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-10">
      <div className="flex items-center gap-2">
        <Tile level={3} size={26} />
        <span className="display text-xl tracking-tight">azulejo</span>
      </div>

      <h1 className="display mt-8 text-4xl sm:text-5xl">Welke taal wil je leren?</h1>
      <p className="mt-3 max-w-prose text-ink-soft">
        Je voortgang wordt per taal apart bijgehouden. Je kunt later altijd wisselen zonder iets
        kwijt te raken. Wie een andere taal leert dan jij, deelt niets met je: geen streak, geen
        cijfers, geen niveau.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {talen.map((pack) => (
          <button
            key={pack.code}
            onClick={() => setLanguage(pack.code)}
            className="panel flex items-center gap-4 p-5 text-left transition-colors hover:border-brand-mid hover:bg-brand-soft"
          >
            <span aria-hidden className="text-3xl">
              {pack.flag}
            </span>
            <span>
              <span className="display block text-2xl">{pack.name}</span>
              <span lang={pack.speechLang} className="block text-sm text-ink-soft">
                {pack.endonym}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10 border-t border-line pt-6">
        <TekstKeuze />
      </div>

      <p className="mt-8 text-xs text-ink-faint">
        Je voortgang hoort bij je profiel, niet bij dit apparaat. Op je telefoon ga je verder waar
        je op de tablet ophield.
      </p>
    </main>
  );
}

/** Wisselen van taal, klein en altijd bereikbaar in de kop. */
export function TaalWisselaar() {
  const { language, setLanguage } = useStore();
  const talen = languageList();
  if (talen.length < 2) return null;

  return (
    <label className="flex items-center">
      <span className="sr-only">Kies een taal</span>
      <select
        value={language ?? ""}
        onChange={(e) => setLanguage(e.target.value)}
        className="cursor-pointer rounded-md border border-line-strong bg-surface px-2 py-1 text-xs text-ink-soft"
      >
        {talen.map((pack) => (
          <option key={pack.code} value={pack.code}>
            {pack.flag} {pack.name}
          </option>
        ))}
      </select>
    </label>
  );
}
