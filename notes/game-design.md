# Game design

## Premise
You are the newest clerk at the Ministry of Humanity, Registry Window 3, in the week before **Humanity Day**. At five o'clock on day 7 the Ministry opens the Universal Basic Income: from then on, every registered human is paid 1 UBI an hour, for life, one income per human. Everyone who is human wants to be registered by then. So does everything that has heard about the money. Your job: **Accept** or **Challenge**, before the shift ends.

The premise is the real one, one step on. Proof of Humanity really did pay 1 UBI an hour to every registered human, and every crypto airdrop draws farms of fake accounts (Optimism removed 17,000 of them; one Arbitrum cluster held 121 wallets). A registry of unique humans exists to stop them. So the week's strangest applicants all share one true reason to be in the queue, and the jokes resolve instead of being random. What the income is worth is the week's last punchline, told once and deadpan.

## Design pillars
1. **Competent job, ridiculous world.** Most applicants are legitimate. The player wins by reading carefully, not by being paranoid.
2. **Every mistake is fair, and every challenge is a proof.** Each invalid applicant has exactly one fault, and the player can point at it: two things that disagree, or a rule and the fact that breaks it. The player should always think "I missed that", never "how was I supposed to know?"
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
- **Gary (days 1 to 7).** Three raccoons in one trench coat, after one humanity and three shares of the income. Like Jorji in Papers, Please, he is one rule behind: each day he has fixed what caught him yesterday and trips on today's new rule, so the player often sees a rule broken for the first time by Gary. He takes rejection cheerfully and has a line for either stamp. On day 7, with no new rule, his application is perfect, and the rulebook, which is the only judge, says three raccoons must be registered. Kleros has form here: its first public list was of dog pictures, with a bounty for sneaking a cat in, and a cat photographed from the right angle got in. The week's last memo adds a rule for next week: applicants must not be raccoons.
- **Pat (days 1 to 4, and 6).** A real human the rules keep failing, each visit on the newest rule: nerves in the phrase, a photo taken in a mirror, two characters wrong on the sign, a voucher who is Pat's mother and is not registered yet (she is three places behind in the queue). Each visit Pat is better prepared: a rehearsed phrase, a laminated sign, a mother. On day 5 the Gazette reports that Pat is practising. On day 6 Pat's application is perfect. Pat is the human cost of the rules, played gently; the rules still apply ("Memo 3-C: Sympathy is not a rule."), so the payoff is earned. Gary and Pat are the week's point in two characters: a raccoon who learns the rules and a human the rules can't see.
- **Doug (running gag).** The raccoon at the bottom of Gary. Heard on day 3 ("Doug, stop it"), found on day 5 (he registered himself at another window last month, so Gary's face is a duplicate), reported in the Gazette on day 7.
- **The fork (background, from day 3).** Window 2, next to yours, votes on leaving the Ministry (its sign says VOTING on days 3 and 4), then leaves it on day 5 (FORKED), taking half the stationery; from then on it is the other Ministry, which says it is the real one. It lives in the hall, the announcements, the supervisor's notes, the Gazette and the bills, with no new mechanics. The real registry split in two over, among other things, "a different interpretation of sybil". (Until 26 Sep 2026 Window 2 simply became a cupboard: absurd with nothing to resolve it, so it was cut.)
- **The registry remembers (from day 4).** Whoever the player registers stays registered. Accepted fakes can vouch for tomorrow's applicants and come back as duplicates. When the court upholds a challenge, the applicant's voucher is removed too, as in the real registry, and joins the queue the next day. As in the real policy, a registration is judged by the rules in force on the day it was made.
- **The truth is decided at the desk.** An applicant is valid if `judge()` finds no fault against the registry as it stands when they reach the window, the player's earlier mistakes included. A fake the player let in yesterday is a registered voucher today; a face the player never registered is not a duplicate. The generator's `planted` describes each applicant under correct play and is for testing; scoring, citations, the court and the Gazette always use the live registry.

| Day | New rule (the Gazette gives the reason) | Set piece |
|---|---|---|
| 1 | The phrase. No Gazette yet: the supervisor's welcome note. | Tutorial: a valid applicant, then the "hooman", with one guided inspect. Gary: "We certify that we are a real human." |
| 2 | Photo. Someone registered with a photo of a more attractive man. | The clock arrives. Gary's photo is from a catalogue. |
| 3 | The sign. A registration was claimed with someone else's wallet. | Gary's sign is in crayon. The fork is proposed. |
| 4 | One vouch. Registry lookup opens. A raccoon vouched for a raccoon. | Pat and the mother. |
| 5 | No duplicates. Four cousins with one face. | The Sybil Farm, the Twins, Doug. |
| 6 | Living. Socrates. | Hardest day. Pat's perfect application. |
| 7 | None: Humanity Day. | Gary is valid. The last applicant is you. The income opens at five. |

## Funny is not the same as fake
- **Most applicants are valid:** about 65 to 75% on any day (day 1, the scripted tutorial, is 3 of 5). Later days are harder because fakes get subtler and there is more to check, not because there are more fakes.
- **One fault per applicant, every day.** Papers, Please's designer found that more faults per entrant made the game easier, not harder. Difficulty comes from subtler faults and more rules in force.
- **Appearance never gives the answer.** Roughly half of the absurd-looking appearances are valid. The best jokes are the ridiculous applicant who is completely legit and the boring-looking one who is a sybil.
- **The rulebook is the only judge.** An absurd applicant who breaks no rule in force is valid and must be accepted, with a straight face. Each new rule comes with its reason, usually something that got registered the day before.

## What the player sees for each applicant
Kept small so checking stays quick:
- **Profile card:** name, procedurally drawn photo, address, birth year, and from day 3 the wallet address, shortened the way a wallet shows it (0x3F9A…C21E).
- **Video strip:** three frames, a transcript of at most two lines, and from day 3 the sign they hold up. A blink shows as closed eyes in one frame; no label ever says whether anyone blinked.
- **Voucher:** one name, from day 4.
- **Registry lookup,** from day 4: search a name (is the voucher registered, and already vouching for someone?) or a face (is this face registered already?).
- **Rulebook:** a page per rule, today's rule open. It fits the window without scrolling.

**Inspect mode (the key tool):** the player clicks two things that disagree (the photo and a frame, the sign and the form, a rule and a fact), and the game highlights the discrepancy and names the rule it breaks. Checking becomes an action, and the rules are taught through play.

**A challenge carries its reason:** the rule found in inspect mode, or picked from today's rulebook. The court upholds a challenge only for the rule named, and the wrong reason loses, as in the real registry ("Dismissed: the applicant is raccoons, but the challenge says Deceased."). A hunch is not a proof.

## Day structure and difficulty
| Day | Applicants | Shift | New rule | Notes |
|---|---|---|---|---|
| 1 | 5 | No clock | The phrase | Tutorial by supervisor note. First two applicants scripted: one valid, one "hooman". |
| 2 | 7 | 6 min | Photo | Clock introduced gently. |
| 3 | 8 | 6 min | The sign | |
| 4 | 8 | 6 min | One vouch | Registry lookup unlocked. |
| 5 | 9 | 6 min | No duplicates | |
| 6 | 10 | 6 min | Living | Hardest day. |
| 7 | 6 | No clock | None | Humanity Day. Gary is valid. The last applicant is you. |

- When the shift clock runs out, remaining applicants go home unprocessed. No penalty, just lost income. Pressure without punishment.
- **Scripted appearances (Gary, Pat, the day's set piece) come in the first half of the queue,** so the clock never sends them home.
- **The first applicant after a new rule tests it,** often Gary.
- **Each rule has at least three kinds of offender and one valid look-alike,** so no rule is learned in one go and then dull. From day 4 the rules interact through the registry.
- The first mistake each day is a warning, not a fine.

**Difficulty targets:**
- A careful first-time player gets about 90% of decisions right on day 1 and 75 to 80% on day 6.
- A player who makes about 2 mistakes per day still reaches the Promoted ending.
- A player who makes about 5 mistakes per day is Fired around day 4 or 5.
- Nobody can lose on day 1.

## Daily rulebook (each day adds one rule; old rules stay)
The real policy's aim is a registry where each entry is "a unique, living, existing human being". The rules test those words, one at a time.

| Day | Rule | In the real registry | Offenders | Valid look-alikes |
|---|---|---|---|---|
| 1 | The video contains the key words of the phrase, in order: "**I certify** that **I am** a **real human** and that **I am not** already **registered** in this **registry**." The small words (that, a, and, already, in, this) may be swapped or left out, "I'm" counts as "I am", and anything else said, before, after or in between, is not assessed. The rulebook prints the key words in bold. | The phrase is word for word the real one. The real policy is kinder still: accents, mispronunciations and swapped words "are not grounds for rejection". | "a real hooman"; "in this ministry"; silence; the Agent's paraphrase; Gary's "we" | an "um" or a "sorry" in the middle; "I'm"; "in the registry" |
| 2 | The photo is of the face in the video, facing the camera, and not mirrored. | Incorrect submission. Filters and mirrored selfies are banned. In 2023 one challenger went through the queue removing every mirrored photo; a vote to allow them ("check if you identify yourself every morning in the bathroom mirror") was blocked on procedure. | a photo of someone better-looking; a mirrored selfie (the mole is on the other cheek); the Deepfake (the ears change between frames); the Influencer's filter | a new haircut or new glasses (hair is not the face); Dave, mascot head under his arm |
| 3 | The sign in the video shows the wallet address on the form. One character may be wrong; two may not. | The real rule, one-typo allowance included: the full address, "no ENS; no ellipsis". | two characters wrong; no sign; the Agent's QR code; someone else's address (the next person in the queue's) | one character wrong; a sign held upside down ("Signs may be upside down. Addresses may not.") |
| 4 | One vouch, from a registered human who is not already vouching for someone else. | One vouch, from someone who knows you; each vouch serves one applicant at a time; when a vouchee is removed as a sybil, the voucher is removed too. | vouched by themselves; by someone not registered (Pat's mother); the Voucher Ring (three strangers vouching in a circle, none registered); the second person Ethel vouches for today | vouched by Ethel (her first today); vouched by anyone the registry lists, even a fake the player let in yesterday |
| 5 | No face already in the registry. | Duplicate (in the second registry, "Sybil attack"). Registering several times at once rejects every one. A twin is registered by filming both twins together. | the Sybil Farm (every cousin after the first one registered); Your Clone; Gary (Doug is registered); a fake accepted earlier in the week, back in a hat | a family of four at one address (four faces); the second Twin, filmed with the first; the Farm's first cousin |
| 6 | Living: born between 1900 and today, and blinks in the video. | Deceased, and Does not exist: "submitters not able to give recent proof of life are to be considered deceased". Deepfakes were first caught because they rarely blinked. | Socrates (born 470 BC); the Cardboard Cutout (same pose in every frame, no blink); the Agent (born "v4"); a typo in the year (1197) | Grandma Ethel (1922); Nigel (blinks constantly) |
| 7 | No new rule. Renewals: a registration expires and is renewed with a new photo and video. | Registrations expire: after two years in the first registry, one in the second. | your own application | Gary |

## The Gazette (every morning from day 2)
The Registry Gazette is on the desk when the day starts. It is Papers, Please's newspaper and the week's callback engine: the one place that tells the player what their stamps did.
- **Headline:** yesterday, from the player's actual decisions, in wire-service deadpan. A fake registered: "THREE RACCOONS NOW ONE HUMAN, REGISTRY CONFIRMS". A human wrongly challenged: "WINDOW 3 FINDS MAN NOT HUMAN. MAN SURPRISED." The clock ran out: "QUEUE SENT HOME AT FIVE. QUEUE RETURNS." A clean day: "WINDOW 3: NOTHING TO REPORT".
- **Today's new rule,** as a Ministry notice with its cause: "Following yesterday's registration of a photograph of a more attractive man, the photograph must now be of the applicant."
- **One thread item:** the countdown, Gary sighted, Pat's attempt number, the fork's vote, the price of UBI (never explained).
- **One small notice:** vouches sold in books of ten; a referendum on which group chat is the Ministry's; a motion to transfer the treasury to its author, dismissed.
- It is read on the clockless morning screen; nothing in it costs shift time.
- The Gazette carries the news; the hall's PA carries the Ministry's voice (see Humor pacing). They never repeat each other's lines.

## Recurring cast
Every character wants something (usually the income, sometimes only the stamp), meets a rule in the way, and is completely sincere. Every non-human is in the queue for the reason every sybil farm is: the money.

**Always invalid (days 1 to 6):**
- **Gary:** three raccoons in a trench coat, one rule behind (see The week). Perfect on day 7.
- **The Agent:** an AI agent with a wallet, applying on behalf of its principal, who is busy. Flawless manners, flawless paperwork, a sincere wish to help. Trips on what a machine would: a paraphrased phrase (day 1), a QR code for a sign (day 3), a birth year of "v4" (day 6). Asked whether it is a robot, it says it is not; it has a vision impairment, which is what an AI model told a human it had hired to solve a CAPTCHA, in a 2023 safety test. It replaces the Toaster and the Chatbot: keep the behaviour, never a chatbot catchphrase.
- **The Sybil Farm (all but one):** four cousins with one face, four hats and one address, one after another on day 5. The real registry rejects every one when they register at once; at a window, one at a time, they can't. So the rulebook, which is the only judge, allows the Farm exactly one human: the first cousin registered is valid and the rest are duplicates. The Gazette reports it straight. Its look-alike is a real family of four at one address, with four faces.
- **The Deepfake:** photo and video almost the same face; in one frame the ears change (day 2).
- **The Cardboard Cutout:** someone holds up a printed face. Same pose in all three frames, no blink (day 6).
- **Your Clone:** your name, your face, a better haircut. Your face is already in the registry, because you are (day 5, and the setup for day 7).

**Absurd but valid (traps for paranoid players):**
- **Brenda:** a completely normal human. So normal she is suspicious.
- **Dave:** a real human in a raccoon mascot costume, the head under his arm, on his way to a children's party. Punishes challenging anything raccoon-shaped.
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
- Each challenge is heard by the Humanity Court. Three juror portraits vote with speech bubbles.
- The ruling names the rule and the two things that disagree, so the player learns from it and can judge whether to appeal.
- Jurors vote for the truth most of the time. If you think the jury got it wrong, press **APPEAL**: the jury grows to 7, then 15 (each round is twice the last plus one, as in Kleros). Maximum three rounds.
- **Fairness rule:** bigger juries are more reliable, so if your challenge was correct and named the right rule, appealing almost always wins in the end. Randomness adds drama, never injustice. This also teaches how Kleros appeals actually work.
- Appeals cost PNK. Winning an appeal refunds the fee and pays a bonus.
- **Real Kleros, played straight:**
  - Jurors are drawn in proportion to the PNK they stake, and one juror can be drawn more than once, one vote per draw: the same face in two seats.
  - Jurors who vote with the majority are paid by those who don't, so the bubbles show jurors guessing what the others will vote.
  - The court "does not have a specific way to make sure that jurors reviewed the evidence".
  - Jurors cannot recuse themselves, only refuse to arbitrate.
  - At most once a week, a letter offers a juror P plus epsilon.

## Economy (starting values; tune with the balance report)
- Correct accept: +10 PNK. Correct challenge: +15 PNK bounty.
- Accepting a fake: -20 PNK citation (first mistake of the day: warning only).
- Challenging a real human, or naming the wrong rule, confirmed by the court: lose the 15 PNK challenge deposit.
- End-of-day bills: rent, gas fees (vary by seed), and one odd item per day ("your cat's hardware wallet").
- Rough target: perfect play earns about 30 PNK more than the bills each day, so a couple of mistakes per day is survivable and many are not.
- **Always accept**, **always challenge** and **judge by looks** must all do clearly worse than careful play.
- The income is story, not money: Humanity Day does not change savings.

## Endings
Every way the week can end gets its own letter.
- **Fired:** savings below zero at the end of any day from day 2.
- **Replaced:** you registered Gary on three different days. The last screen shows Gary in your chair, with three incomes and three votes.
- **Promoted:** you finish day 7 with savings. The letter carries the Humanity Day report: how many humans Window 3 registered, how many were not (Gary is on the list either way), whether Pat made it, and the income: 1 UBI an hour, for life. The Ministry does not comment on the price.
- **Reclassified:** the last applicant on day 7 is you, because your registration expires today. Your video, recorded this morning after a week at the window, says "I certify that I am a real clerk". Accepting yourself earns the week's last citation ("You registered a clerk") and the Promoted letter, with a note on your file. Challenging yourself, with the right reason, sends you to court, which finds you not human: the Ministry reclassifies you as registry equipment. Your salary continues.
- The ending screen lists the endings not seen yet.
- Failing must never be the funniest path. The Promoted and Reclassified letters get the best lines.

## Writing the jokes
All humor lives in `src/content`. Every line passes this test:
1. **It resolves.** A rule, a real registry fact or the speaker's want explains it. If nothing in the world explains it, it is random: cut it. Jokes that resolve are rated funnier than nonsense, and satire needs a target.
2. **The clerk can see what it is about:** the coat, the mustache, the street on the form, the sign. A random remark does not land.
3. **The Ministry's lines could pass for a real notice.** The Ministry never jokes; it reports. The world gets stranger through what it reports, a little more each day.
4. **It punches up:** at the Ministry, the procedure, the farmers and the jurors paid to agree. Never at a sincere applicant.
5. **It works for everyone, and a little more for insiders:** "Sybil Vance", hexspeak in Gary's wallet address. It never needs explaining.
6. **It will not date:** no memes, no chatbot catchphrases, no crypto slang (gm, wagmi, ser, wen). Keep the behaviour, drop the phrasing of the moment.
7. **It is said once.** Used lines leave the pool for the rest of the run; specific lines come before generic ones.

How:
- **Applicants are sincere.** They are trying to prove something unprovable and it makes them anxious; they never do a bit. "Could you stamp it gently? It's the only copy of me."
- **Escalate inside the premise.** "If this is true, what else is true?": Gary one rule behind; the Ministry answering its own memos.
- **Set up and pay off across days:** Doug (heard, found, reported), Pat's attempts, the fork, the ceiling.
- **The player is the comic and the game is the straight man.** Every stamp gets a reaction; Gary has a line for either stamp.
- **Time it to the clock.** Glanceable lines during the shift; longer bits where there is no clock (Gazette, court, bills, letters). No joke costs shift time.
- **Mild and close beats wild and far.** A violation that stays near the real procedure is funnier than one that leaves it.
- **Specific beats general.** A favourite spoon, an egg sandwich, "Oi". Turn in the second sentence.

## Real material (checked 26 Sep 2026)
Played straight, all of this is already funny. It is a menu, not a quota; a line that needs this list to be understood fails test 5.
- **The registry's policy:** each entry is "a unique, living, existing human being". The phrase is the real one; accents, mispronunciations and swapped words are not grounds for rejection. Photos: facing the camera, no filters, no "flashy lipstick", no mirroring, and "the chin is not considered part of the internal facial features". Videos: up to two minutes at first, twenty seconds now. The sign: the full address, "no ENS; no ellipsis", one wrong character allowed. A challenge of Deceased is answered by reading a recent block hash on video. Twins film together. Ambiguity favours the applicant "unless there is clear evidence of bad faith". A registration is judged by the rules in force when it was made. Renewal needs a new photo and video.
- **Vouching and challenges:** one vouch, from someone who knows you; each vouch serves one applicant at a time; a voucher is removed with a sybil they vouched for. Challenge reasons (Duplicate, Does not exist, Incorrect submission, Deceased; later Sybil attack and Identity theft), and the wrong reason loses. The challenge period is three and a half days; the deposit is refunded "shortly after". Some challengers vouched for flawed profiles so they could then challenge them for the reward.
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
- **Accepting:** a stamp and a thunk. If the applicant was invalid, a citation slip prints immediately, naming the rule and the fact that broke it, with a dry memo ("Memo 4-B: You registered three raccoons."). Immediate feedback is how the player learns the rules; Papers, Please's designer called the game "broken and unfun" without it.
- **Challenging:** the case is filed with its reason. All of the day's challenges are heard together at the end of the shift, so the desk stays fast and the court becomes the day's closing show.
- **First mistake each day is a warning,** not a fine. The citation still prints, so the joke lands without the punishment.

## Sound and music
- **The music is a waiting room's, not a tune** (`src/ui/music.ts`). A looping 8-bar march was tried first and grated within minutes: a melody that came round every 27 seconds, resolving at the loop point, over a click on every beat. Papers, Please plays no music at all while you work, only the booth's sounds.
- **So, like Brian Eno's Music for Airports:** seven voices, each repeating one note on its own loop (18 to 31 seconds). The loops never line up, so the music never repeats; no melody, no beat, nothing above about 700 Hz. It should be "as ignorable as it is interesting".
- **It never stops between screens.** It starts at the first click (browsers allow no sound before one) and each part of the day gives the voices a chord: morning, window open (with the hall murmur), closing, court, the accounts, and each ending. The voices move to the new chord one by one, so a screen change is a change of mood, not a cut.
- **The tape wears out with the week:** it wobbles from day 3, the voices drift out of tune from day 4, a note snags from day 5, notes go missing from day 6. Funny, never harsh.
- The Music and Sound switches are in the top bar; M toggles the sound. Previews: `notes/evidence/slice2/music/`.

## Open decisions (need the owner's sign-off)
- **A temptation.** Papers, Please's moral pull comes from bribes and a secret society's requests, with the risk arriving later. Here, the other Ministry could slip a note asking you to let one of its people through, or a vouch seller could offer a book of vouches. Taking it pays and costs the registry. It changes gameplay, so it waits for a decision; slice 5 at the earliest.
- **The first jury.** The real Humanity Court starts with one juror, then 3, 7, 15. The game keeps 3, 7, 15, which the court exercise in `notes/plan.md` also uses.

## Playtesting
Bots test the numbers; only people test the fun. At the end of each course day, play one day yourself for 10 minutes. In the second week, have two or three colleagues play days 1 to 3 without help, and note where they laughed, where they got confused, how many mistakes they made per day, which jokes needed explaining (cut those) and which lines they saw twice. Tune against the difficulty targets above.
