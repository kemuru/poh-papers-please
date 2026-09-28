# Impostor arcs and fair detection: lessons for humanoid robot applicants

Scope note: researched 28 Sep 2026. Several fan wikis (Fandom, TV Tropes, Giant Bomb) blocked direct fetching (HTTP 402/403); where a fact comes only from a search-result summary of such a page, it is marked "(search snippet)". Steam forum material is marked "(forum-only)". Nothing here has been checked against the game builds themselves.

## 1. How detection games escalate tells, introduce new ones, and keep reveals satisfying rather than arbitrary

### Takeaway
The games that feel fair give the player one authoritative reference and binary, pointable facts to check against it (a stamp, a number, a phone that nobody answers, a missing permit). They get harder by making the fault subtler and adding more to check, not by making the truth unknowable. The complaints come when a tell turns into fine geometry ("the distance of the eyes from the side of his head"), or when a check can say "pass" and then be wrong. No, I'm Not a Human and Blade Runner (1997) chose ambiguity on purpose and got paranoia, but also "educated guesses rather than full deductions". That is the opposite of this game's "every challenge is a proof" invariant.

### Cited Findings
**That's Not My Neighbor (Nacho Sama, 2024)**
- Released 24 Feb 2024. It is set in 1955, where the "Doppelganger Detection Department" (D.D.D.) screens people entering an apartment building. Doppelgangers "take the appearance of already existing people". — [TNMN Wiki (search snippet)](https://thats-not-my-neighbor.fandom.com/wiki/That's_Not_My_Neighbor); [Doppelgangers page (search snippet)](https://thats-not-my-neighbor.fandom.com/wiki/Doppelgangers)
- The game has one ground truth: "The file folders are the only 100 percent correct source of information you are given" (photos, ID numbers, phone numbers, apartment, distinguishing features). The Daily Visitor List "will always be correct", and players can phone the apartment to check a visitor who isn't on the list. — [TheGamer guide](https://www.thegamer.com/thats-not-my-neighbor-all-neighbors-info/)
- "Some Doppelgangers will forge convincing documents that aren't easy fakes to catch", so the advice is "Never trust a visitor's documents unless you have double-checked them with the file folders." — [TheGamer](https://www.thegamer.com/thats-not-my-neighbor-all-neighbors-info/)
- Escalation: the quality of impersonation runs "from small differences like missing or misplaced moles to blatantly obvious Facial Horror". In Nightmare Mode the doppelgangers "will inevitably make errors in their disguises, but… the discrepancies are very subtle". In the later Arcade and Nightmare modes, obvious monsters appear less often and are "replaced by mimics that require forensic-level attention to detail". — [TV Tropes / fan wiki (search snippet)](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/ThatsNotMyNeighbor); [Medium review (search snippet)](https://medium.com/@dsibe.top/review-of-thats-not-my-neighbor-unraveling-the-paranoia-7ca493183b65)
- Residents' details are randomized each day, so "you can never simply memorize patterns". — [Medium review (search snippet)](https://medium.com/@dsibe.top/review-of-thats-not-my-neighbor-unraveling-the-paranoia-7ca493183b65)
- Valid look-alikes are written into the reference material: resident Mclooy Rudboys "ALWAYS wears a hat", and two real neighbours (Francis Mosses, Anastacha Mikaelys) share "tired eyes" and both say "mmm", which the developer confirmed. — [TheGamer](https://www.thegamer.com/thats-not-my-neighbor-all-neighbors-info/)
- Fairness complaints (forum-only): "They have the ID, entry paper, on the list. Everything matches up… I can't even tell them to take off the hat." / "It's kind of killing the fun of the game when they get into details that small." One player found the tell in "the distance of the eyes from the side of his head… eyes aren't parallel to the end of his mouth". The tells players called reliable were binary: calling the residence (doppelgangers can't answer), stamp and logo accuracy, the dossier photo against the ID, and expiry dates. Players were split on whether the hyper-subtle cases were fair. — [Steam: "Too identical?" (forum-only)](https://steamcommunity.com/app/3431040/discussions/0/550107357479186440/)

**Papers, Please (Lucas Pope, 2013)**
- Pope on scheduling rules: "I tried very hard to not introduce new rules through the bulletin on a day when someone (guard, supervisor, investigator) talks to you in the morning." Also: "adding even one little encounter or rule would blow out all the scheduling for the rest of the game… the entire game teeters on this complicated network of dependencies." — [Game Developer, "Designing the bleak genius of Papers, Please"](https://www.gamedeveloper.com/design/designing-the-bleak-genius-of-i-papers-please-i-)
- Pope on readability: "If there were gobs of 3D assets or voice overs or exciting cutscenes, it'd be a lot harder to maintain these nuances." He also "worked hard to reduce the amount of dialog, keep things ambiguous… rely on the player's imagination". — [Game Developer](https://www.gamedeveloper.com/design/designing-the-bleak-genius-of-i-papers-please-i-)
- Pope on the ramp: "You get sucked into it as it grows more and more complex." — [Game Developer, Road to the IGF (search snippet)](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)
- (Already in `notes/game-design.md` and not re-verified here: Pope found that more faults per entrant made the game easier, and that the game was "broken and unfun" without immediate feedback.)

**No, I'm Not a Human (Trioskaz / Critical Reflex, 15 Sep 2025)**
- The signs of a Visitor are announced each day on TV ("flawless white teeth, dirt under the fingernails, and bloodshot eyes"). The system is ambiguous on purpose: Visitors may lack the traits, humans may have some, and guests can refuse to be examined. Most identities are randomized per playthrough, but some NPCs are always human or always Visitor. Metacritic 76; 1 million copies sold by 19 Mar 2026. — [Wikipedia](https://en.wikipedia.org/wiki/No,_I%27m_Not_a_Human)
- Reviewer: "Each trait has to be tested separately, and each test takes up an energy point." Also: "even after testing positive for one characteristic, it's entirely possible that person is not a Visitor… you are making educated guesses rather than full deductions… an intentional design choice to keep up your paranoia." The review also criticizes that identities survive a reload, which lets players "cheese the game". — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/5252/no-im-not-a-human)
- A developer interview with VGTimes does not discuss the design of the signs; I found no developer statement on fairness. — [VGTimes interview](https://vgtimes.com/vgtimes-interviews/137161-big-interview-with-the-developer-of-no-im-not-a-human-how-the-game-was-created-who-the-guests-are-and-what-the-main-plot-is-really-about.html)

**Blade Runner (Westwood, 1997)**
- Of 15 suspects, only Clovis and Zuben are always replicants. "Which of the other thirteen characters is a replicant is randomized every time… and their behavior is different each playthrough based upon whether or not they are human." — [Wikipedia](https://en.wikipedia.org/wiki/Blade_Runner_(1997_video_game))
- The Voight-Kampff test is an instrument with needles: "The further the top needle moves to the right, the more likely the subject is a human; the further the bottom needle moves to the right, the more likely they are replicant." If you "push the subject too far, by asking too many high intensity questions, the test will end before a definite result". — [Wikipedia](https://en.wikipedia.org/wiki/Blade_Runner_(1997_video_game))
- GameSpot's Ron Dulin: "To justify the number of wildly different endings, the designers have tried to keep some elements of the story very vague." — [Wikipedia (quoting GameSpot)](https://en.wikipedia.org/wiki/Blade_Runner_(1997_video_game))

**The Thing (2002)**
- Every NPC has a trust level (red, amber, green, 100%), and a blood-test hypo checks whether someone is an imitation. — [The Thing wiki: fear/trust (search snippet)](https://thething.fandom.com/wiki/Fear/trust_system); [Blood Test Hypo (search snippet)](https://thething.fandom.com/wiki/Blood_Test_Hypo)
- Criticism: the infection system "proved to be wholly inconsistent when an NPC character turned out to be a Thing mere moments after passing a blood test", because some infections were scripted. — search summary attributed to retrospective reviews ([Jimquisition](https://www.thejimquisition.com/post/the-thing-remastered-trust-issues-review), [Bloody Disgusting](https://bloody-disgusting.com/video-games/3720430/the-thing-video-game-2002-replaying-20th-anniversary/)); I did not read the exact wording on either page.

**Among Us**
- "Visual tasks" (tasks with a visible animation) act as hard proof that a player is innocent, and some players argue they unbalance the game in the crew's favour. — [Among Us wiki forum (search snippet, forum-only)](https://among-us.fandom.com/f/t/Visual%20tasks)

**Detroit: Become Human (fiction)**
- The in-world "American Androids Act" requires androids to wear an LED on the right temple and a blue armband. Deviants who want to pass as human remove the LED, which "can be cut or leveraged off with any sharp object". The LED's colour and flicker show the android's processing load and stress. — [Detroit wiki: LED (search snippet)](https://detroit-become-human.fandom.com/wiki/LED); [American Androids Act (search snippet)](https://detroit-become-human.fandom.com/wiki/American_Androids_Act)

**I'm Not a Robot (Neal Agarwal, 2025)**
- A browser game of 48 CAPTCHA levels that escalate from picking images to logic puzzles and algebra. — [neal.fun](https://neal.fun/not-a-robot/); [GameSpew (search snippet)](https://www.gamespew.com/2025/09/im-not-a-robot/)
- Aftermath (Isaiah Colbert, 22 Sep 2025): "I discovered that I am a fallible human being and not nearly as good at logic puzzles as I'd hoped." He calls being human "failing creatively, overlooking crucial details". — [Aftermath](https://aftermath.site/i-am-not-a-robot-captcha-puzzle-game/)
- GameSpew: "when it becomes hard, it loses its charm." — [GameSpew (search snippet)](https://www.gamespew.com/2025/09/im-not-a-robot/)

### Inferences
- **Keep TNMN's structure, cut its Nightmare mode.** The part that works is one authoritative source (dossier, list) plus binary checks. The part that failed with players is tells at the level of facial geometry. For this game, the robot's clue should be a named, pointable fact in the video strip or papers ("a status light in frame 2", "frames 1 and 3 identical to the pixel", "no blink"), never "his face is slightly off".
- **Never let a check lie.** The Thing's "passed the blood test, then turned" is what "how was I supposed to know?" looks like. If a robot passes Rule 0 on some day, it must be because it really breaks no rule in force that day, never because the clue was hidden.
- **Ambiguity is a different genre.** No, I'm Not a Human and Blade Runner make paranoia the point and accept guesswork. This game's invariant ("every challenge is a proof") rules that out. Borrow only the look-alike idea (humans with robot-ish traits) and let the evidence settle every case.
- **Change the rules on quiet days.** Pope held back new rules on days when someone talked to the player in the morning. The same applies here: the robot's new trick shouldn't land on a day that already loads the player heavily (the day-5 Sybil Farm, for example) unless the trick is the thing that shows off the new rule.
- **Keep a hard-evidence channel.** Visual tasks in Among Us and phone calls in TNMN show that players value one channel that settles the question outright. In this game that channel is the video strip under Rule 0 and Rule 6. The robot's tell belongs there, not in the portrait at the window.

### Gaps
- I found no first-party design commentary from Nacho Sama (TNMN) or Trioskaz on how tells were tuned. The TNMN devlog "About the Remake" covers release logistics only ([itch.io devlog](https://nachogames.itch.io/thats-not-my-neighbor/devlog/916136/about-the-remake)).
- TNMN's schedule for introducing new check items day by day could not be verified; the wiki pages were blocked.
- No Unfortunate Spacemen or Werewolf sources were fetched, so I make no claims about them.
- Not researched: Detroit's gameplay reveals, and whether players found them satisfying.

## 2. Keeping a recurring impostor (or a model line of identical units) memorable across days without absurdity

### Takeaway
Jorji works because each visit is one step better prepared and fails on something checkable. Then, once, he is fully correct, and the player who denies him out of habit is punished. Fiction about passing machines keeps coming back to three grounded tells: a mandatory machine marker that gets removed or hidden (Detroit's LED, Humans' eye colour), a perceptual or verbal blind spot (Westworld's "doesn't look like anything to me"), and mass production (identical units). A deadpan robot line can be recurring through firmware updates that patch yesterday's failure, which is how deepfakes really learned to blink.

### Cited Findings
**Jorji Costava (Papers, Please)**
- Day 3: he arrives with no passport, claiming "Arstotzka so great, passport not required", and leaves when questioned. Then comes a crayon-drawn passport from "Cobrastan" (issuing city "Bestburg", passport number "1234-OKOK", sex "MEN", marked "Pre-Approved", with a dashed "STAMP HERE" box). On day 6 he has a real passport but no entry permit. — [Papers Please Wiki / Villains Wiki (search snippet)](https://papersplease.fandom.com/wiki/Jorji_Costava). Conflict: one snippet puts the crayon passport on day 4. I could not open the wiki to confirm.
- Approving the crayon passport earns a citation: "Cobrastan is not a real country." — [TV Tropes (search snippet)](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/PapersPlease)
- Day 11: Jorji "will have all of the correct documents with no errors or discrepancies". If approved, he gives the inspector an Obristan token. If denied, he "will finally snap and get angry, leaving forever", and the inspector is cited "for denying an applicant cleared for entry". — [Papers Please Wiki: Day 11 (search snippet)](https://papersplease.fandom.com/wiki/Day_11); [PSNProfiles: Obristan Token trophy](https://psnprofiles.com/trophy/7023-papers-please/4-obristan-token)
- "An unsuspecting player might give him a denial stamp anyway since they've come to expect it as the default answer." Even when denied or detained, he "maintains a positive attitude and sympathizes with the perceived difficulty of the inspector's job". — [TV Tropes Characters (search snippet)](https://tvtropes.org/pmwiki/pmwiki.php/Characters/PapersPlease)

**Humans (Channel 4, fiction)**
- Conscious synths have bright green eyes. Niska wears blue contacts to pass as human and lives as one. Later, new "safe" unconscious synths get orange eyes, and "Green Eyes" become something schoolchildren are taught to fear. — [Humans wiki: Niska (search snippet)](https://humans-on-amc.fandom.com/wiki/Niska); [Channel 4: Series Three synopsis](https://www.channel4.com/press/news/humans-series-three-synopsis)

**Westworld (fiction)**
- Hosts are programmed not to perceive things that would threaten their cover story ("Doesn't look like anything to me"): photographs, anachronistic objects, the park staff. — [Star Myths essay (blog)](https://www.starmythworld.com/mathisencorollary/2018/6/19/it-doesnt-look-like-anything-to-me-). This source is weak; the line itself is well known from the show.

**Detroit: Become Human (fiction)**
- A legal marker (temple LED plus armband) exists so that androids can be told from humans. Removing it is the deviant's way to pass. — [Detroit wiki: LED (search snippet)](https://detroit-become-human.fandom.com/wiki/LED)

**How a real "disguise" improved: deepfakes and blinking**
- Siwei Lyu (The Conversation, 29 Aug 2018): humans blink "somewhere between every 2 and 10 seconds", each blink lasting "between one-tenth and four-tenths of a second". Early deepfakes "blink a lot less frequent" because training photos rarely show closed eyes. "Blinking can be added to deepfake videos by including face images with closed eyes or using video sequences for training", and "people who want to confuse the public will get better at making false videos". — [The Conversation](https://theconversation.com/detecting-deepfake-videos-in-the-blink-of-an-eye-101072); [arXiv 1806.02877](https://arxiv.org/abs/1806.02877)

**Real humanoids really are mass-produced with one face and one look**
- 1X NEO is a single 5'6" design. 1X began production in Hayward, California, with first deliveries to private customers planned by the end of 2026. — [heise](https://www.heise.de/en/news/1X-to-deliver-humanoid-household-robot-Neo-to-US-customers-in-2026-11287205.html); [eWeek](https://www.eweek.com/news/1x-neo-humanoid-home-robot-2026/)
- Figure 03 (announced 9 Oct 2025) uses "soft washable textiles instead of exposed machined parts". — [TIME Best Inventions 2025](https://time.com/collections/best-inventions-2025/7318493/figure-03/) (feature details via search snippet)

### Inferences
- **A model line, not one mascot.** Several units of one fictional humanoid model share one face. That makes Rule 5 (no duplicate face) the natural late catch, and on the day it lands the Gazette can report the line's sales, which is deadpan and real (mass production is the point of NEO and Figure). It also echoes the Sybil Farm without repeating it: the Farm is people pretending to be several; the units are one product pretending to be one person each.
- **Jorji's arc becomes firmware.** Each day the unit returns with a changelog that fixes what caught it yesterday (the "not" in the phrase, then a real photo, then a hand-written sign, then a voucher). It trips on today's rule, exactly like Gary. Rule 0 stays the constant catch, but its clue gets subtler through the week (see question 3). The deepfake blink history gives the arc a real precedent, and the Rule 6 row in `notes/game-design.md` already cites it.
- **Keep Jorji's day 11.** The strongest moment in his arc is the visit where he is legitimate. For robots, the equivalent is a human who is mistaken for the robot line. Candidates: the unit's human operator or its owner in person, a human with a prosthetic hand, or someone who was in the robot's advertising. Their evidence is clean under Rule 0, and challenging them out of habit earns a citation. This fits the look-alike invariant.
- **Grounded tells, fiction-tested.** A status light (Detroit's LED, and the real 1X light in question 4), a removed marker (a small scar or mark at the temple where a light used to be), coloured contacts (Humans), and a blind spot in speech (Westworld) are all realistic and deadpan. The blind spot has to be a checkable transcript fault under Rule 1, such as "humanoid" for "human" or a skipped "not", and never a vibe.
- **Tone.** Jorji's cheerfulness is what makes him lovable. A robot's equivalent is sincere, polite, customer-service courtesy that never admits anything. That is closer to the realism the owner wants than a costume gag.

### Gaps
- Not researched with citations: Ex Machina, Severance-style corporate deadpan, and Westworld's reuse of host faces. I make no claims about them here.
- No source found on how often Papers, Please's recurring characters appear per day, or whether Pope tuned Jorji's visits deliberately.

## 3. Balancing difficulty: frequency, subtlety at low resolution, and whether a tell should coincide with another rule

### Takeaway
The evidence points to a few robots and many look-alikes. The subtlety curve should run from obvious to small, but always to a named binary fact visible at the game's resolution, never to fine geometry. And a machine's tell should sometimes coincide with the day's rule (a missing blink, a phrase slip), so the non-human is catchable on two rules, as Gary and the Agent already are.

### Cited Findings
- In TNMN's later modes, obvious monsters appear less often and subtle mimics take their place. — [search snippet summarizing TNMN reviews and wiki](https://medium.com/@dsibe.top/review-of-thats-not-my-neighbor-unraveling-the-paranoia-7ca493183b65)
- Players were split: some accepted TNMN's hyper-subtle facial tells as deliberate difficulty, while others said they were "killing the fun". The reliable tells were the binary ones (phone, stamps, dossier photo, dates). — [Steam: "Too identical?" (forum-only)](https://steamcommunity.com/app/3431040/discussions/0/550107357479186440/)
- In No, I'm Not a Human, signs that humans can also have, plus limited tests, produce "educated guesses rather than full deductions", which is deliberate. — [Adventure Game Hotspot](https://adventuregamehotspot.com/review/5252/no-im-not-a-human)
- In I'm Not a Robot, a humanity test that outgrows human skill stops being funny: "when it becomes hard, it loses its charm." — [GameSpew (search snippet)](https://www.gamespew.com/2025/09/im-not-a-robot/)
- In real deepfakes, not blinking was the first reliable tell (Lyu's method reached "an over 95 percent detection rate"), and it was expected to be patched. — [The Conversation](https://theconversation.com/detecting-deepfake-videos-in-the-blink-of-an-eye-101072)
- A normal blink comes every 2 to 10 seconds and lasts 0.1 to 0.4 seconds. — [The Conversation](https://theconversation.com/detecting-deepfake-videos-in-the-blink-of-an-eye-101072)
- In Blade Runner (1997), randomizing who is a replicant meant keeping the story "very vague" (GameSpot). — [Wikipedia](https://en.wikipedia.org/wiki/Blade_Runner_(1997_video_game))

### Inferences
- **Frequency.** At about 65 to 75% valid (per `notes/game-design.md`), one robot a day is enough for a recurring line, plus at least one robot-ish human who is valid. More robots than look-alikes would teach "anything uncanny is a robot" and break "appearance never decides". The Farm on day 5 shows that several units on one day can work, but only when the rule of the day, Rule 5, is exactly what catches them.
- **A subtlety ladder that stays fair at 3-frame low resolution** (each rung is a fact the player can point to, and each is a proposal, not a decision):
  1. Days 1 and 2: blatant but realistic. A charging port or a panel seam at the neck is visible in every frame, and the Rule 0 memo names "a person, not a machine".
  2. Days 3 and 4: in one frame only, when the head turns, a status light shows at the ear or temple.
  3. Days 5 and 6: the tell moves to an existing hard check. Units share one face (Rule 5), or frames 1 and 3 are identical because the unit holds perfectly still, which Rule 0 already treats as "a picture, not a person".
  4. Day 7: perfect under Rules 1 to 6, caught only by the smallest Rule 0 fact, mirroring Gary on day 7.

  The rule to keep: the tell shrinks in size, never in certainty. Whatever it is, the inspect UI must be able to highlight it as "this, against that rule".
- **Coinciding tells.** Letting the robot also fail the day's new rule (a missing blink on day 6, "humanoid" for "human" in the phrase on day 1) keeps it Jorji-like and gives each new rule a first offender. But one invalid applicant must never depend on two subtle clues at once: the second rule is a bonus route to the right answer, not a requirement. This matches the existing exception in `notes/game-design.md` ("Gary and the Agent break one more rule as well, so they can be caught on either").
- **The blink look-alike.** Given the 2 to 10 second blink interval, three frames could easily show no blink for a real human. The rulebook's own definition (a blink shown as closed eyes in one frame) is what settles it. Valid humans in the generator must always show one, or the rule wrongs real people. Nervous Nigel already covers the opposite case.
- **Look-alikes to consider** (each settled by the evidence): a human with a prosthetic arm; a very still, very polite human; a human in a branded robot-company uniform (the operator); a human who wears a smartwatch light in frame; a real twin pair (already in the cast) against the identical units.

### Gaps
- I found no published study or developer data on the minimum pixel size at which a visual tell stays fair. Owner playtesting with screenshots is the only evidence available.
- No source gives the doppelganger-to-resident ratio in TNMN, or the Visitor ratio in No, I'm Not a Human.

## 4. Grounding the satire in 2025–2026 reality: home humanoids, agents with wallets, proof of personhood

### Takeaway
Reality already supplies deadpan material. Home humanoids launched in late 2025 with a human teleoperator behind the hard tasks and a light that shows when one is connected. Tesla's robots at a 2024 event were human-operated, and one said it was "assisted by a human". In March 2026, World (Sam Altman's project) shipped a way for one iris-verified human to vouch for any number of AI agents: "One person could run thousands of agents". A robot applicant that says, sincerely, that it is "backed by a unique human" is quoting 2026 industry language, not a joke.

### Cited Findings
**Home humanoids**
- 1X announced NEO on 28 Oct 2025 as "the world's first consumer-ready humanoid robot designed to transform life at home", priced at $20,000 for early access or $499 a month, with deliveries in 2026. — [The Robot Report](https://www.therobotreport.com/1x-announces-pre-order-launch-neo-humanoid-robot/); [1X product page](https://www.1x.tech/discover/neo-home-robot)
- NEO's "Expert Mode": for harder chores, a 1X employee in a VR headset operates the robot remotely during windows the owner schedules, seeing through its cameras. 1X says sessions need owner approval, people can be blurred, US-based employees do the operating, and "the robot's ear-ring light changes when a session is active". These safeguards are company claims that nobody has independently audited. — [Tom's Guide](https://www.tomsguide.com/home/smart-home/the-neo-home-robot-thats-breaking-the-internet-promises-to-change-the-world-but-theres-one-huge-problem); [Humanoids Daily](https://www.humanoidsdaily.com/news/1x-neo-launch-sparks-debate-on-autonomy-and-teleoperation); [ThePlanetTools (search snippet)](https://theplanettools.ai/blog/1x-neo-first-consumer-humanoid-dated-priced-teleop-caveat-may-2026). All of these via search snippets; I did not read the pages in full.
- Figure 03 (9 Oct 2025) was Figure's first humanoid designed for homes as well as work, and it was named one of TIME's Best Inventions of 2025. — [TIME](https://time.com/7324233/figure-03-robot-humanoid-reveal/); [TIME Best Inventions](https://time.com/collections/best-inventions-2025/7318493/figure-03/). A search snippet also says BMW announced on 25 Jun 2026 that Figure 03 would start work at Plant Spartanburg. — [RoboZaps (search snippet, unverified)](https://blog.robozaps.com/b/figure-03-review)
- At Tesla's "We, Robot" event (October 2024), the Optimus robots that served drinks and chatted "relied on tele-ops (human intervention)" (Morgan Stanley's Adam Jonas). Bloomberg sources said "employees stationed remotely oversaw many of the interactions", and an Optimus bartender acknowledged on video that it was "assisted by a human". — [TechCrunch, 14 Oct 2024](https://techcrunch.com/2024/10/14/tesla-optimus-bots-were-controlled-by-humans-during-the-we-robot-event)

**AI agents with wallets and proof of personhood**
- On 17 Mar 2026, World launched AgentKit with Coinbase's x402 payments. It lets verified World ID holders "delegate their World IDs to AI agents", so agents "carry cryptographic proof they are backed by a unique human". A human may delegate to "as many agents as they want". World's DC Builder: "One person could run thousands of agents that all pay small fees." Coinbase's Erik Reppel: agents as "legitimate economic participants". World counted 17,912,203 verified humans at the time. — [CoinDesk](https://www.coindesk.com/tech/2026/03/17/sam-altman-s-world-teams-up-with-coinbase-to-prove-there-is-a-real-person-behind-every-ai-transaction); [The Register, "scan eyeballs to tie identity to AI agents"](https://www.theregister.com/2026/03/17/worldcoin_identity_ai_agents_whatever/)
- In April 2026, World ID announced partners including Docusign, Okta, Tinder, Vercel and Zoom, and a lighter "Selfie Check" alternative to the Orb. — [BusinessWire, 17 Apr 2026](https://www.businesswire.com/news/home/20260417530721/en/The-New-World-ID-Proof-of-Human-for-the-AI-Era-Scales-Across-the-Digital-Platforms-People-and-Businesses-Use-Every-Day); [Computerworld](https://www.computerworld.com/article/4160511/world-id-expands-its-proof-of-human-vision-for-the-ai-era.html)
- Human Passport (formerly Gitcoin Passport) was acquired by the Holonym Foundation in December 2024. It cites Imperva's 2025 Bad Bot Report: automated traffic was 51% of internet activity in 2024. — [human.tech blog](https://human.tech/blog/human-passport-proof-of-personhood-and-sybil-resistance-for-web3) (the Imperva figure is second-hand)
- Kleros describes Proof of Humanity as a registry that lets applications "distinguish real humans from bots, duplicate accounts, and autonomous agents". — [Kleros docs](https://docs.kleros.io/products/proof-of-humanity)

### Inferences
- **The robot's motive should be the Agent's motive, made physical.** It comes for the Humanity Day income on behalf of an owner or manufacturer. The real sybil logic is World's own sentence, "One person could run thousands of agents", and the registry exists to stop exactly that. The Gazette can run it straight.
- **"Assisted by a human" is a ready-made deadpan defence**, and it maps onto a rule. The real policy requires "a real human and not a computer-generated person or avatar". A teleoperated robot is not the human, however human its operator. The court's ruling can say so in one dry line, and the operator can appear separately as the valid look-alike (see question 2).
- **The status light has real precedent.** A temple or ear light that shows only when the head turns, or only while an operator is connected (1X's own "ear-ring light changes when a session is active"), is a realistic, deadpan, pointable Rule 0 clue. Detroit fans will recognise it, but the grounding is the real product, not the fiction.
- **Avoid dating.** Name no real company or product in game text (the project already bans brand names and trends of the moment). Use fictional model names, and keep the behaviour (teleoperation, delegation, a light that changes) rather than the brands.

### Gaps
- I did not verify whether NEO deliveries actually began before 28 Sep 2026. Sources from May 2026 still said "by the end of 2026".
- Not researched: regulations that require AI or robot disclosure (for example, EU AI Act transparency duties), which could ground an in-game "robots must declare themselves" memo.
- The Imperva bot-traffic statistic is cited second-hand through human.tech; I did not read Imperva's report.
