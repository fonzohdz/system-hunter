/* Patch 12 — The Gate. A gold sink that makes the stats mean something.

   The Vault had one real problem: three weapons, some titles and one
   consumable. Buy them and gold stops mattering, so the store stops mattering.
   The Gate is where gold goes.

   Three rules it is built around, all deliberate:

   1. IT COSTS GOLD AND NEVER PAYS GOLD. A sink, not a faucet. That is what
      keeps gold scarce and the Vault worth opening.

   2. IT PAYS NO XP, NO STATS, NO STREAK. A mini-game that levels you up is a
      way to rank up without training, which would hollow out the whole app.
      It pays exclusive titles and a record, and nothing else.

   3. IT IS DECISIONS, NOT CHANCE. The boss telegraphs its intent and you pick
      the counter; your STAT decides whether the right counter is strong enough.
      So it rewards having trained, and it is not a slot machine — which matters
      in an app teenagers use. The sequence is fixed when you enter, so you
      cannot reload to reroll a bad draw. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

/* ---- data ---- */
sub(`const RANK_TITLE={E:'Novice',D:'Adept',C:'Expert',B:'Master',A:'Grandmaster',S:'Sword Saint'};`,
`const RANK_TITLE={E:'Novice',D:'Adept',C:'Expert',B:'Master',A:'Grandmaster',S:'Sword Saint'};

/* ---- The Gate ---------------------------------------------------------
   Entry cost rises with the rank; so does the stat you need to answer with.
   Thresholds are set against real progression: stats start at 5, gain 1 per
   exercise logged in that stat and 1 across the board per level, so a C gate
   is reachable in a few weeks and an A gate is a long way off on purpose. */
const GATE={
 E:{cost:60, need:8,  n:'E-Rank Gate'},
 D:{cost:90, need:14, n:'D-Rank Gate'},
 C:{cost:130,need:21, n:'C-Rank Gate'},
 B:{cost:180,need:29, n:'B-Rank Gate'},
 A:{cost:250,need:39, n:'A-Rank Gate'}
};
const GATEKEYS=['E','D','C','B','A'];
/* Each intent has exactly one right answer. The telegraph is the whole game:
   read it, pick the stat that beats it. */
const INTENT=[
 {t:'It winds up a crushing overhead blow.',      s:'AGI', v:'Step aside'},
 {t:'It lunges in to grapple you.',               s:'STR', v:'Overpower it'},
 {t:'It settles in and starts grinding you down.',s:'END', v:'Outlast it'},
 {t:'It aims a fast strike at your ribs.',        s:'VIT', v:'Take it'},
 {t:'It shifts its weight and feints.',           s:'CORE',v:'Hold your line'}
];
const STATKEYS=['STR','END','VIT','AGI','CORE'];
const gateOn=()=>S.gt&&GATE[S.gt.r]?S.gt:null;
/* Gates you may enter: anything up to your own rank. */
const gatesOpen=()=>GATEKEYS.slice(0,GATEKEYS.indexOf(rankOf(S.lvl))+1);`,
  'GATE, INTENT and helpers');

sub(` t_earnedA:{id:'t_earnedA',n:'Grandmaster',p:0,ico:'☗',d:'Reached A-Rank.'}`,
` t_earnedA:{id:'t_earnedA',n:'Grandmaster',p:0,ico:'☗',d:'Reached A-Rank.'},
 t_gateC:{id:'t_gateC',n:'Gatebreaker',p:0,ico:'⌘',d:'Cleared a C-Rank Gate.'},
 t_gateA:{id:'t_gateA',n:'Monarch',p:0,ico:'♜',d:'Cleared an A-Rank Gate.'}`,
  'two Gate-only titles');

/* ---- state ---- */
sub(` unit:'lb', split:'random', cycle:0, vol:'auto', routines:[],`,
` unit:'lb', split:'random', cycle:0, vol:'auto', routines:[],
 /* gt is the run in progress; gate is the permanent record. */
 gt:null, gate:{clears:0,best:''},`,
  'fresh(): gt and gate');
sub(`  if(typeof S.newsSeen!=='number')S.newsSeen=0;`,
`  if(typeof S.newsSeen!=='number')S.newsSeen=0;
  if(!S.gate||typeof S.gate!=='object')S.gate={clears:0,best:''};
  if(typeof S.gate.clears!=='number')S.gate.clears=0;
  if(!GATE[S.gate.best])S.gate.best='';
  /* A half-finished run from an older build, or a rank that no longer exists,
     must not strand the gold — drop it rather than render a broken round. */
  if(S.gt&&(!GATE[S.gt.r]||!Array.isArray(S.gt.seq)))S.gt=null;`,
  'heal(): gate record validated');

/* ---- logic ---- */
sub(`function startDungeon(){`,
`/* Entering charges the gold and fixes the sequence, so reloading cannot
   reroll a bad draw. Three rounds, two wins clears it. */
function enterGate(r){
  const g=GATE[r]; if(!g||S.gold<g.cost)return;
  S.gold-=g.cost;
  const seq=[0,1,2].map(()=>Math.floor(Math.random()*INTENT.length));
  S.gt={r, i:0, wins:0, seq, res:[]};
  save();tab='gate';render();
}
/* The answer is right or wrong on its own; the stat only decides whether being
   right was enough. Both failures read differently on purpose. */
function answerGate(stat){
  const o=gateOn(); if(!o||o.i>=3)return;
  const it=INTENT[o.seq[o.i]], need=GATE[o.r].need, have=S.stats[stat]||0;
  const right=stat===it.s;
  const win=right&&have>=need;
  o.res.push({stat,right,have,win});
  if(win)o.wins++;
  o.i++;
  if(o.i>=3&&o.wins>=2){
    S.gate.clears++;
    if(GATEKEYS.indexOf(o.r)>GATEKEYS.indexOf(S.gate.best||'E')||!S.gate.best)S.gate.best=o.r;
    /* Titles only. No XP, no stats, no streak — the Gate must never be a way
       to progress without training. */
    if((o.r==='C'||o.r==='B'||o.r==='A')&&!S.owned.includes('t_gateC'))S.owned.push('t_gateC');
    if(o.r==='A'&&!S.owned.includes('t_gateA'))S.owned.push('t_gateA');
  }
  save();render();
}
function leaveGate(){S.gt=null;save();tab='quest';render();}
function startDungeon(){`,
  'enterGate, answerGate, leaveGate');

/* ---- the screen ---- */
sub(`function viewDungeon(){`,
`function viewGate(){
  const o=gateOn(); if(!o)return viewQuest();
  const g=GATE[o.r];
  if(o.i>=3){
    const cleared=o.wins>=2;
    return \`<div class="runwrap"><div class="run center">
      <p class="runstep">\${esc(g.n)}</p>
      <h2 class="runh">\${cleared?'Gate cleared':'Gate held'}</h2>
      <div class="sumgrid">
        <div><span>Rounds won</span><b>\${o.wins} / 3</b></div>
        <div><span>Deepest</span><b>\${esc(S.gate.best||'—')}</b></div>
        <div><span>Cleared</span><b>\${S.gate.clears}</b></div>
      </div>
      <ul class="cues" style="margin-top:18px">\${o.res.map((r,i)=>\`<li>Round \${i+1} ·
        \${r.win?'held':r.right?'right call, '+r.stat+' '+r.have+' against '+g.need+' needed'
          :'wrong call'}</li>\`).join('')}</ul>
      <p class="note">\${cleared
        ? 'Nothing was paid out. Gates cost gold and give titles — they never hand back what you spent, and they never give XP.'
        : 'The entry cost is gone. Train the stat you were short on and come back.'}</p>
      <button class="btn big" data-gateleave>Leave the gate</button>
    </div></div>\`;
  }
  const it=INTENT[o.seq[o.i]];
  return \`<div class="runwrap"><div class="run center">
    <p class="runstep">\${esc(g.n)} · Round \${o.i+1} of 3 · \${o.wins} held</p>
    <h2 class="runh">\${esc(it.t)}</h2>
    <p class="runsub">Answer with the right attribute. You need <b>\${g.need}</b> in it.</p>
    <div class="gatepick">\${STATKEYS.map(k=>\`<button class="gateb" data-gate="\${k}">
      <u>\${k}</u><b>\${S.stats[k]||0}</b>
      <i class="\${(S.stats[k]||0)>=g.need?'ok':''}"></i></button>\`).join('')}</div>
    <p class="note">The right attribute still fails if it is not high enough. That is the point.</p>
  </div></div>\`;
}
function viewDungeon(){`,
  'viewGate');

sub(`  if(tab==='dungeon'){root.innerHTML=viewDungeon();runDgTicker();`,
`  if(tab==='gate'){root.innerHTML=viewGate();return}
  if(tab==='dungeon'){root.innerHTML=viewDungeon();runDgTicker();`,
  'render() routes to the gate');

/* ---- entry on the quest screen ---- */
sub(`  <section class="block">
    <div class="blockhead"><h2>Instant Dungeon</h2></div>`,
`  <section class="block">
    <div class="blockhead"><h2>The Gate</h2><span class="tally">\${S.gate.clears} cleared\${
      S.gate.best?' · deepest '+esc(S.gate.best):''}</span></div>
    \${gateOn()?\`<p class="dgn">A gate is already open.</p>
      <button class="btn big" data-gateresume>Back to the gate</button>\`
    :\`<p class="dgn">Spend gold to open a gate. Three rounds — it tells you what it is about
      to do, you answer with the attribute that beats it. Your training decides whether the
      right answer is strong enough.</p>
    \${gatesOpen().map(k=>\`<div class="item">
      <div class="ico">\${k}</div>
      <div class="itxt"><h4>\${esc(GATE[k].n)}</h4><p>Needs \${GATE[k].need} in the answering attribute</p></div>
      <button class="mini" data-gateopen="\${k}" \${S.gold<GATE[k].cost?'disabled':''}>\${GATE[k].cost} gold</button>
    </div>\`).join('')}
    <p class="note">Gates pay titles and a record. They never pay gold back and never give XP —
    the only way to level is to train.</p>\`}
  </section>
  <section class="block">
    <div class="blockhead"><h2>Instant Dungeon</h2></div>`,
  'gate entry on the quest screen');

sub(`  if(t.closest('[data-newsdone]')){S.newsSeen=NEWS.v;save();render();return}`,
`  if(t.closest('[data-newsdone]')){S.newsSeen=NEWS.v;save();render();return}
  const go=t.closest('[data-gateopen]');
  if(go){enterGate(go.dataset.gateopen);return}
  if(t.closest('[data-gateresume]')){tab='gate';render();return}
  if(t.closest('[data-gateleave]')){leaveGate();return}
  const ga=t.closest('[data-gate]');
  if(ga){buzz([0,30]);answerGate(ga.dataset.gate);return}`,
  'gate handlers');

/* ---- styles ---- */
sub(`.filterbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}`,
`.gatepick{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:22px 0 4px}
.gateb{background:var(--deep);border:1px solid var(--line);cursor:pointer;
  padding:12px 2px 10px;text-align:center;font:inherit;color:var(--bone)}
.gateb:hover{border-color:var(--crimson)}
.gateb u{display:block;text-decoration:none;font-family:var(--mono);font-size:9.5px;
  letter-spacing:.1em;color:var(--ash2)}
.gateb b{display:block;font-family:var(--display);font-size:21px;margin-top:4px}
.gateb i{display:block;height:2px;margin:8px 5px 0;background:var(--line)}
.gateb i.ok{background:var(--crimson)}
.filterbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}`,
  'gate styles');

fs.writeFileSync('index.html',t);
console.log('patch 12 applied');
