# Contextual one-click lookup controls (vs a search box) for the Registry tab

Context checked in the repo (28 Sep 2026): `src/ui/Registry.tsx` already has a free-text name search, two buttons inside the Registry panel ("look up the voucher", "Search the face in the video"), and result lines that echo the query ("Searched “{name}”. No registered human by that name."; "Searched the face in the video. On file with this face: N."). `src/ui/Game.tsx` already uses `onMouseDown={e => e.preventDefault()}` on its buttons with the comment "A mouse click leaves the focus where it was, so Space still calls the next applicant", and shows shortcut hints in `title` ("Sound on or off (M)"). The planned change moves the lookups to the form: "Look up" next to the voucher's name and "Search face" next to the photo, each switching to the Registry tab with the result shown.

Source note: Apple HIG and Material 3 pages are rendered by JavaScript and could not be fetched in full. Their claims below come from search-result snippets of the official pages and are marked "(snippet)". Microsoft Fluent and lawsofux.com were not fetched (see Gaps).

## 1. Contextual inline actions vs a global search box: recognition over recall, less typing, discoverability, labels vs icons, hover, link vs button, proximity

### Takeaway
All the primary sources point the same way. Put a visible, text-labelled action right next to the object it acts on (the voucher's name, the photo), so the player recognises the action instead of recalling and retyping a name. Don't hide it behind hover or an unlabelled icon. Make it a `<button>`, because it performs an in-app action and does not go to a URL. Keep a redundant route to the same function elsewhere.

### Cited Findings
- **Recognition over recall.** NN/g defines recall as "the retrieval of related details from memory" and recognition as recognising information "as being familiar". "The difference between recognition and recall is the number of cues that help memory retrieval; recall involves fewer cues than recognition." It recommends making information and interface functions "visible and easily accessible", using labelled buttons and menus rather than command-line-style input, and using "contextual tips tailored to the page that the user is visiting" instead of general tutorials. (Raluca Budiu, 15 Jan 2024) — [NN/g: Recognition vs. Recall](https://www.nngroup.com/articles/recognition-and-recall/)
- **Contextual actions reduce effort.** A contextual menu "contains a small set of relevant actions related to a control, an area of the interface, a piece of data in the application". It helps users "find exactly what they need for the task at hand" and reduces interaction cost and cognitive load. (Anna Kaley, 17 Mar 2019) — [NN/g: Contextual Menus](https://www.nngroup.com/articles/contextual-menus/)
- **Redundancy.** "Make sure the commands in contextual menus are also available from the application's main menu." Contextual triggers should not be the only way to do something. Gesture-based contextual triggers are "not discoverable", and even after a tip "it is unlikely that people will naturally remember to use it later on." — [NN/g: Contextual Menus](https://www.nngroup.com/articles/contextual-menus/)
- **Placement and visibility** (Kate Kaplan, 28 Nov 2025):
  - Place the trigger "directly within or beside the specific element it controls"; spatial proximity helps users predict what it does.
  - "Make icons large enough, high-contrast, and visible without hover when possible."
  - Add clarifying labels or tooltips.
  - Don't hide one or two actions behind a menu icon: "it increases interaction cost without saving space."
  - Contextual menus are for secondary actions; essential, frequent actions "should remain visible."
  - Source: [NN/g: 10 Guidelines for Contextual Menus](https://www.nngroup.com/articles/contextual-menus-guidelines/)
- **Labels, not icon-only.** "A text label must be present alongside an icon to clarify its meaning in that particular context." "Icon labels should be visible at all times, without any interaction from the user." Only a few icons are close to universal (home, print, magnifying glass for search); "most icons continue to be ambiguous to users." (Aurora Harley, 27 Jul 2014; old but still NN/g's reference article) — [NN/g: Icon Usability](https://www.nngroup.com/articles/icon-usability/)
- **Hover-only labels fail.** "Don't rely on hover to reveal text labels: not only does it increase the interaction cost, but it also fails to translate well on touch devices." — [NN/g: Icon Usability](https://www.nngroup.com/articles/icon-usability/)
- **Tooltips are a fallback, not the label.**
  - "Don't use tooltips for information that is vital to task completion."
  - "If you're too stubborn to provide text labels for the icons on your site, the least you can do is provide your users with a descriptive tooltip."
  - "Tooltips that appear only on mouse hover are inaccessible for users that rely on keyboards to navigate."
  - Tooltips "are not normally available on touchscreens."
  - Source: Alita Kendrick, 27 Jan 2019, [NN/g: Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/)
- **Material 3 on tooltips (snippet).** Plain tooltips "briefly describe a UI element and are best used for labelling UI elements with no text, like icon-only buttons". On hover, an icon button's tooltip describes "its action, rather than the name of the icon itself". — [Material 3: Tooltips](https://m3.material.io/components/tooltips/guidelines); [Material 3: Icon buttons](https://m3.material.io/components/icon-buttons/guidelines)
- **Hover-revealed controls.** NN/g notes that hover is not available to touchscreen or keyboard users, and that when a split button's separation "is hidden until hover, users will not properly recognize a split button" (search snippet of NN/g pages). — [NN/g: Split Buttons](https://www.nngroup.com/articles/split-buttons/); [NN/g: Menu-Design Checklist](https://www.nngroup.com/articles/menu-design/)
- **Link vs button.** "The types of actions performed by buttons are distinctly different from the function of a link... It is important that both the appearance and role of a widget match the function it provides." — [W3C WAI-ARIA APG: Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- **Fitts's law.**
  - "The time it takes a pointer to move to a particular target depends on both the distance to the target and the target's size."
  - Put controls where the user's pointer or attention already is. Budiu contrasts a menu whose options appear far from its handle with Mail's adjacent placement, which "minimizes movement time".
  - An icon with a text label makes a bigger target than the icon alone, so it is "easier to acquire."
  - Source: Raluca Budiu, 2022, [NN/g: Fitts's Law](https://www.nngroup.com/articles/fitts-law/)

### Inferences
- **Typing cost.** Typing the voucher's name into a search box is recall plus transcription: read the name on the form, remember it, retype it without a typo. A "Look up" button beside the name is recognition, with zero typing and no typo risk. This matches NN/g heuristic 6 directly.
- **Use visible text labels.** The labels "Look up" and "Search face" (not a bare magnifier icon) follow Harley and Kendrick. The magnifier is one of the few near-universal icons, so icon plus text is fine, and the text also enlarges the target (Budiu).
- **Placement.** Put each control immediately beside its object: after the voucher's name, and under or beside the photo. That serves Fitts's law and makes the object of the lookup unambiguous. Always visible, never hover-revealed (Kaplan #3, Harley).
- **Button, not link.** In this single-page game with no URLs, the control switches an in-app view and runs a lookup. By APG semantics that is a `<button>`. A link would fit only if the Registry result had its own URL or history entry. This is convention-based reasoning, not user-test evidence.
- **The Registry panel's own buttons.** The existing in-panel "look up the voucher" and "search the face" buttons are the redundant route NN/g asks for. Keeping them, or a free-text box, satisfies "commands also available elsewhere".
- **Onboarding.** On day 4, when lookup unlocks, a visible, labelled control on the form is its own onboarding. NN/g's finding that tips about hidden triggers aren't remembered argues against relying on a one-time memo to teach a hidden or keyboard-only lookup.

### Gaps
- Microsoft Fluent 2 guidance on inline or contextual buttons was not fetched (JS-rendered). No Fluent-specific claim is included.
- Apple HIG body text was not retrievable. Only the 44×44 pt snippet is used (Section 3).
- No quantitative study was found comparing one-click contextual lookup with typed search for task time or error rate. The recommendation rests on NN/g heuristics and guidelines (expert convention backed by general memory research), not on a controlled comparison.
- lawsofux.com (Law of Proximity, Fitts's law pages) was not fetched. Proximity is supported here via NN/g (Kaplan #2, Budiu).

## 2. Deep links and "search pre-filled from context": replace vs alongside, keeping the user's place, showing what was searched

### Takeaway
When a contextual action runs a search, show the query as the result's heading and keep it in any search field. Only switch views when the user clicks, never automatically. Keep the form's state so one click returns the player to where they were. If the player must compare the result with the form (a face against a face), tabs are the wrong container unless the result repeats the thing being compared.

### Cited Findings
- **Persist the query.** Baymard: "Always persist users' search queries". On 33% of desktop and 42% of mobile e-commerce sites, queries were cleared after submission. A test user said: "Hey! Argh, okay, I have to retype this. I expected I would be able to continue the sentence." Users iterate queries about 2.2 times on average. (Mark Crowley, 23 Feb 2021) — [Baymard: Always Persist Users' Search Queries](https://baymard.com/blog/persist-search-queries)
- **Echo the query on the results page.** Baymard: "include the query somewhere on the results page — as a header or as part of the breadcrumbs". The redundant query text reinforces search intent and reminds users "where they left off" after a distraction. — [Baymard: Always Persist Users' Search Queries](https://baymard.com/blog/persist-search-queries)
- **Tabs and comparison.** NN/g advises against tabs when users need to see content from several tabs at once. Otherwise "users must repeatedly switch between tabs to compare or reference information", which raises cognitive load and interaction cost. (Evan Sunwall, 2 Aug 2024, reviewed Sep 2026) — [NN/g: Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/)
- **Mark the selected tab.** "Use at least two selection indicators to enhance the visual salience of the selected tab" (e.g., underline plus bold or colour, a common region, size). — [NN/g: Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/)
- **No automatic switching.** NN/g cites an example where a tab "automatically selected the next tab after a few seconds" as a violation. — [NN/g: Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/)
- **Contextual help beats general instructions**, and people should be able to return to recent items and searches. — [NN/g: Recognition vs. Recall](https://www.nngroup.com/articles/recognition-and-recall/)

### Inferences
- **The name lookup.** The pattern is "click an entity, see its record", the same as clicking a username to open a profile. The Registry tab should open with the queried name as the result's heading, as the code already does with "Searched “Maureen Oakes”". If the free-text box remains, fill it with the name too, so the player sees exactly what was searched and can edit it (Baymard: persist and echo).
- **The face lookup needs the query face in the result.** The player has to compare the applicant's face with the registered one. Following NN/g's tabs guidance, the result should show the searched face, a thumbnail of the photo just searched, next to any matching registered faces. Then the Registry tab alone answers the question and nobody flips back and forth. The existing text "Searched the face in the video" names the query but does not show it.
- **Replace vs alongside.** Switching the side panel to the Registry tab on click is acceptable, since the switch is user-initiated and NN/g's objection is to automatic switching. It works only if:
  - the form or evidence the player was reading stays as it was: same applicant, same Inspect state, same rulebook page;
  - returning is one click or key;
  - the Registry tab is clearly marked as selected with two indicators.
  If the layout ever allows it, showing the result beside the form (a split or overlay) instead of replacing it would avoid the switching cost entirely. That is a larger layout change, and gameplay changes need the owner's approval per AGENTS.md.
- **Last result.** Keep the last lookup result when the player switches back and forth within the same applicant. Clear it when the next applicant is called, so a stale record can never be mistaken for the current applicant's.

### Gaps
- No primary source was found that compares "replace the view" with "open alongside" for pre-filled contextual searches specifically. The guidance above is inferred from NN/g's tabs and comparison rule and Baymard's search-persistence research (e-commerce context, not games).
- No usability research was found on deep-link "search for this" actions in games.

## 3. Keyboard access: shortcuts for contextual actions, conflicts, hints, focus that doesn't steal global shortcuts, and target size

### Takeaway
Stopping focus theft on mouse click with `mousedown` `preventDefault` is needed: Chrome and Firefox focus a clicked button, and Space then activates it. The game already uses this pattern and should reuse it on the new controls. Keep the controls reachable by Tab so keyboard users aren't locked out. If they get single-letter shortcuts, WCAG 2.1.4 asks for a way to turn off or remap single-character shortcuts. Show each shortcut next to the control's label, not only in a hover tooltip. Make each control at least 24×24 CSS px, or space it per the WCAG 2.5.8 spacing exception.

### Cited Findings
- **Click focus by browser.** MDN: "Whether clicking on a `<button>` ... causes it to (by default) become focused varies by browser and OS. Most browsers do give focus to a button being clicked, but Safari does not, by design." — [MDN: `<button>`, Clicking and focus](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)
- **Space and Enter activate a focused button.** "Space: Activates the button. Enter: Activates the button." — [W3C WAI-ARIA APG: Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- **Toggles.** A toggle button uses `aria-pressed`, and "It is critical the label on a toggle does not change when its state changes." This bears on the I-key Inspect toggle and any lookup toggle. — [W3C WAI-ARIA APG: Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- **WCAG 2.1.4 Character Key Shortcuts** (Level A):
  - Text: "If a keyboard shortcut is implemented in content using only letter (including upper- and lower-case letters), punctuation, number, or symbol characters, then at least one of the following is true":
    - "A mechanism is available to turn the shortcut off";
    - or "to remap the shortcut to include one or more non-printable keyboard keys (e.g., Ctrl, Alt)";
    - or "The keyboard shortcut for a user interface component is only active when that component has focus."
  - Rationale: single-key shortcuts "can be inappropriate and frustrating for speech input users, whose dictation is interpreted as strings of letters, and for keyboard users who are prone to accidentally hit keys."
  - The Understanding document lists no exception for games.
  - Source: [W3C: Understanding SC 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)
- **Remappable controls.** The Game Accessibility Guidelines rate "Allow controls to be remapped / reconfigured" as Basic (motor). Offer "both – a set of profiles together with a 'custom' option". In-game remapping is preferred because "in-game prompts" can then reflect the current mappings, and it helps players on other layouts such as AZERTY. — [Game Accessibility Guidelines: Allow controls to be remapped](https://gameaccessibilityguidelines.com/allow-controls-to-be-remapped-reconfigured/)
- **Accelerators and shortcut hints.**
  - Heuristic 7: "shortcuts and accelerators — unseen by the novice user — which speed up the interaction for expert users."
  - "The classic solution for keyboard-shortcut accelerators is to show them next to the associated commands in a menu or toolbar." Photoshop is cited for "unobtrusive messages" about how to reach the shortcut.
  - Source: Page Laubheimer, 22 Nov 2020, [NN/g: Flexibility and Efficiency of Use](https://www.nngroup.com/articles/flexibility-efficiency-heuristic/)
- **Hover-only tooltips exclude keyboard users** ("inaccessible for users that rely on keyboards to navigate"), so hints should appear on keyboard focus as well as on hover. — [NN/g: Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/); Material 2 and 3 describe tooltips shown on "hover over, focus on, or tap" (snippet) — [Material 3: Tooltips](https://m3.material.io/components/tooltips/guidelines)
- **Menus must be keyboard-operable.** Contextual menus should be "operable via keyboard navigation and screen readers, not just mouse clicks or taps." — [NN/g: 10 Guidelines for Contextual Menus](https://www.nngroup.com/articles/contextual-menus-guidelines/)
- **WCAG 2.5.8 Target Size (Minimum)** (Level AA): "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when":
  - **Spacing:** "Undersized targets ... are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target";
  - **Inline:** "The target is in a sentence or its size is otherwise constrained by the line-height of non-target text";
  - **Equivalent:** "The function can be achieved through a different control on the same page that meets this criterion."
  - For important controls the document recommends aiming for the stricter 2.5.5 Target Size (Enhanced), Level AAA, 44×44 CSS px.
  - Source: [W3C: Understanding SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **Apple HIG (snippet):** a button needs "a hit region of at least 44x44 pt — in visionOS, 60x60 pt — to ensure that people can select it easily, whether they use a fingertip, a pointer, their eyes, or a remote." — [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

### Inferences
- **Focus on mouse click.** Put `onMouseDown={e => e.preventDefault()}` on "Look up" and "Search face", as `Game.tsx` and `Registry.tsx` already do. Otherwise, in Chrome and Firefox, the next Space press re-runs the lookup instead of calling the next applicant. Don't use `tabIndex={-1}`: that would drop the controls from the tab order and fail keyboard-only players. The mousedown fix changes only mouse clicks.
- **Focus after keyboard activation.** If a keyboard user Tabs to "Look up" and presses Space, focus stays on the button, and the next Space presses it again. That is standard, expected behaviour for keyboard users, and a design choice rather than a bug. One option is to let the global Space handler take priority whenever focus is on one of these lookup buttons. That breaks the APG button convention, though, so the plain behaviour is the safer default.
- **Focus after the tab switch.** Don't move focus into the Registry result after a mouse click. That would steal focus and break Space/A/C. For a keyboard- or shortcut-initiated lookup, announce the result through a polite live region, or leave focus where it was. Moving focus is the more intrusive choice. The WCAG "change on request" criteria were not fetched here.
- **Candidate shortcut keys.** Keys already in use are Space, A, C, I, 0–6, Esc and M (M is in `Game.tsx`'s title "Sound on or off (M)"). Free letters that fit the actions: L ("Look up") or V ("Voucher") for the name, F ("Face") for the face. That avoids the existing keys.
  - Adding shortcuts is a gameplay and input change, which needs approval per AGENTS.md.
  - The game's existing single-letter shortcuts (A, C, I, M) already fall under WCAG 2.1.4 unless there is an off or remap setting. No such setting is known to exist; it was not checked beyond a skim.
- **Show the shortcut in the label.** Put it on the visible label ("Look up [L]"), or at least in a hint shown on hover and on focus. Don't rely on a `title` attribute alone: NN/g says hover-only hints miss keyboard users, and whether browsers show `title` on keyboard focus is not verified here (Gaps).
- **Size.** Small inline buttons next to a name should be at least 24 px tall with 24 px clearance, or sized by padding. The inline exception applies only when the target sits inside a sentence or is limited by the line height of surrounding text. A standalone button on a form field is not clearly covered, so don't rely on it. The equivalent exception could apply, because the Registry panel has larger buttons for the same function, but meeting 24 px outright is simpler.

### Gaps
- It was not verified whether browsers show native `title` tooltips on keyboard focus. This is commonly held not to happen, but no source was fetched.
- The WCAG 3.2.x "On Focus / Change on Request" criteria were not fetched.
- No source was found on best practice for Space conflicts between a focused button and a global "Space = next" game shortcut. The approach above rests on APG semantics and MDN browser behaviour plus inference.
- Game Accessibility Guidelines entries on showing current bindings or avoiding key conflicts were not fetched beyond the remap page.

## 4. Should free-text search stay as a secondary option once contextual lookups exist?

### Takeaway
Yes, as a secondary route. By convention (NN/g), contextual actions should not be the only path to a command, and flexible systems offer several ways to do one task. The evidence is heuristic and convention, not a controlled study. In this game the typed search also keeps open exploration the one-click controls can't cover: looking up a name the player remembers from the Gazette or an earlier day.

### Cited Findings
- **Keep the main route.** "Make sure the commands in contextual menus are also available from the application's main menu"; avoid exclusive access through contextual triggers. — [NN/g: Contextual Menus](https://www.nngroup.com/articles/contextual-menus/)
- **Multiple methods.** Flexible systems let "users to approach tasks in a variety of ways to suit their working style", serving both novices and experts. Accelerators are "secondary ways of accomplishing the same task". — [NN/g: Flexibility and Efficiency of Use](https://www.nngroup.com/articles/flexibility-efficiency-heuristic/)
- **Iteration.** Search users iterate queries about 2.2 times on average and are frustrated by having to retype. An editable, persisted query supports that iteration. — [Baymard: Always Persist Users' Search Queries](https://baymard.com/blog/persist-search-queries)
- **Recent items and past searches** are recognition aids worth offering. — [NN/g: Recognition vs. Recall](https://www.nngroup.com/articles/recognition-and-recall/)

### Inferences
- **Keep the box, demote it.** Keep the name search box in the Registry tab, but visually secondary: smaller, below the result. The one-click controls become the primary path.
  - It lets curious players look up Grandma Ethel, Gary's cousins or a name from the Gazette, a source of discovery jokes.
  - It is the redundant route NN/g asks for.
  - It is the obvious place to show the query persistently.
- **Pre-fill it.** When a one-click lookup runs, fill the box with the looked-up name, so the two paths are visibly the same function and the player can edit and re-run it.
- **Keys while typing.** While the search box has focus, typing must not trigger A, C, I or 0–6. This matches WCAG 2.1.4's point about unintended single-key activation, and it is the one case where the text field must take the keyboard. A quick check of `Registry.tsx` shows an `<input>` inside a `<form>`. Whether the global key handler ignores keystrokes aimed at inputs was not verified.
- **Or drop it.** If the team drops free-text search, NN/g's redundancy rule is still met by the in-panel lookup buttons, but the exploration use is lost. Whether that exploration matters is a design call for the owner.

### Gaps
- No quantitative evidence (A/B test or usability study) was found on whether keeping a secondary free-text search improves or harms outcomes once contextual lookups exist. The recommendation rests on NN/g guidelines, which are expert convention.
- No game-specific evidence was found; Papers, Please's own design (a rulebook and cross-referencing by clicking) was not researched here.

## 5. Presenting lookup results as facts, not verdicts, clearly tied to the query

### Takeaway
Put the query at the top of the result, stated back verbatim ("Searched “Maureen Oakes”"). List plain records, such as registration day, window, and who they are vouching for today. Never state a conclusion like "Invalid voucher". Search-UX research supports the query-echo part. The facts-not-verdicts part comes from this game's design invariant ("Only the evidence reveals validity") and NN/g's rule that essential information must not hide in tooltips. No external study addresses verdict-free wording directly.

### Cited Findings
- **Echo the query.** Show it on the results page "as a header or as part of the breadcrumbs" "to make the origin of the search results abundantly clear", and keep it in the search field. — [Baymard: Always Persist Users' Search Queries](https://baymard.com/blog/persist-search-queries); [Baymard search collection](https://baymard.com/blog/collections/on-site-search)
- **Essential facts on screen.** "Don't use tooltips for information that is vital to task completion." Registry facts the player needs must be on screen, not in a hover tooltip. — [NN/g: Tooltip Guidelines](https://www.nngroup.com/articles/tooltip-guidelines/)
- **Show the thing looked up.** Users should not have to switch views to compare. — [NN/g: Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/)
- **Game design invariant.** Only the evidence reveals validity, "Never appearance, remarks, names or UI labels". Every invalid applicant has one visible, checkable clue tied to one active rule. — `AGENTS.md` and `notes/game-design.md` in this repo (internal).

### Inferences
- **Result template for a name.**
  - Heading: `Searched “Maureen Oakes”`.
  - Registered: "Registered on day 2 at Window 3."
  - Vouching: "Vouching today for: Pat Doe" or "Vouching today for: nobody".
  - Not found: "No registered human by that name."
  The player applies rule 4 ("a registered human who is not already vouching for someone else") themselves. That keeps the rule check as the player's work and keeps the UI free of rule logic, as AGENTS.md's "No game rules in the UI" requires.
- **Result template for a face.** Heading: "Searched the face in the photo". Show the photo thumbnail, then "On file with this face: 1", then each record (name, day, window, a thumbnail). Never "DUPLICATE".
- **Neutral styling.** Don't colour-code results red or green by validity. A red "not found" would be a UI label revealing validity, which the invariant forbids. A neutral style for "found" and "not found" alike keeps the evidence the only signal.
  - The same goes for sound: don't play a buzzer on "not registered".
- **One fixed position.** Keep the query line and the facts in the same place every time, so repeat players can scan them quickly (NN/g recognition: consistent, visible information).
- **Clear the result per applicant.** Clear or visibly re-scope it when the next applicant is called, so a result is never read as belonging to the wrong applicant.

### Gaps
- No external source was found on "facts not verdicts" wording for lookup results in games or in fact-checking UIs. This part is design reasoning from the game's own invariants, not sourced guidance.
- No source was found on whether colour-coding lookup results changes decision accuracy in inspection games.
