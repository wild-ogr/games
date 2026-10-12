'use strict';
/* ================= gb-torg — витрина «Торг» (10.10.2026, поток ECO, ветка gb-eco) =================
   Одна витрина покупок за голоса: карточки с картинкой, «≈ N дней игры», цена кнопкой «Купить · N голосов».
   Товары — PAY_ITEMS (index.html + gb-eco.js), числа — GBECO.pay. Авоська новичка — первые 3 дня (GBECO.starterOn),
   Премия за квартал — продлевается (GBECO.premOn), Ремонт отдела — жетон для META/ART (GBECO.remontTake), продаётся, только если
   есть отстроенный отдел (GBM.canRemont() / GBM.dep(id) ≥ 1) или неистраченный жетон.
   Платежей нет (мак без ?paytest, ОК, iOS VK, пустой каталог Яндекса) — витрины и входов нет (PAY.on=false). На Яндексе новых товаров
   в каталоге нет — в «Торге» только старые три. Печати, разряды, знамя, карточки «Дефицита», места в лиге — не продаются.
   Входы: гнездо главного GB.homeSlots id 'torg' (zone 'bottom'; VIEW раскладывает), кнопка «🏪 Торг» в окне «Монеты», GBTORG.open(from).
   Флаг выключения: GB.flag('torg') → окно «Монеты» показывает старый список покупок, гнезда нет.
*/
(function(){
  var T=window.GBTORG={on:!window.GB||GB.flag('torg'),from:null};
  var OLD=['no_ads','coins_s','coins_l'];
  function E(){return window.GBECO&&GBECO.on?GBECO:null;}
  function $(id){return document.getElementById(id);}
  function tr(ru,en){return typeof L==='function'?L(ru,en):ru;}
  function payOn(){return T.on&&typeof PAY!=='undefined'&&PAY.on;}
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function it(id){var x=PAY_ITEMS[id]||{};return typeof LANG!=='undefined'&&LANG==='en'&&x.en?{name:x.en.name||x.name,desc:x.en.desc||x.desc}:{name:x.name,desc:x.desc};}
  // ---------- картинки товаров (свои, 80×80, без внешних файлов) ----------
  var PIC={
    starter:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="73" rx="26" ry="4" fill="#000" opacity=".12"/><path d="M24 30c0-14 32-14 32 0" fill="none" stroke="#8a5a2b" stroke-width="3"/><path d="M14 30h52l-6 38c-1 4-4 6-8 6H28c-4 0-7-2-8-6z" fill="none" stroke="#c0392b" stroke-width="2.5"/><g stroke="#c0392b" stroke-width="1.6" opacity=".9"><path d="M18 40h44M20 52h40M22 64h36M30 30l-4 44M40 30v44M50 30l4 44"/></g><rect x="22" y="38" width="12" height="20" rx="2" fill="#f4f1e8" stroke="#2563c9" stroke-width="1.5"/><rect x="22" y="38" width="12" height="5" fill="#2563c9"/><ellipse cx="48" cy="46" rx="10" ry="6" fill="#d9a35b"/><circle cx="40" cy="58" r="6" fill="#e74c3c"/><circle cx="64" cy="18" r="10" fill="#f5b400"/><text x="64" y="22.5" font-size="12" font-weight="900" text-anchor="middle" fill="#7a4a00" font-family="Arial">5</text></svg>',
    prem:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="73" rx="26" ry="4" fill="#000" opacity=".12"/><path d="M28 8l12 20 12-20h8L46 34H34L20 8z" fill="#c0392b"/><path d="M34 8l6 10 6-10" fill="#e74c3c"/><circle cx="40" cy="50" r="20" fill="#f5b400" stroke="#c98a00" stroke-width="3"/><circle cx="40" cy="50" r="14" fill="#ffd34d"/><path d="M40 40l3.2 6.6 7.2 1-5.2 5 1.2 7.2L40 56.4l-6.4 3.4 1.2-7.2-5.2-5 7.2-1z" fill="#c0392b"/></svg>',
    remont:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="73" rx="28" ry="4" fill="#000" opacity=".12"/><rect x="10" y="12" width="60" height="8" rx="2" fill="#e8e0d0"/><path d="M8 20h64v4H8z" fill="#d4c4a0"/><g fill="#f4efe6" stroke="#cbbf9f" stroke-width="1.2"><rect x="16" y="24" width="10" height="42"/><rect x="54" y="24" width="10" height="42"/></g><g stroke="#cbbf9f" stroke-width="1"><path d="M19 26v38M23 26v38M57 26v38M61 26v38"/></g><rect x="30" y="26" width="20" height="30" rx="10" fill="#bfe0ff" stroke="#c9a227" stroke-width="2.5"/><path d="M34 48l6-12 6 12" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/><rect x="8" y="66" width="64" height="6" rx="1" fill="#b8a888"/><circle cx="40" cy="16" r="3" fill="#c9a227"/></svg>',
    no_ads:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="73" rx="26" ry="4" fill="#000" opacity=".12"/><rect x="12" y="18" width="56" height="40" rx="6" fill="#4a3426"/><rect x="17" y="23" width="46" height="30" rx="3" fill="#8fc1e8"/><path d="M36 30l12 8-12 8z" fill="#fff"/><path d="M32 58l-6 10M48 58l6 10" stroke="#4a3426" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="38" r="26" fill="none" stroke="#c0392b" stroke-width="6"/><path d="M22 20l36 36" stroke="#c0392b" stroke-width="6" stroke-linecap="round"/></svg>',
    coins_s:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="73" rx="24" ry="4" fill="#000" opacity=".12"/><rect x="14" y="40" width="52" height="30" rx="4" fill="#7a5230"/><rect x="18" y="30" width="44" height="14" rx="3" fill="#a0673a"/><g fill="#f5b400" stroke="#c98a00" stroke-width="2"><circle cx="30" cy="30" r="7"/><circle cx="44" cy="26" r="7"/><circle cx="54" cy="34" r="6"/></g><rect x="30" y="52" width="20" height="8" rx="2" fill="#f4e3c0"/></svg>',
    coins_l:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="73" rx="28" ry="4" fill="#000" opacity=".12"/><rect x="10" y="34" width="60" height="36" rx="4" fill="#8a8f94"/><rect x="14" y="38" width="52" height="12" rx="2" fill="#2b3a2b"/><text x="40" y="47.5" font-size="9" font-weight="900" text-anchor="middle" fill="#7dff8a" font-family="Arial">800.00</text><g fill="#ececec"><rect x="16" y="54" width="10" height="6" rx="1"/><rect x="29" y="54" width="10" height="6" rx="1"/><rect x="42" y="54" width="10" height="6" rx="1"/><rect x="55" y="54" width="9" height="6" rx="1"/><rect x="16" y="62" width="10" height="5" rx="1"/><rect x="29" y="62" width="10" height="5" rx="1"/><rect x="42" y="62" width="10" height="5" rx="1"/></g><g fill="#f5b400" stroke="#c98a00" stroke-width="2"><circle cx="24" cy="24" r="7"/><circle cx="40" cy="18" r="8"/><circle cx="56" cy="24" r="7"/></g></svg>'
  };
  // ---------- что продаётся сейчас (порядок витрины) ----------
  function canRemont(){try{var M=window.GBM;if(!M)return false;if(M.canRemont)return !!M.canRemont();var e=E();if(!M.dep||!e)return false;
    for(var i=0;i<e.dep.length;i++)if(+M.dep(e.dep[i].id)>=1)return true;}catch(x){}return false;}
  function dt(ms){var d=new Date(ms);return ('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2);}
  function days(n){return typeof pl==='function'?pl(n,'день','дня','дней','day','days'):n%10===1&&n%100!==11?'день':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'дня':'дней';}
  function list(){var e=E(),R=[];if(!payOn())return R;
    function add(id,x){if(PAY_ITEMS[id]&&PAY.item(id))R.push({id:id,pr:PAY.item(id),x:x||{}});}
    if(e&&e.starterOn()&&!PAY.own('starter'))add('starter',{hot:1,note:tr('только первые '+e.pay.starter.days+' дня игры','only for your first '+e.pay.starter.days+' days')});
    if(e)add('prem',{note:e.premOn()?tr('действует до '+dt(e.premTo()),'active until '+dt(e.premTo())):'',re:e.premOn()}); /* POLISH: «на 30 дней» уже в описании — без повтора */
    if(e&&(canRemont()||e.remontLeft()))add('remont',{note:e.remontLeft()?tr('не истрачено: '+e.remontLeft(),'unused: '+e.remontLeft()):tr('навсегда','forever')});
    add('no_ads',{note:tr('навсегда','forever')});
    add('coins_s',{note:e?'≈ '+e.daysOf(PAY_ITEMS.coins_s.n)+' '+days(e.daysOf(PAY_ITEMS.coins_s.n))+tr(' игры',' of play'):''});
    add('coins_l',{note:e?'≈ '+e.daysOf(PAY_ITEMS.coins_l.n)+' '+days(e.daysOf(PAY_ITEMS.coins_l.n))+tr(' игры',' of play'):''});
    return R;}
  T.list=list;
  function card(o){var x=it(o.id),own=PAY_ITEMS[o.id].perm&&PAY.own(o.id);
    return '<div class="tg-c'+(o.x.hot?' hot':'')+'"><div class="tg-p">'+(PIC[o.id]||'')+'</div><b>'+esc(x.name)+'</b><small>'+esc(x.desc)+'</small>'+
      (o.x.note?'<i class="tg-n">'+esc(o.x.note)+'</i>':'')+
      (own?'<div class="tg-own">✓ '+tr('куплено','owned')+'</div>':'<button class="btn green pbuy" data-pid="'+esc(o.id)+'">'+(o.x.re?tr('Продлить · ','Extend · '):tr('Купить · ','Buy · '))+PAY.price(o.pr)+'</button>')+'</div>';}
  var LINES=[['Торг — это вам не базар! Всё честно, по накладной.','The Trade Office is no flea market! All above board, with a waybill.'],
    ['Печати и разряды не продаём — их только заработать.','Seals and ranks aren\'t for sale — you earn them.'],
    ['Тут у нас полезное для магазина. Дефицит не держим!','Useful things for the store. No black-market goods here!']];
  function head(){var l=LINES[Math.floor(Math.random()*LINES.length)],q=tr(l[0],l[1]);
    if(typeof valyaHtml==='function')return '<div class="tg-h">'+valyaHtml(typeof QQ==='function'?QQ(q):q)+'</div>';return '<p class="tg-h">'+esc(q)+'</p>';}
  // ---------- экран ----------
  function render(el){var Lst=list();
    el.innerHTML='<header class="gh"><button class="icon" id="tgBack" aria-label="'+tr('Назад','Back')+'">←</button><div class="gt"><div>'+tr('Торг','Trade Office')+'</div><div class="sub">'+
      tr('Покупки для магазина и тёти Вали','Purchases for the store and Aunt Valya')+'</div></div><button class="pill sm" id="tgCoins">💰 '+(+S.coins||0)+'</button></header>'+
      '<div class="tg-s">'+head()+(Lst.length?'<div class="tg-g">'+Lst.map(card).join('')+'</div>':'<p class="tg-e">'+tr('Покупки сейчас недоступны — загляните позже.','Purchases are not available right now — please check back later.')+'</p>')+
      '<p class="tg-f">'+tr('Печати, разряды, знамя, карточки «Дефицита» и места в соцсоревновании не продаются — только честным трудом.','Seals, ranks, the banner, Rare cards and league places are not for sale — honest work only.')+'</p></div>';
    $('tgBack').onclick=function(){try{SND.tap();}catch(e){}back();};
    $('tgCoins').onclick=function(){try{SND.tap();}catch(e){}if(typeof openCoins==='function')openCoins();};
    PAY.bind(el);if(typeof valyaDraw==='function')valyaDraw();
    try{STAT.ev('torg',{a:'open',f:T.from||'?',n:Lst.length});}catch(e){}}
  function back(){var f=T.from;T.from=null;if(f==='shop'&&typeof openShop==='function')openShop();else if(typeof openMap==='function')openMap();}
  if(window.GB)GB.screen('torg',{render:render});
  T.open=function(from){if(!payOn()||!window.GB)return false;T.from=from||null;if(typeof hideModal==='function'&&typeof modalOn!=='undefined'&&modalOn)hideModal();GB.go('torg');return true;};
  T.shown=function(){var s=$('gb-torg');return !!(s&&s.classList.contains('on'));};
  // ---------- входы ----------
  if(window.GB)GB.add(GB.homeSlots,{id:'torg',order:90,zone:'bottom',
    render:function(){if(!payOn())return '';var e=E(),u=e&&e.starterOn()&&!PAY.own('starter')&&PAY.item('starter');
      return '<button type="button" class="btn small tg-home">🏪 '+tr('Торг','Trade Office')+(u?' · <b>'+tr('Авоська новичка','Newcomer\'s bag')+'</b>':'')+'</button>';},
    mount:function(el){var b=el.querySelector('.tg-home');if(b)b.onclick=function(){try{SND.tap();}catch(e){}T.open('home');};}});
  // окно «Монеты»: старые три товара + кнопка в «Торг» (новые товары — только в «Торге»)
  function wrap(name,mk){var f=window[name];if(typeof f!=='function'||f.__gbTorg)return;var w=mk(f);w.__gbTorg=1;window[name]=w;}
  function install(){
    wrap('payHtml',function(f){return function(ids,owned){if(!T.on||ids)return f.apply(this,arguments);
      var h=f.call(this,OLD,owned),more=list().some(function(o){return OLD.indexOf(o.id)<0;});
      return h+(more&&!(typeof inLevel==='function'&&inLevel())?'<button class="set" id="tgIn"><span>🏪 '+tr('Торг — все покупки','Trade Office — all purchases')+'<br><small>'+
        (E()&&E().starterOn()&&!PAY.own('starter')?tr('Авоська новичка — только первые 3 дня','Newcomer\'s bag — first 3 days only'):tr('Премия за квартал, ремонт отдела','Quarterly bonus, department makeover'))+'</small></span><i>›</i></button>':'');};});
    wrap('openCoins',function(f){return function(){var r=f.apply(this,arguments);var b=$('tgIn');if(b)b.onclick=function(){try{SND.tap();}catch(e){}T.open('coins');};return r;};});
    // после покупки — перерисовать витрину (payAfter знает только окно и магазин обстановки)
    wrap('payAfter',function(f){return function(id){var r=f.apply(this,arguments);if(T.shown())GB.safe('torg:after',function(){render($('gb-torg'));});
      if(window.GB&&GB.isReady)GB.safe('torg:home',function(){if(!T.shown())GB.refresh();});return r;};});}
  if(T.on){install();if(window.GB)GB.on('ready',install);}
  // ---------- стили (префикс tg-) ----------
  var css='.gb-scr .tg-s{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 14px 18px}.tg-g{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:860px;margin:0 auto}'+
    '.tg-c{background:var(--card);border-radius:18px;padding:10px 10px 12px;box-shadow:0 4px 0 #d9c7a6;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;min-width:0}'+
    '.tg-c>*+*{margin-top:5px}.tg-c.hot{box-shadow:0 0 0 3px #f4b53f,0 4px 0 #d9c7a6}.tg-p{width:80px;height:80px}.tg-p svg{width:100%;height:100%}.tg-c b{font-size:16px;line-height:1.2}'+
    '.tg-c small{font-size:14px;color:#6b5440;line-height:1.3;flex:1}.tg-n{font-style:normal;font-size:14px;font-weight:800;color:#a93312}.tg-c .btn{width:100%;font-size:15px;padding:10px 6px;min-height:44px}'+
    '.tg-own{font-weight:800;color:#237032;padding:10px 0}.tg-e,.tg-f{text-align:center;color:#6b5440;font-size:14px;margin:14px 6px}.tg-h{max-width:560px;margin:4px auto 10px}.tg-home{width:100%}'+
    '@media (min-width:700px){.tg-g{grid-template-columns:repeat(3,1fr)}}@media (max-width:420px){.tg-c .btn{font-size:14px;padding:8px 4px}.tg-c small{font-size:13.5px}}@media (max-width:340px){.tg-g{gap:8px}.tg-c{padding:8px 6px 10px}.tg-c b{font-size:15px}.gb-scr .tg-s{padding-left:8px;padding-right:8px}}';
  try{var st=document.createElement('style');st.id='tgCss';st.textContent=css;document.head.appendChild(st);}catch(e){}
})();
