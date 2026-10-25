'use strict';
/* ================= rb2-home — главный экран буста 2.0 «Рыбалки» (поток HOME, 13.10.2026; журнал hobby-analytics/release-i/rybak-boost2/logs/HOME.md) =================
   Флаги (каждый выключается отдельно, ?off=hlay,hrow,hgate,hgoal,hfb; все выключены → главный как v8):
   hlay  — порядок и зоны гнёзд, сжатый «Сегодня» и кольца, строки-приглашения в турнир нет — вместо неё точка на кольце «Турнир»;
   hrow  — одна строка значков «Ещё»: Лига · Наука · Россия · Васька · Донка (+ праздник) вместо плашки лиги, трёх плиток, донки и строки праздника;
   hgate — новичку значки открываются по одному в день (старожилы видят всё сразу): R2H.open(ключ), R2H.isNew(ключ);
   hgoal — «Цель» в «Сегодня»: ближайшая покупка с полоской (новичку — путёвка);
   hfb   — «Напишите Петровичу — он читает» (⚙, «Об игре», итоги раз в 7 дней): окно лениво — js/rb2-home-fb.js, STAT mail {a,f,l} + fb кусками по 40.
   ЗОНЫ гнёзд главного (R2.slot('home',id,{pri})): pri ≥100 — над кольцами (полоска сезона / конверты новичка), 80–99 — сразу под кольцами
   (лента «Записок»), 70 — строка «Ещё» (HOME), 50–69 — карточки («Мостки рекордов»), <50 — прочее. Поле S.r2h: o старожил, n дней игры,
   ld последний день, tw неделя открытия турнира, fd день письма. */
(function(){
if(typeof R2==='undefined')return;
var F=['hlay','hrow','hgate','hgoal','hfb'],T={hlay:'главный: порядок и зоны гнёзд, без строки турнира',hrow:'строка значков «Ещё»',hgate:'новичку значки по одному в день',hgoal:'цель-покупка с полоской',hfb:'форма «Написать Петровичу»'};
F.forEach(function(f){R2.reg(f,{s:'HOME',t:T[f]});});
function on(f){return !R2.off(f);}
function $(id){return document.getElementById(id);}
function L_(r,e){try{return L(r,e);}catch(x){return r;}}
function dn(){try{return dayNum();}catch(e){return Math.floor(Date.now()/864e5);}}
function st(a,o){try{var p={m:'home',a:a};for(var k in o)p[k]=o[k];STAT.ev('mod',p);}catch(e){}}
R2.field('h',{id:'hgate',def:function(){return {o:(S.sessions||0)>=3?1:0,n:0,ld:0};},
  fix:function(o,S){if(!o.o&&!o.n&&(S.sessions||0)>=3)o.o=1;['o','n','ld','tw','fd'].forEach(function(k){if(o[k]!=null)o[k]=Math.max(0,Math.floor(+o[k]||0));});}});
var TMP={o:1,n:0,ld:0};
function h(){if(S.r2h&&typeof S.r2h==='object')return S.r2h;if(R2.off('hgate'))return TMP; // флаг поля выключен — поле не заводим
  S.r2h={o:(S.sessions||0)>=3?1:0,n:0,ld:0};return S.r2h;}

/* ---- новичок: что открыто в какой день игры (день = первый показ главного в новые сутки после 1-й рыбалки) ---- */
var OPEN={daily:2,donka:2,zap:2,dvor:3,cat:3,mgrec:3,tour:4,league:4,sci:5,map:5,season:6};
function day(){var o=h();return o.o?99:(o.n||0);}
function open(k){if(!on('hgate'))return true;var d=OPEN[k];return !d||day()>=d;}
function isNew(k){if(!on('hgate'))return false;var o=h();return !o.o&&OPEN[k]>1&&OPEN[k]===o.n;}
function count(){if(!on('hgate'))return;var o=h(),t=dn();if((S.sessions||0)<1||o.o||o.ld===t)return;o.n=(o.n||0)+1;o.ld=t;
  try{save();}catch(e){}st('day',{d:o.n});}

/* ---- турнир: точка на кольце вместо строки-приглашения ---- */
function tourDot(){try{var wk=weekNum();return (S.sessions||0)>=3&&!(S.week&&S.week.w===wk&&S.week.best>0)&&h().tw!==wk;}catch(e){return false;}}
function tourSeen(){if(!on('hlay'))return;try{var o=h(),wk=weekNum();if(o.tw!==wk){o.tw=wk;save();}}catch(e){}}

/* ---- цель: ближайшая покупка с полоской ---- */
function goal(){if(!on('hgoal'))return null;var g=null;try{g=goalNext();}catch(e){}
  try{if(!h().o&&day()<7){var np=nextPlace(S.open);if(np>0&&PLACES[np])g={p:PLACES[np].p,s:'🎫 '+L_('Путёвка: ','Trip: ')+nm(PLACES[np]),go:'p',i:np};}}catch(e){}
  return g&&g.p>0&&S.coins<g.p?g:null;}
function goalPre(){var g=goal();return !!(g&&g.go==='p'&&!h().o&&day()<7);} // новичку путёвка важнее «Хватает на: снасть»
function goalRow(){var g=goal();if(!g)return '';var pc=Math.max(3,Math.min(100,Math.round(S.coins/g.p*100)));
  return '<button class="uh-row uh-goal r2h-goal noenter" id="r2hGoal"><span>🎯</span><span><b>'+esc(g.s)+'</b><small>'+S.coins+' / '+coinsTxt(g.p)+'</small><span class="gbar"><i style="width:'+pc+'%"></i></span></span><i>›</i></button>';}
function goalGo_(){var g=goal();SND.tap();st('goal',{k:g?g.go:''});
  if(g&&g.go==='p'){try{toast(L_('Ещё '+coinsTxt(g.p-S.coins)+' — и путёвка твоя. Каждая рыбалка даёт монеты!','Need '+coinsTxt(g.p-S.coins)+' more — every trip earns coins!'),3200);}catch(e){}return;}
  try{goalGo();}catch(e){}}

/* ---- строка «Ещё» ---- */
function slotOf(id){try{for(var i=0;i<mapSlots.length;i++)if(mapSlots[i].id===id)return mapSlots[i];}catch(e){}return null;}
var HID={'meta-league':1,'meta-row':1,donka:1,fest:1,festday:1},orig={};
function patch(){if(!on('hrow'))return;try{mapSlots.forEach(function(o){if(!HID[o.id]||o.__r2h)return;orig[o.id]={when:o.when,html:o.html,bind:o.bind};o.__r2h=1;
  var w=o.when;o.when=function(c){if(on('hrow'))return false;return w?w.apply(this,arguments):true;};});}catch(e){}}
function ow(id){var x=orig[id];if(!x)return false;try{return !x.when||!!x.when({});}catch(e){return false;}}
function ic(k,icon,lab,sub,dot,nw){return '<button class="r2h-ic noenter" data-hr="'+k+'"><span class="r2h-i">'+icon+'</span><b>'+lab+'</b>'+(sub?'<small>'+sub+'</small>':'')+(nw?'<em class="r2h-new">'+L_('новое','new')+'</em>':dot?'<i class="dot"></i>':'')+'</button>';}
function rowHtml(){var a=[],ML=window.META&&META.league;
  if(open('league')&&ow('meta-league')&&ML){var l=S.lgL||0,lb='';try{lb=ML.badge(l,30);}catch(e){}a.push(ic('league',lb||'🏅',L_('Лига','League'),'',false,isNew('league')));}
  if(ow('meta-row')){var t=document.createElement('div');try{t.innerHTML=orig['meta-row'].html({});}catch(e){}
    [].slice.call(t.querySelectorAll('[data-t]')).forEach(function(b){var k=b.dataset.t;if(!open(k))return;var i=b.querySelector('.mttic'),n=b.querySelector('b');
      a.push(ic(k,i?i.innerHTML:'',n?n.innerHTML:k,'',b.classList.contains('hot'),isNew(k)));});}
  var d=S.awayD,rd=d&&nowMs()-d.t>=8*36e5;
  if(open('donka')){if(rd)a.push(ic('donkaR','🔔',L_('Донка','Line'),L_('улов!','catch!'),true,false));
    else if(ow('donka')){var hs='';try{hs=orig.donka.html({});}catch(e){}var w=/disabled/.test(hs),m=/ещё ([^<]*)</.exec(hs)||/— ([^<]*)</.exec(hs);
      a.push(ic(w?'donkaW':'donka','🔔',L_('Донка','Line'),w&&m?m[1].replace(/\s*мин/,'м').replace(/\s*ч/,'ч'):'',!w,isNew('donka')));}}
  if(ow('festday')){var fi='';try{fi=(/rb-fest">([^ <]+) <b>/.exec(orig.festday.html({}))||[])[1];}catch(e){}a.unshift(ic('festday',fi||'🎁',L_('День','Day'),'',true,false));} // праздник — первым: он на время
  if(ow('fest'))a.unshift(ic('fest','🌙',PLAT==='vk'?L_('Кощей','Spooky'):L_('Вечер','Spooky'),'',true,false)); // BK-RB: на Яндексе праздник — «Осенний вечер» (FEST ya), в VK — «Кощеева неделя»
  ICX.forEach(function(o){if(R2.off(o.id))return;try{if(o.when&&!o.when())return;a.push(ic('x_'+o.id,v(o.ic),esc(v(o.t)),o.sub?esc(v(o.sub)):'',!!v(o.dot),false));}catch(e){}});
  return a.length?'<div class="r2h-row'+(a.length>5?' many':'')+'">'+a.join('')+'</div>':'';}
/* значки других потоков в строке «Ещё»: R2H.icon(id-флага,{pri,when(),ic,t,sub,dot,go()}) — ic/t/sub/dot строкой или функцией */
var ICX=[];function v(x){return typeof x==='function'?x():x;}
function icon(id,o){ICX=ICX.filter(function(x){return x.id!==id;});o.id=id;ICX.push(o);ICX.sort(function(a,b){return (b.pri||0)-(a.pri||0);});}
function rowBind(el){[].slice.call(el.querySelectorAll('[data-hr]')).forEach(function(b){var k=b.dataset.hr;
  b.onclick=function(){st('row',{k:k});var ML=window.META&&META.league;
    if(k.indexOf('x_')===0){var o=ICX.filter(function(x){return 'x_'+x.id===k;})[0];try{SND.tap();}catch(e){}if(o&&o.go)try{o.go();}catch(e){}return;}
    if(k==='league'){try{SND.tap();}catch(e){}if(ML)ML.open();return;}
    if(k==='donkaR'){try{SND.tap();}catch(e){}openMail();return;}
    if(k==='donkaW'){try{SND.tap();toast(L_('Донка стоит — утром проверим улов','The line is set — check it in the morning'),2500);}catch(e){}return;}
    var x=orig[k==='donka'?'donka':k==='fest'||k==='festday'?k:'meta-row'];if(!x||!x.bind||!x.html)return;
    var t=document.createElement('div');try{t.innerHTML=x.html({});x.bind(t,{});}catch(e){return;}
    var btn=k==='donka'||k==='fest'||k==='festday'?t.querySelector('button:not([disabled])'):t.querySelector('[data-t="'+k+'"]');if(btn&&btn.onclick)btn.onclick();};});
  // кот Васька — рисунок на холсте: попросить META нарисовать в нашем значке
  try{var cb=el.querySelector('[data-hr="cat"] canvas');if(cb&&orig['meta-row']){var t=document.createElement('div');t.innerHTML=orig['meta-row'].html({});var x=t.querySelector('[data-t="cat"]');
    if(x){x.querySelector('.mttic').innerHTML='';x.querySelector('.mttic').appendChild(cb);document.body.appendChild(t);t.style.cssText='position:absolute;left:-999px;top:0';orig['meta-row'].bind(t,{});
      var ic_=el.querySelector('[data-hr="cat"] .r2h-i');if(ic_)ic_.appendChild(cb);t.remove();}}}catch(e){}}
R2.slot('home','hrow',{pri:70,when:function(){return !!rowHtml();},html:rowHtml,bind:rowBind});

/* ---- зоны: гнёзда с pri ≥100 — над кольцами ---- */
function zones(){if(!on('hlay'))return;var top=$('r2hTop'),sl=$('mapSlotsB');if(!top||!sl)return;top.innerHTML='';
  [].slice.call(sl.querySelectorAll(':scope>.slot[data-slot]')).forEach(function(el){var o=slotOf(el.dataset.slot);if(o&&(o.pri||0)>=100)top.appendChild(el);});}
try{var sf=slotsFill;slotsFill=function(el){var r=sf.apply(this,arguments);try{if(el&&el.id==='mapSlotsB')zones();}catch(e){}return r;};}catch(e){}

/* ---- после сборки главного ---- */
function after(){count();if(on('hlay'))document.body.classList.add('r2h');zones();
  var g=$('r2hGoal');if(g)g.onclick=goalGo_;}
R2.on('home',after);
R2.on('end',function(){count();}); // день — и по законченной рыбалке: кто рыбачил с бустом, тот не «старожил без поля» (fix)
document.addEventListener('DOMContentLoaded',patch);patch();

window.R2H={icon:icon,lay:function(){return on('hlay');},open:open,isNew:isNew,day:day,tourDot:function(){return on('hlay')&&tourDot();},tourSeen:tourSeen,
  goalRow:goalRow,goalPre:goalPre,after:after,ring:function(id){return open(id==='uhDaily'?'daily':id==='uhWeek'?'tour':id==='uhDvor'?'dvor':'');},
  ringNew:function(id){return isNew(id==='uhDaily'?'daily':id==='uhWeek'?'tour':id==='uhDvor'?'dvor':'');}};

/* ---- «Напишите Петровичу — он читает» (letters-2410): входы ⚙ Настройки (f:'set'), «ℹ Об игре» (f:'about'), итоги рыбалки раз в 7 дней (f:'win');
   окно — лениво js/rb2-home-fb.js. Поле S.r2l {w день показа в итогах, n писем, d день письма} (флаг hfb; старое сохранение — умолчание). ---- */
var FBL=['w','n','d'];
R2.field('l',{id:'hfb',def:function(){return {w:0,n:0,d:0};},
  fix:function(o,S){FBL.forEach(function(k){o[k]=Math.max(0,Math.floor(+o[k]||0));});var h_=S&&S.r2h;if(h_&&+h_.fd>o.d)o.d=Math.floor(+h_.fd);}, // день письма до 24.10 — S.r2h.fd
  merge:function(a,b){FBL.forEach(function(k){a[k]=Math.max(+a[k]||0,+b[k]||0);});}});
function fl(){if(!S.r2l||typeof S.r2l!=='object')S.r2l={w:0,n:0,d:0};return S.r2l;}
function fbSt(a,f){try{STAT.ev('mail',{a:a,f:f,l:+S.sessions||0});}catch(e){}}
function fbGo(f,back){try{SND.tap();}catch(e){}if(typeof f!=='string'){f='set';back=function(){openSettings();};}
  R2.need('js/rb2-home-fb.js').then(function(){if(window.R2HFB)R2HFB.open(f,back);},function(){try{toast(L_('Письмо не открылось — проверь интернет','Could not open — check the connection'),3000);}catch(e){}});}
function fbRow(id,f,back){var b=document.createElement('button');b.className='set noenter';b.id=id;
  b.innerHTML='<span>✉️ '+L_('Написать Петровичу','Write to Petrovich')+'<br><small>'+L_('он читает: похвалить, поругать, подсказать','he reads it: praise, complain, suggest')+'</small></span><i class="go">›</i>';
  b.onclick=function(){fbGo(f,back);};return b;}
function setHook(){if(typeof openSettings!=='function'||openSettings.__r2h)return;var os=openSettings;
  var w=openSettings=function(){var r=os.apply(this,arguments);try{if(on('hfb')){var mc=$('mcard'),row=mc&&mc.querySelector('.row');if(row&&!$('r2hFb'))row.parentNode.insertBefore(fbRow('r2hFb','set',function(){openSettings();}),row);}}catch(e){}return r;};w.__r2h=1;
  try{['btnSet','fSet'].forEach(function(id){var b=$(id);if(b)b.onclick=function(){openSettings();};});}catch(e){}}
function aboutHook(){if(typeof openAbout!=='function'||openAbout.__r2h)return;var oa=openAbout;
  var w=window.openAbout=openAbout=function(){var r=oa.apply(this,arguments);try{if(on('hfb')){var mc=$('mcard'),rows=mc&&mc.querySelectorAll('.row'),row=rows&&rows[rows.length-1];
    if(row&&!$('r2hFbA'))row.parentNode.insertBefore(fbRow('r2hFbA','about',function(){openAbout();}),row);}}catch(e){}return r;};w.__r2h=1;}
// итоги рыбалки: раз в 7 дней, с 15-й законченной рыбалки, с уловом; не турнир/гости/«Домой», не «полное» окно (подарок, легенда, рекорд),
// не когда в окне вопрос про напоминания (#mSocBox) или следом межэкранная; не в день письма и не через 7 дней после него
function winWant(g){if(!on('hfb')||!g||g.tourn||g.guest||g.quit||g.nfull||window.__demo)return false;
  if((+S.sessions||0)<15)return false;if(!(g.catch||[]).some(function(c){return c&&!c.miss&&!c.lost&&!c.junk;}))return false;
  if($('mSocBox'))return false;try{if(adDue()&&adReady())return false;}catch(e){}
  var v=fl(),d=dn();return d-(+v.w||0)>=7&&d-(+v.d||0)>=7;}
function winShow(g){try{var mc=$('mcard');if(!mc||!$('rWin')||$('r2hFbW')||!winWant(g))return;var row=mc.querySelector('.row');if(!row)return;
  fl().w=dn();try{save();}catch(e){}fbSt('show','win');
  var p=document.createElement('p');p.className='r2fb-win';p.innerHTML='<button class="r2fb-link noenter" id="r2hFbW">✉️ '+L_('Напишите Петровичу пару слов — он читает','Drop Petrovich a line — he reads it all')+'</button>';
  row.parentNode.insertBefore(p,row);
  $('r2hFbW').onclick=function(){p.style.display='none'; // после письма ссылка не нужна; итоги — живыми узлами (кнопки с обработчиками)
    var fr=document.createDocumentFragment();[].slice.call(mc.childNodes).forEach(function(n){fr.appendChild(n);});
    fbGo('win',function(){mc.innerHTML='';mc.appendChild(fr);$('modal').classList.add('on');try{modalOn=true;}catch(e){}mc.scrollTop=0;});};}catch(e){}}
R2.on('end',function(g){winShow(g);},'hfb');
R2H.fbSent=function(){var v=fl();v.n=(+v.n||0)+1;v.d=dn();};
document.addEventListener('DOMContentLoaded',function(){setHook();aboutHook();setTimeout(function(){setHook();aboutHook();},0);});
window.r2hFeedback=fbGo;
})();
