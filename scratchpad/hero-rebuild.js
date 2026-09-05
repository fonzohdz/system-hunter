/* Rebuilt against what the render actually showed.

   PROPORTIONS. The old figure was 8 units of shoulder narrower than its own
   hips, with a torso 56 tall against legs of 106 — a 1:1.9 ratio that read as
   all leg and no chest. Shoulders are now 60 wide against 38 at the waist, and
   the torso-to-leg ratio is 1:1.65. The head is an egg with a jaw rather than a
   rounded rectangle, which is what made it look like a loaf of bread.

   FEET were ellipses lying on the floor like puddles. They are wedges now,
   angled outward from the stance.

   THE HILT. The crossguard is drawn in --guard, which is nearly black, so on a
   dark background the sword had no visible hilt at all — just a blade ending at
   a hand. It gets the plate gradient and a bright top edge. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const a=s.indexOf('const STANCE={'), b=s.indexOf('function bladeSVG(w){');
if(a<0||b<0){console.log('!! bounds');process.exit(1)}

const NEW=`/* Joint positions per class. Shoulders sit at y 84 and x 30 / 80; hips at
   y 150 and x 46 / 64. A stance only changes where the limbs go from there. */
const STANCE={
 /* Bladebound — greatsword resting tip-down on the floor beside him, sword
    hand high on the grip so the whole blade reads. */
 longsword:{
   legs:[[46,150,42,202,39,268],[64,150,68,202,71,268]],
   arms:[[30,84,25,116,31,145],[80,84,89,103,91,124]],
   hold:[['longsword','translate(91,124) scale(.58) rotate(182) translate(-60,-250)']]},

 /* Ronin — bladed side-on, katana up at arm's length, free hand out low. */
 katana:{
   legs:[[46,150,36,200,30,268],[64,150,74,200,80,268]],
   arms:[[30,84,17,110,13,138],[80,84,91,107,93,131]],
   hold:[['katana','translate(93,131) scale(.58) rotate(-6) translate(-53,-246)']]},

 /* Warden — greathammer stood head-down on the floor, both hands on the haft. */
 hammer:{
   legs:[[45,150,38,202,32,269],[65,150,72,202,78,269]],
   arms:[[30,84,38,118,58,140],[80,84,89,101,91,120]],
   hold:[['hammer','translate(91,120) scale(.46) rotate(186) translate(-60,-250)']]},

 /* Arcanist — staff planted, orb up beside the head. */
 staff:{
   legs:[[46,150,43,202,41,268],[64,150,67,202,69,268]],
   arms:[[30,84,21,114,25,143],[80,84,89,100,91,120]],
   hold:[['staff','translate(45,32) scale(.76)']]},

 /* Stalker — low and coiled, ONE dagger per hand, blades angled out. */
 daggers:{
   legs:[[44,152,32,198,26,268],[66,152,78,198,84,268]],
   arms:[[30,86,19,112,23,142],[80,86,91,112,87,142]],
   hold:[['dagger1','translate(23,142) scale(.42) rotate(-32) translate(-60,-210)'],
         ['dagger1','translate(87,142) scale(.42) rotate(32) translate(-60,-210)']]},

 /* Ironclad — no weapon. The gauntlets ARE the hands: lead fist up at the
    jaw, rear fist held back at the ribs. */
 gauntlets:{
   legs:[[45,150,38,200,33,268],[65,150,72,200,77,268]],
   arms:[[30,84,19,110,37,74],[80,84,93,110,85,124]],
   hold:[['gauntlet1','translate(37,74) scale(.5) rotate(-20) translate(-65,-137)'],
         ['gauntlet1','translate(85,124) scale(.5) rotate(24) translate(-65,-137)']]}
};

let heroSeq=0;
function heroSVG(opt){
  const o=opt||{};
  /* Gradient ids must be unique per figure. Six on a page all declaring
     id="hfPlate" resolve to the first, which is why an ember Ronin wore
     crimson armour. */
  const uid='h'+(++heroSeq), PL='url(#pl'+uid+')', GEM='url(#gm'+uid+')';
  const rank=o.rank||rankOf(S.lvl);
  const g=GEARTIER[rank]!==undefined?GEARTIER[rank]:0;
  const wk=o.weapon||S.weapon||cls().w;
  const st=STANCE[wk]||STANCE.longsword;
  const lit=o.lit===undefined?S.streak>0:o.lit;
  const L=[], B='var(--hf-body)';
  /* a limb: two round-capped strokes, thicker at the root */
  const limb=(p,w0,w1)=>
    \`<path d="M\${p[0]} \${p[1]} L\${p[2]} \${p[3]}" stroke="\${B}" stroke-width="\${w0}"
       stroke-linecap="round" fill="none"/>
     <path d="M\${p[2]} \${p[3]} L\${p[4]} \${p[5]}" stroke="\${B}" stroke-width="\${w1}"
       stroke-linecap="round" fill="none"/>\`;

  /* cape, behind everything */
  if(g>=3)L.push(\`<g class="hf-cape"><path d="M30 86 Q18 168 26 244 L55 232 L84 244 Q92 168 80 86 Z"
    fill="var(--deepblade)" opacity=".9"/>
    <path d="M55 90 L55 234" stroke="var(--crimson)" stroke-width="1.2" opacity=".4"/></g>\`);

  /* legs */
  for(const lg of st.legs)L.push(limb(lg,18,14));
  for(const lg of st.legs){
    if(g>=3)L.push(\`<path d="M\${lg[2]-9} \${lg[3]-2} Q\${lg[2]} \${lg[3]-11} \${lg[2]+9} \${lg[3]-2}
      L\${lg[2]+7} \${lg[3]+9} L\${lg[2]-7} \${lg[3]+9} Z" fill="\${PL}"/>\`);
    /* a wedge boot pointing away from centre, not an ellipse on the floor */
    const out=lg[4]>55?1:-1;
    L.push(\`<path d="M\${lg[4]-9*out} \${lg[5]-6} L\${lg[4]+4*out} \${lg[5]-7}
      L\${lg[4]+13*out} \${lg[5]+2} L\${lg[4]+12*out} \${lg[5]+6} L\${lg[4]-9*out} \${lg[5]+6} Z"
      fill="var(--hf-dark)"/>\`);
  }

  /* torso: broad at the shoulder, narrow at the waist */
  L.push(\`<g class="hf-breathe">
    <path d="M27 82 Q36 70 55 70 Q74 70 83 82 L77 124 Q73 142 69 152 L41 152 Q37 142 33 124 Z"
      fill="\${B}"/>\`);
  if(g>=2)L.push(\`<path d="M31 84 Q39 74 55 74 Q71 74 79 84 L74 122 Q70 138 66 148 L44 148
      Q40 138 36 122 Z" fill="\${PL}"/>
    <path d="M55 78 L55 148" stroke="var(--hf-dark)" stroke-width="1.5" opacity=".45"/>
    <path d="M36 104 Q55 112 74 104" stroke="var(--hf-dark)" stroke-width="1.4"
      fill="none" opacity=".4"/>\`);
  if(g>=4)L.push(\`<path d="M44 88 L55 100 L66 88 L66 106 L55 117 L44 106 Z"
      fill="var(--core)" opacity=".9"/>\`);
  if(g>=1)L.push(\`<path d="M39 144 L71 144 L69 154 L41 154 Z" fill="var(--guard)"/>\`);
  if(g>=4)L.push(\`<circle cx="55" cy="149" r="4.2" fill="\${GEM}"/>\`);
  L.push('</g>');

  /* arms */
  for(const ar of st.arms)L.push(limb(ar,14,11));
  if(g>=1)for(const ar of st.arms){
    const mx=(ar[2]+ar[4])/2, my=(ar[3]+ar[5])/2;
    const an=(Math.atan2(ar[5]-ar[3],ar[4]-ar[2])*57.3+90).toFixed(1);
    L.push(\`<g transform="rotate(\${an} \${mx} \${my})">
      <path d="M\${mx-8} \${my-7} L\${mx+8} \${my-7} L\${mx+6.5} \${my+7} L\${mx-6.5} \${my+7} Z" fill="\${PL}"/>
      <path d="M\${mx-7} \${my} L\${mx+7} \${my}" stroke="var(--hf-dark)"
        stroke-width="1.3" opacity=".5"/></g>\`);
  }
  const pauldron=(x,y,d)=>\`<g>
    <path d="M\${x-15*d} \${y-7} Q\${x+3*d} \${y-15} \${x+14*d} \${y+1}
             L\${x+11*d} \${y+9} Q\${x+1*d} \${y+1} \${x-14*d} \${y+6} Z" fill="\${PL}"/>
    <path d="M\${x-13*d} \${y+6} Q\${x+1*d} \${y+3} \${x+11*d} \${y+9}
             L\${x+8*d} \${y+18} Q\${x-1*d} \${y+11} \${x-12*d} \${y+15} Z" fill="\${PL}" opacity=".8"/>
    <path d="M\${x-13*d} \${y+6} Q\${x+1*d} \${y+3} \${x+11*d} \${y+9}"
          stroke="var(--hf-dark)" stroke-width="1.3" fill="none" opacity=".55"/></g>\`;
  if(g>=1)L.push(pauldron(st.arms[1][0]+2,st.arms[1][1]-2,1));
  if(g>=3)L.push(pauldron(st.arms[0][0]-2,st.arms[0][1]-2,-1));
  if(g>=5)L.push(\`<path d="M\${st.arms[1][0]+13} 76 L\${st.arms[1][0]+23} 87 L\${st.arms[1][0]+13} 94 Z"
      fill="var(--core)" opacity=".85"/>
    <path d="M\${st.arms[0][0]-13} 76 L\${st.arms[0][0]-23} 87 L\${st.arms[0][0]-13} 94 Z"
      fill="var(--core)" opacity=".85"/>\`);

  /* neck, then an egg-shaped head with a jaw */
  L.push(\`<path d="M48 54 L62 54 L61 74 L49 74 Z" fill="var(--hf-dark)"/>\`);
  L.push(\`<g class="hf-head">
    <path d="M40 41 Q40 24 55 24 Q70 24 70 41 Q70 54 62 60 Q55 64 48 60 Q40 54 40 41 Z" fill="\${B}"/>\`);
  if(g>=4)L.push(\`<path d="M39 40 Q39 22 55 22 Q71 22 71 40 L71 50 L64 47 L64 36 L46 36 L46 47 L39 50 Z"
      fill="\${PL}"/>
    <rect x="45" y="39" width="20" height="4.5" rx="1.8" fill="var(--magenta)" opacity=".95"/>\`);
  else if(g>=2)L.push(\`<path d="M40 40 Q40 25 55 25 Q70 25 70 40 L70 45 L40 45 Z" fill="\${PL}" opacity=".92"/>\`);
  if(g>=5)L.push(\`<path d="M44 22 L50 8 L55 19 L60 8 L66 22 Z" fill="var(--core)"/>\`);
  L.push('</g>');

  /* whatever this class carries. The weapon art references the shared
     WEAPONDEFS gradients by id, and those collide exactly like the armour ones
     did, so every id and reference is scoped to this figure. */
  const wdefs=WEAPONDEFS.replace(/id="(\\w+)"/g,\`id="$1\${uid}"\`);
  for(const [k,tf] of st.hold){
    const art=(WEAPONS[k]||WEAPONS.longsword).replace(/url\\(#(\\w+)\\)/g,\`url(#$1\${uid})\`);
    L.push(\`<g transform="\${tf}">\${art}</g>\`);
  }

  return \`<svg class="hero-svg\${lit?' lit':''}" viewBox="0 0 120 300" aria-hidden="true">
    \${wdefs}
    <defs>
      <linearGradient id="pl\${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--core)"/>
        <stop offset="45%" stop-color="var(--magenta)"/>
        <stop offset="100%" stop-color="var(--crimson)"/></linearGradient>
      <radialGradient id="gm\${uid}" cx="38%" cy="34%" r="70%">
        <stop offset="0%" stop-color="var(--core)"/>
        <stop offset="60%" stop-color="var(--magenta)"/>
        <stop offset="100%" stop-color="var(--deepblade)"/></radialGradient>
    </defs>
    <g class="hf-idle">\${L.join('')}</g>
  </svg>\`;
}

`;
s=s.slice(0,a)+NEW+s.slice(b);

/* the crossguard was drawn in --guard, which is nearly black: on a dark
   background the sword had no visible hilt at all */
const gd=['  <path d="M26 216 L94 216 L88 230 L32 230 Z" fill="var(--guard)"/>',
          '  <path d="M26 216 L94 216 L88 230 L32 230 Z" fill="var(--deepblade)"/>\n  <path d="M26 216 L94 216 L92 220 L28 220 Z" fill="var(--magenta)" opacity=".75"/>'];
if(s.split(gd[0]).length-1!==1){console.log('!! crossguard');process.exit(1)}
s=s.split(gd[0]).join(gd[1]);

fs.writeFileSync(F,s);
console.log('figure rebuilt: proportions, head, feet, hilt');
