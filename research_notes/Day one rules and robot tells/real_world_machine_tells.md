# Real-world grounding for a "this face is a machine" tell: infrared seen by phone cameras, night-vision switching, robot heads, liveness checks, disclosure laws, and proof of personhood in 2025 to 2026

Sourcing note: "(search summary)" marks a claim read only in a search engine's summary of the linked page, not on the page itself. Everything else was read on the page (or its abstract) on 30 Sep 2026. This file fills gaps in `reports/Humanoid robot applicants design.md` and does not repeat its findings on android blinking, lip sync, fiction's tells, NEO's teleoperation or World's AgentKit.

## Infrared that cameras see and eyes don't: how widely known is it, what colour is it, and which phone cameras show it?

### Takeaway
Seeing a TV remote's invisible flash through a phone camera is mainstream, repeatedly published consumer knowledge. It appears in how-to journalism, hidden-camera privacy guides and remote-tester tools, and even Apple's own Face ID page, which says "some cameras might detect infrared light" from the face scanner. Phone cameras show near-infrared as "typically purple but sometimes white", which matches the game's violet-white lamp. The catch is that many phones' main (rear) cameras filter infrared while the front (selfie) camera usually doesn't. The tell is therefore most realistic in a selfie-style video.

### Cited Findings
- How-To Geek's hidden-camera guide (Josh Hendrickson, updated 8 Jan 2024): "Grab an infrared remote like the one you use for your TV. Point it at your smartphone's primary camera and press a button." Infrared lights "will typically be purple but sometimes can look white." "Some smartphones have filters to block out infrared light on their primary camera, but very few of them have filters on the front camera." "Most IP cameras use infrared for night vision. While infrared rays are invisible to the naked eye, you already have a device that can help—your smartphone." — [How-To Geek](https://www.howtogeek.com/411095/how-to-detect-hidden-surveillance-cameras-with-your-phone/)
- Apple, on Face ID: "When viewed through certain types of cameras, you might notice light output from the TrueDepth camera. This is expected as some cameras might detect infrared light." The TrueDepth camera works "by projecting and analyzing thousands of invisible dots to create a depth map of your face and also captures an infrared image of your face". Face ID is "attention-aware" and "recognizes if your eyes are open", and is designed to work "even in total darkness". — [Apple Support, About Face ID advanced technology](https://support.apple.com/en-us/102381)
- A Japanese physics-education site tested an iPhone (16 Aug 2025, updated 23 Aug 2025): "The key is using the front camera. The rear camera won't capture the infrared." It gives as one reason that "adding an IR-cut filter would increase the thickness of the camera module". It does not name the model tested. — [phys-edu.net](https://phys-edu.net/wp/?p=50874&lang=en)
- Apple's technical specifications for older iPhones list a "Hybrid IR filter" on the rear camera, for example the iPhone 6 and 6s (search summary). — [Apple Support, iPhone 6 specs](https://support.apple.com/en-is/111954); [Apple Support, iPhone 6s specs](https://support.apple.com/en-us/111952)
- A free browser remote tester: "Many phone rear cameras have an infrared filter that blocks the remote's light. The front, selfie camera usually shows the infrared flash clearly. Use the switch camera button if one does not work." (search summary) — [tv-remote.app](https://tv-remote.app/tv-remote-test)
- Hidden-camera guides tell people to turn off the lights, pan the phone and look for "bright red or purple dots—those are IR LEDs used by night-vision cameras". They also say the front camera "usually omits this filter" while rear cameras "typically" block infrared (search summary across guides including eufy's 2026 guide, Panda Security, Alfred and AntiSpyCamKit). — [eufy](https://www.eufy.com/blogs/security-camera/how-to-detect-hidden-cameras); [Panda Security](https://www.pandasecurity.com/en/mediacenter/how-to-detect-hidden-camera/); [Alfred](https://alfred.camera/blog/how-to-detect-hidden-cameras/); [AntiSpyCamKit](https://www.antispycamkit.com/guides/detect-hidden-cameras-with-phone/)
- A science blog for children says the remote's LED shows "purple or white", "a faint purple-white glow". It adds that IR-cut filters "are effective but not perfect", so some near-infrared leaks through and shows when "a concentrated, direct infrared source" is pointed at the lens (search summary). — [HiWave Blog](https://hiwavemakers.com/blog/how-tv-remotes-work-infrared-light-explained-kids/)
- Why purple: the only explanations found are informal. The red, green and blue filter cells each pass some near-infrared, with different sensitivities (green the least), so the camera records infrared as a light purple (search summary; Quora and a consumer blog, not authoritative). — [Quora](https://www.quora.com/Sensors-Why-does-infrared-appear-purple-in-digital-cameras); [Infrared for Health](https://infraredforhealth.com/why-does-infrared-look-purple/)
- Wavelength matters for "people can't see it". 850 nm illuminators show "a faint red glow at direct exposure", while 940 nm ones are invisible ("no glow") but give conventional security cameras 30 to 50% less range (search summary of vendor pages). — [Axton, 940nm vs 850nm](https://axtontech.com/infrared-850nm-vs-940nm-wavelength/); [Axton FAQ](https://axtontech.com/850nm-vs-940nm-light-what-is-the-difference/); [Nightfox](https://us.nightfoxstore.com/blogs/news/850nm-vs-940nm-which-infrared-wavelength-is-better). Consumers notice the glow: a Wyze customer request is titled "Use 'invisible' 940nm IR LEDs so the IR lights don't glow red" — [Wyze Forum](https://forums.wyze.com/t/use-invisible-940nm-ir-leds-so-the-ir-lights-dont-glow-red/8845)
- A source that conflicts on 850 nm: RealSense recommends "850nm as being a good compromise in being invisible to the human eye while still being visible to the IR sensor". This is not strictly contradictory, since the vendors' red glow shows only on direct exposure. — [RealSense, Projectors for D400 series](https://dev.realsenseai.com/docs/projectors/)
- Security research has a precedent for infrared on a face that people can't see but cameras record. "Invisible Mask: Practical Attacks on Face Recognition with Infrared" (Zhou, Tang, Wang, Han, Liu, Zhang; 13 Mar 2018) lit faces with infrared to fool face recognition: "the infrared perturbations cannot be observed by raw eyes". The authors found adversarial examples that infrared could implement in over 70% of attempts. — [arXiv 1803.04683](https://arxiv.org/abs/1803.04683)
- Face ID's dot pattern has been filmed with infrared-capable cameras and published as consumer tech content (search result title: "How to 'see' the crazy dot map the iPhone X uses to scan your face"). — [iMore](https://www.imore.com/how-see-iphone-xs-dot-map)

### Inferences
- The TV-remote trick is familiar enough to be the one-sentence explanation. It is the standard first step of hidden-camera guides and remote troubleshooting, and Apple documents the same effect for Face ID. It is also the only candidate a player can test at home in ten seconds with a remote and a phone.
- The designers' "violet-white" matches the most-cited description, "typically purple but sometimes white". A white centre in a purple halo is a fair pixel-art rendering of a bright infrared source seen by a phone. That exact core-and-halo look is an inference, not sourced.
- The front-versus-rear difference helps the design. A registration video faces the applicant like a selfie, so it is most likely shot with the front camera, the one least likely to filter infrared. Nothing read in this session confirms that Proof of Humanity's recording flow uses the front camera.
- For "people can't see it, a phone camera can", the lamp should be modelled as a 940 nm TV-remote-class source ("no glow"). An 850 nm security-camera-class source would glow faintly red to the eye.
- Apple's sentence ("some cameras might detect infrared light") could be printed almost straight in a Ministry memo, with brand names removed.

### Gaps
- No survey data on how many people know the TV-remote trick. Familiarity is inferred from how often it is published.
- No manufacturer or peer-reviewed explanation of why phones render near-infrared purple was read, only informal ones.
- Whether 2024 to 2026 flagship front cameras (iPhone 15 to 17, recent Pixels and Galaxies) still pass infrared was not verified. The phys-edu test doesn't name a model, and How-To Geek's "very few" dates from its 2019 article, updated in 2024.
- NASA, Exploratorium and Institute of Physics teaching pages on seeing remote infrared with a camera were found but not readable. The Exploratorium and IOP pages returned 403, and the NASA activity PDF read covers blocking the remote with your body, not cameras. They can't be cited for the camera claim.

## Real day/night cameras: how IR-cut filters and illuminators switch, and does anything switch on a brief darkness?

### Takeaway
Day/night cameras switch to night mode when their light reading falls below a threshold: the IR-cut filter slides out, often with an audible click, and the infrared LEDs come on. The consumer test is to cover the lens with your hand. Real cameras deliberately wait before switching, though. Axis allows 1 to 600 seconds with defaults of 3 to 5 seconds, precisely so that brief changes in light don't trigger a switch. No source describes a camera that switches on a sub-second darkness, so a unit that lights up on every blink is a unit with a zero delay. That is a defect, and its real-world fix, adding a delay, makes a realistic patch note. A 2025 *Cell* study separately supplies the missing eyelid physics: near-infrared passes through eyelids better than visible light.

### Cited Findings
- Axis VAPIX DayNight API: DayNightDwellTime is "the number of seconds that should pass until the channel switch into night mode" once darkness reaches the threshold, and NightDayDwellTime is the same for returning to day mode. Both range from 1 to 600 s, with defaults "between 3–5 seconds". Examples: on a highway at night, raise NightDayDwellTime to "more than 20 seconds" so passing headlights don't flip the camera to day. Next to a motion-triggered lamp, set it to "1–3 seconds". — [Axis developer documentation](https://developer.axis.com/vapix/network-video/daynight-api/)
- The delay "exists to reduce unintended switches due to brief changes in lighting", and because the filter physically moves, "the mechanism can wear out prematurely if it flips too often" (search summary). — [IP Cam Talk, "Day/Night Delay/filtering time - Why?"](https://ipcamtalk.com/threads/day-night-delay-filtering-time-why.24584/)
- A camera's own infrared can make it cycle between modes. Vicon's support article is titled "Avoiding continuous day/night switching when using IR illumination" (title only; the page returned 403). — [Vicon Support](https://vicon-security.zendesk.com/hc/en-us/articles/210734423-Avoiding-continuous-day-night-switching-when-using-IR-illumination)
- The IR-cut filter is "a moving component inside the camera". It sits in the light path by day for true colours and moves out at night so infrared, often from the camera's own IR LEDs, reaches the sensor (search summary). — [Swann Support](https://support.swann.com/hc/en-us/articles/39587207813401-What-is-an-IR-cut-Filter); [Network Webcams](https://www.networkwebcams.co.uk/blog/day-night-switching-ir-cut-filters/); [TechNexion](https://www.technexion.com/resources/ir-cut-filter-in-embedded-vision/)
- The switch is audible. A camera maker's support page calls the click "the IR Cut filter engaging when the camera enters night vision mode". It says that when "the light in the room is unstable between dark and bright areas, the camera will keep detecting the light and making the clicking noises" (search summary). — [Lollipop Support](https://support.lollipop.camera/hc/en-us/articles/4410980708889-Why-Does-My-Camera-Constantly-Make-a-Clicking-Sound); [Arlo Community, "Loud clicking noise"](https://community.arlo.com/t5/Arlo-Ultra/Loud-clicking-noise/td-p/1681630)
- The cover-the-lens test: a home-camera maker tells users to "cover the camera lens completely with your hand for more than 5 seconds and listen carefully for a slight clicking sound", and says they may "see a faint red glow from the infrared lights activating" (search summary; the page returned 403 to a direct read). — [VicoHome Support](https://support.vicohome.io/hc/en-us/articles/55983556504985-How-to-Check-If-the-Infrared-Light-Is-Functioning-Properly-on-Your-Camera)
- Stand-alone "invisible" infrared lamps come with their own light sensor that turns them on in the dark, for example a product listed as a "Total Invisible 940nM IR lamp Board with Light Sensor (48 Black LED Illuminator Array)" (listing title). — [Amazon listing](https://www.amazon.com/Total-Invisible-940nM-Sensor-Illuminator/dp/B0785W2RQQ)
- Eyelids pass near-infrared. A study in *Cell* (22 May 2025; senior author Tian Xue, University of Science and Technology of China) gave people upconversion contact lenses that see near-infrared (800 to 1,600 nm). The release says "near-infrared light penetrates the eyelid more effectively than visible light, so there is less interference from visible light", and is headlined that people could see infrared "even with their eyes closed". — [EurekAlert](https://www.eurekalert.org/news-releases/1084046)
- Eyelids pass red more than blue. Osaka Metropolitan University (Dec 2022, *Color Research and Application*, 33 participants) measured eyelid transmittance "up to 10 times higher than those (i.e., 0.3%-14.5%) reported in the past". Through closed lids, "red light [was] perceived as brighter and blue light perceived as darker". — [ScienceDaily](https://www.sciencedaily.com/releases/2022/12/221219094858.htm)

### Inferences
- The lamp's logic can now rest on three real, citable facts instead of the design's own physics:
  1. Night-vision cameras turn their infrared on when their lens goes dark (the cover-the-lens test).
  2. Near-infrared passes through eyelids better than visible light (*Cell* 2025), so an eye camera switching to infrared when its lids close is not absurd.
  3. A phone camera sees that infrared (the TV-remote test).

  This closes the earlier report's gap: "this research read no source on eyelids that pass infrared or on day/night cameras".
- Real cameras wait at least 1 s (the Axis minimum) and usually 3 to 5 s before switching, and a blink is much shorter (blink duration was not sourced this session). An instant switch on a blink is therefore a firmware bug, not how cameras normally behave. That grounds the game's "older units have no switching delay" and suggests a fleet patch note in the real vocabulary, such as "added a night-vision delay". The same note explains why the current model on days 4 and 5 doesn't light when it blinks.
- "Hunting", where a camera's own infrared makes it think it's bright and flip back, is a real, documented malfunction that the Gazette could report straight-faced.
- The IR-cut filter's click is a second real symptom, in audio: a "(click)" in the transcript at each blink. As an actual clue it would add a second clue to the same rule, so at most it works as flavour.

### Gaps
- No source found on any camera or illuminator that switches on a sub-second darkness, or on how fast a cheap photocell-triggered illuminator reacts.
- Blink duration was not sourced this session. The earlier report cites blink intervals of 2 to 10 s, not durations.
- Nothing read on whether silicone eyelids like those on robot faces transmit near-infrared. The eyelid data is for human eyelids.

## Real face robots and home humanoids: eye cameras, infrared emitters, depth sensors and lights on the head

### Takeaway
The most lifelike face robots put RGB cameras inside the pupils: Columbia's Emo, and, per the earlier report, AheadForm's Origin M1 and Ameca. Real humanoids also carry near-infrared emitters in the head. Unitree's G1 has a RealSense D435i depth camera whose projector works at about 850 nm, chosen to be "invisible to the human eye while still being visible to the IR sensor", and Pepper has a 3D sensor behind its eyes. The real robot heads that light up are industrial or product signals rather than lights on a human-looking face: electric Atlas's status ring lights, and NEO's ear light during teleoperation. No robot was found with an infrared lamp that switches with its eyelids; that part is still the design's own.

### Cited Findings
- Emo (Columbia Engineering; *Science Robotics*, March 2024, "Human-robot facial coexpression") has "high-resolution RGB cameras, one inside the pupil of each eye", 26 actuators and "soft silicone skin with a magnetic attachment system". It predicts a smile about 840 ms before the person smiles (search summary). This is the 2024 Emo paper; the earlier report covers the 2026 lip-sync paper. — [Columbia Engineering](https://www.engineering.columbia.edu/about/news/robot-can-you-say-cheese); [Science Robotics](https://www.science.org/doi/10.1126/scirobotics.adi4724)
- Unitree G1: "The G1's head is equipped with an Intel RealSense D435i depth camera", and the standard sensing suite is "Depth Camera + 3D LiDAR" (search summary of reseller listings). — [RobotShop](https://www.robotshop.com/products/unitree-intel-realsense-d435i-depth-camera-g1-humanoid-robot)
- RealSense D400 projectors: the D435's projector casts "~5000" dots over 91×65°, overlaying "the observed scene with a semi-random texture that facilitates finding correspondences, in particular in the case of texture-less surfaces like indoor dimly lit white walls". Its wavelength of 850 nm is described as "invisible to the human eye while still being visible to the IR sensor". — [RealSense, Projectors for D400 series](https://dev.realsenseai.com/docs/projectors/)
- Pepper (SoftBank): "One ASUS Xtion 3D sensor is located behind the eyes"; the head also has HD cameras "in the mouth and forehead" (search summary). — [Wevolver](https://www.wevolver.com/specs/softbank-robotics-pepper); [Aldebaran documentation, Pepper 3D sensor](http://doc.aldebaran.com/2-4/family/pepper_technical/video_3D_pep.html)
- Electric Atlas, Boston Dynamics (RoboticsTomorrow, 10 Sep 2026): "The round light rings at the front and back of the head can indicate the robot's status as it works, and can be seen from across a factory floor"; they "can illuminate in different colors or blink in patterns". Atlas "should look like an industrial piece of equipment rather than a human being", and head-mounted "HDR stereo cameras" give "remote operators a higher-resolution view". Senior mechanical engineer Taylor Frey-Baker: "Our design choices are driven by function, performance, and efficiency rather than trying to replicate human aesthetics." — [RoboticsTomorrow](https://www.roboticstomorrow.com/article/2026/09/why-boston-dynamics-designed-atlas-head-this-way/26996)
- 1X NEO: "The robot's ear light indicates an active teleoperation session"; during Expert Mode, a US-based 1X employee "sees through the robot's cameras" (search summary; company claims already covered by the earlier report). — [Engadget](https://www.engadget.com/ai/1x-neo-is-a-20000-home-robot-that-will-learn-chores-via-teleoperation-040252200.html); [RoboZaps](https://blog.robozaps.com/b/1x-neo-review)
- Figure 03 (Figure, 9 Oct 2025) is "covered in soft textiles rather than hard machined parts". The announcement gives no details of head lights, displays or where the head cameras sit. Trade coverage reports a camera system with "twice the frame rate, one-quarter the latency, and a 60% wider field of view per camera", plus a camera in each palm (search summary). — [Figure](https://www.figure.ai/news/introducing-figure-03); [The Robot Report](https://www.therobotreport.com/figure-ai-designs-figure-03-humanoid-ai-home-use-scaling/)
- Tesla Optimus: only blog-level sources were found. They describe a vision-only robot with eight cameras and claim a Gen 3 OLED face display. These are unverified and low quality. — [Basenor](https://www.basenor.com/blogs/news/tesla-optimus-gen-3-face-revealed-oled-display-and-whats-coming); [optimusk.blog](https://optimusk.blog/blog/does-tesla-optimus-use-lidar/)
- Home robots already use infrared to see in the dark. A robot-vacuum maker explains that "Infrared sensors emit and detect infrared light, enabling the vacuum to 'see' in the dark" (27 Sep 2024). — [Narwal](https://us.narwal.com/blogs/product/can-robot-vacuum-work-night)

### Inferences
- A unit with cameras in its pupils is directly grounded (Emo, Origin M1, Ameca). So is a near-infrared emitter in a real humanoid's head that people can't see (the G1's RealSense projector; Pepper's 3D sensor behind the eyes). Only the switching with the eyelids is invented.
- Real head lights are status signals. Atlas's say what the robot is doing, and NEO's says a hidden human is driving. The unit's lamp is a status light it doesn't mean to show, which fits the deadpan.
- Atlas's designers chose a light ring so the robot would *not* look human. The Likeness unit is the opposite product decision, and a Gazette line could contrast the two without brand names.

### Gaps
- No source confirms that a phone camera shows a G1's RealSense projector or Pepper's sensor on video. It is likely by the physics above, but unverified.
- Pepper's LED eyes, and the camera placement of Sophia and Geminoid, were not verified this session. Optimus's face is unverified.
- No real robot was found with a light between the brows or an infrared illuminator tied to its eyelids.
- A robot-vacuum claim seen in a search summary, LED headlights that "automatically turn on when the robot enters a dark room or goes under a bed", could not be traced to a page and is excluded.

## Liveness and presentation-attack detection in real ID verification

### Takeaway
Real liveness checks fall into families a lay person grasps in one sentence: a live face blinks, it turns when asked, it is warm, its skin flushes with each heartbeat, a screen looks black to an infrared camera, and filming a screen makes ripples. Only a few would show in three stills of a phone video: blinks, head turns, moiré ripples on a replayed screen, and near-infrared light caught by the camera. A visible pulse is only about half a grey level, and warmth needs a thermal camera, so both are intuitive but invisible in the stills. They are also body features. The test standards (ISO/IEC 30107-3, and iBeta Levels 1 to 3) cover photos, screens and masks. No source read treats an animatronic robot face as an attack type.

### Cited Findings
- Blink: "Eye blinking is a physiological behavior that normally happens 15 to 30 times per minute" (Pan et al. 2007). Blink checks catch printed photos but fail against video replays. — [Survey of anti-spoofing with RGB cameras of consumer devices, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8321190/)
- Challenge and response: Kollreider et al. (2007) had users "utter a randomly determined sequence of digits" and checked the lip motion. The method catches photos and most video replays but is vulnerable to mouth-cut photos and deepfakes. — [Survey, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8321190/)
- Pulse from video (rPPG): "Blood oxygen saturation changes within each cardiac cycle, leading to periodic variations in the skin's absorption and reflection" (Li et al. 2016). It catches photos and 3D masks but "fails on high-quality video replays". — [Survey, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8321190/)
- How faint the pulse is: in MIT's Eulerian Video Magnification, blood flow changes the face's colour by "typically only half a gray-level". Filtering at 50 to 60 bpm (0.83 to 1 Hz) and amplifying about 100× makes the pulse visible (search summary). — [Communications of the ACM](https://cacm.acm.org/research/eulerian-video-magnification-and-analysis/)
- Moiré: Pinto et al. (2012 to 2015) detect the "moiré pattern effect" that appears when a screen replay is filmed. — [Survey, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8321190/)
- Depth: "Depth map of an actual face has varying height values...whereas planar attacks' depth maps are constant" (Atoum et al. 2017). — [Survey, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8321190/)
- Near-infrared and thermal: the survey sets them aside for consumer devices because "such sensors are still expensive and rarely embedded on ordinary GCDs" (generic consumer devices). — [Survey, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8321190/)
- Near-infrared against screens: the anti-spoofing literature says near-infrared sensors catch video replays because "electronic displays appear almost uniformly dark under NIR illumination" (search summary). — [IFAST, arXiv 2309.17399](https://arxiv.org/pdf/2309.17399); [Face anti-spoofing with generated near-infrared images, Springer 2020](https://link.springer.com/article/10.1007/s11042-020-08952-0)
- World's Orb: its fraud-prevention system includes "a near infrared wide angle camera, a 3D time of flight camera and a thermal camera". It uses "740nm, 850nm and 940nm LEDs to capture a multispectral image of the iris to make the uniqueness algorithm more accurate and detect fraud", and the fraud algorithms run locally (World engineering blog, 27 Jan 2023). — [World](https://world.org/blog/engineering/opening-orb-look-inside-worldcoin-biometric-imaging-device)
- Humanity Protocol captures "palm print via visible light and palm vein via infrared light" and claims this "makes spoofing by non-human agents nearly impossible"; its phase-two scanners image veins in infrared (search summary). — [Messari](https://messari.io/report/understanding-humanity-protocol-a-comprehensive-overview); [Humanity Protocol blog](https://www.humanity.org/blog/how-do-palm-scans-work-on-the-humanity-protocol); [Biometric Update, May 2024](https://www.biometricupdate.com/202405/palm-scanning-humanity-protocol-emerges-as-new-kid-on-the-blockchain)
- iBeta is accredited by NIST NVLAP and tests to ISO/IEC 30107-3 within the ISO/IEC 30107-1 framework. "Level 1 tests 2D attacks such as photo prints, cutouts, and display replays, while Level 2 tests 3D mask attacks including silicone, latex, wrapped 3D paper, and cloth 3D masks." A liveness-only Level 1 test targets "150 attacks alternated with 50 genuine presentations" per attack type within 8 hours (search summary). — [iBeta](https://www.ibeta.com/iso-30107-3-presentation-attack-detection-confirmation-letters/); [Innovatrics](https://www.innovatrics.com/awards/level-1-ibeta-presentation-attack-detection-conformance/)
- iBeta Level 3 (announced June 2025) is "a more rigorous form of testing which will include, for instance, custom-made, hyper-realistic masks that we have had a chance to source from around the world", for "attacks carried out with significant background knowledge and funding". — [Biometric Update, 16 Jun 2025](https://www.biometricupdate.com/202506/ibetas-biometric-presentation-attack-detection-testing-levels-up)
- NIST IR 8491 (FATE Part 10, 20 Sep 2023) measured 82 passive, software-only presentation-attack-detection algorithms from 45 developers on 2D imagery, and excluded digital injection attacks (search summary). — [NIST publication page](https://www.nist.gov/publications/face-analysis-technology-evaluation-fate-part-10-performance-passive-software-based); [NIST IR 8491 PDF](https://nvlpubs.nist.gov/nistpubs/ir/2023/NIST.IR.8491.pdf)
- A consumer face system that uses infrared to check the eyes: Apple says Face ID "recognizes if your eyes are open". — [Apple Support](https://support.apple.com/en-us/102381)

### Inferences
- The candidates ranked by three tests (explainable in one sentence, visible in three stills, and not a body feature):
  1. Near-infrared light caught by the phone camera: passes all three. It is the unit's tell.
  2. Moiré ripples from filming a screen: familiar and visible, but it suits a screen-replay applicant, not a robot. At 40×48 pixels it would also read as a fabric texture.
  3. A head turn on request: real (challenge and response), but the pipeline has no turn pose.
  4. Blinks: Rule 6 already owns them.
  5. Pulse and warmth: intuitive ("a live face is warm"), but invisible in a phone video's stills and tied to the body. Reject for the video strip.
- The real personhood devices check exactly the things the clerk can't. World's Orb has a thermal camera and infrared LEDs, and the clerk has three stills. That contrast suits a Ministry memo without brand names.
- A humanoid face is in effect a Level 3 "custom-made, hyper-realistic mask" with motors behind it, an attack type no test read here includes. This is material for satire, not a fact.

### Gaps
- iBeta's pass thresholds (a search summary said error rates were "capped at 20%, and then reduced to 15%") were not verified.
- No presentation-attack standard or evaluation found that includes animatronic or robot faces.
- Whether rPPG works equally across skin tones and lighting was not researched. Either way, a "no pulse" tell would be a body feature.
- Colour-flash liveness, where a phone screen flashes colours that reflect off the face, was not researched.
- The survey's authors and year were not captured from the PMC page.

## AI and bot disclosure laws: could "a robot must say it is one" be a grounded rule?

### Takeaway
Yes, it can be grounded, dated inside the game's own year. From 2 August 2026, Article 50 of the EU AI Act requires AI systems that interact directly with people to be designed so that people are told they are dealing with an AI, "unless" that is obvious, at the latest at the first interaction. California has had a narrower bot-disclosure law since 2019. Companion-chatbot laws from 2025 and 2026 (California SB 243, Maine, New York, Utah) require notice when a reasonable person could think the bot is human. None of the sources read addresses a physical humanoid robot. A unit that looks like anyone is exactly the case where being a machine is "not obvious".

### Cited Findings
- EU AI Act Article 50(1): "Providers shall ensure that AI systems intended to interact directly with natural persons are designed and" developed so that people are informed they are interacting with an AI system, unless this is obvious "from the point of view of a natural person who is reasonably well-informed" (the Act continues, "observant and circumspect", taking the circumstances into account). Article 50(5): the information must be "provided to the natural persons concerned in a clear and distinguishable manner at the latest at the time of the first interaction or exposure. The information shall conform to the applicable accessibility requirements." It applies from 2 August 2026. Article 50(4) separately requires deployers to disclose deepfakes. — [AI Act, Article 50](https://artificialintelligenceact.eu/article/50/)
- Cooley (3 Aug 2026): Article 50 took effect on 2 August 2026, and the Commission adopted guidelines on 20 July 2026. It covers chatbots, voice assistants and AI agents that interact directly with people "unless this is already obvious", plus synthetic-media marking, emotion recognition and deepfakes. Fines reach "€15 million or 3% of worldwide annual turnover, whichever is higher". Generative systems already on the market have until 2 December 2026 to meet the marking duty. — [Cooley](https://www.cooley.com/news/insight/2026/2026-08-03-eu-ai-act-transparency-obligations-take-effect-2-august-2026); see also [European Commission, guidelines on transparency obligations](https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations) and [Code of Practice on transparency of AI-generated content](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content)
- California B.O.T. Act (SB 1001; Business and Professions Code §§17940–17943), in force since 1 July 2019 (search summary of the statute text):
  - It is unlawful "to use a bot to communicate or interact with another person in California online, with the intent to mislead the other person about its artificial identity" in order to push a sale or "to influence a vote in an election".
  - There is no liability "if the person discloses that it is a bot". The disclosure must be "clear, conspicuous, and reasonably designed to inform persons with whom the bot communicates or interacts that it is a bot".
  - A "bot" is "an automated online account where all or substantially all of the actions or posts of that account are not the result of a person".

  — [Justia, BPC §17941](https://law.justia.com/codes/california/code-bpc/division-7/part-3/chapter-6/section-17941/); [SB 1001 bill text](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201720180SB1001); [Perkins Coie, "I Am Robot"](https://perkinscoie.com/insights/update/i-am-robot-californias-new-law-requires-disclosure-use-bots)
- California SB 243 (companion chatbots) requires a "clear and conspicuous" notice where a reasonable person could be "misled to believe" they are interacting with a human. For minors it also requires disclosure that they are talking to AI and a reminder "every three hours during sustained interactions to take a break". — [Future of Privacy Forum](https://fpf.org/blog/understanding-the-new-wave-of-chatbot-legislation-california-sb-243-and-beyond/). It took effect on 1 January 2026, with a private right of action of at least $1,000 per violation (search summary). — [Cooley, Oct 2025](https://www.cooley.com/news/insight/2025/2025-10-21-ai-chatbots-at-the-crossroads-navigating-new-laws-and-compliance-risks); [Orrick, Apr 2026](https://www.orrick.com/en/Insights/2026/04/2026-State-Chatbot-Laws-Key-Provisions-and-Regulatory-Trends)
- Other 2025 laws:
  - Maine LD 1727 requires disclosure "in a clear and conspicuous manner" where a reasonable consumer couldn't tell they weren't dealing with a live human. It took effect on 24 September 2025 (search summary).
  - New York S-3008C (AI companion models) requires disclosure "at the start of each chatbot interaction and at least once every three hours". It took effect in November 2025 (search summary).
  - Utah SB 452, together with SB 226, which narrowed the rules in 2025, requires disclosure when a user asks or in high-risk interactions.

  — [FPF](https://fpf.org/blog/understanding-the-new-wave-of-chatbot-legislation-california-sb-243-and-beyond/); [FPF comparison chart, Nov 2025](https://fpf.org/wp-content/uploads/2025/11/Chatbot-Bills-Comparison-Chart-2025.pdf)
- A proposed "fourth law of robotics" (Dariusz Jemielniak, IEEE Spectrum, 14 Jan 2025): "A robot or AI must not deceive a human being by impersonating a human being." "Artificial agents must identify themselves to ensure our interactions with them are transparent and productive." The article does not discuss humanoid robots that look human. — [IEEE Spectrum](https://spectrum.ieee.org/isaac-asimov-robotics)

### Inferences
- A rulebook or memo line such as "A machine must say it is one" has a real anchor dated inside the game's own year. Article 50's exception, "unless this is obvious", gives the Ministry a deadpan follow-up, since a unit that looks like anyone is the case where it isn't obvious.
- The BOT Act covers only online accounts, and only sales and votes. A unit claiming an income matches the spirit, not the letter. Article 50 is the better anchor because it isn't limited to the internet (though see Gaps on embodied robots).
- As the Rule 0 clue itself, disclosure is weaker than the lamp:
  - It moves the clue from the stills to the transcript.
  - Unless it lives in the video's transcript and is tied to a rule, it collides with the invariant that remarks never reveal validity.
  - It is found by reading rather than by inspecting the frames.

  It works better as world-building: a Gazette item on the new law, or the unit complying word for word in its transcript while the lamp still gives it away.
- The proposed fourth law forbids exactly what a registering unit does, which makes it a clean satirical echo. It is a proposal, not law.

### Gaps
- No law was found that specifically requires a physical robot or humanoid to disclose that it is a machine. Whether Article 50 covers embodied robots was not addressed in any source read.
- South Korea's AI Basic Act (in force from January 2026) and China's AI-content labelling rules (September 2025) were not researched.
- The statutory texts of SB 243, Maine LD 1727 and New York S-3008C were not read; their details come from law-firm and FPF summaries.

## 2025 to 2026: how proof-of-personhood systems treat AI agents and humanoid robots, and whether any have tried to pass as human

### Takeaway
In 2025 and 2026 the personhood projects began serving AI agents as well as keeping them out:
- **Kleros** built courts where AI agents sit as jurors, and an "Agentic Commerce Court".
- **Proof of Humanity v2** added zero-knowledge proofs, a Circles group for verified humans and a referral system.
- **World** lets humans delegate their ID to agents (AgentKit, covered in the earlier report).
- **World's Orb and Humanity Protocol** rely on infrared and thermal sensing to prove a live human.

The sharpest real anecdote is from July 2025: OpenAI's ChatGPT Agent clicked "Verify you are human" while narrating "This step is necessary to prove I'm not a bot". No report was found of a humanoid robot trying to register as a human or claim a UBI.

### Cited Findings
- ChatGPT Agent (Reddit post of 25 Jul 2025, reported by Ars Technica): "The link is inserted, so now I'll click the 'Verify you are human' checkbox to complete the verification on Cloudflare. This step is necessary to prove I'm not a bot and proceed with the action." — [Slashdot, citing Ars Technica](https://slashdot.org/story/25/07/28/2034216/openais-chatgpt-agent-casually-clicks-through-i-am-not-a-robot-verification-test); [Futurism](https://futurism.com/chatgpt-agent-captcha)
- Kleros Project Update 2026 (describing 2025 work):
  - PoH 2.0 integrated Circles V2 with "a Circles group reserved exclusively for verified Proof of Humanity users".
  - The first zkPoH contract "using the Semaphore protocol" separates verified identity from on-chain activity.
  - An Automated Curation Court was built: "courts designed specifically for AI agents acting as jurors".
  - In experiments, "past and current cases were reviewed by large language models acting as jurors".
  - Mirrorfall.ai offers AI reads for image-similarity disputes.

  — [Kleros blog](https://blog.kleros.io/kleros-project-update-2026/)
- Kleros Development Update for August 2026 (published 11 Sep 2026):
  - PoH V2's referral system reworked the registration flow and home page, and pays out through "a disperse contract".
  - Rewards were prepared for users who claimed the PNK airdrop and staked in the Humanity Court for six months.
  - A new CLI adds "V2 beta dispute queries so agents can follow disputes, evidence, and period changes".
  - The Agentic Commerce Court gets "three ruling options" and one-hour evidence and voting periods.

  — [Kleros blog](https://blog.kleros.io/kleros-development-update-august-2026/)
- Proof of Humanity's X account: "The human layer of the internet, for this age of AI." (search result; date not captured) — [X](https://x.com/proofofhumanity/status/2021239120627106096). Kleros's documentation presents PoH as distinguishing real humans "from bots and autonomous agents" (search summary). — [Kleros docs](https://docs.kleros.io/products/proof-of-humanity)
- World's Orb liveness hardware (near-infrared, time-of-flight and thermal cameras; 740, 850 and 940 nm LEDs) is covered in the liveness section above. — [World](https://world.org/blog/engineering/opening-orb-look-inside-worldcoin-biometric-imaging-device)
- A market in personhood credentials (May 2023): iris scans from know-your-customer merchants in Cambodia were offered for under $30. Worldcoin said the traded items were verified World IDs moved to a third-party app, not iris scans, and it was unclear whether the scans were ever used to register (search summary). — [Biometric Update](https://www.biometricupdate.com/202305/worldcoin-may-have-a-biometric-data-black-market-problem); [Gizmodo](https://gizmodo.com/worldcoin-black-market-iris-data-identity-orb-1850454037)
- Agents on-chain: a crypto education site claims that active AI agents on BNB Chain rose from about 337 in early January 2026 to more than 123,000 by mid-March 2026. It also says about 20% of Arbitrum's 2023 airdrop went to sybil wallets. Both come from a single low-reliability source and are unverified. — [Yellow.com](https://yellow.com/learn/proof-of-personhood-ai-sybil-resistance-web3)

### Inferences
- A new real contrast for the satire: the registry exists to keep agents out, while the same ecosystem builds courts for agents to judge in. A unit refused registration that could sit on the jury hearing its own appeal is grounded in what Kleros did in 2025 and 2026.
- The ChatGPT Agent's narration is the unit's voice in miniature: sincere and procedural, announcing that it is proving it is not a bot while being one. Per AGENTS.md, lines should keep the behaviour and drop the brand.
- Real personhood hardware is itself a machine with infrared lamps. World's Orb uses 740, 850 and 940 nm LEDs, which a phone camera would likely show, so the Ministry's own scanner would "glow" on video as the unit does. That is a possible Gazette joke; whether a phone actually shows the Orb's LEDs was not verified.

### Gaps
- No report was found of a humanoid robot, or an AI agent, attempting to register with PoH, World ID or Humanity Protocol, or claiming a UBI payment.
- No World or Humanity Protocol statements specifically about humanoid robots were found.
- Humanity Protocol's palm-vein scanner deployment in 2026 was not verified.

## Which real phenomenon would a lay player understand in one sentence?

### Takeaway
Keep the lamp and ground its explanation in things people have done themselves. A suggested one-liner: "Its eyes are cameras; when it blinks, its night vision switches on, and a phone camera sees that infrared the way it sees a TV remote's flash." Each part is published consumer knowledge:
- the TV-remote camera test;
- the cover-the-lens test for night vision;
- the colour ("typically purple but sometimes white");
- the physics the earlier report lacked (near-infrared passes through eyelids, *Cell* 2025).

No other real phenomenon does as well on all four tests: familiar, visible in three phone stills, switching between frames so that nothing worn can fake it, and not a body feature.

### Cited Findings
- The phone-camera test for remotes and hidden cameras, and the colour: "Point it at your smartphone's primary camera and press a button"; infrared looks "typically purple but sometimes... white". — [How-To Geek](https://www.howtogeek.com/411095/how-to-detect-hidden-surveillance-cameras-with-your-phone/)
- A face scanner's infrared shows up in other cameras: "some cameras might detect infrared light". — [Apple Support](https://support.apple.com/en-us/102381)
- Front cameras usually show infrared and rear cameras often don't. — [How-To Geek](https://www.howtogeek.com/411095/how-to-detect-hidden-surveillance-cameras-with-your-phone/); [phys-edu.net](https://phys-edu.net/wp/?p=50874&lang=en)
- Night vision switches on when the lens is covered (search summary), and real cameras wait 1 to 600 s, 3 to 5 s by default, before switching. — [VicoHome](https://support.vicohome.io/hc/en-us/articles/55983556504985-How-to-Check-If-the-Infrared-Light-Is-Functioning-Properly-on-Your-Camera); [Axis](https://developer.axis.com/vapix/network-video/daynight-api/)
- Near-infrared passes through eyelids better than visible light. — [EurekAlert, *Cell* 2025](https://www.eurekalert.org/news-releases/1084046)
- A real humanoid head carries an 850 nm projector that is invisible to people and visible to sensors. — [RealSense](https://dev.realsenseai.com/docs/projectors/); [RobotShop, Unitree G1](https://www.robotshop.com/products/unitree-intel-realsense-d435i-depth-camera-g1-humanoid-robot)
- The pulse in a face is about half a grey level, invisible without amplification (search summary). — [CACM](https://cacm.acm.org/research/eulerian-video-magnification-and-analysis/)
- Machines must disclose that they are machines unless it is obvious (EU, from 2 August 2026). — [AI Act, Article 50](https://artificialintelligenceact.eu/article/50/)

### Inferences
Candidate tells compared (this research's own assessment):

| Real phenomenon | One-sentence version for a player | Familiar? | Shows in three phone stills? | Switches between frames, so a sticker can't fake it? | Body-feature risk | Verdict |
|---|---|---|---|---|---|---|
| Night vision switching on at a blink, seen by the phone like a TV remote | "When it blinks, its night vision comes on; your phone sees infrared like a remote's flash." | High (how-to guides, hidden-camera guides, Apple) | Yes, on a front camera | Yes, lit only with the eyes shut | None; it's a device | **Best. Keep, and re-explain** |
| Face ID's infrared | "Like Face ID, it lights faces with infrared that other cameras can see." | High | Yes | Not by itself; Face ID has no link to blinking | None | Use as a supporting metaphor, not the mechanism |
| A security camera's red glow at night (850 nm) | "Night cameras glow red in the dark." | Medium | Also faintly visible to the eye | Only if tied to the blink | None | Wrong for "people can't see it"; model the lamp as 940 nm, TV-remote class |
| Moiré or scan lines from a screen face | "Film a screen and you get ripples." | High | Yes, but reads as texture at 40×48 | No, present in every frame | None | Only for a screen-face unit or a replay applicant |
| Pulse in the skin (rPPG) | "A live face flushes with every heartbeat." | Medium | No, about half a grey level | — | High | Reject |
| A warm face (thermal) | "A live face is warm." | High | No, needs a thermal camera | — | High | Reject; memo flavour only (the Orb has a thermal camera) |
| "A machine must say it is one" (Article 50) | "By law, a machine must tell you it's a machine." | High | Transcript, not stills | — | None | Rule or Gazette world-building, not the Rule 0 clue |
| The IR-cut filter's click | "(click)" in the transcript at each blink | Low | Transcript | Yes | None | Flavour at most; a second clue would break "one clue, one rule" |

- Wording suggestions for the owner, subject to the writing rules:
  - In player-facing text, "night vision" may read faster than "night lamp", because players know that security cameras "switch to night vision".
  - The lamp can be a TV-remote-class light, invisible to the eye and caught by the phone.
  - The fleet's patch for the current model can use the real vocabulary: a delay before night vision switches on, which is why days 4 and 5 don't light.
  - A deadpan Ministry training tip that is also real: point a TV remote at your phone and press a button; that is what a unit looks like when it blinks.
- The violet-white palette needs no change. It matches how phones show infrared, and its reserved colours still keep it apart from skin, hair and clothing.
- The "lit exactly when the eyes are shut" test does the fairness work, which matters because other real near-infrared sources exist around people (see Gaps).

### Gaps
- No player testing, and no survey of public familiarity with the TV-remote trick.
- Untested whether players who know the trick read a violet pixel ring as infrared, or expect a white or purple bloom.
- Not researched: whether assistive or medical devices used at or near the face emit near-infrared that a phone camera would show. Examples to check include eye-gaze communication devices and other infrared-based sensors. If any do, they must never be a tell or a decoy, and the "switches with the lids" test must remain what decides.
