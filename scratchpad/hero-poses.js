/* Three fixes.

   1. Every class was using one HOLD transform, so the daggers — which are a
      pre-crossed PAIR — got scaled into a single fist, and so did the gauntlets.
      Each class now has its own stance: where the feet go, where the arms go,
      and how many weapons there are.
   2. The katana was a narrow rounded shaft with a diamond guard. Redrawn with a
      proper wide curved blade, an angled kissaki, an oval tsuba and a wrapped
      tsuka.
   3. The gauntlet was a rectangle with four dots. Redrawn as an actual armoured
      fist: knuckle domes, a thumb, and a flared cuff.

   Limbs are round-capped strokes rather than polygons, which is both easier to
   pose and reads better than the blocky shapes did. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const cut=(label,a,b)=>{const c=s.split(a).length-1;
  if(c!==1){console.log('!! '+label+' matched '+c);process.exit(1)}
  s=s.split(a).join(b); console.log('  '+label)};

/* ---------- katana ---------- */
const kStart=s.indexOf(' katana:`');
const kEnd=s.indexOf('`,', s.indexOf('<rect x="43" y="283"'))+2;
if(kStart<0||kEnd<2){console.log('!! katana bounds');process.exit(1)}
s=s.slice(0,kStart)+` katana:\`
  <path d="M47 206 C50 140 60 76 74 28 L84 33 C70 80 61 142 59 206 Z" fill="url(#edgeX)"/>
  <path d="M74 28 L84 33 L80 20 Z" fill="var(--core)" opacity=".9"/>
  <path d="M52 204 C55 140 64 78 77 32" fill="none" stroke="var(--core)"
        stroke-width="1.2" opacity=".38"/>
  <ellipse cx="53" cy="212" rx="17" ry="5.5" fill="var(--guard)"/>
  <ellipse cx="53" cy="212" rx="8" ry="3" fill="var(--pommel)"/>
  <rect x="45" y="216" width="16" height="60" rx="3" fill="var(--grip)"/>
  <g fill="var(--guard)">
    <path d="M53 220 L60 227 L53 234 L46 227 Z"/>
    <path d="M53 236 L60 243 L53 250 L46 243 Z"/>
    <path d="M53 252 L60 259 L53 266 L46 259 Z"/></g>
  <rect x="44" y="272" width="18" height="7" rx="2" fill="var(--pommel)"/>\`,`
  +s.slice(kEnd);
console.log('  katana redrawn');

/* ---------- one dagger, one gauntlet, reusable ---------- */
cut('single dagger and gauntlet extracted',
` /* two short blades crossed */
 daggers:(()=>{`,
` /* One dagger. The Stalker carries two, one per hand, so this is the unit. */
 dagger1:\`
   <path d="M60 44 L71 100 L71 176 L60 190 L49 176 L49 100 Z" fill="url(#edge)"/>
   <rect x="58" y="98" width="4" height="76" fill="url(#fuller)"/>
   <path d="M38 178 L82 178 L77 189 L43 189 Z" fill="var(--guard)"/>
   <rect x="53" y="189" width="14" height="42" rx="3" fill="var(--grip)"/>
   <rect x="53" y="199" width="14" height="3" fill="var(--guard)"/>
   <rect x="53" y="213" width="14" height="3" fill="var(--guard)"/>
   <circle cx="60" cy="238" r="8" fill="var(--pommel)"/>
   <circle cx="60" cy="238" r="3.5" fill="var(--magenta)"/>\`,

 /* One armoured fist: knuckle domes, a thumb, a flared cuff. The old one was a
    rectangle with four dots on it. */
 gauntlet1:\`
   <path d="M48 126 Q48 115 59 113 L73 113 Q83 116 83 128 L83 151 Q83 161 71 161
            L59 161 Q48 161 48 150 Z" fill="url(#edge)"/>
   <g fill="var(--core)" opacity=".5">
     <circle cx="55" cy="124" r="4.2"/><circle cx="64" cy="120" r="4.8"/>
     <circle cx="73" cy="121" r="4.6"/><circle cx="81" cy="127" r="3.6"/></g>
   <path d="M46 133 Q36 137 38 148 Q40 157 49 155" fill="none"
         stroke="var(--guard)" stroke-width="8.5" stroke-linecap="round"/>
   <path d="M52 140 L79 138" stroke="var(--deepblade)" stroke-width="2" opacity=".55"/>
   <path d="M47 161 L84 161 L89 189 L42 189 Z" fill="var(--guard)"/>
   <path d="M42 189 L89 189 L91 199 L40 199 Z" fill="var(--pommel)"/>
   <path d="M54 168 L78 167" stroke="var(--core)" stroke-width="1.3" opacity=".3"/>\`,

 /* two short blades crossed — kept for the Vault weapon picker */
 daggers:(()=>{`);

fs.writeFileSync(F,s);
console.log('weapon art updated');
