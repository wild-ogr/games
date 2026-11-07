/* ===== b3-core.js — «Богатырь 3.0», волна 1 «Нечисть помнит» (07.11.2026, ветка b3w1). Каркас: флаги, открытие по дням, сохранение, тексты, STAT, догрузка.
   План — hobby-analytics/release-i/boost3-bogatyr/REVIEW-1107/PLAN-3.0.md, журнал ведущего — REVIEW-1107/LEAD.md. Без ?. ?? .finally
   ФЛАГИ (BB2.on): общий 'b3' и части: b3por (порог/первый поход, П1), b3gran (бой на грани, П2), b3tan (босс-танец, П2), b3obid (обидчик, П3),
     b3dver (Сорока, окна, вкладка «В поход», П4), b3yaga (голос, П5). Выключить: ?bb2=-b3 (всё, игра как v26.4) или ?bb2=-b3gran и т. п., пульт BB2.off('b3obid').
   ОТКРЫТИЕ ПО ДНЯМ: B3.open(часть) — новичку (не играл до 3.0) сразу; старому игроку по одной вещи в день от первого входа в 3.0 (OLD ниже).
   ТЕКСТЫ: B3.bank(ключ,{ru:[…],en:[…]}) — потоки кладут запасные строки, b3-txt.js (П5) кладёт основной банк поверх; B3.say(ключ,{имя:…}) → строка без повтора подряд.
   STAT: B3.stat(a,{…}) → событие 'b3' {a:…} (≤8 полей, ≤40 знаков).
   СОХРАНЕНИЕ: S.bb2.b3 — {d0: день первого входа в 3.0, old: 1 если были походы до 3.0}; свои данные потоки держат в своих ключах (b3o, b3d …) через BB2.save. */
(function(){
  if(typeof BB2!=='object'||!BB2)return;var B=BB2;
  var OLD={gran:0,yaga:0,por:0,dver:1,obid:2,tan:3}; // старому игроку: день от первого входа в 3.0, с которого часть видна
  function day(){try{return Math.floor((dayMs()+3*3600e3)/864e5);}catch(e){return Math.floor((Date.now()+3*3600e3)/864e5);}}
  function fix(o){return {d0:+o.d0>0?+o.d0|0:0,old:o.old?1:0};}
  function merge(a,b){var r={d0:0,old:a.old||b.old?1:0};r.d0=a.d0&&b.d0?Math.min(a.d0,b.d0):(a.d0||b.d0||0);return r;}
  B.save('b3',{fix:fix,merge:merge});
  function st(){var s=B.s('b3');if(!s.d0){s.d0=day();try{s.old=(S.runs|0)>0||!!(S.done&&S.done[0])?1:0;}catch(e){s.old=0;}}return s;}
  var BANK={},LAST={};
  var B3=window.B3={
    on:function(p){try{return B.on('b3')&&(!p||B.on('b3'+p));}catch(e){return false;}},
    day:day,
    age:function(){var s=st();return Math.max(0,day()-s.d0);},       // дней с первого входа в 3.0
    old:function(){return !!st().old;},
    open:function(p){if(!B3.on(p))return false;var s=st();if(!s.old)return true;return day()-s.d0>=(OLD[p]|0);},
    bank:function(k,o,main){if(!o)return;if(!BANK[k]||main)BANK[k]={ru:o.ru||[],en:o.en||o.ru||[]};},
    say:function(k,v){var b=BANK[k];if(!b)return '';var a=(typeof LANG!=='undefined'&&LANG==='en')?b.en:b.ru;if(!a||!a.length)a=b.ru;if(!a||!a.length)return '';
      var i=Math.floor(Math.random()*a.length);if(a.length>1&&i===LAST[k])i=(i+1)%a.length;LAST[k]=i;
      return String(a[i]).replace(/\{(\w+)\}/g,function(m,n){return v&&v[n]!=null?v[n]:'';});},
    has:function(k){return !!BANK[k];},
    stat:function(a,o){var r={a:a},k;if(o)for(k in o)if(o.hasOwnProperty(k))r[k]=typeof o[k]==='string'?o[k].slice(0,40):o[k];try{B.stat('b3',r);}catch(e){}},
    newbie:function(){try{return !(S.done&&S.done[0]);}catch(e){return true;}}
  };
  /* Догрузка: тяжёлые части 3.0 (бой на грани, обидчик, окна, банк текстов) — набор 'b3x' через BB2.inc в index.html:
     игроку с сохранением — сразу тегами, новичку — в фоне после первого похода (в меню, очередь BB2 LATE). */
  /* B.has — про крючки, не про наборы: ленивый ли b3x — по B.lazyInfo (П6). Ждёт набора только B3P.go (гл.1→2 у новичка); обычный «Выступить» не задерживаем:
     в меню b3x догружается фоном за доли секунды, а отложенный startRun ломал тесты (__test.startRun → G=null) и мог стартовать поход дважды. */
  B3.lz=function(){try{return !!(B.lazyInfo&&B.lazyInfo().b3x)&&!B.ready('b3x');}catch(e){return false;}};
  B.hook('menu',function(){if(B3.on())st();},95);
})();
