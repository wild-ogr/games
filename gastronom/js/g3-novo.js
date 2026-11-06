'use strict';
/* ================= g3-novo — П2 «Новинка каждые 5–8 уровней» (Гастроном 3.0, волна 1; план 4.3, опора 3) =================
   БЕЗ DOM. 12 готовых помех (OBST) раньше впервые встречались на 101-м+ (одна республика — одна помеха). Теперь в РСФСР (уровни 11–100)
   они вводятся по одной: первая — 12-й уровень, к 50-му — уже 6, дальше каждые 7 уровней. Между вводами — каждый 2-й обычный
   уровень с одной уже знакомой помехой (сила 1). 1–10 и Ревизии — чистые. Объявление — подсказкой Вали при первой встрече (gb-obst-draw).
   ТОЛЬКО НЕПРОЙДЕННЫЕ уровни (S.stars[i] нет) и флаг g3.novo: пройденный уровень при повторе — прежняя раскладка.
   Генератор зовёт G3N.obs(i,P) из obsFor (js/gb-lvl2.js) только для республики 0; быстрый путь — своя таблица G3N_TAB
   (js/g3-novo-tab.js, снимает G3W1/tools/novo_tab.sh). В сторожах freeze/check G3N нет — уровни как были.
   Свой автопрогон: G3W1/tools/novo_check.sh (window нет → G3N.ALL = все уровни как непройденные).
*/
var G3N=(function(){
  var INTRO=[[12,1],[18,12],[25,3],[32,9],[39,2],[46,4],[53,8],[61,5],[67,6],[74,10],[81,7]]; /* [уровень (с 1), помеха] */
  var ALL=typeof window==='undefined';
  function at(l){for(var k=0;k<INTRO.length;k++)if(INTRO[k][0]===l)return INTRO[k][1];return 0;}
  function known(l){var o=[];for(var k=0;k<INTRO.length;k++)if(INTRO[k][0]<l)o.push(INTRO[k][1]);return o;}
  /* какая помеха на уровне l (с 1): 0 — нет */
  function plan(l){if(l<11||l>100||l%10===0)return 0;var a=at(l);if(a)return a;var kn=known(l);if(!kn.length||l%2)return 0;
    var h=(l*2654435761>>>0)%kn.length;return kn[h];}
  function live(i){if(ALL)return true;try{if(!window.G3||!G3.on('novo'))return false;if(window.__demo)return false;
      if(typeof S!=='undefined'&&S&&S.stars&&S.stars[i])return false;}catch(e){return false;}return true;}
  function use(i){return plan(i+1)>0&&live(i);}
  function obs(i,P){if(!use(i))return null;var id=plan(i+1);if(typeof GBOB!=='undefined'&&GBOB.on&&!GBOB.on(id))return null;
    return [{id:id,pow:1}];}
  function tab(){return typeof G3N_TAB!=='undefined'?G3N_TAB:null;}
  return {INTRO:INTRO,plan:plan,use:use,obs:obs,tab:tab,isIntro:function(i){return at(i+1);},setAll:function(v){ALL=!!v;}};
})();
if(typeof window!=='undefined')window.G3N=G3N;
