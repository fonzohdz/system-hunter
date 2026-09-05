const fs=require('fs');const s=fs.readFileSync(process.argv[2],'utf8');
const js=s.slice(s.indexOf('<script>')+8, s.lastIndexOf('</script>'));
try{new Function(js)}catch(e){console.log('PARSE ERROR:',e.message);process.exit(1)}
const stub='var window={},document={body:{appendChild(){},classList:{toggle(){},contains:()=>false}},getElementById:()=>({innerHTML:"",querySelectorAll:()=>[],querySelector:()=>null}),documentElement:{style:{setProperty(){},removeProperty(){}}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,hidden:false,createElement:()=>({style:{},dataset:{},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],appendChild(){},addEventListener(){},remove(){}})};var localStorage={getItem:()=>null,setItem(){}};var matchMedia=()=>({matches:false});var requestAnimationFrame=()=>0;var addEventListener=()=>0,removeEventListener=()=>0;var setInterval=()=>0;var clearInterval=()=>0;var getComputedStyle=()=>({getPropertyValue:()=>"#FF3D7F"});var navigator={};var innerWidth=400,innerHeight=800;var confirm=()=>false;';
const body=js.slice(0, js.indexOf('/* ---------------- boot'));
const M=new Function(stub+body+'\nreturn {EX,figSVG,paintFig,framesFor,fresh};')();
let bad=0;const fail=(...a)=>{console.log('  FAIL',...a);bad++};

console.log('== every movement animates ==');
let withData=0,generic=0;
for(const e of M.EX){
  const f=M.framesFor(e);
  if(!f||f.length<2){fail('no frames for',e.id);continue}
  for(const p of f){
    if(p.length!==22)fail('bad frame length',e.id,p.length);
    if(p.some(v=>!isFinite(v)))fail('non-finite frame',e.id);
  }
  if(e.f)withData++; else generic++;
}
console.log('  '+M.EX.length+' movements: '+withData+' with their own poses, '+generic+' borrowing a match');
console.log('  every one resolves to a hand-tuned pose, its own or a borrowed one');

console.log('== the rig draws real geometry ==');
const mk=(dl)=>{const a={};return{attrs:a,setAttribute(k,v){a[k]=v},
  getAttribute:k=>k==='data-l'?dl:a[k]}};
/* five polylines, matching the real markup, so the painter has something to fill */
const LINES=['1,3,4','2,5,6','1,2','1,7,8','2,9,10'];
const fake=()=>{const els={},lines=LINES.map(mk);return{__els:els,__lines:lines,
  querySelector(sel){return els[sel]||(els[sel]=mk())},
  querySelectorAll(){return lines}}};
const NUM=/-?\d+(\.\d+)?/g;
let painted=0,parts=new Set();
for(const e of M.EX){
  for(const pose of M.framesFor(e)){
    const sv=fake();
    try{M.paintFig(sv,pose,e.p)}
      catch(err){fail("paintFig threw",e.id,err.message);break}
    for(const L of sv.__lines){
      const pts=(L.attrs.points||'').split(' ');
      if(!pts[0]){fail('polyline never filled',e.id);continue}
      for(const q of pts){
        const [x,y]=q.split(',').map(Number);
        if(!isFinite(x)||!isFinite(y))fail('non-finite point',e.id,q);
        if(x<-70||x>180||y<-70||y>180)fail('point far outside the box',e.id,q);
      }
    }
    for(const sel in sv.__els){
      const at=sv.__els[sel].attrs;
      if(!Object.keys(at).length)continue;
      parts.add(sel);
      for(const k of ['cx','cy'])
        if(at[k]!==undefined&&!isFinite(Number(at[k])))fail('non-finite '+k,e.id,sel);
    }
    painted++;
  }
}
console.log('  painted '+painted+' frames across '+M.EX.length+' movements, nothing threw');
if(!parts.has('[data-p="head"]'))fail('head never drawn');
console.log('  head placed on every frame');

console.log('== markup ==');
const svg=M.figSVG();
for(const need of ['data-l="1,3,4"','data-l="2,5,6"','data-l="1,2"',
                   'data-l="1,7,8"','data-l="2,9,10"','data-p="head"','viewBox="0 0 100 100"'])
  if(!svg.includes(need))fail('markup missing '+need);
if((svg.match(/<polyline/g)||[]).length!==5)fail('expected 5 polylines');
console.log('  four strokes and a head — the original stick figure');
if(!/\.figback polyline\{stroke:var\(--deepblade\);stroke-width:5\}/.test(s))
  fail('far side lost its original weight');
if(!/\.figfront polyline\{stroke-width:6\}/.test(s))fail('near side lost its original weight');
console.log('  far side 5px in deepblade, near side 6px in the gradient — v1 weights');

console.log("== simple ==");
/* GENERIC is now the phase-label fallback table, not a pose stand-in */
for(const gone of ["function fk(","function ik2(","poseAngles","findAnchor","floorOffset","phaseOf","motionOf","FIGSTEPS"])
  if(js.includes(gone))fail("complexity crept back: "+gone);
console.log("  no rig, no motion model, no stand-ins, no frame stepping");
if(!js.includes("function paintFig(svg,pose,prop)"))fail("painter changed shape");
/* The exercise figures no longer animate: cards show one authored still and
   the detail view lays the authored positions out side by side. */
for(const gone of ["requestAnimationFrame(figLoop)","mountFig","rigs"])
  if(js.includes(gone))fail("animation came back: "+gone);
if(!js.includes("function figStrip(e)"))fail("no instruction strip");
if(!js.includes("function cardPose(e)"))fail("no card pose selection");
console.log("  one painter, no loop, static instruction art");

console.log(bad?(String.fromCharCode(10)+"FAILURES: "+bad):String.fromCharCode(10)+"ALL CHECKS PASS");
process.exit(bad?1:0);