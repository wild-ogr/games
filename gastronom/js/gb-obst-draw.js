'use strict';
/* ================= gb-obst-draw — помехи на витрине: рисунки, подсказки тёти Вали, ввод (поток OBST, ветка gb-obst) =================
   Правила — js/gb-obst-rules.js (GBOB, без DOM). Здесь — только вид и ввод, всё обёртками функций игры (index.html не правим):
     drawCell  — обёртка (серая обёртка «тайного товара» в задних рядах, мешок картошки, кот Пломбир на товаре);
     render    — поверх витрины: табличка «Обед/Учёт», замок «Для своих» с товаром-ключом, иней холодильника, весы, подвоз (машина),
                 уборщица со шваброй у мокрой полки; у склочного покупателя — красный значок;
     tryMove   — запрет хода (закрыто/заперто/мокро/холодильник) с репликой Вали; pointerdown (захват на #stage) — мешок, кот, закрытая полка;
     afterMove — события помех (открылось, замок, грузчик, кот, машина пришла, бутылки сданы +монета);
     doMix/canMix — «Смешать» не трогает закрытые полки и холодильник; startHook — подсказка Вали при первой встрече (S.tips.ob_<key>),
                 мама с малышом помехи 11 (G.vetId; до 10.10 — ветеран).
   Тексты — по-русски (TEXT: GBT.say('ob.<code>.hint') если есть); английский — window.GB_EN['рус'] (нет перевода → в ?lang=en молчим).
   Стеклотара: рисунок GOOD_DRAW[199]; +монета за сданную тройку — GBECO.obst.bottle (нет — 1), источник ern('glass').
   Стенд (только localhost): ?demo=N&ob=<id[,id]>&obp=<1–3> — уровень N с помехой (GBOB.demo).
   Флаг всего модуля: GB.flag('obst') — выключен → уровни с помехами всё равно играются (правила в LOGIC), но без рисунков и подсказок.
*/
(function(){
  if(typeof GBOB==='undefined'||typeof window==='undefined')return;
  if(window.GB&&GB.flag&&!GB.flag('obst'))return;
  var NEW=GBOB.NEW,KM=15<<17,CM=15<<21;
  // коды TEXT (content/texts/union.json → ob[]) по номерам помех
  var CODE={1:'obed',2:'ubor',3:'zamok',4:'steklo',5:'meshok',6:'vesy',7:'podvoz',8:'tain',9:'holod',10:'sklok',11:'mama',12:'kot'};
  var LINES={
    deny:{1:['Я на обеде! Подождите немножко.','Закрыто на учёт! Пару ходов.'],2:['Куда по мытому!','Не топчите, только помыла!'],
      3:['Это для своих! Сначала тройку с замка.'],9:['Не ставьте в холодильник что попало! Только молочное и мясное.']},
    open:['Всё, пообедала — подходите!','Учёт закончен, полка открыта!'],
    unlock:['Ну раз вы свой — открываю!','Для своих — пожалуйста!'],
    sack:['Грузчики мешок унесли!','Мешок убрали — места больше!'],
    steal:['Пломбир, брысь! Положи на место!','Пломбир опять за колбасой!'],
    cat:['Отдал! Пломбир, кыш с прилавка!','Вот так-то, Пломбир!'],
    arrive:['Машина пришла! Разгружаем!','Подвоз! Ставлю на свободные места.'],
    bottle:['Стеклотару сдали — копеечка в кассу!'],
    scold:['Я сорок лет в очереди стою!','А почему у вас этого нет на витрине?!','Безобразие! Где жалобная книга?'],
    sackT:'Мешок не сдвинуть — соберите рядом тройку, грузчик унесёт.',catT:'Товар у Пломбира — соберите рядом тройку, он бросит.',
    closedT:'Полка закрыта на обед — ещё ',lockT:'Полка «для своих» — соберите тройку товара с замка.',wetT:'Куда по мытому! Ещё ',
    sign:['ОБЕД','УЧЁТ'],scaleT:'на развес'};
  function en(ru){var d=window.GB_EN;return d&&d[ru]||'';}
  function tx(ru){return typeof L==='function'?L(ru,en(ru)):ru;}
  function pk(a){return a[Math.floor(Math.random()*a.length)];}
  function lv(){return typeof G!=='undefined'&&G&&G.lv&&G.lv.ob?G.lv:null;}
  function valya(ru){var t=tx(ru);if(t&&typeof say==='function')say(t,'valya');}
  function plain(c){return c>=NEW?c&~(KM|CM):c;}

  /* ---- стеклотара: пустая бутылка из-под кефира, зелёное стекло ---- */
  if(typeof GOOD_DRAW!=='undefined'&&!GOOD_DRAW[GBOB.BOTTLE])GOOD_DRAW[GBOB.BOTTLE]=function(g,cx,by,u){shadowE(g,cx,by,22*u,u);
    bottle(g,cx,by,38*u,86*u,24*u,12*u,16*u,'rgba(90,150,90,.25)',6*u);
    g.strokeStyle='rgba(60,120,70,.75)';g.lineWidth=2*u;rrect(g,cx-12*u,by-86*u,24*u,6*u,2*u);g.stroke();
    g.fillStyle='rgba(110,170,110,.28)';rrect(g,cx-19*u,by-60*u,38*u,58*u,6*u);g.fill();};

  /* ---- рисунки на холсте ---- */
  function parcel(g,x,by,s){var u=s/100;shadowE(g,x,by,30*u,u);rrect(g,x-30*u,by-62*u,60*u,62*u,8*u);g.fillStyle=lin(g,0,by-62*u,0,by,['#b9b2a3','#9a927f']);g.fill();
    g.strokeStyle='rgba(70,60,45,.45)';g.lineWidth=2*u;g.stroke();g.strokeStyle='#7a5a32';g.lineWidth=3*u;g.beginPath();g.moveTo(x,by-62*u);g.lineTo(x,by);g.moveTo(x-30*u,by-30*u);g.lineTo(x+30*u,by-30*u);g.stroke();
    g.fillStyle='rgba(60,50,35,.7)';g.font='900 '+Math.round(26*u)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText('?',x+15*u,by-46*u);}
  function sack(g,x,by,s,n,dim){var u=s/100,w=150*u,h=74*u,x0=x-w/2;shadowE(g,x,by,w*.45,u);
    g.beginPath();g.moveTo(x0+8*u,by);g.quadraticCurveTo(x0-6*u,by-h*.5,x0+14*u,by-h*.92);g.lineTo(x0+w*.3,by-h);g.quadraticCurveTo(x,by-h*1.12,x0+w*.7,by-h);
    g.lineTo(x0+w-14*u,by-h*.92);g.quadraticCurveTo(x0+w+6*u,by-h*.5,x0+w-8*u,by);g.closePath();g.fillStyle=lin(g,0,by-h,0,by,dim?['#9b8660','#7a6644']:['#d8bf8a','#b39463']);g.fill();
    g.strokeStyle='rgba(90,65,30,.5)';g.lineWidth=2*u;g.stroke();g.strokeStyle='rgba(120,90,50,.35)';g.lineWidth=1.2*u;
    for(var k=1;k<6;k++){g.beginPath();g.moveTo(x0+k*w/6,by-h*.95);g.lineTo(x0+k*w/6+4*u,by-2*u);g.stroke();}
    g.strokeStyle='#8a6a3a';g.lineWidth=4*u;g.beginPath();g.moveTo(x-22*u,by-h*.98);g.quadraticCurveTo(x,by-h*1.06,x+22*u,by-h*.98);g.stroke();
    ell(g,x-34*u,by-h*.45,9*u,7*u,'#b07b45');ell(g,x+30*u,by-h*.38,8*u,6*u,'#a8743f');
    if(!dim){rrect(g,x-17*u,by-h*.62,34*u,24*u,5*u);g.fillStyle='#fffaf0';g.fill();g.strokeStyle='#8a6a3a';g.lineWidth=1.5*u;g.stroke();
      g.fillStyle='#7a2a05';g.font='900 '+Math.round(17*u)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText('×'+n,x,by-h*.5);}}
  function catOn(g,x,by,s,t){var u=s/100;if(window.PLOMBIR&&PLOMBIR.draw){try{PLOMBIR.draw(g,x+6*u,by+2*u,s*.78,t===9||t===27||t===45?'grab':'sneak',typeof tk!=='undefined'?tk:0,{});return;}catch(e){}}
    drawCat(g,x+10*u,by-4*u,s*.7);}
  function padlock(g,x,y,s){var u=s/100;g.strokeStyle='#8d959a';g.lineWidth=7*u;g.beginPath();g.arc(x,y-10*u,14*u,Math.PI,0);g.stroke();
    rrect(g,x-20*u,y-12*u,40*u,32*u,6*u);g.fillStyle=lin(g,0,y-12*u,0,y+20*u,['#f0c64a','#b8862b']);g.fill();g.strokeStyle='rgba(90,60,10,.6)';g.lineWidth=1.5*u;g.stroke();
    ell(g,x,y+2*u,4*u,4*u,'#5a3a10');g.fillStyle='#5a3a10';g.fillRect(x-1.5*u,y+2*u,3*u,9*u);}
  function lady(g,x,by,h,t){var u=h/100,sw=t?Math.sin(t*3)*4*u:0;g.save();g.lineCap='round';
    g.strokeStyle='#7a5a32';g.lineWidth=3.5*u;g.beginPath();g.moveTo(x+18*u,by-62*u);g.lineTo(x+34*u+sw,by-2*u);g.stroke();
    g.fillStyle='#e8e2d0';g.fillRect(x+24*u+sw,by-6*u,22*u,6*u);
    poly(g,[x-16*u,by-58*u,x+16*u,by-58*u,x+20*u,by-4*u,x-20*u,by-4*u],'#5b7fa6');
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x-1*u,by-56*u,2*u,50*u);
    ell(g,x,by-70*u,12*u,13*u,SKIN);poly(g,[x-14*u,by-70*u,x,by-88*u,x+14*u,by-70*u,x,by-76*u],'#f4f1ea');
    g.strokeStyle='#3b2a1a';g.lineWidth=1.6*u;g.beginPath();g.arc(x-4*u,by-70*u,1.6*u,0,6.3);g.arc(x+4*u,by-70*u,1.6*u,0,6.3);g.stroke();
    g.beginPath();g.arc(x,by-64*u,4*u,.2*Math.PI,.8*Math.PI);g.stroke();
    rrect(g,x-34*u,by-20*u,18*u,20*u,3*u);g.fillStyle='#8aa0ad';g.fill();g.strokeStyle='#5a6a72';g.lineWidth=1.5*u;g.stroke();g.restore();}
  function truck(g,x,by,s){var u=s/100;rrect(g,x-30*u,by-30*u,40*u,24*u,3*u);g.fillStyle='#2e7d32';g.fill();rrect(g,x+10*u,by-24*u,18*u,18*u,3*u);g.fillStyle='#c0392b';g.fill();
    g.fillStyle='#bfe3f2';g.fillRect(x+14*u,by-21*u,10*u,7*u);ell(g,x-18*u,by-5*u,6*u,6*u,'#222');ell(g,x+18*u,by-5*u,6*u,6*u,'#222');}
  function badge(g,x,y,r,txt,bg){ell(g,x,y,r,r,bg||'#b3261e');g.strokeStyle='#fff';g.lineWidth=Math.max(1.5,r*.18);g.stroke();
    g.fillStyle='#fff';g.font='900 '+Math.round(r*1.15)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText(String(txt),x,y+r*.05);}

  /* ---- обёртка drawCell: обёртка/мешок/кот ---- */
  var dc0=window.drawCell;
  if(dc0)window.drawCell=function(c,x,by,sc,dim){if(!(c>=NEW)||!lv()||G.st.x)return dc0(plain(c),x,by,sc,dim);var k=GBOB.kind(c),s=U*sc;
    if(k===GBOB.WRAP){if(dim){parcel(ctx,x,by,s);return;}return dc0(plain(c),x,by,sc,dim);}
    if(k===GBOB.SACK){if(GBOB.cnt(c)&8)return;sack(ctx,x+U*sc/2,by,s,GBOB.cnt(c)&7,dim);return;}
    if(k===GBOB.CAT){dc0(plain(c),x,by,sc,dim);catOn(ctx,x,by,s,c&255);return;}
    return dc0(plain(c),x,by,sc,dim);};

  /* ---- обёртка render: таблички и фигуры поверх витрины ---- */
  var r0=window.render;
  if(r0)window.render=function(){r0.apply(this,arguments);var l=lv();if(!l||!G.units||!HALL)return;try{overlay(l);}catch(e){}};
  function overlay(l){var st=G.st,g=ctx,t=calm()?0:tk;
    for(var i=0;i<l.S&&i<G.units.length;i++){var o=GBOB.shelfState(l,st,i);if(!o)continue;var un=G.units[i],top=un.pt-U*1.05,cx=un.x+un.w/2;
      if(o.fridge&&!st.x){g.fillStyle='rgba(185,225,250,.22)';g.fillRect(un.x,top,un.w,un.pt-top);g.fillStyle='rgba(255,255,255,.85)';
        for(var k=0;k<un.w/(U*.25);k++){var ix=un.x+k*U*.25+U*.08;poly(g,[ix-U*.05,top,ix+U*.05,top,ix,top+U*(.1+((k*7)%3)*.04)]);g.fill();}
        g.fillStyle='rgba(40,110,170,.85)';g.font='900 '+Math.round(U*.3)+'px '+FNT;g.textAlign='left';g.textBaseline='top';g.fillText('❄',un.x+U*.06,top+U*.08);}
      if(o.scale){drawScales(g,un.x+un.w-U*.32,un.pt+U*.02,U*.55);var sTx=tx(LINES.scaleT);if(sTx){g.fillStyle='rgba(122,42,5,.9)';g.font='800 '+Math.round(U*.17)+'px '+FNT;g.textAlign='right';g.textBaseline='bottom';g.fillText(sTx,un.x+un.w-U*.05,top+U*.24);}}
      if(o.conv!=null&&o.conv>0){truck(g,un.x+U*.42,top+U*.32,U*.55);badge(g,un.x+U*.78,top+U*.12,U*.15,Math.max(0,o.convT),'#2e7d32');}
      if(o.wet){g.fillStyle='rgba(120,190,240,.20)';g.fillRect(un.x,top,un.w,un.pt-top);g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=U*.04;
        for(var w=0;w<3;w++){var wx=un.x+un.w*(.2+.3*w);g.beginPath();g.moveTo(wx,top+U*.2);g.quadraticCurveTo(wx+U*.15,top+U*.55,wx-U*.05,un.pt-U*.1);g.stroke();}
        lady(g,un.x-U*.05,un.pt+U*.1,U*1.0,t);badge(g,un.x+un.w-U*.18,top+U*.15,U*.15,o.wet,'#1f5f99');}
      if(o.obed){g.fillStyle='rgba(40,25,10,.35)';g.fillRect(un.x,top,un.w,un.pt-top);var sw2=Math.min(un.w*.86,U*2.2),sh2=U*.5,sx=cx-sw2/2,sy=top+U*.25;
        g.strokeStyle='#5a3a2a';g.lineWidth=1.5;g.beginPath();g.moveTo(cx-sw2*.3,top);g.lineTo(cx-sw2*.25,sy);g.moveTo(cx+sw2*.3,top);g.lineTo(cx+sw2*.25,sy);g.stroke();
        rrect(g,sx,sy,sw2,sh2,U*.08);g.fillStyle='#fffaf0';g.fill();g.strokeStyle='#b3261e';g.lineWidth=U*.05;g.stroke();
        var sg=tx(LINES.sign[o.v?1:0]);g.fillStyle='#b3261e';g.font='900 '+Math.round(U*.3)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';
        g.fillText(sg?sg+' · '+o.obed:'🕐 '+o.obed,cx,sy+sh2/2+1);}
      if(o.lock){g.fillStyle='rgba(40,25,10,.32)';g.fillRect(un.x,top,un.w,un.pt-top);padlock(g,cx-U*.32,top+U*.5,U*.9);
        var sp=SPR[o.lock];rrect(g,cx+U*.02,top+U*.18,U*.62,U*.62,U*.12);g.fillStyle='#fffaf0';g.fill();g.strokeStyle='#b8862b';g.lineWidth=U*.04;g.stroke();
        if(sp)g.drawImage(sp.c,cx+U*.06,top+U*.21,U*.54,U*.54*sp.c.height/sp.c.width);}}
    // склочный покупатель — красный значок над головой
    if(G.queue&&G.q)for(var q=0;q<G.queue.length;q++){var c=G.queue[q];if(c.st!=='wait'&&c.st!=='in')continue;var v=null;for(var j=0;j<G.q.vis.length;j++)if(G.q.vis[j].id===c.id)v=G.q.vis[j];
      if(v&&v.sk){var by=HALL.y+HALL.base-HALL.ph*1.02;badge(g,c.x-HALL.ph*.22,by,Math.max(8,HALL.ph*.07),'!','#c0392b');}}}

  /* ---- ход: запреты ---- */
  function denyWhy(l,a,sa,b){var m=GBOB.masks(l,G.st),c=G.st.F[a][sa],o;
    for(var side=0;side<2;side++){var i=side?b:a;o=GBOB.shelfState(l,G.st,i)||{};
      if((side?m.np[i]:m.nt[i])){if(o.obed)return {id:1,v:o.v};if(o.wet)return {id:2};if(o.lock)return {id:3};}}
    if(m.fr[b]&&!GBOB.isCold(c&255))return {id:9};return null;}
  var tm0=window.tryMove;
  if(tm0)window.tryMove=function(a,sa,b,sb,from){var l=lv();if(l&&!G.st.x){var w=denyWhy(l,a,sa,b);if(w){var d=LINES.deny[w.id];valya(w.id===1?d[w.v?1:0]:pk(d));try{SND.bad();}catch(e){}return false;}}
    return tm0.apply(this,arguments);};
  // нажатие на мешок / кота / закрытую полку — объяснение (до обработчика холста)
  var stg=document.getElementById('stage');
  if(stg)stg.addEventListener('pointerdown',function(e){var l=lv();if(!l||G.over||G.st.x||typeof modalOn!=='undefined'&&modalOn||paused)return;if(e.target!==cv)return;
    var p=cvPos(e),h=hitSlot(p.x,p.y);if(!h)return;var c=G.st.F[h.i][h.k],o=GBOB.shelfState(l,G.st,h.i)||{},msg='';
    if(c>=NEW&&GBOB.kind(c)===GBOB.SACK)msg=tx(LINES.sackT);else if(c>=NEW&&GBOB.kind(c)===GBOB.CAT)msg=tx(LINES.catT);
    else if(c&&o.obed)msg=tx(LINES.closedT)+o.obed+' '+pl(o.obed,'ход','хода','ходов','move','moves');
    else if(c&&o.wet)msg=tx(LINES.wetT)+o.wet+' '+pl(o.wet,'ход','хода','ходов','move','moves');
    else if(c&&o.lock)msg=tx(LINES.lockT);else return;
    e.stopPropagation();if(msg)toast(msg);try{SND.bad();}catch(er){}},true);

  /* ---- события хода ---- */
  var am0=window.afterMove;
  if(am0)window.afterMove=function(ev,delay,isMove){var l=lv();if(l&&ev)try{events(l,ev,delay||0);}catch(e){}return am0.apply(this,arguments);};
  function events(l,ev,d){var line=null,coins=0;
    for(var k=0;k<ev.length;k++){var e=ev[k];
      if(e.k==='clear'&&e.t===GBOB.BOTTLE){coins++;line=line||pk(LINES.bottle);}
      if(e.k!=='ob')continue;
      if(e.a==='open')line=pk(LINES.open);else if(e.a==='unlock'){line=pk(LINES.unlock);later(function(){try{SND.box();}catch(x){}},(d+.15)*1000);}
      else if(e.a==='sack'){line=pk(LINES.sack);G.opens.push({i:e.i,s:e.s,t:-(d+.15)});}
      else if(e.a==='steal'){line=pk(LINES.steal);}else if(e.a==='cat'){line=pk(LINES.cat);}
      else if(e.a==='arrive'){line=line||pk(LINES.arrive);if(G.units[e.i])flyItem(e.c,slotX(e.i,e.s),G.units[e.i].pt-U*2.2,e.i,e.s,.45);}}
    if(coins){var per=(window.GBECO&&GBECO.obst&&GBECO.obst.bottle)||1,n=coins*per;S.coins+=ern('glass',n);updCoins();save();}
    if(line){var ln=line;later(function(){if(G&&!G.speech)valya(ln);},(d+.5)*1000);}}

  /* ---- «Смешать»: закрытые полки и холодильник не трогаем ---- */
  function mixPos(l){var st=G.st,m=GBOB.masks(l,st),pos=[];for(var i=0;i<l.S;i++){if(m.nt[i]||m.np[i]||m.fr[i])continue;for(var s=0;s<3;s++)if(movable(st,st.F[i][s]))pos.push([i,s]);}return pos;}
  var cm0=window.canMix;if(cm0)window.canMix=function(){var l=lv();if(!l||G.st.x)return cm0.apply(this,arguments);return mixPos(l).length>=2;};
  var dm0=window.doMix;
  if(dm0)window.doMix=function(){var l=lv();if(!l||G.st.x)return dm0.apply(this,arguments);var st=G.st,pos=mixPos(l),items=pos.map(function(p){return st.F[p[0]][p[1]];});
    if(items.length<2){toast(L('Перемешивать нечего','Nothing to shuffle'));return;}
    var R=rng(Date.now()),best=null;
    for(var k=0;k<30;k++){shuffle(items,R);var t=cloneSt(st);pos.forEach(function(p,j){t.F[p[0]][p[1]]=items[j];});var tt=cloneSt(t);settle(l,tt,l.sh.map(function(_,j){return j;}));
      best=items.slice();if(tt.n===0||solveFast(l,tt,R,null,6,4000))break;}
    G.undo=[];var old=pos.map(function(p){return {x:slotX(p[0],p[1]),y:G.units[p[0]].pt};});
    pos.forEach(function(p,j){st.F[p[0]][p[1]]=best[j];});
    var ev=[];settle(l,st,l.sh.map(function(_,j){return j;}),ev);
    pos.forEach(function(p,j){var o=old[(j*7+3)%old.length];flyItem(best[j],o.x,o.y,p[0],p[1],.35);});
    for(var e=0;e<ev.length;e++)if(ev[e].k==='clear')for(var s=0;s<3;s++)delete G.hide[ev[e].i+':'+s];
    SND.adv();afterMove(ev,.4,false);updUndo();};

  /* ---- склочный: реплика при появлении ---- */
  var sq0=window.syncQueue;
  if(sq0)window.syncQueue=function(first){var r=sq0.apply(this,arguments),l=lv();if(!l)return r;
    for(var k=0;k<G.q.vis.length;k++){var v=G.q.vis[k];if(!v.sk)continue;for(var j=0;j<G.queue.length;j++){var c=G.queue[j];
      if(c.id===v.id&&!c.obSk){c.obSk=1;(function(cc){later(function(){var t=tx(pk(LINES.scold));if(t&&(cc.st==='wait'||cc.st==='in'))say(t,cc);},first?3400:1600);})(c);}}}
    return r;};

  /* ---- начало уровня: мама с малышом, подсказка при первой встрече ---- */
  function tipFor(id){var tt='',code=CODE[id];try{if(window.GBT&&GBT.say){var x=GBT.say('ob.'+code+'.hint'+(id==11?',ob.veteran.hint':''));/* gb-MERGE: у TEXT помеха 11 пока под кодом veteran (текст — про маму) */if(typeof x==='string')tt=x;}}catch(e){}
    if(!tt)tt=GBOB.T[id].tip;return tt;}
  if(window.GB&&GB.startHook)GB.startHook.push(function(){var l=lv();if(!l||typeof S==='undefined')return;
    var vet=GBOB.has(l,11);if(vet&&!G.daily){G.vetId=vet.v;var c=null;for(var j=0;j<G.queue.length;j++)if(G.queue[j].id===vet.v)c=G.queue[j];if(c)c.kind='mama';syncQueue();}
    if(!S.tips||typeof S.tips!=='object')return;var add=[];
    for(var k=0;k<l.ob.length;k++){var id=l.ob[k].id,key='ob_'+GBOB.T[id].key;if(S.tips[key])continue;var ru=tipFor(id),e=en(ru);if(LANG==='en'&&!e)continue;S.tips[key]=1;add.push([ru,e]);}
    if(!add.length)return;save();
    setTimeout(function(){if(!G||!G.tipQ)return;for(var i=0;i<add.length;i++)G.tipQ.push(add[i]);if(!G.tipOn)nextTip();},0);});

  /* ---- стенд: ?demo=N&ob=<id[,id]>&obp=<1–3> (только localhost) ---- */
  var mOb=/[?&]ob=([\d,]+)/.exec(location.search);
  if(mOb&&typeof IS_LOCAL!=='undefined'&&IS_LOCAL&&window.GB){var ids=mOb[1].split(',').map(Number),mp=/[?&]obp=(\d)/.exec(location.search),pw=mp?+mp[1]:1,cache={};
    GB.on('ready',function(){var lf0=window.levelFor;window.levelFor=function(i,daily){if(daily)return lf0.apply(this,arguments);
        if(!cache[i])cache[i]=GBOB.demo(i,levelSeed(i)+77,ids,pw,levelParams(i).rare?i%NRARE:-1)||lf0(i,daily);return cache[i];};
      window.__obStand=1;if(G&&!G.daily)startLevel(G.idx);});}
})();
