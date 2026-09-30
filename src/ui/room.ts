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
/** The desk's bottom padding (6 design pixels) holds nothing: the hall may have it when the desk's tallest papers are out. */
const SLACK = 3;
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

export const deskNeeds = (width: number) => DESK_NEEDS.reduce((need, [w, h]) => (width >= w ? h : need), DESK_NEEDS[0][1]);

/** The hall's rows on a shift this size (below the desk rail, design pixels): whatever the desk leaves, within limits. */
export function hallRows(width: number, height: number): number {
  return Math.max(MIN_ROWS, Math.min(MAX_ROWS, Math.floor((height - BORDER - deskNeeds(width)) / PX) + SLACK));
}

/** The least height a stage this wide needs for the shift: the rail, the shortest hall, and the desk in its tallest state. */
export const shiftFloor = (width: number) => RAIL + BORDER + (MIN_ROWS - SLACK) * PX + deskNeeds(width);
