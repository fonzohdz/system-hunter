/* Patch 8 — the dungeon entry has to be honest too.

   Fixing dgStations() to respect equipment and limits means a station can now
   legitimately be missing. Seated-only produces none at all. The quest screen
   still offered "Enter the dungeon", which would drop you into viewDungeon(),
   find nothing, and bounce you straight back with no explanation. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');

const a =
'    <button class="btn big" data-dungeon>${dg()&&dg().st===\'run\'?\'Resume the dungeon\':\'Enter the dungeon\'} · +60 XP · +40 gold</button>\n' +
'  </section>`;';

const b =
'    ${(()=>{const st=dgStations();\n' +
'      /* Nothing survives today\'s kit and limits: say so rather than offering\n' +
'         a button that bounces straight back. */\n' +
'      if(!st.length)return `<p class="note">Nothing in the dungeon works with what you have set today.\n' +
'        Widen your kit, or your working-around list, and it comes back.</p>`;\n' +
'      return `${st.length<3?`<p class="note">${st.length} station${st.length===1?\'\':\'s\'} today — the others\n' +
'        need kit you do not have, or movements you have ruled out.</p>`:\'\'}\n' +
'      <button class="btn big" data-dungeon>${dg()&&dg().st===\'run\'?\'Resume the dungeon\':\'Enter the dungeon\'} · +60 XP · +40 gold</button>`;\n' +
'    })()}\n' +
'  </section>`;';

const A=crlf(a), B=crlf(b);
const n=t.split(A).length-1;
if(n!==1){console.log('!! '+n+' matches');process.exit(1)}
t=t.split(A).join(B);
fs.writeFileSync('index.html',t);
console.log('dungeon entry explains itself when stations are missing');
