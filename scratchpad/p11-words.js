/* Patch 11 — collapse the library filters, and speak gym.

   1. The Skill Library opened with four rows of chips — 30-odd buttons — before
      a single exercise. They go behind one Filters button that says what is
      currently on, so the library opens on the library.

   2. "Movement" is the word the code uses and it reads like a physiotherapist.
      In a gym the thing you do is an EXERCISE and the session is a WORKOUT.

      Two cues are deliberately left alone: "It is a short movement — you are
      rounding, not bending at the hips" and "Keep the low back still — the
      movement is at the hip" both mean range of motion, not exercise. Swapping
      those would make the coaching wrong, which is worse than inconsistent. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

/* ================= 1. the filter drawer ================= */
sub(`let tab='quest',filt={r:'all',c:'all',eq:'mine',m:'all'},open=null,ob,editing=null;`,
    `let tab='quest',filt={r:'all',c:'all',eq:'mine',m:'all'},open=null,ob,editing=null,filtOpen=false;`,
  'filtOpen flag');

sub(`  return \`<section class="block top">
    <div class="blockhead"><h2>Skill Library</h2><span class="tally">\${list.length} of \${EX.length}</span></div>
    <div class="filters">
      <button data-f="eq:mine" class="\${filt.eq==='mine'?'on':''}">What I can do</button>
      <button data-f="eq:all" class="\${filt.eq==='all'?'on':''}">Everything</button>
    </div>
    <div class="filters">
      <button data-f="r:all" class="\${filt.r==='all'?'on':''}">All ranks</button>
      \${['E','D','C','B','A'].map(r=>\`<button data-f="r:\${r}" class="\${filt.r===r?'on':''}">\${r}\${unlocked(r)?'':' · Lv'+RANK_LV[r]}</button>\`).join('')}
    </div>
    <div class="filters">
      <button data-f="c:all" class="\${filt.c==='all'?'on':''}">All types</button>
      \${Object.entries(CATS).map(([k,v])=>\`<button data-f="c:\${k}" class="\${filt.c===k?'on':''}">\${v}</button>\`).join('')}
    </div>
    <div class="filters">
      <button data-f="m:all" class="\${filt.m==='all'?'on':''}">All muscles</button>
      \${MUSCLES.map(k=>\`<button data-f="m:\${k}" class="\${filt.m===k?'on':''}">\${musName(k)}</button>\`).join('')}
    </div>`,
`  /* What is currently narrowing the list, in words, so the button can say it
     without anyone opening the drawer. "What I can do" is the default and is
     deliberately not counted as a filter. */
  const on=[];
  if(filt.eq==='all')on.push('Everything');
  if(filt.r!=='all')on.push('Rank '+filt.r);
  if(filt.c!=='all')on.push(CATS[filt.c]);
  if(filt.m!=='all')on.push(musName(filt.m));
  return \`<section class="block top">
    <div class="blockhead"><h2>Skill Library</h2><span class="tally">\${list.length} of \${EX.length}</span></div>
    <div class="filterbar">
      <button class="mini \${filtOpen||on.length?'on':''}" data-filttoggle>
        \${filtOpen?'Hide filters':'Filters'}\${on.length?' · '+on.length:''}</button>
      \${on.length?\`<span class="filtsum">\${on.map(esc).join(' · ')}</span>
        <button class="mini" data-filtclear>Reset</button>\`:''}
    </div>
    \${filtOpen?\`<div class="filterpanel">
    <div class="filters">
      <button data-f="eq:mine" class="\${filt.eq==='mine'?'on':''}">What I can do</button>
      <button data-f="eq:all" class="\${filt.eq==='all'?'on':''}">Everything</button>
    </div>
    <div class="filters">
      <button data-f="r:all" class="\${filt.r==='all'?'on':''}">All ranks</button>
      \${['E','D','C','B','A'].map(r=>\`<button data-f="r:\${r}" class="\${filt.r===r?'on':''}">\${r}\${unlocked(r)?'':' · Lv'+RANK_LV[r]}</button>\`).join('')}
    </div>
    <div class="filters">
      <button data-f="c:all" class="\${filt.c==='all'?'on':''}">All types</button>
      \${Object.entries(CATS).map(([k,v])=>\`<button data-f="c:\${k}" class="\${filt.c===k?'on':''}">\${v}</button>\`).join('')}
    </div>
    <div class="filters">
      <button data-f="m:all" class="\${filt.m==='all'?'on':''}">All muscles</button>
      \${MUSCLES.map(k=>\`<button data-f="m:\${k}" class="\${filt.m===k?'on':''}">\${musName(k)}</button>\`).join('')}
    </div></div>\`:''}`,
  'four filter rows moved into a drawer with a summary');

sub(`  const f=t.closest('[data-f]');if(f){const [k,v]=f.dataset.f.split(':');filt[k]=v;render();return}`,
`  if(t.closest('[data-filttoggle]')){filtOpen=!filtOpen;render();return}
  if(t.closest('[data-filtclear]')){filt={r:'all',c:'all',eq:'mine',m:'all'};render();return}
  const f=t.closest('[data-f]');if(f){const [k,v]=f.dataset.f.split(':');filt[k]=v;render();return}`,
  'toggle and reset handlers');

sub(`.filters{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}`,
`.filterbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}
.filtsum{font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;color:var(--ash2);
  flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.filterpanel{border:1px solid var(--line);background:rgba(var(--c1),.03);
  padding:4px 10px 12px;margin:0 0 14px}
.filters{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}`,
  'styles for the bar and drawer');

/* ================= 2. gym words ================= */
const w=[
 [`\${pool().length} movements match right now.`,`\${pool().length} exercises match right now.`],
 [`Swap this movement`,`Swap this exercise`],
 [`Skip the rest of this movement`,`Skip the rest of this exercise`],
 [`<p class="runstep">Movement \${o.i+1}</p>`,`<p class="runstep">Exercise \${o.i+1}</p>`],
 [`\${q.length} movements are waiting. You will see them one at a time.`,
  `\${q.length} exercises are waiting. You will see them one at a time.`],
 [`Only \${q.length} movement\${q.length===1?'':'s'} available at this rank`,
  `Only \${q.length} exercise\${q.length===1?'':'s'} available at this rank`],
 [`swap the movement — soreness is fine`,`swap the exercise — soreness is fine`],
 [`'No movements yet'`,`'No exercises yet'`],
 [`or movements you have ruled out`,`or exercises you have ruled out`],
 [`\${r.ids.length} movement\${r.ids.length===1?'':'s'}`,`\${r.ids.length} exercise\${r.ids.length===1?'':'s'}`],
 [`Nothing in it yet. Add movements below.`,`Nothing in it yet. Add exercises below.`],
 [`<h2>Add a movement</h2>`,`<h2>Add an exercise</h2>`],
 [`Twenty movements is the cap for one routine.`,`Twenty exercises is the cap for one routine.`],
 [`The last five results per movement are kept.`,`The last five results per exercise are kept.`],
 [`'Session length: '+questLen()+' movements'`,`'Session length: '+questLen()+' exercises'`],
 [`questLen()+' movements a quest'`,`questLen()+' exercises a quest'`],
 [`Only movements that work from a chair or a machine`,`Only exercises that work from a chair or a machine`],
 [`Loaded movements ask what you lifted`,`Loaded exercises ask what you lifted`],
 [`155 movements from wall push-ups`,`155 exercises from wall push-ups`],
 [`x:'Movements picked for your goal`,`x:'Exercises picked for your goal`],
 [`Build the session you already do,`,`Build the workout you already do,`],
 /* milestones */
 [`d:'Fifty movements logged.'`,`d:'Fifty exercises logged.'`],
 [`d:'Two hundred and fifty movements logged.'`,`d:'Two hundred and fifty exercises logged.'`],
 [`d:'A thousand movements logged.',xp:350`,`d:'A thousand exercises logged.',xp:350`],
 [`d:'A thousand movements logged.'}`,`d:'A thousand exercises logged.'}`],
 [`d:'Logged a movement in every category.'`,`d:'Logged an exercise in every category.'`],
 [`d:'Outgrew a movement and moved up its chain.'`,`d:'Outgrew an exercise and moved up its chain.'`],
 /* cues where "movement" genuinely means the exercise */
 [`'A chest movement with no balance demand at all.'`,`'A chest exercise with no balance demand at all.'`],
 [`'The most direct glute movement in the building.'`,`'The most direct glute exercise in the building.'`],
 [`'Balance work and hamstring work in the same movement.'`,`'Balance work and hamstring work in the same exercise.'`],
 [`'The hardest hamstring movement that needs no equipment at all.'`,
  `'The hardest hamstring exercise that needs no equipment at all.'`],
 [`'The heaviest triceps movement you can safely load.'`,`'The heaviest triceps exercise you can safely load.'`],
 [`'One of the few gym movements you can do at full speed safely.'`,
  `'One of the few gym exercises you can do at full speed safely.'`],
];
let n=0;
for(const [a,b] of w){const c=t.split(a).length-1;
  if(c!==1){console.log('!! '+c+' matches for: '+a.slice(0,52));process.exit(1)}
  t=t.split(a).join(b);n++}
console.log('  '+n+' strings moved from "movement" to exercise / workout');

fs.writeFileSync('index.html',t);
console.log('patch 11 applied');
