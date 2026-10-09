/* ui-core.js — «гнёзда» и роутер экранов «Дворовой викторины» (поток UX, буст 09.10.2026).
   Грузится в <head> ДО основного скрипта, поэтому модули других потоков могут класть сюда своё в любой момент
   (их <script> можно подключать и до, и после основного — гнёзда опрашиваются при каждой отрисовке).

   ДОГОВОР (менять только через поток UX):
   ─ homeSlots   — плитки ленты «Сегодня во дворе» на главном.
       homeSlots.push({id:'car-today', order:20, render:ctx=>html|null, mount:(el,ctx)=>{}})
       ctx = {S, lvl}. render вернул пусто → плитки нет. Плитка — <div class="hs" data-slot=id>…</div>, html внутри — ваш.
       Удобная заготовка плитки: UI.tile({ic:'📅', t:'Заголовок', s:'подпись', tag:'новое', cls:'gold', go:'board'}) → html
       (go — имя экрана для UI.go, по нажатию; иначе вешайте onclick в mount).
   ─ navSlots    — кнопки нижней панели (Двор · Темы · Доска · Медали · Лавка — пять своих UX, другие могут ДОБАВИТЬ/ЗАМЕНИТЬ go).
       navSlots.push({id:'yard', order:10, ic:'🏠', t:'Двор', go:'yard'|fn, dot:()=>bool})  (одинаковый id — последний побеждает)
   ─ resultSlots — строки окна итога лестницы (под наградами, до кнопок).
       resultSlots.push({id:'car-pts', order:10, render:ctx=>html|null, mount:(el,ctx)=>{}})
       ctx = {kind:'win'|'pass'|'lose'|'take', good, prize, topic, pass, res:[1,0,…], lvl, G}
       html — короткая строка/карточка; рекомендуем <p class="goal tipl">…</p> (окно само ужимается fitCard).
   ─ preTopicSlots — перед началом лестницы по теме (карточка «Разминка перед темой · Сразу играть»).
       preTopicSlots.push({id:'warmup', order:10, when:topic=>bool, render:topic=>html, mount:(el,topic,start)=>{}})
       start() — начать лестницу (кнопка «Сразу играть» есть всегда). Ни одно гнездо не ответило when → лестница сразу.
   ─ qSlots      — плашка вопроса (сверху карточки вопроса; цена, метки).
       qSlots.push({id:'price', order:10, render:ctx=>html|null})
       ctx = {q, mode:'lad'|'day'|'duel'|…, step:1..10, G}
   ─ answerHook  — РОВНО один раз на вопрос, когда он решён (верно / окончательно неверно; страховка и вторая попытка — внутри).
       answerHook.push(info=>{})   info = {id, ok:1|0, hint:''|'f'|'n'|'z'|'fn'… (f 50/50, n сосед, z Зина — взятые НА ЭТОМ вопросе),
                                           mode:'lad'|'day'|'duel'|…, step:1..10, price:число|null (priceOf из js/price.js),
                                           tries:неверных нажатий до итога, sec:сек. от показа до первого нажатия (без свёрнутого времени),
                                           d:сложность, t:тема, lvl:уровень игрока}
       Свои режимы (табло и т. п.) зовут UI.answered(info) с теми же полями — и все подписчики получат событие.
   ─ UI.go(screen, opts) — общий роутер. Встроены: menu, topics, game(?), medals, shop, daily, duel, settings, gifts, how, about.
       Свой экран: UI.screen('board', opts=>{…}) ; свой <section class="screen" id="scr-board"> показывать UI.show('scr-board').
       UI.on('screen', fn) — уведомление о смене экрана (fn(name)).
   Ошибка в чужом гнезде не роняет игру (try/catch, console.warn). */
(function(){'use strict';
  var W=window;
  ['homeSlots','navSlots','resultSlots','preTopicSlots','qSlots','answerHook'].forEach(function(n){if(!Array.isArray(W[n]))W[n]=[];});
  var scr={},ls={};
  function warn(s,e){try{console.warn('UI slot '+s,e);}catch(_){}}
  function list(a){var m={},o=[];for(var i=0;i<a.length;i++){var x=a[i];if(!x)continue;if(typeof x==='function')x={render:x};var k=x.id||('#'+i);if(m[k]!=null)o[m[k]]=x;else{m[k]=o.length;o.push(x);}}
    return o.filter(Boolean).sort(function(a,b){return (a.order!=null?a.order:50)-(b.order!=null?b.order:50);});} // FIX1: order:0 («Финал района») раньше считался 50
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var UI={
    list:list,
    // отрисовать гнездо в контейнер: wrap — тег/класс обёртки каждой записи
    fill:function(el,arr,ctx,cls){if(!el)return 0;var h=[],it=list(arr),ok=[];
      for(var i=0;i<it.length;i++){var x=it[i],r=null;try{r=x.render?x.render(ctx):null;}catch(e){warn(x.id,e);}
        if(r!=null&&r!==''&&r!==false){ok.push(x);h.push('<div class="'+(cls||'slot')+'" data-slot="'+esc(x.id||'')+'">'+(typeof r==='string'?r:'')+'</div>');}
        if(r&&typeof r==='object'&&r.nodeType){ok.push(x);h.push('<div class="'+(cls||'slot')+'" data-slot="'+esc(x.id||'')+'" data-node="'+(ok.length-1)+'"></div>');x.__n=r;}}
      el.innerHTML=h.join('');
      var kids=el.children;for(var j=0;j<ok.length;j++){var y=ok[j],k=kids[j];if(!k)continue;if(y.__n){k.appendChild(y.__n);y.__n=null;}
        var g=k.querySelector('[data-go]');if(g&&!g.onclick)(function(g){g.onclick=function(){UI.go(g.getAttribute('data-go'));};})(g);
        if(y.mount)try{y.mount(k,ctx);}catch(e){warn(y.id,e);}}
      if(W.LK&&LK.on&&LK.on()&&LK.scan)try{LK.scan(el);}catch(e){}
      return ok.length;},
    // строки (без обёртки) — для окна итога
    html:function(arr,ctx){var h='',it=list(arr);for(var i=0;i<it.length;i++){var x=it[i],r=null;try{r=x.render?x.render(ctx):null;}catch(e){warn(x.id,e);}if(r&&typeof r==='string')h+='<div class="rslot" data-slot="'+esc(x.id||'')+'">'+r+'</div>';}return h;},
    mount:function(root,arr,ctx){var it=list(arr);for(var i=0;i<it.length;i++){var x=it[i];if(!x.mount)continue;var el=root&&root.querySelector('[data-slot="'+(x.id||'')+'"]');if(el)try{x.mount(el,ctx);}catch(e){warn(x.id,e);}}},
    tile:function(o){o=o||{};return '<button class="hsT '+esc(o.cls||'')+'"'+(o.go?' data-go="'+esc(o.go)+'"':'')+'>'+(o.ic?'<span class="hsI">'+esc(o.ic)+'</span>':'')+'<span class="hsB"><b>'+esc(o.t||'')+'</b>'+(o.s?'<small>'+esc(o.s)+'</small>':'')+'</span>'+(o.tag?'<em class="hsTag">'+esc(o.tag)+'</em>':'')+'</button>';},
    answered:function(info){var a=list(W.answerHook);for(var i=0;i<a.length;i++){var f=a[i].fn||a[i].render||a[i];try{if(typeof f==='function')f(info);}catch(e){warn(a[i].id||'answerHook',e);}}},
    screen:function(name,fn){scr[name]=fn;},
    has:function(name){return !!scr[name];},
    cur:'',
    go:function(name,opts){var f=scr[name];if(!f){warn('go',name);return false;}UI.cur=name;try{f(opts);}catch(e){warn('go '+name,e);return false;}UI.emit('screen',name);return true;},
    show:function(id){if(W.__show)W.__show(id);},
    on:function(ev,fn){(ls[ev]=ls[ev]||[]).push(fn);},
    emit:function(ev,a){var l=ls[ev]||[];for(var i=0;i<l.length;i++)try{l[i](a);}catch(e){warn(ev,e);}}
  };
  // ПК (мышь, без сенсора): класс html.pc — подписи клавиш (1–4, Enter) видны только там
  UI.pc=function(){try{return !!(W.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches)&&!('ontouchstart' in W);}catch(e){return false;}};
  function pcCls(){document.documentElement.classList.toggle('pc',UI.pc());}pcCls();
  try{matchMedia('(pointer:fine)').addEventListener('change',pcCls);}catch(e){}
  W.UI=UI;
})();
