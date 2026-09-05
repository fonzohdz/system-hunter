/* Third pass: the hands, and the bridge family's feet.

   Hands get the same treatment as legs, with two exceptions that are not
   oversights. A diamond push-up's hands belong together — that is the whole
   exercise. So do the hands on a Pallof press, a woodchop and a hollow hold,
   which grip one handle or hold one shape. Those are left alone.

   Every offset here is a number I picked for that movement, not a formula. */
const fs=require('fs');const L=require('./lib.js');const M=L.load('index.html');

/* hands separated sideways (upright / tilted figures) */
const HAND_X={
  march:4, chinup:4, mch_assist:4, cable_row:4, rowerg:4, mch_chest:4,
  mch_incline:4, mch_row:4, mch_hack:4, legpress:4,
  dip:4, dip_assist:4, dip_weight:4, trx_row:4, slbridge:3,
};
/* Symmetric two-arm work — curls, extensions, flyes. Here the arms ARE the
   movement, so nothing may change the elbow angle. Translate the whole far arm
   sideways instead: elbow and hand by the same amount, so the forearm is
   carried across untouched and only the shoulder line shifts. */
const ARM_FAR={
  db_incline_curl:5, ez_preacher:5, ez_skull:5, db_kickback:5,
  db_pullover:5, db_fly:5,
};
/* prone / supine: nudge the far hand up and back only */
const HAND_FAR={
  wallpush:[3,2], incpush:[2,2], kneeplank:[3,3], kneepush:[4,3], plank:[3,3],
  bear:[3,3], pike:[4,3], row_table:[4,3], db_floor:[4,0], db_bench:[4,0],
  trx_fallout:[4,3],
};
/* the bridge family still had its feet stacked after pass two */
/* bridge and hip thrust are authored fresh in bridgefix instead — nudging
   could not rescue a seven-unit thigh */
const FEET_FAR={};

const J={fE:7,fH:8,bE:3,bH:4,fK:9,fF:10,bK:5,bF:6};
let s=fs.readFileSync('index.html','utf8');
const edits=[];let n=0;
for(const e of M.EX){
  if(!e.f)continue;
  const hx=HAND_X[e.id], hf=HAND_FAR[e.id], ff=FEET_FAR[e.id], af=ARM_FAR[e.id];
  if(hx===undefined&&!hf&&!ff&&af===undefined)continue;
  const f=e.f.map(p=>p.slice());
  if(hx!==undefined){
    const d=Math.sign(f[0][J.fH*2]-f[0][J.bH*2])||1;
    for(const p of f){
      p[J.fH*2]+=hx*d; p[J.fE*2]+=hx*0.7*d;
      p[J.bH*2]-=hx*d; p[J.bE*2]-=hx*0.7*d;
    }
  }
  if(hf){const [dx,dy]=hf;
    for(const p of f){ p[J.bH*2]-=dx; p[J.bH*2+1]-=dy; p[J.bE*2]-=dx; p[J.bE*2+1]-=dy; }}
  if(af!==undefined){
    const d=Math.sign(f[0][J.fH*2]-f[0][J.bH*2])||1;
    for(const p of f){ p[J.bH*2]-=af*d; p[J.bE*2]-=af*d; }
  }
  if(ff){const [dx,dy]=ff;
    for(const p of f){ p[J.bF*2]-=dx; p[J.bF*2+1]-=dy; p[J.bK*2]-=dx; p[J.bK*2+1]-=dy;   /* knee with the foot, so the shin survives */ }}

  const tag=`{id:'${e.id}',`, a=s.indexOf(tag);
  let j=a,d=0;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(!d)break}}
  const o=s.slice(a,j), fA=o.indexOf('f:[');
  let kk=fA+2,dd=0;
  for(;kk<o.length;kk++){if(o[kk]==='[')dd++;else if(o[kk]===']'){dd--;if(!dd)break}}
  const body=f.map(p=>'P('+p.map(v=>Math.round(v*10)/10).join(',')+')').join(',\n    ');
  edits.push({from:a+fA,to:a+kk+1,text:'f:['+body+']'});
  n++;
}
edits.sort((x,y)=>y.from-x.from);
for(let i=1;i<edits.length;i++)
  if(edits[i].to>edits[i-1].from){console.log('!! overlap');process.exit(1)}
for(const ed of edits)s=s.slice(0,ed.from)+ed.text+s.slice(ed.to);
fs.writeFileSync('index.html',s);
console.log('third pass: '+n+' movements');
