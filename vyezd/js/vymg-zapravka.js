'use strict';
/* vy-mgc · мини-игра №12 «Заправка „до краёв“» (ведущий — Толик). Договор — шапка js/vymg-core.js; набор — js/vymg-mgckit.js (VYC); машины — VYCARS (ART), иначе VYMG.art.car.
   Соседи подъезжают к колонке: «залей 20 литров», «на 4 рубля», «до краёв!». Держишь пистолет (кнопка/Пробел) — литры бегут, напор растёт;
   отпустил — колонка встала. Не долил — можно «долить по капле» (медленно, но тогда за точность не больше 2). Потом — сдача без калькулятора (3 варианта).
   3 машины; очки за машину: точность 0–3 (±0,3 л — 3, ±1 — 2, ±2,5 — 1; перелил «до краёв» — не больше 2) + 1 за верную сдачу. Всего до 12; ступени 5/8/10. */
(function(){if(typeof VYMG_REG!=='function'||!window.VYC)return;
var K=window.VYC,ID='zapravka',N=3,CUT=[5,8,10],VMAX=5,VCALM=3,VDRIP=1.5,RAMP=.55,LAG=.06;
var T=function(a,b){return K.L(a,b);};
var GR={76:{n:'А-76',ne:'A-76',p:40,col:'#e8b84a'},93:{n:'АИ-93',ne:'AI-93',p:50,col:'#d9534f'}};
var NOTES=[1,3,5,10,25];
var CARS=['kopeyka','moskvich','zapor','volga','niva','oka','devyatka','shesterka','taxi','pobeda'];
var OWN=[{n:'Михалыч',e:'Mikhalych'},{n:'Дед Митяй',e:'Grandpa Mityai'},{n:'Валерка с папой',e:'Valerka and his dad'},{n:'Сосед с пятого',e:'The neighbour from the 5th floor'},{n:'Почтальонша Галя',e:'Galya the postwoman'},{n:'Таксист Гена',e:'Gena the cabbie'}];
function gn(g){return T(GR[g].n,GR[g].ne);}
function money(k){k=Math.round(k);var r=Math.floor(k/100),c=k%100;return (r?r+T(' р.',' rub'):'')+(r&&c?' ':'')+(c||!r?c+T(' к.',' kop'):'');}
function plan(R){var cs=K.shuffle(CARS,R),own=K.shuffle(OWN,R),out=[];
  var L1=K.pick([10,15,20,25,30],R),R2=K.pick([3,4,6],R),cap=K.pick([39,40,45],R),cur=Math.round((4+R()*9)*10)/10;
  out.push({k:'l',gr:76,tgt:L1,txt:T('Залей ровно <b>'+L1+' литров</b>!','Pour exactly <b>'+L1+' litres</b>!'),ask:T('«'+L1+' литров, да поровнее!»','“'+L1+' litres, nice and exact!”')});
  out.push({k:'r',gr:93,tgt:R2*100/GR[93].p,rub:R2,txt:T('Залей <b>на '+R2+' рубля</b> — по счётчику «РУБ.»!','Pour <b>'+R2+' roubles’ worth</b> — watch the “RUB” counter!'),ask:T('«На '+R2+' рубля, пожалуйста!»','“'+R2+' roubles’ worth, please!”')});
  out.push({k:'f',gr:76,tgt:Math.round((cap-cur)*10)/10,cap:cap,cur:cur,txt:T('Залей <b>до краёв</b> — следи за стрелкой бака!','Fill it <b>to the brim</b> — watch the fuel needle!'),ask:T('«До краёв! Только не перелей…»','“Fill her up! Just don’t spill…”')});
  out.forEach(function(r,i){r.car=cs[i];r.own={n:T(own[i].n,own[i].e)};});return out;}
function acc(d,k,drip){var a=Math.abs(d),p=a<=.3?3:a<=1?2:a<=2.5?1:0;if(k==='f'&&d>.05)p=Math.min(p,2);if(k==='f'&&d>1)p=0;if(drip)p=Math.min(p,2);return p;}
/* сдача: заплачено — ближайшая купюра больше суммы (иногда следующая — интереснее считать) */
function change(cost,R){var i=0;while(i<NOTES.length&&NOTES[i]*100<cost+1)i++;if(i<NOTES.length-1&&R()<.4)i++;var paid=NOTES[Math.min(i,NOTES.length-1)]*100,ch=paid-cost;
  var w=[ch+100,ch-100,ch+10,ch-10,ch+50,ch-50,ch+20].filter(function(x){return x>=0&&x!==ch;});w=K.shuffle(w,R).slice(0,2);return {paid:paid,ch:ch,opts:K.shuffle([ch].concat(w),R)};}

function run(host,o){var R=o.rnd||Math.random,calm=K.calm(o),vmax=calm?VCALM:VMAX,rs=plan(R);
  var f=K.frame(host,o,{who:'tolik'}),C=K.canvas(f.main),ctx=C.ctx;
  var st={i:0,ph:'wait',lit:0,v:0,hold:false,drip:false,dripUsed:false,rel:0,res:[],score:0,fin:false,t:0,spill:0,foam:0,rs:rs};window.__vyc_zapravka=st;
  function cur(){return rs[st.i];}
  function img(id){return window.VYCARS&&VYCARS.img?VYCARS.img(id,{view:'side',state:'new'}):null;}
  rs.forEach(function(r){img(r.car);});
  var bHold=K.btn(T('⛽ Держи','⛽ Hold')+K.kc(T('Пробел','Space'),host),'acc');bHold.style.cssText='flex:1;max-width:420px;min-height:64px;font-size:20px';
  function down(e){if(e)e.preventDefault();press(true);}function up(e){if(e)e.preventDefault();press(false);}
  bHold.addEventListener('pointerdown',down);bHold.addEventListener('pointerup',up);bHold.addEventListener('pointercancel',up);bHold.addEventListener('pointerleave',function(){if(st.hold)press(false);});
  bHold.addEventListener('contextmenu',function(e){e.preventDefault();});
  /* ---- шаги ---- */
  function startCar(){var r=cur();st.ph='pour';st.lit=0;st.v=0;st.hold=false;st.drip=false;st.dripUsed=false;st.rel=0;st.spill=0;st.foam=0;st.driveIn=calm?0:1;
    f.prog(N,st.i,st.res);if(host.top)host.top(T('Машина ','Car ')+(st.i+1)+T(' из ',' of ')+N);
    f.say(r.own.n+': '+r.ask+'<br>'+r.txt,'norm');f.foot.innerHTML='';bHold.innerHTML=T('⛽ Держи','⛽ Hold')+K.kc(T('Пробел','Space'),host);bHold.disabled=false;f.foot.appendChild(bHold);}
  function press(on){if(st.ph!=='pour'&&st.ph!=='drip')return;if(host.paused&&on)return;
    if(on){if(st.hold)return;if(st.ph==='pour'&&st.rel)return;st.hold=true;bHold.classList.add('on');K.snd(host,'tap');}
    else{if(!st.hold)return;st.hold=false;bHold.classList.remove('on');st.rel=1;st.relT=0;}}
  function afterRelease(){var r=cur(),d=st.lit-r.tgt;
    if(st.ph==='drip'||d>=-.05||r.k==='f'&&st.lit>=r.tgt){judge();return;}
    st.ph='choice';f.foot.innerHTML='';
    var bOk=K.btn(T('✓ Хватит','✓ Enough')+K.kc('Enter',host),'acc',judge),bDr=K.btn(T('💧 Долить по капле','💧 Top up drop by drop')+K.kc('1',host)+T('<small>за точность — не больше ★★</small>','<small>accuracy — ★★ at most</small>'),'',dripMode);
    bDr.style.flex=bOk.style.flex='1';f.foot.appendChild(bDr);f.foot.appendChild(bOk);
    f.say(T('Встала колонка. Хватит — или долить по капле?','The pump stopped. Enough — or top up drop by drop?'),'norm');}
  function dripMode(){if(st.ph!=='choice')return;st.ph='drip';st.drip=true;st.dripUsed=true;st.rel=0;f.foot.innerHTML='';bHold.innerHTML=T('💧 Держи — по капле','💧 Hold — drop by drop')+K.kc(T('Пробел','Space'),host);f.foot.appendChild(bHold);
    f.say(T('По капельке… Держи и отпускай вовремя.','Drop by drop… Hold and let go in time.'),'norm');}
  function judge(){if(st.ph==='judge'||st.ph==='change'||st.ph==='done')return;var r=cur(),d=st.lit-r.tgt,p=acc(d,r.k,st.dripUsed);st.ph='judge';st.acc=p;st.d=d;
        var amt=r.k==='r'?money(Math.abs(d)*GR[r.gr].p):T((Math.round(Math.abs(d)*10)/10).toString().replace('.',',')+' л',(Math.round(Math.abs(d)*10)/10)+' L');
    var txt=Math.abs(d)<=.05?T('Ровно! Тютелька в тютельку!','Exactly! Spot on!'):(d>0?T('Перелил на '+amt,'Over by '+amt):T('Недолил '+amt,'Short by '+amt));
    if(r.k==='f'&&d>.05)txt=T('Ой, плеснул через край! Ладно, тряпкой вытрем.','Oops, it spilled over! Never mind, we’ll wipe it.');
    K.snd(host,p>=2?'right':p?'tap':'wrong');K.buzz(p>=2?15:30);
    f.say(txt+(p===3?T(' Мастер!',' Master!'):p===2?T(' Неплохо!',' Not bad!'):p===1?T(' Ну, почти.',' Almost.'):''),p>=2?'happy':p?'norm':'sad');
    setTimeout(function(){if(!st.fin)changeQ();},calm?400:1000);}
  function changeQ(){var r=cur(),cost=Math.round(st.lit*GR[r.gr].p);if(cost<1)cost=1;var ch=change(cost,R);st.ch=ch;st.cost=cost;st.ph='change';
    f.say(T('С тебя <b>'+money(cost)+'</b> — '+r.own.n+' даёт <b>'+(ch.paid/100)+' р.</b> Сколько сдачи?','That’s <b>'+money(cost)+'</b> — '+r.own.n+' pays <b>'+(ch.paid/100)+' rub</b>. How much change?'),'norm');
    f.foot.innerHTML='';var g=document.createElement('div');g.className='vyc-opts';g.style.gridTemplateColumns='1fr 1fr 1fr';
    ch.opts.forEach(function(v,k){var b=K.btn(money(v)+K.kc(String(k+1),host),'',function(){chAns(k);});b.setAttribute('data-k',k);g.appendChild(b);});f.foot.appendChild(g);}
  function chAns(k){if(st.ph!=='change'||host.paused)return;var r=cur(),v=st.ch.opts[k],ok=v===st.ch.ch,p=st.acc+(ok?1:0);st.ph='done';
    st.res.push(p);(st.accs=st.accs||[]).push(st.acc);st.score+=p;f.foot.querySelectorAll('.vyc-b').forEach(function(b,j){b.disabled=true;b.style.opacity='1';if(st.ch.opts[j]===st.ch.ch)b.classList.add('ok');else if(j===k)b.classList.add('no');});
    K.snd(host,ok?'coin':'wrong');f.prog(N,-1,st.res.map(function(x){return Math.min(3,x);}));
    f.say(ok?T('Верно, сдача — '+money(st.ch.ch)+' Счастливого пути!','Right, the change is '+money(st.ch.ch)+'. Safe travels!'):T('Нет, сдача — '+money(st.ch.ch)+' ('+(st.ch.paid/100)+' р. минус '+money(st.cost)+')','No, the change is '+money(st.ch.ch)+' ('+(st.ch.paid/100)+' rub minus '+money(st.cost)+')'),ok?'happy':'sad');
    var last=st.i>=N-1;setTimeout(function(){if(st.fin)return;var w=document.createElement('div');w.style.cssText='width:100%;display:flex;justify-content:center';
      w.appendChild(K.btn((last?T('Итоги','Results'):T('Следующая машина','Next car'))+K.kc('Enter',host),'grn',next));f.foot.appendChild(w);},calm?100:500);}
  function next(){if(st.ph!=='done'||host.paused)return;if(st.i>=N-1){finish();return;}st.i++;startCar();}
  function finish(){if(st.fin)return;st.fin=true;var ex=(st.accs||[]).filter(function(x){return x>=3;}).length;
    host.done({score:st.score,tier:K.tier(st.score,CUT),label:T(st.score+' очк. из '+N*4+' · тютелька в тютельку: '+ex+' из '+N,st.score+' pts of '+N*4+' · spot on: '+ex+' of '+N),extra:{max:N*4}});}
  K.keys(host,function(k,e,d){
    if((k===' '||k==='Spacebar')&&(st.ph==='pour'||st.ph==='drip'||!d)){press(d);return true;}
    if(!d)return false;
    if(st.ph==='choice'){if(k==='Enter'||k==='2'){judge();return true;}if(k==='1'||k==='d'||k==='D'||k==='в'||k==='В'){dripMode();return true;}return k===' ';}
    if(st.ph==='change'){if(/^[1-3]$/.test(k)){chAns(+k-1);return true;}return K.optKeys(f.foot,k);}
    if(st.ph==='done'&&(k==='Enter'||k===' ')){next();return true;}return false;});
  /* ---- физика струи ---- */
  function step(dt){var r=cur();if(!r)return;if(st.driveIn>0){st.driveIn=Math.max(0,st.driveIn-dt*1.8);}
    if(st.ph==='pour'||st.ph==='drip'){var top=st.drip?VDRIP:vmax;
      if(st.hold){st.v=Math.min(top,st.v+top*dt/RAMP);}
      else if(st.rel){st.relT=(st.relT||0)+dt;st.v=Math.max(0,st.v-top*dt/LAG);if(st.v<=0&&st.relT>.25){st.rel=0;afterRelease();}}
      st.lit+=st.v*dt;
      if(r.k==='f'){var room=r.tgt-st.lit;st.foam=room<1.6?Math.min(1,(1.6-room)/1.6):0;if(st.lit>r.tgt){st.spill=Math.min(1,st.spill+(st.lit-r.tgt)*.5);}
        if(st.hold&&room<1.6&&!st._glug){st._glug=1;K.snd(host,'pick');}if(room>=1.6)st._glug=0;}}}
  /* ---- рисование ---- */
  var A=window.VYMG&&VYMG.art;
  function draw(dt,t){step(dt);st.t=t;if(C.w!==f.main.clientWidth||C.h!==f.main.clientHeight)C.fit();var c=ctx,W=C.w,H=C.h,r=cur();
    var gy=H*.84;
    var g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,'#8fd3f4');g.addColorStop(1,'#e3f4fb');c.fillStyle=g;c.fillRect(0,0,W,gy);
    if(A&&A.house)try{A.house(c,W*.55,gy-H*.18,W*.4,H*.38,{fl:5,lit:.2,seed:5});}catch(e){}
    c.fillStyle='#9cd38a';c.fillRect(0,gy-H*.18,W,H*.06);
    // навес АЗС
    var nx=W*.02,nw=Math.min(W*.96,W*.5+260);c.fillStyle='#e9ecef';c.fillRect(nx,H*.04,nw,H*.07);c.fillStyle='#d9480f';c.fillRect(nx,H*.04,nw,H*.022);
    c.fillStyle='#1d3f73';c.font='800 '+Math.max(12,H*.04)+'px Rubik,sans-serif';c.textBaseline='middle';c.fillText(T('АЗС · БЕНЗИН','FUEL · PETROL'),nx+10,H*.085);c.textBaseline='alphabetic';
    c.fillStyle='#adb5bd';c.fillRect(nx+8,H*.11,6,gy-H*.11);c.fillRect(nx+nw-14,H*.11,6,gy-H*.11);
    // асфальт
    c.fillStyle='#6c727a';c.fillRect(0,gy-H*.12,W,H);c.fillStyle='#7b828a';c.fillRect(0,gy-H*.12,W,3);
    c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=3;c.setLineDash([16,12]);c.beginPath();c.moveTo(0,gy+H*.08);c.lineTo(W,gy+H*.08);c.stroke();c.setLineDash([]);
    // колонка
    var pw=Math.max(108,Math.min(160,W*.3)),ph=Math.min(H*.72,pw*2.15),px=Math.max(10,W*.04),py=gy-ph;
    c.fillStyle='rgba(0,0,0,.2)';K.rr(c,px+5,py+6,pw,ph,12);c.fill();
    c.fillStyle=GR[r.gr].col;K.rr(c,px,py,pw,ph,12);c.fill();c.fillStyle='rgba(255,255,255,.18)';K.rr(c,px+5,py+5,pw*.18,ph-10,8);c.fill();
    c.fillStyle='#fffdf7';K.rr(c,px+pw*.12,py+ph*.04,pw*.76,ph*.12,6);c.fill();c.fillStyle='#2d3436';c.font='800 '+(pw*.17)+'px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';
    c.fillText(gn(r.gr),px+pw/2,py+ph*.1);
    // счётчики
    var rub=st.lit*GR[r.gr].p/100;counter(c,px+pw*.08,py+ph*.21,pw*.84,ph*.15,T('РУБ.','RUB'),rub,2,r.k==='r');counter(c,px+pw*.08,py+ph*.42,pw*.84,ph*.15,T('ЛИТРЫ','LITRES'),st.lit,1,r.k!=='r');
    c.fillStyle='rgba(0,0,0,.55)';c.font='600 '+(pw*.095)+'px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(T('цена '+GR[r.gr].p+' к./л',GR[r.gr].p+' kop/L'),px+pw/2,py+ph*.64);
    // заказ
    var zk=r.k==='l'?r.tgt+T(' л',' L'):r.k==='r'?T('на '+r.rub+' р.',r.rub+' rub'):T('до краёв','to the brim');c.fillStyle='#fff3bf';K.rr(c,px+pw*.1,py+ph*.70,pw*.8,ph*.11,6);c.fill();
    c.fillStyle='#2d3436';c.font='800 '+(pw*.12)+'px Rubik,sans-serif';c.fillText(zk,px+pw/2,py+ph*.755);c.textAlign='left';c.textBaseline='alphabetic';
    // машина
    var cw=Math.min(W-px-pw-30,Math.max(200,W*.6),520),ch=cw*130/300,cx=px+pw+18+(W-px-pw-28-cw)/2+st.driveIn*W*.6,cy=gy-ch*122/130;
    var im=img(r.car);c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(cx+cw/2,gy,cw*.45,6,0,0,7);c.fill();
    if(im&&im.complete&&im.naturalWidth)c.drawImage(im,cx,cy,cw,ch);else if(A&&A.car)try{A.car(c,{cx:cx+cw/2,by:gy,w:cw,col:'#c8372d',kind:'sedan'});}catch(e){}
    // горловина бака и шланг
    var nkx=cx+cw*.14,nky=cy+ch*.47;c.fillStyle='#343a40';c.beginPath();c.arc(nkx,nky,Math.max(3,cw*.012),0,7);c.fill();
    c.strokeStyle='#212529';c.lineWidth=Math.max(4,pw*.05);c.lineCap='round';c.beginPath();c.moveTo(px+pw*.92,py+ph*.88);
    c.bezierCurveTo(px+pw*1.25,gy+10,nkx-40,gy+4,nkx-8,nky+6);c.stroke();c.lineCap='butt';
    // пистолет
    c.save();c.translate(nkx-4,nky+2);c.rotate(-.5);c.fillStyle=st.hold?'#2b8a3e':'#495057';K.rr(c,-26,-6,24,12,4);c.fill();c.fillStyle='#adb5bd';c.fillRect(-4,-2,10,4);c.restore();
    // струя / пена / пролив
    if(st.v>.05&&!calm){c.fillStyle='rgba(255,220,120,.35)';for(var k=0;k<3;k++){c.beginPath();c.arc(nkx+2+Math.sin(t*20+k)*1.5,nky+2+k*2,1.5,0,7);c.fill();}}
    if(st.foam>0){c.fillStyle='rgba(255,255,240,'+(.5+.5*st.foam)+')';for(var b=0;b<5;b++){c.beginPath();c.arc(nkx+(b-2)*3,nky-2-st.foam*4+Math.sin(t*6+b)*1.2,2+st.foam*2,0,7);c.fill();}}
    if(st.spill>0){c.fillStyle='rgba(120,90,200,'+(.35*st.spill)+')';c.beginPath();c.ellipse(nkx+6,gy+2,10+st.spill*30,4+st.spill*4,0,0,7);c.fill();}
    // стрелка бака (до краёв)
    if(r.k==='f'){var gx=cx+cw*.62,gy2=Math.max(H*.2,cy-ch*.15),gr=Math.max(26,Math.min(44,cw*.08));gauge(c,gx,gy2,gr,(r.cur+st.lit)/r.cap);}
    // подсказка на первом заходе
    if(st.ph==='pour'&&st.lit<.01&&st.i===0&&!st.hold){c.fillStyle='rgba(45,52,54,.75)';var hs=K.pc(host)?T('Держи Пробел или кнопку','Hold Space or the button'):T('Держи кнопку внизу','Hold the button below');c.font='700 '+Math.max(13,Math.min(17,W/26))+'px Rubik,sans-serif';
      var hw=c.measureText(hs).width+20;K.rr(c,(W-hw)/2+pw/2,gy+H*.03,hw,28,14);c.fill();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(hs,W/2+pw/2,gy+H*.03+14);c.textAlign='left';c.textBaseline='alphabetic';}}
  function counter(c,x,y,w,h,lab,val,dec,main){c.fillStyle='#212529';K.rr(c,x,y,w,h,5);c.fill();
    c.fillStyle='rgba(255,255,255,.75)';c.font='700 '+(h*.24)+'px Rubik,sans-serif';c.textBaseline='top';c.fillText(lab,x+5,y+3);
    // барабанчики: целая часть и дробная, дробная цифра «катится»
    var s=val.toFixed(dec),parts=s.split('.'),ip=('000'+parts[0]).slice(-3),dp=parts[1]||'',dg=(ip+dp).split(''),n=dg.length,cw=(w-10)/n,ch=h*.58,yy=y+h*.36;
    for(var i=0;i<n;i++){var xx=x+5+i*cw;c.fillStyle=i>=ip.length?'#fff3bf':'#f8f9fa';K.rr(c,xx+1,yy,cw-2,ch,3);c.fill();
      c.fillStyle=main?'#2d3436':'#5f676e';c.font='800 '+(ch*.8)+'px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';
      if(i===n-1&&st.v>.2&&!calm){var fr=(val*Math.pow(10,dec))%1;c.save();c.beginPath();c.rect(xx+1,yy,cw-2,ch);c.clip();c.fillText(dg[i],xx+cw/2,yy+ch/2-fr*ch);c.fillText((+dg[i]+1)%10,xx+cw/2,yy+ch*1.5-fr*ch);c.restore();}
      else c.fillText(dg[i],xx+cw/2,yy+ch/2+1);
      if(i===ip.length-1){c.fillStyle='#ff6b6b';c.beginPath();c.arc(xx+cw-1,yy+ch-3,1.8,0,7);c.fill();}}
    c.textAlign='left';c.textBaseline='alphabetic';}
  function gauge(c,x,y,r,v){c.fillStyle='#212529';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.fillStyle='#f8f9fa';c.beginPath();c.arc(x,y,r*.86,0,7);c.fill();
    c.lineWidth=r*.12;c.strokeStyle='#e03131';c.beginPath();c.arc(x,y,r*.7,Math.PI*1.15,Math.PI*1.3);c.stroke();c.strokeStyle='#2b8a3e';c.beginPath();c.arc(x,y,r*.7,Math.PI*1.75,Math.PI*1.85);c.stroke();
    c.fillStyle='#2d3436';c.font='800 '+(r*.32)+'px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('0',x-r*.55,y+r*.25);c.fillText('1',x+r*.55,y+r*.25);c.font='700 '+(r*.22)+'px Rubik,sans-serif';c.fillText(T('БАК','FUEL'),x,y+r*.45);
    var a=Math.PI*1.15+Math.min(1.08,Math.max(0,v))*Math.PI*.7;c.strokeStyle='#d9480f';c.lineWidth=Math.max(2,r*.08);c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*r*.72,y+Math.sin(a)*r*.72);c.stroke();
    c.fillStyle='#2d3436';c.beginPath();c.arc(x,y,r*.1,0,7);c.fill();c.textAlign='left';c.textBaseline='alphabetic';}
  K.loop(host,draw);f.say(T('Подъезжай!','Pull up!'),'happy');
  K.intro(host,{who:'tolik',text:T('Сегодня я на колонке! Держи пистолет — бензин бежит, напор растёт. Отпускай точно на заказ. И сдачу сосчитай в уме!','I’m at the pump today! Hold the nozzle — the petrol flows faster and faster. Let go right on the order. And count the change in your head!'),
    hint:K.pc(host)?T('Пробел — держать · 1 — долить по капле, Enter — хватит · 1–3 или ←/→ + Enter — сдача · Enter — дальше','Space — hold · 1 — top up, Enter — enough · 1–3 or ←/→ + Enter — change · Enter — next'):T('Держи кнопку «⛽ Держи» и отпусти вовремя','Hold “⛽ Hold” and let go in time'),btn:T('К колонке','To the pump')},startCar);
  st.api={press:press,judge:judge,dripMode:dripMode,chAns:chAns,next:next};}
/* бот: k — умение; промах в литрах ~ нормальный с разбросом (2,4 − 2k), сдачу считает с вероятностью 0,5+0,45k */
function sim(o,k){var R=o.rnd||Math.random,s=0;k=k==null?.6:k;var sd=Math.max(.25,2.4-2*k);
  for(var i=0;i<N;i++){var g=(R()+R()+R()-1.5)*2*sd,p=acc(g,i===2?'f':'l',false);s+=p+(R()<.5+.45*k?1:0);}return {score:s,tier:K.tier(s,CUT)};}
VYMG_REG({id:ID,n:K.L('Заправка «до краёв»','Fill It Up'),a:K.L('Залей ровно по заказу — ни капли мимо','Pour exactly the right amount — not a drop spilled'),run:run,sim:sim});
})();
