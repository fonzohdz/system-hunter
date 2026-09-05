/* shared loader: eval the app's data out of index.html */
const fs=require('fs');
const stub='var window={},document={body:{appendChild(){},classList:{toggle(){},contains:()=>false}},getElementById:()=>({innerHTML:"",querySelectorAll:()=>[],querySelector:()=>null}),documentElement:{style:{setProperty(){},removeProperty(){}}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,hidden:false,createElement:()=>({style:{},dataset:{},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],appendChild(){},addEventListener(){},remove(){}})};var localStorage={getItem:()=>null,setItem(){}};var matchMedia=()=>({matches:false});var requestAnimationFrame=()=>0;var addEventListener=()=>0,removeEventListener=()=>0;var setInterval=()=>0;var clearInterval=()=>0;var getComputedStyle=()=>({getPropertyValue:()=>"#FF3D7F"});var navigator={};var innerWidth=400,innerHeight=800;var confirm=()=>false;';
exports.load=function(file){
  const s=fs.readFileSync(file||'index.html','utf8');
  const js=s.slice(s.indexOf('<script>')+8, s.lastIndexOf('</script>'));
  /* pull the app's own card/phase logic out too, so the audit can never drift
     from what the product actually renders */
  const M=new Function(stub+js.slice(0,js.indexOf('/* ---------------- boot'))+
    '\nreturn {EX,framesFor,EQNAME,HOLDPOSE,cardPose,phaseNames,SET};')();
  M.src=s; return M;
};
/* geometry helpers, shared by every checker */
exports.P=p=>{const o=[];for(let i=0;i<22;i+=2)o.push({x:p[i],y:p[i+1]});return o};
exports.ang=(a,b,c)=>{const u={x:a.x-b.x,y:a.y-b.y},v={x:c.x-b.x,y:c.y-b.y};
  return Math.round(Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/
    ((Math.hypot(u.x,u.y)||1)*(Math.hypot(v.x,v.y)||1)))))*57.2958)};
exports.lean=p=>Math.round(Math.abs(Math.atan2(p[1].x-p[2].x,p[2].y-p[1].y)*57.2958));
exports.J={head:0,neck:1,hip:2,bE:3,bH:4,bK:5,bF:6,fE:7,fH:8,fK:9,fF:10};
