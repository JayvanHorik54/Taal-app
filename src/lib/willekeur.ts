/**
 * Door elkaar husselen — Fisher-Yates.
 *
 * Stond eerder als losse kopie in de oefensessie én werd elders met
 * `sort(() => Math.random() - 0.5)` gedaan. Die tweede is geen eerlijke
 * schudbeurt: hij geeft een vergelijkingsfunctie die zichzelf tegenspreekt,
 * en dan hangt de uitkomst af van het sorteeralgoritme. In de praktijk
 * blijft het eerste antwoord dan vaker dan toeval bovenaan staan — precies
 * wat je bij meerkeuzevragen niet wilt.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
