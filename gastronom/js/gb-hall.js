'use strict';
/* ================= gb-hall — зал тёти Вали на главном экране (поток VIEW, 11.10.2026) =================
   Холст #vwHallCv в #vwHallBox (разметку ставит gb-view.js). Рисуется тем же кодом, что зал уровня: drawPerson('valya') —
   без правок (эталон облика для других игр), обстановка DECOR — функциями игры (часы, плакат, фикус, «Бирюса», самовар…).
   Слои: статичный фон (стена, вывеска, отделы, обстановка на стене) → покупатели → прилавок → Валя → кот/гости → GB.hallLayers.
   Отделы — GBM.depList() (META) + GBART.dep() (ART); нет их — на стене прежняя обстановка (часы, плакат, календарь…).
   Цвет стены и вывески — по республике (GB.lvInfo → GBU от LVL). Реплика дня — GBT.say('hall') (TEXT), без него — свои 10.
   Анимация (Валя дышит/моргает/говорит) — только пока главный на экране; «спокойный режим» — один кадр. */
(function(){
  if(!window.GB||!GB.viewOn)return;
  var H=window.GBHALL={},cv=null,g=null,bg=null,fg=null,R=null,raf=0,t0=0,talkT=0,line='',dpr=1,lastKey='';
  function $(id){return document.getElementById(id);}
  function Lx(ru,en){return typeof L==='function'?L(ru,en):ru;}
  function S_(){return typeof S!=='undefined'?S:null;}
  function hd(id){return typeof hasDecor==='function'&&hasDecor(id);}
  function isCalm(){return typeof calm==='function'&&calm();}
  var DAY=[['С добрым утром! Завоз пришёл — разложим?','Good morning! The delivery is here — shall we stock up?'],
    ['Очередь уже у дверей. Работаем!','The queue is at the door already. Let\'s work!'],
    ['Кефир свежий, батоны тёплые. Открываемся!','Fresh kefir, warm loaves. We\'re open!'],
    ['Пока я здесь — магазин будет!','As long as I\'m here, this store stays open!'],
    ['Торг обещал проверку. Покажем образцовый порядок!','The trade office promised an inspection. Let\'s show them perfect order!'],
    ['Сгущёнку привезли! Сейчас начнётся…','The condensed milk has arrived! Here we go…'],
    ['Полы помыты, витрина блестит. Зовите покупателей!','Floors washed, showcase shining. Call the customers in!'],
    ['Без очереди не пускаю, даже по знакомству.','No cutting in line, not even for friends.'],
    ['Касса пробита, сдача готова. Ну, кто первый?','Till is open, change is ready. Who\'s first?'],
    ['Говорят, в соседнем районе тоже стараются. Ну-ну.','They say the store next district is trying hard too. We\'ll see.']];
  function dayLine(){var t='';if(window.GBT&&GBT.say)t=GB.safe('GBT.say',function(){return GBT.say('hall',{});})||'';
    if(t)return t;var d=new Date(),k=(d.getFullYear()*372+d.getMonth()*31+d.getDate())%DAY.length,p=DAY[(k+talkT)%DAY.length];return Lx(p[0],p[1]);}

  /* ---------- геометрия ---------- */
  function geo(w,h,pc){var r={w:w,h:h,pc:pc};
    r.signH=Math.max(26,Math.min(h*.075,w*.1,56));r.signY=Math.max(8,h*.03);r.wallTop=r.signY+r.signH;
    r.cy=Math.round(h*(pc?.76:.78));r.ty=Math.round(r.cy-h*(pc?.2:.2));r.base=r.cy+h*.03;
    // Валя за прилавком по центру-лево; по пояс видна над прилавком
    r.valya={s:Math.min(h*.5,w*(pc?.5:.42)),x:w*.42};r.valya.y=r.cy+r.valya.s*.15;
    r.ph=Math.min(h*.3,w*(pc?.3:.26));
    r.cat={x:w*.66,y:r.cy+2,s:Math.min(h*.13,w*.17)};
    // места отделов на стене: ряд арок между вывеской и головами
    var n=pc?4:3,gap=w*.03,dw=(w-gap*(n+1))/n,dy=r.wallTop+Math.max(18,h*.05),dh=Math.max(50,Math.min(r.ty-dy-h*.02,dw*.95,h*(pc?.27:.22)));
    r.depSlots=[];for(var i=0;i<n;i++)r.depSlots.push({x:gap+i*(dw+gap),y:dy,w:dw,h:dh});
    r.door={w:Math.min(w*.15,90),h:Math.min(r.cy-r.wallTop-10,h*.34)};r.door.x=w-r.door.w-w*.03;r.door.y=r.cy-r.door.h;
    return r;}

  /* ---------- отделы ---------- */
  function deps(){if(!(window.GBM&&GBM.depList))return [];var L0=GB.safe('GBM.depList',function(){return GBM.depList();})||[];
    // на стене — сколько влезает: сначала тот, что в ремонте, потом открытые (выше уровень — раньше), потом следующий закрытый
    var a=L0.slice().sort(function(x,y){var px=x.rep?3:(x.open||x.lv>0)?2:1,py=y.rep?3:(y.open||y.lv>0)?2:1;return py-px||(y.lv||0)-(x.lv||0);});
    return a;}
  function depPlate(q,d,x,y,w,h,t){ // запас до рисунков ART: арка с табличкой, в лесах — «РЕМОНТ p/n»
    var open=!!d.open||(d.lv||0)>0;if(typeof rrect!=='function')return;
    rrect(q,x,y,w,h,8);q.fillStyle=open?'#f5e7cc':'#d9cbb3';q.fill();q.strokeStyle='#8a5229';q.lineWidth=3;q.stroke();
    rrect(q,x+5,y-h*.16,w-10,h*.22,6);q.fillStyle=open?(d.col||'#2e7d32'):'#9e9488';q.fill();
    q.fillStyle='#fff6df';q.font='800 '+Math.round(Math.min(h*.12,w*.11))+'px -apple-system,Segoe UI,Roboto,sans-serif';q.textAlign='center';q.textBaseline='middle';
    q.fillText(String(d.n||'').toUpperCase(),x+w/2,y-h*.05,w-14);
    if(open){for(var r=0;r<2;r++){q.fillStyle='#b8784a';q.fillRect(x+4,y+h*(.48+r*.4),w-8,4);}
      var T=d.goods||[13,14,4,1,12,21];for(var r2=0;r2<2;r2++)for(var k=0;k<3;k++)if(typeof drawGood==='function')drawGood(q,T[(r2*3+k)%T.length],x+w*(k+.5)/3,y+h*(.48+r2*.4),Math.min(w/3*.85,h*.36));}
    else{q.strokeStyle='#a07d4e';q.lineWidth=3;for(var k2=0;k2<3;k2++){q.beginPath();q.moveTo(x+8+k2*(w-16)/2,y+6);q.lineTo(x+8+k2*(w-16)/2,y+h-4);q.stroke();}
      q.beginPath();q.moveTo(x+8,y+h*.35);q.lineTo(x+w-8,y+h*.35);q.moveTo(x+8,y+h*.72);q.lineTo(x+w-8,y+h*.72);q.stroke();
      rrect(q,x+w*.1,y+h*.42,w*.8,h*.26,4);q.fillStyle='#fffbe9';q.fill();q.strokeStyle='#c62828';q.lineWidth=2;q.stroke();
      q.fillStyle='#c62828';q.font='900 '+Math.round(Math.min(h*.11,w*.12))+'px -apple-system,Segoe UI,Roboto,sans-serif';
      q.fillText(d.need?Lx('РЕМОНТ ','REPAIR ')+(d.p||0)+'/'+d.need:Lx('РЕМОНТ','REPAIR'),x+w/2,y+h*.555,w*.76);}}

  /* ---------- вывеска (текст — разряд от META: GBM.info(r).sign, без него — «ГАСТРОНОМ») ---------- */
  function signText(){if(window.GBM&&GBM.info){var i=GB.safe('GBM.info',function(){return GBM.info();});if(i&&i.sign)return i.sign;}
    return typeof SIGN==='function'?SIGN():'ГАСТРОНОМ';}
  function sign(q,x,y,w,h,col,txt){var neon=hd('neon');rrect(q,x,y,w,h,h*.18);q.fillStyle=neon?'#2a1a14':col;q.fill();q.strokeStyle=neon?'#5a3a2a':shade(col,-.3);q.lineWidth=Math.max(2,h*.07);q.stroke();
    var fs=Math.min(h*.62,w/(Math.max(9,txt.length)*.8));q.font='900 '+Math.round(fs)+'px -apple-system,Segoe UI,Roboto,sans-serif';q.textAlign='center';q.textBaseline='middle';
    if(neon){q.shadowColor='#ff3b30';q.shadowBlur=h*.35;q.fillStyle='#ff6b5e';q.fillText(txt,x+w/2,y+h*.54);q.shadowBlur=0;}
    else{q.fillStyle='rgba(0,0,0,.25)';q.fillText(txt,x+w/2+1,y+h*.54+2);q.fillStyle='#fff6df';q.fillText(txt,x+w/2,y+h*.54);}
    if(hd('q_gold')){rrect(q,x,y,w,h,h*.18);q.strokeStyle='#e0b23a';q.lineWidth=Math.max(2.5,h*.1);q.stroke();}}

  function udarnik(){return !!GB.safe('PAY.own',function(){return typeof PAY!=='undefined'&&PAY.own&&PAY.own('starter');});}
  function plaque(q,x,y,w,h){rrect(q,x,y,w,h,4);q.fillStyle='#e0b23a';q.fill();rrect(q,x+3,y+3,w-6,h-6,3);q.fillStyle='#fff3c4';q.fill();
    q.fillStyle='#8a2a14';q.textAlign='center';q.textBaseline='middle';var fs=Math.max(7,Math.min(h*.26,w*.13));q.font='900 '+Math.round(fs)+'px -apple-system,Segoe UI,Roboto,sans-serif';
    q.fillText(Lx('УДАРНИК','STAR'),x+w/2,y+h*.36,w*.86);q.fillText(Lx('ТОРГОВЛИ','SHOP'),x+w/2,y+h*.68,w*.86);}
  var flI=null,flS='';
  function flagImg(){if(!window.GBLG||!GBLG.flag||!GBLG.flagSvg)return null;if(!GB.safe('GBLG.flag',function(){return GBLG.flag();}))return null;
    var svg=GB.safe('GBLG.flagSvg',function(){return GBLG.flagSvg(80);})||'';if(!svg)return null;
    if(svg!==flS){flS=svg;flI=new Image();flI.onload=function(){GB.hallRedraw();};flI.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);return null;}
    return flI&&flI.complete&&flI.naturalWidth?flI:null;}
  /* ---------- статичный фон и прилавок (перестраиваются при смене размера/обстановки) ---------- */
  function mk(w,h){var c=document.createElement('canvas');c.width=Math.ceil(w*dpr);c.height=Math.ceil(h*dpr);var q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,0,0);return [c,q];}
  function layers(name,q,t){GB.hallLayers.filter(function(l){return (l.layer||'front')===name;}).sort(function(a,b){return (a.order||0)-(b.order||0);})
    .forEach(function(l){GB.safe('hall:'+l.id,function(){q.save();l.draw(q,R,t);q.restore();});});}
  function buildBg(){var w=R.w,h=R.h,a=mk(w,h),q=a[1];bg=a[0];
    var col=R.col;q.fillStyle=lin(q,0,0,0,h,[shade(col,.88),shade(col,.78)]);q.fillRect(0,0,w,h);
    // пол/плитка
    var ty=R.ty,ts=Math.max(14,Math.min(28,w*.05));
    if(hd('tiles')){for(var y=ty,r=0;y<h;y+=ts,r++)for(var x=-(r%2)*ts/2,c=0;x<w;x+=ts,c++){q.fillStyle=(r+c)%2?'#d9e7f2':'#fdfdfb';q.fillRect(x,y,ts,ts);if((r+c)%4===0)ell(q,x+ts/2,y+ts/2,ts*.18,ts*.18,'#4f86b8');}q.fillStyle='#4f86b8';q.fillRect(0,ty-4,w,4);}
    else{q.fillStyle='#f1eee6';q.fillRect(0,ty,w,h-ty);q.strokeStyle='rgba(120,110,95,.22)';q.lineWidth=1;q.beginPath();for(var y2=ty;y2<h;y2+=ts){q.moveTo(0,y2);q.lineTo(w,y2);}for(var x2=0;x2<w;x2+=ts){q.moveTo(x2,ty);q.lineTo(x2,h);}q.stroke();q.fillStyle=shade(col,.3);q.fillRect(0,ty-3,w,3);}
    if(hd('ny')&&typeof drawNYSnow==='function')drawNYSnow(q,w,ty,ts);
    var sw=Math.min(w*.62,400),sx=(w-sw)/2;sign(q,sx,R.signY,sw,R.signH,col,signText());
    if(hd('ny')&&typeof drawNYTop==='function')drawNYTop(q,w,h,R.signY,sx,sx+sw,R.signH);
    // по бокам вывески: слева — знамя соцсоревнования (LEAGUE: GBLG.flag/flagSvg), справа — табличка «Ударник торговли» (ECO: куплена Авоська новичка)
    var gap=sx-8;if(gap>=46){if(udarnik())plaque(q,sx+sw+6,R.signY,Math.min(gap-6,120),R.signH);
      var fl=flagImg();if(fl){var fw=Math.min(gap-6,R.signH*1.1),fh2=fw*1.25;q.drawImage(fl,sx-6-fw,R.signY,fw,fh2);}}
    if(hd('lamps'))for(var k=0;k<3;k++)drawLamp(q,w*(.2+k*.3),0,R.signY*.6+R.signH*.2,Math.max(16,Math.min(w*.05,30)),true);
    layers('wall',q,0);
    // отделы на стене (META/ART), под ними — прежняя обстановка стены (часы, календарь, радио, вымпел, плакат: старым игрокам ничего не теряется)
    var D=deps(),bt=R.wallTop+10;R.deps=[];
    for(var i=0;i<R.depSlots.length&&i<D.length;i++){var sl=R.depSlots[i],d=D[i];R.deps.push({id:d.id,x:sl.x,y:sl.y,w:sl.w,h:sl.h,lv:d.lv||0});bt=sl.y+sl.h+8;
      var done=false;if(window.GBART&&GBART.dep)done=GB.safe('GBART.dep',function(){return GBART.dep(d.id,d.lv||0,{g:q,x:sl.x,y:sl.y,w:sl.w,h:sl.h,t:0,d:d})!==false;});
      if(!done)depPlate(q,d,sl.x,sl.y,sl.w,sl.h,0);}
    var bir=hd('birusa')&&typeof drawBirusa==='function',fh0=Math.min(R.cy-bt-6,h*.36),bw0=bir?fh0*.44+6:0;
    var band=Math.max(30,R.ty-bt-4),cr=Math.max(12,Math.min(band*.3,w*.06,38));
    R.clock=hd('clock')?{x:Math.max(cr+10,w*.08),y:bt+Math.min(band*.45,cr*1.6),r:cr}:null;
    if(hd('calendar')){var chh=Math.min(46,band*.62);drawCalendar(q,Math.max(cr+10,w*.08)+cr*1.4+chh*.5,bt+band*.08,chh*.76,chh);}
    if(hd('radio'))drawRadio(q,w*.36,bt+band*.18,Math.min(46,w*.09,band*.5));
    if(hd('pennant')){var pnh=Math.min(56,band*.7),pnw=pnh/1.25;drawPennant(q,w*.6,bt+pnh*.14,pnw,pnh);}
    if(hd('poster')){var pph=Math.min(band*.8,120),ppw=pph/1.35;drawPoster(q,w-ppw-w*.07-bw0,bt+(band-pph)*.3,ppw,pph);}
    // «Бирюса» — справа у стены (как в зале уровня), фикус тогда — слева
    if(hd('ficus'))drawFicus(q,bir?Math.max(24,w*.06):w-Math.max(24,w*.06),R.cy+2,Math.min(h*.3,150));
    if(bir)drawBirusa(q,w-fh0*.22-4,R.cy,fh0);
    // дверь «Подсобка» (только когда у неё есть хозяин — MG0)
    if(GB._scr.back&&!GB._scr.back.stub){var D0=R.door;R.doorOn=true;q.fillStyle='#7b4a26';q.fillRect(D0.x-4,D0.y-4,D0.w+8,D0.h+4);q.fillStyle=lin(q,D0.x,0,D0.x+D0.w,0,['#a0673a','#8a5229']);q.fillRect(D0.x,D0.y,D0.w,D0.h);
      ell(q,D0.x+D0.w*.82,D0.y+D0.h*.55,Math.max(2,D0.w*.05),Math.max(2,D0.w*.05),'#e0b23a');
      rrect(q,D0.x+D0.w*.1,D0.y+D0.h*.14,D0.w*.8,D0.h*.24,3);q.fillStyle='#fffbe9';q.fill();
      q.fillStyle='#b3261e';q.font='800 '+Math.round(Math.max(7,D0.w*.1))+'px -apple-system,Segoe UI,Roboto,sans-serif';q.textAlign='center';q.textBaseline='middle';
      q.fillText(Lx('ПОСТОРОННИМ','STAFF'),D0.x+D0.w/2,D0.y+D0.h*.21,D0.w*.76);q.fillText(Lx('ВХОД ВОСПРЕЩЁН','ONLY'),D0.x+D0.w/2,D0.y+D0.h*.31,D0.w*.76);}
    else R.doorOn=false;
    layers('dep',q,0);
    // прилавок — свой слой (поверх покупателей и Вали по пояс)
    var b=mk(w,h),p=b[1];fg=b[0];var cy=R.cy;
    if(hd('fridge'))drawFridge(p,0,cy+Math.max(4,h*.025),w,h-cy);
    else{p.fillStyle=lin(p,0,cy,0,h,['#9a6437','#7b4a26']);p.fillRect(0,cy,w,h-cy);p.strokeStyle='rgba(60,30,10,.35)';p.lineWidth=2;var fh=h-cy;for(var x3=w*.06;x3<w-30;x3+=Math.max(70,w*.18))p.strokeRect(x3,cy+fh*.25,Math.max(44,w*.13),fh*.55);}
    p.fillStyle='#c98d56';p.fillRect(0,cy,w,Math.max(5,h*.022));p.fillStyle='rgba(190,225,240,.55)';p.fillRect(0,cy-3,w,3);
    if(hd('q_ribbon'))drawRibbon(p,w*.22,cy+Math.max(8,h*.03),w*.56,Math.max(14,Math.min(26,(h-cy)*.3)));
    var ks=Math.min(h*.13,80);if(hd('kassa'))drawKassa(p,w*.84,cy+2,ks);if(hd('scales'))drawScales(p,w*.14,cy+2,ks*.9);if(hd('samovar'))drawSamovar(p,w*.26,cy+3,ks*.8);
    layers('counter',p,0);}

  /* ---------- кадр ---------- */
  var PPL=[['babka',.12],['intel',.86]];
  function frame(t){if(!g||!R)return;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,R.w,R.h);g.drawImage(bg,0,0,R.w,R.h);
    if(R.clock)drawClock(g,R.clock.x,R.clock.y,R.clock.r);
    // покупатели по краям зала — за прилавком
    for(var i=0;i<PPL.length;i++)drawPerson(g,PPL[i][0],R.w*PPL[i][1],R.cy+R.ph*.12,R.ph,1,t+i*.7,0);
    var talk=t<talkT0+2.2&&!isCalm()?(Math.sin(t*9)>0?1:0):0;
    drawPerson(g,'valya',R.valya.x,R.valya.y,R.valya.s,1,t,talk);
    g.drawImage(fg,0,0,R.w,R.h);
    // кот на прилавке: рисунок ART (слой front) или наш кот из обстановки
    if(hd('cat')&&!GB.hallLayers.some(function(l){return l.id==='plombir';})){
      // живой Пломбир (ART) — дышит и шевелит хвостом; в праздник — в костюме (FEST: FESTGB.look().hat); нет ART — прежний рисунок
      if(!(window.PLOMBIR&&PLOMBIR.draw&&GB.safe('PLOMBIR',function(){var hat=window.FESTGB&&FESTGB.look?(FESTGB.look()||{}).hat||'':'';PLOMBIR.draw(g,R.cat.x,R.cat.y,R.cat.s,'sleep',t,{hat:hat});return true;})))drawCat(g,R.cat.x,R.cat.y,R.cat.s);}
    layers('front',g,t);}
  var talkT0=0;
  function loop(ts){raf=0;if(!vis())return;var t=(ts-t0)/1000;frame(t);if(!isCalm())raf=requestAnimationFrame(loop);}
  function vis(){var sm=$('scr-map');return !!(sm&&sm.classList.contains('on')&&cv&&document.documentElement.classList.contains('gbv'));}
  function placeSay(){var e=$('vwSay');if(!e||!R)return;e.textContent=line;
    var right=R.valya.x+R.valya.s*.22,top=R.valya.y-R.valya.s*1.02;
    e.style.left=Math.round(Math.min(right,R.w-170))+'px';e.style.top=Math.round(Math.max(R.wallTop+6,top-e.offsetHeight*.5))+'px';e.style.maxWidth=Math.round(Math.max(130,R.w-right-12))+'px';}
  H.say=function(txt){line=txt||dayLine();talkT0=(performance.now()-t0)/1000;placeSay();if(isCalm()||!raf)loop(performance.now());};
  H.show=function(){var box=$('vwHallBox');cv=$('vwHallCv');if(!box||!cv)return;var r=box.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height);if(w<40||h<40)return;
    dpr=Math.min(2,window.devicePixelRatio||1);var pc=document.documentElement.classList.contains('gbv-pc');
    var s=S_(),key=[w,h,dpr,pc,JSON.stringify(s&&s.decor||{}),GB.lvInfo(s?Math.max(0,s.unlocked-1):0).col,signText(),GB.hallLayers.length,
      window.GBM&&GBM.depList?JSON.stringify(GB.safe('dl',function(){return GBM.depList();})||[]):'',(GB._scr.back&&!GB._scr.back.stub)?1:0,udarnik()?1:0,flagImg()?1:0,typeof LANG!=='undefined'?LANG:''].join('|');
    if(key!==lastKey||!bg){lastKey=key;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';g=cv.getContext('2d');
      R=geo(w,h,pc);R.col=GB.lvInfo(s?Math.max(0,s.unlocked-1):0).col;R.anim=!isCalm();GB.safe('hall:build',buildBg);}
    if(!t0)t0=performance.now();if(!line)line=dayLine();placeSay();
    if(!raf)raf=requestAnimationFrame(loop);};
  GB.hallRedraw=function(){lastKey='';if(vis())H.show();};
  GB.on('artdep',function(){GB.hallRedraw();}); // ART дорисовал отдел — перерисовать стену
  H.geo=function(){return R;};
  // нажатия: Валя — новая реплика, отдел — событие для META, дверь — «Подсобка»
  document.addEventListener('click',function(e){var c=$('vwHallCv');if(!c||e.target!==c||!R)return;var r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    if(R.doorOn&&x>R.door.x&&x<R.door.x+R.door.w&&y>R.door.y&&y<R.door.y+R.door.h){if(typeof SND!=='undefined')SND.tap();GB.go('back');return;}
    for(var i=0;i<(R.deps||[]).length;i++){var d=R.deps[i];if(x>d.x&&x<d.x+d.w&&y>d.y-d.h*.16&&y<d.y+d.h){GB.emit('hall',{id:d.id});return;}}
    if(Math.abs(x-R.valya.x)<R.valya.s*.35&&y>R.valya.y-R.valya.s*1.1){talkT=(talkT+1)%DAY.length;H.say();GB.emit('hall',{id:'valya'});}});
})();
