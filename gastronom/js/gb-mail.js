'use strict';
/* ================= gb-mail — «Написать тёте Вале» (LTG-GB, 24.10.2026; образец — Зина, slovo/js/zb2-mail*.js; журнал hobby-analytics/release-i/letters-2410/LTG-GB.md) =================
   Свободный текст игрока ≤ 500 знаков → STAT: mail {a:'send', f, l, n (длина), k (тема)} + куски fb {m ≤ 40, n, of, k, l} (на 1-м куске k и l).
   Воронка: mail {a:'show'|'open'|'send'|'cancel', f:'book'|'about'|'win', l} — l = пройдено уровней. Модуль STAT режет строки до 40 → кусок 40.
   Входы: «Книга жалоб и предложений» (gb-book.js, f:'book'), «ℹ️ Об игре» строкой (f:'about'), окно победы «Касса» ссылкой (f:'win') —
   раз в 7 дней с 15-го уровня: только первая победа уровня, не задание дня/режим, не когда в окне важное (ctx.busy), не в demo.
   Окно — свой слой поверх #modal (окно победы под ним не трогаем); клавиши игры, пока окно открыто, молчат (Esc — закрыть).
   Ссылки, домены, мессенджеры, почта, телефоны вычищаются (scrub). Не чаще раза в 20 с. Выключатель: GB.flag('mail') (?gboff=mail).
   Поле сохранения S.gbMl {w — день последнего показа в победе, n — писем всего, d — день последнего письма}; нет/битое → умолчание. */
(function(){
if(typeof GB==='undefined'||window.GBMAIL)return;
var ON=GB.flag('mail'),MAX=500,CH=40,GAP=20e3,FROM=15,EVERY=7,K=['w','n','d'],sentT=0,shown={};
function S_(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
function T(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function el(id){return document.getElementById(id);}
function tap(){try{SND.tap();}catch(e){}}
function sv(){try{save();}catch(e){}}
function day(){var t=Date.now();return Math.floor((t-new Date(t).getTimezoneOffset()*6e4)/864e5);}
function lv(){var s=S_();return s?Math.max(0,(+s.unlocked||1)-1):0;}
function stat(n,p){try{if(window.STAT&&STAT.ev)STAT.ev(n,p);}catch(e){}}
function st(a,f){stat('mail',{a:a,f:f,l:lv()});}

/* ---------- сохранение ---------- */
function fix(s){s=s||S_();if(!s)return null;var v=s.gbMl;if(!v||typeof v!=='object'||Array.isArray(v))v=s.gbMl={w:0,n:0,d:0};
  K.forEach(function(k){v[k]=Math.max(0,Math.floor(+v[k]||0));});return v;}
GB.onSave({id:'mail',keys:['gbMl'],fix:function(s){fix(s);},merge:function(s,d){var v=fix(s),c=d&&d.gbMl;if(!v||!c||typeof c!=='object')return;
  K.forEach(function(k){v[k]=Math.max(v[k],Math.floor(+c[k]||0));});}});

/* ---------- вычистка и отправка ---------- */
var DOM=/(^|[^a-zа-яё0-9_@.-])((?:[a-zа-яё0-9-]+\.)+(?:ru|рф|com|net|org|su|me|io)(?![a-zа-яё0-9])(?:[\/?#](?:[^\s]*[^\s.,!?;:)\u00bb"'])?)?)/gi;
function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f\u007f]+/g,' ');
  t=t.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'[ссылка]').replace(/\S+@\S+\.\S+/g,'[почта]').replace(DOM,'$1[ссылка]').replace(/(^|\s)@[a-z0-9_]{3,}(?:\.[a-z0-9_]+)*/gi,'$1[ссылка]')
    .replace(/\+?\d[\d\s().-]{5,}\d/g,function(m){return m.replace(/\D/g,'').length>=7?'#':m;});
  return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
function send(txt,o){var t=scrub(txt),i,n,l=lv();if(!t)return 0;if(Date.now()-sentT<GAP)return -1;sentT=Date.now();o=o||{};
  var k=o.k?String(o.k).slice(0,12):undefined,p={a:'send',f:o.f||'book',l:l,n:t.length};if(k)p.k=k;stat('mail',p);
  n=Math.ceil(t.length/CH);
  for(i=0;i<n;i++){p={m:t.slice(i*CH,i*CH+CH),n:i+1,of:n};if(!i){if(k)p.k=k;p.l=l;}stat('fb',p);}
  try{if(window.STAT&&STAT.flush)STAT.flush();}catch(e){}
  return n;}

/* ---------- окно письма (свой слой поверх #modal) ---------- */
var TOP=[['like','👍 Хвалю','👍 Praise'],['bug','🐞 Ошибка','🐞 Bug'],['idea','💡 Идея','💡 Idea'],['gripe','📕 Жалоба','📕 Complaint']];
var ov=null,ovF='',ovSent=0;
function close(cancel){if(!ov)return;if(cancel&&!ovSent)st('cancel',ovF);try{ov.parentNode.removeChild(ov);}catch(e){}ov=null;}
function keys(e){if(!ov)return;if(e.key==='Escape'){e.preventDefault();tap();close(1);}e.stopImmediatePropagation();}
window.addEventListener('keydown',keys,true);
function open(f){if(!ON)return;f=f==='win'||f==='about'?f:'book';close(1);ovF=f;ovSent=0;var k='';
  st('open',f);
  var say=f==='book'?T('Пишите, товарищ покупатель: что нравится, на что жалуетесь, чего в магазине не хватает. Каждую запись прочитаю — у меня с Книгой строго.',
      'Write to me, dear customer: what you like, what you would complain about, what the store is missing. I read every entry — I take the Book seriously.')
    :T('Пишите как есть: что нравится, что не так, чего в магазине не хватает. Я всё прочитаю — за прилавком, между покупателями.',
      'Tell me straight: what you like, what is wrong, what the store is missing. I will read it all — behind the counter, between customers.');
  var host=el('modal'),par=host&&host.parentNode||document.body;
  ov=document.createElement('div');ov.className='modal on gbml-ov';ov.id='gbMl';
  ov.innerHTML='<div class="card gbml"><h2>'+T('✉️ Письмо тёте Вале','✉️ A note to Aunt Valya')+'</h2><p class="gbml-say">'+say+'</p>'+
    '<div class="gbml-top">'+TOP.map(function(x){return '<button type="button" class="gbml-chip" data-k="'+x[0]+'">'+T(x[1],x[2])+'</button>';}).join('')+'</div>'+
    '<textarea id="gbMlT" class="gbml-txt" maxlength="'+MAX+'" rows="5" placeholder="'+T('Уважаемая тётя Валя, …','Dear Aunt Valya, …')+'"></textarea>'+
    '<div class="gbml-cnt"><small>'+T('Имя, телефон и почту не пишите — в Книгу их не вносят.','Please do not write your name, phone or e-mail.')+'</small><b id="gbMlC">0 / '+MAX+'</b></div>'+
    '<div class="row"><button type="button" class="btn green" id="gbMlGo" disabled>'+T('Отправить ✉️','Send ✉️')+'</button><button type="button" class="btn" id="gbMlNo">'+T('Не сейчас','Not now')+'</button></div></div>';
  par.appendChild(ov);
  var ta=el('gbMlT'),bs=el('gbMlGo'),cn=el('gbMlC'),ch=ov.querySelectorAll('.gbml-chip'),i;
  function upd(){var n=ta.value.replace(/^\s+|\s+$/g,'').length;cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=n<2;}
  ta.oninput=upd;
  for(i=0;i<ch.length;i++)ch[i].onclick=function(){tap();var on=!this.classList.contains('on'),j;for(j=0;j<ch.length;j++)ch[j].classList.remove('on');
    if(on)this.classList.add('on');k=on?this.getAttribute('data-k'):'';};
  el('gbMlNo').onclick=function(){tap();close(1);};
  bs.onclick=function(){tap();var r=0;try{r=send(ta.value.slice(0,MAX),{f:f,k:k});}catch(e){r=1;}
    if(r===-1){try{toast(T('Минутку — прошлое письмо ещё записываю','One moment — still writing down your last note'));}catch(e){}return;}
    if(!r)return;ovSent=1;var v=fix();if(v){v.n++;v.d=day();sv();}
    ov.firstChild.innerHTML='<h2>'+T('Записала! 📕','Written down! 📕')+'</h2><p class="gbml-say">'+
      T('Спасибо, прочитаем! Лично ответить не успею — очередь, сами видите, — но каждое слово прочитаю.','Thank you, we will read it! I cannot answer in person — there is a queue, you see — but I will read every word.')+
      '</p><div class="row"><button type="button" class="btn green" id="gbMlOk">'+T('Пожалуйста!','You are welcome!')+'</button></div>';
    el('gbMlOk').onclick=function(){tap();close(0);};};
  setTimeout(function(){try{if(ov&&!('ontouchstart' in window))ta.focus();}catch(e){}},50);}

/* ---------- вход: «ℹ️ Об игре» ---------- */
function hookAbout(){var oa=window.openAbout;if(!ON||typeof oa!=='function'||oa.__gbml)return;
  var w=window.openAbout=function(){var r=oa.apply(this,arguments);GB.safe('mail:about',function(){var mc=el('mcard'),rw=mc&&mc.querySelector('.row');
      if(!rw||el('abMail'))return;var b=document.createElement('button');b.type='button';b.className='set noent';b.id='abMail';
      b.innerHTML='<span>'+T('✉️ Написать тёте Вале<br><small>похвалить, пожаловаться, подсказать</small>','✉️ Write to Aunt Valya<br><small>praise, complain, suggest</small>')+'</span><i>›</i>';
      rw.parentNode.insertBefore(b,rw);b.onclick=function(){tap();open('about');};
      if(!shown.about){shown.about=1;st('show','about');}});return r;};w.__gbml=1;}
hookAbout();GB.on('ready',hookAbout);

/* ---------- вход: окно победы («Касса»), раз в 7 дней с 15-го уровня ---------- */
function want(c){try{if(!ON||window.__demo||!c||!c.first||c.daily||c.busy||(c.g&&c.g.mode)||(+c.l||0)<FROM||lv()<FROM)return false;
    if(window.GBPL&&GBPL.nbTurn&&!GBPL.nbTurn('mail'))return false;
    var v=fix(),d=day();return !!v&&d-v.w>=EVERY&&d-v.d>=EVERY;}catch(e){return false;}}
// fit 5: «Касса» оставляет внизу ≤ 2 справок по важности (gb-win.js PRI) — письмо раз в 7 дней важнее лиги/плана квартала, но уступает подарку,
// карточке, отделу и Книге. Показ (и отсчёт 7 дней) засчитываем, только если ссылку после примерки окна действительно видно.
GB.add(GB.winSlots,{id:'gb-mail',order:90,zone:'extra',fit:5,
  render:function(c){if(!c)return '';if(c.gbMl===undefined)c.gbMl=want(c)?1:0;
    return c.gbMl?'<p class="gbml-win"><button type="button" class="gbml-link noent" id="gbMlWin">'+T('✉️ Напишите тёте Вале пару слов','✉️ Drop Aunt Valya a line')+'</button></p>':'';},
  mount:function(root,c){var b=root&&root.querySelector('#gbMlWin');if(!b)return;b.onclick=function(){tap();open('win');};
    setTimeout(function(){if(!c||c.gbMlS||!b.offsetParent)return;c.gbMlS=1;var v=fix();if(v){v.w=day();sv();}st('show','win');},0);}});

/* ---------- вход: Книга (gb-book.js рисует блок и зовёт GBMAIL.show/open) ---------- */
function showBook(){if(!shown.book){shown.book=1;st('show','book');}}

/* ---------- стили — вставкой ---------- */
(function(){if(el('gbMlCss'))return;var c=document.createElement('style');c.id='gbMlCss';c.textContent=
  '.gbml-ov{z-index:15}.gbml h2{margin:0 0 6px}.gbml .gbml-say{font-size:16px;margin:0 0 10px}'+
  '.gbml-top{display:flex;flex-wrap:wrap;justify-content:center;margin:0 0 8px}.gbml-top>*{margin:3px}'+
  '.gbml-chip{font:inherit;font-size:15px;font-weight:700;min-height:44px;padding:6px 12px;border-radius:999px;border:2px solid #d9c3a0;background:#fffaf0;color:#3b2a1a;cursor:pointer}'+
  '.gbml-chip.on{border-color:#a93312;background:#a93312;color:#fff}'+
  '.gbml-txt{display:block;box-sizing:border-box;width:100%;min-height:110px;max-height:34vh;padding:10px 12px;border-radius:12px;border:2px solid #d9c3a0;font:inherit;font-size:16px;line-height:1.35;resize:vertical;background:#fff;color:#3b2a1a;-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}'+
  '.gbml-txt:focus{outline:none;border-color:#a93312}'+
  '.gbml-cnt{display:flex;justify-content:space-between;align-items:flex-start;margin:6px 0 2px;font-size:14px;color:#6b5e50;text-align:left}.gbml-cnt b{white-space:nowrap;margin-left:8px}'+
  '.gbml-win{margin:6px 0 0;text-align:center}.gbml-link{font:inherit;font-size:15px;font-weight:700;min-height:44px;padding:6px 10px;border:0;background:none;color:#a93312;text-decoration:underline;cursor:pointer}'+
  '@media (max-height:600px){.gbml .gbml-say{font-size:14.5px;margin-bottom:6px}.gbml-txt{min-height:80px}}';
  (document.head||document.documentElement).appendChild(c);})();

window.GBMAIL={on:ON,open:open,send:send,scrub:scrub,showBook:showBook,_fix:fix,_day:day,_want:want,MAX:MAX};
})();
