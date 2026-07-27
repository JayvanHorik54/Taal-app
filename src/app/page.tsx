"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loading, Page } from "@/components/chrome";
import { Greca, Tile } from "@/components/tiles";
import { LEVELS, NEXT_LEVEL } from "@/content/types";
import { buildCards, dueCards, newCards, readiness, topicMastery } from "@/lib/progress";
import { PASS, mastery } from "@/lib/srs";
import { oudeVoortgang, useStore } from "@/lib/store";
import { TaalWisselaar } from "@/components/taalkeuze";

const SESSION_SIZE = 12;

export default function Muur() {
  const { ready, pack, progress, reset, account, language, takeOver } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [overgenomen, setOvergenomen] = useState(false);

  // Voortgang van vóór de profielen. Die staat op dít apparaat en hoort bij
  // niemand in het bijzonder, dus we nemen hem niet stilletjes over — wie hem
  // opeist moet dat zelf zeggen.
  const teNemen = ready && language && !overgenomen ? oudeVoortgang(language) : null;

  const cards = useMemo(() => buildCards(pack, progress), [pack, progress]);
  const due = useMemo(() => dueCards(cards), [cards]);
  const fresh = useMemo(() => newCards(cards), [cards]);
  const settled = cards.filter((c) => mastery(c.schedule) === 3).length;

  const grades = progress.grades;
  const average = grades.length
    ? grades.reduce((sum, g) => sum + g.cijfer, 0) / grades.length
    : null;
  const grammarDone = pack.curriculum.filter(
    (t) => topicMastery(progress.grammar[t.id]) === 3
  ).length;

  if (!ready) return <Loading />;

  const level = progress.level;
  const state = readiness(pack, progress, level);
  const passedThisLevel = (progress.exams[level]?.cijfer ?? 0) >= PASS;

  return (
    <Page>
      <p className="eyebrow">jouw muur</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">
        {settled} {settled === 1 ? "tegel" : "tegels"} af,{" "}
        <span className="text-ink-soft">{cards.length - settled} in de maak</span>
      </h1>

      {teNemen && (
        <section className="panel mt-7 border-accent/40 bg-accent-soft p-5">
          <p className="eyebrow">van vóór de profielen</p>
          <h2 className="display mt-1 text-2xl">Er staat nog voortgang op dit apparaat</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {teNemen.answers} {teNemen.answers === 1 ? "antwoord" : "antwoorden"} en{" "}
            {Object.keys(teNemen.cards).length} woorden in behandeling, uit de tijd dat er nog geen
            profielen waren. Is dat van jou, {account?.naam}? Dan zetten we het bij jouw voortgang.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="btn btn-primary"
              onClick={() => {
                takeOver();
                setOvergenomen(true);
              }}
            >
              Ja, dat is van mij
            </button>
            <button className="btn btn-ghost" onClick={() => setOvergenomen(true)}>
              Niet nu
            </button>
          </div>
        </section>
      )}

      {/* Wie nog niets heeft gedaan krijgt eerst de vraag waar hij staat.
          Beginnen op A1 terwijl je de taal al deels kent is de snelste manier om
          af te haken. */}
      {progress.answers === 0 && progress.grades.length === 0 && !teNemen && (
        <section className="panel mt-7 border-brand/30 bg-brand-soft p-5">
          <p className="eyebrow">eerst even</p>
          <h2 className="display mt-1 text-2xl">Ken je al wat {pack.name}?</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Doe de niveautest — zes tot vierentwintig vragen — en de app begint op jouw niveau in
            plaats van bij nul.
          </p>
          <Link href="/niveautest" className="btn btn-primary mt-4">
            Doe de niveautest
          </Link>
        </section>
      )}

      <section className="panel mt-7 p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat value={due.length} label="te herhalen" />
          <Stat value={fresh.length} label="nog te leren" />
          <Stat value={progress.answers} label="antwoorden" />
        </div>
        <Link href="/leren" className="btn btn-primary mt-5 w-full">
          {due.length
            ? `Herhaal ${Math.min(due.length, SESSION_SIZE)} ${
                due.length === 1 ? "woord" : "woorden"
              }`
            : fresh.length
              ? "Leer nieuwe woorden"
              : "Vrij oefenen"}
        </Link>
        {!due.length && !fresh.length && (
          <p className="mt-3 text-center text-xs text-ink-faint">
            Alles herhaald. Vrij oefenen mag, maar de planning werkt het best als je wacht.
          </p>
        )}
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap gap-[3px]">
          {pack.curriculum.map((topic) => (
            <Link key={topic.id} href={`/grammatica/${topic.id}`} title={topic.title}>
              <Greca
                level={topicMastery(progress.grammar[topic.id])}
                size={24}
                label={topic.title}
              />
            </Link>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          de rand is grammatica — {grammarDone} van de {pack.curriculum.length} hoofdstukken
          beheerst
        </p>
      </section>

      <section className="mt-7">
        {/* Het tegelveld is decoratief: de kop hierboven zegt in woorden wat
            hier in kleur staat. Honderden tegels stuk voor stuk voorlezen
            helpt niemand. */}
        <div className="flex flex-wrap gap-[3px]">
          {cards.slice(0, 160).map((card) => (
            <div key={card.id} title={`${card.word.term} — ${card.word.translation}`}>
              <Tile level={mastery(card.schedule)} size={30} />
            </div>
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
          {([0, 1, 2, 3] as const).map((lv) => (
            <li key={lv} className="flex items-center gap-1.5">
              <Tile level={lv} size={14} />
              {["nieuw", "aan het leren", "in herhaling", "zit vast"][lv]}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">niveau</p>
          <Link href="/niveautest" className="text-xs text-brand underline underline-offset-2">
            niveautest opnieuw doen
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {LEVELS.map((rung) => {
            const done = (progress.exams[rung]?.cijfer ?? 0) >= PASS;
            const open = LEVELS.indexOf(rung) <= LEVELS.indexOf(level);
            return (
              <div
                key={rung}
                className={`rounded-xl border p-3 text-center ${
                  done
                    ? "border-brand bg-brand-soft"
                    : open
                      ? "border-line-strong bg-surface"
                      : "border-line bg-surface-2 opacity-60"
                }`}
              >
                <span className="display block text-xl">{rung}</span>
                <span className="text-[11px] text-ink-faint">
                  {done ? progress.exams[rung]!.cijfer.toFixed(1) : open ? "bezig" : "op slot"}
                </span>
              </div>
            );
          })}
        </div>

        {passedThisLevel && !NEXT_LEVEL[level] ? (
          <p className="mt-4 text-sm text-ink-soft">
            Je hebt alle niveaus gehaald. Blijf herhalen en praten om het vast te houden.
          </p>
        ) : (
          <div className="panel mt-4 p-5">
            <p className="text-sm font-semibold">Om het eindexamen {level} te mogen doen:</p>
            <ul className="mt-3 space-y-2 text-sm">
              <Requirement ok={state.wordsOk}>
                {state.words < 30
                  ? `Minstens 30 woorden op ${level} — je hebt er ${state.words}`
                  : `${state.known} van de ${state.words} woorden beheerst — nodig: ${state.needed}`}
              </Requirement>
              <Requirement ok={state.grammarOk}>
                {state.passed} van de {state.topics} grammaticahoofdstukken gehaald met 70% of meer
              </Requirement>
            </ul>
            {state.ok ? (
              <Link href={`/examen?level=${level}`} className="btn btn-primary mt-4 w-full">
                Doe het eindexamen {level}
              </Link>
            ) : (
              <button className="btn btn-primary mt-4 w-full" disabled>
                Nog niet klaar voor het examen
              </button>
            )}
            <p className="mt-3 text-xs text-ink-faint">
              Twintig vragen over woorden én grammatica. Een {PASS.toFixed(1)} of hoger opent{" "}
              {NEXT_LEVEL[level] ?? "het slot van de leerlijn"}.
              {passedThisLevel && " Je mag het opnieuw doen om je cijfer te verbeteren."}
            </p>
          </div>
        )}
      </section>

      {grades.length > 0 && (
        <section className="mt-8">
          <p className="eyebrow">cijferlijst</p>
          <div className="panel mt-3 p-5">
            <div className="flex items-baseline gap-2">
              <b className="display text-4xl">{average!.toFixed(1)}</b>
              <span className="text-sm text-ink-faint">
                gemiddeld over {grades.length} {grades.length === 1 ? "toets" : "toetsen"}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {grades.slice(0, 8).map((grade) => (
                <li key={grade.id} className="flex items-center gap-3 py-2 text-sm">
                  <span
                    className={`w-11 shrink-0 rounded-md px-1.5 py-0.5 text-center font-semibold ${
                      grade.cijfer >= 5.5 ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
                    }`}
                  >
                    {grade.cijfer.toFixed(1)}
                  </span>
                  <span className="flex-1 truncate">{grade.name}</span>
                  <span className="shrink-0 text-xs text-ink-faint">
                    {grade.score}/{grade.total} ·{" "}
                    {new Date(grade.date).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink-soft">Een andere taal leren?</span>
          <TaalWisselaar />
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Je voortgang in {pack.name} blijft gewoon staan.
        </p>
      </section>

      <section className="mt-8 mb-4">
        {!confirmReset ? (
          <button className="btn btn-ghost text-xs" onClick={() => setConfirmReset(true)}>
            Voortgang wissen
          </button>
        ) : (
          <div className="panel flex flex-wrap items-center gap-3 p-4 text-sm">
            <span className="flex-1">
              Alle voortgang in {pack.name} wissen, ook op de server? De woordenlijsten en lessen
              blijven staan, en je andere talen ook.
            </span>
            <button
              className="btn px-3 py-1.5 text-xs text-white"
              style={{ background: "var(--bad)" }}
              onClick={() => {
                reset();
                setConfirmReset(false);
              }}
            >
              Ja, wissen
            </button>
            <button
              className="btn btn-ghost px-3 py-1.5 text-xs"
              onClick={() => setConfirmReset(false)}
            >
              Nee
            </button>
          </div>
        )}
      </section>
    </Page>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <b className="display block text-3xl">{value}</b>
      <span className="text-xs text-ink-faint">{label}</span>
    </div>
  );
}

function Requirement({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex gap-2 ${ok ? "text-ok" : "text-ink-soft"}`}>
      <span aria-hidden className="font-semibold">
        {ok ? "✓" : "○"}
      </span>
      <span>{children}</span>
    </li>
  );
}
