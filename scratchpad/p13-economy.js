/* Patch 13 — make gold mean something, three ways, none of them a game.

   1. GOLD BUYS TRAINING. A quest reroll. The single most useful thing gold
      could buy in a training app: it is Tuesday, the quest handed you legs, your
      legs are wrecked. Pay 40 and get a different one. Only allowed while
      nothing has been cleared today, so it cannot be used to dodge work already
      started, and it resets with the quest.

   2. MORE TO BUY. Aura styles come off the class. Six exist, each locked to one
      of six classes, and switching class to get an aura also changes your tier
      names and titles. Your own class's aura stays free; the other five are
      buyable. Palettes are deliberately NOT touched — refundOldCosmetics()
      shows they were paid once and made free with refunds, and reversing that
      would take something back.

   3. GOLD IS HARDER TO GET. Ten a rep-set plus fifty a quest meant a six
      exercise day paid 110, and the dearest weapon was under a week. Halved
      across the board. Nobody loses gold they already have; it just stops
      arriving so fast, which is what made the Vault feel pointless. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};
const subN=(a,b,want,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==want){console.log('!! '+n+' matches (wanted '+want+') for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label+' ('+n+')')};

/* ================= 3. earn rate ================= */
subN(`award(xp,10,e.st);`,`award(xp,5,e.st);`,1,'quest exercise 10 -> 5 gold');
subN(`award(inQ?25:15,10,e.st);`,`award(inQ?25:15,5,e.st);`,1,'library log 10 -> 5 gold');
subN(`award(80,50,null)`,`award(80,25,null)`,2,'quest clear 50 -> 25 gold');
subN(`o.xp+=80;o.gold+=50;`,`o.xp+=80;o.gold+=25;`,1,'session summary matches');
subN(`toast('Daily quest cleared · +80 XP · +50 gold')`,
     `toast('Daily quest cleared · +80 XP · +25 gold')`,1,'clear toast matches');
subN(`o.xp+=xp;o.gold+=10;`,`o.xp+=xp;o.gold+=5;`,1,'per-exercise summary matches');
subN(`toast(e.n+' · +'+(inQ?25:15)+' XP · +10 gold')`,
     `toast(e.n+' · +'+(inQ?25:15)+' XP · +5 gold')`,1,'log toast matches');
subN(`award(60,40,'END')`,`award(60,20,'END')`,1,'dungeon 40 -> 20 gold');
subN(`'Enter the dungeon'} · +60 XP · +40 gold`,`'Enter the dungeon'} · +60 XP · +20 gold`,1,
  'dungeon button label matches');
subN(`const g=(v-old)*3;`,`const g=(v-old)*2;`,1,'records 3 -> 2 gold a point');
subN(`Beating a record pays 3 gold per point.`,`Beating a record pays 2 gold per point.`,1,
  'records copy matches');

/* ================= 1. the reroll ================= */
sub(` unit:'lb', split:'random', cycle:0, vol:'auto', routines:[],`,
    ` unit:'lb', split:'random', cycle:0, vol:'auto', routines:[], qroll:0, auraStyle:null,`,
  'fresh(): qroll and auraStyle');
sub(`  if(typeof S.newsSeen!=='number')S.newsSeen=0;`,
`  if(typeof S.newsSeen!=='number')S.newsSeen=0;
  if(typeof S.qroll!=='number'||!(S.qroll>=0))S.qroll=0;
  if(S.auraStyle&&!AURASTYLE[S.auraStyle])S.auraStyle=null;`,
  'heal(): qroll and auraStyle validated');

sub(`function rollQuest(){const d=today();
  if(S.questDate!==d){S.questDate=d;S.questDone=[];S.questBonus=false;save()}
  return questFor(d)}`,
`const REROLL=40;
/* Only while nothing has been cleared, so it cannot be used to walk away from
   work already started. */
const canReroll=()=>{const q=questFor(today());
  return S.gold>=REROLL && !q.some(e=>S.questDone.includes(e.id))};
function rollQuest(){const d=today();
  if(S.questDate!==d){S.questDate=d;S.questDone=[];S.questBonus=false;S.qroll=0;save()}
  return questFor(d)}`,
  'REROLL cost, canReroll(), qroll resets with the day');

sub(`    +limitsOn().join('')+'|'+(plan?plan.k+S.cycle:'')+'|'+questLen()),`,
    `    +limitsOn().join('')+'|'+(plan?plan.k+S.cycle:'')+'|'+questLen()+'|'+(S.qroll||0)),`,
  'the reroll counter is part of the seed');

sub(`    \${kitBar()}`,
`    \${kitBar()}
    \${all?'':\`<button class="btn ghost" data-reroll \${canReroll()?'':'disabled'}>Reroll today · \${REROLL} gold</button>
      <p class="note" style="margin-top:6px">\${
        S.gold<REROLL ? 'Not enough gold to reroll.'
        : canReroll() ? 'Wrong exercises for today? Trade gold for a different quest.'
        : 'Rerolling is only possible before you clear anything today.'}</p>\`}`,
  'reroll button on the quest screen');

sub(`  if(t.closest('[data-kitopen]')){tab='kit';render();return}`,
`  if(t.closest('[data-reroll]')){
    if(!canReroll())return;
    S.gold-=REROLL;S.qroll=(S.qroll||0)+1;
    /* A reroll must not carry the old session, which points at the old list. */
    S.sess=null;S.swaps=null;
    save();render();toast('Quest rerolled · -'+REROLL+' gold');return}
  if(t.closest('[data-kitopen]')){tab='kit';render();return}`,
  'reroll handler');

/* ================= 2. aura styles for sale ================= */
sub(`const AURASTYLE={`,
`/* An aura style used to be welded to your class, so wanting Embers meant
   becoming a Ronin and taking its tier names and titles with it. Your class's
   own aura is free; the other five are the Vault's new paid axis. */
const AURAPRICE=300;
const AURALIST=()=>CLSKEYS.map(k=>({k:CLASSES[k].aura, n:CLASSES[k].an, from:CLASSES[k].n}));
const auraOwned=k=>k===cls().aura||S.owned.includes('aur_'+k);
const auraKey=()=>{const k=S.auraStyle;return k&&AURASTYLE[k]&&auraOwned(k)?k:cls().aura};
const AURASTYLE={`,
  'aura pricing helpers');

sub(`    const draw=AURASTYLE[cls().aura]||AURASTYLE.tendrils;`,
    `    const draw=AURASTYLE[auraKey()]||AURASTYLE.tendrils;`,
  'the canvas draws the chosen aura');

sub(`      : 'Every weapon unlocked.'}</p>
    <p class="picklab" style="margin-top:20px">Palette</p>`,
`      : 'Every weapon unlocked.'}</p>
    <p class="picklab" style="margin-top:20px">Aura</p>
    <div class="filters">\${AURALIST().map(a=>{
      const own=auraOwned(a.k), sel=auraKey()===a.k;
      return \`<button class="\${sel?'on':''}" data-setaura="\${a.k}"
        \${!own&&S.gold<AURAPRICE?'disabled':''}>\${esc(a.n)}\${
        own?'':' · '+AURAPRICE}</button>\`}).join('')}</div>
    <p class="clsline"><b>\${esc((AURALIST().find(a=>a.k===auraKey())||{}).n||'')}.</b>
      Your class aura is free. The rest are \${AURAPRICE} gold each and stay yours.</p>
    <p class="picklab" style="margin-top:20px">Palette</p>`,
  'aura picker in the Vault');

sub(`  if(t.closest('[data-cycleunit]')){S.unit=S.unit==='kg'?'lb':'kg';save();render();return}`,
`  const sa=t.closest('[data-setaura]');
  if(sa){const k=sa.dataset.setaura;
    if(!AURASTYLE[k])return;
    if(!auraOwned(k)){
      if(S.gold<AURAPRICE)return;
      S.gold-=AURAPRICE;S.owned.push('aur_'+k);
      toast('Aura unlocked · -'+AURAPRICE+' gold');
    }
    S.auraStyle=k;save();render();return}
  if(t.closest('[data-cycleunit]')){S.unit=S.unit==='kg'?'lb':'kg';save();render();return}`,
  'aura buy-and-equip handler');

fs.writeFileSync('index.html',t);
console.log('patch 13 applied');
