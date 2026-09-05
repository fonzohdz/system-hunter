/* Patch 5 — routines: your own workout, run through the same guided flow.

   Three ways to train, all first-class:
     the daily quest   — the app decides
     a routine         — you decide once, then repeat it
     the library       — log anything, any time

   The runner already takes a list of movements and does not care where the
   list came from, so a routine is a saved list plus one indirection: sessList()
   returns the routine's movements when the session carries one, and today's
   quest otherwise. Nothing about the timers, rests, swaps, load logging or
   progression is duplicated.

   Also closes a hole this would have widened: doneToday reads S.questDone, but
   a movement outside the quest was never added to it, so anything in the
   library could be logged for XP over and over. Everything logged now goes in
   the ledger. The quest-cleared check is unaffected — it asks whether every
   quest movement is present, not whether the list is only quest movements. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};
const subAll=(a,b,want,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==want){console.log('!! '+n+' matches (wanted '+want+') for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label+' ('+n+')')};

/* ---- storage ---- */
sub(` unit:'lb', split:'random', cycle:0, vol:'auto',`,
    ` unit:'lb', split:'random', cycle:0, vol:'auto', routines:[],`,
  'fresh(): routines');
sub(`  if(!VOLN[S.vol])S.vol='auto';`,
`  if(!VOLN[S.vol])S.vol='auto';
  /* A routine is {id, n, ids}. Drop anything malformed and any movement id
     that no longer exists, rather than letting a bad entry break the runner. */
  if(!Array.isArray(S.routines))S.routines=[];
  S.routines=S.routines.filter(r=>r&&typeof r==='object'&&r.id).map(r=>({
    id:String(r.id), n:String(r.n||'Routine').slice(0,40),
    ids:(Array.isArray(r.ids)?r.ids:[]).filter(id=>EX.some(x=>x.id===id)).slice(0,20)
  }));`,
  'heal(): routines validated, dead movement ids dropped');

/* ---- helpers ---- */
sub(`function questToday(){return rollQuest().map(e=>swapped(e))}`,
`function questToday(){return rollQuest().map(e=>swapped(e))}
const routine=id=>S.routines.find(r=>r.id===id)||null;
const routineEx=r=>(r?r.ids:[]).map(id=>EX.find(x=>x.id===id)).filter(Boolean).map(swapped);
/* What the running session is working through. A routine brings its own list;
   otherwise it is today's quest. Swaps apply to both. */
function sessList(){
  const o=sess();
  if(o&&o.r){const r=routine(o.r); if(r)return routineEx(r)}
  return questToday();
}`,
  'routine(), routineEx(), sessList()');

/* ---- the runner reads the session's list, not the quest ---- */
subAll(`  const q=questToday();
  if(o.st==='done'||o.i>=q.length)return viewRunDone(o,q);`,
`  const q=sessList();
  if(o.st==='done'||o.i>=q.length)return viewRunDone(o,q);`, 1,
  'viewRun uses the session list');
subAll(`    const o=sess(),q=questToday(),e=q[o.i];`,
       `    const o=sess(),q=sessList(),e=q[o.i];`, 1,
  'hold-done handler');
subAll(`{const o=sess(),q=questToday(),e=q[o.i],sets=(doseParts(e)||{}).sets||3;`,
       `{const o=sess(),q=sessList(),e=q[o.i],sets=(doseParts(e)||{}).sets||3;`, 2,
  'set-complete and hold handlers');
subAll(`    const o=sess(),q=questToday();o.i++;o.set=1;o.st='brief';o.endAt=0;o.load=0;`,
       `    const o=sess(),q=sessList();o.i++;o.set=1;o.st='brief';o.endAt=0;o.load=0;`, 1,
  'skip handler');

/* ---- starting a session ---- */
sub(`function startSession(){
  const q=questToday();
  S.sess={d:today(),i:0,set:1,st:'brief',endAt:0,paused:0,left:0,
          xp:0,gold:0,cleared:[],began:Date.now()};
  /* Skip straight past anything already logged from the checklist today. */
  while(S.sess.i<q.length&&S.questDone.includes(q[S.sess.i].id))S.sess.i++;
  if(S.sess.i>=q.length)S.sess.st='done';
  save();keepAwake(true);tab='run';render();
}`,
`function startSession(rid){
  const r=rid?routine(rid):null;
  const q=r?routineEx(r):questToday();
  S.sess={d:today(),i:0,set:1,st:'brief',endAt:0,paused:0,left:0,r:r?r.id:null,
          xp:0,gold:0,cleared:[],began:Date.now()};
  /* Skip straight past anything already logged from the checklist today — but
     only for the quest. A routine is yours to repeat if you want to. */
  if(!r){while(S.sess.i<q.length&&S.questDone.includes(q[S.sess.i].id))S.sess.i++;}
  if(S.sess.i>=q.length)S.sess.st='done';
  save();keepAwake(true);tab='run';render();
}`,
  'startSession takes an optional routine');

/* ---- close the repeat-log hole ---- */
sub(`    if(inQ)S.questDone.push(e.id);
    const xp=inQ?25:15;`,
`    /* Everything logged goes in the ledger, not just quest movements —
       otherwise anything outside the quest pays again on every tap. */
    S.questDone.push(e.id);
    const xp=inQ?25:15;`,
  'clearMovement records every movement as paid');
sub(`    if(inQ&&!S.questDone.includes(e.id))S.questDone.push(e.id);
    award(inQ?25:15,10,e.st);`,
`    if(!S.questDone.includes(e.id))S.questDone.push(e.id);
    award(inQ?25:15,10,e.st);`,
  'library log records it too');

/* ---- routines on the quest screen ---- */
sub(`  <section class="block">
    <div class="blockhead"><h2>Instant Dungeon</h2></div>`,
`  <section class="block">
    <div class="blockhead"><h2>Your Routines</h2><span class="tally">\${S.routines.length}</span></div>
    \${S.routines.length?S.routines.map(r=>\`<div class="item">
      <div class="ico">▶</div>
      <div class="itxt"><h4>\${esc(r.n)}</h4>
        <p>\${r.ids.length?esc(routineEx(r).map(x=>x.n).join(', ')):'No movements yet'}</p></div>
      <button class="mini" data-runroutine="\${r.id}" \${r.ids.length?'':'disabled'}>Run</button>
      <button class="mini" data-editroutine="\${r.id}">Edit</button>
    </div>\`).join('')
    :'<p class="questteaser">Build the session you already do, save it, and run it with the same timers and logging as a quest.</p>'}
    <button class="btn ghost" data-newroutine>New routine</button>
  </section>
  <section class="block">
    <div class="blockhead"><h2>Instant Dungeon</h2></div>`,
  'Your Routines block on the quest screen');

/* ---- the editor ---- */
sub(`function viewLib(){`,
`/* Routine editor. Deliberately plain: a name, the movements in order, and a
   filtered list to add from. Anything in the library can go in, including
   things above your rank — it is your workout. */
function viewRoutine(){
  const r=routine(editing);
  if(!r){tab='quest';return viewQuest()}
  let list=EX.filter(e=>(filt.c==='all'||e.c===filt.c));
  if(filt.eq==='mine')list=list.filter(hasEq);
  if(limitsOn().length)list=list.filter(fitsLimits);
  list=list.filter(e=>!r.ids.includes(e.id));
  return crestBlock()+\`
  <section class="block top">
    <div class="blockhead"><h2>Edit routine</h2>
      <span class="tally">\${r.ids.length} movement\${r.ids.length===1?'':'s'}</span></div>
    <div class="logrow" style="align-items:stretch">
      <label for="rname">Name</label>
      <input class="prin" id="rname" style="width:100%;text-align:left" maxlength="40"
        value="\${esc(r.n)}" placeholder="Monday · Push">
    </div>
    \${r.ids.length?routineEx(r).map((e,i)=>\`<div class="item">
      <div class="ico">\${i+1}</div>
      <div class="itxt"><h4>\${esc(e.n)}</h4><p>\${CATS[e.c]} · \${esc(scaledDose(e))}</p></div>
      <button class="mini" data-rmove="\${e.id}:-1" \${i?'':'disabled'}>↑</button>
      <button class="mini" data-rdrop="\${e.id}">Remove</button>
    </div>\`).join('')
    :'<p class="note">Nothing in it yet. Add movements below.</p>'}
    <button class="btn" data-rsave>Save routine</button>
    <button class="btn ghost" data-rdelete>Delete this routine</button>
  </section>
  <section class="block">
    <div class="blockhead"><h2>Add a movement</h2><span class="tally">\${list.length}</span></div>
    <div class="filters">
      <button data-f="eq:mine" class="\${filt.eq==='mine'?'on':''}">What I can do</button>
      <button data-f="eq:all" class="\${filt.eq==='all'?'on':''}">Everything</button>
    </div>
    <div class="filters">
      <button data-f="c:all" class="\${filt.c==='all'?'on':''}">All types</button>
      \${Object.entries(CATS).map(([k,v])=>\`<button data-f="c:\${k}" class="\${filt.c===k?'on':''}">\${v}</button>\`).join('')}
    </div>
    \${list.slice(0,60).map(e=>\`<div class="item">
      <div class="ico">\${e.r}</div>
      <div class="itxt"><h4>\${esc(e.n)}</h4><p>\${CATS[e.c]} · builds \${e.st}</p></div>
      <button class="mini" data-radd="\${e.id}" \${r.ids.length>=20?'disabled':''}>Add</button>
    </div>\`).join('')}
    \${list.length>60?'<p class="note">Showing the first 60. Narrow it with the filters.</p>':''}
    \${r.ids.length>=20?'<p class="note">Twenty movements is the cap for one routine.</p>':''}
  </section>\`;
}
function viewLib(){`,
  'viewRoutine editor');

/* ---- wiring ---- */
sub(`let tab='quest',filt={r:'all',c:'all',eq:'mine',m:'all'},open=null,ob;`,
    `let tab='quest',filt={r:'all',c:'all',eq:'mine',m:'all'},open=null,ob,editing=null;`,
  'editing pointer');

sub(`  const body=tab==='quest'?viewQuest():tab==='lib'?viewLib():tab==='rec'?viewRecords():`,
`  const body=tab==='quest'?viewQuest():tab==='lib'?viewLib():tab==='rec'?viewRecords():
             tab==='redit'?viewRoutine():`,
  'render() knows the editor');

sub(`    <button data-tab="quest" class="\${tab==='quest'||tab==='dayeq'?'on':''}">Quest</button>`,
    `    <button data-tab="quest" class="\${tab==='quest'||tab==='dayeq'||tab==='redit'?'on':''}">Quest</button>`,
  'editor keeps the Quest tab lit');

sub(`  if(t.closest('[data-kitopen]')){tab='kit';render();return}`,
`  if(t.closest('[data-kitopen]')){tab='kit';render();return}
  if(t.closest('[data-newroutine]')){
    const r={id:'r'+Date.now().toString(36),n:'New routine',ids:[]};
    S.routines.push(r);editing=r.id;save();tab='redit';render();return}
  const er=t.closest('[data-editroutine]');
  if(er){editing=er.dataset.editroutine;tab='redit';render();return}
  const rr=t.closest('[data-runroutine]');
  if(rr){const r=routine(rr.dataset.runroutine);
    if(!r||!r.ids.length)return;
    startSession(r.id);return}
  const ra=t.closest('[data-radd]');
  if(ra){const r=routine(editing);
    if(r&&r.ids.length<20&&!r.ids.includes(ra.dataset.radd)){
      saveName();r.ids.push(ra.dataset.radd);save();render()}
    return}
  const rd=t.closest('[data-rdrop]');
  if(rd){const r=routine(editing);
    if(r){saveName();r.ids=r.ids.filter(id=>id!==rd.dataset.rdrop);save();render()}
    return}
  const rm=t.closest('[data-rmove]');
  if(rm){const r=routine(editing),[id,dir]=rm.dataset.rmove.split(':');
    if(r){const i=r.ids.indexOf(id),j=i+ +dir;
      if(i>=0&&j>=0&&j<r.ids.length){saveName();
        const tmp=r.ids[i];r.ids[i]=r.ids[j];r.ids[j]=tmp;save();render()}}
    return}
  if(t.closest('[data-rsave]')){saveName();save();
    toast('Routine saved');tab='quest';render();return}
  if(t.closest('[data-rdelete]')){
    S.routines=S.routines.filter(x=>x.id!==editing);editing=null;save();
    toast('Routine deleted');tab='quest';render();return}`,
  'handlers: new, edit, run, add, remove, reorder, save, delete');

sub(`function startSession(rid){`,
`/* The name field is uncontrolled, so grab whatever is in it before any action
   that re-renders — otherwise typing a name and tapping Add silently loses it. */
function saveName(){
  const el=document.getElementById('rname'), r=routine(editing);
  if(el&&r)r.n=(el.value||'').trim().slice(0,40)||'Routine';
}
function startSession(rid){`,
  'saveName() so an unsaved name survives a re-render');

fs.writeFileSync('index.html',t);
console.log('patch 5 applied');
