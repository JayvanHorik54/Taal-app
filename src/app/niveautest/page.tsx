"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loading, Page, TaskBar } from "@/components/chrome";
import { Quiz, QuizReview, wordQuestion, type QuizQuestion, type QuizResult } from "@/components/quiz";
import { LEVELS, NEXT_LEVEL, type LanguagePack, type Level } from "@/content/types";
import {
  PLACEMENT_BLOCK,
  PLACEMENT_PASS,
  applyPlacement,
  buildCards,
  bumpStreak,
  type GradeEntry,
  type Progress,
} from "@/lib/progress";
import { cijfer } from "@/lib/srs";
import { useStore } from "@/lib/store";

export default function NiveautestPage() {
  const { ready } = useStore();
  if (!ready) return <Loading />;
  return <Niveautest />;
}

/** "A1, A2 en B1" in plaats van "A1 en A2 en B1". */
function opsomming(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Eén ronde per niveau: deels woorden herkennen, deels grammatica. Op B1 en
 * B2 bestaan nog geen woordenlijsten, dus daar is de ronde helemaal
 * grammatica — dat onderscheidt op die niveaus toch beter.
 */
function buildBlock(pack: LanguagePack, progress: Progress, level: Level): QuizQuestion[] {
  const grammar = shuffle(pack.placement.filter((item) => item.level === level)).map(
    (item): QuizQuestion => ({
      kind: "choice",
      label: "kies het juiste woord",
      prompt: item.prompt,
      options: item.options,
      answer: item.answer,
      source: `grammatica ${level}`,
      promptInTarget: true,
    })
  );

  const words = shuffle(buildCards(pack, progress).filter((card) => card.level === level))
    .slice(0, 3)
    .map(wordQuestion);

  const vragen = words.length
    ? [...words, ...grammar.slice(0, PLACEMENT_BLOCK - words.length)]
    : grammar.slice(0, PLACEMENT_BLOCK);

  return shuffle(vragen);
}

type Fase =
  | { soort: "uitleg" }
  | { soort: "ronde"; level: Level; vragen: QuizQuestion[] }
  | { soort: "uitslag"; level: Level; laatste: QuizResult[] };

function Niveautest() {
  const { pack, progress, update } = useStore();
  const router = useRouter();

  const [fase, setFase] = useState<Fase>({ soort: "uitleg" });
  const [gehaald, setGehaald] = useState<Level[]>([]);
  const [totaal, setTotaal] = useState({ goed: 0, vragen: 0 });
  // Woorden die je gedurende de héle test goed had — niet alleen in de ronde
  // waarin je strandde, want daar zitten vaak helemaal geen woorden in.
  const [goedeWoorden, setGoedeWoorden] = useState<Set<string>>(new Set());

  const start = (level: Level) =>
    setFase({ soort: "ronde", level, vragen: buildBlock(pack, progress, level) });

  const rondeKlaar = (level: Level, resultaten: QuizResult[]) => {
    const goed = resultaten.filter((r) => r.correct).length;
    const gelukt = goed >= PLACEMENT_PASS;
    const nu = gelukt ? [...gehaald, level] : gehaald;
    const somGoed = totaal.goed + goed;
    const somVragen = totaal.vragen + resultaten.length;

    const woorden = new Set(goedeWoorden);
    for (const r of resultaten) if (r.correct) woorden.add(r.question.answer);

    setGehaald(nu);
    setTotaal({ goed: somGoed, vragen: somVragen });
    setGoedeWoorden(woorden);

    const volgende = gelukt ? NEXT_LEVEL[level] : null;
    if (volgende) {
      start(volgende);
      return;
    }

    // Klaar: je begint op het niveau ná de hoogste ronde die je haalde.
    const hoogste = nu[nu.length - 1];
    const uitkomst: Level = hoogste ? (NEXT_LEVEL[hoogste] ?? "B2") : "A1";

    update((current) => {
      const bumped = bumpStreak(current);
      const grade: GradeEntry = {
        id: `niveautest-${Date.now()}`,
        kind: "toets",
        name: "Niveautest",
        score: somGoed,
        total: somVragen,
        cijfer: cijfer(somGoed, somVragen),
        date: Date.now(),
      };
      return {
        ...applyPlacement(pack, bumped, uitkomst, woorden),
        grades: [grade, ...bumped.grades].slice(0, 40),
      };
    });

    setFase({ soort: "uitslag", level: uitkomst, laatste: resultaten });
  };

  if (fase.soort === "uitleg")
    return (
      <Page>
        <TaskBar title="niveautest" onQuit={() => router.push("/")} quitLabel="Later" />
        <p className="eyebrow">waar sta je nu?</p>
        <h1 className="display mt-2 text-4xl">Laten we dat eerst uitzoeken</h1>
        <p className="mt-4 max-w-prose text-ink-soft">
          Ken je de taal al een beetje, dan is het zonde om je door honderden woorden te laten klikken
          die je allang kent. Deze test zoekt uit waar je begint.
        </p>

        <div className="panel mt-6 p-5 text-sm">
          <ul className="space-y-2 text-ink-soft">
            <li>· Rondes van {PLACEMENT_BLOCK} vragen, die steeds moeilijker worden.</li>
            <li>
              · Haal je er {PLACEMENT_PASS} of meer goed, dan ga je door naar de volgende ronde.
              Zo niet, dan stopt de test daar.
            </li>
            <li>· Je bent klaar na 6 tot {PLACEMENT_BLOCK * LEVELS.length} vragen.</li>
            <li>· Gokken mag — fout antwoorden kost je niets, het bepaalt alleen je startpunt.</li>
          </ul>
        </div>

        <button className="btn btn-primary mt-6 w-full" onClick={() => start("A1")} autoFocus>
          Begin de test
        </button>
        <Link href="/" className="btn btn-ghost mt-3 w-full">
          Ik begin liever bij nul
        </Link>
      </Page>
    );

  if (fase.soort === "ronde") {
    const nummer = LEVELS.indexOf(fase.level) + 1;
    return (
      <Page>
        <TaskBar
          title={`ronde ${nummer} van ${LEVELS.length} · ${fase.level}`}
          onQuit={() => router.push("/")}
        />
        <Quiz
          key={fase.level}
          questions={fase.vragen}
          articles={pack.articles}
          speechLang={pack.speechLang}
          specialChars={pack.specialChars}
          onFinish={(resultaten) => rondeKlaar(fase.level, resultaten)}
        />
      </Page>
    );
  }

  const geenContent = !pack.decks.some((deck) => deck.level === fase.level);

  return (
    <Page>
      <TaskBar title="niveautest" />
      <p className="eyebrow">je begint op</p>
      <h1 className="display mt-2 text-6xl">{fase.level}</h1>
      <p className="mt-4 max-w-prose text-ink-soft">
        {gehaald.length === 0
          ? "Je start helemaal bij het begin — precies waar deze app voor gemaakt is. Alles staat voor je klaar."
          : `Je hebt ${opsomming(gehaald)} gehaald. De woorden van die niveaus staan nu klaar als herhaling in plaats van als nieuw: je krijgt ze meteen als vraag, en wat je toch niet blijkt te kennen komt vanzelf terug.`}
      </p>

      {geenContent && (
        <div className="panel mt-5 border-accent/40 bg-accent-soft p-4 text-sm">
          <p className="font-semibold text-accent">Je zit boven wat er nu klaarstaat</p>
          <p className="mt-1 text-ink">
            Er zijn nog geen {fase.level}-woordenlijsten in de app. Maak er een aan onder Woorden,
            of blijf even op {LEVELS[Math.max(0, LEVELS.indexOf(fase.level) - 1)]} om je basis
            vast te zetten.
          </p>
        </div>
      )}

      <p className="mt-6 text-sm text-ink-faint">
        In totaal {totaal.goed} van de {totaal.vragen} goed.
      </p>

      <QuizReview results={fase.laatste} speechLang={pack.speechLang} />

      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/leren" className="btn btn-primary">
          Meteen beginnen
        </Link>
        <Link href="/" className="btn btn-secondary">
          Naar de muur
        </Link>
      </div>
    </Page>
  );
}
