"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Loading, Page, ProgressBar, TaskBar } from "@/components/chrome";
import { Tile } from "@/components/tiles";
import {
  KoppelOefening,
  Prompt,
  SpeakButton,
  VocabExercise,
  type Outcome,
} from "@/components/exercises";
import { pickKind, type VocabKind } from "@/lib/vraagvorm";
import { buildCards, bumpStreak, sessionQueue, type StudyCard } from "@/lib/progress";
import { mastery, review, type Grade } from "@/lib/srs";
import { useVoice } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { shuffle } from "@/lib/willekeur";

const SESSION_SIZE = 12;

/** Zoveel woorden tegelijk in een koppelronde. */
const KOPPEL_AANTAL = 5;
/** Na hoeveel vragen de koppelronde ertussen komt. */
const KOPPEL_NA = 4;

type Step =
  | { kind: "intro"; card: StudyCard }
  | { kind: VocabKind; card: StudyCard }
  | { kind: "koppel"; cards: StudyCard[] };

export default function LerenPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Gate />
    </Suspense>
  );
}

/**
 * De sessie mag pas opgebouwd worden als de voortgang binnen is — niet alleen
 * de kopie uit localStorage, maar ook het antwoord van de server. Op een nieuw
 * apparaat is die kopie leeg terwijl er wel voortgang bestaat, en dan zou de
 * sessie zeggen dat er niets te doen is.
 */
function Gate() {
  const { ready, synced } = useStore();
  const deckId = useSearchParams().get("deck") ?? undefined;
  if (!ready || !synced) return <Loading />;
  return <Session deckId={deckId} />;
}

function Session({ deckId }: { deckId?: string }) {
  const { pack, progress, update } = useStore();
  const router = useRouter();
  const speak = useVoice(pack.speechLang);

  const cards = useMemo(() => buildCards(pack, progress), [pack, progress]);

  // De rij wordt één keer samengesteld: hij mag niet verspringen terwijl je bezig bent.
  const [steps] = useState<Step[]>(() =>
    bouwSessie(sessionQueue(buildCards(pack, progress), SESSION_SIZE, deckId))
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

  /**
   * Een koppelronde levert vijf uitslagen tegelijk. Die gaan in één keer de
   * voortgang in: vijf losse `update`-aanroepen zouden elk op de vorige stand
   * werken en elkaar overschrijven.
   */
  const gradeKoppel = (uitslagen: { cardId: string; correct: boolean }[]) => {
    const opId = new Map(
      steps.flatMap((item) => ("cards" in item ? item.cards : "card" in item ? [item.card] : []))
        .map((card) => [card.id, card])
    );

    update((current) => {
      const bumped = bumpStreak(current);
      const cards = { ...bumped.cards };
      for (const { cardId, correct } of uitslagen) {
        const card = opId.get(cardId);
        if (card) cards[cardId] = review(card.schedule, correct ? 1 : 0);
      }
      return { ...bumped, answers: bumped.answers + uitslagen.length, cards };
    });

    const goed = uitslagen.filter((u) => u.correct).length;
    setTally((current) => ({
      good: current.good + goed,
      bad: current.bad + (uitslagen.length - goed),
    }));
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
      ) : step.kind === "koppel" ? (
        <div key={`koppel-${index}`} className="rise">
          <KoppelOefening
            cards={step.cards}
            speechLang={pack.speechLang}
            speak={speak}
            onDone={gradeKoppel}
          />
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

      {"card" in step && (
        <div className="mt-8 flex items-center gap-2 text-xs text-ink-faint">
          <Tile level={mastery(step.card.schedule)} size={16} />
          {step.card.deckTitle}
        </div>
      )}
    </Page>
  );
}

/**
 * De vragenrij samenstellen.
 *
 * Nieuwe woorden krijgen eerst een introkaartje en daarna een makkelijke
 * vraag. Voor de rest kiest `pickKind` een vorm, en die krijgt de vorige mee
 * zodat je niet drie keer achter elkaar hetzelfde krijgt.
 *
 * Halverwege komt er een koppelronde tussendoor, met woorden die je in deze
 * sessie al bent tegengekomen. Dat is bewust: koppelen werkt als je de woorden
 * net gezien hebt, en het breekt de rij vraag-antwoord-vraag-antwoord open.
 */
function bouwSessie(kaarten: StudyCard[]): Step[] {
  const steps: Step[] = [];
  let vorige: VocabKind | undefined;

  for (const card of kaarten) {
    if (card.schedule.reps === 0) {
      steps.push({ kind: "intro", card }, { kind: "recognize", card });
      vorige = "recognize";
      continue;
    }
    const kind = pickKind(card, vorige);
    steps.push({ kind, card });
    vorige = kind;
  }

  // Alleen als er genoeg woorden zijn om echt te koppelen; met drie is het
  // laatste paar geen keuze meer maar wat er overblijft.
  if (kaarten.length >= KOPPEL_AANTAL) {
    const plek = Math.min(KOPPEL_NA, steps.length);
    const eerder = steps.slice(0, plek).map((step) => ("card" in step ? step.card : null));
    const gezien = [...new Map(eerder.filter(Boolean).map((c) => [c!.id, c!])).values()];
    const aanvulling = kaarten.filter((card) => !gezien.some((c) => c.id === card.id));
    const mee = [...gezien, ...aanvulling].slice(0, KOPPEL_AANTAL);
    if (mee.length === KOPPEL_AANTAL) {
      steps.splice(plek, 0, { kind: "koppel", cards: shuffle(mee) });
    }
  }

  return steps;
}

/**
 * Foute antwoordopties, liefst uit dezelfde lijst en anders van elders —
 * woorden uit hetzelfde thema lijken meer op elkaar, en dan is kiezen echt
 * kiezen in plaats van de vreemde eend aanwijzen.
 */
function distractorsFor(card: StudyCard, all: StudyCard[]) {
  const sameDeck = all.filter((other) => other.deckId === card.deckId && other.id !== card.id);
  const rest = all.filter((other) => other.deckId !== card.deckId);
  const pool = [...shuffle(sameDeck), ...shuffle(rest)];

  const kies = (veld: (card: StudyCard) => string) => {
    const gezien = new Set([veld(card)]);
    const uit: string[] = [];
    for (const other of pool) {
      if (uit.length >= 3) break;
      const waarde = veld(other);
      if (gezien.has(waarde)) continue;
      gezien.add(waarde);
      uit.push(waarde);
    }
    return uit;
  };

  return {
    betekenissen: kies((c) => c.word.translation),
    woorden: kies((c) => c.word.term),
  };
}
