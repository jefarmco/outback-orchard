const M=require('../js/engine.js');
const SPV={h:14,v:14,bomb:22,cyc:38};
function value(S){let v=0;for(const g of S.goals)v+=Math.min(g.got,g.n)/Math.max(1,g.n)*1000*(g.n?1:0);
  S.cells.forEach((ce,i)=>{if(!ce.t)return;if(ce.t.sp)v+=SPV[ce.t.sp];if(ce.t.k===M.CALF)v+=((i/S.W)|0)*6;});return v+S.score*.004;}
function choose(S,rng){const ms=M.findMoves(S);let best=null,bv=-1e9;const base=value(S);
  for(const m of ms){const C=M.clone(S);C.rs=(rng()*4294967295)>>>0||1;M.trySwap(C,m[0],m[1]);M.resolveAll(C);const v=value(C)-base+rng()*3;if(v>bv){bv=v;best=m;}}
  return best;}
// casual bot: only looks at the first clear of a move (no cascade foresight) and sometimes picks a lesser move – a stand-in for a human
function chooseCasual(S,rng){const ms=M.findMoves(S);if(!ms.length)return null;const base=value(S);const sc=[];
  for(const m of ms){const C=M.clone(S);C.rs=(rng()*4294967295)>>>0||1;M.trySwap(C,m[0],m[1]);if(M.step(C))M.fall(C);sc.push([value(C)-base+rng()*6,m]);}
  sc.sort((a,b)=>b[0]-a[0]);const k=rng()<.3?Math.min(sc.length-1,1+((rng()*3)|0)):0;return sc[k][1];}
function mk(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
// play with a big move budget; return moves needed to win (or Infinity)
function playNeed(L,seed,cap,casual){const pick=casual?chooseCasual:choose;const S=M.create(Object.assign({},L,{moves:cap}),seed);const rng=mk(seed*7+3);
  for(let m=0;m<cap;m++){if(M.won(S))return {need:S.used,S};const mv=pick(S,rng);if(!mv)M.shuffle(S);else{M.trySwap(S,mv[0],mv[1]);M.resolveAll(S);}}
  return {need:M.won(S)?S.used:Infinity,S};}
// full play with real moves incl. end bonus -> score
function play(L,seed,casual){const pick=casual?chooseCasual:choose;const S=M.create(L,seed);const rng=mk(seed*7+3);
  while(M.movesLeft(S)>0&&!M.won(S)){const mv=pick(S,rng);if(!mv){M.shuffle(S);continue;}M.trySwap(S,mv[0],mv[1]);M.resolveAll(S);}
  const win=M.won(S),leftAtWin=M.movesLeft(S);if(win){while(M.movesLeft(S)>0){if(M.bonusPick(S)<0)break;M.resolveAll(S);}let g=0;while(g++<20){const sp=M.specialsLeft(S);if(!sp.length)break;S.combo={type:'cells',cells:sp};M.resolveAll(S);}}
  return {win,score:S.score,left:win?leftAtWin:0};}
module.exports={chooseCasual,choose,playNeed,play,value};
