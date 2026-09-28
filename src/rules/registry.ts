// The registry: who is on the books, and what their vouch is doing today. Pure: every change
// returns a new registry. The rules read it; the desk and the court change it.
import type { Portrait } from '../gen/portrait';
import { sameFace } from './face';
import type { Applicant, Registrant, Registry } from './types';

/** Two names as the clerk types them: spaces and capitals do not matter. */
export const sameName = (a: string, b: string) => {
  const key = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();
  return key(a) === key(b);
};

export const findName = (registry: Registry, name: string): Registrant | null => registry.find((r) => sameName(r.name, name)) ?? null;

/** Everyone on file with this face. */
export const findFace = (registry: Registry, face: Portrait): Registrant[] => registry.filter((r) => sameFace(r.face, face));

/** Whose vouch this applicant holds: a registered human, not themselves, not busy with someone else. */
export function heldVouch(registry: Registry, a: Applicant): Registrant | null {
  if (!a.voucher || sameName(a.voucher, a.name)) return null;
  const voucher = findName(registry, a.voucher);
  return voucher && (voucher.vouching === null || voucher.vouching === a.name) ? voucher : null;
}

/** The applicant has reached the window: a good vouch now serves them for the rest of the day. */
export function atWindow(registry: Registry, a: Applicant): Registry {
  const voucher = heldVouch(registry, a);
  return voucher ? registry.map((r) => (r === voucher ? { ...r, vouching: a.name } : r)) : registry;
}

export const register = (registry: Registry, a: Applicant, day: number): Registry => [
  ...registry,
  { name: a.name, address: a.address, birthYear: a.birthYear, face: a.video.face, day, vouching: null },
];

export const remove = (registry: Registry, name: string): Registry => registry.filter((r) => r.name !== name);

/** A new day: every vouch is free again. */
export const freeVouches = (registry: Registry): Registry =>
  registry.map((r) => (r.vouching === null ? r : { ...r, vouching: null }));
