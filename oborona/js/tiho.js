'use strict';
/* ob2-TIHO «Тихие игры» Дозорной избы (буст_в2.0, журнал hobby-analytics/release-i/oborona-boost2/logs/TIHO.md). Грузится по требованию (OB2.need) из заглушки в index.html.
   Пять спокойных игр без таймера: 25 «Борть» (здесь же), 26 «Подменыш» (tiho-podm.js), 27 «Былина или небылица» (tiho-byl.js), 28 «Обоз» (tiho-oboz.js), 29 «Кости у костра» (tiho-kosti.js).
   Регистрация — обычный MG_REG оболочки избы (номера 25–29; 15–24 — ловкостные), игра грузится лениво при первом запуске: файл зовёт TIHO.def(id,{run,sim}).
   Флаги: tiho (всё), tiho-<id> (одна игра). Награда — одна партия с наградой в день (MG_RW ниже), дальше тренировка. Сейв: S.dzr.b/n[25..29] (оболочка), S.dzr.tb {d,h} — борть.
   Общий набор для игр: TIHO.css(), TIHO.who(k) — рисунок героя, TIHO.intro(host,{who,t,btn}) → обещание, TIHO.panel(host,html,кнопки) → обещание(k), TIHO.keys(host,fn). */
(function(){
if(typeof MG_REG!=='function')return;
const GAMES=[
  {id:'bort',num:25,unl:0,n:['Борть','The Hive Log'],a:['Повесь борть на дерево — завтра мёд. Низко — медведь, высоко — ветер.','Hang a hive log in a tree — honey tomorrow. Too low — bear, too high — wind.'],u:['ложек мёда','spoons of honey'],rw:{tr:[0,1,1,1],sl:[0,0,5,10]}},
  {id:'podm',num:26,unl:0,n:['Подменыш','The Changeling'],a:['Кикимора подменила пять вещей на заставе. Найди отличия — без спешки.','Kikimora swapped five things at the outpost. Spot the differences — no rush.'],u:['очков','points'],rw:{tr:[0,1,1,1],sl:[0,0,5,10]}},
  {id:'byl',num:27,unl:0,n:['Былина или небылица','Tale or Tall Tale'],a:['Дед Пахом рассказывает — правда по былинам или приврал?','Grandpa Pakhom tells a story — true to the epics or a fib?'],u:['верных из 5','right of 5'],rw:{tr:[0,1,1,1],sl:[0,5,10,15]}},
  {id:'oboz',num:28,unl:1,n:['Обоз','The Supply Cart'],a:['Уложи припасы в телегу — мешки, бочки, ядра. Без спешки.','Pack the supplies into the cart — sacks, barrels, cannonballs. No rush.'],u:['очков','points'],rw:{tr:[0,1,1,1],sl:[0,0,5,10]}},
  {id:'kosti',num:29,unl:2,n:['Кости у костра','Bones by the Fire'],a:['Домино у костра с Дедом Пахомом. Посиди, сыграй партию.','Dominoes by the campfire with Grandpa Pakhom. Sit down for a game.'],u:['очков','points'],rw:{tr:[0,1,1,1],sl:[0,5,10,15]}}];
const T={G:GAMES,by:{},run:{},sim:{},wait:{}};window.TIHO=T;
const off=id=>typeof OB2!=='undefined'&&(OB2.off('tiho')||OB2.off('tiho-'+id));
const L=(a)=>Lg(a[0],a[1]);
T.L=L;T.off=off;

/* ---------- значки (медальон избы + своя эмблема) ---------- */
const MED=typeof mgMed==='function'?mgMed:(g,c)=>{ell(g,0,0,19,19,'#e6b53a',{hl:.6,lw:1.4});ell(g,0,0,15.5,15.5,c,{hl:.35,lw:.9});};
function hive(g,x,y,s){rrect(g,x-s*.55,y-s,s*1.1,s*2,s*.45);g.fillStyle=grad(g,x,y,s*1.2,'#9a6a3a');g.fill();outline(g,'#9a6a3a',s*.08);
  for(const k of[-.45,.1,.6])ln(g,[x-s*.5,y+s*k,x+s*.5,y+s*k],'rgba(70,40,15,.55)',s*.07);ell(g,x,y-s*.15,s*.22,s*.26,'#2a1a10',{ol:false,flat:true});}
function bee(g,x,y,s,ph){ell(g,x-s*.25,y-s*.55,s*.42,s*.3,'rgba(230,245,255,.9)',{ol:false,flat:true,rot:-.5+Math.sin(ph||0)*.3});ell(g,x+s*.25,y-s*.55,s*.42,s*.3,'rgba(230,245,255,.9)',{ol:false,flat:true,rot:.5-Math.sin(ph||0)*.3});
  ell(g,x,y,s*.62,s*.46,'#f2b81e',{lw:s*.08});g.save();g.beginPath();g.ellipse(x,y,s*.62,s*.46,0,0,TAU);g.clip();for(const k of[-.2,.2])ln(g,[x+s*k,y-s*.5,x+s*k,y+s*.5],'#2a1a10',s*.16);g.restore();
  ell(g,x+s*.55,y-s*.05,s*.07,s*.07,'#1a1010',{ol:false,flat:true});}
const EMB={
  25:g=>{MED(g,'#5a8a3a');ln(g,[-3,-16,-3,14],'#6a4222',5);ln(g,[-3,-6,-12,-11],'#6a4222',2.2);hive(g,5,2,7.5);bee(g,-9,7,3.6,0);bee(g,11,-11,3,1);},
  26:g=>{MED(g,'#5a6a9a');for(const [x,c] of[[-6,'#fff4d8'],[6,'#e8f4ff']]){rrect(g,x-5.5,-9,11,16,1.5);g.fillStyle=c;g.fill();outline(g,'#c8a870',.6);ell(g,x,-1,2.4,2.4,x<0?'#e8433a':'#4aa04a',{lw:.4});}
    g.save();g.translate(4,6);g.rotate(-.6);ln(g,[0,4,0,11],'#6a4222',2.6);g.restore();ell(g,2,3,6,6,'rgba(200,230,255,.45)',{lw:1.4,olc:'#8a6a3a'});shine(g,0,1,1.8,1,.8);},
  27:g=>{MED(g,'#8a4a2a');shp(g,'#c8945a',{hl:.5},[-11,-10,11,12],()=>{g.moveTo(-10,10);g.quadraticCurveTo(-12,-4,-2,-10);g.quadraticCurveTo(10,-12,11,0);g.quadraticCurveTo(8,10,-10,10);});
    for(let i=0;i<4;i++)ln(g,[-6+i*3.4,-6+i*.6,-7+i*4,8],'#fff4c0',.6);ell(g,-2,2,2.6,2.6,'#3a2010',{lw:.4});
    g.fillStyle='#ffe066';g.font='900 11px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',9,-9);},
  28:g=>{MED(g,'#6a7a4a');rrect(g,-12,-4,22,8,1.5);g.fillStyle=grad(g,0,0,12,'#a8743e');g.fill();outline(g,'#a8743e',.6);
    ell(g,-6,-8,4.5,4,'#d8c08a',{lw:.5});rrect(g,0,-12,7,8,2);g.fillStyle=grad(g,3,-8,6,'#8a5a30');g.fill();outline(g,'#8a5a30',.5);ell(g,8,-6,2.6,2.6,'#3a3a44',{hl:.6,lw:.4});
    for(const x of[-7,6]){ell(g,x,7,5,5,'#7a4a22',{lw:.7});ell(g,x,7,1.4,1.4,'#e6b53a',{lw:.3});}ln(g,[10,0,15,-5],'#6a4222',1.4);},
  29:g=>{MED(g,'#2a2a44');glow(g,6,6,10,'#ffb43a');for(const [x,c] of[[2,'#ff8a2a'],[7,'#ffd04a'],[10,'#ff6a2a']])shp(g,c,{hl:.6,lw:.3},[x-3,-2,x+3,10],()=>{g.moveTo(x,-2);g.quadraticCurveTo(x+3,4,x+2.4,9);g.lineTo(x-2.4,9);g.quadraticCurveTo(x-3,4,x,-2);});
    g.save();g.translate(-5,-1);g.rotate(-.3);rrect(g,-4.5,-9,9,18,2);g.fillStyle='#fffaf0';g.fill();outline(g,'#c8b890',.7);ln(g,[-4,0,4,0],'#5a4a3a',.7);
    for(const [x,y] of[[0,-4.5],[-2,3],[2,6.5]])ell(g,x,y,1.1,1.1,'#2a1a10',{ol:false,flat:true});g.restore();}};
for(const n in EMB)art('mg_i'+n,44,EMB[n]);

/* ---------- регистрация в оболочке избы ---------- */
for(const d of GAMES){T.by[d.id]=d;if(off(d.id))continue;
  MG_RW[d.num]=d.rw;MG_UNL[d.num]=[d.unl];
  MG_REG({id:d.id,num:d.num,n:{ru:d.n[0],en:d.n[1]},icon:'mg_i'+d.num,kind:'calm',unit:{ru:d.u[0],en:d.u[1]},
    run(host,o){const d0=host.done;host.done=r=>{T.lbl=r&&r.extra&&r.extra.lbl||null;d0(r);};const f=T.run[d.id];if(f)return f(host,o);const w=document.createElement('div');w.className='tqLoad';w.textContent=Lg('Готовим…','Getting ready…');host.el.appendChild(w);
      OB2.need('js/tiho-'+d.id+'.js').then(()=>{w.remove();if(MG.cur&&MG.cur.host===host&&T.run[d.id])T.run[d.id](host,o);}).catch(()=>{toast(Lg('Не загрузилось — проверь связь','Failed to load — check your connection'));host.quit();});},
    sim(o,k){const f=T.sim[d.id];return f?f(o,k):{score:0,tier:0};}});}
/* подпись под счётом из игры (extra.lbl): MG_FIN её не передаёт в окно итогов — подставляем сами, только для тихих игр */
if(typeof MG_FIN_UI==='function'){const fu=MG_FIN_UI;MG_FIN_UI=function(g,o,r,opt){if(g&&T.by[g.id]&&T.lbl&&r&&!(r.extra&&r.extra.lbl))r.extra=Object.assign({},r.extra||{},{lbl:T.lbl});T.lbl=null;return fu.apply(this,arguments);};}
T.def=function(id,o){T.run[id]=o.run;if(o.sim)T.sim[id]=o.sim;};

/* ---------- стиль ---------- */
T.css=function(){if($('tqCss'))return;const s=document.createElement('style');s.id='tqCss';s.textContent=
 '.tqLoad{position:absolute;top:45%;left:0;right:0;text-align:center;font:800 20px var(--f);color:#fff6dc}'+
 '.tqIn{display:flex;align-items:flex-end;gap:8px;margin:2px 0 8px}.tqIn img{width:84px;height:84px;flex:none;filter:drop-shadow(0 3px 5px rgba(0,0,0,.3))}'+
 '.tqB{position:relative;flex:1;background:var(--paper,#fffaf0);border:2.5px solid var(--wood,#9a6332);border-radius:18px;padding:10px 12px;font:700 17px/1.3 var(--f);color:var(--ink,#3b2412);box-shadow:0 4px 0 var(--lip,rgba(80,50,20,.35))}'+
 '.tqB:before{content:"";position:absolute;left:-12px;bottom:16px;border:8px solid transparent;border-right:12px solid var(--wood,#9a6332)}'+
 '.tqB small{display:block;font:800 13px var(--f);color:var(--ink2,#6a4a2a);margin-bottom:2px}.tqB b{color:var(--cGold,#a85c00)}'+
 '.tqKey{display:block;text-align:center;font:700 13px/1.3 var(--f);color:var(--ink2,#6a4a2a);margin:6px 0 0}'+
 '.tqBar{position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;gap:8px;justify-content:center;padding:8px 10px calc(var(--sb,0px) + 10px);pointer-events:none}'+
 '.tqBar .btn{pointer-events:auto;width:auto;min-width:150px;max-width:340px;flex:1;white-space:normal}'+
 '.tqTop{position:absolute;left:0;right:66px;top:calc(var(--st,0px) + 10px);z-index:5;padding:0 10px;font:800 16px/1.25 var(--f);color:#fff6dc;text-shadow:0 2px 0 rgba(40,20,8,.9),0 0 6px rgba(40,20,8,.7);pointer-events:none}'+
 '.tqTop b{font-size:20px;display:block}'+
 '.tqCard .t em{display:block;font:700 13px var(--f);color:var(--cOk,#2f7a1c);font-style:normal;margin-top:2px}.tqCard .t em.w{color:var(--ink2,#6a4a2a)}'+
 'body.mgCalm .tqB{animation:none!important}';document.head.appendChild(s);};
const WHO={pakhom:'tour_nb2',kik:'kik',bayun:'kot',yaga:'tetka',voev:'voevoda'};
const WHON={pakhom:['Дед Пахом','Grandpa Pakhom'],kik:['Кикимора','Kikimora'],bayun:['Кот Баюн','Bayun the Cat'],yaga:['Тётушка Яга','Auntie Yaga'],voev:['Воевода','Commander']};
T.who=k=>WHO[k]||k;T.whoN=k=>WHON[k]?L(WHON[k]):'';
/* окно поверх игры: html + кнопки [{k,t,cls}] → обещание с k нажатой кнопки (Enter — первая) */
T.panel=function(host,html,btns){T.css();return new Promise(res=>{const v=document.createElement('div');v.className='mgVeil tqVeil';
  v.innerHTML='<div class="panel">'+html+'<div class="btns">'+(btns||[{k:'ok',t:Lg('Начать','Start')}]).map((b,i)=>'<button class="btn'+(b.cls?' '+b.cls:i?' ghost':' big')+'" data-k="'+b.k+'">'+b.t+'</button>').join('')+'</div></div>';
  host.root.appendChild(v);host.hold=true;let done=false;
  const fin=k=>{if(done)return;done=true;window.removeEventListener('keydown',kd);v.remove();host.hold=false;res(k);};
  const kd=e=>{if(!MG.cur||MG.cur.host!==host||host.root.querySelectorAll('.mgVeil').length>1)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();const b=v.querySelector('[data-k]');if(b){try{SND.click();}catch(x){}fin(b.dataset.k);}}};
  window.addEventListener('keydown',kd);host.onQuit(()=>{done=true;window.removeEventListener('keydown',kd);});
  for(const b of v.querySelectorAll('[data-k]'))b.onclick=()=>{try{SND.click();}catch(x){}fin(b.dataset.k);};});};
/* вступление: портрет героя + слова; o.key — подсказка про клавиши (покажется на ПК) */
T.intro=function(host,o){const pc=mgPC();return T.panel(host,'<h3>'+(o.h||mgName(MG.cur&&MG.cur.g))+'</h3><div class="tqIn"><img src="'+ic(T.who(o.who||'pakhom'),168)+'" alt=""><div class="tqB"><small>'+T.whoN(o.who||'pakhom')+'</small>'+o.t+'</div></div>'+
  (pc&&o.key?'<span class="tqKey">'+o.key+'</span>':''),[{k:'go',t:o.btn||Lg('Начать','Start')}]);};
T.keys=function(host,fn){mgKeys(host,fn);};
T.top=function(host,html){let d=host.el.querySelector('.tqTop');if(!d){d=document.createElement('div');d.className='tqTop';host.el.appendChild(d);}d.innerHTML=html;return d;};
T.bar=function(host){let d=host.el.querySelector('.tqBar');if(!d){d=document.createElement('div');d.className='tqBar';host.el.appendChild(d);}return d;};
T.rnd=function(seed){return mulberry(seed>>>0);};
T.shuf=function(a,R){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;};
T.dayN=function(day){const p=String(day||dayKey()).split('-').map(Number);return Math.floor(Date.UTC(p[0],p[1]-1,p[2])/864e5);};

/* ---------- полка «Тихие игры» в избе (гнездо OB2 'izba') ---------- */
function mode(d){const z=DZ();return z.d.p[d.num]?'train':'daily';}
function state(d){const z=DZ();if(!mgOpenN(d.num))return {lock:1,t:mgLockTxt(d.num)};
  if(d.id==='bort'){const b=bortGet();if(!b)return {hot:1,t:Lg('Повесь борть — завтра мёд','Hang the hive log — honey tomorrow')};
    if(b.d<dayKey())return {hot:1,t:Lg('🍯 Мёд готов — собирай!','🍯 The honey is ready — collect it!')};return {w:1,t:Lg('Пчёлы трудятся — загляни завтра','The bees are busy — come back tomorrow')};}
  if(z.d.p[d.num])return {done:1,t:Lg('✓ Сегодня сыграно · дальше — на рекорд','✓ Played today · now for the record')+(z.b[d.num]?' ('+fmtNum(z.b[d.num])+')':'')};
  return {hot:1,t:Lg('Награда: трофей и Слава — раз в день','Reward: a trophy and Fame — once a day')};}
T.play=function(id,src){const d=T.by[id];if(!d||off(id))return;dzPlay(d.num,d.id==='bort'?'daily':mode(d),{},{from:'izba',src:src||'izba'});};
T.shelf=function(el){if(!el||!el.querySelector)return;const L0=GAMES.filter(d=>!off(d.id));if(!L0.length)return;T.css();
  const col=el.querySelector('.dzCol .dzA')||el.querySelector('.dzCol');if(!col||col.querySelector('.tqShelf'))return;
  let h='<h2>'+Lg('Тихие игры','Quiet games')+'</h2><p class="sub" style="text-align:left;margin:-2px 4px 6px">'+Lg('Без спешки и таймеров — посидеть с дозорными.','No rush, no timers — sit a while with the watch.')+'</p>';
  for(const d of L0){const s=state(d);h+='<div class="card tqCard" style="position:relative">'+(s.hot?'<i class="dzDot"></i>':'')+'<div class="row"><img class="dzIs" src="'+(s.lock?ic('mg_lock',112):ic('mg_i'+d.num,112))+'" alt=""><div class="t"><b>'+L(d.n)+'</b><span>'+L(d.a)+'</span>'+
    '<em class="'+(s.done||s.w||s.lock?'w':'')+'">'+s.t+'</em></div>'+(s.lock?'':'<button class="btn '+(s.done||s.w?'ghost':'gold')+'" data-tq="'+d.id+'">'+(s.done?Lg('Ещё','Again'):s.w?Lg('Глянуть','Look'):Lg('Играть','Play'))+'</button>')+'</div></div>';}
  const box=document.createElement('div');box.className='tqShelf';box.innerHTML=h;col.appendChild(box);
  for(const b of box.querySelectorAll('[data-tq]'))b.onclick=()=>T.play(b.dataset.tq);};

/* =====================================================================================================
   25 «Борть». Поставь сегодня — мёд завтра (как «Верша» Рыбалки). Шесть веток: выше — больше мёду, но
   медведь дотягивается до когтистых зарубок (1–3), а ветер (по знаку дня) раскачивает макушку (5–6 или тихо).
   Всё видно на дереве: зарубки на коре, флажок на макушке, слова Пахома. Итог решается в день, когда повесил
   (зерно дня), назавтра — сбор: ложки мёда, ступень — насколько близко к лучшему выбору. Ускорить за ролик нельзя.
   ===================================================================================================== */
function bortGet(){const z=DZ(),b=z.tb;if(!b||typeof b!=='object'||b.c||typeof b.d!=='string'||!(+b.h>=1&&+b.h<=6))return null;return {d:b.d,h:+b.h|0};}
function bortCond(day){const R=mulberry(mgSeed('bort',day)),bear=1+Math.floor(R()*3),wv=R(),wind=wv<.3?7:wv<.7?6:5,bonus=Math.floor(R()*5);return {bear,wind,bonus};}
function bortOut(day,h){const c=bortCond(day);let best=0;for(let k=6;k>=1;k--)if(k>c.bear&&k<c.wind){best=k;break;}
  let got,why;if(h<=c.bear){got=0;why='bear';}else if(h>=c.wind){got=Math.ceil(h/2);why='wind';}else{got=h;why='ok';}
  const tier=got<=0?0:got>=best?3:got>=best-1?2:1,score=got?got*10+c.bonus:0;return {got,why,best,tier,score,c};}
T.bortOut=bortOut;
const SAYB={
  bear:[['Медведь у борти побывал — вон, кора исцарапана. Ниже зарубок не вешай!','A bear has been here — see the scratched bark. Don’t hang it below the marks!']],
  w7:[['Нынче тихо, листок не шелохнётся. Можно и на самую макушку.','Calm today, not a leaf stirs. Even the very top will do.']],
  w6:[['Ветерок гуляет — макушку покачивает. Самую верхнюю ветку не бери.','A breeze is about — the top sways. Skip the very top branch.']],
  w5:[['К ночи ветрено будет — две верхние ветки ходуном ходят.','It’ll be windy tonight — the two top branches are swaying hard.']]};
const RES={
  bear:[['Мишка всё слизал. Оставил на коре записку: «Спосибо. Вкусна». Грамотей…','The bear licked it clean. Left a note on the bark: “Thanx. Yumy.” What a scholar…'],['Медведь добрался первым. Борть пустая, а на траве — довольный след лапой.','The bear got there first. Empty log, and a very satisfied paw print in the grass.']],
  wind:[['Ночью ветер борть раскачал — половину мёда расплескало. Белки довольны.','The wind rocked the log all night — half the honey spilled. The squirrels are delighted.']],
  ok:[['Пчёлы потрудились на славу! Мёд тягучий, как песня гусляра.','The bees did splendidly! Honey as slow and sweet as a gusli song.'],['Полна борть! Пахом облизывается: «Делиться будешь?»','A full log! Pakhom licks his lips: “Sharing, are we?”']]};
function bortRun(host,o){T.css();const cv=MGK.canvas(host),g=cv.getContext('2d'),day=dayKey(),calm=o.calm,pc=mgPC();
  let B=bortGet();const stage=!B?'place':B.d<day?'harvest':'wait';
  const st={sel:B?B.h:3,t:0,climb:-1,hang:B?B.h:0,combs:[],pot:0,P:[],ended:false,bees:[]};
  const cond=bortCond(stage==='harvest'?B.d:day),out=stage==='harvest'?bortOut(B.d,B.h):null;
  for(let i=0;i<7;i++)st.bees.push({a:Math.random()*6.28,r:14+Math.random()*16,s:1.5+Math.random()*1.5});
  function geo(){const W=cv.W,H=cv.H,wide=W>H*1.05,tx=wide?W*.42:W*.5,gy=H*(wide?.86:.8),top=H*(wide?.13:.15),lv=[];
    for(let k=1;k<=6;k++)lv.push(gy-(gy-top)*(.16+.155*(k-1)));return {W,H,wide,tx,gy,top,lv,s:Math.min(W/360,H/640)*(wide?1.15:1)};}
  function sway(k){const w=stage==='harvest'||stage==='wait'?cond.wind:cond.wind;const amp=w===7?.3:w===6?1:2.2;return calm?0:Math.sin(st.t*2.2+k*.6)*amp*Math.max(0,k-3)*1.6;}
  function draw(){const q=geo(),W=q.W,H=q.H,s=q.s;g.setTransform(cv.D,0,0,cv.D,0,0);g.lineJoin='round';g.lineCap='round';
    const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,stage==='wait'?'#3a4a7a':'#8ec8ee');sk.addColorStop(.7,stage==='wait'?'#8a7aa0':'#d8f0e0');g.fillStyle=sk;g.fillRect(0,0,W,H);
    // дальний лес
    for(let i=0;i<9;i++){const x=(i+.5)*W/8-20,h=H*(.28+.06*Math.sin(i*2.3));poly(g,[x-34*s,q.gy-H*.06,x,q.gy-h,x+34*s,q.gy-H*.06],stage==='wait'?'#3a5a4a':'#5a9a5a',{ol:false,flat:true});}
    g.fillStyle=stage==='wait'?'#3a6a3a':'#6ab04a';g.fillRect(0,q.gy-H*.07,W,H);g.fillStyle=stage==='wait'?'#2f5a2f':'#5aa03e';g.fillRect(0,q.gy,W,H);
    for(let i=0;i<24;i++){const x=(i*53)%W,y=q.gy+6+(i*37)%Math.max(10,H-q.gy-8);ln(g,[x,y,x-3,y-7],'#4a8a2e',2);ln(g,[x,y,x+3,y-8],'#4a8a2e',2);}
    if(stage==='wait'){g.fillStyle='#fff6c8';g.beginPath();g.arc(W*.82,H*.12,16*s,0,TAU);g.fill();g.fillStyle=sk;g.beginPath();g.arc(W*.82+7*s,H*.12-4*s,14*s,0,TAU);g.fill();}
    else{glow(g,W*.84,H*.1,40*s,'rgba(255,230,120,.8)');ell(g,W*.84,H*.1,15*s,15*s,'#ffe066',{ol:false});}
    // ствол
    const tw=26*s;shp(g,'#7a5a3a',{hl:.25,lw:2},[q.tx-tw,q.top,q.tx+tw,q.gy],()=>{g.moveTo(q.tx-tw*1.5,q.gy+4);g.quadraticCurveTo(q.tx-tw*.9,q.gy-30*s,q.tx-tw*.75,q.gy-60*s);g.lineTo(q.tx-tw*.35,q.top);g.lineTo(q.tx+tw*.35,q.top);g.lineTo(q.tx+tw*.75,q.gy-60*s);g.quadraticCurveTo(q.tx+tw*.9,q.gy-30*s,q.tx+tw*1.5,q.gy+4);g.closePath();});
    for(let i=0;i<10;i++){const y=q.gy-(q.gy-q.top)*(i/10)-8,x=q.tx+(i%2?-1:1)*tw*.25;ln(g,[x,y,x+(i%2?3:-3),y-14*s],'rgba(60,35,15,.45)',1.4);}
    // зарубки медведя
    for(let k=1;k<=cond.bear;k++){const y=q.lv[k-1]+10*s;for(let j=0;j<3;j++)ln(g,[q.tx-9*s+j*6*s,y-9*s,q.tx-12*s+j*6*s,y+7*s],'#f0d8b0',2.2*s);}
    // ветки
    for(let k=1;k<=6;k++){const y=q.lv[k-1],dir=k%2?1:-1,len=(78-k*6)*s,th=(9-k*1.1)*s,sw=sway(k),x0=q.tx+dir*tw*.4;
      const sel=stage==='place'&&st.sel===k;if(sel){g.fillStyle='rgba(255,230,120,.28)';g.fillRect(0,y-22*s,W,44*s);}
      ln(g,[x0,y,x0+dir*len*.5,y-6*s+sw*.4,x0+dir*len,y-14*s+sw],'#6a4a2a',th);ln(g,[x0+dir*len*.55,y-7*s+sw*.4,x0+dir*len*.75,y-26*s+sw],'#6a4a2a',th*.55);
      for(let j=0;j<4;j++){const lx=x0+dir*len*(.45+j*.17),ly=y-12*s+sw*(.5+j*.15)-j*4*s;ell(g,lx,ly,13*s,9*s,k>=cond.wind&&stage!=='harvest'?'#6aa83a':'#4a9a3a',{ol:false,hl:.3});}
      MGK.text(g,String(k),q.tx-dir*(tw*.9+12*s),y,15*s,{col:sel?'#ffe066':'#fff6dc'});}
    // флажок на макушке — сила ветра
    {const fx=q.tx,fy=q.top-4*s,amp=cond.wind===7?.08:cond.wind===6?.4:.9;ln(g,[fx,fy,fx,fy-30*s],'#5a3a1a',2*s);g.beginPath();g.moveTo(fx,fy-30*s);
      for(let i=1;i<=6;i++){const xx=fx+i*5*s,yy=fy-30*s+i*1.2*s*(1-amp)+Math.sin(st.t*7-i)*amp*3*s+(1-amp)*i*2*s;g.lineTo(xx,yy);}g.lineTo(fx+28*s,fy-20*s+(1-amp)*10*s);g.lineTo(fx,fy-20*s);g.closePath();g.fillStyle='#e8433a';g.fill();}
    // борть
    const bh=stage==='place'?(st.climb>=0?st.sel:0):B?B.h:0;
    if(bh){const k=bh,y=q.lv[k-1]+16*s,dir=k%2?1:-1,x=q.tx+dir*tw*.9,sw=sway(k)*.3,ang=stage==='harvest'&&out.why==='wind'?.35:0;
      const show=stage!=='place'||st.climb>=1;if(show){g.save();g.translate(x,y+sw);g.rotate(ang);ln(g,[0,-30*s,0,-16*s],'#4a3a2a',2.4*s);hive(g,0,6*s,21*s);g.restore();
        if(stage!=='harvest'||out.got>0)for(const b of st.bees){const a=b.a+st.t*b.s;bee(g,x+Math.cos(a)*b.r*1.6*s,y+Math.sin(a*1.3)*b.r*s,6*s,st.t*30);}}}
    // медведь (сбор: слизал) — довольный под деревом
    if(stage==='harvest'&&out.why==='bear')bear(g,q.tx+(q.wide?120:70)*s,q.gy-8*s,s);
    // соты на сборе
    for(const c of st.combs){if(c.got&&c.t>.6)continue;const k=c.got?Math.min(1,c.t/.6):0,x=c.x+(c.tx-c.x)*k,y=c.y+(c.ty-c.y)*k-Math.sin(k*3.14)*60*s;
      g.save();g.translate(x,y);g.scale(1-k*.5,1-k*.5);combD(g,0,0,15*s,st.t+c.ph);g.restore();}
    // горшок
    if(stage==='harvest'){const px=q.wide?W*.78:W*.82,py=q.gy-30*s;pot(g,px,py,26*s,st.pot);MGK.text(g,st.pot+'',px,py+6*s,18*s,{col:'#fff6dc'});}
    }
  function bear(g,x,y,s){ell(g,x,y,30*s,24*s,'#6a4226',{lw:2});ell(g,x,y-30*s,19*s,17*s,'#7a4a2a',{lw:2});for(const d of[-1,1])ell(g,x+d*13*s,y-44*s,6*s,6*s,'#6a4226',{lw:1.5});
    ell(g,x+2*s,y-24*s,9*s,7*s,'#c89a6a',{lw:1});ell(g,x+2*s,y-28*s,3*s,2.2*s,'#2a1a10',{ol:false,flat:true});for(const d of[-1,1])ln(g,[x+d*7*s-3*s,y-35*s,x+d*7*s+3*s,y-35*s],'#2a1a10',2*s);
    ell(g,x+10*s,y-18*s,4*s,3*s,'#e8607a',{ol:false,flat:true});ell(g,x-20*s,y-6*s,8*s,7*s,'#7a4a2a',{lw:1.5});ell(g,x-20*s,y-10*s,6*s,4*s,'#f2b81e',{ol:false,hl:.6});}
  function combD(g,x,y,r,t){g.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();g.fillStyle=grad(g,x,y,r,'#f2b81e',.5);g.fill();outline(g,'#c88a10',r*.12);shine(g,x-r*.3,y-r*.3,r*.25,r*.15,.7);}
  function pot(g,x,y,r,n){ell(g,x,y+r*.2,r,r*.9,'#b0602a',{lw:2});ell(g,x,y-r*.55,r*.7,r*.2,'#7a3a1a',{lw:1.5});if(n)ell(g,x,y-r*.55,r*.6,r*.15,'#f2b81e',{ol:false,flat:true});}
  // ---------- ход игры ----------
  const top=html=>T.top(host,html),bar=T.bar(host);
  function placeUI(){const q=geo();top('<b>'+Lg('Куда повесить борть?','Where to hang the log?')+'</b>'+Lg('Выбери ветку 1–6 касанием','Tap a branch 1–6')+(pc?Lg(' · ↑/↓ и Enter',' · ↑/↓ and Enter'):''));
    bar.innerHTML='<button class="btn big" id="tqHang">'+Lg('Повесить на ','Hang on branch ')+st.sel+Lg('-ю ветку','')+'</button>';$('tqHang').onclick=()=>{try{SND.click();}catch(e){}hang();};}
  function hang(){if(st.climb>=0)return;st.climb=0;bar.innerHTML='';try{SND.up();}catch(e){}
    const z=DZ();z.tb={d:day,h:st.sel};dzTouch();save();try{STAT.ev('mg',{a:'bort',h:st.sel,id:'bort'});}catch(e){}
    setTimeout(()=>{st.climb=1;const q=geo();MGK.burst(st.P,q.tx,q.lv[st.sel-1],{n:calm?0:12,col:'#f2b81e',sp:120});},calm?50:500);
    setTimeout(()=>{T.panel(host,'<h3>'+Lg('Борть висит!','The log is up!')+'</h3><div class="tqIn"><img src="'+ic('tour_nb2',168)+'" alt=""><div class="tqB"><small>'+T.whoN('pakhom')+'</small>'+
      Lg('Пчёлки разведают дупло и за ночь натаскают мёду. Заходи <b>завтра</b> — соберём!','The bees will settle in and carry honey all night. Come back <b>tomorrow</b> — we’ll collect it!')+'</div></div>',[{k:'ok',t:Lg('Приду завтра','See you tomorrow')}]).then(()=>host.quit());},calm?400:1500);}
  function harvestUI(){const q=geo(),k=B.h,y=q.lv[k-1]+16*s0(),dir=k%2?1:-1,x=q.tx+dir*26*s0()*.9;const t=RES[out.why][Math.floor(Math.random()*RES[out.why].length)];
    for(let i=0;i<out.got;i++){const a=-1.2+i*(2.4/Math.max(1,out.got-1||1));st.combs.push({x:x+dir*(40+Math.cos(a)*40)*s0(),y:y+Math.sin(a)*46*s0()+20*s0(),tx:q.wide?q.W*.78:q.W*.82,ty:q.gy-40*s0(),got:0,t:0,ph:i});}
    top('<b>'+Lg('Сбор мёда','Honey harvest')+'</b>'+L(t));
    if(!out.got){bar.innerHTML='<button class="btn big" id="tqOk">'+Lg('Эх… Повешу снова','Oh well… Hang it again')+'</button>';$('tqOk').onclick=()=>{try{SND.click();}catch(e){}finish();};return;}
    bar.innerHTML='<button class="btn big" id="tqAll">'+Lg('Собрать всё','Collect all')+'</button>';$('tqAll').onclick=()=>{try{SND.click();}catch(e){}for(const c of st.combs)grab(c);};}
  function s0(){return geo().s;}
  function grab(c){if(c.got)return;c.got=1;c.t=0;try{SND.coin?SND.coin():SND.click();}catch(e){}setTimeout(()=>{st.pot++;if(st.combs.every(x=>x.got)&&st.pot>=st.combs.length)setTimeout(finish,calm?150:500);},calm?60:600);}
  function finish(){if(st.ended)return;st.ended=true;bar.innerHTML='';const z=DZ();z.tb={d:B.d,h:B.h,c:1};dzTouch();save();
    host.done({score:out.score,tier:out.tier,extra:{lbl:Lg('ложек мёда','spoons of honey')+(out.why==='ok'?'':out.why==='bear'?Lg(' · медведь опередил',' · the bear got there first'):Lg(' · ветер расплескал',' · the wind spilled some'))}});}
  function tap(x,y){const q=geo();if(stage==='place'&&st.climb<0){let bi=-1,bd=1e9;for(let k=1;k<=6;k++){const d=Math.abs(y-q.lv[k-1]);if(d<bd){bd=d;bi=k;}}if(bi>0&&bd<40*q.s){if(st.sel===bi){hang();return;}st.sel=bi;try{SND.click();}catch(e){}placeUI();}}
    if(stage==='harvest')for(const c of st.combs){if(c.got)continue;const k=0;if(Math.hypot(x-c.x,y-c.y)<26*q.s){grab(c);break;}}}
  cv.addEventListener('pointerdown',e=>{if(host.paused)return;const r=cv.getBoundingClientRect();tap(e.clientX-r.left,e.clientY-r.top);});
  T.keys(host,k=>{if(stage==='place'&&st.climb<0){if(k==='ArrowUp'||k==='w'||k==='ц'){st.sel=Math.min(6,st.sel+1);placeUI();return true;}if(k==='ArrowDown'||k==='s'||k==='ы'){st.sel=Math.max(1,st.sel-1);placeUI();return true;}
      if(/^[1-6]$/.test(k)){st.sel=+k;placeUI();return true;}if(k==='Enter'||k===' '){hang();return true;}}
    if(stage==='harvest'&&(k==='Enter'||k===' ')){const b=$('tqAll')||$('tqOk');if(b){b.click();return true;}}return false;});
  MGK.loop(host,dt=>{st.t+=dt;for(const c of st.combs)if(c.got)c.t+=dt;draw();if(st.P.length)MGK.parts(g,st.P,dt);});
  if(stage==='place'){const sw=cond.wind===7?'w7':cond.wind===6?'w6':'w5';
    T.intro(host,{who:'pakhom',t:Lg('Повесим борть — дупло для диких пчёл. ','Let’s hang a hive log for the wild bees. ')+'<b>'+Lg('Выше — больше мёду','Higher — more honey')+'</b>'+Lg(', да не всё так просто. ',', but it’s not that simple. ')+L(SAYB.bear[0])+' '+L(SAYB[sw][0]),
      btn:Lg('Выбрать ветку','Pick a branch'),key:Lg('↑/↓ или 1–6 — ветка, Enter — повесить','↑/↓ or 1–6 — branch, Enter — hang')}).then(placeUI);}
  else if(stage==='wait'){top('<b>'+Lg('Мёд зреет','The honey is ripening')+'</b>'+Lg('Пчёлы трудятся. Загляни завтра — соберём мёд.','The bees are busy. Come back tomorrow to collect.'));
    bar.innerHTML='<button class="btn big" id="tqOk">'+Lg('Хорошо, завтра','Okay, tomorrow')+'</button>';$('tqOk').onclick=()=>{try{SND.click();}catch(e){}host.quit();};}
  else harvestUI();}
T.def('bort',{run:bortRun,sim(o,k){const day=o.day||'2026-10-'+String(1+(o.seed||1)%28).padStart(2,'0'),c=bortCond(day),R=mulberry((o.seed||1)>>>0);let h;
  if(R()<k){h=1;for(let j=6;j>=1;j--)if(j>c.bear&&j<c.wind){h=j;break;}}else h=1+Math.floor(R()*6);const r=bortOut(day,h);return {score:r.score,tier:r.tier};}});
})();
