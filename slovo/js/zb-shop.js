'use strict';
/* ================= zb-shop — витрина «Учительская» (10.10.2026, поток ECO, ветка zb-eco) =================
   Одна витрина покупок вместо разрозненных строк (магазин «Облики», ⚙, «Благодарности»): карточки с картинками, цена кнопкой.
   Товары — PAY_ITEMS (js/pay.js), числа — ZBECO.pay. Узелок новичка — первые 3 дня (ZBECO.uzelokOn), Абонемент — продлевается,
   Ремонт кабинета — жетон для CAB (ZBECO.remontTake), только если есть что ремонтировать (ZBCAB.canRemont, нет CAB — не продаём).
   Платежей нет (мак без ?paytest, ОК, iOS VK, пустой каталог Яндекса) — витрины и входов в неё нет вовсе (PAY.on=false).
   Входы: низ магазина «Облики» (zbShopEntry в extras.js), гнездо главного ZB.homeSlots id 'uchit' (zone 'bottom'), ZB.go('uchit').
   Кнопки покупки — класс pbuy (PAY.bind). Флаг выключения: ZBSHOP.on=false → магазин «Облики» показывает старый список покупок. */
(function(){
  var SH=window.ZBSHOP={on:true,from:null};
  function E(){return window.ZBECO||null;}
  function $(id){return document.getElementById(id);}
  function payOn(){return SH.on&&typeof PAY!=='undefined'&&PAY.on;}
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  // ---------- картинки товаров (свои, 80×80, без внешних файлов) ----------
  var PIC={
    starter:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="70" rx="26" ry="5" fill="#000" opacity=".12"/><path d="M14 66c-2-18 6-30 26-30s28 12 26 30z" fill="#d0342c"/><g fill="#fff" opacity=".9"><circle cx="24" cy="52" r="3"/><circle cx="38" cy="60" r="3"/><circle cx="52" cy="50" r="3"/><circle cx="56" cy="62" r="3"/><circle cx="30" cy="44" r="2.5"/></g><path d="M30 38c-6-10-2-20 4-22 4 6 4 14 6 20M50 38c6-10 2-20-4-22-4 6-4 14-6 20" fill="#b3261e"/><circle cx="40" cy="36" r="6" fill="#b3261e"/><circle cx="64" cy="20" r="9" fill="#f5b400"/><text x="64" y="24.5" font-size="11" font-weight="900" text-anchor="middle" fill="#7a4a00" font-family="Arial">5</text></svg>',
    abon:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="28" ry="4" fill="#000" opacity=".12"/><rect x="14" y="14" width="44" height="56" rx="4" fill="#2563c9"/><rect x="18" y="14" width="40" height="52" rx="3" fill="#3b7be0"/><rect x="21" y="22" width="34" height="12" rx="2" fill="#fbf7ec"/><text x="38" y="30.5" font-size="6.2" font-weight="800" text-anchor="middle" fill="#2563c9" font-family="Arial">АБОНЕМЕНТ</text><path d="M24 42h28M24 48h22M24 54h26" stroke="#cfe0fb" stroke-width="2.5" stroke-linecap="round"/><g transform="rotate(-14 58 54)"><ellipse cx="58" cy="54" rx="15" ry="12" fill="none" stroke="#d0342c" stroke-width="3"/><text x="58" y="58.5" font-size="12" font-weight="900" text-anchor="middle" fill="#d0342c" font-family="Arial">5+</text></g></svg>',
    remont:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="28" ry="4" fill="#000" opacity=".12"/><rect x="10" y="40" width="34" height="28" rx="3" fill="#f3e3c2"/><path d="M10 40l17-14 17 14z" fill="#e8661b"/><rect x="21" y="50" width="12" height="18" fill="#9b6a3c"/><rect x="34" y="46" width="7" height="7" fill="#bfe0ff"/><g transform="rotate(35 56 30)"><rect x="53" y="20" width="6" height="40" rx="2" fill="#9b6a3c"/><rect x="44" y="12" width="24" height="12" rx="3" fill="#5d6781"/></g><g transform="rotate(-30 60 56)"><rect x="57" y="44" width="6" height="22" rx="2" fill="#c98a4b"/><rect x="52" y="36" width="16" height="10" rx="2" fill="#237a3b"/></g></svg>',
    no_ads:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="26" ry="4" fill="#000" opacity=".12"/><rect x="12" y="18" width="56" height="40" rx="6" fill="#27324a"/><rect x="17" y="23" width="46" height="30" rx="3" fill="#7fb1ff"/><path d="M36 30l12 8-12 8z" fill="#fff"/><path d="M32 58l-6 10M48 58l6 10" stroke="#27324a" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="38" r="26" fill="none" stroke="#d0342c" stroke-width="6"/><path d="M22 20l36 36" stroke="#d0342c" stroke-width="6" stroke-linecap="round"/></svg>',
    coins_s:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="24" ry="4" fill="#000" opacity=".12"/><path d="M18 34c0-8 6-12 22-12s22 4 22 12v26c0 6-6 10-22 10S18 66 18 60z" fill="#c0392b"/><path d="M18 34c0 6 8 9 22 9s22-3 22-9" fill="none" stroke="#8e2a20" stroke-width="2"/><circle cx="34" cy="20" r="5" fill="#f5b400" stroke="#c98a00" stroke-width="2"/><circle cx="46" cy="20" r="5" fill="#f5b400" stroke="#c98a00" stroke-width="2"/><circle cx="40" cy="54" r="10" fill="#f5b400" stroke="#c98a00" stroke-width="2.5"/><path d="M40 48.5l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6z" fill="#fff6d0"/></svg>',
    coins_l:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="28" ry="4" fill="#000" opacity=".12"/><ellipse cx="40" cy="46" rx="27" ry="21" fill="#f29bb0"/><circle cx="64" cy="46" r="7" fill="#ee8aa2"/><circle cx="62" cy="45" r="1.6" fill="#8a3a50"/><circle cx="66" cy="45" r="1.6" fill="#8a3a50"/><circle cx="52" cy="38" r="2.4" fill="#27324a"/><path d="M24 30l-4-10 10 6M44 27l4-10 2 11" fill="#ee8aa2"/><rect x="34" y="27" width="12" height="3" rx="1.5" fill="#8a3a50"/><path d="M22 64v6M34 66v5M48 66v5M58 62v6" stroke="#ee8aa2" stroke-width="6" stroke-linecap="round"/><circle cx="40" cy="14" r="8" fill="#f5b400" stroke="#c98a00" stroke-width="2.5"/></svg>',
    tea:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="28" ry="5" fill="#000" opacity=".12"/><ellipse cx="40" cy="66" rx="28" ry="6" fill="#fff" stroke="#2563c9" stroke-width="2"/><path d="M20 38h40v8c0 12-8 20-20 20s-20-8-20-20z" fill="#fff" stroke="#2563c9" stroke-width="2.5"/><path d="M60 42c8 0 10 4 10 8s-4 8-11 8" fill="none" stroke="#2563c9" stroke-width="3"/><ellipse cx="40" cy="39" rx="19" ry="3.5" fill="#a0522d"/><g fill="#2563c9"><circle cx="30" cy="52" r="2"/><circle cx="40" cy="56" r="2"/><circle cx="50" cy="52" r="2"/></g><path d="M32 30c-3-5 3-7 0-12M42 30c-3-5 3-7 0-12M50 30c-3-5 3-7 0-12" stroke="#9aa6bd" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    theme:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="26" ry="4" fill="#000" opacity=".12"/><path d="M40 12c16 0 30 11 30 26 0 9-7 12-13 12-5 0-7 3-5 7 3 6-2 11-12 11-16 0-28-13-28-28s12-28 28-28z" fill="#f3e3c2" stroke="#c98a4b" stroke-width="2"/><circle cx="26" cy="34" r="6" fill="#d0342c"/><circle cx="38" cy="22" r="6" fill="#f5b400"/><circle cx="54" cy="26" r="6" fill="#237a3b"/><circle cx="26" cy="50" r="6" fill="#2563c9"/></svg>'
  };
  // ---------- что продаётся сейчас (порядок витрины) ----------
  function cabCanRemont(){try{return !!(window.ZBCAB&&ZBCAB.canRemont&&ZBCAB.canRemont());}catch(e){return false;}}
  function list(){var e=E(),L=[];if(!payOn())return L;
    function add(id,extra){var pr=PAY.item(id);if(pr)L.push({id:id,pr:pr,x:extra||{}});}
    if(e&&e.uzelokOn()&&!PAY.own('starter'))add('starter',{hot:1,note:'только первые 3 дня'});
    add('abon',{note:e&&e.abonOn()?'действует до '+dt(e.abonTo()):'на 30 дней'});
    if(cabCanRemont()||e&&e.remontLeft())add('remont',{note:e&&e.remontLeft()?'не истрачено: '+e.remontLeft():'вид одного кабинета'});
    add('no_ads');add('coins_s');add('coins_l',{note:'≈ 23 подсказки'});add('tea');
    return L;}
  function dt(ms){var d=new Date(ms);return ('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2);}
  function themeCard(){try{if(typeof THEME==='undefined'||!THEME.open||!payOn())return '';var any=PAY.item('th_kitchen')||PAY.item('th_veranda');if(!any)return '';}catch(e){return '';}
    return '<div class="zt-c"><div class="zt-p">'+PIC.theme+'</div><b>Оформление</b><small>«Кухня бабы Зины», «Веранда» — другой вид игры</small><button class="btn blue small" id="ztTheme">Посмотреть</button></div>';}
  function card(o){var it=PAY_ITEMS[o.id],own=it.perm&&PAY.own(o.id);
    return '<div class="zt-c'+(o.x.hot?' hot':'')+'"><div class="zt-p">'+(PIC[o.id]||'')+'</div><b>'+esc(it.name)+'</b><small>'+esc(it.desc)+'</small>'+
      (o.x.note?'<i class="zt-n">'+esc(o.x.note)+'</i>':'')+
      (own?'<div class="zt-own">✓ куплено</div>':'<button class="btn green pbuy" data-pid="'+esc(o.id)+'">'+(o.id==='abon'&&E()&&E().abonOn()?'Продлить · ':'Купить · ')+PAY.price(o.pr)+'</button>')+'</div>';}
  function head(){var who=window.ZBP&&ZBP.bust?ZB.safe('zbp',function(){return ZBP.bust('vp','happy');}):'';
    return '<div class="dhead zt-h"><div class="av">'+(who||zinaSVG('happy'))+'</div><p>'+(who?'<b>Валентина Петровна, завуч:</b> ':'')+
      esc(pick(['Учительская. Посторонним вход воспрещён — но тебе можно. Только журнал не трогай.','Тут у нас самое ценное: чайник, журнал и вот — полезные вещи для школы.','Всё на благо школы! Пятёрки не продаём — их только заработать.']))+'</p></div>';}
  // ---------- экран ----------
  function render(el){var L=list();
    el.innerHTML='<div class="hdr"><button class="ibtn" id="ztBack">←</button><div class="t"><b>Учительская</b><small>Покупки для школы и для бабы Зины</small></div>'+
      '<div class="coins"><span class="coin"></span><span class="cc">'+(+S.coins||0)+'</span></div></div><div class="scroll" id="ztList">'+head()+
      (L.length?'<div class="zt-g">'+L.map(card).join('')+themeCard()+'</div>':'<p class="zt-e">Покупки сейчас недоступны — загляни позже.</p>')+
      '<p class="zt-f">Пятёрки, классы, открытки и места в лиге не продаются — только честным трудом.</p></div>';
    $('ztBack').onclick=function(){SND.tap();back();};
    PAY.bind(el);var t=$('ztTheme');if(t)t.onclick=function(){SND.tap();THEME.open();};
    if(typeof STAT!=='undefined'&&STAT.ev)STAT.ev('uchit',{a:'open',f:SH.from||'?',n:L.length});}
  function back(){var f=SH.from;SH.from=null;if(f==='shop'&&typeof openShop==='function')openShop();else if(typeof openMenu==='function')openMenu();}
  if(window.ZB){ZB.screen('uchit',{title:'Учительская',render:render});}
  SH.open=function(from){if(!payOn()||!window.ZB)return false;SH.from=from||null;ZB.go('uchit');return true;};
  // ---------- входы ----------
  // низ магазина «Облики»: null — модуль выключен (старый список покупок), '' — платежей нет
  window.zbShopEntry=function(from){if(!SH.on)return null;if(!payOn())return '';
    var u=E()&&E().uzelokOn()&&!PAY.own('starter');
    return '<button class="prow zt-in" id="ztIn"><span>🏫 Учительская<br><small>'+(u?'Узелок новичка — только первые 3 дня':'Абонемент, без рекламы, монеты')+'</small></span><b>›</b></button>';};
  window.zbShopBind=function(root){var b=root&&root.querySelector('#ztIn');if(b)b.onclick=function(){SND.tap();SH.open('shop');};};
  // главный: строка-кнопка внизу (VIEW раскладывает зону bottom)
  if(window.ZB)ZB.add(ZB.homeSlots,{id:'uchit',order:90,zone:'bottom',
    render:function(){if(!payOn())return '';var u=E()&&E().uzelokOn()&&!PAY.own('starter');
      return '<button type="button" class="btn ghost small zt-home">🏫 Учительская'+(u?' · <b>Узелок 🎁</b>':'')+'</button>';},
    mount:function(el){var b=el.querySelector('.zt-home');if(b)b.onclick=function(){SND.tap();SH.open('home');};}});
  // после покупки — перерисовать витрину (payAfter в pay.js знает только окно и «Облики»)
  function wrapPay(){var f=window.payAfter;if(typeof f!=='function'||f.__zt)return;var w=function(id){var r=f.apply(this,arguments);
      ZB.safe('zt:after',function(){var s=$('zb-uchit');if(s&&s.classList.contains('on'))render(s);if(window.ZB)ZB.refresh();});return r;};w.__zt=1;window.payAfter=w;}
  wrapPay();if(window.ZB)ZB.on('ready',wrapPay);
  // ---------- ателье Толика (кабинет труда, CAB): строка в шапке «Обликов» — у Толика дешевле, но шьёт не сразу ----------
  window.zbTolikHead=function(isZ){var e=E();if(!e||!e.on||!window.ZBCAB||!ZBCAB.go)return '';var lv=e.cabLv('trud');if(!lv)return '';
    var who=window.ZBP&&ZBP.bust?ZB.safe('zbp',function(){return ZBP.bust('tolik','happy');}):'',d=Math.round((e.trud.disc[lv]||0)*100);
    return '<div class="dhead zt-h"><div class="av">'+(who||'<div class="zt-ic">✂️</div>')+'</div><p><b>Толик:</b> '+
      esc(isZ?'Тут всё сразу и по полной цене. А закажешь у меня в ателье — сошью на '+d+' % дешевле, только подождать придётся.':'Блюдца тут — сразу. А у меня в ателье распишу на '+d+' % дешевле, подождёшь чуток.')+
      '</p><button class="btn blue small" id="ztSew">✂️ В ателье</button></div>';};
  window.zbTolikBind=function(root){var b=root&&root.querySelector('#ztSew');if(b)b.onclick=function(){SND.tap();ZB.safe('zt:sew',function(){ZBCAB.go('trud');});};};
  // ---------- стили (префикс zt-) ----------
  var css='.zt-g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.zt-c{background:var(--card);border-radius:18px;padding:10px 10px 12px;box-shadow:var(--shadow);display:flex;flex-direction:column;align-items:center;text-align:center;gap:5px;position:relative;min-width:0}'+
    '.zt-c.hot{box-shadow:0 0 0 3px #f5b400,var(--shadow)}.zt-p{width:80px;height:80px}.zt-p svg{width:100%;height:100%}.zt-c b{font-size:16px;color:var(--ink);line-height:1.2}'+
    '.zt-c small{font-size:13.5px;color:var(--ink2);line-height:1.3;flex:1}.zt-n{font-style:normal;font-size:13.5px;font-weight:800;color:#c2410c}.zt-c .btn{width:100%;font-size:15px;padding-left:6px;padding-right:6px}'+
    '.zt-own{font-weight:800;color:#237a3b;padding:10px 0}.zt-e,.zt-f{text-align:center;color:var(--ink2);font-size:14px;margin:14px 6px}.zt-h p b{color:var(--ink)}.zt-h{flex-wrap:wrap}.zt-h p{flex:1;min-width:180px}.zt-h #ztSew{margin-left:auto}.zt-in b{color:var(--ink2)}'+
    '.zt-home{width:100%}.zt-ic{font-size:40px;line-height:64px;text-align:center}@media (min-width:860px){.zt-g{grid-template-columns:repeat(3,1fr)}}@media (max-width:340px){.zt-g{gap:8px}.zt-c{padding:8px 6px 10px}.zt-c b{font-size:15px}}';
  try{var st=document.createElement('style');st.id='ztCss';st.textContent=css;document.head.appendChild(st);}catch(e){}
})();
