"use client";

import Link from "next/link";
import { useState } from "react";
import { Loading, OpnieuwAanmelden, Page } from "@/components/chrome";
import { SpeakButton } from "@/components/exercises";
import { Tile } from "@/components/tiles";
import { LEVELS, type Deck, type Level, type Word } from "@/content/types";
import { allDecks, cardId } from "@/lib/progress";
import { mastery } from "@/lib/srs";
import { useVoice } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { ToegangGeweigerd, aiFetch } from "@/lib/toegang";

export default function WoordenPage() {
  const { ready, pack, progress, update } = useStore();
  const speak = useVoice(pack.speechLang);

  const [open, setOpen] = useState<string | null>(null);
  const [covered, setCovered] = useState(false);
  const [theme, setTheme] = useState(pack.themes[0]);
  const [level, setLevel] = useState<Level>("A1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return <Loading />;

  const decks = allDecks(pack, progress);

  const generate = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await aiFetch<{ words?: Word[] }>("/api/woorden", {
        language: pack.code,
        theme,
        level,
        known: decks.flatMap((deck) => deck.words.map((word) => word.term)),
      });
      if (!data.words?.length) {
        setError("Alleen woorden die je al hebt. Kies een ander thema of niveau.");
        return;
      }
      const deck = makeDeck(pack.code, theme, level, data.words, progress.customDecks);
      update((current) => ({ ...current, customDecks: [...current.customDecks, deck] }));
      setOpen(deck.id);
    } catch (fout) {
      setError(
        fout instanceof ToegangGeweigerd
          ? "aanmelden"
          : fout instanceof Error
            ? fout.message
            : "Genereren mislukt."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <p className="eyebrow">woordenschat</p>
      <h1 className="display mt-2 text-4xl">Lijsten</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-soft">
        Open een lijst om hem door te lezen, dek de vertalingen af om jezelf te overhoren, of laat
        er een nieuwe lijst bij maken op een thema dat jij nodig hebt.
      </p>

      <ul className="mt-6 space-y-2">
        {decks.map((deck) => {
          const isOpen = open === deck.id;
          const known = deck.words.filter(
            (word) => mastery(progress.cards[cardId(deck.id, word.term)]) >= 2
          ).length;
          const percent = deck.words.length ? Math.round((known / deck.words.length) * 100) : 0;

          return (
            <li key={deck.id} className="panel overflow-hidden">
              <button
                className="flex w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors hover:bg-surface-2"
                onClick={() => setOpen(isOpen ? null : deck.id)}
                aria-expanded={isOpen}
              >
                {/* Titel op zijn eigen regel, meta eronder. Zo blijft het leesbaar
                    wanneer de tekstgrootte omhoog gaat. */}
                <span className="flex items-baseline gap-2">
                  <span className="shrink-0 text-xs font-semibold text-brand">{deck.level}</span>
                  <span className="min-w-0 flex-1 text-[15px] font-medium">{deck.title}</span>
                  {deck.generated && (
                    <span className="shrink-0 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap text-accent uppercase">
                      zelf gemaakt
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3 text-xs text-ink-faint">
                  <span className="shrink-0">
                    {known} van de {deck.words.length} beheerst
                  </span>
                  <span className="h-1.5 min-w-8 flex-1 overflow-hidden rounded-full bg-line">
                    <i
                      className="block h-full rounded-full bg-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-line px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3 text-xs text-ink-faint">
                    <span>{deck.words.length} woorden</span>
                    <button
                      className="btn btn-ghost px-2.5 py-1 text-xs"
                      onClick={() => setCovered(!covered)}
                    >
                      {covered ? "Toon vertalingen" : "Dek vertalingen af"}
                    </button>
                  </div>

                  <ul className="divide-y divide-line">
                    {deck.words.map((word) => (
                      <li key={word.term} className="flex items-center gap-3 py-2">
                        <Tile level={mastery(progress.cards[cardId(deck.id, word.term)])} size={18} />
                        <SpeakButton size="sm" onClick={() => speak(word.term)} />
                        <span lang={pack.speechLang} className="flex-1 text-[15px]">{word.term}</span>
                        {/* key op `covered`: bij opnieuw afdekken moet alles weer dicht */}
                        <RevealableTranslation
                          key={String(covered)}
                          covered={covered}
                          text={word.translation}
                        />
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/leren?deck=${deck.id}`} className="btn btn-primary">
                      Deze lijst leren
                    </Link>
                    <Link
                      href={`/toets?deck=${deck.id}`}
                      className={`btn btn-secondary ${deck.words.length < 4 ? "pointer-events-none opacity-45" : ""}`}
                    >
                      Overhoren
                    </Link>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <section className="mt-10">
        <p className="eyebrow">nieuwe lijst</p>
        <h2 className="display mt-1 text-2xl">Laat er tien woorden bij maken</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Kies een thema en niveau. Woorden die je al hebt worden overgeslagen.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {pack.themes.map((option) => (
            <button
              key={option}
              className="chip"
              data-on={theme === option}
              onClick={() => setTheme(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.map((option) => (
            <button
              key={option}
              className="chip"
              data-on={level === option}
              onClick={() => setLevel(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <button className="btn btn-secondary mt-4" onClick={generate} disabled={busy}>
          {busy ? "Bezig…" : "Maak een lijst van 10 woorden"}
        </button>
        {error && <Foutmelding tekst={error} />}
      </section>
    </Page>
  );
}

/** Wijst naar het aanmeldscherm als dát het probleem is, en zegt anders wat er mis ging. */
function Foutmelding({ tekst }: { tekst: string }) {
  if (tekst === "aanmelden") return <OpnieuwAanmelden wat="een nieuwe lijst maken" />;
  return <p className="mt-3 text-sm text-bad">{tekst}</p>;
}

/** Een zelfgemaakte lijst krijgt een eigen id en een oplopend nummer per thema. */
function makeDeck(
  code: string,
  theme: string,
  level: Level,
  words: Word[],
  existing: Deck[]
): Deck {
  const number = existing.filter((deck) => deck.title.startsWith(theme)).length + 1;
  return {
    id: `${code}-eigen-${Date.now()}`,
    title: `${theme} — lijst ${number}`,
    level,
    words,
    generated: true,
  };
}

function RevealableTranslation({ covered, text }: { covered: boolean; text: string }) {
  const [shown, setShown] = useState(false);
  const hidden = covered && !shown;
  return (
    <button
      className={`shrink-0 rounded px-2 py-0.5 text-right text-sm transition-colors ${
        hidden ? "bg-line text-transparent select-none" : "text-ink-soft"
      }`}
      onClick={() => setShown(true)}
      aria-label={hidden ? "Toon vertaling" : undefined}
    >
      {text}
    </button>
  );
}
