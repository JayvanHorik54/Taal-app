"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { Loading, OpnieuwAanmelden, Page, TaskBar } from "@/components/chrome";
import { SpeakButton, TypedAnswer } from "@/components/exercises";
import { buildCards, bumpStreak } from "@/lib/progress";
import { useListening, useVoice } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { ToegangGeweigerd, aiFetch } from "@/lib/toegang";

type Turn =
  | { who: "me"; text: string }
  | { who: "partner"; text: string; native: string; tip: string; suggestions: string[] };

export default function CharlaPage({ params }: { params: Promise<{ scenario: string }> }) {
  const { scenario: scenarioId } = use(params);
  const { ready, pack, progress, update } = useStore();
  const router = useRouter();
  const speak = useVoice(pack.speechLang);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [translated, setTranslated] = useState<Record<number, boolean>>({});
  // Wat de microfoon hoort belandt meteen in het invoerveld, zodat je het nog
  // kunt bijschaven voordat je het verstuurt.
  const listening = useListening(pack.speechLang, setDraft);
  const started = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  const scenario = pack.scenarios.find((item) => item.id === scenarioId);

  const send = async (text: string | null, history: Turn[]) => {
    setBusy(true);
    setError("");
    try {
      const data = await aiFetch<{
        target?: string;
        native?: string;
        tip?: string;
        suggestions?: string[];
      }>("/api/charla", {
        language: pack.code,
          scenarioId,
          level: progress.level,
          vocabulary: buildCards(pack, progress)
            .filter((card) => card.schedule.reps > 0)
            .slice(-20)
            .map((card) => card.word.term),
        history: history.map((turn) => ({
          role: turn.who === "me" ? "leerling" : "partner",
          text: turn.text,
        })),
      });
      if (!data.target) {
        setError("Er kwam geen antwoord. Probeer het nog een keer.");
        return;
      }
      setTurns([
        ...history,
        {
          who: "partner",
          text: data.target,
          native: data.native ?? "",
          tip: data.tip ?? "",
          suggestions: data.suggestions ?? [],
        },
      ]);
      speak(data.target);
      if (text) update((current) => bumpStreak(current));
    } catch (fout) {
      setError(
        fout instanceof ToegangGeweigerd
          ? "aanmelden"
          : fout instanceof Error
            ? fout.message
            : "Er kwam geen antwoord."
      );
    } finally {
      setBusy(false);
    }
  };

  const say = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const history: Turn[] = [...turns, { who: "me", text: trimmed }];
    setTurns(history);
    setDraft("");
    listening.clear();
    void send(trimmed, history);
  };

  // Het gesprek begint met een openingszin van de gesprekspartner.
  useEffect(() => {
    if (!ready || !scenario || started.current) return;
    started.current = true;
    void send(null, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, scenario]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  if (!ready) return <Loading />;

  if (!scenario)
    return (
      <Page>
        <h1 className="display text-3xl">Deze situatie bestaat niet</h1>
        <Link href="/spelen" className="btn btn-primary mt-5">
          Terug
        </Link>
      </Page>
    );

  const lastSuggestions =
    [...turns].reverse().find((turn) => turn.who === "partner")?.suggestions ?? [];

  return (
    <Page>
      <TaskBar title={scenario.title} onQuit={() => router.push("/spelen")} quitLabel="Klaar" />

      <div className="space-y-4">
        {turns.map((turn, i) =>
          turn.who === "me" ? (
            <div key={i} className="rise flex justify-end">
              <p
                lang={pack.speechLang}
                className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-[15px] text-on-brand"
              >
                {turn.text}
              </p>
            </div>
          ) : (
            <div key={i} className="rise max-w-[90%]">
              <div className="panel rounded-2xl rounded-bl-sm px-4 py-3">
                <p lang={pack.speechLang} className="text-[15px]">{turn.text}</p>
                <div className="mt-2 flex items-center gap-2">
                  <SpeakButton size="sm" onClick={() => speak(turn.text)} />
                  <button
                    className="text-xs text-ink-faint hover:text-ink-soft"
                    onClick={() => setTranslated((state) => ({ ...state, [i]: !state[i] }))}
                  >
                    {translated[i] ? "verberg vertaling" : "vertaling"}
                  </button>
                </div>
                {translated[i] && turn.native && (
                  <p className="mt-2 text-sm text-ink-soft">{turn.native}</p>
                )}
              </div>
              {turn.tip && (
                <p className="mt-2 rounded-xl bg-accent-soft px-3 py-2 text-sm">
                  <span className="mr-2 text-xs font-semibold tracking-wide text-accent uppercase">
                    tip
                  </span>
                  {turn.tip}
                </p>
              )}
            </div>
          )
        )}

        {busy && (
          <div className="panel max-w-[60%] rounded-2xl rounded-bl-sm px-4 py-3 text-ink-faint">
            <span className="inline-block animate-pulse">…</span>
          </div>
        )}
        <div ref={bottom} />
      </div>

      {error === "aanmelden" ? (
        <OpnieuwAanmelden wat="praten" />
      ) : (
        error && <p className="mt-4 text-sm text-bad">{error}</p>
      )}

      {lastSuggestions.length > 0 && !busy && (
        <div className="mt-5 flex flex-wrap gap-2">
          {lastSuggestions.map((suggestion, i) => (
            <button
              key={i}
              lang={pack.speechLang}
              className="chip"
              onClick={() => say(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-2">
        <TypedAnswer
          value={draft}
          onChange={setDraft}
          onSubmit={() => say(draft)}
          placeholder={`Schrijf in het ${pack.name}`}
          lang={pack.speechLang}
          specialChars={pack.specialChars}
          disabled={busy}
        />
        <div className="flex gap-2">
          {listening.supported && (
            <button
              className={`btn ${listening.state === "listening" ? "btn-secondary" : "btn-ghost"}`}
              onClick={listening.state === "listening" ? listening.stop : listening.start}
              disabled={busy}
            >
              {listening.state === "listening" ? "● Ik luister…" : "● Praat"}
            </button>
          )}
          <button className="btn btn-primary flex-1" disabled={!draft.trim() || busy} onClick={() => say(draft)}>
            Stuur
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        Nederlands mag ook — je krijgt het antwoord dan alsnog in het {pack.name} terug.
      </p>
    </Page>
  );
}
