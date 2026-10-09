// Exercise table and preset programs. Rep ranges live on the program slot,
// not the exercise, so the same movement can be heavy in one day and light in another.

/** @typedef {{id:string,name:string,pattern:string,loaded:boolean,compound:boolean,howTo:string}} Exercise */

const E = (id, name, pattern, loaded, compound, howTo) => ({ id, name, pattern, loaded, compound, howTo });

/** @type {Record<string, Exercise>} */
export const EXERCISES = Object.fromEntries([
  // gym, loaded
  E('back_squat', 'Back Squat', 'squat', true, true, 'Brace your core, sit down between your heels until thighs hit parallel, drive up through mid-foot.'),
  E('bench', 'Bench Press', 'hpush', true, true, 'Shoulder blades pinched, feet planted, lower the bar to mid-chest and press up over your shoulders.'),
  E('lat_pulldown', 'Lat Pulldown', 'vpull', true, true, 'Chest up, pull the bar to your upper chest by driving your elbows down, control it back up.'),
  E('rdl', 'Romanian Deadlift', 'hinge', true, true, 'Soft knees, push your hips back and slide the bar down your thighs until you feel your hamstrings, then stand tall.'),
  E('trap_dl', 'Trap Bar Deadlift', 'hinge', true, true, 'Stand in the middle, flat back, push the floor away and stand up tall; lower under control.'),
  E('ohp', 'Overhead Press', 'vpush', true, true, 'Squeeze glutes, press the bar straight up past your face, finish with it over your mid-foot.'),
  E('cable_row', 'Seated Cable Row', 'hpull', true, true, 'Sit tall, pull the handle to your stomach leading with elbows, pause, let your arms reach forward.'),
  E('walking_lunge', 'Walking Lunge', 'lunge', true, true, 'Long step, drop the back knee toward the floor, push through the front heel into the next step.'),
  E('barbell_row', 'Barbell Row', 'hpull', true, true, 'Hinge to about 45°, flat back, row the bar to your lower ribs, lower with control.'),
  E('leg_press', 'Leg Press', 'squat', true, true, 'Feet shoulder-width, lower until knees reach about 90°, press without locking your knees hard.'),
  E('leg_curl', 'Leg Curl', 'legiso', true, false, 'Curl your heels toward your glutes, squeeze, lower slowly.'),
  E('calf_raise', 'Standing Calf Raise', 'calves', true, false, 'Full stretch at the bottom, rise as high as you can, pause at the top.'),
  E('incline_db', 'Incline DB Press', 'hpush', true, true, 'Bench at about 30°, lower the dumbbells to upper chest, press up and slightly together.'),
  E('assisted_pullup', 'Assisted Pull-up', 'vpull', true, true, 'Use the least assistance you can; pull your chest toward the bar, lower all the way.'),
  E('db_shoulder', 'Seated DB Shoulder Press', 'vpush', true, true, 'Back against the pad, press the dumbbells overhead, lower to ear height.'),
  E('lateral', 'Lateral Raise', 'lateral', true, false, 'Slight bend in the elbows, raise the dumbbells out to shoulder height, lower slowly.'),
  E('hammer_curl', 'Hammer Curl', 'biceps', true, false, 'Palms facing each other, curl without swinging, lower slowly.'),
  E('db_curl', 'Dumbbell Curl', 'biceps', true, false, 'Elbows pinned to your sides, curl up, squeeze, lower slowly.'),
  E('pushdown', 'Tricep Pushdown', 'triceps', true, false, 'Elbows tucked at your sides, push down until arms are straight, let it back up to 90°.'),
  E('bulgarian', 'Bulgarian Split Squat', 'lunge', true, true, 'Back foot on a bench, drop straight down until the front thigh is parallel, drive up through the front heel.'),
  E('hip_thrust', 'Hip Thrust', 'hinge', true, true, 'Upper back on a bench, drive hips up until your body is flat, squeeze glutes at the top.'),
  E('leg_ext', 'Leg Extension', 'legiso', true, false, 'Straighten your legs fully, squeeze your quads, lower slowly.'),
  E('face_pull', 'Face Pull', 'hpull', true, false, 'Rope at face height, pull toward your forehead with elbows high, spread the rope apart.'),
  // dumbbells at home, loaded
  E('goblet', 'Goblet Squat', 'squat', true, true, 'Hold one dumbbell at your chest, sit down between your knees, stand back up tall.'),
  E('db_press', 'DB Bench or Floor Press', 'hpush', true, true, 'Lower the dumbbells until your upper arms touch the bench or floor, press back up.'),
  E('db_row', 'One-Arm DB Row', 'hpull', true, true, 'Hand and knee on a bench, flat back, row the dumbbell to your hip.'),
  E('db_rdl', 'DB Romanian Deadlift', 'hinge', true, true, 'Soft knees, push hips back and slide the dumbbells down your legs, stand tall.'),
  E('db_split', 'DB Split Squat', 'lunge', true, true, 'Staggered stance, drop the back knee straight down, push up through the front foot.'),
  E('db_ohp', 'DB Shoulder Press', 'vpush', true, true, 'Standing tall, press the dumbbells overhead, lower to ear height.'),
  // bodyweight
  E('plank', 'Plank', 'core', false, false, 'Forearms down, body in a straight line, squeeze glutes and abs, breathe.'),
  E('knee_raise', 'Hanging Knee Raise', 'core', false, false, 'Hang still, pull your knees up toward your chest, lower without swinging.'),
  E('pushup', 'Push-up', 'hpush', false, true, 'Hands under shoulders, body straight, chest to the floor, push back up. Knees down is fine.'),
  E('glute_bridge', 'Glute Bridge', 'hinge', false, false, 'On your back, feet flat, drive your hips up and squeeze your glutes at the top.'),
  E('bw_squat', 'Bodyweight Squat', 'squat', false, true, 'Arms out front, sit down until thighs are parallel, stand up tall.'),
  E('sl_rdl', 'Single-Leg RDL', 'hinge', false, false, 'Stand on one leg, hinge forward with a flat back as the other leg reaches back, stand up.'),
  E('superman', 'Superman', 'vpull', false, false, 'Face down, lift arms, chest and legs off the floor, hold a second, lower.'),
  E('reverse_lunge', 'Reverse Lunge', 'lunge', false, true, 'Step back, drop the back knee toward the floor, push through the front heel to stand.'),
  E('pike', 'Pike Push-up', 'vpush', false, true, 'Hips high in an upside-down V, lower your head toward the floor between your hands, press up.'),
  E('chair_dip', 'Chair Dip', 'triceps', false, false, 'Hands on a sturdy chair behind you, lower until elbows hit 90°, press back up.'),
  E('shoulder_tap', 'Plank Shoulder Tap', 'core', false, false, 'High plank, tap the opposite shoulder without letting your hips rock.'),
  E('ytw', 'Prone Y-T-W Raise', 'hpull', false, false, 'Face down, lift your arms into a Y, then a T, then a W, squeezing your shoulder blades.'),
  E('sl_calf', 'Single-Leg Calf Raise', 'calves', false, false, 'On one foot near a wall, rise as high as you can, lower slowly.')
].map((e) => [e.id, e]));

/** Bodyweight replacement per movement pattern for "No gym today". null = drop it. */
export const BODYWEIGHT_FALLBACK = {
  squat: 'bw_squat', hinge: 'sl_rdl', lunge: 'reverse_lunge', hpush: 'pushup', vpush: 'pike',
  hpull: 'ytw', vpull: 'superman', core: 'plank', triceps: 'chair_dip', biceps: null,
  lateral: null, calves: 'sl_calf', legiso: 'glute_bridge'
};

/** Rep range for a bodyweight fallback, since the gym slot's range may not fit. */
const FALLBACK_RANGE = {
  bw_squat: [15, 20], sl_rdl: [8, 12], reverse_lunge: [10, 12], pushup: [8, 15], pike: [6, 10],
  ytw: [8, 12], superman: [10, 15], plank: [30, 45], chair_dip: [8, 12], sl_calf: [12, 15], glute_bridge: [12, 20]
};

const S = (ex, sets, lo, hi, opts = {}) => ({ ex, sets, lo, hi, unit: opts.sec ? 'sec' : 'reps', perSide: !!opts.side });

const UPPER_A = { key: 'upperA', name: 'Upper A', slots: [S('bench', 4, 6, 10), S('barbell_row', 4, 6, 10), S('ohp', 3, 8, 12), S('lat_pulldown', 3, 8, 12), S('db_curl', 2, 10, 15), S('pushdown', 2, 10, 15)] };
const LOWER_A = { key: 'lowerA', name: 'Lower A', slots: [S('back_squat', 4, 6, 10), S('rdl', 3, 8, 12), S('leg_press', 3, 10, 15), S('leg_curl', 3, 10, 15), S('calf_raise', 3, 12, 15)] };
const UPPER_B = { key: 'upperB', name: 'Upper B', slots: [S('incline_db', 4, 8, 12), S('assisted_pullup', 4, 6, 10), S('db_shoulder', 3, 8, 12), S('cable_row', 3, 8, 12), S('lateral', 3, 12, 15), S('hammer_curl', 2, 10, 15)] };
const LOWER_B = { key: 'lowerB', name: 'Lower B', slots: [S('trap_dl', 3, 5, 8), S('bulgarian', 3, 8, 12, { side: true }), S('hip_thrust', 3, 8, 12), S('leg_ext', 3, 10, 15), S('knee_raise', 3, 10, 15)] };

/** @type {Record<string, {id:string,name:string,days:{key:string,name:string,slots:any[]}[]}>} */
export const PROGRAMS = {
  gym_full: {
    id: 'gym_full', name: 'Full Body (Gym)', days: [
      { key: 'gymFullA', name: 'Full Body A', slots: [S('back_squat', 3, 6, 10), S('bench', 3, 6, 10), S('lat_pulldown', 3, 8, 12), S('rdl', 3, 8, 12), S('plank', 3, 30, 45, { sec: true })] },
      { key: 'gymFullB', name: 'Full Body B', slots: [S('trap_dl', 3, 5, 8), S('ohp', 3, 6, 10), S('cable_row', 3, 8, 12), S('walking_lunge', 3, 10, 12, { side: true }), S('knee_raise', 3, 10, 15)] }
    ]
  },
  gym_ul: { id: 'gym_ul', name: 'Upper/Lower', days: [UPPER_A, LOWER_A, UPPER_B, LOWER_B] },
  gym_ppl: {
    id: 'gym_ppl', name: 'Push/Pull/Legs+', days: [
      { key: 'push', name: 'Push Day', slots: [S('bench', 4, 6, 10), S('ohp', 3, 8, 12), S('incline_db', 3, 8, 12), S('lateral', 3, 12, 15), S('pushdown', 3, 10, 15)] },
      { key: 'pull', name: 'Pull Day', slots: [S('barbell_row', 4, 6, 10), S('lat_pulldown', 3, 8, 12), S('cable_row', 3, 10, 12), S('face_pull', 3, 12, 15), S('db_curl', 3, 10, 15)] },
      { ...LOWER_A, key: 'legs', name: 'Leg Day' },
      { ...UPPER_A, key: 'pplUpper', name: 'Upper Day' },
      { ...LOWER_B, key: 'pplLower', name: 'Lower Day' }
    ]
  },
  db_full: {
    id: 'db_full', name: 'Full Body (Dumbbells)', days: [
      { key: 'dbFullA', name: 'Full Body A', slots: [S('goblet', 3, 8, 12), S('db_press', 3, 8, 12), S('db_row', 3, 8, 12, { side: true }), S('db_rdl', 3, 8, 12), S('plank', 3, 30, 45, { sec: true })] },
      { key: 'dbFullB', name: 'Full Body B', slots: [S('db_split', 3, 8, 12, { side: true }), S('db_ohp', 3, 8, 12), S('pushup', 3, 8, 15), S('glute_bridge', 3, 12, 20), S('db_curl', 2, 10, 15)] }
    ]
  },
  bw_full: {
    id: 'bw_full', name: 'Full Body (Bodyweight)', days: [
      { key: 'bwFullA', name: 'Full Body A', slots: [S('bw_squat', 3, 15, 20), S('pushup', 3, 8, 15), S('sl_rdl', 3, 8, 12, { side: true }), S('superman', 3, 10, 15), S('plank', 3, 30, 45, { sec: true })] },
      { key: 'bwFullB', name: 'Full Body B', slots: [S('reverse_lunge', 3, 10, 12, { side: true }), S('pike', 3, 6, 10), S('glute_bridge', 3, 12, 20), S('chair_dip', 3, 8, 12), S('shoulder_tap', 3, 16, 24)] }
    ]
  }
};

/** Pick the program from the onboarding answers. */
export function programFor(location, daysPerWeek) {
  if (location === 'none') return 'bw_full';
  if (location === 'home') return 'db_full';
  if (daysPerWeek >= 5) return 'gym_ppl';
  if (daysPerWeek === 4) return 'gym_ul';
  return 'gym_full';
}

/** Default training weekdays (0 = Monday) for a days-per-week answer. */
export function defaultTrainingDays(daysPerWeek) {
  return { 2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5] }[daysPerWeek] || [0, 2, 4];
}

/** Replace each slot with its bodyweight version; drop nulls and duplicates; cap at 5. */
export function toBodyweight(slots) {
  const out = [];
  const seen = new Set();
  for (const slot of slots) {
    const ex = EXERCISES[slot.ex];
    let id = ex.loaded ? BODYWEIGHT_FALLBACK[ex.pattern] : ex.id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (id === slot.ex) out.push(slot);
    else {
      const [lo, hi] = FALLBACK_RANGE[id];
      out.push({ ex: id, sets: slot.sets, lo, hi, unit: id === 'plank' ? 'sec' : 'reps', perSide: id === 'sl_rdl' || id === 'reverse_lunge' || id === 'sl_calf' });
    }
    if (out.length === 5) break;
  }
  return out;
}

/** Penalty finisher, scaled by experience. */
export function finisher(experience) {
  const isNew = experience === 'new';
  return { rounds: isNew ? 2 : 3, burpees: isNew ? 6 : 10, climbers: 20, plankSec: 30 };
}

/** The optional rest-day cardio quest. */
export function cardioQuest(experience) {
  return {
    name: 'Cardio',
    text: experience === 'new' ? 'Walk 20–30 min' : 'Walk, jog or bike 20–30 min, easy pace',
    minutes: 25
  };
}
