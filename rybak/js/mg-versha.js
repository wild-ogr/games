/* RB:MGC (08.10.2026) — мини-игра №4 «Верша на раков».
   Поставил сегодня — проверил завтра (через 6 ч). Ускорить за ролик НЕЛЬЗЯ (решение владельца 08.10, п.7); «Вторая верша» за ролик — можно, раз в день.
   Проверка: держи палец — тянешь вершу (без таймера, отпустил — просто остановился), потом раки лезут из горловины — тапни беглеца, он вернётся в вершу.
   Сохранение: S.mg.versha = {v:[слот0,слот1], d0, d1, n, tot, rec, kinds:{}}; слот = {t: поставлена (мс), r: готова (мс), sp: точка 0..2, d: день}.
   Награда: host.done({score: раков в садке, tier 0..3, rec, extra:{rk, kinds, set}}) — раки идут в общий садок S.mg.rk (уха «по-царски», заказ бабы Зины, рынок). */
(function(){
'use strict';
var ID='versha',READY_MS=6*3600e3,LATE_MS=36*3600e3;
var A=window.MGCA;
function L2(ru,en){return typeof L==='function'?L(ru,en):ru;}
function kc(k){return window.MG&&MG.kc?MG.kc(k):'';} /* RB:MGPC значок клавиши (виден только на ПК) */
function now(){return typeof nowMs==='function'?nowMs():Date.now();}
function today(){return typeof dayKey==='function'?dayKey(0):(function(){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();})();}
function snd(k){try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}}
function vib(ms){try{if(typeof buzz==='function')buzz(ms);}catch(e){}}
function st(){if(typeof S==='undefined')return {v:[null,null]};if(!S.mg||typeof S.mg!=='object')S.mg={};var m=S.mg[ID];
  if(!m||typeof m!=='object')m=S.mg[ID]={};if(!Array.isArray(m.v))m.v=[null,null];while(m.v.length<2)m.v.push(null);
  for(var i=0;i<2;i++){var s=m.v[i];if(s&&!(typeof s==='object'&&s.r>0&&s.sp>=0&&s.sp<3))m.v[i]=null;}
  if(!m.kinds||typeof m.kinds!=='object')m.kinds={};return m;}
function hhmm(ms){var d=new Date(ms);return d.getHours()+':'+('0'+d.getMinutes()).slice(-2);}
function left(ms){var m=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(m/60);m=m%60;return (h?h+' '+L2('ч','h')+' ':'')+(h&&!m?'':m+' '+L2('мин','min'));}
function whenTxt(r){var d=new Date(r),t=new Date(now()),tm=hhmm(r),same=d.toDateString()===t.toDateString();t.setDate(t.getDate()+1);return (same?L2('сегодня','today'):d.toDateString()===t.toDateString()?L2('завтра','tomorrow'):'')+' '+L2('после','after')+' '+tm;}

/* точки: 0 коряги, 1 яма, 2 камыш. Точка дня — по зерну (одна у всех) */
var SPOTS=[{n:'Коряги',en:'Snags',k:'snag',say:'Рак нынче в корягах прячется — нутром чую.',sayE:'Crayfish hide in the snags today, I can feel it.'},{n:'Яма',en:'Deep pit',k:'pit',say:'В яме сегодня рак — на глубине прохладно.',sayE:'Today they sit in the deep pit — it is cool there.'},{n:'Камыш',en:'Reeds',k:'reeds',say:'Сегодня рак у камыша пасётся, точно говорю.',sayE:'Today they graze by the reeds, trust me.'}];
function daySpot(seed){return Math.floor(A.rng((seed||1)*7+3)()*3);}
function spotPos(G0,i){var W=G0.W,land=G0.land,d=land?[.36,.6,.3][i]:[.4,.56,.34][i],x=W*(land?[.2,.47,.78][i]:[.16,.42,.62][i]);return {x:x,y:G0.yAt(d),s:G0.sAt(d),d:d};}
/* сколько раков: 3–8, на точке дня ×1.5 (до 12); вид — широкопалый 60 %, длиннопалый 35 %, голубой 4 %, золотистый 1 % */
function catchOf(seed,slot,sp,ds){var R=A.rng((ds||seed)*13+slot*101+sp*7+5),n=3+Math.floor(R()*6);if(sp===daySpot(seed))n=Math.round(n*1.5);n=Math.max(3,Math.min(12,n));
  var ks=[];for(var i=0;i<n;i++){var r=R();ks.push(r<.01?'gold':r<.05?'blue':r<.4?'dlin':'shir');}return ks;}

function canSet(m,slot,td){return !m.v[slot]&&(slot===0?m.d0!==td:m.d1!==td);}
/* для плитки «Двора»: {txt, dot} */
function badge(){var m=st(),t=now(),td=today(),rd=null,soon=null;
  for(var i=0;i<2;i++){var s=m.v[i];if(!s)continue;if(t>=s.r)rd=s;else if(!soon||s.r<soon.r)soon=s;}
  if(rd)return {txt:L2('Верша полна!','Trap is full!'),dot:true};
  if(canSet(m,0,td))return {txt:L2('Поставь вершу','Set the trap'),dot:true};
  if(soon)return {txt:L2('Стоит, проверить ','Set, check ')+whenTxt(soon.r).trim(),dot:false};
  return {txt:L2('Новая верша — завтра','New trap tomorrow'),dot:false};}
/* текст напоминания VK (только если игрок разрешил, SOC v2.4): когда и что */
function ntf(){var m=st(),r=0;for(var i=0;i<2;i++)if(m.v[i]&&(!r||m.v[i].r<r))r=m.v[i].r;if(!r)return null;
  return {at:r,text:L2('Петрович: верша полна, раки разбегаются! Беги на мостки 🦞','Petrovich: the trap is full, crayfish are escaping!')};}

/* ---------- сама игра ---------- */
function needArt(cb){if(window.MGCA){A=window.MGCA;cb();return true;}var s=document.createElement('script');s.src='js/mg-mgc-art.js';s.onload=function(){A=window.MGCA;cb();};document.head.appendChild(s);return false;}
function run(host,o){
  if(!window.MGCA){needArt(function(){run(host,o);});return;}A=window.MGCA;
  o=o||{};A.css();var m=st(),td=today(),seed=o.seed||td,bot=o.bot||'',TR=!!(o.train||bot); /* RB:MGPC было TR||bot (TR ещё не задан) — «Потренироваться» трогала настоящую вершу */
  var root=document.createElement('div');root.className='mgc mgc-versha';host.el.appendChild(root);
  var cv=document.createElement('canvas');root.appendChild(cv);var g=cv.getContext('2d');
  root.insertAdjacentHTML('beforeend','<div class="mgc-top"><div class="mgc-ttl"></div><div class="mgc-sub"></div></div><div class="mgc-cnt" style="display:none"><span>0</span></div><div class="mgc-say"></div><div class="mgc-hint" style="opacity:0"></div><div class="mgc-bot"></div><div class="mgc-fin"></div>');
  var $=function(s){return root.querySelector(s);},ttl=$('.mgc-ttl'),sub=$('.mgc-sub'),cnt=$('.mgc-cnt'),sayEl=$('.mgc-say'),botEl=$('.mgc-bot'),fin=$('.mgc-fin'),hint=$('.mgc-hint');
  cnt.insertBefore(A.icon('rak',34),cnt.firstChild);A.fontOf(root);
  var W=0,H=0,G0=null,P=null,BG=null,SH=null,FL=null,tod=o.tod||new URLSearchParams(location.search).get('tod')||A.todNow(),night=tod==='night',wx=tod==='night'?'sun':(A.rng(seed)()<.3?'cloud':'sun');
  var T=0,last=0,raf=0,dead=false,ph='intro',phT=0,parts=[],rips=[],sayT=0,calm=!!o.calm;
  /* состояние сцены */
  var V={sel:-1,slot:0,k:0,hold:false,fly:null,land:null,rk:[],ks:[],kept:0,ret:0,esc:0,crawl:0,spawnT:0,next:0,res:null,tot:{n:0,kept:0,ret:0,cr:0,kinds:{}},late:false,petr:{pose:'stand',k:1},setDone:false,checked:0};
  function resize(){var r=root.getBoundingClientRect();W=Math.max(200,r.width);H=Math.max(200,r.height);var d=A.dpr();cv.width=Math.round(W*d);cv.height=Math.round(H*d);g.setTransform(d,0,0,d,0,0);
    G0=A.geo(W,H);P=A.pal('birch',tod,wx);BG=document.createElement('canvas');BG.width=cv.width;BG.height=cv.height;var bg=BG.getContext('2d');bg.scale(d,d);A.scene(bg,W,H,G0,P,{seed:seed%1000,pier:true});
    SH=A.shim(G0,seed%97);FL=night?A.flies(A.low()?8:16,W,G0.hz+G0.u*4,G0.shY,seed%31):null;layoutSay();}
  /* где кто стоит */
  function petrPos(){var land=G0.land,pb=A.pierBox(G0);return land?{x:W*.66,y:H*.86,h:H*.42}:{x:W*.8,y:pb.yT+(H-pb.yT)*.3,h:H*.25};}
  function landPos(){var land=G0.land;return {x:W*(land?.45:.56),y:H*(land?.86:.87),L:Math.min(W*(land?.24:.42),H*.3)};}
  function catPos(){var pb=A.pierBox(G0),land=G0.land,y=pb.yT+(pb.yB-pb.yT)*.1;return {x:A.pierEdge(pb,y,-1)+G0.u*(land?5:7),y:y,s:G0.u*(land?8:9.5)};}
  function lampPos(){var pb=A.pierBox(G0);return {x:pb.fl+(pb.fr-pb.fl)*.56,y:pb.yT+G0.u*1.2,s:G0.u*(G0.land?3.2:3.6)};}

  /* ---------- текст и кнопки ---------- */
  function say(txt,ms){sayEl.innerHTML=(window.LOOK&&LOOK.av?'<div class="av">'+LOOK.av('petr')+'</div>':'')+'<div><b>'+L2('Петрович','Petrovich')+':</b> '+txt+'</div>';sayEl.classList.add('on');sayT=(ms||4200)/1000;}
  function layoutSay(){}
  function btn(html,cls,fn,id,ent){var b=document.createElement('button');b.className='btn '+(cls||'');b.innerHTML=html+(ent?kc('Enter'):'');if(ent)b.setAttribute('data-enter','');if(id)b.id=id;b.onclick=function(e){e.stopPropagation();snd('tap');fn(b);};botEl.appendChild(b);if(window.LOOK&&LOOK.refresh)try{LOOK.refresh(b);}catch(er){}return b;}
  function ic(k){return window.LOOK?LOOK.I(k):'';}
  function bar(){botEl.innerHTML='';}
  function head(a,b){ttl.textContent=a;sub.textContent=b||'';}
  function hintOn(txt,y){hint.textContent=txt;hint.style.top=y+'px';hint.style.opacity=txt?1:0;}

  /* ---------- фазы ---------- */
  function go(p){ph=p;phT=0;}
  function start(){
    if(o.train&&!bot&&!V.trGo){showWait();return;}
    if(TR){V.slot=0;V.ks=catchOf(seed+Math.floor(Math.random()*999),0,Math.floor(Math.random()*3),0);V.sel=Math.floor(Math.random()*3);startPull();return;}
    var t=now();
    for(var i=0;i<2;i++){var s=m.v[i];if(s&&t>=s.r){V.slot=i;V.sel=s.sp;V.late=t>s.r+LATE_MS;V.ks=catchOf(seed,i,s.sp,s.d);if(V.late)V.ks=V.ks.slice(0,Math.ceil(V.ks.length/2));startPull();return;}}
    if(canSet(m,0,td)){startSet(0);return;}
    showWait();}
  /* поставить */
  function startSet(slot){V.slot=slot;V.sel=-1;go('set');V.petr={pose:'hold',k:1};var ds=daySpot(seed);
    head(L2('Верша на раков','Crayfish trap'),slot?L2('Вторая верша: выбери место','Second trap: pick a spot'):L2('Выбери, где ставить','Pick a spot'));
    say(L2(SPOTS[ds].say,SPOTS[ds].sayE)+' '+(host.pc?L2('Щёлкни по воде или нажми 1, 2, 3.','Click the water or press 1, 2, 3.'):L2('Тапни по воде.','Tap the water.')),4800);bar();
    host.kbd(host.L('Место — '+kc('1')+kc('2')+kc('3')+' или щелчок по воде','Spot — '+kc('1')+kc('2')+kc('3')+' or click the water'),7);
    if(bot)setTimeout(function(){if(ph==='set')pickSpot(bot==='bad'?(ds+1)%3:ds);},1400);}
  function pickSpot(i){if(ph!=='set')return;var other=m.v[1-V.slot];if(!TR&&other&&other.sp===i){say(L2('Там уже стоит наша верша. Давай в другое место.','Our other trap is there already.'),2600);snd('no');return;}
    V.sel=i;var pp=petrPos(),sp=spotPos(G0,i);V.fly={x0:pp.x,y0:pp.y-pp.h*.45,x1:sp.x,y1:sp.y,t:0};V.petr={pose:'point',k:1};snd('cast');go('throw');bar();sayEl.classList.remove('on');}
  function afterThrow(){var t=now(),r=t+READY_MS;
    if(!TR){m.v[V.slot]={t:t,r:r,sp:V.sel,d:td};if(V.slot===0)m.d0=td;else m.d1=td;A.save();}
    V.setDone=true;V.petr={pose:'stand',k:1};go('setok');
    say(V.sel===daySpot(seed)?L2('Самое место! Завтра — с уловом.','Perfect spot! Tomorrow we feast.'):L2('Всё, стоит. Рак своё дело знает — подождём.','Done. Let the crayfish do their thing.'),4200);
    head(L2('Верша стоит!','The trap is set!'),L2('Проверить ','Check ')+whenTxt(r).trim());
    setTimeout(function(){if(dead)return;finSet(r);},900);}
  function finSet(r){var can2=!TR&&canSet(m,1,td);
    fin.innerHTML='<h2>'+L2('Верша стоит','Trap is set')+'</h2><p>'+L2('Раки соберутся к ','Crayfish will gather by ')+'<b>'+hhmm(r)+'</b>'+(new Date(r).getDate()!==new Date(now()).getDate()?L2(' (завтра)',' (tomorrow)'):'')+'.<br>'+L2('Поторопить нельзя — рак суеты не любит.','No rushing — crayfish dislike fuss.')+'</p>'+
      (can2?'<p style="opacity:.8">'+L2('Можно поставить вторую вершу — за ролик.','You can set a second trap for an ad.')+'</p>':'')+
      '<div class="'+(can2?'row2':'')+'">'+(can2?'<button class="btn" id="vr2">'+ic('ad')+' '+L2('Вторая верша','Second trap')+'</button>':'')+'<button class="btn green" id="vrOk" data-enter>'+L2('Во двор','To the yard')+kc('Enter')+'</button></div>';
    fin.classList.add('on');root.classList.add('fin-on');sayEl.classList.remove('on');ntfAsk();
    fin.querySelector('#vrOk').onclick=function(){snd('tap');finish();};
    var b2=fin.querySelector('#vr2');if(b2)b2.onclick=function(){askSecond(b2);};}
  /* напоминание VK — через существующий модуль SOC (ntf, SOC v2.4): тот же порядок показов (≤3, не чаще раза в день), своё — только слова Петровича про вершу */
  function ntfAsk(){try{if(TR||typeof SOC==='undefined'||!SOC.ntfDue||!SOC.ntfDue()||typeof PLAT==='undefined'||PLAT!=='vk'||window.__demo)return;
      if(typeof askedNow!=='undefined'&&askedNow)return;var o=SOC.offer(S.sessions||0,false);if(!o||o.k!=='ntf')return;try{askedNow=true;}catch(e){}
      var d=document.createElement('div');d.className='quote soc-o ntf';d.style.cssText='margin:10px 0 0;text-align:left';
      d.innerHTML='<span><b>'+L2('Петрович','Petrovich')+':</b> '+L2('Напомнить тебе, когда верша будет полна?','Shall I remind you when the trap is full?')+'</span>';
      var b=document.createElement('button');b.className='btn noenter';b.textContent=o.b||L2('🔔 Напоминать','🔔 Remind me');d.appendChild(b);
      var row=fin.querySelector('#vrOk').parentNode;fin.insertBefore(d,row);
      b.onclick=function(){b.disabled=true;d.style.visibility='hidden';Promise.resolve(o.run()).then(function(r){if(r&&o.ok&&typeof toast==='function')toast(o.ok);});};}catch(e){}}
  function askSecond(b){if(b)b.disabled=true;host.ad('versha2').then(function(ok){if(dead)return;if(b)b.disabled=false;if(!ok){say(L2('Ролик не досмотрен — вторую вершу в другой раз.','Ad not finished — maybe later.'),3000);return;}
      m.d1=td;A.save();fin.classList.remove('on');root.classList.remove('fin-on');startSet(1);});}
  /* ждать */
  function showWait(){go('wait');var t=now(),soon=null;for(var i=0;i<2;i++){var s=m.v[i];if(s&&(!soon||s.r<soon.r))soon=s;}V.petr={pose:'stand',k:1};
    if(soon){head(L2('Верша стоит','Trap is set'),L2('Проверить ','Check ')+whenTxt(soon.r).trim()+' · '+L2('ещё ','in ')+left(soon.r-t));
      say(L2('Рак — он не торопится. И нам не к спеху: завтра будет полна.','Crayfish take their time. So do we.'),6000);}
    else{head(L2('Верша на раков','Crayfish trap'),L2('Новая верша — завтра','New trap tomorrow'));say(L2('На сегодня хватит. Завтра снова поставим.','Enough for today. Tomorrow again.'),5000);}
    bar();var can2=!o.train&&canSet(m,1,td);if(can2)btn(ic('ad')+' '+L2('Вторая верша','Second trap'),'sm',function(b){askSecond(b);});
    if(o.train)btn(ic('again')+' '+L2('Потренироваться','Practice'),'sm',function(){V.trGo=1;sayEl.classList.remove('on');start();},'',true);
    btn(L2('Во двор','To the yard'),'green',function(){quit();},'',!o.train);}
  /* тянуть */
  function startPull(){go('pull');V.k=0;V.hold=false;V.petr={pose:'pull',k:0};var n=V.ks.length;
    head(TR?L2('Тренировка: верша','Practice: trap'):L2('Верша полна!','The trap is full!'),host.pc?L2('Держи пробел или кнопку мыши — тянем','Hold Space or the mouse button to pull'):L2('Держи палец — тянем','Hold to pull')); /* RB:MGPC клавиша — значком на самой кнопке «Держи — тяни!» (плашка снизу закрыла бы её) */
    say(V.late?L2('Два дня не проверяли — половина расползлась. Ну, тянем, что осталось!','Two days unchecked — half got away. Pull what is left!'):L2('Ну-ка, тянем! Тяжёлая — значит, с раками.','Pull! Heavy means crayfish.'),3600);
    bar();var hb=document.createElement('div');hb.className='mgc-hold';hb.innerHTML='<i></i><span>'+ic('hook')+' '+L2('Держи — тяни!','Hold to pull!')+kc(L2('Пробел','Space'))+'</span>';botEl.appendChild(hb);V.hb=hb;hb.style.cursor='pointer';
    var dn=function(e){e.preventDefault();V.hold=true;hb.classList.add('on');try{hb.setPointerCapture(e.pointerId);}catch(er){}},up=function(){V.hold=false;hb.classList.remove('on');};
    hb.addEventListener('pointerdown',dn);hb.addEventListener('pointerup',up);hb.addEventListener('pointercancel',up);hb.addEventListener('pointerleave',up);hb.addEventListener('lostpointercapture',up);
    V.n=n;}
  function landed(){go('land');V.petr={pose:'stand',k:1};snd('splash');vib(30);bar();var lp=landPos();
    for(var i=0;i<16;i++)parts.push({x:lp.x+(Math.random()-.5)*lp.L*.8,y:lp.y,vx:(Math.random()-.5)*G0.u*30,vy:-G0.u*(10+Math.random()*25),t:0,life:.8,k:'drop'});
    var n=V.ks.length,cr=Math.max(2,Math.min(n,Math.ceil(n*.7)));V.cr=cr;V.stay=n-cr;V.kept=V.stay;V.ret=0;V.esc=0;V.spawned=0;V.rk=[];
    say(n>=9?L2('Ого, полнёхонька! Держи беглецов!','Wow, packed! Catch the runaways!'):L2('Есть улов! Смотри, лезут — лови!','We got some! Catch the runaways!'),3400);
    head(L2('Лови беглецов!','Catch the runaways!'),host.pc?L2('Щёлкни по раку или жми пробел — вернётся в вершу','Click a crayfish or press Space to put it back'):L2('Тапни по раку — вернётся в вершу','Tap a crayfish to put it back'));
    host.kbd(host.L(kc('Пробел')+' — хватай беглеца, что ближе к воде (или щёлкни по нему)',kc('Space')+' — grab the runaway nearest the water (or click it)'),7);
    cnt.style.display='';root.classList.add('cnt-on');cnt.querySelector('span').textContent=V.kept;}
  function spawn(){var lp=landPos(),vm=vershaMouth(),pb=A.pierBox(G0),k=V.ks[V.spawned%V.ks.length]||'shir';V.spawned++;
    /* цель — край мостков слева (вода) или дальний торец */
    /* цель — левый край мостков (вода), правый край (обходит вершу спереди) или дальний торец */
    var q=Math.random(),ty,tx,cx,cy,side=q<.4?-1:q<.8?1:0;
    if(side===0){tx=pb.fl+(pb.fr-pb.fl)*(.1+Math.random()*.45);ty=pb.yT-G0.u*.5;cx=(vm.x+tx)/2-G0.u*8;cy=vm.y-H*.04;}
    else{ty=Math.min(H*.97,Math.max(pb.yT+(pb.yB-pb.yT)*.35,vm.y+(Math.random()-.2)*H*.12));tx=A.pierEdge(pb,ty,side)+side*G0.u;cx=side<0?(vm.x+tx)/2:lp.x;cy=side<0?vm.y+H*.05:Math.min(H*.985,lp.y+lp.L*.35);}
    var dur=(calm?4.8:3.6)*(side===1?1.25:1)*(.9+Math.random()*.25),r={x:vm.x,y:vm.y,x0:vm.x,y0:vm.y,x1:tx,y1:ty,t:0,dur:dur,k:k,st:'go',a:Math.PI,wob:Math.random()*7,L:lp.L*.5,cx:cx+(Math.random()-.5)*G0.u*6,cy:cy};
    V.rk.push(r);snd('nib');}
  function vershaMouth(){var lp=landPos();return {x:lp.x-lp.L*.45,y:lp.y};}
  function tapAt(x,y){if(ph==='set'){var best=-1,bd=1e9;for(var i=0;i<3;i++){var sp=spotPos(G0,i),d=Math.hypot((x-sp.x)/Math.max(1,sp.s),(y-sp.y)*2/Math.max(1,sp.s));if(d<bd){bd=d;best=i;}}if(bd<G0.u*22)pickSpot(best);return;}
    if(ph==='crawl'){var hit=null,hd=1e9;for(var j=0;j<V.rk.length;j++){var r=V.rk[j];if(r.st!=='go')continue;var dd=Math.hypot(x-r.x,y-r.y);if(dd<hd){hd=dd;hit=r;}}
      if(hit&&hd<Math.max(40,hit.L*.85))grab(hit);}}
  function grab(r){r.st='back';r.t=0;r.bx=r.x;r.by=r.y;snd('tap');vib(15);
    for(var i=0;i<8;i++)parts.push({x:r.x,y:r.y,vx:(Math.random()-.5)*G0.u*20,vy:-G0.u*(4+Math.random()*12),t:0,life:.6,k:'spark'});}
  function backIn(r){r.st='in';V.ret++;V.kept++;cnt.querySelector('span').textContent=V.kept;cnt.classList.remove('pop');void cnt.offsetWidth;cnt.classList.add('pop');snd('coin');
    var k=r.k;if(k==='blue'||k==='gold')say(k==='gold'?L2('Батюшки, золотистый! Такого в Книгу двора!','Golden one! Into the yard book!'):L2('Глянь — голубой рак! Редкость!','A blue one! Rare!'),3000);}
  function escaped(r){r.st='esc';r.t=0;V.esc++;rips.push({x:r.x,y:r.y,t0:T,s:G0.u*5});snd('plop');
    if(V.esc===1||Math.random()<.35)say([L2('Эх, утёк!','Ugh, got away!'),L2('Шустрый, однако!','Quick one!'),L2('Ушёл к своим, бывает.','Back to his folks, oh well.')][Math.floor(Math.random()*3)],2000);}
  function endCheck(){go('end');var n=V.ks.length,kept=V.kept,cr=V.cr,frac=cr?V.ret/cr:1,tier=kept<=0?0:frac>=.999?3:frac>=.6?2:1;
    var kinds={};V.ks.slice(0,V.stay).forEach(function(k){kinds[k]=(kinds[k]||0)+1;});V.rk.forEach(function(r){if(r.st==='in')kinds[r.k]=(kinds[r.k]||0)+1;});
    var T2=V.tot;T2.n+=n;T2.kept+=kept;T2.ret+=V.ret;T2.cr+=cr;for(var k in kinds)T2.kinds[k]=(T2.kinds[k]||0)+kinds[k];T2.tier=Math.max(T2.tier||0,tier);V.checked++;
    if(!TR){m.v[V.slot]=null;m.n=(m.n||0)+1;m.tot=(m.tot||0)+kept;for(k in kinds)m.kinds[k]=(m.kinds[k]||0)+kinds[k];A.save();}
    V.petr={pose:'cheer',k:1};cnt.style.display='none';root.classList.remove('cnt-on');
    say(tier===3?L2('Ни один не ушёл! Вот это хватка!','Not one got away! What a grip!'):tier===2?L2('Хорош улов! Будет и в уху, и бабе Зине.','Nice haul! Enough for soup and for Zina.'):L2('Ничего, и так славно. Завтра больше будет.','Not bad. More tomorrow.'),4000);
    setTimeout(function(){if(dead)return;if(bot)finish();else finCheck(kept,tier,kinds);},bot?200:1100);}
  function finCheck(kept,tier,kinds){var rec=!TR&&V.tot.kept>(m.rec||0);if(rec)m.rec=V.tot.kept;
    var rare=kinds.gold?L2('Попался золотистый рак — в Книгу двора!','A golden crayfish — into the yard book!'):kinds.blue?L2('Попался голубой рак — редкость, в Книгу двора!','A blue crayfish — rare, into the yard book!'):'';
    var other=-1,t=now();for(var i=0;i<2;i++)if(m.v[i]&&t>=m.v[i].r)other=i;
    var again=!TR&&other<0&&canSet(m,0,td),can2=!TR&&other<0&&!again&&canSet(m,1,td);
    fin.innerHTML='<h2>'+(TR?L2('Тренировка','Practice'):L2('Улов из верши','Trap haul'))+'</h2><div class="stars"></div><div class="big"></div>'+
      '<p>'+L2('Вернул беглецов: ','Runaways caught: ')+'<b>'+V.ret+' '+L2('из','of')+' '+V.cr+'</b></p>'+(rare?'<p><b>'+rare+'</b></p>':'')+(rec?'<div class="rec">'+L2('Рекорд верши!','Trap record!')+'</div>':'')+
      (TR?'<p style="opacity:.8">'+L2('В тренировке раки отпускаются.','In practice the crayfish go free.')+'</p>':'<p style="opacity:.85">'+L2('Раки — в садок: в уху «по-царски», бабе Зине, на рынок.','Crayfish go to the keep net.')+'</p>')+
      '<div class="'+(again||other>=0||can2?'row2':'')+'">'+(other>=0?'<button class="btn" id="vrNext">'+L2('Вторая верша','Second trap')+'</button>':again?'<button class="btn" id="vrAgain">'+ic('again')+' '+L2('Поставить снова','Set again')+'</button>':can2?'<button class="btn" id="vr2">'+ic('ad')+' '+L2('Вторая верша','Second trap')+'</button>':'')+'<button class="btn green" id="vrOk" data-enter>'+L2('Забрать','Collect')+kc('Enter')+'</button></div>';
    var stw=fin.querySelector('.stars');for(i=0;i<3;i++){var c=A.icon('star',52,{off:i>=tier});c.style.opacity='0';c.style.transition='opacity .3s '+(i*.25)+'s, transform .3s '+(i*.25)+'s';c.style.transform='scale(.4)';stw.appendChild(c);}
    var big=fin.querySelector('.big');big.appendChild(A.icon('rak',64));var sp=document.createElement('span');sp.textContent='× 0';big.appendChild(sp);
    fin.classList.add('on');root.classList.add('fin-on');sayEl.classList.remove('on');requestAnimationFrame(function(){[].forEach.call(stw.children,function(c){c.style.opacity='1';c.style.transform='scale(1)';});});
    var n=0,tot=kept;(function up(){if(dead)return;sp.textContent='× '+n;if(n<tot){n++;snd('tick');setTimeout(up,calm?40:90);}else if(tier>=2)snd(tier===3?'record':'newf');})();
    fin.querySelector('#vrOk').onclick=function(){snd('coin');finish();};
    var b;if((b=fin.querySelector('#vrAgain')))b.onclick=function(){snd('tap');fin.classList.remove('on');root.classList.remove('fin-on');startSet(0);};
    if((b=fin.querySelector('#vrNext')))b.onclick=function(){snd('tap');fin.classList.remove('on');root.classList.remove('fin-on');var s=m.v[other];V.slot=other;V.sel=s.sp;V.late=now()>s.r+LATE_MS;V.ks=catchOf(seed,other,s.sp,s.d);if(V.late)V.ks=V.ks.slice(0,Math.ceil(V.ks.length/2));V.land=null;startPull();};
    if((b=fin.querySelector('#vr2')))b.onclick=function(){askSecond(b);};}
  function finish(){if(dead)return;var T2=V.tot,frac=T2.cr?T2.ret/T2.cr:1,tier=V.checked?(T2.kept<=0?0:frac>=.999?3:frac>=.6?2:1):0;
    var rec=V.checked&&!TR&&T2.kept>=(m.rec||0)&&T2.kept>0&&m.rec===T2.kept;
    var n=TR?0:T2.kept,RK=.06;/* рак ≈ 0,06·Р (09-minigames): в дневной потолок идёт как val */
    stop();fin.classList.remove('on');root.classList.remove('fin-on');sayEl.classList.remove('on');botEl.innerHTML='';host.done({score:T2.kept,tier:tier,rec:!!rec,scoreTxt:L2('Раков в садке','Crayfish kept')+': <b>'+T2.kept+'</b>',
      extra:{rk:n,kinds:T2.kinds,set:V.setDone?1:0,checks:V.checked,ret:T2.ret,cr:T2.cr,
        line:n?'':V.setDone?L2('Верша стоит — проверь завтра','The trap is set — check tomorrow'):''}});}
  function quit(){stop();if(host.quit)host.quit();try{if(window.MG_DVOR&&MG_DVOR.open)MG_DVOR.open();}catch(e){}}
  function stop(){dead=true;cancelAnimationFrame(raf);removeEventListener('resize',resize);}
  host.onquit=function(){stop();};

  /* ---------- кадр ---------- */
  function upd(dt){T+=dt;phT+=dt;if(sayT>0){sayT-=dt;if(sayT<=0)sayEl.classList.remove('on');}
    if(ph==='throw'){var f=V.fly;f.t+=dt/(calm?1.1:.8);if(f.t>=1){f.t=1;rips.push({x:f.x1,y:f.y1,t0:T,s:G0.u*8*spotPos(G0,V.sel).s});snd('splash');vib(20);for(var i=0;i<10;i++)parts.push({x:f.x1,y:f.y1,vx:(Math.random()-.5)*G0.u*14,vy:-G0.u*(6+Math.random()*10),t:0,life:.6,k:'drop'});V.fly=null;afterThrow();}}
    if(ph==='pull'){var hold=V.hold||(bot&&phT>.6);var was=V.k;if(hold)V.k=Math.min(1,V.k+dt/(calm?3.2:4.2));else V.k=Math.max(0,V.k-dt*.08);V.petr.k=V.k;
      if(V.hb)V.hb.querySelector('i').style.width=(V.k*100)+'%';
      if(was<.42&&V.k>=.42){var vp=vPos(V.k);snd('splash');rips.push({x:vp.x,y:vp.y,t0:T,s:G0.u*8});for(i=0;i<14;i++)parts.push({x:vp.x,y:vp.y,vx:(Math.random()-.5)*G0.u*20,vy:-G0.u*(8+Math.random()*14),t:0,life:.7,k:'drop'});}
      if(hold&&Math.random()<dt*3)snd('click');
      if(V.k>=1)landed();}
    if(ph==='land'&&phT>(calm?1.3:.9)){go('crawl');V.next=.4;}
    if(ph==='crawl'){V.next-=dt;var out=0;V.rk.forEach(function(r){if(r.st==='go')out++;});
      if(V.spawned<V.cr&&V.next<=0&&out<(calm?2:3)){spawn();V.next=(calm?2.3:1.5)*(.8+Math.random()*.4);}
      V.rk.forEach(function(r){r.t+=dt;
        if(r.st==='go'){var k=Math.min(1,r.t/r.dur),e=k,ix=(1-e)*(1-e)*r.x0+2*(1-e)*e*r.cx+e*e*r.x1,iy=(1-e)*(1-e)*r.y0+2*(1-e)*e*r.cy+e*e*r.y1;
          r.a=Math.atan2(iy-r.y,ix-r.x)||r.a;r.x=ix;r.y=iy;if(k>=1)escaped(r);
          if(bot&&!r.bt){r.bt=1;var p=bot==='good'?1:bot==='mid'?.7:.3;if(Math.random()<p)r.botAt=.35+Math.random()*.9*Math.min(1,r.dur/3.5);}
          if(r.botAt&&r.t>r.botAt&&r.st==='go'){r.botAt=0;grab(r);}}
        else if(r.st==='back'){var vm=vershaMouth(),kb=Math.min(1,r.t/.45);r.x=r.bx+(vm.x-r.bx)*kb;r.y=r.by+(vm.y-r.by)*kb-Math.sin(kb*Math.PI)*G0.u*10;r.a+=dt*14;if(kb>=1)backIn(r);}
      });
      var busy=V.rk.some(function(r){return r.st==='go'||r.st==='back';});
      if(V.spawned>=V.cr&&!busy&&phT>1)endCheck();}
    for(var j=parts.length-1;j>=0;j--){var q=parts[j];q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=G0.u*60*dt;if(q.t>q.life)parts.splice(j,1);}
    if(ph==='wait'&&phT>30){showWait();}}
  /* верша в полёте при подъёме: k 0..1 от точки к мосткам */
  function vPos(k){var sp=spotPos(G0,V.sel),lp=landPos(),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,pb=A.pierBox(G0),cx=(sp.x+lp.x)/2,cy=pb.yT-H*.16;
    var x=(1-e)*(1-e)*sp.x+2*(1-e)*e*cx+e*e*lp.x,y=(1-e)*(1-e)*sp.y+2*(1-e)*e*cy+e*e*lp.y;return {x:x,y:y,L:lp.L*(sp.s+(1-sp.s)*e),sub:Math.max(0,1-k/.42)};}
  function draw(){var u=G0.u;g.drawImage(BG,0,0,W,H);A.drawShim(g,G0,SH,T,P);
    /* точки */
    for(var i=0;i<3;i++){var sp=spotPos(G0,i),s=sp.s*u*15;
      if(i===0)A.snag(g,sp.x-s*.2,sp.y,s*1.1,P);else if(i===1)A.pit(g,sp.x,sp.y,s*1.3,T,P);else A.reeds(g,sp.x+s*.35,sp.y+s*.05,s*1.1,T,P,11,10);
      var vs=null;for(var j=0;j<2;j++)if(m.v[j]&&m.v[j].sp===i&&!(ph!=='set'&&ph!=='wait'&&ph!=='setok'&&j===V.slot))vs=m.v[j];
      if(vs||(ph==='setok'&&V.sel===i)){A.buoy(g,sp.x+s*.15,sp.y-s*.05,s*.55,T+i);if(vs&&now()>=vs.r&&ph!=='pull'){g.save();g.globalAlpha=.5+.5*Math.sin(T*4);A.chip(g,sp.x,sp.y-s*.9,L2('полна!','full!'),{bg:'rgba(200,60,40,.85)',fs:16});g.restore();}}
      if(ph==='set'){var pul=.5+.5*Math.sin(T*3+i),ds=daySpot(seed)===i;g.strokeStyle=ds?'rgba(255,214,90,'+(.55+.45*pul)+')':'rgba(255,255,255,'+(.35+.4*pul)+')';g.lineWidth=Math.max(2,u*.5);
        g.beginPath();g.ellipse(sp.x,sp.y,s*(1.3+pul*.12),s*(.42+pul*.04),0,0,7);g.stroke();A.chip(g,sp.x,sp.y+s*.85,L2(SPOTS[i].n,SPOTS[i].en),{fs:Math.round(Math.max(16,Math.min(19,u*4.2))),ring:ds?'rgba(255,214,90,.9)':null});
        if(V.hov===i){g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=Math.max(3,u*.8);g.beginPath();g.ellipse(sp.x,sp.y,s*1.42,s*.47,0,0,7);g.stroke();} /* RB:MGPC наведение мышью */
        if(host.pc&&!bot&&window.MG&&MG.keycap)MG.keycap(g,sp.x,sp.y-s*.75,String(i+1),Math.round(Math.max(26,Math.min(32,u*6))));}}
    rips=rips.filter(function(r){return A.ripple(g,r,T);});
    var pp=petrPos(),lp=landPos(),cp=catPos(),lm=lampPos();
    var lit=night||tod==='evening';if(lit)A.lamp(g,lm.x,lm.y,lm.s,T,false,true);
    A.cat(g,cp.x,cp.y,cp.s,{P:P,t:T,dir:-1});
    /* Петрович (дальше верши на мостках) */
    A.petr(g,pp.x,pp.y,pp.h,{P:P,t:T,pose:V.petr.pose,k:V.petr.k,dir:V.petr.pose==='point'&&V.sel>=0&&spotPos(G0,V.sel).x<pp.x?-1:1,smile:ph==='end'||ph==='setok'});
    /* верша: летит/тянется/лежит */
    var vo={P:P,t:T};
    if(ph==='throw'&&V.fly){var f=V.fly,e=f.t,x=f.x0+(f.x1-f.x0)*e,y=f.y0+(f.y1-f.y0)*e-Math.sin(e*Math.PI)*H*.14,sc=1-e*.75;A.versha(g,x,y,lp.L*.55*sc,{P:P,rot:e*2.5,t:T});}
    var pull=ph==='pull',onPier=ph==='land'||ph==='crawl'||ph==='end';
    if(pull){var vp=vPos(V.k),sp2=spotPos(G0,V.sel);
      /* верёвка от рук к верше */
      var hs=pp.x-pp.h*.32,hy=pp.y-pp.h*.46;g.strokeStyle=P.tint('#d8c8a0');g.lineWidth=Math.max(1.5,u*.35);g.beginPath();g.moveTo(hs,hy);g.quadraticCurveTo((hs+vp.x)/2,Math.max(hy,vp.y)+u*(V.hold?1:5),vp.x+vp.L*.45,vp.y);g.stroke();
      if(vp.sub>0){g.save();g.beginPath();g.rect(0,0,W,Math.max(vp.y-vp.L*.1,0)+H);g.clip();A.versha(g,vp.x,vp.y+vp.L*.15*vp.sub,vp.L,{P:P,sub:vp.sub,wet:1,t:T});g.restore();
        g.fillStyle='rgba(60,110,130,'+(.45*vp.sub)+')';g.beginPath();g.ellipse(vp.x,vp.y,vp.L*.62,vp.L*.2,0,0,7);g.fill();
        if(Math.random()<.3)rips.push({x:vp.x+(Math.random()-.5)*vp.L*.5,y:vp.y,t0:T,s:u*3*sp2.s+u});}
      else A.versha(g,vp.x,vp.y,vp.L,{P:P,wet:1,t:T,rot:Math.sin(T*3)*.05});}
    if(onPier){var dry=Math.max(0,1-phT*.15*(ph==='end'?3:1));
      A.versha(g,lp.x,lp.y,lp.L,{P:P,wet:ph==='end'?Math.max(.2,dry):1,t:T,inside:function(gg,x,y,w,h){var n=Math.min(6,V.kept);for(var q=0;q<n;q++)A.rak(gg,x+w*(.15+q*.14),y+h*(.35+(q%2)*.3),w*.32,Math.PI+(q%3-1)*.4,{P:P,t:T,k:'shir',noShadow:1,walk:.3});}});}
    /* раки */
    V.rk.forEach(function(r){if(r.st==='in')return;if(r.st==='esc'){if(r.t>.4)return;g.save();g.globalAlpha=1-r.t/.4;A.rak(g,r.x-r.t*u*6,r.y+r.t*u*4,r.L*(1-r.t),r.a,{P:P,t:T,k:r.k,walk:1});g.restore();return;}
      var near=ph==='crawl'&&r.st==='go'&&r.t/r.dur>.6;if(near){g.save();g.strokeStyle='rgba(255,90,60,'+(.4+.4*Math.sin(T*10))+')';g.lineWidth=2.5;g.beginPath();g.arc(r.x,r.y,r.L*.62,0,7);g.stroke();g.restore();}
      A.rak(g,r.x,r.y,r.L,r.a,{P:P,t:T+r.wob,k:r.k,walk:r.st==='go'?1:0,claw:r.st==='back'?1:.3+.3*Math.sin(T*3+r.wob),curl:r.st==='back'?.8:0});});
    if(ph==='set'||ph==='throw'&&V.fly&&V.fly.t<.05){/* верша в руках */A.versha(g,pp.x,pp.y-pp.h*.4,lp.L*.5,{P:P,t:T,rot:-.08});}
    /* передний план: камыш по углам (глубина) */
    A.reeds(g,W*.02,H*1.01,u*(G0.land?30:26),T*.8,P,21,12);A.reeds(g,W*.995,H*1.01,u*(G0.land?26:22),T*.8,P,23,10);
    /* частицы */
    parts.forEach(function(q){var a=1-q.t/q.life;if(q.k==='drop'){g.fillStyle='rgba(215,238,250,'+(.85*a)+')';g.beginPath();g.ellipse(q.x,q.y,u*.35,u*.6,0,0,7);g.fill();}
      else{A.star(g,q.x,q.y,u*1.1*a+1,'rgba(255,224,120,'+a+')');}});
    if(lit){var kk=.92+.08*Math.sin(T*7);g.save();g.globalCompositeOperation='lighter';A.glow(g,lm.x,lm.y-lm.s*.5,lm.s*9*kk,'255,190,100',.28);A.glow(g,lp.x,lp.y,Math.max(W,H)*.32,'255,180,90',.13);A.glow(g,lm.x,lm.y-lm.s*.5,lm.s*2.4*kk,'255,220,150',.5);g.restore();}
    if(FL)A.drawFlies(g,FL,T,u,true);
    /* RB:MGPC на ПК — значок «Пробел» над беглецом, которого схватит клавиша (первые трое) */
    if(host.pc&&!bot&&ph==='crawl'&&V.ret<3&&window.MG&&MG.keycap){var rn=runner();if(rn)MG.keycap(g,rn.x,rn.y-rn.L*.62-16,L2('Пробел','Space'),Math.round(Math.max(24,Math.min(30,u*5))));}
    /* ночная виньетка */
    if(night&&!A.low()){var vg=g.createRadialGradient(W*.5,H*.62,Math.min(W,H)*.3,W*.5,H*.6,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,10,0)');vg.addColorStop(1,'rgba(0,0,12,.42)');g.fillStyle=vg;g.fillRect(0,0,W,H);}}
  function frame(ts){if(dead)return;if(!root.isConnected){stop();return;}var dt=Math.min(.05,(ts-last)/1000||.016);last=ts;if(host.paused){dt=0;if(V.hold)upAll();}upd(dt);draw();raf=requestAnimationFrame(frame);} /* RB:MGPC пауза оболочки: время стоит, «держу» отпускаем */
  function pxy(e){var r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  cv.addEventListener('pointerdown',function(e){if(e.button>0||!G0)return;var p=pxy(e);if(ph==='pull'){V.hold=true;if(V.hb)V.hb.classList.add('on');try{cv.setPointerCapture(e.pointerId);}catch(er){}return;}tapAt(p.x,p.y);});
  var upAll=function(){if(ph==='pull'){V.hold=false;if(V.hb)V.hb.classList.remove('on');}};cv.addEventListener('pointerup',upAll);cv.addEventListener('pointercancel',upAll);cv.addEventListener('lostpointercapture',upAll);
  /* RB:MGPC мышь без нажатия: подсветка места и «рука» над тем, что можно щёлкнуть (ничего не меняет в игре) */
  function spotAt(x,y){var best=-1,bd=1e9;for(var i=0;i<3;i++){var sp=spotPos(G0,i),d=Math.hypot((x-sp.x)/Math.max(1,sp.s),(y-sp.y)*2/Math.max(1,sp.s));if(d<bd){bd=d;best=i;}}return bd<G0.u*22?best:-1;}
  function rakAt(x,y){for(var j=0;j<V.rk.length;j++){var r=V.rk[j];if(r.st==='go'&&Math.hypot(x-r.x,y-r.y)<Math.max(40,r.L*.85))return r;}return null;}
  cv.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse'||!G0)return;var p=pxy(e),c='';V.hov=-1;
    if(ph==='set'){V.hov=spotAt(p.x,p.y);if(V.hov>=0)c='pointer';}else if(ph==='crawl'){if(rakAt(p.x,p.y))c='pointer';}else if(ph==='pull')c='pointer';
    if(cv.style.cursor!==c)cv.style.cursor=c;});
  cv.addEventListener('pointerleave',function(){V.hov=-1;});
  /* RB:MGPC клавиши: 1/2/3 — место; пробел (держать) — тянуть; пробел/Enter — схватить беглеца, что ближе всех к воде */
  function runner(){var b=null;V.rk.forEach(function(r){if(r.st==='go'&&(!b||r.t/r.dur>b.t/b.dur))b=r;});return b;}
  host.keys(function(k){if(ph==='set'&&(k==='1'||k==='2'||k==='3')){pickSpot(+k-1);return true;}
    if(k===' '||k==='Enter'){if(ph==='pull'){V.hold=true;if(V.hb)V.hb.classList.add('on');return true;}
      if(ph==='crawl'){var r=runner();if(r)grab(r);return true;}
      if(ph==='land'||ph==='throw'||ph==='set')return true;}
    return false;});
  host.keysUp(function(k){if((k===' '||k==='Enter')&&ph==='pull'){upAll();return true;}return false;});
  host.amb('water',tod); /* RB:MGPC звуки по нарисованному времени суток */
  addEventListener('resize',resize);resize();start();
  /* тест/снимки: window.__mgc — управление сценой */
  window.__mgc={get ph(){return ph;},V:V,tap:tapAt,draw:function(dt){upd(dt||.016);draw();},go:go};
  raf=requestAnimationFrame(function(ts){last=ts;frame(ts);});}

/* авто-игрок: q = 'good' | 'mid' | 'bad' → {score, tier} (без экрана, для проверки ступеней наград) */
function sim(q,seed){var p=q==='good'?1:q==='mid'?.7:.3,R=(window.MGCA||{rng:function(){return Math.random;}}).rng(seed||Math.floor(Math.random()*1e9)),n=3+Math.floor(R()*6);if(R()<1/3)n=Math.round(n*1.5);n=Math.max(3,Math.min(12,n));
  var cr=Math.max(2,Math.min(n,Math.ceil(n*.7))),ret=0;for(var i=0;i<cr;i++)if(R()<p)ret++;var kept=n-cr+ret,frac=ret/cr;return {score:kept,tier:kept<=0?0:frac>=.999?3:frac>=.6?2:1,n:n};}

var DEF={id:ID,n:{ru:'Верша на раков',en:'Crayfish trap'},icon:'versha',kind:'daily',
  open:function(){return typeof S!=='undefined'&&!!(S.open&&S.open[1]);},  /* с Речки */
  run:run,badge:badge,sim:sim,
  /* готова ли проверка/постановка (для «Двора» и Дела дня): 'check' | 'set' | '' */
  ready:function(){return !!DEF.due();},
  due:function(){var m=st(),t=now();for(var i=0;i<2;i++)if(m.v[i]&&t>=m.v[i].r)return 'check';return canSet(m,0,today())?'set':'';}};
(window.MG_REG?window.MG_REG:function(d){(window.MG_PEND=window.MG_PEND||[]).push(d);})(DEF);
})();
