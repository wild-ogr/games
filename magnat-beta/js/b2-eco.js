/* b2-eco.js — ECO: ДОГОВОР ЧИСЕЛ «Магнат 2.0» (поток ECO, 18.10.2026). Остальные потоки ТОЛЬКО читают; менять числа — только ECO (или MERGE по журналу ECO).

  ПРАВИЛО. Ни один поток не пишет у себя «+15 💎», «×1,1 к доходу» или цену в 💎 — только:
     B2.eco.give('<id>.<ключ>' [,mult])  — выдать 💎 за событие новинки (таблица CR, суточный предел CAP; вернёт, сколько выдано);
     B2.eco.cr('<id>.<ключ>')            — сколько 💎 стоит событие (для подписи на кнопке «+6 💎»), без выдачи;
     B2.eco.list('<id>.<ключ>')          — ряд чисел (табель 28 дней, конверты новичка) — копия массива;
     B2.eco.k('<id>.<ключ>' [,def])      — множитель/доля/срок для механики (нет ключа → def, по умолчанию 1);
     B2.eco.p('<id>.<ключ>')             — цена в 💎 (стоки), B2.eco.pay('<id>.<ключ>') → true/false (списывает через GAME.spend).
  Нет ключа → 0 💎 / ×1. Нужен ключ — строка в logs/ECO.md. Таблицы работают и при ?off=eco.

  ПРЕДЕЛЫ (00-plan §3, §5; ответы владельца В6, В12, В13 — «да»):
   • приток 💎 от ВСЕХ новинок ≤ +10 % к main у активного игрока (≈ 45 💎/день: подарок 6,7 + ×2 6,7 + поручения 9 + лесенка 18 + бонус-ролики ~1,5
     + неделя ~1,5 + звания/вехи ~1) → бюджет новинок ≈ +4,5 💎/день. Расчёт — B2.eco.budget() (ниже), сторож ECO-tools/eco-budget.sh;
   • 💎 ЗА МИНИ-ИГРЫ НЕ ДАЁМ (mgcore/mg1/mg2 — give всегда 0; награда — медали, рекорды, «чаевые» ₽ в пределах K mg.*);
   • ×2 за ролик в новинках не даём — только там, где он уже был в main (подарок дня → табель и конверты новичка: ключи X2);
   • прибавка дохода от «знания» за 💎 ≤ 5 %, от мини-игр ≤ 3 %, черта команды ±5 %, соперник забирает ≤ 15 % рынка вида.
  STAT: give → GAME.addCr(n,'b2<id>') (в stat-hooks EARN → 'quest'); pay → GAME.spend(n,'b2<ключ>'). */
(function(){'use strict';
B2.off.eco=0;

/* ===== CR — 💎 за событие новинки ('<поток>.<что>' → 💎). Нули записаны нарочно: «по договору 💎 нет». ===== */
const CR={
  // EVENT — табель 28 дней (вместо CAL 7: 3,3,5,5,8,8,украшение). Обычные клетки — ряд LIST 'event.tab' (0 = клетка-украшение/тема).
  'event.tab_d':15,     // клетка-украшение (7/14/21), если все украшения уже есть — как CAL7_CR в main
  'event.tab_t':25,     // 28-я клетка, если тема сезона уже есть
  // EVENT — Поток заданий (вместо 3 поручений: 2+2+2 и +3 за все = 9 в день)
  'event.task':2,       // за задание — только первые K 'event.task_n' заданий в день, дальше 0 (только продвижение связки)
  'event.chest':5,      // «Сундук героя» за связку из 5 — с 💎 не чаще 1 сундука в день (CAP 'event.chest'), остальные — значок + услуга
  'event.season':5,     // ступень сезона с 💎 — каждая K 'event.season_every'-я (4, 8, 12, 16), 20-я — тема/рамка навсегда, без 💎
  'event.wk':0,         // итог недели — остаётся как в main (кубок 4/7/10, «Ударник» 6), новых 💎 нет
  // FIRST — неделя новичка: 7 конвертов вместо первых 7 клеток CAL; 💎 только в конвертах 2 и 7 (ряд LIST 'first.w'), прочее — игровые подарки (K first.*)
  'first.morning':0,
  // FEST — праздник по дате: цепочка из 5 праздничных заданий выполнена → 5 💎 + значок навсегда (раз за праздник)
  'fest.done':5, 'fest.task':0, 'fest.gift':3,   // MERGE: просьба FEST
  // CUP — живая лига (В9: ≤ 5 💎): место в группе за неделю
  'cup.p1':5, 'cup.p2':3, 'cup.p3':2, 'cup.top10':1, 'cup.part':0,
  // KRAI / KRAI2 — звёзды края дают доли основателя (как сейчас), 💎 — только за все 3 звезды края (раз на край)
  'krai.star':0, 'krai.all3':8, 'krai2.all3':8,
  // STORY — серии без 💎 (встречи 11 «Б» уже дают свои), финал «Корпорация» — раз за игру
  'story.ep':0, 'story.final':20,
  // остальное — 💎 нет: соперники, карьер, недра, команда, улица, вид, миссии VK (их баллы — VK, не 💎)
  'rival.win':0, 'quarry.tender':0, 'nedra.adv':0, 'team.hire':0, 'home.day':0, 'juice.ch':0, 'polish.x':0, 'vkt.m':0, 'st.x':0,
  // мини-игры — НИКОГДА (give их не выдаст, даже если число впишут)
  'mgcore.day':0, 'mgcore.gold':0, 'mg1.x':0, 'mg2.x':0,
};

/* ===== LIST — ряды чисел ===== */
const LIST={
  // табель: 4 недели по образцу CAL; 0 — клетка-украшение (EVENT даёт украшение/рамку, если всё есть — CR event.tab_d), 28-я — тема сезона (или event.tab_t)
  'event.tab':[3,3,5,5,8,8,0, 3,3,5,5,8,8,0, 3,3,5,5,8,8,0, 3,3,5,5,8,8,0],
  // неделя новичка: 1 велосипед −50 %, 2 урок +10 💎, 3 «Витя привёл клиентов», 4 тема на 3 дня, 5 кредит Сони без переплаты, 6 пари Бориса ×2, 7 «Свой человек» +25 💎
  'first.w':[0,10,0,0,0,0,25],
};
// ключи, где ×2 за ролик разрешён (было в main у подарка дня); у остальных give режет mult до 1
const X2={'event.tab':1,'event.tab_d':1,'event.tab_t':1,'first.w':1};

/* ===== K — множители, доли, сроки (не 💎) ===== */
const K={
  // FIRST: подарки конвертов (временные, слабее дня живой игры)
  'first.bike':0.5,        // велосипед за полцены
  'first.vitya':1.2,       // «Витя привёл клиентов»: выручка ×1,2 на 1 игровой месяц, одна точка/подработка
  'first.vitya_m':1,       //   сколько игровых месяцев
  'first.theme_d':3,       // тема на 3 реальных дня
  'first.pari':2,          // пари Бориса ×2 (один раз)
  // EVENT
  'event.task_n':3,        // сколько заданий в день дают 💎 (3 × 2 = 6; с сундуком ≈ поручения main 9 + чуть-чуть)
  'event.season_every':4,  // каждая 4-я ступень сезона — 💎
  'event.season_pts':8,    // потолок очков сезона в день
  'event.srv_build':0.8,   // услуга Петра: срок одной стройки ×0,8
  'event.srv_deliv':0.95,  // услуга Вити: доставка ×0,95 на 1 игровой месяц
  'event.srv_rate':0.01,   // услуга Сони: −1 п. п. ставки одного кредита
  // FEST: праздничная точка ≈ месячная выручка одной точки игрока за весь праздник (В10)
  'fest.point_k':1.0,
  // RIVAL (В4)
  'rival.share_max':0.15,  // соперник занимает ≤ 15 % рынка вида
  'rival.mv_min':4, 'rival.mv_max':6,   // ход соперника раз в 4–6 игровых месяцев
  'rival.cut_k':1,'rival.buy_k':1,'quarry.mix_k':1,'quarry.grade_k':1,'quarry.tn_k':1,'fest.korp_th':0.5,   // MERGE: просьбы RIVAL/QUARRY/FEST
  // MGCORE «Сделать самому» (В6): серебро _s / золото _g, бронза = как сейчас; ≤ +3 % к доходу. Чаевые — доля оплаты заказа, ≤ tip_n смен/день
  'mgcore.tip_s':0.10,'mgcore.tip_g':0.20,'mgcore.tip_n':3,'mgcore.rt_g':0.01,'mgcore.rt_max':0.05,'mgcore.fly_s':1.15,'mgcore.fly_g':1.30,
  'mgcore.neg_s':0.005,'mgcore.neg_g':0.01,'mgcore.chk_s':0.01,'mgcore.chk_g':0.02,'mgcore.stand_s':1,'mgcore.stand_g':2,   // MGCORE cbceade/1387bb3, 04-minigames §5
  // TEAM (В8): черта управляющего ±3–5 % к итогу точки
  'team.trait':0.05,
  // TEAM 3aa4860: черты (все в пределах ±5 %; _m — игровых месяцев, rk — множитель риска/неприятностей, bonus_rt — порог ★)
  'team.fast_d':1.025,'team.fast_rk':1.3,'team.thrift_v':0.975,'team.thrift_d':0.99,'team.bonus_hi':1.02,'team.bonus_lo':0.985,'team.bonus_rt':4,'team.honest_d':0.98,
  'team.honestD_v':0.985,'team.honestD_d':0.99,'team.care_rk':0.6,'team.care_d':0.99,'team.rookie_lo':0.98,'team.rookie_hi':1.03,'team.rookie_m':6,'team.soul_d':1.03,'team.soul_v':1.02,'team.dir_m':6,'team.vet_m':12,
  // ECO «знание» за 💎: прибавка дохода ≤ 5 % (сторож sim-rags)
  'eco.know_max':0.05,
};

/* ===== P — цены в 💎 (новые стоки «знанием», П11) ===== */
const P={
  'eco.spy':8,       // «Сеть»: Тайный покупатель — какая точка теряет выручку и почему (раз в игровой месяц на город)
  'eco.insider':15,  // «Карьер»: Знакомый в комиссии — ставка соперника на этих торгах (раз на торги)
  'eco.geo':25,      // «Недра»: Геолог-светило — пуст ли участок до разведки (раз на участок)
};

/* ===== CAP — предел 💎 в реальные сутки. Ключ потока ('event') — на все его ключи без своего предела; полный ключ ('event.chest') — свой счётчик. 0 = 💎 нет. ===== */
const CAP={
  'event':11, 'event.chest':5, 'event.tab':16, 'event.tab_d':30, 'event.tab_t':50,
  'first':50, 'fest':5, 'cup':5, 'krai':8, 'krai2':8, 'story':20,
  'mgcore':0, 'mg1':0, 'mg2':0, 'rival':0, 'quarry':0, 'nedra':0, 'team':0, 'home':0, 'juice':0, 'polish':0, 'vkt':0, 'st':0,
};
const NOCR={mgcore:1,mg1:1,mg2:1};   // мини-игры: 💎 не даём (В6), жёстко

/* ===== F — ожидаемая частота в день у активного игрока (для бюджета, не для игры) и что из main заменяется ===== */
const F={
  'event.tab':{n:1, v:()=>(sum(LIST['event.tab'])+CR['event.tab_d']*3+CR['event.tab_t'])/28, x2:1},   // табель, все украшения уже есть (×2 — как в main)
  'event.task':{n:1, v:()=>CR['event.task']*K['event.task_n']},
  'event.chest':{n:0.7, v:()=>CR['event.chest']},
  'event.season':{n:1/28, v:()=>CR['event.season']*4},
  'fest.done':{n:2.5/30, v:()=>CR['fest.done']},
  'cup':{n:1/7, v:()=>2},                                  // в среднем ~2 💎 за неделю лиги (1-е место — редкость)
  'krai':{n:1/42, v:()=>CR['krai.all3']*4+CR['story.final']},   // Акт 2 ≈ 6 недель: 4 края × 8 + финал 20
};
// main: что новинки заменяют (💎/день у активного игрока)
const MAIN={base:45, gift:(3+3+5+5+8+8)/7+15/7, giftX2:1, task:9};
function sum(a){let s=0;for(const x of a)s+=x;return s;}
// budget(): прирост 💎/день от новинок к main. add ≤ base·0,10 — договор соблюдён. Без роликов (×2 нет) — справочно addNoAd/baseNoAd.
function budget(){
  const d={};for(const key in F){const f=F[key];d[key]=f.n*f.v()*(f.x2?2:1);}
  const old={'event.tab':MAIN.gift*2,'event.task':MAIN.task};
  let add=0;for(const key in d)add+=d[key]-(old[key]||0);
  const noAd=add-(d['event.tab']-old['event.tab'])/2;
  return {base:MAIN.base,add:Math.round(add*100)/100,pct:Math.round(add/MAIN.base*1000)/10,addNoAd:Math.round(noAd*100)/100,baseNoAd:22,d,ok:add<=MAIN.base*0.10};
}

const day=()=>{const d=new Date();return d.getFullYear()*1000+d.getMonth()*40+d.getDate();};
function cr(key){return NOCR[String(key).split('.')[0]]?0:(CR[key]|0);}
function list(key){const a=LIST[key];return a?a.slice():[];}
function k(key,def){const v=K[key];return typeof v==='number'?v:(def==null?1:def);}
function p(key){return P[key]|0;}
// give: n = CR[key]·mult (или явное n из ряда LIST: give('event.tab', 1, 8)); mult > 1 только для ключей X2. Предел — CAP[key], иначе CAP[поток].
function give(key,mult,n0){const id=String(key).split('.')[0];if(NOCR[id]||typeof GAME==='undefined'||!GAME.addCr)return 0;
  let m0=+mult||1;if(m0>1&&!X2[key])m0=1;const n=Math.round((n0!=null?+n0:cr(key))*m0);if(!(n>0))return 0;
  const ck=CAP[key]!=null?key:id,cap=CAP[ck];if(cap===0)return 0;const s=B2.s('o'),t=day();if(!s.d||s.d.t!==t)s.d={t};
  const got=s.d[ck]|0,m=cap>0?Math.max(0,Math.min(n,cap-got)):n;
  if(m>0){s.d[ck]=got+m;GAME.addCr(m,'b2'+id);}return m;}
function pay(key){const c=p(key);if(!(c>0)||typeof GAME==='undefined')return false;return GAME.spend(c,'b2'+key.replace('.','_'));}
B2.eco={CR,K,CAP,LIST,P,X2,cr,k,give,list,p,pay,budget,v:1};

/* ===== ECO в игре — только под флагом (?off=eco выключает всё ниже; таблицы выше работают всегда) ===== */
if(B2.off('eco')||typeof document==='undefined')return;
// В12 (владелец «да»): стартовый 11 → 7 голосов, торт 7 → 4. Яндекс — рубли в консоли Яндекса (49 ₽ и 29 ₽ ставит владелец при выпуске); VK — hobby-pay/catalog.json (ECO-tools/catalog-b2.json)
try{PAY_ITEMS.starter.vk=7;PAY_ITEMS.tea.vk=4;PAY_TEST.starter=49;PAY_TEST.tea=29;}catch(e){}
// П7: в бете ролик-заглушка идёт как настоящий — за награду 30 с, межэкранная 10 с (урок N1: мгновенные заглушки ускоряли «Недра»). ?adfast=1 и проверки (__chk) — как раньше
try{const st0=window.stubAd,sr0=window.showRewarded;let rew=0;
  if(typeof st0==='function'&&typeof sr0==='function'){
    window.showRewarded=function(){rew=1;try{return sr0.apply(this,arguments);}finally{rew=0;}};
    window.stubAd=function(cb){if(!B2.beta||window.__chk||/[?&]adfast=1/.test(location.search))return st0(cb);
      const ad=document.getElementById('ad'),tEl=document.getElementById('adT');if(!ad||!tEl)return st0(cb);
      adOpen();ad.classList.add('on');let n=rew?30:10;tEl.textContent=n;
      const it=setInterval(()=>{n--;tEl.textContent=n;if(n<=0){clearInterval(it);ad.classList.remove('on');adClose();cb();}},1000);};}}catch(e){}
// П10/П11: карточки «знание за 💎» и меценатство — в гнезде «Сегодня» с главы «Сеть»; код — js/b2-eco-x.js по требованию (старт не тяжелеет)
const late=W=>!!W&&(W.ned||W.st==='mid'||W.st==='quarry'||W.st==='nedra');let ld=0;
const X=()=>{if(B2.ecoX)return Promise.resolve(B2.ecoX);if(!ld)ld=B2.need('b2-eco-x.js').catch(()=>{ld=0;});return ld.then(()=>B2.ecoX);};
B2.slot('today','eco',ctx=>{const W=ctx&&ctx.W;if(!late(W))return '';if(B2.ecoX)return B2.ecoX.card(W);X();return '';},20);
B2.click('eco',(act,arg)=>{X().then(x=>{if(x)x.click(act,arg);});});
})();
