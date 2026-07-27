import "server-only";
import { cookies } from "next/headers";
import { GELDIG_MS, leesToken, maakToken, type Sessie } from "./token.ts";

/**
 * Aanmelden levert één koekje op: het profiel-id met een handtekening
 * eromheen (zie `token.ts`). Geen sessietabel — er valt niets in te trekken
 * behalve de sessie zelf, en dat doet afmelden al.
 *
 * Het koekje is httpOnly, dus JavaScript in de pagina komt er niet bij. De
 * kopie van je naam die in localStorage staat is dan ook geen bewijs van wie
 * je bent; die is er alleen zodat het scherm meteen klopt.
 */

const KOEKJE = "azulejo_sessie";

export async function meldAan(profielId: string) {
  const jar = await cookies();
  jar.set(KOEKJE, maakToken(profielId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(GELDIG_MS / 1000),
  });
}

export async function meldAf() {
  const jar = await cookies();
  jar.delete(KOEKJE);
}

/** Wie is dit? Null als er geen geldige sessie is. */
export async function huidigeSessie(): Promise<Sessie | null> {
  const jar = await cookies();
  return leesToken(jar.get(KOEKJE)?.value);
}

export const NIET_AANGEMELD = () =>
  Response.json({ error: "aanmelden", message: "Je bent niet aangemeld." }, { status: 401 });
