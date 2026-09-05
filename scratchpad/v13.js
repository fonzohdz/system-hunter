/* Static instruction validation.
   With no interpolation there are no generated frames to police — only the
   authored poses a user is actually shown. Every one of them has to stand on its
   own, because each is now a still someone reads rather than a moment they pass
   through. Also writes the manifest. */
const fs=require('fs');
const L=require('./lib.js');const M=L.load(process.argv[2]);const {P,ang,J}=L;
let bad=0,review=[];
const fail=(id,m)=>{console.log('  FAIL '+id+': '+m);bad++};
const flag=(id,m)=>{review.push([id,m])};

const src=M.src;
const grab=(re)=>{const m=src.match(re);return m?m[1]:''};
const HOLDPOSE=new Set(grab(/const HOLDPOSE=new Set\(\('([^']*)'\+\s*'([^']*)'\)/)
  ? (src.match(/const HOLDPOSE=new Set\(\('([^']*)'\+\s*'([^']*)'\)/).slice(1,3).join(''))
    .split(' ').filter(Boolean) : []);
const CARDAT=(()=>{const b=src.slice(src.indexOf('const CARDAT={'),src.indexOf('function cardPose'));
  const o={};for(const m of b.matchAll(/([a-z0-9_]+):(\d+)/g))o[m[1]]=+m[2];return o})();
const cardPose=e=>{const f=M.framesFor(e);
  if(HOLDPOSE.has(e.id))return 0;
  return CARDAT[e.id]===undefined?f.length-1:Math.min(CARDAT[e.id],f.length-1)};

const SETK=new Set([...src.slice(src.indexOf('const SET={'),src.indexOf('function paintFig'))
  .matchAll(/^\s{2}([a-z0-9]+):/gm)].map(m=>m[1]));
const HELD=new Set([...src.matchAll(/prop==='([a-z0-9]+)'/g)].map(m=>m[1]));
const draws=p=>!!p&&p.split('+').some(q=>SETK.has(q)||HELD.has(q));

const BONES=[[1,3,'back upper arm'],[3,4,'back forearm'],[1,7,'front upper arm'],
  [7,8,'front forearm'],[1,2,'torso'],[2,5,'back thigh'],[5,6,'back shin'],
  [2,9,'front thigh'],[9,10,'front shin']];
const knee=(p,s)=>ang(p[2],p[s?5:9],p[s?6:10]);
const elb =(p,s)=>ang(p[1],p[s?3:7],p[s?4:8]);
/* which side the joint bulges relative to the straight line above-to-below it */
const bulge=(a,b,c)=>Math.sign((c.x-a.x)*(b.y-a.y)-(c.y-a.y)*(b.x-a.x));

console.log('== every displayed pose is anatomically possible ==');
for(const e of M.EX){
  const f=(M.framesFor(e)||[]).map(P);
  if(!f.length){fail(e.id,'no poses at all');continue}
  f.forEach((p,i)=>{
    for(const [a,b,name] of BONES){
      const len=Math.hypot(p[a].x-p[b].x,p[a].y-p[b].y);
      if(len<4)fail(e.id,'frame '+i+': the '+name+' is '+len.toFixed(1)+' units — a joint has collapsed');
    }
    for(const s of [0,1]){
      const k=knee(p,s), el=elb(p,s);
      if(k<40)fail(e.id,'frame '+i+': knee folded to '+k+' degrees, past what a knee does');
      if(el<12)fail(e.id,'frame '+i+': elbow folded to '+el+' degrees, past what an elbow does');
    }
    for(const q of p)if(q.x<-6||q.x>106||q.y<-6||q.y>98)
      fail(e.id,'frame '+i+': a joint sits at '+q.x+','+q.y+', outside the drawing');
    /* nothing below the floor line */
    const low=Math.max(...p.map(q=>q.y));
    if(low>96)fail(e.id,'frame '+i+': a joint is '+(low-94).toFixed(0)+' units below the floor');
  });
  /* a joint must not flip to the other side of its limb between phases: that
     reads as the knee or elbow bending the wrong way */
  if(f.length>1)for(const [prox,mid,dist,name] of
      [[2,9,10,'front knee'],[2,5,6,'back knee'],[1,7,8,'front elbow'],[1,3,4,'back elbow']]){
    const sides=f.map(p=>{
      const straight=ang(p[prox],p[mid],p[dist]);
      return straight>150?0:bulge(p[prox],p[dist],p[mid]);   /* straight = no side */
    }).filter(Boolean);
    if(sides.length>1&&new Set(sides).size>1)
      flag(e.id,'the '+name+' bends one way in one phase and the other way in another');
  }
}
console.log('  '+M.EX.length+' movements, '+
  M.EX.reduce((a,e)=>a+(M.framesFor(e)||[]).length,0)+' displayed poses checked');

console.log('== every movement has a card still and a usable sequence ==');
for(const e of M.EX){
  const f=M.framesFor(e); if(!f)continue;
  const c=cardPose(e);
  if(!(c>=0&&c<f.length))fail(e.id,'card pose index '+c+' is out of range');
  if(HOLDPOSE.has(e.id)){
    if(f.length<1)fail(e.id,'a hold needs at least one pose');
  } else if(f.length<2)fail(e.id,'needs at least a start and an end');
  if(e.eq.length&&!draws(e.p))fail(e.id,'uses '+e.eq.join('/')+' but draws no equipment');
  if(e.p)for(const part of e.p.split('+'))
    if(!SETK.has(part)&&!HELD.has(part))fail(e.id,"context '"+part+"' draws nothing");
}
console.log('  card index in range, sequence non-empty, context resolves');

console.log('== holds show one pose, not three of the same ==');
for(const id of HOLDPOSE){
  const e=M.EX.find(x=>x.id===id); if(!e)continue;
  const f=(M.framesFor(e)||[]).map(P);
  if(f.length<2)continue;
  let mx=0;for(const p of f)for(let j=0;j<11;j++)
    mx=Math.max(mx,Math.hypot(p[j].x-f[0][j].x,p[j].y-f[0][j].y));
  if(mx>12)fail(id,'a hold whose poses differ by '+mx.toFixed(0)+' units is not a hold');
}
console.log('  '+HOLDPOSE.size+' holds display a single instructional position');

/* ---------- the manifest ---------- */
const RIG={db_wrist:'no wrist joint in the eleven-point figure'};
const rows=M.EX.map(e=>{
  const f=M.framesFor(e)||[];
  const hold=HOLDPOSE.has(e.id);
  const shown=hold?[0]:f.map((_,i)=>i);
  const cls=RIG[e.id]?'RIG LIMITED'
    :review.some(r=>r[0]===e.id)?'NEEDS STATIC REVIEW':'STATIC VERIFIED';
  return {id:e.id,name:e.n,card:cardPose(e),frames:shown,phases:shown.length,
          context:e.p||'none',shared:e.f?null:e.ref,class:cls,
          note:RIG[e.id]||(review.find(r=>r[0]===e.id)||[])[1]||''};
});
fs.writeFileSync(process.argv[3]||'scratchpad/manifest.json',JSON.stringify(rows,null,1));
const tally={};for(const r of rows)tally[r.class]=(tally[r.class]||0)+1;
console.log('\n== manifest ==');
for(const k of ['STATIC VERIFIED','NEEDS STATIC REVIEW','RIG LIMITED'])
  console.log('  '+k.padEnd(20)+(tally[k]||0));
if(review.length){console.log('\n  flagged for static review:');
  for(const [id,m] of review)console.log('    '+id.padEnd(16)+m)}
console.log(bad?'\nFAILURES: '+bad:'\nEvery displayed pose stands on its own.');
process.exit(bad?1:0);
