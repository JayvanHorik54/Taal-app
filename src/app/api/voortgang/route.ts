import { languageList } from "@/content/registry";
import { GEEN_DATABASE_ANTWOORD, GeenDatabase } from "@/lib/db";
import { bewaarVoortgang, haalVoortgang, wisVoortgang } from "@/lib/profielen";
import type { Progress } from "@/lib/progress";
import { huidigeSessie, NIET_AANGEMELD } from "@/lib/sessie";

const kentTaal = (code: string | null): code is string =>
  Boolean(code) && languageList().some((pack) => pack.code === code);

export async function GET(request: Request) {
  const sessie = await huidigeSessie();
  if (!sessie) return NIET_AANGEMELD();

  const taal = new URL(request.url).searchParams.get("taal");
  if (!kentTaal(taal)) return Response.json({ error: "Onbekende taal." }, { status: 400 });

  try {
    return Response.json({ voortgang: await haalVoortgang(sessie.profielId, taal) });
  } catch (fout) {
    if (fout instanceof GeenDatabase) return GEEN_DATABASE_ANTWOORD();
    console.error("voortgang ophalen mislukt", fout);
    return Response.json({ error: "Kon de voortgang niet ophalen." }, { status: 502 });
  }
}

/**
 * Opslaan geeft de samengevoegde stand terug, niet alleen "gelukt". De client
 * neemt die over, zodat wat er van een ander apparaat bij kwam meteen op het
 * scherm staat in plaats van pas na een herlaadbeurt.
 */
export async function PUT(request: Request) {
  const sessie = await huidigeSessie();
  if (!sessie) return NIET_AANGEMELD();

  const body = (await request.json().catch(() => ({}))) as {
    taal?: string;
    voortgang?: Progress;
  };

  const taal = body.taal ?? null;
  if (!kentTaal(taal)) return Response.json({ error: "Onbekende taal." }, { status: 400 });
  if (!body.voortgang) return Response.json({ error: "Geen voortgang meegestuurd." }, { status: 400 });

  try {
    const samen = await bewaarVoortgang(sessie.profielId, taal, body.voortgang);
    return Response.json({ voortgang: samen });
  } catch (fout) {
    if (fout instanceof GeenDatabase) return GEEN_DATABASE_ANTWOORD();
    console.error("voortgang opslaan mislukt", fout);
    return Response.json({ error: "Kon de voortgang niet opslaan." }, { status: 502 });
  }
}

/**
 * Voortgang wissen. Dit kan niet via PUT: opslaan is samenvoegen, en dan zou
 * een leeg blok meteen weer worden aangevuld met wat er al stond.
 */
export async function DELETE(request: Request) {
  const sessie = await huidigeSessie();
  if (!sessie) return NIET_AANGEMELD();

  const taal = new URL(request.url).searchParams.get("taal");
  if (!kentTaal(taal)) return Response.json({ error: "Onbekende taal." }, { status: 400 });

  try {
    await wisVoortgang(sessie.profielId, taal);
    return Response.json({ ok: true });
  } catch (fout) {
    if (fout instanceof GeenDatabase) return GEEN_DATABASE_ANTWOORD();
    console.error("voortgang wissen mislukt", fout);
    return Response.json({ error: "Kon de voortgang niet wissen." }, { status: 502 });
  }
}
