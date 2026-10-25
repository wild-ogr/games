'use strict';
/* ================= zb3-MAIL-s — «Почта бабы Зины» (почтовый ящик двора), поздняя часть старта. 25.10.2026, ветка z3-mail =================
   BUILD 25.10 (диета): в старте js/zb3-mail.js — только флаг z3m, поле S.z3m и обёртка ящика двора (M.ynote/ybadge/yhot/ygo — отсюда); этот файл — Z3.late с 1-го дня.
   Журнал: hobby-analytics/release-i/zina-boost3/Z3-MAIL.md. Ленивая часть — js/zb3-mail-x.js (письма, «Напиши Зине», кроссворд в подарок,
   «приведи друга»), тексты — js/zb3-mail-data.js (tools/zb3_mail_data.py из content/zb3/mail-stub.txt + z3-text/letters.txt).
   Флаги (?off=…): z3m — весь ящик (двор показывает свой ящик YARD с пирожком); z3m-lt — «Напиши Зине»; z3m-cw — кроссворд в подарок;
     z3m-fr — награда и письмо за пришедшего друга.
   Поле S.z3m (≤1,5 КБ): v день последнего захода, d день последнего «дневного» письма, m последний юбилей (уровень), c глав закрыто (письмо),
     h последние праздники (до 3 меток 'fny-2026', через запятую), f неделя письма об итоге развилки, k серия задания дня (живая), sb день сорванной серии (письмо было),
     w день последнего письма Зине, wn писем в этот день, n писем Зине всего, nm подпись игрока, p загадок P.S. разгадано,
     g кроссвордов отправлено, gr полученные открытки (до 6 меток через запятую), fr пришло друзей. Архив писем — localStorage z3-mbox (≤40).
   Ящик во дворе: Z3.yardAdd({id:'mail'}) заменяет ящик YARD; пирожок первого письма (Z3Y.DEF.mail) — как у YARD, пока не съеден.
   Открытка: метка cw=… — в #… адреса или в ?hash=… (ОК кладёт свои параметры в hash); код gift=КОД «приведи друга» читает дом (Z3.srv, ref).
   STAT: z3m {a: show|new|read|ps|lt|re|cw|fr, …} — список в журнале. Старые WebView: без ?. ?? .at :has. */
(function(){
var M=window.Z3MAIL;
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||!window.Z3||!Z3.on||!M||!M.ON||M.F)return;
var F={lt:Z3.reg('z3m-lt',{t:'Почта: «Напиши Зине» (ответ утром)',who:'MAIL'}),cw:Z3.reg('z3m-cw',{t:'Почта: кроссворд про Галю в подарок (открытка)',who:'MAIL'}),
  fr:Z3.reg('z3m-fr',{t:'Почта: подарок за пришедшего друга',who:'MAIL'})};
var num=M.num,str=M.str,DEF=M.DEF;
function Z(){if(!S.z3m||typeof S.z3m!=='object')S.z3m=JSON.parse(JSON.stringify(DEF));return S.z3m;}
function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function box(){var b=lsG('z3-mbox',[]);return b instanceof Array?b:[];}
function unread(){var n=0;box().forEach(function(x){if(x&&x.u)n++;});return n;}
function ev(a,p){var o={a:a},k;for(k in p||{})o[k]=p[k];Z3.ev('z3m',o);}

/* ---------- метка открытки из ссылки друга: #cw=… (VK — в hash; ОК — в ?hash=); код gift=… читает дом (zb3-house ref) ---------- */
(function(){try{var h=location.hash||'',q=/[?&]hash=([^&]*)/.exec(location.search);if(q)h+='&'+decodeURIComponent(q[1]);
  var c=/(?:^|[#&])cw=([0-9a-z-]{5,60})/.exec(h);if(c&&(','+Z().gr+',').indexOf(','+c[1]+',')<0)lsS('z3-cwin',c[1]);}catch(e){}})();

/* ---------- ящик во дворе (пирожок первого письма — как у YARD, пока не съеден) ---------- */
function Y(){return S.z3y||{};}
function pie(){var y=Y(),d=window.Z3Y&&Z3Y.DEF&&Z3Y.DEF.mail,F0=window.Z3Y0&&Z3Y0.F;if(!d)return null;
  if(y.p&&!y.g&&y.p<=now())return d;if(!((+y.l||0)&1)&&F0&&F0.pie)return d;return null;}
function oven(){var y=Y(),d=window.Z3Y&&Z3Y.DEF&&Z3Y.DEF.mail;return y.p&&!y.g&&y.p>now()&&d?d:null;}
function now(){try{return nowMs();}catch(e){return Date.now();}}
(window.Z3SUB=window.Z3SUB||[]).push({id:'mail',t:'✉️ Письмо от Зины каждый день'});
M.F=F;M.Z=Z;M.ev=ev;M.box=box;M.unread=unread;M.lsG=lsG;M.lsS=lsS;
M.x=function(){return M.ui?Promise.resolve(M):ZB.load('js/zb3-mail-x.js').then(function(){return M;});};
/* ящик во дворе: обёртка в старте (Z3.yardAdd id 'mail') зовёт M.ynote/ybadge/yhot/ygo */
M.ynote=function(){var p=pie()||oven();if(p&&p.note)return p.note();var n=unread();return n?(n>1?'новых писем: '+n:'новое письмо'):box().length?'письма Зины':'писем пока нет';};
M.ybadge=function(){var p=pie();if(p&&p.badge){var b=p.badge();if(b)return b;}var n=unread();return n?String(Math.min(n,9)):'';};
M.yhot=function(){var p=pie();if(p&&p.hot&&p.hot())return true;return unread()>0;};
M.ygo=function(){var p=pie();if(p){ZB.safe('z3m-pie',function(){p.go();});return;}ev('show',{s:'yard',u:unread(),d:Math.min(Z3.day(),99)});ZB.go('z3mail',{});};

/* ---------- старая «Написать бабе Зине» (zb2-mail: «Об игре», окно победы) → «Напиши Зине»; копия — в «Отзывы» (fb), как раньше ---------- */
if(F.lt&&window.ZB2MAIL&&ZB2MAIL.go&&!ZB2MAIL.go.__z3){var og=ZB2MAIL.go;ZB2MAIL.go=function(f,back){try{if(typeof hideModal==='function')hideModal();}catch(e){}
  ev('show',{s:f==='win'?'win':'about'});ZB.go('z3mail',{pg:'write',from:f==='win'?'win':'about',back:back});};ZB2MAIL.go.__z3=1;ZB2MAIL.go0=og;}

/* ---------- экран ящика (ленивый) ---------- */
ZB.screen('z3mail',{title:'Почта бабы Зины',render:function(el,op){
  if(M.ui){ZB.safe('z3m-scr',function(){M.render(el,op||{});});return;}
  el.innerHTML='<div style="padding:40px 16px;text-align:center;color:var(--z3-ink2)">✉️ Люся несёт почту…</div>';
  M.x().then(function(){if(ZB.cur==='z3mail')ZB.safe('z3m-scr',function(){M.render(el,op||{});});},
    function(){try{if(typeof toast==='function')toast('Почта не открылась — попробуй ещё раз',3000);}catch(e){}try{if(typeof openMenu==='function')openMenu();}catch(e){}});}});

/* ---------- письма Зины первой: проверка после загрузки, на Доме и после победы (вся логика — в x) ---------- */
var started=0;
function tick(why){if(!Z3.open('mail'))return;M.x().then(function(){ZB.safe('z3m-tick',function(){M.tick(why);});},function(){});}
Z3.whenReady(function(){setTimeout(function(){started=1;tick('ready');},1200);}); // поздняя часть грузится через ~1,2–2,7 с после ready — итог как было (≈2,5 с)
ZB.on('home',function(){if(started)tick('home');});
ZB.levelHook.push(function(i){if(started&&i&&i.ok&&i.end==='win'&&M.ui)ZB.safe('z3m-win',function(){M.tick('win');});});
})();
