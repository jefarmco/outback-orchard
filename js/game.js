// Outback Orchard – game client
'use strict';
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,AW=2048,AH=735;
const ATLAS=new Image(),FARM=new Image();
// ---------- save ----------
const SAVE_KEY='oo_save_v1';
function defSave(){return {lvl:1,stars:{},tasks:[],seen:{},boost:{shovel:2,tractor:1,willy:1,esky:1,bomb:1,uteb:1},set:{snd:1,mus:1,vib:1},intro:0,best:{},rewarded:{}};}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&typeof s==='object'){const d=defSave();const o=Object.assign(d,s);o.boost=Object.assign(defSave().boost,s.boost||{});o.set=Object.assign(defSave().set,s.set||{});return o;}}catch(e){}return defSave();}
let SV=loadSave();
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SV));}catch(e){}}
const starsEarned=()=>Object.values(SV.stars).reduce((a,b)=>a+b,0);
const starsSpent=()=>SV.tasks.reduce((a,id)=>a+TASKS.find(t=>t.id===id).cost,0);
const starsHave=()=>starsEarned()-starsSpent();
const vib=p=>{if(SV.set.vib&&navigator.vibrate)try{navigator.vibrate(p);}catch(e){}};
const sfx=(n,a)=>SND.play(n,a);
// ---------- sprites ----------
function spr(name,x,y,size,rot,alpha){const f=FRAMES[name];if(!f)return;const k=size/f[6];
  if(rot||alpha!=null){ctx.save();if(alpha!=null)ctx.globalAlpha*=alpha;ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.drawImage(ATLAS,f[0],f[1],f[2],f[3],-f[4]*k,-f[5]*k,f[2]*k,f[3]*k);ctx.restore();}
  else ctx.drawImage(ATLAS,f[0],f[1],f[2],f[3],x-f[4]*k,y-f[5]*k,f[2]*k,f[3]*k);}
function icon(name,size,cls){const f=FRAMES[name];if(!f)return '';const k=size/Math.max(f[2],f[3]);
  return '<span class="icw '+(cls||'')+'" style="width:'+size+'px;height:'+size+'px"><span class="ico" style="width:'+(f[2]*k).toFixed(1)+'px;height:'+(f[3]*k).toFixed(1)+'px;background-size:'+(AW*k).toFixed(1)+'px '+(AH*k).toFixed(1)+'px;background-position:'+(-f[0]*k).toFixed(1)+'px '+(-f[1]*k).toFixed(1)+'px"></span></span>';}
const goalSpr=g=>g.t==='collect'?'t'+g.k:g.t==='mud'?'mud1':g.t==='crate'?'crate2':g.t==='wire'?'wire':'calf';
const goalName=g=>g.t==='collect'?TILE_NAMES[g.k]:g.t==='mud'?'Mud':g.t==='crate'?'Crates':g.t==='wire'?'Barbed wire':'Calves';
// ---------- state ----------
let mode='load',S=null,LV=null,LNUM=0,CS=50,BX=0,BY=0;
let vis=new Map(),dying=[],parts=[],texts=[],fxs=[],flyers=[],crateShake={};
let busy=false,shake=0,hintT=0,hintMove=null,sel=-1,drag=null,boostMode=null,fast=1,leftAtWin=0,T=0,waiters=[];
let farmFx={fade:{},arrowTask:null},ambient=[];
// ---------- layout ----------
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);layout();}
function layout(){if(!S)return;const hud=$('hud').offsetHeight||100,bb=$('bbar').offsetHeight||90;const top=hud+12,avail=H-top-bb-12;
  CS=Math.min((W-14)/S.W,avail/S.H,74);BX=(W-CS*S.W)/2;BY=top+(avail-CS*S.H)/2;}
const cx=c=>BX+(c+.5)*CS,cy=r=>BY+(r+.5)*CS;
function cellAt(x,y){if(!S)return -1;const c=Math.floor((x-BX)/CS),r=Math.floor((y-BY)/CS);if(c<0||r<0||c>=S.W||r>=S.H)return -1;const i=r*S.W+c;return S.cells[i].v?-1:i;}
// ---------- vis tiles ----------
function mkVis(t,c,r){const v={id:t.id,k:t.k,sp:t.sp,x:c,y:r,tx:c,ty:r,vy:0,mv:0,sc:1,born:0,sq:0};vis.set(t.id,v);return v;}
function rebuildVis(dropIn){vis.clear();S.cells.forEach((ce,i)=>{if(ce.t){const c=i%S.W,r=(i/S.W)|0;const v=mkVis(ce.t,c,r);if(dropIn){v.y=r-S.H-1-c*.35-Math.random()*.3;v.mv=2;v.vy=0;}}});}
function tweenTo(id,i,dur){const v=vis.get(id);if(!v)return;v.sx=v.x;v.sy=v.y;v.tx=i%S.W;v.ty=(i/S.W)|0;v.t0=T;v.dur=dur||.14;v.mv=1;}
function settle(){return new Promise(r=>{waiters.push(r);});}
const wait=ms=>new Promise(r=>setTimeout(r,ms*fast));
function updVis(dt){let moving=false;
  for(const v of vis.values()){if(v.born>0)v.born=Math.max(0,v.born-dt*4);if(v.sq>0)v.sq=Math.max(0,v.sq-dt*5);
    if(v.mv===1){const p=Math.min(1,(T-v.t0)/v.dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;v.x=v.sx+(v.tx-v.sx)*e;v.y=v.sy+(v.ty-v.sy)*e;if(p>=1){v.mv=0;v.x=v.tx;v.y=v.ty;}else moving=true;}
    else if(v.mv===2){v.vy=Math.min(v.vy+70*dt,24);const d=v.ty-v.y;const st=v.vy*dt;if(st>=d){v.y=v.ty;v.x=v.tx;v.mv=0;v.vy=0;v.sq=1;}else{v.y+=st;if(v.x!==v.tx)v.x+=(v.tx-v.x)*Math.min(1,st/Math.max(d,.001));moving=true;}}}
  if(!moving&&waiters.length){const w=waiters;waiters=[];w.forEach(f=>f());}}
// ---------- effects ----------
function burst(x,y,col,n,spd,size,kind){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=(.3+Math.random())*spd;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-spd*.3,life:.5+Math.random()*.4,t:0,col,size:size*(.6+Math.random()*.7),kind:kind||0,rot:Math.random()*6,vr:(Math.random()-.5)*10});}}
function addText(s,x,y,col,size){texts.push({s,x,y,t:0,col:col||'#fff3b0',size:size||30});}
function banner(s){const b=$('banner');b.textContent=s;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');}
function goalEl(gi){return document.getElementById('g'+gi);}
function fly(sprn,x,y,gi){const el=goalEl(gi);if(!el)return;const r=el.getBoundingClientRect();flyers.push({spr:sprn,x,y,sx:x,sy:y,tx:r.left+r.width/2,ty:r.top+r.height/2-6,t:0,d:.55+Math.random()*.15,gi});}
function playClear(r){
  const chain=r.chain;let big=0;
  for(const f of r.fx){fxs.push(Object.assign({age:0},f));
    if(f.t==='line'){sfx('line');shake=Math.max(shake,4);vib(20);}
    else if(f.t==='bomb'){sfx('bomb');shake=Math.max(shake,f.big?14:9);vib(35);const c=f.i%S.W,rw=(f.i/S.W)|0;burst(cx(c),cy(rw),'#4fc3f7',26,CS*6,CS*.12,1);}
    else if(f.t==='cyc'||f.t==='cycall'){sfx('cyc');shake=Math.max(shake,f.t==='cycall'?18:10);vib([30,40,30]);}
    else if(f.t==='cross3'){sfx('line');sfx('bomb');shake=Math.max(shake,12);vib(40);}
    else if(f.t==='boost'){sfx('crate');}
    big++;}
  const flyCount={};let mudN=0,wireN=0;
  for(const c of r.cleared){const v=vis.get(c.id);const col=c.i%S.W,rw=(c.i/S.W)|0;const x=cx(col),y=cy(rw);
    if(v){vis.delete(c.id);dying.push({k:v.k,sp:v.sp,x:v.x,y:v.y,t:0});}
    burst(x,y,TILE_COL[c.k],7,CS*3.2,CS*.09,0);if(Math.random()<.4)burst(x,y,'#7cb342',2,CS*2.4,CS*.1,2);
    S.goals.forEach((g,gi)=>{if(g.t==='collect'&&g.k===c.k&&g.got-(flyCount[gi]||0)<=g.n+2){flyCount[gi]=(flyCount[gi]||0)+1;if(flyCount[gi]<=8)fly('t'+c.k,x,y,gi);}});
    if(c.mud){mudN++;burst(x,y,'#7a3a1c',6,CS*2.5,CS*.1,0);if(c.mud===1){const gi=S.goals.findIndex(g=>g.t==='mud');if(gi>=0)fly('mud1',x,y,gi);}}
    if(c.wire){wireN++;burst(x,y,'#90a4ae',6,CS*2.8,CS*.07,3);const gi=S.goals.findIndex(g=>g.t==='wire');if(gi>=0)fly('wire',x,y,gi);}}
  for(const h of r.hits){const col=h.i%S.W,rw=(h.i/S.W)|0;crateShake[h.i]=.3;burst(cx(col),cy(rw),'#c48a52',10,CS*3,CS*.1,3);if(!h.left){const gi=S.goals.findIndex(g=>g.t==='crate');if(gi>=0)fly('crate2',cx(col),cy(rw),gi);}}
  if(r.hits.length)sfx('crate');if(mudN)sfx('mud');if(wireN)sfx('wire');
  if(r.cleared.length)sfx('pop',chain);
  for(const c of r.created){const col=c.i%S.W,rw=(c.i/S.W)|0;const t=S.cells[c.i].t;if(t){const v=mkVis(t,col,rw);v.born=1;burst(cx(col),cy(rw),'#fff59d',14,CS*3,CS*.08,1);}sfx('special');vib(15);}
  if(r.cleared.length&&!big)vib(8);
  if(chain>=2||r.cleared.length>=9){addText(CHEERS[Math.min(CHEERS.length-1,Math.max(0,chain-2+(r.cleared.length>=12?1:0)))+((Math.random()*2)|0)]||'Bonza!',W/2,BY+CS*S.H*.42,'#fff3b0',34+Math.min(chain,5)*3);}
  // stack score popups
  if(r.cleared.length>=4){const c0=r.cleared[r.cleared.length>>1];addText('+'+(r.cleared.length*20*(1+chain*.5)|0),cx(c0.i%S.W),cy((c0.i/S.W)|0),'#ffffff',18);}
}
function applyFall(f){
  for(const m of f.moves){const ti=m.to,c=ti%S.W,r=(ti/S.W)|0;let v=vis.get(m.id);
    if(!v){const t=S.cells[ti].t||f.spawns.find(s=>s.id===m.id);const tt=t&&t.k!=null?t:{id:m.id,k:0,sp:null};v=mkVis({id:m.id,k:tt.k,sp:tt.sp||null},c,r);if(m.spawn){v.y=m.from-.15;v.x=c;}}
    v.tx=c;v.ty=r;v.mv=2;v.vy=Math.max(v.vy,2);}
  for(const cl of f.calves){const v=vis.get(cl.id);const c=cl.i%S.W,r=(cl.i/S.W)|0;if(v){vis.delete(cl.id);}dying.push({k:6,x:c,y:r,t:0,calf:1});
    setTimeout(()=>{sfx('moo');vib([20,30,20]);addText('Moo!',cx(c),cy(r)+CS*.5,'#ffffff',26);const gi=S.goals.findIndex(g=>g.t==='calf');if(gi>=0)fly('calf',cx(c),cy(r)+CS,gi);updateHUD();},250*fast);}
  // safety: make sure every board tile has a vis
  S.cells.forEach((ce,i)=>{if(ce.t&&!vis.has(ce.t.id))mkVis(ce.t,i%S.W,(i/S.W)|0);else if(ce.t){const v=vis.get(ce.t.id);v.k=ce.t.k;v.sp=ce.t.sp;}});
}
// ---------- core flow ----------
async function resolveSteps(){for(let guard=0;guard<80;guard++){const r=M3.step(S);if(!r)break;playClear(r);updateHUD();
    const big=r.fx.some(f=>f.t==='cyc'||f.t==='cycall'||f.t==='cross3'||(f.t==='bomb'&&f.big));await wait(big?430:r.fx.length?290:200);
    const f=M3.fall(S);applyFall(f);await settle();await wait(30);}}
async function resolve(){busy=true;await resolveSteps();updateHUD();
  if(M3.won(S)){leftAtWin=M3.movesLeft(S);await wait(250);await bonus();win();return;}
  if(M3.movesLeft(S)<=0){await wait(300);lose();return;}
  if(!M3.findMoves(S).length){banner('No moves – shuffle!');await wait(600);M3.shuffle(S);shuffleAnim();await settle();}
  busy=false;hintT=0;hintMove=null;}
function shuffleAnim(){sfx('whoosh');S.cells.forEach((ce,i)=>{if(ce.t)tweenTo(ce.t.id,i,.45);});}
async function attemptSwap(a,b){if(busy||mode!=='level'||!S||!M3.adjacent(S,a,b))return false;const A=S.cells[a],B=S.cells[b];if(!M3.movable(A)||!M3.movable(B)){if(A.wire||B.wire){sfx('bad');}return false;}
  hintMove=null;hintT=0;sel=-1;busy=true;const ta=A.t,tb=B.t;
  if(M3.canSwap(S,a,b)){M3.trySwap(S,a,b);sfx('swap');tweenTo(ta.id,b);tweenTo(tb.id,a);await settle();updateHUD();await resolve();return true;}
  sfx('bad');vib(12);tweenTo(ta.id,b,.11);tweenTo(tb.id,a,.11);await settle();tweenTo(ta.id,a,.11);tweenTo(tb.id,b,.11);await settle();busy=false;return false;}
async function bonus(){if(M3.movesLeft(S)<=0&&!M3.specialsLeft(S).length)return;fast=.5;banner('Mango Madness!');sfx('special');await wait(900);
  while(M3.movesLeft(S)>0){const i=M3.bonusPick(S);if(i<0)break;const t=S.cells[i].t;const v=vis.get(t.id);if(v){v.sp=t.sp;v.born=1;}addText('+1 Ute',cx(i%S.W),cy((i/S.W)|0),'#ffe082',18);updateHUD();await wait(180);await resolveSteps();}
  for(let g=0;g<10;g++){const sp=M3.specialsLeft(S);if(!sp.length)break;S.combo={type:'cells',cells:sp};await resolveSteps();}
  fast=1;updateHUD();}
// ---------- level start / end ----------
function startLevel(n,pre){LNUM=n;LV=LEVELS[n-1];const L=Object.assign({},LV);S=M3.create(L,(Date.now()^(n*7919))>>>0);pre=pre||{};
  if(pre.esky&&SV.boost.esky>0){SV.boost.esky--;S.moves+=3;}
  if(pre.bomb&&SV.boost.bomb>0){SV.boost.bomb--;M3.placeSpecial(S,'bomb');}
  if(pre.uteb&&SV.boost.uteb>0){SV.boost.uteb--;M3.placeSpecial(S,Math.random()<.5?'h':'v');}
  save();mode='level';busy=false;sel=-1;boostMode=null;hintT=0;hintMove=null;dying=[];parts=[];texts=[];fxs=[];flyers=[];crateShake={};fast=1;
  showUI('level');buildGoals();buildBoosters();updateHUD();layout();rebuildVis(true);busy=true;sfx('whoosh');settle().then(()=>{busy=false;});
  banner('Level '+n);if(SV.set.mus)SND.music(true);}
function starCount(){return 1+(leftAtWin>=LV.stars[1]?1:0)+(leftAtWin>=LV.stars[2]?1:0);}
function win(){mode='level';busy=true;const st=starCount();const first=!SV.stars[LNUM];SV.stars[LNUM]=Math.max(SV.stars[LNUM]||0,st);SV.best[LNUM]=Math.max(SV.best[LNUM]||0,S.score);
  let reward=null;if(!SV.rewarded[LNUM]){SV.rewarded[LNUM]=1;reward=REWARD_CYCLE[(LNUM-1)%REWARD_CYCLE.length];SV.boost[reward]=(SV.boost[reward]||0)+1;}
  if(LNUM>=SV.lvl)SV.lvl=LNUM+1;save();sfx('win');vib([30,50,30,50,60]);
  const html='<h2>Paddock cleared!</h2><p class="small">Level '+LNUM+' · '+LV.name+'</p><div class="stars">'+[0,1,2].map(i=>icon('star',58,'off s'+i)).join('')+'</div><p><b>Score '+S.score.toLocaleString()+'</b> · '+leftAtWin+' moves to spare</p>'+
    (reward?'<p>Reward: '+icon(BOOSTERS[reward].spr,30)+' <b>'+BOOSTERS[reward].name+'</b></p>':'')+'<p class="small">You have <b>★ '+starsHave()+'</b> to spend on farm jobs.</p><button class="btn gold" id="mContinue">Back to the farm</button>'+(LNUM<LEVELS.length?'<button class="btn" id="mNext">Next level ▶</button>':'');
  modal(html);const els=document.querySelectorAll('#modal .stars .icw');for(let i=0;i<st;i++)setTimeout(()=>{els[i].classList.remove('off');els[i].classList.add('pop');sfx('star',i);vib(20);},400+i*380);
  $('mContinue').onclick=()=>{sfx('click');closeModal();goFarm();};if($('mNext'))$('mNext').onclick=()=>{sfx('click');closeModal();preLevel(LNUM+1);};}
function lose(){busy=true;sfx('lose');vib(80);const rem=S.goals.map((g,gi)=>g.got<g.n?'<div class="goal">'+icon(goalSpr(g),40)+'<span class="n">'+(g.n-g.got)+'</span></div>':'').join('');
  modal('<h2>Out of moves!</h2><p>So close. Still to go:</p><div class="glist">'+rem+'</div>'+(SV.boost.esky>0?'<button class="btn gold" id="mEsky">'+icon('b_esky',28)+' Crack an Esky: +5 moves ('+SV.boost.esky+' left)</button>':'<p class="small">Tip: win levels and finish farm jobs to earn Eskies (+moves).</p>')+'<button class="btn" id="mRetry">Try again</button><button class="btn grey" id="mQuit">Back to the farm</button>');
  if($('mEsky'))$('mEsky').onclick=()=>{SV.boost.esky--;save();S.moves+=5;closeModal();updateHUD();busy=false;sfx('special');banner('+5 moves!');};
  $('mRetry').onclick=()=>{closeModal();preLevel(LNUM);};$('mQuit').onclick=()=>{closeModal();goFarm();};}
// ---------- HUD ----------
function showUI(m){$('hud').style.display=m==='level'?'flex':'none';$('bbar').style.display=m==='level'?'flex':'none';$('fhud').style.display=m==='farm'?'flex':'none';$('fbot').style.display=m==='farm'?'flex':'none';$('title').style.display=m==='title'?'flex':'none';if(m!=='level')$('boostTip').style.display='none';$('tArrow').style.display='none';}
function buildGoals(){$('goals').innerHTML=S.goals.map((g,gi)=>'<div class="goal" id="g'+gi+'">'+icon(goalSpr(g),44)+'<span class="n"></span></div>').join('');$('lvlname').textContent='Level '+LNUM;}
let lastGot=[];
function updateHUD(){if(!S)return;const ml=M3.movesLeft(S);$('mv').textContent=Math.max(0,ml);$('moves').classList.toggle('low',ml<=5&&!M3.won(S));$('score').textContent=S.score.toLocaleString();
  S.goals.forEach((g,gi)=>{const el=goalEl(gi);if(!el)return;const left=Math.max(0,g.n-g.got);el.querySelector('.n').textContent=left?left:'✔';el.classList.toggle('done',!left);});}
function buildBoosters(){$('bbar').innerHTML=['shovel','tractor','willy'].map(k=>'<div class="boost'+(SV.boost[k]?'':' zero')+(boostMode===k?' on':'')+'" data-b="'+k+'">'+icon(BOOSTERS[k].spr,48)+'<span class="c">'+(SV.boost[k]||0)+'</span></div>').join('');
  document.querySelectorAll('#bbar .boost').forEach(el=>el.onclick=()=>pickBoost(el.dataset.b));}
function tip(s){const t=$('boostTip');if(!s){t.style.display='none';return;}t.textContent=s;t.style.display='block';}
function pickBoost(k){sfx('click');if(busy)return;if(!SV.boost[k]){tip('No '+BOOSTERS[k].name+'s left – win levels to earn more!');setTimeout(()=>tip(''),1800);return;}
  if(k==='willy'){SV.boost.willy--;save();busy=true;M3.shuffle(S);shuffleAnim();settle().then(()=>{busy=false;});buildBoosters();banner('Willy-willy!');return;}
  boostMode=boostMode===k?null:k;tip(boostMode?(k==='shovel'?'Tap a tile or blocker to dig it out':'Tap a row for the tractor to plough'):'');buildBoosters();}
async function useBoost(i){const k=boostMode;boostMode=null;tip('');SV.boost[k]--;save();buildBoosters();busy=true;
  if(k==='shovel'){S.combo={type:'cells',cells:[i]};fxs.push({t:'shovel',i,age:0});}
  else{const r=(i/S.W)|0;const cells=[];for(let c=0;c<S.W;c++)cells.push(r*S.W+c);S.combo={type:'cells',cells};fxs.push({t:'tractor',i,age:0});sfx('line');}
  vib(20);await wait(250);await resolve();}
// ---------- modals / dialogue ----------
function modal(html){const m=$('modal');m.innerHTML='<div class="card board">'+html+'</div>';m.style.display='flex';}
function closeModal(){$('modal').style.display='none';$('modal').innerHTML='';}
let dlgQ=null;
function dialogue(lines,cb){if(!lines||!lines.length){cb&&cb();return;}let i=0;const d=$('dlg');d.style.display='flex';
  const show=()=>{const [who,txt]=lines[i];d.classList.toggle('right',who==='B');const pc=$('por').getContext('2d');pc.setTransform(1,0,0,1,0,0);pc.clearRect(0,0,232,248);const f=FRAMES[who==='J'?'jesse':'blue'];const k=Math.min(232/f[2],248/f[3]);pc.drawImage(ATLAS,f[0],f[1],f[2],f[3],(232-f[2]*k)/2,248-f[3]*k,f[2]*k,f[3]*k);
    $('bub').innerHTML='<b>'+(who==='J'?'Jesse':'Blue')+'</b>'+txt+'<span class="tap">tap ▸</span>';if(who==='B')sfx('bark');else sfx('click');};
  show();dlgQ=()=>{i++;if(i>=lines.length){d.style.display='none';dlgQ=null;cb&&cb();}else show();};}
$('dlg').addEventListener('click',e=>{e.stopPropagation();e.preventDefault();if(dlgQ)dlgQ();});
// ---------- farm ----------
let fs=1,fox=0,foy=0;
function farmLayout(){fs=Math.min(W/720,(H-90)/1280);if(fs<W/720*0.9)fs=Math.min(W/720,(H-60)/1280);const fw=720*fs,fh=1280*fs;fox=(W-fw)/2;foy=Math.max(0,Math.min(H-fh-120,(H-fh)/2));if(foy+fh<H-150)foy=H-150-fh;foy=Math.max(Math.min(foy,60),H-fh-170,0);}
function goFarm(){mode='farm';S=null;showUI('farm');farmLayout();updateFarmHUD();SND.music(!!SV.set.mus);
  setTimeout(()=>{if(mode!=='farm')return;const nt=nextTask();if(nt&&!SV.seen[nt.id]&&SV.intro){SV.seen[nt.id]=1;save();dialogue(nt.intro,updateFarmHUD);}},350);}
function availTasks(){const undone=TASKS.filter(t=>!SV.tasks.includes(t.id));return undone.slice(0,2);}
function nextTask(){return TASKS.find(t=>!SV.tasks.includes(t.id));}
function updateFarmHUD(){$('starChip').innerHTML=icon('star',30)+'<span>'+starsHave()+'</span>';const n=Math.min(SV.lvl,LEVELS.length);
  $('bPlay').innerHTML=SV.lvl>LEVELS.length?'All levels done – replay ▶':'▶ Play Level '+n;const can=availTasks().filter(t=>t.cost<=starsHave()).length;
  $('bTasks').innerHTML='🔨 Farm jobs'+(can?'<span class="badge">'+can+'</span>':'');
  const nt=availTasks().find(t=>t.cost<=starsHave());farmFx.arrowTask=nt||null;
  const ar=$('tArrow');if(nt&&mode==='farm'){const p=taskPos(nt);ar.style.display='block';ar.style.left=(fox+p[0]*fs-15)+'px';ar.style.top=(foy+p[1]*fs-60)+'px';}else ar.style.display='none';}
function taskPos(t){const s=(t.before[0]||t.after[0]);return [s[1],s[2]];}
function tasksModal(){sfx('click');const av=availTasks().map(t=>t.id);const have=starsHave();
  modal('<h2>Farm jobs</h2><p class="small">You have '+icon('star',22)+' <b>'+have+'</b> stars. Win levels to earn more.</p><div class="tasks">'+TASKS.map(t=>{const done=SV.tasks.includes(t.id),open=av.includes(t.id);
    return '<div class="task'+(done?' done':open?'':' locked')+'"><span class="tn">'+(done?'✅ ':open?'':'🔒 ')+t.name+'</span>'+(done?'':open?'<button class="btn'+(have>=t.cost?' gold':'')+'" data-t="'+t.id+'"'+(have>=t.cost?'':' disabled')+'>'+icon('star',18)+' '+t.cost+'</button>':'<span class="small">'+icon('star',16)+' '+t.cost+'</span>')+'</div>';}).join('')+'</div><button class="btn grey" id="mClose">Close</button>');
  $('mClose').onclick=()=>{sfx('click');closeModal();};document.querySelectorAll('#modal [data-t]').forEach(b=>b.onclick=()=>{const t=TASKS.find(x=>x.id===b.dataset.t);if(starsHave()<t.cost)return;closeModal();doTask(t);});}
function doTask(t){if(SV.tasks.includes(t.id)||starsHave()<t.cost)return false;SV.tasks.push(t.id);const reward=REWARD_CYCLE[(SV.tasks.length+2)%REWARD_CYCLE.length];SV.boost[reward]=(SV.boost[reward]||0)+1;save();
  farmFx.fade[t.id]=0;sfx('task');vib([20,40,20]);const [x,y]=taskPos(t);
  for(let i=0;i<40;i++)parts.push({x:fox+x*fs+(Math.random()-.5)*120*fs,y:foy+y*fs+(Math.random()-.5)*60*fs,vx:(Math.random()-.5)*120,vy:-40-Math.random()*90,life:1+Math.random(),t:0,col:Math.random()<.5?'rgba(200,150,100,.8)':'#fff59d',size:4+Math.random()*7,kind:Math.random()<.3?1:4,rot:0,vr:0});
  updateFarmHUD();setTimeout(()=>{dialogue(t.done.concat([['J','Job done! Here, have a '+BOOSTERS[reward].name+' for your trouble.']]),()=>{updateFarmHUD();const nt=nextTask();if(nt&&!SV.seen[nt.id]){SV.seen[nt.id]=1;save();setTimeout(()=>dialogue(nt.intro,updateFarmHUD),300);}else if(!nt){banner('Farm restored!');}});},900);return true;}
function levelsModal(){sfx('click');const top=Math.min(SV.lvl,LEVELS.length);modal('<h2>Levels</h2><div class="lvgrid">'+LEVELS.map((L,i)=>{const n=i+1,lock=n>top,st=SV.stars[n]||0;return '<button class="lv'+(lock?' lock':'')+(n===top&&SV.lvl<=LEVELS.length?' cur':'')+'" data-l="'+n+'"'+(lock?' disabled':'')+'>'+(lock?'🔒':n)+'<small>'+(lock?'&nbsp;':'★'.repeat(st)+'☆'.repeat(3-st))+'</small></button>';}).join('')+'</div><button class="btn grey" id="mClose">Close</button>');
  $('mClose').onclick=()=>{sfx('click');closeModal();};document.querySelectorAll('#modal [data-l]').forEach(b=>b.onclick=()=>{closeModal();preLevel(+b.dataset.l);});}
let preSel={};
function preLevel(n){sfx('click');const L=LEVELS[n-1];preSel={};
  const render=()=>{modal('<h2>Level '+n+'</h2><p><b>'+L.name+'</b></p><div class="glist">'+L.goals.map(g=>{const gg=M3.create(Object.assign({},L),1).goals.find(x=>x.t===g.t&&x.k===g.k);return '<div class="goal">'+icon(goalSpr(g),48)+'<span class="n">'+gg.n+'</span></div>';}).join('')+'</div>'+
    '<p>'+L.moves+' moves · '+L.goals.map(g=>goalName(g)).join(' + ')+'</p><p class="small">★★ finish with '+L.stars[1]+'+ moves left · ★★★ with '+L.stars[2]+'+</p>'+(SV.stars[n]?'<div class="stars">'+[0,1,2].map(i=>icon('star',30,i<SV.stars[n]?'':'off')).join('')+'</div>':'')+
    '<p class="small" style="margin-top:10px">Bring along a booster:</p><div class="prebo">'+['bomb','uteb','esky'].map(k=>'<div class="boost'+(SV.boost[k]?'':' zero')+(preSel[k]?' on':'')+'" data-p="'+k+'">'+icon(BOOSTERS[k].spr,44)+'<span class="c">'+(SV.boost[k]||0)+'</span></div>').join('')+'</div><p class="small" id="preDesc">&nbsp;</p>'+
    '<button class="btn gold" id="mGo">Play!</button><button class="btn grey" id="mClose">Not now</button>');
    $('mGo').onclick=()=>{sfx('click');closeModal();startLevel(n,preSel);};$('mClose').onclick=()=>{sfx('click');closeModal();if(mode!=='farm')goFarm();};
    document.querySelectorAll('#modal [data-p]').forEach(b=>b.onclick=()=>{const k=b.dataset.p;if(!SV.boost[k]){$('preDesc').textContent='None left – earn more by winning levels.';return;}preSel[k]=!preSel[k];sfx('click');render();$('preDesc').textContent=BOOSTERS[k].name+': '+BOOSTERS[k].desc;});};
  render();}
function settingsModal(fromLevel){sfx('click');const row=(k,l)=>'<div class="tog"><span>'+l+'</span><button class="sw'+(SV.set[k]?' on':'')+'" data-s="'+k+'" aria-label="'+l+'"></button></div>';
  modal('<h2>'+(fromLevel?'Paused':'Settings')+'</h2>'+row('snd','🔊 Sound effects')+row('mus','🎵 Music')+row('vib','📳 Vibration')+(fromLevel?'<button class="btn gold" id="mResume">Resume</button><button class="btn" id="mRestart">Restart level</button><button class="btn grey" id="mQuit">Quit to farm</button>':'<button class="btn gold" id="mClose">Done</button><button class="btn red" id="mReset" style="font-size:14px;min-height:40px">Reset all progress</button><p class="small">Outback Orchard v1 · made for Jesse’s farm · no ads, no purchases</p>'));
  document.querySelectorAll('#modal [data-s]').forEach(b=>b.onclick=()=>{const k=b.dataset.s;SV.set[k]=SV.set[k]?0:1;save();b.classList.toggle('on',!!SV.set[k]);SND.sfx=!!SV.set.snd;if(k==='mus')SND.music(!!SV.set.mus);if(k==='vib')vib(30);sfx('click');});
  if(fromLevel){$('mResume').onclick=()=>{sfx('click');closeModal();};$('mRestart').onclick=()=>{closeModal();preLevel(LNUM);};$('mQuit').onclick=()=>{closeModal();goFarm();};}
  else{$('mClose').onclick=()=>{sfx('click');closeModal();};let armed=false;$('mReset').onclick=()=>{if(!armed){armed=true;$('mReset').textContent='Tap again to wipe everything';return;}SV=defSave();save();closeModal();location.reload();};}}
// ---------- input ----------
cv.addEventListener('pointerdown',e=>{SND.resume();if(mode!=='level'||busy||$('modal').style.display==='flex')return;const i=cellAt(e.clientX,e.clientY);if(i<0){sel=-1;return;}
  if(boostMode){useBoost(i);return;}drag={i,x:e.clientX,y:e.clientY,moved:false};});
cv.addEventListener('pointermove',e=>{if(!drag||busy)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.max(Math.abs(dx),Math.abs(dy))<CS*.3)return;
  const i=drag.i,c=i%S.W,r=(i/S.W)|0;let j=-1;if(Math.abs(dx)>Math.abs(dy)){if(dx>0&&c<S.W-1)j=i+1;else if(dx<0&&c>0)j=i-1;}else{if(dy>0&&r<S.H-1)j=i+S.W;else if(dy<0&&r>0)j=i-S.W;}
  drag=null;sel=-1;if(j>=0&&!S.cells[j].v)attemptSwap(i,j);});
cv.addEventListener('pointerup',e=>{if(!drag)return;const i=drag.i;drag=null;if(busy)return;if(sel>=0&&sel!==i&&M3.adjacent(S,sel,i)){const a=sel;sel=-1;attemptSwap(a,i);}else{sel=sel===i?-1:i;if(sel>=0)sfx('click');}});
cv.addEventListener('pointercancel',()=>{drag=null;});
$('bPause').onclick=()=>{if(mode==='level')settingsModal(true);};
$('bSet').onclick=()=>settingsModal(false);$('bLevels').onclick=levelsModal;$('bTasks').onclick=tasksModal;
$('bPlay').onclick=()=>{if(SV.lvl>LEVELS.length)levelsModal();else preLevel(SV.lvl);};
$('bStart').onclick=()=>{SND.resume();sfx('click');SND.sfx=!!SV.set.snd;if(SV.set.mus)SND.music(true);
  if(!SV.intro){SV.intro=1;save();goFarm();setTimeout(()=>dialogue(INTRO,()=>{const nt=nextTask();SV.seen[nt.id]=1;save();dialogue(nt.intro,updateFarmHUD);}),200);}else goFarm();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)SND.music(false);else if(SV.set.mus&&mode!=='load'&&mode!=='title')SND.music(true);});
// ---------- update / render ----------
function update(dt){T+=dt;updVis(dt);
  for(const d of dying)d.t+=dt;dying=dying.filter(d=>d.t<(d.calf?.6:.25));
  for(const p of parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.kind===4?20:CS*9)*dt;p.vx*=.98;p.rot+=p.vr*dt;}parts=parts.filter(p=>p.t<p.life);
  for(const t of texts){t.t+=dt;t.y-=28*dt;}texts=texts.filter(t=>t.t<1.2);
  for(const f of fxs)f.age+=dt;fxs=fxs.filter(f=>f.age<(f.t==='cyc'||f.t==='cycall'?.5:f.t==='tractor'?.7:.42));
  for(const f of flyers){f.t+=dt/f.d;if(f.t>=1&&!f.done){f.done=1;const el=goalEl(f.gi);if(el){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}}}flyers=flyers.filter(f=>f.t<1);
  for(const k in crateShake){crateShake[k]-=dt;if(crateShake[k]<=0)delete crateShake[k];}
  shake=Math.max(0,shake-dt*40);
  if(mode==='level'&&S&&!busy&&!boostMode&&$('modal').style.display!=='flex'){hintT+=dt;if(hintT>5&&!hintMove){const ms=M3.findMoves(S);hintMove=ms.length?ms[(Math.random()*ms.length)|0]:null;}}
  for(const k in farmFx.fade)farmFx.fade[k]=Math.min(1,farmFx.fade[k]+dt*1.2);
  if(ambient.length<18&&Math.random()<dt*3)ambient.push({x:Math.random()*W,y:H*.2+Math.random()*H*.7,vx:8+Math.random()*14,vy:(Math.random()-.5)*4,t:0,life:5+Math.random()*4,s:1+Math.random()*1.6});
  for(const a of ambient){a.t+=dt;a.x+=a.vx*dt;a.y+=a.vy*dt+Math.sin(T+a.s*9)*.15;}ambient=ambient.filter(a=>a.t<a.life);}
function drawBg(dim){if(FARM.complete&&FARM.naturalWidth){const s=Math.max(W/FARM.naturalWidth,H/FARM.naturalHeight);ctx.drawImage(FARM,(W-FARM.naturalWidth*s)/2,(H-FARM.naturalHeight*s)/2,FARM.naturalWidth*s,FARM.naturalHeight*s);}else{ctx.fillStyle='#8a6a3a';ctx.fillRect(0,0,W,H);}
  if(dim){ctx.fillStyle='rgba(35,18,6,'+dim+')';ctx.fillRect(0,0,W,H);}}
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function drawTile(k,sp,x,y,size,a){if(sp==='cyc'){spr('cyc',x,y,size*1.02,T*2.4,a);return;}if(k===6){spr('calf',x,y+Math.sin(T*3+x)*CS*.02,size,0,a);return;}
  spr('t'+k,x,y,size,0,a);
  if(sp==='h'||sp==='v'){const p=.75+.25*Math.sin(T*6);spr('ov_line',x,y,size*1.02,sp==='v'?Math.PI/2:0,(a==null?1:a)*p);}
  else if(sp==='bomb')spr('ov_bomb',x,y,size*.98,T*1.2,a);}
function renderLevel(){drawBg(.42);
  const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;ctx.save();ctx.translate(sx,sy);
  // board panel
  ctx.fillStyle='rgba(30,14,4,.62)';for(let i=0;i<S.cells.length;i++){if(S.cells[i].v)continue;const c=i%S.W,r=(i/S.W)|0;rrect(BX+c*CS-4,BY+r*CS-4,CS+8,CS+8,10);ctx.fill();}
  for(let i=0;i<S.cells.length;i++){const ce=S.cells[i];if(ce.v)continue;const c=i%S.W,r=(i/S.W)|0;ctx.fillStyle=(c+r)%2?'rgba(255,236,190,.16)':'rgba(255,236,190,.26)';rrect(BX+c*CS+1.5,BY+r*CS+1.5,CS-3,CS-3,7);ctx.fill();
    if(ce.mud)spr('mud'+ce.mud,cx(c),cy(r),CS*1.06);}
  if(sel>=0){const c=sel%S.W,r=(sel/S.W)|0;ctx.strokeStyle='rgba(255,236,120,'+(.6+.4*Math.sin(T*8))+')';ctx.lineWidth=3;rrect(BX+c*CS+2,BY+r*CS+2,CS-4,CS-4,8);ctx.stroke();}
  // tiles (clip to board box so spawns slide in)
  ctx.save();ctx.beginPath();ctx.rect(BX-CS,BY-2,CS*(S.W+2),CS*S.H+CS);ctx.clip();
  const hm=hintMove&&hintT>5?hintMove:null;
  for(const v of vis.values()){let x=cx(v.x),y=cy(v.y);let size=CS*1.13;
    if(hm){const ids=hm.map(i=>S.cells[i].t&&S.cells[i].t.id);const hi=ids.indexOf(v.id);if(hi>=0){const o=hm[1-hi],oc=o%S.W,or=(o/S.W)|0;const w=Math.sin(T*10)*.08*CS;const dx=Math.sign(oc-v.x),dy=Math.sign(or-v.y);x+=dx*w;y+=dy*w;size*=1.06;}}
    if(v.born>0)size*=1+v.born*.5*Math.sin(v.born*Math.PI);
    if(v.sq>0){ctx.save();ctx.translate(x,y+CS*.4);ctx.scale(1+v.sq*.08,1-v.sq*.1);ctx.translate(-x,-(y+CS*.4));drawTile(v.k,v.sp,x,y,size);ctx.restore();}
    else drawTile(v.k,v.sp,x,y,size);}
  for(const d of dying){const x=cx(d.x),y=cy(d.y);if(d.calf){const p=d.t/.6;drawTile(6,null,x,y+p*CS*1.2,CS*1.1,1-p);continue;}const p=d.t/.25;const s=CS*1.13*(p<.35?1+p*.7:(1.25*(1-(p-.35)/.65)));drawTile(d.k,d.sp,x,y,Math.max(1,s),1-p*.6);}
  ctx.restore();
  for(let i=0;i<S.cells.length;i++){const ce=S.cells[i];if(ce.v)continue;const c=i%S.W,r=(i/S.W)|0;
    if(ce.wire)spr('wire',cx(c),cy(r),CS*1.08);
    if(ce.crate){const sh=crateShake[i]?Math.sin(crateShake[i]*60)*CS*.05:0;spr('crate'+ce.crate,cx(c)+sh,cy(r),CS*1.1);}}
  // fx
  for(const f of fxs){const c=f.i%S.W,r=(f.i/S.W)|0,x=cx(c),y=cy(r);
    if(f.t==='line'||f.t==='cross3'){const p=f.age/.42;const beams=f.t==='cross3'?[['h',-1],['h',0],['h',1],['v',-1],['v',0],['v',1]]:[[f.dir,0]];
      for(const [d,o] of beams){ctx.save();ctx.globalAlpha=1-p;const w=CS*.7*(1-p*.6);const g=d==='h'?ctx.createLinearGradient(0,y+o*CS-w/2,0,y+o*CS+w/2):ctx.createLinearGradient(x+o*CS-w/2,0,x+o*CS+w/2,0);g.addColorStop(0,'rgba(255,200,60,0)');g.addColorStop(.5,'rgba(255,255,230,.95)');g.addColorStop(1,'rgba(255,200,60,0)');ctx.fillStyle=g;
        if(d==='h')ctx.fillRect(BX,y+o*CS-w/2,CS*S.W,w);else ctx.fillRect(x+o*CS-w/2,BY,w,CS*S.H);ctx.restore();
        if(o===0){const prog=Math.min(1,f.age/.34);if(d==='h'){spr('ute',BX-CS+prog*(CS*(S.W+2)),y,CS*1.5,0,1-Math.max(0,p-.8)*5);}else spr('ute',x,BY-CS+prog*(CS*(S.H+2)),CS*1.5,Math.PI/2,1-Math.max(0,p-.8)*5);}}}
    else if(f.t==='bomb'){const p=f.age/.42;ctx.save();ctx.globalAlpha=1-p;ctx.strokeStyle='rgba(120,210,255,.95)';ctx.lineWidth=CS*.3*(1-p);ctx.beginPath();ctx.arc(x,y,CS*(.4+p*(f.rad+.6)),0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(225,250,255,'+(.5*(1-p))+')';ctx.beginPath();ctx.arc(x,y,CS*(.3+p*f.rad),0,Math.PI*2);ctx.fill();ctx.restore();}
    else if(f.t==='cyc'){const p=f.age/.5;ctx.save();ctx.globalAlpha=1-p*p;ctx.strokeStyle='rgba(255,240,180,.9)';ctx.lineWidth=2.5;for(const ti of f.targets){const tx=cx(ti%S.W),ty=cy((ti/S.W)|0);ctx.beginPath();ctx.moveTo(x,y);const n=5;for(let s=1;s<=n;s++){const q=s/n;ctx.lineTo(x+(tx-x)*q+(s<n?(Math.random()-.5)*CS*.4:0),y+(ty-y)*q+(s<n?(Math.random()-.5)*CS*.4:0));}ctx.stroke();}
      spr('cyc',x,y,CS*(1.3+p),T*8);ctx.restore();}
    else if(f.t==='cycall'){ctx.fillStyle='rgba(255,250,230,'+(1-f.age/.5)*.8+')';ctx.fillRect(0,0,W,H);}
    else if(f.t==='shovel'){const p=f.age/.42;spr('b_shovel',x+CS*.2,y-CS*.3+Math.sin(p*Math.PI)*CS*.3,CS*1.2,-.3+p*.8);}
    else if(f.t==='tractor'){const p=f.age/.7;spr('b_tractor',BX-CS+p*CS*(S.W+2),y,CS*1.3);}}
  ctx.restore();
  drawParts();
  for(const f of flyers){const e=f.t*f.t*(3-2*f.t);const x=f.sx+(f.tx-f.sx)*e,y=f.sy+(f.ty-f.sy)*e-Math.sin(f.t*Math.PI)*60;spr(f.spr,x,y,CS*(1.05-f.t*.35));}
  drawTexts();}
function drawParts(){for(const p of parts){const a=1-p.t/p.life;ctx.globalAlpha=Math.max(0,a);ctx.fillStyle=p.col;
    if(p.kind===1){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?p.size*.4:p.size;const an=i*Math.PI/4;ctx.lineTo(Math.cos(an)*r,Math.sin(an)*r);}ctx.fill();ctx.restore();}
    else if(p.kind===2||p.kind===3){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillRect(-p.size,-p.size*.35,p.size*2,p.size*.7);ctx.restore();}
    else{ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}}ctx.globalAlpha=1;}
function drawTexts(){ctx.textAlign='center';ctx.textBaseline='middle';for(const t of texts){const p=t.t/1.2;const sc=p<.15?p/.15*1.2:p<.25?1.2-(p-.15)*2:1;ctx.globalAlpha=p>.75?1-(p-.75)*4:1;ctx.font='900 '+(t.size*sc|0)+'px system-ui,sans-serif';ctx.lineWidth=t.size*.18;ctx.strokeStyle='#5a2a00';ctx.lineJoin='round';ctx.strokeText(t.s,t.x,t.y);ctx.fillStyle=t.col;ctx.fillText(t.s,t.x,t.y);}ctx.globalAlpha=1;}
function renderFarm(){ctx.fillStyle='#f4b866';ctx.fillRect(0,0,W,H);ctx.fillStyle='#9a8a4e';ctx.fillRect(0,foy+300*fs,W,H);
  if(FARM.complete)ctx.drawImage(FARM,fox,foy,720*fs,1280*fs);
  const items=[];for(const t of TASKS){const done=SV.tasks.includes(t.id);const f=farmFx.fade[t.id];
    if(done){if(f!=null&&f<1)t.before.forEach(b=>items.push([b,1-f]));t.after.forEach(b=>items.push([b,f==null?1:f]));}else t.before.forEach(b=>items.push([b,1]));}
  items.sort((a,b)=>(a[0][2]+(FRAMES[a[0][0]]?FRAMES[a[0][0]][7]/2:0))-(b[0][2]+(FRAMES[b[0][0]]?FRAMES[b[0][0]][7]/2:0)));
  for(const [b,a] of items){const f=FRAMES[b[0]];if(!f)continue;spr(b[0],fox+b[1]*fs,foy+b[2]*fs,f[6]*fs,0,a);}
  // dust motes
  ctx.fillStyle='rgba(255,240,200,.6)';for(const m of ambient){ctx.globalAlpha=Math.min(1,m.t,m.life-m.t)*.6;ctx.fillRect(m.x,m.y,m.s*1.3,m.s*1.3);}ctx.globalAlpha=1;
  const lg=ctx.createRadialGradient(W*.8,0,0,W*.8,0,H);lg.addColorStop(0,'rgba(255,214,140,.18)');lg.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);
  drawParts();}
let lastT=0,frames=[];
function frame(t){const dt=Math.min(.05,(t-(lastT||t))/1000);lastT=t;frames.push(dt);if(frames.length>240)frames.shift();update(dt);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(mode==='level'&&S)renderLevel();else if(mode==='farm'||mode==='title'){renderFarm();if(mode==='title'){ctx.fillStyle='rgba(30,15,5,.25)';ctx.fillRect(0,0,W,H);}}else{ctx.fillStyle='#3a2412';ctx.fillRect(0,0,W,H);}
  requestAnimationFrame(frame);}
// ---------- boot ----------
function boot(){const list=[[ATLAS,'assets/atlas.webp'],[FARM,'assets/farm.webp']];let n=0;
  list.forEach(([im,src])=>{im.onload=im.onerror=()=>{n++;$('lbi').style.width=(n/list.length*100)+'%';if(n===list.length)ready();};im.src=src;});}
function ready(){AW=ATLAS.naturalWidth||AW;AH=ATLAS.naturalHeight||AH;SND.sfx=!!SV.set.snd;setTimeout(()=>{$('load').style.display='none';mode='title';farmLayout();showUI('title');},250);}
addEventListener('resize',()=>{resize();if(mode==='farm'){farmLayout();updateFarmHUD();}});
resize();requestAnimationFrame(frame);boot();
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
// test hooks
window.__oo={get S(){return S},get busy(){return busy},get mode(){return mode},get SV(){return SV},startLevel,attemptSwap,pickBoost,useBoost,doTask,goFarm,preLevel,M3,
  cellXY:i=>[cx(i%S.W),cy((i/S.W)|0)],fps:()=>{const a=frames.slice(-120);const avg=a.reduce((x,y)=>x+y,0)/a.length;return {avg:+(avg*1000).toFixed(2),max:+(Math.max(...a)*1000).toFixed(1)};},
  give:(st)=>{SV.stars[99]=st;save();},layout:()=>({CS,BX,BY})};
