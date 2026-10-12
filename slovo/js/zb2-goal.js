'use strict';
/* zb2-goal — «Цель» и вход «Учительской» на Доме, карточка Узелка во 2-м классе (буст_в2.0, поток ECO, 12.10.2026).
   Флаги: goal (Цель + Учительская на Доме), uzelok7 (карточка Узелка — флаг в zb-eco.js). Выключено/нет ZBCAB — игра как v3.0.
   Дом: при NEWB homefit — плашка zone 'chips' order 20 (+ «Учительская» order 40 — на телефоне 4-я не рисуется, есть в окне цели);
   без homefit — карточка zone 'school' order 40 (над «Школой»). Тап → окно цели: полоска, «что даст», купить / добить за ролик, сменить цель.
   Поле S.z2e {g: выбранная цель ('' — сама, самый дешёвый шаг), s: подпись витрины, которую видел (для «новое»), u: день карточки Узелка, ux: закрыл}.
   STAT: goal {a:'show'|'tap'|'buy'|'top'|'pick', id, p}; uchit {a:'open', f:'goal'|'home'} — пишет zb-shop. */
(function(){
  if(!window.ZB||!window.ZB2)return;
  var ON=ZB2.reg('goal',{t:'Цель и Учительская на Доме',who:'ECO',on:true});
  if(!ON)return;
  function E(){return window.ZBECO||null;}
  function C(){return window.ZBCAB&&ZBCAB.on!==false?ZBCAB:null;}
  function z(){return (typeof S!=='undefined'&&S.z2e)||{};}
  function coins(){return +((typeof S!=='undefined'&&S.coins)||0);}
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function st(ev,o){try{if(window.STAT&&STAT.ev)STAT.ev(ev,o);}catch(e){}}
  function tap(){try{SND.tap();}catch(e){}}
  function sv(){try{save();}catch(e){}}
  var IC={russkij:'📖',stolovaya:'🥧',zhivoj:'🐈',biblioteka:'📚',akt:'🎭',sport:'🏀',trud:'🧵',muzej:'🖼'};
  var SHORT={russkij:'Класс русского',stolovaya:'Столовая',zhivoj:'Живой уголок',biblioteka:'Библиотека',akt:'Актовый зал',sport:'Спортзал',trud:'Кабинет труда',muzej:'Музей'};
  // кабинет-подарок новичку (NEWB cabgift) ещё не вручён — его в цели не ставим
  function giftWait(id){var e=E(),g=e&&e.cabGift,c=C();return !!(g&&g.id===id&&c&&!c.lv(id)&&ZB2._reg.cabgift&&!ZB2.off('cabgift'));}
  // все возможные шаги: открытые кабинеты, у которых есть следующий уровень
  function steps(){var c=C(),e=E(),L=[];if(!c||!e)return L;
    e.cab.forEach(function(r){var id=r.id;if(!c.open(id)||giftWait(id))return;var p=+c.price(id)||0;if(p>0)L.push({id:id,n:r.n,lv:c.lv(id)+1,p:p});});
    return L.sort(function(a,b){return a.p-b.p;});}
  function goal(){var L=steps(),g=z().g;if(!L.length)return null;for(var i=0;i<L.length;i++)if(L[i].id===g)return L[i];return L[0];}
  function perk(o){try{var c=C();return c&&c.perk?String(c.perk(o.id,o.lv)).replace(/<[^>]+>/g,''):'';}catch(e){return '';}}
  function topN(o){try{return typeof adsOk==='function'&&adsOk()&&E().topUp?+E().topUp(o.p)||0:0;}catch(e){return 0;}}
  // «Учительская»: платежи есть → вход; «новое» — витрина поменялась с прошлого захода
  function payOn(){return !!(window.ZBSHOP&&ZBSHOP.on&&typeof PAY!=='undefined'&&PAY.on);}
  function sig(){if(!payOn())return 0;var s='',h=7;try{var e=E();s=(e&&e.uzelokOn()&&!PAY.own('starter')?'u':'')+Object.keys(PAY_ITEMS).filter(function(k){return !!PAY.item(k);}).join(',');}catch(x){}
    for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)||1;}
  function fresh(){var s=sig();return s&&z().s!==s;}
  function uchit(f){tap();var q=z();q.s=sig();sv();if(window.ZBSHOP&&ZBSHOP.open)ZBSHOP.open(f);}
  var shown=0;
  function bar(o){var k=Math.min(100,Math.round(coins()/o.p*100));return '<span class="ze-bar"><i style="width:'+k+'%"></i></span>';}
  function chipHtml(){var o=goal();if(!o)return '';if(!shown){shown=1;st('goal',{a:'show',id:o.id,p:o.p});}var ok=coins()>=o.p;
    return '<button type="button" class="zn-chip ze-goal'+(ok?' ze-ok':'')+'"'+(ok?' data-zn-tag="можно!"':'')+'><i>'+(IC[o.id]||'🏫')+'</i><b>'+esc(SHORT[o.id]||o.n)+'</b><small>'+(ok?'можно купить!':Math.min(coins(),o.p)+' / '+o.p+' 💰')+'</small>'+bar(o)+'</button>';}
  function cardHtml(){var o=goal();if(!o)return '';if(!shown){shown=1;st('goal',{a:'show',id:o.id,p:o.p});}var ok=coins()>=o.p,u=payOn();
    return '<div class="ze-card"><button type="button" class="ze-goal ze-main'+(ok?' ze-ok':'')+'"><i>'+(IC[o.id]||'🏫')+'</i><span><b>'+esc(o.n)+(o.lv>1?' · ур.'+o.lv:'')+'</b>'+
      bar(o)+'<small>'+(ok?'<em>можно купить!</em> ':'🎯 Цель · ')+Math.min(coins(),o.p)+' / '+o.p+' 💰</small></span></button>'+
      (u?'<button type="button" class="ze-uch">🏫<small>Учительская</small>'+(fresh()?'<em>новое</em>':'')+'</button>':'')+'</div>';}
  function mountGoal(el){var b=el.querySelector('.ze-goal');if(b)b.onclick=function(){tap();open();};var u=el.querySelector('.ze-uch');if(u)u.onclick=function(){uchit('home');};}
  function chipsOn(){return !!(ZB2._reg.homefit&&!ZB2.off('homefit'));}
  var slot={id:'ze-goal',order:20,render:function(){return chipsOn()?chipHtml():cardHtml();},mount:mountGoal};
  Object.defineProperty(slot,'zone',{get:function(){return chipsOn()?'chips':'school';}});
  slot.order=20;ZB.add(ZB.homeSlots,slot);
  var uslot={id:'ze-uchit',order:40,render:function(){if(!chipsOn()||!payOn())return '';
      return '<button type="button" class="zn-chip ze-uch"'+(fresh()?' data-zn-tag="новое"':'')+'><i>🏫</i><b>Учительская</b><small>покупки</small></button>';},
    mount:function(el){var b=el.querySelector('.ze-uch');if(b)b.onclick=function(){uchit('home');};}};
  Object.defineProperty(uslot,'zone',{get:function(){return chipsOn()?'chips':'none';}});
  ZB.add(ZB.homeSlots,uslot);
  // ---------- окно цели ----------
  function open(){var o=goal();if(!o||typeof modal!=='function')return;st('goal',{a:'tap',id:o.id,p:o.p});
    var ok=coins()>=o.p,t=ok?0:topN(o),L=steps(),pk=perk(o);
    modal('<div class="ze-w"><h2>'+(IC[o.id]||'🏫')+' '+esc(o.n)+'</h2><p class="ze-lv">'+(o.lv>1?'Ремонт до уровня '+o.lv:'Открыть кабинет')+'</p>'+
      (pk?'<p class="ze-pk"><b>Что даст:</b> '+esc(pk)+'</p>':'')+'<div class="ze-big">'+bar(o)+'<b>'+Math.min(coins(),o.p)+' / '+o.p+' 💰</b></div>'+
      (ok?'<button class="btn green" id="zeBuy">'+(o.lv>1?'🔨 Отремонтировать':'🔑 Открыть')+' за '+o.p+' 💰</button>'
        :'<p class="ze-need">Не хватает '+(o.p-coins())+' 💰 — это примерно '+Math.max(1,Math.ceil((o.p-coins())/80))+' '+pl(Math.max(1,Math.ceil((o.p-coins())/80)),'день','дня','дней')+' игры. Монеты — за уровни, дела дня и записки.</p>'+
          (t?'<button class="btn blue zbad" id="zeTop">🎬 Добить '+t+' 💰 за рекламу</button>':''))+
      (L.length>1?'<p class="ze-ch">Сменить цель:</p><div class="ze-list">'+L.map(function(x){return '<button class="ze-pick'+(x.id===o.id?' on':'')+'" data-id="'+x.id+'">'+(IC[x.id]||'')+' '+esc(SHORT[x.id]||x.n)+(x.lv>1?' · ур.'+x.lv:'')+'<small>'+x.p+' 💰</small></button>';}).join('')+'</div>':'')+
      (payOn()?'<button class="btn ghost small" id="zeUch">🏫 Учительская'+(fresh()?' · новое':'')+'</button>':'')+
      '<button class="btn ghost" id="zeX">Закрыть</button></div>');
    var $=function(id){return document.getElementById(id);},b;
    if((b=$('zeX')))b.onclick=function(){tap();hideModal();};
    if((b=$('zeUch')))b.onclick=function(){hideModal();uchit('goal');};
    if((b=$('zeBuy')))b.onclick=function(){var c=C();if(!c||!c.up(o.id))return;try{SND.coin();}catch(e){}st('goal',{a:'buy',id:o.id,p:o.p});
      var q=z();if(q.g===o.id&&!c.price(o.id))q.g='';sv();hideModal();try{toast((o.lv>1?'Отремонтировано! ':'Кабинет открыт! ')+pk,3500);}catch(e){}ZB.safe('ze:go',function(){c.go(o.id);});};
    if((b=$('zeTop')))b.onclick=function(){if(b.disabled)return;var n=topN(o);if(!n)return;b.disabled=true;try{STAT.place('goaltop');}catch(e){}var paid=false;
      function give(){if(paid)return '';paid=true;try{E().topUpTake(n);}catch(e){}st('goal',{a:'top',id:o.id,n:n});return '+'+n+' монет на цель';}
      try{showRewarded(function(){give();try{SND.coin();}catch(e){}open();ZB.refresh();},function(){b.disabled=false;},function(){return give();});}catch(e){b.disabled=false;}};
    [].forEach.call(document.querySelectorAll('.ze-pick'),function(x){x.onclick=function(){tap();var q=z();q.g=x.getAttribute('data-id');sv();st('goal',{a:'pick',id:q.g});open();ZB.refresh();};});}
  function pl(n,a,b,c){n=Math.abs(n)%100;var k=n%10;return n>10&&n<20?c:k===1?a:k>1&&k<5?b:c;}
  // ---------- карточка Узелка: один раз, при переходе во 2-й класс (полоса zone 'top', не окно) ----------
  var UZ=!ZB2.off('uzelok7');
  ZB.add(ZB.homeSlots,{id:'ze-uz',order:40,zone:'top',render:function(){if(!UZ||!payOn())return '';var e=E(),c=C(),q=z();
      if(!e||!e.uzelokOn()||PAY.own('starter')||q.ux)return '';var cl=0;try{cl=c?+c.cls():(window.ZBS?+ZBS.cls():0);}catch(x){}if(cl<2)return '';
      var d=e.day();if(!q.u){q.u=d;sv();}else if(q.u!==d)return '';
      return '<div class="ze-uz"><button type="button" class="ze-uzb">🎁 <b>Узелок новичка</b> — '+e.pay.uzelok.c+' 💰, '+e.pay.uzelok.hb+' 💡 и платок · ещё '+Math.max(1,e.pay.uzelok.days-e.newbieDays())+' дн.</button><button type="button" class="ze-uzx" aria-label="Закрыть">×</button></div>';},
    mount:function(el){var b=el.querySelector('.ze-uzb');if(b)b.onclick=function(){uchit('uz');};var x=el.querySelector('.ze-uzx');if(x)x.onclick=function(){tap();z().ux=1;sv();ZB.refresh();};}});
  // ---------- стили (префикс ze-) ----------
  var css='.ze-bar{display:block;height:5px;border-radius:3px;background:rgba(0,0,0,.1);overflow:hidden;margin:3px 0 1px}.ze-bar i{display:block;height:100%;background:#f5b400;border-radius:3px}'+
    '.ze-ok .ze-bar i{background:#2e9d4b}.zn-chip.ze-goal .ze-bar{width:100%}.ze-card{display:flex;gap:8px;margin:6px 0}.ze-main{flex:1;display:flex;align-items:center;gap:10px;text-align:left;background:var(--card);border:0;border-radius:16px;padding:8px 12px;box-shadow:var(--shadow);color:var(--ink);font:inherit;min-width:0;cursor:pointer}'+
    '.ze-main>i{font-style:normal;font-size:26px}.ze-main span{flex:1;min-width:0}.ze-main b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ze-main small{font-size:13px;color:var(--ink2)}.ze-main em{font-style:normal;color:#237a3b;font-weight:800}'+
    '.ze-ok.ze-main{box-shadow:0 0 0 3px #2e9d4b,var(--shadow)}.ze-uch{position:relative;background:var(--card);border:0;border-radius:16px;box-shadow:var(--shadow);font-size:24px;padding:6px 8px;min-width:78px;color:var(--ink);font-family:inherit;cursor:pointer}'+
    '.ze-uch small{display:block;font-size:11.5px;color:var(--ink2)}.ze-uch em{position:absolute;top:-6px;right:-4px;background:#d0342c;color:#fff;font-style:normal;font-size:11px;font-weight:800;border-radius:9px;padding:1px 6px}'+
    '.ze-w{text-align:center}.ze-w h2{margin:0 0 2px}.ze-lv{margin:0;color:var(--ink2);font-size:14px}.ze-pk{font-size:15px;margin:10px 0}.ze-big{margin:8px 0 12px}.ze-big .ze-bar{height:10px;border-radius:5px}.ze-big b{font-size:18px}'+
    '.ze-need{font-size:14px;color:var(--ink2);margin:6px 0 10px}.ze-w .btn{width:100%;margin-top:6px}.ze-ch{margin:12px 0 4px;font-size:14px;font-weight:800}.ze-list{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}'+
    '.ze-pick{border:2px solid #e2dccd;background:var(--card);border-radius:12px;padding:5px 8px;font:inherit;font-size:13.5px;color:var(--ink);cursor:pointer}.ze-pick small{display:block;color:var(--ink2);font-size:12px}.ze-pick.on{border-color:#f5b400}'+
    '.ze-uz{display:flex;align-items:center;gap:6px;background:#fff4d6;border-radius:14px;padding:4px 6px 4px 10px;margin:4px 0}.ze-uzb{flex:1;border:0;background:none;text-align:left;font:inherit;font-size:13.5px;color:#5a3d00;cursor:pointer;min-width:0}.ze-uzx{border:0;background:none;font-size:20px;color:#8a6d2b;padding:0 6px;cursor:pointer}';
  try{var el=document.createElement('style');el.id='zeCss';el.textContent=css;document.head.appendChild(el);}catch(e){}
  ZB.on('cab',function(){ZB.safe('ze:cab',function(){var q=z(),c=C();if(q.g&&c&&!c.price(q.g)){q.g='';sv();}});});
  window.ZB2GOAL={goal:goal,steps:steps,open:open,fresh:fresh,card:function(){return !chipsOn()&&!!goal()&&payOn();}};
})();
