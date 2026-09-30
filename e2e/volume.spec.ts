import { expect, test, type Page } from '@playwright/test';

// The clerk's two volumes (reports/Volume controls for the desk rail.md): a fader for each in the settings, on
// the notice board and in the menu, 0 to 100, kept in the browser; the rail's switches mute, go dark when their
// channel cannot be heard, and bring a channel set to 0 back at the level it was last heard at.
const menu = (page: Page) => page.getByRole('dialog');
const audio = (page: Page) => page.evaluate(() => window.__audio!());
const saved = (page: Page, key: string) => page.evaluate((k) => localStorage.getItem(k), key);

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

test('each volume goes from 0 to 100 on its fader, by keys, by its − and + keys, and is kept', async ({ page }) => {
  await page.goto('/');
  const sound = page.getByRole('slider', { name: 'Sound volume' });
  const music = page.getByRole('slider', { name: 'Music volume' });
  // As the mix was made, until the clerk says otherwise.
  for (const fader of [sound, music]) {
    await expect(fader).toHaveValue('100');
    await expect(fader).toHaveAttribute('aria-valuetext', '100%');
  }

  await sound.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(sound).toHaveValue('99');
  await page.keyboard.press('Home');
  await expect(sound).toHaveValue('0');
  await page.keyboard.press('End');
  await expect(sound).toHaveValue('100');

  // The − and + keys step to the next multiple of 5.
  await page.getByRole('button', { name: 'Music volume down' }).click();
  await page.getByRole('button', { name: 'Music volume down' }).click();
  await expect(music).toHaveValue('90');
  await music.fill('63');
  await page.getByRole('button', { name: 'Music volume up' }).click();
  await expect(music).toHaveValue('65');
  await expect(music).toHaveAttribute('aria-valuetext', '65%');

  // Heard as it is set: the gain is the level squared, 65 is 0.4225.
  const heard = await audio(page);
  expect(heard).toMatchObject({ music: { level: 65, muted: false }, sound: { level: 100, gain: 1 } });
  expect(heard.music.gain).toBeCloseTo(0.4225, 9);
  expect(await saved(page, 'poh-music-volume')).toBe('65');

  await page.reload();
  await expect(page.getByRole('slider', { name: 'Music volume' })).toHaveValue('65');
  await expect(page.getByRole('slider', { name: 'Sound volume' })).toHaveValue('100');
});

test('the rail’s switch goes dark at 0, comes back at the last level heard, and a fader moved unmutes', async ({ page }) => {
  await page.goto('/');
  const board = page.getByRole('slider', { name: 'Sound volume' });
  await board.fill('40');
  await board.fill('0');
  await page.getByRole('button', { name: 'Start a new week' }).click();

  // The switch's lamp is out: nothing can be heard at 0.
  const rail = page.getByRole('button', { name: 'Sound' });
  await expect(rail).toHaveAttribute('aria-pressed', 'true');
  await rail.click();
  await expect(rail).toHaveAttribute('aria-pressed', 'false');
  expect((await audio(page)).sound).toMatchObject({ level: 40, muted: false });

  // M mutes and keeps the level; the menu's fader says so, and moving it brings the sound back.
  await page.keyboard.press('m');
  await expect(rail).toHaveAttribute('aria-pressed', 'true');
  expect((await audio(page)).sound).toMatchObject({ level: 40, muted: true, gain: 0 });
  await page.keyboard.press('Escape');
  const fader = menu(page).getByRole('slider', { name: 'Sound volume' });
  await expect(fader).toHaveAttribute('aria-valuetext', '40%, off');
  await fader.focus();
  await page.keyboard.press('ArrowRight');
  await expect(fader).toHaveAttribute('aria-valuetext', '41%');
  expect((await audio(page)).sound).toMatchObject({ level: 41, muted: false });
  expect(await saved(page, 'poh-muted')).toBe('0');
  expect(await saved(page, 'poh-sfx-volume')).toBe('41');
  await page.keyboard.press('Escape');
  await expect(menu(page)).toHaveCount(0);
  await expect(rail).toHaveAttribute('aria-pressed', 'false');
});

test('a clerk who muted the music before there were faders finds it muted, at the whole mix', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('poh-music-muted', '1'));
  await page.goto('/');
  await expect(page.getByRole('slider', { name: 'Music volume' })).toHaveAttribute('aria-valuetext', '100%, off');
  expect((await audio(page)).music).toEqual({ level: 100, muted: true, gain: 0 });
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await expect(page.getByRole('button', { name: 'Music' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Music' }).click();
  expect((await audio(page)).music).toEqual({ level: 100, muted: false, gain: 1 });
});
