// Rule 0: the applicant is a real human being: not a machine, a picture, or a computer-generated
// person or avatar. Read from the video: in every frame a human face, the same face, skin and not
// machinery, a person rather than a picture held up, filmed rather than generated. Anything worn,
// painted or carried does not count, for or against: a costume robot's head under the arm is a costume.
import { frameFaces, sameFace } from './face';
import type { Applicant, Violation } from './types';

/** Null when every frame shows the same human face, filmed; otherwise what shows otherwise, and where. */
export function checkHuman(a: Applicant): Omit<Extract<Violation, { rule: 'human' }>, 'rule'> | null {
  const { panel } = a.video;
  if (panel) return { problem: 'machine', frame: panel.frame, where: panel.where };
  const changes = frameFaces(a.video).findIndex((face) => !sameFace(face, a.video.face));
  if (changes >= 0) return { problem: 'changes', frame: changes + 1 };
  if (a.video.still) return { problem: 'picture', frame: 1 };
  return a.video.generated ? { problem: 'generated', frame: 1 } : null;
}
