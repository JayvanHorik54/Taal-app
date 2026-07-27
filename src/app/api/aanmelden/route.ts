import { GEEN_DATABASE_ANTWOORD, GeenDatabase } from "@/lib/db";
import { meldAanMetPin, profielOpId } from "@/lib/profielen";
import { huidigeSessie, meldAan, meldAf } from "@/lib/sessie";
import { GEEN_GEHEIM_ANTWOORD, sessieGeheimOntbreekt } from "@/lib/token";

/** Wie ben ik? Het aanmeldscherm gebruikt dit om een oude sessie te bevestigen. */
export async function GET() {
  const sessie = await huidigeSessie();
  if (!sessie) return Response.json({ profiel: null });

  try {
    const profiel = await profielOpId(sessie.profielId);
    // Het koekje is geldig maar het profiel is weg: dan is de sessie dat ook.
    if (!profiel) await meldAf();
    return Response.json({ profiel });
  } catch (fout) {
    if (fout instanceof GeenDatabase) return GEEN_DATABASE_ANTWOORD();
    console.error("sessie nakijken mislukt", fout);
    return Response.json({ error: "Kon de sessie niet nakijken." }, { status: 502 });
  }
}

const minuten = (ms: number) => Math.max(1, Math.ceil((ms - Date.now()) / 60_000));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { naam?: string; pin?: string };
  const naam = (body.naam ?? "").trim();
  const pin = body.pin ?? "";

  if (!naam || !pin) {
    return Response.json({ error: "Vul je naam en pincode in." }, { status: 400 });
  }
  if (sessieGeheimOntbreekt()) return GEEN_GEHEIM_ANTWOORD();

  try {
    const uitslag = await meldAanMetPin(naam, pin);

    if (uitslag.ok) {
      await meldAan(uitslag.profiel.id);
      return Response.json({ profiel: uitslag.profiel });
    }

    if (uitslag.reden === "geblokkeerd") {
      return Response.json(
        {
          error: `Te vaak mis. Probeer het over ${minuten(uitslag.totMs)} minuten nog eens.`,
        },
        { status: 429 }
      );
    }

    // Onbekende naam en verkeerde pincode geven bewust hetzelfde antwoord:
    // anders kun je aflezen welke namen bestaan.
    return Response.json({ error: "Naam of pincode klopt niet." }, { status: 401 });
  } catch (fout) {
    if (fout instanceof GeenDatabase) return GEEN_DATABASE_ANTWOORD();
    console.error("aanmelden mislukt", fout);
    return Response.json({ error: "Aanmelden mislukte." }, { status: 502 });
  }
}
