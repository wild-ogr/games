/* ===== bb2-dvor.js — заглушка потока DVOR «Живой двор» (супер-буст в2, 14.10.2026). На старте только это; сцена — js/bb2-dvor-run.js (набор 'dvor').
   Флаг 'dvor'. Сохранение S.bb2.dvor = {v:'l'} — игрок сам выбрал «списком» ('s' — сам вернул двор); нет поля = как решит устройство. Без ?. ?? .finally */
(function(){
  if(typeof BB2!=='object'||!BB2)return;var B=BB2;
  function fix(o){return o&&(o.v==='l'||o.v==='s')?{v:o.v}:{};}
  BB2.save('dvor',{fix:fix,merge:function(a,c){return fix(a&&a.v?a:c);}});
  BB2.lazy('dvor',['js/bb2-dvor-run.js'],function(){return typeof DVORX!=='undefined';});
  if(B.on('dvor'))B.late('dvor'); /* сцена — после первого похода: новичок в меню до похода видит старую деревню */
})();
