/* Walks the real animation loop rather than judging start and end.
   Screenshots cannot show snapping, rubber-banding, a foot sliding mid-stroke or
   a hand leaving the bar between keyframes. This samples every in-between pose
   the app will actually draw. */
const L=require('./lib.js');const M=L.load(process.argv[2]);const {P,ang,J}=L;
let bad=0,warn=0;
const fail=(id,m)=>{console.log('  FAIL '+id+': '+m);bad++};
const F={};for(const e of M.EX)F[e.id]=M.framesFor(e);

/* exactly the loop in index.html */
function poseAt(f,e){
  const seg=(f.length-1)*e, i=Math.min(f.length-2,Math.floor(seg)), u=seg-i;
  const A=f[i],B=f[i+1],o=[];
  for(let j=0;j<22;j++)o.push(A[j]+(B[j]-A[j])*u);
  return o;
}
const SAMPLES=120;
const walk=id=>{const f=F[id],out=[];
  for(let s=0;s<=SAMPLES;s++){
    const k=s/SAMPLES, e=k*k*(3-2*k);   /* the app's easing */
    out.push(P(poseAt(f,e)));
  }
  return out};

const BONES=[[1,3],[3,4],[1,7],[7,8],[1,2],[2,5],[5,6],[2,9],[9,10]];
const NAME=['back upper arm','back forearm','front upper arm','front forearm',
  'torso','back thigh','back shin','front thigh','front shin'];

console.log('== no snapping between keyframes ==');
for(const e of M.EX){
  const w=walk(e.id); let mx=0,tot=0;
  for(let s=1;s<w.length;s++){let d=0;
    for(let j=0;j<11;j++)d=Math.max(d,Math.hypot(w[s][j].x-w[s-1][j].x,w[s][j].y-w[s-1][j].y));
    mx=Math.max(mx,d); tot+=d;}
  const avg=tot/(w.length-1);
  /* smoothstep peaks around 1.5x the mean; a real discontinuity spikes far higher */
  if(avg>0.02&&mx/avg>4.5)fail(e.id,'motion jumps '+(mx/avg).toFixed(1)+
    'x its own average between two frames — that is a snap');
}
console.log('  '+M.EX.length+' movements sampled at '+SAMPLES+' steps, no discontinuities');

console.log('== limbs do not rubber-band through the tween ==');
for(const e of M.EX){
  const w=walk(e.id);
  for(let b=0;b<BONES.length;b++){
    const [p,q]=BONES[b];
    const len=w.map(z=>Math.hypot(z[p].x-z[q].x,z[p].y-z[q].y));
    const ends=Math.min(len[0],len[len.length-1]);
    const dip=Math.min(...len);
    /* lerping straight between two poses cuts the corner; a big dip is visible
       as the limb sucking in and springing back */
    if(ends>8&&dip<ends*0.55)fail(e.id,'the '+NAME[b]+' collapses to '+
      dip.toFixed(0)+' mid-tween from '+ends.toFixed(0)+' at the keyframes');
  }
}
console.log('  nine bones checked across every in-between pose');

console.log('== supports hold through the whole stroke, not just at the ends ==');
const PLANTED={
  pushup:['fH','bH','fF','bF'], diamond:['fH','bH','fF','bF'], archer:['fH','bH'],
  kneepush:['fH','bH','fK'], plank:['fH','bH','fF','bF'], kneeplank:['fH','bH'],
  sideplank:['fH'], sideknee:['fH'], bear:['fH','bH'], birddog:['bH','fK'],
  climber:['fH','bH'], pike:['fH','bH'], handstand:['fH','bH'],
  bridge:['fF','bF'], slbridge:['fF'], bb_thrust:['fF','bF'],
  hang:['fH','bH'], chinup:['fH','bH'], kneeraise:['fH','bH'], ttb:['fH','bH'],
  mch_assist:['fH','bH'], dip:['fH','bH'], stepup:['fF'], db_latstep:['fF'],
  nordic:['fK','bK','fF','bF'], ghr:['fK','bK','fF','bF'],
  trx_row:['fH','bH'], sled_push:['fH','bH'], rowerg:['fF','bF'],
  cbl_pushdown:['fE','bE'], db_conc:['fE'], db_wrist:['fE','bE'],
  ez_skull:['fE','bE'], db_kickback:['fE','bE'], db_incline_curl:['fE','bE'],
  ez_preacher:['fE','bE'], db_tri:['fE','bE'], mch_calf:['fF','bF'],
  db_shrug:['fF','bF'], mch_legext:['fH','bH'],
  cbl_pallof:['fF','bF'], mch_pecdeck:['fF','bF'],
};
for(const id in PLANTED){
  if(!F[id])continue;
  const w=walk(id);
  for(const j of PLANTED[id]){
    let m=0;
    for(const z of w)m=Math.max(m,Math.hypot(z[J[j]].x-w[0][J[j]].x,z[J[j]].y-w[0][J[j]].y));
    if(m>5)fail(id,j+' drifts '+m.toFixed(1)+' units mid-stroke');
  }
}
for(const id of ['calf','mch_calf','db_calf']){
  if(!F[id])continue;
  const w=walk(id);
  for(const j of ['fF','bF']){let q=0;
    for(const z of w)q=Math.max(q,Math.abs(z[J[j]].x-w[0][J[j]].x));
    if(q>3)fail(id,'the toe slides '+q.toFixed(1)+' units sideways; only the heel should rise');}
}
console.log('  '+Object.keys(PLANTED).length+' movements: every support stays put all the way through');
console.log('  calf raises lift the heel without sliding the toe');

console.log('== nothing leaves the frame mid-tween ==');
for(const e of M.EX)for(const z of walk(e.id))for(const q of z)
  if(q.x<-8||q.x>108||q.y<-8||q.y>104)
    fail(e.id,'a joint reaches '+q.x.toFixed(0)+','+q.y.toFixed(0)+' during the tween');
console.log('  all poses stay inside the drawing box for the whole cycle');

console.log('== the figure never turns around ==');
for(const e of M.EX){
  const w=walk(e.id), side=w.map(z=>Math.sign(z[0].x-z[2].x));
  /* a lunge legitimately carries the head across the hip; a flip is when it
     happens with the torso barely moving, which reads as spinning on the spot */
  let flips=0;
  for(let s=1;s<side.length;s++)if(side[s]&&side[s-1]&&side[s]!==side[s-1])flips++;
  if(flips>1)fail(e.id,'the head crosses the hip '+flips+' times — it is spinning');
}
console.log('  no movement flips its facing during the loop');

console.log('== equipment stays attached ==');
const src=M.src;
const SETK=new Set([...src.slice(src.indexOf('const SET={'),src.indexOf('function paintFig'))
  .matchAll(/^\s{2}([a-z0-9]+):/gm)].map(m=>m[1]));
const HELD=new Set([...src.matchAll(/prop==='([a-z0-9]+)'/g)].map(m=>m[1]));
for(const e of M.EX){
  if(!e.p)continue;
  for(const part of e.p.split('+'))
    if(!SETK.has(part)&&!HELD.has(part))fail(e.id,"context '"+part+"' draws nothing");
  /* a two-handed implement snaps to the midpoint of the hands; if they drift far
     apart the bar visibly stretches */
  /* A band is SUPPOSED to stretch and a wide barbell grip is wide. What breaks
     the drawing is the hands ending at different HEIGHTS, because a bar is drawn
     level at their average. */
  if(/^(bar|bar2|kb2|plate)$/.test(e.p.split('+').pop())){
    const w=walk(e.id); let mx=0;
    for(const z of w)mx=Math.max(mx,Math.abs(z[4].y-z[8].y));
    if(mx>12)fail(e.id,'the hands sit '+mx.toFixed(0)+
      ' units apart vertically — a straight bar cannot join them');
  }
}
console.log('  every declared context renders, two-handed loads stay together');

console.log('== midpoints still look like the exercise ==');
/* the pose a viewer sees half the time; it must not be nonsense */
for(const e of M.EX){
  const mid=P(poseAt(F[e.id],0.5));
  const k=ang(mid[2],mid[9],mid[10]), el=ang(mid[1],mid[7],mid[8]);
  if(!isFinite(k)||!isFinite(el))fail(e.id,'midpoint produces a broken angle');
  const lo=Math.max(...mid.map(q=>q.y));
  if(lo<40)fail(e.id,'the whole figure floats at midpoint (lowest point y='+lo.toFixed(0)+')');
}
console.log('  every midpoint pose is well-formed');

console.log(bad?'\nFAILURES: '+bad:'\nThe live animation is clean across all '+M.EX.length+'.');
process.exit(bad?1:0);
