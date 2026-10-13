'use strict';
/* ================= миссии VK, лента друзей и таблица (vkm, 10.10.2026; образец — Зина: slovo/js/extras.js vkmCheck) =================
   Условия миссий — данными: VKM=[[код, счётчик, порог(, довесок)],…] в js/vkm.js (пишет tools/missions.py — список править только там).
   Счётчики — VKM_CNT: то, что игра уже считает (звёзды, кузница, деревня, Слава, турнир, Торжок, изба, осада…). Двух счётчиков в игре не было —
   они живут в S.vkm: d — дней службы (разных дней, когда закончен хоть один бой или мини-игра; k — последний такой день, a — «дел всего» при
   последней проверке), z — дней с наградой «Заставы дня» (zk — последний такой день). FIX/MERGE — через розетку меты (максимум).
   vkmCheck() сообщает модулю SOC уровень (пройдено уровней похода), очки (рекорд осады — то же число, что в таблице друзей VK) и выполненные
   миссии; отправкой, очередью и повторами занят SOC (S.soc.ev: до 2 миссий за запрос и 4 за сеанс — старому игроку всё засчитается тихо, порциями).
   Зовётся сама: через ~1,5 с после любого save() (обёртка ниже) и через 4 с после запуска. Ни сети, ни окон, ни наград здесь нет.
   Только ВКонтакте: в ОК, в Яндексе и в режиме снимков — ничего не считается, не запоминается и не шлётся. Грузится последним (после endg.js). */
const VKM_ON=typeof PLAT!=='undefined'&&PLAT==='vk'&&!OK&&!SHOT&&typeof VKM!=='undefined'&&typeof SOC!=='undefined';
function VKM_FIX(s){s=s||S;if(!VKM_ON&&s.vkm==null)return;const v=s.vkm,n=x=>Math.max(0,Math.floor(+x||0)),t=x=>typeof x==='string'?x:'';
  s.vkm=v&&typeof v==='object'&&!Array.isArray(v)?{d:n(v.d),k:t(v.k),a:n(v.a),z:n(v.z),zk:t(v.zk)}:{d:0,k:'',a:0,z:0,zk:''};}
function VKM_MERGE(other,o){const b=other&&other.vkm;if(!VKM_ON&&o.vkm==null&&(!b||typeof b!=='object'))return;if(o.vkm==null)o.vkm={};VKM_FIX(o);if(!b||typeof b!=='object')return;const a=o.vkm;
  a.d=Math.max(a.d,Math.floor(+b.d||0));a.a=Math.max(a.a,Math.floor(+b.a||0));a.z=Math.max(a.z,Math.floor(+b.z||0));
  if(typeof b.k==='string'&&b.k>a.k)a.k=b.k;if(typeof b.zk==='string'&&b.zk>a.zk)a.zk=b.zk;}
function vkmSum(o){let n=0;if(o&&typeof o==='object')for(const k in o)n+=+o[k]||0;return n;}
function vkmBoss(k,c){return k==='n'?(S.stars[c+'-5']?1:0):((S.dst||{})[k+c+'-5']?1:0);}
function vkmLands(k){let n=0;for(const c of CH_ORDER)n+=vkmBoss(k,c);return n;}
const VKM_CNT={
  lv:()=>Math.min(77,Object.keys(S.stars).filter(k=>S.stars[k]>0).length),                 // пройдено уровней похода на Обычном (с Логовами)
  b:c=>vkmBoss('n',c),                                                                     // босс земли c одолён (Обычный)
  lr:()=>CH_ORDER.filter(c=>S.stars[c+'-6']).length,                                       // Логов разорено
  st:()=>starsTotal(),                                                                     // звёзд похода (Обычный)
  sw:()=>crownsN(),sb:()=>vkmLands('s'),                                                   // ⚔ Сложный: уровней / земель с одолённым боссом
  hw:()=>hellN(),hb:()=>vkmLands('h'),                                                     // 🔥 Адский
  fg:()=>{let n=0;for(const t of TW_ORDER)for(const r of FORGE_ORDER[t])if(fHas(t,r[0]))n++;return n;}, // улучшений застав в кузнице (из 40)
  f3:()=>(+S.forge.bul||0)+(+S.forge.skor||0),                                             // Кузница III: наконечники + затворы (11)
  vb:()=>BLD.filter(b=>S.village[b.id]).length,                                            // построек деревни
  vl:()=>BLD.every(b=>(+S.village[b.id]||0)>=b.cost.length)?41:Math.min(40,vkmSum(S.village)), // деревня отстроена до конца → 41
  ms:()=>vkmSum(S.mst),bg:()=>vkmSum(S.bgs),                                               // уровней мастерства / богатырских ступеней
  sv:()=>S.sl&&typeof slLv==='function'?slLv(S.sl.x).l:0,                                  // уровень Славы
  rk:()=>S.sl&&typeof slRankI==='function'?slRankI():0,                                    // звание (0 — Ратник … 4 — Богатырь)
  tl:()=>S.sl?vkmSum(S.sl.t):0,                                                            // очков в Древе воеводы
  tg:()=>S.tour?vkmSum(S.tour.g):0,tr:()=>S.tour?+S.tour.tr||0:0,                          // турнир: грамот / ступень
  to:()=>S.trf?+S.trf.on||0:0,                                                             // заказов на Торжке
  mg:()=>S.dzr?vkmSum(S.dzr.n):0,                                                          // мини-игр сыграно
  md:()=>S.dzr&&S.dzr.n?Object.keys(S.dzr.n).filter(k=>+S.dzr.n[k]>0).length:0,            // разных мини-игр
  dn:()=>S.vkm?S.vkm.d:0,dz:()=>S.vkm?S.vkm.z:0,                                           // дней службы / «Застав дня»
  en:()=>+S.endBest||0,wk:()=>+S.wkN||0,dc:()=>+S.dchN||0,kl:()=>+S.kills||0,              // осада, Босс недели, испытания дня, нечисть
  bk:()=>BOOK.length>0&&BOOK.every(bookKnown)?1:0,                                         // Книга нечисти собрана
  fk:()=>S.festK?+S.festK.hw26||0:0                                                        // одолено в «Ночь нечисти»
};
// свои счётчики: день службы — когда «дел» (боёв + осад + мини-игр) стало больше, чем при прошлой проверке; «Застава дня» — по S.dlyO.got
function vkmCount(){if(!S.vkm)VKM_FIX(S);const v=S.vkm,day=dayKey();let ch=false;
  const act=(+S.runs||0)+(+S.endRuns||0)+VKM_CNT.mg();
  if(!v.k&&!v.a&&!v.d){v.a=act;v.k=act>0?day:'';v.d=Math.max(act>0?1:0,Math.min(30,+(S.login&&S.login.n)||0));ch=act>0;} // первый запуск с миссиями: старому игроку — дни его серии входа
  else if(act>v.a){v.a=act;if(v.k!==day){v.k=day;v.d++;}ch=true;}
  const o=S.dlyO;if(o&&o.got&&typeof o.day==='string'&&o.day>v.zk){v.zk=o.day;v.z++;ch=true;}
  return ch;}
let vkmIn=false,vkmT=0;
function vkmCheck(){if(!VKM_ON||vkmIn)return;vkmIn=true;try{
  const ch=vkmCount();
  SOC.level(VKM_CNT.lv());SOC.score(VKM_CNT.en());
  const memo={};
  for(const m of VKM){if(SOC.missionKnown(m[0]))continue;const f=VKM_CNT[m[1]];if(!f)continue;const k=m[1]+':'+(m.length>3?m[3]:'');
    if(!(k in memo)){try{memo[k]=+f(m[3])||0;}catch(e){memo[k]=0;}}
    if(memo[k]>=m[2])SOC.mission(m[0]);}
  if(ch)save();
}catch(e){}vkmIn=false;}
function vkmSoon(ms){if(!VKM_ON||vkmT)return;vkmT=setTimeout(()=>{vkmT=0;vkmCheck();},ms||1500);}
if(typeof META_MODS!=='undefined')META_MODS.push({id:'vkm',FIX:VKM_FIX,MERGE:VKM_MERGE});
VKM_FIX(S);  // первая загрузка: META_HK('FIX') ещё не знал модуля
if(VKM_ON){const save0=save;save=function(){save0.apply(this,arguments);if(!vkmIn)vkmSoon();};vkmSoon(4000);}
window.__vkm={check:vkmCheck,CNT:VKM_CNT,on:VKM_ON}; // для проверок на маке
