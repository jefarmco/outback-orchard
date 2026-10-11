const p=require('/workspace/tdtest/node_modules/puppeteer-core'),fs=require('fs'),path=require('path');const OUT=path.join(__dirname,'out')+'/';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--allow-file-access-from-files']});const pg=await b.newPage();await pg.setCacheEnabled(false);const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto('file://'+path.join(__dirname,'gen.html'));await new Promise(r=>setTimeout(r,300));
const save=(n,u)=>fs.writeFileSync(OUT+n+'.png',Buffer.from(u.split(',')[1],'base64'));const what=process.argv[2]||'all';
if(what==='all'||what==='sprites'){const sp=await pg.evaluate(()=>{const o=buildSprites(),r={};for(const k in o)r[k]={u:o[k].c.toDataURL(),s:o[k].s};return r;});const meta={};for(const k in sp){save('s_'+k,sp[k].u);meta[k]=sp[k].s;}fs.writeFileSync(OUT+'meta.json',JSON.stringify(meta));console.log('sprites',Object.keys(sp).length);}
if(what==='all'||what==='misc'){save('farm',await pg.evaluate(()=>farmBg().toDataURL()));save('logo',await pg.evaluate(()=>logo().toDataURL()));save('icon512',await pg.evaluate(()=>icon(512).toDataURL()));save('icon192',await pg.evaluate(()=>icon(192).toDataURL()));
  save('wood',await pg.evaluate(()=>woodTex(256,128,'#6b4527',3).toDataURL()));save('board',await pg.evaluate(()=>woodTex(256,256,'#c9a06a',8).toDataURL()));console.log('misc ok');}
console.log('errors',errs);await b.close();})();
