// How the recurring cast looks (who they are: notes/game-design.md).
import type { Face, LampSize, Portrait } from '../gen/portrait';

const android = (face: Face, look: Omit<Portrait, 'species' | 'face' | 'accessories'>): Portrait => ({ species: 'android', face, ...look, accessories: [] });

/**
 * Day 1's Likeness unit, the tutorial's, the same every week: a home robot with a human face, its photo
 * flawless. The units of days 2 to 7 are drawn like anyone (src/gen/day.ts), so none of them has a face
 * a returning clerk could know.
 */
export const FIRST_UNIT_FACE: Portrait = android(
  { skin: 'rose', shape: 'oval', eyes: 'almond', eyeColor: 'green', brows: 'arched', nose: 'small', mouth: 'smile', ears: 'normal', age: 'adult', mark: 'none' },
  { hair: 'bob', hairColor: 'auburn', facialHair: 'none', outfit: 'sweater', outfitColor: 'teal' },
);

/**
 * Each day's unit's night lamp, and on day 2 the second blink that lights it twice. Day 1's, the
 * brightest, breaks no rule: Rule 2 comes the next morning, because of it, and the paper reprints it.
 * Nothing on day 4 or day 5: those are Likeness's current model, whose lamp waits out a blink (their
 * papers and face give them away). Day 7's is an older unit after Likeness's update: a lit slit, the
 * week's smallest.
 */
export const UNIT_LAMPS: readonly ({ lamp: LampSize; nervous?: true } | null)[] = [
  { lamp: 'bloom' },
  { lamp: 'glow', nervous: true },
  { lamp: 'glow' },
  null,
  null,
  { lamp: 'small' },
  { lamp: 'slit' },
];

/**
 * The face in the rulebook's Fig. 2: the Ministry's specimen, nobody in the queue, with no fake's hair
 * either. It was short and dark brown until that turned out to be every week's day 2 unit
 * (src/ui/faceFigure.test.tsx); the units drawn since are never given its hair.
 */
export const SPECIMEN: Portrait = {
  species: 'human',
  face: { skin: 'olive', shape: 'oval', eyes: 'round', eyeColor: 'dark', brows: 'flat', nose: 'straight', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'none' },
  hair: 'short',
  hairColor: 'black',
  facialHair: 'none',
  outfit: 'shirt',
  outfitColor: 'grey',
  accessories: [],
};

/**
 * Fig. 2-2's night lamp: the day's unit's, so the example is never bigger or smaller than the desk's; on a
 * day without one, the smallest the week has shown so far (from day 4 the Gazette has reported the dimming).
 * On day 7, the slit. Day 1's book has no Rule 2, so no figure.
 */
export const figureLamp = (day: number): LampSize => UNIT_LAMPS[day - 1]?.lamp ?? 'small';

/** The more attractive man of the day 2 notice, whose photograph someone registered with. Nobody in the queue has his face. */
export const CATALOGUE_GENTLEMAN: Portrait = {
  species: 'human',
  face: {
    skin: 'sand', shape: 'square', eyes: 'almond', eyeColor: 'blue', brows: 'arched',
    nose: 'straight', mouth: 'smile', ears: 'normal', age: 'adult', mark: 'none',
  },
  hair: 'pompadour',
  hairColor: 'black',
  facialHair: 'none',
  outfit: 'suit',
  outfitColor: 'navy',
  accessories: ['monocle'],
};

export const CAST_PORTRAITS = {
  /** So normal she is suspicious. */
  brenda: {
    species: 'human',
    face: {
      skin: 'sand', shape: 'oval', eyes: 'round', eyeColor: 'brown', brows: 'flat',
      nose: 'straight', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'bob',
    hairColor: 'brown',
    facialHair: 'none',
    outfit: 'sweater',
    outfitColor: 'beige',
    accessories: [],
  },
  /** Born 1922. Fierce. */
  grandmaEthel: {
    species: 'human',
    face: {
      skin: 'porcelain', shape: 'heart', eyes: 'narrow', eyeColor: 'grey', brows: 'angry',
      nose: 'hooked', mouth: 'frown', ears: 'normal', age: 'old', mark: 'none',
    },
    hair: 'bun',
    hairColor: 'white',
    facialHair: 'none',
    outfit: 'sweater',
    outfitColor: 'plum',
    accessories: ['glasses', 'pearls'],
  },
  socrates: {
    species: 'human',
    face: {
      skin: 'olive', shape: 'long', eyes: 'tired', eyeColor: 'dark', brows: 'thick',
      nose: 'wide', mouth: 'neutral', ears: 'big', age: 'old', mark: 'none',
    },
    hair: 'receding',
    hairColor: 'white',
    facialHair: 'beard',
    outfit: 'toga',
    outfitColor: 'white',
    accessories: [],
  },
  /** Sweats. Blinks far too much. */
  nervousNigel: {
    species: 'human',
    face: {
      skin: 'rose', shape: 'long', eyes: 'wide', eyeColor: 'blue', brows: 'worried',
      nose: 'long', mouth: 'grin', ears: 'big', age: 'young', mark: 'blush',
    },
    hair: 'side-part',
    hairColor: 'ginger',
    facialHair: 'none',
    outfit: 'shirt',
    outfitColor: 'white',
    accessories: ['sweat'],
  },
  /** A human whose name makes machines suspicious. */
  robOtt: {
    species: 'human',
    face: {
      skin: 'brown', shape: 'square', eyes: 'almond', eyeColor: 'dark', brows: 'thick',
      nose: 'button', mouth: 'smile', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'short',
    hairColor: 'black',
    facialHair: 'stubble',
    outfit: 'hoodie',
    outfitColor: 'grey',
    accessories: [],
  },
  /** Does nights on the Ministry's door. Came straight from bed, mask still on her forehead. */
  nightShiftDawn: {
    species: 'human',
    face: {
      skin: 'tan', shape: 'round', eyes: 'tired', eyeColor: 'hazel', brows: 'flat',
      nose: 'straight', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'curly',
    hairColor: 'dark-brown',
    facialHair: 'none',
    outfit: 'shirt',
    outfitColor: 'navy',
    accessories: ['sleep-mask'],
  },
  /** A real human the rules keep failing. The mole is on the left cheek; in a mirror, it is not. */
  pat: {
    species: 'human',
    face: {
      skin: 'tan', shape: 'oval', eyes: 'round', eyeColor: 'hazel', brows: 'worried',
      nose: 'small', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'mole',
    },
    hair: 'side-part',
    hairColor: 'auburn',
    facialHair: 'none',
    outfit: 'sweater',
    outfitColor: 'forest',
    accessories: [],
  },
  /** Pat's mother. She plays bridge with Ethel. */
  patMother: {
    species: 'human',
    face: {
      skin: 'tan', shape: 'heart', eyes: 'round', eyeColor: 'hazel', brows: 'thin',
      nose: 'small', mouth: 'smile', ears: 'normal', age: 'old', mark: 'none',
    },
    hair: 'bob',
    hairColor: 'grey',
    facialHair: 'none',
    outfit: 'sweater',
    outfitColor: 'maroon',
    accessories: ['pearls'],
  },
  /** One face, two twins. The other one wears plum. */
  twins: {
    species: 'human',
    face: {
      skin: 'umber', shape: 'round', eyes: 'almond', eyeColor: 'brown', brows: 'arched',
      nose: 'button', mouth: 'smirk', ears: 'small', age: 'young', mark: 'freckles',
    },
    hair: 'afro',
    hairColor: 'black',
    facialHair: 'none',
    outfit: 'tshirt',
    outfitColor: 'teal',
    accessories: ['earrings'],
  },
  /** Three cousins with one face. The hats are theirs to choose. */
  sybilFarm: {
    species: 'human',
    face: {
      skin: 'rose', shape: 'wide', eyes: 'narrow', eyeColor: 'grey', brows: 'flat',
      nose: 'wide', mouth: 'neutral', ears: 'big', age: 'adult', mark: 'none',
    },
    hair: 'short',
    hairColor: 'brown',
    facialHair: 'stubble',
    outfit: 'shirt',
    outfitColor: 'olive',
    accessories: [],
  },
  /** An AI agent with a wallet. Its face was the first one it was offered. */
  agent: {
    species: 'human',
    face: {
      skin: 'sand', shape: 'oval', eyes: 'round', eyeColor: 'blue', brows: 'flat',
      nose: 'straight', mouth: 'smile', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'short',
    hairColor: 'brown',
    facialHair: 'none',
    outfit: 'suit',
    outfitColor: 'grey',
    accessories: [],
  },
  /** Almost the same face as the photo, frame after frame. Then the ears. */
  deepfake: {
    species: 'human',
    face: {
      skin: 'porcelain', shape: 'long', eyes: 'almond', eyeColor: 'green', brows: 'thin',
      nose: 'straight', mouth: 'smile', ears: 'small', age: 'young', mark: 'none',
    },
    hair: 'buzz',
    hairColor: 'blond',
    facialHair: 'none',
    outfit: 'turtleneck',
    outfitColor: 'white',
    accessories: [],
  },
  /** A printed face on a stick. The face is very happy. */
  cutout: {
    species: 'human',
    face: {
      skin: 'rose', shape: 'square', eyes: 'wide', eyeColor: 'blue', brows: 'arched',
      nose: 'straight', mouth: 'grin', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'pompadour',
    hairColor: 'blond',
    facialHair: 'none',
    outfit: 'suit',
    outfitColor: 'navy',
    accessories: [],
  },
  /** Before the filter. */
  influencer: {
    species: 'human',
    face: {
      skin: 'olive', shape: 'heart', eyes: 'almond', eyeColor: 'brown', brows: 'thick',
      nose: 'button', mouth: 'pout', ears: 'normal', age: 'young', mark: 'freckles',
    },
    hair: 'long',
    hairColor: 'platinum',
    facialHair: 'none',
    outfit: 'turtleneck',
    outfitColor: 'beige',
    accessories: ['earrings'],
  },
  /** On his way to a children's party, as the robot. The head is under his arm. */
  dave: {
    species: 'human',
    face: {
      skin: 'brown', shape: 'round', eyes: 'tired', eyeColor: 'dark', brows: 'thick',
      nose: 'wide', mouth: 'smile', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'receding',
    hairColor: 'black',
    facialHair: 'beard',
    outfit: 'sweater',
    outfitColor: 'grey',
    accessories: ['robot-helmet'],
  },
  /** A real human called Sybil. Just the one of her. */
  sybilVance: {
    species: 'human',
    face: {
      skin: 'ebony', shape: 'oval', eyes: 'narrow', eyeColor: 'dark', brows: 'arched',
      nose: 'small', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'none',
    },
    hair: 'bun',
    hairColor: 'black',
    facialHair: 'none',
    outfit: 'shirt',
    outfitColor: 'mustard',
    accessories: ['glasses'],
  },
} satisfies Record<string, Portrait>;

/** You. The clerk at Window 3, registered before the week began, like every Ministry employee. */
export const CLERK_PORTRAIT: Portrait = {
  species: 'human',
  face: {
    skin: 'sand', shape: 'oval', eyes: 'tired', eyeColor: 'grey', brows: 'flat',
    nose: 'long', mouth: 'neutral', ears: 'normal', age: 'adult', mark: 'none',
  },
  hair: 'receding',
  hairColor: 'dark-brown',
  facialHair: 'none',
  outfit: 'shirt',
  outfitColor: 'grey',
  accessories: ['glasses'],
};

/** Your face, a better haircut. */
export const CLONE_PORTRAIT: Portrait = { ...CLERK_PORTRAIT, hair: 'pompadour', outfit: 'suit', outfitColor: 'navy', accessories: [] };

/** The Influencer's photo: the Natural filter. The skin is smoother, the eyes are larger and the freckles have gone. */
export const INFLUENCER_PHOTO: Portrait = {
  ...CAST_PORTRAITS.influencer,
  face: { ...CAST_PORTRAITS.influencer.face, skin: 'sand', eyes: 'wide', mark: 'none' },
};

/** The Deepfake's ears in the frame where they slip. */
export const DEEPFAKE_SLIP: Portrait = { ...CAST_PORTRAITS.deepfake, face: { ...CAST_PORTRAITS.deepfake.face, ears: 'big' } };

/** The second twin. */
export const TWIN_TWO: Portrait = { ...CAST_PORTRAITS.twins, outfitColor: 'plum' };

/** The Sybil Farm's hats, one per cousin, in the order they come in. */
export const FARM_HATS = ['top-hat', 'flat-cap', 'bobble-hat'] as const;

/** The first applicant of every week. */
export const FIRST_APPLICANT_PORTRAIT: Portrait = {
  species: 'human',
  face: {
    skin: 'porcelain', shape: 'round', eyes: 'round', eyeColor: 'blue', brows: 'thin',
    nose: 'button', mouth: 'smile', ears: 'normal', age: 'old', mark: 'none',
  },
  hair: 'bun',
  hairColor: 'grey',
  facialHair: 'none',
  outfit: 'sweater',
  outfitColor: 'teal',
  accessories: ['glasses'],
};

/** Gordon Pim, day 1's first slip, in the coat he wore to feed the meter. Nobody else in any week has his face. */
export const FIRST_SLIP_PORTRAIT: Portrait = {
  species: 'human',
  face: {
    skin: 'tan', shape: 'square', eyes: 'narrow', eyeColor: 'brown', brows: 'thick',
    nose: 'hooked', mouth: 'neutral', ears: 'big', age: 'adult', mark: 'none',
  },
  hair: 'receding',
  hairColor: 'dark-brown',
  facialHair: 'mustache',
  outfit: 'trenchcoat',
  outfitColor: 'beige',
  accessories: ['flat-cap'],
};
