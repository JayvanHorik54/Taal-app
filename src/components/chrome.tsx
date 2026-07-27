"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Tile } from "./tiles";
import { TekstKnop } from "./tekstgrootte";

const TABS = [
  { href: "/", label: "Muur" },
  { href: "/woorden", label: "Woorden" },
  { href: "/grammatica", label: "Regels" },
  { href: "/spelen", label: "Spelen" },
] as const;

/**
 * Kop en tabs zitten in één sticky blok: op een telefoon blijven de vier
 * tabbladen zo altijd bereikbaar, ook halverwege een lange muur.
 */
export function Header() {
  const { progress, ready, account, sync, signOut } = useStore();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-shell/90 backdrop-blur">
      <a href="#hoofdinhoud" className="skip-link">
        Naar de inhoud
      </a>
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Tile level={3} size={22} />
          {/* Verdwijnt bij de grootste letterstand op een smal scherm — zie
              de regel in globals.css. */}
          <span className="woordmerk display text-lg tracking-tight">azulejo</span>
          <span className="sr-only">naar de muur</span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
          {sync === "offline" && (
            <span
              title="Nog niet opgeslagen op de server. Zodra je weer verbinding hebt gaat het alsnog mee."
              className="rounded-md bg-accent-soft px-2 py-1 font-semibold text-accent"
            >
              offline
            </span>
          )}
          <span className="rounded-md border border-line-strong bg-surface px-2 py-1 font-semibold text-brand">
            {ready ? progress.level : "—"}
          </span>
          <TekstKnop />
          {ready && progress.streak > 0 && (
            <span
              className="rounded-md bg-accent-soft px-2 py-1 font-semibold text-accent"
              title={`${progress.streak} ${progress.streak === 1 ? "dag" : "dagen"} op rij`}
            >
              {/* Het woord "dagen" alleen als het past: op een smal scherm telt
                  elke millimeter in deze rij. Een schermlezer krijgt hoe dan ook
                  de hele zin, dus het zichtbare deel gaat voor hem verborgen —
                  anders hoor je "2 dagen dagen op rij". */}
              <span aria-hidden>
                {progress.streak}
                <span className="hidden sm:inline">
                  {" "}
                  {progress.streak === 1 ? "dag" : "dagen"}
                </span>
              </span>
              <span className="sr-only">
                {progress.streak} {progress.streak === 1 ? "dag" : "dagen"} op rij
              </span>
            </span>
          )}
          {account && (
            // Op een telefoon blijft alleen de rondel over. Met de tekst erbij
            // wipt deze rij bij de grootste letterstand naar twee regels, en
            // dan neemt de vaste kop een vijfde van het scherm in beslag.
            <button
              onClick={() => void signOut()}
              aria-label={`Aangemeld als ${account.naam} — afmelden`}
              title={`Aangemeld als ${account.naam} — klik om af te melden`}
              className="flex items-center gap-1.5 rounded-md border border-line-strong bg-surface px-1.5 py-1 font-semibold text-ink-soft transition-colors hover:border-brand-mid hover:text-ink sm:px-2"
            >
              <span
                aria-hidden
                className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] text-on-brand"
              >
                {account.naam.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-20 truncate sm:inline">{account.naam}</span>
            </button>
          )}
        </div>
      </div>

      <nav className="mx-auto flex max-w-3xl gap-1 px-2 pb-2 sm:px-4">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 rounded-lg px-2 py-2 text-center text-sm font-semibold transition-colors ${
                active ? "bg-brand text-on-brand" : "text-ink-soft hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

/** Smalle kop voor volledige-schermweergaven zoals een sessie of examen. */
export function TaskBar({
  title,
  right,
  onQuit,
  quitLabel = "Stoppen",
}: {
  title: string;
  right?: React.ReactNode;
  onQuit?: () => void;
  quitLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <span className="eyebrow">{title}</span>
      <div className="flex items-center gap-3">
        {right}
        {onQuit && (
          <button className="btn btn-ghost px-3 py-1.5 text-xs" onClick={onQuit}>
            {quitLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <main id="hoofdinhoud" className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 sm:py-8">
      {children}
    </main>
  );
}

/** Voortgangsbalk die een schermlezer ook echt kan voorlezen. */
export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  return (
    <div
      className="mb-7 h-1.5 overflow-hidden rounded-full bg-line"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-brand transition-all duration-300"
        style={{ width: `${max ? (value / max) * 100 : 0}%` }}
      />
    </div>
  );
}

/**
 * De sessie is verlopen midden in een AI-functie. Eén knop die je terugzet op
 * het aanmeldscherm is hier meer waard dan een uitleg: opnieuw je pincode
 * invullen is het enige wat helpt, en je voortgang staat allang veilig.
 */
export function OpnieuwAanmelden({ wat }: { wat: string }) {
  const { signOut } = useStore();
  return (
    <p className="mt-3 text-sm text-bad">
      Je bent niet meer aangemeld, dus {wat} kan even niet.{" "}
      <button onClick={() => void signOut()} className="underline underline-offset-2">
        Meld je opnieuw aan
      </button>
      .
    </p>
  );
}

export function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-sm text-ink-faint">
      Muur laden…
    </div>
  );
}
