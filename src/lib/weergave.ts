"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tekstgrootte is een instelling van het apparaat, niet van de taal of van de
 * leerling. Wie hem groter zet wil dat overal groter — ook als hij van taal
 * wisselt of de voortgang wist.
 *
 * De schaal zit op de wortel van het document. Omdat het hele ontwerp in rem
 * werkt, groeien tekst én witruimte mee en blijft de verhouding kloppen.
 */

export const TEKST_SLEUTEL = "azulejo:tekstgrootte";

export const MATEN = [
  { code: "normaal", label: "Normaal", schaal: "100%" },
  { code: "groter", label: "Groter", schaal: "118%" },
  { code: "grootst", label: "Grootst", schaal: "138%" },
] as const;

export type Maat = (typeof MATEN)[number]["code"];

const isMaat = (waarde: string | null): waarde is Maat =>
  MATEN.some((maat) => maat.code === waarde);

let maat: Maat | null = null;
const listeners = new Set<() => void>();

function lees(): Maat {
  try {
    const opgeslagen = window.localStorage.getItem(TEKST_SLEUTEL);
    if (isMaat(opgeslagen)) return opgeslagen;
  } catch {
    // Geen opslag: dan is het deze sessie gewoon de standaard.
  }
  return "normaal";
}

function snapshot(): Maat {
  if (maat === null) maat = lees();
  return maat;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Zet de maat op het document; het losse script in de <head> doet dit ook bij het laden. */
export function pasToe(waarde: Maat) {
  document.documentElement.dataset.tekst = waarde;
}

export function zetMaat(waarde: Maat) {
  maat = waarde;
  pasToe(waarde);
  try {
    window.localStorage.setItem(TEKST_SLEUTEL, waarde);
  } catch {
    // Niet kunnen bewaren is jammer, maar deze sessie klopt wel.
  }
  for (const listener of listeners) listener();
}

const standaard = (): Maat => "normaal";

export function useTekstgrootte() {
  const huidig = useSyncExternalStore(subscribe, snapshot, standaard);
  const volgende = useCallback(() => {
    const index = MATEN.findIndex((m) => m.code === huidig);
    zetMaat(MATEN[(index + 1) % MATEN.length].code);
  }, [huidig]);
  return { maat: huidig, zetMaat, volgende };
}

/**
 * Draait vóór de eerste weergave, zodat de tekst niet eerst klein verschijnt
 * en dan opeens groter wordt. Juist voor wie deze instelling nodig heeft is
 * die sprong hinderlijk.
 */
export const VROEG_SCRIPT = `try{var m=localStorage.getItem("${TEKST_SLEUTEL}");if(m==="groter"||m==="grootst"){document.documentElement.dataset.tekst=m}}catch(e){}`;
