/* Final polish on the four movements where something real was still missing. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
let n=0;
function set(id,frames,note){
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
  s=s.slice(0,at)+o+s.slice(i); n++; console.log('  '+id);
}

/* SPLIT SQUAT — the legs were doing everything and the upper body was frozen
   solid: zero elbow change, zero torso change across all three poses. It read
   as a mannequin on rails. A few degrees of forward lean at the bottom and a
   little arm counterbalance is all it needs; the stagger still does the work. */
set('split',[
 [46,17, 46,27, 46,54, 42,40, 40,54, 36,72, 30,92, 50,40, 52,54, 56,72, 60,92],
 [48,25, 47,35, 46,62, 43,48, 43,61, 42,80, 30,92, 51,48, 55,60, 60,73, 60,92],
 [51,33, 49,43, 46,70, 45,56, 47,67, 46,86, 30,92, 53,56, 59,65, 62,74, 60,92]
],'a thirty-unit stagger with the body dropping straight down between the feet. The torso picks up a few degrees of lean and the hands drift forward as it descends, so the upper body is not frozen while the legs work');

/* SEATED CALF RAISE — eight units of total travel is almost nothing at card
   size. The knee rise is exaggerated to fourteen and the heel drops below the
   line first, so there is a visible down-then-up rather than a twitch. */
set('mch_calf',[
 [38,30, 38,40, 40,66, 58,74, 61,96, 56,74, 58,96, 65,73, 70,95, 67,73, 73,95],
 [38,30, 38,40, 40,66, 58,60, 62,88, 56,60, 59,88, 65,59, 71,87, 67,59, 74,87]
],'seated with the toes fixed on the block: the heels drop below it and drive up, carrying the knees fourteen units. The knee angle barely changes, which is what makes it a calf raise and not a leg press');

/* GLUTE BRIDGE — only the hip was moving. The knees now track a little as the
   hips rise, which is what actually happens and stops the legs looking welded
   to the floor. */
set('bridge',[
 [18,88, 27,88, 54,88, 32,90, 40,92, 66,78, 70,92, 34,90, 42,92, 72,76, 80,92],
 [18,88, 27,88, 54,74, 32,90, 40,92, 63,73, 70,92, 34,90, 42,92, 69,71, 80,92]
],'shoulders and both hands flat on the floor, both feet planted ten apart. The hips travel fourteen units into a straight shoulder-to-knee line and the knees track back over the feet as they go');

/* CONCENTRATION CURL — correct that only the forearm moves, but the braced
   elbow was drifting a unit and the far arm sat on top of the working one.
   Elbow pinned, far arm resting clear on the other thigh. */
set('db_conc',[
 [58,46, 52,54, 38,72, 40,66, 46,74, 56,75, 58,92, 56,66, 58,80, 66,74, 72,92],
 [58,46, 52,54, 38,72, 40,66, 46,74, 56,75, 58,92, 56,66, 46,60, 66,74, 72,92]
],'seated and hinged forward with the working elbow braced against the inner thigh so it cannot travel; only the forearm swings. The free arm rests clear on the other leg');

fs.writeFileSync(F,s);
console.log('polished '+n);
