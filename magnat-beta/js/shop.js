/* ================= «🛒 Магазин» — единое окно всех покупок и наград (M28, 01.10) =================
   window.SHOP = {open(sec), buy(id), items(), secs()}; openShop(sec) из shell.js теперь ведёт сюда (кнопка 💎 в шапке, ⚙ → Магазин,
   «Не хватает кристаллов», «Пока вас не было»). Разделы: cr «💎 Кристаллы», pack «⭐ Наборы», look «🎨 Оформление»,
   boost «🚀 Ускорения за 💎», ads «📺 Бесплатно за рекламу» (только при adOk()), ach «🏆 За достижения».
   Покупка — только SHOP.buy(id) → PAY.buy(id) (общий модуль, те же проверки: каталог, занятость, «уже куплено»); цена — PAY.price (Яндекс — из
   getCatalog со значком валюты, VK — число голосов). Разметка — классами .shop-* (помощник по стилю может переоформить), цвета — общие переменные.
   Темы: window.THEME (js/themes.js) — THEME.list(), THEME.set(id), THEME.buy(id, после) для 💎/роликов; покупка за деньги — SHOP.buy(pay),
   после неё shell payAfter(id) → THEME.bought включает тему. Нет THEME — раздел показывает только строки товаров. */
(function(){
'use strict';
const T=(ru,en)=>L(ru,en),cr=n=>n+' 💎';
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const snd=k=>{try{(SND[k]||SND.tap)();}catch(e){}};
const $s=id=>document.getElementById(id);
const W=()=>window.GAME&&GAME.W||null;
const adOn=()=>{try{return typeof adOk==='function'&&adOk();}catch(e){return false;}};
const payOn=()=>typeof PAY!=='undefined'&&!!PAY.on;
const own=id=>typeof PAY!=='undefined'&&PAY.own(id);

const SECS=[
  {id:'cr',ic:'💎',tab:['Кристаллы','Crystals'],h:['Кристаллы','Crystals']},
  {id:'pack',ic:'⭐',tab:['Наборы','Bundles'],h:['Наборы и удобства','Bundles and perks']},
  {id:'look',ic:'🎨',tab:['Оформление','Looks'],h:['Оформление','Looks and themes']},
  {id:'boost',ic:'🚀',tab:['Ускорения','Boosts'],h:['Ускорения за 💎','Boosts for 💎']},
  {id:'ads',ic:'📺',tab:['За рекламу','For ads'],h:['Бесплатно за рекламу','Free for watching ads']},
  {id:'ach',ic:'🏆',tab:['Награды','Awards'],h:['За достижения','For achievements']}];
// раздел каждого товара за деньги (порядок — порядок в разделе); товара нет здесь — он в «Наборах»
const SEC={cr_xs:'cr',cr_s:'cr',cr_l:'cr',cr_xl:'cr',tea:'cr',
  kit1:'pack',starter:'pack',net_pack:'pack',nedra_pack:'pack',ipo_pack:'pack',bundle:'pack',magnat:'pack',pass:'pack',no_ads:'pack',sponsor:'pack',manager:'pack',
  th_poster:'look',office:'look',set90:'look',livery:'look',look_all:'look'};
const ONCE={starter:1,nedra_pack:1,kit1:1,net_pack:1,ipo_pack:1};                     // «один раз на игрока» (постоянные с бонусом, второй раз не купить)
const DAYS={pass:30};                                    // «на N дней»
// когда товар показывать: «спонсор» — только где есть ролики; стартовый — первые 10 дней (shell.js starterOn); набор недропользователя — с главы «Карьер»
// M36: «Рабочий набор» — главы 1–2, пока первая ступень сил не куплена (купленный виден всегда); «Набор сетевика» и «Магнат навсегда» — с «Сети»; «Колокол биржи» — с «Недр»
const stI=()=>{const w=W();if(!w)return 0;if(w.ned)return 4;try{return ECON.stI(w);}catch(e){return 0;}};
const SHOW={sponsor:()=>typeof adPlat==='function'&&adPlat(),starter:()=>typeof starterOn!=='function'||starterOn(),nedra_pack:()=>{const w=W();return !!w&&(w.ned||w.st==='quarry'||w.st==='nedra');},
  kit1:()=>{if(own('kit1'))return true;const w=W();return !!(w&&w.me&&!w.ned&&stI()<=1&&GAME.enLv&&GAME.enLv()<1);},
  net_pack:()=>own('net_pack')||stI()>=2,magnat:()=>own('magnat')||stI()>=2,ipo_pack:()=>own('ipo_pack')||stI()>=4};
function kindOf(id){const it=PAY_ITEMS[id];if(!it)return '';if(DAYS[id])return 'days';if(ONCE[id])return 'once';return it.perm?'perm':'cons';}
function kindTxt(k,id){switch(k){
  case 'perm':return T('Навсегда','Forever');
  case 'once':return T('Один раз','One time only');
  case 'days':return T('На '+DAYS[id]+' дней: посылка в день','For '+DAYS[id]+' days: a parcel a day');
  default:return T('Разово · можно купить ещё','One-off · can buy again');}}
function secOf(id){return SEC[id]||'pack';}
function visible(id){if(!PAY_ITEMS[id]||!payOn()||!PAY.item(id))return false;const f=SHOW[id];try{return f?!!f():true;}catch(e){return false;}}
function priceOf(id){try{const pr=PAY.item(id);return pr?PAY.price(pr):'';}catch(e){return '';}}

/* ---- свой CSS (только окно магазина; цвета — переменные темы) ---- */
let cssOn=false;
function css(){if(cssOn)return;cssOn=true;const s=document.createElement('style');s.id='shopCss';s.textContent=`
#mcard.shop-card h2{margin-bottom:6px}
.shop-bal{text-align:center;font-size:18px;margin:0 0 10px}.shop-bal b{font-size:20px}
.shop-tabs{display:flex;flex-wrap:wrap;margin:0 0 10px}
.shop-tab{flex:1 1 30%;min-width:96px;min-height:52px;margin:3px;border-radius:14px;background:var(--soft);color:var(--ink2);font-size:16px;font-weight:500;padding:6px 6px;line-height:1.15;border:2px solid transparent}
.shop-tab b{display:block;font-size:20px;line-height:1.1}
.shop-tab.on{background:var(--accent-t,var(--soft2));color:var(--ink);border-color:var(--accent);font-weight:600}
.shop-sec h3{font-size:19px;margin:6px 0 4px;color:var(--ink)}
.shop-sec h4{font-size:17px;margin:14px 0 2px;color:var(--ink2);font-weight:600}
.shop-p{font-size:17px;margin:6px 0;color:var(--ink2)}
.shop-it{align-items:flex-start;flex-wrap:wrap;padding:12px 14px;min-height:64px}
.shop-it>span{flex:1 1 100%;min-width:0;padding-right:0;display:block}
.shop-it .shop-nm{display:block;font-size:18px;font-weight:600;color:var(--ink)}
.shop-it small{display:block;font-size:16px;margin-top:2px;line-height:1.3}
.shop-it>.shop-k{flex:0 1 auto;align-self:center;margin:8px 8px 0 0}
.shop-k{display:inline-block;margin-top:6px;font-style:normal;font-size:15px;font-weight:600;border-radius:999px;padding:3px 10px;background:var(--soft);color:var(--ink2)}
.shop-k.k-perm{background:var(--good-t,#ecfdf3);color:var(--good)}.shop-k.k-once{background:var(--warn-t,#fff4e5);color:var(--warn,#b54708)}
.shop-k.k-days{background:var(--accent-t,#eef2ff);color:var(--accent)}
.shop-k.k-best{background:var(--warn-t,#fff4e5);color:var(--warn,#b54708);margin-left:6px}.shop-k.k-hl{background:var(--good);color:#fff;margin-left:6px}
.shop-it.shop-hl{border:3px solid var(--good)!important;box-shadow:0 0 0 3px var(--good-t,#e3f4ea)}
.shop-first{background:var(--good-t,#e3f4ea);color:var(--ink);border-radius:14px;padding:10px 14px;margin:4px 0 10px;font-size:17px;line-height:1.35;font-weight:600}
.shop-need{background:var(--soft2);border-radius:14px;padding:10px 14px;margin:4px 0 8px;font-size:17px}
.shop-pr{flex:none;align-self:flex-end;margin:8px 0 0 auto;max-width:100%;font-size:18px;font-weight:700;color:var(--accent);white-space:nowrap;background:var(--card);border:2px solid var(--accent);border-radius:14px;padding:8px 12px;min-width:76px;text-align:center}
.shop-pr img.pcur{height:18px;width:18px;vertical-align:-3px;margin-left:3px}
.shop-it.pown i{margin:8px 0 0 auto}
.shop-th .shop-pr{margin:0;align-self:center}
.shop-info{display:flex;align-items:center;justify-content:space-between;background:var(--soft2);border-radius:16px;padding:10px 14px;margin-top:8px;min-height:56px;font-size:17px;color:var(--ink)}
.shop-info>span{flex:1 1 auto;min-width:0;padding-right:10px}.shop-info small{display:block;font-size:16px;color:var(--muted);line-height:1.3}
.shop-info>b{flex:none;font-size:17px;white-space:nowrap}.shop-info>b.no{color:var(--muted);font-weight:500}
.shop-th{display:flex;align-items:center;background:var(--soft2);border-radius:16px;padding:10px 12px;margin-top:8px;min-height:64px;border:2px solid transparent}
.shop-th.on{border-color:var(--good)}
.shop-sw{flex:none;width:52px;height:52px;border-radius:12px;margin-right:12px;border:1px solid var(--line2,#d0d5dd);overflow:hidden;display:block}
.shop-th>span{flex:1 1 auto;min-width:0;font-size:18px;font-weight:600;color:var(--ink);padding-right:8px}.shop-th>span small{display:block;font-size:16px;font-weight:400;color:var(--muted)}
.shop-th .btn{flex:none;width:auto;min-width:0;min-height:48px;margin:0;padding:8px 14px;font-size:17px}
.shop-th>i{flex:none;font-style:normal;font-weight:600;color:var(--good);font-size:17px}
.shop-th .shop-pr{border-width:2px;cursor:pointer}
.shop-bar{display:block;height:8px;border-radius:8px;background:var(--track);overflow:hidden;margin:6px 0 2px}.shop-bar i{display:block;height:100%;background:var(--good);border-radius:8px}
.shop-more{margin-top:12px}.shop-more .btn{margin-top:8px}
.shop-note{font-size:16px;color:var(--muted);text-align:center;margin:10px 0 0}
`;document.head.appendChild(s);}

/* ---- строки товаров за деньги ---- */
// M36: цена товара числом для сравнения «💎 за рубль» (Яндекс — priceValue каталога, VK — голоса; на одной площадке шкала одна)
function priceNum(id){try{const pr=PAY.item(id);if(PAY.v)return PAY_ITEMS[id].vk||0;const v=parseFloat(String(pr&&pr.priceValue||'').replace(',','.'));return v>0?v:0;}catch(e){return 0;}}
// бейдж витрины (не больше одного на строке): «Хватит» (не хватает 💎), «Выгодно» (сейф, путёвка), «+N % к Горсти» (пакеты 💎 крупнее горсти)
const BEST={cr_xl:1,pass:1};
function badge(id){if(ctx.hl===id&&ctx.miss)return `<em class="shop-k k-hl">✓ ${T('Хватит','Enough')}</em>`;const it=PAY_ITEMS[id];
  let pc='';if(it.n&&SEC[id]==='cr'&&id!=='tea'&&id!=='cr_s'&&PAY_ITEMS.cr_s){const a=priceNum(id),b=priceNum('cr_s');if(a&&b){const x=Math.round((it.n/a)/(PAY_ITEMS.cr_s.n/b)*100-100);if(x>=5)pc='+'+x+T(' % к Горсти','% vs Handful');}}
  if(BEST[id])return `<em class="shop-k k-best">★ ${T('Выгодно','Best value')}${pc?' · '+pc:''}</em>`;
  return pc?`<em class="shop-k k-best">${pc}</em>`:'';}
function itemRow(id){const it=PAY_ITEMS[id],k=kindOf(id),mine=it.perm&&own(id);
  let sub=esc(it.desc);if(id==='starter'&&!mine&&typeof starterLeft==='function'){const n=starterLeft();if(n)sub+='<br><b>'+T('В магазине ещё '+n+' '+pl(n,'день','дня','дней','day','days'),'In the shop for '+n+' more '+pl(n,'день','дня','дней','day','days'))+'</b>';}
  const body=`<span><b class="shop-nm">${it.ic} ${esc(it.name)}</b><small>${sub}</small></span><em class="shop-k k-${k}">${esc(kindTxt(k,id))}</em>${mine?'':badge(id)}`;
  return mine?`<div class="set pown shop-it" data-pid="${esc(id)}">${body}<i>✓ ${T('Ваше','Yours')}</i></div>`
    :`<button class="set pbuy shop-it noenter${ctx.hl===id?' shop-hl':''}" data-pid="${esc(id)}">${body}<b class="shop-pr">${priceOf(id)}</b></button>`;}
// M36 (П1): подарок за первую покупку — строка вверху «Кристаллов» и «Наборов», пока игрок ничего не покупал (shell.js payPaid/payFirst)
function firstHtml(){try{if(!payOn()||typeof payPaid!=='function'||payPaid())return '';}catch(e){return '';}
  return `<div class="shop-first">🎁 ${T('Первая покупка — с подарком: +'+(typeof FIRST_CR!=='undefined'?FIRST_CR:50)+' 💎 и рамка «Меценат». Любая, даже самая маленькая.','Your first purchase comes with a gift: +'+(typeof FIRST_CR!=='undefined'?FIRST_CR:50)+' 💎 and the “Patron” frame. Any purchase, even the smallest.')}</div>`;}
// M36: самый маленький пакет 💎, которого хватит на недостающее (окно «Не хватает кристаллов» → магазин)
function hlFor(miss){if(!(miss>0))return '';const a=['cr_xs','cr_s','cr_l','cr_xl'].filter(id=>PAY_ITEMS[id]&&visible(id)).sort((x,y)=>PAY_ITEMS[x].n-PAY_ITEMS[y].n);
  const f=a.find(id=>PAY_ITEMS[id].n>=miss);return f||a[a.length-1]||'';}
function rowsOf(sec,skip){return Object.keys(PAY_ITEMS).filter(id=>secOf(id)===sec&&visible(id)&&!(skip&&skip[id])).sort((a,b)=>ord(a)-ord(b)).map(itemRow).join('');}
const ORD=Object.keys(SEC);const ord=id=>{const i=ORD.indexOf(id);return i<0?99:i;};
function restoreHtml(){return payOn()?`<div class="shop-more"><button class="btn w noenter" id="shRest">↻ ${T('Восстановить покупки','Restore purchases')}</button>
  <p class="shop-note">${T('Покупки «навсегда» хранятся в облаке и сами возвращаются на другом устройстве. Если чего-то нет — нажмите «Восстановить».','“Forever” purchases are kept in the cloud and come back by themselves on another device. If something is missing, tap “Restore”.')}</p></div>`:'';}
function ladBtn(){let lb='';try{lb=adOn()&&GAME.ladLabel?GAME.ladLabel():'';}catch(e){}
  if(lb)return `<button class="btn accent w noenter" id="shAd">${lb}</button>`;
  try{if(adOn()&&GAME.lad&&GAME.lad().n>=GAME.LAD.length)return `<p class="shop-note">${T('«Ролики дня» на сегодня пройдены — завтра лесенка начнётся заново','Today’s daily videos are done — the ladder starts again tomorrow')}</p>`;}catch(e){}
  return '';}

/* ---- разделы ---- */
function secCr(){let h=`<p class="shop-p">${T('Кристаллы ускоряют стройку и разведку, покупают время на дела, силы и украшения. Рубли в игре не продаются, место в рейтинге — тоже.','Crystals speed up construction and exploration and buy hands, energy and decorations. In-game rubles are not for sale, nor is a place in the leaderboard.')}</p>`;
  if(ctx.miss>0)h+=`<p class="shop-need">💎 ${T('Не хватает '+ctx.miss+' 💎'+(ctx.hl?' — подойдёт пакет, отмеченный «Хватит»':''),'You’re '+ctx.miss+' 💎 short'+(ctx.hl?' — the pack marked “Enough” will do':''))}</p>`;
  h+=firstHtml();const r=rowsOf('cr');h+=r;
  if(!r)h+=`<p class="shop-p">${T('Кристаллы даются за достижения, звания, Планёрку'+(adOn()?' и ролики':'')+' — загляните в соседние разделы.','Crystals come for achievements, ranks, the Briefing'+(adOn()?' and videos':'')+' — see the other sections.')}</p>`;
  const lb=ladBtn();if(lb)h+=`<div class="shop-more">${lb}</div>`;
  return h+restoreHtml();}
function secPack(){return firstHtml()+`<p class="shop-p">${T('Наборы выгоднее, чем по одному. «Навсегда» — платите один раз, и это ваше навсегда, без продлений.','Bundles are better value than single items. “Forever” means you pay once and it’s yours for good — no renewals.')}</p>`+rowsOf('pack')+restoreHtml();}

// темы оформления — js/themes.js: THEME.list() → [{id,name,prev:{bg,hd,card,ink,acc,acc2},unlock,owned,cur,progress:{have,need,txt},how}]
// тема внутри коллекции (k90 ← set90) продаётся строкой коллекции ниже — одна кнопка на товар
const COLL={set90:['Входит в коллекцию «Лихие 90-е» — ниже','Part of “The Wild 90s” collection — see below'],ipo_pack:['Входит в набор «Колокол биржи» — раздел «Наборы»','Part of the “Exchange bell” pack — see Bundles']};
function themes(){if(window.THEME&&typeof THEME.list==='function'){try{const a=THEME.list();if(Array.isArray(a))return a;}catch(e){console.error(e);}}return [];}
function swatch(p){if(!p||typeof p!=='object')return '<i class="shop-sw"></i>';
  return `<i class="shop-sw" style="background:linear-gradient(135deg,${esc(p.hd||p.bg)} 0,${esc(p.bg)} 34%,${esc(p.card)} 34%,${esc(p.card)} 66%,${esc(p.acc)} 66%,${esc(p.acc)} 83%,${esc(p.acc2||p.acc)} 83%)"></i>`;}
function themeRow(t){const u=t.unlock||{},pr=t.progress||{},nm=esc(t.name||T(t.ru,t.en));let side='',sub;
  const bar=!t.owned&&pr.need>1?`<span class="shop-bar"><i style="width:${Math.round(100*Math.min(1,(pr.have|0)/pr.need))}%"></i></span>`:'';
  if(t.owned){sub=t.cur?T('Сейчас включена','On now'):u.t==='free'?T('Основной вид','Default look'):T('Ваша — навсегда','Yours forever');
    side=t.cur?`<i>✓ ${T('Включена','On')}</i>`:`<button class="btn noenter shop-thset" data-thset="${esc(t.id)}">${T('Включить','Turn on')}</button>`;}
  else if(u.t==='pay'){if(COLL[u.pay])sub=T(COLL[u.pay][0],COLL[u.pay][1]);
    else{sub=T('Навсегда, только вид','Forever, just for looks');if(visible(u.pay))side=`<button class="shop-pr pbuy noenter" data-pid="${esc(u.pay)}">${priceOf(u.pay)}</button>`;}}
  else if(u.t==='cr'){sub=esc(t.how||'');side=`<button class="btn cr noenter shop-thbuy" data-thbuy="${esc(t.id)}"${(S.cr|0)<u.cr?' disabled':''}>${cr(u.cr)}</button>`;}
  else{sub=esc(t.how||'')+(pr.txt?'<br><b>'+esc(pr.txt)+'</b>':'');
    if(u.t==='ads'&&adOn())side=`<button class="btn noenter shop-thbuy" data-thbuy="${esc(t.id)}">📺 +1</button>`;}
  const pid=u.t==='pay'&&u.pay&&t.owned&&!COLL[u.pay]?` data-pid="${esc(u.pay)}"`:'';
  return `<div class="shop-th${t.cur?' on':''}${pid?' pown':''}${t.owned?'':' lock'}"${pid} data-th="${esc(t.id)}">${swatch(t.prev)}<span>${nm}<small>${sub}</small>${bar}</span>${side}</div>`;}
function secLook(){const ts=themes(),inTh={};for(const t of ts)if(t.unlock&&t.unlock.t==='pay'&&t.unlock.pay&&!COLL[t.unlock.pay])inTh[t.unlock.pay]=1;
  let h='';
  if(ts.length){h+=`<h4>🖌 ${T('Темы оформления','Themes')}</h4><p class="shop-p">${T('Меняют только цвета всей игры. Открытая тема — ваша навсегда, включать можно когда угодно.','They change only the colours of the whole game. An unlocked theme is yours forever — switch any time.')}</p>`;
    h+=ts.map(themeRow).join('');
    if(THEME.open)h+=`<div class="shop-more"><button class="btn w noenter" id="shThAll">🎨 ${T('Все темы с образцами','All themes with previews')}</button></div>`;}
  const r=rowsOf('look',inTh);if(r)h+=`<h4>🏷 ${T('Коллекции и наборы','Collections and sets')}</h4>`+r;
  h+=`<h4>✨ ${T('Украшения за 💎','Decorations for 💎')}</h4><p class="shop-p">${T('Эмблема перед названием холдинга, цвет вывесок, рамка портрета, украшения вещей героя.','An emblem before your holding’s name, sign colour, portrait frame, decorations for the hero’s things.')}</p>
    <div class="shop-more">${window.META&&META.openCos?`<button class="btn w noenter" id="shCos">🎨 ${T('Эмблемы, вывески, рамки','Emblems, signs, frames')}</button>`:''}${window.CAB&&CAB.open?`<button class="btn w noenter" id="shLx">🏠 ${T('Вещи героя — в Кабинете','The hero’s things — in the Office')}</button>`:''}</div>`;
  return h+restoreHtml();}

// ускорения и «навсегда» за 💎
function pkRow(ic,nm,sub,next,done,k){if(!next&&!done)return '';
  return next?`<div class="shop-info"><span>${ic} ${nm}<small>${sub}</small><em class="shop-k k-perm">${T('Навсегда','Forever')}</em></span><button class="btn cr noenter shop-pk" data-pk="${k}" style="width:auto;margin:0;min-height:48px">${cr(next)}</button></div>`
    :`<div class="shop-info"><span>${ic} ${nm}<small>${sub}</small></span><b>✓ ${T('Всё куплено','All bought')}</b></div>`;}
function infoRow(ic,nm,sub,right){return `<div class="shop-info"><span>${ic} ${nm}<small>${sub}</small></span><b>${right}</b></div>`;}
function secBoost(){const w=W(),E=window.ECON||{};let h=`<p class="shop-p">${T('За кристаллы можно сделать дела быстрее или навсегда стать сильнее. Деньги (₽) так не купить — их зарабатывают делом.','Crystals let you get things done faster or become stronger for good. Money (₽) can’t be bought this way — you earn it by doing business.')}</p>`;
  if(w&&w.me&&!w.ned&&GAME.handNext){
    h+=`<h4>💪 ${T('Навсегда','Forever')}</h4>`;
    h+=pkRow('✋',T('+1 дело одновременно','+1 hand'),T('Берёте больше заказов одновременно','Take more orders at once'),GAME.handNext(),GAME.handLv&&GAME.handLv()>0,'hand');
    h+=pkRow('⚡',T('+'+(E.EN_STEP||20)+' к запасу сил','+'+(E.EN_STEP||20)+' to energy reserve'),T('Больше работы без отдыха','More work without rest'),GAME.enNext(),GAME.enLv&&GAME.enLv()>0,'en');
    if(GAME.regNext)h+=pkRow('🌅',T('Режим дня: +'+(E.REG_STEP||10)+' ⚡ за ночь','Daily routine: +'+(E.REG_STEP||10)+' ⚡ per night'),T('Силы восстанавливаются быстрее','Energy recovers faster'),GAME.regNext(),GAME.regLv&&GAME.regLv()>0,'reg');}
  h+=`<h4>⏩ ${T('Ускорить сейчас','Speed up now')}</h4><p class="shop-p">${T('Кнопки — прямо на карточках дел: там, где это можно.','The buttons are right on the cards — wherever it’s possible.')}</p>`;
  const B=E.CR_BIZ||{},C=GAME.CR||{};
  if(w&&w.me&&!w.ned){h+=infoRow('⚡',T('Второе дыхание: +50 сил','Second wind: +50 energy'),T('раз в игровую неделю · карточка героя','once a game week · hero card'),cr(B.breath||2));
    h+=infoRow('🔥',T('Срочный заказ','Urgent order'),T('раз в игровой месяц, оплата ×1,5 · доска заказов','once a game month, pay ×1.5 · order board'),cr(B.urgent||3));}
  if(w&&!w.ned)h+=infoRow('🏪',T('Открыть точку на 5 дней раньше','Open a shop 5 days sooner'),T('раз на точку · карточка стройки','once per shop · construction card'),cr(B.open||4));
  if(w&&w.ned){h+=infoRow('🏗',T('Стройка на 15 дней быстрее','Construction 15 days faster'),T('раз на объект · карточка объекта','once per facility · facility card'),cr(C.speed||10));
    h+=infoRow('🔎',T('Разведка сразу','Instant exploration'),T('участок на разведке · карта региона','plot being explored · region map'),cr(C.expl||4));
    h+=infoRow('📦',T('Срочный контракт','Urgent contract'),T('раз в 3 игровых месяца · «Рынок»','once every 3 game months · Market'),cr(C.urgent||6));}
  return h;}

// бесплатно за рекламу: лесенка и места (у каждого — свой предел в день, общего нет)
const ADP=[['x2','💰',['×2 за заказ','×2 for an order'],['подработка: окно заказа','side jobs: order window'],'gig'],
  ['breath','⚡',['Второе дыхание: +50 сил','Second wind: +50 energy'],['карточка героя','hero card'],'gig'],
  ['chk','🔍',['Проверить заказчика','Check the client'],['подработка: окно заказа','side jobs: order window'],'gig'],
  ['urg','🔥',['Срочный заказ','Urgent order'],['доска заказов','order board'],'gig'],
  ['promo','📣',['Реклама точки: больше покупателей','Shop ad: more customers'],['карточка точки','shop card'],'biz'],
  ['open','🏪',['Открыть точку на 5 дней раньше','Open a shop 5 days sooner'],['карточка стройки','construction card'],'biz'],
  ['audit','🧾',['Ревизия точки','Shop audit'],['карточка точки','shop card'],'biz'],
  ['build','🏗',['Стройка на 5 дней раньше','Construction 5 days sooner'],['карточка объекта','facility card'],'ned'],
  ['exp','🚂',['Экспресс-поезд','Express train'],['«Логистика»','Logistics'],'ned'],
  ['con','📄',['Отсрочка по контракту','Contract extension'],['«Рынок»','Market'],'ned'],
  ['bst','📈',['+10 % к цене продаж','+10% to sale prices'],['«Сегодня»','Today'],'ned'],
  ['rw','🎁',['×2 к награде за звание и неделю','×2 to rank and week rewards'],['окно награды','reward window'],'all']];
function secAds(){if(!adOn())return `<p class="shop-p">${T('Здесь ролики сейчас недоступны.','Videos aren’t available here right now.')}</p>`;
  const w=W();let h=`<p class="shop-p">${T('Ролик смотрите только по своей кнопке «📺». Дневного предела нет: после ролика у места короткая пауза — потом снова можно.','Watch a video only with its own “📺” button. There’s no daily limit: after a video each place takes a short pause — then it’s available again.')}</p>`;
  h+=`<h4>💎 ${T('Ролики дня','Daily videos')}</h4>`;
  try{const x=GAME.lad();h+=infoRow('📶',T('Лесенка: 2 → 3 → 3 → 4 → 6 💎','Ladder: 2 → 3 → 3 → 4 → 6 💎'),T('каждый следующий щедрее','each one more generous'),`<span${x.n>=x.max?' class="no"':''}>${x.n} ${T('из','of')} ${x.max}</span>`);
    h+=infoRow('🔁',T('Потом — бонус-ролики','Then — bonus videos'),'+'+cr(GAME.LAD_FLAT)+' '+T('раз в ','every ')+Math.round(GAME.LAD_FLAT_GAP/60)+T(' мин',' min'),x.flat&&x.wait>0?`<span class="no">${T('через ','in ')+Math.max(1,Math.ceil(x.wait/6e4))+T(' мин',' min')}</span>`:x.flat?T('можно','ready'):'—');}catch(e){}
  const lb=ladBtn();if(lb)h+=`<div class="shop-more">${lb}</div>`;
  const has=g=>g==='all'||(g==='gig'?!!(w&&w.me&&!w.ned):g==='biz'?!!(w&&!w.ned&&Array.isArray(w.biz)&&w.biz.length):!!(w&&w.ned));
  const rows=ADP.filter(p=>has(p[4])&&GAME.AD_GAP&&GAME.AD_GAP[p[0]]!=null).map(p=>{const wt=GAME.adWait?GAME.adWait(p[0]):0;   // M31: пауза места вместо дневного предела
    return infoRow(p[1],T(p[2][0],p[2][1]),T(p[3][0],p[3][1])+' · '+T('пауза ','pause ')+GAME.AD_GAP[p[0]]+T(' мин',' min'),wt>0?`<span class="no">${T('через ','in ')+GAME.adMin(p[0])+T(' мин',' min')}</span>`:T('можно','ready'));}).join('');
  if(rows)h+=`<h4>🎯 ${T('В делах','In your business')}</h4>`+rows;
  h+=`<h4>☕ ${T('Планёрка','Briefing')}</h4>`+infoRow('🎁',T('Удвоить подарок дня и поручения','Double the daily gift and tasks'),T('раз в день · «Сегодня» → Планёрка','once a day · Today → Briefing'),'×2');
  return h;}

// за достижения: звание, веха главы, кубок недели
function cosNm(id){try{const c=GAME.COS.find(x=>x.id===id);return c?(c.ic?c.ic+' ':'')+T(c.ru,c.en):'';}catch(e){return '';}}
function secAch(){const w=W();let h=`<p class="shop-p">${T('Это не покупается — только заслуживается. Награды приходят сами.','These can’t be bought — only earned. Rewards arrive by themselves.')}</p>`;
  try{const RK=GAME.RK,i=S.rk|0,n=GAME.stars().n,nx=RK[i+1];
    h+=`<h4>🎖 ${T('Звание','Rank')}</h4>`;
    const nm=r=>T(r.ru,r.en);let sub=T('Сейчас','Now')+': <b>'+esc(nm(RK[i]))+'</b>';
    if(nx){const f=Math.min(1,n/(nx.s||1)),pr=[];if(nx.cr)pr.push('+'+cr(nx.cr));if(nx.cos)pr.push(esc(cosNm(nx.cos)));
      sub+='<br>'+T('Следующее','Next')+': '+esc(nm(nx))+' — ★ '+n+' '+T('из','of')+' '+nx.s+(pr.length?' · '+T('награда','reward')+': '+pr.join(', '):'');
      h+=`<div class="shop-info"><span>⭐ ${sub}<span class="shop-bar"><i style="width:${(f*100).toFixed(0)}%"></i></span></span></div>`;}
    else h+=`<div class="shop-info"><span>⭐ ${sub}<small>${T('Это высшее звание!','That’s the top rank!')}</small></span></div>`;}catch(e){}
  try{if(w&&GAME.miles){const a=GAME.miles(w.st)||[],left=a.filter(m=>!m.done),m=left[0];
    if(a.length){h+=`<h4>🚩 ${T('Вехи главы','Chapter milestones')}</h4>`;
      h+=m?infoRow('🎯',esc(T(m.ru,m.en)),T('пройдено ','done ')+(a.length-left.length)+T(' из ',' of ')+a.length,m.cr?'+'+cr(m.cr):'')
        :infoRow('✅',T('Все вехи главы пройдены','All chapter milestones done'),'','');}}}catch(e){}
  h+=`<h4>🏆 ${T('Каждую неделю','Every week')}</h4>`+infoRow('🥇',T('Кубок недели','Cup of the week'),T('рост компании за неделю: +5 %, +15 %, +30 %','company growth in a week: +5%, +15%, +30%'),'4 / 7 / 10 💎')
    +infoRow('📋',T('«Ударник»: Планёрка 5 дней в неделю','“Star worker”: Briefing 5 days a week'),T('грамота на стену','a certificate for the wall'),'+'+cr(6))
    +infoRow('📅',T('Подарок дня и поручения','Daily gift and tasks'),T('«Сегодня» → Планёрка','Today → Briefing'),'3–8 💎');
  if(window.CAB&&CAB.open)h+=`<div class="shop-more"><button class="btn w noenter" id="shCab">🏆 ${T('Открыть Кабинет: звания и стена','Open the Office: ranks and the wall')}</button></div>`;
  return h;}

const BODY={cr:secCr,pack:secPack,look:secLook,boost:secBoost,ads:secAds,ach:secAch};
function secs(){return SECS.filter(s=>s.id==='pack'?payOn():s.id==='ads'?adOn():true).map(s=>s.id);}
let cur='cr';   // открытый раздел (без раздела — «💎 Кристаллы»)
// M36: ctx — с чем открыли магазин снаружи: miss (не хватает 💎), hl — подсвеченный товар; живёт до следующего открытия снаружи
let ctx={};
function openFrom(sec,o){o=o&&typeof o==='object'?o:{};const miss=Math.max(0,(o.need|0)-(S.cr|0));ctx={miss,hl:o.hl||(miss?hlFor(miss):'')};
  try{let s=1;try{s=GAME.stN();}catch(e){}STAT.ev('shop',{from:String(o.from||'x'),s,sec:typeof sec==='string'&&sec?sec:'cr'});}catch(e){}
  open(sec);
  try{const h=document.querySelector('#mcard .shop-hl');if(h&&h.scrollIntoView)setTimeout(()=>{try{h.scrollIntoView({block:'center'});}catch(e){}},60);}catch(e){}}
function open(sec){css();const ok=secs();cur=typeof sec==='string'&&sec?sec:'cr';if(ok.indexOf(cur)<0)cur=ok[0];const S0=SECS.find(s=>s.id===cur);
  let body='';try{body=BODY[cur]();}catch(e){console.error(e);}
  const tabs=ok.map(id=>{const s=SECS.find(x=>x.id===id);return `<button class="shop-tab noenter${id===cur?' on':''}" data-sec="${id}" role="tab" aria-selected="${id===cur}"><b>${s.ic}</b>${T(s.tab[0],s.tab[1])}</button>`;}).join('');
  modal(`<h2>🛒 ${T('Магазин','Shop')}</h2><p class="shop-bal">${T('У вас','You have')} <b>${cr(S.cr|0)}</b></p><div class="shop-tabs" role="tablist">${tabs}</div>
    <div class="shop-sec" data-sec="${cur}"><h3>${S0.ic} ${T(S0.h[0],S0.h[1])}</h3>${body}</div>
    <div class="row"><button class="btn" id="shClose" data-esc>${T('Закрыть','Close')}</button></div>`);
  const mc=$s('mcard');if(mc)mc.classList.add('shop-card');
  modalRe=()=>open(cur);if(typeof PAY!=='undefined')PAY.re=()=>open(cur);   // каталог/мост пришёл или покупка прошла, пока окно открыто, — перерисуем
  try{STAT.screen('shop_'+cur);}catch(e){}
  mc.querySelectorAll('.shop-tab').forEach(b=>b.onclick=()=>{snd('tap');open(b.dataset.sec);});
  mc.querySelectorAll('.pbuy[data-pid]').forEach(b=>b.onclick=()=>{snd('tap');buy(b.dataset.pid);});
  mc.querySelectorAll('[data-thset]').forEach(b=>b.onclick=()=>{snd('tap');const id=b.dataset.thset;
    if(window.THEME)THEME.set(id);open('look');});
  mc.querySelectorAll('[data-thbuy]').forEach(b=>b.onclick=()=>{snd('tap');if(window.THEME)THEME.buy(b.dataset.thbuy,()=>{if(modalOn)open('look');});});
  if($s('shThAll'))$s('shThAll').onclick=()=>{snd('tap');THEME.open(()=>open('look'));};
  mc.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{snd('tap');askPk(b.dataset.pk);});
  if($s('shRest'))$s('shRest').onclick=()=>{snd('tap');PAY.again();};
  if($s('shAd'))$s('shAd').onclick=()=>{if(adHold())return;hideModal();GAME.ladWatch();};
  if($s('shCos'))$s('shCos').onclick=()=>{try{META.openCos();}catch(e){console.error(e);}};
  if($s('shLx'))$s('shLx').onclick=()=>{snd('tap');try{CAB.open('lx');}catch(e){console.error(e);}};
  if($s('shCab'))$s('shCab').onclick=()=>{snd('tap');try{CAB.open('rk');}catch(e){console.error(e);}};
  $s('shClose').onclick=()=>{snd('close');hideModal();};}
// «навсегда за 💎» из магазина: подтверждение отдельным шагом (45+: случайно не потратить)
function askPk(k){const E=window.ECON||{},P={hand:[GAME.handNext,GAME.buyHand,'✋ '+T('+1 дело одновременно — навсегда','+1 hand for good')],
    en:[GAME.enNext,GAME.buyEn,'⚡ '+T('+'+(E.EN_STEP||20)+' к запасу сил навсегда','+'+(E.EN_STEP||20)+' energy reserve for good')],
    reg:[GAME.regNext,GAME.buyReg,'🌅 '+T('Режим дня: +'+(E.REG_STEP||10)+' ⚡ за ночь навсегда','Daily routine: +'+(E.REG_STEP||10)+' ⚡ per night for good')]}[k];
  if(!P||!P[0])return;const n=P[0]();if(!n)return open('boost');
  if((S.cr|0)<n){snd('no');toast(T('Не хватает 💎: нужно ','Not enough 💎: you need ')+cr(n));open('cr');return;}
  modal(`<h2>${P[2]}</h2><p class="shop-p" style="text-align:center">${T('Цена','Price')}: <b>${cr(n)}</b> · ${T('у вас','you have')} ${cr(S.cr|0)}</p>
    <div class="row"><button class="btn green noenter" id="shPkY">${T('Да, купить за ','Yes, buy for ')}${cr(n)}</button><button class="btn" id="shPkN" data-esc>${T('← Назад','← Back')}</button></div>`);
  modalRe=()=>askPk(k);
  $s('shPkN').onclick=()=>{snd('tap');open('boost');};
  $s('shPkY').onclick=()=>{const r=P[1]();if(r==='ok'){snd('win');try{buzz(20);}catch(e){}toast('✓ '+P[2],2600);open('boost');}else if(r==='cr'){snd('no');open('cr');}else open('boost');};}
// купить за деньги: те же проверки, что у PAY.buy (каталог, занятость, «уже куплено»); вернёт обещание PAY.buy или false
function buy(id){if(typeof PAY==='undefined'||!PAY_ITEMS[id]||!visible(id))return false;if(PAY_ITEMS[id].perm&&own(id))return false;return PAY.buy(id);}
function items(){return Object.keys(PAY_ITEMS).map(id=>({id,sec:secOf(id),kind:kindOf(id),own:!!(PAY_ITEMS[id].perm&&own(id)),show:visible(id),price:visible(id)?priceOf(id):''}));}
// эмблема «Золотая кирка» из «Набора недропользователя» (nedra_pack, shell.js)
try{if(window.GAME&&Array.isArray(GAME.COS)&&!GAME.COS.some(c=>c.id==='em_gpick'))
  GAME.COS.push({id:'em_gpick',k:'emb',ic:'⛏',ru:'Золотая кирка',en:'Golden pickaxe',cr:0,buy:'nedra_pack'});}catch(e){}
// M36 (П2): строка «⭐ Набор главы» в окнах глав/IPO — открывает магазин на этом товаре (сама ничего не покупает); '' — если не продаётся или уже куплен
const OFFER_TXT={kit1:['Силы навсегда и 30 💎','Energy for good and 30 💎'],net_pack:['Набор главы','Chapter pack'],nedra_pack:['Набор главы','Chapter pack'],ipo_pack:['К выходу на биржу','For going public']};
function offerHtml(id,where){if(!PAY_ITEMS[id]||!visible(id)||own(id))return '';const it=PAY_ITEMS[id],t=OFFER_TXT[id]||['Предложение','Offer'];
  try{STAT.ev('offer',{k:id,w:String(where||'x'),a:'show'});}catch(e){}
  return `<button class="set noenter shop-offer" data-shop-offer="${esc(id)}" data-w="${esc(where||'x')}" style="margin:10px 0 0;min-height:52px;text-align:left"><span>⭐ ${T(t[0],t[1])}: ${it.ic} <b>${esc(it.name)}</b><br><small>${T('посмотреть в магазине','see it in the shop')}</small></span><b class="shop-pr" style="margin:0 0 0 8px;align-self:center">${priceOf(id)}</b></button>`;}
document.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('[data-shop-offer]'):null;if(!t)return;e.preventDefault();e.stopPropagation();snd('tap');
  const id=t.dataset.shopOffer;try{STAT.ev('offer',{k:id,w:t.dataset.w||'x',a:'tap'});}catch(x){}openFrom(secOf(id),{from:'offer',hl:id});},true);
window.SHOP={open,openFrom,buy,items,secs,SEC,offerHtml,visible};
// старая точка входа: openShop() из шапки, ⚙, «Не хватает 💎», «Пока вас не было» → сюда (onclick=openShop передаёт событие — не раздел)
// M36: второй аргумент — {from, need, hl} (откуда открыли, сколько 💎 нужно, какой товар подсветить)
window.openShop=function(sec,o){openFrom(typeof sec==='string'?sec:'',o);};
})();
