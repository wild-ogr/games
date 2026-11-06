'use strict';
/* ================= g3-newbie — П2 «Новичок» (Гастроном 3.0, волна 1; план 4.3, лимит «первый заход — без окон») =================
   1) Уровни 1–5 новичка — без новинок в «Кассе»: дирижёр GBNB.turn молчит на 1–3 и 5 (на 4-м — только мама с малышом, это в уровне),
      фикус-подарок — после 6-го уровня (было 3-й), Перерыв и благодарность — 7-й, план/задание — 8-й. Кнопки «Обставить зал» на 1–5 нет.
   2) «Дальше» после 5-го уровня впервые ведёт в зал: Валя говорит одну фразу (GBHALL.say), «Работать» — ниже.
   3) Ревизия короче (≤90 с): обслужен последний покупатель (ревизор) — Ревизия пройдена, остатки разберёт смена (раньше — ещё чистить полки).
   Флаг g3.nb (1, 2) и g3.rev (3). STAT: mod g3.nb {a:'hall'}, g3.rev {a:'done', n: товара осталось}.
*/
(function(){
if(!window.G3||!window.GB)return;
var X=window.G3NB={};
function nbNew(){try{return !!(window.GBNB&&GBNB.isNew());}catch(e){return false;}}
GB.on('ready',function(){if(!G3.on('nb')||!window.GBNB)return;
  GBNB.RES={1:[],2:[],3:[],4:['new'],5:[],6:['gift'],7:['mg','thanks'],8:['daily','plan'],10:['city']};GBNB.GIFT_L=6;});
/* тихая победа: новичок, уровни 1–5 (idx 0–4), первая победа */
X.quiet=function(i){return !!(G3.on('nb')&&nbNew()&&i<5&&!(typeof G!=='undefined'&&G&&G.daily));};
X.toHall=function(i){if(!G3.on('nb')||i!==4||!nbNew())return false;var g=G3.st();if(!g||g.hall)return false;g.hall=1;try{save();}catch(e){}X.pend=1;G3.mark('nb','hall');return true;};
GB.on('home',function(){if(!X.pend)return;X.pend=0;setTimeout(function(){try{if(window.GBHALL&&GBHALL.say)GBHALL.say(G3.L('Это мой гастроном! Пока пусто — но с вашей помощью заблестит. Работать — кнопка ниже.','This is my store! A bit bare for now — but with your help it\'ll shine. Work — the button below.'));}catch(e){}},400);});
/* Ревизия: ревизор обслужен — пройдена */
X.revDone=function(){var g=typeof G!=='undefined'?G:null;if(!g||!g.boss||g.daily||g.mode||!G3.on('rev'))return false;
  G3.mark('rev','done',{n:g.st.n,l:g.idx+1});return true;};
})();
