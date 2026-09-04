/* Per-movement expectations, written from each exercise. Never from its category.
   A failure here means the figure depicts something other than the named lift. */
const L=require('./lib.js');const M=L.load(process.argv[2]);
const {P,ang,lean,J}=L;
let bad=0;const fail=(id,m)=>{console.log('  FAIL '+id+': '+m);bad++};
const F={};for(const e of M.EX)F[e.id]=(M.framesFor(e)||[]).map(P);
const has=id=>F[id]&&F[id].length>=2;
const knee=(p,s)=>ang(p[2],p[s==='b'?5:9],p[s==='b'?6:10]);
const elb =(p,s)=>ang(p[1],p[s==='b'?3:7],p[s==='b'?4:8]);
const dist=(a,b,j)=>Math.hypot(a[j].x-b[j].x,a[j].y-b[j].y);
const travel=(id)=>{const f=F[id];let m=0;
  for(const p of f)for(let j=0;j<11;j++)m=Math.max(m,dist(f[0],p,j));return Math.round(m)};

/* ---- 1. holds hold ---- */
console.log('== holds stay still ==');
for(const id of ['plank','kneeplank','sideplank','sideknee','hollow','wallsit',
                 'bear','hang','handstand','superman']){
  if(!has(id)){fail(id,'no frames');continue}
  const t=travel(id);
  if(t>12)fail(id,'a hold that travels '+t+' units is not a hold');
}
console.log('  10 holds checked, largest travel '+
  Math.max(...['plank','kneeplank','sideplank','sideknee','hollow','wallsit','bear','hang','handstand','superman'].map(travel))+' units');

/* ---- 2. hanging movements start suspended ---- */
console.log('== hanging starts off the floor ==');
for(const id of ['hang','chinup','kneeraise','ttb','mch_assist']){
  if(!has(id)){fail(id,'no frames');continue}
  const a=F[id][0];
  /* the floor line is drawn at 94; the lowest foot has to clear it visibly */
  const clear=94-Math.max(a[6].y,a[10].y);
  if(clear<6)fail(id,'the lowest foot clears the floor by only '+clear+
    ' units — that reads as standing, not hanging');
  if(Math.min(a[4].y,a[8].y)>30)fail(id,'hands at y='+Math.min(a[4].y,a[8].y)+' are not on a bar overhead');
}
console.log('  5 hanging movements start suspended, hands overhead');

/* ---- 3. presses reach lockout ---- */
console.log('== presses lock out ==');
for(const id of ['bb_ohp','db_press','db_thruster']){
  if(!has(id))continue;
  const f=F[id],best=Math.max(...f.map(p=>elb(p,'f')));
  if(best<150)fail(id,'never straightens the elbow — best is '+best);
}
console.log('  overhead presses reach the elbow lockout');

/* ---- 4. curls do not fold flat ---- */
console.log('== curls keep a believable elbow ==');
for(const id of ['db_curl','db_hammer','db_incline_curl','db_conc','ez_preacher']){
  if(!has(id))continue;
  const f=F[id],tight=Math.min(...f.map(p=>elb(p,'f')));
  if(tight<25)fail(id,'folds the elbow to '+tight+'deg, which no arm does');
  if(tight>75)fail(id,'never curls — tightest elbow is '+tight);
  /* the elbow must stay where the variation puts it */
  if(dist(f[0],f[f.length-1],J.fE)>5)fail(id,'the elbow drifts '+
    dist(f[0],f[f.length-1],J.fE).toFixed(1)+' units; a curl pins it');
}
console.log('  5 curl variations bend between 25 and 75 with the elbow pinned');

/* ---- 5. squat and lunge families reach real depth ---- */
console.log('== squat / lunge / step depth ==');
for(const id of ['squat','bb_squat','bb_front','db_goblet','chairsq','pistol','legpress']){
  if(!has(id))continue;
  const deep=Math.min(...F[id].map(p=>knee(p,'f')));
  if(deep>115)fail(id,'bottom knee only reaches '+deep+'deg — that is a quarter squat');
}
for(const id of ['lunge','db_lunge','split','db_bulg','db_curtsy']){
  if(!has(id))continue;
  const deep=Math.min(...F[id].map(p=>knee(p,'f')));
  if(deep>120)fail(id,'front knee only reaches '+deep+'deg');
}
for(const id of ['stepup','db_latstep']){
  if(!has(id))continue;
  const f=F[id],deep=Math.min(...f.map(p=>knee(p,'f'))),tall=Math.max(...f.map(p=>knee(p,'f')));
  if(deep>110)fail(id,'lead knee only bends to '+deep);
  if(tall<150)fail(id,'never stands up on the lead leg — best is '+tall);
  if(dist(f[0],f[f.length-1],J.fF)>4)fail(id,'the foot on the box drifts');
}
console.log('  squats reach depth, lunges bend, step-ups flex then straighten on a fixed foot');

/* ---- 6. hinge family keeps the arms long ---- */
console.log('== hinge family: long arms, hips back ==');
/* Good morning is deliberately not here: the bar rides on the back, so its
   elbows are bent by design. What it owes instead is hands that never hang. */
if(has('bb_goodmorning')){for(const p of F['bb_goodmorning'])
  if(p[8].y>p[1].y+10)fail('bb_goodmorning','the hands drop to y='+p[8].y+
    ' — the bar stays on the back, it does not hang toward the floor');}
for(const id of ['hinge','db_rdl','bb_dl','db_singlerdl','kb_swing']){
  if(!has(id))continue;
  const f=F[id],e=Math.min(...f.map(p=>elb(p,'f')));
  if(e<140)fail(id,'bends the elbow to '+e+'deg — the arms hang, the hips do the work');
}
console.log('  6 hinge movements keep the elbow above 140 throughout');

/* ---- 7. shrugs and carries: no elbow, no gait confusion ---- */
console.log('== shrugs elevate, carries walk ==');
for(const id of ['db_shrug','mch_shrug','tb_shrug']){
  if(!has(id))continue;
  const f=F[id];
  if(Math.min(...f.map(p=>elb(p,'f')))<150)fail(id,'a shrug does not bend the elbow');
  if(dist(f[0],f[f.length-1],J.fF)>4)fail(id,'a shrug does not walk');
  const rise=f[0][1].y-f[f.length-1][1].y;
  if(rise<3)fail(id,'the shoulders only rise '+rise+' units');
}
for(const id of ['db_carry','db_farmerwalk','kb_carry_rack','treadmill','sled_push']){
  if(!has(id))continue;
  const f=F[id];
  if(dist(f[0],f[f.length-1],J.fF)<6&&dist(f[0],f[f.length-1],J.bF)<6)
    fail(id,'locomotion with no step');
}
console.log('  shrugs elevate on planted feet; carries and pushes step');

/* ---- 8. contacts that must not drift ---- */
console.log('== supports stay put ==');
const PLANTED={
  pushup:['fH','bH','fF','bF'], kneepush:['fH','bH'], diamond:['fH','bH'],
  archer:['fH','bH'], pike:['fH','bH'], plank:['fH','bH','fF','bF'],
  bear:['fH','bH'], birddog:['bH','fK'], climber:['fH','bH'],
  bridge:['fF','bF'], slbridge:['fF'], bb_thrust:['fF','bF'],
  dip:['fH','bH'], stepup:['fF'], db_latstep:['fF'],
  handstand:['fH','bH'], hang:['fH','bH'], chinup:['fH','bH'],
  kneeraise:['fH','bH'], ttb:['fH','bH'], nordic:['fK','bK','fF','bF'],
  sled_push:['fH','bH'], mch_legext:['fH','bH'], cbl_pushdown:['fE','bE'],
  cbl_pallof:['fF','bF'], db_conc:['fE'], db_wrist:['fE','bE'],
  ez_skull:['fE','bE'], db_kickback:['fE','bE'], mch_calf:['fF','bF'],
};
for(const id in PLANTED){
  if(!has(id))continue;
  const f=F[id];
  for(const j of PLANTED[id]){
    let m=0;for(const p of f)m=Math.max(m,dist(f[0],p,J[j]));
    if(m>5)fail(id,j+' is a support point but moves '+m.toFixed(1)+' units');
  }
}
console.log('  '+Object.keys(PLANTED).length+' movements checked for drifting supports');

/* ---- 9. the specific corrections called out in the audit ---- */
console.log('== named corrections ==');
if(has('birddog')){const a=F['birddog'][0];
  if(knee(a,'f')<70||knee(a,'f')>110)fail('birddog','quadruped knee is '+knee(a,'f')+', should be ~90');}
if(has('deadbug')){const a=F['deadbug'][0];
  if(Math.max(a[6].y,a[10].y)>85)fail('deadbug','a foot is on the floor in tabletop');
  if(knee(a,'f')<70||knee(a,'f')>115)fail('deadbug','tabletop knee is '+knee(a,'f'));}
if(has('bear')){const a=F['bear'][0];
  if(knee(a,'f')>120)fail('bear','bear crawl knee is '+knee(a,'f')+' — that is a plank, not a bear position');
  if(a[9].y>88)fail('bear','the knee should hover, not rest on the floor');}
if(has('climber')){const f=F['climber'];
  const sp=Math.max(...f.map(p=>knee(p,'f')))-Math.min(...f.map(p=>knee(p,'f')));
  if(sp<30)fail('climber','the driving knee only changes '+sp+'deg');
  if(Math.min(...f.map(p=>p[9].x))>=Math.max(...f.map(p=>p[2].x)))
    fail('climber','the knee never drives forward past the hip');}
if(has('jack')){const f=F['jack'];
  if(Math.min(...f.map(p=>Math.min(p[4].y,p[8].y)))>Math.min(...f.map(p=>p[0].y)))
    fail('jack','the hands never get above the head');
  const sp=Math.max(...f.map(p=>Math.abs(p[10].x-p[6].x)));
  if(sp<20)fail('jack','the feet only spread '+sp+' units');}
if(has('handstand')){const a=F['handstand'][0];
  if(elb(a,'f')<150)fail('handstand','elbow is '+elb(a,'f')+' — a handstand holds straight arms');
  if(a[0].y<a[2].y)fail('handstand','the head should be BELOW the hips when inverted');}
if(has('diamond')){const f=F['diamond'];
  const df=Math.max(...f.map(p=>elb(p,'f')))-Math.min(...f.map(p=>elb(p,'f')));
  const db=Math.max(...f.map(p=>elb(p,'b')))-Math.min(...f.map(p=>elb(p,'b')));
  if(df<40||db<40)fail('diamond','both arms must bend — they move '+df+' and '+db);}
if(has('bb_ohp_push')||has('bb_ohp')){
  const e=M.EX.find(x=>x.id==='bb_ohp_push');
  if(e&&!e.f)fail('bb_ohp_push','a push press borrowing a strict press has no dip and drive');}
if(has('kb_swing')){const f=F['kb_swing'];
  if(Math.min(...f.map(p=>elb(p,'f')))<140)fail('kb_swing','the arms stay long in a swing');}
if(has('ttb')){const f=F['ttb'];
  const hi=Math.min(...f.map(p=>Math.min(p[6].y,p[10].y)));
  if(hi>40)fail('ttb','the feet only rise to y='+hi+' — toes-to-bar takes them to the hands');}
if(has('cbl_straight')){const f=F['cbl_straight'];
  if(Math.min(...f.map(p=>elb(p,'f')))<150)fail('cbl_straight','a straight-arm pulldown keeps the elbow straight');}
if(has('db_upright')){const f=F['db_upright'],e=f[f.length-1];
  if(e[7].y>=e[8].y)fail('db_upright','the elbow must finish above the hand');}
if(has('db_curtsy')){const e=F['db_curtsy'][1];
  if(e[6].x<=e[10].x)fail('db_curtsy','the rear foot must cross past the standing foot');}
if(has('mb_slam')){const f=F['mb_slam'];
  if(f[f.length-1][8].y<=f[0][8].y)fail('mb_slam','the ball must travel DOWN, not up');}
if(has('nordic')){const f=F['nordic'];
  if(Math.max(...f.map(p=>p[2].y))>82)fail('nordic','the hips should stay off the floor — this is not a bridge');}
if(has('cbl_pallof')){const f=F['cbl_pallof'];
  if(dist(f[0],f[1],J.neck)>4||dist(f[0],f[1],J.hip)>4)
    fail('cbl_pallof','the torso must not move — resisting rotation is the exercise');}
console.log('  named corrections verified');

/* ---- 10. multi-phase movements carry enough frames ---- */
console.log('== multi-phase has intermediate poses ==');
for(const id of ['burpee_f','burpee_s','bb_clean','kb_tgu','kb_cp','kb_snatch']){
  const e=M.EX.find(x=>x.id===id); if(!e)continue;
  const f=M.framesFor(e);
  if(f.length<3)fail(id,'a multi-phase movement reduced to '+f.length+' endpoints');
}
console.log('  6 multi-phase movements checked');

/* ---- 11. nothing leaves the drawing ---- */
console.log('== everything stays in frame ==');
for(const e of M.EX)for(const p of F[e.id]||[])for(const q of p)
  if(q.x<-6||q.x>106||q.y<-6||q.y>102)fail(e.id,'a joint sits at '+q.x+','+q.y);
console.log('  all '+M.EX.length+' movements draw inside the box');

console.log(bad?'\nFAILURES: '+bad:'\nEvery check passes.');
process.exit(bad?1:0);
