// Rule 5: no face already in the registry. A twin is registered by filming both twins together,
// so a video that shows the applicant beside their double excuses one registration of that face.
import { sameFace } from './face';
import { findFace } from './registry';
import type { Applicant, Registrant, Registry } from './types';

/** The registration this face duplicates, or null. */
export function checkDuplicate(a: Applicant, registry: Registry): Registrant | null {
  const matches = findFace(registry, a.video.face);
  const twin = a.video.with && sameFace(a.video.with, a.video.face) ? matches.findIndex((r) => r.name !== a.name) : -1;
  return matches.filter((_, i) => i !== twin)[0] ?? null;
}
