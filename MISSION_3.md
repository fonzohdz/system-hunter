# Mission 3: the guided run, swapping, and progression

Read `CLAUDE.md`, `MISSION_2.md` and the current `index.html` first.

Three pieces. Part 1 is the centrepiece and the reason for this mission — build
it first and build it properly.

---

## Part 1 — Guided session ("Begin Quest")

**The problem:** the app is currently a checklist you tap *after* you've already
done something. It tells you to rest 60–90 seconds and gives you nothing to time
it with. It says hold a plank for 30 seconds and makes you find your own timer.
It is a thing you look at before and after the gym, not during.

**What to build:** a fullscreen guided mode that runs the daily quest one
movement at a time, like a quest escort in an MMO. The user should be able to
put their phone on a bench, start it, and be told what to do next until the
session is over.

### Entry

The Quest tab keeps its overview list — that stays, it's how you see what today
holds. Add a prominent **Begin Quest** button at the top of it. If a session is
already in progress, that button reads **Resume Quest** and returns to where
they left off.

### Kit check — first screen of the session

**This replaces the persistent kit control built in Mission 2.** That control is
currently a permanent block of five chips sitting above the quest list every
time you open the app. It's noise: it asks a question you only need to answer
once a day, and it asks it every time you glance at the screen.

Move it into the session. Tapping **Begin Quest** opens a kit check as the first
screen:

- One question: *what do you have today?*
- The same presets — My full kit / Hotel room / Floor space only / Cardio
  machine only / Custom.
- Their profile default is preselected, so the common case is one tap on
  **Begin** and it's gone.
- Choosing something different re-rolls the quest before the session starts.
- Then it disappears for the rest of the day. Reopening or resuming a session
  does not ask again.

**On the quest overview**, replace the chip block with a single quiet line —
something like "Built for: Hotel room · change" — where the change link reopens
the picker. One line, not a panel.

If they already ran the kit check today, the line reflects what they picked. If
they haven't, it shows their profile default.

Keep everything else from Mission 2's travel mode: the presets and their
contents, the per-day scoping, the date-stamped persistence, logged-stays-logged,
and the script-verified guarantee that every preset can fill a full
five-movement quest at every rank.

### The run

Fullscreen takeover, no tab bar. One movement at a time. States:

**1. Movement brief**
- Large animated figure — this is the biggest the figure will ever render, use
  the space.
- Movement name, what it builds, the target (e.g. "3 sets of 12").
- The form cues, readable.
- Actions: **Start** · **Swap this movement** · **Skip** · exit back to overview.

**2. Working set**
- Which set: "Set 2 of 3", unmissable.
- For rep-based movements: the rep target, big. A **Set complete** button, and
  a field to log how many they actually got if it differs from the target.
- For timed holds (plank, wall sit, dead hang, carries): an actual countdown
  with a visual ring. Auto-starts on Start, pausable. Alert at zero.
- The figure keeps animating throughout — it's the reference while they work.

**3. Rest**
- Countdown ring, default 60–90s depending on the movement's category
  (compound lifts get longer, conditioning shorter).
- **What's next** preview: the next set or the next movement, so they can get set
  up before rest ends.
- **Skip rest** always available. Never trap someone in a timer.
- Alert at zero.

**4. Movement cleared**
- Brief beat showing XP and gold earned, then straight into the next brief.
  Keep this fast — it's a transition, not a celebration. Level-ups still get the
  full moment.

**5. Quest complete**
- Session summary: movements cleared, total XP and gold, time elapsed, any new
  PR or progression unlocked. Offer the shareable card here — this is the
  highest-intent moment for sharing.

### Requirements that matter more than they look

- **Keep the screen awake** during a session (Screen Wake Lock API where
  available, feature-detected, no crash where it isn't). A phone that sleeps
  mid-set makes the whole mode useless.
- **Big touch targets.** This is used standing up, at arm's length, with sweaty
  hands. Primary actions no smaller than 56px tall. Readable from a metre away.
- **Haptics** on set complete and at rest zero (`navigator.vibrate`, guarded).
- **Audible cue** at rest zero, off by default, toggleable — many people wear
  headphones. Generate it with WebAudio; do not add an audio file.
- **Survives a refresh.** Persist session state (which movement, which set,
  where in the rest timer) keyed to today. Closing the app mid-workout and
  coming back must resume, not restart.
- **Exit any time** without losing what's already logged.
- Logging inside the session awards exactly what logging from the checklist
  awards. No double-award if a movement was already logged today — check before
  granting.

### Reduced motion

Respect it. The figure holds a static working pose instead of animating; timers
and state changes still work normally.

---

## Part 2 — Swap this movement

A movement that hurts, or that you can't do today, should never mean failing the
quest. This is what stops people quitting in week one.

- Available from the quest list and from the movement brief in a session.
- Offers 3 alternatives: same category, same or adjacent rank, satisfying the
  user's current equipment (including any travel-mode override from Mission 2).
- Swapping replaces that slot in today's quest only. Persist for the day.
- No penalty. Same XP, same gold. Copy should not imply the user failed at
  anything.
- Also add a **"this hurts"** path: swapping for that reason additionally
  excludes that movement from being auto-selected for the next 14 days. Store as
  a small `avoid: {id: expiryDate}` map. Don't make it permanent and don't make
  it a medical setting — just a quiet nudge away from something that's bothering
  them.

---

## Part 3 — Progressive overload

Right now wall push-ups say 3×10 at level 1 and 3×10 at level 40. The app never
asks more of you, which means it stops working the moment you get fitter.

### 3a. Doses scale

Derive the displayed target from the exercise's base dose plus the user's level
tier and their logged performance on that movement, instead of showing a fixed
string. Keep the `d` field as the base.

Scaling should be gentle and legible — a beginner should never open the app to a
number that feels impossible. Roughly: hold the rep target until they're clearing
it comfortably, then step it up one increment.

### 3b. Track actual performance

The session mode lets users log actual reps. Store the last few results per
exercise (`perf: {id: [n,n,n]}`, capped, don't let it grow forever). Use it to
decide when to increase.

### 3c. Progression chains

Add a `next` field linking a movement to its harder successor:
wall push-up → incline → knee → full → diamond → archer.
chair squat → bodyweight squat → split squat → Bulgarian → pistol.
knee plank → plank → side plank → hollow hold.
Dead hang → knee raise → chin-up → toes-to-bar.
And so on for the obvious chains — roughly 20 links total, bodyweight lines
first since that's where beginners live.

When someone consistently clears a movement's scaled target and its successor is
unlocked, surface it: **"You've outgrown wall push-ups. Incline push-ups
unlocked."** Award XP for it — outgrowing a movement is a real milestone and
should feel like one. Then bias quest generation toward the successor.

This is the part that turns the RPG framing into something that reflects actual
training progress rather than just attendance.

---

## Constraints

Unchanged: single file, no build, no dependencies, standalone and artifact-safe,
safe areas intact. No changes to XP rates, gold rates, rank thresholds, or the
three PR tests — a movement's *target* scales, its *reward* does not.

Migrate any new saved field. Session state, swaps, avoids and perf history are
all new; make sure a save without them loads fine.

## Testing

Script-verify: pose integrity, quest generation across equipment presets and
ranks, migration, progression chains all resolve to real exercise ids with no
cycles and no dead ends.

The session mode is behavioural and can't be script-tested meaningfully. Do not
use the Chrome automation tool — it hung for 90 minutes previously. Build it,
verify what a script can, commit, and give the user a precise list of what to
click through. Be specific about what you're least sure of.

Flag anything where you had to guess at intent rather than quietly picking.

## Git

Commit before starting. Small commits per part. Don't push until the visual and
behavioural pass is done.
