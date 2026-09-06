/* Patch 10 — Concept A, "System Window", in the app's own colours.

   The concept was cyan; the app is crimson and seven other palettes. So none
   of this hardcodes a hue: every accent is --crimson / --magenta / --core or an
   rgba() built from the --c1 / --m1 triplets, all of which applyLook() already
   swaps per palette. Pick Void or Frost and the whole System Window turns with
   it, including the glows.

   What actually makes the look, in order of how much it carries:
     square framed panels with corner ticks, never a rounded card
     a monospace face for anything that is a readout — headers, tallies, labels
     an outlined accent button instead of a solid gradient slab
     scanlines and a cold top vignette, both very low contrast
   Cinzel stays for identity (brand, level, name, stat figures). Archivo stays
   for prose. The mono is the third voice, and it only ever speaks data. */
const fs=require('fs');
let t=fs.readFileSync('index.html','utf8');
const crlf=(s)=>s.replace(/\r?\n/g,'\r\n');
const sub=(a,b,label)=>{a=crlf(a);b=crlf(b);const n=t.split(a).length-1;
  if(n!==1){console.log('!! '+n+' matches for: '+label);process.exit(1)}
  t=t.split(a).join(b);console.log('  '+label)};

/* ---- the data face ---- */
sub(`family=Cinzel:wght@600;700;800&family=Archivo:wght@400;500;600;700&display=swap`,
    `family=Cinzel:wght@600;700;800&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap`,
  'IBM Plex Mono loaded');
sub(`  --body:"Archivo","Segoe UI",system-ui,-apple-system,sans-serif;`,
`  --body:"Archivo","Segoe UI",system-ui,-apple-system,sans-serif;
  /* the third voice: readouts only, never prose */
  --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Consolas,monospace;`,
  '--mono defined');

/* ---- scanlines, under the existing grain ---- */
sub(`#root::after{
  content:"";position:fixed;inset:0;pointer-events:none;opacity:.05;z-index:3;`,
`/* Scanlines. Low enough to read as a surface, not as an effect. */
#root::before{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:2;
  background:repeating-linear-gradient(180deg,rgba(var(--c1),.05) 0 1px,transparent 1px 3px);
}
#root::after{
  content:"";position:fixed;inset:0;pointer-events:none;opacity:.05;z-index:3;`,
  'scanline layer');

/* ---- panels ---- */
sub(`.block{padding:28px 18px 0}
.block.top{padding-top:calc(14px + env(safe-area-inset-top))}
.blockhead{display:flex;align-items:baseline;gap:12px;margin-bottom:6px}
.blockhead h2{font-family:var(--display);font-size:17px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;margin:0}
.tally{margin-left:auto;font-size:11.5px;color:var(--ash);letter-spacing:.08em;display:flex;align-items:center;gap:6px}`,
`/* A panel is a framed window: square, hairline border, ticked corners. The
   ticks are two pseudo-elements on the section itself, so no extra markup. */
.block{position:relative;margin:14px 16px 0;padding:16px;
  border:1px solid var(--line);
  background:linear-gradient(180deg,rgba(var(--c1),.04),transparent 60%),var(--deep)}
.block::before,.block::after{content:"";position:absolute;width:9px;height:9px;
  border:1px solid var(--crimson);opacity:.8;pointer-events:none}
.block::before{top:-1px;left:-1px;border-right:0;border-bottom:0}
.block::after{bottom:-1px;right:-1px;border-left:0;border-top:0}
.block.top{margin-top:calc(10px + env(safe-area-inset-top))}
.blockhead{display:flex;align-items:baseline;gap:12px;margin-bottom:14px;
  padding-bottom:9px;border-bottom:1px solid var(--line)}
.blockhead h2{font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.26em;
  text-transform:uppercase;margin:0;color:var(--magenta)}
.tally{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--ash);
  letter-spacing:.06em;display:flex;align-items:center;gap:6px}`,
  'blocks become framed windows with mono headers');

/* ---- the button stops being a slab ---- */
sub(`.btn{width:100%;padding:16px;border:0;cursor:pointer;margin-top:14px;
  font-family:var(--display);font-size:15px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;
  color:#12030A;background:linear-gradient(180deg,var(--magenta),var(--crimson));
  box-shadow:0 0 34px -14px var(--crimson)}
.btn:active{transform:translateY(1px)}
.btn:disabled{filter:grayscale(.7);opacity:.45;cursor:default;box-shadow:none}
.btn.ghost{background:none;border:1px solid var(--line);color:var(--ash);box-shadow:none;
  font-size:13px;letter-spacing:.16em;margin-top:8px}`,
`.btn{width:100%;padding:15px;cursor:pointer;margin-top:14px;
  font-family:var(--mono);font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;
  border:1px solid var(--crimson);color:var(--core);
  background:rgba(var(--c1),.10);
  box-shadow:inset 0 0 24px -10px rgba(var(--m1),.7)}
.btn:hover{background:rgba(var(--c1),.18)}
.btn:active{transform:translateY(1px)}
.btn:disabled{filter:grayscale(.7);opacity:.4;cursor:default;box-shadow:none}
.btn.ghost{background:none;border:1px solid var(--line);color:var(--ash);box-shadow:none;
  font-size:12px;letter-spacing:.18em;margin-top:8px}
.btn.ghost:hover{border-color:var(--crimson);color:var(--magenta);background:none}`,
  'primary button is outlined accent, not a solid gradient');

sub(`.mini{border:1px solid var(--gold);background:none;color:var(--gold);padding:8px 12px;
  font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}`,
`.mini{border:1px solid var(--line);background:none;color:var(--ash);padding:8px 11px;
  font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;
  cursor:pointer;white-space:nowrap}
.mini:hover:not(:disabled){border-color:var(--crimson);color:var(--magenta)}`,
  'small buttons are mono and quiet until hovered');

/* ---- readouts go mono ---- */
sub(`.prop span{display:block;font-size:9px;letter-spacing:.15em;color:var(--ash)}`,
    `.prop span{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.12em;color:var(--ash2)}`,
  'stat labels mono');
sub(`.tabs button.on{color:var(--magenta)}`,
`.tabs button{font-family:var(--mono);letter-spacing:.18em}
.tabs button.on{color:var(--magenta)}`,
  'tab labels mono');
sub(`.filters button{background:none;border:1px solid var(--line);color:var(--ash);`,
    `.filters button{background:none;border:1px solid var(--line);color:var(--ash);font-family:var(--mono);`,
  'filter chips mono');
sub(`.splitline{font-size:11px;color:var(--ash2);line-height:1.5;margin:8px 0 0}`,
`.splitline{font-family:var(--mono);font-size:10.5px;color:var(--magenta);line-height:1.5;
  letter-spacing:.1em;text-transform:uppercase;margin:-6px 0 12px}`,
  'the training-day line reads as a readout');
sub(`.liftv b{display:block;font-family:var(--display);font-size:16px;color:var(--bone)}`,
    `.liftv b{display:block;font-family:var(--mono);font-size:15px;font-weight:600;color:var(--core)}`,
  'lift values mono');
sub(`.liftv span{display:block;font-size:10px;color:var(--ash2);margin-top:2px}`,
    `.liftv span{display:block;font-family:var(--mono);font-size:10px;color:var(--ash2);margin-top:3px}`,
  'lift comparison mono');

fs.writeFileSync('index.html',t);
console.log('patch 10 applied');
