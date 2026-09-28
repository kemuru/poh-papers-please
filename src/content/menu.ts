// The clerk's break: the menu behind Escape, and the words for keeping or losing a week.
// Buttons say plainly what they do; the Ministry's voice is in the lines around them.
// "{day}" is today's number; "{days}" and "{savings}" are what a new week would cost.

export const MENU = {
  button: 'Menu',
  key: 'Esc',
  head: 'Ministry of Humanity · Window 3',
  paused: { title: 'Paused', line: 'The queue will wait. It is used to it.' },
  resumed: { title: 'Welcome back', line: 'Your desk is as you left it.' },
  setAside: {
    title: 'Welcome back',
    line: 'The Ministry has revised its forms since your last visit. Your week could not be kept, and a new one has begun.',
  },
  /** Where the week stands, under the title. */
  where: {
    morning: 'Day {day} · Morning',
    open: 'Day {day} · At the window',
    left: 'Day {day} · At the window · {left} left',
    closing: 'Day {day} · Closing time',
    court: 'Day {day} · In court',
    statement: 'Day {day} · The accounts',
    ending: 'Day {day} · The letter',
  },
  back: 'Back to the window',
  begin: 'Begin the week',
  dayAgain: 'Start day {day} again',
  newWeek: 'Start a new week',
  saved: 'Your week is saved in this browser after every stamp.',
  unsaved: 'This browser is not keeping saves. Reloading the page will lose the week.',
  confirmDay: {
    title: 'Start day {day} again?',
    line: 'You will be back at this morning’s paper with this morning’s savings. Everything stamped since will be shredded.',
    yes: 'Start day {day} again',
  },
  confirmWeek: {
    title: 'Start a new week?',
    line: 'This week will be shredded for good: {days} at the window and {savings} PNK in savings. The new week begins on day 1.',
    yes: 'Start a new week',
  },
  keep: 'Keep playing',
  /** On the out-of-order screen, where a reload alone would break the same way again. */
  broken: 'Start a new week',
} as const;
