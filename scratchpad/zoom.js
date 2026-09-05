/* One figure, big, so detail is judgeable. node zoom.js out.html [class] [rank] */
const fs=require('fs');
const src=fs.readFileSync('index.html','utf8');
const js=src.slice(src.indexOf('<script>')+8,src.lastIndexOf('</script>'));
const stub='var window={},document={body:{appendChild(){},classList:{toggle(){},contains:()=>false}},getElementById:()=>({innerHTML:"",querySelectorAll:()=>[],querySelector:()=>null,getContext:()=>null}),documentElement:{style:{setProperty(){},removeProperty(){}}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,hidden:false,createElement:()=>({style:{},dataset:{},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],appendChild(){},addEventListener(){},remove(){}})};var localStorage={getItem:()=>null,setItem(){}};var matchMedia=()=>({matches:false});var requestAnimationFrame=()=>0;var addEventListener=()=>0,removeEventListener=()=>0;var setInterval=()=>0;var clearInterval=()=>0;var getComputedStyle=()=>({getPropertyValue:()=>"#FF3D7F"});var navigator={};var innerWidth=400,innerHeight=800;var confirm=()=>false;';
const M=new Function(stub+js.slice(0,js.indexOf('/* ---------------- boot'))+
  '\nreturn {S,heroSVG,CLASSES,CLSKEYS,RANKS,PALETTES,PALVARS,RANK_LV};')();
const cls=process.argv[3]||'bladebound', ranks=(process.argv[4]||'E,C,S').split(',');
const c=M.CLASSES[cls], p=M.PALETTES[c.pal];
const hex=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255].join(',')};
const vars=M.PALVARS.map(v=>'--'+v+':'+p[v]).join(';')+';--c1:'+hex(p.crimson)+';--m1:'+hex(p.magenta);
const grab=re=>{const m=src.match(re);return m?m[0]:''};
const figCSS=[/\.hero-svg\{[\s\S]*?\}/,/\.hero-svg\.lit\{[^}]*\}/].map(grab).join('\n');
let cells='';
for(const r of ranks){
  M.S.lvl=M.RANK_LV[r];M.S.streak=6;
  cells+=`<figure><div class="stage">${M.heroSVG({rank:r,weapon:c.w,lit:true})}</div>
    <figcaption>${cls} · rank ${r}</figcaption></figure>`;
}
fs.writeFileSync(process.argv[2],`<meta charset="utf-8"><title>zoom</title><style>
body{margin:0;background:#0b0d12;color:#e8ecf5;padding:16px;font:13px system-ui;${vars}}
.row{display:flex;gap:14px}
figure{margin:0;background:radial-gradient(70% 60% at 50% 42%,rgba(var(--m1),.12),transparent 72%),
 linear-gradient(180deg,#0A0509,#020102);border:1px solid #2a3140;border-radius:10px;padding:12px}
.stage{width:340px;height:420px;display:grid;place-items:center}
.hero-svg{height:400px!important}
figcaption{text-align:center;color:#8a93a8;font-size:11px;margin-top:8px}
${figCSS}</style><div class="row">${cells}</div>`,'utf8');
console.log('wrote '+process.argv[2]);
