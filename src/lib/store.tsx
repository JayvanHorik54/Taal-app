"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { LanguagePack } from "@/content/types";
import { getLanguage, languageList } from "@/content/registry";
import { emptyProgress, oudeProgressKey, progressKey, type Progress } from "./progress";
import { leesVoortgang, voegSamen } from "./samenvoegen";
import * as api from "./account";
import type { Account } from "./account";

/**
 * De toestand van de app: wie je bent, welke taal je leert, en wat je hebt
 * opgebouwd.
 *
 * De database is de waarheid, localStorage is de kopie. Die volgorde is
 * bewust omgedraaid ten opzichte van hoe je het meestal ziet: eerst wordt er
 * plaatselijk geschreven zodat het scherm meteen klopt, daarna gaat het naar
 * de server. Zo blijft de app werken in de metro, en wat je daar doet komt
 * bij de volgende verbinding alsnog binnen.
 *
 * Samenvoegen gebeurt aan beide kanten (zie `samenvoegen.ts`): de client voegt
 * zijn kopie bij wat de server stuurt, de server voegt dat weer bij wat hij al
 * had. Omdat die bewerking idempotent is, mag dat zo vaak als nodig.
 */

const SERVER_PROGRESS = emptyProgress("");

type Sync = "rustig" | "bezig" | "offline";

type Stand = {
  account: Account | null;
  /** Null zolang er nog geen taal gekozen is. */
  taal: string | null;
  voortgang: Progress;
  /** False tijdens serverweergave en hydratie — toon dan nog geen cijfers. */
  klaar: boolean;
  /**
   * False tot de server één keer geantwoord heeft (of onbereikbaar bleek).
   *
   * `klaar` zegt alleen dat de plaatselijke kopie gelezen is, en die kan leeg
   * zijn terwijl er op de server een half jaar voortgang staat — precies wat er
   * gebeurt op een nieuw apparaat. Schermen die hun werk in één keer opbouwen,
   * zoals de oefensessie, moeten hierop wachten. Anders stellen ze hun rij
   * samen uit een lege muur en zeggen ze dat er niets te doen is.
   */
  gesynct: boolean;
  sync: Sync;
};

const LEGE_STAND: Stand = {
  account: null,
  taal: null,
  voortgang: SERVER_PROGRESS,
  klaar: false,
  gesynct: false,
  sync: "rustig",
};

let stand: Stand = LEGE_STAND;

const listeners = new Set<() => void>();
const snapshot = () => stand;
const serverSnapshot = (): Stand => LEGE_STAND;

function zet(deel: Partial<Stand>) {
  stand = { ...stand, ...deel };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ── plaatselijke opslag ────────────────────────────────── */

function leesTaal(profielId: string): string | null {
  try {
    const opgeslagen = window.localStorage.getItem(api.taalSleutel(profielId));
    if (opgeslagen && languageList().some((pack) => pack.code === opgeslagen)) return opgeslagen;
  } catch {
    // Privémodus of opslag geblokkeerd: dan kies je hem gewoon opnieuw.
  }
  return null;
}

function leesKopie(profielId: string, taal: string): Progress {
  try {
    const ruw = window.localStorage.getItem(progressKey(profielId, taal));
    return leesVoortgang(ruw ? JSON.parse(ruw) : null, taal);
  } catch {
    return emptyProgress(taal);
  }
}

function schrijfKopie(profielId: string, voortgang: Progress) {
  try {
    window.localStorage.setItem(
      progressKey(profielId, voortgang.language),
      JSON.stringify(voortgang)
    );
  } catch {
    // Opslag vol of geblokkeerd: de sessie loopt door en de server krijgt het wel.
  }
}

/** Voortgang van vóór de profielen, als die er nog staat. */
export function oudeVoortgang(taal: string): Progress | null {
  try {
    const ruw = window.localStorage.getItem(oudeProgressKey(taal));
    if (!ruw) return null;
    const voortgang = leesVoortgang(JSON.parse(ruw), taal);
    // Een lege oude stand is niets om over te nemen.
    return voortgang.answers > 0 || Object.keys(voortgang.cards).length > 0 ? voortgang : null;
  } catch {
    return null;
  }
}

function vergeetOudeVoortgang(taal: string) {
  try {
    window.localStorage.removeItem(oudeProgressKey(taal));
  } catch {
    // Dan blijft het aanbod staan. Niet fataal.
  }
}

/* ── naar de server ─────────────────────────────────────── */

let wachtend: ReturnType<typeof setTimeout> | null = null;
const UITSTEL_MS = 2_500;

/**
 * Opslaan gebeurt met uitstel: tijdens een oefensessie komt er elke paar
 * seconden een antwoord bij, en dat hoeft niet elk apart de deur uit. Wat er
 * nog openstaat gaat alsnog weg zodra je het tabblad verlaat.
 */
function planOpslag() {
  if (wachtend) clearTimeout(wachtend);
  wachtend = setTimeout(() => {
    wachtend = null;
    void duwNaarServer();
  }, UITSTEL_MS);
}

async function duwNaarServer() {
  const { account, taal, voortgang } = stand;
  if (!account || !taal) return;

  zet({ sync: "bezig" });
  try {
    const { voortgang: samen } = await api.zetVoortgang(taal, voortgang);
    // De server stuurt terug wat er ná samenvoegen staat: daar kan werk van
    // een ander apparaat in zitten dat wij nog niet hadden.
    schrijfKopie(account.id, samen);
    zet({ voortgang: samen, sync: "rustig" });
  } catch {
    // Geen verbinding of de server ligt eruit. De kopie staat er nog; bij de
    // volgende wijziging of het volgende bezoek gaat het alsnog mee.
    zet({ sync: "offline" });
  }
}

/** Wat nog niet weg is meteen versturen — bij het sluiten van het tabblad. */
export function spoelDirect() {
  if (!wachtend) return;
  clearTimeout(wachtend);
  wachtend = null;
  void duwNaarServer();
}

/**
 * Bij het openen van een taal: haal op wat de server heeft, leg het naast de
 * plaatselijke kopie, en stuur het verschil terug als wij meer wisten.
 */
async function haalOp(account: Account, taal: string) {
  const kopie = leesKopie(account.id, taal);
  zet({ voortgang: kopie, sync: "bezig", gesynct: false });

  try {
    const { voortgang: vanServer } = await api.haalVoortgang(taal);
    const samen = voegSamen(vanServer, kopie);
    schrijfKopie(account.id, samen);
    zet({ voortgang: samen, sync: "rustig", gesynct: true });

    // Stond er plaatselijk iets wat de server nog niet had, dan gaat dat nu mee.
    if (JSON.stringify(samen) !== JSON.stringify(vanServer)) await duwNaarServer();
  } catch {
    // Onbereikbaar telt ook als afgehandeld: met de kopie kun je verder, en
    // eindeloos blijven wachten zou de app in de metro onbruikbaar maken.
    zet({ sync: "offline", gesynct: true });
  }
}

/* ── acties ─────────────────────────────────────────────── */

export function kiesTaal(code: string) {
  const account = stand.account;
  if (!account) return;

  try {
    window.localStorage.setItem(api.taalSleutel(account.id), code);
  } catch {
    // Niet kunnen bewaren is vervelend, maar deze sessie werkt gewoon door.
  }

  zet({ taal: code, voortgang: leesKopie(account.id, code), gesynct: false });
  void haalOp(account, code);
}

function pasToe(fn: (huidig: Progress) => Progress) {
  const { account, taal } = stand;
  if (!account || !taal) return;

  const volgende = fn(stand.voortgang);
  schrijfKopie(account.id, volgende);
  zet({ voortgang: volgende });
  planOpslag();
}

/**
 * Voortgang wissen kan niet via de gewone weg: samenvoegen gaat maar één kant
 * op, dus een leeg blok opsturen zou meteen weer worden aangevuld met wat er
 * al stond. Wissen is daarom een eigen opdracht die de regel echt weggooit.
 */
async function wisAlles() {
  const { account, taal } = stand;
  if (!account || !taal) return;

  if (wachtend) {
    clearTimeout(wachtend);
    wachtend = null;
  }

  const leeg = emptyProgress(taal);
  schrijfKopie(account.id, leeg);
  zet({ voortgang: leeg, sync: "bezig" });

  try {
    await api.wisVoortgang(taal);
    zet({ sync: "rustig" });
  } catch {
    zet({ sync: "offline" });
  }
}

/** Na aanmelden of een nieuw profiel: de app opnieuw om dit profiel heen zetten. */
export function neemAccount(account: Account) {
  api.bewaarAccount(account);
  const taal = leesTaal(account.id);
  zet({
    account,
    taal,
    voortgang: taal ? leesKopie(account.id, taal) : SERVER_PROGRESS,
    klaar: true,
    // Zonder taal valt er niets op te halen, dus dan is er ook niets om op te wachten.
    gesynct: !taal,
  });
  if (taal) void haalOp(account, taal);
}

export async function meldAf() {
  spoelDirect();
  try {
    await api.meldAf();
  } catch {
    // Ook als de server onbereikbaar is: op dit apparaat ben je hoe dan ook weg.
  }
  api.bewaarAccount(null);
  zet({
    account: null,
    taal: null,
    voortgang: SERVER_PROGRESS,
    sync: "rustig",
    gesynct: true,
  });
}

/**
 * Bij het opstarten: toon meteen wat er plaatselijk bekend is, en laat de
 * server intussen bevestigen dat de sessie nog geldt. Blijkt die verlopen,
 * dan volgt het aanmeldscherm alsnog.
 */
async function start() {
  const bewaard = api.leesAccount();
  if (bewaard) {
    const taal = leesTaal(bewaard.id);
    zet({
      account: bewaard,
      taal,
      voortgang: taal ? leesKopie(bewaard.id, taal) : SERVER_PROGRESS,
      klaar: true,
      gesynct: !taal,
    });
  } else {
    zet({ klaar: true, gesynct: true });
  }

  try {
    const { profiel } = await api.haalIk();
    if (!profiel) {
      if (bewaard) {
        // De sessie is verlopen of het profiel bestaat niet meer.
        api.bewaarAccount(null);
        zet({ account: null, taal: null, voortgang: SERVER_PROGRESS, gesynct: true });
      }
      return;
    }
    if (!bewaard || bewaard.id !== profiel.id) neemAccount(profiel);
    else if (stand.taal) void haalOp(profiel, stand.taal);
  } catch {
    // Geen verbinding: doorwerken met wat er plaatselijk staat.
    zet({ sync: bewaard ? "offline" : "rustig", gesynct: true });
  }
}

let gestart = false;

/* ── context ────────────────────────────────────────────── */

type Store = {
  /** False tijdens serverweergave en hydratie — toon dan nog geen cijfers. */
  ready: boolean;
  /**
   * False tot de server één keer geantwoord heeft. Schermen die hun werk in
   * één keer opbouwen — de oefensessie, de toets, het examen — moeten hierop
   * wachten in plaats van op `ready`, anders bouwen ze op een lege muur.
   */
  synced: boolean;
  account: Account | null;
  /** Null zolang er nog geen taal gekozen is. */
  language: string | null;
  pack: LanguagePack;
  progress: Progress;
  sync: Sync;
  update: (fn: (current: Progress) => Progress) => void;
  reset: () => void;
  setLanguage: (code: string) => void;
  signIn: (account: Account) => void;
  signOut: () => Promise<void>;
  /** Voortgang van vóór de profielen die op dit apparaat is blijven staan. */
  takeOver: () => void;
};

const Ctx = createContext<Store | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const huidig = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  useEffect(() => {
    if (gestart) return;
    gestart = true;
    void start();
  }, []);

  // Wat nog niet opgeslagen is, gaat mee als het tabblad naar de achtergrond
  // verdwijnt. Op een telefoon is dat vaak het laatste moment dat je krijgt.
  useEffect(() => {
    const bijVerbergen = () => {
      if (document.visibilityState === "hidden") spoelDirect();
    };
    document.addEventListener("visibilitychange", bijVerbergen);
    window.addEventListener("pagehide", spoelDirect);
    return () => {
      document.removeEventListener("visibilitychange", bijVerbergen);
      window.removeEventListener("pagehide", spoelDirect);
    };
  }, []);

  const update = useCallback((fn: (current: Progress) => Progress) => pasToe(fn), []);
  const reset = useCallback(() => void wisAlles(), []);
  const setLanguage = useCallback((code: string) => kiesTaal(code), []);
  const signIn = useCallback((account: Account) => neemAccount(account), []);
  const signOut = useCallback(() => meldAf(), []);

  const takeOver = useCallback(() => {
    const taal = stand.taal;
    if (!taal) return;
    const oud = oudeVoortgang(taal);
    if (!oud) return;
    pasToe((huidige) => voegSamen(huidige, oud));
    vergeetOudeVoortgang(taal);
    spoelDirect();
  }, []);

  const value = useMemo<Store>(
    () => ({
      ready: huidig.klaar,
      synced: huidig.gesynct,
      account: huidig.account,
      language: huidig.taal,
      pack: getLanguage(huidig.taal ?? ""),
      progress: huidig.voortgang,
      sync: huidig.sync,
      update,
      reset,
      setLanguage,
      signIn,
      signOut,
      takeOver,
    }),
    [huidig, update, reset, setLanguage, signIn, signOut, takeOver]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore moet binnen ProgressProvider gebruikt worden");
  return ctx;
}
