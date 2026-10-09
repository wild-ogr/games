/* vy-lvl: помехи новых регионов (дворы 51+, VYREG[k].hz/mix) — без поломки генератора.
   Правило решаемости: любая помеха в проверке считается ПОСТОЯННОЙ клумбой (depth() генератора на раскладке с этими клетками).
   Раз двор решаем с вечной помехой — с открывающейся тем более. Помеха ставится только в ПУСТЫЕ клетки — машины и зёрна не трогаются.
     bar   🚧🔑 шлагбаум с пультом: 1–2 клетки закрыты, пока не уедет машина с брелоком (значок ключа над ней)
     hatch 🕳 люки/ремонт: 2–3 клетки с конусами, открываются после N выездов (счётчик)
     trash 🚛 мусоровоз: стоит у края на 2–3 клетках, уезжает после N выездов
     gran  👵 бабушка на переходе: «зебра» в верхнем ряду; бабушка идёт 2 выезда, 2 — нет; врезаться нельзя —
           машина тормозит (без аварии), но ход потерян (счётчик скорой тикает)
     polar 🌙 полярная ночь: двор ночью, 2–4 машины без стрелок (по фарам)
   Договор с index.html (точки с пометкой vy-lvl): make(lv,p,idx,seed,mode) после LVLD.apply → lv.hz / lv.polar;
   start(G,lv) после заполнения G.occ; onExit(v) из startExit/tow; onBump(v) из crash (true — мягкий толчок); draw(ctx,layer,t) из render;
   tip(idx) — плашка первого знакомства. Коды в G.occ: −3 — закрытая помеха, −4 — бабушка на переходе. */
(function(W){
  function curG(){try{return G;}catch(e){return null;}}function curM(){try{return modalOn;}catch(e){return false;}} /* G, S, modalOn — let в index.html: видны по имени, не через window */
  function R0(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  var ON=true;try{if(/[?&]lvlh=0/.test(location.search))ON=false;}catch(e){}
  /* какая помеха в каком дворе региона: 0 — знакомство, 1 — передышка, 4 и 7 — смесь, 9 — стена (главная + смесь) */
  function kindsFor(idx){
    if(!ON||idx<50||!W.VYREG)return [];
    var r=VYREG.at(idx);if(!r||!r.hz||r.hz==='big')return r&&r.mix&&idx%10>=4?[r.mix[idx%r.mix.length]]:[];
    var k=idx%10,m=r.mix||[];
    if(k===1)return [];
    if(k===4||k===7)return m.length?[m[(k+r.from)%m.length]]:[r.hz];
    if(k===9)return m.length?[r.hz,m[0]]:[r.hz];
    return [r.hz];}
  /* лучи: сколько машин «смотрят» через клетку */
  function rays(lv){var w=lv.w,h=lv.h,cnt=new Array(w*h).fill(0);
    lv.vehicles.forEach(function(v){var d=DIRS[v.dir],x=v.cells[0][0]+d[0],y=v.cells[0][1]+d[1];while(x>=0&&y>=0&&x<w&&y<h){cnt[y*w+x]++;x+=d[0];y+=d[1];}});return cnt;}
  /* решаемость с помехами: жадный разбор (все свободные уезжают, помехи открываются по счёту выездов / ключу).
     Выезд никого не запирает, помехи только открываются → если жадный разбор проходит, проходит ЛЮБОЙ порядок игрока
     (из любого состояния есть свободная машина). Бабушка в проверке не стоит: она всегда уходит (после толчка — сразу). */
  function solvableHz(lv,cells,key){var w=lv.w,h=lv.h,vs=lv.vehicles,occ=baseOcc(lv),alive=[],ex=0,i,op=cells.map(function(){return 0;});
    cells.forEach(function(c){occ[c[0]]=-3;});for(i=0;i<vs.length;i++)alive.push(i);
    var guard=0;while(alive.length&&guard++<400){var rm=[];
      for(var a=0;a<alive.length;a++){var j=alive[a];if(canExit(vs[j],occ,w,h,j).free)rm.push(j);}
      if(!rm.length)return false;
      rm.forEach(function(j){vs[j].cells.forEach(function(c){occ[c[1]*w+c[0]]=-1;});alive.splice(alive.indexOf(j),1);ex++;
        cells.forEach(function(c,k){if(op[k])return;if((c[1]>=0&&ex>=c[1])||(c[1]<0&&j===key)){op[k]=1;occ[c[0]]=-1;}});});}
    return !alive.length;}
  function make(lv,p,idx,seed,mode){
    if(!lv)return lv;var ks=kindsFor(idx);if(!ks.length)return lv;
    var R=R0(seed*17+6151),w=lv.w,h=lv.h,occ=baseOcc(lv),ry=rays(lv),hz={cells:[],key:-1,gran:-1,trash:null,kinds:ks},used=[];
    function empty(c){return occ[c]===-1&&used.indexOf(c)<0;}
    /* клетки помехи: пустые, на пути у машин (больше лучей — лучше), не вплотную; N — открыть после N выездов (−1 — по ключу) */
    function pickCells(cnt,N,filter,key){var c=[],i;for(i=0;i<w*h;i++)if(empty(i)&&ry[i]>0&&(!filter||filter(i)))c.push(i);
      c.sort(function(a,b){return ry[b]-ry[a]||a-b;});c=c.slice(0,Math.max(cnt*5,8));var out=[];
      while(out.length<cnt&&c.length){var j=Math.floor(R()*c.length),x=c.splice(j,1)[0];
        if(out.some(function(o){return Math.abs(o%w-x%w)+Math.abs(Math.floor(o/w)-Math.floor(x/w))<2;}))continue;
        var Nx=typeof N==='function'?N(out.length):N,test=hz.cells.concat(out.map(function(o,k){return [o,typeof N==='function'?N(k):N];}),[[x,Nx]]);
        if(solvableHz(lv,test,key!=null?key:hz.key))out.push(x);}
      return out;}
    var k=idx%10,boss=k===9;
    ks.forEach(function(kd){
      if(kd==='hatch'){var n=boss?3:k>=6?3:2,NH=function(i){return 3+((idx+i*2)%5);},cs=pickCells(n,NH);cs.forEach(function(c,i){hz.cells.push([c,NH(i),0,'hatch']);used.push(c);});}
      else if(kd==='bar'){
          var need=lv.vehicles.map(function(_,i){return closureOf(lv.vehicles,occ,w,h,i).size;}),cand=[];
          for(var i=0;i<lv.vehicles.length;i++)if(need[i]>=2&&need[i]<=5&&!(lv.amb&&lv.amb.id===i)&&lv.police!==i&&(lv.noArrow||[]).indexOf(i)<0)cand.push(i);
          if(!cand.length)for(i=0;i<lv.vehicles.length;i++)if(!(lv.amb&&lv.amb.id===i)&&lv.police!==i)cand.push(i);
          if(cand.length){var key=cand[Math.floor(R()*cand.length)],cs2=pickCells(boss?2:1,-1,null,key);
            if(cs2.length){hz.key=key;cs2.forEach(function(c){hz.cells.push([c,-1,0,'bar']);used.push(c);});}}}
      else if(kd==='trash'){ /* полоса у края: 2–3 пустые клетки подряд */
        var best=null;for(var t=0;t<60;t++){var side=Math.floor(R()*4),L=R()<.5?2:3,s=[],ok=true;
          var len=side%2?h:w,st=Math.floor(R()*Math.max(1,len-L+1));
          for(var q=0;q<L;q++){var x=side===0?st+q:side===2?st+q:side===1?w-1:0,y=side===0?0:side===2?h-1:st+q;var c=y*w+x;if(!empty(c)){ok=false;break;}s.push(c);}
          if(!ok)continue;var sc=0;s.forEach(function(c){sc+=ry[c];});if(sc===0)continue;
          var N=6+idx%4+(boss?2:0);if(!solvableHz(lv,hz.cells.concat(s.map(function(c){return [c,N];})),hz.key))continue;if(!best||sc>best.sc)best={s:s,sc:sc,side:side};}
        if(best){best.s.forEach(function(c){hz.cells.push([c,N,0,'trash']);used.push(c);});hz.trash={cells:best.s,side:best.side};}}
      else if(kd==='gran'){var row=function(i){var y=Math.floor(i/w);return y===0||y===h-1;},g=pickCells(1,0,row);if(!g.length)g=pickCells(1,0);
        if(g.length){hz.gran=g[0];used.push(g[0]);}}
      else if(kd==='polar'){lv.polar=true;var want=boss?4:k>=5?3:2,cand2=[];
        lv.noArrow=lv.noArrow||[];for(var j=0;j<lv.vehicles.length;j++)if(lv.vehicles[j].cells.length<=3&&!(lv.amb&&lv.amb.id===j)&&lv.police!==j&&lv.noArrow.indexOf(j)<0)cand2.push(j);
        while(lv.noArrow.length<want&&cand2.length)lv.noArrow.push(cand2.splice(Math.floor(R()*cand2.length),1)[0]);}
    });
    if(hz.cells.length||hz.gran>=0)lv.hz=hz;
    /* скорая с помехами: запас считаем честно — сколько выездов нужно до неё, если помехи ещё закрыты (жадно: сначала её цепочка) */
    if(lv.hz&&lv.amb){var E=ambNeed(lv);if(E>=0)lv.amb.limit=Math.max(lv.amb.limit,E+1);}
    return lv;}
  function ambNeed(lv){var w=lv.w,h=lv.h,vs=lv.vehicles,occ=baseOcc(lv),alive=[],ex=0,cells=lv.hz.cells,key=lv.hz.key,a=lv.amb.id,i;
    cells.forEach(function(c){c[2]=0;occ[c[0]]=-3;});for(i=0;i<vs.length;i++)alive.push(i);
    for(var g=0;g<500&&alive.length;g++){var need=closureOf(vs,occ,w,h,a),fr=[],pick=-1;
      for(var q=0;q<alive.length;q++){var j=alive[q];if(canExit(vs[j],occ,w,h,j).free){fr.push(j);if(need.has(j)&&pick<0)pick=j;}}
      if(!fr.length)return -1;if(pick<0)pick=fr[0];
      if(pick===a){cells.forEach(function(c){c[2]=0;});return ex;}
      vs[pick].cells.forEach(function(c){occ[c[1]*w+c[0]]=-1;});alive.splice(alive.indexOf(pick),1);ex++;
      cells.forEach(function(c){if(c[2])return;if((c[1]>=0&&ex>=c[1])||(c[1]<0&&pick===key)){c[2]=1;occ[c[0]]=-1;}});}
    return -1;}
  /* ---------------- в игре ---------------- */
  var S0=null; // состояние текущего двора: {hz, ex (выездов), open:{}, g (G)}
  /* машина региона во дворах региона (просьба ART): одна обычная машина рисуется моделью VYCARS (veh.vy); раскладка и R() не трогаются */
  function regionCar(G){try{if(!W.VYREG||G.daily||G.idx<50)return;var r=VYREG.at(G.idx);if(!r||!r.car)return;
    var c=G.vs.filter(function(v){return !v.kind&&!v.noArrow&&v.mdl==null&&!v.own&&v.L>=2&&v.L<=4;});if(c.length)c[G.idx%c.length].vy=r.car;}catch(e){}}
  function start(G,lv){S0=null;if(!G)return;G.hz=null;regionCar(G);if(!lv||!lv.hz)return;
    var hz=JSON.parse(JSON.stringify(lv.hz));S0={hz:hz,ex:0,g0:0,g:G,t0:0,bar:-1};G.hz=hz;
    hz.cells.forEach(function(c){c[2]=0;G.occ[c[0]]=-3;});granSet();}
  function granOn(){return S0&&S0.hz.gran>=0&&((S0.ex-S0.g0)%4+4)%4<2;} /* идёт 2 выезда, 2 — нет; после толчка уходит сразу */
  function granSet(skip){if(!S0||S0.hz.gran<0)return;var G=S0.g,c=S0.hz.gran;if(G.occ[c]===-1||G.occ[c]===-4)G.occ[c]=granOn()?-4:-1;
    /* никого не держим без хода: если все стоящие заперты, а бабушка на переходе, — она уходит сама */
    if(G.occ[c]===-4){var w=G.p.w,h=G.p.h,any=false,left=false;for(var i=0;i<G.vs.length;i++){var v=G.vs[i];if((v.state!=='idle'&&v.state!=='bump')||v===skip)continue;left=true;if(canExit(v,G.occ,w,h,v.id).free){any=true;break;}}
      if(left&&!any){S0.g0=S0.ex-2;G.occ[c]=-1;}}}
  function onExit(v){try{if(W.LVLM&&LVLM.onExit)LVLM.onExit(v);}catch(e){}if(!S0||S0.g!==curG())return;S0.ex++;var G=S0.g,opened=0;
    S0.hz.cells.forEach(function(c){if(c[2])return;if((c[1]>=0&&S0.ex>=c[1])||(c[1]<0&&v.id===S0.hz.key)){c[2]=1;if(G.occ[c[0]]===-3)G.occ[c[0]]=-1;opened++;if(c[3]==='bar')S0.bar=performance.now();}});
    granSet(v);
    if(opened&&typeof say==='function'){var kd=null;S0.hz.cells.forEach(function(c){if(c[2]&&!c[4]){c[4]=1;kd=c[3];}});
      var T={bar:L2('Шлагбаум поднят!','The barrier is up!'),hatch:L2('Люк закрыли — проезжай!','Manhole closed — drive on!'),trash:L2('Мусоровоз уехал!','The garbage truck has left!')};
      if(kd&&T[kd])try{say(T[kd],'bench');}catch(e){}}}
  function L2(a,b){try{return L(a,b);}catch(e){return a;}}
  /* врезался в бабушку на переходе — не авария: машина тормозит, ход потерян */
  function onBump(v){if(!S0||S0.g!==curG()||v.block!==-4)return false;
    try{if(typeof SND!=='undefined'&&SND.horn)SND.horn();say(L2('Пропусти бабушку!','Let Granny cross!'),'bench');if(typeof ambTick==='function')ambTick();}catch(e){}
    S0.g.combo=0;S0.g0=S0.ex-2;granSet();return true;}
  /* ---- рисунки (только заливки, как в «Летнем дворе») ---- */
  function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
  function badge(g,x,y,n,c){var r=cs*.2;g.fillStyle=c||'#2d3436';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='#fff';g.font='900 '+Math.round(r*1.2)+'px Rubik,-apple-system,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(n,x,y+r*.06);}
  function cell(c){var w=S0.g.p.w;return toPx([c%w,Math.floor(c/w)]);}
  function drawHatch(g,c,left){var p=cell(c),x=p[0],y=p[1],s=cs;zone(g,x-s*.46,y-s*.46,x+s*.46,y+s*.46);
    g.fillStyle='#3d3d3d';g.beginPath();g.ellipse(x,y,s*.3,s*.22,0,0,7);g.fill();g.fillStyle='#222';g.beginPath();g.ellipse(x,y+s*.02,s*.22,s*.15,0,0,7);g.fill();
    [[-.34,-.3],[.34,-.3],[-.34,.3],[.34,.3]].forEach(function(o){var cx=x+o[0]*s,cy=y+o[1]*s;g.fillStyle='#ff7a1a';g.beginPath();g.moveTo(cx,cy-s*.16);g.lineTo(cx+s*.08,cy+s*.08);g.lineTo(cx-s*.08,cy+s*.08);g.closePath();g.fill();
      g.fillStyle='#fff';g.fillRect(cx-s*.05,cy-s*.04,s*.1,s*.04);});
    badge(g,x+s*.3,y-s*.32,left,'#ff7a1a');}
  /* жёлто-чёрная рамка «зона работ» вокруг клетки помехи — чтобы помеху не спутать с машиной */
  function zone(g,x0,y0,x1,y1){var s=cs,k=Math.max(2,s*.07);g.save();g.lineWidth=k;g.strokeStyle='#2d3436';rr(g,x0,y0,x1-x0,y1-y0,s*.1);g.stroke();
    g.setLineDash([s*.16,s*.16]);g.strokeStyle='#ffc233';rr(g,x0,y0,x1-x0,y1-y0,s*.1);g.stroke();g.restore();}
  function drawBar(g,c,up){var p=cell(c),x=p[0],y=p[1],s=cs;
    if(!up)zone(g,x-s*.46,y-s*.46,x+s*.46,y+s*.46);
    g.fillStyle='#596275';rr(g,x-s*.44,y-s*.2,s*.13,s*.42,s*.04);g.fill();rr(g,x+s*.31,y-s*.06,s*.13,s*.28,s*.04);g.fill();
    g.save();g.translate(x-s*.375,y-s*.08);g.rotate(up?-1.35:0);
    g.fillStyle='#2d3436';rr(g,-s*.02,-s*.1,s*.84,s*.2,s*.06);g.fill();
    for(var i=0;i<5;i++){g.fillStyle=i%2?'#fff':'#e84118';g.fillRect(s*.02+i*s*.16,-s*.07,s*.16,s*.14);}g.restore();
    if(!up){g.fillStyle='#e84118';g.beginPath();g.arc(x-s*.375,y-s*.26,s*.08,0,7);g.fill();}}
  function drawKey(g,v,t){var p=null;for(var k=0;k<v.L;k++){var q=toPx(trackPt(v.track,k+v.s));if(!p||q[1]<p[1])p=q;}var s=Math.max(cs,22),x=p[0],y=p[1]-cs*.62+Math.sin(t*3)*s*.04,R=s*.3;
    g.fillStyle='rgba(255,214,40,.45)';g.beginPath();g.arc(x,y,R*1.35,0,7);g.fill();
    g.fillStyle='#fff';g.strokeStyle='#e1a800';g.lineWidth=s*.06;g.beginPath();g.arc(x,y,R,0,7);g.fill();g.stroke();
    g.fillStyle='#e1a800';g.beginPath();g.arc(x-s*.09,y,s*.1,0,7);g.fill();g.fillRect(x-s*.02,y-s*.03,s*.22,s*.06);g.fillRect(x+s*.13,y,s*.04,s*.09);g.fillRect(x+s*.06,y,s*.04,s*.07);
    g.fillStyle='#fff';g.beginPath();g.arc(x-s*.09,y,s*.04,0,7);g.fill();}
  function drawTrash(g,tr,left,t){var a=cell(tr.cells[0]),b=cell(tr.cells[tr.cells.length-1]),s=cs,x0=Math.min(a[0],b[0])-s*.46,y0=Math.min(a[1],b[1])-s*.46,x1=Math.max(a[0],b[0])+s*.46,y1=Math.max(a[1],b[1])+s*.46;
    var horiz=(x1-x0)>(y1-y0),W2=x1-x0,H2=y1-y0;zone(g,x0,y0,x1,y1);
    var m=s*.1,X0=x0+m,Y0=y0+m,X1=x1-m,Y1=y1-m,w=X1-X0,h=Y1-Y0;
    g.fillStyle='rgba(0,0,0,.2)';rr(g,X0+s*.04,Y0+s*.07,w,h,s*.1);g.fill();
    /* кузов-контейнер: серый с рёбрами, кабина — оранжевая (как у коммунальщиков), маячок */
    g.fillStyle='#8395a7';rr(g,X0,Y0,w,h,s*.1);g.fill();
    g.strokeStyle='#576574';g.lineWidth=Math.max(1,s*.05);g.beginPath();
    for(var i=1;i<6;i++){if(horiz){var xx=X0+w*.72*i/6;g.moveTo(xx,Y0+s*.06);g.lineTo(xx,Y1-s*.06);}else{var yy=Y0+h*.72*i/6;g.moveTo(X0+s*.06,yy);g.lineTo(X1-s*.06,yy);}}g.stroke();
    g.fillStyle='#ff9f1a';if(horiz)rr(g,X0+w*.74,Y0,w*.26,h,s*.1);else rr(g,X0,Y0+h*.74,w,h*.26,s*.1);g.fill();
    g.fillStyle='#bfe6ff';if(horiz)g.fillRect(X0+w*.88,Y0+h*.18,w*.08,h*.64);else g.fillRect(X0+w*.18,Y0+h*.88,w*.64,h*.08);
    var bx=horiz?X0+w*.8:X0+w*.5,by=horiz?Y0+h*.5:Y0+h*.8,on=Math.sin(t*8)>0;g.fillStyle=on?'#ffd628':'#e17055';g.beginPath();g.arc(bx,by,s*.09,0,7);g.fill();
    g.fillStyle='#fff';g.font='900 '+Math.round(s*.34)+'px Rubik,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('♻',X0+w*(horiz?.36:.5),Y0+h*(horiz?.5:.36));
    badge(g,x1-s*.12,y0+s*.08,left,'#2f8f55');}
  function drawZebra(g,c){var p=cell(c),s=cs;g.fillStyle='rgba(255,255,255,.85)';for(var i=0;i<4;i++)g.fillRect(p[0]-s*.44+i*s*.24,p[1]-s*.46,s*.13,s*.92);}
  function drawGran(g,c,t){var p=cell(c),s=cs*1.35,x=p[0]+Math.sin(t*2)*cs*.08,y=p[1]+cs*.28,bob=Math.abs(Math.sin(t*5))*s*.03;
    g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x,y+s*.06,s*.22,s*.07,0,0,7);g.fill();
    g.fillStyle='#7a4a8c';rr(g,x-s*.18,y-s*.44-bob,s*.36,s*.5,s*.13);g.fill(); // пальто
    g.fillStyle='#f3c9a3';g.beginPath();g.arc(x,y-s*.54-bob,s*.13,0,7);g.fill();
    g.fillStyle='#e84118';g.beginPath();g.arc(x,y-s*.57-bob,s*.15,Math.PI,0);g.fill();g.beginPath();g.moveTo(x-s*.15,y-s*.57-bob);g.lineTo(x,y-s*.42-bob);g.lineTo(x+s*.15,y-s*.57-bob);g.fill(); // платок
    g.fillStyle='#2d3436';g.beginPath();g.arc(x-s*.045,y-s*.53-bob,s*.018,0,7);g.arc(x+s*.045,y-s*.53-bob,s*.018,0,7);g.fill();
    g.strokeStyle='#6d4c41';g.lineWidth=s*.045;g.beginPath();g.moveTo(x+s*.24,y-s*.32-bob);g.lineTo(x+s*.28,y+s*.05);g.stroke(); // палочка
    g.fillStyle='#feca57';rr(g,x-s*.36,y-s*.26-bob,s*.16,s*.18,s*.03);g.fill();g.strokeStyle='#e1a800';g.lineWidth=s*.025;g.beginPath();g.arc(x-s*.28,y-s*.26-bob,s*.06,Math.PI,0);g.stroke();} // авоська
  function draw(g,layer,t){try{if(W.LVLM&&LVLM.draw)LVLM.draw(g,layer,t);}catch(e){}if(!S0||S0.g!==curG())return;var hz=S0.hz;
    if(layer==='under'){if(hz.gran>=0)drawZebra(g,hz.gran);
      hz.cells.forEach(function(c){if(c[3]==='hatch'&&!c[2])drawHatch(g,c[0],Math.max(1,c[1]-S0.ex));
        if(c[3]==='bar'){var up=c[2];if(!up||performance.now()-S0.bar<1500)drawBar(g,c[0],up);}});
      if(hz.trash){var c0=hz.cells.filter(function(c){return c[3]==='trash';})[0];if(c0&&!c0[2])drawTrash(g,hz.trash,Math.max(1,c0[1]-S0.ex),t);}}
    else{if(hz.gran>=0&&granOn())drawGran(g,hz.gran,t);
      if(hz.key>=0){var v=S0.g.vs[hz.key];if(v&&(v.state==='idle'||v.state==='bump')&&hz.cells.some(function(c){return c[3]==='bar'&&!c[2];}))drawKey(g,v,t);}}}
  /* плашка знакомства: 1-й двор региона (знакомство с главной помехой) и первый раз, когда помеха встречается вне своего региона */
  var TIP={bar:['🚧 Шлагбаум! Поднимется, когда уедет машина с брелоком 🔑.','🚧 A barrier! It lifts once the car with the key fob 🔑 leaves.'],
    hatch:['🕳 Люки открыты! Конусы уберут через несколько выездов — цифра рядом.','🕳 Open manholes! The cones go after a few cars leave — see the number.'],
    trash:['🚛 Мусоровоз загородил выезд — уедет через несколько машин.','🚛 The garbage truck is blocking the way — it leaves after a few cars.'],
    gran:['👵 Бабушка на переходе! Пока идёт — не проехать: машина затормозит, ход потерян.','👵 Granny on the crossing! While she walks, cars stop — and the move is lost.'],
    polar:['🌙 Полярная ночь! У нескольких машин нет стрелок — смотри на фары.','🌙 Polar night! Some cars have no arrows — check their lights.'],
    big:['🏭 Заводские дворы большие, а фуры длинные. Не спеши!','🏭 Factory yards are big and the trucks are long. Take your time!']};
  function tip(idx){if(!ON||idx<50||!W.VYREG)return '';var r=VYREG.at(idx);if(!r||idx+1!==r.from)return '';var t=TIP[r.hz];return t?L2(t[0],t[1]):'';}
  W.LVLH={make:make,start:start,onExit:onExit,onBump:onBump,draw:draw,tip:tip,kindsFor:kindsFor,granOn:granOn,state:function(){return S0;}};
})(window);
