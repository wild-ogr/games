'use strict';
/* ================= rb2-eco — ДОГОВОР ЧИСЕЛ экономики буста «буст_в2.0» Рыбалки (поток ECO, 13.10.2026; журнал hobby-analytics/release-i/rybak-boost2/logs/ECO.md) =================
   ВСЕ потоки берут монеты/потолки/цены отсюда В МОМЕНТ ВЫЗОВА: var E=window.RECO; if(E)n=E.c(E.zap.note[0],E.zap.note[1]);  — своих чисел в коде не держать.
   Основа — «Р»: монет за одну рыбалку на дальнем открытом месте (TRIP_C[topPlace()]): пруд 30 · речка 85 · Волга 190 · Селигер 230 · Ладога 265 · Байкал 317
   · Амур 373 · Камчатка 434 · Север — больше. Награда = доля Р, но не меньше «мин.» монет, кратно 5: RECO.c(доля, мин).
   Почему так: новичок (пруд) получает ≈ 400 монет в 1-й день (≈ 13 Р), старожил ≈ 8 700 в день (≈ 20 Р). Новые источники буста ВМЕСТЕ — не больше ≈ 2 Р в день
   (≈ +10–15 % к дню), иначе монета обесценится ещё сильнее (у старожилов уже лежит 7–35 тыс.). Подробно — hobby-analytics/release-i/rybak-boost2/04-economy.md §3–4.

   ВЫДАЧА   RECO.give(src,n[,lbl]) — выдать n монет из источника src с потолком дня (src — ключ RECO.cap; нет ключа — без потолка). Вернёт сколько выдано (0 — потолок).
            Пишет STAT earn(src) (через ern), в рыбалке — строкой бонуса G.bon. RECO.left(src) — сколько ещё можно сегодня. Счётчики дня — S.r2k.d.
   ПОТОЛКИ  RECO.cap[src]=[доля Р, мин] в день. 'all' — общий потолок всех новых источников буста (кроме mg — у мини-игр свой MG_RW.CAP, = RECO.mg.cap).
   ВРЕМЯ    день — местная дата ГГГГ-ММ-ДД (как dayKey игры).
   Флаги ECO: hoz (Хозяйство Петровича), tw (Стена трофеев + первое чучело подарком), pay1 («Как платить» один раз), pay2 (товары за голоса — ВЫКЛЮЧЕН,
            включается ?on=pay2 / window.R2_PAY2=true вместе с оплатой), adOld (ролик старожилу — не монеты), payst (STAT окна VK). Поле сохранения — S.r2k. */
var RECO=(function(){
  function R(){try{var t=TRIP_C[topPlace()];return t>0?t:30;}catch(e){return 30;}}
  function c(k,mn){return Math.max(mn||0,Math.round((k||0)*R()/5)*5);}
  function dk(){var d=new Date(typeof nowMs==='function'?nowMs():Date.now());function z(n){return (n<10?'0':'')+n;}return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());}
  function ordOf(i){try{return PLACE_ORD.indexOf(i);}catch(e){return 0;}}
  var E={ver:1,R:R,c:c,dk:dk,
  /* ---------- ПОТОЛКИ ДНЯ (доля Р, мин. монет) ---------- */
  cap:{all:[2,200],     // всё новое буста вместе (кроме mg): ≈ +10–15 % к дню
       zap:[1.5,150],   // EVENT «Записки на мостках»: 5 записок 0,75 + связка 0,6 + клёв недели 0,15 (rb2-MERGE: было .75 — связка не влезала)
       zor:[.5,50],     // EVENT «Зорька выходного дня» — итог раз в день сб/вс (rb2-MERGE)
       newb:[1,100],    // EVENT «Неделя новичка» — конверт в день (7-й больше — входит)
       season:[.5,50],  // SEASON бесплатная дорожка сезона (за день, с запасом на догон)
       hoz:[1.3,150],   // ECO доход Хозяйства (коптильня + летняя кухня)
       mgrec:[0,0]},    // MGREC: рекорды/«Ещё разок»/боты — монет НЕ дают сверх mg (только очки, значки, фото)
  /* ---------- МИНИ-ИГРЫ (MGREC, LOVA, LOVB) — как в mg-core MG_RW, числа не меняем ---------- */
  mg:{cap:.5,           // общий потолок всех мини-игр в день = MG_RW.CAP (ценность, Р)
      paid:3,           // оплачиваемых партий в день на игру (MG_RW[id].day); 4-я и дальше — «на интерес»: очки, рекорд, без монет
      tier:[0,.1,.2,.3],// новая ловкостная: монеты по ступеням (Р) — как MG_RW._
      rec:.05,          // новый личный рекорд дня (Р)
      again:0},         // «Ещё разок» — монет нет (входит в paid)
  /* ---------- EVENT ---------- */
  zap:{note:[.15,20],   // записка выполнена
       pack:[.6,60],    // связка из 5 записок от героя (+ значок на панаму)
       perDay:5},       // записок с наградой в день (дальше — только к связке/значку)
  zor:{pay:[.5,.3,.2]}, // Зорька: 1–3 место, доля Р (rb2-MERGE: по запасным числам EVENT)
  newb:{day:[.3,30],    // конверт «Недели новичка», дни 1–6
        d7:[1,100]},    // 7-й конверт (+ вещь, не монеты-перебор)
  /* ---------- FIRSTFIX (проверено ECO по коду, см. журнал ECO) ---------- */
  ret:{max:'gift7',     // подарок вернувшемуся ≤ подарка 7-го дня серии: a3Gift(7,Р) = max(40, ≈ 0,33 Р) — ret.c()
       bait:[10,20,30]},// + лучшая наживка за 3+/7+/14+ дней
  donka:{maxR:1},       // донка на ночь: улов ≤ 1 Р
  /* ---------- SEASON ---------- */
  season:{lvl:[.25,30], // уровень бесплатной дорожки
          total:8,      // за сезон монет ≤ 8 Р (остальное — вещи, значки, оформление)
          passVk:15},   // платная дорожка сезона (pay2): 15 голосов, ТОЛЬКО красота, без силы
  /* ---------- ECO: Хозяйство Петровича на Дворе — главный сток монет (цены в монетах, не в Р) ---------- */
  hoz:{from:2,          // видно, когда открыта Волга (PLACE_ORD ≥ 2) и Двор
       b:{kopt:{p:[5000,15000,35000],day:[.3,.6,1]},          // коптильня: раз в день копчёная рыба → монеты (Р)
          kuhnya:{p:[8000,20000,45000],first:[.1,.2,.3]},      // летняя кухня: первая рыбалка дня +10/20/30 % монет улова
          cherv:{p:[10000,25000,60000],bait:[5,10,20]},        // червятник: раз в день лучшая наживка дальнего места, шт.
          izba:{p:[6000,15000,40000]}}},                       // изба-читальня Петровича: красота + значок (без дохода)
  /* ---------- ECO: Стена трофеев ---------- */
  tw:{gift1:1},         // первое чучело — подарком (после первой рыбы, у которой чучело можно повесить)
  /* ---------- ECO: реклама ---------- */
  ad:{oldOrd:4,         // «старожил» для роликов: открыто ≥ 5 мест (PLACE_ORD ≥ 4) …
      oldR:15,          // … и монет ≥ 15 Р
      luck:2,           // ролик старожилу: «Удачная рыбалка» — ×2 к шансу трофея на следующую рыбалку
      luckDay:2},       // раз в день
  /* ---------- ECO: товары за голоса (pay2, ВЫКЛЮЧЕНЫ; оплату не выкатываем) ---------- */
  vk:{tripNear:8, tripFar:14, tripFarFrom:5500,   // П2 «Путёвка с доплатой»: путёвка + снасть под место; дальний — путёвка ≥ 5500
      kitCh1:11, kitNorth:21,                      // П3 «Набор водоёма»: глава I (как volga_kit) / Север (как north_kit)
      club7:7, clubTrialDay:2,                     // П4 Клуб: пробная неделя подарком на 2-й день (FIRSTFIX «Утро»), потом «Клуб 7 дней» 7 голосов
      coinsHideOrd:5}                              // П5 пакеты монет — не на первой полке, если открыто ≥ 6 мест (PLACE_ORD ≥ 5)
  };
  E.ord=function(){try{return ordOf(topPlace());}catch(e){return 0;}};
  E.old=function(){try{return E.ord()>=E.ad.oldOrd&&S.coins>=E.ad.oldR*R();}catch(e){return false;}};
  E.ret.c=function(){try{return a3Gift(7,R());}catch(e){return 40;}};
  /* ---------- выдача с потолком ---------- */
  function day(){try{var k=S.r2k;if(!k||typeof k!=='object')return null;if(!k.d||k.d.k!==dk())k.d={k:dk()};return k.d;}catch(e){return null;}}
  function capOf(src){var a=E.cap[src];return a?c(a[0],a[1]):-1;}
  E.left=function(src){var d=day(),m=capOf(src),al=capOf('all');if(!d)return m<0?1e9:m;
    var l=m<0?1e9:Math.max(0,m-(d[src]||0));if(src!=='mg'&&E.cap[src])l=Math.min(l,Math.max(0,al-(d.all||0)));return l;};
  E.give=function(src,n,lbl){n=Math.round(+n||0);if(n<=0)return 0;var d=day();n=Math.min(n,E.left(src));if(n<=0)return 0;
    if(d){d[src]=(d[src]||0)+n;if(E.cap[src]&&src!=='mg')d.all=(d.all||0)+n;}
    try{S.coins+=(typeof ern==='function'?ern(src,n):n);if(typeof G!=='undefined'&&G&&G.bon&&lbl){G.earned+=n;G.bon.push([lbl,n]);}save();if(typeof updCoins==='function')updCoins();}catch(e){}
    return n;};
  E.pay2=function(){try{return (/[?&]on=[^&#]*pay2/.test(location.search)||window.R2_PAY2===true)&&!R2.off('pay2');}catch(e){return false;}};
  return E;
})();
window.RECO=RECO;
// поле сохранения ECO: S.r2k {d:{k:дата,src:монеты,all}, hz:{kopt,kuhnya,cherv,izba: ступень 0..3, kd: дата коптильни, ud: дата кухни, cd: дата червятника}, tw:{g:1 первое чучело подарено}, ad:{d:дата,n:роликов-удачи}}
if(window.R2){R2.reg('eco',{s:'ECO',t:'договор чисел RECO и счётчики дня S.r2k'});
  R2.field('k',{id:'eco',def:function(){return {d:{},hz:{},tw:{},ad:{}};},
    fix:function(o){['d','hz','tw','ad'].forEach(function(x){if(!o[x]||typeof o[x]!=='object'||Array.isArray(o[x]))o[x]={};});}});}
/* ---------- П1: окно «Как платить» — только перед первой покупкой (на iPhone — всегда). Отсев на нём 36 % нажатий (04-economy §1.3) ----------
   Хук в shop.js блок 5 (одна строка, метка rb2-ECO): пропускаем окно, если оно уже было (S.shopN.pv) или игрок что-то купил (S.payT). */
if(window.R2)R2.reg('pay1',{s:'ECO',t:'«Как платить» — только перед первой покупкой'});
window.RB2_PRE_SKIP=function(id,n,ip){try{if(!window.R2||R2.off('pay1')||ip)return false;var seen=(n&&n.pv|0)>0||Array.isArray(S.payT)&&S.payT.length>0;
  if(seen)try{STAT.ev('mod',{m:'shop',a:'preskip',k:id});}catch(e){}return seen;}catch(e){return false;}};
/* ---------- п.5 STAT: окно оплаты VK запрошено / ответило — отдельно от «нажал Купить» (buy try) ----------
   payw {i:товар, a:'open'} — игра отправила VKWebAppShowOrderBox; payw {i, a:'ans', s:1 оплачено|0 нет, w:секунд в окне, c:код ошибки}.
   Обёртка vkSend снаружи общего модуля PAY (модуль не трогаем). */
if(window.R2)R2.reg('payst',{s:'ECO',t:'STAT payw: окно VK открылось/ответило'});
(function(){if(typeof vkSend!=='function')return;var v0=vkSend;
  vkSend=function(m,p,ms){var r=v0.apply(this,arguments);if(m!=='VKWebAppShowOrderBox'||!window.R2||R2.off('payst'))return r;
    var id=String(p&&p.item||'?').slice(0,30),t=Date.now();try{STAT.ev('payw',{i:id,a:'open'});}catch(e){}
    var fin=function(s,e){var o={i:id,a:'ans',s:s,w:Math.round((Date.now()-t)/1000)};try{var d=e&&e.error_data||{};if(d.error_code!=null)o.c=+d.error_code;else if(e&&e.message)o.c=String(e.message).slice(0,20);}catch(x){}try{STAT.ev('payw',o);}catch(x){}};
    Promise.resolve(r).then(function(x){fin(x&&x.success?1:0);},function(e){fin(0,e);});return r;};})();
/* ---------- С2: «Хозяйство Петровича» на Дворе — главный сток монет (флаг hoz). Окно — лениво js/rb2-eco-hoz.js ----------
   Вход: кнопка «🏡 Хозяйство» в верхней полосе Двора (событие dvor) + плашка на главном (гнездо home 'hoz', только когда есть что забрать).
   Летняя кухня: первая законченная рыбалка дня → +10/20/30 % от монет рыбалки (событие end, тост; потолок cap.hoz). */
if(window.R2)R2.reg('hoz',{s:'ECO',t:'Хозяйство Петровича на Дворе (сток монет)'});
RECO.hozOn=function(){try{return !!window.R2&&!R2.off('hoz')&&!!S.r2k&&RECO.ord()>=RECO.hoz.from&&(S.sessions||0)>=3;}catch(e){return false;}};
RECO.hozOpen=function(){if(!RECO.hozOn())return;var go=function(){if(window.RB2_HOZ)RB2_HOZ.open();};if(window.RB2_HOZ)return go();
  try{R2.mark('t:hoz');}catch(e){}R2.need('js/rb2-eco-hoz.js').then(go,function(){try{toast(typeof LANG!=='undefined'&&LANG==='en'?'No connection — try again':'Нет связи — попробуй ещё раз');}catch(e){}});};
RECO.hozReady=function(){try{var h=S.r2k.hz,d=RECO.dk();return (h.kopt|0)>0&&h.kd!==d||(h.cherv|0)>0&&h.cd!==d;}catch(e){return false;}};
if(window.R2){
  R2.on('dvor',function(){if(!RECO.hozOn())return;var top=document.querySelector('.mg-dv .mg-dtop'),bk=top&&top.querySelector('.mg-bk');if(!top||top.querySelector('.r2hzb'))return;
    if(!document.getElementById('r2hzbCss')){var s=document.createElement('style');s.id='r2hzbCss';s.textContent='.r2hzb{pointer-events:auto;position:relative;height:52px;margin-right:8px;padding:0 14px;border-radius:16px;border:1px solid rgba(255,255,255,.25);background:rgba(16,26,36,.55);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;font:700 17px var(--font,system-ui,sans-serif);cursor:pointer;flex:none;white-space:nowrap}.r2hzb i{position:absolute;right:-3px;top:-3px;width:14px;height:14px;border-radius:50%;background:#ff5a4a;border:2px solid #fff}@media (max-width:400px){.r2hzb span{display:none}}';document.head.appendChild(s);}
    var b=document.createElement('button');b.type='button';b.className='r2hzb noenter';b.innerHTML='🏡<span> '+(typeof LANG!=='undefined'&&LANG==='en'?'Homestead':'Хозяйство')+'</span>'+(RECO.hozReady()?'<i></i>':'');
    b.onclick=function(e){e.stopPropagation();try{SND.tap();}catch(x){}RECO.hozOpen();};if(bk)top.insertBefore(b,bk);else top.appendChild(b);},'hoz');
  window.RB2_HOZ_UPD=function(){var b=document.querySelector('.r2hzb');if(b){var i=b.querySelector('i');if(RECO.hozReady()&&!i)b.insertAdjacentHTML('beforeend','<i></i>');else if(!RECO.hozReady()&&i)i.parentNode.removeChild(i);}};
  R2.slot('home','hoz',{pri:6,when:function(){return RECO.hozOn()&&RECO.hozReady();},
    html:function(){return '<button class="a3m noenter">🏡 <b>'+(typeof LANG!=='undefined'&&LANG==='en'?'Homestead: ready to take':'Хозяйство: можно забрать')+'</b> ›</button>';},
    bind:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){try{SND.tap();}catch(e){}RECO.hozOpen();};}});
  R2.on('end',function(g){try{if(!RECO.hozOn()||!g||g.tourn||g.guest)return;var h=S.r2k.hz,l=h.kuhnya|0,d=RECO.dk();if(!l||h.ud===d||!(g.earned>0))return;
    h.ud=d;var c=RECO.give('hoz',Math.round(g.earned*RECO.hoz.b.kuhnya.first[l-1]/5)*5);if(!c){save();return;}
    try{STAT.ev('hoz',{a:'take',b:'kuhnya',c:c});}catch(e){}setTimeout(function(){try{toast('🍲 '+(typeof LANG!=='undefined'&&LANG==='en'?'Summer kitchen: +':'Летняя кухня: +')+coinsTxt(c),2800,true);}catch(e){}},900);}catch(e){}},'hoz');}
/* ---------- С3/С4: Стена трофеев (флаг tw). Стена с прогрессом уже есть (ui-album «Трофейная стена» X / N) — добавляем золотые рамки в шапку
   и ПЕРВОЕ ЧУЧЕЛО ПОДАРКОМ: пока на стене пусто, первое чучело — бесплатно (S.r2k.tw.g=1 после); подсказка в итогах рыбалки (гнездо res 'tw1', ≤2 раз). */
if(window.R2)R2.reg('tw',{s:'ECO',t:'Стена трофеев: рамки в шапке, первое чучело подарком'});
(function(){if(!window.R2)return;function en(){return typeof LANG!=='undefined'&&LANG==='en';}
  function giftOn(){try{return !R2.off('tw')&&!!S.r2k&&!S.r2k.tw.g&&!Object.keys(S.mnt||{}).some(function(k){return S.mnt[k];});}catch(e){return false;}}
  function anyCan(){try{for(var id in S.alb)if(mntCan(id))return id;}catch(e){}return '';}
  RECO.twGift=giftOn;
  if(typeof mntPrice==='function'){var mp=mntPrice;mntPrice=function(id){return giftOn()&&!(S.mnt&&S.mnt[id])?0:mp.apply(this,arguments);};}
  if(typeof buyMnt==='function'){var bm=buyMnt;buyMnt=function(id){var g=giftOn(),r=bm.apply(this,arguments);
    try{if(g&&S.mnt[id]){S.r2k.tw.g=1;save();STAT.ev('mod',{m:'tw',a:'gift',k:id});setTimeout(function(){try{toast('🎁 '+(en()?'Petrovich made your first mount for free!':'Первое чучело Петрович сделал бесплатно!'),3200);}catch(e){}},2500);}}catch(e){}return r;};}
  // подпись «Бесплатно» вместо «0 💰» на кнопках чучела (стена, карточка рыбы)
  function relabel(root){if(!giftOn()||!root)return;var t=en()?'Free — a gift':'Бесплатно — подарок';
    root.querySelectorAll('[data-mnt],#fiMnt').forEach(function(b){if(/(^|\D)0\s*💰|>0<|\b0\b/.test(b.textContent)||mntPrice(b.getAttribute('data-mnt')||'')===0){b.innerHTML='🎁 '+t;b.classList.add('green');}});}
  if(typeof albWall==='function'){var aw=albWall;albWall=function(){var r=aw.apply(this,arguments);try{if(R2.off('tw'))return r;var box=document.getElementById('alList'),wh=box&&box.querySelector('.ua-wh');
    if(wh){var gd=Object.keys(S.gild||{}).length,ga=Object.keys(FISH).length+Object.keys(LEG).length;var gh='<div class="ua-big"><b>🖼 '+gd+'</b><span>'+(en()?'of '+ga+' golden frames':'из '+ga+' золотых рамок')+'</span></div>',pp=wh.querySelector('p');if(pp)pp.insertAdjacentHTML('beforebegin',gh);else wh.insertAdjacentHTML('beforeend',gh);}
    relabel(box);}catch(e){}return r;};}
  if(typeof fishInfo==='function'){var fi=fishInfo;fishInfo=function(id){var r=fi.apply(this,arguments);try{if(id&&!(S.mnt&&S.mnt[id]))relabel(document.getElementById('mcard'));}catch(e){}return r;};}
  R2.slot('res','tw1',{pri:12,when:function(c){try{return giftOn()&&!!anyCan()&&(S.r2k.tw.s|0)<2&&(S.sessions||0)>=2&&!(c&&c.g&&c.g.tourn);}catch(e){return false;}},
    html:function(){return '<button class="a3m noenter">🏆 <b>'+(en()?'First mount is on Petrovich':'Первое чучело — подарок Петровича')+'</b> ›</button>';},
    bind:function(el){try{S.r2k.tw.s=(S.r2k.tw.s|0)+1;save();}catch(e){}var b=el.querySelector('button');if(b)b.onclick=function(){try{SND.tap();hideModal();G=null;var id=anyCan();openAlb('w');if(id)fishInfo(id);}catch(e){}};}});
})();
/* ---------- Р2: старожилу (RECO.old(): открыто ≥5 мест и монет ≥ 15 Р) вместо «📺 ×2 монеты» в итогах — «📺 Удачная рыбалка»:
   на следующую рыбалку редкая рыба вдвое чаще (каждая поклёвка: второй бросок жребия, берём более редкую). До RECO.ad.luckDay раз в день. Флаг adOld.
   Кнопка — та же #rX2 (уже в AD_BTN_SEL), adHold первой строкой, поздний зачёт late (adt). STAT: place 'luck'. ---------- */
if(window.R2)R2.reg('adOld',{s:'ECO',t:'ролик старожилу — удачная рыбалка вместо ×2 монет'});
(function(){if(!window.R2)return;function en(){return typeof LANG!=='undefined'&&LANG==='en';}
  var RK={common:0,uncommon:1,rare:2,trophy:3,rb:3,legend:4,tsar:5};
  function rk(pk){if(!pk||pk.junk||!pk.f)return -1;return RK[pk.f.rar]!=null?RK[pk.f.rar]:pk.f.leg?4:0;}
  function ad(){var a=S.r2k.ad,d=RECO.dk();if(a.d!==d){a.d=d;a.n=0;}return a;}
  function can(){try{return !R2.off('adOld')&&!!S.r2k&&RECO.old()&&ad().n<RECO.ad.luckDay&&!S.r2k.ad.on;}catch(e){return false;}}
  function arm(){var a=ad();a.n++;a.on=1;save();try{STAT.ev('mod',{m:'luck',a:'arm',n:a.n});}catch(e){}}
  R2.on('end',function(g){try{var b=document.getElementById('rX2');if(!b||!can()||g.x2)return;
    b.innerHTML='📺 '+(en()?'Lucky trip: rare fish ×2 next time':'Удачная рыбалка: редкая рыба ×2 в следующий раз');b.setAttribute('data-luck','1');
    b.onclick=function(){if(g.x2||adHold('luck'))return;b.disabled=true;try{STAT.place('luck');}catch(e){}
      showRewarded(function(){if(g.x2)return;g.x2=1;arm();try{SND.coin();toast('🍀 '+(en()?'Next trip — rare fish twice as often!':'Следующая рыбалка — удачная: редкая рыба вдвое чаще!'),3200);}catch(e){}if(b.parentNode)b.parentNode.removeChild(b);},
        function(){b.disabled=false;},
        function(){if(g.x2)return '';g.x2=1;arm();if(document.body.contains(b)&&b.parentNode)b.parentNode.removeChild(b);return en()?'next trip is lucky':'следующая рыбалка — удачная';});};
    try{STAT.offer('luck');}catch(e){}}catch(e){}},'adOld');
  R2.on('run',function(g){try{if(!g||g.tourn||g.guest||!S.r2k||!S.r2k.ad.on)return;S.r2k.ad.on=0;g.r2luck=1;save();try{STAT.ev('mod',{m:'luck',a:'use'});}catch(e){}}catch(e){}},'adOld');
  if(typeof pickFish==='function'){var pf=pickFish;pickFish=function(){var r=pf.apply(this,arguments);
    try{if(typeof G!=='undefined'&&G&&G.r2luck&&G.phase==='wait'&&!G.tourn&&r&&rk(r)<3){var r2=pf.apply(this,arguments);if(rk(r2)>rk(r))r=r2;}}catch(e){}return r;};}
})();
/* ---------- pay2: товары за голоса (П2–П5) — ВЫКЛЮЧЕНЫ; при ?on=pay2 / window.R2_PAY2=true грузится js/rb2-eco-pay.js ---------- */
if(window.R2){R2.reg('pay2',{s:'ECO',t:'товары за голоса П2–П5 (выключено до оплаты)'});if(RECO.pay2())R2.need('js/rb2-eco-pay.js').catch(function(){});}
