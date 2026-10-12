'use strict';
/* ================= gb-back — подарок вернувшемуся «Где пропадал? Без тебя очередь до угла!» (поток META) =================
   Не был 3+ дня → окно тёти Вали на главном: 3+ дн. → 100 💰, 7+ → 200, 14+ → 300 (GBECO.back = [[3,100],[7,200],[14,300]] главнее)
   + строка про стеклотару, если отдел есть («бутылки сдали — заберите»). Только с 3+ пройденными уровнями. Реплики — GBT 'back.d3|d7|d14'.
   Выключатель GB.flag('back'). Поле S.mtV {v — день последнего захода, g — день, когда подарок дан}. Облако: максимум. STAT ret {m, c}. */
(function(){
if(typeof GB==='undefined'||!window.GBM)return;
var ON=GB.flag('back')&&GBM.on;
var M=GBM,num=M.num,isO=M.isO,R=M.R,esc=M.esc,pl=M.pl,E=M.E,dk=M.dk;
function S_(){return typeof S!=='undefined'?S:null;}
function sv(){try{save();}catch(e){}}
function tiers(){var t=E('back',null);return Array.isArray(t)&&t.length?t:[[3,100],[7,200],[14,300]];}
var prev=-1;
function fix(s){s=s||S_();if(!s)return;if(!isO(s.mtV))s.mtV={v:0,g:0};s.mtV.v=num(s.mtV.v);s.mtV.g=num(s.mtV.g);if(prev<0)prev=s.mtV.v;}
function merge(s,d){fix(s);if(!d||!isO(d.mtV))return;var v=num(d.mtV.v);if(v>prev)prev=v;s.mtV.v=Math.max(s.mtV.v,v);s.mtV.g=Math.max(s.mtV.g,num(d.mtV.g));}
GB.onSave({id:'back',keys:['mtV'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function stamp(){var s=S_();fix(s);var t=dk();if(s.mtV.v!==t){s.mtV.v=t;sv();}}
function due(){var s=S_();fix(s);if(!ON)return null;try{if(window.__demo)return null;}catch(e){}var t=dk();if(!prev||s.mtV.g===t)return null;
  if(M.levels()<3)return null;var miss=M.dnum(t)-M.dnum(prev),T=tiers(),x=null;for(var i=0;i<T.length;i++)if(miss>=T[i][0])x=T[i];
  return x?{miss:miss,c:num(x[1]),i:T.indexOf(x)}:null;}
var DEF=['Где пропадали? Без вас очередь до угла!','Целую неделю не заходили! Я уж думала, в другой магазин ходите.','Две недели! Пломбир все глаза проглядел. Не пущу больше!'];
function line(x){var k=['back.d3','back.d7','back.d14'][Math.min(2,x.i)],t='';try{if(window.GBT&&GBT.say)t=GBT.say(k,{n:x.miss});}catch(e){}return R(t||DEF[Math.min(2,x.i)]);}
function give(x){var s=S_();s.mtV.g=dk();try{if(window.GBECO&&typeof GBECO.give==='function')GBECO.give('back',x.c);else setCoins(S.coins+ern('gift',x.c));}catch(e){}
  M.stat('ret',{m:x.miss,c:x.c});sv();try{cloudSoon();}catch(e){}}
function open(){var x=due();if(!x||!line(x))return false;give(x);var g=window.GBDEP&&GBDEP.glass?GBDEP.glass():{c:0};
  modal('<div class="mt-back"><h2>'+esc(R('С возвращением!'))+'</h2>'+(typeof valyaHtml==='function'?valyaHtml(QQ(line(x))):'<p>'+esc(line(x))+'</p>')+
    '<p class="coins-won">+'+x.c+' 💰</p><p class="mt-mut">'+esc(R('Вас не было'))+' '+x.miss+' '+pl(x.miss,'день','дня','дней')+'.'+
    (g.c>0?' 🍾 '+esc(R('И стеклотару сдали — заберите в зале:'))+' +'+g.c+' 💰':'')+'</p>'+
    '<div class="row"><button type="button" class="btn green" id="mtBkOk">'+esc(R('Спасибо, тётя Валя!'))+'</button></div></div>');
  try{valyaDraw();}catch(e){}try{SND.coin();}catch(e){}
  document.getElementById('mtBkOk').onclick=function(){hideModal();try{SND.tap();}catch(e){}GB.refresh();};return true;}
function atHome(fn){GB.on('home',fn);GB.on('ready',function(){var m=document.getElementById('scr-map');if(m&&m.classList.contains('on'))fn();});}
// окно — после пересчёта; поверх другого окна не лезем (подарок ждёт следующего захода на главный в этот день)
var t0=0;atHome(function(){clearTimeout(t0);t0=setTimeout(function(){try{if(modalOn)return;if(G&&!G.won)return;}catch(e){}
  if(window.GBMIG&&GBMIG.pending())return;if(window.GBPL&&GBPL.nbTurn&&!GBPL.nbTurn('back'))return;open();if(!due())stamp();},500);});
GB.on('start',function(){if(!due())stamp();});
window.GBBACK={due:due,open:open,prev:function(){return prev;},fix:function(){fix();}};
})();
