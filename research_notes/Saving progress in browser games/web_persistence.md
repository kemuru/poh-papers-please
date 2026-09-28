# Persisting a local-only browser game's progress (state of practice, September 2026)

Context for the report writer: the game is a React 19.3 + Vite 6 + TypeScript SPA (`package.json`), served in dev on `localhost:5175` (`vite.config.ts`). Game logic is a pure reducer and the week is deterministic from seed + decisions. The repo already stores one preference in `localStorage` with try/catch (`src/ui/sound.ts:7-21`, key `poh-muted`, comment "Private mode: the setting lasts until the page closes"). The shift clock is UI state inside `useShiftClock` (`src/ui/Shift.tsx:266-285`). It is a `setInterval(250ms)` that adds `performance.now()` deltas and skips adding while `document.hidden`. Vitest runs in the default Node environment: `vite.config.ts` sets no `environment`, and neither jsdom nor happy-dom is installed. Local Node is v20.18.3 and Playwright is ^1.63.

## Q1. Which storage API: localStorage vs sessionStorage vs IndexedDB/OPFS. Quotas, eviction, private windows, SecurityError, feature detection

### Takeaway
For a save of a few KB, use `localStorage`: it is synchronous, tiny compared with its 5 MiB per-origin limit, and survives tab close. Guard every access, including the property read `window.localStorage`, with try/catch, and fall back to an in-memory session. `sessionStorage` does not survive closing the tab, and IndexedDB/OPFS add async complexity with no benefit at this size. Two real risks exist. Safari deletes all script-written storage after 7 days of Safari use without interaction with the site. Private windows wipe storage when they close. `navigator.storage.persist()` is not worth it here: Firefox shows a permission prompt.

### Cited Findings
**Limits and quotas**
- Web Storage is limited to "10 MiB maximum total across both APIs": 5 MiB for localStorage plus 5 MiB for sessionStorage per origin, in all browsers. Going over throws `QuotaExceededError`. — [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) (last modified Jan 5, 2026)
- IndexedDB/Cache/OPFS quotas are much larger:
  - Chrome: 60% of total disk per origin.
  - Firefox best-effort: min(10% of disk, 10 GiB). Firefox persistent: 50% of disk, capped at 8 TiB.
  - Safari 17+ browser apps: ~60% of disk per origin. Non-browser WebKit apps: ~15%. Cross-origin frames: ~1/10 of the parent's quota.
  - Older Safari: 1 GiB with a user prompt.
  - Source: [MDN quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Quotas are "calculated on total disk size, not available space" to prevent fingerprinting. — [MDN quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Safari 17 / iOS 17 / macOS Sonoma (post dated Aug 10, 2023) set:
  - origin quota: "up to 60% of the total disk space" for browser apps
  - overall quota: 80% of disk
  - full support for `estimate()`, `persisted()` and `persist()`, with persistence granted by "heuristics like whether the website is opened as a Home Screen Web App"
  - Source: [WebKit blog: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)

**Eviction**
- Under storage pressure, eviction is LRU and removes all of an origin's data at once. It applies only to best-effort (non-persistent) origins. — [MDN quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- In WebKit's LRU, the last-use time is "the time of the last user interaction, or the time of the last storage operation". Origins with active pages or persistent storage are excluded from eviction. — [WebKit blog 2023](https://webkit.org/blog/14403/updates-to-storage-policy/)
- **Safari 7-day cap.** "ITP deletes all cookies created in JavaScript and all other script-writeable storage after 7 days of no user interaction with the website." This covers "IndexedDB, LocalStorage, Media keys, SessionStorage, Service Worker registrations and cache". "The first-party domain of home screen web applications is exempt." — [WebKit: Tracking Prevention](https://webkit.org/tracking-prevention/)
- The 7-day cap was introduced in Safari 13.1 / iOS 13.4 (March 24, 2020). The count is "seven days of Safari use without user interaction on the site". Home-screen web apps "have their own counter of days of use". — [WebKit blog: Full Third-Party Cookie Blocking and More](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- MDN calls this "Proactive eviction (Safari only)". It is triggered when cross-site tracking prevention is on and there has been no user interaction in the last 7 days. It deletes script-created data from all storage APIs. — [MDN quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- The Chrome team found "data is very rarely cleared automatically by Chrome. It is far more common for users to manually clear storage." — [web.dev: Persistent storage](https://web.dev/articles/persistent-storage) (dated 2020-05-12)

**Persistent storage**
- `persist()` behaviour differs by browser:
  - Chrome/Edge grant or deny silently from engagement heuristics (visits, bookmark, install, notification permission).
  - Firefox shows a permission popup.
  - The same page says Safari supports the API from 15.2.
  - Persistence covers "DOM Storage (Local Storage)".
  - Advice: request it during a meaningful user action, "never on page load".
  - Source: [web.dev: Persistent storage](https://web.dev/articles/persistent-storage)
  - Version conflict: web.dev says Safari 15.2, while the [WebKit blog](https://webkit.org/blog/14403/updates-to-storage-policy/) says "full support … as of Safari 17.0". Most likely the API shipped in 15.2 and got real grant heuristics in 17.

**Private windows and blocked storage**
- "localStorage data for a document loaded in a 'private browsing' or 'incognito' session is cleared when the last 'private' tab is closed." — [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (last modified Jul 28, 2026)
- `SecurityError` is thrown in two cases:
  - when the origin is not a valid tuple (e.g. `file:` or `data:`)
  - when "the request violates a policy decision. For example, the user has configured the browsers to prevent the page from persisting data". MDN adds: "if the user blocks cookies, browsers will probably interpret this as an instruction to prevent the page from persisting data."
  - Source: [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- localStorage is per protocol: `http://` and `https://` of the same host are separate stores. `file:` URL behaviour "is undefined and may vary among different browsers". — [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- Old Safari private mode returned a localStorage with "a quota of 0 bytes", so `setItem` threw. Testers found reads and writes working in private tabs on iOS 11.0 and 15.4, and MDN's text was updated to call the old behaviour legacy. — [mdn/content issue #17827](https://github.com/mdn/content/issues/17827)
- Firefox enabled IndexedDB in Private Browsing (encrypted, deleted at session end) in Firefox 115. Before that, only localStorage worked in Firefox private windows. — [Mozilla dev-platform "Intent to ship: IndexedDB API in Private Browsing Mode"](https://groups.google.com/a/mozilla.org/g/dev-platform/c/yy7uUP47KGQ) (from the search-result summary; thread not opened)
- Accessing localStorage from a cross-origin iframe in Safari throws `SecurityError: The operation is insecure`. — [TrackJS: "The operation is insecure"](https://trackjs.com/javascript-errors/the-operation-is-insecure/) (search snippet)

**Feature detection**
- MDN's canonical `storageAvailable(type)` reads `window[type]` inside `try`, then does `setItem`/`removeItem` of `"__storage_test__"`. It treats `QuotaExceededError` as "available" only if `storage.length !== 0`, because "some browsers might give us an empty localStorage object with a quota of zero". — [MDN: Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) (last modified May 26, 2026)
- Keys and values are UTF-16 strings, so objects must be serialised, e.g. with JSON. — [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

**Speed**
- Speed benchmark (Firefox, Oct 2015, ~500 KB JSON string): native localStorage SET averaged 5.9 ms and GET 3.3 ms. localForage/IndexedDB took 341 ms SET and 184 ms GET. — [Peterbe: localStorage is not async, but it's FAST!](https://www.peterbe.com/plog/localstorage-is-fast)
- localStorage is synchronous by spec. Nothing else on the main thread runs until `setItem` returns, so large autosaves cause jank. — [dev.to: localStorage isn't free](https://dev.to/parsajiravand/localstorage-isnt-free-its-blocking-your-main-thread-nmn) (search snippet; secondary source)

### Inferences
- A few-KB JSON save is about 1/1000 of the 5 MiB limit. The 2015 benchmark measured ~6 ms for 500 KB, so a few KB should cost well under a millisecond per write. Synchronous cost is not a reason to avoid localStorage at this size.
- Synchronous writes are also an advantage. A `setItem` inside a `visibilitychange`/`pagehide` handler has finished by the time the handler returns. An IndexedDB transaction started there may never commit if the page is then killed (see Q3).
- IndexedDB has one more downside: open IndexedDB connections are listed as a bfcache blocker (see Q3). OPFS is designed for large binary or file-like data, and its fast synchronous handle is worker-only. Neither fits a few-KB save.
- `sessionStorage` is the wrong primitive for "refresh keeps progress, tab close keeps progress". It survives reload but not tab close, and it is also covered by Safari's 7-day cap.
- Graceful failure pattern:
  - Wrap every read and write in try/catch, as `src/ui/sound.ts` already does for the mute flag.
  - If storage is unavailable, keep playing in memory. A single discreet line could say that progress in this window will not be kept.
  - Also catch `JSON.parse` errors.
- Do not call `navigator.storage.persist()`. Firefox would show a permission prompt for a comedy game's few-KB save. Chrome rarely evicts anyway. Persistent mode may not override Safari's 7-day ITP cap (see Gaps).
- A player who comes back to Safari after more than 7 days without visiting will find the save gone. The game can't prevent this. It can make "no save found" look like a normal fresh start instead of an error.
- Dev-specific effect: localStorage is per origin (scheme + host + port). Every worktree/branch served on `localhost:5175` therefore shares the same save in the developer's own browser. This makes a build/version check (Q2) matter even in development. Playwright contexts are unaffected because they start empty (Q6).

### Gaps
- No primary source found for current Chrome Incognito localStorage behaviour. It is believed to be in-memory and working, cleared on close. One aggregator claimed Chrome "throws a QuotaExceededError on write attempts in Incognito". That contradicts MDN's general statement that private-mode data works and is cleared at session end, so treat the claim as unverified.
- Not confirmed whether a granted `persist()` exempts an origin from Safari's 7-day ITP cap. The WebKit 2023 post only says persistent origins are excluded from LRU eviction.
- Not confirmed whether the 7-day cap applies when "Prevent cross-site tracking" is turned off. MDN says it is triggered with tracking prevention enabled; the WebKit page doesn't say.

## Q2. Snapshot vs seed + action log; cross-version robustness; schema; incompatible or corrupt saves

### Takeaway
Games that save an input log (deterministic replay) treat it as bound to one version. Factorio refuses replays from older versions. Brogue CE declares saves and replays incompatible between minor versions, and once shipped a special compatibility path that kept old behaviour for old saves. For this game, the recommended approach is to store seed + decision log (tiny, exact, debuggable), plus a schema version, a build/content id, and a fingerprint of the derived state. On load: replay, verify the fingerprint, and if anything mismatches, discard with a one-line in-fiction notice rather than migrate.

### Cited Findings
- Command pattern replay: "A naïve implementation would record the entire game state at each frame … that would use too much memory." Instead, "many games record the set of commands every entity performed each frame. To replay the game, the engine just runs the normal game simulation, executing the pre-recorded commands." — [Game Programming Patterns: Command](https://gameprogrammingpatterns.com/command.html)
- Factorio's replay "is a file stored within the game save … to repeat (replay) a game from start". It records actions, not state. Factorio says "Replays for worlds created in older versions cannot be played. Downgrading is needed to view the replay." and "Adding/removing mods to the save will also break the replay." — [Factorio Wiki: Replay system](https://wiki.factorio.com/Replay_system)
- A community explanation: the replay "is basically just a 'keylogger' … So if anything is changed in the game the same inputs will no longer result in the same outcome." — [Steam discussion: Replay disabled – save game version](https://steamcommunity.com/app/427520/discussions/5/1700542332335687326/) (search snippet; community source)
- Factorio's developers reported cross-platform replay desyncs. Causes included C++ trig functions giving different results on different platforms, and sort comparators behaving differently across compilers. — per a search-result summary of [Factorio Friday Facts](https://www.factorio.com/blog/post/fff-47) posts (#36/#47 were listed; which post says what was not verified)
- Brogue CE changelog on replay/save compatibility:
  - "Replays and saves are not compatible with 1.10.x." (1.11)
  - "Not compatible with replays and saves from v1.8.x." (1.9)
  - 1.9.1: "Since we fixed the wand of plenty, replays made in 1.9.1 will not play on 1.9" but "1.9.1 will play recordings and load saves from 1.9, preserving the old behaviour."
  - Patch releases state "Gameplay is identical to all 1.8 versions."
  - Source: [BrogueCE CHANGELOG](https://github.com/tmewett/BrogueCE/blob/master/CHANGELOG.md)
- Brogue's recording loader checks the version stored in the file header and shows "This file is from version X and cannot be opened in version Y". The seed is stored in the recording header. — [Brogue Recordings.c](https://github.com/alinebee/Brogue/blob/master/BrogueCode/Recordings.c) (search snippet)
- The original Wordle (Jan 2022 analysis) saved a snapshot, not a log. A single `gameState` JSON in localStorage held `boardState`, `evaluations`, `rowIndex`, `solution`, `gameStatus`, `lastPlayedTs`, `lastCompletedTs`, `restoringFromLocalStorage` and `hardMode`. The board was reset when the day changed (`boardState = new Array(6).fill("")`, via a day-difference check on `lastPlayedTs`). — [Reverse Engineering Wordle (Taq Karim)](https://mottaquikarim.github.io/dev/posts/reverse-engineering-wordle/)
- Wordle's plaintext `solution` in localStorage was widely noticed ("Solution to Wordle can be found in local storage"). — [Knowledia headline](https://news.knowledia.com/US/en/articles/solution-to-wordle-can-be-found-in-local-storage-game-state-fd6dcb286953236052047580ed75e743eb020e92) (headline only)
- The project's own notes show generator changes are expected and do shift outcomes: "generator changes break slice1/2 seed pins; exact-transcript rematches need a multi-million-seed parallel search" — `MEMORY.md` / `e2e-seed-repick-cost.md` (local project memory)

### Inferences
**Trade-offs for this game**
- **Size.** A log is seed + up to ~100 short decision records, a few KB at most. A full snapshot (applicants, registry, court cases, economy) would be bigger but still far below 5 MiB. Size is not a deciding factor.
- **Robustness to code changes.** This is the key difference.
  - A log replayed on a new build silently produces a *different* week if the generator, rulebook or reducer changed. The same decisions then land on different applicants: exactly Factorio's and Brogue's problem.
  - A snapshot survives generator changes, but breaks on any change to state shape and would need hand-written migrations.
  - Neither survives code changes for free. The log fails more silently, so it needs an explicit guard.
- **Debugging.** A log is the stronger choice. A bug report can be the save JSON, and replaying it in Vitest (the project has `src/replay.test.ts`) reproduces the exact week. It also keeps one source of truth (the reducer), which fits AGENTS.md's "same seed, same week".
- **Cheating.** Irrelevant for a local single-player game. Anything in localStorage is editable, and Wordle stored the answer in plaintext without harm. Don't spend effort on obfuscation or signing.

**Recommended save shape** (TypeScript sketch, not verified against the codebase's action types)
```ts
type SaveV1 = {
  v: 1;                 // schema version of this JSON; bump when the shape changes
  build: string;        // content/generator id; bump (or hash) when rules/gen/content change outcomes
  seed: number;
  actions: GameAction[];// every reducer action that changes the week, in order, incl. day end / time-up
  clock: number;        // seconds of the current day's shift already used (see Q5)
  check: string;        // fingerprint of derived state after replaying `actions` (e.g. hash of day, pay, registry ids, current applicant id)
  savedAt: number;      // Date.now(), display/debug only, never fed into logic
};
```

**Load algorithm**
1. Read the key. If it is missing, start a new game.
2. `JSON.parse` in try/catch. On error: corrupt.
3. Check the shape by hand: `v === 1`, numeric seed, `actions` is an array. Otherwise: incompatible. A hand-written type guard avoids a new dependency such as zod.
4. If `build !== CURRENT_BUILD`: incompatible (fast path).
5. Replay `actions` through the pure reducer from `init(seed)`, in try/catch (a reducer may throw on an action that no longer makes sense). Compute the fingerprint. If it differs from `check`: incompatible. This catches a generator change nobody remembered to mark in `build`.
6. On success, resume.

**Handling incompatible or corrupt saves**
- Don't migrate. A day is ~6 minutes and a week well under an hour, so migration code is not worth its maintenance. Brogue's "preserve old behaviour" path is the heavyweight option, and it needs versioned generator code, which is a speculative abstraction that AGENTS.md forbids.
- Instead:
  - Move the bad blob to a side key such as `poh-save-discarded`, for debugging.
  - Start a new week.
  - Show one deadpan line, e.g. that the ministry has revised its forms and your file could not be found.
  - Never crash and never silently resume a different week.
- `actions` must include *every* input that changes the week, including time-up ending a day. The log is only complete if no reducer input comes from outside it (clock, `Date.now`). The pure-module rule already implies this, but the time-up path from `useShiftClock` needs checking.
- Don't compute `build` from something that changes on every commit (e.g. a git SHA). That would throw away saves after harmless UI or CSS changes. The fingerprint check already catches real divergence, so `build` can be a manually bumped constant, with the fingerprint as a safety net.

### Gaps
- No authoritative write-up found on how commercial web games (e.g. the current NYT Wordle, which now syncs state for logged-in users) version localStorage saves. The Wordle analysis is from Jan 2022.
- Roguelike forums (r/roguelikedev) on save-as-replay were not fetched. Brogue's changelog is the concrete example.
- Not verified: JS `Math.sin`/`Math.exp` etc. are "implementation-approximated" in ECMAScript, so a generator that uses them could diverge across browsers. That would matter only if saves were shared across browsers, and only if `src/gen/` uses them (not checked).

## Q3. When to write: every change, debounced, visibilitychange, pagehide, beforeunload; reliability and bfcache

### Takeaway
Write synchronously on every reducer state change that matters (each decision, day transition), which is cheap at a few KB. Also write on `visibilitychange` → hidden (the last reliable event, especially on mobile) to capture the clock. Add `pagehide` as a backup. Don't use `unload`: Chrome's deprecation reaches 100% of page loads in Chrome 154 (Sep 22, 2026). Don't rely on `beforeunload`.

### Cited Findings
- "The transition to _hidden_ is also often the last state change that's reliably observable by developers (this is especially true on mobile, as users can close tabs or the browser app itself, and the `beforeunload`, `pagehide`, and `unload` events are not fired in those cases)." Treat hidden as the likely end of the session and save unsaved state then. — [Chrome for Developers: Page Lifecycle API](https://developer.chrome.com/docs/web-platform/page-lifecycle-api) (updated Dec 1, 2023)
- The Page Lifecycle guidance:
  - calls `unload` "extremely unreliable, especially on mobile", and says it prevents bfcache eligibility
  - recommends `pagehide` (`'onpagehide' in self ? 'pagehide' : 'unload'`)
  - says to use `beforeunload` only while there is unsaved work and remove it right after saving
  - Source: [Page Lifecycle API](https://developer.chrome.com/docs/web-platform/page-lifecycle-api)
- Chrome `unload` deprecation, phase 2 (all origins), share of page loads:
  - Chrome 146 (Mar 10, 2026): 1%
  - Chrome 147: 5%
  - Chrome 148: 10%
  - Chrome 149: 20%
  - Chrome 150 (Jun 30, 2026): 40%
  - Chrome 151: 60%
  - Chrome 152 (Aug 25, 2026): 80%
  - Chrome 154 (Sep 22, 2026): 100%
  - Opt-outs: Permissions-Policy and the enterprise policy `ForcePermissionPolicyUnloadDefaultEnabled`.
  - `beforeunload` "won't fire if a background tab is killed". The hidden state is "the last reliable time to save app and user data".
  - Source: [Chrome: Deprecating the unload event](https://developer.chrome.com/docs/web-platform/deprecating-unload) (updated Jul 14, 2026)
- On bfcache entry and restore, `pagehide`/`pageshow` fire with `event.persisted`. `pageshow` fires on first load and on every bfcache restore. Save state on `pagehide` or `visibilitychange`. — [web.dev: Back/forward cache](https://web.dev/articles/bfcache) (updated Jul 2, 2026)
- Effect on bfcache:
  - `unload` blocks bfcache on Chrome and Firefox desktop. Safari tries to cache but won't fire `unload`.
  - `beforeunload` allows bfcache in Chrome, Firefox and Safari.
  - Open IndexedDB connections and in-flight fetch/XHR block bfcache.
  - Source: [web.dev: bfcache](https://web.dev/articles/bfcache)
- localStorage writes are synchronous, ~6 ms for 500 KB in a 2015 Firefox benchmark. — [Peterbe](https://www.peterbe.com/plog/localstorage-is-fast)

### Inferences
**Write triggers**
- **On state change.** Use `useEffect(() => save(state), [state])`, or save from the dispatch wrapper. Writes happen once per player decision, not per frame, so debouncing adds a failure window (a refresh inside the debounce loses the last decision) with no measurable gain. Only the clock ticks fast (250 ms). Leave it out of the per-change save and persist it at checkpoints.
- **Clock checkpoints.** Save:
  - on `visibilitychange` when `document.visibilityState === 'hidden'`
  - on `pagehide`
  - optionally every ~5 s while running
  - A mid-shift refresh (desktop F5 fires `pagehide`/`visibilitychange`) then keeps the clock. A killed mobile tab loses at most the time since the last checkpoint.
- Don't add a `beforeunload` "are you sure?" prompt. With autosave there is no unsaved work, and the page lifecycle guidance limits `beforeunload` to that case.
- After a bfcache restore (`pageshow` with `persisted === true`), in-memory state is intact, so no reload from storage is needed. Timers resume. Consider whether another tab changed the save meanwhile (Q4).
- Order of operations: compute the save string first, then call `setItem` in try/catch. A `QuotaExceededError` is practically impossible at a few KB, but blocked storage (`SecurityError`) is possible and must not break the handler.

### Gaps
- No primary source fetched on the exact order and firing of `visibilitychange` vs `pagehide` on desktop tab close in each browser. The Page Lifecycle doc says both are more reliable than `unload`, and hidden is the most reliable.
- No source fetched that states async IndexedDB writes started in `pagehide` may not commit. That is an inference from the page being killed right after.

## Q4. Multiple tabs: storage event, BroadcastChannel, Web Locks; simple strategies

### Takeaway
With autosave on every decision, two tabs of the same game will overwrite each other's save (last writer wins). One simple option is a `storage` event listener: when another tab writes the save key, this tab stops writing and shows "This file is open at another desk", with a button to take over. Another is a Web Lock requested with `ifAvailable` to detect a second tab at startup. Both are baseline since March 2022 or earlier. Last-writer-wins with no UI is also a defensible choice for a low-stakes local game.

### Cited Findings
- The `storage` event "is fired whenever a change is made to the Storage object of another document that shares the same storage space. This won't work on the same page that is making the changes". For localStorage the space is shared across all same-origin tabs. — [MDN: Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- BroadcastChannel is a named channel for same-origin windows, tabs and frames. Messages go to every listener "except the object that sent the message". Baseline widely available since March 2022. — [MDN: BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- Web Locks: while a lock is held, "no other script executing in the same origin can acquire the same lock". `ifAvailable`: "the lock request will fail if the lock cannot be granted immediately … The callback is invoked with `null`." `steal` releases held locks and grants the request. Baseline widely available since March 2022. — [MDN: Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- bfcache advice: close connections and disconnect observers on `pagehide`/`freeze` so caching doesn't affect other tabs. — [web.dev: bfcache](https://web.dev/articles/bfcache)

### Inferences
- **Minimal strategy.** Listen for `storage` events on the save key. Because the event never fires in the writing tab, any event means another tab has moved the week on. Show a notice ("This file is now being processed at another desk."), stop autosaving in this tab, and offer "Take this file back". Taking it back reloads from storage, which is correct and simple because the save fully describes the week. No new API is needed.
- **Startup detection** (optional). The first tab holds `navigator.locks.request('poh-desk', () => new Promise(() => {}))` for its lifetime. A second tab calls `request('poh-desk', {ifAvailable: true}, lock => …)`, gets `null`, and shows the notice. `steal: true` implements "take over". This is more code than the `storage` event approach and only adds detection before the other tab writes.
- BroadcastChannel adds nothing over the `storage` event here, because the save itself is the message.
- Don't try to merge two tabs' logs. They are two different weeks.

### Gaps
- Not confirmed from a fetched source whether a held Web Lock or an open BroadcastChannel blocks bfcache in each browser. The fetched web.dev page lists IndexedDB, fetch/XHR and WebSocket/WebRTC.
- Not confirmed from a fetched source that Web Locks are released automatically when a tab closes or crashes. The spec is believed to release them when the holding document goes away, but the MDN page fetched doesn't say so.

## Q5. Restoring a running timer: remaining time vs wall-clock deadline; paused while closed; visibility; throttling

### Takeaway
Store how many seconds of the shift have been used (or remain), not a wall-clock deadline. This matches the existing design, where the clock already pauses while the tab is hidden, and it means time does not run while the tab is closed. That fits a desk game: closing the tab is "going on break", not an idle-game timer. Any clock that adds up `performance.now()` deltas must cap each tick's delta (or reset on becoming visible), because background timers are throttled to once per second, or once per minute after 5 minutes hidden, and frozen pages run no timers at all.

### Cited Findings
- Chrome 88 (Jan 2021) throttling of hidden pages:
  - basic: timers at most once per second
  - "intensive": once per minute, when the page has been hidden more than 5 minutes, chain count ≥ 5, silent for at least 30 s, and not using WebRTC
  - "requestAnimationFrame will wait for the page to be visible, so it doesn't use any CPU when the page is hidden"
  - Source: [Chrome: Heavy throttling of chained JS timers (Chrome 88)](https://developer.chrome.com/blog/timer-throttling-in-chrome-88)
- The Page Lifecycle "frozen" state covers resource-saving freezing and bfcache freezing. On mobile the hidden transition may be the last event before the page is discarded. — [Page Lifecycle API](https://developer.chrome.com/docs/web-platform/page-lifecycle-api)
- The current clock is a 250 ms `setInterval`. It measures `now - last` with `performance.now()`, always updates `last`, and adds the delta only when `!document.hidden`. The accumulated `elapsed` is `useState` inside the hook, not reducer state. — `src/ui/Shift.tsx:266-285` (local code)

### Inferences
**Deadline vs remaining time**
- A wall-clock deadline (`endsAt = Date.now() + remaining`) means time keeps running while the tab is closed. Reopening the next morning would show an ended shift, and a refresh would be punished only by the reload time. That fits idle games, not this one.
- Persisting remaining or used seconds means refresh costs at most the checkpoint interval, and closing the tab pauses the shift. It is consistent with the existing "paused while hidden" behaviour, and deterministic tests stay easy.

**Where the clock state lives**
- To persist the clock it must be readable at save time. Either lift `elapsed` out of `useShiftClock` into something the save code can read (without making it a reducer input), or pass an initial `elapsed` into the hook from the loaded save and have the hook report checkpoints. Keep wall-clock reads in `src/ui/` per AGENTS.md.

**Possible existing bug** (not tested, needs a Playwright `page.clock` or manual check)
- While hidden, interval ticks keep firing throttled and keep moving `last`. On the first visible tick, `now - last` covers the time since the last *hidden* tick: up to ~1 s under basic throttling, up to ~60 s under intensive throttling.
- If the page was frozen (timers stopped entirely, e.g. mobile or Chrome discard/freeze), the first tick after thawing may measure the whole frozen period. `document.hidden` is already false by then, so that period gets added to the shift.
- Fixes: clamp each tick's delta (e.g. `Math.min(seconds, 1)`), or reset `last = performance.now()` on `visibilitychange` to visible and on `pageshow`.
- Use `performance.now()` (monotonic) rather than `Date.now()` for in-session deltas. Persist only the accumulated seconds, never a `performance.now()` value: its time origin restarts on every page load.
- Restore order on load: read `clock` from the save, start the shift paused until the first render, then resume. This avoids a jump if the page loads in a background tab.

### Gaps
- No fetched source on Safari's and Firefox's background timer throttling specifics. Only Chrome 88's policy was fetched.
- The possible clock-jump bug is inferred from code plus the throttling documentation, and was not reproduced.

## Q6. React specifics and testing (Vitest, Playwright)

### Takeaway
Load the save once, synchronously, before the first render. Either use the `useReducer` initializer or, more simply, read it at module/bootstrap level and pass it in. Then no "new game" flash appears, and StrictMode's double calls stay harmless. Write in an effect or event handler, never in the reducer or initializer. Keep the save/parse/validate logic as pure functions tested in Vitest's current Node environment against a tiny in-memory `Storage` stand-in (no jsdom needed). Use Playwright with `page.reload()` for the end-to-end refresh path, and `page.clock` for the shift timer.

### Cited Findings
- `useReducer(reducer, initialArg, init?)`: the initial state becomes `init(initialArg)`. "React saves the initial state once and ignores it on the next renders". Pass the function itself (`useReducer(reducer, username, createInitialState)`) so it is not re-run each render. — [React: useReducer](https://react.dev/reference/react/useReducer)
- "In Strict Mode, React will call your reducer and initializer twice … This is development-only behavior", and "reducers and initializers must be pure". — [React: useReducer](https://react.dev/reference/react/useReducer)
- In development, StrictMode double-invokes:
  - component bodies
  - functions passed to `useState`, `set` functions, `useMemo` and `useReducer`
  - effects, which run setup → cleanup → setup
  - "All of these checks are development-only and do not impact the production build."
  - Source: [React: StrictMode](https://react.dev/reference/react/StrictMode)
- Playwright:
  - "Playwright executes tests in isolated environments called browser contexts", so each test starts with empty storage.
  - `storageState` saves "cookies, local storage, IndexedDB" (the fetched page gives no version). It does not persist sessionStorage.
  - The documented workaround for sessionStorage is `context.addInitScript` writing it back.
  - Source: [Playwright: Authentication](https://playwright.dev/docs/auth)
- `page.addInitScript` runs "Whenever the page is navigated. Whenever the child frame is attached or navigated", "after the document was created but before any of its scripts were run". The order between several init scripts "is not defined". — [Playwright: Page API](https://playwright.dev/docs/api/class-page#page-add-init-script)
- `page.clock` overrides `Date`, `setTimeout`/`setInterval`, `requestAnimationFrame`, `requestIdleCallback` and `performance`. It offers `install`, `fastForward`, `runFor`, `pauseAt`, `resume`, `setFixedTime` and `setSystemTime`. Example: `await page.clock.install(); await page.goto(...); await page.clock.fastForward('05:00');`. — [Playwright: Clock](https://playwright.dev/docs/clock)
- Node 25.0.0 turned on its own Web Storage by default. Its global `localStorage` shadows jsdom/happy-dom's in Vitest, so `typeof localStorage.getItem === 'function'` fails (issue opened Oct 22, 2025). The reported workaround is `NODE_OPTIONS="--no-webstorage"`. — [vitest-dev/vitest #8757](https://github.com/vitest-dev/vitest/issues/8757)
- A follow-up issue reports jsdom's storage still dropped on Node 25+. Search summaries say the fix landed only in Vitest 5, with the workaround `test.execArgv: ['--no-experimental-webstorage']` guarded by Node version (Node 22 rejects the flag). — [vitest-dev/vitest #10867](https://github.com/vitest-dev/vitest/issues/10867) (search snippet; the "fixed in Vitest 5" claim is from a secondary summary and was not verified)
- This repo's setup: Vitest ^4.1.11 with no `environment` configured and no jsdom/happy-dom installed. Node is v20.18.3. The Playwright config uses `reuseExistingServer: true` on a fixed port, 5175. — `vite.config.ts`, `package.json`, `playwright.config.ts` (local)

### Inferences
**Loading the save**
- Simplest shape: a small `src/ui/save.ts` (storage is I/O, so it belongs in `src/ui/`, not in the pure modules) with:
  - `loadSave(storage): Save | null`
  - `writeSave(storage, save)`
  - `clearSave(storage)`
  - `restore(save): GameState | 'incompatible'` (pure: replay + fingerprint)
- Call `loadSave` once in `main.tsx` or at module scope, and pass the result as a prop or `initialArg`. Reading storage *inside* the `useReducer` initializer also works, because a read is idempotent and a double call only reads twice in dev. But replaying the whole log twice under StrictMode is wasted work, and a notice side-effect (discarding a bad save) would fire twice. So do the discard/notice outside the initializer.
- This is a client-only Vite SPA with no SSR, so there is no hydration mismatch. A synchronous read before `createRoot().render()` gives zero flash.
- Writing inside an effect is safe under StrictMode's setup → cleanup → setup, because writing the same JSON twice is idempotent. Register the `visibilitychange`/`pagehide`/`storage` listeners in an effect that removes them in cleanup, or StrictMode will leave duplicates in dev.
- Don't use `useSyncExternalStore` for this. It suits subscribing React to an external store; here React's reducer is the source of truth and storage is only a mirror. (The React docs for `useSyncExternalStore` were not fetched.)

**Vitest**
- The current Node environment has no `localStorage`, so pass a `Storage`-like object into the save functions. A `Map`-backed fake with `getItem`/`setItem`/`removeItem` and an optional "throws `SecurityError`" mode is enough. That avoids adding jsdom, which AGENTS.md would require justifying.
- Useful tests:
  - round-trip (save, then load, gives the same state)
  - corrupt JSON gives a fresh game plus a notice
  - wrong `v`/`build` gives the notice
  - changed generator (fingerprint mismatch) gives the notice
  - storage throws on read/write, and the game keeps running
- If jsdom is ever added, the Node 25 localStorage clash applies. It doesn't apply on the local Node 20 today.

**Playwright**
- Rely on per-test context isolation for a clean start; no explicit clearing is needed.
- Refresh test: play two decisions, `await page.reload()`, assert the same applicant/day/counters. Read them through `window.__game` in dev/test builds.
- Tab-close test: `context.newPage()` on the same context after closing the first page. localStorage is shared within a context.
- Seeding a specific save: do not use `addInitScript` to write the save unguarded. It re-runs on every navigation *including `reload()`*, so it would overwrite the save the test is trying to check. Instead:
  - `goto`, then `page.evaluate(s => localStorage.setItem('poh-save', s), json)`, then `reload()`; or
  - guard the init script with a one-shot sessionStorage flag.
- Clock: `page.clock.install()` before `goto`, then `fastForward('03:00')`, reload, and assert the clock shows about 3 minutes used, not 0 and not the whole shift.
- The shared port warning in MEMORY.md matters here. With `reuseExistingServer: true`, a stale dev server from another worktree can serve a different build. The save's `build` check would then correctly reject the save, making the test look broken.

### Gaps
- Not confirmed whether `page.clock` state persists across `page.reload()`. The Clock docs page fetched doesn't say, so a spike test is needed.
- The Playwright version that added IndexedDB to `storageState` was not confirmed from the fetched page.

## Q7. Development builds: Vite HMR, stale saves, reset escape hatches

### Takeaway
In dev, stale saves come from code changes (HMR or a branch switch on the shared `localhost:5175` origin) replaying an old log into a changed generator. The Q2 fingerprint check handles this automatically, as a discard with a notice. For deliberate resets, offer three routes:
- a visible "Start again" control with a confirm step (for players)
- a `?new` URL parameter that clears the save and then strips itself from the URL (for devs and tests)
- a documented one-line console command

### Cited Findings
- Safari's ITP and storage behaviour apply per origin. localStorage is scoped by scheme, host and port, and `http` vs `https` are separate. — [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage); [MDN quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- StrictMode double-invocation is development-only. — [React: StrictMode](https://react.dev/reference/react/StrictMode)
- AGENTS.md requires dev and test builds to expose read-only state as `window.__game`. — `AGENTS.md` (local)

### Inferences
**HMR**
- React Fast Refresh keeps component state across edits to UI files, so the in-memory game continues and nothing needs reloading. Edits to `src/gen/` or `src/rules/` usually cause a full reload or re-evaluation of the reducer's modules. On the next load, the saved log replays against the new generator. The fingerprint check turns that into a clean discard instead of a confusing half-different week.
- Don't try to keep saves compatible across dev edits.

**Reset routes**
- `?new` (or `?reset`):
  - At bootstrap, before loading, check `new URLSearchParams(location.search).has('new')`.
  - If present, `removeItem` the save and `history.replaceState` to drop the parameter, so a later refresh doesn't reset again.
  - This also lets e2e specs force a fresh week without touching storage directly.
- Console: keep `window.__game` read-only per AGENTS.md. Document `localStorage.removeItem('poh-save'); location.reload()` in the README/notes rather than adding a mutating global. If a helper is wanted, a separate dev-only `window.__resetSave()` would sit outside the read-only `__game` object; ask the user first.
- "Start again" for players:
  - Needs immediate feedback and a confirm step, because it destroys progress.
  - In the game's voice, e.g. a form to request a new file.
  - It should call `clearSave()` and dispatch a new-game action with a fresh seed, or the same seed, which is a design decision to ask about. Avoid `location.reload()`, so there is no dead moment.
- Namespace keys (e.g. `poh-save`, next to the existing `poh-muted`). Keep the mute flag separate so "Start again" doesn't reset preferences.
- Build id in dev: a manually bumped `SAVE_BUILD` constant is enough, with the fingerprint as the safety net. Injecting a git hash via Vite `define` would discard saves on every commit (see Q2). The Vite `define` docs were not fetched.

### Gaps
- No fetched source describing common conventions for dev reset parameters (`?new`, `?reset`) in web games. The recommendation is a practical inference, not a documented standard.
- Vite HMR behaviour for non-component modules (e.g. whether editing `src/gen/*.ts` triggers a full page reload in this app) was not checked against the Vite docs or the running app.
