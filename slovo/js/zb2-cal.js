'use strict';
/* zb2-cal — «Отрывной календарь бабы Зины»: серия за любой уровень, одно окно входа, «Завтра у Зины» (буст_в2 … ШАПКА-ДОГОВОР ЦЕЛИКОМ — docs/heads/zb2-cal.txt (вынесена ради веса старта, zb2-MERGE) */
(function(){
if(typeof ZB==='undefined'||!window.ZB2)return;
var Z2=ZB2,ALL=!Z2.off('cal');
function R(id,t){return Z2.reg(id,{t:t,who:'CAL'})&&ALL;}
var ST=R('streakany','Серия за любой уровень, 🔥 у монет'),WIN=R('calwin','Отрывной календарь — одно окно входа')&&ST,
  W1=R('week1','Неделя первоклассника')&&WIN,TMR=R('tmr','Завтра у Зины — что именно будет завтра');
if(!ST&&!TMR)return;
var FROM=3;
function tk(){try{return todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function dn(k){k=+k||0;return k?Math.round(Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5):0;}
function key(n){var d=new Date(n*864e5);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function wk(n){return Math.floor((n+3)/7);} // неделя пн–вс (номер)
function pl(n,a,b,x){try{return plural(n,a,b,x);}catch(e){return x;}}
function hr(){try{return new Date(nowMs()).getHours();}catch(e){return new Date().getHours();}}
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
function ev(o,n){n=n||'cal';try{if(window.STATZB&&STATZB.z2)STATZB.z2(n,o);else STAT.ev(n,o);}catch(e){}}
var DEF={d:0,n:0,b:0,g:0,k:0,f:0,a:0,w:-2,p:0,q:'',m:0};
function c(){if(!S.z2c||typeof S.z2c!=='object')S.z2c=JSON.parse(JSON.stringify(DEF));return S.z2c;}
Z2.field('z2c',{def:DEF,
  fix:function(o,s){['d','n','b','g','k','f','a','p','m'].forEach(function(k){o[k]=num(o[k]);});o.w=isFinite(+o.w)?Math.max(-2,Math.min(7,Math.floor(+o.w))):-2;
    if(typeof o.q!=='string')o.q='';
    // перенос со старой серии задания дня (v3.0): жива (вчера/сегодня) — продолжаем; лучшая — максимум
    if(!o.d&&!o.n){var ld=+s.lastDaily||0,t=dn(tk());if(ld&&t-dn(ld)<=1&&+s.streak>0){o.d=ld;o.n=+s.streak;}o.b=Math.max(o.b,+s.bestStreak||0,o.n);}
    // Неделя первоклассника: новичок — ни одного старого гостинца и меньше 30 уровней
    if(o.w===-2)o.w=s.lg||(+s.lv||0)>=30?-1:0;},
  merge:function(a,b){var dd=+b.d>a.d;if(dd){a.d=+b.d;a.n=num(b.n);}else if(+b.d===a.d)a.n=Math.max(a.n,num(b.n));
    ['b','g','k','f','a','p','m'].forEach(function(k){a[k]=Math.max(a[k],num(b[k]));});a.w=Math.max(a.w,+b.w||-2);if(a.w>-1&&+b.w===-1)a.w=-1;
    if(+b.g>=tk())a.q='';}});
/* ---------- серия ---------- */
// привести серию к дню T: пропуск — прощает Ять (1 в неделю), ещё один — спасти за ролик (q='s'), иначе сгорела (q='l')
function roll(){var o=c(),t=dn(tk()),d=dn(o.d);if(!o.d||!o.n||t-d<=1)return o;if(o.q==='s')return o;
  var gap=t-d-1,fz=o.f!==wk(t-1)&&o.f!==wk(d+1)?1:0,need=gap-fz;
  if(need<=0){o.f=wk(t-1);o.d=key(t-1);o.q='f';ev({a:'freeze',n:o.n,w:wk(t)});}
  else if(need===1&&o.a!==wk(t)&&adOk())o.q='s';
  else lose(gap);
  try{save();}catch(e){}return o;}
function lose(gap){var o=c();ev({a:'lost',n:o.n,m:gap});o.n=0;o.q='l';o.m=gap;}
function adOk(){try{return typeof adsOk==='function'&&adsOk();}catch(e){return false;}}
// спасение за ролик принято/отказ (окно календаря)
function saved(yes){var o=c(),t=dn(tk());if(o.q!=='s')return;var gap=t-dn(o.d)-1;
  if(yes){if(gap>1)o.f=wk(t-1);o.a=wk(t);o.d=key(t-1);o.q='f';ev({a:'save',n:o.n,f:'ad'});}else lose(gap);try{save();cloudSoon();}catch(e){}X.paint();}
function mark(){var o=roll(),T=tk(),t=dn(T);if(o.q==='s')lose(t-dn(o.d)-1);if(o.d===T)return;
  o.n=o.n&&dn(o.d)===t-1?o.n+1:1;o.d=T;o.b=Math.max(o.b,o.n);
  try{save();}catch(e){}ZB.emit('calday',{n:o.n,first:o.n===1});X.paint();}
function alive(){var o=c(),t=dn(tk());return o.n>0&&(t-dn(o.d)<=1||o.q==='s');}
function streak(){return alive()?c().n:0;}
// день серии, который засчитается сегодня
function day(){var o=c();return o.d===tk()?o.n:alive()?o.n+1:1;}
function w1(){var o=c();return W1&&o.w>=0&&o.w<7?o.w+1:0;}
function due(){if(!WIN)return false;try{if(SHOT)return false;}catch(e){}return (+S.lv||0)>=FROM&&c().g!==tk();}
function fest(){return tk()%10000===1104;}
if(ST)ZB.levelHook.push(function(i){if(i&&i.ok&&i.end==='win')ZB.safe('cal-mark',mark);});
var ADD=[];function add(x){if(x&&x.id){ADD=ADD.filter(function(y){return y.id!==x.id;});ADD.push(x);}}
/* ---------- окно входа: вместо гостинца (ui.js openLogin) ---------- */
var calmOn=true,ui=null;
function calm(){return WIN&&calmOn;}
ZB.on('start',function(){calmOn=false;});
var xp=null;function loadX(){return xp||(xp=ZB.load('js/zb2-cal-x.js'));}
function load(){return ui||(ui=loadX().then(function(){return ZB.load('js/zb2-cal-ui.js');}).then(function(){if(!window.ZB2CALUI)throw new Error('ui');return window.ZB2CALUI;}));}
// показать окно; then — что дальше (как у openLogin); view — просто посмотреть (по плашке)
function open(view,then){if(!WIN)return;if(typeof view==='function'){then=view;view=0;}
  if(!view&&!due()){if(then)then();return;}
  try{if(window.ZBMIG&&ZBMIG.pending()){ZBMIG.open(function(){open(view,then);});return;}}catch(e){}
  roll();if(!view)try{modal('<div class="zc-wait"><h2>🗓 Отрывной календарь</h2><p>Баба Зина ищет очки…</p></div>');}catch(e){}
  load().then(function(U){U.open({view:!!view,then:null});},function(){try{hideModal();}catch(e){}if(lg0&&!view)lg0(then);});}
var lg0=null;
if(WIN){ZB.on('ready',function(){lg0=window.openLogin;window.openLogin=function(then){return open(0,null);};
    // старая карточка возврата (retCard) не нужна — задание дня внутри календаря
    try{if(window.ZBNB&&typeof ZBNB.turn==='function'&&!ZBNB.turn.zc){var t0=ZBNB.turn;ZBNB.turn=function(id){if(calm()&&(id==='mgnew'||id==='five'))return false;return t0.apply(this,arguments);};ZBNB.turn.zc=1;}}catch(e){}
    if(w1())ZB.load('js/zb2-week1.js').catch(function(){});
    setTimeout(function(){if(due())load().catch(function(){});},300);});
  // гостинец считается взятым сегодня (старый код: кнопка «Гостинец дня», retCard, «Завтра»)
}
// до загрузки zb2-cal-x.js — заглушки (ничего не рисуют)
var X=window.ZB2CAL={on:function(){return WIN;},st:ST,win:WIN,w1on:W1,tmrOn:TMR,FROM:FROM,day:day,streak:streak,best:function(){return Math.max(c().b,streak());},alive:alive,due:due,
  tomorrow:function(){return '';},add:add,calm:calm,open:open,shop:function(){return '';},w1:w1,roll:roll,saved:saved,mark:mark,fest:fest,paint:function(){},late:function(){return false;},
  lines:function(){return ADD;},c:c,dn:dn,key:key,wk:wk,tk:tk,ev:ev,hr:hr,pl:pl,owns:function(x){return WIN&&x==='back';}};
ZB.on('ready',function(){c();loadX().then(function(){try{X.paint();ZB.refresh();}catch(e){}},function(){});});
})();
