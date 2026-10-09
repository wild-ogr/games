/* Сан Саныч из соседнего района — чемпион города, соперник в финале района «Город» (поток CAR буста 09.10.2026).
   Нарисован по тем же лекалам, что шесть жителей двора в js/look.js (бюст 200×220, контур из темы, те же глаза/брови/рты по настроению)
   и в «Классике» (голова 200×200, headSvg из index.html). Грузится в <head> сразу после js/look.js и js/ui-*.
   Характер: бодрый пенсионер-физрук из соседнего района, двадцать лет ведёт районную викторину в ДК, ходит в олимпийке
   и с кубком под мышкой («переходящий — пока что мой»). Хвастлив, но честен и добродушен: проиграл — зовёт в гости на чай.
   Наружу ничего нового: LK.who('sansan', mood) и portrait('sansan', mood) начинают его узнавать. */
(function(){
'use strict';
if(!window.LK)return;
var LK=window.LK,TH={dvor:{ink:'#233247',w:3},tele:{ink:'',w:0},doska:{ink:'#2a2a2a',w:2.6}};
function OUT(){var t=TH[LK.th?LK.th():'dvor']||TH.dvor;return t.w?'stroke="'+t.ink+'" stroke-width="'+t.w+'" stroke-linejoin="round"':'';}
// новый вид: по пояс. Олимпийка (синяя, белые полосы на плечах, молния), лысина с седым венчиком, густые чёрные брови, усы щёткой, кубок за плечом
function look(s){return{old:1,body:'#2456a6',brow:'#2b2b2b',skin:'#efbf98',skin2:'#d9a079',
  back:'<g transform="translate(10 4) rotate(-10 30 110)"><path d="M10 40 h44 v18 a22 22 0 0 1 -44 0z" fill="#ffd23f" '+s+'/><path d="M10 46 h-8 q0 16 12 18 M54 46 h8 q0 16 -12 18" fill="none" stroke="#c9961a" stroke-width="4"/>'+
    '<rect x="26" y="78" width="12" height="16" fill="#e0ad22" '+s+'/><rect x="16" y="92" width="32" height="10" rx="3" fill="#8a5a2b" '+s+'/><path d="M22 50 l10 -6 l10 6" stroke="#fff6c8" stroke-width="3" fill="none" stroke-linecap="round"/></g>',
  bodyX:'<path d="M100 156 V220" stroke="#c8d3e6" stroke-width="3.4"/><path d="M96 158 h8 v10 h-8z" fill="#c8d3e6"/>'+
    '<path d="M22 196 q10 -30 42 -40 M178 196 q-10 -30 -42 -40" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'+
    '<path d="M26 206 q10 -30 42 -42 M174 206 q-10 -30 -42 -42" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>'+
    '<path d="M78 150 l22 14 l22 -14 l-6 -6 l-16 10 l-16 -10z" fill="#1b3f7a" '+s+'/><circle cx="100" cy="182" r="4.5" fill="#ffd23f" '+s+'/><path d="M100 186 v6" stroke="#ffd23f" stroke-width="2"/>',
  hair:'<path d="M52 104 q-6 -26 6 -40 q4 18 10 30 z M148 104 q6 -26 -6 -40 q-4 18 -10 30 z" fill="#d9dde3" '+s+'/><path d="M60 62 q40 -26 80 0" stroke="#f7d6b8" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>',
  under:'<path d="M70 126 q8 -12 30 -8 q22 -4 30 8 q-4 10 -14 8 q-8 -6 -16 -4 q-8 -2 -16 4 q-10 2 -14 -8z" fill="#3a3330" '+s+'/>',
  face:'<circle cx="146" cy="124" r="2.6" fill="#b5835e" opacity=".7"/>'};} // родинка на щеке
// шаблон бюста — тот же, что в js/look.js (bustInner), чтобы Сан Саныч стоял в одном ряду с соседями
function bust(o,m){var st=OUT(),sk=o.skin,sk2=o.skin2,brow=o.brow;
 var eyes=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/><circle cx="83" cy="101" r="1.8" fill="#fff"/><circle cx="121" cy="101" r="1.8" fill="#fff"/>'
  :'<ellipse cx="81" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><circle cx="82.5" cy="101.5" r="1.4" fill="#fff"/><circle cx="120.5" cy="101.5" r="1.4" fill="#fff"/>';
 var brows=m==='sad'?'<path d="M66 92 q12 -6 24 2 M134 92 q-12 -6 -24 2" stroke="'+brow+'" stroke-width="8" fill="none" stroke-linecap="round"/>'
  :m==='happy'||m==='wow'?'<path d="M65 86 q12 -10 25 -3 M135 86 q-12 -10 -25 -3" stroke="'+brow+'" stroke-width="8" fill="none" stroke-linecap="round"/>'
  :'<path d="M66 90 q12 -7 24 -2 M134 90 q-12 -7 -24 -2" stroke="'+brow+'" stroke-width="8" fill="none" stroke-linecap="round"/>';
 // рот под усами: виден только улыбка/«ого»/грусть
 var mouth=m==='happy'?'<path d="M84 136 q16 16 32 0 q-16 4 -32 0z" fill="#8f2f35"/><path d="M88 137.5 q12 4 24 0 l-2 3 q-10 3 -20 0z" fill="#fff"/><rect x="104" y="137" width="5" height="4" rx="1" fill="#ffd23f"/>'
  :m==='sad'?'<path d="M88 144 q12 -8 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<ellipse cx="100" cy="141" rx="7" ry="8" fill="#8f2f35"/>'
  :'<path d="M88 139 q12 7 24 0" stroke="#8f2f35" stroke-width="4" fill="none" stroke-linecap="round"/>';
 return (o.back||'')+'<path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="'+o.body+'" '+st+'/>'+(o.bodyX||'')+
  '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'" '+st+'/>'+
  '<ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'" '+st+'/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'" '+st+'/>'+
  '<path d="M52 92 q0 -50 48 -50 q48 0 48 50 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'" '+st+'/>'+(o.hair||'')+
  '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
  '<path d="M64 112 q5 3 10 2 M136 112 q-5 3 -10 2 M78 70 q22 -6 44 0 M84 62 q16 -4 32 0" stroke="'+sk2+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+
  brows+eyes+'<path d="M100 104 q-10 18 -3 23 q6 3 12 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".95"/>'+mouth+(o.under||'')+(o.face||'');}
var C={};
var who0=LK.who,face0=LK.face;
LK.who=function(id,m){if(id!=='sansan')return who0.apply(this,arguments);m=m||'norm';var k=(LK.th?LK.th():'')+':'+m;
  return C[k]||(C[k]='<svg viewBox="0 0 200 220" class="bust" data-pv="sansan/'+m+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+bust(look(OUT()),m)+'</svg>');};
LK.face=function(id,cls){if(id!=='sansan')return face0.apply(this,arguments);var k=(LK.th?LK.th():'')+':f';
  return '<svg class="ic face'+(cls?' '+cls:'')+'" viewBox="34 6 132 150" aria-hidden="true" focusable="false">'+(C[k]||(C[k]=bust(look(OUT()),'norm')))+'</svg>';};
LK.who.sansan=1;window.LOOK_SANSAN=true; // табло BOARD узнаёт, что рисунок есть
var set0=LK.setCls;if(set0)LK.setCls=function(){C={};return set0.apply(this,arguments);};
// «Классика»: голова 200×200 (LOOK в index.html — после загрузки основного скрипта)
function classic(){try{if(typeof LOOK==='object'&&LOOK&&!LOOK.sansan)LOOK.sansan={bg:'#e4ecf7',body:'#2456a6',
  bodyX:'<path d="M34 186 q8 -26 36 -36 M166 186 q-8 -26 -36 -36" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M100 150 V200" stroke="#c8d3e6" stroke-width="3"/><path d="M82 146 l18 12 l18 -12" fill="#1b3f7a"/>',
  hair:'<path d="M54 98 q-4 -22 6 -34 q2 16 8 26z M146 98 q4 -22 -6 -34 q-2 16 -8 26z" fill="#d9dde3"/>',
  face:'<path d="M74 116 q8 -10 26 -6 q18 -4 26 6 q-4 8 -12 6 q-7 -4 -14 -3 q-7 -1 -14 3 q-8 2 -12 -6z" fill="#3a3330"/><path d="M66 78 q10 -8 24 -4 M134 78 q-10 -8 -24 -4" stroke="#2b2b2b" stroke-width="6" fill="none" stroke-linecap="round"/>',
  brow:'#2b2b2b',skin:'#efbf98',skin2:'#d9a079'};}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',classic);else classic();
})();
