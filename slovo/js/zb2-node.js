'use strict';
/* zb2-node — игры на пути (буст_в2.0, MGR). Подробно — журнал hobby-analytics/release-i/zina-boost2/logs/MGR.md. Флаги: ?off=node | autonajdi.
   node: 5-й уровень десятки (первый проход) — поверх уровня окно «Перемена!» (игра по кругу: слово/ловкость через одну), ≥1★ → слова открываются,
   checkWin() (монеты/S.lv как у уровня); «Хочу обычный уровень»/✕/0★ — кроссворд. autonajdi: «Найди Ять» после «Глава пройдена» (3-2-1, «Потом»), раз в главу.
   Окна и стили — js/zb2-node-ui.js (лениво). S.z2g: r k ni ng sk — путь; a — глава авто; nq nn nf — очередь новых (zmg-core). STAT node{a,id,l}, auto{id,a,c}. */
(function(){
  if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined')return;
  var ON_NODE=ZB2.reg('node',{t:'5-й уровень десятки = мини-игра',who:'MGR',on:true}),ON_AUTO=ZB2.reg('autonajdi',{t:'«Найди Ять» сама после главы',who:'MGR',on:true});
  var DEF={r:0,k:0,ni:-1,ng:'',sk:-1,a:0,ad:0,nq:0,nn:0,nf:0};
  ZB2.field('z2g',{def:DEF,
    fix:function(o){['r','k','a','ad','nq','nn','nf'].forEach(function(k){o[k]=Math.max(0,(+o[k]|0)||0);});o.k=o.k?1:0;
      ['ni','sk'].forEach(function(k){o[k]=(+o[k]|0)||0;if(o[k]<-1)o[k]=-1;});o.ng=typeof o.ng==='string'?o.ng.slice(0,16):'';
      Object.keys(o).forEach(function(k){if(!(k in DEF))delete o[k];});},
    merge:function(a,b,newer){['r','a','ad','nq','nn','nf'].forEach(function(k){a[k]=Math.max(+a[k]||0,+b[k]||0);});
      if(newer){a.k=b.k?1:0;a.ni=+b.ni|0;a.ng=typeof b.ng==='string'?b.ng:'';a.sk=+b.sk|0;}}});
  function Z(){if(!S.z2g||typeof S.z2g!=='object')S.z2g=JSON.parse(JSON.stringify(DEF));return S.z2g;}
  /* zb2-MERGE (вес старта): логика узлов и «Найди Ять» — js/zb2-node-x.js, ZB.load сразу после ready */
  ZB.on('ready',function(){if(ON_NODE||ON_AUTO)ZB.load('js/zb2-node-x.js').catch(function(){});});
})();
