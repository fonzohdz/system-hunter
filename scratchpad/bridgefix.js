/* The bridge family's geometry was poor before any of the separation work: at
   the top the hip sat level with the knee, leaving a seven-unit thigh with
   nowhere to go. Nudging could not save it, so both are authored fresh —
   shoulders down, feet planted ten apart, hips travelling fourteen units. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
let n=0;
function set(id,frames,note,prop){
  const at=s.indexOf(`{id:'${id}',`);
  if(at<0){console.log('!! no '+id);process.exit(1)}
  let i=at,d=0;for(;i<s.length;i++){if(s[i]==='{')d++;else if(s[i]==='}'){d--;if(!d)break}}
  let o=s.slice(at,i);
  const fA=o.indexOf('f:['); let k=fA+2,dd=0;
  for(;k<o.length;k++){if(o[k]==='[')dd++;else if(o[k]===']'){dd--;if(!dd)break}}
  const body=frames.map(q=>{if(q.length!==22){console.log('!! '+id+' '+q.length);process.exit(1)}
    return 'P('+q.join(',')+')'}).join(',\n    ');
  o=o.slice(0,fA)+'f:['+body+']'+o.slice(k+1);
  if(note)o=o.replace(/\/\*[^*\/]*\*\/\n(\s*)f:\[/,'/* '+note+' */\n$1f:[');
  if(prop!==undefined)o=/,p:'[a-z0-9+]*'/.test(o)?o.replace(/,p:'[a-z0-9+]*'/,prop?`,p:'${prop}'`:'')
    :(prop?o.replace(/^\{id:'[a-z0-9_]+',/,m=>m+`p:'${prop}',`):o);
  s=s.slice(0,at)+o+s.slice(i); n++; console.log('  '+id);
}

set('bridge',[
 [18,88, 27,88, 54,88, 32,90, 40,92, 64,76, 70,92, 34,90, 42,92, 70,74, 80,92],
 [18,88, 27,88, 54,74, 32,90, 40,92, 64,74, 70,92, 34,90, 42,92, 70,72, 80,92]
],'shoulders and both hands stay flat on the floor, both feet planted ten apart, and the hips travel fourteen units up into a straight line from shoulder to knee');

set('bb_thrust',[
 [18,72, 27,73, 54,88, 36,82, 52,88, 64,76, 70,92, 38,80, 58,86, 70,74, 80,92],
 [18,72, 27,73, 54,72, 36,74, 52,72, 64,74, 70,92, 38,72, 58,70, 70,72, 80,92]
],'upper back braced on the bench while the feet stay planted; the bar rides on the hips and rises with them, which is the difference from a floor bridge','bench+bar2');

fs.writeFileSync(F,s);
console.log('authored '+n);
