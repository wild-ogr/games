'use strict';
/* ================= Меню и окна ================= */
let curTab='Village',mapSel=0,forgeSeg='hero';
// покупки (js/pay.js): общий модуль PAY пишет по-русски — английские подписи подставляем здесь, сам модуль не трогаем
function payHTML(ids,owned){const h=PAY.html(ids,owned);return LANG==='en'?h.replace('<h3>Покупки</h3>','<h3>Purchases</h3>').replace(/<i>куплено<\/i>/g,'<i>owned</i>').replace(/(\d) тест</g,'$1 test<'):h;} // i18n:ru — замена русского на английский
// статистика покупок: обёртка снаружи общего модуля PAY (сам модуль не трогаем). Все товары постоянные: куплено = PAY.own(id) после окна оплаты
// STAT v1.2: buy {i, r:try|ok|cancel|fail, v: голоса из PAY_ITEMS}; отказ игрока (VK код 4 / success:false, cancel/closed/denied) — cancel, остальные ошибки — fail
function payWhy(e){const d=e&&e.error_data||{},s=String(d.error_reason||d.error_msg||(e&&(e.message||e.code||e.error_type))||e||'');return +d.error_code===4||/cancel|close|denied|reject|user/i.test(s)?'cancel':'fail';}
{const b0=PAY.buy;PAY.buy=function(id){if(PAY.busy||!PAY.on||PAY.own(id))return b0.call(PAY,id);let why='';const v=(PAY_ITEMS[id]||{}).vk|0,o=PAY.v,p=PAY.p,ov=o&&o.order,pp=p&&p.purchase;
  if(ov)o.order=function(){return Promise.resolve(ov.apply(o,arguments)).then(r=>{if(!r||!r.success)why='cancel';return r;},e=>{why=payWhy(e);throw e;});};
  if(pp)try{p.purchase=function(){return Promise.resolve(pp.apply(p,arguments)).catch(e=>{why=payWhy(e);throw e;});};}catch(e){}
  STAT.ev('buy',{i:id,r:'try',v:v});
  const back=()=>{if(ov)o.order=ov;if(pp)try{p.purchase=pp;}catch(e){}};
  return Promise.resolve(b0.call(PAY,id)).then(()=>{back();STAT.ev('buy',{i:id,r:PAY.own(id)?'ok':why||'fail',v:v});},e=>{back();STAT.ev('buy',{i:id,r:'fail',v:v});throw e;});};}
// kind — вид окна для css/look.css (data-w: level, chest, gift, death, result, pause…)
function showModal(html,kind){if(typeof PAY!=='undefined')PAY.re=null;const m=$('mBody');m.setAttribute('data-w',kind||'');m.innerHTML=html;$('modal').classList.add('on');}
// защита от случайного касания (аудит 14): окно посреди боя первые 0,35 с не принимает касаний (палец водил богатыря) + мягкое появление
function guardModal(){const m=$('mBody');m.classList.remove('guard');void m.offsetWidth;m.classList.add('guard');clearTimeout(guardModal.t);guardModal.t=setTimeout(()=>m.classList.remove('guard'),350);}
function hideModal(){$('modal').classList.remove('on');}
function on(id,fn){const el=$(id);if(el)el.onclick=e=>{SND.click();fn(e);};}
// кнопка «за рекламу»: статистика — кнопку видели (STAT.offer) и место ролика (STAT.place перед showRewarded)
function onAd(id,p,fn){const el=$(id);if(!el)return;STAT.offer(p);el.onclick=e=>{SND.click();STAT.place(p);fn(e);};}
function setGold(){$('goldTxt').textContent=fmtNum(S.gold);STAT.bal(Math.floor(S.gold||0));}
function ic(key,px){return iconURL(key,px||96);}

/* ---------- вкладки ---------- */
function openTab(t){curTab=t;STAT.once('menu');STAT.screen(t.toLowerCase());for(const s of document.querySelectorAll('.tab'))s.classList.toggle('on',s.id==='tab'+t);
  for(const b of document.querySelectorAll('nav button'))b.classList.toggle('on',b.dataset.tab===t);
  if(t==='Heroes'&&S.heroNew){S.heroNew=0;save();}const rT=({Village:renderVillage,Forge:renderForge,Map:renderMap,Heroes:renderHeroes,Quests:renderQuests})[t];if(rT)rT();else META_HK('TAB',t);setGold();questBadge();} /* чужая вкладка (напр. «Подворье») — рисует мета: META_TAB(t) */
// окна «награда за вход» при каждом возврате больше нет: всё ежедневное — в «Делах на сегодня» (раз за запуск и по кнопке на карте)
function toMenu(tab,after){G=null;rDirty=true;cloudApply();musicDuck(1);document.body.classList.remove('run');hideModal();tipHide();openTab(tab||curTab);musicPlay('menu');if(after)setTimeout(after,300);}

/* ---------- плашка обучения ---------- */
function tipShow(t,ev){const el=$('tip');if(!el)return;$('tipT').textContent=t;el.classList.toggle('ev',!!ev);el.classList.remove('on');void el.offsetWidth;el.classList.add('on');$('tipX').classList.toggle('on',!!(G&&G.tut&&!G.tut.xOff&&TUT[G.tut.i]));}
function tipHide(){const el=$('tip');if(el)el.classList.remove('on');$('tipX').classList.remove('on');}

/* ---------- настройки звука ---------- */
function volHTML(){const r=(id,lab,v)=>'<label class="vol"><span>'+lab+'</span><input type="range" min="0" max="100" step="5" id="'+id+'" value="'+Math.round(v*100)+'"><b id="'+id+'V">'+Math.round(v*100)+'%</b></label>';
  return '<div class="card" style="margin:10px 0 0">'+r('vM',L('🎵 Музыка','🎵 Music'),volM())+r('vS',L('🔔 Звуки','🔔 Sounds'),volS())+
    '<button class="btn ghost" id="vAll" style="width:100%;margin-top:6px">'+sndTxt()+'</button></div>';}
function sndTxt(){return S.sound?L('🔊 Звук включён','🔊 Sound on'):L('🔈 Звук выключен','🔈 Sound off');}
function volBind(){const upd=(id,key)=>{const el=$(id);if(!el)return;el.oninput=()=>{S[key]=+el.value/100;$(id+'V').textContent=el.value+'%';ac();volApply();};el.onchange=()=>{save();if(key==='vs')SND.coin();};};
  upd('vM','vm');upd('vS','vs');on('vAll',()=>{S.sound=S.sound?0:1;save();ac();volApply();$('vAll').textContent=sndTxt();sndIcon();});}
// значок всегда ⚙️ (настройки), выключенный звук — маленький 🔇 в углу
function sndIcon(){const b=$('sndBtn');b.textContent='⚙️';b.classList.toggle('off',!S.sound);}
function openSettings(){STAT.screen('settings');showModal('<h3>'+L('Настройки','Settings')+'</h3>'+langHTML()+volHTML()+
  '<div class="card" style="margin:10px 0 0"><button class="btn ghost" id="calmBtn" style="width:100%">'+(S.calm?L('🌙 Спокойный режим: вкл','🌙 Calm mode: on'):L('🌙 Спокойный режим: выкл','🌙 Calm mode: off'))+'</button><p class="sub" style="margin:6px 2px 0;text-align:left">'+L('Без тряски экрана, красных вспышек, мигания и замирания кадра при ударе.','No screen shake, red flashes, blinking or hit freeze-frames.')+'</p>'+
    (canVib()?'<button class="btn ghost" id="vibBtn" style="width:100%;margin-top:8px">'+(S.vib!==0?L('📳 Вибрация: вкл','📳 Vibration: on'):L('📳 Вибрация: выкл','📳 Vibration: off'))+'</button>':'')+
    '<button class="btn ghost" id="fxBtn" style="width:100%;margin-top:8px">'+L('✨ Эффекты: ','✨ Effects: ')+fxName()+'</button><p class="sub" style="margin:6px 2px 0;text-align:left">'+L('«Мало» — меньше искр и цифр, плавнее на слабом телефоне. «Авто» убавит само, если телефон не успевает.','“Low” — fewer sparks and numbers, smoother on weak phones. “Auto” turns them down by itself if the phone lags.')+'</p>'+
    (STAT.available()?'<button class="btn ghost" id="statBtn" style="width:100%;margin-top:8px">'+STAT.label()+'</button><p class="sub" style="margin:6px 2px 0;text-align:left">'+STAT.note()+'</p>':'')+'</div>'+
  '<div class="btns">'+(S.tut===-1?'<span class="tag ok" style="text-align:center;padding:10px">'+L('✓ Обучение покажется в следующем походе','✓ The tutorial will show on your next run')+'</span>':'<button class="btn ghost" id="tutAgain">'+L('Показать обучение снова','Show tutorial again')+'</button>')+(SOC.ok()?'<button class="btn ghost" id="socBtn">'+(OK?L('👥 Друзья ›','👥 Friends ›'):L('👥 Друзья и игры ›','👥 Friends & games ›'))+'</button>':'')+'<button class="btn ghost" id="credBtn">'+L('🎻 Благодарности','🎻 Credits')+'</button><button class="btn big" id="setOk">'+L('Готово','Done')+'</button></div>');
  // покупки Яндекса (js/pay.js) — только в меню; нет платежей — раздела нет
  if(typeof payHere==='function'&&payHere()){const c=document.createElement('div');c.innerHTML=payHTML()+'<button class="btn ghost" id="payRe" style="width:100%;margin-top:4px">'+L('↻ Восстановить покупки','↻ Restore purchases')+'</button>';
    const b=$('mBody').querySelector('.btns');b.parentNode.insertBefore(c,b);PAY.bind(c);PAY.re=openSettings;on('payRe',()=>PAY.again());STAT.screen('shop');} // STAT v1.2: покупки — раздел настроек = «магазин»
  volBind();langBind();on('setOk',hideModal);on('statBtn',()=>{$('statBtn').textContent=STAT.toggle();});on('credBtn',openCredits);on('socBtn',openSocial);on('calmBtn',()=>{S.calm=S.calm?0:1;save();openSettings();});
  on('vibBtn',()=>{S.vib=S.vib===0?1:0;save();if(S.vib)vib(40,1);openSettings();});on('fxBtn',()=>{QL.mode=(QL.mode+1)%3;if(QL.mode===0)QL.auto=0;qSave();layout();openSettings();});on('tutAgain',()=>{S.tut=-1;save();toast(L('Обучение покажется в следующем походе','The tutorial will show on your next run'));openSettings();});}
// кнопка 🎲 в шапке меню — только VK с мостом
function updMore(){const b=$('moreBtn');if(b)b.style.display=SOC.can('more')?'':'none';}
// ⚙ → «Друзья и игры»: кнопки модуля SOC отдельным окном
function openSocial(){STAT.screen('social');STAT.ev('mod',{m:'soc',a:'open'});showModal('<h3>'+(OK?L('👥 Друзья','👥 Friends'):L('👥 Друзья и игры','👥 Friends & games'))+'</h3>'+SOC.settingsHtml()+'<div class="btns"><button class="btn" id="socBack">'+L('← Назад','← Back')+'</button></div>');
  on('socBack',openSettings);SOC.bind($('mBody'),openSocial);}
// язык (js/i18n.js): переключатель RU/EN в настройках, выбор запоминается; в VK его нет — там всегда русский
function langHTML(){if(LANG_VK)return '';const b=(l,t)=>'<button data-lang="'+l+'" class="'+(LANG===l?'on':'')+'">'+t+'</button>';
  return '<div class="card" style="margin:10px 0 0;display:flex;align-items:center;gap:10px"><b style="flex:1;font-size:14px">🌐 '+L('Язык','Language')+'</b><div class="seg" style="margin:0;flex:0 0 auto">'+b('ru','RU')+b('en','EN')+'</div></div>';}
function langBind(){for(const b of $('mBody').querySelectorAll('[data-lang]'))b.onclick=()=>{SND.click();setLang(b.dataset.lang,true);openSettings();};}
// после смены языка: меню, золото, открытая вкладка; в походе надписи на холсте берут язык сами
function langRedraw(){try{if(!G){openTab(curTab);}else rDirty=true;sndIcon();}catch(e){}}

// эффекты: авто (0) → много (1) → мало (2); «авто» после медленных кадров показывает, что убавило
function fxName(){return QL.mode===1?L('много','high'):QL.mode===2?L('мало','low'):QL.auto?L('авто (сейчас мало)','auto (low now)'):L('авто','auto');}

/* ---------- благодарности: музыка чужая, подпись авторов обязательна по лицензии ---------- */
const CREDITS=[
  {t:'Medieval: Market Day',get w(){return L('деревня и меню','village and menu');},a:'RandomMind',l:'CC0 1.0 (creativecommons.org/publicdomain/zero/1.0)',src:'OpenGameArt'},
  {t:'Zombies also love to play the fool',get w(){return L('поход (из альбома «In Russian Style»)','runs (from the album “In Russian Style”)');},a:'Alexandr Zhelanov, soundcloud.com/alexandr-zhelanov',l:'CC-BY 3.0 (creativecommons.org/licenses/by/3.0)',src:'OpenGameArt'},
  {t:'Brave Soldiers',get w(){return L('бой с боссом','boss fights');},a:'Alexandr Zhelanov, soundcloud.com/alexandr-zhelanov',l:'CC-BY 3.0 (creativecommons.org/licenses/by/3.0)',src:'OpenGameArt'}];
// ссылок нет (правила площадок запрещают внешние ссылки) — только текст: автор, лицензия (адрес — текстом, не ссылкой), источник
function openCredits(){STAT.screen('credits');
  showModal('<h3>'+L('Благодарности','Credits')+'</h3><p class="sub">'+L('Музыка, под которую богатырь бьёт нечисть. Спасибо авторам!','The music our bogatyr fights to. Thanks to the authors!')+'</p>'+
    CREDITS.map(c=>'<div class="card" style="margin:8px 0;text-align:left;font-size:13px;line-height:1.45"><b style="font-size:15px">'+L('«'+c.t+'»','“'+c.t+'”')+'</b> <span style="opacity:.7">— '+c.w+'</span><br>'+
      L('Автор: ','Author: ')+c.a+'<br>'+L('Лицензия: ','License: ')+c.l+'<br>'+L('Источник: ','Source: ')+c.src+'</div>').join('')+
    (PLAT==='vk'&&!OK?'<div class="card" style="margin:8px 0;text-align:left;font-size:13px;line-height:1.45"><b style="font-size:15px">VK Bridge</b> <span style="opacity:.7">— '+'связь с VK Играми'+'</span><br>© V Kontakte LLC, лицензия MIT</div>':'')+ // i18n:ru — только VK
    '<div class="btns"><button class="btn big" id="credOk">'+L('Назад','Back')+'</button></div>');on('credOk',openSettings);}

/* ---------- «не хватает чуть-чуть» — подсказки рекламы за награду в момент нужды ---------- */
function giftAmt(){return ECO.gift[0]+ECO.gift[1]*landsU();}
function giftReady(){return !!S.runs&&nowMs()-(S.gift||0)>4*3600e3;}
function giftLeftH(){return Math.max(1,Math.ceil((4*3600e3-(nowMs()-(S.gift||0)))/3600e3));}
/* «×2 казны» за ролик — не больше 2 раз в день (экономика 07.10: без лимита +33 тыс. каз./+175 тыс. акт. за 56 дн) */
function afk2Left(){const d=S.afk2;return 2-(d&&d.day===dayKey()?d.n|0:0);}
function afk2Use(){const d=S.afk2&&S.afk2.day===dayKey()?S.afk2:{day:dayKey(),n:0};d.n=(d.n|0)+1;S.afk2=d;}
function boostLeft(){return S.village.mill?2-(S.afkBoost&&S.afkBoost.day===dayKey()?S.afkBoost.n:0):0;}
// adt: после поздней награды перерисовать вкладку меню (кнопка «за рекламу» не должна остаться живой) — только вне похода и не под открытым окном
// adt: «моё окно ещё на экране» — окно открыто и элемент в нём (скрытое окно хранит старую вёрстку — одной проверки по id мало)
function modalHas(el){return !!el&&$('modal').classList.contains('on')&&document.body.contains(el);}
function lateRe(){try{setGold();if(!G&&!$('modal').classList.contains('on'))openTab(curTab);}catch(e){}}
let lgX2Day=''; // adt: «×2 за вход» сегодня уже выдано (обычным или поздним роликом)
function takeGift(after,p){STAT.place(p||'gift');showRewarded(()=>{if(!giftReady()){if(after)after();return;}const a=giftAmt();S.gold+=a;ern('ad',a);S.gift=nowMs();save();SND.chest();toast('+'+fmtNum(a)+L(' золота!',' gold!'));setGold();if(after)after();},null,
  ()=>{if(!giftReady())return '';const a=giftAmt();S.gold+=a;ern('ad',a);S.gift=nowMs();save();SND.chest();lateRe();return L('Дар Жар\u2011птицы: +','Firebird’s Gift: +')+fmtNum(a)+goldW();});}
function takeBoost(after,p){STAT.place(p||'boost');const give=()=>{const a=afkRate()*ECO.boostH;S.afkBoost={day:dayKey(),n:3-boostLeft()};S.gold+=a;ern('ad',a);save();SND.coin();return a;};
  showRewarded(()=>{if(boostLeft()<=0){if(after)after();return;}const a=give();toast('+'+fmtNum(a)+goldW());setGold();if(after)after();},null,()=>{if(boostLeft()<=0)return '';const a=give();lateRe();return '+'+fmtNum(a)+goldW();});}
// что можно купить: постройки, кузница, оружейная для оружия текущего богатыря
function upList(){if(!S.village.forge)return [{n:BLD[0].name,c:BLD[0].cost[0]}];const UL=[];
  for(const b of BLD){const l=S.village[b.id]||0;if(l<b.cost.length)UL.push({n:b.name,c:b.cost[l]});}
  for(const f of FORGE){const l=S.forge[f.id]||0;if(l<f.max)UL.push({n:f.name+L(', ур. ',', lv ')+(l+1),c:forgeCost(l,f.id)});}
  const w=(HERO_BY[S.hero]||HEROES[0]).weapon,la=S.armory[w]||0;if(la<ARMORY_MAX)UL.push({n:WEAPONS[w].name+L(', ур. ',', lv ')+(la+1),c:armoryCost(la)});
  return UL;}
function cheapestIn(UL,lo,hi){return UL.filter(u=>u.c>lo&&u.c<=hi).sort((a,b)=>a.c-b.c)[0];}
// карточка «не хватает N» с подарком/казной за рекламу; list — что лежит на этом экране
function needCard(UL,rerender){const g=S.gold,ga=giftReady()?giftAmt():0,ba=boostLeft()>0?afkRate()*ECO.boostH:0,best=Math.max(ga,ba);if(!best||!adOk())return '';
  const u=cheapestIn(UL,g,g+best);if(!u)return '';const byGift=ga&&u.c<=g+ga;
  needCard.fn=()=>(byGift?takeGift:takeBoost)(rerender,'need');
  return '<div class="card gift"><img src="'+ic(byGift?'bird':'chest',60)+'" width="48" height="48"><div class="t" style="flex:1"><b>'+L('Не хватает '+fmtNum(u.c-g)+' на «'+u.n+'»','Need '+fmtNum(u.c-g)+' more for “'+u.n+'”')+'</b><span style="display:block;font-size:12.5px;color:var(--mut)">'+(byGift?L('Дар Жар-птицы','Firebird’s Gift'):L('Казна сразу, +'+ECO.boostH+' ч','Instant treasury, +'+ECO.boostH+' h'))+': +'+fmtNum(byGift?ga:ba)+goldW()+'</span></div><button class="btn ad" id="needAd">'+L('🎬 За рекламу','🎬 Watch ad')+'</button></div>';}

/* ---------- деревня ---------- */
const VPOS={home:[.5,.62,1.1],forge:[.16,.72,.9],altar:[.84,.74,.8],barn:[.33,.5,.95],tower:[.7,.45,.9],well:[.5,.86,.7],hut:[.9,.52,.8],tavern:[.1,.46,.95],mill:[.28,.84,.85],fair:[.7,.84,.85]};
/* ntf в деревне (решение владельца 06.10): если вопрос про напоминания VK положен, но в окне итогов победы его не показали (новый богатырь/облик, кузница,
   не влез, следом межэкранная) — ntfPend, и он показывается плашкой на экране деревни после возвращения из похода. Одно предложение за сеанс и расписание — в SOC.offer;
   не пока нет кузницы (там обучение «первым делом — кузница»), не при открытом окне, не при рекламе. Плашка живёт до нажатия или до следующего похода */
let ntfPend=false,ntfV=null;
function ntfVillage(){
  if(!ntfV&&ntfPend&&curTab==='Village'&&!G&&S.village.forge&&!$('modal').classList.contains('on')&&typeof SOC!=='undefined'&&SOC.ntfDue()){
    const o=SOC.offer(S.runs||0,Date.now()-ADV.last<60000||adShowing||adBusy);if(o){ntfPend=false;if(o.k==='ntf')ntfV=o;}}
  return ntfV?'<div class="card ntfv" id="vNtf"><p>'+ntfV.t+'</p><button class="btn ghost" id="vNtfB">'+ntfV.b+'</button></div>':'';}
function renderVillage(){const el=$('tabVillage');const giftOk=nowMs()-(S.gift||0)>4*3600e3,gAmt=giftAmt(),mill=!!S.village.mill,vet=!!S.runs;
  let h='<canvas id="village"></canvas>';
  if(!S.runs)h+='<div class="card"><div class="row"><img class="ic" src="'+ic('hp_dob')+'"><div class="t"><b>'+L('Нечисть лезет из леса!','Monsters are pouring out of the forest!')+'</b><span>'+L('Жми «В поход». Золото из походов тратим тут: строим деревню и куём силу.','Tap “Battle!”. Spend gold from runs here: build the village and forge your strength.')+'</span></div></div></div>';
  // казна — после Мельницы
  if(mill){const g=afkGold(),cap=afkCapH(),h2=afkH();
    h+='<div class="card treasury"><div class="row"><img class="ic" src="'+ic('chest',96)+'"><div class="t"><b>'+L('Казна: ','Treasury: ')+fmtNum(g)+goldW()+'</b><span>'+L(afkRate()+' в час, пока тебя нет · вмещает '+String(cap).replace('.',',')+' ч',afkRate()+' per hour while you’re away · holds '+cap+' h')+'</span><div class="bar"><i style="width:'+Math.round(h2/cap*100)+'%"></i></div></div></div>'+
      (g>0?'<div class="btns" style="flex-direction:row"><button class="btn gold" id="afkTake" style="flex:1">'+L('Забрать ','Collect ')+fmtNum(g)+'</button>'+(g>=30&&adOk()&&afk2Left()>0?'<button class="btn ad" id="afkX2" style="flex:1">'+L('🎬 ×2 за рекламу','🎬 ×2 for an ad')+'</button>':'')+'</div>':'')+'</div>';}
  h+=ntfVillage(); /* ntf: отложенный вопрос рассказчика про напоминания VK — плашкой под картинкой деревни */
  const noForge=!S.village.forge;
  if(noForge)h+='<h2>'+L('Первым делом — кузница','First things first — the Forge')+'</h2><p class="sub">'+L('В кузнице прокачка остаётся навсегда. Остальные постройки откроются после неё.','Forge upgrades stay forever. Other buildings unlock after it.')+'</p>';
  else h+='<h2>'+L('Постройки','Buildings')+'</h2><p class="sub">'+L('Каждая постройка даёт силу во всех походах.','Every building makes you stronger in all runs.')+(mill?'':L(' Мельница откроет казну — золото без игры.',' The Mill opens the Treasury — gold while you’re away.'))+'</p>';
  for(const b of noForge?[BLD[0]]:BLD){const l=S.village[b.id]||0,max=b.cost.length,cost=b.cost[l],rec=b.id==='mill'&&!l;
    h+='<div class="card'+(noForge||rec?' next':'')+'"><div class="row"><div class="t"><b>'+b.name+(rec?' <em class="rec">'+L('👍 советуем','👍 good pick')+'</em>':'')+(l?' <span style="display:inline;color:var(--gold);font-size:12px">'+L('ур. ','lv ')+l+'</span>':'')+'</b><span>'+b.about+'</span>'+
      (max>1?'<div class="pips">'+Array.from({length:max},(_,i)=>'<i class="'+(i<l?'on':'')+'"></i>').join('')+'</div>':'')+'</div>'+
      (l>=max?'<span class="tag ok">'+L('Готово','Done')+'</span>':'<button class="btn gold" data-b="'+b.id+'" '+(S.gold<cost?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(cost)+'</button>')+'</div>'+
      (noForge&&S.gold<cost&&S.runs?'<p class="sub" style="margin:8px 2px 0">'+L('Не хватает '+fmtNum(cost-S.gold)+' золота — сходи в поход ещё раз.','Need '+fmtNum(cost-S.gold)+' more gold — go on another run.')+'</p>':'')+'</div>';}
  // подарки за рекламу — ниже построек и только после первого похода
  const bst=S.afkBoost&&S.afkBoost.day===dayKey()?S.afkBoost.n:0,amt=afkRate()*ECO.boostH;
  if(vet&&adOk()){h+='<h2>'+L('Подарки','Gifts')+'</h2><div class="card gift"><img src="'+ic('bird',60)+'" width="48" height="48"><div class="t" style="flex:1"><b>'+L('Дар Жар-птицы','Firebird’s Gift')+'</b><span style="display:block;font-size:12.5px;color:var(--mut)">'+(giftOk?L('+'+gAmt+' золота за рекламу','+'+gAmt+' gold for an ad'):L('Прилетит через '+giftLeftH()+' ч','Arrives in '+giftLeftH()+' h'))+'</span></div>'+
      (giftOk?'<button class="btn ad" id="giftBtn">'+L('🎬 За рекламу','🎬 Watch ad')+'</button>':'')+'</div>';
    if(mill&&bst<2)h+='<div class="card gift"><img src="'+ic('chest',60)+'" width="48" height="48"><div class="t" style="flex:1"><b>'+L('Казна сразу','Instant treasury')+'</b><span style="display:block;font-size:12.5px;color:var(--mut)">'+L('осталось '+(2-bst)+' из 2 сегодня',(2-bst)+' of 2 left today')+'</span></div><button class="btn ad" id="afkBoost">'+L('🎬 +'+ECO.boostH+' ч за рекламу','🎬 +'+ECO.boostH+' h for an ad')+'</button></div>';}
  el.innerHTML=h;drawVillage();META_HK('VIL',el); /* мета: карточка подворья в деревне */
  on('vNtfB',()=>{const o=ntfV;ntfV=null;const c=$('vNtf');if(c)c.remove();if(!o)return;STAT.ev('mod',{m:'soc',a:'offer'});Promise.resolve(o.run()).then(y=>{if(y&&o.ok)toast(o.ok);}).catch(()=>{});});
  if($('afkBoost'))STAT.offer('boost');on('afkBoost',()=>takeBoost(renderVillage));
  // пока идёт ролик ×2 — бесплатная кнопка не срабатывает (иначе ролик впустую)
  on('afkTake',()=>{if(!adBusy)takeAfk(1,renderVillage);});onAd('afkX2','afk2',()=>{const g0=afkGold();showRewarded(()=>{afk2Use();takeAfk(2,renderVillage);},null,()=>{afk2Use();const g=afkGold(),took=g<g0*.5,a=took?g0:g*2;if(a<=0)return '';S.gold+=a;if(took)ern('ad',a);else{ern('oth',g);ern('ad',g);}if(!took)S.afkT=nowMs();save();SND.coin();lateRe();return '+'+fmtNum(a)+L(' золота из казны',' gold from the treasury');});}); // adt: казну уже забрали без ×2 — доплата второй половины
  if($('giftBtn'))STAT.offer('gift');on('giftBtn',()=>takeGift(renderVillage));
  for(const b of el.querySelectorAll('[data-b]'))b.onclick=()=>build(b.dataset.b);
  $('village').onclick=e=>{const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    let best=null,bd=.02;for(const id in VPOS){const p=VPOS[id],d=(p[0]-x)**2+((p[1]-y)*.5)**2;if(d<bd){bd=d;best=id;}}
    if(best&&best!=='home'){const b=BLD.find(q=>q.id===best),l=S.village[best]||0;toast(b.name+(l?L(' (ур. ',' (lv ')+l+')':L(' — ещё не построена',' — not built yet'))+': '+b.about);}};}
function takeAfk(m,after){if(PLAT==='yandex'&&!LOCAL&&!sdkDone){toast(L('Сверяем время — попробуй через пару секунд','Checking the time — try again in a few seconds'));return;} // казна по времени сервера (nowMs)
  const g=afkGold();if(g<=0)return;S.gold+=g*m;ern('oth',g);ern('ad',g*(m-1));S.afkT=nowMs();save();SND.coin();toast('+'+fmtNum(g*m)+L(' золота из казны',' gold from the treasury'));setGold();if(after)after();}
function build(id){const b=BLD.find(q=>q.id===id),l=S.village[id]||0,cost=b.cost[l];if(cost==null||S.gold<cost)return;const pw=powerNow();
  S.gold-=cost;STAT.ev('spend',{k:'bld:'+id,c:cost});S.village[id]=l+1;if(id==='mill'&&!l)S.afkT=nowMs();save();SND.chest();achToast();toast(l?L('Улучшено: '+b.name+' (ур. '+(l+1)+')!','Upgraded: '+b.name+' (lv '+(l+1)+')!'):L('Готово: '+b.name+'!','Built: '+b.name+'!'));renderVillage();setGold();
  if(id==='forge'&&!l){openTab('Forge');toast(L('Кузница готова! Выбери первую ковку.','The Forge is ready! Pick your first upgrade.'));}else if(powerNow()>pw)setTimeout(()=>powerToast(pw),1400);}
function drawVillage(){const c=$('village');if(!c)return;const r=c.getBoundingClientRect(),W=r.width||360,H=r.height||230,d=Math.min(devicePixelRatio||1,2.5);
  c.width=W*d;c.height=H*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';
  let sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#6ab8ff');sk.addColorStop(.55,'#bfe4ff');sk.addColorStop(.56,'#8fcf6a');sk.addColorStop(1,'#5aa447');g.fillStyle=sk;g.fillRect(0,0,W,H);
  glow(g,W*.82,H*.14,40,'#fff2a8','#ffffff');
  for(const [x,y,s] of[[.15,.12,1],[.55,.2,.7],[.35,.08,.5]]){g.fillStyle='rgba(255,255,255,.85)';for(const [dx,dy,rr2] of[[0,0,14],[14,-4,11],[-13,2,10],[26,3,9]]){g.beginPath();g.arc(W*x+dx*s*1.5,H*y+dy*s,rr2*s*1.4,0,TAU);g.fill();}}
  g.fillStyle='#7cc0a0';g.beginPath();g.moveTo(0,H*.56);for(let x=0;x<=W;x+=20)g.lineTo(x,H*.5-Math.sin(x/W*7)*8-Math.sin(x/W*17)*4);g.lineTo(W,H*.56);g.fill();
  for(let x=-10;x<W+20;x+=18){const y=H*.53+Math.sin(x*.7)*3;g.fillStyle=x%36?'#2f7a4a':'#378a52';g.beginPath();g.moveTo(x-9,y+6);g.lineTo(x,y-18-Math.sin(x)*4);g.lineTo(x+9,y+6);g.fill();}
  g.strokeStyle='rgba(230,200,140,.8)';g.lineWidth=16;g.beginPath();g.moveTo(W*.5,H*.62);g.quadraticCurveTo(W*.45,H*.85,W*.52,H+10);g.stroke();
  g.strokeStyle='rgba(210,180,120,.6)';g.lineWidth=10;g.beginPath();g.moveTo(W*.1,H*.62);g.quadraticCurveTo(W*.5,H*.7,W*.92,H*.63);g.stroke();
  const list=Object.keys(VPOS).map(id=>[id,VPOS[id]]).sort((a,b)=>a[1][1]-b[1][1]);
  for(const [id,[x,y,s]] of list){const px=W*x,py=H*y,k=s*Math.min(1.25,H/230);g.save();g.translate(px,py);g.scale(k,k);
    if(id==='home'||S.village[id])drawBld(g,id);else drawPlot(g);g.restore();}}
function drawPlot(g){g.fillStyle='rgba(0,0,0,.15)';g.beginPath();g.ellipse(0,0,24,8,0,0,TAU);g.fill();for(const [x,y] of[[-16,-2],[-6,1],[6,1],[16,-2],[-10,-5],[10,-5]])ell(g,x,y,4,3,'#9a9aa2');
  ln(g,[0,0,0,-22],'#8a5a2e',2.4);rrect(g,-10,-30,20,11,2);g.fillStyle='#d8b27a';g.fill();outline(g,'#d8b27a',1);g.fillStyle='#5a3a1a';g.font='900 9px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,-24.5);}
function logs(g,x,y,w,h,col){rrect(g,x,y,w,h,3);g.fillStyle=grad(g,x+w/2,y+h/2,Math.max(w,h)/2,col,.25,-.3);g.fill();outline(g,col,1.2);
  g.strokeStyle='rgba(60,30,10,.35)';g.lineWidth=1;for(let yy=y+4;yy<y+h;yy+=4.5){g.beginPath();g.moveTo(x+1,yy);g.lineTo(x+w-1,yy);g.stroke();}}
function roof(g,x,y,w,h,col){poly(g,[x-4,y,x+w/2,y-h,x+w+4,y],col);ln(g,[x+w/2,y-h,x+w/2,y-h-4],shade(col,-.3),1.6);}
function win(g,x,y){rrect(g,x-4,y-4,8,8,1.5);g.fillStyle='#ffe28a';g.fill();g.strokeStyle='#f4efe2';g.lineWidth=1.6;g.stroke();ln(g,[x,y-4,x,y+4],'#f4efe2',1);ln(g,[x-4,y,x+4,y],'#f4efe2',1);poly(g,[x-6,y-5,x,y-9,x+6,y-5],'#f4efe2',{ol:false,flat:true});}
function drawBld(g,id){g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(2,0,30,8,0,0,TAU);g.fill();
  if(id==='home'){logs(g,-24,-26,48,26,'#a8733d');roof(g,-24,-26,48,22,'#c0392b');win(g,-11,-13);win(g,11,-13);rrect(g,-4,-14,8,14,1.5);g.fillStyle='#6a3a1a';g.fill();rrect(g,10,-52,6,14,1);g.fillStyle='#8a8a92';g.fill();}
  if(id==='forge'){rrect(g,-20,-24,40,24,4);g.fillStyle=grad(g,0,-12,22,'#8a8a92');g.fill();outline(g,'#8a8a92',1.2);roof(g,-20,-24,40,14,'#5a5a66');rrect(g,-7,-16,14,16,6);g.fillStyle='#ff9a3a';g.fill();glow(g,0,-8,16,'#ff8a1a');
    rrect(g,10,-46,7,16,1);g.fillStyle='#6a6a72';g.fill();glow(g,13,-50,8,'#cccccc');}
  if(id==='altar'){for(const a of[0,1,2,3,4,5]){ell(g,Math.cos(a)*18,Math.sin(a)*5-2,4,3,'#9a9aa2');}ln(g,[0,-2,0,-36],'#8a5a2e',6);ell(g,0,-36,5,5,'#a8733d');eye(g,-2,-37,1.4,{px:0});eye(g,2,-37,1.4,{px:0});glow(g,0,-6,12,'#ff8a1a');}
  if(id==='barn'){logs(g,-28,-24,56,24,'#b84a2a');roof(g,-28,-24,56,18,'#7a3a22');rrect(g,-9,-18,18,18,1);g.fillStyle='#6a2a14';g.fill();ln(g,[-9,-18,9,0],'#f4efe2',1.4);ln(g,[9,-18,-9,0],'#f4efe2',1.4);}
  if(id==='tower'){logs(g,-9,-50,18,50,'#a8733d');logs(g,-14,-60,28,12,'#8a5a2e');roof(g,-14,-60,28,16,'#2f6a9a');win(g,0,-30);}
  if(id==='well'){ln(g,[-12,-2,-12,-28],'#7a4a22',2.4);ln(g,[12,-2,12,-28],'#7a4a22',2.4);roof(g,-14,-26,28,10,'#c0392b');ell(g,0,-4,13,6,'#8a8a92');ell(g,0,-5,9,3,'#2f6a9a',{ol:false});ln(g,[0,-26,0,-14],'#5a3a1a',1);rrect(g,-3,-14,6,5,1);g.fillStyle='#8a5a2e';g.fill();}
  if(id==='hut'){logs(g,-17,-20,34,20,'#9a6a3a');roof(g,-17,-20,34,18,'#6a8a3a');win(g,-6,-10);rrect(g,4,-12,7,12,1);g.fillStyle='#5a3a1a';g.fill();for(const x of[-12,-9,-5])ln(g,[x,-20,x+1,-14],'#5aa04a',1.6);glow(g,10,-44,9,'#e8f4ff');}
  if(id==='mill'){logs(g,-12,-26,24,26,'#a8733d');roof(g,-12,-26,24,12,'#7a3a22');g.save();g.translate(0,-30);g.rotate((Date.now()/2000)%TAU);for(let i=0;i<4;i++){g.rotate(TAU/4);rrect(g,-2,0,4,24,1);g.fillStyle='#e8dcc0';g.fill();outline(g,'#e8dcc0',.8);}g.restore();ell(g,0,-30,3,3,'#5a3a1a');}
  if(id==='fair'){for(const [x,c] of[[-16,'#e8433a'],[0,'#2f7ad8'],[16,'#f0a020']]){rrect(g,x-7,-14,14,14,1);g.fillStyle='#c8a070';g.fill();poly(g,[x-9,-14,x,-24,x+9,-14],c);}
    for(const [x,c] of[[-12,'#e0332a'],[-6,'#f2c04a'],[4,'#5aa04a'],[12,'#e0332a']]){g.beginPath();g.arc(x,-3,2.2,0,TAU);g.fillStyle=c;g.fill();}}
  if(id==='tavern'){logs(g,-26,-40,52,40,'#a8733d');ln(g,[-26,-20,26,-20],'rgba(60,30,10,.5)',1.5);roof(g,-26,-40,52,20,'#d88a1a');win(g,-14,-29);win(g,14,-29);win(g,-14,-10);rrect(g,-5,-14,10,14,1.5);g.fillStyle='#6a3a1a';g.fill();
    rrect(g,8,-17,18,8,2);g.fillStyle='#f4efe2';g.fill();outline(g,'#f4efe2',.8);g.fillStyle='#6a2a14';g.font='900 '+(LANG==='en'?4.2:5)+'px system-ui';g.textAlign='center';g.fillText(L('ТРАКТИР','TAVERN'),17,-11.5);}}

/* ---------- кузница ---------- */
/* кузница (boost): «было → стало» для каждой ковки, совет новичку и общее число «Сила богатыря» */
function forgeDelta(id){const h=HERO_BY[S.hero]&&heroOpen(HERO_BY[S.hero])?S.hero:'dob',fo=Object.assign({},S.forge);fo[id]=(fo[id]||0)+1;const a=calcStats(h,null,null,null),b=calcStats(h,null,null,null,fo),pc=v=>(v>=0?'+':'−')+Math.abs(Math.round(v*100))+'%',ar=' → ';
  if(id==='hp')return L('здоровье ','health ')+Math.round(a.maxHp)+ar+Math.round(b.maxHp);
  if(id==='might')return L('урон ','damage ')+pc(a.might-1)+ar+pc(b.might-1);
  if(id==='armor')return L('каждый удар слабее на ','each hit weaker by ')+a.armor+ar+b.armor;
  if(id==='spd')return L('скорость ','speed ')+Math.round(a.spd)+ar+Math.round(b.spd);
  if(id==='magnet')return L('притяжение ','pickup range ')+Math.round(a.magnet)+ar+Math.round(b.magnet);
  if(id==='cd')return L('удары чаще на ','attacks faster by ')+Math.round((1-a.cd)*100)+'%'+ar+Math.round((1-b.cd)*100)+'%';
  if(id==='xp')return L('опыт ','XP ')+pc(a.xp-1)+ar+pc(b.xp-1);
  if(id==='luck')return L('удача ','luck ')+pc(a.luck-1)+ar+pc(b.luck-1);
  return L('золото ','gold ')+pc(a.gold-1)+ar+pc(b.gold-1);}
// что советуем новичку: пока в кузнице меньше 6 ковок — самое дешёвое из «Здоровье / Сила / Броня»
// подсказка кузнеца перед главой 4 (ch4-soft 05.10): глава 3 пройдена, 4 — нет: в главе 4 первый настоящий стрелок (Колдун) — советуем Броню и Здоровье
function ch4Tip(){return !!(S.done[2]&&!S.done[3]);}
function ch4TipText(){return L('🔨 Кузнец: «Колдун бьёт издалека — берите Броню и Здоровье».','🔨 Blacksmith: “The '+EN.koldun.n+' strikes from afar — take '+FORGE[2].name+' and '+FORGE[0].name+'.”');}
function forgeTip(){if(ch4Tip()){const ids=['armor','hp'].filter(id=>(S.forge[id]||0)<FORGE.find(f=>f.id===id).max);if(ids.length)return ids.sort((a,b)=>forgeCost(S.forge[a]||0,a)-forgeCost(S.forge[b]||0,b))[0];}
  let n=0;for(const k in S.forge)n+=S.forge[k];if(n>=6)return '';let best='',bc=1e9;for(const id of['hp','might','armor']){const c=forgeCost(S.forge[id]||0,id);if(c<bc){bc=c;best=id;}}return best;}
function powerHTML(){const h=HERO_BY[S.hero]&&heroOpen(HERO_BY[S.hero])?S.hero:'dob';return '<div class="power"><img src="'+ic('hp_'+skinKey(h),96)+'" alt=""><span>'+L('Сила богатыря','Hero power')+'</span><b id="pwrN">⚔ '+fmtNum(powerScore(h))+'</b></div>';}
function powerToast(was){const h=HERO_BY[S.hero]&&heroOpen(HERO_BY[S.hero])?S.hero:'dob',now=powerScore(h);if(now>was)toast(L('⚔ Сила богатыря: ','⚔ Hero power: ')+fmtNum(was)+' → '+fmtNum(now)+' (+'+fmtNum(now-was)+')');}
// снаряжение на рисунке богатыря обновилось (ступени GEAR в art.js) — сказать, что именно появилось
function gearToast(g0){const a=[];if(GEAR.h>g0.h)a.push(GEAR.h>1?L('большой червлёный щит','a great scarlet shield'):L('щит за спиной','a shield on the back'));if(GEAR.a>g0.a)a.push(GEAR.a>1?L('золочёные наплечники и пластины','gilded pauldrons and plates'):L('стальные наплечники','steel pauldrons'));if(GEAR.m>g0.m)a.push(L('золотые наручи','golden bracers'));
  if(a.length){SND.chest();toast(L('🛡 Новое снаряжение на богатыре: ','🛡 New gear on your hero: ')+a.join(', ')+'!');}}
function powerNow(){return powerScore(HERO_BY[S.hero]&&heroOpen(HERO_BY[S.hero])?S.hero:'dob');}
function renderForge(){const el=$('tabForge');
  if(!S.village.forge){el.innerHTML='<h2>'+L('Кузница','Forge')+'</h2><div class="card"><div class="row"><img class="ic" src="'+ic('i_sword')+'"><div class="t"><b>'+L('Кузницы ещё нет','No Forge yet')+'</b><span>'+L('Построй её в деревне — всего '+BLD[0].cost[0]+' золота. Тут прокачка сохраняется навсегда.','Build it in the village — just '+BLD[0].cost[0]+' gold. Upgrades here last forever.')+'</span></div></div></div><button class="btn big" id="toVil">'+L('В деревню','To the village')+'</button>';
    on('toVil',()=>openTab('Village'));return;}
  let h='<h2>'+L('Кузница','Forge')+'</h2>'+powerHTML()+'<div class="seg"><button id="fsH" class="'+(forgeSeg==='hero'?'on':'')+'">'+L('Богатырь','Hero')+'</button><button id="fsW" class="'+(forgeSeg==='arm'?'on':'')+'">'+L('Оружейная','Armory')+'</button></div>';
  if(forgeSeg==='arm'){h+=needCard(Object.keys(WEAPONS).filter(id=>(S.armory[id]||0)<ARMORY_MAX).map(id=>({n:WEAPONS[id].name+L(', ур. ',', lv ')+((S.armory[id]||0)+1),c:armoryCost(S.armory[id]||0)})),renderForge)+'<p class="sub">'+L('Вечная прокачка оружия: +4,5% урона за уровень, на 4-м, 7-м и 10-м ещё +5% размаха. Внизу — какой оберег нужен для эволюции.','Permanent weapon upgrades: +4.5% damage per level, plus +5% reach at levels 4, 7 and 10. Below — the charm each weapon needs to evolve.')+'</p>';
    const pc=v=>{v=armPct(v);return dec(v,v%1?1:0);};
    for(const id in WEAPONS){const W=WEAPONS[id],l=S.armory[id]||0,cost=armoryCost(l),fx=armFx(id),nx=l<ARMORY_MAX?armFx(id,l+1):fx;
      h+='<div class="card"><div class="row"><img class="ic" src="'+ic(W.icon)+'"><div class="t"><b>'+W.name+'</b><span>'+L('ур. ','lv ')+l+' · +'+pc(fx.d)+L('% урона','% damage')+(fx.a?L(', размах +',', reach +')+pc(fx.a)+'%':'')+
        (nx.d>fx.d?' → <b style="display:inline;color:#8af0a0;font-size:13px">+'+pc(nx.d)+'%'+(nx.a>fx.a?L(', размах +',', reach +')+pc(nx.a)+'%':'')+'</b>':'')+'</span><div class="pips long">'+Array.from({length:ARMORY_MAX},(_,i)=>'<i class="'+(i<l?'on':'')+'"></i>').join('')+'</div></div>'+
        (l>=ARMORY_MAX?'<span class="tag ok">'+L('Макс.','Max')+'</span>':'<button class="btn gold" data-a="'+id+'" '+(S.gold<cost?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(cost)+'</button>')+'</div>'+
        '<div style="margin-top:8px;font-size:12px;color:var(--mut);line-height:1.5">'+L('Эволюция в походе: 5-й ур. + ','Evolution in a run: lv 5 + ')+'<img src="'+ic(PASSIVES[W.evo.need].icon,48)+'" width="18" height="18" style="vertical-align:-4px"> '+PASSIVES[W.evo.need].name+' → <b style="color:#ffd98a">'+W.evo.name+'</b></div></div>';}
    el.innerHTML=h;on('needAd',()=>needCard.fn());on('fsH',()=>{forgeSeg='hero';renderForge();});
    for(const b of el.querySelectorAll('[data-a]'))b.onclick=()=>{const id=b.dataset.a,l=S.armory[id]||0,cost=armoryCost(l);if(S.gold<cost||l>=ARMORY_MAX)return;const pw=powerNow();S.gold-=cost;STAT.ev('spend',{k:'arm:'+id,c:cost});S.armory[id]=l+1;save();SND.level();renderForge();setGold();powerToast(pw);};
    return;}
  h+=needCard(FORGE.filter(f=>(S.forge[f.id]||0)<f.max).map(f=>({n:f.name+L(', ур. ',', lv ')+((S.forge[f.id]||0)+1),c:forgeCost(S.forge[f.id]||0,f.id)})),renderForge)+'<p class="sub">'+L('Прокачка навсегда — для всех богатырей и всех походов.','Permanent upgrades — for every hero and every run.')+'</p>'+(ch4Tip()?'<div class="card next ch4tip" id="ch4TipF"><b style="font-size:14.5px;line-height:1.4">'+ch4TipText()+'</b></div>':'');
  const tipId=forgeTip();
  for(const f of FORGE){const l=S.forge[f.id]||0,cost=forgeCost(l,f.id);
    h+='<div class="card'+(f.id===tipId?' next':'')+'"><div class="row"><img class="ic" src="'+ic(f.icon)+'"><div class="t"><b>'+f.name+(f.id===tipId?' <em class="rec">'+L('👍 советуем','👍 good pick')+'</em>':'')+'</b>'+(l<f.max?'<span class="delta">'+forgeDelta(f.id)+'</span>':'')+'<span>'+f.per+L(' за уровень',' per level')+(f.max>10?(l>=10?L(' · мастерская ковка',' · master forging'):L(' · до '+f.max+' ур.',' · up to lv '+f.max)):'')+'</span><div class="pips'+(f.max>10?' long':'')+'">'+Array.from({length:f.max},(_,i)=>'<i class="'+(i<l?'on':'')+(i>=10?' m':'')+'"></i>').join('')+'</div></div>'+
      (l>=f.max?'<span class="tag ok">'+L('Макс.','Max')+'</span>':'<button class="btn gold" data-f="'+f.id+'" '+(S.gold<cost?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(cost)+'</button>')+'</div></div>';}
  el.innerHTML=h;on('needAd',()=>needCard.fn());on('fsW',()=>{forgeSeg='arm';renderForge();});for(const b of el.querySelectorAll('[data-f]'))b.onclick=()=>{const f=FORGE.find(q=>q.id===b.dataset.f),l=S.forge[f.id]||0,cost=forgeCost(l,f.id);if(S.gold<cost||l>=f.max)return;
    const pw=powerNow(),g0=Object.assign({},GEAR);S.gold-=cost;STAT.ev('spend',{k:'forge:'+f.id,c:cost});S.forge[f.id]=l+1;save();SND.level();achToast();const gch=gearRefresh();renderForge();setGold();if(gch)gearToast(g0);else powerToast(pw);};}

/* ---------- богатыри ---------- */
function skinRow(hr){const list=SKINS.filter(k=>k.hero===hr.id&&(!k.pay||skinHas(hr.id+'@'+k.id)||typeof payHere==='function'&&payHere()&&!!PAY.item(k.pay)));if(!list.length)return '';const cur=(S.skin||{})[hr.id]||'';
  let h='<div style="width:100%;display:flex;gap:6px;margin-top:10px;overflow-x:auto">';
  const chip=(key,name,own,sel,sid,price)=>'<button class="skin'+(sel?' on':'')+'" data-skin="'+hr.id+'|'+sid+'" '+(own?'':'data-lock="1"')+' style="flex:none;width:74px;padding:4px;border-radius:12px;background:'+(sel?'rgba(255,201,74,.22)':'rgba(255,255,255,.06)')+';border:1px solid '+(sel?'var(--gold)':'var(--line)')+';font-size:10px;font-weight:700;color:'+(own?'#fff':'var(--mut)')+'">'+
    '<img src="'+ic('hp_'+key,96)+'" style="width:44px;height:44px;'+(own?'':price?'opacity:.7':'filter:grayscale(1) brightness(.5)')+'"><div style="line-height:1.15">'+(own||price?'':'🔒 ')+name+'</div>'+(!own&&price==='pay'?'<div style="color:var(--gold);margin-top:2px">'+L('🎁 покупка','🎁 purchase')+'</div>':!own&&price?'<div style="color:var(--gold);margin-top:2px">💰 '+fmtNum(price)+'</div>':'')+'</button>';
  h+=chip(hr.id,L('Обычный','Classic'),true,!cur,'');for(const k of list){const key=hr.id+'@'+k.id;h+=chip(key,k.name,skinHas(key),cur===k.id,k.id,k.pay?'pay':k.price);}
  return h+'</div>';}
function skinSource(key){const sk=SKINS.find(k=>k.hero+'@'+k.id===key);if(sk&&sk.src)return typeof sk.src==='function'?sk.src():sk.src; /* облик меты (слава, сказ…) — своя подпись «как получить» */if(sk&&sk.pay)return L('покупка «'+PAY_ITEMS[sk.pay].name+'»','purchase “'+PAY_ITEMS[sk.pay].name+'”');if(sk&&sk.price)return L('купить за '+fmtNum(sk.price)+' золота','buy for '+fmtNum(sk.price)+' gold');const a=ACH.find(x=>x.r===key);if(a)return L('достижение «'+a.name+'»: '+a.about.toLowerCase(),'achievement “'+a.name+'”: '+a.about);if(LOGIN_SKINS.includes(key))return L('награда за 7 дней входа подряд','reward for logging in 7 days in a row');return '';}
function renderHeroes(){const el=$('tabHeroes');let h='<h2>'+L('Богатыри','Heroes')+'</h2><p class="sub">'+L('Новые богатыри приходят, когда освобождаешь земли. Звание усиливает особенность и дар богатыря.','New heroes join as you free the lands. Rank boosts a hero’s perk and Power.')+'</p>';
  if(!S.rank)S.rank={};
  for(const hr of HEROES){const open=heroOpen(hr),sel=S.hero===hr.id,W=WEAPONS[hr.weapon],r=S.rank[hr.id]||0,rc=rankCost(r);
    h+='<div class="card hero-card'+(sel?' sel':'')+(open?'':' lock')+'" data-h="'+hr.id+'" style="flex-wrap:wrap"><img src="'+ic('hp_'+skinKey(hr.id),160)+'"'+(open&&typeof PAY!=='undefined'&&PAY.own('mead')?' class="mecenat" title="'+L('Меценат','Patron')+'"':'')+'><div class="t" style="flex:1;min-width:0"><b style="font-size:16px">'+hr.name+'</b>'+
      '<span style="display:block;color:var(--mut);font-size:12.5px">'+hr.title+(open?' · <span style="color:#ffd98a">'+RANKS[r]+' · ⚔ '+fmtNum(powerScore(hr.id))+'</span>':'')+'</span>'+
      '<span style="display:flex;align-items:center;gap:6px;font-size:12.5px;margin-top:6px"><img src="'+ic(W.icon,48)+'" style="width:22px;height:22px;background:none">'+W.name+'</span>'+
      '<span style="display:block;font-size:12px;color:#ffd98a;margin-top:3px">'+hr.perk+(r?' (+'+r*25+'%)':'')+'</span>'+
      '<span style="display:block;font-size:12px;color:#bfe0ff;margin-top:3px">✨ '+hr.dar.name+': '+hr.dar.about+'</span>'+
      (sel?'<span class="tag ok">'+L('Выбран','Selected')+'</span>':open?'<span class="tag">'+L('Нажми, чтобы выбрать','Tap to select')+'</span>':hr.price?'':'<span class="tag">'+L('🔒 Освободи: ','🔒 Liberate: ')+CH[hr.unlock].name+'</span>')+'</div>'+
      (open?'<div style="width:100%;display:flex;align-items:center;gap:10px;margin-top:10px"><div style="flex:1"><div style="font-size:12px;color:var(--mut)">'+(r<RANK_MAX?L('Звание «'+RANKS[r]+'» → «'+RANKS[r+1]+'»: особенность +25%, дар сильнее на 30% и чаще на 7%','Rank “'+RANKS[r]+'” → “'+RANKS[r+1]+'”: perk +25%, Power +30% stronger and 7% more often'):L('Звание: высшее','Rank: highest'))+'</div><div class="pips">'+
        Array.from({length:RANK_MAX},(_,i)=>'<i class="'+(i<r?'on':'')+'"></i>').join('')+'</div></div>'+
        (r>=RANK_MAX?'<span class="tag ok">'+RANKS[RANK_MAX]+'</span>':'<button class="btn gold" data-r="'+hr.id+'" '+(S.gold<rc?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(rc)+'</button>')+'</div>'
      :'')+(open?skinRow(hr):'')+(open?''
      :hr.price?'<div style="width:100%;margin-top:10px"><button class="btn gold big" data-buy="'+hr.id+'" '+(S.gold<hr.price?'disabled':'')+'><img src="'+ic('coin',36)+'">'+L('Позвать за ','Recruit for ')+fmtNum(hr.price)+'</button></div>':'')+'</div>';}
  el.innerHTML=h;
  for(const c of el.querySelectorAll('[data-h]'))c.onclick=e=>{if(e.target.closest('button'))return;const hr=HERO_BY[c.dataset.h];
    if(!heroOpen(hr)){toast(hr.price?L('Позови его за золото','Recruit him with gold'):L('Пройди главу «'+CH[hr.unlock].name+'»','Clear the chapter “'+CH[hr.unlock].name+'”'));return;}S.hero=hr.id;save();SND.click();renderHeroes();};
  for(const b of el.querySelectorAll('[data-skin]'))b.onclick=()=>{const [hid,sid]=b.dataset.skin.split('|'),sk=SKINS.find(k=>k.hero===hid&&k.id===sid);
    if(b.dataset.lock&&sk&&sk.pay){buyFest(sk);return;}
    if(b.dataset.lock&&sk&&sk.price){buySkin(sk);return;}
    if(b.dataset.lock){toast(L('🔒 Как получить: ','🔒 How to get: ')+skinSource(hid+'@'+sid));return;}
    S.skin[hid]=sid;save();SND.click();renderHeroes();};
  for(const b of el.querySelectorAll('[data-r]'))b.onclick=()=>{const id=b.dataset.r,r=S.rank[id]||0,c=rankCost(r);if(S.gold<c||r>=RANK_MAX)return;const pw=powerScore(id);S.gold-=c;STAT.ev('spend',{k:'rank:'+id,c:c});S.rank[id]=r+1;save();SND.chest();achToast();toast(HERO_BY[id].name+' — '+RANKS[r+1]+'! ⚔ '+fmtNum(pw)+' → '+fmtNum(powerScore(id)));renderHeroes();setGold();};
  for(const b of el.querySelectorAll('[data-buy]'))b.onclick=()=>{const hr=HERO_BY[b.dataset.buy];if(S.gold<hr.price)return;S.gold-=hr.price;STAT.ev('spend',{k:'hero:'+hr.id,c:hr.price});S.bought=S.bought||{};S.bought[hr.id]=1;S.hero=hr.id;save();SND.chest();achToast();toast(hr.name+L(' с тобой!',' joins you!'));renderHeroes();setGold();};}

// праздничный облик — из покупки Яндекса «Праздничные облики» (js/pay.js): окно с превью и кнопкой покупки с ценой из каталога
function buyFest(sk){const key=sk.hero+'@'+sk.id;if(!(typeof payHere==='function'&&payHere()&&PAY.item(sk.pay)))return;
  showModal('<h3>'+L('Облик «'+sk.name+'»','Outfit “'+sk.name+'”')+'</h3><img src="'+ic('hp_'+key,160)+'" width="110" height="110" style="display:block;margin:6px auto"><p class="sub">'+L('Только для красоты — силы не прибавляет. Масленичный, Новогодний и Купальский облики откроются сразу у всех 9 богатырей.','Just for looks — no extra power. Maslenitsa, New Year and Kupala outfits unlock for all 9 heroes at once.')+'</p>'+
    payHTML([sk.pay])+'<div class="btns"><button class="btn ghost" id="skNo">'+L('Не сейчас','Not now')+'</button></div>');
  PAY.bind($('mBody'));on('skNo',hideModal);STAT.screen('shop');
  PAY.re=()=>{if(!skinHas(key))return;hideModal();S.skin[sk.hero]=sk.id;save();renderHeroes();};}
// облик за золото: только для красоты — спрашиваем, прежде чем списать
function buySkin(sk){const key=sk.hero+'@'+sk.id;if(S.skins[key])return;
  if(S.gold<sk.price){toast(L('Облик «'+sk.name+'»: нужно '+fmtNum(sk.price)+' золота, у тебя '+fmtNum(S.gold),'Outfit “'+sk.name+'”: costs '+fmtNum(sk.price)+' gold, you have '+fmtNum(S.gold)));return;}
  showModal('<h3>'+L('Облик «'+sk.name+'»','Outfit “'+sk.name+'”')+'</h3><img src="'+ic('hp_'+key,160)+'" width="110" height="110" style="display:block;margin:6px auto"><p class="sub">'+L('Только для красоты — силы не прибавляет. '+HERO_BY[sk.hero].name+' будет ходить в нём во всех походах.','Just for looks — no extra power. '+HERO_BY[sk.hero].name+' will wear it on every run.')+'</p>'+
    '<div class="btns"><button class="btn gold big" id="skBuy"><img src="'+ic('coin',36)+'">'+L('Купить за ','Buy for ')+fmtNum(sk.price)+'</button><button class="btn ghost" id="skNo">'+L('Не сейчас','Not now')+'</button></div>');
  on('skNo',hideModal);on('skBuy',()=>{if(S.gold<sk.price||S.skins[key]){hideModal();return;}S.gold-=sk.price;STAT.ev('spend',{k:'skin:'+key,c:sk.price});S.skins[key]=1;S.skin[sk.hero]=sk.id;save();SND.chest();hideModal();achToast();toast(L('Новый облик: ','New outfit: ')+qt(sk.name)+'!');setGold();renderHeroes();});}

/* ---------- достижения ---------- */
function skinName(r){const sk=SKINS.find(k=>k.hero+'@'+k.id===r);return sk?sk.name:r;}
function rewardText(r){if(typeof r==='number')return '+'+fmtNum(r)+goldW();const sk=SKINS.find(k=>k.hero+'@'+k.id===r);return L('облик ','outfit ')+qt(sk?sk.name:r);}
function grant(r){if(typeof r==='number'){S.gold+=r;ern('quest',r);}else S.skins[r]=1;}
function achCheck(){const out=[];for(const a of ACH){if(S.ach[a.id]||a.on&&!a.on())continue;if(a.v()>=a.n){S.ach[a.id]=1;grant(a.r);out.push(a);}}if(out.length)save();return out;}
function achToast(){const n=achCheck();if(n.length){SND.chest();toast('🏆 '+n.map(a=>a.name+': '+rewardText(a.r)).join(' · '));setGold();}}

/* ---------- награда за вход ---------- */
// мягкая серия: пропущен ровно один день — серию можно вернуть за рекламу (lost — сколько дней было)
function loginState(){const LG=S.login||{last:'',n:0},today=dayKey();if(LG.last===today)return {ready:false,n:LG.n};if(LG.last===dayPrev(today))return {ready:true,n:LG.n%7+1};
  return {ready:true,n:1,lost:LG.n&&LG.last===dayPrev(dayPrev(today))?LG.n:0};}
function loginReward(n){if(n<7)return Math.round(LOGIN_GOLD[n-1]*(1+ECO.login*landsU()));const sk=LOGIN_SKINS.find(k=>!S.skins[k]);return sk||1000;}
function openLogin(){if(document.body.classList.contains('run'))return;const ls=loginState();if(!ls.ready)return;STAT.screen('login');const n=ls.n;
  let cells='';for(let d=1;d<=7;d++){const r=loginReward(d),isSkin=typeof r==='string';cells+='<div style="flex:1;min-width:0;text-align:center;padding:8px 2px;border-radius:12px;background:'+(d===n?'rgba(255,201,74,.25)':d<n?'rgba(74,222,106,.15)':'rgba(255,255,255,.06)')+';border:1px solid '+(d===n?'var(--gold)':'transparent')+'">'+
    '<div style="font-size:10px;color:var(--mut)">'+L('День ','Day ')+d+'</div>'+(isSkin?'<img src="'+ic('hp_'+r,72)+'" style="width:34px;height:34px">':'<img src="'+ic('coin',48)+'" style="width:22px;height:22px;margin:6px 0">')+
    '<div style="font-size:10px;font-weight:800">'+(isSkin?L('облик','outfit'):fmtNum(r))+'</div>'+(d<n?'<div style="font-size:10px;color:#8af0a0">✓</div>':'')+'</div>';}
  const r=loginReward(n);
  showModal('<h3>'+L('Награда за вход','Login reward')+'</h3><p class="sub">'+L('Заходи 7 дней подряд — на 7-й день облик богатыря. Пропустил один день — серию можно вернуть за рекламу.','Log in 7 days in a row — day 7 gives a hero outfit. Missed one day? Restore the streak for an ad.')+'</p><div style="display:flex;gap:4px;margin:10px 0">'+cells+'</div>'+
    (ls.lost&&adOk()?'<div class="card gift" style="margin:0 0 8px"><div class="t" style="flex:1"><b>'+L('Серия прервалась','Streak broken')+'</b><span style="display:block;font-size:13px;color:var(--mut)">'+L('Было '+ls.lost+' дн. подряд — вернуть и продолжить?','You had '+ls.lost+' '+plu(ls.lost,'','','','day','days')+' in a row — restore and continue?')+'</span></div><button class="btn ad" id="lgRest">'+L('🎬 Вернуть за рекламу','🎬 Restore for an ad')+'</button></div>':'')+
    '<div class="btns"><button class="btn gold big" id="lgTake">'+L('Забрать: ','Collect: ')+rewardText(r)+'</button>'+(typeof r==='number'&&adOk()?'<button class="btn ad" id="lgX2">'+L('🎬 ×2 за рекламу','🎬 ×2 for an ad')+'</button>':'')+'<button class="btn ghost" id="lgBack">'+L('Назад','Back')+'</button></div>');
  const take=m=>{if(m===2)lgX2Day=dayKey();S.login={last:dayKey(),n};if(typeof r==='number'){S.gold+=r*m;ern('gift',r);ern('ad',r*(m-1));}else S.skins[r]=1;save();SND.chest();hideModal();toast(L('Награда за вход: ','Login reward: ')+(typeof r==='number'?'+'+fmtNum(r*m)+goldW():rewardText(r)));setGold();achToast();if(curTab==='Heroes')renderHeroes();};
  on('lgTake',()=>{if(!adBusy)take(1);});onAd('lgX2','login2',()=>showRewarded(()=>take(2),null,()=>{if(lgX2Day===dayKey())return '';if(loginState().ready&&modalHas($('lgX2'))){take(2);return L('награда за вход ×2','login reward ×2');} // своё окно ещё открыто — как обычно
    const rd=loginState().ready,a=rd?r*2:r;lgX2Day=dayKey();if(rd)S.login={last:dayKey(),n};S.gold+=a;ern('ad',r);if(rd)ern('gift',r);save();SND.chest();lateRe();return L('награда за вход: +','login reward: +')+fmtNum(a)+goldW();}));on('lgBack',openToday);
  onAd('lgRest','loginrest',()=>showRewarded(()=>{S.login={last:dayPrev(dayKey()),n:ls.lost};save();SND.chest();openLogin();},null,()=>{const s2=loginState();if(!s2.ready||!s2.lost||s2.lost!==ls.lost)return adLateGold(); // серию уже не вернуть (награду дня взяли) — золото
    S.login={last:dayPrev(dayKey()),n:ls.lost};save();SND.chest();if(modalHas($('lgRest')))openLogin();else lateRe();return L('серия входа возвращена: '+ls.lost+' дн.','login streak restored: '+ls.lost+' '+plu(ls.lost,'','','','day','days'));}));}

/* ---------- дела на сегодня: всё ежедневное в одном окне (раз за запуск сам, дальше — кнопкой на карте) ---------- */
function todayList(){const TL=[],ls=loginState(),dq=dailyEnsure(),qd=dq.list.filter(x=>x.c).length,qr=dq.list.filter(x=>!x.c&&qDone(x)).length;
  TL.push({k:'login',ic:'coin',t:L('Награда за вход','Login reward'),s:ls.ready?L('День ','Day ')+ls.n+': '+rewardText(loginReward(ls.n)):L('Получена · завтра — день ','Collected · tomorrow — day ')+(ls.n%7+1),ready:ls.ready,b:L('Забрать','Collect')});
  TL.push({k:'quests',ic:'i_sword',t:L('Задания дня','Daily quests'),s:L(qd+' из 3 получено',qd+' of 3 collected')+(qr?L(' · можно забрать: ',' · ready to collect: ')+qr:''),ready:qr>0||(!dq.bonus&&dq.list.every(x=>x.c)),b:L('Открыть','Open'),always:!dq.bonus});
  if(S.village.mill){const g=afkGold();TL.push({k:'afk',ic:'chest',t:L('Казна','Treasury'),s:g>0?L('Накопилось золота: ','Gold stored: ')+fmtNum(g):L('Копится, пока тебя нет','Fills up while you’re away'),ready:g>=30,b:L('Забрать','Collect')});}
  if(S.runs&&adOk())TL.push({k:'gift',ic:'bird',t:L('Дар Жар-птицы','Firebird’s Gift'),s:giftReady()?L('+'+fmtNum(giftAmt())+' золота за рекламу','+'+fmtNum(giftAmt())+' gold for an ad'):L('Прилетит через '+giftLeftH()+' ч','Arrives in '+giftLeftH()+' h'),ready:giftReady(),b:L('🎬 За рекламу','🎬 Watch ad'),ad:1});
  if(drOpen()){const m=drMine(),d=dailyDef();TL.push({k:'dr',ic:'hp_'+d.hero,t:L('Поход дня','Daily Run'),s:CH[d.chi].name+' · '+HERO_BY[d.hero].name+' · '+qt(d.rule.name)+(m.best?L(' · очки: ',' · score: ')+fmtNum(m.best):'')+(m.got?'':' · +'+fmtNum(drReward())+goldW()),ready:!m.got,b:m.got?L('Ещё раз','Again'):L('В поход','Go'),always:1});}
  if(S.done[0]){const m=wkMine();TL.push({k:'wk',ic:'e_perun',t:L('Испытание недели','Weekly Trial'),s:m.got?L('Награда недели получена','Weekly reward collected'):qt(weekly().name)+': +'+fmtNum(weeklyReward())+goldW(),ready:!m.got,b:L('Испытать','Try it')});}
  const TO=S.runs<3?TL.filter(x=>x.k==='login'||x.k==='quests'):TL; // новичку (первые 3 похода) — только вход и задания, остальное не отвлекает
  META_HK('TODAY',TO);return TO;} /* мета дописывает свои дела (и новичку — сама решает): {k:'yard',ic,t,s,ready,b,fn()} */ // новичку (первые 3 похода) — только вход и задания, остальное не отвлекает
let todayShown=false;
function openToday(auto){if(document.body.classList.contains('run'))return;const TL=todayList();if(auto){if(todayShown||!TL.some(x=>x.ready)||$('modal').classList.contains('on'))return;}todayShown=true;STAT.screen('today');
  const ls0=loginState(),dN=ls0.n;
  showModal('<h3>'+L('Дела на сегодня','Today’s to-do')+'</h3><p class="sub">'+(S.runs>1&&dN>1&&!ls0.lost?L('С возвращением! Ты заходишь '+dN+'-й день подряд. ','Welcome back! Day '+dN+' in a row. '):'')+L('Всё ежедневное — здесь. Не успел — не беда, завтра будет снова.','All your dailies in one place. Missed something? No worries — it’s back tomorrow.')+'</p>'+
    TL.map((x,i)=>'<div class="card today-row'+(x.ready?' ready':'')+'"><div class="row"><img class="ic" src="'+ic(x.ic,96)+'"><div class="t"><b>'+x.t+'</b><span>'+x.s+'</span></div>'+
      (x.ready||x.always?'<button class="btn '+(!x.ready?'ghost':x.ad?'ad':'gold')+'" data-td="'+i+'">'+x.b+'</button>':'<span class="tag ok">✓</span>')+'</div></div>').join('')+
    '<div class="btns"><button class="btn big" id="tdOk">'+L('В бой!','To battle!')+'</button></div>');
  on('tdOk',()=>{hideModal();openTab('Map');});
  for(const b of document.querySelectorAll('[data-td]'))b.onclick=()=>{SND.click();const x=TL[+b.dataset.td];
    if(x.k==='login')openLogin();
    else if(x.k==='quests'){hideModal();qSeg='q';openTab('Quests');}
    else if(x.k==='afk'){takeAfk(1,()=>{openToday();if(curTab==='Village')renderVillage();});}
    else if(x.k==='gift')takeGift(()=>{openToday();if(curTab==='Village')renderVillage();},'today');
    else if(x.k==='wk'){hideModal();startRun(0,true,true);}
    else if(x.k==='dr')openDaily();
    else if(typeof(x.fn||x.go)==='function')(x.fn||x.go)();};} /* дела меты */
// поход дня: правила перед стартом (одно окно, из «Дел на сегодня» и из задания)
function openDaily(){STAT.screen('daily');const d=dailyDef(),m=drMine(),h=HERO_BY[d.hero];
  showModal('<h3>'+L('Поход дня','Daily Run')+'</h3><p class="sub">'+L('Сегодня у всех одинаково: глава, богатырь, правило и карточки умений.','Same for everyone today: chapter, hero, rule and skill cards.')+'</p>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic('hp_'+skinKey(h.id),120)+'"><div class="t"><b>'+h.name+'</b><span>'+CH[d.chi].name+L(' · босс: ',' · boss: ')+EN[CH[d.chi].boss].n+'</span></div></div></div>'+
    '<div class="card" style="font-size:13.5px;line-height:1.45"><b style="font-size:15px">'+qt(d.rule.name)+'</b><br>'+d.rule.about+'<br>'+(OK?L('🏆 Очки: одолено нечисти + 500 за босса.','🏆 Score: monsters defeated + 500 for the boss.'):L('🏆 Очки: одолено нечисти + 500 за босса. В таблицу идёт лучший поход дня.','🏆 Score: monsters defeated + 500 for the boss. Your best run of the day goes on the leaderboard.'))+'<br>🎁 '+(m.got?L('Награда за сегодня получена','Today’s reward collected'):L('За участие: +'+fmtNum(drReward())+' золота (продержись хотя бы минуту)','For taking part: +'+fmtNum(drReward())+' gold (survive at least a minute)'))+(m.best?L('<br>Твой лучший сегодня: <b>','<br>Your best today: <b>')+fmtNum(m.best)+'</b>':'')+'</div>'+
    '<div class="btns"><button class="btn big" id="drGo">'+L('⚔️ В поход дня','⚔️ Start Daily Run')+'</button><button class="btn ghost" id="drBack">'+L('Назад','Back')+'</button></div>');
  on('drGo',()=>startRun(0,false,false,dailyDef()));on('drBack',openToday);}
// карточка на карте (boost): кроме «ждут тебя: N» — серия входа, сундук дня и казна одной строкой значков, чтобы поводы вернуться были на виду
function todayChips(){const ls=loginState(),dq=dailyEnsure(),got=dq.list.filter(x=>x.c).length,done=dq.list.filter(x=>x.c||qDone(x)).length,si=streakInfo(),a=[];
  const day=ls.ready?ls.n:ls.n; a.push('<i class="'+(ls.ready?'hot':'')+'">📅 '+L('день ','day ')+day+L(' из 7',' of 7')+'</i>');
  a.push('<i class="'+(done>got||(!dq.bonus&&got===3)?'hot':'')+'">🎁 '+(dq.bonus?L('сундук дня взят','daily chest taken'):L('сундук дня ','daily chest ')+done+'/3')+'</i>');
  if(si.n>1)a.push('<i>🔥 '+L('серия ','streak ')+si.n+L(' дн.',' d')+'</i>');
  if(S.village.mill){const g=afkGold();a.push('<i class="'+(g>=30?'hot':'')+'">💰 '+L('казна ','treasury ')+fmtNum(g)+'</i>');}
  META_HK('CHIPS',a); /* мета: свои значки-строки '<i class="hot">…</i>' */
  return '<div class="chips">'+a.join('')+'</div>';}
function todayCard(){const TL=todayList(),n=TL.filter(x=>x.ready).length;
  return '<div class="card today'+(n?' ready':'')+'" id="todayBtn"><div class="row"><img class="ic" src="'+ic('chest',96)+'" style="width:40px;height:40px"><div class="t"><b>'+L('📋 Дела на сегодня','📋 Today’s to-do')+'</b><span>'+(n?L('Ждут тебя: ','Waiting for you: ')+n:L('Всё сделано — молодец!','All done — well done!'))+'</span></div><span class="tag">'+L('Открыть','Open')+'</span></div>'+todayChips()+'</div>';}
// красная точка на «Деревне»: казна накопила — зайди и забери (доход без игры должен быть заметен)
function villageBadge(){const b=document.querySelector('nav button[data-tab="Village"]');if(b)b.classList.toggle('dot',!!S.village.mill&&afkGold()>=30);}

/* ---------- задания дня ---------- */
function dailyEnsure(){const k=dayKey();if(S.dq&&S.dq.day===k)return S.dq;
  const tier=questTier(),R=mulberry(+k.split('-').join(''));const pool=QUESTS.filter(q=>!q.need||(q.need==='endless'&&S.done[0])||(q.need==='evo'&&tier>=1));
  const list=drOpen()?[{id:'drun',n:1,p:0,c:0}]:[]; // поход дня — вместо одного из трёх заданий (а не четвёртым делом)
  while(list.length<3&&pool.length){const q=pool.splice(Math.floor(R()*pool.length),1)[0];list.push({id:q.id,n:q.n[tier],p:0,c:0});}
  S.dq={day:k,list,bonus:0};save();return S.dq;}
function qDef(id){return QUESTS.find(q=>q.id===id);}
function qVal(x){const q=qDef(x.id);return q.min?Math.floor(x.p/60):Math.floor(x.p);}
function qDone(x){return qVal(x)>=x.n;}
function qText(x){return qDef(x.id).t.replace('{n}',x.n);}
function questsFromRun(win){const dq=dailyEnsure(),v={kills:G.kills,bosses:G.bossN,time:G.t,gold:G.reward,chests:G.q.chests,lvl:G.hero.lvl,runs:G.t>=30?1:0,dars:G.q.dars,evos:G.q.evos,endTime:G.endless&&!G.weekly?G.t:0,druns:G.daily&&G.t>=60?1:0};
  const newly=[];for(const x of dq.list){if(x.c)continue;const q=qDef(x.id),was=qDone(x),val=v[q.key]||0;x.p=q.max?Math.max(x.p,val):x.p+val;if(!was&&qDone(x))newly.push(qText(x));}
  save();return newly;}
function streakInfo(){const st=S.streak||{last:'',n:0},today=dayKey();const n=st.last===today?st.n:st.last===dayPrev(today)?st.n+1:1;
  return {n,mul:1+.1*Math.min(n-1,6),lost:n===1&&st.n&&st.last===dayPrev(dayPrev(today))?st.n:0};}
function heroBadge(){const b=document.querySelector('nav button[data-tab="Heroes"]');if(b)b.classList.toggle('dot',!!S.heroNew);}
function questBadge(){heroBadge();villageBadge();const dq=dailyEnsure(),can=dq.list.some(x=>!x.c&&qDone(x))||(!dq.bonus&&dq.list.every(x=>x.c));const b=$('navQ');if(b)b.classList.toggle('dot',can);}
let lbSeg='endless',qSeg='q';
function renderQuests(){if(qSeg==='a')return renderAch();if(qSeg==='b')return renderBest();const el=$('tabQuests'),dq=dailyEnsure(),rw=questReward(),now=new Date(dayMs()),left=Math.ceil((new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)-now)/3600e3),si=streakInfo();
  let h=segHTML()+'<h2>'+L('Задания дня','Daily quests')+'</h2><p class="sub">'+L('Новые задания через '+left+' ч. Выполни все три — получишь сундук дня. Каждый день подряд — награда больше.','New quests in '+left+' h. Complete all three to get the daily chest. Every day in a row — a bigger reward.')+'</p>';
  for(let i=0;i<dq.list.length;i++){const x=dq.list[i],done=qDone(x),pr=Math.min(1,qVal(x)/x.n);
    h+='<div class="card"><div class="row"><div class="t"><b>'+qText(x)+'</b><span>'+Math.min(qVal(x),x.n)+' / '+x.n+L(' · награда ',' · reward ')+fmtNum(rw)+goldW()+'</span><div class="bar"><i style="width:'+Math.round(pr*100)+'%"></i></div></div>'+
      (x.c?'<span class="tag ok">'+L('Получено','Collected')+'</span>':'')+'</div>'+
      (!x.c&&done?'<div class="btns" style="flex-direction:row"><button class="btn gold" data-q="'+i+'" style="flex:1">'+L('Забрать ','Collect ')+fmtNum(rw)+'</button>'+(adOk()?'<button class="btn ad" data-qa="'+i+'" style="flex:1">'+L('🎬 ×2 за рекламу','🎬 ×2 for an ad')+'</button>':'')+'</div>':'')+'</div>';}
  const all=dq.list.every(x=>x.c),bonus=Math.round(rw*2*si.mul);
  h+='<div class="card treasury"><div class="row"><img class="ic" src="'+ic('chest',96)+'"><div class="t"><b>'+L('Сундук дня: ','Daily chest: ')+fmtNum(bonus)+goldW()+'</b><span>'+L('Серия: '+si.n+' дн. подряд (+'+Math.round((si.mul-1)*100)+'%). Выполни и забери все три задания.','Streak: '+si.n+' '+plu(si.n,'','','','day','days')+' in a row (+'+Math.round((si.mul-1)*100)+'%). Complete and collect all three quests.')+'</span></div>'+
    (dq.bonus?'<span class="tag ok">'+L('Получено','Collected')+'</span>':all?'<button class="btn gold" id="qBonus">'+L('Открыть','Open')+'</button>':'<span class="tag">🔒</span>')+'</div>'+
    (si.lost&&!dq.bonus&&adOk()?'<div class="btns" style="flex-direction:row;align-items:center"><span style="flex:1;font-size:13px;color:var(--mut)">'+L('Серия прервалась (было '+si.lost+' дн.)','Streak broken (was '+si.lost+' '+plu(si.lost,'','','','day','days')+')')+'</span><button class="btn ad" id="qRest">'+L('🎬 Вернуть за рекламу','🎬 Restore for an ad')+'</button></div>':'')+'</div>';
  // рекорды
  const doneN=ORD.filter(i=>S.done[i]).length;
  h+='<h2>'+L('Рекорды','Records')+'</h2><div class="stats"><div><b>'+(S.endBest?fmtTime(S.endBest):'—')+'</b>'+L('Бесконечная сеча','Endless Battle')+'</div><div><b>'+fmtNum(S.kills||0)+'</b>'+L('одолено нечисти','monsters defeated')+'</div><div><b>'+(S.bosses||0)+'</b>'+L('боссов повержено','bosses beaten')+'</div><div><b>'+doneN+' / '+ORD.length+'</b>'+L('глав освобождено','chapters freed')+'</div></div>';
  if(OK){} // ОК: таблицы друзей нет (VKWebAppShowLeaderBoardBox в ОК не работает); «Позвать друзей» — в ⚙ → «Друзья»
  else if(PLAT==='vk')h+='<h2>Таблица друзей</h2><div class="card" id="lbBox"><p class="sub" style="margin:0 0 10px">Кто из друзей одолел больше нечисти? Твой счёт: <b style="color:#fff">'+fmtNum(S.kills||0)+'</b></p><div class="btns"><button class="btn big" id="lbVk">🏆 Таблица друзей</button><button class="btn ghost" id="lbInv">👥 Позвать друзей</button></div></div>'; // i18n:ru — только VK (там всегда русский)
  else h+='<h2>'+L('Таблица богатырей','Leaderboard')+'</h2><div class="seg"><button id="lbE" class="'+(lbSeg==='endless'?'on':'')+'">'+L('Сеча','Endless')+'</button><button id="lbW" class="'+(lbSeg==='weekly'?'on':'')+'">'+L('Неделя','Week')+'</button><button id="lbK" class="'+(lbSeg==='kills'?'on':'')+'">'+L('Одолено','Kills')+'</button>'+(drOpen()?'<button id="lbD" class="'+(lbSeg==='daily'?'on':'')+'">'+L('День','Day')+'</button>':'')+'</div>'+
    (lbSeg==='daily'?'<p class="sub" style="margin-top:-4px">'+L('Поход дня ','Daily Run ')+qt(dailyDef().rule.name)+L(': одолено нечисти + 500 за босса. Твои очки сегодня: ',': monsters defeated + 500 for the boss. Your score today: ')+(drMine().best?fmtNum(drMine().best):'—')+'</p>':'')+
    (lbSeg==='weekly'?'<p class="sub" style="margin-top:-4px">'+L('Испытание недели ','Weekly Trial ')+qt(weekly().name)+L(': кто дольше продержится. Твой рекорд: ',': who survives longest. Your record: ')+(wkMine().best?fmtTime(wkMine().best):'—')+'</p>':'')+'<div class="card" id="lbBox"><p class="sub" style="margin:0">'+L('Загрузка…','Loading…')+'</p></div>';
  el.innerHTML=h;segBind();
  const claim=(i,m)=>{const x=dq.list[i];if(x.c||!qDone(x))return;x.c=1;if(m===2)x.x2=1;S.gold+=rw*m;ern('quest',rw);ern('ad',rw*(m-1));save();SND.coin();toast('+'+fmtNum(rw*m)+goldW());renderQuests();setGold();questBadge();achToast();};
  for(const b of el.querySelectorAll('[data-q]'))b.onclick=()=>{if(!adBusy)claim(+b.dataset.q,1);};
  if(el.querySelector('[data-qa]'))STAT.offer('quest2');
  for(const b of el.querySelectorAll('[data-qa]'))b.onclick=()=>{const qi=+b.dataset.qa;STAT.place('quest2');showRewarded(()=>claim(qi,2),null,()=>{const d2=dailyEnsure(),x=d2===dq?dq.list[qi]:null;if(!x||x.x2)return x?'':adLateGold(rw); // день сменился — золото по цене задания
      const a=x.c?rw:rw*2;if(!x.c&&!qDone(x))return '';if(!x.c)ern('quest',rw);ern('ad',rw);x.c=1;x.x2=1;S.gold+=a;save();SND.coin();try{questBadge();achToast();}catch(e){}lateRe();return L('задание ×2: +','quest ×2: +')+fmtNum(a)+goldW();});};
  on('qBonus',()=>{if(dq.bonus)return;dq.bonus=1;S.streak={last:dayKey(),n:si.n};S.gold+=bonus;ern('chest',bonus);save();SND.chest();toast(L('Сундук дня: +','Daily chest: +')+fmtNum(bonus)+L(' золота!',' gold!'));renderQuests();setGold();questBadge();});
  onAd('qRest','streak',()=>showRewarded(()=>{S.streak={last:dayPrev(dayKey()),n:si.lost};save();SND.chest();toast(L('Серия возвращена: '+si.lost+' дн.','Streak restored: '+si.lost+' '+plu(si.lost,'','','','day','days')));renderQuests();},null,
    ()=>{const s2=streakInfo();if(!s2.lost||s2.lost!==si.lost)return adLateGold();S.streak={last:dayPrev(dayKey()),n:si.lost};save();SND.chest();lateRe();return L('серия возвращена: '+si.lost+' дн.','streak restored: '+si.lost+' '+plu(si.lost,'','','','day','days'));}));
  on('lbE',()=>{lbSeg='endless';renderQuests();});on('lbW',()=>{lbSeg='weekly';renderQuests();});on('lbK',()=>{lbSeg='kills';renderQuests();});on('lbD',()=>{lbSeg='daily';renderQuests();});
  loadLB();}
function segHTML(){const AL=ACH.filter(a=>!a.on||a.on()),na=AL.filter(a=>S.ach[a.id]).length;return '<div class="seg" style="margin-top:10px"><button id="sgQ" class="'+(qSeg==='q'?'on':'')+'">'+L('Задания','Quests')+'</button><button id="sgA" class="'+(qSeg==='a'?'on':'')+'">'+L('Достижения ','Awards ')+na+'/'+AL.length+'</button><button id="sgB" class="'+(qSeg==='b'?'on':'')+'">'+L('📖 Книга нечисти','📖 Bestiary')+'</button></div>';}
function segBind(){on('sgQ',()=>{qSeg='q';renderQuests();});on('sgA',()=>{qSeg='a';renderQuests();});on('sgB',()=>{qSeg='b';renderQuests();});}
/* ---------- бестиарий: книга нечисти ---------- */
function bestName(id){return EN[id].n;}
function starsHTML(id){const n=S.bk[id]||0,k=bestStars(id,n);return '<i class="stars">'+'★'.repeat(k)+'<u>'+'★'.repeat(3-k)+'</u></i>';}
function renderBest(){const el=$('tabQuests'),n=BEST_ORDER.filter(id=>S.meet[id]).length;
  let h=segHTML()+'<h2>'+L('Книга нечисти','Bestiary')+'</h2><p class="sub">'+L('Встретил в походе — записано в книгу. Открыто: ','Meet it on a run — it goes in the book. Found: ')+'<b style="color:#fff">'+n+' / '+BEST_ORDER.length+'</b>'+L('. Звёзды — за число одолённых. Нажми на картинку, чтобы почитать.','. Stars show how many you’ve defeated. Tap a picture to read.')+'</p>';
  for(const [title,list] of[[L('Нечисть','Monsters'),BEST_ORDER.filter(id=>!EN[id].boss&&id!=='egg')],[L('Боссы','Bosses'),BEST_ORDER.filter(id=>EN[id].boss||id==='egg')]]){
    h+='<h2 style="font-size:17px">'+title+'</h2><div class="bgrid">';
    for(const id of list){const k=!!S.meet[id];h+='<button class="bcell'+(k?'':' lock')+'" data-bi="'+id+'"><img src="'+ic(id,120)+'"><b>'+(k?bestName(id):'???')+'</b>'+(k?starsHTML(id):'<small class="where">'+bestWhere(id).replace(/ \(.*/,'')+'</small>')+'</button>';}
    h+='</div>';}
  el.innerHTML=h;segBind();for(const b of el.querySelectorAll('[data-bi]'))b.onclick=()=>{SND.click();openBeast(b.dataset.bi);};}
function openBeast(id){STAT.screen('beast');const d=EN[id],k=!!S.meet[id],n=S.bk[id]||0,boss=d.boss||id==='egg';
  const spd=d.spd===0?L('не ходит — лежит','doesn’t move'):d.spd<40?L('медленно','slow'):d.spd<60?L('вразвалочку','waddles'):d.spd<85?L('шустро','quick'):L('очень быстро','very fast');
  const feat=[d.fly?L('летает','flies'):'',d.ranged?L('стреляет издалека','shoots from afar'):'',boss?L('босс главы','chapter boss'):''].filter(Boolean).join(', ');
  const nxt=boss?[1,5,20]:[10,100,1000],goal=nxt.find(x=>n<x);
  showModal('<div class="beast'+(k?'':' lock')+'"><img src="'+ic(id,220)+'"></div><h3>'+(k?d.n:L('Неведомая нечисть','Unknown monster'))+'</h3>'+(k?'<div style="text-align:center;font-size:20px">'+starsHTML(id)+'</div>':'')+
    '<p class="sub" style="font-size:14px;color:#e8e4f4">'+(k?LORE[id]:L('Эта нечисть тебе ещё не встречалась. Говорят, водится здесь: ','You haven’t met this one yet. Rumor says it lives here: ')+bestWhere(id)+'.')+'</p>'+
    (k?'<div class="stats"><div><b>'+fmtNum(n)+'</b>'+L('одолено','defeated')+'</div><div><b style="font-size:15px">'+bestWhere(id).replace(/ \(.*/,'')+'</b>'+L('где водится','habitat')+'</div><div><b>'+fmtNum(d.hp)+'</b>'+L('здоровье','health')+'</div><div><b style="font-size:15px">'+spd+'</b>'+L('ходит','speed')+'</div></div>'+
      (feat?'<p class="sub">'+L('Особенность: ','Trait: ')+feat+'</p>':'')+(goal?'<p class="sub">'+L('До следующей звезды: одолей ','Next star: defeat ')+fmtNum(goal-n)+L('',' more')+'</p>':'<p class="sub" style="color:#ffd98a">'+L('Все три звезды! Нечисть тебя боится.','All three stars! Monsters fear you.')+'</p>'):'')+
    '<div class="btns"><button class="btn big" id="bOk">'+L('Закрыть книгу','Close the book')+'</button></div>');on('bOk',hideModal);}
function renderAch(){const el=$('tabQuests');let h=segHTML()+'<p class="sub">'+L('За каждое достижение — золото или облик богатыря. Облики выбираются во вкладке «Богатыри».','Every award gives gold or a hero outfit. Choose outfits on the “Heroes” tab.')+'</p>';
  const list=ACH.filter(a=>!a.on||a.on()).sort((a,b)=>(S.ach[a.id]?1:0)-(S.ach[b.id]?1:0));
  for(const a of list){const got=!!S.ach[a.id],v=Math.min(a.v(),a.n),skin=typeof a.r==='string';
    h+='<div class="card" style="'+(got?'opacity:.6':'')+'"><div class="row">'+(skin?'<img class="ic" src="'+ic('hp_'+a.r,96)+'">':'<img class="ic" src="'+ic(got?'chest':'p_coin',96)+'">')+
      '<div class="t"><b>'+(got?'✓ ':'🏆 ')+a.name+'</b><span>'+a.about+'</span><span style="color:#ffd98a">'+L('Награда: ','Reward: ')+rewardText(a.r)+'</span>'+
      (got?'':'<div class="bar"><i style="width:'+Math.round(v/a.n*100)+'%"></i></div><span>'+fmtNum(v)+' / '+fmtNum(a.n)+'</span>')+'</div></div></div>';}
  el.innerHTML=h;segBind();}
async function loadLB(){const box=$('lbBox');if(!box)return;
  if(PLAT==='vk'){on('lbVk',()=>LB.vkFriends());on('lbInv',()=>{if(!VK){toast('Позвать друзей можно в игре ВКонтакте');return;}vkSend('VKWebAppShowInviteBox',{},60000).catch(()=>{});});return;} // i18n:ru — только VK (там всегда русский)
  if(!LB.ok()){box.innerHTML='<p class="sub" style="margin:0">'+L('Общая таблица сейчас недоступна — загляни попозже. Пока выше — твои личные рекорды.','The leaderboard is unavailable right now — check back later. Your personal records are above.')+'</p>';return;}
  if(!LB.authed()){box.innerHTML=S.runs<3?'<p class="sub" style="margin:0">'+L('Сходи ещё в пару походов — и сможешь потягаться с другими богатырями.','Go on a couple more runs — then you can compete with other heroes.')+'</p>':'<p class="sub">'+L('Чтобы попасть в таблицу, войди в Яндекс.','Sign in to Yandex to get on the leaderboard.')+'</p><button class="btn big" id="lbLogin">'+L('Войти','Sign in')+'</button>';if(S.runs<3)return;
    on('lbLogin',async()=>{if(await LB.login()){LB.set('endless',S.endBest||0);LB.set('kills',S.kills||0);if(wkMine().best)LB.set('weekly',weekNo()*WEEK_SCORE+wkMine().best);if(drMine().best)LB.set('daily',dayIdx()*DAY_SCORE+drMine().best);}renderQuests();});}
  const r=await LB.get(lbSeg);if(!$('lbBox'))return;
  if(r&&r.entries&&lbSeg==='weekly'&&!r.entries.some(e=>Math.floor(e.score/WEEK_SCORE)===weekNo()))r.entries=[];
  if(r&&r.entries&&lbSeg==='daily'&&!r.entries.some(e=>Math.floor(e.score/DAY_SCORE)===dayIdx()))r.entries=[];
  if(!r||!r.entries||!r.entries.length){if(LB.authed())box.innerHTML='<p class="sub" style="margin:0">'+L('Пока пусто — стань первым!','Empty so far — be the first!')+'</p>';return;}
  const me=r.userRank,wn=weekNo();let h='';for(const e of r.entries){if(lbSeg==='weekly'&&Math.floor(e.score/WEEK_SCORE)!==wn)continue;if(lbSeg==='daily'&&Math.floor(e.score/DAY_SCORE)!==dayIdx())continue;
    const nm=(e.player&&e.player.publicName)||L('Безымянный богатырь','Nameless hero');const sc=lbSeg==='endless'?fmtTime(e.score):lbSeg==='weekly'?fmtTime(e.score%WEEK_SCORE):lbSeg==='daily'?fmtNum(e.score%DAY_SCORE):fmtNum(e.score);
    h+='<div class="lbrow'+(e.rank===me?' me':'')+'"><b>'+e.rank+'</b><span>'+nm.replace(/[<>&]/g,'')+'</span><strong>'+sc+'</strong></div>';}
  const bx=$('lbBox');if(bx){if(LB.authed())bx.innerHTML=h;else bx.insertAdjacentHTML('beforeend',h);}}

/* ---------- карта Руси ---------- */
function isWide(){return (window.innerWidth||0)>=880;}
/* M2: глава открыта = пройдена || уже игралась (S.best — старый игрок не теряет главу, в которую ходил, если перед ней вставили новые) || первая в ORD || предыдущая по ORD пройдена.
   Слота нет в ORD (тема не выпущена) — закрыта. Без тем = прежнее i===0||S.done[i-1] (плюс пройденные/игранные — только шире) */
function chOpen(i){const p=chPos(i);return p>0&&(!!S.done[i]||(S.best[i]|0)>0)||p===1||p>1&&(!!S.done[ORD[p-2]]||lairPass(ORD[p-2]));}
function lairPass(s){const r=CAMP_S[s];return !!(r&&r.n===3&&S.lairL&&(S.lairL[s]|0)>=LAIR_PASS);} /* «вернётесь в Логово позже» — 3 поражения подряд */
const LAIR_PASS=3;
/* renderMap, mapFocus, звёзды, ряд «Сложность», renderChInfo — в js/map.js (M1 глав данными) */
/* ---------- испытание недели ---------- */
function wkMine(){return S.wk&&S.wk.w===weekNo()?S.wk:{best:0,got:0,runs:0};}
function weeklyCard(){const w=weekly(),m=wkMine(),lh=weekLeftH(),left=lh>=24?Math.floor(lh/24)+L(' дн. ','d ')+(lh%24)+L(' ч','h'):lh+L(' ч','h'),open=!!S.done[0];
  return '<div class="card wkcard"><div class="row"><img class="ic" src="'+ic(w.mod.only?WEAPONS[w.mod.only].icon:'e_perun',96)+'"><div class="t"><span class="wkhead">'+L('🏆 Испытание недели','🏆 Weekly Trial')+'</span>'+
    '<b class="wkname">'+w.name+'</b><span class="clamp2">'+w.about+'</span></div></div>'+
    '<div class="wkstats"><div><b>'+(m.best?fmtTime(m.best):'—')+'</b>'+L('рекорд недели','week record')+'</div><div><b>'+(m.got?'✓':'+'+fmtNum(weeklyReward()))+'</b>'+(m.got?L('награда взята','reward taken'):L('за участие','for taking part'))+'</div><div><b>'+left+'</b>'+L('до смены','until reset')+'</div></div>'+
    (open?'<div class="btns" style="flex-direction:row"><button class="btn" id="wkBtn" style="flex:2">'+L('⚔️ Испытать','⚔️ Try it')+'</button><button class="btn ghost" id="wkRules" style="flex:1">'+L('Правила','Rules')+'</button><button class="btn ghost" id="wkLb" style="flex:1">'+L('Таблица','Board')+'</button></div>'
      :'<p class="sub" style="margin:8px 0 0">'+L('🔒 Откроется, когда освободишь ','🔒 Unlocks when you free the ')+CH[0].name+'</p>')+'</div>';}
function openWkRules(){STAT.screen('weekly');const w=weekly();showModal('<h3>'+w.name+'</h3><p class="sub" style="font-size:14px;color:#e8e4f4">'+w.about+'</p>'+
  '<div class="card" style="font-size:13px;line-height:1.5">'+L('⚔️ Выживание: главы идут по кругу, каждые 5 минут — босс, с каждым кругом сильнее.<br>🏆 Счёт — сколько продержишься.'+(OK?'':' Лучший результат недели попадает в общую таблицу.')+'<br>🎁 Награда за участие: +'+fmtNum(weeklyReward())+' золота, если продержишься хотя бы минуту (раз в неделю).<br>⏳ Правила меняются каждый понедельник.','⚔️ Survival: chapters loop, a boss every 5 minutes, tougher each round.<br>🏆 Score — how long you last. Your best of the week goes on the leaderboard.<br>🎁 Reward for taking part: +'+fmtNum(weeklyReward())+' gold if you survive at least a minute (once a week).<br>⏳ The rules change every Monday.')+'</div>'+
  '<div class="btns"><button class="btn big" id="wrGo">'+L('⚔️ Испытать','⚔️ Try it')+'</button><button class="btn ghost" id="wrOk">'+L('Понятно','Got it')+'</button></div>');on('wrOk',hideModal);on('wrGo',()=>startRun(0,true,true));}
/* drawMap — в js/map.js */

/* ---------- забег ---------- */
function startRun(chi,endless,wk,dr){ntfV=null;ac();hideModal();gearRefresh();$('toast').classList.remove('on');document.body.classList.add('run');layout();newRun(chi,HERO_BY[S.hero]&&heroOpen(HERO_BY[S.hero])?S.hero:'dob',endless,wk,dr);musicPlay('run');YG.start();
  STAT.screen('game');if(G.endless&&!G.weekly)STAT.lvl('inf');else STAT.lvl(chPos(G.chi),G.daily?'daily':G.weekly?'week':G.dif==='s'||G.dif==='h'?'ch_'+G.dif:'ch',{s:G.chi});} /* M2: l — место в кампании (1…N), s — слот (ключ сейва) */ // сеча (бесконечный) — l:'inf' (STAT v1.2), как и в end // статистика: поход = «уровень» (номер главы, режим)
function togglePause(){if(!G||G.over)return;if($('modal').classList.contains('on')&&!G.pauseOpen)return;
  if(G.pauseOpen){G.pauseOpen=false;G.paused=false;hideModal();musicDuck(1);YG.start();return;}
  G.paused=true;G.pauseOpen=true;IN.on=false;YG.stop();musicDuck(.35);
  const hints=G.weapons.filter(w=>w.lvl<6).map(w=>'<b style="color:#fff">'+WEAPONS[w.id].name+'</b> + '+PASSIVES[WEAPONS[w.id].evo.need].name+' → '+WEAPONS[w.id].evo.name).join('<br>');
  showModal('<h3>'+L('Привал','Rest stop')+'</h3><p class="sub">'+(G.daily?L('Поход дня: ','Daily Run: ')+G.daily.rule.name+' · '+G.ch.name:G.weekly?L('Испытание: ','Trial: ')+weekly().name:G.endless?L('Бесконечная сеча · круг ','Endless Battle · round ')+(G.cyc+1):G.ch.name)+' · '+fmtTime(G.t)+'</p>'+invHTML()+(hints?'<p class="sub" style="text-align:left;margin-top:8px">'+L('Эволюция: оружие 5-го уровня + оберег','Evolution: level 5 weapon + charm')+'<br>'+hints+'</p>':'')+
    volHTML()+'<div class="btns"><button class="btn big" id="pRes">'+L('Продолжить','Continue')+'</button><button class="btn ghost" id="pQuit">'+L('Уйти (золото сохранится)','Leave (gold is kept)')+'</button></div>','pause');
  on('pRes',togglePause);volBind();
  on('pQuit',()=>{G.pauseOpen=false;G.quit=1;musicDuck(1);endRun(false);});}
function invHTML(){let h='<div class="inv">';for(const w of G.weapons)h+='<div><img src="'+ic(w.lvl>=6?'e_'+w.id:WEAPONS[w.id].icon,76)+'"><i>'+(w.lvl>=6?'★':w.lvl)+'</i></div>';h+='</div><div class="inv">';
  for(const id in G.pas)h+='<div><img src="'+ic(PASSIVES[id].icon,76)+'"><i>'+G.pas[id]+'</i></div>';return h+'</div>';}

/* ---------- карточки умений ---------- */
// ключ карточки для «Изгнать»/«Закрепить»: оружие/оберег целиком (не уровень)
function ckey(c){return c.t==='w'||c.t==='p'?c.t+':'+c.id:'';}
// excl — ключи, которые сейчас уже лежат на столе (замена изгнанной карточки без повторов); изгнанные (G.ban) не приходят до конца похода
/* «первая эволюция — к 3-му походу» (аудит 14): пока ни одной эволюции не было (S.evoSeen пуст) и это не первый поход, не поход дня и не испытание —
   карточки пути к эволюции (оружие 3–5 ур. и его оберег) выпадают чаще и помечены 🔥, сундук вожака с 2:30 докладывает недостающий шаг */
function evoHelp(){return !!G&&!G.daily&&!G.weekly&&(!Object.keys(S.evoSeen||{}).length||!!(G.short&&G.short.help));} // boost: и в самом первом походе — первое «вау» должно случиться в первые 5 минут
function evoPath(){const ws=G.weapons.filter(w=>w.lvl>=(G.short&&G.short.path1?1:3)&&w.lvl<6).sort((a,b)=>b.lvl-a.lvl);return ws;}
function evoNeedIds(){const o={};for(const w of evoPath())o[WEAPONS[w.id].evo.need]=w.id;return o;}
function rollCards(n,excl){const opts=[],ban=G.ban||{},ok=o=>!ban[ckey(o)]&&!(excl&&excl[ckey(o)]),help=evoHelp(),needP=help?evoNeedIds():{};
  for(const w of G.weapons){if(w.lvl<5)opts.push({t:'w',id:w.id,lvl:w.lvl+1,wt:help&&w.lvl>=(G.short&&G.short.path1?1:3)?2.6:1.3});else if(w.lvl===5&&G.pas[WEAPONS[w.id].evo.need])opts.push({t:'w',id:w.id,lvl:6,wt:5});}
  if(G.weapons.length<MAX_W&&!G.wk.only)for(const id in WEAPONS)if(!G.weapons.find(w=>w.id===id))opts.push({t:'w',id,lvl:1,wt:G.weapons.length<3?1.2:.8});
  const np=Object.keys(G.pas).length;for(const id in PASSIVES){const l=G.pas[id]||0;if(l>=PASSIVES[id].max||(!l&&np>=MAX_P))continue;opts.push({t:'p',id,lvl:l+1,wt:needP[id]&&!l?2.5:l?1:.75});}
  compact(opts,o=>o.lvl===6&&!(excl&&excl[ckey(o)])||ok(o)); // эволюцию изгнать нельзя
  // эволюция, если условия выполнены, предлагается всегда
  const out=opts.filter(o=>o.lvl===6).slice(0,n);for(const o of out)opts.splice(opts.indexOf(o),1);
  // помощь к первой эволюции: следующий шаг пути (уровень оружия 3–5 ур. или его оберег) всегда среди карточек
  if(help&&out.length<n){const w=evoPath()[0];if(w){const need=WEAPONS[w.id].evo.need,o=opts.find(q=>w.lvl<5?q.t==='w'&&q.id===w.id:q.t==='p'&&q.id===need&&!G.pas[need]);if(o){out.push(o);opts.splice(opts.indexOf(o),1);}}}
  while(out.length<n&&opts.length){let tot=0;for(const o of opts)tot+=o.wt;let r=rnd()*tot,i=0;for(;i<opts.length-1;i++){r-=opts[i].wt;if(r<=0)break;}out.push(opts.splice(i,1)[0]);}
  if(!out.length&&!excl){out.push({t:'gold'});if(!G.wk.noHeal)out.push({t:'heal'});}return out;}
// закреплённая карточка ещё годится? (за это время оружие могло подрасти из сундука)
function cardOk(c){if(!c)return false;if(c.t==='w'){const w=G.weapons.find(q=>q.id===c.id);if(w)return c.lvl===w.lvl+1&&(c.lvl<=5||!!G.pas[WEAPONS[c.id].evo.need]);return c.lvl===1&&G.weapons.length<MAX_W&&!G.wk.only;}
  if(c.t==='p'){const l=G.pas[c.id]||0;return c.lvl===l+1&&c.lvl<=PASSIVES[c.id].max&&(l>0||Object.keys(G.pas).length<MAX_P);}return false;}
function cardInfo(c){if(c.t==='w'){const W=WEAPONS[c.id];if(c.lvl===6)return {icon:'e_'+c.id,name:W.evo.name,desc:W.evo.about,tag:L('Эволюция','Evolution')};
    const near=c.lvl>=4||evoHelp()&&c.lvl>=(G.short&&G.short.path1?2:3)&&c.lvl<5&&(c.lvl>=3||G.weapons.some(w=>w.id===c.id))?' · <i class="evo-near">'+(evoHelp()?L('🔥 путь к эволюции','🔥 path to evolution'):L('приблизит эволюцию','closer to evolution'))+'</i>':'';
    return {icon:W.icon,name:W.name,desc:(c.lvl===1?W.about:W.up[c.lvl-1])+(c.lvl===5?L(' · потом эволюция с ',' · then evolves with ')+qt(PASSIVES[W.evo.need].name):near),tag:c.lvl===1?L('Новое','New'):L('Ур. ','Lv ')+c.lvl+'/5'};}
  if(c.t==='p'){const P=PASSIVES[c.id],ew=G.weapons.find(w=>w.lvl<6&&WEAPONS[w.id].evo.need===c.id);
    return {icon:P.icon,name:P.name,desc:P.about+(ew?' · <i class="evo-near">'+(evoHelp()&&!G.pas[c.id]?'🔥 ':'')+L('нужен для эволюции ','needed to evolve into ')+qt(WEAPONS[ew.id].evo.name)+'</i>':''),tag:c.lvl===1?L('Новое','New'):L('Ур. ','Lv ')+c.lvl+'/'+P.max};}
  if(c.t==='gold')return {icon:'p_coin',name:L('Мешок золота','Bag of gold'),desc:L('+25 золота','+25 gold'),tag:''};return {icon:'pie',name:L('Пирожки','Pirozhki'),desc:L('Восстановить 40% здоровья','Restore 40% health'),tag:''};}
function applyCard(c){if(c.t==='w'){const w=G.weapons.find(q=>q.id===c.id);if(w){w.lvl=c.lvl;
    if(c.lvl===4&&!S.evoSeen[c.id]){G.evoHint=G.evoHint||{};if(!G.evoHint[c.id]){G.evoHint[c.id]=1;const W=WEAPONS[c.id];banner(L('Ещё уровень — и эволюция!','One more level — then evolution!'),W.name+L(' 5 ур. + ',' lv 5 + ')+PASSIVES[W.evo.need].name,2);}}if(c.lvl===6){const fst=!Object.keys(S.evoSeen).length;G.q.evos++;S.evoSeen[c.id]=1;banner(fst?L('Первая эволюция!','First evolution!'):L('Эволюция!','Evolution!'),WEAPONS[c.id].evo.name,4);heroSay(pick(PH.evo));SND.chest();G.shake=6;vib(60,1);
      hitStop(.14);G.fx.push({k:'pulse',own:1,t:0,dur:.9,r1:VIEW.R,evo:1});G.fx.push({k:'wave',own:1,x:G.hero.x,y:G.hero.y,t:0,dur:.6,r1:260,col:'#ffe07a'});}
      if(c.lvl===5&&G.pas[WEAPONS[c.id].evo.need])banner(L('Эволюция готова!','Evolution ready!'),L('Возьми её на следующем уровне','Take it on the next level-up'),2);}else G.weapons.push({id:c.id,lvl:1,t:.2,a:0});}
  else if(c.t==='p'){G.pas[c.id]=c.lvl;computeStats();if(c.lvl===1){const w=G.weapons.find(q=>q.lvl===5&&WEAPONS[q.id].evo.need===c.id);if(w)banner(L('Эволюция готова!','Evolution ready!'),WEAPONS[w.id].evo.name+L(' — на следующем уровне',' — on the next level-up'),2);}}
  else if(c.t==='gold')G.gold+=25;else G.hero.hp=Math.min(G.st.maxHp,G.hero.hp+G.st.maxHp*.4);}
/* окно уровня (boost): цифры «было → стало» в карточке — что именно даст выбор */
function wDelta(id,lvl){const W=WEAPONS[id],i=lvl-1,m=G.st.might*(1+armFx(id).d),ar=' → ',o=[],d2=v=>dec(v,2).replace(/[.,]?0+$/,'');
  const f=(key,lab,fmt)=>{const A=W[key];if(!A)return;const b=A[i],a=i>0?A[i-1]:null;if(a===b&&i>0)return;o.push(lab+(a==null?fmt(b):fmt(a)+ar+fmt(b)));};
  f('dmg',L('урон ','damage '),v=>Math.round(v*m));f('n',L('штук ','count '),v=>v);f('cd',L('раз в ','every '),v=>d2(v*G.st.cd)+L('\u00a0с','\u00a0s'));if(o.length<3)f('r',L('размах ','reach '),v=>Math.round(v*G.st.area));if(o.length<3)f('dur',L('длится ','lasts '),v=>d2(v)+L('\u00a0с','\u00a0s'));
  return o.slice(0,3).map(x=>'<i>'+x+'</i>').join(' · ');}
function pDelta(id,lvl){const a=G.st,pas=Object.assign({},G.pas);pas[id]=lvl;const b=calcStats(G.heroId,pas,G.wk,G.stoneMod),ar=' → ',pc=v=>(v>=0?'+':'−')+Math.abs(Math.round(v*100))+'%';
  if(G.pity)b.might*=1+PITY_MIGHT*G.pity;
  if(id==='apple')return L('здоровье ','health ')+Math.round(a.maxHp)+ar+Math.round(b.maxHp);
  if(id==='mail')return L('каждый удар слабее на ','each hit weaker by ')+a.armor+ar+b.armor;
  if(id==='boots')return L('скорость ','speed ')+Math.round(a.spd)+ar+Math.round(b.spd);
  if(id==='ball')return L('притяжение ','pickup range ')+Math.round(a.magnet)+ar+Math.round(b.magnet);
  if(id==='ring')return L('урон ','damage ')+pc(a.might-1)+ar+pc(b.might-1);
  if(id==='livew')return L('лечение ','healing ')+dec(a.regen,1)+ar+dec(b.regen,1)+L(' в секунду',' per second');
  if(id==='cloth')return L('опыт ','XP ')+pc(a.xp-1)+ar+pc(b.xp-1);
  if(id==='comb')return L('площадь ударов ','attack area ')+pc(a.area-1)+ar+pc(b.area-1);
  if(id==='amulet')return L('удары чаще на ','attacks faster by ')+Math.round((1-a.cd)*100)+'%'+ar+Math.round((1-b.cd)*100)+'%';
  if(id==='quiver')return L('снарядов сверху ','extra shots ')+a.amount+ar+b.amount;return '';}
// got — карточка уже выдана (сундук): у оберега «было» уже не узнать
function cardHTML(c,i,arr,got){const f=cardInfo(c),evoC=c.t==='w'&&c.lvl===6;let dl='';try{dl=c.t==='w'?wDelta(c.id,c.lvl):c.t==='p'&&!got?pDelta(c.id,c.lvl):'';}catch(e){}f.name=f.name.replace('Жар-','Жар\u2011');return '<button class="upc'+(c.pinned?' pinned':'')+(evoC?' evoc':'')+'" data-i="'+i+'">'+(c.pinned?'<i class="pin">📌</i>':'')+'<img src="'+ic(f.icon,104)+'"><div><b>'+f.name+(f.tag?'<em class="'+(f.tag===L('Новое','New')?'new':f.tag===L('Эволюция','Evolution')?'evo':'')+'">'+f.tag+'</em>':'')+'</b>'+(dl?'<span class="delta">'+dl+'</span>':'')+'<span>'+f.desc+'</span></div></button>';} // i18n:ru — неразрывный дефис только для русского
// что уже в руках: оружие и обереги с уровнями
function invMini(){let h='<div class="invmini">';for(const w of G.weapons)h+='<span><img src="'+ic(w.lvl>=6?'e_'+w.id:WEAPONS[w.id].icon,56)+'"><i>'+(w.lvl>=6?'★':w.lvl+'/5')+'</i></span>';
  for(const id in G.pas)h+='<span><img src="'+ic(PASSIVES[id].icon,56)+'"><i>'+G.pas[id]+'</i></span>';return h+'</div>';}
// в самом первом походе кнопок рекламы нет первые 3 минуты
function adLate(){return !!(G&&G.first&&G.t<180);}
/* окно уровня (v13): «🚫 Изгнать» — карточка не придёт до конца похода (2 раза за поход), «📌 Закрепить» — карточка подождёт до следующего уровня,
   «Пропустить» — +10 золота вместо умения. В самом первом походе этих кнопок нет (не перегружаем новичка) */
/* «Перебрать за рекламу» (27.09, аудит 12): один раз за поход, не раньше 2:00 и не чаще чем на одном окне уровня из трёх — без рекламной кнопки на каждом окне */
function openLevelUp(){const g0=G,tok=openLevelUp.tok=(openLevelUp.tok||0)+1;YG.stop();SND.level();guardModal();if(Math.random()<.35)heroSay(pick(PH.lvl));let cards=rollCards(G.cards),adUsed=false,mode='';
  const rrAdOk=!G.rrAd&&!adLate()&&G.t>=120&&((G.lvAd=(G.lvAd||0)+1)%3===1);
  const pin=G.pin;G.pin=null;if(pin&&cardOk(pin)){compact(cards,c=>ckey(c)!==ckey(pin));cards.unshift(Object.assign({},pin,{pinned:1}));if(cards.length>G.cards)cards.length=G.cards;}
  const tt=G.tut&&TUT[G.tut.i]&&TUT[G.tut.i].id==='card'?'<div class="tutbox">💡 '+TUT[G.tut.i].t+'</div>':'',tools=!G.first;
  const close=()=>{openLevelUp.tok++;G.lvlQ--;hideModal();if(G.lvlQ>0)openLevelUp();else{G.paused=false;YG.start();}};
  const excl=()=>{const o={};for(const c of cards)if(ckey(c))o[ckey(c)]=1;return o;};
  const draw=()=>{showModal('<h3>'+L('Новый уровень!','Level up!')+'</h3>'+invMini()+tt+
    (mode?'<div class="tutbox mode">'+(mode==='ban'?L('🚫 Выбери карточку, которую изгнать до конца похода','🚫 Pick a card to banish for the rest of the run'):L('📌 Выбери карточку, которая подождёт до следующего уровня','📌 Pick a card to hold until the next level-up'))+'</div>':'')+
    '<div class="cards'+(mode?' pick-'+mode:'')+'">'+cards.map(cardHTML).join('')+'</div><div class="lvtools">'+
    (G.rerolls>0?'<button class="btn ghost" id="rr">'+L('🎲 Перебрать (','🎲 Reroll (')+G.rerolls+')</button>':adUsed||!rrAdOk||!adOk()?'':'<button class="btn ad" id="rrAd">'+L('🎬 Перебрать за рекламу','🎬 Reroll for an ad')+'</button>')+
    (tools?(G.banN>0?'<button class="btn ghost'+(mode==='ban'?' on':'')+'" id="lvBan">'+(mode==='ban'?L('Отмена','Cancel'):L('🚫 Изгнать (','🚫 Banish (')+G.banN+')')+'</button>':'')+
      '<button class="btn ghost'+(mode==='pin'?' on':'')+'" id="lvPin">'+(mode==='pin'?L('Отмена','Cancel'):L('📌 Закрепить','📌 Hold'))+'</button>'+
      '<button class="btn ghost" id="lvSkip">'+L('Пропустить: +10 золота','Skip: +10 gold')+'</button>':'')+'</div>','level');
    for(const b of document.querySelectorAll('.upc'))b.onclick=()=>{SND.click();const i=+b.dataset.i,c=cards[i];
      if(mode==='ban'){if(!ckey(c)||c.lvl===6){toast(L('Эту карточку изгнать нельзя','This card can’t be banished'));return;}G.ban[ckey(c)]=1;G.banN--;mode='';
        const ex=excl(),more=rollCards(1,ex);if(more.length)cards[i]=more[0];else cards.splice(i,1);if(!cards.length)cards=rollCards(G.cards);toast('🚫 '+qt(cardInfo(c).name)+L(' изгнан до конца похода',' banished for the rest of the run'));draw();return;}
      if(mode==='pin'){if(!ckey(c)){toast(L('Эту карточку закрепить нельзя','This card can’t be held'));return;}for(const q of cards)delete q.pinned;G.pin={t:c.t,id:c.id,lvl:c.lvl};c.pinned=1;mode='';toast('📌 '+qt(cardInfo(c).name)+L(' подождёт до следующего уровня',' will wait until the next level-up'));draw();return;}
      if(G.pin&&ckey(G.pin)===ckey(c))G.pin=null; // выбрал закреплённую — закреп снят
      applyCard(c);tutEvent('card');if(Math.random()<.3)heroSay(pick(PH.card));close();};
    on('rr',()=>{G.rerolls--;reroll();});onAd('rrAd','reroll',()=>showRewarded(()=>{adUsed=true;G.rrAd=1;reroll();},null,()=>{if(G!==g0||G.over)return adLateGold();G.rrAd=1; // adt: поход кончился — золото; окно уровня ещё открыто — перебор сразу; закрыто — перебор в запас
      if(!adUsed&&openLevelUp.tok===tok&&modalHas($('rrAd'))){adUsed=true;reroll();return L('карточки перебраны','cards rerolled');}G.rerolls++;return L('перебор карточек — в запас','a card reroll saved for later');}));
    on('lvBan',()=>{mode=mode==='ban'?'':'ban';draw();});on('lvPin',()=>{mode=mode==='pin'?'':'pin';draw();});
    on('lvSkip',()=>{G.gold+=10;SND.coin();toast(L('+10 золота','+10 gold'));close();});};
  // перебор оставляет закреплённую карточку на месте
  const reroll=()=>{const keep=cards.filter(c=>c.pinned);cards=rollCards(G.cards);if(keep.length){compact(cards,c=>ckey(c)!==ckey(keep[0]));cards.unshift(keep[0]);if(cards.length>G.cards)cards.length=G.cards;}mode='';draw();};
  draw();}
/* сундук-самогуд (v13): рулетка ~1–2,5 с со звоном, внутри 1 награда (70%), 3 (25%) или 5 (5%); с босса — золотой: 3 (80%) или 5.
   Награды выдаются по одной (rollCards(1) после каждой), поэтому готовая эволюция всегда приходит первой, а новая — может «доспеть» внутри сундука.
   Всё выдаётся сразу при открытии: «Забрать» можно нажать в любой момент — рулетка просто остановится. Спокойный режим — без мелькания: ячейки открываются по очереди */
function openChest(gold2){const g0=G;YG.stop();const lk=G.st.luck,r=rnd();let n=gold2?(r<.2*lk?5:3):(r<.05*lk?5:r<.3*lk?3:1);
  const gold=Math.round(randi(15,30)*G.ch.gold*ECO.coin*(gold2?3:1)*(G.short?G.short.coin:1));G.gold+=gold;
  // помощь к первой эволюции: сундук вожака с 2:30 докладывает недостающий шаг (уровень оружия или его оберег)
  const evoStep=()=>{const w=evoPath()[0];if(!w)return null;const need=WEAPONS[w.id].evo.need,f=w.lvl<5?{t:'w',id:w.id,lvl:w.lvl+1}:!G.pas[need]?{t:'p',id:need,lvl:1}:null;return f&&cardOk(f)?f:null;};
  let force=null,fill=false;if(!gold2&&evoHelp()&&G.t>=(G.short?0:150))force=evoStep();
  // короткий первый поход: сундук второго вожака доводит первую эволюцию до конца (до 5 наград: недостающие уровни оружия, его оберег и сама эволюция)
  if(G.short&&G.short.evoT&&!gold2&&evoHelp()&&(G.q.chests>=2||G.t>=G.short.evoT)){const w=evoPath()[0];if(w){fill=true;n=Math.max(n,Math.min(5,(5-w.lvl)+(G.pas[WEAPONS[w.id].evo.need]?0:1)+1));}}
  const got=[];for(let i=0;i<n;i++){const c=(fill?evoStep():i===0?force:null)||rollCards(1)[0];if(!c)break;applyCard(c);got.push(c);}
  const tok=openChest.tok=(openChest.tok||0)+1,calm=CALM(),alive=()=>openChest.tok===tok&&$('chReel');
  const pool=Object.keys(WEAPONS).map(id=>WEAPONS[id].icon).concat(Object.keys(PASSIVES).map(id=>PASSIVES[id].icon),['p_coin','pie']);
  const title=gold2?L('Золотой сундук!','Golden chest!'):L('Сундук!','Chest!'),jack=got.length>=5?L('Джекпот! ×5','Jackpot! ×5'):got.length>=3?L('Щедро! ×3','Generous! ×3'):'';
  let extraUsed=false,shown=false;
  const finish=()=>{if(!alive()||shown)return;shown=true;openChest.tok++;const sl=document.querySelectorAll('#chReel .slot');got.forEach((c,i)=>{const e=sl[i];if(e&&!e.classList.contains('got')){e.classList.add('got');e.firstChild.src=ic(cardInfo(c).icon,72);}});
    $('chSub').textContent=(got.some(c=>c.t==='w'&&c.lvl===6)?L('ЭВОЛЮЦИЯ! · ','EVOLUTION! · '):'')+(jack?jack+' · ':'')+'+'+gold+goldW();$('chReel').classList.add('done');$('chList').innerHTML=got.map(c=>cardHTML(c,0,null,1)).join('');for(const b of document.querySelectorAll('#chList .upc'))b.style.pointerEvents='none';
    const ad=$('chAd');if(ad)ad.style.display='';SND.chest();if(got.length>=3)vib(40,1);};
  guardModal();showModal('<h3>'+title+'</h3><p class="sub" id="chSub">'+(calm?L('Открываем…','Opening…'):L('Крутится, вертится…','Spinning, spinning…'))+'</p>'+
    '<div class="reel'+(gold2?' gold':'')+(got.length<=3?' few':'')+'" id="chReel">'+got.map(()=>'<div class="slot'+(calm?' calm':'')+'"><img src="'+(calm?ic('chest',72):ic(pick(pool),72))+'" alt=""></div>').join('')+'</div>'+
    '<div class="cards" id="chList"></div><div class="btns">'+(adLate()||!gold2||!adOk()?'':'<button class="btn ad" id="chAd" style="display:none">'+L('🎬 Ещё подарок за рекламу','🎬 One more gift for an ad')+'</button>')+'<button class="btn big" id="chOk">'+L('Забрать','Collect')+'</button></div>','chest');
  on('chOk',()=>{openChest.tok++;hideModal();G.paused=false;YG.start();});
  onAd('chAd','chest',()=>{if(extraUsed)return;showRewarded(()=>{extraUsed=true;const more=rollCards(1);more.forEach(applyCard);got.push.apply(got,more);if(!more.length){G.gold+=gold;toast('+'+fmtNum(gold)+goldW());} // всё уже взято — ролик не впустую: золото сундука ещё раз
    $('chList').innerHTML=got.map(c=>cardHTML(c,0,null,1)).join('');for(const b of document.querySelectorAll('#chList .upc'))b.style.pointerEvents='none';const a=$('chAd');if(a)a.remove();},null,
    ()=>{if(extraUsed)return '';if(G!==g0||G.over)return adLateGold(); // adt: поход кончился — золото; идёт — ещё одно умение (окно сундука, если открыто, дорисовать)
      extraUsed=true;const more=rollCards(1);more.forEach(applyCard);const own=openChest.tok===tok+(shown?1:0)&&modalHas($('chList'));let m;
      if(!more.length){G.gold+=gold;m='+'+fmtNum(gold)+goldW();}else m=L('ещё подарок из сундука: ','one more gift from the chest: ')+cardInfo(more[0]).name;
      if(own&&$('chList')){got.push.apply(got,more);$('chList').innerHTML=got.map(c=>cardHTML(c,0,null,1)).join('');for(const b of document.querySelectorAll('#chList .upc'))b.style.pointerEvents='none';const a=$('chAd');if(a)a.remove();}return m;});});
  if(!got.length){finish();return;}
  const t0=performance.now(),stopAt=i=>(got.length===1?1300:got.length===3?850+i*450:750+i*380);let next=0;
  const spin=()=>{if(!alive())return;const now=performance.now()-t0,sl=document.querySelectorAll('#chReel .slot');
    while(next<got.length&&now>=stopAt(next)){const e=sl[next];e.classList.add('got');e.firstChild.src=ic(cardInfo(got[next]).icon,72);SND.reel();next++;}
    if(next>=got.length){setTimeout(finish,250);return;}
    if(!calm){for(let i=next;i<sl.length;i++)sl[i].firstChild.src=ic(pick(pool),72);SND.tick();}
    setTimeout(spin,calm?120:Math.min(160,70+now/30));}; // к концу рулетка замедляется
  setTimeout(spin,80);}
// касание птицы всегда радует (аудит 14): перо даром — 3 с неуязвимости после окна; три больших дара — за рекламу, по желанию
function openGift(){const g0=G,H=G.hero;H.inv=Math.max(H.inv,3);G.q.feather=(G.q.feather||0)+1;
  if(!adOk()){G.paused=false;toast(L('✨ Перо Жар\u2011птицы: 3 секунды неуязвимости!','✨ A Firebird feather: 3 seconds of invulnerability!'));return;} // рекламы нет — только перо, без окна
  YG.stop();guardModal();
  const ad='<small class="adl">'+L('🎬 за рекламу','🎬 for an ad')+'</small>';
  showModal('<h3>'+L('Жар-птица!','Firebird!')+'</h3><p class="sub">'+L('✨ Перо Жар\u2011птицы — даром: 3 секунды неуязвимости.','✨ A Firebird feather — free: 3 seconds of invulnerability.')+'</p>'+
    '<div class="btns" style="margin-top:0"><button class="btn gold big" id="gNo">'+L('✨ Взять перо и лететь дальше','✨ Take the feather and carry on')+'</button></div>'+
    '<p class="sub" style="margin:12px 0 0">'+L('А за просмотр рекламы — дар побольше (по желанию):','Or watch an ad for a bigger gift (optional):')+'</p><div class="cards giftc">'+
    '<button class="upc" data-g="chest"><img src="'+ic('chest',104)+'"><div><b>'+L('Сундук умений','Skill chest')+'</b><span>'+L('Два новых умения сразу','Two new skills at once')+'</span>'+ad+'</div></button>'+
    '<button class="upc" data-g="gold"><img src="'+ic('p_coin',104)+'"><div><b>'+L('Золотой поход','Golden run')+'</b><span>'+L('×2 золота до конца похода','×2 gold for the rest of the run')+'</span>'+ad+'</div></button>'+
    (G.wk.noHeal?'':'<button class="upc" data-g="heal"><img src="'+ic('p_livew',104)+'"><div><b>'+L('Живая вода','Water of Life')+'</b><span>'+L('Полное здоровье и 5 секунд неуязвимости','Full health and 5 seconds of invulnerability')+'</span>'+ad+'</div></button>')+
    '</div>','gift');
  const done=()=>{hideModal();G.paused=false;YG.start();};
  STAT.offer('bird');for(const b of document.querySelectorAll('[data-g]'))b.onclick=()=>{const k=b.dataset.g;STAT.place('bird_'+k);showRewarded(()=>{
    if(k==='chest'){rollCards(2).forEach(applyCard);toast(L('Два умения получены!','Two skills gained!'));}
    if(k==='gold'){G.goldMul=2;toast(L('Золото ×2 до конца похода!','Gold ×2 for the rest of the run!'));}
    if(k==='heal'){G.hero.hp=G.st.maxHp;G.hero.inv=5;toast(L('Как новенький!','Good as new!'));}
    SND.chest();done();},null,
    ()=>{if(G!==g0||G.over)return adLateGold(); // adt: поход кончился — золото; идёт — дар выдаём (своё окно птицы, если ещё открыто, закрываем)
      let m='';if(k==='chest'){rollCards(2).forEach(applyCard);m=L('два умения от Жар\u2011птицы','two skills from the Firebird');}
      if(k==='gold'){if(G.goldMul>=2)return adLateGold();G.goldMul=2;m=L('золото ×2 до конца похода','gold ×2 for the rest of the run');}
      if(k==='heal'){G.hero.hp=G.st.maxHp;G.hero.inv=Math.max(G.hero.inv,5);m=L('живая вода: полное здоровье','Water of Life: full health');}
      SND.chest();if(modalHas(b))done();return m;});};
  on('gNo',done);}
function openDeath(){const g0=G;SND.lose();const k=G.lastBy&&EN[G.lastBy]?G.lastBy:null,free=G.first&&G.adRevive; // первый поход: подняться — бесплатно
  showModal('<h3>'+L('Богатырь пал…','The hero has fallen…')+'</h3>'+(k?'<div class="killer"><img src="'+ic(k,120)+'"><span>'+L('Кто одолел: ','Defeated by: ')+'<b>'+EN[k].n+'</b><br><small>'+pick(L(['Радуется, пляшет и хвастается.','Уже рассказывает всем в лесу.','Не зазнавайся, нечисть!'],['Now it’s dancing and bragging.','Already telling the whole forest.','Don’t get cocky, monster!']))+'</small></span></div>':'<p class="sub">'+L('Нечисть радуется.','The monsters rejoice.')+'</p>')+
    '<p class="sub">'+L('Но ещё не всё потеряно!','But all is not lost!')+'</p><div class="stats"><div><b>'+fmtTime(G.t)+'</b>'+L('время','time')+'</div><div><b>'+G.kills+'</b>'+L('одолено','defeated')+'</div></div><div class="btns">'+
    (free?'<button class="btn big" id="dFree">'+L('💪 Подняться (бесплатно, один раз)','💪 Get up (free, once)')+'</button>':G.adRevive&&adOk()?'<button class="btn ad big" id="dRev">'+L('🎬 Подняться за рекламу','🎬 Get up for an ad')+'</button>':'')+'<button class="btn ghost" id="dEnd">'+L('Завершить поход','End the run')+'</button></div>','death');
  on('dFree',()=>{G.adRevive=false;hideModal();revive();});
  onAd('dRev','revive',()=>showRewarded(()=>{G.adRevive=false;hideModal();revive();},null,()=>{if(G!==g0||G.over||!G.adRevive||!modalHas($('dRev')))return adLateGold(); // adt: поднять можно только в том же походе, пока открыто окно гибели; иначе золото
    G.adRevive=false;hideModal();revive();return L('богатырь поднялся','the hero is back on his feet');}));on('dEnd',()=>{hideModal();endRun(false);});}
// совет после поражения — самый полезный из подходящих
function lossTip(){if(S.village.forge&&G.lastBy&&EN[G.lastBy]&&EN[G.lastBy].ranged)return L('Стрелков видно по летящим огонькам: уходи от снарядов в сторону и не стой на месте.','Shooters give themselves away: step aside from their shots and keep moving.');
  if(!S.village.forge)return L('Построй кузницу в деревне — прокачка остаётся навсегда.','Build the Forge in the village — upgrades stay forever.');
  if((S.forge.hp||0)+(S.forge.armor||0)<3)return L('Прокачай в кузнице «Здоровье» и «Броню» — нечисти станет труднее.','Upgrade '+qt(FORGE[0].name)+' and '+qt(FORGE[2].name)+' in the Forge — make the monsters work for it.');
  if(!Object.keys(G.pas).length)return L('Бери обереги: Кольчуга и Молодильное яблоко спасают шкуру.','Take charms: '+PASSIVES.mail.name+' and '+PASSIVES.apple.name+' save your hide.');
  if(G.weapons.length<3)return L('Возьми второе и третье оружие — одним мечом толпу не удержать.','Take a second and third weapon — one sword can’t hold back a horde.');
  if(chTier(G.chi)>=4&&!Object.keys(S.armory).length)return L('Загляни в Оружейную в кузнице: +4,5% урона за каждый уровень.','Visit the Armory in the Forge: +4.5% damage per level.');
  return pick(L(['Кружи вокруг толпы и не стой на месте — нечисть сама лезет под удар.','Качай оружие до 5-го уровня и бери нужный оберег — будет эволюция.','Поднимай звание богатыря — дар станет сильнее и чаще.'],['Circle the crowd and keep moving — monsters walk right into your blows.','Level a weapon to 5 and take the right charm — you’ll get an evolution.','Raise your hero’s rank — the Power gets stronger and more frequent.']));}
/* итоги (boost): «Дальше» — одна ясная цель следующего похода, «Завтра» — зачем вернуться. Только факты из сохранения, наград не обещаем сверх тех, что есть */
function nextGoal(win,loss){
  if(!S.done[0])return L('одолей босса главы — '+EN[CH[0].boss].n+' приходит на '+fmtTime(FIRST.boss)+'. За победу — новый богатырь и глава 2.','beat the chapter boss — '+EN[CH[0].boss].n+' arrives at '+fmtTime(FIRST.boss)+'. Victory unlocks a new hero and chapter 2.');
  if(loss&&!Object.keys(S.evoSeen||{}).length)return L('собери первую эволюцию — оружие 5-го уровня + его оберег (карточки с 🔥).','get your first evolution — a level 5 weapon + its charm (cards marked 🔥).');
  const i=ORD.find(s=>!S.done[s]);
  if(i!=null){const h=HEROES.find(q=>q.unlock===i);return h?L('освободи «'+CH[i].name+'» — к тебе придёт '+h.name+'.','free '+CH[i].name+' — '+h.name+' will join you.'):L('освободи «'+CH[i].name+'» — босс '+EN[CH[i].boss].n+'.','free '+CH[i].name+' — boss: '+EN[CH[i].boss].n+'.');}
  return (S.curseMax||0)<5?L('победи в Тридевятом царстве на самом сильном проклятии — откроется следующее.','win in the Thrice-Nine Kingdom on your strongest curse to unlock the next one.'):L('побей свой рекорд в Бесконечной сече: '+fmtTime(S.endBest||0)+'.','beat your Endless Battle record: '+fmtTime(S.endBest||0)+'.');}
function tomorrowLine(short){const ls=loginState(),n=ls.n%7+1,r=loginReward(n),a=[L('день '+n+' входа — ','login day '+n+' — ')+rewardText(r)];
  if(S.village.mill)a.push(L('казна накопит до '+fmtNum(Math.round(afkRate()*afkCapH())),'the treasury will hold up to '+fmtNum(Math.round(afkRate()*afkCapH()))));
  a.push(L('новые задания и сундук дня','new quests and the daily chest'));if(n<7&&typeof loginReward(7)==='string')a.push(L('на 7-й день — облик богатыря','day 7 — a hero outfit'));
  return a.slice(0,short?2:3).join(' · ');}
function goalBox(win,loss){return '<div class="goalbox"><div><b>'+L('🎯 Дальше:','🎯 Next:')+'</b> '+nextGoal(win,loss)+'</div><div><b>'+L('📅 Завтра:','📅 Tomorrow:')+'</b> '+tomorrowLine(loss)+'</div></div>';}
// поражение в главе: сколько прошёл до босса (или сколько осталось боссу) — «ты был близко»
function lossBar(){const bl=G.bossLeft,B=EN[G.ch.boss].n,BT=bossT(),t=Math.min(G.t,BT),q=bl!=null?1-bl:clamp(t/BT,0,1),rec=G.t>(G.prevBest||0)&&(G.prevBest||0)>0;
  return '<div class="prog"><div class="bar"><i style="width:'+Math.max(3,Math.round(q*100))+'%"></i></div><span>'+
    (bl!=null?L('Босс '+B+' был близко: ему оставалось '+Math.max(1,Math.round(bl*100))+'% здоровья.','The boss '+B+' was close: '+Math.max(1,Math.round(bl*100))+'% health left.')
      :L('Пройдено '+fmtTime(t)+' из '+fmtTime(BT)+' — до босса '+fmtTime(BT-t)+'.','Survived '+fmtTime(t)+' of '+fmtTime(BT)+' — '+fmtTime(BT-t)+' to the boss.'))+
    (rec?L(' Это твой новый рекорд главы!',' That’s your new chapter record!'):'')+'</span>'+
    (S.pity&&S.pity.c===G.chi?'<span class="spirit">'+L('💪 Боевой дух: в следующий раз здесь ты сильнее на '+Math.round(PITY_MIGHT*S.pity.n*100)+'%, нечисть слабее на '+Math.round(PITY_STEP*S.pity.n*100)+'%.','💪 Fighting spirit: next time here you hit '+Math.round(PITY_MIGHT*S.pity.n*100)+'% harder, monsters '+Math.round(PITY_STEP*S.pity.n*100)+'% weaker.')+'</span>':'')+'</div>';}
function openResult(win){const GE=G.endless||!!G.daily; // поход дня: как сеча — глава не освобождается, «дальше» нет
  // после поражения в главе реклама даёт ×3 (27.09, аудит 12): там золота мало, а помощь нужнее
  const R=G.reward,rw=G.rw||{},XM=!win&&!GE?3:2,runT=G.t;let doubled=false,taken=false;const firstWin=win&&!GE&&!S['seen'+G.chi];if(win&&!GE)S['seen'+G.chi]=1;
  const newHero=firstWin?HEROES.find(h=>h.unlock===G.chi):null;if(newHero)S.heroNew=1;const nxS=win&&!GE?chNext(G.chi):-1,next=nxS>=0?CH[nxS]:null; /* M2: следующая по ORD */
  const skinsNew=(G.achNew||[]).filter(a=>typeof a.r==='string'),achGold=(G.achNew||[]).filter(a=>typeof a.r!=='string');
  const big=(img,t,s)=>'<div class="unlock"><img src="'+img+'"><div><b>'+t+'</b><span>'+s+'</span></div></div>';
  const forgeFirst=!S.village.forge&&!GE; // кузницы нет — главный шаг после похода: построить её
  // VK: одно предложение «Друзья и игры» (модуль SOC: со 2-й сессии, отказ → 30 дней, ≤3 раз) — ПОД кнопками итогов, только после победы в главе
  let more=false;const lowScr=window.innerHeight<620,tipL=!win&&!GE?lossTip():''; // «Подробнее» в итогах раскрыто; на низком экране совет после поражения — тоже там
  /* ntf (06.10): вопрос рассказчика про напоминания VK идёт тем же путём (SOC.offer вернёт k:'ntf') и ставится в окно СРАЗУ при открытии — см. socPick ниже */
  const socBusy=Date.now()-ADV.last<60000||adShowing||adBusy||interPeek(runT),socFull=!!newHero||forgeFirst||skinsNew.length>0||(G.difUp==='s'&&G.chi===campLast());
  let soc=null,socUsed=false,rc=false; /* rc — плотный вид окна (как на низком экране), когда иначе вопрос про напоминания не влезает */
  const draw=()=>{const cur=doubled?R*XM:R,loss=!win&&!GE,k=G.lastBy&&EN[G.lastBy]?G.lastBy:null;
    const title=G.daily?(G.newRec?L('🏆 Лучший поход дня!','🏆 Best run of the day!'):L('Поход дня окончен','Daily Run over')):G.weekly?(G.newRec?L('🏆 Рекорд недели!','🏆 Week record!'):L('Испытание окончено','Trial over')):G.endless?(G.newRec?L('🏆 Новый рекорд!','🏆 New record!'):L('Сеча окончена','Battle over')):win?L('🎉 Победа! 🎉','🎉 Victory! 🎉'):L('Поход окончен','Run over');
    const sub=G.daily?L('Очки: ','Score: ')+fmtNum(G.drScore)+L(' · лучшие сегодня ',' · best today ')+fmtNum(drMine().best):G.weekly?weekly().name+L(': время ',': time ')+fmtTime(G.t)+L(' · рекорд недели ',' · week record ')+fmtTime(wkMine().best):G.endless?L('Время ','Time ')+fmtTime(G.t)+L(', боссов повержено: ',', bosses beaten: ')+(G.bossesKilled||0)+L(' · рекорд ',' · record ')+fmtTime(S.endBest):win?L('Земля «'+G.ch.name+'» освобождена!',G.ch.name+' is free!'):L('Золото из похода остаётся с тобой','You keep the gold from this run');
    const parts=[['coins',L('подобрано','picked up')],['kills',L('за нечисть','monsters')],['time',L('за время','time')],['boss',G.endless?L('за боссов','bosses'):L('за босса','boss')],['loot',L('🎁 добыча','🎁 loot')]].filter(([k2])=>rw[k2]>0).map(([k2,n])=>'<span>'+n+' <b>+'+fmtNum(rw[k2]*(doubled?XM:1))+'</b></span>').join('');
    showModal((win&&!GE?'<div class="confetti">'+Array.from({length:14},(_,i)=>'<i style="left:'+(i*7+3)+'%;animation-delay:'+(i%5*.25)+'s;background:'+['#ffd84a','#ff6a3d','#6ae0ff','#8af0a0','#b86bff'][i%5]+'"></i>').join('')+'</div>':'')+
      '<h3>'+title+'</h3><p class="sub">'+sub+'</p>'+
      // вид (look1): главное крупно — звёзды, три цифры, золото, открытия; остальные строки — под «Подробнее»
      (win&&!GE?(()=>{const p=DIF_PRE[G.dif]||'',miss=!S.stars[G.chi+p+'d']?L('без единого падения','without falling once'):!S.stars[G.chi+p+'t']?L('быстрее '+fmtTime(STAR_T),'faster than '+fmtTime(STAR_T)):'';return '<div class="rstars">'+(G.dif!=='n'?'<b class="difb">'+difName(G.dif)+'</b> ':'')+'<i class="stars">'+starsHTML3(G.chi,G.dif)+'</i><small>'+(miss?L('ещё звезда — за победу ','one more star for a win ')+miss:L('все три звезды главы!','all three chapter stars!'))+'</small></div>';})():'')+
      '<div class="stats s3"><div><b>'+fmtTime(G.t)+'</b>'+L('время','time')+'</div><div><b>'+G.kills+'</b>'+L('одолено','defeated')+'</div><div><b>'+G.hero.lvl+'</b>'+L('уровень','level')+'</div></div>'+
      '<div class="goldrow"><img src="'+ic('coin',68)+'" alt=""><b>'+fmtNum(cur)+'</b><small>'+L('золота <br>за поход','gold <br>this run')+'</small></div>'+
      (loss?lossBar():'')+
      (G.mbDone&&EN[G.mbDone]?'<p class="sub">⚔ '+L('Мини-босс одолён: ','Mini-boss defeated: ')+'<b>'+EN[G.mbDone].n+'</b></p>':'')+(G.metaHtml||'')+ /* M3: мини-босс; строка меты (META_END кладёт G.metaHtml) */
      (win&&!GE&&G.difUp==='s'&&G.chi===campLast()?'<div class="tutbox difbox difnext"><b>'+L('🏆 Кампания пройдена! Дальше — ⚔ Сложная','🏆 Campaign complete! Next: ⚔ Hard')+'</b><br>'+
        L('Во всех пройденных главах открыта Сложная: нечисть сильнее, без поблажек — как настоящая былина. Свои звёзды и значки, золота ×'+dec(ECO.dif.s,1)+', а после победы в «'+CH[CURSE_CH].name+'» на Сложной — проклятия (ещё больше золота). Без кузницы там не обойтись!',
          'Hard is now open in every chapter you\'ve cleared: stronger monsters, no mercy. Its own stars and badges, gold ×'+ECO.dif.s+', and beating '+CH[CURSE_CH].name+' on Hard unlocks curses (even more gold). You\'ll need the Forge!')+
        '<button class="btn" id="rHard" style="margin-top:10px;width:100%">'+L('⚔ Попробовать Сложную — с главы 1','⚔ Try Hard — from Chapter 1')+'</button></div>':'')+
      (win&&!GE&&G.difUp&&!forgeFirst&&!(G.difUp==='s'&&G.chi===campLast())?'<div class="tutbox difbox"><b>'+(G.difUp==='s'?L('⚔ В этой главе открыта Сложная','⚔ Hard is now open in this chapter'):L('🔥 В этой главе открыта Адская','🔥 Hell is now open in this chapter'))+'</b><br>'+difNote(G.difUp)+'<button class="btn ghost" id="rUp" style="margin-top:8px;width:100%">'+(G.difUp==='s'?L('⚔ Выбрать сложную','⚔ Pick Hard'):L('🔥 Выбрать адскую','🔥 Pick Hell'))+'</button></div>':'')+(G.nbGold?big(ic('chest',160),L('Подъёмные от старосты: +'+G.nbGold+' золота','A gift from the village elder: +'+G.nbGold+' gold'),L('Хватит на кузницу и первую ковку — прокачка остаётся навсегда.','Enough for the Forge and your first upgrades — they last forever.')):'')+
      (loss&&k?'<div class="killer"><img src="'+ic(k,120)+'"><span>'+L('Кто одолел: ','Defeated by: ')+'<b>'+EN[k].n+'</b>'+(lowScr?'':'<br><small>💡 '+tipL+'</small>')+'</span></div>':loss&&!lowScr?'<div class="tutbox">💡 '+tipL+'</div>':'')+
      (newHero?big(ic('hp_'+newHero.id,160),L('Новый богатырь!','New hero!'),newHero.name+L(' теперь с тобой. Дар: ',' has joined you. Power: ')+newHero.dar.name):'')+
      skinsNew.map(a=>big(ic('hp_'+a.r,160),L('Новый облик!','New outfit!'),qt(skinName(a.r))+' — '+a.name)).join('')+
      (next&&firstWin?big(ic(next.boss,160),L('Открыта глава ','Chapter ')+chPos(nxS)+L('!',' unlocked!'),next.name+(G.chi===0?L(' · и ⚔️ Бесконечная сеча — все главы по кругу',' · and ⚔️ Endless Battle — all chapters in a loop'):' — '+next.sub)):'')+
      (()=>{const det=(loss&&lowScr?'<div class="tutbox">💡 '+tipL+'</div>':'')+(parts&&!loss?'<div class="rwparts">'+parts+'</div>':'')+
      (achGold.length?'<div class="qdone" style="color:#ffd98a">🏆 '+achGold.map(a=>a.name).join(', ')+': +'+fmtNum(achGold.reduce((q,a)=>q+a.r,0))+goldW()+'</div>':'')+
      (G.drGold?'<div class="qdone" style="color:#ffd98a">'+L('🎁 Награда за поход дня: +'+fmtNum(G.drGold)+' золота (уже у тебя)','🎁 Daily Run reward: +'+fmtNum(G.drGold)+' gold (already yours)')+'</div>':'')+(G.wkReward?'<div class="qdone" style="color:#ffd98a">'+L('🏆 Награда за испытание недели: +'+fmtNum(G.wkReward)+' золота (уже у тебя)','🏆 Weekly Trial reward: +'+fmtNum(G.wkReward)+' gold (already yours)')+'</div>':'')+
      (G.bestNew&&G.bestNew.length&&!(G.questDone&&G.questDone.length)?'<div class="qdone" style="color:#bfe0ff">'+L('📖 В Книгу нечисти записано: ','📖 Added to the Bestiary: ')+G.bestNew.slice(0,3).map(bestName).join(', ')+(G.bestNew.length>3?L(' и ещё ',' and ')+(G.bestNew.length-3)+L('',' more'):'')+'</div>':'')+
      (G.curseUp?'<div class="qdone" style="color:#ff9aa8">'+L('☠ Открыто: ','☠ Unlocked: ')+CURSES[G.curseUp]+L(' — нечисть сильнее, золота больше',' — stronger monsters, more gold')+'</div>':'')+
      (G.questDone&&G.questDone.length?(G.questDone.length===1&&!(G.bestNew&&G.bestNew.length)?'<div class="qdone">'+L('✓ Задание выполнено: ','✓ Quest complete: ')+G.questDone[0]+'</div>':
        '<div class="qdone">'+L('✓ Заданий выполнено: ','✓ Quests complete: ')+G.questDone.length+(G.bestNew&&G.bestNew.length?' · <span style="color:#bfe0ff">📖 +'+G.bestNew.length+L(' в Книгу нечисти',' to the Bestiary')+'</span>':'')+'</div>'):'')+
      (!doubled&&R>=ECO.x2min&&(()=>{const u=cheapestIn(upList(),S.gold,S.gold+(XM-1)*R);return u?'<div class="qdone" style="color:#ffd98a">'+L('🎬 С ×'+XM+' хватит на ','🎬 With ×'+XM+' you can afford ')+qt(u.n.length>24?u.n.slice(0,22)+'…':u.n)+' ('+fmtNum(u.c)+')</div>':'';})()||'')+
      (loginState().ready&&S.runs>1?'<div class="qdone" style="color:#bfe0ff">'+L('🎁 Награда за вход ждёт — «Дела на сегодня» на карте','🎁 Your login reward is waiting — “Today’s to-do” on the map')+'</div>':'')+
      (GE?'':goalBox(win,loss))+
      (forgeFirst&&!loss?'<div class="tutbox">'+L('💡 Золото — в кузницу: там прокачка остаётся навсегда, и следующая глава пойдёт легче.','💡 Take your gold to the Forge: upgrades there last forever, and the next chapter gets easier.')+'</div>':'');
      return det?'<button class="morebtn" id="rMore">'+(more?L('Скрыть подробности ▴','Hide details ▴'):L('Подробнее ▾','Details ▾'))+'</button>'+(more?'<div class="rmore">'+det+'</div>':''):'';})()+
      // кнопки прижаты к низу окна (видны без прокрутки); главная — бесплатная, «×2/×3 за рекламу» — вторая (аудит 14)
      '<div class="btns stick">'+
      (forgeFirst?'<button class="btn gold big" id="rForge">'+L('Забрать ','Collect ')+fmtNum(cur)+' · '+(S.gold>=BLD[0].cost[0]?L('Построить кузницу','Build the Forge'):L('В деревню','To the village'))+' ➜</button>':
      next?'<button class="btn big" id="rNext">'+L('Забрать ','Collect ')+fmtNum(cur)+L(' · Дальше: ',' · Next: ')+next.name+' ➜</button>':'<button class="btn big" id="rOk">'+L('Забрать ','Collect ')+fmtNum(cur)+'</button>')+
      (doubled||R<ECO.x2min||!adOk()?'':'<button class="btn ad" id="rX2">'+L('🎬 Забрать ×'+XM+' ('+fmtNum(R*XM)+') за рекламу','🎬 Collect ×'+XM+' ('+fmtNum(R*XM)+') for an ad')+'</button>')+
      (forgeFirst&&next?'<button class="btn ghost" id="rNext">'+L('Дальше: ','Next: ')+next.name+'</button>':'')+
      (G.daily&&(PLAT==='vk'?!!VK&&!OK:LB.ok())?'<button class="btn gold" id="rLb">🏆 '+(PLAT==='vk'?'Таблица друзей':L('Рейтинг дня','Daily leaderboard'))+'</button>':'')+'</div>'+ // i18n:ru — только VK (там всегда русский)
      (soc&&!socUsed?'<div class="socof'+(soc.k==='ntf'?' ntf':'')+'" id="rSocBox"><p>'+soc.t+'</p><button class="btn ghost" id="rSoc">'+soc.b+'</button></div>':''),'result');
    $('mBody').classList.toggle('rc',rc);
    on('rMore',()=>{more=!more;draw();if(more){const m=$('rMore');if(m&&m.scrollIntoView)m.scrollIntoView();}});
    on('rSoc',()=>{socUsed=true;STAT.ev('mod',{m:'soc',a:'offer'});const b=$('rSocBox');if(b)b.remove();const r=soc.run();if(soc.k==='ntf')Promise.resolve(r).then(y=>{if(y&&soc.ok)toast(soc.ok);}).catch(()=>{});});
    onAd('rX2',XM===3?'x3':'x2',()=>showRewarded(()=>{if(taken||doubled)return;doubled=true;S.gold+=(XM-1)*R;ern('ad',(XM-1)*R);META_HK('X2',G,XM);save();SND.chest();draw();},null,()=>{if(doubled)return '';doubled=true;const a=(XM-1)*R;S.gold+=a;ern('ad',a);META_HK('X2',G,XM);save();SND.chest(); // adt: ×2/×3 — всегда, один раз, даже если итоги уже закрыты
      if(modalHas($('rX2'))&&!taken)draw();else lateRe();return L('золото похода ×'+XM+': +','run gold ×'+XM+': +')+fmtNum(a);}));
    const take=()=>{if(taken||adBusy)return false;taken=true;save();return true;}; // золото похода уже зачислено в endRun
    const after=win&&!GE?askReturn:null;
    // в меню; мягкая межэкранная — сразу после итогов, пока игрок ещё не в новом походе (правила — interReady в core.js)
    const go=(tab,aft)=>{const ad=interReady(runT);toMenu(tab,ad?null:aft);if(ad)showInterstitial();};
    on('rNext',()=>{if(!take())return;mapSel=nxS>=0?nxS:G.chi;go('Map',after);});
    on('rForge',()=>{if(!take())return;if(next)mapSel=nxS;go('Village');if(S.gold>=BLD[0].cost[0])toast(L('Хватает на кузницу — жми «'+fmtNum(BLD[0].cost[0])+'»!','Enough for the Forge — tap “'+fmtNum(BLD[0].cost[0])+'”!'));});
    on('rLb',()=>{if(PLAT==='vk'){LB.vkFriends();return;}if(!take())return;qSeg='q';lbSeg='daily';go('Quests');setTimeout(()=>{const b=$('lbBox');if(b)b.scrollIntoView({block:'center'});},80);});
    on('rOk',()=>{if(!take())return;go(S.village.forge||GE?'Map':'Village',after);});
    on('rHard',()=>{if(!take())return;S.dfc[0]='s';save();STAT.ev('mod',{m:'dif',a:'s',l:1,c:'camp'});mapSel=0;go('Map',()=>toast(L('⚔ Сложная выбрана в главе 1 — жми «Выступить»','⚔ Hard selected in Chapter 1 — tap “March”')));});
    on('rUp',()=>{if(!take())return;const ci=G.chi,k=G.difUp;S.dfc[ci]=k;save();STAT.ev('mod',{m:'dif',a:k,l:chPos(ci),c:'res'});mapSel=ci;go('Map',()=>toast(difName(k)+L(' — выбрана. Жми «Выступить»',' selected — tap “March”')));});};
  draw();
  /* предложение «Друзья и игры» под кнопками. Пока модуль хочет спросить про напоминания (SOC.ntfDue — показа не тратит), вопрос ставим только если
     окно с ним целиком влезает в экран (ничего не уезжает под край и не вытесняется) и в окне нет важного (новый богатырь, новый облик, «построй кузницу», «кампания пройдена»);
     не влезло / не к месту — в этом окне молчат и остальные предложения (иначе избранное съест «одно предложение за сеанс») */
  if(win&&!GE&&typeof SOC!=='undefined'){const m=$('mBody'),due=!socBusy&&(S.runs||0)>=3&&SOC.ntfDue();let fit=!due;
    const probe=()=>{m.insertAdjacentHTML('beforeend','<div class="socof ntf" id="rSocBox"><p>'+(ntfText(((S.soc&&S.soc.ntf&&+S.soc.ntf.n)||0)+1)||ntfText(3))+'</p><button class="btn ghost">'+L('🔔 Напоминать','🔔 Remind me')+'</button></div>');
      const y=m.scrollHeight<=m.clientHeight+1,pb=$('rSocBox');if(pb)pb.remove();return y;};
    if(due&&!socFull){fit=probe();if(!fit){rc=true;m.classList.add('rc');fit=probe();if(!fit){rc=false;m.classList.remove('rc');}}}
    if(fit)soc=SOC.offer(S.runs||0,socBusy);
    if(rc&&!(soc&&soc.k==='ntf'))rc=false;
    if(soc||m.classList.contains('rc')!==rc)draw();
    ntfPend=!(soc&&soc.k==='ntf')&&(S.runs||0)>=3&&SOC.ntfDue();} /* положен, но тут не показан → спросим в деревне (ntfVillage) */
  save();}
// ntf: три вопроса рассказчика про напоминания VK (n — какой показ по счёту; расписание 1/3/7-й день — в модуле SOC). Наград за разрешение нет
function ntfText(n){return n<=1?L('Завтра в деревне новые дела и награда за вход. Напомнить?','New quests and a login reward await tomorrow. Remind you?'):
  n===2?L('Каждый день в деревне новые задания. Напоминать о них?','There are new quests in the village every day. Remind you?'):
  L('Изредка буду звать в поход — когда нечисть осмелеет. Звать?','Now and then I’ll call you to a run when monsters grow bold. Shall I?');}
// после победы (с 3-го похода) — одно предложение за сессию: ярлык/оценка на Яндексе, избранное/экран/друзья в VK
async function askReturn(){if(ASK.session||S.runs<3||G)return;let o=null;try{o=await ASK.next();}catch(e){}if(!o||G||$('modal').classList.contains('on'))return;
  ASK.session=true;S.ask[o.k]=Date.now();save();
  showModal('<h3>'+L('Отличный поход!','Great run!')+'</h3><p class="sub" style="font-size:14px">'+o.t+'</p><div class="btns"><button class="btn big" id="askGo">'+o.b+'</button><button class="btn ghost" id="askNo">'+L('Не сейчас','Not now')+'</button></div>');
  on('askGo',()=>{hideModal();try{Promise.resolve(o.run()).catch(()=>{});}catch(e){}});on('askNo',hideModal);}
/* ---------- запуск ---------- */
// VK: облако пришло позже меню и оно новее — обновить экран
// 27.09 казна стала скромнее: уже накопленное по старой ставке не отнимаем — доплачиваем разницу один раз
function ecoMigrate(){if(S.eco>=2)return;S.eco=2;const v=S.village;if(!v.mill||!S.afkT)return;let lv=0;for(const k in v)lv+=v[k];
  const h=afkH(),old=Math.round((20+6*lv+30*(v.mill||0)+20*landsU())*(1+.25*(v.fair||0)));
  const d=Math.floor(h*old)-afkGold();if(d>0){S.gold+=d;ern('oth',d);}save();}
// облако пришло позже меню и оно добавило прогресс — обновить экран
function onCloud(){if(window.LOOK)LOOK.sync();if(G)return;gearRefresh();ecoMigrate();for(const i in S.done)if(CH[i])S.bossKill[CH[i].boss]=1;sndIcon();volApply();
  if(S.runs&&curTab==='Village'&&!firstGo)curTab='Map';openTab(curTab);if(S.runs)openToday(true);}
function onReady(){$('loading').style.display='none';STAT.once('ready',{ms:Math.round(performance.now())});gearRefresh();ecoMigrate();musicPlay('menu');for(const i in S.done)if(CH[i])S.bossKill[CH[i].boss]=1;openTab(S.runs?'Map':'Village');achCheck();
  if(!S.runs)firstStart();else setTimeout(()=>openToday(true),400);}
// новичок — сразу в первый поход (без деревни и меню). Облако ждём до 3 с: вдруг прогресс есть на другом устройстве
let firstGo=false;
function firstStart(){if(/[?&](bot|promo)\b/.test(location.search))return;const t0=Date.now(),tick=()=>{if(G||S.runs)return;if(cloudReady||Date.now()-t0>3000){if(!$('modal').classList.contains('on')){firstGo=true;startRun(0);}return;}setTimeout(tick,150);};tick();}
(function boot(){cv=$('cv');ctx=cv.getContext('2d');initInput();layout();
  if(S.calm==null)S.calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?1:0; // «спокойный режим» по настройке телефона
  $('goldIc').src=ic('coin',48);$('nav1').src=ic('d_oak',60);$('nav2').src=ic('i_sword',60);$('nav3').src=ic('i_mace',60);$('nav4').src=ic('hp_dob',60);$('nav5').src=ic('chest',60);
  for(const b of document.querySelectorAll('nav button'))b.onclick=()=>{SND.click();openTab(b.dataset.tab);};
  sndIcon();$('sndBtn').onclick=()=>{SND.click();openSettings();};$('tipX').onclick=e=>{e.stopPropagation();tutSkip();toast(L('Обучение пропущено. Удачи, богатырь!','Tutorial skipped. Good luck, hero!'));};
  // звук разрешается жестом: на сенсорных экранах жест — это touchend/click, а не pointerdown (iOS < 15)
  for(const ev of['pointerdown','touchend','click','keydown'])document.addEventListener(ev,()=>{if(!muted)ac();},{capture:true,passive:true});
  // долгий тап / правый клик не открывают меню браузера (требование площадок); щипок на iOS не увеличивает страницу
  document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('dragstart',e=>e.preventDefault());document.addEventListener('gesturestart',e=>e.preventDefault());
  $('pauseBtn').onclick=()=>{SND.click();togglePause();};
  const onResize=()=>{layout();if(!G){if(curTab==='Village')drawVillage();if(curTab==='Map'){if(renderMap.wide!==isWide())renderMap();else drawMap();}}};
  window.addEventListener('resize',onResize);window.addEventListener('orientationchange',()=>setTimeout(onResize,300)); // iOS иногда отдаёт старые размеры в resize
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(G&&!G.over&&!G.paused&&!$('modal').classList.contains('on'))togglePause(); // вернулся — «Привал», а не сразу в толпу
    paused=true;setMuted(true);cloudFlush();}else if(!adShowing){paused=false;setMuted(false);}});
  // клавиатура (ПК): 1–4 — выбрать карточку умения, Enter — в поход с карты
  window.addEventListener('keydown',e=>{const m=$('modal').classList.contains('on');
    if(m&&/^Digit[1-4]$/.test(e.code)){const b=document.querySelector('.upc[data-i="'+(+e.code.slice(5)-1)+'"]');if(b&&b.onclick){e.preventDefault();b.click();}}
    else if(!m&&!G&&e.code==='Enter'&&curTab==='Map'){e.preventDefault();startRun(mapSel);}});
  const QS=new URLSearchParams(location.search);if(QS.has('demo'))window.__demo=1;
  if(QS.has('bot')){const b=document.createElement('script');b.src='tools/bot.js';document.head.appendChild(b);}
  if(QS.has('promo')){const b=document.createElement('script');b.src='tools/promo.js';document.head.appendChild(b);} // картинки для магазина (только локально)
  // «Друзья и игры» (общий модуль SOC в core.js; только VK с мостом): сессии, кнопка 🎲, строка в ⚙
  SOC.init(S,{save:()=>save(),toast:t=>toast(t),cls:'btn ghost',modal:h=>{showModal(h);return $('mBody');},close:()=>hideModal(),okLink:OK_LINK,
    now:()=>nowMs(),ntf:{t:n=>ntfText(n),b:L('🔔 Напоминать','🔔 Remind me'),ok:L('Уговор! Попусту тревожить не стану.','Deal! I won’t bother you for nothing.'),s:L('🔔 Включить напоминания','🔔 Turn on reminders')}}); /* ntf: разрешение на напоминания VK (SOC v2.4) — вопрос в итогах победы, см. openResult */
  $('moreBtn').onclick=()=>{SND.click();STAT.ev('mod',{m:'soc',a:'more'});SOC.showMore();};updMore();
  requestAnimationFrame(loop);
  onReady(); // меню — сразу, не дожидаясь SDK и облака (и в Яндексе, и в VK)
  if(PLAT==='vk'){initSDK();return;} // VK: мост грузится внутри initSDK
  const s=document.createElement('script');s.src='/sdk.js';s.async=true;let sdkGo=false;const go=()=>{if(sdkGo)return;sdkGo=true;initSDK();};s.onload=s.onerror=go;setTimeout(go,20000);document.head.appendChild(s);})(); // ждём SDK до 20 с
window.__test={startRun,update:dt=>update(dt),render:()=>render(),get G(){return G;},S:()=>S,layout};
