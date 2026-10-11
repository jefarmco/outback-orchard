const M=require('../js/engine.js');
const lays=[['#......#','........','..cc....','..CC..m.','mmwwwwmm','........','...xx...','........','#......#'],
 ['a..aa..a','........','.#....#.','........','...cc...','........','w......w','........','........']];
let holes=[0,0],err=0,specials={h:0,v:0,bomb:0,cyc:0},combos=0,steps=0;
for(let g=0;g<300;g++){const L={layout:lays[g%2],colors:[0,1,2,3,4].slice(0,4+(g%2)),moves:30,goals:[{t:'collect',k:0,n:999},{t:'calf'},{t:'mud'}],calf:{total:6,max:3,p:.08}};
 const S=M.create(L,g+1);
 for(let m=0;m<30;m++){const ms=M.findMoves(S);if(!ms.length){err++;console.log('no moves');break;}const mv=ms[Math.floor(Math.random()*ms.length)];
  const A=S.cells[mv[0]].t,B=S.cells[mv[1]].t;if(A.sp&&B.sp||A.sp==='cyc'||B.sp==='cyc')combos++;
  if(!M.trySwap(S,mv[0],mv[1])){err++;console.log('swap failed');}
  for(;;){const r=M.step(S);if(!r)break;steps++;r.created.forEach(c=>specials[c.sp]++);M.fall(S);}
  if(!M.findMoves(S).length)M.shuffle(S);
  // invariants
  const ids=new Set();S.cells.forEach((ce,i)=>{if(!ce.v&&!ce.crate&&!ce.t){holes[g%2]++;} if(ce.t){if(ids.has(ce.t.id)){err++;console.log('dup');}ids.add(ce.t.id);} if(ce.crate&&ce.t){err++;console.log('crate+tile');}});
  if(M.findGroups(S).length){err++;console.log('unresolved match');}
 }}
console.log({holes,err,specials,combos,steps});
