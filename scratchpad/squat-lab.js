/* Squat sandbox: V1, current, and a ground-up prototype, side by side at the
   exact production card size, animating together, with their keyframes below.
   Writes a standalone page. Touches nothing in the app. */
const fs=require('fs');

/* ---- A: V1, recovered verbatim from commit 567ed12 ---- */
const A={
  name:'A · V1 (567ed12)',
  poses:[[50,14,50,24,50,52,45,37,44,50,46,70,46,88,55,37,56,50,54,70,54,88],
         [48,28,49,38,52,64,56,46,66,40,40,70,44,88,58,48,68,42,62,70,58,88]],
  head:7, front:5, back:4, backOp:0.4, cycle:1400,
  frontCol:'#5BE9E4', backCol:'#9B7BFF', gnd:'#2E2668',
  motion:'segment', ease:'smoothstep',
  note:'2 poses · linear tween · smoothstep timing · 1400ms'
};

/* ---- B: what ships today ---- */
const B={
  name:'B · current (live)',
  poses:[[50,15,50,25,50,52,44,38,42,52,44,72,42,92,56,38,58,52,56,72,58,92],
         [55,27,52,36,47,61,56,48,64,47,51,75,42,92,60,46,68,44,61,73,58,92],
         [62,38,57,47,44,70,60,56,70,53,56,78,42,92,64,54,74,50,64,74,58,92]],
  head:7.5, front:6, back:5, backOp:1, cycle:1500,
  frontCol:'#FF3D7F', backCol:'#7A0A2C', gnd:'#2A1520',
  motion:'segment', ease:'smoothstep',
  note:'3 poses · linear tween per segment · smoothstep timing · 1500ms'
};

/* ---- C: authored from first principles ----
   Decisions, and why:

   CAMERA  side view, but the far leg splays to the OPPOSITE side of the hip
           from the near leg. V1 did this and it is the single best trick here:
           you get two legs without pretending to draw a 3/4 view.
   TORSO   stays upright. 4 degrees off vertical at the bottom, against 30 in
           the current version. A pitched-forward torso over hips-gone-backwards
           is the silhouette of sitting down, which is exactly the complaint.
   HIP     drops 16 units, travels back only 2. Depth reads as vertical travel,
           not as reaching backwards.
   KNEES   splay from 8 apart to 20 apart, and the thighs foreshorten from 19
           units to 11 as they rotate toward the camera. That shortening is the
           depth cue; forcing constant length is what flattened earlier attempts.
   FEET    pinned. Same x and y in every pose. V1 let them slide 2-4 units and
           it is the one thing V1 got wrong.
   ARMS    swing forward to chest height as a counterweight, ending clear of the
           torso so the silhouette stays open.
   HEAD    r=7, V1's size. 7.5 is enough bigger at 52px to read as top-heavy.
   STROKE  front 5, rear 4 at 32% of the SAME hue. V1's rear limb was the same
           family at 40% and read as shadow; the current solid dark rear at 5px
           reads as a second figure competing with the first.
   POSES   3 authored. The loop plays them out and back, so a viewer sees five
           positions: stand, descending, bottom, ascending, stand.
   MOTION  a curve through the keyframes rather than straight lines between
           them, so there is no corner at the middle pose, plus a slower hold at
           the top and bottom than smoothstep gives.
*/
/* ---- C revision 2 ----
   r1 read as a vertical plie: hips straight down, both knees flaring
   symmetrically out to either side. Four changes.

   SIT BACK   the hips travel five units backwards as well as fifteen down, and
              both knees finish FORWARD of the hip (52 and 62 against a hip at
              45) rather than splayed either side of it. The hip is now behind
              the heel line, which is the whole silhouette.
   LESS FLARE the knees separate by ten instead of twenty, and asymmetrically —
              seven ahead of the hip on one side, seventeen on the other.
   SLIGHT LEAN twelve degrees of forward torso, enough to balance the hips going
              back. Past about twenty it starts reading as a hinge.
   ARMS UP    hands finish at shoulder height, not chest. r1 stopped at y=48-50;
              V1 went to y=40-42, and that counterweight is most of where V1's
              character came from.

   Two poses, straight tween, V1's smoothstep, V1's contrasting faded rear. */
const C={
  name:'C · prototype r2',
  poses:[[50,14,50,24,50,52,45,37,44,50,46,71,45,90,55,37,56,50,54,71,55,90],
         [53,30,51,40,45,67,55,48,65,44,52,74,45,90,59,46,69,42,62,73,55,90]],
  head:7, front:5, back:4, backOp:0.38, cycle:1400,
  frontCol:'#FF3D7F', backCol:'#9B7BFF', gnd:'#2A1520',
  motion:'segment', ease:'smoothstep',
  note:'2 poses · straight tween · V1 smoothstep · 1400ms · hips back 5, down 15'
};

const R=[A,B,C];
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const IDX=[[1,3,4],[2,5,6],[1,2],[1,7,8],[2,9,10]];

function svgOf(v,pose,px){
  const p=[];for(let i=0;i<22;i+=2)p.push({x:pose[i],y:pose[i+1]});
  const ln=(ix,col,w,op)=>`<polyline points="${ix.map(i=>p[i].x+','+p[i].y).join(' ')}" `+
    `fill="none" stroke="${col}" stroke-width="${w}" stroke-opacity="${op}" `+
    `stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 100 100" width="${px}" height="${px}">`+
    `<line x1="4" y1="94" x2="96" y2="94" stroke="${v.gnd}" stroke-width="1"/>`+
    ln(IDX[0],v.backCol,v.back,v.backOp)+ln(IDX[1],v.backCol,v.back,v.backOp)+
    ln(IDX[2],v.frontCol,v.front,1)+ln(IDX[3],v.frontCol,v.front,1)+ln(IDX[4],v.frontCol,v.front,1)+
    `<circle cx="${p[0].x}" cy="${p[0].y}" r="${v.head}" fill="${v.frontCol}"/></svg>`;
}

let cols='',keys='';
for(const v of R){
  cols+=`<div class="col">
    <h3>${esc(v.name)}</h3>
    <div class="stage" data-v='${JSON.stringify({poses:v.poses,cycle:v.cycle,motion:v.motion,ease:v.ease})}'
         data-style='${JSON.stringify({head:v.head,front:v.front,back:v.back,backOp:v.backOp,frontCol:v.frontCol,backCol:v.backCol,gnd:v.gnd})}'></div>
    <p class="note">${esc(v.note)}</p>
    <ul class="spec">
      <li>head r ${v.head} · front ${v.front}px · rear ${v.back}px at ${Math.round(v.backOp*100)}%</li>
      <li>rear limb ${v.backCol===v.frontCol?'same hue, faded':'separate darker hue'}</li>
    </ul>
  </div>`;
  keys+=`<div class="krow"><h4>${esc(v.name)}</h4><div class="kf">`+
    v.poses.map((q,i)=>`<figure>${svgOf(v,q,96)}<figcaption>pose ${i+1}</figcaption></figure>`).join('')+
    `</div></div>`;
}

const html=`<meta charset="utf-8">
<title>Squat sandbox — V1 vs current vs prototype</title><style>
:root{--bg:#0b0d12;--card:#151922;--ink:#e8ecf5;--dim:#8a93a8;--line:#2a3140}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);padding:20px;
 font:14px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
h1{font-size:20px;margin:0 0 6px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);
 margin:32px 0 12px;border-bottom:1px solid var(--line);padding-bottom:6px}
h3{font-size:13px;margin:0 0 10px}
h4{font-size:11px;color:var(--dim);margin:0 0 8px;font-weight:600;
 text-transform:uppercase;letter-spacing:.08em}
p.lead{color:var(--dim);max-width:76ch;margin:0 0 14px}
.row{display:flex;gap:14px;flex-wrap:wrap}
.col{background:var(--card);border:1px solid var(--line);border-radius:10px;
 padding:14px;flex:1 1 250px;min-width:230px}
.stage{display:flex;align-items:flex-end;gap:14px;min-height:170px}
.note{font-size:11px;color:var(--dim);margin:10px 0 6px}
.spec{margin:0;padding-left:15px;font-size:10.5px;color:var(--dim)}
.spec li{margin:1px 0}
.card52{background:#0e1119;border-radius:4px;padding:0;line-height:0}
.big{background:#0e1119;border-radius:6px;line-height:0}
.cap{font-size:9px;color:var(--dim);text-transform:uppercase;letter-spacing:.07em;
 text-align:center;margin-top:5px;display:block}
.krow{margin-bottom:18px}
.kf{display:flex;gap:8px;flex-wrap:wrap}
.kf figure{margin:0;background:#0e1119;border-radius:6px;padding:4px}
.kf figcaption{font-size:9px;color:var(--dim);text-align:center;padding-top:2px}
.strip{display:flex;gap:10px;align-items:flex-end;background:var(--card);
 border:1px solid var(--line);border-radius:10px;padding:14px;flex-wrap:wrap}
.strip .u{text-align:center}
.panel{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;
 display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px 18px;margin-bottom:6px}
.panel label{font-size:11px;color:var(--dim);display:flex;align-items:center;gap:8px}
.panel input[type=range]{flex:1;min-width:80px}
.panel select{background:#0e1119;color:var(--ink);border:1px solid var(--line);
 border-radius:5px;padding:3px 6px;font:inherit;font-size:11px;flex:1}
.panel b{color:var(--ink);font-size:11px;min-width:44px;text-align:right}
.panel button{background:#0e1119;color:var(--ink);border:1px solid var(--line);
 border-radius:99px;padding:5px 12px;font:inherit;font-size:11px;cursor:pointer}
pre{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px;
 font:11px ui-monospace,Menlo,monospace;color:var(--dim);overflow-x:auto;margin:8px 0 0;min-height:20px}
</style>
<h1>Bodyweight squat — V1, current, and a prototype</h1>
<p class="lead">All three animating at once. The left figure in each pane is
<b>52&nbsp;px</b>, the exact size on a quest card; the right one is the same
animation enlarged so you can see what it is doing. Judge the 52&nbsp;px one —
that is the product.</p>

<h2>Tune the prototype</h2>
<p class="lead">C only. Change these until it looks right, then tell me the numbers
at the bottom and I will bake them in.</p>
<div class="panel">
  <label>rear limb opacity <input type="range" id="op" min="0" max="100" value="32"><b id="opv">32%</b></label>
  <label>front stroke <input type="range" id="fw" min="30" max="80" value="50"><b id="fwv">5.0</b></label>
  <label>rear stroke <input type="range" id="bw" min="20" max="70" value="40"><b id="bwv">4.0</b></label>
  <label>head radius <input type="range" id="hr" min="50" max="95" value="70"><b id="hrv">7.0</b></label>
  <label>cycle ms <input type="range" id="cy" min="800" max="2600" step="50" value="1400"><b id="cyv">1400</b></label>
  <label>squat depth <input type="range" id="dp" min="0" max="140" value="100"><b id="dpv">100%</b></label>
  <label>knee splay <input type="range" id="sp" min="0" max="200" value="100"><b id="spv">100%</b></label>
  <label>torso lean <input type="range" id="ln" min="0" max="400" value="100"><b id="lnv">100%</b></label>
  <label>rear hue <select id="hu"><option value="#9B7BFF">contrasting violet (V1)</option><option value="#FF3D7F">same hue as front</option><option value="#7A0A2C">current deep crimson</option></select></label>
  <label>path <select id="pa"><option value="segment">straight lines (V1)</option><option value="spline">curve through poses</option></select></label>
  <label>timing <select id="ea"><option value="smoothstep">V1 smoothstep</option><option value="smoother">longer hold at the ends</option></select></label>
  <label>ground line <select id="gl"><option value="on">show</option><option value="off">hide</option></select></label>
  <button id="dump">print my settings</button>
</div>
<pre id="out"></pre>

<h2>Animating, at card size</h2>
<div class="row">${cols}</div>

<h2>The same three, card size only, in a line</h2>
<p class="lead">Nothing else on screen. Cover the labels and ask which one is a squat.</p>
<div class="strip" id="line"></div>

<h2>Authored keyframes</h2>
<p class="lead">Every pose a person drew. Everything between them is the tween.</p>
${keys}

<script>
const IDX=${JSON.stringify(IDX)};
const smoothstep=k=>k*k*(3-2*k);
const smoother=k=>k*k*k*(k*(k*6-15)+10);

/* straight line between the two bracketing poses — what V1 and current both do */
function segPose(f,e){
  const seg=(f.length-1)*e, i=Math.min(f.length-2,Math.floor(seg)), u=seg-i;
  const A=f[i],B=f[i+1],o=[];
  for(let j=0;j<22;j++)o.push(A[j]+(B[j]-A[j])*u);
  return o;
}
/* a curve THROUGH the poses instead of straight lines between them, so the path
   has no corner where two segments meet. Catmull-Rom, ends duplicated. */
function splinePose(f,e){
  if(f.length<3)return segPose(f,e);
  const n=f.length, seg=(n-1)*e, i=Math.min(n-2,Math.floor(seg)), u=seg-i;
  const P=k=>f[Math.max(0,Math.min(n-1,k))];
  const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2),o=[];
  for(let j=0;j<22;j++){
    const a=p0[j],b=p1[j],c=p2[j],d=p3[j];
    o.push(0.5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u));
  }
  return o;
}
function build(host,st,px,cls){
  const w=document.createElement('div'); w.className=cls;
  w.innerHTML='<svg viewBox="0 0 100 100" width="'+px+'" height="'+px+'">'+
    '<line x1="4" y1="94" x2="96" y2="94" stroke="'+st.gnd+'" stroke-width="1"/>'+
    '<polyline class="b1"/><polyline class="b2"/>'+
    '<polyline class="f1"/><polyline class="f2"/><polyline class="f3"/>'+
    '<circle class="hd" r="'+st.head+'"/></svg>';
  const sv=w.querySelector('svg');
  sv.querySelectorAll('polyline').forEach(p=>{p.setAttribute('fill','none');
    p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round')});
  for(const s of ['.b1','.b2']){const p=sv.querySelector(s);
    p.setAttribute('stroke',st.backCol);p.setAttribute('stroke-width',st.back);
    p.setAttribute('stroke-opacity',st.backOp)}
  for(const s of ['.f1','.f2','.f3']){const p=sv.querySelector(s);
    p.setAttribute('stroke',st.frontCol);p.setAttribute('stroke-width',st.front)}
  sv.querySelector('.hd').setAttribute('fill',st.frontCol);
  host.appendChild(w);
  return {lines:sv.querySelectorAll('polyline'),hd:sv.querySelector('.hd')};
}
const rigs=[];
document.querySelectorAll('.stage').forEach(st=>{
  const v=JSON.parse(st.dataset.v), s=JSON.parse(st.dataset.style);
  const a=document.createElement('div'); a.innerHTML='';
  const wrapA=document.createElement('div'); wrapA.className='u';
  const wrapB=document.createElement('div'); wrapB.className='u';
  st.appendChild(wrapA); st.appendChild(wrapB);
  const r1=build(wrapA,s,52,'card52');
  wrapA.insertAdjacentHTML('beforeend','<span class="cap">52px · real</span>');
  const r2=build(wrapB,s,150,'big');
  wrapB.insertAdjacentHTML('beforeend','<span class="cap">enlarged</span>');
  rigs.push({v,r:r1},{v,r:r2});
});
/* the bare line-up */
const line=document.getElementById('line');
document.querySelectorAll('.stage').forEach((st,i)=>{
  const v=JSON.parse(st.dataset.v), s=JSON.parse(st.dataset.style);
  const u=document.createElement('div'); u.className='u'; line.appendChild(u);
  const r=build(u,s,52,'card52');
  u.insertAdjacentHTML('beforeend','<span class="cap">'+'ABC'[i]+'</span>');
  rigs.push({v,r});
});
/* C is index 2 in each group of three; collect its rigs so the panel can drive them */
const CR=rigs.filter((g,i)=>i===4||i===5||i===8);
const el=id=>document.getElementById(id);
const P={op:.38,fw:5,bw:4,hr:7,cy:1400,dp:1,sp:1,ln:1,hu:'#9B7BFF',pa:'segment',ea:'smoothstep',gl:'on'};
const BASE=JSON.parse(JSON.stringify(CR[0].v.poses));
/* rebuild C's poses from the sliders: depth scales the hip drop and everything
   that follows it, splay scales how far the knees travel apart, lean scales the
   shoulder offset. The standing pose is the anchor and never changes. */
function shape(){
  const s=BASE[0], out=[s.slice()];
  for(let n=1;n<BASE.length;n++){
    const q=BASE[n].slice();
    for(let j=0;j<22;j+=2){
      const dy=BASE[n][j+1]-s[j+1], dx=BASE[n][j]-s[j];
      const isKnee=(j===10||j===18), isUpper=(j===0||j===2);
      q[j+1]=s[j+1]+dy*P.dp;
      q[j]  =s[j]+dx*(isKnee?P.sp:isUpper?P.ln:1);
    }
    out.push(q);
  }
  return out;
}
function apply(){
  const poses=shape();
  for(const g of CR){
    g.v.poses=poses; g.v.cycle=P.cy; g.v.motion=P.pa; g.v.ease=P.ea;
    for(const s of ['.b1','.b2']){const p=g.r.lines[0].ownerSVGElement.querySelector(s);
      p.setAttribute('stroke-width',P.bw);p.setAttribute('stroke-opacity',P.op);
      p.setAttribute('stroke',P.hu)}
    for(const s of ['.f1','.f2','.f3']){const p=g.r.lines[0].ownerSVGElement.querySelector(s);
      p.setAttribute('stroke-width',P.fw)}
    g.r.hd.setAttribute('r',P.hr);
    const gl=g.r.lines[0].ownerSVGElement.querySelector('line');
    if(gl)gl.setAttribute('opacity',P.gl==='on'?1:0);
  }
}
const wire=(id,key,fn,fmt)=>{const e=el(id);if(!e)return;
  e.addEventListener('input',()=>{P[key]=fn(e.value);
    const b=el(id+'v'); if(b)b.textContent=fmt?fmt(e.value):e.value; apply()})};
wire('op','op',v=>v/100,v=>v+'%'); wire('fw','fw',v=>v/10,v=>(v/10).toFixed(1));
wire('bw','bw',v=>v/10,v=>(v/10).toFixed(1)); wire('hr','hr',v=>v/10,v=>(v/10).toFixed(1));
wire('cy','cy',v=>+v); wire('dp','dp',v=>v/100,v=>v+'%');
wire('sp','sp',v=>v/100,v=>v+'%'); wire('ln','ln',v=>v/100,v=>v+'%');
for(const id of ['hu','pa','ea','gl']){const e=el(id);
  if(e)e.addEventListener('change',()=>{P[id]=e.value;apply()})}
el('dump').addEventListener('click',()=>{
  const L=[];
  L.push('prototype settings');
  L.push('  rear opacity   '+Math.round(P.op*100)+'%');
  L.push('  rear hue       '+P.hu);
  L.push('  front stroke   '+P.fw);
  L.push('  rear stroke    '+P.bw);
  L.push('  head radius    '+P.hr);
  L.push('  cycle          '+P.cy+'ms');
  L.push('  depth          '+Math.round(P.dp*100)+'%');
  L.push('  knee splay     '+Math.round(P.sp*100)+'%');
  L.push('  torso lean     '+Math.round(P.ln*100)+'%');
  L.push('  path           '+P.pa);
  L.push('  timing         '+P.ea);
  L.push('  ground line    '+P.gl);
  L.push('');
  L.push('poses');
  for(const q of shape())L.push('  P('+q.map(n=>Math.round(n*10)/10).join(',')+')');
  el('out').textContent=L.join(String.fromCharCode(10));
});
apply();

(function loop(now){
  for(const g of rigs){
    const v=g.v;
    const t=(now/v.cycle)%2, k=t<1?t:2-t;
    const e=v.ease==='smoother'?smoother(k):smoothstep(k);
    const pose=v.motion==='spline'?splinePose(v.poses,e):segPose(v.poses,e);
    const p=[];for(let j=0;j<22;j+=2)p.push({x:pose[j],y:pose[j+1]});
    for(let q=0;q<5;q++)g.r.lines[q].setAttribute('points',
      IDX[q].map(z=>p[z].x.toFixed(2)+','+p[z].y.toFixed(2)).join(' '));
    g.r.hd.setAttribute('cx',p[0].x.toFixed(2));
    g.r.hd.setAttribute('cy',p[0].y.toFixed(2));
  }
  requestAnimationFrame(loop);
})(0);
</script>`;
fs.writeFileSync(process.argv[2],html,'utf8');
console.log('wrote '+process.argv[2]+'  ('+(Buffer.byteLength(html)/1024).toFixed(0)+'KB)');
