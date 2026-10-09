/* ui-core.js — «гнёзда» и роутер экранов «Выезда со двора» (поток UX, буст «Наш двор», 10.10.2026).
   Грузится в <head> ДО основного скрипта (обычным <script>, без defer). Модули других потоков подключаются
   с defer после основного скрипта и кладут своё в гнёзда в любой момент: гнёзда опрашиваются при каждой отрисовке,
   а после DOMContentLoaded и load ядро само перерисовывает текущий экран (UI.refresh()). Не загрузился этот файл —
   index.html работает как раньше (все вызовы там через window.UI&&…).

   ДОГОВОР (менять только через поток UX; добавлять поля в ctx можно, убирать — нет):
   ─ homeSlots — главный экран «Наш двор».
       homeSlots.push({id:'car-today', order:20, zone:'feed', render:ctx=>html|null, mount:(el,ctx)=>{}})
       zone: 'feed' (по умолчанию) — плитка ленты «Сегодня во дворе»; удобно UI.tile({ic,t,s,tag,cls,go,prog:[n,all]}) → html.
             'win'  — окно пятиэтажки: жилец с поручением. render вернёт ОБЪЕКТ {who:'shura'|'tolik'|'mihalych'|'valerka'|'mityai'|…,
                      t:'Поручение', s:'подпись', badge:'!'|'🔩'|…, go:'экран'|fn} — UX сам нарисует окно и жильца (рисунок — js/art-people.js).
             'top'  — полоса под шапкой (права/карьера — CAR).  'yard' — низ «свой двор» (YARD).  'side' — правая колонка на ПК.
       ctx = {S, lv:номер следующего двора (1…), pc:bool, wide:bool}. render вернул пусто → места нет.
   ─ navSlots — кнопки нижней панели. Свои UX: home «Двор», map «Маршрут», garage «Гараж», shop «Лавка».
       navSlots.push({id:'album', order:35, ic:'📒', t:'Альбом', go:'album'|fn, dot:()=>bool})  (одинаковый id — последний побеждает,
       так можно ЗАМЕНИТЬ «Гараж» своим экраном). Больше 5 кнопок не показываем (по order).
   ─ winSlots — строки окна победы, между наградой и кнопками.
       winSlots.push({id:'car-pts', order:10, zone:'goal'|'tmr'|'extra', fit:3, render:ctx=>html|null, mount:(el,ctx)=>{}})
       zone: 'goal' — цель/очки карьеры/детали; 'tmr' — «Завтра во дворе»; 'extra' — Перекур у Толика и т. п.
       fit — чем меньше, тем раньше строку уберут, если окно не влезает в экран (0 — не убирать).
       ПРАВИЛО: главных кнопок в окне не больше двух, и они — UX. В гнезде можно одну второстепенную кнопку class="btn sec sm".
       ctx = {idx:0…, lv:idx+1, daily, stars, moves, sec, coins:награда, first:впервые пройден, newCar:{…}|null, regionDone,
              mode, region, fails, clean}
   ─ loseSlots — строки окна поражения (над кнопками). Тот же вид, ctx = {idx, lv, daily, moves, sec, fails, mode, region}.
   ─ mapSlots — карта регионов (вкладка «Маршрут»).
       mapSlots.push({id:'roadworks', order:10, zone:'top'|'region', render:ctx=>html|null, mount:(el,ctx)=>{}})
       'top' — над списком (Дорожные работы, двор дня); 'region' — под заголовком каждого региона: ctx.region = ДЕСЯТОК дворов
       (индекс первого двора региона / 10: 0…20, как LVLM.mapHtml(k)), ctx.rk = номер строки REGIONS, ctx.reg = VYREG.at(первый двор)
       (запись VYREG этого региона или null), ctx.done = регион пройден. (Исправлено: раньше reg = VYREG[k] — чужой регион.)
   ─ yardHook — РОВНО один раз после каждого двора (победа; поражение — когда игрок выбрал «Заново/На карту»;
       выход «назад»; «Заново» посреди двора).
       yardHook.push(info=>{})   info = {lv:1…, idx:0…, ok:1|0, end:'win'|'lose'|'quit'|'restart', stars, moves, sec,
               hint:сколько подсказок, tow:эвакуаторов, undo:0, crashes, mode:'n'|'daily'|…(G.mode от LVL), region,
               fails:поражений подряд на этом дворе ДО этого, daily:bool, first:впервые пройден}
   ─ saveHook — свои поля сохранения (вместо правок fixSave/mergeSave в index.html).
       UI.onSave({id:'car', fix:S=>{…}, merge:(S,d,newer)=>{…}})  fix зовётся сразу и при каждом fixSave();
       merge — при слиянии с облаком (d — облачное сохранение, newer — облако новее). Поля только свои (S.car*, S.my*, …).
       ВАЖНО: укажите, какие поля ваши — keys:['car','td','tdR'] и/или prefix:'car' (строка или массив) и/или test:k=>bool.
       Такие поля общий цикл mergeSave НЕ перезаписывает (раньше при «облако новее» он затирал их до вашего merge) —
       сливает только ваш merge (в т. ч. когда поля ещё нет в S). Без merge поле живёт по старому общему правилу (новее — целиком).
   ─ UI.go(screen, opts) — общий роутер. Встроены: home, map, game({idx}|{daily:1}), garage, shop, daily, settings, gift, how, about.
       Свой экран: UI.screen('album', opts=>{…}); свой <section class="screen" id="scr-album"> показывать UI.show('scr-album').
       UI.on(ev, fn): 'screen'(имя), 'yard-start'({idx,daily}), 'win'(ctx), 'lose'(ctx), 'home', 'map'.
   ─ VY — доступ к игре для модулей: VY.S (сохранение), VY.save(), VY.toast(t), VY.modal(html), VY.hide(), VY.L(ru,en),
       VY.coins(n,src) — начислить монеты с полётом, VY.G (текущий двор или null), VY.MODELS. Задаёт index.html.
   Ошибка в чужом гнезде не роняет игру (try/catch, console.warn). */
(function(){'use strict';
  var W=window;
  ['homeSlots','navSlots','winSlots','loseSlots','mapSlots','yardHook','saveHook'].forEach(function(n){if(!Array.isArray(W[n]))W[n]=[];});
  var scr={},ls={};
  function warn(s,e){try{console.warn('UI slot '+s,e);}catch(_){}}
  function list(a,zone,def){var m={},o=[];for(var i=0;i<a.length;i++){var x=a[i];if(!x)continue;if(typeof x==='function')x={render:x,fn:x};var k=x.id||('#'+i);if(m[k]!=null)o[m[k]]=x;else{m[k]=o.length;o.push(x);}}
    o=o.filter(function(x){return !zone||(x.zone||def||'')===zone;});
    return o.sort(function(a,b){return (a.order!=null?a.order:50)-(b.order!=null?b.order:50);});}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function call(x,f,a,b){try{return f.call(x,a,b);}catch(e){warn(x.id,e);return null;}}
  var UI={
    list:list,esc:esc,
    // отрисовать гнездо в контейнер (каждая запись — в свою обёртку <div class=cls data-slot=id>)
    fill:function(el,arr,ctx,cls,zone,def){if(!el)return 0;var h=[],it=list(arr,zone,def),ok=[];
      for(var i=0;i<it.length;i++){var x=it[i],r=x.render?call(x,x.render,ctx):null;
        if(r!=null&&r!==''&&r!==false&&typeof r==='string'){ok.push(x);h.push('<div class="'+(cls||'slot')+'" data-slot="'+esc(x.id||'')+'"'+(x.fit?' data-fit="'+(+x.fit)+'"':'')+'>'+r+'</div>');}}
      el.innerHTML=h.join('');UI.bind(el);
      var kids=el.children;for(var j=0;j<ok.length;j++){var y=ok[j];if(y.mount&&kids[j])call(y,y.mount,kids[j],ctx);}
      return ok.length;},
    // строки окна (победа/поражение) — html; потом UI.mountIn(root, arr, ctx)
    html:function(arr,ctx,zone,def){var h='',it=list(arr,zone,def);for(var i=0;i<it.length;i++){var x=it[i],r=x.render?call(x,x.render,ctx):null;
      if(r&&typeof r==='string')h+='<div class="uslot" data-slot="'+esc(x.id||'')+'"'+(x.fit?' data-fit="'+(+x.fit)+'"':'')+'>'+r+'</div>';}return h;},
    mountIn:function(root,arr,ctx){if(!root)return;UI.bind(root);var it=list(arr);for(var i=0;i<it.length;i++){var x=it[i];if(!x.mount)continue;
      var el=root.querySelector('[data-slot="'+esc(x.id||'')+'"]');if(el)call(x,x.mount,el,ctx);}},
    // объекты (zone 'win' главного экрана): render вернул {who,t,…}
    objs:function(arr,ctx,zone,def){var o=[],it=list(arr,zone,def);for(var i=0;i<it.length;i++){var x=it[i],r=x.render?call(x,x.render,ctx):null;if(r&&typeof r==='object'){r.id=r.id||x.id;r.mount=x.mount;o.push(r);}}return o;},
    // [data-go] внутри — переход по роутеру
    bind:function(el){if(!el)return;var q=el.querySelectorAll('[data-go]');for(var i=0;i<q.length;i++)(function(g){if(!g.onclick)g.onclick=function(){UI.go(g.getAttribute('data-go'));};})(q[i]);},
    tile:function(o){o=o||{};var pr=o.prog?'<i class="hsP"><b style="width:'+Math.round(100*Math.min(1,(o.prog[0]||0)/(o.prog[1]||1)))+'%"></b></i>':'';
      return '<button class="hsT '+esc(o.cls||'')+'"'+(o.go&&typeof o.go==='string'?' data-go="'+esc(o.go)+'"':'')+'>'+(o.ic?'<span class="hsI">'+o.ic+'</span>':'')+'<span class="hsB"><b>'+esc(o.t||'')+'</b>'+(o.s?'<small>'+esc(o.s)+'</small>':'')+pr+'</span>'+(o.tag?'<em class="hsTag">'+esc(o.tag)+'</em>':'')+'</button>';},
    // после каждого двора — всем подписчикам yardHook
    yard:function(info){var a=list(W.yardHook);for(var i=0;i<a.length;i++){var f=a[i].fn||a[i].render||a[i];if(typeof f==='function')call(a[i],f,info);}UI.emit('yard',info);},
    // свои поля сохранения
    onSave:function(o){if(!o)return;W.saveHook.push(o);if(o.fix&&W.VY&&VY.S)call(o,o.fix,VY.S);},
    saveFix:function(S){var a=list(W.saveHook);for(var i=0;i<a.length;i++)if(a[i].fix)call(a[i],a[i].fix,S);},
    // поле сохранения k принадлежит потоку (saveHook с merge и keys/prefix/test) — общий цикл mergeSave его НЕ трогает, сливает хозяин
    owns:function(k){var a=list(W.saveHook);for(var i=0;i<a.length;i++){var o=a[i];if(!o||!o.merge)continue;
      if(o.keys&&o.keys.indexOf(k)>=0)return true;if(o.prefix){var ps=[].concat(o.prefix);for(var j=0;j<ps.length;j++)if(k.indexOf(ps[j])===0)return true;}
      if(typeof o.test==='function'){try{if(o.test(k))return true;}catch(e){}}}return false;},
    saveMerge:function(S,d,newer){var a=list(W.saveHook);for(var i=0;i<a.length;i++)if(a[i].merge)call(a[i],a[i].merge,S,d,newer);},
    screen:function(name,fn){scr[name]=fn;},
    has:function(name){return !!scr[name];},
    cur:'',opts:null,
    go:function(name,opts){var f=scr[name];if(!f){warn('go',name);return false;}UI.opts=opts||null;
      try{if(f(opts)===false)return false;}catch(e){warn('go '+name,e);return false;}return true;},
    // перерисовать текущий экран (модуль догрузился и положил гнездо). Только главный/карту — двор и окна не трогаем.
    refresh:function(){clearTimeout(UI._rt);UI._rt=setTimeout(function(){if(UI.cur==='home'&&UI.homeRender)try{UI.homeRender();}catch(e){warn('refresh',e);}
      else if(UI.cur==='map'&&UI.mapRender)try{UI.mapRender();}catch(e){warn('refresh',e);}},30);},
    show:function(id){if(W.__show)W.__show(id);},
    // index.html show(id) сообщает, какой экран виден: scr-map → 'map', scr-game → 'game', scr-<имя> → '<имя>'
    shown:function(id){var n=String(id||'').replace(/^scr-/,'');if(n&&n!==UI.cur){UI.cur=n;UI.emit('screen',n);}},
    on:function(ev,fn){(ls[ev]=ls[ev]||[]).push(fn);},
    emit:function(ev,a){var l=ls[ev]||[];for(var i=0;i<l.length;i++)try{l[i](a);}catch(e){warn(ev,e);}}
  };
  // ПК (мышь, без сенсора): класс html.pc
  UI.pc=function(){try{return !!(W.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches)&&!('ontouchstart' in W);}catch(e){return false;}};
  function pcCls(){document.documentElement.classList.toggle('pc',UI.pc());}pcCls();
  try{matchMedia('(pointer:fine)').addEventListener('change',pcCls);}catch(e){}
  document.addEventListener('DOMContentLoaded',function(){UI.refresh();});
  W.addEventListener('load',function(){UI.refresh();});
  W.UI=UI;
})();
