import { meldAf } from "@/lib/sessie";

export async function POST() {
  await meldAf();
  return Response.json({ ok: true });
}
