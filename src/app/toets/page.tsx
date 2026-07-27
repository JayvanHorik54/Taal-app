"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loading, Page, TaskBar } from "@/components/chrome";
import { Quiz, QuizReview, deckQuiz, type QuizResult } from "@/components/quiz";
import { allDecks, buildCards, bumpStreak, cardId, type GradeEntry } from "@/lib/progress";
import { cijfer, review } from "@/lib/srs";
import { useStore } from "@/lib/store";

const TEST_SIZE = 10;

export default function ToetsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Gate />
    </Suspense>
  );
}

/** Wacht op de opgeslagen voortgang; anders is er niets om te overhoren. */
function Gate() {
  const { ready } = useStore();
  const deckId = useSearchParams().get("deck");
  if (!ready) return <Loading />;
  return <Toets deckId={deckId} />;
}

function Toets({ deckId }: { deckId: string | null }) {
  const { pack, progress, update } = useStore();
  const router = useRouter();

  const [questions] = useState(() =>
    deckQuiz(
      buildCards(pack, progress).filter((card) => !deckId || card.deckId === deckId),
      TEST_SIZE
    )
  );
  const [results, setResults] = useState<QuizResult[] | null>(null);

  const deck = allDecks(pack, progress).find((item) => item.id === deckId);
  const name = deck?.title ?? "Alle woorden";

  if (!questions.length)
    return (
      <Page>
        <h1 className="display text-3xl">Deze lijst heeft nog geen woorden</h1>
        <Link href="/woorden" className="btn btn-primary mt-5">
          Terug naar de lijsten
        </Link>
      </Page>
    );

  if (results) {
    const score = results.filter((result) => result.correct).length;
    const grade = cijfer(score, results.length);
    return (
      <Page>
        <TaskBar title="overhoring" />
        <p className="eyebrow">{name}</p>
        <h1 className="display mt-2 text-6xl">{grade.toFixed(1)}</h1>
        <p className="mt-3 text-ink-soft">
          {score} van de {results.length} goed.
          {score < results.length && " De fouten komen morgen als eerste terug."}
        </p>

        <QuizReview results={results} speechLang={pack.speechLang} />

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/woorden" className="btn btn-primary">
            Terug naar de lijsten
          </Link>
          <Link href={deckId ? `/leren?deck=${deckId}` : "/leren"} className="btn btn-secondary">
            Deze lijst oefenen
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <TaskBar title={name} onQuit={() => router.push("/woorden")} />
      <Quiz
        questions={questions}
        articles={pack.articles}
        speechLang={pack.speechLang}
        specialChars={pack.specialChars}
        onFinish={(finished) => {
          setResults(finished);
          const score = finished.filter((result) => result.correct).length;
          const entry: GradeEntry = {
            id: `toets-${Date.now()}`,
            kind: "toets",
            name,
            score,
            total: finished.length,
            cijfer: cijfer(score, finished.length),
            date: Date.now(),
          };

          // Een toets telt ook als herhaling: fout beantwoorde woorden komen
          // eerder terug, goede schuiven op.
          const cards = buildCards(pack, progress);
          update((current) => {
            const bumped = bumpStreak(current);
            const schedules = { ...bumped.cards };
            for (const result of finished) {
              const card = cards.find((item) => item.word.term === result.question.answer);
              if (!card) continue;
              schedules[cardId(card.deckId, card.word.term)] = review(
                card.schedule,
                result.correct ? 1 : 0
              );
            }
            return {
              ...bumped,
              cards: schedules,
              answers: bumped.answers + finished.length,
              grades: [entry, ...bumped.grades].slice(0, 40),
            };
          });
        }}
      />
    </Page>
  );
}
