/* bb2 LAND — заглушка 12-й земли «Долгая ночь» (флаг 'land'). Сама земля — набор 'land' (js/bb2-land-art.js + js/bb2-land-data.js):
   грузится только тем, кто дошёл до последней главы («Перепутье» пройдено или «Логово Лиха» игралось/пройдено), в меню.
   Прошедшим всё — один раз окно «Новая земля!» и выбор её первой главы на карте (BB2.landHi — в js/bb2-land-data.js).
   Сохранение S.bb2.land = {s:1} — окно показано. STAT 'land' {a:show|go|later|run|win|lose, s:слот, d, t}. Без ?. ?? .finally */
(function(){
  if(typeof BB2!=='object'||!BB2)return;var B=BB2;
  B.save('land',{fix:function(o){return o.s?{s:1}:{};},merge:function(a,c){return B.mx(a,c);}});
  BB2.lazy('land',['js/bb2-land-art.js','js/bb2-land-data.js'],function(){return !!B.landOk;});
  function S0(){try{return S;}catch(e){return null;}}
  function want(){var s=S0();return B.on('land')&&s&&s.done&&(s.done[31]||s.done[32]||(s.best&&s.best[32]>0));}
  function go(){if(!want())return;if(B.ready('land')){if(B.landHi)B.landHi(1);return;}B.need('land').then(function(){if(B.landHi)B.landHi();},function(){});}
  B.hook('ready',go);B.hook('menu',go);B.hook('cloud',go);
  B.hook('run',function(g){if(g.chi>32&&g.chi<36)B.stat('land',{a:'run',s:g.chi,d:g.dif||''});});
  B.hook('end',function(g,w){if(!(g.chi>32&&g.chi<36)||g.endless)return;B.stat('land',{a:w?'win':'lose',s:g.chi,d:g.dif||'',t:Math.round(g.t)});if(w&&B.pdv)B.pdv('land');});
})();
