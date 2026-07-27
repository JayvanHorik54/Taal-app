"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loading, Page, TaskBar } from "@/components/chrome";
import { Quiz, QuizReview, examQuiz, type QuizResult } from "@/components/quiz";
import { LEVELS, NEXT_LEVEL, type Level } from "@/content/types";
import { bumpStreak, type GradeEntry } from "@/lib/progress";
import { PASS, cijfer } from "@/lib/srs";
import { useStore } from "@/lib/store";

const EXAM_SIZE = 20;

export default function ExamenPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Gate />
    </Suspense>
  );
}

/** Wacht op de opgeslagen voortgang; anders stelt het examen zich leeg samen. */
function Gate() {
  const { ready, progress } = useStore();
  const parameter = useSearchParams().get("level");
  if (!ready) return <Loading />;
  const level: Level = LEVELS.includes(parameter as Level)
    ? (parameter as Level)
    : progress.level;
  return <Examen level={level} />;
}

function Examen({ level }: { level: Level }) {
  const { pack, progress, update } = useStore();
  const router = useRouter();

  const [questions] = useState(() => examQuiz(pack, progress, level, EXAM_SIZE));
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [started, setStarted] = useState(false);

  if (!questions.length)
    return (
      <Page>
        <h1 className="display text-3xl">Er zijn nog geen vragen voor {level}</h1>
        <p className="mt-3 text-ink-soft">
          Leer eerst wat woorden en werk een paar grammaticahoofdstukken af.
        </p>
        <Link href="/" className="btn btn-primary mt-5">
          Terug naar de muur
        </Link>
      </Page>
    );

  if (results) {
    const score = results.filter((result) => result.correct).length;
    const grade = cijfer(score, results.length);
    const passed = grade >= PASS;
    const next = NEXT_LEVEL[level];

    return (
      <Page>
        <TaskBar title={`eindexamen ${level}`} />
        <p className="eyebrow">{passed ? "geslaagd" : "nog niet gehaald"}</p>
        <h1 className="display mt-2 text-6xl">{grade.toFixed(1)}</h1>
        <p className="mt-3 text-ink-soft">
          {score} van de {results.length} goed.{" "}
          {passed
            ? next
              ? `${next} staat nu voor je open.`
              : "Je hebt de hele leerlijn uitgespeeld."
            : `Vanaf een ${PASS.toFixed(1)} ga je door. Oefen de fouten hieronder en probeer het opnieuw.`}
        </p>

        <QuizReview results={results} speechLang={pack.speechLang} />

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Terug naar de muur
          </Link>
          <Link href="/leren" className="btn btn-secondary">
            Meteen doorleren
          </Link>
        </div>
      </Page>
    );
  }

  if (!started)
    return (
      <Page>
        <TaskBar title="eindexamen" onQuit={() => router.push("/")} quitLabel="Nog niet" />
        <p className="eyebrow">niveau {level}</p>
        <h1 className="display mt-2 text-4xl">Klaar voor het eindexamen?</h1>
        <div className="panel mt-6 p-5 text-sm">
          <ul className="space-y-2 text-ink-soft">
            <li>· {questions.length} vragen over woorden én grammatica.</li>
            <li>· Je krijgt geen antwoord tussendoor — je nakijkblad komt aan het eind.</li>
            <li>· Een {PASS.toFixed(1)} of hoger opent {NEXT_LEVEL[level] ?? "het einde van de leerlijn"}.</li>
            <li>· Je mag het examen zo vaak overdoen als je wilt.</li>
          </ul>
        </div>
        <button className="btn btn-primary mt-6 w-full" onClick={() => setStarted(true)} autoFocus>
          Begin het examen
        </button>
      </Page>
    );

  return (
    <Page>
      <TaskBar title={`eindexamen ${level}`} onQuit={() => router.push("/")} />
      <Quiz
        questions={questions}
        articles={pack.articles}
        speechLang={pack.speechLang}
        specialChars={pack.specialChars}
        onFinish={(finished) => {
          setResults(finished);
          const score = finished.filter((result) => result.correct).length;
          const grade = cijfer(score, finished.length);
          const entry: GradeEntry = {
            id: `examen-${level}-${Date.now()}`,
            kind: "examen",
            name: `Eindexamen ${level}`,
            score,
            total: finished.length,
            cijfer: grade,
            date: Date.now(),
          };
          update((current) => {
            const bumped = bumpStreak(current);
            const unlock =
              grade >= PASS &&
              NEXT_LEVEL[level] &&
              LEVELS.indexOf(NEXT_LEVEL[level]!) > LEVELS.indexOf(bumped.level)
                ? NEXT_LEVEL[level]!
                : bumped.level;
            // Een herkansing mag je cijfer verbeteren, nooit verlagen.
            const best = bumped.exams[level];
            return {
              ...bumped,
              level: unlock,
              grades: [entry, ...bumped.grades].slice(0, 40),
              exams: {
                ...bumped.exams,
                [level]:
                  !best || grade > best.cijfer ? { cijfer: grade, date: Date.now() } : best,
              },
            };
          });
        }}
      />
    </Page>
  );
}
