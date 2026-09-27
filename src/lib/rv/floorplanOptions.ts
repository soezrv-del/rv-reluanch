/**
 * Facts floorplan choices for one model year.
 * The catalog year row is the whole list. A live dossier must not
 * replace it — research used to return at most eight codes and hide the rest.
 */
export function resolveFactsFloorplanOptions(
  catalogYear: readonly string[],
): string[] {
  return [...catalogYear];
}
