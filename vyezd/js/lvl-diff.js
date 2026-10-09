/* vy-lvl: кривая сложности (решение владельца 09.10: «игра обязательно сложнее», с 10-го двора; дворы 1–9 — обучение, как было).
   Генератор и зёрна дворов 1–50 НЕ меняются (раскладка та же, отпечаток прежний) — сверху кладётся «слой трудности»:
     · скорая чаще и с меньшим запасом ходов (запас = цепочка + 1…3 вместо +4);
     · полиция (она помогает — разгоняет свободных) реже;
     · машины без стрелки (по фарам) — с 20-го двора, больше к концу региона; у босса — 1…4;
     · стена-босс раз в регион (10-й двор десятка) — всё сразу.
   Дворы 51–210 (новые именные регионы VYREG) — свои параметры генератора: поле растёт до 12×16, плотнее, меньше свободных
   с начала («меньше одного решения»), «пила» внутри региона сохранена (1–2-й двор — передышка, 9-й — подъём, 10-й — стена).
   Проверка: ../LVL-tools (решатель depth() + бот-игрок, подогнанный под статистику 28.09–09.10).
   Договор: LVLD.params(i,p) → p (вызывается из levelParams), LVLD.apply(lv,p,idx,seed,mode) — правит lv.amb / lv.police,
   ставит lv.noArrow=[номера машин]; решаемость не меняет (стрелки и счётчик скорой на раскладку не влияют, запас ≥ цепочки). */
(function(W){
  var CFG={hTry:5,dens:.35,fAdd:0,dAdd:0,frMul:1,fRest:.72,ambK:[2,4,5,6,8],m0:2,m30:1,m8:0,mBoss:0,m51:0,hTry51:14,dens51:1.2,na51:0,lateFrom:30,w0:11,h0:15,wq:3,hq:2,wMax:13,hMax:19}; /* m51 — запас скорой в новых регионах (−1 = как m30) */
  var ON=true; // выключатель (?lvld=0 — как было, для сравнения)
  try{if(/[?&]lvld=0/.test(location.search))ON=false;}catch(e){}
  function R0(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  /* параметры генератора для новых регионов (дворы 51+). Дворы ≤50 — без изменений. */
  function params(i,p){
    if(!ON||i<50)return p; /* дворы 1–50: генератор как был (дальше — только развороты harden и слой apply) */
    var k=i%10,boss=k===9,rest=k<2,pre=k===8,r=Math.floor(i/10);
    if(i>=50){var q=Math.floor((i-50)/10); /* регион VYREG 0..15: поле растёт 11×15 → 13×19 */
      p.w=Math.min(CFG.wMax,CFG.w0+Math.floor(q/CFG.wq));p.h=Math.min(CFG.hMax,CFG.h0+Math.floor(q/CFG.hq));
      if(rest){p.w=Math.max(9,p.w-1);p.h=Math.max(13,p.h-1);}
      p.maxLen=q>=8?7:6;p.bias=1;p.amb=k===2||k===5||k===8||boss;p.police=k===3||k===7;}
    var fill=rest?CFG.fRest:Math.min(.95,(i<30?.6+.26*Math.min(1,i/29):.86)+CFG.fAdd+(boss?.05:0)+(pre?.02:0));
    p.n=Math.max(4,Math.round(p.w*p.h*fill/2.8));
    if(!rest){p.minDepth+=CFG.dAdd+Math.min(3,Math.floor(r/3));p.freeMax=Math.max(.05,p.freeMax*CFG.frMul);}
    return p;}
  /* «Меньше одного решения, больше блокировок»: перебор разворотов машин (кабина ↔ хвост, клетки те же) по зерну двора —
     оставляем развороты, после которых в каждой точке решения свободных машин меньше, а запертых «на вид свободных»
     (преграда далеко впереди) больше. Решаемость проверяет depth() генератора после каждого шага. Детерминировано: у всех одинаково. */
  function trapE(lv){var w=lv.w,h=lv.h,vs=lv.vehicles,occ=baseOcc(lv),alive=[],E=0,i,g=0;for(i=0;i<vs.length;i++)alive.push(i);
    while(alive.length&&g++<200){var fr=-1,nf=0,T=0;
      for(var a=0;a<alive.length;a++){var j=alive[a],r=canExit(vs[j],occ,w,h,j);if(r.free){nf++;if(fr<0)fr=a;}else T+=(1+.71*Math.min(r.k,6))*(vs[j].cells.length>3?1.72:1);}
      if(!nf)return -1;E+=T/nf;var id=alive[fr];vs[id].cells.forEach(function(c){occ[c[1]*w+c[0]]=-1;});alive.splice(fr,1);}
    return E;}
  function flip(v){var rc=v.cells.slice().reverse(),a=rc[0],b=rc[1];for(var d=0;d<4;d++)if(DIRS[d][0]===a[0]-b[0]&&DIRS[d][1]===a[1]-b[1])break;return {cells:rc,dir:d};}
  function harden(lv,p,idx,seed){
    if(!ON||!lv||idx<9||p.easy||!(CFG.hTry>0))return lv;
    var R=R0(seed*31+4049),vs=lv.vehicles,n=vs.length,E=trapE(lv),late=idx>=CFG.lateFrom,tries=Math.round((late?CFG.hTry51:CFG.hTry)*n),gain=0;
    if(E<0)return lv;
    for(var t=0;t<tries;t++){var i=Math.floor(R()*n),v=vs[i],old={cells:v.cells,dir:v.dir},f=flip(v);
      if(p.minRay>0){var dx=DIRS[f.dir][0],dy=DIRS[f.dir][1],hx=f.cells[0][0]+dx,hy=f.cells[0][1]+dy;if(hx<0||hy<0||hx>=lv.w||hy>=lv.h)continue;}
      v.cells=f.cells;v.dir=f.dir;var e2=trapE(lv);
      if(e2>E){E=e2;gain++;}else{v.cells=old.cells;v.dir=old.dir;}}
    /* доуплотнение: в пустые клетки ставим машины 2–3 клетки, если двор остаётся решаемым и «ловушек» больше */
    var add=Math.round((late?CFG.dens51:CFG.dens)*n),occ=baseOcc(lv),W2=lv.w,H2=lv.h,added=0;
    for(t=0;t<add*25&&added<add;t++){var x=Math.floor(R()*W2),y=Math.floor(R()*H2),d=Math.floor(R()*4),L=R()<.7?2:3;
      var cells=[[x,y]],ok=occ[y*W2+x]===-1;
      for(var s2=1;s2<L&&ok;s2++){var px=x-DIRS[d][0]*s2,py=y-DIRS[d][1]*s2;if(px<0||py<0||px>=W2||py>=H2||occ[py*W2+px]!==-1)ok=false;else cells.push([px,py]);}
      if(!ok)continue;
      if(p.minRay>0){var nx=x+DIRS[d][0],ny=y+DIRS[d][1];if(nx<0||ny<0||nx>=W2||ny>=H2)continue;}
      vs.push({cells:cells,dir:d});var e3=trapE(lv);
      if(e3>E&&depth(lv)>=0){E=e3;added++;cells.forEach(function(c){occ[c[1]*W2+c[0]]=vs.length-1;});}else vs.pop();}
    lv.depth=depth(lv);lv.free=freeCount(lv);lv.hard=gain;lv.added=added;
    if(lv.amb||lv.police!=null){var keep=lv.police;pickSpecials(lv,p,R0(seed+7));if(keep==null)delete lv.police;}
    return lv;}
  /* сколько машин без стрелки: обычный двор с 20-го — на 5-м и 8-м дворе десятка по одной; босс — 1…4 */
  function noArrowN(idx,mode){var k=idx%10,r=Math.floor(idx/10);
    if(idx<19)return 0;
    if(k===9)return Math.min(4,1+Math.floor((r-1)/2));
    if(k===4||k===7)return (r>=5?2:1)+(idx>=50?CFG.na51:0);
    if(idx>=50&&(k===2||k===5))return CFG.na51;
    return 0;}
  function apply(lv,p,idx,seed,mode){
    lv.noArrow=lv.noArrow||[];
    if(!ON||!lv||mode==='daily'||idx<9)return lv;
    var R=R0(seed*13+977),k=idx%10,boss=k===9,vs=lv.vehicles,n=vs.length;
    var occ=baseOcc(lv),need=vs.map(function(_,i){return closureOf(vs,occ,lv.w,lv.h,i).size;});
    /* полиция: в старых дворах — только на 4-м и босс-дворе через регион (она облегчает) */
    if(idx<50&&lv.police!=null&&!(boss&&Math.floor(idx/10)%2===0)&&k!==3)delete lv.police;
    /* скорая: на 3-м, 6-м, 9-м дворе десятка и у босса; запас: обычный +3 (с 30-го +2), 9-й и босс +1 (первый босс — +3) */
    var wantAmb=CFG.ambK.indexOf(k)>=0||boss;
    if(wantAmb&&!lv.amb){var c=[];for(var i=0;i<n;i++)if(need[i]>=3&&need[i]<=9&&lv.police!==i)c.push(i);
      if(!c.length)for(i=0;i<n;i++)if(need[i]>=2&&lv.police!==i)c.push(i);
      if(c.length){var id=c[Math.floor(R()*c.length)];lv.amb={id:id,limit:need[id]};}}
    if(lv.amb){var m=boss?(idx===9?1:CFG.mBoss):k===8?CFG.m8:idx<30?CFG.m0:(idx>=50&&CFG.m51>=0?CFG.m51:CFG.m30);lv.amb.limit=need[lv.amb.id]+m;}
    /* машины без стрелки (легковушки 2–3 клетки, не спецмашины); старая босс-машина (startLevel, idx≥19) — первой */
    var want=noArrowN(idx,mode);
    if(want>0){var cand=[];for(i=0;i<n;i++)if(vs[i].cells.length<=3&&!(lv.amb&&lv.amb.id===i)&&lv.police!==i)cand.push(i);
      if(boss&&idx>=19){var c2=cand.filter(function(j){return vs[j].cells.length===2;});if(c2.length){var f=c2[seed%c2.length];lv.noArrow.push(f);}}
      var guard=0;while(lv.noArrow.length<want&&cand.length&&guard++<50){var j=cand[Math.floor(R()*cand.length)];if(lv.noArrow.indexOf(j)<0)lv.noArrow.push(j);}}
    return lv;}
  W.LVLD={params:params,apply:apply,harden:harden,trapE:trapE,noArrowN:noArrowN,on:function(){return ON;},set:function(v){ON=!!v;},cfg:CFG};
})(window);
