/* МЕТА: НАРОДНЫЕ ПРИМЕТЫ КЛЁВА в прогнозе Петровича (поток META, 08.10.2026).
   ТОЛЬКО РЕАЛЬНАЯ ИНФОРМАЦИЯ: каждая строка — цитата или близкий пересказ из источника (список с адресами — rybak-boost/logs/META-omens-src.md,
   ключи источников — поле s). Ничего не выдумано. Где игра и примета расходятся — примету НЕ показываем (условия when сверены с моделью клёва игры:
   давление pxOf, погода WX_M, время суток TOD_M, сезон вида FISH[].a2.m). Рыбья примета показывается, только если по игре вид сейчас «в сезоне»
   (a2.m[месяц] ≥ 1,35) и водится на открытых местах. Луна в игре на клёв не влияет — лунные приметы подписаны «научно не подтверждено».
   Где видно: окно «Прогноз Петровича» (блок «Приметы»), «Цели дня» (гнездо dailySlots — «Примета дня»), окно «Народные приметы» (всё, что подходит к этому месяцу).
   Поля сохранения: нет. */
(function(){
'use strict';
var M=META;
// neg:1 — «плохая» примета: в прогнозе (там лучший выезд) не показываем, только в окне примет
// ty: n — народная примета, f — наблюдение рыболовов/справочник, b — повадки рыбы (энциклопедия), m — луна (научно не подтверждено), c — народный календарь
// when: px (давление игры), wx (погода игры), tod, mo (месяцы 0–11), fish (вид — только «в сезоне» по игре), date ['ММ-ДД','ММ-ДД'], moon ('new'|'full')
var OM=[
 // давление (игра: rise — мирная оживилась, fall — хищник жор, high — тихо, low — у дна)
 {id:'p1',ty:'f',when:{px:['fall']},t:'Лучше всего клюёт, когда давление понижается, но ещё не сильно упало.',s:'profile.ru'},
 {id:'p2',ty:'n',when:{px:['fall']},t:'Перед надвигающейся грозой наступает кратковременное улучшение клёва.',s:'I'},
 {id:'p3',ty:'f',when:{px:['rise']},t:'Клёв будет удачным, когда давление постепенно повышается.',s:'I, E'},
 {id:'p4',ty:'f',when:{px:['high']},t:'Наивысшие уловы бывают, когда давление держится неизменным 2–3 дня.',s:'FW, I'},
 {id:'p5',ty:'f',neg:1,when:{px:['low']},t:'Слишком низкое давление — плохой помощник рыбаку. Клёв ухудшается с началом ненастья — кроме налима.',s:'profile.ru, FW'},
 // погода (игра: дождик ×1,15, облачно ×1,1, туман ×1,05, ветрено ×0,95, ясно ×0,9)
 {id:'w1',ty:'n',when:{wx:['rain']},t:'Рыба активно клюёт во время моросящего дождика.',s:'E, F'},
 {id:'w2',ty:'f',when:{wx:['cloud']},t:'В пасмурный день шансы на улов возрастают.',s:'E, F'},
 {id:'w3',ty:'n',when:{wx:['fog']},t:'На рассвете стелется туман — отправляйтесь за рыбой, не пожалеете.',s:'E'},
 {id:'w4',ty:'n',when:{wx:['fog','sun'],tod:['morning']},t:'Самый лучший клёв бывает в ясное, тихое, прохладное утро с небольшим туманом.',s:'FW, I, F'},
 {id:'w5',ty:'f',when:{wx:['wind']},t:'Щука в штиль лучше берёт у берега, а при усилении ветра — в глубоких местах.',s:'I'},
 {id:'w7',ty:'n',when:{wx:['sun'],mo:[5,6,7]},t:'Если стоит засуха — рыбачьте на зорьке или на закате.',s:'E'},
 {id:'w8',ty:'n',when:{tod:['morning']},t:'Душное утро — рыбалка будет хорошей.',s:'I, E, F, skazka-dubki'},
 {id:'w9',ty:'f',when:{tod:['morning','evening'],mo:[4,5,6,7,8]},t:'Летом клёв лучше по утрам и вечерам.',s:'I, FW'},
 {id:'w10',ty:'n',when:{wx:['sun','cloud']},t:'С заходом солнца обильная роса, которая держится до утра, — к хорошему клёву.',s:'I'},
 // рыбы (показываем, только если по игре вид в сезоне)
 {id:'f1',ty:'n',when:{fish:'shuka',mo:[8,9,10]},t:'Полетели листья с берёз — у щуки начинается жор.',s:'E, FW'},
 {id:'f2',ty:'n',when:{fish:'shuka',mo:[4]},t:'Зацвела черёмуха — лови щуку.',s:'I, F, E'},
 {id:'f3',ty:'n',when:{fish:'shuka',mo:[5]},t:'Когда расцветёт шиповник — у щуки отличный жор.',s:'FW'},
 {id:'f4',ty:'f',when:{fish:'karas',mo:[7,8,9]},t:'Осенний жор карася — с середины августа, пик в сентябре–октябре, до первых заморозков.',s:'engage.org.ua'},
 {id:'f5',ty:'f',when:{fish:'karas',mo:[3,4]},t:'После ледохода, когда вода просветлеет, на мелководье начинает брать карась.',s:'FW'},
 {id:'f6',ty:'n',when:{fish:'karp',mo:[5]},t:'С цветением шиповника обычно начинается клёв карпа.',s:'FW, F'},
 {id:'f7',ty:'n',when:{fish:'lesh',mo:[5]},t:'Заколосилась рожь — смело иди на леща.',s:'U'},
 {id:'f8',ty:'n',when:{fish:'plotva',mo:[4]},t:'Расцвела сирень — начинается клёв плотвы.',s:'U'},
 {id:'f9',ty:'n',when:{fish:'golavl',mo:[4]},t:'Цветёт черёмуха — хорошо клюёт голавль.',s:'U'},
 {id:'f10',ty:'n',when:{fish:'peskar',mo:[3,4]},t:'Вода просветлела после весеннего паводка — хорошо клюют пескарь и плотва.',s:'I'},
 {id:'f11',ty:'f',when:{fish:'okun',mo:[7,8]},t:'Появились первые жёлтые листья на берёзах и липах — окунь собирается большими стаями.',s:'FW'},
 {id:'f12',ty:'f',when:{fish:'okun',mo:[9]},t:'Осенью окуня ищи там, где много коряг.',s:'ribaku (октябрь)'},
 {id:'f13',ty:'b',when:{fish:'nalim',tod:['night','evening']},t:'Налим любит холодную воду: лучше всего его ловят при первых заморозках — от заката до рассвета.',s:'Википедия «Налим»'},
 {id:'f14',ty:'n',when:{fish:'nalim',mo:[11,0,1]},t:'Зимой налим берёт даже в метель и мороз.',s:'FW, I'},
 {id:'f15',ty:'b',when:{fish:'som'},t:'Сом днём отлёживается в ямах и коряжнике, а охотится ночью.',s:'Википедия «Сом обыкновенный»'},
 {id:'f16',ty:'b',when:{fish:'sudak'},t:'Судак активен и днём, и ночью: ночью выходит на мелководье, днём держится на глубине.',s:'Википедия «Судак»'},
 {id:'f17',ty:'b',when:{fish:'lin'},t:'Линь держится у дна, среди зарослей, избегает яркого света.',s:'Википедия «Линь»'},
 {id:'f18',ty:'b',when:{fish:'zhereh'},t:'Жерех держится у поверхности на течении — в устьях речек и за перекатами.',s:'Википедия «Жерех»'},
 {id:'f19',ty:'f',when:{fish:'harius',mo:[5,6,7,8]},t:'Летом и в начале осени хариус хватает приманку у самой поверхности. Рябь от дождика или ветерка делает его смелее.',s:'vokrugsveta.ru'},
 {id:'f20',ty:'b',when:{fish:'lenok',tod:['morning','evening']},t:'Ленок кормится в любое время суток, но особенно активно — утром и вечером.',s:'Википедия «Ленок»'},
 {id:'f21',ty:'b',when:{fish:'ryapushka',mo:[9,10,11]},t:'Ряпушка нерестится поздней осенью и в начале зимы и часто поднимается стаями на мелководье.',s:'Википедия «Ряпушка»'},
 {id:'f22',ty:'b',when:{fish:'chavycha',mo:[5,6,7]},t:'Чавыча идёт на нерест летом — с июня по август.',s:'Википедия «Чавыча»'},
 {id:'f23',ty:'b',when:{fish:'amur'},t:'Белый амур питается преимущественно растительностью.',s:'Википедия «Белый амур»'},
 {id:'f24',ty:'f',when:{mo:[9]},t:'В октябре мирная рыба собирается в стаи и уходит к зимовальным ямам, а хищник собирается на русловых бровках.',s:'calend.ru (октябрь)'},
 {id:'f25',ty:'f',when:{mo:[11,0,1]},t:'С середины декабря на многих озёрах наступает «глухая» пора — в январе и феврале поклёвок заметно меньше.',s:'I, FW'},
 // народный календарь (про погоду и воду — так и подписано)
 {id:'c1',ty:'c',when:{date:['10-14','10-14']},t:'Покров: «До Покрова осень, за Покровом зима идёт».',s:'rybalka.com'},
 {id:'c2',ty:'c',when:{date:['04-15','04-15']},t:'Тит-ледолом: на реках ледоход.',s:'FW'},
 {id:'c3',ty:'c',when:{date:['04-10','04-16']},t:'Если до 16 апреля с водоёмов не сошёл лёд — рыба весь год не будет клевать.',s:'I, F'},
 {id:'c4',ty:'c',when:{date:['04-24','04-24']},t:'Антип-половод: если реки ещё не вскрылись — лето будет плохое.',s:'FW'},
 {id:'c5',ty:'c',when:{date:['08-02','08-02']},t:'2 августа — день остыва воды. Ясно — и осень будет ясной.',s:'FW'},
 {id:'c6',ty:'c',when:{date:['06-20','06-20']},t:'Федот грозами богат.',s:'FW'},
 // луна (в игре на клёв не влияет)
 {id:'m1',ty:'m',when:{moon:'new'},t:'Говорят, в новолуние клёв улучшается.',s:'I, F, FW'},
 {id:'m2',ty:'m',when:{moon:'full'},t:'Говорят, в полнолуние клёв слабый — зато щука и окунь берут лучше.',s:'E, F, FW'}];
var TY={n:['Народная примета','Folk sign'],f:['Рыбацкое наблюдение','Anglers\' wisdom'],b:['Повадки рыбы','Fish habits'],m:['Луна · примета, научно не подтверждено','Moon · folk belief, not proven'],c:['Народный календарь','Folk calendar']};
var TY_IC={n:'omen',f:'fish',b:'fish',m:'moon',c:'cal'};

// фаза луны (астрономия: от новолуния 06.01.2000 18:14 UTC, синодический месяц 29,530588 сут.)
function moonAge(ms){var d=(ms-Date.UTC(2000,0,6,18,14))/864e5;return ((d%29.530588)+29.530588)%29.530588;}
function moonOf(ms){var a=moonAge(ms);return a<1.5||a>28?'new':Math.abs(a-14.77)<1.5?'full':'';}
function inSeason(id,mo,open){var f=typeof FISH!=='undefined'&&FISH[id];if(!f||!f.a2||!(f.a2.m[mo]>=1.35))return false;
  for(var i=0;i<PLACES.length;i++)if((!open||S.open&&S.open[i])&&(PLACES[i].fish||[]).indexOf(id)>=0)return true;return false;}
function mmdd(ms){var d=new Date(ms),m=d.getMonth()+1,x=d.getDate();return (m<10?'0':'')+m+'-'+(x<10?'0':'')+x;}
// подходящие приметы к условиям c: {px, wx, tod, mo, ms, f (вид прогноза), open}
function match(o,c){var w=o.when;
  if(w.px&&w.px.indexOf(c.px)<0)return 0;if(w.wx&&w.wx.indexOf(c.wx)<0)return 0;if(w.tod&&w.tod.indexOf(c.tod)<0)return 0;
  if(w.mo&&w.mo.indexOf(c.mo)<0)return 0;if(w.moon&&moonOf(c.ms)!==w.moon)return 0;
  if(w.date){var t=mmdd(c.ms);if(t<w.date[0]||t>w.date[1])return 0;}
  if(w.fish&&!inSeason(w.fish,c.mo,c.open!==false))return 0;
  var sc=1;if(w.date)sc+=5;if(w.fish)sc+=w.fish===c.f?4:1.5;if(w.px)sc+=2;if(w.wx)sc+=1.5;if(w.tod)sc+=.5;if(w.moon)sc-=.3;return sc;}
function pick(c,n,seed){var R=rng((seed||M.dn())*131+7),out=[];OM.forEach(function(o){if(o.neg)return;var s=match(o,c);if(s>0)out.push([s+R()*1.2,o]);});
  out.sort(function(a,b){return b[0]-a[0];});var r=[],kinds={};for(var i=0;i<out.length&&r.length<n;i++){var o=out[i][1],k=o.id[0];if(kinds[k]>=2)continue;kinds[k]=(kinds[k]||0)+1;r.push(o);}return r;}
function ctxOf(fo,dn){var ms=dn*864e5+12*36e5;return {px:fo?fo.px:'',wx:fo?fo.wx:'',tod:fo?fo.t:'',mo:new Date(ms).getUTCMonth(),ms:ms,f:fo?fo.f:'',open:true};}
function row(o){var ic=TY_IC[o.ty];return '<div class="omr om-'+o.ty+'"><span class="omic">'+(ic==='omen'?M.MI('omen'):ic==='moon'?(window.LOOK?LOOK.I('moon'):'☾'):window.LOOK?LOOK.I(ic):'')+'</span><span><b>«'+esc(o.t)+'»</b><small>'+L(TY[o.ty][0],TY[o.ty][1])+'</small></span></div>';}

/* ---------- прогноз Петровича: блок «Приметы» ---------- */
var of0=openFore;
openFore=function(back){of0.apply(this,arguments);try{if(LANG==='en')return;var d0=dayNum(),fo=a3Fore(d0),ls=pick(ctxOf(fo,d0),3,d0);if(!ls.length)return;
  var mc=$('mcard'),rw=mc.querySelector('.row:last-of-type'),box=document.createElement('div');box.className='omb';
  box.innerHTML='<h3 class="omh">'+M.MI('omen')+' '+L('Приметы Петровича','Petrovich\'s signs')+'</h3>'+ls.map(row).join('')+'<button class="btn noenter omall" id="omAll">'+L('Все приметы месяца','All signs of the month')+'</button>';
  if(rw)rw.parentNode.insertBefore(box,rw);else mc.appendChild(box);M.stat('om','fore',{n:ls.length});
  $('omAll').onclick=function(){openOmens(function(){openFore(back);});};}catch(e){}};

/* ---------- окно «Народные приметы» ---------- */
function openOmens(back){var ms=nowMs(),mo=new Date(ms).getMonth(),c={px:'',wx:'',tod:'',mo:mo,ms:ms,f:'',open:false},ph=moonAge(ms);
  var list=OM.filter(function(o){var w=o.when;if(w.px||w.wx||w.tod&&!w.fish)return false;if(w.date){var t=mmdd(ms);return w.date[0].slice(0,2)===t.slice(0,2);}return match(o,c)>0||(w.moon&&true);});
  var gen=OM.filter(function(o){return o.when.px||o.when.wx;});
  M.stat('om','book',{});
  M.win('<div class="omscene" id="omScene"></div>'+M.head('omen',L('Народные приметы','Folk signs'),L(MON_N[mo][0][0].toUpperCase()+MON_N[mo][0].slice(1),MON_N[mo][1]))+
    '<h3 class="omh">'+L('Этот месяц','This month')+'</h3>'+list.filter(function(o){return !o.when.moon;}).map(row).join('')+
    '<h3 class="omh">'+L('Погода и давление','Weather and pressure')+'</h3>'+gen.map(row).join('')+
    '<h3 class="omh">'+L('Луна','The Moon')+' · '+moonTxt(ph)+'</h3>'+OM.filter(function(o){return o.when.moon;}).map(row).join('')+
    '<p class="about">'+L('Приметы собраны из народного календаря и справочников рыболова. Петрович проверяет их на своих водоёмах — и показывает только те, что сходятся с клёвом.','Signs come from the folk calendar and anglers\' handbooks.')+'</p>'+
    '<div class="row"><button class="btn" id="mCancel">'+L('Назад','Back')+'</button></div>');
  try{drawMoon($('omScene'),ph);}catch(e){}
  $('mCancel').onclick=back||hideModal;}
function moonTxt(a){return a<1.5||a>28?L('новолуние','new moon'):a<7.4?L('растущая','waxing'):a<13.3?L('растущая, почти полная','waxing gibbous'):a<16.3?L('полнолуние','full moon'):a<22.1?L('убывающая','waning'):L('старая луна','old moon');}
// сцена: ночное озеро, луна в настоящей фазе, дорожка на воде, камыш
function drawMoon(el,age){if(!el)return;var o=M.canv(el,120),g=o.g,W=o.W,H=o.H,hz=H*.62;
  var sk=g.createLinearGradient(0,0,0,hz);sk.addColorStop(0,'#0e1a33');sk.addColorStop(1,'#2a3d5e');g.fillStyle=sk;g.fillRect(0,0,W,hz);
  var R=rng(77);for(var i=0;i<50;i++){g.fillStyle='rgba(255,255,255,'+(.3+R()*.6)+')';g.fillRect(R()*W,R()*hz*.9,1.4,1.4);}
  var wt=g.createLinearGradient(0,hz,0,H);wt.addColorStop(0,'#1f3550');wt.addColorStop(1,'#0c1626');g.fillStyle=wt;g.fillRect(0,hz,W,H-hz);
  g.fillStyle='#16233a';g.beginPath();g.moveTo(0,hz);for(var x=0;x<=W;x+=20)g.lineTo(x,hz-6-8*Math.abs(Math.sin(x*.013))-4*Math.sin(x*.05));g.lineTo(W,hz);g.fill();
  var mx=W*.72,my=hz*.42,mr=Math.min(22,hz*.28),k=age/29.530588;
  var gl=g.createRadialGradient(mx,my,mr*.5,mx,my,mr*3);gl.addColorStop(0,'rgba(255,245,210,.35)');gl.addColorStop(1,'rgba(255,245,210,0)');g.fillStyle=gl;g.fillRect(mx-mr*3,my-mr*3,mr*6,mr*6);
  g.fillStyle='#2b3a55';g.beginPath();g.arc(mx,my,mr,0,7);g.fill();
  // освещённая часть: терминатор — эллипс с полуосью mr·cos(2πk)
  var c=Math.cos(2*Math.PI*k),wax=k<.5,lit='#fff3c9';g.fillStyle=lit;g.beginPath();g.arc(mx,my,mr,-Math.PI/2,Math.PI/2,!wax);g.closePath();g.fill();
  g.fillStyle=c>0?'#2b3a55':lit;g.beginPath();g.ellipse(mx,my,Math.max(.01,Math.abs(c)*mr),mr,0,0,7);g.fill();
  for(var y=hz+4;y<H;y+=5){var w=(1-(y-hz)/(H-hz))*mr*1.6+4;g.fillStyle='rgba(255,240,190,'+(.25*(1-(y-hz)/(H-hz))+.05)+')';g.fillRect(mx-w/2+Math.sin(y)*3,y,w,1.6);}
  g.strokeStyle='#0a1220';g.lineWidth=2;for(var r=0;r<9;r++){var rx=W*.06+r*7;g.beginPath();g.moveTo(rx,H);g.quadraticCurveTo(rx+3,H-30,rx+(r%2?6:-2),H-46-r%3*8);g.stroke();}}

/* ---------- «Цели дня»: примета дня ---------- */
slotAdd(dailySlots,{id:'meta-omen',pri:20,when:function(){return LANG!=='en'&&(S.sessions||0)>=1;},
  html:function(){var d0=dayNum(),fo=a3Fore(d0),ls=pick(ctxOf(fo,d0),1,d0+3);if(!ls.length)return '';
    return '<button class="mtslot omslot noenter" data-a="om">'+M.MI('omen','mtico')+'<span class="mtst"><b>'+L('Примета дня','Sign of the day')+'</b><small>«'+esc(ls[0].t)+'»</small></span>'+(window.LOOK?LOOK.I('fwd'):'›')+'</button>';},
  bind:function(el){el.querySelector('[data-a=om]').onclick=function(){openOmens(function(){openDaily();});};}});

M.omens={list:OM,pick:pick,open:openOmens,moon:moonAge,ctx:ctxOf,match:match};
})();
