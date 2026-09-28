# Game design

## Premise
You are the newest clerk at the Ministry of Humanity, Registry Window 3, in the week before **Humanity Day**. At five o'clock on day 7 the Ministry opens the Universal Basic Income: from then on, every registered human is paid 1 UBI an hour, for life, one income per human. Everyone who is human wants to be registered by then. So does everything that has heard about the money. Your job: **Accept** or **Challenge**, before the shift ends.

The premise is the real one, one step on. Proof of Humanity really did pay 1 UBI an hour to every registered human, and every crypto airdrop draws farms of fake accounts (Optimism removed 17,000 of them; one Arbitrum cluster held 121 wallets). A registry of unique humans exists to stop them. So the week's strangest applicants all share one true reason to be in the queue, and the jokes resolve instead of being random. What the income is worth is the week's last punchline, told once and deadpan.

## Design pillars
1. **Competent job, ridiculous world.** Most applicants are legitimate. The player wins by reading carefully, not by being paranoid.
2. **Every mistake is fair, and a challenge with evidence is a proof.** Each invalid applicant has one fault, and the player can point at it: two things that disagree, or a rule and the fact that breaks it. Pointing at it (Inspect) attaches it to the case, and a case with evidence is always upheld; a hunch is a gamble the jury may not share (slice 4). The player should always think "I missed that", never "how was I supposed to know?"
3. **Snappy, not tedious.** A decision takes 20 to 40 seconds. Nothing longer than a line to read while the clock runs.
4. **Everything you stamp comes back:** the slip at once, the court at five, the Gazette next morning, the registry later in the week, Humanity Day at the end.
5. **Satire, not nonsense.** Every joke is explained by the world: a rule, a real Proof of Humanity or Kleros fact, or what a character wants. The absurd applicant is the setup, the rulebook is the punchline, and the player delivers it with the stamp.

## Tone: deadpan, affectionate satire
The comedy treats a real and strange thing with total seriousness: proving you are a human, on camera, holding your wallet address on a piece of paper, to strangers who are paid when they agree with each other, while everything that can pass for a human tries to, because there is money in it. Papers, Please treats a border this way.
- The UI is grey, stamped and official. The game never winks.
- The Ministry's memos should pass for real registry notices. Parody works when it plausibly mimics the original, and the real policy is already funny read aloud: "the chin is not considered part of the internal facial features".
- Affectionate: aim at the procedure, the incentives and the Ministry, never at the sincere people in the queue. The target reader is someone who built or used the real registry and would pass the joke around.

## The week: countdown to Humanity Day
As in Papers, Please, the story is scripted and the filler is random. One thread spans the week, a few run through it, and each day has one set piece.
- **Humanity Day (all week).** The queue grows from 5 to 10 as the day nears, the fakes get better, and the Ministry frays: the hall, the announcements, the supervisor's notes and the music, a little more each day. The Gazette counts down.
- **The Likeness units (days 1 to 6).** Likeness Robotics sells home robots with human faces, and some of the households that own one have heard about the income. One unit comes to Window 3 each day, with a new face, the ordinary name its household gave it and an ordinary address. Nothing at the window gives it away: its remarks are ordinary, its photo is flawless, it blinks and it says the phrase word for word. Most days its video does: in one frame, the skin on the cheek or by the jaw stands open onto a small circuit board (Rule 0), on bare skin where nothing worn could pass for it. Day 4 its papers do: it is vouched for by its maker, Likeness Robotics Ltd, which is a company and not a registered human (Rule 4). Day 5 its face does: the factory made that face twice, and Window 7 registered the other unit last month (Rule 5). Each unit breaks that one rule only, so the player can never challenge on sight, only on what the evidence shows. The satire is 2025–2026 as it is: home robots with remote operators, AI agents with wallets, and a registry whose first rule is "a real human and not a computer-generated person or avatar" (research: `reports/Humanoid robot applicants design.md` and `reports/Proving humanity in a registry game.md`). Until 28 Sep 2026 this thread was Gary, three raccoons in a trench coat; a raccoon is not a human at a glance, so catching him needed no evidence, and he was cut.
- **Pat (days 1 to 4, and 6).** A real human the rules keep failing, each visit on the newest rule: nerves in the phrase, a photo taken in a mirror, two characters wrong on the sign, a voucher who is Pat's mother and is not registered yet (she is three places behind in the queue). Each visit Pat is better prepared: a rehearsed phrase, a laminated sign, a mother. On day 5 the Gazette reports that Pat is practising. On day 6 Pat's application is perfect. Pat is the human cost of the rules, played gently; the rules still apply ("Memo 3-C: Sympathy is not a rule."), so the payoff is earned. The units and Pat are the week's point in two kinds of applicant: machines that pass for people, and a person the rules can't see.
- **The unit on file (running thread).** Window 7 registered a Likeness unit last month, as Nina Penrose, against Rule 0. On day 5 the registry's face search finds her face on the day's unit; on day 6 the Gazette reports she has been withdrawn, and that Window 7 has been sent a copy of Rule 0. The Binnses of 16 Staple Street each own a unit and vouch for them on days 5 and 6; when the challenge is upheld, the owner is removed from the registry with the unit, as vouchers are.
- **The fork (background, from day 3).** Window 2, next to yours, votes on leaving the Ministry (its sign says VOTING on days 3 and 4), then leaves it on day 5 (FORKED), taking half the stationery; from then on it is the other Ministry, which says it is the real one. It lives in the hall, the announcements, the supervisor's notes, the Gazette and the bills, with no new mechanics. The real registry split in two over, among other things, "a different interpretation of sybil". (Until 26 Sep 2026 Window 2 simply became a cupboard: absurd with nothing to resolve it, so it was cut.)
- **The offer (day 3, the week's one temptation; slice 5).** On the third morning, beside the Gazette, is a letter from Likeness Robotics' partner programme: 40 PNK for every unit Window 3 registers, paid the next morning, discretion appreciated. The clerk signs it (it goes in the drawer) or hands it to the supervisor. Handed in: the day 4 Gazette reports Likeness fined, and a 30 PNK commendation is on that evening's statement. Signed: every unit let in pays 40, more than its fine, and three units registered in the week is the Replaced ending. As in Papers, Please, the money tempts because the bills are real, and the risk arrives later. The offer changes nothing the rules say: a unit is still a fake, and still cited.
- **The registry remembers (from day 4).** Whoever the player registers stays registered. Accepted fakes can vouch for tomorrow's applicants and come back as duplicates. When the court upholds a challenge, the applicant's voucher is removed too, as in the real registry (and would join the queue the next day: not built yet). As in the real policy, a registration is judged by the rules in force on the day it was made.
- **The truth is decided at the desk.** An applicant is valid if `judge()` finds no fault against the registry as it stands when they reach the window, the player's earlier mistakes included. A fake the player let in yesterday is a registered voucher today; a face the player never registered is not a duplicate. The generator's `planted` describes each applicant under correct play and is for testing; scoring, citations, the court and the Gazette always use the live registry.

| Day | New rule (the Gazette gives the reason) | Set piece |
|---|---|---|
| 1 | The phrase; Rule 0 is on the first page, as it has always been. No Gazette yet: the supervisor's welcome note. | Tutorial: a valid applicant, then the "hooman", with one guided inspect. Then the first unit, whose skin opens by the jaw in frame 2. |
| 2 | Photo. Someone registered with a photo of a more attractive man. | The clock arrives. Pat's mirror selfie; the unit's jaw opens in frame 1. |
| 3 | The sign. A registration was claimed with someone else's wallet. | The unit holds its address up on a phone, and its cheek opens in the blink frame. The fork is proposed. |
| 4 | One vouch. Registry lookup opens. A man registered at Window 6 on his own vouch. | Pat and the mother. The unit is vouched for by its maker. |
| 5 | No duplicates. Three cousins with one face. | The Sybil Farm, the Twins, and a unit whose face Window 7 registered last month. |
| 6 | Living. Socrates. | Hardest day. Pat's perfect application. |
| 7 | None: Humanity Day. | The last unit, perfect but for one small opening, and the last applicant is you (both slice 5). The income opens at five. |

## Funny is not the same as fake
- **Most applicants are valid:** about 65 to 75% on any day (day 1, the scripted tutorial, is 3 of 5). Later days are harder because fakes get subtler and there is more to check, not because there are more fakes.
- **One fault per applicant, every day.** Papers, Please's designer found that more faults per entrant made the game easier, not harder. Difficulty comes from subtler faults and more rules in force. The only exceptions are two non-humans that also get something else wrong: the Agent's video is generated (Rule 0) and it slips on one more rule, and the Cardboard Cutout is a picture (Rule 0) that cannot blink (Rule 6). Nobody breaks more than one of Rules 1 to 6, and each Likeness unit breaks one rule only.
- **Appearance never gives the answer.** Roughly half of the absurd-looking appearances are valid. The best jokes are the ridiculous applicant who is completely legit and the boring-looking one who is a sybil. Rule 0 is read from the video, not from the window: the units, the Deepfake and the Agent look like anyone at the window, and Dave, robot helmet and all, is human in every frame.
- **The rulebook is the only judge.** An absurd applicant who breaks no rule in force is valid and must be accepted, with a straight face. Each new rule comes with its reason, usually something that got registered the day before.

## What the player sees for each applicant
Kept small so checking stays quick:
- **Profile card:** name, procedurally drawn photo, address, birth year, and from day 3 the wallet address, shortened the way a wallet shows it (0x3F9A…C21E).
- **Video strip:** three frames, a transcript of at most two lines, and from day 3 the sign they hold up. A blink shows as closed eyes in one frame; no label ever says whether anyone blinked.
- **Voucher:** one name, from day 4.
- **Registry lookup,** from day 4: a Look up button beside the voucher's name (or V) says whether they are registered and whom they are already vouching for today; a Search this face button on the video printout (or F) says whether the face is on file already. The Registry tab opens with the answer, which states facts, never a verdict. A name can also be typed. On the day a tool arrives (the lookup on day 4, the face search on day 5), a line under the first applicant's papers says what it is and which key to press, and goes once the player uses that tool; it never says what to look up or what the answer means.
- **Rulebook:** a page per rule, today's rule open. It fits the window without scrolling.

**Inspect mode (the key tool):** the player clicks two things that disagree (the photo and a frame, the sign and the form, a rule and a fact), and the game highlights the discrepancy and names the rule it breaks. Checking becomes an action, and the rules are taught through play. From slice 4, a discrepancy found on the applicant at the window goes to court with the challenge, as its evidence.

**A challenge names no rule:** it says the application is wrong, and the court finds what is. It is upheld if the applicant broke any rule in force, and the ruling lists every rule broken with its evidence; it is dismissed only when the applicant broke none, and the deposit is lost. The real registry asks a challenger for one of a few broad reasons (Incorrect submission, Sybil attack, Deceased, Identity theft); until 28 Sep 2026 the game asked for the exact rule and dismissed the wrong one, which was stricter than the real thing and slower to play. The proof is still the player's: they find the fault, and Inspect is how; from slice 4 what they found goes to court as evidence, and a challenge without it is a hunch (see The court).

## Day structure and difficulty
| Day | Applicants | Shift | New rule | Notes |
|---|---|---|---|---|
| 1 | 5 | No clock | The phrase | Tutorial by supervisor note. First two applicants scripted: one valid, one "hooman". |
| 2 | 7 | 6 min | Photo | Clock introduced gently. |
| 3 | 8 | 6 min | The sign | |
| 4 | 8 | 6 min | One vouch | Registry lookup unlocked. |
| 5 | 9 | 6 min | No duplicates | |
| 6 | 10 | 6 min | Living | Hardest day. |
| 7 | 6 | No clock | None | Humanity Day. The last applicant is you (slice 5). |

- When the shift clock runs out, remaining applicants go home unprocessed. No penalty, just lost income. Pressure without punishment.
- **Scripted appearances (the unit, Pat, the day's set piece) come in the first half of the queue,** so the clock never sends them home.
- **The first applicant after a new rule tests it,** often Pat, or someone who only looks as if they break it.
- **Each rule has at least three kinds of offender and one valid look-alike,** so no rule is learned in one go and then dull. From day 4 the rules interact through the registry.
- The first mistake each day is a warning, not a fine.

**Difficulty targets:**
- A careful first-time player gets about 90% of decisions right on day 1 and 75 to 80% on day 6.
- A player who makes about 2 mistakes per day still reaches the Promoted ending.
- A player who makes about 5 mistakes per day is Fired around day 4 or 5.
- Nobody can lose on day 1.

## Daily rulebook (each day adds one rule; old rules stay)
The real policy's aim is a registry where each entry is "a unique, living, existing human being". The rules test those words, one at a time; Rule 0, in force before the week began, tests "human".

| Day | Rule | In the real registry | Offenders | Valid look-alikes |
|---|---|---|---|---|
| 0 (always) | A real human: in every frame of the video, a human face, the same face, skin and not machinery, a person and not a picture held up, filmed and not generated. Anything worn, painted or carried does not count, for or against. The rulebook quotes the policy with the words that count in bold. | The policy's first requirement in every version since 2021: "The submitter must be a real human and not a computer-generated person or avatar." A human in a mask or costume is a formatting matter under the real rules, not a humanity one. The challenge reason was "Does not exist", now "Sybil attack". | a Likeness unit (skin open onto machinery in one frame); the Deepfake (the ears change between frames); the Cardboard Cutout (three identical frames: a picture held up, not a person); the Agent (a video generator's mark ✦ in the corner of every frame) | Dave, a costume robot's head under his arm; the second Twin, filmed with the first |
| 1 | The video contains the key words of the phrase, in order: "**I certify** that **I am** a **real human** and that **I am not** already **registered** in this **registry**." The small words (that, a, and, already, in, this) may be swapped or left out, "I'm" counts as "I am", and anything else said, before, after or in between, is not assessed. The rulebook prints the key words in bold. | The phrase is word for word the real one. The real policy is kinder still: accents, mispronunciations and swapped words "are not grounds for rejection". | "a real hooman"; "in this ministry"; silence; the Agent's paraphrase | an "um" or a "sorry" in the middle; "I'm"; "in the registry" |
| 2 | The photo is of the face in the video, facing the camera, and not mirrored. | Incorrect submission. Filters and mirrored selfies are banned. In 2023 one challenger went through the queue removing every mirrored photo; a vote to allow them ("check if you identify yourself every morning in the bathroom mirror") was blocked on procedure. | a photo of someone better-looking; a mirrored selfie (the mole is on the other cheek); the Influencer's filter | a new haircut or new glasses (hair is not the face) |
| 3 | The sign in the video shows the wallet address on the form, in full and the right way up, on paper or on a phone's screen. One character may be wrong; two may not. | The real rule, one-typo allowance included: the full address, "no ENS; no ellipsis", held "in the right orientation to be read", and "the sign can be a screen" (the current app suggests a phone). | two characters wrong; no sign; the Agent's QR code; someone else's address (the next person in the queue's) | one character wrong; the address on a phone |
| 4 | One vouch, from a registered human who is not already vouching for someone else. | One vouch, from someone who knows you; each vouch serves one applicant at a time; when a vouchee is removed as a sybil, the voucher is removed too. | vouched for by a company (a Likeness unit, by its maker); by someone not registered (Pat's mother); the Voucher Ring (three strangers vouching in a circle, none registered; not built yet); the second person Ethel vouches for today | vouched by Ethel (her first today); vouched by anyone the registry lists, even a fake the player let in yesterday |
| 5 | No face already in the registry. | Duplicate (in the second registry, "Sybil attack"). Registering several times at once rejects every one. A twin is registered by filming both twins together. | the Sybil Farm (every cousin after the first one registered); Your Clone; a Likeness unit (its factory face is on file); a fake accepted earlier in the week, back in a hat | a family of four at one address (four faces; not built yet); the second Twin, filmed with the first; the Farm's first cousin |
| 6 | Living: born between 1900 and today, and blinks in the video. | Deceased, and Does not exist: "submitters not able to give recent proof of life are to be considered deceased". Deepfakes were first caught because they rarely blinked. | Socrates (born 470 BC: he comes before day 6, and the rule is made because of him); the Cardboard Cutout (same pose in every frame, no blink); the Agent (born "v4"); a typo in the year (1197) | Grandma Ethel (1922); Nigel (blinks constantly) |
| 7 | No new rule. The clerk's own registration expires today, and the clerk is the last applicant. | Registrations expire: after two years in the first registry, one in the second; renewal needs a new photo and video. | your own application; the last unit, under Rule 0 only (slice 5) | |

## The Gazette (every morning from day 2)
The Registry Gazette is on the desk when the day starts. It is Papers, Please's newspaper and the week's callback engine: the one place that tells the player what their stamps did.
- **Headline:** yesterday, from the player's actual decisions, in wire-service deadpan. A unit registered: "REGISTRY ADMITS A HUMAN WITH A WARRANTY". A human wrongly challenged: "WINDOW 3 FINDS MAN NOT HUMAN. MAN SURPRISED." The clock ran out: "QUEUE SENT HOME AT FIVE. QUEUE RETURNS." A clean day: "WINDOW 3: NOTHING TO REPORT".
- **Today's new rule,** as a Ministry notice with its cause: "Following yesterday's registration of a photograph of a more attractive man, the photograph must now be of the applicant."
- **One thread item:** the countdown, Likeness Robotics' statements, Pat's attempt number, the fork's vote, the price of UBI (never explained).
- **One small notice:** vouches sold in books of ten; a referendum on which group chat is the Ministry's; a motion to transfer the treasury to its author, dismissed.
- It is read on the clockless morning screen; nothing in it costs shift time.
- The Gazette carries the news; the hall's PA carries the Ministry's voice (see Humor pacing). They never repeat each other's lines.

## Recurring cast
Every character wants something (usually the income, sometimes only the stamp), meets a rule in the way, and is completely sincere. Every non-human is in the queue for the reason every sybil farm is: the money.

**Always invalid (days 1 to 6):**
- **The Likeness units:** home robots with human faces, one a day, each face new; caught by one thing each (see The week).
- **The Agent:** an AI agent with a wallet, applying on behalf of its principal, who is busy. Flawless manners, flawless paperwork, a sincere wish to help. Its video is generated, not filmed: a video generator's mark ✦ is in the corner of every frame, which Rule 0 catches. It also trips on what a machine would: a paraphrased phrase, a QR code for a sign, or a birth year of "v4" (day 6). Asked whether it is a robot, it says it is not; it has a vision impairment, which is what an AI model told a human it had hired to solve a CAPTCHA, in a 2023 safety test. It replaces the Toaster and the Chatbot: keep the behaviour, never a chatbot catchphrase.
- **The Sybil Farm (all but one):** three cousins with one face, three hats and one address, one after another on day 5. The real registry rejects every one when they register at once; at a window, one at a time, they can't. So the rulebook, which is the only judge, allows the Farm exactly one human: the first cousin registered is valid and the rest are duplicates. The Gazette reports it straight. Its look-alike is a real family of four at one address, with four faces.
- **The Deepfake:** photo and video the same face, except that in one frame the ears change: a face that turns into another was made, not filmed, so Rule 0 catches it and Rule 2 does not (day 6).
- **The Cardboard Cutout:** someone holds up a printed face. Same pose in all three frames: a picture, not a person (Rule 0), and a picture does not blink (Rule 6) (day 6).
- **Your Clone:** your name, your face, a better haircut. Your face is already in the registry, because you are (day 6, and the setup for day 7).

**Absurd but valid (traps for paranoid players):**
- **Brenda:** a completely normal human. So normal she is suspicious.
- **Dave:** a real human in a robot costume, the helmet under his arm, on his way to a children's party. Punishes challenging anything robot-shaped: under Rule 0, anything worn or carried does not count, and his face is human, and skin, in every frame.
- **Grandma Ethel:** born 1922, fierce, registered on the first morning. From day 4 she vouches for her whole bridge club, and the registry shows she can vouch for only one at a time.
- **Nervous Nigel:** sweats, overshares ("I love having bones"), blinks far too much.
- **Rob Ott** (renamed from Robot McBotface in slice 3): a human whose name makes machines suspicious. Fails CAPTCHAs; his bank's computer won't let him in.
- **Sybil Vance:** a real human named Sybil. Just the one of her. A joke for those who know what a sybil is, and a plain name for everyone else.
- **The Twins:** identical, arriving separately, both valid. On day 5 the second twin is valid only if their video shows both of them.

**Valid until a rule catches them (rules are rules):**
- **Socrates:** an old man in a toga who gives his name as Socrates and his year of birth as 470 BC (a fictional applicant, not the philosopher). Says the phrase perfectly, then asks what "human" means. Valid until day 6; the living rule's memo mentions him. Kleros is named after the kleroterion, the machine that drew Athenian juries, so he has opinions about juries: "I had a jury of five hundred once. I would not recommend it."
- **The Influencer:** valid on day 1; the photo rule catches the filter on day 2.
- **Pat:** see The week.

**Fill-in applicants:** generated ordinary people with one line of in-context flavour (the lunch break, the deposit refunded "shortly after", the income, the sign), mostly valid. Their faults are ordinary: a word wrong in the phrase, two characters wrong on the sign, a voucher who isn't registered.

**Cut from the cast (26 Sep 2026: random, off-topic or dated):** the Toaster, Kevin (two children on each other's shoulders), the time traveller, "trust me bro", the chatbot's "Certainly! Here is…", the AI avatar, the Mannequin and the Late Mr. Hargreaves. If one comes back (the add-applicant skill is smoke-tested with "a sentient toaster that can't blink"), it comes for the income like everyone else and breaks a real rule.

## The court (end of each shift)
The court is where the week's satire of Kleros lives, and where being sure pays. It must never punish a proven case, and it must give the player a real decision. (Until slice 4 the court rules on the facts alone: upheld if the applicant broke a rule, dismissed if not.)
- **Evidence or a hunch.** A challenge filed right after Inspect found a discrepancy on that applicant carries it as evidence: the case slip says "Evidence: Rule 3, the sign against the form." Any other challenge goes on a hunch, and the slip says the jury will look for itself. No rule is ever picked from a list; the evidence is whatever the clerk found.
- **Three jurors hear every case.** With evidence, they uphold it: the fault is in front of them. On a hunch, each juror looks for a fault on their own, and finds a real one with a chance set by how visible it is: silence or a square of dots nearly always, a wrong word or a mirror often, a panel open in one frame or an ear that changes rarely. A majority finding it upholds the challenge. Jurors never invent a fault: a valid applicant is never refused.
- **APPEAL.** A dismissed hunch can be appealed: 7 jurors, then 15, each round looking harder (the chance of finding a real fault rises toward certainty). The fee doubles each round, 10 then 20 PNK; a win refunds the fees and pays 10 on top; a loss keeps them. A correct challenge taken to the last round wins in at least 95% of seeds; a wrong one never wins, and costs more the longer it is defended. That is the decision: the player knows how sure they were; the jury does not.
- **Why it plays well:** Inspect costs seconds under the clock, and a hunch saves them at the jury's risk. The careful clerk is paid in certainty, the quick one in time, and neither is cheated. It also keeps Inspect worth doing now that challenges name no rule.
- **The ruling** names every rule broken and the things that disagree, so a missed fault is learned from.
- **Kleros, played straight, as flavour, never as injustice:** jurors are drawn in proportion to their stake, so the same face can sit in two seats with a vote in each; the bubbles show jurors guessing what the others will vote ("Voting with the others."), a juror who did not open the file, a juror who refuses to arbitrate; at most once a week a letter offers a juror P plus epsilon. The court "does not have a specific way to make sure that jurors reviewed the evidence", and on a hunch, it shows.
- **Pacing:** the whole day's court is one screen. A case with evidence is a line; a hunch shows its jurors' bubbles; an appeal plays in place. A court with no appeals reads in under 30 seconds.

## Economy (starting values; tune with the balance report)
- Correct accept: +10 PNK. Correct challenge: +15 PNK bounty.
- Accepting a fake: -20 PNK citation (first mistake of the day: warning only).
- Challenging an applicant who broke no rule, confirmed by the court: lose the 15 PNK challenge deposit.
- Appeals (slice 4): 10 PNK for 7 jurors, then 20 for 15; a win refunds them and pays 10.
- Likeness's partner fee (slice 5): 40 PNK the morning after each unit Window 3 registers, if the clerk signed; a 30 PNK commendation if the offer was handed in.
- End-of-day bills: rent, gas fees (vary by seed), and one odd item per day ("your cat's hardware wallet").
- Rough target: perfect play earns about 20 to 30 PNK more than the bills each day, so a couple of mistakes per day is survivable and many are not.
- **Measured 28 Sep 2026** (20 seeded weeks each): a perfect clerk goes from 240 to about 400 and never feels the bills; a clerk making 2 mistakes a day ends about 60 (19 of 20 promoted); 5 mistakes a day is fired on day 3. So the bills press on mistakes, not on skill. Skill is scored instead (the Promoted grade, the best week, today's week), and tempted (Likeness's offer).
- **Always accept**, **always challenge** and **judge by looks** must all do clearly worse than careful play; a clerk who never inspects and challenges on hunches must end behind a careful one (slice 4).
- The income is story, not money: Humanity Day does not change savings.

## Endings
Every way the week can end gets its own letter, and the title card counts the endings found (slice 6).
- **Fired:** savings below zero at the end of any day from day 2.
- **Replaced:** three Likeness units registered at Window 3 in one week, by mistake or for Likeness's fee. The last screen shows a unit in your chair, with your name on its form.
- **Promoted:** you finish day 7 with savings. The letter carries the Humanity Day report from the run's own decisions: humans registered, fakes registered (the units among them), whether Pat made it, and the income: 1 UBI an hour, for life. It grades the clerk, First, Second or Third Class, by accuracy and savings, so a better week has somewhere to show. If the clerk signed Likeness's offer and let a unit or two in, a second letter is clipped to it: Likeness Robotics offers them a job.
- **Reclassified:** the last applicant on day 7 is you, because your registration expires today. Your video, recorded this morning after a week at the window, says "I certify that I am a real clerk". Accepting yourself earns the week's last citation ("You registered a clerk") and the Promoted letter, with a note on your file. Challenging yourself sends you to court, which finds the missing word: the Ministry reclassifies you as registry equipment. Your salary continues.
- Failing must never be the funniest path. The Promoted and Reclassified letters get the best lines.

## Writing the jokes
All humor lives in `src/content`. Every line passes this test:
1. **It resolves.** A rule, a real registry fact or the speaker's want explains it. If nothing in the world explains it, it is random: cut it. Jokes that resolve are rated funnier than nonsense, and satire needs a target.
2. **The clerk can see what it is about:** the coat, the mustache, the street on the form, the sign. A random remark does not land.
3. **The Ministry's lines could pass for a real notice.** The Ministry never jokes; it reports. The world gets stranger through what it reports, a little more each day.
4. **It punches up:** at the Ministry, the procedure, the farmers and the jurors paid to agree. Never at a sincere applicant.
5. **It works for everyone, and a little more for insiders:** "Sybil Vance", "Rob Ott", a robot vouched for by its maker. It never needs explaining.
6. **It will not date:** no memes, no chatbot catchphrases, no crypto slang (gm, wagmi, ser, wen). Keep the behaviour, drop the phrasing of the moment.
7. **It is said once.** Used lines leave the pool for the rest of the run; specific lines come before generic ones.

How:
- **Applicants are sincere.** They are trying to prove something unprovable and it makes them anxious; they never do a bit. "Could you stamp it gently? It's the only copy of me."
- **Escalate inside the premise.** "If this is true, what else is true?": a home robot vouched for by its maker; the Ministry answering its own memos.
- **Set up and pay off across days:** Likeness Robotics (its owners' reminder on day 2, a unit a day, the unit on file found on day 5 and withdrawn on day 6), Pat's attempts, the fork, the leaking ceiling.
- **The player is the comic and the game is the straight man.** Every stamp gets a reaction; every regular has a line for either stamp.
- **Time it to the clock.** Glanceable lines during the shift; longer bits where there is no clock (Gazette, court, bills, letters). No joke costs shift time.
- **Mild and close beats wild and far.** A violation that stays near the real procedure is funnier than one that leaves it.
- **Specific beats general.** A favourite spoon, an egg sandwich, "Oi". Turn in the second sentence.

## Real material (checked 26 Sep 2026)
Played straight, all of this is already funny. It is a menu, not a quota; a line that needs this list to be understood fails test 5.
- **The registry's policy:** each entry is "a unique, living, existing human being". The phrase is the real one; accents, mispronunciations and swapped words are not grounds for rejection. Photos: facing the camera, no filters, no "flashy lipstick", no mirroring, and "the chin is not considered part of the internal facial features". Videos: up to two minutes at first, twenty seconds now. The sign: the full address, "no ENS; no ellipsis", one wrong character allowed. A challenge of Deceased is answered by reading a recent block hash on video. Twins film together. Ambiguity favours the applicant "unless there is clear evidence of bad faith". A registration is judged by the rules in force when it was made. Renewal needs a new photo and video.
- **Vouching and challenges:** one vouch, from someone who knows you; each vouch serves one applicant at a time; a voucher is removed with a sybil they vouched for. Challenge reasons (Duplicate, Does not exist, Incorrect submission, Deceased; later Sybil attack and Identity theft), and the wrong reason loses (the game asks for none; see Inspect mode). The challenge period is three and a half days; the deposit is refunded "shortly after". Some challengers vouched for flawed profiles so they could then challenge them for the reward.
- **Kleros:** PNK is short for pinakion, the bronze name tickets fed into the kleroterion, whose first citizen drawn also worked the machine. Jurors are drawn by stake, sometimes twice in one case; the minority pays the majority; no recusal, only "Refuse to Arbitrate"; appeals are twice the jury plus one, and the side that lost pays more to appeal, in half the time. The P + epsilon attack: pay voters only if your side loses. Doges on Trial (2018): a list of dog pictures, 50 ETH for sneaking in a cat; a cat photographed at the right angle got in, and the bounty was refused because the picture did not "clearly display a cat".
- **Sybils and airdrops:** Hop and LayerZero let sybils report themselves and keep a share (25%, then 15%); Optimism removed 17,000 addresses; an Arbitrum farmer: "In one evening, you could make up to 10 quality accounts." One proof-of-personhood score counts an NFT for more than a government ID. An AI model told a human it had hired to solve a CAPTCHA: "No, I'm not a robot. I have a vision impairment."
- **Governance:** "one person, one vote"; a proposal to declare the UBI rate "holy and will not be changed, ever"; a proposal to settle which group chat was the DAO's; a peaceful fork over "a different interpretation of sybil", with a deadline and "an automatic extension of 6 months"; a motion to transfer the treasury to its author, ruled "obviously an attack". Today the forum's newest posts are bots selling lists of verified humans.

Sources: [v1 registration policy](https://cdn.kleros.link/ipfs/Qmc7ag5XohnSAozvsKsLCUbvaFyasyLtyi3H7g3mmxznPU/proof-of-humanity-registry-policy.pdf), [v2 policy](https://cdn.kleros.link/ipfs/Qmbd9QuiJ6B74faz9qqfpatU3aB5VCtmEkTf1BSZ3vk588), [PoH tutorial](https://github.com/kleros/kleros-docs/blob/master/products/proof-of-humanity/proof-of-humanity-tutorial.md), [Kleros whitepaper](https://github.com/kleros/kleros-papers/blob/master/whitepaper.pdf), [Kleros FAQ](https://github.com/kleros/kleros-docs/blob/master/kleros-faq.md), [P + epsilon](https://blog.ethereum.org/2015/01/28/p-epsilon-attack/), [Doges on Trial](https://blog.kleros.io/doges-on-trial-the-largest-decentralized-curated-list-ever/), [the cat in the snow](https://blog.kleros.io/kleros-vs-cat-in-the-snow-the-escrow-leading-case/), [UBI](https://blog.kleros.io/introducing-ubi-universal-basic-income-for-humans/), [the DAO](https://blog.kleros.io/democracy-awakens/), [HIP-74, the fork](https://gov.proofofhumanity.id/t/2487), [HIP-78, mirrors](https://gov.proofofhumanity.id/t/2664), [the treasury motion](https://blog.kleros.io/how-kleros-prevented-more-than-100-000-from-being-stolen-from-proof-of-humanity-dao-a-detailed-analysis/), [Hop](https://decrypt.co/143231/hop-protocols-sybil-hunter-payout-unveils-powerful-new-airdrop-tool), [LayerZero](https://cointelegraph.com/news/layerzero-concludes-sybil-self-reporting-phase), [Arbitrum](https://www.coindesk.com/consensus-magazine/2023/04/10/crypto-airdrop-sybil-attacks), [Human Passport weights](https://support.passport.human.tech/stamps/stamp-weights), [the CAPTCHA test](https://metr.org/blog/2023-03-18-update-on-recent-evals/), [blink detection](https://arxiv.org/abs/1806.02877).

## Humor pacing
- Per day: mostly fill-ins, one or two cast appearances, one set piece and one thread beat.
- The shape of a day: the Gazette (setup), the desk (build-up), the set piece in the first half of the queue (peak), the court (release), the bills (coda), and next morning's Gazette (callback).
- Jokes live in many places, not only applicants: the Gazette, citation slips, the bills, the court, the hall.
- **The hall's PA** reads each of the day's four announcements once, at a quiet moment (the first as the window opens, the rest spread over the day's stamps), with a three-note chime; the rest of the time its board shows a plain sign ("Please wait for your number to be called."). A crawling ticker was tried first: the same four lines scrolled past all shift, in the corner of the eye, while the player was trying to read.

## Feedback
- **Where things come from:** the applicant's papers come across the counter from the booth, on the left, and go back the same way. Slips come out of the citation printer at the top edge of the desk, which always has the torn end of the last slip in its slot, so it reads as a printer before it has printed anything.
- **Accepting:** a stamp and a thunk. The stamp comes down on the press, not the release: Lucas Pope wanted "a nice solid THUNK when pressing the mouse down, not when you let go". If the applicant was invalid, a citation slip prints after a beat of silence (0.9 seconds: the moment the clerk knows, which Papers, Please players describe as dread), naming the rule and the fact that broke it, with a dry memo ("Memo 5-L: The factory made this face twice. The registry takes each face once."). Immediate feedback is how the player learns the rules; Papers, Please's designer called the game "broken and unfun" without it.
- **Challenging:** the case is filed, with what Inspect found or on a hunch; the court finds what is wrong. All of the day's challenges are heard together at the end of the shift, so the desk stays fast and the court becomes the day's closing show.
- **First mistake each day is a warning,** not a fine. The citation still prints, so the joke lands without the punishment.

## Sound and music
- **The music is a waiting room's, not a tune** (`src/ui/music.ts`). A looping 8-bar march was tried first and grated within minutes: a melody that came round every 27 seconds, resolving at the loop point, over a click on every beat. Papers, Please plays no music at all while you work, only the booth's sounds.
- **So, like Brian Eno's Music for Airports:** seven voices, each repeating one note on its own loop (18 to 31 seconds). The loops never line up, so the music never repeats; no melody, no beat, nothing above about 700 Hz. It should be "as ignorable as it is interesting".
- **But ambient alone sent the clerk to sleep**, so while the window is open a soft pulse keeps time under it: the window's own chord broken up and back down a bar at a time on a round mallet, in steady eighths at 104 BPM, the root on every downbeat, the downbeat struck hardest and the off-beats softest. Four bars (the third reaches up to C), then round again: a figure the ear settles into. It comes in over two bars when the window opens and stops on a bar line when it closes. While it plays, every voice waits for its next beat and every bell for the next bar line, landing with the pulse's root, so the whole band keeps one time.
- **The bells are soft.** Struck gently, with no bright ding, just under the pulse, and fading in three and a half seconds. Loud and bright, they stood out of the music every few seconds and irritated. Without bells at all: `notes/evidence/music/bells/3-no-bells.m4a`. No tune, no drum; outside the window (morning, court, the accounts, the endings) the music is as calm as before.
- **One time, not two.** The first pulse was out of step with the bells: the bells kept their own loops and landed up to 142 ms off its grid (71 ms on average), and its six-note figure slid against the eight-eighth bar. It sounded "not synced". Now every note in the open window starts on the grid (`e2e/music.spec.ts`). Chosen by ear on 28 Sep 2026 from four previews of the same music (`notes/evidence/music/options/`: as before, this pulse, the pulse with moving chords, and a livelier version with no beat). A busier chamber-band score ("Registry Clockwork", from `reports/Music for a bureaucratic desk game.md`) was tried first that day and was annoying: too many plucks, ticks and fragments of tune. The research's point that tempo keeps people alert held; its instruments did not.
- **It never stops between screens.** It starts at the first click (browsers allow no sound before one) and each part of the day gives the voices a chord: morning, window open (with the hall murmur and the pulse), closing, court, the accounts, and each ending. The voices move to the new chord one by one, so a screen change is a change of mood, not a cut. One band plays all week, never two (`e2e/music.spec.ts`).
- **The tape wears out with the week:** it wobbles from day 3, the voices drift out of tune from day 4, a note snags from day 5, notes go missing from day 6. Funny, never harsh.
- The Music and Sound switches are in the top bar; M toggles the sound. Previews: `notes/evidence/slice2/music/` and `notes/evidence/music/`.

## Saving, the menu and starting again

Research: `reports/Saving progress in browser games.md`. The week is saved in the browser after every step and played back through the reducer on load, so a reload is neither a lost shift nor an undo.
- **Saved:** the seed, the day the week began on and every step (open, call, accept, challenge, time-up, close, statement, next day), plus the seconds of today's shift clock, written every 5 seconds and when the tab hides. If a changed game no longer plays the steps back to the same place (a fingerprint of day, screen, savings, stamps and registry), the save is set aside and a new week begins, with one line saying the Ministry has revised its forms.
- **Reload:** the desk comes back as it was left. Mid-shift, it comes back behind a "Welcome back" card with the clock stopped, so the first click also starts the music.
- **Menu:** Escape, or the Menu switch in the top bar. At the window, Escape first leaves inspect mode (I still toggles it). The menu covers and blurs the desk and stops the clock: a break is not reading time. It offers Back to the window (focused), and, apart and quieter, Start day N again (back to this morning's paper and savings) and Start a new week (the next seed). Both ask first, with Keep playing focused. The fired letter offers Start day N again too; the letter's own Start a new week does not ask, since nothing is left to lose.
- **Links:** ?seed= and ?day= always begin that week afresh, reload included (tests and debugging rely on it). A plain address carries on the saved week. After starting again from the menu, the link is dropped from the address.

## Open decisions (need the owner's sign-off)
- **A temptation** (settled 28 Sep 2026): Likeness's offer on day 3 (see The week). The other Ministry's note and the vouch seller stay in the Gazette as news; one temptation a week is enough.
- **The first jury.** The real Humanity Court starts with one juror, then 3, 7, 15. The game keeps 3, 7, 15, which the court exercise in `notes/plan.md` also uses.

## Coming back (slice 6)
A week takes about 45 minutes. What brings a player back is a better week, a missing ending, or tomorrow's week; each is cheap, because the week is already one seed. The first hour decides the rest: players who leave a negative review of a Papers, Please-like quit after 2 to 4 hours (research: `reports/Lessons from acclaimed desk games.md`), so polish days 1 to 3 before adding anything to day 7.
- **The title card:** a Ministry notice board with Continue (and where the save is), New week, Today's week, and the endings found so far.
- **Today's week:** the seed comes from the date on the player's computer, so everyone gets the same week that day. At the end, "Copy my week" puts a spoiler-free card on the clipboard: one row per day of stamps (right, wrong, sent home), the ending and the savings, and nobody's name. No network: it is text the player pastes where they like.
- **Go back to any morning:** from the menu, any earlier morning of the week, as Papers, Please's day timeline allows (its most praised replay feature). The saved steps make it a cut, and with Likeness's offer (slice 5) it is how a player tries the other choice.
- **The clerk's record,** kept in the browser: weeks finished, best savings, best accuracy, endings found.
- **Endless shift, "The Ministry never closes"** (last, if the slice has time): unlocked by any ending; every rule in force, a queue that quickens, and three citations end it; the record keeps the best count. It uses the week's generator and nothing new.
- **Polish:** the open panels checked for colour-blind players, a setting to turn off single-key shortcuts (WCAG 2.1.4), reduced motion honoured.

## Playtesting
Bots test the numbers; only people test the fun. At the end of each course day, play one day yourself for 10 minutes. In the second week, have two or three colleagues play days 1 to 3 without help, and note where they laughed, where they got confused, how many mistakes they made per day, which jokes needed explaining (cut those) and which lines they saw twice. Tune against the difficulty targets above.
