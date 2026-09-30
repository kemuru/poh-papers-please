// The clerk's two volumes, one for the desk's sounds and one for the music (reports/Volume controls for the
// desk rail.md). Each is a level from 0 to 100, set on a fader in the settings, and a mute, kept apart from it:
// the rail's switch silences a channel and brings it back at the level it had, and moving a fader always
// makes its channel heard. The level is what is saved, never the gain, so the curve can change freely.

export type Channel = { level: number; muted: boolean };

/** Where both faders start: the mix as it was made, the music well under the stamp. */
export const FULL = 100;
/** The −/+ keys and Page Up/Down: about 1 dB at the top, 2 dB at halfway, twenty steps from end to end. */
export const STEP = 5;

export const clampLevel = (level: number) => Math.min(FULL, Math.max(0, Math.round(level)));

/** The −/+ keys: to the next step down or up, so 63 goes to 60 or 65, never to 58 or 68. */
export const stepDown = (level: number) => clampLevel((Math.ceil(level / STEP) - 1) * STEP);
export const stepUp = (level: number) => clampLevel((Math.floor(level / STEP) + 1) * STEP);

/**
 * Loudness as it is heard, not amplitude: the gain is the level squared, so halfway is 12 dB down, not 6
 * (a straight line leaves the top half of the fader doing nothing), 10 is 40 dB down and 0 is silence.
 */
export const levelToGain = (level: number) => (clampLevel(level) / FULL) ** 2;

export const gainOf = (channel: Channel) => (channel.muted ? 0 : levelToGain(channel.level));

/** Whether the channel can be heard at all: what the rail's lamp shows. */
export const audible = (channel: Channel) => !channel.muted && channel.level > 0;

/** The rail's switch (and M, for the sound): silence what can be heard; bring back what cannot, and a channel set to 0 at the last level it was heard at. */
export const toggle = (channel: Channel, lastHeard: number): Channel =>
  audible(channel) ? { ...channel, muted: true } : { level: channel.level || clampLevel(lastHeard) || FULL, muted: false };

/** A fader moved: its level, and its channel heard again if it was muted. */
export const withLevel = (level: number): Channel => ({ level: clampLevel(level), muted: false });

/** A saved level, strictly: a whole number from 0 to 100, or the default. */
export const readLevel = (saved: string | null) => (saved !== null && /^\d{1,3}$/.test(saved) && Number(saved) <= FULL ? Number(saved) : FULL);
