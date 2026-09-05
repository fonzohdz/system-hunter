/* Second pass. The first one deliberately skipped any movement whose knee was
   travelling, because nudging the knee and foot by different amounts changes the
   knee angle and that rewrites the exercise.

   This moves the knee and the foot by the SAME amount, so the shin is carried
   across untouched and only the thigh swings a little. That is safe on
   movements where the legs are working, and it is still just moving a drawn
   limb sideways — no angles are computed from the pose.

   Listed by hand. Movements whose legs belong together — hollow hold, superman,
   a curtsy's crossed legs, a kneeling Nordic — are not here. */
const fs=require('fs');const L=require('./lib.js');const M=L.load('index.html');
const {P}=L;

/* upright / tilted: separate sideways */
const SIDE={
  bb_front:6, bb_clean:6, bb_ohp_push:6, kb_front_squat:6, db_thruster:5,
  sissy:5, tb_dl:5, mb_slam:5, burpee_s:5, rowerg:5, mch_hack:6, kneeraise:4,
  mch_legcurl:6, mch_legext:6, legpress:6, db_reardelt:5, db_kickback:5,
  ez_skull:5, db_pullover:5, bb_pendlay:5, bb_closegrip:5, db_fly:5,
};
/* prone / supine: nudge only the far leg up and back, which never reaches the floor */
const FAR={
  plank:[4,4], kneeplank:[4,4], bear:[4,4], diamond:[4,4], archer:[4,4],
  kneepush:[4,4], pushup:[3,3], burpee_f:[4,4], trx_fallout:[4,4],
  /* knees already folded up on these, so shift sideways only — dropping the
     far knee as well pinched it past what a knee does */
  db_floor:[2,0], db_bench:[3,0], bb_bench:[3,0],
  /* shoulders on the floor, feet planted: nudge the far foot back and barely up */
  bridge:[5,2], bb_thrust:[5,2], mch_hipthrust:[5,2], bb_hipthrust_bb:[5,2],
};
const J={fK:9,fF:10,bK:5,bF:6};

let s=fs.readFileSync('index.html','utf8');
const edits=[];let n=0;
for(const e of M.EX){
  if(!e.f)continue;
  const side=SIDE[e.id], far=FAR[e.id];
  if(!side&&!far)continue;
  const f=e.f.map(p=>p.slice());
  if(side){
    /* knee and foot together, so the shin survives exactly */
    const dir=Math.sign(f[0][J.fF*2]-f[0][J.bF*2])||1;
    for(const p of f){
      p[J.fF*2]+=side*dir; p[J.fK*2]+=side*dir;
      p[J.bF*2]-=side*dir; p[J.bK*2]-=side*dir;
    }
  } else {
    const [dx,dy]=far;
    for(const p of f){ p[J.bF*2]-=dx; p[J.bF*2+1]-=dy; p[J.bK*2]-=dx; p[J.bK*2+1]-=dy; }
  }
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
console.log('second pass: '+n+' movements');
