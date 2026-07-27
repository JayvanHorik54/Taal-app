import { GEEN_DATABASE_ANTWOORD, GeenDatabase } from "@/lib/db";
import { geldigePin, PIN_MAX, PIN_MIN } from "@/lib/pincode";
import { alleProfielen, maakProfiel, MAX_PROFIELEN } from "@/lib/profielen";
import { meldAan } from "@/lib/sessie";
import { uitnodigingKlopt, uitnodigingVereist } from "@/lib/toegang";
import { GEEN_GEHEIM_ANTWOORD, sessieGeheimOntbreekt } from "@/lib/token";

const NAAM_MAX = 24;

/**
 * De lijst met namen voor het aanmeldscherm. Meer dan een voornaam staat er
 * niet in, en zonder pincode kom je er niet mee binnen — net als de
 * profielkiezer van een streamingdienst.
 */
export async function GET() {
  try {
    return Response.json({
      profielen: await alleProfielen(),
      uitnodigingNodig: uitnodigingVereist(),
    });
  } catch (fout) {
    if (fout instanceof GeenDatabase) return GEEN_DATABASE_ANTWOORD();
    console.error("profielen ophalen mislukt", fout);
    return Response.json({ error: "Kon de profielen niet ophalen." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    naam?: string;
    pin?: string;
    uitnodiging?: string;
  };

  const naam = (body.naam ?? "").trim();
  const pin = body.pin ?? "";

  if (naam.length < 2 || naam.length > NAAM_MAX) {
    return Response.json(
      { error: `Kies een naam van 2 tot ${NAAM_MAX} tekens.` },
      { status: 400 }
    );
  }
  if (!geldigePin(pin)) {
    return Response.json(
      { error: `De pincode is ${PIN_MIN} tot ${PIN_MAX} cijfers.` },
      { status: 400 }
    );
  }
  if (sessieGeheimOntbreekt()) return GEEN_GEHEIM_ANTWOORD();
  if (!uitnodigingKlopt(body.uitnodiging)) {
    return Response.json(
      { error: "Die uitnodigingscode klopt niet.", veld: "uitnodiging" },
      { status: 403 }
    );
  }

  try {
    const resultaat = await maakProfiel(naam, pin);

    if (!resultaat.ok) {
      return resultaat.reden === "bezet"
        ? Response.json(
            { error: `Er is al een profiel dat ${naam} heet.`, veld: "naam" },
            { status: 409 }
          )
        : Response.json(
            { error: `Er passen niet meer dan ${MAX_PROFIELEN} profielen in.` },
            { status: 409 }
          );
    }

    await meldAan(resultaat.profiel.id);
    return Response.json({ profiel: resultaat.profiel });
  } catch (fout) {
    if (fout instanceof GeenDatabase) return GEEN_DATABASE_ANTWOORD();
    console.error("profiel maken mislukt", fout);
    return Response.json({ error: "Kon het profiel niet aanmaken." }, { status: 502 });
  }
}
