/* The 38 original poses not yet re-authored, each against its own exercise. */
const L=require('./lib.js');const M=L.load(process.argv[2]);const {P,ang,lean,J}=L;
let bad=0;const fail=(id,m)=>{console.log('  FAIL '+id+': '+m);bad++};
const F={};for(const e of M.EX)F[e.id]=(M.framesFor(e)||[]).map(P);
const knee=(p,s)=>ang(p[2],p[s==='b'?5:9],p[s==='b'?6:10]);
const elb =(p,s)=>ang(p[1],p[s==='b'?3:7],p[s==='b'?4:8]);
const d=(a,b,j)=>Math.hypot(a[j].x-b[j].x,a[j].y-b[j].y);
const fix=(id,j,tol,what)=>{const f=F[id];let m=0;
  for(const p of f)m=Math.max(m,d(f[0],p,J[j]));
  if(m>tol)fail(id,(what||j)+' should stay put but moves '+m.toFixed(1))};
const rng=(id,fn,lo,hi,what)=>{const v=Math.round(fn);
  if(v<lo||v>hi)fail(id,what+' is '+v+', expected '+lo+'-'+hi)};
const mn=(id,f)=>Math.min(...F[id].map(f)), mx=(id,f)=>Math.max(...F[id].map(f));

/* pressing against a fixed surface: hands stay, elbows do the work, body rigid */
for(const [id,lo,hi] of [['wallpush',50,110],['incpush',50,110],['kneepush',55,110]]){
  fix(id,'fH',4,'planted hand'); fix(id,'bH',4,'planted hand');
  rng(id,mn(id,p=>elb(p,'f')),lo,hi,'bottom elbow');
  rng(id,mx(id,p=>elb(p,'f')),150,180,'top elbow');
}
fix('kneepush','fK',5,'planted knee');
console.log('  wall / incline / knee push-ups: hands fixed, elbows 55-110 to straight');

/* squat pattern */
for(const id of ['chairsq','db_goblet','bb_squat','bb_front']){
  rng(id,mn(id,p=>knee(p,'f')),60,115,'bottom knee');
  fix(id,'fF',5,'planted foot');
}
rng('bb_front',mx('bb_front',p=>lean(p)),0,28,'front squat torso should stay upright');
rng('bb_squat',mx('bb_squat',p=>lean(p)),18,55,'back squat torso lean');
console.log('  four squat variations reach depth on planted feet');

/* holds */
for(const id of ['wallsit','plank','kneeplank','sideplank','sideknee','hollow','superman']){
  let m=0;const f=F[id];
  for(const p of f)for(let j=0;j<11;j++)m=Math.max(m,d(f[0],p,j));
  if(m>12)fail(id,'a hold that travels '+m.toFixed(0)+' units');
}
rng('wallsit',mn('wallsit',p=>knee(p,'f')),70,110,'wall sit knee should sit at a right angle');
rng('plank',mn('plank',p=>knee(p,'f')),150,180,'plank legs stay straight');
fix('plank','fH',4,'forearm'); fix('plank','fF',4,'toes');
console.log('  seven holds hold, with the right shape underneath');

/* hip extension off the floor */
for(const id of ['bridge','bb_thrust']){
  fix(id,'fF',5,'planted foot');
  if(mn(id,p=>p[2].y)>=mx(id,p=>p[2].y)-6)fail(id,'the hips barely rise');
  rng(id,mx(id,p=>knee(p,'f')),60,140,'the knee stays bent throughout');
}
if(mx('bridge',p=>p[1].y)-mn('bridge',p=>p[1].y)>6)
  fail('bridge','the shoulders should stay on the floor');
console.log('  bridge and hip thrust: shoulders anchored, feet planted, hips travel');

/* the ones defined by a joint that must NOT move */
rng('calf',mx('calf',p=>Math.abs(knee(p,'f')-knee(F['calf'][0],'f'))),0,14,
  'a calf raise barely changes the knee');
if(mn('calf',p=>p[2].y)>=mx('calf',p=>p[2].y)-4)fail('calf','the body never rises');
rng('band_pull',mx('band_pull',p=>Math.abs(elb(p,'f')-elb(F['band_pull'][0],'f'))),0,25,
  'a pull-apart barely changes the elbow');
if(mx('band_pull',p=>Math.abs(p[8].x-p[4].x))-mn('band_pull',p=>Math.abs(p[8].x-p[4].x))<20)
  fail('band_pull','the hands never spread apart');
console.log('  calf raise moves the heel not the knee; pull-apart moves the shoulder not the elbow');

/* rows and pulls: the elbow travels backward and the torso holds still */
for(const id of ['bb_row','band_row','band_face','row_table','cable_row','db_row']){
  const f=F[id],sp=mx(id,p=>elb(p,'f'))-mn(id,p=>elb(p,'f'));
  if(sp<35)fail(id,'the elbow only changes '+sp+' degrees — that is not a pull');
}
for(const id of ['bb_row','band_row','cable_row'])fix(id,'hip',6,'torso');
console.log('  six pulls bend the elbow through a real range on a still torso');

/* overhead and lateral */
rng('db_tri',mx('db_tri',p=>elb(p,'f')),150,180,'overhead extension must reach straight');
rng('db_tri',mn('db_tri',p=>elb(p,'f')),25,80,'overhead extension bottom');
fix('db_tri','fE',6,'the elbow stays overhead');
rng('db_lat',mx('db_lat',p=>elb(p,'f')),140,180,'a lateral raise keeps long arms');
if(mn('db_lat',p=>p[8].y)>F['db_lat'][0][1].y+6)fail('db_lat','the hands never reach shoulder height');
rng('lat_pull',mn('lat_pull',p=>elb(p,'f')),40,110,'lat pulldown bottom elbow');
if(F['lat_pull'][0][8].y>F['lat_pull'][0][1].y)fail('lat_pull','a pulldown starts with the hands overhead');
console.log('  extension straightens, lateral raise stays long, pulldown starts overhead');

/* lying pressing */
for(const id of ['db_bench','bb_bench','db_floor']){
  rng(id,mn(id,p=>elb(p,'f')),55,110,'bottom elbow');
  rng(id,mx(id,p=>elb(p,'f')),150,180,'lockout elbow');
  rng(id,lean(F[id][0]),60,120,'should be lying down');
}
rng('db_fly',mn('db_fly',p=>elb(p,'f')),140,180,'a fly keeps the elbows long');
rng('db_fly',lean(F['db_fly'][0]),60,120,'a fly is done lying down');
console.log('  three presses lock out, the fly stays long, all four lie down');

/* hinge and carry */
rng('db_rdl',mn('db_rdl',p=>elb(p,'f')),145,180,'RDL arms hang straight');
rng('db_rdl',mx('db_rdl',p=>knee(p,'f'))-mn('db_rdl',p=>knee(p,'f')),0,30,
  'an RDL softens the knee, it does not squat');
rng('db_rdl',mx('db_rdl',p=>lean(p)),55,95,'the RDL torso should reach near parallel');
rng('db_carry',mn('db_carry',p=>elb(p,'f')),150,180,'a carry hangs the arms straight');
for(const id of ['db_carry','march','treadmill'])
  if(d(F[id][0],F[id][F[id].length-1],J.fF)<6&&d(F[id][0],F[id][F[id].length-1],J.bF)<6)
    fail(id,'locomotion with no step');
if(mn('march',p=>knee(p,'f'))>110)fail('march','the marching knee never drives up');
console.log('  RDL hinges with long arms; carry, march and treadmill all step');

/* the remaining odds */
/* y grows downward, so hips above the head means head.y is the LARGER 
   number. The first version of this check had the sign backwards. */
rng('pike',mn('pike',p=>p[0].y-p[2].y),10,90,'a pike push-up puts the hips above the head');
fix('pike','fH',5,'planted hand');
if(mn('kb_halo',p=>p[8].y)>F['kb_halo'][0][0].y)fail('kb_halo','the halo never gets above the head');
rng('rowerg',mx('rowerg',p=>elb(p,'f'))-mn('rowerg',p=>elb(p,'f')),35,180,'the rowing stroke');
rng('sideplank',mn('sideplank',p=>knee(p,'f')),150,180,'a side plank keeps the legs straight');
console.log('  pike, halo, erg and side plank checked');

console.log(bad?'\nFAILURES: '+bad:'\nAll 38 remaining originals check out.');
process.exit(bad?1:0);
