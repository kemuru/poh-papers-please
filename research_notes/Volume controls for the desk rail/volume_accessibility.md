# Accessible volume controls (sound effects and music, 0 to 100) for a browser game's desk rail

How the quotes were checked: text in quotation marks was checked word for word against the source page, downloaded on 30 September 2026. Items tagged **[summary]** came from a page summariser and may be lightly paraphrased. Items tagged **[snippet]** come only from a search-result snippet. "The rail" means the game's top bar: three small pixel switches (sound, with an M key cap and an M shortcut; music; menu), currently plain on/off toggle buttons.

## 1. What do WCAG 2.2 1.4.13, 2.1.1, 2.5.7, 2.5.8, 2.4.7, 2.4.11, 4.1.2 and 1.4.11 require of a hover-expanded slider and of a knob?

### Takeaway
WCAG 2.2 does not forbid a slider that pops out of a rail switch on hover. It does make that pop-out a "nonmodal popup" under 1.4.13, which brings these conditions:
- It must also open from keyboard focus.
- It must stay open while the pointer moves onto it.
- It must stay open until the user leaves it or dismisses it, with no timeout.
- Escape must close it without moving the pointer or focus.
- It must never cover the focused control.

The slider inside must also:
- be a real slider to assistive technology (4.1.2);
- work fully from the keyboard (2.1.1);
- be settable by one click or tap without dragging (2.5.7; keyboard support does not count for this);
- be at least 24 by 24 CSS px as a whole target, or be well spaced (2.5.8);
- have a thumb, state and focus ring at 3:1 contrast (1.4.11, 2.4.7).

A knob gets no special treatment. It is judged exactly like a slider, and circular or vertical dragging needs a one-click alternative. Because the music plays by itself, 1.4.2 Audio Control (Level A, non-interference) also applies. That makes a reachable music control mandatory, not optional.

### Cited Findings

#### Normative text (WCAG 2.2, W3C Recommendation dated 12 December 2024 on the TR page)
- **1.4.13 Content on Hover or Focus (AA):** "Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true:
  - **Dismissible:** A mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus, unless the additional content communicates an input error or does not obscure or replace other content;
  - **Hoverable:** If pointer hover can trigger the additional content, then the pointer can be moved over the additional content without the additional content disappearing;
  - **Persistent:** The additional content remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid.
  - **Exception:** The visual presentation of the additional content is controlled by the user agent and is not modified by the author."

  — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus)
- **2.1.1 Keyboard (A):** "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes, except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints." Note 2: "This does not forbid and should not discourage providing mouse input or other input methods in addition to keyboard operation." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#keyboard)
- **2.1.2 No Keyboard Trap (A):** "If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away." It is a non-interference criterion. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap)
- **2.4.7 Focus Visible (AA):** "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#focus-visible)
- **2.4.11 Focus Not Obscured (Minimum) (AA, new in 2.2):** "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content." Note 2: "Content opened by the user may obscure the component receiving focus. If the user can reveal the focused component without advancing the keyboard focus, the component with focus is not considered visually hidden due to author-created content." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum)
- **2.4.13 Focus Appearance (AAA, new in 2.2):** "When the keyboard focus indicator is visible, an area of the focus indicator meets all the following: is at least as large as the area of a 2 CSS pixel thick perimeter of the unfocused component or sub-component, and has a contrast ratio of at least 3:1 between the same pixels in the focused and unfocused states." It is exempt when the indicator is set by the user agent, or when the indicator and its background are not modified by the author. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#focus-appearance)
- **2.5.1 Pointer Gestures (A):** "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless a multipoint or path-based gesture is essential." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#pointer-gestures)
- **2.5.7 Dragging Movements (AA, new in 2.2):** "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#dragging-movements)
- **2.5.8 Target Size (Minimum) (AA, new in 2.2):** "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when: ..." The exceptions:
  - **Spacing:** "Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target".
  - **Equivalent:** "The function can be achieved through a different control on the same page that meets this criterion".
  - Inline, User Agent Control and Essential.

  Note 1: "Targets that allow for values to be selected spatially based on position within the target are considered one target for the purpose of the success criterion. Examples include sliders, color pickers displaying a gradient of colors, or editable areas where you position the cursor." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#target-size-minimum); [Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **2.5.5 Target Size (Enhanced) (AAA):** 44 by 44 CSS pixels. Its exceptions are Equivalent, Inline, User Agent Control and Essential; there is no Spacing exception. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#target-size-enhanced)
- **4.1.2 Name, Role, Value (A):** "For all user interface components (including but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies." Note: "standard HTML controls already meet this success criterion when used according to specification." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#name-role-value)
- **1.4.11 Non-text Contrast (AA):** "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s):
  - User Interface Components: Visual information required to identify user interface components and states, except for inactive components or where the appearance of the component is determined by the user agent and not modified by the author;
  - Graphical Objects: Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed."

  — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#non-text-contrast)
- **1.4.2 Audio Control (A):** "If any audio on a web page plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level." It is a non-interference criterion: "all content on the web page (whether or not it is used to meet other success criteria) must meet this success criterion." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#audio-control)
- **2.5.3 Label in Name (A):** "For user interface components with labels that include text or images of text, the name contains the text that is presented visually." Note: "A best practice is to have the text of the label at the start of the name." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#label-in-name)
- **3.2.1 On Focus (A):** "When any user interface component receives focus, it does not initiate a change of context." **3.2.2 On Input (A):** "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component." **4.1.3 Status Messages (AA):** "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus." — [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

#### What the Understanding documents say about hover popups, sliders and circular controls
- **1.4.13, hover and focus:** "Content which can be triggered via pointer hover should also be able to be triggered by keyboard focus." The document then points to 2.1.1. — [Understanding 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)
- **1.4.13, what counts:** "Custom tooltips, sub-menus, and other nonmodal popups that display on hover and focus are examples of additional content covered by this criterion." — [Understanding 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)
- **1.4.13, dismissal:** "it's important to provide a way for users to dismiss any additional content without the need to move their mouse or keyboard focus, such as pressing the Esc key." Its example: "a user can press the Escape key to clear the tooltip without moving the mouse". Its sufficient technique is SCR39 ("Making content on focus or hover hoverable, dismissible, and persistent") and its failure is F95 (hover content that is not hoverable) **[summary]**. The user-agent exception covers the browser's own `title` tooltips. — [Understanding 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)
- **2.5.7, the slider track:** "while a range slider is operated by dragging the slider thumb, an alternative pointer method to change the value is to click/tap anywhere on the slider track to move the thumb to that position." Its example: "A range slider control widget, where the value can be set by dragging the visual indicator (thumb) showing the current value, allows tapping or clicking on any point of the slider track to change the value and set the thumb to that position." — [Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- **2.5.7, a circular example that bears on knobs:** "A radial control widget (color wheel) where the value can be set by dragging the marker for the currently selected color to another position, also allows picking another color value by tapping or clicking on another place in the color wheel." — [Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- **2.5.7, keyboard support does not satisfy it:** "achieving keyboard equivalence for a dragging operation does not automatically meet this success criterion, unless that equivalent keyboard operation also provides controls that can be clicked or tapped with a pointer." Also: "providing a text input can be an acceptable single-pointer alternative to dragging", for example "an input beside a slider could allow any user to enter a precise value for the slider." Technique G219, failure F108 **[summary]**. — [Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- **2.5.1 versus 2.5.7 for sliders:** "the vast majority of sliders (either provided natively by user agents, or implemented by the content using scripting) use "pointer capture" – once the user has "grabbed" a slider thumb, they can "drift" from the horizontal or vertical track of the slider while changing the value." And: "Unless the slider is implemented in a way that forces users to precisely follow the path of the track, and straying from the track "loses" the user's grip on the slider thumb, operating a slider is only considered a dragging movement, rather than a path-based gesture." — [Understanding 2.5.1](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html). A slider that loses its grip "may fail against the requirements of both success criteria." — [Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- **2.5.8:** A whole slider is one target (Note 1, above). The worked example of "a horizontal row of six icon-based buttons" passes where "the dimensions of each target are 24 by 24 CSS pixels". The document says nothing specific about thumb size. — [Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **1.4.11, slider thumbs:** "For visual information required to identify a state, such as the check in a checkbox or the thumb of a slider, that part might be within the component so the adjacent color might be another part of the component." Its toggle-button figure passes because the toggle's background contrasts with the page and "the round toggle within ... contrasts with the internal background." Disabled components and unmodified browser focus styles are exempt. — [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- **2.4.11, popups that stay open:** "if an author allows such components to persist after the user has 1) activated one of the opened items or 2) moved the focus away from the triggering item and the additional content, it is at risk of failing this criterion by obscuring the item with focus." Also: "Notifications that do not require user action could also meet this criterion by closing on loss of focus." A fully obscured focus indicator "would likely fail 2.4.7 Focus Visible" **[summary]**. — [Understanding 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- **2.4.13 uses a slider as its worked example:** "A slider to pick colors provides a working example of a different complex component that predominantly shows focus for the subcomponent. In this case, the thumb slider sub-component has a focus indicator of sufficient size and contrast to pass the sufficient area calculation." — [Understanding 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- **2.4.7:** Its sufficient techniques include G149 (components the user agent highlights on focus), C15 (CSS to change a component's look on focus), G165 (the platform's default focus indicator) and G195 (an author-supplied visible focus indicator). Its failure covers "styling element outlines and borders in a way that removes or renders non-visible the visual focus indicator". — [Understanding 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- **4.1.2, for custom widgets:** techniques ARIA4 (exposing roles), ARIA5 (exposing states and properties) and ARIA16 (aria-labelledby names). Failures F59 (scripted div or span controls without a role), F68 (no programmatic name) and F79 (focus state not determinable) **[summary]**. — [Understanding 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)
- **1.4.2:**
  - "Individuals who use screen reading software can find it hard to hear the speech output if there is other audio playing at the same time."
  - "Having control of the volume includes being able to reduce its volume to zero."
  - "Muting the system volume is not "pausing or stopping" the autoplay audio."
  - Sufficient techniques: G170, "Providing a control near the beginning of the web page that turns off sounds that play automatically", and G171, "Playing sounds only on user request".

  — [Understanding 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)
- **2.5.3, symbolic text:** "text should not be considered a visible label if it is used in a symbolic manner, rather than directly expressing something in human language". The example is "B", "I" and "ABC" icons in a text editor. The document does not discuss visible keyboard-shortcut hints. — [Understanding 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
- **W3C working example, "Custom control slider built on top of a native slider":** a hidden native input type=range serves keyboard and assistive-technology users and is kept in sync with a custom visual for pointer users. It deliberately avoids the ARIA slider pattern because of touch and assistive-technology limits, and advises: "Overall you should style the native `<input type="range">`, but if you have to use a custom approach then use a real (but hidden) range input approach." It cites 2.1.1, 2.5.1 and 4.1.2 **[summary]**. — [W3C working example](https://www.w3.org/WAI/WCAG21/working-examples/providing-single-point-control-slider/)

#### WCAG 3: draft only, not a standard (Working Draft of 10 September 2026; every item below is marked "Developing")
- **"Keyboard accessible":** "All content that can be accessed by other input modalities can be accessed using keyboard interface only. Note 1 All content includes content made available via mechanisms including but not limited to hovers, right clicks." — [WCAG 3.0 WD](https://www.w3.org/TR/wcag-3.0/)
- **"Simple pointer input available" (core):** "All functionality and content available using complex pointer inputs is also available using a simple pointer input, or a sequence of simple pointer inputs that do not require timing." Its list of complex inputs includes "dragging movements". — [WCAG 3.0 WD](https://www.w3.org/TR/wcag-3.0/)
- **Hover and focus content:** "Hover or focus content dismissible" (core), "Hover content persistent" (core; it is the hoverable rule) and "Hover or focus content persistent" (supplemental) carry 1.4.13 forward almost word for word. — [WCAG 3.0 WD](https://www.w3.org/TR/wcag-3.0/)
- **Focus and contrast:**
  - "Focus indicator contrast sufficient" (core) and "Focus indicator size sufficient" (supplemental) apply only when "the user agent's default focus indicator is replaced by a custom focus indicator".
  - "Interactive element contrast sufficient" (core).
  - "Roles, values, states, properties available" (core): "Accurate names, roles, values, and states are available for interactive elements."

  — [WCAG 3.0 WD](https://www.w3.org/TR/wcag-3.0/)
- **"Page/view audio adjustable" (core):** "A mechanism is available to pause, stop, and adjust the volume independently of the overall system volume level, of any automatically playing audio in a page / view." — [WCAG 3.0 WD](https://www.w3.org/TR/wcag-3.0/)

### Inferences

**Checklist for a switch that grows a slider on hover (YouTube style).** Each item maps to a criterion.
1. **Opens from focus as well as hover** (1.4.13 Understanding; 2.1.1). Focusing the sound switch, or anything inside the flyout, shows the flyout. The slider follows the switch directly in DOM and Tab order, so Tab reaches it.
2. **Hoverable** (1.4.13; F95). There is no gap between the switch and the flyout that the pointer must cross, or a short close delay covers the trip. Nothing hides the flyout while the pointer or focus is inside it.
3. **Dismissible** (1.4.13). Escape closes the flyout without moving focus; if focus was inside, returning it to the switch is the usual choice. If the flyout only expands into empty rail space and covers nothing, 1.4.13's Escape rule does not strictly apply, but Escape is still expected.
4. **Persistent** (1.4.13). No hide-after-N-seconds timer while it is hovered or focused.
5. **Closes when focus leaves the switch and flyout** (2.4.11 Understanding). It must not cover the music or menu switch when focus moves there.
6. **The slider inside:**
   - 4.1.2: a native `<input type=range min=0 max=100>`, named for its channel.
   - 2.1.1: arrows, Home/End and Page Up/Down work.
   - 2.5.7: clicking the track sets the value (native ranges do this).
   - 2.5.8: the whole slider box is at least 24 CSS px on its short side, or well spaced.
   - 1.4.11: the thumb contrasts 3:1 with the track, and both with the rail.
   - 2.4.7: a visible focus ring on the slider.
7. **Touch.** Hover does not exist, so tapping the switch will only toggle mute. Settings-menu sliders give touch users (and anyone else) an equivalent path. That also lets smaller rail targets lean on 2.5.8's "Equivalent" exception, though only for the equivalent function.

**Checklist for a knob.** The same list applies. In addition:
- (a) Expose it as a slider (see question 6).
- (b) Provide a one-click alternative to dragging (2.5.7): clicking a point on the dial ring, as in the colour-wheel example, or small step buttons. Arrow keys do not count.
- (c) Use pointer capture, so the drag keeps its grip when the pointer strays (2.5.1).
- (d) Make the pointer notch (the value indicator) 3:1 against the knob face (1.4.11, a graphical object or state).

**Size maths on the 2px pixel grid.**
- 24 CSS px is 12 grid cells.
- If the hit box of each rail switch is 24×24 CSS px, the art can still be smaller.
- If a switch's box is smaller, 2.5.8's Spacing test needs centres at least 24 px apart and no other target within 12 px of each centre.
- A 2 px (one-cell) focus outline around the whole switch meets 2.4.13's AAA area rule, provided its pixels change by at least 3:1.

**1.4.2.** The music plays automatically for more than 3 seconds, so the music switch (or a music volume control) is a Level A non-interference requirement. G170 favours putting it "near the beginning" of the page, which a top rail satisfies if it is early in the Tab order. Every volume control must reach 0.

**The M key cap (2.5.3).** If the rail's only visible text on the sound switch is the letter "M", a strict auditor could treat "M" as its visible label, so the accessible name should then contain "M". The symbolic-character guidance ("B" for Bold) suggests a letter used as a shortcut hint is not a label, but the Understanding text does not settle shortcut hints. A safe pattern:
- the name leads with the function ("Sound");
- the shortcut is exposed with `aria-keyshortcuts="M"` (see question 5);
- the key cap is drawn only while shortcuts are turned on.

**4.1.3.** When M toggles mute while focus is elsewhere, the switch's state attribute changes, but nothing is announced. A polite status message ("Sound off") meets 4.1.3's intent.

### Gaps
- No Understanding document addresses slider thumb size. Note 1 treats the whole slider as one target, so a visually thin track inside a 24 px tall input box should pass. I found no W3C statement confirming how auditors measure this.
- No W3C document covers rotary knobs specifically. The colour-wheel example in 2.5.7 is the closest.
- The 1.4.13 technique and failure IDs, the 2.5.7 IDs and the 4.1.2 technique list came through a summariser; the criterion texts themselves were checked word for word.

## 2. What do the APG slider pattern and screen-reader behaviour say (native input type=range versus custom role=slider), and how can a native range be styled in pixel art without breaking it?

### Takeaway
The APG slider pattern fixes two contracts:
- **Keyboard:** arrows step; Home and End jump to the ends; Page Up and Page Down take large steps (optional); focus sits on the thumb.
- **ARIA:** role slider; aria-valuenow, aria-valuemin and aria-valuemax; aria-valuetext when the number alone is unclear; a label; aria-orientation=vertical for vertical sliders.

A native `<input type="range">` provides all of this for free. It is also the only kind of slider that touch screen readers (iOS VoiceOver, Android TalkBack) reliably operate. W3C, MDN and practitioners all say to style the native element, or at worst to keep a real native range invisible over a custom visual.

The styling traps are:
- removing the focus outline without a replacement;
- relying on gradients or box-shadows, which forced-colors (high-contrast) mode removes;
- building the slider from a div with role=slider.

### Cited Findings

#### APG slider pattern
- **Definition:** "A slider is an input where the user selects a value from within a given range. Sliders typically have a slider thumb that can be moved along a bar, rail, or track to change the value of the slider." — [APG Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- **Keyboard:**
  - "Right Arrow: Increase the value of the slider by one step."
  - "Up Arrow: Increase the value of the slider by one step."
  - Left Arrow and Down Arrow decrease it by one step.
  - "Home: Set the slider to the first allowed value in its range. End: Set the slider to the last allowed value in its range."
  - "Page Up (Optional): Increase the slider value by an amount larger than the step change made by Up Arrow." Page Down is the mirror.
  - Note: "Focus is placed on the slider (the visual object that the mouse user would move, also known as the thumb."
  - "In some circumstances, reversing the direction of the value change for the keys specified above, e.g., having Up Arrow decrease the value, could create a more intuitive experience."

  — [APG Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- **ARIA:**
  - Role slider goes on "The element serving as the focusable slider control".
  - aria-valuenow, aria-valuemin and aria-valuemax are each "set to a decimal value".
  - "If the value of aria-valuenow is not user-friendly, e.g., the day of the week is represented by a number, the aria-valuetext property is set to a string that makes the slider value understandable, e.g., "Monday"."
  - "If the slider has a visible label, it is referenced by aria-labelledby on the slider element. Otherwise, the slider element has a label provided by aria-label."
  - "If the slider is vertically oriented, it has aria-orientation set to vertical. The default value of aria-orientation for a slider is horizontal."

  — [APG Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- **Touch warning, which appears on both the slider and multi-thumb pages:** "Some users of touch-based assistive technologies may experience difficulty utilizing widgets that implement this slider pattern because the gestures their assistive technology provides for operating sliders may not yet generate the necessary output. To change the slider value, touch-based assistive technologies need to respond to user gestures for increasing and decreasing the value by synthesizing key events. This is a new convention that may not be fully implemented by some assistive technologies. Authors should fully test slider widgets using assistive technologies on devices where touch is a primary input mechanism before considering incorporation into production systems." — [APG Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- **The pattern's examples:**
  - Color Viewer Slider.
  - Vertical Temperature Slider, which uses "aria-orientation to specify vertical orientation and aria-valuetext to communicate unit of measure".
  - Rating Slider.
  - Media Seek Slider.

  None is rotary. The APG pattern index lists Slider, Slider (Multi-Thumb), Spinbutton, Switch, Toolbar, Tooltip and others, with no knob or dial pattern. — [APG Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/); [APG Patterns index](https://www.w3.org/WAI/ARIA/apg/patterns/)
- **Multi-thumb slider:** "A multi-thumb slider implements the Slider Pattern but includes two or more thumbs". "Each thumb is in the page tab sequence", and "The tab order remains constant regardless of thumb value and visual position within the slider." It does not apply to two independent volume channels. — [APG Slider (Multi-Thumb)](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/)
- **Media Seek Slider example** **[summary]**:
  - Page Up and Page Down move 15 steps.
  - aria-valuetext converts seconds into minutes and seconds, and the maximum is announced when the slider is created and when the thumb receives focus.
  - "The display of the slider's current value remains adjacent to the thumb as the thumb is moved, so people with a small field of view (e.g., due to magnification) can easily see the value while focusing on the thumb."
  - It uses `currentcolor` and `fill-opacity` so it still works in high-contrast mode.
  - It is marked "not intended for production environments" without full assistive-technology testing.

  — [APG Media Seek Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-seek/)
- **APG toolbar pattern (relevant if the rail becomes role=toolbar):**
  - "In horizontal toolbars, Left Arrow and Right Arrow navigate among controls. Up Arrow and Down Arrow can duplicate Left Arrow and Right Arrow, respectively, or can be reserved for operating controls".
  - "Avoid including controls whose operation requires the pair of arrow keys used for toolbar navigation. If unavoidable, include only one such control and make it the last element in the toolbar."
  - "Use toolbar as a grouping element only if the group contains 3 or more controls."

  — [APG Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

#### MDN
- **ARIA slider role** **[summary]**:
  - "It is recommended to use a native `<input>` of type range, `<input type="range">`, rather than the slider role."
  - With non-semantic elements, "all features of the native semantic element must be recreated with ARIA attributes, JavaScript, and CSS".
  - A non-native slider needs `tabindex`, and "Focus should be placed on the slider thumb".
  - slider is the only read-write range role; progressbar and meter are read-only.
  - The aria-valuetext example is a t-shirt-size slider running from "xx-small through to XX-large", and aria-valuetext "must be updated as the value or aria-valuenow is updated".
  - MDN repeats the touch warning and has a keyboard table that matches the APG.

  — [MDN: ARIA slider role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/slider_role)
- **input type=range** **[summary]**:
  - implicit ARIA role slider; default step 1; default value halfway between min and max.
  - "Because this kind of widget is imprecise, it should only be used if the control's exact value isn't important."
  - Such a value "is typically represented using a slider or dial control rather than a text entry box like the number input type".
  - Vertical sliders use `writing-mode: vertical-lr` (or `vertical-rl`); the legacy `appearance: slider-vertical` and `orient="vertical"` serve older browsers.
  - Tick marks come from `list` plus `<datalist>`, optionally with `label`s.

  — [MDN: input type=range](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range)

#### Mobile screen readers: native versus custom
- Paul J. Adam's demo notes (undated): "Custom ARIA sliders are not operable using VoiceOver for iOS on iPhone/iPad to adjust the value, whereas a native HTML input type=range slider can be adjusted correctly with mobile screen readers. Same problem exists with TalkBack and Chrome on Android, the screen reader user can use their Volume Up/Down keys to adjust the values of native sliders but not with custom sliders." Also: "iOS does not detect keyboard events in Mobile Safari", and "Native sliders also give you free support for Home/End, and Page Up/Page Down keys". — [Paul J. Adam, Multi-Thumb Slider demo](https://pauljadam.com/demos/multithumb-slider.html)
- A user report from November 2019 on a custom ARIA range slider library: "The VO instruction is "swipe up or down with one finger to adjust the value", but when doing so nothing happens." — [GitHub issue, aria-progress-range-slider #2](https://github.com/Stanko/aria-progress-range-slider/issues/2)
- TPGi/Vispero's "Evolving custom sliders" describes a hybrid **[snippet]**: an `<input type="range">` "hidden with opacity, so it's invisible but remains interactive", with the custom visual "positioned directly behind the range input, similar to the technique that's used for custom checkboxes". The article body would not render for me. — [Vispero/TPGi, Evolving custom sliders](https://vispero.com/resources/evolving-custom-sliders/)

#### Desktop screen readers (NVDA, JAWS)
- NVDA 2026.2 has a setting, "Automatic focus mode for focus changes". Its guide describes it this way: "if you press tab and you land on a form, if this option is checked, focus mode will automatically be invoked." — [NVDA 2026.2 User Guide](https://download.nvaccess.org/documentation/userGuide.html)
- The Accessibility Developer Guide explains how Tab interacts with screen-reader modes:
  - "For elements allowing only basic interaction (for example links, buttons, and checkboxes), focus mode is not activated", while complex ones that take arrow keys switch focus mode on.
  - "When browsing line by line (using Up and Down keys), NVDA's default settings require the user to manually switch to focus mode".
  - "JAWS by default has a special setting called "Auto Forms Mode": it tries to automatically switch between browse and focus mode whenever appropriate."

  — [ADG: Browse and focus modes](https://www.accessibility-developer-guide.com/knowledge/screen-readers/desktop/browse-focus-modes/)
- The narration expected in games is shown in the Accessible Games Initiative's narrated-menus requirement: "narrate their name, role, and state or value (such as ... "Volume, slider, 60%")". — [Microsoft Learn, Accessibility Feature Tags](https://learn.microsoft.com/en-us/gaming/accessibility/accessibility-feature-tags)

#### Styling a native range without breaking it
- CSS-Tricks (Daniel Stern, 5 November 2014) **[summary]**:
  - Reset the native look with `-webkit-appearance: none; /* Hides the slider so that custom slider can be made */`.
  - `outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */`
  - Style the thumb and track with `::-webkit-slider-thumb`, `::-webkit-slider-runnable-track`, `::-moz-range-thumb` and `::-moz-range-track`; the old `::-ms-*` selectors are obsolete.
  - Vendor selectors must go in separate rules, because a rule containing any unrecognised selector is dropped.

  — [CSS-Tricks](https://css-tricks.com/styling-cross-browser-compatible-range-inputs-css/)
- In forced-colors mode **[summary]**:
  - The browser forces `color`, `background-color`, `border-color`, `outline-color`, SVG `fill` and `stroke`, and others.
  - `box-shadow` and `text-shadow` become none.
  - "`background-image` → forced to `'none'` for values that are not url-based". Gradients vanish, url() images survive.
  - System colours follow native semantics, not ARIA: adding `role="button"` to a div does not force it to ButtonText.
  - `forced-color-adjust: none` opts out, and MDN advises only small targeted tweaks, not a separate design.

  — [MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
- The APG on focus styling: "Authors are advised to rely on the default focus indicators provided by browsers." And: "Colors and gradients can disappear in high contrast modes." — [APG: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- USWDS range slider **[summary]**:
  - It is a native `<input type="range">` with a `<label>` and a hint, "Move the slider to change the value", linked by `aria-describedby`.
  - It offers an optional unit for screen-reader callouts (e.g., "3.5 stars"), a 2px border "for low-vision users" and forced-colors support.
  - It is recorded as "Passed WCAG 2.1 AA".
  - Use it "When the range is more important than precision"; "Use a regular text input if a user needs to enter a precise number."

  — [USWDS Range slider](https://designsystem.digital.gov/components/range-slider/)
- W3C's working example says to style the native input, or keep a real hidden range input under a custom visual (quoted in question 1). — [W3C working example](https://www.w3.org/WAI/WCAG21/working-examples/providing-single-point-control-slider/)

### Inferences

**One native `<input type="range" min="0" max="100" step="1">` per channel.**
- Name each with `<label>` or aria-label: "Sound volume" and "Music volume".
- Set aria-valuetext as "60%", matching the XAG/AGI narration example "Volume, slider, 60%". At 0 it could read "0%, muted" if 0 means silent.
- Native ranges give arrows, Home/End, Page Up/Down, click-on-track, pointer capture, mobile screen-reader gestures and forced-colors mapping, which covers 2.1.1, 2.5.7, 4.1.2 and most of 1.4.11 at once.

**A pixel-art styling recipe that follows the rules above.**
- Use `appearance: none` on the input.
- Draw the track with a solid `background-color` and a 2px border. Borders survive forced colors as system colours.
- Draw the thumb as a url() pixel sprite with `image-rendering: pixelated`, or as a bordered box. Avoid linear-gradient "filled track" tricks and box-shadow outlines, which forced-colors mode deletes.
- Give it a visible focus ring. An outline one grid cell (2px) thick meets 2.4.13's area rule if its colour change is at least 3:1.
- Add a small `@media (forced-colors: active)` block that sets the thumb border to `CanvasText` and the focus outline to `Highlight`.
- Keep the input's box at least 24 CSS px tall, even if the drawn track is 4 px tall, so the hit area meets 2.5.8.

**Knob skin.** If the knob look cannot be drawn with the thumb and track pseudo-elements, keep a real range input over the drawing, as in the W3C and TPGi hybrids. Never use a div with role=slider: that breaks iOS VoiceOver and TalkBack adjustment, and loses forced-colors semantics.

**Toolbar.** If the rail is implemented as role=toolbar, a horizontal slider inside it collides with toolbar arrow navigation. Either keep plain Tab stops, or use a vertical flyout slider driven by Up and Down (the APG allows reserving the vertical arrows "for operating controls"), or make the slider the last item.

**Desktop screen readers.** NVDA and JAWS users who Tab onto the slider get focus mode, and arrows adjust the value. Users arrowing through in browse mode will hear it but must switch to focus mode first. Either way, the value readout must come from aria-valuetext or the value itself, not from a nearby visual label alone.

### Gaps
- a11ysupport.io's support tables for role=slider and input type=range returned HTTP 403, so I have no current per-screen-reader, per-browser matrix.
- I found no dated 2025–2026 test of whether iOS VoiceOver or TalkBack now synthesise key events for custom ARIA sliders. The APG still calls this "a new convention". Paul J. Adam's page is undated.
- VoiceOver on macOS behaviour for native and custom sliders was not covered by any source I retrieved.
- Browser default step sizes for Page Up and Page Down on a native range are not documented in the sources I retrieved.
- TPGi's hybrid-technique article could not be read in full.

## 3. What do game accessibility guidelines require of volume settings (GAG, XAG, AbleGamers APX, Can I Play That?)?

### Takeaway
All the game-specific sources agree on separate, independently adjustable channels that can each be muted:
- **Game Accessibility Guidelines (GAG):** "Provide separate volume controls or mutes for effects, speech and background / music" is Basic for hearing and Intermediate for vision and cognition.
- **Xbox Accessibility Guideline 105:** lists music, voice-over, active sound effects, ambient sound effects, narration and voice chat as separate channels.
- **Accessible Games Initiative "Multiple Volume Controls" tag** (from the Entertainment Software Association, used by Xbox's store): also requires one control that changes all game sounds at once, and tests that every volume control can be muted.

None of them specifies a widget, a 0–100 range, a step size or a default level. Reviewers such as Can I Play That? mostly just list which sliders a game has.

### Cited Findings
- **GAG guideline "Provide separate volume controls or mutes for effects, speech and background / music":** categories and levels are "Hearing (Basic) Cognitive (Intermediate) Vision (Intermediate)". — [GAG guideline](https://gameaccessibilityguidelines.com/provide-separate-volume-controls-or-mutes-for-effects-speech-and-background-music/)
  - Hearing: "Loss of hearing can affect certain frequencies more than others, so being able to control volume independently is essential."
  - Vision: "Being able to distinguish individual sounds is particularly important when visual cues are not able to be detected as easily."
  - Cognitive: "Too many different sources of information can make it difficult to focus on any of them. There is even a specific condition (auditory processing disorder) for which simultaneous sounds can be impossible to distinguish or even distressing."
  - "Depending on what kinds of audio are important to your game, other sliders might also be useful, such as the Killer Instinct HUD slider". A blind player explains that the HUD slider adds cues "crucial to playing the game without sight".
  - Best-practice examples: Diablo 3 audio options, Killer Instinct volume sliders, StarCraft II sound options.
- **GAG level definitions:** Basic is "Easy to implement, wide reaching and apply to almost all game mechanics"; Intermediate is "Require some planning and effort but often just good general game design"; Advanced is "Complex adaptations for profound impairments and specific niche mechanics". — [GAG full list](https://gameaccessibilityguidelines.com/full-list/)
- **Other GAG items that bear on a volume control** — [GAG full list](https://gameaccessibilityguidelines.com/full-list/)
  - General, Basic: "Ensure that all settings are saved/remembered"; "Provide details of accessibility features in-game".
  - Motor, Basic:
    - "Ensure interactive elements / virtual controls are large and well spaced, particularly on small or touch screens" (also Vision, Basic).
    - "Ensure that all areas of the user interface can be accessed using the same input method as the gameplay".
    - "Allow controls to be remapped / reconfigured".
  - Motor, Intermediate:
    - "Ensure that multiple simultaneous actions (eg. click/drag or swipe) are not required, and included only as a supplementary / alternative input method".
    - "Make interactive elements that require accuracy (eg. cursor/touch controlled menu options) stationary".
    - "Support more than one input device".
  - Hearing, Intermediate: "Provide a stereo/mono toggle". Vision, Advanced: "Ensure screen reader support, including menus & installers".
- **Xbox Accessibility Guideline 105** (Microsoft Learn; ms.date 2022-05-09, updated 2026-06-17): — [XAG 105](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/105)
  - Goal: players "can hear important audio cues, speech output ..., or assistive technologies like screen readers ... by providing separate volume controls for each type of audio output (like music volume, effects volume, character dialogue, voice chat, or screen reader)".
  - Requirement: "Games should provide a method for players to adjust the volume of the audio, or mute different types of audio, independently from each other, including but not limited to the following: Music, Voice-over, Active sound effects (those critical to gameplay ...), Background/ambient sound effects (those not critical to gameplay), Narration, Voice chat".
  - Example: in Grounded "players are provided separate controls for six different types of audio output" (master, effects, music, UI, dialogue, voice chat).
  - It also asks for a stereo-to-mono option, the ability to pause audio events (with exemptions), and "an option to automatically lower or mute game audio when audio output from assistive technologies such as a screen reader is detected."
  - It lists players without vision, with low vision, with cognitive or learning disabilities, and those "playing in a noisy room or playing with device sound off".
- **Accessible Games Initiative tag "Auditory Features - Multiple Volume Controls"** (Microsoft Learn copy; tag version 2.0.1 published 14 March 2025, page dated 14 August 2026): — [Microsoft Learn, Accessibility Feature Tags](https://learn.microsoft.com/en-us/gaming/accessibility/accessibility-feature-tags)
  - Requirements: "Provide separate volume controls for each type of audio used in the game", namely sound effects, speech, ambient audio, music, voice chat, menu narration and accessible audio cues. "Provide a single control to change the volume of all game sounds at once."
  - Microsoft's test step 5: "Verify that all volume controls can be muted." Step 6b: "Does the title provide a method to adjust all volume with a single control?"
  - Pass example 2: "The title contains both music and sound effects (the sound effects do not impact player decisions or help the player perform) and the title only contains a master, music and sound effect slider."
  - Fail example 2: "The title only contains a master volume slider but has sound effects and music."
  - Tips: consider separate channels for distinct important effects. Separate channels let players lower sounds "that impact conditions like post-traumatic stress disorder (PTSD)".
- **Other tags on the same page:** — [Microsoft Learn, Accessibility Feature Tags](https://learn.microsoft.com/en-us/gaming/accessibility/accessibility-feature-tags)
  - "Accessibility on launch" lists "Custom volume controls: All individual volume levels" among the minimum settings shown on the first screen, before any menu or cinematic.
  - The narrated-menus requirement asks for name, role and value ("Volume, slider, 60%"). It also asks that players can "navigate all interfaces by shifting focus directly from one UI element to the next by a single action ... without having to steer a cursor".
- **AbleGamers, Accessible Player Experiences (APX), "Clear Channels" (an Access pattern)** **[summary]**: — [APX Clear Channels](https://accessible.games/accessible-player-experiences/access-patterns/clear-channels/)
  - Problem: "Players cannot reliably take in and understand information in one or more channels of a game or its interfaces."
  - Solution: "Players can change the attributes of information in channels so that they can reliably take in and understand it."
  - Example: Overwatch lets players adjust "sound effects, music volume, in-game voice volume, the master volume for the prior three components, voice chat volume, and voice chat microphone volume".
  - APX gives no widget-level guidance. Related patterns include "Distinguish This From That" and "Same Controls But Different" (remapping). — [APX list](https://accessible.games/accessible-player-experiences/)
- **Can I Play That?** Reviews itemise audio settings. The Until Dawn remake review (Mike Matlock, 25 July 2025) says "There's also a master volume slider as well as individual volume sliders for dialogue, sound effects, music, in-game videos, and the controller speaker" **[summary]**. — [CIPT Until Dawn review](https://caniplaythat.com/2025/07/25/until-dawn-remake-accessibility-review/). The Black Ops 6 audio piece (Marijn Rongen, 18 October 2024): "Aside from those specific features, there are separate volume sliders and audio mix presets", plus mono audio "for when their hearing is limited to one ear" **[summary]**. — [CIPT Black Ops 6 audio](https://caniplaythat.com/2024/10/18/audio-accessibility-in-call-of-duty-black-ops-6-detailed/)

### Inferences
- **What each source asks of this game** (effects and music, apparently no speech):
  - GAG Basic is met by two independent controls, each able to reach silence.
  - The Accessible Games Initiative tag would also want one control for all game sounds. Pass example 2 shows master, music and effects sliders. A master mute alone may not count as a way "to adjust all volume with a single control".
  - Microsoft tests that every control can mute, so each slider's 0 should be true silence, not a floor.
- **Save and restore settings.** Volume levels and mute states should persist between sessions (GAG Basic "saved/remembered"). Because the game runs locally, this would be browser storage, with a sane default when storage is unavailable.
- **Keep the full controls in-game.** They belong in the game's own settings menu, reachable mid-shift, not only on a title screen. A first-run accessibility screen with the volume sliders is needed only if the game chases the "Accessibility on launch" tag.
- **The screen-reader ducking item cannot be implemented as written.** A web page cannot detect a running screen reader. The practical substitute is a low or zero music default, or a clear music control near the start (1.4.2's G170).
- **Separate the effects channel only if the game needs it.** Game guidance separates gameplay-critical effects from ambient or UI sounds. If the desk has ambient room tone as well as informative stamps and buzzers, a third "ambience" or "UI" channel matches XAG 105's active/ambient split. Otherwise two channels suffice.

### Gaps
- No game guideline specifies a range, step size, default level, widget type (slider, knob or stepper) or where the control should live (in-world or menu).
- Can I Play That? publishes no formal checklist for volume settings that I could find. The findings above are from individual reviews.
- The AbleGamers APX material has no guidance at the level of individual controls.

## 4. What goes wrong with hover-only disclosure for keyboard and touch users, what fixes are accepted, and how should a mute toggle and a slider stay separate, clearly named controls?

### Takeaway
Hover-only reveal fails three groups of players:
- **Keyboard users,** unless focus also reveals the slider.
- **Touch and eye-gaze users,** outright: there is no hover, and focusing a button activates it.
- **Everyone else,** when the flyout breaks 1.4.13: it must stay open while hovered, close on Escape, and never time out.

The accepted fixes:
- Make the slider reachable without hover: reveal it on focus, or better, open it from a disclosure button that toggles it on click, Enter or Space with aria-expanded.
- Close it on Escape and return focus.
- Close it when focus leaves.
- Keep a permanent copy in settings.

The mute control and the slider should stay two controls with two stable names: a toggle whose label never changes (aria-pressed, or role=switch with aria-checked), and a slider named for its channel's volume.

### Cited Findings
- Sarah Higley, "Tooltips in the time of WCAG 2.1" (17 August 2019): — [Sarah Higley](https://sarahmhigley.com/writing/tooltips-in-wcag-21/)
  - Tooltips "are inaccessible to touch devices when attached to buttons or links. This is because hover is unavailable on a touch device, and it is also impossible to focus a button or link without activating it. The same limitation exists for other pointer-controlled assistive tech like eye gaze."
  - Her rules: "Hide when a keyboard user presses "Escape" (unless the tooltip will never overlap other content)"; "Allow a mouse or pointer user to hide the tooltip, ideally through a close button"; "No interactive content. Any interactive content such as links or buttons should not be placed within a tooltip."
  - "popups with rich or interactive content are not considered tooltips. Those patterns would benefit from using a disclosure button pattern under the hood."
- APG Disclosure pattern **[summary]**: "A disclosure is a widget that enables content to be either collapsed (hidden) or expanded (visible). It has two elements: a disclosure button and a section of content whose visibility is controlled by the button." Enter and Space toggle it. The button has aria-expanded true or false and, optionally, aria-controls. — [APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- Video.js (current docs), volume popover options: — [Video.js volume popover](https://videojs.org/docs/framework/html/reference/volume-popover)
  - `openOnHover`: "Open the popup on pointer hover instead of click."
  - `closeOnEscape`: "Close the popup when the Escape key is pressed."
  - `closeOnOutsideClick`: "Close the popup when clicking outside the trigger and popup."
  - `closeDelay`: "Delay in ms before closing after pointer leaves."
  - `delay`: "Delay in ms before opening on hover."
  - `modal`: "false (default): non-modal; background content remains interactive."
- Video.js accessibility and example: "The trigger receives aria-haspopup, aria-expanded, and aria-controls while the volume popup is available. When only mute is available, the trigger keeps the mute button's own accessible name and behavior without popup ARIA." Its basic example uses a mute button (visible label "Mute" or "Unmute") as the trigger for an `open-on-hover` popover holding a vertical volume slider. The docs do not describe keyboard or touch opening. — [Video.js volume popover](https://videojs.org/docs/framework/html/reference/volume-popover)
- Video.js volume slider: — [Video.js volume slider](https://videojs.org/docs/framework/html/reference/volume-slider)
  - It "Renders with role="slider" and an automatic aria-label that resolves to "Volume"".
  - Keys: "Arrow Left / Arrow Right: step by step increment; Page Up / Page Down: step by largeStep increment; Home: set volume to 0; End: set volume to max".
  - The mouse wheel adjusts it by `wheelStep` (default 5).
  - "When the media is muted, the fill level drops to 0 regardless of the stored volume value."
- Able Player (Terrill Thompson, 16 December 2015): the proposal to replace volume up and down buttons with one volume control says "Clicking the button reveals a vertical slider and places focus on it", with the U and D hotkeys kept **[summary]**. — [Able Player issue #183](https://github.com/ableplayer/ableplayer/issues/183)
- APG Button pattern **[summary]**:
  - Toggle buttons use aria-pressed. "a button labelled mute in an audio player could indicate that sound is muted by setting the pressed state true."
  - "it is critical the label on a toggle does not change when its state changes. In this example, when the pressed state is true, the label remains "Mute" so a screen reader would say something like "Mute toggle button pressed"."
  - Space and Enter activate it.

  — [APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- APG Switch pattern **[summary]**: — [APG Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)
  - "A switch is an input widget that allows users to choose one of two values: on or off".
  - "It is critical the label on a switch does not change when its state changes."
  - It uses role=switch with aria-checked; Space toggles, Enter optionally.
  - Choose by semantic fit: "Lights switch on" reads better than "Lights checkbox checked" for a light control.
- The 1.4.13 and 2.4.11 Understanding passages in question 1 cover opening on focus, Escape, and closing on loss of focus. — [Understanding 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html); [Understanding 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- GAG (Motor, Intermediate): "Make interactive elements that require accuracy (eg. cursor/touch controlled menu options) stationary". — [GAG full list](https://gameaccessibilityguidelines.com/full-list/)
- The Accessible Games Initiative narrated-menus requirement: players can "navigate all interfaces by shifting focus directly from one UI element to the next by a single action ... without having to steer a cursor". — [Microsoft Learn, Accessibility Feature Tags](https://learn.microsoft.com/en-us/gaming/accessibility/accessibility-feature-tags)
- WCAG 3 draft "Keyboard accessible" names hovers explicitly (quoted in question 1). — [WCAG 3.0 WD](https://www.w3.org/TR/wcag-3.0/)

### Inferences
Patterns that pass, from simplest to richest:
- **(a) Settings sliders only.** The rail switches stay one-click mute toggles. This is fully conformant and easiest to test.
- **(b) Hover-and-focus flyout (YouTube or Video.js style).** The switch keeps one-click mute. Hovering or focusing it (e.g., `:focus-within` on a rail group) reveals the slider, which is the next Tab stop. The flyout must also:
  - close on Escape, on blur out of the group, and on pointer-leave after a short delay;
  - have no timer;
  - never cover the neighbouring switch.
  - Touch users use settings.
- **(c) Disclosure flyout (Able Player style).** A click, Enter or Space on a small separate "volume" button (aria-expanded) opens the slider and moves focus into it. Escape closes it and returns focus. This costs an extra rail target but works on touch.

Combining (b) with the settings sliders keeps the one-click mute that gives immediate feedback and adds quick adjustment. Options (b) and (c) both need the settings copy as the full equivalent path.

**Naming.** Pick either "Mute sound" with aria-pressed, or "Sound" as a switch with aria-checked. Do not mix them. Never swap the label between on and off states (APG). The sliders are "Sound volume" and "Music volume", so voice-control and screen-reader users can tell the four controls apart. Avoid `aria-haspopup="menu"` on the trigger, since the flyout is not a menu; aria-expanded with aria-controls is enough.

**Mute-state semantics are a design choice** with precedents on both sides:
- Video.js drops the fill to 0 while muted but keeps the stored level.
- An alternative keeps the thumb at the stored level and reports "60%, muted" through aria-valuetext.
- A common but unsourced convention: moving the slider above 0 while muted also unmutes.

Whichever is chosen, the switch state and the slider should never contradict each other on screen or to a screen reader.

**Nothing may appear or move under the pointer unexpectedly.** Hover must never move keyboard focus. A flyout that pops up or reflows the rail under the pointer works against the GAG "stationary" guideline. An overlay flyout is preferable to one that shifts the neighbouring switches.

### Gaps
- YouTube does not document its volume flyout's implementation (focus behaviour, ARIA). I found no authoritative source describing it beyond its keyboard shortcuts.
- I found no user research specifically on hover-expanded volume sliders.
- The newer HTML popover and "interest invoker" (hover-triggered popover) platform features were not researched.
- The Video.js docs do not say how their hover popover opens from the keyboard or on touch.

## 5. What are the conflicts and rules for single-key volume shortcuts (M to mute, other keys to step the volume), including WCAG 2.1.4?

### Takeaway
M-to-mute conforms to WCAG 2.1.4 because the game already lets players turn single-key shortcuts off. Any other character keys used to step volume (+, -, [, ], digits) fall under the same rule and the same off switch. Arrows, Page Up/Down and Home/End are not character keys, so 2.1.4 does not cover them, but they belong to the focused slider and to the page.

The real hazards:
- **Speech input.** The Understanding document's own example has "m" muting mail when a user says "Hey Kim".
- **Accidental presses.**
- **Screen readers.** In browse mode NVDA uses "m" to jump to the next frame and, by default, traps letters it does not use. The game's M therefore never arrives unless the user is in focus mode or passes the key through.

So shortcuts can only be extras on top of a focusable, clickable control. They should also be:
- documented;
- exposed with aria-keyshortcuts;
- ignored when a modifier is held or a text field has focus.

### Cited Findings
- WCAG 2.2 **2.1.4 Character Key Shortcuts (A)** — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#character-key-shortcuts):
  - "If a keyboard shortcut is implemented in content using only letter (including upper- and lower-case letters), punctuation, number, or symbol characters, then at least one of the following is true:"
  - "Turn off: A mechanism is available to turn the shortcut off;"
  - "Remap: A mechanism is available to remap the shortcut to include one or more non-printable keyboard keys (e.g., Ctrl, Alt);"
  - "Active only on focus: The keyboard shortcut for a user interface component is only active when that component has focus."
- Understanding 2.1.4 — [Understanding 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html):
  - "The intent of this success criterion is to reduce accidental activation of keyboard shortcuts."
  - Character-key shortcuts "can be inappropriate and frustrating for speech input users, whose dictation is interpreted as strings of letters, and for keyboard users who are prone to accidentally hit keys".
  - The worked example: "a speech-input user named Kim has her cursor focus in the main window of a web mail application that uses common keyboard shortcuts to navigate ( k ), archive ( y ) and mute messages ( m )". When a coworker says "Hey Kim", "K in "Kim" moves down one conversation and M mutes a message or thread."
  - Focus-scoped keys: "This success criterion doesn't affect components such as listboxes and drop-down menus."
  - Sufficient technique G217, failure F99; Gmail and WordPress are cited as apps that let users turn off or change such shortcuts **[summary]**.
- The NVDA 2026.2 User Guide — [NVDA 2026.2 User Guide](https://download.nvaccess.org/documentation/userGuide.html):
  - Single letter navigation: "While in browse mode, for quicker navigation, NVDA also provides single character keys to jump to certain fields in the document". The list includes "b: button", "f: form field", "e: edit field", "x: checkbox", "c: combo box", "m: frame", "g: graphic", "d: landmark", "o: embedded object (audio and video player, application, dialog, etc.)", and "1 to 9: headings at levels 1 to 9 respectively".
  - "Some web applications such as Gmail, Twitter and Facebook use single letters as shortcut keys. If you want to use these while still being able to use your cursor keys to read in browse mode, you can temporarily disable NVDA's single letter navigation keys. To toggle single letter navigation on and off for the current document, press NVDA+shift+space."
  - "Trap non-command gestures from reaching the document", enabled by default: "if enabled and the letter j was pressed, it would be trapped from reaching the document".
  - "Pass next key through NVDA+f2".
- ADG on screen-reader modes: JAWS's "Auto Forms Mode" switches modes automatically, while NVDA's defaults need a manual switch when arrowing. — [ADG: Browse and focus modes](https://www.accessibility-developer-guide.com/knowledge/screen-readers/desktop/browse-focus-modes/)
- APG, Developing a Keyboard Interface — [APG: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/):
  - "Ensure Basic Access Via Navigation: Before assigning keyboard shortcuts, it is essential to ensure the features and functions to which shortcuts may be assigned are keyboard accessible without a keyboard shortcut." **[summary]**
  - Operating-system conflicts: it is essential to avoid keys that perform system-level functions "such as application and window management and display and sound control", by refraining from "Any modifier keys + any of Tab, Enter, Space, or Escape. Meta key + any other single key (there are exceptions, but they can be risky as these keys can change across versions of operating systems). Alt + a function key."
  - Assistive-technology conflicts: "Caps Lock + any other combination of keys. Insert + any combination of other keys. Scroll Lock + any combination of other keys. macOS only: Control + Option + any combination of other keys."
  - "it is almost impossible to be certain conflicts do not exist. So it is also important to employ strategies that mitigate the impact of conflicts".
- WAI-ARIA 1.2, aria-keyshortcuts — [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/#aria-keyshortcuts):
  - "User agents MUST NOT change keyboard behavior in response to the aria-keyshortcuts attribute. Authors MUST handle scripted keyboard events to process aria-keyshortcuts."
  - "The aria-keyshortcuts attribute exposes the existence of these shortcuts so that assistive technologies can communicate this information to users. Authors SHOULD provide a way to expose keyboard shortcuts so that all users may discover them, such as through the use of a tooltip."
  - "Authors SHOULD avoid implementing shortcut keys that inhibit operating system, user agent, or assistive technology functionality. This requires the author to carefully consider both which keys to assign and the contexts and conditions in which the keys are available to the user."
  - Valid values include "A" and "Shift+Space".
- YouTube (Help Center) **[summary]**: "m" does "Mute/unmute the video", and the Up and Down arrows "Increase/Decrease volume 5%". In the new computer experience, "you must click the video player before using keyboard shortcuts". I found no documented way to disable them. — [YouTube keyboard shortcuts](https://support.google.com/youtube/answer/7631406?hl=en)
- Media-player precedents: Able Player keeps U and D hotkeys for volume **[summary]** ([Able Player issue #183](https://github.com/ableplayer/ableplayer/issues/183)). Video.js's slider uses Home for 0 and End for maximum ([Video.js volume slider](https://videojs.org/docs/framework/html/reference/volume-slider)).
- WCAG 3 draft (Developing) — [WCAG 3.0 WD](https://www.w3.org/TR/wcag-3.0/):
  - "No keyboard conflicts" (core): "Custom keyboard commands do not conflict with standard platform keyboard commands or they can be remapped."
  - "Custom keys documented" (supplemental): "Documentation for each custom keyboard command is actively available on the page / view to which it applies, or within the applicable process."
- Remapping: GAG Basic "Allow controls to be remapped / reconfigured" ([GAG full list](https://gameaccessibilityguidelines.com/full-list/)). The Accessible Games Initiative "Basic Input Remapping" tag says "Rearrangement must be available for all supported inputs (such as keyboard, mouse, controller, and virtual on-screen controller)" and that relying on system-level remapping does not qualify ([Microsoft Learn, Accessibility Feature Tags](https://learn.microsoft.com/en-us/gaming/accessibility/accessibility-feature-tags)).

### Inferences
- **M conforms through "Turn off"; remapping to another bare letter would not.** 2.1.4's "Remap" route requires a remap that includes a non-printable key such as Ctrl or Alt, so a remap from M to N alone would not count.
- **Every character-key volume shortcut must honour the same off switch.** This covers "-" and "=", "[" and "]", or digits. Do not act when Ctrl, Meta or Alt is held: Ctrl or Cmd with "-" or "=" is browser zoom, and the APG reserves "Meta key + any other single key" for the operating system.
- **Do not bind arrows globally for volume.** Arrows belong to the focused native slider and to page and widget navigation. If arrow volume keys are wanted, scope them (as YouTube does) to when the rail or slider has focus.
- **Where shortcuts should not fire:** in text inputs, selects and contenteditable elements; while a modal dialog such as the settings menu is open, unless intended; and on key repeat for toggles.
- **Keep the display and the accessibility tree truthful:**
  - Update the switch's aria-pressed or aria-checked (4.1.2 change notification).
  - Announce "Sound off" or "Sound on" in a polite live region when the change came from a key press (4.1.3).
  - Put `aria-keyshortcuts="M"` on the sound switch only while shortcuts are on, and hide the M key cap when they are off.
  - List every shortcut in settings or help (the ARIA SHOULD; the WCAG 3 draft "Custom keys documented").
- **Screen-reader users will rarely reach M.** NVDA users in browse mode will not reach the game's M at all ("m" means frame and other letters are trapped). They need the switch itself, which the rail provides. With single-key shortcuts on by default, speech-input users (Dragon, Voice Control) can mute by accident when their dictation lands on the page. Some games default such shortcuts to on and document the off switch; 2.1.4 allows either default.

### Gaps
- I did not verify JAWS or macOS VoiceOver single-key quick-navigation bindings for "m" and other letters.
- I found no data on how often speech-input users trigger letter shortcuts in browser games.
- macOS's own Cmd+M (minimise window) is not directly sourced here. The APG only warns about "Meta key + any other single key" in general.

## 6. What accessibility problems do rotary knob controls have on the web, and how do accessible knob implementations expose themselves?

### Takeaway
There is no ARIA knob or dial role and no APG rotary pattern. An accessible knob is a slider in costume. The most robust build keeps a native `<input type="range">` and draws the knob on it, as the input-knobs library does. That way the name, role, value, arrow keys, Home/End, Page Up/Down and mobile screen-reader gestures all come from the browser.

As a pointer control, a knob:
- is a dragging control (circular or vertical drag) and needs a one-click or one-tap alternative, such as tapping a point on the dial as in 2.5.7's colour-wheel example, or step buttons;
- must not lose its grip when the pointer strays, or it also becomes a path-based gesture under 2.5.1;
- needs a readable value readout and a pointer notch at 3:1 contrast.

Knobs also inherit the general usability doubts about drag controls: GOV.UK advises avoiding click-and-drag range controls.

### Cited Findings
- **Standards picture:**
  - The APG pattern index lists Slider, Slider (Multi-Thumb), Spinbutton, Switch and others, but no knob, dial or rotary pattern. The slider pattern's four examples are all linear. — [APG Patterns index](https://www.w3.org/WAI/ARIA/apg/patterns/); [APG Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
  - MDN treats slider as the only read-write range role and recommends the native range input over role=slider **[summary]**. — [MDN: ARIA slider role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/slider_role)
  - MDN's range page says such a value "is typically represented using a slider or dial control" **[summary]**. — [MDN: input type=range](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range)
- **input-knobs (g200kg)** **[summary]**. The library "simply replace[s] the appearance of `<input/>` tags to rotating knobs, sliders or switches". Usage is `<input type="range" class="input-knob"/>`. Its input methods:
  - mouse drag, "Upward / Right for increase value, Downward / Left for decrease value";
  - Shift and drag for "Fine adjustment, 1/5 sensitivity to mouse movement";
  - the mouse wheel;
  - keyboard, "Up / Right arrow : increment value / Down / Left arrow : decrement value";
  - touch support.

  "'input' and 'change' events are fired same as normal input tags." The page does not discuss screen readers or WCAG. — [input-knobs](https://g200kg.github.io/input-knobs/)
- **Pointer rules:**
  - 2.5.7's colour-wheel example: tap "another place in the color wheel".
  - Keyboard equivalence alone does not satisfy 2.5.7.
  - 2.5.1: a slider that "loses" the user's grip when they stray is both a dragging movement and a path-based gesture.

  — [Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html); [Understanding 2.5.1](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html)
- **Mobile screen readers:** custom ARIA sliders are not adjustable with iOS VoiceOver or TalkBack, while native range inputs are. This applies equally to a knob built as a div with role=slider. — [Paul J. Adam](https://pauljadam.com/demos/multithumb-slider.html)
- **Showing the value:** the APG media seek example keeps "the slider's current value ... adjacent to the thumb as the thumb is moved, so people with a small field of view (e.g., due to magnification) can easily see the value" **[summary]**. — [APG Media Seek Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-seek/). 1.4.11 requires 3:1 for "Parts of graphics required to understand the content" and for visual state information. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/#non-text-contrast)
- **Government design systems on drag controls:**
  - GOV.UK **[summary]**: "Avoid using range slider questions, where the user needs to click and drag a selector across a range of answers or values. These types of controls are difficult for some users to interact with." "If you do use a range slider, you must provide a method for selecting an answer that doesn't rely on 'click and drag' movements. This relates to WCAG success criterion 2.5.1 Pointer Gestures." No research is cited. — [GOV.UK Design System, Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
  - USWDS: use range sliders "when a relative value is more important than an exact value" **[summary]**. — [USWDS Range slider](https://designsystem.digital.gov/components/range-slider/)
- **Game guidance:** GAG Motor asks that "multiple simultaneous actions (eg. click/drag or swipe) are not required, and included only as a supplementary / alternative input method" (Intermediate), and that controls be "large and well spaced" (Basic). — [GAG full list](https://gameaccessibilityguidelines.com/full-list/)

### Inferences
Knob-specific problems, beyond those a slider shares:
- **Ambiguous drag direction.** Circular, vertical and horizontal drags are all conventions; input-knobs uses up or right to increase. Pick one, support the others where cheap, and use pointer capture.
- **The value is hard to read at a glance, especially at pixel scale.** The notch angle over a roughly 270° sweep is the only cue. Show a numeric readout (for example "60") beside the knob while it is hovered, focused or dragged.
- **Tiny targets on a rail.** The knob, as one target, must be at least 24×24 CSS px (12×12 grid cells) or spaced.
- **Wheel hijacking.** A wheel-adjusted knob can capture scrolling. That matters little on a fixed desk, but it should respond to the wheel only while hovered or focused.
- **Single-pointer alternative.** Clicking a point on the dial's arc sets the value (colour-wheel precedent), or small plus and minus steppers do. A click on the knob body could also open the settings slider.
- **Semantics.** Build the knob as a native range input with its drawing on top (the input-knobs approach, or the W3C and TPGi hidden-native hybrid), named "Music volume" or "Sound volume". It then announces as a slider ("Music volume, slider, 60%") on every screen reader. A div with role=slider would break iOS and Android screen-reader adjustment and forced-colors mapping.
- **Keyboard direction.** Up and Right increase, per the APG and input-knobs. Mirroring a clockwise visual rotation is only cosmetic.
- **Net assessment.** A knob fits the in-world pixel-desk look but is the most expensive option to make conformant and legible. It works best as a skin over a native range, alongside plain settings sliders.

### Gaps
- There is no W3C, APG or ARIA guidance specific to rotary controls. ARIA has no dial role.
- I found no screen-reader test data for knob skins over native ranges, and no usability study comparing web knobs with sliders.
- Other knob libraries found in search (html5-knob, CSS snippet sites) were not verified and are not cited.
