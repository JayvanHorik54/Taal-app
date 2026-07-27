import { MODEL_GRONDIG, GEEN_TOEGANG_ANTWOORD, GeenToegang, array, client, generate, object, stringField } from "@/lib/anthropic";
import { getLanguage } from "@/content/registry";
import { huidigeSessie, NIET_AANGEMELD } from "@/lib/sessie";
import type { GrammarExercise, Lesson } from "@/content/types";

/**
 * Vult een grammaticahoofdstuk aan dat nog niet uitgeschreven in de content
 * staat. De vorm is bewust gelijk aan de handgeschreven lessen, zodat de
 * weergave er geen weet van heeft waar een les vandaan komt.
 */

type GeneratedLesson = {
  core: string;
  intro: string[];
  table: { title: string; rows: { left: string; right: string }[] };
  rules: { title: string; text: string }[];
  examples: { target: string; native: string }[];
  pitfall: string;
  exercises: {
    type: "choice" | "fill" | "transform";
    prompt: string;
    options: string[];
    answer: string;
    why: string;
  }[];
};

const SCHEMA = object({
  core: stringField,
  intro: array(stringField),
  table: object({
    title: stringField,
    rows: array(object({ left: stringField, right: stringField })),
  }),
  rules: array(object({ title: stringField, text: stringField })),
  examples: array(object({ target: stringField, native: stringField })),
  pitfall: stringField,
  exercises: array(
    object({
      type: { type: "string", enum: ["choice", "fill", "transform"] },
      prompt: stringField,
      options: array(stringField),
      answer: stringField,
      why: stringField,
    })
  ),
});

export async function POST(request: Request) {
  if (!(await huidigeSessie())) return NIET_AANGEMELD();

  const anthropic = client();

  const body = (await request.json()) as {
    language?: string;
    topicId?: string;
  };

  const pack = getLanguage(body.language ?? "es");
  const topic = pack.curriculum.find((t) => t.id === body.topicId);
  if (!topic) return Response.json({ error: "Onbekend hoofdstuk." }, { status: 400 });

  try {
    const result = await generate<GeneratedLesson>(anthropic, {
      model: MODEL_GRONDIG,
      system: `Je bent een ervaren docent ${pack.name} die uitlegt aan een Nederlandstalige leerling. Je schrijft rustig en concreet, in gewone taal, zonder jargon. Je legt uit hoe iets werkt en waar Nederlanders de fout in gaan.`,
      prompt: `Schrijf het hoofdstuk "${topic.title}" op niveau ${topic.level}.

- core: één zin die de hele regel samenvat.
- intro: twee tot drie alinea's uitleg. Geen opsommingen, gewoon lopende tekst.
- table: een overzichtstabel. title is de kop, rows zijn rijen met links de vorm of het geval en rechts het voorbeeld.
- rules: twee losse regels of uitzonderingen die het waard zijn om apart te noemen.
- examples: vier voorbeeldzinnen met hun Nederlandse vertaling.
- pitfall: de fout die Nederlandstaligen hier het vaakst maken, en waarom.
- exercises: zes oefeningen. Gebruik "choice" met drie opties, "fill" om een vorm in te vullen, en "transform" om een zin om te schrijven of te vertalen. Bij "fill" en "transform" laat je options leeg. "why" legt in één zin uit waarom het antwoord klopt.`,
      schema: SCHEMA,
      effort: "medium",
      maxTokens: 12000,
    });

    const exercises: GrammarExercise[] = result.exercises
      .filter((exercise) => exercise.prompt && exercise.answer)
      .map((exercise) =>
        exercise.type === "choice"
          ? {
              type: "choice",
              prompt: exercise.prompt,
              options: exercise.options.length ? exercise.options : [exercise.answer],
              answer: exercise.answer,
              why: exercise.why,
            }
          : {
              type: exercise.type,
              prompt: exercise.prompt,
              answer: exercise.answer,
              why: exercise.why,
            }
      );

    const lesson: Lesson = {
      core: result.core,
      intro: result.intro,
      table: {
        title: result.table.title,
        rows: result.table.rows.map((row) => [row.left, row.right] as [string, string]),
      },
      rules: result.rules,
      examples: result.examples,
      pitfall: result.pitfall,
      exercises,
    };

    return Response.json({ lesson });
  } catch (error) {
    if (error instanceof GeenToegang) return GEEN_TOEGANG_ANTWOORD();
    console.error("les genereren mislukt", error);
    return Response.json({ error: "Genereren mislukt. Probeer het nog een keer." }, { status: 502 });
  }
}
