"use client";

import { useState } from "react";
import type { GrammarExercise, LanguagePack, Level } from "@/content/types";
import { judge } from "@/lib/answer";
import type { Progress, StudyCard } from "@/lib/progress";
import { buildCards, exercisesFor } from "@/lib/progress";
import { ProgressBar } from "./chrome";
import { Prompt, TypedAnswer } from "./exercises";

/**
 * Toetsen tonen geen antwoord tussendoor — dat is het verschil met oefenen.
 * Je krijgt je nakijkblad pas aan het eind, net als op school.
 */

type Common = {
  label: string;
  prompt: string;
  answer: string;
  source: string;
  /** Staat de vraag zelf in de doeltaal? Bepaalt het lang-attribuut. */
  promptInTarget?: boolean;
};

export type QuizQuestion =
  | ({ kind: "typed" } & Common)
  | ({ kind: "choice"; options: string[] } & Common);

export type QuizResult = {
  question: QuizQuestion;
  given: string;
  correct: boolean;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Woordvraag: Nederlands zien, de doeltaal schrijven. */
export function wordQuestion(card: StudyCard): QuizQuestion {
  return {
    kind: "typed",
    label: "hoe zeg je dit?",
    prompt: card.word.translation,
    answer: card.word.term,
    source: card.deckTitle,
  };
}

export function grammarQuestion(
  exercise: GrammarExercise,
  pronouns: string[]
): QuizQuestion | null {
  if (exercise.type === "choice")
    return {
      kind: "choice",
      label: "kies het juiste woord",
      prompt: exercise.prompt,
      options: exercise.options,
      answer: exercise.answer,
      source: "grammatica",
      promptInTarget: true,
    };

  if (exercise.type === "conjugate") {
    const index = Math.floor(Math.random() * exercise.answers.length);
    return {
      kind: "typed",
      label: `vervoeg — ${exercise.tense}`,
      prompt: `${exercise.verb} · ${pronouns[index] ?? `vorm ${index + 1}`}`,
      answer: exercise.answers[index],
      source: "grammatica",
      promptInTarget: true,
    };
  }

  return {
    kind: "typed",
    label: exercise.type === "transform" ? "schrijf om" : "vul in",
    prompt: exercise.prompt,
    answer: exercise.answer,
    source: "grammatica",
    promptInTarget: true,
  };
}

/** Toetsvragen voor één woordenlijst. */
export function deckQuiz(cards: StudyCard[], size: number): QuizQuestion[] {
  return shuffle(cards).slice(0, size).map(wordQuestion);
}

/** Eindexamen: half woorden, half grammatica, alles van dat niveau. */
export function examQuiz(
  pack: LanguagePack,
  progress: Progress,
  level: Level,
  size: number
): QuizQuestion[] {
  const cards = buildCards(pack, progress).filter((card) => card.level === level);
  const exercises = pack.curriculum
    .filter((topic) => topic.level === level)
    .flatMap((topic) => exercisesFor(pack, progress, topic.id));

  const half = Math.ceil(size / 2);
  const words = shuffle(cards).slice(0, half).map(wordQuestion);
  const grammar = shuffle(exercises)
    .map((exercise) => grammarQuestion(exercise, pack.pronouns))
    .filter((question): question is QuizQuestion => question !== null)
    .slice(0, size - words.length);

  const questions = shuffle([...words, ...grammar]);
  // Te weinig grammatica? Vul aan met woorden, zodat de toets altijd vol is.
  if (questions.length < size) {
    const extra = shuffle(cards)
      .map(wordQuestion)
      .filter((q) => !questions.some((existing) => existing.answer === q.answer))
      .slice(0, size - questions.length);
    return shuffle([...questions, ...extra]);
  }
  return questions;
}

export function Quiz({
  questions,
  articles,
  speechLang,
  specialChars,
  onFinish,
}: {
  questions: QuizQuestion[];
  articles: string[];
  speechLang: string;
  specialChars: string[];
  onFinish: (results: QuizResult[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [results, setResults] = useState<QuizResult[]>([]);

  const question = questions[index];

  const submit = (given: string) => {
    const verdict = judge(given, question.answer, articles);
    const next = [...results, { question, given, correct: verdict.correct }];
    setResults(next);
    setTyped("");
    if (index + 1 >= questions.length) onFinish(next);
    else setIndex(index + 1);
  };

  return (
    <>
      <ProgressBar value={index} max={questions.length} label="Voortgang in deze toets" />

      <div key={index} className="rise space-y-5">
        <Prompt label={question.label}>
          <p
            lang={question.promptInTarget ? speechLang : undefined}
            className="display text-2xl leading-snug"
          >
            {question.prompt}
          </p>
        </Prompt>

        {question.kind === "choice" ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {question.options.map((option) => (
              <button
                key={option}
                lang={speechLang}
                className="rounded-xl border border-line-strong bg-surface px-4 py-3 text-center text-[15px] transition-colors hover:border-brand-mid hover:bg-brand-soft"
                onClick={() => submit(option)}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <>
            <TypedAnswer
              value={typed}
              onChange={setTyped}
              onSubmit={() => submit(typed)}
              placeholder="Jouw antwoord"
              lang={speechLang}
              specialChars={specialChars}
            />
            <div className="flex gap-3">
              <button
                className="btn btn-primary flex-1"
                disabled={!typed.trim()}
                onClick={() => submit(typed)}
              >
                Volgende
              </button>
              <button className="btn btn-ghost" onClick={() => submit("")}>
                Overslaan
              </button>
            </div>
          </>
        )}

        <p className="text-xs text-ink-faint">uit: {question.source}</p>
      </div>
    </>
  );
}

export function QuizReview({
  results,
  speechLang,
}: {
  results: QuizResult[];
  speechLang?: string;
}) {
  const wrong = results.filter((result) => !result.correct);
  if (!wrong.length) return null;
  return (
    <div className="panel mt-6 overflow-hidden">
      <p className="border-b border-line px-4 py-2.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
        nakijkblad
      </p>
      <ul className="divide-y divide-line">
        {wrong.map((result, i) => (
          <li key={i} className="px-4 py-3 text-sm">
            <p className="text-ink-soft">{result.question.prompt}</p>
            <p className="mt-1">
              <span className="text-bad line-through">{result.given || "geen antwoord"}</span>
              <span className="mx-2 text-ink-faint">→</span>
              <b lang={speechLang} className="text-ok">
                {result.question.answer}
              </b>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
