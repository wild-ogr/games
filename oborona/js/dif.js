'use strict';
/* ================= OB:DIF — три режима сложности по главам (08.10.2026) =================
   План: hobby-analytics/release-i/oborona-boost/02-difficulty.md, журнал logs/DIF.md.
   Обычный (n) — основной путь (бывшая «Быль», трудность по таблице DIF_NRM); ⚔ Сложный (s) — в главе после победы над её боссом на Обычном;
   🔥 Адский (h) — после босса этой главы на Сложном. Внутри главы уровни Сложного/Адского идут по порядку.
   Звёзды Сложного/Адского — S.dst['s0-3'], S.dst['h0-3'] (НЕ в S.stars: кузница и «Летопись» считают только Обычный). Выбор режима — S.dfc[глава].
   Всё по номеру главы, без жёстких «8»: новые главы (CH, номера 8+) получают режимы сами; строки таблиц — DIF_NRM (подобрано ботом по CH_ORDER), ⚔/🔥 — DIF_MUL.
   Осада, Босс недели и Испытание дня — всегда Обычный (difApply их не трогает). «Сказки» больше нет: S.diff не читается (diffNow → 1). */
const DIF_K=['n','s','h'];
/* lives — доля жизней, coins — стартовых монет, pause — пауза между волнами, spd — скорость нечисти, gold — золото победы,
   lead — вожак: 1 — в последней волне, 3 — ещё и в каждой 3-й; boss — здоровье босса главы; cd — перезарядка чар; ban — одна застава главы под запретом */
const DIF={n:{gold:1},
  s:{lives:.75,coins:.9,pause:.85,spd:1,gold:1.3,lead:1},
  h:{lives:.5,coins:.8,pause:.75,spd:1.1,gold:1.6,lead:3,boss:1.3,cd:1.3,ban:1}};
// застава под запретом в Адском: своя у каждой главы (стрельцы — никогда: на 1-1 других нет)
const DIF_BAN=['mag','dub','izba','pushka'];
function difBan(c){return DIF_BAN[c%DIF_BAN.length];}
/* здоровье нечисти по уровням (ключ 'глава-уровень', с 0; Логово — уровень 6). Подбор ботом: merge-tools/cal.js, журнал MERGE.md.
   DIF_NRM — Обычный, множитель поверх прежней «Были» (решение владельца 08.10: в новую главу без новых улучшений ≈50 % поражений,
   с разумной прокачкой ≈85–90 % побед с первой попытки; главы 1–2 мягче — без прокачки 80–90 % побед). Все 11 глав по CH_ORDER.
   ⚔ Сложный и 🔥 Адский (решение владельца 08.10, «сложный значит сложный»): ЕДИНОЕ правило для всех глав —
   здоровье = Обычный этой главы × DIF_MUL[режим][место главы в CH_ORDER], отличия режима — таблица DIF выше (жизни, монеты, пауза, скорость, вожаки, босс, чары, запрет).
   Цель: ⚔ с полной прокачкой, доступной к этому месту кампании, ≈75–80 % побед, 🔥 ≈50 %; сразу после открытия может быть не по силам — это нормально. */
const DIF_NRM={};
(function(){const R={"1":[1.95,2.35,1.8,2.05,2.2,1.2,0.95],"2":[2,1.45,1.2,1.15,0.9,1.05,0.9],"3":[2.2,1.8,1.8,1.05,0.95,0.95,0.9],"4":[3.15,2.35,2.1,2.1,1.95,1.15,1.35],"5":[3,2.45,1.5,1.7,1.35,1.15,1.1],"6":[2.95,2.45,2.05,1.45,1.5,1.25,1.15],"7":[3.65,2.7,1.9,2.35,2.15,1.4,1.8],"8":[1.05,1,0.85,0.9,1,1,0.85],"9":[0.93,1.05,1.25,0.95,1.1,1.05,1.2],"10":[1,1.1,0.9,0.9,1,1.2,1.05]};for(const c in R)R[c].forEach((v,l)=>{if(v!==1)DIF_NRM[c+'-'+l]=v;});})();   // подбор merge-tools/cal.js calN (журнал MERGE.md); FINAL 08.10: перекалибровка на итоговой сборке (final-tools: calN с целями 0,89/0,87 → смесь 0,6 со старой таблицей; Лукоморье 9-0 и Тридевятое 7-0…7-5 — отдельно по решению владельца: стена 35–65 %) — с 1-й попытки ≈89 %, стена ≈50–60 %, гл.1–2 ≈95–98 % (FINAL.md); [глава]: уровни 1–6 и Логово

const DIF_MUL={s:[2.15,1.09,1.18,0.96,0.97,2.35,2.33,2.47,2.39,2.47,1.89],h:[1.95,0.94,0.88,0.82,0.77,1.7,1.78,1.98,1.91,2.17,1.85]};   // ⚔/🔥: множитель здоровья к Обычному по МЕСТУ главы. FINAL 08.10: места 0–4 поделены на рост DIF_NRM места (проверка verD2 — как у MERGE); места 5–10 заново подобраны методикой ENDG (sens.js perChV: все ★ + вся открытая деревня → ⚔ 78 %, 🔥 50 %) на новой таблице Обычного; в CH_ORDER (0…10). OB:ENDG места 5–10 (поздние земли, с Кузницей III): «полная прокачка к этому месту» = все ★ + ВСЯ открытая деревня (endg-tools perChV) — иначе после отстройки деревни 🔥 там 100 % (было 1,6…1,7 / 1,1…1,45) — одна цель везде: полная прокачка к этому месту → ⚔ ≈78 %, 🔥 ≈50 % (подбор merge-tools/cal.js perCh)
function difMul(c,k){const p=Math.max(0,CH_ORDER.indexOf(c)),m=DIF_MUL[k];return Array.isArray(m)?(m[p]!=null?m[p]:m[m.length-1]):m;}
function difHp(c,l,k){const n=DIF_NRM[c+'-'+l]||1;return k==='s'||k==='h'?n*difMul(c,k):n;}

/* ---------- прогресс режимов ---------- */
function difStars(c,l,k){return k==='s'||k==='h'?(+(S.dst||{})[k+c+'-'+l]||0):(+S.stars[c+'-'+l]||0);}
function difPut(c,l,k,st){if(k==='s'||k==='h'){S.dst=S.dst||{};S.dst[k+c+'-'+l]=Math.max(+S.dst[k+c+'-'+l]||0,st);}else S.stars[c+'-'+l]=Math.max(+S.stars[c+'-'+l]||0,st);}
function difWon(c,k){return difStars(c,5,k)>0;}                                        // босс главы взят в этом режиме
function difOpen(c,k){return k==='s'?difWon(c,'n'):k==='h'?difWon(c,'s'):true;}       // режим открыт в главе
function difLvOpen(c,l,k){if(k!=='s'&&k!=='h')return lvOpen(c,l);return difOpen(c,k)&&(l===0||difStars(c,l-1,k)>0);}
function difOf(c){const k=S.dfc&&S.dfc[c];return (k==='s'||k==='h')&&difOpen(c,k)?k:'n';}
function difCount(k){let n=0;for(const x in S.dst||{})if(x[0]===k&&S.dst[x]>0)n++;return n;}  // уровней, пройденных в режиме
function difStarsN(k){let n=0;for(const x in S.dst||{})if(x[0]===k)n+=+S.dst[x]||0;return n;}
function difAny(){return chaptersDone()>0;}   // ряд режимов показываем, когда хоть в одной главе открыт Сложный

/* ---------- миграция и починка сохранения (зовётся из fixSave и при загрузке) ----------
   Без потерь: звёзды (и полученные на «Сказке») остаются; короны «Богатырской» = победа на Сложном с 1★ (улучшить — сыграв);
   короны на боссе главы открывают там и Адский (через ту же победу). Повторять безопасно — после облака тоже. */
function difFix(){if(!S.dst||typeof S.dst!=='object'||Array.isArray(S.dst))S.dst={};if(!S.dfc||typeof S.dfc!=='object'||Array.isArray(S.dfc))S.dfc={};
  for(const k in S.crown||{})if(S.crown[k]&&/^\d+-\d+$/.test(k)&&!(S.dst['s'+k]>0))S.dst['s'+k]=1;
  for(const k in S.dst)if(!/^[sh]\d+-\d$/.test(k)||!(+S.dst[k]>=0))delete S.dst[k];
  if(!S.dfV){S.dfV=1;S.diff=1;}}
difFix();
// облако: звёзды режимов — максимум, выбор режима — из основы, недостающее из другого (зовётся из mergeProgress)
function difMerge(o,other){const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};const a=Object.assign({},obj(o.dst)),b=obj(other.dst);
  for(const k in b)a[k]=Math.max(+a[k]||0,+b[k]||0);o.dst=a;o.dfc=Object.assign({},obj(other.dfc),obj(o.dfc));o.dfV=Math.max(+o.dfV||0,+other.dfV||0);}

/* ---------- бой: режим накладывается поверх уже собранного G (зовётся из newBattle до STAT.lvl) ---------- */
function difApply(o){G.dif='n';if(G.endless||G.wk||G.rule)return;
  const k=o&&(o.dif==='n'||o.dif==='s'||o.dif==='h')?o.dif:difOf(G.ci),c=G.ci,l=G.li,P=DIF[k];G.dif=k;
  if(k==='n'){G.hpK*=difHp(c,l,'n');return;}
  G.hpK=difHp(c,l,k);G.nov=0;G.tut=0;   // без «мягкого старта», «боевого духа» и подмоги монетами
  G.lives=G.maxLives=Math.max(3,Math.round(G.lives*P.lives));
  G.coins=Math.max(0,Math.round((G.coins-pityCoins(c,l))*P.coins));
  G.dpause=P.pause;G.dspd=P.spd;G.dcd=P.cd||1;G.dban=P.ban?difBan(c):'';
  const nw=G.waves.length;G.waves.forEach((w,i)=>{
    if(P.boss)for(const g of w.g)if(EN[g.t].boss)g.hpm=(g.hpm||w.hpm)*P.boss;
    if((i===nw-1||P.lead===3&&i%3===2)&&!w.g.some(g=>g.lead)){
      const q=w.g.filter(g=>!EN[g.t].boss).sort((a,b)=>EN[a.t].hp-EN[b.t].hp)[0];if(q)w.g.push({t:q.t,n:1,iv:1,delay:9,lead:2});}});}
// звёзды Сложного/Адского — по доле потерянных жизней (при 10–15 жизнях «≤2 / ≤10» почти бесплатно)
function difStarsFor(){const lost=G.maxLives-G.lives,f=lost/Math.max(1,G.maxLives);return f<=.1?3:f<=.5?2:1;}
function difLeak3(){return Math.floor((G&&G.maxLives||10)*.1);}
// вожак любого вида: имя — имя нечисти (свои имена — в LEAD.n, как Леший-батюшка)
for(const t in EN)if(!Object.prototype.hasOwnProperty.call(LEAD.n,t))Object.defineProperty(LEAD.n,t,{get:()=>EN[t].n,enumerable:false,configurable:true});

/* ---------- тексты и ряд выбора ---------- */
function difName(k){return k==='s'?Lg('⚔ Сложный','⚔ Hard'):k==='h'?Lg('🔥 Адский','🔥 Hell'):Lg('Обычный','Normal');}
function difIcon(k){return k==='s'?'⚔':k==='h'?'🔥':'';}
function difNote(k,c){c=c||0;const g=v=>dnum(String(v));
  return k==='s'?Lg('Жизней и монет меньше, передышка короче, в последней волне — вожак. Свои звёзды · золота ×'+g(DIF.s.gold),'Fewer lives and coins, shorter breaks, a leader in the last wave. Own stars · gold ×'+DIF.s.gold)
    :k==='h'?Lg('Жизней вдвое меньше, нечисть быстрее, босс крепче, вожаки, '+TW[difBan(c)].n+' под запретом. Свои звёзды · золота ×'+g(DIF.h.gold),'Half the lives, faster monsters, a tougher boss, leaders, '+TW[difBan(c)].n+' banned. Own stars · gold ×'+DIF.h.gold)
    :Lg('Основной путь: звёзды идут в кузницу. После поражения — «боевой дух» и подмога.','The main path: stars go to the forge. After a defeat — fighting spirit and aid.');}
function difLockTxt(k){return k==='s'?Lg('⚔ Сложный откроется, когда победишь босса главы на Обычном','⚔ Hard opens once you beat the chapter boss on Normal'):Lg('🔥 Адский откроется, когда победишь босса главы на Сложном','🔥 Hell opens once you beat the chapter boss on Hard');}
function difRowHTML(c){const cur=difOf(c);
  return '<div class="difrow"><div class="seg">'+DIF_K.map(k=>{const op=difOpen(c,k);return '<button data-dk="'+k+'" class="'+(cur===k?'on':'')+(op?'':' lock')+'">'+(op?difName(k):'🔒 '+(k==='s'?Lg('Сложный','Hard'):Lg('Адский','Hell')))+'</button>';}).join('')+'</div>'+
    (cur!=='n'?'<p class="note difnote">'+difNote(cur,c)+'</p>':difOpen(c,'s')&&!difWon(c,'s')?'<p class="note difnote">'+Lg('⚔ Сложный открыт: свои звёзды, золота ×','⚔ Hard is open: own stars, gold ×')+dnum(String(DIF.s.gold))+'</p>':'')+'</div>';}
// выбор режима: src — где нажали (map / intro / res / lose); после выбора — cb()
function difSet(c,k,src,cb){if(!difOpen(c,k)){SND.click();toast(difLockTxt(k));return false;}
  if(difOf(c)!==k){S.dfc[c]=k;save();try{STAT.ev('mod',{m:'dif',a:k,l:c+1,c:src||'map'});}catch(e){}}SND.click();if(cb)cb();return true;}
function difRowBind(el,c,src,cb){for(const b of (el||document).querySelectorAll('[data-dk]'))b.onclick=()=>difSet(c,b.dataset.dk,src,cb);}
// первый неигранный уровень главы в режиме (для «Играть»)
function difNextLv(c,k){let nl=0;const N=typeof chLvN==="function"?chLvN(c):6;for(let l=0;l<N;l++){if(!difLvOpen(c,l,k))break;if(l<6||!difStars(c,l,k))nl=l;if(!difStars(c,l,k))break;}return nl;}   // OB:MERGE с Логовом (CH)
// после победы: что открылось (блок в окне итогов)
function difUpHTML(c,up){if(!up)return '';const last=chaptersDone()>=CH.length&&up==='s';
  return '<div class="goal difup" data-fit="6"><b>'+(up==='s'?Lg('⚔ В этой главе открыт Сложный','⚔ Hard is now open in this chapter'):Lg('🔥 В этой главе открыт Адский','🔥 Hell is now open in this chapter'))+'</b>'+
    (last?'<br>'+Lg('Кампания пройдена! Дальше — ⚔ Сложный: в каждой главе.','Campaign complete! Next — ⚔ Hard, in every chapter.'):'')+'<br>'+(up==='s'?Lg('Свои звёзды · золота ×','Own stars · gold ×')+dnum(String(DIF.s.gold)):Lg('Свои звёзды · золота ×','Own stars · gold ×')+dnum(String(DIF.h.gold)))+'</div>';}
// поражения подряд на уровне Сложного/Адского (в памяти) — после двух кнопка «Сыграть на Обычном»
const DIF_LOSE={};
(function(){const st=document.createElement('style');st.textContent='.difrow{margin:6px 0 2px}.difrow .seg{margin:4px 0}.seg button.lock{opacity:.55}.difnote{margin:0 2px 4px}.lvls.dif-s .lvl{box-shadow:0 0 0 2px #c8962a inset}.lvls.dif-h .lvl{box-shadow:0 0 0 2px #e0502a inset}.difup b{color:#ffe7a0}html.lk .difup b{color:inherit}';document.head.appendChild(st);})();
// совет после поражения «прокачай X» (решение владельца 08.10: поражение не пустое) — зовётся из loseWhy в ui.js
function difUpTip(){try{const free=starsFree();let f=null;
  for(const t of TW_ORDER){if(!towerUnlocked(t))continue;for(const [k,c] of FORGE_ORDER[t])if(forgeCan(t,k)&&c<=free&&(!f||c<f.c)){f={t,k,c};}}
  if(f){const nm=f.k==='sp'?FORGE_SP[f.t].n:FORGE_T[f.k].n;return Lg('В кузнице ждут '+free+' ★. Купи «'+nm+'» для «'+TW[f.t].n+'» — и попробуй снова.','You have '+free+' ★ waiting in the forge. Buy “'+nm+'” for “'+TW[f.t].n+'” and try again.');}
  let b=null;for(const x of BLD){const l=S.village[x.id]||0;if(l<x.cost.length&&x.cost[l]<=S.gold&&(!b||x.cost[l]<b.c))b={x,c:x.cost[l]};}
  if(b)return Lg('Золота хватает на «'+b.x.name+'» в деревне: '+b.x.about.charAt(0).toLowerCase()+b.x.about.slice(1)+'. Отстройся — и снова в бой.','You have enough gold for the “'+b.x.name+'” in the village: '+b.x.about.charAt(0).toLowerCase()+b.x.about.slice(1)+'. Build it and fight again.');}catch(e){}
  return '';}
