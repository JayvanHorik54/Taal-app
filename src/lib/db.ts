import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * De database. Twee tabellen, meer heeft deze app niet nodig: wie er zijn, en
 * wat ze per taal hebben opgebouwd.
 *
 * De voortgang zelf blijft één JSON-blok. Dat is bewust: het model in
 * `progress.ts` verandert nog, en een kolom per veld zou betekenen dat elke
 * wijziging daar een migratie hier wordt. Er wordt nooit op gezocht of
 * gesorteerd — alleen opgehaald en weggeschreven, per profiel en taal.
 */

/**
 * Wat we van een databaseverbinding vragen: een tagsjabloon dat rijen
 * teruggeeft. Meer gebruikt deze app niet, en door het zo klein te houden kan
 * er in de tests een echte Postgres achter die niet die van Neon is.
 */
export type SqlUitvoerder = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...waarden: unknown[]
) => Promise<T[]>;

let verbinding: SqlUitvoerder | null = null;

export function db(): SqlUitvoerder {
  if (!verbinding) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new GeenDatabase("DATABASE_URL ontbreekt");
    verbinding = url.startsWith("pglite:")
      ? plaatselijkePostgres(url.slice("pglite:".length) || "./.pglite")
      : (neon(url) as unknown as SqlUitvoerder);
  }
  return verbinding;
}

/**
 * Ontwikkelen zonder cloud: `DATABASE_URL=pglite:./.pglite` draait een echte
 * Postgres (WebAssembly) in het serverproces, met de gegevens in een map. Zo
 * kun je de app compleet uitproberen zonder eerst een database aan te maken.
 *
 * Nadrukkelijk niet voor productie — het is één proces met een map ernaast, en
 * op Vercel overleeft die map de volgende uitrol niet.
 */
function plaatselijkePostgres(map: string): SqlUitvoerder {
  if (process.env.NODE_ENV === "production") {
    throw new GeenDatabase("pglite: is alleen voor lokaal ontwikkelen, niet voor productie");
  }

  // Los inladen zodat PGlite niet in de productiebundel belandt.
  const pakket = "@electric-sql/pglite";
  const database = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ pakket).then(
    ({ PGlite }: typeof import("@electric-sql/pglite")) => new PGlite(map)
  );

  return async (strings, ...waarden) => {
    const query = strings.reduce(
      (uit, deel, i) => uit + deel + (i < waarden.length ? `$${i + 1}` : ""),
      ""
    );
    const { rows } = await (await database).query(query, waarden);
    return rows as never[];
  };
}

/**
 * Alleen voor de tests: zet er een andere Postgres achter. De tests draaien
 * tegen PGlite — echt Postgres, in hetzelfde proces — zodat het schema en de
 * queries hieronder ook echt nagekeken worden en niet alleen de TypeScript.
 */
export function zetVerbindingVoorTest(uitvoerder: SqlUitvoerder | null) {
  verbinding = uitvoerder;
  schema = null;
}

/** De database is niet ingesteld — anders dan een query die stukloopt. */
export class GeenDatabase extends Error {}

/**
 * Waar je een ontbrekende variabele moet zetten verschilt per plek: lokaal in
 * `.env.local`, online bij je hostingpartij. Verkeerd advies kost hier zomaar
 * een half uur zoeken, dus dat onderscheid maken we.
 */
export const zetHem = (naam: string) =>
  process.env.NODE_ENV === "production"
    ? `Zet ${naam} in de omgevingsvariabelen van het project en rol daarna opnieuw uit — ` +
      "een bestaande uitrol pikt een nieuwe variabele niet vanzelf op."
    : `Zet ${naam} in .env.local en start de server opnieuw.`;

export const GEEN_DATABASE_ANTWOORD = () =>
  Response.json({ error: `Geen database ingesteld. ${zetHem("DATABASE_URL")}` }, { status: 503 });

/**
 * Het schema zet zichzelf klaar bij de eerste query na een koude start.
 *
 * Een los migratiecommando zou netter zijn, maar dit is een app die je met één
 * `vercel --prod` uitrolt en waar zes mensen op zitten. Een stap die je kunt
 * vergeten is hier een groter risico dan de ene extra query per koude start.
 */
let schema: Promise<void> | null = null;

export function zorgVoorSchema(): Promise<void> {
  schema ??= (async () => {
    const sql = db();
    await sql`
      create table if not exists profielen (
        id text primary key,
        naam text not null,
        naam_sleutel text not null unique,
        pin_hash text not null,
        mislukte_pogingen integer not null default 0,
        geblokkeerd_tot bigint,
        gemaakt_op timestamptz not null default now()
      )
    `;
    await sql`
      create table if not exists voortgang (
        profiel_id text not null references profielen(id) on delete cascade,
        taal text not null,
        data jsonb not null,
        bijgewerkt_op bigint not null,
        primary key (profiel_id, taal)
      )
    `;
  })().catch((fout) => {
    // Niet cachen wat mislukt is: een volgende aanroep mag het opnieuw proberen.
    schema = null;
    throw fout;
  });
  return schema;
}

/** Namen vergelijken zonder gedoe over hoofdletters en spaties. */
export const naamSleutel = (naam: string) => naam.trim().toLowerCase();
