# Visible evidence that separates a live human from animals, costumes, masks, printed faces and AI fakes

Scope note: this covers what can be *seen* in a still photo or a few video frames (plus transcript/sign), as used by biometric liveness testing (ISO/IEC 30107-3, NIST FATE PAD, iBeta), deepfake research, fact-checkers, and ID-photo standards. It ends each section with inferences for a low-resolution (about 100x120 px) pixel-art desk game where the player checks a humanity rule using a passport-style photo, three frames at 00:01/00:03/00:05, a transcript, a hand-held wallet-address sign and a form. Context from the repo (`notes/game-design.md`) already uses: the Deepfake (ears change between frames, Rule 2), the Cardboard Cutout (same pose in every frame, no blink, Rule 6), Gary (three raccoons in a trench coat, valid on day 7 because no rule forbids raccoons), and Dave (a human in a raccoon mascot costume, head under his arm, valid).

## 1. Presentation attack detection (liveness): attack types and their visible cues

### Takeaway
The standard testing world sorts fakes held up to a camera into a small set of "presentation attack instruments": printed photo, cut-out print, print wrapped on a cylinder, paper mask, screen replay (Level 1, cheap), and silicone/3D masks and better video (Level 2). Each has a physical signature a human can draw and check: paper edges and printing noise, a screen bezel and moire stripes, a frozen face that never blinks, and for masks, real eyes and mouth showing through holes, muted expression and a join at the neck or collar. Good silicone masks fool people in still photos almost completely, so a game tell must be the *seam or the stillness*, not the skin.

### Cited Findings
- NIST's FATE Part 10 (published 19 Sep 2023) "quantifies the accuracy of passive purely software-based face presentation attack detection (PAD) algorithms operating on conventional 2D imagery of various presentation attack instruments (PAI)." — [NIST FATE Part 10](https://www.nist.gov/publications/face-analysis-technology-evaluation-fate-part-10-performance-passive-software-based)
- NIST FATE PAD tested 9 presentation attack types but deliberately did not fully disclose them (to deter tuning to specific attacks); the two named are PA Type 3, a "flexible silicone mask", and PA Type 8, a "photo print / replay attack". — [Paravision explainer of NIST FATE PAD](https://www.paravision.ai/news/understanding-nist-fate-presentation-attack-detection-pad/) (vendor, secondary)
- NIST FATE PAD distinguishes two goals: **impersonation** ("someone is trying to fraudulently access a system with a recreation of another person's face") and **evasion** ("someone is trying to avoid their face being matched"). It warns that "the accuracy fall off for certain presentation attack types is quite severe, even among the top-ranked accuracy performers." — [Paravision explainer](https://www.paravision.ai/news/understanding-nist-fate-presentation-attack-detection-pad/)
- iBeta's ISO 30107-3 Level 1 testing covers photo print attacks, cutout print attacks, cylinder-mounted prints, 3D paper masks and display (screen) replay attacks; Level 1 artefacts are low-cost (reported as no more than about $30 each) and use cooperative conditions. — [Didit on iBeta Level 1](https://didit.me/blog/didit-ibeta-pad-level-1/) (vendor); [iBeta test methodology page](https://www.ibeta.com/iso-30107-3-presentation-attack-detection-confirmation-letters/) (the $30 figure came via a search summary; page not fetched)
- iBeta Level 2 adds more sophisticated, custom-made instruments such as silicone masks, 3D prints and better video attacks. — [Innovatrics on iBeta Level 1 & 2](https://www.innovatrics.com/awards/level-1-ibeta-presentation-attack-detection-conformance/); [Biometric Update, June 2025](https://www.biometricupdate.com/202506/ibetas-biometric-presentation-attack-detection-testing-levels-up) (search summaries; not fetched)
- Screen replay leaves **moire patterns**: aliasing from the misaligned pixel grid of the display and the camera; Patel, Han and Jain used moire to separate replayed faces from live faces. — [IEEE: "Live face video vs. spoof face video: Use of moiré patterns to detect replay video attacks"](https://ieeexplore.ieee.org/document/7139082/)
- Moire patterns rarely appear on printed photos, which instead carry printing noise; the display's frame/bezel texture is another replay clue. — [Physics-Guided Spoof Trace Disentanglement, arXiv 2012.05185](https://arxiv.org/pdf/2012.05185) (from search summary; attribution of the bezel remark to this specific paper is uncertain)
- Hyper-realistic silicone masks: in photo experiments **0%** of participants spontaneously mentioned a mask; when asked to pick the masked face, 30% (UK) and 54.5% (Japan) failed; live at 5 m only 2.4% spontaneously noticed. — [Sanders et al. 2017, Cognitive Research: Principles and Implications](https://pmc.ncbi.nlm.nih.gov/articles/PMC5655619/)
- The same paper describes how such masks work and where they give themselves away: "close-fitting holes that match the topology of the face beneath" show the wearer's real eyes, nostrils and mouth; the mask can extend "below the collar without any joins"; expressions are muted ("blunted animacy"), subtle expressions are lost, and speech sounds needing lip contact are impaired. — [Sanders et al. 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5655619/)
- Silicone-mask faces move less naturally than real faces, which anti-spoofing research uses as a detection cue alongside visual saliency. — [Neurocomputing: silicone mask anti-spoofing via visual saliency and facial motion](https://www.sciencedirect.com/science/article/abs/pii/S0925231221009371) (abstract via search summary)
- Blink detection as liveness: Li, Chang and Lyu (2018) exposed early DeepFake videos by the *absence* of natural eye blinking (LRCN, ROC 0.99). — [In Ictu Oculi, arXiv 1806.02877](https://arxiv.org/abs/1806.02877)

### Inferences
- Five "attack instruments" map cleanly onto one-glance pixel-art tells:
  - **Printed photo / cutout:** identical pose in all three frames, no blink, a white paper border or a thumb/fingers gripping the edge of the face, and the face does not turn while the body does. (The repo's Cardboard Cutout already uses "same pose, no blink".)
  - **Cylinder-wrapped print / paper mask:** a visible fold or crease line down the face, flat ears, eye holes with real eyes behind that sit at a slightly different spot.
  - **Screen replay (a phone or tablet held up):** a black rectangle bezel around the face, diagonal stripes (moire) drawn as a 2-3 colour dither, a glare stripe; sometimes a battery or clock icon at the top of the screen, which is a very readable pixel-art joke.
  - **Silicone/latex mask:** a colour step or ridge at the neck/collar or hairline; the face is frozen across frames while the transcript shows speech or laughter; eyes (real, glossy) look different from the skin around them.
  - **Frozen face / no blink:** already used by the game's Living rule.
- Because real people cannot spot good masks in a still (Sanders), the rulebook sentence should point at a checkable *structure*, e.g. "the face in the video moves between frames" or "no edge or seam crosses the face or neck", not at "looks rubbery".
- A mask is an *impersonation* tool; a face-paint/fake-beard human is at most an *evasion* case. Useful for flavour text: the Ministry does not care who you look like (that is Rule 2), only that the face is yours and alive.

### Gaps
- NIST did not publish descriptions of 7 of its 9 PA types, so a full official taxonomy with visuals was not available.
- ISO/IEC 30107-3 itself is paywalled; its exact terms (e.g. "PAI species", APCER/BPCER) were not verified from the standard text in this session.
- No primary source was fetched listing the full iBeta Level 2 instrument list; figures come from vendor/secondary pages.

## 2. AI-generated and deepfake tells (2024 to 2026): which still work

### Takeaway
The famous tells (six fingers, garbled sign text, not blinking) were real but are now largely fixed by 2025-2026 generators (GPT-4o image generation, Nano Banana Pro, Sora 2/Veo 3), so fact-checkers have shifted to physics and consistency checks: mismatched eye reflections, shadows and lighting, earrings/glasses/objects that change or don't function, overly smooth skin, lip movements out of sync with speech, and details that differ between frames or angles. For a game, the most honest and readable tells are *consistency across evidence* (ears or earrings change between frames, reflections differ between the two eyes, mouth doesn't match transcript), while "six fingers" and "garbled sign" can be used as deliberately outdated jokes about a cheap old model.

### Cited Findings
- Kamali, Nakamura, Chatzimparmpas, Hullman and Groh (arXiv, 12 June 2024) sort AI-image artefacts into five categories: **anatomical** (hands, teeth, eyes, ears), **stylistic** (unnatural skin texture), **functional** (illegible text, malformed jewellery, distorted eyewear), **violations of physics** (shadows, reflections) and **sociocultural** implausibilities; built from 138 generated images, 9 social-media images and 42 real photos. They note "human-perceptible artifacts are not always present in AI-generated images." — [arXiv 2406.08651](https://arxiv.org/abs/2406.08651)
- MIT Media Lab's Detect Fakes gives eight cues: look at the face; cheeks and forehead ("Does the skin appear too smooth or too wrinkly?"); eyes and eyebrows (shadows where expected?); glasses glare ("Is there any glare? Is there too much glare?"); facial hair ("Does this facial hair look real?"); moles; blinking ("Does the person blink enough or too much?"); and lip movements ("Some deepfakes are based on lip syncing."). — [MIT Detect Fakes](https://www.media.mit.edu/projects/detect-fakes/overview/)
- University of Hull (Adejumoke Owolabi, MSc, with Prof. Kevin Pimbblet), presented at the Royal Astronomical Society's National Astronomy Meeting, July 2024: in real photos the corneal reflections in both eyes are consistent; in AI fakes they are inconsistent. They measured light distribution with the Gini coefficient (the galaxy CAS parameters did not work). Pimbblet: "The reflections in the eyeballs are consistent for the real person, but incorrect from a physics point of view for the fake person." Caveat: "this is not a silver bullet... There are false positives and false negatives." — [ScienceDaily, 17 July 2024](https://www.sciencedaily.com/releases/2024/07/240717121116.htm); [EurekAlert](https://www.eurekalert.org/news-releases/1051667)
- Blinking: Li, Chang and Lyu (2018) caught early DeepFakes because they rarely blinked (training photos seldom show closed eyes). — [arXiv 1806.02877](https://arxiv.org/abs/1806.02877). Forgers then adapted: blinking can be added by training on images with closed eyes or on video sequences. — [The Conversation (Lyu), "Detecting deepfake videos in the blink of an eye"](https://theconversation.com/detecting-deepfake-videos-in-the-blink-of-an-eye-101072) (via search summary). **Status: largely eliminated as a tell**, though UQ's 2025 guidance still lists "unnatural blinking patterns" (below).
- Full Fact (Charlotte Green, 11 April 2025): "Fingers, arms, ears, toes and teeth are often parts of the body where errors may appear—sometimes the people depicted have too many, and other times not enough"; examples included a figure missing legs, "an unnaturally long foot which merged with the floor", and "a rifle which had barrels at both ends". Tools such as Grok, Sora and Runway add visible watermarks (croppable); Google products embed an invisible SynthID watermark. Full Fact says online "AI detector" tools have proven unreliable for its purposes. — [Full Fact guide](https://fullfact.org/blog/2025/apr/spotting-AI-content-guide/)
- Text on signs: OpenAI's March 2025 native 4o image generation was launched on accurate text rendering (signs, handwritten notes, infographics). — [OpenAI: Introducing 4o Image Generation](https://openai.com/index/introducing-4o-image-generation/); [Gizmochina, 28 Mar 2025: "almost flawless text"](https://www.gizmochina.com/2025/03/28/gpt-4o-can-now-generate-images-with-almost-flawless-text/). **Status: garbled text is no longer a reliable tell for current models.**
- Hands: comparisons in 2025 report GPT-4o renders hands consistently in pointing, grasping, waving and peace-sign poses. — [Opace Agency comparison](https://opace.agency/blog/best-ai-image-generation/) (agency blog, secondary). General guides say hands "are no longer a reliable way to detect AI-created images." — [search summaries of Popular Science and similar guides](https://www.popsci.com/diy/how-to-spot-ai-generated-images/) (not fetched)
- Leon Furze (19 Jan 2026): Google's Nano Banana Pro has "well and truly left the uncanny valley of glossy AI portraiture"; distorted hands, garbled text and odd facial features are largely resolved; Midjourney v7 and ChatGPT images still tend toward a glossy, over-posed, stereotyped look; SynthID watermarks can be lost through basic editing. — [Leon Furze, "Can you spot an AI generated image?"](https://leonfurze.com/2026/01/19/can-you-spot-an-ai-generated-image/)
- Sora 2 era video (late 2025): UQ's Dr Priyanka Singh lists unnatural blinking, lighting/shadow inconsistencies, overly smooth skin, distorted teeth or eyes, unusual reflections in glasses, audio out of sync with lip movement, and flat or robotic emotional expression; "Most tools work best on older or low-quality manipulations." — [UQ Contact magazine](https://stories.uq.edu.au/contact-magazine/how-to-spot-a-deepfake-video/index.html)
- Other 2025 video guidance: physically implausible motion (clothing blowing the wrong way, water behaving oddly, footsteps without matching shadows or ground contact); skin pores too smooth or "plastic"; hair unclean at the edges or moving uniformly; eyes "often make mistakes"; most AI video models don't generate clips longer than about 10 seconds without cuts; visible watermarks and the posting account's history are context clues. — [PCWorld](https://www.pcworld.com/article/3014659/social-media-is-being-slammed-by-deceptive-ai-videos-heres-how-to-spot-them.html); [Axios, 12 Oct 2025](https://www.axios.com/2025/10/12/spot-a-sora-fake); [Poynter](https://www.poynter.org/commentary/2025/sora-ai-slop-watermark/) (from search summaries; which claim belongs to which outlet was not verified individually)

### Inferences
- Status table for a 2026 rulebook (supported where cited above; the "game use" column is inference):

| Tell | Status 2025-26 | Game use at ~100x120 px |
|---|---|---|
| Wrong finger count on the hand holding the sign | Mostly fixed (GPT-4o, Nano Banana Pro) | Only as a joke about a cheap/old generator; very readable (count pixels) |
| Garbled text on the sign | Fixed for current models | Overlaps with existing sign rule; avoid as a humanity tell |
| No blinking | Fixed since ~2018-19, still listed by some guides | Already owned by the Living rule; do not reuse for AI |
| Catchlights differ between the two eyes (Hull 2024) | Research result with false positives/negatives | Readable: one white pixel top-left in one eye, bottom-right in the other |
| Earrings, glasses, moles, ears change between frames or between photo and frame | Consistency failure still used by fact-checkers and MIT cues | Best fit for three frames; the repo's Deepfake uses ears already |
| Lips/mouth don't match transcript (mouth closed in all frames while transcript shows speech) | Still listed (UQ 2025) | Readable: closed mouth + two lines of transcript |
| Shadow falls the wrong way / two light directions | Still listed | Hard at pixel scale; possible as a drop shadow on the opposite side |
| Object doesn't function (earring with no ear, glasses arm into hair, sign held by nothing) | Functional category (Kamali/Groh) | Very readable and funny: sign floating with no hand |
| Visible watermark in a corner | Real for Sora/Grok/Runway, croppable | Readable and deadpan: a tiny sparkle logo in a frame corner |

- For "one clue tied to one rule", the safest AI tell is a **cross-evidence contradiction** (something that is on in one frame and off in another). It is objective, doesn't depend on art quality, and uses the three-frame layout.

### Gaps
- No peer-reviewed 2025-2026 study was found measuring how often current generators (Nano Banana Pro, GPT Image, Sora 2, Veo 3) still produce eye-reflection mismatches or earring/ear inconsistencies; the Hull study predates them.
- Snopes' 2025 guide (paywalled, HTTP 402) and AFP/Reuters guides could not be read; their specific lists are missing.
- Whether "unnatural blinking" still appears in 2025 video models is contested between sources (UQ lists it; the 2018 tell is widely described as adapted-around); no quantitative evidence found.

## 3. Animals passing as people: still-frame giveaways

### Takeaway
There is little formal literature on this; the solid physical fact is eyeshine: cats, dogs, raccoons and many other mammals have a tapetum lucidum that makes pupils glow (often green/yellow) under flash, while humans have none and show red-eye instead. The comedic tradition is the "Totem Pole Trench": several small beings stacked in a trench coat and hat, betrayed by the verbal slip "two tickets, I mean one". Everything else (tail, paws, snout, fur at the cuffs) is common sense rather than sourced.

### Cited Findings
- The tapetum lucidum is a reflective layer behind the retina in many nocturnal animals; when light shines in, the pupil appears to glow ("eyeshine"), in colours including white, blue, green, yellow, pink and red; green eyeshine occurs in cats, dogs and raccoons. The human eye has no tapetum lucidum, so no eyeshine; human red-eye in flash photos is light reflecting off the blood-rich retina. — [Wikipedia: Tapetum lucidum](https://en.wikipedia.org/wiki/Tapetum_lucidum)
- Cats and dogs with blue eyes may show both eyeshine and red-eye; some blue-eyed dogs have no tapetum. — [Wikipedia: Tapetum lucidum](https://en.wikipedia.org/wiki/Tapetum_lucidum); [VCA Animal Hospitals](https://vcahospitals.com/shop/home/articles/why-do-pet-s-eyes-glow-in-the-dark)
- The "Totem Pole Trench" trope: two or more children stacked on each other's shoulders under a conspicuous trench coat (usually with a fedora) to pass as one adult; "usually a paper-thin disguise"; a common gag is the top one asking for "Two tickets—I mean one, please." Modern example: Vincent Adultman in *BoJack Horseman*; tabletop games use small creatures (goblins, halflings, kobolds). — [TV Tropes: Totem Pole Trench](https://tvtropes.org/pmwiki/pmwiki.php/Main/TotemPoleTrench) (via search summary; page returned 403); [RPGBot: Three Kobolds in a Trench Coat](https://rpgbot.net/three-kobolds-in-a-trench-coat-a-campaign/)

### Inferences
- Readable animal tells ranked for 100x120 px, most checkable first:
  1. **Eyeshine in the flash photo:** pupils drawn in bright green/yellow in the passport photo (which is plausibly taken with flash) vs a human's dark or red pupils. One rule sentence: "In the photo, the applicant's eyes do not glow." Innocent look-alike: a human with red-eye (red is fine), a human with green irises (the iris ring is green, the pupil is dark). Caution: at 100x120 px the eyes are only a few pixels, so the glow must fill the whole eye to read.
  2. **What holds the sign:** paws (no separate fingers, dark pads, claws) vs a human hand. Rule: "The sign is held by a human hand."
  3. **Tail** below the coat hem or a **snout** under a hat brim in any frame.
  4. **Totem-pole tells** in the transcript or frames: extra hand from the coat's middle button gap; three voices or "I mean one" in the transcript; the height/face changes between frames.
- Fur at the cuffs and animal ears are weak tells because the innocent look-alikes (fur-trimmed coat, cat-ear headband, animal-print clothing, a mascot costume) share them. Use them as red herrings, not as the planted clue.
- Repo tension: the design currently makes Gary (three raccoons) *valid* on day 7 because no rule forbids raccoons, and the week's last memo adds "applicants must not be raccoons" as next week's rule. A general "Rule 0: the applicant is human" would break that payoff unless Rule 0 is explicitly checkable only through the listed tells (and Gary has fixed them all by day 7). AGENTS.md requires asking before changing the rulebook.

### Gaps
- No academic or fact-checker source was found on how people identify animals disguised as humans; the tail/paw/snout list is inference.
- TV Tropes content could not be fetched directly (403); the trope description relies on search snippets.

## 4. Human look-alikes that must pass: masks, costumes, paint, prosthetics, pets

### Takeaway
Every look-alike case separates on one principle that ID-photo rules and PAD research both already use: judge the **face that is the person's own and visible** (chin to forehead, real eyes, a face that moves), and ignore what is **worn or held** as long as it does not cover that face. A mascot costume passes if a real, moving human face is visible in at least one piece of evidence; face paint, fake beards and cat ears pass because the face underneath is still visible and moves; a held pet passes because it is held, not holding the sign. The failing counterpart always hides or replaces the face, or is the only thing that moves.

### Cited Findings
- Masks work by having "close-fitting holes that match the topology of the face beneath", so the wearer's real eyes, nostrils and mouth show through; realistic masks can extend "below the collar without any joins." — [Sanders et al. 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5655619/)
- Mask faces show "blunted animacy": muted smiles and frowns, lost subtle expressions, attenuated movement and impaired lip-contact speech sounds. — [Sanders et al. 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5655619/)
- NIST's PAD evaluation separates impersonation (recreating someone else's face) from evasion (avoiding a match to your own face); both involve altering or covering the presented face. — [Paravision explainer](https://www.paravision.ai/news/understanding-nist-fate-presentation-attack-detection-pad/)
- MIT's Detect Fakes asks whether facial hair and moles "look real", i.e. added features are judged by whether they belong to the face. — [MIT Detect Fakes](https://www.media.mit.edu/projects/detect-fakes/overview/)
- US passport photos: head coverings allowed for religious or medical reasons if "your full face must still be visible from the bottom of the chin to the top of the forehead"; eyeglasses banned since 1 Nov 2016 except with a doctor's statement. — [travel.state.gov Passport Photos](https://travel.state.gov/content/travel/en/passports/how-apply/photos.html) (content via search summary; page returned 403)
- ICAO-based guidance: head coverings are permitted (for religious reasons) only when all facial features "from the chin to the forehead and the lateral contours of the face" remain recognisable; hair and glasses must not cover the face; ICAO 9303 does not require ears to be visible. — [PhotoCollect on ICAO standards](https://www.photocollect.io/en/faq/icao-standards) (secondary); [photogov on ICAO 9303](https://photogov.net/knowledge/standards/icao-9303-biometric-standards/) (secondary); [ICAO TR Portrait Quality v1.0](https://www.icao.int/sites/default/files/TRIP/Publications/TR-Portrait-Quality-v1.0.pdf) (primary, not fetched)

### Inferences
- Candidate one-sentence rulebook wording (for the design team to choose from; none is sourced text):
  - "The applicant is what is left when you take off what can be taken off." (Deadpan, but not directly checkable.)
  - More checkable: "The applicant's own face, from chin to forehead, is visible in the photo and moves in the video. Anything worn or held does not count, for or against."
  - For animals specifically: "Hats, coats, masks, paint and pets are not the applicant. Paws, tails and glowing eyes are."
- Pairing each failing tell with a passing look-alike (one visible difference each):

| Fails (planted clue) | Passes (look-alike) | The one checkable difference |
|---|---|---|
| Full rubber mask: face identical in all 3 frames, mouth closed while transcript shows speech | Face paint / clown makeup / fake beard | The painted face changes expression and the mouth opens between frames |
| Mask seam: colour step or edge at the neck/collar | Turtleneck or scarf | The scarf's edge is cloth pattern, and the face above it moves |
| Mascot costume with the head on in every frame and photo | Dave: mascot suit, head under his arm, human face visible | A human face appears in the photo or a frame |
| Printed face on a stick: paper border, thumb at edge, same pose | Person holding a framed photo of grandma next to their own face | Two faces: the applicant's moves, the held one doesn't; rule judges the face that says the phrase |
| Phone held up to the camera: bezel, moire stripes, battery icon | Person wearing glasses with a screen reflection | Glasses are on a moving face; the phone frames the whole face |
| Animal: paws hold the sign, glowing pupils in flash photo | Person holding a cat; cat has glowing eyes | The glowing eyes belong to the held animal, not the applicant; human hand holds the sign |
| Animal ears growing from the head with fur continuous to face | Cat-ear headband | The headband is a visible band across the hair |
| Tail visible below the coat | Person with a fox-tail keychain or costume tail | Rule on tails would need "attached to the applicant"; hard to show at low res, so avoid tails as the planted clue |
| Prosthetic hand holding the sign | Prosthetic hand holding the sign | Should PASS: a prosthetic is part of a human applicant; never use "hand looks artificial" as a tell (fairness risk) |

- Prosthetics, disabilities and unusual human features must never be the tell: a rule that fails a prosthetic limb or an unusual face would violate the design invariant that validity comes from evidence tied to a rule, and it would read as mocking real people. The ID-photo precedent helps here: standards regulate *covering* the face, not the shape of the person.

### Gaps
- No source was found giving an official or research rule for "costumes" as such; the State Department guidance surfaced only on hats, head coverings and glasses in the fetched summaries (the costume/uniform/camouflage line could not be verified because the page returned 403).
- No research found on prosthetics and liveness checks; the fairness point is an inference.

## 5. ID-photo standards as precedent for a rule sentence

### Takeaway
Both US and ICAO rules define the check as "the full face visible from the bottom of the chin to the top of the forehead" and allow head coverings only when that area stays uncovered, with religious/medical exceptions backed by a signed statement. That gives the game a real, deadpan template: the rulebook can name a face area and permit anything that doesn't cover it, plus a comic "signed statement" exception.

### Cited Findings
- US passport photos: no hat or head covering except for religious or medical purposes; applicants applying in person or by mail provide a signed statement about why; the full face must be visible from the bottom of the chin to the top of the forehead; per the search summary, the covering should be one colour without patterns. — [travel.state.gov Passport Photos](https://travel.state.gov/content/travel/en/passports/how-apply/photos.html) (search summary; direct fetch 403)
- US passport photos: eyeglasses prohibited since 1 November 2016 unless a doctor's signed statement explains they can't be removed for medical reasons. — [travel.state.gov Passport Photos](https://travel.state.gov/content/travel/en/passports/how-apply/photos.html) (search summary)
- ICAO Doc 9303 based guidance: head coverings only for religious reasons with all facial features chin-to-forehead and the lateral face contours recognisable; eyes clearly visible, no flash reflections on lenses, no tinted lenses; hair over the ears and earrings acceptable; ears need not be visible. — [PhotoCollect ICAO FAQ](https://www.photocollect.io/en/faq/icao-standards); [photogov ICAO 9303 guide](https://photogov.net/knowledge/standards/icao-9303-biometric-standards/) (secondary summaries of ICAO)
- The repo's own policy notes: the real Proof of Humanity policy requires photos facing the camera, no filters, no "flashy lipstick", no mirroring, and states "the chin is not considered part of the internal facial features". — `notes/game-design.md` (sources listed there: [PoH v1 registration policy](https://cdn.kleros.link/ipfs/Qmc7ag5XohnSAozvsKsLCUbvaFyasyLtyi3H7g3mmxznPU/proof-of-humanity-registry-policy.pdf))

### Inferences
- A ready-made rulebook phrasing that borrows the real wording: "The applicant's own face is visible from the bottom of the chin to the top of the forehead. Hats, headbands, ears and costumes are allowed if they cover none of it." This makes the cat-ear headband, the religious head covering, the new haircut and Dave (head off) pass, and a full mask or mascot head fail, all by one visible criterion.
- Comic precedent: the "signed statement" exception lets a character (e.g. a mascot who cannot remove the head) submit a doctor's note on the form, which could be a Papers, Please-style extra document.
- The chin-to-forehead area is about 40-60 px tall in a 100x120 portrait, so "is it covered" reads well at that size; finer checks (eye reflections) are 1-2 px and need exaggeration.

### Gaps
- The ICAO primary documents (Doc 9303 Part 3, TR Portrait Quality) were not fetched; ICAO wording above comes from secondary compliance sites.
- The State Department page itself could not be fetched (403); its exact wording on costumes, uniforms and face masks was not verified.
