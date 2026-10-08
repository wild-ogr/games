/* МЕТА: КАРТА РОССИИ-ТРОФЕЕВ (поток META, 08.10.2026). Журнал: rybak-boost/logs/META.md
   Россия поделена на большие края. У края — места игры (по id места; новое место без строки в MAP_PL — по полю reg реестра NORTH) и все их рыбы из реестра
   (обычные виды мест + легенды + Царь-рыба). Край закрашивается по мере поимки, а когда пойманы ВСЕ его рыбы — горит золотом, и можно забрать медаль
   («Рыбак Поволжья», «Сибиряк»…): монеты + очки Науки. Края без мест — «скоро» (Юг — глава III, Урал).
   Списков рыб здесь НЕТ — только реестр (PLACES[].fish/leg/tsar, FISH, LEG). Координаты мест — для булавок на карте (MAP_PL).
   Сохранение: S.mapM {край: 1} — медаль забрана. */
(function(){
'use strict';
var M=META;
// края: id, имя, медаль, поле многоугольника [долгота, широта] (обрезается контуром страны), точка подписи
var REG=[
 {id:'north',n:'Север',en:'The North',m:'Северянин',me:'Northerner',poly:[[20,57.5],[36,57.5],[36,61],[62,61],[66,66],[70,84],[20,84]],lab:[44,65.5]},
 {id:'center',n:'Средняя полоса',en:'Central Russia',sn:'Центр',sen:'Centre',m:'Рыбак Средней полосы',me:'Central angler',poly:[[20,50],[43.5,50],[44.5,61],[36,61],[36,57.5],[20,57.5]],lab:[39,53.2]},
 {id:'south',n:'Юг',en:'The South',m:'Южанин',me:'Southerner',poly:[[20,38],[50,38],[47,44.5],[44,47],[43.5,50],[20,50]],lab:[40,46.5]},
 {id:'volga',n:'Поволжье',en:'Volga region',m:'Рыбак Поволжья',me:'Volga angler',poly:[[43.5,50],[44,47],[47,44.5],[50,38],[56,38],[57,61],[44.5,61]],lab:[50.5,55]},
 {id:'ural',n:'Урал',en:'The Urals',m:'Уралец',me:'Ural angler',poly:[[56,38],[68,38],[68,66],[66,66],[62,61],[57,61]],lab:[62,63.5]},
 {id:'siberia',n:'Сибирь',en:'Siberia',m:'Сибиряк',me:'Siberian',poly:[[68,38],[113,38],[113,84],[70,84],[66,66],[68,66]],lab:[92,62]},
 {id:'fareast',n:'Дальний Восток',en:'Far East',m:'Дальневосточник',me:'Far Easterner',poly:[[113,38],[200,38],[200,84],[113,84]],lab:[140,63]}];
// места игры: край и точка [долгота, широта]
var MAP_PL={prud:['center',37.8,55.9],rechka:['center',35.0,56.9],volga:['volga',48.0,46.4],seliger:['center',33.1,57.2],ladoga:['north',31.5,61.0],
  baikal:['siberia',108.0,53.5],amur:['fareast',135.1,48.5],kamchatka:['fareast',160.0,56.2],
  chudskoe:['north',27.5,58.7],chud:['north',27.5,58.7],onego:['north',35.5,61.7],onega:['north',35.5,61.7],varzuga:['north',36.6,66.4],beloe:['north',37.5,65.5],belomore:['north',37.5,65.5],barents:['north',35.1,69.2]};
var REG_KW=[[/Карел|Мурман|Псков|Архангел|Ленинград|Новгород|Вологод|Коми|Белое|Баренц|Онег|Чудск|Ладог/i,'north'],[/Астрах|Волг|Самар|Саратов|Казан|Татар|Нижегор|Ульянов|Волгоград/i,'volga'],
  [/Краснодар|Ростов|Дон|Кубан|Ставроп|Дагест|Крым|Адыге/i,'south'],[/Урал|Свердлов|Челяб|Перм|Башкир|Тюмен/i,'ural'],
  [/Иркут|Байкал|Енисей|Красноярск|Новосиб|Алтай|Томск|Омск|Обь|Бурят|Тыва|Якут/i,'siberia'],[/Хабаров|Камчат|Амур|Примор|Сахалин|Магадан|Чукот/i,'fareast'],[/Москв|Подмоск|Твер|Ярослав|Смолен|Калуж|Рязан|Владимир|Тул|Брян|Орл|Курск|Белгород|Воронеж|Липецк|Тамбов|Иван|Костром/i,'center']];
function regOfPlace(p){var x=MAP_PL[p.id];if(x)return x[0];for(var i=0;i<REG_KW.length;i++)if(REG_KW[i][0].test(p.reg||''))return REG_KW[i][1];return '';}
function caught(id){return !!((S.alb&&S.alb[id]&&(S.alb[id].n||0)>0)||(S.legs&&S.legs[id]));}
// край: места и рыбы из реестра
function regData(){var ps=M.places(),out={};REG.forEach(function(r){out[r.id]={r:r,pl:[],fish:[],leg:[]};});
  ps.forEach(function(p){var k=regOfPlace(p);if(!out[k])return;var o=out[k];o.pl.push(p);
    p.fish.forEach(function(id){if(o.fish.indexOf(id)<0&&M.fish(id))o.fish.push(id);});
    [p.leg,p.tsar].forEach(function(id){if(id&&o.leg.indexOf(id)<0&&M.fish(id))o.leg.push(id);});});
  REG.forEach(function(r){var o=out[r.id],all=o.fish.concat(o.leg);o.all=all;o.got=all.filter(caught).length;o.n=all.length;
    o.sp=o.fish.filter(caught).length;o.lg=o.leg.filter(caught).length;o.gold=o.n>0&&o.got>=o.n;o.has=o.pl.length>0;});
  return out;}
function medalC(o){return M.r5(M.tripC()*(1+.1*o.n/4));}

/* ---------- сохранение ---------- */
M.fix(function(){M.fObj('mapM');for(var k in S.mapM)if(!REG.some(function(r){return r.id===k;}))delete S.mapM[k];});
M.merge(function(loc,d){M.mObj(loc,d,'mapM');});

/* ---------- рисунок карты (SVG): коническая проекция, края обрезаны контуром страны ---------- */
var RUS=[[28,60],[29,61.5],[30,64],[29.5,67],[28.5,69],[31,69.8],[33,69.4],[37,69.2],[41,67.8],[40.3,66.3],[37.5,66.2],[35,64.5],[37.5,64.3],[40,64.6],[42,66.2],[44,66],[44,68.4],[46,68.1],
  [53,68.4],[55,68.5],[58,68.9],[60,69.8],[64,69.3],[67,68.6],[68.5,72.5],[72,72.8],[72.5,69.5],[74,68.2],[75,72],[80,72.6],[80.5,73.6],[87,74.2],[95,76],[105,77.7],[110,76.5],[113,73.6],[120,73],
  [129,72.4],[134,71.5],[140,72.5],[150,71.6],[160,70],[170,69.9],[180,68.9],[190,66.2],[184,65],[179,62.5],[174,61.8],[170,60],[164,59.8],[163,57.6],[162,56.2],[160,54.2],[156.7,51],[155.6,55],[156,57.5],
  [155,59.3],[152,59.2],[148,59.4],[143,59.3],[140.5,57.8],[138,56.5],[137,54],[141,53.3],[140.3,50],[140,48],[138,46.5],[135,43.6],[133,42.8],[131.9,43.1],[130.7,42.4],[131,44.9],[133.1,45.1],[134.7,48.3],
  [130.7,48.9],[127.5,49.7],[125.5,53],[121,53.3],[119.5,50.2],[116.7,49.8],[114,50.2],[108,49.3],[102,51.7],[98,50],[97.3,49.7],[89,49.3],[87,49.1],[83.5,51],[80,51],[76.5,54],[73.5,54],[70,55.2],
  [65,54.6],[61,54],[61,51.5],[55,50.6],[50.5,51.5],[48.5,50],[46.7,48.7],[47.2,47.6],[49,46.5],[48,45.5],[47.4,43.8],[48,42],[46.6,41.8],[44,42.7],[40,43.4],[38,44.5],[36.8,45.2],[38.3,46.8],[39.6,47.6],
  [40,49.6],[38,50],[35.4,50.5],[34,51.8],[32,52.3],[31.5,53.5],[32.5,54.2],[30.8,55.8],[28,56.2],[27.5,57.6],[28.2,59.3]];
var ISL=[[[142,46],[143.5,46.8],[144,49],[143.2,51.5],[143.4,54],[142.3,54.3],[142,50.5],[141.8,47]],
  [[52,71.2],[55,70.6],[57.5,70.8],[58,71.8],[60,73.8],[64,75.6],[68.5,76.9],[66,77.1],[59,75.8],[55.5,74.6],[53,73]],
  [[20,54.4],[22.8,54.3],[22.6,55.1],[21.2,55.3],[20,54.9]]];
var PJ={c:100,k:.0118,s:12.2,x0:0,y0:0};
function prj(lon,lat){var a=(lon-PJ.c)*PJ.k,r=(90-lat)*PJ.s;return [PJ.x0+r*Math.sin(a),PJ.y0+r*Math.cos(a)];}
// подгонка: вписываем контур в рамку W×H
function fit(W,H){PJ.x0=0;PJ.y0=0;var mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;RUS.forEach(function(p){var q=prj(p[0],p[1]);mnx=Math.min(mnx,q[0]);mxx=Math.max(mxx,q[0]);mny=Math.min(mny,q[1]);mxy=Math.max(mxy,q[1]);});
  var sc=Math.min((W-16)/(mxx-mnx),(H-16)/(mxy-mny));PJ.s*=sc;PJ.x0=0;PJ.y0=0;mnx=1e9;mny=1e9;mxx=-1e9;mxy=-1e9;
  RUS.forEach(function(p){var q=prj(p[0],p[1]);mnx=Math.min(mnx,q[0]);mxx=Math.max(mxx,q[0]);mny=Math.min(mny,q[1]);mxy=Math.max(mxy,q[1]);});
  PJ.x0=(W-(mxx-mnx))/2-mnx;PJ.y0=(H-(mxy-mny))/2-mny;}
function path(pts,close){var d='';for(var i=0;i<pts.length;i++){var q=prj(pts[i][0],pts[i][1]);d+=(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1);}return d+(close===false?'':'Z');}
// многоугольник края с плотными рёбрами (чтобы прямые по долготе/широте изгибались вместе с проекцией)
function dense(poly){var out=[];for(var i=0;i<poly.length;i++){var a=poly[i],b=poly[(i+1)%poly.length],n=Math.max(1,Math.ceil(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))/2));
  for(var k=0;k<n;k++)out.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return out;}
function mapSvg(W,H,D,sel){fit(W,H);var uid='mp'+Math.floor(Math.random()*1e6),land=path(RUS)+ISL.map(function(p){return path(p);}).join('');
  var s='<svg class="rumap" viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="'+L('Карта России','Map of Russia')+'"><defs>'+
   '<clipPath id="'+uid+'c"><path d="'+land+'"/></clipPath>'+
   '<linearGradient id="'+uid+'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#f2c94c"/><stop offset="1" stop-color="#c8901a"/></linearGradient>'+
   '<linearGradient id="'+uid+'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d4a63"/><stop offset="1" stop-color="#14354a"/></linearGradient>'+
   '<pattern id="'+uid+'h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v7" stroke="rgba(255,255,255,.16)" stroke-width="2"/></pattern>'+
   '<filter id="'+uid+'f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'+
   '<rect width="'+W+'" height="'+H+'" rx="16" fill="url(#'+uid+'w)"/>';
  for(var gx=0;gx<6;gx++)s+='<path d="'+path([[40+gx*30,42],[40+gx*30,80]],false)+'" stroke="rgba(255,255,255,.07)" fill="none"/>';
  for(var gy=0;gy<4;gy++){var ln=[];for(var lo=20;lo<=190;lo+=5)ln.push([lo,45+gy*10]);s+='<path d="'+path(ln,false)+'" stroke="rgba(255,255,255,.07)" fill="none"/>';}
  s+='<path d="'+land+'" fill="#55707a" stroke="rgba(0,0,0,.35)" stroke-width="3" transform="translate(2 3)" opacity=".5"/>';
  s+='<g clip-path="url(#'+uid+'c)">';
  REG.forEach(function(r){var o=D[r.id],k=o.n?o.got/o.n:0,fill=o.gold?'url(#'+uid+'g)':!o.has?'#5d6f6a':'rgb('+Math.round(96+60*k)+','+Math.round(140+40*k)+','+Math.round(110-20*k)+')';
    s+='<path class="rureg'+(sel===r.id?' sel':'')+'" data-r="'+r.id+'" d="'+path(dense(r.poly))+'" fill="'+fill+'" stroke="rgba(255,255,255,.55)" stroke-width="1.2"'+(o.gold?' filter="url(#'+uid+'f)"':'')+'/>';
    if(!o.has)s+='<path d="'+path(dense(r.poly))+'" fill="url(#'+uid+'h)" pointer-events="none"/>';});
  s+='</g><path d="'+land+'" fill="none" stroke="#e8f0ea" stroke-width="1.6"/>';
  REG.forEach(function(r){var o=D[r.id],q=prj(r.lab[0],r.lab[1]),sm=W<500,fs=sm?13:15,nm0=sm&&r.sn?L(r.sn,r.sen):L(r.n,r.en);
    s+='<g class="rulab" pointer-events="none"><text x="'+q[0].toFixed(1)+'" y="'+q[1].toFixed(1)+'" text-anchor="middle" font-size="'+fs+'" font-weight="700" fill="'+(o.gold?'#5a3a00':'#fff')+'" stroke="'+(o.gold?'rgba(255,240,180,.8)':'rgba(0,0,0,.45)')+'" stroke-width="3" paint-order="stroke">'+esc(nm0)+'</text>'+(sm&&!o.has?'':
      '<text x="'+q[0].toFixed(1)+'" y="'+(q[1]+fs+2).toFixed(1)+'" text-anchor="middle" font-size="'+(fs-1)+'" fill="'+(o.gold?'#5a3a00':'#fff')+'" stroke="'+(o.gold?'rgba(255,240,180,.8)':'rgba(0,0,0,.45)')+'" stroke-width="3" paint-order="stroke">'+(o.has?o.got+'/'+o.n:L('скоро','soon'))+'</text>')+'</g>';});
  M.places().forEach(function(p){var x=MAP_PL[p.id];if(!x)return;var q=prj(x[1],x[2]),open=!!(S.open&&S.open[p.i]);
    s+='<g class="rupin" pointer-events="none"><circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="'+(open?5:4)+'" fill="'+(open?'#ff8f4f':'#c9d2da')+'" stroke="#fff" stroke-width="2"/></g>';});
  return s+'</svg>';}

/* ---------- медаль (свой рисунок) ---------- */
function medal(r,on,sz){sz=sz||48;var id='md'+r.id+Math.floor(Math.random()*1e6);
  return '<svg class="rumed'+(on?' on':'')+'" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="'+id+'" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="'+(on?'#fff6c8':'#e8eef2')+'"/><stop offset=".5" stop-color="'+(on?'#f2c94c':'#a8b4bc')+'"/><stop offset="1" stop-color="'+(on?'#b8860b':'#6a7680')+'"/></radialGradient></defs>'+
   '<path d="M20 2h10l4 16H24zM34 2h10l-4 16H30z" fill="'+(on?'#2f6fb3':'#7a8690')+'"/><path d="M27 2h3l3 14h-3z" fill="#d23a32"/>'+
   '<path d="M32 18l5 4.5 6.6-.6.9 6.6 5.6 3.5-3 6 3 6-5.6 3.5-.9 6.6-6.6-.6L32 58l-5-4.5-6.6.6-.9-6.6-5.6-3.5 3-6-3-6 5.6-3.5.9-6.6 6.6.6z" fill="url(#'+id+')" stroke="'+(on?'#9a6a0a':'#5a6670')+'" stroke-width="1.5"/>'+
   '<path d="M20 39c4-5.5 11-7 17-3l5-3.6v11.2l-5-3.6c-6 4-13 2.5-17-1z" fill="'+(on?'#8a5a08':'#5a6670')+'" opacity=".85"/><circle cx="25" cy="38.4" r="1.3" fill="#fff"/></svg>';}

/* ---------- окно ---------- */
var SEL='';
function openMapR(back,sel){var D=regData(),wide=(window.innerWidth||400)>=820,W=wide?720:380,H=wide?330:220;SEL=sel||SEL||'';
  var n=0,g=0;REG.forEach(function(r){if(D[r.id].has){n++;if(D[r.id].gold)g++;}});M.stat('map','open',{g:g});
  var cards=REG.filter(function(r){return D[r.id].has;}).concat(REG.filter(function(r){return !D[r.id].has;})).map(function(r){var o=D[r.id],got=!!(S.mapM&&S.mapM[r.id]);
    var fishes=o.has?'<div class="rufish">'+o.all.map(function(id){var f=M.fish(id),c=caught(id),rk=M.rar(id);
      return '<span class="rufi'+(c?' on':'')+'" data-f="'+id+'" data-sil="'+(c?0:1)+'" title="'+esc(c?nm(f):'?')+'" style="border-color:'+M.rarC(rk)+'"></span>';}).join('')+'</div>':'';
    return '<div class="rucard'+(o.gold?' gold':'')+(SEL===r.id?' sel':'')+'" id="ru_'+r.id+'">'+medal(r,o.gold,52)+'<div class="ruc"><b>'+esc(L(r.n,r.en))+'</b><small>'+
      (o.has?esc(o.pl.map(function(p){return L(p.n,p.en);}).join(', '))+' · '+L('видов','species')+' '+o.sp+'/'+o.fish.length+(o.leg.length?' · '+L('легенд','legends')+' '+o.lg+'/'+o.leg.length:''):L('Края откроются в новых главах','Opens in new chapters'))+'</small>'+
      '<small class="rumn">'+L('Медаль','Medal')+' «'+esc(L(r.m,r.me))+'»'+(got?' ✓':'')+'</small>'+fishes+
      (o.gold&&!got?'<button class="btn accent noenter rugo" data-m="'+r.id+'">'+L('Забрать медаль','Take the medal')+' +'+coinsTxt(medalC(o))+'</button>':'')+'</div></div>';}).join('');
  M.win(M.head('russia',L('Карта России','Map of Russia'),L('медалей','medals')+': '+Object.keys(S.mapM||{}).length+' · '+L('золотых краёв','golden regions')+': '+g+'/'+n)+
    '<div class="rubox" id="ruBox">'+mapSvg(W,H,D,SEL)+'</div>'+
    '<p class="about">'+L('Поймай всех рыб края — и он загорится золотом. Легенды тоже в счёт!','Catch every fish of a region and it turns gold. Legends count too!')+'</p>'+
    '<div class="rucards">'+cards+'</div><div class="row"><button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div>',wide);
  var mc=$('mcard');
  mc.querySelectorAll('.rufi').forEach(function(e){try{e.appendChild(fishImg(e.dataset.f,64,e.dataset.sil==='1'));}catch(er){}});
  mc.querySelectorAll('.rureg').forEach(function(p){p.onclick=function(){var c=$('ru_'+p.dataset.r);SEL=p.dataset.r;mc.querySelectorAll('.rucard.sel').forEach(function(x){x.classList.remove('sel');});
    mc.querySelectorAll('.rureg.sel').forEach(function(x){x.classList.remove('sel');});p.classList.add('sel');if(c){c.classList.add('sel');try{c.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){c.scrollIntoView();}}};});
  mc.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){var id=b.dataset.m,D2=regData(),o=D2[id];if(!o||!o.gold||S.mapM[id])return;var c=medalC(o);
    S.mapM[id]=1;S.coins+=ern('quest',c);save();updCoins();M.stat('map','medal',{r:id,c:c});try{SND.trophy();FX.burst(.5,.3,40,'coin');}catch(e){}
    toast('🏅 «'+L(o.r.m,o.r.me)+'» +'+coinsTxt(c),3000);openMapR(back,id);};});
  $('mCancel').onclick=back||hideModal;}

/* ---------- гнёзда ---------- */
function dueMedal(){var D=regData();for(var k in D)if(D[k].gold&&!(S.mapM&&S.mapM[k]))return D[k];return null;}
M.tile({id:'map',pri:20,when:function(){return (S.sessions||0)>=2;},ic:function(){return M.MI('russia');},t:function(){return L('Россия','Russia');},
  sub:function(){var D=regData(),g=0,n=0;for(var k in D)if(D[k].has){n++;if(D[k].gold)g++;}return dueMedal()?L('медаль ждёт!','medal waiting!'):L('золото ','gold ')+g+'/'+n;},
  hot:function(){return !!dueMedal();},go:function(){openMapR();}});
// итоги: новая рыба края — «ещё N до золота»
slotAdd(resultSlots,{id:'meta-map',pri:20,when:function(c){if(!c||!c.g||c.g.tourn||!c.fish)return false;var D=regData();var k=regOfPlace(M.places()[c.g.pi]||{});var o=D[k];
    return !!(o&&o.has&&(o.gold&&!(S.mapM&&S.mapM[k])||c.g.a3sp&&c.fish.some(function(x){return c.g.a3sp.indexOf(x.id)<0;})));},
  html:function(c){var D=regData(),k=regOfPlace(M.places()[c.g.pi]||{}),o=D[k];
    return '<button class="mtslot ruslot noenter" data-a="ru">'+medal(o.r,o.gold,40)+'<span class="mtst"><b>'+L('Карта России','Map of Russia')+': '+esc(L(o.r.n,o.r.en))+'</b><small>'+
      (o.gold?L('Край весь пойман — медаль ждёт!','Region complete — your medal is waiting!'):L('до золота — ещё '+(o.n-o.got)+' '+pl(o.n-o.got,'рыба','рыбы','рыб','',''),(o.n-o.got)+' more fish to gold'))+'</small></span>'+(window.LOOK?LOOK.I('fwd'):'›')+'</button>';},
  bind:function(el,c){el.querySelector('[data-a=ru]').onclick=function(){var k=regOfPlace(M.places()[c.g.pi]||{});openMapR(function(){hideModal();openMap();},k);};}});

M.map={open:openMapR,data:regData,REG:REG,MAP_PL:MAP_PL,regOf:regOfPlace};
M.mapRefresh();
})();
