'use strict';
(function(){
if(typeof window.ZB==='undefined'||!window.ZB2)return;
var F={lv1safe:'1-й уровень нельзя проиграть',ramp:'Помощь снижается плавно',homefit:'Дом на телефоне ужат',
walk:'Новичка один раз через Дом',cabgift:'Первый кабинет подарком',askntf:'Вопрос о напоминаниях в конце дня'};
var N=window.ZB2N={on:{}};
Object.keys(F).forEach(function(k){N.on[k]=ZB2.reg(k,{t:F[k],who:'NEWB',on:true});});
N.ok=function(id){return!!N.on[id]&&!ZB2.off(id);};
function $(id){return document.getElementById(id);}
function ev(o){try{if(window.STATZB&&STATZB.z2)STATZB.z2('nb2',o);else if(window.STAT&&STAT.ev)STAT.ev('nb2',o);}catch(e){}}
N.ev=ev;
var K=['w','cg','cp','ak','d1','td'];
ZB2.field('z2n',{def:{w:0,cg:0,cp:0,ak:0,d1:0,td:0},
merge:function(m,c){c=c||{};['w','cp','ak'].forEach(function(k){m[k]=(+m[k]||0)|(+c[k]||0);});m.cg=Math.max(+m.cg||0,+c.cg||0);m.td=Math.max(+m.td||0,+c.td||0);
var a=+m.d1||0,b=+c.d1||0;m.d1=a&&b?Math.min(a,b):a||b;},
fix:function(m,S1){K.forEach(function(k){m[k]=+m[k]||0;});if(d1Bad(m,S1))m.d1=0;}});
function d1Bad(z,S1){var d1=+z.d1||0,c=S1&&S1.stc&&+S1.stc.c||0;return!!d1&&c>0&&c<d1&&(+S1.lv||0)>=20;}
ZB.onSave({id:'zb2-z2n-d38',merge:function(S1,d){var z=S1&&S1.z2n,c=d&&d.z2n;if(!z||!+z.d1||!d)return;
if((+d.lv||0)>=5&&!(c&&+c.d1)){z.d1=0;ev({a:'d38',lv:+d.lv||0});}}});
function Z(){return S.z2n||(S.z2n={w:0,cg:0,cp:0,ak:0,d1:0,td:0});}
N.z=Z;
(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='css/zb2-newb.css';document.head.appendChild(l);
var D=document.documentElement;Object.keys(F).forEach(function(k){D.classList.toggle('zn-'+k,N.ok(k));});})();
var xp=null;N.x=function(){if(!xp)xp=ZB.load('js/zb2-newb-x.js').then(function(){return N.X;});return xp;};
function X(f){N.x().then(function(x){if(x)ZB.safe('nb2:x',function(){f(x);});},function(){});}
function wrapStart(fn){if(typeof startLevel!=='function')return;var s0=startLevel;
startLevel=function(idx,daily){var a=arguments,t=this;return fn(idx,daily,function(){return s0.apply(t,a);});};}
function g(){return typeof G!=='undefined'&&G?G:null;}
function l1On(){var G1=g();return N.ok('lv1safe')&&!!G1&&!G1.daily&&G1.idx===0&&S.lv===0;}
N.l1On=l1On;
function l1Start(){ZB.safe('nb2:l1',function(){var on=l1On();document.documentElement.classList.toggle('zn-l1',on);if(on)X(function(x){x.l1();});});}
ZB.on('start',l1Start);ZB.on('ready',function(){var G1=g();if(G1&&!G1.won)l1Start();});
ZB.levelHook.push(function(i){if(i.idx===0)document.documentElement.classList.remove('zn-l1');});
var WALK={5:{b:1,a:'home4',z:'zbToday',t:'Тут мой дневник: 5 дел в день — пятёрка и портфель! А «Играть» — дальше к урокам.'},
19:{b:2,a:'home20',z:'zbSchool',t:'Глава позади! Загляни в Школу — там кабинеты ремонтируем. А «Играть» — к урокам.'}};
var stop=null;
ZB.levelHook.push(function(i){if(!N.ok('walk')||!ZB.vw||!i.ok||!i.first||i.daily)return;var w=WALK[i.idx];
if(w&&!(Z().w&w.b)&&S.lv<=i.idx+1)stop={idx:i.idx+1,w:w};});
ZB.on('home',function(){if(!stop)return;var w=stop.w;stop=null;Z().w|=w.b;save();if(window.ZBNB&&ZBNB.turn)ZBNB.turn('home');ev({a:w.a,l:w.b===1?6:20});
setTimeout(function(){ZB.safe('nb2:walkhl',function(){var say=$('mSay');if(say)say.textContent=w.t;
var el=$(w.z);if(!el||!el.firstElementChild)el=$('zbToday');if(!el)return;var pl=$('btnPlay');
el.classList.add('zn-hl');if(pl)pl.classList.add('zn-hlp');try{el.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}
setTimeout(function(){el.classList.remove('zn-hl');if(pl)pl.classList.remove('zn-hlp');},9000);});},350);});
function tag(b,t){if(!b)return;if(t)b.setAttribute('data-zn-tag',t);else b.removeAttribute('data-zn-tag');}
function tags(){var b=document.querySelector('#zbToday .sc-home');
if(b){tag(b,b.classList.contains('hot')?'🎁 забери':+Z().td!==todayKey()?'новое':'');
if(!b.__zn){b.__zn=1;b.addEventListener('click',function(){Z().td=todayKey();save();},true);}}
var c=window.ZBCAB,sc=$('zbSchool');if(!c||!sc)return;var t='',bf=c.bufet&&c.bufet();
if(bf&&bf.full||c.yatReady&&c.yatReady())t='🎁 забери';
else for(var i=0;i<c.ids.length;i++){var id=c.ids[i];if(c.open(id)&&!c.lv(id)&&c.can(id)){t='хватает на ремонт';break;}}
tag(sc.querySelector('[data-zb="cab"]>*')||sc.firstElementChild,t);}
if(ZB.homeRender){var hr0=ZB.homeRender;ZB.homeRender=function(){var r=hr0.apply(this,arguments);if(N.ok('homefit'))ZB.safe('nb2:tags',tags);return r;};}
var RAMP=[{to:40,b:35,c:60,n:2},{to:60,b:45,c:90,n:1}];
N.ramp=function(){var G1=g();if(!N.ok('ramp')||!G1||G1.daily||G1.tut||G1.won||G1.idx!==S.lv||G1.idx<20)return null;
for(var i=0;i<RAMP.length;i++)if(G1.idx<RAMP[i].to)return RAMP[i];return null;};
N.chapHint=function(c){if(!N.ok('ramp')||c>2||c<0)return 0;var b=1<<c;if(Z().cp&b)return 0;Z().cp|=b;
if(typeof hbAdd==='function')hbAdd(2,'chap'+(c+1));else S.hb=Math.min(9,(+S.hb||0)+2);ev({a:'chap',l:(c+1)*20});return 2;};
var lastWin=null;
ZB.levelHook.push(function(i){if(i.ok&&!i.daily)lastWin={idx:i.idx,s:i.s};});
function shortW(){return G.words.filter(function(w){return!w.found;}).sort(function(a,b){return a.w.length-b.w.length;});}
ZB.on('start',function(){ZB.safe('nb2:ramp',function(){var lw=lastWin;lastWin=null;
if(!N.ok('ramp')||!G||G.daily||G.tut||G.idx!==S.lv)return;var ws=shortW();
if(G.idx%20===0&&G.idx>=20&&G.idx<100&&!G.words.some(function(w){return w.found;})){
if(ws.length>1){var cs=wordCells(ws[0]);cs.forEach(function(c,k){if(!c.open){openCell(c,200+k*90,'cat');c.gift=true;}});
setTimeout(function(){checkAutoFoundAndWin();saveCur();},300+cs.length*90);
zina('Новая глава — одно слово я вписала, обживайся!','happy',6);ev({a:'ch1',l:G.idx+1});}return;}
if(G.idx>=20&&G.idx<60&&lw&&lw.idx===G.idx-1&&lw.s>150&&!G.giftN){var c=ws[0]&&wordCells(ws[0]).find(function(c){return!c.open;});
if(c){openCell(c,500,'cat');c.gift=true;saveCur();zina('Прошлый был трудный — тут одну букву я уже открыла. Передохни!','happy',5);ev({a:'rest',l:G.idx+1,p:lw.s});}}
});});
N.CG=function(){var e=window.ZBECO&&ZBECO.cabGift||{};return{id:e.id||'russkij',at:+e.win||8,next:e.next||'stolovaya'};};
var cgPend=0;
ZB.levelHook.push(function(i){if(!N.ok('cabgift')||!i.ok||!i.first||i.daily||Z().cg)return;var o=N.CG(),c=window.ZBCAB;
if(i.idx===o.at-1&&c&&c.on!==false&&!c.lv(o.id)){cgPend=1;N.x();}});
wrapStart(function(idx,daily,go){if(cgPend&&!daily&&idx===N.CG().at&&N.ok('cabgift')){cgPend=0;N.x().then(function(x){if(x)x.cg(go);else go();},go);return;}return go();});
ZB.on('home',function(){if(cgPend&&N.ok('cabgift'))setTimeout(function(){if(cgPend&&!$('modal').classList.contains('on')){cgPend=0;X(function(x){x.cg(function(){});});}},600);});
var askArm='';
function dayOf(){var d1=+Z().d1;if(!d1)return 0;var f=function(k){return new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100,12);};
return Math.round((f(todayKey())-f(d1))/864e5)+1;}
N.day=dayOf;
function d1Mark(){var G1=g();if(!+Z().d1&&S.lv===0&&G1&&G1.idx===0&&!G1.daily){Z().d1=todayKey();save();}}
ZB.on('start',d1Mark);ZB.on('ready',d1Mark);
N.ntfT=function(n){if(!N.ok('askntf')||n>1)return null;var d=dayOf();if(!d)return null;
if(askArm==='home')return'Напомнить завтра, что я тебя жду? Тетрадку приготовлю, чай поставлю.';
if(d===1)return'';
var G1=g();if(G1&&G1.daily){var c=window.ZBCAB;return c&&c.lv&&c.lv('stolovaya')?'Напомнить, когда буфет наполнится? Тётя Валя ждать не любит.':'Напомнить завтра про новое задание дня?';}
return d>=3?null:'';};
N.ask=function(){askArm='home';try{return SOC.offer(S.wins||0,false);}finally{askArm='';}};
function winsToday(){var w=S.tip&&S.tip.nbW;return w&&+w.d===todayKey()?+w.n||0:0;}
ZB.on('home',function(){if(!N.ok('askntf')||Z().ak&1||dayOf()!==1||winsToday()<8&&(S.wins||0)<8)return;
if(typeof PLAT==='undefined'||PLAT!=='vk'||typeof SOC==='undefined'||!SOC.offer||typeof OK!=='undefined'&&OK)return;
X(function(x){x.ask();});});
ZB.levelHook.push(function(i){if(i.ok&&i.daily&&dayOf()>=2&&N.ok('askntf'))Z().ak|=2;});
})();
