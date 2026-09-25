import type { Applicant, Judgment, Registry, Rulebook } from '../model';

// Punctuation separates words; case and whitespace have no bearing on compliance.
function words(phrase: string): string {
  return (phrase.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).join(' ');
}

export function judge(applicant: Applicant, rulebook: Rulebook, _registry: Registry): Judgment {
  const valid = words(applicant.video.transcript) === words(rulebook.requiredPhrase);
  return { valid, violations: valid ? [] : ['day-1-phrase'] };
}
