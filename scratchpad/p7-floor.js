/* Patch 7 — the Instant Dungeon ignored what you have.

   dgStations() checked unlocked() and fitsLimits() but never hasEq(), so it
   never saw floor-only at all. And its last resort was

     return EX.find(x=>x.id===ids[ids.length-1])

   which hands back the final id no matter what — wallpush for the push
   station, chairsq for legs. So someone who opened the app, said "floor only,
   a mat's worth of floor, no wall, no furniture", and tapped Enter the Dungeon
   was told to do wall push-ups and chair squats. That is the app failing the
   person it should be most careful with.

   Stations are now held to the same test as a quest movement, with a real
   fallback: the easiest bodyweight movement in that category that actually
   fits. If a category has nothing, the station is dropped rather than faked,
   so the loop has to stop assuming there are exactly three. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

sub(`function dgStations(){
  const pick=(...ids)=>{for(const id of ids){const e=EX.find(x=>x.id===id);
    if(e&&unlocked(e.r)&&fitsLimits(e))return e}
    return EX.find(x=>x.id===ids[ids.length-1])};
  const push=pick('pushup','kneepush','incpush','wallpush');
  const legs=pick('squat','chairsq');
  const core=pick('plank','kneeplank');
  return [
    {e:push,label:'5 reps'},
    {e:legs, label:'8 reps'},
    {e:core, label:'20 seconds'}
  ];
}`,
`function dgStations(){
  /* Same test as a quest movement. hasEq() is the one that was missing, and it
     is the one that carries floor-only — without it the dungeon offered a wall
     push-up and a chair squat to someone with neither. */
  const ok=e=>!!e&&unlocked(e.r)&&hasEq(e)&&fitsLimits(e);
  const RK=['E','D','C','B','A'];
  const pick=(cat,...ids)=>{
    for(const id of ids){const e=EX.find(x=>x.id===id); if(ok(e))return e}
    /* Nothing preferred fits: take the easiest bodyweight movement in the
       category that does. Returning the last id regardless is what caused the
       bug, so there is deliberately no unconditional fallback here. */
    return EX.filter(e=>e.c===cat&&!(e.eq||[]).length&&ok(e))
      .sort((a,b)=>RK.indexOf(a.r)-RK.indexOf(b.r))[0]||null;
  };
  return [
    {e:pick('push','pushup','kneepush','incpush','wallpush'),label:'5 reps'},
    {e:pick('legs','squat','chairsq'),                       label:'8 reps'},
    {e:pick('core','plank','kneeplank'),                     label:'20 seconds'}
  ].filter(s=>s.e);
}`,
  'dungeon stations respect equipment and floor-only, with an honest fallback');

/* the loop must not assume three stations any more */
sub(`  const left=dgLeft(), cur=st[o.step%3], nextS=st[(o.step+1)%3];`,
`  /* st can be shorter than three if a category has nothing you can do today. */
  if(!st.length)return viewQuest();
  const n=st.length;
  const left=dgLeft(), cur=st[o.step%n], nextS=st[(o.step+1)%n];`,
  'the runner uses however many stations there are');
sub(`      <p class="runstep" style="margin-top:14px">Station \${(o.step%3)+1} of 3</p>`,
    `      <p class="runstep" style="margin-top:14px">Station \${(o.step%n)+1} of \${n}</p>`,
  'the station counter matches');
sub(`    o.step++; if(o.step%3===0)o.rounds++;`,
`    const n=dgStations().length||1;
    o.step++; if(o.step%n===0)o.rounds++;`,
  'a round is a full lap of the stations that exist');

/* the entry copy promised three */
sub(`Three stations on a loop.`,`Stations on a loop.`,
  'entry copy stops promising exactly three');
sub(`Three bodyweight stations, as many rounds as you can.`,
    `Bodyweight stations, as many rounds as you can.`,
  'tour copy too');

fs.writeFileSync('index.html',t);
console.log('patch 7 applied');
