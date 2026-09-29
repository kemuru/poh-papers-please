import { expect, type Page } from '@playwright/test';
import type { GeneratedApplicant } from '../src/gen/applicant';
import { litFrames } from '../src/rules/face';

// Slice 4: a challenge carries to court what Inspect found on the applicant. These are a careful
// clerk's two clicks for each kind of fault the generator plants, so a spec can challenge a fake
// with evidence, as a player who checked would.

const RULE_KEY = { phrase: '1', face: '2', sign: '3', vouch: '4', duplicate: '5', living: '6' } as const;

/** Points Inspect at the two things that show the applicant's (first) planted fault, and waits for the discrepancy. */
export async function inspectFault(page: Page, a: GeneratedApplicant) {
  const fault = a.planted[0];
  if (!fault) throw new Error(`${a.name} has no planted fault to find`);
  const tool = page.getByRole('button', { name: 'Inspect', exact: true });
  if ((await tool.getAttribute('aria-pressed')) !== 'true') await tool.click();
  const point = (label: string) => page.getByRole('button', { name: `Inspect ${label}`, exact: true }).click();
  // The rulebook falls open at the rule's page (its number key), and the rule is the second thing.
  const againstRule = async () => {
    await page.keyboard.press(RULE_KEY[fault.rule]);
    await point(`Rule ${RULE_KEY[fault.rule]}`);
  };
  switch (fault.rule) {
    case 'phrase':
      await point('the transcript');
      await againstRule();
      break;
    case 'face':
      // A light or a face that turns into another shows in a frame, against the rule; anything else, the photo against a frame.
      if (fault.mistake === 'machine' || fault.mistake === 'deepfake') {
        await point(`frame ${litFrames(a.video)[0] ?? a.video.glitch?.frame ?? 1}`);
        await againstRule();
      } else {
        await point('the photo');
        await point('frame 1');
      }
      break;
    case 'sign':
      await point('the sign');
      await point('the wallet');
      break;
    case 'vouch':
      await page.keyboard.press('v');
      await point('the voucher');
      await point(`the registry's answer for ${a.voucher}`);
      break;
    case 'duplicate':
      await page.keyboard.press('f');
      await point("the registry's answer for the face");
      await point('the photo');
      break;
    case 'living':
      await point(fault.mistake === 'version' || fault.mistake === 'year-typo' || fault.mistake === 'ancient' ? 'the year of birth' : 'frame 1');
      await againstRule();
      break;
  }
  await expect(page.getByTestId('inspector')).toContainText('Discrepancy');
}
