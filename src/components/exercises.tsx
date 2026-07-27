"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GrammarExercise } from "@/content/types";
import { judge, type Verdict } from "@/lib/answer";
import { useListening, type Tempo } from "@/lib/speech";
import type { StudyCard } from "@/lib/progress";

export type VocabKind = "recognize" | "recall" | "listen" | "cloze" | "speak";

export type Outcome = { correct: boolean; note?: string };

/* ── bouwstenen ─────────────────────────────────────────── */

export function Prompt({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function SpeakButton({
  onClick,
  size = "md",
}: {
  onClick: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Spreek uit"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-brand transition-colors hover:bg-brand-soft ${
        size === "sm" ? "h-7 w-7 text-xs" : "h-10 w-10 text-base"
      }`}
    >
      ♪
    </button>
  );
}

/** Toetsenbordknoppen voor tekens die niet op een Nederlands toetsenbord staan. */
function SpecialChars({
  chars,
  onInsert,
}: {
  chars: string[];
  onInsert: (char: string) => void;
}) {
  if (!chars.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {chars.map((char) => (
        <button
          key={char}
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsert(char)}
          aria-label={`Voeg ${char} toe`}
          className="h-10 w-10 rounded-md border border-line-strong bg-surface text-base text-ink-soft transition-colors hover:border-brand-mid hover:text-ink"
        >
          {char}
        </button>
      ))}
    </div>
  );
}

export function TypedAnswer({
  value,
  onChange,
  onSubmit,
  placeholder,
  lang,
  specialChars,
  disabled,
  autoFocus = true,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  placeholder: string;
  lang?: string;
  specialChars: string[];
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && !disabled) ref.current?.focus();
  }, [autoFocus, disabled]);

  const insert = (char: string) => {
    const input = ref.current;
    if (!input) return onChange(value + char);
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    });
  };

  return (
    <div>
      <input
        ref={ref}
        className="field"
        value={value}
        lang={lang}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim() && !disabled) onSubmit();
        }}
      />
      {!disabled && <SpecialChars chars={specialChars} onInsert={insert} />}
    </div>
  );
}

export function Feedback({
  verdict,
  expected,
  extra,
}: {
  verdict: Verdict;
  expected: string;
  extra?: React.ReactNode;
}) {
  return (
    // role="status" laat een schermlezer de uitslag voorlezen zonder dat de
    // focus verspringt — je hoort of het goed was, ook zonder de kleur te zien.
    <div
      role="status"
      className={`rise rounded-xl border p-4 text-sm ${
        verdict.correct
          ? "border-transparent bg-ok-soft text-ok"
          : "border-transparent bg-bad-soft text-bad"
      }`}
    >
      <p className="font-semibold">
        {verdict.correct ? (verdict.note ? "Goed — bijna perfect" : "Goed") : "Niet helemaal"}
      </p>
      {!verdict.correct && (
        <p className="mt-1 text-ink">
          Het juiste antwoord is <b>{expected}</b>
        </p>
      )}
      {verdict.note && <p className="mt-1 text-ink">{verdict.note}</p>}
      {extra && <div className="mt-2 text-ink-soft">{extra}</div>}
    </div>
  );
}

/* ── woordvraag ─────────────────────────────────────────── */

export function blankOut(sentence: string, term: string): string | null {
  const core = term.split(" ").slice(-1)[0];
  const pattern = new RegExp(`(^|[^\\p{L}])(${escapeRegExp(core)})([^\\p{L}]|$)`, "iu");
  if (!pattern.test(sentence)) return null;
  return sentence.replace(pattern, (_m, before, _word, after) => `${before}_____${after}`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Welke vraagvorm past bij dit woord op dit moment? Hoe beter je een woord
 * kent, hoe meer er van je gevraagd wordt: eerst herkennen, dan schrijven,
 * dan verstaan, en uiteindelijk uitspreken.
 */
export function pickKind(card: StudyCard): VocabKind {
  const { reps } = card.schedule;
  const hasSentence = Boolean(
    card.word.exampleTarget && blankOut(card.word.exampleTarget, card.word.term)
  );
  const options: VocabKind[] = ["recall"];
  if (reps <= 1) options.push("recognize");
  if (reps >= 2) options.push("listen");
  if (reps >= 2 && hasSentence) options.push("cloze");
  if (reps >= 3) options.push("speak");
  return options[Math.floor(Math.random() * options.length)];
}

export function VocabExercise({
  card,
  kind,
  distractors,
  speechLang,
  specialChars,
  articles,
  speak,
  onDone,
}: {
  card: StudyCard;
  kind: VocabKind;
  distractors: string[];
  speechLang: string;
  specialChars: string[];
  articles: string[];
  speak: (text: string, tempo?: Tempo) => void;
  onDone: (outcome: Outcome) => void;
}) {
  const [typed, setTyped] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const spokenOnce = useRef(false);

  // Wat de microfoon hoort wordt meteen nagekeken — geen omweg via state.
  const listening = useListening(speechLang, (heard) => {
    if (kind === "speak") settle(judge(heard, card.word.term, articles));
  });

  const { term, translation, exampleTarget, exampleNative } = card.word;

  const choices = useMemo(() => {
    if (kind !== "recognize") return [];
    return [translation, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
  }, [kind, translation, distractors]);

  const cloze = useMemo(
    () => (exampleTarget ? blankOut(exampleTarget, term) : null),
    [exampleTarget, term]
  );

  // Bij luisteren begint de vraag met geluid, niet met tekst.
  useEffect(() => {
    if (kind === "listen" && !spokenOnce.current) {
      spokenOnce.current = true;
      const timer = setTimeout(() => speak(term), 250);
      return () => clearTimeout(timer);
    }
  }, [kind, term, speak]);

  function settle(next: Verdict) {
    if (verdict) return;
    setVerdict(next);
    if (!next.correct) speak(term);
  }

  const expected = kind === "recognize" ? translation : term;

  const finish = () => onDone({ correct: verdict!.correct, note: verdict?.note });

  return (
    <div className="space-y-5">
      {kind === "recognize" && (
        <>
          <Prompt label="wat betekent dit?">
            <div className="flex items-center gap-3">
              <span lang={speechLang} className="display text-3xl">{term}</span>
              <SpeakButton onClick={() => speak(term)} />
            </div>
          </Prompt>
          <div className="grid gap-2">
            {choices.map((choice) => {
              const chosen = verdict !== null && choice === typed;
              const isAnswer = choice === translation;
              return (
                <button
                  key={choice}
                  disabled={verdict !== null}
                  onClick={() => {
                    setTyped(choice);
                    settle({ correct: choice === translation });
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${
                    verdict === null
                      ? "border-line-strong bg-surface hover:border-brand-mid hover:bg-brand-soft"
                      : isAnswer
                        ? "border-ok bg-ok-soft"
                        : chosen
                          ? "border-bad bg-bad-soft"
                          : "border-line bg-surface opacity-60"
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </>
      )}

      {kind === "recall" && (
        <>
          <Prompt label="hoe zeg je dit?">
            <span className="display text-3xl">{translation}</span>
          </Prompt>
          <TypedAnswer
            value={typed}
            onChange={setTyped}
            onSubmit={() => settle(judge(typed, term, articles))}
            placeholder="Schrijf het woord"
            lang={speechLang}
            specialChars={specialChars}
            disabled={verdict !== null}
          />
        </>
      )}

      {kind === "listen" && (
        <>
          <Prompt label="luister en schrijf op">
            <button
              type="button"
              onClick={() => speak(term)}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-surface py-8 text-brand transition-colors hover:bg-brand-soft"
            >
              <span className="text-2xl">♪</span>
              <span className="text-sm font-semibold">Nog eens afspelen</span>
            </button>
            <button
              type="button"
              onClick={() => speak(term, "trager")}
              className="mt-2 w-full text-center text-xs text-ink-faint hover:text-ink-soft"
            >
              langzamer
            </button>
          </Prompt>
          <TypedAnswer
            value={typed}
            onChange={setTyped}
            onSubmit={() => settle(judge(typed, term, articles))}
            placeholder="Wat hoor je?"
            lang={speechLang}
            specialChars={specialChars}
            disabled={verdict !== null}
          />
        </>
      )}

      {kind === "cloze" && (
        <>
          <Prompt label="vul de zin aan">
            <p lang={speechLang} className="display text-2xl leading-snug">{cloze}</p>
            <p className="mt-2 text-sm text-ink-soft">{exampleNative}</p>
          </Prompt>
          <TypedAnswer
            value={typed}
            onChange={setTyped}
            onSubmit={() => settle(judge(typed, term, articles))}
            placeholder="Welk woord hoort hier?"
            lang={speechLang}
            specialChars={specialChars}
            disabled={verdict !== null}
          />
        </>
      )}

      {kind === "speak" && (
        <>
          <Prompt label="zeg het hardop">
            <span className="display text-3xl">{translation}</span>
          </Prompt>
          {verdict === null && (
            <div className="space-y-3">
              {listening.supported && (
                <button
                  type="button"
                  onClick={listening.state === "listening" ? listening.stop : listening.start}
                  className={`flex w-full items-center justify-center gap-3 rounded-xl border py-8 font-semibold transition-colors ${
                    listening.state === "listening"
                      ? "border-bad bg-bad-soft text-bad"
                      : "border-line-strong bg-surface text-brand hover:bg-brand-soft"
                  }`}
                >
                  <span className="text-2xl">●</span>
                  {listening.state === "listening"
                    ? "Ik luister — klik als je klaar bent"
                    : "Klik en spreek"}
                </button>
              )}
              {listening.state === "denied" && (
                <p className="text-xs text-bad">
                  Geen toegang tot de microfoon. Typ het antwoord dan maar.
                </p>
              )}
              {!listening.supported && (
                <p className="text-xs text-ink-faint">
                  Deze browser kan niet meeluisteren. Zeg het hardop en typ het daarna.
                </p>
              )}
              <TypedAnswer
                value={typed}
                onChange={setTyped}
                onSubmit={() => settle(judge(typed, term, articles))}
                placeholder="…of typ het"
                lang={speechLang}
                specialChars={specialChars}
                autoFocus={false}
              />
            </div>
          )}
          {verdict !== null && listening.transcript && (
            <p className="text-sm text-ink-soft">
              Ik hoorde: <b className="text-ink">{listening.transcript}</b>
            </p>
          )}
        </>
      )}

      {verdict === null && kind !== "recognize" && kind !== "speak" && (
        <button
          className="btn btn-primary w-full"
          disabled={!typed.trim()}
          onClick={() => settle(judge(typed, term, articles))}
        >
          Nakijken
        </button>
      )}

      {verdict !== null && (
        <>
          <Feedback
            verdict={verdict}
            expected={expected}
            extra={
              exampleTarget && (
                <span className="flex items-start gap-2">
                  <SpeakButton size="sm" onClick={() => speak(exampleTarget)} />
                  <span>
                    <i lang={speechLang}>{exampleTarget}</i>
                    <br />
                    {exampleNative}
                  </span>
                </span>
              )
            }
          />
          <button className="btn btn-primary w-full" onClick={finish} autoFocus>
            Verder
          </button>
        </>
      )}
    </div>
  );
}

/* ── grammaticavraag ────────────────────────────────────── */

export function GrammarExerciseView({
  exercise,
  pronouns,
  speechLang,
  specialChars,
  onDone,
}: {
  exercise: GrammarExercise;
  pronouns: string[];
  speechLang: string;
  specialChars: string[];
  onDone: (outcome: Outcome) => void;
}) {
  const [typed, setTyped] = useState("");
  const [table, setTable] = useState<string[]>(() =>
    exercise.type === "conjugate" ? exercise.answers.map(() => "") : []
  );
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const expected =
    exercise.type === "conjugate" ? exercise.answers.join(" · ") : exercise.answer;

  const check = () => {
    if (verdict) return;
    if (exercise.type === "conjugate") {
      const wrong = exercise.answers.filter((a, i) => !judge(table[i] ?? "", a).correct);
      setVerdict({ correct: wrong.length === 0 });
    } else {
      setVerdict(judge(typed, exercise.answer));
    }
  };

  return (
    <div className="space-y-5">
      {exercise.type === "conjugate" ? (
        <>
          <Prompt label={`vervoeg — ${exercise.tense}`}>
            <span lang={speechLang} className="display text-3xl">{exercise.verb}</span>
          </Prompt>
          <div className="grid gap-2 sm:grid-cols-2">
            {exercise.answers.map((answer, i) => {
              const ok = verdict ? judge(table[i] ?? "", answer).correct : null;
              return (
                <label key={i} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 text-right text-xs text-ink-faint">
                    {pronouns[i] ?? `vorm ${i + 1}`}
                  </span>
                  <input
                    className="field py-2 text-base"
                    style={
                      ok === null
                        ? undefined
                        : {
                            borderColor: ok ? "var(--ok)" : "var(--bad)",
                            background: ok ? "var(--ok-soft)" : "var(--bad-soft)",
                          }
                    }
                    value={table[i] ?? ""}
                    lang={speechLang}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={verdict !== null}
                    onChange={(e) =>
                      setTable((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && i === exercise.answers.length - 1) check();
                    }}
                  />
                  {verdict !== null && !ok && (
                    <span className="shrink-0 text-xs font-semibold text-ok">{answer}</span>
                  )}
                </label>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <Prompt
            label={
              exercise.type === "choice"
                ? "kies het juiste woord"
                : exercise.type === "transform"
                  ? "schrijf om"
                  : "vul in"
            }
          >
            <p lang={speechLang} className="display text-2xl leading-snug">{exercise.prompt}</p>
          </Prompt>

          {exercise.type === "choice" ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {exercise.options.map((option) => {
                const chosen = option === typed;
                const isAnswer = option === exercise.answer;
                return (
                  <button
                    key={option}
                    disabled={verdict !== null}
                    onClick={() => {
                      setTyped(option);
                      setVerdict({ correct: option === exercise.answer });
                    }}
                    className={`rounded-xl border px-4 py-3 text-center text-[15px] transition-colors ${
                      verdict === null
                        ? "border-line-strong bg-surface hover:border-brand-mid hover:bg-brand-soft"
                        : isAnswer
                          ? "border-ok bg-ok-soft"
                          : chosen
                            ? "border-bad bg-bad-soft"
                            : "border-line bg-surface opacity-60"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <TypedAnswer
              value={typed}
              onChange={setTyped}
              onSubmit={check}
              placeholder="Jouw antwoord"
              lang={speechLang}
              specialChars={specialChars}
              disabled={verdict !== null}
            />
          )}
        </>
      )}

      {verdict === null && exercise.type !== "choice" && (
        <button
          className="btn btn-primary w-full"
          disabled={exercise.type === "conjugate" ? table.every((v) => !v.trim()) : !typed.trim()}
          onClick={check}
        >
          Nakijken
        </button>
      )}

      {verdict !== null && (
        <>
          <Feedback verdict={verdict} expected={expected} extra={exercise.why} />
          <button
            className="btn btn-primary w-full"
            onClick={() => onDone({ correct: verdict.correct })}
            autoFocus
          >
            Verder
          </button>
        </>
      )}
    </div>
  );
}
