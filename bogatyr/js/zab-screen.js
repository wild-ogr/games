'use strict';
/* ================= «🎪 Забавы» — экран, вход и ротация (js/zab-screen.js, BG0, 08.10.2026) =================
   Ядро и договор — js/zab-core.js. Здесь: плитка «Забавы» в «Меню двора» (meta-dvor: карточка #zabCard → плитка), строка «Забава дня» в «Делах на сегодня»,
   красная точка (плитка + «Деревня»), экран-окно «Забавы» (showModal kind 'zab') с ярмаркой на холсте; «Дела недели» Торжка — «сыграй в забаву недели 3 раза».
   Ротация: постоянные (Наковальня, Загадки, Клад, позже Травы) — 1 раз в день с наградой; «Забава недели» по кругу ZAB_WEEK; праздничные (Масленица, Святки);
   «Три сундука» — после каждого Логова; Печь — при «Достать» в печи подворья (zb0-pech.js). Тренировка — всегда, без наград. Открыто после 3-го похода.
   Своих ключей сейва нет (всё в S.zab ядра). */
(function(){
const FB={1:'i_mace',2:'pt_bayun',3:'tr_scroll',4:'kol',5:'p_apple',6:'sl_sila',7:'yarn',8:'pt_konek',9:'d_bush',10:'d_pond',11:'chest',12:'upyr',13:'pie',14:'egg'};
function icK(n){const g=zabG(n);if(g&&g.icon&&ART[g.icon])return g.icon;if(ART['zb_i'+n])return 'zb_i'+n;return FB[n]||'chest';}
function mon(){const D=new Date(dayMs());const d=(D.getDay()+6)%7;return 7-d;}               // дней до конца недели (вкл. сегодня)
/* что можно сыграть сейчас с наградой (без печи и сундуков) */
function readyList(){const a=[];if(!zabOpen())return a;const z=ZB();
  for(const n of ZAB_DAILY)if(zabAvail(n)&&!z.d.p[zabG(n).id])a.push(n);
  const w=zabWeekN();if(zabAvail(w)&&!z.d.p[zabG(w).id])a.push(w);
  for(const n in ZAB_FEST)if(zabAvail(+n)&&!z.d.p[zabG(+n).id])a.push(+n);
  return a;}
function chestsN(){return zabOpen()&&zabG(11)?ZB().lr.length:0;}
function anyReady(){return readyList().length>0||chestsN()>0;}
/* «забава дня» — та, что подсвечена: по кругу от номера дня среди готовых */
function dayPick(){const a=readyList();if(!a.length)return 0;const p=dayKey().split('-').map(Number),d=Math.floor(Date.UTC(p[0],p[1]-1,p[2])/864e5);return a[d%a.length];}
function status(){const r=readyList(),c=chestsN();if(c)return L('Сундуки старосты ждут: ','The elder’s chests are waiting: ')+c;
  if(r.length)return L('Готова: ','Ready: ')+zabNameN(dayPick())+(r.length>1?L(' и ещё '+(r.length-1),' and '+(r.length-1)+' more'):'');
  const b=zabBuf();if(b)return L('Сила на поход: ','Boost for your run: ')+zabBufTxt(b);
  return L('На сегодня всё сыграно — завтра новые!','All played for today — new ones tomorrow!');}

/* ---------- деревня: карточка (её прячет «Меню двора» в плитку) ---------- */
if(typeof DVOR_CARDS!=='undefined'&&!DVOR_CARDS.some(x=>x[0]==='zabCard')){const n=zabN('Забавы','Fun');DVOR_CARDS.push(['zabCard',n.ru,n.en]);}
function VIL(el){try{if(!el||!zabOpen()||!ZAB.list.length)return;const z=ZB(),nw=!z.in;
  const d=document.createElement('div');d.className='card'+(anyReady()||nw?' next':'');d.id='zabCard';
  d.innerHTML='<div class="row"><img class="ic" src="'+ic('zb_tent',96)+'"><div class="t"><b>'+L('🎪 Забавы','🎪 Fun & Games')+'</b><span>'+(nw?L('Новое! Ярмарка забав открыта','New! The fair is open'):status())+'</span></div><button class="btn gold" id="zabGo">'+L('Открыть','Open')+'</button></div>';
  const ids=['tmCard','wpnCard','petCard','slCard','troCard','yardCard'];let after=null;for(const id of ids){const c=el.querySelector('#'+id);if(c&&c.parentNode===el){after=c;break;}}
  if(after)el.insertBefore(d,after.nextSibling);else{const cv=el.querySelector('#village');if(cv&&cv.nextSibling)el.insertBefore(d,cv.nextSibling);else el.appendChild(d);}
  on('zabGo',()=>zabScreen());}catch(e){zabErr('vil',e);}}
/* «Дела на сегодня»: одна строка */
function TODAY(TL){try{if(!zabOpen()||!ZAB.list.length)return;const c=chestsN(),n=dayPick();
  if(c)TL.push({k:'zab',ic:'chest',t:L('Три сундука старосты','The elder’s three chests'),s:L('Логово взято — выбери награду','Lair taken — choose your reward'),ready:true,b:L('Выбрать','Choose'),always:1,fn:()=>{hideModal();zabScreen();}});
  else if(n)TL.push({k:'zab',ic:icK(n),t:L('Забава дня готова','Today’s game is ready'),s:zabNameN(n),ready:true,b:L('Играть','Play'),always:1,fn:()=>{hideModal();zabPlay(n);}});
  else TL.push({k:'zab',ic:'zb_tent',t:L('Забавы','Fun & Games'),s:status(),ready:false,b:L('Открыть','Open'),always:1,fn:()=>{hideModal();zabScreen();}});}catch(e){zabErr('today',e);}}
function CHIPS(a){try{if(!zabOpen()||!ZAB.list.length)return;if(chestsN())a.push('<i class="hot">🎪 '+L('сундуки','chests')+'</i>');else if(readyList().length)a.push('<i class="hot">🎪 '+L('забава','fun')+'</i>');}catch(e){}}
const MOD={id:'zabui',VIL,TODAY,CHIPS};
if(typeof META_MODS!=='undefined'){const i=META_MODS.findIndex(m=>m&&m.id==='dvor');if(i>=0)META_MODS.splice(i,0,MOD);else META_MODS.push(MOD);}
/* красная точка на «Деревне»: сундуки или новый экран */
/* ui.js грузится позже этого файла — обёртку ставим после загрузки */
setTimeout(function wrapVB(){if(typeof villageBadge!=='function'){setTimeout(wrapVB,200);return;}const vb0=villageBadge;villageBadge=function(){vb0.apply(this,arguments);try{if(!zabOpen()||!ZAB.list.length)return;const b=document.querySelector('nav button[data-tab="Village"]');
  if(b&&(chestsN()||!ZB().in))b.classList.add('dot');}catch(e){}};try{villageBadge();}catch(e){}},0);
/* «Дела недели» Торжка: сыграй в забаву недели 3 раза */
if(typeof TRO_WK!=='undefined'&&!TRO_WK.z)TRO_WK.z={n:3,ic:'zb_tent',get t(){return L('Сыграй в забаву недели','Play the game of the week');},on:()=>zabOpen()&&!!zabG(zabWeekN())};
window.zabWeekTick=function(g){try{if(g.kind!=='week'||typeof TR!=='function'||!TR()||typeof troWk!=='function')return;const w=troWk(TR());w.c.z=(w.c.z||0)+1;if(typeof trTouch==='function')trTouch();}catch(e){}};

/* ---------- запуск с экрана ---------- */
function zabPlay(n,train){const g=zabG(n);if(!g)return;const z=ZB();if(!train&&!zabAvail(n)){toast(L('Сейчас эта забава не идёт','This game isn’t on right now'));return;}
  if(!train&&z.d.p[g.id]){train=true;toast(L('Награда за сегодня уже взята — это тренировка','Today’s reward is taken — this is practice'));}
  hideModal();const mode=train?'train':g.kind==='week'?'week':g.kind==='fest'?'fest':'day';let ctx={};
  if(g.kind==='after'&&!train){const s=z.lr[0];ctx={slot:s,land:CAMP_S[s]&&CAMP_S[s].th};}
  ZAB_OPEN(g.id,{train,mode,ctx,back:()=>zabScreen()});}
window.zabPlay=zabPlay;

/* ---------- экран «Забавы» ---------- */
let scrT=0;
function rowHTML(n,o){o=o||{};const g=zabG(n),z=ZB(),i=ZAB_INFO[n];if(!i)return '';const has=!!g,av=has&&zabAvail(n),done=has&&!!z.d.p[g.id],best=has?z.b[g.id]|0:0;
  const st=!has?L('скоро на ярмарке','coming soon'):o.st||(done?L('✓ сегодня сыграно','✓ played today'):av?L('готова — награда ждёт','ready — a reward awaits'):o.off||L('не сегодня','not today'));
  const b=!has?'':(av&&!done&&!o.noPlay?'<button class="btn gold" data-zp="'+n+'">'+L('Играть','Play')+'</button>':'')+(o.noTrain?'':'<button class="btn ghost" data-zt="'+n+'">'+L('Тренировка','Practice')+'</button>');
  return '<div class="card zabRow'+(av&&!done&&!o.noPlay?' next':'')+(has?'':' off')+'"><div class="row"><img class="ic" src="'+ic(icK(n),96)+'"'+(has?'':' style="opacity:.5;filter:grayscale(.7)"')+'><div class="t"><b>'+zabNameN(n)+'</b><span>'+zabAbout(n)+'</span><span class="zabSt">'+st+(best?' · '+L('рекорд ','best ')+fmtNum(best):'')+'</span></div></div>'+
    (b?'<div class="btns zabBt">'+b+'</div>':'')+'</div>';}
const sec=t=>'<div class="zabSec">'+t+'</div>';
function screenHTML(){const z=ZB(),w=zabWeekN(),c=chestsN(),en=LANG==='en';let h='<h3>'+L('🎪 Забавы','🎪 Fun & Games')+'</h3><canvas id="zabC" class="zabScene"></canvas>';
  h+='<div class="card zabTip"><div class="row"><img class="ic" src="'+ic('zb_tent',96)+'"><div class="t"><span>'+
    L('Короткие забавы между походами. Каждая — раз в день с наградой (Слава, трофеи, сила на следующий поход), тренироваться можно сколько хочешь. Золота забавы не дают.','Short games between runs. Each gives a reward once a day (Fame, trophies, a boost for your next run); practise as much as you like. No gold here.')+'</span></div></div></div>';
  const b=zabBuf();if(b)h+='<div class="card zabBuf"><div class="row"><img class="ic" src="'+ic('sl_sila',96)+'"><div class="t"><b>'+L('Сила на следующий поход главы','Boost for your next chapter run')+'</b><span>'+zabBufTxt(b)+'</span><span class="zabSt">'+L('Не действует в сече, походе дня и испытании недели. Вместе с узелком — не больше +20 %.','Not in Endless Battle, Daily Run or Weekly Trial. With your bundle — no more than +20%.')+'</span></div></div></div>';
  if(c&&zabG(11)){h+=sec(L('🎁 Логово взято!','🎁 Lair taken!'))+rowHTML(11,{st:L('ждут сундуков: ','chests waiting: ')+c,noTrain:1});}
  h+=sec(L('Каждый день','Every day'));for(const n of ZAB_DAILY){if(en&&zabG(n)&&zabG(n).en===false)continue;if(en&&!zabG(n)&&ZAB_INFO[n].en===false)continue;h+=rowHTML(n,n===1?{off:L('откроется после первой ковки в кузнице','unlocks after your first upgrade at the forge')}:null);}
  h+=sec(L('Забава недели','Game of the week')+' <span class="zabSm">'+L('ещё '+mon()+' '+plu(mon(),'день','дня','дней','day','days'),mon()+' '+plu(mon(),'день','дня','дней','day','days')+' left')+'</span>')+rowHTML(w);
  const nx=ZAB_WEEK[(ZAB_WEEK.indexOf(w)+1)%ZAB_WEEK.length];h+='<p class="sub zabNext">'+L('Со следующего понедельника: ','From next Monday: ')+zabNameN(nx)+'</p>';
  h+=sec(L('Праздничные','Festive'));for(const n in ZAB_FEST){const k=ZAB_FEST[n],on=zabFestNow(+n),f6=zabFest6In(+n);
    const off=k==='masl'?L('на Масленицу','during Maslenitsa')+(f6>0?L(' и раз в 6 недель — через '+f6+' '+plu(f6,'неделю','недели','недель','week','weeks'),' and every 6 weeks — in '+f6+' '+plu(f6,'неделю','недели','недель','week','weeks')):''):L('на Святки (25.12–19.01)','at Yuletide (Dec 25 – Jan 19)');
    h+=rowHTML(+n,{off,st:on&&f6===0&&!zabFestOn(k)&&!z.d.p[(zabG(+n)||{}).id]?L('гость ярмарки на этой неделе — награда ждёт','this week’s guest game — a reward awaits'):'',noTrain:!on&&!(z.n[(zabG(+n)||{}).id])});}
  if(zabG(13))h+=sec(L('На подворье','On the homestead'))+rowHTML(13,{st:L('сыграешь, когда достаёшь блюдо из печи','play it when you take a dish out of the oven'),noPlay:1});
  if(!c&&zabG(11))h+='<p class="sub zabNext">'+L('🎁 Три сундука старосты — после победы в каждом Логове земли.','🎁 The elder’s three chests — after beating each land’s Lair.')+'</p>';
  h+='<div class="btns"><button class="btn big" id="zabBack">'+L('Назад','Back')+'</button></div>';return h;}
function zabScreen(){if(!zabOpen()&&!LOCAL){toast(L('Забавы откроются после 3-го похода','Fun & Games unlock after your 3rd run'));return;}
  const z=ZB();if(!z.in){z.in=1;zabTouch();save();try{villageBadge();}catch(e){}}
  STAT.screen('zab');zabCss2();const keep=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='zab'?$('mBody').scrollTop:0;
  showModal(screenHTML(),'zab');if(keep)$('mBody').scrollTop=keep;drawScene();
  on('zabBack',zabClose);
  for(const b of $('mBody').querySelectorAll('[data-zp]'))b.onclick=()=>{SND.click();zabPlay(+b.dataset.zp);};
  for(const b of $('mBody').querySelectorAll('[data-zt]'))b.onclick=()=>{SND.click();zabPlay(+b.dataset.zt,true);};
  clearInterval(scrT);let f=0;scrT=setInterval(()=>{if(!$('modal').classList.contains('on')||$('mBody').getAttribute('data-w')!=='zab'){clearInterval(scrT);scrT=0;return;}f++;drawScene(f);},120);}
function zabClose(){clearInterval(scrT);scrT=0;hideModal();if(typeof curTab!=='undefined'&&curTab==='Village'&&!G)try{renderVillage();}catch(e){}}
window.zabScreen=zabScreen;window.zabScreenRe=()=>{if(!G)zabScreen();};
/* ярмарка на холсте: небо, холмы, плетень, балаган с флажками, дуб с котом, печь, сундуки (рисунки art.js) */
function drawScene(f){const c=$('zabC');if(!c)return;const r=c.getBoundingClientRect(),W=r.width||320,H=r.height||180,d=Math.min(devicePixelRatio||1,2);
  if(c.width!==Math.round(W*d)||c.height!==Math.round(H*d)){c.width=Math.round(W*d);c.height=Math.round(H*d);}const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';
  const t=(f||0)*.12,calm=zabCalm(),k=Math.min(1.35,H/180);
  const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#5aa8f0');sk.addColorStop(.42,'#cfeaff');sk.addColorStop(.43,'#9ad26e');sk.addColorStop(1,'#5aa447');g.fillStyle=sk;g.fillRect(0,0,W,H);
  glow(g,W*.86,H*.13,30*k,'#fff2a8','#ffffff');
  g.fillStyle='rgba(255,255,255,.85)';for(const [x,y,s] of[[.18,.12,1],[.55,.08,.8]]){const cx=(W*x+(calm?0:t*6))%(W+80)-40;for(const [ox,oy,rr] of[[0,0,12],[13,3,9],[-12,4,8]]){g.beginPath();g.arc(cx+ox*s*k,H*y+oy*s*k,rr*s*k,0,Math.PI*2);g.fill();}}
  g.fillStyle='#7cbf5a';g.beginPath();g.moveTo(0,H*.46);for(let x=0;x<=W;x+=W/8)g.quadraticCurveTo(x+W/16,H*(.36+.04*Math.sin(x)),x+W/8,H*.45);g.lineTo(W,H);g.lineTo(0,H);g.fill();
  for(let i=0;i<7;i++)metaArt(g,'d_pine',W*(.04+i*.16),H*.44,k*.55);
  for(let x=4;x<W;x+=13){rrect(g,x-3,H*.5,6,H*.13,2);g.fillStyle='#a8733d';g.fill();outline(g,'#a8733d',.8);}
  for(const yy of[H*.54,H*.6]){g.strokeStyle='#8a5a2e';g.lineWidth=2.2;g.beginPath();g.moveTo(0,yy);g.lineTo(W,yy);g.stroke();}
  // балаган
  const cx=W*.5,by=H*.86,tw=Math.min(W*.36,150*k),th=tw*.95;
  g.save();g.translate(cx,by);
  const st=8;for(let i=0;i<st;i++){const x0=-tw/2+i*tw/st,x1=x0+tw/st;g.beginPath();g.moveTo(x0,0);g.lineTo(x1,0);g.lineTo(x1,-th*.55);g.lineTo(x0,-th*.55);g.closePath();g.fillStyle=i%2?'#fff4dc':'#d8382e';g.fill();}
  g.strokeStyle='#6a2a14';g.lineWidth=1.6;g.strokeRect(-tw/2,-th*.55,tw,th*.55);
  g.beginPath();g.moveTo(-tw*.18,0);g.quadraticCurveTo(0,-th*.42,tw*.18,0);g.closePath();g.fillStyle='#3a1a10';g.fill();
  for(let i=0;i<st;i++){const a0=-tw/2+i*tw/st,a1=a0+tw/st;g.beginPath();g.moveTo(a0,-th*.55);g.lineTo(a1,-th*.55);g.lineTo(0,-th);g.closePath();g.fillStyle=i%2?'#ffe9a8':'#e8433a';g.fill();g.strokeStyle='#6a2a14';g.lineWidth=1;g.stroke();}
  for(let i=0;i<st;i++){const x0=-tw/2+i*tw/st;g.beginPath();g.arc(x0+tw/st/2,-th*.55,tw/st/2,0,Math.PI);g.fillStyle=i%2?'#d8382e':'#ffe9a8';g.fill();}
  ln(g,[0,-th,0,-th-16*k],'#6a4022',2);const fw=calm?0:Math.sin(t*3)*3;g.beginPath();g.moveTo(0,-th-16*k);g.quadraticCurveTo(10*k,-th-14*k+fw,18*k,-th-12*k);g.lineTo(0,-th-8*k);g.closePath();g.fillStyle='#ffd23a';g.fill();g.strokeStyle='#8a5a10';g.lineWidth=1;g.stroke();
  g.restore();
  // флажки
  const fl=['#e8433a','#ffd23a','#3a8ad8','#4aa84a','#ffffff'];for(const side of[-1,1]){const x0=cx,y0=by-th*.98,x1=side<0?6:W-6,y1=H*.3;g.strokeStyle='#6a4022';g.lineWidth=1.2;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2,y0+22*k,x1,y1);g.stroke();
    for(let i=1;i<9;i++){const u=i/9,x=(1-u)*(1-u)*x0+2*(1-u)*u*(x0+x1)/2+u*u*x1,y=(1-u)*(1-u)*y0+2*(1-u)*u*(y0+22*k)+u*u*y1,sw=calm?0:Math.sin(t*2+i)*1.5;
      g.beginPath();g.moveTo(x-4*k,y);g.lineTo(x+4*k,y);g.lineTo(x+sw,y+9*k);g.closePath();g.fillStyle=fl[i%fl.length];g.fill();g.strokeStyle='rgba(60,30,10,.5)';g.lineWidth=.6;g.stroke();}}
  // дуб с котом слева, печь и сундуки справа
  metaArt(g,'d_oak',W*.13,H*.74,k*1.5);metaArt(g,'pt_bayun',W*.13+(calm?0:Math.sin(t)*1.5),H*.6,k*.7);
  metaArt(g,'m_oven',W*.83,H*.8,k*.9);metaArt(g,'chest',W*.7,H*.92,k*.75);metaArt(g,'chest',W*.93,H*.94,k*.6);
  if(chestsN())glow(g,W*.7,H*.9,18*k,'#ffd84a');}
/* свой стиль экрана: в духе двора v23 (пергамент, рамка) — поверх look.css */
function zabCss2(){if($('zabCss2'))return;const s=document.createElement('style');s.id='zabCss2';s.textContent=
  '.zabScene{width:100%;height:180px;display:block;border-radius:12px;border:3px solid #6e431f;box-shadow:0 3px 0 rgba(60,30,10,.35);margin-bottom:6px}'+
  '.zabSec{font-weight:900;font-size:18px;margin:14px 4px 6px}.zabSm{font-size:13px;font-weight:700;opacity:.75}'+
  '.zabRow .t span.zabSt,.zabBuf .t span.zabSt{display:block;font-size:13px;font-weight:800;margin-top:3px;opacity:.85}'+
  '.zabRow.next{box-shadow:0 0 0 2px #e0a92e inset}.zabRow.off{opacity:.78}'+
  '.zabRow .btns.zabBt{flex-direction:row;gap:8px;margin-top:6px}.zabRow .btns.zabBt .btn{flex:1;min-height:44px}'+
  '.zabTip .t span{font-size:14px;line-height:1.35}.zabNext{margin:4px 6px 0;font-size:13.5px}'+
  '@media (min-height:760px){.zabScene{height:200px}}';document.head.appendChild(s);}
})();
