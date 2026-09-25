// The rule engine. Pure: the same applicant, rulebook and registry always get the same judgment.
import { checkPhrase } from './phrase';
import type { Applicant, Judgment, Registry, RuleId, Rulebook, Violation } from './types';

/** The day each rule enters the rulebook. Rules stay once introduced. */
const RULE_DAYS: Record<RuleId, number> = { phrase: 1 };

export const rulebookForDay = (day: number): Rulebook =>
  (Object.keys(RULE_DAYS) as RuleId[]).filter((rule) => RULE_DAYS[rule] <= day);

const CHECKS: Record<RuleId, (applicant: Applicant, registry: Registry) => Violation | null> = {
  phrase: (applicant) => {
    const marks = checkPhrase(applicant.video.transcript);
    return marks && { rule: 'phrase', ...marks };
  },
};

export function judge(applicant: Applicant, rulebook: Rulebook, registry: Registry): Judgment {
  const violations = rulebook.flatMap((rule) => CHECKS[rule](applicant, registry) ?? []);
  return { valid: violations.length === 0, violations };
}

export type Decision = 'accept' | 'challenge';
/** correct: the clerk accepted a valid applicant or challenged an invalid one. */
export type Outcome = { correct: boolean; violations: Violation[] };

/** Until the court exists, a challenge is settled by the truth. */
export const decide = (decision: Decision, judgment: Judgment): Outcome => ({
  correct: judgment.valid === (decision === 'accept'),
  violations: judgment.violations,
});
