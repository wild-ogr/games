/* ===== bb2-grm.js — BG-SHOP этап 2 (29.10): подписка «Дружинная грамота» (VKWebAppShowSubscriptionBox). Подключён после bb2-eco-m.js.
   Цена и сроки — BB2E.eco.grm (= hobby-pay/catalog.json, товар druzh_sub: 15 голосов / 90 ОК за 30 дней, первые 7 дней бесплатно).
   Что даёт (MONEY.md ход Б; силу для рейтингов НЕ продаём): 1) нет межэкранной рекламы между походами; 2) раз в день «гостинец дружиннику» —
   свиток перебора в сумку Славы (не золото); 3) раз в день «Подняться» без ролика — только в походах глав (не Сеча, не Испытание, не лига, не день);
   4) значок 🎖 в Лавке. Основное ничего не запирает (VK 5.4.3), проба 7 дней.
   Где продаём: VK — Android, ПК, мобильный сайт и iPhone/iPad (если мост говорит, что окно подписки есть: supportsAsync); ОК — только по ?bb2=grmok
   (подписку ОК надо заранее заявить письмом в api-support@ok.ru, и у сервера нет хранилища для ОК-игрока — см. журнал BG-SHOP).
   Флаги: grm — всё (?bb2=-grm — как до подписки, уже оформленная продолжает давать своё); grmios — продажа на iPhone/iPad VK (?bb2=-grmios — спрятать).
   Состояние S.bb2.grm: to — до какого времени (мс) действует · tr 1 — проба уже была · n — сколько раз оформлял · sid — номер подписки VK ·
   end 1 — отменена «до конца периода» · gd — день последнего гостинца · rd — день последнего «Подняться» без ролика.
   Источник правды в VK — ключ хранилища VK druzh_sub = «on|end|off:<до unix>:<subscription_id>», его пишет сервер оплат (bg-sub-pay); читаем при входе и после облака.
   Мак: ?vk=1&paytest=1 — заглушка окна (localStorage «paytestvk», как сервер), ?paytest=fail — отказ. Потокам: BB2.grm.on() · .can() · .win() · .st() */
(function(){'use strict';
if(typeof BB2==='undefined')return;
var Q=location.search,ID='druzh_sub',DAY=864e5,X=BB2.grm={},sup=null,busy=false;
function N(p,d){return BB2.n('eco.grm.'+p,d);}
function ob(x){return x&&typeof x==='object'&&!Array.isArray(x)?x:null;}
function now(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}} /* время — nowMs() (VK: не дальше 10 мин от vk_ts), не голые часы телефона */
function num(v){return typeof v==='number'&&isFinite(v)&&v>0?v:0;}
function later(a,b){return typeof b==='string'&&(typeof a!=='string'||b>a)?b:a;}
BB2.save('grm',{fix:function(o){o.to=num(o.to);if(!o.to)delete o.to;if(o.tr!==1)delete o.tr;o.n=Math.floor(num(o.n));if(!o.n)delete o.n;
    if(typeof o.sid!=='string'||!/^\d{1,20}$/.test(o.sid))delete o.sid;if(o.end!==1)delete o.end;if(typeof o.gd!=='string')delete o.gd;if(typeof o.rd!=='string')delete o.rd;return o;},
  merge:function(a,b){b=ob(b)||{};if(num(b.to)>num(a.to)){a.to=b.to;if(b.sid)a.sid=b.sid;if(b.end===1)a.end=1;else delete a.end;}
    if(b.tr===1)a.tr=1;a.n=Math.max(num(a.n),num(b.n))||undefined;if(!a.n)delete a.n;if(!a.sid&&b.sid)a.sid=b.sid;a.gd=later(a.gd,b.gd);a.rd=later(a.rd,b.rd);
    if(a.gd===undefined)delete a.gd;if(a.rd===undefined)delete a.rd;return a;}});
function st(){return BB2.s('grm');}
function on(){try{return BB2.on('grm')&&num(st().to)>now();}catch(e){return false;}}
function okOn(){return typeof OK!=='undefined'&&OK;}
function ios(){return typeof PAY_IOS!=='undefined'&&PAY_IOS;}
function stub(){return typeof VK!=='undefined'&&!VK&&typeof PAY!=='undefined'&&PAY.test&&typeof VK_REAL!=='undefined'&&!VK_REAL;}
/* продавать можно: VK (мост умеет окно подписки) или заглушка на маке; ОК — только по ?bb2=grmok; iPhone — флаг grmios; не в походе */
function can(){try{if(!BB2.on('grm')||typeof PLAT==='undefined'||PLAT!=='vk')return false;if(okOn()&&!BB2.opt('grmok'))return false;if(ios()&&!BB2.on('grmios'))return false;
  if(typeof G!=='undefined'&&G)return false;return stub()||(!!VK&&sup===true);}catch(e){return false;}}
function stat(a,o){o=o||{};o.a=a;try{BB2.stat('grm',o);}catch(e){}}
function price(){return okOn()?/* i18n:ru — VK/ОК всегда по-русски */N('ok',90)+' ОК':(function(n){var a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'голос':a>=2&&a<=4&&(b<12||b>14)?'голоса':'голосов');})(N('vk',15));}
function dstr(t){var d=new Date(t);return d.getDate()+'.'+('0'+(d.getMonth()+1)).slice(-2);}
X.on=on;X.can=can;X.st=st;X.price=price;

/* ---------- источник правды: ключ druzh_sub (сервер) ---------- */
function apply(v){var m=/^(on|end|off):(\d+):(\d*)/.exec(String(v||''));if(!m)return false;var s=st(),t=+m[2]*1000,ch=false;
  if(m[1]==='off'){if(num(s.to)>now()){s.to=now();ch=true;}delete s.end;}
  else{if(t>num(s.to)){s.to=t;ch=true;}if(m[3])s.sid=m[3];if(m[1]==='end'){if(s.end!==1)ch=true;s.end=1;}else{if(s.end)ch=true;delete s.end;}s.tr=1;}
  if(ch){try{save();}catch(e){}}return ch;}
function lsk(){try{return JSON.parse(localStorage.getItem('paytestvk'))||{};}catch(e){return {};}}
function read(cb){try{if(stub()){var v=lsk()[ID];if(apply(v))refresh();if(cb)cb();return;}
    if(typeof VK==='undefined'||!VK||okOn()||typeof vkSend!=='function'){if(cb)cb();return;}
    vkSend('VKWebAppStorageGet',{keys:[ID]},8000).then(function(r){var e=((r&&r.keys)||[])[0];if(e&&apply(e.value))refresh();if(cb)cb();},function(){if(cb)cb();});}catch(e){if(cb)cb();}}
function probe(){if(sup!==null||typeof VK==='undefined'||!VK)return;sup=false;
  try{Promise.resolve(VK.supportsAsync?VK.supportsAsync('VKWebAppShowSubscriptionBox'):false).then(function(r){sup=!!r;btn();},function(){sup=false;});}catch(e){sup=false;}}
X.read=read;

/* ---------- окно подписки VK (create / cancel / resume) ---------- */
function box(params){if(stub())return new Promise(function(ok,no){setTimeout(function(){if(window.__payCancel||/[?&]paytest=fail/.test(Q))return no({error_type:'client_error'});
    var o=lsk(),s=st(),ns=Math.floor(now()/1000),sid=s.sid||String(now()).slice(-9),to=Math.floor(num(s.to)/1000);
    if(params.action==='cancel')o[ID]='end:'+Math.max(to,ns)+':'+sid;
    else if(params.action==='create')o[ID]='on:'+(to>ns?to+30*86400:ns+(s.tr?30:7)*86400)+':'+sid;
    else o[ID]='on:'+Math.max(to,ns)+':'+sid;
    try{localStorage.setItem('paytestvk',JSON.stringify(o));}catch(e){}ok({success:true,subscriptionId:+sid});},250);});
  return vkSend('VKWebAppShowSubscriptionBox',params,600000);}
function buy(){if(busy||!can())return;busy=true;var s=st(),tr=!s.tr;stat('try',{tr:tr?1:0,ok:okOn()?1:0});try{if(!(typeof adShowing!=='undefined'&&adShowing))setMuted(true);}catch(e){}
  box({action:'create',item:ID}).then(function(r){var ok=!!(r&&(r.success||r.subscriptionId||r.subscription_id));
    if(ok){var s=st(),d=(s.tr?N('days',30):N('trial',7))*DAY;s.to=Math.max(num(s.to),now())+(num(s.to)>now()&&!s.end?0:d);if(!(num(s.to)>now()))s.to=now()+d;
      s.tr=1;s.n=(s.n||0)+1;delete s.end;var id=r.subscriptionId||r.subscription_id;if(id)s.sid=String(id);try{save();cloudFlush();}catch(e){}
      try{SND.coin();}catch(e){}toast(L('🎖 Дружинная грамота твоя! Гостинец ждёт в деревне','🎖 The Warband Charter is yours! A gift awaits in the village'),3200);stat('ok',{tr:tr?1:0});gift();
      setTimeout(function(){read();},6000);}
    else stat('cancel');},function(e){stat('cancel',{e:String(e&&(e.error_data&&e.error_data.error_code||e.error_type)||'').slice(0,12)});toast(L('Грамота не оформлена','The charter was not taken'),2200);})
  .then(function(){busy=false;try{if(!(typeof adShowing!=='undefined'&&adShowing))setMuted(false);}catch(e){}refresh();});}
function manage(act){var s=st();if(busy||!s.sid||stub()===false&&(!VK||okOn()))return;busy=true;stat(act);
  box({action:act,subscription_id:+s.sid}).then(function(r){if(r&&(r.success||r.subscriptionId||r.subscription_id)){var s=st();if(act==='cancel')s.end=1;else delete s.end;try{save();}catch(e){}
      toast(act==='cancel'?L('Грамота отменена — действует до ','Charter cancelled — active until ')+dstr(s.to):L('Грамота снова продлевается сама','The charter renews again'),2800);setTimeout(function(){read();},6000);}},function(){})
  .then(function(){busy=false;refresh();});}
X.buy=buy;X.manage=manage;

/* ---------- карточка (в Лавке и своём окне) ---------- */
function card(){var s=st(),o=on(),t=num(s.to),h='<div id="bb2GrmC" style="border:2.5px solid #3b6fd6;border-radius:14px;padding:8px 10px;margin:4px 0 8px;text-align:left;background:rgba(59,111,214,.07)">'+
  '<b style="font-size:15px">🎖 '+L('Дружинная грамота','Warband Charter')+'</b>'+(o?' <span class="tag ok">'+L('действует до ','active until ')+dstr(t)+'</span>':'')+
  '<div style="font-size:12.5px;line-height:1.4;margin:4px 0 6px">'+L('Без рекламы между походами · гостинец каждый день (свиток перебора) · раз в день «Подняться» без ролика в главах. На рейтинги не влияет.',
    'No ads between runs · a daily gift (reroll scroll) · once a day “Get up” without a video in chapters. Does not affect leaderboards.')+'</div>';
  if(o&&s.end)h+='<div style="font-size:12px;opacity:.8">'+L('Отменена: продлеваться не будет.','Cancelled: it will not renew.')+'</div>'+(s.sid&&can()?'<button class="btn" id="bb2GrmR" style="margin-top:6px">'+L('Продлевать снова','Renew again')+'</button>':'');
  else if(o)h+='<div style="font-size:12px;opacity:.8">'+L('Продлевается сама: ','Renews itself: ')+price()+L(' в месяц.',' a month.')+'</div>'+(s.sid&&can()?'<button class="btn ghost" id="bb2GrmX" style="margin-top:6px;font-size:12.5px">'+L('Отменить грамоту','Cancel the charter')+'</button>':'');
  else if(can())h+='<button class="btn gold big" id="bb2Grm" style="width:100%">'+(s.tr?L('🎖 Взять грамоту · ','🎖 Take the charter · ')+price()+L(' в месяц',' a month'):L('🎖 Неделя бесплатно','🎖 One week free'))+'</button>'+
    (s.tr?'':'<div style="font-size:11.5px;opacity:.75;margin-top:4px">'+L('Потом ','Then ')+price()+L(' в месяц, продлевается сама. Отменить можно в любой день.',' a month, renews itself. Cancel any day.')+'</div>');
  else h+='<div style="font-size:12px;opacity:.75">'+L('Здесь оформить нельзя.','Not available here.')+'</div>';
  return h+'</div>';}
function bind(){var b=document.getElementById('bb2Grm');if(b)b.onclick=function(){try{SND.click();}catch(e){}buy();};
  b=document.getElementById('bb2GrmX');if(b)b.onclick=function(){try{SND.click();}catch(e){}manage('cancel');};
  b=document.getElementById('bb2GrmR');if(b)b.onclick=function(){try{SND.click();}catch(e){}manage('resume');};}
function show(){return BB2.on('grm')&&(can()||on());}
BB2.hook('modal',function(k,m){if((k!=='shop'&&k!=='grm')||!m||!show()||document.getElementById('bb2GrmC'))return;var h=m.querySelector('h3');
  var d=document.createElement('div');d.innerHTML=card();var c=d.firstChild;if(h&&h.nextSibling)m.insertBefore(c,h.nextSibling);else m.insertBefore(c,m.firstChild);bind();
  if(can()&&!on())stat('see',{w:k});});
function win(){if(!show())return;showModal('<h3>'+L('Дружинная грамота','Warband Charter')+'</h3><div class="btns"><button class="btn big" id="bb2GrmOk">'+L('Готово','Done')+'</button></div>','grm');on2('bb2GrmOk',hideModal);}
function on2(id,fn){var el=document.getElementById(id);if(el)el.onclick=function(){try{SND.click();}catch(e){}fn();};}
X.win=win;
function refresh(){btn();var m=document.getElementById('bb2GrmC');if(!m)return;var d=document.createElement('div');d.innerHTML=card();m.parentNode.replaceChild(d.firstChild,m);bind();}
/* кнопка 🎖 в шапке — только там, где Лавки нет (VK на iPhone: разовые покупки там не работают, а подписка — да) */
function btn(){try{var tb=document.querySelector('#menu .topbar');if(!tb)return;var sh=document.getElementById('bb2Shop'),b=document.getElementById('bb2Grm0'),need=show()&&!(sh&&sh.style.display!=='none');
  if(!need){if(b)b.style.display='none';return;}
  if(!b){b=document.createElement('button');b.className='ibtn';b.id='bb2Grm0';b.setAttribute('aria-label',L('Дружинная грамота','Warband Charter'));b.textContent='🎖';
    tb.insertBefore(b,document.getElementById('moreBtn'));b.onclick=function(){try{SND.click();}catch(e){}win();};}
  b.style.display='';}catch(e){}}

/* ---------- что даёт ---------- */
/* 2) гостинец дружиннику: раз в день свиток перебора (сумка Славы догружается позже — BB2.after('meta')) */
function gift(){if(!on())return;var s=st(),d=dayKey();if(s.gd===d)return;
  BB2.after('meta',function(){try{var sl=typeof SL==='function'&&SL(),e=st();if(!sl||!ob(sl.it)||e.gd===dayKey()||!on())return;
    sl.it.rr=(sl.it.rr||0)+N('scroll',1);e.gd=dayKey();save();stat('gift');toast(L('🎖 Гостинец дружиннику: свиток перебора','🎖 A gift for the warrior: a reroll scroll'),2800);}catch(e){}});}
/* 3) «Подняться» без ролика: раз в день, только поход главы (G.dif), не лига; первый поход и так даром */
function freeRev(){try{return on()&&G&&G.dif&&!G.cupM&&!G.first&&G.adRevive&&st().rd!==dayKey();}catch(e){return false;}}
if(typeof openDeath==='function'){var oD=openDeath;openDeath=function(){var r=oD.apply(this,arguments);try{if(freeRev()){var m=document.getElementById('mBody'),bs=m&&m.querySelector('.btns');
    if(bs&&!document.getElementById('dGrm')){var b=document.createElement('button');b.className='btn gold big';b.id='dGrm';b.textContent=L('🎖 Подняться (грамота, раз в день)','🎖 Get up (charter, once a day)');bs.insertBefore(b,bs.firstChild);
      var g0=G;b.onclick=function(){if(G!==g0||!G.adRevive)return;try{SND.click();}catch(e){}G.adRevive=false;st().rd=dayKey();save();stat('rev');hideModal();revive();};}}}catch(e){}return r;};}
/* 1) межэкранная — в core.js interReady/interPeek: BB2.grm.on() как «Без рекламы» */

BB2.hook('ready',function(){probe();read();btn();gift();});BB2.hook('cloud',function(){read(function(){gift();});btn();});BB2.hook('menu',function(){btn();gift();});
setTimeout(function(){try{probe();read();btn();gift();}catch(e){}},0); /* крючок ready срабатывает раньше этого файла (см. bb2-eco-m.js) */
setTimeout(function(){try{probe();btn();}catch(e){}},3000);  /* мост VK приходит позже ui.js */
})();
