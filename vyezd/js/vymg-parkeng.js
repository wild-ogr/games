'use strict';
/* vy-park · движок «Парковки задним» (js/vymg-parkeng.js → window.VYPE). Журнал — release-i/vyezd-boost/logs/MGC.md, раздел «Парковка в 4 местах».
   Обобщён из js/vymg-parkovka.js (поток MGC): честная «велосипедная» модель, руль-баранка, педали, клавиши KEYS (←/→ руль, ↑/↓ педали, WASD/ЦФЫВ,
   Пробел — руль прямо, H/Р — Митяй переставит, Enter — дальше), подсказки деда Митяя, «бум» при касании.
   Площадка = spec {kind, car, th, night, ice, fest, tight 0..1, seed, calm}:
     kind: 'bay' задом между машинами (90°) · 'diag' «ёлочка» (под углом) · 'par' «карман» вдоль бордюра · 'gar' гараж-«ракушка» · 'dock' рампа (грузовые) · 'lane' задом по узкому проезду в ворота;
     car: id VYCARS (размеры — таблица DIM: Ока 3,2 м … ПАЗик 7 м; длиннее 7 м не берём); th — тема: yard двор, gar гаражи, market рынок, station вокзал,
     stadium стадион, square Красная площадь; night — ночь (видно только у фар и фонарей); ice — снег/гололёд (тормозит хуже); fest 'hw'|'ny' — украшения праздника.
   Решаемость: VYPE.solve(spec) строит площадку и прогоняет автопилот Митяя (те же руль/педали, шаг 1/30 с, машина «толще» на 8 см); перебирает точку разворота;
     не вышло — площадка шире (до 8 шагов). Результат кэшируется: {S, ok, t — секунд у автопилота, par — норматив ★ = t×1,35+6}.
   Игра: VYPE.play(host, o, cfg) — cfg {lots:[spec…], mode:'classic'|'stars', intro:{text,hint}, onLot(i,r), done(res[])→{score,tier,label,extra}}.
     r = {parked, touch, sloppy, nose, helped, time, par, pts, stars}. classic — очки 3 − касания(≤2) − криво − передом (≥1), Митяй — 0 (как было);
     stars — ★ встал · ★ без касаний и ровно · ★ не дольше норматива; Митяй — 0.
   Тест: window.__vyc_parkovka (st) и st.api.auto()/help()/ff(n) — как у прежней игры. */
(function(){if(typeof VYMG_REG!=='function'||!window.VYC)return;
var K=window.VYC,T=function(a,b){return K.L(a,b);};
var WROT=450,DRATE=2.2,VMAX=1.7,VCALM=1.05,VTRUCK=1.45,ACC=2.6,DEC=4.5,ACC_ICE=1.5,DEC_ICE=1.7;
/* размеры: [длина, ширина, колёсная база, задний свес], метры */
var DIM={kopeyka:[4.07,1.61,2.42,.8],shesterka:[4.17,1.62,2.42,.82],devyatka:[4.0,1.65,2.46,.72],moskvich:[4.1,1.55,2.4,.86],zapor:[3.73,1.49,2.16,.7],
  gorbaty:[3.33,1.4,2.02,.62],oka:[3.2,1.42,2.18,.5],niva:[3.74,1.68,2.2,.78],volga:[4.8,1.8,2.8,1.05],taxi:[4.8,1.8,2.8,1.05],buhanka:[4.36,1.94,2.3,.95],
  raf:[4.98,1.95,2.62,1.1],gazel:[5.5,2.0,2.9,1.45],kabluk:[4.2,1.65,2.46,.9],gazon:[6.4,2.4,3.7,1.55],hleb:[6.4,2.4,3.7,1.55],moloko:[6.4,2.4,3.7,1.55],
  paz:[7.0,2.4,3.6,1.9],skoraya:[5.5,2.0,2.9,1.45],tabletka:[4.36,1.94,2.3,.95],bobik:[3.85,1.75,2.3,.8],polivalka:[6.4,2.4,3.7,1.55],musorovoz:[6.4,2.4,3.7,1.55],
  morozh:[5.5,2.0,2.9,1.45],samosval:[6.4,2.4,3.7,1.55],gaz66:[5.8,2.3,3.3,1.3],belarus:[3.9,1.97,2.37,.6],trekol:[4.6,2.4,2.6,1.0],pobeda:[4.67,1.7,2.7,1.0],
  volga21:[4.83,1.8,2.7,1.08],zim:[5.53,1.9,3.2,1.15],chaika:[5.6,2.0,3.25,1.2],zil:[6.7,2.5,4.0,1.45]};
var BIG={liaz:'paz',laz:'paz',ikarus:'paz',trolley:'raf',kamaz:'samosval',kran:'zil',pozhar:'zil'};
function carId(id){id=BIG[id]||id;return DIM[id]?id:'moskvich';}
function dims(id,dm){id=carId(id);var d=dm&&dm.length===4?dm:DIM[id],L=d[0],W=d[1],LW=d[2],ROV=d[3],DM=(L>5.6?31:33)*Math.PI/180;
  return {id:id,L:L,W:W,LW:LW,ROV:ROV,CC:L/2-ROV,DMAX:DM,RMIN:LW/Math.tan(DM),big:L>5.6};}
/* ---------- геометрия ---------- */
function obb(cx,cy,w,h,a){return {cx:cx,cy:cy,hw:w/2,hh:h/2,a:a||0,r:Math.hypot(w,h)/2};}
function corners(b){var c=Math.cos(b.a),s=Math.sin(b.a),o=[];[[1,1],[1,-1],[-1,-1],[-1,1]].forEach(function(k){var x=k[0]*b.hw,y=k[1]*b.hh;o.push({x:b.cx+x*c-y*s,y:b.cy+x*s+y*c});});return o;}
function sat(A,B){var rr=(A.r||Math.hypot(A.hw,A.hh))+(B.r||Math.hypot(B.hw,B.hh));if(Math.abs(A.cx-B.cx)>rr||Math.abs(A.cy-B.cy)>rr)return false;
  var pa=corners(A),pb=corners(B),ax=[A.a,A.a+Math.PI/2,B.a,B.a+Math.PI/2];
  for(var i=0;i<4;i++){var nx=Math.cos(ax[i]),ny=Math.sin(ax[i]),a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
    for(var j=0;j<4;j++){var d=pa[j].x*nx+pa[j].y*ny;if(d<a0)a0=d;if(d>a1)a1=d;d=pb[j].x*nx+pb[j].y*ny;if(d<b0)b0=d;if(d>b1)b1=d;}
    if(a1<b0||b1<a0)return false;}return true;}
function norm(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}
function carBox(p,cm,m){m=m||0;var b=obb(p.x+Math.cos(p.th)*cm.CC,p.y+Math.sin(p.th)*cm.CC,cm.L+2*m,cm.W+2*m,p.th);return b;}
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
/* место в своей системе: u — вдоль оси места (куда смотрит нос), v — поперёк */
function slotUV(sl,x,y){var c=Math.cos(sl.th),s=Math.sin(sl.th),dx=x-sl.cx,dy=y-sl.cy;return {u:dx*c+dy*s,v:-dx*s+dy*c};}
function inside(S,p){var cs=corners(carBox(p,S.cm)),sl=S.slot,e=.06;for(var i=0;i<4;i++){var q=slotUV(sl,cs[i].x,cs[i].y);if(Math.abs(q.u)>sl.hl+e||Math.abs(q.v)>sl.hw+e)return false;}return true;}
function nearIn(S,p,m){var cs=corners(carBox(p,S.cm)),sl=S.slot,n=0;for(var i=0;i<4;i++){var q=slotUV(sl,cs[i].x,cs[i].y);if(Math.abs(q.u)<=sl.hl+m&&Math.abs(q.v)<=sl.hw+m)n++;}return n;}
/* ---------- темы ---------- */
var TH={
  yard:{n:['Двор','Yard'],grass:'#8cc071',asph:'#868e96',side:'#a5abb2',walk:'#dee2e6',line:'#f8f9fa',back:'house',pool:['volga','kopeyka','shesterka','niva','zapor','devyatka','oka','moskvich','gorbaty']},
  gar:{n:['Гаражи','Garages'],grass:'#93b872',asph:'#7f868d',side:'#8f969c',walk:'#c9ced3',line:'#f1f3f5',back:'garages',pool:['moskvich','kopeyka','niva','zapor','volga','pobeda','bobik']},
  market:{n:['Рынок','Market'],grass:'#8cc071',asph:'#80878e',side:'#a39b8f',walk:'#e5dccb',line:'#ffe066',back:'kiosks',pool:['gazel','buhanka','kabluk','raf','moskvich','niva']},
  station:{n:['Вокзал','Station'],grass:'#86b96c',asph:'#7a8188',side:'#a5abb2',walk:'#e0d8c8',line:'#ffffff',back:'station',pool:['taxi','volga','raf','gazel','kopeyka','devyatka']},
  stadium:{n:['Стадион','Stadium'],grass:'#6fb35a',asph:'#7b838b',side:'#9aa2aa',walk:'#d7dce1',line:'#f8f9fa',back:'stands',pool:['raf','volga','niva','gazel','devyatka','kopeyka']},
  square:{n:['Красная площадь','Red Square'],grass:'#7fb366',asph:'#6f6660',side:'#7c706a',walk:'#b9aca2',line:'#f1e7da',back:'kremlin',cobble:1,pool:['chaika','zim','volga21','pobeda','volga']}};
var FEST={hw:{night:1,pump:1,col:'#ff922b'},ny:{ice:1,fir:1,garl:1}};
function theme(spec){var t=TH[spec.th]||TH.yard,f=FEST[spec.fest]||{},o={},k;for(k in t)o[k]=t[k];o.night=!!(spec.night||f.night);o.ice=!!(spec.ice||f.ice);o.pump=!!f.pump;o.fir=!!f.fir;o.garl=!!f.garl;
  if(o.ice){o.grass='#eef3f7';o.asph='#b9c4ce';o.side='#cfd8df';o.walk='#f4f7fa';}return o;}
/* ---------- площадки ---------- */
var KINDS=['bay','diag','par','gar','dock','lane'];
function build(spec,lo){var R=rng(spec.seed>>>0||1),cm=dims(spec.car,spec.dim),th=theme(spec),t=Math.max(0,Math.min(1,+spec.tight||0)),calm=spec.calm?1:0;
  var kind=spec.kind==='par'&&cm.L>6.2?'dock':KINDS.indexOf(spec.kind)<0?'bay':spec.kind;
  var S={kind:kind,spec:spec,cm:cm,thm:th,obs:[],cars:[],deco:[],lines:[],lo:lo},g=.55-.24*t+.1*lo+calm*.12;
  function add(o,tp){o.t=tp;S.obs.push(o);return o;}
  function pool(maxL){var a=th.pool.filter(function(id){return DIM[id]&&DIM[id][0]<=maxL;});return a.length?a:['oka'];}
  function pcar(cx,cy,a,maxL){var a2=pool(maxL),id=a2[Math.floor(R()*a2.length)%a2.length],d=DIM[id];S.cars.push({id:id,cx:cx,cy:cy,a:a,L:d[0],W:d[1]});add(obb(cx,cy,d[0]+.05,d[1]+.05,a),'car');}
  function filler(cx,cy,a,w,h){var r=R();if(th.back==='kiosks'||th.back==='station'){add(obb(cx,cy,Math.min(w,1.6),Math.min(h,1.2),0),'crate');}else if(th.fest==='ny'||th.fir){add(obb(cx,cy,1.3,1.3,0),'fir');}else add(obb(cx,cy,1.0,.9,0),r<.5?'bin':'bush');}
  var RW=cm.RMIN*1.25+cm.W*.5+.7-.7*t+.4*lo+calm*.3;
  if(S.kind==='bay'||S.kind==='diag'){var dg=S.kind==='diag',ang=dg?Math.PI/2-.55:Math.PI/2,bw=cm.W+2*g+(dg?.15:0),dep=cm.L+.45+.08*lo,y0=1.6;
    var tx=Math.max(7.2,3.4+cm.L),sx=dg?bw/Math.sin(ang):bw,yb,cy,hl=dep/2,hw=bw/2;
    if(dg){var ext=hl*Math.sin(ang)+hw*Math.cos(ang);yb=y0+2*ext;cy=y0+ext;}else{yb=y0+dep;cy=y0+hl;}
    S.slot={cx:tx,cy:cy,th:ang,hl:hl,hw:hw};S.road=[yb,yb+RW];S.WW=tx+cm.RMIN+cm.L+3;S.WH=yb+RW+.6;
    add(obb(S.WW/2,y0-.85,S.WW+8,1.7),'curb');add(obb(S.WW/2,S.road[1]+.8,S.WW+8,1.6),'curb');
    var nL=-Math.ceil((tx+3)/sx),nR=Math.ceil((S.WW-tx+3)/sx);S.bays=[];
    for(var i=nL;i<=nR;i++){var c=tx+i*sx;S.bays.push(c);if(!i)continue;var nb=Math.abs(i)===1;
      if(nb||R()<.55)pcar(c+(R()-.5)*.25*g,cy,(R()<.7?ang:ang+Math.PI)+(R()-.5)*.04,dep+.3);else if(R()<.5)filler(c,y0+.75,ang,bw-.5,.9);}
    S.start={x:1.0+cm.ROV,y:yb+RW*.58,th:0};S.swing=true;
    S.task=dg?T('«Ёлочка»: встань <b>задом</b> на косое место — мордой на дорогу.','Angled bay: <b>reverse</b> into the slanted spot — nose to the road.'):
      T('Встань <b>задом</b> на свободное место — мордой на дорогу.','<b>Reverse</b> into the free spot — nose facing the road.');}
  else if(S.kind==='gar'||S.kind==='dock'){var dk=S.kind==='dock',iw=cm.W+2*g+(dk?.2:0),wt=.3,gw=iw+wt,dep2=cm.L+(dk?.9:1.2)+.08*lo,tx2=Math.max(7.2,3.4+cm.L),N=7,ti=3;
    S.WW=tx2+cm.RMIN+cm.L+3;S.road=[dep2,dep2+RW+.3];S.WH=S.road[1]+.6;S.gar=[];
    add(obb(S.WW/2,-.3,S.WW+8,.6),'wall');add(obb(S.WW/2,S.road[1]+.8,S.WW+8,1.6),'curb');
    for(var k2=-ti;k2<N-ti;k2++){var a=tx2+k2*gw-gw/2,b=a+gw;S.gar.push([a,b,k2===0]);add(obb(a,dep2/2-.1,wt,dep2+.2),dk?'rail':'wall');
      if(k2!==0){if(dk){if(R()<.6)pcar((a+b)/2,(dep2-.3)/2+.1,Math.PI/2,dep2-.4);else add(obb((a+b)/2,dep2*.35,Math.min(iw-.4,1.8),1.4),'crate');}else add(obb((a+b)/2,dep2-.1,gw,.2),'door');}}
    var lb=S.gar[S.gar.length-1];add(obb(lb[1],dep2/2-.1,wt,dep2+.2),dk?'rail':'wall');
    S.slot={cx:tx2,cy:dep2/2,th:Math.PI/2,hl:dep2/2,hw:iw/2-.02};if(dk)S.ramp=[tx2-iw/2,tx2+iw/2];
    S.start={x:1.0+cm.ROV,y:S.road[0]+RW*.6,th:0};S.swing=true;
    S.task=dk?T('Подай <b>задом</b> к рампе под разгрузку — ровно между перилами.','<b>Reverse</b> up to the loading ramp — straight between the rails.'):
      T('Загони машину в гараж <b>задом</b>. Гараж узкий — не поцарапай!','<b>Reverse</b> the car into the garage. It’s narrow — don’t scratch it!');}
  else if(S.kind==='par'){var Sl=cm.L+2.15-.55*t+.22*lo+calm*.5,sw=cm.W+.64,yc0=2.0,x0=3.2+cm.L;S.slot={cx:x0+Sl/2,cy:yc0+sw/2,th:0,hl:Sl/2,hw:sw/2};
    var sy=S.slot.cy+cm.W+.95;S.road=[yc0+sw,sy+cm.W/2+2.6+.3*lo];S.WW=x0+Sl+2*cm.L+2*cm.RMIN+2;S.WH=S.road[1]+.6;
    add(obb(S.WW/2,yc0-1.0,S.WW+8,2.0),'curb');add(obb(S.WW/2,S.road[1]+.8,S.WW+8,1.6),'curb');
    var aL=pool(cm.L+1.5),idB=aL[Math.floor(R()*aL.length)%aL.length],idF=aL[Math.floor(R()*aL.length)%aL.length];
    S.cars.push({id:idB,cx:x0-DIM[idB][0]/2-.08,cy:S.slot.cy,a:0,L:DIM[idB][0],W:DIM[idB][1]});add(obb(x0-DIM[idB][0]/2-.08,S.slot.cy,DIM[idB][0],DIM[idB][1],0),'car');
    S.cars.push({id:idF,cx:x0+Sl+DIM[idF][0]/2+.08,cy:S.slot.cy,a:0,L:DIM[idF][0],W:DIM[idF][1]});add(obb(x0+Sl+DIM[idF][0]/2+.08,S.slot.cy,DIM[idF][0],DIM[idF][1],0),'car');
    if(R()<.6){var xb=x0-DIM[idB][0]-1.0-cm.L/2;if(xb>-1)pcar(xb,S.slot.cy,0,cm.L+1);}
    S.start={x:Math.max(1.0+cm.ROV,x0+.8-cm.CC),y:sy,th:0};S.par=true;
    S.task=T('«Карман» вдоль бордюра: <b>задом</b> между машинами.','Parallel park along the kerb: <b>reverse</b> between the cars.');}
  else{/* lane: задом по проезду в ворота */var bw3=cm.W+2*g,dep3=cm.L+.5,y03=1.6,yb3=y03+dep3,tx3=Math.max(6.5,cm.L+2.5),lw=cm.W+2.3-.8*t+.35*lo+calm*.3;
    var off=(R()<.5?-1:1)*Math.max(0,Math.min(lw/2-cm.W/2-.3,.5+.8*t-.12*lo)),ang3=Math.PI/2+(R()-.5)*.24*(1-lo/8);
    S.slot={cx:tx3,cy:y03+dep3/2,th:Math.PI/2,hl:dep3/2,hw:bw3/2};S.WW=tx3*2;
    var sy3=yb3+2.6+cm.ROV+cm.L*.3;S.start={x:tx3+off,y:sy3,th:ang3};S.WH=sy3+cm.L+1.8;S.road=[yb3,S.WH];
    add(obb(S.WW/2,y03-.85,S.WW+8,1.7),'curb');
    [-1,1].forEach(function(sd){add(obb(tx3+sd*(bw3/2+.15),y03+dep3/2,.3,dep3),'wall');add(obb(tx3+sd*(bw3/2+.35),yb3+.2,.55,.55),'post');
      add(obb(tx3+sd*(bw3/2+2.8),y03+dep3/2,4.4,dep3+.2),'wall2');
      for(var yy=yb3+1.4;yy<S.WH+2;yy+=4.9){if(R()<.8)pcar(tx3+sd*(lw/2+.95),yy+2.1,Math.PI/2+(R()<.5?0:Math.PI),4.6);else filler(tx3+sd*(lw/2+.7),yy+1.6,0,1.2,1.2);}});
    S.lane=lw;S.task=T('Задом через ворота — <b>по прямой</b>, не задень столбы!','<b>Reverse</b> straight through the gate — mind the posts!');}
  S.WW=Math.max(S.WW,14);S.WH=Math.max(S.WH,9);
  S.tgt={x:S.slot.cx-Math.cos(S.slot.th)*cm.CC,y:S.slot.cy-Math.sin(S.slot.th)*cm.CC};   // где встать задней оси
  for(var q=0;q<S.obs.length;q++)S.obs[q].r=Math.hypot(S.obs[q].hw,S.obs[q].hh);
  return S;}
/* ---------- планы автопилота ---------- */
function planSwing(S,X){var sl=S.slot;return [['steer',0],['go',1,function(p){return p.x>=X;}],['steer',-S.cm.DMAX],['go',-1,function(p){return norm(p.th)>=sl.th-.04;}],['pp']];}
function planLane(S){return [['steer',0],['pp']];}
/* параллельная: дуга (руль до упора) → прямо назад sl → встречная дуга. Ищем угол φ, при котором путь чист с запасом 10 см */
function planPar(S){var cm=S.cm,R0=cm.RMIN,y0=S.start.y,yf=S.slot.cy,D=y0-yf,best=null,sx0=S.slot.cx-S.slot.hl;
  for(var xf=sx0+cm.ROV+.2;xf<=S.slot.cx-cm.CC+.01&&!best;xf+=.1)for(var dg=22;dg<=52;dg++){var ph=dg*Math.PI/180,sl=(D-2*R0*(1-Math.cos(ph)))/Math.sin(ph);if(sl<0)continue;
    var x0=xf+2*R0*Math.sin(ph)+sl*Math.cos(ph),pts=[],k,a;
    for(k=0;k<=12;k++){a=ph*k/12;pts.push({x:x0-R0*Math.sin(a),y:y0-R0*(1-Math.cos(a)),th:a});}
    var x1=x0-R0*Math.sin(ph),y1=y0-R0*(1-Math.cos(ph));for(k=1;k<=8;k++)pts.push({x:x1-sl*k/8*Math.cos(ph),y:y1-sl*k/8*Math.sin(ph),th:ph});
    var x2=x1-sl*Math.cos(ph),y2=y1-sl*Math.sin(ph);for(k=1;k<=12;k++){a=ph*(1-k/12);pts.push({x:x2-R0*(Math.sin(ph)-Math.sin(a)),y:y2-R0*(Math.cos(a)-Math.cos(ph)),th:a});}
    var ok=pts.every(function(q){var b=carBox(q,cm,.1);return !S.obs.some(function(o){return sat(b,o);});});
    if(ok&&x0<S.WW-cm.L-.5){best={ph:ph,sl:sl,x0:x0,y2:y2,xf:xf};break;}}
  if(!best)return null;var b=best;S.pl=b;
  return [['steer',0],['go',1,function(p){return p.x>=b.x0;}],['steer',-cm.DMAX],['go',-1,function(p){return p.th>=b.ph-.008;}],['steer',0],['go',-1,function(p){return p.y<=b.y2+.01;}],
    ['steer',cm.DMAX],['go',-1,function(p){return p.th<=.008;}],['steer',0],['center']];}
/* ---------- общая физика (игра и решатель — одним кодом) ---------- */
function phys(S){var ice=S.thm.ice,big=S.cm.big;return {vmax:S.spec.calm?VCALM:big?VTRUCK:VMAX,acc:ice?ACC_ICE:ACC,dec:ice?DEC_ICE:DEC};}
function hitOf(S,q,m){var b=carBox(q,S.cm,m);for(var i=0;i<S.obs.length;i++)if(sat(b,S.obs[i]))return S.obs[i];if(b.cx<-4||b.cx>S.WW+4||b.cy<-4||b.cy>S.WH+4)return {t:'edge'};return null;}
/* где встанем, если отпустить педаль сейчас (тормозной путь v²/2a по текущей дуге) */
function ahead(W){var p=W.p,q={x:p.x,y:p.y,th:p.th},d=W.v*Math.abs(W.v)/(2*W.ph.dec),n=8,h=d/n;for(var i=0;i<n;i++){q.x+=Math.cos(q.th)*h;q.y+=Math.sin(q.th)*h;q.th+=h/W.S.cm.LW*Math.tan(W.d);}return q;}
/* шаг автопилота: управляет W.wheel/W.ped (как игрок) */
function apStep(W,dt){var A=W.auto,S=W.S,cm=S.cm,p=W.p,sl=S.slot;if(!A)return;if(!A.cur){A.cur=A.q.shift();A.t=0;if(!A.cur){W.auto=null;W.ped=0;return;}}var c=A.cur;A.t+=dt;
  if(c[0]==='steer'){W.ped=0;if(Math.abs(W.v)>.02)return;W.wheel=c[1]/cm.DMAX*WROT;if(Math.abs(W.d-c[1])<.01)A.cur=null;return;}
  if(c[0]==='go'){if(c[2](ahead(W))||A.t>30){W.ped=0;if(Math.abs(W.v)<.02)A.cur=null;return;}W.ped=c[1];return;}
  if(c[0]==='pp'){var cu=Math.cos(sl.th),su=Math.sin(sl.th),s=(p.x-S.tgt.x)*cu+(p.y-S.tgt.y)*su,Ld=Math.max(2.2,cm.LW*.95),ax=S.tgt.x+cu*(s-Ld),ay=S.tgt.y+su*(s-Ld),
      thb=p.th+Math.PI,al=norm(Math.atan2(ay-p.y,ax-p.x)-thb),db=Math.atan2(2*cm.LW*Math.sin(al),Ld),dd=Math.max(-cm.DMAX,Math.min(cm.DMAX,-db));
    W.wheel=dd/cm.DMAX*WROT;if(s<=.03||A.t>30){W.ped=0;if(Math.abs(W.v)<.02)A.cur=null;return;}W.ped=-1;return;}
  if(c[0]==='center'){var e=(S.tgt.x-p.x)*Math.cos(sl.th)+(S.tgt.y-p.y)*Math.sin(sl.th);if(Math.abs(e)<.06||A.t>8){W.ped=0;if(Math.abs(W.v)<.02)A.cur=null;return;}W.ped=e>0?1:-1;return;}}
/* шаг машины: руль догоняет баранку, скорость к цели педали; столкновение → onHit(obj) должен вернуть true, если ехать дальше нельзя */
function carStep(W,dt,onHit,margin){var cm=W.S.cm,ph=W.ph;var dw=W.wheel/WROT*cm.DMAX,dd=dw-W.d,mx=DRATE*dt;W.d+=Math.max(-mx,Math.min(mx,dd));
  var tv=W.stop?0:W.ped*(W.auto?Math.min(ph.vmax,1.1)*(W.auto.cur&&W.auto.cur[0]!=='go'?.6:1):ph.vmax);
  if(tv)W.v+=Math.max(-ph.acc*dt,Math.min(ph.acc*dt,tv-W.v));else{var dc=ph.dec*dt;W.v=Math.abs(W.v)<=dc?0:W.v-Math.sign(W.v)*dc;}
  var p=W.p,n=3,h=dt/n;for(var i=0;i<n;i++){var q={x:p.x+W.v*Math.cos(p.th)*h,y:p.y+W.v*Math.sin(p.th)*h,th:p.th+W.v/cm.LW*Math.tan(W.d)*h};
    var hit=hitOf(W.S,q,margin||0);if(hit){if(onHit(hit,q))return hit;}p.x=q.x;p.y=q.y;p.th=norm(q.th);}return null;}
function verdict(S,p){var sl=S.slot,inn=inside(S,p),err=Math.abs(norm(p.th-sl.th)),errR=Math.abs(norm(p.th-sl.th-Math.PI)),nose=errR<err,e=Math.min(err,errR)*180/Math.PI;
  var c={x:p.x+Math.cos(p.th)*S.cm.CC,y:p.y+Math.sin(p.th)*S.cm.CC},axis=Math.abs(slotUV(sl,c.x,c.y).v);return {inn:inn,nose:nose,e:e,axis:axis,sloppy:e>5||axis>.35};}
/* прогон автопилота без экрана: {ok, t} */
function simulate(S,plan,margin){var W={S:S,ph:phys(S),p:{x:S.start.x,y:S.start.y,th:S.start.th},v:0,d:0,wheel:0,ped:0,auto:{q:plan.slice(),cur:null}},dt=1/30,t=0,fail=false;
  while(t<90){apStep(W,dt);if(carStep(W,dt,function(){fail=true;return true;},margin))break;t+=dt;if(!W.auto&&Math.abs(W.v)<.02)break;}
  if(fail||t>=90)return {ok:false,t:t};var v=verdict(S,W.p);return {ok:v.inn&&!v.nose&&!v.sloppy,t:t+.6,v:v};}
function solveS(S){var M=.08;if(S.par){var pl=planPar(S);if(!pl)return null;var r=simulate(S,pl,M);return r.ok?{plan:pl,t:r.t}:null;}
  if(S.kind==='lane'){var pl2=planLane(S),r2=simulate(S,pl2,M);return r2.ok?{plan:pl2,t:r2.t}:null;}
  var sl=S.slot,x0=sl.cx-.5,x1=sl.cx+S.cm.RMIN+S.cm.L*.8,run=[],best=[],X;
  for(X=x0;X<=x1;X+=.25){var r3=simulate(S,planSwing(S,X),M);if(r3.ok){run.push([X,r3.t]);if(run.length>best.length)best=run.slice();}else run=[];}
  if(!best.length)return null;var mid=best[Math.floor((best.length-1)/2)];S.goX=mid[0];return {plan:planSwing(S,mid[0]),t:mid[1],X:mid[0],n:best.length};}
var CACHE={};
function key(spec){return [spec.kind,carId(spec.car),String(spec.dim||''),spec.th,spec.night?1:0,spec.ice?1:0,spec.fest||'',(+spec.tight||0).toFixed(2),spec.seed>>>0,spec.calm?1:0].join('|');}
function solve(spec){var k=key(spec);if(CACHE[k])return CACHE[k];var out=null;
  for(var lo=0;lo<=8;lo++){var S=build(spec,lo),r=solveS(S);if(r){S.plan=r.plan;out={S:S,ok:true,t:r.t,lo:lo,par:Math.round(r.t*1.35+6)};break;}}
  if(!out){var S2=build(spec,8);S2.plan=S2.par?planPar(S2)||[]:S2.kind==='lane'?planLane(S2):planSwing(S2,S2.slot.cx+S2.cm.RMIN);out={S:S2,ok:false,t:60,lo:9,par:90};}
  CACHE[k]=out;return out;}
function fresh(spec){var r=solve(spec),S=build(spec,r.lo>8?8:r.lo);if(S.par)S.plan=planPar(S)||r.S.plan;else if(S.kind==='lane')S.plan=planLane(S);else{S.goX=r.S.goX;S.plan=planSwing(S,r.S.goX);}return {S:S,t:r.t,par:r.par,ok:r.ok};}

/* ================= игра ================= */
function SAYf(){return {hit:[T('Стоп! Задел!','Stop! You touched it!'),T('Ой! Бампер!','Ouch! The bumper!'),T('Тише, тише — притёрся!','Easy, easy — you scraped it!'),T('Бах! Ну аккуратнее!','Bang! Gently now!')],
 near:[T('Стоп! Ещё чуть — и поцелуешь!','Stop! A bit more and you’ll kiss it!'),T('Осторожно, близко!','Careful, that’s close!')],
 back:[T('Ещё! Ещё!','Keep going! More!'),T('Так, так, хорошо… ещё!','That’s it, good… more!'),T('Давай-давай, помаленьку!','Come on, little by little!')],
 left:[T('Руль влево!','Wheel to the left!'),T('Левее крути!','Turn more left!')],right:[T('Руль вправо!','Wheel to the right!'),T('Правее крути!','Turn more right!')],
 stopturn:[T('Стоп! Теперь руль до упора и — назад!','Stop! Now full lock and — reverse!')],fwd:[T('Проезжай вперёд, мимо места.','Drive forward, past the spot.'),T('Вперёд, вперёд — проезжай место.','Forward, forward — go past the spot.')],
 lane:[T('Задом, задом — держи по центру!','Back, back — keep to the middle!'),T('Смотри в зеркала — столбы рядом!','Mind the mirrors — the posts are close!')],
 crook:[T('Кривовато! Выровняй.','A bit crooked! Straighten up.'),T('Встал наискось — поправь.','You’re at an angle — fix it.')],deeper:[T('Ещё назад! Нос торчит.','Back more! The nose sticks out.'),T('Глубже, глубже!','Deeper, deeper!')],
 ok3:T('Стоп! Встал как влитой!','Stop! Parked like a glove!'),ok2:T('Встал! Ну, почти идеально.','Parked! Nearly perfect.'),ok1:T('Встал… Ну, главное — встал.','Parked… Well, it’s in.'),
 nose:T('Передом заехал! Задом надо было… Ладно, засчитаю.','You went in nose first! It was meant to be reverse… Fine, it counts.'),auto:T('Ладно, смотри, как надо…','All right, watch how it’s done…'),idle:T('Чего стоим? Жми педаль!','Why are we standing? Press a pedal!'),
 ice:T('Скользко! Тормози заранее — по льду катится.','Slippery! Brake early — it slides on ice.'),night:T('Темно — смотри, куда фары светят. Место я подсветил.','It’s dark — watch where the lights point. I lit the spot.'),
 help:T('Вот так! Руль до упора — и потихоньку. В следующий раз сам!','Like that! Full lock — and slowly. Next time you do it!'),crooked:T(' Чуть криво.',' A little crooked.')};}

function play(host,o,cfg){var SAY=SAYf(),R=o.rnd||Math.random,calm=K.calm(o),lots=cfg.lots,N=lots.length,stars=cfg.mode==='stars';
  var S=null,p=null,cur=null;
  var f=K.frame(host,o,{who:cfg.who||'mityai'}),C=K.canvas(f.main),ctx=C.ctx;
  var st={i:0,res:[],rs:[],score:0,fin:false,t:0,touch:0,inC:0,hitT:-9,sayT:-9,lastSay:'',okT:0,done:false,ped:0,wheel:0,d:0,v:0,auto:null,t0:0,keyL:0,keyR:0,keyU:0,keyD:0,helpOn:false,mode:cfg.mode||'classic'};
  window.__vyc_parkovka=st;
  K.onQuit(host,function(){st.fin=true;});   // вышел (✕) — отложенные «Итоги» не срабатывают
  function img(id,col){return window.VYCARS&&VYCARS.img?VYCARS.img(id,col?{view:'top',state:'new',color:col}:{view:'top',state:'new'}):null;}
  /* ---- органы управления (DOM): руль и педали ---- */
  var foot=f.foot;foot.style.alignItems='center';foot.style.gap='12px';
  var wh=document.createElement('div');wh.className='vyc-wheel';wh.style.cssText='flex:none;width:112px;height:112px;touch-action:none;cursor:grab;position:relative';
  wh.innerHTML='<svg viewBox="0 0 100 100" width="112" height="112" style="display:block"><circle cx="50" cy="50" r="46" fill="none" stroke="#2d3436" stroke-width="9"/><circle cx="50" cy="50" r="46" fill="none" stroke="#495057" stroke-width="4"/>'+
    '<path d="M50 50 L10 46 M50 50 L90 46 M50 50 L50 90" stroke="#2d3436" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="50" r="12" fill="#495057"/><circle cx="50" cy="50" r="5" fill="#ced4da"/><rect x="46" y="2" width="8" height="10" rx="2" fill="#ff7a45"/></svg>';
  var wtxt=document.createElement('div');wtxt.style.cssText='position:absolute;left:0;right:0;bottom:-2px;text-align:center;font:700 11px Rubik,sans-serif;color:#2d3436;opacity:.7;pointer-events:none';
  wh.appendChild(wtxt);
  var ped=document.createElement('div');ped.style.cssText='display:flex;flex-direction:column;gap:8px;flex:1;max-width:260px';
  var bF=K.btn(T('▲ Вперёд','▲ Forward')+K.kc('↑',host),''),bB=K.btn(T('▼ Назад','▼ Reverse')+K.kc('↓',host),'acc');[bF,bB].forEach(function(b){b.style.minHeight='54px';b.style.width='100%';});
  ped.appendChild(bF);ped.appendChild(bB);
  var bHelp=K.btn(T('Митяй переставит','Mityai will park it')+K.kc('H',host)+(stars?T('<small>площадка — без звёзд</small>','<small>no stars for this spot</small>'):T('<small>за это задание — 0</small>','<small>0 for this task</small>')),'',function(){autoRun(true);});
  bHelp.style.cssText='position:absolute;right:8px;top:8px;min-height:44px;font-size:13px;padding:6px 10px;display:none;z-index:2';
  f.main.appendChild(bHelp);
  function hold(b,dir){var on=function(e){e.preventDefault();if(st.auto||st.done)return;st.ped=dir;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(x){}},
      off=function(){if(st.ped===dir)st.ped=0;b.classList.remove('on');};
    b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);b.addEventListener('contextmenu',function(e){e.preventDefault();});}
  hold(bF,1);hold(bB,-1);
  var wa=null,lastTap=0;   // руль: вращаешь вокруг центра; двойной тап — прямо
  function ang(e){var r=wh.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI;}
  wh.addEventListener('pointerdown',function(e){if(st.auto||st.done)return;e.preventDefault();var now=Date.now();if(now-lastTap<300){st.wheel=0;lastTap=0;return;}lastTap=now;wa=ang(e);wh.style.cursor='grabbing';try{wh.setPointerCapture(e.pointerId);}catch(x){}});
  wh.addEventListener('pointermove',function(e){if(wa==null||st.auto)return;var a=ang(e),d=a-wa;if(d>180)d-=360;if(d<-180)d+=360;wa=a;st.wheel=Math.max(-WROT,Math.min(WROT,st.wheel+d));});
  var wup=function(){wa=null;wh.style.cursor='grab';};wh.addEventListener('pointerup',wup);wh.addEventListener('pointercancel',wup);
  foot.innerHTML='';foot.appendChild(wh);foot.appendChild(ped);
  K.keys(host,function(k,e,d){var m={L:'keyL',R:'keyR',U:'keyU',D:'keyD'}[K.dir(k)];
    if(m){st[m]=d?1:0;return true;}if(!d)return false;
    if(k==='Enter'||k===' '){if(st.done){if(st.nextOn)next();}else if(!st.auto)st.wheel=0;return true;}
    if((k==='h'||k==='H'||k==='р'||k==='Р')&&st.helpOn&&!st.done&&!st.auto){autoRun(true);return true;}return false;});
  /* ---- задания ---- */
  function load(i){cur=fresh(lots[i]);S=cur.S;st.S=S;st.par=cur.par;st.solved=cur.ok;p={x:S.start.x,y:S.start.y,th:S.start.th};st.p=p;st.myCar=S.cm.id;
    ['oka'].concat(S.cars.map(function(c){return c.id;})).concat([S.cm.id]).forEach(function(id){img(id);});img(S.cm.id,S.spec.col);fit();}
  function startTask(){if(!cur||st.loaded!==st.i){load(st.i);st.loaded=st.i;}
    st.go=1;p.x=S.start.x;p.y=S.start.y;p.th=S.start.th;st.v=0;st.d=0;st.wheel=0;st.ped=0;st.touch=0;st.okT=0;st.done=false;st.nextOn=false;st.auto=null;st.helped=false;
    st.t0=st.t;st.helpOn=false;bHelp.style.display='none';st.inC=0;st.lastSay='';st.warn=0;
    f.prog(N>1?N:0,st.i,st.res);if(host.top&&N>1)host.top(T('Задание ','Task ')+(st.i+1)+T(' из ',' of ')+N);foot.innerHTML='';foot.appendChild(wh);foot.appendChild(ped);
    sayNow(S.task,'norm');}
  function sayNow(t,m){st.lastSay=t;st.sayT=st.t;f.say(t,m||'norm');}
  function say(t,m,force){if(!force&&(st.t-st.sayT<1.6||t===st.lastSay))return;sayNow(t,m);}
  function finishTask(r,why){st.done=true;st.ped=0;r.time=Math.round((st.t-st.t0)*10)/10;r.par=st.par;r.touch=st.touch;r.helped=!!st.helped;
    r.pts=r.helped?0:r.parked?Math.max(1,3-Math.min(2,st.touch)-(r.sloppy?1:0)-(r.nose?1:0)):0;
    r.stars=r.helped||!r.parked?0:1+(!st.touch&&!r.sloppy&&!r.nose?1:0)+(r.time<=st.par?1:0);
    st.rs.push(r);st.res.push(stars?r.stars:r.pts);st.score+=stars?r.stars:r.pts;f.prog(N>1?N:0,-1,st.res);bHelp.style.display='none';
    var good=stars?r.stars:r.pts;K.snd(host,good>=2?'win':good?'coin':'tap');K.buzz(20);
    if(stars&&!r.helped)why+=' '+'★'.repeat(r.stars)+'☆'.repeat(3-r.stars)+(r.stars<3?' — '+(st.touch||r.sloppy||r.nose?T('без касаний и ровно — ещё ★','clean and straight — one more ★'):T('быстрее '+st.par+' с — ещё ★','under '+st.par+' s — one more ★')):'');
    sayNow(why,good>=2?'happy':good?'norm':'sad');
    try{if(cfg.onLot)cfg.onLot(st.i,r,lots[st.i]);}catch(e){console.warn('vype onLot',e);}
    var last=st.i>=N-1;setTimeout(function(){if(st.fin)return;foot.innerHTML='';var b=K.btn((last?T('Итоги','Results'):T('Следующее задание','Next task'))+K.kc('Enter',host),'grn',next);b.style.flex='1';b.style.maxWidth='420px';foot.appendChild(b);st.nextOn=true;if(last&&cfg.autoFin)setTimeout(function(){if(!st.fin&&!host.paused)fin();},1600);},calm?200:700);}
  function next(){if(!st.done||!st.nextOn||host.paused)return;if(st.i>=N-1){fin();return;}st.i++;startTask();}
  function fin(){if(st.fin)return;st.fin=true;var out=cfg.done?cfg.done(st.rs):{score:st.score,tier:0};host.done(out);}
  /* ---- автопилот (Митяй): те же руль и педали ---- */
  function autoRun(help){if(st.done||st.auto)return;if(help){st.helped=true;bHelp.style.display='none';sayNow(SAY.auto,'happy');st.fade=1;p.x=S.start.x;p.y=S.start.y;p.th=S.start.th;st.v=0;st.d=0;st.wheel=0;}
    st.auto={q:S.plan.slice(),cur:null};st.ped=0;}
  /* ---- физика ---- */
  function step(dt){if(!S)return;if(st.fade>0)st.fade=Math.max(0,st.fade-dt*2);
    st.ph=st.ph&&st.phS===S?st.ph:(st.phS=S,phys(S));
    if(st.auto)apStep(st,dt);
    else if(!st.done){var kd=(st.keyR-st.keyL);if(kd)st.wheel=Math.max(-WROT,Math.min(WROT,st.wheel+kd*320*dt));if(st.keyU||st.keyD)st.ped=st.keyU?1:-1;else if(st.kp)st.ped=0;st.kp=st.keyU||st.keyD;}
    st.stop=st.done;
    var was=st.inC;st.inC=0;
    carStep(st,dt,function(hit){if(!was&&st.t-st.hitT>.6){st.touch++;st.hitT=st.t;K.snd(host,'crash');K.buzz(40);say(K.pick(SAY.hit,R),'wow',true);st.shake=calm?0:.25;}
      st.inC=1;var bk=-Math.sign(st.v)*.06;p.x+=Math.cos(p.th)*bk;p.y+=Math.sin(p.th)*bk;if(hitOf(S,p))p.x-=Math.cos(p.th)*bk,p.y-=Math.sin(p.th)*bk;st.v=0;return true;});
    if(st.shake>0)st.shake=Math.max(0,st.shake-dt);
    if(!st.done&&!st.helpOn&&(st.t-st.t0>40||st.touch>=3)&&!st.auto){st.helpOn=true;bHelp.style.display='';}
    judge(dt);}
  function judge(dt){if(st.done)return;var vd=verdict(S,p),still=Math.abs(st.v)<.03&&st.ped===0;
    if(vd.inn&&still){st.okT+=dt;if(st.okT>.6){
        if(vd.e>12&&!st.auto){say(K.pick(SAY.crook,R),'norm');return;}
        var r={parked:true,sloppy:vd.sloppy,nose:vd.nose};
        if(st.helped){finishTask(r,SAY.help);return;}
        var pts=Math.max(1,3-Math.min(2,st.touch)-(vd.sloppy?1:0)-(vd.nose?1:0));
        finishTask(r,vd.nose?SAY.nose:pts===3?SAY.ok3:pts===2?SAY.ok2+(vd.sloppy?SAY.crooked:''):SAY.ok1);}return;}
    st.okT=0;if(st.auto)return;
    if(!st.warn&&st.t-st.t0>2.5&&(S.thm.ice||S.thm.night)){st.warn=1;say(S.thm.ice?SAY.ice:SAY.night,'wow',true);return;}
    var cnt=nearIn(S,p,.7),sl=S.slot;
    if(cnt>=3&&vd.e>9&&st.v<=0&&nearIn(S,p,.05)>=2){say(K.pick(SAY.crook,R),'norm');return;}
    if(cnt>=3&&!vd.inn){if(st.v<0||Math.abs(st.v)<.02)say(K.pick(SAY.deeper,R),'norm');return;}
    var md=minDist();if(md<.35&&Math.abs(st.v)>.1){say(K.pick(SAY.near,R),'wow');return;}
    if(st.v<-.1){var desired=ppAdvice();if(desired!=null){var dif=desired-st.d;if(dif<-.3)say(K.pick(SAY.left,R),'norm');else if(dif>.3)say(K.pick(SAY.right,R),'norm');else say(K.pick(S.kind==='lane'?SAY.lane:SAY.back,R),'happy');}}
    else if(st.v>.1){var gx=S.par?S.pl&&S.pl.x0:S.goX;if(gx!=null&&p.x>=gx-.15&&S.kind!=='lane')say(SAY.stopturn[0],'wow');else if(st.t-st.t0<6&&S.kind!=='lane')say(K.pick(SAY.fwd,R),'norm');}
    else if(st.t-st.t0>6&&st.t-st.sayT>5)say(SAY.idle,'norm');}
  /* какой руль нужен, чтобы задом попасть на ось места (чистая погоня) */
  function ppAdvice(){var sl=S.slot,cm=S.cm;if(S.par){var ax=S.tgt.x-1.2,ay=S.tgt.y;var thb=p.th+Math.PI,dx=ax-p.x,dy=ay-p.y,Ld=Math.hypot(dx,dy);if(Ld<.6||Ld>9)return null;
      var al=norm(Math.atan2(dy,dx)-thb);return Math.max(-cm.DMAX,Math.min(cm.DMAX,-Math.atan2(2*cm.LW*Math.sin(al),Ld)));}
    var cu=Math.cos(sl.th),su=Math.sin(sl.th),s=(p.x-S.tgt.x)*cu+(p.y-S.tgt.y)*su;if(s>cm.L+4.5)return null;var Ld2=2.4,ax2=S.tgt.x+cu*Math.max(-.5,s-Ld2),ay2=S.tgt.y+su*Math.max(-.5,s-Ld2);
    var thb2=p.th+Math.PI,al2=norm(Math.atan2(ay2-p.y,ax2-p.x)-thb2);return Math.max(-cm.DMAX,Math.min(cm.DMAX,-Math.atan2(2*cm.LW*Math.sin(al2),Math.max(1,Math.hypot(ax2-p.x,ay2-p.y)))));}
  function minDist(){var cs=corners(carBox(p,S.cm)),m=9;S.obs.forEach(function(o){var c=Math.cos(-o.a),s=Math.sin(-o.a);cs.forEach(function(q){var x=(q.x-o.cx)*c-(q.y-o.cy)*s,y=(q.x-o.cx)*s+(q.y-o.cy)*c,dx=Math.max(0,Math.abs(x)-o.hw),dy=Math.max(0,Math.abs(y)-o.hh);m=Math.min(m,Math.hypot(dx,dy));});});return m;}
  /* ---- рисование ---- */
  var V={s:20,ox:0,oy:0},night=null;
  /* на узком экране — ближе (видно ~12,5 м на машину 4 м), камера плавно держит машину и место */
  function fit(){C.fit();if(!S)return;var pad=6,k=Math.max(1,S.cm.L/4.2);V.wv=C.h>C.w*1.15?Math.min(S.WW,12.5*k):S.WW;V.wh=S.WH;
    var top=S.gar?-.6:-3.4,sc=function(h){return Math.min((C.w-pad*2)/V.wv,(C.h-pad*2)/h);},s0=sc(V.wh);if(sc(V.wh-top)<s0*.9)top=Math.max(top,-1.2);   // крыша/фасад сверху — если влезает без сильного уменьшения
    V.s=sc(V.wh-top);V.oy=(C.h-(V.wh-top)*V.s)/2-top*V.s;V.cx=null;cam(1);}
  function cam(k){if(!S)return;var half=C.w/V.s/2,want=S.WW/2;if(half*2<S.WW&&p)want=Math.max(half,Math.min(S.WW-half,(p.x+Math.cos(p.th)*S.cm.CC+S.slot.cx)/2));V.cx=V.cx==null||k>=1?want:V.cx+(want-V.cx)*k;V.ox=C.w/2-V.cx*V.s;}
  function draw(dt,t){st.t+=dt;step(dt);if(C.w!==f.main.clientWidth||C.h!==f.main.clientHeight)fit();if(!S)return;cam(Math.min(1,dt*3));var c=ctx,s=V.s,th=S.thm;
    c.fillStyle=th.grass;c.fillRect(0,0,C.w,C.h);
    c.save();var sh=st.shake>0?(Math.random()-.5)*4*st.shake/.25:0;c.translate(V.ox+sh,V.oy);c.scale(s,s);
    ground(c,t);
    S.cars.forEach(function(k){drawCar(c,k.id,k.cx,k.cy,k.a,k.L,k.W*1.08,null);});
    S.obs.forEach(function(o){obst(c,o);});
    target(c,t);
    var b=carBox(p,S.cm);drawCar(c,S.cm.id,b.cx,b.cy,p.th,S.cm.L,S.cm.W*1.1,{col:S.spec.col,wheels:st.d,rev:st.v<-.05||st.ped<0,brake:st.ped===0&&Math.abs(st.v)>.05});
    if(th.garl)garland(c,t);
    c.restore();
    if(th.night)dark(c,b,t);
    if(st.fade>0){c.fillStyle='rgba(255,255,255,'+st.fade*.8+')';c.fillRect(0,0,C.w,C.h);}
    wh.firstChild.style.transform='rotate('+st.wheel+'deg)';wtxt.textContent=Math.abs(st.wheel)<15?T('прямо','straight'):(st.wheel<0?T('◀ влево','◀ left'):T('вправо ▶','right ▶'));
    c.font='700 13px Rubik,sans-serif';c.textBaseline='middle';var tt=T('Касаний: ','Bumps: ')+st.touch,tw=c.measureText(tt).width+16;c.fillStyle='rgba(255,253,247,.9)';K.rr(c,8,8,tw,26,13);c.fill();c.fillStyle=st.touch?'#c92a2a':'#2d3436';c.fillText(tt,16,21);
    if(stars&&!st.helped&&st.loaded!=null&&st.go){var el=st.done&&st.rs.length?st.rs[st.rs.length-1].time:Math.max(0,st.t-st.t0),over=el>st.par,t2='⏱ '+Math.floor(el)+T(' с',' s')+' · ★ ≤ '+st.par+T(' с',' s'),tw2=c.measureText(t2).width+16;
      c.fillStyle='rgba(255,253,247,.9)';K.rr(c,8,40,tw2,26,13);c.fill();c.fillStyle=over?'#868e96':'#2b8a3e';c.fillText(t2,16,53);}
    c.textBaseline='alphabetic';}
  function ground(c,t){var th=S.thm,k=S.kind,W=S.WW;
    c.fillStyle=th.asph;c.fillRect(-4,S.road[0]-.2,W+8,S.road[1]-S.road[0]+.4);
    if(th.cobble){c.fillStyle='rgba(0,0,0,.07)';for(var yy=Math.floor(S.road[0]);yy<S.road[1];yy+=.5)for(var xx=-4+((yy*2)%1);xx<W+4;xx+=1)c.fillRect(xx,yy,.9,.42);}
    else{c.fillStyle='rgba(255,255,255,.08)';for(var i=0;i<40;i++)c.fillRect(((i*7.31)%W),S.road[0]+((i*3.17)%(S.road[1]-S.road[0])),.3,.08);}
    if(th.ice){c.fillStyle='rgba(255,255,255,.45)';for(var j=0;j<14;j++){var ix=(j*5.7)%W,iy=S.road[0]+((j*2.9)%(S.road[1]-S.road[0]));c.beginPath();c.ellipse(ix,iy,1.2,.35,0,0,7);c.fill();}}
    c.fillStyle=th.walk;c.fillRect(-4,S.road[1]+.2,W+8,.25);
    for(var tr=0;tr<W/3.6;tr++){var tx=1.5+tr*3.6,ty=S.road[1]+1.4;if(th.fir)fir(c,tx,ty,.95);else{c.fillStyle=th.ice?'#c9d6cf':'#5c9e46';c.beginPath();c.arc(tx,ty,.9,0,7);c.fill();c.fillStyle=th.ice?'#ffffff':'#74b85a';c.beginPath();c.arc(tx-.2,ty-.2,.55,0,7);c.fill();}
      if(th.pump&&tr%2)pumpkin(c,tx+1.6,ty+.1,.45,t);}
    if(k==='bay'||k==='diag'||k==='lane'){var y0=S.slot.cy-(k==='diag'?S.slot.hl*Math.sin(S.slot.th)+S.slot.hw*Math.cos(S.slot.th):S.slot.hl);
      c.fillStyle=th.side;c.fillRect(-4,y0,W+8,S.road[0]-y0);c.fillStyle=th.walk;c.fillRect(-4,-4,W+8,y0-.15+4);c.fillStyle='rgba(0,0,0,.15)';c.fillRect(-4,y0-.15,W+8,.18);
      backdrop(c,y0-.2,t);
      c.strokeStyle=th.line;c.lineWidth=.12;
      if(k==='lane'){c.fillStyle=th.side;c.fillRect(S.slot.cx-S.lane/2,S.road[0],S.lane,S.WH-S.road[0]+1);}
      else S.bays.forEach(function(x){var sl=S.slot,cu=Math.cos(sl.th),su=Math.sin(sl.th),vx=-su,vy=cu,cx=x,cy=sl.cy;[-1,1].forEach(function(sd){var ex=cx+vx*sl.hw*sd,ey=cy+vy*sl.hw*sd;c.beginPath();c.moveTo(ex-cu*sl.hl,ey-su*sl.hl);c.lineTo(ex+cu*sl.hl,ey+su*sl.hl);c.stroke();});});}
    else if(k==='par'){var yc=S.slot.cy-S.slot.hw;c.fillStyle=th.side;c.fillRect(-4,yc,W+8,S.road[0]-yc+.2);c.fillStyle=th.walk;c.fillRect(-4,-4,W+8,yc-.15+4);c.fillStyle='rgba(0,0,0,.15)';c.fillRect(-4,yc-.15,W+8,.2);backdrop(c,yc-.3,t);
      c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=.12;c.setLineDash([1.2,1]);c.beginPath();c.moveTo(-4,yc+S.slot.hw*2+.1);c.lineTo(W+4,yc+S.slot.hw*2+.1);c.stroke();c.setLineDash([]);}
    else{var dk=k==='dock';c.fillStyle=dk?'#5f6b75':'#6c757d';c.fillRect(-4,-4,W+8,4);S.gar.forEach(function(g,i){var a=g[0],b=g[1];c.fillStyle=g[2]?(dk?'#8d969e':'#495057'):(dk?'#9aa3ab':'#adb5bd');c.fillRect(a,-.6,b-a,S.road[0]+.6);
        c.fillStyle='rgba(0,0,0,.08)';for(var r=0;r<S.road[0];r+=1)c.fillRect(a,r,b-a,.06);
        if(dk){if(g[2]){c.fillStyle='#f59f00';for(var z=a+.1;z<b-.2;z+=.6)c.fillRect(z,.05,.3,.25);}}
        else if(!g[2]){c.fillStyle='#5c7cfa';c.fillRect(a+.15,S.road[0]-.2,b-a-.3,.25);c.fillStyle='rgba(255,255,255,.4)';c.fillRect((a+b)/2-.03,S.road[0]-.2,.06,.25);}
        else{var dw=(b-a-.3)/2;c.fillStyle='#5c7cfa';c.save();c.translate(a+.15,S.road[0]);c.rotate(.9);c.fillRect(0,-.06,dw,.12);c.restore();c.save();c.translate(b-.15,S.road[0]);c.rotate(Math.PI-.9);c.fillRect(0,-.06,dw,.12);c.restore();}
        c.fillStyle='#e9ecef';c.font='bold .55px Rubik,sans-serif';c.textAlign='center';c.fillText(String(12+i),(a+b)/2,.8);c.textAlign='left';});
      if(th.pump)S.gar.forEach(function(g,i){if(!g[2]&&i%2)pumpkin(c,g[1]-.5,S.road[0]+.45,.35,t);});}}
  function backdrop(c,y,t){var th=S.thm,W=S.WW,b=th.back;
    if(b==='house'){c.fillStyle=th.ice?'#e8dccb':'#f3e3c6';c.fillRect(-4,y-3.2,W+8,3.0);c.fillStyle=th.ice?'#ffffff':'#c9765a';c.fillRect(-4,y-3.3,W+8,.25);
      for(var x=.8;x<W;x+=2.2){c.fillStyle=th.night?'#ffd43b':'#bfe0f2';c.fillRect(x,y-2.6,1.1,.9);}c.fillStyle='#8a5a3a';[4.1,W-4.1].forEach(function(x){c.fillRect(x,y-1.1,1.2,1.1);});}
    else if(b==='garages'){for(var x2=-2;x2<W+2;x2+=3.2){c.fillStyle='#8d949b';c.fillRect(x2,y-2.6,3.0,2.5);c.fillStyle='#5c7cfa';c.fillRect(x2+.3,y-1.7,2.4,1.6);c.fillStyle='#6c757d';c.fillRect(x2,y-2.8,3.0,.3);}}
    else if(b==='kiosks'){var cols=['#e03131','#1971c2','#2f9e44','#f08c00'];for(var x3=-1,i=0;x3<W+2;x3+=3.0,i++){c.fillStyle='#f1e3c8';c.fillRect(x3,y-2.4,2.6,2.3);c.fillStyle=cols[i%4];
        for(var s2=0;s2<4;s2++){c.fillStyle=s2%2?'#fff':cols[i%4];c.fillRect(x3+s2*.65,y-2.9,.65,.6);}c.fillStyle='#ffd8a8';c.fillRect(x3+.4,y-1.6,1.8,.7);}}
    else if(b==='station'){c.fillStyle='#e9c46a';c.fillRect(-4,y-3.4,W+8,3.3);c.fillStyle='#b5651d';c.fillRect(-4,y-3.6,W+8,.3);for(var x4=.6;x4<W;x4+=2.0){c.fillStyle=th.night?'#ffd43b':'#a5d8ff';c.fillRect(x4,y-2.9,.9,1.6);}
      var cx=W/2;c.fillStyle='#fff';c.beginPath();c.arc(cx,y-3.9,.8,0,7);c.fill();c.strokeStyle='#343a40';c.lineWidth=.1;c.stroke();c.beginPath();c.moveTo(cx,y-3.9);c.lineTo(cx,y-4.4);c.moveTo(cx,y-3.9);c.lineTo(cx+.35,y-3.9);c.stroke();}
    else if(b==='stands'){for(var r=0;r<3;r++){c.fillStyle=r%2?'#4dabf7':'#ff6b6b';c.fillRect(-4,y-1-r*.9,W+8,.75);}c.fillStyle='#495057';for(var x5=0;x5<W;x5+=4){c.fillRect(x5,y-4.2,.12,1.4);c.fillStyle=x5%8?'#ffd43b':'#f03e3e';c.fillRect(x5+.12,y-4.2,.8,.5);c.fillStyle='#495057';}}
    else if(b==='kremlin'){c.fillStyle='#a33a2b';c.fillRect(-4,y-2.6,W+8,2.5);c.fillStyle='#8f2f22';for(var x6=-4;x6<W+4;x6+=1.0){c.beginPath();c.moveTo(x6,y-2.6);c.lineTo(x6+.15,y-3.1);c.lineTo(x6+.35,y-2.95);c.lineTo(x6+.55,y-3.1);c.lineTo(x6+.7,y-2.6);c.fill();}
      var tx=W*.7;c.fillStyle='#a33a2b';c.fillRect(tx-.9,y-5.2,1.8,5.1);c.fillStyle='#2b8a3e';c.beginPath();c.moveTo(tx-.9,y-5.2);c.lineTo(tx,y-6.8);c.lineTo(tx+.9,y-5.2);c.fill();c.fillStyle='#e03131';c.beginPath();c.arc(tx,y-7,.25,0,7);c.fill();
      c.fillStyle='#fff';c.beginPath();c.arc(tx,y-4.3,.45,0,7);c.fill();}}
  function obst(c,o){var th=S.thm;c.save();c.translate(o.cx,o.cy);c.rotate(o.a);var w=o.hw*2,h=o.hh*2;
    if(o.t==='bin'){c.fillStyle='#2f9e44';K.rr(c,-o.hw,-o.hh,w,h,.15);c.fill();c.fillStyle='#237032';c.fillRect(-o.hw,-o.hh,w,.18);}
    else if(o.t==='bush'){c.fillStyle=th.ice?'#dfe9e3':'#4f9a3c';c.beginPath();c.arc(0,0,o.hw,0,7);c.fill();}
    else if(o.t==='crate'){c.fillStyle='#c08a4a';c.fillRect(-o.hw,-o.hh,w,h);c.strokeStyle='#8a5a2a';c.lineWidth=.06;c.strokeRect(-o.hw+.05,-o.hh+.05,w-.1,h-.1);c.beginPath();c.moveTo(-o.hw,-o.hh);c.lineTo(o.hw,o.hh);c.stroke();}
    else if(o.t==='fir'){c.restore();fir(c,o.cx,o.cy,o.hw);return;}
    else if(o.t==='wall'&&S.kind!=='lane'){c.fillStyle='#495057';c.fillRect(-o.hw,-o.hh,w,h);}
    else if(o.t==='wall'){c.fillStyle='#8f5b3a';c.fillRect(-o.hw,-o.hh,w,h);}
    else if(o.t==='wall2'){c.fillStyle=th.ice?'#e9eef2':'#b4a28c';c.fillRect(-o.hw,-o.hh,w,h);c.fillStyle='rgba(0,0,0,.12)';for(var yy=-o.hh;yy<o.hh;yy+=.5)c.fillRect(-o.hw,yy,w,.05);}
    else if(o.t==='post'){c.fillStyle='#e8590c';c.fillRect(-o.hw,-o.hh,w,h);c.fillStyle='#fff';c.fillRect(-o.hw,-.06,w,.12);}
    else if(o.t==='rail'){c.fillStyle='#f59f00';c.fillRect(-o.hw*.5,-o.hh,o.hw,h);c.fillStyle='#343a40';for(var y2=-o.hh;y2<o.hh;y2+=.6)c.fillRect(-o.hw*.5,y2,o.hw,.3);}
    c.restore();}
  function fir(c,x,y,r){c.fillStyle='#2b8a3e';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.fillStyle='#37b24d';c.beginPath();c.arc(x,y,r*.62,0,7);c.fill();c.fillStyle='#fff';[[.4,.2],[-.3,.5],[.1,-.5],[-.5,-.2]].forEach(function(q){c.beginPath();c.arc(x+q[0]*r,y+q[1]*r,r*.11,0,7);c.fill();});c.fillStyle='#ffd43b';c.beginPath();c.arc(x,y,r*.16,0,7);c.fill();}
  function pumpkin(c,x,y,r,t){c.fillStyle='#e8590c';c.beginPath();c.ellipse(x,y,r*1.15,r,0,0,7);c.fill();c.fillStyle='#ffd43b';var g=.6+.4*Math.sin(t*3+x);c.globalAlpha=g;c.beginPath();c.moveTo(x-r*.5,y-r*.2);c.lineTo(x-r*.25,y-r*.45);c.lineTo(x-r*.05,y-r*.2);c.fill();
    c.beginPath();c.moveTo(x+r*.05,y-r*.2);c.lineTo(x+r*.25,y-r*.45);c.lineTo(x+r*.5,y-r*.2);c.fill();c.fillRect(x-r*.45,y+r*.2,r*.9,r*.18);c.globalAlpha=1;c.fillStyle='#2b8a3e';c.fillRect(x-r*.08,y-r*1.2,r*.16,r*.3);}
  function garland(c,t){var y=S.road[0]-.05,W=S.WW,cols=['#ff6b6b','#ffd43b','#69db7c','#4dabf7'];c.strokeStyle='rgba(30,30,30,.6)';c.lineWidth=.05;c.beginPath();for(var x=-2;x<W+2;x+=.5)c.lineTo(x,y+Math.sin(x*1.3)*.12);c.stroke();
    for(var i=0,x2=-2;x2<W+2;x2+=.9,i++){var on=((i+Math.floor(t*2))%4);c.fillStyle=cols[on];c.beginPath();c.arc(x2,y+Math.sin(x2*1.3)*.12,.11,0,7);c.fill();}}
  function target(c,t){var sl=S.slot,pl=calm?1:.6+.4*Math.sin(t*4);c.save();c.translate(sl.cx,sl.cy);c.rotate(sl.th);
    c.strokeStyle='rgba(255,212,59,'+pl+')';c.lineWidth=.13;c.setLineDash([.5,.35]);c.strokeRect(-sl.hl+.08,-sl.hw+.08,sl.hl*2-.16,sl.hw*2-.16);c.setLineDash([]);
    c.fillStyle='rgba(255,212,59,'+(.45*pl)+')';c.beginPath();c.moveTo(1.2,0);c.lineTo(.2,-.7);c.lineTo(.2,-.3);c.lineTo(-1.2,-.3);c.lineTo(-1.2,.3);c.lineTo(.2,.3);c.lineTo(.2,.7);c.closePath();c.fill();
    c.rotate(-sl.th);c.fillStyle='rgba(255,255,255,.85)';c.font='bold 1.1px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('P',0,S.par?0:-1.6);c.restore();}
  function drawCar(c,id,cx,cy,a,L,W,o){c.save();c.translate(cx,cy);c.rotate(a);var cm=S.cm;
    c.fillStyle='rgba(0,0,0,.22)';K.rr(c,-L/2+.12,-W/2+.15,L,W,.4);c.fill();
    if(o&&o.wheels!=null){c.fillStyle='#212529';var fx=-L/2+cm.ROV+cm.LW;[-1,1].forEach(function(sd){c.save();c.translate(fx,sd*(cm.W/2-.05));c.rotate(o.wheels);c.fillRect(-.32,-.12,.64,.24);c.restore();c.fillRect(-L/2+cm.ROV-.32,sd*(cm.W/2-.05)-.12,.64,.24);});}
    var im=img(id,o&&o.col);if(im&&im.complete&&im.naturalWidth)c.drawImage(im,-L/2,-W/2,L,W);else{c.fillStyle='#c8372d';K.rr(c,-L/2,-W/2,L,W,.35);c.fill();c.fillStyle='#bfe0f2';c.fillRect(-.2,-W/2+.2,1,W-.4);}
    if(o){if(o.rev){c.fillStyle='rgba(255,255,255,.95)';c.fillRect(-L/2-.05,-W/2+.2,.12,.3);c.fillRect(-L/2-.05,W/2-.5,.12,.3);c.fillStyle='rgba(255,255,230,.25)';c.beginPath();c.moveTo(-L/2,-W/2+.2);c.lineTo(-L/2-1.6,-W/2-.3);c.lineTo(-L/2-1.6,W/2+.3);c.lineTo(-L/2,W/2-.2);c.fill();}
      if(o.brake){c.fillStyle='rgba(255,40,40,.9)';c.fillRect(-L/2-.04,-W/2+.15,.12,.35);c.fillRect(-L/2-.04,W/2-.5,.12,.35);}}
    c.restore();}
  /* ночь: тёмная вуаль с «дырами» — фары машины (вперёд и назад), фонари, подсвеченное место. Отдельный холст, destination-out — без фильтров */
  function dark(c,b,t){if(!night)night=document.createElement('canvas');var w=C.w,h=C.h,d=C.dpr||1;if(night.width!==Math.round(w*d)||night.height!==Math.round(h*d)){night.width=Math.round(w*d);night.height=Math.round(h*d);}
    var n=night.getContext('2d');n.setTransform(d,0,0,d,0,0);n.globalCompositeOperation='source-over';n.clearRect(0,0,w,h);n.fillStyle=S.thm.pump?'rgba(18,10,40,.78)':'rgba(8,16,40,.74)';n.fillRect(0,0,w,h);
    n.globalCompositeOperation='destination-out';n.save();n.translate(V.ox,V.oy);n.scale(V.s,V.s);
    function hole(x,y,r,a){var g=n.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(1,'rgba(0,0,0,0)');n.fillStyle=g;n.beginPath();n.arc(x,y,r,0,7);n.fill();}
    var cm=S.cm,cu=Math.cos(p.th),su=Math.sin(p.th),fx=b.cx+cu*cm.L/2,fy=b.cy+su*cm.L/2,rx=b.cx-cu*cm.L/2,ry=b.cy-su*cm.L/2;
    hole(b.cx,b.cy,cm.L*.8,1);hole(fx+cu*2.4,fy+su*2.4,3.2,1);hole(rx-cu*1.4,ry-su*1.4,2.2,st.v<-.05||st.ped<0?1:.55);
    var sl=S.slot;hole(sl.cx,sl.cy,Math.max(sl.hl,sl.hw)*1.2,.8);
    for(var x=2;x<S.WW;x+=7)hole(x,S.road[1]+.1,3.4,.6);
    n.restore();c.drawImage(night,0,0,w,h);}
  if(host.onResize)host.onResize(fit);
  K.loop(host,draw);
  load(0);st.loaded=0;sayNow(cfg.first||T('Ну-ка, покажи, как ты задом паркуешься!','Come on, show me how you reverse-park!'),'happy');
  var it=cfg.intro||{};
  K.intro(host,{who:cfg.who||'mityai',text:it.text||T('Я сорок лет за баранкой! Покажу, как ставить машину задом. Крути руль, жми педали — а я подскажу: «Левее! Ещё! Стоп!»','Forty years behind the wheel! I’ll show you how to reverse-park. Turn the wheel, press the pedals — and I’ll call out: “Left! More! Stop!”'),html:it.html,
    hint:K.pc(host)?T('←/→ (A/D) — руль · Пробел — руль прямо · ↑/W — вперёд · ↓/S — назад · H — Митяй поможет · Enter — дальше','←/→ (A/D) — steer · Space — straighten · ↑/W — forward · ↓/S — reverse · H — Mityai helps · Enter — next'):T('Крути руль пальцем · держи «Вперёд»/«Назад»','Turn the wheel with a finger · hold “Forward”/“Reverse”'),btn:it.btn||T('Поехали','Let’s go')},function(){st.t0=st.t;startTask();});
  st.api={ff:function(n){for(var i=0;i<n&&!st.done;i++){st.t+=1/60;step(1/60);}return st.done;},hit:function(q){return hitOf(S,q||p);},go:function(i){st.i=i;startTask();},auto:function(){autoRun(false);},help:function(){autoRun(true);},next:next,scene:function(){return S;},pose:function(){return p;},inside:function(){return inside(S,p);}};
  return st;}

/* бот (для VYMG.bot): k — умение; касаний ~ (1−k)·2,4; «криво» с вероятностью 0,45(1−k); сдаётся (0) с вероятностью 0,3(1−k)²; d — трудность площадки 0..1 */
function simLot(R,k,d){d=d||0;if(R()<.3*(1-k)*(1-k)*(1+d))return {pts:0,stars:0};var tc=0,l=(1-k)*2.4*(1+d*.8),e=Math.exp(-l),q=R(),pp=e;while(q>pp&&tc<5){tc++;e*=l/tc;pp+=e;}
  var sl=R()<.45*(1-k)*(1+d*.5),fast=R()<k*(1-d*.35);return {pts:Math.max(1,3-Math.min(2,tc)-(sl?1:0)),stars:1+(!tc&&!sl?1:0)+(fast?1:0)};}

window.VYPE={dims:dims,carId:carId,DIM:DIM,KINDS:KINDS,THEMES:TH,build:build,solve:solve,fresh:fresh,play:play,simLot:simLot,hash:hash,rng:rng,inside:inside,verdict:verdict,simulate:simulate,
  T:T,cache:CACHE};
})();
