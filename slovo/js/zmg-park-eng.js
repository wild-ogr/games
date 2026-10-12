'use strict';
/* zb2-LOV · движок «Тележки с макулатурой» (js/zmg-park-eng.js → window.ZLPE). ПОРТ движка «Парковки» Выезда (vymg-parkeng.js, VYPE) на оболочку Зины:
   геометрия, площадки, решатель с автопилотом, «велосипедная» физика и вердикт — как у VYPE (одним кодом и для игры, и для решателя);
   рисунок — свой: тележка с пачками, Зина у ручки, окошко «ПРИЁМ МАКУЛАТУРЫ» с Михалычем, вместо машин — очередь, ящики, бочки, лавки, чужие тележки.
   Площадка = spec {kind, th, tight 0..1, seed, calm}:
     kind: 'dock' — задом к окошку приёма между перилами · 'bay' — задом между ящиками и лавками · 'lane' — задом по узкому проходу в ворота;
     th: yard двор, school школа, market рынок, station вокзал.
   ZLPE.solve(spec) → {SC, ok, t, par (норматив ★ = t×1,35+6)}; ZLPE.fresh(spec) — новая копия площадки; ZLPE.play(host, o, cfg) — игра (cfg {lots, onLot, done(rs), intro}).
   r по сдаче = {parked, touch, sloppy, nose, helped, late, time, par, stars, kg}. ★ поставила · ★ без касаний и ровно · ★ не дольше норматива; «Михалыч поможет» (ролик) — 0 ★.
   Управление (макет MG.html разд. 6): руль-баранка (крутить пальцем, двойное нажатие — прямо), «Вперёд/Назад» — передача, «Газ» держать, «Тормоз» держать.
     ПК: ←/→ руль, ↑ газ вперёд, ↓ газ назад, Пробел — тормоз, Н (Y) — руль прямо, Р (H) — Михалыч поможет, Enter — дальше.
   Тест: window.__zl_park (st), st.api.auto()/help()/ff(n)/scene()/pose(). */
(function(){if(window.ZLPE)return;
var WROT=450,DRATE=2.2,VMAX=1.35,VCALM=.95,ACC=2.4,DEC=3.2,BRK=7;
/* размеры [длина, ширина, база, задний свес], «метры» площадки. Тележка — CART; соседи — предметы */
var CART=[3.0,1.5,2.0,.5];
var DIM={queue:[3.4,1.1],crates:[2.6,1.5],bench:[3.2,1.0],barrels:[2.2,1.6],cart:[3.0,1.5],kiosk:[3.6,1.8],bikes:[2.6,1.2]};
function dims(dm){var d=dm&&dm.length===4?dm:CART,L=d[0],W=d[1],LW=d[2],ROV=d[3],DM=33*Math.PI/180;return {L:L,W:W,LW:LW,ROV:ROV,CC:L/2-ROV,DMAX:DM,RMIN:LW/Math.tan(DM)};}
/* ---------- геометрия (как VYPE) ---------- */
function obb(cx,cy,w,h,a){return {cx:cx,cy:cy,hw:w/2,hh:h/2,a:a||0,r:Math.hypot(w,h)/2};}
function corners(b){var c=Math.cos(b.a),s=Math.sin(b.a),o=[];[[1,1],[1,-1],[-1,-1],[-1,1]].forEach(function(k){var x=k[0]*b.hw,y=k[1]*b.hh;o.push({x:b.cx+x*c-y*s,y:b.cy+x*s+y*c});});return o;}
function sat(A,B){var rr=(A.r||Math.hypot(A.hw,A.hh))+(B.r||Math.hypot(B.hw,B.hh));if(Math.abs(A.cx-B.cx)>rr||Math.abs(A.cy-B.cy)>rr)return false;
  var pa=corners(A),pb=corners(B),ax=[A.a,A.a+Math.PI/2,B.a,B.a+Math.PI/2];
  for(var i=0;i<4;i++){var nx=Math.cos(ax[i]),ny=Math.sin(ax[i]),a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
    for(var j=0;j<4;j++){var d=pa[j].x*nx+pa[j].y*ny;if(d<a0)a0=d;if(d>a1)a1=d;d=pb[j].x*nx+pb[j].y*ny;if(d<b0)b0=d;if(d>b1)b1=d;}
    if(a1<b0||b1<a0)return false;}return true;}
function norm(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}
function carBox(p,cm,m){m=m||0;return obb(p.x+Math.cos(p.th)*cm.CC,p.y+Math.sin(p.th)*cm.CC,cm.L+2*m,cm.W+2*m,p.th);}
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function slotUV(sl,x,y){var c=Math.cos(sl.th),s=Math.sin(sl.th),dx=x-sl.cx,dy=y-sl.cy;return {u:dx*c+dy*s,v:-dx*s+dy*c};}
function inside(SC,p){var cs=corners(carBox(p,SC.cm)),sl=SC.slot,e=.06;for(var i=0;i<4;i++){var q=slotUV(sl,cs[i].x,cs[i].y);if(Math.abs(q.u)>sl.hl+e||Math.abs(q.v)>sl.hw+e)return false;}return true;}
function nearIn(SC,p,m){var cs=corners(carBox(p,SC.cm)),sl=SC.slot,n=0;for(var i=0;i<4;i++){var q=slotUV(sl,cs[i].x,cs[i].y);if(Math.abs(q.u)<=sl.hl+m&&Math.abs(q.v)<=sl.hw+m)n++;}return n;}
/* ---------- места ---------- */
var TH={
  yard:{n:'Двор',grass:'#8cc071',asph:'#8d949b',side:'#a5abb2',walk:'#dee2e6',line:'#f8f9fa',back:'house',wall:'#e9d3b0',pool:['queue','crates','bench','barrels','cart','bikes']},
  school:{n:'Школа',grass:'#86b96c',asph:'#868e96',side:'#a39b8f',walk:'#e5dccb',line:'#ffffff',back:'school',wall:'#f1c8a8',pool:['bench','cart','crates','bikes','queue']},
  market:{n:'Рынок',grass:'#8cc071',asph:'#80878e',side:'#a39b8f',walk:'#e5dccb',line:'#ffe066',back:'kiosks',wall:'#d8c3a0',pool:['crates','barrels','cart','queue','kiosk']},
  station:{n:'Вокзал',grass:'#86b96c',asph:'#7a8188',side:'#a5abb2',walk:'#e0d8c8',line:'#ffffff',back:'station',wall:'#e9c46a',pool:['queue','cart','bench','crates','barrels']}};
var KINDS=['dock','bay','lane'];
function theme(spec){var t=TH[spec.th]||TH.yard,o={},k;for(k in t)o[k]=t[k];return o;}
/* ---------- площадки (VYPE build: bay / dock (как gar+dock) / lane) ---------- */
function build(spec,lo){var R=rng(spec.seed>>>0||1),cm=dims(spec.dim),th=theme(spec),t=Math.max(0,Math.min(1,+spec.tight||0)),calm=spec.calm?1:0;
  var kind=KINDS.indexOf(spec.kind)<0?'dock':spec.kind;
  var SC={kind:kind,spec:spec,cm:cm,thm:th,obs:[],cars:[],lo:lo},g=.55-.24*t+.1*lo+calm*.12;
  function add(o,tp){o.t=tp;SC.obs.push(o);return o;}
  function pool(maxL){var a=th.pool.filter(function(id){return DIM[id][0]<=maxL;});return a.length?a:['crates'];}
  function pcar(cx,cy,a,maxL){var a2=pool(maxL),id=a2[Math.floor(R()*a2.length)%a2.length],d=DIM[id];SC.cars.push({id:id,cx:cx,cy:cy,a:a,L:d[0],W:d[1],v:Math.floor(R()*4)});add(obb(cx,cy,d[0]+.05,d[1]+.05,a),'car');}
  function filler(cx,cy){var r=R();add(obb(cx,cy,1.0,.9,0),r<.5?'bin':'bush');}
  var RW=cm.RMIN*1.25+cm.W*.5+.7-.7*t+.4*lo+calm*.3;
  if(kind==='bay'){var ang=Math.PI/2,bw=cm.W+2*g,dep=cm.L+.45+.08*lo,y0=1.6,tx=Math.max(7.2,3.4+cm.L),sx=bw,yb=y0+dep,cy=y0+dep/2;
    SC.slot={cx:tx,cy:cy,th:ang,hl:dep/2,hw:bw/2};SC.road=[yb,yb+RW];SC.WW=tx+cm.RMIN+cm.L+3;SC.WH=yb+RW+.6;
    add(obb(SC.WW/2,y0-.85,SC.WW+8,1.7),'curb');add(obb(SC.WW/2,SC.road[1]+.8,SC.WW+8,1.6),'curb');
    var nL=-Math.ceil((tx+3)/sx),nR=Math.ceil((SC.WW-tx+3)/sx);SC.bays=[];
    for(var i=nL;i<=nR;i++){var c=tx+i*sx;SC.bays.push(c);if(!i)continue;var nb=Math.abs(i)===1;
      if(nb||R()<.55)pcar(c+(R()-.5)*.25*g,cy,ang+(R()-.5)*.04,dep+.3);else if(R()<.5)filler(c,y0+.75);}
    SC.start={x:1.0+cm.ROV,y:yb+RW*.58,th:0};SC.swing=true;
    SC.task='Сдача в «кармане»: <b>задом</b> между ящиками — ручкой к дороге.';}
  else if(kind==='dock'){var iw=cm.W+2*g+.2,wt=.3,gw=iw+wt,dep2=cm.L+.9+.08*lo,tx2=Math.max(7.2,3.4+cm.L),N=7,ti=3;
    SC.WW=tx2+cm.RMIN+cm.L+3;SC.road=[dep2,dep2+RW+.3];SC.WH=SC.road[1]+.6;SC.gar=[];
    add(obb(SC.WW/2,-.3,SC.WW+8,.6),'wall');add(obb(SC.WW/2,SC.road[1]+.8,SC.WW+8,1.6),'curb');
    for(var k2=-ti;k2<N-ti;k2++){var a=tx2+k2*gw-gw/2,b=a+gw;SC.gar.push([a,b,k2===0]);add(obb(a,dep2/2-.1,wt,dep2+.2),'rail');
      if(k2!==0){if(R()<.6)pcar((a+b)/2,(dep2-.3)/2+.1,Math.PI/2,dep2-.4);else add(obb((a+b)/2,dep2*.35,Math.min(iw-.4,1.8),1.4),'crate');}}
    var lb=SC.gar[SC.gar.length-1];add(obb(lb[1],dep2/2-.1,wt,dep2+.2),'rail');
    SC.slot={cx:tx2,cy:dep2/2,th:Math.PI/2,hl:dep2/2,hw:iw/2-.02};SC.ramp=[tx2-iw/2,tx2+iw/2];
    SC.start={x:1.0+cm.ROV,y:SC.road[0]+RW*.6,th:0};SC.swing=true;
    SC.task='К окошку приёма — <b>задом</b>, ровно между перилами!';}
  else{var bw3=cm.W+2*g,dep3=cm.L+.5,y03=1.6,yb3=y03+dep3,tx3=Math.max(6.5,cm.L+2.5),lw=cm.W+2.3-.8*t+.35*lo+calm*.3;
    var off=(R()<.5?-1:1)*Math.max(0,Math.min(lw/2-cm.W/2-.3,.5+.8*t-.12*lo)),ang3=Math.PI/2+(R()-.5)*.24*(1-lo/8);
    SC.slot={cx:tx3,cy:y03+dep3/2,th:Math.PI/2,hl:dep3/2,hw:bw3/2};SC.WW=tx3*2;
    var sy3=yb3+2.6+cm.ROV+cm.L*.3;SC.start={x:tx3+off,y:sy3,th:ang3};SC.WH=sy3+cm.L+1.8;SC.road=[yb3,SC.WH];
    add(obb(SC.WW/2,y03-.85,SC.WW+8,1.7),'curb');
    [-1,1].forEach(function(sd){add(obb(tx3+sd*(bw3/2+.15),y03+dep3/2,.3,dep3),'wall');add(obb(tx3+sd*(bw3/2+.35),yb3+.2,.55,.55),'post');
      add(obb(tx3+sd*(bw3/2+2.8),y03+dep3/2,4.4,dep3+.2),'wall2');
      for(var yy=yb3+1.4;yy<SC.WH+2;yy+=4.9){if(R()<.8)pcar(tx3+sd*(lw/2+.95),yy+2.1,Math.PI/2+(R()<.5?0:Math.PI),4.6);else filler(tx3+sd*(lw/2+.7),yy+1.6);}});
    SC.lane=lw;SC.task='Задом через ворота во двор приёмки — <b>по прямой</b>, не задень столбы!';}
  SC.WW=Math.max(SC.WW,14);SC.WH=Math.max(SC.WH,9);
  SC.tgt={x:SC.slot.cx-Math.cos(SC.slot.th)*cm.CC,y:SC.slot.cy-Math.sin(SC.slot.th)*cm.CC};
  for(var q=0;q<SC.obs.length;q++)SC.obs[q].r=Math.hypot(SC.obs[q].hw,SC.obs[q].hh);
  return SC;}
/* ---------- автопилот (VYPE) ---------- */
function planSwing(SC,X){var sl=SC.slot;return [['steer',0],['go',1,function(p){return p.x>=X;}],['steer',-SC.cm.DMAX],['go',-1,function(p){return norm(p.th)>=sl.th-.04;}],['pp']];}
function planLane(){return [['steer',0],['pp']];}
function phys(SC){return {vmax:SC.spec.calm?VCALM:VMAX,acc:ACC,dec:DEC};}
function hitOf(SC,q,m){var b=carBox(q,SC.cm,m);for(var i=0;i<SC.obs.length;i++)if(sat(b,SC.obs[i]))return SC.obs[i];if(b.cx<-4||b.cx>SC.WW+4||b.cy<-4||b.cy>SC.WH+4)return {t:'edge'};return null;}
function ahead(W){var p=W.p,q={x:p.x,y:p.y,th:p.th},d=W.v*Math.abs(W.v)/(2*W.ph.dec),n=8,h=d/n;for(var i=0;i<n;i++){q.x+=Math.cos(q.th)*h;q.y+=Math.sin(q.th)*h;q.th+=h/W.S.cm.LW*Math.tan(W.d);}return q;}
function apStep(W,dt){var A=W.auto,SC=W.S,cm=SC.cm,p=W.p,sl=SC.slot;if(!A)return;if(!A.cur){A.cur=A.q.shift();A.t=0;if(!A.cur){W.auto=null;W.ped=0;return;}}var c=A.cur;A.t+=dt;
  if(c[0]==='steer'){W.ped=0;if(Math.abs(W.v)>.02)return;W.wheel=c[1]/cm.DMAX*WROT;if(Math.abs(W.d-c[1])<.01)A.cur=null;return;}
  if(c[0]==='go'){if(c[2](ahead(W))||A.t>30){W.ped=0;if(Math.abs(W.v)<.02)A.cur=null;return;}W.ped=c[1];return;}
  if(c[0]==='pp'){var cu=Math.cos(sl.th),su=Math.sin(sl.th),s=(p.x-SC.tgt.x)*cu+(p.y-SC.tgt.y)*su,Ld=Math.max(2.2,cm.LW*.95),ax=SC.tgt.x+cu*(s-Ld),ay=SC.tgt.y+su*(s-Ld),
      thb=p.th+Math.PI,al=norm(Math.atan2(ay-p.y,ax-p.x)-thb),db=Math.atan2(2*cm.LW*Math.sin(al),Ld),dd=Math.max(-cm.DMAX,Math.min(cm.DMAX,-db));
    W.wheel=dd/cm.DMAX*WROT;if(s<=.03||A.t>30){W.ped=0;if(Math.abs(W.v)<.02)A.cur=null;return;}W.ped=-1;return;}}
/* шаг тележки: руль догоняет баранку, скорость к цели педали; тормоз — сильнее; столкновение → onHit(obj) */
function carStep(W,dt,onHit,margin){var cm=W.S.cm,ph=W.ph;var dw=W.wheel/WROT*cm.DMAX,dd=dw-W.d,mx=DRATE*dt;W.d+=Math.max(-mx,Math.min(mx,dd));
  var tv=W.stop?0:W.ped*(W.auto?Math.min(ph.vmax,1.1)*(W.auto.cur&&W.auto.cur[0]!=='go'?.6:1):ph.vmax);
  if(tv&&!W.brk)W.v+=Math.max(-ph.acc*dt,Math.min(ph.acc*dt,tv-W.v));else{var dc=(W.brk?BRK:ph.dec)*dt;W.v=Math.abs(W.v)<=dc?0:W.v-(W.v>0?dc:-dc);}
  var p=W.p,n=3,h=dt/n;for(var i=0;i<n;i++){var q={x:p.x+W.v*Math.cos(p.th)*h,y:p.y+W.v*Math.sin(p.th)*h,th:p.th+W.v/cm.LW*Math.tan(W.d)*h};
    var hit=hitOf(W.S,q,margin||0);if(hit){if(onHit(hit,q))return hit;}p.x=q.x;p.y=q.y;p.th=norm(q.th);}return null;}
function verdict(SC,p){var sl=SC.slot,inn=inside(SC,p),err=Math.abs(norm(p.th-sl.th)),errR=Math.abs(norm(p.th-sl.th-Math.PI)),nose=errR<err,e=Math.min(err,errR)*180/Math.PI;
  var c={x:p.x+Math.cos(p.th)*SC.cm.CC,y:p.y+Math.sin(p.th)*SC.cm.CC},axis=Math.abs(slotUV(sl,c.x,c.y).v);return {inn:inn,nose:nose,e:e,axis:axis,sloppy:e>5||axis>.35};}
function simulate(SC,plan,margin){var W={S:SC,ph:phys(SC),p:{x:SC.start.x,y:SC.start.y,th:SC.start.th},v:0,d:0,wheel:0,ped:0,auto:{q:plan.slice(),cur:null}},dt=1/30,t=0,fail=false;
  while(t<90){apStep(W,dt);if(carStep(W,dt,function(){fail=true;return true;},margin))break;t+=dt;if(!W.auto&&Math.abs(W.v)<.02)break;}
  if(fail||t>=90)return {ok:false,t:t};var v=verdict(SC,W.p);return {ok:v.inn&&!v.nose&&!v.sloppy,t:t+.6,v:v};}
function solveS(SC){var M=.08;if(SC.kind==='lane'){var pl2=planLane(),r2=simulate(SC,pl2,M);return r2.ok?{plan:pl2,t:r2.t}:null;}
  var sl=SC.slot,x0=sl.cx-.5,x1=sl.cx+SC.cm.RMIN+SC.cm.L*.8,run=[],best=[],X;
  for(X=x0;X<=x1;X+=.25){var r3=simulate(SC,planSwing(SC,X),M);if(r3.ok){run.push([X,r3.t]);if(run.length>best.length)best=run.slice();}else run=[];}
  if(!best.length)return null;var mid=best[Math.floor((best.length-1)/2)];SC.goX=mid[0];return {plan:planSwing(SC,mid[0]),t:mid[1],X:mid[0],n:best.length};}
var CACHE={};
function key(spec){return [spec.kind,String(spec.dim||''),spec.th,(+spec.tight||0).toFixed(2),spec.seed>>>0,spec.calm?1:0].join('|');}
function solve(spec){var k=key(spec);if(CACHE[k])return CACHE[k];var out=null;
  for(var lo=0;lo<=8;lo++){var SC=build(spec,lo),r=solveS(SC);if(r){SC.plan=r.plan;out={S:SC,ok:true,t:r.t,lo:lo,par:Math.round(r.t*1.35+6)};break;}}
  if(!out){var S2=build(spec,8);S2.plan=S2.kind==='lane'?planLane():planSwing(S2,S2.slot.cx+S2.cm.RMIN);out={S:S2,ok:false,t:60,lo:9,par:90};}
  CACHE[k]=out;return out;}
function fresh(spec){var r=solve(spec),SC=build(spec,r.lo>8?8:r.lo);if(SC.kind==='lane')SC.plan=planLane();else{SC.goX=r.S.goX;SC.plan=planSwing(SC,r.S.goX);}return {S:SC,t:r.t,par:r.par,ok:r.ok};}
/* бот баланса (как VYPE.simLot): k — умение, d — трудность сдачи 0..1 → {stars, touch, sloppy, fast, parked} */
function simLot(R,k,d){d=d||0;if(R()<.3*(1-k)*(1-k)*(1+d))return {parked:false,stars:0,touch:0};var tc=0,l=(1-k)*2.4*(1+d*.8),e=Math.exp(-l),q=R(),pp=e;while(q>pp&&tc<5){tc++;e*=l/tc;pp+=e;}
  var sl=R()<.45*(1-k)*(1+d*.5),fast=R()<k*(1-d*.35);return {parked:true,touch:tc,sloppy:sl,fast:fast,stars:1+(!tc&&!sl?1:0)+(fast?1:0)};}
window.ZLPE={dims:dims,CART:CART,DIM:DIM,KINDS:KINDS,THEMES:TH,build:build,solve:solve,fresh:fresh,simLot:simLot,rng:rng,inside:inside,verdict:verdict,simulate:simulate,
  carBox:carBox,corners:corners,hitOf:hitOf,apStep:apStep,carStep:carStep,phys:phys,nearIn:nearIn,norm:norm,WROT:WROT,cache:CACHE};
})();
