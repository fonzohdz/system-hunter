# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **people who have never met the author.** The app is being aimed at
strangers, not just the owner and his friends, so first-run experience, being
understandable without explanation, and supporting kit the author does not own
are all first-class concerns.

The concrete person it is built around: someone who wants to train consistently
and is motivated more by a game loop than by a spreadsheet. They train somewhere
between three and six days a week. Their equipment varies — a full commercial
gym some weeks, a hotel room with nothing some weeks — and the app has to work in
both without being reconfigured each time.

The owner is himself a user, trains around frequent work travel and long shifts,
and shares the app with friends. His gym use is real evidence, not a proxy.

## Product Purpose

An RPG-styled workout app. It issues a daily quest built from what you can
actually train with today, runs the session for you movement by movement with
timers, records what you lifted, and pays XP, gold, levels and ranks for doing
it. Success is someone opening it on a day they did not feel like training, and
training.

It is a fitness app only. It has nothing to say about food.

## Positioning

Things a neighbouring workout app could not truthfully copy:

- **The quest is generated from your constraints, not from a template.** Rank,
  equipment available *today*, goal, days per week, split position, and injury
  areas all feed one seeded generator. Change any of them and the quest rebuilds.
- **Three co-equal ways to train.** The daily quest (the app decides), a saved
  routine (you decided once), and the library (log anything). All three run
  through the same session runner, with the same timers, logging and
  progression. None is second-class.
- **Double progression that knows what it is looking at.** Reps climb to a cap
  of 3 steps on anything loaded and 6 on bodyweight; at the top of a loaded
  movement's range the app tells you to add weight and resets the reps.
- **Cosmetics are hermetically sealed from progression.** Class, weapon, palette
  and aura change only how it looks. Every class earns at exactly the same rate.

## Operating Context

- **A phone, in a gym, between sets.** Often propped on a bench, read at arm's
  length, tapped one-handed with a screen-on lock.
- **Travel and hotel rooms.** "What I have today" is a normal daily override,
  not an edge case, and it must not overwrite the saved profile.
- **Installed to a home screen.** Runs edge-to-edge under the iOS Dynamic Island
  with `env(safe-area-inset-*)` padding.
- **Two runtimes.** Standalone in a browser, and inside a Claude artifact. Both
  must keep working; storage goes through a shim that picks the right backend.
- **No account, no server, no backup.** Everything lives in one local key. Lost
  state is lost permanently.

## Capabilities and Constraints

**Confirmed functionality:** daily quest generation; guided fullscreen session
runner with rest and hold timers; saved routines; a 155-movement library with
muscle maps; equipment and injury-aware filtering; daily kit override; movement
swapping; lift history and progression; personal records; streaks with a
configurable idle tolerance; milestones; an instant dungeon; shareable hunter and
week cards; gold economy with weapons, titles, aura styles, a quest reroll and a
streak-protection item.

**Hard technical constraints:**

- **One file: `index.html`.** HTML, CSS and JS inline. No build step, no bundler,
  no dependencies, no npm. The only other files are `manifest.json`, `icon.svg`
  and `icon-maskable.svg`, which exist so the app is installable.
- Deployed by pushing to `main`; the host serves the file as-is.
- **Saved progress must survive.** State lives under `asc:hunter:v4` with
  migrations from `asc:hunter:v3` and `sh:hunter:v2`. No renaming the key, no
  removing fields, no reshaping the saved object without a migration that reads
  the old shape.
- iOS safe-area padding cannot be replaced with fixed pixels.

**Terminology:** hunter, quest, rank (E through S), aura, dungeon, vault, skill
(a movement), kit (equipment), arc.

**Explicitly undecided:** the product name. Neither "Ascendant" (current in-app
name) nor "System Hunter" (repo name) is binding; the owner is open to renaming.

**Decided against for now:** a training block / season concept with a start and
end date. The daily-quest model stays open-ended; the requirement is to make
*more history visible*, not to introduce blocks.

## Brand Commitments

- **Voice:** plain and direct. The System is terse and a little cold. No
  corporate tone, no exclamation-point enthusiasm, no "Awesome job!!" reward
  copy. Errors and empty states say what happened and what to do.
- **Health content rules, binding:** no calorie targets, no weight-loss or
  body-composition framing, no diet prescriptions, no food content anywhere. A
  food reference tab existed and was removed at the owner's request. Every
  rank-E movement must be doable by someone who has never trained. Barbell and
  overhead work carries form cues. "Soreness is fine, pain isn't" guidance stays
  visible on the quest screen.
- **Visual reference supplied by the owner (recorded, not expanded):** HD-2D, as
  in *Final Fantasy Brave Exvius: Resonance*. Four reference screenshots
  provided.
- **Name:** not a commitment. See Capabilities and Constraints.

## Evidence on Hand

- **155 authored movements** in the `EX` array in `index.html`. Each carries a
  rank, category, stat, dose, equipment list, four plain-language coaching cues,
  primary/secondary muscle data, strain areas and a seated flag. Verified this
  session: no duplicate ids, no broken progression chains, every movement has
  exactly four cues, and all seventeen muscle terms are reachable by at least one
  movement.
- **Two muscle silhouettes** (front and back) with per-muscle regions, driving
  every movement's diagram from its own `mus` data.
- **Six weapon illustrations, eight palettes, six aura particle systems**, all
  currently authored as inline SVG and canvas.
- **No user research, no analytics, no testimonials, no install numbers.** None
  of these exist and none may be invented.

## Product Principles

1. **Never punish someone for their circumstances.** Missing a day delays the
   split, it does not skip leg day. No kit today does not mean no quest. A
   movement that hurts can be swapped at no cost, and the app quietly steps
   around it afterwards.
2. **Everything you do counts.** Logging from the library feeds lift history and
   progression exactly like a guided set. Training your own way is not
   second-class.
3. **Looks are never leverage.** Nothing cosmetic touches XP, gold, stats, ranks
   or quest generation, and no class has an easier curve.
4. **Honest over generous.** Muscle tags, seated flags and strain areas are
   tagged conservatively, because an over-tagged movement produces a quest
   someone cannot actually do.
5. **The gym is the usage scene.** If it cannot be read at arm's length or tapped
   with one hand mid-set, it does not work, however good it looks on a desktop.

## Accessibility & Inclusion

- `prefers-reduced-motion` is honored: the level-up sequence degrades to a fade
  and the aura canvas stops animating.
- Modal sheets trap focus and return it to the element that opened them; Escape
  closes the topmost layer.
- Progress bars, rank badges, muscle diagrams and heatmap cells carry ARIA roles
  and labels.
- Body text is held to AA contrast against the background; the dimmer secondary
  text color is documented in the CSS as 4.98:1.
- An explicit "working around" setting builds quests around knees, shoulders,
  lower back or wrists, and a seated-only mode restricts to movements performable
  from a chair or machine.
