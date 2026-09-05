/* Ten movements re-authored by hand, from what the exercise looks like rather
   than from what satisfies a checker.

   Three things changed in how these are drawn:

   1. STANCE IS WIDE. Feet 12-16 units apart instead of 2, so at 52px you see
      two legs and not one thick one. 14 units is about 7 real pixels.
   2. THE FAR LIMB IS OFFSET ON PURPOSE. The rear knee sits 4-8 units from the
      near one and the rear hand 5-7 from the near hand. It is not where a side
      view would put it. It is where you can see it.
   3. THE LANDMARKS ARE EXAGGERATED. A squat bottom has thighs near horizontal
      and the hips clearly behind the heels. A split squat's feet are 30 apart.
      A step-up's trailing knee drives high. Readable beats accurate.

   Movements with a lot of travel get an authored middle so the tween passes
   through a pose someone drew, instead of sliding every joint in a straight
   line — which is what made the squat look like sitting down.

   Nothing automated runs over these afterwards. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
let n=0;
function set(id,frames,note){
  const at=s.indexOf(`{id:'${id}',`);
  if(at<0){console.log('!! no movement '+id);process.exit(1)}
  let i=at,d=0;for(;i<s.length;i++){if(s[i]==='{')d++;else if(s[i]==='}'){d--;if(!d)break}}
  let o=s.slice(at,i);
  const fA=o.indexOf('f:['); let k=fA+2,dd=0;
  for(;k<o.length;k++){if(o[k]==='[')dd++;else if(o[k]===']'){dd--;if(!dd)break}}
  const body=frames.map(q=>{if(q.length!==22){console.log('!! '+id+' has '+q.length);process.exit(1)}
    return 'P('+q.join(',')+')'}).join(',\n    ');
  o=o.slice(0,fA)+'f:['+body+']'+o.slice(k+1);
  o=o.replace(/\/\*[^*\/]*\*\/\n(\s*)f:\[/,'/* '+note+' */\n$1f:[');
  s=s.slice(0,at)+o+s.slice(i); n++; console.log('  '+id+'  '+frames.length+' key poses');
}

/* 1. BODYWEIGHT SQUAT — feet 16 apart standing, thighs near horizontal at the
      bottom, hips clearly behind the heels, both knees visible. */
set('squat',[
 [50,15, 50,25, 50,52, 44,38, 42,52, 44,72, 42,92, 56,38, 58,52, 56,72, 58,92],
 [55,27, 52,36, 47,61, 56,48, 64,47, 52,75, 45,92, 60,46, 68,44, 60,73, 60,92],
 [62,38, 57,47, 44,70, 60,56, 70,53, 60,78, 48,92, 64,54, 74,50, 64,74, 62,92]
],'stand with the feet apart, then hips back and DOWN until the thighs are near level. Both knees stay visible, the feet stay planted fourteen units apart, and the arms swing forward as a counterweight');

/* 2. BARBELL BACK SQUAT — the same descent but the bar on the traps pitches the
      chest noticeably further forward than the bodyweight version. */
set('bb_squat',[
 [50,15, 50,25, 50,52, 36,34, 42,20, 44,72, 42,92, 64,34, 58,20, 56,72, 58,92],
 [58,30, 54,39, 47,62, 40,48, 46,34, 54,76, 46,92, 68,48, 62,34, 62,74, 60,92],
 [64,41, 58,49, 42,71, 50,58, 48,45, 60,79, 48,92, 70,58, 66,45, 64,75, 62,92]
],'the bar rides on the back, so the chest pitches to about thirty-six degrees at the bottom — visibly further over than a bodyweight squat. Elbows stay back under the bar');

/* 3. HIP HINGE — the hips travel BACK, not down: that is the whole picture. The
      knees only soften and the arms hang dead straight. */
set('hinge',[
 [50,15, 50,25, 50,52, 46,38, 44,52, 44,72, 42,92, 54,38, 56,52, 56,72, 58,92],
 [64,32, 56,38, 45,55, 56,50, 56,64, 43,73, 41,92, 60,50, 60,64, 53,73, 56,92],
 [77,50, 67,52, 40,58, 64,66, 65,80, 44,76, 42,92, 68,64, 69,78, 50,74, 54,92]
],'the hips slide back until the back is nearly level. The knees stay at about a hundred and sixty degrees the whole way and the arms hang straight down — no squat, no elbow bend');

/* 4. BARBELL DEADLIFT — floor start with real knee bend and the shins close to
      vertical, arms long, finishing tall. */
set('bb_dl',[
 [71,49, 62,54, 40,66, 60,70, 61,88, 48,78, 44,92, 64,68, 65,86, 56,74, 58,92],
 [62,32, 57,40, 45,58, 55,54, 56,72, 48,74, 44,92, 59,52, 60,70, 54,73, 58,92],
 [50,15, 50,25, 50,52, 46,38, 48,56, 46,74, 44,92, 54,38, 56,54, 56,72, 58,92]
],'starts with the hands at the bar on the floor, hips high and knees at about a hundred and twenty, and stands up. The arms never bend — the hips and knees do all of it');

/* 5. STEP-UP — the lead foot never leaves the box, the lead knee starts deeply
      folded, and the trailing knee drives high at the top so the two legs read
      as doing different jobs. */
set('stepup',[
 [41,22, 40,32, 38,58, 36,46, 34,60, 32,76, 28,92, 44,46, 46,60, 60,52, 60,74],
 [48,16, 48,26, 47,51, 42,39, 40,53, 48,68, 44,88, 54,39, 56,53, 62,56, 60,74],
 [58,8,  58,18, 58,44, 52,32, 50,46, 74,48, 78,66, 64,32, 66,46, 60,60, 60,74]
],'the lead foot is planted on the box from the first frame to the last. That knee folds to seventy-five degrees, then drives the whole body up over it while the trailing knee comes high');

/* 6. SPLIT SQUAT — the feet are thirty units apart, which is the identification.
      Straight down, rear knee nearly to the floor. */
set('split',[
 [46,17, 46,27, 46,54, 42,40, 40,54, 36,72, 30,92, 50,40, 52,54, 56,72, 60,92],
 [46,25, 46,35, 46,62, 42,48, 40,62, 42,80, 30,92, 50,48, 52,62, 60,73, 60,92],
 [46,33, 46,43, 46,70, 42,56, 40,70, 46,86, 30,92, 50,56, 52,70, 62,74, 60,92]
],'a stance thirty units wide, and the body drops straight down between the feet — the hips do not travel back. The rear knee finishes just off the floor, the front shin stays upright');

/* 7. PUSH-UP — the hands sit seven apart and the feet six, so the far arm and
      leg are visible instead of hidden behind the near ones. */
set('pushup',[
 [18,52, 27,56, 56,66, 24,73, 23,90, 72,79, 88,90, 29,72, 30,90, 74,74, 92,84],
 [16,58, 25,61, 55,69, 28,76, 23,90, 71,81, 88,90, 33,75, 30,90, 73,76, 92,84],
 [14,64, 24,66, 54,72, 33,79, 23,90, 71,82, 88,90, 38,78, 30,90, 73,77, 92,84]
],'hands and toes are pinned and the body turns as one rigid piece about the toes. Both elbows fold back along the ribs to about a hundred degrees; the far arm is drawn offset so you can see it');

/* 8. BIRD DOG — a real quadruped base with all four contacts separated, then one
      arm and the OPPOSITE leg reaching out level with the spine. */
set('birddog',[
 [22,58, 30,62, 60,66, 26,77, 25,90, 56,88, 70,92, 31,76, 31,90, 60,86, 76,90],
 [20,54, 30,58, 60,64, 26,77, 25,90, 76,62, 92,58, 18,54, 6,50,  60,86, 76,90]
],'hands under the shoulders and knees under the hips at a right angle, all four contacts drawn apart. Then the near arm reaches forward and the far leg back, both level with the spine, while the other hand and knee stay put');

/* 9. DEAD BUG — lying with hips and knees stacked at right angles, arms
      vertical, then opposite limbs reaching away while the others hold. */
set('deadbug',[
 [18,82, 28,82, 58,84, 26,71, 27,57, 55,69, 70,68, 31,70, 33,56, 60,66, 76,64],
 [18,82, 28,82, 58,84, 26,71, 27,57, 70,76, 88,82, 22,72, 8,68,  60,66, 76,64]
],'on the back with the hips and knees both at ninety and the arms pointing straight up. One arm goes back overhead while the opposite leg reaches away; the other arm and knee hold their tabletop exactly');

/* 10. MOUNTAIN CLIMBER — a fixed plank base with one knee driven well past the
       hip and the other leg long, then swapped. */
set('climber',[
 [18,54, 27,58, 56,68, 23,75, 22,90, 72,78, 90,88, 28,74, 29,90, 38,72, 46,84],
 [18,54, 27,58, 56,68, 23,75, 22,90, 36,76, 44,88, 28,74, 29,90, 74,76, 92,86]
],'the hands and the torso never move. One knee drives forward to seventy degrees, well past the hip, while the other leg stays straight out behind — then they swap');

fs.writeFileSync(F,s);
console.log('\nre-authored '+n+' movements by hand. No automated pass follows.');
