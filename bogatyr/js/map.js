/* Карта Руси и выбор главы — зона A22 MAP. M1 (A10 ENG, 07.10): перенос из js/ui.js; M2 — жизнь с ORD.
   A22 (07.10): карта 11 ЗЕМЕЛЬ (узел = тема, путь — по порядку кампании TH_IDS), невыпущенная новая тема — «в тумане, Скоро»;
   выбранная земля → полоса 3 карточек глав «Разведка · Набег · Логово» в закреплённой панели над «Выступить» (замок, звёзды выбранного уровня, ⚔/🔥),
   строка «Босс · Сила ≥ N · рекорд», зацепка hook у «Логова»; ниже — ряд «Сложность» и «Выступить». Повторный тап по выбранной земле/карточке — старт.
   «Новое!» — на землях с непройденными новыми главами (слоты ≥ 8) у тех, кто уже был дальше; гаснет после выбора земли (S.mapSeen[тема]=1).
   mapSel по-прежнему = СЛОТ (ключ сейва), его ставят итоги похода (rNext/rUp/rHard) — карта только показывает его землю.
   Грузится после game.js и до ui.js; переменные ui.js (mapSel, curTab…) доступны во время вызова. isWide/chOpen — в ui.js (ENG). */
/* точки земель на карте (доли ширины/высоты холста): змейкой снизу (деревня) вверх, по порядку кампании; TH[id].map — запасной */
const MAP_LAND={les:[.25,.885],bol:[.73,.815],pole:[.27,.74],kosh:[.73,.66],med:[.27,.58],gory:[.73,.5],more:[.27,.42],luk:[.73,.34],ogon:[.27,.26],vihr:[.73,.18],lih:[.36,.085]};
const MAP_VIL=[.62,.962];
/* рекомендуемая сила главы (powerScore богатыря). Допущение A22 (данных PACE ещё нет): от tier, Обычная — с tier 3 (темы 1–2 — новичковые);
   ⚔ ×1,5, 🔥 ×2,2. BAL/PACE могут заменить: MAP_PW=(slot,k)=>число (0 — не показывать). */
let MAP_PW=typeof BAL_PW==='function'?BAL_PW:null; /* A50: таблица PACE из js/bal.js; <0 — «мастер» (одной прокачкой не набрать) */
function mapPw(slot,k){try{if(typeof MAP_PW==='function')return +MAP_PW(slot,k)||0;}catch(e){}
  const t=chTier(slot)||1,m=k==='s'?1.5:k==='h'?2.2:1;if(k==='n'&&t<3)return 0;return Math.round(100*Math.pow(1.25,Math.max(0,t-2))*m/10)*10;}
function mapTh(slot){const r=CAMP_S[slot];return r?r.th:'les';}
function mapLandOn(id){const t=TH[id];return !!(t&&(t.old||t.reg));}           // земля выпущена (видна)
function mapSlots(id){return CAMP.filter(r=>r.th===id).sort((a,b)=>a.n-b.n).map(r=>r.slot);} // 3 слота земли по n
function mapOpenL(id){return mapSlots(id).some(s=>chOpen(s));}                    // в земле есть открытая глава
function mapXY(id){return MAP_LAND[id]||(TH[id]&&TH[id].map)||[.5,.5];}
function mapName(id){const t=TH[id];return t?t.name:L('Скоро','Soon');}
function mapLabel(n){return n===2?L('Набег','Raid'):n===3?L('Логово','Lair'):L('Разведка','Scouting');}
// «Новое!»: в земле есть открытая непройденная новая глава (слот ≥ 8), а игрок уже бывал в этой земле или дальше по кампании; гаснет выбором земли
function mapNew(id){if(!mapLandOn(id)||(S.mapSeen&&S.mapSeen[id]))return false;const sl=mapSlots(id);
  if(!sl.some(s=>s>=8&&chPos(s)>0&&chOpen(s)&&!S.done[s]))return false;
  const p0=Math.min.apply(null,sl.map(s=>chPos(s)||99));return sl.some(s=>S.done[s])||ORD.some(s=>chPos(s)>p0&&(S.done[s]||(S.best[s]|0)>0));}
function mapSeen(id){if(!mapNew(id))return;if(!S.mapSeen||typeof S.mapSeen!=='object')S.mapSeen={};S.mapSeen[id]=1;save();}
// глава, на которую встаём при выборе земли: первая открытая непройденная, иначе последняя открытая
function mapPick(id){const sl=mapSlots(id).filter(s=>chPos(s)>0&&chOpen(s));if(!sl.length)return -1;for(const s of sl)if(!S.done[s])return s;return sl[sl.length-1];}
function mapFront(){for(const s of ORD)if(chOpen(s)&&!S.done[s])return s;return campLast();}
function mapSelect(s){if(s===mapSel){SND.click();startRun(mapSel);return;}mapSel=s;SND.click();drawMap();renderChInfo();mapFocus(true);}
function mapTapLand(id){
  if(!mapLandOn(id)){SND.click();toast(L('Эта земля откроется в обновлении игры','This land opens in a game update'));return;}
  const s=mapPick(id);
  if(s<0){const f=mapSlots(id).filter(x=>chPos(x)>0).sort((a,b)=>chPos(a)-chPos(b))[0],pv=f!=null?chPrev(f):-1;SND.click();
    toast(pv>=0?L('Сначала освободи ','First free ')+qt(mapTh(pv)===id?CH[pv].name:mapName(mapTh(pv))):L('Пока закрыто','Locked for now'));return;}
  mapSeen(id);if(mapTh(mapSel)===id){mapSelect(mapSel);return;}mapSelect(s);}
function renderMap(){const el=$('tabMap');if(!renderMap.init){renderMap.init=1;if(mapSel===0&&S.done[0]&&!(S.dfc&&S.dfc[0]&&S.dfc[0]!=='n'))mapSel=mapFront();}if(!chOpen(mapSel))mapSel=ORD[0];
  // широкий экран (ПК, окно VK): карта слева, всё остальное — справа (boost 2); на телефоне — одной колонкой, выбор главы — в закреплённой панели над «Выступить»
  const side='<div id="chInfo"></div><div class="gobar"><div id="chSel"></div><button class="btn big" id="goBtn"></button></div>';renderMap.wide=isWide();
  el.innerHTML=renderMap.wide?'<div class="mapwrap"><div class="mapL"><canvas id="mapCv"></canvas></div><div class="mapR">'+(S.runs?todayCard():'')+side+'</div></div>':(S.runs?todayCard():'')+'<canvas id="mapCv"></canvas>'+side;drawMap();renderChInfo();on('goBtn',()=>startRun(mapSel));mapFocus(false);
  const tb=$('todayBtn');if(tb)tb.onclick=()=>{SND.click();openToday();};
  $('mapCv').onclick=e=>{const r=e.target.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=46;
    for(const id of TH_IDS){const p=mapXY(id),d=Math.hypot(p[0]*r.width-x,p[1]*r.height-y);if(d<bd){bd=d;best=id;}}if(best)mapTapLand(best);};}
// выбранная земля не должна прятаться под закреплённой панелью «Выступить»
function mapFocus(smooth){setTimeout(()=>{const c=$('mapCv'),tab=$('tabMap'),gb=$('goBtn');if(!c||!tab||!gb||!tab.classList.contains('on')||renderMap.wide)return;
  const r=c.getBoundingClientRect(),p=mapXY(mapTh(mapSel)),y=r.top+p[1]*r.height,tr=tab.getBoundingClientRect(),bot=($('chSel')||gb).getBoundingClientRect().top-10,top=tr.top+8,R=40;
  let d=0;if(y+R+20>bot)d=y+R+20-bot;else if(y-R<top)d=y-R-top; // +20 — подпись под кружком
  if(Math.abs(d)>2){try{tab.scrollBy({top:d,behavior:smooth?'smooth':'auto'});}catch(e){tab.scrollTop+=d;}}},0);}
function starsHTML3(i,d){const p=DIF_PRE[d||'n']||'';return STAR_K.map(k=>S.stars[i+p+k]?'★':'<u>★</u>').join('');}
function starRows(i,got,d){const p=DIF_PRE[d||'n']||'',T=[['w',L('Победа над боссом','Beat the boss')],['d',L('Победа без единого падения','Win without falling once')],['t',L('Победа быстрее '+fmtTime(STAR_T),'Win faster than '+fmtTime(STAR_T))]];
  return '<div class="starrows">'+T.map(([k,t])=>'<div class="'+(S.stars[i+p+k]?'on':'')+'"><i>★</i><span>'+t+'</span>'+(got&&got[k]&&got.fresh&&got.fresh[k]?'<em>'+L('новая!','new!')+'</em>':'')+'</div>').join('')+'</div>';}
// звёзды главы — по уровням сложности (у каждого свои); закрытый уровень — строкой «откроется…»
function openStars(i){STAT.screen('stars');showModal('<h3>'+CH[i].name+'</h3><p class="sub">'+L('Три звезды главы на каждой сложности — для тех, кто любит проходить начисто. Всего звёзд: ','Three stars per chapter on each difficulty — for those who like a clean sweep. Stars in total: ')+starsTotal()+' / '+ORD.length*9+'</p>'+
  DIF_K.map(k=>'<div class="difst"><b>'+difName(k)+'</b>'+(difOpen(i,k)?starRows(i,null,k):'<div class="difnote2">🔒 '+difLockTxt(k)+'</div>')+'</div>').join('')+'<div class="btns"><button class="btn big" id="stOk">'+L('Понятно','Got it')+'</button></div>');on('stOk',hideModal);}
/* ---------- уровни сложности (difficulty 05.10, линейные: Обычная → Сложная → Адская; числа — DIF и ECO.dif в data.js, план — hobby-analytics/release-h/bogatyr-diff/plan.md) ---------- */
function difName(k){return k==='s'?L('⚔ Сложная','⚔ Hard'):k==='h'?L('🔥 Адская','🔥 Hell'):L('Обычная','Normal');}
function difNote(k){return k==='s'?L('Нечисть сильнее, без поблажек · свои звёзды · золота ×'+dec(ECO.dif.s,1),'Stronger monsters, no mercy · own stars · gold ×'+ECO.dif.s):
  k==='h'?L('Нечисть ещё сильнее · свои звёзды · золота ×'+dec(ECO.dif.h,1),'Even stronger monsters · own stars · gold ×'+ECO.dif.h):'';}
function difLockTxt(k){return k==='s'?L('Сложная откроется, когда пройдёте главу на обычной','Hard opens once you beat this chapter on Normal'):L('Адская откроется, когда пройдёте главу на сложной','Hell opens once you beat this chapter on Hard');}
function difBadges(i){return (difWon(i,'s')?' <i class="difb" title="'+L('пройдена на сложной','beaten on Hard')+'">⚔</i>':'')+(difWon(i,'h')?' <i class="difb" title="'+L('пройдена на адской','beaten on Hell')+'">🔥</i>':'');}
function difRow(i){const cur=difOf(i);
  return '<div class="difrow" id="difRow"><div class="difseg">'+DIF_K.map(k=>{const op=difOpen(i,k);return '<button data-df="'+k+'" class="'+(cur===k?'on':'')+(op?'':' lock')+'">'+(op?difName(k):'🔒 '+(k==='s'?L('Сложная','Hard'):L('Адская','Hell')))+'</button>';}).join('')+'</div>'+
    (cur!=='n'?'<div class="difnote">'+difNote(cur)+'</div>':difOpen(i,'s')&&!difWon(i,'s')?'<div class="difnote">'+L('⚔ Сложная открыта: свои звёзды, золота ×'+dec(ECO.dif.s,1)+', проклятия','⚔ Hard is open: own stars, gold ×'+ECO.dif.s+', curses')+'</div>':'')+'</div>';}
function difSet(i,k){if(!difOpen(i,k)){toast(difLockTxt(k));SND.click();return;}S.dfc[i]=k;save();SND.click();STAT.ev('mod',{m:'dif',a:k,l:chPos(i)});renderChInfo();}
function renderChInfo(){const c=CH[mapSel],hr=HERO_BY[S.hero]||HEROES[0],best=S.best[mapSel];
  // выбранная глава — компактной карточкой в закреплённой панели над «Выступить»: всегда видна целиком (boost 2); звёзды главы — тут же
  const sn=chStars(mapSel),sel=$('chSel');
  if(sel){sel.innerHTML=mapStrip()+mapInfo(c,best)+
      // ch4-soft: глава 4 ещё не пройдена — подсказка кузнеца прямо над «Выступить» (нажатие — в кузницу)
      (mapSel===3&&ch4Tip()?'<div class="ch4tip" id="ch4Tip" style="margin-top:6px;padding:7px 10px;border-radius:12px;background:var(--parch,#2a2238);color:var(--ink,#fff);border:2px solid #ffcf5a;font-size:14px;font-weight:800;line-height:1.35;cursor:pointer">'+ch4TipText()+(S.village.forge?' <u id="ch4Forge" style="white-space:nowrap">'+L('В кузницу →','To the Forge →')+'</u>':'')+'</div>':'')+difRow(mapSel);
    sel.onclick=e=>{const db=e.target.closest&&e.target.closest('[data-df]');if(db){difSet(mapSel,db.dataset.df);return;}if(e.target.closest&&e.target.closest('#difRow'))return;const mc=e.target.closest&&e.target.closest('[data-ms]');if(mc){mapCard(+mc.dataset.ms);return;}if(e.target.closest&&e.target.closest('#ch4Tip')){SND.click();if(S.village.forge){forgeSeg='hero';openTab('Forge');}return;}if(e.target.closest&&e.target.closest('.mstrip'))return;SND.click();openStars(mapSel);};}
  $('chInfo').innerHTML=
    '<div class="card"><div class="row"><img class="ic" src="'+ic('hp_'+skinKey(hr.id),120)+'"><div class="t"><b>'+hr.name+'</b><span>'+WEAPONS[hr.weapon].name+' · '+hr.perk+'</span><span class="delta" style="color:var(--gold)">⚔ '+L('Сила ','Power ')+fmtNum(powerScore(hr.id))+'</span></div><button class="btn ghost" id="chgHero">'+L('Сменить','Change')+'</button></div></div>'+
    (S.curseMax?'<div class="card"><b style="font-size:14px">'+L('☠ Проклятие','☠ Curse')+'</b><span style="display:block;font-size:12px;color:var(--mut);margin:2px 0 8px">'+L('Нечисть сильнее, золота больше. Новое проклятие откроется, если победить в Тридевятом царстве на самом сильном из открытых.','Stronger monsters, more gold. Win in the Thrice-Nine Kingdom on your strongest curse to unlock the next one.')+'</span><div class="seg" style="margin:0">'+
      CURSES.slice(0,S.curseMax+1).map((c,i)=>'<button data-cu="'+i+'" class="'+((S.curse||0)===i?'on':'')+'">'+(i?['I','II','III','IV','V'][i-1]:L('Нет','None'))+'</button>').join('')+'</div>'+
      ((S.curse||0)?'<span style="display:block;font-size:12px;color:#ff9aa8;margin-top:6px">'+CURSES[S.curse]+L(': здоровье нечисти ×',': monster health ×')+dec(curseMul(S.curse).hp,2)+L(', урон ×',', damage ×')+dec(curseMul(S.curse).dmg,2)+L(', золото ×',', gold ×')+dec(curseMul(S.curse).gold,1)+'</span>':'')+'<span style="display:block;font-size:14px;color:var(--mut);margin-top:6px">'+(CURSE_CAP.h<5?L('Проклятие действует на сложной и адской (на адской — не выше '+['I','II','III','IV','V'][CURSE_CAP.h-1]+').','Curses apply on Hard and Hell (on Hell — up to '+['I','II','III','IV','V'][CURSE_CAP.h-1]+').'):L('Проклятие действует на сложной и адской сложности.','Curses apply on Hard and Hell difficulty.'))+'</span>'+'</div>':'')+

    // сеча и испытание недели — только когда открыты (до первой победы закрытые карточки не отвлекают)
    (endOpen()?'<div class="card" style="margin-top:14px;background:linear-gradient(135deg,rgba(255,90,90,.18),rgba(138,106,255,.18))"><div class="row"><img class="ic" src="'+ic('e_sword',96)+'"><div class="t"><b>'+L('Бесконечная сеча','Endless Battle')+'</b><span>'+
      L('Все главы по кругу, каждые 5 минут — босс. Нечисть крепнет с каждой минутой — сколько продержишься? Рекорд: ','All chapters in a loop, a boss every 5 minutes. Monsters grow stronger every minute — how long can you last? Record: ')+(S.endBest?fmtTime(S.endBest):'—')+'</span></div>'+
      '<button class="btn" id="endBtn">'+L('⚔️ В бой','⚔️ Fight')+'</button></div></div>'+weeklyCard():S.done[0]?'<div class="card" style="margin-top:14px;opacity:.85"><div class="row"><img class="ic" src="'+ic('e_sword',96)+'"><div class="t"><b>'+L('⚔️ Сеча и 🏆 Испытание недели','⚔️ Endless Battle & 🏆 Weekly Trial')+'</b><span>'+L('🔒 Откроются, когда пройдёшь главу '+chPos(endGate())+' — «'+CH[endGate()].name+'»','🔒 Unlock after Chapter '+chPos(endGate())+' — '+CH[endGate()].name)+'</span></div></div></div>':'');
  for(const b of document.querySelectorAll('[data-cu]'))b.onclick=()=>{S.curse=+b.dataset.cu;save();SND.click();renderChInfo();};
  const gb=$('goBtn');if(gb){const d=difOf(mapSel);gb.innerHTML='<img src="'+ic('i_sword',48)+'" style="width:22px;height:22px">'+L('Выступить: ','March: ')+c.name+(d==='n'?'':' · '+(d==='s'?'⚔':'🔥'));}
  on('chgHero',()=>openTab('Heroes'));on('endBtn',()=>startRun(0,true));
  on('wkBtn',()=>startRun(0,true,true));on('wkRules',openWkRules);on('wkLb',()=>{qSeg='q';lbSeg='weekly';openTab('Quests');setTimeout(()=>{const b=$('lbBox');if(b)b.scrollIntoView({block:'center'});},50);});}
/* ---------- полоса 3 глав выбранной земли (A22) ---------- */
function mapStrip(){const id=mapTh(mapSel);
  return '<div class="mstrip">'+mapSlots(id).map(s=>{const r=CAMP_S[s],on=chPos(s)>0,op=on&&chOpen(s),sel=s===mapSel,d=difOf(s),dn=!!S.done[s];
    const st=op?'<i class="mst">'+starsHTML3(s,d)+(d!=='n'?'<i class="mdf">'+(d==='s'?'⚔':'🔥')+'</i>':'')+'</i>':'<i class="mlk">'+(on?'🔒':L('Скоро','Soon'))+'</i>';
    return '<button class="mcard'+(sel?' on':'')+(op?'':on?' lock':' soon')+(dn?' done':'')+'" data-ms="'+s+'"><b>'+mapLabel(r.n)+'</b>'+st+'</button>';}).join('')+'</div>';}
function mapInfo(c,best){const d=difOf(mapSel),pw=mapPw(mapSel,d),hp=pw>0?powerScore(S.hero):0,r=CAMP_S[mapSel]||{},bn=(EN[c.boss]||{}).n||'';
  const hk=r.n===3&&c.hook?'<span class="mhook">'+c.hook+'</span>':'';
  // одна строка (панель над «Выступить» должна оставаться низкой): сила — первой (цель «сходить в кузницу»), потом босс и рекорд; имя главы — на кнопке «Выступить»
  return '<div class="minfo" id="chStars"><span>'+(pw<0?'<b class="mpw low">'+(d==='h'?'🔥 ':'⚔ ')+L('мастер','master')+'</b> · ':pw?'<b class="mpw '+(hp>=pw?'ok':'low')+'">⚔ '+L('Сила ≥ ','Power ≥ ')+fmtNum(pw)+(hp>=pw?' ✓':L(' (у вас ',' (yours ')+fmtNum(hp)+')')+'</b> · ':'')+
    L('Босс: ','Boss: ')+'<em>'+bn+'</em>'+(best?L(' · рекорд ',' · record ')+fmtTime(best):'')+'</span>'+hk+'</div>';}
function mapCard(s){const on=chPos(s)>0;
  if(!on){SND.click();toast(L('Эта глава откроется в обновлении игры','This chapter opens in a game update'));return;}
  if(!chOpen(s)){const pv=chPrev(s);SND.click();toast(L('Сначала освободи ','First free ')+qt(pv>=0?CH[pv].name:''));return;}
  mapSelect(s);}
/* ---------- холст карты: рисуется только при изменении (renderMap, выбор, поворот экрана); без ctx.filter; на lite — без свечения ---------- */
function drawMap(){const c=$('mapCv');if(!c)return;const r=c.getBoundingClientRect(),W=r.width||360,tabH=($('tabMap')||{}).clientHeight||0,H=renderMap.wide&&tabH>300?Math.max(380,Math.min(660,W*1.4,tabH-34)):Math.min(620,W*1.4),d=Math.min(devicePixelRatio||1,2.5),lite=document.body.classList.contains('lite');c.style.height=H+'px';
  c.width=W*d;c.height=H*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';
  const sea=g.createLinearGradient(0,0,0,H);sea.addColorStop(0,CVL.sea1||'#1f4a7a');sea.addColorStop(1,CVL.sea2||'#163a62');g.fillStyle=sea;g.fillRect(0,0,W,H);
  g.strokeStyle=CVL.sea1?'rgba(255,255,255,.22)':'rgba(255,255,255,.06)';g.lineWidth=1;for(let y=12;y<H;y+=16){g.beginPath();for(let x=0;x<=W;x+=12)g.lineTo(x,y+Math.sin(x*.08+y)*2);g.stroke();}
  // суша
  const land=[[.06,.98],[.03,.75],[.08,.5],[.04,.28],[.14,.06],[.4,.015],[.7,.025],[.95,.1],[.97,.35],[.93,.6],[.98,.82],[.84,.99]];
  g.beginPath();land.forEach(([x,y],i)=>{const px=x*W,py=y*H;if(!i)g.moveTo(px,py);else{const [qx,qy]=land[i-1];g.quadraticCurveTo(qx*W,qy*H,(qx*W+px)/2,(qy*H+py)/2);}});g.closePath();
  const lg=g.createLinearGradient(0,0,0,H);lg.addColorStop(0,'#b8b08a');lg.addColorStop(1,'#a8c47a');g.fillStyle=lg;g.fill();g.strokeStyle='#f4efe2';g.lineWidth=3;g.stroke();g.save();g.clip();
  // земли-регионы (цвет темы); невыпущенная — серый туман
  TH_IDS.forEach(id=>{const t=TH[id],[x,y]=mapXY(id),on=mapLandOn(id),col=on&&t.mc?t.mc:'#9aa0b0',q=g.createRadialGradient(x*W,y*H,0,x*W,y*H,W*.26);q.addColorStop(0,rgba(col,on?.9:.55));q.addColorStop(1,rgba(col,0));g.fillStyle=q;g.beginPath();g.arc(x*W,y*H,W*.26,0,TAU);g.fill();});
  // декор
  const R=mulberry(5);for(let i=0;i<44;i++){const x=R(),y=R();if(y<.05||y>.95||x<.1||x>.9)continue;const ci=clamp(Math.round((.95-y)/.12),0,7),dec=CH[ci].decor,key=dec[Math.floor(R()*dec.length)];if(key==='d_pond'||key==='d_lava')continue;
    g.save();g.translate(x*W,y*H);g.scale(.36,.36);ART[key].fn(g);g.restore();}
  g.restore();
  // деревня
  g.save();g.translate(MAP_VIL[0]*W,MAP_VIL[1]*H);g.scale(.5,.5);drawBld(g,'home');g.restore();
  // путь по землям (к невыпущенной — бледный)
  const ids=TH_IDS,pts=[MAP_VIL].concat(ids.map(mapXY));g.setLineDash([2,9]);g.lineWidth=4;
  for(let i=1;i<pts.length;i++){const [px,py]=pts[i-1],[x,y]=pts[i],on=mapLandOn(ids[i-1])&&(i<2||mapLandOn(ids[i-2]));g.strokeStyle=on?'rgba(255,255,255,.9)':'rgba(255,255,255,.35)';g.beginPath();g.moveTo(px*W,py*H);g.quadraticCurveTo((px+x)/2*W,(py+y)/2*H+(i%2?-14:14),x*W,y*H);g.stroke();}
  g.setLineDash([]);
  const sid=mapTh(mapSel),base=clamp(W*.068,21,30),fs=W<340?13.5:14.5;
  ids.forEach(id=>{const [x,y]=mapXY(id),px=x*W,py=y*H,on=mapLandOn(id),sel=id===sid,rad=sel?base+4:base;
    g.font='900 '+fs+'px '+CVL.font;g.textAlign='center';g.textBaseline='middle';
    const lab=on?mapName(id):L('Скоро','Soon'),lw=g.measureText(lab).width,lx=clamp(px,lw/2+6,W-lw/2-6),ly=py+rad+fs*.5+6;
    if(!on){ // туман: облачка и «Скоро»
      g.fillStyle='rgba(236,240,248,.82)';[[-.9,.15,.62],[-.3,-.3,.75],[.45,-.15,.7],[.9,.2,.55],[0,.3,.8]].forEach(([a,b,k])=>{g.beginPath();g.arc(px+a*rad,py+b*rad,rad*k,0,TAU);g.fill();});
      g.lineWidth=4;g.strokeStyle='rgba(60,70,90,.7)';g.strokeText(lab,lx,py);g.fillStyle='#fff';g.fillText(lab,lx,py);return;}
    const sl=mapSlots(id),op=mapOpenL(id),done=sl.every(s=>S.done[s]&&chPos(s)>0),bs=sl.filter(s=>chPos(s)>0)[0],boss=bs!=null&&CH[bs]?CH[bs].boss:null;
    if(sel&&!lite)glow(g,px,py,rad*1.9,'#ffd84a');
    g.beginPath();g.arc(px,py,rad,0,TAU);g.fillStyle=op?'#fff8e8':'#6a6a7a';g.fill();g.lineWidth=sel?5:4;g.strokeStyle=sel?'#ffc94a':done?'#4ade6a':(TH[id].mc||'#2a2238');g.stroke();
    if(boss&&ART[boss]){g.save();g.beginPath();g.arc(px,py,rad-3,0,TAU);g.clip();g.translate(px,py+rad*.25);const a=ART[boss],k=rad*2.1/a.size;g.scale(k,k);if(!op)g.globalAlpha=.5;if(a.fn)a.fn(g);else g.drawImage(drawArt(boss,a.size),-a.size/2,-a.size/2);g.restore();} /* перекраска (artTint) — без fn: через drawArt */
    if(!op){g.beginPath();g.arc(px,py,rad-3,0,TAU);g.fillStyle='rgba(28,26,42,.72)';g.fill();g.font='18px system-ui';g.fillStyle='#fff';g.fillText('🔒',px,py);}
    // три точки глав: пройдена — зелёная, открыта — белая, закрыта — серая, не выпущена — пустая
    sl.forEach((s,q)=>{const a=-Math.PI/2+(q-1)*.55,qx=px+Math.cos(a)*(rad+1),qy=py+Math.sin(a)*(rad+1),rel=chPos(s)>0;g.beginPath();g.arc(qx,qy,5,0,TAU);
      g.fillStyle=!rel?'rgba(255,255,255,.25)':S.done[s]?'#4ade6a':chOpen(s)?'#fff':'#8a8a9a';g.fill();g.lineWidth=2;g.strokeStyle='rgba(20,20,40,.8)';g.stroke();});
    g.font='900 '+fs+'px '+CVL.font;g.lineWidth=4;g.strokeStyle='rgba(20,20,40,.8)';g.strokeText(lab,lx,ly);g.fillStyle=sel?'#ffe27a':'#fff';g.fillText(lab,lx,ly);
    if(mapNew(id)){const t=L('Новое!','New!');g.font='900 13.5px '+CVL.font;const tw=g.measureText(t).width+12,bx=clamp(x<.5?px-rad-5-tw:px+rad+5,4,W-tw-4),by=py-rad*.35; /* сбоку от кружка, к краю карты — там нет подписей соседей */
      g.fillStyle='#e8402a';g.beginPath();if(g.roundRect)g.roundRect(bx,by-10,tw,20,10);else g.rect(bx,by-10,tw,20);g.fill();g.lineWidth=2;g.strokeStyle='#fff';g.stroke();g.fillStyle='#fff';g.textAlign='left';g.fillText(t,bx+6,by+.5);g.textAlign='center';}});}
