/* Per-class stances. Six weapons, six ways to stand.

   The body is drawn from a few named points — hips, knees, feet, shoulders,
   elbows, hands — so a stance is just a different set of numbers, and limbs are
   round-capped strokes rather than polygons. The weapon transform is per class
   too, because a greathammer on the shoulder and a staff planted in the ground
   are not the same gesture. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');

const a=s.indexOf('function heroSVG(opt){');
const b=s.indexOf('function bladeSVG(w){');
if(a<0||b<0){console.log('!! bounds');process.exit(1)}

const NEW=`/* Every stance names the same joints; only the numbers change.
   hip/knee/foot per leg, shoulder/elbow/hand per arm. "hold" is how the weapon
   sits in the hand, and a stance may carry two of them. */
const STANCE={
 /* Bladebound — greatsword point-down in front, both hands on the grip. The
    calm one: feet square, weapon planted like a full stop. */
 longsword:{
   legs:[[48,152,44,206,41,262],[62,152,66,206,69,262]],
   arms:[[38,102,33,131,48,146],[72,102,77,131,62,146]],
   hold:[['longsword','translate(55,140) scale(.45) rotate(180) translate(-60,-254)']]},

 /* Ronin — bladed side-on, katana low and back in one hand, the free hand out
    for balance. Weight on the back foot. */
 katana:{
   legs:[[48,152,38,204,32,262],[62,152,71,204,78,262]],
   arms:[[38,102,23,124,17,148],[72,102,84,132,81,163]],
   hold:[['katana','translate(81,163) scale(.44) rotate(-30) translate(-53,-246)']]},

 /* Warden — haft across the shoulder, both hands low on it, feet planted wide.
    Nothing about this one is quick. */
 hammer:{
   legs:[[47,152,40,206,34,263],[63,152,71,206,77,263]],
   arms:[[38,102,50,132,66,155],[72,102,85,130,78,166]],
   hold:[['hammer','translate(78,166) scale(.40) rotate(16) translate(-60,-250)']]},

 /* Arcanist — staff planted in the ground beside them, one hand on the shaft at
    chest height, the orb up level with the head. */
 staff:{
   legs:[[48,152,45,206,43,262],[62,152,64,206,66,262]],
   arms:[[38,102,29,130,33,157],[72,102,82,124,86,145]],
   hold:[['staff','translate(39,43) scale(.78)']]},

 /* Stalker — low and coiled, ONE dagger in each hand, blades angled out. The
    old art crushed a crossed pair into a single fist. */
 daggers:{
   legs:[[46,156,34,200,28,262],[64,156,76,200,82,262]],
   arms:[[38,104,25,127,27,157],[72,104,85,127,83,157]],
   hold:[['dagger1','translate(27,157) scale(.42) rotate(-28) translate(-60,-210)'],
         ['dagger1','translate(83,157) scale(.42) rotate(28) translate(-60,-210)']]},

 /* Ironclad — no weapon to hold: the gauntlets ARE the hands, up in a guard. */
 gauntlets:{
   legs:[[47,152,40,204,35,262],[63,152,70,204,75,262]],
   arms:[[38,102,28,127,43,106],[72,102,83,127,69,101]],
   hold:[['gauntlet1','translate(43,106) scale(.34) rotate(-12) translate(-65,-137)'],
         ['gauntlet1','translate(69,101) scale(.34) rotate(12) translate(-65,-137)']]}
};

function heroSVG(opt){
  const o=opt||{};
  const rank=o.rank||rankOf(S.lvl);
  const g=GEARTIER[rank]!==undefined?GEARTIER[rank]:0;
  const wk=o.weapon||S.weapon||cls().w;
  const st=STANCE[wk]||STANCE.longsword;
  const lit=o.lit===undefined?S.streak>0:o.lit;
  const L=[];
  /* a limb: two round-capped strokes, thicker at the root */
  const limb=(p,w0,w1,col)=>
    \`<path d="M\${p[0]} \${p[1]} L\${p[2]} \${p[3]}" stroke="\${col}" stroke-width="\${w0}"
       stroke-linecap="round" fill="none"/>
     <path d="M\${p[2]} \${p[3]} L\${p[4]} \${p[5]}" stroke="\${col}" stroke-width="\${w1}"
       stroke-linecap="round" fill="none"/>\`;
  const B='var(--hf-body)';

  /* cape hangs behind everything */
  if(g>=3)L.push(\`<g class="hf-cape"><path d="M34 100 Q23 170 30 240 L55 228 L80 240 Q87 170 76 100 Z"
    fill="var(--deepblade)" opacity=".88"/>
    <path d="M55 104 L55 230" stroke="var(--crimson)" stroke-width="1.2" opacity=".45"/></g>\`);

  /* legs, then boots at whatever the stance put the feet on */
  for(const lg of st.legs)L.push(limb(lg,15,12,B));
  for(const lg of st.legs){
    if(g>=3)L.push(\`<circle cx="\${lg[2]}" cy="\${lg[3]}" r="8" fill="url(#hfPlate)"/>\`);
    L.push(\`<ellipse cx="\${lg[4]}" cy="\${lg[5]+5}" rx="11" ry="6" fill="var(--hf-dark)"/>\`);
  }

  /* torso */
  L.push(\`<g class="hf-breathe">
    <path d="M36 100 Q33 130 43 156 L67 156 Q77 130 74 100 Q65 92 55 92 Q45 92 36 100 Z" fill="\${B}"/>\`);
  if(g>=2)L.push(\`<path d="M38 102 Q36 130 45 152 L65 152 Q74 130 72 102 Q64 95 55 95 Q46 95 38 102 Z"
      fill="url(#hfPlate)"/>
    <path d="M55 98 L55 152" stroke="var(--hf-dark)" stroke-width="1.4" opacity=".5"/>\`);
  if(g>=4)L.push(\`<path d="M45 106 L55 117 L65 106 L65 123 L55 133 L45 123 Z"
      fill="var(--core)" opacity=".9"/>\`);
  if(g>=1)L.push(\`<rect x="40" y="148" width="30" height="9" rx="2" fill="var(--guard)"/>\`);
  if(g>=4)L.push(\`<circle cx="55" cy="152.5" r="4" fill="url(#hfGem)"/>\`);
  L.push('</g>');

  /* arms */
  for(const ar of st.arms)L.push(limb(ar,13,10.5,B));
  if(g>=1)for(const ar of st.arms)
    L.push(\`<circle cx="\${(ar[2]+ar[4])/2}" cy="\${(ar[3]+ar[5])/2}" r="6.5" fill="url(#hfPlate)"/>\`);
  /* pauldrons sit on the shoulder each stance declares */
  if(g>=1)L.push(\`<ellipse cx="\${st.arms[1][0]+2}" cy="\${st.arms[1][1]-2}" rx="11" ry="9"
      fill="url(#hfPlate)" transform="rotate(14 \${st.arms[1][0]} \${st.arms[1][1]})"/>\`);
  if(g>=3)L.push(\`<ellipse cx="\${st.arms[0][0]-2}" cy="\${st.arms[0][1]-2}" rx="11" ry="9"
      fill="url(#hfPlate)" transform="rotate(-14 \${st.arms[0][0]} \${st.arms[0][1]})"/>\`);
  if(g>=5)L.push(\`<path d="M\${st.arms[1][0]+10} 94 L\${st.arms[1][0]+19} 104 L\${st.arms[1][0]+10} 112 Z"
      fill="var(--core)" opacity=".85"/>
    <path d="M\${st.arms[0][0]-10} 94 L\${st.arms[0][0]-19} 104 L\${st.arms[0][0]-10} 112 Z"
      fill="var(--core)" opacity=".85"/>\`);

  /* head */
  L.push(\`<g class="hf-head"><ellipse cx="55" cy="72" rx="14.5" ry="16.5" fill="\${B}"/>\`);
  if(g>=4)L.push(\`<path d="M41 70 Q41 54 55 54 Q69 54 69 70 L69 78 L63 76 L63 66 L47 66 L47 76 L41 78 Z"
      fill="url(#hfPlate)"/>
    <rect x="46" y="68" width="18" height="4" rx="1.5" fill="var(--magenta)" opacity=".95"/>\`);
  else if(g>=2)L.push(\`<path d="M41 68 Q41 56 55 56 Q69 56 69 68 L69 72 L41 72 Z"
      fill="url(#hfPlate)" opacity=".9"/>\`);
  if(g>=5)L.push(\`<path d="M45 52 L50 40 L55 50 L60 40 L65 52 Z" fill="var(--core)"/>\`);
  L.push('</g>');

  /* whatever this class is carrying */
  for(const [k,tf] of st.hold)
    L.push(\`<g transform="\${tf}">\${WEAPONS[k]||WEAPONS.longsword}</g>\`);

  return \`<svg class="hero-svg\${lit?' lit':''}" viewBox="0 0 120 300" aria-hidden="true">
    \${WEAPONDEFS}
    <defs>
      <linearGradient id="hfPlate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--core)"/>
        <stop offset="45%" stop-color="var(--magenta)"/>
        <stop offset="100%" stop-color="var(--crimson)"/></linearGradient>
      <radialGradient id="hfGem" cx="38%" cy="34%" r="70%">
        <stop offset="0%" stop-color="var(--core)"/>
        <stop offset="60%" stop-color="var(--magenta)"/>
        <stop offset="100%" stop-color="var(--deepblade)"/></radialGradient>
    </defs>
    <g class="hf-idle">\${L.join('')}</g>
  </svg>\`;
}

`;
s=s.slice(0,a)+NEW+s.slice(b);
fs.writeFileSync(F,s);
console.log('per-class stances written');
