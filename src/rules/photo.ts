// Rule 2: the photo is of the face in the video, facing the camera, and not mirrored. A frame where
// the face turns into another is Rule 0's business: then it is the video that is not real, not the photo.
import { frameFaces, sameFace } from './face';
import type { Applicant } from './types';

/** Null when the photo is the face in the video; otherwise the first frame it is not, or the mirror. */
export function checkPhoto(a: Applicant): { frame: number; mirrored: boolean } | null {
  if (a.mirrored) return { frame: 1, mirrored: true };
  const frame = frameFaces(a.video).findIndex((face, i) => a.video.glitch?.frame !== i + 1 && !sameFace(a.photo, face));
  return frame < 0 ? null : { frame: frame + 1, mirrored: false };
}
