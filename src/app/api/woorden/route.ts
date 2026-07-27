import { MODEL_SNEL, GEEN_TOEGANG_ANTWOORD, GeenToegang, array, client, generate, object, stringField } from "@/lib/anthropic";
import { getLanguage } from "@/content/registry";
import { huidigeSessie, NIET_AANGEMELD } from "@/lib/sessie";

type Generated = {
  words: {
    term: string;
    translation: string;
    exampleTarget: string;
    exampleNative: string;
  }[];
};

const SCHEMA = object({
  words: array(
    object({
      term: stringField,
      translation: stringField,
      exampleTarget: stringField,
      exampleNative: stringField,
    })
  ),
});

export async function POST(request: Request) {
  if (!(await huidigeSessie())) return NIET_AANGEMELD();

  const anthropic = client();

  const body = (await request.json()) as {
    language?: string;
    theme?: string;
    level?: string;
    count?: number;
    known?: string[];
  };

  const pack = getLanguage(body.language ?? "es");
  const theme = body.theme ?? pack.themes[0];
  const level = body.level ?? "A1";
  const count = Math.min(Math.max(body.count ?? 10, 4), 20);
  const known = (body.known ?? []).slice(-120);

  try {
    const result = await generate<Generated>(anthropic, {
      model: MODEL_SNEL,
      system: `Je bent een ervaren docent ${pack.name} voor Nederlandstalige leerlingen. Je kiest woorden die iemand op straat, in een café of op reis echt nodig heeft — geen schoolse woorden die niemand gebruikt.`,
      prompt: `Geef ${count} nuttige woorden of korte uitdrukkingen in het ${pack.name} op niveau ${level}, thema "${theme}".

Sla deze woorden over, die de leerling al kent:
${known.join(", ") || "(nog geen)"}

Regels:
- term: het woord in het ${pack.name}, met lidwoord als dat bij het woord hoort.
- translation: de Nederlandse vertaling. Meerdere betekenissen scheid je met een komma.
- exampleTarget: een natuurlijke voorbeeldzin van 4 tot 8 woorden waarin het woord voorkomt.
- exampleNative: de Nederlandse vertaling van die zin.
- Gebruik correcte accenten en leestekens.`,
      schema: SCHEMA,
      effort: "low",
    });

    const seen = new Set(known.map((w) => w.toLowerCase()));
    const words = result.words.filter((word) => {
      if (!word.term || !word.translation) return false;
      const key = word.term.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return Response.json({ words, theme, level });
  } catch (error) {
    if (error instanceof GeenToegang) return GEEN_TOEGANG_ANTWOORD();
    console.error("woorden genereren mislukt", error);
    return Response.json({ error: "Genereren mislukt. Probeer het nog een keer." }, { status: 502 });
  }
}
