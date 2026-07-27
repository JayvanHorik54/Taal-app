"use client";

import { Header, Loading } from "./chrome";
import { Aanmelden } from "./aanmelden";
import { Taalkeuze } from "./taalkeuze";
import { useStore } from "@/lib/store";

/**
 * Drie drempels, in deze volgorde: wie ben je, welke taal leer je, en dan pas
 * de app. Zonder profiel is er geen voortgang om bij te houden, en zonder taal
 * heeft de rest geen betekenis — welke woorden, welke leerlijn, welke stem.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, account, language } = useStore();

  if (!ready) return <Loading />;
  if (!account) return <Aanmelden />;
  if (!language) return <Taalkeuze />;

  return (
    <>
      <Header />
      {children}
    </>
  );
}
