/* Patch 9 — the last three.

   1. A real manifest. The data: URI version could not be trusted: start_url is
      resolved relative to the manifest URL, and a data: URL gives nothing to
      resolve against, so Chrome may reject the whole thing for installability.
      manifest.json is now a real file next to index.html. That breaks the
      one-file rule, deliberately and with the owner's say-so, and it is
      recorded in CLAUDE.md.

   2. A what's-new card. Splits, session length, units, routines, weight
      logging and the Lifts view all shipped with no announcement, and existing
      users never replay the tour. One card, dismissed forever.

   3. Honest volume numbers. The session-length setting counted MOVEMENTS,
      which is not the unit any of the training research uses. It counts sets
      now, read from each movement's own dose, so the number can be compared
      with the 12-20 sets per muscle per week the evidence actually talks
      about. Measured, not guessed at. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

/* ---- 1. real manifest, drop the runtime data: URI ---- */
const dataManifestStart = t.indexOf('<div id="root"><div class="boot">Awakening</div></div>');
const scriptEnd = t.indexOf('</'+'script>', dataManifestStart);
if(dataManifestStart<0||scriptEnd<0){console.log('!! manifest block not found');process.exit(1)}
const block = t.slice(dataManifestStart, scriptEnd+9);
if(!block.includes('application/manifest+json')){console.log('!! not the manifest block');process.exit(1)}
t = t.slice(0,dataManifestStart) + '<div id="root"><div class="boot">Awakening</div></div>' + t.slice(scriptEnd+9);
console.log('  runtime data: URI manifest removed');

sub(`<meta name="apple-mobile-web-app-title" content="Ascendant">`,
`<meta name="apple-mobile-web-app-title" content="Ascendant">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icon.svg">`,
  'real manifest.json linked');

/* ---- 3. count sets, not movements ---- */
sub(`const weekMoves=()=>questLen()*(S.days||4);`,
`const weekMoves=()=>questLen()*(S.days||4);
/* Working sets a week, not movements — sets are the unit the training research
   uses, so this is a number worth comparing against something. Averaged over a
   representative quest because each movement carries its own set count. */
function weekSets(){
  const q=questToday();
  if(!q.length)return 0;
  const per=q.reduce((n,e)=>n+((doseParts(e)||{}).sets||3),0)/q.length;
  return Math.round(per*questLen()*(S.days||4));
}`,
  'weekSets() derived from each movement dose');

sub(`      <p>\${questLen()} a day, about \${weekMoves()} a week.\${S.vol==='auto'`,
    `      <p>\${questLen()} a day, roughly \${weekSets()} working sets a week.\${S.vol==='auto'`,
  'the setting reports sets');

/* ---- 2. what's new ---- */
sub(`  if(!VOLN[S.vol])S.vol='auto';`,
`  if(!VOLN[S.vol])S.vol='auto';
  if(typeof S.newsSeen!=='number')S.newsSeen=0;`,
  'heal(): newsSeen');
sub(` unit:'lb', split:'random', cycle:0, vol:'auto', routines:[],`,
` unit:'lb', split:'random', cycle:0, vol:'auto', routines:[],
 /* Bumped when there is something worth announcing once. A fresh hunter starts
    at the current number, so onboarding is not followed by a changelog. */
 newsSeen:NEWS.v,`,
  'fresh(): newsSeen starts current');

sub(`const XPLEVEL={new:1,some:5,trained:12,adv:20};`,
`const XPLEVEL={new:1,some:5,trained:12,adv:20};

/* Shown once to hunters who were already here when these landed. Bump v and
   rewrite the lines when there is something else worth one card. */
const NEWS={v:1,t:'The System has been updated',l:[
 'Weights are tracked. Loaded movements ask what you lifted, and the target adds weight instead of endless reps.',
 'Records now lists every lift against what you did last time.',
 'Sessions can follow a split. Upper/lower, push/pull/legs — picked from the days you train.',
 'Build your own routines and run them with the same timers and logging.',
 'Session length follows your week, so fewer days means longer sessions.'
]};`,
  'NEWS defined');

sub(`  return crestBlock()+heroBlock()+statsBlock()+\``,
`  return crestBlock()+heroBlock()+statsBlock()+newsBlock()+\``,
  'quest screen shows the card');

sub(`function heroBlock(){`,
`/* One card, once. Dismissing it is the only way it goes away, so it cannot
   quietly reappear on the next render. */
function newsBlock(){
  if((S.newsSeen||0)>=NEWS.v)return '';
  return \`<section class="block">
    <div class="blockhead"><h2>\${esc(NEWS.t)}</h2></div>
    <ul class="cues">\${NEWS.l.map(x=>\`<li>\${esc(x)}</li>\`).join('')}</ul>
    <button class="btn ghost" data-newsdone>Understood</button>
  </section>\`;
}
function heroBlock(){`,
  'newsBlock()');

sub(`  if(t.closest('[data-kitopen]')){tab='kit';render();return}`,
`  if(t.closest('[data-newsdone]')){S.newsSeen=NEWS.v;save();render();return}
  if(t.closest('[data-kitopen]')){tab='kit';render();return}`,
  'dismiss handler');

fs.writeFileSync('index.html',t);
console.log('patch 9 applied');
