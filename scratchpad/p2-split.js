/* Patch 2 — training splits.

   The evidence on splits is unusually tidy: all of full-body, upper/lower and
   push/pull/legs build muscle when weekly volume matches, and the thing that
   actually decides which one is best is HOW MANY DAYS you train. Full body wins
   at 3, upper/lower at 4, push/pull/legs at 6, because those are the versions
   that hit each muscle about twice a week.

   The app already asks S.days. So it does not need to interrogate anyone about
   splits — it picks the right one from a number it already has.

   The cycle advances on a CLEARED QUEST, not on the calendar. Splits indexed by
   weekday are how people end up never training legs: miss Wednesday and legs
   are gone for the week. Here, missing a day delays leg day, it does not skip
   it. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

/* ---- the plans ---- */
sub(`const XPLEVEL={new:1,some:5,trained:12,adv:20};`,
`const XPLEVEL={new:1,some:5,trained:12,adv:20};

/* One training day: a name and the category weights the quest is drawn from.
   Weights, not fixed slots, so the generator still varies day to day and still
   falls back gracefully when the pool is thin. */
const DAYPLAN={
 full :{n:'Full body',  w:{push:2,pull:2,legs:2,core:1,full:1}},
 upper:{n:'Upper body', w:{push:3,pull:3,core:1}},
 lower:{n:'Lower body', w:{legs:4,core:2}},
 push :{n:'Push day',   w:{push:4,core:1}},
 pull :{n:'Pull day',   w:{pull:4,core:1}},
 legs :{n:'Leg day',    w:{legs:4,core:1}}
};
/* Which rotation for how many days a week. Each hits a muscle about twice
   across the cycle, which is the part the evidence is actually clear on. */
const SPLITS={
 3:['full','full','full'],
 4:['upper','lower','upper','lower'],
 5:['push','pull','legs','upper','lower'],
 6:['push','pull','legs','push','pull','legs']
};
const splitCycle=()=>SPLITS[Math.min(6,Math.max(3,S.days||4))]||SPLITS[4];
/* null when you are not on a split — the quest is then goal-weighted as before. */
function splitToday(){
  if(S.split!=='split')return null;
  const c=splitCycle(), k=c[(S.cycle||0)%c.length];
  return Object.assign({k, i:(S.cycle||0)%c.length, len:c.length}, DAYPLAN[k]);
}`,
  'DAYPLAN and SPLITS defined, chosen by days per week');

/* ---- validate the setting ---- */
sub(`  if(S.unit!=='kg'&&S.unit!=='lb')S.unit='lb';`,
`  if(S.unit!=='kg'&&S.unit!=='lb')S.unit='lb';
  if(S.split!=='split')S.split='random';`,
  'heal(): split validated');
sub(` unit:'lb', split:'auto', cycle:0,`,` unit:'lb', split:'random', cycle:0,`,
  'fresh(): split defaults to the existing varied behaviour');

/* ---- the generator draws from the day's weights ---- */
sub(`  const rnd=seeded(d+'|'+S.lvl+'|'+effEq().join('')+'|'+S.goal+'|'+curPreset()+'|'+limitsOn().join('')),
        pl=pool(),w=GOALS[S.goal].w;`,
`  /* The plan is part of the seed, so the quest is stable through the day but a
     different training day genuinely rolls a different quest. */
  const plan=splitToday();
  const rnd=seeded(d+'|'+S.lvl+'|'+effEq().join('')+'|'+S.goal+'|'+curPreset()+'|'
    +limitsOn().join('')+'|'+(plan?plan.k+S.cycle:'')),
        pl=pool(),w=plan?plan.w:GOALS[S.goal].w;`,
  'questFor draws from the day plan when one is set');

/* ---- advance the cycle when the whole quest is cleared ---- */
sub(`      S.questBonus=true;S.clears++;award(80,50,null);o.xp+=80;o.gold+=50;`,
`      S.questBonus=true;S.clears++;S.cycle=(S.cycle||0)+1;award(80,50,null);o.xp+=80;o.gold+=50;`,
  'clearing the quest advances the split (session path)');
sub(`      S.questBonus=true;S.clears++;award(80,50,null);toast('Daily quest cleared · +80 XP · +50 gold')}`,
`      S.questBonus=true;S.clears++;S.cycle=(S.cycle||0)+1;award(80,50,null);toast('Daily quest cleared · +80 XP · +50 gold')}`,
  'clearing the quest advances the split (direct path)');

/* ---- say what today is ---- */
sub(`    <div class="blockhead"><h2>Daily Quest</h2><span class="tally">\${cleared} / \${q.length} cleared</span></div>`,
`    <div class="blockhead"><h2>\${splitToday()?esc(splitToday().n):'Daily Quest'}</h2><span class="tally">\${cleared} / \${q.length} cleared</span></div>
    \${splitToday()?\`<p class="splitline">Day \${splitToday().i+1} of \${splitToday().len} ·
      advances when you clear the quest, not when the date changes</p>\`:''}`,
  'the quest header names the training day');

sub(`.questteaser{font-size:13.5px;color:var(--ash);line-height:1.6;margin:12px 0 0}`,
`.questteaser{font-size:13.5px;color:var(--ash);line-height:1.6;margin:12px 0 0}
.splitline{font-size:11px;color:var(--ash2);line-height:1.5;margin:8px 0 0}`,
  'style for the training-day line');

/* ---- the setting ---- */
sub(`    <div class="item"><div class="ico">◷</div><div class="itxt"><h4>\${S.days} days a week</h4><p>Aura survives \${gapAllowed()} idle day\${gapAllowed()>1?'s':''}.</p></div><button class="mini" data-cycledays>Change</button></div>`,
`    <div class="item"><div class="ico">◷</div><div class="itxt"><h4>\${S.days} days a week</h4><p>Aura survives \${gapAllowed()} idle day\${gapAllowed()>1?'s':''}.</p></div><button class="mini" data-cycledays>Change</button></div>
    <div class="item"><div class="ico">▦</div><div class="itxt"><h4>\${S.split==='split'?'On a split':'Varied'}</h4>
      <p>\${S.split==='split'
        ? esc(splitCycle().map(k=>DAYPLAN[k].n).join(' · '))+'. Chosen for '+S.days+' days a week.'
        : 'Every quest is drawn across the whole body. Switch to a split to train one area a day.'}</p></div>
      <button class="mini" data-cyclesplit>Change</button></div>
    <div class="item"><div class="ico">◎</div><div class="itxt"><h4>Weights in \${S.unit}</h4>
      <p>Only changes the label. Nothing you have already logged is converted.</p></div>
      <button class="mini" data-cycleunit>Change</button></div>`,
  'Profile: split and unit settings');

sub(`  if(t.closest('[data-cycledays]')){S.days=S.days>=6?3:S.days+1;save();render();return}`,
`  if(t.closest('[data-cycledays]')){S.days=S.days>=6?3:S.days+1;save();render();return}
  if(t.closest('[data-cyclesplit]')){S.split=S.split==='split'?'random':'split';
    /* Starting a split starts it at the top, so day one is day one. */
    if(S.split==='split')S.cycle=0;
    save();render();
    toast(S.split==='split'?'On a split · '+splitToday().n+' first':'Back to varied quests');return}
  if(t.closest('[data-cycleunit]')){S.unit=S.unit==='kg'?'lb':'kg';save();render();return}`,
  'handlers for the two new settings');

fs.writeFileSync('index.html',t);
console.log('patch 2 applied');
