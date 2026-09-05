/* Take the exercise figures out. The muscle charts stay and become the whole
   visual — they were always the part that read cleanly, and they are honest:
   a shaded diagram says "this is what this works" without pretending to
   demonstrate technique that eleven keypoints cannot demonstrate.

   Everything the figures needed goes with them: the renderer, the loop, the
   equipment shapes, the pose data on all 155 movements, and the CSS. What must
   NOT go: muscle maps, cues, doses, ranks, storage, quests, progression, or the
   nf flag, which the quest generator uses and has nothing to do with drawing. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const cut=(label,a,b)=>{
  const c=s.split(a).length-1;
  if(c!==1){console.log('!! '+label+' matched '+c);process.exit(1)}
  s=s.split(a).join(b); console.log('  '+label);
};

/* ---- 1. the library card shows muscles instead of a figure ---- */
cut('library card -> muscle chart',
`        <svg data-fig="\${e.id}" data-phase="\${(i%7)*.13}" style="width:100%;aspect-ratio:1"></svg>`,
`        \${bodyCard(e.mus)}`);

/* ---- 2. the two detail surfaces drop the instruction strip ---- */
s=s.split(`    \${figStrip(e)}\n`).join('');
console.log('  detail surfaces keep only the muscle map');

/* ---- 3. the figure block: painter, loop, pose plumbing, equipment ---- */
const a=s.indexOf('/* ---------------- figures');
const b=s.indexOf('/* ---------------- provisions');
if(a<0||b<0){console.log('!! figure block bounds');process.exit(1)}
s=s.slice(0,a)+s.slice(b);
console.log('  figure renderer, animation loop and equipment shapes removed');

/* ---- 4. mountAll calls ---- */
s=s.split(`    v.querySelectorAll('svg').forEach(x=>{rigs=rigs.filter(r=>r.svg!==x)});\n`).join('')
   .split('mountAll(v);').join('').split('mountAll(root);').join('')
   .split('{mountAll(root);runTicker()}').join('{runTicker()}');
console.log('  mount calls and rig teardown removed');

/* ---- 5. the shared pose constants ---- */
const c=s.indexOf('const P=(...n)=>n;');
const d=s.indexOf('/* eq: [] = nothing needed.');
if(c<0||d<0){console.log('!! pose constants bounds');process.exit(1)}
s=s.slice(0,c)+s.slice(d);
console.log('  pose constants removed');

/* ---- 6. pose and prop fields on all 155 movements ---- */
let poses=0,props=0;
/* Bracket-count each f:[...] and swallow the comment lines that introduced it.
   A regex here silently matched nothing and left every pose array behind after
   its P() helper had already been deleted, which would have thrown on load. */
for(;;){
  const fA=s.indexOf(' f:[');
  if(fA<0)break;
  let k=fA+3,d=0;
  for(;k<s.length;k++){if(s[k]==='[')d++;else if(s[k]===']'){d--;if(!d)break}}
  let p=fA;
  while(p>0&&/\s/.test(s[p-1]))p--;
  while(s.slice(0,p).trimEnd().endsWith('*/')){
    const e2=s.lastIndexOf('*/',p), c2=s.lastIndexOf('/*',e2);
    if(c2<0)break;
    p=c2; while(p>0&&/\s/.test(s[p-1]))p--;
  }
  if(s[p-1]===',')p--;
  s=s.slice(0,p)+s.slice(k+1);
  poses++;
}
s=s.replace(/,p:'[a-z0-9+]*'/g,m=>{props++;return ''});
s=s.replace(/^\{id:'([a-z0-9_]+)',p:'[a-z0-9+]*',/gm,(m,id)=>{props++;return `{id:'${id}',`});
s=s.replace(/ref:'[a-z0-9_]+',/g,'');
console.log('  stripped '+poses+' pose arrays and '+props+' prop fields');

/* ---- 7. figure CSS ---- */
const css=[
 /^\.fig\{[^}]*\}\n/m, /^\.fig polyline[^}]*\}\n/m, /^\.gnd\{[^}]*\}\n/m,
 /^\.figback polyline\{[^}]*\}\n/m, /^\.figfront polyline\{[^}]*\}\n/m,
 /^\.eqf\{[^}]*\}\n/m, /^\.eqo\{[^}]*\}\n/m, /^\.eqb\{[^}]*\}\n/m,
 /^\.eqf2\{[^}]*\}\n/m, /^\.eqs\{[^}]*\}\n/m, /^\.eqc\{[^}]*\}\n/m,
 /^\.figbig\{[\s\S]*?\}\n/m, /^\.figbig svg\{[^}]*\}\n/m,
 /^\.figseq\{[\s\S]*?\}\n/m, /^\.figseq::-webkit-scrollbar\{[^}]*\}\n/m,
 /^\.figseq figure\{[\s\S]*?\}\n/m, /^\.figseq\[data-wide\] figure\{[^}]*\}\n/m,
 /^\.figseq\.solo figure\{[^}]*\}\n/m, /^\.figseq svg\{[^}]*\}\n/m,
 /^\.figseq figcaption\{[\s\S]*?\}\n/m, /^\.fgo\{[^}]*\}\n/m,
];
let ncss=0;
for(const re of css){if(re.test(s)){s=s.replace(re,'');ncss++}}
s=s.replace(/@media\(max-width:400px\)\{\n\s*\.figseq[\s\S]*?\n\}\n/m,'');
console.log('  '+ncss+' figure CSS rules removed');

/* ---- 8. the compact chart the cards use ---- */
const anchor='function bodyMap(mus){';
const add=`/* A card is small and square, so it gets both views side by side with no
   captions — enough to say at a glance what the movement works. */
function bodyCard(mus){
  return \`<div class="bodycard">\${bodyView('front',mus)}\${bodyView('back',mus)}</div>\`;
}
function bodyMap(mus){`;
cut('bodyCard added', anchor, add);
s=s.replace('.bodymap{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}',
`.bodymap{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.bodycard{display:grid;grid-template-columns:1fr 1fr;gap:3px;width:100%}
.bodycard .bodyfig{border:0;padding:0;background:none}
.bodycard .bodyfig svg{max-height:none}
.bodycard figcaption{display:none}`);
console.log('  card chart styling added');

fs.writeFileSync(F,s);
console.log('done');
