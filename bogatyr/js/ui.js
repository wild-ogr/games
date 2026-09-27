'use strict';
/* ================= Меню и окна ================= */
let curTab='Village',mapSel=0,forgeSeg='hero';
function showModal(html){if(typeof PAY!=='undefined')PAY.re=null;$('mBody').innerHTML=html;$('modal').classList.add('on');}
// защита от случайного касания (аудит 14): окно посреди боя первые 0,35 с не принимает касаний (палец водил богатыря) + мягкое появление
function guardModal(){const m=$('mBody');m.classList.remove('guard');void m.offsetWidth;m.classList.add('guard');clearTimeout(guardModal.t);guardModal.t=setTimeout(()=>m.classList.remove('guard'),350);}
function hideModal(){$('modal').classList.remove('on');}
function on(id,fn){const el=$(id);if(el)el.onclick=e=>{SND.click();fn(e);};}
function setGold(){$('goldTxt').textContent=fmtNum(S.gold);}
function ic(key,px){return iconURL(key,px||96);}

/* ---------- вкладки ---------- */
function openTab(t){curTab=t;for(const s of document.querySelectorAll('.tab'))s.classList.toggle('on',s.id==='tab'+t);
  for(const b of document.querySelectorAll('nav button'))b.classList.toggle('on',b.dataset.tab===t);
  if(t==='Heroes'&&S.heroNew){S.heroNew=0;save();}({Village:renderVillage,Forge:renderForge,Map:renderMap,Heroes:renderHeroes,Quests:renderQuests})[t]();setGold();questBadge();}
// окна «награда за вход» при каждом возврате больше нет: всё ежедневное — в «Делах на сегодня» (раз за запуск и по кнопке на карте)
function toMenu(tab,after){G=null;rDirty=true;cloudApply();musicDuck(1);document.body.classList.remove('run');hideModal();tipHide();openTab(tab||curTab);musicPlay('menu');if(after)setTimeout(after,300);}

/* ---------- плашка обучения ---------- */
function tipShow(t,ev){const el=$('tip');if(!el)return;$('tipT').textContent=t;el.classList.toggle('ev',!!ev);el.classList.remove('on');void el.offsetWidth;el.classList.add('on');$('tipX').classList.toggle('on',!!(G&&G.tut));}
function tipHide(){const el=$('tip');if(el)el.classList.remove('on');$('tipX').classList.remove('on');}

/* ---------- настройки звука ---------- */
function volHTML(){const r=(id,lab,v)=>'<label class="vol"><span>'+lab+'</span><input type="range" min="0" max="100" step="5" id="'+id+'" value="'+Math.round(v*100)+'"><b id="'+id+'V">'+Math.round(v*100)+'%</b></label>';
  return '<div class="card" style="margin:10px 0 0">'+r('vM','🎵 Музыка',volM())+r('vS','🔔 Звуки',volS())+
    '<button class="btn ghost" id="vAll" style="width:100%;margin-top:6px">'+(S.sound?'🔊 Звук включён':'🔈 Звук выключен')+'</button></div>';}
function volBind(){const upd=(id,key)=>{const el=$(id);if(!el)return;el.oninput=()=>{S[key]=+el.value/100;$(id+'V').textContent=el.value+'%';ac();volApply();};el.onchange=()=>{save();if(key==='vs')SND.coin();};};
  upd('vM','vm');upd('vS','vs');on('vAll',()=>{S.sound=S.sound?0:1;save();ac();volApply();$('vAll').textContent=S.sound?'🔊 Звук включён':'🔈 Звук выключен';sndIcon();});}
// значок всегда ⚙️ (настройки), выключенный звук — маленький 🔇 в углу
function sndIcon(){const b=$('sndBtn');b.textContent='⚙️';b.classList.toggle('off',!S.sound);}
function openSettings(){showModal('<h3>Настройки</h3>'+volHTML()+
  '<div class="card" style="margin:10px 0 0"><button class="btn ghost" id="calmBtn" style="width:100%">'+(S.calm?'🌙 Спокойный режим: вкл':'🌙 Спокойный режим: выкл')+'</button><p class="sub" style="margin:6px 2px 0;text-align:left">Без тряски экрана, красных вспышек, мигания и замирания кадра при ударе.</p>'+
    (canVib()?'<button class="btn ghost" id="vibBtn" style="width:100%;margin-top:8px">'+(S.vib!==0?'📳 Вибрация: вкл':'📳 Вибрация: выкл')+'</button>':'')+
    '<button class="btn ghost" id="fxBtn" style="width:100%;margin-top:8px">✨ Эффекты: '+fxName()+'</button><p class="sub" style="margin:6px 2px 0;text-align:left">«Мало» — меньше искр и цифр, плавнее на слабом телефоне. «Авто» убавит само, если телефон не успевает.</p></div>'+
  '<div class="btns">'+(S.tut===-1?'<span class="tag ok" style="text-align:center;padding:10px">✓ Обучение покажется в следующем походе</span>':'<button class="btn ghost" id="tutAgain">Показать обучение снова</button>')+'<button class="btn ghost" id="credBtn">🎻 Благодарности</button><button class="btn big" id="setOk">Готово</button></div>');
  // покупки Яндекса (js/pay.js) — только в меню; нет платежей — раздела нет
  if(typeof payHere==='function'&&payHere()){const c=document.createElement('div');c.innerHTML=PAY.html()+'<button class="btn ghost" id="payRe" style="width:100%;margin-top:4px">↻ Восстановить покупки</button>';
    const b=$('mBody').querySelector('.btns');b.parentNode.insertBefore(c,b);PAY.bind(c);PAY.re=openSettings;on('payRe',()=>PAY.again());}
  volBind();on('setOk',hideModal);on('credBtn',openCredits);on('calmBtn',()=>{S.calm=S.calm?0:1;save();openSettings();});
  on('vibBtn',()=>{S.vib=S.vib===0?1:0;save();if(S.vib)vib(40,1);openSettings();});on('fxBtn',()=>{QL.mode=(QL.mode+1)%3;if(QL.mode===0)QL.auto=0;qSave();layout();openSettings();});on('tutAgain',()=>{S.tut=-1;save();toast('Обучение покажется в следующем походе');openSettings();});}

// эффекты: авто (0) → много (1) → мало (2); «авто» после медленных кадров показывает, что убавило
function fxName(){return QL.mode===1?'много':QL.mode===2?'мало':QL.auto?'авто (сейчас мало)':'авто';}

/* ---------- благодарности: музыка чужая, подпись авторов обязательна по лицензии ---------- */
const CREDITS=[
  {t:'Medieval: Market Day',w:'деревня и меню',a:'RandomMind',l:'CC0 1.0 (creativecommons.org/publicdomain/zero/1.0)',src:'OpenGameArt'},
  {t:'Zombies also love to play the fool',w:'поход (из альбома «In Russian Style»)',a:'Alexandr Zhelanov, soundcloud.com/alexandr-zhelanov',l:'CC-BY 3.0 (creativecommons.org/licenses/by/3.0)',src:'OpenGameArt'},
  {t:'Brave Soldiers',w:'бой с боссом',a:'Alexandr Zhelanov, soundcloud.com/alexandr-zhelanov',l:'CC-BY 3.0 (creativecommons.org/licenses/by/3.0)',src:'OpenGameArt'}];
// ссылок нет (правила площадок запрещают внешние ссылки) — только текст: автор, лицензия (адрес — текстом, не ссылкой), источник
function openCredits(){
  showModal('<h3>Благодарности</h3><p class="sub">Музыка, под которую богатырь бьёт нечисть. Спасибо авторам!</p>'+
    CREDITS.map(c=>'<div class="card" style="margin:8px 0;text-align:left;font-size:13px;line-height:1.45"><b style="font-size:15px">«'+c.t+'»</b> <span style="opacity:.7">— '+c.w+'</span><br>'+
      'Автор: '+c.a+'<br>Лицензия: '+c.l+'<br>Источник: '+c.src+'</div>').join('')+
    (PLAT==='vk'?'<div class="card" style="margin:8px 0;text-align:left;font-size:13px;line-height:1.45"><b style="font-size:15px">VK Bridge</b> <span style="opacity:.7">— связь с VK Играми</span><br>© V Kontakte LLC, лицензия MIT</div>':'')+
    '<div class="btns"><button class="btn big" id="credOk">Назад</button></div>');on('credOk',openSettings);}

/* ---------- «не хватает чуть-чуть» — подсказки рекламы за награду в момент нужды ---------- */
function giftAmt(){return ECO.gift[0]+ECO.gift[1]*Object.keys(S.done).length;}
function giftReady(){return !!S.runs&&nowMs()-(S.gift||0)>4*3600e3;}
function giftLeftH(){return Math.max(1,Math.ceil((4*3600e3-(nowMs()-(S.gift||0)))/3600e3));}
function boostLeft(){return S.village.mill?2-(S.afkBoost&&S.afkBoost.day===dayKey()?S.afkBoost.n:0):0;}
function takeGift(after){showRewarded(()=>{const a=giftAmt();S.gold+=a;S.gift=nowMs();save();SND.chest();toast('+'+fmtNum(a)+' золота!');setGold();if(after)after();});}
function takeBoost(after){showRewarded(()=>{const a=afkRate()*ECO.boostH;S.afkBoost={day:dayKey(),n:3-boostLeft()};S.gold+=a;save();SND.coin();toast('+'+fmtNum(a)+' золота');setGold();if(after)after();});}
// что можно купить: постройки, кузница, оружейная для оружия текущего богатыря
function upList(){if(!S.village.forge)return [{n:BLD[0].name,c:BLD[0].cost[0]}];const L=[];
  for(const b of BLD){const l=S.village[b.id]||0;if(l<b.cost.length)L.push({n:b.name,c:b.cost[l]});}
  for(const f of FORGE){const l=S.forge[f.id]||0;if(l<f.max)L.push({n:f.name+', ур. '+(l+1),c:forgeCost(l,f.id)});}
  const w=(HERO_BY[S.hero]||HEROES[0]).weapon,la=S.armory[w]||0;if(la<ARMORY_MAX)L.push({n:WEAPONS[w].name+', ур. '+(la+1),c:armoryCost(la)});
  return L;}
function cheapestIn(L,lo,hi){return L.filter(u=>u.c>lo&&u.c<=hi).sort((a,b)=>a.c-b.c)[0];}
// карточка «не хватает N» с подарком/казной за рекламу; list — что лежит на этом экране
function needCard(L,rerender){const g=S.gold,ga=giftReady()?giftAmt():0,ba=boostLeft()>0?afkRate()*ECO.boostH:0,best=Math.max(ga,ba);if(!best)return '';
  const u=cheapestIn(L,g,g+best);if(!u)return '';const byGift=ga&&u.c<=g+ga;
  needCard.fn=()=>(byGift?takeGift:takeBoost)(rerender);
  return '<div class="card gift"><img src="'+ic(byGift?'bird':'chest',60)+'" width="48" height="48"><div class="t" style="flex:1"><b>Не хватает '+fmtNum(u.c-g)+' на «'+u.n+'»</b><span style="display:block;font-size:12.5px;color:var(--mut)">'+(byGift?'Дар Жар-птицы':'Казна сразу, +'+ECO.boostH+' ч')+': +'+fmtNum(byGift?ga:ba)+' золота</span></div><button class="btn ad" id="needAd">🎬 За рекламу</button></div>';}

/* ---------- деревня ---------- */
const VPOS={home:[.5,.62,1.1],forge:[.16,.72,.9],altar:[.84,.74,.8],barn:[.33,.5,.95],tower:[.7,.45,.9],well:[.5,.86,.7],hut:[.9,.52,.8],tavern:[.1,.46,.95],mill:[.28,.84,.85],fair:[.7,.84,.85]};
function renderVillage(){const el=$('tabVillage');const giftOk=nowMs()-(S.gift||0)>4*3600e3,gAmt=giftAmt(),mill=!!S.village.mill,vet=!!S.runs;
  let h='<canvas id="village"></canvas>';
  if(!S.runs)h+='<div class="card"><div class="row"><img class="ic" src="'+ic('hp_dob')+'"><div class="t"><b>Нечисть лезет из леса!</b><span>Жми «В поход». Золото из походов тратим тут: строим деревню и куём силу.</span></div></div></div>';
  // казна — после Мельницы
  if(mill){const g=afkGold(),cap=afkCapH(),h2=afkH();
    h+='<div class="card treasury"><div class="row"><img class="ic" src="'+ic('chest',96)+'"><div class="t"><b>Казна: '+fmtNum(g)+' золота</b><span>'+afkRate()+' в час, пока тебя нет · вмещает '+cap+' ч</span><div class="bar"><i style="width:'+Math.round(h2/cap*100)+'%"></i></div></div></div>'+
      (g>0?'<div class="btns" style="flex-direction:row"><button class="btn gold" id="afkTake" style="flex:1">Забрать '+fmtNum(g)+'</button>'+(g>=30?'<button class="btn ad" id="afkX2" style="flex:1">🎬 ×2 за рекламу</button>':'')+'</div>':'')+'</div>';}
  const noForge=!S.village.forge;
  if(noForge)h+='<h2>Первым делом — кузница</h2><p class="sub">В кузнице прокачка остаётся навсегда. Остальные постройки откроются после неё.</p>';
  else h+='<h2>Постройки</h2><p class="sub">Каждая постройка даёт силу во всех походах.'+(mill?'':' Мельница откроет казну — золото без игры.')+'</p>';
  for(const b of noForge?[BLD[0]]:BLD){const l=S.village[b.id]||0,max=b.cost.length,cost=b.cost[l];
    h+='<div class="card'+(noForge?' next':'')+'"><div class="row"><div class="t"><b>'+b.name+(l?' <span style="display:inline;color:var(--gold);font-size:12px">ур. '+l+'</span>':'')+'</b><span>'+b.about+'</span>'+
      (max>1?'<div class="pips">'+Array.from({length:max},(_,i)=>'<i class="'+(i<l?'on':'')+'"></i>').join('')+'</div>':'')+'</div>'+
      (l>=max?'<span class="tag ok">Готово</span>':'<button class="btn gold" data-b="'+b.id+'" '+(S.gold<cost?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(cost)+'</button>')+'</div>'+
      (noForge&&S.gold<cost&&S.runs?'<p class="sub" style="margin:8px 2px 0">Не хватает '+fmtNum(cost-S.gold)+' золота — сходи в поход ещё раз.</p>':'')+'</div>';}
  // подарки за рекламу — ниже построек и только после первого похода
  const bst=S.afkBoost&&S.afkBoost.day===dayKey()?S.afkBoost.n:0,amt=afkRate()*ECO.boostH;
  if(vet){h+='<h2>Подарки</h2><div class="card gift"><img src="'+ic('bird',60)+'" width="48" height="48"><div class="t" style="flex:1"><b>Дар Жар-птицы</b><span style="display:block;font-size:12.5px;color:var(--mut)">'+(giftOk?'+'+gAmt+' золота за рекламу':'Прилетит через '+giftLeftH()+' ч')+'</span></div>'+
      (giftOk?'<button class="btn ad" id="giftBtn">🎬 За рекламу</button>':'')+'</div>';
    if(mill&&bst<2)h+='<div class="card gift"><img src="'+ic('chest',60)+'" width="48" height="48"><div class="t" style="flex:1"><b>Казна сразу</b><span style="display:block;font-size:12.5px;color:var(--mut)">осталось '+(2-bst)+' из 2 сегодня</span></div><button class="btn ad" id="afkBoost">🎬 +'+ECO.boostH+' ч за рекламу</button></div>';}
  el.innerHTML=h;drawVillage();
  on('afkBoost',()=>takeBoost(renderVillage));
  on('afkTake',()=>takeAfk(1,renderVillage));on('afkX2',()=>showRewarded(()=>takeAfk(2,renderVillage)));
  on('giftBtn',()=>takeGift(renderVillage));
  for(const b of el.querySelectorAll('[data-b]'))b.onclick=()=>build(b.dataset.b);
  $('village').onclick=e=>{const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    let best=null,bd=.02;for(const id in VPOS){const p=VPOS[id],d=(p[0]-x)**2+((p[1]-y)*.5)**2;if(d<bd){bd=d;best=id;}}
    if(best&&best!=='home'){const b=BLD.find(q=>q.id===best),l=S.village[best]||0;toast(b.name+(l?' (ур. '+l+')':' — ещё не построена')+': '+b.about);}};}
function takeAfk(m,after){if(PLAT==='yandex'&&!LOCAL&&!sdkDone){toast('Сверяем время — попробуй через пару секунд');return;} // казна по времени сервера (nowMs)
  const g=afkGold();if(g<=0)return;S.gold+=g*m;S.afkT=nowMs();save();SND.coin();toast('+'+fmtNum(g*m)+' золота из казны');setGold();if(after)after();}
function build(id){const b=BLD.find(q=>q.id===id),l=S.village[id]||0,cost=b.cost[l];if(cost==null||S.gold<cost)return;
  S.gold-=cost;S.village[id]=l+1;if(id==='mill'&&!l)S.afkT=nowMs();save();SND.chest();achToast();toast(l?'Улучшено: '+b.name+' (ур. '+(l+1)+')!':'Готово: '+b.name+'!');renderVillage();setGold();}
function drawVillage(){const c=$('village');if(!c)return;const r=c.getBoundingClientRect(),W=r.width||360,H=r.height||230,d=Math.min(devicePixelRatio||1,2.5);
  c.width=W*d;c.height=H*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';
  let sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#6ab8ff');sk.addColorStop(.55,'#bfe4ff');sk.addColorStop(.56,'#8fcf6a');sk.addColorStop(1,'#5aa447');g.fillStyle=sk;g.fillRect(0,0,W,H);
  glow(g,W*.82,H*.14,40,'#fff2a8','#ffffff');
  for(const [x,y,s] of[[.15,.12,1],[.55,.2,.7],[.35,.08,.5]]){g.fillStyle='rgba(255,255,255,.85)';for(const [dx,dy,rr2] of[[0,0,14],[14,-4,11],[-13,2,10],[26,3,9]]){g.beginPath();g.arc(W*x+dx*s*1.5,H*y+dy*s,rr2*s*1.4,0,TAU);g.fill();}}
  g.fillStyle='#7cc0a0';g.beginPath();g.moveTo(0,H*.56);for(let x=0;x<=W;x+=20)g.lineTo(x,H*.5-Math.sin(x/W*7)*8-Math.sin(x/W*17)*4);g.lineTo(W,H*.56);g.fill();
  for(let x=-10;x<W+20;x+=18){const y=H*.53+Math.sin(x*.7)*3;g.fillStyle=x%36?'#2f7a4a':'#378a52';g.beginPath();g.moveTo(x-9,y+6);g.lineTo(x,y-18-Math.sin(x)*4);g.lineTo(x+9,y+6);g.fill();}
  g.strokeStyle='rgba(230,200,140,.8)';g.lineWidth=16;g.beginPath();g.moveTo(W*.5,H*.62);g.quadraticCurveTo(W*.45,H*.85,W*.52,H+10);g.stroke();
  g.strokeStyle='rgba(210,180,120,.6)';g.lineWidth=10;g.beginPath();g.moveTo(W*.1,H*.62);g.quadraticCurveTo(W*.5,H*.7,W*.92,H*.63);g.stroke();
  const list=Object.keys(VPOS).map(id=>[id,VPOS[id]]).sort((a,b)=>a[1][1]-b[1][1]);
  for(const [id,[x,y,s]] of list){const px=W*x,py=H*y,k=s*Math.min(1.25,H/230);g.save();g.translate(px,py);g.scale(k,k);
    if(id==='home'||S.village[id])drawBld(g,id);else drawPlot(g);g.restore();}}
function drawPlot(g){g.fillStyle='rgba(0,0,0,.15)';g.beginPath();g.ellipse(0,0,24,8,0,0,TAU);g.fill();for(const [x,y] of[[-16,-2],[-6,1],[6,1],[16,-2],[-10,-5],[10,-5]])ell(g,x,y,4,3,'#9a9aa2');
  ln(g,[0,0,0,-22],'#8a5a2e',2.4);rrect(g,-10,-30,20,11,2);g.fillStyle='#d8b27a';g.fill();outline(g,'#d8b27a',1);g.fillStyle='#5a3a1a';g.font='900 9px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,-24.5);}
function logs(g,x,y,w,h,col){rrect(g,x,y,w,h,3);g.fillStyle=grad(g,x+w/2,y+h/2,Math.max(w,h)/2,col,.25,-.3);g.fill();outline(g,col,1.2);
  g.strokeStyle='rgba(60,30,10,.35)';g.lineWidth=1;for(let yy=y+4;yy<y+h;yy+=4.5){g.beginPath();g.moveTo(x+1,yy);g.lineTo(x+w-1,yy);g.stroke();}}
function roof(g,x,y,w,h,col){poly(g,[x-4,y,x+w/2,y-h,x+w+4,y],col);ln(g,[x+w/2,y-h,x+w/2,y-h-4],shade(col,-.3),1.6);}
function win(g,x,y){rrect(g,x-4,y-4,8,8,1.5);g.fillStyle='#ffe28a';g.fill();g.strokeStyle='#f4efe2';g.lineWidth=1.6;g.stroke();ln(g,[x,y-4,x,y+4],'#f4efe2',1);ln(g,[x-4,y,x+4,y],'#f4efe2',1);poly(g,[x-6,y-5,x,y-9,x+6,y-5],'#f4efe2',{ol:false,flat:true});}
function drawBld(g,id){g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(2,0,30,8,0,0,TAU);g.fill();
  if(id==='home'){logs(g,-24,-26,48,26,'#a8733d');roof(g,-24,-26,48,22,'#c0392b');win(g,-11,-13);win(g,11,-13);rrect(g,-4,-14,8,14,1.5);g.fillStyle='#6a3a1a';g.fill();rrect(g,10,-52,6,14,1);g.fillStyle='#8a8a92';g.fill();}
  if(id==='forge'){rrect(g,-20,-24,40,24,4);g.fillStyle=grad(g,0,-12,22,'#8a8a92');g.fill();outline(g,'#8a8a92',1.2);roof(g,-20,-24,40,14,'#5a5a66');rrect(g,-7,-16,14,16,6);g.fillStyle='#ff9a3a';g.fill();glow(g,0,-8,16,'#ff8a1a');
    rrect(g,10,-46,7,16,1);g.fillStyle='#6a6a72';g.fill();glow(g,13,-50,8,'#cccccc');}
  if(id==='altar'){for(const a of[0,1,2,3,4,5]){ell(g,Math.cos(a)*18,Math.sin(a)*5-2,4,3,'#9a9aa2');}ln(g,[0,-2,0,-36],'#8a5a2e',6);ell(g,0,-36,5,5,'#a8733d');eye(g,-2,-37,1.4,{px:0});eye(g,2,-37,1.4,{px:0});glow(g,0,-6,12,'#ff8a1a');}
  if(id==='barn'){logs(g,-28,-24,56,24,'#b84a2a');roof(g,-28,-24,56,18,'#7a3a22');rrect(g,-9,-18,18,18,1);g.fillStyle='#6a2a14';g.fill();ln(g,[-9,-18,9,0],'#f4efe2',1.4);ln(g,[9,-18,-9,0],'#f4efe2',1.4);}
  if(id==='tower'){logs(g,-9,-50,18,50,'#a8733d');logs(g,-14,-60,28,12,'#8a5a2e');roof(g,-14,-60,28,16,'#2f6a9a');win(g,0,-30);}
  if(id==='well'){ln(g,[-12,-2,-12,-28],'#7a4a22',2.4);ln(g,[12,-2,12,-28],'#7a4a22',2.4);roof(g,-14,-26,28,10,'#c0392b');ell(g,0,-4,13,6,'#8a8a92');ell(g,0,-5,9,3,'#2f6a9a',{ol:false});ln(g,[0,-26,0,-14],'#5a3a1a',1);rrect(g,-3,-14,6,5,1);g.fillStyle='#8a5a2e';g.fill();}
  if(id==='hut'){logs(g,-17,-20,34,20,'#9a6a3a');roof(g,-17,-20,34,18,'#6a8a3a');win(g,-6,-10);rrect(g,4,-12,7,12,1);g.fillStyle='#5a3a1a';g.fill();for(const x of[-12,-9,-5])ln(g,[x,-20,x+1,-14],'#5aa04a',1.6);glow(g,10,-44,9,'#e8f4ff');}
  if(id==='mill'){logs(g,-12,-26,24,26,'#a8733d');roof(g,-12,-26,24,12,'#7a3a22');g.save();g.translate(0,-30);g.rotate((Date.now()/2000)%TAU);for(let i=0;i<4;i++){g.rotate(TAU/4);rrect(g,-2,0,4,24,1);g.fillStyle='#e8dcc0';g.fill();outline(g,'#e8dcc0',.8);}g.restore();ell(g,0,-30,3,3,'#5a3a1a');}
  if(id==='fair'){for(const [x,c] of[[-16,'#e8433a'],[0,'#2f7ad8'],[16,'#f0a020']]){rrect(g,x-7,-14,14,14,1);g.fillStyle='#c8a070';g.fill();poly(g,[x-9,-14,x,-24,x+9,-14],c);}
    for(const [x,c] of[[-12,'#e0332a'],[-6,'#f2c04a'],[4,'#5aa04a'],[12,'#e0332a']]){g.beginPath();g.arc(x,-3,2.2,0,TAU);g.fillStyle=c;g.fill();}}
  if(id==='tavern'){logs(g,-26,-40,52,40,'#a8733d');ln(g,[-26,-20,26,-20],'rgba(60,30,10,.5)',1.5);roof(g,-26,-40,52,20,'#d88a1a');win(g,-14,-29);win(g,14,-29);win(g,-14,-10);rrect(g,-5,-14,10,14,1.5);g.fillStyle='#6a3a1a';g.fill();
    rrect(g,8,-17,18,8,2);g.fillStyle='#f4efe2';g.fill();outline(g,'#f4efe2',.8);g.fillStyle='#6a2a14';g.font='900 5px system-ui';g.textAlign='center';g.fillText('ТРАКТИР',17,-11.5);}}

/* ---------- кузница ---------- */
function renderForge(){const el=$('tabForge');
  if(!S.village.forge){el.innerHTML='<h2>Кузница</h2><div class="card"><div class="row"><img class="ic" src="'+ic('i_sword')+'"><div class="t"><b>Кузницы ещё нет</b><span>Построй её в деревне — всего '+BLD[0].cost[0]+' золота. Тут прокачка сохраняется навсегда.</span></div></div></div><button class="btn big" id="toVil">В деревню</button>';
    on('toVil',()=>openTab('Village'));return;}
  let h='<h2>Кузница</h2><div class="seg"><button id="fsH" class="'+(forgeSeg==='hero'?'on':'')+'">Богатырь</button><button id="fsW" class="'+(forgeSeg==='arm'?'on':'')+'">Оружейная</button></div>';
  if(forgeSeg==='arm'){h+=needCard(Object.keys(WEAPONS).filter(id=>(S.armory[id]||0)<ARMORY_MAX).map(id=>({n:WEAPONS[id].name+', ур. '+((S.armory[id]||0)+1),c:armoryCost(S.armory[id]||0)})),renderForge)+'<p class="sub">Вечная прокачка оружия: +10% урона за уровень, на 3-м и 5-м ещё +10% размаха. Внизу — какой оберег нужен для эволюции.</p>';
    for(const id in WEAPONS){const W=WEAPONS[id],l=S.armory[id]||0,cost=armoryCost(l);
      h+='<div class="card"><div class="row"><img class="ic" src="'+ic(W.icon)+'"><div class="t"><b>'+W.name+'</b><span>+'+(l*10)+'% урона сейчас</span><div class="pips">'+Array.from({length:ARMORY_MAX},(_,i)=>'<i class="'+(i<l?'on':'')+'"></i>').join('')+'</div></div>'+
        (l>=ARMORY_MAX?'<span class="tag ok">Макс.</span>':'<button class="btn gold" data-a="'+id+'" '+(S.gold<cost?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(cost)+'</button>')+'</div>'+
        '<div style="margin-top:8px;font-size:12px;color:var(--mut);line-height:1.5">Эволюция: 5-й ур. + <img src="'+ic(PASSIVES[W.evo.need].icon,48)+'" width="18" height="18" style="vertical-align:-4px"> '+PASSIVES[W.evo.need].name+' → <b style="color:#ffd98a">'+W.evo.name+'</b></div></div>';}
    el.innerHTML=h;on('needAd',()=>needCard.fn());on('fsH',()=>{forgeSeg='hero';renderForge();});
    for(const b of el.querySelectorAll('[data-a]'))b.onclick=()=>{const id=b.dataset.a,l=S.armory[id]||0,cost=armoryCost(l);if(S.gold<cost||l>=ARMORY_MAX)return;S.gold-=cost;S.armory[id]=l+1;save();SND.level();renderForge();setGold();};
    return;}
  h+=needCard(FORGE.filter(f=>(S.forge[f.id]||0)<f.max).map(f=>({n:f.name+', ур. '+((S.forge[f.id]||0)+1),c:forgeCost(S.forge[f.id]||0,f.id)})),renderForge)+'<p class="sub">Прокачка навсегда — для всех богатырей и всех походов.</p>';
  for(const f of FORGE){const l=S.forge[f.id]||0,cost=forgeCost(l,f.id);
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic(f.icon)+'"><div class="t"><b>'+f.name+'</b><span>'+f.per+' за уровень'+(f.max>10?(l>=10?' · мастерская ковка':' · до '+f.max+' ур.'):'')+'</span><div class="pips'+(f.max>10?' long':'')+'">'+Array.from({length:f.max},(_,i)=>'<i class="'+(i<l?'on':'')+(i>=10?' m':'')+'"></i>').join('')+'</div></div>'+
      (l>=f.max?'<span class="tag ok">Макс.</span>':'<button class="btn gold" data-f="'+f.id+'" '+(S.gold<cost?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(cost)+'</button>')+'</div></div>';}
  el.innerHTML=h;on('needAd',()=>needCard.fn());on('fsW',()=>{forgeSeg='arm';renderForge();});for(const b of el.querySelectorAll('[data-f]'))b.onclick=()=>{const f=FORGE.find(q=>q.id===b.dataset.f),l=S.forge[f.id]||0,cost=forgeCost(l,f.id);if(S.gold<cost||l>=f.max)return;
    S.gold-=cost;S.forge[f.id]=l+1;save();SND.level();achToast();renderForge();setGold();};}

/* ---------- богатыри ---------- */
function skinRow(hr){const list=SKINS.filter(k=>k.hero===hr.id&&(!k.pay||skinHas(hr.id+'@'+k.id)||typeof payHere==='function'&&payHere()&&!!PAY.item(k.pay)));if(!list.length)return '';const cur=(S.skin||{})[hr.id]||'';
  let h='<div style="width:100%;display:flex;gap:6px;margin-top:10px;overflow-x:auto">';
  const chip=(key,name,own,sel,sid,price)=>'<button class="skin'+(sel?' on':'')+'" data-skin="'+hr.id+'|'+sid+'" '+(own?'':'data-lock="1"')+' style="flex:none;width:74px;padding:4px;border-radius:12px;background:'+(sel?'rgba(255,201,74,.22)':'rgba(255,255,255,.06)')+';border:1px solid '+(sel?'var(--gold)':'var(--line)')+';font-size:10px;font-weight:700;color:'+(own?'#fff':'var(--mut)')+'">'+
    '<img src="'+ic('hp_'+key,96)+'" style="width:44px;height:44px;'+(own?'':price?'opacity:.7':'filter:grayscale(1) brightness(.5)')+'"><div style="line-height:1.15">'+(own||price?'':'🔒 ')+name+'</div>'+(!own&&price==='pay'?'<div style="color:var(--gold);margin-top:2px">🎁 покупка</div>':!own&&price?'<div style="color:var(--gold);margin-top:2px">💰 '+fmtNum(price)+'</div>':'')+'</button>';
  h+=chip(hr.id,'Обычный',true,!cur,'');for(const k of list){const key=hr.id+'@'+k.id;h+=chip(key,k.name,skinHas(key),cur===k.id,k.id,k.pay?'pay':k.price);}
  return h+'</div>';}
function skinSource(key){const sk=SKINS.find(k=>k.hero+'@'+k.id===key);if(sk&&sk.pay)return 'покупка «'+PAY_ITEMS[sk.pay].name+'»';if(sk&&sk.price)return 'купить за '+fmtNum(sk.price)+' золота';const a=ACH.find(x=>x.r===key);if(a)return 'достижение «'+a.name+'»: '+a.about.toLowerCase();if(LOGIN_SKINS.includes(key))return 'награда за 7 дней входа подряд';return '';}
function renderHeroes(){const el=$('tabHeroes');let h='<h2>Богатыри</h2><p class="sub">Новые богатыри приходят, когда освобождаешь земли. Звание усиливает особенность и дар богатыря.</p>';
  if(!S.rank)S.rank={};
  for(const hr of HEROES){const open=heroOpen(hr),sel=S.hero===hr.id,W=WEAPONS[hr.weapon],r=S.rank[hr.id]||0,rc=rankCost(r);
    h+='<div class="card hero-card'+(sel?' sel':'')+(open?'':' lock')+'" data-h="'+hr.id+'" style="flex-wrap:wrap"><img src="'+ic('hp_'+skinKey(hr.id),160)+'"'+(open&&typeof PAY!=='undefined'&&PAY.own('mead')?' class="mecenat" title="Меценат"':'')+'><div class="t" style="flex:1;min-width:0"><b style="font-size:16px">'+hr.name+'</b>'+
      '<span style="display:block;color:var(--mut);font-size:12.5px">'+hr.title+(open?' · <span style="color:#ffd98a">'+RANKS[r]+'</span>':'')+'</span>'+
      '<span style="display:flex;align-items:center;gap:6px;font-size:12.5px;margin-top:6px"><img src="'+ic(W.icon,48)+'" style="width:22px;height:22px;background:none">'+W.name+'</span>'+
      '<span style="display:block;font-size:12px;color:#ffd98a;margin-top:3px">'+hr.perk+(r?' (+'+r*25+'%)':'')+'</span>'+
      '<span style="display:block;font-size:12px;color:#bfe0ff;margin-top:3px">✨ '+hr.dar.name+': '+hr.dar.about+'</span>'+
      (sel?'<span class="tag ok">Выбран</span>':open?'<span class="tag">Нажми, чтобы выбрать</span>':hr.price?'':'<span class="tag">🔒 Освободи: '+CH[hr.unlock].name+'</span>')+'</div>'+
      (open?'<div style="width:100%;display:flex;align-items:center;gap:10px;margin-top:10px"><div style="flex:1"><div style="font-size:12px;color:var(--mut)">Звание: дар сильнее на 30%, чаще на 7%</div><div class="pips">'+
        Array.from({length:RANK_MAX},(_,i)=>'<i class="'+(i<r?'on':'')+'"></i>').join('')+'</div></div>'+
        (r>=RANK_MAX?'<span class="tag ok">Былинный</span>':'<button class="btn gold" data-r="'+hr.id+'" '+(S.gold<rc?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(rc)+'</button>')+'</div>'
      :'')+(open?skinRow(hr):'')+(open?''
      :hr.price?'<div style="width:100%;margin-top:10px"><button class="btn gold big" data-buy="'+hr.id+'" '+(S.gold<hr.price?'disabled':'')+'><img src="'+ic('coin',36)+'">Позвать за '+fmtNum(hr.price)+'</button></div>':'')+'</div>';}
  el.innerHTML=h;
  for(const c of el.querySelectorAll('[data-h]'))c.onclick=e=>{if(e.target.closest('button'))return;const hr=HERO_BY[c.dataset.h];
    if(!heroOpen(hr)){toast(hr.price?'Позови его за золото':'Пройди главу «'+CH[hr.unlock].name+'»');return;}S.hero=hr.id;save();SND.click();renderHeroes();};
  for(const b of el.querySelectorAll('[data-skin]'))b.onclick=()=>{const [hid,sid]=b.dataset.skin.split('|'),sk=SKINS.find(k=>k.hero===hid&&k.id===sid);
    if(b.dataset.lock&&sk&&sk.pay){buyFest(sk);return;}
    if(b.dataset.lock&&sk&&sk.price){buySkin(sk);return;}
    if(b.dataset.lock){toast('🔒 Как получить: '+skinSource(hid+'@'+sid));return;}
    S.skin[hid]=sid;save();SND.click();renderHeroes();};
  for(const b of el.querySelectorAll('[data-r]'))b.onclick=()=>{const id=b.dataset.r,r=S.rank[id]||0,c=rankCost(r);if(S.gold<c||r>=RANK_MAX)return;S.gold-=c;S.rank[id]=r+1;save();SND.chest();achToast();toast(HERO_BY[id].name+' — '+RANKS[r+1]+'!');renderHeroes();setGold();};
  for(const b of el.querySelectorAll('[data-buy]'))b.onclick=()=>{const hr=HERO_BY[b.dataset.buy];if(S.gold<hr.price)return;S.gold-=hr.price;S.bought=S.bought||{};S.bought[hr.id]=1;S.hero=hr.id;save();SND.chest();achToast();toast(hr.name+' с тобой!');renderHeroes();setGold();};}

// праздничный облик — из покупки Яндекса «Праздничные облики» (js/pay.js): окно с превью и кнопкой покупки с ценой из каталога
function buyFest(sk){const key=sk.hero+'@'+sk.id;if(!(typeof payHere==='function'&&payHere()&&PAY.item(sk.pay)))return;
  showModal('<h3>Облик «'+sk.name+'»</h3><img src="'+ic('hp_'+key,160)+'" width="110" height="110" style="display:block;margin:6px auto"><p class="sub">Только для красоты — силы не прибавляет. Масленичный, Новогодний и Купальский облики откроются сразу у всех 9 богатырей.</p>'+
    PAY.html([sk.pay])+'<div class="btns"><button class="btn ghost" id="skNo">Не сейчас</button></div>');
  PAY.bind($('mBody'));on('skNo',hideModal);
  PAY.re=()=>{if(!skinHas(key))return;hideModal();S.skin[sk.hero]=sk.id;save();renderHeroes();};}
// облик за золото: только для красоты — спрашиваем, прежде чем списать
function buySkin(sk){const key=sk.hero+'@'+sk.id;if(S.skins[key])return;
  if(S.gold<sk.price){toast('Облик «'+sk.name+'»: нужно '+fmtNum(sk.price)+' золота, у тебя '+fmtNum(S.gold));return;}
  showModal('<h3>Облик «'+sk.name+'»</h3><img src="'+ic('hp_'+key,160)+'" width="110" height="110" style="display:block;margin:6px auto"><p class="sub">Только для красоты — силы не прибавляет. '+HERO_BY[sk.hero].name+' будет ходить в нём во всех походах.</p>'+
    '<div class="btns"><button class="btn gold big" id="skBuy"><img src="'+ic('coin',36)+'">Купить за '+fmtNum(sk.price)+'</button><button class="btn ghost" id="skNo">Не сейчас</button></div>');
  on('skNo',hideModal);on('skBuy',()=>{if(S.gold<sk.price||S.skins[key]){hideModal();return;}S.gold-=sk.price;S.skins[key]=1;S.skin[sk.hero]=sk.id;save();SND.chest();hideModal();achToast();toast('Новый облик: «'+sk.name+'»!');setGold();renderHeroes();});}

/* ---------- достижения ---------- */
function rewardText(r){if(typeof r==='number')return '+'+fmtNum(r)+' золота';const sk=SKINS.find(k=>k.hero+'@'+k.id===r);return 'облик «'+(sk?sk.name:r)+'»';}
function grant(r){if(typeof r==='number')S.gold+=r;else S.skins[r]=1;}
function achCheck(){const out=[];for(const a of ACH){if(S.ach[a.id])continue;if(a.v()>=a.n){S.ach[a.id]=1;grant(a.r);out.push(a);}}if(out.length)save();return out;}
function achToast(){const n=achCheck();if(n.length){SND.chest();toast('🏆 '+n.map(a=>a.name+': '+rewardText(a.r)).join(' · '));setGold();}}

/* ---------- награда за вход ---------- */
// мягкая серия: пропущен ровно один день — серию можно вернуть за рекламу (lost — сколько дней было)
function loginState(){const L=S.login||{last:'',n:0},today=dayKey();if(L.last===today)return {ready:false,n:L.n};if(L.last===dayPrev(today))return {ready:true,n:L.n%7+1};
  return {ready:true,n:1,lost:L.n&&L.last===dayPrev(dayPrev(today))?L.n:0};}
function loginReward(n){if(n<7)return Math.round(LOGIN_GOLD[n-1]*(1+ECO.login*Object.keys(S.done).length));const sk=LOGIN_SKINS.find(k=>!S.skins[k]);return sk||1000;}
function openLogin(){if(document.body.classList.contains('run'))return;const ls=loginState();if(!ls.ready)return;const n=ls.n;
  let cells='';for(let d=1;d<=7;d++){const r=loginReward(d),isSkin=typeof r==='string';cells+='<div style="flex:1;min-width:0;text-align:center;padding:8px 2px;border-radius:12px;background:'+(d===n?'rgba(255,201,74,.25)':d<n?'rgba(74,222,106,.15)':'rgba(255,255,255,.06)')+';border:1px solid '+(d===n?'var(--gold)':'transparent')+'">'+
    '<div style="font-size:10px;color:var(--mut)">День '+d+'</div>'+(isSkin?'<img src="'+ic('hp_'+r,72)+'" style="width:34px;height:34px">':'<img src="'+ic('coin',48)+'" style="width:22px;height:22px;margin:6px 0">')+
    '<div style="font-size:10px;font-weight:800">'+(isSkin?'облик':fmtNum(r))+'</div>'+(d<n?'<div style="font-size:10px;color:#8af0a0">✓</div>':'')+'</div>';}
  const r=loginReward(n);
  showModal('<h3>Награда за вход</h3><p class="sub">Заходи 7 дней подряд — на 7-й день облик богатыря. Пропустил один день — серию можно вернуть за рекламу.</p><div style="display:flex;gap:4px;margin:10px 0">'+cells+'</div>'+
    (ls.lost?'<div class="card gift" style="margin:0 0 8px"><div class="t" style="flex:1"><b>Серия прервалась</b><span style="display:block;font-size:13px;color:var(--mut)">Было '+ls.lost+' дн. подряд — вернуть и продолжить?</span></div><button class="btn ad" id="lgRest">🎬 Вернуть за рекламу</button></div>':'')+
    '<div class="btns"><button class="btn gold big" id="lgTake">Забрать: '+rewardText(r)+'</button>'+(typeof r==='number'?'<button class="btn ad" id="lgX2">🎬 ×2 за рекламу</button>':'')+'<button class="btn ghost" id="lgBack">Назад</button></div>');
  const take=m=>{S.login={last:dayKey(),n};if(typeof r==='number')S.gold+=r*m;else S.skins[r]=1;save();SND.chest();hideModal();toast('Награда за вход: '+(typeof r==='number'?'+'+fmtNum(r*m)+' золота':rewardText(r)));setGold();achToast();if(curTab==='Heroes')renderHeroes();};
  on('lgTake',()=>take(1));on('lgX2',()=>showRewarded(()=>take(2)));on('lgBack',openToday);
  on('lgRest',()=>showRewarded(()=>{S.login={last:dayPrev(dayKey()),n:ls.lost};save();SND.chest();openLogin();}));}

/* ---------- дела на сегодня: всё ежедневное в одном окне (раз за запуск сам, дальше — кнопкой на карте) ---------- */
function todayList(){const L=[],ls=loginState(),dq=dailyEnsure(),qd=dq.list.filter(x=>x.c).length,qr=dq.list.filter(x=>!x.c&&qDone(x)).length;
  L.push({k:'login',ic:'coin',t:'Награда за вход',s:ls.ready?'День '+ls.n+': '+rewardText(loginReward(ls.n)):'Получена · завтра — день '+(ls.n%7+1),ready:ls.ready,b:'Забрать'});
  L.push({k:'quests',ic:'i_sword',t:'Задания дня',s:qd+' из 3 получено'+(qr?' · можно забрать: '+qr:''),ready:qr>0||(!dq.bonus&&dq.list.every(x=>x.c)),b:'Открыть',always:!dq.bonus});
  if(S.village.mill){const g=afkGold();L.push({k:'afk',ic:'chest',t:'Казна',s:g>0?'Накопилось золота: '+fmtNum(g):'Копится, пока тебя нет',ready:g>=30,b:'Забрать'});}
  if(S.runs)L.push({k:'gift',ic:'bird',t:'Дар Жар-птицы',s:giftReady()?'+'+fmtNum(giftAmt())+' золота за рекламу':'Прилетит через '+giftLeftH()+' ч',ready:giftReady(),b:'🎬 За рекламу',ad:1});
  if(drOpen()){const m=drMine(),d=dailyDef();L.push({k:'dr',ic:'hp_'+d.hero,t:'Поход дня',s:CH[d.chi].name+' · '+HERO_BY[d.hero].name+' · «'+d.rule.name+'»'+(m.best?' · очки: '+fmtNum(m.best):'')+(m.got?'':' · +'+fmtNum(drReward())+' золота'),ready:!m.got,b:m.got?'Ещё раз':'В поход',always:1});}
  if(S.done[0]){const m=wkMine();L.push({k:'wk',ic:'e_perun',t:'Испытание недели',s:m.got?'Награда недели получена':'«'+weekly().name+'»: +'+fmtNum(weeklyReward())+' золота',ready:!m.got,b:'Испытать'});}
  return L;}
let todayShown=false;
function openToday(auto){if(document.body.classList.contains('run'))return;const L=todayList();if(auto){if(todayShown||!L.some(x=>x.ready)||$('modal').classList.contains('on'))return;}todayShown=true;
  showModal('<h3>Дела на сегодня</h3><p class="sub">Всё ежедневное — здесь. Не успел — не беда, завтра будет снова.</p>'+
    L.map((x,i)=>'<div class="card today-row'+(x.ready?' ready':'')+'"><div class="row"><img class="ic" src="'+ic(x.ic,96)+'"><div class="t"><b>'+x.t+'</b><span>'+x.s+'</span></div>'+
      (x.ready||x.always?'<button class="btn '+(!x.ready?'ghost':x.ad?'ad':'gold')+'" data-td="'+i+'">'+x.b+'</button>':'<span class="tag ok">✓</span>')+'</div></div>').join('')+
    '<div class="btns"><button class="btn big" id="tdOk">В бой!</button></div>');
  on('tdOk',()=>{hideModal();openTab('Map');});
  for(const b of document.querySelectorAll('[data-td]'))b.onclick=()=>{SND.click();const x=L[+b.dataset.td];
    if(x.k==='login')openLogin();
    else if(x.k==='quests'){hideModal();qSeg='q';openTab('Quests');}
    else if(x.k==='afk'){takeAfk(1,()=>{openToday();if(curTab==='Village')renderVillage();});}
    else if(x.k==='gift')takeGift(()=>{openToday();if(curTab==='Village')renderVillage();});
    else if(x.k==='wk'){hideModal();startRun(0,true,true);}
    else if(x.k==='dr')openDaily();};}
// поход дня: правила перед стартом (одно окно, из «Дел на сегодня» и из задания)
function openDaily(){const d=dailyDef(),m=drMine(),h=HERO_BY[d.hero];
  showModal('<h3>Поход дня</h3><p class="sub">Сегодня у всех одинаково: глава, богатырь, правило и карточки умений.</p>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic('hp_'+skinKey(h.id),120)+'"><div class="t"><b>'+h.name+'</b><span>'+CH[d.chi].name+' · босс: '+EN[CH[d.chi].boss].n+'</span></div></div></div>'+
    '<div class="card" style="font-size:13.5px;line-height:1.45"><b style="font-size:15px">«'+d.rule.name+'»</b><br>'+d.rule.about+'<br>🏆 Очки: одолено нечисти + 500 за босса. В таблицу идёт лучший поход дня.<br>🎁 '+(m.got?'Награда за сегодня получена':'За участие: +'+fmtNum(drReward())+' золота (продержись хотя бы минуту)')+(m.best?'<br>Твой лучший сегодня: <b>'+fmtNum(m.best)+'</b>':'')+'</div>'+
    '<div class="btns"><button class="btn big" id="drGo">⚔️ В поход дня</button><button class="btn ghost" id="drBack">Назад</button></div>');
  on('drGo',()=>startRun(0,false,false,dailyDef()));on('drBack',openToday);}
function todayCard(){const L=todayList(),n=L.filter(x=>x.ready).length;
  return '<div class="card today'+(n?' ready':'')+'" id="todayBtn"><div class="row"><img class="ic" src="'+ic('chest',96)+'" style="width:40px;height:40px"><div class="t"><b>📋 Дела на сегодня</b><span>'+(n?'Ждут тебя: '+n:'Всё сделано — молодец!')+'</span></div><span class="tag">Открыть</span></div></div>';}

/* ---------- задания дня ---------- */
function dailyEnsure(){const k=dayKey();if(S.dq&&S.dq.day===k)return S.dq;
  const tier=questTier(),R=mulberry(+k.split('-').join(''));const pool=QUESTS.filter(q=>!q.need||(q.need==='endless'&&S.done[0])||(q.need==='evo'&&tier>=1));
  const list=drOpen()?[{id:'drun',n:1,p:0,c:0}]:[]; // поход дня — вместо одного из трёх заданий (а не четвёртым делом)
  while(list.length<3&&pool.length){const q=pool.splice(Math.floor(R()*pool.length),1)[0];list.push({id:q.id,n:q.n[tier],p:0,c:0});}
  S.dq={day:k,list,bonus:0};save();return S.dq;}
function qDef(id){return QUESTS.find(q=>q.id===id);}
function qVal(x){const q=qDef(x.id);return q.min?Math.floor(x.p/60):Math.floor(x.p);}
function qDone(x){return qVal(x)>=x.n;}
function qText(x){return qDef(x.id).t.replace('{n}',x.n);}
function questsFromRun(win){const dq=dailyEnsure(),v={kills:G.kills,bosses:G.bossN,time:G.t,gold:G.reward,chests:G.q.chests,lvl:G.hero.lvl,runs:G.t>=30?1:0,dars:G.q.dars,evos:G.q.evos,endTime:G.endless&&!G.weekly?G.t:0,druns:G.daily&&G.t>=60?1:0};
  const newly=[];for(const x of dq.list){if(x.c)continue;const q=qDef(x.id),was=qDone(x),val=v[q.key]||0;x.p=q.max?Math.max(x.p,val):x.p+val;if(!was&&qDone(x))newly.push(qText(x));}
  save();return newly;}
function streakInfo(){const st=S.streak||{last:'',n:0},today=dayKey();const n=st.last===today?st.n:st.last===dayPrev(today)?st.n+1:1;
  return {n,mul:1+.1*Math.min(n-1,6),lost:n===1&&st.n&&st.last===dayPrev(dayPrev(today))?st.n:0};}
function heroBadge(){const b=document.querySelector('nav button[data-tab="Heroes"]');if(b)b.classList.toggle('dot',!!S.heroNew);}
function questBadge(){heroBadge();const dq=dailyEnsure(),can=dq.list.some(x=>!x.c&&qDone(x))||(!dq.bonus&&dq.list.every(x=>x.c));const b=$('navQ');if(b)b.classList.toggle('dot',can);}
let lbSeg='endless',qSeg='q';
function renderQuests(){if(qSeg==='a')return renderAch();if(qSeg==='b')return renderBest();const el=$('tabQuests'),dq=dailyEnsure(),rw=questReward(),now=new Date(dayMs()),left=Math.ceil((new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)-now)/3600e3),si=streakInfo();
  let h=segHTML()+'<h2>Задания дня</h2><p class="sub">Новые задания через '+left+' ч. Выполни все три — получишь сундук дня. Каждый день подряд — награда больше.</p>';
  for(let i=0;i<dq.list.length;i++){const x=dq.list[i],done=qDone(x),pr=Math.min(1,qVal(x)/x.n);
    h+='<div class="card"><div class="row"><div class="t"><b>'+qText(x)+'</b><span>'+Math.min(qVal(x),x.n)+' / '+x.n+' · награда '+fmtNum(rw)+' золота</span><div class="bar"><i style="width:'+Math.round(pr*100)+'%"></i></div></div>'+
      (x.c?'<span class="tag ok">Получено</span>':'')+'</div>'+
      (!x.c&&done?'<div class="btns" style="flex-direction:row"><button class="btn gold" data-q="'+i+'" style="flex:1">Забрать '+fmtNum(rw)+'</button><button class="btn ad" data-qa="'+i+'" style="flex:1">🎬 ×2 за рекламу</button></div>':'')+'</div>';}
  const all=dq.list.every(x=>x.c),bonus=Math.round(rw*2*si.mul);
  h+='<div class="card treasury"><div class="row"><img class="ic" src="'+ic('chest',96)+'"><div class="t"><b>Сундук дня: '+fmtNum(bonus)+' золота</b><span>Серия: '+si.n+' дн. подряд (+'+Math.round((si.mul-1)*100)+'%). Выполни и забери все три задания.</span></div>'+
    (dq.bonus?'<span class="tag ok">Получено</span>':all?'<button class="btn gold" id="qBonus">Открыть</button>':'<span class="tag">🔒</span>')+'</div>'+
    (si.lost&&!dq.bonus?'<div class="btns" style="flex-direction:row;align-items:center"><span style="flex:1;font-size:13px;color:var(--mut)">Серия прервалась (было '+si.lost+' дн.)</span><button class="btn ad" id="qRest">🎬 Вернуть за рекламу</button></div>':'')+'</div>';
  // рекорды
  const doneN=Object.keys(S.done).length;
  h+='<h2>Рекорды</h2><div class="stats"><div><b>'+(S.endBest?fmtTime(S.endBest):'—')+'</b>Бесконечная сеча</div><div><b>'+fmtNum(S.kills||0)+'</b>одолено нечисти</div><div><b>'+(S.bosses||0)+'</b>боссов повержено</div><div><b>'+doneN+' / '+CH.length+'</b>глав освобождено</div></div>';
  if(PLAT==='vk')h+='<h2>Таблица друзей</h2><div class="card" id="lbBox"><p class="sub" style="margin:0 0 10px">Кто из друзей одолел больше нечисти? Твой счёт: <b style="color:#fff">'+fmtNum(S.kills||0)+'</b></p><div class="btns"><button class="btn big" id="lbVk">🏆 Таблица друзей</button><button class="btn ghost" id="lbInv">👥 Позвать друзей</button></div></div>';
  else h+='<h2>Таблица богатырей</h2><div class="seg"><button id="lbE" class="'+(lbSeg==='endless'?'on':'')+'">Сеча</button><button id="lbW" class="'+(lbSeg==='weekly'?'on':'')+'">Неделя</button><button id="lbK" class="'+(lbSeg==='kills'?'on':'')+'">Одолено</button>'+(drOpen()?'<button id="lbD" class="'+(lbSeg==='daily'?'on':'')+'">День</button>':'')+'</div>'+
    (lbSeg==='daily'?'<p class="sub" style="margin-top:-4px">Поход дня «'+dailyDef().rule.name+'»: одолено нечисти + 500 за босса. Твои очки сегодня: '+(drMine().best?fmtNum(drMine().best):'—')+'</p>':'')+
    (lbSeg==='weekly'?'<p class="sub" style="margin-top:-4px">Испытание недели «'+weekly().name+'»: кто дольше продержится. Твой рекорд: '+(wkMine().best?fmtTime(wkMine().best):'—')+'</p>':'')+'<div class="card" id="lbBox"><p class="sub" style="margin:0">Загрузка…</p></div>';
  el.innerHTML=h;segBind();
  const claim=(i,m)=>{const x=dq.list[i];if(x.c||!qDone(x))return;x.c=1;S.gold+=rw*m;save();SND.coin();toast('+'+fmtNum(rw*m)+' золота');renderQuests();setGold();questBadge();achToast();};
  for(const b of el.querySelectorAll('[data-q]'))b.onclick=()=>claim(+b.dataset.q,1);
  for(const b of el.querySelectorAll('[data-qa]'))b.onclick=()=>showRewarded(()=>claim(+b.dataset.qa,2));
  on('qBonus',()=>{if(dq.bonus)return;dq.bonus=1;S.streak={last:dayKey(),n:si.n};S.gold+=bonus;save();SND.chest();toast('Сундук дня: +'+fmtNum(bonus)+' золота!');renderQuests();setGold();questBadge();});
  on('qRest',()=>showRewarded(()=>{S.streak={last:dayPrev(dayKey()),n:si.lost};save();SND.chest();toast('Серия возвращена: '+si.lost+' дн.');renderQuests();}));
  on('lbE',()=>{lbSeg='endless';renderQuests();});on('lbW',()=>{lbSeg='weekly';renderQuests();});on('lbK',()=>{lbSeg='kills';renderQuests();});on('lbD',()=>{lbSeg='daily';renderQuests();});
  loadLB();}
function segHTML(){const na=ACH.filter(a=>S.ach[a.id]).length;return '<div class="seg" style="margin-top:10px"><button id="sgQ" class="'+(qSeg==='q'?'on':'')+'">Задания</button><button id="sgA" class="'+(qSeg==='a'?'on':'')+'">Достижения '+na+'/'+ACH.length+'</button><button id="sgB" class="'+(qSeg==='b'?'on':'')+'">📖 Книга нечисти</button></div>';}
function segBind(){on('sgQ',()=>{qSeg='q';renderQuests();});on('sgA',()=>{qSeg='a';renderQuests();});on('sgB',()=>{qSeg='b';renderQuests();});}
/* ---------- бестиарий: книга нечисти ---------- */
function bestName(id){return EN[id].n;}
function starsHTML(id){const n=S.bk[id]||0,k=bestStars(id,n);return '<i class="stars">'+'★'.repeat(k)+'<u>'+'★'.repeat(3-k)+'</u></i>';}
function renderBest(){const el=$('tabQuests'),n=BEST_ORDER.filter(id=>S.meet[id]).length;
  let h=segHTML()+'<h2>Книга нечисти</h2><p class="sub">Встретил в походе — записано в книгу. Открыто: <b style="color:#fff">'+n+' / '+BEST_ORDER.length+'</b>. Звёзды — за число одолённых. Нажми на картинку, чтобы почитать.</p>';
  for(const [title,list] of[['Нечисть',BEST_ORDER.filter(id=>!EN[id].boss&&id!=='egg')],['Боссы',BEST_ORDER.filter(id=>EN[id].boss||id==='egg')]]){
    h+='<h2 style="font-size:17px">'+title+'</h2><div class="bgrid">';
    for(const id of list){const k=!!S.meet[id];h+='<button class="bcell'+(k?'':' lock')+'" data-bi="'+id+'"><img src="'+ic(id,120)+'"><b>'+(k?bestName(id):'???')+'</b>'+(k?starsHTML(id):'<small class="where">'+bestWhere(id).replace(/ \(.*/,'')+'</small>')+'</button>';}
    h+='</div>';}
  el.innerHTML=h;segBind();for(const b of el.querySelectorAll('[data-bi]'))b.onclick=()=>{SND.click();openBeast(b.dataset.bi);};}
function openBeast(id){const d=EN[id],k=!!S.meet[id],n=S.bk[id]||0,boss=d.boss||id==='egg';
  const spd=d.spd===0?'не ходит — лежит':d.spd<40?'медленно':d.spd<60?'вразвалочку':d.spd<85?'шустро':'очень быстро';
  const feat=[d.fly?'летает':'',d.ranged?'стреляет издалека':'',boss?'босс главы':''].filter(Boolean).join(', ');
  const nxt=boss?[1,5,20]:[10,100,1000],goal=nxt.find(x=>n<x);
  showModal('<div class="beast'+(k?'':' lock')+'"><img src="'+ic(id,220)+'"></div><h3>'+(k?d.n:'Неведомая нечисть')+'</h3>'+(k?'<div style="text-align:center;font-size:20px">'+starsHTML(id)+'</div>':'')+
    '<p class="sub" style="font-size:14px;color:#e8e4f4">'+(k?LORE[id]:'Эта нечисть тебе ещё не встречалась. Говорят, водится здесь: '+bestWhere(id)+'.')+'</p>'+
    (k?'<div class="stats"><div><b>'+fmtNum(n)+'</b>одолено</div><div><b style="font-size:15px">'+bestWhere(id).replace(/ \(.*/,'')+'</b>где водится</div><div><b>'+fmtNum(d.hp)+'</b>здоровье</div><div><b style="font-size:15px">'+spd+'</b>ходит</div></div>'+
      (feat?'<p class="sub">Особенность: '+feat+'</p>':'')+(goal?'<p class="sub">До следующей звезды: одолей '+fmtNum(goal-n)+'</p>':'<p class="sub" style="color:#ffd98a">Все три звезды! Нечисть тебя боится.</p>'):'')+
    '<div class="btns"><button class="btn big" id="bOk">Закрыть книгу</button></div>');on('bOk',hideModal);}
function renderAch(){const el=$('tabQuests');let h=segHTML()+'<p class="sub">За каждое достижение — золото или облик богатыря. Облики выбираются во вкладке «Богатыри».</p>';
  const list=ACH.slice().sort((a,b)=>(S.ach[a.id]?1:0)-(S.ach[b.id]?1:0));
  for(const a of list){const got=!!S.ach[a.id],v=Math.min(a.v(),a.n),skin=typeof a.r==='string';
    h+='<div class="card" style="'+(got?'opacity:.6':'')+'"><div class="row">'+(skin?'<img class="ic" src="'+ic('hp_'+a.r,96)+'">':'<img class="ic" src="'+ic(got?'chest':'p_coin',96)+'">')+
      '<div class="t"><b>'+(got?'✓ ':'🏆 ')+a.name+'</b><span>'+a.about+'</span><span style="color:#ffd98a">Награда: '+rewardText(a.r)+'</span>'+
      (got?'':'<div class="bar"><i style="width:'+Math.round(v/a.n*100)+'%"></i></div><span>'+fmtNum(v)+' / '+fmtNum(a.n)+'</span>')+'</div></div></div>';}
  el.innerHTML=h;segBind();}
async function loadLB(){const box=$('lbBox');if(!box)return;
  if(PLAT==='vk'){on('lbVk',()=>LB.vkFriends());on('lbInv',()=>{if(!VK){toast('Позвать друзей можно в игре ВКонтакте');return;}vkSend('VKWebAppShowInviteBox',{},60000).catch(()=>{});});return;}
  if(!LB.ok()){box.innerHTML='<p class="sub" style="margin:0">Общая таблица сейчас недоступна — загляни попозже. Пока выше — твои личные рекорды.</p>';return;}
  if(!LB.authed()){box.innerHTML=S.runs<3?'<p class="sub" style="margin:0">Сходи ещё в пару походов — и сможешь потягаться с другими богатырями.</p>':'<p class="sub">Чтобы попасть в таблицу, войди в Яндекс.</p><button class="btn big" id="lbLogin">Войти</button>';if(S.runs<3)return;
    on('lbLogin',async()=>{if(await LB.login()){LB.set('endless',S.endBest||0);LB.set('kills',S.kills||0);if(wkMine().best)LB.set('weekly',weekNo()*WEEK_SCORE+wkMine().best);if(drMine().best)LB.set('daily',dayIdx()*DAY_SCORE+drMine().best);}renderQuests();});}
  const r=await LB.get(lbSeg);if(!$('lbBox'))return;
  if(r&&r.entries&&lbSeg==='weekly'&&!r.entries.some(e=>Math.floor(e.score/WEEK_SCORE)===weekNo()))r.entries=[];
  if(r&&r.entries&&lbSeg==='daily'&&!r.entries.some(e=>Math.floor(e.score/DAY_SCORE)===dayIdx()))r.entries=[];
  if(!r||!r.entries||!r.entries.length){if(LB.authed())box.innerHTML='<p class="sub" style="margin:0">Пока пусто — стань первым!</p>';return;}
  const me=r.userRank,wn=weekNo();let h='';for(const e of r.entries){if(lbSeg==='weekly'&&Math.floor(e.score/WEEK_SCORE)!==wn)continue;if(lbSeg==='daily'&&Math.floor(e.score/DAY_SCORE)!==dayIdx())continue;
    const nm=(e.player&&e.player.publicName)||'Безымянный богатырь';const sc=lbSeg==='endless'?fmtTime(e.score):lbSeg==='weekly'?fmtTime(e.score%WEEK_SCORE):lbSeg==='daily'?fmtNum(e.score%DAY_SCORE):fmtNum(e.score);
    h+='<div class="lbrow'+(e.rank===me?' me':'')+'"><b>'+e.rank+'</b><span>'+nm.replace(/[<>&]/g,'')+'</span><strong>'+sc+'</strong></div>';}
  const bx=$('lbBox');if(bx){if(LB.authed())bx.innerHTML=h;else bx.insertAdjacentHTML('beforeend',h);}}

/* ---------- карта Руси ---------- */
function chOpen(i){return i===0||!!S.done[i-1];}
function renderMap(){const el=$('tabMap');if(!chOpen(mapSel))mapSel=0;
  el.innerHTML=(S.runs?todayCard():'')+'<canvas id="mapCv"></canvas><div id="chInfo"></div><div class="gobar"><button class="btn big" id="goBtn"></button></div>';drawMap();renderChInfo();on('goBtn',()=>startRun(mapSel));
  const tb=$('todayBtn');if(tb)tb.onclick=()=>{SND.click();openToday();};
  $('mapCv').onclick=e=>{const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    for(let i=0;i<CH.length;i++){const p=CH[i].map;if(Math.hypot((p[0]-x)*r.width,(p[1]-y)*r.height)<40){if(!chOpen(i)){toast('Сначала освободи «'+CH[i-1].name+'»');return;}if(i===mapSel){SND.click();startRun(mapSel);return;}mapSel=i;SND.click();drawMap();renderChInfo();return;}}};}
function renderChInfo(){const c=CH[mapSel],hr=HERO_BY[S.hero]||HEROES[0],best=S.best[mapSel];
  $('chInfo').innerHTML='<div class="card"><div class="row"><img class="ic" src="'+ic(c.boss,110)+'" style="width:64px;height:64px"><div class="t"><b style="font-size:17px">'+c.name+(S.done[mapSel]?' <span class="tag ok" style="margin:0">Освобождено</span>':'')+'</b><span>'+c.sub+'</span>'+
    '<span>Босс: <b style="display:inline;font-size:12.5px;color:#ffb0a0">'+EN[c.boss].n+'</b>'+(best?' · рекорд '+fmtTime(best):'')+'</span></div></div></div>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic('hp_'+skinKey(hr.id),120)+'"><div class="t"><b>'+hr.name+'</b><span>'+WEAPONS[hr.weapon].name+' · '+hr.perk+'</span></div><button class="btn ghost" id="chgHero">Сменить</button></div></div>'+
    (S.curseMax?'<div class="card"><b style="font-size:14px">☠ Проклятие</b><span style="display:block;font-size:12px;color:var(--mut);margin:2px 0 8px">Нечисть сильнее, золота больше. Новое проклятие откроется, если победить в Тридевятом царстве на самом сильном из открытых.</span><div class="seg" style="margin:0">'+
      CURSES.slice(0,S.curseMax+1).map((c,i)=>'<button data-cu="'+i+'" class="'+((S.curse||0)===i?'on':'')+'">'+(i?['I','II','III','IV','V'][i-1]:'Нет')+'</button>').join('')+'</div>'+
      ((S.curse||0)?'<span style="display:block;font-size:12px;color:#ff9aa8;margin-top:6px">'+CURSES[S.curse]+': здоровье нечисти ×'+dec(curseMul(S.curse).hp,2)+', урон ×'+dec(curseMul(S.curse).dmg,2)+', золото ×'+dec(curseMul(S.curse).gold,1)+'</span>':'')+'</div>':'')+

    // сеча и испытание недели — только когда открыты (до первой победы закрытые карточки не отвлекают)
    (S.done[0]?'<div class="card" style="margin-top:14px;background:linear-gradient(135deg,rgba(255,90,90,.18),rgba(138,106,255,.18))"><div class="row"><img class="ic" src="'+ic('e_sword',96)+'"><div class="t"><b>Бесконечная сеча</b><span>'+
      'Все главы по кругу, каждые 5 минут — босс, с каждым кругом сильнее. Рекорд: '+(S.endBest?fmtTime(S.endBest):'—')+'</span></div>'+
      '<button class="btn" id="endBtn">⚔️ В бой</button></div></div>'+weeklyCard():'');
  for(const b of document.querySelectorAll('[data-cu]'))b.onclick=()=>{S.curse=+b.dataset.cu;save();SND.click();renderChInfo();};
  const gb=$('goBtn');if(gb)gb.innerHTML='<img src="'+ic('i_sword',48)+'" style="width:22px;height:22px">Выступить: '+c.name;
  on('chgHero',()=>openTab('Heroes'));on('endBtn',()=>startRun(0,true));
  on('wkBtn',()=>startRun(0,true,true));on('wkRules',openWkRules);on('wkLb',()=>{qSeg='q';lbSeg='weekly';openTab('Quests');setTimeout(()=>{const b=$('lbBox');if(b)b.scrollIntoView({block:'center'});},50);});}
/* ---------- испытание недели ---------- */
function wkMine(){return S.wk&&S.wk.w===weekNo()?S.wk:{best:0,got:0,runs:0};}
function weeklyCard(){const w=weekly(),m=wkMine(),lh=weekLeftH(),left=lh>=24?Math.floor(lh/24)+' дн. '+(lh%24)+' ч':lh+' ч',open=!!S.done[0];
  return '<div class="card wkcard"><div class="row"><img class="ic" src="'+ic(w.mod.only?WEAPONS[w.mod.only].icon:'e_perun',96)+'"><div class="t"><span class="wkhead">🏆 Испытание недели</span>'+
    '<b class="wkname">'+w.name+'</b><span class="clamp2">'+w.about+'</span></div></div>'+
    '<div class="wkstats"><div><b>'+(m.best?fmtTime(m.best):'—')+'</b>рекорд недели</div><div><b>'+(m.got?'✓':'+'+fmtNum(weeklyReward()))+'</b>'+(m.got?'награда взята':'за участие')+'</div><div><b>'+left+'</b>до смены</div></div>'+
    (open?'<div class="btns" style="flex-direction:row"><button class="btn" id="wkBtn" style="flex:2">⚔️ Испытать</button><button class="btn ghost" id="wkRules" style="flex:1">Правила</button><button class="btn ghost" id="wkLb" style="flex:1">Таблица</button></div>'
      :'<p class="sub" style="margin:8px 0 0">🔒 Откроется, когда освободишь Дремучий лес</p>')+'</div>';}
function openWkRules(){const w=weekly();showModal('<h3>'+w.name+'</h3><p class="sub" style="font-size:14px;color:#e8e4f4">'+w.about+'</p>'+
  '<div class="card" style="font-size:13px;line-height:1.5">⚔️ Выживание: главы идут по кругу, каждые 5 минут — босс, с каждым кругом сильнее.<br>🏆 Счёт — сколько продержишься. Лучший результат недели попадает в общую таблицу.<br>🎁 Награда за участие: +'+fmtNum(weeklyReward())+' золота, если продержишься хотя бы минуту (раз в неделю).<br>⏳ Правила меняются каждый понедельник.</div>'+
  '<div class="btns"><button class="btn big" id="wrGo">⚔️ Испытать</button><button class="btn ghost" id="wrOk">Понятно</button></div>');on('wrOk',hideModal);on('wrGo',()=>startRun(0,true,true));}
function drawMap(){const c=$('mapCv');if(!c)return;const r=c.getBoundingClientRect(),W=r.width||360,H=Math.min(600,W*1.38),d=Math.min(devicePixelRatio||1,2.5);c.style.height=H+'px';
  c.width=W*d;c.height=H*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';
  const sea=g.createLinearGradient(0,0,0,H);sea.addColorStop(0,'#1f4a7a');sea.addColorStop(1,'#163a62');g.fillStyle=sea;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(255,255,255,.06)';g.lineWidth=1;for(let y=12;y<H;y+=16){g.beginPath();for(let x=0;x<=W;x+=12)g.lineTo(x,y+Math.sin(x*.08+y)*2);g.stroke();}
  // суша
  const land=[[.06,.98],[.03,.75],[.08,.5],[.04,.28],[.14,.08],[.4,.02],[.7,.03],[.95,.1],[.97,.35],[.93,.6],[.98,.82],[.84,.99]];
  g.beginPath();land.forEach(([x,y],i)=>{const px=x*W,py=y*H;if(!i)g.moveTo(px,py);else{const [qx,qy]=land[i-1];g.quadraticCurveTo(qx*W,qy*H,(qx*W+px)/2,(qy*H+py)/2);}});g.closePath();
  const lg=g.createLinearGradient(0,0,0,H);lg.addColorStop(0,'#b8b08a');lg.addColorStop(1,'#a8c47a');g.fillStyle=lg;g.fill();g.strokeStyle='#f4efe2';g.lineWidth=3;g.stroke();g.save();g.clip();
  // регионы
  CH.forEach((ch,i)=>{const [x,y]=ch.map;const q=g.createRadialGradient(x*W,y*H,0,x*W,y*H,W*.3);q.addColorStop(0,rgba(ch.mc,.95));q.addColorStop(1,rgba(ch.mc,0));g.fillStyle=q;g.beginPath();g.arc(x*W,y*H,W*.3,0,TAU);g.fill();});
  // декор
  const R=mulberry(5);for(let i=0;i<44;i++){const x=R(),y=R();if(y<.05||y>.95||x<.1||x>.9)continue;const ci=clamp(Math.round((.95-y)/.12),0,7),dec=CH[ci].decor,key=dec[Math.floor(R()*dec.length)];if(key==='d_pond'||key==='d_lava')continue;
    g.save();g.translate(x*W,y*H);g.scale(.36,.36);ART[key].fn(g);g.restore();}
  g.restore();
  // деревня
  g.save();g.translate(.52*W,.975*H);g.scale(.5,.5);drawBld(g,'home');g.restore();
  // путь
  const pts=[[.52,.965]].concat(CH.map(c=>c.map));g.setLineDash([2,9]);g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.85)';g.beginPath();pts.forEach(([x,y],i)=>{if(!i)g.moveTo(x*W,y*H);else{const [px,py]=pts[i-1];g.quadraticCurveTo((px+x)/2*W+(i%2?-40:40),(py+y)/2*H,x*W,y*H);}});g.stroke();g.setLineDash([]);
  // узлы
  CH.forEach((ch,i)=>{const [x,y]=ch.map,px=x*W,py=y*H,open=chOpen(i),sel=i===mapSel,rad=sel?32:26;
    if(sel)glow(g,px,py,rad*1.8,'#ffd84a');g.beginPath();g.arc(px,py,rad,0,TAU);g.fillStyle=open?'#fff8e8':'#6a6a7a';g.fill();g.lineWidth=4;g.strokeStyle=S.done[i]?'#4ade6a':sel?'#ffc94a':'#2a2238';g.stroke();
    g.save();g.beginPath();g.arc(px,py,rad-3,0,TAU);g.clip();g.translate(px,py+rad*.25);const a=ART[ch.boss],k=rad*2.1/a.size;g.scale(k,k);if(!open)g.globalAlpha=.5;a.fn(g);g.restore(); // закрытая глава: без canvas-filter (Safari < 18 его не понимает) — тёмный круг поверх
    if(!open){g.beginPath();g.arc(px,py,rad-3,0,TAU);g.fillStyle='rgba(28,26,42,.72)';g.fill();}
    g.font='900 12px system-ui,-apple-system,sans-serif';g.textAlign='center';g.textBaseline='middle';const ty=py+rad+13;g.lineWidth=4;g.strokeStyle='rgba(20,20,40,.75)';g.strokeText((i+1)+'. '+ch.name,px,ty);g.fillStyle='#fff';g.fillText((i+1)+'. '+ch.name,px,ty);
    if(!open){g.font='18px system-ui';g.fillText('🔒',px,py);}});}

/* ---------- забег ---------- */
function startRun(chi,endless,wk,dr){ac();hideModal();document.body.classList.add('run');layout();newRun(chi,HERO_BY[S.hero]&&heroOpen(HERO_BY[S.hero])?S.hero:'dob',endless,wk,dr);musicPlay('run');YG.start();}
function togglePause(){if(!G||G.over)return;if($('modal').classList.contains('on')&&!G.pauseOpen)return;
  if(G.pauseOpen){G.pauseOpen=false;G.paused=false;hideModal();musicDuck(1);YG.start();return;}
  G.paused=true;G.pauseOpen=true;IN.on=false;YG.stop();musicDuck(.35);
  const hints=G.weapons.filter(w=>w.lvl<6).map(w=>'<b style="color:#fff">'+WEAPONS[w.id].name+'</b> + '+PASSIVES[WEAPONS[w.id].evo.need].name+' → '+WEAPONS[w.id].evo.name).join('<br>');
  showModal('<h3>Привал</h3><p class="sub">'+(G.daily?'Поход дня: '+G.daily.rule.name+' · '+G.ch.name:G.weekly?'Испытание: '+weekly().name:G.endless?'Бесконечная сеча · круг '+(G.cyc+1):G.ch.name)+' · '+fmtTime(G.t)+'</p>'+invHTML()+(hints?'<p class="sub" style="text-align:left;margin-top:8px">Эволюция: оружие 5-го уровня + оберег<br>'+hints+'</p>':'')+
    volHTML()+'<div class="btns"><button class="btn big" id="pRes">Продолжить</button><button class="btn ghost" id="pQuit">Уйти (золото сохранится)</button></div>');
  on('pRes',togglePause);volBind();
  on('pQuit',()=>{G.pauseOpen=false;musicDuck(1);endRun(false);});}
function invHTML(){let h='<div class="inv">';for(const w of G.weapons)h+='<div><img src="'+ic(w.lvl>=6?'e_'+w.id:WEAPONS[w.id].icon,76)+'"><i>'+(w.lvl>=6?'★':w.lvl)+'</i></div>';h+='</div><div class="inv">';
  for(const id in G.pas)h+='<div><img src="'+ic(PASSIVES[id].icon,76)+'"><i>'+G.pas[id]+'</i></div>';return h+'</div>';}

/* ---------- карточки умений ---------- */
// ключ карточки для «Изгнать»/«Закрепить»: оружие/оберег целиком (не уровень)
function ckey(c){return c.t==='w'||c.t==='p'?c.t+':'+c.id:'';}
// excl — ключи, которые сейчас уже лежат на столе (замена изгнанной карточки без повторов); изгнанные (G.ban) не приходят до конца похода
/* «первая эволюция — к 3-му походу» (аудит 14): пока ни одной эволюции не было (S.evoSeen пуст) и это не первый поход, не поход дня и не испытание —
   карточки пути к эволюции (оружие 3–5 ур. и его оберег) выпадают чаще и помечены 🔥, сундук вожака с 2:30 докладывает недостающий шаг */
function evoHelp(){return !!G&&!G.first&&!G.daily&&!G.weekly&&!Object.keys(S.evoSeen||{}).length;}
function evoPath(){const ws=G.weapons.filter(w=>w.lvl>=3&&w.lvl<6).sort((a,b)=>b.lvl-a.lvl);return ws;}
function evoNeedIds(){const o={};for(const w of evoPath())o[WEAPONS[w.id].evo.need]=w.id;return o;}
function rollCards(n,excl){const opts=[],ban=G.ban||{},ok=o=>!ban[ckey(o)]&&!(excl&&excl[ckey(o)]),help=evoHelp(),needP=help?evoNeedIds():{};
  for(const w of G.weapons){if(w.lvl<5)opts.push({t:'w',id:w.id,lvl:w.lvl+1,wt:help&&w.lvl>=3?2.6:1.3});else if(w.lvl===5&&G.pas[WEAPONS[w.id].evo.need])opts.push({t:'w',id:w.id,lvl:6,wt:5});}
  if(G.weapons.length<MAX_W&&!G.wk.only)for(const id in WEAPONS)if(!G.weapons.find(w=>w.id===id))opts.push({t:'w',id,lvl:1,wt:G.weapons.length<3?1.2:.8});
  const np=Object.keys(G.pas).length;for(const id in PASSIVES){const l=G.pas[id]||0;if(l>=PASSIVES[id].max||(!l&&np>=MAX_P))continue;opts.push({t:'p',id,lvl:l+1,wt:needP[id]&&!l?2.5:l?1:.75});}
  compact(opts,o=>o.lvl===6&&!(excl&&excl[ckey(o)])||ok(o)); // эволюцию изгнать нельзя
  // эволюция, если условия выполнены, предлагается всегда
  const out=opts.filter(o=>o.lvl===6).slice(0,n);for(const o of out)opts.splice(opts.indexOf(o),1);
  // помощь к первой эволюции: следующий шаг пути (уровень оружия 3–5 ур. или его оберег) всегда среди карточек
  if(help&&out.length<n){const w=evoPath()[0];if(w){const need=WEAPONS[w.id].evo.need,o=opts.find(q=>w.lvl<5?q.t==='w'&&q.id===w.id:q.t==='p'&&q.id===need&&!G.pas[need]);if(o){out.push(o);opts.splice(opts.indexOf(o),1);}}}
  while(out.length<n&&opts.length){let tot=0;for(const o of opts)tot+=o.wt;let r=rnd()*tot,i=0;for(;i<opts.length-1;i++){r-=opts[i].wt;if(r<=0)break;}out.push(opts.splice(i,1)[0]);}
  if(!out.length&&!excl){out.push({t:'gold'});if(!G.wk.noHeal)out.push({t:'heal'});}return out;}
// закреплённая карточка ещё годится? (за это время оружие могло подрасти из сундука)
function cardOk(c){if(!c)return false;if(c.t==='w'){const w=G.weapons.find(q=>q.id===c.id);if(w)return c.lvl===w.lvl+1&&(c.lvl<=5||!!G.pas[WEAPONS[c.id].evo.need]);return c.lvl===1&&G.weapons.length<MAX_W&&!G.wk.only;}
  if(c.t==='p'){const l=G.pas[c.id]||0;return c.lvl===l+1&&c.lvl<=PASSIVES[c.id].max&&(l>0||Object.keys(G.pas).length<MAX_P);}return false;}
function cardInfo(c){if(c.t==='w'){const W=WEAPONS[c.id];if(c.lvl===6)return {icon:'e_'+c.id,name:W.evo.name,desc:W.evo.about,tag:'Эволюция'};
    const near=c.lvl>=4||evoHelp()&&c.lvl>=3&&c.lvl<5?' · <i class="evo-near">'+(evoHelp()?'🔥 путь к эволюции':'приблизит эволюцию')+'</i>':'';
    return {icon:W.icon,name:W.name,desc:(c.lvl===1?W.about:W.up[c.lvl-1])+(c.lvl===5?' · потом эволюция с «'+PASSIVES[W.evo.need].name+'»':near),tag:c.lvl===1?'Новое':'Ур. '+c.lvl+'/5'};}
  if(c.t==='p'){const P=PASSIVES[c.id],ew=G.weapons.find(w=>w.lvl<6&&WEAPONS[w.id].evo.need===c.id);
    return {icon:P.icon,name:P.name,desc:P.about+(ew?' · <i class="evo-near">'+(evoHelp()&&!G.pas[c.id]?'🔥 ':'')+'нужен для эволюции «'+WEAPONS[ew.id].evo.name+'»</i>':''),tag:c.lvl===1?'Новое':'Ур. '+c.lvl+'/'+P.max};}
  if(c.t==='gold')return {icon:'p_coin',name:'Мешок золота',desc:'+25 золота',tag:''};return {icon:'pie',name:'Пирожки',desc:'Восстановить 40% здоровья',tag:''};}
function applyCard(c){if(c.t==='w'){const w=G.weapons.find(q=>q.id===c.id);if(w){w.lvl=c.lvl;
    if(c.lvl===4&&!S.evoSeen[c.id]){G.evoHint=G.evoHint||{};if(!G.evoHint[c.id]){G.evoHint[c.id]=1;const W=WEAPONS[c.id];banner('Ещё уровень — и эволюция!',W.name+' 5 ур. + '+PASSIVES[W.evo.need].name);}}if(c.lvl===6){const fst=!Object.keys(S.evoSeen).length;G.q.evos++;S.evoSeen[c.id]=1;banner(fst?'Первая эволюция!':'Эволюция!',WEAPONS[c.id].evo.name);heroSay(pick(PH.evo));SND.chest();G.shake=6;vib(60,1);
      hitStop(.14);G.fx.push({k:'pulse',own:1,t:0,dur:.9,r1:VIEW.R,evo:1});G.fx.push({k:'wave',own:1,x:G.hero.x,y:G.hero.y,t:0,dur:.6,r1:260,col:'#ffe07a'});}
      if(c.lvl===5&&G.pas[WEAPONS[c.id].evo.need])banner('Эволюция готова!','Возьми её на следующем уровне');}else G.weapons.push({id:c.id,lvl:1,t:.2,a:0});}
  else if(c.t==='p'){G.pas[c.id]=c.lvl;computeStats();if(c.lvl===1){const w=G.weapons.find(q=>q.lvl===5&&WEAPONS[q.id].evo.need===c.id);if(w)banner('Эволюция готова!',WEAPONS[w.id].evo.name+' — на следующем уровне');}}
  else if(c.t==='gold')G.gold+=25;else G.hero.hp=Math.min(G.st.maxHp,G.hero.hp+G.st.maxHp*.4);}
function cardHTML(c,i){const f=cardInfo(c);f.name=f.name.replace('Жар-','Жар\u2011');return '<button class="upc'+(c.pinned?' pinned':'')+'" data-i="'+i+'">'+(c.pinned?'<i class="pin">📌</i>':'')+'<img src="'+ic(f.icon,104)+'"><div><b>'+f.name+(f.tag?'<em class="'+(f.tag==='Новое'?'new':f.tag==='Эволюция'?'evo':'')+'">'+f.tag+'</em>':'')+'</b><span>'+f.desc+'</span></div></button>';}
// что уже в руках: оружие и обереги с уровнями
function invMini(){let h='<div class="invmini">';for(const w of G.weapons)h+='<span><img src="'+ic(w.lvl>=6?'e_'+w.id:WEAPONS[w.id].icon,56)+'"><i>'+(w.lvl>=6?'★':w.lvl+'/5')+'</i></span>';
  for(const id in G.pas)h+='<span><img src="'+ic(PASSIVES[id].icon,56)+'"><i>'+G.pas[id]+'</i></span>';return h+'</div>';}
// в самом первом походе кнопок рекламы нет первые 3 минуты
function adLate(){return !!(G&&G.first&&G.t<180);}
/* окно уровня (v13): «🚫 Изгнать» — карточка не придёт до конца похода (2 раза за поход), «📌 Закрепить» — карточка подождёт до следующего уровня,
   «Пропустить» — +10 золота вместо умения. В самом первом походе этих кнопок нет (не перегружаем новичка) */
/* «Перебрать за рекламу» (27.09, аудит 12): один раз за поход, не раньше 2:00 и не чаще чем на одном окне уровня из трёх — без рекламной кнопки на каждом окне */
function openLevelUp(){YG.stop();SND.level();guardModal();if(Math.random()<.35)heroSay(pick(PH.lvl));let cards=rollCards(G.cards),adUsed=false,mode='';
  const rrAdOk=!G.rrAd&&!adLate()&&G.t>=120&&((G.lvAd=(G.lvAd||0)+1)%3===1);
  const pin=G.pin;G.pin=null;if(pin&&cardOk(pin)){compact(cards,c=>ckey(c)!==ckey(pin));cards.unshift(Object.assign({},pin,{pinned:1}));if(cards.length>G.cards)cards.length=G.cards;}
  const tt=G.tut&&TUT[G.tut.i]&&TUT[G.tut.i].id==='card'?'<div class="tutbox">💡 '+TUT[G.tut.i].t+'</div>':'',tools=!G.first;
  const close=()=>{G.lvlQ--;hideModal();if(G.lvlQ>0)openLevelUp();else{G.paused=false;YG.start();}};
  const excl=()=>{const o={};for(const c of cards)if(ckey(c))o[ckey(c)]=1;return o;};
  const draw=()=>{showModal('<h3>Новый уровень!</h3>'+invMini()+tt+
    (mode?'<div class="tutbox mode">'+(mode==='ban'?'🚫 Выбери карточку, которую изгнать до конца похода':'📌 Выбери карточку, которая подождёт до следующего уровня')+'</div>':'')+
    '<div class="cards'+(mode?' pick-'+mode:'')+'">'+cards.map(cardHTML).join('')+'</div><div class="lvtools">'+
    (G.rerolls>0?'<button class="btn ghost" id="rr">🎲 Перебрать ('+G.rerolls+')</button>':adUsed||!rrAdOk?'':'<button class="btn ad" id="rrAd">🎬 Перебрать за рекламу</button>')+
    (tools?(G.banN>0?'<button class="btn ghost'+(mode==='ban'?' on':'')+'" id="lvBan">'+(mode==='ban'?'Отмена':'🚫 Изгнать ('+G.banN+')')+'</button>':'')+
      '<button class="btn ghost'+(mode==='pin'?' on':'')+'" id="lvPin">'+(mode==='pin'?'Отмена':'📌 Закрепить')+'</button>'+
      '<button class="btn ghost" id="lvSkip">Пропустить: +10 золота</button>':'')+'</div>');
    for(const b of document.querySelectorAll('.upc'))b.onclick=()=>{SND.click();const i=+b.dataset.i,c=cards[i];
      if(mode==='ban'){if(!ckey(c)||c.lvl===6){toast('Эту карточку изгнать нельзя');return;}G.ban[ckey(c)]=1;G.banN--;mode='';
        const ex=excl(),more=rollCards(1,ex);if(more.length)cards[i]=more[0];else cards.splice(i,1);if(!cards.length)cards=rollCards(G.cards);toast('🚫 «'+cardInfo(c).name+'» изгнан до конца похода');draw();return;}
      if(mode==='pin'){if(!ckey(c)){toast('Эту карточку закрепить нельзя');return;}for(const q of cards)delete q.pinned;G.pin={t:c.t,id:c.id,lvl:c.lvl};c.pinned=1;mode='';toast('📌 «'+cardInfo(c).name+'» подождёт до следующего уровня');draw();return;}
      if(G.pin&&ckey(G.pin)===ckey(c))G.pin=null; // выбрал закреплённую — закреп снят
      applyCard(c);tutEvent('card');if(Math.random()<.3)heroSay(pick(PH.card));close();};
    on('rr',()=>{G.rerolls--;reroll();});on('rrAd',()=>showRewarded(()=>{adUsed=true;G.rrAd=1;reroll();}));
    on('lvBan',()=>{mode=mode==='ban'?'':'ban';draw();});on('lvPin',()=>{mode=mode==='pin'?'':'pin';draw();});
    on('lvSkip',()=>{G.gold+=10;SND.coin();toast('+10 золота');close();});};
  // перебор оставляет закреплённую карточку на месте
  const reroll=()=>{const keep=cards.filter(c=>c.pinned);cards=rollCards(G.cards);if(keep.length){compact(cards,c=>ckey(c)!==ckey(keep[0]));cards.unshift(keep[0]);if(cards.length>G.cards)cards.length=G.cards;}mode='';draw();};
  draw();}
/* сундук-самогуд (v13): рулетка ~1–2,5 с со звоном, внутри 1 награда (70%), 3 (25%) или 5 (5%); с босса — золотой: 3 (80%) или 5.
   Награды выдаются по одной (rollCards(1) после каждой), поэтому готовая эволюция всегда приходит первой, а новая — может «доспеть» внутри сундука.
   Всё выдаётся сразу при открытии: «Забрать» можно нажать в любой момент — рулетка просто остановится. Спокойный режим — без мелькания: ячейки открываются по очереди */
function openChest(gold2){YG.stop();const lk=G.st.luck,r=rnd(),n=gold2?(r<.2*lk?5:3):(r<.05*lk?5:r<.3*lk?3:1);
  const gold=Math.round(randi(15,30)*G.ch.gold*ECO.coin*(gold2?3:1));G.gold+=gold;
  // помощь к первой эволюции: сундук вожака с 2:30 докладывает недостающий шаг (уровень оружия или его оберег)
  let force=null;if(!gold2&&evoHelp()&&G.t>=150){const w=evoPath()[0];if(w){const need=WEAPONS[w.id].evo.need;force=w.lvl<5?{t:'w',id:w.id,lvl:w.lvl+1}:!G.pas[need]?{t:'p',id:need,lvl:1}:null;if(force&&!cardOk(force))force=null;}}
  const got=[];for(let i=0;i<n;i++){const c=i===0&&force?force:rollCards(1)[0];if(!c)break;applyCard(c);got.push(c);}
  const tok=openChest.tok=(openChest.tok||0)+1,calm=CALM(),alive=()=>openChest.tok===tok&&$('chReel');
  const pool=Object.keys(WEAPONS).map(id=>WEAPONS[id].icon).concat(Object.keys(PASSIVES).map(id=>PASSIVES[id].icon),['p_coin','pie']);
  const title=gold2?'Золотой сундук!':'Сундук!',jack=got.length>=5?'Джекпот! ×5':got.length>=3?'Щедро! ×3':'';
  let extraUsed=false,shown=false;
  const finish=()=>{if(!alive()||shown)return;shown=true;openChest.tok++;const sl=document.querySelectorAll('#chReel .slot');got.forEach((c,i)=>{const e=sl[i];if(e&&!e.classList.contains('got')){e.classList.add('got');e.firstChild.src=ic(cardInfo(c).icon,72);}});
    $('chSub').textContent=(jack?jack+' · ':'')+'+'+gold+' золота';$('chList').innerHTML=got.map(cardHTML).join('');for(const b of document.querySelectorAll('#chList .upc'))b.style.pointerEvents='none';
    const ad=$('chAd');if(ad)ad.style.display='';SND.chest();if(got.length>=3)vib(40,1);};
  guardModal();showModal('<h3>'+title+'</h3><p class="sub" id="chSub">'+(calm?'Открываем…':'Крутится, вертится…')+'</p>'+
    '<div class="reel'+(gold2?' gold':'')+'" id="chReel">'+got.map(()=>'<div class="slot'+(calm?' calm':'')+'"><img src="'+(calm?ic('chest',72):ic(pick(pool),72))+'" alt=""></div>').join('')+'</div>'+
    '<div class="cards" id="chList"></div><div class="btns">'+(adLate()||!gold2?'':'<button class="btn ad" id="chAd" style="display:none">🎬 Ещё подарок за рекламу</button>')+'<button class="btn big" id="chOk">Забрать</button></div>');
  on('chOk',()=>{openChest.tok++;hideModal();G.paused=false;YG.start();});
  on('chAd',()=>{if(extraUsed)return;showRewarded(()=>{extraUsed=true;const more=rollCards(1);more.forEach(applyCard);got.push.apply(got,more);
    $('chList').innerHTML=got.map(cardHTML).join('');for(const b of document.querySelectorAll('#chList .upc'))b.style.pointerEvents='none';const a=$('chAd');if(a)a.remove();});});
  if(!got.length){finish();return;}
  const t0=performance.now(),stopAt=i=>(got.length===1?1300:got.length===3?850+i*450:750+i*380);let next=0;
  const spin=()=>{if(!alive())return;const now=performance.now()-t0,sl=document.querySelectorAll('#chReel .slot');
    while(next<got.length&&now>=stopAt(next)){const e=sl[next];e.classList.add('got');e.firstChild.src=ic(cardInfo(got[next]).icon,72);SND.reel();next++;}
    if(next>=got.length){setTimeout(finish,250);return;}
    if(!calm){for(let i=next;i<sl.length;i++)sl[i].firstChild.src=ic(pick(pool),72);SND.tick();}
    setTimeout(spin,calm?120:Math.min(160,70+now/30));}; // к концу рулетка замедляется
  setTimeout(spin,80);}
// касание птицы всегда радует (аудит 14): перо даром — 3 с неуязвимости после окна; три больших дара — за рекламу, по желанию
function openGift(){YG.stop();guardModal();const H=G.hero;H.inv=Math.max(H.inv,3);G.q.feather=(G.q.feather||0)+1;
  const ad='<small class="adl">🎬 за рекламу</small>';
  showModal('<h3>Жар-птица!</h3><p class="sub">🪶 Перо Жар\u2011птицы — даром: 3 секунды неуязвимости.<br>А за просмотр рекламы — дар побольше. Можно и отказаться.</p><div class="cards">'+
    '<button class="upc" data-g="chest"><img src="'+ic('chest',104)+'"><div><b>Сундук умений</b><span>Два новых умения сразу</span>'+ad+'</div></button>'+
    '<button class="upc" data-g="gold"><img src="'+ic('p_coin',104)+'"><div><b>Золотой поход</b><span>×2 золота до конца похода</span>'+ad+'</div></button>'+
    (G.wk.noHeal?'':'<button class="upc" data-g="heal"><img src="'+ic('p_livew',104)+'"><div><b>Живая вода</b><span>Полное здоровье и 5 секунд неуязвимости</span>'+ad+'</div></button>')+
    '</div><div class="btns"><button class="btn ghost" id="gNo">🪶 Взять перо · Лети себе, птичка</button></div>');
  const done=()=>{hideModal();G.paused=false;YG.start();};
  for(const b of document.querySelectorAll('[data-g]'))b.onclick=()=>{const k=b.dataset.g;showRewarded(()=>{
    if(k==='chest'){rollCards(2).forEach(applyCard);toast('Два умения получены!');}
    if(k==='gold'){G.goldMul=2;toast('Золото ×2 до конца похода!');}
    if(k==='heal'){G.hero.hp=G.st.maxHp;G.hero.inv=5;toast('Как новенький!');}
    SND.chest();done();});};
  on('gNo',done);}
function openDeath(){SND.lose();const k=G.lastBy&&EN[G.lastBy]?G.lastBy:null,free=G.first&&G.adRevive; // первый поход: подняться — бесплатно
  showModal('<h3>Богатырь пал…</h3>'+(k?'<div class="killer"><img src="'+ic(k,120)+'"><span>Кто одолел: <b>'+EN[k].n+'</b><br><small>'+pick(['Радуется, пляшет и хвастается.','Уже рассказывает всем в лесу.','Не зазнавайся, нечисть!'])+'</small></span></div>':'<p class="sub">Нечисть радуется.</p>')+
    '<p class="sub">Но ещё не всё потеряно!</p><div class="stats"><div><b>'+fmtTime(G.t)+'</b>время</div><div><b>'+G.kills+'</b>одолено</div></div><div class="btns">'+
    (free?'<button class="btn big" id="dFree">💪 Подняться (бесплатно, один раз)</button>':G.adRevive?'<button class="btn ad big" id="dRev">🎬 Подняться за рекламу</button>':'')+'<button class="btn ghost" id="dEnd">Завершить поход</button></div>');
  on('dFree',()=>{G.adRevive=false;hideModal();revive();});
  on('dRev',()=>showRewarded(()=>{G.adRevive=false;hideModal();revive();}));on('dEnd',()=>{hideModal();endRun(false);});}
// совет после поражения — самый полезный из подходящих
function lossTip(){if(!S.village.forge)return 'Построй кузницу в деревне — прокачка остаётся навсегда.';
  if((S.forge.hp||0)+(S.forge.armor||0)<3)return 'Прокачай в кузнице «Здоровье» и «Броню» — нечисти станет труднее.';
  if(!Object.keys(G.pas).length)return 'Бери обереги: Кольчуга и Молодильное яблоко спасают шкуру.';
  if(G.weapons.length<3)return 'Возьми второе и третье оружие — одним мечом толпу не удержать.';
  if(G.chi>=3&&!Object.keys(S.armory).length)return 'Загляни в Оружейную в кузнице: +10% урона за каждый уровень.';
  return pick(['Кружи вокруг толпы и не стой на месте — нечисть сама лезет под удар.','Качай оружие до 5-го уровня и бери нужный оберег — будет эволюция.','Поднимай звание богатыря — дар станет сильнее и чаще.']);}
function openResult(win){const GE=G.endless||!!G.daily; // поход дня: как сеча — глава не освобождается, «дальше» нет
  // после поражения в главе реклама даёт ×3 (27.09, аудит 12): там золота мало, а помощь нужнее
  const R=G.reward,rw=G.rw||{},XM=!win&&!GE?3:2,runT=G.t;let doubled=false,taken=false;const firstWin=win&&!GE&&!S['seen'+G.chi];if(win&&!GE)S['seen'+G.chi]=1;
  const newHero=firstWin?HEROES.find(h=>h.unlock===G.chi):null;if(newHero)S.heroNew=1;const next=win&&!GE&&G.chi+1<CH.length?CH[G.chi+1]:null;
  const skinsNew=(G.achNew||[]).filter(a=>typeof a.r==='string'),achGold=(G.achNew||[]).filter(a=>typeof a.r!=='string');
  const big=(img,t,s)=>'<div class="unlock"><img src="'+img+'"><div><b>'+t+'</b><span>'+s+'</span></div></div>';
  const forgeFirst=!S.village.forge&&!GE; // кузницы нет — главный шаг после похода: построить её
  const draw=()=>{const cur=doubled?R*XM:R,loss=!win&&!GE,k=G.lastBy&&EN[G.lastBy]?G.lastBy:null;
    const title=G.daily?(G.newRec?'🏆 Лучший поход дня!':'Поход дня окончен'):G.weekly?(G.newRec?'🏆 Рекорд недели!':'Испытание окончено'):G.endless?(G.newRec?'🏆 Новый рекорд!':'Сеча окончена'):win?'🎉 Победа! 🎉':'Поход окончен';
    const sub=G.daily?'Очки: '+fmtNum(G.drScore)+' · лучшие сегодня '+fmtNum(drMine().best):G.weekly?weekly().name+': время '+fmtTime(G.t)+' · рекорд недели '+fmtTime(wkMine().best):G.endless?'Время '+fmtTime(G.t)+', боссов повержено: '+(G.bossesKilled||0)+' · рекорд '+fmtTime(S.endBest):win?'Земля «'+G.ch.name+'» освобождена!':'Золото из похода остаётся с тобой';
    const parts=[['coins','подобрано'],['kills','за нечисть'],['time','за время'],['boss',G.endless?'за боссов':'за босса'],['loot','🎁 добыча']].filter(([k2])=>rw[k2]>0).map(([k2,n])=>'<span>'+n+' <b>+'+fmtNum(rw[k2]*(doubled?XM:1))+'</b></span>').join('');
    showModal((win&&!GE?'<div class="confetti">'+Array.from({length:14},(_,i)=>'<i style="left:'+(i*7+3)+'%;animation-delay:'+(i%5*.25)+'s;background:'+['#ffd84a','#ff6a3d','#6ae0ff','#8af0a0','#b86bff'][i%5]+'"></i>').join('')+'</div>':'')+
      '<h3>'+title+'</h3><p class="sub">'+sub+'</p>'+
      '<div class="stats"><div><b>'+fmtTime(G.t)+'</b>время</div><div><b>'+G.kills+'</b>одолено нечисти</div><div><b>'+G.hero.lvl+'</b>уровень</div><div><b style="color:var(--gold)">'+fmtNum(cur)+'</b>золота</div></div>'+
      (parts?'<div class="rwparts">'+parts+'</div>':'')+
      (loss&&k?'<div class="killer"><img src="'+ic(k,120)+'"><span>Кто одолел: <b>'+EN[k].n+'</b><br><small>💡 '+lossTip()+'</small></span></div>':loss?'<div class="tutbox">💡 '+lossTip()+'</div>':'')+
      (newHero?big(ic('hp_'+newHero.id,160),'Новый богатырь!',newHero.name+' теперь с тобой. Дар: '+newHero.dar.name):'')+
      skinsNew.map(a=>big(ic('hp_'+a.r,160),'Новый облик!','«'+rewardText(a.r).replace(/^облик «|»$/g,'')+'» — '+a.name)).join('')+
      (next&&firstWin?big(ic(next.boss,160),'Открыта глава '+(G.chi+2)+'!',next.name+(G.chi===0?' · и ⚔️ Бесконечная сеча — все главы по кругу':' — '+next.sub)):'')+
      (achGold.length?'<div class="qdone" style="color:#ffd98a">🏆 '+achGold.map(a=>a.name).join(', ')+': +'+fmtNum(achGold.reduce((q,a)=>q+a.r,0))+' золота</div>':'')+
      (G.drGold?'<div class="qdone" style="color:#ffd98a">🎁 Награда за поход дня: +'+fmtNum(G.drGold)+' золота (уже у тебя)</div>':'')+(G.wkReward?'<div class="qdone" style="color:#ffd98a">🏆 Награда за испытание недели: +'+fmtNum(G.wkReward)+' золота (уже у тебя)</div>':'')+
      (G.bestNew&&G.bestNew.length&&!(G.questDone&&G.questDone.length)?'<div class="qdone" style="color:#bfe0ff">📖 В Книгу нечисти записано: '+G.bestNew.slice(0,3).map(bestName).join(', ')+(G.bestNew.length>3?' и ещё '+(G.bestNew.length-3):'')+'</div>':'')+
      (G.curseUp?'<div class="qdone" style="color:#ff9aa8">☠ Открыто: '+CURSES[G.curseUp]+' — нечисть сильнее, золота больше</div>':'')+
      (G.questDone&&G.questDone.length?(G.questDone.length===1&&!(G.bestNew&&G.bestNew.length)?'<div class="qdone">✓ Задание выполнено: '+G.questDone[0]+'</div>':
        '<div class="qdone">✓ Заданий выполнено: '+G.questDone.length+(G.bestNew&&G.bestNew.length?' · <span style="color:#bfe0ff">📖 +'+G.bestNew.length+' в Книгу нечисти</span>':'')+'</div>'):'')+
      (!doubled&&R>=ECO.x2min&&(()=>{const u=cheapestIn(upList(),S.gold,S.gold+(XM-1)*R);return u?'<div class="qdone" style="color:#ffd98a">🎬 С ×'+XM+' хватит на «'+(u.n.length>24?u.n.slice(0,22)+'…':u.n)+'» ('+fmtNum(u.c)+')</div>':'';})()||'')+
      (()=>{const ls=loginState();return ls.ready?'<div class="qdone" style="color:#bfe0ff">🎁 Награда за вход ждёт — «Дела на сегодня» на карте</div>':'<div class="qdone" style="color:#bfe0ff">📅 Завтра: день '+(ls.n%7+1)+' — '+rewardText(loginReward(ls.n%7+1))+'. Заходи!</div>';})()+
      (forgeFirst&&!loss?'<div class="tutbox">💡 Золото — в кузницу: там прокачка остаётся навсегда, и следующая глава пойдёт легче.</div>':'')+
      // кнопки прижаты к низу окна (видны без прокрутки); главная — бесплатная, «×2/×3 за рекламу» — вторая (аудит 14)
      '<div class="btns stick">'+
      (forgeFirst?'<button class="btn gold big" id="rForge">Забрать '+fmtNum(cur)+' · '+(S.gold>=BLD[0].cost[0]?'Построить кузницу':'В деревню')+' ➜</button>':
      next?'<button class="btn big" id="rNext">Забрать '+fmtNum(cur)+' · Дальше: '+next.name+' ➜</button>':'<button class="btn big" id="rOk">Забрать '+fmtNum(cur)+'</button>')+
      (doubled||R<ECO.x2min?'':'<button class="btn ad" id="rX2">🎬 Забрать ×'+XM+' ('+fmtNum(R*XM)+') за рекламу</button>')+
      (forgeFirst&&next?'<button class="btn ghost" id="rNext">Дальше: '+next.name+'</button>':'')+
      (G.daily&&(PLAT==='vk'?!!VK:LB.ok())?'<button class="btn gold" id="rLb">🏆 '+(PLAT==='vk'?'Таблица друзей':'Рейтинг дня')+'</button>':'')+'</div>');
    on('rX2',()=>showRewarded(()=>{if(taken||doubled)return;doubled=true;S.gold+=(XM-1)*R;save();SND.chest();draw();}));
    const take=()=>{if(taken)return false;taken=true;save();return true;}; // золото похода уже зачислено в endRun
    const after=win&&!GE?askReturn:null;
    // в меню; мягкая межэкранная — сразу после итогов, пока игрок ещё не в новом походе (правила — interReady в core.js)
    const go=(tab,aft)=>{const ad=interReady(runT);toMenu(tab,ad?null:aft);if(ad)showInterstitial();};
    on('rNext',()=>{if(!take())return;mapSel=G.chi+1;go('Map',after);});
    on('rForge',()=>{if(!take())return;if(next)mapSel=G.chi+1;go('Village');if(S.gold>=BLD[0].cost[0])toast('Хватает на кузницу — жми «'+fmtNum(BLD[0].cost[0])+'»!');});
    on('rLb',()=>{if(PLAT==='vk'){LB.vkFriends();return;}if(!take())return;qSeg='q';lbSeg='daily';go('Quests');setTimeout(()=>{const b=$('lbBox');if(b)b.scrollIntoView({block:'center'});},80);});
    on('rOk',()=>{if(!take())return;go(S.village.forge||GE?'Map':'Village',after);});};
  draw();save();}
// после победы (с 3-го похода) — одно предложение за сессию: ярлык/оценка на Яндексе, избранное/экран/друзья в VK
async function askReturn(){if(ASK.session||S.runs<3||G)return;let o=null;try{o=await ASK.next();}catch(e){}if(!o||G||$('modal').classList.contains('on'))return;
  ASK.session=true;S.ask[o.k]=Date.now();save();
  showModal('<h3>Отличный поход!</h3><p class="sub" style="font-size:14px">'+o.t+'</p><div class="btns"><button class="btn big" id="askGo">'+o.b+'</button><button class="btn ghost" id="askNo">Не сейчас</button></div>');
  on('askGo',()=>{hideModal();try{Promise.resolve(o.run()).catch(()=>{});}catch(e){}});on('askNo',hideModal);}
/* ---------- запуск ---------- */
// VK: облако пришло позже меню и оно новее — обновить экран
// 27.09 казна стала скромнее: уже накопленное по старой ставке не отнимаем — доплачиваем разницу один раз
function ecoMigrate(){if(S.eco>=2)return;S.eco=2;const v=S.village;if(!v.mill||!S.afkT)return;let lv=0;for(const k in v)lv+=v[k];
  const h=afkH(),old=Math.round((20+6*lv+30*(v.mill||0)+20*Object.keys(S.done).length)*(1+.25*(v.fair||0)));
  const d=Math.floor(h*old)-afkGold();if(d>0){S.gold+=d;}save();}
// облако пришло позже меню и оно добавило прогресс — обновить экран
function onCloud(){if(G)return;ecoMigrate();for(const i in S.done)if(CH[i])S.bossKill[CH[i].boss]=1;sndIcon();volApply();
  if(S.runs&&curTab==='Village'&&!firstGo)curTab='Map';openTab(curTab);if(S.runs)openToday(true);}
function onReady(){$('loading').style.display='none';ecoMigrate();musicPlay('menu');for(const i in S.done)if(CH[i])S.bossKill[CH[i].boss]=1;openTab(S.runs?'Map':'Village');achCheck();
  if(!S.runs)firstStart();else setTimeout(()=>openToday(true),400);}
// новичок — сразу в первый поход (без деревни и меню). Облако ждём до 3 с: вдруг прогресс есть на другом устройстве
let firstGo=false;
function firstStart(){if(/[?&](bot|promo)\b/.test(location.search))return;const t0=Date.now(),tick=()=>{if(G||S.runs)return;if(cloudReady||Date.now()-t0>3000){if(!$('modal').classList.contains('on')){firstGo=true;startRun(0);}return;}setTimeout(tick,150);};tick();}
(function boot(){cv=$('cv');ctx=cv.getContext('2d');initInput();layout();
  if(S.calm==null)S.calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?1:0; // «спокойный режим» по настройке телефона
  $('goldIc').src=ic('coin',48);$('nav1').src=ic('d_oak',60);$('nav2').src=ic('i_sword',60);$('nav3').src=ic('i_mace',60);$('nav4').src=ic('hp_dob',60);$('nav5').src=ic('chest',60);
  for(const b of document.querySelectorAll('nav button'))b.onclick=()=>{SND.click();openTab(b.dataset.tab);};
  sndIcon();$('sndBtn').onclick=()=>{SND.click();openSettings();};$('tipX').onclick=e=>{e.stopPropagation();tutSkip();toast('Обучение пропущено. Удачи, богатырь!');};
  // звук разрешается жестом: на сенсорных экранах жест — это touchend/click, а не pointerdown (iOS < 15)
  for(const ev of['pointerdown','touchend','click','keydown'])document.addEventListener(ev,()=>{if(!muted)ac();},{capture:true,passive:true});
  // долгий тап / правый клик не открывают меню браузера (требование площадок); щипок на iOS не увеличивает страницу
  document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('dragstart',e=>e.preventDefault());document.addEventListener('gesturestart',e=>e.preventDefault());
  $('pauseBtn').onclick=()=>{SND.click();togglePause();};
  const onResize=()=>{layout();if(!G){if(curTab==='Village')drawVillage();if(curTab==='Map')drawMap();}};
  window.addEventListener('resize',onResize);window.addEventListener('orientationchange',()=>setTimeout(onResize,300)); // iOS иногда отдаёт старые размеры в resize
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(G&&!G.over&&!G.paused&&!$('modal').classList.contains('on'))togglePause(); // вернулся — «Привал», а не сразу в толпу
    paused=true;setMuted(true);cloudFlush();}else if(!adShowing){paused=false;setMuted(false);}});
  // клавиатура (ПК): 1–4 — выбрать карточку умения, Enter — в поход с карты
  window.addEventListener('keydown',e=>{const m=$('modal').classList.contains('on');
    if(m&&/^Digit[1-4]$/.test(e.code)){const b=document.querySelector('.upc[data-i="'+(+e.code.slice(5)-1)+'"]');if(b&&b.onclick){e.preventDefault();b.click();}}
    else if(!m&&!G&&e.code==='Enter'&&curTab==='Map'){e.preventDefault();startRun(mapSel);}});
  const QS=new URLSearchParams(location.search);if(QS.has('demo'))window.__demo=1;
  if(QS.has('bot')){const b=document.createElement('script');b.src='tools/bot.js';document.head.appendChild(b);}
  if(QS.has('promo')){const b=document.createElement('script');b.src='tools/promo.js';document.head.appendChild(b);} // картинки для магазина (только локально)
  requestAnimationFrame(loop);
  onReady(); // меню — сразу, не дожидаясь SDK и облака (и в Яндексе, и в VK)
  if(PLAT==='vk'){initSDK();return;} // VK: мост грузится внутри initSDK
  const s=document.createElement('script');s.src='/sdk.js';s.async=true;let sdkGo=false;const go=()=>{if(sdkGo)return;sdkGo=true;initSDK();};s.onload=s.onerror=go;setTimeout(go,20000);document.head.appendChild(s);})(); // ждём SDK до 20 с
window.__test={startRun,update:dt=>update(dt),render:()=>render(),get G(){return G;},S:()=>S,layout};
