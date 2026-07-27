"use client";

import { useEffect, useRef, useState } from "react";
import type { Account } from "@/lib/account";
import { haalProfielen, maakAccount, meldAan } from "@/lib/account";
import { useStore } from "@/lib/store";
import { Tile } from "./tiles";
import { TekstKeuze } from "./tekstgrootte";

/**
 * Het allereerste scherm: wie ben je?
 *
 * Je kiest je naam uit een rijtje en typt je pincode — zoals de profielkiezer
 * van een streamingdienst. Namen intypen zou veiliger lijken, maar de namen
 * beschermen niets: de pincode doet dat. En voor wie de app op een telefoon
 * met grote letters gebruikt is aantikken een stuk minder werk.
 */
export function Aanmelden() {
  const { signIn } = useStore();

  const [profielen, setProfielen] = useState<Account[] | null>(null);
  const [uitnodigingNodig, setUitnodigingNodig] = useState(false);
  const [ophaalfout, setOphaalfout] = useState<string | null>(null);
  const [nieuw, setNieuw] = useState(false);
  const [gekozen, setGekozen] = useState<Account | null>(null);

  useEffect(() => {
    let opgeruimd = false;
    haalProfielen()
      .then(({ profielen, uitnodigingNodig }) => {
        if (opgeruimd) return;
        setProfielen(profielen);
        setUitnodigingNodig(uitnodigingNodig);
        // Nog niemand: dan is een profiel maken het enige zinnige.
        if (profielen.length === 0) setNieuw(true);
      })
      .catch((fout: Error) => !opgeruimd && setOphaalfout(fout.message));
    return () => {
      opgeruimd = true;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-10">
      <div className="flex items-center gap-2">
        <Tile level={3} size={26} />
        <span className="display text-xl tracking-tight">azulejo</span>
      </div>

      {ophaalfout ? (
        <>
          <h1 className="display mt-8 text-3xl sm:text-4xl">Even geen verbinding</h1>
          <p className="mt-3 max-w-prose text-ink-soft">{ophaalfout}</p>
          <button className="btn btn-secondary mt-6 self-start" onClick={() => location.reload()}>
            Opnieuw proberen
          </button>
        </>
      ) : profielen === null ? (
        <p className="mt-8 text-sm text-ink-faint">Profielen laden…</p>
      ) : gekozen ? (
        <PinInvullen profiel={gekozen} onTerug={() => setGekozen(null)} onBinnen={signIn} />
      ) : nieuw ? (
        <NieuwProfiel
          uitnodigingNodig={uitnodigingNodig}
          eerste={profielen.length === 0}
          onTerug={profielen.length > 0 ? () => setNieuw(false) : undefined}
          onBinnen={signIn}
        />
      ) : (
        <>
          <h1 className="display mt-8 text-4xl sm:text-5xl">Wie leert er?</h1>
          <p className="mt-3 max-w-prose text-ink-soft">
            Iedereen houdt zijn eigen woorden, cijfers en streak bij. Je voortgang staat op de
            server, dus je kunt op je telefoon verder waar je op de tablet ophield.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {profielen.map((profiel) => (
              <button
                key={profiel.id}
                onClick={() => setGekozen(profiel)}
                className="panel flex items-center gap-4 p-5 text-left transition-colors hover:border-brand-mid hover:bg-brand-soft"
              >
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-semibold text-on-brand"
                >
                  {profiel.naam.slice(0, 1).toUpperCase()}
                </span>
                <span className="display text-2xl">{profiel.naam}</span>
              </button>
            ))}
          </div>

          <button className="btn btn-ghost mt-6 self-start" onClick={() => setNieuw(true)}>
            Nieuw profiel maken
          </button>

          <div className="mt-10 border-t border-line pt-6">
            <TekstKeuze />
          </div>
        </>
      )}
    </main>
  );
}

/* ── pincode invullen ───────────────────────────────────── */

function PinInvullen({
  profiel,
  onTerug,
  onBinnen,
}: {
  profiel: Account;
  onTerug: () => void;
  onBinnen: (account: Account) => void;
}) {
  const [pin, setPin] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const veld = useRef<HTMLInputElement>(null);

  useEffect(() => veld.current?.focus(), []);

  const versturen = async () => {
    if (!pin || bezig) return;
    setBezig(true);
    setFout(null);
    try {
      const { profiel: binnen } = await meldAan(profiel.naam, pin);
      onBinnen(binnen);
    } catch (probleem) {
      setFout((probleem as Error).message);
      setPin("");
      veld.current?.focus();
    } finally {
      setBezig(false);
    }
  };

  return (
    <>
      <h1 className="display mt-8 text-4xl">Hallo {profiel.naam}</h1>
      <p className="mt-3 text-ink-soft">Vul je pincode in.</p>

      <div className="panel mt-7 p-5">
        <label htmlFor="pin" className="text-sm font-semibold">
          Pincode
        </label>
        <input
          ref={veld}
          id="pin"
          className="field mt-2 text-center text-2xl tracking-[0.5em]"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 8));
            setFout(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && void versturen()}
        />
        {fout && (
          <p role="alert" className="mt-3 rounded-xl bg-bad-soft p-3 text-sm text-bad">
            {fout}
          </p>
        )}
        <button
          className="btn btn-primary mt-4 w-full"
          disabled={!pin || bezig}
          onClick={() => void versturen()}
        >
          {bezig ? "Even kijken…" : "Verder"}
        </button>
      </div>

      <button className="btn btn-ghost mt-6 self-start" onClick={onTerug}>
        Iemand anders
      </button>
    </>
  );
}

/* ── nieuw profiel ──────────────────────────────────────── */

function NieuwProfiel({
  uitnodigingNodig,
  eerste,
  onTerug,
  onBinnen,
}: {
  uitnodigingNodig: boolean;
  eerste: boolean;
  onTerug?: () => void;
  onBinnen: (account: Account) => void;
}) {
  const [naam, setNaam] = useState("");
  const [pin, setPin] = useState("");
  const [herhaal, setHerhaal] = useState("");
  const [uitnodiging, setUitnodiging] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const pinKort = pin.length < 4;
  const pinAnders = herhaal.length > 0 && pin !== herhaal;
  const kanVerder =
    naam.trim().length >= 2 && !pinKort && pin === herhaal && (!uitnodigingNodig || uitnodiging);

  const versturen = async () => {
    if (!kanVerder || bezig) return;
    setBezig(true);
    setFout(null);
    try {
      const { profiel } = await maakAccount(naam, pin, uitnodiging);
      onBinnen(profiel);
    } catch (probleem) {
      setFout((probleem as Error).message);
    } finally {
      setBezig(false);
    }
  };

  return (
    <>
      <h1 className="display mt-8 text-4xl">{eerste ? "Maak het eerste profiel" : "Nieuw profiel"}</h1>
      <p className="mt-3 max-w-prose text-ink-soft">
        Een voornaam en een pincode, meer is het niet. Geen e-mailadres, geen wachtwoord om te
        vergeten.
      </p>

      <div className="panel mt-7 space-y-4 p-5">
        <div>
          <label htmlFor="naam" className="text-sm font-semibold">
            Je naam
          </label>
          <input
            id="naam"
            className="field mt-2"
            value={naam}
            maxLength={24}
            autoComplete="given-name"
            placeholder="bijvoorbeeld Els"
            onChange={(e) => {
              setNaam(e.target.value);
              setFout(null);
            }}
          />
        </div>

        <div>
          <label htmlFor="nieuwe-pin" className="text-sm font-semibold">
            Pincode
          </label>
          <input
            id="nieuwe-pin"
            className="field mt-2 tracking-[0.4em]"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 8));
              setFout(null);
            }}
          />
          <p className="mt-2 text-xs text-ink-faint">
            Vier tot acht cijfers. Neem niet je pincode van de bank.
          </p>
        </div>

        <div>
          <label htmlFor="herhaal-pin" className="text-sm font-semibold">
            Nog een keer
          </label>
          <input
            id="herhaal-pin"
            className="field mt-2 tracking-[0.4em]"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            value={herhaal}
            onChange={(e) => setHerhaal(e.target.value.replace(/\D/g, "").slice(0, 8))}
            onKeyDown={(e) => e.key === "Enter" && void versturen()}
          />
          {pinAnders && <p className="mt-2 text-xs text-bad">De twee pincodes zijn niet gelijk.</p>}
        </div>

        {uitnodigingNodig && (
          <div>
            <label htmlFor="uitnodiging" className="text-sm font-semibold">
              Uitnodigingscode
            </label>
            <input
              id="uitnodiging"
              className="field mt-2"
              type="password"
              autoComplete="off"
              value={uitnodiging}
              onChange={(e) => {
                setUitnodiging(e.target.value);
                setFout(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && void versturen()}
            />
            <p className="mt-2 text-xs text-ink-faint">
              Die heb je gekregen van wie de app heeft opgezet. Je hebt hem alleen nu nodig.
            </p>
          </div>
        )}

        {fout && (
          <p role="alert" className="rounded-xl bg-bad-soft p-3 text-sm text-bad">
            {fout}
          </p>
        )}

        <button
          className="btn btn-primary w-full"
          disabled={!kanVerder || bezig}
          onClick={() => void versturen()}
        >
          {bezig ? "Bezig…" : "Beginnen"}
        </button>
      </div>

      {onTerug && (
        <button className="btn btn-ghost mt-6 self-start" onClick={onTerug}>
          Terug naar de profielen
        </button>
      )}
    </>
  );
}
