/* Ninety-eight movements draw their two legs on top of each other — two units
   apart, about one pixel on a card. Nobody drew two legs because in a standing
   curl the legs are scenery and nothing was asking.

   This does not compute anything from anatomy. It pushes the near limb one way
   and the far limb the other by an amount I choose per posture group, which is
   what an illustrator does with a pen. Each movement keeps its own leg posture —
   seated stays seated, staggered stays staggered, kneeling stays kneeling — it
   just becomes possible to see that there are two of them.

   The axis differs by posture because the limbs run in different directions:
   a standing figure's legs run down the screen, so they separate sideways; a
   prone figure's run across it, so they separate vertically. */
const fs=require('fs');const L=require('./lib.js');const M=L.load('index.html');
const {P}=L;
const survey=JSON.parse(fs.readFileSync('scratchpad/survey.json','utf8'));
const by={};for(const r of survey)by[r.id]=r;

/* legs that are the point of the movement, or deliberately together */
const LEG_SKIP=new Set(['jack','hollow','superman','march','climber','birddog',
  'deadbug','db_curtsy','db_singlerdl','slbridge','pistol','kb_windmill']);
/* two hands on one implement must stay together or the bar stretches */
const SHARED=new Set(['bar','bar2','kb2','band','plate','tbar','kb','kb1','bar1']);

/* how far apart, and along which axis, per posture */
const RULE={
  upright:  {axis:'x', foot:7, knee:5},
  tilt:     {axis:'x', foot:6, knee:4},
  horiz:    {axis:'y', foot:5, knee:4},
  inverted: {axis:'x', foot:6, knee:4},
};
const J={fK:9,fF:10,bK:5,bF:6,fE:7,fH:8,bE:3,bH:4};

let legN=0,handN=0;const edits=[];
let s=fs.readFileSync('index.html','utf8');

for(const e of M.EX){
  if(!e.f)continue;                       /* borrowers inherit from their source */
  const r=by[e.id]; if(!r)continue;
  const f=e.f.map(p=>p.slice());
  let touched=false;

  /* --- legs --- */
  /* only where the legs are scenery. If the knee is travelling more than a
     little, the legs ARE the movement and nudging them changes the exercise. */
  if(r.feet<9 && r.dk<25 && !LEG_SKIP.has(e.id)){
    const R=RULE[r.posture]||RULE.upright, k=R.axis==='x'?0:1;
    /* push them apart along whichever way they already lean, so a limb that is
       already the far one stays the far one. Spreading blindly in +y drove some
       prone legs together instead. */
    if(R.axis==='y'){
      /* Prone and supine figures already rest on the floor, so there is no room
         to push a limb down. Move only the FAR limb, up and back — the ordinary
         way of drawing something further from the camera, and it can never sink
         through the ground. */
      for(const p of f){
        p[J.bF*2]-=R.foot; p[J.bF*2+1]-=R.knee;
        p[J.bK*2]-=R.knee; p[J.bK*2+1]-=R.knee;
      }
    } else {
      const dir=Math.sign(f[0][J.fF*2]-f[0][J.bF*2])||1;
      for(const p of f){
        p[J.fF*2]+=R.foot*dir; p[J.fK*2]+=R.knee*dir;
        p[J.bF*2]-=R.foot*dir; p[J.bK*2]-=R.knee*dir;
      }
    }
    legN++; touched=true;
  }
  /* --- hands, only where they are not both on one implement --- */
  const prop=(e.p||'').split('+').pop();
  /* same for the arms: if the elbow is doing real work, leave it alone */
  if(r.hands<7 && r.de<25 && !SHARED.has(prop) && !LEG_SKIP.has(e.id)){
    const R=RULE[r.posture]||RULE.upright, k=R.axis==='x'?0:1;
    if(R.axis==='y'){
      for(const p of f){ p[J.bH*2]-=4; p[J.bH*2+1]-=3; p[J.bE*2]-=3; p[J.bE*2+1]-=3; }
    } else {
      const hd=Math.sign(f[0][J.fH*2]-f[0][J.bH*2])||1;
      for(const p of f){
        p[J.fH*2]+=4*hd; p[J.fE*2]+=3*hd;
        p[J.bH*2]-=4*hd; p[J.bE*2]-=3*hd;
      }
    }
    handN++; touched=true;
  }
  if(!touched)continue;

  const tag=`{id:'${e.id}',`, a=s.indexOf(tag);
  let j=a,d=0;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(!d)break}}
  const o=s.slice(a,j), fA=o.indexOf('f:[');
  if(fA<0){console.log('!! no f: on '+e.id);process.exit(1)}
  let kk=fA+2,dd=0;
  for(;kk<o.length;kk++){if(o[kk]==='[')dd++;else if(o[kk]===']'){dd--;if(!dd)break}}
  const body=f.map(p=>'P('+p.map(v=>Math.round(v*10)/10).join(',')+')').join(',\n    ');
  edits.push({from:a+fA,to:a+kk+1,text:'f:['+body+']'});
}
edits.sort((x,y)=>y.from-x.from);
for(let i=1;i<edits.length;i++)
  if(edits[i].to>edits[i-1].from){console.log('!! edits overlap');process.exit(1)}
for(const ed of edits)s=s.slice(0,ed.from)+ed.text+s.slice(ed.to);
fs.writeFileSync('index.html',s);
console.log('legs separated on '+legN+' movements, hands on '+handN+
  ' — '+edits.length+' movements rewritten');
