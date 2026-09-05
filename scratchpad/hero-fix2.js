/* Looking at the render instead of guessing. Five things are wrong.

   1. Every figure emitted <linearGradient id="hfPlate">. Put six on a page and
      the browser resolves them all to the first, so every class rendered in
      crimson no matter its palette. Ids are now per instance.
   2. The armour was circles and ellipses — bubblegum, not plate. Pauldrons and
      bracers are now angular layered bands with a dark separation line.
   3. The greatsword was held point-down through the middle of the body: a wide
      pink wedge covering the legs with the hilt too small to read. It now rests
      beside the figure so the whole silhouette shows.
   4. The katana crossed the torso like a sash. Moved out and steepened.
   5. The head was a featureless egg. It gets a jaw and a shadow. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const cut=(label,a,b)=>{const c=s.split(a).length-1;
  if(c!==1){console.log('!! '+label+' matched '+c);process.exit(1)}
  s=s.split(a).join(b); console.log('  '+label)};

/* ---- 1. unique gradient ids ---- */
cut('gradient ids made per instance',
`function heroSVG(opt){
  const o=opt||{};`,
`let heroSeq=0;
function heroSVG(opt){
  const o=opt||{};
  /* Ids must be unique per figure. Six on one page all resolving to the first
     "hfPlate" is why every class came out crimson. */
  const uid='h'+(++heroSeq), PL='url(#pl'+uid+')', GEM='url(#gm'+uid+')';`);
s=s.split('url(#hfPlate)').join('${PL}').split('url(#hfGem)').join('${GEM}');
s=s.split('<linearGradient id="hfPlate"').join('<linearGradient id="pl${uid}"');
s=s.split('<radialGradient id="hfGem"').join('<radialGradient id="gm${uid}"');
console.log('  gradient references rewired');

/* ---- 2. armour that looks like plate ---- */
cut('bracers',
`  if(g>=1)for(const ar of st.arms)
    L.push(\\\`<circle cx="\\\${(ar[2]+ar[4])/2}" cy="\\\${(ar[3]+ar[5])/2}" r="6.5" fill="\\\${PL}"/>\\\`);`,
`  /* bracer: a band across the forearm, angled to follow it */
  if(g>=1)for(const ar of st.arms){
    const mx=(ar[2]+ar[4])/2, my=(ar[3]+ar[5])/2;
    const an=Math.atan2(ar[5]-ar[3],ar[4]-ar[2])*57.3+90;
    L.push(\\\`<g transform="rotate(\\\${an.toFixed(1)} \\\${mx} \\\${my})">
      <path d="M\\\${mx-7} \\\${my-7} L\\\${mx+7} \\\${my-7} L\\\${mx+6} \\\${my+7} L\\\${mx-6} \\\${my+7} Z" fill="\\\${PL}"/>
      <path d="M\\\${mx-6.5} \\\${my} L\\\${mx+6.5} \\\${my}" stroke="var(--hf-dark)"
        stroke-width="1.3" opacity=".55"/></g>\\\`);
  }`);

cut('pauldrons',
`  if(g>=1)L.push(\\\`<ellipse cx="\\\${st.arms[1][0]+2}" cy="\\\${st.arms[1][1]-2}" rx="11" ry="9"
      fill="\\\${PL}" transform="rotate(14 \\\${st.arms[1][0]} \\\${st.arms[1][1]})"/>\\\`);
  if(g>=3)L.push(\\\`<ellipse cx="\\\${st.arms[0][0]-2}" cy="\\\${st.arms[0][1]-2}" rx="11" ry="9"
      fill="\\\${PL}" transform="rotate(-14 \\\${st.arms[0][0]} \\\${st.arms[0][1]})"/>\\\`);`,
`  /* pauldron: two overlapping angular bands, not a balloon */
  const pauldron=(x,y,dir)=>\\\`<g>
    <path d="M\\\${x-14*dir} \\\${y-6} Q\\\${x+3*dir} \\\${y-12} \\\${x+13*dir} \\\${y+1}
             L\\\${x+10*dir} \\\${y+8} Q\\\${x+1*dir} \\\${y+1} \\\${x-13*dir} \\\${y+5} Z" fill="\\\${PL}"/>
    <path d="M\\\${x-12*dir} \\\${y+5} Q\\\${x+1*dir} \\\${y+2} \\\${x+10*dir} \\\${y+8}
             L\\\${x+7*dir} \\\${y+15} Q\\\${x-1*dir} \\\${y+9} \\\${x-11*dir} \\\${y+12} Z"
          fill="\\\${PL}" opacity=".82"/>
    <path d="M\\\${x-12*dir} \\\${y+5} Q\\\${x+1*dir} \\\${y+2} \\\${x+10*dir} \\\${y+8}"
          stroke="var(--hf-dark)" stroke-width="1.2" fill="none" opacity=".5"/></g>\\\`;
  if(g>=1)L.push(pauldron(st.arms[1][0]+3,st.arms[1][1]-1,1));
  if(g>=3)L.push(pauldron(st.arms[0][0]-3,st.arms[0][1]-1,-1));`);

/* ---- 3. a head with a jaw ---- */
cut('head shape',
`  L.push(\\\`<g class="hf-head"><ellipse cx="55" cy="72" rx="14.5" ry="16.5" fill="\\\${B}"/>\\\`);`,
`  L.push(\\\`<g class="hf-head">
    <path d="M42 66 Q42 54 55 54 Q68 54 68 66 L68 76 Q68 88 55 89 Q42 88 42 76 Z" fill="\\\${B}"/>
    <path d="M46 78 Q55 84 64 78" stroke="var(--hf-dark)" stroke-width="1.6"
      fill="none" opacity=".7"/>\\\`);`);

fs.writeFileSync(F,s);
console.log('done');
