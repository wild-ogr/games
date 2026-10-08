/* M48rb (08.10, решение владельца): разорение остаётся, но можно откатиться назад.
   Модель — js/game.js (GAME.rb: снимки мира на начало месяца, последние 3, только на этом устройстве; go/accept/pending/list/free).
   Здесь — вид:
   • окно «🏦 Банк проводит санацию» (событие 'ruin' вместо окна месяца): «↩ Вернуться к 1 <месяца>» (до 3 снимков: деньги и долг тогда)
     или «🏦 Принять санацию» (дальше — обычное окно закрытия месяца). Время стоит (GAME.hold 'rb'), окно возвращается, если его закрыли/перезагрузили.
   • оплата: первый откат за холдинг — даром; 2-й — 📺 ролик (adOk, STAT.place('rollback')) или 25 💎; дальше 50, 75… 💎 (только 💎; GAME.rb.CR — текущая цена). Нет ни того ни другого — только санация.
   • совет Людмилы z_ruin «к санации близко» (pri 99, только в игре: E.cpAdvOn) — когда ещё месяц в минусе станет санацией и прогноз к 30-му в минусе
     (или санация уже в это закрытие); тексты — ADV.text (окно месяца, пузырь) и RBUI.advTxt (карточки «Сегодня» глав 1–4, biz-ui ZTXT). */
(function(){
'use strict';
if(!window.GAME||!GAME.rb||!window.ECON)return;
const E=ECON,R=GAME.rb;
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const M=v=>FMT.money(v);
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
const GEN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MON_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
// «к 1 марта 2027» / «1 March 2027»
function day1(m){const y=2027+Math.floor(m/12);return en()?'1 '+MON_EN[m%12]+' '+y:'1 '+GEN[m%12]+' '+y;}
function snd(k){try{SND[k]();}catch(e){}}
let busy=false,cur=null;   // busy — идёт ролик; cur — отчёт месяца с санацией

/* ---------------- окно выбора ---------------- */
function lim(W){return W&&W.ned?2:3;}
function soldTxt(rep,W){const s=rep&&rep.san||{},k=(s.sold||[]).length,d=s.debt||0;
  const what=k?(W.ned?`${k} ${pl(k,'объект','объекта','объектов','asset','assets')}`:`${k} ${pl(k,'точку','точки','точек','outlet','outlets')}`):'';
  return k?L(`Банк продаёт за долги ${what} — за 60 % цены — и сводит все долги в один кредит: ${M(d)}. Кредитная история падает.`,`The bank sells ${what} for debt — at 60% of value — and rolls all debts into one loan: ${M(d)}. Your credit history drops.`)
    :L(`Банк сводит все долги в один кредит: ${M(d)}. Кредитная история падает.`,`The bank rolls all debts into one loan: ${M(d)}. Your credit history drops.`);}
function payLine(){if(R.free())return `<p class="rb-pay good">✨ ${L('Первый откат в этом холдинге — бесплатно.','Your first rollback in this holding is free.')}</p>`;
  const ad=typeof adOk==='function'&&adOk()&&R.adOk(),cr=GAME.cr(),ok=cr>=R.CR;
  if(!ad&&!ok)return `<p class="rb-pay bad">${L(R.adOk()?`Вернуться можно за 📺 ролик или ${R.CR} 💎. Сейчас ролика нет, а 💎 у вас ${cr} — остаётся санация.`:`Вернуться можно за ${R.CR} 💎 (каждый следующий откат дороже). 💎 у вас ${cr} — остаётся санация.`,R.adOk()?`A rollback costs a 📺 video or ${R.CR} 💎. No video right now and you have ${cr} 💎 — restructuring is the only way.`:`A rollback costs ${R.CR} 💎 (each next one costs more). You have ${cr} 💎 — restructuring is the only way.`)}</p>`;
  return `<p class="rb-pay">${L(R.adOk()?`Вернуться — за 📺 ролик или ${R.CR} 💎 (у вас ${cr} 💎).`:`Вернуться — за ${R.CR} 💎 (у вас ${cr} 💎; каждый следующий откат дороже на 25).`,R.adOk()?`Going back costs a 📺 video or ${R.CR} 💎 (you have ${cr} 💎).`:`Going back costs ${R.CR} 💎 (you have ${cr} 💎; each next one costs 25 more).`)}</p>`;}
function canPay(){return R.free()||(typeof adOk==='function'&&adOk()&&R.adOk())||GAME.cr()>=R.CR;}
function show(rep){const W=GAME.W;if(!W)return;rep=rep||R.pending();if(!rep)return;cur=rep;GAME.hold.add('rb');
  const list=R.list();if(!list.length){accept();return;}
  const can=canPay();
  let h=`<h2 data-nav="rb1">🏦 ${L('Банк проводит санацию','The bank is restructuring you')}</h2>
    <p>${L('Денег не хватает уже который месяц подряд — банк больше не ждёт.','Cash has been short month after month — the bank won’t wait any longer.')} ${esc(soldTxt(rep,W))}</p>
    <p>${L('Можно принять это и играть дальше — или вернуться назад и сыграть этот отрезок иначе:','You can accept it and carry on — or go back and replay this stretch differently:')}</p>
    ${payLine()}<div class="rb-list">`;
  for(const x of list){const ago=x.back;
    h+=`<button class="btn w rb-opt" data-rb="${x.t}"${can?'':' disabled'}><span class="rb-t">↩ ${L('Вернуться к','Back to')} ${esc(day1(x.m))}</span>
      <small>${L('тогда','then')}: ${L('деньги','cash')} ${esc(M(x.cash))} · ${L('долг','debt')} ${esc(M(x.debt))} · ${ago} ${esc(pl(ago,'месяц','месяца','месяцев','month','months'))} ${L('назад','ago')}</small></button>`;}
  h+=`</div><p class="rb-note">${L('💎, покупки, награды и звания останутся. 💎, потраченные после этой даты, не вернутся.','💎, purchases, rewards and ranks stay. 💎 spent after that date are not refunded.')}</p>
    <div class="row"><button class="btn w" id="rbSan">🏦 ${L('Принять санацию','Accept restructuring')}</button></div>`;
  modal(h);
  document.querySelectorAll('[data-rb]').forEach(b=>b.onclick=()=>{snd('tap');step2(+b.getAttribute('data-rb'));});
  $('rbSan').onclick=()=>{snd('tap');accept();};}
function accept(){cur=null;try{hideModal();}catch(e){}R.accept();}
// шаг 2: подтверждение и оплата
function step2(t){const x=R.list().find(s=>s.t===t);if(!x){show();return;}
  const free=R.free(),ad=typeof adOk==='function'&&adOk()&&R.adOk(),cr=GAME.cr(),okCr=cr>=R.CR;
  let h=`<h2 data-nav="rb2">↩ ${L('Вернуться к','Back to')} ${esc(day1(x.m))}?</h2>
    <p>${L(`Всё, что было после этой даты, отменится: деньги станут ${M(x.cash)}, долг — ${M(x.debt)}. Санации не будет.`,`Everything after that date is undone: cash becomes ${M(x.cash)}, debt — ${M(x.debt)}. No restructuring.`)}</p>
    <p class="rb-note">${L('Совет: в этот раз не начинайте стройку и большие закупки, если «📅 Деньги на 30 дней» показывают минус.','Tip: this time don’t start building or big purchases if “📅 Cash for 30 days” shows a minus.')}</p><div class="rb-list">`;
  if(free)h+=`<button class="btn green w" id="rbFree">↩ ${L('Да, вернуться (бесплатно)','Yes, go back (free)')}</button>`;
  else{if(ad)h+=`<button class="btn green w" id="rbAd">📺 ${L('Посмотреть ролик и вернуться','Watch a video and go back')}</button>`;
    h+=`<button class="btn cr w" id="rbCr"${okCr?'':' disabled'}>💎 ${R.CR} — ${L('вернуться','go back')}${okCr?'':`<small>${L(`у вас ${cr} 💎`,`you have ${cr} 💎`)}</small>`}</button>`;}
  h+=`<button class="btn w" id="rbNo" data-esc>← ${L('Назад','Back')}</button></div>`;
  modal(h);
  const done=pay=>{const r=R.go(t,pay);if(r==='ok'){cur=null;try{hideModal();}catch(e){}after(x);}else if(r==='cr'){snd('no');toast(L('Не хватает 💎','Not enough 💎'));}else{snd('no');toast(L('Не получилось вернуться — снимок недоступен','Could not go back — the snapshot is unavailable'));show();}};
  $('rbNo').onclick=()=>{snd('tap');show();};
  if($('rbFree'))$('rbFree').onclick=()=>done('free');
  if($('rbCr'))$('rbCr').onclick=()=>{if(GAME.cr()<R.CR){snd('no');return;}done('cr');};
  if($('rbAd'))$('rbAd').onclick=()=>{if(typeof adHold==='function'&&adHold('rollback'))return;busy=true;try{hideModal();}catch(e){}try{STAT.place('rollback');}catch(e){}
    showRewarded(()=>{busy=false;done('ad');},()=>{busy=false;setTimeout(()=>{if(R.pending())step2(t);},300);});};}
function after(x){snd('build');toast('↩ '+L(`Вернулись к ${day1(x.m)} · деньги ${M(x.cash)}`,`Back to ${day1(x.m)} · cash ${M(x.cash)}`),4500);
  try{if(window.UI&&UI.advShow)UI.advShow({html:esc(L('Вернулись назад. Теперь аккуратнее: перед стройкой и закупкой смотрим «📅 Деньги на 30 дней» — если к 30-му минус, ждём или берём проектный кредит.','We’re back. Carefully now: before building or buying, check “📅 Cash for 30 days” — if it’s negative by the 30th, wait or take a project loan.')),mood:'calm'});}catch(e){}}
GAME.on('ruin',rep=>{snd('alert');show(rep);});
// окно закрыли (✕, Esc, смахнули) или перезагрузили страницу — выбор ещё не сделан: время стоит, окно возвращается
setInterval(()=>{try{if(busy||typeof modalOn==='undefined'||modalOn)return;if(typeof paused!=='undefined'&&paused&&!document.hidden)return;const rep=R.pending();if(rep)show(rep);else if(GAME.hold.has('rb'))GAME.hold.delete('rb');}catch(e){}},1000);

/* ---------------- совет Людмилы: к санации близко ---------------- */
// санация — в закрытие, когда W.odM >= lim (главы 1–4: всегда; «Недра»: если и тогда денег нет); предупреждаем за месяц до этого, если прогноз к 30-му в минусе
function ruinAdv(W,o){if(!E.cpAdvOn||E.cpIn||!W||o.some(x=>x.k==='z_ruin'||x.k==='san'))return;const od=W.odM|0,L0=lim(W);if(od<L0-1)return;
  let p=null;try{p=E.cashPlan(W,35);}catch(e){}
  // тень (та же модель) сама проводит санацию — строка «Санация» в ленте (cash.js, тег san): когда и сколько не хватало до неё
  const si=p&&p.items?p.items.find(x=>x.src==='san'):null,left=30-(W.d|0);let now=0,short=0;
  if(si){now=si.d<=left?1:0;let mn=0;for(const x of p.byDay||[])if(x.d<si.d&&x.own<mn)mn=x.own;short=Math.max(0,-Math.round(mn));}
  else{const own=p&&p.eom?p.eom.own:W.cash;short=Math.max(0,-Math.round(own));now=od>=L0?1:0;if(!now&&short<=0)return;if(now&&W.ned&&short<=0)return;}
  o.push({k:'z_ruin',pri:99,a:{now,short,ned:W.ned?1:0}});o.sort((a,b)=>b.pri-a.pri);}
function wrap(name){const f=E[name];if(typeof f!=='function'||f.__rb)return;const g=function(W){const o=f.apply(this,arguments);try{if(Array.isArray(o))ruinAdv(W,o);}catch(e){}return o;};g.__rb=1;for(const k in f)g[k]=f[k];E[name]=g;}
wrap('bizAdvise');wrap('advise');
function advTxt(a){a=a||{};const what=a.ned?L('стройки и заводы','projects and plants'):L('точки','outlets'),need=a.short>0?M(a.short):L('денег','the money');
  if(a.now&&!a.ned&&!(a.short>0))return L(`⚠ Денег нет уже третий месяц подряд — в конце этого месяца банк проведёт санацию: продаст ${what} за 60 % цены. Если выйдет плохо — я предложу вернуться назад.`,`⚠ Third month in a row without cash — at the end of this month the bank will restructure us: it sells ${what} at 60% of value. If it goes badly, I’ll offer to go back.`);
  if(a.now)return L(`⚠ Опасно: если к 30-му не найдём ${need}, банк проведёт санацию — продаст ${what} за 60 % цены. Продайте запасы, отложите стройку или возьмите кредит.`,`⚠ Danger: if we don’t find ${need} by the 30th, the bank restructures us — it sells ${what} at 60% of value. Sell stock, pause building or take a loan.`);
  return L(`⚠ К санации близко: по прогнозу не хватит ${need}. Ещё месяц в минусе — и в следующем банк продаст ${what} за 60 % цены. Сократите закупки, отложите стройку или возьмите кредит.`,`⚠ Close to restructuring: the forecast is ${need} short. One more month in the red and next month the bank sells ${what} at 60% of value. Cut purchases, pause building or take a loan.`);}
if(window.ADV&&ADV.text&&!ADV.text.__rb){const t0=ADV.text;ADV.text=function(item){if(item&&item.k==='z_ruin')return advTxt(item.a);return t0.apply(this,arguments);};for(const k in t0)ADV.text[k]=t0[k];ADV.text.__rb=1;}

/* ---------------- стиль ---------------- */
const css=`.rb-list{margin:10px 0}.rb-list .btn{margin:0 0 10px}.rb-opt{text-align:left;min-height:64px;padding:12px 16px}.rb-opt .rb-t{display:block;font-size:18px}
.rb-opt small{margin-top:4px}.rb-pay{font-size:17px;margin:8px 0}.rb-pay.good{color:var(--good)}.rb-pay.bad{color:var(--bad)}.rb-note{font-size:16px;color:var(--muted)}`;
try{const s=document.createElement('style');s.id='rbCss';s.textContent=css;document.head.appendChild(s);}catch(e){}
window.RBUI={show,advTxt,day1};
})();
