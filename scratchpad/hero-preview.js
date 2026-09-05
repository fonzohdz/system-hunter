/* Preview page: the hunter at every rank, for every class, with the real
   palettes and the real idle animation. */
const fs=require('fs');
const src=fs.readFileSync('index.html','utf8');
const js=src.slice(src.indexOf('<script>')+8,src.lastIndexOf('</script>'));
const stub='var window={},document={body:{appendChild(){},classList:{toggle(){},contains:()=>false}},getElementById:()=>({innerHTML:"",querySelectorAll:()=>[],querySelector:()=>null,getContext:()=>null}),documentElement:{style:{setProperty(){},removeProperty(){}}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,hidden:false,createElement:()=>({style:{},dataset:{},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],appendChild(){},addEventListener(){},remove(){}})};var localStorage={getItem:()=>null,setItem(){}};var matchMedia=()=>({matches:false});var requestAnimationFrame=()=>0;var addEventListener=()=>0,removeEventListener=()=>0;var setInterval=()=>0;var clearInterval=()=>0;var getComputedStyle=()=>({getPropertyValue:()=>"#FF3D7F"});var navigator={};var innerWidth=400,innerHeight=800;var confirm=()=>false;';
const M=new Function(stub+js.slice(0,js.indexOf('/* ---------------- boot'))+
  '\nreturn {S,heroSVG,bladeSVG,GEARTIER,GEARNAME,CLASSES,CLSKEYS,RANKS,RANK_LV,RANK_TITLE,PALETTES,PALVARS,WEAPONNAME};')();

/* the palette custom properties, straight out of the app */
const palCSS=(k)=>{
  const p=M.PALETTES[k]; if(!p)return '';
  const hex=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255].join(',')};
  return M.PALVARS.map(v=>'--'+v+':'+p[v]).join(';')+
    ';--c1:'+hex(p.crimson)+';--m1:'+hex(p.magenta);
};
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* the figure and animation CSS, lifted from the app so this matches exactly */
const grab=(re)=>{const m=src.match(re);return m?m[0]:''};
const figCSS=[
  grab(/\.hero-svg\{[\s\S]*?\}/), grab(/\.hero-svg\.lit\{[^}]*\}/),
  grab(/\.hf-idle\{[^}]*\}/), grab(/\.hf-breathe\{[^}]*\}/),
  grab(/\.hf-head\{[^}]*\}/), grab(/\.hf-cape\{[^}]*\}/),
  grab(/@keyframes hfIdle\{[^}]*\}/), grab(/@keyframes hfBreathe\{[^}]*\}/),
  grab(/@keyframes hfHead\{[\s\S]*?\n\s*[^}]*\}/), grab(/@keyframes hfCape\{[\s\S]*?\n\s*[^}]*\}/),
].join('\n');

let rows='';
const ONLY=(process.argv[3]||"").split(",").filter(Boolean);
for(const ck of (ONLY.length?ONLY:M.CLSKEYS)){
  const c=M.CLASSES[ck];
  rows+=`<h2>${esc(c.n)} <span>${esc(M.WEAPONNAME[c.w])} · ${esc(c.pal)} palette</span></h2>
  <div class="row" style="${palCSS(c.pal)}">`;
  for(const r of M.RANKS){
    M.S.lvl=M.RANK_LV[r]; M.S.streak=5; M.S.weapon=c.w; M.S.cls=ck;
    rows+=`<figure><div class="stage">${M.heroSVG({rank:r,weapon:c.w,lit:true})}</div>
      <figcaption><b>${r}</b> ${esc(M.RANK_TITLE[r])}<br>
      <i>${esc(M.GEARNAME[M.GEARTIER[r]])}</i><br>
      <span>level ${M.RANK_LV[r]}</span></figcaption></figure>`;
  }
  rows+='</div>';
}

const html=`<meta charset="utf-8">
<title>Ascendant — the hunter</title><style>
:root{--bg:#0b0d12;--card:#151922;--ink:#e8ecf5;--dim:#8a93a8;--line:#2a3140;
  --core:#FFF0F5;--magenta:#FF3D7F;--crimson:#E8114F;--deepblade:#7A0A2C;
  --guard:#4A1020;--grip:#2A0A14;--pommel:#5C1226;--gold:#E8C583;--ash:#8a93a8;
  --c1:232,17,79;--m1:255,61,127}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);padding:20px;
  font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
h1{font-size:20px;margin:0 0 6px}
h2{font-size:13px;margin:28px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}
h2 span{font-weight:400;color:var(--dim);font-size:11px;margin-left:8px}
p.lead{color:var(--dim);max-width:74ch;margin:0 0 6px}
.row{display:flex;gap:10px;flex-wrap:wrap}
figure{margin:0;background:radial-gradient(70% 60% at 50% 42%,rgba(var(--m1),.10),transparent 72%),
  linear-gradient(180deg,#0A0509,#020102);
  border:1px solid var(--line);border-radius:10px;padding:10px 6px 8px;text-align:center;
  flex:1 1 150px;min-width:140px}
.stage{height:250px;display:grid;place-items:center}
figcaption{font-size:10px;color:var(--dim);line-height:1.5;margin-top:6px}
figcaption b{color:var(--ink);font-size:12px}
figcaption i{color:var(--magenta);font-style:normal}
figcaption span{color:var(--dim);opacity:.7}
${figCSS}
</style>
<h1>The hunter</h1>
<p class="lead">One character, drawn once at 250&nbsp;px — not 155 of them at 52. Every
rank adds a layer of armour over the last; the weapon is the existing art dropped
into the fist with a transform, so all six class weapons work unchanged. Breathing,
head turn, cape sway and the weight shift are CSS, so reduced-motion switches them
all off.</p>
${rows}`;
fs.writeFileSync(process.argv[2],html,'utf8');
console.log('wrote '+process.argv[2]+'  ('+(Buffer.byteLength(html)/1024).toFixed(0)+'KB)');
