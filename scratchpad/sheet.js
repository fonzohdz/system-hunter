/* The 155-movement audit, rebuilt for static instruction art.
   Each movement shows what the product shows: the CARD still, and the
   INSTRUCTION sequence exactly as the detail view lays it out. Nothing animates
   here either — if a pose only looks right in motion, it is not good enough. */
const fs=require('fs');const L=require('./lib.js');const M=L.load('index.html');
const man=JSON.parse(fs.readFileSync('scratchpad/manifest.json','utf8'));
const cls={};for(const r of man)cls[r.id]=r;

const SETSVG=(()=>{const o={};const src=M.src;
  const blk=src.slice(src.indexOf('const SET={'),src.indexOf('function paintFig'));
  for(const m of blk.matchAll(/^\s{2}([a-z0-9]+):\s*((?:`[^`]*`(?:\s*\+\s*)?)+),?$/gm))
    o[m[1]]=m[2].replace(/`/g,'').replace(/\s*\+\s*/g,'');
  return o})();
const P=p=>{const o=[];for(let i=0;i<22;i+=2)o.push({x:p[i],y:p[i+1]});return o};
const poly=(p,ix)=>ix.map(i=>p[i].x+','+p[i].y).join(' ');
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

function held(p,prop){
  const bH=p[4],fH=p[8];
  const db=z=>`<rect x="${z.x-5.5}" y="${z.y-2.4}" width="11" height="4.8" rx="2" class="eqf"/>`;
  const kb=z=>`<circle cx="${z.x}" cy="${z.y+3}" r="4.2" class="eqf"/>`;
  if(prop==='db')return db(bH)+db(fH);
  if(prop==='db1')return db(fH);
  if(prop==='kb'||prop==='kb1')return kb(fH);
  if(prop==='kb2')return kb({x:(bH.x+fH.x)/2,y:(bH.y+fH.y)/2});
  if(prop==='band')return `<line x1="${bH.x}" y1="${bH.y}" x2="${fH.x}" y2="${fH.y}" class="eqb"/>`;
  if(prop==='bar'||prop==='bar2'){const y=(bH.y+fH.y)/2,
    x1=Math.min(bH.x,fH.x)-15,x2=Math.max(bH.x,fH.x)+15;
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="eqf2"/>`+
      `<rect x="${x1-2}" y="${y-6}" width="4.5" height="12" rx="1" class="eqf"/>`+
      `<rect x="${x2-2.5}" y="${y-6}" width="4.5" height="12" rx="1" class="eqf"/>`}
  if(prop==='cablehi')return `<rect x="93" y="8" width="7" height="12" class="eqs"/><line x1="94" y1="14" x2="${fH.x}" y2="${fH.y}" class="eqc"/>`+db(fH);
  if(prop==='cablelo')return `<rect x="93" y="78" width="7" height="12" class="eqs"/><line x1="94" y1="84" x2="${fH.x}" y2="${fH.y}" class="eqc"/>`+db(fH);
  if(prop==='cablemid')return `<rect x="93" y="44" width="7" height="12" class="eqs"/><line x1="94" y1="50" x2="${fH.x}" y2="${fH.y}" class="eqc"/>`+db(fH);
  if(prop==='strap')return `<line x1="${bH.x}" y1="4" x2="${bH.x}" y2="${bH.y}" class="eqc"/><line x1="${fH.x}" y1="4" x2="${fH.x}" y2="${fH.y}" class="eqc"/>`;
  if(prop==='plate')return `<circle cx="${(bH.x+fH.x)/2}" cy="${(bH.y+fH.y)/2}" r="6" class="eqo"/>`;
  if(prop==='tbar'){const x=fH.x,y=fH.y;
    return `<polygon points="${x-23},${y} ${x-13},${y-8} ${x+13},${y-8} ${x+23},${y} ${x+13},${y+8} ${x-13},${y+8}" class="eqo"/>`+
      `<rect x="${x-27}" y="${y-7}" width="4.5" height="14" rx="1" class="eqf"/>`+
      `<rect x="${x+22.5}" y="${y-7}" width="4.5" height="14" rx="1" class="eqf"/>`;}
  if(prop==='bar1')return `<line x1="6" y1="90" x2="${fH.x}" y2="${fH.y}" class="eqf2"/>`+
    `<rect x="2" y="86" width="9" height="8" rx="2" class="eqs"/>`+
    `<rect x="${fH.x-2.5}" y="${fH.y-6}" width="5" height="12" rx="1" class="eqf"/>`;
  if(prop==='assistpad'){const k=p[9];
    return `<rect x="${k.x-15}" y="${k.y+5}" width="30" height="4.5" rx="1.5" class="eqs"/>`+
      `<rect x="${k.x-2}" y="${k.y+9}" width="4" height="14" class="eqs"/>`;}
  if(prop==='cableank')return `<rect x="93" y="78" width="7" height="12" class="eqs"/>`+
    `<line x1="94" y1="84" x2="${p[6].x}" y2="${p[6].y}" class="eqc"/>`;
  if(prop==='cablelob')return `<rect x="0" y="78" width="7" height="12" class="eqs"/>`+
    `<line x1="6" y1="84" x2="${fH.x}" y2="${fH.y}" class="eqc"/>`;
  return '';
}
function still(pose,prop){
  const p=P(pose);
  const cut=(prop||'').indexOf('+');
  const fixed=cut<0?(prop||''):prop.slice(0,cut), hand=cut<0?(prop||''):prop.slice(cut+1);
  return `<svg viewBox="0 0 100 100" class="f">${SETSVG[fixed]||''}`+
    `<line x1="4" y1="94" x2="96" y2="94" class="g"/>`+
    `<g class="bk" fill="none" stroke-linecap="round" stroke-linejoin="round">`+
    `<polyline points="${poly(p,[1,3,4])}"/><polyline points="${poly(p,[2,5,6])}"/></g>`+
    `<g class="fr" fill="none" stroke-linecap="round" stroke-linejoin="round">`+
    `<polyline points="${poly(p,[1,2])}"/><polyline points="${poly(p,[1,7,8])}"/>`+
    `<polyline points="${poly(p,[2,9,10])}"/></g>`+
    `<circle cx="${pose[0]}" cy="${pose[1]}" r="7.5" class="hd"/>`+
    `<g>${held(p,hand)}</g></svg>`;
}

const by={};for(const e of M.EX)by[e.id]=e;
const groups={};
for(const e of M.EX){const g=!e.eq.length?'Bodyweight':e.eq.map(q=>M.EQNAME[q]).join(' + ');
  (groups[g]=groups[g]||[]).push(e)}

const tally={'STATIC VERIFIED':0,'NEEDS STATIC REVIEW':0,'RIG LIMITED':0};
const SLUG={'STATIC VERIFIED':'ok','NEEDS STATIC REVIEW':'need','RIG LIMITED':'rig'};
let cards='';
for(const g of Object.keys(groups).sort()){
  cards+=`<h2>${esc(g)}</h2><div class="row">`;
  for(const e of groups[g]){
    const f=M.framesFor(e), r=cls[e.id], hold=M.HOLDPOSE.has(e.id);
    tally[r.class]++;
    const shown=hold?[0]:f.map((_,i)=>i);
    const lab=hold?['Hold this position']:M.phaseNames(e,f.length);
    cards+=`<div class="c ${SLUG[r.class]}" data-st="${r.class}"><div class="hh">`+
      `<b>${esc(e.n)}</b><code>${e.id}</code></div>`+
      `<div class="meta"><span class="tag ${SLUG[r.class]}">${r.class}</span>`+
      `${esc(e.c)} · ${esc(e.d)} · ${shown.length} phase${shown.length>1?'s':''}`+
      ` · context ${esc(r.context)}`+
      (e.f?'':` · <i>shares <code>${esc(e.ref)}</code></i>`)+`</div>`+
      (r.note?`<div class="lim">${esc(r.note)}</div>`:'')+
      `<div class="two">`+
        `<div class="cardcol"><span>card</span>${still(f[r.card],e.p)}</div>`+
        `<div class="seqcol"><span>instruction sequence</span><div class="seq">`+
          shown.map(i=>`<figure>${still(f[i],e.p)}`+
            `<figcaption>${esc(lab[i]||('Step '+(i+1)))}</figcaption></figure>`)
            .join('<span class="go">→</span>')+
        `</div></div>`+
      `</div></div>`;
  }
  cards+='</div>';
}

const html=`<meta charset="utf-8">
<title>Ascendant — 155-movement instruction audit</title><style>
:root{--bg:#0b0d12;--card:#151922;--ink:#e8ecf5;--dim:#8a93a8;--line:#2a3140;
 --near:#FF3D7F;--far:#6b2540;--ok:#3ddc84;--need:#ffb020;--rig:#5aa9ff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
 font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:20px}
h1{font-size:20px;margin:0 0 6px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);
 margin:30px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}
.lead{color:var(--dim);max-width:76ch;margin:0 0 14px}
.sum{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 6px}
.sum div{background:var(--card);border:1px solid var(--line);border-radius:6px;
 padding:7px 12px;font-size:12px}
.sum b{font-size:16px;display:block}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0 0;
 position:sticky;top:0;background:var(--bg);padding:10px 0;z-index:5;
 border-bottom:1px solid var(--line)}
button{background:var(--card);color:var(--ink);border:1px solid var(--line);
 border-radius:99px;padding:6px 13px;font:inherit;font-size:12px;cursor:pointer}
button[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:10px}
.c{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px}
.c.ok{border-color:#1f3a2b}.c.need{border-color:#4a3a12}.c.rig{border-color:#1e3550}
.hh{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.hh b{font-size:13px}
code{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dim)}
.meta{font-size:11px;color:var(--dim);margin:4px 0 8px}
.tag{display:inline-block;font-size:9px;letter-spacing:.08em;padding:1px 6px;
 border-radius:99px;margin-right:5px;border:1px solid currentColor}
.tag.ok{color:var(--ok)}.tag.need{color:var(--need)}.tag.rig{color:var(--rig)}
.lim{margin:0 0 8px;font-size:10.5px;color:var(--need)}
.two{display:grid;grid-template-columns:112px 1fr;gap:12px;align-items:start}
.two span{display:block;font-size:9px;color:var(--dim);text-transform:uppercase;
 letter-spacing:.08em;margin-bottom:4px}
.seq{display:flex;align-items:center;gap:5px;overflow-x:auto}
.seq figure{margin:0;flex:0 0 84px}
.seq figcaption{font-size:9px;color:var(--dim);text-align:center;padding-top:3px}
.go{color:var(--line);flex:0 0 auto}
.f{width:100%;aspect-ratio:1;background:#0e1119;border-radius:4px;display:block}
.cardcol .f{width:112px;height:112px}
.g{stroke:var(--line);stroke-width:1}
.bk polyline{stroke:var(--far);stroke-width:5}
.fr polyline{stroke:var(--near);stroke-width:6}
.hd{fill:var(--near)}
.eqf{fill:#D8C2CC}.eqo{fill:none;stroke:#D8C2CC;stroke-width:1.5}
.eqb{stroke:#c9a227;stroke-width:2;stroke-dasharray:3 2.5}
.eqf2{stroke:#D8C2CC;stroke-width:2.6}
.eqs{fill:#2A3446}.eqc{stroke:#8892A6;stroke-width:1.6}
</style>
<h1>Ascendant — instruction audit, all ${M.EX.length} movements</h1>
<p class="lead">The exercise figures no longer animate. A card carries the single
still that names the movement; tapping it opens the authored positions in order.
This page shows both, exactly as the product renders them — nothing on this page
moves either, because a pose that only reads in motion is not good enough now.</p>
<p class="lead"><b>What the classifications mean.</b> STATIC VERIFIED passed the
per-pose checks: no collapsed limb, no joint folded past what a joint does,
nothing below the floor or outside the frame, equipment that actually draws.
NEEDS STATIC REVIEW means a joint bends one way in one phase and the other way in
another — sometimes correct, sometimes not, so it wants a human. RIG LIMITED means
the eleven-point figure genuinely cannot show the motion. None of this is a
substitute for looking: <b>cover the name and ask whether you would know the
exercise.</b></p>
<div class="sum">
<div><b>${tally['STATIC VERIFIED']}</b>static verified</div>
<div><b>${tally['NEEDS STATIC REVIEW']}</b>needs static review</div>
<div><b>${tally['RIG LIMITED']}</b>rig limited</div>
<div><b>${M.EX.reduce((a,e)=>a+M.framesFor(e).length,0)}</b>authored poses</div>
</div>
<div class="bar"><span style="font-size:12px;color:var(--dim)">show:</span>
<button data-f="all" aria-pressed="true">all</button>
<button data-f="STATIC VERIFIED">static verified</button>
<button data-f="NEEDS STATIC REVIEW">needs static review</button>
<button data-f="RIG LIMITED">rig limited</button></div>
${cards}
<script>
document.querySelector('.bar').addEventListener('click',ev=>{
  const b=ev.target.closest('button'); if(!b)return;
  for(const o of document.querySelectorAll('.bar button'))
    o.setAttribute('aria-pressed', o===b?'true':'false');
  const want=b.dataset.f;
  for(const c of document.querySelectorAll('.c'))
    c.hidden = want!=='all' && c.dataset.st!==want;
  for(const h of document.querySelectorAll('h2')){
    let n=h.nextElementSibling, any=false;
    for(const c of n.children)if(!c.hidden)any=true;
    h.hidden=!any; n.hidden=!any;
  }
});
</script>`;
fs.writeFileSync(process.argv[2],html,'utf8');
console.log('wrote '+process.argv[2]+'  ('+(Buffer.byteLength(html)/1024).toFixed(0)+'KB)');
for(const k in tally)console.log('  '+k.padEnd(20)+tally[k]);
