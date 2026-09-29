# Visual identity and fonts: robot tells, crafted desk games, and CC0 pixel type

Research date: 30 September 2026. Purpose: guide a full art pass on every screen of "Proof of Humanity: Papers, Please" (React DOM, 1240×820 minimum stage scaled to the window, pixel-art hall and 40×48 portraits at 2×, everything else in system fonts). Repo facts below were read, not changed; repo links are relative to this notes file.

## 1. Which visual and typographic choices read in 2025 to 2026 as AI-generated or template UI?

### Takeaway
The most current and most specific source is Anthropic's own frontend-design skill. It lists what it calls "the commonest tells of a generated page", and the list reads like a description of this game's current UI: tracked-out all-caps labels, middle-dot meta strings, a monospace face for small labels, a cream background, identical rounded cards with the same soft grey shadow, and a near-black strip with one bright accent. Designer studies from 2026 add Inter, Space Grotesk, Instrument Serif and Geist, purple gradients, emoji icons, coloured card borders and badges. Separately, system fonts such as Arial, Courier New and Georgia read as defaults nobody chose, because they are on every computer. So the owner's sense that the fonts are "very characteristic of Claude" has a documented basis.

### Cited Findings

#### Anthropic's own list of generated-design tells (primary, current)
- The current skill says: "Avoid these default typographic treatments; they are the commonest tells of a generated page: - Accenting just a single word or phrase in a headline, like putting one word in italic/bold or a different color. - Using all caps for labels. - Adding unnecessary typographic labels above content." — [Anthropic frontend-design SKILL.md (anthropics/skills, main, read 30 Sep 2026)](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- Same file: "For calibration, AI-generated design right now clusters around some traits: 1. a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta or warm-clay accent (often near #D97757 — Anthropic's own Claude-interaction accent, so on a user's brief it reads as a tell); 2. a near-black background with a single bright acid-green or vermilion accent; 3. a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns; 4. the SaaS-card kit: content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow (rgba(0,0,0,.1)) under each, and gradient washes as decoration; 5. template chrome that appears whatever the subject: a tracked-out ALL-CAPS eyebrow label above every heading; meta strings joined with middle dots ('A · B · C'); labels built as 'WORD — fragment' with a spaced em dash; tinted near-black (#0B0B0B, #111) standing in for black; a monospace face for small data labels; a '→' appended to link and button text." — [SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- "All traits are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject." — [SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- "Visual structure is information. Structural devices like outlines, borders, numbering, eyebrows, dividers, labels, etc., encode useful information about the content rather than decorate it." — [SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- On typefaces: "use one family or two, and if two, make them clearly distinct"; "Choose your typefaces deliberately, not the default families you would reach for on any other project". — [SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- On motion: "fade-and-slide-up entrances on each section and hover transitions on every card are the generic default and read as AI-generated. Motion that answers a person's action (opening, expanding, confirming) is welcome when it shows what changed." — [SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- On restraint: "Spend your boldness in one place. Let one element be the memorable thing, keep everything around it quiet and disciplined" and "Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory." — [SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
- Anthropic's earlier blog post (12 Nov 2025) named the cause "distributional convergence": "During sampling, models predict tokens based on statistical patterns in training data. Safe design choices–those that work universally and offend no one–dominate web training data." It listed overused fonts as "Inter, Roboto, Open Sans, Lato, default system fonts", named "purple gradients on white backgrounds", and noted that models converge again even when told to avoid defaults ("Space Grotesk, for example"). — [Claude blog: Improving frontend design through Skills](https://claude.com/blog/improving-frontend-design-through-skills)
- That 2025 post recommended high-contrast pairings ("Display + monospace, serif + geometric sans") and fonts such as JetBrains Mono, Fira Code, Playfair Display and Bricolage Grotesque. — [Claude blog](https://claude.com/blog/improving-frontend-design-through-skills). By 2026, the skill lists "a monospace face for small data labels" as a tell. — [SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md). The two sources disagree; the newer one is the current guidance.
- An unofficial, reverse-engineered design file for Anthropic's claude.com site describes a "Tinted cream canvas (#faf9f5)", a "Copernicus" display serif (Tiempos Headline as substitute), "StyreneB" body sans (Inter as substitute), "JetBrains Mono" for code, a coral/terracotta accent #cc785c, a 9999px "pill" radius, and elevation "Color-block first, shadow rare". — [VoltAgent awesome-design-md: claude/DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/claude/DESIGN.md). Caveat: third-party description of the brand site, not of generated output.

#### Designer and developer studies of "vibe-coded" UI
- Adrian Krebs (20 Apr 2026) scored 1,590 Show HN landing pages with Playwright and "deterministic CSS or DOM" checks ("I intentionally do not take screenshots and let the LLM judge them"; manual QA put false positives at "maybe 5-10%"). Results: High (4+ patterns) 22% (347 sites), Medium (2 to 3) 32% (508), Low (0 to 1) 46% (735). — [Krebs: Scoring Show HN submissions for AI design patterns](https://www.adriankrebs.ch/blog/design-slop/)
- Krebs's 16 patterns, gathered from designers. Fonts: "Inter used for everything, but especially the centered hero headlines"; "LLM tend to use certain font combos like Space Grotesk, Instrument Serif and Geist"; "Serif italic for one accent word in an otherwise-Inter hero". Colours: "VibeCode Purple"; "Perma dark mode with medium-grey body text and all-caps section labels"; "Barely passing body-text contrast in dark themes"; "Gradient everything"; "Large colored glows and colored box-shadows". Layout: "Centered hero set in a generic sans"; "Badge right above the hero H1"; "Colored borders on cards, on the top or left edge"; "Identical feature cards, each with an icon on top"; "Numbered '1, 2, 3' step sequences"; "Stat banner rows"; "Sidebar or nav with emoji icons"; "All-caps headings and section labels". CSS: "shadcn/ui"; "Glassmorphism". — [Krebs](https://www.adriankrebs.ch/blog/design-slop/)
- A designer told Krebs that "colored left borders are almost as reliable a sign of AI-generated design as em-dashes for text". Krebs's verdict: "Is this bad? Not really, just uninspired... before the AI era, everything looked like Bootstrap." — [Krebs](https://www.adriankrebs.ch/blog/design-slop/)
- Developers Digest summarises the same 16 patterns (page updated 28 Sep 2026). — [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)
- The Fountain Institute (Jeff Humble) lists 7 signs: neon palettes; dark mode with decorative glows; "Emojis used as icons, bullets, and navigation items"; "Purple-to-indigo gradients have become the Times New Roman of AI-generated design"; "Everything goes in a card. Then those cards go in a card."; multicoloured side tabs; "Status dots that don't mean anything". — [Fountain Institute: 7 Signs a UI Has Been Vibe Coded](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui) (dated 24 April; the year was not captured)
- 925 Studios (14 Jun 2026): "The Inter font, used everywhere, is not wrong, it is just the safest possible answer"; "The blue-to-purple gradient is the single loudest AI tell in 2026"; "a row of three feature cards, rounded corners, soft shadow, thin-line icon at the top". — [925 Studios](https://www.925studios.co/blog/ai-slop-design-tells)
- Tools now automate the check. For example, slop-detect ("Score any landing page against the 27-pattern AI-design-slop fingerprint") is described as reproducing Krebs's method. — [slop-detect on GitHub](https://github.com/ravidsrk/slop-detect)

#### System fonts as defaults
- Butterick: "All system fonts are overexposed. Because these fonts are included with billions of computers, they're used all the time." He calls Arial "merely a bland, zero-calorie Helvetica substitute" and "the sans serif of last resort". Courier and Courier New are on his "questionable" C list, and Georgia is listed among the fonts optimised for the screen. — [Butterick's Practical Typography: System fonts](https://practicaltypography.com/system-fonts.html)
- Availability on user machines: Arial Narrow Win 88.39% / Mac 94.77%; Courier New Win 99.73% / Mac 95.68%; Georgia Win 99.4% / Mac 97.48%; Helvetica Win 7.34% / Mac 100%. Bradley Hand and Noteworthy are not listed. — [CSS Font Stack](https://www.cssfontstack.com/)

#### The game's current type and rendering (repo, read-only)
- Font variables: `--typewriter: 'Courier New', Courier, ui-monospace, monospace`; `--official: 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif`; `--hand: 'Bradley Hand', 'Segoe Print', 'Noteworthy', cursive`. — [src/ui/desk.css lines 20 to 22](../../src/ui/desk.css)
- A grep of `src/` finds 61 uses of `font-family: var(--official)`, 6 of `var(--typewriter)`, 4 of `var(--hand)`, 3 of `Georgia` and 1 of `'monospace'`. — [repo `src/`](../../src)
- The stage computes `scale = Math.min(h / 820, w / 1240, 2)` and applies `transform: translate(${left}px, 0) scale(${scale})`. The scale is continuous and usually fractional. — [src/ui/Stage.tsx](../../src/ui/Stage.tsx)
- The hall uses `image-rendering: pixelated`. — [src/ui/hall.css line 25](../../src/ui/hall.css). Elsewhere there is `filter: grayscale(0.5) blur(0.4px)` (desk.css line 207), and stamp animations use `rotate(-11deg) scale(2.2)` (desk.css line 770) and `rotate(8deg) scale(2.3)` (screens.css lines 221 and 271). — [src/ui/desk.css](../../src/ui/desk.css), [src/ui/screens.css](../../src/ui/screens.css)
- The asset licence file already lists a self-made "3x5 font in `src/gen/portraitParts.ts`" as part of the portrait art. — [public/assets/LICENSES.md](../../public/assets/LICENSES.md)

### Inferences
- The current chrome matches Anthropic's clusters almost item for item:
  - Cluster 5, template chrome: "FORM 1 · APPLICATION…", "RULEBOOK · DAY 1", "TIME · NO LIMIT", tracked uppercase, and Courier New or monospace for small labels.
  - Cluster 4, the SaaS-card kit: cream paper cards with the same soft drop shadow and one radius on the buttons and badges.
  - Cluster 1: the cream colour.
  - Cluster 2: the hall strip is near-black with one bright accent in orange monospace.

  The broadsheet cluster (3) is the one case where the subject justifies the look, because the morning paper really is a newspaper. Even there the face is a system default (Georgia).
- The cure is not swapping Courier New or Arial Narrow for a fashionable face. JetBrains Mono, IBM Plex and Space Grotesk were all recommended to escape defaults and then became defaults themselves. The cure is to derive the type from objects in the game's world (a Ministry form printer, a typewriter ribbon, a rubber stamp, the supervisor's handwriting, a newspaper masthead) and draw it on the same pixel grid as the portraits.
- The sticky note already looks different on each OS. The `--hand` stack falls from Bradley Hand to Segoe Print to Noteworthy, and those are typically OS-specific. That OS-specific availability comes from general knowledge; CSS Font Stack does not list these fonts. Bundled fonts would look the same everywhere and need no network.
- Key-cap badges ("SPACE", "A", "C") belong to the badge and pill family and to "one border-radius on everything". In a desk game the object itself can carry the hint (a key letter cut into a stamp handle, a key legend printed in the rulebook's back page), so no floating chips are needed. This is design judgement, not a sourced rule.
- Motion tied to player actions (stamp press, paper slide, drawer open) is endorsed even by the anti-template guidance. Entrance fades on every panel are the tell.

### Gaps
- I found no source that names Caveat or other handwriting fonts (Bradley Hand, Noteworthy), IBM Plex or Courier New specifically as AI tells. Named fonts are Inter, Roboto, Open Sans, Lato, Space Grotesk, Instrument Serif, Geist, "default system fonts", and "a monospace face for small data labels".
- No source names key-cap badges or "even spacing everywhere" as a tell. The nearest are "one border-radius on everything regardless of hierarchy" and "Cards for every block of info".
- I did not read Hacker News, Reddit or Bluesky threads directly. Krebs's HN-derived study stands in for them.

## 2. How do acclaimed desk and pixel games build a coherent, crafted look?

### Takeaway
The best games choose one low resolution and a small palette early, scale the whole frame by whole numbers, keep every glyph and sprite on that one grid, and push the interface into objects in the world (documents, a stamp bar, a rulebook, a scale weighed with teeth). The style usually grows out of the developer's constraints and is then enforced strictly. The number of typefaces is not the key. Papers, Please used 14, later 10, different tiny pixel fonts and still reads as one look, because every font shares the 570×320 grid, the muted palette and the documents' own logic. When Pope tried smooth vector text in the same frame, he rejected it as harder to read and inconsistent in detail.

### Cited Findings

#### Papers, Please (Lucas Pope's devlogs)
- Resolution: Pope moved from 3:2 to 16:9 and "decided to just make it wider and keep the height the same (570x320)". — [TIGSource devlog, Feb 2013](https://dukope.com/devlogs/papers-please/tig-03/). "I started with the game's native res of 570x320, then scaled it up x2 using nearest neighbor scaling". — [Mar 2013](https://dukope.com/devlogs/papers-please/tig-04/). In 2022: "The actual resolution is laughably low (570x320) but these pixels need to be big." — [Cramming 'Papers, Please' Onto Phones, 6 Aug 2022](https://dukope.com/devlogs/papers-please/mobile/)
- Whole-pixel scaling: Pope's resize code sets `kPixelWidth = 570; kPixelHeight = 320;` and increments an integer `mult` while `570*(mult+1)` and `320*(mult+1)` still fit the stage, then centres the frame. "That puts the play area in the center of the screen at the highest possible whole-pixel scale. This often doesn't fill the screen, so there's also a set of 4 black bitmaps (also children of the stage) arranged around the play area to mask it." — [TIGSource devlog, Apr 2013](https://dukope.com/devlogs/papers-please/tig-05/)
- The cost, as Pope told a player: "The game is 90 pixels wider now so it's possible you got boned on the whole-pixel scaling." — [Mar 2013](https://dukope.com/devlogs/papers-please/tig-04/)
- On mixing resolutions: "Games that mix pixel resolutions make my eyes twitch. So, unfortunately, going with pixels means accepting the blocky font." This was Pope's own reply; the page's blockquotes are other posters and his replies follow them. — [Apr 2013](https://dukope.com/devlogs/papers-please/tig-05/)
- The vector experiment: moving to smooth TTFs "requires all new font selections and basically blows the page layouts". After vectorising a screenshot: "The docs are much harder to read now and it feels like an inconsistent level of detail... I also really miss that 'ARSTOTZKA' font on the entry permit. Couldn't find anything like it in TTF." After trying hqx upscaling: "I'm still sorta drawn to the rough original." — [Mar 2013](https://dukope.com/devlogs/papers-please/tig-04/). His decision: "I've decided to just stick with pixels for Papers Please... for now I'm happy with chunky pixels and low-res fonts." — [Apr 2013](https://dukope.com/devlogs/papers-please/tig-05/)
- Palette: "One thing I like about some of the better pixel-art games is the limited palette. Instead of choosing a global palette though, I'm going to try limiting individual objects or backgrounds to ~3 shades." — [Nov 2012](https://dukope.com/devlogs/papers-please/tig-00/). On fades: "because it is a limited palette, a fade through so many shades looks out of place." — [Dec 2012](https://dukope.com/devlogs/papers-please/tig-01/)
- Mood and constraint: "The low resolution was dictated by my limitations, but the result is that I could create visuals and especially animations very quickly." "I chose muted colors and stripped back a lot of the details to try to express the bleak mood and to reduce extraneous visual clutter." — [Game Developer, Road to the IGF, 4 Feb 2014](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)
- Fonts: "Papers, Please is full of documents with precise layouts and an obscene number of different, tiny, pixel fonts." "I grabbed freeware/opensource ones that fit the look/size that I wanted and threw them in. I think there were 14 different fonts in use in the original version of the game." During localisation, "Some fonts appeared in only a few places or just didn't look good in retrospect. Those were dropped, leaving me with 10 font styles." And: "There just aren't that many ways to draw 8x8 pixel characters and make them legible." — [Localizing 'Papers, Please' Part 1, 19 Apr 2014](https://dukope.com/devlogs/papers-please/localizing-1/)
- How documents were built: "All images were authored in Photoshop and any text was just placed by hand... Documents were built up this way with markers (lone black pixels) for variable, game-set text." For localisation he aimed at "reducing the amount of distorted, rotated, variably-colored, or very-tightly-fit text." — [Localizing Part 1](https://dukope.com/devlogs/papers-please/localizing-1/)
- Engine details: "I ended up scaling the root DisplayObject, snapping pixel locations while dragging, and writing custom functions to generate nearest-neighbor rotated bitmaps at half-res. Also, I'm using a bitmap font class (pxBitmapFont) since rendering .ttfs seems to always have some level of anti-aliasing." Travellers are "a 1-color 8x18 pixel character". — [Nov 2012](https://dukope.com/devlogs/papers-please/tig-00/)
- Stamps and feel: "Applying the stamp on mouse release just doesn't have the satisfaction. What you want is a nice solid THUNK when pressing the mouse down, not when you let go." That led to the pull-out stamp bar. — [Dec 2012](https://dukope.com/devlogs/papers-please/tig-01/)
- The 2022 mobile port's readability changes, all from [the mobile devlog (6 Aug 2022)](https://dukope.com/devlogs/papers-please/mobile/):
  - Goal: "No squinting, zooming, or precision required to read/manipulate documents."
  - Problem: "The documents are too small and the desk area too crowded. There's a fundamental conflict between readability and having enough space for arranging things."
  - Grid: the phone interface "settled into 208x405 based on how the game's existing documents would fit legibly onto a modern non-Max iPhone". Later he calls the effective resolution "basically only 208x450". Both figures appear in the post.
  - Two grids as a compromise: "I definitely prefer maintaining a single consistent pixel grid but we've all got our price... With a base scale of 3x, the main booth and document regions can run at 3x while the checkpoint is a more manageable 2x." This is done "with fractional 2/3 pixel scaling on the 2x stuff, which multiplies out to integer coordinates in the final 3x buffer."
  - Final scaling: "A combination of integer scaling and bilinear filtering doesn't hurt so bad here", because phone screens "are delirious with pixels".
  - Where he refused the compromise: "I wanted to keep the entire booth/documents area in one pixel grid, so 2/3 scaling wasn't an option here." That was the rulebook, which he re-cropped and re-laid-out at load time instead. The newspaper needed "the 2/3 scale plus a narrower 3-column layout".
  - Layout: "I swung all the way to readability and eliminated the arrangeability requirements completely". The desk became a full-size document carousel plus a rack.
  - Stamping kept on press: "I didn't want to give up the satisfaction of stamping on press/touch"; stamping on release "never felt right to me". The stamp desk opens with a pull chain and the overlay uses an "alligator-clip style pincher", both in-world objects.

#### Return of the Obra Dinn (Pope)
- "One bit per pixel. Two colours. 800×450 pixels"; the original 640×360 was raised because of fullscreen problems. "the most important part of using dithering was to use it as little as possible"; "Clear outlines on the geometry like this make understanding the 3D space much easier." — [PlayStation Blog, 17 Oct 2019](https://blog.playstation.com/archive/2019/10/17/lucas-pope-on-return-of-the-obra-dinns-art-style)
- Pope wanted to "take this 1-bit style that I played as a kid and try to make it legible and playable now using modern technology". Inverse-coloured outlines keep "the shapes and geometry... always clear to see". The hard problem was making dithering comfortable for "a four-hour game". — [Game Developer, 26 Nov 2018](https://www.gamedeveloper.com/design/for-lucas-pope-i-return-of-the-obra-dinn-i-was-a-bunch-of-appealing-design-problems)

#### The Case of the Golden Idol and its sequel
- The developer described the aesthetic as "ugly but distinct". This comes from a search snippet of the Thinky Games feature; the page itself returned 403. — [Thinky Games feature](https://thinkygames.com/features/how-the-case-of-the-golden-idol-developers-made-one-of-the-decades-best-detective-games-twice/)
- Reviews of The Rise of the Golden Idol (2024) say it replaced pixel art with a painterly style that keeps details legible from close-ups to panoramas. This is also from search snippets. — [Thinky Games review](https://thinkygames.com/reviews/the-rise-of-the-golden-idol-review/), [PC Gamer review](https://www.pcgamer.com/games/adventure/the-rise-of-the-golden-idol-review/)

#### Inscryption
- Daniel Mullins: "I'd been interested for a while in down-rezzing 3D art to a sort of pixel art resolution and then doing effects on top of it." The shader is one "where the darker colors posterize... but the lighter colors don't. Which is how it ended up with these very hard shadows." And: "I loved in Celeste how they'd have a pixel art canvas but then there's, like, higher-resolution effects on top of it." — [Game Rant, 28 Oct 2021](https://gamerant.com/inscryption-interview-developer-daniel-mullins-3d-retro-horror-games/)
- Damage is tracked with "a weighing scale, using teeth to represent each point of damage taken by that player". — [Wikipedia: Inscryption](https://en.wikipedia.org/wiki/Inscryption)

#### Death and Taxes (a desk game)
- Palette: "Greyscale complemented by blue, yellow, red". "Having a limited palette gives you a great edge if you want to put emphasis on something, because it will immediately pop out." The team recommends checking readability by converting art to greyscale. Their pipeline: pencil sketch, digital lineart trace, vectorise, then colour with "an opaque brush". — [Placeholder Gameworks DevLog 5: Art](https://placeholdergameworks.itch.io/death-and-taxes/devlog/102676/devlog-5-art)

#### Unpacking
- Artist Angus Doolan: creative director Wren Brier "walked me through her process and the requirements for the style early on" and gave "detailed feedback to make sure everything was looking right and staying consistent with the game's style and direction". Items were "first draw[n] out as line-art with flat colours" before a polish pass, and the game has nearly 4,000 images. — [Mucho Pixels interview, 15 Nov 2021](https://www.muchopixels.com/post/angus-doolan-interview)

#### Mouthwashing
- Art lead Johanna Kasurinen chose the PS1 look from nostalgia and because "I just hadn't made any art before, any 3D models or anything, so that was just a style that was executable to me". She says "there's this very thin line between goofy and grotesque", and "The color palette of the game from the beginning was sunset colors." — [Skybox Critics interview, 14 Jul 2025](https://skyboxcritics.com/2025/07/14/mouthwashings-genesis-sick-jokes-and-the-thin-line-between-goofy-and-grotesque-an-interview-with-wrong-organ/)

#### Balatro
- LocalThunk: "m6x11plus is the main font for Balatro", a font by Daniel Linssen. — [LocalThunk on X](https://x.com/LocalThunk/status/1739882509826248882) (seen in search results; not fetched). Fonts In Use says m6x11 is used "throughout, often with an animated bouncing effect". — [Fonts In Use, 8 Feb 2025](https://fontsinuse.com/uses/65816/balatro-computer-game)
- "I remember spending a long time making custom pixel art for the red deck back and all the playing cards. It was the first time I had tried making proper pixel art." — [LocalThunk: The Balatro Timeline](https://localthunk.com/blog/balatro-timeline-3aarh)
- The claim that the CRT look was chosen because low-resolution pixel art suits a solo developer comes only from secondary analysis. — [Blake Crosley: Balatro](https://blakecrosley.com/guides/design/balatro) (unverified)

#### Buckshot Roulette
- "The grungy art style is a signature look of its developer Mike Klubnika." His influences include Arthur C. Clarke, Lovecraftian horror, exploring abandoned facilities, and vintage electronics and interfaces. — [80 Level](https://80.lv/articles/buckshot-roulette-developer-on-making-the-game-solo-feedback-success)

#### Diegetic UI and juice across these games
- Fagerholt and Lorentzon's 2009 Chalmers MSc thesis "Beyond the HUD" introduced the four UI types diegetic, non-diegetic, spatial and meta. — [ResearchGate: Beyond the HUD](https://www.researchgate.net/publication/277202228_Beyond_the_HUD_-_User_Interfaces_for_Increased_Player_Immersion_in_FPS_Games)
- "Juice it or lose it" (Martin Jonasson and Petri Purho, Nordic Game Jam 2012) added tweening, screenshake, squash, particles and sound live to a Breakout clone, and is treated as the standard reference on "juice". This description comes from a search summary. — [YouTube: Juice it or lose it](https://www.youtube.com/watch?v=Fy0aCDmgnxg)

### Inferences
- The look comes from a rendering grammar (one grid, one palette, UI as objects), not from a small font count. For this game that means:
  - One grid, where one portrait art pixel equals 2 stage px.
  - Every glyph, border and shadow snapped to that grid.
  - About 3 or 4 shades per object.
  - Each in-world object (the form, the video printout, the rulebook, the sticky note, stamps, the court tray, the newspaper, the evening accounts) may have its own face, provided all of them sit on the same grid.
- The stage scaler does the opposite of Pope's approach. `Stage.tsx` uses a continuous fractional scale, while Pope picked "the highest possible whole-pixel scale" and masked the rest with black bars. His mobile compromise suggests that on high-DPI screens a non-integer final scale is tolerable. On 1× screens it visibly breaks pixel art and pixel fonts.
- Pope's vector experiment is the direct evidence against the current mix of pixel art and smooth system text. He found that smooth text next to pixel art gave "an inconsistent level of detail", even at higher resolution.
- A style drawn from constraints tends to be distinctive, as the Papers, Please, Mouthwashing, Balatro and Death and Taxes sources show. A fitting constraint for this game: everything on the desk is printed by the Ministry's machines or written by hand, so every face should be one those machines or hands could produce.
- Diegetic feedback: Pope's stamp-on-press, Inscryption's scale with teeth and Balatro's bouncing type all put feedback on objects. The court tray, the pay ledger and the hall board can do the same. This supports "every player action gets immediate feedback" without floating labels.

### Gaps
- Not Tonight, Contraband Police and That's Not My Neighbor: I found no primary art-direction sources, only store or wiki descriptions (Not Tonight is pixel art about checking IDs).
- The Inscryption GDC 2022 post-mortem slides (PDF) were too large to fetch, so the claim that the game has no HUD is not verified.
- The list of Papers, Please fonts (the Fandom page returned HTTP 402) and the game's palette hex values were not obtained.
- Primary Golden Idol quotes (Thinky Games returned 403) and the claimed Hogarth and Doré influences, seen only in a search summary, are unverified.
- Unpacking's native pixel scale and Balatro's reasons for the CRT look were not found in primary sources.

## 3. CC0 and public-domain fonts, self-made bitmap fonts, crisp pixel text on the web, and accessibility

### Takeaway
Real CC0 or public-domain options exist and were checked on their own pages:
- Kenney Fonts
- monogram
- m5x7
- GGBotNet's CC0 collection, including Public Pixel
- Not Jam Mono Clean 8
- unscii, except its "-16-full" variant
- Typodermic's public-domain release, including the typewriter face Cuomotype
- Tom Thumb

Balatro's m6x11 is attribution-only and SIL OFL fonts are excluded by the project rule. For a look nobody else has, the stronger route is to extend the repo's existing self-made 3x5 glyph data into a small family of self-made pixel fonts, compiled to TTF (optionally WOFF2) at build time with opentype.js. Crisp text depends on geometry: an integer number of device pixels per font pixel, and integer positions. CSS switches for font smoothing are non-standard, macOS-only, and were unreliable for Pope. Keep meaningful text as real DOM text in the custom font, not canvas text.

### Cited Findings

#### Fonts checked against their own licence pages

| Font | Licence as stated on its own page | Grid / metrics | Formats | Notes |
|---|---|---|---|---|
| Kenney Fonts (Kenney Blocks, Future, Future Narrow, High, High Square, Mini, Mini Square, Pixel, Pixel Square, Rocket, Rocket Square) | "Creative Commons CC0"; 11 files, version 1.0 (2014), tagged "font, letter, pixel" — [kenney.nl](https://kenney.nl/assets/kenney-fonts) | Not stated per font | Not stated on the page | Names from a mirror — [ereborstudios/kenney-fonts](https://github.com/ereborstudios/kenney-fonts). The style of each face was not checked. |
| monogram (datagoblin) | "Creative Commons Zero v1.0 Universal" — [itch page](https://datagoblin.itch.io/monogram) | "fixed width of 5 pixels" | TTF, PNG+JSON bitmap, PICO-8; extended version with italics; v1.1.0 | Covers English, Spanish, Russian, Portuguese, Greek and more — [page](https://datagoblin.itch.io/monogram) |
| m5x7 (Daniel Linssen) | CC0 1.0; the page adds that attribution is appreciated — [itch page](https://managore.itch.io/m5x7) | x-height 5, ascender 7, descender 2; render at 16, 32, 48 px… | TTF | Upper and lower case, many accented letters — [page](https://managore.itch.io/m5x7) |
| Public Pixel (GGBotNet) | "This Font Software is licensed under the Creative Commons Zero v1.0 Universal." — [itch page](https://ggbot.itch.io/public-pixel-font) | 8×8 monospace; 1,324 glyphs, 98 languages; 8/16/32/64/128 px | TTF | — |
| GGBotNet Fonts CC0 (all-in-one) | "licensed under the Creative Commons Zero v1.0 Universal license" — [itch page](https://ggbot.itch.io/ggbotnet-fonts-cc0); repo licence CC0-1.0 — [GitHub](https://github.com/ggbotnet/fonts-cc0) | 45 fonts per itch, 47 folders per GitHub (the counts disagree) | TTF, OTF, WOFF, WOFF2; archive dated Dec 2025 | Includes MatrixType (dot matrix), Y224 ("Monospaced font with straight lines"), 3x3 Mono, OSerif, Rainbow 2000 ("All-caps handwritten font"), Scabber ("Handwritten Typeface"), Erratic Cursive, First Time Writing!, Stampcraft — [itch cc0 fonts tag](https://itch.io/game-assets/tag-cc0/tag-fonts), [GitHub](https://github.com/ggbotnet/fonts-cc0) |
| Not Jam Mono Clean 8 | "To the extent possible under law, Not Jam has waived all copyright and related or neighboring rights to Not Jam Mono Clean 8." — [itch page](https://not-jam.itch.io/not-jam-mono-clean-8) | 8 px tall; "Set font size to multiples of 8"; an 11 px variant adds Latin-1 Supplement and Latin Extended-A | TTF, PNG glyphs, JSON for YellowAfterlife's Pixel Font Converter | "designed to maximise legibility" |
| unscii (Viznut) | "'unscii-16-full' falls under GPL because of how Unifont is licensed; the other variants are in the Public Domain." — [viznut.fi/unscii](http://viznut.fi/unscii/) | unscii-8 is 8×8; unscii-16 is 8×16 | hex, pcf, ttf, otf, woff; v2.1 | A public-domain statement, not the CC0 legal text |
| Typodermic public-domain collection (Ray Larabie) | "CC0 1.0 Universal", "no rights reserved"; can be used commercially, modified, embedded, redistributed — [typodermicfonts.com/public-domain](https://typodermicfonts.com/public-domain/) | 307 CC0 releases; page dated Dec 2024 | OTF, WOFF2, FontLab VFC sources | Cuomotype (1998, based on the Olympia Senatorial typewriter "with digital wear added"), Betsy Flanagan (keyboard-cap look), 6809 Chargen (dot-matrix homage), Minya (marker handwriting), Orange Kid (a replica of EarthBound's font). A search snippet said "729 OTF fonts", probably counting styles; unverified. |
| Tom Thumb (Robey Pointer) | Originally MIT; update note: "this font may also be used under either CC0 or CC-BY 3.0 license" — [robey.lag.net](https://robey.lag.net/2010/01/23/tiny-monospace-font.html) | "4x6 font (3x5 usable pixels)" | Not checked | The author reworked lowercase because the letters "all had different middle heights" and looked like "a child's writing" |

#### Fonts the rule excludes
- m6x11 and m6x11plus (Balatro's font): the itch page states "free to use with attribution", which is not CC0. Metrics: x-height 8, ascender 11, descender 3; render at 16, 32, 48 (m6x11) and 18, 36, 54 (m6x11plus). — [managore.itch.io/m6x11](https://managore.itch.io/m6x11)
- The project rule is "Only CC0 or self-made assets", so SIL OFL fonts, which include most Google Fonts pixel and typewriter faces, are out. — [public/assets/LICENSES.md](../../public/assets/LICENSES.md)

#### Making a self-made pixel font
- opentype.js is MIT licensed. The README builds glyphs from an `opentype.Path` (`moveTo`, `lineTo`), requires a `.notdef` glyph, and constructs `new opentype.Font({ familyName, styleName, unitsPerEm, ascender, descender, glyphs })`. It exports with `font.toArrayBuffer()` (written to a file in Node) or `font.download()` in a browser. It writes OTF/TTF; for WOFF2 it points to an external library (fontello/wawoff2). — [opentype.js on GitHub](https://github.com/opentypejs/opentype.js)
- Pope's 2014 experience: "There are no good TTF pixel font editors"; "The only decent bitmap font editor with TTF export that I could find was fontstruct.com. Unfortunately, fontstruct has no import feature". FontForge's autotrace "is optimized for high resolution curvy fonts"; it "breaks down on neighboring interior pixels, leading to little blurry pixels everywhere", so he "hacked it... until it would trace pixel-perfect, right-angle paths everywhere." — [Localizing Part 1](https://dukope.com/devlogs/papers-please/localizing-1/)
- Not Jam ships each font's glyphs as PNG plus JSON for YellowAfterlife's Pixel Font Converter, which is evidence of a common PNG-to-TTF workflow. — [Not Jam Mono Clean 8](https://not-jam.itch.io/not-jam-mono-clean-8)

#### Crisp pixel text and art in the browser
- MDN on `font-smooth`: "Non-standard"; "We do not recommend using non-standard features in production". `-webkit-font-smoothing` "Works on macOS only", and so does `-moz-osx-font-smoothing`. Switching light-on-dark text from subpixel to greyscale anti-aliasing makes it look lighter. — [MDN: font-smooth](https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth)
- Pope on the same problem in 2014: "Disabling font smoothing to get sharp bitmap-based pixel fonts is surprisingly difficult with CSS. There are CSS specs for disabling font smoothing but (surprise) they're not reliable. In some browsers it plain doesn't work. For some, it works ok in OSX but not Windows." "Even with font smoothing turned off in the most forceful way, Windows will still ClearType bitmap fonts". On retina Macs he had to use Chrome's "Open in Low Resolution" to avoid "mandatory high resolution font anti-aliasing". His workaround for screenshots was a colour quantiser that stripped anti-aliased pixels. — [Localizing Part 1](https://dukope.com/devlogs/papers-please/localizing-1/)
- Blurry pixel fonts happen when "the text was offset by a non-integer pixel amount". Causes: relative units (%, rem, em) for padding, margins, gaps or positions; auto-centring (`margin: auto`, `text-align`, `justify-content`); fallback to a vector font for missing glyphs; odd viewport sizes giving half-pixel margins. Fixes: exact pixel values, every glyph present in the pixel font, and a `translateZ(0)` hack the author calls "technically a hack". — [kainoa.us: Fixing blurry pixel fonts, 27 Feb 2023](https://kainoa.us/posts/fixing-blurry-pixel-fonts.html)
- MDN on `image-rendering`: `pixelated` scales "with the 'nearest neighbor' or similar algorithm to the nearest integer multiple of the original image size, then uses smooth interpolation to bring the image to the final desired size". `crisp-edges` uses an algorithm "such as 'nearest neighbor'... no blurring or color smoothing occurs". The property is "Widely available" since January 2020. — [MDN: image-rendering](https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering)
- MDN's crisp pixel art guide: "ensure that the image pixels are always drawn at integer multiples of canvas pixels". It warns: "When CSS pixels don't align with device pixels (if the devicePixelRatio is not an integer), certain pixels may be drawn larger than others... in Chrome and Firefox, when you zoom in or out, the devicePixelRatio changes." — [MDN: Crisp pixel art look](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look)
- web.dev: "fractional physical pixels are not a thing". Browsers "pixel snap" fractional sizes differently, which causes blur or moiré. `devicePixelContentBoxSize`, read through a ResizeObserver, gives a canvas's exact size in device pixels. Support listed: Chrome/Edge 84+, Firefox 108+, not Safari. The article was last updated in 2020, so Safari support may have changed. — [web.dev: Pixel-perfect rendering with devicePixelContentBox](https://web.dev/articles/device-pixel-content-box)
- Recommended sizes on the font pages: m5x7 at multiples of 16 — [page](https://managore.itch.io/m5x7); Public Pixel at 8/16/32/64/128 px — [page](https://ggbot.itch.io/public-pixel-font); Not Jam at multiples of 8 — [page](https://not-jam.itch.io/not-jam-mono-clean-8).

#### Accessibility: real text or canvas
- WCAG 2.2 SC 1.4.5 Images of Text (Level AA): "If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text". The exceptions are customisable images of text and cases where the presentation is essential (logotypes, font samples, historical document reproductions). The intent is that users can change size, colour, font and spacing, which text drawn as an image or on a canvas prevents. — [W3C: Understanding SC 1.4.5](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html)
- Xbox Accessibility Guideline 101 minimum default sizes are measured as "body height", the pixels of descender plus x-height plus ascender:
  - Console: 26 px at 1080p, 52 px at 4K.
  - PC/VR: 18 px at 1080p, 36 px at 4K.
  - Mobile: 18 px at 100 DPI, scaling linearly with DPI.

  Other requirements: text scalable to 200%; "Include at least one sans serif type-face option"; "If stylistic fonts are used..., provide a non-stylized font option"; complete character sets; line width at most 80 characters; line spacing at least 1.5; letter spacing at least 0.12× the font size; word spacing at least 0.16×; "Provide the ability to display text in proper sentence case rather than in full caps", with a "one- or two-word label" exempt. The page was updated in June 2026. — [Microsoft Learn: XAG 101](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101)
- Game Accessibility Guidelines: 28 px at 1080p as a minimum, based on TV 10-foot UI guidance; "use 28px as a minimum rather than a target". Small fonts are "more difficult to read for conditions such as dyslexia, due to the differences between letter shapes being less pronounced at smaller pixel sizes". — [GAG: Use an easily readable default font size](https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/). This differs from XAG's 18 px for PC because GAG's figure comes from TV viewing distances.

### Inferences
- **Recommended route: self-made fonts, compiled at build time.** It keeps the CC0-or-self-made rule trivially satisfied and gives the game a face nobody else has.
  - Keep glyph grids in TypeScript, the way `FONT` in `src/gen/portraitParts.ts` already does.
  - A Node script emits one square contour per lit pixel, or merged rectangles. Use integer `unitsPerEm` per font pixel (for example 100 units per pixel), integer ascender, descender and advance widths, and write TTF with opentype.js.
  - opentype.js would be a dev-only dependency. One-line justification: it writes TTF from code, so the fonts stay self-made and reproducible.
  - Pixel TTFs are tiny, so serving the TTF directly is probably fine and WOFF2 is optional.
  - Load them with `@font-face { src: url('/fonts/…ttf') }` and `font-display: block` so there is no flash of fallback. There are no runtime network calls beyond the game's own static files.
  - List each generated font in `public/assets/LICENSES.md` as self-made.
- **Candidate faces, each tied to an object** (design suggestions):
  1. A 5×7 or 6×9 "Ministry print" face with lowercase and an x-height of at least 5 px, for forms, rulebook and ledger.
  2. A typewriter or dot-matrix face for the video printout and transcripts.
  3. A condensed caps "rubber stamp" face.
  4. A wobbly hand-drawn pixel face for the supervisor's sticky note.
  5. A 2× bold masthead or headline face for the Gazette.

  The existing 3×5 font stays for decoration only.
- **If a ready-made CC0 face is wanted as a base or stopgap**, monogram or m5x7 (small, with lowercase) and Public Pixel or Not Jam Mono Clean 8 (8 px) are the most document-friendly. Cuomotype is the only verified CC0 typewriter face, but it is an outline font with simulated wear and would clash with the pixel grid. Using any of these still risks looking like "that free font from itch", which undercuts the goal of a distinctive look.
- **CSS recipe for pixel text** (inferred from the sources above, not individually sourced):
  - `font-size` equal to the font's native pixel height times an integer that matches the art scale.
  - `line-height` in whole px.
  - `font-kerning: none; font-synthesis: none; font-variant-ligatures: none;` so there is no faux bold or italic smearing glyphs.
  - `letter-spacing` at 0 or whole font pixels.
  - px-only positioning inside pixel regions; no %/rem/auto-centring that can land on half pixels.
  - No `rotate()` or `filter: blur()` on text or pixel art. Pre-draw rotated stamp sprites, as Pope drew "nearest-neighbor rotated bitmaps at half-res".
  - `-webkit-font-smoothing: none` only as a macOS nicety.
- **Stage fix** (inferred from Pope, MDN and web.dev):
  - Choose the scale so that `scale × devicePixelRatio` is a whole number, taking the floor.
  - Round `left` and `top` to device pixels.
  - Letterbox the remainder. The stage already uses dark bars on very wide windows.
  - Recompute on resize and on DPR change, because browser zoom changes DPR.
  - On 1× screens this means whole-number scales only. A browser window about 1000 px tall on a 1080p monitor gets scale 1, not about 1.2.
  - On 2× screens, half steps such as 1.5 are also crisp (3 device pixels per stage pixel), but only very tall windows reach them. A 2560×1440-point display at 2× does.
  - `Stage.tsx` already lets the design width flex (1240 to 1760) and sets the design height to `h / scale`. A snapped, smaller scale therefore mostly yields extra desk space rather than bars, if the layouts tolerate a height above 820. Otherwise, letterbox.
  - This trades some screen fill for crispness. Pope made the same trade and accepted players getting "boned on the whole-pixel scaling".
- **Accessibility:**
  - Real DOM text in a custom pixel font keeps screen readers, selection and browser zoom working. Canvas text would fail 1.4.5 unless it is mirrored in DOM or ARIA.
  - XAG's "non-stylized font option" suggests a settings toggle that swaps the pixel faces for a plain sans at the same layout. A system font used as a fallback is not a shipped asset, so the licence rule should still hold; the owner should confirm this reading.
- **A test that could prove crispness:** Playwright screenshots at DPR 1 and 2 over text regions, asserting that only palette colours appear (no anti-aliased in-between colours). This fits the repo's "No evidence, not done" rule.

### Gaps
- I did not check CC0 claims for Pixel Operator, Fixedsys Excelsior, Boxy Bold or the other fonts in itch's cc0 tag on their own pages, so they are not listed as verified.
- I did not read the licence text inside the Kenney zip, or look at each Kenney face to see whether it is pixel or vector.
- I did not check wawoff2's licence or its compression API, or YellowAfterlife's Pixel Font Converter.
- I found no source that says whether Windows Chrome adds grey fringe pixels to pixel-font outlines that sit exactly on device pixels at integer sizes. This needs a local test.
- Safari support for `devicePixelContentBox` in 2026 was not re-checked; the web.dev article dates from 2020.
- Typodermic's "Orange Kid" is a replica of a commercial game's font. I did not research whether that creates any risk beyond the CC0 dedication.

## 4. Practical coherence rules: one grid, limited palette, outlines and shadows, no mixed text, fewer labels, objects as UI, readability minimums

### Takeaway
Across Pope's devlogs, Saint11's consistency essay, Obra Dinn, Death and Taxes and Unpacking, the rules are the same. Pick one base resolution and scale the whole canvas by one integer with nearest-neighbour filtering. Never mix pixel sizes, or pixel text with smooth text. Limit colours per object (Pope used about 3 shades). Use clear outlines for legibility and restraint with effects. Keep separate "worlds", such as UI and gameplay, internally consistent. Enforce all of this through one person's review. On labels, Anthropic's guidance and XAG agree: fewer and in sentence case, with meaning carried by structure and objects. For size, XAG's PC floor is 18 px body height at 1080p. A 9-pixel-tall pixel font drawn at 2× just meets it; a 3×5 font does not.

### Cited Findings
- Saint11 (Pedro Medeiros, 19 Apr 2023):
  - Choose a base resolution and "scale that canvas to fit it to the screen resolution", using "nearest neighbor interpolation" and "scale all sprites by the same integer number".
  - Keep a limited palette and make sure "sprites don't use colors that they could be using".
  - Keep distinct styles in separate "worlds" (gameplay, UI, maps), where "Styles never leak from one world to another".
  - "When in doubt, strive for maximum consistency. If you're well-versed in the rules, you can always choose to break them deliberately."

  Source: [Saint11: Consistency](https://saint11.art/blog/consistency/)
- One grid, no mixed resolutions: "Games that mix pixel resolutions make my eyes twitch." — [Pope, Apr 2013](https://dukope.com/devlogs/papers-please/tig-05/). "I definitely prefer maintaining a single consistent pixel grid"; for the rulebook he "wanted to keep the entire booth/documents area in one pixel grid". — [Pope, 2022](https://dukope.com/devlogs/papers-please/mobile/)
- Smooth text next to pixel art: vectorised documents were "much harder to read" with "an inconsistent level of detail". — [Pope, Mar 2013](https://dukope.com/devlogs/papers-please/tig-04/)
- Palette per object: "limiting individual objects or backgrounds to ~3 shades". — [Pope, Nov 2012](https://dukope.com/devlogs/papers-please/tig-00/). Muted colours "to reduce extraneous visual clutter". — [Road to the IGF](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-). Greyscale plus three accents so that emphasis "will immediately pop out", checked with a greyscale test. — [Death and Taxes DevLog 5](https://placeholdergameworks.itch.io/death-and-taxes/devlog/102676/devlog-5-art)
- Outlines and restraint with effects: "Clear outlines on the geometry like this make understanding the 3D space much easier"; "use [dithering] as little as possible". — [PlayStation Blog, Obra Dinn](https://blog.playstation.com/archive/2019/10/17/lucas-pope-on-return-of-the-obra-dinns-art-style)
- One person's review loop and a fixed process: detailed feedback from the creative director "to make sure everything was looking right and staying consistent"; line-art with flat colours first. — [Unpacking, Mucho Pixels](https://www.muchopixels.com/post/angus-doolan-interview)
- Fewer labels: "Using all caps for labels" and "Adding unnecessary typographic labels above content" are named tells, and "Visual structure is information". — [Anthropic SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md). XAG asks for sentence case for lines of text, exempting one- or two-word labels. — [XAG 101](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101)
- Letting objects carry the UI: Papers, Please's stamp bar (stamping on mouse-down), and in the 2022 port a pull chain for the stamp desk and an alligator-clip "pincher" for overlaying documents. — [Pope, Dec 2012](https://dukope.com/devlogs/papers-please/tig-01/), [Pope, 2022](https://dukope.com/devlogs/papers-please/mobile/). Inscryption's damage scale uses teeth. — [Wikipedia](https://en.wikipedia.org/wiki/Inscryption). Diegetic, spatial, meta and non-diegetic UI types. — [Fagerholt and Lorentzon 2009](https://www.researchgate.net/publication/277202228_Beyond_the_HUD_-_User_Interfaces_for_Increased_Player_Immersion_in_FPS_Games)
- Readability without zoom: "No squinting, zooming, or precision required to read/manipulate documents." — [Pope, 2022](https://dukope.com/devlogs/papers-please/mobile/)
- Pixel-font legibility floors from practitioners:
  - Pope worked with 8×8 characters: "There just aren't that many ways to draw 8x8 pixel characters and make them legible." — [Localizing Part 1](https://dukope.com/devlogs/papers-please/localizing-1/)
  - A 3×5 usable cell struggles with lowercase ("different middle heights", "a child's writing"). — [Tom Thumb](https://robey.lag.net/2010/01/23/tiny-monospace-font.html)
  - m5x7 has x-height 5, ascender 7, descender 2. — [m5x7](https://managore.itch.io/m5x7)
  - Public Pixel is 8×8. — [Public Pixel](https://ggbot.itch.io/public-pixel-font)
  - Not Jam Mono Clean 8 is 8 px tall. — [Not Jam](https://not-jam.itch.io/not-jam-mono-clean-8)
- Size floors: XAG PC 18 px body height at 1080p, console 26 px, scalable to 200%. — [XAG 101](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101). GAG 28 px at 1080p, TV-based. — [GAG](https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/)
- Motion only in answer to the player's actions. — [Anthropic SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md). Juice as tweening, shake, squash and sound on events. — [Juice it or lose it](https://www.youtube.com/watch?v=Fy0aCDmgnxg)

### Inferences
A checklist for the art pass, derived from the findings above and applied to this game's screens. These are proposals, not sourced rules.

1. **One grid.** One art pixel equals 2 stage px, as in the portraits. Every border, shadow offset, corner, icon and glyph snaps to it. Replace CSS `border-radius` and soft `box-shadow` with pixel-drawn corners and hard 1-art-pixel drop shadows in a palette colour, all lit from one direction (for example the booth lamp). The blurred rgba shadow is both a named AI tell and a smooth effect inside a pixel world.
2. **Snap the stage scale** to whole device pixels and letterbox the rest, as Pope did. Remove `blur()` filters and fractional rotate or scale animations on pixel content; pre-draw a rotated stamp sprite instead.
3. **One master palette** of roughly 24 to 32 colours, with at most 3 or 4 shades per object, and the cream replaced by colours that come from the world (Ministry grey-green, a specific paper stock). Run a greyscale test as Death and Taxes does. Keep the design invariant: colour and highlighting must never reveal validity. Only player-triggered inspection can mark evidence, as in Papers, Please's inspect mode.
4. **Type belongs to objects.** Use three to five self-made pixel faces, each owned by a device or person: the form printer, the typewriter or dot-matrix, the rubber stamp, the supervisor's hand, the Gazette masthead. Use no system fonts on the desk and no smooth text inside the pixel world.
5. **Cut the chrome.**
   - Drop the eyebrows and middle-dot meta strings. "FORM 1 · APPLICATION FOR REGISTRATION AS A HUMAN" becomes a heading printed on the form's own pixel artwork, laid out as a real form would be.
   - "VIDEO SUBMISSION · PRINTOUT" becomes a tear-off printer header.
   - "RULEBOOK · DAY 1" becomes a spine or tab on the book.
   - "TIME · NO LIMIT" becomes a wall clock or a sign.
   - Key-cap chips move onto the objects (a letter on the stamp handle) or into a rulebook page.
6. **Hall announcements** become an in-world board (flip-dot, LED ticker or loudspeaker card) with its own frame, glare and pixel face, rather than a full-width black strip of orange monospace.
7. **Motion only answers actions:** a stamp thunk on press, a paper slide with pixel-snapped steps, a tray drop. No entrance fades on every panel.
8. **Readability floors.**
   - Meaningful text needs at least 18 px body height on a 1080p-class screen. A font with a 9-pixel body (ascender 7 plus descender 2) at 2 device px per font pixel just meets that.
   - The 3×5 font at 2× is 10 px, so use it only for decoration such as stamp serials on portraits.
   - Keep lines under 80 characters and use sentence case for running text.
   - Offer a plain-text accessibility toggle.
9. **Review loop.** One person (or one written style sheet) checks every new asset against the grid, the palette and the object-owns-the-type rule before merge. Unpacking relied on the creative director for this.

### Gaps
- I found no controlled study giving a minimum x-height in pixels for pixel fonts. The floors above come from practitioners (Pope, Tom Thumb) and from general game guidelines (XAG, GAG) that are not specific to pixel fonts.
- I found no art-director source on keeping outline thickness consistent in UI elements beyond Obra Dinn's outlines and Saint11's general rules.
- I found no source quantifying how players perceive mixed pixel and smooth text. The evidence is Pope's experience and his players' comments.
