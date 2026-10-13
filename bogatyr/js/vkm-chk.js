'use strict';
/* ================= миссии VK, лента друзей и таблица результатов (vkm, 10.10.2026; образец — «Баба Зина», js/extras.js) =================
   Условия миссий — данными: VKM=[[код, счётчик, порог(, аргумент)],…] в js/vkm.js (пишет tools/missions.py — список править ТОЛЬКО там).
   Счётчики — VKM_CNT: то, что игра уже считает (кампания, звёзды, нечисть, кузница, мета, забавы…). Новых ключей сейва нет, кроме трёх чисел
   в S.stats (в облаке сливаются максимумом, как вся S.stats): dch — открыто Сундуков дня всего, dcd — день последнего (ГГГГММДД), strk — лучшая серия.
   vkmCheck() сообщает модулю SOC «уровень» (уровень Славы), «очки» (одолено нечисти — то же число, что в «Таблице друзей») и выполненные миссии.
   Отправкой, очередью, порциями (до 2 миссий в запросе, до 4 за сеанс) и повторами занят SOC (S.soc.ev); здесь — ни сети, ни окон, ни наград.
   Старому игроку всё уже выполненное отмечается при первой же проверке и уходит тихо, порциями — по 4 миссии за сеанс.
   Только ВКонтакте: в Одноклассниках, на Яндексе и в снимках для магазина — сразу выход, сейв не меняется.
   Зовётся: через 3 и 12 с после запуска, из statPrg (после облака, после похода, при смене вкладки), после Сундука дня и раз в 20 с, пока игрок в меню (мета, забавы, покупки). */
const VKM_CNT=(function(){
  const ob=v=>v&&typeof v==='object'?v:{},sum=o=>{let n=0;for(const k in ob(o))n+=+o[k]||0;return n;},cnt=o=>{let n=0;for(const k in ob(o))if(o[k])n++;return n;};
  const lair=th=>{for(const r of CAMP)if(r.th===th&&r.n===3)return r.slot;return -1;};
  const wins=d=>{let n=0;for(const s of ORD)if(difWon(s,d))n++;return n;};
  return {
    cn:()=>{let n=0;for(const s of ORD)if(S.done[s])n++;return n;},                                    // пройдено глав на Обычной
    ln:()=>{let n=0;for(const r of CAMP){if(r.n!==3||ORD.indexOf(r.slot)<0)continue;if(!S.done[r.slot])break;n++;}return n;}, // освобождено земель подряд («Логово»)
    cs:()=>wins('s'),ch:()=>wins('h'),                                                                // побед в главах на Сложной / Адской
    lw:a=>{const p=String(a).split(':'),s=lair(p[1]);return s>=0&&ORD.indexOf(s)>=0&&difWon(s,p[0])?1:0;}, // «Логово» земли на уровне: 's:les'
    st:()=>cnt(S.stars),                                                                              // звёзд на всех сложностях
    k:()=>+S.kills||0,r:()=>+S.runs||0,                                                               // одолено нечисти, походов
    h:()=>HEROES.filter(heroOpen).length,rk:()=>Math.max(0,...Object.values(ob(S.rank)).map(v=>+v||0)),rks:()=>sum(S.rank), // богатыри и звания
    ev:()=>cnt(S.evoSeen),byl:()=>+ob(ob(S.wpn).n).byl||0,                                             // эволюции, былинные слияния
    fg:()=>sum(S.forge),vl:()=>BLD.filter(b=>S.village[b.id]).length,ar:()=>sum(S.armory),             // кузница, деревня, Оружейная
    sl:()=>S.slava&&typeof slLv==='function'?slLv(S.slava.x).l:0,                                      // уровень Славы
    sg:()=>S.slava&&typeof slSaga==='function'&&typeof sagaStep==='function'?sagaStep(slSaga().p):0,   // ступень текущего Сказа месяца
    pl:()=>{const p=ob(S.pet);return (p.own||[]).length?Math.max(1,...(p.own||[]).map(t=>+ob(p.lv)[t]||1)):0;}, // старший питомец
    pls:()=>{const p=ob(S.pet);let n=0;for(const t of p.own||[])n+=+ob(p.lv)[t]||1;return n;},
    tc:()=>{let n=0;const c=ob(ob(S.terem).c);for(const k in c)if(c[k]>=5)n++;return n;},              // уголков Терема, восстановленных полностью
    yh:()=>+ob(ob(ob(S.meta).y).c).h||0,yb:()=>+ob(ob(ob(S.meta).y).c).b||0,                           // урожаев, блюд
    or:()=>+ob(S.tro).on||0,                                                                          // заказов на Торжке
    zn:()=>sum(ob(S.zab).n),zd:()=>cnt(ob(S.zab).n),                                                   // забав сыграно всего / разных
    en:()=>Math.floor((+S.endBest||0)/60),wk:()=>+ob(S.stats).weeks||0,                                // сеча (минут), Испытаний недели
    dc:()=>+ob(S.stats).dch||0,sk:()=>+ob(S.stats).strk||0,                                            // Сундуков дня всего / подряд
    bs:()=>cnt(S.meet),bsall:()=>BEST_ORDER.length>0&&BEST_ORDER.every(t=>S.meet[t])?1:0,              // Книга нечисти
    ac:()=>cnt(S.ach),acall:()=>ACH.filter(a=>!a.on||a.on()).every(a=>S.ach[a.id])?1:0,                // достижения игры
    lv:()=>+ob(S.stats).maxLvl||0,cu:()=>+ob(S.stats).maxCurse||0,                                     // рекорды похода, Проклятия
    fk:()=>Object.keys(ob(S.skins)).some(k=>/@koshei$/.test(k)&&S.skins[k])?1:0                        // облик «Кощеев» (Кощеева неделя)
  };})();
/* Сундук дня: считаем по состоянию заданий дня (S.dq.bonus — сундук сегодня открыт), один раз за день; лучшая серия — из S.streak */
function vkmDay(){const st=S.stats;if(!st||typeof st!=='object')return false;let ch=false;
  const dq=S.dq;if(dq&&dq.bonus&&typeof dq.day==='string'){const d=+dq.day.replace(/\D/g,'')||0;if(d>(+st.dcd||0)){st.dcd=d;st.dch=(+st.dch||0)+1;ch=true;}}
  const n=+(S.streak&&S.streak.n)||0;if(n>(+st.strk||0)){st.strk=n;ch=true;}
  if((+st.dch||0)<(+st.strk||0)){st.dch=st.strk;ch=true;} /* старый игрок: открытых сундуков не меньше, чем дней в серии */
  return ch;}
function vkmOn(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&!OK&&typeof VKM!=='undefined'&&typeof SOC!=='undefined'&&!window.__demo&&!/[?&]promo\b/.test(location.search);}
function vkmCheck(){try{
  if(!vkmOn())return;
  if(vkmDay())save();
  const lv=VKM_CNT.sl();if(lv>1)SOC.level(lv);SOC.score(VKM_CNT.k());
  const memo={};
  for(const m of VKM){if(SOC.missionKnown(m[0]))continue;const f=VKM_CNT[m[1]];if(!f)continue;
    const key=m[1]+(m[3]?'|'+m[3]:'');if(!(key in memo))memo[key]=+f(m[3])||0;
    if(memo[key]>=m[2])SOC.mission(m[0]);}
}catch(e){if(!vkmCheck.err){vkmCheck.err=1;console.warn('vkm: '+(e&&e.message||e));}}}
if(vkmOn()){setTimeout(vkmCheck,3000);setTimeout(()=>{vkmCheck();try{SOC.evFlush();}catch(e){}},12000);} /* первый заход старого игрока: сразу после запуска и ещё раз после облака */
if(vkmOn())setInterval(()=>{try{if(!document.hidden&&!(typeof G!=='undefined'&&G))vkmCheck();}catch(e){}},20000);
