/* Patch 1 — record the weight, and progress it.

   Until now progression had one axis: reps. targetReps() added +2 reps (or +5s)
   after two hits and S.perf stored a bare rep count. But EQNAME lists dumbbells,
   kettlebell, barbell, EZ bar, trap bar and bench, and for a loaded movement
   "you hit 3x8, now do 3x20" is bad coaching. The fix is double progression,
   which is what a coach would actually tell you: climb a short rep range, then
   add weight and drop back to the bottom of the range.

   S.perf entries change shape from `8` to `{r:8,l:20}`. heal() reads the old
   shape and upgrades it, so no existing history is lost and the storage key
   does not move. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

/* ---- 1. new saved fields ---- */
sub(` perf:{}, prog:{}, outgrown:[], swaps:null, avoid:{}, sess:null, kitAsked:null, sound:false,`,
    ` perf:{}, prog:{}, outgrown:[], swaps:null, avoid:{}, sess:null, kitAsked:null, sound:false,
 /* unit is display only — loads are stored exactly as typed, in that unit. */
 unit:'lb', split:'auto', cycle:0,`,
  'fresh(): unit, split, cycle');

/* ---- 2. migrate the perf shape in place ---- */
sub(`  for(const k of ['perf','prog','avoid'])if(!S[k]||typeof S[k]!=='object')S[k]={};`,
`  for(const k of ['perf','prog','avoid'])if(!S[k]||typeof S[k]!=='object')S[k]={};
  /* perf entries used to be bare rep counts and now carry a load. Read the old
     shape and upgrade it — this runs on every load, so a save written by an
     older build is repaired rather than discarded. */
  for(const id in S.perf){
    const a=S.perf[id];
    if(!Array.isArray(a)){delete S.perf[id];continue}
    S.perf[id]=a.map(v=>typeof v==='number'?{r:v,l:0}
      :(v&&typeof v==='object'&&Number.isFinite(v.r)?{r:v.r,l:+v.l||0}:null)).filter(Boolean);
  }
  if(S.unit!=='kg'&&S.unit!=='lb')S.unit='lb';
  if(typeof S.cycle!=='number'||!(S.cycle>=0))S.cycle=0;`,
  'heal(): perf migrated from bare numbers, unit and cycle validated');

/* ---- 3. double progression ---- */
sub(`const PROGCAP=6;                       // steps, so a target roughly doubles at most
function progStep(id){
  const p=S.prog[id];
  const earned=p?Math.min(PROGCAP,p.step||0):0;
  /* A gentle nudge from level on top, so a returning trainee is not stuck on
     beginner numbers, but never enough to be scary: +2 steps at most. */
  return Math.min(PROGCAP,earned+Math.min(2,Math.floor(S.lvl/15)));
}`,
`const PROGCAP=6;                       // steps, so a target roughly doubles at most
/* A loaded movement has a second axis, so its reps only climb a short range
   before the weight goes up instead. A bodyweight movement has no second axis,
   so reps are the only thing that can grow and they climb further. */
const loaded=e=>!!(e&&e.eq&&e.eq.length);
const repCap=e=>loaded(e)?3:PROGCAP;
function progStep(e){
  const id=typeof e==='string'?e:e.id;
  const cap=typeof e==='string'?PROGCAP:repCap(e);
  const p=S.prog[id];
  const earned=p?Math.min(cap,p.step||0):0;
  /* A gentle nudge from level on top, so a returning trainee is not stuck on
     beginner numbers, but never enough to be scary: +2 steps at most. */
  return Math.min(cap,earned+Math.min(2,Math.floor(S.lvl/15)));
}
/* Last load used on a movement, for the placeholder and the recall line. */
function lastLoad(e){const a=S.perf[e.id]||[];
  for(let i=a.length-1;i>=0;i--)if(a[i].l>0)return a[i].l;
  return 0}
const fmtPerf=(v,e)=>v.l>0?v.r+(isTimed(e)?'s':'')+' × '+v.l+S.unit
                          :v.r+(isTimed(e)?'s':'');`,
  'progStep takes the movement; rep cap is 3 when loaded, 6 when not');

sub(`  const st=progStep(e.id);
  const reps=p.time?p.reps+st*5:p.reps+st*2;   // holds grow in seconds, reps in reps`,
`  const st=progStep(e);
  const reps=p.time?p.reps+st*5:p.reps+st*2;   // holds grow in seconds, reps in reps`,
  'scaledDose uses the new progStep');

sub(`function targetReps(e){const p=doseParts(e);if(!p)return null;
  const st=progStep(e.id);return p.time?p.reps+st*5:p.reps+st*2}`,
`function targetReps(e){const p=doseParts(e);if(!p)return null;
  const st=progStep(e);return p.time?p.reps+st*5:p.reps+st*2}`,
  'targetReps uses the new progStep');

sub(`function recordPerf(e,actual){
  if(!Number.isFinite(actual)||actual<=0)return;
  const a=S.perf[e.id]||(S.perf[e.id]=[]);
  a.push(actual); while(a.length>5)a.shift();      // capped; this never grows
  const t=targetReps(e); if(t===null)return;
  const p=S.prog[e.id]||(S.prog[e.id]={step:0,hits:0});
  if(actual>=t){p.hits=(p.hits||0)+1;
    if(p.hits>=2&&p.step<PROGCAP){p.step++;p.hits=0;
      toast('Target up · '+e.n+' is now '+scaledDose(e))}}
  else p.hits=0;
}`,
`function recordPerf(e,actual,load){
  if(!Number.isFinite(actual)||actual<=0)return;
  const a=S.perf[e.id]||(S.perf[e.id]=[]);
  a.push({r:actual, l:Number.isFinite(load)&&load>0?load:0});
  while(a.length>5)a.shift();                     // capped; this never grows
  const t=targetReps(e); if(t===null)return;
  const p=S.prog[e.id]||(S.prog[e.id]={step:0,hits:0});
  if(actual<t){p.hits=0;return}
  p.hits=(p.hits||0)+1;
  if(p.hits<2)return;
  p.hits=0;
  if(p.step<repCap(e)){p.step++;
    toast('Target up · '+e.n+' is now '+scaledDose(e));return}
  /* Top of the rep range on something you can load: the weight goes up and the
     reps go back to the bottom. Bodyweight movements just stay at the cap. */
  if(loaded(e)){p.step=0;
    toast('Add weight on '+e.n+' · back to '+scaledDose(e))}
}`,
  'recordPerf stores the load and runs double progression');

/* ---- 4. carry the load through the session ---- */
sub(`function clearMovement(e,actual){`,`function clearMovement(e,actual,load){`,
  'clearMovement takes the load');
sub(`  if(actual!=null)recordPerf(e,actual);
  noteLogged(e);`,
`  if(actual!=null)recordPerf(e,actual,load);
  noteLogged(e);`,
  'clearMovement passes it on');

sub(`    const inp=document.getElementById('actual');
    const got=inp&&inp.value!==''?parseInt(inp.value,10):null;`,
`    const inp=document.getElementById('actual');
    const got=inp&&inp.value!==''?parseInt(inp.value,10):null;
    const lin=document.getElementById('load');
    const lot=lin&&lin.value!==''?parseFloat(lin.value):null;
    /* Remember it for the rest of the movement, so the weight is typed once. */
    if(Number.isFinite(lot)&&lot>0)o.load=lot;
    const useLoad=Number.isFinite(o.load)&&o.load>0?o.load:null;`,
  'the work screen reads a weight as well as a rep count');

sub(`      o.log=o.log||[];o.log.push({n:e.n,set:o.set,reps:got});
      toast('Set '+o.set+' · '+got+' reps logged');
    }
    if(o.set>=sets){clearMovement(e,got);return}
    if(got!=null)recordPerf(e,got);`,
`      o.log=o.log||[];o.log.push({n:e.n,set:o.set,reps:got,load:useLoad||0});
      toast('Set '+o.set+' · '+got+' reps'+(useLoad?' × '+useLoad+S.unit:'')+' logged');
    }
    if(o.set>=sets){clearMovement(e,got,useLoad);return}
    if(got!=null)recordPerf(e,got,useLoad);`,
  'the logged set says the weight back to you');

/* a new movement starts with no remembered weight */
sub(`    const o=sess(),q=questToday();o.i++;o.set=1;o.st='brief';o.endAt=0;`,
`    const o=sess(),q=questToday();o.i++;o.set=1;o.st='brief';o.endAt=0;o.load=0;`,
  'the remembered weight resets between movements');

/* ---- 5. the two places it shows ---- */
sub(`    \${(S.perf[e.id]||[]).length?\`<p class="lastlog"><span>Last time</span>
      \${S.perf[e.id].slice(-3).join(' · ')}\${isTimed(e)?'s':' reps'}</p>\`:''}`,
`    \${(S.perf[e.id]||[]).length?\`<p class="lastlog"><span>Last time</span>
      \${S.perf[e.id].slice(-3).map(v=>fmtPerf(v,e)).join(' · ')}</p>\`:''}`,
  'the recall line shows what you lifted, not just how many');

sub(`    \${tgt===null?'':\`<div class="logrow">
      <label for="actual">Got a different number?</label>
      <input class="prin" id="actual" type="number" inputmode="numeric" min="0" placeholder="\${tgt}">
    </div>\`}`,
`    \${tgt===null?'':\`<div class="logrow">
      <label for="actual">Got a different number?</label>
      <input class="prin" id="actual" type="number" inputmode="numeric" min="0" placeholder="\${tgt}">
    </div>\`}
    \${loaded(e)?\`<div class="logrow">
      <label for="load">Weight per side, in \${S.unit}</label>
      <div class="prin-wrap"><input class="prin" id="load" type="number" inputmode="decimal"
        min="0" step="0.5" placeholder="\${lastLoad(e)||'—'}" value="\${o.load||''}"></div>
    </div>\`:''}`,
  'the work screen has a weight box on loaded movements');

fs.writeFileSync('index.html',t);
console.log('patch 1 applied');
