/* Lerping two poses moves every joint in a straight line, so a limb swinging
   through a wide arc cuts the chord and shortens on the way past — a curl's
   forearm drops from 13 units to 5 and springs back. A start/end screenshot
   cannot show it; in motion it reads as rubber-banding.

   The renderer is NOT the place to fix this. Interpolating angles at runtime is
   the architecture that has been built and removed twice. Instead this is an
   offline data step: it subdivides a segment that swings too far and authors the
   in-between pose by rotating each bone to its true angular midpoint. The
   painter stays a plain lerp — the arc is simply described by more points.

   Authored keyframes are never altered, only new ones inserted between them, and
   any joint that holds still across a segment (a planted hand, a foot on a box)
   is pinned so the subdivision cannot introduce drift. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const L=require('./lib.js');const M=L.load(F);

const PARENT={0:1, 1:2, 3:1, 4:3, 7:1, 8:7, 5:2, 6:5, 9:2, 10:9};
const KIDS={2:[1,5,9], 1:[0,3,7], 3:[4], 7:[8], 5:[6], 9:[10]};
const ORDER=[1,0,3,4,7,8,5,6,9,10];              /* parents before children */
const at=(p,i)=>({x:p[i*2],y:p[i*2+1]});
const put=(p,i,v)=>{p[i*2]=v.x;p[i*2+1]=v.y};

/* halfway around the arc, not across it */
function midDir(u,v){
  const lu=Math.hypot(u.x,u.y)||1, lv=Math.hypot(v.x,v.y)||1;
  const a={x:u.x/lu,y:u.y/lu}, b={x:v.x/lv,y:v.y/lv};
  let d=a.x*b.x+a.y*b.y;
  if(d<-0.9995){ /* exactly opposed: no unique bisector, pick one consistently */
    return {x:-a.y,y:a.x};
  }
  const m={x:a.x+b.x,y:a.y+b.y}, lm=Math.hypot(m.x,m.y);
  return lm<1e-6?a:{x:m.x/lm,y:m.y/lm};
}
function arcMid(A,B){
  const m=[];for(let j=0;j<22;j++)m.push((A[j]+B[j])/2);   /* root and fallback */
  for(const c of ORDER){
    const par=PARENT[c];
    const uA={x:A[c*2]-A[par*2], y:A[c*2+1]-A[par*2+1]};
    const uB={x:B[c*2]-B[par*2], y:B[c*2+1]-B[par*2+1]};
    const lA=Math.hypot(uA.x,uA.y), lB=Math.hypot(uB.x,uB.y);
    if(lA<0.5&&lB<0.5)continue;
    const dir=midDir(uA,uB), len=(lA+lB)/2, P0=at(m,par);
    put(m,c,{x:P0.x+dir.x*len, y:P0.y+dir.y*len});
  }
  /* anything that barely moved across this segment is a contact — pin it, so
     rebuilding the chain can never slide a planted hand or foot */
  for(let j=0;j<11;j++){
    const dx=A[j*2]-B[j*2], dy=A[j*2+1]-B[j*2+1];
    if(Math.hypot(dx,dy)<3)put(m,j,{x:(A[j*2]+B[j*2])/2, y:(A[j*2+1]+B[j*2+1])/2});
  }
  /* Two hands on one implement must stay on it. If they were together at both
     ends, rebuilding the arms separately can pull them apart, and the bar is
     drawn between them. */
  const near=(p)=>Math.hypot(p[8]-p[16],p[9]-p[17])<9;
  if(near(A)&&near(B)){
    const off={x:((A[8]-A[16])+(B[8]-B[16]))/2, y:((A[9]-A[17])+(B[9]-B[17]))/2};
    put(m,4,{x:m[16]+off.x, y:m[17]+off.y});
  }
  /* rebuilding a chain can swing a joint out past the edge; where it does,
     fall back to the plain lerp for that joint only */
  for(let j=0;j<11;j++){
    if(m[j*2]<-4||m[j*2]>104||m[j*2+1]<-4||m[j*2+1]>100)
      put(m,j,{x:(A[j*2]+B[j*2])/2, y:(A[j*2+1]+B[j*2+1])/2});
  }
  return m.map(v=>Math.round(v*10)/10);
}

const BONES=[[1,3],[3,4],[1,7],[7,8],[1,2],[2,5],[5,6],[2,9],[9,10]];
function worstSwing(A,B){
  let w=0;
  for(const [a,b] of BONES){
    const u={x:A[b*2]-A[a*2],y:A[b*2+1]-A[a*2+1]};
    const v={x:B[b*2]-B[a*2],y:B[b*2+1]-B[a*2+1]};
    const lu=Math.hypot(u.x,u.y),lv=Math.hypot(v.x,v.y);
    if(lu<8||lv<8)continue;
    const c=(u.x*v.x+u.y*v.y)/(lu*lv);
    w=Math.max(w,Math.acos(Math.max(-1,Math.min(1,c)))*57.2958);
  }
  return w;
}
/* subdivide until every hop is a short enough arc, or we have split enough */
function split(A,B,depth){
  if(depth>=4||worstSwing(A,B)<=70)return [B];
  const m=arcMid(A,B);
  return [...split(A,m,depth+1), ...split(m,B,depth+1)];
}

/* Work out every edit against the ORIGINAL text first, then apply them from the
   end of the file backwards. Splicing as we went made each edit shift the
   offsets of the ones after it, which silently dropped eleven frames. */
let touched=0,added=0,frames=0;
const edits=[];
for(const e of M.EX){
  if(!e.f)continue;
  const out=[e.f[0]];
  for(let i=0;i<e.f.length-1;i++)out.push(...split(e.f[i],e.f[i+1],0));
  frames+=out.length;
  if(out.length===e.f.length)continue;
  added+=out.length-e.f.length; touched++;
  const tag=`{id:'${e.id}',`, a=s.indexOf(tag);
  let j=a,d=0;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(!d)break}}
  const o=s.slice(a,j), fA=o.indexOf('f:[');
  if(fA<0){console.log('!! no f: on '+e.id);process.exit(1)}
  let k=fA+2,dd=0;
  for(;k<o.length;k++){if(o[k]==='[')dd++;else if(o[k]===']'){dd--;if(!dd)break}}
  const body=out.map(p=>'P('+p.join(',')+')').join(',\n    ');
  edits.push({from:a+fA, to:a+k+1, text:'f:['+body+']', id:e.id,
              was:e.f.length, now:out.length});
}
edits.sort((x,y)=>y.from-x.from);
for(let i=1;i<edits.length;i++)
  if(edits[i].to>edits[i-1].from){console.log('!! edits overlap');process.exit(1)}
for(const ed of edits)s=s.slice(0,ed.from)+ed.text+s.slice(ed.to);
for(const ed of [...edits].reverse())
  console.log('  '+ed.id.padEnd(18)+ed.was+' -> '+ed.now);
fs.writeFileSync(F,s);
console.log('\n'+touched+' movements subdivided, '+added+' arc frames added, '+
  frames+' keyframes total. No authored pose was modified.');
