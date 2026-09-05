/* Ten movements, before and after, animating at the size they actually appear
   on a quest card. Plus a blind column with the names hidden, because that is
   the only test that has ever mattered. */
const fs=require('fs');const L=require('./lib.js');
const NEW=L.load('index.html'), OLD=L.load(process.argv[2]);
const OUT=process.argv[3];
const TEN=['squat','bb_squat','hinge','bb_dl','stepup','split','pushup',
           'birddog','deadbug','climber'];

const SETSVG=(()=>{const o={};const src=NEW.src;
  const blk=src.slice(src.indexOf('const SET={'),src.indexOf('function paintFig'));
  for(const m of blk.matchAll(/^\s{2}([a-z0-9]+):\s*((?:`[^`]*`(?:\s*\+\s*)?)+),?$/gm))
    o[m[1]]=m[2].replace(/`/g,'').replace(/\s*\+\s*/g,'');
  return o})();
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const rig=(id,f,prop,cls)=>
  `<div class="${cls}" data-f='${JSON.stringify(f)}' data-p="${prop||''}"></div>`;

let rows='';
for(const id of TEN){
  const a=OLD.EX.find(x=>x.id===id), b=NEW.EX.find(x=>x.id===id);
  const fa=OLD.framesFor(a), fb=NEW.framesFor(b);
  rows+=`<tr><th>${esc(b.n)}<code>${id}</code>
    <span class="cnt">${fa.length} &rarr; ${fb.length} key poses</span></th>
    <td>${rig(id,fa,a.p,'sm')}<span class="lbl">before</span></td>
    <td>${rig(id,fb,b.p,'sm')}<span class="lbl">after</span></td>
    <td>${rig(id,fb,b.p,'lg')}<span class="lbl">after, large</span></td></tr>`;
}

/* the blind column: same ten, shuffled, no names */
const shuffled=TEN.map(id=>{const e=NEW.EX.find(x=>x.id===id);
  return {id,n:e.n,f:NEW.framesFor(e),p:e.p}})
  .map(v=>({v,k:Math.random()})).sort((x,y)=>x.k-y.k).map(x=>x.v);
const blind=shuffled.map((v,i)=>
  `<div class="bcell"><div class="bnum">${i+1}</div>${rig(v.id,v.f,v.p,'sm')}
   <button class="rev" data-a="${esc(v.n)}">reveal</button></div>`).join('');

const html=`<meta charset="utf-8">
<title>Ascendant — ten re-authored movements</title><style>
:root{--bg:#0b0d12;--card:#151922;--ink:#e8ecf5;--dim:#8a93a8;--line:#2a3140;
 --near:#FF3D7F;--far:#6b2540}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);padding:20px;
 font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
h1{font-size:20px;margin:0 0 6px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);
 margin:30px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}
p.lead{color:var(--dim);max-width:74ch;margin:0 0 14px}
table{border-collapse:collapse;width:100%;max-width:760px}
th,td{border-bottom:1px solid var(--line);padding:10px 8px;text-align:left;
 vertical-align:middle}
th{font-size:13px;font-weight:600;width:230px}
th code{display:block;font:11px ui-monospace,Menlo,monospace;color:var(--dim)}
th .cnt{display:block;font-size:10.5px;color:var(--dim);font-weight:400;margin-top:2px}
td{text-align:center;width:auto}
.lbl{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.08em;
 color:var(--dim);margin-top:5px}
.sm svg,.lg svg{background:#0e1119;border-radius:4px;display:block;margin:0 auto}
.sm svg{width:52px;height:52px}
.lg svg{width:150px;height:150px}
.blind{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));
 gap:10px;max-width:760px}
.bcell{background:var(--card);border:1px solid var(--line);border-radius:8px;
 padding:10px 6px;text-align:center}
.bnum{font-size:10px;color:var(--dim);margin-bottom:6px}
.rev{margin-top:7px;background:transparent;border:1px solid var(--line);color:var(--dim);
 border-radius:99px;font:inherit;font-size:10px;padding:3px 9px;cursor:pointer}
.rev.on{color:var(--ink);border-color:var(--ink)}
.g{stroke:var(--line);stroke-width:1}
.bk polyline{stroke:var(--far);stroke-width:5}
.fr polyline{stroke:var(--near);stroke-width:6}
.hd{fill:var(--near)}
.eqf{fill:#D8C2CC}.eqo{fill:none;stroke:#D8C2CC;stroke-width:1.5}
.eqb{stroke:#c9a227;stroke-width:2;stroke-dasharray:3 2.5}
.eqf2{stroke:#D8C2CC;stroke-width:2.6}
.eqs{fill:#2A3446}.eqc{stroke:#8892A6;stroke-width:1.6}
</style>
<h1>Ten movements, re-authored by hand</h1>
<p class="lead">Animating, at the 52&nbsp;px size they appear on a quest card, next to
what they looked like before. Three things changed in the drawing: the stance is
wide enough to see two legs, the far limb is deliberately offset rather than
hidden behind the near one, and the landmark positions are exaggerated. Movements
that travel a long way got an authored middle pose, so the animation passes
through something drawn rather than sliding every joint in a straight line.</p>

<h2>Blind — names hidden</h2>
<p class="lead">The only test that counts. Say what each one is before you reveal it.</p>
<div class="blind">${blind}</div>

<h2>Before and after</h2>
<table>${rows}</table>

<script>
const L=(a,b,u)=>a+(b-a)*u;
const IDX=[[1,3,4],[2,5,6],[1,2],[1,7,8],[2,9,10]];
const SET=${JSON.stringify(SETSVG)};
function held(p,prop){
  const bH=p[4],fH=p[8];
  const db=z=>'<rect x="'+(z.x-5.5)+'" y="'+(z.y-2.4)+'" width="11" height="4.8" rx="2" class="eqf"/>';
  const kb=z=>'<circle cx="'+z.x+'" cy="'+(z.y+3)+'" r="4.2" class="eqf"/>';
  if(prop==='db')return db(bH)+db(fH);
  if(prop==='db1')return db(fH);
  if(prop==='kb'||prop==='kb1')return kb(fH);
  if(prop==='kb2')return kb({x:(bH.x+fH.x)/2,y:(bH.y+fH.y)/2});
  if(prop==='bar'||prop==='bar2'){const y=(bH.y+fH.y)/2,
    x1=Math.min(bH.x,fH.x)-15,x2=Math.max(bH.x,fH.x)+15;
    return '<line x1="'+x1+'" y1="'+y+'" x2="'+x2+'" y2="'+y+'" class="eqf2"/>'+
      '<rect x="'+(x1-2)+'" y="'+(y-6)+'" width="4.5" height="12" rx="1" class="eqf"/>'+
      '<rect x="'+(x2-2.5)+'" y="'+(y-6)+'" width="4.5" height="12" rx="1" class="eqf"/>';}
  return '';
}
const nodes=[...document.querySelectorAll('.sm,.lg')].map(d=>{
  const f=JSON.parse(d.dataset.f), prop=d.dataset.p||'';
  const cut=prop.indexOf('+');
  const fixed=cut<0?prop:prop.slice(0,cut), hand=cut<0?prop:prop.slice(cut+1);
  d.innerHTML='<svg viewBox="0 0 100 100">'+(SET[fixed]||'')+
   '<line x1="4" y1="94" x2="96" y2="94" class="g"/>'+
   '<g class="bk" fill="none" stroke-linecap="round" stroke-linejoin="round">'+
   '<polyline/><polyline/></g><g class="fr" fill="none" stroke-linecap="round" '+
   'stroke-linejoin="round"><polyline/><polyline/><polyline/></g>'+
   '<circle r="7.5" class="hd"/><g class="eq"></g></svg>';
  return {f,hand,ln:d.querySelectorAll('polyline'),hd:d.querySelector('circle'),
          eq:d.querySelector('.eq'),ph:Math.random()*2};
});
(function loop(now){
  for(const r of nodes){
    const t=((now/1500)+r.ph)%2,k=t<1?t:2-t,e=k*k*(3-2*k);
    const seg=(r.f.length-1)*e,i=Math.min(r.f.length-2,Math.floor(seg)),u=seg-i;
    const A=r.f[i],B=r.f[i+1],p=[];
    for(let j=0;j<22;j+=2)p.push({x:L(A[j],B[j],u),y:L(A[j+1],B[j+1],u)});
    for(let q=0;q<5;q++)r.ln[q].setAttribute('points',
      IDX[q].map(z=>p[z].x.toFixed(1)+','+p[z].y.toFixed(1)).join(' '));
    r.hd.setAttribute('cx',p[0].x.toFixed(1));r.hd.setAttribute('cy',p[0].y.toFixed(1));
    if(r.hand)r.eq.innerHTML=held(p,r.hand);
  }
  requestAnimationFrame(loop);
})(0);
document.querySelector('.blind').addEventListener('click',ev=>{
  const b=ev.target.closest('.rev'); if(!b)return;
  b.textContent=b.dataset.a; b.classList.add('on');
});
</script>`;
fs.writeFileSync(OUT,html,'utf8');
console.log('wrote '+OUT+'  ('+(Buffer.byteLength(html)/1024).toFixed(0)+'KB)');
