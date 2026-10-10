'use strict';
/* ================= zb-back — подарок вернувшемуся «Опять прогуливал?» (поток SCHOOL) =================
   Не был 2+ дня (пропущено дней ≥ ret[0][0]) — Зина ворчит и дарит монеты: 2+ дня → 100, 7+ → 200, 14+ → 300 (ZBECO.school.ret главнее).
   Одним окном со старым «Гостинцем» (ui.js openLogin): если гостинец сегодня положен — подарок встраивается в его окно (обёртка openLogin),
   иначе — своё окно на главном. Только для игроков с 3+ уровнями. Выключить: CFG.on=false.
   Поле S.scR {v — день последнего захода, g — день, когда подарок дан}. Облако: максимум обоих. */
(function(){
var CFG={on:true,from:3,ret:[[2,100],[7,200],[14,300]]};
window.ZBBACK_CFG=CFG;
if(window.ZB_OFF&&ZB_OFF.school)CFG.on=false; // общий выключатель школы: window.ZB_OFF={school:1} до загрузки
if(!CFG.on||typeof ZB==='undefined')return;
function num(x){x=+x;return isFinite(x)&&x>0?x:0;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function dk(){try{return todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function dnum(k){return Math.round(Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function coin(){try{return COIN_I;}catch(e){return '💰';}}
function tiers(){var z=window.ZBECO,e=z&&(z.school||z.sc);return e&&Array.isArray(e.ret)&&e.ret.length?e.ret:CFG.ret;}
var prev=-1; // последний заход ДО этого запуска (ловим при первой загрузке, до отметки «сегодня»)
function fix(s){s=s||S;if(!isO(s.scR))s.scR={v:0,g:0};s.scR.v=num(s.scR.v);s.scR.g=num(s.scR.g);if(prev<0)prev=s.scR.v;}
function merge(s,d){fix(s);if(!d||!isO(d.scR))return;var v=num(d.scR.v);
  // другое устройство заходило позже — считаем отсутствие от него (сегодняшний заход там — подарка нет)
  if(v>prev)prev=v;s.scR.v=Math.max(s.scR.v,v);s.scR.g=Math.max(s.scR.g,num(d.scR.g));}
ZB.onSave({id:'back',keys:['scR'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function stamp(){fix();var t=dk();if(S.scR.v!==t){S.scR.v=t;try{save();}catch(e){}}}
// сколько дней пропущено и что положено
function due(){fix();var t=dk();try{if(SHOT)return null;}catch(e){}if(!prev||S.scR.g===t)return null;
  var lv=0;try{lv=+S.lv||0;}catch(e){}if(lv<CFG.from)return null;
  var miss=dnum(t)-dnum(prev)-1,T=tiers(),x=null;for(var i=0;i<T.length;i++)if(miss>=T[i][0])x=T[i];
  return x?{miss:miss,c:x[1]}:null;}
var LINES=[
  function(n){return 'Опять прогуливал? '+n+' '+pl(n,'день','дня','дней')+' тебя не было! Ладно, садись. Тётя Валя тебе пирожок оставила, а я — вот.';},
  function(n){return 'Где пропадал '+n+' '+pl(n,'день','дня','дней')+'? Справку принёс? Ладно, без справки. Держи — и за парту.';},
  function(n){return 'Целых '+n+' '+pl(n,'день','дня','дней')+'! Я уж думала, ты в другую школу перевёлся. Не пущу! Держи гостинец.';}];
function line(x){return LINES[x.c>=300?2:x.c>=200?1:0](x.miss);}
function give(x){fix();S.scR.g=dk();try{if(window.ZBECO&&typeof ZBECO.give==='function')ZBECO.give('back',x.c,'gift');else addCoins(x.c,'gift');}catch(e){}try{STAT.ev('back',{m:x.miss,c:x.c});}catch(e){}try{save();cloudSoon();}catch(e){}}
function block(x,lite){return '<div class="sc-back'+(lite?' lite':'')+'"><p class="sc-backs">«'+esc(line(x))+'»</p><div class="reward'+(lite?'':' big')+' sc-backw">+'+x.c+' '+coin()+' <small>за возвращение</small></div></div>';}
// своё окно (гостинец сегодня не положен)
function openBack(){var x=due();if(!x)return false;give(x);
  modal('<h2>🎒 Опять прогуливал?</h2><div class="sc-cerz">'+face()+'</div>'+block(x)+
    '<div class="btns"><button type="button" class="btn green" id="scBkOk">Спасибо, баба Зина!</button></div>');
  try{SND.coin();coinBurst(document.querySelector('.sc-backw'),x.c);}catch(e){}
  $('scBkOk').onclick=function(){hideModal();try{SND.tap();}catch(e){}};return true;}
function face(){try{return zinaSVG('wow');}catch(e){return '👵';}}
// обёртка «Гостинца»: подарок вернувшемуся — внутри того же окна
ZB.on('ready',function(){
  if(typeof window.openLogin==='function'&&!window.openLogin.zbBack){var ol=window.openLogin;
    window.openLogin=function(then){var x=due(),r=ol.apply(this,arguments);
      if(x)ZB.safe('back-in',function(){var m=$('mcard'),h=m&&m.querySelector('h2');if(!h||!/Гостинец/.test(h.textContent))return;give(x);
        h.textContent='🎒 Опять прогуливал? Гостинец!';var p=h.parentNode.querySelector('p');var d=document.createElement('div');d.innerHTML=block(x,1);var z=h.nextElementSibling;if(z&&z.querySelector('svg')){z.classList.add('sc-backz');}
        // реплику гостинца заменяем ворчанием, монеты возвращения — над неделей гостинцев
        if(p)p.parentNode.replaceChild(d.firstChild,p);else h.parentNode.insertBefore(d.firstChild,h.nextSibling);
        try{coinBurst(m.querySelector('.sc-backw'),x.c);}catch(e){}try{if(typeof fitWin==='function')fitWin();}catch(e){}});
      return r;};
    window.openLogin.zbBack=1;}
  stamp();});
// гостинец сегодня не положен (взят на другом устройстве / нет его) — своё окно на главном
function atHome(fn){ZB.on('home',fn);ZB.on('ready',function(){var m=document.querySelector('.screen.on');if(m&&(m.id==='menu'||m.id==='zb-home'))fn();});}
var t0=0;atHome(function(){clearTimeout(t0);t0=setTimeout(function(){try{if($('modal').classList.contains('on'))return;if(G&&!G.won)return;}catch(e){}
  var lg=false;try{lg=lgDue();}catch(e){}if(lg)return; // гостинец ещё будет — подарок придёт в его окне
  if(window.ZBMIG&&ZBMIG.pending())return;openBack();stamp();},800);});
ZB.on('start',stamp);
window.ZBBACK={due:due,open:openBack,prev:function(){return prev;},fix:function(){fix();}};
})();
