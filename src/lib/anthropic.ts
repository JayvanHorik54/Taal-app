import Anthropic from "@anthropic-ai/sdk";

/**
 * Serverkant van de AI-functies. De sleutel blijft hier — in het originele
 * prototype stond de fetch naar api.anthropic.com in de browser, wat buiten
 * een sandbox betekent dat je sleutel bij iedere bezoeker op straat ligt.
 */

/**
 * Twee modellen, bewust gesplitst.
 *
 * `SNEL` doet het werk met veel volume en weinig moeilijkheid: een gesprek op
 * A1/A2 is korte zinnen met een correctie van één regel. Daar is Sonnet 5 zo
 * dicht bij Opus dat je het verschil niet merkt, tegen ongeveer de helft van
 * de kosten.
 *
 * `GRONDIG` doet wat je één keer laat maken en daarna twintig keer leest: een
 * grammaticahoofdstuk. Een uitleg die net verkeerd is, leert je iets fout af.
 */
export const MODEL_SNEL = "claude-sonnet-5";
export const MODEL_GRONDIG = "claude-opus-5";

/**
 * De SDK zoekt zelf naar inloggegevens: eerst ANTHROPIC_API_KEY, dan
 * ANTHROPIC_AUTH_TOKEN, dan een profiel van `ant auth login`. Daarom checken
 * we hier niet op één specifieke omgevingsvariabele — dat zou een geldige
 * OAuth-login onterecht afwijzen. We proberen het gewoon, en vangen af.
 */
export function client(): Anthropic {
  return new Anthropic();
}

/** Er zijn geen (geldige) inloggegevens gevonden. */
export class GeenToegang extends Error {}

/**
 * De SDK meldt "geen sleutel" niet als één nette foutklasse: een ongeldige
 * sleutel geeft een AuthenticationError, maar hélemaal geen sleutel geeft een
 * gewone Error over het opzoeken van inloggegevens. Beide moeten voor de
 * gebruiker dezelfde uitleg opleveren.
 */
function isToegangsprobleem(error: unknown): boolean {
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return true;
  }
  if (!(error instanceof Error)) return false;
  return /api[_ ]?key|auth|credential|active_config|\.config\/anthropic/i.test(error.message);
}

export const GEEN_TOEGANG_ANTWOORD = () =>
  Response.json(
    {
      error:
        "Geen geldige toegang tot de Claude API. Zet ANTHROPIC_API_KEY in .env.local en start de server opnieuw.",
    },
    { status: 503 }
  );

type Schema = Record<string, unknown>;

/** Eén tekstblok uit het antwoord halen en als JSON teruggeven. */
export async function generate<T>(
  anthropic: Anthropic,
  options: {
    model: string;
    system: string;
    prompt: string;
    schema: Schema;
    effort?: "low" | "medium" | "high";
    maxTokens?: number;
  }
): Promise<T> {
  let message;
  try {
    message = await anthropic.messages.create({
      model: options.model,
      max_tokens: options.maxTokens ?? 8000,
      system: options.system,
      output_config: {
        effort: options.effort ?? "low",
        format: { type: "json_schema", schema: options.schema },
      },
      messages: [{ role: "user", content: options.prompt }],
    });
  } catch (error) {
    if (isToegangsprobleem(error)) throw new GeenToegang("geen geldige inloggegevens");
    throw error;
  }

  if (message.stop_reason === "refusal") {
    throw new Error("Het model gaf geen antwoord op deze vraag.");
  }

  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  if (!text) throw new Error("Leeg antwoord van het model.");
  return JSON.parse(text) as T;
}

export const stringField = { type: "string" } as const;

/** Bouwt een JSON-schema-object met alle velden verplicht (zoals de API eist). */
export function object(properties: Record<string, unknown>): Schema {
  return {
    type: "object",
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

export function array(items: unknown): Schema {
  return { type: "array", items };
}
