"use client";

import type { Progress } from "./progress";

/**
 * De clientkant van het aanmelden. Losse functies, geen React — de store
 * hiernaast bouwt er de eigenlijke toestand mee op.
 *
 * Het profiel dat hier in localStorage staat is geen bewijs van wie je bent:
 * dat is het sessiekoekje, en dat is httpOnly en dus onzichtbaar voor
 * JavaScript. Deze kopie bestaat alleen zodat de app bij het openen meteen je
 * naam en je muur kan tonen in plaats van eerst een leeg scherm terwijl de
 * server het bevestigt.
 */

export type Account = { id: string; naam: string };

export const ACCOUNT_SLEUTEL = "azulejo:profiel";

/** De taalkeuze hangt aan het profiel: op één tablet leert de een Spaans en de ander Engels. */
export const taalSleutel = (profielId: string) => `azulejo:taal:${profielId}`;

export function leesAccount(): Account | null {
  try {
    const ruw = window.localStorage.getItem(ACCOUNT_SLEUTEL);
    if (!ruw) return null;
    const account = JSON.parse(ruw) as Partial<Account>;
    return account.id && account.naam ? { id: account.id, naam: account.naam } : null;
  } catch {
    return null;
  }
}

export function bewaarAccount(account: Account | null) {
  try {
    if (account) window.localStorage.setItem(ACCOUNT_SLEUTEL, JSON.stringify(account));
    else window.localStorage.removeItem(ACCOUNT_SLEUTEL);
  } catch {
    // Zonder opslag moet je elke keer opnieuw aanmelden. Vervelend, niet fataal.
  }
}

/* ── de routes ──────────────────────────────────────────── */

async function verstuur<T>(pad: string, opties: RequestInit = {}): Promise<T> {
  const response = await fetch(pad, {
    headers: { "Content-Type": "application/json" },
    ...opties,
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Er ging iets mis.");
  return data;
}

export const haalProfielen = () =>
  verstuur<{ profielen: Account[]; uitnodigingNodig: boolean }>("/api/profielen");

/** Bevestigt bij de server dat de sessie nog geldt. Null = niet (meer) aangemeld. */
export const haalIk = () => verstuur<{ profiel: Account | null }>("/api/aanmelden");

export const meldAan = (naam: string, pin: string) =>
  verstuur<{ profiel: Account }>("/api/aanmelden", {
    method: "POST",
    body: JSON.stringify({ naam, pin }),
  });

export const maakAccount = (naam: string, pin: string, uitnodiging: string) =>
  verstuur<{ profiel: Account }>("/api/profielen", {
    method: "POST",
    body: JSON.stringify({ naam, pin, uitnodiging }),
  });

export const meldAf = () => verstuur<{ ok: boolean }>("/api/afmelden", { method: "POST" });

/* ── voortgang ──────────────────────────────────────────── */

export const haalVoortgang = (taal: string) =>
  verstuur<{ voortgang: Progress }>(`/api/voortgang?taal=${encodeURIComponent(taal)}`);

export const zetVoortgang = (taal: string, voortgang: Progress) =>
  verstuur<{ voortgang: Progress }>("/api/voortgang", {
    method: "PUT",
    body: JSON.stringify({ taal, voortgang }),
  });

/** Wissen kan niet via opslaan: samenvoegen zou het meteen weer aanvullen. */
export const wisVoortgang = (taal: string) =>
  verstuur<{ ok: boolean }>(`/api/voortgang?taal=${encodeURIComponent(taal)}`, {
    method: "DELETE",
  });
