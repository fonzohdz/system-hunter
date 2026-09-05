/* Patch 3 — show the lifts back, and make the app installable.

   Records has three manual PR boxes and a heatmap, but the app has been
   silently accumulating S.perf on every movement and never showing it anywhere
   except one line inside a session. Every tracker review says the same thing:
   exercise history is non-negotiable, and people want to see that today beat
   last time. The data is already there.

   Also adds a web app manifest. It is built at runtime and attached as a data
   URI so the project stays one file — no manifest.json, no build step. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

/* ---- a Lifts block in Records ---- */
sub(`  <section class="block">
    <div class="blockhead"><h2>Log</h2><span class="tally">\${days} active day\${days===1?'':'s'}</span></div>
    \${heatmap()}
  </section>`,
`  \${liftsBlock()}
  <section class="block">
    <div class="blockhead"><h2>Log</h2><span class="tally">\${days} active day\${days===1?'':'s'}</span></div>
    \${heatmap()}
  </section>`,
  'Records gains a Lifts block');

sub(`function heatmap(){`,
`/* Everything logged, newest movement first. Direction compares the most recent
   entry with the one before it on the same movement — weight first, because on
   a loaded lift more weight at fewer reps is still progress and the reverse
   reading would be wrong. */
function liftsBlock(){
  const ids=Object.keys(S.perf).filter(id=>(S.perf[id]||[]).length);
  if(!ids.length)return \`<section class="block">
    <div class="blockhead"><h2>Lifts</h2></div>
    <p class="note">Nothing logged yet. Numbers you enter during a quest show up here,
    with what you did last time next to them.</p></section>\`;
  const rows=ids.map(id=>{
    const e=EX.find(x=>x.id===id); if(!e)return null;
    const a=S.perf[id], last=a[a.length-1], prev=a.length>1?a[a.length-2]:null;
    let dir=0;
    if(prev){ dir = last.l!==prev.l ? Math.sign(last.l-prev.l) : Math.sign(last.r-prev.r) }
    return {e,a,last,prev,dir};
  }).filter(Boolean);
  rows.sort((x,y)=>y.a.length-x.a.length||x.e.n.localeCompare(y.e.n));
  return \`<section class="block">
    <div class="blockhead"><h2>Lifts</h2><span class="tally">\${rows.length} tracked</span></div>
    \${rows.map(r=>\`<div class="lift">
      <div class="liftn"><h4>\${esc(r.e.n)}</h4>
        <p>Target now <b>\${esc(scaledDose(r.e))}</b></p></div>
      <div class="liftv">
        <b class="\${r.dir>0?'up':r.dir<0?'dn':''}">\${fmtPerf(r.last,r.e)}\${
          r.dir>0?' ▲':r.dir<0?' ▼':''}</b>
        <span>\${r.prev?'was '+fmtPerf(r.prev,r.e):'first time'}</span>
      </div></div>\`).join('')}
    <p class="note">The last five results per movement are kept. Two sessions at target
    steps it up\${'\\u2009'}— on anything you can load, that means weight, not more reps.</p>
  </section>\`;
}
function heatmap(){`,
  'liftsBlock built from S.perf');

sub(`.heat{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:12px}`,
`.lift{display:flex;justify-content:space-between;align-items:center;gap:12px;
  padding:11px 0;border-bottom:1px solid var(--line)}
.lift:last-of-type{border-bottom:0}
.liftn h4{margin:0;font-size:13px}
.liftn p{margin:3px 0 0;font-size:11px;color:var(--ash2)}
.liftv{text-align:right;flex:0 0 auto}
.liftv b{display:block;font-family:var(--display);font-size:16px;color:var(--bone)}
.liftv b.up{color:#4ADE80}
.liftv b.dn{color:var(--ash)}
.liftv span{display:block;font-size:10px;color:var(--ash2);margin-top:2px}
.heat{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:12px}`,
  'styles for the lift rows');

/* ---- installable ---- */
sub(`<meta name="apple-mobile-web-app-capable" content="yes">`,
`<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">`,
  'the non-Apple equivalent of the standalone flag');

sub(`<div id="root"><div class="boot">Awakening</div></div>`,
`<div id="root"><div class="boot">Awakening</div></div>
<script>
/* Web app manifest, built here and attached as a data URI so the project stays
   a single file. This is what lets Android offer "install" and what gives the
   installed app its name, colours and icon. It does NOT make the app work
   offline — that needs a service worker, which must be a separate file. */
(function(){try{
  var icon='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" '+
    'viewBox="0 0 512 512"><rect width="512" height="512" fill="#08070b"/>'+
    '<path d="M256 92 L300 300 L256 420 L212 300 Z" fill="#E8114F"/>'+
    '<circle cx="256" cy="300" r="120" fill="none" stroke="#E8114F" '+
    'stroke-width="10" opacity=".45"/></svg>');
  var m={name:'Ascendant',short_name:'Ascendant',
    description:'Daily quests, ranks and records. A training log with a System attached.',
    display:'standalone',orientation:'portrait',
    background_color:'#08070b',theme_color:'#08070b',
    icons:[{src:icon,sizes:'512x512',type:'image/svg+xml',purpose:'any maskable'}]};
  var l=document.createElement('link');
  l.rel='manifest';
  l.href='data:application/manifest+json;charset=utf-8,'+encodeURIComponent(JSON.stringify(m));
  document.head.appendChild(l);
}catch(e){}})();
<\/script>`,
  'web app manifest attached at runtime, no second file');

fs.writeFileSync('index.html',t);
console.log('patch 3 applied');
