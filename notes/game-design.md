# Game design

## Premise
You are the newest clerk at the Ministry of Humanity, Registry Window 3. Applicants arrive one by one. Each one wants to be registered as a real, unique human. Your job: **Accept** or **Challenge**, before the shift ends.

## Design pillars
1. **Competent job, ridiculous world.** Most applicants are legitimate. The player wins by reading carefully, not by being paranoid.
2. **Every mistake is fair.** Every invalid applicant has a visible, checkable clue. The player should always think "I missed that", never "how was I supposed to know?"
3. **Snappy, not tedious.** A decision takes 20 to 40 seconds. No walls of text.
4. **Jokes come in rhythm.** Mostly normal work, punctuated by set pieces.

## Tone: deadpan bureaucracy
The comedy comes from treating absurd things with total seriousness, the way Papers, Please treats a border. The UI is grey, stamped and official. The game never winks at the player. Memos, citations and bills read like a real ministry wrote them.

## Funny is not the same as fake
- **Most applicants are valid:** about 65 to 75% on any day. Later days are harder because fakes get subtler and there is more to check, not because there are more fakes.
- **Appearance never gives the answer.** Roughly half of the absurd-looking appearances are valid. The best jokes are the ridiculous applicant who is completely legit and the boring-looking one who is a sybil.
- **The rulebook is the only judge.** If an absurd applicant breaks no rule that is active today, they are valid and must be accepted, with a straight face. Several daily rules are introduced by memo because of something that got registered the day before.

## What the player sees for each applicant
Kept deliberately small so checking stays quick:
- **Profile card:** name, procedurally drawn portrait, address, birth year.
- **Video strip:** three frames plus a transcript of at most two lines, and whether they blinked.
- **Vouches:** up to two names.
- **Registry lookup:** search by face or address (needed from day 4).
- **Rulebook:** always visible, today's new rule highlighted.

**Inspect mode (the key tool):** the player clicks two things that disagree (for example the profile photo and a video frame) and the game highlights the discrepancy and stamps the rule it breaks. This turns checking into a satisfying action instead of squinting, and it teaches the rules through play.

## Day structure and difficulty
| Day | Applicants | Shift | New rule | Notes |
|---|---|---|---|---|
| 1 | 5 | No clock | Exact phrase | Tutorial by supervisor memo. First two applicants are scripted: one valid, one "hooman". |
| 2 | 7 | 6 min | Photo matches video | Clock introduced gently. |
| 3 | 8 | 6 min | Two vouches from registered humans | |
| 4 | 8 | 6 min | No duplicate face or address | Registry lookup unlocked. |
| 5 | 9 | 6 min | Must blink | |
| 6 | 10 | 6 min | Birth year 1900 to today | Hardest day. |
| 7 | 6 | No clock | None | Finale. Last applicant is you. |

- When the shift clock runs out, remaining applicants go home unprocessed. No penalty, just lost income. Pressure without punishment.
- Each invalid applicant breaks one rule on days 1 to 3, and at most two rules on days 4 to 6.

**Difficulty targets:**
- A careful first-time player gets about 90% of decisions right on day 1 and 75 to 80% on day 6.
- A player who makes about 2 mistakes per day still reaches the Promoted ending.
- A player who makes about 5 mistakes per day is Fired around day 4 or 5.
- Nobody can lose on day 1.

## Daily rulebook (each day adds one rule; old rules stay)
| Day | New rule | Typical offenders |
|---|---|---|
| 1 | The video phrase must be exactly: "I certify that I am a real human and that I am not already registered in this registry." | "I certify I am a real hooman." The mime (says nothing). The chatbot ("Certainly! Here is my certification:"). |
| 2 | The profile photo must match the face in the video. | Gary in a fake mustache. Someone who sent a photo of a much more attractive person. |
| 3 | Two vouches from registered humans are required. | Vouched by their own cat. Vouched by themselves. Vouched by "trust me bro". |
| 4 | No duplicates: a face or address already in the registry is a sybil. | Gary again, now with a monocle. Your clone. |
| 5 | The applicant must blink at least once in the video. | The toaster. A statue. |
| 6 | Birth year must be plausible (1900 to today). | Socrates (born -470). Kevin (born "yes"). A time traveller (born 2091). |
| 7 | Finale: no new rule. | Your own application, with one small mistake in it. |

## Recurring cast

**Always invalid (they always break an active rule):**
- **Gary:** three raccoons in a trench coat. Appears once a day with a new disguise (mustache, monocle, "human" name tag, fake beard, wig, and on day 6 a sign that says "NOT RACCOONS"). He always gets exactly one checkable detail wrong.
- **The Toaster:** very polite. Ends every sentence, including the phrase, with "Ding."
- **The Chatbot:** answers in bullet points, never says the phrase exactly, apologizes for being unable to blink.
- **Your Clone:** your name, your face, a better haircut. A duplicate from day 4.

**Absurd but valid (traps for paranoid players):**
- **Brenda:** a completely normal human. So normal she is suspicious. Valid every time.
- **Dave:** a real human in a full raccoon mascot costume, on his way to a party. Punishes challenging anything raccoon-shaped.
- **Grandma Ethel:** born 1922, fierce, fully valid.
- **Robot McBotface:** a human whose parents had a sense of humor.
- **Nervous Nigel:** sweats, overshares ("I love having bones"), blinks far too much.

**Valid until a rule catches them (rules are rules):**
- **Socrates:** says the phrase perfectly, then asks what "human" really means. Valid until day 6; the day 6 memo says the rule exists because of him.
- **Kevin:** clearly two kids on each other's shoulders. Passes days 1 to 5, caught by day 6.
- **The AI avatar:** blinks in perfect 2.000s intervals. No rule forbids it, so it is valid. Suspiciously.

**Fill-in applicants:** generated normal people with one-line flavor ("Sorry, I'm on my lunch break"), mostly valid, some with ordinary mistakes (a typo in the phrase, a missing vouch, a reused address).

## Humor pacing
- Per day: mostly fill-ins, one or two cast appearances, and one set piece (Gary's new disguise).
- Jokes live in many places, not only applicants: the morning memo, citation slips, the bills screen and the court.
- Every line comes from a pool with variants, so repeat plays and repeat characters do not repeat the same line.

## Feedback
- **Accepting:** a stamp and a thunk. If the applicant was invalid, a citation slip prints immediately with a dry explanation ("Memo 4-B: You registered three raccoons."). Immediate feedback is how the player learns the rules.
- **Challenging:** the case is filed. All of the day's challenges are heard together at the end of the shift, so the desk stays fast and the court becomes the day's closing show.
- **First mistake each day is a warning,** not a fine. The citation still prints, so the joke lands without the punishment.

## The court (end of each shift)
- Each challenge is heard by the Humanity Court. Three juror portraits vote with speech bubbles ("He is clearly raccoons." "I also have a mustache.").
- Jurors vote for the truth most of the time. If you think the jury got it wrong, press **APPEAL**: the jury grows to 7, then 15, filling the screen. Maximum three rounds.
- **Fairness rule:** bigger juries are more reliable, so if your challenge was correct, appealing almost always wins in the end. Randomness adds drama, never injustice. This also teaches how Kleros appeals actually work.
- Appeals cost PNK. Winning an appeal refunds the fee and pays a bonus.

## Economy (starting values; tune with the balance report)
- Correct accept: +10 PNK. Correct challenge: +15 PNK bounty.
- Accepting a fake: -20 PNK citation (first mistake of the day: warning only).
- Challenging a real human, confirmed by the court: lose the 15 PNK challenge deposit.
- End-of-day bills: rent, gas fees (vary by seed), and one absurd item per day ("your cat's hardware wallet").
- Rough target: perfect play earns about 30 PNK more than the bills each day, so a couple of mistakes per day is survivable and many are not.
- **Always accept**, **always challenge** and **judge by looks** must all do clearly worse than careful play.

## Endings
- **Promoted:** finish day 7 with savings.
- **Fired:** savings below zero at the end of any day from day 2.
- **Replaced:** you accepted Gary three times. The final screen shows Gary in your chair.
- **Secret:** you challenge your own application on day 7 and the court rules you are not human.

## Playtesting
Bots test the numbers; only people test the fun. At the end of each course day, play one day yourself for 10 minutes. In the second week, have two or three colleagues play days 1 to 3 without help, and note where they laughed, where they got confused and how many mistakes they made per day. Tune against the difficulty targets above.
