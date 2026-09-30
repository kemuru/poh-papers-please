// Rule 2: the face. The photo is of the face in the video, facing the camera and not mirrored, and
// that face is a human one: the same face in every frame, eyes open or shut, giving off no light of its
// own. Hair, clothes and whatever is worn are not the face: a new haircut or a pair of glasses since
// the photo was taken changes nothing, and a costume robot's head is a costume, bulb and all.
import type { Face, Portrait, Pose } from '../gen/portrait';
import type { Applicant, Video, Violation } from './types';

const FEATURES: readonly (keyof Face)[] = ['skin', 'shape', 'eyes', 'eyeColor', 'brows', 'nose', 'mouth', 'ears', 'age', 'mark'];

export const sameFace = (a: Portrait, b: Portrait) => a.species === b.species && FEATURES.every((f) => a.face[f] === b.face[f]);

/** The face in each of the video's three frames. */
export const frameFaces = (video: Video): Portrait[] =>
  [1, 2, 3].map((frame) => (video.glitch?.frame === frame ? video.glitch.face : video.face));

/** How each of the three frames is posed: a still, then speaking, then blinking, each only if it happened. A printed face does neither. */
export const framePoses = (v: Video): Pose[] => {
  const spoke = v.transcript.trim() !== '';
  return [
    { eyes: v.nervous ? 'closed' : 'open', mouth: 'closed' },
    { eyes: 'open', mouth: spoke && !v.still ? 'open' : 'closed' },
    { eyes: v.blinked && !v.still ? 'closed' : 'open', mouth: 'closed' },
  ];
};

/** The frames a unit's lamp shows in: every frame with the eyes shut. */
export const litFrames = (v: Video): number[] =>
  v.lamp ? framePoses(v).flatMap((p, i) => (p.eyes === 'closed' ? [i + 1] : [])) : [];

/** Null when the photo and every frame show one human face; otherwise what shows otherwise, and where. */
export function checkFace(a: Applicant): Omit<Extract<Violation, { rule: 'face' }>, 'rule'> | null {
  const lit = litFrames(a.video);
  if (lit.length) return { problem: 'machine', frame: lit[0], lamp: a.video.lamp };
  const frames = frameFaces(a.video);
  const changes = frames.findIndex((face) => !sameFace(face, a.video.face));
  if (changes >= 0) return { problem: 'changes', frame: changes + 1 };
  if (a.mirrored) return { problem: 'mirrored', frame: 1 };
  const another = frames.findIndex((face) => !sameFace(a.photo, face));
  return another < 0 ? null : { problem: 'another', frame: another + 1 };
}
