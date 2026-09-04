/* Earlier re-authoring left some movements with two f: arrays. JavaScript keeps
   the last one, so the app was always correct — but the first was dead weight and
   any tool that searched for "f:[" found the wrong array. Drop the dead ones. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const M=require('./lib.js').load(F);
const edits=[];
for(const e of M.EX){
  const tag=`{id:'${e.id}',`, a=s.indexOf(tag);
  let j=a,d=0;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(!d)break}}
  const o=s.slice(a,j);
  /* every f:[ ... ] in this object, with its bounds */
  const spans=[];
  for(let i=0;;){
    const at=o.indexOf('f:[',i); if(at<0)break;
    /* skip a match inside a word such as "ref:[" */
    if(at>0&&/[A-Za-z0-9_]/.test(o[at-1])){i=at+3;continue}
    let k=at+2,dd=0;
    for(;k<o.length;k++){if(o[k]==='[')dd++;else if(o[k]===']'){dd--;if(!dd)break}}
    spans.push([at,k+1]); i=k+1;
  }
  if(spans.length<2)continue;
  /* keep the last (the one JS actually uses); delete the earlier ones, taking
     any comment and comma that introduced them */
  for(let n=0;n<spans.length-1;n++){
    let [from,to]=spans[n];
    /* swallow a preceding comment line and the comma before it */
    let p=from;
    while(p>0&&/\s/.test(o[p-1]))p--;
    if(o.slice(0,p).endsWith('*/')){
      const c=o.lastIndexOf('/*',p);
      if(c>=0){p=c;while(p>0&&/\s/.test(o[p-1]))p--;}
    }
    /* and the comma that follows it, so the object stays well formed */
    let q=to; while(q<o.length&&/\s/.test(o[q]))q++;
    if(o[q]===',')q++;
    edits.push({from:a+p,to:a+q,id:e.id});
  }
}
edits.sort((x,y)=>y.from-x.from);
for(const ed of edits)s=s.slice(0,ed.from)+s.slice(ed.to);
fs.writeFileSync(F,s);
console.log('removed '+edits.length+' dead f: arrays from '+
  new Set(edits.map(e=>e.id)).size+' movements');
if(edits.length)console.log('  '+[...new Set(edits.map(e=>e.id))].join(' '));
