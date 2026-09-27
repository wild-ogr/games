'use strict';
/* ================= Меню, окна, интерфейс боя ================= */
let curTab='Map',mapSel=0;
function showModal(html){$('mBody').innerHTML=html;$('modal').classList.add('on');}
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
function setPills(){$('pGold').textContent=fmtNum(S.gold);$('pStar').textContent=starsFree();
  $('navF').classList.toggle('dot',canForge());$('navV').classList.toggle('dot',afkGold()>=afkReadyAt()||giftReady());$('navM').classList.toggle('dot',dqClaimable()||!!loginAvail());$('navS').classList.toggle('dot',eventsReady());}
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
  el.innerHTML='<canvas id="mapCv"></canvas><div id="chCard"></div><div id="dqBox"></div>';drawMap();renderChCard();renderQuests();
  $('mapCv').onclick=e=>{const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    let best=-1,bd=.012;MAPPOS.forEach((p,i)=>{const d=(p[0]-x)**2+((p[1]-y)*1.3)**2;if(d<bd){bd=d;best=i;}});
    if(best>=0){SND.click();if(!chOpen(best)){toast('Сначала освободи «'+CH[best-1].name+'»');return;}mapSel=best;S.lastCh=best;drawMap();renderChCard();}};}
function drawMap(cvm,W,d){cvm=cvm||$('mapCv');if(!cvm)return;const fixed=!!W;W=W||cvm.clientWidth||340;const H=Math.round(fixed?W*1.2:Math.min(W*1.2,Math.max(300,innerHeight*.5)));d=d||Math.min(2.5,window.devicePixelRatio||1);cvm.width=W*d;cvm.height=H*d;cvm.style.height=H+'px';
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
    '<button class="btn" id="playNext">'+swordImg()+(S.stars[lvKey(c,nl)]?'Ещё':'Играть')+'</button></div><div class="lvls">';
  let nextSet=false;
  for(let l=0;l<6;l++){const open=lvOpen(c,l),st=S.stars[lvKey(c,l)]||0,next=open&&!st&&!nextSet;if(next)nextSet=true;
    h+='<button class="lvl'+(l===5?' boss':'')+(open?'':' lock')+(next?' next':'')+'" data-l="'+l+'">'+(S.crown[lvKey(c,l)]?'<i class="cr">👑</i>':'')+'<span class="n">'+(l===5?'☠':l+1)+'</span><span>'+ch.levels[l]+'</span><span class="st3">'+
      [0,1,2].map(i=>'<img src="'+ic(i<st?'star':'star0',40)+'">').join('')+'</span></button>';}
  h+='</div></div>';$('chCard').innerHTML=h;
  on('playNext',()=>openIntro(c,nl));
  for(const b of document.querySelectorAll('.lvl'))b.onclick=()=>{SND.click();const l=+b.dataset.l;if(!lvOpen(c,l)){toast('Сначала пройди предыдущий уровень');return;}openIntro(c,l);};}

/* ---------- окно перед боем ---------- */
function levelEnemies(c,l){const set=new Set();for(const w of mkWaves(c,l))for(const g of w.g)set.add(g.t);return [...set];}
function openIntro(c,l){const ch=CH[c],en=levelEnemies(c,l),st=S.stars[lvKey(c,l)]||0;S.introSeen[lvKey(c,l)]=1;   // реплика уже в окне — в бою речью не повторяем
  const news=[];for(const t in TW_UNLOCK){const u=TW_UNLOCK[t];if(u[0]===c&&u[1]===l)news.push({ic:'ti_'+t+'_1',n:TW[t].n,a:TW[t].about});}
  if(BRANCH_UNLOCK[0]===c&&BRANCH_UNLOCK[1]===l)news.push({ic:'ti_arch_4a',n:'Мастера',a:'Заставы 3-го уровня теперь можно улучшить в одну из двух веток.'});
  for(const k in SPELL_UNLOCK){const u=SPELL_UNLOCK[k];if(u[0]===c&&u[1]===l)news.push({ic:k==='thunder'?'sp_thunder':'sp_cat',n:SPELLS[k].n,a:SPELLS[k].about});}
  let h='<h3>'+(l===5?'☠ ':'')+ch.levels[l]+'</h3><p class="sub">Глава '+(c+1)+' · '+ch.name+' · '+(LEVEL_WAVES[l]+(c>=4?1:0))+' '+plural(LEVEL_WAVES[l]+(c>=4?1:0),'волна','волны','волн')+(st?' · лучший итог: '+'★'.repeat(st):'')+'</p>';
  h+='<div class="say"><img src="'+ic('voevoda')+'"><div><b class="who">Воевода Потап</b>'+ch.intro[l]+'</div></div>';
  if(news.length){h+='<div style="font-weight:900;margin:8px 2px 2px;color:#ffe7a0">Новое!</div>';for(const n of news)h+='<div class="enl"><img src="'+ic(n.ic)+'"><div><b>'+n.n+'</b>'+n.a+'</div></div>';}
  const newEn=en.filter(t=>!S.seen[t]&&!EN[t].boss);
  if(newEn.length){h+='<div style="font-weight:900;margin:8px 2px 2px;color:#ffe7a0">Новая нечисть</div>';for(const t of newEn)h+='<div class="enl"><img src="'+ic(EN[t].art||t)+'"><div><b>'+EN[t].n+(EN[t].fly?' · летает':'')+'</b>'+EN[t].about+'</div></div>';}
  h+='<div class="ens">'+en.filter(t=>!newEn.includes(t)).map(t=>'<div><img src="'+ic(EN[t].art||t)+'">'+EN[t].n+'</div>').join('')+'</div>';
  h+='<div style="font-weight:900;margin:10px 2px 0;color:#ffe7a0">Сложность'+(S.crown[lvKey(c,l)]?' · 👑 корона взята':'')+'</div>'+diffSegHTML();
  h+='<div class="btns"><button class="btn big" id="goBtn">'+swordImg()+' В бой!</button><button class="btn ghost" id="backBtn">Назад</button></div>';
  showModal(h);diffSegBind();on('goBtn',()=>startLevel(c,l));on('backBtn',hideModal);}
function diffSegHTML(){const d=diffNow();return '<div class="seg" id="dfSeg">'+DIFF.map((x,i)=>'<button data-df="'+i+'" class="'+(i===d?'on':'')+'">'+x.n+'</button>').join('')+'</div><p class="note" id="dfTxt" style="margin:0 2px">'+DIFF[d].d+'</p>';}
function diffSegBind(){for(const b of document.querySelectorAll('[data-df]'))b.onclick=()=>{SND.click();S.diff=+b.dataset.df;save();
  for(const x of document.querySelectorAll('[data-df]'))x.classList.toggle('on',x===b);const t=$('dfTxt');if(t)t.textContent=DIFF[S.diff].d;};}

/* ================= БОЙ: запуск ================= */
function startLevel(c,l){hideModal();if(G&&!G.win){boostRefund(.5);save();}S.lastCh=c;mapSel=c;const g=newBattle({ci:c,li:l});enterBattle();{const p=pityCoins(c,l);if(p)setTimeout(()=>toast('Подмога воеводы: +'+p+' монет на старте'),600);}
  const k=lvKey(c,l);
  if(g.tut===1){S.introSeen[k]=1;save();setTimeout(()=>{if(G&&G.tut===1)voice('Нечисть лезет из леса! Нажми на мигающее место у дороги и выбери стрельцов.','Воевода Потап','voevoda',30);},500);}
  else if(!S.introSeen[k]){S.introSeen[k]=1;save();voice(CH[c].intro[l],'Воевода Потап','voevoda',8);}}
function startEndless(){hideModal();if(G&&!G.win&&!G.over){boostRefund(.5);save();}newBattle({endless:true,ci:2});enterBattle();if(!S.introSeen.end){S.introSeen.end=1;save();}else return;voice('Бесконечная осада на Калиновом мосту! Волны всё злее. Держись сколько сможешь — рекорд запишем в летопись.','Воевода Потап','voevoda',8);}
function enterBattle(){document.body.classList.add('run');closeRing();layout();musicMode('battle');hudTick(true);}
let voiceT=0;
function voice(text,who,img,dur){$('voiceImg').src=ic(img||'voevoda');$('voiceTxt').innerHTML='<b>'+(who||'Воевода Потап')+'</b>'+text;$('voice').classList.add('on');
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
  if(!G.started){lbl=swordImg()+' В бой!';go=true;}
  else if(G.nextT>0){const b=Math.round(G.nextT*(1+G.ci*.15)*(G.endless?1.5:1));lbl='🔔 Волна раньше<small>+'+coinsTxt(b)+' · '+Math.ceil(G.nextT)+' с</small>';go=!G.endless&&G.ci===0&&G.li<=1;}
  else if(G.wave>=waveCount()){lbl='Последняя волна!';dis=true;}
  else{lbl='Волна идёт…';dis=true;}
  setTxt('waveBtn',lbl);if(HUDC.wbd!==dis){HUDC.wbd=dis;wb.disabled=dis;}if(HUDC.wbg!==go){HUDC.wbg=go;wb.classList.toggle('go',go);}
  for(const [k,id] of[['thunder','spThunder'],['cat','spCat']]){const s=G.sp[k],el=$(id);const lock=!!s.locked;
    const p=lock?100:s.cd>0?Math.round(s.cd/spellCd(k)*100):0,txt=lock?'🔒':s.cd>0?Math.ceil(s.cd):'';const key=p+'|'+txt+'|'+(G.aim===k);
    if(HUDC[id]!==key){HUDC[id]=key;el.querySelector('i').style.setProperty('--p',p+'%');el.querySelector('i').textContent=txt;el.classList.toggle('aim',G.aim===k);el.classList.toggle('lock',lock);el.style.display=lock?'none':'';}}
  setTxt('spdX','×'+String(G.speed).replace('.',','));setTxt('spdB',G.speed>=2?fmtBoost(S.boost):'');if(HUDC.spd!==G.speed){HUDC.spd=G.speed;$('speedBtn').classList.toggle('on',G.speed>=2);}
  const hot=S.boost<60;if(HUDC.hot!==hot){HUDC.hot=hot;$('boostBtn').classList.toggle('hot',hot);}
  // запас ускорения на первых двух уровнях не показываем (лишнее понятие новичку), если он не кончается
  const bh=!G.endless&&G.ci===0&&G.li<2&&!hot;if(HUDC.bh!==bh){HUDC.bh=bh;$('boostBtn').style.display=bh?'none':'';}
  if(G.tut===2&&!HUDC.tut2){HUDC.tut2=1;voice(G.started?'Отлично! Ставь ещё заставы у дороги — монеты за нечисть.':'Отлично! Поставь ещё заставу-другую и жми «В бой!» внизу справа.','Воевода Потап','voevoda',10);}
  if(G.tut===3&&!HUDC.tut3){HUDC.tut3=1;G.tut=4;voice('Нечисть идёт! За каждую — монеты. Нажми на готовую заставу, чтобы её улучшить.','Воевода Потап','voevoda',9);}
  if(ringI>=0)ringRefresh();
}

/* ---------- кольцо выбора ---------- */
let ringI=-1,ringSel=null,ringSig='';
function openRing(i){ringI=i;ringSel=null;G.sel=i;$('voice').classList.remove('on');ringBuild();}
function closeRing(){ringI=-1;ringSel=null;$('ring').classList.remove('on');$('info').classList.remove('on');if(G){G.sel=-1;G.preview=null;}}
function ringItems(){const t=G.tw[ringI],items=[];
  if(!t){// доступные заставы + одна следующая закрытая с подсказкой, когда откроется
    const open=TW_ORDER.filter(towerUnlocked),next=TW_ORDER.find(x=>!towerUnlocked(x)&&!towerBanned(x)),list=open.concat(next?[next]:[]),n=list.length;
    list.forEach((ty,k)=>{const a=n<=3?-Math.PI/2+(k-(n-1)/2)*1.15:-Math.PI/2+k*TAU/n,lock=!towerUnlocked(ty),c=buildCost(ty);
      items.push({id:'b_'+ty,a,img:'t_'+ty+'_1',price:lock?(TW_UNLOCK[ty][0]===G.ci?'ур. '+(TW_UNLOCK[ty][1]+1):'гл. '+(TW_UNLOCK[ty][0]+1)):c,no:!lock&&G.coins<c,lock,nm:lock?'скоро':null});});}
  else{if(t.lvl<3){const c=upCost(t);items.push({id:'up',a:-Math.PI/2,img:'t_'+t.type+'_'+(t.lvl+1),price:c,no:G.coins<c});}
    else if(t.lvl===3){const lock=!branchUnlocked();for(const br of[1,2]){const c=upCost(t,br);items.push({id:'br'+br,a:-Math.PI/2+(br===1?-.7:.7),img:'t_'+t.type+'_4'+(br===1?'a':'b'),price:lock?'🔒':c,no:!lock&&G.coins<c,lock,nm:TW[t.type].br[br-1].sh});}}
    items.push({id:'sell',a:Math.PI/2,txt:'💰',price:'+'+Math.round(t.inv*.7),sell:1});
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
    if(id.startsWith('b_')){const ty=id.slice(2);if(!towerUnlocked(ty)){const u=TW_UNLOCK[ty];showInfo('<b>'+TW[ty].n+'</b><p>Откроется в главе '+(u[0]+1)+', уровень '+(u[1]+1)+'.</p>');ringBuild();return;}
      const st=tstat(ty,1,0);G.preview={x:s.x,y:s.y,r:st.rng};showInfoType(ty,1,0,buildCost(ty));}
    else if(id==='up'){const st=tstat(t.type,t.lvl+1,0);G.preview={x:t.x,y:t.y,r:st.rng};showInfoType(t.type,t.lvl+1,0,upCost(t),t);}
    else if(id.startsWith('br')){const br=+id[2];if(!branchUnlocked()){showInfo('<b>Мастера</b><p>Ветки откроются в главе '+(BRANCH_UNLOCK[0]+1)+', уровень '+(BRANCH_UNLOCK[1]+1)+'.</p>');ringBuild();return;}
      const st=tstat(t.type,4,br);G.preview={x:t.x,y:t.y,r:st.rng};showInfoType(t.type,4,br,upCost(t,br),t);}
    else if(id==='sell'){showInfo('<b>Продать заставу?</b><p>Вернём '+coinsTxt(Math.round(t.inv*.7))+' (70% затрат). Нажми ещё раз, чтобы продать.</p>');}
    ringBuild();return;}
  // второе нажатие — действие
  let ok=false;
  if(id.startsWith('b_')){const ty=id.slice(2);ok=tryBuild(ringI,ty);if(!ok)toast(G.coins<buildCost(ty)?'Не хватает монет':'Нельзя');}
  else if(id==='up'){ok=tryUpgrade(ringI);if(!ok)toast('Не хватает монет');}
  else if(id.startsWith('br')){ok=tryUpgrade(ringI,+id[2]);if(!ok)toast('Не хватает монет');}
  else if(id==='sell'){ok=sellTower(ringI);}
  if(ok)closeRing();}
function statLine(ty,st){const a=[];const sp=v=>(1/v).toFixed(1).replace('.',',');
  if(ty==='arch')a.push('Урон '+Math.round(st.dmg)+(st.multi>1?' × '+st.multi+' цели':''),'выстр./с '+sp(st.cd));
  if(ty==='pushka')a.push('Урон '+Math.round(st.dmg)+' по площади','раз в '+st.cd.toFixed(1).replace('.',',')+' с');
  if(ty==='izba')a.push('Яд '+Math.round(st.dps)+'/с','замедл. '+Math.round(st.slow*100)+'%');
  if(ty==='mag')a.push('Урон '+Math.round(st.dmg)+' магией',(st.chain?'цепь на '+(st.chain+1):'одна цель'));
  if(ty==='dub')a.push('Урон '+Math.round(st.dmg)+' вокруг','оглуш. '+st.stun.toFixed(1).replace('.',',')+' с');
  a.push('дальн. '+Math.round(st.rng));a.push(st.air?'✈ бьёт летучих':'только наземных');return a.join(' · ');}
function showInfoType(ty,lvl,br,cost,cur){const d=TW[ty],b=lvl===4?d.br[br-1]:null,st=tstat(ty,lvl,br);
  showInfo('<b>'+(b?b.n:d.n)+(lvl<4?' · '+lvl+' ур.':'')+'</b><p>'+(b?b.about:d.about)+'</p><div class="st">'+statLine(ty,st)+'</div><div class="hint">'+(G.coins>=cost?'Нажми ещё раз — '+(cur?'улучшить':'построить')+' за '+cost:'🔒 Нужно '+coinsTxt(cost)+' (есть '+G.coins+')')+'</div>');}
function showInfoTower(t){const d=TW[t.type],b=t.lvl===4?d.br[t.br-1]:null,A=AIM_BY[t.type]?AIMS[t.aim||'first']:null;
  showInfo('<b>'+(b?b.n:d.n)+(t.lvl<4?' · '+t.lvl+' ур.':'')+'</b><div class="st">'+statLine(t.type,t.st)+'</div><p>Одолела нечисти: '+t.kills+' · урон '+fmtNum(t.dmgd||0)+'</p>'+
    (A?'<p>🎯 Бьёт <b class="aimb">'+A.n.toLowerCase()+'</b> — '+A.d+'. Нажми 🎯, чтобы сменить.</p>':''));}
function showInfo(h){const e=$('info');e.innerHTML=h;e.classList.add('on');}

/* ---------- ввод на поле ---------- */
function initInput(){
  cv.addEventListener('pointerdown',e=>{if(!G||G.over)return;ac();const p=toWorld(e.clientX,e.clientY);
    if(G.aim==='thunder'){if(p.y>-40&&p.y<WH+20){castThunder(p.x,p.y);G.aim=null;G.aimPt=null;}return;}
    if(G.egg&&!G.egg.dead&&(G.egg.x-p.x)**2+(G.egg.y-6-p.y)**2<34*34){const ex=G.egg.x,ey=G.egg.y;dmgEnemy(G.egg,G.egg.max*.07,'true');sparkle(ex,ey-6,'#ffd84a',5);SND.click();return;}
    const rT=Math.min(38,Math.max(26,24/VIEW.s));let best=-1,bd=rT*rT;G.map.spots.forEach((s,i)=>{const d=(s.x-p.x)**2+(s.y-p.y)**2;if(d<bd){bd=d;best=i;}});
    if(best>=0){if(best===ringI){closeRing();return;}SND.click();openRing(best);}else closeRing();});
  cv.addEventListener('pointermove',e=>{if(G&&G.aim){G.aimPt=toWorld(e.clientX,e.clientY);}});
  on('waveBtn',()=>{if(!G)return;if(G.tut===1){G.tut=2;}callWave();closeRing();});
  on('speedBtn',()=>{if(!G)return;const order=[1,1.5,2,3],nx=order[(order.indexOf(G.speed)+1)%4];
    if(nx>=2&&S.boost<=0){G.speed=1;openBoostOffer(true);return;}G.speed=nx;
    if(nx===2&&!S.spdTip){S.spdTip=1;save();toast('×2 — бесплатно, пока есть запас ('+fmtBoost(S.boost)+'): победа его вернёт');}});
  on('boostBtn',()=>openBoostOffer());
  on('pauseBtn',openPause);
  on('spThunder',()=>{if(!G)return;const s=G.sp.thunder;if(s.locked){toast('Гром Перуна откроется позже');return;}if(s.cd>0){toast('Перун отдыхает: '+Math.ceil(s.cd)+' с');return;}
    closeRing();G.aim=G.aim==='thunder'?null:'thunder';if(G.aim){G.aimPt=null;toast('Нажми на карту — туда ударит молния');}else G.redraw=1;});
  on('spCat',()=>{if(!G)return;const s=G.sp.cat;if(s.locked){toast('Кот Баюн придёт позже');return;}if(s.cd>0){toast('Кот ещё спит: '+Math.ceil(s.cd)+' с');return;}
    if(!G.en.length){toast('Некого усыплять');return;}closeRing();castCat();voice('Мур-р… Баю-баюшки-баю, спи, нечисть, на краю…','Кот Баюн','sp_cat',3);});
  window.addEventListener('keydown',e=>{if(!G||G.over)return;if(e.code==='Space'){e.preventDefault();if(!G.paused&&!paused&&!$('waveBtn').disabled&&!$('modal').classList.contains('on')){callWave();closeRing();}}if(e.code==='Escape'){if(G.aim)G.aim=null;else if(ringI>=0)closeRing();else openPause();}
    if(e.code==='KeyP')openPause();
    if($('modal').classList.contains('on')||G.paused)return;
    if(e.code==='KeyQ')$('spThunder').click();if(e.code==='KeyW')$('spCat').click();if(e.code==='KeyS')$('speedBtn').click();
    const d=/^Digit([1-6])$/.exec(e.code);if(d&&ringI>=0){const it=ringItems()[+d[1]-1];if(it)ringTap(it.id);}});
}
function openPause(){if(!G||G.over)return;G.paused=true;closeRing();YG.stop();
  const mode=G.wk?'Босс недели: '+EN[CH[G.ci].boss].n:G.rule?'Испытание дня: «'+(DCH_RULES.find(r=>r.k===G.rule)||{}).n+'»':G.endless?'':'Сложность: «'+DIFF[G.diff].n+'»';
  showModal('<h3>Передышка</h3>'+(mode?'<p class="sub" style="margin-bottom:4px;color:#ffe7a0">'+mode+'</p>':'')+'<p class="sub">'+pick(TIPS)+'</p>'+
    '<div class="tg">Звуки <button class="btn '+(S.sound?'green':'ghost')+'" id="pSnd">'+(S.sound?'Вкл':'Выкл')+'</button></div>'+
    '<div class="tg">Музыка <button class="btn '+(S.music?'green':'ghost')+'" id="pMus">'+(S.music?'Вкл':'Выкл')+'</button></div>'+
    '<div class="tg">Тряска экрана <button class="btn '+(S.shake?'green':'ghost')+'" id="pShk">'+(S.shake?'Вкл':'Выкл')+'</button></div>'+
    '<div class="btns"><button class="btn big" id="pGo">Продолжить</button><button class="btn ghost" id="pRe">Начать заново</button><button class="btn ghost" id="pExit">На карту</button></div>');
  on('pGo',()=>{hideModal();G.paused=false;YG.start();});
  on('pRe',()=>{const e=G.endless,c=G.ci,l=G.li,wk=G.wk,rule=G.rule;hideModal();if(wk)startWeekly();else if(rule)startDaily();else if(e)startEndless();else startLevel(c,l);});
  on('pExit',()=>{const b=$('pExit');if(!b.dataset.ok&&G&&G.started){b.dataset.ok=1;b.textContent='Точно выйти? Бой не засчитается';return;}
    if(G&&G.endless&&G.wave>1){G.paused=false;G.lives=0;defeat();hideModal();return;}toMenu('Map');});
  on('pSnd',()=>{S.sound=S.sound?0:1;save();G.paused=false;openPause();});
  on('pMus',()=>{S.music=S.music?0:1;save();musicSync();G.paused=false;openPause();});
  on('pShk',()=>{S.shake=S.shake?0:1;save();G.paused=false;openPause();});}

/* ---------- время ускорения ---------- */
function boostOut(){HUDC.hot=null;}
function openBoostOffer(empty){const wasG=G&&!G.over&&!G.paused;if(wasG){G.paused=true;YG.stop();}
  const close=()=>{hideModal();if(wasG&&G){G.paused=false;YG.start();}if(!G&&curTab==='Village')renderVillage();};
  showModal('<h3>⏩ Время ускорения</h3><p class="sub">'+(empty?'Запас пуст. ':'')+'Скорость ×1 и ×1,5 — бесплатно всегда. ×2 — победа возвращает потраченное; ×3 — тратит запас (2 секунды за секунду боя).</p>'+
    '<div class="card treasury" style="text-align:center"><b style="font-size:20px">Запас: '+fmtBoost(S.boost)+'</b><br><span class="note">Пополняется за победы (+1 мин и больше), раз в день бесплатно и за рекламу. Максимум — '+fmtBoost(BOOST_CAP)+'.</span></div>'+
    '<div class="btns">'+(S.boost<BOOST_CAP-60?'<button class="btn ad big" id="bAd">🎬 +10 мин за рекламу</button>':'')+'<button class="btn ghost" id="bNo">'+(empty?'Играть на ×1,5':'Закрыть')+'</button></div>');
  on('bAd',()=>showRewarded(()=>{boostAdd(600);save();SND.up();toast('+10 минут ускорения!');if(G&&!G.over)G.speed=Math.max(G.speed,2);close();}));
  on('bNo',()=>{if(empty&&G)G.speed=1.5;close();});}
function dailyBoost(){const d=dayKey();if(S.boostDay!==d){S.boostDay=d;if(S.boost<300){boostAdd(300);toast('Ежедневный запас ускорения: +5 мин');}save();}}

/* ================= ИТОГ БОЯ ================= */
function starsFor(){const lost=G.maxLives-G.lives;return lost<=2?3:lost<=10?2:1;}
/* «Лучшая застава» и кто сколько сделал (урон без «перебора», проданные заставы тоже считаются) */
function bestTwHTML(){if(!G)return '';const L=G.tw.filter(Boolean).concat(G.gone||[]).filter(t=>t.dmgd>0);if(!L.length)return '';
  const tot=L.reduce((a,t)=>a+t.dmgd,0),best=L.reduce((a,t)=>t.dmgd>a.dmgd?t:a),nm=t=>t.lvl===4?TW[t.type].br[t.br-1].n:TW[t.type].n+' · '+t.lvl+' ур.';
  const by={};for(const t of L){const o=by[t.type]||(by[t.type]={d:0,k:0,n:0});o.d+=t.dmgd;o.k+=t.kills;o.n++;}
  const rows=TW_ORDER.filter(k=>by[k]).sort((a,b)=>by[b].d-by[a].d).map(k=>{const o=by[k],p=Math.round(o.d/tot*100);
    return '<div class="twrow"><img src="'+ic('ti_'+k+'_3',64)+'" alt=""><div class="t"><b>'+TW[k].n+(o.n>1?' ×'+o.n:'')+'</b><div class="bar"><i style="width:'+p+'%"></i></div></div><span>'+p+'%<small>одолели '+o.k+'</small></span></div>';}).join('');
  return '<div class="card besttw"><div class="row"><img class="ic" src="'+ic(towerKey(best).replace('t_','ti_'),112)+'" alt=""><div class="t"><b>🏅 Лучшая застава</b><span>'+nm(best)+': '+Math.round(best.dmgd/tot*100)+'% урона, одолела '+best.kills+'</span></div></div>'+
    (Object.keys(by).length>1?'<details><summary>Кто сколько сделал</summary>'+rows+'</details>':'')+'</div>';}
function onBattleEnd(win){if(!G)return;closeRing();$('voice').classList.remove('on');S.kills+=G.kills;S.runs++;
  for(const k in G.kt)S.bk[k]=(S.bk[k]||0)+G.kt[k];
  for(const t of G.tw.concat(G.gone||[]))if(t&&t.kills>(S.bestTw||0))S.bestTw=t.kills;
  const dq0=dqDone();dqAdd('build',G.built||0);dqAdd('ups',G.ups||0);dqAdd('spells',G.spells||0);dqAdd('kills',G.kills);
  if(G.wk){weekEnd(dq0);achAfter();return;}
  if(G.rule){dchEnd(win,dq0);achAfter();return;}
  if(G.endless){const waves=Math.max(0,G.wave-1),rec=waves>(S.endBest||0);S.endBest=Math.max(S.endBest||0,waves);S.endRuns++;const reward=siegeGold(waves);
    dqAdd('siege',waves);S.gold+=reward;const bref=boostRefund(1);G.win=true;boostAdd(Math.min(120,5*waves));save();LB.set('endless',S.endBest);
    showModal('<h3>Осада окончена</h3><p class="sub">'+(rec?'🏆 Новый рекорд! Летописец записал.':'Нечисть прорвалась. Но и мы ей бока намяли!')+'</p>'+
      '<div class="stats"><div><b>'+waves+'</b>волн отбито</div><div><b>'+S.endBest+'</b>рекорд</div><div><b>'+G.kills+'</b>одолели</div></div>'+bestTwHTML()+
      '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(reward)+'</b>'+(bref>=1?'<br><span style="font-size:13px">⏩ Ускорение: возвращено '+fmtBoost(bref)+'</span>':'')+'</div>'+
      dqNote(dq0)+'<div class="btns">'+(reward>0?'<button class="btn ad" id="rX2">🎬 Удвоить за рекламу: ещё +'+fmtNum(reward)+'</button>':'')+(LB.vkOk()?'<button class="btn ghost" id="rVkLb">🏆 Рекорды друзей</button>':'')+'<button class="btn big" id="rAgain">Ещё раз</button><button class="btn ghost" id="rMap">В меню</button></div>');
    on('rVkLb',()=>LB.vkFriends(S.endBest));
    on('rX2',()=>showRewarded(()=>{S.gold+=reward;save();toast('+'+fmtGold(reward)+'');const b=$('rX2');if(b)b.remove();}));
    on('rAgain',startEndless);on('rMap',()=>toMenu('Siege'));achAfter();return;}
  const c=G.ci,l=G.li,key=lvKey(c,l);
  if(win){const st=starsFor(),prev=S.stars[key]||0,first=!prev;S.stars[key]=Math.max(prev,st);S.wins++;if(S.lose)delete S.lose[key];
    const crownNew=G.diff===2&&!S.crown[key];if(G.diff===2)S.crown[key]=1;
    dqAdd('win',1);if(st===3)dqAdd('star3',1);const lg=S.login?0:loginFirst();   // первый день серии входов засчитываем с первой победой
    const reward=winGold(c,l,st,first);S.gold+=reward;const bst=(60+30*(st-1))*(l===5?2:1);const bref=boostRefund(1);boostAdd(bst);save();
    const lines=['Отбились! Нечисть бежит, роняя тапки.','Победа! Воевода доволен и даже улыбнулся.','Застава устояла! Тётушка Яга печёт пироги.','Славно! Про нас сложат былину. Короткую.'];
    const next=l<5?[c,l+1]:c<CH.length-1?[c+1,0]:null;
    // после первой победы — один ясный шаг: Частокол в деревне
    const hintWall=S.wins===1&&!S.village.wall&&S.gold>=BLD.find(b=>b.id==='wall').cost[0];
    showModal('<h3>'+(l===5?'Глава освобождена!':'Победа!')+'</h3><div class="bigstars">'+[0,1,2].map(i=>'<img src="'+ic(i<st?'star':'star0',128)+'">').join('')+'</div>'+
      '<p class="sub">'+(st===3?'Ни одна нечисть не прошла (ну, почти)!':st===2?'Кое-кто просочился. Для трёх звёзд — не больше двух.':'Еле устояли! Для трёх звёзд в город должно пройти не больше двух.')+'</p>'+
      '<div class="say"><img src="'+ic('voevoda')+'"><div>'+(hintWall?'Золото есть! Купи в деревне <b>Частокол</b> — каждый бой начнёшь с лишней жизнью.':l===5?'Босс повержен! '+CH[c].name+' '+({m:'свободен',n:'свободно',f:'свободна',p:'свободны'})[CH[c].g]+'. '+(c<CH.length-1?'Дальше — '+CH[c+1].name+'!':'Тридевятое царство спасено! Ура!'):pick(lines))+'</div></div>'+
      (crownNew?'<p class="sub" style="color:#ffe7a0;font-weight:800">👑 Корона «Богатырской» — теперь она на этом уровне навсегда!</p>':'')+
      '<div class="stats"><div><b>'+G.kills+'</b>одолели</div><div><b>'+G.leaks+'</b>прорвалось</div><div><b>'+fmtTime(G.t)+'</b>время</div></div>'+bestTwHTML()+
      '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(reward)+''+(first?' (первая победа ×2)':'')+' <span style="white-space:nowrap">· ⏩ +'+fmtBoost(bst)+'</span></b>'+(bref>=1?'<br><span style="font-size:13px">⏩ Ускорение: возвращено '+fmtBoost(bref)+'</span>':'')+'<br><span class="note">Звёзды — в кузницу, золото — в деревню</span>'+'<br><span class="note">🎁 '+(lg?'За вход: +'+lg+' сегодня, завтра +'+loginTomorrow():'Завтра за вход: +'+fmtGold(loginTomorrow()))+'</span></div>'+dqNote(dq0)+
      '<div class="btns">'+(hintWall?'<button class="btn gold big" id="rWall">🏠 В деревню: купить Частокол</button>':'')+'<button class="btn ad'+(needB(reward)&&!hintWall?' big':'')+'" id="rX2">🎬 Удвоить золото за рекламу: ещё +'+fmtNum(reward)+(needB(reward)?' — хватит на «'+needB(reward)+'»':'')+'</button>'+
      (next?'<button class="btn big" id="rNext">Дальше: '+CH[next[0]].levels[next[1]]+' ▸</button>':'')+
      '<div class="btns h" style="margin-top:0"><button class="btn ghost" id="rAgain">Ещё раз</button><button class="btn ghost" id="rMap">На карту</button></div></div>');
    on('rX2',()=>showRewarded(()=>{S.gold+=reward;save();toast('+'+fmtGold(reward)+'');const b=$('rX2');if(b)b.remove();}));
    on('rNext',()=>{toMenu('Map');mapSel=next[0];renderMap();if(!$('modal').classList.contains('on'))openIntro(next[0],next[1]);});
    on('rWall',()=>{toMenu('Village');const w=document.querySelector('[data-b="wall"]');if(w){w.classList.add('hl');w.scrollIntoView({block:'center'});}});
    on('rAgain',()=>startLevel(c,l));on('rMap',()=>{toMenu('Map');if(canForge())toast('Есть звёзды для кузницы!');});
    if(l===5&&c===CH.length-1)setTimeout(()=>toast('Тридевятое царство спасено! Осада и Босс недели ждут.'),800);
  }else{const cons=loseGold(c,G.wave);S.gold+=cons;S.lose=S.lose||{};S.lose[key]=(S.lose[key]||0)+1;const pity=pityCoins(c,l);const bref=boostRefund(.5);save();
    const lines=['Нечисть прорвалась в город и съела все пирожки. Все!','Ворота не выдержали. Воевода ищет виноватых (это ты).','Прорвались, окаянные! Надо строить хитрее — или прокачаться в кузнице.'];
    showModal('<h3>Город в опасности!</h3><p class="sub">'+pick(lines)+'</p>'+
      (bref>=1?'<p class="sub">⏩ Ускорение: возвращено '+fmtBoost(bref)+' (половина потраченного на ×2)</p>':'')+'<div class="stats"><div><b>'+(G.wave)+'/'+G.waves.length+'</b>волна</div><div><b>'+G.kills+'</b>одолели</div><div><b>+'+cons+'</b>'+plural(cons,'золотой','золотых','золотых')+'</div></div>'+bestTwHTML()+
      dqNote(dq0)+'<div class="btns">'+(!G.contUsed&&G.wave>=2?'<button class="btn ad big" id="rCont">🎬 Ещё попытка за рекламу (+10 ❤'+(G.boss||G.leakedBoss?', босс назад':'')+')</button>':'')+
      '<button class="btn big" id="rAgain">Начать заново'+(pity?' (подмога +'+pity+' монет)':'')+'</button>'+
      // два поражения подряд — ненавязчиво предложить полегче (звёзды те же)
      (S.lose[key]>=2&&G.diff>0?'<button class="btn ghost" id="rEasy">Полегче: сыграть на «'+DIFF[G.diff-1].p+'»</button>':'')+'<button class="btn ghost" id="rMap">На карту</button></div>'+
      '<p class="sub" style="margin-top:10px">Совет: '+pick(TIPS)+'</p>');
    on('rCont',()=>showRewarded(()=>{hideModal();continueBattle();voice('Второе дыхание! Кот Баюн усыпил нечисть — строй скорее!','Воевода Потап','voevoda',5);}));
    on('rAgain',()=>startLevel(c,l));on('rMap',()=>toMenu('Map'));
    on('rEasy',()=>{S.diff=G.diff-1;save();startLevel(c,l);toast('Сложность: «'+DIFF[S.diff].n+'». Поменять — в окне перед боем');});}
  achAfter();
}
/* ---------- итог Босса недели ---------- */
function weekEnd(dq0){const w=G.wk.w,b=CH[G.ci].boss,kill=!!G.wkKill;let pct=G.wkPct||0;
  if(!kill){const e=G.en.find(x=>!x.dead&&x.type===b);if(e)pct=Math.max(pct,1-e.hp/e.max);}
  const sc=weekScore(kill,pct,G.wkT||G.t);if(!S.wk||S.wk.w!==w)S.wk={w,best:0,got:0,runs:0};const W=S.wk;W.runs++;const rec=sc>W.best&&W.runs>1;W.best=Math.max(W.best,sc);
  const waves=Math.max(0,G.wave-(kill?0:1)),reward=siegeGold(waves);S.gold+=reward;let prize=0;
  if(kill&&!W.got){W.got=1;S.wkN=(S.wkN||0)+1;prize=weekReward();S.gold+=prize;boostAdd(600);}
  const bref=boostRefund(1);G.win=true;save();if(W.best>0)LB.set('weekly',w*WEEK_SCORE+W.best);
  const txt=kill?EN[b].n+' '+defeatedWord(b)+' за '+fmtTime(G.wkT||G.t)+'!':pct>0?'Сняли '+(Math.floor(pct*1000)/10).toString().replace('.',',')+'% здоровья. Прокачай заставы — и ещё раз!':'До босса не дошли. Кузница и деревня помогут — и ещё раз!';
  showModal('<h3>'+(kill?'Босс недели повержен!':'Бой с Боссом недели')+'</h3>'+(rec?'<p class="sub">🏆 Новый рекорд недели!</p>':'')+
    '<div class="say"><img src="'+ic(b)+'" alt=""><div>'+txt+'</div></div>'+
    '<div class="stats"><div><b>'+fmtWeek(sc).replace(/^(победа за|урон) /,'')+'</b>'+(sc>=10000?'победа за':'урон по боссу')+'</div><div><b>'+fmtWeek(W.best).replace(/^(победа за|урон) /,'')+'</b>лучшее за неделю</div><div><b>'+G.kills+'</b>одолели</div></div>'+bestTwHTML()+
    '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(reward)+'</b>'+(prize?'<br><b>Награда недели: +'+fmtGold(prize)+' и +10 мин ⏩</b>':'')+(bref>=1?'<br><span style="font-size:13px">⏩ Ускорение: возвращено '+fmtBoost(bref)+'</span>':'')+'</div>'+dqNote(dq0)+
    '<div class="btns">'+(reward>0?'<button class="btn ad" id="rX2">🎬 Удвоить за рекламу: ещё +'+fmtNum(reward)+'</button>':'')+(LB.ok()&&PLAT!=='vk'?'<button class="btn ghost" id="rWkLb">🏆 Таблица недели</button>':'')+
    '<button class="btn big" id="rAgain">Ещё раз</button><button class="btn ghost" id="rMap">В меню</button></div>');
  on('rX2',()=>showRewarded(()=>{S.gold+=reward;save();toast('+'+fmtGold(reward));const x=$('rX2');if(x)x.remove();}));
  on('rWkLb',()=>{lbSeg='weekly';toMenu('Siege');setTimeout(()=>{const x=$('lbBox');if(x)x.scrollIntoView({block:'center'});},60);});
  on('rAgain',startWeekly);on('rMap',()=>toMenu('Siege'));}
/* ---------- итог испытания дня ---------- */
function dchEnd(win,dq0){const D=S.dch||{},R=DCH_RULES.find(r=>r.k===G.rule)||DCH_RULES[0],prize=!!(G.dchPrize&&win);let g=0;
  if(win){S.wins++;dqAdd('win',1);}
  if(G.dchPrize&&D.day===dayKey()){if(win){D.res=1;S.dchN=(S.dchN||0)+1;g=dchGold();S.gold+=g;boostAdd(300);}else D.res=2;}
  const bref=boostRefund(win?1:.5);if(win)G.win=true;save();
  showModal('<h3>'+(win?'Испытание пройдено!':'Испытание не далось')+'</h3><p class="sub">«'+R.n+'» · '+CH[G.ci].levels[G.li]+'</p>'+
    '<div class="say"><img src="'+ic('voevoda')+'" alt=""><div>'+(prize?'Вот это воевода! Держи награду.':win?'Славно! Награда — за первую попытку дня, но умение дороже золота.':G.dchPrize?'Не вышло. Награда была за первую попытку — завтра будет новое испытание.':'Не вышло. Попробуй построить иначе!')+'</div></div>'+
    '<div class="stats"><div><b>'+G.kills+'</b>одолели</div><div><b>'+G.leaks+'</b>прорвалось</div><div><b>'+fmtTime(G.t)+'</b>время</div></div>'+bestTwHTML()+
    (prize?'<div class="card treasury" style="text-align:center"><b>+'+fmtGold(g)+' · ⏩ +5 мин</b></div>':'')+(bref>=1?'<p class="sub">⏩ Ускорение: возвращено '+fmtBoost(bref)+'</p>':'')+dqNote(dq0)+
    '<div class="btns"><button class="btn big" id="rMap">В меню</button><button class="btn ghost" id="rAgain">Сыграть ещё (без награды)</button></div>');
  on('rAgain',startDaily);on('rMap',()=>toMenu('Siege'));}

/* ================= КУЗНИЦА ================= */
function renderForge(){const el=$('tabForge'),free=starsFree();
  let h='<h2>Кузница</h2><p class="sub">Звёзды за бои тратятся на вечные улучшения застав. Есть звёзд: <b style="color:var(--gold)">'+free+'</b> из '+starsTotal()+'. Сбросить можно бесплатно.</p>';
  for(const t of TW_ORDER){const d=TW[t],u=TW_UNLOCK[t],open=chOpen(u[0])&&(u[0]>0||lvOpen(0,u[1]));const own=FORGE_ORDER[t].filter(([k])=>fHas(t,k)).length;
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic('ti_'+t+'_3',112)+'"'+(open?'':' style="filter:brightness(0) opacity(.4)"')+'><div class="t"><b>'+d.n+'</b><span>'+(own<5?'Выковано '+own+' из 5. Нажми на ступень, чтобы купить — в любом порядке.':'Всё выковано!')+'</span></div></div>'+
      '<div class="tiers">'+FORGE_ORDER[t].map(([k,c])=>{const f=k==='sp'?FORGE_SP[t]:FORGE_T[k],has=fHas(t,k),can=forgeCan(t,k);
        return '<button class="'+(has?'on':can&&c<=free?'can':'')+'" data-t="'+t+'" data-k="'+k+'"><b>'+f.n+'</b><i>'+(has?'✓':(can?'★'+c:'🔒'))+'</i></button>';}).join('')+'</div></div>';}
  h+='<h2>Чары и запасы</h2>';
  for(const x of FORGE_EXTRA){const n=forgeN(x.k),max=x.cost.length;
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic(x.ic)+'"><div class="t"><b>'+x.n+'</b><span>'+(n<max?'Дальше: '+x.d[n]:'Всё выковано!')+'</span><div class="pips">'+x.cost.map((_,i)=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</div></div>'+
      (n<max?'<button class="btn gold" data-f="'+x.k+'" '+(free<x.cost[n]?'disabled':'')+'><img src="'+ic('star',40)+'">'+x.cost[n]+'</button>':'<span class="tag ok">Готово</span>')+'</div></div>';}
  h+='<button class="btn ghost big" id="fReset" style="margin-top:6px">Сбросить кузницу</button>';
  el.innerHTML=h;
  for(const b of el.querySelectorAll('[data-k]'))b.onclick=()=>{const t=b.dataset.t,k=b.dataset.k,f=k==='sp'?FORGE_SP[t]:FORGE_T[k],c=FORGE_ORDER[t].find(q=>q[0]===k)[1];
    if(fHas(t,k)){toast(f.n+': '+f.d);return;}if(!forgeCan(t,k)){toast('Сначала «'+FORGE_T[FORGE_T[k].need].n+'»');return;}
    if(starsFree()<c){toast(f.n+' ('+f.d+') — нужно звёзд: '+c);return;}fT(t)[k]=1;save();SND.up();toast(f.n+': '+f.d);renderForge();setPills();};
  for(const b of el.querySelectorAll('[data-f]'))b.onclick=()=>{const k=b.dataset.f,n=forgeN(k);const x=FORGE_EXTRA.find(q=>q.k===k);const cost=x.cost[n];
    if(starsFree()<cost)return;S.forge[k]=n+1;save();SND.up();toast('Выковано!');renderForge();setPills();};
  on('fReset',()=>{if(!starsSpent())return;S.forge={};save();toast('Кузница сброшена — звёзды вернулись');renderForge();setPills();});}

/* ================= ДЕРЕВНЯ ================= */
function giftReady(){return S.runs>0&&Date.now()-(S.gift||0)>4*3600e3;}
// ближайшая постройка, на которую не хватает золота (для подсказок «в момент нужды»)
function nextBld(){let best=null;for(const b of BLD){const l=S.village[b.id]||0;if(l<b.cost.length&&(!best||b.cost[l]<best.c))best={n:b.name,c:b.cost[l]};}return best;}
function needV(){const b=nextBld();return b&&b.c>S.gold?{n:b.n,d:b.c-S.gold}:null;}
function needB(extra){const b=nextBld();return b&&b.c>S.gold&&b.c<=S.gold+extra?b.n:'';}
function renderVillage(){const el=$('tabVillage');const giftAmt=giftGold();
  let h='<h2>Деревня</h2><p class="sub">Золото из боёв тратим тут: постройки усиливают заставу во всех боях.</p>';
  {const g=afkGold(),cap=afkCapH(),h2=Math.min(cap,(Date.now()-S.afkT)/3600e3);
    h+='<div class="card treasury"><div class="row"><img class="ic" src="'+ic('ingot')+'"><div class="t"><b>Казна: '+fmtGold(g)+'</b><span>Копится, пока тебя нет: '+afkRate()+' в час, вмещает '+cap+' ч</span><div class="bar"><i style="width:'+Math.round(h2/cap*100)+'%"></i></div></div>'+
      (g>=10?'<button class="btn gold" id="afkTake">Забрать</button>':'')+'</div></div>';}
  h+='<div class="blds">';
  for(const b of BLD){const l=S.village[b.id]||0,max=b.cost.length,cost=b.cost[l];
    h+='<div class="card bld'+(l?' has':'')+'"><img src="'+ic(b.ic,112)+'"><b>'+b.name+'</b><span>'+b.about+'</span>'+
      '<div class="pips">'+Array.from({length:max},(_,i)=>'<i class="'+(i<l?'on':'')+'"></i>').join('')+'</div>'+
      (l>=max?'<span class="tag ok">Готово</span>':'<button class="btn gold" data-b="'+b.id+'" '+(S.gold<cost?'disabled':'')+'><img src="'+ic('ingot',40)+'">'+fmtNum(cost)+'</button>')+'</div>';}
  h+='</div>';
  // все предложения за рекламу — одной карточкой ниже построек
  const g=afkGold(),bst=S.afkBoost&&S.afkBoost.day===dayKey()?S.afkBoost.n:0,offers=[];
  if(g>=10)offers.push('<button class="btn ad" id="afkX2">🎬 Казна ×2 за рекламу: +'+fmtGold(g*2)+'</button>');
  // «+2 часа казны» — только когда это ощутимо (с Мытным двором), иначе награда за рекламу смешная
  if(bst<2&&afkRate()*2>=40)offers.push('<button class="btn ad" id="afkBoost">🎬 +2 часа казны за рекламу: +'+fmtGold(afkRate()*2)+' ('+(2-bst)+' из 2)</button>');
  if(giftReady())offers.push('<button class="btn ad" id="giftBtn">🎬 Гостинец Яги за рекламу: +'+fmtGold(giftAmt)+'</button>');
  offers.push('<button class="btn ad" id="vBoost">🎬 +10 мин ускорения за рекламу</button>');
  h+='<h2>Подарки</h2><div class="card gift"><div class="row" style="margin-bottom:8px"><img class="ic" src="'+ic('tetka')+'"><div class="t"><b>По желанию — за короткую рекламу</b><span>'+
    (needV()?'До «'+needV().n+'» не хватает '+fmtGold(needV().d)+'. ':'')+(S.runs>0&&!giftReady()?'Тётушка печёт пироги: гостинец через '+Math.ceil((4*3600e3-(Date.now()-S.gift))/3600e3)+' ч':'Реклама не обязательна — всё можно заработать в боях.')+'</span></div></div><div class="btns" style="margin-top:0">'+offers.join('')+'</div></div>';
  el.innerHTML=h;
  const takeAfk=m=>{const g=afkGold();if(g<=0)return;S.gold+=g*m;S.afkT=Date.now();save();SND.coin();toast('+'+fmtGold(g*m)+' из казны');renderVillage();setPills();};
  on('vBoost',()=>openBoostOffer());
  on('afkTake',()=>takeAfk(1));on('afkX2',()=>showRewarded(()=>takeAfk(2)));
  on('afkBoost',()=>showRewarded(()=>{const bst=S.afkBoost&&S.afkBoost.day===dayKey()?S.afkBoost.n:0;const amt=afkRate()*2;S.afkBoost={day:dayKey(),n:bst+1};S.gold+=amt;save();SND.coin();toast('+'+fmtGold(amt));renderVillage();setPills();}));
  on('giftBtn',()=>showRewarded(()=>{S.gold+=giftAmt;S.gift=Date.now();save();SND.up();toast('Тётушка Яга: «Кушай, воевода!» +'+fmtGold(giftAmt));renderVillage();setPills();}));
  for(const b of el.querySelectorAll('[data-b]'))b.onclick=()=>{const bd=BLD.find(x=>x.id===b.dataset.b),l=S.village[bd.id]||0,cost=bd.cost[l];if(S.gold<cost)return;
    S.gold-=cost;S.village[bd.id]=l+1;save();SND.build();toast(bd.name+': ур. '+(l+1));renderVillage();setPills();};}

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
  if(!S.introSeen.wk){S.introSeen.wk=1;save();voice('Босс недели! '+EN[CH[G.ci].boss].n+' ведёт войско. В 9-й волне — сам босс, в 2,5 раза крепче обычного. Кто одолеет быстрее — того в летопись!','Воевода Потап','voevoda',9);}}
function startDaily(){const D=dchToday();if(!D)return;hideModal();if(G&&!G.win&&!G.over){boostRefund(.5);save();}
  const prize=!D.tried&&!D.res;D.tried=1;save();newBattle({ci:D.c,li:D.l,rule:D.rule});G.dchPrize=prize;enterBattle();
  const R=DCH_RULES.find(r=>r.k===D.rule)||DCH_RULES[0];voice('Испытание дня: «'+R.n+'». '+R.d,'Воевода Потап','voevoda',7);}
function renderSiege(){const el=$('tabSiege'),open=!!S.stars['0-5'];
  // Босс недели
  const w=weekNo(),wc=weekCh(w),wb=CH[wc].boss,m=wkMine(),lh=weekLeftH(),left=lh>=24?Math.floor(lh/24)+' дн. '+(lh%24)+' ч':lh+' ч';
  let h='<h2>Босс недели</h2><div class="card"><div class="row"><img class="ic" src="'+ic(wb)+'" alt=""><div class="t"><b>'+EN[wb].n+'</b><span>'+CH[wc].name+'. 9 волн, в последней — сам босс, в 2,5 раза крепче обычного. Одолей быстрее всех — или сними побольше здоровья. Новый босс через '+left+'.</span></div></div>'+
    '<div class="stats"><div><b>'+(m.best?fmtWeek(m.best).replace(/^(победа за|урон) /,''):'—')+'</b>'+(m.best>=10000?'победа за':'лучшее')+'</div><div><b>'+m.runs+'</b>'+plural(m.runs,'попытка','попытки','попыток')+'</div><div><b>'+(m.got?'✓':'+'+fmtNum(weekReward()))+'</b>'+(m.got?'награда взята':'за победу')+'</div></div>'+
    '<div class="btns" style="margin-top:0">'+(open?'<button class="btn big" id="wkGo">'+swordImg()+' Сразиться</button>':'<button class="btn big" disabled>🔒 Освободи Дремучий лес</button>')+'</div></div>';
  // испытание дня
  const D=open?dchToday():null;
  if(D){const R=DCH_RULES.find(r=>r.k===D.rule)||DCH_RULES[0],ch=CH[D.c],en=levelEnemies(D.c,D.l);
    h+='<h2>Испытание дня</h2><div class="card"><div class="row"><img class="ic" src="'+ic(EN[en[en.length-1]].art||en[en.length-1])+'" alt=""><div class="t"><b>«'+R.n+'» · '+ch.levels[D.l]+'</b><span>'+R.d+' Глава '+(D.c+1)+', уровень '+(D.l+1)+'.</span></div></div>'+
      '<p class="sub" style="margin:8px 2px 0">'+(D.res===1?'✅ Пройдено! Новое испытание — завтра.':D.tried?'Награда была за первую попытку — завтра новое испытание. Сыграть можно для себя.':'Награда за победу с первой попытки: +'+fmtGold(dchGold())+' и +5 мин ⏩')+'</p>'+
      '<div class="btns">'+(D.tried?'<button class="btn ghost big" id="dchGo">Сыграть для себя</button>':'<button class="btn big" id="dchGo">'+swordImg()+' Принять вызов</button>')+'</div></div>';}
  h+='<h2>Бесконечная осада</h2><p class="sub">Калинов мост. Нечисть идёт без конца, с каждой волной злее, каждые 10 волн — босс. Сколько продержишься?</p>';
  h+='<div class="card"><div class="row"><img class="ic" src="'+ic('b_siege')+'" alt=""><div class="t"><b>Рекорд: '+(S.endBest||0)+' '+plural(S.endBest||0,'волна','волны','волн')+'</b><span>Золото за каждую волну. Жизни, кузница и деревня работают и тут.</span></div></div>'+
    '<div class="btns">'+(open?'<button class="btn big" id="endGo">'+swordImg()+' На Калинов мост</button>':'<button class="btn big" disabled>🔒 Освободи Дремучий лес</button>')+'</div></div>';
  const crowns=Object.keys(S.crown||{}).length;
  h+='<h2>Летопись</h2><div class="stats"><div><b>'+starsTotal()+'</b>звёзд</div><div><b>'+fmtNum(S.kills)+'</b>нечисти</div><div><b>'+S.wins+'</b>побед</div>'+(crowns?'<div><b>👑 '+crowns+'</b>корон</div>':'')+(S.dchN?'<div><b>'+S.dchN+'</b>'+plural(S.dchN,'испытание','испытания','испытаний')+' дня</div>':'')+'</div>'+chronicleBtns();
  if(PLAT==='vk'&&LB.vkOk()){h+='<h2>Рекорды друзей</h2><div class="card"><p class="sub" style="margin:0 0 8px">Кто из друзей дольше держит Калинов мост?</p><button class="btn ghost big" id="vkLb">🏆 Таблица друзей</button></div>';}
  if(PLAT!=='vk'){h+='<h2>Рекорды Руси</h2>'+(LB.ok()?'<div class="seg"><button data-lb="weekly" class="'+(lbSeg==='weekly'?'on':'')+'">Босс недели</button><button data-lb="endless" class="'+(lbSeg==='endless'?'on':'')+'">Осада</button></div>':'')+
    '<div class="card" id="lbBox"><p class="sub" style="margin:0">'+(LB.ok()?'Загружаем…':'Общая таблица рекордов работает в Яндекс Играх.')+'</p></div>';}
  el.innerHTML=h;achAfter();on('endGo',startEndless);on('wkGo',startWeekly);on('dchGo',startDaily);on('vkLb',()=>LB.vkFriends(S.endBest||0));chronicleBind();
  for(const b of el.querySelectorAll('[data-lb]'))b.onclick=()=>{SND.click();lbSeg=b.dataset.lb;for(const x of el.querySelectorAll('[data-lb]'))x.classList.toggle('on',x===b);loadLB();};
  if(LB.ok()&&PLAT!=='vk')loadLB();}
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
function loadLB(){const name=lbSeg,wn=weekNo(),box0=$('lbBox');if(!box0)return;box0.innerHTML='<p class="sub" style="margin:0">Загружаем…</p>';
  LB.get(name).then(r=>{const box=$('lbBox');if(!box||lbSeg!==name)return;let es=(r&&r.entries)||[];
    // таблица недели — одна на все недели: показываем только записи этой недели (счёт = неделя×100000 + очки)
    if(name==='weekly')es=es.filter(e=>Math.floor(e.score/WEEK_SCORE)===wn);
    const val=e=>name==='weekly'?fmtWeek(e.score):fmtNum(e.score);
    box.innerHTML=(es.length?es.map(e=>'<div class="lbrow'+(r.userRank===e.rank?' me':'')+'"><b>'+e.rank+'</b><span>'+esc((e.player&&e.player.publicName)||'Воевода')+'</span>'+val(e)+'</div>').join(''):'<p class="sub" style="margin:0">Пока пусто — будь первым!</p>')+
      (LB.authed()?'':'<button class="btn ghost" id="lbIn" style="margin-top:8px">Войти, чтобы попасть в таблицу</button>');
    on('lbIn',async()=>{if(await LB.login()){LB.set('endless',S.endBest);const W=wkMine();if(W.best)LB.set('weekly',wn*WEEK_SCORE+W.best);renderSiege();}});});}
// кнопки книги нечисти и достижений (под летописью)
function chronicleBtns(){return typeof openBook==='function'?'<div class="btns h" style="margin-top:0"><button class="btn ghost" id="bookBtn">📖 Книга нечисти</button><button class="btn ghost" id="achBtn">🏆 Достижения</button></div>':'';}
function chronicleBind(){if(typeof openBook==='function'){on('bookBtn',openBook);on('achBtn',openAch);}}
/* ---------- достижения ---------- */
function achCheck(){const got=[];for(const a of ACH){if(S.ach[a.id])continue;let v=0;try{v=a.v();}catch(e){}if(v>=a.goal){S.ach[a.id]=1;S.gold+=a.r;got.push(a);}}if(got.length){save();setPills();}return got;}
function achAfter(){const got=achCheck();if(!got.length)return;const g=got.reduce((x,a)=>x+a.r,0);
  setTimeout(()=>{SND.star(2);toast('🏆 '+(got.length===1?'Достижение «'+got[0].n+'»':'Достижения: '+got.length)+' — +'+fmtGold(g));},1400);}
function openAch(){const n=ACH.filter(a=>S.ach[a.id]).length,list=ACH.slice().sort((a,b)=>(S.ach[a.id]?1:0)-(S.ach[b.id]?1:0));
  let h='<h3>🏆 Достижения</h3><p class="sub">Получено '+n+' из '+ACH.length+'. Награда — золото, приходит сразу.</p>';
  for(const a of list){const got=!!S.ach[a.id];let v=0;try{v=Math.min(a.v(),a.goal);}catch(e){}
    h+='<div class="card ach'+(got?' got':'')+'"><div class="t"><b>'+(got?'✅ ':'')+a.n+'</b><span>'+a.d+' · награда '+fmtGold(a.r)+'</span>'+
      (got||a.goal===1?'':'<div class="bar"><i style="width:'+Math.round(v/a.goal*100)+'%"></i></div><span>'+fmtNum(v)+' / '+fmtNum(a.goal)+'</span>')+'</div></div>';}
  showModal(h+'<div class="btns"><button class="btn big" id="achOk">Закрыть</button></div>');on('achOk',hideModal);}
/* ---------- Книга нечисти ---------- */
function bookStars(id){const n=(S.bk||{})[id]||0,t=EN[id].boss||id==='egg'?[1,5,20]:[10,100,1000];return t.filter(x=>n>=x).length;}
function openBook(){const n=BOOK.filter(bookKnown).length;
  let h='<h3>📖 Книга нечисти</h3><p class="sub">Встретил в бою — записано в книгу. Открыто '+n+' из '+BOOK.length+'. Звёзды — за число одолённых. Нажми на картинку.</p>';
  for(const [title,list] of[['Нечисть',BOOK.filter(id=>!EN[id].boss&&id!=='egg')],['Боссы',BOOK.filter(id=>EN[id].boss||id==='egg')]]){
    h+='<div style="font-weight:900;margin:8px 2px 4px;color:#ffe7a0">'+title+'</div><div class="bgrid">';
    for(const id of list){const k=bookKnown(id),st=bookStars(id);
      h+='<button class="bcell'+(k?'':' lock')+'" data-bi="'+id+'"><img src="'+ic(EN[id].art||id,96)+'" alt=""><b>'+(k?EN[id].n:'???')+'</b>'+(k?'<i>'+'★'.repeat(st)+'<u>'+'★'.repeat(3-st)+'</u></i>':'')+'</button>';}
    h+='</div>';}
  showModal(h+'<div class="btns"><button class="btn big" id="bkOk">Закрыть книгу</button></div>');on('bkOk',hideModal);
  for(const b of document.querySelectorAll('[data-bi]'))b.onclick=()=>{SND.click();openBeast(b.dataset.bi);};}
function openBeast(id){const d=EN[id],k=bookKnown(id),n=(S.bk||{})[id]||0,boss=d.boss||id==='egg';
  const spd=d.spd===0?'не ходит':d.spd<30?'медленно':d.spd<45?'не спеша':d.spd<60?'шустро':'очень быстро';
  const goal=(boss?[1,5,20]:[10,100,1000]).find(x=>n<x);
  let h='<div class="beast'+(k?'':' lock')+'"><img src="'+ic(d.art||id,200)+'" alt=""></div><h3>'+(k?d.n:'Неведомая нечисть')+'</h3>';
  if(k){h+='<p class="sub" style="color:#e8e4f4">'+(LORE[id]||d.about)+'</p><div class="stats"><div><b>'+fmtNum(n)+'</b>одолено</div><div><b>'+fmtNum(d.hp)+'</b>здоровье (глава 1)</div><div><b style="font-size:15px">'+spd+'</b>ходит</div></div>'+
      '<div class="card"><b style="color:#ffe7a0">Что умеет</b><br>'+d.about+'<br><b style="color:#ffe7a0">Совет воеводы</b><br>'+bookTip(id)+'</div>'+
      '<p class="sub">Где водится: '+bookWhere(id)+'. '+(goal?'До следующей звезды: одолей ещё '+fmtNum(goal-n)+'.':'Все три звезды — нечисть тебя боится!')+'</p>';}
  else h+='<p class="sub">Эта нечисть тебе ещё не встречалась. Говорят, водится здесь: '+bookWhere(id)+'.</p>';
  showModal(h+'<div class="btns"><button class="btn big" id="bstBack">К книге</button></div>');on('bstBack',openBook);}

/* ================= настройки ================= */
function openSettings(){showModal('<h3>Настройки</h3>'+
  '<div class="tg">Звуки <button class="btn '+(S.sound?'green':'ghost')+'" id="sSnd">'+(S.sound?'Вкл':'Выкл')+'</button></div>'+
  '<div class="tg">Музыка <button class="btn '+(S.music?'green':'ghost')+'" id="sMus">'+(S.music?'Вкл':'Выкл')+'</button></div>'+
  '<div class="tg">Тряска экрана <button class="btn '+(S.shake?'green':'ghost')+'" id="sShk">'+(S.shake?'Вкл':'Выкл')+'</button></div>'+
  '<div class="tg" style="border:0;padding-bottom:0">Сложность кампании</div>'+diffSegHTML()+
  '<p class="sub" style="margin-top:12px">Тридевятая оборона: защита башен.<br>Реклама — только по твоему желанию, за награду.</p>'+
  '<div class="btns"><button class="btn ghost" id="sCred">🎻 Благодарности</button><button class="btn big" id="sOk">Готово</button></div>');
  on('sSnd',()=>{S.sound=S.sound?0:1;save();openSettings();});on('sMus',()=>{S.music=S.music?0:1;save();musicSync();openSettings();});on('sOk',hideModal);
  on('sShk',()=>{S.shake=S.shake?0:1;save();openSettings();});on('sCred',openCredits);diffSegBind();}

/* ================= благодарности: музыка чужая, подпись авторов обязательна по лицензии =================
   Ссылок нет: правила площадок запрещают кликабельные ссылки; адреса автора и лицензии — обычным текстом (так требует CC BY). */
const CREDITS=[
  {t:'Medieval: Market Day',w:'меню, деревня, кузница',a:'RandomMind',l:'CC0 (общественное достояние)'},
  {t:'Zombies also love to play the fool',w:'бой (из альбома «In Russian Style»)',a:'Alexandr Zhelanov, soundcloud.com/alexandr-zhelanov',l:'CC BY 3.0: creativecommons.org/licenses/by/3.0/'},
  {t:'Brave Soldiers',w:'бой с боссом',a:'Alexandr Zhelanov, soundcloud.com/alexandr-zhelanov',l:'CC BY 3.0: creativecommons.org/licenses/by/3.0/'}];
function openCredits(){
  showModal('<h3>Благодарности</h3><p class="sub">Музыка, под которую застава держит оборону. Спасибо авторам!</p>'+
    CREDITS.map(c=>'<div class="card cred"><b>«'+c.t+'»</b> <span class="mutd">— '+c.w+'</span><br>'+
      'Автор: '+c.a+'<br>Лицензия: '+c.l+'<br>Источник: OpenGameArt (opengameart.org). Перекодировано в AAC, моно.</div>').join('')+
    '<div class="card cred"><b>VK Bridge</b> — библиотека для VK Игр. © 2017-present, V Kontakte, LLC. Лицензия MIT.</div>'+
    '<div class="btns"><button class="btn big" id="credOk">Назад</button></div>');on('credOk',openSettings);}

/* ================= задания дня (3) и награда за вход (7 дней) =================
   Задания выбираются по дате, прогресс — по итогам боя (onBattleEnd). Все три — ещё +5 мин ускорения.
   Вход: день серии засчитывается с первой победы; пропуск одного дня серию не рвёт, двух и больше — с начала. */
function dqToday(){const d=dayKey();if(!S.dq||S.dq.day!==d){const R=mulberry(+d.replace(/-/g,'')),pool=QUESTS.filter(q=>!q.need||q.need()),list=[];
    while(list.length<3&&pool.length){const q=pool.splice(Math.floor(R()*pool.length),1)[0];list.push({k:q.k,goal:q.goal[Math.floor(R()*q.goal.length)],n:0,got:0});}
    S.dq={day:d,list,bonus:0};}return S.dq;}
function dqDone(){return dqToday().list.filter(q=>q.n>=q.goal).length;}
function dqAdd(k,v){if(!v)return;const q=dqToday().list.find(x=>x.k===k);if(q&&q.n<q.goal)q.n=Math.min(q.goal,q.n+v);}
function dqClaimable(){if(!S.wins)return false;const D=dqToday();return D.list.some(q=>q.n>=q.goal&&!q.got)||(!D.bonus&&D.list.every(q=>q.got));}
function dqNote(before){const n=dqDone();return n>before&&S.wins?'<p class="sub" style="margin:8px 0 0">✅ Задание дня выполнено ('+n+' из 3) — награда на карте</p>':'';}
function renderQuests(){const box=$('dqBox');if(!box)return;if(!S.wins){box.innerHTML='';return;}const D=dqToday();
  let h='<div class="card"><b style="font-size:17px">Задания дня</b>';
  for(let i=0;i<D.list.length;i++){const q=D.list[i],Q=QUESTS.find(x=>x.k===q.k),ok=q.n>=q.goal;
    h+='<div class="qrow"><div class="t"><b>'+Q.n+': '+fmtNum(q.goal)+'</b><div class="bar"><i style="width:'+Math.round(q.n/q.goal*100)+'%"></i></div><span>'+fmtNum(q.n)+' / '+fmtNum(q.goal)+'</span></div>'+
      (q.got?'<span class="tag ok">✓</span>':'<button class="btn gold" data-q="'+i+'" '+(ok?'':'disabled')+'><img src="'+ic('ingot',40)+'">'+questGold(Q)+'</button>')+'</div>';}
  if(!D.bonus)h+='<div class="qrow"><div class="t"><b>Все три задания</b><span>Сундук дня: +5 мин ускорения</span></div><button class="btn gold" id="dqBonus" '+(D.list.every(q=>q.got)?'':'disabled')+'>⏩ +5 мин</button></div>';
  h+='<span class="note">Новые задания — завтра.</span></div>';box.innerHTML=h;
  for(const b of box.querySelectorAll('[data-q]'))b.onclick=()=>{const q=D.list[+b.dataset.q],Q=QUESTS.find(x=>x.k===q.k);if(q.got||q.n<q.goal)return;q.got=1;const g=questGold(Q);S.gold+=g;save();SND.coin();toast('Задание дня: +'+fmtGold(g));renderQuests();setPills();};
  on('dqBonus',()=>{if(D.bonus||!D.list.every(q=>q.got))return;D.bonus=1;boostAdd(DQ_BONUS);save();SND.up();toast('Сундук дня: +5 мин ускорения');renderQuests();setPills();});}
function dayDiff(a,b){const p=s=>{const x=s.split('-').map(Number);return new Date(x[0],x[1]-1,x[2]).getTime();};return Math.round((p(b)-p(a))/864e5);}
// что можно забрать сегодня: {idx — день серии 0..6, cont — серия продолжается}; null — уже забрано или серия ещё не начата
function loginAvail(){const L=S.login;if(!L||!L.day)return null;const d=dayKey();if(L.day===d)return null;const gap=dayDiff(L.day,d),cont=gap>=1&&gap<=2;return {idx:cont?(L.n||0)%7:0,cont};}
function loginGive(idx){const g=LOGIN_GOLD[idx];S.gold+=g;if(idx===6)boostAdd(600);return g;}
function loginFirst(){S.login={day:dayKey(),n:1};return loginGive(0);}
function loginTomorrow(){const L=S.login,x=loginAvail();const n=L&&L.day===dayKey()?L.n:x&&x.cont?(L.n||0)+1:1;return LOGIN_GOLD[n%7];}
function loginOffer(){const x=loginAvail();if(!x||$('modal').classList.contains('on'))return false;
  const cells=LOGIN_GOLD.map((g,i)=>'<div class="dcell'+(i<x.idx?' got':'')+(i===x.idx?' now':'')+'"><small>'+(i+1)+' день</small><b>'+g+'</b>'+(i===6?'<small>+10 мин ⏩</small>':'')+'</div>').join('');
  showModal('<h3>Награда за вход</h3><p class="sub">'+(x.cont?'День '+(x.idx+1)+' из 7. Заходи каждый день — награда растёт.':'Серия началась заново — заходи каждый день, награда растёт. Один пропуск прощаем.')+'</p>'+
    '<div class="days">'+cells+'</div><div class="btns"><button class="btn gold big" id="lgGet"><img src="'+ic('ingot',40)+'">Забрать +'+LOGIN_GOLD[x.idx]+'</button></div>');
  on('lgGet',()=>{const L=S.login||{n:0};S.login={day:dayKey(),n:(x.cont?(L.n||0):0)+1};const g=loginGive(x.idx);save();SND.up();toast('+'+fmtGold(g)+(x.idx===6?' и +10 мин ускорения':''));hideModal();openTab(curTab);});
  return true;}
/* ярлык, оценка, избранное — не чаще одного предложения за сессию, после победы, с 3-й победы и не в первые 2 минуты; спросили — запомнили */
let retAsked=false;
async function retOffer(){if(retAsked||S.wins<3||Date.now()-BOOT_T<120000||$('modal').classList.contains('on'))return;const R=S.ret;
  const ask=(k,fn)=>{retAsked=true;R[k]=1;save();try{const p=fn();p&&p.catch&&p.catch(()=>{});}catch(e){}};
  try{if(ysdk){
      if(!R.review&&S.wins>=5&&ysdk.feedback){const c=await ysdk.feedback.canReview();if(c&&c.value)return ask('review',()=>ysdk.feedback.requestReview());}
      if(!R.short&&ysdk.shortcut){const c=await ysdk.shortcut.canShowPrompt();if(c&&c.canShow)return ask('short',()=>ysdk.shortcut.showPrompt());}}
    if(VK){if(!R.fav)return ask('fav',()=>vkSend('VKWebAppAddToFavorites',{},60000));
      if(!R.home){const r=await vkSend('VKWebAppAddToHomeScreenInfo');if(r&&r.is_feature_supported&&!r.is_added_to_home_screen)return ask('home',()=>vkSend('VKWebAppAddToHomeScreen',{},60000));R.home=1;save();}}
  }catch(e){}}
// силуэт закрытой главы — один раз, без медленного canvas filter на каждом кадре карты
function silhouette(key){const id='sil:'+key;if(mapCache[id])return mapCache[id];const s=artCanvas(key,128),c=document.createElement('canvas');c.width=c.height=128;
  const g=c.getContext('2d');g.drawImage(s,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,128,128);return mapCache[id]=c;}

/* ================= запуск ================= */
function onSaveMerged(){if(!G){openTab(curTab);loginOffer();}}
function onReady(){
  cv=$('cv');ctx=cv.getContext('2d');
  $('hLives').querySelector('span').id='hLivesT';$('hCoins').querySelector('span').id='hCoinsT';
  $('icHeart').src=ic('heart',64);$('icCoin').src=ic('coin',64);$('icThunder').src=ic('sp_thunder',112);$('icCat').src=ic('sp_cat',112);
  $('pStarIc').src=ic('star',48);$('pGoldIc').src=ic('ingot',48);
  $('nav1').src=ic('b_map');$('nav2').src=ic('b_forge');$('nav3').src=ic('b_vil');$('nav4').src=ic('b_siege');
  for(const b of document.querySelectorAll('nav button'))b.onclick=()=>{SND.click();openTab(b.dataset.tab);};
  on('setBtn',openSettings);
  layout();initInput();window.addEventListener('resize',()=>{layout();if(!G&&curTab==='Map')drawMap();if(ringI>=0)ringBuild();});
  mapSel=S.lastCh||0;dailyBoost();openTab('Map');
  $('loading').style.display='none';
  // новичок — сразу в первый бой, без окна и стены текста (разблокировка звука — в core.js, на любое касание)
  if(!S.tut){S.tut=1;save();setTimeout(()=>startLevel(0,0),250);}
  else if(!loginOffer()&&afkGold()>=afkReadyAt())toast('В казне накопилось '+fmtGold(afkGold())+'!');
  window.addEventListener('orientationchange',()=>setTimeout(()=>window.dispatchEvent(new Event('resize')),300));
  requestAnimationFrame(loop);
  setInterval(()=>{if(!G&&curTab==='Village')renderVillage();setPills();},30000);
  if(/[?&](bot|shot)/.test(location.search))loadScript('tools/bot.js').then(()=>SHOT&&loadScript('tools/promo.js')).catch(()=>{});
  window.__test={get G(){return G;},update,render,layout,newBattle,startLevel,startEndless,tryBuild,tryUpgrade,callWave};
}
initSDK();
