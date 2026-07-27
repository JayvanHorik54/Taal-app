import "server-only";
import { randomUUID } from "node:crypto";
import { db, naamSleutel, zorgVoorSchema } from "./db.ts";
import { hashPin, pinKlopt } from "./pincode.ts";
import { leesVoortgang, voegSamen } from "./samenvoegen.ts";
import { emptyProgress, type Progress } from "./progress.ts";

export type Profiel = { id: string; naam: string };

type Rij = {
  id: string;
  naam: string;
  pin_hash: string;
  mislukte_pogingen: number;
  geblokkeerd_tot: string | number | null;
};

/** Meer dan een huishouden hoeft dit niet te worden. */
export const MAX_PROFIELEN = 12;

/** Vijf misgrepen en het profiel gaat een kwartier op slot. */
const MAX_POGINGEN = 5;
const BLOKKADE_MS = 15 * 60 * 1000;

/* ── profielen ──────────────────────────────────────────── */

export async function alleProfielen(): Promise<Profiel[]> {
  await zorgVoorSchema();
  const rijen = (await db()`
    select id, naam from profielen order by gemaakt_op asc
  `) as Profiel[];
  return rijen;
}

export async function profielOpId(id: string): Promise<Profiel | null> {
  await zorgVoorSchema();
  const rijen = (await db()`
    select id, naam from profielen where id = ${id}
  `) as Profiel[];
  return rijen[0] ?? null;
}

export type MaakResultaat =
  | { ok: true; profiel: Profiel }
  | { ok: false; reden: "bezet" | "vol" };

export async function maakProfiel(naam: string, pin: string): Promise<MaakResultaat> {
  await zorgVoorSchema();
  const sql = db();

  const [{ aantal }] = (await sql`select count(*)::int as aantal from profielen`) as {
    aantal: number;
  }[];
  if (aantal >= MAX_PROFIELEN) return { ok: false, reden: "vol" };

  const id = randomUUID();
  const rijen = (await sql`
    insert into profielen (id, naam, naam_sleutel, pin_hash)
    values (${id}, ${naam.trim()}, ${naamSleutel(naam)}, ${await hashPin(pin)})
    on conflict (naam_sleutel) do nothing
    returning id, naam
  `) as Profiel[];

  // Niets terug betekent dat de naam al bestond.
  return rijen[0] ? { ok: true, profiel: rijen[0] } : { ok: false, reden: "bezet" };
}

export type AanmeldResultaat =
  | { ok: true; profiel: Profiel }
  | { ok: false; reden: "onbekend" | "mis" }
  | { ok: false; reden: "geblokkeerd"; totMs: number };

/**
 * De pincode nakijken.
 *
 * Vier cijfers zijn zo doorgeprobeerd, dus na vijf misgrepen gaat het profiel
 * een kwartier op slot. Dat is de eigenlijke beveiliging; de hash beschermt
 * alleen tegen iemand die de database al heeft.
 */
export async function meldAanMetPin(naam: string, pin: string): Promise<AanmeldResultaat> {
  await zorgVoorSchema();
  const sql = db();

  const rijen = (await sql`
    select id, naam, pin_hash, mislukte_pogingen, geblokkeerd_tot
    from profielen where naam_sleutel = ${naamSleutel(naam)}
  `) as Rij[];

  const rij = rijen[0];
  if (!rij) return { ok: false, reden: "onbekend" };

  const tot = rij.geblokkeerd_tot === null ? 0 : Number(rij.geblokkeerd_tot);
  if (tot > Date.now()) return { ok: false, reden: "geblokkeerd", totMs: tot };

  if (await pinKlopt(pin, rij.pin_hash)) {
    await sql`
      update profielen set mislukte_pogingen = 0, geblokkeerd_tot = null where id = ${rij.id}
    `;
    return { ok: true, profiel: { id: rij.id, naam: rij.naam } };
  }

  // Was de blokkade verlopen, dan begint het tellen opnieuw.
  const pogingen = (tot > 0 ? 0 : rij.mislukte_pogingen) + 1;
  const nieuweBlokkade = pogingen >= MAX_POGINGEN ? Date.now() + BLOKKADE_MS : null;
  await sql`
    update profielen
    set mislukte_pogingen = ${nieuweBlokkade ? 0 : pogingen},
        geblokkeerd_tot = ${nieuweBlokkade}
    where id = ${rij.id}
  `;

  return nieuweBlokkade
    ? { ok: false, reden: "geblokkeerd", totMs: nieuweBlokkade }
    : { ok: false, reden: "mis" };
}

/* ── voortgang ──────────────────────────────────────────── */

export async function haalVoortgang(profielId: string, taal: string): Promise<Progress> {
  await zorgVoorSchema();
  const rijen = (await db()`
    select data from voortgang where profiel_id = ${profielId} and taal = ${taal}
  `) as { data: unknown }[];
  return rijen[0] ? leesVoortgang(rijen[0].data, taal) : emptyProgress(taal);
}

/**
 * Opslaan is altijd samenvoegen met wat er al staat, nooit overschrijven.
 *
 * Dat gebeurt hier en niet bij de client, omdat alleen de server weet wat er
 * intussen van een ander apparaat binnenkwam. Twee telefoons die tegelijk
 * opslaan leveren zo geen verloren sessie op.
 */
export async function bewaarVoortgang(
  profielId: string,
  taal: string,
  binnengekomen: Progress
): Promise<Progress> {
  await zorgVoorSchema();
  const sql = db();

  const bestaand = await haalVoortgang(profielId, taal);
  const samen = voegSamen(bestaand, leesVoortgang(binnengekomen, taal));

  await sql`
    insert into voortgang (profiel_id, taal, data, bijgewerkt_op)
    values (${profielId}, ${taal}, ${JSON.stringify(samen)}::jsonb, ${Date.now()})
    on conflict (profiel_id, taal) do update
      set data = excluded.data, bijgewerkt_op = excluded.bijgewerkt_op
  `;

  return samen;
}

export async function wisVoortgang(profielId: string, taal: string): Promise<void> {
  await zorgVoorSchema();
  await db()`delete from voortgang where profiel_id = ${profielId} and taal = ${taal}`;
}
