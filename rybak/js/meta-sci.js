/* МЕТА: «НАУКА ПЕТРОВИЧА» (поток META, 08.10.2026) — бывший «разряд рыболова» (главы теперь открываются за монеты, решение владельца 08.10).
   Очки науки считаются из сохранения (ничего не копим отдельно — облако сходится само): виды в альбоме, легенды, места, трофеи, звёзды мастерства,
   кубки турнира недели, золото лиги, медали Карты России, каждые 10 пойманных рыб. Звания — без потолка (после «Деда-легенды» — II, III, …).
   За каждое новое звание — 1 очко навыка (пока навыки не прокачаны целиком) и монеты (кнопка «Забрать» в окне Науки — вне рыбалки).
   Навыки (по 5 ступеней, малые %; вываживание НЕ трогаем — натяжение, обрыв, слабина как были):
     feel «Чутьё на поклёвку» — окно подсечки +3\u00a0% за ступень (обёртка hookWin);
     far  «Дальний заброс»    — дальность заброса +2 % за ступень (обёртка a2DK);
     pit  «Знаю ямы»          — поклёвки ждать на 4\u00a0% меньше за ступень (обёртка a2WaitK; забросов по-прежнему 5 — улов не растёт, только время);
     luck «Удача на находки»  — чаще «находка на берегу» после рыбалки и подарки кота Васьки (META.sci.luck()).
   В турнире недели, «Рыбалке дня» и у ботов (лига, проверки) навыки НЕ действуют — честно.
   Сохранение: S.sciSk {feel,far,pit,luck: ступень}, S.sciR — сколько званий уже «забрано» (награда выдана). */
(function(){
'use strict';
var M=META;
var SK=[
 {id:'feel',ic:'feel',n:'Чутьё на поклёвку',en:'Bite sense',d:'окно подсечки +3\u00a0% за ступень',de:'strike window +3% per level',k:.03},
 {id:'far', ic:'far', n:'Дальний заброс',en:'Long cast',d:'заброс дальше на 2\u00a0% за ступень — легенды любят дальний',de:'cast 2% further per level',k:.02},
 {id:'pit', ic:'pit', n:'Знаю ямы',en:'I know the pits',d:'поклёвку ждать на 4\u00a0% меньше за ступень',de:'4% shorter wait per level',k:.04},
 {id:'luck',ic:'luck',n:'Удача на находки',en:'Finder\'s luck',d:'чаще находки на берегу и подарки Васьки',de:'more shore finds and gifts from Vaska',k:.04}];
var SK_MAX=5;
// звания: [очков, рус, англ]; после последнего — «Дед-легенда II, III…» каждые RANK_STEP очков
var RANKS_S=[[0,'Новичок с удочкой','Rookie'],[50,'Рыболов-любитель','Hobby angler'],[120,'Третий разряд','3rd class'],[220,'Второй разряд','2nd class'],[350,'Первый разряд','1st class'],
  [520,'Кандидат в мастера','Candidate master'],[750,'Мастер спорта','Master of sport'],[1050,'Мастер международного класса','International master'],[1400,'Заслуженный мастер','Honoured master'],
  [1800,'Знаток всех водоёмов','Knower of all waters'],[2300,'Дед-легенда','Living legend']],RANK_STEP=600;
var ROMAN=['','','II','III','IV','V','VI','VII','VIII','IX','X'];
function roman(n){if(n<ROMAN.length)return ROMAN[n];var r='',v=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];for(var i=0;i<v.length;i++)while(n>=v[i][0]){r+=v[i][1];n-=v[i][0];}return r;}

/* ---------- очки ---------- */
function parts(){var a=S.alb||{},sp=0,tr=0,st=0,lg=0,pc=0,cu=0;
  for(var id in a){if(!a[id])continue;if(FISH[id]){sp++;if(a[id].tr)tr++;}try{st+=mastOf(a[id].n||0);}catch(e){}}
  lg=Object.keys(S.legs||{}).length;for(var i=0;i<PLACES.length;i++)if(S.visit&&S.visit[i])pc++;
  for(var w in S.cups||{}){var k=(+S.cups[w])%10;cu+=[0,2,10,20,35][k]||0;}
  var mp=0;try{mp=Object.keys(S.mapM||{}).length;}catch(e){}
  return [{k:'sp',n:L('Виды в альбоме','Species'),c:sp,p:sp*10},{k:'lg',n:L('Легенды','Legends'),c:lg,p:lg*40},{k:'pl',n:L('Места','Places'),c:pc,p:pc*25},
    {k:'tr',n:L('Трофеи','Trophies'),c:tr,p:tr*5},{k:'st',n:L('Звёзды мастерства','Mastery stars'),c:st,p:st*5},{k:'cu',n:L('Кубки турнира','Contest cups'),c:Object.keys(S.cups||{}).length,p:cu},
    {k:'lgg',n:L('Золото лиги','League gold'),c:S.lgG||0,p:(S.lgG||0)*30},{k:'mp',n:L('Медали Карты России','Russia map medals'),c:mp,p:mp*30},
    {k:'n',n:L('Каждые 10 рыб','Every 10 fish'),c:Math.floor((S.caught||0)/10),p:Math.floor((S.caught||0)/10)}];}
function points(){var s=0,p=parts();for(var i=0;i<p.length;i++)s+=p[i].p;return s;}
// звание по очкам: {i (номер, без потолка), n, en, at (очков на начало), nx (очков до следующего)}
function rankAt(pt){var last=RANKS_S.length-1;
  if(pt<RANKS_S[last][0]){var i=0;for(var k=0;k<RANKS_S.length;k++)if(pt>=RANKS_S[k][0])i=k;return {i:i,n:RANKS_S[i][1],en:RANKS_S[i][2],at:RANKS_S[i][0],nx:RANKS_S[i+1][0]};}
  var x=Math.floor((pt-RANKS_S[last][0])/RANK_STEP),at=RANKS_S[last][0]+x*RANK_STEP;
  return {i:last+x,n:RANKS_S[last][1]+(x?' '+roman(x+1):''),en:RANKS_S[last][2]+(x?' '+roman(x+1):''),at:at,nx:at+RANK_STEP};}
function lv(id){var v=S.sciSk&&S.sciSk[id];return Math.max(0,Math.min(SK_MAX,Math.floor(v||0)));}
function spent(){var s=0;for(var i=0;i<SK.length;i++)s+=lv(SK[i].id);return s;}
function skPts(r){return Math.min(SK.length*SK_MAX,r.i);}
function free(r){return Math.max(0,skPts(r||rankAt(points()))-spent());}
function rankC(i){return M.r5(M.tripC()*.3);} // темп: сверено tools/econ.js (META вместе с мини-играми — Камчатка ±1–2 дня)

/* ---------- сохранение ---------- */
M.fix(function(){M.fObj('sciSk');for(var k in S.sciSk)if(!SK.some(function(s){return s.id===k;}))delete S.sciSk[k];else S.sciSk[k]=Math.max(0,Math.min(SK_MAX,Math.floor(S.sciSk[k])));
  // первый запуск с Наукой: звания, заработанные раньше, — без награды монетами (не сыпем старым игрокам разом), очки навыков — да
  if(typeof S.sciR!=='number'||!isFinite(S.sciR))S.sciR=rankAt(points()).i;M.fNum('sciR');});
M.merge(function(loc,d){M.mObj(loc,d,'sciSk');M.mMax(loc,d,'sciR');
  // ступеней не больше, чем очков (на двух устройствах могли вложить по-разному)
  var r=rankAt(points()),cap=skPts(r);while(spent()>cap){var mx=null;for(var i=0;i<SK.length;i++)if(!mx||lv(SK[i].id)>lv(mx.id))mx=SK[i];S.sciSk[mx.id]--;}});

/* ---------- действие навыков (только своя рыбалка; турнир, рыбалка дня и боты — без них) ---------- */
function on(){return !!(G&&!G.over&&!G.tourn&&!M.botting);}
function eff(id){return on()?lv(id):0;}
var hw0=hookWin;hookWin=function(f,c,o){var v=hw0(f,c,o);var l=eff('feel');return l?v*(1+.03*l):v;};
var dk0=a2DK;a2DK=function(){var v=dk0();var l=eff('far');return l?v*(1+.02*l):v;};
var wk0=a2WaitK;a2WaitK=function(){var v=wk0();var l=eff('pit');return l?v*(1-.04*l):v;};
function luck(){return lv('luck');}

/* ---------- окно ---------- */
function pips(n){var h='';for(var i=0;i<SK_MAX;i++)h+='<i class="'+(i<n?'on':'')+'"></i>';return '<span class="scpip">'+h+'</span>';}
function openSci(back){var pt=points(),r=rankAt(pt),fr=free(r),due=r.i>(S.sciR||0),pc=Math.min(100,Math.round((pt-r.at)/Math.max(1,r.nx-r.at)*100));
  M.stat('sci','open',{r:r.i,p:pt});
  var sk=SK.map(function(s){var l=lv(s.id),can=fr>0&&l<SK_MAX;return '<div class="scsk'+(l?' got':'')+'"><span class="scic">'+M.MI(s.ic)+'</span><span class="scx"><b>'+L(s.n,s.en)+'</b><small>'+L(s.d,s.de)+'</small>'+pips(l)+'</span>'+
    (can?'<button class="btn green scup noenter" data-sk="'+s.id+'">+1</button>':l>=SK_MAX?'<span class="scmax">✓</span>':'')+'</div>';}).join('');
  var pr=parts().filter(function(x){return x.c>0;}).map(function(x){return '<div class="scpt"><span>'+x.n+(x.k!=='n'?' · '+x.c:'')+'</span><b>+'+x.p+'</b></div>';}).join('');
  M.win('<div class="scscene" id="scScene"></div>'+M.head('sci',L('Наука Петровича','Petrovich\'s science'),L('звания без потолка','ranks never end'))+
    '<div class="scrank"><small>'+L('Звание','Rank')+'</small><b>'+esc(L(r.n,r.en))+'</b><span class="gbar g"><i style="width:'+pc+'%"></i></span><small>'+pt+' / '+r.nx+' '+L('очков науки — до следующего звания','science points to the next rank')+'</small></div>'+
    (due?'<button class="btn accent noenter scclaim" id="scClaim">'+M.MI('sci')+' '+L('Новое звание! Забрать','New rank! Take')+' +'+coinsTxt(rankC(r.i))+'</button>':'')+
    '<h3 class="scsec">'+L('Навыки','Skills')+(fr?' · <span class="scfree">'+L('свободно очков: ','free points: ')+fr+'</span>':'')+'</h3>'+sk+
    '<p class="about">'+L('Очко навыка — за каждое новое звание. Навыки помогают немного и только в своей рыбалке: в турнире недели все равны.','A skill point for every new rank. Skills help a little and only on your own trips: everyone is equal in contests.')+'</p>'+
    '<h3 class="scsec">'+L('Откуда очки','Where points come from')+'</h3><div class="scpts">'+pr+'</div>'+
    '<div class="row"><button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div>');
  try{drawScene($('scScene'),r);}catch(e){}
  $('mcard').querySelectorAll('[data-sk]').forEach(function(b){b.onclick=function(){var id=b.dataset.sk,rr=rankAt(points());if(free(rr)<=0||lv(id)>=SK_MAX)return;
    S.sciSk[id]=lv(id)+1;save();M.stat('sci','sk',{k:id,l:S.sciSk[id]});try{SND.buy();}catch(e){}openSci(back);};});
  if($('scClaim'))$('scClaim').onclick=function(){var rr=rankAt(points());if(rr.i<=(S.sciR||0))return;var c=0;for(var i=(S.sciR||0)+1;i<=rr.i;i++)c+=rankC(i);
    S.sciR=rr.i;S.coins+=ern('quest',c);save();updCoins();M.stat('sci','rank',{r:rr.i,c:c});try{SND.trophy();FX.burst(.5,.3,30,'coin');}catch(e){}toast('+'+coinsTxt(c));openSci(back);};
  $('mCancel').onclick=back||hideModal;}
// сцена: стол Петровича — тетрадь «Наука», лампа, часть карты; на развороте — звание и лента
function drawScene(el,r){if(!el)return;var o=M.canv(el,128),g=o.g,W=o.W,H=o.H;
  var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#3a2a1c');bg.addColorStop(1,'#1e140c');g.fillStyle=bg;g.fillRect(0,0,W,H);
  for(var i=0;i<7;i++){g.strokeStyle='rgba(255,220,170,'+(.04+.02*(i%2))+')';g.lineWidth=1;g.beginPath();g.moveTo(0,10+i*18);g.bezierCurveTo(W*.3,6+i*18,W*.7,16+i*18,W,10+i*18);g.stroke();} // волокна стола
  var lg=g.createRadialGradient(W*.82,H*.15,4,W*.82,H*.15,W*.5);lg.addColorStop(0,'rgba(255,214,140,.55)');lg.addColorStop(1,'rgba(255,214,140,0)');g.fillStyle=lg;g.fillRect(0,0,W,H);
  // тетрадь
  var bx=W*.5-132,by=16,bw=264,bh=H-26;g.save();g.translate(W*.5,H*.5);g.rotate(-.025);g.translate(-W*.5,-H*.5);
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(bx+5,by+6,bw,bh);g.fillStyle='#f4ead2';g.fillRect(bx,by,bw,bh);
  g.strokeStyle='rgba(80,110,160,.35)';for(var y=by+20;y<by+bh;y+=13){g.beginPath();g.moveTo(bx+8,y);g.lineTo(bx+bw-8,y);g.stroke();}
  g.strokeStyle='rgba(200,80,80,.5)';g.beginPath();g.moveTo(bx+26,by);g.lineTo(bx+26,by+bh);g.stroke();
  g.fillStyle='#b8402e';g.fillRect(bx+bw/2-2,by,4,bh);
  var ff=getComputedStyle(document.body).fontFamily||'sans-serif';g.fillStyle='#3a2a1a';g.textAlign='center';g.font='600 13px '+ff;g.fillText(L('НАУКА ПЕТРОВИЧА','PETROVICH\'S SCIENCE'),bx+bw*.25+10,by+22);
  g.font='italic 12px Georgia,serif';g.fillStyle='#2a3a6a';var lines=L('лещ держится у дна|щука — утро и вечер|налим — ночь и холод','bream keeps to the bottom|pike — dawn and dusk|burbot — night and cold').split('|');
  for(var j=0;j<lines.length;j++)g.fillText(lines[j],bx+bw*.25+10,by+46+j*14);
  // рыбка-рисунок на правой странице
  try{drawFish(g,FISH.lesh.lk,bx+bw*.75,by+40,74);}catch(e){}
  g.fillStyle='#3a2a1a';g.font='600 12px '+ff;g.fillText(L('звание №','rank #')+(r.i+1),bx+bw*.75,by+bh-14);g.restore();
  // лента со званием
  var t=L(r.n,r.en);g.font='700 17px '+ff;var tw=Math.min(W-30,g.measureText(t).width+44),tx=W/2-tw/2,ty=H-34;
  g.fillStyle='#8a1f1f';g.beginPath();g.moveTo(tx-12,ty+4);g.lineTo(tx,ty+4);g.lineTo(tx,ty+26);g.lineTo(tx-12,ty+26);g.lineTo(tx-5,ty+15);g.fill();
  g.beginPath();g.moveTo(tx+tw+12,ty+4);g.lineTo(tx+tw,ty+4);g.lineTo(tx+tw,ty+26);g.lineTo(tx+tw+12,ty+26);g.lineTo(tx+tw+5,ty+15);g.fill();
  var rg=g.createLinearGradient(0,ty,0,ty+30);rg.addColorStop(0,'#e0483a');rg.addColorStop(1,'#a52a22');g.fillStyle=rg;g.fillRect(tx,ty,tw,28);
  g.fillStyle='#fff';g.textAlign='center';g.fillText(t,W/2,ty+20,tw-16);}

/* ---------- окно звания игры: вход в Науку ---------- */
var or0=openRank;openRank=function(){or0.apply(this,arguments);try{var mc=$('mcard'),r=rankAt(points()),b=document.createElement('button');b.className='mtslot scin noenter';
  b.innerHTML=M.MI('sci','mtico scbig')+'<span class="mtst"><b>'+L('Наука Петровича','Petrovich\'s science')+'</b><small>'+esc(L(r.n,r.en))+(free(r)?' · '+L('свободно очков: ','free points: ')+free(r):'')+'</small></span>'+(window.LOOK?LOOK.I('fwd'):'›');
  var h2=mc.querySelector('h2');if(h2&&h2.nextSibling)mc.insertBefore(b,h2.nextSibling);else mc.appendChild(b);b.onclick=function(){openSci(openRank);};}catch(e){}};

/* ---------- гнездо главного экрана ---------- */
M.tile({id:'sci',pri:30,when:function(){return (S.sessions||0)>=3;},ic:function(){return M.MI('sci');},t:function(){return L('Наука','Science');},
  sub:function(){var r=rankAt(points()),fr=free(r);return r.i>(S.sciR||0)?L('новое звание!','new rank!'):fr?L('очков: ','points: ')+fr:esc(L(r.n,r.en));},
  hot:function(){var r=rankAt(points());return r.i>(S.sciR||0)||free(r)>0;},go:function(){openSci();}});

M.sci={open:openSci,points:points,rank:rankAt,lv:lv,luck:luck,parts:parts,SK:SK};
M.mapRefresh();
})();
