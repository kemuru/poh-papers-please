# Restart, pause and "start again" UX for a small timed browser desk game

Scope: where a restart / new-game control lives, how it is confirmed, how Escape and pause behave, how timed games pause, how "Continue" is presented, and whether in-world (diegetic) wording hurts clarity. Target: "Proof of Humanity: Papers, Please" (React, local only; Space = window/next applicant, A = accept, C = challenge; 7-day week of newspaper -> ~6 min timed shift -> court -> accounts).

Source quality note: platform guidelines (Apple HIG, Microsoft Win32 UX guide, WAI-ARIA APG, MDN, Xbox Accessibility Guidelines, Game Accessibility Guidelines) and the NN/g article were fetched and are quoted. Papers, Please menu details come mostly from forum posts and search snippets (Steam and GameFAQs pages returned 403 or an age gate), so they are marked as lower confidence. Where something is convention rather than evidence, it says so.

## 1. Where do games put "new game" / "restart level" / "restart day"?

### Takeaway
There are two common places, and they do different jobs. "New game / start over" (throws away the save) sits on the title or main menu, next to Continue. "Restart this level/day" (throws away minutes of play) sits in the in-game pause menu opened with Escape, or on a single key in puzzle games. Papers, Please follows this split: Escape opens a pause menu that has restart-day options and a return to the main menu, and day branching (a new timeline from an earlier day) comes from the story save system.

### Cited Findings
- **Papers, Please, pause menu:** "hit ESC to bring up the pause menu. There's options to return to the main menu or quit the game entirely." — [GOG forum, "How to quit?"](https://www.gog.com/forum/papers_please/how_to_quit)
- **Papers, Please, restart-day buttons (lower confidence, search snippet only):** the pause menu has both "Restart Yesterday" and "Restart This Day" buttons, and players say they picked the wrong one by accident because "yesterday" is listed on top. — search-result summary drawn from [Steam discussions (Papers, Please)](https://steamcommunity.com/app/239030/discussions/0/3058490685019014441/?l=latam) and [Steam, "Redoing a day?"](https://steamcommunity.com/app/239030/discussions/0/540732889589548915/). I could not open either page to verify the exact wording (age gate / 403).
- **Papers, Please, branching saves:** Lucas Pope: "The save system in Papers Please supports branching from any day. Might be overkill." — [Lucas Pope on X, #screenshotsaturday (2013)](https://x.com/dukope/status/350919332613726208)
- Papers, Please "provide[s] an interesting save feature where players are able to redo their workday on a specific date and start a new timeline based on their choice… best described like a tree." — [choice-in-games (student site, secondary)](https://nadyabbq.wixsite.com/choice-in-games/blank); the story has 31 playable days — [Papers Please Wiki, Timeline](https://papersplease.fandom.com/wiki/Timeline)
- **Papers, Please (iOS):** the port adds "mid-day resume", i.e. quitting mid-shift and picking up where you were. — [App Store listing](https://apps.apple.com/us/app/papers-please/id935216956)
- **2048 (original web game):** a visible "New Game" button starts over at once, with no confirmation. The code is `restart = function () { this.storageManager.clearGameState(); this.actuator.continueGame(); this.setup(); }`, and the game state is saved after moves with `this.storageManager.setGameState(this.serialize())`. — [gabrielecirulli/2048, game_manager.js](https://github.com/gabrielecirulli/2048/blob/master/js/game_manager.js)
- **Baba Is You:** restart is a single key (R) next to undo (Z). When nothing is "YOU", the player is prompted to undo or restart. The developer said undoing out of a restart would be hard because the engine assumes a restart is a "fresh" start (search snippet). — [Steam, "Feature suggestion: a redo button"](https://steamcommunity.com/app/736260/discussions/0/1846946102851443797/); [BabaIsWiki, YOU](https://babaiswiki.fandom.com/wiki/YOU)
- **A timed puzzle game spec (HonestSudoku):** "Pause overlay hides the board and offers resume, restart this puzzle (same seed), new puzzle with same settings, rules, settings, main menu; the timer stops while paused." — [HonestSudoku issue #2](https://github.com/honestarcade/HonestSudoku/issues/2)
- **Accessibility:** "Allow the game to be started without the need to navigate through multiple levels of menus" (Basic, Cognitive) — [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/allow-the-game-to-be-started-without-the-need-to-navigate-through-multiple-levels-of-menus/). GAG also lists "Provide an autosave feature" and "Provide a manual save feature" (Intermediate) and "Ensure that all settings are saved/remembered" (Basic). — [GAG full list](https://gameaccessibilityguidelines.com/full-list/)

### Inferences
- For this game (a seeded 7-day week, no branching), the Papers, Please split fits well. **"Start the week again"** goes on a title/Continue screen, and also in the pause menu behind a confirmation. **"Restart this day"** (if we add it) goes only in the pause menu, because it only makes sense during the day.
- Papers, Please's reported misclick (two similar "Restart…" buttons stacked together) is a direct warning. Don't put "Restart day" and "Start the week again" next to each other with matching styling. Keep them apart, give them clearly different labels ("Redo today's shift" vs "Start the week over"), and put Resume first and closest.
- 2048 and Baba Is You can skip confirmation because a restart there costs seconds and the game is built around replaying. Our week restart throws away up to ~7 days × ~10 minutes of saved progress, so it belongs with the "confirm" group, not the "instant" group (see Q2).
- A small corner button (like 2048's) is fine for *opening* the menu, since it helps mouse-only players who don't know about Escape. It should open the pause menu, not restart anything directly.

### Gaps
- I could not confirm the exact layout and labels of Papers, Please's title menu (Story / Endless, the timeline tree screen) or its full pause-menu list from a primary source. Steam, GameFAQs and the Fandom wiki all blocked fetches. The "Restart Yesterday / Restart This Day" detail rests on a search snippet.
- I found no fetchable source for Wordle (it has no restart by design, since there is one puzzle a day, but this is uncited) or for common itch.io patterns in general.

## 2. Destructive-action patterns: confirm vs undo vs hold; wording; default focus; avoiding confirmation fatigue

### Takeaway
All the guidelines agree. Confirm only actions that are serious and can't be undone. Prefer undo where you can offer it. The message should name the consequence. Buttons should be specific verbs, not Yes/No/OK. Focus and the default should sit on the safe choice. Don't confirm routine or frequent actions, or players learn to click through without reading.

### Cited Findings
- NN/g: "Use a confirmation dialog before committing to actions with serious consequences — such as destroying users' work…"; "Do not use confirmation dialogs for routine actions… if you cry wolf too many times, people will stop paying attention." Instead of Yes/No, "provide response options that summarize what will happen" (e.g. "Delete file" / "Keep file"). "Be specific and inform users about the consequence of their action." Avoid a default "Yes". For very dangerous operations, require a non-standard action (e.g. typing DELETE). Undo remains the better protection. — [Jakob Nielsen, "Confirmation Dialogs Can Prevent User Errors — If Not Overused", NN/g, 18 Feb 2018](https://www.nngroup.com/articles/confirmation-dialog/)
- Microsoft Win32 UX guide (written for Windows 7, "much of the guidance still applies in principle"):
  - Warnings are for potential loss of "a valuable asset, such as data loss" or "User's time (a significant amount, such as 30 seconds or more)", and for mistakes that "can't be easily fixed, and may even be irreversible."
  - "Is the user about to abandon a task? If so, don't confirm." "Do users perform the action frequently? If so, consider an alternative design. Frequent confirmations are annoying… users learn to respond without thinking."
  - Alternatives to confirming: "physically separate destructive commands from other commands, and require multiple actions to complete"; "Provide undo."
  - Default response for "Risky action confirmations: Don't proceed (or the safe choice)."
  - Button wording: add "anyway" to the commit label (e.g. "Uninstall anyway") as "a small decision-making speed bump". "To close a program or restart Windows, use specific responses to the main instruction… don't use Close or Yes/No." "Never use OK and Cancel for confirmations."
  - "For risky action confirmations, use the term permanently to indicate that an action can't be undone." The main instruction should be "a single, complete sentence." Don't write "warning" or "caution" in the text.
  - "Don't show this message again" is only for routine confirmations. "Don't provide this option to justify displaying an unnecessary confirmation."
  - Source: [Microsoft Learn, Confirmations (Win32 UX guide)](https://learn.microsoft.com/en-us/windows/win32/uxguide/mess-confirm)
- Apple HIG, Alerts:
  - "Avoid using OK as the default button title… A specific button title like 'Erase,' 'Convert,' 'Clear,' or 'Delete' helps people understand the action they're taking." "Aim for a one- or two-word title that describes the result."
  - "If there's a destructive action, include a Cancel button… Always use the title 'Cancel'… you don't want to make a Cancel button the default button."
  - The destructive (red) style is for destructive actions "people didn't deliberately choose". When the person deliberately chose it (e.g. Empty Trash), the confirm button does *not* get the destructive style.
  - Cancel alternatives: "Escape (Esc) or Command-Period (.)".
  - "Avoid displaying alerts for common, undoable actions, even when they're destructive."
  - Source: [Apple Human Interface Guidelines, Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- WAI-ARIA APG: "If a dialog contains the final step in a process that is not easily reversible, such as deleting data… it may be advisable to set focus on the least destructive action." — [WAI-ARIA APG, Dialog (Modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- Material Design 3 (lower confidence: the page renders client-side and I only got a summary, not verbatim text) reportedly recommends specific verbs over Yes/No for confirmations, dismissal via scrim or Escape, and snackbars with undo for less critical actions. — [Material Design 3, Dialogs guidelines](https://m3.material.io/components/dialogs/guidelines)
- **Conflict on the cancel label:** Apple says always "Cancel". NN/g suggests an outcome label like "Keep file". Microsoft allows specific responses (e.g. "Save" / "Don't save").

### Inferences
- **Start the week again:** a real confirmation is justified. It destroys saved progress, can't be undone, and is rare. Suggested shape (convention, not tested): the title states the consequence ("Start the week over?"), one supporting sentence names what is lost with the specific saved point ("Days 1–3, your balance and the registry will be shredded. This can't be undone."). Buttons are "Keep my week" (focused, safe) and "Start over" (not the default). Don't use Yes/No/OK.
- **Restart this day:** a lighter touch. It costs at most one ~6-minute shift, which still counts as "significant time" by Microsoft's 30-second test. Options: (a) a confirmation using the same pattern, or (b) no dialog, but keep it separated in the pause menu and fire it only on a deliberate click (the "prevent errors / separate commands" alternative). If the day's start is saved as a snapshot, the restart could also offer "Undo" briefly, which the guidelines prefer over confirming.
- **No "don't ask again" checkbox** on the week reset (Microsoft: only for routine confirmations).
- **Undo for the week reset:** keeping the previous save in a second storage slot until the player makes their first decision in the new week would give an undo path. That would let the dialog be softer. This is a design option, not something a source prescribes.
- **Hold-to-confirm** would conflict with our keyboard-heavy flow and has no guideline support in what I found (see Gaps). A normal dialog with focus on the safe option is the documented default.

### Gaps
- No primary source found on "hold to confirm" (press-and-hold buttons) in games: evidence, accessibility impact, or usability data. Common in console games (e.g. hold a button to quit or delete a save) but uncited here.
- No usability study found that measures confirmation fatigue in games specifically. The guidance above comes from general software.

## 3. Keyboard conventions: Escape, layering, focus trapping, conflicts

### Takeaway
Escape is the platform "close request". It closes the topmost dialog or popover, and in games it conventionally opens and closes the pause menu. The layered rule (Escape closes whatever is on top first; only with nothing open does it open the pause menu) is convention and matches how browser close requests work. A modal pause or confirm dialog must trap Tab, close on Escape, put focus inside (on the safe option for destructive steps), and return focus afterwards. **Codebase note:** Escape is currently bound to *toggle* Inspect mode during the shift. That breaks the "Escape only closes" convention and clashes with Escape-for-pause.

### Cited Findings
- WAI-ARIA APG, modal dialog: Tab / Shift+Tab wrap inside the dialog; "Escape: Closes the dialog." On close, focus "typically returns to the invoking element". Use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` (visible title) or `aria-label`, with an optional `aria-describedby`. — [WAI-ARIA APG, Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- Apple HIG lists Escape (and Cmd-Period) as the keyboard way to cancel an alert. — [Apple HIG, Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- Browser model: close requests "are typically the ESC key on desktop platforms, and the back gesture or button on Android". `<dialog>` and `popover` respond to them. — [Chrome for Developers, New in Chrome 120 (CloseWatcher)](https://developer.chrome.com/blog/new-in-chrome-120). `CloseWatcher` lets custom UI "respond to device-specific close actions in the same way as a built-in component". A `cancel` event fires first and can be prevented, then `close`. Several watchers created without user activation are grouped, so one Escape closes them all. — [MDN, CloseWatcher](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher)
- Papers, Please uses Escape to open its pause menu. — [GOG forum](https://www.gog.com/forum/papers_please/how_to_quit)
- **Codebase:** `src/ui/Shift.tsx` line ~119 has `else if (key === 'escape') keys.current.toggleInspect();`, the same action as the `i` key. So pressing Escape when not inspecting *enters* Inspect mode. The handler ignores modifier keys and repeats, skips inputs/textareas, and treats Space on a focused button as a button press. `src/ui/Game.tsx` ~81 binds `m` to sound. `src/ui/Screens.tsx` ~22 advances non-shift screens with Space/Enter. (Local code read, 28 Sep 2026.)

### Inferences
- Recommended Escape precedence (convention): **1)** close the confirmation dialog if open (safe choice); **2)** close the pause menu if open (= Resume); **3)** leave Inspect mode if active; **4)** otherwise open the pause menu. Escape should never *enter* Inspect. Keep `i` as the toggle, and make Escape only cancel it.
- While the pause menu or a confirmation is open, the Shift's window-level keydown handler must ignore Space/A/C/I/1–6. Otherwise "A" in a dialog would stamp an applicant behind it. Stopping at the dialog layer (or checking a `paused` flag in the Shift handler) is required, not optional.
- Space and Enter activate the focused button inside the dialog (native button behaviour). With focus on the safe option, a player who presses Space out of habit (Space = "next applicant") lands on "Keep my week" / "Resume", not on the destructive action. This is a concrete reason to put focus on the safe button.
- The native `<dialog>` element with `showModal()` provides Escape-to-close, inertness of the page behind it, and top-layer stacking with little code. It fits the "no new dependency" rule.
- Give the pause menu a visible, clickable entry point (a small "Pause"/"Menu" control in a corner) so it isn't only reachable by Escape. The project's "no dead clicks" and "immediate feedback" rules point the same way.

### Gaps
- I didn't verify the exact stacking order in the HTML spec's close-watcher definition (most-recent-first is my understanding, not confirmed in the pages fetched).
- No game-specific source found that states the "Escape closes before it opens" rule. It is a widespread convention (e.g. in PC games generally) but uncited here.

## 4. Pausing timed levels: clock, hiding the play field, auto-pause on hidden tab

### Takeaway
Single-player timed games stop the clock while the pause menu is open. Timed puzzle games also hide the board so pausing can't be used to plan for free. Browsers already stop `requestAnimationFrame` and throttle timers in background tabs, and auto-pausing when the page is hidden is expected. **Codebase note:** our shift clock already stops while `document.hidden`, and audio is suspended on `visibilitychange`.

### Cited Findings
- Timed puzzle pause spec: "Pause overlay hides the board… the timer stops while paused." — [HonestSudoku issue #2](https://github.com/honestarcade/HonestSudoku/issues/2). A second open-source Sudoku: tapping Pause pauses the timer and shows an opaque overlay "hiding the Sudoku board completely" to prevent cheating (search snippet). — [OpenGameStack Sudoku issue #13](https://github.com/OpenGameStack-Games/Sudoku/issues/13). A request titled "Pause Timer if app is hidden or in background" shows players expect this. — [likhithpraveenk/sudoku issue #8](https://github.com/likhithpraveenk/sudoku/issues/8)
- **Counterexample:** Brainium Sudoku reportedly does *not* pause when you open other tabs in the app, "to prevent cheating" on leaderboards (search snippet). — [Brainium Sudoku Help Center](https://brainium.helpshift.com/hc/en/7-sudoku/faq/472-how-do-i-pause-the-game/)
- **Tetris resume countdown (conflicting sources):** a search snippet attributes to the Tetris Guideline: "Game must count down from 3 after you press start, and after you resume a paused game." — [Tetris Wiki (Fandom), Tetris Guideline](https://tetris.fandom.com/wiki/Tetris_Guideline). However, the page I fetched at [TetrisWiki, Tetris Guideline](https://tetris.wiki/Tetris_Guideline) had no pause section. Treat as unverified.
- Browser behaviour: "Most browsers stop sending requestAnimationFrame() callbacks to background tabs"; "Timers such as setTimeout() are throttled in background/inactive tabs"; `visibilitychange` fires when the user "minimizes the window, switches to another tab, or the document is entirely obscured". Example use: pause a video when the tab goes to the background and resume on return. — [MDN, Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- Accessibility: "Do not make precise timing essential to gameplay – offer alternatives, actions that can be carried out while paused, or a skip mechanism" (Advanced, Motor). — [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/do-not-make-precise-timing-essential-to-gameplay-offer-alternatives-actions-that-can-be-carried-out-while-paused-or-a-skip-mechanism/). XAG 116 exempts core gameplay timers ("a countdown timer of three minutes to finish a track") from its time-limit rules, but says UI time limits need to be adjustable. — [Xbox Accessibility Guideline 116](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/116)
- Pausing doesn't always mean everything stops: "Pausing may suspend some of the computer's actions that are associated with the game world, but it does not necessarily suspend play." Games like Breath of the Wild let players take strategic actions inside the pause menu. — [Madison Schmalzer, "Play While Paused", Journal of Games Criticism, 2023](https://gamescriticism.org/2023/07/25/play-while-paused-time-and-space-in-videogame-pause-menus/)
- **Codebase:** `useShiftClock` in `src/ui/Shift.tsx` (~266–285) adds `performance.now()` deltas every 250 ms only `if (!document.hidden)`. Its doc comment says "paused while the tab is hidden". `src/ui/sound.ts` ~37 suspends and resumes the AudioContext on `visibilitychange`. (Local code read.)

### Inferences
- The pause menu should stop the shift clock (pass `running=false` to `useShiftClock`, same as when the tab is hidden) and stop the music/ambience.
- **Hide or cover the desk while paused.** The shift is a timed inspection task, so a paused but visible desk gives the player free time to study documents and the rulebook. Following the Sudoku convention, cover the booth with an opaque layer (an in-world "window closed" shutter fits). This matters because the game's core challenge is reading evidence under time pressure.
- **Tab hidden:** already handled for the clock. Showing the pause menu when the player comes back to the tab (instead of silently resuming) is a common convention. It gives a moment to re-orient, similar in purpose to the reported Tetris resume countdown, but I found no primary source requiring it.
- Screens without a clock (newspaper, court, accounts) don't need a "pause". Escape there can open the same menu, just without the "clock stopped" meaning.
- Any "Restart this day" should reset to the day's start snapshot (morning paper or start of shift, as chosen), and the seeded generator must reproduce the same applicants, in line with the project invariant "Same seed, same week."

### Gaps
- I couldn't confirm whether Papers, Please stops its day clock or hides the booth while its pause menu is open (probable, but no source found).
- No player-research data found on expectations for auto-pause when a tab is hidden in browser games specifically. Only developer docs and issue titles.

## 5. "Continue" affordances: showing the saved point; title screen vs resuming straight into play

### Takeaway
Two patterns exist. Casual web games (2048) save continuously and drop you straight back into play on load. Story or campaign games show a title menu where Continue is the main action and New Game / Start over is secondary. Accessibility guidance favours getting into play with as few menu steps as possible. Showing *where* the save is (e.g. "Continue — Day 3, morning paper") is common practice, but I found no guideline stating it.

### Cited Findings
- 2048 writes the game state to storage as you play (`setGameState(this.serialize())`) and clears it only on restart (`clearGameState()`), so reloading doesn't lose the board. — [gabrielecirulli/2048, game_manager.js](https://github.com/gabrielecirulli/2048/blob/master/js/game_manager.js)
- Papers, Please (iOS) advertises "mid-day resume". — [App Store](https://apps.apple.com/us/app/papers-please/id935216956). Its story mode lets players branch "from any day". — [Lucas Pope on X](https://x.com/dukope/status/350919332613726208)
- "Understanding and navigating through complex menus… can present a significant barrier to entry for people with… dyspraxia… or impaired short term memory." The guideline recommends a quick-start route. — [GAG, "Allow the game to be started without the need to navigate through multiple levels of menus"](https://gameaccessibilityguidelines.com/allow-the-game-to-be-started-without-the-need-to-navigate-through-multiple-levels-of-menus/). "Provide an autosave feature" (Intermediate). — [GAG full list](https://gameaccessibilityguidelines.com/full-list/)
- Microsoft: a confirmation should give "sufficient information for users to answer that question intelligently". — [Microsoft Learn, Confirmations](https://learn.microsoft.com/en-us/windows/win32/uxguide/mess-confirm). This supports naming the saved point in the Start-over dialog.

### Inferences
- **For this game:** on reload with a save present, show one small screen with **Continue** focused (Space/Enter activates it, matching the existing "Space advances screens" habit). Label it with the saved point in plain words, e.g. "Continue — Day 3 · Morning paper", and put a quieter "Start the week over" link underneath that opens the confirmation. With no save, go straight to Day 1 (no extra menu), following the GAG quick-start guideline.
- **Resume granularity:** saving at screen boundaries (newspaper, shift start, court, accounts) is simpler and fits "Same seed, same week". If a reload happens mid-shift, restarting that shift from its start is a reasonable, honest behaviour, as long as the Continue label says so ("Day 3 · Shift (restarts)"). Papers, Please desktop saves per day. Mid-day resume was an extra added for the mobile port.
- The same saved-point string can be used in the Start-over confirmation ("Your week so far — Day 3, $X — will be lost"), which makes the consequence concrete (NN/g: "be specific").

### Gaps
- No primary source or study found on labelling Continue with save details, or on title-screen vs straight-into-play preferences in browser games. These are conventions.
- Could not verify what Papers, Please's desktop main menu shows (whether there is a "Continue" button vs the Story timeline).

## 6. Tone: in-world (diegetic) restart and quit dialogs, and clarity

### Takeaway
In-world menus (a menu built into the game world, e.g. Samus's helmet view in Metroid, Bond's watch in GoldenEye) are an established technique and add immersion. Nothing I found shows they help clarity, and the confirmation guidelines above say the main instruction and button labels must state the consequence plainly. The safe approach is flavour in the framing and chrome (a form, a stamp, a clerk's memo), with plain, specific words in the title and on the two buttons.

### Cited Findings
- In-world pause menus: Super Metroid / Fusion / Zero Mission styled the pause menu as the inside of Samus's helmet. GoldenEye 007's watch served as pause menu and inventory, and the character raises his arm to look at it (search snippets; underlying pages partly low-quality blogs). — [TV Tropes, Diegetic Interface](https://tvtropes.org/pmwiki/pmwiki.php/Main/DiegeticInterface); [Game Developer, "Diegesis and designing for immersion"](https://www.gamedeveloper.com/design/diegesis-and-designing-for-immersion) (title only, not fetched)
- Pause menus range from "paratextual breaks" (e.g. Call of Duty: MW3, where players "navigate hierarchical lists instead of diegetic worlds") to spaces where "strategic and diegetic actions are taken" (Breath of the Wild). — [Schmalzer, Journal of Games Criticism, 2023](https://gamescriticism.org/2023/07/25/play-while-paused-time-and-space-in-videogame-pause-menus/)
- Clarity requirements that any in-world wording must still meet:
  - Button titles should describe "the result of selecting the button". Avoid OK. — [Apple HIG, Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
  - Response options should "summarize what will happen". — [NN/g](https://www.nngroup.com/articles/confirmation-dialog/)
  - Use "permanently" for irreversible actions, and "Good confirmations never state the obvious; they should communicate something users need to be aware of." — [Microsoft Learn, Confirmations](https://learn.microsoft.com/en-us/windows/win32/uxguide/mess-confirm)

### Inferences
- A deadpan bureaucratic frame suits this game well, e.g. a "Form 7-B: Request to Restart the Week" slip. This is fine *if* the form's heading and the buttons still say the plain thing ("Start the week over?" / "Shred my week" or "Start over" vs "Keep my week"), and one line says what is lost and that it can't be undone. Jokes go in the small print, the form number or a stamp, never in place of the consequence. This matches the project rule "If unsure a line is funny, cut it" and AGENTS.md's "Only the evidence reveals validity… never UI labels", in spirit: labels are for clarity.
- Avoid in-world synonyms for the buttons that make the player decode what they do ("File" / "Withdraw" for Start over / Cancel). That is exactly the "OK means what?" ambiguity Apple warns about.
- Follow Apple's note that a deliberately chosen destructive action doesn't need red, "danger" styling. A red "APPROVED" stamp animation could appear *after* the player confirms, as feedback, instead of making the button itself alarming.
- Per project rules, any new menu text belongs in `src/content/`, not in the UI component.

### Gaps
- No usability study found that compares clarity of diegetic and plain menus for destructive confirmations. The claims about in-world menus found were descriptive or from low-quality blogs (the Wayline blog results looked generic, so I excluded them).
- Couldn't check whether Papers, Please's own pause and restart dialogs use in-world styling (screenshots and wiki pages were not reachable).
