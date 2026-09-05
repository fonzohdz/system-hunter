/* Patch 4 — session length that matches the week, and real support for doing
   your own thing.

   Two problems, one theme.

   1. Quest length was hardcoded to 5 regardless of S.days. Three days a week
      gave 15 movements, six gave 30 — so the people training least got the
      least, which is backwards. 'auto' now spreads a similar weekly volume
      across however many days you actually train. Anyone who would rather
      decide for themselves can pin it to 3, 5 or 7.

   2. The Library's "Log it" awarded XP and gold but never called recordPerf.
      Someone who ignores the quest and does their own session got a number on
      their level bar and nothing in Lifts, no load, no progression. The quest
      is meant to be a suggestion, not the only way to use the app, so logging
      from the Library now records exactly what the guided session records. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

/* ---- 1. quest length ---- */
sub(`const splitCycle=()=>SPLITS[Math.min(6,Math.max(3,S.days||4))]||SPLITS[4];`,
`const splitCycle=()=>SPLITS[Math.min(6,Math.max(3,S.days||4))]||SPLITS[4];
/* Movements per quest. 'auto' keeps the WEEK roughly constant instead of the
   day, so training three days means longer sessions rather than a third of the
   work. Everything else is a flat pin for people who would rather choose. */
const VOLAUTO={3:7,4:6,5:5,6:4};
const VOLN={short:3,standard:5,long:7};
function questLen(){
  if(VOLN[S.vol])return VOLN[S.vol];
  return VOLAUTO[Math.min(6,Math.max(3,S.days||4))]||5;
}
const weekMoves=()=>questLen()*(S.days||4);`,
  'questLen(): auto scales with days, or pin it to 3 / 5 / 7');

sub(` unit:'lb', split:'random', cycle:0,`,` unit:'lb', split:'random', cycle:0, vol:'auto',`,
  'fresh(): vol');
sub(`  if(S.split!=='split')S.split='random';`,
`  if(S.split!=='split')S.split='random';
  if(!VOLN[S.vol])S.vol='auto';`,
  'heal(): vol validated');

sub(`  while(out.length<5&&guard++<200){`,`  while(out.length<questLen()&&guard++<200){`,
  'the generator honours the length');

sub(`    +limitsOn().join('')+'|'+(plan?plan.k+S.cycle:'')),`,
`    +limitsOn().join('')+'|'+(plan?plan.k+S.cycle:'')+'|'+questLen()),`,
  'length is part of the seed, so changing it rerolls today');

/* ---- 2. the setting ---- */
sub(`    <div class="item"><div class="ico">▦</div><div class="itxt"><h4>\${S.split==='split'?'On a split':'Varied'}</h4>`,
`    <div class="item"><div class="ico">≡</div><div class="itxt"><h4>\${
      S.vol==='auto'?'Session length: automatic':'Session length: '+questLen()+' movements'}</h4>
      <p>\${questLen()} a day, about \${weekMoves()} a week.\${S.vol==='auto'
        ? ' Set from your '+(S.days||4)+' days — fewer days means longer sessions.'
        : ' Pinned. Switch back to automatic to let your days decide.'}</p></div>
      <button class="mini" data-cyclevol>Change</button></div>
    <div class="item"><div class="ico">▦</div><div class="itxt"><h4>\${S.split==='split'?'On a split':'Varied'}</h4>`,
  'Profile: session length');

sub(`  if(t.closest('[data-cycleunit]')){S.unit=S.unit==='kg'?'lb':'kg';save();render();return}`,
`  if(t.closest('[data-cycleunit]')){S.unit=S.unit==='kg'?'lb':'kg';save();render();return}
  if(t.closest('[data-cyclevol]')){
    const order=['auto','short','standard','long'];
    S.vol=order[(order.indexOf(S.vol)+1)%order.length];
    /* Today's quest is already half done for some people; keep what they have
       cleared and let the new length apply from the next roll. */
    save();render();
    toast(S.vol==='auto'?'Session length follows your days again'
      :questLen()+' movements a quest');return}`,
  'handler cycles auto / 3 / 5 / 7');

/* ---- 3. logging your own work records it properly ---- */
sub(`     :\`<button class="btn" data-log="\${e.id}" \${doneToday?'disabled':''}>\${doneToday?'Logged today':'Log it · +'+(inQ?25:15)+' XP'}</button>\`}`,
`     :\`\${doneToday?'':\`<div class="logrow">
        <label for="lgreps">\${isTimed(e)?'Seconds held':'Reps'} on your best set</label>
        <input class="prin" id="lgreps" type="number" inputmode="numeric" min="0"
          placeholder="\${targetReps(e)||''}">
      </div>
      \${loaded(e)?\`<div class="logrow">
        <label for="lgload">Weight, in \${S.unit}</label>
        <input class="prin" id="lgload" type="number" inputmode="decimal" min="0" step="0.5"
          placeholder="\${lastLoad(e)||'—'}">
      </div>\`:''}\`}
      <button class="btn" data-log="\${e.id}" \${doneToday?'disabled':''}>\${doneToday?'Logged today':'Log it · +'+(inQ?25:15)+' XP'}</button>\`}`,
  'the Library sheet asks what you actually did');

sub(`  const lg=t.closest('[data-log]');
  if(lg){
    const e=EX.find(x=>x.id===lg.dataset.log),q=rollQuest(),inQ=q.some(x=>x.id===e.id);
    touchStreak();`,
`  const lg=t.closest('[data-log]');
  if(lg){
    const e=EX.find(x=>x.id===lg.dataset.log),q=rollQuest(),inQ=q.some(x=>x.id===e.id);
    /* Whatever they typed counts the same as a guided set: it feeds Lifts and
       it moves the target. Training your own way is not second-class. */
    const ri=document.getElementById('lgreps'), li=document.getElementById('lgload');
    const reps=ri&&ri.value!==''?parseInt(ri.value,10):null;
    const load=li&&li.value!==''?parseFloat(li.value):null;
    touchStreak();`,
  'the handler reads them');

sub(`    noteLogged(e);checkAch();
    closeSheet();render();return}`,
`    if(reps!=null)recordPerf(e,reps,load);
    noteLogged(e);checkAch();
    closeSheet();render();return}`,
  'and records the set, so Lifts and progression see it');

fs.writeFileSync('index.html',t);
console.log('patch 4 applied');
