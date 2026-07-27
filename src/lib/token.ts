import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Het ondertekenen en nakijken van sessietokens. Bewust los van `sessie.ts`:
 * dáár zitten de koekjes en dus Next-specifieke dingen, hier alleen rekenwerk
 * dat je zonder server kunt nakijken — en dat gebeurt ook, in `sessie.test.ts`.
 *
 * Een token is de nuttige lading plus een HMAC eroverheen. Een bibliotheek als
 * jose zou hetzelfde doen, maar die lading is één id en een vervaldatum; daar
 * is een extra afhankelijkheid met een eigen updateritme niet de moeite waard.
 */

export const GELDIG_MS = 90 * 24 * 60 * 60 * 1000; // negentig dagen: dit is een dagelijkse app

const DEV_GEHEIM = "azulejo-lokaal-ontwikkelgeheim-niet-voor-productie";

/**
 * Zonder geheim kun je niets ondertekenen. Lokaal vullen we dat stilletjes
 * aan; in productie zou dat betekenen dat iedereen zijn eigen sessie kan
 * verzinnen, dus daar weigert de app dienst.
 */
export const sessieGeheimOntbreekt = () =>
  !process.env.SESSION_SECRET && process.env.NODE_ENV === "production";

export const GEEN_GEHEIM_ANTWOORD = () =>
  Response.json(
    {
      error:
        "SESSION_SECRET is niet ingesteld op de server, dus aanmelden kan niet veilig. " +
        "Zet hem in de omgevingsvariabelen en rol opnieuw uit.",
    },
    { status: 503 }
  );

function geheim(): string {
  const uit = process.env.SESSION_SECRET;
  if (uit) return uit;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET ontbreekt — sessies zijn zonder dat niet te vertrouwen.");
  }
  return DEV_GEHEIM;
}

const tekenen = (lading: string) =>
  createHmac("sha256", geheim()).update(lading).digest("base64url");

function handtekeningKlopt(lading: string, gekregen: string): boolean {
  const verwacht = Buffer.from(tekenen(lading));
  const aangeleverd = Buffer.from(gekregen);
  // timingSafeEqual eist gelijke lengtes; ongelijk is sowieso mis.
  if (verwacht.length !== aangeleverd.length) return false;
  return timingSafeEqual(verwacht, aangeleverd);
}

export type Sessie = { profielId: string };

export function maakToken(profielId: string, nu = Date.now()): string {
  const lading = Buffer.from(JSON.stringify({ p: profielId, v: nu + GELDIG_MS })).toString(
    "base64url"
  );
  return `${lading}.${tekenen(lading)}`;
}

export function leesToken(token: string | undefined): Sessie | null {
  if (!token) return null;

  // Precies twee delen: alles anders is geen token van ons.
  const delen = token.split(".");
  if (delen.length !== 2) return null;

  const [lading, handtekening] = delen;
  if (!lading || !handtekening) return null;
  if (!handtekeningKlopt(lading, handtekening)) return null;

  try {
    const { p, v } = JSON.parse(Buffer.from(lading, "base64url").toString()) as {
      p?: string;
      v?: number;
    };
    if (!p || typeof v !== "number" || v < Date.now()) return null;
    return { profielId: p };
  } catch {
    return null;
  }
}
