import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Pincodes gaan gehasht de database in, met scrypt uit Node zelf — geen
 * afhankelijkheid erbij, en scrypt is expres traag en geheugenhongerig, zodat
 * een gestolen tabel niet in een middag door te rekenen is.
 *
 * Vier cijfers zijn maar tienduizend mogelijkheden. De hash beschermt daar
 * niet tegen; de pogingenteller in `profielen` doet dat. Beide zijn nodig.
 */

const LENGTE = 64;
const OPTIES = { N: 16_384, r: 8, p: 1 };

export const PIN_MIN = 4;
export const PIN_MAX = 8;

/** Alleen cijfers, vier tot acht — genoeg keus, nog steeds te onthouden. */
export const geldigePin = (pin: string) =>
  new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin);

const afleiden = (pin: string, zout: Buffer): Promise<Buffer> =>
  new Promise((klaar, mislukt) => {
    scrypt(pin.normalize("NFKC"), zout, LENGTE, OPTIES, (fout, sleutel) =>
      fout ? mislukt(fout) : klaar(sleutel)
    );
  });

export async function hashPin(pin: string): Promise<string> {
  const zout = randomBytes(16);
  const hash = await afleiden(pin, zout);
  return `scrypt$${zout.toString("hex")}$${hash.toString("hex")}`;
}

export async function pinKlopt(pin: string, opgeslagen: string): Promise<boolean> {
  const [soort, zoutHex, hashHex] = opgeslagen.split("$");
  if (soort !== "scrypt" || !zoutHex || !hashHex) return false;

  const verwacht = Buffer.from(hashHex, "hex");
  if (verwacht.length !== LENGTE) return false;

  const gekregen = await afleiden(pin, Buffer.from(zoutHex, "hex"));
  return timingSafeEqual(verwacht, gekregen);
}
