'use strict';
/* ================= OB:MERGE — глубина прокачки поздних земель (решение владельца 08.10, по итогам сборки) =================
   К концу кампании звёзды было некуда тратить (кузница I+II ≈130★ из 231) — «без прокачки» и «с прокачкой» в последних землях
   почти не отличались. Добавлено (по образцу Кузницы II и Деревни II), открывается после босса «Студёных гор» (место 6 в CH_ORDER):
   - Кузница III «Булатные мастера» — ступени на ВСЕ заставы за звёзды (FORGE_EXTRA с полем lock): урон +10 % ×6, перезарядка −7 % ×5 (74★);
   - Деревня: «Оружейная палата» — все заставы бьют на 8 % сильнее за уровень (2 500 / 4 000 / 6 000 / 9 000 золота).
   Действие — крючок розетки меты ST (поправка характеристик заставы в tstat). Новых полей сохранения нет: S.forge.bul/skor, S.village.arsn. */
const F3_LOCK=4;   // глава, после босса которой открывается (Студёные горы)
function fxLocked(x){return x&&x.lock!=null&&!S.stars[x.lock+'-5'];}
const F3_BUL={k:'bul',n:'Булатные наконечники',d:['+10% урона всем заставам','ещё +10% урона','ещё +10% урона','ещё +10% урона','ещё +10% урона','ещё +10% урона'],cost:[4,5,6,7,8,9],ic:'ti_arch_3',lock:F3_LOCK};
const F3_SKOR={k:'skor',n:'Скорые затворы',d:['все заставы стреляют на 7% чаще','ещё на 7% чаще','ещё на 7% чаще','ещё на 7% чаще','ещё на 7% чаще'],cost:[5,6,7,8,9],ic:'ti_pushka_3',lock:F3_LOCK};
FORGE_EXTRA.push(F3_BUL,F3_SKOR);
langReg(F3_BUL,{n:'Damascus Arrowheads',d:['+10% damage for all outposts','another +10% damage','another +10% damage','another +10% damage','another +10% damage','another +10% damage']});
langReg(F3_SKOR,{n:'Quick Breeches',d:['all outposts fire 7% more often','another 7% more often','another 7% more often','another 7% more often','another 7% more often']});
const F3_ARSN={id:'arsn',name:'Оружейная палата',ic:'b_arsn',about:'Все заставы бьют на 8% сильнее за каждый уровень',cost:[2500,4000,6000,9000],ch:F3_LOCK};
BLD.push(F3_ARSN);langReg(F3_ARSN,{name:'Armoury',about:'All outposts hit 8% harder per level'});VIL_POS.arsn=[.18,.86];
art('b_arsn',48,g=>{hut(g,'#8a8f98','#3a4a6a',13);g.save();g.lineCap='round';g.lineWidth=3;g.strokeStyle='#e8e8f0';
  g.beginPath();g.moveTo(-9,-2);g.lineTo(9,14);g.moveTo(9,-2);g.lineTo(-9,14);g.stroke();g.strokeStyle='#c8902a';g.beginPath();g.moveTo(-7,9);g.lineTo(-2,9);g.moveTo(2,9);g.lineTo(7,9);g.stroke();g.restore();});
function f3ST(o,type){if(!o)return;const b=forgeN('bul'),s=forgeN('skor'),a=(S.village&&S.village.arsn)||0;if(!b&&!s&&!a)return;
  const k=(1+.1*b)*(1+.08*a);if(k!==1){if(o.dmg!=null)o.dmg*=k;if(o.dps!=null)o.dps*=k;if(o.fire)o.fire*=k;}
  if(s&&o.cd)o.cd*=1-.07*s;}
if(typeof META_MODS!=='undefined')META_MODS.push({id:'f3',ST:f3ST});
