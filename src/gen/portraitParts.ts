// Self-made art data for drawPortrait: colour ramps, pixel stamps and a 3x5 font.
// Stamps are one string per row, drawn for the viewer's left and mirrored for the right;
// '.' is transparent and each letter is looked up in a colour table at draw time.
// Face stamps: k ink, w eye white, i iris, d eye dark, g glint, b brow,
// s skin shadow, h skin highlight, l lip, m mouth inside, t teeth.
import type { BrowStyle, EyeColor, EyeStyle, HairColor, LampSize, MouthStyle, NoseStyle, OutfitColor, SkinTone } from './portrait';

export type Ramp = { hi: string; base: string; lo: string };
export type SkinRamp = Ramp & { deep: string; lip: string };

export const INK = '#2a2220';
export const EYE_WHITE = '#f1ece2';
export const MOUTH_INSIDE = '#4a1f1c';
export const TEETH = '#f3efe6';

export const SKIN: Record<SkinTone, SkinRamp> = {
  porcelain: { hi: '#fde9de', base: '#f3d2bf', lo: '#dcae96', deep: '#b98770', lip: '#c47468' },
  rose: { hi: '#f8dccb', base: '#eabda3', lo: '#cf977c', deep: '#a9705a', lip: '#b8665a' },
  sand: { hi: '#f4d8b4', base: '#e2b98c', lo: '#c4956a', deep: '#9d6f4b', lip: '#ad6b52' },
  olive: { hi: '#e3c599', base: '#caa274', lo: '#a88055', deep: '#80603d', lip: '#946148' },
  tan: { hi: '#dbae83', base: '#be8b5e', lo: '#9c6c44', deep: '#77502f', lip: '#86523a' },
  brown: { hi: '#bb8862', base: '#9b6842', lo: '#7b4f31', deep: '#5a3822', lip: '#62392a' },
  umber: { hi: '#9a684a', base: '#7a4e33', lo: '#5e3a25', deep: '#432819', lip: '#4a2a1c' },
  ebony: { hi: '#7a523c', base: '#5e3d2b', lo: '#472d20', deep: '#321f16', lip: '#34201a' },
};

export const HAIR: Record<HairColor, Ramp> = {
  black: { hi: '#4f4744', base: '#322b29', lo: '#211c1b' },
  'dark-brown': { hi: '#71503a', base: '#523724', lo: '#3a2618' },
  brown: { hi: '#a0714a', base: '#7c5332', lo: '#5b3b22' },
  auburn: { hi: '#b4623f', base: '#8f4429', lo: '#6b311d' },
  ginger: { hi: '#e99d5b', base: '#cc7536', lo: '#a15726' },
  blond: { hi: '#f4de9a', base: '#dbbd6b', lo: '#b39349' },
  platinum: { hi: '#f8f3e0', base: '#e5dcbc', lo: '#bfb38c' },
  grey: { hi: '#cbc9c4', base: '#a29f99', lo: '#7b7872' },
  white: { hi: '#f7f5f1', base: '#e2dfd8', lo: '#b3aea4' },
  teal: { hi: '#7ccbc0', base: '#4fa197', lo: '#387a71' },
  plum: { hi: '#ab76a2', base: '#865680', lo: '#643f60' },
};

export const IRIS: Record<EyeColor, string> = {
  brown: '#6b4226',
  dark: '#2f2320',
  hazel: '#7f6d3a',
  green: '#4d7a48',
  blue: '#4b73a3',
  grey: '#6e7b84',
};

export const CLOTH: Record<OutfitColor, Ramp> = {
  navy: { hi: '#5a6a8e', base: '#3e4a68', lo: '#2c3550' },
  olive: { hi: '#878e5e', base: '#686d44', lo: '#4e5232' },
  maroon: { hi: '#99545b', base: '#763b41', lo: '#57292e' },
  mustard: { hi: '#d5ae56', base: '#b08b3a', lo: '#8a6b29' },
  teal: { hi: '#599590', base: '#3d7470', lo: '#2c5754' },
  grey: { hi: '#a5a9af', base: '#80858c', lo: '#61666d' },
  beige: { hi: '#e0d1b1', base: '#c1af8e', lo: '#9c8b6c' },
  khaki: { hi: '#d3b680', base: '#b1935d', lo: '#8b7043' },
  brown: { hi: '#937356', base: '#71553e', lo: '#543e2d' },
  plum: { hi: '#876483', base: '#674a64', lo: '#4c364a' },
  forest: { hi: '#63835a', base: '#4a6343', lo: '#364a31' },
  white: { hi: '#f4f1ea', base: '#dcd7cc', lo: '#b6b0a4' },
};

export const PROPS = {
  gold: { hi: '#f6de8e', base: '#d6ac45', lo: '#9e7a2c' },
  frame: '#3b302b',
  pearl: '#fbf8f0',
  shirt: '#ebe7de',
  tie: '#8f3a3a',
  hat: { hi: '#4b4951', base: '#2d2c32', lo: '#1c1b20' },
  hatBand: '#8a2f35',
  paper: '#f6f3ec',
  cardboard: { hi: '#dec293', base: '#c6a36d', lo: '#9f7f50' },
  sweat: { hi: '#f2fbff', base: '#9fd2e6', lo: '#5b91ab' },
  sleepMask: { base: '#b8a3d6', lo: '#8a74ab', stitch: '#54406f' },
  tweed: { hi: '#9c8f74', base: '#7a6d55', lo: '#5a4f3c' },
  knit: { hi: '#e0736a', base: '#c24d45', lo: '#8f3530' },
  bobble: { hi: '#fbf6ea', base: '#e8e0cc', lo: '#c2b89f' },
  /** A phone held up in a video: its case and its lit screen. */
  phone: { body: '#23262b', screen: '#cfe3ea' },
  /** A party costume's robot head: painted card, a dark visor and a bulb on a stalk. */
  helmet: { hi: '#e3e6e8', base: '#b8bec3', lo: '#80878d', visor: '#2b3740', bulb: '#e2574a' },
  /** A unit's night lamp as a phone camera sees near-infrared: a white core in a deep-violet ring, and violet light spilling onto whatever is near. Colours no skin, hair, eye or clothing uses. */
  lamp: { core: '#fdfaff', ring: '#3d2288', spill: '#b39af7' },
  /** The outline of a video generator's mark. */
  markEdge: '#3d4446',
};

export const EYES: Record<EyeStyle, { open: string[]; closed: string[] }> = {
  round: { open: ['.kk.', 'wiiw', '.ss.'], closed: ['....', 'kkkk', '.ss.'] },
  almond: { open: ['.kkk', 'kwii', '..ss'], closed: ['....', 'kkkk', '..ss'] },
  narrow: { open: ['kkkk', '.ii.'], closed: ['....', 'kkkk'] },
  wide: { open: ['.kk.', 'kwik', 'wwii', '.kk.'], closed: ['....', '.kk.', 'kkkk', '....'] },
  tired: { open: ['kkkk', 'wiiw', 'ssss'], closed: ['....', 'kkkk', 'ssss'] },
  beady: { open: ['.gd.', '.dd.'], closed: ['....', '.kk.'] },
};

export const BROWS: Record<BrowStyle, string[]> = {
  flat: ['bbbb'],
  thick: ['.bbb', 'bbbb'],
  arched: ['.bb.', 'b..b'],
  thin: ['.bbb'],
  angry: ['bb..', '.bbb'],
  worried: ['..bb', 'bbb.'],
  unibrow: ['bbbb'],
};

export const NOSES: Record<NoseStyle, string[]> = {
  button: ['....', '.h..', 'ss.s'],
  straight: ['..s.', '..s.', 's.ss'],
  long: ['..s.', '..s.', '..s.', 's.ss'],
  wide: ['..s...', '..s...', 'ss.sss'],
  hooked: ['.s..', '..s.', '..ss', 's.ss'],
  small: ['.s', 'ss'],
};

export const MOUTHS: Record<MouthStyle, string[]> = {
  neutral: ['llll'],
  smile: ['l....l', '.llll.'],
  frown: ['.llll.', 'l....l'],
  smirk: ['....l', 'llll.'],
  grin: ['llllll', 'lttttl', '.llll.'],
  pout: ['.ll.', 'llll'],
};

export const MOUTH_OPEN = ['.llll.', 'lmmmml', '.llll.'];

export const SWEAT_DROP = ['.o.', 'oho', 'oao', '.o.'];

/** The closed eye stitched on a sleep mask, one per side. */
export const SLEEP_MASK_EYE = ['s..s', '.ss.'];

/**
 * A unit's night lamp, whole (it is symmetric), centred on the face with its top row four rows above
 * the brows' bottom row: c core, r ring, s its light spilling onto what is there, mixed in by `spill`.
 */
export const LAMPS: Record<LampSize, { art: readonly string[]; spill: number }> = {
  bloom: { art: ['...ss...', '.ssssss.', '.ssrrss.', 'ssrccrss', 'ssrccrss', '.ssrrss.'], spill: 0.5 },
  glow: { art: ['...ss...', '.ssssss.', '.ssrrss.', 'ssrccrss', 'ssrccrss', '.ssrrss.'], spill: 0.3 },
  small: { art: ['........', '........', '........', '...rr...', '..rccr..', '...rr...'], spill: 0 },
};

/** 3x5 glyphs: five octal digits, one per row, 4 = left column, 1 = right column. */
export const FONT: Record<string, string> = {
  A: '25755', B: '65656', C: '34443', D: '65556', E: '74647', F: '74644', G: '34553', H: '55755',
  I: '72227', J: '11152', K: '55655', L: '44447', M: '57755', N: '75555', O: '25552', P: '65644',
  Q: '25563', R: '65655', S: '34216', T: '72222', U: '55557', V: '55552', W: '55775', X: '55255',
  Y: '55222', Z: '71247', 0: '75557', 1: '26227', 2: '61247', 3: '61216', 4: '55711', 5: '74616',
  6: '34757', 7: '71222', 8: '75757', 9: '75716', ' ': '00000', '.': '00002', '!': '22202',
  '?': '61202', '-': '00700', "'": '22000', ':': '02020', ',': '00024',
};
