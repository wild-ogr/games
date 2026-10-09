/* Дворовая викторина — СЕЗОНЫ, «АБОНЕМЕНТ», «УЗЕЛОК НОВИЧКА», НАБОРЫ ДВОРА, УКРАШЕНИЯ (поток YARD, 09.10.2026). Журнал: viktorina-boost/logs/YARD.md; 04 §2.5, §3.4.
   Сезон = календарный месяц по часам игрока (?date= для проверки): своё имя и оформление двора, дорожка 30 ступеней за «очки сезона».
   Очки сезона: верный ответ — цена/100 (1–5), до 120 в день; первый заход дня +10; итог лиги 40–100; круги кубка +20, кубок +80;
   задания/печати дня — от CAR (YARD.seasonAdd). Ступень = 60 очков (1800 за сезон: обычный игрок проходит дорожку к концу месяца).
   Нижняя дорожка — всем: ≈540 💰, 6 марок серии сезона, 2 украшения. Верхняя — «Абонемент» (15 голосов, на текущий сезон): 4 украшения двора,
   облик Михалыча (шапка на лавочке), рамка сезона, 6 марок, 500 💰. Купил в середине — всё набранное сразу доступно. Сезон кончился — незабранное
   выдаём сами при первом заходе нового сезона. Ничего, что влияет на ответы, не продаём.
   Покупки — через существующий PAY (модуль не трогаем): новые строки PAY_ITEMS/PAY_TEST отсюда: sea_pass (15 гол., расходуемый — на текущий сезон),
   uzelok (5 гол., навсегда, первые 3 дня, +300 💰 бонусом PAY), yd_moskvich (9), yd_fontan (11), yd_golub (9) — наборы украшений двора.
   Сохранение: S.sea {id 's202610', p очки, f/q маски забранных ступеней (низ/верх), a абонемент, d день захода, t/td очки ответов за день}, S.ydD/S.ydH/S.ydF/S.ydS (yard.js). */
(function(){
'use strict';
var YD=window.YD;if(!YD)return;
var esc=YD.esc,sv=YD.svg,R=sv.R,P=sv.P,C=sv.C,E=sv.E,T=sv.T,K=sv.K;
var STEP=60,STEPS=30,ANS_CAP=120;

/* ---------- рисунки украшений (свои), по местам: big — у подъезда слева, small — у лавочки, gar — гирлянда по фасаду,
   sky — над берёзой, wall — на стене у двери, ban — растяжка над подъездом ---------- */
var DR={
 elka:function(o){return P('M24 128 v-8',0,' stroke="#8a5a3a" stroke-width="4"')+P('M24 62 l16 22 h-8 l14 18 h-8 l12 18 h-48 l12 -18 h-8 l14 -18 h-8z','#2fa84f')+[[18,90,'#e5484d'],[30,98,'#ffcf40'],[20,108,'#3f8fe0'],[33,112,'#e5484d'],[25,80,'#ffcf40']].map(function(b){return C(b[0],b[1],2.6,b[2],' stroke="'+K+'" stroke-width="1"');}).join('')+P('M24 54 l2.6 5 5.4 .6 -4 3.6 1.2 5.4 -5.2 -2.8 -5.2 2.8 1.2 -5.4 -4 -3.6 5.4 -.6z','#ffcf40',' stroke="'+K+'" stroke-width="1.2"');},
 ryab:function(o){var c=o.c||'#e5484d',s=P('M24 128 v-40 M24 100 l-10 -10 M24 94 l10 -12',0,' stroke="#8a5a3a" stroke-width="3.4" stroke-linecap="round"')+E(24,78,20,18,o.l||'#f0a23a');for(var i=0;i<7;i++)s+=C(12+i*4,74+(i%3)*6,2.4,c,' stroke="'+K+'" stroke-width=".8"');return s;},
 siren:function(o){return P('M24 128 v-30',0,' stroke="#8a5a3a" stroke-width="3.4"')+E(24,86,19,16,'#5fbf5a')+[[14,80],[26,74],[34,86],[18,92],[28,92]].map(function(p){return E(p[0],p[1],5,6,o.c||'#b07ad6',' stroke="'+K+'" stroke-width="1"');}).join('');},
 apple:function(o){return P('M24 128 v-36',0,' stroke="#8a5a3a" stroke-width="3.6"')+E(24,82,20,17,'#5fbf5a')+[[14,80],[28,74],[33,88],[19,90]].map(function(p){return C(p[0],p[1],3,o.c||'#e5484d',' stroke="'+K+'" stroke-width="1"');}).join('');},
 rocket:function(o){return P('M24 62 q12 14 12 40 v22 h-24 v-22 q0 -26 12 -40z','#fffaf0')+C(24,88,5,'#3f8fe0')+P('M12 108 l-8 18 h8z M36 108 l8 18 h-8z','#e5484d')+P('M16 124 l8 6 l8 -6',o.c||'#ff7a1a')+R(14,70,20,4,'#e5484d',' stroke="none"');},
 tumba:function(o){return R(10,74,28,52,'#fffaf0',' stroke="'+K+'" stroke-width="2" rx="3"')+P('M8 74 h32 l-4 -8 h-24z',o.c||'#e5484d')+R(13,82,22,16,o.c||'#e5484d',' stroke="'+K+'" stroke-width="1.2"')+T(24,94,o.t||'КИНО',7,'#fff')+R(13,102,22,18,'#ffe9a8',' stroke="'+K+'" stroke-width="1.2"')+P('M16 108 h16 M16 113 h12',0,' stroke="'+K+'" stroke-width="1.2"');},
 chuch:function(o){return P('M24 128 v-60 M8 88 h32',0,' stroke="#8a5a3a" stroke-width="3"')+P('M14 96 h20 l6 28 h-32z',o.c||'#e5484d')+C(24,72,8,'#f2d48a')+P('M16 68 q8 -10 16 0 q-8 -4 -16 0z','#ffcf40')+C(21,72,1,K,'')+C(27,72,1,K,'')+P('M20 76 q4 3 8 0',0,' stroke="'+K+'" stroke-width="1"');},
 skvor:function(o){return P('M24 128 v-46',0,' stroke="#8a5a3a" stroke-width="3"')+R(14,66,20,20,o.c||'#e0a85a')+P('M10 68 l14 -12 l14 12z','#c9765a')+C(24,76,3.4,K,'')+sv.C(30,62,0,'none','')+'<g transform="translate(36 60)">'+YD.dove(0,0,-1)+'</g>';},
 fort:function(o){return P('M4 128 v-30 h8 v6 h8 v-6 h8 v6 h8 v-6 h8 v30z','#f4f8fb')+P('M8 112 h32 M8 120 h32 M18 104 v8 M30 112 v8 M14 120 v8',0,' stroke="#c4ced8" stroke-width="1.2"')+P('M24 98 v-14',0,' stroke="'+K+'" stroke-width="1.6"')+P('M24 84 h12 l-3 4 l3 4 h-12z',o.c||'#3f8fe0',' stroke="'+K+'" stroke-width="1.2"');},
 // маленькие у лавочки (x 124–146, низ 176)
 pump:function(){return YD.pumpkin(130,170,.9)+YD.pumpkin(142,172,.7);},
 sled:function(o){return P('M124 172 h24 q4 0 4 -4',0,' stroke="'+K+'" stroke-width="2.2"')+R(126,162,20,6,o.c||'#e5484d',' stroke="'+K+'" stroke-width="1.6" rx="2"')+P('M128 168 v4 M144 168 v4',0,' stroke="'+K+'" stroke-width="1.6"');},
 snow:function(){return YD.snowman(136,170);},
 samo:function(){return E(136,164,8,9,'#ffcf40')+R(130,154,12,4,'#ffcf40',' stroke="'+K+'" stroke-width="1.2"')+P('M144 162 l6 2',0,' stroke="'+K+'" stroke-width="2"')+R(131,172,10,4,'#b9783a',' stroke="'+K+'" stroke-width="1.2"')+E(136,151,4,2,'#e5484d',' stroke="'+K+'" stroke-width="1"');},
 flowr:function(o){return P('M128 176 h16 l-2 -10 h-12z','#c9765a')+P('M132 166 v-8 M136 166 v-10 M140 166 v-7',0,' stroke="#2fa84f" stroke-width="1.6"')+C(132,157,2.6,o.c||'#fff',' stroke="'+K+'" stroke-width=".8"')+C(136,155,2.8,o.c||'#fff',' stroke="'+K+'" stroke-width=".8"')+C(140,158,2.6,o.c||'#fff',' stroke="'+K+'" stroke-width=".8"');},
 ball:function(o){return C(136,168,7,o.c||'#e5484d')+P('M129 168 h14 M136 161 q-4 7 0 14',0,' stroke="#fff" stroke-width="1.6"');},
 melon:function(){return E(136,168,10,7,'#2fa84f')+P('M128 166 q8 -4 16 0 M127 170 q9 3 18 0',0,' stroke="#1d7a36" stroke-width="1.4"')+P('M146 172 l-6 -8 h10z','#e5484d',' stroke="'+K+'" stroke-width="1"');},
 portf:function(o){return R(126,160,20,15,o.c||'#c9765a',' stroke="'+K+'" stroke-width="1.8" rx="3"')+P('M132 160 q4 -6 8 0',0,' stroke="'+K+'" stroke-width="1.6"')+R(134,165,4,4,'#ffcf40',' stroke="'+K+'" stroke-width="1"');},
 reel:function(){return C(136,166,9,'#3a3a3a')+[0,1,2,3,4].map(function(i){var a=i*1.256;return C(136+Math.cos(a)*5,166+Math.sin(a)*5,1.8,'#fffaf0','');}).join('')+C(136,166,1.6,'#ffcf40','');},
 // гирлянда по фасаду (между 1 и 2 этажом)
 flags:function(o){var c=o.cs||['#ff7a1a','#ffcf40','#3f8fe0','#2fa84f','#e5484d'],s=P('M4 52 q75 10 150 0 q75 10 150 0',0,' stroke="'+K+'" stroke-width="1.2"');for(var i=0;i<20;i++){var x=8+i*15,y=52+Math.sin((x%150)/150*Math.PI)*5;s+=P('M'+x+' '+y+' l8 0 l-4 8z',c[i%c.length],' stroke="'+K+'" stroke-width=".8"');}return s;},
 lights:function(o){var c=o.cs||['#e5484d','#ffcf40','#3f8fe0','#2fa84f'],s=P('M4 54 q75 8 150 0 q75 8 150 0',0,' stroke="'+K+'" stroke-width="1"');for(var i=0;i<26;i++){var x=6+i*11.5,y=54+Math.sin((x%150)/150*Math.PI)*4;s+=C(x,y+2.6,2.2,c[i%c.length],' stroke="'+K+'" stroke-width=".6"');}return s;},
 // в небе над берёзой
 kite:function(o){return P('M336 6 l10 10 l-10 14 l-10 -14z',o.c||'#ff7a1a')+P('M336 6 v24 M326 16 h20',0,' stroke="'+K+'" stroke-width="1"')+P('M336 30 q-6 10 2 16 q-8 6 -2 14',0,' stroke="'+K+'" stroke-width="1"')+P('M335 38 l-4 2 l4 2z M337 50 l-4 2 l4 2z','#e5484d',' stroke="none"');},
 star:function(o){return P('M340 4 l4 9 10 1.4 -7.4 6.8 2 10 -8.6 -5 -8.6 5 2 -10 -7.4 -6.8 10 -1.4z',o.c||'#ffcf40');},
 balls:function(o){var c=o.cs||['#e5484d','#3f8fe0','#ffcf40'];return P('M330 42 l-4 -14 M336 42 l2 -18 M342 42 l8 -14',0,' stroke="'+K+'" stroke-width=".9"')+E(326,22,6,7.4,c[0])+E(338,16,6,7.4,c[1])+E(350,24,6,7.4,c[2]);},
 flake:function(){return '<g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M340 4 v28 M328 11 l24 14 M328 25 l24 -14"/></g>';},
 // на стене слева от двери (x 6–44, y 94–124)
 wreath:function(o){return C(25,108,11,'none',' stroke="'+(o.c||'#2fa84f')+'" stroke-width="6"')+C(25,108,11,'none',' stroke="'+K+'" stroke-width="1" stroke-dasharray="2 3"')+P('M21 120 l4 -4 l4 4',o.c2||'#e5484d',' stroke="'+K+'" stroke-width="1"');},
 poster:function(o){return R(8,94,34,28,'#fffaf0',' stroke="'+K+'" stroke-width="1.6"')+R(11,97,28,12,o.c||'#3f8fe0',' stroke="none"')+T(25,106,o.t||'★',8,'#fff')+P('M12 113 h26 M12 117 h18',0,' stroke="'+K+'" stroke-width="1.1"');},
 // растяжка над подъездом
 ban:function(o){var t=String(o.t||''),fit=t.length>11?' textLength="62" lengthAdjust="spacingAndGlyphs"':'';return P('M95 94 h74',0,' stroke="'+K+'" stroke-width="1"')+R(98,95,68,13,o.c||'#ff7a1a',' stroke="'+K+'" stroke-width="1.4" rx="2"')+T(132,104.6,esc(t),8,o.ink||'#fff',fit);}};
// место украшения → слой сцены (z): 0 — до построек (стена, гирлянда, небо, большое у подъезда), 1 — после (у лавочки)
var SLOT={big:0,small:1,gar:0,sky:0,wall:0,ban:0};

/* ---------- 12 сезонов (месяц → тема, оформление, украшения, облик Михалыча) ---------- */
var SEA={
 10:{n:'Золотая осень',ic:'🍂',c:'#f08a24',mih:'beret',hint:'листопад, рябина и тыквы',d:{ban:['ban',{t:'Золотая осень',c:'#f08a24'}],small:['pump',{}],big:['ryab',{}],gar:['flags',{cs:['#f08a24','#ffcf40','#d9622b','#8a5a3a']}],sky:['kite',{c:'#f08a24'}],wall:['wreath',{c:'#f0a23a',c2:'#d9622b'}]}},
 11:{n:'Кино и мультфильмы',ic:'🎬',c:'#e5484d',mih:'cap',hint:'афишная тумба и кинолента',d:{ban:['ban',{t:'Кино во дворе',c:'#e5484d'}],small:['reel',{}],big:['tumba',{t:'КИНО',c:'#e5484d'}],gar:['lights',{cs:['#ffcf40','#fff3b0']}],sky:['star',{}],wall:['poster',{t:'СЕАНС',c:'#7b4fb8'}]}},
 12:{n:'Новогодний двор',ic:'🎄',c:'#2fa84f',mih:'santa',hint:'ёлка, санки и гирлянда',d:{ban:['ban',{t:'С Новым годом!',c:'#e5484d'}],small:['sled',{}],big:['elka',{}],gar:['lights',{}],sky:['star',{}],wall:['wreath',{}]}},
 1:{n:'Зимние забавы',ic:'⛄',c:'#3f8fe0',mih:'ushanka',hint:'снежная крепость и снеговик',d:{ban:['ban',{t:'Зимние забавы',c:'#3f8fe0'}],small:['snow',{}],big:['fort',{}],gar:['lights',{cs:['#fff','#bfe0f2']}],sky:['flake',{}],wall:['poster',{t:'КАТОК',c:'#3f8fe0'}]}},
 2:{n:'Масленица',ic:'🥞',c:'#ffcf40',mih:'ushanka',hint:'чучело, самовар и блины',d:{ban:['ban',{t:'Широкая Масленица',c:'#e0a800',ink:'#3b2a00'}],small:['samo',{}],big:['chuch',{}],gar:['flags',{cs:['#e5484d','#2fa84f','#ffcf40']}],sky:['balls',{}],wall:['poster',{t:'БЛИНЫ',c:'#e0a800'}]}},
 3:{n:'Весна',ic:'🌷',c:'#2fa84f',mih:'cap',hint:'скворечник и подснежники',d:{ban:['ban',{t:'Весна пришла!',c:'#2fa84f'}],small:['flowr',{c:'#fff'}],big:['skvor',{}],gar:['flags',{cs:['#ffd6e0','#bfe8c8','#fff3b0','#cfe8f6']}],sky:['kite',{c:'#2fa84f'}],wall:['wreath',{c:'#5fbf5a',c2:'#ffcf40'}]}},
 4:{n:'Космос',ic:'🚀',c:'#3f6fb5',mih:'cap',hint:'ракета-горка и звёзды',d:{ban:['ban',{t:'Поехали!',c:'#233247'}],small:['ball',{c:'#3f8fe0'}],big:['rocket',{}],gar:['lights',{cs:['#ffcf40','#fff']}],sky:['star',{}],wall:['poster',{t:'КОСМОС',c:'#3f6fb5'}]}},
 5:{n:'Сирень цветёт',ic:'💐',c:'#b07ad6',mih:'straw',hint:'сирень и воздушные шары',d:{ban:['ban',{t:'Сирень цветёт',c:'#b07ad6'}],small:['flowr',{c:'#b07ad6'}],big:['siren',{}],gar:['flags',{cs:['#b07ad6','#fff','#2fa84f']}],sky:['balls',{}],wall:['wreath',{c:'#b07ad6',c2:'#2fa84f'}]}},
 6:{n:'Лето во дворе',ic:'☀️',c:'#ff7a1a',mih:'straw',hint:'мяч, воздушный змей и яблоня',d:{ban:['ban',{t:'Лето во дворе',c:'#ff7a1a'}],small:['ball',{}],big:['apple',{}],gar:['flags',{}],sky:['kite',{c:'#3f8fe0'}],wall:['poster',{t:'ЛЕТО',c:'#ff7a1a'}]}},
 7:{n:'Дачный сезон',ic:'🥕',c:'#5fbf5a',mih:'straw',hint:'арбуз, яблоня и шарики',d:{ban:['ban',{t:'Дачный сезон',c:'#5fbf5a'}],small:['melon',{}],big:['apple',{c:'#ffcf40'}],gar:['flags',{cs:['#5fbf5a','#ffcf40','#e5484d']}],sky:['balls',{cs:['#2fa84f','#ffcf40','#e5484d']}],wall:['wreath',{c:'#5fbf5a'}]}},
 8:{n:'Звездопад',ic:'🌠',c:'#233247',mih:'cap',hint:'афиша, звёзды и арбуз',d:{ban:['ban',{t:'Звездопад',c:'#233247'}],small:['melon',{}],big:['tumba',{t:'ЛЕТО',c:'#3f6fb5'}],gar:['lights',{cs:['#ffcf40','#fff']}],sky:['star',{c:'#fff3b0'}],wall:['poster',{t:'АВГУСТ',c:'#233247'}]}},
 9:{n:'Снова в школу',ic:'🎒',c:'#c9765a',mih:'beret',hint:'портфель, шары и рябина',d:{ban:['ban',{t:'Снова в школу',c:'#c9765a'}],small:['portf',{}],big:['ryab',{c:'#e5484d',l:'#5fbf5a'}],gar:['flags',{cs:['#e5484d','#fff','#3f8fe0']}],sky:['balls',{}],wall:['poster',{t:'1 СЕНТ',c:'#c9765a'}]}}};
YD.SEA=SEA;
// какие места на какой дорожке: низ — ban (ступень 30), small (ступень 10); верх — big, gar, sky, wall
function seaOf(id){var m=+String(id).slice(-2);return SEA[m]||SEA[10];}
function decId(id,slot){return id+'-'+slot;}
// регистрируем украшения всех 12 сезонов (и для купленных в прошлые годы — тот же id месяца года)
function regSeason(id){var s=seaOf(id);regCoin(id);Object.keys(s.d).forEach(function(slot){var k=decId(id,slot),dd=s.d[slot];if(YD.DEC[k])return;
  YD.DEC[k]={n:decName(slot,s),z:SLOT[slot],slot:slot,d:function(){return '<g class="yddec">'+DR[dd[0]](dd[1]||{})+'</g>';}};});}
// FIX1 (AUD-ECO 4, владелец 09.10): 4 украшения сезона ЗА МОНЕТЫ (сток монет) — те же рисунки сезона, но в других местах двора; цены 300/400/500/600
var CDEC=[{slot:'small',c:300,n:'Ещё одно у дорожки',tr:'translate(186 66)',z:1},{slot:'sky',c:400,n:'Ещё одно в небе',tr:'translate(-24 2)',z:2},
  {slot:'wall',c:500,n:'Украшение на фасад',tr:'translate(244 -34)',z:0},{slot:'big',c:600,n:'Большое у клумбы',tr:'translate(250 112)',z:1}];
function cdecId(id,i){return id+'-m'+i;}
function regCoin(id){var s=seaOf(id);CDEC.forEach(function(c,i){var k=cdecId(id,i),dd=s.d[c.slot];if(YD.DEC[k]||!dd)return;
  YD.DEC[k]={n:c.n+' ('+s.n+')',z:c.z,slot:'m'+i,d:function(){return '<g class="yddec" transform="'+c.tr+'">'+DR[dd[0]](dd[1]||{})+'</g>';}};});}
function coinBuy(i){var id=S.sea.id,c=CDEC[i],k=cdecId(id,i);regCoin(id);if(!c||YD.decOwned().indexOf(k)>=0)return false;if(!YD.spend(c.c,'sea-dec'))return false;YD.addDec(k);YD.save();YD.ev('ss',{s:id,cd:i,c:c.c});return true;}
function decName(slot,s){return {ban:'Растяжка «'+s.n+'»',small:'Мелочь у лавочки',big:'Большое у подъезда',gar:'Гирлянда на дом',sky:'Над берёзой',wall:'Украшение у двери'}[slot]+' ('+s.n+')';}
YD.seaId=function(t){return 's'+YD.mon(t);};

/* ---------- облик Михалыча (шапка на лавочке; наружу — YARD.mihLook()) ---------- */
var HAT={beret:function(){return E(69,121,13,4.6,'#7b4fb8')+C(69,117,1.6,K,'');},cap:function(){return P('M56 124 q13 -12 26 0z','#3f6fb5')+P('M80 123 h8 q0 3 -6 3z','#3f6fb5');},
 santa:function(){return P('M55 125 q14 -20 28 0z','#e5484d')+C(86,121,3.2,'#fff')+R(53,123,32,5,'#fff',' stroke="'+K+'" stroke-width="1.2" rx="2.5"');},
 ushanka:function(){return P('M55 126 q14 -16 28 0z','#8a5a3a')+R(52,124,8,12,'#8a5a3a',' stroke="'+K+'" stroke-width="1.2" rx="3"')+R(78,124,8,12,'#8a5a3a',' stroke="'+K+'" stroke-width="1.2" rx="3"')+R(56,121,26,5,'#c9a77a',' stroke="'+K+'" stroke-width="1.2" rx="2"');},
 straw:function(){return E(69,125,19,3.4,'#f2d48a')+P('M60 125 q9 -12 18 0z','#f2d48a')+R(60,121,18,3,'#e5484d',' stroke="none"');}};
YD.mihLook=function(){var a=(S.ydS||[]).filter(function(x){return /^s\d{6}$/.test(x);}).sort();if(!a.length)return '';var cur=YD.seaId();return a.indexOf(cur)>=0?seaOf(cur).mih:seaOf(a[a.length-1]).mih;};
YD.DEC['mih']={n:'Облик Михалыча',z:2,d:function(){var h=YD.mihLook();return h&&HAT[h]&&YD.lv(0)?'<g class="yddec">'+HAT[h]()+'</g>':'';}};

/* ---------- наборы двора за голоса и узелок ---------- */
var SETS={
 yd_moskvich:{n:'«Москвич» у подъезда',ic:'🚗',vk:9,d:function(){return '<g class="yddec" transform="translate(236 0)">'+P('M98 196 v-10 q0 -6 6 -7 l8 -10 q2 -2 6 -2 h20 q4 0 6 3 l7 9 q8 1 8 8 v9z','#e5484d')+P('M114 180 l6 -7 h8 v7z M132 180 v-7 h7 l5 7z','#bfe0f2',' stroke="'+K+'" stroke-width="1.4"')+C(110,197,6,'#3a3a3a')+C(146,197,6,'#3a3a3a')+C(110,197,2.2,'#c9d2da','')+C(146,197,2.2,'#c9d2da','')+R(151,186,5,3,'#ffcf40',' stroke="'+K+'" stroke-width="1"')+'</g>';},
   desc:'Красный «Москвич» во дворе, ведро и тряпка. Навсегда'},
 yd_fontan:{n:'Фонтан во дворе',ic:'⛲',vk:11,d:function(){return '<g class="yddec">'+E(300,246,34,9,'#c9d2da')+E(300,244,28,6,'#8fd3f4',' stroke="'+K+'" stroke-width="1.4"')+R(296,222,8,22,'#c9d2da',' stroke="'+K+'" stroke-width="1.6"')+E(300,222,12,4,'#c9d2da')+
   P('M300 220 q-12 -16 -22 6 M300 220 q12 -16 22 6 M300 220 v-14',0,' stroke="#3f8fe0" stroke-width="2" stroke-linecap="round" class="ydjet"')+C(300,205,2.4,'#bfe0f2','')+'</g>';},desc:'Фонтан с чашей посреди двора — брызги видно всем. Навсегда'},
 yd_golub:{n:'Голубиная почта',ic:'✉️',vk:9,d:function(){return '<g class="yddec">'+R(96,96,16,14,'#3f8fe0',' stroke="'+K+'" stroke-width="1.6" rx="2"')+R(99,99,10,2,K,'')+T(104,108,'✉',6,'#fff')+YD.dove(118,180,1)+YD.dove(132,182,-1)+YD.dove(126,178,1)+
   '<g transform="translate(150 60)">'+YD.dove(0,0,1)+R(-3,2,6,4,'#fffaf0',' stroke="'+K+'" stroke-width=".8"')+'</g></g>';},desc:'Почтовый ящик у подъезда и голуби-почтальоны. Навсегда'}};
var UZ={k:'uzelok',dec:'uz-klumba'};
YD.DEC['uz-klumba']={n:'Клумба «Новосёл»',z:1,d:function(){return '<g class="yddec">'+E(20,186,17,7,'#8a5a3a')+[[10,182,'#e5484d'],[16,179,'#ffcf40'],[22,182,'#fff'],[28,179,'#e5484d'],[33,183,'#ffcf40']].map(function(f){return C(f[0],f[1],2.8,f[2],' stroke="'+K+'" stroke-width=".8"');}).join('')+'</g>';}};
Object.keys(SETS).forEach(function(k){YD.DEC[k]={n:SETS[k].n,z:1,d:SETS[k].d};});
// флаг за 30-й день серии входа (CAR → YARD.gift('deco'))
YD.DEC['car-flag']={n:'Флаг «Образцовый жилец»',z:0,d:function(){return '<g class="yddec">'+P('M258 186 v-84',0,' stroke="'+K+'" stroke-width="2.6"')+C(258,101,2.4,'#ffcf40',' stroke="'+K+'" stroke-width="1"')+P('M259 104 q10 -4 20 0 q10 4 20 0 v16 q-10 4 -20 0 q-10 -4 -20 0z','#e5484d',' stroke="'+K+'" stroke-width="1.4"')+P('M272 108 l2 4 4 .5 -3 2.6 .8 4 -3.6 -2 -3.6 2 .8 -4 -3 -2.6 4 -.5z','#ffcf40','')+'</g>';}};

/* ---------- покупки: строки PAY_ITEMS (модуль PAY не трогаем) ---------- */
function addItems(){try{if(typeof PAY_ITEMS!=='object')return;
  PAY_ITEMS.sea_pass={vk:15,ic:'🎫',name:'«Абонемент» сезона',desc:'Верхняя дорожка текущего сезона: украшения двора, облик Михалыча, рамка, 6 марок, 500 💰',done:'«Абонемент» твой — забирай награды верхней дорожки!',give:function(){passGive();}};
  PAY_ITEMS.uzelok={perm:1,bonus:300,vk:5,ic:'🎒',name:'Узелок новичка',desc:'300 💰, рамка «Новосёл», 3 марки и клумба во двор. Один раз',done:'Узелок развязан: +300 💰, рамка, марки и клумба!',give:function(){uzGive();}};
  Object.keys(SETS).forEach(function(k){var s=SETS[k];PAY_ITEMS[k]={perm:1,vk:s.vk,ic:s.ic,name:'Набор двора: '+s.n,desc:s.desc,done:s.n+' — уже во дворе!',give:function(){YD.addDec(k);YD.save();}};});
  if(typeof PAY_TEST==='object'){PAY_TEST.sea_pass=99;PAY_TEST.uzelok=39;PAY_TEST.yd_moskvich=69;PAY_TEST.yd_fontan=79;PAY_TEST.yd_golub=69;}}catch(e){YD.err('pay',e);}}
addItems();
function payOn(id){try{return typeof PAY==='object'&&PAY.on&&!!PAY.item(id)&&!(typeof OK!=='undefined'&&OK)&&!(typeof inGame==='function'&&inGame());}catch(e){return false;}}
function payPrice(id){try{return PAY.price(PAY.item(id));}catch(e){return '';}}
function payBuy(id){try{STAT.offer(id);}catch(e){}try{PAY.re=function(){YD.render();};PAY.buy(id);}catch(e){}}
// постоянные покупки, выданные до загрузки этого файла (восстановление): украшения по флагам S.buy
function syncOwned(){try{Object.keys(SETS).forEach(function(k){if(S.buy&&S.buy[k])YD.addDec(k);});if(S.buy&&S.buy.uzelok)uzGive(true);}catch(e){}}

/* ---------- сезон: сохранение ---------- */
function blank(id){return {id:id,p:0,f:0,q:0,a:0,d:0,t:0,td:0};}
YD.fix(function(){var s=S.sea;if(!YD.isO(s)||typeof s.id!=='string'||!/^s\d{6}$/.test(s.id))S.sea=s=blank(YD.seaId());
  ['p','f','q','a','d','t','td'].forEach(function(k){if(typeof s[k]!=='number'||!(s[k]>=0))s[k]=0;});});
YD.merge(function(loc,d){var a=loc.sea,b=d.sea;if(!YD.isO(b)||typeof b.id!=='string')return;if(!YD.isO(a)||b.id>a.id){S.sea=b;return;}if(b.id<a.id){S.sea=a;return;}
  var o=S.sea=a;o.p=Math.max(o.p||0,b.p||0);o.f=(o.f||0)|(b.f||0);o.q=(o.q||0)|(b.q||0);o.a=Math.max(o.a||0,b.a||0);o.d=Math.max(o.d||0,b.d||0);if(b.td===o.td)o.t=Math.max(o.t||0,b.t||0);else if((b.td||0)>(o.td||0)){o.td=b.td;o.t=b.t||0;}});

/* ---------- дорожка: что на каждой ступени ---------- */
// низ: c — монеты, s — марка (номер в серии сезона 0–5), d — украшение (место)
var FREE={1:{c:20},3:{s:0},5:{c:40},7:{c:40},8:{s:1},10:{d:'small'},12:{c:50},13:{s:2},15:{c:60},18:{s:3},20:{c:70},22:{c:70},23:{s:4},25:{c:80},27:{s:5},28:{c:110},30:{d:'ban'}};
var PAID={1:{s:6},2:{c:50},4:{d:'wall'},6:{s:7},8:{c:50},10:{d:'gar'},11:{s:8},13:{c:50},16:{s:9},18:{m:1},20:{c:100},21:{s:10},22:{d:'sky'},24:{c:100},26:{s:11},27:{d:'big'},30:{f:1,c:150}};
YD.SEAFREE=FREE;YD.SEAPAID=PAID;
function rewTxt(r,s){if(!r)return '';if(r.c&&r.f)return 'Рамка сезона и '+YD.ct(r.c);if(r.c)return '+'+YD.ct(r.c);if(r.s!=null)return 'Марка «'+s.names[r.s]+'»';
  if(r.d)return decName(r.d,seaOf(S.sea.id)).replace(/ \(.*\)$/,'');if(r.m)return 'Облик Михалыча';return '';}
function rewIc(r){return !r?'':r.c&&!r.f?'':r.s!=null?'📮':r.d?'🎀':r.m?'🎩':r.f?'🖼️':'';}
function seaSer(id){var k=id,s=YD.ser(k);if(s)return s;var S0=seaOf(id),y=String(id).slice(1,5);
  s={k:k,n:S0.n+' '+y,ic:S0.ic,cnt:12,sea:id,col:[S0.c,'#fff7e8'],names:['Первый лист','Сосед с газетой','Двор утром','Лавочка','Окно','Подъезд','Абонемент №1','Абонемент №2','Абонемент №3','Абонемент №4','Абонемент №5','Абонемент №6'].map(function(x,i){return i<6?S0.n+' · '+(i+1):'Абонемент · '+(i-5);}),
    how:function(i){var st=0,src=i<6?FREE:PAID,ii=i<6?i:i;for(var k2 in src)if(src[k2].s===i)st=+k2;return (i<6?'Ступень ':'«Абонемент», ступень ')+st+' дорожки сезона «'+S0.n+'»';},
    sell:null,paid:false,draw:function(i){return '<text x="30" y="41" font-size="24" text-anchor="middle">'+S0.ic+'</text>';}};
  YD.addSeries(s);return s;}
function stepOf(p){return Math.min(STEPS,Math.floor((p||0)/STEP));}
function give(r,id,paid){if(!r)return;var ser=seaSer(id);
  if(r.c)YD.give(r.c,'quest');if(r.s!=null)YD.stampGive(id,r.s,'sea');if(r.d){regSeason(id);YD.addDec(decId(id,r.d));}
  if(r.m){if(S.ydS.indexOf(id)<0)S.ydS.push(id);YD.addDec('mih');}if(r.f){if(S.ydF.indexOf('sea-'+id)<0)S.ydF.push('sea-'+id);}}
function claim(i,paid){var s=S.sea,bit=1<<(i-1),src=paid?PAID:FREE;if(!src[i]||stepOf(s.p)<i)return false;if(paid&&!s.a)return false;
  if((paid?s.q:s.f)&bit)return false;if(paid)s.q|=bit;else s.f|=bit;give(src[i],s.id,paid);YD.ev('ss',{s:s.id,i:i,u:paid?1:0});return true;}
function claimAll(){var n=0;YD.quiet=true;try{for(var i=1;i<=STEPS;i++){if(claim(i,false))n++;if(claim(i,true))n++;}}finally{YD.quiet=false;}YD.save();return n;}
function canClaim(){var s=S.sea,st=stepOf(s.p);for(var i=1;i<=st;i++){if(FREE[i]&&!(s.f&(1<<(i-1))))return true;if(s.a&&PAID[i]&&!(s.q&(1<<(i-1))))return true;}return false;}
YD.seaDot=canClaim;
// смена месяца: незабранное — выдаём, новый сезон
function rollSeason(){var id=YD.seaId(),s=S.sea;if(s.id===id)return;if(s.id<id){var n=claimAll();if(n)YD.toast('Сезон «'+seaOf(s.id).n+'» закончился — награды ('+n+') уже твои!',3400);
  YD.ev('ss',{s:s.id,end:stepOf(s.p),u:s.a});}S.sea=blank(id);regSeason(id);seaSer(id);YD.save();}
function add(n,why){if(!(n>0))return;rollSeason();var s=S.sea,st0=stepOf(s.p);s.p+=Math.round(n);var st=stepOf(s.p);
  if(st>st0&&!YD.quiet){YD.toast('📅 Сезон: ступень '+st+'!'+(FREE[st]||(s.a&&PAID[st])?' Награда ждёт во дворе.':''),2600);}YD.save();}
YD.seasonAdd=add;window.SEASON_ADD=add;
YD.onAnswer(function(a){if(!a.ok)return;rollSeason();var s=S.sea,dn=YD.dayNo();if(s.td!==dn){s.td=dn;s.t=0;}if(s.t>=ANS_CAP)return;var n=Math.max(1,Math.min(5,Math.round((a.price||100)/100)));n=Math.min(n,ANS_CAP-s.t);s.t+=n;add(n,'ans');});
function daily(){rollSeason();var s=S.sea,dn=YD.dayNo();if(s.d===dn)return;s.d=dn;YD.quiet=true;try{add(10,'day');}finally{YD.quiet=false;}}
function passGive(){rollSeason();var s=S.sea;s.a=1;YD.save();YD.ev('ss',{s:s.id,buy:1,i:stepOf(s.p)});}
function uzGive(silent){var had=S.ydD.indexOf(UZ.dec)>=0;YD.addDec(UZ.dec);if(S.ydF.indexOf('novosel')<0)S.ydF.push('novosel');
  if(!had){YD.quiet=true;try{var n=0;['ussr','kino','kitchen','geo','nature','space'].forEach(function(t){if(n<3&&YD.ser(t)){for(var i=0;i<8&&n<3;i++){if(!YD.has(t,i)){YD.stampGive(t,i,'uz');n++;break;}}}});}finally{YD.quiet=false;}}
  YD.save();}
function uzOffer(){return !(S.buy&&S.buy.uzelok)&&YD.dayNo()-(S.ydT0||YD.dayNo())<3;}

/* ---------- вкладка «Сезон» ---------- */
function daysLeft(){var d=YD.date(),e=new Date(d.getFullYear(),d.getMonth()+1,1);return Math.max(1,Math.ceil((e-d)/864e5));}
function render(el){rollSeason();var s=S.sea,S0=seaOf(s.id),st=stepOf(s.p),ser=seaSer(s.id),dl=daysLeft(),h='';
  h+='<div class="seah" style="--sc:'+S0.c+'"><span class="seaic">'+S0.ic+'</span><div><b>Сезон «'+S0.n+'»</b><small>до конца сезона '+dl+' '+YD.pl(dl,'день','дня','дней')+' · во дворе: '+S0.hint+'</small></div></div>';
  h+='<div class="seapr"><div class="seast"><b>'+st+'</b><small>ступень<br>из '+STEPS+'</small></div><div class="seabw"><div class="ydbar"><i style="width:'+(st>=STEPS?100:Math.round((s.p%STEP)/STEP*100))+'%"></i></div><small>'+(st>=STEPS?'Дорожка пройдена! Очков сезона: '+s.p:'до следующей ступени '+(STEP-s.p%STEP)+' '+YD.pl(STEP-s.p%STEP,'очко','очка','очков')+' · сегодня за ответы '+(s.td===YD.dayNo()?s.t:0)+' из '+ANS_CAP)+'</small></div></div>';
  if(canClaim())h+='<div class="row"><button class="btn accent noenter" id="seaAll">🎁 Забрать всё</button></div>';
  // абонемент
  var hideP=!s.a&&!payOn('sea_pass'),lastD=dl<=1; // FIX1 (AUD-ADS 1–2): нет покупок (ОК, Яндекс без товара) — платного не показываем; последний день месяца — не продаём
  if(!s.a&&!hideP&&lastD)h+='<p class="goal">⭐ «Абонемент» нового сезона «'+seaOf(YD.seaId(new Date(YD.date().getFullYear(),YD.date().getMonth()+1,1).getTime())).n+'» — с 1-го числа.</p>';
  else if(!s.a&&!hideP){var pv=true;h+='<div class="seapass"><b>⭐ «Абонемент» сезона</b><small>Верхняя дорожка: 4 украшения двора «'+S0.n+'», облик Михалыча, рамка, 6 марок и 500 💰. Купишь позже — всё набранное откроется сразу.</small>'+
    (pv?'<button class="btn gold noenter" id="seaBuy">Открыть · '+payPrice('sea_pass')+'</button>':'')+'</div>';}
  else if(s.a)h+='<p class="goal">⭐ «Абонемент» сезона у тебя — верхняя дорожка открыта.</p>';
  // дорожка
  // украшения сезона за монеты
  regCoin(s.id);h+='<div class="ydsets seacd"><h3>🎀 Украшения сезона за монеты</h3>'+CDEC.map(function(c,i){var k=cdecId(s.id,i),own=YD.decOwned().indexOf(k)>=0,can=YD.coins()>=c.c;
    return '<div class="ydset"><span class="ydsetp">'+decPreview(k)+'</span><span><b>'+esc(YD.DEC[k]?YD.DEC[k].n:c.n)+'</b><small>'+(own?'уже во дворе':'только в этом сезоне')+'</small></span>'+(own?'<i class="seacdok">✓</i>':'<button class="btn '+(can?'accent':'')+' noenter" data-cd="'+i+'"'+(can?'':' aria-disabled="true"')+'>'+YD.ct(c.c)+'</button>')+'</div>';}).join('')+'</div>';
  h+='<div class="seatr'+(hideP?' nopaid':'')+'"><div class="seatrh"><span></span><b>'+(hideP?'Награды':'Всем')+'</b>'+(hideP?'':'<b>Абонемент</b>')+'</div>';
  for(var i=1;i<=STEPS;i++){var f=FREE[i],p=PAID[i],bit=1<<(i-1),got=st>=i;
    var cell=function(r,paid){if(!r)return '<span class="seac empty"></span>';var taken=(paid?s.q:s.f)&bit,can=got&&!taken&&(!paid||s.a);
      var prev='';if(r.d){regSeason(s.id);var dd=YD.DEC[decId(s.id,r.d)];}
      return '<button class="seac'+(taken?' tk':'')+(can?' can':'')+(paid&&!s.a?' lock':'')+' noenter" data-i="'+i+'" data-u="'+(paid?1:0)+'"'+(can?'':' tabindex="-1"')+'><span>'+(r.s!=null?YD.stampSvg(ser,r.s,true,26):rewIc(r))+'</span><em>'+esc(rewTxt(r,ser))+'</em><i>'+(taken?'✓':can?'Забрать':paid&&!s.a?'🔒':'')+'</i></button>';};
    h+='<div class="seat'+(got?' got':'')+(i===st+1?' nx':'')+'"><b class="sean">'+i+'</b>'+cell(f,false)+(hideP?'':cell(p,true))+'</div>';}
  h+='</div><p class="ydnote">Очки сезона: верный ответ — 1–5 (по цене вопроса, до '+ANS_CAP+' в день), первый заход дня — 10, лига и кубок — бонусом. Ступень — '+STEP+' очков. Сезон меняется в первый день месяца; незабранное выдаётся само.</p>';
  el.innerHTML=h;
  if(YD.Q('seaAll'))YD.Q('seaAll').onclick=function(){var n=claimAll();if(n){YD.snd('coin');YD.toast('Забрано наград: '+n);try{FX.burst(.5,.3,24,'coin');}catch(e){}}YD.render();};
  if(YD.Q('seaBuy'))YD.Q('seaBuy').onclick=function(){payBuy('sea_pass');};
  el.querySelectorAll('[data-cd]').forEach(function(b){b.onclick=function(){var i=+b.dataset.cd,c=CDEC[i];if(YD.coins()<c.c){YD.toast('Не хватает монет: нужно '+YD.ct(c.c));return;}if(coinBuy(i)){YD.toast('🎀 Украшение во дворе!');YD.render();}};});
  el.querySelectorAll('.seac.can').forEach(function(b){b.onclick=function(){if(claim(+b.dataset.i,b.dataset.u==='1')){YD.save();YD.snd('coin');YD.render();}};});}
YD.tab({id:'season',n:'Сезон',ic:'📅',o:30,render:render,sub:function(){return seaOf(S.sea.id).n;},dot:canClaim});
YD.homeLine({pri:30,f:function(){var s=S.sea;return {ic:seaOf(s.id).ic,t:canClaim()?'Сезон: награда ждёт — забери!':'Сезон «'+seaOf(s.id).n+'»: ступень '+stepOf(s.p)+' из '+STEPS,a:'season'};}});
YD.homeLine({pri:5,f:function(){return uzOffer()&&payOn('uzelok')?{ic:'🎒',t:'Узелок новичка — 300 💰 и клумба',a:'yard'}:null;}});

/* ---------- во вкладке «Двор»: узелок, наборы за голоса, украшения ---------- */
YD.extraBottom=function(){var h='';
  if(uzOffer()&&payOn('uzelok'))h+='<div class="seapass uz"><b>🎒 Узелок новичка</b><small>300 💰, рамка «Новосёл», 3 марки и клумба во двор. Только в первые 3 дня.</small><button class="btn gold noenter" data-pay="uzelok">Взять · '+payPrice('uzelok')+'</button></div>';
  var sets=Object.keys(SETS).filter(function(k){return payOn(k)&&YD.decOwned().indexOf(k)<0;});
  if(sets.length)h+='<div class="ydsets"><h3>Наборы двора</h3>'+sets.map(function(k){var s=SETS[k];return '<div class="ydset"><span class="ydsetp">'+decPreview(k)+'</span><span><b>'+s.ic+' '+esc(s.n)+'</b><small>'+esc(s.desc)+'</small></span><button class="btn gold noenter" data-pay="'+k+'">'+payPrice(k)+'</button></div>';}).join('')+'</div>';
  var own=YD.decOwned().filter(function(k){return k!=='mih';});
  if(own.length)h+='<div class="ydsets"><h3>Украшения ('+own.length+')</h3><div class="yddecs">'+own.map(function(k){var on=YD.decOn(k);return '<button class="yddc'+(on?' on':'')+' noenter" data-dec="'+k+'"><span>'+decPreview(k)+'</span><small>'+esc(YD.DEC[k].n)+'</small><i>'+(on?'во дворе':'убрано')+'</i></button>';}).join('')+'</div></div>';
  return h;};
function decPreview(k){var lv=[1,1,1,1,1,1,1,1];var full=YD.scene({lv:lv,dec:[k],hol:''});return full.replace('<svg class="ydscn"','<svg class="ydscn mini"');}
YD.bindExtra=function(el){el.querySelectorAll('[data-pay]').forEach(function(b){b.onclick=function(){payBuy(b.dataset.pay);};});
  el.querySelectorAll('[data-dec]').forEach(function(b){b.onclick=function(){var k=b.dataset.dec;if(!YD.isO(S.ydH))S.ydH={};if(S.ydH[k])delete S.ydH[k];else S.ydH[k]=1;YD.save();YD.render();};});};
// украшения сезона: регистрируем текущий и все, что уже есть у игрока
YD.on('start',function(){addItems();syncOwned();(S.ydD||[]).forEach(function(k){var m=/^(s\d{6})-/.exec(k);if(m)regSeason(m[1]);});regSeason(YD.seaId());seaSer(YD.seaId());
  (S.ydD||[]).forEach(function(k){var m=/^(s\d{6})-/.exec(k);if(m)seaSer(m[1]);});rollSeason();daily();if(YD.mihLook())YD.addDec('mih');});
YD.merge(function(){syncOwned();if(YD.mihLook())YD.addDec('mih');});
})();
