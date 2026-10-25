'use strict';
/* zb3-hood-x — «Подъезд и стройка»: экраны z3build и z3bench, праздник закрытия стройки, постройки на рисунке двора, «Помоги соседке»,
   Олимпиада подъездов, друзья ОК (поток HOUSE, 25.10.2026; журнал hobby-analytics/release-i/zina-boost3/Z3-HOUSE.md). Данные дома — Z3.srv.get('build'|'house')
   (договор Z3-SRV-API.md): всегда есть ответ — с сервера, сохранённый или рассчитанный на месте (персонажи-соседи). Тексты — js/zb3-hood-data.js.
   BUILD 25.10 (диета старта): старт js/zb3-hood.js — только флаг z3h, поле S.z3h, вклад звёзд уровня и обёртки предметов двора; этот файл — Z3.late с 3-го дня
     (или Z3.need по нажатию / по Z3H.front|notice|thanks), сам ставит экраны, предметы двора (P.yd) и подсубфлаги, после загрузки P._x=1.
   Флаги (?off=…): z3h — всё; z3h-art — постройки на рисунке двора; z3h-olymp — Олимпиада подъездов; z3h-help — «Помоги соседке».
   Поле S.z3h: w неделя (ISO МСК, как сервер), m мои звёзды недели, pw/pm прошлая неделя, ci номер постройки, с которой начал (+1; 0 — ещё не видел),
     cf сколько построек отпраздновал (+1), d день, g подарил 💡 сегодня, gt кому (теги), ak попросил сегодня (уровень), ag персонаж помог сегодня,
     k подарено 💡 всего, kw подарено на этой неделе, gv получено 💡 всего.
   Для PAPER/уведомлений: Z3H.front() → Promise(строка первой полосы), Z3H.notice() → Promise(строка оповещения | ''), Z3H.thanks() → Promise([имена]).
   STAT z3h {a: open|fest|ask|give|got|fr|olymp, …} — журнал. Старые WebView: без ?. ?? .at :has. */
(function(){
var P=window.Z3H;if(!P||!window.Z3||P._x)return;
Z3.reg('z3h-art',{t:'Постройки недели на рисунке двора',who:'HOUSE'});Z3.reg('z3h-olymp',{t:'Олимпиада подъездов (сб–вс)',who:'HOUSE'});
Z3.reg('z3h-help',{t:'Помоги соседке: просьба и 💡 в подарок',who:'HOUSE'});
/* (перенесено из старта) последний ответ сервера: MEM — этот сеанс (расчёт на месте в кэш SRV не пишется), иначе кэш SRV */
var MEM=P.MEM={};P.pk=function(k){var c=null;try{c=Z3.srv.peek?Z3.srv.peek(k):null;}catch(e){}return MEM[k]&&(!c||MEM[k]._t>=(c._t||0))?MEM[k]:c;};
P.go=function(id,o){Z3.ev('z3h',{a:'open',id:id,d:Math.min(Z3.day(),99)});ZB.go(id,o||{});};
['z3build','z3bench'].forEach(function(id){ZB.screen(id,{title:id==='z3build'?'Стройка':'Подъезд',render:function(el,o){ZB.safe(id,function(){P.ui(id,el,o||{});});}});});
var Z=P.Z,n=P.n,pk=P.pk,DE=document.documentElement;
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function tap(){try{SND.tap();}catch(e){}}
function ev(a,o){o=o||{};o.a=a;Z3.ev('z3h',o);}
function T(k,def,ctx){return Z3.txt('hood-'+k,ctx)||def;}
function sv(){try{save();}catch(e){}}
function toastH(t){try{toast(t,3600);}catch(e){}}
function fmt(x){x=Math.round(+x||0);return String(x).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
function pl(k,a,b,c){k=Math.abs(k)%100;var m=k%10;return k>10&&k<20?c:m===1?a:m>=2&&m<=4?b:c;}
function left(s){s=+s||0;if(s>=86400){var d=Math.round(s/86400);return d+' '+pl(d,'день','дня','дней');}var h=Math.max(1,Math.round(s/3600));return h+' '+pl(h,'час','часа','часов');}
function get(k){try{return Z3.srv.get(k).then(function(o){o=o||{};if(o.goal||o.en){o._t=Date.now();P.MEM[k]=o;}return o;},function(){return {};});}catch(e){return Promise.resolve({});}}
function send(k,d){try{Z3.srv.send(k,d);}catch(e){}}
var OKP=false;try{OKP=typeof OK!=='undefined'&&!!OK;}catch(e){}
function off(id){try{return ZB2.off(id);}catch(e){return false;}}

/* ---------- данные ---------- */
var DP=null;function data(){if(window.Z3HD)return Promise.resolve(window.Z3HD);if(!DP)DP=ZB.load('js/zb3-hood-data.js').then(function(){return window.Z3HD;},function(){DP=null;return null;});return DP;}
var AP=null;function artL(){if(window.Z3ART&&Z3ART.bldIcon)return Promise.resolve();if(!AP)AP=ZB.load('js/zb3-art-build.js').then(null,function(){AP=null;});return AP;}
var NB=26;
function cur(b){var i=n(b&&b.i);return b&&+b.i<0?0:Math.min(i,NB);} // номер постройки недели 0…25; 26 — двор достроен
function bname(i){var D=window.Z3HD;return D&&D.b[i]?D.b[i][0]:'';}
function doneOf(b){return (b&&b.done instanceof Array?b.done:[]).map(function(x){return n(x);}).filter(function(x){return x<NB;});}
// постройки, что нарисованы на дворе с самого начала (Z3ART.yardHas — номера недель 1…26), — считаются готовыми
function withHas(d){var H=window.Z3ART&&Z3ART.yardHas||{};d=d.slice();for(var k in H){var j=(+k)-1;if(j>=0&&j<NB&&d.indexOf(j)<0)d.push(j);}return d;}
P.name=function(b){return b&&b.goal?bname(cur(b)):'';};

/* ---------- праздник: неделя закрылась → постройка во дворе навсегда ---------- */
function festDue(b){b=b||pk('build');if(!b||!b.goal||!Z3.open('build'))return -1;var z=Z(),i=cur(b);
  if(!z.ci){z.ci=i+1;z.cf=i;sv();return -1;}             // впервые видит стройку — старые постройки не празднует
  var L=i-1;return L>=0&&L>=z.cf&&doneOf(b).indexOf(L)>=0?L:-1;}
P.fest=function(){return festDue()>=0;};
var fT=0;
function fest(b,then){var L=festDue(b),M=$('modal');if(L<0){if(then)then();return;}
  if(M&&M.classList.contains('on')){clearTimeout(fT);var mn=$('menu');if(mn&&mn.classList.contains('on'))fT=setTimeout(function(){fest(b,then);},2500);else if(then)then();return;} // окно занято (гостинец, календарь) — подождём
  var z=Z(),miss=L-z.cf,mine=z.pw===prevWk()?z.pm:0,c=mine>=3?30:0;
  z.cf=L+1;sv();ev('fest',{i:L,my:mine,c:c,miss:miss});
  Promise.all([data(),artL()]).then(function(){css();var D=window.Z3HD,x=D&&D.b[L]||['Постройка','','','',''];
    try{modal('<div class="z3h-fest"><h2>🎉 '+esc(T('fest-h','Построили всем домом!'))+'</h2><div class="z3h-ico big">'+(Z3ART.bldIcon?Z3ART.bldIcon(L):'')+'</div>'+
      '<p class="z3h-nm">«'+esc(x[0])+'»</p><p>'+esc(x[2])+'</p>'+(x[4]?'<p class="z3h-q">'+esc(x[4])+'</p>':'')+
      (miss>0?'<p class="z3h-sm">Пока тебя не было, двор вырос ещё на '+miss+' '+pl(miss,'постройку','постройки','построек')+'.</p>':'')+
      (c?'<p class="z3h-rw">Твои ⭐ '+mine+' — в каждом кирпиче. Тебе к чаю: +'+c+' <span class="coin"></span></p>':'<p class="z3h-sm">'+esc(T('fest','Построили! Толик говорит: «Сам». Двор кивает. Двор знает.'))+'</p>')+
      '<div class="btns"><button type="button" class="btn green" id="z3hFestOk">Ура! Во двор</button></div></div>');}catch(e){}
    if(c)try{addCoins(c,'z3fest');}catch(e){}
    var k=$('z3hFestOk');if(k)k.onclick=function(){tap();hideModal();P._lk='';yardArt();if(then)then();};});}
function prevWk(){var h=Z3.srv._h;return h?h.wkey(h.now()-7*864e5):0;}

/* ---------- постройки на рисунке двора (слой в svg двора, до вечернего затемнения) ---------- */
function layer(o){var d=doneOf(pk('build'));if(!d.length||!Z3ART.bldLayer||off('z3h-art'))return '';return Z3ART.bldLayer(d,{eve:o&&o.time==='eve'});}
Z3ART.yardBuild=function(c){return ZB.safe('z3h:layer',function(){return layer(c);})||'';}; // крючок SKIN: рисунок двора зовёт сам, под вечерним фильтром
function yardArt(){if(off('z3h-art'))return;var d=doneOf(pk('build'));if(!d.length)return;
  artL().then(function(){var k=d.join(',');if(P._lk===k)return;P._lk=k;if(Z3ART.yardRedraw)Z3ART.yardRedraw();});}
P.yard=function(){Promise.all([get('build'),get('house'),data()]).then(function(r){fest(r[0]);yardArt();try{if(window.Z3Y)Z3Y.render();}catch(e){}});};
ZB.on('z3srv',function(o){if(o&&o.kind==='build')ZB.safe('z3h:srv',function(){yardArt();});});
ZB.on('yard',function(){ZB.safe('z3h:y',function(){if(P.fest())fest(pk('build'));});});

/* ---------- для газеты и уведомлений ---------- */
P.front=function(){return Promise.all([get('build'),data()]).then(function(r){var b=r[0],D=r[1];if(!b.goal||!D||+b.i<0)return '';var i=cur(b);
  if(i>=NB)return T('all-done','Двор достроили! Теперь Толик чинит то, что построил. Работы хватит.');
  var x=D.b[i],p=Math.min(100,Math.round(100*b.st/b.goal)),fr=Z3.srv._h?Z3.srv._h.wfrac():0;
  return (fr<.3&&x[1]?x[1]+' ':'')+'Стройка недели «'+x[0]+'»: '+p+'% — '+fmt(b.st)+' ⭐ из '+fmt(b.goal)+', до воскресенья '+left(b.left)+'.';});};
P.notice=function(){return Promise.all([get('build'),data()]).then(function(r){var b=r[0],D=r[1];if(!b.goal||!D||!D.ntf.length||+b.i<0)return '';var i=cur(b),lf=b.goal-b.st;
  if(i>=NB||lf<=0)return '';var t=D.ntf[Math.floor(Math.random()*D.ntf.length)];return t.replace('{left}',fmt(lf)).replace('{b}',D.b[i][0]);});};
/* «Благодарности» (PAPER): Promise([имена]) — строки, без чисел и «(2)». Живые соседи подъезда, дарившие 💡 на этой неделе (поле en[i].gw с сервера —
   просьба к SRV; нет поля — живых нет), потом персонажи — «добрые соседки» недели (у всех одинаково), «вы» — подарили 3 за неделю. Не больше 5. */
function nm0(s){return String(s||'').replace(/\s*\(\d+\)$/,'').trim();}
P.thanks=function(){return get('house').then(function(h){var L=[],z=Z(),en=h.en||[];function add(x){x=nm0(x);if(x&&L.indexOf(x)<0)L.push(x);}
  en.filter(function(x){return !x.b&&!x.me&&n(x.gw)>0;}).sort(function(a,b){return n(b.gw)-n(a.gw);}).forEach(function(x){add(x.n);});
  en.forEach(function(x){if(x.b&&kind(x))add(x.n);});if(z.kw>=3)L.unshift('вы');return L.slice(0,5);});};
function kind(x){var h=Z3.srv._h;return h?h.hsh(x.n+':'+(h.wkey()))%9===0:false;} // персонажи-«добрые соседки» недели (у всех одинаково)

/* ---------- «Помоги соседке»: просьбы (люди — с сервера; персонажи — 2 в день по расписанию, у всех одинаково) ---------- */
function asksOf(h){var z=Z(),hh=Z3.srv._h,out=[],day=hh?hh.dkey():0;(h.en||[]).forEach(function(x,k){if(x.me)return;var lv=n(x.ask);
    if(!lv&&x.b&&hh&&hh.hsh(day+':'+h.e+':'+x.t)%17===0)lv=40+hh.hsh(x.t+day)%900;
    if(lv)out.push({n:x.n||'Соседка '+x.t,t:String(x.t),b:x.b,lv:lv,done:z.gt.indexOf(String(x.t))>=0});});return out.slice(0,6);}
P.asks=function(){if(off('z3h-help'))return 0;var h=pk('house'),z=Z();if(!h||z.g>=3)return 0;var k=0;asksOf(h).forEach(function(a){if(!a.b&&!a.done)k++;});return Math.min(k,3-z.g);};
function give(a,btn){var z=Z();if(z.g>=3||z.gt.indexOf(a.t)>=0)return;z.g++;z.gt.push(a.t);z.k++;z.kw++;sv();send('give',{to:a.t});ev('give',{b:a.b?1:0,k:z.kw});
  if(btn){btn.disabled=true;btn.textContent='✓ подарено';}
  toastH(z.kw===3?T('kind','«Добрая соседка» — звание выше завуча. Завуча хотя бы боятся.'):T('give-ok','Подарила соседке 💡. Добро — как домашка: сделал и ходишь гордый.'));}
function akT(){try{return +localStorage.getItem('z3-akt')||0;}catch(e){return 0;}}
function ask(){var z=Z(),lv=(+S.lv||0)+1;if(z.ak)return;z.ak=lv;sv();try{localStorage.setItem('z3-akt',String(Date.now()));}catch(e){}send('ask',{lv:lv});ev('ask',{lv:lv});
  toastH(T('ask-sent','Попросила соседей помочь. Галя уже знает, на каком ты уровне. И почему.'));}
// без живых соседей (нет сервера / никто не подарил за 20 мин) — помогает персонаж подъезда, раз в день
function helper(h){var z=Z();if(!z.ak||z.ag||Date.now()-akT()<20*60e3)return null;if(h&&h.gift&&n(h.gift.gv))return null;
  var b=(h.en||[]).filter(function(x){return x.b&&x.a;});return b.length?b[(z.ak*7)%b.length].n:'Галя с третьего';}
function takeGift(h,el){var z=Z(),gv=n(h.gift&&h.gift.gv),who='';if(!gv){who=helper(h);if(!who)return;gv=1;z.ag=1;}
  try{S.hb=Math.min(typeof HB_MAX!=='undefined'?HB_MAX:9,(+S.hb||0)+gv);}catch(e){}z.gv+=gv;sv();
  if(!who){send('got',{gv:gv});h.gift.gv=0;}ev('got',{gv:gv,b:who?1:0});
  toastH(who?T('ask-help','{n} подкинула тебе 💡. Сказала: «Только Зине не говори». Я и не говорю.',{n:who}):'Соседи подарили тебе 💡 ×'+gv+' — в запасе подсказок.');if(el)render('z3bench',el,{});}

/* ---------- экраны ---------- */
var cssOn=0;function css(){if(cssOn)return;cssOn=1;var s=document.createElement('style');s.setAttribute('data-z3h','1');s.textContent=
'.z3h-scr{min-height:100%;background:var(--z3-bg);color:var(--z3-ink);font-family:var(--z3-font);padding:0 0 24px}'+
'.z3h-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--z3-paper);border-bottom:1.5px solid var(--z3-line)}.z3h-hd .btn{min-height:44px;white-space:nowrap;flex:0 0 auto}'+
'.z3h-mast{display:flex;flex-direction:column;min-width:0;line-height:1.15}.z3h-mast b{font:700 20px var(--z3-font-head)}.z3h-mast small{font-size:13.5px;color:var(--z3-ink2)}'+
'.z3h-body{max-width:560px;margin:0 auto;padding:0 12px}'+
'.z3h-card{margin:12px 0 0;padding:12px 14px;background:var(--z3-paper);border:1.5px solid var(--z3-line);border-radius:var(--z3-r);box-shadow:var(--z3-shadow)}'+
'.z3h-card h3{margin:0 0 6px;font:700 17px var(--z3-font-head)}.z3h-card p{margin:6px 0;font-size:15px;line-height:1.35}'+
'.z3h-top{display:flex;gap:12px;align-items:center}.z3h-ico{flex:0 0 96px;width:96px;height:96px}.z3h-ico svg{width:100%;height:100%;display:block}.z3h-ico.big{width:140px;height:140px;margin:0 auto}'+
'.z3h-nm{font:700 20px var(--z3-font-head);margin:0}.z3h-sm{font-size:13.5px!important;color:var(--z3-ink2)}.z3h-q{font-style:italic;color:var(--z3-ink2)}'+
'.z3h-bar{height:14px;border-radius:7px;background:var(--z3-h-bar0);overflow:hidden;margin:8px 0 4px}.z3h-bar i{display:block;height:100%;background:var(--z3-h-bar);border-radius:7px}'+
'.z3h-num{display:flex;justify-content:space-between;font-size:14px;color:var(--z3-ink2)}.z3h-num b{color:var(--z3-ink)}'+
'.z3h-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px;margin-top:8px}.z3h-cell{text-align:center;font-size:13.5px;line-height:1.15}'+
'.z3h-cell .z3h-ico{width:64px;height:64px;margin:0 auto}.z3h-cell.no{opacity:.45}'+
'.z3h-go{width:100%;min-height:48px;margin-top:12px}.z3h-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--z3-line);font-size:15px;min-height:44px}'+
'.z3h-row:first-of-type{border-top:0}.z3h-row .z3h-w{flex:1;min-width:0}.z3h-row small{display:block;font-size:13.5px;color:var(--z3-ink2)}.z3h-row .btn{min-height:44px;flex:0 0 auto}'+
'.z3h-row.me{background:var(--z3-h-me);border-radius:8px;padding-left:6px}.z3h-dot{width:9px;height:9px;border-radius:5px;background:var(--z3-line);flex:0 0 9px}.z3h-dot.on{background:var(--z3-ok)}'+
'.z3h-ep{display:flex;align-items:center;gap:8px;margin:5px 0;font-size:14px}.z3h-ep em{font-style:normal;flex:0 0 64px;text-align:right}.z3h-ep span{flex:0 0 92px}.z3h-ep .z3h-bar{flex:1;margin:0}.z3h-ep.me{font-weight:800}'+
'.z3h-fest{text-align:center}.z3h-fest p{margin:6px 0;font-size:15px;line-height:1.35}.z3h-rw{font-weight:800}'+
'.z3h-more{width:100%;min-height:44px;margin-top:6px}';document.head.appendChild(s);}
function hdr(t,sub){return '<div class="z3h-hd"><button type="button" class="btn ghost small" data-h="home">‹ Двор</button><div class="z3h-mast"><b>'+esc(t)+'</b><small>'+esc(sub)+'</small></div></div>';}
function bar(a,b){var p=b?Math.max(0,Math.min(100,Math.round(100*a/b))):0;return '<div class="z3h-bar"><i style="width:'+p+'%"></i></div>';}
function home(){tap();try{if(typeof openMenu==='function')openMenu();else ZB.go('home');}catch(e){}}
function play(){tap();try{openMenu();setTimeout(function(){var b=$('btnPlay');if(b)b.click();},60);}catch(e){}}

function buildHtml(b,D){var i=cur(b),z=Z(),d=withHas(doneOf(b)),h='',hh=Z3.srv._h,wk=hh?hh.wfrac():0,pre=+b.i<0; // pre — неделя до старта стройки (HOUSE_WK0)
  h+=hdr('Стройка недели',pre?'начнём в понедельник':i<NB?'неделя '+(i+1)+' из '+NB+' · до воскресенья '+left(b.left):'двор достроен');
  h+='<div class="z3h-body">';
  if(i<NB){var x=D.b[i];h+='<div class="z3h-card"><div class="z3h-top"><div class="z3h-ico">'+Z3ART.bldIcon(i,{wip:1})+'</div><div><p class="z3h-sm" style="margin:0">Строим всем домом</p><p class="z3h-nm">'+esc(x[0])+'</p></div></div>'+(pre?'<p>'+esc(T('build-pre','Стройка начнётся в понедельник. Толик уже разложил инструменты и ходит вокруг них кругами.'))+'</p>'+
    '<p class="z3h-sm">С понедельника за каждый новый урок — до 3 ⭐ в стройку. В воскресенье вечером стройку закрывают — и во дворе навсегда новое.</p></div>':
    bar(b.st,b.goal)+'<div class="z3h-num"><span><b>'+fmt(b.st)+'</b> ⭐ из '+fmt(b.goal)+'</span><span>мои: <b>'+fmt(n(b.my)||z.m)+'</b> ⭐</span></div>'+
    '<p>'+esc(wk<.5?x[1]:T('build-hi','Каждая звезда — кирпич. Мой предлагал кирпичом и рассчитаться.'))+'</p>'+
    '<button type="button" class="btn green z3h-go" data-h="play">▶ Помочь Зине — звёзды в стройку</button>'+
    '<p class="z3h-sm">За каждый новый урок — до 3 ⭐. В воскресенье вечером стройку закрывают — и во дворе навсегда новое. Положил 3 ⭐ и больше — к празднику +30 <span class="coin"></span>.</p></div>');}
  else h+='<div class="z3h-card"><p>'+esc(T('all-done','Двор достроили! Теперь Толик чинит то, что построил. Работы хватит.'))+'</p></div>';
  if(b.fest&&b.fest.goal)h+='<div class="z3h-card"><h3>🎄 Ёлка к Новому году</h3><p class="z3h-sm">Всем домом — слова за праздники</p>'+bar(b.fest.st,b.fest.goal)+
    '<div class="z3h-num"><span><b>'+fmt(b.fest.st)+'</b> слов из '+fmt(b.fest.goal)+'</span><span>ещё '+left(b.fest.left)+'</span></div></div>';
  h+='<div class="z3h-card"><h3>Двор растёт: '+d.length+' из '+NB+'</h3><div class="z3h-grid">';
  for(var k=0;k<NB;k++){var on=d.indexOf(k)>=0;if(!on&&k>i)continue;h+='<div class="z3h-cell'+(on?'':' no')+'"><div class="z3h-ico">'+Z3ART.bldIcon(k,on?{}:{wip:1})+'</div>'+esc(D.b[k][0])+'</div>';}
  h+='</div>'+(d.length?'':'<p class="z3h-sm">Первую постройку двор увидит '+(pre?'через неделю':'в воскресенье вечером')+'.</p>')+'</div></div>';return h;}

function benchHtml(h){var z=Z(),en=(h.en||[]).slice(),me=null,h2='',hlp=!off('z3h-help');
  if(h._sim)en=en.filter(function(x){return !(x.b&&/ \(\d+\)$/.test(x.n||''));}); // без сервера — без двойников-персонажей «Лиля (2)»
  en.forEach(function(x){if(x.me)me=x;});en.sort(function(a,b){return (b.pt||0)-(a.pt||0);});
  var sim=!!h._sim,sub=sim?'Дом №7 · соседи на лавочке':h.now>=30?'Дом №7 · сейчас в доме '+h.now:'Дом №7 · сегодня заходили '+n(h.pct)+'%';
  h2+=hdr('Подъезд №'+(n(h.e)||1),sub)+'<div class="z3h-body">';
  // подарок от соседей
  var gv=n(h.gift&&h.gift.gv),who=hlp?helper(h):null;
  if(gv||who)h2+='<div class="z3h-card"><h3>🎁 '+(gv?'Соседи подарили тебе 💡 ×'+gv:esc(who)+' принесла тебе 💡')+'</h3><button type="button" class="btn green z3h-go" data-h="take">Забрать в запас</button></div>';
  // Олимпиада подъездов (сб–вс)
  if(!sim&&h.ep&&h.ep.length===4&&!off('z3h-olymp')){var mx=Math.max.apply(null,h.ep)||1,mn=Math.min.apply(null,h.ep)||0,mine=h.ep[(n(h.e)||1)-1],place=1;h.ep.forEach(function(v){if(v>mine)place++;});
    h2+='<div class="z3h-card"><h3>🏅 Олимпиада подъездов</h3><p class="z3h-sm">Сб–Вс: подъезд против подъезда — звёзды недели. Внутри подъезда — только помощь.</p>';
    h.ep.forEach(function(v,k){h2+='<div class="z3h-ep'+(k+1===n(h.e)?' me':'')+'"><span>Подъезд №'+(k+1)+'</span>'+bar(v-mn*.8,mx-mn*.8)+'<em>'+fmt(v)+'</em></div>';});
    h2+='<p>Наш подъезд — '+place+'-й. '+esc(T('olymp','Подъезд на подъезд. Внутри — только помощь. Снаружи — Галя с секундомером.'))+'</p></div>';}
  // помоги соседке
  if(hlp){var A=asksOf(h);h2+='<div class="z3h-card"><h3>🤝 Помоги соседке</h3>';
    if(A.length){A.forEach(function(a,k){h2+='<div class="z3h-row"><div class="z3h-w">'+esc(a.n)+(a.b?' <small style="display:inline">(сосед)</small>':'')+'<small>просит помощи: уровень '+a.lv+'</small></div>'+
      '<button type="button" class="btn small'+(a.done?' ghost':' green')+'" data-a="'+k+'"'+(a.done||z.g>=3?' disabled':'')+'>'+(a.done?'✓ подарено':'Подарить 💡')+'</button></div>';});
      h2+='<p class="z3h-sm">Дарить можно 3 раза в день — бесплатно. Подарила 3 за неделю — «Добрая соседка» в газете.'+(z.kw>=3?' <b>Ты — Добрая соседка этой недели!</b>':' Сейчас: '+z.kw+' из 3.')+'</p>';}
    else h2+='<p class="z3h-sm">Сегодня никто не застрял. Подъезд умный — Галя довольна.</p>';
    if(!z.ak&&(+S.lv||0)>=5)h2+='<button type="button" class="btn ghost z3h-go" data-h="ask">🙋 Трудный уровень '+((+S.lv||0)+1)+'? Попросить подъезд</button>';
    else if(z.ak)h2+='<p class="z3h-sm">Твоя просьба висит у лифта до вечера (уровень '+z.ak+').</p>';
    h2+='</div>';A.forEach(function(){});P._A=A;}
  // жильцы
  h2+='<div class="z3h-card"><h3>Жильцы подъезда · '+en.length+'</h3><p class="z3h-sm">'+(sim?'Твои звёзды недели — в общую стройку. Соседи на лавочке, зелёная точка — заходили сегодня.':'Звёзды недели в общую стройку. Соседи-персонажи играют честно, по расписанию.')+'</p><div class="z3h-list">';
  en.forEach(function(x,k){h2+='<div class="z3h-row'+(x.me?' me':'')+'"'+(k>=8&&!x.me?' data-more="1" style="display:none"':'')+'><span class="z3h-dot'+(x.a?' on':'')+'" title="'+(x.a?'заходил сегодня':'')+'"></span><div class="z3h-w">'+
    (x.me?'<b>Вы</b>':esc(x.n||'Соседка'))+(x.b?' <small style="display:inline">(сосед)</small>':'')+'</div><span>'+(sim&&!x.me?'':fmt(x.pt)+' ⭐')+'</span></div>';});
  h2+='</div>'+(en.length>8?'<button type="button" class="btn ghost z3h-more" data-h="more">Показать всех</button>':'')+'</div>';
  // лига недели — Соседки (там же живая лига VK/ОК) — не дублируем
  if(typeof openSosedki==='function'&&typeof sosOn==='function'&&sosOn())h2+='<div class="z3h-card"><h3>🏆 Лига недели</h3><p class="z3h-sm">Соседки по подъезду: кто больше слов за неделю. Там же — живой подъезд.</p><button type="button" class="btn z3h-go" data-h="sos">Открыть «Соседок»</button></div>';
  if(OKP&&Z3.srv.okFriends)h2+='<div class="z3h-card"><h3>👥 Друзья в Одноклассниках</h3><div id="z3hFr"><p class="z3h-sm">Кто из друзей тоже ходит к Зине — и в каком подъезде.</p><button type="button" class="btn ghost z3h-go" data-h="fr">Посмотреть</button></div></div>';
  h2+='<div class="z3h-card"><p>'+esc(T('bench-hi','Подъезд — как класс: все разные, а списывают друг у друга одинаково.'))+'</p></div></div>';return h2;}

function friends(){var el=$('z3hFr');if(!el)return;el.innerHTML='<p class="z3h-sm">Спрашиваем у Одноклассников…</p>';ev('fr',{s:'ask'});
  Z3.srv.okFriends().then(function(r){var L=r&&r.in||[];ev('fr',{s:'ok',n:L.length,ids:(r&&r.ids||[]).length});
    el.innerHTML=L.length?L.slice(0,10).map(function(f){return '<div class="z3h-row"><div class="z3h-w">'+esc(f.n||'Друг')+'<small>подъезд №'+(n(f.e)||'?')+(f.lv?' · уровень '+n(f.lv):'')+'</small></div></div>';}).join(''):
      '<p class="z3h-sm">Пока из друзей никого. Зина ставит чайник на всякий случай.</p>';},function(){el.innerHTML='<p class="z3h-sm">Не получилось — попробуй позже.</p>';});}

var busy={};
function render(id,el,o){css();el.classList.add('z3h-scr');
  if(id==='z3build'){Promise.all([get('build'),data(),artL()]).then(function(r){if(ZB.cur!==id)return;var b=r[0],D=r[1];if(!b.goal||!D||!Z3ART.bldIcon){el.innerHTML=hdr('Стройка недели','')+'<p style="padding:16px">Толик ищет чертежи. Загляни чуть позже.</p>';bind(el);return;}
      el.innerHTML=buildHtml(b,D);bind(el);fest(b);});}
  else{get('house').then(function(h){if(ZB.cur!==id)return;el.innerHTML=benchHtml(h);bind(el,h);if(h.ep&&!h._sim)ev('olymp',{e:h.e});});}}
function bind(el,h){[].forEach.call(el.querySelectorAll('[data-h]'),function(b){b.onclick=function(){var a=b.getAttribute('data-h');
    if(a==='home')return home();if(a==='play')return play();tap();
    if(a==='take')return takeGift(h,el);if(a==='ask'){ask();return render('z3bench',el,{});}
    if(a==='more'){[].forEach.call(el.querySelectorAll('[data-more]'),function(r){r.style.display='';});b.remove();return;}
    if(a==='sos')return openSosedki('z3h',function(){ZB.go('z3bench');});if(a==='fr')return friends();};});
  [].forEach.call(el.querySelectorAll('[data-a]'),function(b){b.onclick=function(){tap();var a=(P._A||[])[+b.getAttribute('data-a')];if(a)give(a,b);
    [].forEach.call(el.querySelectorAll('[data-a]'),function(x){if(Z().g>=3&&!x.disabled)x.disabled=true;});};});}
P.ui=function(id,el,o){render(id,el,o||{});};
/* предметы двора (обёртки в старте зовут P.yd[id]) */
function pct(b){return b&&b.goal?Math.min(100,Math.round(100*b.st/b.goal)):0;}
P.yd={build:{note:function(){var b=pk('build'),nm=P.name?P.name(b):'';return b&&b.goal?(+b.i<0?'с понедельника':(nm?nm+' · ':'всем домом: ')+pct(b)+'%'):'всем домом';},
    badge:function(){return P.fest&&P.fest()?'!':'';},hot:function(){return !!(P.fest&&P.fest());}},
  bench:{note:function(){var h=pk('house');return h&&!h._sim&&h.now>=30?'сейчас в доме '+h.now:h&&!h._sim&&h.pct?'заходили '+h.pct+'%':'соседи на лавочке';}, // без сервера — без выдуманных чисел
    badge:function(){var h=pk('house');return h&&h.gift&&n(h.gift.gv)?'!':P.asks?String(P.asks()||''):'';},
    hot:function(){var h=pk('house');return !!(h&&h.gift&&n(h.gift.gv));}}};
P._x=1;
/* двор показан (или уже на экране): постройки на рисунке, праздник, имя стройки — раз за сеанс, открытым стройке/подъезду, через 1,5 с */
var yd=0;function yy(){if(yd||!(Z3.open('build')||Z3.open('bench')))return;yd=1;setTimeout(function(){ZB.safe('z3h:yard',P.yard);},1500);}
ZB.on('yard',yy);try{var mn=document.getElementById('menu');if(mn&&mn.classList.contains('on'))yy();}catch(e){}
data();
})();
