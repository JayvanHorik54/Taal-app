"use client";

import Link from "next/link";
import { useState } from "react";
import { Loading, Page } from "@/components/chrome";
import { Greca } from "@/components/tiles";
import { LEVELS, type Level } from "@/content/types";
import { topicMastery } from "@/lib/progress";
import { cijfer } from "@/lib/srs";
import { useStore } from "@/lib/store";

export default function GrammaticaPage() {
  const { ready, pack, progress } = useStore();
  const [level, setLevel] = useState<Level>("A1");

  if (!ready) return <Loading />;

  const topics = pack.curriculum.filter((topic) => topic.level === level);
  const written = topics.filter((topic) => pack.lessons[topic.id]).length;

  return (
    <Page>
      <p className="eyebrow">grammatica</p>
      <h1 className="display mt-2 text-4xl">De leerlijn</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-soft">
        Elk hoofdstuk heeft uitleg, een tabel, voorbeelden, de valkuil voor Nederlandstaligen en
        zes oefeningen. Haal 70% of meer en het hoofdstuk telt mee voor je eindexamen.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
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

      <p className="mt-3 text-xs text-ink-faint">
        {written === topics.length
          ? `Alle ${topics.length} hoofdstukken van ${level} staan volledig uitgeschreven in de app.`
          : `${written} van de ${topics.length} hoofdstukken staan uitgeschreven; de rest wordt op verzoek aangevuld.`}
      </p>

      <ol className="mt-5 space-y-2">
        {topics.map((topic) => {
          const entry = progress.grammar[topic.id];
          const number = pack.curriculum.indexOf(topic) + 1;
          return (
            <li key={topic.id}>
              <Link
                href={`/grammatica/${topic.id}`}
                className="panel flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
              >
                <Greca level={topicMastery(entry)} size={28} />
                <span className="w-6 shrink-0 text-xs tabular-nums text-ink-faint">
                  {String(number).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 text-[15px]">
                  {topic.title}
                  {pack.lessons[topic.id] && (
                    <span className="ml-2 inline-block rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap text-brand uppercase">
                      uitgeschreven
                    </span>
                  )}
                </span>
                {entry?.attempts ? (
                  <span className="shrink-0 text-sm font-semibold text-brand">
                    {cijfer(Math.round(entry.best * 10), 10).toFixed(1)}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-ink-faint">nieuw</span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </Page>
  );
}
