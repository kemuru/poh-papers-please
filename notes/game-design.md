# Game design

## Premise
You are the newest clerk at the Ministry of Humanity, Registry Window 3. Applicants arrive one by one. Each one wants to be registered as a real, unique human. Your job: **Accept** or **Challenge**, before the shift ends.

## Tone: deadpan bureaucracy
The comedy comes from treating absurd things with total seriousness, the way Papers, Please treats a border. The UI is grey, stamped and official. The applicants are ridiculous. The game never winks at the player. Official memos, citations and bills are written like a real ministry would write them.

## What the player sees for each applicant
- **Profile card:** name, procedurally drawn portrait, address, birth year.
- **Video strip:** three frames plus a transcript of what they said, including whether they blinked.
- **Vouches:** who vouched for them.
- **Registry lookup:** a search box to check existing registrations (needed for sybils).
- **Rulebook:** the current day's rules, updated by memo each morning.

## Daily rulebook (each day adds one rule; old rules stay)
| Day | New rule | Typical offenders |
|---|---|---|
| 1 | The video phrase must be exactly: "I certify that I am a real human and that I am not already registered in this registry." | "I certify I am a real hooman." The mime (says nothing). The chatbot ("Certainly! Here is my certification:"). |
| 2 | The profile photo must match the face in the video. | Gary in a fake mustache. Someone who sent a photo of a much more attractive person. |
| 3 | Two vouches from registered humans are required. | Vouched by their own cat. Vouched by themselves. Vouched by "trust me bro". |
| 4 | No duplicates: a face or address already in the registry is a sybil. | Gary again, now with a monocle. Your clone. |
| 5 | The applicant must blink at least once in the video. | The toaster. A statue. An AI avatar that blinks in perfect 2.000s intervals (it passes, suspiciously). |
| 6 | Birth year must be plausible (1900 to today). | Socrates (born -470). A time traveller (born 2091). |
| 7 | Finale: no new rule. The last applicant is you. | Your own application, with one small mistake in it. |

## Recurring cast (the running gags)
- **Gary:** three raccoons in a trench coat. Appears every day with a new disguise (mustache, monocle, "human" name tag, fake beard, wig, and on day 6 a sign that says "NOT RACCOONS"). He always gets one detail wrong.
- **The Toaster:** very polite. Ends every sentence with "Ding."
- **Kevin:** clearly two kids standing on each other's shoulders. Birth year: "yes".
- **The Chatbot:** answers everything in bullet points and apologizes for being unable to blink.
- **Socrates:** asks you what "human" really means. Refuses to leave.
- **Your Clone:** has your name, your face and a better haircut.
- **Brenda:** a completely normal human. So normal she is suspicious. She is valid every time she appears. Challenging her is the classic mistake.
- **Fill-in applicants:** generated normal people, most of them valid, some with ordinary mistakes (typos in the phrase, a missing vouch).

## The court (when you challenge)
- The case goes to the Humanity Court. Three jurors vote, shown as portraits with speech bubbles ("He is clearly raccoons." "I also have a mustache.").
- Jurors are seeded and usually vote for the truth, with some noise.
- If you disagree with the ruling you can press **APPEAL**. The jury grows to 2n+1: 3, then 7, then 15. The screen fills with more and more jurors. Maximum three rounds.
- Appeals cost PNK. Winning an appeal refunds you and pays a bonus.

## Economy (starting values; tune with the balance report)
- Correct accept: +10 PNK. Correct challenge: +15 PNK bounty.
- Accepting a fake: -20 PNK citation ("Memo 4-B: You registered three raccoons.").
- Challenging a real human (if the court agrees with them): lose the 15 PNK challenge deposit.
- End-of-day bills: rent, gas fees (vary by seed), and "your cat's hardware wallet".
- Design goal: over a seeded day, **always accept** and **always challenge** both lose money. Only reading carefully pays.

## Endings
- **Promoted:** you finish day 7 with savings.
- **Fired:** savings below zero.
- **Replaced:** you accepted Gary three times. The final screen shows Gary sitting in your chair.
- **Secret:** you challenge your own application on day 7 and the court rules you are not human.
