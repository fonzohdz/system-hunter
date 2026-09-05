/* Take the Food tab out. Everything it owned goes: the data, the filters, the
   view, the nav button, the router branch, the tour stop and the click
   handlers.

   The saved fields — foodEq, diet, provOpen — are deliberately LEFT in place.
   Nothing reads them any more, they cost a few bytes, and leaving them means a
   revert restores the tab with the user's filter choices still set. Ripping
   preferences out of a live save to tidy up is not worth the risk. */
const fs=require('fs');const F='index.html';let s=fs.readFileSync(F,'utf8');
const cut=(label,a,b)=>{
  const c=s.split(a).length-1;
  if(c!==1){console.log('!! '+label+' matched '+c);process.exit(1)}
  s=s.split(a).join(b===undefined?'':b); console.log('  '+label);
};
const between=(label,from,to)=>{
  const a=s.indexOf(from), b=s.indexOf(to);
  if(a<0||b<0||b<a){console.log('!! '+label+' bounds');process.exit(1)}
  s=s.slice(0,a)+s.slice(b); console.log('  '+label);
};

/* data, filters and helpers */
between('provisions data and helpers',
  '/* ---------------- provisions ----------------',
  '/* ---------------- instant dungeon ----------------');

/* the view */
between('viewProv removed', 'function viewProv(){', 'function viewQuest(){');

/* nav button */
cut('Food tab button',
  `    <button data-tab="prov" class="\${tab==='prov'?'on':''}">Food</button>\n`);

/* router branch */
cut('router branch', `tab==='prov'?viewProv():`);

/* tour stop */
cut('tour stop',
  `\n {sel:'[data-tab="prov"]',t:'Provisions',x:'Food ideas sorted by the situation you are in — a petrol station, a hotel room with a kettle, ten minutes after a long shift. Nothing there tracks anything.'},`);

/* click handlers */
cut('food equipment handler',
`  const fq=t.closest('[data-foodeq]');
  if(fq){const k=fq.dataset.foodeq,i=S.foodEq.indexOf(k);
    i>=0?S.foodEq.splice(i,1):S.foodEq.push(k);save();render();return}
  const dt=t.closest('[data-diet]');
  if(dt){const k=dt.dataset.diet,i=S.diet.indexOf(k);
    i>=0?S.diet.splice(i,1):S.diet.push(k);save();render();return}
  const pv=t.closest('[data-provsec]');
  if(pv){S.provOpen=pv.dataset.provsec;save();render();return}

`);

/* styling */
between('provisions CSS', '/* provisions */', '/* milestones */');

fs.writeFileSync(F,s);
console.log('done');
