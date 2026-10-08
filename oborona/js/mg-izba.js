'use strict';
/* OB:MG0 «Дозорная изба» — экран, плитка-сцена в деревне, «Дело дня», ситуативные входы, Дозорная книга, тренировка, окно итогов.
   Входы в игру извне: деревня (плитка), «Сегодня» на карте (фишка), 4-е задание дня (строка в «Заданиях дня»), окно поражения (Частокол),
   окно перед Логовом (Разведка), окно перед боем (строка «Дозор приготовил…»). Данные и награды — js/mg-core.js. */

/* ---------- что «горит» (красная точка) ---------- */
function dzDayState(){const z=DZ(),n=mgDayNum();return {n,played:!!(n&&z.d.p[n]),ad:!!z.d.a};}
function dzSitList(){const z=DZ(),a=[];if(!mgIzbaOpen())return a;
  if(mgAvail(2)&&z.chp&&z.d.c<MG_RW.chMax)a.push({n:2,mode:'sit',ctx:{c:z.chp.c,l:z.chp.l},t:Lg('После поражения: залатай частокол — +2 ❤ в следующем бою','After a defeat: patch the palisade — +2 ❤ next battle')});
  if(mgAvail(7)){const c=dzLairTodo();if(c!=null)a.push({n:7,mode:'sit',ctx:{lair:c},t:Lg('Логово «'+CH[c].name+'» ждёт — разведай тропу: волны и 2 трофея','The “'+CH[c].name+'” Lair awaits — scout the trail: its waves and 2 trophies')});}
  if(mgAvail(13)&&z.w.w!==weekNo())a.push({n:13,mode:'week',t:Lg('Раз в неделю: сундук логова — трофеи и знамёна набегов','Once a week: the lair chest — trophies and raid banners')});
  if(mgAvail(4)&&mgFestNow()&&!z.d.p[4]&&mgDayNum()!==4)a.push({n:4,mode:'fest',t:Lg('Праздник! Ночной дозор каждый день — трофеи и очки праздника','Holiday! Night Watch every day — trophies and holiday points')});
  return a;}
function dzLairTodo(){const z=DZ(),o=typeof CH_ORDER!=='undefined'?CH_ORDER:[];for(const c of o){if(!CH[c]||!S.stars[c+'-5'])continue;if(typeof chLvN==='function'&&chLvN(c)<7)continue;if(S.stars[c+'-6']||z.lr[c])continue;return c;}return null;}
function dzDailyTodo(){const z=DZ();return MG_DAILY.filter(n=>mgAvail(n)&&!z.d.p[n]);}
function dzNewGames(){const z=DZ();const a=[];for(const n in MG_INFO)if(mgAvail(+n)&&!z.s[n])a.push(+n);return a;}
function dzHot(){if(!mgIzbaOpen())return false;const d=dzDayState();return (d.n&&!d.played)||dzDailyTodo().length>0||dzSitList().some(x=>x.n!==4||!DZ().d.p[4])||dzNewGames().length>0;}

/* ---------- запуск игры из избы/окон ---------- */
function dzPlay(n,mode,ctx,extra){const g=mgG(n);if(!g){toast(Lg('Эта игра ещё в пути — скоро будет!','This game is on its way — coming soon!'));return;}
  const z=DZ();if(!z.s[n]){z.s[n]=1;dzTouch();save();try{STAT.ev('mg',{a:'first',id:(mgG(n)||{}).id||n});}catch(e){}}   // OB:FINAL STAT: первый заход в новую игру
  try{SND.click();}catch(e){}MG_OPEN(g.id,Object.assign({mode:mode||'train',train:mode==='train',ctx:ctx||{}},extra||{}));}
function dzPlayDay(){const d=dzDayState();if(!d.n)return;dzPlay(d.n,d.played?'train':'day',{},{from:'izba'});}

/* ---------- сцена: вечер у дозорной избы (холст). opt: {t, tile, sign:num, dpr} ---------- */
const DZS={bg:null,bgK:''};
function dzSceneBg(W,H,d,tile){const k=W+'x'+H+'@'+d+(tile?'t':'');if(DZS.bgK===k&&DZS.bg)return DZS.bg;const c=mkCanvas(W*d,H*d),g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin='round';g.lineCap='round';
  const hz=H*(tile?.5:.56);
  let q=g.createLinearGradient(0,0,0,hz);q.addColorStop(0,'#5b6fc0');q.addColorStop(.45,'#c98ab0');q.addColorStop(.8,'#f6b878');q.addColorStop(1,'#ffe0a8');g.fillStyle=q;g.fillRect(0,0,W,hz+4);
  // солнце у кромки леса
  const sx=W*(tile?.82:.2),sy=hz*.86;q=g.createRadialGradient(sx,sy,2,sx,sy,H*.5);q.addColorStop(0,'rgba(255,250,210,1)');q.addColorStop(.12,'rgba(255,214,140,.85)');q.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=q;g.fillRect(0,0,W,hz+4);
  g.fillStyle='#fff3c8';g.beginPath();g.arc(sx,sy,Math.max(8,H*.05),0,TAU);g.fill();
  // облака, подсвеченные снизу
  const R=mulberry(11);for(let i=0;i<(tile?3:5);i++){const cx=R()*W,cy=hz*(.15+R()*.4),s=(.6+R()*.6)*H/260;
    for(const [dx,dy,r] of[[0,0,22],[22,-6,17],[-20,3,15],[40,4,13],[-36,6,10]]){const gx=cx+dx*s*1.4,gy=cy+dy*s;q=g.createLinearGradient(0,gy-r*s,0,gy+r*s);q.addColorStop(0,'rgba(255,240,245,.95)');q.addColorStop(1,'rgba(255,190,170,.9)');
      g.fillStyle=q;g.beginPath();g.arc(gx,gy,r*s*1.2,0,TAU);g.fill();}}
  // дальние горы и холмы (воздушная перспектива)
  const ridge=(y0,amp,f,col,seed)=>{const r=mulberry(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,hz+4);for(let x=0;x<=W+10;x+=10)g.lineTo(x,y0-amp*(.5+.5*Math.sin(x/W*f+seed))-r()*amp*.25);g.lineTo(W,hz+4);g.closePath();g.fill();};
  ridge(hz-H*.02,H*.16,5,'#9a8ab8',3);ridge(hz+2,H*.1,9,'#7f86a8',7);
  // лес: ели силуэтом, с тёплой каймой
  for(let row=0;row<2;row++){const y0=hz+row*H*.03,col=row?'#2f5a3a':'#3f6a4a',hh=H*(row?.13:.1);for(let x=-10;x<W+20;x+=hh*.42){const y=y0+Math.sin(x*.37+row)*H*.008,h=hh*(.75+.35*Math.abs(Math.sin(x*1.7+row*3)));
    g.fillStyle=col;g.beginPath();g.moveTo(x-h*.28,y+2);g.lineTo(x,y-h);g.lineTo(x+h*.28,y+2);g.closePath();g.fill();g.strokeStyle='rgba(255,190,120,.35)';g.lineWidth=1;g.beginPath();g.moveTo(x-h*.16,y-h*.45);g.lineTo(x,y-h);g.stroke();}}
  // луг
  q=g.createLinearGradient(0,hz,0,H);q.addColorStop(0,'#7aa858');q.addColorStop(.5,'#5f9444');q.addColorStop(1,'#467a34');g.fillStyle=q;g.fillRect(0,hz+H*.02,W,H);
  // частокол поперёк поля (за избой)
  const py=hz+H*(tile?.12:.1),ph=H*(tile?.14:.12);for(let x=-6;x<W+8;x+=ph*.26){const h=ph*(.92+.12*Math.sin(x*.9));
    q=g.createLinearGradient(x,0,x+ph*.24,0);q.addColorStop(0,'#b58456');q.addColorStop(1,'#7a5230');g.fillStyle=q;g.beginPath();g.moveTo(x,py+ph);g.lineTo(x,py+ph-h);g.lineTo(x+ph*.12,py+ph-h-ph*.18);g.lineTo(x+ph*.24,py+ph-h);g.lineTo(x+ph*.24,py+ph);g.closePath();g.fill();
    g.strokeStyle='rgba(60,36,16,.55)';g.lineWidth=.8;g.stroke();}
  g.strokeStyle='#5a3a1e';g.lineWidth=Math.max(1.5,ph*.06);for(const f of[.35,.75]){g.beginPath();g.moveTo(0,py+ph*f);g.lineTo(W,py+ph*f);g.stroke();}
  // тропинка к крыльцу
  const ix=W*(tile?.3:.5);g.fillStyle='rgba(226,196,140,.9)';g.beginPath();g.moveTo(ix-W*.02,H*.86);g.quadraticCurveTo(ix-W*.12,H*.95,ix-W*.18,H+4);g.lineTo(ix+W*.1,H+4);g.quadraticCurveTo(ix+W*.04,H*.95,ix+W*.04,H*.86);g.closePath();g.fill();
  // травинки
  g.strokeStyle='rgba(40,90,30,.35)';g.lineWidth=1;const r2=mulberry(5);for(let i=0;i<W*H/700;i++){const x=r2()*W,y=py+ph+r2()*(H-py-ph);g.beginPath();g.moveTo(x,y);g.lineTo(x-1.5,y-5);g.moveTo(x,y);g.lineTo(x+1.5,y-5);g.stroke();}
  DZS.bg=c;DZS.bgK=k;return c;}
function dzScene(cv,opt){opt=opt||{};const W=cv.W,H=cv.H,d=cv.D,g=cv.getContext('2d'),t=opt.t||0,tile=!!opt.tile;g.setTransform(1,0,0,1,0,0);
  g.drawImage(dzSceneBg(W,H,d,tile),0,0);g.setTransform(d,0,0,d,0,0);g.lineJoin='round';g.lineCap='round';
  // изба с вышкой — вектором (колокол качается, флажок вьётся)
  const ix=W*(tile?.3:.5),s=Math.min(H*(tile?.0082:.0066),W*(tile?.0062:.0056)),iy=H*(tile?.62:.62);
  g.save();g.translate(ix,iy);g.scale(s,s);mgIzba(g,{ph:t,lit:1});g.restore();
  // дозорный у крыльца
  const gk='hp_ale';MGK.put(g,gk,ix-s*64,iy+s*24,s*44,d,{});
  // столб с доской «Дело дня»
  if(!tile&&opt.sign){const bx=ix+s*82,by=iy+s*6;g.fillStyle='#6a4222';g.fillRect(bx-s*1.6,by-s*6,s*3.2,s*44);
    const bw=s*40,bh=s*34;g.save();g.translate(bx,by-s*12);g.rotate(Math.sin(t*1.3)*.03);rrect(g,-bw/2,-bh/2,bw,bh,s*3);g.fillStyle=grad(g,0,0,bw*.6,'#c8945a');g.fill();outline(g,'#c8945a',s*1.2);
    MGK.put(g,'mg_i'+opt.sign,0,s*1,s*30,d,{});g.restore();}
  // светлячки
  if(!opt.still){for(let i=0;i<(tile?6:12);i++){const ph=i*1.7,x=(W*(.08+.84*((i*.37)%1))+Math.sin(t*.7+ph)*14),y=H*(.62+.3*((i*.53)%1))+Math.cos(t*.9+ph)*9,a=.5+.5*Math.sin(t*2.4+ph);
    g.globalAlpha=a;const sp=typeof glowSpr==='function'?glowSpr('#ffe27a'):null;if(sp)g.drawImage(sp,x-7,y-7,14,14);g.fillStyle='#fffbe0';g.beginPath();g.arc(x,y,1.3,0,TAU);g.fill();}g.globalAlpha=1;}
  // передний план: кусты
  MGK.put(g,'d_bush',W*(tile?.05:.08),H*.95,H*(tile?.28:.2),d,{});MGK.put(g,'d_bush',W*(tile?.55:.93),H*.97,H*(tile?.24:.18),d,{});
  if(!tile)MGK.put(g,'kot',ix+s*112,iy+s*28,s*22,d,{});}
function dzCv(cv,W,H){const d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*d);cv.height=Math.round(H*d);cv.style.width=W+'px';cv.style.height=H+'px';cv.W=W;cv.H=H;cv.D=d;}

/* ---------- стиль избы ---------- */
function dzCss(){mgCss();if($('dzCss'))return;const st=document.createElement('style');st.id='dzCss';st.textContent=
 '#dzIzba{position:fixed;top:0;right:0;bottom:0;left:0;z-index:27;background:var(--menuBg,#ecd9a8);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}'+
 '#dzIzba .dzSc{position:relative;width:100%;overflow:hidden;border-bottom:4px solid var(--wood,#9a6332);box-shadow:0 4px 0 var(--lip)}#dzIzba .dzSc canvas{display:block}'+
 '#dzIzba .dzTitle{position:absolute;left:50%;top:calc(var(--st,0px) + 12px);transform:translateX(-50%);white-space:nowrap;font:800 24px/1.1 var(--f);color:#fff;background:var(--rib,#c9361d);border:2.5px solid var(--ribE,#7a1e0e);border-radius:12px;padding:6px 22px;text-shadow:0 2px 0 var(--ribE,#7a1e0e);box-shadow:0 4px 0 rgba(40,24,10,.35)}'+
 '#dzIzba .dzCol{max-width:560px;margin:0 auto;padding:14px 12px calc(var(--sb,0px) + 24px)}'+
 '#dzIzba h2{font:800 20px/1.2 var(--f);color:var(--ink);margin:14px 4px 8px}'+
 '#dzIzba .dzDay{position:relative;padding-top:30px;margin-top:10px}'+
 '#dzIzba .dzRib{position:absolute;left:50%;top:-12px;transform:translateX(-50%);white-space:nowrap;font:800 15px/1 var(--f);color:#fff;background:var(--rib,#c9361d);border:2px solid var(--ribE,#7a1e0e);border-radius:10px;padding:6px 14px;text-shadow:0 1px 0 var(--ribE)}'+
 '#dzIzba .dzIc{width:84px;height:84px;flex:none;filter:drop-shadow(0 4px 6px rgba(0,0,0,.3))}#dzIzba .dzIs{width:56px;height:56px;flex:none}'+
 '#dzIzba .t b{display:block}#dzIzba .t span{display:block}#dzIzba .t em{display:block;font-style:normal;font-weight:800;font-size:14px;color:var(--cGold);margin-top:4px}'+
 '#dzIzba .dzDot{position:absolute;top:8px;right:8px;width:14px;height:14px;border-radius:50%;background:#e8433a;border:2px solid #fff;box-shadow:0 0 0 1px #7a1e0e}'+
 '#dzIzba .dzGrid{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}'+
 '#dzIzba .dzTr{width:104px;text-align:center;padding:8px 4px;border-radius:14px;background:var(--paper,#fffaf0);border:2px solid var(--wood);box-shadow:0 3px 0 var(--lip);cursor:pointer;color:var(--ink);font:700 13px/1.2 var(--f)}'+
 '#dzIzba .dzTr img{width:58px;height:58px;display:block;margin:0 auto 4px}#dzIzba .dzTr small{display:block;color:var(--cGold);font-weight:800;margin-top:3px}'+
 '#dzIzba .dzTr.lock{opacity:.6;cursor:default}#dzIzba .dzTr.lock img{filter:grayscale(1)}#dzIzba .dzTr.lock small{color:var(--ink2);font-weight:600}'+
 '#dzIzba .dzLv{display:flex;align-items:center;gap:10px}#dzIzba .dzLvN{position:relative;width:64px;height:64px;flex:none}#dzIzba .dzLvN img{width:64px;height:64px}'+
 '#dzIzba .dzLvN b{position:absolute;right:-4px;bottom:-4px;min-width:28px;height:28px;border-radius:14px;background:linear-gradient(#ffe066,#f5b21a);border:2px solid #7a4a10;font:900 15px/24px var(--f);text-align:center;color:#4a2c04}'+
 '#dzIzba .bar{height:12px;border-radius:7px;background:rgba(110,67,31,.18);overflow:hidden;margin-top:5px}#dzIzba .bar i{display:block;height:100%;border-radius:7px;background:linear-gradient(90deg,#7cc94e,#4a9a2c)}'+
 '#dzIzba .dzTrack{display:flex;justify-content:space-between;align-items:flex-end;gap:4px;margin:12px 2px 4px;position:relative}'+
 '#dzIzba .dzTrack:before{content:"";position:absolute;left:24px;right:24px;top:28px;height:4px;border-radius:2px;background:rgba(110,67,31,.25)}'+
 '#dzIzba .dzTk{position:relative;text-align:center;width:58px;font:800 12px/1.1 var(--f);color:var(--ink2)}#dzIzba .dzTk img{width:56px;height:56px;display:block;margin:0 auto 2px}'+
 '#dzIzba .dzTk.no img{filter:grayscale(1) opacity(.55)}#dzIzba .dzTk.got{color:var(--cOk)}'+
 '#dzIzba .btns.h{flex-direction:row}#dzIzba .btns.h .btn{flex:1}'+
 '@media (max-width:380px){#dzIzba .dzTitle{font-size:20px;padding:6px 14px}}@media (min-width:880px){#dzIzba .dzCol{max-width:980px;display:flex;flex-wrap:wrap;gap:0 18px}#dzIzba .dzCol>.dzA{flex:1 1 460px;min-width:0}}'+
 '.dzTile{position:relative;padding:0!important;overflow:hidden;cursor:pointer}.dzTile canvas{display:block;width:100%}'+
 '.dzTile .dzTl{position:absolute;right:10px;top:10px;bottom:10px;width:52%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:4px}'+
 '.dzTile .dzTl b{font:800 19px/1.1 var(--f);color:#fff;text-shadow:0 2px 0 rgba(60,30,10,.9),0 0 6px rgba(60,30,10,.8)}'+
 '.dzTile .dzTl span{font:700 13px/1.25 var(--f);color:#fff7e0;text-shadow:0 1px 0 rgba(60,30,10,.9),0 0 5px rgba(60,30,10,.9)}'+
 '.dzTile .dzTl .btn{width:auto;min-height:40px;margin-top:4px}'+
 '.dzTile .dzDot{position:absolute;top:8px;left:8px;width:16px;height:16px;border-radius:50%;background:#e8433a;border:2px solid #fff;box-shadow:0 0 0 1px #7a1e0e}'+
 '.dzTile.lock{filter:saturate(.35) brightness(.92);cursor:default}';
 document.head.appendChild(st);}

/* ---------- экран избы ---------- */
let dzRaf=0;
/* OB:FINAL STAT: открытие игры по прогрессу — раз на игру (S.dzr.u) */
function dzUnlockStat(){try{const z=DZ();z.u=z.u||{};for(let n=1;n<=14;n++)if(mgAvail(n)&&!z.u[n]){z.u[n]=1;STAT.ev('mg',{a:'open',id:(mgG(n)||{}).id||n,l:mgLvl()});}}catch(e){}}
function MG_IZBA(){if(!mgIzbaOpen()){toast(Lg('Дозорная изба откроется после уровня 1-3','The Watch Hut opens after level 1-3'));return;}
  dzCss();let el=$('dzIzba');const fresh=!el;if(!el){el=document.createElement('div');el.id='dzIzba';document.body.appendChild(el);}
  const sc=fresh?0:el.scrollTop;try{STAT.screen('izba');if(fresh)STAT.ev('mod',{m:'mg',a:'izba',hot:dzHot()?1:0});}catch(e){}
  const z=DZ(),D=dzDayState(),wdN=[Lg('Воскресенье','Sunday'),Lg('Понедельник','Monday'),Lg('Вторник','Tuesday'),Lg('Среда','Wednesday'),Lg('Четверг','Thursday'),Lg('Пятница','Friday'),Lg('Суббота','Saturday')];
  const wd=new Date(nowMs()).getDay(),tomorrow=(()=>{const p=dayKey().split('-').map(Number),t=new Date(p[0],p[1]-1,p[2]+1);return mgDayNum(dayKey(t.getTime()));})();
  let h='<div class="dzSc"><canvas id="dzCv"></canvas><div class="dzTitle">'+Lg('Дозорная изба','Watch Hut')+'</div><button class="mgX" id="dzX" aria-label="'+Lg('Закрыть','Close')+'">✕</button></div><div class="dzCol"><div class="dzA">';
  // Дело дня
  if(D.n){const rw=MG_RW[D.n],mx=rw?Math.max.apply(null,rw.tr):0;
    h+='<div class="card dzDay">'+(D.played?'':'<i class="dzDot"></i>')+'<div class="dzRib">'+Lg('Дело дня · ','Deed of the day · ')+wdN[wd]+'</div><div class="row"><img class="dzIc" src="'+mgIc(D.n,168)+'" alt=""><div class="t"><b style="font-size:19px">'+mgNameN(D.n)+'</b><span>'+mgAbout(D.n)+'</span>'+
      '<em>'+(D.played?Lg('✓ Сыграно сегодня','✓ Played today'):Lg('Награда: до '+mx+' '+plw(mx,'трофея','трофеев','трофеев','trophy','trophies').split(' ').pop()+' и Слава','Reward: up to '+mx+' trophies and Fame'))+'</em></div></div>'+
      '<div class="btns">'+(D.played?(!D.ad&&adOk()?'<button class="btn ad" id="dzAd">'+Lg('🎬 Ещё заход за рекламу — ½ награды','🎬 One more run for an ad — ½ reward')+'</button>':'')+'<button class="btn ghost" id="dzDay">'+Lg('Поиграть ещё (тренировка)','Play more (training)')+'</button>'
        :'<button class="btn big" id="dzDay">'+Lg('Играть','Play')+'</button>')+'</div>'+
      (tomorrow?'<span class="note">'+Lg('Завтра: ','Tomorrow: ')+mgNameN(tomorrow)+Lg(' · идёт 4-м заданием дня — в сундук дня',' · counts as the 4th daily quest — into the daily chest')+'</span>':'')+'</div>';}
  else h+='<div class="card"><b>'+Lg('Скоро здесь будет «Дело дня»','The Deed of the Day is coming soon')+'</b></div>';
  // по событию
  const sit=dzSitList();if(sit.length){h+='<h2>'+Lg('Сейчас','Right now')+'</h2>';for(const s of sit)h+='<div class="card"><div class="row"><img class="dzIs" src="'+mgIc(s.n,112)+'" alt=""><div class="t"><b>'+mgNameN(s.n)+'</b><span>'+s.t+'</span></div><button class="btn gold" data-sit="'+s.n+'">'+Lg('Играть','Play')+'</button></div></div>';}
  // каждый день
  const dl=MG_DAILY.filter(n=>mgAvail(n));if(dl.length){h+='<h2>'+Lg('Каждый день','Every day')+'</h2>';
    for(const n of dl){const done=!!z.d.p[n];h+='<div class="card" style="position:relative">'+(done?'':'<i class="dzDot"></i>')+'<div class="row"><img class="dzIs" src="'+mgIc(n,112)+'" alt=""><div class="t"><b>'+mgNameN(n)+'</b><span>'+mgAbout(n)+'</span></div>'+
      (done?'<span class="tag ok">✓</span>':'<button class="btn gold" data-dly="'+n+'">'+Lg('Играть','Play')+'</button>')+'</div></div>';}}
  h+='</div><div class="dzA">';
  // Дозорная книга
  {const L=dzLv(z.x);h+='<h2>'+Lg('Дозорная книга','Watch Book')+'</h2><div class="card"><div class="dzLv"><div class="dzLvN"><img src="'+ic('mg_book',128)+'" alt=""><b>'+L.l+'</b></div><div class="t"><b>'+Lg('Дозорный, ур. ','Watchman, lvl ')+L.l+'</b>'+
    '<span>'+Lg('Очки дозора: ','Watch points: ')+L.cur+' / '+L.need+Lg(' — за каждую игру с наградой',' — for every rewarded game')+'</span><div class="bar"><i style="width:'+Math.round(L.cur/L.need*100)+'%"></i></div></div></div>'+dzTrackHTML(L.l)+
    '<div class="btns"><button class="btn ghost" id="dzBook">'+Lg('📖 Открыть книгу: рекорды и награды','📖 Open the book: records and rewards')+'</button></div></div>';}
  // тренировка
  h+='<h2>'+Lg('Тренировка','Training')+'</h2><p class="sub" style="text-align:left">'+Lg('Любая открытая игра — сколько угодно, без наград. Только рекорд.','Any unlocked game — as much as you like, no rewards. Just your record.')+'</p><div class="dzGrid">';
  for(let n=1;n<=14;n++){const op=mgOpenN(n),g=mgG(n),ok=op&&!!g;h+='<div class="dzTr'+(ok?'':' lock')+'" '+(ok?'data-tr="'+n+'"':'')+'><img src="'+(op?mgIc(n,112):ic('mg_lock',112))+'" alt="">'+mgNameN(n)+
    '<small>'+(ok?(z.b[n]?Lg('рекорд ','best ')+fmtNum(z.b[n]):Lg('ещё не играл','not played yet')):op?Lg('скоро','soon'):mgLockTxt(n))+'</small></div>';}
  h+='</div></div></div>';
  el.innerHTML=h;el.scrollTop=sc;
  on('dzX',()=>{SND.click();dzClose();});on('dzDay',dzPlayDay);on('dzBook',()=>{SND.click();dzBook();});
  {const b=$('dzAd');if(b)adOn('dzAd','mg_more',()=>showRewarded(()=>{dzPlay(D.n,'day2',{},{from:'izba'});},null,dzLateMore));}
  for(const b of el.querySelectorAll('[data-sit]'))b.onclick=()=>{const s=sit.find(x=>x.n===+b.dataset.sit);if(s)dzPlay(s.n,s.mode,s.ctx,{from:'izba',battle:s.n===2&&s.ctx?s.ctx:null});};
  for(const b of el.querySelectorAll('[data-dly]'))b.onclick=()=>dzPlay(+b.dataset.dly,'daily',{},{from:'izba'});
  for(const b of el.querySelectorAll('[data-tr]'))b.onclick=()=>dzPlay(+b.dataset.tr,'train',{},{from:'izba'});
  // сцена
  const cv=$('dzCv'),W=el.clientWidth||window.innerWidth,H=Math.round(Math.max(200,Math.min(320,window.innerHeight*.34,W*.62)));dzCv(cv,W,H);
  cancelAnimationFrame(dzRaf);const calm=mgCalm(),t0=performance.now();
  const fr=now=>{if(!$('dzIzba'))return;const t=(now-t0)/1000;if(!$('mgHost'))dzScene(cv,{t,sign:D.n,still:calm});if(!calm)dzRaf=requestAnimationFrame(fr);};fr(t0+(calm?0:1));
  if(fresh){window.addEventListener('resize',dzResize);try{musicMode('menu');}catch(e){}}}
function dzResize(){if($('dzIzba')&&!$('mgHost'))MG_IZBA();}
function dzClose(){cancelAnimationFrame(dzRaf);const el=$('dzIzba');if(el)el.remove();window.removeEventListener('resize',dzResize);try{STAT.screen(String(curTab).toLowerCase());}catch(e){}
  try{if(curTab==='Village')renderVillage();else if(curTab==='Map'&&typeof renderMap==='function')openTab('Map');setPills();}catch(e){}}
function dzTrackHTML(L){return '<div class="dzTrack">'+DZ_TRACK.map(t=>{const got=L>=t.l,img=t.bn?dzBnURL(t.bn,112):ic('ti_arch_3~'+t.sk,112);
  return '<div class="dzTk'+(got?' got':' no')+'"><img src="'+img+'" alt="">'+(got?'✓ ':'')+Lg('ур. ','lvl ')+t.l+'</div>';}).join('')+'</div>';}

/* ---------- Дозорная книга: награды дорожки (поднять/надеть), знамёна набегов, рекорды ---------- */
function dzBook(){const el=$('dzIzba');if(!el)return;const z=DZ(),L=dzLv(z.x);
  let h='<div class="panel"><h3>'+Lg('Дозорная книга','Watch Book')+'</h3><p class="sub">'+Lg('Каждая игра с наградой даёт очки дозора: больше звёзд — больше очков, рекорд — ещё +5. На уровнях 3, 6, 10, 15 и 20 — знамёна и облики застав.','Every rewarded game gives watch points: more stars — more points, a record — +5 more. At levels 3, 6, 10, 15 and 20 — banners and outpost looks.')+'</p>';
  h+='<div class="card"><div class="dzLv"><div class="dzLvN"><img src="'+ic('mg_book',128)+'" alt=""><b>'+L.l+'</b></div><div class="t"><b>'+Lg('Дозорный, ур. ','Watchman, lvl ')+L.l+'</b><span>'+L.cur+' / '+L.need+'</span><div class="bar"><i style="width:'+Math.round(L.cur/L.need*100)+'%"></i></div></div></div></div>';
  for(const t of DZ_TRACK){const got=L.l>=t.l;let act='';
    if(t.bn){const own=typeof xbnOwn==='function'&&xbnOwn(t.bn);act=own?(S.bn===t.bn?'<span class="tag ok">'+Lg('Реет над воротами','Flying over the gate')+'</span>':'<button class="btn" data-bnup="'+t.bn+'">'+Lg('Поднять','Raise')+'</button>'):'<span class="note">'+Lg('ур. ','lvl ')+t.l+'</span>';}
    else{const own=dzSkAll(t.sk),on=own&&TW_ORDER.every(w=>S.skin[w]===t.sk);act=own?(on?'<span class="tag ok">'+Lg('Надет','On')+'</span>':'<button class="btn" data-skon="'+t.sk+'">'+Lg('Надеть на все','Wear on all')+'</button>'):'<span class="note">'+Lg('ур. ','lvl ')+t.l+'</span>';}
    h+='<div class="card"><div class="row"><img class="ic" style="width:64px;height:64px'+(got?'':';filter:grayscale(1) opacity(.6)')+'" src="'+(t.bn?dzBnURL(t.bn,128):ic('ti_arch_3~'+t.sk,128))+'" alt=""><div class="t"><b>'+(t.bn?dzBnName(t.bn):Lg('Облик застав «','Outpost look “')+dzSkName(t.sk)+Lg('»','”'))+'</b><span>'+
      (t.bn?Lg('Знамя реет над воротами в каждом бою','The banner flies over the gate in every battle'):Lg('Наряд для всех застав — только вид','An outfit for all outposts — looks only'))+'</span></div>'+act+'</div></div>';}
  h+='<h2 style="margin:12px 4px 6px">'+Lg('Знамёна набегов','Raid banners')+'</h2><div class="dzGrid">'+DZ_RAID.map(r=>{const own=typeof xbnOwn==='function'&&xbnOwn(r.bn);
    return '<div class="dzTr'+(own?'':' lock')+'"'+(own&&S.bn!==r.bn?' data-bnup="'+r.bn+'"':'')+'><img src="'+dzBnURL(r.bn,112)+'" alt="">'+dzBnName(r.bn)+'<small>'+(own?(S.bn===r.bn?Lg('реет','flying'):Lg('поднять','raise')):Lg(r.n+'-й набег',(r.n===1?'1st':r.n===3?'3rd':r.n+'th')+' raid'))+'</small></div>';}).join('')+'</div>';
  h+='<h2 style="margin:12px 4px 6px">'+Lg('Рекорды','Records')+'</h2>';
  for(let n=1;n<=14;n++){const op=mgOpenN(n);h+='<div class="qrow" style="display:flex;align-items:center;gap:10px;padding:4px 2px"><img src="'+(op?mgIc(n,72):ic('mg_lock',72))+'" style="width:36px;height:36px" alt=""><div class="t"><b>'+mgNameN(n)+'</b></div><b style="color:var(--cGold)">'+(z.b[n]?fmtNum(z.b[n]):'—')+'</b></div>';}
  h+='<div class="btns"><button class="btn big" id="dzBkX">'+Lg('Закрыть','Close')+'</button></div></div>';
  const v=document.createElement('div');v.className='mgVeil';v.style.position='fixed';v.style.zIndex='29';v.innerHTML=h;el.appendChild(v);
  const re=()=>{v.remove();dzBook();};
  on('dzBkX',()=>{SND.click();v.remove();MG_IZBA();});
  for(const b of v.querySelectorAll('[data-bnup]'))b.onclick=()=>{SND.click();S.bn=b.dataset.bnup;save();toast(Lg('Знамя поднято над воротами!','The banner is raised over the gate!'));re();};
  for(const b of v.querySelectorAll('[data-skon]'))b.onclick=()=>{SND.up();for(const w of TW_ORDER)S.skin[w]=b.dataset.skon;save();toast(Lg('Облик надет на все заставы','The look is on all outposts'));re();};}

/* ---------- окно итогов игры (поверх игры, в host) ---------- */
function MG_FIN_UI(g,o,r,opt){const c=MG.cur,host=c&&c.host;if(!host){MG_CLOSE();return;}host.hold=true;const n=g.num|0,info=MG_INFO[n]||{},calm=mgCalm();
  const v=document.createElement('div');v.className='mgVeil';const showStars=info.k==='score'||info.k==='week'||!info.k;
  let h='<div class="panel mgRes"><h3>'+mgName(g)+'</h3>';
  const lbl=r.extra&&r.extra.lbl||g.unit&&Lg(g.unit.ru||g.unit[0],g.unit.en||g.unit[1])||Lg('очков','points');
  h+='<div class="mgScore" id="mgSc">'+(calm?fmtNum(r.score):'0')+'</div><div class="mgSub">'+lbl+(r.best&&!r.rec?Lg(' · рекорд ',' · best ')+fmtNum(r.best):'')+'</div>';
  if(r.rec&&!r.first)h+='<span class="mgRec">'+Lg('Новый рекорд!','New record!')+'</span>';
  if(showStars)h+='<div class="mgStars">'+[1,2,3].map(i=>'<img src="'+ic(i<=r.tier?'star':'star0',112)+'" class="'+(i<=r.tier?'on':'off')+'" style="animation-delay:'+(.35+i*.28)+'s'+(i<=r.tier?'':';opacity:.55')+'" alt="">').join('')+'</div>';
  if(r.train)h+='<p class="sub" style="text-align:center">'+Lg('Тренировка — без наград, только рекорд.','Training — no rewards, just your record.')+'</p>';
  else{const rw=[];let dl=.9;const add=(img,t,cl)=>{rw.push('<div class="'+(cl||'')+'" style="animation-delay:'+dl.toFixed(2)+'s"><img src="'+img+'" alt="">'+t+'</div>');dl+=.18;};
    if(r.trf)add(ic(trfIc(r.trf.id),72),'+'+r.trf.n+' <small style="font-weight:700">'+trfName(r.trf.id)+'</small>');
    if(r.sl)add(ic('sl_fame',72),'+'+r.sl+Lg(' Славы',' Fame'));
    if(r.buf)add(ic(r.buf.f?'mg_i14':r.buf.h?'heart':'coin',72),Lg('В следующий бой: ','Next battle: ')+mgBufTxt({h:r.buf.h,c:r.buf.c,f:r.buf.f}),'buf');
    if(r.fest)add(ic('star',72),'+'+r.fest+Lg(' к заданию праздника',' to the holiday task'));
    for(const it of r.items)add(it.img,it.t,it.big?'big':'');
    if(!rw.length&&!r.buf)add(ic('mg_book',72),Lg('Очки дозора','Watch points'));
    h+='<div class="mgRw">'+rw.join('')+'</div>';
    const L0=r.lv0,L1=r.lv1,up=L1.l>L0.l;
    h+='<div class="mgXp"><img src="'+ic('mg_book',72)+'" alt=""><span>'+Lg('Дозорный ','Watchman ')+L1.l+(up?' ⬆':'')+'</span><div class="bar"><i id="mgXpB" style="width:'+(up||calm?Math.round(L1.cur/L1.need*100):Math.round(L0.cur/L0.need*100))+'%"></i></div><span>+'+r.xp+'</span></div>';}
  // кнопки
  const z=DZ(),b=[];
  if(opt.battle&&!r.train)b.push('<button class="btn big" data-k="battle">'+Lg('В бой!','To battle!')+(r.buf&&r.buf.h?' (+'+r.buf.h+' ❤)':'')+'</button>');
  b.push('<button class="btn'+(b.length?' ghost':' big')+'" data-k="ok">'+(opt.battle?Lg('На карту','To the map'):Lg('Готово','Done'))+'</button>');
  if(o.mode==='day'&&!z.d.a&&adOk())b.push('<button class="btn ad" id="mgAgain" data-k="ad">'+Lg('🎬 Ещё заход за рекламу — ½ награды','🎬 One more run for an ad — ½ reward')+'</button>');
  if(n===8&&!r.train&&r.buf&&r.buf.c)b.push('<button class="btn ghost" data-k="alt" style="white-space:normal">'+Lg('Вместо монет — 2 трофея','2 trophies instead of coins')+'</button>');   // OB:FINAL выбор Ополчения (extra.alt)
  if(r.train)b.push('<button class="btn ghost" data-k="again">'+Lg('Ещё раз','Play again')+'</button>');
  h+='<div class="btns">'+b.join('')+'</div></div>';v.innerHTML=h;host.root.appendChild(v);
  try{if(r.tier>=2||r.rec)SND.win();else SND.up();}catch(e){}
  // счёт «набегает», звёзды звенят
  if(!calm){const el=$('mgSc'),t0=performance.now(),D=Math.min(900,300+r.score*20);const st=now=>{const k=Math.min(1,(now-t0)/D);if(el)el.textContent=fmtNum(Math.round(r.score*MGK.ease.out(k)));if(k<1)requestAnimationFrame(st);};requestAnimationFrame(st);
    for(let i=1;i<=r.tier&&showStars;i++)setTimeout(()=>{try{SND.star(i-1);}catch(e){}},(.35+i*.28)*1000+200);
    if(!r.train)setTimeout(()=>{const xb=$('mgXpB');if(xb)xb.style.width=Math.round(r.lv1.cur/r.lv1.need*100)+'%';},1100);}
  const fin=()=>{MG_CLOSE();if(opt.from==='izba'||$('dzIzba'))MG_IZBA();else{try{setPills();if(curTab==='Village')renderVillage();if(curTab==='Map'&&typeof renderQuests==='function')renderQuests();}catch(e){}}};
  for(const x of v.querySelectorAll('[data-k]')){const k=x.dataset.k;if(k==='ad')continue;x.onclick=()=>{try{SND.click();}catch(e){}
    if(k==='ok'){fin();if(opt.battle&&!$('dzIzba'))try{toMenu('Map');}catch(e){}}
    else if(k==='battle'){const bt=opt.battle;MG_CLOSE();dzClose();try{startLevel(bt.c,bt.l);}catch(e){console.warn(e);}}
    else if(k==='alt'){const sb=S.mgBuf;if(sb){sb.c=0;sb.ts=Date.now();}const q=mgTrf(MG_RW[8].alt||2);save();try{STAT.ev('mg',{a:'alt',id:g.id});}catch(e){}x.disabled=true;x.textContent=q?'+'+q.n+' '+trfName(q.id)+' ✓':'✓';const bf=v.querySelector('.mgRw .buf');if(bf)bf.remove();}
    else if(k==='again'){MG_CLOSE();MG_OPEN(g.id,{train:true,from:opt.from});}};}
  if($('mgAgain'))adOn('mgAgain','mg_more',()=>showRewarded(()=>{MG_CLOSE();MG_OPEN(g.id,{mode:'day2',from:opt.from});},null,dzLateMore));}

/* поздний «досмотрел» (adt): «Ещё заход» — сразу ½ награды трофеями (игры уже нет на экране); плотники — +3 ❤ */
function dzLateMore(){const z=DZ();if(z.d.a)return '';z.d.a=1;const q=mgTrf(1);dzTouch();save();return q?'+1 '+trfName(q.id):'';}
function dzLateCarp(){mgBufAdd({h:MG_RW.livesAd});const z=DZ();z.d.c++;z.chp=null;dzTouch();save();return Lg('+3 ❤ в следующем бою','+3 ❤ next battle');}

/* ---------- плитка-сцена в деревне ---------- */
function dzVIL(el){try{if(!el||!S.wins)return;dzCss();const open=mgIzbaOpen(),D=open?dzDayState():null,hot=open&&dzHot();
  const d=document.createElement('div');d.className='card dzTile'+(open?'':' lock');d.id='dzTile';
  d.innerHTML='<canvas></canvas>'+(hot?'<i class="dzDot"></i>':'')+'<div class="dzTl"><b>'+Lg('Дозорная изба','Watch Hut')+'</b><span>'+(open?(D.n?(D.played?Lg('Дело дня сыграно ✓ · загляни завтра','Deed of the day done ✓ · come back tomorrow'):Lg('Дело дня: ','Deed of the day: ')+mgNameN(D.n)):Lg('Мини-игры дозора','Watch mini-games')):Lg('Откроется после уровня 1-3','Opens after level 1-3'))+'</span>'+
    (open?'<button class="btn gold">'+Lg('Войти','Enter')+'</button>':'')+'</div>';
  const cvv=el.querySelector('#vilCv');if(cvv&&cvv.nextSibling)el.insertBefore(d,cvv.nextSibling);else el.appendChild(d);
  const cv=d.querySelector('canvas'),W=d.clientWidth||cvv&&cvv.clientWidth||340,H=Math.round(Math.max(130,Math.min(170,W*.36)));dzCv(cv,W,H);cv.style.width='100%';dzScene(cv,{tile:1,still:1,t:0});
  if(open)d.onclick=()=>{try{SND.click();}catch(e){}MG_IZBA();};}catch(e){console.warn('dz vil',e);}}
/* «Сегодня» на карте: фишка, когда в избе что-то ждёт */
function dzTODAY(a){try{if(!mgIzbaOpen()||!dzHot())return;const D=dzDayState();a.push({id:'dzr',hot:1,t:Lg('🔔 ','🔔 ')+(D.n&&!D.played?mgNameN(D.n):Lg('Дозорная изба','Watch Hut')),fn:MG_IZBA});}catch(e){}}
/* сундук дня (meta-ret CHEST): «Дело дня» сыграно — +1 трофей в сундук (4-е, необязательное задание) */
function dzCHEST(o){try{const D=dzDayState();if(!D.n||!D.played||!o)return;const q=mgTrf(1);if(q&&Array.isArray(o.txt))o.txt.push('<img src="'+ic(trfIc(q.id),40)+'" width="20" height="20" style="vertical-align:middle" alt=""> +1 '+Lg('за «Дело дня»','for the Deed of the day'));}catch(e){}}
if(typeof META_MODS!=='undefined')META_MODS.push({id:'dzrui',VIL:dzVIL,TODAY:dzTODAY,CHEST:dzCHEST});

/* ---------- 4-е задание дня: строка «Дело дня» в карточке заданий (необязательное, серию не рвёт) ---------- */
{const rq0=typeof renderQuests==='function'?renderQuests:null;if(rq0)renderQuests=function(){rq0.apply(this,arguments);try{const box=$('dqBox');if(!box||!S.wins||!mgIzbaOpen())return;const D=dzDayState();if(!D.n)return;
  const card=box.querySelector('.card');if(!card)return;const r=document.createElement('div');r.className='qrow';
  r.innerHTML='<img src="'+mgIc(D.n,72)+'" style="width:36px;height:36px;flex:none" alt=""><div class="t"><b>'+Lg('Дело дня: ','Deed of the day: ')+mgNameN(D.n)+'</b><span>'+Lg('по желанию · +1 трофей в сундук дня','optional · +1 trophy in the daily chest')+'</span></div>'+
    (D.played?'<span class="tag ok">✓</span>':'<button class="btn gold" id="dqDz">'+Lg('Играть','Play')+'</button>');
  const at=card.querySelector('.note');if(at)card.insertBefore(r,at);else card.appendChild(r);on('dqDz',()=>{dzPlay(D.n,'day',{},{});});}catch(e){console.warn('dz quests',e);}};}

/* ---------- красная точка на «Деревне» ---------- */
{const sp0=typeof setPills==='function'?setPills:null;if(sp0)setPills=function(){sp0.apply(this,arguments);try{const cur=typeof G!=='undefined'&&G?'':curTab;if(cur!=='Village'&&dzHot())$('navV').classList.add('dot');}catch(e){}};}

/* ---------- окно поражения: «Залатать частокол» (одна кнопка; ролик «Позвать плотников» — внутри неё) ---------- */
{const be0=typeof onBattleEnd==='function'?onBattleEnd:null;if(be0)onBattleEnd=function(win){const g0=typeof G!=='undefined'&&G,camp=mgCampaign(g0),c=g0&&g0.ci,l=g0&&g0.li,lk=g0&&g0.leaks|0,cu=g0&&g0.contUsed;
  const r=be0.apply(this,arguments);if(win)dzUnlockStat();try{if(!camp||c==null)return r;const z=DZ();
    if(!win)z.chp={c,l,k:dayKey()};
    if(win||cu||!mgAvail(2)||z.d.c>=MG_RW.chMax)return r;
    const bx=document.querySelector('#mBody .btns.stick')||document.querySelector('#mBody .btns');if(!bx||$('rChast'))return r;
    const b=document.createElement('button');b.className='btn ghost';b.id='rChast';b.style.whiteSpace='normal';b.innerHTML='<img src="'+ic('mg_i2',48)+'" style="width:26px;height:26px" alt=""> '+Lg('Залатать частокол (+2 ❤)','Patch the palisade (+2 ❤)');
    const mp=$('rMap');if(mp&&mp.parentNode===bx)bx.insertBefore(b,mp);else bx.appendChild(b);if(typeof fitModal==='function')fitModal();
    const go=()=>{hideModal();dzPlay(2,'sit',{c,l},{battle:{c,l}});};
    b.onclick=()=>{try{SND.click();}catch(e){}if(!adOk()){go();return;}
      const w=document.createElement('div');w.className='btns h';w.style.marginTop='0';w.innerHTML='<button class="btn" style="white-space:normal" id="rChG">'+Lg('🪵 Залатать самому','🪵 Patch it myself')+'</button><button class="btn ad" style="white-space:normal" id="rChA">'+Lg('🎬 Плотники за рекламу: +3 ❤','🎬 Carpenters for an ad: +3 ❤')+'</button>';
      b.replaceWith(w);if(typeof fitModal==='function')fitModal();on('rChG',go);
      adOn('rChA','mg_carp',()=>showRewarded(()=>{const z2=DZ();mgBufAdd({h:MG_RW.livesAd});z2.d.c++;z2.chp=null;dzTouch();save();try{SND.build();STAT.ev('mg',{a:'carp'});}catch(e){}
        w.innerHTML='<p class="sub" style="margin:4px">'+Lg('Плотники залатали частокол: +3 ❤ в следующем бою!','The carpenters patched the palisade: +3 ❤ next battle!')+'</p>';},null,dzLateCarp));};}catch(e){console.warn('dz lose',e);}return r;};}

/* ---------- окно перед боем: «Дозор приготовил…» и Разведка перед Логовом ---------- */
{const oi0=typeof openIntro==='function'?openIntro:null;if(oi0)openIntro=function(c,l){const r=oi0.apply(this,arguments);try{const bx=document.querySelector('#mBody .btns.stick');if(!bx)return r;
  const b=mgBuf();if(b){const d=document.createElement('div');d.className='goal';d.setAttribute('data-fit','4');d.innerHTML='<img src="'+ic('mg_i1',48)+'" style="width:24px;height:24px;vertical-align:middle" alt=""> '+Lg('Дозор приготовил на этот бой: <b>','The watch prepared for this battle: <b>')+mgBufTxt(b)+'</b>';bx.parentNode.insertBefore(d,bx);}
  if(l===6&&DZ().lr[c]&&MG.by.razv&&MG.by.razv.waves){try{const ws=MG.by.razv.waves(c);if(ws&&ws.length){const d=document.createElement('div');d.className='goal';d.id='dzWaves';d.setAttribute('data-fit','4');   // OB:FINAL Разведка → состав волн Логова
    d.innerHTML='<b>'+Lg('Разведано: ','Scouted: ')+'</b>'+ws.map((w,i)=>'<span style="white-space:nowrap;display:inline-flex;align-items:center;gap:1px;margin-right:6px">'+(i+1)+':'+w.slice(0,3).map(e=>'<img src="'+ic(e.art,40)+'" style="width:20px;height:20px'+(e.lead||e.boss?';filter:drop-shadow(0 0 2px #e8433a)':'')+'" alt="">'+(e.n>1?'×'+e.n:'')).join('')+'</span>').join('');bx.parentNode.insertBefore(d,bx);}}catch(e){console.warn('dz waves',e);}}
  if(l===6&&mgAvail(7)&&!DZ().lr[c]&&!S.stars[c+'-6']){const sb=document.createElement('button');sb.className='btn gold';sb.id='goRazv';sb.style.whiteSpace='normal';sb.innerHTML='<img src="'+ic('mg_i7',48)+'" style="width:26px;height:26px" alt=""> '+Lg('Разведка тропы (+2 трофея)','Scout the trail (+2 trophies)');
    const gb=$('goBtn');if(gb&&gb.nextSibling)bx.insertBefore(sb,gb.nextSibling);else bx.appendChild(sb);sb.onclick=()=>{hideModal();dzPlay(7,'sit',{lair:c},{onQuit:()=>openIntro(c,l),back:()=>openIntro(c,l)});};}
  if(typeof fitModal==='function')fitModal();}catch(e){console.warn('dz intro',e);}return r;};}
/* после разведки — снова окно Логова */
{const fu0=MG_FIN_UI;MG_FIN_UI=function(g,o,r,opt){fu0(g,o,r,opt);if(g.num===7&&opt&&opt.back){const v=$('mgHost');if(!v)return;for(const x of v.querySelectorAll('[data-k=ok]'))x.onclick=()=>{try{SND.click();}catch(e){}MG_CLOSE();opt.back();};}};}
