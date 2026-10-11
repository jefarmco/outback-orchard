// Outback Orchard – match-3 engine (pure logic, shared by game + level bot)
(function(root){
'use strict';
const CALF=6;
function rnd(S){let s=S.rs;s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;S.rs=s||1;return S.rs/4294967296;}
const ri=(S,n)=>Math.floor(rnd(S)*n);
function newTile(S,noCalf){
  if(!noCalf&&S.calf&&S.calf.spawned<S.calf.total&&S.calf.onBoard<S.calf.max&&rnd(S)<S.calf.p){S.calf.spawned++;S.calf.onBoard++;return {id:S.nid++,k:CALF,sp:null};}
  return {id:S.nid++,k:S.colors[ri(S,S.colors.length)],sp:null};}
function create(L,seed){
  const lay=L.layout;const H=lay.length,W=lay[0].length;
  const S={W,H,cells:[],rs:(seed>>>0)||7,nid:1,moves:L.moves,used:0,colors:L.colors.slice(),score:0,chain:0,combo:null,focus:null,
    goals:L.goals.map(g=>({t:g.t,k:g.k,n:g.n||0,got:0})),calf:L.calf?{total:L.calf.total,max:L.calf.max||2,p:L.calf.p||.06,spawned:0,onBoard:0}:null,made:0};
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){const ch=lay[r][c];const ce={v:ch==='#',crate:0,wire:0,mud:0,t:null};
    if(ch==='m')ce.mud=1;if(ch==='M')ce.mud=2;if(ch==='c')ce.crate=1;if(ch==='C')ce.crate=2;if(ch==='w')ce.wire=1;if(ch==='W'){ce.wire=1;ce.mud=1;}if(ch==='x'){ce.crate=1;ce.mud=1;}
    if(ch==='a'){ce.t={id:S.nid++,k:CALF,sp:null};if(S.calf){S.calf.spawned++;S.calf.onBoard++;}}
    S.cells.push(ce);}
  // auto goal counts
  for(const g of S.goals){if(g.t==='mud')g.n=S.cells.filter(c=>c.mud).length;if(g.t==='crate')g.n=S.cells.filter(c=>c.crate).length;if(g.t==='wire')g.n=S.cells.filter(c=>c.wire).length;if(g.t==='calf')g.n=S.calf?S.calf.total:0;}
  fillStart(S);return S;}
function fillStart(S){const {W,H}=S;
  for(let tries=0;tries<60;tries++){
    for(let r=0;r<H;r++)for(let c=0;c<W;c++){const ce=S.cells[r*W+c];if(ce.v||ce.crate||(ce.t&&ce.t.k===CALF))continue;
      let k,guard=0;do{k=S.colors[ri(S,S.colors.length)];guard++;}while(guard<30&&((c>=2&&kAt(S,r,c-1)===k&&kAt(S,r,c-2)===k)||(r>=2&&kAt(S,r-1,c)===k&&kAt(S,r-2,c)===k)));
      ce.t={id:S.nid++,k,sp:null};}
    if(findMoves(S).length)return;}
}
function kAt(S,r,c){if(r<0||c<0||r>=S.H||c>=S.W)return -1;const ce=S.cells[r*S.W+c];return (!ce.v&&!ce.crate&&ce.t&&ce.t.k!==CALF&&ce.t.sp!=='cyc')?ce.t.k:-1;}
const movable=ce=>ce&&!ce.v&&!ce.crate&&!ce.wire&&!!ce.t;
function findGroups(S){const {W,H}=S,runs=[];
  for(let r=0;r<H;r++){let c=0;while(c<W){const k=kAt(S,r,c);let e=c+1;if(k>=0)while(e<W&&kAt(S,r,e)===k)e++;if(k>=0&&e-c>=3){const cells=[];for(let x=c;x<e;x++)cells.push(r*W+x);runs.push({dir:'h',k,cells});}c=e;}}
  for(let c=0;c<W;c++){let r=0;while(r<H){const k=kAt(S,r,c);let e=r+1;if(k>=0)while(e<H&&kAt(S,e,c)===k)e++;if(k>=0&&e-r>=3){const cells=[];for(let y=r;y<e;y++)cells.push(y*W+c);runs.push({dir:'v',k,cells});}r=e;}}
  // union runs sharing cells
  const par=runs.map((_,i)=>i),f=i=>par[i]===i?i:(par[i]=f(par[i]));const owner=new Map();
  runs.forEach((ru,i)=>ru.cells.forEach(x=>{if(owner.has(x))par[f(i)]=f(owner.get(x));else owner.set(x,i);}));
  const gm=new Map();runs.forEach((ru,i)=>{const p=f(i);if(!gm.has(p))gm.set(p,{k:ru.k,runs:[],cells:new Set()});const g=gm.get(p);g.runs.push(ru);ru.cells.forEach(x=>g.cells.add(x));});
  return [...gm.values()];}
function groupSpecial(g,focus){let max=0,hr=null,vr=null;for(const ru of g.runs){max=Math.max(max,ru.cells.length);if(ru.dir==='h')hr=ru;else vr=ru;}
  let sp=null;if(max>=5)sp='cyc';else if(hr&&vr)sp='bomb';else if(max===4)sp=g.runs[0].dir==='h'?'h':'v';
  if(!sp)return null;let pos=-1;
  if(focus)for(const x of focus)if(g.cells.has(x))pos=x;
  if(pos<0&&sp==='bomb'){for(const ru of g.runs)if(ru.dir==='h')for(const x of ru.cells)for(const rv of g.runs)if(rv.dir==='v'&&rv.cells.includes(x))pos=x;}
  if(pos<0){const ru=g.runs.reduce((a,b)=>b.cells.length>a.cells.length?b:a);pos=ru.cells[ru.cells.length>>1];}
  return {sp,pos};}
function cellsLine(S,i,dir){const {W,H}=S,r=(i/W)|0,c=i%W,o=[];if(dir==='h')for(let x=0;x<W;x++)o.push(r*W+x);else for(let y=0;y<H;y++)o.push(y*W+c);return o;}
function cellsArea(S,i,rad,cheb){const {W,H}=S,r=(i/W)|0,c=i%W,o=[];for(let y=r-rad;y<=r+rad;y++)for(let x=c-rad;x<=c+rad;x++){if(y<0||x<0||y>=H||x>=W)continue;if(!cheb&&Math.abs(y-r)+Math.abs(x-c)>rad)continue;o.push(y*W+x);}return o;}
function commonColour(S){const n={};for(const ce of S.cells)if(!ce.v&&!ce.crate&&ce.t&&ce.t.k!==CALF)n[ce.t.k]=(n[ce.t.k]||0)+1;let b=S.colors[0],bn=-1;for(const k in n)if(n[k]>bn){bn=n[k];b=+k;}return b;}
function tilesOf(S,k){const o=[];S.cells.forEach((ce,i)=>{if(!ce.v&&!ce.crate&&ce.t&&ce.t.k===k)o.push(i);});return o;}
// one clear phase. returns null when nothing happened
function step(S){
  const clear=new Set(),queue=[],hits=new Set(),fired=new Set(),fx=[],created=[];
  const add=i=>{if(!clear.has(i)){clear.add(i);queue.push(i);}};
  const fire=(i,t,k)=>{fired.add(t.id);if(t.sp==='h'||t.sp==='v'){fx.push({t:'line',dir:t.sp,i});cellsLine(S,i,t.sp).forEach(add);}
    else if(t.sp==='bomb'){fx.push({t:'bomb',i,rad:2});cellsArea(S,i,2,false).forEach(add);}
    else if(t.sp==='cyc'){const kk=k!=null?k:commonColour(S);const tg=tilesOf(S,kk);fx.push({t:'cyc',i,k:kk,targets:tg});tg.forEach(add);add(i);}
    S.score+=200;};
  const cb=S.combo;S.combo=null;
  if(cb){
    if(cb.type==='cells'){fx.push({t:'boost',cells:cb.cells});cb.cells.forEach(add);}
    else if(cb.type==='fire'){add(cb.i);}
    else{const A=S.cells[cb.a].t,B=S.cells[cb.b].t;// A now at a, B at b
      const at=cb.b;// landing cell of the swiped tile
      const sa=A.sp,sb=B.sp;
      if(sa==='cyc'&&sb==='cyc'){fired.add(A.id);fired.add(B.id);fx.push({t:'cycall',i:at});S.cells.forEach((ce,i)=>{if(!ce.v)add(i);});S.score+=2000;}
      else if(sa==='cyc'||sb==='cyc'){const [C,ci,O,oi]=sa==='cyc'?[A,cb.a,B,cb.b]:[B,cb.b,A,cb.a];fired.add(C.id);
        if(!O.sp){const tg=tilesOf(S,O.k);fx.push({t:'cyc',i:ci,k:O.k,targets:tg});tg.forEach(add);add(ci);S.score+=300;}
        else{const tg=tilesOf(S,O.k);fx.push({t:'cyc',i:ci,k:O.k,targets:tg,conv:O.sp});for(const x of tg){const t=S.cells[x].t;if(!t.sp)t.sp=O.sp==='bomb'?'bomb':(rnd(S)<.5?'h':'v');}tg.forEach(add);add(ci);add(oi);S.score+=800;}}
      else{fired.add(A.id);fired.add(B.id);add(cb.a);add(cb.b);const bomb=(sa==='bomb')+(sb==='bomb');
        if(bomb===2){fx.push({t:'bomb',i:at,rad:3,big:1});cellsArea(S,at,3,true).forEach(add);}
        else if(bomb===1){fx.push({t:'cross3',i:at});for(const d of [-1,0,1]){const r=((at/S.W)|0)+d,c=at%S.W+d;if(r>=0&&r<S.H)cellsLine(S,r*S.W,'h').forEach(add);if(c>=0&&c<S.W)cellsLine(S,c,'v').forEach(add);}}
        else{fx.push({t:'line',dir:'h',i:at});fx.push({t:'line',dir:'v',i:at});cellsLine(S,at,'h').forEach(add);cellsLine(S,at,'v').forEach(add);}
        S.score+=600;}}
  }
  const groups=findGroups(S);
  for(const g of groups){const gs=groupSpecial(g,S.focus);g.cells.forEach(add);if(gs){created.push({i:gs.pos,k:g.k,sp:gs.sp});}
    for(const x of g.cells){const r=(x/S.W)|0,c=x%S.W;for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0]]){const y=r+dr,z=c+dc;if(y<0||z<0||y>=S.H||z>=S.W)continue;const j=y*S.W+z;if(S.cells[j].crate)hits.add(j);}}}
  S.focus=null;
  while(queue.length){const i=queue.shift(),ce=S.cells[i];if(ce.v)continue;if(ce.crate){hits.add(i);continue;}const t=ce.t;if(t&&t.sp&&!fired.has(t.id))fire(i,t);}
  const cleared=[],hitOut=[];const mult=1+S.chain*.5;
  for(const i of clear){const ce=S.cells[i];if(ce.v||ce.crate)continue;const t=ce.t;if(!t||t.k===CALF)continue;
    cleared.push({i,id:t.id,k:t.k,sp:t.sp,wire:ce.wire,mud:ce.mud});for(const g of S.goals)if(g.t==='collect'&&g.k===t.k)g.got++;
    ce.t=null;if(ce.wire){ce.wire=0;goal(S,'wire');}if(ce.mud){ce.mud--;if(!ce.mud)goal(S,'mud');}S.score+=Math.round(20*mult);}
  for(const i of hits){const ce=S.cells[i];if(!ce.crate)continue;ce.crate--;if(!ce.crate)goal(S,'crate');hitOut.push({i,left:ce.crate});S.score+=30;}
  for(const cr of created){const ce=S.cells[cr.i];if(ce.t)continue;ce.t={id:S.nid++,k:cr.k,sp:cr.sp};cr.id=ce.t.id;S.made++;S.score+=100;}
  if(!cleared.length&&!hitOut.length&&!created.length)return null;
  const res={cleared,hits:hitOut,created,fx,chain:S.chain};S.chain++;return res;}
function goal(S,t){for(const g of S.goals)if(g.t===t)g.got++;}
const isEmpty=ce=>!ce.v&&!ce.crate&&!ce.t;
const isStatic=ce=>ce.v||ce.crate||(ce.t&&ce.wire);
function fall(S){const {W,H}=S,mv=new Map(),spawns=[],calves=[],sc=new Array(W).fill(0);
  const rec=(id,f,t)=>{const m=mv.get(id);if(m)m.to=t;else mv.set(id,{id,from:f,to:t});};
  for(let outer=0;outer<20;outer++){
    let changed=true,guard=0;
    while(changed&&guard++<300){changed=false;
      for(let r=H-1;r>=0;r--)for(let c=0;c<W;c++){const i=r*W+c,ce=S.cells[i];if(!isEmpty(ce))continue;
        let rr=r-1;while(rr>=0&&(S.cells[rr*W+c].v||isEmpty(S.cells[rr*W+c])))rr--;
        if(rr<0){// only the top-most empty in a fully open column spawns
          let top=r-1;while(top>=0&&S.cells[top*W+c].v)top--;if(top>=0)continue;
          const t=newTile(S);ce.t=t;spawns.push({id:t.id,k:t.k,i,n:sc[c]++});mv.set(t.id,{id:t.id,from:-1-sc[c]+1,col:c,to:i,spawn:1});changed=true;continue;}
        const up=S.cells[rr*W+c];
        if(up.t&&!isStatic(up)){ce.t=up.t;up.t=null;rec(ce.t.id,rr*W+c,i);changed=true;continue;}
        // blocked above: diagonal only if the cell directly above (skipping voids) is static
        let ar=r-1;while(ar>=0&&S.cells[ar*W+c].v)ar--;if(ar<0||!isStatic(S.cells[ar*W+c]))continue;
        if(r===0)continue;
        for(const dc of ((r+c)%2?[-1,1]:[1,-1])){const cc=c+dc;if(cc<0||cc>=W)continue;const di=(r-1)*W+cc,dce=S.cells[di];if(dce.v||!dce.t||isStatic(dce))continue;
          if(isEmpty(S.cells[r*W+cc]))continue;ce.t=dce.t;dce.t=null;rec(ce.t.id,di,i);changed=true;break;}
      }}
    // calves reaching the bottom
    let got=false;
    for(let c=0;c<W;c++){let r=H-1;while(r>=0&&S.cells[r*W+c].v)r--;if(r<0)continue;const ce=S.cells[r*W+c];if(ce.t&&ce.t.k===CALF){calves.push({id:ce.t.id,i:r*W+c});ce.t=null;S.calf.onBoard--;goal(S,'calf');S.score+=500;got=true;}}
    if(!got)break;}
  return {moves:[...mv.values()],spawns,calves};}
function wouldMatch(S,i){const {W}=S,r=(i/W)|0,c=i%W,k=kAt(S,r,c);if(k<0)return false;
  let n=1;for(let x=c-1;kAt(S,r,x)===k;x--)n++;for(let x=c+1;kAt(S,r,x)===k;x++)n++;if(n>=3)return true;
  n=1;for(let y=r-1;kAt(S,y,c)===k;y--)n++;for(let y=r+1;kAt(S,y,c)===k;y++)n++;return n>=3;}
function swapT(S,a,b){const t=S.cells[a].t;S.cells[a].t=S.cells[b].t;S.cells[b].t=t;}
function canSwap(S,a,b){const ca=S.cells[a],cb=S.cells[b];if(!movable(ca)||!movable(cb))return false;const A=ca.t,B=cb.t;
  if(A.k===CALF&&B.k===CALF)return false;
  if((A.sp==='cyc'&&B.k!==CALF)||(B.sp==='cyc'&&A.k!==CALF))return true;
  if(A.sp&&B.sp)return true;
  swapT(S,a,b);const ok=wouldMatch(S,a)||wouldMatch(S,b);swapT(S,a,b);return ok;}
function findMoves(S){const {W,H}=S,o=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++){const a=r*W+c;if(c+1<W&&canSwap(S,a,a+1))o.push([a,a+1]);if(r+1<H&&canSwap(S,a,a+W))o.push([a,a+W]);}return o;}
function adjacent(S,a,b){const ra=(a/S.W)|0,rb=(b/S.W)|0;return (ra===rb&&Math.abs(a-b)===1)||(Math.abs(a-b)===S.W);}
function trySwap(S,a,b){if(!adjacent(S,a,b)||!canSwap(S,a,b))return false;
  swapT(S,a,b);const A=S.cells[a].t,B=S.cells[b].t;
  if(A.sp==='cyc'||B.sp==='cyc'||(A.sp&&B.sp))S.combo={a,b};
  S.focus=[a,b];S.used++;S.chain=0;return true;}
function shuffle(S){const idx=[];S.cells.forEach((ce,i)=>{if(movable(ce)&&ce.t.k!==CALF)idx.push(i);});
  for(let tries=0;tries<200;tries++){const ts=idx.map(i=>S.cells[i].t);for(let j=ts.length-1;j>0;j--){const q=ri(S,j+1);[ts[j],ts[q]]=[ts[q],ts[j]];}
    idx.forEach((i,j)=>S.cells[i].t=ts[j]);if(tries>100)idx.forEach(i=>{if(!S.cells[i].t.sp)S.cells[i].t.k=S.colors[ri(S,S.colors.length)];});
    if(!findGroups(S).length&&findMoves(S).length)return true;}
  return false;}
const won=S=>S.goals.every(g=>g.got>=g.n);
const movesLeft=S=>S.moves-S.used;
function clone(S){const o=Object.assign({},S);o.cells=S.cells.map(ce=>({v:ce.v,crate:ce.crate,wire:ce.wire,mud:ce.mud,t:ce.t?{id:ce.t.id,k:ce.t.k,sp:ce.t.sp}:null}));
  o.goals=S.goals.map(g=>Object.assign({},g));o.calf=S.calf?Object.assign({},S.calf):null;o.colors=S.colors.slice();o.focus=S.focus?S.focus.slice():null;o.combo=S.combo?Object.assign({},S.combo):null;return o;}
function resolveAll(S){let n=0;for(;;){const r=step(S);if(!r)break;n++;fall(S);}if(!findMoves(S).length)shuffle(S);return n;}
// end-of-level bonus: turn one remaining move into a ute that fires
function bonusPick(S){const c=[];S.cells.forEach((ce,i)=>{if(!ce.v&&!ce.crate&&ce.t&&ce.t.k!==CALF&&!ce.t.sp)c.push(i);});if(!c.length)return -1;const i=c[ri(S,c.length)];S.cells[i].t.sp=rnd(S)<.5?'h':'v';S.used++;S.chain=0;S.combo={type:'fire',i};return i;}
function specialsLeft(S){const o=[];S.cells.forEach((ce,i)=>{if(!ce.v&&ce.t&&ce.t.sp)o.push(i);});return o;}
function placeSpecial(S,sp){const c=[];S.cells.forEach((ce,i)=>{if(movable(ce)&&ce.t.k!==CALF&&!ce.t.sp)c.push(i);});if(!c.length)return -1;const i=c[ri(S,c.length)];S.cells[i].t.sp=sp;return i;}
const API={CALF,create,step,fall,findMoves,findGroups,trySwap,canSwap,shuffle,won,movesLeft,clone,resolveAll,bonusPick,specialsLeft,placeSpecial,adjacent,rnd,movable};
if(typeof module!=='undefined')module.exports=API;else root.M3=API;
})(this);
