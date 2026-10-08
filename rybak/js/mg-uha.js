/* Мини-игра №3 «Уха у костра» (поток MGB, 08.10.2026). Договор — rybak-boost/00-plan.md §5 «Общий договор кода».
   После рыбалки (≥3 рыбы, открыта Волга, не чаще раза в 3 рыбалки, до 3 раз в день, не в турнире) Петрович варит уху для деда Митяя.
   Ход: 5 продуктов по очереди (картошка → лук → рыба из улова → лавр → укроп). Кипение растёт по кольцу вокруг котелка:
   тап в зелёном — «в самый раз», в жёлтом — «рановато», в красном — «разварилось». Тап до жёлтого не считается (подсказка),
   не успел — пена убежала, Петрович приподнял котелок, кипение заново: жёсткого таймера нет. Холодный продукт сбивает кипение.
   Награда: +10/20/30 % к цене улова этой рыбалки (потолок 0,5·Р), Книга рецептов (8 ух по местам). Реклама — только host.ad(): «Петрович досолит» 2★→3★ раз в день.
   Сохранение — только S.mg.uh. Рисует только внутри host.el: холст-сцена + стеклянный интерфейс (переменные «Стекла и света»). */
(function(){
'use strict';
const ID='uha';
const T_=(ru,en)=>typeof L==='function'?L(ru,en):ru;
const W_=window;

/* ---------------- данные ---------------- */
const RECIPES={prud:['Прудовая из карасей','Pond crucian soup'],rechka:['Тверская деревенская','Tver village soup'],volga:['Волжская тройная','Volga triple soup'],
  seliger:['Селигерская','Seliger soup'],ladoga:['Ладожская из сига','Ladoga whitefish soup'],baikal:['Байкальская из омуля','Baikal omul soup'],
  amur:['Амурская','Amur soup'],kamchatka:['Камчатская из чавычи','Kamchatka king salmon soup']};
const BOOK_IDS=Object.keys(RECIPES);
const STEPS=[
  {k:'pot',n:['Картошка','Potatoes'],say:['Сначала картошечку. Ждём, как забурлит.','Potatoes first. Wait for the boil.']},
  {k:'onion',n:['Лук','Onion'],say:['Луковку целиком — для навара.','A whole onion — for the flavour.']},
  {k:'fish',n:['Рыба','Fish'],say:['Теперь рыбку! Самое главное — не переварить.','Now the fish! The main thing is not to overcook it.']},
  {k:'bay',n:['Лавровый лист','Bay leaf'],say:['Лаврушку — под конец.','Bay leaf goes in near the end.']},
  {k:'dill',n:['Укроп','Dill'],say:['И укропчику. Сейчас Митяй попробует!','And some dill. Mityai is about to taste it!']}];
const TIER_MIN=[0,0,66,86];          // очки → ступень (1★ — за любую сваренную уху)
const BONUS=[0,.1,.2,.3];            // доля к цене улова
const CAP_R=.5;                      // потолок добавки — 0,5·Р
const GREEN_S=1.2,GREEN_CALM=1.8,YEL_S=.9; // окна в секундах
const HMAX=1.08;                     // выше — «пена убежала»

/* ---------------- сохранение S.mg.uh ---------------- */
function today(){try{return typeof todayKey==='function'?todayKey():String(new Date().toISOString().slice(0,10));}catch(e){return '';}}
function fixU(x){if(!x||typeof x!=='object')x={};for(const f of ['n','k','rec','t'])x[f]=Math.max(0,+x[f]||0);x.ls=isFinite(+x.ls)&&x.ls!==null&&x.ls!==''?+x.ls:-9;
  if(!x.bk||typeof x.bk!=='object')x.bk={};for(const k in x.bk)if(!(x.bk[k]>=1&&x.bk[k]<=3))delete x.bk[k];if(typeof x.d!=='string')x.d='';if(typeof x.ad!=='string')x.ad='';return x;}
function st(){try{if(typeof S!=='undefined'){if(!S.mg||typeof S.mg!=='object')S.mg={};const x=S.mg.uha=fixU(S.mg.uha);
  if(x.d!==today()){x.d=today();x.k=0;}return x;}}catch(e){}return fixU({});}
// облако: числа — максимум, книга — лучшие звёзды по каждому рецепту, счётчик дня — из более свежего дня
function mergeU(a,b){a=fixU(a&&typeof a==='object'?JSON.parse(JSON.stringify(a)):{});b=fixU(b&&typeof b==='object'?b:{});const r=a;
  r.n=Math.max(a.n,b.n);r.rec=Math.max(a.rec,b.rec);r.ls=Math.max(a.ls,b.ls);r.t=Math.max(a.t,b.t);for(const k in b.bk)r.bk[k]=Math.max(r.bk[k]||0,b.bk[k]);
  if(b.d>a.d){r.d=b.d;r.k=b.k;}else if(b.d===a.d)r.k=Math.max(a.k,b.k);if(b.ad>a.ad)r.ad=b.ad;return r;}
function persist(){try{if(typeof save==='function')save();}catch(e){}}

/* ---------------- когда предлагать и сколько давать ---------------- */
function tripFish(g){return ((g&&g.catch)||[]).filter(c=>c&&c.id&&!c.lost&&!c.junk&&!c.miss&&fishOf0(c.id));}
function fishOf0(id){try{return typeof fishOf==='function'?fishOf(id):(FISH[id]||null);}catch(e){return null;}}
function tripPrice(g){return tripFish(g).reduce((s,c)=>s+(+(c.p!=null?c.p:c.c)||0),0);}
function isOpen(){try{return !!(S.open&&S.open[2]);}catch(e){return false;}} // Волга (00-plan §5)
function canOffer(g){if(!g||g.tourn||g.guest||!isOpen())return false;if(tripFish(g).length<3)return false;const u=st();
  if(u.k>=3)return false;const ss=+(typeof S!=='undefined'&&S.sessions)||0;return ss-u.ls>=3;}
function rVal(o){let r=+(o&&o.R)||0;if(!r)try{r=a3Trip();}catch(e){}return r||100;}
function bonusOf(tier,price,R){if(tier<=0)return 0;return Math.max(1,Math.min(Math.round(price*BONUS[tier]),Math.round(CAP_R*R)));}
function recipeOf(pi){let p=null;try{p=PLACES[pi];}catch(e){}const id=p&&p.id||'prud',r=RECIPES[id];
  return {id,n:r?T_(r[0],r[1]):T_('Уха «'+(p?p.n:'')+'»','Fish soup “'+(p&&p.en||'')+'”'),inBook:!!r};}

/* ---------------- модель кипения (общая для игры и авто-игрока) ---------------- */
function mkRng(seed){if(typeof rng==='function')return rng(seed);let s=seed>>>0||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function stepPlan(seed,calm){const R=mkRng((seed|0)*31+7),out=[];for(let i=0;i<STEPS.length;i++){const T=(3.1+R()*1.3)*(calm?1.3:1),gc=.74+R()*.1,
  gh=(calm?GREEN_CALM:GREEN_S)/2/T,yw=YEL_S/T*(calm?1.3:1),ph=R()*6.28;out.push({T,gc,gh,yw,ph});}return out;}
function rate(p,t){return (1+.22*Math.sin(t*1.7+p.ph))/p.T;}
// оценка тапа: null — ещё рано (не считается); иначе {v:очки, z:'g'|'y'|'r'}
function judge(p,h){if(h<p.gc-p.gh-p.yw)return null;if(h<p.gc-p.gh)return {v:Math.round(48+17*(h-(p.gc-p.gh-p.yw))/p.yw),z:'y'};
  if(h<=p.gc+p.gh)return {v:Math.round(100-28*Math.abs(h-p.gc)/p.gh),z:'g'};return {v:Math.max(25,Math.round(42-60*(h-p.gc-p.gh))),z:'r'};}
function tierOf(score){return score>=TIER_MIN[3]?3:score>=TIER_MIN[2]?2:1;}

/* авто-игрок: skill 'bad'|'mid'|'good' → {score,tier,taps}; тот же judge и та же кривая кипения */
function bot(skill,seed,calm){const P=stepPlan(seed==null?(Math.random()*1e9|0):seed,!!calm),R=mkRng(((seed|0)^0x5bd1)+(skill==='good'?1:skill==='mid'?2:3)),
  sd={good:.18,mid:.55,bad:1.3}[skill]||.55,bias={good:0,mid:-.15,bad:-.5}[skill]||0;let sum=0,taps=0;
  const gauss=()=>{let a=0;for(let i=0;i<6;i++)a+=R();return (a-3)/Math.sqrt(.5);};
  for(const p of P){let h=.3,t=0,done=false,guard=0;
    // момент центра зелёного в этом цикле
    while(!done&&guard++<8){let tt=t,hh=h;const path=[];while(hh<HMAX){path.push([tt,hh]);hh+=rate(p,tt)*.02;tt+=.02;}
      let tc=path.find(q=>q[1]>=p.gc);tc=tc?tc[0]:tt;const tap=tc+bias+gauss()*sd;
      const q=path.find(q=>q[0]>=tap);if(!q){t=tt+1;h=.3;continue;} // пена убежала — заново
      let j=judge(p,q[1]);if(!j){const y=path.find(q=>judge(p,q[1]));j=judge(p,y?y[1]:p.gc);} // нетерпеливый жмёт, пока не засчитают
      sum+=j.v;taps++;done=true;}
    if(!done){sum+=30;taps++;}}
  const score=Math.round(sum/P.length);return {score,tier:tierOf(score),taps};}

/* ---------------- рисование: продукты ---------------- */
function drawIng(g,k,x,y,s,fl){g.save();g.translate(x,y);
  if(k==='pot'){const gr=g.createRadialGradient(-s*.15,-s*.15,s*.05,0,0,s*.5);gr.addColorStop(0,'#e9c88a');gr.addColorStop(1,'#a87a3e');g.fillStyle=gr;
    g.beginPath();g.ellipse(0,0,s*.46,s*.34,-.3,0,7);g.fill();g.strokeStyle='rgba(90,60,25,.55)';g.lineWidth=Math.max(1,s*.04);g.stroke();
    g.fillStyle='rgba(110,75,35,.7)';for(const [a,b] of [[-.18,-.08],[.12,.1],[.2,-.12],[-.05,.16]]){g.beginPath();g.arc(s*a,s*b,s*.035,0,7);g.fill();}}
  else if(k==='onion'){const gr=g.createRadialGradient(-s*.12,-s*.05,s*.05,0,s*.05,s*.48);gr.addColorStop(0,'#f6dfa6');gr.addColorStop(1,'#c98a3c');g.fillStyle=gr;
    g.beginPath();g.moveTo(0,-s*.42);g.bezierCurveTo(s*.1,-s*.25,s*.42,-s*.12,s*.4,s*.12);g.bezierCurveTo(s*.38,s*.38,-s*.38,s*.38,-s*.4,s*.12);g.bezierCurveTo(-s*.42,-s*.12,-s*.1,-s*.25,0,-s*.42);g.fill();
    g.strokeStyle='rgba(140,85,30,.55)';g.lineWidth=Math.max(1,s*.03);for(const a of [-.2,0,.2]){g.beginPath();g.moveTo(0,-s*.38);g.quadraticCurveTo(s*a*1.6,s*.05,s*a*.5,s*.36);g.stroke();}
    g.strokeStyle='#7aa84a';g.lineWidth=Math.max(1,s*.06);g.lineCap='round';g.beginPath();g.moveTo(0,-s*.4);g.quadraticCurveTo(s*.05,-s*.55,s*.14,-s*.6);g.stroke();}
  else if(k==='bay'){for(const [dx,dy,r] of [[-s*.08,s*.02,-.5],[s*.1,-s*.04,.35]]){g.save();g.translate(dx,dy);g.rotate(r);const gr=g.createLinearGradient(0,-s*.4,0,s*.4);gr.addColorStop(0,'#8fb35a');gr.addColorStop(1,'#4f7a2e');g.fillStyle=gr;
    g.beginPath();g.moveTo(0,-s*.42);g.quadraticCurveTo(s*.2,0,0,s*.42);g.quadraticCurveTo(-s*.2,0,0,-s*.42);g.fill();g.strokeStyle='rgba(230,245,200,.6)';g.lineWidth=Math.max(1,s*.025);g.beginPath();g.moveTo(0,-s*.38);g.lineTo(0,s*.4);g.stroke();g.restore();}}
  else if(k==='dill'){g.strokeStyle='#5d8f35';g.lineCap='round';g.lineWidth=Math.max(1,s*.05);g.beginPath();g.moveTo(0,s*.42);g.quadraticCurveTo(s*.04,0,0,-s*.36);g.stroke();
    g.strokeStyle='#7fbf4a';g.lineWidth=Math.max(1,s*.03);for(let i=0;i<7;i++){const yy=s*(.3-i*.1),side=i%2?1:-1,len=s*(.28-i*.02);g.beginPath();g.moveTo(0,yy);g.quadraticCurveTo(side*len*.5,yy-s*.1,side*len,yy-s*.2);g.stroke();
      for(let j=1;j<4;j++){const px=side*len*j/4,py=yy-s*.2*j/4-s*.02;g.beginPath();g.moveTo(px,py);g.lineTo(px+side*s*.05,py-s*.07);g.stroke();g.beginPath();g.moveTo(px,py);g.lineTo(px-side*s*.02,py-s*.08);g.stroke();}}}
  else if(k==='fish'){const f=fl&&fishOf0(fl)||fishOf0('karas')||fishOf0('plotva');if(f&&typeof drawFish==='function'){g.rotate(-.25);drawFish(g,f.lk,0,0,s*.95);}}
  g.restore();}
function ingCanvas(k,fl,px){const dp=Math.min(2,W_.devicePixelRatio||1),c=document.createElement('canvas');c.width=c.height=Math.round(px*dp);c.style.width=c.style.height=px+'px';
  const g=c.getContext('2d');g.scale(dp,dp);try{drawIng(g,k,px/2,px/2,px*.86,fl);}catch(e){}return c;}

/* ---------------- рисование: персонажи ---------------- */
function lg(g,x0,y0,x1,y1,a,b){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,a);gr.addColorStop(1,b);return gr;}
function ell(g,x,y,rx,ry,r){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),r||0,0,7);}
// Петрович сидит на бревне лицом вправо; (x,y) — точка сиденья, s — рост; arm 0..1 — рука вперёд; ladle — половник
function drawPetr(g,x,y,s,t,arm,blink,talk){g.save();g.translate(x,y);g.lineCap='round';g.lineJoin='round';
  // ноги
  g.strokeStyle='#2c3640';g.lineWidth=s*.085;g.beginPath();g.moveTo(-s*.02,-s*.02);g.lineTo(s*.2,-s*.02);g.lineTo(s*.23,s*.2);g.stroke();
  g.strokeStyle='#36424e';g.beginPath();g.moveTo(-s*.06,0);g.lineTo(s*.15,s*.01);g.lineTo(s*.17,s*.21);g.stroke();
  g.fillStyle='#1b1f24';ell(g,s*.27,s*.22,s*.075,s*.035);g.fill();ell(g,s*.21,s*.225,s*.075,s*.035);g.fill();
  // ватник
  const lean=Math.sin(t*.9)*.01;g.rotate(lean);
  g.fillStyle=lg(g,-s*.16,0,s*.14,0,'#2f3a46','#5a6c80');g.beginPath();g.moveTo(-s*.15,s*.03);g.quadraticCurveTo(-s*.2,-s*.22,-s*.1,-s*.4);g.quadraticCurveTo(s*.02,-s*.47,s*.11,-s*.38);
  g.quadraticCurveTo(s*.17,-s*.18,s*.13,s*.03);g.closePath();g.fill();
  g.strokeStyle='rgba(20,28,36,.45)';g.lineWidth=Math.max(1,s*.008);for(let i=1;i<5;i++){g.beginPath();g.moveTo(-s*.17,-s*.07*i+s*.03);g.quadraticCurveTo(0,-s*.07*i+s*.05,s*.14,-s*.07*i+s*.02);g.stroke();}
  g.strokeStyle='rgba(255,170,90,.35)';g.lineWidth=s*.02;g.beginPath();g.moveTo(s*.13,-s*.32);g.quadraticCurveTo(s*.17,-s*.15,s*.13,s*.02);g.stroke(); // отсвет костра
  // рука с половником
  const a=-.2-arm*.9+Math.sin(t*2.2)*.04,sx=s*.05,sy=-s*.33,ex=sx+Math.cos(a)*s*.17,ey=sy-Math.sin(a)*s*.17+s*.12,hx=ex+s*.12,hy=ey-s*.02-arm*s*.06;
  g.strokeStyle='#4a5b6e';g.lineWidth=s*.075;g.beginPath();g.moveTo(sx,sy);g.lineTo(ex,ey);g.lineTo(hx,hy);g.stroke();
  g.save();g.translate(hx,hy);g.rotate(-.9+arm*.5);g.strokeStyle='#8a5a2e';g.lineWidth=s*.022;g.beginPath();g.moveTo(-s*.05,s*.04);g.lineTo(s*.2,-s*.04);g.stroke();
  g.fillStyle='#6e4522';ell(g,s*.23,-s*.05,s*.05,s*.032,-.3);g.fill();g.restore();
  g.fillStyle='#d9a77c';ell(g,hx,hy,s*.033,s*.03);g.fill();
  // голова
  const hx0=s*.0,hy0=-s*.5;g.fillStyle='#d9a77c';g.fillRect(hx0-s*.03,hy0+s*.06,s*.06,s*.05);
  g.fillStyle=lg(g,hx0-s*.09,0,hx0+s*.1,0,'#c48f66','#ebbc93');ell(g,hx0,hy0,s*.085,s*.09);g.fill();
  g.fillStyle='#d6a078';ell(g,hx0-s*.07,hy0+s*.005,s*.022,s*.03);g.fill(); // ухо
  g.fillStyle='#e3a27f';ell(g,hx0+s*.088,hy0+s*.012,s*.025,s*.022);g.fill(); // нос
  g.fillStyle='rgba(225,120,100,.35)';ell(g,hx0+s*.045,hy0+s*.03,s*.025,s*.015);g.fill();
  g.fillStyle='#2a211b';if(blink)g.fillRect(hx0+s*.035,hy0-s*.012,s*.025,s*.006);else{ell(g,hx0+s*.047,hy0-s*.01,s*.011,s*.013);g.fill();}
  g.strokeStyle='#8f8a82';g.lineWidth=s*.012;g.beginPath();g.moveTo(hx0+s*.025,hy0-s*.035);g.lineTo(hx0+s*.07,hy0-s*.03);g.stroke();
  g.fillStyle='#a6a39c';g.beginPath();g.moveTo(hx0+s*.02,hy0+s*.045);g.quadraticCurveTo(hx0+s*.06,hy0+s*.02,hx0+s*.1,hy0+s*.045);g.quadraticCurveTo(hx0+s*.07,hy0+s*.07+(talk?s*.012:0),hx0+s*.02,hy0+s*.045);g.fill();
  if(talk){g.fillStyle='#6a3a2a';ell(g,hx0+s*.062,hy0+s*.068,s*.014,s*.008);g.fill();}
  g.fillStyle='#9a968e';ell(g,hx0-s*.05,hy0+s*.03,s*.03,s*.04);g.fill();
  // кепка
  g.fillStyle=lg(g,0,hy0-s*.12,0,hy0-s*.03,'#5a4a3c','#3f342a');g.beginPath();g.moveTo(hx0-s*.09,hy0-s*.02);g.quadraticCurveTo(hx0-s*.09,hy0-s*.115,hx0+s*.01,hy0-s*.115);
  g.quadraticCurveTo(hx0+s*.09,hy0-s*.11,hx0+s*.085,hy0-s*.035);g.closePath();g.fill();
  g.fillStyle='#2f261e';g.beginPath();g.moveTo(hx0+s*.06,hy0-s*.04);g.quadraticCurveTo(hx0+s*.15,hy0-s*.045,hx0+s*.16,hy0-s*.02);g.lineTo(hx0+s*.06,hy0-s*.02);g.fill();
  g.restore();}
// дед Митяй стоит лицом влево, в руках миска с ложкой; taste 0..1 — ложка ко рту
function drawMit(g,x,y,s,t,taste,blink,talk){g.save();g.translate(x,y);g.lineCap='round';g.lineJoin='round';
  g.fillStyle='rgba(0,0,0,.25)';ell(g,0,0,s*.16,s*.03);g.fill();
  g.strokeStyle='#4a4237';g.lineWidth=s*.075;g.beginPath();g.moveTo(-s*.04,-s*.36);g.lineTo(-s*.05,-s*.02);g.stroke();g.strokeStyle='#5a5044';g.beginPath();g.moveTo(s*.04,-s*.36);g.lineTo(s*.05,-s*.02);g.stroke();
  g.fillStyle='#22201c';ell(g,-s*.075,-s*.01,s*.06,s*.028);g.fill();ell(g,s*.03,-s*.01,s*.06,s*.028);g.fill();
  const br=Math.sin(t*1.3)*s*.004;
  g.fillStyle=lg(g,-s*.14,0,s*.14,0,'#e8d6b0','#b9a27a');g.beginPath();g.moveTo(-s*.12,-s*.34);g.quadraticCurveTo(-s*.15,-s*.58,-s*.06,-s*.66+br);g.lineTo(s*.07,-s*.66+br);g.quadraticCurveTo(s*.15,-s*.58,s*.12,-s*.34);g.closePath();g.fill();
  g.fillStyle=lg(g,-s*.14,0,s*.14,0,'#8a7148','#5c4a2e');g.beginPath();g.moveTo(-s*.125,-s*.34);g.quadraticCurveTo(-s*.15,-s*.58,-s*.07,-s*.655+br);g.lineTo(-s*.03,-s*.4);g.closePath();g.fill();
  g.beginPath();g.moveTo(s*.125,-s*.34);g.quadraticCurveTo(s*.15,-s*.58,s*.07,-s*.655+br);g.lineTo(s*.03,-s*.4);g.closePath();g.fill();
  g.fillStyle='#6b4a2a';g.fillRect(-s*.12,-s*.37,s*.24,s*.025);
  // миска и руки
  const bx=-s*.1,by=-s*.47-taste*s*.04;g.fillStyle=lg(g,bx-s*.08,0,bx+s*.08,0,'#9b6a3a','#5e3d1e');g.beginPath();g.moveTo(bx-s*.085,by);g.quadraticCurveTo(bx,by+s*.09,bx+s*.085,by);g.closePath();g.fill();
  g.fillStyle='#e0b45a';ell(g,bx,by,s*.085,s*.018);g.fill();g.strokeStyle='#7a5228';g.lineWidth=s*.008;ell(g,bx,by,s*.085,s*.018);g.stroke();
  g.strokeStyle='#d9c69e';g.lineWidth=s*.065;g.beginPath();g.moveTo(s*.07,-s*.6);g.quadraticCurveTo(s*.06,-s*.45,bx+s*.06,by+s*.03);g.stroke();
  const sx=bx-s*.02+taste*s*.02,sy=by-taste*s*.16;g.beginPath();g.moveTo(-s*.08,-s*.6);g.quadraticCurveTo(-s*.14,-s*.5,sx-s*.03,sy+s*.04);g.stroke();
  g.strokeStyle='#c9a24a';g.lineWidth=s*.014;g.beginPath();g.moveTo(sx-s*.03,sy+s*.03);g.lineTo(sx-s*.06-taste*s*.02,sy-s*.04);g.stroke();
  g.fillStyle='#e2b48c';ell(g,sx-s*.03,sy+s*.035,s*.026,s*.024);g.fill();ell(g,bx+s*.065,by+s*.03,s*.026,s*.024);g.fill();
  // голова
  const hx0=-s*.005,hy0=-s*.75+br;g.fillStyle='#e2b48c';g.fillRect(hx0-s*.03,hy0+s*.05,s*.06,s*.05);
  g.fillStyle=lg(g,hx0-s*.09,0,hx0+s*.09,0,'#f0c49c','#c9926c');ell(g,hx0,hy0,s*.08,s*.088);g.fill();
  g.fillStyle='#e7e4de';ell(g,hx0+s*.072,hy0-s*.0,s*.02,s*.04);g.fill();
  g.fillStyle='#f1efea';g.beginPath();g.moveTo(hx0-s*.075,hy0+s*.01);g.quadraticCurveTo(hx0-s*.09,hy0+s*.13,hx0-s*.01,hy0+s*.17);g.quadraticCurveTo(hx0+s*.06,hy0+s*.12,hx0+s*.06,hy0+s*.02);
  g.quadraticCurveTo(hx0,hy0+s*.06,hx0-s*.075,hy0+s*.01);g.fill();
  g.fillStyle='#d8d4cc';ell(g,hx0-s*.02,hy0+s*.12,s*.025,s*.04,.2);g.fill();
  g.fillStyle='#e48f72';ell(g,hx0-s*.083,hy0+s*.005,s*.022,s*.02);g.fill();
  g.fillStyle='#ebe7e0';g.beginPath();g.moveTo(hx0-s*.07,hy0+s*.04);g.quadraticCurveTo(hx0-s*.03,hy0+s*.015,hx0,hy0+s*.04);g.quadraticCurveTo(hx0-s*.03,hy0+s*.06+(talk?s*.012:0),hx0-s*.07,hy0+s*.04);g.fill();
  g.fillStyle='#2a211b';if(blink)g.fillRect(hx0-s*.055,hy0-s*.018,s*.022,s*.006);else{ell(g,hx0-s*.043,hy0-s*.015,s*.01,s*.012);g.fill();}
  g.strokeStyle='#e9e6df';g.lineWidth=s*.016;g.beginPath();g.moveTo(hx0-s*.07,hy0-s*.045);g.lineTo(hx0-s*.02,hy0-s*.05);g.stroke();
  g.fillStyle='rgba(255,255,255,.18)';ell(g,hx0+s*.01,hy0-s*.07,s*.04,s*.018,-.2);g.fill(); // лысина блестит
  if(taste>.85){g.fillStyle='rgba(255,140,120,.45)';ell(g,hx0-s*.03,hy0+s*.02,s*.022,s*.013);g.fill();}
  g.restore();}
// кот Васька сидит в три четверти, хвост ходит; eyes — глаза горят от костра
function drawCat(g,x,y,s,t,blink){g.save();g.translate(x,y);const col='#e08a3a',dk='#b8621f',lt='#f4b46e';
  g.fillStyle='rgba(0,0,0,.25)';ell(g,0,0,s*.42,s*.07);g.fill();
  const tw=Math.sin(t*1.8)*s*.12;g.strokeStyle=col;g.lineCap='round';g.lineWidth=s*.12;g.beginPath();g.moveTo(s*.25,-s*.08);g.quadraticCurveTo(s*.65,0,s*.6+tw,-s*.38);g.stroke();
  g.strokeStyle=dk;g.lineWidth=s*.04;g.beginPath();g.moveTo(s*.58+tw*.9,-s*.3);g.lineTo(s*.66+tw,-s*.32);g.stroke();
  g.fillStyle=lg(g,-s*.3,0,s*.3,0,dk,col);ell(g,0,-s*.3,s*.32,s*.33);g.fill();
  g.fillStyle=lt;ell(g,-s*.06,-s*.24,s*.14,s*.2);g.fill();
  g.fillStyle=col;ell(g,-s*.13,-s*.03,s*.08,s*.05);g.fill();ell(g,s*.05,-s*.03,s*.08,s*.05);g.fill();
  const hy=-s*.72,hx=-s*.05;g.fillStyle=col;g.beginPath();g.moveTo(hx-s*.2,hy-s*.05);g.lineTo(hx-s*.17,hy-s*.3);g.lineTo(hx-s*.04,hy-s*.16);g.fill();g.beginPath();g.moveTo(hx+s*.2,hy-s*.05);g.lineTo(hx+s*.17,hy-s*.3);g.lineTo(hx+s*.04,hy-s*.16);g.fill();
  g.fillStyle='#f2a6a0';g.beginPath();g.moveTo(hx-s*.17,hy-s*.1);g.lineTo(hx-s*.155,hy-s*.24);g.lineTo(hx-s*.08,hy-s*.15);g.fill();g.beginPath();g.moveTo(hx+s*.17,hy-s*.1);g.lineTo(hx+s*.155,hy-s*.24);g.lineTo(hx+s*.08,hy-s*.15);g.fill();
  g.fillStyle=lg(g,hx-s*.2,0,hx+s*.2,0,'#d17a30',lt);ell(g,hx,hy,s*.22,s*.19);g.fill();
  g.strokeStyle=dk;g.lineWidth=s*.03;for(const d of [-.06,0,.06]){g.beginPath();g.moveTo(hx+s*d,hy-s*.18);g.lineTo(hx+s*d*.6,hy-s*.1);g.stroke();}
  g.fillStyle='#fff3e0';ell(g,hx,hy+s*.07,s*.1,s*.065);g.fill();
  if(blink){g.strokeStyle='#4a2a10';g.lineWidth=s*.02;g.beginPath();g.moveTo(hx-s*.12,hy);g.lineTo(hx-s*.05,hy);g.moveTo(hx+s*.05,hy);g.lineTo(hx+s*.12,hy);g.stroke();}
  else for(const ex of [-.085,.085]){g.fillStyle='#ffd24a';ell(g,hx+s*ex,hy-s*.005,s*.045,s*.04);g.fill();g.fillStyle='#2a1a08';ell(g,hx+s*ex,hy-s*.005,s*.012,s*.035);g.fill();g.fillStyle='rgba(255,255,255,.9)';ell(g,hx+s*ex+s*.015,hy-s*.02,s*.01,s*.01);g.fill();}
  g.fillStyle='#e07a7a';g.beginPath();g.moveTo(hx-s*.025,hy+s*.04);g.lineTo(hx+s*.025,hy+s*.04);g.lineTo(hx,hy+s*.065);g.fill();
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=Math.max(1,s*.008);for(const d of [-1,1])for(const k of [-.02,.02]){g.beginPath();g.moveTo(hx+d*s*.06,hy+s*.07+s*k);g.lineTo(hx+d*s*.26,hy+s*.05+s*k*2.5);g.stroke();}
  g.restore();}

/* ---------------- игра ---------------- */
const CSS=`
.mgu{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;background:#1b2430;color:#fff;font-family:var(--font,-apple-system,"Segoe UI",Roboto,sans-serif);-webkit-user-select:none;user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent}
.mgu canvas.mgu-cv{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
html.mg-pc .mgu canvas.mgu-cv{cursor:pointer}html.mg-pc .mgu-btn:hover{filter:brightness(1.08)}.mgu-tray .mg-k{margin:0 2px}
.mgu-pn{background:var(--pn2,rgba(16,26,36,.66));border:1px solid var(--pnB,rgba(255,255,255,.2));-webkit-backdrop-filter:var(--blur,blur(16px));backdrop-filter:var(--blur,blur(16px));border-radius:var(--r,20px);box-shadow:var(--sh,0 8px 28px rgba(0,0,0,.18))}
.mgu-top{position:absolute;left:70px;right:12px;top:calc(10px + env(safe-area-inset-top,0px));display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;pointer-events:none}
.mgu.tr .mgu-top{left:12px;top:calc(68px + env(safe-area-inset-top,0px))}
.mgu-ttl{padding:9px 16px 10px;min-width:0;flex:0 1 auto}
.mgu-ttl b{display:block;font-size:20px;font-weight:600;line-height:1.15;text-shadow:var(--txSh,0 1px 3px rgba(0,0,0,.5))}
.mgu-ttl small{display:block;font-size:14px;color:var(--gold,#ffd27a);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mgu-steps{display:flex;gap:6px;margin-left:auto;padding:7px 9px}
.mgu-st{position:relative;width:40px;height:40px;border-radius:50%;background:var(--in,rgba(255,255,255,.08));border:1.5px solid var(--inB,rgba(255,255,255,.14));display:flex;align-items:center;justify-content:center;transition:transform .3s,opacity .3s;opacity:.55}
.mgu-st.on{opacity:1;border-color:var(--acc1,#ffcf7a);box-shadow:0 0 0 3px rgba(255,207,122,.25),0 0 14px rgba(255,170,80,.55);transform:scale(1.12)}
.mgu-st.ok{opacity:1}.mgu-st i{position:absolute;right:-4px;bottom:-4px;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;border:1.5px solid rgba(0,0,0,.25)}
.mgu-st i.g{background:var(--ok,#6be3b0)}.mgu-st i.y{background:var(--warn,#ffd36b)}.mgu-st i.r{background:var(--bad,#ff9a8b)}
.mgu-st i svg{width:12px;height:12px}
.mgu-say{position:absolute;left:14px;max-width:min(330px,calc(100% - 28px));padding:10px 15px 11px;background:var(--say,rgba(16,26,36,.72));border:1px solid var(--pnB,rgba(255,255,255,.2));-webkit-backdrop-filter:var(--blur,blur(14px));backdrop-filter:var(--blur,blur(14px));border-radius:18px;font-size:17px;line-height:1.3;color:var(--sayT,#fff);opacity:0;transform:translateY(6px);transition:opacity .35s,transform .35s;pointer-events:none}
.mgu-say.on{opacity:1;transform:none}.mgu-say b{display:block;color:var(--sayN,#ffd27a);font-size:15px;margin-bottom:2px}
.mgu-bot{position:absolute;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;justify-content:center;pointer-events:none}
.mgu-tray{display:flex;align-items:center;gap:12px;padding:8px 18px 8px 10px;min-height:72px;max-width:460px;width:100%;box-sizing:border-box}
.mgu-tray .ic{flex:0 0 64px;height:64px;border-radius:16px;background:radial-gradient(circle at 50% 40%,rgba(255,220,160,.28),rgba(255,255,255,.05));display:flex;align-items:center;justify-content:center}
.mgu-tray .tx{min-width:0}.mgu-tray .tx b{display:block;font-size:20px;font-weight:600}.mgu-tray .tx span{display:block;font-size:15px;color:var(--tx2,rgba(255,255,255,.84));line-height:1.25}
.mgu-res{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,12,18,.35);opacity:0;pointer-events:none;transition:opacity .4s}
.mgu-res.on{opacity:1;pointer-events:auto}
.mgu-card{width:100%;max-width:380px;box-sizing:border-box;padding:14px 18px 18px;text-align:center;background:var(--pnS2,rgba(20,32,44,.94));-webkit-backdrop-filter:none;backdrop-filter:none;transform:translateY(30px) scale(.96);transition:transform .45s cubic-bezier(.2,1.3,.4,1)}
.mgu-res.on .mgu-card{transform:none}
.mgu-card h2{margin:2px 0 6px;font-size:26px;font-weight:600;color:var(--gold,#ffd27a);text-shadow:0 2px 10px rgba(255,160,60,.35)}
.mgu-stars{display:flex;justify-content:center;gap:6px;margin:4px 0 6px;height:58px}
.mgu-stars svg{width:54px;height:54px;transform:scale(0);transition:transform .45s cubic-bezier(.2,1.6,.4,1)}.mgu-stars svg.on{transform:scale(1)}.mgu-stars svg:nth-child(2){width:58px;height:58px;margin-top:-6px}
.mgu-q{margin:6px 0 10px;font-size:16px;line-height:1.35;color:var(--tx2,rgba(255,255,255,.84));display:flex;gap:10px;align-items:flex-start;text-align:left}
.mgu-q .av{flex:0 0 44px;height:44px;border-radius:50%;overflow:hidden}.mgu-q .av svg{width:44px;height:44px;display:block}.mgu-q b{color:var(--sayN,#ffd27a);display:block;font-size:14px}
.mgu-line{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;margin:6px 0;border-radius:14px;background:var(--in,rgba(255,255,255,.08));border:1px solid var(--inB,rgba(255,255,255,.14));font-size:16px;text-align:left}
.mgu-line em{font-style:normal;font-weight:600;color:var(--ok,#6be3b0);white-space:nowrap;display:flex;align-items:center;gap:4px}.mgu-line .coin{width:20px;height:20px}
.mgu-line.new{border-color:var(--warnB,rgba(255,207,122,.5));background:var(--warnBg,rgba(255,207,122,.15))}.mgu-line .ic{width:22px;height:22px;flex:0 0 22px}
.mgu-line span{display:flex;align-items:center;gap:8px;min-width:0}
.mgu-btns{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.mgu-btn{min-height:56px;border-radius:16px;border:1px solid var(--secB,rgba(255,255,255,.28));background:var(--sec,rgba(255,255,255,.14));color:var(--secT,#fff);font:600 18px/1.2 var(--font,sans-serif);display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;padding:8px 14px}
.mgu-btn.go{background:linear-gradient(180deg,#7fe0a0,#3fae6c);border-color:rgba(255,255,255,.35);color:#0c2a17;box-shadow:0 6px 18px rgba(60,180,110,.35)}
.mgu-btn.mgu-adb{background:linear-gradient(180deg,var(--acc1,#ffcf7a),var(--acc2,#ff8f4f));color:var(--accT,#3b1c00);border-color:rgba(255,255,255,.35);box-shadow:var(--accSh,0 6px 18px rgba(255,140,70,.35))}
.mgu-btn .ic{width:22px;height:22px}.mgu-btn:disabled{opacity:.6}
.mgu-bowl{display:block;margin:-4px auto 0;width:220px;height:118px}
.mgu-rl{display:flex;gap:10px;align-items:center;text-align:left;font-size:17px;line-height:1.35;color:rgba(255,255,255,.88);margin:4px 0 6px}.mgu-rl img{width:110px;height:59px;flex:0 0 110px}.mgu-rl b{display:block;color:var(--sayN,#ffd27a);font-size:15px}
.mgu-rl2{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;font-size:17px;margin:6px 0}.mgu-rl2 b{color:var(--ok,#6be3b0);font-size:20px}.mgu-rl2 .coin,.mgu-rl2 svg{width:22px;height:22px}.mgu-rl2.new{color:var(--gold,#ffd27a)}
.mgu-slot{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:16px;background:linear-gradient(90deg,rgba(255,170,80,.22),rgba(255,120,60,.1));border:1px solid rgba(255,207,122,.45);text-align:left}.mgu-slot .si{flex:0 0 48px;height:48px}.mgu-slot .st{flex:1;min-width:0;font-size:17px;line-height:1.25}.mgu-slot .st b{display:block}.mgu-slot .st small{display:block;font-size:17px;color:var(--tx2,rgba(255,255,255,.84))}.mgu-slot .btn{flex:0 0 auto;min-height:48px;width:auto!important;margin:0}
@media (max-width:560px){.mgu-ttl{flex:1 1 100%;display:flex;align-items:baseline;gap:10px;padding:8px 14px}.mgu-ttl b{font-size:19px;white-space:nowrap}.mgu-ttl small{margin:0}.mgu-steps{margin:0 auto;padding:6px 8px}.mgu-st{width:42px;height:42px}}
@media (min-width:700px) and (min-height:560px){.mgu-ttl b{font-size:24px}.mgu-st{width:48px;height:48px}.mgu-tray{min-height:84px}.mgu-tray .tx b{font-size:22px}.mgu-say{left:28px;font-size:18px}}
@media (max-height:620px){.mgu-card{padding:8px 14px 12px}.mgu-bowl{height:84px;width:160px}.mgu-stars{height:46px}.mgu-stars svg{width:42px;height:42px}.mgu-btn{min-height:50px}}`;
function css(){if(document.getElementById('mgu-css'))return;const s=document.createElement('style');s.id='mgu-css';s.textContent=CSS;document.head.appendChild(s);}
function starSvg(on){return `<svg viewBox="0 0 48 48"><defs><linearGradient id="mgs${on?1:0}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${on?'#fff1b0':'#5b6672'}"/><stop offset="1" stop-color="${on?'#ffb43a':'#38424d'}"/></linearGradient></defs><path d="M24 3.5l6.2 13 14.2 1.8-10.4 9.8 2.7 14.1L24 35.3l-12.7 6.9 2.7-14.1L3.6 18.3l14.2-1.8z" fill="url(#mgs${on?1:0})" stroke="${on?'#b86a10':'#2a323b'}" stroke-width="2.2" stroke-linejoin="round"/>${on?'<path d="M17 15l4-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>':''}</svg>`;}
const MARK={g:'<svg viewBox="0 0 12 12"><path d="M2.5 6.5l2.3 2.2 4.7-5" stroke="#0c3a26" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  y:'<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="2.2" fill="#5a3d00"/></svg>',r:'<svg viewBox="0 0 12 12"><path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="#5a1a10" stroke-width="2" stroke-linecap="round"/></svg>'};
function icon(k){try{return W_.LOOK&&LOOK.I?LOOK.I(k):'';}catch(e){return '';}}
function coinH(){try{return W_.LOOK&&LOOK.coin?LOOK.coin():'';}catch(e){return '';}}
function avH(k){try{return W_.LOOK&&LOOK.av?LOOK.av(k):'';}catch(e){return '';}}
function KC(k){try{return W_.MG&&MG.kc?MG.kc(k):'';}catch(e){return '';}}
function snd(k){try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}}
function vib(ms){try{if(typeof buzz==='function')buzz(ms);}catch(e){}}

function run(host,o){o=o||{};
  if(o.bot){const r=bot(o.bot,o.seed,o.calm);setTimeout(()=>host.done({score:r.score,tier:r.tier}),0);return;}
  css();const el=host.el,calm=!!o.calm,train=!!o.train,lowQ=typeof LOW!=='undefined'&&LOW;
  const trip=o.trip||LAST.g||(typeof G!=='undefined'&&G&&G.catch?G:null)||standTrip();
  const pi=trip.pi|0,rec=recipeOf(pi),fishL=tripFish(trip).slice().sort((a,b)=>(b.w||0)-(a.w||0)).slice(0,3).map(c=>c.id);
  if(!fishL.length)fishL.push((PLACES[pi]&&PLACES[pi].fish[0])||'karas');
  const seed=(o.seed==null?(typeof dayNum==='function'?dayNum():1):o.seed)+(+o.nth||0)*977,plan=stepPlan(seed,calm);
  const root=document.createElement('div');root.className='mgu'+(train||o.delo?' tr':'');
  const PC=!!host.pc;if(host.amb)host.amb('fire','evening'); // RB:MGPC костёр нарисован вечером (pal 'evening')
  root.innerHTML=`<canvas class="mgu-cv"></canvas>
    <div class="mgu-top"><div class="mgu-ttl mgu-pn"><b>${T_('Уха у костра','Campfire fish soup')}</b><small></small></div><div class="mgu-steps mgu-pn"></div></div>
    <div class="mgu-say"><b>${T_('Петрович','Petrovich')}</b><span></span></div>
    <div class="mgu-bot"><div class="mgu-tray mgu-pn"><div class="ic"></div><div class="tx"><b></b><span></span></div></div></div>
    <div class="mgu-res"><div class="mgu-card mgu-pn"></div></div>`;
  el.appendChild(root);
  const cv=root.querySelector('canvas'),g=cv.getContext('2d'),$q=s=>root.querySelector(s);
  $q('.mgu-ttl small').textContent=rec.n;
  const stEls=STEPS.map((s,i)=>{const d=document.createElement('div');d.className='mgu-st';d.appendChild(ingCanvas(s.k,fishL[0],30));$q('.mgu-steps').appendChild(d);return d;});

  /* состояние */
  const Z={W:0,H:0,dp:1,t:0,ph:'intro',pt:0,i:0,h:.3,lift:0,res:[],parts:[],pops:[],fly:null,arm:0,mitT:0,sayT:0,sayWho:'p',blinkP:0,blinkM:0,blinkC:0,over:false,shake:0,foam:0,inPot:[],missed:0,raf:0,last:0,bg:null,glow:null};
  /* геометрия */
  function geo(){const r=el.getBoundingClientRect(),W=Math.max(240,r.width),H=Math.max(300,r.height),land=W>H*1.05,dp=Math.min(typeof lowDp==='function'?lowDp():2,W_.devicePixelRatio||1,2);
    Z.W=W;Z.H=H;Z.dp=dp;Z.land=land;cv.width=Math.round(W*dp);cv.height=Math.round(H*dp);
    const kr=land?Math.min(H*.115,W*.08):Math.min(W*.165,H*.088);Z.kr=kr;Z.kx=W/2;Z.ky=land?H*.53:H*.555;Z.hz=land?H*.36:H*.33;Z.gy=land?H*.5:H*.47;
    Z.fx=Z.kx;Z.fy=Z.ky+kr*1.55;Z.top=Z.ky-kr*2.5;const s=kr*(land?2.9:2.75);Z.s=s;
    Z.px=Z.kx-(land?Math.min(W*.24,kr*3.6):kr*2.3);Z.py=Z.fy-s*.06;Z.mx=Z.kx+(land?Math.min(W*.23,kr*3.4):kr*2.25);Z.my=Z.fy-s*.12;Z.ms=s*.92;
    Z.cx0=land?Z.kx+Math.min(W*.33,kr*5):W-kr*.95;Z.cy0=land?H*.86:Z.fy+kr*1.55;Z.cs=kr*(land?1.25:1.05);
    buildBg();place();}
  function place(){const sy=$q('.mgu-say');const top=$q('.mgu-top').getBoundingClientRect(),r=root.getBoundingClientRect();sy.style.top=(top.bottom-r.top+10)+'px';}
  function buildBg(){const W=Z.W,H=Z.H,dp=Z.dp,c=document.createElement('canvas');c.width=Math.round(W*dp);c.height=Math.round(H*dp);const q=c.getContext('2d');q.scale(dp,dp);
    let P=null;try{const lk=PLACES[pi]&&PLACES[pi].look||'pond';P=pal(lk,'evening','sun');const G0={hz:Z.hz,shY:Z.gy,yOf:d=>Z.hz+(Z.gy-Z.hz)*9/(9+d)};paintBg(q,W,H,G0,pi,P,true);}
    catch(e){const sg=q.createLinearGradient(0,0,0,Z.gy);sg.addColorStop(0,'#3c3f6e');sg.addColorStop(.6,'#e59a6a');sg.addColorStop(1,'#6a5a6a');q.fillStyle=sg;q.fillRect(0,0,W,H);}
    Z.P=P;const tn=c0=>P&&P.tint?P.tint(c0):c0,u=Math.min(W,H)/100,R=mkRng(pi*977+13);
    // дальние ели силуэтом по краям берега — глубина
    q.fillStyle='rgba(28,34,44,.55)';for(let i=0;i<14;i++){const left=i<7,x=left?R()*W*.22:W*(.78+R()*.24),h=u*(9+R()*9),y=Z.gy+u*.5;q.beginPath();q.moveTo(x,y-h);q.lineTo(x-h*.28,y);q.lineTo(x+h*.28,y);q.fill();}
    // ближний берег: земля, трава, вытоптанная площадка у костра
    const gg=q.createLinearGradient(0,Z.gy,0,H);gg.addColorStop(0,tn('#5d7a3a'));gg.addColorStop(.35,tn('#4a6630'));gg.addColorStop(1,tn('#2b3f1f'));q.fillStyle=gg;
    q.beginPath();q.moveTo(-5,Z.gy+u*1.5);for(let x=0;x<=W+10;x+=W/14)q.lineTo(x,Z.gy+Math.sin(x*.02+pi)*u*1.2);q.lineTo(W+5,H);q.lineTo(-5,H);q.fill();
    q.fillStyle=tn('#8a7a4a');q.globalAlpha=.55;q.beginPath();q.moveTo(-5,Z.gy+u*1.5);for(let x=0;x<=W+10;x+=W/14)q.lineTo(x,Z.gy+Math.sin(x*.02+pi)*u*1.2);for(let x=W+10;x>=-10;x-=W/14)q.lineTo(x,Z.gy+u*1.6+Math.sin(x*.02+pi)*u*1.2);q.fill();q.globalAlpha=1;
    const pg=q.createRadialGradient(Z.fx,Z.fy,1,Z.fx,Z.fy,Z.kr*3.2);pg.addColorStop(0,'rgba(140,105,70,.85)');pg.addColorStop(.7,'rgba(120,95,60,.45)');pg.addColorStop(1,'rgba(120,95,60,0)');q.fillStyle=pg;
    q.save();q.translate(Z.fx,Z.fy);q.scale(1,.32);q.beginPath();q.arc(0,0,Z.kr*3.2,0,7);q.fill();q.restore();
    q.strokeStyle=tn('#7aa04a');q.lineWidth=Math.max(1,u*.3);q.lineCap='round';q.beginPath();for(let i=0;i<170;i++){const x=R()*W,y=Z.gy+u*2+Math.pow(R(),.8)*(H-Z.gy);if(Math.hypot((x-Z.fx)/3.2,(y-Z.fy))<Z.kr*1.2)continue;const hh=u*(1+R()*2.2)*(.6+(y-Z.gy)/(H-Z.gy));q.moveTo(x,y);q.lineTo(x+(R()-.5)*u*1.6,y-hh);}q.stroke();
    q.fillStyle=tn('#c9c26a');for(let i=0;i<18;i++){const x=R()*W,y=Z.gy+u*4+R()*(H-Z.gy-u*4);if(Math.abs(x-Z.fx)<Z.kr*2.5&&Math.abs(y-Z.fy)<Z.kr)continue;q.beginPath();q.arc(x,y,u*.35,0,7);q.fill();}
    // бревно Петровича
    const lx=Z.px,ly=Z.py+Z.s*.04,lw=Z.s*.62,lh=Z.s*.12;q.fillStyle='rgba(0,0,0,.28)';ell(q,lx,ly+lh*.6,lw*.6,lh*.35);q.fill();
    q.fillStyle=lg(q,0,ly-lh/2,0,ly+lh/2,tn('#7a5634'),tn('#3f2a18'));rr0(q,lx-lw/2,ly-lh/2,lw,lh,lh/2);q.fill();
    q.strokeStyle='rgba(30,18,8,.45)';q.lineWidth=Math.max(1,u*.25);for(let i=0;i<5;i++){q.beginPath();q.moveTo(lx-lw/2+lh*.5+i*lw*.2,ly-lh*.35);q.lineTo(lx-lw/2+lh*.9+i*lw*.2,ly+lh*.3);q.stroke();}
    q.fillStyle=tn('#c49a62');ell(q,lx+lw/2-lh*.1,ly,lh*.22,lh*.48);q.fill();q.strokeStyle=tn('#8a6238');q.lineWidth=Math.max(1,u*.2);ell(q,lx+lw/2-lh*.1,ly,lh*.12,lh*.28);q.stroke();
    // ведро с уловом у бревна
    const bx=Math.max(Z.s*.13,Z.px-Z.s*.36),by=Z.py+Z.s*.2,bw=Z.s*.2,bh=Z.s*.19;if(bx>-bw*.3){q.fillStyle='rgba(0,0,0,.25)';ell(q,bx,by,bw*.6,bw*.14);q.fill();
      q.fillStyle=lg(q,bx-bw/2,0,bx+bw/2,0,tn('#7d868c'),tn('#c9d0d4'));q.beginPath();q.moveTo(bx-bw*.5,by-bh);q.lineTo(bx+bw*.5,by-bh);q.lineTo(bx+bw*.38,by);q.lineTo(bx-bw*.38,by);q.closePath();q.fill();
      q.fillStyle=tn('#34474f');ell(q,bx,by-bh,bw*.5,bw*.13);q.fill();
      fishL.forEach((id,i)=>{const f=fishOf0(id);if(f){q.save();q.translate(bx-bw*.18+i*bw*.18,by-bh-bw*.12);q.rotate(-1.2+i*.3);try{drawFish(q,f.lk,0,0,bw*.55);}catch(e){}q.restore();}});
      q.strokeStyle=tn('#a8b0b5');q.lineWidth=Math.max(1,u*.3);ell(q,bx,by-bh,bw*.5,bw*.13);q.stroke();}
    // камни очага
    for(let i=0;i<11;i++){const a=Math.PI*(i/10),x=Z.fx+Math.cos(a+Math.PI)*Z.kr*1.15,y=Z.fy+Math.sin(a)*Z.kr*.06;stone(q,x,y,Z.kr*(.2+R()*.06),tn);}
    // тренога: две ноги сзади
    q.strokeStyle=tn('#4a3220');q.lineWidth=Z.kr*.09;q.lineCap='round';q.beginPath();q.moveTo(Z.kx,Z.top);q.lineTo(Z.kx-Z.kr*1.75,Z.fy+Z.kr*.15);q.moveTo(Z.kx,Z.top);q.lineTo(Z.kx+Z.kr*1.75,Z.fy+Z.kr*.15);q.stroke();
    q.strokeStyle='rgba(255,190,120,.25)';q.lineWidth=Z.kr*.03;q.beginPath();q.moveTo(Z.kx+Z.kr*.05,Z.top+Z.kr*.2);q.lineTo(Z.kx+Z.kr*1.72,Z.fy+Z.kr*.05);q.stroke();
    Z.bg=c;
    const mk=(rgb)=>{const c2=document.createElement('canvas');c2.width=c2.height=64;const q2=c2.getContext('2d'),g2=q2.createRadialGradient(32,32,1,32,32,32);g2.addColorStop(0,'rgba('+rgb+',1)');g2.addColorStop(.5,'rgba('+rgb+',.45)');g2.addColorStop(1,'rgba('+rgb+',0)');q2.fillStyle=g2;q2.fillRect(0,0,64,64);return c2;};Z.smk=mk('125,122,130');Z.stm=mk('255,255,255');
    const vg=document.createElement('canvas');vg.width=Math.round(W/4);vg.height=Math.round(H/4);const vq=vg.getContext('2d'),vgr=vq.createRadialGradient(vg.width/2,vg.height*.58,Math.min(vg.width,vg.height)*.3,vg.width/2,vg.height*.58,Math.hypot(vg.width,vg.height)*.62);vgr.addColorStop(0,'rgba(10,8,20,0)');vgr.addColorStop(1,'rgba(10,8,20,.55)');vq.fillStyle=vgr;vq.fillRect(0,0,vg.width,vg.height);Z.vig=vg;
    // пятно света костра (готовое, без градиента на каждый кадр)
    const gc=document.createElement('canvas');gc.width=gc.height=128;const gq=gc.getContext('2d'),gr=gq.createRadialGradient(64,64,1,64,64,64);gr.addColorStop(0,'rgba(255,170,70,.55)');gr.addColorStop(.45,'rgba(255,140,50,.18)');gr.addColorStop(1,'rgba(255,140,50,0)');gq.fillStyle=gr;gq.fillRect(0,0,128,128);Z.glow=gc;}
  function rr0(q,x,y,w,h,r){q.beginPath();q.moveTo(x+r,y);q.arcTo(x+w,y,x+w,y+h,r);q.arcTo(x+w,y+h,x,y+h,r);q.arcTo(x,y+h,x,y,r);q.arcTo(x,y,x+w,y,r);q.closePath();}
  function stone(q,x,y,r,tn){q.fillStyle=lg(q,x,y-r,x,y+r,tn('#9a958c'),tn('#4d4a45'));ell(q,x,y,r*1.15,r*.7);q.fill();q.fillStyle='rgba(255,255,255,.12)';ell(q,x-r*.3,y-r*.3,r*.45,r*.2);q.fill();}

  /* реплики */
  function say(who,txt,ms){const s=$q('.mgu-say');s.querySelector('b').textContent=who==='m'?T_('Дед Митяй','Grandpa Mityai'):T_('Петрович','Petrovich');s.querySelector('span').textContent=txt;s.classList.add('on');
    Z.sayWho=who;Z.sayT=(ms||2600)/1000;}
  function tray(){const s=STEPS[Z.i];if(!s)return;const ic=$q('.mgu-tray .ic');ic.innerHTML='';ic.appendChild(ingCanvas(s.k,fishL[0],60));
    $q('.mgu-tray b').textContent=s.k==='fish'&&fishL.length>1?T_('Рыба ×'+fishL.length,'Fish ×'+fishL.length):T_(s.n[0],s.n[1]);
    if(PC)$q('.mgu-tray span').innerHTML=T_('Щёлкни мышкой или нажми '+KC('Пробел')+', когда кольцо станет зелёным','Click or press '+KC('Space')+' when the ring turns green');
    else $q('.mgu-tray span').textContent=T_('Коснись экрана, когда кольцо станет зелёным','Tap when the ring turns green');
    stEls.forEach((e,i)=>{e.classList.toggle('on',i===Z.i);});}
  function hintTx(t){$q('.mgu-tray span').textContent=t;}

  /* ввод: один палец, касание в любом месте сцены */
  function onDown(e){if(Z.over||Z.fin||Z.ph==='res')return;if(e.target&&e.target.closest&&e.target.closest('.mgu-res'))return;e.preventDefault();
    if(Z.ph!=='boil'){return;}const p=plan[Z.i],j=judge(p,Z.h);
    if(!j){snd('tick');hintTx(T_('Ещё не закипело — жди пузырей у края','Not boiling yet — wait for bubbles at the rim'));Z.shake=.25;return;}
    throwIng(j);}
  root.addEventListener('pointerdown',onDown,{passive:false});
  /* RB:MGPC клавиши: пробел/Enter — бросить продукт (как касание); в окне «Петрович досолит» Enter — «Подать так» (data-enter) */
  host.keys(k=>{if(k!==' '&&k!=='Enter')return false;if(Z.over||Z.fin||Z.ph==='res')return false;if(Z.ph==='boil')onDown({preventDefault(){},target:cv});return true;});
  function throwIng(j){const s=STEPS[Z.i];Z.ph='fly';Z.pt=0;Z.arm=1;snd('click');
    const fromX=Z.px+Z.s*.25,fromY=Z.py-Z.s*.45;Z.fly={k:s.k,x0:fromX,y0:fromY,t:0,dur:.55,j,n:s.k==='fish'?fishL.length:1};}
  function landIng(){const f=Z.fly,j=f.j,s=STEPS[Z.i];Z.fly=null;Z.res.push(j);snd(j.z==='g'?'plop':'splash');vib(j.z==='g'?20:[15,30,15]);
    for(let k=0;k<f.n;k++)Z.inPot.push({k:s.k,fl:fishL[k%fishL.length],a:Math.random()*6.28,r:.25+Math.random()*.5,rot:Math.random()*6.28});
    const n=lowQ?8:16;for(let i=0;i<n;i++){const a=-Math.PI*(.15+.7*Math.random());Z.parts.push({k:'drop',x:Z.kx+(Math.random()-.5)*Z.kr*.6,y:Z.ky-Z.kr*.35,vx:Math.cos(a)*Z.kr*(1+Math.random()*2),vy:Math.sin(a)*Z.kr*(2+Math.random()*2.5),l:.6+Math.random()*.4,t:0});}
    const tx=j.z==='g'?T_('В самый раз!','Just right!'):j.z==='y'?T_('Рановато','A bit early'):T_('Разварилось','Overcooked');
    Z.pops.push({tx,c:j.z==='g'?'#8ff0c0':j.z==='y'?'#ffe08a':'#ffb0a0',x:Z.kx,y:Z.ky-Z.kr*1.9,t:0,big:j.z==='g'});
    const e=stEls[Z.i];e.classList.remove('on');e.classList.add('ok');const m=document.createElement('i');m.className=j.z;m.innerHTML=MARK[j.z];e.appendChild(m);
    if(j.z==='g'&&!calm){Z.shake=0;}
    Z.h=Math.max(.18,Z.h-.38);Z.ph='judge';Z.pt=0;
    if(j.z==='r')say('p',T_('Эх, переварил малость. Ничего!','Oops, a bit overcooked. No worries!'),1800);else if(j.z==='y')say('p',T_('Рановато кинули — ну да ладно.','A tad early — that\'s fine.'),1800);
    else if(Math.random()<.5)say('p',T_(['Во! Как по учебнику.','Ай, хорошо пошло!','Вот это навар!'][Z.i%3],['Spot on!','Lovely!','What a broth!'][Z.i%3]),1600);}
  function nextStep(){Z.i++;if(Z.i>=STEPS.length){finale();return;}Z.ph='boil';Z.pt=0;tray();const s=STEPS[Z.i];say('p',T_(s.say[0],s.say[1]),2600);}
  function finale(){Z.ph='final';Z.pt=0;$q('.mgu-bot').style.opacity='0';say('m',T_('Ну-ка, ну-ка… дай попробую!','Let me have a taste!'),2200);}

  /* итоги: окно итогов — оболочки (MG0); своё окно — только когда есть просьба «Петрович досолит» (2★, раз в день) */
  const HEAD=[,T_('Съедобно!','Edible!'),T_('Хороша уха!','Nice soup!'),T_('Знатная уха!','Superb fish soup!')];
  const QUOTE=[,T_('Жидковата, но горячая — и то хорошо. Спасибо, Петрович!','A bit thin, but hot — that\'s good. Thanks!'),T_('Наваристая! Ещё бы чуток посолить — и как у моей бабки.','Rich! A pinch more salt and it\'s like my granny\'s.'),T_('Вот это уха! Всё кафе «У моста» сбежится. Плачу сверху!','Now that\'s soup! I\'m paying extra!')];
  let resDone=false;
  function showRes(){Z.ph='res';const sc=Math.round(Z.res.reduce((s,j)=>s+j.v,0)/STEPS.length),u=st();let tier=tierOf(sc);
    const adOffer=!train&&tier===2&&u.ad!==today()&&typeof host.ad==='function'&&(typeof host.adOk!=='function'||host.adOk());
    if(!adOffer){setTimeout(()=>finish(sc,tier,false),350);return;}
    const card=$q('.mgu-card');
    card.innerHTML=`<canvas class="mgu-bowl"></canvas><h2>${HEAD[2]}</h2><div class="mgu-stars">${[1,2,3].map(i=>starSvg(i<=2)).join('')}</div>
      <div class="mgu-q"><div class="av">${avH('mit')}</div><div><b>${T_('Дед Митяй','Grandpa Mityai')}</b>${QUOTE[2]}</div></div>
      <div class="mgu-btns"><button class="mgu-btn mgu-adb" data-a="ad"><span class="ic">${icon('ad')}</span>${T_('Петрович досолит — 3 звезды','Petrovich adds salt — 3 stars')}</button>
      <button class="mgu-btn" data-a="ok" data-enter>${T_('Подать так','Serve as is')}${KC('Enter')}</button></div>`;
    bowl(card.querySelector('.mgu-bowl'));const ss=card.querySelectorAll('.mgu-stars svg');ss.forEach((x,i)=>setTimeout(()=>{x.classList.add('on');if(i<2)snd('coin');},260+i*280));
    card.querySelector('[data-a=ok]').onclick=()=>finish(sc,2,false);
    const ad=card.querySelector('[data-a=ad]');ad.onclick=()=>{if(ad.disabled)return;ad.disabled=true;Promise.resolve(host.ad('uha')).then(r=>{if(!r){ad.disabled=false;return;}if(resDone)return;
      u.ad=today();persist();say('p',T_('Щепотку соли да перчику — вот теперь знатная!','A pinch of salt and pepper — now it\'s superb!'),2400);
      ss[2].outerHTML=starSvg(true);const n=card.querySelectorAll('.mgu-stars svg')[2];n.classList.add('on');snd('record');card.querySelector('h2').textContent=HEAD[3];setTimeout(()=>finish(sc,3,true),1300);}).catch(()=>{ad.disabled=false;});};
    $q('.mgu-res').classList.add('on');}
  function finish(sc,tier,adUsed){if(resDone)return;resDone=true;const u=st(),price=tripPrice(trip),Rv=rVal(o),bonus=train?0:bonusOf(tier,price,Rv);let fresh=false;
    if(!train){u.n++;u.k++;u.ls=+(typeof S!=='undefined'&&S.sessions)||0;if(rec.inBook){fresh=!u.bk[rec.id];u.bk[rec.id]=Math.max(u.bk[rec.id]||0,tier);}if(trip)trip.uha=1;}
    if(sc>u.rec)u.rec=sc;u.t=Date.now();persist();
    const nBook=BOOK_IDS.filter(k=>u.bk[k]).length;let img='';try{const c=document.createElement('canvas');bowl(c);img=c.toDataURL('image/png');}catch(e){}
    const line=`<div class="mgu-rl">${img?`<img src="${img}" alt="">`:''}<div><b>${T_('Дед Митяй','Grandpa Mityai')}</b>${QUOTE[tier]}</div></div>`+
      (train?'':`<div class="mgu-rl2">${T_('Митяй платит','Mityai pays')} +${Math.round(BONUS[tier]*100)} % ${T_('к улову','to the catch')}: <b>+${bonus}</b>${coinH()}</div>`)+
      (rec.inBook&&!train?`<div class="mgu-rl2${fresh?' new':''}">${icon('book')} ${fresh?T_('Новый рецепт!','New recipe!')+' ':''}${rec.n} · ${nBook}/8</div>`:'');
    const give=n=>{n=Math.round(n);if(n<=0||train)return;try{if(typeof setCoins==='function')setCoins(S.coins+(typeof ern==='function'?ern('mg',n):n));else S.coins+=n;}catch(e){}
      try{if(trip&&trip.over&&typeof G!=='undefined'&&trip===G){trip.earned+=n;const rc=document.getElementById('rCoins');if(rc)rc.textContent='+'+coinsTxt(trip.earned);}}catch(e){}LAST.paid=n;};
    end({score:sc,tier,rec:sc>(+o.rec||0),title:HEAD[tier],scoreTxt:T_('Очки повара','Cook points')+': <b>'+sc+'</b>',
      extra:train?{line}:{line,val:bonus/Rv,give:()=>give(bonus),giveCapped:f=>give(bonus*f),recipe:rec.id,fresh,bonus,price,ad:adUsed}});}
  function bowl(c){const w=220,h=118,dp=2;c.width=w*dp;c.height=h*dp;const q=c.getContext('2d');q.scale(dp,dp);
    const gl=q.createRadialGradient(w/2,h*.5,4,w/2,h*.5,h*.5);gl.addColorStop(0,'rgba(255,190,90,.35)');gl.addColorStop(1,'rgba(255,190,90,0)');q.fillStyle=gl;q.fillRect(0,0,w,h);
    q.fillStyle=lg(q,40,0,180,0,'#a8713c','#5e3a1c');q.beginPath();q.moveTo(36,52);q.bezierCurveTo(44,118,176,118,184,52);q.closePath();q.fill();
    q.strokeStyle='rgba(255,220,170,.35)';q.lineWidth=2;q.beginPath();q.moveTo(50,70);q.bezierCurveTo(70,100,150,100,170,70);q.stroke();
    q.fillStyle='#c98f4f';ell(q,110,52,74,15);q.fill();q.fillStyle=lg(q,0,40,0,64,'#ffd77a','#e0a33a');ell(q,110,53,68,12);q.fill();
    q.save();ell(q,110,53,66,11);q.clip();const f=fishOf0(fishL[0]);if(f){q.save();q.translate(100,54);q.rotate(.15);q.globalAlpha=.9;try{drawFish(q,f.lk,0,0,46);}catch(e){}q.restore();}
    for(const [x,y,k] of [[70,50,'pot'],[142,52,'pot'],[128,48,'onion'],[84,56,'bay']]){q.save();q.globalAlpha=.95;drawIng(q,k,x,y,k==='bay'?18:16);q.restore();}
    q.fillStyle='#4f8f2a';for(let i=0;i<14;i++){q.beginPath();q.arc(56+i*8.5,47+((i*37)%9),1.5,0,7);q.fill();}q.restore();
    q.strokeStyle='rgba(255,255,255,.55)';q.lineWidth=3;q.lineCap='round';for(let i=0;i<3;i++){q.beginPath();q.moveTo(90+i*20,36);q.bezierCurveTo(82+i*20,24,98+i*20,16,90+i*20,4);q.stroke();}}
  function end(r){if(Z.fin)return;Z.fin=true;$q('.mgu-res').classList.remove('on');$q('.mgu-top').style.opacity='0';$q('.mgu-say').classList.remove('on');try{host.done(r);}catch(e){console.error(e);}} // сцена дальше горит под окном итогов оболочки

  /* кадр */
  function update(dt){Z.t+=dt;Z.pt+=dt;if(Z.sayT>0){Z.sayT-=dt;if(Z.sayT<=0)$q('.mgu-say').classList.remove('on');}
    Z.arm=Math.max(0,Z.arm-dt*1.6);Z.shake=Math.max(0,Z.shake-dt);
    for(const k of ['blinkP','blinkM','blinkC']){Z[k]-=dt;if(Z[k]<-3-Math.random()*3)Z[k]=.14;}
    if(Z.ph==='intro'){Z.h=Math.min(.55,Z.h+dt*.08);if(Z.pt>2.2){Z.ph='boil';Z.pt=0;tray();say('p',T_(STEPS[0].say[0],STEPS[0].say[1]),2400);}}
    else if(Z.ph==='boil'){const p=plan[Z.i];if(Z.lift>0){Z.lift-=dt;Z.h=Math.max(.3,Z.h-dt*.8);Z.foam=Math.max(0,Z.foam-dt);}
      else{Z.h+=rate(p,Z.t)*dt;if(Z.h>=HMAX){Z.lift=1.1;Z.foam=1.2;Z.missed++;snd('no');say('p',T_('Ох, убежала! Сейчас снова закипит — лови момент.','Whoa, it boiled over! It\'ll boil again — catch the moment.'),2400);
        hintTx(T_('Жди, пока кольцо снова дойдёт до зелёного','Wait for the ring to reach green again'));}}}
    else if(Z.ph==='fly'){const f=Z.fly;f.t+=dt;if(f.t>=f.dur)landIng();}
    else if(Z.ph==='judge'){Z.h=Math.min(Z.h+dt*.1,.6);if(Z.pt>1.05)nextStep();}
    else if(Z.ph==='final'){Z.h=Math.min(.7,Z.h+dt*.05);Z.mitT=Math.min(1,Z.pt/1.4);if(Z.pt>2.3)showRes();}
    else if(Z.ph==='res'){Z.mitT=Math.max(0,Z.mitT-dt);}
    // огонь: искры, дым, пар
    const sparkN=lowQ?.5:1;if(Math.random()<dt*9*sparkN)Z.parts.push({k:'spark',x:Z.fx+(Math.random()-.5)*Z.kr*.8,y:Z.fy-Z.kr*.3,vx:(Math.random()-.5)*Z.kr*.6,vy:-Z.kr*(1.2+Math.random()*1.6),l:.9+Math.random()*1.1,t:0});
    if(Math.random()<dt*(lowQ?2:3.5))Z.parts.push({k:'smoke',x:Z.fx+(Math.random()-.5)*Z.kr*.5,y:Z.fy-Z.kr*.7,vx:Z.kr*(.15+Math.random()*.25),vy:-Z.kr*(.45+Math.random()*.3),l:3.2+Math.random()*1.5,t:0,r:Z.kr*(.25+Math.random()*.15)});
    const stm=Math.max(0,(Z.h-.35))*(lowQ?3:6);if(Math.random()<dt*stm)Z.parts.push({k:'steam',x:Z.kx+(Math.random()-.5)*Z.kr*1.1,y:Z.ky-Z.kr*.45,vx:(Math.random()-.3)*Z.kr*.2,vy:-Z.kr*(.6+Math.random()*.5),l:1.6+Math.random(),t:0,r:Z.kr*(.18+Math.random()*.15)});
    for(const p of Z.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k==='drop')p.vy+=Z.kr*9*dt;if(p.k==='spark'){p.vx+=Math.sin(Z.t*5+p.y*.05)*Z.kr*dt;}}
    Z.parts=Z.parts.filter(p=>p.t<p.l);for(const p of Z.pops)p.t+=dt;Z.pops=Z.pops.filter(p=>p.t<1.3);
    if(Z.parts.length>220)Z.parts.splice(0,Z.parts.length-220);}
  function render(){const W=Z.W,H=Z.H,kr=Z.kr,t=Z.t;g.setTransform(Z.dp,0,0,Z.dp,0,0);g.clearRect(0,0,W,H);if(Z.bg)g.drawImage(Z.bg,0,0,W,H);
    const fk=.85+.12*Math.sin(t*9)+.07*Math.sin(t*23);
    // свет костра на земле и людях
    g.globalCompositeOperation='lighter';const gr=kr*(Z.land?6:5.2)*fk;g.globalAlpha=.85;g.drawImage(Z.glow,Z.fx-gr,Z.fy-gr*.75,gr*2,gr*1.5);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    // дым — за котелком
    for(const p of Z.parts)if(p.k==='smoke'){const k=p.t/p.l,r=p.r*(1.4+k*3);g.globalAlpha=.32*(1-k)*Math.min(1,p.t*2);g.drawImage(Z.smk,p.x-r,p.y-r,r*2,r*2);}g.globalAlpha=1;
    // Митяй (за костром, справа) и Петрович (слева на бревне)
    const mitTalk=Z.sayT>0&&Z.sayWho==='m'&&Math.sin(t*14)>0,petTalk=Z.sayT>0&&Z.sayWho==='p'&&Math.sin(t*14)>0;
    drawMit(g,Z.mx,Z.my,Z.ms,t,Z.ph==='final'||Z.ph==='res'?Math.min(1,Z.mitT*1.2):0,Z.blinkM>0,mitTalk);
    drawPetr(g,Z.px,Z.py,Z.s,t,Z.arm,Z.blinkP>0,petTalk);
    // огонь: поленья, языки, угли
    fire(g,Z.fx,Z.fy,kr,t,fk);
    // тренога — передняя нога, цепь
    g.strokeStyle='#3d2817';g.lineWidth=kr*.1;g.lineCap='round';g.beginPath();g.moveTo(Z.kx,Z.top);g.lineTo(Z.kx-kr*.35,Z.fy+kr*.6);g.stroke();
    g.strokeStyle='rgba(255,180,100,.3)';g.lineWidth=kr*.03;g.beginPath();g.moveTo(Z.kx+kr*.03,Z.top+kr*.3);g.lineTo(Z.kx-kr*.3,Z.fy+kr*.5);g.stroke();
    g.strokeStyle='#5a3a22';g.lineWidth=kr*.08;g.beginPath();g.moveTo(Z.kx-kr*.25,Z.top-kr*.1);g.lineTo(Z.kx+kr*.25,Z.top+kr*.1);g.stroke();
    const lift=Z.lift>0?Math.sin(Math.min(1,(1.1-Z.lift)/1.1)*Math.PI)*kr*.35:0,sw=Math.sin(t*1.3)*kr*.02,ky=Z.ky-lift;
    g.strokeStyle='#2c2c2e';g.lineWidth=Math.max(1.5,kr*.035);g.setLineDash([kr*.07,kr*.04]);g.beginPath();g.moveTo(Z.kx,Z.top);g.lineTo(Z.kx+sw,ky-kr*1.05);g.stroke();g.setLineDash([]);
    pot(g,Z.kx+sw,ky,kr,t);
    // кольцо кипения
    if(Z.ph==='boil'||Z.ph==='fly'||Z.ph==='judge')ringDraw(g,Z.kx,Z.ky,kr*1.62,t);
    // пар
    for(const p of Z.parts)if(p.k==='steam'){const k=p.t/p.l,r=p.r*(1.3+k*2);g.globalAlpha=.42*(1-k)*Math.min(1,p.t*4);g.drawImage(Z.stm,p.x-r,p.y-r,r*2,r*2);}g.globalAlpha=1;
    // искры и брызги
    for(const p of Z.parts){if(p.k==='spark'){const k=p.t/p.l;g.fillStyle='rgba(255,'+Math.round(200-120*k)+',80,'+(1-k)+')';g.fillRect(p.x,p.y,kr*.04,kr*.04);}
      else if(p.k==='drop'){const k=p.t/p.l;g.fillStyle='rgba(255,226,150,'+(1-k)+')';g.beginPath();g.arc(p.x,p.y,kr*.045,0,7);g.fill();}}
    // летящий продукт
    if(Z.fly){const f=Z.fly,k=f.t/f.dur,x=f.x0+(Z.kx-f.x0)*k,y=f.y0+(Z.ky-kr*.3-f.y0)*k-Math.sin(k*Math.PI)*kr*1.6;g.save();g.translate(x,y);g.rotate(k*5);for(let i=0;i<f.n;i++)drawIng(g,f.k,i*kr*.15-kr*.15*(f.n-1)/2,i*kr*.08,kr*(f.k==='fish'?1.05:.62),fishL[i%fishL.length]);g.restore();}
    // кот Васька — передний план
    drawCat(g,Z.cx0,Z.cy0,Z.cs,t,Z.blinkC>0);
    // всплывающие оценки
    for(const p of Z.pops){const k=p.t/1.3,a=k<.15?k/.15:1-Math.max(0,(k-.6)/.4),sz=(p.big?kr*.42:kr*.34)*(k<.15?.6+k/.15*.4:1);
      g.save();g.globalAlpha=a;g.font='600 '+Math.round(Math.max(18,sz))+'px '+(getComputedStyle(root).getPropertyValue('--font')||'sans-serif');g.textAlign='center';g.lineJoin='round';
      g.lineWidth=Math.max(4,sz*.22);g.strokeStyle='rgba(20,14,8,.75)';g.strokeText(p.tx,p.x,p.y-k*kr*.7);g.fillStyle=p.c;g.fillText(p.tx,p.x,p.y-k*kr*.7);g.restore();}
    // лёгкое затемнение краёв — «вечер»
    if(Z.vig)g.drawImage(Z.vig,0,0,W,H);}
  function fire(g,x,y,kr,t,fk){
    // поленья
    for(const [a,c] of [[.32,'#5a3a20'],[-.32,'#4a2e18'],[.05,'#6a4626']]){g.save();g.translate(x,y+kr*.05);g.rotate(a);g.fillStyle=c;rr0(g,-kr*.95,-kr*.11,kr*1.9,kr*.22,kr*.1);g.fill();
      g.fillStyle='#c4925a';ell(g,kr*.95,0,kr*.07,kr*.11);g.fill();g.fillStyle='rgba(255,120,40,.5)';rr0(g,-kr*.4,-kr*.11,kr*.8,kr*.06,kr*.03);g.fill();g.restore();}
    // угли
    g.fillStyle='rgba(255,90,30,.9)';for(let i=0;i<7;i++){const a=i*1.7;ell(g,x+Math.cos(a)*kr*.45,y+Math.sin(a)*kr*.06,kr*.09,kr*.05);g.fill();}
    // языки пламени
    const heat=.75+Math.min(.5,Z.h*.45);
    for(const [col,sz,ph] of [['rgba(255,95,25,.95)',1,0],['rgba(255,170,50,.95)',.72,1.3],['rgba(255,236,160,.95)',.42,2.1]]){
      g.fillStyle=col;g.beginPath();g.moveTo(x-kr*.75*sz,y);
      const n=5;for(let i=0;i<n;i++){const xx=x-kr*.75*sz+kr*1.5*sz*(i+.5)/n,hh=kr*(1.1+.5*Math.sin(t*(7+i)+ph+i*2))*sz*heat*fk*(i===2?1.3:1),sw=Math.sin(t*5+i+ph)*kr*.12;
        g.quadraticCurveTo(xx-kr*.18*sz,y-hh*.45,xx+sw,y-hh);g.quadraticCurveTo(xx+kr*.18*sz,y-hh*.45,x-kr*.75*sz+kr*1.5*sz*(i+1)/n,y-kr*.05);}
      g.lineTo(x+kr*.75*sz,y);g.closePath();g.fill();}}
  function pot(g,x,y,kr,t){const rw=kr,rh=kr*.3;
    // дужка
    g.strokeStyle='#26272a';g.lineWidth=Math.max(1.5,kr*.045);g.beginPath();g.moveTo(x-rw*.95,y-rh*.2);g.quadraticCurveTo(x,y-kr*1.45,x+rw*.95,y-rh*.2);g.stroke();
    // тело: чёрный чугун с отсветом костра снизу
    const bg=g.createLinearGradient(x-rw,0,x+rw,0);bg.addColorStop(0,'#1c1d20');bg.addColorStop(.35,'#3a3c42');bg.addColorStop(.6,'#2a2b2f');bg.addColorStop(1,'#141517');
    g.fillStyle=bg;g.beginPath();g.moveTo(x-rw,y);g.bezierCurveTo(x-rw*1.05,y+kr*.9,x+rw*1.05,y+kr*.9,x+rw,y);g.closePath();g.fill();
    const fl=g.createLinearGradient(0,y+kr*.2,0,y+kr*.75);fl.addColorStop(0,'rgba(255,120,40,0)');fl.addColorStop(1,'rgba(255,130,50,'+(.35+.1*Math.sin(t*9))+')');g.fillStyle=fl;g.fill();
    g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=kr*.05;g.beginPath();g.moveTo(x-rw*.7,y+kr*.12);g.quadraticCurveTo(x-rw*.62,y+kr*.5,x-rw*.35,y+kr*.62);g.stroke();
    // ободок
    g.fillStyle='#3e4046';ell(g,x,y,rw*1.04,rh*1.08);g.fill();g.fillStyle='#17181a';ell(g,x,y,rw*.94,rh*.88);g.fill();
    // бульон: светлеет и золотится с каждым продуктом
    const gold=Math.min(1,Z.inPot.length/6),bc=lg(g,0,y-rh,0,y+rh,mix('#b7a06a','#ffcc5e',gold),mix('#8a7442','#d8962c',gold));
    g.save();ell(g,x,y+rh*.05,rw*.9,rh*.82);g.clip();g.fillStyle=bc;g.fillRect(x-rw,y-rh,rw*2,rh*2);
    // продукты в котелке, покачиваются
    for(const it of Z.inPot){const a=it.a+t*.25,px=x+Math.cos(a)*rw*it.r*.75,py=y+Math.sin(a)*rh*it.r*.6+rh*.08;g.save();g.translate(px,py);g.scale(1,.55);g.rotate(it.rot+Math.sin(t+it.a)*.2);
      drawIng(g,it.k,0,0,kr*(it.k==='fish'?.75:it.k==='dill'?.5:.44),it.fl);g.restore();}
    // пузыри: больше и чаще ближе к кипению
    const n=Math.round(Math.max(0,(Z.h-.3))*26);for(let i=0;i<n;i++){const ph=(t*(1.2+i%5*.3)+i*.37)%1,a=i*2.4,rr1=(.25+((i*53)%60)/80);const bx=x+Math.cos(a)*rw*rr1*.8,by=y+Math.sin(a)*rh*rr1*.7;
      g.strokeStyle='rgba(255,250,225,'+(.75*(1-ph))+')';g.lineWidth=Math.max(1,kr*.018);g.beginPath();g.ellipse(bx,by,kr*(.03+ph*.07),kr*(.015+ph*.035),0,0,7);g.stroke();}
    // пена, если убежала
    if(Z.foam>0){g.fillStyle='rgba(255,250,235,'+Math.min(.9,Z.foam)+')';for(let i=0;i<12;i++){const a=i/12*6.28;ell(g,x+Math.cos(a)*rw*.7,y+Math.sin(a)*rh*.6,kr*.14,kr*.07);g.fill();}}
    g.restore();
    if(Z.foam>0){g.fillStyle='rgba(255,250,235,'+Math.min(.85,Z.foam)+')';for(let i=0;i<5;i++){const xx=x-rw*.8+i*rw*.4;g.beginPath();g.ellipse(xx,y+kr*.12+Math.sin(i)*kr*.05,kr*.1,kr*.18*(1.2-Z.foam*.3),0,0,7);g.fill();}}
    g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=Math.max(1,kr*.025);ell(g,x,y,rw*1.03,rh*1.06);g.stroke();}
  function mix(a,b,k){const A=hx0(a),B=hx0(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')';}
  function hx0(c){c=c.replace('#','');return [0,2,4].map(i=>parseInt(c.slice(i,i+2),16));}
  function ringDraw(g,x,y,r,t){const p=plan[Z.i];if(!p)return;const A0=Math.PI*.62,SP=Math.PI*1.76,ang=h=>A0+Math.min(1,h/HMAX)*SP,lw=Math.max(10,Z.kr*.17);
    g.save();g.lineCap='round';
    g.strokeStyle='rgba(10,16,24,.45)';g.lineWidth=lw+6;g.beginPath();g.arc(x,y,r,A0,A0+SP);g.stroke();
    g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=lw;g.beginPath();g.arc(x,y,r,A0,A0+SP);g.stroke();
    g.lineCap='butt';const y0=p.gc-p.gh-p.yw,g0=p.gc-p.gh,g1=p.gc+p.gh;
    g.strokeStyle='rgba(255,211,107,.55)';g.beginPath();g.arc(x,y,r,ang(y0),ang(g0));g.stroke();
    const inG=Z.h>=g0&&Z.h<=g1&&Z.ph==='boil';g.strokeStyle=inG?'#7cf5bd':'rgba(107,227,176,.75)';if(inG){g.shadowColor='rgba(107,227,176,.9)';g.shadowBlur=lowQ?0:16;}
    g.lineWidth=inG?lw*1.25:lw;g.beginPath();g.arc(x,y,r,ang(g0),ang(g1));g.stroke();g.shadowBlur=0;g.lineWidth=lw;
    g.strokeStyle='rgba(255,123,107,.55)';g.beginPath();g.arc(x,y,r,ang(g1),A0+SP);g.stroke();
    // заполнение
    g.lineCap='round';const a=ang(Math.max(.001,Z.h));g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=lw*.34;g.beginPath();g.arc(x,y,r,A0,a);g.stroke();
    const mx=x+Math.cos(a)*r,my=y+Math.sin(a)*r;g.fillStyle=Z.h<y0?'#ffffff':Z.h<g0?'#ffd36b':Z.h<=g1?'#6be3b0':'#ff7b6b';g.beginPath();g.arc(mx,my,lw*.72,0,7);g.fill();
    g.strokeStyle='rgba(20,30,40,.8)';g.lineWidth=2;g.stroke();
    g.restore();}

  function frame(now){if(Z.over)return;if(!root.isConnected){Z.over=true;removeEventListener('resize',onRes);return;}Z.raf=requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(now-(Z.last||now))/1000));Z.last=now;
    if(document.hidden)return;
    if(host.paused&&!Z.fin){try{render();}catch(e){}return;} // RB:MGPC пауза: кипение и реплики стоят (под окном итогов оболочки сцена горит дальше)
    update(dt);try{render();}catch(e){console.error(e);Z.over=true;}}
  let rT=0;function onRes(){clearTimeout(rT);rT=setTimeout(()=>{if(!Z.over)geo();},120);}
  addEventListener('resize',onRes);
  geo();say('p',train?T_('Тренировка: варим для себя, без наград.','Practice: cooking for ourselves, no rewards.'):T_('Митяй, сейчас такую уху сварим — пальчики оближешь!','Mityai, we\'ll cook a soup you\'ll love!'),2400);
  $q('.mgu-tray b').textContent=rec.n;hintTx(T_('Костёр разгорается…','The fire is getting going…'));{const ic=$q('.mgu-tray .ic');ic.appendChild(ingCanvas('fish',fishL[0],60));}
  Z.raf=requestAnimationFrame(frame);
  // для проверок и снимков
  return W_.__mgUha={Z,step:(n,dt)=>{for(let i=0;i<n;i++)update(dt||.05);render();},tap:()=>onDown({preventDefault(){},target:cv}),setH:h=>{Z.h=h;},end:()=>end({score:0,tier:0,rec:false})};}

/* ---------------- регистрация ---------------- */
const LAST={g:null,paid:0}; // поездка, после которой предложена уха (итоги рыбалки)
function standTrip(){let pi=2;try{const q=new URLSearchParams(location.search);if(q.get('p')!=null)pi=Math.max(0,Math.min(PLACES.length-1,+q.get('p')));else pi=Math.max(2,topPlace());}catch(e){}
  const P=PLACES[pi]||PLACES[0];return {pi,catch:P.fish.slice(0,4).map((id,i)=>({id,w:.4+i*.35,c:12+i*6}))};}
const POT_IC='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 12c-2-3 2-5 0-8M24 12c-2-3 2-5 0-8M31 12c-2-3 2-5 0-8" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".75"/><path d="M8 20c2 12 6 18 16 18s14-6 16-18z" fill="#2c2e33"/><ellipse cx="24" cy="20" rx="16" ry="4.5" fill="#ffc95e"/><path d="M8 20c0-3 32-3 32 0" stroke="#4a4d55" stroke-width="2" fill="none"/><path d="M14 40l-3 5M34 40l3 5" stroke="#6a4626" stroke-width="3" stroke-linecap="round"/><path d="M15 44c3-5 6-3 9-8 3 5 6 3 9 8z" fill="#ff8a2a"/><path d="M19 44c2-3 3-2 5-5 2 3 3 2 5 5z" fill="#ffe08a"/></svg>';
const REG={id:ID,n:{ru:'Уха у костра',en:'Campfire fish soup'},icon:POT_IC,kind:'event',run,
  open:isOpen,ready:()=>LAST.g?!LAST.g.uha&&canOffer(LAST.g):/[?&]mg=uha(&|$)/.test(location.search)&&st().k<3, // на стенде ?mg=uha — поездка-образец
  fix:fixU,merge:mergeU,
  can:canOffer,bonus:bonusOf,recipe:recipeOf,book:()=>{const u=st();return BOOK_IDS.map(k=>({id:k,n:T_(RECIPES[k][0],RECIPES[k][1]),st:u.bk[k]||0}));},
  plan:stepPlan,judge,tierOf,sim:bot};
W_.MGB_UHA=REG;
W_.MGB_ART={drawPetr,drawMit,drawCat,drawIng,lg,ell,mkRng,starSvg,icon,coinH,avH,snd,vib,T_}; // общие рисунки потока MGB (Прикормка берёт отсюда)
if(typeof W_.MG_REG==='function')W_.MG_REG(REG);

/* плашка в итогах рыбалки — через гнездо UX resultSlots (вместо второй плашки; одна просьба: ×2 за ролик тут не просим — решает UX) */
function mgOn(){return !!(W_.MG&&MG.play&&MG.reg&&MG.reg[ID]);}
function slotOk(g){if(!mgOn()||!canOffer(g)||g.uha)return false;LAST.g=g;try{return MG.leftToday(ID)>0;}catch(e){return true;}}
if(typeof resultSlots!=='undefined'&&Array.isArray(resultSlots))resultSlots.push({id:'uha',
  when:ctx=>slotOk(ctx&&ctx.g),
  html:ctx=>{css();return `<div class="mgu-slot"><span class="si">${POT_IC}</span><span class="st"><b>${T_('Сварить уху Митяю','Cook soup for Mityai')}</b><small>${T_('+10–30 % к улову','+10–30 % to the catch')}</small></span><button class="btn accent noenter" type="button">${T_('Варить','Cook')}</button></div>`;},
  bind:(el,ctx)=>{const b=el.querySelector('button');if(!b)return;b.onclick=()=>{const g=ctx.g;LAST.g=g;LAST.paid=0;snd('tap');
    MG.play(ID,{noBack:true,cb:()=>{if(!g.uha)return;el.innerHTML=`<div class="mgu-slot"><span class="si">${POT_IC}</span><span class="st"><b>${T_('Уха сварена!','Soup is ready!')}</b><small>${LAST.paid?T_('Митяй заплатил ','Mityai paid ')+'+'+coinsTxt(LAST.paid):T_('Митяй доволен','Mityai is happy')}</small></span></div>`;}});};}});
})();
