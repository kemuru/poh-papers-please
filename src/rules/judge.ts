// The rule engine. Pure: the same applicant, rulebook and registry always get the same judgment.
import { checkDuplicate } from './duplicate';
import { checkHuman } from './human';
import { checkLiving } from './living';
import { checkPhrase } from './phrase';
import { checkPhoto } from './photo';
import { checkSign } from './sign';
import type { Applicant, Judgment, Registry, RuleId, Rulebook, Violation } from './types';
import { checkVouch } from './vouch';

/**
 * The day each rule enters the rulebook. Rules stay once introduced. Rule 0 was in force before the
 * week began: the registry has always been for humans, and the other rules are how the desk can tell.
 */
export const RULE_DAYS: Record<RuleId, number> = { human: 0, phrase: 1, photo: 2, sign: 3, vouch: 4, duplicate: 5, living: 6 };

/** Every rule, in rulebook order. */
export const RULES = Object.keys(RULE_DAYS) as RuleId[];

export const rulebookForDay = (day: number): Rulebook => RULES.filter((rule) => RULE_DAYS[rule] <= day);

const CHECKS: { [R in RuleId]: (applicant: Applicant, registry: Registry) => Extract<Violation, { rule: R }> | null } = {
  human: (a) => {
    const found = checkHuman(a);
    return found && { rule: 'human', ...found };
  },
  phrase: (a) => {
    const marks = checkPhrase(a.video.transcript);
    return marks && { rule: 'phrase', ...marks };
  },
  photo: (a) => {
    const found = checkPhoto(a);
    return found && { rule: 'photo', ...found };
  },
  sign: (a) => {
    const found = checkSign(a);
    return found && { rule: 'sign', ...found };
  },
  vouch: (a, registry) => {
    const found = checkVouch(a, registry);
    return found && { rule: 'vouch', ...found };
  },
  duplicate: (a, registry) => {
    const match = checkDuplicate(a, registry);
    return match && { rule: 'duplicate', match };
  },
  living: (a) => {
    const found = checkLiving(a);
    return found && { rule: 'living', ...found };
  },
};

/** Judged against the registry as it stands when the applicant reaches the window. */
export function judge(applicant: Applicant, rulebook: Rulebook, registry: Registry): Judgment {
  const violations = rulebook.flatMap((rule): Violation[] => {
    const found = CHECKS[rule](applicant, registry);
    return found ? [found] : [];
  });
  return { valid: violations.length === 0, violations };
}

export type Decision = 'accept' | 'challenge';
/** correct: the clerk accepted a valid applicant, or challenged one who broke a rule. */
export type Outcome = { correct: boolean; violations: Violation[] };

/**
 * A challenge names no rule: it says the application is wrong, and the court finds whatever is.
 * It is upheld if the applicant broke any rule in force, and dismissed if they broke none.
 */
export const decide = (decision: Decision, judgment: Judgment): Outcome => ({
  correct: decision === 'accept' ? judgment.valid : !judgment.valid,
  violations: judgment.violations,
});
