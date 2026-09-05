/* Turn the floating weapon into a hunter who is holding it.

   This is a different problem from the exercise figures, and worth saying why:
   that was 155 movements demonstrating technique at 52 pixels. This is ONE
   character, drawn once, at 250 pixels. A single figure can be drawn properly.

   The character is a front-facing silhouette in the same 120x300 box the
   weapons already use, so every existing weapon drops into its hand with a
   transform and nothing about the weapon art changes. Armour is additive layers
   keyed to rank: each promotion puts another piece on. Idle motion is CSS —
   breathing, a cape that sways, weight shifting — so prefers-reduced-motion
   turns it all off for free. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const cut=(label,a,b)=>{const c=s.split(a).length-1;
  if(c!==1){console.log('!! '+label+' matched '+c);process.exit(1)}
  s=s.split(a).join(b); console.log('  '+label)};

/* ---------- the figure ---------- */
const HERO = `
/* ---------------- the hunter ----------------
   A front-facing figure in the same 120x300 box as the weapons, so any weapon
   drops into the hand with one transform. Armour is additive: each rank adds a
   layer over the last and nothing is redrawn. Everything is palette variables,
   so the six classes recolour it for free. */
const GEARTIER={E:0,D:1,C:2,B:3,A:4,S:5};
const GEARNAME=['Wrapped','Bracered','Plated','Pauldroned','Warplate','Ascendant regalia'];

/* Where each weapon sits in the hand. The grip of every weapon SVG is around
   (60,254); scaling by .52 and shifting puts it in the right fist at (76,152). */
const HOLD='translate(45,20) scale(.52)';

function heroSVG(opt){
  const o=opt||{};
  const rank=o.rank||rankOf(S.lvl);
  const g=GEARTIER[rank]!==undefined?GEARTIER[rank]:0;
  const wk=o.weapon||S.weapon||cls().w;
  const lit=o.lit===undefined?S.streak>0:o.lit;
  const L=[];

  /* cape first — it hangs behind everything */
  if(g>=3)L.push(\`<g class="hf-cape"><path d="M34 100 Q24 168 30 236 L54 226 L78 236 Q84 168 74 100 Z"
    fill="var(--deepblade)" opacity=".85"/>
    <path d="M54 104 L54 228" stroke="var(--crimson)" stroke-width="1.2" opacity=".5"/></g>\`);

  /* legs */
  L.push(\`<path d="M44 156 L38 214 L36 264 L50 264 L50 212 L54 158 Z" fill="var(--hf-body)"/>
    <path d="M64 156 L72 214 L74 264 L60 264 L58 212 L56 158 Z" fill="var(--hf-body)"/>\`);
  if(g>=3)L.push(\`<path d="M37 210 L51 210 L50 246 L37 246 Z" fill="url(#hfPlate)"/>
    <path d="M59 210 L73 210 L73 246 L60 246 Z" fill="url(#hfPlate)"/>\`);
  /* boots */
  L.push(\`<path d="M34 258 L52 258 L52 272 L32 272 Z" fill="var(--hf-dark)"/>
    <path d="M58 258 L76 258 L78 272 L58 272 Z" fill="var(--hf-dark)"/>\`);

  /* torso, breathing */
  L.push(\`<g class="hf-breathe">
    <path d="M32 98 Q30 128 40 154 L70 154 Q80 128 78 98 Q66 90 55 90 Q44 90 32 98 Z"
      fill="var(--hf-body)"/>\`);
  if(g>=2)L.push(\`<path d="M34 100 Q33 128 42 150 L68 150 Q77 128 76 100 Q66 93 55 93 Q44 93 34 100 Z"
      fill="url(#hfPlate)"/>
    <path d="M55 96 L55 150" stroke="var(--hf-dark)" stroke-width="1.4" opacity=".55"/>\`);
  if(g>=4)L.push(\`<path d="M44 104 L55 116 L66 104 L66 122 L55 132 L44 122 Z"
      fill="var(--core)" opacity=".9"/>\`);
  /* belt */
  if(g>=1)L.push(\`<rect x="38" y="146" width="34" height="9" rx="2" fill="var(--guard)"/>\`);
  if(g>=4)L.push(\`<circle cx="55" cy="150.5" r="4" fill="url(#hfGem)"/>\`);
  L.push('</g>');

  /* arms. the left hangs, the right is up holding the weapon */
  L.push(\`<path d="M32 100 Q24 124 24 148 L34 150 Q34 126 40 104 Z" fill="var(--hf-body)"/>
    <path d="M78 100 Q84 122 80 146 L70 148 Q72 124 68 104 Z" fill="var(--hf-body)"/>\`);
  if(g>=1)L.push(\`<path d="M24 138 L35 140 L34 152 L23 150 Z" fill="url(#hfPlate)"/>
    <path d="M70 136 L81 134 L82 148 L71 148 Z" fill="url(#hfPlate)"/>\`);
  /* pauldrons */
  if(g>=1)L.push(\`<path d="M74 92 Q88 96 86 112 Q78 108 70 104 Z" fill="url(#hfPlate)"/>\`);
  if(g>=3)L.push(\`<path d="M36 92 Q22 96 24 112 Q32 108 40 104 Z" fill="url(#hfPlate)"/>\`);
  if(g>=5)L.push(\`<path d="M86 96 L94 106 L86 114 Z" fill="var(--core)" opacity=".85"/>
    <path d="M24 96 L16 106 L24 114 Z" fill="var(--core)" opacity=".85"/>\`);

  /* head */
  L.push(\`<g class="hf-head">
    <ellipse cx="55" cy="70" rx="15" ry="17" fill="var(--hf-body)"/>\`);
  if(g>=4)L.push(\`<path d="M40 68 Q40 52 55 52 Q70 52 70 68 L70 76 L64 74 L64 64 L46 64 L46 74 L40 76 Z"
      fill="url(#hfPlate)"/>
    <rect x="46" y="66" width="18" height="4" rx="1.5" fill="var(--magenta)" opacity=".9"/>\`);
  else if(g>=2)L.push(\`<path d="M40 66 Q40 54 55 54 Q70 54 70 66 L70 70 L40 70 Z"
      fill="url(#hfPlate)" opacity=".9"/>\`);
  if(g>=5)L.push(\`<path d="M44 50 L50 38 L55 48 L60 38 L66 50 Z" fill="var(--core)"/>\`);
  L.push('</g>');

  /* the weapon, in the fist */
  L.push(\`<g transform="\${HOLD}">\${WEAPONS[wk]||WEAPONS.longsword}</g>\`);

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

/* insert the hunter just before bladeSVG so WEAPONS/WEAPONDEFS are defined */
cut('heroSVG added', 'function bladeSVG(w){', HERO+'\nfunction bladeSVG(w){');

/* ---------- use it ---------- */
cut('hero block shows the hunter', '      ${bladeSVG()}\n', '      ${heroSVG()}\n');
cut('share card shows the hunter',
  '<div class="hc-blade">${bladeSVG()}</div>', '<div class="hc-blade">${heroSVG()}</div>');
/* the vault weapon picker keeps showing the weapon alone — you are choosing a
   weapon there, not admiring your character */

/* ---------- gear line under the aura note ---------- */
cut('gear tier line',
  `      <p class="auranote">\${dead`,
  `      <p class="gearline"><b>\${esc(GEARNAME[GEARTIER[rankOf(S.lvl)]||0])}</b> · rank \${rankOf(S.lvl)} gear\${
        rankOf(S.lvl)==='S'?'':\` · next set at level \${RANK_LV[RANKS[RANKS.indexOf(rankOf(S.lvl))+1]]}\`}</p>
      <p class="auranote">\${dead`);

/* ---------- styling ---------- */
cut('hunter styling',
`.blade-svg{position:relative;height:250px;filter:drop-shadow(0 0 24px rgba(var(--c1),.7))}`,
`.blade-svg{position:relative;height:250px;filter:drop-shadow(0 0 24px rgba(var(--c1),.7))}
/* The hunter. Body tones are deliberately near-black so the armour, which is
   palette-coloured, is the thing that reads as you rank up. */
.hero-svg{position:relative;height:250px;--hf-body:#180C13;--hf-dark:#0C0509;
  filter:drop-shadow(0 0 22px rgba(var(--c1),.55))}
.hero-svg.lit{filter:drop-shadow(0 0 26px rgba(var(--c1),.8))}
.hf-idle{animation:hfIdle 5.6s ease-in-out infinite;transform-origin:55px 264px}
.hf-breathe{animation:hfBreathe 4.2s ease-in-out infinite;transform-origin:55px 150px}
.hf-head{animation:hfHead 6.8s ease-in-out infinite;transform-origin:55px 86px}
.hf-cape{animation:hfCape 7.4s ease-in-out infinite;transform-origin:55px 100px}
@keyframes hfIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}
@keyframes hfBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.028)}}
@keyframes hfHead{0%,100%{transform:rotate(0deg)}30%{transform:rotate(-1.6deg)}
  65%{transform:rotate(1.2deg)}}
@keyframes hfCape{0%,100%{transform:skewX(0deg)}35%{transform:skewX(2.2deg)}
  70%{transform:skewX(-1.6deg)}}
.gearline{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ash2);
  margin:0 0 4px;text-align:center}
.gearline b{color:var(--magenta);font-weight:600}
.hc-blade .hero-svg{height:150px;filter:drop-shadow(0 0 22px rgba(var(--c1),.75))}`);

/* reduced motion already blanks .sigil; extend it to the hunter */
cut('reduced motion',
`  .sigil{animation:none}`,
`  .sigil{animation:none}
  .hf-idle,.hf-breathe,.hf-head,.hf-cape{animation:none}`);

fs.writeFileSync(F,s);
console.log('done');
