/* The arc frames were inserted purely so a straight-line tween would not cut the
   corner of a swinging limb. With no tween in the product they are noise, and
   worse: the instruction sequence must show authored positions, not computed
   in-betweens. This peels them back off.

   A generated frame is exactly the angular midpoint of the pair it was made
   from, so removing the deepest ones first and repeating recovers the authored
   keyframes. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const M=require('./lib.js').load(F);

const PARENT={0:1, 1:2, 3:1, 4:3, 7:1, 8:7, 5:2, 6:5, 9:2, 10:9};
const ORDER=[1,0,3,4,7,8,5,6,9,10];
const at=(p,i)=>({x:p[i*2],y:p[i*2+1]});
const put=(p,i,v)=>{p[i*2]=v.x;p[i*2+1]=v.y};
function midDir(u,v){
  const lu=Math.hypot(u.x,u.y)||1, lv=Math.hypot(v.x,v.y)||1;
  const a={x:u.x/lu,y:u.y/lu}, b={x:v.x/lv,y:v.y/lv};
  if(a.x*b.x+a.y*b.y<-0.9995)return {x:-a.y,y:a.x};
  const m={x:a.x+b.x,y:a.y+b.y}, lm=Math.hypot(m.x,m.y);
  return lm<1e-6?a:{x:m.x/lm,y:m.y/lm};
}
function arcMid(A,B){
  const m=[];for(let j=0;j<22;j++)m.push((A[j]+B[j])/2);
  for(const c of ORDER){
    const par=PARENT[c];
    const uA={x:A[c*2]-A[par*2], y:A[c*2+1]-A[par*2+1]};
    const uB={x:B[c*2]-B[par*2], y:B[c*2+1]-B[par*2+1]};
    const lA=Math.hypot(uA.x,uA.y), lB=Math.hypot(uB.x,uB.y);
    if(lA<0.5&&lB<0.5)continue;
    const dir=midDir(uA,uB), len=(lA+lB)/2, P0=at(m,par);
    put(m,c,{x:P0.x+dir.x*len, y:P0.y+dir.y*len});
  }
  const near=p=>Math.hypot(p[8]-p[16],p[9]-p[17])<9;
  if(near(A)&&near(B)){
    const off={x:((A[8]-A[16])+(B[8]-B[16]))/2, y:((A[9]-A[17])+(B[9]-B[17]))/2};
    put(m,4,{x:m[16]+off.x, y:m[17]+off.y});
  }
  for(let j=0;j<11;j++){
    const dx=A[j*2]-B[j*2], dy=A[j*2+1]-B[j*2+1];
    if(Math.hypot(dx,dy)<3)put(m,j,{x:(A[j*2]+B[j*2])/2, y:(A[j*2+1]+B[j*2+1])/2});
  }
  for(let j=0;j<11;j++)
    if(m[j*2]<-4||m[j*2]>104||m[j*2+1]<-4||m[j*2+1]>100)
      put(m,j,{x:(A[j*2]+B[j*2])/2, y:(A[j*2+1]+B[j*2+1])/2});
  return m.map(v=>Math.round(v*10)/10);
}
const same=(a,b)=>{for(let i=0;i<22;i++)if(Math.abs(a[i]-b[i])>0.6)return false;return true};

let stripped=0;const edits=[];
for(const e of M.EX){
  if(!e.f)continue;
  let f=e.f.map(p=>p.slice());
  for(;;){
    let cut=-1;
    /* deepest first: a generated frame reproduces exactly from its neighbours */
    for(let i=1;i<f.length-1;i++)
      if(same(f[i],arcMid(f[i-1],f[i+1]))){cut=i;break}
    if(cut<0)break;
    f.splice(cut,1);
  }
  if(f.length===e.f.length)continue;
  stripped+=e.f.length-f.length;
  const tag=`{id:'${e.id}',`, a=s.indexOf(tag);
  let j=a,d=0;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(!d)break}}
  const o=s.slice(a,j), fA=o.indexOf('f:[');
  let k=fA+2,dd=0;
  for(;k<o.length;k++){if(o[k]==='[')dd++;else if(o[k]===']'){dd--;if(!dd)break}}
  const body=f.map(p=>'P('+p.map(v=>Math.round(v*10)/10).join(',')+')').join(',\n    ');
  edits.push({from:a+fA, to:a+k+1, text:'f:['+body+']', id:e.id, was:e.f.length, now:f.length});
}
edits.sort((x,y)=>y.from-x.from);
for(let i=1;i<edits.length;i++)
  if(edits[i].to>edits[i-1].from){console.log('!! edits overlap');process.exit(1)}
for(const ed of edits)s=s.slice(0,ed.from)+ed.text+s.slice(ed.to);
fs.writeFileSync(F,s);
console.log('stripped '+stripped+' generated frames from '+edits.length+' movements');
