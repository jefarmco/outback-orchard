// Outback Orchard – painted procedural art (rendered offline, packed to WebP)
const G=(x0,y0,x1,y1,stops)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>g.addColorStop(o,c));return g;};
const RG=(x,y,r0,r1,stops,x2,y2)=>{const g=ctx.createRadialGradient(x,y,r0,x2==null?x:x2,y2==null?y:y2,r1);stops.forEach(([o,c])=>g.addColorStop(o,c));return g;};
function path(fn,fill,stroke,lw){ctx.beginPath();fn();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||2;ctx.stroke();}}
function shine(x,y,rx,ry,a,rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot||0);ctx.fillStyle=RG(0,0,0,rx,[[0,'rgba(255,255,255,'+a+')'],[1,'rgba(255,255,255,0)']]);ctx.scale(1,ry/rx);ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.restore();}
function leafShape(x,y,len,w,rot,c1,c2){ctx.save();ctx.translate(x,y);ctx.rotate(rot);path(()=>{ctx.moveTo(0,0);ctx.quadraticCurveTo(len*.5,-w,len,0);ctx.quadraticCurveTo(len*.5,w*.7,0,0);},G(0,-w,0,w,[[0,c1],[1,c2]]));
  ctx.strokeStyle='rgba(255,255,220,.45)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(len*.05,0);ctx.quadraticCurveTo(len*.5,-w*.15,len*.92,0);ctx.stroke();ctx.restore();}
// ================= TILES =================
function tMango(){ctx.save();ctx.rotate(-.35);
  const shape=()=>{ctx.moveTo(2,-44);ctx.bezierCurveTo(32,-44,42,-8,35,16);ctx.bezierCurveTo(28,40,6,48,-10,44);ctx.bezierCurveTo(-34,38,-40,8,-35,-14);ctx.bezierCurveTo(-30,-36,-18,-44,2,-44);};
  path(shape,RG(-12,-18,4,58,[[0,'#fff1a6'],[.35,'#ffc533'],[.7,'#f68b16'],[1,'#c9480c']]));
  ctx.save();ctx.beginPath();shape();ctx.clip();ctx.fillStyle=RG(26,10,2,44,[[0,'rgba(226,52,40,.85)'],[.6,'rgba(226,52,40,.35)'],[1,'rgba(226,52,40,0)']]);ctx.fillRect(-50,-50,100,100);
  ctx.fillStyle=RG(-20,30,2,30,[[0,'rgba(120,170,40,.45)'],[1,'rgba(120,170,40,0)']]);ctx.fillRect(-50,-50,100,100);
  for(let i=0;i<40;i++){const a=Math.random()*TAU,r=Math.random()*38;O(Math.cos(a)*r,Math.sin(a)*r,1,'rgba(255,240,180,.5)');}ctx.restore();
  shine(-14,-20,14,8,.85,-.7);
  ctx.restore();line(4,-46,8,-54,'#5d4037',4);leafShape(8,-52,34,10,-.5,'#5fae3e','#2e6b26');}
function tLychee(){const R=rng(4);
  path(()=>{ctx.arc(0,4,40,0,TAU);},RG(-12,-10,4,46,[[0,'#ff7a6b'],[.5,'#e0302c'],[1,'#7e0f14']],0,4));
  ctx.save();ctx.beginPath();ctx.arc(0,4,40,0,TAU);ctx.clip();
  for(let y=-40;y<=46;y+=8)for(let x=-40;x<=40;x+=8){const xx=x+((y/8)%2?4:0)+(R()-.5)*2,yy=y+(R()-.5)*2;const d=Math.hypot(xx,yy-4);if(d>41)continue;const k=1-d/48;
    O(xx,yy,3.6,'rgba(90,0,10,.35)');O(xx-.8,yy-.9,2.6,'rgba(255,'+(110+k*70|0)+','+(90+k*40|0)+','+(.25+k*.4)+')');}
  ctx.restore();shine(-14,-12,13,9,.6,-.6);
  line(0,-36,2,-46,'#6d4c2f',4);leafShape(2,-44,30,9,-.9,'#6fb04a','#2e6b26');leafShape(0,-43,24,7,-2.6,'#5d9e3e','#2a5e22');}
function tLeaf(){// gum-leaf bunch with gumnuts
  line(0,44,0,6,'#9a4a2a',5);
  const L=[[-2.75,58,20],[-2.05,62,21],[-1.57,60,20],[-1.05,62,21],[-.38,58,20]];
  for(const [a,len,w] of L)leafShape(0,10,len,w,a,'#9fd88a','#2f7a3e');
  for(const [x,y] of [[-12,32],[12,32],[0,40]]){O(x,y,8,'#8a9a52');O(x,y-4.5,4.6,'#3f3a22');O(x-2.5,y-6,1.6,'rgba(255,255,220,.6)');}}
function tWattle(){const R=rng(9);
  leafShape(-4,30,46,6,-1.9,'#7c9d5a','#3f6a33');leafShape(4,30,44,6,-1.2,'#86a663','#3f6a33');line(0,40,0,10,'#6d5a3a',4);
  const balls=[[0,-10,17],[-20,-2,14],[20,-2,14],[-10,-28,13],[12,-28,13],[0,14,13],[-24,18,11],[24,18,11],[-28,-22,10],[28,-22,10]];
  balls.sort((a,b)=>a[1]-b[1]);
  for(const [x,y,r] of balls){for(let i=0;i<26;i++){const a=R()*TAU;O(x+Math.cos(a)*r*1.02,y+Math.sin(a)*r*1.02,1.8,'rgba(250,200,30,.9)');}
    path(()=>ctx.arc(x,y,r,0,TAU),RG(x-r*.4,y-r*.45,1,r*1.1,[[0,'#fffbd0'],[.4,'#ffe14a'],[1,'#e8a40c']]));
    for(let i=0;i<10;i++){const a=R()*TAU,q=R()*r*.8;O(x+Math.cos(a)*q,y+Math.sin(a)*q,1.3,'rgba(255,255,220,.8)');}}}
function tEgg(){const R=rng(3);
  path(()=>{ctx.moveTo(0,-44);ctx.bezierCurveTo(26,-44,36,0,34,14);ctx.bezierCurveTo(32,36,16,44,0,44);ctx.bezierCurveTo(-16,44,-32,36,-34,14);ctx.bezierCurveTo(-36,0,-26,-44,0,-44);},
    RG(-10,-16,4,56,[[0,'#ffffff'],[.45,'#fbf3e2'],[.8,'#e7d3ad'],[1,'#b99a6a']]));
  for(let i=0;i<26;i++){const a=R()*TAU,r=Math.sqrt(R())*28;O(Math.cos(a)*r*.9,6+Math.sin(a)*r*1.1,.8+R()*1.6,'rgba(140,95,55,'+(.25+R()*.35)+')');}
  shine(-12,-20,12,16,.95,-.3);}
function tPassion(){const R=rng(5);
  path(()=>ctx.arc(0,4,40,0,TAU),RG(-14,-12,3,48,[[0,'#c99be8'],[.35,'#8a4cc0'],[.75,'#4f1f78'],[1,'#26093d']],0,4));
  ctx.save();ctx.beginPath();ctx.arc(0,4,40,0,TAU);ctx.clip();ctx.strokeStyle='rgba(30,0,50,.35)';ctx.lineWidth=1.5;for(let i=0;i<9;i++){ctx.beginPath();const y=-30+i*8;ctx.moveTo(-40,y+R()*4);ctx.bezierCurveTo(-10,y+6*(R()-.5)*3,10,y+6*(R()-.5)*3,40,y);ctx.stroke();}
  for(let i=0;i<50;i++){const a=R()*TAU,r=R()*38;O(Math.cos(a)*r,4+Math.sin(a)*r,1,'rgba(240,220,255,.55)');}ctx.restore();
  shine(-15,-14,14,9,.7,-.6);
  for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.55;leafShape(0,-34,16,6,a,'#7cb342','#33691e');}O(0,-36,4,'#558b2f');}
const TILES=[tMango,tLychee,tLeaf,tWattle,tEgg,tPassion];
// ================= SPECIALS =================
function ovLine(){// horizontal ute-run band
  ctx.fillStyle=G(0,-22,0,22,[[0,'rgba(255,200,60,0)'],[.3,'rgba(255,220,90,.8)'],[.5,'rgba(255,255,250,1)'],[.7,'rgba(255,220,90,.8)'],[1,'rgba(255,200,60,0)']]);ctx.fillRect(-58,-22,116,44);
  for(const s of [-1,1])for(const o of [0,13]){ctx.save();ctx.translate(s*(44-o),0);ctx.scale(s,1);path(()=>{ctx.moveTo(-6,-13);ctx.lineTo(8,0);ctx.lineTo(-6,13);ctx.lineTo(-1,0);ctx.closePath();},G(0,-13,0,13,[[0,'#fff59d'],[1,'#ff8f00']]),'#5d2a00',2);ctx.restore();}}
function ovBomb(){for(let i=0;i<2;i++){ctx.strokeStyle=i?'rgba(225,250,255,.95)':'rgba(30,136,229,.9)';ctx.lineWidth=i?3:9;ctx.beginPath();ctx.arc(0,2,50,0,TAU);ctx.stroke();}
  for(let i=0;i<8;i++){const a=i/8*TAU+.2;const x=Math.cos(a)*50,y=2+Math.sin(a)*50;ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);path(()=>{ctx.moveTo(0,-11);ctx.quadraticCurveTo(8,2,0,7);ctx.quadraticCurveTo(-8,2,0,-11);},G(-6,-10,6,8,[[0,'#e1f5fe'],[.5,'#4fc3f7'],[1,'#0d47a1']]));ctx.restore();}}
function spCyc(){const R=rng(21);
  path(()=>ctx.arc(0,0,44,0,TAU),RG(-10,-10,2,48,[[0,'#fff8e1'],[.35,'#ffcc80'],[.7,'#d4703a'],[1,'#7a2e12']]));
  const cols=['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#8e24aa'];
  for(let k=0;k<6;k++){ctx.save();ctx.rotate(k/6*TAU);ctx.strokeStyle=cols[k];ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();for(let t=0;t<=1;t+=.05){const r=6+t*36,a=t*3.2;const x=Math.cos(a)*r,y=Math.sin(a)*r;t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();}
  for(let i=0;i<30;i++){const a=R()*TAU,r=20+R()*26;O(Math.cos(a)*r,Math.sin(a)*r,1+R()*1.6,'rgba(255,240,200,.8)');}
  shine(-14,-16,14,9,.85,-.6);O(0,0,7,'#fffde7');}
// ================= BLOCKERS =================
function mudTile(n){const R=rng(30+n);const s=58;
  path(()=>rr(ctx,-s,-s,s*2,s*2,16),G(0,-s,0,s,n===2?[[0,'#7a3a1c'],[1,'#4a210f']]:[[0,'#a5532a'],[1,'#74361a']]));
  for(let i=0;i<14;i++){const x=(R()-.5)*s*1.7,y=(R()-.5)*s*1.7;E(x,y,6+R()*10,3+R()*5,n===2?'rgba(40,15,5,.35)':'rgba(70,30,10,.3)',R()*3);}
  for(let i=0;i<8;i++){const x=(R()-.5)*s*1.5,y=(R()-.5)*s*1.5;shine(x,y,7+R()*7,2.5,.35,R()*.6-.3);}
  if(n===2)for(let i=0;i<3;i++){const x=(R()-.5)*s*1.1,y=(R()-.5)*s*1.1;for(const d of [-1,1])E(x+d*4,y,3,5,'rgba(30,10,0,.55)',d*.2);}}
function crate(n){const s=52;
  path(()=>rr(ctx,-s,-s,s*2,s*2,6),G(-s,-s,s,s,[[0,'#d9a066'],[1,'#8a5a2b']]));
  ctx.strokeStyle='rgba(80,45,20,.7)';ctx.lineWidth=2.5;for(let y=-s+26;y<s;y+=26){ctx.beginPath();ctx.moveTo(-s,y);ctx.lineTo(s,y);ctx.stroke();}
  for(let i=0;i<40;i++){ctx.strokeStyle='rgba(255,230,180,.12)';ctx.lineWidth=1;const y=(Math.random()-.5)*s*2;ctx.beginPath();ctx.moveTo(-s+4,y);ctx.lineTo(-s+20+Math.random()*80,y+(Math.random()-.5)*2);ctx.stroke();}
  path(()=>{ctx.moveTo(-s+8,-s+4);ctx.lineTo(s-4,s-8);ctx.lineTo(s-8,s-4);ctx.lineTo(-s+4,-s+8);ctx.closePath();},'#b07a44');
  path(()=>{rr(ctx,-s,-s,s*2,s*2,6);rr(ctx,-s+10,-s+10,s*2-20,s*2-20,3);},null);ctx.fillStyle=G(0,-s,0,s,[[0,'#c48a52'],[1,'#7a4a20']]);ctx.fill('evenodd');
  if(n===2){ctx.fillStyle=G(0,-s,0,s,[[0,'#b0bec5'],[1,'#546e7a']]);for(const [x,y] of [[-s,-s],[s-18,-s],[-s,s-18],[s-18,s-18]]){ctx.fillRect(x,y,18,18);O(x+9,y+9,3,'#37474f');}
    ctx.fillRect(-s,-5,s*2,10);for(let x=-s+10;x<s;x+=22)O(x,0,2.4,'#263238');}
  else{ctx.strokeStyle='rgba(40,20,5,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-10,-s);ctx.lineTo(-2,-20);ctx.lineTo(-14,0);ctx.lineTo(4,18);ctx.moveTo(-2,-20);ctx.lineTo(16,-12);ctx.stroke();}}
function wire(){const draw=(a)=>{ctx.save();ctx.rotate(a);ctx.strokeStyle='#5f6a6e';ctx.lineWidth=4.5;ctx.beginPath();for(let x=-60;x<=60;x+=2){const y=Math.sin(x/9)*3;x===-60?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    ctx.strokeStyle='#cfd8dc';ctx.lineWidth=1.6;ctx.stroke();for(let x=-44;x<=44;x+=22){line(x-6,-7,x+6,7,'#455a64',3);line(x+6,-7,x-6,7,'#455a64',3);line(x-6,-7,x+6,7,'rgba(230,240,240,.8)',1.2);}ctx.restore();};
  draw(.62);draw(-.62);}
function calf(){// brahman calf face
  ctx.save();ctx.translate(0,6);
  for(const s of [-1,1]){ctx.save();ctx.scale(s,1);path(()=>{ctx.moveTo(24,-18);ctx.quadraticCurveTo(58,-12,60,14);ctx.quadraticCurveTo(48,22,26,2);ctx.closePath();},G(30,-18,50,20,[[0,'#d9cbb8'],[1,'#9c8a76']]));
    path(()=>{ctx.moveTo(30,-10);ctx.quadraticCurveTo(52,-4,52,10);ctx.quadraticCurveTo(44,12,30,0);ctx.closePath();},'rgba(240,170,160,.7)');ctx.restore();}
  path(()=>{ctx.moveTo(0,-44);ctx.bezierCurveTo(30,-44,36,-12,30,8);ctx.bezierCurveTo(26,30,20,44,0,44);ctx.bezierCurveTo(-20,44,-26,30,-30,8);ctx.bezierCurveTo(-36,-12,-30,-44,0,-44);},RG(-8,-20,4,60,[[0,'#fbf4ea'],[.6,'#e2d4c0'],[1,'#a8927a']]));
  path(()=>{ctx.ellipse(0,-30,10,9,0,0,TAU);},'rgba(160,130,100,.35)');
  E(0,26,22,17,'#e9a7a0');O(-8,28,4,'#6d3b35');O(8,28,4,'#6d3b35');shine(-6,20,8,4,.6);
  for(const s of [-1,1]){O(s*14,-6,8.5,'#2a1a12');O(s*14-2.5,-9,3,'#ffffff');O(s*14+2,-4,1.4,'#ffffff');E(s*22,10,6,3.5,'rgba(240,140,140,.55)');}
  ctx.restore();}
// ================= ITEMS / BOOSTERS =================
function shovel(){ctx.save();ctx.rotate(.7);line(0,-50,0,14,'#a1714a',8);path(()=>rr(ctx,-10,-58,20,10,4),'#5d4037');
  path(()=>{ctx.moveTo(-18,12);ctx.lineTo(18,12);ctx.lineTo(16,40);ctx.quadraticCurveTo(0,58,-16,40);ctx.closePath();},G(-18,12,18,50,[[0,'#eceff1'],[.5,'#90a4ae'],[1,'#455a64']]));shine(-6,24,6,10,.7);ctx.restore();}
function tractor(){ctx.save();ctx.translate(0,6);path(()=>rr(ctx,-40,-14,60,26,5),G(0,-14,0,12,[[0,'#ef5350'],[1,'#b71c1c']]));path(()=>rr(ctx,-6,-42,30,32,4),G(0,-42,0,-10,[[0,'#e53935'],[1,'#8e1515']]));
  path(()=>rr(ctx,-1,-37,20,18,2),'rgba(180,230,255,.85)');line(-30,-14,-30,-34,'#424242',5);
  for(const [x,r] of [[-28,14],[22,22]]){O(x,18,r,'#212121');O(x,18,r*.55,'#fbc02d');O(x,18,r*.18,'#5d4037');}ctx.restore();}
function willy(){const R=rng(8);for(let i=0;i<7;i++){const y=-40+i*12,w=40-i*4.5;ctx.strokeStyle='rgba('+(170+i*8)+','+(90+i*10)+',50,.9)';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(Math.sin(i)*4,y,w,6,0,0,TAU);ctx.stroke();}
  for(let i=0;i<20;i++)O((R()-.5)*80,(R()-.5)*90,1.5+R()*2,'rgba(200,120,60,.7)');leafShape(-30,-20,16,5,.5,'#7cb342','#33691e');leafShape(24,6,14,5,2.5,'#7cb342','#33691e');}
function esky(){path(()=>rr(ctx,-44,-20,88,58,8),G(0,-20,0,38,[[0,'#42a5f5'],[1,'#0d47a1']]));path(()=>rr(ctx,-48,-34,96,20,7),G(0,-34,0,-14,[[0,'#ffffff'],[1,'#cfd8dc']]));path(()=>rr(ctx,-16,-44,32,12,5),'#eceff1');shine(-24,-26,16,4,.8);}
function ute(){ctx.save();// side-on farm ute, faces right
  path(()=>{ctx.moveTo(-80,0);ctx.lineTo(-80,-24);ctx.lineTo(10,-24);ctx.lineTo(22,-50);ctx.lineTo(56,-50);ctx.lineTo(72,-24);ctx.lineTo(86,-20);ctx.lineTo(88,0);ctx.closePath();},G(0,-50,0,0,[[0,'#fafafa'],[.6,'#e0e0e0'],[1,'#9e9e9e']]));
  path(()=>{ctx.moveTo(26,-46);ctx.lineTo(52,-46);ctx.lineTo(64,-26);ctx.lineTo(20,-26);ctx.closePath();},'rgba(130,190,230,.9)');
  ctx.fillStyle='#c62828';ctx.fillRect(-80,-12,168,5);path(()=>rr(ctx,-84,-30,90,8,3),'#8d6e63');line(-70,-30,-70,-44,'#5d4037',3);line(-40,-30,-40,-44,'#5d4037',3);line(-74,-44,-30,-44,'#5d4037',3);
  path(()=>rr(ctx,82,-18,10,8,2),'#fff59d');
  for(const x of [-50,52]){O(x,2,17,'#212121');O(x,2,8,'#bdbdbd');}ctx.restore();}
function star(){path(()=>{for(let i=0;i<10;i++){const r=i%2?20:44,a=-Math.PI/2+i*Math.PI/5;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r+4):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r+4);}ctx.closePath();},RG(-10,-10,2,50,[[0,'#fffde7'],[.4,'#ffd54f'],[1,'#e65100']]));shine(-10,-10,12,7,.8,-.5);}
// ================= CHARACTERS =================
function jesseBust(){ctx.save();ctx.translate(0,20);
  path(()=>{ctx.moveTo(-100,110);ctx.quadraticCurveTo(-96,30,-40,18);ctx.lineTo(40,18);ctx.quadraticCurveTo(96,30,100,110);ctx.closePath();},G(0,18,0,110,[[0,'#5b8fc9'],[1,'#2c5585']]));
  for(let x=-90;x<100;x+=22){ctx.strokeStyle='rgba(20,40,80,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,24);ctx.lineTo(x+6,110);ctx.stroke();}
  path(()=>{ctx.moveTo(-26,18);ctx.lineTo(0,52);ctx.lineTo(26,18);ctx.closePath();},'#e8b48a');path(()=>{ctx.moveTo(-34,16);ctx.lineTo(-6,50);ctx.lineTo(-22,58);ctx.lineTo(-44,22);ctx.closePath();},'#3d6ea8');path(()=>{ctx.moveTo(34,16);ctx.lineTo(6,50);ctx.lineTo(22,58);ctx.lineTo(44,22);ctx.closePath();},'#3d6ea8');
  path(()=>rr(ctx,-18,-6,36,30,8),'#d9a07a');
  path(()=>{ctx.ellipse(0,-34,40,46,0,0,TAU);},RG(-12,-48,6,60,[[0,'#f6caa0'],[.7,'#dca07a'],[1,'#b77a55']]));
  path(()=>{ctx.moveTo(-36,-24);ctx.quadraticCurveTo(-34,8,0,12);ctx.quadraticCurveTo(34,8,36,-24);ctx.quadraticCurveTo(28,-4,0,-4);ctx.quadraticCurveTo(-28,-4,-36,-24);},'rgba(120,80,50,.55)');
  for(const s of [-1,1]){E(s*16,-40,7,6,'#ffffff');O(s*16,-39,4,'#4a3020');O(s*16-1,-41,1.3,'#ffffff');line(s*8,-52,s*26,-50,'#5d4030',4);E(s*40,-32,6,10,'#d79a74');}
  path(()=>{ctx.moveTo(-6,-30);ctx.quadraticCurveTo(-2,-18,-8,-16);},null,'rgba(140,80,50,.6)',2);
  ctx.strokeStyle='#7a3a2a';ctx.lineWidth=3.5;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-16,13,.25,Math.PI-.25);ctx.stroke();
  // akubra
  path(()=>{ctx.ellipse(0,-66,76,16,0,0,TAU);},G(0,-82,0,-50,[[0,'#a17a50'],[1,'#5d4026']]));
  path(()=>{ctx.moveTo(-40,-66);ctx.bezierCurveTo(-42,-104,-20,-110,0,-104);ctx.bezierCurveTo(20,-110,42,-104,40,-66);ctx.closePath();},G(0,-110,0,-66,[[0,'#b48a5c'],[1,'#7a5634']]));
  ctx.fillStyle='#3e2a1a';ctx.fillRect(-40,-76,80,9);ctx.restore();}
function dogBust(){ctx.save();ctx.translate(0,24);// blue heeler
  path(()=>{ctx.moveTo(-70,100);ctx.quadraticCurveTo(-70,20,-30,6);ctx.lineTo(30,6);ctx.quadraticCurveTo(70,20,70,100);ctx.closePath();},G(0,0,0,100,[[0,'#7d93a8'],[1,'#4a5d70']]));
  path(()=>rr(ctx,-40,40,80,12,6),'#c62828');O(0,58,7,'#ffd54f');
  for(const s of [-1,1]){path(()=>{ctx.moveTo(s*24,-50);ctx.lineTo(s*50,-104);ctx.lineTo(s*56,-40);ctx.closePath();},G(0,-104,0,-40,[[0,'#2f3a44'],[1,'#56687a']]));path(()=>{ctx.moveTo(s*32,-52);ctx.lineTo(s*48,-88);ctx.lineTo(s*50,-48);ctx.closePath();},'#d2a07a');}
  path(()=>{ctx.ellipse(0,-30,52,48,0,0,TAU);},RG(-14,-46,6,64,[[0,'#a9bccd'],[.6,'#7890a6'],[1,'#4c5f72']]));
  const R=rng(12);for(let i=0;i<70;i++){const a=R()*TAU,r=Math.sqrt(R())*46;O(Math.cos(a)*r,-30+Math.sin(a)*r*.9,1.5+R()*2,R()<.5?'rgba(40,50,60,.45)':'rgba(230,240,250,.4)');}
  for(const s of [-1,1])E(s*24,-14,16,12,'#d6a27a');E(-22,-50,16,14,'#2c3640');
  path(()=>{ctx.ellipse(0,0,28,22,0,0,TAU);},RG(0,-8,2,32,[[0,'#e6c2a0'],[1,'#b9875f']]));
  E(0,-10,11,8,'#1c1c1c');shine(-3,-13,4,2,.7);
  path(()=>{ctx.moveTo(-16,6);ctx.quadraticCurveTo(0,26,16,6);ctx.closePath();},'#5a1f1f');path(()=>{ctx.moveTo(-7,12);ctx.quadraticCurveTo(0,34,7,12);ctx.closePath();},'#ef7a8a');
  for(const s of [-1,1]){O(s*20,-38,8,'#2a1a10');O(s*20-2,-41,2.8,'#fff');}ctx.restore();}
// ================= FARM =================
const FW=720,FH=1280;
function farmBg(){const c=document.createElement('canvas');c.width=FW;c.height=FH;ctx=c.getContext('2d');const R=rng(55);
  ctx.fillStyle=G(0,0,0,300,[[0,'#f2a65a'],[.55,'#f7cf8a'],[1,'#fbe6b8']]);ctx.fillRect(0,0,FW,320);
  O(560,120,42,'#fff6d0');ctx.fillStyle=RG(560,120,30,240,[[0,'rgba(255,240,190,.55)'],[1,'rgba(255,240,190,0)']]);ctx.fillRect(0,0,FW,400);
  const hills=(y,col,amp,seed,sc)=>{const n=mkNoise(seed);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,FH);for(let x=0;x<=FW;x+=6)ctx.lineTo(x,y-fbm(n,x/sc,0,3)*amp);ctx.lineTo(FW,FH);ctx.fill();};
  hills(250,'#c58a6a',90,3,180);hills(275,'#a8644a',60,4,120);hills(300,'#9a8a4e',30,5,90);
  // ground texture (half res)
  const gw=FW/2,gh=(FH-280)/2,img=ctx.createImageData(gw,gh),d=img.data,n1=mkNoise(61),n2=mkNoise(62),n3=mkNoise(63);
  for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){const a=fbm(n1,x/90,y/90,4),b=fbm(n2,x/10,y/10,2),e=fbm(n3,x/120+3,y/120,3);
    const lush=Math.max(0,Math.min(1,(a-.5)*2+.15+y/gh*.35));let col=[204,171,92].map((v,i)=>v+([142,148,72][i]-v)*lush);const bare=Math.max(0,Math.min(1,(e-.58)*5));col=col.map((v,i)=>v+([178,86,44][i]-v)*bare*.7);
    const sh=.84+b*.32,i=(y*gw+x)*4;d[i]=col[0]*sh;d[i+1]=col[1]*sh;d[i+2]=col[2]*sh;d[i+3]=255;}
  const tc=document.createElement('canvas');tc.width=gw;tc.height=gh;tc.getContext('2d').putImageData(img,0,0);
  ctx.save();ctx.beginPath();ctx.moveTo(0,FH);const nn=mkNoise(5);for(let x=0;x<=FW;x+=6)ctx.lineTo(x,300-fbm(nn,x/90,0,3)*30);ctx.lineTo(FW,FH);ctx.clip();ctx.drawImage(tc,0,270,FW,FH-270);ctx.restore();
  for(let i=0;i<9000;i++){const x=R()*FW,y=300+R()*(FH-300),l=3+R()*7*(y/FH+.3);const k=R();ctx.strokeStyle=k<.45?'rgba(235,210,135,.35)':k<.75?'rgba(110,120,55,.35)':'rgba(90,70,30,.3)';ctx.lineWidth=1+R();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(R()-.5)*4,y-l);ctx.stroke();}
  // distant tree line
  for(let i=0;i<22;i++){const x=R()*FW,y=298+R()*16;gumTree(x,y,22+R()*12,R,false);}
  // dam
  ctx.save();ctx.translate(585,1060);ctx.fillStyle='rgba(150,95,50,.9)';ctx.beginPath();ctx.ellipse(0,0,112,46,0,0,TAU);ctx.fill();ctx.fillStyle=G(0,-40,0,40,[[0,'#7fb2c0'],[1,'#3f7a8c']]);ctx.beginPath();ctx.ellipse(0,2,98,36,0,0,TAU);ctx.fill();
  for(let i=0;i<12;i++){ctx.strokeStyle='rgba(230,250,250,.5)';ctx.lineWidth=1.5;const x=(R()-.5)*150,y=(R()-.5)*44;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+8,y-3,x+16,y);ctx.stroke();}ctx.restore();
  // driveway
  const dw=(y)=>[[400,FH],[410,1150],[380,900],[372,700],[380,500]];ctx.lineCap='round';ctx.lineJoin='round';
  for(const [w,col] of [[78,'rgba(90,45,20,.25)'],[66,'#9c4a22'],[56,'#b8592b'],[30,'rgba(214,122,70,.6)']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(400,FH+20);ctx.bezierCurveTo(420,1100,360,900,372,720);ctx.bezierCurveTo(380,600,384,560,384,480);ctx.stroke();}
  for(let i=0;i<500;i++){const t=R();const y=480+t*(FH-480);const x=372+(y>720?(y-720)/560*30:0)+(R()-.5)*50;O(x,y,1+R()*1.5,R()<.5?'rgba(80,35,12,.45)':'rgba(240,180,120,.45)');}
  // yard dirt patches
  ctx.fillStyle='rgba(176,92,48,.35)';for(const [x,y,rx,ry] of [[385,505,230,40],[600,530,120,30],[150,500,120,30],[180,1250,170,50]]){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
  // big gums framing
  for(const [x,y,s] of [[30,620,120],[700,690,110],[18,1040,110],[706,1250,100],[690,360,80],[300,330,60]])gumTree(x,y,s,R,true);
  for(const [x,y] of [[110,700],[650,880],[300,1120],[470,1210]])rock(x,y,26,R,.8);termite(660,780,40,R);termite(40,860,34,R);
  return c;}
function house(after){ctx.save();// queenslander on stumps, anchor bottom-center (0,0 is centre of 340x260 cell; ground at y=110)
  const wall=after?['#fff4dc','#e8d2a6']:['#bdb6a6','#8f8a7c'],trim=after?'#2e7d32':'#6d675a',roof=after?['#c0392b','#7b1d14']:['#8d8a85','#5f554c'];
  for(let x=-130;x<=130;x+=37)path(()=>ctx.rect(x-4,64,8,46),'#6d5038');ctx.fillStyle='rgba(60,40,20,.5)';ctx.fillRect(-140,104,280,6);
  path(()=>ctx.rect(-140,-20,280,86),G(0,-20,0,66,[[0,wall[0]],[1,wall[1]]]));
  if(after){ctx.strokeStyle='rgba(150,120,80,.35)';ctx.lineWidth=1.2;for(let y=-14;y<66;y+=7){ctx.beginPath();ctx.moveTo(-140,y);ctx.lineTo(140,y);ctx.stroke();}}
  else{for(let i=0;i<26;i++){const x=-130+Math.random()*260,y=-10+Math.random()*70;E(x,y,4+Math.random()*9,2+Math.random()*4,'rgba(110,90,70,.5)');}}
  // verandah
  path(()=>{ctx.moveTo(-160,-6);ctx.lineTo(160,-6);ctx.lineTo(150,8);ctx.lineTo(-150,8);ctx.closePath();},roof[1]);
  for(let x=-150;x<=150;x+=50)path(()=>ctx.rect(x-3,8,6,58),after?'#ffffff':'#8b8578');
  ctx.strokeStyle=after?'#ffffff':'#7b7568';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-150,46);ctx.lineTo(150,46);ctx.stroke();ctx.lineWidth=1.5;for(let x=-146;x<150;x+=8){if(!after&&Math.random()<.25)continue;ctx.beginPath();ctx.moveTo(x,46);ctx.lineTo(x,64);ctx.stroke();}
  path(()=>ctx.rect(-14,14,28,50),after?'#2e7d32':'#5a5045');for(const x of [-92,62])path(()=>ctx.rect(x,14,30,28),after?'rgba(150,200,230,.9)':'rgba(70,70,70,.85)');
  if(!after){line(-92,14,-62,42,'#3a3530',2);line(62,28,92,18,'#3a3530',2);}
  for(const x of [-92,62]){ctx.strokeStyle=trim;ctx.lineWidth=3;ctx.strokeRect(x,14,30,28);}
  // roof
  path(()=>{ctx.moveTo(-166,-6);ctx.lineTo(-100,-86);ctx.lineTo(100,-86);ctx.lineTo(166,-6);ctx.closePath();},G(0,-86,0,-6,[[0,roof[0]],[1,roof[1]]]));
  ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=2;for(let x=-150;x<160;x+=10){ctx.beginPath();ctx.moveTo(x,-6);ctx.lineTo(x*.62,-86);ctx.stroke();}
  if(!after){ctx.fillStyle='rgba(150,70,30,.55)';for(let i=0;i<14;i++){E(-120+Math.random()*240,-70+Math.random()*60,6+Math.random()*12,3+Math.random()*5,'rgba(150,70,30,.55)');}path(()=>{ctx.moveTo(40,-86);ctx.lineTo(70,-86);ctx.lineTo(58,-50);ctx.closePath();},'#3a2f28');}
  path(()=>ctx.rect(60,-112,18,30),after?'#a1887f':'#6d6258');
  ctx.restore();}
function windmill(after){ctx.save();// tower base at y=140
  ctx.strokeStyle=after?'#cfd8dc':'#8d7f6f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-34,140);ctx.lineTo(-4,-80);ctx.moveTo(34,140);ctx.lineTo(4,-80);ctx.stroke();ctx.lineWidth=2.5;
  for(let y=110;y>-60;y-=40){const w=34*(y+80)/220;ctx.beginPath();ctx.moveTo(-w,y);ctx.lineTo(w*.8,y-40);ctx.moveTo(w,y);ctx.lineTo(-w*.8,y-40);ctx.stroke();}
  ctx.save();ctx.translate(0,-86);if(!after)ctx.rotate(.3);
  const n=after?16:7;for(let i=0;i<n;i++){if(!after&&(i===2||i===5))continue;ctx.save();ctx.rotate(i/16*TAU*(after?1:2.3));path(()=>{ctx.moveTo(6,-3);ctx.lineTo(58,-9);ctx.lineTo(58,9);ctx.lineTo(6,3);ctx.closePath();},after?G(0,-9,0,9,[[0,'#eceff1'],[1,'#90a4ae']]):'#8a7a68');ctx.restore();}
  O(0,0,9,after?'#c62828':'#6d5a4a');ctx.restore();
  path(()=>{ctx.moveTo(4,-90);ctx.lineTo(70,-96);ctx.lineTo(70,-70);ctx.lineTo(4,-82);ctx.closePath();},after?'#e53935':'#7f6e5e');
  if(!after){ctx.save();ctx.translate(36,136);ctx.rotate(1.2);path(()=>{ctx.moveTo(0,-3);ctx.lineTo(52,-9);ctx.lineTo(52,9);ctx.lineTo(0,3);ctx.closePath();},'#7a6b5a');ctx.restore();}
  path(()=>ctx.rect(-20,128,40,14),'#8d8070');ctx.restore();}
function tanks(after){ctx.save();// stand + 2 tanks; ground y=80
  if(after){for(const x of [-50,50]){ctx.strokeStyle='#6d5038';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-30,80);ctx.lineTo(x-24,10);ctx.moveTo(x+30,80);ctx.lineTo(x+24,10);ctx.stroke();}
    path(()=>ctx.rect(-80,4,160,10),'#5d4030');
    for(const x of [-40,40]){path(()=>rr(ctx,x-34,-70,68,76,8),G(x-34,0,x+34,0,[[0,'#7f9aa3'],[.35,'#dfe8ea'],[.6,'#a9bcc2'],[1,'#58707a']]));ctx.strokeStyle='rgba(60,80,90,.35)';ctx.lineWidth=1.5;for(let y=-62;y<6;y+=8){ctx.beginPath();ctx.moveTo(x-34,y);ctx.lineTo(x+34,y);ctx.stroke();}path(()=>{ctx.ellipse(x,-70,34,8,0,0,TAU);},'#cfd8dc');}
    line(0,14,0,80,'#90a4ae',4);}
  else{ctx.save();ctx.translate(-10,50);ctx.rotate(-.25);path(()=>rr(ctx,-40,-34,80,64,8),G(-40,0,40,0,[[0,'#7b5a3c'],[.4,'#a87a4c'],[1,'#5a3a22']]));for(let i=0;i<10;i++)E(-30+Math.random()*60,-24+Math.random()*48,4+Math.random()*8,3+Math.random()*4,'rgba(140,60,20,.6)');ctx.restore();
    for(const [x,a] of [[50,1.2],[60,.9]]){ctx.save();ctx.translate(x,70);ctx.rotate(a);path(()=>ctx.rect(-3,-40,6,60),'#6d5038');ctx.restore();}}
  ctx.restore();}
function shed(after){ctx.save();// ground y=90
  if(after){path(()=>ctx.rect(-110,-30,220,120),G(0,-30,0,90,[[0,'#c9d3d6'],[1,'#8b989c']]));ctx.strokeStyle='rgba(60,70,75,.3)';ctx.lineWidth=2;for(let x=-106;x<110;x+=8){ctx.beginPath();ctx.moveTo(x,-30);ctx.lineTo(x,90);ctx.stroke();}
    path(()=>{ctx.moveTo(-122,-26);ctx.lineTo(0,-82);ctx.lineTo(122,-26);ctx.closePath();},G(0,-82,0,-26,[[0,'#2e7d32'],[1,'#1b4d1f']]));
    path(()=>ctx.rect(-70,0,140,90),'#3a2f28');ctx.save();ctx.translate(-10,64);ctx.scale(.9,.9);path(()=>rr(ctx,-40,-14,60,26,5),'#c62828');path(()=>rr(ctx,-6,-42,30,32,4),'#b71c1c');for(const [x,r] of [[-28,13],[22,20]]){O(x,16,r,'#212121');O(x,16,r*.5,'#fbc02d');}ctx.restore();}
  else{path(()=>{ctx.moveTo(-110,90);ctx.lineTo(-104,10);ctx.lineTo(-40,-10);ctx.lineTo(30,40);ctx.lineTo(70,0);ctx.lineTo(108,30);ctx.lineTo(110,90);ctx.closePath();},G(0,-10,0,90,[[0,'#8a7a6a'],[1,'#5a4a3a']]));
    for(let i=0;i<22;i++)E(-100+Math.random()*200,10+Math.random()*70,6+Math.random()*12,3+Math.random()*6,'rgba(140,60,20,.55)');
    for(const [x,y,a] of [[-60,70,.4],[40,76,-.3],[80,60,.9]]){ctx.save();ctx.translate(x,y);ctx.rotate(a);path(()=>ctx.rect(-30,-6,60,12),'#7f7366');ctx.restore();}
    line(-104,90,-104,-20,'#5d4a3a',6);line(108,90,100,0,'#5d4a3a',6);}
  ctx.restore();}
function kennel(after){ctx.save();if(after){path(()=>ctx.rect(-36,-10,72,46),G(0,-10,0,36,[[0,'#d7a46a'],[1,'#8f5e2c']]));path(()=>{ctx.moveTo(-44,-6);ctx.lineTo(0,-40);ctx.lineTo(44,-6);ctx.closePath();},'#c0392b');path(()=>{ctx.arc(0,36,16,Math.PI,0);ctx.lineTo(16,36);ctx.closePath();},'#2a1a10');
    ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('BLUE',0,8);O(46,32,8,'#c62828');O(46,30,5,'#8b4513');}
  else{ctx.save();ctx.rotate(.2);path(()=>ctx.rect(-30,0,60,34),'#8a6a4a');ctx.restore();for(let i=0;i<5;i++)line(-30+i*14,36,-26+i*14,26,'#6b8e3a',3);}ctx.restore();}
function fence(after){ctx.save();// spans x -360..360 at y 0 (ground), gate gap -40..60
  const seg=(x0,x1)=>{for(let x=x0;x<=x1;x+=40){const bad=!after&&((x/40|0)%3===0);ctx.save();ctx.translate(x,0);if(bad)ctx.rotate(.5);path(()=>ctx.rect(-4,-40,8,44),after?'#efe6d4':'#6d5a48');ctx.restore();}
    for(const y of [-30,-14]){if(!after){for(let x=x0;x<x1;x+=40){if(Math.random()<.4)continue;line(x,y+(Math.random()-.5)*8,x+40,y+(Math.random()-.5)*8,'#7a6656',3);}}else line(x0,y,x1,y,'#efe6d4',5);}};
  seg(-356,-44);seg(64,356);
  if(after){for(const x of [-44,64])path(()=>ctx.rect(x-6,-52,12,56),'#efe6d4');path(()=>ctx.rect(-38,-40,96,6),'#b0bec5');path(()=>ctx.rect(-38,-20,96,6),'#b0bec5');for(let x=-34;x<58;x+=12)path(()=>ctx.rect(x,-40,3,26),'#90a4ae');}
  ctx.restore();}
function oldUte(after){ctx.save();ctx.scale(.85,.85);
  if(after){ute();}else{ctx.save();ctx.translate(0,10);ctx.rotate(-.04);
    path(()=>{ctx.moveTo(-80,0);ctx.lineTo(-80,-24);ctx.lineTo(10,-24);ctx.lineTo(22,-50);ctx.lineTo(56,-50);ctx.lineTo(72,-24);ctx.lineTo(86,-20);ctx.lineTo(88,0);ctx.closePath();},G(0,-50,0,0,[[0,'#a1765a'],[1,'#5d3a22']]));
    for(let i=0;i<18;i++)E(-70+Math.random()*150,-40+Math.random()*36,4+Math.random()*10,2+Math.random()*5,'rgba(90,40,10,.55)');path(()=>{ctx.moveTo(26,-46);ctx.lineTo(52,-46);ctx.lineTo(64,-26);ctx.lineTo(20,-26);ctx.closePath();},'rgba(40,40,40,.8)');
    for(const x of [-50,52])path(()=>ctx.rect(x-16,0,32,14),'#8d8070');ctx.restore();for(let i=0;i<8;i++)line(-90+i*24,24,-86+i*24,8,'#7a9a3a',3);}
  ctx.restore();}
function orchard(after,lychee){const R=rng(lychee?72:71);ctx.save();
  for(let row=0;row<3;row++)for(let i=0;i<4;i++){const x=-110+i*72+(row%2)*18,y=-60+row*62;
    ctx.fillStyle='rgba(120,60,25,.45)';ctx.beginPath();ctx.ellipse(x,y+22,26,8,0,0,TAU);ctx.fill();
    if(!after){if(R()<.5){line(x,y+20,x,y+8,'#6d5038',5);}else{for(let k=0;k<4;k++)line(x-8+k*5,y+22,x-6+k*5,y+12,'#8a8a3a',2);}continue;}
    line(x,y+20,x,y-4,'#6b4a2e',7);
    if(lychee){O(x,y-16,26,'#2f5d2a');for(let k=0;k<9;k++){const a=R()*TAU,r=R()*16;O(x+Math.cos(a)*r,y-18+Math.sin(a)*r*.8,9+R()*6,['#3e7a35','#2e6a2a','#4c8a3e'][(R()*3)|0]);}for(let k=0;k<10;k++){const a=R()*TAU,r=R()*20;O(x+Math.cos(a)*r,y-16+Math.sin(a)*r*.8,2.6,R()<.5?'#d8433a':'#b8302b');}}
    else{O(x,y-18,30,'#2f6b2a');for(let k=0;k<10;k++){const a=R()*TAU,r=R()*20;O(x+Math.cos(a)*r,y-20+Math.sin(a)*r*.8,10+R()*7,['#2f6b2a','#3d7f33','#4e9440'][(R()*3)|0]);}for(let k=0;k<6;k++){const a=R()*TAU,r=R()*20;E(x+Math.cos(a)*r,y-12+Math.sin(a)*r*.7,3.2,4.2,'#ffb300',.4);}}}
  ctx.restore();}
function yard(after){const R=rng(81);ctx.save();
  if(after){const pts=[[-150,-40],[150,-40],[150,50],[-150,50]];for(const [x,y] of [[-150,-40],[-75,-40],[0,-40],[75,-40],[150,-40],[150,5],[150,50],[75,50],[0,50],[-75,50],[-150,50],[-150,5]])path(()=>ctx.rect(x-4,y-30,8,34),'#7a5a3a');
    for(const dy of [-22,-10])for(let k=0;k<4;k++){const [a,b]=[pts[k],pts[(k+1)%4]];line(a[0],a[1]+dy,b[0],b[1]+dy,'#9c7a52',4);}
    for(const [x,y,f] of [[-60,10,1],[40,-6,-1],[90,26,1]]){ctx.save();ctx.translate(x,y);ctx.scale(f*.5,.5);E(0,0,40,24,'#d9cbb8');O(40,-14,16,'#e2d4c0');E(-26,-14,16,10,'#cdb89c');for(const lx of [-26,-8,14,28])line(lx,16,lx,40,'#8a7a66',6);E(50,-16,8,6,'#e9a7a0');ctx.restore();}}
  else{for(let i=0;i<10;i++){const x=-140+R()*280,y=-30+R()*80;ctx.save();ctx.translate(x,y);ctx.rotate(R()*3);path(()=>ctx.rect(-26,-3,52,6),'#7a5a3a');ctx.restore();}for(let i=0;i<10;i++)line(-140+R()*280,40-R()*80,-140+R()*280+3,30-R()*80,'#7a9a3a',2);}
  ctx.restore();}
function chooks(after){const R=rng(91);ctx.save();
  if(after){path(()=>ctx.rect(-130,-20,90,60),G(0,-20,0,40,[[0,'#d7a46a'],[1,'#8f5e2c']]));path(()=>{ctx.moveTo(-138,-16);ctx.lineTo(-85,-50);ctx.lineTo(-32,-16);ctx.closePath();},'#c0392b');path(()=>ctx.rect(-96,6,22,34),'#3a2a1a');
    for(const [x,y] of [[-20,40],[-50,52],[10,56]]){E(x,y,9,7,'#fff8ee');O(x+7,y-6,5,'#fff8ee');poly([x+10,y-7,x+15,y-5,x+10,y-4],'#f9a825');O(x+7,y-11,2.5,'#e53935');}
    for(let b=0;b<3;b++){path(()=>ctx.rect(20+b*36,-30,28,80),'#7a4a2a');for(let k=0;k<5;k++){O(34+b*36,-20+k*16,8,['#43a047','#66bb6a','#2e7d32'][(R()*3)|0]);if(b===1)O(36+b*36,-18+k*16,3,'#e53935');}}}
  else{ctx.save();ctx.rotate(.15);path(()=>{ctx.moveTo(-130,40);ctx.lineTo(-110,-10);ctx.lineTo(-60,10);ctx.lineTo(-40,40);ctx.closePath();},'#8a6a4a');ctx.restore();for(let i=0;i<24;i++)line(-60+R()*180,50-R()*80,-58+R()*180,36-R()*80,'#8a9a3a',2.5);}
  ctx.restore();}
function smoko(after){ctx.save();if(after){E(0,30,80,16,'rgba(60,30,10,.35)');path(()=>rr(ctx,-60,-8,120,12,3),'#8d6e4a');for(const x of [-50,46])path(()=>ctx.rect(x,4,6,30),'#6d5038');for(const x of [-70,62])path(()=>rr(ctx,x,16,10,22,2),'#7a5a3a');
    path(()=>rr(ctx,-40,-30,34,22,4),'#1e88e5');path(()=>rr(ctx,-42,-34,38,8,3),'#fff');O(16,-14,7,'#fff8e1');path(()=>ctx.rect(10,-22,12,12),'#eceff1');O(34,-12,6,'#ffb300');
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(16,-26);ctx.bezierCurveTo(10,-34,22,-38,16,-46);ctx.stroke();}
  else{const R=rng(5);for(let i=0;i<30;i++)line(-70+R()*140,30-R()*10,-68+R()*140,10-R()*30,'#8a9a3a',2.5);rock(-30,20,22,R,.7);}ctx.restore();}
function junk(v){const R=rng(40+v);ctx.save();for(let i=0;i<7;i++){const x=(R()-.5)*60,y=(R()-.5)*20;ctx.save();ctx.translate(x,y);ctx.rotate(R()*3);const t=R();if(t<.35)path(()=>ctx.rect(-14,-5,28,10),'#7f7366');else if(t<.6)O(0,0,9,'#3a3a3a');else if(t<.8)path(()=>ctx.rect(-10,-8,20,16),'#8a5a3a');else path(()=>ctx.rect(-18,-2,36,4),'#a0a0a0');ctx.restore();}ctx.restore();}
// ============ logo / icon ============
function logo(){const W=720,H=330,c=document.createElement('canvas');c.width=W;c.height=H;ctx=c.getContext('2d');
  ctx.save();ctx.translate(W/2,H/2+10);
  line(-250,-40,-250,150,'#5d4030',18);line(250,-40,250,150,'#5d4030',18);
  path(()=>rr(ctx,-320,-110,640,190,26),G(0,-110,0,80,[[0,'#a8743f'],[1,'#6b4224']]));
  ctx.strokeStyle='rgba(50,25,10,.5)';ctx.lineWidth=3;for(const y of [-50,10]){ctx.beginPath();ctx.moveTo(-316,y);ctx.lineTo(316,y);ctx.stroke();}
  for(let i=0;i<60;i++){ctx.strokeStyle='rgba(255,230,190,.08)';ctx.lineWidth=2;const y=-100+Math.random()*170,x=-300+Math.random()*560;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+40+Math.random()*80,y);ctx.stroke();}
  for(const [x,y] of [[-296,-86],[296,-86],[-296,56],[296,56]])O(x,y,6,'#3a2a1c');
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  const txt=(s,y,sz)=>{ctx.font='900 '+sz+'px "DejaVu Sans", sans-serif';ctx.lineWidth=sz*.22;ctx.strokeStyle='#3a1a08';ctx.strokeText(s,0,y);ctx.fillStyle=G(0,y-sz/2,0,y+sz/2,[[0,'#fff3b0'],[.5,'#ffc533'],[1,'#f07a12']]);ctx.fillText(s,0,y);};
  txt('OUTBACK',-52,70);txt('ORCHARD',34,84);ctx.restore();
  const put=(fn,x,y,s,r)=>{const cv=cell(128,128,fn,{ow:3});ctx=c.getContext('2d');ctx.save();ctx.translate(x,y);ctx.rotate(r||0);ctx.drawImage(cv,-s/2,-s/2,s,s);ctx.restore();};
  put(tMango,70,70,120,-.3);put(tLychee,650,80,104,.2);put(tWattle,640,255,96,0);put(tPassion,82,262,96,0);put(tLeaf,600,30,80,.4);
  return c;}
function icon(S){const c=document.createElement('canvas');c.width=c.height=S;ctx=c.getContext('2d');ctx.fillStyle=G(0,0,0,S,[[0,'#f6b85e'],[.6,'#d9783a'],[1,'#8a3e1c']]);ctx.fillRect(0,0,S,S);
  ctx.fillStyle=RG(S*.5,S*.45,S*.05,S*.5,[[0,'rgba(255,240,190,.55)'],[1,'rgba(255,240,190,0)']]);ctx.fillRect(0,0,S,S);
  const m=cell(128,128,tMango,{ow:3});const w=cell(128,128,tWattle,{ow:3});const l=cell(128,128,tLychee,{ow:3});ctx=c.getContext('2d');
  ctx.drawImage(w,S*.52,S*.12,S*.36,S*.36);ctx.drawImage(l,S*.12,S*.5,S*.34,S*.34);ctx.drawImage(m,S*.2,S*.14,S*.62,S*.62);return c;}
// ============ catalogue ============
function buildSprites(){const out={};const add=(k,w,h,fn,opt,s)=>{out[k]={c:cell(w,h,fn,opt),s:s||1};};
  TILES.forEach((f,i)=>add('t'+i,128,128,f,{ow:3}));
  add('ov_line',128,128,ovLine,{ow:2,outline:'rgba(90,40,0,.6)'});add('ov_bomb',128,128,ovBomb,{ow:2});add('cyc',128,128,spCyc,{ow:3});
  add('mud1',128,128,()=>mudTile(1),{ow:1.5});add('mud2',128,128,()=>mudTile(2),{ow:1.5});add('crate1',128,128,()=>crate(1),{ow:2.5});add('crate2',128,128,()=>crate(2),{ow:2.5});
  add('wire',128,128,wire,{ow:1.5});add('calf',128,128,calf,{ow:3});
  add('b_shovel',128,128,shovel,{ow:3});add('b_tractor',128,128,tractor,{ow:3});add('b_willy',128,128,willy,{ow:2});add('b_esky',128,128,esky,{ow:3});
  add('ute',200,120,ute,{ow:3});add('b_bomb',128,128,()=>{ctx.save();ctx.scale(.8,.8);tMango();ctx.restore();ovBomb();},{ow:3});add('b_uteb',200,120,()=>{ute();ctx.fillStyle='rgba(255,230,120,.0)';},{ow:3});add('star',100,100,star,{ow:3});
  add('jesse',240,256,jesseBust,{ow:3});add('blue',200,240,dogBust,{ow:3});
  for(const a of [0,1]){add('house_'+a,360,260,()=>house(a),{ow:2});add('windmill_'+a,180,300,()=>windmill(a),{ow:2});add('tanks_'+a,190,190,()=>tanks(a),{ow:2});add('shed_'+a,270,200,()=>shed(a),{ow:2});
    add('kennel_'+a,120,100,()=>kennel(a),{ow:2});add('fence_'+a,730,80,()=>fence(a),{ow:1.5});add('ute_'+a,190,110,()=>oldUte(a),{ow:2});add('orchard_'+a,300,210,()=>orchard(a,false),{ow:2});
    add('lychee_'+a,300,210,()=>orchard(a,true),{ow:2});add('yard_'+a,330,150,()=>yard(a),{ow:2});add('chooks_'+a,300,160,()=>chooks(a),{ow:2});add('smoko_'+a,180,110,()=>smoko(a),{ow:2});}
  add('junk_0',100,50,()=>junk(0),{ow:1.5});add('junk_1',100,50,()=>junk(1),{ow:1.5});
  return out;}
