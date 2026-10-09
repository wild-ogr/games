'use strict';
/* MGA (буст 09.10): общий набор затей №4–7 — «Буква за буквой», «Угадай год», «Хронология», «Пары». Журнал: hobby-analytics/release-i/viktorina-boost/logs/MGA.md.
   Наружу — только window.VMA (приставка помощника MGA: vma*, CSS-классы .vma-…; грабля 08.10 — одинаковые имена у разных помощников ломали игры при слиянии).
   Договор — шапка js/vmg-core.js (MG0): шапку с названием и ✕, окно итогов, награды и потолок рисует оболочка; вопросы — через o.take (свой круг S.vmg.sn; S.seen не трогаем).
   Здесь: генератор, перемешивание, «вопрос → карточка» (слово, год-карточка, пара) по базе (window.QDB), рамка затеи (ведущий + реплика + полоска хода),
   клавиши ПК через host.keys (русские буквы при любой раскладке), подгонка под окно, звуки.
   Подключать ПОСЛЕ js/vmg-core.js и ДО js/vmg-bukva.js / vmg-god.js / vmg-hrono.js / vmg-pary.js. */
(function(){if(typeof VMG_REG!=='function')return;
var VMA={_st:{}};   // _st[id] — состояние текущего захода (для проверок)

/* ---------- мелочи ---------- */
VMA.rng=function(seed){var s=(seed>>>0)||1;return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
VMA.esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
VMA.shuf=function(a,R){R=R||Math.random;for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;};
VMA.cap=function(s){s=String(s||'').trim();return s.charAt(0).toUpperCase()+s.slice(1);};
VMA.snd=function(host,k){try{var s=host&&host.snd||window.SND;if(s&&typeof s[k]==='function')s[k]();}catch(e){}};
VMA.buzz=function(ms){try{if(typeof buzz==='function')buzz(ms);}catch(e){}};
VMA.pc=function(){try{if(window.VMG&&typeof VMG.pc==='function')return VMG.pc();return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}};
VMA.calm=function(o){try{return !!(o&&o.calm)||(typeof calm==='function'&&calm());}catch(e){return false;}};
VMA.kc=function(lbl){return '<span class="vma-kc" aria-hidden="true">'+VMA.esc(lbl)+'</span>';};
VMA.face=function(who,m){try{if(typeof portrait==='function')return portrait(who,m||'norm');if(window.LK)return LK.who(who,m||'norm');}catch(e){}return '';};

/* ---------- банки из базы вопросов: «вопрос → карточка затеи» (null — не годится) ---------- */
function db(){return window.QDB||[];}
var norm=function(s){return String(s).replace(/ё/g,'е').replace(/Ё/g,'Е');};
VMA.norm=norm;
/* слово: ответ — одно слово 5–9 русских букв (без дефиса/пробела), лёгкий вопрос (e или d 1–2), слово не подсказано в самом вопросе */
VMA.wordOf=function(q){var a=q&&q.a&&q.a[0];if(!a||!/^[А-ЯЁа-яё]{5,9}$/.test(a))return null;if(!(q.e||q.d<=2))return null;
  var W=norm(a).toUpperCase(),ql=norm(q.q).toUpperCase();if(ql.indexOf(W.slice(0,Math.min(5,W.length-1)))>=0)return null;
  return {i:q.i,t:q.t,w:W,q:q.q,x:q.x||''};};
/* год-карточка: 1) «В каком году …?» с ответом-годом; 2) пояснение x с ОДНИМ годом (1000–2029, «… году/года»), год не назван ни в вопросе, ни в вариантах.
   {i, y, ev — событие с «…» вместо года, ctx — вопрос и ответ, к которому это пояснение, own — понятно без ctx, full — полный текст, t — тема} */
var YR=/(^|[^\d–—-])(1\d{3}|20[0-2]\d)(?![\d–—-])/g;
VMA.yearOf=function(q){if(!q||!q.a)return null;var m=/^В каком году (.+)\?$/.exec(q.q),a=q.a[0];
  if(m){if(!/^\d{3,4}$/.test(a))return null;var y=+a;if(y<800||y>2029||/\d{3,4}/.test(m[1]))return null;
    return {i:q.i,y:y,ev:VMA.cap(m[1])+'.',ctx:'',own:1,t:q.t,full:VMA.cap(m[1])+' в '+y+' году.'};}
  var x=q.x||'';if(!x||x.length>140)return null;var ys=[],r;YR.lastIndex=0;while((r=YR.exec(x)))ys.push(r[2]);
  if(ys.length!==1||(x.match(/\d{3,4}/g)||[]).length!==1)return null;var y2=ys[0];
  if(!new RegExp(y2+'\\s*(году|года|г\\.)').test(x)||/-х|век|гг\./.test(x))return null;
  if((q.q+' '+q.a.join(' ')).indexOf(y2)>=0)return null;
  var ev=x.replace(y2,'…');return {i:q.i,y:+y2,ev:ev,ctx:q.q+' — '+a,own:/«/.test(ev)?1:0,t:q.t,full:x};};
/* пара: «кто снял/написал… «X»?», «Столица X — это…?», «Какой город — столица X?» → {k:вид, l:левая карточка, r:правая, i:id} */
var KIND={
  film:{n:'Фильм — режиссёр',re:/^Кто (?:снял|режиссёр|поставил) (фильма?|мультфильма?)\s*(«[^«»]+»)\?$/,l:function(m){return(/^муль/.test(m[1])?'мульт ':'')+m[2];}},
  book:{n:'Книга — автор',re:/^Кто (?:написал|автор|сочинил) (роман|романа|повесть|повести|поэму|поэмы|сказку|сказки|книгу|книги|пьесу|пьесы|рассказ|рассказа|басню|басни|комедию|комедии|стихотворение|стихотворения)\s*(«[^«»]+»)\?$/,
    l:function(m){var f={романа:'роман',повести:'повесть',поэму:'поэма',поэмы:'поэма',сказку:'сказка',сказки:'сказка',книгу:'книга',книги:'книга',пьесу:'пьеса',пьесы:'пьеса',рассказа:'рассказ',басню:'басня',басни:'басня',комедию:'комедия',комедии:'комедия',стихотворения:'стихотворение'};return(f[m[1]]||m[1])+' '+m[2];}},
  pic:{n:'Картина — художник',re:/^Кто (?:написал|автор|нарисовал) (?:картину|картины|полотно)\s*(«[^«»]+»)\?$/,l:function(m){return m[1];}},
  muz:{n:'Музыка — композитор',re:/^Кто (?:написал|сочинил|автор) (оперу|оперы|балет|балета|музыку балета|музыку к балету)\s*(«[^«»]+»)\?$/,l:function(m){return(/опер/.test(m[1])?'опера ':'балет ')+m[2];}},
  rcap:{n:'Республика — столица',re:/^Столица (.+) — это…\?$/,l:function(m){return 'Столица '+m[1];}},
  wcap:{n:'Страна — столица',re:/^(?:Какой город (?:—|является) столиц\S* (.+)|Как называется столица (.+))\?$/,l:function(m){return 'Столица '+(m[1]||m[2]);}}};
VMA.KIND=KIND;
VMA.pairOf=function(q,kind){var a=q&&q.a&&q.a[0];if(!a||a.length>24)return null;for(var k in KIND){if(kind&&k!==kind)continue;var m=KIND[k].re.exec(q.q);
  if(m){var l=KIND[k].l(m);return l.length<=34?{k:k,l:l,r:a,i:q.i}:null;}}return null;};
/* весь банк (для подсчётов и стенда) */
var cache={};
function bank(k,f){if(!cache[k])cache[k]=db().map(function(q){return f(q);}).filter(Boolean);return cache[k];}
VMA.words=function(){return bank('w',VMA.wordOf);};VMA.years=function(){return bank('y',VMA.yearOf);};VMA.pairs=function(){return bank('p',function(q){return VMA.pairOf(q);});};
/* take(o,n,f,card): n карточек через оболочку — o.take (свой круг затей S.vmg.sn, «уже видел» S.seen НЕ трогается, вопросы Викторины дня не берутся,
   в Затее дня — одинаково у всех); без оболочки (sim/проверка) — случайно из всей базы. card(q) → карточка или null. */
VMA.take=function(o,n,f,card){f=f||{};var t0=f.test;f.test=function(q){return !!card(q)&&(!t0||t0(q));};
  var qs=o&&typeof o.take==='function'?o.take(n,f,{mark:0}):VMA.shuf(db().filter(f.test),o&&o.rnd).slice(0,n);
  return qs.map(card).filter(Boolean);};
/* FIX1: take берёт с запасом БЕЗ отметки в круге — затея отмечает только то, что реально показала: VMA.mark(o, карточки) */
VMA.mark=function(o,cards){try{if(o&&typeof o.mark==='function')o.mark(cards||[]);}catch(e){}return cards;};

/* ---------- рамка затеи: ведущий + реплика + полоска хода; main — поле игры; foot — кнопки/клавиатура ---------- */
VMA.frame=function(host,o,cfg){var el=host.el;el.innerHTML='';var R=document.createElement('div');
  R.className='vma vma-'+cfg.id+(VMA.pc()?' vma-pcm':'')+(VMA.calm(o)?' vma-calm':'');R.setAttribute('role','application');
  R.innerHTML='<div class="vma-top"><div class="vma-who" aria-hidden="true">'+VMA.face(cfg.who,'norm')+'</div>'+
    '<div class="vma-hd"><div class="vma-say" aria-live="polite"></div></div></div>'+
    '<div class="vma-prog" aria-hidden="true"></div><div class="vma-main"></div><div class="vma-foot"></div>';
  el.appendChild(R);
  var f={root:R,main:R.querySelector('.vma-main'),foot:R.querySelector('.vma-foot'),sayEl:R.querySelector('.vma-say'),whoEl:R.querySelector('.vma-who'),progEl:R.querySelector('.vma-prog'),mood:'norm',
    say:function(t,mood){f.sayEl.innerHTML=t;if(mood&&mood!==f.mood){f.mood=mood;f.whoEl.innerHTML=VMA.face(cfg.who,mood);}
      f.sayEl.classList.remove('vma-pop');void f.sayEl.offsetWidth;f.sayEl.classList.add('vma-pop');},
    prog:function(n,cur,res){var s='';for(var i=0;i<n;i++)s+='<i class="'+(i<res.length?(res[i]>=2?'ok':res[i]>0?'mid':'no'):i===cur?'cur':'')+'"></i>';f.progEl.innerHTML=s;try{if(typeof host.top==='function')host.top(Math.min(n,res.length+(cur>=0&&cur>=res.length?1:0))+' из '+n);}catch(e){}}};
  return f;};
/* клавиши ПК: пока затея на экране и не на паузе/окне оболочки; fn(key,e) → true — клавиша съедена */
VMA.keys=function(host,fn){if(typeof host.keys==='function'){host.keys(fn);return;}
  var h=function(e){if(host.paused||e.ctrlKey||e.metaKey||e.altKey||!host.el.isConnected)return;try{if(fn(e.key,e))e.preventDefault();}catch(x){console.error(x);}};
  window.addEventListener('keydown',h);host.onQuit(function(){window.removeEventListener('keydown',h);});};
/* русская буква по клавише при любой раскладке (e.code → ЙЦУКЕН) */
var RUK={KeyQ:'Й',KeyW:'Ц',KeyE:'У',KeyR:'К',KeyT:'Е',KeyY:'Н',KeyU:'Г',KeyI:'Ш',KeyO:'Щ',KeyP:'З',BracketLeft:'Х',BracketRight:'Ъ',KeyA:'Ф',KeyS:'Ы',KeyD:'В',KeyF:'А',KeyG:'П',KeyH:'Р',KeyJ:'О',KeyK:'Л',KeyL:'Д',Semicolon:'Ж',Quote:'Э',
  KeyZ:'Я',KeyX:'Ч',KeyC:'С',KeyV:'М',KeyB:'И',KeyN:'Т',KeyM:'Ь',Comma:'Б',Period:'Ю',Backquote:'Ё'};
VMA.ruKey=function(e){var k=e.key||'';if(/^[а-яёА-ЯЁ]$/.test(k))return norm(k).toUpperCase();var r=RUK[e.code];return r?norm(r):'';};
/* «на компьютере: …» — строка-подсказка на первые секунды (только при мыши) */
VMA.pcHint=function(f,txt){if(!VMA.pc())return;var d=document.createElement('div');d.className='vma-pch';d.innerHTML=txt;f.root.appendChild(d);setTimeout(function(){d.classList.add('vma-out');},5000);setTimeout(function(){d.remove();},5600);};
/* одна кнопка «Дальше» в подвале: Enter/Пробел */
VMA.nextBtn=function(f,txt,cb){f.foot.innerHTML='<button class="vma-btn vma-go" type="button">'+VMA.esc(txt)+VMA.kc('Enter')+'</button>';var b=f.foot.firstChild;b.onclick=function(){if(b.disabled)return;b.disabled=true;cb();};b.focus&&b.focus({preventScroll:true});return b;};
/* подгонка под окно: поле не влезает без прокрутки → по очереди классы vma-t1 (мельче шапка), vma-t2 (без названия, плотнее поле), vma-t3 (без ведущего).
   Зовётся после каждой перерисовки; на смену размера — сама (ResizeObserver/onResize). Последний выход — прокрутка поля (подвал с кнопками виден всегда). */
VMA.fit=function(f){var R=f.root,m=f.main;if(!R.isConnected)return;R.classList.remove('vma-t1','vma-t2','vma-t3');
  for(var k=1;k<=3&&m.scrollHeight>m.clientHeight+1;k++)R.classList.add('vma-t'+k);};
VMA.autofit=function(host,f){var go=function(){VMA.fit(f);};f.fit=go;host.onResize(go);try{if(window.ResizeObserver){var ro=new ResizeObserver(function(){if(!f._fitting){f._fitting=1;requestAnimationFrame(function(){f._fitting=0;go();});}});ro.observe(f.root);host.onQuit(function(){ro.disconnect();});}}catch(e){}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);};
/* после хода внизу поля появилось пояснение — докрутить к нему (если не влезло) */
VMA.reveal=function(f){var m=f.main;setTimeout(function(){try{m.scrollTo?m.scrollTo({top:m.scrollHeight,behavior:'smooth'}):(m.scrollTop=m.scrollHeight);}catch(e){m.scrollTop=m.scrollHeight;}},60);};
VMA.tier=function(sc,cut){return sc>=cut[2]?3:sc>=cut[1]?2:sc>=cut[0]?1:0;};
window.VMA=VMA;
})();
