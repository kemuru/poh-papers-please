// What makes a face the same face. Hair, clothes and whatever is worn are not the face: a new
// haircut or a pair of glasses since the photo was taken changes nothing.
import type { Face, Portrait } from '../gen/portrait';
import type { Video } from './types';

const FEATURES: readonly (keyof Face)[] = ['skin', 'shape', 'eyes', 'eyeColor', 'brows', 'nose', 'mouth', 'ears', 'age', 'mark'];

export const sameFace = (a: Portrait, b: Portrait) => a.species === b.species && FEATURES.every((f) => a.face[f] === b.face[f]);

/** The face in each of the video's three frames. */
export const frameFaces = (video: Video): Portrait[] =>
  [1, 2, 3].map((frame) => (video.glitch?.frame === frame ? video.glitch.face : video.face));
