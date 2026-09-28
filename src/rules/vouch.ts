// Rule 4: one vouch, from a registered human who is not already vouching for someone else.
import { findName, sameName } from './registry';
import type { Applicant, Registry, Violation } from './types';

type VouchProblem = Omit<Extract<Violation, { rule: 'vouch' }>, 'rule'>;

/** Null when the voucher is registered, is not the applicant, and their vouch is free (or already theirs). */
export function checkVouch(a: Applicant, registry: Registry): VouchProblem | null {
  const voucher = a.voucher ?? null;
  if (!voucher) return { voucher, problem: 'none' };
  if (sameName(voucher, a.name)) return { voucher, problem: 'self' };
  const on = findName(registry, voucher);
  if (!on) return { voucher, problem: 'unregistered' };
  if (on.vouching !== null && on.vouching !== a.name) return { voucher, problem: 'busy', vouchingFor: on.vouching };
  return null;
}
