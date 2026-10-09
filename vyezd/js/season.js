/* Выезд со двора — СЕЗОН МЕСЯЦА и «Сезонный талон» (поток YARD, решение главного 10.10). Журнал: logs/YARD.md; 04 §2.6; образец — Викторина js/season.js.
   Каждый календарный месяц — свой сезон (тема двора), дорожка из 30 ступеней по 100 очков. Очки: двор 10 (+5 за ★★★, задание дня ещё +20),
   постройка в «Моём дворе» 20, шаг реставрации у Толика 15, тройка в лиге 50; не больше 300 в день.
   Бесплатная дорожка: монеты на каждой ступени, детали каждую 5-ю, украшение сезона на 20-й. «Сезонный талон» (15 голосов, товар PAY `season` у TECH):
   +монеты на каждой ступени, детали каждую 3-ю, своё украшение на 10-й и 30-й ступенях; купить можно в любой день — пройденные ступени выдаются сразу.
   Награды выдаются сами при переходе ступени (ничего не сгорает). Украшения сезона остаются во дворе №1 навсегда (S.seaD).
   Талон продаётся, только пока объявлен window.VYSEASON.on (так устроен товар TECH); выдача — VYSEASON.pass().
   Сохранение: S.sea {m: ГГГГММ, p: очки, g: выдано бесплатных ступеней, q: выдано платных, t: 1 — талон куплен, d: день, dp: очки за день},
   S.seaD [украшения], S.seaH {ГГГГММ: ступеней} (история). Дата — MY.now() (?date= для проверки). */
(function(){
'use strict';
var MY=window.MY;if(!MY)return;
var L=MY.L,esc=MY.esc,K=MY.svg.K,P=MY.svg.P,C=MY.svg.C,R=MY.svg.R,E=MY.svg.E,TH=MY.svg.TH,NS=MY.svg.NS;
var STEPS=30,PER=100,DAYCAP=300;
// темы месяцев: [имя, англ., бесплатное украшение (20-я), украшения талона (10-я, 30-я)]
var THEME={1:['Зимние каникулы','Winter holidays','snowman','tree','fort'],2:['Масленица во дворе','Pancake week','snowman','flags','fort'],3:['Весна-капель','Spring thaw','kite','birdhouse','flags'],
  4:['Субботник','Clean-up month','birdhouse','kite','sunflowers'],5:['Майские на даче','May at the dacha','flags','sunflowers','kite'],6:['Летние каникулы','Summer holidays','sunflowers','umbrella','kite'],
  7:['Жара во дворе','Yard heatwave','umbrella','sunflowers','watermelon'],8:['Арбузы привезли','The melons are in','watermelon','umbrella','sunflowers'],9:['Снова в школу','Back to school','birdhouse','flags','scarecrow'],
  10:['Урожай — на дачу','Harvest time','pumpkins','scarecrow','birdhouse'],11:['Первый снег','First snow','scarecrow','snowman','fort'],12:['Ёлку везём','Bringing the tree home','tree','snowman','fort']};
var DECN={snowman:['Снеговик','Snowman'],tree:['Ёлка у подъезда','Tree by the door'],fort:['Снежная крепость','Snow fort'],flags:['Флажки','Bunting'],kite:['Воздушный змей','Kite'],birdhouse:['Скворечник','Birdhouse'],
  sunflowers:['Подсолнухи','Sunflowers'],umbrella:['Пляжный зонтик','Beach umbrella'],watermelon:['Арбузы','Watermelons'],pumpkins:['Тыквы','Pumpkins'],scarecrow:['Пугало','Scarecrow'],uzelok:['Клумба «Узелка»','“Bundle” flowerbed']};
// рисунки украшений (свои места на тротуаре двора №1: x основания), размер ~24
var DPOS={snowman:104,tree:150,fort:362,flags:200,kite:330,birdhouse:52,sunflowers:250,umbrella:300,watermelon:380,pumpkins:178,scarecrow:22,uzelok:270};
var DECO={
  snowman:function(x,y){return C(x,y-6,7,'#fff')+C(x,y-17,5,'#fff')+P('M'+(x)+' '+(y-17)+' h5',0,TH(1.6,'#ff7a1a'))+R(x-4,y-26,8,4,K,1,NS);},
  tree:function(x,y){return P('M'+x+' '+(y-34)+' l10 12 h-5 l8 10 h-6 l8 10 h-30 l8 -10 h-6 l8 -10 h-5z','#2f8a3e')+R(x-2,y-2,4,4,'#8a5a3a',0,NS)+C(x-5,y-12,1.8,'#e5484d',NS)+C(x+4,y-20,1.8,'#ffd23f',NS)+C(x+6,y-8,1.8,'#3f8fe0',NS)+P('M'+x+' '+(y-38)+' l2 4 h-4z','#ffd23f',NS);},
  fort:function(x,y){return P('M'+(x-14)+' '+y+' v-12 h4 v-4 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 v16z','#eef4f8');},
  flags:function(x,y){var s=P('M'+(x-30)+' '+(y-30)+' q30 10 60 0',0,TH(1));for(var i=0;i<7;i++){var fx=x-27+i*9,fy=y-29+Math.sin(i/6*Math.PI)*4;s+=P('M'+fx+' '+fy+' l3 7 l3 -7z',['#e5484d','#ffd23f','#3f8fe0','#2fa84f'][i%4],TH(.7));}return s;},
  kite:function(x,y){return P('M'+x+' '+(y-40)+' l7 8 l-7 10 l-7 -10z','#e5484d')+P('M'+x+' '+(y-22)+' q-6 8 0 12 q6 4 0 10',0,TH(1))+P('M'+x+' '+(y-40)+' v18 M'+(x-7)+' '+(y-32)+' h14',0,TH(.8));},
  birdhouse:function(x,y){return P('M'+x+' '+y+' v-18',0,TH(2.2))+R(x-6,y-30,12,12,'#c98d5a',1,TH(1.2))+P('M'+(x-8)+' '+(y-29)+' l8 -6 l8 6z','#b5523b')+C(x,y-24,2,K,NS);},
  sunflowers:function(x,y){var s='';[-8,0,8].forEach(function(d,i){var h=18+i%2*6;s+=P('M'+(x+d)+' '+y+' v-'+h,0,TH(1.6,'#2fa84f'))+C(x+d,y-h,5,'#ffd23f',TH(1))+C(x+d,y-h,2,'#7a4a1a',NS);});return s;},
  umbrella:function(x,y){return P('M'+x+' '+y+' v-26',0,TH(1.8))+P('M'+(x-16)+' '+(y-24)+' q16 -16 32 0z','#e5484d')+P('M'+(x-6)+' '+(y-24)+' q6 -16 12 0',' #fff'.trim(),NS);},
  watermelon:function(x,y){return E(x-6,y-6,8,6,'#2f8a3e')+E(x+7,y-5,7,5,'#3f9a4e')+P('M'+(x-9)+' '+(y-9)+' q3 3 6 0',0,TH(1,'#1f6a2e'));},
  pumpkins:function(x,y){return E(x-6,y-6,8,6,'#ff7a1a')+E(x+7,y-4,5,4,'#ff9a3a')+P('M'+(x-6)+' '+(y-12)+' v-4',0,TH(2,'#2f8a3e'));},
  scarecrow:function(x,y){return P('M'+x+' '+y+' v-30 M'+(x-12)+' '+(y-22)+' h24',0,TH(2,'#8a5a3a'))+C(x,y-32,5,'#f2c7a5',TH(1))+P('M'+(x-7)+' '+(y-35)+' l7 -6 l7 6z','#e0a85a',TH(1))+R(x-7,y-26,14,10,'#3f8fe0',1,TH(1));},
  uzelok:function(x,y){var s=E(x,y-3,16,5,'#8a5a3a');var c=['#e5484d','#ffd23f','#ff8ad8','#fff'];for(var i=0;i<7;i++)s+=C(x-12+i*4,y-6-(i%2)*2,2.4,c[i%4],TH(.6));return s;}};

/* ---------- сохранение ---------- */
function mon(){var d=MY.date();return d.getFullYear()*100+d.getMonth()+1;}
function fresh(){return {m:mon(),p:0,g:0,q:0,t:0,d:0,dp:0};}
MY.fix(function(){var x=S.sea;if(!MY.isO(x)||typeof x.m!=='number')S.sea=fresh();x=S.sea;['p','g','q','t','d','dp'].forEach(function(k){if(typeof x[k]!=='number'||!(x[k]>=0))x[k]=0;});
  if(!Array.isArray(S.seaD))S.seaD=[];S.seaD=S.seaD.filter(function(k){return typeof k==='string'&&DECO[k];});MY.fObjNum('seaH');});
MY.merge(function(loc,d){var a=MY.isO(loc.sea)?loc.sea:fresh(),b=d.sea;if(MY.isO(b)&&typeof b.m==='number'){
    if(b.m>a.m)S.sea=b;else if(b.m===a.m){S.sea=a;['p','g','q','t'].forEach(function(k){S.sea[k]=Math.max(+a[k]||0,+b[k]||0);});}}
  if(Array.isArray(d.seaD))d.seaD.forEach(function(k){if(DECO[k]&&S.seaD.indexOf(k)<0)S.seaD.push(k);});MY.mObjMax(d,'seaH');});

/* ---------- ступени и награды ---------- */
function th(m){return THEME[(m||mon())%100];}
function freeRw(k){return {c:10,p:k%5===0?2:0,d:k===20?th()[2]:''};}       // k — номер ступени 1..30
function paidRw(k){return {c:15+(k===STEPS?50:0),p:k%3===0?3:0,d:k===10?th()[3]:k===30?th()[4]:''};}
function roll(){var x=S.sea,m=mon();if(x.m===m)return;if(x.m&&x.g)S.seaH[x.m]=x.g;S.sea=fresh();MY.save();}
function steps(){return Math.min(STEPS,Math.floor(S.sea.p/PER));}
function give(r,why){if(r.c)MY.give(r.c,'sea');if(r.p)MY.prt.add(r.p,'gift',true);if(r.d&&S.seaD.indexOf(r.d)<0){S.seaD.push(r.d);MY.toast('🎉 '+L('Во дворе: ','In your yard: ')+dn(r.d),3000);}}
function dn(k){var x=DECN[k]||[k,k];return L(x[0],x[1]);}
function grant(){var x=S.sea,n=steps(),got={c:0,p:0};while(x.g<n){x.g++;var r=freeRw(x.g);give(r);got.c+=r.c;got.p+=r.p;}
  if(x.t)while(x.q<n){x.q++;var r2=paidRw(x.q);give(r2);got.c+=r2.c;got.p+=r2.p;}
  if(got.c||got.p){MY.save();MY.ev('ss',{m:x.m%100,s:n,t:x.t});}return got;}
// очки сезона (why — для статистики)
function add(n,why){if(!(n>0))return;roll();var x=S.sea,t=MY.dayNo();if(x.d!==t){x.d=t;x.dp=0;}n=Math.min(n,DAYCAP-x.dp);if(!(n>0))return;
  var before=steps();x.dp+=n;x.p+=n;var g=grant();if(steps()>before)MY.toast('🎟 '+L('Сезон: ступень ','Season: step ')+steps()+(g.c?' · +'+g.c+' 💰':'')+(g.p?' · +'+g.p+' 🔩':''),2200);MY.save();}
MY.onYard(function(r){if(!r||!r.ok||r.end&&r.end!=='win')return;add(10+((r.stars|0)>=3?5:0)+(r.daily||r.mode==='daily'?20:0),'yard');});
MY.on('build',function(){add(20,'build');});
MY.on('restore',function(){add(15,'rest');});
MY.on('start',function(){roll();grant();});

/* ---------- талон ---------- */
var VYSEASON=window.VYSEASON={on:true,
  pass:function(){roll();S.sea.t=1;var g=grant();MY.save();MY.ev('ss',{m:S.sea.m%100,buy:1,s:steps()});
    MY.toast('🎟 '+L('Талон сезона активен!','Season pass active!')+(g.c?' +'+g.c+' 💰':'')+(g.p?' +'+g.p+' 🔩':''),3200);try{if(MY.isOpen())MY.render();}catch(e){}},
  cur:function(){roll();var t=th();return {id:S.sea.m,name:L(t[0],t[1]),p:S.sea.p,step:steps(),steps:STEPS,pass:!!S.sea.t};},
  add:add,decos:function(){return S.seaD.slice();}};
MY.seaAdd=add;

/* ---------- украшения сезона во дворе №1 ---------- */
MY.seaDeco=function(){var a=S.seaD.slice();try{if(typeof PAY!=="undefined"&&PAY.own&&PAY.own('starter')&&a.indexOf('uzelok')<0)a.push('uzelok');}catch(e){}
  return a.map(function(k){return DECO[k]?'<g class="mysea">'+DECO[k](DPOS[k]||200,88)+'</g>':'';}).join('');};

/* ---------- вкладка «Сезон» ---------- */
function dayLeft(){var d=MY.date(),e=new Date(d.getFullYear(),d.getMonth()+1,1);return Math.max(1,Math.ceil((e-d)/864e5));}
function ico(r){return (r.c?'<b>'+r.c+'</b>💰':'')+(r.p?' <b>'+r.p+'</b>🔩':'')+(r.d?' 🎁':'');}
function render(el){roll();grant();var x=S.sea,t=th(),n=steps(),left=dayLeft(),h='';
  h+='<div class="seahead"><span class="seaic">🎟</span><div><b>'+L('Сезон: ','Season: ')+esc(L(t[0],t[1]))+'</b><small>'+L('ещё ','')+left+' '+L(MY.pl(left,'день','дня','дней'),left===1?'day left':'days left')+' · '+L('ступень ','step ')+n+'/'+STEPS+'</small>'+
    '<span class="seabar"><i style="width:'+Math.round(Math.min(1,x.p/(STEPS*PER))*100)+'%"></i></span><small>'+x.p+' / '+STEPS*PER+L(' очков · сегодня ',' points · today ')+(x.d===MY.dayNo()?x.dp:0)+'/'+DAYCAP+'</small></div></div>';
  // украшения сезона
  var dl=[[20,t[2],0],[10,t[3],1],[30,t[4],1]];
  h+='<div class="seadeco">'+dl.map(function(q){var own=S.seaD.indexOf(q[1])>=0;return '<span class="'+(own?'own':'')+'"><svg viewBox="0 0 60 50" aria-hidden="true">'+DECO[q[1]](30,46)+'</svg><b>'+dn(q[1])+'</b><small>'+(own?'✓ '+L('во дворе','in your yard'):(q[2]?'🎟 ':'')+L('ступень ','step ')+q[0])+'</small></span>';}).join('')+'</div>';
  // талон
  if(!x.t){var pay='';try{if(typeof PAY!=="undefined"&&PAY.on&&typeof payHtml==='function')pay=payHtml(['season']);}catch(e){}
    h+='<div class="seapass"><b>🎟 '+L('Сезонный талон','Season pass')+'</b><small>'+L('Вторая дорожка на весь месяц: ещё 500 💰, 30 🔩 и два украшения двора. Пройденные ступени — сразу.','A second track for the whole month: another 500 💰, 30 🔩 and two yard decorations. Steps already reached pay out at once.')+'</small>'+(pay?'<div id="seaPay">'+pay+'</div>':'')+'</div>';}
  else h+='<div class="seapass on"><b>🎟 '+L('Талон этого сезона у тебя','You have this season’s pass')+'</b><small>'+L('Награды талона приходят сами вместе со ступенями.','Pass rewards arrive automatically with each step.')+'</small></div>';
  // дорожка
  h+='<div class="seatrack">';for(var k=1;k<=STEPS;k++){var f=freeRw(k),p=paidRw(k),dn0=k<=n;
    h+='<div class="seast'+(dn0?' done':'')+(k===n+1?' nx':'')+'"><i>'+k+'</i><span class="seaf">'+ico(f)+'</span><span class="seap'+(x.t?'':' lock')+'">'+(x.t?'':'🔒 ')+ico(p)+'</span></div>';}
  h+='</div><p class="mynote">'+L('Очки сезона: двор 10 (+5 за ★★★), задание дня +20, постройка во дворе 20, шаг реставрации у Толика 15, тройка в лиге 50 — до '+DAYCAP+' в день. Награды приходят сами; украшения остаются во дворе №1 навсегда.','Season points: yard 10 (+5 for ★★★), daily challenge +20, a building 20, a restoration step 15, a top-3 league finish 50 — up to '+DAYCAP+' a day. Rewards arrive automatically; decorations stay in yard 1 forever.')+'</p>';
  el.innerHTML=h;
  try{var sp=MY.Q('seaPay');if(sp&&typeof PAY!=="undefined"&&PAY.bind){PAY.bind(sp);PAY.re=function(){MY.render();};}}catch(e){}}
MY.tab({id:'season',n:L('Сезон','Season'),ic:'🎟',o:40,title:L('Сезон месяца','Season of the month'),sub:function(){var t=th();return L(t[0],t[1]);},render:render});
MY.homeLine({pri:50,f:function(){roll();var n=steps();return n<STEPS?{ic:'🎟',t:L('Сезон «','Season “')+L(th()[0],th()[1])+L('»: ступень ','”: step ')+n+'/'+STEPS,a:'season'}:null;}});
})();
