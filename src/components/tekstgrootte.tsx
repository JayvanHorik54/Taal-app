"use client";

import { MATEN, useTekstgrootte } from "@/lib/weergave";

/**
 * Compacte knop in de kop: één tik maakt de tekst een stap groter, en na de
 * grootste stap ben je weer terug bij normaal. Eén doel om aan te tikken is
 * makkelijker dan een menu — zeker als lezen net het probleem is.
 */
export function TekstKnop() {
  const { maat, volgende } = useTekstgrootte();
  const huidig = MATEN.find((m) => m.code === maat) ?? MATEN[0];
  const index = MATEN.indexOf(huidig);

  return (
    <button
      type="button"
      onClick={volgende}
      title="Tekstgrootte"
      aria-label={`Tekstgrootte: ${huidig.label}. Klik om te vergroten.`}
      className="flex shrink-0 items-baseline gap-0.5 rounded-md border border-line-strong bg-surface px-2 py-1 text-ink-soft transition-colors hover:border-brand-mid hover:text-ink"
    >
      <span aria-hidden className="text-[0.7em] leading-none font-semibold">
        A
      </span>
      <span aria-hidden className="text-[1em] leading-none font-semibold">
        A
      </span>
      <span aria-hidden className="ml-0.5 text-[0.6em] leading-none tabular-nums">
        {index + 1}/{MATEN.length}
      </span>
    </button>
  );
}

/**
 * Uitgebreide keuze met een echte voorbeeldregel. Staat op het allereerste
 * scherm, zodat je hem tegenkomt vóórdat je iets hoeft te lezen dat te klein is.
 */
export function TekstKeuze() {
  const { maat, zetMaat } = useTekstgrootte();

  return (
    <section aria-labelledby="tekstgrootte-kop">
      <h2 id="tekstgrootte-kop" className="eyebrow">
        tekstgrootte
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Lees je liever wat groter? Zet het hier, en alles in de app wordt groter. Je kunt het
        later altijd bijstellen met de knop rechtsboven.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {MATEN.map((optie) => (
          <button
            key={optie.code}
            className="chip"
            data-on={maat === optie.code}
            aria-pressed={maat === optie.code}
            onClick={() => zetMaat(optie.code)}
          >
            {optie.label}
          </button>
        ))}
      </div>
    </section>
  );
}
