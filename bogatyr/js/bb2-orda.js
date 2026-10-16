/* bb2 ORDA — «Орда»: волна в 1000 мелкой нечисти одним слоем (08-perf.md, идея 3; флаг orda). Заглушка старта.
   Всё остальное — набор 'orda' (js/bb2-orda-run.js): качается в фоне в начале Бесконечной сечи (не в Испытании недели).
   Справка по BB2.orda.wave(G,{n,dur,src}) — шапка bb2-orda-run.js. Сохранение S.bb2.orda {d день награды, w разбито волн, k лучший счёт}. */
(function(){if(typeof BB2==='undefined')return;var B=BB2;
function num(o,k){if(typeof o[k]!=='number'||!(o[k]>=0))delete o[k];}
BB2.save('orda',{fix:function(o){num(o,'d');num(o,'w');num(o,'k');num(o,'ak');for(var k in o)if(k!=='d'&&k!=='w'&&k!=='k'&&k!=='ak')delete o[k];return o;},
  merge:function(a,b){return B.mx(a,b);}});
BB2.lazy('orda',['js/bb2-orda-run.js'],function(){return !!B.orda;});
/* MERGE (совет): нечисть орды не идёт в таблицы «одолено нечисти» (VK друзья, Яндекс kills) — счёт без неё: BB2.lbKills(); S.kills (статистика игры) — как было. ak — всего одолено в ордах */
B.hook('kill',function(e){var g=typeof G!=='undefined'&&G;if(e&&e.ob&&g)g.obA=(g.obA|0)+1;},80);
B.hook('end',function(g){if(g&&g.obA&&!g.obDone){var o=B.s('orda');o.ak=(o.ak|0)+g.obA;g.obDone=1;}},1);
B.lbKills=function(){var a=0,g=typeof G!=='undefined'&&G;try{a=B.s('orda').ak|0;if(g&&g.over&&g.obA&&!g.obDone)a+=g.obA;}catch(x){}return Math.max(0,Math.floor((S.kills||0)-a));};
B.hook('run',function(g){if(B.on('orda')&&(g.endless&&!g.weekly||/[?&]orda=/.test(location.search)))B.bg('orda');});
})();
