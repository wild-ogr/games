'use strict';
/* ================= ob2-core — каркас буста «буст_в2.0» (12.10.2026, поток CORE; журнал hobby-analytics/release-i/oborona-boost2/logs/CORE.md) =================
   Грузится сразу после data.js (нужна розетка META_MODS), до game/ui и до файлов потоков. Без ?. ?? .at() — старые WebView (Chrome 92).
   Флаги:   OB2.off('id') — true, если новинка выключена. Выключают: список OB2_OFF_FILE ниже (правится при сборке), адрес ?off=id1,id2 (?off=all — всё ob2),
            window.OB2_OFF (массив или строка «id1,id2», задать до загрузки). OB2.reg(id,{s:'ПОТОК',t:'что это'}) — объявить новинку; OB2.flags() — список для сборщика.
   События: OB2.on(ev,fn,id) / OB2.emit(ev,...) — вместо правок чужого кода. id — флаг: выключен → обработчик молчит. Ошибка обработчика — console.warn (до 5), игра идёт.
            Сам каркас шлёт: 'run'(G) — начало боя, 'end'(G,win) — конец боя (может прийти дважды после «ещё попытки»), 'x2'(G,gold), 'menu' — меню показано после запуска/облака.
   Поля сохранения: OB2.field('l',{id,def,fix,merge}) → S.o2l (один объект на поток, ≤1,5 КБ, только числа и короткие строки). FIX/MERGE — через META_MODS;
            merge по умолчанию — «максимум»: числа — max, строки — бо́льшая (даты 'ГГГГ-ММ-ДД' сравниваются верно), объекты — по ключам вглубь.
            Флаг выключен → поле не заводится (сохранение как в v3.1), но пришедшее из облака не теряется. OB2.size() — длины полей S.o2*.
   Гнёзда:  OB2.slot(имя,id,fn,prio) — 'map'(el) главная/карта · 'today'(a) фишки «Сегодня» {id,hot,t,fn} · 'win'(G,win)→{h,bind} строка в окне итогов (показывается ОДНА — с большим prio)
            · 'izba'(el) экран «Дозорной избы» · 'vil'(el) деревня.
   Окна при входе: OB2.enter(id,prio,fn) — fn() открывает своё окно и возвращает true, иначе false. При входе (меню после запуска/облака) — не больше ОДНОГО окна
            за запуск: по убыванию prio, первое вернувшее true; если окно уже открыто (награда за вход и т. п.) — молчим.
            prio ≥100 — раньше старых окон входа (казна «Пока тебя не было», итоги «Соседних застав»), <100 — после них (если они промолчали).
   Лениво:  OB2.need('js/x.js') — загрузить файл по требованию (обещание, повторно не грузит). Всё новое — так (бюджет старта +0 КБ). */
var OB2=(function(){
  var OFF_FILE=[];   // OB2_OFF_FILE: id новинок, выключенных в сборке (не успели к отсечке) — например ['let','lavka']
  var off={},all=false,feats={},evs={},slots={},enters=[],fields={},errN=0,loaded={},entered=false;
  function add(x){if(!x)return;var a=typeof x==='string'?x.split(','):x;for(var i=0;i<a.length;i++){var k=String(a[i]).trim();if(k==='all'||k==='ob2')all=true;else if(k)off[k]=1;}}
  add(OFF_FILE);try{add(window.OB2_OFF);}catch(e){}
  try{var m=/[?&]off=([^&#]*)/.exec(location.search);if(m)add(decodeURIComponent(m[1]));}catch(e){}
  function isOff(id){return !!id&&(all||!!off[id]);}
  function err(w,x){errN++;if(errN<=5)console.warn('ob2 '+w+': '+(x&&x.message||x));}
  function reg(id,o){o=o||{};feats[id]={id:id,s:o.s||'',t:o.t||''};return !isOff(id);}
  function flags(){var r=[];for(var k in feats)r.push({id:k,s:feats[k].s,t:feats[k].t,off:isOff(k)});for(var j in off)if(!feats[j])r.push({id:j,s:'?',t:'',off:true});return r;}
  function on(ev,fn,id){(evs[ev]=evs[ev]||[]).push({fn:fn,id:id});}
  function emit(ev){var a=Array.prototype.slice.call(arguments,1),L=evs[ev],r;if(!L)return;
    for(var i=0;i<L.length;i++){if(isOff(L[i].id))continue;try{var q=L[i].fn.apply(null,a);if(r===undefined)r=q;}catch(x){err(ev+(L[i].id?'/'+L[i].id:''),x);}}return r;}
  function slot(name,id,fn,prio){(slots[name]=slots[name]||[]).push({id:id,fn:fn,p:+prio||0});slots[name].sort(function(a,b){return b.p-a.p;});}
  function fill(name){var a=Array.prototype.slice.call(arguments,1),L=slots[name];if(!L)return;
    for(var i=0;i<L.length;i++){if(isOff(L[i].id))continue;try{L[i].fn.apply(null,a);}catch(x){err(name+'/'+L[i].id,x);}}}
  function enter(id,prio,fn){enters.push({id:id,p:+prio||0,fn:fn});enters.sort(function(a,b){return b.p-a.p;});}
  function modalOn(){try{var m=document.getElementById('modal');return !!(m&&m.classList.contains('on'));}catch(e){return false;}}
  // hi=true — prio ≥100 (раньше старых окон входа: «Пока тебя не было», итоги турнира); hi=false — остальные (после них, если те промолчали)
  function runEnter(hi){if(entered||(typeof G!=='undefined'&&G))return;if(modalOn()){entered=true;return;}if(!hi)entered=true;
    for(var i=0;i<enters.length;i++){var e=enters[i];if(isOff(e.id)||(e.p>=100)!==hi)continue;try{if(e.fn()===true){entered=true;return true;}}catch(x){err('enter/'+e.id,x);}if(modalOn()){entered=true;return true;}}}
  function mx(a,b){ // слияние «максимум»: a — итог (меняется), b — вторая сторона
    for(var k in b){var x=b[k],y=a[k];
      if(typeof x==='number'){if(!(typeof y==='number')||x>y)a[k]=x;}
      else if(typeof x==='string'){if(!(typeof y==='string')||x>y)a[k]=x;}
      else if(x&&typeof x==='object'&&!Array.isArray(x)){if(!y||typeof y!=='object'||Array.isArray(y))a[k]=y={};mx(y,x);}
      else if(y===undefined)a[k]=x;}
    return a;}
  function field(l,o){o=o||{};var key='o2'+l,id=o.id||key;fields[l]={key:key,id:id};
    var ok=function(v){return v&&typeof v==='object'&&!Array.isArray(v);};
    var FIX=function(s){s=s||S;var v=s[key];if(v==null&&isOff(id))return;if(!ok(v))v=s[key]=o.def?o.def():{};if(o.fix)try{o.fix(v,s);}catch(x){err('fix/'+key,x);}};
    var MERGE=function(other,res){var b=other&&other[key];if(!ok(b))return;if(!ok(res[key]))res[key]=o.def?o.def():{};
      try{if(o.merge)o.merge(res[key],b);else mx(res[key],b);}catch(x){err('merge/'+key,x);}};
    if(typeof META_MODS!=='undefined')META_MODS.push({id:key,FIX:FIX,MERGE:MERGE});
    try{if(typeof S!=='undefined')FIX(S);}catch(x){}   // первая загрузка: META_HK('FIX') уже прошёл — чиним сами
    return key;}
  function size(){var r={};try{for(var l in fields){var v=S[fields[l].key];r[fields[l].key]=v==null?0:JSON.stringify(v).length;}}catch(e){}return r;}
  function need(src,ms){if(!loaded[src])loaded[src]=loadScript(src,ms||20000).catch(function(e){delete loaded[src];throw e instanceof Error?e:new Error('need '+src+(e&&e.type?' '+e.type:' timeout'));});   /* OB-ERR 17.10: причина отказа — с именем файла (было «promise: undefined» по таймауту) */return loaded[src];}
  // крючки движка → гнёзда и события (META_MODS: FIX/MERGE и пр. см. data.js «OB:META1»)
  if(typeof META_MODS!=='undefined')META_MODS.push({id:'ob2',
    RUN:function(G){emit('run',G);},
    END:function(G,win){emit('end',G,win);},
    X2:function(G,v){emit('x2',G,v);},
    MAP:function(el){fill('map',el);},
    TODAY:function(a){fill('today',a);},
    VIL:function(el){fill('vil',el);},
    WIN:function(G,win){var L=slots.win;if(!L)return;var best=null;
      for(var i=0;i<L.length&&!best;i++){if(isOff(L[i].id))continue;try{var q=L[i].fn(G,win);if(q&&q.h)best=q;}catch(x){err('win/'+L[i].id,x);}}
      if(!best)return;try{var mb=document.getElementById('mBody');if(!mb||mb.querySelector('.ob2win'))return;
        var d=document.createElement('div');d.className='goal ob2win';d.setAttribute('data-fit','3');d.innerHTML=best.h;
        var bt=mb.querySelector('.btns');if(bt)mb.insertBefore(d,bt);else mb.appendChild(d);if(best.bind)best.bind(d);if(typeof fitModal==='function')fitModal();}catch(x){err('win',x);}},
    MENU:function(){emit('menu');return runEnter(true);}});
  // второй крючок MENU — последним в META_MODS (после всех модулей меты): окна входа с prio <100
  try{document.addEventListener('DOMContentLoaded',function(){if(typeof META_MODS!=='undefined')META_MODS.push({id:'ob2late',MENU:function(){return runEnter(false);}});
    // «Награда за вход» — тоже окно входа: показали её → своих окон в этот запуск уже не открываем
    var lo=window.loginOffer;if(typeof lo==='function')window.loginOffer=function(){var r=lo.apply(this,arguments);if(r)entered=true;return r;};});}catch(e){}
  return {off:isOff,reg:reg,flags:flags,on:on,emit:emit,slot:slot,fill:fill,enter:enter,field:field,size:size,need:need,merge:mx,
    _st:function(){return {off:off,all:all,feats:feats,enters:enters.length,entered:entered,fields:fields};}};
})();
