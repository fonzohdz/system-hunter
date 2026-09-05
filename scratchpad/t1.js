/* Test the progression and the migration against the real source, by pulling
   the actual function bodies out of index.html rather than retyping them. */
const src=require('fs').readFileSync('index.html','utf8');
const grab=(sig)=>{const i=src.indexOf(sig);if(i<0)throw new Error('not found: '+sig);
  let d=0,j=src.indexOf('{',i);for(let k=j;k<src.length;k++){
    if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)return src.slice(i,k+1)}}};
const code=[
  grab('function progStep(e){'), grab('function doseParts(e){'),
  grab('function scaledDose(e){'), grab('function targetReps(e){'),
  grab('function recordPerf(e,actual,load){'), grab('function lastLoad(e){'),
  'const PROGCAP=6;const loaded=e=>!!(e&&e.eq&&e.eq.length);const repCap=e=>loaded(e)?3:PROGCAP;',
  'const isTimed=e=>{const p=doseParts(e);return !!(p&&p.time)};'
].join('\n');
const toasts=[];
const F=new Function('S','toast',code+';return{progStep,scaledDose,targetReps,recordPerf,lastLoad}');

/* --- a loaded movement: reps climb 8,10,12,14 then the weight goes up --- */
let S={lvl:1,prog:{},perf:{},unit:'lb'};
let A=F(S,m=>toasts.push(m));
const db={id:'db_press',n:'DB Press',d:'3 × 8',eq:['db']};
console.log('loaded movement, hitting the target every set:');
for(let i=0;i<10;i++){
  const t=A.targetReps(db);
  A.recordPerf(db,t,25);
  console.log('  set '+(i+1)+': target was '+t+'  -> now '+A.scaledDose(db));
}
console.log('  toasts: '+JSON.stringify(toasts));
console.log('  last load remembered: '+A.lastLoad(db));
console.log('  perf capped at 5 entries: '+S.perf.db_press.length);

/* --- a bodyweight movement keeps climbing to the cap --- */
toasts.length=0; S={lvl:1,prog:{},perf:{},unit:'lb'}; A=F(S,m=>toasts.push(m));
const bw={id:'pushup',n:'Push-Up',d:'3 × 8',eq:[]};
let seen=[];
for(let i=0;i<20;i++){const t=A.targetReps(bw);seen.push(t);A.recordPerf(bw,t,0)}
console.log('bodyweight target path: '+[...new Set(seen)].join(' -> '));
console.log('  never resets: '+(seen[seen.length-1]===Math.max(...seen)));

/* --- missing the target breaks the streak of hits --- */
S={lvl:1,prog:{},perf:{},unit:'lb'}; A=F(S,()=>{});
A.recordPerf(bw,8,0); A.recordPerf(bw,5,0); A.recordPerf(bw,8,0);
console.log('one miss between two hits does not step: '+(A.targetReps(bw)===8));
