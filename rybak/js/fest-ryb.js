/* RB:SHOP (блок D, 08.10) — праздники Рыбалки на общем модуле FEST (js/fest.js — копия ~/Projects/hobby-analytics/fest, обновлять fest-sync.sh js/fest.js).
   Образец встраивания — Оборона js/meta-fest.js. Всё лежит в игре заранее и само включается/выключается по дате (МСК); проверка без даты — ?fest=hw26 / ?festday=2026-10-30 (только мак).
   hw26 «Кощеева неделя» 26.10–02.11 (на Яндексе FEST.name → «Осенний вечер»): ночное оформление меню (FEST deco night), болотные огоньки над водой вечером и ночью,
     «Сом-полуночник» (som_polu — запись реестра NORTH js/places.js, клёв через evPick) — тут только тост, FEST use/give, строка в итогах;
     3 письма (hw1–hw3), поплавок «Светлячок» за третье письмо (бесплатно), страшилки Петровича, «Ночной набор» 11 гол. (js/shop.js), плашка на главном (mapSlots).
   Малые дни: bab26 28.10 (подарок от стариков двора), vyh26 04.11 (двойной гостинец), sin26 12.11 (покормить синиц) — строкой в «Почте» (MAILX).
   zima26 с 15.11 — снег в меню (FEST) и на рыбалке; ny27 15.12–14.01 — гирлянда (FEST) и «подарок под ёлкой» раз в день в «Почте». До дат — выключено.
   Сохранение: S.fest (модуль FEST: застали/выдано/день use), S.festN {ny: день последнего подарка под ёлкой}. Облако: FEST.merge (объединение), festN — максимум. */
(function(){
'use strict';
if(typeof FEST==='undefined')return;
var D=document,$i=function(id){return D.getElementById(id);},HW='hw26';
function T(ru,en){return LANG==='en'?en:ru;}
function on(id){try{return FEST.on(id);}catch(e){return false;}}
function hwName(){return PLAT==='vk'&&LANG!=='en'?'Кощеева неделя':FEST.name(HW);}
window.festRybName=hwName;

/* ---------- запуск модуля ---------- */
try{FEST.init(S,{g:'rybak',plat:PLAT,lang:LANG,save:function(){save();},now:function(){return nowMs();},cls:'btn noenter',
  modal:function(h){modal(h);return $i('mcard');},close:function(){hideModal();},low:function(){return (typeof LOW!=='undefined'&&LOW)||calm();},
  change:function(){try{if(!G&&!modalOn&&$i('scr-map').classList.contains('on'))openMap();}catch(e){}}});}catch(e){}
var css=D.createElement('style');css.textContent='body.rb-fish #festFx{display:none}';D.head.appendChild(css);
if(!isObj(S.festN))S.festN={};

/* ---------- Сом-полуночник: данные и клёв — в реестре NORTH (js/places.js FISH_DB som_polu, fest:'hw26', evp; evPick в pickFish — только в праздник, не в турнире). Тут — только праздничная обвязка ---------- */
function somPlaces(){var a=[];PLACES.forEach(function(p,i){if(p.evf&&p.evf.indexOf('som_polu')>=0)a.push(i);});return a;}
function somWhere(){return somPlaces().map(function(i){return nm(PLACES[i]);}).join(', ');}
{var ld=landed;landed=function(){var pk=G&&G.pk;try{if(pk&&pk.f&&pk.f.id==='som_polu'){FEST.use(HW,'som');if(FEST.give(HW,'som'))later(function(){toast('🌙 '+T('Сом-полуночник — в альбоме навсегда!','The Midnight catfish is in your album forever!'),3600,true);},1600);}}catch(e){}return ld.apply(this,arguments);};}

/* ---------- письма ---------- */
var LET_HW=[
  {id:'hw1',fr:'petr',fest:HW,ru:'Сосед, праздник у нас — «{N}»! Старики говорят: в эти ночи на Волге сом-полуночник из омута выходит. Глаза — как два светлячка. Сходи ночью, проверь — только фонарь не забудь.',en:'Spooky week is here! They say the Midnight catfish comes out at night. Go fishing at night.',rq:{ty:'tod',tod:'night',n:2},rw:{c:.8}},
  {id:'hw2',fr:'mit',fest:HW,ru:'Расскажу тебе быль. Жил у нас рыбак Кощеич — худой, как удилище, и жадный. Всю рыбу в реке переловить хотел. Река обиделась — с тех пор ему один ёрш попадается. Так что лови в меру, а лишнюю — отпускай. Наловишь десяток — пришлю живцов.',en:'A tale: a greedy angler wanted all the fish — and the river punished him. Catch ten fish and I\'ll send live bait.',rq:{ty:'n',n:10},rw:{b:['live',15],c:.4}},
  {id:'hw3',fr:'zina',fest:HW,ru:'Внук светлячков в банку наловил — я ему говорю: отпусти. А тебе вот поплавок «Светлячок» — ночью сам светится, сома-полуночника не проглядишь. Порыбачь вечерком — и он твой.',en:'Here\'s a «Firefly» float — it glows at night. Fish in the evening and it\'s yours.',rq:{ty:'tod',tod:'evening',n:2},rw:{c:.5,svet:1}}];
LET_HW.forEach(function(x){x.ru=x.ru.replace('{N}',hwName());LETTERS[x.id]=x;});
{var nx=a3MailNext;a3MailNext=function(){if(on(HW)){var M=S.mail;for(var i=0;i<LET_HW.length;i++)if(!M.dl[LET_HW[i].id])return LET_HW[i];}return nx();};}
{var mt=a3MailTake;a3MailTake=function(id){var x=LETTERS[id],had=!!(S.mail&&S.mail.ok&&S.mail.ok[id]);mt.apply(this,arguments);
  if(x&&x.rw&&x.rw.svet&&!had&&S.mail.ok[id]){S.xo.svet=1;if(!S.xf||S.xf==='club')S.xf='svet';FEST.give(HW,'main');save();later(function(){toast('🌙 '+T('Поплавок «Светлячок» надет — «Берег» в магазине','The «Firefly» float is on'),3600,true);},900);}};}
{var rt=a3RwTxt;a3RwTxt=function(x){var s=rt(x);if(x&&x.rw&&x.rw.svet)s+=(s?' · ':'')+'✨ '+T('поплавок «Светлячок»','the «Firefly» float');return s;};}

/* ---------- страшилки Петровича (на рыбалке, в праздник) ---------- */
var SPOOK=['Слышишь? Это не леший — это выпь. Наверное.','В Кощееву неделю рыба смелеет. И комары тоже.','Дед мой говорил: ночью на омуте сом-полуночник усами туман разводит.','Ты фонарь-то не гаси — мало ли кто из камышей посмотрит.','Говорят, кто сома-полуночника отпустит — тому весь год клевать будет.'];
{var sf=startFish;startFish=function(pi,opt){D.body.classList.add('rb-fish');var r=sf.apply(this,arguments);
  try{if(G&&on(HW)&&!G.tourn&&PH&&PH.petr){if(!PH.petr.idle0)PH.petr.idle0=PH.petr.idle;PH.petr.idle=PH.petr.idle0.concat(SPOOK,SPOOK);FEST.use(HW,'fish');}
    else if(PH&&PH.petr&&PH.petr.idle0)PH.petr.idle=PH.petr.idle0;}catch(e){}return r;};}
{var om=openMap;openMap=function(){D.body.classList.remove('rb-fish');return om.apply(this,arguments);};}
{var os=openShop;openShop=function(){D.body.classList.remove('rb-fish');return os.apply(this,arguments);};}

/* ---------- на воде: огоньки (праздник, вечер/ночь), снег (зима) ---------- */
{var wd=drawWaterDec;drawWaterDec=function(g,t){wd(g,t);if(!G||G.tourn)return;var u=GEO.u,W=GEO.W,H=GEO.H,i,tt=calm()?0:t;
  if(on(HW)&&(G.cond.tod==='night'||G.cond.tod==='evening')){var R=rng(G.pi*17+3);for(i=0;i<7;i++){var d=4+R()*22,x=W*(.15+R()*.8)+Math.sin(tt*.4+i)*u*1.5,y=GEO.yOf(d)-u*(1+R()*2)+Math.cos(tt*.7+i*1.3)*u*.6,
      a=.35+.3*Math.sin(tt*2+i*1.7),r=u*(.5+GEO.ps(d)*1.2),c=i%2?'154,255,138':'255,226,122';
    if(typeof LOW!=='undefined'&&LOW&&typeof glowSp==='function')glowSp(g,x,y,r*4,c,a);else{var gl=g.createRadialGradient(x,y,0,x,y,r*4);gl.addColorStop(0,'rgba('+c+','+a.toFixed(2)+')');gl.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gl;g.fillRect(x-r*4,y-r*4,r*8,r*8);}
    g.fillStyle='rgba('+c+','+Math.min(1,a+.4).toFixed(2)+')';g.beginPath();g.arc(x,y,r*.45,0,7);g.fill();}}
  if((on('zima26')||on('ny27'))&&!(typeof LOW!=='undefined'&&LOW)){var n=calm()?14:26;g.fillStyle='rgba(255,255,255,.85)';for(i=0;i<n;i++){var sx=((i*97.3+tt*u*(.6+(i%5)*.15)*3)%(W+u*4))-u*2,sy=((i*53.1+tt*u*(4+(i%7)*.6))%(H+u*4))-u*2;
      sx+=Math.sin(tt*.8+i)*u*.8;g.beginPath();g.arc(sx,sy,u*(.18+(i%3)*.08),0,7);g.fill();}}};}

/* ---------- плашка на главном (гнездо UX mapSlots) и окно праздника ---------- */
function hwOpen(){if(!on(HW))return;try{STAT.screen('fest');}catch(e){}var got=!!(S.alb&&S.alb.som_polu&&S.alb.som_polu.n),left=FEST.left(HW),svet=!!(S.xo&&S.xo.svet),M=S.mail,nl=LET_HW.filter(function(x){return M.ok[x.id];}).length;
  var row=function(ok,t,s){return '<div class="a3g'+(ok?' done':'')+'"><span class="ai">'+(ok?'✓':'🌙')+'</span><span>'+t+(s?'<small>'+s+'</small>':'')+'</span></div>';};
  modal('<h2>🌙 '+esc(hwName())+'</h2><p>'+T('Праздник идёт '+(left<=1?'последний день':'ещё '+left+' '+pl(left,'день','дня','дней','',''))+'. Ночью у воды — огоньки, а в омутах — сом-полуночник.','The holiday lasts '+left+' more days.')+'</p>'+
    row(got,T('Поймать Сома-полуночника','Catch the Midnight catfish'),T('вечером или ночью (места: ','evening or night (')+esc(somWhere())+T('), лучше на живца — в альбом навсегда','), live bait is best'))+
    row(svet,T('Поплавок «Светлячок» — бесплатно','The «Firefly» float — free'),T('письма праздника: ','holiday letters: ')+nl+' / '+LET_HW.length)+
    (PAY.on&&!OK&&PAY.item('night_kit')?row(PAY.own('night_kit'),T('«Ночной набор» — в магазине','«Night kit» — in the shop'),T('поплавок «Полумесяц», фонарь и сова на берегу','a crescent float, a lamp and an owl')):'')+
    '<div class="row"><button class="btn green noenter" id="hwGo">🎣 '+T('Ночная рыбалка','Night fishing')+'</button>'+(PAY.on&&!OK&&PAY.item('night_kit')&&!PAY.own('night_kit')?'<button class="btn noenter" id="hwShop">🌙 '+T('Ночной набор','Night kit')+'</button>':'')+'<button class="btn" id="mCancel">'+T('Закрыть','Close')+'</button></div>');
  try{STAT.ev('fest',{e:HW,a:'open'});}catch(e){}
  $i('hwGo').onclick=function(){var sp=somPlaces().filter(function(i){return S.open[i];}),pi=sp.length?sp[0]:(S.open[1]?1:0);startFish(pi,{tod:'night'});};
  if($i('hwShop'))$i('hwShop').onclick=function(){hideModal();openShop('p');};$i('mCancel').onclick=hideModal;}
window.festRybOpen=hwOpen;
if(typeof slotAdd==='function'&&typeof mapSlots!=='undefined'){
  slotAdd(mapSlots,{id:'fest',pri:60,when:function(){return on(HW)&&(S.sessions||0)>=1;},
    html:function(){var left=FEST.left(HW);return '<button class="a3m noenter rb-fest"><b>🌙 '+esc(hwName())+'</b> · '+(left<=1?T('последний день','last day'):T('ещё '+left+' '+pl(left,'день','дня','дней','',''),left+' days left'))+' ›</button>';},
    bind:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){SND.tap();hwOpen();};}});
  slotAdd(mapSlots,{id:'festday',pri:55,when:function(){return !!dayFest();},
    html:function(){var f=dayFest();return '<button class="a3m noenter rb-fest">'+(f.icon||'🎁')+' <b>'+esc(FEST.name(f.id))+'</b> · '+esc(f.txt||'')+' ›</button>';},
    bind:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){SND.tap();openMail();};}});}
// подсветка плашки праздника в итогах рыбалки (resultSlots): поймал сома — строка
if(typeof slotAdd==='function'&&typeof resultSlots!=='undefined')slotAdd(resultSlots,{id:'fest',pri:40,when:function(c){return on(HW)&&c&&c.fish&&c.fish.some(function(x){return x&&x.id==='som_polu';});},
  html:function(){return '<p class="goal tipl">🌙 '+T('Сом-полуночник! Такой бывает только в Кощееву неделю.','The Midnight catfish — only during spooky week!')+'</p>';}});

/* ---------- малые дни и Новый год — строкой в «Почте» (MAILX из js/shop.js) ---------- */
function dayFest(){var ids=['bab26','vyh26','sin26','bab27','vyh27','sin27'];for(var i=0;i<ids.length;i++)if(on(ids[i])&&!FEST.got(ids[i],'main'))return FEST.get(ids[i]);return null;}
var DAYG={bab:{ic:'👵',t:T('Подарок от стариков двора','A gift from the elders'),k:1,b:['dough',10]},vyh:{ic:'🎁',t:T('Выходной: двойной гостинец','Day off: a double treat'),k:2},sin:{ic:'🐦',t:T('Синичкин день: покормил синиц','Tit day: fed the tits'),k:1,b:['maggot',10]}};
function dayG(){var f=dayFest();return f?DAYG[f.id.slice(0,3)]:null;}
function dayC(){var g=dayG();return g?Math.max(30,Math.round(a3Trip()*g.k/5)*5):0;}
if(window.MAILX){
  MAILX.push({id:'festday',ok:function(){return (S.caught||0)>=1&&!!dayFest();},ic:'🎁',part:T('праздничный подарок','a holiday gift'),c:dayC,
    get t(){var g=dayG();return g?g.t:'';},get sub(){var g=dayG();return g&&g.b?BAIT[g.b[0]].ic+' +'+g.b[1]:'';},
    take:function(){var f=dayFest(),g=dayG();if(!f||!g)return;if(!FEST.give(f.id,'main'))return;var c=dayC();S.coins+=ern('gift',c);if(g.b)S.bait[g.b[0]]=(S.bait[g.b[0]]||0)+g.b[1];save();toast((g.ic||'🎁')+' +'+coinsTxt(c),2800,true);}});
  // «подарок под ёлкой» — раз в день в Новый год (ny27/ny28)
  var nyOn=function(){return on('ny27')||on('ny28');},nyId=function(){return on('ny27')?'ny27':'ny28';};
  MAILX.push({id:'ny',ok:function(){return (S.caught||0)>=1&&nyOn()&&S.festN.ny!==dayNum();},ic:'🎄',part:T('подарок под ёлкой','a gift under the tree'),
    c:function(){return Math.max(30,Math.round(a3Trip()*(FEST.day(nyId())%7===0?2:.8)/5)*5);},
    get t(){return T('Подарок под ёлкой — день ','Gift under the tree — day ')+FEST.day(nyId());},sub:T('каждый день до 14 января','every day until 14 January'),
    take:function(){if(!this.ok())return;var c=this.c();S.festN.ny=dayNum();S.coins+=ern('gift',c);FEST.use(nyId(),'gift');save();toast('🎄 +'+coinsTxt(c),2600,true);}});}

/* ---------- сохранение и облако ---------- */
{var fx=fixSave;fixSave=function(){fx.apply(this,arguments);if(!isObj(S.festN))S.festN={};};}
{var mg=mergeSave;mergeSave=function(d,ref){var st=S.fest,fn=isObj(S.festN)?Object.assign({},S.festN):{};mg.apply(this,arguments);
  try{if(isObj(st)){FEST.merge(d&&d.fest);S.fest=st;}}catch(e){}
  var b=d&&isObj(d.festN)?d.festN:{},k;for(k in b)if(typeof b[k]==='number')fn[k]=Math.max(fn[k]||0,b[k]);S.festN=fn;};}
// карта уже нарисована до загрузки модуля — перерисовать один раз (оформление и плашка)
setTimeout(function(){try{if(!G&&!modalOn&&$i('scr-map').classList.contains('on'))openMap();}catch(e){}},0);
window.__festRyb={hwOpen:hwOpen,dayFest:dayFest,somPlaces:somPlaces,LET_HW:LET_HW};
})();
