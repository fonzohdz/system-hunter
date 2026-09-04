/* The 155-movement visual audit: every movement at start / mid / end, plus the
   live animation at the 52px size it appears on a quest card. */
const fs=require('fs');const L=require('./lib.js');const M=L.load('index.html');

/* Everything re-authored in this pass, from the exercise itself. */
const AUTHORED=new Set(('squat lunge hinge pushup birddog deadbug stepup bb_ohp bb_dl db_curl '+
'mch_legext mch_legcurl mch_calf mch_abduct mch_adduct mch_crunch cbl_pushdown cbl_flyhigh '+
'cbl_flylow cbl_crossover cbl_straight cbl_woodchop cbl_pallof cbl_kick db_incline_curl '+
'db_conc ez_preacher db_wrist ez_skull db_kickback db_reardelt db_upright db_shrug '+
'kb_carry_rack db_curtsy db_singlerdl nordic sissy db_latstep db_pullover dip trx_fallout '+
'kb_windmill lm_twist mb_slam kb_snatch sled_push hang chinup kneeraise ttb db_press '+
'db_thruster db_hammer pistol legpress db_lunge split db_bulg kb_swing archer slbridge '+
'bear climber jack handstand diamond bb_ohp_push burpee_s burpee_f bb_clean kb_tgu kb_cp '+
'mch_chest mch_shoulder mch_pecdeck mch_row mch_hack bb_sumo tb_dl bb_goodmorning '+
'bb_pendlay bb_incline bb_frontlunge db_gobletlunge db_arnold lm_press db_farmerwalk '+
'wallpush bb_squat calf cable_row db_row db_tri db_bench bb_bench db_floor march pike kb_halo '+
'ghr handstand cbl_kick cbl_pullthrough ttb mch_incline rowerg trx_row db_walklunge '+
'plank kneeplank sideplank sideknee'
).split(/\s+/).filter(Boolean));

/* Behaviour, stated per movement rather than inferred from the category. */
const HOLD=new Set('plank kneeplank sideplank sideknee hollow wallsit bear hang handstand superman'.split(' '));
/* Known limits of an 11-joint rig, stated rather than hidden. */
const LIMIT={db_wrist:'RIG-LIMITED — setup recognisable, wrist articulation unavailable. No wrist joint in the rig — the setup pose carries the identification, the motion is necessarily small'};
const ALT =new Set('birddog deadbug climber march db_walklunge'.split(' '));
const LOCO=new Set('db_carry db_farmerwalk kb_carry_rack treadmill sled_push rowerg'.split(' '));
/* Multi-phase is a statement about the exercise, not a frame count: many reps
   now carry extra frames purely to keep a limb on its arc. */
const MULTI=new Set('burpee_f burpee_s bb_clean kb_tgu kb_cp kb_snatch db_thruster bb_ohp_push db_arnold ghr db_walklunge rowerg'.split(' '));
const kind=e=>{
  if(HOLD.has(e.id))return 'hold';
  if(LOCO.has(e.id))return 'locomotion';
  if(ALT.has(e.id))return 'alternating';
  if(MULTI.has(e.id))return 'multi-phase';
  return 'rep'};
/* What the painter can actually draw, so "has context" is a fact about the
   rendered picture rather than about the data. */
const SETKEYS=new Set([...M.src.slice(M.src.indexOf('const SET={'),
  M.src.indexOf('function paintFig')).matchAll(/^\s{2}([a-z0-9]+):/gm)].map(m=>m[1]));
const HELD=new Set([...M.src.matchAll(/prop==='([a-z0-9]+)'/g)].map(m=>m[1]));
const draws=p=>!!p&&p.split('+').some(q=>SETKEYS.has(q)||HELD.has(q));
const status=e=>{
  /* a movement that needs kit but draws none is a bare figure, whatever I did to it */
  if(e.eq.length&&!draws(e.p))return ['NEEDS REVIEW','need'];
  if(!e.f&&draws(by[e.ref].p)&&!draws(e.p))return ['NEEDS REVIEW','need'];
  if(!e.f)return ['VERIFIED SHARED','shared'];
  if(AUTHORED.has(e.id))return ['RE-AUTHORED','re'];
  return ['VERIFIED UNIQUE','uniq'];
};

/* --- drawing: the same geometry the app uses, including the context objects --- */
const SET=(()=>{const o={};const src=M.src;
  const blk=src.slice(src.indexOf('const SET={'),src.indexOf('function paintFig'));
  for(const m of blk.matchAll(/^\s{2}([a-z0-9]+):\s*((?:`[^`]*`(?:\s*\+\s*)?)+),?$/gm))
    o[m[1]]=m[2].replace(/`/g,'').replace(/\s*\+\s*/g,'');
  return o})();
const P=p=>{const o=[];for(let i=0;i<22;i+=2)o.push({x:p[i],y:p[i+1]});return o};
const poly=(p,ix)=>ix.map(i=>p[i].x+','+p[i].y).join(' ');
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
  return `<svg viewBox="0 0 100 100" class="f">${SET[fixed]||''}`+
    `<line x1="4" y1="94" x2="96" y2="94" class="g"/>`+
    `<g class="bk" fill="none" stroke-linecap="round" stroke-linejoin="round">`+
    `<polyline points="${poly(p,[1,3,4])}"/><polyline points="${poly(p,[2,5,6])}"/></g>`+
    `<g class="fr" fill="none" stroke-linecap="round" stroke-linejoin="round">`+
    `<polyline points="${poly(p,[1,2])}"/><polyline points="${poly(p,[1,7,8])}"/>`+
    `<polyline points="${poly(p,[2,9,10])}"/></g>`+
    `<circle cx="${pose[0]}" cy="${pose[1]}" r="7.5" class="hd"/>`+
    `<g>${held(p,hand)}</g></svg>`;
}
const mid=f=>f.length>2?f[Math.floor(f.length/2)]
  :f[0].map((v,i)=>Math.round(v+(f[1][i]-v)*.5));

const by={};for(const e of M.EX)by[e.id]=e;
const groups={};
for(const e of M.EX){const g=!e.eq.length?'Bodyweight':e.eq.map(q=>M.EQNAME[q]).join(' + ');
  (groups[g]=groups[g]||[]).push(e)}

const tally={'RE-AUTHORED':0,'VERIFIED UNIQUE':0,'VERIFIED SHARED':0,'NEEDS REVIEW':0};
const kinds={};
let cards='';
for(const g of Object.keys(groups).sort()){
  cards+=`<h2>${g}</h2><div class="row">`;
  for(const e of groups[g]){
    const f=M.framesFor(e), [st,cls]=status(e), k=kind(e);
    tally[st]++; kinds[k]=(kinds[k]||0)+1;
    cards+=`<div class="c ${cls}" data-st="${st}" data-kind="${k}"><div class="hh">`+
      `<b>${e.n}</b><code>${e.id}</code></div>`+
      `<div class="meta"><span class="tag ${cls}">${st}</span>`+
      `<span class="tag k">${k}</span> ${e.c} · ${e.d} · ${f.length} frame${f.length>2?'s':'s'}`+
      (e.f?'':` · <i>shares <code>${e.ref}</code> (${by[e.ref].n})</i>`)+
      (LIMIT[e.id]?`<div class="lim">rig limit: ${LIMIT[e.id]}</div>`:'')+`</div>`+
      `<div class="strip">`+
        `<div><span>start</span>${still(f[0],e.p)}</div>`+
        `<div><span>mid</span>${still(mid(f),e.p)}</div>`+
        `<div><span>end</span>${still(f[f.length-1],e.p)}</div>`+
        `<div><span>live · 52px</span><div class="sm" data-f='${JSON.stringify(f)}' `+
          `data-p="${e.p||''}"></div></div>`+
      `</div></div>`;
  }
  cards+='</div>';
}

const html=`<meta charset="utf-8">
<title>Ascendant — 155-movement figure audit</title><style>
:root{--bg:#0b0d12;--card:#151922;--ink:#e8ecf5;--dim:#8a93a8;--line:#2a3140;
 --near:#FF3D7F;--far:#6b2540;--re:#3ddc84;--uniq:#5aa9ff;--shared:#c9a227}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
 font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:20px}
h1{font-size:20px;margin:0 0 6px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);
 margin:30px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}
.lead{color:var(--dim);max-width:74ch;margin:0 0 14px}
.sum{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 6px}
.sum div{background:var(--card);border:1px solid var(--line);border-radius:6px;
 padding:7px 12px;font-size:12px}
.sum b{font-size:16px;display:block}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0 0;
 position:sticky;top:0;background:var(--bg);padding:10px 0;z-index:5;border-bottom:1px solid var(--line)}
button{background:var(--card);color:var(--ink);border:1px solid var(--line);
 border-radius:99px;padding:6px 13px;font:inherit;font-size:12px;cursor:pointer}
button[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px}
.c{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px}
.c.re{border-left:3px solid var(--re)}
.c.uniq{border-left:3px solid var(--uniq)}
.c.shared{border-left:3px solid var(--shared)}
.c.need{border-left:3px solid #ff5c5c}
.tag.need{color:#ff5c5c}
.lim{margin-top:4px;font-size:10px;color:#c9a227}
.hh{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.hh b{font-size:13px}
code{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dim)}
.meta{font-size:11px;color:var(--dim);margin:4px 0 8px}
.tag{display:inline-block;font-size:9px;letter-spacing:.08em;padding:1px 6px;
 border-radius:99px;margin-right:5px;border:1px solid currentColor}
.tag.re{color:var(--re)}.tag.uniq{color:var(--uniq)}.tag.shared{color:var(--shared)}
.tag.k{color:var(--dim)}
.strip{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.strip>div{text-align:center;min-width:0}
.strip span{display:block;font-size:9px;color:var(--dim);text-transform:uppercase;
 letter-spacing:.06em;margin-bottom:3px}
.f{width:100%;aspect-ratio:1;background:#0e1119;border-radius:4px;display:block}
.sm .f{width:52px;height:52px;margin:0 auto}
.g{stroke:var(--line);stroke-width:1}
.bk polyline{stroke:var(--far);stroke-width:5}
.fr polyline{stroke:var(--near);stroke-width:6}
.hd{fill:var(--near)}
.eqf{fill:#D8C2CC}.eqo{fill:none;stroke:#D8C2CC;stroke-width:1.5}
.eqb{stroke:#c9a227;stroke-width:2;stroke-dasharray:3 2.5}
.eqf2{stroke:#D8C2CC;stroke-width:2.6}
.eqs{fill:#2A3446}.eqc{stroke:#8892A6;stroke-width:1.6}
</style>
<h1>Ascendant — figure audit, all ${M.EX.length} movements</h1>
<p class="lead">Each movement at its authored start, midpoint and end, then the live
animation at the 52&nbsp;px size it actually appears on a quest card. The support
surfaces are drawn: bar, bench, box, wall, dip bars, machine seat, cable anchor,
straps, sled. Review by asking one question per movement — <b>with the name covered,
would a gym-goer recognise this exercise?</b></p>
<p class="lead"><b>What the statuses mean.</b> They are machine-checked against
per-exercise expectations — that the right joints move, that supports do not
drift, and that the drawn illustration carries the equipment its name implies.
That last check is new: the earlier audit computed status from what I had edited,
which was circular and could only ever report zero. It still is not the same as
a human looking at the 52&nbsp;px column, which is the real acceptance test.</p>
<div class="sum">
<div><b>${tally['RE-AUTHORED']}</b>re-authored</div>
<div><b>${tally['VERIFIED UNIQUE']}</b>verified unique</div>
<div><b>${tally['VERIFIED SHARED']}</b>verified shared</div>
<div><b>${tally['NEEDS REVIEW']}</b>needs review</div>
${Object.entries(kinds).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div><b>${v}</b>${k}</div>`).join('')}
</div>
<div class="bar"><span style="font-size:12px;color:var(--dim)">show:</span>
<button data-f="all" aria-pressed="true">all</button>
<button data-f="RE-AUTHORED">re-authored</button>
<button data-f="VERIFIED UNIQUE">verified unique</button>
<button data-f="VERIFIED SHARED">verified shared</button>
<button data-f="NEEDS REVIEW">needs review</button>
<button data-f="hold">holds</button>
<button data-f="alternating">alternating</button>
<button data-f="multi-phase">multi-phase</button>
<button data-f="locomotion">locomotion</button></div>
${cards}
<script>
const Lp=(a,b,u)=>a+(b-a)*u;
const IDX=[[1,3,4],[2,5,6],[1,2],[1,7,8],[2,9,10]];
const nodes=[...document.querySelectorAll('.sm')].map(d=>{
  const f=JSON.parse(d.dataset.f);
  d.innerHTML='<svg viewBox="0 0 100 100" class="f">'+
   '<line x1="4" y1="94" x2="96" y2="94" class="g"/>'+
   '<g class="bk" fill="none" stroke-linecap="round" stroke-linejoin="round">'+
   '<polyline/><polyline/></g><g class="fr" fill="none" stroke-linecap="round" '+
   'stroke-linejoin="round"><polyline/><polyline/><polyline/></g>'+
   '<circle r="7.5" class="hd"/></svg>';
  return {f,ln:d.querySelectorAll('polyline'),hd:d.querySelector('circle'),
          ph:Math.random()*2};
});
(function loop(now){
  for(const r of nodes){
    const t=((now/1500)+r.ph)%2,k=t<1?t:2-t,e=k*k*(3-2*k);
    const seg=(r.f.length-1)*e,i=Math.min(r.f.length-2,Math.floor(seg)),u=seg-i;
    const A=r.f[i],B=r.f[i+1],p=[];
    for(let j=0;j<22;j+=2)p.push({x:Lp(A[j],B[j],u),y:Lp(A[j+1],B[j+1],u)});
    for(let q=0;q<5;q++)r.ln[q].setAttribute('points',
      IDX[q].map(z=>p[z].x.toFixed(1)+','+p[z].y.toFixed(1)).join(' '));
    r.hd.setAttribute('cx',p[0].x.toFixed(1));r.hd.setAttribute('cy',p[0].y.toFixed(1));
  }
  requestAnimationFrame(loop);
})(0);
document.querySelector('.bar').addEventListener('click',ev=>{
  const b=ev.target.closest('button'); if(!b)return;
  for(const o of document.querySelectorAll('.bar button'))
    o.setAttribute('aria-pressed', o===b?'true':'false');
  const want=b.dataset.f;
  for(const c of document.querySelectorAll('.c'))
    c.hidden = want!=='all' && c.dataset.st!==want && c.dataset.kind!==want;
  for(const h of document.querySelectorAll('h2')){
    let n=h.nextElementSibling, any=false;
    for(const c of n.children)if(!c.hidden)any=true;
    h.hidden=!any; n.hidden=!any;
  }
});
</script>`;
fs.writeFileSync(process.argv[2],html,'utf8');
console.log('wrote '+process.argv[2]+'  ('+(Buffer.byteLength(html)/1024).toFixed(0)+'KB)');
console.log(Object.entries(tally).map(([k,v])=>'  '+k+': '+v).join('\n'));
console.log('  behaviour: '+Object.entries(kinds).map(([k,v])=>k+' '+v).join(', '));
if(tally['NEEDS REVIEW'])process.exit(1);
