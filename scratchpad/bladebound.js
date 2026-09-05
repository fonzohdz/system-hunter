/* BLADEBOUND — six ranks, six drawings. Prototype only; touches nothing.

   Rebuilt after looking at the first pass, which had three killers: the tassets
   flared into a bell skirt, the shoulders were narrower than the hips, and the
   arms were drawn in the torso's own colour so they disappeared into it. The
   result read as a figure in a dress rather than a swordsman.

   Fixed by inverting the proportions — shoulders now start wider than the hips
   and keep growing, the waist stays narrow, and the coat is two narrow split
   panels that hang rather than a skirt that flares. Arms are drawn last, in a
   lighter tone, clear of the torso outline.

   The arc: a lone swordsman whose bond with the blade deepens until the blade
   is doing as much of the standing as he is.

     E  narrow column, plain sword hanging point-down at the side
     D  sword crosses the body in a low guard; first plate on the sword shoulder
     C  arms close into a diamond around a sword planted dead centre
     B  asymmetric — blade up over the shoulder, coat sweeping the other way
     A  a long horizontal: sword extended in challenge, stance dropped wide
     S  a fan of blades behind him; the silhouette becomes wings */
const fs=require('fs');

const C={core:'#FFF0F5',mag:'#FF3D7F',crim:'#E8114F',deep:'#7A0A2C',
         guard:'#4A1020',grip:'#241016',pom:'#5C1226'};
/* Body reads as warm charcoal against the app's #0A0509, not black on black.
   Arms are a step lighter again so they separate from the chest. */
const BODY='#3A2A33', ARM='#4C3742', CLOTH='#221820', BOOT='#191016';
const RIM='rgba(255,196,220,.42)', SEAM='rgba(0,0,0,.45)';

const defs=u=>`<defs>
  <linearGradient id="st${u}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${C.core}"/><stop offset="24%" stop-color="${C.mag}"/>
    <stop offset="100%" stop-color="${C.crim}"/></linearGradient>
  <linearGradient id="bl${u}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${C.deep}"/><stop offset="38%" stop-color="${C.core}"/>
    <stop offset="56%" stop-color="${C.mag}"/><stop offset="100%" stop-color="${C.crim}"/></linearGradient>
  <linearGradient id="co${u}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${CLOTH}"/><stop offset="100%" stop-color="#120C10"/></linearGradient>
</defs>`;

/* small builders — shape helpers, not a shared body */
const arm=(d,w=13)=>`<path d="${d}" fill="none" stroke="${ARM}" stroke-width="${w}"/>
  <path d="${d}" fill="none" stroke="${RIM}" stroke-width="1.4"/>`;
const fist=(x,y,r=6.4)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${ARM}" stroke="${RIM}" stroke-width="1.3"/>`;
const leg=(d)=>`<path d="${d}" fill="${CLOTH}" stroke="${RIM}" stroke-width="1.5"/>`;
const boot=(x,y,dir)=>`<path d="M${x-9*dir} ${y-8} L${x+5*dir} ${y-9} L${x+13*dir} ${y+2}
  L${x+12*dir} ${y+8} L${x-9*dir} ${y+8} Z" fill="${BOOT}" stroke="${RIM}" stroke-width="1.2"/>`;
/* a head with an actual hairline, so it is not a bald egg */
const head=(cy,gear,U,rx=14.5,ry=16.5)=>`
  <path d="M${55-rx} ${cy} Q${55-rx} ${cy-ry} 55 ${cy-ry} Q${55+rx} ${cy-ry} ${55+rx} ${cy}
     Q${55+rx} ${cy+ry*0.8} ${55+rx*0.5} ${cy+ry} Q55 ${cy+ry*1.15} ${55-rx*0.5} ${cy+ry}
     Q${55-rx} ${cy+ry*0.8} ${55-rx} ${cy} Z" fill="${BODY}" stroke="${RIM}" stroke-width="1.5"/>
  <path d="M${55-rx-1} ${cy-2} Q${55-rx+2} ${cy-ry-4} 55 ${cy-ry-3}
     Q${55+rx-1} ${cy-ry-3} ${55+rx+1} ${cy-4} Q${55+rx-3} ${cy-ry+2} 55 ${cy-ry+3}
     Q${55-rx+3} ${cy-ry+2} ${55-rx-1} ${cy-2} Z" fill="#1A1218"/>
  ${gear==='band'?`<path d="M${55-rx-1} ${cy-5} L${55+rx+1} ${cy-5} L${55+rx+1} ${cy+1}
      L${55-rx-1} ${cy+1} Z" fill="#3A2028" stroke="${RIM}" stroke-width="1"/>`:''}
  ${gear==='halfhelm'?`<path d="M${55-rx-1} ${cy-1} Q${55-rx-1} ${cy-ry-3} 55 ${cy-ry-3}
      Q${55+rx+1} ${cy-ry-3} ${55+rx+1} ${cy-1} L${55+rx+1} ${cy+4} L${55-rx-1} ${cy+4} Z"
      fill="url(#st${U})" stroke="${RIM}" stroke-width="1.2"/>
    <path d="M53 ${cy+2} L57 ${cy+2} L57 ${cy+ry-2} L53 ${cy+ry-2} Z" fill="url(#st${U})"/>`:''}
  ${gear==='visor'?`<path d="M${55-rx-1} ${cy+2} Q${55-rx-1} ${cy-ry-4} 55 ${cy-ry-4}
      Q${55+rx+1} ${cy-ry-4} ${55+rx+1} ${cy+2} L${55+rx+1} ${cy+ry-2} L${55-rx-1} ${cy+ry-2} Z"
      fill="url(#st${U})" stroke="${RIM}" stroke-width="1.3"/>
    <path d="M${55-rx+2} ${cy-1} L${55+rx-2} ${cy-1} L${55+rx-2} ${cy+4} L${55-rx+2} ${cy+4} Z"
      fill="#120A0E"/>`:''}
  ${gear==='crest'?`<path d="M${55-rx-1} ${cy+2} Q${55-rx-1} ${cy-ry-4} 55 ${cy-ry-4}
      Q${55+rx+1} ${cy-ry-4} ${55+rx+1} ${cy+2} L${55+rx+1} ${cy+ry-2} L${55-rx-1} ${cy+ry-2} Z"
      fill="url(#st${U})" stroke="${RIM}" stroke-width="1.3"/>
    <path d="M${55-rx+2} ${cy-1} L${55+rx-2} ${cy-1} L${55+rx-2} ${cy+4} L${55-rx+2} ${cy+4} Z"
      fill="#120A0E"/>
    <path d="M50 ${cy-ry-4} Q55 ${cy-ry-22} 60 ${cy-ry-4} Z" fill="${C.core}" opacity=".9"/>`:''}
  ${gear==='circlet'?`<path d="M${55-rx-1} ${cy+2} Q${55-rx-1} ${cy-ry-4} 55 ${cy-ry-4}
      Q${55+rx+1} ${cy-ry-4} ${55+rx+1} ${cy+2} L${55+rx+1} ${cy+ry-2} L${55-rx-1} ${cy+ry-2} Z"
      fill="url(#st${U})" stroke="${RIM}" stroke-width="1.3"/>
    <path d="M${55-rx+2} ${cy-1} L${55+rx-2} ${cy-1} L${55+rx-2} ${cy+4} L${55-rx+2} ${cy+4} Z"
      fill="#120A0E"/>
    <path d="M${55-rx-4} ${cy-6} Q55 ${cy-ry-16} ${55+rx+4} ${cy-6}
      Q55 ${cy-ry-6} ${55-rx-4} ${cy-6} Z" fill="${C.core}" opacity=".85"/>`:''}`;

/* ---------- E · INITIATE ----------
   Shirt, belt, blade. Shoulders already wider than the hips so it reads male;
   feet close, arms in, one straight line of steel down the right. */
const E=`
 ${leg('M46 148 L45 208 L43 264 L54 264 L55 208 L55 148 Z')}
 ${leg('M59 148 L59 208 L61 264 L72 264 L70 208 L68 148 Z')}
 ${boot(47,266,-1)} ${boot(67,266,1)}
 <path d="M35 68 Q55 60 75 68 L72 112 Q70 136 66 148 L44 148 Q40 136 38 112 Z"
   fill="${BODY}" stroke="${RIM}" stroke-width="1.6"/>
 <path d="M50 58 L60 58 L61 72 L49 72 Z" fill="${BODY}" stroke="${RIM}" stroke-width="1.2"/>
 <path d="M39 140 L71 140 L70 150 L40 150 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.2"/>
 ${head(38,'bare','E')}
 ${arm('M38 74 L32 104 L36 132')}
 ${fist(36,134)}
 ${arm('M72 74 L80 100 L82 124')}
 <path d="M79 106 L87 106 L87 122 L79 122 Z" fill="${C.grip}" stroke="${RIM}" stroke-width="1"/>
 <circle cx="83" cy="103" r="4.2" fill="${C.pom}" stroke="${RIM}" stroke-width="1"/>
 <path d="M74 122 L92 122 L91 129 L75 129 Z" fill="${C.guard}"/>
 <path d="M79 129 L87 129 L85 238 L83 252 L81 238 Z" fill="url(#blE)"/>
 ${fist(83,124)}`;

/* ---------- D · SWORDBEARER ----------
   The sword comes up across the body into a low guard: a hard diagonal through
   the middle where E had nothing. First plate lands on the sword shoulder, and
   two narrow coat panels hang at the front — panels, not a skirt. */
const D=`
 ${leg('M46 150 L45 210 L43 264 L54 264 L55 210 L55 150 Z')}
 ${leg('M59 150 L59 210 L61 264 L72 264 L70 210 L68 150 Z')}
 ${boot(47,266,-1)} ${boot(67,266,1)}
 <path d="M43 146 L54 146 L53 196 L44 196 Z" fill="url(#coD)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M60 146 L71 146 L70 196 L61 196 Z" fill="url(#coD)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M33 66 Q55 57 77 66 L74 110 Q72 136 68 150 L42 150 Q38 136 36 110 Z"
   fill="${BODY}" stroke="${RIM}" stroke-width="1.6"/>
 <path d="M43 66 L67 66 L66 86 L44 86 Z" fill="#2C1E26"/>
 <path d="M50 56 L60 56 L61 70 L49 70 Z" fill="${BODY}" stroke="${RIM}" stroke-width="1.2"/>
 <path d="M38 142 L72 142 L71 152 L39 152 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.2"/>
 ${head(36,'band','D')}
 <path d="M70 60 Q86 66 84 84 Q75 76 66 72 Z" fill="url(#stD)" stroke="${RIM}" stroke-width="1.2"/>
 ${arm('M38 72 L30 98 L44 116')}
 ${arm('M74 74 L82 96 L74 118')}
 <path d="M70 112 L80 118 L76 126 L66 120 Z" fill="${C.grip}"/>
 <circle cx="79" cy="126" r="4" fill="${C.pom}"/>
 <path d="M62 104 L74 112 L70 120 L58 112 Z" fill="${C.guard}"/>
 <path d="M60 108 L66 100 L22 62 L16 72 Z" fill="url(#blD)"/>
 ${fist(74,117)} ${fist(45,116)}`;

/* ---------- C · BLADESWORN ----------
   Symmetry, for the first and last time. Sword planted dead centre, both fists
   on the grip, arms closing a diamond. Cuirass and gorget arrive together so
   the chest becomes plate rather than cloth. */
const Cr=`
 ${leg('M46 152 L45 212 L43 264 L54 264 L55 212 L55 152 Z')}
 ${leg('M59 152 L59 212 L61 264 L72 264 L70 212 L68 152 Z')}
 ${boot(46,266,-1)} ${boot(68,266,1)}
 <path d="M41 148 L53 148 L52 202 L42 202 Z" fill="url(#coC)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M61 148 L73 148 L72 202 L62 202 Z" fill="url(#coC)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M30 64 Q55 54 80 64 L77 108 Q74 136 70 152 L40 152 Q36 136 33 108 Z"
   fill="${BODY}" stroke="${RIM}" stroke-width="1.6"/>
 <path d="M34 68 Q55 58 76 68 L73 104 Q70 126 66 142 L44 142 Q40 126 37 104 Z"
   fill="url(#stC)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M42 88 L68 88 M43 104 L67 104" stroke="${SEAM}" stroke-width="2.2"/>
 <path d="M55 68 L55 142" stroke="${SEAM}" stroke-width="2"/>
 <path d="M44 50 L66 50 L70 66 L40 66 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M36 144 L74 144 L73 155 L37 155 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.2"/>
 ${head(34,'halfhelm','C')}
 <path d="M74 60 Q88 66 87 82 Q78 74 70 70 Z" fill="url(#stC)" stroke="${RIM}" stroke-width="1.2"/>
 <path d="M36 60 Q22 66 23 82 Q32 74 40 70 Z" fill="url(#stC)" stroke="${RIM}" stroke-width="1.2"/>
 ${arm('M34 74 L26 102 L44 124')}
 ${arm('M76 74 L84 102 L66 124')}
 <path d="M51 92 L59 92 L59 122 L51 122 Z" fill="${C.grip}"/>
 <circle cx="55" cy="88" r="5" fill="${C.pom}" stroke="${RIM}" stroke-width="1"/>
 <path d="M40 122 L70 122 L68 130 L42 130 Z" fill="${C.guard}"/>
 <path d="M48 130 L62 130 L58 244 L55 258 L52 244 Z" fill="url(#blC)"/>
 ${fist(45,124)} ${fist(65,124)}`;

/* ---------- B · BLADE KNIGHT ----------
   The break. Blade rides up over the right shoulder on a steep diagonal and a
   single coat tail sweeps the opposite way, so the outline is a slash. Nothing
   about this shape is symmetrical. */
const Bk=`
 <path d="M44 150 Q24 200 12 262 L32 268 Q44 208 54 158 Z" fill="url(#coB)" stroke="${RIM}" stroke-width="1.5"/>
 ${leg('M46 152 L45 212 L43 264 L54 264 L55 212 L55 152 Z')}
 ${leg('M61 152 L63 212 L67 264 L78 264 L74 212 L70 152 Z')}
 ${boot(46,266,-1)} ${boot(72,266,1)}
 <path d="M61 148 L73 148 L74 200 L63 200 Z" fill="url(#coB)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M28 62 Q55 51 82 62 L79 106 Q76 136 71 152 L39 152 Q34 136 31 106 Z"
   fill="${BODY}" stroke="${RIM}" stroke-width="1.6"/>
 <path d="M32 66 Q55 55 78 66 L75 102 Q72 126 67 142 L43 142 Q38 126 35 102 Z"
   fill="url(#stB)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M55 66 L55 142 M41 86 L69 86 M42 104 L68 104" stroke="${SEAM}" stroke-width="2.2"/>
 <path d="M44 46 L66 46 L71 64 L39 64 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M34 144 L76 144 L75 156 L35 156 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.2"/>
 ${head(32,'visor','B')}
 <path d="M76 54 Q92 61 90 80 Q80 72 70 66 Z" fill="url(#stB)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M75 78 Q90 86 88 100 Q80 92 70 88 Z" fill="url(#stB)" opacity=".85"/>
 <path d="M34 56 Q18 63 20 80 Q30 72 40 68 Z" fill="url(#stB)" stroke="${RIM}" stroke-width="1.2"/>
 ${arm('M32 72 L22 100 L28 128')}
 ${fist(28,130)}
 ${arm('M78 72 L88 88 L84 106')}
 <path d="M78 96 L90 88 L100 102 L88 110 Z" fill="${C.grip}"/>
 <circle cx="97" cy="108" r="4.5" fill="${C.pom}"/>
 <path d="M72 84 L84 76 L94 90 L82 98 Z" fill="${C.guard}"/>
 <path d="M76 78 L86 70 L46 10 L38 18 Z" fill="url(#blB)"/>
 ${fist(84,92,6)}`;

/* ---------- A · SWORD MASTER ----------
   En garde. Four vertical silhouettes have come before, so this one is a long
   horizontal: sword out at full extension to the left, stance dropped wide and
   low, coat split into two tails that trail behind the legs. */
const Am=`
 <path d="M50 150 Q32 196 18 254 L36 262 Q48 206 58 158 Z" fill="url(#coA)" stroke="${RIM}" stroke-width="1.5"/>
 <path d="M62 150 Q82 196 94 254 L76 262 Q66 206 58 158 Z" fill="url(#coA)" stroke="${RIM}" stroke-width="1.5"/>
 ${leg('M44 152 L34 208 L26 262 L40 266 L48 212 L54 156 Z')}
 ${leg('M66 152 L76 208 L84 262 L70 266 L62 212 L58 156 Z')}
 ${boot(32,264,-1)} ${boot(80,264,1)}
 <path d="M28 60 Q55 48 82 60 L79 104 Q76 134 71 152 L39 152 Q34 134 31 104 Z"
   fill="${BODY}" stroke="${RIM}" stroke-width="1.6"/>
 <path d="M32 64 Q55 52 78 64 L75 100 Q72 124 67 142 L43 142 Q38 124 35 100 Z"
   fill="url(#stA)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M55 64 L55 142 M40 84 L70 84 M41 102 L69 102 M43 120 L67 120"
   stroke="${SEAM}" stroke-width="2.2"/>
 <path d="M43 42 L67 42 L72 62 L38 62 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M33 144 L77 144 L76 156 L34 156 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.2"/>
 ${head(30,'crest','A')}
 <path d="M78 50 Q96 59 93 80 Q82 70 72 64 Z" fill="url(#stA)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M32 50 Q14 59 17 80 Q28 70 38 64 Z" fill="url(#stA)" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M77 80 Q92 89 89 104 Q80 96 70 90 Z" fill="url(#stA)" opacity=".85"/>
 ${arm('M30 72 L20 96 L28 120')}
 ${fist(28,122)}
 ${arm('M80 70 L93 76 L105 80')}
 <path d="M96 73 L107 77 L104 86 L93 82 Z" fill="${C.grip}"/>
 <circle cx="109" cy="80" r="4.2" fill="${C.pom}"/>
 <path d="M87 76 L96 79 L94 89 L85 86 Z" fill="${C.guard}"/>
 <path d="M85 79 L87 88 L12 74 L14 64 Z" fill="url(#blA)"/>
 ${fist(91,82,6)}`;

/* ---------- S · SWORD SAINT ----------
   Five blades hang in the air behind him in a fan and his own hangs reversed
   and quiet. The silhouette stops being a man with a sword and becomes a shape
   with wings. No crown, no cape — the blades are the crown. */
const Ss=`
 <g>
  <path d="M52 118 L60 118 L12 46 L2 56 Z" fill="url(#blS)" opacity=".55"/>
  <path d="M52 118 L60 118 L25 8 L12 14 Z" fill="url(#blS)" opacity=".82"/>
  <path d="M52 118 L60 118 L87 8 L100 14 Z" fill="url(#blS)" opacity=".82"/>
  <path d="M52 118 L60 118 L108 46 L118 56 Z" fill="url(#blS)" opacity=".55"/>
 </g>
 <path d="M44 148 Q22 198 10 262 L30 268 Q42 206 54 156 Z" fill="url(#coS)" stroke="${RIM}" stroke-width="1.5"/>
 <path d="M66 148 Q88 198 100 262 L80 268 Q68 206 56 156 Z" fill="url(#coS)" stroke="${RIM}" stroke-width="1.5"/>
 ${leg('M46 152 L45 212 L43 264 L54 264 L55 212 L55 152 Z')}
 ${leg('M59 152 L59 212 L61 264 L72 264 L70 212 L68 152 Z')}
 ${boot(46,266,-1)} ${boot(68,266,1)}
 <path d="M26 60 Q55 47 84 60 L81 104 Q78 136 72 152 L38 152 Q32 136 29 104 Z"
   fill="${BODY}" stroke="${RIM}" stroke-width="1.6"/>
 <path d="M30 64 Q55 51 80 64 L77 100 Q74 126 68 144 L42 144 Q36 126 33 100 Z"
   fill="url(#stS)" stroke="${RIM}" stroke-width="1.4"/>
 <path d="M55 58 L42 82 L55 100 L68 82 Z" fill="${C.core}"/>
 <path d="M55 68 L49 82 L55 94 L61 82 Z" fill="${C.crim}"/>
 <path d="M40 112 L70 112 M42 128 L68 128" stroke="${SEAM}" stroke-width="2.2"/>
 <path d="M42 40 L68 40 L74 60 L36 60 Z" fill="#3A2028" stroke="${RIM}" stroke-width="1.3"/>
 <path d="M31 146 L79 146 L78 158 L32 158 Z" fill="${C.guard}" stroke="${RIM}" stroke-width="1.2"/>
 ${head(28,'circlet','S')}
 <path d="M42 26 L68 26 L68 33 L42 33 Z" fill="${C.mag}" opacity=".92"/>
 <path d="M80 48 Q100 58 96 82 Q84 70 74 62 Z" fill="url(#stS)" stroke="${RIM}" stroke-width="1.4"/>
 <path d="M30 48 Q10 58 14 82 Q26 70 36 62 Z" fill="url(#stS)" stroke="${RIM}" stroke-width="1.4"/>
 <path d="M79 80 Q97 91 93 106 Q84 96 72 90 Z" fill="url(#stS)" opacity=".85"/>
 <path d="M31 80 Q13 91 17 106 Q26 96 38 90 Z" fill="url(#stS)" opacity=".85"/>
 ${arm('M80 74 L90 102 L82 128')}
 ${fist(82,130)}
 ${arm('M30 74 L20 102 L28 128')}
 ${fist(28,130)}
 <path d="M78 134 L86 134 L86 150 L78 150 Z" fill="${C.grip}"/>
 <path d="M73 150 L91 150 L90 157 L74 157 Z" fill="${C.guard}"/>
 <path d="M78 157 L86 157 L84 234 L82 246 L80 234 Z" fill="url(#blS)"/>`;

const RANKS=[['E','Initiate',E],['D','Swordbearer',D],['C','Bladesworn',Cr],
             ['B','Blade Knight',Bk],['A','Sword Master',Am],['S','Sword Saint',Ss]];
const wrap=(u,inner)=>`<svg viewBox="0 0 120 300" class="fig">${defs(u)}
  <g stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
const cells=m=>RANKS.map(([r,n,art])=>
  `<figure class="${m}"><div class="stage">${wrap(r,art)}</div>
   <figcaption><b>${r}</b> ${n}</figcaption></figure>`).join('');

fs.writeFileSync(process.argv[2],`<meta charset="utf-8">
<title>Bladebound — rank progression</title><style>
body{margin:0;background:#0b0d12;color:#e8ecf5;padding:20px;
 font:13px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
h1{font-size:19px;margin:0 0 6px}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#8a93a8;
 margin:26px 0 10px;border-bottom:1px solid #2a3140;padding-bottom:6px}
p.lead{color:#8a93a8;max-width:78ch;margin:0 0 10px}
.row{display:flex;gap:10px;flex-wrap:wrap}
figure{margin:0;background:radial-gradient(70% 58% at 50% 44%,rgba(255,61,127,.10),transparent 72%),
 linear-gradient(180deg,#0A0509,#020102);border:1px solid #2a3140;border-radius:10px;
 padding:10px 6px 8px;text-align:center;flex:1 1 168px}
.stage{height:252px;display:grid;place-items:center}
.fig{height:252px;width:auto;display:block;filter:drop-shadow(0 0 16px rgba(232,17,79,.4))}
figcaption{font-size:10.5px;color:#8a93a8;margin-top:7px}
figcaption b{color:#e8ecf5;font-size:12px;margin-right:4px}
figure.sil{background:#070406}
figure.sil .fig *{fill:#C9CFE0!important;stroke:#C9CFE0!important;stroke-width:0!important}
figure.sil .fig{filter:none}
.small .stage{height:66px}.small .fig{height:66px;filter:none}
</style>
<h1>Bladebound — six ranks, six drawings</h1>
<p class="lead">No shared base body, no shared armour kit, no accessories layered on a
mannequin. Each rank is drawn as its own figure with the sword composed into the pose,
not transformed into a fist afterwards. Shoulders widen and the waist stays narrow at
every step, so the frame itself grows rather than just collecting parts.</p>
<h2>At production size</h2>
<div class="row">${cells('')}</div>
<h2>Silhouette test — flat shapes only</h2>
<p class="lead">The real test. If two of these read the same with colour gone, the
progression has failed.</p>
<div class="row">${cells('sil')}</div>
<h2>At card size</h2>
<div class="row">${cells('small')}</div>`,'utf8');
console.log('wrote '+process.argv[2]);
