# Desk papers: document size, readability, evidence visibility and screen use in desk/inspection games

Scope note. Researched 30 Sep 2026. "Repo" citations are this game's own source files (read directly). Computed numbers (visual angles, stage scales) are in the Inferences with their assumptions. Older sources are labelled with their year. Where a figure came only from a search-result summary because the page refused a direct fetch (403/402), it is marked "(search summary)".

## 1. How Papers, Please and similar games size and lay out documents, what share of the screen the evidence gets, and what they do on bigger screens

### Takeaway
Papers, Please gives about half of its frame to the inspection desk, and one document covers about a tenth to a sixth of the whole frame. It never shows more desk on a bigger screen: it scales the whole 570×320 frame by whole numbers and fills the rest with black. The one time Lucas Pope had to choose between desk space and readability (the 2022 phone port), he chose readability ("the documents should also be big") and dropped the desk. The games that show more at a smaller size (Cultist Simulator's table, Contraband Police's handbook samples, Not Tonight's ID photo) are the ones players complain about. Later detective games add zoom (Golden Idol, Strange Horticulture).

### Cited Findings
**Papers, Please (2013; devlog 2012–13, ports 2014–2022)**
- The native resolution is 570×320: "The actual resolution is laughably low (570x320) but these pixels need to be big." — [Pope, "Cramming 'Papers, Please' Onto Phones"](https://dukope.com/devlogs/papers-please/mobile/)
- The frame grew wider to make room for documents. Feb 2013: "I've decided to adjust the aspect ratio from 3:2 to 16:9 to give more room for the documents... I decided to just make it wider and keep the height the same (570x320)." Nov 2012 mockup: "you can see the tight squeeze for the documents window." — [Papers, Please devlog (mirror of the TIGSource thread)](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- Early size budget, Nov 2012: "Each document can be maximum 150x215 and 2 documents can be visible at any time. Teletex query results, the audio transcript, and the rule book will behave just like documents." — [devlog mirror](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- Dragging solved the space problem. Nov 2012: "I originally intended to have the documents just be clickable on the left; after which they show up in one of 2 fixed-width columns on the right... Instead there's now full drag-n-drop across the counter and desk. I think this solves the space problem nicely as you can always shuffle things around to see large documents." — [devlog mirror](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- Scaling, Feb 2013: "At the moment it resizes to the largest whole pixel scale from 480x320 which normally leaves a black border in full screen." — [devlog mirror](https://fguillen.github.io/PapersPleaseDevlogScrap/). The publisher's support page (search summary; the page returned 403) lists fixed resolutions of 570×320, 1140×640 and 1710×960. The game picks the largest that fits the window and fills the border with black, and from version 1.4.x a "stretch" command-line option fills the screen. — [3909 support: window too small](https://3909.zendesk.com/hc/en-us/articles/360052478154--DESKTOP-The-game-window-doesn-t-fit-onscreen-or-it-s-much-too-small), [3909 support: black border](https://3909.zendesk.com/hc/en-us/articles/360053255593--DESKTOP-There-s-a-black-border-around-the-screen)
- Layout shares (my measurement from the official Steam screenshots; each 1280×720 image holds the 1140×640 game at 2x inside a black border, so a half-size copy is 1:1 native):
  - The checkpoint strip takes the top ~100 of 320 rows (~32% of the frame).
  - Below it, the booth is ~180 of 570 columns and the desk ~390, so the desk is ~47% of the frame, the booth ~22% and the checkpoint ~32%.
  - Documents on the desk measure about 124×160 (passport), 148×200 (diplomatic authorization) and 237×158 (open rulebook) native px. That is ~11%, ~16% and ~21% of the frame's area each.
  - The passport photo is about 40 native px wide.
  - Document body text has an x-height of about 4 native px, capitals of about 6 px and a line pitch of about 8 px. These are approximate because the screenshots are JPEGs.
  — [Papers, Please Steam page, screenshots ss_258b… and ss_4b50…](https://store.steampowered.com/app/239030/)
- Inspect mode (Dec 2012): "Clicking the bottom-right button puts you in 'inspect' mode. Highlight any two pieces of information and if there's a discrepancy you'll get more options." Rulebook: "Add tabs to the guidebook" (Mar 2013), and a tester's note that "The corner to flip pages could be bigger" (Dec 2012). — [devlog mirror](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- Ports:
  - iPad (2014) kept the "three regions" layout and drag-and-drop. The regions were stacked vertically "with slight dynamic sizing ability", and the checkpoint became a horizontally scrollable window.
  - PS Vita overlapped the checkpoint with the booth and used fullscreen vertical scrolling.
  - The phone port settled on 208×405, "based on how the game's existing documents would fit legibly onto a modern non-Max iPhone". The booth and documents run at 3x and the checkpoint at 2x, through "fractional 2/3 pixel scaling". Its design goal: "No squinting, zooming, or precision required to read/manipulate documents."
  - Pope's diagnosis: "The documents are too small and the desk area too crowded. There's a fundamental conflict between readability and having enough space for arranging things." His conclusion: "the documents should also be big, and that uncorked the brew that defines this port: no more desk, no more drag-n-drop."
  — [Pope, mobile devlog](https://dukope.com/devlogs/papers-please/mobile/)
- On the art: "The low resolution was dictated by my limitations... I chose muted colors and stripped back a lot of the details to try to express the bleak mood and to reduce extraneous visual clutter." — [Road to the IGF: Lucas Pope (2013)](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)

**Other desk and inspection games**
- Hypnospace Outlaw (2019), developer TetroniMike: "the art style we chose for the game doesn't look great when scaled by a non-integer value, in our opinion (especially text)". The non-integer option is hidden in the in-game BIOS, and "Ctrl + and Ctrl -" resize the window. — [Steam thread](https://steamcommunity.com/app/844590/discussions/0/2519149567495289562/). A 480×270 native resolution, and a default scale that is too small on Retina Macs because the game ignores high-DPI, appear in search summaries of the community threads. — [itch.io thread](https://itch.io/t/418567/mac-default-scaling-is-incorrect-on-retina-macs)
- Cultist Simulator (2018), cards on a tilted table. Players wrote: "I am finding the text very hard to read, even with all the UI aspects maxed out"; "The table tilt is also adding to this effect"; "The text is just too small for me. I need a magnifier to manage it." One asked for "a basic top down view and enlarge the font". There was no developer reply. — [Steam thread](https://steamcommunity.com/app/718670/discussions/0/3016815718819769454/)
- Also Cultist Simulator: raising the UI scale "does not appear to effect the text of the cards on the table... they are still ultra tiny". Only 75%, 100% and 125% are officially offered. One player has to "pull a chair up to my 55" TV". — [Steam thread](https://steamcommunity.com/app/718670/discussions/0/1779387743937765298/)
- Strange Horticulture (2022): a demo update was titled "Watering Can, Colored Labels, And Zoom!" — [Steam news](https://store.steampowered.com/news/app/1574580/view/3135064380822554667). An accessibility report says you can zoom in on all objects, text and images at any time, and that a "simplified text" setting switches to a clear font (search summary). — [Family Gaming Database](https://www.familygamingdatabase.com/accessibility/Strange+Horticulture)
- The Case of the Golden Idol (2022):
  - "You can also use the mouse wheel to zoom in on a scene and pan around in close-up view, although I didn't find this particularly necessary – and panning was a little bit too finicky."
  - Zoom "could be very handy for those who are visually impaired or playing on something with a small screen like a Steam Deck".
  - Hotspots can be shown as sparkles, and each changes colour once clicked.
  — [Adventure Game Hotspot review](https://adventuregamehotspot.com/review/119/the-case-of-the-golden-idol)
- Contraband Police (2023, 3D):
  - A player cannot identify forged stationery because the handbook examples are too small to compare with the documents.
  - The community workaround is the game's compare click (handbook sample, then document, which gives "MATCH"/"MISMATCH").
  - Comparing by eye requires "squinting or leaning closer".
  — [Steam thread](https://steamcommunity.com/app/756800/discussions/0/3886101131594989469/)
- Not Tonight (2018): "It doesn't matter how zoomed-in the bottom corner of the screen is, it's incredibly bloody difficult to tell sometimes... especially when some of the differences are so subtle", listed as "an unfair penalty". — [Wccftech review](https://wccftech.com/review/not-tonight-review-bouncer-in-brexit-britain/). The developer (No More Robots): "they have to look *exactly* like their ID, with whatever hat + other accessories they're wearing." — [Steam thread](https://steamcommunity.com/app/733790/discussions/0/1734336452581338429/)

**This game (repo)**
- Form 1's photo and each video still draw the 40×48 portrait at 2 design px per portrait pixel (80×96 design px). — [repo: src/ui/Documents.tsx](../../src/ui/Documents.tsx)
- The film is `repeat(3, 84px)` with a 2px border, and `.paper-form, .paper-video { max-width: 680px }`. — [repo: src/ui/desk.css](../../src/ui/desk.css)
- The stage is 1240–1760 design px wide, 820 design height, max scale 2. It snaps to crisp steps (one art pixel = whole device pixels), needs at least 760 design px of height for a step up, and accepts a crisp step down that keeps ≥75% of the fitted size. — [repo: src/ui/Stage.tsx](../../src/ui/Stage.tsx)
- The desk's tallest state needs 564–650 design px depending on width. — [repo: src/ui/room.ts](../../src/ui/room.ts)

### Inferences
- **The evidence is the same size as Papers, Please's; each pixel is drawn smaller.** The portrait is 40×48 art pixels, the same pixel count as Papers, Please's ~40-px-wide passport photo. Our pixel type (x-height 5 glyph px, caps 7, line 10) is about 25% taller in glyph pixels than Papers, Please's document print (≈4/6/8).
- **Why things look smaller on the same screen.** The stage lays out 620–880 art px wide by 380–506 tall. That is 1.4× (1240×820) to 2.4× (1760×1012) Papers, Please's 570×320 pixel area, so each art pixel is drawn smaller.
  - On a 1920×1080 monitor, Papers, Please runs at 3x (a native pixel is 3 device px). This game runs at scale 1 there (an art pixel is 2 device px), so Papers, Please's pixels, text and photo are 1.5× larger. Its passport photo is ~33×40 mm against our still's 22×27 mm.
  - On 1440p it is 4x against 1.5, so 1.33× larger.
- **Where the extra room goes.** A bigger stage adds empty blotter, not bigger evidence. The 680-px paper cap is 55% of stage width at 1240, 47% at 1440 and 39% at 1760.
- **Benchmark.** Papers, Please's two documents on the desk cover ≈27% of the frame, and the desk ≈47%. Measuring the same shares for our papers in screenshots at 1440×789 and 1320×759 would give a direct comparison. I did not take that measurement.
- **Precedent from the games.** No game in this set solves small evidence by showing more desk. Papers, Please scales the whole frame. Its phone port grows the documents and removes the desk. Zoom appears as an add-on (Golden Idol, Strange Horticulture, Contraband Police). Not Tonight shows the limit of zoom: magnifying a low-information photo does not make a subtle difference readable.

### Gaps
- PCGamingWiki (403) and Game UI Database (script-rendered) could not be read, so there are no independent resolution or scaling tables for Beholder, Orwell, The Republia Times or Not Tonight. I found nothing reliable on how Beholder, Orwell or The Republia Times size their documents. One search summary mentioned a Beholder 4K small-text complaint, but no Beholder-specific page was verified.
- I could not confirm from a primary source whether Papers, Please shows documents smaller on the counter than on the desk. The devlog only says documents are dragged from counter to desk.
- I could not verify whether Papers, Please picks its integer scale in points or device pixels on Retina Macs, so its on-screen size on a MacBook is unknown.
- The Papers, Please layout shares come from my own measurement of JPEG screenshots (±~5 px).

## 2. Readability: legible text sizes for screen reading at laptop distance, and what they mean for 20-design-px pixel type at 0.75, 1 and 1.5 scale

### Takeaway
At scale 1 on a 13–14" MacBook, the Ministry type (x-height 10 design px, capitals 14) sits right at the reading science's critical print size (~0.19–0.23° at 50–60 cm). Its capitals just meet the ISO 16-arcminute minimum. At 0.75 (and at 0.67–0.8 on common Windows laptops at 125–150% display scaling), it falls below both. Older players need 1.35–1.8× larger print than young adults. At 1.25–1.67 (16" MacBook Pro, 1440p and 4K desktops) it is comfortable. The fit-to-window stage also cancels browser zoom, so a player has no way to make the papers larger.

### Cited Findings
- **Reading science.**
  - Legge & Bigelow (2011): "The fluent range extends over a factor of 10 in angular print size (x-height) from approximately 0.2° to 2°. Assuming a standard reading distance of 40 cm (16 inches), the corresponding physical x-heights are 1.4 mm (4 points) and 14 mm (40 points)." — [Legge & Bigelow 2011, J. Vision (abstract)](https://pubmed.ncbi.nlm.nih.gov/21828237/)
  - The same work (search summary of the article) gives a consensus critical print size (CPS) of 0.2° (12′) for normally sighted readers. Measured running-text x-heights are 0.20–0.28°, with means of 0.23° for newspapers and 0.24° for hardback books. That publishing sits above CPS "may indicate compensations for the range of visual acuities of average readers." — [Legge & Bigelow 2011, JOV](https://jov.arvojournals.org/article.aspx?articleid=2191906)
  - Age (MNREAD norms, n=645, ages 8–81): "Critical print size was constant from 8 to 23 years (0.08 logMAR), increased slowly until 68 years (0.21 logMAR), and then more rapidly until 81 years (0.34 logMAR)." Maximum reading speed is 200 ± 25 wpm at 16–40 years and falls to 175 wpm by 81. — [Calabrèse et al. 2016, IOVS](https://doi.org/10.1167/iovs.16-19580)
- **Display ergonomics standards.**
  - ISO 9241-3 (1992, now ISO 9241-303), as quoted by UXmatters (2009): "Character heights from 20 to 22 minutes of arc are preferred for most tasks. The minimum character height shall be 16 minutes of arc."
  - ISO gives a 400 mm minimum viewing distance. At 500 mm, the article works this out as ≥2.3 mm, and 2.9–3.2 mm preferred.
  — [UXmatters, "Text Treatment and the User Interface"](https://www.uxmatters.com/mt/archives/2009/01/text-treatment-and-the-user-interface.php). The FAA's human factors display standard uses the same "16′ minimum / 20–22′ preferred" figures (search summary). — [FAA HFDS ch. 5 update, 2007](https://hf.tc.faa.gov/publications/2007-human-factors-criteria-for-displays/full_text.pdf)
- **Xbox Accessibility Guideline 101** (page dated 2022, updated June 2026):
  - Minimum default body height (descender bottom to ascender top): PC/VR "18 px at 1080p, 36 px at 4K"; console "26 px at 1080p, 52 px at 4K"; mobile and streaming "18 px at 100 DPI… 36 px at 200 DPI… Scale linearly as DPI increases."
  - Text should scale to 200% "without the loss of content, functionality, or meaning."
  - "Platform-provided screen magnification tools aren't an appropriate mitigation for small text size."
  - Blocks of text: ≤80 characters per line, line spacing ≥1.5, letter spacing ≥0.12× the font size.
  — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- **Game Accessibility Guidelines:** "28px at 1080p" minimum for TV play, derived from Amazon's TV UI guidelines and 20/20 Snellen vision. Use it "as a minimum rather than a target". Offering a choice of font size is ideal. Small fonts also hurt readers with dyslexia, "due to the differences between letter shapes being less pronounced at smaller pixel sizes." — [GAG: easily readable default font size](https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/)
- **WCAG 1.4.4:** "Text can be resized without assistive technology up to 200 percent without loss of content or functionality". 200% was chosen because it "complements older screen magnifiers". Failure F94 covers "incorrect use of viewport units to resize text". — [WCAG 2.2 Understanding 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- **CSS reference pixel:** "the visual angle of one pixel on a device with a device pixel density of 96dpi and a distance from the reader of an arm's length. For a nominal arm's length of 28 inches, the visual angle is therefore about 0.0213 degrees." — [CSS Values 4](https://www.w3.org/TR/css-values-4/)
- **NN/g:** "Use a reasonably large default font size and allow users to change the font size. Tiny text dooms legibility — and remember that what counts as 'tiny' differs across people, depending on their visual acuity, which sadly declines with age." It also recommends high contrast and a plain rather than textured background. — [NN/g, Legibility, Readability, and Comprehension](https://www.nngroup.com/articles/legibility-readability-comprehension/)
- **Dot-matrix fonts (1983):** characters in 5×7, 7×9, 9×13 and 11×15 matrices were tested on TV screens. Task times "varied up to more than 20%", "the worst performance was obtained with the smallest character size", and 9×13 was rated significantly better. — [Pastoor, Schwarz & Beldie 1983, Human Factors](https://journals.sagepub.com/doi/10.1177/001872088302500302)
- **Viewing distance:** the American Optometric Association recommends 20–28 in (51–71 cm) for computer screens, and one study measured 56 cm for users with digital-vision symptoms. — [2020 Mag summary of Ramteke & Satgunam](https://www.2020mag.com/article/the-right-viewing-distance-for-digital-devices); [Ramteke & Satgunam 2024, Eye](https://doi.org/10.1038/s41433-023-02781-9)
- **This game's type** (repo):
  - "A glyph pixel is 100 font units and the em is 10 pixels, so at font-size 20px a glyph pixel is 2 design pixels"; sizes "in 10px steps". — [repo: src/ui/type.css](../../src/ui/type.css)
  - Caps are 7 rows and lowercase 5, with descenders in rows 8–9. — [repo: scripts/fonts/print.txt](../../scripts/fonts/print.txt)
  - The font files store x-height 500 and cap height 700 per 1000 units. At 20px that is x-height 10, caps 14, and 18 design px from descender to ascender. (My reading of `public/assets/fonts/ministry-*.ttf`.)
- **Comparison fonts** (x-height ÷ em, read from macOS system font files): Arial 0.519 (8.3 px x-height at 16px), Verdana 0.545 (8.7), SF 0.508 (8.1), Georgia 0.481, Times New Roman 0.447. (My measurement.)

### Inferences
**Assumptions.** Stage scales come from the repo's `fit()` run for each window. The window sizes assume normal browser chrome. CSS pixel sizes are:
- Apple default "looks like" modes: ≈0.199–0.200 mm.
- 24" 1080p: 0.277 mm.
- 27" 1440p, and 27" 4K at 150%: 0.234 mm.
- 15.6" 1080p laptop at 125%: 0.225 mm.
- 14" 1080p laptop at 150%: 0.242 mm.

Laptops are at 50/60 cm, desktops at 60/70 cm.

| Setup (browser window) | Stage scale (unsnapped fit) | Layout (design px) | x-height, 10 dp | Caps, 14 dp | Body, 18 dp |
|---|---|---|---|---|---|
| 13" MacBook Air, 1440×789 @2x | **1.0** (0.96) | 1440×789 | 1.99 mm → 0.23° / 0.19° | 19.2′ / 16.0′ | 24.6′ / 20.5′ |
| 13" MacBook Air, 1320×759 @2x | **0.75** (0.93) | 1760×1012 | 1.49 mm → 0.17° / 0.14° | 14.4′ / 12.0′ | 18.5′ / 15.4′ |
| 13" Air "More space" 1680×940 @2x | **1.0** (1.15) | 1680×940 | 1.71 mm → 0.20° / 0.16° | 16.5′ / 13.7′ | 21.2′ / 17.6′ |
| 14" MacBook Pro, 1512×870 @2x | **1.0** (1.06) | 1512×870 | 2.00 mm → 0.23° / 0.19° | 19.3′ / 16.0′ | 24.8′ / 20.6′ |
| 16" MacBook Pro, 1728×1000 @2x | **1.25** (1.22) | 1382×800 | 2.50 mm → 0.29° / 0.24° | 24.1′ / 20.1′ | 30.9′ / 25.8′ |
| 14" 1080p laptop @150%, 1280×595 | **0.667** (0.73) | 1760×892 | 1.61 mm → 0.19° / 0.15° | 15.5′ / 12.9′ | 20.0′ / 16.6′ |
| 15.6" 1080p laptop @125%, 1536×740 | **0.8** (0.90) | 1760×925 | 1.80 mm → 0.21° / 0.17° | 17.3′ / 14.4′ | 22.3′ / 18.6′ |
| 24" 1080p @100%, 1920×955 | **1.0** (1.17) | 1760×955 | 2.77 mm → 0.26° / 0.23° | 22.2′ / 19.0′ | 28.5′ / 24.5′ |
| 27" 1440p @100%, 2560×1300 | **1.5** (1.59) | 1707×867 | 3.50 mm → 0.33° / 0.29° | 28.1′ / 24.1′ | 36.1′ / 31.0′ |
| 27" 4K @150%, 2560×1300 | **1.667** (1.59) | 1536×780 | 3.89 mm → 0.37° / 0.32° | 31.2′ / 26.8′ | 40.1′ / 34.4′ |

**Scale 1 on laptops.**
- The x-height is 0.19–0.23°: at the ~0.2° critical print size, and at or just under newspaper print (0.23°).
- Capitals are 16–19′: they meet the ISO minimum (16′) but not the preferred 20–22′.
- Body height is 18 CSS px, which is XAG's PC figure exactly, but in CSS px on a Retina laptop rather than device px on a 24" 1080p monitor. Physically that is 3.6 mm against 5.0 mm. Readable for young players with normal vision, with no margin.

**Scale 0.75, 0.667 and 0.8** (a slightly short MacBook window, and the most common Windows laptops).
- The x-height is 0.14–0.21° and capitals are 12–17′. At 60 cm, all three are below the critical print size and below the ISO minimum.
- MNREAD's age data means players around 68 need ~1.35× (10^0.13), and players around 81 ~1.8× (10^0.26), the young adult's critical print size.
- Reading the three typed lines, the transcript and a rule page at 0.75 will be slower for many players and unreadable for some.

**Scales 1.25–1.67** (16" MacBook Pro, 1440p and 4K desktops) are comfortable: x-height 0.24–0.37°, capitals 20–31′.

**The 1-pixel cliff.**
- The 1320×759 window is 1 px short of the 760-design-px floor for a step up. The stage therefore takes the crisp 0.75 step (CRISP_KEEP accepts losing up to 25%) instead of the 0.93 fit, and all text becomes 19% smaller than the unsnapped fit, and 25% smaller than at scale 1.
- A floor of about 740, or letting the hall strip give way first, would keep scale 1 on MacBook windows with a Dock or bookmarks bar. This is my inference, and it needs checking against DESK_NEEDS.

**Browser zoom does nothing.**
- `Stage.tsx` re-fits whenever the device pixel ratio changes. On a 2x MacBook, Cmd+ to 200% makes the ratio 4 and the viewport 720 CSS px wide, and the fit becomes 0.5. That is the same 2 device px per design px as before.
- Players who can't read the papers therefore have no remedy, which is the situation WCAG 1.4.4, F94 and XAG 101's 200% scaling guidance describe.
- An in-game "paper size" or "desk zoom" setting would be the pixel-art-safe equivalent.

**Pixel type versus web text.**
- In x-height, 20-px Ministry type at scale 1 equals roughly 19-px Arial. At 0.75 it equals ~14.5-px Arial, below the web's 16-px default (8.3 px x-height).
- A 5-row x-height also carries less letter detail than a vector font of the same height. The 1983 dot-matrix study found the smallest matrix, 5×7 (our capitals are 7 rows), slowest.
- The next step on the grid is 40px (2 art px per glyph pixel), which doubles the text size. So the practical levers are the stage or paper scale, not the font size.

### Gaps
- ISO 9241-3's wording is quoted from a 2009 secondary source. I could not read ISO 9241-303:2011 (403), including any rules on character matrix (e.g., 7×9 for continuous reading).
- The MNREAD values are in logMAR, and I did not convert them to degrees of x-height. The ratios above do not depend on that conversion.
- I found no study of pixel-font legibility against visual angle for x-heights of 4–6 glyph pixels.
- The table uses assumed window sizes and distances, not measurements of real players. There is no data on typical browser window sizes of this game's players.

## 3. Evidence visibility: how big an image detail must be for players to find it, and how inspection games show small clues

### Takeaway
Two things make the lamp clue hard to see, and neither is pointing:
- **Players find a difference only when their eyes land on it.** Detection in comparison search is "contingent upon direct fixation".
- **Colour needs size to be seen.** The difference needed to see a hue grows sharply below ~1°, and most of all on the blue–yellow axis where violet lives. Violet targets lose about 4× relative sensitivity as they shrink from 30′ to 2.5′.

The lamp's "slit" and "small" states are 2–11 arcminutes. That is below the smallest size colour models were fitted to (20′) and inside the range where the blue cones are weakest. So players will see them, if at all, as a bright speck, not as "violet".

Pointing is fine: the Inspect targets are whole 84-px frames.

Games handle small clues with:
- big printouts (Papers, Please),
- zoom (Golden Idol, Strange Horticulture, Contraband Police),
- compare tools (Contraband Police),
- hotspot highlights (Golden Idol).

Zoom cannot add information the art does not have (Not Tonight).

### Cited Findings
- **Comparison search needs direct fixation.** "The saliency and presence of differences did not guide attention, and detection was contingent upon direct fixation of the targets." Search "was characterized by brief fixations and a high proportion of comparative saccades." — [Galpin & Underwood 2005, Perception & Psychophysics](https://doi.org/10.3758/bf03193637)
- **Detection is confined to a small area around fixation.** "High probability detection of targets occurs only within a restricted area surrounding the fixation point"; "focal attention operates within a conspicuity area having an effective radius of about twice the average nearest neighbor distance" (monkey visual search, 1998). — [Motter & Belky 1998, Vision Research](https://doi.org/10.1016/s0042-6989(97)00252-6)
- **Harder targets need more fixations.** Search is best modelled in fixations: "the functional field of view determines how many fixations are needed", with "a direct connection between target discrimination difficulty, fixations, and reaction time". — [Hulleman & Olivers 2017, Behavioral and Brain Sciences](https://doi.org/10.1017/s0140525x15002794)
- **Colour difference against size** (Stone, Szafir & Setlur 2014):
  - They tested 11 sizes from 6° down to 1/3°.
  - The difference 50% of viewers notice, ND(50), at 0.333° vs 2°: L* 7.32 vs 5.01, a* 9.90 vs 5.92, b* 14.84 vs 6.83.
  - Their model is ND(50) = C + K/s, with K = 0.751 (L*), 1.541 (a*), 2.871 (b*).
  - "small shapes need to be much more colorful to be usefully distinct"; "small stimuli appear less colorful."
  — [Stone, Szafir & Setlur 2014, CIC](https://graphics.cs.wisc.edu/Papers/2014/SAS14/2014CIC_48_Stone_v3.pdf)
- **Replication (2026):** thresholds at 0.25° were L* 8.46, a* 13.89, b* 20.56, against 4.61, 5.62 and 8.00 at 2° (search summary). — [arXiv 2608.24789](https://arxiv.org/html/2608.24789)
- **Small-field tritanopia** (review, 1982, of 1950s work):
  - Brindley (1954) shrank a violet or green target from 30′ to 2.5′. The log ratio of sensitivity to green over violet rose by 0.64 log units, "i.e. the Weber fraction for the short-wave mechanism increased relative to that of the middle-wave mechanism by 4.4 times".
  - Ricco's area (the size below which only total light counts) was "about 13′ for short-wavelength flashes… whereas the critical area for the long-wavelength mechanisms was less than 4′".
  - The short-wave system's resolution "is never better than 10 cycles.deg⁻¹".
  — [Mollon 1982, "A taxonomy of tritanopias"](https://vision.psychol.cam.ac.uk/jdmollon/papers/Mollon1982Tritanopias.pdf)
- **Pointing:**
  - WCAG 2.5.8: "The size of the target for pointer inputs is at least 24 by 24 CSS pixels", with 2.5.5 (Enhanced, 44×44) advised "for important links/controls". — [WCAG 2.2 Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  - Fitts's law: "The movement time to a target depends on the size of the target and the distance to the target… make targets big… error rates go down as target sizes increases." — [NN/g, Fitts's Law](https://www.nngroup.com/articles/fitts-law/)
- **This game's clue** (repo):
  - The lamp art is in portrait pixels: bloom and glow 8×6 with a 2×2 core and spill; small 4×3 with a 2×1 core; slit "the small lamp's middle row alone", 4×1.
  - Lamp strength steps down across the week ("loudest on days 1 and 2, dimmer as the week goes, a lit slit on Humanity Day").
  — [repo: src/gen/portraitParts.ts](../../src/gen/portraitParts.ts), [repo: src/gen/portrait.ts](../../src/gen/portrait.ts)
  - Stills and the photo are drawn at 2 design px per portrait pixel. Rule 2's figure crops the portrait to 22×22 at the same scale. Inspect targets are whole elements: the photo, each frame, the name, the transcript and each rule. — [repo: src/ui/Documents.tsx](../../src/ui/Documents.tsx)
- **How games present small clues:**
  - Papers, Please's phone port aims for "No squinting, zooming, or precision required". — [Pope](https://dukope.com/devlogs/papers-please/mobile/)
  - Golden Idol offers mouse-wheel zoom and optional sparkle hotspots. — [review](https://adventuregamehotspot.com/review/119/the-case-of-the-golden-idol)
  - Contraband Police has a MATCH/MISMATCH compare click and document zoom, yet its handbook samples remain hard to compare. — [Steam](https://steamcommunity.com/app/756800/discussions/0/3886101131594989469/)
  - Not Tonight zooms the ID photo in a corner and it is still "incredibly bloody difficult to tell". — [Wccftech](https://wccftech.com/review/not-tonight-review-bouncer-in-brexit-britain/)

### Inferences
**Lamp sizes on screen** (one design px ≈ 1.37′ on a MacBook at scale 1 and 50 cm):

| Lamp | Design px | Scale 1 | Scale 0.75 | 24" 1080p, 65 cm | 27" 1440p, 70 cm, scale 1.5 |
|---|---|---|---|---|---|
| Bloom / glow | 16×12 | 22′×16′ | 16′×12′ | | |
| Small (whole) | 8×6 | 11′×8′ | 8′×6′ | | |
| Small (core) | 4×2 | 5.5′×2.7′ | 4′×2′ | | |
| Slit | 8×2 | 11′×2.7′ | 8′×2′ | ≈12′×3′ | ≈14′×3.4′ |

A still is 80×96 design px, 1.8°×2.2° at scale 1 (1.4°×1.6° at 0.75). The face inside it is ~1°.

**What those sizes mean.**
- The slit and the small lamp are:
  - below Stone et al.'s smallest tested size (20′),
  - at or below the blue cones' 13′ Ricco's area,
  - inside Brindley's 2.5–30′ range, where violet loses ~4× in relative sensitivity.
- Extrapolating Stone's model (outside its tested range) to a 0.18° slit gives a noticeable difference of ≈21 units on b* against ≈9 on L*.
- So the lamp is found by its brightness against the dark, eyes-shut face, not by its hue. To be seen reliably as violet, the lit area should be ≥~0.33° (≈15 design px at scale 1) or carry strong lightness contrast.

**Search cost.**
- There are three stills, each with a ~1-degree face.
- Because detection needs direct fixation, the player must look at the brow in each still, and also at Rule 2's figure and the Form 1 photo to compare: at least 4–5 deliberate fixations per applicant.
- A lamp in only one frame ("lit in frame(s) …", PortraitGallery) is missed whenever the player skims.
- The day 1–2 bloom (22′×16′ with spill) is probably fine. The slit on day 7 at scale 0.75 is probably below what many players can find without being told exactly where to look.

**Design invariant at risk.** "Every invalid applicant has one clue the player can see and check on screen" is at risk for the slit and small states at scale ≤0.8.

**Options, in order of how directly they fix the problem:**
1. Draw the stills and photo bigger. At 2× the art scale, a portrait pixel is 4 design px (168-px stills): the slit becomes 16×4 design px (22′×5.5′ at scale 1), and the small lamp 16×12 (22′×16′).
2. Make the lamp's core bright (lightness contrast), with violet as a secondary cue.
3. Offer an on-demand enlarged view of a still when it is Inspected or hovered. This is the Golden Idol or Contraband Police approach, but per XAG, magnification is not a substitute for a readable default.
4. Keep the "tell" at least a 2×2 portrait-pixel lit core on every day.

**Pointing.** The Inspect hit targets (84-px frames, 80×96 photo) are 3.5× the WCAG 24-px minimum even at 0.75 (63 CSS px). The Fitts index of difficulty from the stamp column (~700 px away) is ≈3.2 bits. If a design ever asked players to click the lamp itself (8×2 px), it would be ≈6.5 bits and far below every target-size guideline. Keep Inspect at the frame level.

### Gaps
- I found no study measuring how reliably people find a tiny coloured feature in pixel-art faces. The thresholds above are extrapolated from basic vision science (colour discrimination of uniform patches, 1954–2014 data) and from comparison-search tasks.
- I do not know the lamp's actual colours against the eyes-shut face in `VIDEO_BG` (the lightness contrast). That decides whether the brightness path works, and should be measured from the palette.
- There is no data on how often players look at each still. A small playtest with eye tracking, or even a "where did you look" survey, would close this.

## 4. Comparison tasks: side by side versus apart, and how far the eye should travel between photo, stills, typed lines and rulebook

### Takeaway
Put the things that must be compared pixel for pixel next to each other, at the same scale and aligned in one row. Spatial contiguity is one of the most robust effects in multimedia learning (d ≈ 0.7–0.85 in Ginns 2006, g = 0.63 in the 2018 update). As distance grows, people switch gaze less and lean on memory, which is where misses come from. People compare about three items per glance, alternating left and right on the shortest path. Keep unrelated material out of the gap, because placing unrelated things close also costs.

### Cited Findings
- **Meta-analyses.**
  - Ginns (2006): spatial contiguity, d = 0.72 over 37 effect sizes (search summary). A 2019 open-access paper quotes Ginns's "weighted mean effect size: d = 0.85; 95% confidence interval: 0.68–1.02". The two figures conflict; the second may pool spatial and temporal contiguity. — [Frontiers in Education 2019](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2019.00086/full)
  - Schroeder & Cenkci (2018): g = 0.63 over 58 independent effect sizes (search summary; the abstract is withheld by the publisher). — [Educational Psychology Review](https://link.springer.com/article/10.1007/s10648-018-9435-9)
- **Placing unrelated things close also costs.** The principle: learning "is fostered when related representations are spatially integrated by the designer and/or close to each other". But "Spatial contiguity between unrelated representations induces an incidental cognitive load… based on the process of micro-switching between unrelated representations which takes place with increasing proximity." — [Frontiers in Education 2019](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2019.00086/full)
- **Separation trades gaze shifts for memory** (Hardiess, Gillner & Mallot 2008). Two cupboards of objects were compared at 30°–120° separation. "In the large separation conditions, the number of gaze shifts between the two cupboards was reduced, while fixation duration increased", so "the visual system uses increased VSTM involvement to avoid gaze movements". The same trade-off was shown earlier with pure eye movements at smaller separations (Inamdar & Pomplun 2003). — [Hardiess et al. 2008, J. Vision](https://doi.org/10.1167/8.1.7)
- **The same on a screen** (Bauhoff et al. 2012). Participants compared two on-screen pendulum-clock pictures for 0, 1 or 2 differences. "We observed fewer gaze shifts with increasing distance between the pictures, suggesting higher working memory use"; distance, domain knowledge and visual working memory span set the memory load. — [Bauhoff et al. 2012, Applied Cognitive Psychology](https://doi.org/10.1002/acp.2887)
- **Scanning beats memorising.** When free to look, observers "adopt a strategy that cuts down on memory usage in favor of restricted encoding and active scanning". After a difference is detected, "more comparative saccades were elicited, and the search focus was narrowed". — [Galpin & Underwood 2005](https://doi.org/10.3758/bf03193637)
- **About three items per glance.** In a side-by-side comparison, "when the number of items was more than three, an average of 2.87 items would be processed in each view sequence", with an "alternating left-right reference strategy that made the shortest scan path". — [Li, Zhuang & Ma 2023, Perception](https://doi.org/10.1177/03010066231194488)
- **Three ways to show a comparison.** Juxtaposition (side by side), superposition (overlay) and explicit encoding of the relationship. — [Gleicher et al. 2011, Information Visualization](https://graphics.cs.wisc.edu/Papers/2011/GAWJHR11/paper.pdf)
- **In the games.** Papers, Please's inspect mode makes the player point at the two conflicting items and then encodes the discrepancy. — [devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/). Contraband Police's compare click returns MATCH/MISMATCH. — [Steam](https://steamcommunity.com/app/756800/discussions/0/3886101131594989469/)

### Inferences
**How far apart things are on screen.** At scale 1 on a laptop at 50 cm, 1° ≈ 44 design px (35–58 across the setups in section 2). Using the column widths given in the brief:
- The booth portrait (left column) and a rule page (third column) are likely ~700–1000 design px apart, about 16–23°.
- Photo and stills within the blotter are probably ≤300 px apart, ≤7°.

Neither needs head movement. But the booth-to-rulebook distance is the kind that makes players compare from memory (fewer, longer looks), which is where a 2-arcminute difference gets lost. Measure the real centre-to-centre distances in a screenshot.

**Face comparisons.** The two face comparisons that matter are photo↔stills (identity) and stills↔Rule 2's figure (the lamp). Each should be:
- in one horizontal row,
- at the same pixel scale (already true: all at 2 design px per portrait pixel),
- with the same crop where possible (Fig. 2 crops to 22×22; the stills show the whole 40×48),
- as close as the layout allows (target a few degrees, ~100–200 px),
- with no unrelated typed lines between them.

Showing Fig. 2's lamp specimen at the same crop as the stills would let players compare like with like.

**Typed lines against rules.** Name, year and wallet against rules is a text comparison of 2–3 items per glance. It tolerates more distance than the face comparison, so it is the right one to leave across columns.

**Explicit encoding.** Papers, Please-style highlighting should appear only after the player commits (Inspect names two items), never before. The design invariant says only the evidence reveals validity.

### Gaps
- The laboratory separations (30–120°) and the multimedia-learning materials differ from a game desk. I found no study of comparison accuracy against separation in the 2–25° range for pixel-art faces.
- I did not measure the current desk's actual distances.

## 5. Using a bigger screen: scale everything up, show more room, or grow the evidence

### Takeaway
Pixel-art practice is to scale the whole frame by whole numbers and letterbox (Papers, Please, Godot's recommendation, Hypnospace Outlaw). Hypnospace Outlaw's developers hid their fractional option because text suffers. "Show more" (Godot's *expand*) is framed as a way to fit wider screens without black bars, not as a way to shrink documents. The one document-game redesign I found (Papers, Please's phone port) went the other way: bigger documents, with different integer scales for different regions. Games whose text stays small as screens grow draw steady complaints.

For this game, the option that best fits the evidence is to grow the evidence while the frame stays. Keep the hall, booth, rulebook and stamps at the crisp stage scale, and draw the papers (or at least the photo and stills) at a larger whole multiple of the art pixel whenever the blotter has room. That fills the empty blotter and fixes the lamp's size without soft pixels. An in-game paper-size setting would cover players who need more.

### Cited Findings
- **Godot's multiple-resolutions guide:**
  - "Keep" aspect adds black bars. "Keep Width" pillarboxes wider screens but expands on taller ones, which is described as ideal for GUI-heavy games.
  - "Expand" grows the viewport in whichever direction the screen is wider, showing more of the game instead of black bars (paraphrased).
  - With the integer scale mode, "each pixel in the viewport corresponds to 2×2 pixels in the displayed area". The guide warns that fractional factors such as 2.5× render pixels unevenly (paraphrased).
  - Pixel-art recommendation: base size, Viewport stretch, Keep or Expand aspect, Integer scale mode (essential).
  — [Godot docs](https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html)
- **Papers, Please** scales the whole frame by the largest whole number and fills the border with black, with an optional stretch mode from version 1.4.x. — [devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/); [3909 support (search summary)](https://3909.zendesk.com/hc/en-us/articles/360052478154--DESKTOP-The-game-window-doesn-t-fit-onscreen-or-it-s-much-too-small). The phone port uses mixed per-region scales: "the main booth and document regions can run at 3x while the checkpoint is a more manageable 2x", with "fractional 2/3 pixel scaling on the 2x stuff, which multiplies out to integer coordinates in the final 3x buffer". — [Pope](https://dukope.com/devlogs/papers-please/mobile/)
- **Hypnospace Outlaw's developers** consider non-integer scaling to look bad "(especially text)". They hid it and offer integer window steps with Ctrl +/−. — [Steam](https://steamcommunity.com/app/844590/discussions/0/2519149567495289562/)
- **Players on UI that doesn't grow:**
  - Unity forum, Sep 2024: "the text is unreadable because its always small", unaffected by resolution or Windows text scaling. The replies blame UI canvases not set to scale with resolution. — [Unity Discussions](https://discussions.unity.com/t/text-size-in-almost-every-unity-game/1527561)
  - Cultist Simulator's card text is "still ultra tiny" at the maximum UI scale. — [Steam](https://steamcommunity.com/app/718670/discussions/0/1779387743937765298/)
- **Guidelines:** XAG 101 asks for text scaling to 200% and says platform magnifiers are not a mitigation. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101). GAG: "Allowing a choice of font size" is the ideal, with a large default "a good first step". — [GAG](https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/)
- **This game's stage** (repo):
  - "Wider windows get a wider hall and desk; very wide ones get dark bars."
  - The scale snaps "to a step where one art pixel is a whole number of device pixels whenever one fits (at 1.25× or 1.5× as well as at 1× and 2×), and the layout takes the room that frees".
  - "Only a window too small for any crisp step gets the plain fractional fit, and softer pixels."
  — [repo: src/ui/Stage.tsx](../../src/ui/Stage.tsx)

### Inferences
**What the current approach is.** It is Godot's "expand": the same pixel size, more room, up to 1760 wide, then bars. For a document game this is the least supported choice. It is why 1080p monitors run at scale 1 (Papers, Please: 3x), and why 1320×759 and common Windows laptops run at 0.67–0.8.

**The four options compared:**
- **(a) Scale everything up, Papers, Please style.**
  - Needs a stage that fits in fewer design pixels. Papers, Please's 320 native rows equal 640 design px in our units. But a typical 1080p browser window is ~950–960 CSS px tall, and at scale 1.5 that holds at most ~635 design px. So running such a window at 1.5 needs a layout of ≤~630 design px, or fullscreen.
  - Cost: a large relayout of four columns and the hall into ~20% less height, plus bars at odd sizes.
  - Gain: every text, photo and still grows 1.5× on 1080p.
- **(b) More room (current).** Crisp everywhere, but papers stay the same size or shrink while the empty blotter grows (the 680 cap goes from 55% to 39% of stage width), and text drops below readability thresholds at scale <1.
- **(c) Grow the evidence, frame fixed** (Papers, Please phone-port style: mixed integer scales).
  - Keep the stage scale for the frame, and draw the blotter's papers at a paper scale of 1.5× or 2× the art pixel when the blotter's width and height allow.
  - It stays crisp only when (stage scale × DPR × 2 × paper scale) is a whole number:
    - DPR 2 at scale 1: art px = 2 device px, so ×1.5 gives 3 (crisp) and ×2 gives 4.
    - DPR 2 at scale 0.75: art px = 3, so ×1.5 gives 4.5 (not crisp) and ×2 gives 6.
    - DPR 1 at scale 1: art px = 2, so ×1.5 gives 3.
  - So ×2 is always crisp, and ×1.5 only at some scales.
  - At ×2 a still is 168 design px wide. Three stills plus gaps are ~520 px, within the current 680 cap, but the video printout doubles in height, so DESK_NEEDS would need re-measuring.
  - A cheaper version: grow only the photo and stills, or make the paper scale ×2 the default whenever the stage scale is <1.
- **(d) Zoom or magnifier on demand** (Golden Idol, Strange Horticulture, Contraband Police). Good as an accessibility layer (hover or Inspect enlarges a still 2–3×). But it adds an action, players must know to use it, it does not fix default readability (XAG), and it does not rescue under-drawn clues (Not Tonight).
- **(e) Accept soft pixels when the crisp step loses a lot.** Today the stage gives up to 25% (0.93 → 0.75) to stay crisp.
  - At DPR 2 each art pixel covers 3–4 device px, so fractional nearest-neighbour rounding changes pixel widths by at most one device px (a 25–33% wobble per art pixel).
  - That is worse at DPR 1, where developers such as Hypnospace's object "especially" for text.
  - A lower CRISP_KEEP (e.g., 0.9) on DPR ≥2 screens only is an option. The visual cost should be judged in a screenshot.

**Suggested order** (for the owner to decide):
1. Keep scale ≥1 on MacBook-size windows by relaxing the 760 floor or letting the hall give way.
2. Grow the photo and stills (and ideally all papers) with a ×2 paper scale when there is room or when the stage scale is <1.
3. Add a "papers: normal / large" setting, since browser zoom is cancelled.
4. Consider a hover or Inspect magnifier for stills as the accessibility layer.

All of these change the desk's look and possibly the difficulty curve of the lamp (days 5–7), so they are gameplay or art-direction decisions to ask about. Per AGENTS.md, I have changed nothing.

### Gaps
- I could not read PCGamingWiki's per-game scaling data (403), so which other document games offer UI or text scale options, and how they are received, is not verified beyond the cited threads.
- I found no study comparing player performance under "scale up" and "show more" layouts. The recommendation rests on developer practice, one developer's redesign, player complaints and the perceptual numbers above.
- I did not test the crispness arithmetic for a ×1.5 or ×2 paper scale in the running game. It follows from the repo's own rule (an art pixel is a whole number of device pixels).
