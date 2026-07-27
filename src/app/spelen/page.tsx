"use client";

import Link from "next/link";
import { Loading, Page } from "@/components/chrome";
import { buildCards } from "@/lib/progress";
import { useStore } from "@/lib/store";

export default function SpelenPage() {
  const { ready, pack, progress } = useStore();
  if (!ready) return <Loading />;

  const cards = buildCards(pack, progress);
  const enough = cards.length >= 4;

  return (
    <Page>
      <p className="eyebrow">spelen</p>
      <h1 className="display mt-2 text-4xl">Duik erin</h1>

      <section className="panel mt-7 p-6">
        <p className="eyebrow">gesprek</p>
        <h2 lang={pack.speechLang} className="display mt-1 text-2xl">{pack.games.chat}</h2>
        <p className="mt-2 max-w-prose text-sm text-ink-soft">
          Praat in het {pack.name} met iemand die zich aanpast aan jouw niveau. Je krijgt
          suggesties als je vastloopt, een tip zodra je iets fout zegt, en je mag antwoorden door
          te typen of gewoon hardop te praten.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {pack.scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/charla/${scenario.id}`}
              className="rounded-xl border border-line-strong bg-surface p-4 transition-colors hover:border-brand-mid hover:bg-brand-soft"
            >
              <span className="block text-[15px] font-semibold">{scenario.title}</span>
              <span className="mt-0.5 block text-sm text-ink-soft">{scenario.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel mt-5 p-6">
        <p className="eyebrow">tegen de klok</p>
        <h2 lang={pack.speechLang} className="display mt-1 text-2xl">{pack.games.blitz}</h2>
        <p className="mt-2 max-w-prose text-sm text-ink-soft">
          Zestig seconden, zoveel mogelijk woorden. Goed op rij levert een combo op; één misser en
          je bent hem kwijt.
        </p>
        {progress.blitzBest > 0 && (
          <p className="mt-3 text-sm">
            Jouw record: <b className="display text-xl">{progress.blitzBest}</b>
          </p>
        )}
        <Link
          href="/blitz"
          className={`btn btn-primary mt-4 ${enough ? "" : "pointer-events-none opacity-45"}`}
        >
          {enough ? "Start de bliksemronde" : "Je hebt minstens vier woorden nodig"}
        </Link>
      </section>

      <p className="mt-6 text-xs text-ink-faint">
        Allebei tellen mee voor je herhaling: woorden die je hier goed hebt, komen later minder
        vaak terug.
      </p>
    </Page>
  );
}
