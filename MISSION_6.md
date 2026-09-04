# Mission 6: Provisions

Read `CLAUDE.md` and the current `index.html` first. This is the last mission in
the current plan and the one with the tightest guardrails.

## What this is

A tab of practical food ideas organised by the situation you're actually in.
Built for people who live in hotels, work long shifts, and don't have a kitchen
or the energy to use one.

The user's own situation, which is the design brief: frequent work travel,
hotels, an air fryer and a rice cooker in the room, some days fourteen hours
long. He has said the app should work for people who "don't have access to good
food or can't cook."

## What this is not — read this before writing any code

**No numbers attached to food. None.**

- No calorie counts, no macro tracking, no portion targets, no daily totals
- No weight-loss or weight-gain framing, no "cutting" or "bulking" language
- No food logging, no food diary, no scoring or grading of what someone eats
- No "good" and "bad" foods, no cheat meals, no earning or burning off food
- No linking food to workouts, streaks, XP, gold, or any progression
- No body-composition goals anywhere in the app

This isn't squeamishness. An app that assigns numbers to food and sits next to a
streak counter and a progression system becomes actively harmful for a
meaningful share of the people it reaches, and neither you nor the user can tell
which ones those are. Ideas make the app more useful to everybody. Rules and
scores make it a liability.

If a feature you're considering would let someone track, total, or score their
eating, it doesn't go in. If you think there's a version that's fine, ask rather
than building it.

The existing `CLAUDE.md` already bans this content. This mission does not
loosen that; it defines the narrow thing that is allowed.

## Build

### Structure

A new tab, **Provisions**. Content is organised by situation, not by meal type
or food group:

- **Gas station / convenience store** — what's actually decent on a road stop
- **Hotel room, no equipment** — kettle, mini fridge, nothing else
- **Hotel room, air fryer** — the user has one; a lot of people do now
- **Hotel room, rice cooker** — more versatile than people realise
- **Hotel breakfast** — how to make the free buffet work for you
- **Ten minutes, wrecked after a long shift** — the lowest-effort tier
- **Eating out** — ordering at common chains without overthinking it
- **Restocking** — a short grocery list that travels and keeps in a room

Each section holds a handful of concrete options. Not recipes with precise
quantities — ideas with enough detail to act on. "Rotisserie chicken, microwave
rice pouch, bagged salad" is the right level. A twelve-step recipe is not.

### Detail level

Where something genuinely benefits from method — air fryer chicken, rice cooker
one-pots — give a short how-to. Times and temperatures are fine; those are
cooking instructions, not nutrition targets. Keep it to a few lines.

### Filtering

Let the user filter by what they have: nothing, kettle, microwave, air fryer,
rice cooker, mini fridge. Reuse the equipment-picker pattern already in the app.
Optionally reuse their profile equipment step — but food equipment is separate
from gym equipment, so keep the fields distinct.

Also support common dietary preferences as filters: vegetarian, vegan, halal,
kosher, no pork, no dairy, no nuts, gluten-free. These are **preferences and
restrictions, not health tracking** — they filter which ideas show, nothing
more. Store them as a simple list.

### Voice

Same voice as the rest of the app: dry, direct, practical. No wellness language,
no "fuel your body," no moralising about convenience food. Someone eating a gas
station sandwich at 9pm after a fourteen-hour day is doing fine and the copy
should read like it knows that.

The app's fantasy framing can extend here lightly — "Provisions" is already the
right word, and rations/supplies language fits. Don't overdo it. Nobody wants
their dinner called a Potion of Sustenance.

### Static content

This is a static content tab. No API, no generated suggestions, no personalised
plans. Write good content into the file and let people read it. That keeps it
offline-capable, which matters given the audience is people in hotels with bad
wifi.

## Constraints

Single file, no build step, no dependencies. This is mostly content, so watch
file size — if the whole app crosses ~250KB, flag it rather than splitting
unilaterally.

Nothing here touches XP, gold, quests, streaks or progression. Provisions is a
reference tab and connects to nothing.

## Testing

There's little to script here beyond confirming the filters return results for
every combination and that no combination produces an empty tab.

The real check is reading the copy. Read every line and ask whether it would
land badly for someone with a difficult relationship with food. If a line feels
like it's grading someone, rewrite it.

Do not use the Chrome automation tool.

## Git

Commit before starting. This should be one or two clean commits — it's additive
and shouldn't touch existing systems.
