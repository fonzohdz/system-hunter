/* Twelve representative movements plus the squat as a positive control, drawn
   and animated exactly the way production draws them: same stroke weights, same
   head, same gradient, same equipment, same 1500ms segmented smoothstep.

   Nothing is corrected here. The page is for looking at. */
const fs=require('fs');const L=require('./lib.js');const M=L.load('index.html');
const {P,ang}=L;

const LIST=[
 ['squat','CONTROL — already approved. The benchmark the others are read against.'],
 ['hinge',''],['split',''],['stepup',''],['wallsit',''],['pushup',''],['kneepush',''],
 ['birddog',''],['deadbug',''],['climber',''],['bb_dl',''],['bb_row',''],['bb_ohp','']
];

/* --- production styling, verbatim --- */
const CORE='#FFF0F5', CRIMSON='#E8114F', DEEPBLADE='#7A0A2C', LINE='#2A0C1A';
const SETSVG=(()=>{const o={};const src=M.src;
  const blk=src.slice(src.indexOf('const SET={'),src.indexOf('function paintFig'));
  for(const m of blk.matchAll(/^\s{2}([a-z0-9]+):\s*((?:`[^`]*`(?:\s*\+\s*)?)+),?$/gm))
    o[m[1]]=m[2].replace(/`/g,'').replace(/\s*\+\s*/g,'');
  return o})();
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const IDX=[[1,3,4],[2,5,6],[1,2],[1,7,8],[2,9,10]];

/* --- what I can measure, stated as observation not verdict --- */
const kn=(p,s)=>ang(p[2],p[s?5:9],p[s?6:10]);
const el=(p,s)=>ang(p[1],p[s?3:7],p[s?4:8]);
const lean=p=>Math.round(Math.atan2(p[1].x-p[2].x,p[2].y-p[1].y)*57.3);
const sep=(p,a,b)=>Math.hypot(p[a].x-p[b].x,p[a].y-p[b].y);
function facts(e){
  const f=M.framesFor(e).map(P);
  const rng=a=>{const v=f.map(a);return [Math.min(...v),Math.max(...v)]};
  const [k0,k1]=rng(p=>kn(p,0)), [e0,e1]=rng(p=>el(p,0)), [l0,l1]=rng(lean);
  const s=(a,b)=>Math.round(Math.max(...f.map(p=>sep(p,a,b))));
  const hipTravel=Math.round(Math.max(...f.map(p=>sep(p,2,2)))||
    Math.max(...f.map(p=>Math.hypot(p[2].x-f[0][2].x,p[2].y-f[0][2].y))));
  return {n:f.length, knee:Math.round(k1-k0), elbow:Math.round(e1-e0),
    lean:Math.round(l1-l0), feet:s(10,6), knees:s(9,5), hands:s(8,4),
    hip:hipTravel, prop:e.p||null};
}
const CTL=facts(M.EX.find(x=>x.id==='squat'));

/* the questions the user asked, answered where a number can answer them and
   left open where only an eye can */
function readout(e){
  const F=facts(e), out=[];
  const cmp=(v,c,label,unit)=>`<li><span>${label}</span><b>${v}${unit||''}</b>`+
    `<i>squat ${c}${unit||''}</i></li>`;
  out.push(cmp(F.n,CTL.n,'authored poses',''));
  out.push(cmp(F.knee,CTL.knee,'knee travel','&deg;'));
  out.push(cmp(F.elbow,CTL.elbow,'elbow travel','&deg;'));
  out.push(cmp(F.lean,CTL.lean,'torso rotation','&deg;'));
  out.push(cmp(F.hip,CTL.hip,'hip travel','u'));
  const sepCls=v=>v<6?'bad':v<12?'warn':'ok';
  out.push(`<li class="${sepCls(F.feet)}"><span>feet apart</span><b>${F.feet}u`+
    ` &middot; ${(F.feet*0.52).toFixed(1)}px</b><i>squat ${CTL.feet}u</i></li>`);
  out.push(`<li class="${sepCls(F.knees)}"><span>knees apart</span><b>${F.knees}u</b>`+
    `<i>squat ${CTL.knees}u</i></li>`);
  out.push(`<li class="${sepCls(F.hands)}"><span>hands apart</span><b>${F.hands}u</b>`+
    `<i>squat ${CTL.hands}u</i></li>`);
  out.push(`<li class="${F.prop?'ok':''}"><span>equipment drawn</span>`+
    `<b>${F.prop||'none'}</b><i>&nbsp;</i></li>`);
  return out.join('');
}

function held(p,prop){
  const bH=p[4],fH=p[8];
  const db=z=>`<rect x="${z.x-5.5}" y="${z.y-2.4}" width="11" height="4.8" rx="2" fill="#D8C2CC"/>`;
  const kb=z=>`<circle cx="${z.x}" cy="${z.y+3}" r="4.2" fill="#D8C2CC"/>`;
  if(prop==='db')return db(bH)+db(fH);
  if(prop==='db1')return db(fH);
  if(prop==='kb'||prop==='kb1')return kb(fH);
  if(prop==='kb2')return kb({x:(bH.x+fH.x)/2,y:(bH.y+fH.y)/2});
  if(prop==='bar'||prop==='bar2'){const y=(bH.y+fH.y)/2,
    x1=Math.min(bH.x,fH.x)-15,x2=Math.max(bH.x,fH.x)+15;
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#D8C2CC" stroke-width="2.6"/>`+
      `<rect x="${x1-2}" y="${y-6}" width="4.5" height="12" rx="1" fill="#D8C2CC"/>`+
      `<rect x="${x2-2.5}" y="${y-6}" width="4.5" height="12" rx="1" fill="#D8C2CC"/>`}
  return '';
}
function still(pose,prop,px,gid){
  const p=[];for(let i=0;i<22;i+=2)p.push({x:pose[i],y:pose[i+1]});
  const cut=(prop||'').indexOf('+');
  const fixed=cut<0?(prop||''):prop.slice(0,cut), hand=cut<0?(prop||''):prop.slice(cut+1);
  const ln=(ix,st,w)=>`<polyline points="${ix.map(i=>p[i].x+','+p[i].y).join(' ')}" fill="none" `+
    `stroke="${st}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 100 100" width="${px}" height="${px}">`+
    `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">`+
    `<stop offset="0%" stop-color="${CORE}"/><stop offset="100%" stop-color="${CRIMSON}"/>`+
    `</linearGradient></defs>`+
    (SETSVG[fixed]||'').replace(/class="eqs"/g,'fill="#2A3446"')+
    `<line x1="4" y1="94" x2="96" y2="94" stroke="${LINE}" stroke-width="1"/>`+
    ln(IDX[0],DEEPBLADE,5)+ln(IDX[1],DEEPBLADE,5)+
    ln(IDX[2],'url(#'+gid+')',6)+ln(IDX[3],'url(#'+gid+')',6)+ln(IDX[4],'url(#'+gid+')',6)+
    `<circle cx="${p[0].x}" cy="${p[0].y}" r="7.5" fill="url(#${gid})"/>`+
    held(p,hand)+`</svg>`;
}

let gid=0, cards='';
for(const [id,note] of LIST){
  const e=M.EX.find(x=>x.id===id), f=M.framesFor(e);
  const cls=id==='squat'?' ctl':'';
  cards+=`<section class="mv${cls}" id="${id}">
    <header><h3>${esc(e.n)} <code>${id}</code></h3>
      ${note?`<p class="ctlnote">${esc(note)}</p>`:''}</header>
    <div class="body">
      <div class="live" data-f='${JSON.stringify(f)}' data-p="${e.p||''}"></div>
      <ul class="facts">${readout(e)}</ul>
    </div>
    <div class="keys"><span class="kh">authored keyframes &mdash; everything between these is the tween</span>
      <div class="kf">${f.map((q,i)=>`<figure>${still(q,e.p,110,'g'+(gid++))}`+
        `<figcaption>pose ${i+1} of ${f.length}</figcaption></figure>`).join('')}</div></div>
  </section>`;
}

const html=`<meta charset="utf-8">
<title>Ascendant — representative movement audit</title><style>
:root{--bg:#0b0d12;--card:#151922;--ink:#e8ecf5;--dim:#8a93a8;--line:#2a3140;
 --ok:#3ddc84;--warn:#ffb020;--bad:#ff5c5c}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);padding:20px;
 font:14px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
h1{font-size:20px;margin:0 0 6px}
h3{font-size:14px;margin:0}
h3 code{font:11px ui-monospace,Menlo,monospace;color:var(--dim);margin-left:6px}
p.lead{color:var(--dim);max-width:78ch;margin:0 0 8px}
.mv{background:var(--card);border:1px solid var(--line);border-radius:10px;
 padding:14px;margin-bottom:12px}
.mv.ctl{border-color:#2a5a3f;background:#121a16}
.ctlnote{font-size:11px;color:var(--ok);margin:4px 0 0}
header{margin-bottom:12px}
.body{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}
.live{display:flex;gap:14px;align-items:flex-end}
.card52{background:#0e1119;border-radius:4px;line-height:0}
.big{background:#0e1119;border-radius:6px;line-height:0}
.cap{display:block;font-size:9px;color:var(--dim);text-transform:uppercase;
 letter-spacing:.07em;text-align:center;margin-top:5px}
.facts{list-style:none;margin:0;padding:0;flex:1 1 300px;min-width:280px;
 display:grid;grid-template-columns:1fr;gap:1px;font-size:11px}
.facts li{display:grid;grid-template-columns:1fr auto auto;gap:10px;
 padding:3px 7px;background:#0e1119;border-radius:3px;align-items:baseline}
.facts span{color:var(--dim)}
.facts b{font-weight:600}
.facts i{color:var(--dim);font-style:normal;font-size:10px;min-width:70px;text-align:right}
.facts li.ok b{color:var(--ok)}
.facts li.warn b{color:var(--warn)}
.facts li.bad b{color:var(--bad)}
.keys{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}
.kh{display:block;font-size:9px;color:var(--dim);text-transform:uppercase;
 letter-spacing:.08em;margin-bottom:7px}
.kf{display:flex;gap:8px;flex-wrap:wrap}
.kf figure{margin:0;background:#0e1119;border-radius:6px;padding:4px}
.kf figcaption{font-size:9px;color:var(--dim);text-align:center;padding-top:3px}
.jump{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0 18px}
.jump a{font-size:11px;color:var(--dim);text-decoration:none;border:1px solid var(--line);
 border-radius:99px;padding:3px 10px}
.jump a:hover{color:var(--ink);border-color:var(--ink)}
</style>
<h1>Representative movement audit</h1>
<p class="lead">Twelve movements plus the squat as a positive control, animating
exactly as production renders them — same 6&nbsp;px front and 5&nbsp;px rear
strokes, same 7.5 head, same gradient, same equipment, same 1500&nbsp;ms
segmented smoothstep. <b>Nothing here has been corrected.</b></p>
<p class="lead">The numbers next to each are measurements against the squat, not
verdicts. Green, amber and red on the separation rows only mean "further apart
than the squat", "tighter", and "effectively overlapping" — whether that matters
depends on the movement, which is what your eye is for.</p>
<div class="jump">${LIST.map(([id])=>
  `<a href="#${id}">${esc(M.EX.find(x=>x.id===id).n)}</a>`).join('')}</div>
${cards}
<script>
const IDX=${JSON.stringify(IDX)};
const SET=${JSON.stringify(SETSVG)};
function held(p,prop){
  const bH=p[4],fH=p[8];
  const db=z=>'<rect x="'+(z.x-5.5)+'" y="'+(z.y-2.4)+'" width="11" height="4.8" rx="2" fill="#D8C2CC"/>';
  const kb=z=>'<circle cx="'+z.x+'" cy="'+(z.y+3)+'" r="4.2" fill="#D8C2CC"/>';
  if(prop==='db')return db(bH)+db(fH);
  if(prop==='db1')return db(fH);
  if(prop==='kb'||prop==='kb1')return kb(fH);
  if(prop==='kb2')return kb({x:(bH.x+fH.x)/2,y:(bH.y+fH.y)/2});
  if(prop==='bar'||prop==='bar2'){const y=(bH.y+fH.y)/2,
    x1=Math.min(bH.x,fH.x)-15,x2=Math.max(bH.x,fH.x)+15;
    return '<line x1="'+x1+'" y1="'+y+'" x2="'+x2+'" y2="'+y+'" stroke="#D8C2CC" stroke-width="2.6"/>'+
      '<rect x="'+(x1-2)+'" y="'+(y-6)+'" width="4.5" height="12" rx="1" fill="#D8C2CC"/>'+
      '<rect x="'+(x2-2.5)+'" y="'+(y-6)+'" width="4.5" height="12" rx="1" fill="#D8C2CC"/>';}
  return '';
}
let gid=1000;
function build(host,prop,px,cls,cap){
  const cut=(prop||'').indexOf('+');
  const fixed=cut<0?(prop||''):prop.slice(0,cut);
  const id='lg'+(gid++);
  const w=document.createElement('div'); w.className=cls;
  w.innerHTML='<svg viewBox="0 0 100 100" width="'+px+'" height="'+px+'">'+
    '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">'+
    '<stop offset="0%" stop-color="#FFF0F5"/><stop offset="100%" stop-color="#E8114F"/>'+
    '</linearGradient></defs>'+
    (SET[fixed]||'').replace(/class="eqs"/g,'fill="#2A3446"')+
    '<line x1="4" y1="94" x2="96" y2="94" stroke="#2A0C1A" stroke-width="1"/>'+
    '<polyline class="b1"/><polyline class="b2"/>'+
    '<polyline class="f1"/><polyline class="f2"/><polyline class="f3"/>'+
    '<circle class="hd" r="7.5" fill="url(#'+id+')"/><g class="eq"></g></svg>';
  const sv=w.querySelector('svg');
  sv.querySelectorAll('polyline').forEach(p=>{p.setAttribute('fill','none');
    p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round')});
  for(const s of ['.b1','.b2']){const p=sv.querySelector(s);
    p.setAttribute('stroke','#7A0A2C');p.setAttribute('stroke-width',5)}
  for(const s of ['.f1','.f2','.f3']){const p=sv.querySelector(s);
    p.setAttribute('stroke','url(#'+id+')');p.setAttribute('stroke-width',6)}
  host.appendChild(w);
  w.insertAdjacentHTML('afterend','<span class="cap">'+cap+'</span>');
  return {lines:sv.querySelectorAll('polyline'),hd:sv.querySelector('.hd'),
          eq:sv.querySelector('.eq')};
}
const rigs=[];
document.querySelectorAll('.live').forEach(host=>{
  const f=JSON.parse(host.dataset.f), prop=host.dataset.p||'';
  const cut=prop.indexOf('+'); const hand=cut<0?prop:prop.slice(cut+1);
  for(const [px,cap] of [[52,'52px &middot; real'],[150,'enlarged']]){
    const box=document.createElement('div'); box.style.textAlign='center';
    host.appendChild(box);
    rigs.push({f,hand,r:build(box,prop,px,px===52?'card52':'big',cap)});
  }
});
/* production's loop, verbatim */
(function loop(now){
  for(const g of rigs){
    const t=(now/1500)%2, k=t<1?t:2-t, e=k*k*(3-2*k);
    const n=g.f.length, seg=(n-1)*e, i=Math.min(n-2,Math.floor(seg)), u=seg-i;
    const A=g.f[i],B=g.f[i+1],p=[];
    for(let j=0;j<22;j+=2)p.push({x:A[j]+(B[j]-A[j])*u, y:A[j+1]+(B[j+1]-A[j+1])*u});
    for(let q=0;q<5;q++)g.r.lines[q].setAttribute('points',
      IDX[q].map(z=>p[z].x.toFixed(2)+','+p[z].y.toFixed(2)).join(' '));
    g.r.hd.setAttribute('cx',p[0].x.toFixed(2));g.r.hd.setAttribute('cy',p[0].y.toFixed(2));
    if(g.hand)g.r.eq.innerHTML=held(p,g.hand);
  }
  requestAnimationFrame(loop);
})(0);
</script>`;
fs.writeFileSync(process.argv[2],html,'utf8');
console.log('wrote '+process.argv[2]+'  ('+(Buffer.byteLength(html)/1024).toFixed(0)+'KB)');
