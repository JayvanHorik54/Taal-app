/**
 * Toegang tot de AI-functies.
 *
 * Vroeger was dit één gedeelde code die je bij Charla invulde. Sinds er
 * profielen zijn is aanmelden zelf de drempel: wie een sessie heeft mag
 * praten, wie er geen heeft niet. Dat scheelt je moeder een tweede code, en
 * het maakt zichtbaar wie er op je API-tegoed zit.
 *
 * Wat overblijft is de uitnodigingscode. Die heb je één keer nodig om een
 * profiel áán te maken — anders kan iedereen die het adres vindt er zelf een
 * openen en gaan praten. Staat hij niet ingesteld (zoals lokaal), dan mag
 * iedereen een profiel maken.
 */

export const OUDE_OPSLAG_SLEUTEL = "azulejo:toegangscode";

/** Server: mag hier een profiel bij? */
export function uitnodigingKlopt(gegeven: string | undefined): boolean {
  const verwacht = process.env.UITNODIGINGSCODE ?? process.env.TOEGANGSCODE;
  if (!verwacht) return true;
  return gegeven?.trim() === verwacht;
}

export const uitnodigingVereist = () =>
  Boolean(process.env.UITNODIGINGSCODE ?? process.env.TOEGANGSCODE);

/* ── clientkant ─────────────────────────────────────────── */

/** Wordt gegooid als de server je niet (meer) herkent. */
export class ToegangGeweigerd extends Error {}

/**
 * Roept een route aan die een sessie vereist. Het sessiekoekje gaat vanzelf
 * mee — het is httpOnly, dus de browser regelt dat en JavaScript komt er niet
 * bij. Bij een 401 gooit dit ToegangGeweigerd, zodat de pagina naar het
 * aanmeldscherm kan wijzen.
 */
export async function aiFetch<T>(pad: string, body: unknown): Promise<T> {
  const response = await fetch(pad, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.status === 401) throw new ToegangGeweigerd();

  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Er ging iets mis.");
  return data;
}
