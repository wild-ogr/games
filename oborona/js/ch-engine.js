'use strict';
/* ================= OB:CH — движок глав «данными» (08.10.2026) =================
   План — hobby-analytics/release-i/oborona-boost/01-chapters-pace.md, журнал — release-i/oborona-boost/logs/CH.md.
   - Главы в сохранении — по номеру (S.stars['8-3']): старые 0–7 на своих местах, новые темы дописываются в конец CH (8, 9, 10…).
   - Порядок прохождения — CH_ORDER (новая тема встаёт после соседки: chAdd({after:3,…})).
   - Открытие главы: первая — всегда; иначе — побеждён босс предыдущей ПО ПОРЯДКУ, или в самой главе уже есть звёзды
     (ветеран, прошедший Студёные горы до появления Медной горы, ничего не теряет).
   - «Логово» — 7-й уровень (индекс 6, ключ 'c-6'), только у глав с lair: открывается после босса главы, следующую главу не запирает.
   - Босс недели и осада — только старые 8 глав (CH_WEEK), «счёт глав» в наградах — не выше 8 (как было).
   - Повадки нечисти и приёмы боссов новых тем — через CHX (крючки в game.js помечены // OB:CH). */
const CH_OLD=8;
const CH_ORDER=[0,1,2,3,4,5,6,7];
const CH_WEEK=[0,1,2,3,4,5,6,7];
function chPos(c){return CH_ORDER.indexOf(c);}
function chPrev(c){const i=chPos(c);return i>0?CH_ORDER[i-1]:null;}
function chNext(c){const i=chPos(c);return i>=0&&i<CH_ORDER.length-1?CH_ORDER[i+1]:null;}
function chLast(){return CH_ORDER[CH_ORDER.length-1];}
function chNum(c){return chPos(c)+1;}
function chLvN(c){return CH[c]&&CH[c].lair?7:6;}
function chAny(c){for(let l=0;l<7;l++)if(S.stars[c+'-'+l])return true;return false;}
function chLvOpen(c,l){if(chPos(c)<0||!CH[c])return false;
  if(l===0)return c===CH_ORDER[0]||!!S.stars[chPrev(c)+'-5']||chAny(c);
  if(l===6)return !!(CH[c].lair&&S.stars[c+'-5']);
  if(l>6)return false;
  return !!S.stars[c+'-'+(l-1)];}
// «номер главы» для формул награды: старые — свой, новые — предыдущая по порядку + 0,5 (Медная гора = 3,5 — между Кощеем и Студёными горами)
function chEco(c){return c<CH_OLD?c:chPrev(c)+.5;}
// освобождено ли старых глав (для наград и достижения «все 8 глав» — как было до новых тем)
function chaptersDoneOld(){let n=0;for(let c=0;c<CH_OLD;c++)if(S.stars[c+'-5'])n++;return n;}
// глава по месту в порядке: 1-я — нечисть «первой главы» (+1 волна с 5-го места — как было с Студёных гор)
function chWaveBonus(c){return chPos(c)>=4?1:0;}

/* перевод части общей таблицы (LORE, BOSS_SAY, LEAD.n…): русский запоминаем только для своих ключей — иначе при en на старте
   «русская копия» захватила бы уже английские строки старых ключей (langReg снимает копию всей таблицы) */
function chLang(obj,en){const ru={};for(const k in en)ru[k]=langSnap(obj[k]);LANG_DATA.push([obj,en,ru]);if(LANG==='en')langOvl(obj,en);}
/* ---------- новая тема: o={id,after,ch,hp,coins,lmark,fix,book:[доп. нечисть в книгу],ach:{n,en},banner:{…},en:{…английский CH}} ---------- */
function chAdd(o){if(CH.length!==o.id)throw new Error('chAdd: глава '+o.id+' не по порядку (CH.length='+CH.length+')');
  CH.push(o.ch);HP_MUL.push(o.hp);GOLD_MUL.push(+(1.8*Math.pow(o.hp,.8)).toFixed(2));START_COINS.push(o.coins);LMARK.push(o.lmark||[]);
  CH_ORDER.splice(chPos(o.after)+1,0,o.id);
  if(o.fix)Object.assign(LEVEL_FIX,o.fix);
  if(o.en)langReg(o.ch,o.en);
  // Книга нечисти: новая нечисть — перед подмогой боссов (kot), босс — перед яйцом
  for(const t of o.ch.en.concat(o.book||[]))if(!BOOK.includes(t))BOOK.splice(BOOK.indexOf('kot'),0,t);
  if(!BOOK.includes(o.ch.boss))BOOK.splice(BOOK.indexOf('egg'),0,o.ch.boss);
  for(const t of o.bossBook||[])if(!BOOK.includes(t))BOOK.splice(BOOK.indexOf('egg')+1,0,t);
  // достижение «победи босса» — рядом с прочими боссами
  if(o.ach){const b=o.ch.boss,a={id:'b_'+b,n:o.ach.n,d:'Победи: '+EN[b].n,goal:1,v:()=>(S.bossKill||{})[b]?1:0,r:100+25*chPos(o.id)};
    let i=0;ACH.forEach((x,k)=>{if(x.id.startsWith('b_'))i=k+1;});ACH.splice(i,0,a);langReg(a,{n:o.ach.en,d:'Defeat: '+(o.ach.bossEn||EN[b].n)});}
  if(o.banner){const bn=Object.assign({ch:o.id},o.banner);BANNERS.push(bn);if(o.banner.en)langReg(bn,{n:o.banner.en});}}

/* ---------- пороги силы (механизм; включены с 5-й темы): рекомендуемая «Сила застав» у уровня. Не запирает — подсказывает ---------- */
function chPw(c,l){const ch=CH[c];if(!ch||!ch.pw)return 0;return Math.round(ch.pw[Math.min(l,ch.pw.length-1)]);}
function chPwLow(c,l){const n=chPw(c,l);return n&&typeof powerNow==='function'&&powerNow()<n?n:0;}

/* ================= повадки нечисти (общие для новых тем) =================
   CHX.ab[повадка](e,dt,b,sp) → скорость на этот кадр (зовётся из updEnemies до шага по дороге);
   CHX.init[повадка](e,b) — при появлении; CHX.drawE[повадка](e,c) — поверх рисунка; CHX.boss[тип](e,dt) — приёмы новых боссов;
   CHX.fx[вид](c,f,q) — свои эффекты; CHX.tip[повадка]() — строка совета в Книге нечисти. Все с предупреждением ≥ 0,7 с. */
const CHX={ab:{},init:{},drawE:{},boss:{},fx:{},tip:{}};
const chBusy=e=>e.stunT>0||e.sleepT>0;
// подкоп: раз в 3,5–5 с уходит под землю на 1,5 с (неуязвим, заставы его не видят, на 35% быстрее). Перед нырком 0,7 с роет (видно)
CHX.ab.burrow=(e,dt,b,sp)=>{const P=G.map.paths[e.pi];
  if(e.under){e.abT-=dt;if(e.abT<=0||e.d>P.len-90){e.under=0;e.invul=false;e.abT=rand(3.5,5);dust(e.x,e.y+4);if(CHX.surf[e.type])CHX.surf[e.type](e);}return sp*1.35;}
  if(chBusy(e))return sp;e.abT-=dt;e.dig=e.abT<.7&&e.d>40&&e.d<P.len-140;
  if(e.abT<=0){if(e.d>40&&e.d<P.len-140){e.under=1;e.invul=true;e.dig=0;e.abT=b.under||1.5;dust(e.x,e.y+4);}else e.abT=.5;}
  return sp;};
CHX.surf={};
CHX.drawE.burrow=(e,c)=>{if(e.dig){const p=.5+.5*Math.sin(G.t*20);c.fillStyle=rgba('#7a5a34',.55+.3*p);c.beginPath();c.ellipse(e.x,e.y+e.r*.8,e.r*1.1,e.r*.4,0,0,TAU);c.fill();}};
// под землёй: бугорок и пыль вместо рисунка
function chDrawUnder(e){const c=ctx;worldT();const w=Math.max(10,e.r*1.1);c.fillStyle='#6a4a28';c.beginPath();c.ellipse(e.x,e.y+3,w,w*.45,0,Math.PI,0);c.fill();
  c.fillStyle='#8a6a40';c.beginPath();c.ellipse(e.x,e.y+3,w*.7,w*.28,0,Math.PI,0);c.fill();
  if(Math.random()<.25&&G.pt.length<300)G.pt.push({x:e.x+rand(-w,w),y:e.y+2,vx:rand(-15,15),vy:rand(-30,-10),t:0,dur:.35,col:'#b89a6a',s:rand(1.2,2.2)});}
CHX.tip.burrow=()=>Lg('ныряет под землю — там его не достать: ставь заставы и дальше по дороге','dives underground where nothing can hit it — keep outposts further down the road too');

// бросок в заставу (кирка/камень): раз в lobCd с, ближайшая застава в радиусе lobR молчит lobS с. Кирка летит 0,7 с — видно, куда
CHX.ab.lob=(e,dt,b,sp)=>{chLob(e,dt,b);return sp;};
function chLob(e,dt,b){if(chBusy(e)||e.under)return;e.abT-=dt;if(e.abT>0)return;
  const R=b.lobR||105;let best=null,bd=R*R;for(const t of G.tw){if(!t||t.stunT>0)continue;const d=(t.x-e.x)**2+(t.y-e.y)**2;if(d<bd){bd=d;best=t;}}
  if(!best){e.abT=.4;return;}e.abT=(b.lobCd||7)*(e.lead?.6:1);const t=best,dur=.7;
  G.fx.push({k:'chpick',x:e.x,y:e.y-(e.fly?30:14),x1:t.x,y1:t.y-22,t:0,dur,col:b.lobC||'#d8843a',kind:b.lobK||'pick'});if(Math.random()<.15)say(e,pick(CH_LOBSAY[b.lobK||'pick']()),1.2);
  later(dur,()=>{if(!G.tw.includes(t))return;t.stunT=Math.max(t.stunT,b.lobS||1.6);t.dizFx=t.stunT;hitSpark(t.x,t.y-26);SND.boom&&SND.boom();});}
const CH_LOBSAY={pick:()=>Lg(['Эх, кирка!','Лови!','Бац!'],['Catch!','Pick incoming!','Whack!']),shell:()=>Lg(['Лови ракушку!','Плюх!','Хи-хи!'],['Catch a shell!','Splash!','Tee-hee!']),
  bolt:()=>Lg(['Бах!','Гром гремит!','Тр-р-рах!'],['Boom!','Thunder rolls!','Crack!'])};
CHX.fx.chpick=(c,f,q)=>{if(f.kind==='bolt'){const R1=mulberry(f.x|0);c.globalCompositeOperation='lighter';c.strokeStyle=rgba(f.col,.9);c.lineWidth=2.6;c.beginPath();c.moveTo(f.x,f.y);
    const n=6,e=Math.min(1,q*1.6);for(let i=1;i<=n;i++){const k=i/n*e;c.lineTo(lerp(f.x,f.x1,k)+(i<n?(R1()-.5)*16:0),lerp(f.y,f.y1,k));}c.stroke();glowDot(c,lerp(f.x,f.x1,e),lerp(f.y,f.y1,e),10,f.col,.8);c.globalCompositeOperation='source-over';
    c.strokeStyle=rgba('#ff5a3a',.5*(1-q)+.2);c.lineWidth=1.6;c.beginPath();c.arc(f.x1,f.y1+18,16+4*(1-q),0,TAU);c.stroke();worldT();return;}
  const x=lerp(f.x,f.x1,q),y=lerp(f.y,f.y1,q)-Math.sin(q*Math.PI)*34,a=q*14;
  if(f.kind==='shell'){c.fillStyle='#f4d0b8';c.strokeStyle='#a0705a';c.lineWidth=1.2;c.beginPath();c.arc(x,y,5,Math.PI,0);c.closePath();c.fill();c.stroke();
    c.strokeStyle=rgba('#ff5a3a',.5*(1-q)+.2);c.lineWidth=1.6;c.beginPath();c.arc(f.x1,f.y1+18,16+4*(1-q),0,TAU);c.stroke();worldT();return;}
  c.save();c.translate(x,y);c.rotate(a);c.strokeStyle='#5a3a1e';c.lineWidth=2.2;c.beginPath();c.moveTo(-6,0);c.lineTo(6,0);c.stroke();
  c.strokeStyle=f.col;c.lineWidth=2.6;c.beginPath();c.moveTo(5,-6);c.quadraticCurveTo(9,0,5,6);c.stroke();c.restore();
  // метка цели — куда летит
  c.strokeStyle=rgba('#ff5a3a',.5*(1-q)+.2);c.lineWidth=1.6;c.beginPath();c.arc(f.x1,f.y1+18,16+4*(1-q),0,TAU);c.stroke();worldT();};
CHX.tip.lob=()=>Lg('кидает кирки в заставы — застава замолкает: не ставь все в одну кучу','throws picks at outposts and silences them — don’t bunch them all together');

// присоска: проходя мимо заставы, цепляется к ней на latchT с — та стреляет вдвое реже, пока упыря не собьют
CHX.ab.latch=(e,dt,b,sp)=>{const t=e.lt;
  if(t){e.ltT-=dt;if(e.ltT<=0||G.tw[t.i]!==t||chBusy(e)){chUnlatch(e);e.abT=5;return sp;}return 0;}
  if(chBusy(e)||e.under)return sp;e.abT-=dt;if(e.abT>0)return sp;e.abT=.3;
  for(const q of G.tw)if(q&&!q.latchN&&(q.x-e.x)**2+(q.y-e.y)**2<50*50){e.lt=q;e.ltT=b.latchT||5;q.latchN=1;if(Math.random()<.5)say(e,Lg('Моё!','Mine!'),1.2);break;}
  return sp;};
function chUnlatch(e){const t=e.lt;if(!t)return;t.latchN=Math.max(0,(t.latchN||1)-1);e.lt=null;}
CHX.drawE.latch=(e,c)=>{const t=e.lt;if(!t)return;c.strokeStyle=rgba('#4aaa7a',.75);c.lineWidth=2.4;c.beginPath();c.moveTo(e.x,e.y-e.r);c.quadraticCurveTo((e.x+t.x)/2,Math.min(e.y,t.y)-24+Math.sin(G.t*8)*3,t.x,t.y-24);c.stroke();};
CHX.tip.latch=()=>Lg('цепляется к заставе — та стреляет вдвое реже: ставь заставы парами','latches onto an outpost and halves its fire rate — build outposts in pairs');

// щит: удары застав спереди (по ходу движения) — ×0,35. Бить сбоку и в спину
CHX.init.shield=e=>{e.xd=chShield;};
function chShield(e,kind,src){if(kind!=='phys'||!src||src.x==null)return 1;const p=pathPos(e.pi,e.d);return (src.x-e.x)*p.dx+(src.y-e.y)*p.dy>0?.35:1;}
CHX.drawE.shield=(e,c)=>{const p=pathPos(e.pi,e.d),l=Math.hypot(p.dx,p.dy)||1,x=e.x+p.dx/l*e.r*.9,y=e.y-e.r*.6+p.dy/l*e.r*.5;
  c.fillStyle='#b8783a';c.strokeStyle='#5a3a14';c.lineWidth=1.4;c.beginPath();c.ellipse(x,y,e.r*.42,e.r*.62,Math.atan2(p.dy,p.dx),0,TAU);c.fill();c.stroke();
  c.fillStyle='#3fbf7f';c.beginPath();c.arc(x,y,e.r*.16,0,TAU);c.fill();};
CHX.tip.shield=()=>Lg('спереди — щит: бей сбоку и в спину, ставь заставы по обе стороны поворота','shielded in front — hit it from the side and behind, put outposts on both sides of a bend');

// воришка: дошёл до ворот — уносит монеты (не жизни); сбит — монет много
CHX.tip.thief=()=>Lg('воришка: дошёл до ворот — утащит монеты, сбит — платит щедро','a thief: reaching the gate it steals coins; shot down, it pays well');
function chSteal(e){const b=EN[e.type],n=Math.min(Math.floor(G.coins),Math.round((b.steal||25)*(GOLD_MUL[G.ci]||1)));e.dead=true;
  if(n>0){G.coins-=n;addNum(e.x,e.y-30,'−'+n,'#ffb03a');sayAt(e.x,e.y-20,Lg('Моё золотишко!','My gold!'));}SND.leak();}

// гнездо/цветок: стоит на дороге (не ходит, не прорывается), бьют заставы и палец; хозяина нет — увядает
CHX.init.cvet=e=>{e.prio=1;e.off=0;};
CHX.ab.cvet=(e,dt,b)=>{if(!G.en.some(o=>o.type===b.owner&&!o.dead)){e.dead=true;poof(e.x,e.y);}return 0;};

/* ---------- крючки боя ---------- */
// убит: дробление (split — у любого вида, кроме снеговика, у которого своё), отцепить присоску
CHX.kill=(e,src)=>{const b=EN[e.type];if(e.lt)chUnlatch(e);
  if(b.split&&e.type!=='snow'){for(const s of[-8,8])spawnEnemy(b.split,e.pi,Math.max(0,e.d+s),e.max/b.hp/(G.hpK||1)/(e.lead?LEAD.hp:1));}
  if(CHX.killT[e.type])CHX.killT[e.type](e,src);};
CHX.killT={};
// прорвался: воришка уносит монеты; true — прорыв обработан
CHX.leak=e=>{const b=EN[e.type];if(e.lt)chUnlatch(e);if(b.ab==='thief'){chSteal(e);return true;}if(CHX.leakT[e.type])CHX.leakT[e.type](e);return false;};
CHX.leakT={};
// касание поля: цветы/гнёзда (prio) — как яйцо Кощея
CHX.tap=p=>{if(!G)return false;for(const e of G.en)if(e.prio&&!e.dead&&(e.x-p.x)**2+(e.y-6-p.y)**2<34*34){dmgEnemy(e,e.max*.07,'true');sparkle(e.x,e.y-6,'#7ae0a0',5);SND.click();return true;}return false;};
// застава: присоска, малахитовая стена, предупреждение
CHX.drawTw=t=>{const c=ctx;
  if(t.wallW>0){const p=.5+.5*Math.sin(G.t*14);c.strokeStyle=rgba('#3fdf8f',.5+.5*p);c.lineWidth=3;c.beginPath();c.ellipse(t.x,t.y+4,26,12,0,0,TAU);c.stroke();}
  if(t.wallFx>0&&t.stunT>0){c.globalAlpha=Math.min(1,t.wallFx*2);for(const [dx,h,w] of[[-14,30,9],[-4,40,10],[7,34,9],[16,26,8]]){c.fillStyle='#2f9a62';c.strokeStyle='#1f5a3e';c.lineWidth=1.4;c.beginPath();c.moveTo(t.x+dx-w/2,t.y+8);c.lineTo(t.x+dx-w*.3,t.y+8-h);c.lineTo(t.x+dx,t.y+8-h-6);c.lineTo(t.x+dx+w*.3,t.y+8-h);c.lineTo(t.x+dx+w/2,t.y+8);c.closePath();c.fill();c.stroke();
    c.strokeStyle='rgba(180,255,210,.5)';c.lineWidth=1;c.beginPath();c.moveTo(t.x+dx-w*.15,t.y+4);c.lineTo(t.x+dx-w*.1,t.y+12-h);c.stroke();}c.globalAlpha=1;}
  if(t.latchN>0){c.fillStyle=rgba('#4aaa7a',.3);c.beginPath();c.ellipse(t.x,t.y-12,22,28,0,0,TAU);c.fill();}};
// тик застав: таймеры новых эффектов
CHX.twTick=(t,dt)=>{if(t.wallW>0)t.wallW-=dt;if(t.wallFx>0)t.wallFx-=dt;if(t.dizFx>0)t.dizFx-=dt;};
// дополнения к волнам главы (ch.waveX), «ярый» босс Логова
const CH_YAR={hp:1.6,cd:.75};

/* ---------- Кузница II: ступени с lock (номер главы, после босса которой открываются) — в FORGE_ORDER после старых пяти ---------- */
let FORGE2_FIRST='';
const FORGE_SP2={};
function forgeLocked(k){const L=FORGE_T[k]&&FORGE_T[k].lock;return L!=null&&!S.stars[L+'-5'];}
function forgeInfo(t,k){return k==='sp'?FORGE_SP[t]:k==='sp2'?FORGE_SP2[t]:FORGE_T[k];}
function forgeShort2(t,k){const f=forgeInfo(t,k);return f.s||f.d;}

/* ---------- повадки для Лукоморья и Царства Вихря ---------- */
// рывок: раз в dashCd с замирает и «целится» 0,7 с (стрелка), потом прыгает вперёд по дороге на dashL
CHX.ab.dash=(e,dt,b,sp)=>{if(e.hop)return sp;const P=G.map.paths[e.pi];
  if(e.aimT>0){e.aimT-=dt;if(e.aimT<=0){const d1=Math.min(P.len-30,e.d+(b.dashL||80));if(d1>e.d){e.hop={t:0,d0:e.d,d1};dust(e.x,e.y+4);}}return 0;}
  if(chBusy(e))return sp;e.abT-=dt;if(e.abT<=0){e.abT=b.dashCd||4.5;if(e.d<P.len-140){e.aimT=.7;}}return sp;};
CHX.drawE.dash=(e,c)=>{if(!(e.aimT>0))return;const p=pathPos(e.pi,Math.min(G.map.paths[e.pi].len,e.d+60)),q=1-e.aimT/.7;c.strokeStyle=rgba('#ff5a3a',.4+.5*q);c.lineWidth=3;c.setLineDash([5,4]);c.beginPath();c.moveTo(e.x,e.y);c.lineTo(p.x,p.y);c.stroke();c.setLineDash([]);
  c.fillStyle=rgba('#ff5a3a',.6+.4*q);c.beginPath();c.arc(p.x,p.y,4,0,TAU);c.fill();};
CHX.tip.dash=()=>Lg('замирает и делает рывок вперёд — ставь заставы и в конце дороги','freezes, then dashes ahead — keep outposts near the end of the road too');
// знаменосец/след: соседи (fly — только летучие) в радиусе 70 бегут на 30% быстрее
CHX.ab.haste=(e,dt,b,sp)=>{if(chBusy(e))return sp;for(const o of G.en)if(o!==e&&!o.dead&&!o.boss&&(!b.hasteFly||o.fly)&&(o.x-e.x)**2+(o.y-e.y)**2<70*70){o.hasteT=.25;o.hasteK=1.3;}return sp;};
CHX.drawE.haste=(e,c)=>{const p=(G.t*1.2)%1;c.strokeStyle=rgba('#ffd84a',.35*(1-p));c.lineWidth=2;c.beginPath();c.ellipse(e.x,e.y,70*p,70*p*.6,0,0,TAU);c.stroke();};
CHX.tip.haste=()=>Lg('рядом с ним нечисть бежит быстрее — бей его первым','monsters near it run faster — take it out first');
// носильщик: раз в 6 с хватает ближнего сзади и переносит вперёд на 70 (0,7 с — кольцо над тем, кого унесёт)
CHX.ab.carry=(e,dt,b,sp)=>{if(chBusy(e))return sp;const P=G.map.paths[e.pi];
  if(e.cy){e.cy.t-=dt;const o=e.cy.o;if(e.cy.t<=0){if(!o.dead&&!o.boss){poof(o.x,o.y);o.d=Math.min(P.len-40,e.d+(b.carryL||70));o.pi=e.pi;const q=pathPos(o.pi,o.d);o.x=q.x;o.y=q.y;poof(o.x,o.y);}e.cy=null;}return 0;}
  e.abT-=dt;if(e.abT>0)return sp;e.abT=b.carryCd||6;let best=null,bd=1e9;
  for(const o of G.en)if(o!==e&&!o.dead&&!o.boss&&!o.fly&&o.pi===e.pi&&o.d<e.d&&e.d-o.d<160&&o.type!==e.type){const dd=e.d-o.d;if(dd<bd){bd=dd;best=o;}}
  if(best&&e.d<P.len-150){e.cy={o:best,t:.7};if(Math.random()<.4)say(e,Lg('Подвезу!','Hop on!'),1.2);}return sp;};
CHX.drawE.carry=(e,c)=>{if(!e.cy)return;const o=e.cy.o;c.strokeStyle=rgba('#7ad0ff',.8);c.lineWidth=2;c.beginPath();c.arc(o.x,o.y-o.r,o.r+6+Math.sin(G.t*14)*2,0,TAU);c.stroke();};
CHX.tip.carry=()=>Lg('переносит соседей вперёд по дороге — бей его первым','carries its neighbors ahead along the road — take it out first');
// морок: появляются обманки (1 удар — исчезают), заставы тратят на них выстрелы
CHX.ab.decoy=(e,dt,b,sp)=>{if(chBusy(e))return sp;e.abT-=dt;if(e.abT<=0){e.abT=b.decoyCd||8;for(const s of[-14,14]){const o=spawnEnemy(b.decoy||'luk_ten',e.pi,Math.max(0,e.d+s),1);o.ghost=1;}poof(e.x,e.y);}return sp;};
CHX.tip.decoy=()=>Lg('пускает обманки — на них уходят выстрелы; колдун и пушка бьют по нескольким','sends out decoys that soak up shots — the sorcerer and cannon hit several at once');
// ветреник: сдувает лужи Яги и огонь рядом (раз в 5 с, 0,7 с — завихрение)
CHX.ab.wind=(e,dt,b,sp)=>{if(chBusy(e))return sp;e.abT-=dt;if(e.abT<=0){e.abT=b.windCd||5;const n0=G.pools.length;prune(G.pools,q=>(q.x-e.x)**2+(q.y-e.y)**2>90*90);if(G.pools.length<n0){G.fx.push({k:'ring',x:e.x,y:e.y,r:90,t:0,dur:.5,col:'#cfeefa'});if(Math.random()<.4)say(e,Lg('Фу-у-у!','Whoooosh!'),1.2);}}return sp;};
CHX.tip.wind=()=>Lg('сдувает лужи Яги рядом — ставь избу подальше от летучих','blows away Yaga’s pools nearby — keep the hut away from flyers');
// гости из пройденных глав («Там чудеса»): нечисть случайной главы, пройденной раньше этой по порядку (по зерну — у всех одинаково)
function chGuests(ci,R0){const p=chPos(ci),a=[];for(let i=0;i<p;i++){const c=CH_ORDER[i];if(c<CH_OLD)a.push(c);}if(!a.length)return null;const c=a[Math.floor(R0()*a.length)];return {c,en:CH[c].en.filter(t=>!EN[t].fly||R0()<.5)};}
