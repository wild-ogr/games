'use strict';
/* ================= gb-up — волна улучшений 24.10 (UP-GS; журнал hobby-analytics/release-i/fix-2410/UP-GS.md) =================
   1) ЗАВТРА ПОДАРОК. Не вернувшиеся новички проходят 1–5 уровней и уходят; обещание «Завтра: …» в «Кассе» — строкой, с 5-го уровня
      и не на каждой победе. Здесь — ОДНО окно один раз: после первой победы 4–8-го уровня, по «Дальше» (до следующего уровня):
      «🎁 Завтра — подарок» (настоящий: +UP.GIFT 💰 при заходе в любой следующий день, один раз), задание дня и серия дней
      («не потеряйте серию»), главный пункт «Завтра» из gb-newbie (дефицит, затея…), кнопки «🔔 Напомнить завтра» (SOC.ntf — если SOC
      ещё не спрашивал; показ засчитан как №1, дальше SOC сам: №2 на 3-й день, №3 на 7-й) и «⭐ В избранное» (SOC.fav), «Дальше».
      Только VK/ОК (PLAT==='vk'; в ОК SOC сам прячет уведомления и избранное — остаются подарок и задание), не в demo.
      Поля: S.upTm {s: день показа окна, g: день выдачи подарка}. Облако — максимум. Статистика: mod {m:'tmrw', a: show|ntf|ntfok|fav|favok|go|gift}.
   Выключить: window.GB_OFF={uptmr:1} или ?gboff=uptmr.
   2) РОЛИК ПО ДЕЛУ (роликов 0,02 на сеанс: ×2 убран 10.10, бустер за ролик — только когда монет не хватает). С 8-го уровня, когда игроку трудно
      (ушёл недовольный покупатель / у кого-то терпение ≤2 хода / 30 с и 3+ хода без тройки) и ролик готов (adLikely, adOk) — один раз за попытку
      кнопка «Подсказка» загорается: «📺 даром» (класс upad), Валя: «Застряли? Посмотрите ролик — подскажу даром!». Нажал → ролик → подсказка
      (поздний досмотр — lateBoost, как у бустеров). Не готов ролик — кнопка обычная. В задании дня и режимах — тоже, кроме обучения.
      Цена на кнопках бустеров «📺 за рекламу» (монет не хватает) — только при готовом ролике, иначе цена в монетах.
      В index.html рядом: «Ещё попытка за рекламу» даёт ещё +REV_PAT (3) хода терпения очереди (revPat). STAT: place 'hintad', mod {m:'hintad', a:on|ok}.
      Выключить: GB_OFF={upad:1} / ?gboff=upad.
*/
(function(){
if(typeof GB==='undefined')return;
var UP=window.GBUP={tmr:GB.flag('uptmr'),GIFT:50,L1:4,L2:8};
function $(id){return document.getElementById(id);}
function ev(a){try{STAT.ev('mod',{m:'tmrw',a:a});}catch(e){}}
function sv(){try{save();}catch(e){}}
function day(){try{return dayKey(0);}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function Lx(r,e){return typeof L==='function'?L(r,e):r;}
function num(v){v=+v;return isFinite(v)&&v>0?v:0;}
function fix(s){if(!s.upTm||typeof s.upTm!=='object')s.upTm={s:0,g:0};s.upTm.s=num(s.upTm.s);s.upTm.g=num(s.upTm.g);}
GB.onSave({id:'uptm',keys:['upTm'],fix:fix,merge:function(s,d){fix(s);if(!d||!d.upTm||typeof d.upTm!=='object')return;
  s.upTm.s=Math.max(s.upTm.s,num(d.upTm.s));s.upTm.g=Math.max(s.upTm.g,num(d.upTm.g));}});
function S_(){if(typeof S==='undefined'||!S)return null;fix(S);return S;}

/* ---------- окно «Завтра — подарок» ---------- */
var W={l:0,first:false};
GB.levelHook.push(function(i){W={l:i.r==='win'?i.l:0,first:!!(i.r==='win'&&i.first&&!i.daily&&!i.mode)};});
function due(idx){var s=S_();if(!s||!UP.tmr)return false;if(typeof ses2==='function'&&!ses2())return false; /* rules2510: окно «Завтра — подарок» только со 2-го захода (п. 2.6.3) */
  try{if(window.__demo||PLAT!=='vk')return false;}catch(e){return false;}
  return !s.upTm.s&&W.first&&W.l>=UP.L1&&idx===W.l&&(W.l<=UP.L2&&(s.levelsDone||0)<=UP.L2+4||typeof tmrCatch==='function'&&tmrCatch()&&(s.levelsDone||0)<=40);} /* rules2510: во 2-м–3-м заходе — при первой новой победе захода, если окна ещё не было */
function ntfCan(){try{return !OK&&typeof SOC==='object'&&SOC.ok()&&SOC.can('ntf')&&SOC.ntfDue()&&!(S.soc&&S.soc.ntf&&+S.soc.ntf.n);}catch(e){return false;}}
function favCan(){try{return !OK&&typeof SOC==='object'&&SOC.ok()&&SOC.can('fav');}catch(e){return false;}}
function row(ic,t,sub){return '<div class="chest uptm-r"><span class="uptm-i">'+ic+'</span><span>'+t+(sub?'<small>'+sub+'</small>':'')+'</span></div>';}
(function(){var st=document.createElement('style');st.textContent=
  '.uptm-r{display:flex;align-items:center;gap:10px;text-align:left;margin:6px 0}.uptm-r small{display:block;font-weight:600;font-size:13.5px;opacity:.85}'+
  '.uptm-i{font-size:26px;flex:none;width:34px;text-align:center}.uptm-b{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0 2px}'+
  '.uptm-b .btn{padding:9px 12px;font-size:16px}@supports not (inset:0){.uptm-r>*+*{margin-left:10px}.uptm-b>*+*{margin-left:8px}}';
  (document.head||document.documentElement).appendChild(st);})();
function tmrLine(){try{if(window.GBNB&&GBNB.tmrPick){var p=GBNB.tmrPick();if(p&&p.t&&p.id!=='daily'&&p.id!=='any'&&p.id!=='streak')return p.t;}}catch(e){}return '';}
function show(go){var s=S_();s.upTm.s=day();sv();
  var c=typeof DAILY_REWARD!=='undefined'?DAILY_REWARD:30,open=(s.unlocked||1)>=7,rows='';
  rows+=row('🎁',Lx('Подарок от тёти Вали: +','A gift from Aunt Valya: +')+UP.GIFT+' 💰',Lx('просто зайдите завтра','just come back tomorrow'));
  rows+=row('📅',Lx('Задание дня: +','Daily task: +')+c+' 💰',open?Lx('и серия дней — 7 дней подряд, подарок больше','and a day streak — 7 days in a row, a bigger gift'):Lx('откроется после 6-го уровня, дальше — серия дней','unlocks after level 6, then a day streak'));
  var t=tmrLine();if(t)rows+=row('🛒',t,'');
  var nb=ntfCan(),fb=favCan();
  if(nb){try{S.soc.ntf={n:1,t:typeof nowMs==='function'?nowMs():Date.now()};sv();STAT.ev('soc',{a:'ntf',r:'show',n:1,d:SOC.ntfDay(),w:'tmrw'});}catch(e){}}
  modal('<h2>'+Lx('Завтра — подарок!','Tomorrow — a gift!')+'</h2>'
    +valyaHtml(Lx('Заходите завтра — подарок приберегу. Не потеряйте серию!','Come back tomorrow — I\'ll keep a gift for you. Don\'t break the streak!'))
    +rows
    +((nb||fb)?'<div class="uptm-b">'+(nb?'<button class="btn noent" id="upNtf">🔔 '+Lx('Напомнить завтра','Remind me')+'</button>':'')
      +(fb?'<button class="btn noent" id="upFav">⭐ '+Lx('В избранное','Favourite')+'</button>':'')+'</div>':'')
    +'<div class="row"><button class="btn green big" id="upGo">'+Lx('Дальше','Continue')+'</button></div>');
  try{valyaDraw();}catch(e){}
  ev('show');
  var bn=$('upNtf');if(bn)bn.onclick=function(){bn.disabled=true;ev('ntf');
    Promise.resolve(SOC.ntf(1)).then(function(y){if(y){ev('ntfok');bn.textContent='✓ '+Lx('Напомню','Will remind');try{toast(Lx('Договорились! Часто беспокоить не стану.','Deal! I won\'t bother you often.'));}catch(e){}}else bn.disabled=false;},function(){bn.disabled=false;});};
  var bf=$('upFav');if(bf)bf.onclick=function(){bf.disabled=true;ev('fav');
    Promise.resolve(SOC.fav()).then(function(y){if(y){ev('favok');bf.textContent='✓ '+Lx('В избранном','In favourites');}else bf.disabled=false;},function(){bf.disabled=false;});};
  $('upGo').onclick=function(){try{SND.tap();}catch(e){}ev('go');go();};}
UP.show=show;UP.due=due;
if(typeof startLevel==='function'){var sl0=startLevel;window.startLevel=function(idx,daily){
  var self=this,a=arguments;
  if(!daily&&GB.safe('uptm:due',function(){return due(idx);})){try{hideModal();show(function(){hideModal();sl0.apply(self,a);});return;}catch(e){}}
  return sl0.apply(this,arguments);};}

/* ---------- подарок на следующий день (один раз) ---------- */
function giftDue(){var s=S_();return !!(s&&UP.tmr&&s.upTm.s&&!s.upTm.g&&day()>s.upTm.s);}
function gift(){if(!giftDue())return true;
  if(typeof modalOn!=='undefined'&&modalOn)return false;
  var s=S_();s.upTm.g=day();s.coins=(s.coins||0)+UP.GIFT;try{ern('gift',UP.GIFT);}catch(e){}try{updCoins();}catch(e){}sv();ev('gift');
  try{SND.coin&&SND.coin();}catch(e){}
  try{toast('🎁 '+Lx('Подарок от тёти Вали: +','A gift from Aunt Valya: +')+UP.GIFT+' 💰',4000);}catch(e){}return true;}
function giftTry(){if(!giftDue())return;var n=0,t=setInterval(function(){if(gift()||++n>40)clearInterval(t);},1500);}
GB.on('ready',function(){setTimeout(giftTry,1800);});
GB.on('home',function(){setTimeout(giftTry,600);});

/* ---------- 2) РОЛИК ПО ДЕЛУ: «Подсказка даром за ролик», когда трудно ---------- */
UP.ad=GB.flag('upad');UP.FROM=8;UP.SLOW=30000;
(function(){var st=document.createElement('style');st.textContent=
  '#bHint.upad{animation:upadp 1.1s ease-in-out infinite;background:#fff6d6}#bHint.upad small{background:#2b8a3e;color:#fff;border-radius:8px;padding:0 6px}'+
  '@keyframes upadp{50%{box-shadow:0 4px 0 #cdb892,0 0 0 5px rgba(255,200,40,.75),0 6px 14px rgba(0,0,0,.12)}}';
  (document.head||document.documentElement).appendChild(st);})();
var H={g:null,cl:0,t:0,mv:0};
function adYes(){try{return adOk()&&adLikely()&&!adBusy;}catch(e){return false;}}
function hb(){return $('bHint');}
function hOff(){var b=hb();if(b&&b.classList.contains('upad')){b.classList.remove('upad');try{updCoins();}catch(e){}}}
function hOn(){var b=hb();if(!b)return;b.classList.add('upad');var p=$('pHint');if(p)p.textContent=Lx('📺 даром','📺 free');}
function hard(g){var l=g.idx+1;if(g.tutor||g.mode||(!g.daily&&l<UP.FROM))return false;
  if(g.angry>=1)return true;
  for(var i=0;i<g.q.vis.length;i++){var v=g.q.vis[i];if(v.max<90&&v.pat<=2)return true;}
  return Date.now()-H.t>=UP.SLOW&&g.moves-H.mv>=3;}
function tick(){if(typeof G==='undefined'||!G||!UP.ad){hOff();return;}var g=G;
  if(H.g!==g){H.g=g;H.cl=g.st?g.st.cl:0;H.t=Date.now();H.mv=g.moves;hOff();}
  if(g.st&&g.st.cl!==H.cl){H.cl=g.st.cl;H.t=Date.now();H.mv=g.moves;}
  if(g.upH==='on'){if(!adYes()||g.over||g.won)hOff();else hOn();return;}
  if(g.upH||g.over||g.won||g.hint||(typeof modalOn!=='undefined'&&modalOn)||(typeof paused!=='undefined'&&paused)||document.hidden)return;
  if(!adYes()||!hard(g))return;
  try{if(!listMoves(g.lv,g.st,null).length)return;}catch(e){return;}
  g.upH='on';hOn();try{STAT.offer('hintad');STAT.ev('mod',{m:'hintad',a:'on',l:g.idx+1});}catch(e){}
  try{if(!g.speech)say(Lx('Застряли? Посмотрите ролик — подскажу даром!','Stuck? Watch a video — I\'ll give you a hint for free!'),'valya');}catch(e){}}
setInterval(function(){GB.safe('upad',tick);},1000);
if(typeof useBoost==='function'){var ub0=useBoost;window.useBoost=function(k){
  var g=typeof G!=='undefined'?G:null;
  if(k==='hint'&&g&&g.upH==='on'&&!g.over&&adYes()){
    var go=function(){g.upH='used';hOff();try{STAT.use('hint');}catch(e){}doHint();};
    try{if(!listMoves(g.lv,g.st,null).length){toast(NOMOVES());return;}}catch(e){}
    try{STAT.place('hintad');}catch(e){}
    showRewarded(function(){if(G===g&&!g.over){go();try{STAT.ev('mod',{m:'hintad',a:'ok'});}catch(e){}}},null,function(){return lateBoost(g,'hint',go);});return;}
  return ub0.apply(this,arguments);};}
// «📺 реклама» (было «📺 за рекламу») на кнопках бустеров (монет не хватает) — только при готовом ролике
if(typeof updCoins==='function'){var uc0=updCoins;window.updCoins=function(){var r=uc0.apply(this,arguments);
  GB.safe('upad:lbl',function(){var ok=adYes();[['pUndo','undo'],['pHint','hint'],['pMix','mix'],['pTable','table']].forEach(function(x){var e=$(x[0]);
    if(e&&!ok&&/📺/.test(e.textContent)&&typeof PRICE!=='undefined')e.textContent=PRICE[x[1]]+' 💰';});
    if(typeof G!=='undefined'&&G&&G.upH==='on'&&ok)hOn();});return r;};}
})();
