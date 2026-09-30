// How a shift's height is shared between the hall and the desk, for the hall (Hall.tsx) and the stage's crisp
// scale (Stage.tsx) alike. The desk never gives way: the hall has whatever the desk's tallest state leaves, within
// limits; and a crisp scale that would leave the desk less than that under the shortest hall is not taken.

/** One hall pixel, in design pixels: the portraits' art pixel. */
export const PX = 2;
/** The hall's bottom edge, in design pixels. */
const BORDER = 2;
/** The fewest hall rows, on the shortest stages (the strip without its railing), and the most. */
const MIN_ROWS = 48;
const MAX_ROWS = 112;
/** The desk rail across the top of the stage, in design pixels: .topbar's height in desk.css. */
export const RAIL = 40;

/**
 * The most the booth and the desk ever need below the hall, by stage width (design pixels): the tallest of every
 * applicant's papers, rulebook page, registry answer and note of the week, measured with the station at its
 * content height, the most of seeds 1 to 4 over all seven days. Since the narrow book is set a line to every 20px,
 * the tallest at every width is an applicant's papers: a voucher's form over a phone held up in the video (day 4
 * on; at 1366, seed 4's day 4 has a voucher long enough to put Look up under the name), and from 1640 a day 1 or
 * day 2 applicant's as tall; Rule 2's page under the registry's tab comes next. Between two widths, the narrower
 * one's.
 */
export const DESK_NEEDS: readonly (readonly [width: number, height: number])[] = [
  [1240, 650],
  [1280, 650],
  [1366, 630],
  [1400, 606],
  [1440, 606],
  [1540, 582],
  [1640, 564],
];

/**
 * The same with the evidence drawn at twice the art scale (the video's stills and the form's photo, four design
 * pixels to a portrait pixel), measured the same way (seeds 1 to 4, at 1656, 1700 and 1760). It starts at the
 * narrowest stage whose papers hold three doubled stills with the widest sign still beside them; from there the
 * papers are at their widest, and every day's tallest is a day 1 or day 2 applicant's, 164 pixels taller than at the
 * art scale: the doubled photo (the case number typed beside it, not under it) and the doubled stills, 96 each.
 */
export const DESK_NEEDS_X2: readonly (readonly [width: number, height: number])[] = [[1656, 728]];

const needs = (table: typeof DESK_NEEDS, width: number) => table.reduce((need, [w, h]) => (width >= w ? h : need), table[0][1]);

export const deskNeeds = (width: number) => needs(DESK_NEEDS, width);

/**
 * Whether a shift this size (below the desk rail, design pixels) draws the evidence at twice the art scale: only
 * where the papers are wide enough for it, and the desk in its tallest state so drawn still fits under the
 * shortest hall. It never costs a window its crisp scale (Stage.tsx asks for the desk at the art scale), only
 * hall rows: the hall gives up what the doubled papers need.
 */
export const evidenceX2 = (width: number, height: number) =>
  width >= DESK_NEEDS_X2[0][0] && height >= BORDER + MIN_ROWS * PX + needs(DESK_NEEDS_X2, width);

/**
 * The hall's rows on a shift this size (below the desk rail, design pixels): whatever the desk leaves, within limits.
 * All of it: the desk's foot is the blotter's edge and the lever's shadow, and until 30 Sep 2026 a hall that took
 * those 6 pixels too pushed them out of the window whenever the tallest papers were out.
 */
export function hallRows(width: number, height: number): number {
  const need = evidenceX2(width, height) ? needs(DESK_NEEDS_X2, width) : deskNeeds(width);
  return Math.max(MIN_ROWS, Math.min(MAX_ROWS, Math.floor((height - BORDER - need) / PX)));
}

/** The least height a stage this wide needs for the shift: the rail, the shortest hall, and the desk in its tallest state. */
export const shiftFloor = (width: number) => RAIL + BORDER + MIN_ROWS * PX + deskNeeds(width);
