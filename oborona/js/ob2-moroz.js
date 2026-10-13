'use strict';
/* ================= ob2:MOROZ — «Морозко на заставе» (15.12–14.01) и «Застава богатырей» (21–23.02) (буст_в2.0, поток MOROZ, 12.10.2026) =================
   Журнал — hobby-analytics/release-i/oborona-boost2/logs/MOROZ.md, план — 03-events.md §3.7, §4.
   Грузится по требованию (заглушка в index.html под <!-- ob2:MOROZ -->): только в праздничные даты или если у игрока уже есть облик «Снежный»/«Богатырский».
   Даты — по Москве через FEST.today() (проверка: ?date=2026-12-31 или ?festday=… на localhost). Флаг moroz: ?off=moroz → как v3.1.
   Что есть:
   - Календарь Морозко (адвент): окошки 1–17 — 15–31.12 (31.12 — большой подарок: облик «Зимний» + золото), 18-е — Старый Новый год 13–14.01.
     Пропущенные окошки можно открыть позже, пока идёт праздник.
   - «Обоз Деда Мороза» — праздничная связка из 5 наказов → облик «Снежный» (snow) на все заставы. API для потока наказов: MZ.bundle().
   - Ёлка-застава: в бою кампании одна на бой, даром, на любое пустое место (кольцо выбора). Замедляет нечисть рядом, гирлянда-молния бьёт через соседние заставы.
     В TW/TW_ORDER не входит (кузница, облики, бот — как были). После праздника пропадает сама.
   - Карачун — Босс недели в неделю с 28.12 (обёртка weekCh только на эту неделю). Снег в бою (не в «лёгкой графике»).
   - Каникулы (25.12–10.01): награда «Заставы дня» ×2. Старый Новый год: последнее окошко и честное «последний шанс» для обоза.
   - «Застава богатырей» 21–23.02: Слава ×3, облик «Богатырский» (bogat) за 3 победы.
   Сохранение S.o2m (≤1,5 КБ): a{'26-1':1…} — открытые окошки (ключ — сезон-окошко), c{'26w':побед,'26k':нечисти,'26e':ёлок,'26b':вожаков,'26sd':'день окна входа','26kd':'день ×2',
   '27bw':побед в праздник богатырей}. Слияние облака — «максимум» каркаса (числа — max, даты-строки — бо́льшая, ключи — объединение). Облики — в S.skins (как у всех).
   API: window.MZ — day(), ny(), kan(), sng(), bog(), open(), bundle(), advRow() (для Летописи LET), advLeft().
   Старые WebView: без ?. ?? .at( :has( structuredClone. */
(function(){
if(typeof OB2==='undefined'||OB2.off('moroz'))return;
var ID='moroz',ELKA_R=82,ELKA_CD=2.2;
function M(){var o=S.o2m;if(!o||typeof o!=='object'||Array.isArray(o))o=S.o2m={};if(!o.a||typeof o.a!=='object')o.a={};if(!o.c||typeof o.c!=='object')o.c={};return o;}
function day(){try{return FEST.today();}catch(e){return dayKey();}}
function md(){return day().slice(5);}
function yr(){return +day().slice(0,4);}
function ny(){var d=md();return d>='12-15'||d<='01-14';}
function kan(){var d=md();return d>='12-25'||d<='01-10';}
function sng(){var d=md();return d==='01-13'||d==='01-14';}
function bog(){var d=md();return d>='02-21'&&d<='02-23';}
function sea(){var y=yr();return String((md()>='07-01'?y:y-1)%100);}       // сезон Морозко: год декабря ('26')
function bsea(){return String(yr()%100);}                                  // сезон богатырей: год февраля ('27')
function cnt(k){return M().c[sea()+k]|0;}
function inc(k,n){var o=M(),kk=sea()+k;o.c[kk]=(o.c[kk]|0)+(n||1);}
function dms(s){var p=s.split('-');return Date.UTC(+p[0],+p[1]-1,+p[2]);}
function left(){var d=day(),y=+d.slice(0,4),end=(md()>='07-01'?y+1:y)+'-01-14';return Math.max(1,Math.round((dms(end)-dms(d))/864e5)+1);}
function nyName(){return Lg('Морозко на заставе','Morozko at the Outpost');}
function ev(o){try{OB2.emit('moroz',o);}catch(e){}}   // для миссий VK (договор VKT)
function stat(a,x){try{var p={a:a};if(x)for(var k in x)p[k]=x[k];STAT.ev('mz',p);}catch(e){}}

/* ---------- календарь Морозко (адвент) ---------- */
// 1–17: 15–31.12; 18: Старый Новый год (13–14.01). Награды: g — золото ×dchGold, bo — ⏩ секунды, tr — трофеи, sl — Слава, sk — облик
var ADV=[null,{g:1},{bo:300},{tr:3},{sl:60},{g:1},{bo:600},{tr:4},{g:1.5},{sl:80},{bo:600},{tr:5},{g:1.5},{sl:100},{bo:900},{tr:6},{g:2},
  {g:3,sk:'winter',bo:900},{g:2,bo:900,tr:6}];
var ADV_N=18;
function advDate(n){var y=+sea()+2000;return n<=17?y+'-12-'+String(14+n):(y+1)+'-01-13';}
function advGot(n){return !!M().a[sea()+'-'+n];}
function advOpen(n){if(!ny())return false;var d=day();if(n===ADV_N)return sng();return d>=advDate(n);}
function advLeft(){var n=0;for(var i=1;i<=ADV_N;i++)if(advOpen(i)&&!advGot(i))n++;return n;}
function rwTxt(r){var a=[];if(r.sk&&!skinAllOwned(r.sk))a.push(Lg('облик «','look “')+skinName(r.sk)+Lg('»','”'));if(r.g)a.push('+'+fmtGold(Math.round(dchGold()*r.g)));
  if(r.bo)a.push('⏩ +'+fmtBoost(r.bo));if(r.tr&&typeof TRF_PICK==='function')a.push(trfName(TRF_PICK(r.tr))+' ×'+r.tr);if(r.sl&&typeof SLAVA_ADD==='function')a.push('⭐ +'+r.sl+Lg(' Славы',' Fame'));return a.join(' · ');}
function skinAllOwned(id){for(var i=0;i<TW_ORDER.length;i++)if(!(S.skins&&S.skins[TW_ORDER[i]+'.'+id]))return false;return true;}
function giveSkin(id,wear){var nw=!skinAllOwned(id);if(!S.skins)S.skins={};for(var i=0;i<TW_ORDER.length;i++)S.skins[TW_ORDER[i]+'.'+id]=1;
  if(wear)for(var j=0;j<TW_ORDER.length;j++)S.skin[TW_ORDER[j]]=id;return nw;}
function advTake(n){if(!advOpen(n)||advGot(n))return '';var r=ADV[n],t=rwTxt(r),g=r.g?Math.round(dchGold()*r.g):0;
  if(r.sk&&skinAllOwned(r.sk))g+=dchGold();            // облик уже есть — вместо него золото
  else if(r.sk)giveSkin(r.sk,false);
  if(g){S.gold+=g;ern('chest',g);}if(r.bo)boostAdd(r.bo);if(r.tr&&typeof TRF_ADD==='function')TRF_ADD(TRF_PICK(r.tr),r.tr);if(r.sl&&typeof SLAVA_ADD==='function')SLAVA_ADD(r.sl,'mz');
  M().a[sea()+'-'+n]=1;inc('ad');save();stat('adv',{n:n});ev({a:'adv',n:cnt('ad')});obozCheck();return t;}

/* ---------- «Обоз Деда Мороза» — праздничная связка из 5 наказов → облик «Снежный» ---------- */
var OBOZ=[{k:'w',n:3,t:['Привези дров: выиграй 3 боя','Bring firewood: win 3 battles']},
  {k:'k',n:300,t:['Расчисти дорогу: одолей 300 нечисти','Clear the road: defeat 300 monsters']},
  {k:'e',n:2,t:['Наряди ёлку: поставь ёлку-заставу в 2 боях','Dress the tree: place the Fir-tree outpost in 2 battles']},
  {k:'b',n:3,t:['Прогони смутьянов: одолей 3 вожаков или боссов','Chase off the troublemakers: defeat 3 leaders or bosses']},
  {k:'ad',n:5,t:['Загляни в календарь: открой 5 окошек','Peek into the calendar: open 5 windows']}];
function obozDone(){return S.skins&&S.skins['arch.snow']&&skinAllOwned('snow');}
function obozCur(){for(var i=0;i<OBOZ.length;i++)if(cnt(OBOZ[i].k)<OBOZ[i].n)return i;return OBOZ.length;}
function obozCheck(){if(!ny()||obozDone()||obozCur()<OBOZ.length)return '';giveSkin('snow',true);save();stat('skin',{k:'snow'});ev({a:'look'});
  var s=Lg('❄ Обоз Деда Мороза собран! Облик «Снежный» — твой, надет на все заставы.','❄ Father Frost’s caravan is complete! The “Snowy” look is yours — on all outposts.');setTimeout(function(){toast(s);},900);return s;}
// для потока наказов (NAKAZ): праздничная связка — как обычная связка героя
function bundle(){if(!ny())return null;var c=obozCur(),st=[];for(var i=0;i<OBOZ.length;i++)st.push({t:Lg(OBOZ[i].t[0],OBOZ[i].t[1]),n:Math.min(OBOZ[i].n,cnt(OBOZ[i].k)),need:OBOZ[i].n});
  return {id:'moroz',hero:Lg('Дед Мороз','Father Frost'),t:Lg('Дед Мороз собирает обоз','Father Frost gathers a caravan'),rw:Lg('облик «Снежный»','the “Snowy” look'),steps:st,cur:c,done:!!obozDone(),last:sng(),fn:open};}

/* ---------- облики «Снежный» и «Богатырский» (поверх силуэта, как skinCanvas в art.js) ---------- */
if(!SKINS.some(function(k){return k.id==='snow';}))SKINS.push({id:'snow',n:Lg('Снежный','Snowy'),about:Lg('иней и ёлочные огоньки','hoarfrost and fir-tree lights'),cost:0,get:'moroz',fest:'ny27'},{id:'bogat',n:Lg('Богатырский','Bogatyr'),about:Lg('червлёные щиты и золотые шеломы','crimson shields and golden helmets'),cost:0,get:'bog',fest:'bog27'});
try{langReg(SKINS,{snow:{n:'Snowy',about:'hoarfrost and fir-tree lights'},bogat:{n:'Bogatyr',about:'red shields and golden helmets'}});}catch(e){}
(function(){var h0=skinHow;skinHow=function(k){if(k&&k.get==='moroz')return Lg('праздник «Морозко»: собери обоз Деда Мороза','Morozko holiday: gather Father Frost’s caravan');
  if(k&&k.get==='bog')return Lg('праздник «Застава богатырей»: 3 победы','“Bogatyr Outpost” holiday: 3 wins');return h0(k);};})();
(function(){var sk0=skinCanvas;skinCanvas=function(c,skin,k){if(skin!=='snow'&&skin!=='bogat')return sk0(c,skin,k);
  var W=c.width,H=c.height,g=c.getContext('2d'),d;try{d=g.getImageData(0,0,W,H).data;}catch(e){return c;}
  var up=Math.max(2,Math.round(k*2)),R=mulberry(W*31+skin.length*7),x0=W,x1=0,y0=H,y1=0,E=[],seen={},st=Math.max(1,Math.round(k*1.2)),x,y;
  for(y=up;y<H;y++)for(x=0;x<W;x++)if(d[(y*W+x)*4+3]>170){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
    if(d[((y-up)*W+x)*4+3]<40){var q=Math.floor(x/st)+':'+Math.floor(y/st);if(!seen[q]){seen[q]=1;E.push([x,y]);}}}
  if(!E.length)return c;g.save();g.setTransform(1,0,0,1,0,0);
  var t=mkCanvas(W,H),tg=t.getContext('2d');tg.drawImage(c,0,0);tg.globalAlpha=skin==='snow'?.42:.36;tg.globalCompositeOperation='color';tg.fillStyle=skin==='snow'?'#8ab8ff':'#c8302a';tg.fillRect(0,0,W,H);
  tg.globalAlpha=1;tg.globalCompositeOperation='destination-in';tg.drawImage(c,0,0);g.clearRect(0,0,W,H);g.drawImage(t,0,0);
  var i,p,r;
  if(skin==='snow'){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(235,245,255,.2)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    r=1.5*k;g.fillStyle='#b8cce8';for(i=0;i<E.length;i++){g.beginPath();g.arc(E[i][0],E[i][1]+.5*k,r,0,TAU);g.fill();}
    g.fillStyle='#ffffff';for(i=0;i<E.length;i++){g.beginPath();g.arc(E[i][0],E[i][1],r,0,TAU);g.fill();}
    var cols=['#ff4a4a','#ffd84a','#4ad8ff','#7aff6a','#ff8ad8'],F=E.filter(function(p,j){return j%3===1;});   // ёлочные огоньки по кромкам
    for(i=0;i<F.length;i++){p=F[i];var col=cols[i%cols.length],gr=g.createRadialGradient(p[0],p[1]+r*1.2,0,p[0],p[1]+r*1.2,r*1.9);gr.addColorStop(0,col);gr.addColorStop(1,col+'00');
      g.fillStyle=gr;g.beginPath();g.arc(p[0],p[1]+r*1.2,r*1.9,0,TAU);g.fill();g.fillStyle=col;g.beginPath();g.arc(p[0],p[1]+r*1.2,r*.62,0,TAU);g.fill();}
    g.fillStyle='rgba(255,255,255,.95)';for(i=0;i<6;i++){x=x0+R()*(x1-x0);y=y0+R()*(y1-y0)*.8;var s=(1+R()*.8)*k;g.fillRect(x-s,y-.25*k,s*2,.5*k);g.fillRect(x-.25*k,y-s,.5*k,s*2);}}
  else{g.globalCompositeOperation='source-atop';g.fillStyle='rgba(60,10,10,.12)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    var top=E.filter(function(p){return p[1]<y0+(y1-y0)*.35;});            // золотые шеломы-луковки на верхних кромках
    for(i=0;i<Math.min(3,top.length);i++){p=top[Math.floor(R()*top.length)];r=(1.8+R()*.6)*k;g.fillStyle='#e8b83a';g.beginPath();g.moveTo(p[0],p[1]-r*2.2);
      g.quadraticCurveTo(p[0]+r*1.3,p[1]-r*.9,p[0]+r,p[1]);g.lineTo(p[0]-r,p[1]);g.quadraticCurveTo(p[0]-r*1.3,p[1]-r*.9,p[0],p[1]-r*2.2);g.fill();
      g.fillStyle='rgba(255,250,200,.9)';g.beginPath();g.arc(p[0]-r*.35,p[1]-r*.9,r*.3,0,TAU);g.fill();}
    var mid=E.filter(function(p){return p[1]>y0+(y1-y0)*.35&&p[1]<y0+(y1-y0)*.8;});   // червлёные щиты-капли
    for(i=0;i<Math.min(2,mid.length);i++){p=mid[Math.floor(R()*mid.length)];r=2.2*k;g.fillStyle='#b8201a';g.strokeStyle='#e8b83a';g.lineWidth=.6*k;g.beginPath();
      g.moveTo(p[0]-r,p[1]);g.lineTo(p[0]+r,p[1]);g.quadraticCurveTo(p[0]+r,p[1]+r*1.4,p[0],p[1]+r*2.2);g.quadraticCurveTo(p[0]-r,p[1]+r*1.4,p[0]-r,p[1]);g.fill();g.stroke();
      g.fillStyle='#e8b83a';g.beginPath();g.arc(p[0],p[1]+r*.9,r*.35,0,TAU);g.fill();}}
  g.restore();return c;};})();
// облик уже надет до загрузки файла — спрайты и значки перерисовать
try{if(TW_ORDER.some(function(t){var k=S.skin&&S.skin[t];return k==='snow'||k==='bogat';})){buildSprites(SPR_K);for(var ik in ICONS)if(/~(snow|bogat)@/.test(ik))delete ICONS[ik];}}catch(e){}

/* ---------- ёлка-застава ---------- */
art('mz_elka',86,function(g){g.translate(0,-6);
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,30,20,7,0,0,TAU);g.fill();
  g.fillStyle='#6a4428';g.fillRect(-4,20,8,11);
  var L=[[-25,24,26,6],[-21,10,14,-8],[-16,-4,0,-22]],i;
  for(i=0;i<L.length;i++){var a=L[i],gr=g.createLinearGradient(a[0],0,-a[0],0);gr.addColorStop(0,'#1f6a34');gr.addColorStop(.5,'#2f9a4a');gr.addColorStop(1,'#1a5a2c');
    g.fillStyle=gr;g.strokeStyle='#123f20';g.lineWidth=1.6;g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo(0,a[1]+5,-a[0],a[1]);g.lineTo(0,a[3]-6);g.closePath();g.fill();g.stroke();
    g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.moveTo(a[0]+3,a[1]-1);g.quadraticCurveTo(0,a[1]+3,-a[0]-3,a[1]-1);g.quadraticCurveTo(0,a[1]+0.5,a[0]+3,a[1]-1);g.fill();}
  g.strokeStyle='#ffe27a';g.lineWidth=1.2;g.beginPath();g.moveTo(-20,15);g.quadraticCurveTo(0,22,17,8);g.moveTo(-14,1);g.quadraticCurveTo(2,8,12,-6);g.stroke();
  var B=[[-16,16,'#ff4a4a'],[-6,19,'#4ad8ff'],[6,16,'#ffd84a'],[14,10,'#ff8ad8'],[-9,3,'#ffd84a'],[3,5,'#ff4a4a'],[9,-3,'#4ad8ff'],[-3,-12,'#ff8ad8']];
  for(i=0;i<B.length;i++){g.fillStyle=B[i][2];g.beginPath();g.arc(B[i][0],B[i][1],2.6,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(B[i][0]-.8,B[i][1]-.8,.9,0,TAU);g.fill();}
  g.fillStyle='#ffd84a';g.strokeStyle='#b8801a';g.lineWidth=1;g.beginPath();for(i=0;i<10;i++){var an=-Math.PI/2+i*Math.PI/5,rr=i%2?3.4:8;g.lineTo(Math.cos(an)*rr,-30+Math.sin(an)*rr);}g.closePath();g.fill();g.stroke();});
function elkaOk(){return ny()&&G&&!G.endless&&!G.wk&&!G.rule&&!G.dly&&!G.tut&&G.ci!=null&&(S.wins|0)>=3&&!G.mzE;}
function elkaAt(i){return !!(G&&G.mzE&&G.mzE.i===i);}
function elkaDmg(){var h=HP_MUL[G.ci]||HP_MUL[HP_MUL.length-1];return 16*h*(G.dif==='h'?1.6:G.dif==='s'?1.3:1);}
function elkaPut(i){var s=G.map.spots[i];if(!s||G.tw[i]||!elkaOk())return false;G.mzE={i:i,x:s.x,y:s.y,cd:1,kills:0,dmgd:0,t:0};
  inc('e');save();ev({a:'tree'});SND.up();burst(s.x,s.y-20,'#ffe27a',24,120);stat('elka',{c:G.ci,l:G.li});obozCheck();
  try{sayAt(s.x,s.y-46,Lg('Ёлочка, гори!','Light up, fir tree!'));}catch(e){}return true;}
function elkaInfo(){return '<div class="ih"><img src="'+ic('mz_elka',112)+'" alt=""><div><b>'+Lg('Ёлка-застава','Fir-tree outpost')+'</b><span>'+
  Lg('Подарок Морозко — только в праздник. Одна на бой, даром.','A gift from Morozko — holidays only. One per battle, free.')+'</span></div></div>'+
  '<div class="it"><div><small>'+Lg('Замедл.','Slow')+'</small><b>30%</b></div><div><small>'+Lg('Гирлянда','Garland')+'</small><b>⚡×3</b></div><div><small>'+Lg('Дальн.','Range')+'</small><b>'+ELKA_R+'</b></div></div>'+
  '<p class="inote">'+Lg('❄ Нечисть рядом идёт на 30 % медленнее. ✨ Гирлянда-молния бьёт через соседние заставы.','❄ Monsters nearby walk 30% slower. ✨ The garland lightning strikes through neighbouring outposts.')+'</p>';}
(function(){var ri0=ringItems;ringItems=function(){var a=ri0.apply(this,arguments);try{if(G&&!G.tw[ringI]&&elkaOk()){
    a.push({id:'mz_elka',a:0,img:'mz_elka',price:Lg('даром','free'),no:false,nm:Lg('Ёлка','Fir tree')});var n=a.length;
    for(var k=0;k<n;k++)a[k].a=n<=3?-Math.PI/2+(k-(n-1)/2)*1.15:-Math.PI/2+k*TAU/n;}}catch(e){}return a;};
  var rt0=ringTap;ringTap=function(id){if(id!=='mz_elka')return rt0.apply(this,arguments);if(!G||G.tw[ringI]){closeRing();return;}SND.click();
    if(ringSel!=='mz_elka'){ringSel='mz_elka';var s=G.map.spots[ringI];G.preview={x:s.x,y:s.y,r:ELKA_R};showInfo(elkaInfo()+'<button class="btn ib" id="infoGo">'+Lg('Поставить ёлку','Place the tree')+'</button>');
      var b=$('infoGo');if(b)b.onclick=function(){SND.click();if(elkaPut(ringI))closeRing();};ringBuild();return;}
    if(elkaPut(ringI))closeRing();else closeRing();};
  var or0=openRing;openRing=function(i){if(elkaAt(i)){if(typeof closeRing==='function')closeRing();showInfo(elkaInfo());return;}return or0.apply(this,arguments);};
  var tb0=tryBuild;tryBuild=function(i){if(elkaAt(i))return false;return tb0.apply(this,arguments);};})();
function elkaFrame(dt,G){var E=G.mzE;if(!E)return;E.t+=dt;var R2=ELKA_R*ELKA_R,e,i;
  for(i=0;i<G.en.length;i++){e=G.en[i];if(e.dead||e.under)continue;if((e.x-E.x)*(e.x-E.x)+(e.y-E.y)*(e.y-E.y)<R2)e.slow=Math.max(e.slow||0,e.boss?.15:.3);}
  E.cd-=dt;if(E.cd>0||!G.started)return;
  // узлы гирлянды: ёлка и соседние заставы
  var N=[{x:E.x,y:E.y-30}];for(i=0;i<G.tw.length;i++){var t=G.tw[i];if(t&&(t.x-E.x)*(t.x-E.x)+(t.y-E.y)*(t.y-E.y)<130*130)N.push({x:t.x,y:t.y-40});}
  var best=null,bn=null,bd=95*95;for(i=0;i<G.en.length;i++){e=G.en[i];if(e.dead||e.under||e.invul)continue;for(var j=0;j<N.length;j++){var d=(e.x-N[j].x)*(e.x-N[j].x)+(e.y-N[j].y)*(e.y-N[j].y);if(d<bd){bd=d;best=e;bn=j;}}}
  if(!best){E.cd=.3;return;}E.cd=ELKA_CD;
  var pts=[[N[0].x,N[0].y]];if(bn>0)pts.push([N[bn].x,N[bn].y]);var hit=[],cur=best,dmg=elkaDmg();
  for(var k=0;k<3&&cur;k++){hit.push(cur);pts.push([cur.x,cur.y-8]);dmgEnemy(cur,dmg,'magic',E);dmg*=.8;var nx=null,nd=70*70;
    for(i=0;i<G.en.length;i++){var o=G.en[i];if(o.dead||o.under||hit.indexOf(o)>=0)continue;var dd=(o.x-cur.x)*(o.x-cur.x)+(o.y-cur.y)*(o.y-cur.y);if(dd<nd){nd=dd;nx=o;}}cur=nx;}
  G.fx.push({k:'bolt',pts:pts,t:0,dur:.2,col:['#ffd84a','#ff6a6a','#6ad8ff','#8aff6a'][(E.t*3|0)%4],seed:(E.t*1000)|0});try{SND.zap();}catch(x){}}
function elkaDraw(c,G){var E=G.mzE;if(!E)return;var t=G.t||0,i;
  // гирлянда-огоньки к соседним заставам
  c.lineWidth=1.2;for(i=0;i<G.tw.length;i++){var w=G.tw[i];if(!w||(w.x-E.x)*(w.x-E.x)+(w.y-E.y)*(w.y-E.y)>=130*130)continue;
    var ax=E.x,ay=E.y-28,bx=w.x,by=w.y-36,mx=(ax+bx)/2,my=Math.max(ay,by)+14;c.strokeStyle='rgba(60,40,20,.55)';c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo(mx,my,bx,by);c.stroke();
    for(var k=1;k<8;k++){var u=k/8,px=(1-u)*(1-u)*ax+2*u*(1-u)*mx+u*u*bx,py=(1-u)*(1-u)*ay+2*u*(1-u)*my+u*u*by;
      glowDot(c,px,py,4.5,['#ff4a4a','#ffd84a','#4ad8ff','#7aff6a'][(k+i)%4],.45+.45*Math.sin(t*4+k+i));}}
  drawSpr('mz_elka',E.x,E.y-10,1,1,false);worldT();
  glowDot(c,E.x,E.y-46,10+2*Math.sin(t*3),'#ffe27a',.7);}
/* снег в бою (праздник): лёгкие хлопья в мировых координатах; «лёгкая графика» — без снега */
var SNOW=null;
function snowDraw(c,G){if(document.body.classList.contains('lite'))return;if(!SNOW){SNOW=[];var R=mulberry(77);for(var i=0;i<26;i++)SNOW.push([R()*WW,R()*WH,.6+R()*1.2,R()*6]);}
  var t=G.t||0;c.fillStyle='rgba(255,255,255,.85)';for(var j=0;j<SNOW.length;j++){var s=SNOW[j],x=(s[0]+Math.sin(t*.7+s[3])*14)%WW,y=(s[1]+t*(14+s[2]*10))%WH;c.beginPath();c.arc(x,y,s[2]*1.3,0,TAU);c.fill();}}

/* ---------- Карачун — Босс недели (неделя с 28.12) ---------- */
function karWeek(w){var y=+sea()+2000;return w===weekNo(Date.UTC(y,11,28,12));}
function karCh(){for(var i=0;i<CH.length;i++)if(CH[i].boss==='karach')return i;return 4;}
function karNow(){return ny()&&karWeek(weekNo());}
(function(){var wc0=weekCh;weekCh=function(w){var n=w==null?weekNo():w;if(ny()&&!OB2.off(ID)&&karWeek(n))return karCh();return wc0.apply(this,arguments);};})();

/* ---------- «Застава богатырей»: Слава ×3 ---------- */
(function(){if(typeof SLAVA_ADD!=='function')return;var sa0=SLAVA_ADD;SLAVA_ADD=function(n,src){if(bog()&&!OB2.off(ID)&&src!=='mz')n=(+n||0)*3;return sa0.call(this,n,src);};})();
function bogWins(){return M().c[bsea()+'bw']|0;}
function bogCheck(){if(!bog()||skinAllOwned('bogat')||bogWins()<3)return '';giveSkin('bogat',true);save();stat('skin',{k:'bogat'});
  var s=Lg('🛡 Облик «Богатырский» — твой! Надет на все заставы.','🛡 The “Bogatyr” look is yours! Put on all outposts.');setTimeout(function(){toast(s);},900);return s;}

/* ---------- окно праздника ---------- */
function advCell(n){var got=advGot(n),op=advOpen(n),big=n===17||n===ADV_N,d=advDate(n).slice(5).split('-'),mo=n===ADV_N?Lg('янв','Jan'):Lg('дек','Dec');
  return '<button class="mzc'+(got?' got':op?' on':'')+(big?' big':'')+'" data-mz="'+n+'"'+(op&&!got?'':' disabled')+'><b>'+(+d[1])+'</b><small>'+(got?'✓':op?(big?'🎁':'❄'):mo)+'</small></button>';}
function css(){if(document.getElementById('mzCss'))return;var s=document.createElement('style');s.id='mzCss';
  s.textContent='.mzg{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:6px 0}.mzc{position:relative;border:1px solid #b89a6a;border-radius:8px;background:#efe3c8;padding:4px 0 2px;min-height:42px;font:inherit;color:#5a4028;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:.75}'+
  '.mzc b{font-size:16px;line-height:1.1}.mzc small{font-size:11px;opacity:.85;white-space:nowrap}.mzc.on{opacity:1;background:linear-gradient(#ffffff,#d8ecff);border-color:#4a8ad8;box-shadow:0 0 0 2px rgba(74,138,216,.35);cursor:pointer;animation:mzP 1.4s ease-in-out infinite}'+
  '.mzc.got{opacity:.55;background:#dfe8d0}.mzc.big{border-color:#d8a020}.mzc.big.on{background:linear-gradient(#fff6c8,#ffd84a)}@keyframes mzP{50%{transform:scale(1.06)}}body.lite .mzc.on{animation:none}'+
  '.mzo{margin:4px 0;padding:0;list-style:none;font-size:13px}.mzo li{display:flex;justify-content:space-between;gap:6px;padding:2px 0;border-bottom:1px dashed rgba(90,64,40,.25)}.mzo li.d{opacity:.55;text-decoration:line-through}.mzo li.c{font-weight:700}';
  document.head.appendChild(s);}
function open(){if(ny())return openNy();if(bog())return openBog();}
function openNy(){css();try{STAT.screen('mz');}catch(e){}stat('open');var L=left(),c=obozCur(),done=obozDone(),h='';
  h+='<h3>🎄 '+nyName()+'</h3><p class="sub">'+(sng()?Lg('Старый Новый год — последние дни праздника! Обоз и окошки — до 14 января.','Old New Year — the last days of the holidays! Caravan and windows — until January 14.'):
    Lg('Праздник идёт '+(L<=1?'последний день':'ещё '+L+' '+plural(L,'день','дня','дней'))+'.','The holiday lasts '+(L<=1?'one last day':L+' more days')+'.'))+'</p>';
  h+='<div class="card"><b>'+Lg('❄ Календарь Морозко','❄ Morozko’s calendar')+'</b><span class="note"> · '+Lg('каждый день — окошко с подарком; пропустил — откроешь позже','a gift window every day; missed one — open it later')+'</span><div class="mzg">';
  for(var n=1;n<=ADV_N;n++)h+=advCell(n);h+='</div></div>';
  h+='<div class="card"><div class="row"><img class="ic" src="'+ic('ti_arch_3~snow',112)+'" alt=""><div class="t"><b>'+Lg('Дед Мороз собирает обоз','Father Frost gathers a caravan')+'</b><span>'+
    (done?Lg('✅ Облик «Снежный» твой — навсегда!','✅ The “Snowy” look is yours — forever!'):Lg('Награда: облик «Снежный» на все заставы, навсегда.','Reward: the “Snowy” look for all outposts, forever.')+(sng()?Lg(' Последний шанс — до 14 января!',' Last chance — until January 14!'):''))+'</span></div></div><ul class="mzo">';
  for(var i=0;i<OBOZ.length;i++){var o=OBOZ[i],v=Math.min(o.n,cnt(o.k));h+='<li class="'+(v>=o.n?'d':i===c?'c':'')+'"><span>'+(i+1)+'. '+Lg(o.t[0],o.t[1])+'</span><span>'+v+'/'+o.n+'</span></li>';}
  h+='</ul></div>';
  var tips=[];tips.push(Lg('🎄 В бою: тронь пустое место — в кольце есть ёлка-застава (одна на бой, даром).','🎄 In battle: tap an empty spot — the ring has the Fir-tree outpost (one per battle, free).'));
  if(karNow())tips.push(Lg('🥶 На этой неделе Босс недели — сам Карачун!','🥶 This week’s boss is Karachun himself!'));
  if(kan())tips.push(Lg('⛄ Каникулы: награда «Заставы дня» — вдвое!','⛄ Winter holidays: the “Outpost of the day” reward is doubled!'));
  try{var q=slSaga(),nm=SAGA[((q.id%SAGA.length)+SAGA.length)%SAGA.length];if(nm&&/Морозко/.test(nm.n))tips.push(Lg('📜 Идёт «Сказ о Морозко» — ступень ','📜 The “Tale of Morozko” is on — step ')+sagaStep(q.p)+'/'+SAGA_N);}catch(e){}
  h+='<p class="note" style="margin:6px 2px">'+tips.join('<br>')+'</p><div class="btns"><button class="btn ghost" id="mzX">'+Lg('Закрыть','Close')+'</button></div>';
  showModal(h);on('mzX',hideModal);
  var bs=document.querySelectorAll('[data-mz]');for(var k=0;k<bs.length;k++)bs[k].onclick=function(){var n=+this.getAttribute('data-mz'),t=advTake(n);if(!t)return;SND.up();
    toast(Lg('🎁 Окошко '+n+': ','🎁 Window '+n+': ')+t);setPillsSafe();openNy();};}
function setPillsSafe(){try{if(typeof setPills==='function')setPills();}catch(e){}}
function openBog(){var w=Math.min(3,bogWins()),got=skinAllOwned('bogat');try{STAT.screen('mzb');}catch(e){}stat('open',{k:'bog'});
  showModal('<h3>🛡 '+Lg('Застава богатырей','Bogatyr Outpost')+'</h3><p class="sub">'+Lg('День богатырей — Слава за все дела втрое! Праздник до 23 февраля.','Heroes’ Day — triple Fame for everything! The holiday lasts until February 23.')+'</p>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic('ti_arch_3~bogat',112)+'" alt=""><div class="t"><b>'+Lg('Три победы — облик «Богатырский»','Three wins — the “Bogatyr” look')+'</b><span>'+
    (got?Lg('✅ Облик твой — навсегда!','✅ The look is yours — forever!'):Lg('Любые бои. Победы: ','Any battles. Wins: ')+w+' / 3')+'</span><div class="bar"><i style="width:'+Math.round(w/3*100)+'%"></i></div></div></div></div>'+
    '<div class="btns"><button class="btn ghost" id="mzX">'+Lg('Закрыть','Close')+'</button></div>');on('mzX',hideModal);}
// строка для «Летописи заставы» (LET): {h, bind}
function advRow(){if(!ny())return null;var n=advLeft();return {h:'<div class="row"><img class="ic" src="'+ic('mz_elka',72)+'" alt=""><div class="t"><b>'+Lg('Календарь Морозко','Morozko’s calendar')+'</b><span>'+
  (n?Lg('Ждёт окошек: '+n,'Windows waiting: '+n):Lg('Сегодняшнее окошко открыто — завтра новое','Today’s window is open — a new one tomorrow'))+'</span></div><button class="btn" data-mzo="1">🎄</button></div>',
  bind:function(el){var b=el.querySelector('[data-mzo]');if(b)b.onclick=function(){SND.click();openNy();};}};}

/* ---------- крючки ---------- */
OB2.on('run',function(G){if(karNow()&&G.wk&&CH[G.ci].boss==='karach')setTimeout(function(){try{voice(Lg('Карачун пришёл забрать праздник! Не отдадим ёлку — держи заставу!','Karachun has come to steal the holiday! We won’t give up the tree — hold the outpost!'),VOEV(),'voevoda',6);}catch(e){}},600);},ID);
OB2.on('end',function(G,win){var msg='';
  if(win&&!G.mzW){G.mzW=1;if(ny()){inc('w');msg=obozCheck();}if(bog()){var o=M();o.c[bsea()+'bw']=(o.c[bsea()+'bw']|0)+1;msg=bogCheck()||msg;}save();}
  if(win&&G.wk&&karNow()&&CH[G.ci]&&CH[G.ci].boss==='karach'&&!G.mzK){G.mzK=1;stat('kar');ev({a:'kar'});}
  if(G.dly&&kan())setTimeout(kanDly,0);},ID);
// Каникулы: «Застава дня» — награда раз в день ещё раз (×2)
function kanDly(){var o=S.dlyO,d=dayKey();if(!o||o.day!==d||!o.got||M().c[sea()+'kd']===d)return;M().c[sea()+'kd']=d;var g=dchGold();S.gold+=g;ern('quest',g);save();stat('kan',{g:g});
  setTimeout(function(){toast(Lg('⛄ Каникулы: награда заставы вдвое — ещё +','⛄ Winter holidays: double outpost reward — another +')+fmtGold(g));},1200);}
META_MODS.push({id:'mz',
  KILL:function(e){if(!ny()||!G||e.type==='egg')return;inc('k');if(e.lead||e.boss)inc('b');},
  FRAME:function(dt,G){if(G.mzE)elkaFrame(dt,G);},
  DRAW:function(c,G){if(G.mzE)elkaDraw(c,G);if(ny())snowDraw(c,G);}});
// FRAME/DRAW/KILL зовутся движком напрямую — выключение флагом проверяем на загрузке (выше); ?off=moroz файл вообще не грузит
OB2.slot('today','moroz',function(a){if(ny())a.unshift({id:'mz',hot:advLeft()>0,t:'🎄 '+Lg('Морозко','Morozko'),fn:openNy});else if(bog())a.unshift({id:'mzb',hot:!skinAllOwned('bogat'),t:'🛡 '+Lg('Богатыри','Bogatyrs'),fn:openBog});},5);
// строка в «Летописи заставы» (LET): одно окно входа — Летопись
OB2.slot('let','moroz',function(a){if(ny()){var n=advLeft();a.push({t:'🎄 '+(n?Lg('Календарь Морозко: ждёт окошек — '+n,'Morozko’s calendar: windows waiting — '+n):Lg('Морозко на заставе — до 14 января','Morozko at the Outpost — until Jan 14')),fn:openNy});}else if(bog()&&!skinAllOwned('bogat'))a.push({t:'🛡 '+Lg('Застава богатырей: Слава ×3','Bogatyr Outpost: Glory ×3'),fn:openBog});},50);
OB2.slot('win','moroz',function(G,win){if(!ny()||obozDone()||!win)return null;var c=obozCur();if(c>=OBOZ.length)return null;var o=OBOZ[c];
  return {h:'❄ '+Lg('Обоз Деда Мороза','Father Frost’s caravan')+': '+Lg(o.t[0],o.t[1]).split(':')[0]+' — '+Math.min(o.n,cnt(o.k))+'/'+o.n};},5);
// окно входа (раз в день, если ждут окошки). Очередь входа — в заглушке index.html (файл может прийти позже меню): late — показать, только если игрок ещё в меню без окна
function enter(late){if(!ny())return false;var o=M(),k=sea()+'sd',d=day();if(o.c[k]===d||advLeft()<1)return false;
  if(late&&(G||$('modal').classList.contains('on')))return false;o.c[k]=d;save();openNy();return true;}
window.MZ={enter:enter,day:day,ny:ny,kan:kan,sng:sng,bog:bog,open:open,bundle:bundle,advRow:advRow,advLeft:advLeft,kar:karNow,_m:M};
// чистка старых сезонов (только свои ключи)
try{var o=M(),s=sea(),b=bsea();for(var ka in o.a)if(ka.indexOf(s+'-')!==0)delete o.a[ka];for(var kc in o.c)if(kc.indexOf(s)!==0&&kc.indexOf(b+'b')!==0)delete o.c[kc];}catch(e){}
try{if(typeof renderToday==='function'&&!G&&typeof curTab!=='undefined')renderToday();}catch(e){}
})();
