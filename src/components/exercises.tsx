"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GrammarExercise } from "@/content/types";
import { judge, normalize, type Verdict } from "@/lib/answer";
import { useListening, type Tempo } from "@/lib/speech";
import { shuffle } from "@/lib/willekeur";
import { TYPEVORMEN, blankOut, type VocabKind } from "@/lib/vraagvorm";
import type { StudyCard } from "@/lib/progress";

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

/**
 * Vier antwoorden om uit te kiezen. Na je keuze blijft het juiste antwoord
 * groen staan — ook als je het fout had. Zien wat het wél was, direct naast
 * wat je koos, is waar je van leert.
 */
export function Keuzes({
  opties,
  antwoord,
  gekozen,
  beslist,
  lang,
  onKies,
}: {
  opties: string[];
  antwoord: string;
  gekozen: string | null;
  beslist: boolean;
  lang?: string;
  onKies: (keuze: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {opties.map((optie) => {
        const isAntwoord = optie === antwoord;
        const isGekozen = beslist && optie === gekozen;
        return (
          <button
            key={optie}
            lang={lang}
            disabled={beslist}
            onClick={() => onKies(optie)}
            className={`rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${
              !beslist
                ? "border-line-strong bg-surface hover:border-brand-mid hover:bg-brand-soft"
                : isAntwoord
                  ? "border-ok bg-ok-soft"
                  : isGekozen
                    ? "border-bad bg-bad-soft"
                    : "border-line bg-surface opacity-60"
            }`}
          >
            {optie}
          </button>
        );
      })}
    </div>
  );
}

/**
 * De zin bouwen uit losse woorden.
 *
 * Dit is de enige vraagvorm die naar woordvolgorde kijkt, en de enige die de
 * Nederlandse voorbeeldzin gebruikt — die stond tot nu toe in de content
 * zonder dat er ooit een vraag over ging.
 *
 * Aantikken in plaats van typen is hier bewust: een hele zin uitschrijven
 * struikelt over één accent of komma, terwijl het je om de volgorde te doen
 * is. Zo blijft het ook op een telefoon te doen.
 */
function ZinBouwen({
  zin,
  vertaling,
  lang,
  beslist,
  onKlaar,
}: {
  zin: string;
  vertaling: string;
  lang: string;
  beslist: boolean;
  onKlaar: (gebouwd: string) => void;
}) {
  const woorden = useMemo(() => zin.trim().split(/\s+/).filter(Boolean), [zin]);
  // Husselen op index, niet op woord: een zin mag hetzelfde woord twee keer
  // bevatten, en dan moeten het twee losse knopjes blijven.
  const volgorde = useMemo(() => shuffle(woorden.map((_, i) => i)), [woorden]);
  const [gelegd, setGelegd] = useState<number[]>([]);

  const over = volgorde.filter((i) => !gelegd.includes(i));
  const gebouwd = gelegd.map((i) => woorden[i]).join(" ");
  const compleet = gelegd.length === woorden.length;

  return (
    <div className="space-y-4">
      <Prompt label="maak hier de zin van">
        <p className="display text-2xl leading-snug">{vertaling}</p>
      </Prompt>

      {/* De regel waar de zin ontstaat. Hij houdt zijn hoogte ook als hij leeg
          is, zodat de knoppen eronder niet verspringen bij het eerste woord. */}
      <div
        className="flex min-h-16 flex-wrap content-start gap-2 rounded-xl border border-line-strong bg-surface-2 p-3"
        aria-label="jouw zin"
      >
        {gelegd.length === 0 && (
          <span className="self-center text-sm text-ink-faint">
            Tik de woorden aan in de goede volgorde
          </span>
        )}
        {gelegd.map((i, plek) => (
          <button
            key={`${i}-${plek}`}
            lang={lang}
            disabled={beslist}
            onClick={() => setGelegd(gelegd.filter((_, p) => p !== plek))}
            className="rounded-lg border border-brand-mid bg-brand-soft px-3 py-1.5 text-[15px] transition-colors hover:border-brand disabled:opacity-70"
          >
            {woorden[i]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {over.map((i) => (
          <button
            key={i}
            lang={lang}
            disabled={beslist}
            onClick={() => setGelegd([...gelegd, i])}
            className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-[15px] transition-colors hover:border-brand-mid hover:bg-brand-soft"
          >
            {woorden[i]}
          </button>
        ))}
      </div>

      {!beslist && (
        <button
          className="btn btn-primary w-full"
          disabled={!compleet}
          onClick={() => onKlaar(gebouwd)}
        >
          Nakijken
        </button>
      )}
    </div>
  );
}

/* ── woordvraag ─────────────────────────────────────────── */

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
  /** Foute opties: betekenissen voor de ene keuzevorm, doelwoorden voor de andere. */
  distractors: { betekenissen: string[]; woorden: string[] };
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

  /** Bij welke vormen kies je een betekenis, en bij welke een doelwoord? */
  const kiestBetekenis = kind === "recognize" || kind === "listen-choice";
  const kiestWoord = kind === "produce-choice";

  const choices = useMemo(() => {
    const antwoord = kiestWoord ? term : translation;
    const fout = kiestWoord ? distractors.woorden : distractors.betekenissen;
    if (!kiestBetekenis && !kiestWoord) return [];
    return shuffle([antwoord, ...fout.slice(0, 3)]);
  }, [kiestBetekenis, kiestWoord, term, translation, distractors]);

  const cloze = useMemo(
    () => (exampleTarget ? blankOut(exampleTarget, term) : null),
    [exampleTarget, term]
  );

  // Bij luisteren begint de vraag met geluid, niet met tekst.
  useEffect(() => {
    if ((kind === "listen" || kind === "listen-choice") && !spokenOnce.current) {
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

  // Waar de feedback naar wijst verschilt per vorm: bij de zinbouwer is het
  // juiste antwoord de hele zin, niet het losse woord.
  const expected =
    kind === "build" && exampleTarget
      ? exampleTarget
      : kiestBetekenis
        ? translation
        : term;

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
          <Keuzes
            opties={choices}
            antwoord={translation}
            gekozen={typed || null}
            beslist={verdict !== null}
            onKies={(keuze) => {
              setTyped(keuze);
              settle({ correct: keuze === translation });
            }}
          />
        </>
      )}

      {kind === "produce-choice" && (
        <>
          {/* Ander opschrift dan bij "recall", dat dezelfde vraag stelt maar je
              laat typen. Zo weet je aan de kop al of je kiest of zelf schrijft. */}
          <Prompt label="welk woord hoort hierbij?">
            <span className="display text-3xl">{translation}</span>
          </Prompt>
          <Keuzes
            opties={choices}
            antwoord={term}
            gekozen={typed || null}
            beslist={verdict !== null}
            lang={speechLang}
            onKies={(keuze) => {
              setTyped(keuze);
              settle({ correct: keuze === term });
            }}
          />
        </>
      )}

      {kind === "listen-choice" && (
        <>
          <Prompt label="wat hoor je?">
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
          <Keuzes
            opties={choices}
            antwoord={translation}
            gekozen={typed || null}
            beslist={verdict !== null}
            onKies={(keuze) => {
              setTyped(keuze);
              settle({ correct: keuze === translation });
            }}
          />
        </>
      )}

      {kind === "build" && exampleTarget && exampleNative && (
        <ZinBouwen
          zin={exampleTarget}
          vertaling={exampleNative}
          lang={speechLang}
          beslist={verdict !== null}
          onKlaar={(gebouwd) => {
            const goed = normalize(gebouwd) === normalize(exampleTarget);
            setTyped(gebouwd);
            settle({ correct: goed });
          }}
        />
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

      {/* De keuzevormen kijken meteen na bij het aanklikken, de zinbouwer heeft
          zijn eigen knop, en bij spreken doet de microfoon het werk. */}
      {verdict === null && TYPEVORMEN.includes(kind) && (
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

/* ── woordparen koppelen ────────────────────────────────── */

export type KoppelUitslag = { cardId: string; correct: boolean };

/**
 * Vijf woorden, vijf vertalingen, door elkaar. Koppel ze.
 *
 * Een heel ander ritme dan vraag-antwoord: je ziet alles tegelijk, je mag
 * beginnen bij wat je zeker weet, en de rest leid je af. Dat afleiden is
 * precies waarom het blijft hangen — en het is de enige oefening waarin
 * woorden náást elkaar staan, zodat je verschillen ziet die je bij één woord
 * per scherm mist.
 *
 * Fout gekoppeld telt voor dát woord als fout, ook als je het daarna alsnog
 * goed legt. Anders is het gokken tot het klopt.
 */
export function KoppelOefening({
  cards,
  speechLang,
  speak,
  onDone,
}: {
  cards: StudyCard[];
  speechLang: string;
  speak: (text: string, tempo?: Tempo) => void;
  onDone: (uitslagen: KoppelUitslag[]) => void;
}) {
  const vertalingen = useMemo(() => shuffle(cards), [cards]);

  const [gekozen, setGekozen] = useState<string | null>(null);
  const [gelegd, setGelegd] = useState<Set<string>>(new Set());
  const [mis, setMis] = useState<Set<string>>(new Set());
  // Kort oplichten na een misser, zodat je ziet wat er niet bij elkaar hoort.
  const [botsing, setBotsing] = useState<string | null>(null);

  const klaar = gelegd.size === cards.length;

  const kiesWoord = (id: string) => {
    if (gelegd.has(id)) return;
    setGekozen(gekozen === id ? null : id);
    setBotsing(null);
  };

  const kiesVertaling = (id: string) => {
    if (gelegd.has(id) || !gekozen) return;
    if (id === gekozen) {
      setGelegd(new Set(gelegd).add(id));
      setGekozen(null);
      const kaart = cards.find((c) => c.id === id);
      if (kaart) speak(kaart.word.term);
      return;
    }
    // Mis: allebei de kanten onthouden als fout, want je wist geen van beide.
    setMis(new Set(mis).add(gekozen).add(id));
    setBotsing(id);
    setGekozen(null);
    setTimeout(() => setBotsing(null), 600);
  };

  const knop = (actief: boolean, af: boolean, rood: boolean) =>
    `rounded-xl border px-3 py-3 text-left text-[15px] transition-colors ${
      af
        ? "border-ok bg-ok-soft text-ok"
        : rood
          ? "border-bad bg-bad-soft"
          : actief
            ? "border-brand bg-brand-soft"
            : "border-line-strong bg-surface hover:border-brand-mid hover:bg-brand-soft"
    }`;

  return (
    <div className="space-y-5">
      <Prompt label="koppel de woorden">
        <p className="text-sm text-ink-soft">
          Tik links een woord aan en daarna rechts de betekenis die erbij hoort.
        </p>
      </Prompt>

      <div className="grid grid-cols-2 gap-2">
        <div className="grid content-start gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              lang={speechLang}
              disabled={gelegd.has(card.id)}
              onClick={() => kiesWoord(card.id)}
              className={knop(gekozen === card.id, gelegd.has(card.id), false)}
            >
              {card.word.term}
            </button>
          ))}
        </div>
        <div className="grid content-start gap-2">
          {vertalingen.map((card) => (
            <button
              key={card.id}
              disabled={gelegd.has(card.id)}
              onClick={() => kiesVertaling(card.id)}
              className={knop(false, gelegd.has(card.id), botsing === card.id)}
            >
              {card.word.translation}
            </button>
          ))}
        </div>
      </div>

      {klaar && (
        <>
          <div role="status" className="rise rounded-xl bg-ok-soft p-4 text-sm text-ok">
            <p className="font-semibold">
              {mis.size === 0
                ? "Alles in één keer goed"
                : `Klaar — ${cards.length - mis.size} van de ${cards.length} in één keer goed`}
            </p>
          </div>
          <button
            className="btn btn-primary w-full"
            autoFocus
            onClick={() =>
              onDone(cards.map((card) => ({ cardId: card.id, correct: !mis.has(card.id) })))
            }
          >
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
