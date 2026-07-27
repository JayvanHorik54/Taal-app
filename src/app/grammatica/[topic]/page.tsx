"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { Loading, OpnieuwAanmelden, Page, ProgressBar, TaskBar } from "@/components/chrome";
import { GrammarExerciseView, SpeakButton } from "@/components/exercises";
import { Greca } from "@/components/tiles";
import type { GrammarExercise, Lesson } from "@/content/types";
import { exercisesFor, lessonFor, topicMastery, type GradeEntry } from "@/lib/progress";
import { cijfer } from "@/lib/srs";
import { useVoice } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { ToegangGeweigerd, aiFetch } from "@/lib/toegang";

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicId } = use(params);
  const { ready, pack, progress, update } = useStore();
  const router = useRouter();
  const speak = useVoice(pack.speechLang);

  const [drilling, setDrilling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const topic = pack.curriculum.find((t) => t.id === topicId);
  const lesson = topic ? lessonFor(pack, progress, topicId) : undefined;
  const exercises = useMemo(
    () => (topic ? exercisesFor(pack, progress, topicId) : []),
    [pack, progress, topic, topicId]
  );

  if (!ready) return <Loading />;

  if (!topic)
    return (
      <Page>
        <h1 className="display text-3xl">Dit hoofdstuk bestaat niet</h1>
        <Link href="/grammatica" className="btn btn-primary mt-5">
          Terug naar de leerlijn
        </Link>
      </Page>
    );

  const entry = progress.grammar[topicId];

  const fetchLesson = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await aiFetch<{ lesson?: Lesson }>("/api/les", {
        language: pack.code,
        topicId,
      });
      if (!data.lesson) {
        setError("Dat lukte niet. Probeer het nog een keer.");
        return;
      }
      const fresh = data.lesson;
      update((current) => ({
        ...current,
        grammar: {
          ...current.grammar,
          [topicId]: {
            attempts: current.grammar[topicId]?.attempts ?? 0,
            best: current.grammar[topicId]?.best ?? 0,
            lesson: fresh,
          },
        },
      }));
    } catch (fout) {
      setError(
        fout instanceof ToegangGeweigerd
          ? "aanmelden"
          : fout instanceof Error
            ? fout.message
            : "Dat lukte niet."
      );
    } finally {
      setBusy(false);
    }
  };

  if (drilling && exercises.length)
    return (
      <Drill
        title={topic.title}
        exercises={exercises}
        pronouns={pack.pronouns}
        speechLang={pack.speechLang}
        specialChars={pack.specialChars}
        onQuit={() => setDrilling(false)}
        onFinish={(score, total) => {
          const ratio = total ? score / total : 0;
          const grade: GradeEntry = {
            id: `${topicId}-${Date.now()}`,
            kind: "grammatica",
            name: topic.title,
            score,
            total,
            cijfer: cijfer(score, total),
            date: Date.now(),
          };
          update((current) => {
            const previous = current.grammar[topicId];
            return {
              ...current,
              grammar: {
                ...current.grammar,
                [topicId]: {
                  ...previous,
                  attempts: (previous?.attempts ?? 0) + 1,
                  best: Math.max(previous?.best ?? 0, ratio),
                  lesson: previous?.lesson,
                },
              },
              grades: [grade, ...current.grades].slice(0, 40),
            };
          });
          setDrilling(false);
        }}
      />
    );

  return (
    <Page>
      <TaskBar title={topic.level} onQuit={() => router.push("/grammatica")} quitLabel="Terug" />

      <div className="flex items-start gap-4">
        <Greca level={topicMastery(entry)} size={44} />
        <div>
          <h1 className="display text-3xl leading-tight">{topic.title}</h1>
          {entry?.attempts ? (
            <p className="mt-1 text-sm text-ink-faint">
              beste resultaat: {cijfer(Math.round(entry.best * 10), 10).toFixed(1)} · {entry.attempts}{" "}
              {entry.attempts === 1 ? "poging" : "pogingen"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink-faint">nog niet geoefend</p>
          )}
        </div>
      </div>

      {!lesson ? (
        <div className="panel mt-7 p-6">
          <p className="text-sm text-ink-soft">
            Dit hoofdstuk staat nog niet uitgeschreven in de app. Laat de uitleg, de tabel, de
            voorbeelden en zes oefeningen erbij maken — daarna blijft het bewaard en hoeft het
            nooit meer opnieuw.
          </p>
          <button className="btn btn-primary mt-4" onClick={fetchLesson} disabled={busy}>
            {busy ? "Bezig met schrijven…" : "Schrijf dit hoofdstuk"}
          </button>
          <p className="mt-3 text-xs text-ink-faint">
            {busy
              ? "Een heel hoofdstuk schrijven duurt ongeveer een minuut. Laat dit scherm open staan."
              : "Duurt ongeveer een minuut."}
          </p>
          {error === "aanmelden" ? (
            <OpnieuwAanmelden wat="dit hoofdstuk laten schrijven" />
          ) : (
            error && <p className="mt-3 text-sm text-bad">{error}</p>
          )}
        </div>
      ) : (
        <>
          <p className="mt-7 border-l-2 border-brand pl-4 text-lg leading-relaxed">{lesson.core}</p>

          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lesson.intro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {lesson.table && (
            <div className="panel mt-7 overflow-hidden">
              <p className="border-b border-line px-4 py-2.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                {lesson.table.title}
              </p>
              <table className="w-full text-[15px]">
                <tbody className="divide-y divide-line">
                  {lesson.table.rows.map(([left, right], i) => (
                    <tr key={i}>
                      <td className="w-1/2 px-4 py-2 text-ink-soft">{left}</td>
                      <td lang={pack.speechLang} className="px-4 py-2 font-medium">{right}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {lesson.rules.length > 0 && (
            <div className="mt-7 space-y-3">
              {lesson.rules.map((rule, i) => (
                <div key={i} className="rounded-xl bg-surface-2 p-4">
                  <p className="text-sm font-semibold">{rule.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{rule.text}</p>
                </div>
              ))}
            </div>
          )}

          {lesson.examples.length > 0 && (
            <div className="mt-7">
              <p className="eyebrow">voorbeelden</p>
              <ul className="mt-3 space-y-3">
                {lesson.examples.map((example, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <SpeakButton size="sm" onClick={() => speak(example.target)} />
                    <span>
                      <span lang={pack.speechLang} className="block text-[15px]">{example.target}</span>
                      <span className="block text-sm text-ink-soft">{example.native}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lesson.pitfall && (
            <div className="mt-7 rounded-xl border border-accent/40 bg-accent-soft p-4">
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">valkuil</p>
              <p className="mt-1.5 text-sm">{lesson.pitfall}</p>
            </div>
          )}

          <button
            className="btn btn-primary mt-8 w-full"
            onClick={() => setDrilling(true)}
            disabled={!exercises.length}
          >
            {exercises.length
              ? `Oefen dit hoofdstuk (${exercises.length} vragen)`
              : "Geen oefeningen beschikbaar"}
          </button>
        </>
      )}
    </Page>
  );
}

function Drill({
  title,
  exercises,
  pronouns,
  speechLang,
  specialChars,
  onFinish,
  onQuit,
}: {
  title: string;
  exercises: GrammarExercise[];
  pronouns: string[];
  speechLang: string;
  specialChars: string[];
  onFinish: (score: number, total: number) => void;
  onQuit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const exercise = exercises[index];

  return (
    <Page>
      <TaskBar
        title={title}
        right={
          <span className="text-xs text-ink-faint">
            {index + 1} / {exercises.length}
          </span>
        }
        onQuit={onQuit}
      />

      <ProgressBar value={index} max={exercises.length} label="Voortgang in dit hoofdstuk" />

      <div key={index} className="rise">
        <GrammarExerciseView
          exercise={exercise}
          pronouns={pronouns}
          speechLang={speechLang}
          specialChars={specialChars}
          onDone={({ correct }) => {
            const next = correct ? score + 1 : score;
            setScore(next);
            if (index + 1 >= exercises.length) onFinish(next, exercises.length);
            else setIndex(index + 1);
          }}
        />
      </div>
    </Page>
  );
}
