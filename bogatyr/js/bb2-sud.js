/* ===== bb2-sud.js — «Суд над нечистью» (поток SUD супер-буста в2, 13.10.2026). Заглушка на старте: только сохранение и догрузка. Всё остальное (приговоры, прибавки, сцена суда, Книга судеб, диковина, справка для соседей) — js/bb2-sud-ui.js, набор 'sud'. ===== Без ?. ?? .finally */
(function(){
  if(typeof BB2!=='object'||!BB2)return;var B=BB2,RE=/^\d{1,2}$/;
  function fix(o){var r={v:{},b:{},p:{},tr:-1,ts:+o.ts||0},k,q;
    if(B.ob(o.v))for(k in o.v)if(RE.test(k)&&(o.v[k]==='m'||o.v[k]==='x'))r.v[k]=o.v[k];
    if(B.ob(o.b))for(k in o.b){q=o.b[k]&3;if(RE.test(k)&&q)r.b[k]=q;}
    for(k in r.v)r.b[k]=(r.b[k]|0)|(r.v[k]==='m'?1:2);
    if(B.ob(o.p))for(k in o.p)if(RE.test(k)&&o.p[k]&&!r.v[k])r.p[k]=1;
    if(typeof o.tr==='number'&&r.v[o.tr]==='x')r.tr=o.tr;else for(k in r.v)if(r.v[k]==='x'){r.tr=+k;break;}
    return r;}
  function merge(a,b){var nw=(+b.ts||0)>(+a.ts||0)?b:a,od=nw===a?b:a,r={v:{},b:{},p:{},tr:nw.tr,ts:Math.max(+a.ts||0,+b.ts||0)},k;
    for(k in od.v||{})r.v[k]=od.v[k];for(k in nw.v||{})r.v[k]=nw.v[k]; /* приговор — из более нового; Книга — объединение */
    for(k in a.b||{})r.b[k]=a.b[k]|0;for(k in b.b||{})r.b[k]=(r.b[k]|0)|(b.b[k]|0);
    for(k in a.p||{})r.p[k]=1;for(k in b.p||{})r.p[k]=1;
    return fix(r);}
  BB2.save('sud',{fix:fix,merge:merge});
  BB2.lazy('sud',['js/bb2-sud-ui.js'],function(){return typeof SUDX!=='undefined';});if(B.on('sud'))B.late('sud'); /* набор сам догружается в меню в фоне */
  /* поход начался раньше догрузки — догружаем сразу: суд после босса и диковина включатся в этом же походе */
  B.hook('run',function(g){if(!B.on('sud')||B.ready('sud'))return;B.need('sud').then(function(){if(typeof G!=='undefined'&&G===g&&!g.over)SUDX.late(g);},function(){});});
})();
