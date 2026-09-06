/* Serve the repo over http so the manifest can actually be fetched and parsed —
   a file:// origin cannot validate one. Exits on its own. */
const http=require('http'),fs=require('fs'),p=require('path');
const TYPES={'.html':'text/html','.json':'application/manifest+json','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{
  const f=p.join(process.cwd(), decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html');
  fs.readFile(f,(e,d)=>{
    if(e){r.writeHead(404);return r.end('no')}
    r.writeHead(200,{'content-type':TYPES[p.extname(f)]||'application/octet-stream'});r.end(d);
  });
});
srv.listen(8099,'127.0.0.1',()=>console.log('serving on 8099'));
setTimeout(()=>process.exit(0), 25000);
