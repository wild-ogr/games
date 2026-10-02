'use strict';
/* ================= Меню, окна, интерфейс боя ================= */
let curTab='Map',mapSel=0;
// общие подписи на двух языках (js/lang.js)
const VOEV=()=>Lg('Воевода Потап','Commander Potap');
const lvLbl=n=>Lg(n+' ур.','lv '+n);
const BREF=()=>Lg('⏩ Ускорение: возвращено ','⏩ Speed-up refunded: ');
function showModal(html){if(typeof PAY!=='undefined')PAY.re=null;$('mBody').innerHTML=html;$('modal').classList.add('on');$('mBody').scrollTop=0;}
function hideModal(){$('modal').classList.remove('on');}
function on(id,fn){const el=$(id);if(el)el.onclick=e=>{SND.click();fn(e);};}
function ic(key,px){return iconURL(key,px||96);}
function swordImg(){return '<img src="'+ic('swords',48)+'" alt="">';}
function starsTotal(){let n=0;for(const k in S.stars)n+=S.stars[k];return n;}
function starsSpent(){let n=0;for(const t of TW_ORDER)for(const [k,c] of FORGE_ORDER[t])if(fHas(t,k))n+=c;for(const x of FORGE_EXTRA)for(let i=0;i<forgeN(x.k);i++)n+=x.cost[i];return n;}
function starsFree(){return starsTotal()-starsSpent();}
function lvKey(c,l){return c+'-'+l;}
function lvOpen(c,l){if(c===0&&l===0)return true;if(l>0)return !!S.stars[lvKey(c,l-1)];return !!S.stars[lvKey(c-1,5)];}
function chOpen(c){return lvOpen(c,0);}
function chStars(c){let n=0;for(let l=0;l<6;l++)n+=S.stars[lvKey(c,l)]||0;return n;}
// красная точка — только там, где правда ждёт дело, и не на открытой вкладке (раньше горели все четыре сразу — аудит 14)
function setPills(){forgeGuard();$('pGold').textContent=fmtNum(S.gold);$('pStar').textContent=starsFree();const cur=G?'':curTab;
  $('navF').classList.toggle('dot',cur!=='Forge'&&canForge());$('navV').classList.toggle('dot',cur!=='Village'&&(afkGold()>=afkReadyAt()||giftReady()));
  $('navM').classList.toggle('dot',cur!=='Map'&&(dqClaimable()||!!loginAvail()));$('navS').classList.toggle('dot',cur!=='Siege'&&eventsReady());}
// звёзд потрачено больше, чем есть (кузница пришла из облака с другого устройства) — сбрасываем кузницу, звёзды возвращаются
function forgeGuard(){if(starsFree()>=0)return;S.forge={};S.forgeT=nowMs();save();toast(Lg('Кузница сброшена — звёзды вернулись','Forge reset — your stars are back'));}
function forgeCan(t,k){const need=FORGE_T[k].need;return !fHas(t,k)&&(!need||fHas(t,need));}
function canForge(){const f=starsFree();for(const t of TW_ORDER)for(const [k,c] of FORGE_ORDER[t])if(forgeCan(t,k)&&c<=f)return true;return false;}

/* ---------- вкладки ---------- */
function openTab(t){curTab=t;for(const s of document.querySelectorAll('.tab'))s.classList.toggle('on',s.id==='tab'+t);
  for(const b of document.querySelectorAll('nav button'))b.classList.toggle('on',b.dataset.tab===t);
  ({Map:renderMap,Forge:renderForge,Village:renderVillage,Siege:renderSiege})[t]();setPills();}
function toMenu(tab){const won=!!(G&&G.win&&!G.endless);if(G&&!G.win){boostRefund(.5);save();}G=null;cloudApply();document.body.classList.remove('run');closeRing();hideModal();$('voice').classList.remove('on');musicMode('menu');openTab(tab||curTab);
  if(!loginOffer()&&won)setTimeout(retOffer,700);}

/* ================= КАРТА ================= */
const MAPPOS=[[.26,.84],[.72,.74],[.3,.63],[.72,.52],[.28,.41],[.72,.3],[.3,.19],[.66,.08]];
const mapCache={};
function artCanvas(key,px){const id=key+'@'+px;return mapCache[id]||(mapCache[id]=drawArt(key,px));}
function renderMap(){const el=$('tabMap');
  let first=0;for(let c=0;c<CH.length;c++)if(chOpen(c))first=c;if(mapSel==null||!chOpen(mapSel))mapSel=first;
  el.innerHTML='<div id="tdBox"></div><div id="glBox"></div><div class="mapcols"><canvas id="mapCv"></canvas><div class="mapside"><div id="chCard"></div><div id="dqBox"></div></div></div>';renderToday();renderGoal();drawMap();renderChCard();renderQuests();
  $('mapCv').onclick=e=>{const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    let best=-1,bd=.012;MAPPOS.forEach((p,i)=>{const d=(p[0]-x)**2+((p[1]-y)*1.3)**2;if(d<bd){bd=d;best=i;}});
    if(best>=0){SND.click();if(!chOpen(best)){toast(Lg('Сначала освободи «'+CH[best-1].name+'»','First free “'+CH[best-1].name+'”'));return;}mapSel=best;S.lastCh=best;drawMap();renderChCard();}};}
function drawMap(cvm,W,d){cvm=cvm||$('mapCv');if(!cvm)return;const fixed=!!W;W=W||cvm.clientWidth||340;const H=Math.round(fixed?W*1.2:innerWidth>=880?Math.max(300,Math.min(W*1.2,innerHeight-190)):Math.min(W*1.2,Math.max(250,innerHeight*.44)));d=d||Math.min(2.5,window.devicePixelRatio||1);cvm.width=W*d;cvm.height=H*d;cvm.style.height=H+'px';
  const g=cvm.getContext('2d');g.setTransform(d,0,0,d,0,0);
  const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#d8c090');bg.addColorStop(1,'#ecdcae');g.fillStyle=bg;g.fillRect(0,0,W,H);
  const R0=mulberry(42);
  for(let c=0;c<CH.length;c++){const [px,py]=MAPPOS[c],x=px*W,y=py*H;const q=g.createRadialGradient(x,y,0,x,y,W*.42);q.addColorStop(0,rgba(CH[c].ground.base,.95));q.addColorStop(.55,rgba(CH[c].ground.base,.55));q.addColorStop(1,rgba(CH[c].ground.base,0));g.fillStyle=q;g.fillRect(0,0,W,H);}
  for(let c=0;c<CH.length;c++){const [px,py]=MAPPOS[c];for(let i=0;i<7;i++){const key=CH[c].decor[i%CH[c].decor.length];if(key==='d_pond'||key==='d_lava')continue;const a=R0()*TAU,rr=W*(.13+R0()*.14),x=px*W+Math.cos(a)*rr,y=py*H+Math.sin(a)*rr*.6;
      if(x<10||x>W-10)continue;const s=artCanvas(key,64),sz=W*.085;g.drawImage(s,x-sz/2,y-sz/2,sz,sz);}}
  // река Смородина поперёк
  g.strokeStyle='rgba(60,130,190,.55)';g.lineWidth=W*.03;g.lineCap='round';g.beginPath();g.moveTo(0,H*.62);g.bezierCurveTo(W*.3,H*.58,W*.6,H*.66,W,H*.6);g.stroke();
  // дорога
  const pts=MAPPOS.map(p=>[p[0]*W,p[1]*H]);let done=0;for(let c=0;c<CH.length;c++)if(S.stars[lvKey(c,5)])done=c+1;
  const seg=(i)=>{const [a,b]=[pts[i],pts[i+1]];g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo((a[0]+b[0])/2+(i%2?-1:1)*W*.12,(a[1]+b[1])/2,b[0],b[1]);};
  for(let i=0;i<pts.length-1;i++){seg(i);g.setLineDash(i<done?[]:[7,7]);g.lineWidth=i<done?5:3.5;g.strokeStyle=i<done?'#c0392b':'rgba(90,60,30,.6)';g.stroke();}g.setLineDash([]);
  g.textAlign='center';g.textBaseline='middle';
  for(let c=0;c<CH.length;c++){const [x,y]=pts[c],open=chOpen(c),sel=c===mapSel,r=Math.min(W*.085,H*.068);
    if(sel){const q=g.createRadialGradient(x,y,r*.6,x,y,r*1.8);q.addColorStop(0,'rgba(255,230,120,.9)');q.addColorStop(1,'rgba(255,230,120,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r*1.8,0,TAU);g.fill();}
    g.beginPath();g.arc(x,y+3,r,0,TAU);g.fillStyle='rgba(0,0,0,.25)';g.fill();
    const q=g.createRadialGradient(x-r*.3,y-r*.4,2,x,y,r);q.addColorStop(0,shade(CH[c].mc,.35));q.addColorStop(1,shade(CH[c].mc,-.35));
    g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle=open?q:'#6a6a78';g.fill();g.lineWidth=3.5;g.strokeStyle=open?'#f0c24a':'#4a4a58';g.stroke();
    const s=open?artCanvas(CH[c].boss,128):silhouette(CH[c].boss);g.save();g.beginPath();g.arc(x,y,r-2,0,TAU);g.clip();g.drawImage(s,x-r*1.15,y-r*1.1,r*2.3,r*2.3);g.restore();
    if(!open){g.font='900 '+(r*.8)+'px system-ui';g.fillText('🔒',x,y);}
    const lbl=(c+1)+'. '+CH[c].name;const fs=Math.round(r*.45);g.font='900 '+fs+'px system-ui,sans-serif';g.lineWidth=fs*.3;g.strokeStyle='rgba(255,248,230,.95)';g.strokeText(lbl,x,y+r+fs*.8);g.fillStyle='#3a2410';g.fillText(lbl,x,y+r+fs*.8);
    if(open&&chStars(c)){const st=chStars(c)+'/18 ★';g.font='800 '+Math.round(fs*.85)+'px system-ui';g.textAlign='left';g.strokeStyle='rgba(255,248,230,.95)';g.strokeText(st,x+r*1.05,y-r*.2);g.fillStyle='#a0501a';g.fillText(st,x+r*1.05,y-r*.2);g.textAlign='center';}
    if(S.stars[lvKey(c,5)]){g.font='900 '+Math.round(r*.7)+'px system-ui';g.fillText('✅',x+r*.75,y-r*.75);}}
  const v=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.75);v.addColorStop(0,'rgba(80,40,10,0)');v.addColorStop(1,'rgba(80,40,10,.35)');g.fillStyle=v;g.fillRect(0,0,W,H);}
function renderChCard(){const c=mapSel,ch=CH[c];let nl=0;for(let l=0;l<6;l++)if(lvOpen(c,l)&&!S.stars[lvKey(c,l)]){nl=l;break;}else if(lvOpen(c,l))nl=l;
  let h='<div class="card"><div class="row"><img class="ic" src="'+ic(ch.boss)+'" style="width:44px;height:44px"><div class="t"><b>'+(c+1)+'. '+ch.name+'</b><span>'+ch.sub+'</span></div>'+
    '<button class="btn" id="playNext">'+swordImg()+(S.stars[lvKey(c,nl)]?Lg('Ещё','Again'):Lg('Играть','Play'))+'</button></div><div class="lvls">';
  let nextSet=false;
  for(let l=0;l<6;l++){const open=lvOpen(c,l),st=S.stars[lvKey(c,l)]||0,next=open&&!st&&!nextSet;if(next)nextSet=true;
    h+='<button class="lvl th'+(l===5?' boss':'')+(open?'':' lock')+(next?' next':'')+'" data-l="'+l+'" style="background-image:url('+lvThumb(c,l)+')">'+(S.crown[lvKey(c,l)]?'<i class="cr">👑</i>':'')+'<span class="n">'+(l===5?'☠':l+1)+'</span><span>'+ch.levels[l]+'</span><span class="st3">'+
      [0,1,2].map(i=>'<img src="'+ic(i<st?'star':'star0',40)+'">').join('')+'</span></button>';}
  h+='</div></div>';$('chCard').innerHTML=h;
  on('playNext',()=>openIntro(c,nl));
  for(const b of document.querySelectorAll('.lvl'))b.onclick=()=>{SND.click();const l=+b.dataset.l;if(!lvOpen(c,l)){toast(Lg('Сначала пройди предыдущий уровень','Beat the previous level first'));return;}openIntro(c,l);};}

// миниатюра уровня (boost): настоящая карта уровня — дорога, река, места — фоном плитки; у босса — его портрет. Рисуется один раз
function lvThumb(c,l){const id='th'+c+'-'+l;if(mapCache[id])return mapCache[id];const W=150,H=110,cvs=document.createElement('canvas');cvs.width=W;cvs.height=H;
  try{const g=cvs.getContext('2d'),m=levelMap(c,l),th=CH[c],k=W/WW,oy=-(WH*k-H)/2;g.fillStyle=th.ground.base;g.fillRect(0,0,W,H);g.setTransform(k,0,0,k,0,oy);g.lineJoin='round';g.lineCap='round';
    if(m.river>=0){g.fillStyle='#3a8ac0';g.fillRect(0,m.river*CELL,WW,CELL);}
    for(const [w,col] of[[40,th.road.edge],[30,th.road.fill]])for(const P of m.paths){g.beginPath();g.moveTo(P.xs[0],P.ys[0]);for(let i=4;i<P.xs.length;i+=4)g.lineTo(P.xs[i],P.ys[i]);g.lineWidth=w;g.strokeStyle=col;g.stroke();}
    for(const sp of m.spots){g.beginPath();g.arc(sp.x,sp.y,11,0,TAU);g.fillStyle='rgba(60,36,14,.55)';g.fill();}
    g.setTransform(1,0,0,1,0,0);if(l===5)g.drawImage(artCanvas(th.boss,128),W-84,H-92,96,96);
    const q=g.createLinearGradient(0,0,0,H);q.addColorStop(0,'rgba(14,16,34,.5)');q.addColorStop(1,'rgba(14,16,34,.74)');g.fillStyle=q;g.fillRect(0,0,W,H);
    return mapCache[id]=cvs.toDataURL('image/jpeg',.82);}catch(e){return mapCache[id]='';}}
/* ---------- boost: «Сегодня» — что ждёт игрока (вход, задания, казна, испытание дня, Босс недели); золотым — где есть что забрать ---------- */
function renderToday(){const box=$('tdBox');if(!box)return;if(!S.wins){box.innerHTML='';return;}const a=[];
  const L=S.login,x=loginAvail(),day=x?x.idx+1:L&&L.n?((L.n-1)%7)+1:1;
  a.push({id:'login',hot:!!x,t:Lg('📅 День '+day+' из 7','📅 Day '+day+' of 7')});
  const D=dqToday(),dn=D.list.filter(q=>q.got).length;a.push({id:'dq',hot:dqClaimable(),t:Lg('🎁 Задания ','🎁 Quests ')+dn+'/3'});
  const g=afkGold();a.push({id:'afk',hot:g>=afkReadyAt(),t:Lg('💰 Казна ','💰 Treasury ')+fmtNum(g)});
  if(S.stars['0-5']){const d=dchToday();if(d&&!d.tried&&!d.res)a.push({id:'dch',hot:1,t:Lg('⚔ Испытание дня','⚔ Daily challenge')});
    const m=wkMine();if(!m.got)a.push({id:'wk',hot:!m.runs,t:Lg('👑 Босс недели','👑 Boss of the Week')});}
  else a.push({id:'lock',hot:0,t:Lg('🔒 Испытания — после босса главы','🔒 Trials — after the chapter boss')});
  box.innerHTML='<div class="chips">'+a.map(c=>'<button class="chip'+(c.hot?' hot':'')+'" data-td="'+c.id+'">'+c.t+'</button>').join('')+'</div>';
  for(const b of box.querySelectorAll('[data-td]'))b.onclick=()=>{SND.click();const k=b.dataset.td;
    if(k==='login'){if(!loginOffer())toast(Lg('Сегодня награда взята. Завтра за вход: +','Today’s reward is taken. Tomorrow’s login reward: +')+fmtGold(loginTomorrow()));}
    else if(k==='dq'){const q=$('dqBox');if(q)q.scrollIntoView({block:'center'});}
    else if(k==='afk')openTab('Village');else if(k==='dch'||k==='wk')openTab('Siege');
    else toast(Lg('Победи Соловья-Разбойника (уровень 6) — откроются осада, испытание дня и Босс недели','Defeat Nightingale the Robber (level 6) to unlock the siege, the daily challenge and the Boss of the Week'));};}

/* ---------- заход 2: долгая цель — полоса «Копим на…» на карте. Цель: выбранное игроком знамя (S.goal), иначе самое дешёвое из некупленного ---------- */
function bannerURL(i,px){px=px||96;const id='bn'+i+'@'+px;if(mapCache[id])return mapCache[id];const c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d');drawBanner(g,px*.26,px*.94,px*.8,BANNERS[i],0);return mapCache[id]=c.toDataURL();}
function goalList(){const a=[];for(const b of BLD){const l=S.village[b.id]||0;if(l<b.cost.length)a.push({id:'v:'+b.id,n:b.name+(l?' · '+lvLbl(l+1):''),c:b.cost[l],img:ic(b.ic,64)});}
  BANNERS.forEach((b,i)=>{if(bnOpen(i)&&!bnOwn(i))a.push({id:'b:'+b.id,n:b.n,c:b.cost,img:bannerURL(i,64)});});return a;}
function goalNow(){const a=goalList();if(!a.length)return null;return a.find(x=>x.id===S.goal)||a.sort((x,y)=>x.c-y.c)[0];}
function renderGoal(){const box=$('glBox');if(!box)return;const t=S.wins?goalNow():null;if(!t){box.innerHTML='';return;}const ok=S.gold>=t.c,p=Math.min(100,Math.round(S.gold/t.c*100));
  box.innerHTML='<button class="glbar'+(ok?' hot':'')+'" id="glGo"><img src="'+t.img+'" alt=""><span class="t"><b>'+(ok?Lg('Хватает на: ','You can afford: '):Lg('Копим на: ','Saving for: '))+t.n+'</b><span class="bar"><i style="width:'+p+'%"></i></span></span><em>'+(ok?Lg('Купить ›','Buy ›'):fmtNum(S.gold)+' / '+fmtNum(t.c))+'</em></button>';
  on('glGo',()=>{openTab('Village');const e=t.id[0]==='b'?$('bnBox'):document.querySelector('[data-b="'+t.id.slice(2)+'"]');if(e){if(t.id[0]==='v')e.classList.add('hl');e.scrollIntoView({block:'center'});}});}
// знамёна дружины в деревне: купить, поднять, выбрать целью; наборы 3/5/8 — ускорение
function bannersHTML(){const n=bnCount(),nx=BN_SETS.find(q=>q[0]>n);
  let h='<h2 id="bnBox">'+Lg('Знамёна дружины','Banners of the host')+'</h2><p class="sub">'+Lg('Знамя реет над воротами в каждом бою — только для красоты и славы. Знамя главы открывается, когда глава освобождена. Собрано '+n+' из '+BANNERS.length+'.','A banner flies over the gate in every battle — just for beauty and glory. A chapter’s banner unlocks when the chapter is freed. Collected '+n+' of '+BANNERS.length+'.')+(nx?' '+Lg('За '+nx[0]+' '+plw(nx[0],'знамя','знамени','знамён')+' воевода даст +'+fmtBoost(nx[1])+' ⏩.','For '+nx[0]+' banners the commander gives +'+fmtBoost(nx[1])+' ⏩.'):'')+'</p><div class="blds">';
  BANNERS.forEach((b,i)=>{const own=bnOwn(i),open=bnOpen(i),up=S.bn===b.id&&own;
    h+='<div class="card bld'+(own?' has':'')+(open?' pv':'')+'"><img src="'+bannerURL(i,112)+'" alt=""><b>'+b.n+'</b>'+
      (own?(up?'<span class="tag ok">'+Lg('Реет над воротами','Flying over the gate')+'</span>':'<button class="btn" data-bu="'+i+'">'+Lg('Поднять','Raise')+'</button>')
        :!open?'<span class="note">'+Lg('🔒 Освободи «'+CH[i].name+'»','🔒 Free “'+CH[i].name+'”')+'</span>'
        :'<button class="btn gold" data-bb="'+i+'" '+(S.gold<b.cost?'disabled':'')+'><img src="'+ic('ingot',40)+'">'+fmtNum(b.cost)+'</button>'+(S.gold<b.cost?(S.goal==='b:'+b.id?'<span class="tag ok">'+Lg('🎯 Копим на него','🎯 Saving for it')+'</span>':'<button class="btn ghost" data-bg="'+i+'">'+Lg('🎯 Копить на него','🎯 Save for it')+'</button>'):''))+'</div>';});
  return h+'</div>';}
function bannersBind(el){
  for(const b of el.querySelectorAll('[data-bu]'))b.onclick=()=>{SND.click();S.bn=BANNERS[+b.dataset.bu].id;save();renderVillage();};
  for(const b of el.querySelectorAll('[data-bg]'))b.onclick=()=>{SND.click();S.goal='b:'+BANNERS[+b.dataset.bg].id;save();toast(Lg('Цель на карте: ','Goal on the map: ')+BANNERS[+b.dataset.bg].n);renderVillage();};
  for(const b of el.querySelectorAll('[data-bb]'))b.onclick=()=>{const i=+b.dataset.bb,d=BANNERS[i];if(bnOwn(i)||!bnOpen(i)||S.gold<d.cost)return;S.gold-=d.cost;S.bns[d.id]=1;S.bn=d.id;if(S.goal==='b:'+d.id)S.goal='';
    let add=0;const n=bnCount();BN_SETS.forEach((q,k)=>{if(n>=q[0]&&(S.bnSet||0)<=k){S.bnSet=k+1;add+=q[1];}});if(add)boostAdd(add);save();SND.up();
    toast(d.n+Lg(' — реет над воротами!',' — flying over the gate!')+(add?Lg(' Набор из '+n+': +',' Set of '+n+': +')+fmtBoost(add)+' ⏩':''));renderVillage();setPills();};}

/* ---------- окно перед боем ---------- */
function levelEnemies(c,l){const set=new Set();for(const w of mkWaves(c,l))for(const g of w.g)set.add(g.t);return [...set];}
function openIntro(c,l){const ch=CH[c],en=levelEnemies(c,l),st=S.stars[lvKey(c,l)]||0;S.introSeen[lvKey(c,l)]=1;   // реплика уже в окне — в бою речью не повторяем
  const news=[];for(const t in TW_UNLOCK){const u=TW_UNLOCK[t];if(u[0]===c&&u[1]===l)news.push({ic:'ti_'+t+'_1',n:TW[t].n,a:TW[t].about});}
  if(BRANCH_UNLOCK[0]===c&&BRANCH_UNLOCK[1]===l)news.push({ic:'ti_arch_4a',n:Lg('Мастера','Masters'),a:Lg('Заставы 3-го уровня теперь можно улучшить в одну из двух веток.','Level 3 outposts can now be upgraded into one of two branches.')});
  for(const k in SPELL_UNLOCK){const u=SPELL_UNLOCK[k];if(u[0]===c&&u[1]===l)news.push({ic:k==='thunder'?'sp_thunder':'sp_cat',n:SPELLS[k].n,a:SPELLS[k].about});}
  const nw=LEVEL_WAVES[l]+(c>=4?1:0);
  let h='<h3>'+(l===5?'☠ ':'')+ch.levels[l]+'</h3><p class="sub">'+Lg('Глава ','Chapter ')+(c+1)+' · '+ch.name+' · '+nw+' '+plw(nw,'волна','волны','волн','wave','waves')+(st?Lg(' · лучший итог: ',' · best: ')+'★'.repeat(st):'')+'</p>';
  h+='<div class="say"><img src="'+ic('voevoda')+'"><div><b class="who">'+VOEV()+'</b>'+ch.intro[l]+'</div></div>';
  if(news.length){h+='<div style="font-weight:900;margin:8px 2px 2px;color:#ffe7a0">'+Lg('Новое!','New!')+'</div>';for(const n of news)h+='<div class="enl"><img src="'+ic(n.ic)+'"><div><b>'+n.n+'</b>'+n.a+'</div></div>';}
  const newEn=en.filter(t=>!S.seen[t]&&!EN[t].boss);
  if(newEn.length){h+='<div style="font-weight:900;margin:8px 2px 2px;color:#ffe7a0">'+Lg('Новая нечисть','New monsters')+'</div>';for(const t of newEn)h+='<div class="enl"><img src="'+ic(EN[t].art||t)+'"><div><b>'+EN[t].n+(EN[t].fly?Lg(' · летает',' · flies'):'')+'</b>'+EN[t].about+'</div></div>';}
  h+='<div class="ens">'+en.filter(t=>!newEn.includes(t)).map(t=>'<div><img src="'+ic(EN[t].art||t)+'">'+EN[t].n+'</div>').join('')+'</div>';
  h+='<div style="font-weight:900;margin:10px 2px 0;color:#ffe7a0">'+Lg('Сложность','Difficulty')+(S.crown[lvKey(c,l)]?Lg(' · 👑 корона взята',' · 👑 crown won'):'')+'</div>'+diffSegHTML();
  h+='<div class="btns stick"><button class="btn big" id="goBtn">'+swordImg()+Lg(' В бой!',' To battle!')+'</button><button class="btn ghost" id="backBtn">'+Lg('Назад','Back')+'</button></div>';
  showModal(h);diffSegBind();on('goBtn',()=>startLevel(c,l));on('backBtn',hideModal);}
function diffSegHTML(){const d=diffNow();return '<div class="seg" id="dfSeg">'+DIFF.map((x,i)=>'<button data-df="'+i+'" class="'+(i===d?'on':'')+'">'+x.n+'</button>').join('')+'</div><p class="note" id="dfTxt" style="margin:0 2px">'+DIFF[d].d+'</p>';}
function diffSegBind(){for(const b of document.querySelectorAll('[data-df]'))b.onclick=()=>{SND.click();S.diff=+b.dataset.df;save();
  for(const x of document.querySelectorAll('[data-df]'))x.classList.toggle('on',x===b);const t=$('dfTxt');if(t)t.textContent=DIFF[S.diff].d;};}

/* ================= БОЙ: запуск ================= */
function startLevel(c,l){hideModal();if(G&&!G.win){boostRefund(.5);save();}S.lastCh=c;mapSel=c;const g=newBattle({ci:c,li:l});enterBattle();{const p=pityCoins(c,l);if(p)setTimeout(()=>toast(Lg('Подмога воеводы: +'+coinsTxt(p)+' на старте','Commander’s aid: +'+coinsTxt(p)+' at the start')),600);}
  const k=lvKey(c,l);
  if(g.tut===1){S.introSeen[k]=1;save();setTimeout(()=>{if(G&&G.tut===1)voice(Lg('Нечисть лезет из леса! Нажми на мигающее место у дороги и выбери стрельцов.','Monsters are coming out of the forest! Tap the blinking spot by the road and pick the archers.'),VOEV(),'voevoda',30);},500);}
  else if(!S.introSeen[k]){S.introSeen[k]=1;save();voice(CH[c].intro[l],VOEV(),'voevoda',8);}}
function startEndless(){hideModal();if(G&&!G.win&&!G.over){boostRefund(.5);save();}newBattle({endless:true,ci:2});enterBattle();if(!S.introSeen.end){S.introSeen.end=1;save();}else return;voice(Lg('Бесконечная осада на Калиновом мосту! Волны всё злее. Держись сколько сможешь — рекорд запишем в летопись.','Endless siege at Kalinov Bridge! Each wave is nastier. Hold out as long as you can — we’ll write your record in the chronicle.'),VOEV(),'voevoda',8);}
function enterBattle(){document.body.classList.add('run');closeRing();layout();musicMode('battle');hudTick(true);}
let voiceT=0;
function voice(text,who,img,dur){$('voice').classList.toggle('low',!!G);$('voiceImg').src=ic(img||'voevoda');$('voiceTxt').innerHTML='<b>'+(who||VOEV())+'</b>'+text;$('voice').classList.add('on');
  clearTimeout(voiceT);voiceT=setTimeout(()=>$('voice').classList.remove('on'),Math.max(dur||6,3+text.length*.06)*1000);}
$('voice').onclick=()=>$('voice').classList.remove('on');

/* ---------- HUD ---------- */
const HUDC={};
function setTxt(id,v){if(HUDC[id]!==v){HUDC[id]=v;const e=$(id);if(e)e.innerHTML=v;}}
function hudTick(force){if(!G)return;if(force)for(const k in HUDC)delete HUDC[k];
  setTxt('hLivesT',String(G.lives));setTxt('hCoinsT',fmtNum(G.coins));
  setTxt('hWave',G.endless&&!G.wk?String(G.wave):Math.min(G.wave,waveCount())+'/'+waveCount());
  if(HUDC.lv!==G.lives){if(HUDC.lv!=null&&G.lives<HUDC.lv){const e=$('hLives');e.classList.remove('warn');void e.offsetWidth;e.classList.add('warn');}HUDC.lv=G.lives;}
  const wb=$('waveBtn');let lbl,dis=false,go=false;
  if(!G.started){lbl=swordImg()+Lg(' В бой!',' To battle!')+(G.tut?'':'<small>'+nextIcons()+'</small>');go=true;}
  else if(G.nextT>0){const b=Math.round(G.nextT*(1+G.ci*.15)*(G.endless?1.5:1));lbl=Lg('🔔 Волна раньше','🔔 Wave early')+'<small>'+nextIcons()+(b>=5?'+'+coinsTxt(b)+' · ':'')+Math.ceil(G.nextT)+Lg(' с',' s')+'</small>';go=!G.endless&&G.ci===0&&G.li<=1;}
  else if(G.wave>=waveCount()){lbl=Lg('Последняя волна!','Final wave!');dis=true;}
  else{lbl=Lg('Волна идёт…','Wave incoming…');dis=true;}
  setTxt('waveBtn',lbl);if(HUDC.wbd!==dis){HUDC.wbd=dis;wb.disabled=dis;}if(HUDC.wbg!==go){HUDC.wbg=go;wb.classList.toggle('go',go);}
  for(const [k,id] of[['thunder','spThunder'],['cat','spCat']]){const s=G.sp[k],el=$(id);const lock=!!s.locked;
    const p=lock?100:s.cd>0?Math.round(s.cd/spellCd(k)*100):0,txt=lock?'🔒':s.cd>0?Math.ceil(s.cd):'';const key=p+'|'+txt+'|'+(G.aim===k);
    if(HUDC[id]!==key){HUDC[id]=key;el.querySelector('i').style.setProperty('--p',p+'%');el.querySelector('i').textContent=txt;el.classList.toggle('aim',G.aim===k);el.classList.toggle('lock',lock);el.style.display=lock?'none':'';}}
  setTxt('spdX','×'+dnum(G.speed));setTxt('spdB',G.speed===2&&typeof payX2==='function'&&payX2()?'∞':G.speed>=2?fmtBoost(S.boost):'');if(HUDC.spd!==G.speed){HUDC.spd=G.speed;$('speedBtn').classList.toggle('on',G.speed>=2);}
  const hot=S.boost<60;if(HUDC.hot!==hot){HUDC.hot=hot;$('boostBtn').classList.toggle('hot',hot);}
  // запас ускорения на первых двух уровнях не показываем (лишнее понятие новичку), если он не кончается
  const bh=!G.endless&&G.ci===0&&G.li<2&&!hot;if(HUDC.bh!==bh){HUDC.bh=bh;$('boostBtn').style.display=bh?'none':'';}
  if(G.tut===2&&!HUDC.tut2){HUDC.tut2=1;voice(Lg((G.started?'Отлично! Ставь ещё заставы у дороги — монеты за нечисть.':'Отлично! Потрать все монеты: поставь ещё две заставы у дороги и жми «В бой!» внизу справа.')+' Теперь так: нажми на значок заставы, потом ещё раз — построить.',(G.started?'Great! Keep building outposts by the road — monsters pay coins.':'Great! Spend all your coins: build two more outposts by the road and press “To battle!” at the bottom right.')+' From now on: tap an outpost icon, then tap it again to build.'),VOEV(),'voevoda',10);}
  if(G.tut===3&&!HUDC.tut3){HUDC.tut3=1;G.tut=4;voice(Lg('Нечисть идёт! За каждую — монеты. Нажми на готовую заставу, чтобы её улучшить.','Here they come! Every monster pays coins. Tap a built outpost to upgrade it.'),VOEV(),'voevoda',9);}
  // советчик новичка (advTick в game.js): первые советы боя и советы «нечисть прорывается» — словами воеводы, дальше — только кольцо со стрелкой
  if(G.autoSay){G.autoSay=0;if(!$('modal').classList.contains('on'))voice(Lg('Нечисть прорывается! Дружина сама поставила заставу на твои монеты. Монеты не копи — ставь заставы и улучшай их!','Monsters are breaking through! The men built an outpost with your coins themselves. Don’t hoard coins — build outposts and upgrade them!'),VOEV(),'voevoda',7);}
  if(G.adv&&HUDC.advO!==G.adv){HUDC.advO=G.adv;const a=G.adv;if((a.n<=3||a.hot)&&!(G.tut===2&&!G.started)&&!$('modal').classList.contains('on')){const pre=a.hot?Lg('Нечисть прорывается! ','Monsters are breaking through! '):'';
    voice(pre+(a.k==='build'?Lg('Монет хватает на новую заставу — нажми на место со стрелкой. Чем больше застав, тем крепче оборона!','You have enough coins for a new outpost — tap the spot with the arrow. More outposts, stronger defense!'):Lg('Монет хватает на улучшение — нажми на заставу со стрелкой и сделай её сильнее!','You have enough coins for an upgrade — tap the outpost with the arrow and make it stronger!')),VOEV(),'voevoda',6);}}
  if(ringI>=0)ringRefresh();
}

// сочность: куда летят монеты (значок монет на HUD, в координатах поля) и «подпрыгивание» счётчика
function coinTarget(){const r=$('icCoin').getBoundingClientRect();return toWorld(r.left+r.width/2,r.top+r.height/2);}
let bumpT=0;function coinBump(){const n=Date.now();if(n-bumpT<140||REDUCED)return;bumpT=n;const e=$('hCoins');e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump');}

/* ---------- кто идёт следующей волной (аудит 14): значки на кнопке «Волна раньше», подробно — по касанию черепа у входа ---------- */
function nextIcons(){const L=waveWho(peekWave());if(!L.length)return '';
  return '<i class="nw">'+L.slice(0,3).map(o=>'<img src="'+ic(EN[o.t].art||o.t,40)+'" alt="">'+(o.boss||o.lead?'<u>👑</u>':o.fly?'<u>✈</u>':o.arm?'<u>🛡</u>':'')).join('')+'</i>';}
function skullAt(p){if(!G||!(G.nextT>0||!G.started))return false;const r=Math.max(26,24/VIEW.s);
  return G.map.paths.some(P=>{const i=Math.min(P.xs.length-1,40),x=clamp(P.xs[i],10,WW-10),y=clamp(P.ys[i],16,WH);return (x-p.x)**2+(y-p.y)**2<r*r;});}
function showWaveInfo(){const w=peekWave(),L=waveWho(w);if(!L.length)return;
  const note=o=>o.lead?Lg('вожак: крепкий, с полосой наверху','leader: tough, health bar at the top'):o.boss?Lg('босс!','boss!'):o.fly?Lg('✈ летает — пушка, изба и дуб не достанут','✈ flies — cannon, hut and oak can’t reach it'):o.arm?Lg('🛡 в броне — стрелы и ядра слабее, бей колдуном и ядом','🛡 armored — arrows and cannonballs are weaker, use the sorcerer and poison'):EN[o.t].about;
  showInfo('<b>'+Lg('Волна ','Wave ')+(G.wave+1)+(w.name?' · '+w.name:'')+'</b>'+L.map(o=>'<p class="nwl"><img src="'+ic(EN[o.t].art||o.t,40)+'" alt=""><span><b>'+(o.lead?Lg('Вожак: ','Leader: ')+LEAD.n[o.t]:EN[o.t].n)+(o.n>1?' ×'+o.n:'')+'</b> — '+note(o)+'</span></p>').join(''));
  $('info').classList.add('low');}

/* ---------- кольцо выбора ---------- */
let ringI=-1,ringSel=null,ringSig='';
function openRing(i){ringI=i;ringSel=null;G.sel=i;$('voice').classList.remove('on');ringBuild();}
function closeRing(){ringI=-1;ringSel=null;$('ring').classList.remove('on');$('info').classList.remove('on');if(G){G.sel=-1;G.preview=null;}}
function ringItems(){const t=G.tw[ringI],items=[];
  if(!t){// доступные заставы + одна следующая закрытая с подсказкой, когда откроется
    const open=TW_ORDER.filter(towerUnlocked),next=TW_ORDER.find(x=>!towerUnlocked(x)&&!towerBanned(x)),list=open.concat(next?[next]:[]),n=list.length;
    list.forEach((ty,k)=>{const a=n<=3?-Math.PI/2+(k-(n-1)/2)*1.15:-Math.PI/2+k*TAU/n,lock=!towerUnlocked(ty),c=buildCost(ty);
      items.push({id:'b_'+ty,a,img:'t_'+ty+'_1',price:lock?(TW_UNLOCK[ty][0]===G.ci?Lg('ур. ','lv ')+(TW_UNLOCK[ty][1]+1):Lg('гл. ','ch ')+(TW_UNLOCK[ty][0]+1)):c,no:!lock&&G.coins<c,lock,nm:lock?Lg('скоро','soon'):null});});}
  else{if(t.lvl<3){const c=upCost(t);items.push({id:'up',a:-Math.PI/2,img:'t_'+t.type+'_'+(t.lvl+1),price:c,no:G.coins<c,nm:'▲ '+lvLbl(t.lvl+1)});}
    else if(t.lvl===3){const lock=!branchUnlocked();for(const br of[1,2]){const c=upCost(t,br);items.push({id:'br'+br,a:-Math.PI/2+(br===1?-.7:.7),img:'t_'+t.type+'_4'+(br===1?'a':'b'),price:lock?'🔒':c,no:!lock&&G.coins<c,lock,nm:TW[t.type].br[br-1].sh});}}
    items.push({id:'sell',a:Math.PI/2,txt:'💰',price:Lg('продать +','sell +')+Math.round(t.inv*.7),sell:1});
    if(AIM_BY[t.type])items.push({id:'aim',a:Math.PI*5/6,txt:'🎯',price:null,nm:AIMS[t.aim||'first'].s,aim:1});}
  return items;}
function ringBuild(){const s=G.map.spots[ringI],p=toScreen(s.x,s.y),el=$('ring'),R=Math.max(58,Math.min(70,VIEW.s*52));
  const items=ringItems();
  const topPad=(G.boss?34:0)+(items.some(i=>i.nm&&Math.sin(i.a)<0)?20:0);let cx=clamp(p.x,R+32,VIEW.W-R-32),cy=clamp(p.y,Math.min(VIEW.top+R+34+topPad,VIEW.H/2),Math.max(VIEW.H/2,VIEW.H-VIEW.bot-R-44));
  el.style.left=cx+'px';el.style.top=cy+'px';
  let h='<div class="rc" style="left:'+(p.x-cx)+'px;top:'+(p.y-cy)+'px"></div>';
  for(const it of items){const x=Math.cos(it.a)*R,y=Math.sin(it.a)*R;
    h+='<button class="rbt'+(it.no?' no':'')+(it.lock?' lock':'')+(it.sell?' sell':'')+(it.aim?' aim':'')+(ringSel===it.id?' sel':'')+'" data-id="'+it.id+'" style="left:'+x+'px;top:'+y+'px">'+
      (it.img?'<img src="'+ic(it.img.replace('t_','ti_'),112)+'">':'<span class="ic">'+it.txt+'</span>')+(it.price!=null?'<b>'+it.price+'</b>':'')+(it.nm?'<u>'+it.nm+'</u>':'')+'</button>';}
  el.innerHTML=h;el.classList.add('on');ringSig=items.map(i=>i.id+i.no).join();
  for(const b of el.querySelectorAll('.rbt'))b.onpointerdown=e=>{e.stopPropagation();ringTap(b.dataset.id);};
  const t=G.tw[ringI];if(!ringSel)G.preview=t?{x:t.x,y:t.y,r:t.st.rng}:null;if(t&&!ringSel)showInfoTower(t);else if(!ringSel)$('info').classList.remove('on');
  $('info').classList.toggle('low',cy<VIEW.H*.5);}
function ringRefresh(){const sig=ringItems().map(i=>i.id+i.no).join();if(sig!==ringSig)ringBuild();}
function ringTap(id){const t=G.tw[ringI],s=G.map.spots[ringI];SND.click();
  // 🎯 — сразу следующая цель по кругу (без второго нажатия: ничего не стоит и не ломается); новые заставы этого вида в бою берут её же
  if(id==='aim'&&t&&AIM_BY[t.type]){const L=AIM_BY[t.type];t.aim=L[(L.indexOf(t.aim||'first')+1)%L.length];G.aimDef=G.aimDef||{};G.aimDef[t.type]=t.aim;ringSel=null;ringBuild();return;}
  if(ringSel!==id&&!(G.tut===1&&id.startsWith('b_')&&towerUnlocked(id.slice(2))&&G.coins>=buildCost(id.slice(2)))){ringSel=id;
    if(id.startsWith('b_')){const ty=id.slice(2);if(!towerUnlocked(ty)){const u=TW_UNLOCK[ty];showInfo('<b>'+TW[ty].n+'</b><p>'+Lg('Откроется в главе '+(u[0]+1)+', уровень '+(u[1]+1)+'.','Unlocks in chapter '+(u[0]+1)+', level '+(u[1]+1)+'.')+'</p>');ringBuild();return;}
      const st=tstat(ty,1,0);G.preview={x:s.x,y:s.y,r:st.rng};showInfoType(ty,1,0,buildCost(ty));}
    else if(id==='up'){const st=tstat(t.type,t.lvl+1,0);G.preview={x:t.x,y:t.y,r:st.rng};showInfoType(t.type,t.lvl+1,0,upCost(t),t);}
    else if(id.startsWith('br')){const br=+id[2];if(!branchUnlocked()){showInfo('<b>'+Lg('Мастера','Masters')+'</b><p>'+Lg('Ветки откроются в главе ','Branches unlock in chapter ')+(BRANCH_UNLOCK[0]+1)+Lg(', уровень ',', level ')+(BRANCH_UNLOCK[1]+1)+'.</p>');ringBuild();return;}
      const st=tstat(t.type,4,br);G.preview={x:t.x,y:t.y,r:st.rng};showInfoType(t.type,4,br,upCost(t,br),t);}
    else if(id==='sell'){showInfo('<b>'+Lg('Продать заставу?','Sell this outpost?')+'</b><p>'+Lg('Вернём '+coinsTxt(Math.round(t.inv*.7))+' (70% затрат). Нажми ещё раз, чтобы продать.','You get back '+coinsTxt(Math.round(t.inv*.7))+' (70% of the cost). Tap again to sell.')+'</p>');}
    ringBuild();return;}
  // второе нажатие — действие
  let ok=false;
  if(id.startsWith('b_')){const ty=id.slice(2);ok=tryBuild(ringI,ty);if(!ok)toast(G.coins<buildCost(ty)?Lg('Не хватает монет','Not enough coins'):Lg('Нельзя','Can’t do that'));}
  else if(id==='up'){ok=tryUpgrade(ringI);if(!ok)toast(Lg('Не хватает монет','Not enough coins'));}
  else if(id.startsWith('br')){ok=tryUpgrade(ringI,+id[2]);if(!ok)toast(Lg('Не хватает монет','Not enough coins'));}
  else if(id==='sell'){ok=sellTower(ringI);}
  if(ok)closeRing();}
function statLine(ty,st,pv){const a=[];const sp=v=>dnum((1/v).toFixed(1)),dm=Lg('Урон ','Damage '),
  ar=f=>{const n=f(st);if(!pv)return n;const o=f(pv);return String(o)===String(n)?n:o+' → <b class="up">'+n+'</b>';};   // pv — свойства до улучшения: «было → стало»
  if(ty==='arch')a.push(dm+ar(q=>Math.round(q.dmg))+(st.multi>1?' × '+st.multi+Lg(' цели',' targets'):''),Lg('выстр./с ','shots/s ')+ar(q=>sp(q.cd)));
  if(ty==='pushka')a.push(dm+ar(q=>Math.round(q.dmg))+Lg(' по площади',' splash'),Lg('раз в ','every ')+ar(q=>dnum(q.cd.toFixed(1)))+Lg(' с',' s'));
  if(ty==='izba')a.push(Lg('Яд ','Poison ')+ar(q=>Math.round(q.dps))+Lg('/с','/s'),Lg('замедл. ','slow ')+ar(q=>Math.round(q.slow*100))+'%');
  if(ty==='mag')a.push(dm+ar(q=>Math.round(q.dmg))+Lg(' магией',' magic'),(st.chain?Lg('цепь на ','chain of ')+ar(q=>q.chain+1):Lg('одна цель','one target')));
  if(ty==='dub')a.push(dm+ar(q=>Math.round(q.dmg))+Lg(' вокруг',' around'),Lg('оглуш. ','stun ')+ar(q=>dnum(q.stun.toFixed(1)))+Lg(' с',' s'));
  a.push(Lg('дальн. ','range ')+ar(q=>Math.round(q.rng)));a.push(st.air?Lg('✈ бьёт летучих','✈ hits flyers'):Lg('только наземных','ground only'));return a.join(' · ');}
function showInfoType(ty,lvl,br,cost,cur){const d=TW[ty],b=lvl===4?d.br[br-1]:null,st=tstat(ty,lvl,br);
  showInfo('<b>'+(b?b.n:d.n)+(lvl<4?' · '+lvLbl(lvl):'')+'</b><p>'+(b?b.about:d.about)+'</p><div class="st">'+statLine(ty,st,cur?cur.st:null)+'</div><div class="hint">'+(G.coins>=cost?Lg('Нажми ещё раз — '+(cur?'улучшить':'построить')+' за '+cost,'Tap again to '+(cur?'upgrade':'build')+' for '+cost):Lg('🔒 Нужно '+coinsTxt(cost)+' (есть '+G.coins+')','🔒 Need '+coinsTxt(cost)+' (you have '+G.coins+')'))+'</div>');}
function showInfoTower(t){const d=TW[t.type],b=t.lvl===4?d.br[t.br-1]:null,A=AIM_BY[t.type]?AIMS[t.aim||'first']:null;
  showInfo('<b>'+(b?b.n:d.n)+(t.lvl<4?' · '+lvLbl(t.lvl):'')+'</b><div class="st">'+statLine(t.type,t.st)+'</div><p>'+Lg('Одолела нечисти: ','Monsters defeated: ')+t.kills+Lg(' · урон ',' · damage ')+fmtNum(t.dmgd||0)+'</p>'+
    (A?'<p>'+Lg('🎯 Бьёт <b class="aimb">'+A.n.toLowerCase()+'</b> — '+A.d+'. Нажми 🎯, чтобы сменить.','🎯 Targets <b class="aimb">'+A.n.toLowerCase()+'</b> — '+A.d+'. Tap 🎯 to change.')+'</p>':''));}
function showInfo(h){const e=$('info');e.innerHTML=h;e.classList.add('on');}

/* ---------- ввод на поле ---------- */
function initInput(){
  cv.addEventListener('pointerdown',e=>{if(!G||G.over)return;ac();const p=toWorld(e.clientX,e.clientY);
    if(G.aim==='thunder'){if(p.y>-40&&p.y<WH+20){castThunder(p.x,p.y);G.aim=null;G.aimPt=null;}return;}
    if(G.egg&&!G.egg.dead&&(G.egg.x-p.x)**2+(G.egg.y-6-p.y)**2<34*34){const ex=G.egg.x,ey=G.egg.y;dmgEnemy(G.egg,G.egg.max*.07,'true');sparkle(ex,ey-6,'#ffd84a',5);SND.click();return;}
    if(G.kolo&&!G.kolo.got&&(G.kolo.x-p.x)**2+(G.kolo.y-8-p.y)**2<30*30){koloTap();return;}
    // застава нарисована выше площадки — по ней попадаем по всей высоте (центр на 18 выше, радиус ≥34); пустое место — как было
    const rT=Math.min(38,Math.max(26,24/VIEW.s));let best=-1,bd=1;G.map.spots.forEach((s,i)=>{const tw=G.tw[i],r=tw?Math.max(rT,34):rT,y=tw?s.y-18:s.y;
      const d=((s.x-p.x)**2+(y-p.y)**2)/(r*r);if(d<bd){bd=d;best=i;}});
    if(best>=0){if(best===ringI){closeRing();return;}SND.click();openRing(best);}
    else if(skullAt(p)){SND.click();closeRing();showWaveInfo();}else closeRing();});
  cv.addEventListener('pointermove',e=>{if(G&&G.aim){G.aimPt=toWorld(e.clientX,e.clientY);}});
  on('waveBtn',()=>{if(!G)return;if(G.tut===1){G.tut=2;}callWave();closeRing();});
  on('speedBtn',()=>{if(!G)return;const order=[1,1.5,2,3],nx=order[(order.indexOf(G.speed)+1)%4];
    if(nx>=2&&S.boost<=0&&!(nx===2&&payX2())){G.speed=payX2()?2:1;openBoostOffer(true);return;} // «Вечное ×2»: ×3 без запаса — остаёмся на ×2G.speed=nx;
    if(nx===2&&!S.spdTip&&!payX2()){S.spdTip=1;save();toast(Lg('×2 — бесплатно, пока есть запас ('+fmtBoost(S.boost)+'): победа его вернёт','×2 is free while you have reserve ('+fmtBoost(S.boost)+'): a victory gives it back'));}});
  on('boostBtn',()=>openBoostOffer());
  on('pauseBtn',openPause);
  on('spThunder',()=>{if(!G)return;const s=G.sp.thunder;if(s.locked){toast(Lg('Гром Перуна откроется позже','Perun’s Thunder unlocks later'));return;}if(s.cd>0){toast(Lg('Перун отдыхает: ','Perun is resting: ')+Math.ceil(s.cd)+Lg(' с',' s'));return;}
    closeRing();G.aim=G.aim==='thunder'?null:'thunder';if(G.aim){G.aimPt=null;toast(Lg('Нажми на карту — туда ударит молния','Tap the map — lightning will strike there'));}else G.redraw=1;});
  on('spCat',()=>{if(!G)return;const s=G.sp.cat;if(s.locked){toast(Lg('Кот Баюн придёт позже','Bayun the Cat will come later'));return;}if(s.cd>0){toast(Lg('Кот ещё спит: ','The cat is still napping: ')+Math.ceil(s.cd)+Lg(' с',' s'));return;}
    if(!G.en.length){toast(Lg('Некого усыплять','Nobody to put to sleep'));return;}closeRing();castCat();voice(Lg('Мур-р… Баю-баюшки-баю, спи, нечисть, на краю…','Purr… Hush-a-bye, monsters, close your eyes…'),SPELLS.cat.n,'sp_cat',3);});
  window.addEventListener('keydown',e=>{if(!G||G.over)return;if(e.code==='Space'){e.preventDefault();if(!G.paused&&!paused&&!$('waveBtn').disabled&&!$('modal').classList.contains('on')){callWave();closeRing();}}if(e.code==='Escape'){if(G.aim)G.aim=null;else if(ringI>=0)closeRing();else if(!$('modal').classList.contains('on'))openPause();}
    if(e.code==='KeyP'&&!$('modal').classList.contains('on'))openPause(); // поверх открытого окна пауза не открывается
    if($('modal').classList.contains('on')||G.paused)return;
    if(e.code==='KeyQ')$('spThunder').click();if(e.code==='KeyW')$('spCat').click();if(e.code==='KeyS')$('speedBtn').click();
    const d=/^Digit([1-6])$/.exec(e.code);if(d&&ringI>=0){const it=ringItems()[+d[1]-1];if(it)ringTap(it.id);}});
}
function openPause(){if(!G||G.over)return;G.paused=true;closeRing();YG.stop();
  const q=(a,b)=>Lg('«'+a+'»','“'+a+'”'),mode=G.wk?Lg('Босс недели: ','Boss of the Week: ')+EN[CH[G.ci].boss].n:G.rule?Lg('Испытание дня: ','Daily challenge: ')+q((DCH_RULES.find(r=>r.k===G.rule)||{}).n):G.endless?'':Lg('Сложность: ','Difficulty: ')+q(DIFF[G.diff].n);
  const oo=v=>v?Lg('Вкл','On'):Lg('Выкл','Off');
  showModal('<h3>'+Lg('Передышка','Breather')+'</h3>'+(mode?'<p class="sub" style="margin-bottom:4px;color:#ffe7a0">'+mode+'</p>':'')+'<p class="sub">'+pick(TIPS)+'</p>'+
    '<div class="tg">'+Lg('Звуки','Sounds')+' <button class="btn '+(S.sound?'green':'ghost')+'" id="pSnd">'+oo(S.sound)+'</button></div>'+
    '<div class="tg">'+Lg('Музыка','Music')+' <button class="btn '+(S.music?'green':'ghost')+'" id="pMus">'+oo(S.music)+'</button></div>'+
    '<div class="tg">'+Lg('Тряска экрана','Screen shake')+' <button class="btn '+(S.shake?'green':'ghost')+'" id="pShk">'+oo(S.shake)+'</button></div>'+
    '<div class="btns"><button class="btn big" id="pGo">'+Lg('Продолжить','Continue')+'</button><button class="btn ghost" id="pRe">'+Lg('Начать заново','Restart')+'</button><button class="btn ghost" id="pExit">'+Lg('На карту','To the map')+'</button></div>');
  on('pGo',()=>{hideModal();G.paused=false;YG.start();});
  on('pRe',()=>{const e=G.endless,c=G.ci,l=G.li,wk=G.wk,rule=G.rule;hideModal();if(wk)startWeekly();else if(rule)startDaily();else if(e)startEndless();else startLevel(c,l);});
  on('pExit',()=>{const b=$('pExit');if(!b.dataset.ok&&G&&G.started){b.dataset.ok=1;b.textContent=Lg('Точно выйти? Бой не засчитается','Really leave? The battle won’t count');return;}
    if(G&&G.endless&&G.wave>1){G.paused=false;G.quit=true;G.lives=0;defeat();hideModal();return;}toMenu('Map');});
  on('pSnd',()=>{S.sound=S.sound?0:1;save();G.paused=false;openPause();});
  on('pMus',()=>{S.music=S.music?0:1;save();musicSync();G.paused=false;openPause();});
  on('pShk',()=>{S.shake=S.shake?0:1;save();G.paused=false;openPause();});}

/* ---------- время ускорения ---------- */
function boostOut(){HUDC.hot=null;}
function openBoostOffer(empty){const wasG=G&&!G.over&&!G.paused;if(wasG){G.paused=true;YG.stop();}
  const close=()=>{hideModal();if(wasG&&G){G.paused=false;YG.start();}if(!G&&curTab==='Village')renderVillage();};
  showModal('<h3>'+Lg('⏩ Время ускорения','⏩ Speed-up time')+'</h3><p class="sub">'+Lg((empty?'Запас пуст. ':'')+'Скорость ×1 и ×1,5 — бесплатно всегда. ×2 — победа возвращает потраченное; ×3 — тратит запас (2 секунды за секунду боя).',(empty?'The reserve is empty. ':'')+'Speed ×1 and ×1.5 are always free. ×2 — a victory gives back what you spent; ×3 — uses the reserve (2 seconds per second of battle).')+'</p>'+
    '<div class="card treasury" style="text-align:center"><b style="font-size:20px">'+Lg('Запас: ','Reserve: ')+fmtBoost(S.boost)+'</b><br><span class="note">'+Lg('Пополняется за победы (+1 мин и больше), раз в день бесплатно и за рекламу. Максимум — ','Refills with victories (+1 min or more), once a day for free, and for ads. Maximum — ')+fmtBoost(BOOST_CAP)+'.</span></div>'+
    '<div class="btns">'+(S.boost<BOOST_CAP-60&&adOk()?'<button class="btn ad big" id="bAd">'+Lg('🎬 +10 мин за рекламу','🎬 +10 min for an ad')+'</button>':'')+'<button class="btn ghost" id="bNo">'+(empty?(payX2()?Lg('Играть на ×2','Play at ×2'):Lg('Играть на ×1,5','Play at ×1.5')):Lg('Закрыть','Close'))+'</button></div>');
  on('bAd',()=>showRewarded(()=>{boostAdd(600);save();SND.up();toast(Lg('+10 минут ускорения!','+10 minutes of speed-up!'));if(G&&!G.over)G.speed=Math.max(G.speed,2);close();}));
  on('bNo',()=>{if(empty&&G)G.speed=payX2()?2:1.5;close();});}
function dailyBoost(){const d=dayKey();if(S.boostDay!==d){S.boostDay=d;if(S.boost<300){boostAdd(300);toast(Lg('Ежедневный запас ускорения: +5 мин','Daily speed-up reserve: +5 min'));}save();}}

/* ================= ИТОГ БОЯ ================= */
/* уход с экрана итогов: если сейчас можно (interReady в core.js) — «Реклама через секунду…», межэкранная, потом переход.
   ok — это итог победы (или осады); после поражения межэкранной нет никогда */
function afterAd(ok,fn){if(!ok||!interReady()){fn();return;}
  for(const b of document.querySelectorAll('#modal button'))b.disabled=true;
  toast(Lg('Реклама через секунду…','Ad in a second…'));setTimeout(()=>showInterstitial(fn),1000);}
function starsFor(){const lost=G.maxLives-G.lives;return lost<=2?3:lost<=10?2:1;}
/* «Лучшая застава» и кто сколько сделал (урон без «перебора», проданные заставы тоже считаются) */
function bestTwHTML(){if(!G)return '';const L=G.tw.filter(Boolean).concat(G.gone||[]).filter(t=>t.dmgd>0);if(!L.length)return '';
  const tot=L.reduce((a,t)=>a+t.dmgd,0),best=L.reduce((a,t)=>t.dmgd>a.dmgd?t:a),nm=t=>t.lvl===4?TW[t.type].br[t.br-1].n:TW[t.type].n+' · '+lvLbl(t.lvl);
  const by={};for(const t of L){const o=by[t.type]||(by[t.type]={d:0,k:0,n:0});o.d+=t.dmgd;o.k+=t.kills;o.n++;}
  const rows=TW_ORDER.filter(k=>by[k]).sort((a,b)=>by[b].d-by[a].d).map(k=>{const o=by[k],p=Math.round(o.d/tot*100);
    return '<div class="twrow"><img src="'+ic('ti_'+k+'_3',64)+'" alt=""><div class="t"><b>'+TW[k].n+(o.n>1?' ×'+o.n:'')+'</b><div class="bar"><i style="width:'+p+'%"></i></div></div><span>'+p+'%<small>'+Lg('одолели ','defeated ')+o.k+'</small></span></div>';}).join('');
  const head='<img src="'+ic(towerKey(best).replace('t_','ti_'),64)+'" alt=""><span>'+Lg('🏅 Лучшая застава: ','🏅 Best outpost: ')+'<b>'+nm(best)+'</b> — '+Math.round(best.dmgd/tot*100)+Lg('% урона','% of damage')+'</span>';
  return Object.keys(by).length>1?'<details class="besttw"><summary>'+head+'</summary>'+rows+'</details>':'<div class="besttw one">'+head+'</div>';}
function onBattleEnd(win){if(!G)return;closeRing();$('voice').classList.remove('on');
  // бой может кончиться дважды («ещё попытка» после поражения) — счётчики и задания пополняем только приростом
  const P=G.paid||(G.paid={kills:0,kt:{},built:0,ups:0,spells:0,n:0,best0:S.endBest||0,gold:0,waves:0,x2:0}),dK=G.kills-P.kills;
  S.kills+=dK;if(!P.n)S.runs++;P.n++;
  for(const k in G.kt)S.bk[k]=(S.bk[k]||0)+G.kt[k]-(P.kt[k]||0);
  for(const t of G.tw.concat(G.gone||[]))if(t&&t.kills>(S.bestTw||0))S.bestTw=t.kills;
  const dq0=dqDone();dqAdd('build',(G.built||0)-P.built);dqAdd('ups',(G.ups||0)-P.ups);dqAdd('spells',(G.spells||0)-P.spells);dqAdd('kills',dK);
  P.kills=G.kills;P.kt=Object.assign({},G.kt);P.built=G.built||0;P.ups=G.ups||0;P.spells=G.spells||0;
  if(G.wk){weekEnd(dq0);achAfter();return;}
  if(G.rule){dchEnd(win,dq0);achAfter();return;}
  if(G.endless){const waves=Math.max(0,G.wave-1),rec=waves>P.best0;S.endBest=Math.max(S.endBest||0,waves);if(P.n===1)S.endRuns++;
    // золото и ускорение — за весь забег; после «ещё попытки» доплачиваем только разницу
    const total=siegeGold(waves),reward=total-P.gold,x2=total-P.x2;P.gold=total;
    dqAdd('siege',waves-P.waves);S.gold+=reward;const bref=boostRefund(1);G.win=true;boostAdd(Math.min(120,5*waves)-Math.min(120,5*P.waves));P.waves=waves;save();LB.set('endless',S.endBest);
    // «Ещё попытка за рекламу» — один раз за забег, с 2-й волны, если игрок не сам вышел
    const cont=!G.contUsed&&!G.quit&&G.wave>=2&&adOk();
    showModal('<h3>'+Lg('Осада окончена','The siege is over')+'</h3><p class="sub">'+(rec?Lg('🏆 Новый рекорд! Летописец записал.','🏆 New record! The chronicler wrote it down.'):Lg('Нечисть прорвалась. Но и мы ей бока намяли!','The monsters broke through. But we gave them a good beating!'))+'</p>'+
      '<div class="stats"><div><b>'+waves+'</b>'+Lg('волн отбито','waves held')+'</div><div><b>'+S.endBest+'</b>'+Lg('рекорд','record')+'</div><div><b>'+G.kills+'</b>'+Lg('одолели','defeated')+'</div></div>'+bestTwHTML()+
      '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(total)+'</b>'+(P.n>1?'<br><span style="font-size:13px">'+Lg('за весь забег','for the whole run')+'</span>':'')+(bref>=1?'<br><span style="font-size:13px">'+BREF()+fmtBoost(bref)+'</span>':'')+'</div>'+
      dqNote(dq0)+'<div class="btns stick">'+(cont?'<button class="btn ad big" id="rCont">'+Lg('🎬 Ещё попытка за рекламу (+10 ❤, забег продолжится)','🎬 One more try for an ad (+10 ❤, the run goes on)')+'</button>':'')+
      (x2>0&&goldWanted()&&adOk()?'<button class="btn ad" id="rX2">'+Lg('🎬 Удвоить за рекламу: ещё +','🎬 Double for an ad: +')+fmtNum(x2)+'</button>':'')+(LB.vkOk()?'<button class="btn ghost" id="rVkLb">🏆 Рекорды друзей</button>':'')+'<button class="btn'+(cont?'':' big')+'" id="rAgain">'+Lg('Ещё раз','Play again')+'</button><button class="btn ghost" id="rMap">'+Lg('В меню','Menu')+'</button></div>');
    on('rVkLb',()=>LB.vkFriends(S.endBest));
    on('rCont',()=>showRewarded(()=>{hideModal();G.win=false;continueBattle();voice(Lg('Второе дыхание! Кот Баюн усыпил нечисть — осада продолжается!','Second wind! Bayun the Cat put the monsters to sleep — the siege goes on!'),VOEV(),'voevoda',5);}));
    on('rX2',()=>showRewarded(()=>{S.gold+=x2;P.x2=total;save();toast('+'+fmtGold(x2)+'');const b=$('rX2');if(b)b.remove();}));
    on('rAgain',()=>afterAd(true,startEndless));on('rMap',()=>afterAd(true,()=>toMenu('Siege')));achAfter();return;}
  const c=G.ci,l=G.li,key=lvKey(c,l);
  if(win){const st=starsFor(),prev=S.stars[key]||0,first=!prev;S.stars[key]=Math.max(prev,st);S.wins++;if(S.lose)delete S.lose[key];
    const crownNew=G.diff===2&&!S.crown[key];if(G.diff===2)S.crown[key]=1;
    dqAdd('win',1);if(st===3)dqAdd('star3',1);const lg=S.login?0:loginFirst();   // первый день серии входов засчитываем с первой победой
    const reward=winGold(c,l,st,first);S.gold+=reward;const bst=(60+30*(st-1))*(l===5?2:1);const bref=boostRefund(1);boostAdd(bst);save();
    const lines=Lg(['Отбились! Нечисть бежит, роняя тапки.','Победа! Воевода доволен и даже улыбнулся.','Застава устояла! Тётушка Яга печёт пироги.','Славно! Про нас сложат былину. Короткую.'],
      ['We held them off! The monsters flee, losing their slippers.','Victory! The commander is pleased and even smiled.','The outpost stands! Auntie Yaga is baking pies.','Glorious! They’ll write an epic about us. A short one.']);
    const next=l<5?[c,l+1]:c<CH.length-1?[c+1,0]:null;
    // после первой победы — один ясный шаг: Частокол в деревне (строкой и кнопкой во втором ряду; главная кнопка одна — «Дальше»)
    const hintWall=S.wins===1&&!S.village.wall&&S.gold>=BLD.find(b=>b.id==='wall').cost[0];
    const x2b=goldWanted()&&adOk()&&!(c===0&&l<3);   // первые три уровня — без рекламных кнопок (решение владельца 03.10)
    showModal('<h3>'+(l===5?Lg('Глава освобождена!','Chapter liberated!'):Lg('Победа!','Victory!'))+'</h3><div class="bigstars">'+[0,1,2].map(i=>'<img src="'+ic(i<st?'star':'star0',128)+'">').join('')+'</div>'+
      '<p class="sub">'+(l===5?Lg('Босс повержен! '+CH[c].name+' '+({m:'свободен',n:'свободно',f:'свободна',p:'свободны'})[CH[c].g]+'. '+(c<CH.length-1?'':'Тридевятое царство спасено! Ура!'),'Boss defeated! '+CH[c].name+' is free. '+(c<CH.length-1?'':'The Thrice-Nine Kingdom is saved! Hooray!')):st===3?pick(lines):st===2?Lg('Кое-кто просочился. Для трёх звёзд — не больше двух.','A few slipped through. For three stars — no more than two.'):Lg('Еле устояли! Для трёх звёзд в город должно пройти не больше двух.','That was close! For three stars, no more than two may reach the city.'))+'</p>'+
      (crownNew?'<p class="sub" style="color:#ffe7a0;font-weight:800">'+Lg('👑 Корона «Богатырской» — теперь она на этом уровне навсегда!','👑 The “Heroic” crown — it stays on this level forever!')+'</p>':'')+
      '<div class="card treasury rew" style="text-align:center"><b>+'+fmtGold(reward)+''+(first?Lg(' (первая победа ×2)',' (first victory ×2)'):'')+' <span style="white-space:nowrap">· ⏩ +'+fmtBoost(bst)+'</span></b>'+(bref>=1?'<br><span style="font-size:13px">'+BREF()+fmtBoost(bref)+'</span>':'')+(lg?'<br><span class="note">'+Lg('🎁 За вход: +'+lg+' сегодня','🎁 Daily bonus: +'+lg+' today')+'</span>':'')+'</div>'+
      goalHTML(next,c,hintWall)+tomorrowHTML()+(hintWall?'<div class="goal">'+Lg('🏠 Золота хватает на <b>Частокол</b> в деревне: +1 жизнь в каждом бою.','🏠 You have enough gold for the <b>Palisade</b> in the village: +1 life in every battle.')+'</div>':'')+
      '<div class="stats"><div><b>'+G.kills+'</b>'+Lg('одолели','defeated')+'</div><div><b>'+G.leaks+'</b>'+Lg('прорвалось','got through')+'</div><div><b>'+fmtTime(G.t)+'</b>'+Lg('время','time')+'</div></div>'+bestTwHTML()+dqNote(dq0)+
      '<div class="btns stick">'+
      (next?'<button class="btn big" id="rNext">'+Lg('Дальше: ','Next: ')+CH[next[0]].levels[next[1]]+' ▸</button>':'<button class="btn big" id="rMap">'+Lg('На карту','To the map')+'</button>')+
      (x2b?'<button class="btn ad" id="rX2">'+Lg('🎬 Удвоить золото за рекламу: ещё +','🎬 Double the gold for an ad: +')+fmtNum(reward)+(needB(reward)?Lg(' — хватит на «'+needB(reward)+'»',' — enough for “'+needB(reward)+'”'):'')+'</button>':'')+
      '<div class="btns h" style="margin-top:0">'+(hintWall?'<button class="btn ghost" id="rWall">'+Lg('🏠 В деревню','🏠 To the village')+'</button>':'<button class="btn ghost" id="rAgain">'+Lg('Ещё раз','Play again')+'</button>')+(next?'<button class="btn ghost" id="rMap">'+Lg('На карту','To the map')+'</button>':'')+'</div></div>');
    on('rX2',()=>showRewarded(()=>{S.gold+=reward;save();toast('+'+fmtGold(reward)+'');const b=$('rX2');if(b)b.remove();}));
    // межэкранная — только тут, при уходе с экрана победы, и со 2-й главы (после Соловья)
    const ia=c>=1;
    on('rNext',()=>afterAd(ia,()=>{toMenu('Map');mapSel=next[0];renderMap();if(!$('modal').classList.contains('on'))openIntro(next[0],next[1]);}));
    on('rWall',()=>afterAd(ia,()=>{toMenu('Village');const w=document.querySelector('[data-b="wall"]');if(w){w.classList.add('hl');w.scrollIntoView({block:'center'});}}));
    on('rAgain',()=>afterAd(ia,()=>startLevel(c,l)));on('rMap',()=>afterAd(ia,()=>{toMenu('Map');if(canForge())toast(Lg('Есть звёзды для кузницы!','You have stars for the forge!'));}));
    // VK: одно предложение за сессию (модуль SOC) — строкой и кнопкой ПОД кнопками окна победы; диалог VK — только по нажатию игрока
    if(PLAT==='vk'){try{const o=SOC.offer(S.wins,Date.now()-lastAdT<60000||paused||interBusy);if(o){retAsked=true;const d=document.createElement('div');d.className='soc-o';d.innerHTML='<span>'+o.t+'</span><button class="btn ghost" id="mSoc">'+o.b+'</button>';
      $('mBody').appendChild(d);const b=$('mSoc');b.onclick=()=>{b.disabled=true;o.run();};}}catch(e){}}
    if(l===5&&c===CH.length-1)setTimeout(()=>toast(Lg('Тридевятое царство спасено! Осада и Босс недели ждут.','The Thrice-Nine Kingdom is saved! The Siege and the Boss of the Week await.')),800);
  }else{const cons=loseGold(c,G.wave);S.gold+=cons;S.lose=S.lose||{};S.lose[key]=(S.lose[key]||0)+1;const pity=pityCoins(c,l);const bref=boostRefund(.5);save();
    const lines=Lg(['Нечисть прорвалась в город и съела все пирожки. Все!','Ворота не выдержали. Воевода чешет бороду: «Строить надо больше!»','Прорвались, окаянные! Ничего — отстроимся и всыплем им.'],
      ['The monsters broke into the city and ate all the pies. ALL of them!','The gates gave way. The commander scratches his beard: “We need to build more!”','They got through, the rascals! Never mind — we’ll rebuild and give them what for.']);
    const nw=G.waves.length,held=Math.max(0,G.wave-1),soft=Math.round((1-novK(c,l))*100),lb=G.leakedBoss;
    // новичку (первые три уровня) главная кнопка — «Начать заново», ролик — второй строкой; дальше — как было
    const early=c===0&&l<3,cont=!early&&!G.contUsed&&G.wave>=2&&adOk(),contB=cont?'<button class="btn ad'+(early?'':' big')+'" id="rCont">'+Lg('🎬 Ещё попытка за рекламу (+10 ❤','🎬 One more try for an ad (+10 ❤')+(G.boss&&G.boss.boss&&!G.boss.dead||lb?Lg(', босс назад',', boss pushed back'):'')+')</button>':'',
      againB='<button class="btn big" id="rAgain">'+Lg('Начать заново','Restart')+(pity?Lg(' (подмога +'+coinsTxt(pity)+')',' (aid +'+coinsTxt(pity)+')'):'')+'</button>';
    showModal('<h3>'+Lg('Город в опасности!','The city is in danger!')+'</h3><p class="sub">'+pick(lines)+'</p>'+
      '<div class="prog"><div class="bar"><i style="width:'+Math.round(held/nw*100)+'%"></i></div><span>'+Lg('Отбито волн: '+held+' из '+nw,'Waves held: '+held+' of '+nw)+(lb?Lg(' · боссу оставалось '+Math.ceil(lb.hp/lb.max*100)+'% здоровья',' · the boss had '+Math.ceil(lb.hp/lb.max*100)+'% health left'):nw-held===1?Lg(' — оставалась последняя!',' — just one to go!'):'')+'</span></div>'+
      '<div class="say"><img src="'+ic('voevoda')+'" alt=""><div><b class="who">'+Lg('Совет воеводы','Commander’s tip')+'</b>'+loseWhy()+'</div></div>'+
      (pity||soft?'<div class="goal">'+Lg('💪 В следующей попытке: ','💪 On your next try: ')+[pity?Lg('подмога +'+coinsTxt(pity),'aid +'+coinsTxt(pity)):'',soft?Lg('нечисть слабее на '+soft+'%','monsters are '+soft+'% weaker'):''].filter(Boolean).join(' · ')+'</div>':'')+
      (bref>=1?'<p class="sub">'+BREF()+fmtBoost(bref)+Lg(' (половина потраченного на ×2)',' (half of what you spent on ×2)')+'</p>':'')+'<div class="stats"><div><b>'+(G.wave)+'/'+nw+'</b>'+Lg('волна','wave')+'</div><div><b>'+G.kills+'</b>'+Lg('одолели','defeated')+'</div><div><b>+'+cons+'</b>'+plw(cons,'золотой','золотых','золотых','gold','gold')+'</div></div>'+bestTwHTML()+
      dqNote(dq0)+'<div class="btns stick">'+(early?againB+contB:contB+againB)+
      // два поражения подряд — ненавязчиво предложить полегче (звёзды те же)
      (S.lose[key]>=2&&G.diff>0?'<button class="btn ghost" id="rEasy">'+Lg('Полегче: сыграть на «'+DIFF[G.diff-1].p+'»','Easier: play on “'+DIFF[G.diff-1].p+'”')+'</button>':'')+'<button class="btn ghost" id="rMap">'+Lg('На карту','To the map')+'</button></div>');
    on('rCont',()=>showRewarded(()=>{hideModal();continueBattle();voice(Lg('Второе дыхание! Кот Баюн усыпил нечисть — строй скорее!','Second wind! Bayun the Cat put the monsters to sleep — build, quick!'),VOEV(),'voevoda',5);}));
    on('rAgain',()=>startLevel(c,l));on('rMap',()=>toMenu('Map'));
    on('rEasy',()=>{S.diff=G.diff-1;save();startLevel(c,l);toast(Lg('Сложность: «'+DIFF[S.diff].n+'». Поменять — в окне перед боем','Difficulty: “'+DIFF[S.diff].n+'”. Change it in the window before a battle'));});}
  achAfter();
}
/* ---------- boost 02.10: «Дальше» и «Завтра» в итогах, причина поражения ---------- */
// что нового на уровне: застава, чары, мастера, вожак, босс
function unlockAt(c,l){const a=[];for(const t in TW_UNLOCK){const u=TW_UNLOCK[t];if(u[0]===c&&u[1]===l)a.push(Lg('новая застава — ','new outpost — ')+TW[t].n);}
  for(const k in SPELL_UNLOCK){const u=SPELL_UNLOCK[k];if(u[0]===c&&u[1]===l)a.push(Lg('новые чары — ','new spell — ')+SPELLS[k].n);}
  if(BRANCH_UNLOCK[0]===c&&BRANCH_UNLOCK[1]===l)a.push(Lg('мастера — две ветки у застав 3-го уровня','masters — two branches for level 3 outposts'));
  if(LEAD.at[c+'-'+l])a.push(Lg('вожак — ','a leader — ')+LEAD.n[LEAD.at[c+'-'+l]]);
  if(l===5)a.push(Lg('босс главы — ','the chapter boss — ')+EN[CH[c].boss].n);return a;}
function goalHTML(next,c,noForge){let t;
  if(!next)t=Lg('Осада на Калиновом мосту и Босс недели — на вкладке «Испытания».','The Siege at Kalinov Bridge and the Boss of the Week — in the “Trials” tab.');
  else{const u=unlockAt(next[0],next[1]),left=5-next[1],nm=CH[next[0]].levels[next[1]];
    t=Lg('«'+nm+'»','“'+nm+'”')+(next[0]!==c?Lg(' — новая глава «'+CH[next[0]].name+'»',' — a new chapter, “'+CH[next[0]].name+'”'):'')+
      (u.length?': '+u.join(', '):Lg(' · до босса ('+EN[CH[next[0]].boss].n+') — ',' · to the boss ('+EN[CH[next[0]].boss].n+') — ')+left+' '+plw(left,'уровень','уровня','уровней','level','levels'));}
  if(canForge()&&!noForge)t+='<br>'+Lg('⭐ Кузница: свободных звёзд — ','⭐ Forge: free stars — ')+starsFree();
  return '<div class="goal"><b>'+Lg('🎯 Дальше:','🎯 Next:')+'</b> '+t+'</div>';}
function loginTomorrowDay(){const L=S.login,x=loginAvail();const n=L&&L.day===dayKey()?L.n:x&&x.cont?(L.n||0)+1:1;return n%7+1;}
function tomorrowHTML(){const a=[];
  if(S.login){const d=loginTomorrowDay();a.push(Lg('день '+d+' из 7 за вход: +'+fmtGold(loginTomorrow()),'login day '+d+' of 7: +'+fmtGold(loginTomorrow()))+(d===7?Lg(' и +10 мин ⏩',' and +10 min ⏩'):''));}
  a.push(Lg('казна накопит до '+fmtGold(afkRate()*afkCapH()),'the treasury piles up to '+fmtGold(afkRate()*afkCapH())));
  a.push(Lg('новые задания дня','new daily quests'));if(S.stars['0-5'])a.push(Lg('новое испытание дня','a new daily challenge'));
  return '<div class="goal tmr"><b>'+Lg('📅 Завтра:','📅 Tomorrow:')+'</b> '+a.join(' · ')+'</div>';}
// почему проиграл — по тому, что осталось на поле (диагностика: новичок проигрывает с непотраченными монетами и не знает почему)
function loseWhy(){const tws=G.tw.filter(Boolean),empty=G.map.spots.length-tws.length;let cheap=1e9;for(const t of TW_ORDER)if(towerUnlocked(t))cheap=Math.min(cheap,buildCost(t));
  const n=Math.min(empty,Math.floor(G.coins/cheap)),canUp=tws.some(t=>t.lvl<3&&G.coins>=upCost(t)),air=tws.filter(t=>t.st.air).length;
  if(n>=1&&tws.length<=4)return Lg('В кошельке осталось '+coinsTxt(G.coins)+' — хватило бы ещё на '+n+' '+plw(n,'заставу','заставы','застав')+'. Монеты за нечисть для того и нужны: ставь заставы прямо во время боя!','You had '+coinsTxt(G.coins)+' left — enough for '+n+' more '+(n===1?'outpost':'outposts')+'. That’s what monster coins are for: build outposts right in the middle of the battle!');
  if(n>=1||canUp)return Lg('В кошельке осталось '+coinsTxt(G.coins)+'. Трать сразу: новая застава на свободном месте или улучшение — над заставой горит стрелка ▲.','You had '+coinsTxt(G.coins)+' left. Spend them right away: a new outpost on a free spot or an upgrade — look for the ▲ arrow above an outpost.');
  if((G.leakFly||0)>=G.leaks*.4&&G.leaks>0&&air<3)return Lg('Прорвались летучие. Пушка, изба и дуб их не достают — летучих бьют только стрельцы и колдун. Поставь их побольше.','The flyers got through. The cannon, the hut and the oak can’t reach them — only archers and the sorcerer hit flyers. Build more of those.');
  if(G.leakedBoss)return Lg('Босс дошёл до ворот. Ставь заставы вдоль всей дороги, улучшай их и бей по боссу Громом Перуна.','The boss reached the gate. Line the whole road with outposts, upgrade them and strike the boss with Perun’s Thunder.');
  if(tws.length>=4&&tws.every(t=>t.lvl===1))return Lg('Все заставы 1-го уровня. Улучшай: нажми на заставу со стрелкой ▲ — второй уровень бьёт почти вдвое сильнее.','All your outposts are level 1. Upgrade them: tap an outpost with the ▲ arrow — level 2 hits almost twice as hard.');
  return pick(TIPS);}
/* ---------- итог Босса недели ---------- */
function weekEnd(dq0){const w=G.wk.w,b=CH[G.ci].boss,kill=!!G.wkKill;let pct=G.wkPct||0;
  if(!kill){const e=G.en.find(x=>!x.dead&&x.type===b);if(e)pct=Math.max(pct,1-e.hp/e.max);}
  const sc=weekScore(kill,pct,G.wkT||G.t);if(!S.wk||S.wk.w!==w)S.wk={w,best:0,got:0,runs:0};const W=S.wk;W.runs++;const rec=sc>W.best&&W.runs>1;W.best=Math.max(W.best,sc);
  const waves=Math.max(0,G.wave-(kill?0:1)),reward=siegeGold(waves);S.gold+=reward;let prize=0;
  if(kill&&!W.got){W.got=1;S.wkN=(S.wkN||0)+1;prize=weekReward();S.gold+=prize;boostAdd(600);}
  const bref=boostRefund(1);G.win=true;save();if(W.best>0)LB.set('weekly',w*WEEK_SCORE+W.best);
  const txt=kill?Lg(EN[b].n+' '+defeatedWord(b)+' за ',EN[b].n+' defeated in ')+fmtTime(G.wkT||G.t)+'!':pct>0?Lg('Сняли ','You took ')+dnum(Math.floor(pct*1000)/10)+Lg('% здоровья. Прокачай заставы — и ещё раз!','% of its health. Upgrade your outposts — and try again!'):Lg('До босса не дошли. Кузница и деревня помогут — и ещё раз!','You didn’t reach the boss. The forge and the village will help — try again!');
  const wv=s=>fmtWeek(s).replace(/^(победа за|урон|won in|damage) /,'');
  showModal('<h3>'+(kill?Lg('Босс недели повержен!','Boss of the Week defeated!'):Lg('Бой с Боссом недели','Boss of the Week battle'))+'</h3>'+(rec?'<p class="sub">'+Lg('🏆 Новый рекорд недели!','🏆 New weekly record!')+'</p>':'')+
    '<div class="say"><img src="'+ic(b)+'" alt=""><div>'+txt+'</div></div>'+
    '<div class="stats"><div><b>'+wv(sc)+'</b>'+(sc>=10000?Lg('победа за','won in'):Lg('урон по боссу','boss damage'))+'</div><div><b>'+wv(W.best)+'</b>'+Lg('лучшее за неделю','best this week')+'</div><div><b>'+G.kills+'</b>'+Lg('одолели','defeated')+'</div></div>'+bestTwHTML()+
    '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(reward)+'</b>'+(prize?'<br><b>'+Lg('Награда недели: +'+fmtGold(prize)+' и +10 мин ⏩','Weekly reward: +'+fmtGold(prize)+' and +10 min ⏩')+'</b>':'')+(bref>=1?'<br><span style="font-size:13px">'+BREF()+fmtBoost(bref)+'</span>':'')+'</div>'+dqNote(dq0)+
    '<div class="btns stick">'+(reward>0&&goldWanted()&&adOk()?'<button class="btn ad" id="rX2">'+Lg('🎬 Удвоить за рекламу: ещё +','🎬 Double for an ad: +')+fmtNum(reward)+'</button>':'')+(LB.ok()&&PLAT!=='vk'?'<button class="btn ghost" id="rWkLb">'+Lg('🏆 Таблица недели','🏆 Weekly leaderboard')+'</button>':'')+
    '<button class="btn big" id="rAgain">'+Lg('Ещё раз','Play again')+'</button><button class="btn ghost" id="rMap">'+Lg('В меню','Menu')+'</button></div>');
  on('rX2',()=>showRewarded(()=>{S.gold+=reward;save();toast('+'+fmtGold(reward));const x=$('rX2');if(x)x.remove();}));
  on('rWkLb',()=>afterAd(kill,()=>{lbSeg='weekly';toMenu('Siege');setTimeout(()=>{const x=$('lbBox');if(x)x.scrollIntoView({block:'center'});},60);}));
  on('rAgain',()=>afterAd(kill,startWeekly));on('rMap',()=>afterAd(kill,()=>toMenu('Siege')));}
/* ---------- итог испытания дня ---------- */
function dchEnd(win,dq0){const D=S.dch||{},R=DCH_RULES.find(r=>r.k===G.rule)||DCH_RULES[0],prize=!!(G.dchPrize&&win);let g=0;
  if(win){S.wins++;dqAdd('win',1);}
  if(G.dchPrize&&D.day===dayKey()){if(win){D.res=1;S.dchN=(S.dchN||0)+1;g=dchGold();S.gold+=g;boostAdd(300);}else D.res=2;}
  const bref=boostRefund(win?1:.5);if(win)G.win=true;save();
  showModal('<h3>'+(win?Lg('Испытание пройдено!','Challenge complete!'):Lg('Испытание не далось','Challenge failed'))+'</h3><p class="sub">'+Lg('«'+R.n+'»','“'+R.n+'”')+' · '+CH[G.ci].levels[G.li]+'</p>'+
    '<div class="say"><img src="'+ic('voevoda')+'" alt=""><div>'+(prize?Lg('Вот это воевода! Держи награду.','Now that’s a commander! Here’s your reward.'):win?Lg('Славно! Награда — за первую попытку дня, но умение дороже золота.','Glorious! The reward is for the first try of the day, but skill is worth more than gold.'):G.dchPrize?Lg('Не вышло. Награда была за первую попытку — завтра будет новое испытание.','No luck. The reward was for the first try — a new challenge comes tomorrow.'):Lg('Не вышло. Попробуй построить иначе!','No luck. Try building differently!'))+'</div></div>'+
    '<div class="stats"><div><b>'+G.kills+'</b>'+Lg('одолели','defeated')+'</div><div><b>'+G.leaks+'</b>'+Lg('прорвалось','got through')+'</div><div><b>'+fmtTime(G.t)+'</b>'+Lg('время','time')+'</div></div>'+bestTwHTML()+
    (prize?'<div class="card treasury" style="text-align:center"><b>+'+fmtGold(g)+Lg(' · ⏩ +5 мин',' · ⏩ +5 min')+'</b></div>':'')+(bref>=1?'<p class="sub">'+BREF()+fmtBoost(bref)+'</p>':'')+dqNote(dq0)+
    '<div class="btns stick"><button class="btn big" id="rMap">'+Lg('В меню','Menu')+'</button><button class="btn ghost" id="rAgain">'+Lg('Сыграть ещё (без награды)','Play again (no reward)')+'</button></div>');
  on('rAgain',()=>afterAd(win,startDaily));on('rMap',()=>afterAd(win,()=>toMenu('Siege')));}

/* ================= КУЗНИЦА ================= */
function renderForge(){const el=$('tabForge'),free=starsFree();
  let h='<h2>'+Lg('Кузница','Forge')+'</h2><p class="sub">'+Lg('Звёзды за бои тратятся на вечные улучшения застав. Есть звёзд: <b style="color:var(--gold)">'+free+'</b> из '+starsTotal()+'. Нажми на ступень, чтобы купить — в любом порядке. Сбросить можно бесплатно.','Stars from battles buy permanent outpost upgrades. Stars available: <b style="color:var(--gold)">'+free+'</b> of '+starsTotal()+'. Tap a step to buy it — in any order. You can reset for free.')+'</p>'+powerHTML();
  h+='<div class="g2">';
  for(const t of TW_ORDER){const d=TW[t],u=TW_UNLOCK[t],open=chOpen(u[0])&&(u[0]>0||lvOpen(0,u[1]));const own=FORGE_ORDER[t].filter(([k])=>fHas(t,k)).length;
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic('ti_'+t+'_3',112)+'"'+(open?'':' style="filter:brightness(0) opacity(.4)"')+'><div class="t"><b>'+d.n+'</b><span>'+(own<5?Lg('Выковано '+own+' из 5','Forged '+own+' of 5'):Lg('Всё выковано!','All forged!'))+' · '+statLine(t,tstat(t,1,0)).split(' · ').slice(0,2).join(' · ')+'</span></div></div>'+
      '<div class="tiers">'+FORGE_ORDER[t].map(([k,c])=>{const f=k==='sp'?FORGE_SP[t]:FORGE_T[k],has=fHas(t,k),can=forgeCan(t,k);
        return '<button class="'+(has?'on':can&&c<=free?'can':'')+'" data-t="'+t+'" data-k="'+k+'"><b>'+f.n+'</b><small>'+forgeShort(t,k)+'</small><i>'+(has?'✓':(can?'★'+c:'🔒'))+'</i></button>';}).join('')+'</div></div>';}
  h+='</div><h2>'+Lg('Чары и запасы','Spells and supplies')+'</h2><div class="g2">';
  for(const x of FORGE_EXTRA){const n=forgeN(x.k),max=x.cost.length;
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic(x.ic)+'"><div class="t"><b>'+x.n+'</b><span>'+(n<max?Lg('Дальше: ','Next: ')+x.d[n]:Lg('Всё выковано!','All forged!'))+'</span><div class="pips">'+x.cost.map((_,i)=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</div></div>'+
      (n<max?'<button class="btn gold" data-f="'+x.k+'" '+(free<x.cost[n]?'disabled':'')+'><img src="'+ic('star',40)+'">'+x.cost[n]+'</button>':'<span class="tag ok">'+Lg('Готово','Done')+'</span>')+'</div></div>';}
  h+='</div><button class="btn ghost big" id="fReset" style="margin-top:6px">'+Lg('Сбросить кузницу','Reset the forge')+'</button>';
  el.innerHTML=h;
  for(const b of el.querySelectorAll('[data-k]'))b.onclick=()=>{const t=b.dataset.t,k=b.dataset.k,f=k==='sp'?FORGE_SP[t]:FORGE_T[k],c=FORGE_ORDER[t].find(q=>q[0]===k)[1];
    if(fHas(t,k)){toast(f.n+': '+f.d);return;}if(!forgeCan(t,k)){toast(Lg('Сначала «'+FORGE_T[FORGE_T[k].need].n+'»','First “'+FORGE_T[FORGE_T[k].need].n+'”'));return;}
    if(starsFree()<c){toast(f.n+' ('+f.d+Lg(') — нужно звёзд: ',') — stars needed: ')+c);return;}const p0=powerNow(),d0=forgeSnap(t);fT(t)[k]=1;S.forgeT=nowMs();save();SND.up();toast(TW[t].n+': '+forgeDiff(t,d0,f.d)+powerToast(p0));renderForge();setPills();};
  for(const b of el.querySelectorAll('[data-f]'))b.onclick=()=>{const k=b.dataset.f,n=forgeN(k);const x=FORGE_EXTRA.find(q=>q.k===k);const cost=x.cost[n];
    if(starsFree()<cost)return;const p0=powerNow();S.forge[k]=n+1;S.forgeT=nowMs();save();SND.up();toast(x.n+': '+x.d[n]+powerToast(p0));renderForge();setPills();};
  on('fReset',()=>{if(!starsSpent())return;S.forge={};S.forgeT=nowMs();save();toast(Lg('Кузница сброшена — звёзды вернулись','Forge reset — your stars are back'));renderForge();setPills();});}

/* ---------- boost: видимый рост силы — «было → стало» в кузнице и деревне, число «Сила застав» ---------- */
function forgeShort(t,k){return k==='dmg1'?Lg('урон +10%','damage +10%'):k==='dmg2'?Lg('урон +15%','damage +15%'):k==='rng'?Lg('дальность +10%','range +10%'):k==='cheap'?Lg('цена −10%','cost −10%'):
  ({arch:Lg('крит 15%','crit 15%'),pushka:Lg('взрыв +25%','blast +25%'),izba:Lg('лужа +1,5 с','pool +1.5 s'),mag:Lg('+1 цель','+1 target'),dub:Lg('оглуш. +0,3 с','stun +0.3 s')})[t];}
// «Сила застав» — одно число, растёт с каждой покупкой в кузнице и деревне (только для наглядности, на бой не влияет)
function powerNow(){let n=100+3*starsSpent();for(const b of BLD)n+=4*(S.village[b.id]||0);return n;}
function powerHTML(){return '<div class="power"><span>'+Lg('⚔ Сила застав','⚔ Outpost power')+'</span><b>'+powerNow()+'</b></div>';}
function powerToast(p0){const p=powerNow();return p>p0?Lg(' · ⚔ сила ',' · ⚔ power ')+p0+' → '+p:'';}
function forgeSnap(t){const q=tstat(t,1,0);return {dmg:q.dmg!=null?q.dmg:q.dps,rng:q.rng,cost:buildCost(t)};}
function forgeDiff(t,a,def){const b=forgeSnap(t),f=v=>dnum(String(Math.round(v*10)/10));
  if(b.dmg!==a.dmg)return Lg('урон ','damage ')+f(a.dmg)+' → '+f(b.dmg);if(b.rng!==a.rng)return Lg('дальность ','range ')+f(a.rng)+' → '+f(b.rng);if(b.cost!==a.cost)return Lg('цена ','cost ')+a.cost+' → '+b.cost;return def;}
// что даст следующий уровень постройки: [подпись, сейчас, будет]
function bldDelta(id,l){const p=n=>n+'%';
  return ({wall:[Lg('жизней в бою','lives per battle'),20+l+3*forgeN('lives'),21+l+3*forgeN('lives')],fair:[Lg('монет на старте','starting coins'),'+'+25*l,'+'+25*(l+1)],
    range:[Lg('урон застав','outpost damage'),'+'+p(4*l),'+'+p(4*l+4)],smith:[Lg('цены застав','outpost prices'),'−'+p(4*l),'−'+p(4*l+4)],herb:[Lg('перезарядка чар','spell cooldown'),'−'+p(8*l),'−'+p(8*l+8)],
    mint:[Lg('казна в час','treasury per hour'),afkRate(),afkRate()+10],barn:[Lg('казна вмещает, ч','treasury holds, h'),afkCapH(),afkCapH()+2]})[id];}

/* ================= ДЕРЕВНЯ ================= */
function giftReady(){return S.runs>0&&nowMs()-(S.gift||0)>4*3600e3;}
// ближайшая постройка, на которую не хватает золота (для подсказок «в момент нужды»)
function nextBld(){let best=null;for(const b of BLD){const l=S.village[b.id]||0;if(l<b.cost.length&&(!best||b.cost[l]<best.c))best={n:b.name,c:b.cost[l]};}return best;}
function needV(){const b=nextBld();return b&&b.c>S.gold?{n:b.n,d:b.c-S.gold}:null;}
function needB(extra){const b=nextBld();return b&&b.c>S.gold&&b.c<=S.gold+extra?b.n:'';}
function renderVillage(){const el=$('tabVillage');const giftAmt=giftGold();
  let h='<h2>'+Lg('Деревня','Village')+'</h2><p class="sub">'+Lg('Золото из боёв тратим тут: постройки усиливают заставу во всех боях.','Spend battle gold here: buildings make your outposts stronger in every battle.')+'</p>'+powerHTML()+'<canvas id="vilCv" class="vilcv" aria-label="'+Lg('Твоя деревня','Your village')+'"></canvas>';
  {const g=afkGold(),cap=afkCapH(),h2=Math.max(0,Math.min(cap,(nowMs()-S.afkT)/3600e3));
    h+='<div class="card treasury"><div class="row"><img class="ic" src="'+ic('ingot')+'"><div class="t"><b>'+Lg('Казна: ','Treasury: ')+fmtGold(g)+'</b><span>'+Lg('Копится, пока тебя нет: '+afkRate()+' в час, вмещает '+cap+' ч','Fills up while you’re away: '+afkRate()+' per hour, holds '+cap+' h')+'</span><div class="bar"><i style="width:'+Math.round(h2/cap*100)+'%"></i></div></div>'+
      (g>=10?'<button class="btn gold" id="afkTake">'+Lg('Забрать','Collect')+'</button>':'')+'</div></div>';}
  h+='<div class="blds">';
  for(const b of BLD){const l=S.village[b.id]||0,max=b.cost.length,cost=b.cost[l];
    const dl=l<max?bldDelta(b.id,l):null;h+='<div class="card bld'+(l?' has':'')+'"><img src="'+ic(b.ic,112)+'"><b>'+b.name+'</b><span>'+b.about+'</span>'+(dl?'<em class="delta">'+dl[0]+': '+dl[1]+' → <b>'+dl[2]+'</b></em>':'')+
      '<div class="pips">'+Array.from({length:max},(_,i)=>'<i class="'+(i<l?'on':'')+'"></i>').join('')+'</div>'+
      (l>=max?'<span class="tag ok">'+Lg('Готово','Done')+'</span>':'<button class="btn gold" data-b="'+b.id+'" '+(S.gold<cost?'disabled':'')+'><img src="'+ic('ingot',40)+'">'+fmtNum(cost)+'</button>')+'</div>';}
  h+='</div>';
  h+=bannersHTML();
  h+=cosmeticsHTML();
  // все предложения за рекламу — одной карточкой ниже построек; за золото — только пока золоту есть куда идти (goldWanted)
  const g=afkGold(),bst=S.afkBoost&&S.afkBoost.day===dayKey()?S.afkBoost.n:0,offers=[],gw=goldWanted()&&adOk();
  if(g>=10&&gw)offers.push('<button class="btn ad" id="afkX2">'+Lg('🎬 Казна ×2 за рекламу: +','🎬 Treasury ×2 for an ad: +')+fmtGold(g*2)+'</button>');
  // «+2 часа казны» — только когда это ощутимо (с Мытным двором), иначе награда за рекламу смешная
  if(gw&&bst<2&&afkRate()*2>=40)offers.push('<button class="btn ad" id="afkBoost">'+Lg('🎬 +2 часа казны за рекламу: +','🎬 +2 treasury hours for an ad: +')+fmtGold(afkRate()*2)+' ('+(2-bst)+Lg(' из 2)',' of 2)')+'</button>');
  if(gw&&giftReady())offers.push('<button class="btn ad" id="giftBtn">'+Lg('🎬 Гостинец Яги за рекламу: +','🎬 Yaga’s treat for an ad: +')+fmtGold(giftAmt)+'</button>');
  if(adOk())offers.push('<button class="btn ad" id="vBoost">'+Lg('🎬 +10 мин ускорения за рекламу','🎬 +10 min of speed-up for an ad')+'</button>');
  if(offers.length)h+='<h2>'+Lg('Подарки','Gifts')+'</h2><div class="card gift"><div class="row" style="margin-bottom:8px"><img class="ic" src="'+ic('tetka')+'"><div class="t"><b>'+Lg('По желанию — за короткую рекламу','Optional — for a short ad')+'</b><span>'+
    (needV()?Lg('До «'+needV().n+'» не хватает '+fmtGold(needV().d)+'. ','You need '+fmtGold(needV().d)+' more for “'+needV().n+'”. '):'')+(!gw?Lg('Всё куплено — золото пусть копится на новые затеи.','Everything is bought — let the gold pile up for new ideas.'):S.runs>0&&!giftReady()?Lg('Тётушка печёт пироги: гостинец через '+Math.ceil((4*3600e3-(nowMs()-S.gift))/3600e3)+' ч','Auntie is baking pies: next treat in '+Math.ceil((4*3600e3-(nowMs()-S.gift))/3600e3)+' h'):Lg('Реклама не обязательна — всё можно заработать в боях.','Ads are optional — you can earn everything in battle.'))+'</span></div></div><div class="btns" style="margin-top:0">'+offers.join('')+'</div></div>';
  el.innerHTML=h;
  {const c=$('vilCv');if(c)drawVillage(c,c.clientWidth||Math.min(520,el.clientWidth||340),Math.round(Math.min(170,Math.max(120,(c.clientWidth||340)*.36))));}
  cosmeticsBind();bannersBind(el);
  const takeAfk=m=>{const g=afkGold();if(g<=0)return;S.gold+=g*m;S.afkT=nowMs();save();SND.coin();toast('+'+fmtGold(g*m)+Lg(' из казны',' from the treasury'));renderVillage();setPills();};
  on('vBoost',()=>openBoostOffer());
  on('afkTake',()=>takeAfk(1));on('afkX2',()=>showRewarded(()=>takeAfk(2)));
  on('afkBoost',()=>showRewarded(()=>{const bst=S.afkBoost&&S.afkBoost.day===dayKey()?S.afkBoost.n:0;const amt=afkRate()*2;S.afkBoost={day:dayKey(),n:bst+1};S.gold+=amt;save();SND.coin();toast('+'+fmtGold(amt));renderVillage();setPills();}));
  on('giftBtn',()=>showRewarded(()=>{S.gold+=giftAmt;S.gift=nowMs();save();SND.up();toast(Lg('Тётушка Яга: «Кушай, воевода!» +','Auntie Yaga: “Eat up, commander!” +')+fmtGold(giftAmt));renderVillage();setPills();}));
  for(const b of el.querySelectorAll('[data-b]'))b.onclick=()=>{const bd=BLD.find(x=>x.id===b.dataset.b),l=S.village[bd.id]||0,cost=bd.cost[l];if(S.gold<cost)return;
    const dl=bldDelta(bd.id,l),p0=powerNow();S.gold-=cost;S.village[bd.id]=l+1;save();SND.build();renderVillage();setPills();vilAnim(bd.id,bd.name+(l?': '+lvLbl(l+1):Lg(' построен'+({wall:'',herb:'а',range:'о',smith:'а',fair:'а'}[bd.id]||'')+'!',' built!')));
    toast(bd.name+' — '+dl[0]+': '+dl[1]+' → '+dl[2]+powerToast(p0));};}
// купил постройку — она «вырастает» на картинке деревни с искрами (вместо сухого тоста); картинка — сверху вкладки
function vilAnim(id,txt){const c=$('vilCv');if(!c){toast(txt);return;}const W=c.clientWidth,H=parseFloat(c.style.height)||c.clientHeight,t0=performance.now();
  if(c.getBoundingClientRect().bottom<60)c.scrollIntoView({block:'nearest'});
  const f=t=>{if(!c.isConnected)return;const q=Math.min(1,(t-t0)/1100);drawVillage(c,W,H,{id,q,txt});if(q<1)requestAnimationFrame(f);else drawVillage(c,W,H);};requestAnimationFrame(f);}

/* ---------- облики застав и украшения деревни (только внешний вид; открываются, когда деревня отстроена) ---------- */
function fbCard(){if(!skinFb()&&!(typeof payHere==='function'&&payHere()&&PAY.item('skins_firebird')))return '';
  const on=TW_ORDER.some(t=>skinOf(t)==='firebird');
  return '<div class="card"><div class="row"><img class="ic" src="'+ic('ti_arch_3~firebird',112)+'" alt=""><div class="t"><b>'+Lg('🔥 Облик «Жар-птица»','🔥 “Firebird” look')+'</b><span>'+Lg('Огненные перья на всех заставах. Только вид — сила та же.','Fiery feathers on every outpost. Looks only — same strength.')+'</span></div></div>'+
    (skinFb()?'<button class="btn" id="fbAll" style="width:100%;margin-top:8px">'+(on?Lg('Снять со всех застав','Remove from all outposts'):Lg('Надеть на все заставы','Put on all outposts'))+'</button>':payHtml(['skins_firebird']))+'</div>';}
function cosmeticsHTML(){
  if(!vilDone()){let n=0;for(const b of BLD)n+=b.cost.length-(S.village[b.id]||0);
    return fbCard()+'<div class="card" style="text-align:center"><b>'+Lg('🎨 Облики застав и украшения','🎨 Outpost looks and decorations')+'</b><br><span class="note">'+Lg('Откроются, когда деревня будет отстроена: осталось '+n+' '+plural(n,'улучшение','улучшения','улучшений')+'. Только для красоты — сил не прибавляют.','Unlock when the village is fully built: '+n+' '+(n===1?'upgrade':'upgrades')+' to go. Just for beauty — they add no strength.')+'</span></div>';}
  let h='<h2>'+Lg('Украшения деревни','Village decorations')+'</h2><p class="sub">'+Lg('Только для красоты — видно на картинке деревни.','Just for beauty — you’ll see them in the village picture.')+'</p><div class="blds">';
  for(const d of DECO){const has=S.deco[d.id];
    h+='<div class="card bld'+(has?' has':'')+'"><img src="'+ic('dc_'+d.id,112)+'" alt=""><b>'+d.n+'</b>'+(has?'<span class="tag ok">'+Lg('Стоит','Built')+'</span>':'<button class="btn gold" data-dc="'+d.id+'" '+(S.gold<d.cost?'disabled':'')+'><img src="'+ic('ingot',40)+'">'+fmtNum(d.cost)+'</button>')+'</div>';}
  h+='</div><h2>'+Lg('Облики застав','Outpost looks')+'</h2><p class="sub">'+Lg('Наряд для всех застав одного рода — в бою и на значках. Сила та же.','An outfit for every outpost of one kind — in battle and on the icons. Same strength.')+'</p>';
  for(const t of TW_ORDER){const cur=skinOf(t),own=SKINS.filter(k=>S.skins[t+'.'+k.id]).length;
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic('ti_'+t+'_3'+(cur?'~'+cur:''),112)+'" alt=""><div class="t"><b>'+TW[t].n+'</b><span>'+(cur?Lg('Облик: ','Look: ')+skinName(cur):Lg('Обычный облик','Standard look'))+Lg(' · куплено ',' · owned ')+own+Lg(' из ',' of ')+SKINS.length+'</span></div><button class="btn" data-sk="'+t+'">'+Lg('Выбрать','Choose')+'</button></div></div>';}
  return h;}
function cosmeticsBind(){
  const fa=$('fbAll');if(fa)fa.onclick=()=>{SND.click();const on=TW_ORDER.some(t=>skinOf(t)==='firebird');for(const t of TW_ORDER)if(on){if(S.skin[t]==='firebird')S.skin[t]='';}else S.skin[t]='firebird';save();renderVillage();};
  if(typeof PAY!=='undefined'&&PAY.on)PAY.bind($('tabVillage'));
  for(const b of document.querySelectorAll('[data-dc]'))b.onclick=()=>{const d=DECO.find(x=>x.id===b.dataset.dc);if(!d||S.deco[d.id]||S.gold<d.cost)return;
    S.gold-=d.cost;S.deco[d.id]=1;save();SND.build();toast(d.n+Lg(' — красота!',' — lovely!'));renderVillage();setPills();};
  for(const b of document.querySelectorAll('[data-sk]'))b.onclick=()=>{SND.click();openSkins(b.dataset.sk);};}
function openSkins(t){
  const cur=skinOf(t),opts=[{id:'',n:Lg('Обычный','Standard'),about:Lg('как построили','as built'),cost:0}].concat(SKINS),fb=skinFb()||typeof payHere==='function'&&payHere()&&!!PAY.item('skins_firebird');
  if(fb)opts.push(SKIN_FB);
  showModal('<h3>'+TW[t].n+Lg(': облик',': look')+'</h3><p class="sub">'+Lg('Только внешний вид: сила заставы не меняется. Есть у тебя: ','Looks only: the outpost’s strength doesn’t change. You have: ')+fmtGold(S.gold)+'.</p><div class="blds">'+
    opts.map(k=>{const has=!k.id||(k===SKIN_FB?skinFb():S.skins[t+'.'+k.id]),on=k.id===cur;
      if(k===SKIN_FB&&!has)return '<div class="card bld pv"><img src="'+ic('ti_'+t+'_3~firebird',112)+'" alt=""><b>'+k.n+'</b><span>'+k.about+Lg(' — покупка',' — purchase')+'</span>'+payHtml(['skins_firebird'])+'</div>';
      return '<div class="card bld pv'+(on?' has':'')+'"><img src="'+ic('ti_'+t+'_3'+(k.id?'~'+k.id:''),112)+'" alt=""><b>'+k.n+'</b><span>'+k.about+'</span>'+
        (on?'<span class="tag ok">'+Lg('Надет','On')+'</span>':has?'<button class="btn" data-sw="'+k.id+'">'+Lg('Надеть','Wear')+'</button>':'<button class="btn gold" data-sb="'+k.id+'" '+(S.gold<k.cost?'disabled':'')+'><img src="'+ic('ingot',40)+'">'+fmtNum(k.cost)+'</button>')+'</div>';}).join('')+
    '</div><div class="btns"><button class="btn ghost" id="skClose">'+Lg('Закрыть','Close')+'</button></div>');
  for(const b of document.querySelectorAll('[data-sw]'))b.onclick=()=>{SND.click();S.skin[t]=b.dataset.sw;save();openSkins(t);renderVillage();};
  for(const b of document.querySelectorAll('[data-sb]'))b.onclick=()=>{const k=SKINS.find(x=>x.id===b.dataset.sb);if(!k||S.gold<k.cost)return;
    S.gold-=k.cost;S.skins[t+'.'+k.id]=1;S.skin[t]=k.id;save();SND.up();toast(TW[t].n+Lg(': облик «'+k.n+'»',': “'+k.n+'” look'));openSkins(t);renderVillage();setPills();};
  on('skClose',()=>{hideModal();renderVillage();});
  if(typeof PAY!=='undefined'&&PAY.on){PAY.bind($('mBody'));PAY.re=()=>openSkins(t);}}

/* ================= ИСПЫТАНИЯ: Босс недели, испытание дня, осада, летопись ================= */
let lbSeg='weekly';
function wkMine(){const w=weekNo();return S.wk&&S.wk.w===w?S.wk:{w,best:0,got:0,runs:0};}
// доля летучих (по здоровью) на уровне — «Без стрельцов» только там, где колдун справится
function flyShare(c,l){let f=0,t=0;for(const w of mkWaves(c,l))for(const g of w.g){const d=EN[g.t],h=d.hp*g.n;t+=h;if(d.fly)f+=h;}return t?f/t:0;}
function magAt(c,l){const u=TW_UNLOCK.mag;return c>u[0]||(c===u[0]&&l>=u[1]);}
// испытание дня выбираем один раз в день и запоминаем: иначе после новой победы оно поменялось бы посреди дня
function dchToday(){const d=dayKey();if(S.dch&&S.dch.day===d)return S.dch;
  const done=Object.keys(S.stars).filter(k=>{if(!S.stars[k]||!/^\d+-\d+$/.test(k))return false;const q=k.split('-').map(Number);return dchLevelOk(q[0],q[1]);}).sort();if(!done.length)return null;
  const R=mulberry(+d.replace(/-/g,'')*7+3);let pick0=null;
  for(let n=0;n<40&&!pick0;n++){const k=done[Math.floor(R()*done.length)],cl=k.split('-').map(Number),r=DCH_RULES[Math.floor(R()*DCH_RULES.length)];
    if(r.need==='star3'&&S.stars[k]<3)continue;if(r.need==='mag'&&(!magAt(cl[0],cl[1])||flyShare(cl[0],cl[1])>.25))continue;pick0={c:cl[0],l:cl[1],rule:r.k};}
  S.dch=Object.assign({day:d,res:0,tried:0},pick0||{c:0,l:0,rule:'nospell'});save();return S.dch;}
function eventsReady(){if(!S.stars['0-5'])return false;const D=S.dch&&S.dch.day===dayKey()?S.dch:null;return !wkMine().runs||!D||!D.tried;}
function startWeekly(){hideModal();if(G&&!G.win&&!G.over){boostRefund(.5);save();}newBattle({week:weekNo()});enterBattle();
  if(!S.introSeen.wk){S.introSeen.wk=1;save();voice(Lg('Босс недели! '+EN[CH[G.ci].boss].n+' ведёт войско. В 9-й волне — сам босс, в 2,5 раза крепче обычного. Кто одолеет быстрее — того в летопись!','Boss of the Week! '+EN[CH[G.ci].boss].n+' leads the army. Wave 9 brings the boss himself, 2.5 times tougher than usual. The fastest victory goes into the chronicle!'),VOEV(),'voevoda',9);}}
function startDaily(){const D=dchToday();if(!D)return;hideModal();if(G&&!G.win&&!G.over){boostRefund(.5);save();}
  const prize=!D.tried&&!D.res;newBattle({ci:D.c,li:D.l,rule:D.rule});G.dchPrize=prize;enterBattle();
  const R=DCH_RULES.find(r=>r.k===D.rule)||DCH_RULES[0];voice(Lg('Испытание дня: «'+R.n+'». ','Daily challenge: “'+R.n+'”. ')+R.d,VOEV(),'voevoda',7);}
function renderSiege(){const el=$('tabSiege'),open=!!S.stars['0-5'];
  // Босс недели
  const w=weekNo(),wc=weekCh(w),wb=CH[wc].boss,m=wkMine(),lh=weekLeftH(),left=lh>=24?Math.floor(lh/24)+Lg(' дн. ','d ')+(lh%24)+Lg(' ч','h'):lh+Lg(' ч','h');
  const lockBtn='<button class="btn big" disabled>'+Lg('🔒 Освободи ','🔒 Free the ')+CH[0].name+'</button>';
  let h='<div class="g2"><div><h2>'+Lg('Босс недели','Boss of the Week')+'</h2><div class="card"><div class="row"><img class="ic" src="'+ic(wb)+'" alt=""><div class="t"><b>'+EN[wb].n+'</b><span>'+CH[wc].name+Lg('. 9 волн, в последней — сам босс, в 2,5 раза крепче обычного. Одолей быстрее всех — или сними побольше здоровья. Новый босс через ','. 9 waves, the last one brings the boss himself, 2.5 times tougher than usual. Win the fastest — or take off as much health as you can. New boss in ')+left+'.</span></div></div>'+
    '<div class="stats"><div><b>'+(m.best?fmtWeek(m.best).replace(/^(победа за|урон|won in|damage) /,''):'—')+'</b>'+(m.best>=10000?Lg('победа за','won in'):Lg('лучшее','best'))+'</div><div><b>'+m.runs+'</b>'+plw(m.runs,'попытка','попытки','попыток','try','tries')+'</div><div><b>'+(m.got?'✓':'+'+fmtNum(weekReward()))+'</b>'+(m.got?Lg('награда взята','reward taken'):Lg('за победу','for a win'))+'</div></div>'+
    '<div class="btns" style="margin-top:0">'+(open?'<button class="btn big" id="wkGo">'+swordImg()+Lg(' Сразиться',' Fight')+'</button>':lockBtn)+'</div></div>';
  // испытание дня
  const D=open?dchToday():null;
  if(D){const R=DCH_RULES.find(r=>r.k===D.rule)||DCH_RULES[0],ch=CH[D.c],en=levelEnemies(D.c,D.l);
    h+='</div><div><h2>'+Lg('Испытание дня','Daily challenge')+'</h2><div class="card"><div class="row"><img class="ic" src="'+ic(EN[en[en.length-1]].art||en[en.length-1])+'" alt=""><div class="t"><b>'+Lg('«'+R.n+'»','“'+R.n+'”')+' · '+ch.levels[D.l]+'</b><span>'+R.d+Lg(' Глава '+(D.c+1)+', уровень '+(D.l+1)+'.',' Chapter '+(D.c+1)+', level '+(D.l+1)+'.')+'</span></div></div>'+
      '<p class="sub" style="margin:8px 2px 0">'+(D.res===1?Lg('✅ Пройдено! Новое испытание — завтра.','✅ Complete! A new challenge comes tomorrow.'):D.tried?Lg('Награда была за первую попытку — завтра новое испытание. Сыграть можно для себя.','The reward was for the first try — a new challenge comes tomorrow. You can still play for fun.'):Lg('Награда за победу с первой попытки: +'+fmtGold(dchGold())+' и +5 мин ⏩','Reward for winning on the first try: +'+fmtGold(dchGold())+' and +5 min ⏩'))+'</p>'+
      '<div class="btns">'+(D.tried?'<button class="btn ghost big" id="dchGo">'+Lg('Сыграть для себя','Play for fun')+'</button>':'<button class="btn big" id="dchGo">'+swordImg()+Lg(' Принять вызов',' Accept the challenge')+'</button>')+'</div></div>';}
  h+='</div><div><h2>'+Lg('Бесконечная осада','Endless siege')+'</h2><p class="sub">'+Lg('Калинов мост. Нечисть идёт без конца, с каждой волной злее, каждые 10 волн — босс. Сколько продержишься?','Kalinov Bridge. Monsters keep coming, each wave nastier, a boss every 10 waves. How long can you hold?')+'</p>';
  h+='<div class="card"><div class="row"><img class="ic" src="'+ic('b_siege')+'" alt=""><div class="t"><b>'+Lg('Рекорд: ','Record: ')+(S.endBest||0)+' '+plw(S.endBest||0,'волна','волны','волн','wave','waves')+'</b><span>'+Lg('Золото за каждую волну. Жизни, кузница и деревня работают и тут.','Gold for every wave. Lives, the forge and the village work here too.')+'</span></div></div>'+
    '<div class="btns">'+(open?'<button class="btn big" id="endGo">'+swordImg()+Lg(' На Калинов мост',' To Kalinov Bridge')+'</button>':lockBtn)+'</div></div>';
  const crowns=Object.keys(S.crown||{}).length;
  h+='</div><div><h2>'+Lg('Летопись','Chronicle')+'</h2><div class="stats"><div><b>'+starsTotal()+'</b>'+Lg('звёзд','stars')+'</div><div><b>'+fmtNum(S.kills)+'</b>'+Lg('нечисти','monsters')+'</div><div><b>'+S.wins+'</b>'+Lg('побед','wins')+'</div>'+(crowns?'<div><b>👑 '+crowns+'</b>'+Lg('корон','crowns')+'</div>':'')+(S.dchN?'<div><b>'+S.dchN+'</b>'+Lg(plural(S.dchN,'испытание','испытания','испытаний')+' дня',S.dchN===1?'daily challenge':'daily challenges')+'</div>':'')+'</div>'+chronicleBtns()+'</div></div>';
  if(PLAT==='vk'&&LB.vkOk()){h+='<h2>Рекорды друзей</h2><div class="card"><p class="sub" style="margin:0 0 8px">Кто из друзей дольше держит Калинов мост?</p><button class="btn ghost big" id="vkLb">🏆 Таблица друзей</button></div>';}
  if(PLAT!=='vk'){h+='<h2>'+Lg('Рекорды Руси','Records of Rus')+'</h2>'+(LB.ok()?'<div class="seg"><button data-lb="weekly" class="'+(lbSeg==='weekly'?'on':'')+'">'+Lg('Босс недели','Boss of the Week')+'</button><button data-lb="endless" class="'+(lbSeg==='endless'?'on':'')+'">'+Lg('Осада','Siege')+'</button></div>':'')+
    '<div class="card" id="lbBox"><p class="sub" style="margin:0">'+(LB.ok()?Lg('Загружаем…','Loading…'):Lg('Общая таблица рекордов работает в Яндекс Играх.','The shared leaderboard works on Yandex Games.'))+'</p></div>';}
  el.innerHTML=h;achAfter();on('endGo',startEndless);on('wkGo',startWeekly);on('dchGo',startDaily);on('vkLb',()=>LB.vkFriends(S.endBest||0));chronicleBind();
  for(const b of el.querySelectorAll('[data-lb]'))b.onclick=()=>{SND.click();lbSeg=b.dataset.lb;for(const x of el.querySelectorAll('[data-lb]'))x.classList.toggle('on',x===b);loadLB();};
  if(LB.ok()&&PLAT!=='vk')loadLB();}
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
function loadLB(){const name=lbSeg,wn=weekNo(),box0=$('lbBox');if(!box0)return;box0.innerHTML='<p class="sub" style="margin:0">'+Lg('Загружаем…','Loading…')+'</p>';
  LB.get(name).then(r=>{const box=$('lbBox');if(!box||lbSeg!==name)return;let es=(r&&r.entries)||[];
    // таблица недели — одна на все недели: показываем только записи этой недели (счёт = неделя×100000 + очки)
    if(name==='weekly')es=es.filter(e=>Math.floor(e.score/WEEK_SCORE)===wn);
    const val=e=>name==='weekly'?fmtWeek(e.score):fmtNum(e.score);
    box.innerHTML=(es.length?es.map(e=>'<div class="lbrow'+(r.userRank===e.rank?' me':'')+'"><b>'+e.rank+'</b><span>'+esc((e.player&&e.player.publicName)||Lg('Воевода','Commander'))+'</span>'+val(e)+'</div>').join(''):'<p class="sub" style="margin:0">'+Lg('Пока пусто — будь первым!','Empty so far — be the first!')+'</p>')+
      (LB.authed()?'':'<button class="btn ghost" id="lbIn" style="margin-top:8px">'+Lg('Войти, чтобы попасть в таблицу','Sign in to get on the leaderboard')+'</button>');
    on('lbIn',async()=>{if(await LB.login()){LB.set('endless',S.endBest);const W=wkMine();if(W.best)LB.set('weekly',wn*WEEK_SCORE+W.best);renderSiege();}});});}
// кнопки книги нечисти и достижений (под летописью)
function chronicleBtns(){return typeof openBook==='function'?'<div class="btns h" style="margin-top:0"><button class="btn ghost" id="bookBtn">'+Lg('📖 Книга нечисти','📖 Monster book')+'</button><button class="btn ghost" id="achBtn">'+Lg('🏆 Достижения','🏆 Achievements')+'</button></div>':'';}
function chronicleBind(){if(typeof openBook==='function'){on('bookBtn',openBook);on('achBtn',openAch);}}
/* ---------- достижения ---------- */
function achCheck(){const got=[];for(const a of ACH){if(S.ach[a.id])continue;let v=0;try{v=a.v();}catch(e){}if(v>=a.goal){S.ach[a.id]=1;S.gold+=a.r;got.push(a);}}if(got.length){save();setPills();}return got;}
function achAfter(){const got=achCheck();if(!got.length)return;const g=got.reduce((x,a)=>x+a.r,0);
  setTimeout(()=>{SND.star(2);toast('🏆 '+(got.length===1?Lg('Достижение «'+got[0].n+'»','Achievement “'+got[0].n+'”'):Lg('Достижения: ','Achievements: ')+got.length)+' — +'+fmtGold(g));},1400);}
function openAch(){const n=ACH.filter(a=>S.ach[a.id]).length,list=ACH.slice().sort((a,b)=>(S.ach[a.id]?1:0)-(S.ach[b.id]?1:0));
  let h='<h3>'+Lg('🏆 Достижения','🏆 Achievements')+'</h3><p class="sub">'+Lg('Получено '+n+' из '+ACH.length+'. Награда — золото, приходит сразу.','Earned '+n+' of '+ACH.length+'. The reward is gold, paid right away.')+'</p>';
  for(const a of list){const got=!!S.ach[a.id];let v=0;try{v=Math.min(a.v(),a.goal);}catch(e){}
    h+='<div class="card ach'+(got?' got':'')+'"><div class="t"><b>'+(got?'✅ ':'')+a.n+'</b><span>'+a.d+Lg(' · награда ',' · reward ')+fmtGold(a.r)+'</span>'+
      (got||a.goal===1?'':'<div class="bar"><i style="width:'+Math.round(v/a.goal*100)+'%"></i></div><span>'+fmtNum(v)+' / '+fmtNum(a.goal)+'</span>')+'</div></div>';}
  showModal(h+'<div class="btns stick"><button class="btn big" id="achOk">'+Lg('Закрыть','Close')+'</button></div>');on('achOk',hideModal);}
/* ---------- Книга нечисти ---------- */
function bookStars(id){const n=(S.bk||{})[id]||0,t=EN[id].boss||id==='egg'?[1,5,20]:[10,100,1000];return t.filter(x=>n>=x).length;}
function openBook(){const n=BOOK.filter(bookKnown).length;
  let h='<h3>'+Lg('📖 Книга нечисти','📖 Monster book')+'</h3><p class="sub">'+Lg('Встретил в бою — записано в книгу. Открыто '+n+' из '+BOOK.length+'. Звёзды — за число одолённых. Нажми на картинку.','Meet it in battle — and it goes into the book. Discovered '+n+' of '+BOOK.length+'. Stars are for how many you defeat. Tap a picture.')+'</p>';
  for(const [title,list] of[[Lg('Нечисть','Monsters'),BOOK.filter(id=>!EN[id].boss&&id!=='egg')],[Lg('Боссы','Bosses'),BOOK.filter(id=>EN[id].boss||id==='egg')]]){
    h+='<div style="font-weight:900;margin:8px 2px 4px;color:#ffe7a0">'+title+'</div><div class="bgrid">';
    for(const id of list){const k=bookKnown(id),st=bookStars(id);
      h+='<button class="bcell'+(k?'':' lock')+'" data-bi="'+id+'"><img src="'+ic(EN[id].art||id,96)+'" alt=""><b>'+(k?EN[id].n:'???')+'</b>'+(k?'<i>'+'★'.repeat(st)+'<u>'+'★'.repeat(3-st)+'</u></i>':'')+'</button>';}
    h+='</div>';}
  showModal(h+'<div class="btns stick"><button class="btn big" id="bkOk">'+Lg('Закрыть книгу','Close the book')+'</button></div>');on('bkOk',hideModal);
  for(const b of document.querySelectorAll('[data-bi]'))b.onclick=()=>{SND.click();openBeast(b.dataset.bi);};}
function openBeast(id){const d=EN[id],k=bookKnown(id),n=(S.bk||{})[id]||0,boss=d.boss||id==='egg';
  const spd=d.spd===0?Lg('не ходит','doesn’t'):d.spd<30?Lg('медленно','slowly'):d.spd<45?Lg('не спеша','steadily'):d.spd<60?Lg('шустро','briskly'):Lg('очень быстро','very fast');
  const goal=(boss?[1,5,20]:[10,100,1000]).find(x=>n<x);
  let h='<div class="beast'+(k?'':' lock')+'"><img src="'+ic(d.art||id,200)+'" alt=""></div><h3>'+(k?d.n:Lg('Неведомая нечисть','Unknown monster'))+'</h3>';
  if(k){h+='<p class="sub" style="color:#e8e4f4">'+(LORE[id]||d.about)+'</p><div class="stats"><div><b>'+fmtNum(n)+'</b>'+Lg('одолено','defeated')+'</div><div><b>'+fmtNum(d.hp)+'</b>'+Lg('здоровье (глава 1)','health (chapter 1)')+'</div><div><b style="font-size:15px">'+spd+'</b>'+Lg('ходит','moves')+'</div></div>'+
      '<div class="card"><b style="color:#ffe7a0">'+Lg('Что умеет','What it does')+'</b><br>'+d.about+'<br><b style="color:#ffe7a0">'+Lg('Совет воеводы','Commander’s tip')+'</b><br>'+bookTip(id)+'</div>'+
      '<p class="sub">'+Lg('Где водится: ','Found in: ')+bookWhere(id)+'. '+(goal?Lg('До следующей звезды: одолей ещё '+fmtNum(goal-n)+'.','Next star: defeat '+fmtNum(goal-n)+' more.'):Lg('Все три звезды — нечисть тебя боится!','All three stars — the monsters fear you!'))+'</p>';}
  else h+='<p class="sub">'+Lg('Эта нечисть тебе ещё не встречалась. Говорят, водится здесь: ','You haven’t met this monster yet. Rumor has it, it lives here: ')+bookWhere(id)+'.</p>';
  showModal(h+'<div class="btns stick"><button class="btn big" id="bstBack">'+Lg('К книге','Back to the book')+'</button></div>');on('bstBack',openBook);}

/* ================= настройки ================= */
// VK: друзья, избранное, сообщество, «Ещё игры» (модуль SOC); наград нет (правила VK 2.6.2)
function openSocial(){if(!SOC.ok()){openSettings();return;}
  showModal('<h3>Друзья и игры</h3>'+SOC.settingsHtml()+'<div class="btns"><button class="btn ghost" id="socBack">← Назад</button></div>');
  SOC.bind($('mBody'),openSocial);on('socBack',openSettings);}
function updMore(){const b=$('btnMore');if(b)b.style.display=SOC.ok()?'':'none';}
function openSettings(){const oo=v=>v?Lg('Вкл','On'):Lg('Выкл','Off');showModal('<h3>'+Lg('Настройки','Settings')+'</h3>'+
  // язык: в VK всегда русский — переключателя нет
  (LANG_VK?'':'<div class="tg">'+Lg('Язык','Language')+' <div class="seg" style="margin:0;flex:none"><button data-lang="ru" class="'+(LANG==='ru'?'on':'')+'" style="padding:4px 14px">RU</button><button data-lang="en" class="'+(LANG==='en'?'on':'')+'" style="padding:4px 14px">EN</button></div></div>')+
  '<div class="tg">'+Lg('Звуки','Sounds')+' <button class="btn '+(S.sound?'green':'ghost')+'" id="sSnd">'+oo(S.sound)+'</button></div>'+
  '<div class="tg">'+Lg('Музыка','Music')+' <button class="btn '+(S.music?'green':'ghost')+'" id="sMus">'+oo(S.music)+'</button></div>'+
  '<div class="tg">'+Lg('Тряска экрана','Screen shake')+' <button class="btn '+(S.shake?'green':'ghost')+'" id="sShk">'+oo(S.shake)+'</button></div>'+
  '<div class="tg" style="border:0;padding-bottom:0">'+Lg('Сложность кампании','Campaign difficulty')+'</div>'+diffSegHTML()+
  '<p class="sub" style="margin-top:12px">'+Lg('Тридевятая оборона: защита башен.<br>Реклама за награду — по желанию. Между боями иногда бывает короткая реклама.','Thrice-Nine Defense: fairy-tale tower defense.<br>Rewarded ads are optional. A short ad sometimes plays between battles.')+'</p>'+
  (SOC.ok()?'<button class="btn ghost" id="sSoc" style="width:100%;margin-top:8px;justify-content:center">👥 Друзья и игры ›</button>':'')+
  '<div class="btns stick"><button class="btn ghost" id="sCred">'+Lg('🎻 Благодарности','🎻 Credits')+'</button><button class="btn big" id="sOk">'+Lg('Готово','Done')+'</button></div>');
  for(const b of document.querySelectorAll('[data-lang]'))b.onclick=()=>{SND.click();setLang(b.dataset.lang,true);openSettings();};
  on('sSnd',()=>{S.sound=S.sound?0:1;save();openSettings();});on('sMus',()=>{S.music=S.music?0:1;save();musicSync();openSettings();});on('sOk',hideModal);
  on('sShk',()=>{S.shake=S.shake?0:1;save();openSettings();});on('sCred',openCredits);on('sSoc',openSocial);diffSegBind();
  // покупки Яндекса (js/pay.js) — только в меню; нет платежей — раздела нет
  if(typeof payHere==='function'&&payHere()){const c=document.createElement('div');c.innerHTML=payHtml()+'<button class="btn ghost" id="payRe" style="width:100%;margin-top:4px">'+Lg('↻ Восстановить покупки','↻ Restore purchases')+'</button>';
    const b=$('mBody').querySelector('.btns');b.parentNode.insertBefore(c,b);PAY.bind(c);PAY.re=openSettings;on('payRe',()=>PAY.again());}}

/* ================= благодарности: музыка чужая, подпись авторов обязательна по лицензии =================
   Ссылок нет: правила площадок запрещают кликабельные ссылки; адреса автора и лицензии — обычным текстом (так требует CC BY). */
const CREDITS=[
  {t:'Medieval: Market Day',w:'меню, деревня, кузница',we:'menu, village, forge',a:'RandomMind',l:'CC0 (общественное достояние)',le:'CC0 (public domain)'},
  {t:'Zombies also love to play the fool',w:'бой (из альбома «In Russian Style»)',we:'battle (from the album “In Russian Style”)',a:'Alexandr Zhelanov, soundcloud.com/alexandr-zhelanov',l:'CC BY 3.0: creativecommons.org/licenses/by/3.0/'},
  {t:'Brave Soldiers',w:'бой с боссом',we:'boss battle',a:'Alexandr Zhelanov, soundcloud.com/alexandr-zhelanov',l:'CC BY 3.0: creativecommons.org/licenses/by/3.0/'}];
function openCredits(){
  showModal('<h3>'+Lg('Благодарности','Credits')+'</h3><p class="sub">'+Lg('Музыка, под которую застава держит оборону. Спасибо авторам!','The music our outpost holds the line to. Thanks to the authors!')+'</p>'+
    CREDITS.map(c=>'<div class="card cred"><b>'+Lg('«'+c.t+'»','“'+c.t+'”')+'</b> <span class="mutd">— '+Lg(c.w,c.we)+'</span><br>'+
      Lg('Автор: ','Author: ')+c.a+'<br>'+Lg('Лицензия: ','License: ')+Lg(c.l,c.le||c.l)+'<br>'+Lg('Источник: OpenGameArt (opengameart.org). Перекодировано в AAC, моно.','Source: OpenGameArt (opengameart.org). Re-encoded to AAC, mono.')+'</div>').join('')+
    (PLAT==='vk'?'<div class="card cred"><b>VK Bridge</b> — библиотека для VK Игр. © 2017-present, V Kontakte, LLC. Лицензия MIT.</div>':'')+
    '<div class="btns stick"><button class="btn big" id="credOk">'+Lg('Назад','Back')+'</button></div>');on('credOk',openSettings);}

/* ================= задания дня (3) и награда за вход (7 дней) =================
   Задания выбираются по дате, прогресс — по итогам боя (onBattleEnd). Все три — ещё +5 мин ускорения.
   Вход: день серии засчитывается с первой победы; пропуск одного дня серию не рвёт, двух и больше — с начала. */
function dqToday(){const d=dayKey();if(!S.dq||S.dq.day!==d){const R=mulberry(+d.replace(/-/g,'')),pool=QUESTS.filter(q=>!q.need||q.need()),list=[];
    while(list.length<3&&pool.length){const q=pool.splice(Math.floor(R()*pool.length),1)[0];list.push({k:q.k,goal:q.goal[Math.floor(R()*q.goal.length)],n:0,got:0});}
    S.dq={day:d,list,bonus:0};}return S.dq;}
function dqDone(){return dqToday().list.filter(q=>q.n>=q.goal).length;}
function dqAdd(k,v){if(!v)return;const q=dqToday().list.find(x=>x.k===k);if(q&&q.n<q.goal)q.n=Math.min(q.goal,q.n+v);}
function dqClaimable(){if(!S.wins)return false;const D=dqToday();return D.list.some(q=>q.n>=q.goal&&!q.got)||(!D.bonus&&D.list.every(q=>q.got));}
function dqNote(before){const n=dqDone();return n>before&&S.wins?'<p class="sub" style="margin:8px 0 0">'+Lg('✅ Задание дня выполнено ('+n+' из 3) — награда на карте','✅ Daily quest done ('+n+' of 3) — claim the reward on the map')+'</p>':'';}
function renderQuests(){const box=$('dqBox');if(!box)return;if(!S.wins){box.innerHTML='';return;}const D=dqToday();
  let h='<div class="card"><b style="font-size:17px">'+Lg('Задания дня','Daily quests')+'</b>';
  for(let i=0;i<D.list.length;i++){const q=D.list[i],Q=QUESTS.find(x=>x.k===q.k),ok=q.n>=q.goal;
    h+='<div class="qrow"><div class="t"><b>'+Q.n+': '+fmtNum(q.goal)+'</b><div class="bar"><i style="width:'+Math.round(q.n/q.goal*100)+'%"></i></div><span>'+fmtNum(q.n)+' / '+fmtNum(q.goal)+'</span></div>'+
      (q.got?'<span class="tag ok">✓</span>':'<button class="btn gold" data-q="'+i+'" '+(ok?'':'disabled')+'><img src="'+ic('ingot',40)+'">'+questGold(Q)+'</button>')+'</div>';}
  if(!D.bonus)h+='<div class="qrow"><div class="t"><b>'+Lg('Все три задания','All three quests')+'</b><span>'+Lg('Сундук дня: +5 мин ускорения','Daily chest: +5 min of speed-up')+'</span></div><button class="btn gold" id="dqBonus" '+(D.list.every(q=>q.got)?'':'disabled')+'>'+Lg('⏩ +5 мин','⏩ +5 min')+'</button></div>';
  h+='<span class="note">'+Lg('Новые задания — завтра.','New quests tomorrow.')+'</span></div>';box.innerHTML=h;
  for(const b of box.querySelectorAll('[data-q]'))b.onclick=()=>{const q=D.list[+b.dataset.q],Q=QUESTS.find(x=>x.k===q.k);if(q.got||q.n<q.goal)return;q.got=1;const g=questGold(Q);S.gold+=g;save();SND.coin();toast(Lg('Задание дня: +','Daily quest: +')+fmtGold(g));renderQuests();setPills();};
  on('dqBonus',()=>{if(D.bonus||!D.list.every(q=>q.got))return;D.bonus=1;boostAdd(DQ_BONUS);save();SND.up();toast(Lg('Сундук дня: +5 мин ускорения','Daily chest: +5 min of speed-up'));renderQuests();setPills();});}
function dayDiff(a,b){const p=s=>{const x=s.split('-').map(Number);return new Date(x[0],x[1]-1,x[2]).getTime();};return Math.round((p(b)-p(a))/864e5);}
// что можно забрать сегодня: {idx — день серии 0..6, cont — серия продолжается}; null — уже забрано или серия ещё не начата
function loginAvail(){const L=S.login;if(!L||!L.day)return null;const d=dayKey();if(L.day===d)return null;const gap=dayDiff(L.day,d),cont=gap>=1&&gap<=2;return {idx:cont?(L.n||0)%7:0,cont};}
function loginGive(idx){const g=LOGIN_GOLD[idx];S.gold+=g;if(idx===6)boostAdd(600);return g;}
function loginFirst(){S.login={day:dayKey(),n:1};return loginGive(0);}
function loginTomorrow(){const L=S.login,x=loginAvail();const n=L&&L.day===dayKey()?L.n:x&&x.cont?(L.n||0)+1:1;return LOGIN_GOLD[n%7];}
function loginOffer(){const x=loginAvail();if(!x||$('modal').classList.contains('on'))return false;
  const cells=LOGIN_GOLD.map((g,i)=>'<div class="dcell'+(i<x.idx?' got':'')+(i===x.idx?' now':'')+'"><small>'+Lg((i+1)+' день','Day '+(i+1))+'</small><b>'+g+'</b>'+(i===6?'<small>'+Lg('+10 мин ⏩','+10 min ⏩')+'</small>':'')+'</div>').join('');
  showModal('<h3>'+Lg('Награда за вход','Daily login reward')+'</h3><p class="sub">'+(x.cont?Lg('День '+(x.idx+1)+' из 7. Заходи каждый день — награда растёт.','Day '+(x.idx+1)+' of 7. Come back every day — the reward grows.'):Lg('Серия началась заново — заходи каждый день, награда растёт. Один пропуск прощаем.','The streak starts over — come back every day and the reward grows. One missed day is forgiven.'))+'</p>'+
    '<div class="days">'+cells+'</div><div class="btns"><button class="btn gold big" id="lgGet"><img src="'+ic('ingot',40)+'">'+Lg('Забрать +','Collect +')+LOGIN_GOLD[x.idx]+'</button></div>');
  on('lgGet',()=>{const L=S.login||{n:0};S.login={day:dayKey(),n:(x.cont?(L.n||0):0)+1};const g=loginGive(x.idx);save();SND.up();toast('+'+fmtGold(g)+(x.idx===6?Lg(' и +10 мин ускорения',' and +10 min of speed-up'):''));hideModal();openTab(curTab);});
  return true;}
/* ярлык, оценка, избранное — не чаще одного предложения за сессию, после победы, с 3-й победы и не в первые 2 минуты; спросили — запомнили */
let retAsked=false;
async function retOffer(){if(G||retAsked||S.wins<3||Date.now()-BOOT_T<120000||Date.now()-lastAdT<60000||$('modal').classList.contains('on'))return;const R=S.ret;
  const ask=(k,fn)=>{retAsked=true;R[k]=1;save();try{const p=fn();p&&p.catch&&p.catch(()=>{});}catch(e){}};
  try{if(ysdk){
      if(!R.review&&S.wins>=5&&ysdk.feedback){const c=await ysdk.feedback.canReview();if(c&&c.value)return ask('review',()=>ysdk.feedback.requestReview());}
      if(!R.short&&ysdk.shortcut){const c=await ysdk.shortcut.canShowPrompt();if(c&&c.canShow)return ask('short',()=>ysdk.shortcut.showPrompt());}}
    // VK: избранное, экран «Домой», друзья, сообщество — через SOC.offer в окне победы (п. 2.6.3), тут только Яндекс
  }catch(e){}}
// силуэт закрытой главы — один раз, без медленного canvas filter на каждом кадре карты
function silhouette(key){const id='sil:'+key;if(mapCache[id])return mapCache[id];const s=artCanvas(key,128),c=document.createElement('canvas');c.width=c.height=128;
  const g=c.getContext('2d');g.drawImage(s,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,128,128);return mapCache[id]=c;}

/* ================= запуск ================= */
function onSaveMerged(){if(!G){openTab(curTab);loginOffer();}}
// язык сменился (js/lang.js): меню и HUD перерисовать; окна перерисовывает тот, кто сменил (настройки)
function onLang(){for(const k in HUDC)delete HUDC[k];if(typeof cv==='undefined'||!cv)return;if(G)hudTick(true);else if($('menu'))openTab(curTab);}
function onReady(){
  cv=$('cv');ctx=cv.getContext('2d');
  $('btnMore').onclick=()=>{SND.click();SOC.showMore();};updMore();
  $('hLives').querySelector('span').id='hLivesT';$('hCoins').querySelector('span').id='hCoinsT';
  $('icHeart').src=ic('heart',64);$('icCoin').src=ic('coin',64);$('icThunder').src=ic('sp_thunder',112);$('icCat').src=ic('sp_cat',112);
  $('pStarIc').src=ic('star',48);$('pGoldIc').src=ic('ingot',48);
  $('nav1').src=ic('b_map');$('nav2').src=ic('b_forge');$('nav3').src=ic('b_vil');$('nav4').src=ic('b_siege');
  for(const b of document.querySelectorAll('nav button'))b.onclick=()=>{SND.click();openTab(b.dataset.tab);};
  on('setBtn',openSettings);
  layout();initInput();window.addEventListener('resize',()=>{layout();if(!G&&curTab==='Map')drawMap();if(ringI>=0)ringBuild();});
  mapSel=S.lastCh||0;
  /* первый шаг — после облака: на новом устройстве у игрока может быть весь прогресс в облаке. Есть SDK или настоящий VK —
     ждём облако до 3 с (заставка ещё на экране), потом решаем: новичок — сразу в бой 1-1, иначе меню и «Награда за вход»
     (награда за вход до облака дала бы забрать её второй раз на втором устройстве) — аудит 14 */
  const t0=Date.now(),wait=!!ysdk||VK_REAL;
  const go=()=>{if(wait&&!cloudLoaded&&Date.now()-t0<3000){setTimeout(go,100);return;}
    dailyBoost();openTab('Map');$('loading').style.display='none';
    // новичок — сразу в первый бой, без окна и стены текста (разблокировка звука — в core.js, на любое касание)
    if(!S.tut){S.tut=1;save();setTimeout(()=>{if(!G)startLevel(0,0);},250);}
    else if(!loginOffer()&&afkGold()>=afkReadyAt())toast(Lg('В казне накопилось ','Your treasury has piled up ')+fmtGold(afkGold())+'!');};
  go();
  window.addEventListener('orientationchange',()=>setTimeout(()=>window.dispatchEvent(new Event('resize')),300));
  requestAnimationFrame(loop);
  setInterval(()=>{if(!G&&curTab==='Village')renderVillage();setPills();},30000);
  if(/[?&](bot|shot)/.test(location.search))loadScript('tools/bot.js').then(()=>SHOT&&loadScript('tools/promo.js')).catch(()=>{});
  window.__test={get G(){return G;},update,render,layout,newBattle,startLevel,startEndless,tryBuild,tryUpgrade,callWave};
}
initSDK();
