const TAU=Math.PI*2;let ctx=null;let FL=false;const C=c=>c;let NOGUN=true;
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255];}
function mixc(c,t,k){const a=hex2rgb(c),b=t;return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')+')';}
const lighten=(c,k)=>mixc(c,[255,236,190],k),darken=(c,k)=>mixc(c,[40,18,8],k);
function shadeFill(col,x0,y0,x1,y1){if(typeof col!=='string'||col[0]!=='#')return col;const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,lighten(col,.32));g.addColorStop(.5,col);g.addColorStop(1,darken(col,.38));return g;}
function E(x,y,rx,ry,col,rot){rx=Math.abs(rx);ry=Math.abs(ry);ctx.fillStyle=shadeFill(col,x-rx*.8,y-ry*.9,x+rx*.6,y+ry*1.0);ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot||0,0,TAU);ctx.fill();}
function O(x,y,r,col){r=Math.abs(r);if(typeof col==='string'&&col[0]==='#'&&r>2.5){const g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r*1.05);g.addColorStop(0,lighten(col,.35));g.addColorStop(.6,col);g.addColorStop(1,darken(col,.35));ctx.fillStyle=g;}else ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
function poly(pts,col){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let i=0;i<pts.length;i+=2){x0=Math.min(x0,pts[i]);x1=Math.max(x1,pts[i]);y0=Math.min(y0,pts[i+1]);y1=Math.max(y1,pts[i+1]);}
  ctx.fillStyle=shadeFill(col,x0,y0,x1,y1);ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.closePath();ctx.fill();}
function line(x1,y1,x2,y2,col,w){ctx.strokeStyle=(typeof col==='string'&&col[0]==='#')?darken(col,.1):col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
// noise
function mkNoise(seed){const P=new Uint8Array(512);const R=rng(seed);const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(R()*(i+1));[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<512;i++)P[i]=p[i&255];const V=new Float32Array(256);for(let i=0;i<256;i++)V[i]=R();
  const f=t=>t*t*(3-2*t);return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,a=V[P[(P[xi&255]+yi)&255]],b=V[P[(P[(xi+1)&255]+yi)&255]],c=V[P[(P[xi&255]+yi+1)&255]],d=V[P[(P[(xi+1)&255]+yi+1)&255]],u=f(xf),v=f(yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};}
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function fbm(n,x,y,o){let v=0,a=.5,f=1,t=0;for(let i=0;i<(o||4);i++){v+=a*n(x*f,y*f);t+=a;a*=.5;f*=2.03;}return v/t;}
let NZ=null;
// post-process: outline, texture, AO, warm light
function finish(cv,opt){opt=opt||{};const w=cv.width,h=cv.height,x=cv.getContext('2d');
  const sil=document.createElement('canvas');sil.width=w;sil.height=h;const s=sil.getContext('2d');s.drawImage(cv,0,0);s.globalCompositeOperation='source-in';s.fillStyle=opt.outline||'rgba(38,20,8,.9)';s.fillRect(0,0,w,h);
  // texture + shading atop
  x.save();x.globalCompositeOperation='source-atop';
  if(!NZ)NZ=mkNoise(99);
  const tex=x.createImageData(w,h),d=tex.data,R=rng(7);for(let i=0;i<w*h;i++){const px=i%w,py=(i/w)|0;const n=fbm(NZ,px/6,py/6,3);const v=(n-.5)*90+(R()-.5)*30;d[i*4]=v>0?255:0;d[i*4+1]=v>0?240:0;d[i*4+2]=v>0?200:0;d[i*4+3]=Math.min(255,Math.abs(v)*.55);}
  const tc=document.createElement('canvas');tc.width=w;tc.height=h;tc.getContext('2d').putImageData(tex,0,0);x.globalAlpha=.55;x.drawImage(tc,0,0);x.globalAlpha=1;
  const g=x.createLinearGradient(0,h*.25,0,h*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(60,25,5,.28)');x.fillStyle=g;x.fillRect(0,0,w,h);
  const g2=x.createRadialGradient(w*.3,h*.2,0,w*.3,h*.2,w*.8);g2.addColorStop(0,'rgba(255,225,160,.22)');g2.addColorStop(1,'rgba(255,225,160,0)');x.fillStyle=g2;x.fillRect(0,0,w,h);
  x.restore();
  // outline behind
  const o=document.createElement('canvas');o.width=w;o.height=h;const oc=o.getContext('2d');const r=opt.ow||Math.max(1.5,w/80);
  for(let a=0;a<16;a++){oc.drawImage(sil,Math.cos(a/16*TAU)*r,Math.sin(a/16*TAU)*r);}oc.drawImage(cv,0,0);
  x.clearRect(0,0,w,h);x.drawImage(o,0,0);return cv;}
function cell(w,h,fn,opt){const c=document.createElement('canvas');c.width=w;c.height=h;const sv=ctx;ctx=c.getContext('2d');ctx.save();ctx.translate(w/2,h/2);fn();ctx.restore();ctx=sv;return finish(c,opt);}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
