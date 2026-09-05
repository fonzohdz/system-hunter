/* Screenshot / DOM harness. Writes a copy of index.html with a seeded save so
   the app opens past onboarding. Never committed, never modifies index.html.
   Usage: node scratchpad/harness.js <out.html> '{"split":"split","days":4}' */
const fs=require('fs');
const out=process.argv[2], extra=process.argv[3]||'{}';
let t=fs.readFileSync('index.html','utf8');
const base={setup:true,tourSeen:true,name:'FONZO',lvl:14,xp:120,gold:1240,streak:12,
  best:14,logs:63,clears:11,class:'ronin',weapon:'katana',palette:'ember',
  stats:{STR:31,END:24,VIT:27,AGI:19,CORE:22},eq:['db','bb','bench'],dgBest:9,
  unit:'lb',split:'random',cycle:0,
  perf:{db_press:[8,9,10]},                    // deliberately the OLD shape
  last:new Date(Date.now()-864e5).toISOString().slice(0,10)};
const seed=Object.assign(base,JSON.parse(extra));
t=t.replace('<div id="root">',
  '<script>window.__SEED='+JSON.stringify(seed)+';<\/script><div id="root">');
t=t.replace('if(S.setup&&!S.tourSeen)setTimeout(startTour,400);',
  'if(window.__SEED){Object.assign(S,window.__SEED);heal();render()}\r\n'+
  '  if(S.setup&&!S.tourSeen)setTimeout(startTour,400);');
fs.writeFileSync(out,t);
console.log('harness -> '+out);
