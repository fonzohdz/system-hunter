/* Does each reference movement actually do what the exercise does?
   Every expectation here is written from the exercise, never from the category. */
const fs=require('fs');const s=fs.readFileSync(process.argv[2],'utf8');
const js=s.slice(s.indexOf('<script>')+8, s.lastIndexOf('</script>'));
const stub='var window={},document={body:{appendChild(){},classList:{toggle(){},contains:()=>false}},getElementById:()=>({innerHTML:"",querySelectorAll:()=>[],querySelector:()=>null}),documentElement:{style:{setProperty(){},removeProperty(){}}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,hidden:false,createElement:()=>({style:{},dataset:{},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],appendChild(){},addEventListener(){},remove(){}})};var localStorage={getItem:()=>null,setItem(){}};var matchMedia=()=>({matches:false});var requestAnimationFrame=()=>0;var addEventListener=()=>0,removeEventListener=()=>0;var setInterval=()=>0;var clearInterval=()=>0;var getComputedStyle=()=>({getPropertyValue:()=>"#FF3D7F"});var navigator={};var innerWidth=400,innerHeight=800;var confirm=()=>false;';
const M=new Function(stub+js.slice(0,js.indexOf('/* ---------------- boot'))+'\nreturn {EX,framesFor};')();
let bad=0;const fail=(...a)=>{console.log('  FAIL',...a);bad++};

const P=p=>{const o=[];for(let i=0;i<22;i+=2)o.push({x:p[i],y:p[i+1]});return o};
const ang=(a,b,c)=>{const u={x:a.x-b.x,y:a.y-b.y},v={x:c.x-b.x,y:c.y-b.y};
  return Math.round(Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/
    ((Math.hypot(u.x,u.y)||1)*(Math.hypot(v.x,v.y)||1)))))*57.2958)};
const J={head:0,neck:1,hip:2,bE:3,bH:4,bK:5,bF:6,fE:7,fH:8,fK:9,fF:10};
const g=id=>{const e=M.EX.find(x=>x.id===id);if(!e){fail('no movement '+id);return null}
  return M.framesFor(e).map(P)};
/* torso angle off vertical, unsigned */
const lean=p=>Math.round(Math.abs(Math.atan2(p[1].x-p[2].x,p[2].y-p[1].y)*57.2958));
const knee=(p,s)=>ang(p[2],p[s==='f'?9:5],p[s==='f'?10:6]);
const elb =(p,s)=>ang(p[1],p[s==='f'?7:3],p[s==='f'?8:4]);
const same=(a,b,j,tol,what)=>{const d=Math.hypot(a[j].x-b[j].x,a[j].y-b[j].y);
  if(d>tol)fail(what+' moved '+d.toFixed(1)+' units, should stay put (<'+tol+')')};
const within=(v,lo,hi,what)=>{if(v<lo||v>hi)fail(what+' is '+v+', expected '+lo+'-'+hi)};

console.log('== 1. Bodyweight Squat ==');
{const _f=g('squat'), a=_f[0], b=_f[_f.length-1];
 within(knee(a,'f'),155,180,'standing knee');
 within(knee(b,'f'),70,100,'bottom knee');
 within(lean(b),25,50,'bottom torso lean');
 same(a,b,J.fF,4,'planted foot'); same(a,b,J.bF,4,'planted foot');
 if(b[2].y<=a[2].y)fail('hips did not drop');
 if(b[2].x>=a[2].x)fail('hips did not travel back');
 console.log('  knee '+knee(a,'f')+'->'+knee(b,'f')+', torso '+lean(a)+'->'+lean(b)+', feet planted, hips back and down');}

console.log('== 2. Reverse Lunge ==');
{const _f=g('lunge'), a=_f[0], b=_f[_f.length-1];
 within(knee(b,'f'),80,110,'front knee at the bottom');
 within(knee(b,'b'),85,120,'rear knee at the bottom');
 within(lean(b),0,20,'torso should stay upright');
 if(b[6].x>=b[5].x)fail('rear foot should be behind the rear knee');
 if(b[10].x<=b[9].x-6)fail('front shin should be roughly vertical');
 if(b[2].y<=a[2].y)fail('body did not drop');
 console.log('  front knee '+knee(b,'f')+', rear knee '+knee(b,'b')+', torso '+lean(b)+', rear foot trails behind');}

console.log('== 3. Hip Hinge ==');
{const _f=g('hinge'), a=_f[0], b=_f[_f.length-1];
 within(knee(b,'f'),150,178,'knee should only soften, not squat');
 within(lean(b),60,95,'torso should reach near-parallel');
 if(b[2].x>=a[2].x)fail('hips did not travel back');
 within(elb(b,'f'),150,180,'arms should hang straight');
 if(Math.abs(b[8].x-b[7].x)>8)fail('hands should hang under the shoulders, not swing');
 console.log('  knee '+knee(b,'f')+' (soft), torso '+lean(b)+', hips back, arms long');}

console.log('== 4. Full Push-Up ==');
{const _f=g('pushup'), a=_f[0], b=_f[_f.length-1];
 within(elb(a,'f'),150,180,'top elbow');
 within(elb(b,'f'),70,100,'bottom elbow');
 same(a,b,J.fH,3,'planted hand'); same(a,b,J.bH,3,'planted hand');
 within(knee(a,'f'),155,180,'body should stay rigid at the knee');
 within(knee(b,'f'),155,180,'body should stay rigid at the knee');
 const drop=b[2].y-a[2].y; if(drop<5)fail('body only dropped '+drop);
 if(b[7].x<=a[7].x)fail('elbow should travel backward as it bends');
 console.log('  elbow '+elb(a,'f')+'->'+elb(b,'f')+', hands planted, body rigid, drops '+drop+' units');}

console.log('== 5. Bird Dog ==');
{const _f=g('birddog'), a=_f[0], b=_f[_f.length-1];
 within(knee(a,'f'),75,110,'quadruped knee should be ~90');
 within(lean(a),70,110,'trunk should be horizontal');
 same(a,b,J.bH,4,'supporting hand'); same(a,b,J.fK,4,'supporting knee');
 if(b[8].x>=a[8].x-15)fail('front arm did not reach forward');
 if(b[6].x<=a[6].x+8)fail('opposite leg did not extend back');
 if(b[6].y>=a[6].y-8)fail('extended leg should rise toward spine height');
 within(knee(b,'b'),150,180,'extended leg should be straight');
 console.log('  quadruped knee '+knee(a,'f')+', opposite arm forward and leg back, support hand and knee planted');}

console.log('== 6. Dead Bug ==');
{const _f=g('deadbug'), a=_f[0], b=_f[_f.length-1];
 within(lean(a),70,110,'should be lying supine');
 within(knee(a,'f'),75,110,'tabletop knee should be ~90');
 within(ang(a[1],a[2],a[9]),75,110,'tabletop hip should be ~90');
 if(a[10].y>85||a[6].y>85)fail('feet should be up in tabletop, not on the floor');
 same(a,b,J.fK,4,'holding knee'); same(a,b,J.bH,4,'holding hand');
 if(b[4+4].x>=a[8].x-15)fail('front arm did not reach back overhead');
 if(b[6].x<=a[6].x+8)fail('opposite leg did not extend away');
 console.log('  supine tabletop hip '+ang(a[1],a[2],a[9])+' knee '+knee(a,'f')+', opposite limbs extend, other pair holds');}

console.log('== 7. Step-Up ==');
{const _f=g('stepup'), a=_f[0], b=_f[_f.length-1];
 same(a,b,J.fF,3,'lead foot on the box');
 within(knee(a,'f'),55,95,'lead knee should start deeply bent');
 within(knee(b,'f'),155,180,'lead knee should finish straight');
 if(b[2].y>=a[2].y-6)fail('body did not rise over the lead leg');
 if(b[6].y>=88)fail('trail foot should leave the floor');
 if(a[6].y<88)fail('trail foot should start on the floor');
 console.log('  lead knee '+knee(a,'f')+'->'+knee(b,'f')+' on a fixed foot, body rises '+(a[2].y-b[2].y)+', trail foot lifts');}

console.log('== 8. Overhead Press ==');
{const _f=g('bb_ohp'), a=_f[0], b=_f[_f.length-1];
 within(elb(a,'f'),25,70,'racked elbow — bent but not folded flat');
 within(elb(b,'f'),155,180,'lockout elbow');
 if(b[8].y>=a[1].y-14)fail('hands did not finish above the head');
 same(a,b,J.fF,3,'foot'); same(a,b,J.fK,3,'knee — press has no leg drive');
 console.log('  elbow '+elb(a,'f')+'->'+elb(b,'f')+', hands to '+b[8].y+' (above head), legs still');}

console.log('== 9. Barbell Deadlift ==');
{const _f=g('bb_dl'), a=_f[0], b=_f[_f.length-1];
 within(knee(a,'f'),110,145,'start knee — more bend than a hinge, less than a squat');
 within(knee(b,'f'),155,180,'lockout knee');
 within(elb(a,'f'),155,180,'arms must stay straight at the floor');
 within(elb(b,'f'),155,180,'arms must stay straight at lockout');
 if(a[8].y<80)fail('hands should start down at the bar on the floor');
 within(lean(a),35,70,'start torso incline');
 within(lean(b),0,12,'lockout should be upright');
 same(a,b,J.fF,4,'foot');
 console.log('  knee '+knee(a,'f')+'->'+knee(b,'f')+', torso '+lean(a)+'->'+lean(b)+', elbows '+elb(a,'f')+'/'+elb(b,'f')+' straight throughout');}

console.log('== 10. Dumbbell Curl ==');
{const _f=g('db_curl'), a=_f[0], b=_f[_f.length-1];
 within(elb(a,'f'),155,180,'bottom elbow');
 within(elb(b,'f'),30,60,'top elbow — believable, never folded to 0');
 same(a,b,J.fE,3,'upper arm should stay pinned to the torso');
 same(a,b,J.fK,3,'knee — a curl has no leg motion');
 within(lean(b),0,12,'torso should not swing');
 if(b[8].y>=a[8].y-15)fail('hand did not rise');
 console.log('  elbow '+elb(a,'f')+'->'+elb(b,'f')+', elbow pinned, no torso swing, hand rises '+(a[8].y-b[8].y));}

console.log(bad?'\nFAILURES: '+bad:'\nAll ten reference movements match the real exercise.');
process.exit(bad?1:0);
