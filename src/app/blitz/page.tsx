"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loading, Page, TaskBar } from "@/components/chrome";
import { buildCards, bumpStreak, type StudyCard } from "@/lib/progress";
import { review, type Grade } from "@/lib/srs";
import { useStore } from "@/lib/store";

const ROUND_SECONDS = 60;
const OPTIONS = 4;
const QUEUE_LENGTH = 120;

type Question = {
  card: StudyCard;
  prompt: string;
  answer: string;
  options: string[];
  /** De richting wisselt per vraag; dit bepaalt welk lang-attribuut waar hoort. */
  promptInTarget: boolean;
};

export default function BlitzPage() {
  const { ready, synced } = useStore();
  if (!ready || !synced) return <Loading />;
  return <Round />;
}

function Round() {
  const { pack, progress, update } = useStore();
  const router = useRouter();

  const [cards] = useState(() => buildCards(pack, progress));
  const [queue] = useState(() => buildQueue(cards));
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [over, setOver] = useState(false);

  // Uitkomsten verzamelen we tijdens het spel en schrijven we in één keer weg —
  // niet per antwoord, anders loopt de klok achter.
  const outcomes = useRef<Map<string, Grade>>(new Map());
  const finalScore = useRef(0);

  function finish() {
    setOver(true);
    update((current) => {
      const bumped = bumpStreak(current);
      const schedules = { ...bumped.cards };
      for (const [id, grade] of outcomes.current) {
        const card = cards.find((item) => item.id === id);
        if (card) schedules[id] = review(card.schedule, grade);
      }
      return {
        ...bumped,
        cards: schedules,
        answers: bumped.answers + outcomes.current.size,
        blitzBest: Math.max(bumped.blitzBest, finalScore.current),
      };
    });
  }

  // De klok rekent terug vanaf een vast eindmoment in plaats van per tik af te
  // trekken: dat loopt niet weg als de browser even een tel overslaat. Het
  // afsluiten gebeurt hier in de timer-callback, niet in de setState-updater —
  // die moet zuiver blijven.
  useEffect(() => {
    if (over || !queue.length) return;
    const deadline = Date.now() + ROUND_SECONDS * 1000;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        finish();
      }
    }, 500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over, queue.length]);

  if (!queue.length)
    return (
      <Page>
        <h1 className="display text-3xl">Je hebt minstens vier woorden nodig</h1>
        <Link href="/woorden" className="btn btn-primary mt-5">
          Naar de lijsten
        </Link>
      </Page>
    );

  if (over)
    return (
      <Page>
        <TaskBar title={pack.games.blitz} />
        <p className="eyebrow">tijd om</p>
        <h1 className="display mt-2 text-6xl">{score}</h1>
        <p className="mt-3 text-ink-soft">
          {score >= progress.blitzBest
            ? "Nieuw record! Dat gaat de goede kant op."
            : `Jouw record staat op ${progress.blitzBest}.`}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Nog een ronde
          </button>
          <Link href="/spelen" className="btn btn-secondary">
            Terug
          </Link>
        </div>
      </Page>
    );

  const question = queue[index % queue.length];

  const answer = (option: string) => {
    const correct = option === question.answer;
    // Eén misser wist een eerdere goede beurt op hetzelfde woord niet uit.
    if (correct || !outcomes.current.has(question.card.id)) {
      outcomes.current.set(question.card.id, correct ? 1 : 0);
    }
    setFlash(correct ? "good" : "bad");
    setTimeout(() => setFlash(null), 220);
    if (correct) {
      const gained = 1 + Math.floor(combo / 3);
      finalScore.current += gained;
      setScore((value) => value + gained);
      setCombo((value) => value + 1);
    } else {
      setCombo(0);
    }
    setIndex((value) => value + 1);
  };

  return (
    <Page>
      <TaskBar
        title={pack.games.blitz}
        right={
          <span className="flex items-center gap-3 text-xs">
            <span className="text-ink-faint">
              score <b className="text-ink">{score}</b>
            </span>
            {combo >= 3 && <span className="font-semibold text-accent">combo ×{combo}</span>}
          </span>
        }
        onQuit={() => router.push("/spelen")}
      />

      <div
        className="mb-7 h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={ROUND_SECONDS}
        aria-valuenow={left}
        aria-label="Resterende tijd"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-linear"
          style={{ width: `${(left / ROUND_SECONDS) * 100}%` }}
        />
      </div>

      {/* De teller elke seconde laten voorlezen zou een schermlezer onbruikbaar
          maken; de balk hierboven draagt dezelfde informatie. */}
      <p aria-hidden className="text-center text-xs text-ink-faint">
        {left} seconden
      </p>

      <div className={`mt-8 ${flash === "bad" ? "shake" : ""}`}>
        <p
          lang={question.promptInTarget ? pack.speechLang : undefined}
          className="display text-center text-4xl"
          style={{ color: flash === "good" ? "var(--ok)" : undefined }}
        >
          {question.prompt}
        </p>

        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => (
            <button
              key={option}
              lang={question.promptInTarget ? undefined : pack.speechLang}
              className="rounded-xl border border-line-strong bg-surface px-4 py-4 text-[15px] transition-colors hover:border-brand-mid hover:bg-brand-soft"
              onClick={() => answer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </Page>
  );
}

/**
 * De hele ronde wordt vooraf uitgedeeld. Dat scheelt werk tijdens het spelen
 * en houdt de klok vloeiend.
 */
function buildQueue(cards: StudyCard[]): Question[] {
  if (cards.length < OPTIONS) return [];
  const queue: Question[] = [];
  for (let i = 0; i < QUEUE_LENGTH; i++) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    const targetToNative = Math.random() < 0.5;
    const answer = targetToNative ? card.word.translation : card.word.term;
    const seen = new Set([answer]);
    const options = [answer];
    let guard = 0;
    while (options.length < OPTIONS && guard++ < 50) {
      const other = cards[Math.floor(Math.random() * cards.length)];
      const value = targetToNative ? other.word.translation : other.word.term;
      if (seen.has(value)) continue;
      seen.add(value);
      options.push(value);
    }
    if (options.length < OPTIONS) continue;
    queue.push({
      card,
      prompt: targetToNative ? card.word.term : card.word.translation,
      answer,
      options: options.sort(() => Math.random() - 0.5),
      promptInTarget: targetToNative,
    });
  }
  return queue;
}
