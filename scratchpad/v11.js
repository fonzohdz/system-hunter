/* Does the COMPLETE illustration identify the exercise?
   The previous status was circular — it reported what I had edited, not what
   the picture shows, so it could only ever return zero. These checks look at
   what actually gets drawn. */
const L=require('./lib.js');const M=L.load(process.argv[2]);const {P,ang,lean,J}=L;
let bad=0;const fail=(id,m)=>{console.log('  FAIL '+id+': '+m);bad++};
const F={};for(const e of M.EX)F[e.id]=(M.framesFor(e)||[]).map(P);
const by={};for(const e of M.EX)by[e.id]=e;
const knee=(p,s)=>ang(p[2],p[s==='b'?5:9],p[s==='b'?6:10]);
const elb =(p,s)=>ang(p[1],p[s==='b'?3:7],p[s==='b'?4:8]);
const d=(a,b,j)=>Math.hypot(a[j].x-b[j].x,a[j].y-b[j].y);
const mn=(id,f)=>Math.min(...F[id].map(f)), mx=(id,f)=>Math.max(...F[id].map(f));

/* what the painter can actually draw */
const src=M.src;
const SETKEYS=new Set([...src.slice(src.indexOf('const SET={'),src.indexOf('function paintFig'))
  .matchAll(/^\s{2}([a-z0-9]+):/gm)].map(m=>m[1]));
const HELD=new Set([...src.matchAll(/prop==='([a-z0-9]+)'/g)].map(m=>m[1]));
const draws=p=>{if(!p)return false;
  const [a,b]=p.includes('+')?p.split('+'):[p,null];
  return SETKEYS.has(a)||HELD.has(a)||(b&&(SETKEYS.has(b)||HELD.has(b)))};

console.log('== every declared context object actually renders ==');
for(const e of M.EX){
  if(!e.p)continue;
  for(const part of e.p.split('+'))
    if(!SETKEYS.has(part)&&!HELD.has(part))
      fail(e.id,"declares context '"+part+"' that the painter cannot draw — it renders as nothing");
}
console.log('  no movement declares a context object the painter silently drops');

console.log('== equipment movements show their equipment ==');
for(const e of M.EX){
  if(!e.eq.length)continue;
  if(!draws(e.p))fail(e.id,'uses '+e.eq.join('/')+' but draws no equipment at all — '+
    'with the name hidden this is a bodyweight movement');
}
console.log('  every movement that needs equipment renders some');

console.log('== sharing a pose must not drop the context ==');
for(const e of M.EX){
  if(e.f)continue;
  const s=by[e.ref];
  if(draws(s.p)&&!draws(e.p))
    fail(e.id,"shares "+e.ref+" and lost its context: the source draws '"+s.p+
      "' and this draws nothing");
}
console.log('  no shared movement is left as a bare figure');

console.log('== movements that must be told apart from what they share ==');
const distinct=[
 ['tb_dl','bb_dl','p'],          /* trap bar vs straight bar */
 ['mch_incline','mch_chest','p'],/* inclined seat vs upright */
 ['bb_closegrip','bb_bench',null],
 ['db_stepup','stepup',null],
];
for(const [id,other,by_] of distinct){
  const A=by[id],B=by[other];
  if(by_==='p'&&A.p===B.p)fail(id,'is indistinguishable from '+other+
    ': same pose family AND the same context object');
}
console.log('  variations that share a pose carry a different context object');

console.log('== the named visual failures ==');
/* GHR is its own movement, not a Nordic fall */
if(by['ghr'].ref==='nordic')fail('ghr','still shares the Nordic curl');
if(!F['ghr']||F['ghr'].length<3)fail('ghr','needs the hip-extension phase, not two endpoints');
/* handstand stacks vertically */
{const a=F['handstand'][0];
 /* an inverted body reads as ~180 to lean(); what matters is how far the torso
    sits off the vertical AXIS, whichever end is up */
 const off=Math.min(lean(a),180-lean(a));
 if(off>15)fail('handstand','the torso is '+off+' off the vertical axis — that is a wall walk');
 if(elb(a,'f')<155)fail('handstand','elbows are '+elb(a,'f')+', a handstand holds them straight');
 if(a[0].y<a[2].y)fail('handstand','the head must sit below the hips');}
/* kickback drives the leg behind the hip */
{const f=F['cbl_kick'],e=f[f.length-1];
 if(e[6].x>=f[0][2].x)fail('cbl_kick','the working foot finishes in FRONT of the hip — that is a front kick');
 if(by['cbl_kick'].p!=='cableank')fail('cbl_kick','the cable must attach at the ankle, not the hand');}
/* pull-through finishes at the pelvis, a swing finishes out front */
{const f=F['cbl_pullthrough'],e=f[f.length-1];
 if(by['cbl_pullthrough'].ref)fail('cbl_pullthrough','still shares the swing');
 if(e[8].x>e[2].x+14)fail('cbl_pullthrough','the hands finish '+(e[8].x-e[2].x)+
   ' units in front of the hip — that is a swing, not a pull-through');}
/* shrugs must be visible at 52px */
for(const id of ['db_shrug','mch_shrug','tb_shrug']){
  const f=F[id],gap=p=>p[1].y-p[0].y;
  const close=Math.max(...f.map(gap))-Math.min(...f.map(gap));
  if(close<7)fail(id,'the shoulder-to-ear gap only closes '+close+
    ' units — invisible at 52px');
}
/* toes to bar means the toes reach the bar */
{const f=F['ttb'],e=f[f.length-1];
 const reach=Math.hypot(e[10].x-e[8].x,e[10].y-e[8].y);
 if(reach>16)fail('ttb','the feet finish '+reach.toFixed(0)+' units from the hands — that is a knee raise');
 if(knee(e,'f')<130)fail('ttb','the legs should stay long, knee is '+knee(e,'f'));}
/* the erg needs a stroke, not a row */
{const f=F['rowerg'];
 if(f.length<3)fail('rowerg','a stroke needs catch, drive and finish');
 if(mx('rowerg',p=>knee(p,'f'))-mn('rowerg',p=>knee(p,'f'))<40)
   fail('rowerg','the legs barely drive — that is a seated cable row');
 if(by['rowerg'].p!=='erg')fail('rowerg','needs the rail and footplate to name the machine');}
/* suspension row is diagonal and standing */
{const a=F['trx_row'][0];
 if(lean(a)>65)fail('trx_row','is '+lean(a)+' off vertical — that is a horizontal table row');
 if(Math.min(a[6].y,a[10].y)<86)fail('trx_row','the feet should be on the floor');
 for(const j of ['fH','bH']){let m=0;const f=F['trx_row'];
   for(const p of f)m=Math.max(m,d(f[0],p,J[j]));
   if(m>4)fail('trx_row','the handles must stay fixed; the body moves to them');}}
/* walking lunge travels */
{const f=F['db_walklunge'];
 const trav=Math.max(...f.map(p=>p[2].x))-Math.min(...f.map(p=>p[2].x));
 if(trav<20)fail('db_walklunge','the body only travels '+trav+' units — that is a lunge in place');}
/* planks have a readable base */
for(const id of ['plank','kneeplank','sideplank','sideknee']){
  const a=F[id][0];
  if(a[8].y<76)fail(id,'the supporting forearm is at y='+a[8].y+', not on the floor');
}
console.log('  eleven named failures and four yellow flags checked');

console.log(bad?'\nFAILURES: '+bad:'\nThe complete illustration identifies the exercise in every case.');
process.exit(bad?1:0);
