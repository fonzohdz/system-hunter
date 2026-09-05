/* Patch 6 — make the tour tell the truth.

   The onboarding tour had drifted from the app, mostly because of changes I
   made and did not follow through:

     ".blade  — This is your weapon"     the weapon is not on the home screen
                                         any more; that element is the aura and
                                         your name
     "Five movements"                    quest length is 3-7 now, from S.days
     "Every one animates"                the exercise figures were removed; this
                                         promised new users something the app
                                         has not done for months
     "Spend gold on titles and palettes" palettes are free; gold buys weapons,
                                         titles and the elixir

   And it said nothing about routines, splits, session length or weight
   logging. A tour that describes a different app is worse than no tour. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

sub(` {sel:'.blade',t:'This is your weapon',x:'It burns as long as you keep training. Let the streak die and it goes dark and dull.'},`,
` {sel:'.blade',t:'Your aura',x:'It burns as long as you keep training and goes out if the streak dies. Your weapon and palette live in the Vault.'},`,
  '.blade step no longer calls the aura a weapon');

sub(` {sel:'[data-begin]',t:'Begin Quest',x:'Five movements picked for your goal and your kit, rebuilt every morning. You see them one at a time, with timers for the holds and the rests.'},`,
` {sel:'[data-begin]',t:'Begin Quest',x:'Movements picked for your goal and your kit, rebuilt every morning. You see them one at a time, with timers for the holds and the rests. How many you get depends on how many days a week you train.'},`,
  'quest step stops promising exactly five');

sub(` {sel:'[data-dungeon]',t:'Instant dungeon',`,
` {sel:'[data-newroutine]',t:'Your own workouts',x:'Already know what you are doing? Save your own session and run it with the same timers, weight logging and progression as a quest. Or ignore all of it and log anything straight from the library.'},
 {sel:'[data-dungeon]',t:'Instant dungeon',`,
  'new step for routines');

sub(` {sel:'[data-tab="lib"]',t:'The library',x:'155 movements from wall push-ups to power cleans, ranked E through A. Every one animates so you can see the shape of it before you try it. Filter by muscle to find what you want.'},`,
` {sel:'[data-tab="lib"]',t:'The library',x:'155 movements from wall push-ups to power cleans, ranked E through A. Each one shades a body map so you can see what it works, with four plain-language cues. Filter by muscle to find what you want.'},`,
  'library step describes the body map instead of animations that do not exist');

sub(` {sel:'[data-tab="rec"]',t:'Records and your card',x:'Track your max push-ups, squats and plank. Milestones live here, and the two cards worth sending to the group chat.'},`,
` {sel:'[data-tab="rec"]',t:'Records and your card',x:'Every lift you log shows up here against what you did last time. Max push-ups, squats and plank, milestones, and the two cards worth sending to the group chat.'},`,
  'records step mentions the lift history');

sub(` {sel:'[data-tab="vault"]',t:'The vault',x:'Change your class or palette any time — it costs nothing and resets nothing. Spend gold on titles and new palettes. Goal, kit and rest days live here too.'}`,
` {sel:'[data-tab="vault"]',t:'The vault',x:'Change your class or palette any time — all eight palettes are free and nothing resets. Gold buys weapons, titles and the Elixir of Rest. Your goal, kit, session length and whether you train on a split live here too.'}`,
  'vault step: palettes are free, and it points at the new settings');

fs.writeFileSync('index.html',t);
console.log('patch 6 applied');
