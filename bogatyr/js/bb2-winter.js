/* bb2-winter.js — заглушка потока WINTER (зима: «Карачун», Каникулы, Старый Новый год, День богатырей, Масленица, Сказы зимы).
   Сохранение S.bb2.win и догрузка набора 'winter' (js/bb2-winter-x.js — там всё описание). Флаг 'winter'. Грузится только зимой
   (01.12–31.03) или если у игрока уже есть зимний облик / блины в печи. Проверка без ожидания даты (стенд): ?festday=2026-12-31. */
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  var ob=BB2.ob;
  function nm(v){return typeof v==='number'&&v>0&&isFinite(v)?Math.floor(v):0;}
  function dt(v){return typeof v==='string'&&/^\d{4}-\d\d-\d\d$/.test(v)?v:'';}
  function fix(o){var r={},k,q=[];
    for(k in{a:1,x:1,sb:1,e:1,sd:1})if(nm(o[k]))r[k]=nm(o[k]);
    if(r.e>5)r.e=5;if(r.a)r.a&=262143;
    for(k in{ac:1,r:1,ad:1})if(dt(o[k]))r[k]=o[k];
    if(Array.isArray(o.q))for(k=0;k<o.q.length&&q.length<20;k++)if(ob(o.q[k]))q.push(o.q[k]);if(q.length)r.q=q;
    return r;}
  function merge(a,c){var r=BB2.mx(a,c);r.a=(a.a|0)|(c.a|0);r.x=(a.x|0)|(c.x|0);r.q=a.q;return fix(r);}
  BB2.save('win',{fix:fix,merge:merge});
  /* «сегодня» для зимы: на стенде (localhost/LAN/file) — ?festday=, иначе день игры (dayKey) */
  BB2.wd=function(){var m=/[?&]festday=(\d{4}-\d\d-\d\d)/.exec(location.search);
    if(m&&(location.protocol==='file:'||/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)))return m[1];
    return typeof dayKey==='function'?dayKey():'';};
  BB2.lazy('winter',['js/bb2-winter-x.js'],function(){return typeof BB2W!=='undefined';});
  function need(){var d=BB2.wd(),k,s=typeof S==='object'&&S||{};if(d>='2026-12-01'&&d<='2027-03-31')return 1;
    for(k in s.skins||{})if(/@(snezh|sivka|svyat)$/.test(k))return 1;
    try{return JSON.stringify(s.yard||0).indexOf('blin')>=0;}catch(e){return 0;}}
  BB2.hook('ready',function(){if(BB2.on('winter')&&need())BB2.late('winter',true);});
})();
