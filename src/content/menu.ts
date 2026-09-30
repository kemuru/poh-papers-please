// The clerk's break: the menu behind Escape, and the words for keeping or losing a week.
// Buttons say plainly what they do; the Ministry's voice is in the lines around them.
// "{day}" is today's number; "{days}" and "{savings}" are what a new week would cost.

export const MENU = {
  button: 'Menu',
  key: 'Esc',
  /** In the corner of the menu's form, as a form's number is. */
  head: 'Window 3',
  paused: { title: 'Paused', line: 'The queue will wait. It is used to it.' },
  /** Where the week stands, typed on the menu's form and on the notice board. */
  where: {
    morning: 'Day {day}, morning',
    open: 'Day {day}, at the window',
    left: 'Day {day}, at the window, {left} left',
    closing: 'Day {day}, closing time',
    court: 'Day {day}, in court',
    statement: 'Day {day}, the accounts',
    ending: 'Day {day}, the letter',
  },
  back: 'Back to the window',
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
  /** Leaves the desk for the notice board. The week stays where it is. */
  board: 'Notice board',
  /** Any earlier morning of the week, from the menu or the letter at the end. */
  backTo: 'Go back to the morning of',
  backDay: 'day {day}',
  confirmBack: {
    title: 'Go back to the morning of day {day}?',
    line: 'You will be back at that morning’s paper with that morning’s savings. Everything stamped since will be shredded: {days} at the window.',
    yes: 'Go back to day {day}',
  },
  settings: {
    head: 'Settings',
    shortcuts: 'Single-key shortcuts',
    motion: 'Reduce motion',
    on: 'On',
    off: 'Off',
    /** When the browser itself asks for reduced motion, which it always gets. */
    forced: 'On, as your browser asks',
  },
} as const;
