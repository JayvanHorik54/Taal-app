"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Loading, Page, ProgressBar, TaskBar } from "@/components/chrome";
import { Tile } from "@/components/tiles";
import {
  Prompt,
  SpeakButton,
  VocabExercise,
  pickKind,
  type Outcome,
  type VocabKind,
} from "@/components/exercises";
import { buildCards, bumpStreak, sessionQueue, type StudyCard } from "@/lib/progress";
import { mastery, review, type Grade } from "@/lib/srs";
import { useVoice } from "@/lib/speech";
import { useStore } from "@/lib/store";

const SESSION_SIZE = 12;

type Step = { card: StudyCard; kind: VocabKind | "intro" };

export default function LerenPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Gate />
    </Suspense>
  );
}

/**
 * De sessie mag pas opgebouwd worden als de voortgang uit localStorage is
 * gelezen — anders stelt hij zijn rij samen op een lege muur.
 */
function Gate() {
  const { ready } = useStore();
  const deckId = useSearchParams().get("deck") ?? undefined;
  if (!ready) return <Loading />;
  return <Session deckId={deckId} />;
}

function Session({ deckId }: { deckId?: string }) {
  const { pack, progress, update } = useStore();
  const router = useRouter();
  const speak = useVoice(pack.speechLang);

  const cards = useMemo(() => buildCards(pack, progress), [pack, progress]);

  // De rij wordt één keer samengesteld: hij mag niet verspringen terwijl je bezig bent.
  const [steps] = useState<Step[]>(() =>
    sessionQueue(buildCards(pack, progress), SESSION_SIZE, deckId).flatMap<Step>((card) =>
      card.schedule.reps === 0
        ? [
            { card, kind: "intro" },
            { card, kind: "recognize" },
          ]
        : [{ card, kind: pickKind(card) }]
    )
  );

  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState({ good: 0, bad: 0 });
  const [done, setDone] = useState(false);

  if (!steps.length)
    return (
      <Page>
        <TaskBar title="oefensessie" onQuit={() => router.push("/")} quitLabel="Terug" />
        <p className="text-ink-soft">Er staan nog geen woorden klaar.</p>
      </Page>
    );

  const step = steps[Math.min(index, steps.length - 1)];
  const questionCount = steps.filter((item) => item.kind !== "intro").length;

  const advance = () => {
    if (index + 1 >= steps.length) setDone(true);
    else setIndex(index + 1);
  };

  const grade = (card: StudyCard, value: Grade, outcome: Outcome) => {
    update((current) => {
      const bumped = bumpStreak(current);
      return {
        ...bumped,
        answers: bumped.answers + 1,
        cards: { ...bumped.cards, [card.id]: review(card.schedule, value) },
      };
    });
    setTally((current) =>
      outcome.correct
        ? { ...current, good: current.good + 1 }
        : { ...current, bad: current.bad + 1 }
    );
    advance();
  };

  if (done) {
    const total = tally.good + tally.bad;
    return (
      <Page>
        <TaskBar title="sessie klaar" />
        <h1 className="display text-4xl">
          {tally.good} van de {total} goed
        </h1>
        <p className="mt-3 text-ink-soft">
          {tally.bad === 0
            ? "Foutloos. Deze woorden komen pas over een paar dagen terug."
            : `${tally.bad} ${tally.bad === 1 ? "woord komt" : "woorden komen"} straks weer langs — dat is precies de bedoeling.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Terug naar de muur
          </Link>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Nog een ronde
          </button>
        </div>
      </Page>
    );
  }

  const answered = steps.slice(0, index).filter((item) => item.kind !== "intro").length;

  return (
    <Page>
      <TaskBar
        title={deckId ? "lijst oefenen" : "oefensessie"}
        right={
          <span className="text-xs text-ink-faint">
            {Math.min(answered + 1, questionCount)} / {questionCount}
          </span>
        }
        onQuit={() => router.push("/")}
      />

      <ProgressBar value={index} max={steps.length} label="Voortgang in deze sessie" />

      {step.kind === "intro" ? (
        <div key={`intro-${index}`} className="rise space-y-6">
          <Prompt label="nieuw woord">
            <div className="flex items-center gap-3">
              <span lang={pack.speechLang} className="display text-4xl">
                {step.card.word.term}
              </span>
              <SpeakButton onClick={() => speak(step.card.word.term)} />
            </div>
            <p className="mt-2 text-lg text-ink-soft">{step.card.word.translation}</p>
          </Prompt>

          {step.card.word.exampleTarget && (
            <div className="panel p-4">
              <div className="flex items-start gap-3">
                <SpeakButton size="sm" onClick={() => speak(step.card.word.exampleTarget!)} />
                <div>
                  <p lang={pack.speechLang} className="text-[15px] italic">
                    {step.card.word.exampleTarget}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{step.card.word.exampleNative}</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-ink-faint">uit: {step.card.deckTitle}</p>

          <button className="btn btn-primary w-full" onClick={advance} autoFocus>
            Onthouden
          </button>
        </div>
      ) : (
        <div key={`vraag-${index}`} className="rise">
          <VocabExercise
            card={step.card}
            kind={step.kind}
            distractors={distractorsFor(step.card, cards)}
            speechLang={pack.speechLang}
            specialChars={pack.specialChars}
            articles={pack.articles}
            speak={speak}
            onDone={(outcome) => grade(step.card, outcome.correct ? 1 : 0, outcome)}
          />
        </div>
      )}

      <div className="mt-8 flex items-center gap-2 text-xs text-ink-faint">
        <Tile level={mastery(step.card.schedule)} size={16} />
        {step.card.deckTitle}
      </div>
    </Page>
  );
}

/** Foute antwoordopties: liefst uit dezelfde lijst, dan pas van elders. */
function distractorsFor(card: StudyCard, all: StudyCard[]): string[] {
  const sameDeck = all.filter((other) => other.deckId === card.deckId && other.id !== card.id);
  const rest = all.filter((other) => other.deckId !== card.deckId);
  const pool = [...shuffle(sameDeck), ...shuffle(rest)];
  const seen = new Set([card.word.translation]);
  const picked: string[] = [];
  for (const other of pool) {
    if (picked.length >= 3) break;
    if (seen.has(other.word.translation)) continue;
    seen.add(other.word.translation);
    picked.push(other.word.translation);
  }
  return picked;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
