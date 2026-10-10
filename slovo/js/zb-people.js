'use strict';
/* zb-people — герои «Школы бабы Зины» (ZBP). Поток CAB, ветка zb-cab. Правило владельца 09.10: один герой = один облик во всех играх.
   ФАЙЛ СОБРАН СКРИПТОМ hobby-analytics/release-i/zina-boost/CAB-tools/build_people.py — рисунки перенесены из родных игр КАК ЕСТЬ:
   - баба Зина и кот Ять — родные (js/text.js zinaSVG/catSVG — зовём на месте, наряд Зины — текущий S.outfit);
   - Валентина Петровна, Галя, дед Семён, Тамара, Люся, Нина Аркадьевна, Барсик — «Соседки» (js/sosedki.js SOS_FACE_RAW, портреты w-art 07.10);
   - Толик «Карбюратор» — «Покер на спички» (~/Projects/holdem/index.html headSvg + LOOK.tolik, 8e65c53);
   - дядя Коля, Валерка — Викторина (~/Projects/viktorina/js/look.js NEW.* + bustInner, a6ac64a; без контура — плоско, как Зина);
   - тётя Валя (Гастроном drawPerson 'valya') и дед Митяй (Рыбалка mit()) — через рамку Викторины js/look-kin.js (a6ac64a, код рисования без изменений).
   Новых персонажей здесь НЕТ.
   ДОГОВОР:
   ZBP.ids               — ['zina','yat','vp','valya','tolik','kolya','valerka','mityai','galya','semyon','tamara','lyusya','nina','barsik']
   ZBP.info[id]          — {name, short, role, from}
   ZBP.bust(id,mood,cls) — '<svg viewBox="0 0 200 220">' по пояс, низ — плечи, без фона (окна, реплики, кабинеты). mood: 'norm'|'happy'|'sad'|'wow'
                           (у соседок и Яти лицо одно на все настроения — так нарисованы; у Зины sad = строгая 'stern')
   ZBP.face(id,cls)      — '<svg>' квадрат: голова и плечи, без фона (значки, лента «Сегодня», таблицы); cls — класс <svg> (по умолчанию 'zbface')
   ZBP.round(id,cls)     — круглый значок с фоном героя (как портреты Соседок)
   ZBP.say(id,text,mood) — html «герой + облачко» (класс .zbp-say, стили — здесь же)
   Ничего не пишет в сохранение. Не загрузился — проверяйте window.ZBP. Размер строки: векторные 1,5–5 КБ; Валя и Митяй — canvas-рисунки,
   в разметке короткая blob:-ссылка на PNG (рисуются при первом вызове, ~10 мс). */
(function(){
var OUTS='';
function OUT(){return OUTS;}

/* ===== Толик «Карбюратор» — «Покер на спички» (holdem/index.html) ===== */
var HD=(function(){
function eyesSvg(m){return m==='happy'?'<path d="M75 96 q8 -8 16 0 M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="83" cy="95" r="5.4" fill="#3a2a22"/><circle cx="117" cy="95" r="5.4" fill="#3a2a22"/><circle cx="84.5" cy="93.5" r="1.6" fill="#fff"/><circle cx="118.5" cy="93.5" r="1.6" fill="#fff"/>'
  :'<ellipse cx="83" cy="96" rx="4" ry="4.6" fill="#3a2a22"/><ellipse cx="117" cy="96" rx="4" ry="4.6" fill="#3a2a22"/><circle cx="84.3" cy="94.4" r="1.3" fill="#fff"/><circle cx="118.3" cy="94.4" r="1.3" fill="#fff"/>';}
function browsSvg(m,c){return m==='sad'?`<path d="M72 80 q10 -2 18 5 M128 80 q-10 -2 -18 5" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
  :m==='wow'?`<path d="M72 77 q10 -7 20 -1 M108 76 q10 -6 20 1" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
  :`<path d="M72 83 q10 -5 20 0 M108 83 q10 -5 20 0" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;}
function mouthSvg(m,c){c=c||'#b83b44';return m==='wow'?`<ellipse cx="100" cy="127" rx="7" ry="8" fill="${c}"/>`
  :m==='sad'?`<path d="M88 130 q12 -9 24 0" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`
  :m==='happy'?`<path d="M84 119 q16 19 32 0 q-16 6 -32 0z" fill="${c}"/><path d="M89 123 q11 6 22 0" fill="#fff" opacity=".9"/>`
  :`<path d="M86 121 q14 13 28 0" stroke="${c}" stroke-width="4.2" fill="none" stroke-linecap="round"/>`;}
let pvN=0;
function headSvg(o,m){const u='p'+(++pvN),sk=o.skin||'#f5c9a8',sk2=o.skin2||'#e9ae88';
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="f${u}" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="${o.skinL||'#ffe2cc'}"/><stop offset="1" stop-color="${sk}"/></radialGradient></defs>
  <rect width="200" height="200" fill="${o.bg||'#f1ede2'}"/>${o.back||''}
  <path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="${o.body}"/>${o.bodyX||''}
  <rect x="88" y="128" width="24" height="22" rx="8" fill="${sk2}"/>
  <circle cx="53" cy="104" r="8" fill="${sk}"/><circle cx="147" cy="104" r="8" fill="${sk}"/>
  <ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#f${u})"/>${o.hair||''}
  <ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/>
  ${browsSvg(m,o.brow||'#6d5a4a')}${eyesSvg(m)}${o.glasses||''}
  <path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="${sk2}" stroke-width="3" fill="none" stroke-linecap="round"/>${o.nose||''}
  ${mouthSvg(m,o.lip)}${o.face||''}${o.hat||''}</svg>`;}
const HATS={
  cap:'<path d="M50 74 q4 -44 52 -46 q46 2 50 40 q-50 -8 -102 6z" fill="#6b6f76"/><path d="M50 74 q50 -14 102 -6 q18 4 22 12 q-62 -10 -124 -6z" fill="#565a61"/><circle cx="102" cy="30" r="4" fill="#565a61"/>',
  beret:'<path d="M46 70 q6 -42 58 -42 q50 2 52 34 q-2 10 -14 12 q-46 -14 -96 -4z" fill="#8e2a3e"/><circle cx="104" cy="26" r="5" fill="#6e1f30"/>',
  hair:'<path d="M53 90 q-4 -44 47 -48 q50 4 47 48 q-10 -24 -26 -28 q-14 10 -44 6 q-16 4 -24 22z" fill="#6b4a33"/>',
  panama:'<path d="M34 78 q66 -22 132 0 q-10 10 -24 6 q-42 -10 -84 0 q-14 4 -24 -6z" fill="#8a9a5b"/><path d="M56 76 q2 -42 44 -44 q42 2 44 44 q-44 -10 -88 0z" fill="#9aab68"/><path d="M58 66 q42 -10 84 0 v6 q-42 -10 -84 0z" fill="#6b7a45"/>',
  straw:'<ellipse cx="100" cy="72" rx="72" ry="14" fill="#e8c872"/><path d="M60 72 q0 -44 40 -46 q40 2 40 46z" fill="#f0d68a"/><path d="M60 64 h80 v8 h-80z" fill="#c0392b"/><path d="M40 72 q60 12 120 0" stroke="#c9a54e" stroke-width="2" fill="none"/>',
  trucker:'<path d="M50 74 q2 -46 52 -48 q48 2 50 42 q-50 -8 -102 6z" fill="#c0392b"/><path d="M76 34 q24 -10 50 0 v30 q-26 -6 -50 0z" fill="#f4f4f4"/><path d="M50 74 q52 -12 104 -4 q18 4 22 12 q-64 -10 -126 -8z" fill="#9b2c20"/>',
  ushanka:'<path d="M44 80 q0 -54 56 -56 q56 2 56 56 q-56 -12 -112 0z" fill="#6b4a33"/><path d="M42 80 q58 -16 116 0 v12 q-58 -14 -116 0z" fill="#8b6647"/><path d="M40 84 q-10 30 2 48 q10 -2 12 -16 q-2 -18 -2 -32z M160 84 q10 30 -2 48 q-10 -2 -12 -16 q2 -18 2 -32z" fill="#8b6647"/><circle cx="100" cy="46" r="7" fill="#c0392b"/>',
  captain:'<path d="M48 72 q52 -42 104 0 q-52 -10 -104 0z" fill="#fdfdfd"/><path d="M52 60 q48 -10 96 0 v12 q-48 -8 -96 0z" fill="#1d2c4d"/><path d="M58 74 q42 12 84 0 l6 7 q-48 12 -96 0z" fill="#111"/><path d="M92 58 l8 -8 l8 8 l-8 6z" fill="#f5b72d"/>',
  bowler:'<ellipse cx="100" cy="74" rx="60" ry="10" fill="#222"/><path d="M62 72 q0 -48 38 -48 q38 0 38 48z" fill="#333"/><path d="M62 64 h76 v8 h-76z" fill="#6b4a33"/>'
};
const TOLIK={bg:'#e3e9f2',body:'#2c5aa0',bodyX:'<path d="M72 150 v50 M128 150 v50" stroke="#1d3f73" stroke-width="8"/><circle cx="72" cy="172" r="4" fill="#f5b72d"/><circle cx="128" cy="172" r="4" fill="#f5b72d"/>',
    hat:HATS.cap,face:'<path d="M76 116 q12 -8 24 -2 q12 -6 24 2 q-6 10 -24 6 q-18 4 -24 -6z" fill="#5b3a29"/><path d="M60 104 l8 2" stroke="#555" stroke-width="3" opacity=".5"/>',brow:'#5b3a29'};
return {headSvg:headSvg,TOLIK:TOLIK};})();

/* ===== дядя Коля, Валерка — Викторина (js/look.js) ===== */
var VK=(function(){
var NEW={
 kolya:function(s){ // 09.10 (решение владельца): Коля ≠ Толик «Карбюратор» из Покера — свои приметы: очки в чёрной оправе, вязаная жилетка с карандашом, кляссер с марками
  var al='<g transform="rotate(-9 50 200)"><rect x="16" y="168" width="70" height="58" rx="5" fill="#2e6b4a" '+s+'/><rect x="22" y="174" width="58" height="46" rx="2" fill="#1f4f36"/>'+
   '<g stroke="#fff" stroke-width="1.6" stroke-dasharray="2 1.6"><rect x="26" y="178" width="14" height="17" fill="#e5484d"/><rect x="44" y="178" width="14" height="17" fill="#3f8fe0"/><rect x="62" y="178" width="14" height="17" fill="#ffcf40"/>'+
   '<rect x="26" y="200" width="14" height="17" fill="#2fa84f"/><rect x="44" y="200" width="14" height="17" fill="#ff8a1f"/></g><path d="M51 205 l4 -5 l4 5 z" fill="#fff"/><circle cx="33" cy="186" r="3" fill="#fff" opacity=".8"/></g>';
  return{body:'#7fa8d6',brow:'#5b3a29',
  hat:'<path d="M48 78 q2 -50 54 -52 q50 2 52 44 q-52 -10 -106 8z" fill="#6b5b4a" '+s+'/><path d="M48 78 q52 -18 106 -8 q18 4 24 14 q-64 -12 -130 -6z" fill="#51443a" '+s+'/>',
  bodyX:'<path d="M80 152 l20 20 l20 -20" fill="#e3e9f0" '+s+'/><path d="M40 166 q22 -12 44 -10 l16 28 l16 -28 q22 -2 44 10 l8 54 H32z" fill="#8a6a45" '+s+'/>'+
   '<g fill="#6f5434"><circle cx="100" cy="196" r="3.4"/><circle cx="100" cy="210" r="3.4"/></g><path d="M52 176 q20 -6 36 -2 M112 174 q16 -4 36 2" stroke="#a7865d" stroke-width="2.4" fill="none"/>'+
   '<rect x="132" y="170" width="20" height="14" rx="2" fill="#6f5434"/><path d="M138 172 v-16" stroke="#ffcf40" stroke-width="4" stroke-linecap="round"/><path d="M138 156 v-3" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>'+al,
  glasses:'<g fill="rgba(210,230,255,.3)" stroke="#222" stroke-width="3.6"><rect x="65" y="92" width="32" height="22" rx="6"/><rect x="103" y="92" width="32" height="22" rx="6"/></g><path d="M97 101 h6 M65 99 l-15 -4 M135 99 l15 -4" stroke="#222" stroke-width="3.6" fill="none"/>',
  under:'<path d="M72 128 q14 -9 28 -2 q14 -7 28 2 q-7 12 -28 7 q-21 5 -28 -7z" fill="#5b3a29" '+s+'/>'};},
 valerka:function(s){return{body:'#2f9e44',brow:'#6b4420',skin:'#f6cfae',
  hair:'<path d="M52 96 q-6 -44 46 -50 q52 2 52 48 q-10 -22 -26 -20 q-10 -12 -24 -6 q-14 -10 -30 2 q-12 4 -18 26z" fill="#8a5a2b" '+s+'/>',
  hat:'<path d="M50 76 q2 -44 50 -46 q48 2 50 46 q-50 -14 -100 0z" fill="#1c6fb8" '+s+'/><path d="M100 64 q38 -6 68 10 q-4 9 -18 9 q-24 -9 -50 -7z" fill="#155a96" '+s+'/>',
  bodyX:'<path d="M80 152 l20 22 l20 -22" fill="#fff" '+s+'/>',
  face:'<g fill="#d9905b" opacity=".7"><circle cx="68" cy="116" r="2"/><circle cx="76" cy="121" r="2"/><circle cx="62" cy="122" r="2"/><circle cx="132" cy="116" r="2"/><circle cx="124" cy="121" r="2"/><circle cx="138" cy="122" r="2"/></g>'};}
};
function bustInner(id,m){var o=(NEW[id]||NEW.mihalych)(OUT()),st=OUT();
 var sk=o.skin||'#eebf99',sk2=o.skin2||'#dba27c',brow=o.brow||'#8c8c8c';
 var eyes=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/><circle cx="83" cy="101" r="1.8" fill="#fff"/><circle cx="121" cy="101" r="1.8" fill="#fff"/>'
  :'<ellipse cx="81" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><circle cx="82.5" cy="101.5" r="1.4" fill="#fff"/><circle cx="120.5" cy="101.5" r="1.4" fill="#fff"/>';
 var brows=m==='sad'?'<path d="M68 90 q10 -5 22 2 M132 90 q-10 -5 -22 2" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
  :m==='happy'||m==='wow'?'<path d="M67 86 q11 -9 23 -3 M133 86 q-11 -9 -23 -3" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
  :'<path d="M68 90 q11 -6 22 -2 M132 90 q-11 -6 -22 -2" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>';
 var mouth=m==='happy'?'<path d="M82 132 q18 20 36 0 q-18 5 -36 0z" fill="#8f2f35"/><path d="M87 134.5 q13 5 26 0 l-2 3 q-11 4 -22 0z" fill="#fff"/>'
  :m==='sad'?'<path d="M88 140 q12 -9 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<ellipse cx="100" cy="137" rx="8" ry="9" fill="#8f2f35"/>'
  :'<path d="M86 133 q14 11 28 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
 return (o.back||'')+'<path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="'+o.body+'" '+st+'/>'+(o.bodyX||'')+
  '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'" '+st+'/>'+
  '<ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'" '+st+'/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'" '+st+'/>'+
  '<path d="M52 92 q0 -48 48 -48 q48 0 48 48 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'" '+st+'/>'+(o.hair||'')+
  '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
  (o.old?'<path d="M64 112 q5 3 10 2 M136 112 q-5 3 -10 2 M80 76 q20 -5 40 0" stroke="'+sk2+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'')+
  brows+eyes+(o.glasses||'')+'<path d="M100 104 q-9 18 -3 22 q5 3 11 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".9"/>'+(o.under||'')+mouth+(o.face||'')+(o.hat||'');}
return {bustInner:bustInner};})();

/* ===== тётя Валя (Гастроном) и дед Митяй (Рыбалка) — рамка Викторины js/look-kin.js ===== */
var KN=(function(){
var GA=(function(){
const SKIN='#f2c9a7';
const hasDecor=()=>false; // у Вали в Викторине нет покупных украшений Гастронома
function shade(hex,p){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=p<0?0:255,q=Math.abs(p);r=Math.round((t-r)*q+r);g=Math.round((t-g)*q+g);b=Math.round((t-b)*q+b);return`rgb(${r},${g},${b})`;}
// скруглённый прямоугольник; старые браузеры без roundRect (Chrome < 99, Safari < 16) — через arcTo
function rrect(g,x,y,w,h,r){g.beginPath();r=Math.max(0,Math.min(r||0,w/2,h/2));if(g.roundRect){g.roundRect(x,y,w,h,r);return;}
  g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function ell(g,x,y,rx,ry,f){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(f){g.fillStyle=f;g.fill();}}
function lin(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>gr.addColorStop(i/(st.length-1),c));return gr;}
function poly(g,pts,f){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();if(f){g.fillStyle=f;g.fill();}}
function drawPerson(g,kind,cx,by,h,mood,tk,talk){const u=h/100,bob=Math.sin(tk*2+cx*.01)*1.2*u;by+=bob;const hx=cx,hy=by-60*u;g.save();g.lineCap='round';g.lineJoin='round';
  const C={babka:'#7d5a44',school:'#f3f3ef',police:'#35557a',intel:'#8a8f94',worker:'#2f4f6f',student:'#1e8f7a',revizor:'#2d3436',valya:'#fbfbfb',veteran:'#5b5146'}[kind];
  // плечи
  g.beginPath();g.moveTo(cx-38*u,by+12*u);g.lineTo(cx-36*u,by-20*u);g.quadraticCurveTo(cx-34*u,by-36*u,cx-14*u,by-38*u);g.lineTo(cx+14*u,by-38*u);g.quadraticCurveTo(cx+34*u,by-36*u,cx+36*u,by-20*u);g.lineTo(cx+38*u,by+12*u);g.closePath();
  g.fillStyle=lin(g,cx-38*u,0,cx+38*u,0,[shade(C,-.18),C,shade(C,-.08),shade(C,-.28)]);g.fill();
  if(kind==='valya'){g.strokeStyle='#d9d9d9';g.lineWidth=1.5*u;g.beginPath();g.moveTo(cx,by-36*u);g.lineTo(cx,by+12*u);g.stroke();for(let k=0;k<3;k++)ell(g,cx+4*u,by-24*u+k*12*u,1.8*u,1.8*u,'#c9c9c9');
    poly(g,[cx-12*u,by-38*u,cx,by-26*u,cx+12*u,by-38*u],'#f2c9a7');
    // бусы (обстановка): коралловые бусины дугой по вороту
    if(hasDecor('beads'))for(let k=0;k<=10;k++){const t=k/10*2-1,x=cx+t*15*u,y=by-37.5*u+(1-t*t)*14*u;ell(g,x,y,2.5*u,2.5*u,k%2?'#d9483b':'#e8604f');ell(g,x-.8*u,y-.8*u,.9*u,.9*u,'rgba(255,255,255,.7)');}
    // значок «Отличник торговли» (за задания дня): золотой кружок с красной звездой на груди
    if(hasDecor('q_badge')){const bx=cx-22*u,by2=by-29*u;poly(g,[bx-3.2*u,by2-9*u,bx+3.2*u,by2-9*u,bx+2*u,by2-3*u,bx-2*u,by2-3*u],'#c62828');ell(g,bx,by2,6*u,6*u,'#b8860b');ell(g,bx,by2,5*u,5*u,'#f2c94c');qStar(g,bx,by2-.4*u,3.8*u,'#c62828');}}
  else if(kind==='school'){poly(g,[cx-10*u,by-38*u,cx,by-28*u,cx+10*u,by-38*u],'#f3f3ef');poly(g,[cx-3*u,by-30*u,cx+3*u,by-30*u,cx+9*u,by-6*u,cx+1*u,by-10*u,cx-6*u,by-4*u],'#d63031');ell(g,cx,by-31*u,3.5*u,3*u,'#b71c1c');
    // бидон
    const bx=cx+34*u,byy=by-2*u;rrect(g,bx-9*u,byy-24*u,18*u,26*u,4*u);g.fillStyle=lin(g,bx-9*u,0,bx+9*u,0,['#8f9aa0','#e3e8ea','#8f9aa0']);g.fill();rrect(g,bx-5*u,byy-30*u,10*u,7*u,2*u);g.fillStyle='#b5bec2';g.fill();
    g.strokeStyle='#6f7a80';g.lineWidth=1.6*u;g.beginPath();g.arc(bx,byy-30*u,7*u,Math.PI,0);g.stroke();}
  else if(kind==='police'){poly(g,[cx-10*u,by-38*u,cx,by-26*u,cx+10*u,by-38*u],'#f0f0f0');g.fillStyle='#c0392b';g.fillRect(cx-16*u,by-34*u,6*u,4*u);g.fillRect(cx+10*u,by-34*u,6*u,4*u);
    g.fillStyle='#d4a017';g.fillRect(cx-32*u,by-26*u,14*u,4*u);g.fillRect(cx+18*u,by-26*u,14*u,4*u);for(let k=0;k<3;k++)ell(g,cx,by-18*u+k*10*u,1.8*u,1.8*u,'#d4a017');}
  else if(kind==='intel'||kind==='revizor'){poly(g,[cx-11*u,by-38*u,cx,by-14*u,cx+11*u,by-38*u],'#f4f4f0');poly(g,[cx-3*u,by-34*u,cx+3*u,by-34*u,cx+4*u,by-12*u,cx,by-8*u,cx-4*u,by-12*u],kind==='revizor'?'#c0392b':'#2c3e50');
    if(kind==='revizor'){rrect(g,cx+18*u,by-18*u,24*u,30*u,2*u);g.fillStyle='#8b1e1e';g.fill();g.fillStyle='#f5f0e0';g.fillRect(cx+21*u,by-15*u,18*u,3*u);}}
  else if(kind==='worker'){poly(g,[cx-14*u,by-38*u,cx-4*u,by-24*u,cx,by-36*u],shade(C,.15));poly(g,[cx+14*u,by-38*u,cx+4*u,by-24*u,cx,by-36*u],shade(C,.15));g.fillStyle='#f39c12';g.fillRect(cx-36*u,by-8*u,72*u,4*u);}
  else if(kind==='student'){g.fillStyle='#f1c40f';rrect(g,cx-18*u,by-40*u,36*u,10*u,5*u);g.fill();g.fillStyle='#e67e22';for(let k=0;k<3;k++)g.fillRect(cx-14*u+k*10*u,by-40*u,4*u,10*u);
    g.fillStyle='#f1c40f';g.fillRect(cx+6*u,by-32*u,8*u,24*u);g.fillStyle='#e67e22';g.fillRect(cx+6*u,by-24*u,8*u,3*u);g.fillRect(cx+6*u,by-16*u,8*u,3*u);}
  // ветеран: пиджак, орденские планки и две медали
  else if(kind==='veteran'){poly(g,[cx-10*u,by-38*u,cx,by-24*u,cx+10*u,by-38*u],'#f4f4f0');for(let k=0;k<3;k++){g.fillStyle=['#c0392b','#f39c12','#2e86de'][k];g.fillRect(cx-30*u+k*7*u,by-30*u,6*u,4*u);}
    for(let k=0;k<2;k++){g.fillStyle=k?'#c0392b':'#d35400';g.fillRect(cx-27*u+k*9*u,by-25*u,3.5*u,6*u);ell(g,cx-25.3*u+k*9*u,by-16*u,4.2*u,4.2*u,'#f1c40f');ell(g,cx-25.3*u+k*9*u,by-16*u,2*u,2*u,'#c9950c');}}
  else if(kind==='babka'){poly(g,[cx-10*u,by-38*u,cx,by-30*u,cx+10*u,by-38*u],'#a0785c');for(let k=0;k<3;k++)ell(g,cx+2*u,by-24*u+k*11*u,2*u,2*u,'#3e2a1f');}
  // шея и волосы сзади
  g.fillStyle=shade(SKIN,-.12);g.fillRect(hx-6*u,hy+12*u,12*u,12*u);
  if(kind==='student'){g.beginPath();g.moveTo(hx-20*u,hy-6*u);g.quadraticCurveTo(hx-26*u,hy+22*u,hx-18*u,hy+30*u);g.lineTo(hx+18*u,hy+30*u);g.quadraticCurveTo(hx+26*u,hy+22*u,hx+20*u,hy-6*u);g.closePath();g.fillStyle='#a0522d';g.fill();}
  if(kind==='babka'){ell(g,hx,hy+1*u,23*u,25*u,'#c0392b');g.fillStyle='#fff';for(const [x,y] of [[-18,8],[18,8],[-20,-6],[20,-6],[-12,20],[12,20]])ell(g,hx+x*u,hy+y*u,1.7*u,1.7*u);}
  if(kind==='valya'){for(const [x,y,r] of [[-17,-10,8],[17,-10,8],[-19,2,7],[19,2,7],[-12,-18,8],[12,-18,8],[0,-21,9]])ell(g,hx+x*u,hy+y*u,r*u,r*u,'#b5523b');}
  // голова
  ell(g,hx,hy,17*u,19*u,lin(g,hx-17*u,0,hx+17*u,0,[shade(SKIN,-.1),SKIN,shade(SKIN,-.14)]));
  ell(g,hx-17*u,hy+1*u,3*u,4.5*u,shade(SKIN,-.1));ell(g,hx+17*u,hy+1*u,3*u,4.5*u,shade(SKIN,-.1));
  // причёска / головной убор
  if(kind==='babka'){g.beginPath();g.moveTo(hx-19*u,hy+4*u);g.quadraticCurveTo(hx-22*u,hy-26*u,hx,hy-24*u);g.quadraticCurveTo(hx+22*u,hy-26*u,hx+19*u,hy+4*u);g.quadraticCurveTo(hx+14*u,hy-10*u,hx,hy-12*u);g.quadraticCurveTo(hx-14*u,hy-10*u,hx-19*u,hy+4*u);
    g.fillStyle='#c0392b';g.fill();g.fillStyle='#fff';for(const [x,y] of [[-10,-16],[2,-19],[12,-12],[-15,-4],[15,0],[-4,-10]])ell(g,hx+x*u,hy+y*u,1.6*u,1.6*u);
    ell(g,hx,hy-11*u,12*u,3*u,'#d5d5d5');poly(g,[hx-9*u,hy+19*u,hx,hy+16*u,hx+9*u,hy+19*u,hx+3*u,hy+30*u,hx-3*u,hy+30*u],'#a93226');}
  else if(kind==='school'){g.beginPath();g.moveTo(hx-18*u,hy-2*u);g.quadraticCurveTo(hx-18*u,hy-24*u,hx,hy-23*u);g.quadraticCurveTo(hx+18*u,hy-24*u,hx+18*u,hy-2*u);g.lineTo(hx+12*u,hy-10*u);g.lineTo(hx+2*u,hy-8*u);g.lineTo(hx-8*u,hy-12*u);g.closePath();g.fillStyle='#6d4c41';g.fill();
    for(const [x,y] of [[-9,5],[-6,7],[7,5],[10,7]])ell(g,hx+x*u,hy+y*u,.9*u,.9*u,'#c47b53');}
  else if(kind==='police'){g.fillStyle='#1c2833';rrect(g,hx-17*u,hy-14*u,34*u,6*u,3*u);g.fill();ell(g,hx,hy-20*u,22*u,8*u,'#35557a');g.fillStyle='#35557a';g.fillRect(hx-17*u,hy-20*u,34*u,8*u);
    g.fillStyle='#c0392b';g.fillRect(hx-17*u,hy-15*u,34*u,4*u);ell(g,hx,hy-17*u,3.5*u,3.5*u,'#f1c40f');ell(g,hx,hy-17*u,1.6*u,1.6*u,'#c0392b');}
  else if(kind==='intel'){g.fillStyle='#8d6e63';g.beginPath();g.moveTo(hx-15*u,hy+6*u);g.quadraticCurveTo(hx,hy+26*u,hx+15*u,hy+6*u);g.quadraticCurveTo(hx,hy+14*u,hx-15*u,hy+6*u);g.fill();
    ell(g,hx,hy-14*u,26*u,5*u,'#5d4037');g.beginPath();g.moveTo(hx-15*u,hy-14*u);g.quadraticCurveTo(hx-15*u,hy-32*u,hx,hy-30*u);g.quadraticCurveTo(hx+15*u,hy-32*u,hx+15*u,hy-14*u);g.closePath();g.fillStyle='#6d4c41';g.fill();g.fillStyle='#3e2723';g.fillRect(hx-15*u,hy-19*u,30*u,4*u);}
  else if(kind==='veteran'){ell(g,hx-15*u,hy-3*u,4*u,7*u,'#d0d0d0');ell(g,hx+15*u,hy-3*u,4*u,7*u,'#d0d0d0');ell(g,hx,hy-14*u,20*u,8*u,'#6d6256');g.fillStyle='#5d5347';g.beginPath();g.ellipse(hx+7*u,hy-10*u,14*u,4*u,.12,0,Math.PI*2);g.fill();}
  else if(kind==='worker'){ell(g,hx,hy-14*u,21*u,9*u,'#6b6b6b');g.fillStyle='#595959';g.beginPath();g.ellipse(hx+8*u,hy-10*u,14*u,4*u,.15,0,Math.PI*2);g.fill();ell(g,hx,hy-19*u,4*u,2*u,'#7d7d7d');
    g.fillStyle='rgba(80,60,50,.35)';for(let k=0;k<10;k++)ell(g,hx-10*u+(k*7%20)*u,hy+11*u+(k*3%6)*u,.8*u,.8*u);}
  else if(kind==='student'){g.beginPath();g.moveTo(hx-18*u,hy);g.quadraticCurveTo(hx-16*u,hy-24*u,hx,hy-22*u);g.quadraticCurveTo(hx+16*u,hy-24*u,hx+18*u,hy);g.quadraticCurveTo(hx+8*u,hy-14*u,hx-18*u,hy);g.fillStyle='#a0522d';g.fill();
    g.save();g.translate(hx+3*u,hy-21*u);g.rotate(-.2);ell(g,0,0,17*u,6*u,'#c0392b');ell(g,0,-5*u,2.2*u,2.2*u,'#8e1b1b');g.restore();}
  else if(kind==='revizor'){ell(g,hx-15*u,hy-4*u,4*u,7*u,'#9e9e9e');ell(g,hx+15*u,hy-4*u,4*u,7*u,'#9e9e9e');g.strokeStyle='#9e9e9e';g.lineWidth=1.5*u;g.beginPath();g.moveTo(hx-12*u,hy-16*u);g.quadraticCurveTo(hx,hy-22*u,hx+12*u,hy-15*u);g.stroke();}
  else if(kind==='valya'){ell(g,hx,hy-18*u,19*u,8*u,'#fff');g.fillStyle='#fff';for(let k=-3;k<=3;k++)ell(g,hx+k*5.5*u,hy-24*u,3.4*u,3.4*u);g.strokeStyle='#e3e3e3';g.lineWidth=1*u;ell(g,hx,hy-18*u,15*u,5*u);g.stroke();
    ell(g,hx-17*u,hy+6*u,2*u,2*u,'#f1c40f');ell(g,hx+17*u,hy+6*u,2*u,2*u,'#f1c40f');}
  // лицо
  const blink=(tk+cx*.013)%3.7<.12,ey=hy-1*u;g.fillStyle='#2b1d14';g.strokeStyle='#2b1d14';g.lineWidth=1.8*u;
  if(mood>0){for(const k of[-1,1]){g.beginPath();g.arc(hx+k*6.5*u,ey+1.5*u,3*u,Math.PI*1.15,Math.PI*1.85);g.stroke();}}
  else if(blink){for(const k of[-1,1]){g.beginPath();g.moveTo(hx+k*6.5*u-2.5*u,ey);g.lineTo(hx+k*6.5*u+2.5*u,ey);g.stroke();}}
  else{ell(g,hx-6.5*u,ey,2.3*u,2.6*u,'#2b1d14');ell(g,hx+6.5*u,ey,2.3*u,2.6*u,'#2b1d14');ell(g,hx-5.8*u,ey-.9*u,.8*u,.8*u,'#fff');ell(g,hx+7.2*u,ey-.9*u,.8*u,.8*u,'#fff');}
  if(mood<0){g.lineWidth=2*u;for(const k of[-1,1]){g.beginPath();g.moveTo(hx+k*10*u,ey-7*u);g.lineTo(hx+k*3*u,ey-4.5*u);g.stroke();}}
  else if(kind!=='police'&&kind!=='revizor'){g.lineWidth=1.4*u;g.strokeStyle='rgba(60,40,30,.6)';for(const k of[-1,1]){g.beginPath();g.moveTo(hx+k*9.5*u,ey-6.5*u);g.lineTo(hx+k*4*u,ey-7*u);g.stroke();}}
  if(kind==='intel'||kind==='revizor'){g.strokeStyle='#2b2b2b';g.lineWidth=1.6*u;const r=kind==='revizor'?5.5*u:4.8*u;for(const k of[-1,1]){g.beginPath();g.arc(hx+k*6.5*u,ey,r,0,Math.PI*2);g.stroke();}g.beginPath();g.moveTo(hx-1.7*u,ey);g.lineTo(hx+1.7*u,ey);g.stroke();}
  ell(g,hx-10*u,hy+6*u,4*u,2.6*u,'rgba(230,110,100,.35)');ell(g,hx+10*u,hy+6*u,4*u,2.6*u,'rgba(230,110,100,.35)');
  g.strokeStyle=shade(SKIN,-.3);g.lineWidth=1.4*u;g.beginPath();g.moveTo(hx,hy+1*u);g.quadraticCurveTo(hx+2.5*u,hy+5*u,hx-.5*u,hy+6*u);g.stroke();
  if(kind==='veteran'){g.fillStyle='#c8c8c8';g.beginPath();g.moveTo(hx-9*u,hy+10*u);g.quadraticCurveTo(hx,hy+5*u,hx+9*u,hy+10*u);g.quadraticCurveTo(hx,hy+8.5*u,hx-9*u,hy+10*u);g.fill();}
  if(kind==='police'){g.fillStyle='#5d4037';g.beginPath();g.moveTo(hx-8*u,hy+10*u);g.quadraticCurveTo(hx,hy+6*u,hx+8*u,hy+10*u);g.quadraticCurveTo(hx,hy+9*u,hx-8*u,hy+10*u);g.fill();}
  if(kind==='babka'){g.strokeStyle='rgba(120,80,60,.35)';g.lineWidth=1*u;for(const k of[-1,1]){g.beginPath();g.moveTo(hx+k*11*u,ey+3*u);g.lineTo(hx+k*13*u,ey+5*u);g.stroke();}}
  const my=hy+11*u;g.lineWidth=2*u;g.strokeStyle=kind==='valya'?'#c0392b':'#7a3b2e';
  if(talk>0&&Math.sin(tk*18)>0){ell(g,hx,my,4*u,3*u,'#7a2a20');}
  else if(mood>0){g.beginPath();g.arc(hx,my-3*u,6*u,Math.PI*.15,Math.PI*.85);g.stroke();}
  else if(mood<0){g.beginPath();g.arc(hx,my+4*u,5*u,Math.PI*1.2,Math.PI*1.8);g.stroke();}
  else{g.beginPath();g.moveTo(hx-4*u,my);g.quadraticCurveTo(hx,my+2.5*u,hx+4*u,my);g.stroke();}
  g.restore();}

/* ================= зал: стена, вывеска, прилавок, обстановка ================= */
// звезда (обстановка «за задания»)
function qStar(g,x0,y0,r,col){g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r;g.lineTo(x0+Math.cos(a)*rr,y0+Math.sin(a)*rr);}g.closePath();g.fillStyle=col;g.fill();}
return {drawPerson:drawPerson,SKIN:SKIN};
})();
/* ---- из «Рыбалки» (помощники рисования и mit — как есть) ---- */
var RY=(function(){
var PI=Math.PI;
function rnd(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function el(g,x,y,rx,ry,r){g.beginPath();g.ellipse(x,y,Math.abs(rx),Math.abs(ry),r||0,0,PI*2);}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();}
function lg(g,x0,y0,x1,y1,st){var gr=g.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)gr.addColorStop(st[i],st[i+1]);return gr;}
function rg(g,x,y,r0,r1,st){var gr=g.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)gr.addColorStop(st[i],st[i+1]);return gr;}
function blink(t,ph){var c=(t+ph)%4.3;return c<.12?1-Math.abs(c-.06)/.06:0;}
function shade(night,c,k){return night?mix(c,'#1b2440',k||.45):c;}
function hx(c){c=c.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];var n=parseInt(c,16);return [n>>16&255,n>>8&255,n&255];}
function mix(a,b,k){var x=hx(a),y=hx(b);return 'rgb('+Math.round(x[0]+(y[0]-x[0])*k)+','+Math.round(x[1]+(y[1]-x[1])*k)+','+Math.round(x[2]+(y[2]-x[2])*k)+')';}
function lim(v,a,b){return v<a?a:v>b?b:v;}
function mit(g,x,y,s,t,o){o=o||{};var k=s/100,N=!!o.night,face=o.face||'smile';
  var C={shirt:shade(N,'#7b8c5a'),shirtD:shade(N,'#5d6b42'),skin:shade(N,'#e6b892',.35),skinD:shade(N,'#c99572',.35),beard:shade(N,'#f1f1ec',.3),cap:shade(N,'#3d4752'),capD:shade(N,'#28303a'),pants:shade(N,'#4b4036'),boot:shade(N,'#2a2420')};
  g.save();g.translate(x,y);g.scale(k,k);
  if(!o.bust){g.fillStyle='rgba(0,0,0,.2)';el(g,0,0,22,4.5);g.fill();
    g.fillStyle=C.pants;rr(g,-11,-40,10,36,4);g.fill();rr(g,1,-40,10,36,4);g.fill();g.fillStyle=C.boot;rr(g,-13,-7,13,7,3);g.fill();rr(g,0,-7,13,7,3);g.fill();
    // палка
    g.strokeStyle=shade(N,'#8a6a42');g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-26,0);g.lineTo(-22,-56);g.stroke();g.beginPath();g.arc(-19,-56,3.4,PI,PI*1.9);g.stroke();}
  var br=Math.sin(t*1.5)*.6;
  // рубаха
  g.fillStyle=lg(g,-18,0,18,0,[0,C.shirtD,.4,C.shirt,1,C.shirtD]);g.beginPath();g.moveTo(-17,-36);g.quadraticCurveTo(-20,-58,-16,-70+br);g.quadraticCurveTo(0,-76,16,-70+br);g.quadraticCurveTo(20,-58,17,-36);g.quadraticCurveTo(0,-32,-17,-36);g.fill();
  g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=1;g.beginPath();g.moveTo(-17,-44);g.quadraticCurveTo(0,-41,17,-44);g.stroke(); // поясок
  g.strokeStyle=shade(N,'#b8402e');g.lineWidth=2.2;g.beginPath();g.moveTo(-17,-43);g.quadraticCurveTo(0,-40,17,-43);g.stroke();
  // руки
  if(!o.bust){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.lineCap='round';g.beginPath();g.moveTo(-15,-66);g.quadraticCurveTo(-24,-60,-22,-52);g.stroke();g.fillStyle=C.skin;el(g,-22,-54,4,4.2);g.fill();
    if(o.arm==='point'){g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(28,-72,36,-80);g.stroke();g.fillStyle=C.skin;el(g,37,-81,4,4.2);g.fill();}
    else{g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(22,-54,19,-42);g.stroke();g.fillStyle=C.skin;el(g,19,-41,4,4.2);g.fill();}}
  else if(o.arm==='point'){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.lineCap='round';g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(26,-74,30,-84);g.stroke();g.fillStyle=C.skin;el(g,31,-86,4,4.4);g.fill();g.strokeStyle=C.skin;g.lineWidth=2.4;g.beginPath();g.moveTo(32,-89);g.lineTo(34,-95);g.stroke();}
  // голова
  g.save();g.translate(0,-86+br*.3);g.rotate(Math.sin(t*.8)*.03);
  g.fillStyle=C.skinD;el(g,-11.6,0,2.8,3.8);g.fill();el(g,11.6,0,2.8,3.8);g.fill();
  g.fillStyle=rg(g,-3,-3,2,15,[0,mix(C.skin,'#fff',.12),1,C.skin]);el(g,0,0,11.5,13);g.fill();
  // борода
  g.fillStyle=lg(g,0,2,0,26,[0,C.beard,1,mix(C.beard,'#b9b9b0',.5)]);g.beginPath();g.moveTo(-11,1);g.bezierCurveTo(-13,14,-7,26,0,28);g.bezierCurveTo(7,26,13,14,11,1);g.bezierCurveTo(6,8,-6,8,-11,1);g.fill();
  g.strokeStyle='rgba(150,150,140,.5)';g.lineWidth=.7;for(var i=-2;i<=2;i++){g.beginPath();g.moveTo(i*3,10);g.quadraticCurveTo(i*3.4,18,i*2,25);g.stroke();}
  g.fillStyle=C.beard;g.beginPath();g.moveTo(.4,4.5);g.bezierCurveTo(-4,3.6,-8,5,-8.5,8.2);g.bezierCurveTo(-5,7.4,-2,7.6,.4,7);g.bezierCurveTo(3,7.6,6,7.4,9,8.2);g.bezierCurveTo(8,5,4,3.6,.4,4.5);g.fill();
  g.fillStyle=shade(N,'#e09484',.35);el(g,.4,2.6,2.8,3.2);g.fill();
  // глаза — добрые щёлочки, очки
  var bl=blink(t,2.4);g.strokeStyle=shade(N,'#2a211b');g.lineWidth=1.3;g.lineCap='round';
  if(bl>.5||face==='smile'){g.beginPath();g.arc(-4.6,-1.5,2.2,PI*1.15,PI*1.85);g.stroke();g.beginPath();g.arc(4.6,-1.5,2.2,PI*1.15,PI*1.85);g.stroke();}
  else{g.fillStyle=shade(N,'#2a211b');el(g,-4.6,-1.6,1.4,1.7);g.fill();el(g,4.6,-1.6,1.4,1.7);g.fill();}
  g.strokeStyle=shade(N,'#8a7a5a');g.lineWidth=1;el(g,-4.6,-1.6,3.6,3.2);g.stroke();el(g,4.6,-1.6,3.6,3.2);g.stroke();g.beginPath();g.moveTo(-1,-1.8);g.lineTo(1,-1.8);g.stroke();
  g.strokeStyle=C.beard;g.lineWidth=2;g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-5,-7.6,-2,-6);g.moveTo(2,-6);g.quadraticCurveTo(5,-7.6,8,-6);g.stroke();
  // картуз
  g.fillStyle=lg(g,0,-19,0,-6,[0,mix(C.cap,'#fff',.1),1,C.cap]);g.beginPath();g.moveTo(-12.5,-6.5);g.lineTo(-13.5,-15);g.quadraticCurveTo(0,-21,13.5,-15);g.lineTo(12.5,-6.5);g.quadraticCurveTo(0,-9,-12.5,-6.5);g.fill();
  g.fillStyle=C.capD;g.beginPath();g.moveTo(-11.5,-7);g.quadraticCurveTo(-2,-1,9,-6.6);g.quadraticCurveTo(-1,-4.6,-11.5,-7);g.fill();g.fillStyle=shade(N,'#1f252c');g.fillRect(-12.8,-9.4,25.6,2);
  g.restore();g.restore();}
return {mit:mit,PI:PI,el:el,shade:shade};
})();
var URL={};
function cv(){var c=document.createElement('canvas');c.width=400;c.height=440;return c;}
function draw(id,m){var k=id+':'+m;if(URL[k])return URL[k];var c=cv(),g=c.getContext('2d');if(!g)return '';g.scale(2,2);
 if(id==='valya'){var u=2.7,tk=0.05;GA.drawPerson(g,'valya',100,262,u*100,m==='happy'?1:0,tk,m==='wow'?1:0);
  if(m==='sad'){ // в Гастрономе mood<0 — сердитая; грустную рисуем поверх обычной в её же цветах: брови домиком, уголки рта вниз
   var hy=262+Math.sin(tk*2+100*.01)*1.2*u-60*u,ey=hy-u,my=hy+11*u;g.save();g.lineCap='round';g.strokeStyle=GA.SKIN;g.lineWidth=3.4*u;
   g.beginPath();g.moveTo(100-4.5*u,my);g.quadraticCurveTo(100,my+2.5*u,100+4.5*u,my);g.stroke();
   g.beginPath();g.moveTo(100-9.5*u,ey-6.5*u);g.lineTo(100-4*u,ey-7*u);g.moveTo(100+9.5*u,ey-6.5*u);g.lineTo(100+4*u,ey-7*u);g.stroke();
   g.strokeStyle='rgba(60,40,30,.6)';g.lineWidth=1.4*u;g.beginPath();g.moveTo(100-10*u,ey-5.5*u);g.lineTo(100-4*u,ey-8*u);g.moveTo(100+10*u,ey-5.5*u);g.lineTo(100+4*u,ey-8*u);g.stroke();
   g.strokeStyle='#c0392b';g.lineWidth=2*u;g.beginPath();g.arc(100,my+4*u,5*u,Math.PI*1.2,Math.PI*1.8);g.stroke();g.restore();}}
 else if(id==='mityai'){var s=360,x=100,y=100+86*3.6;RY.mit(g,x,y,s,0,{bust:true,face:m==='happy'?'smile':'norm'});
  if(m==='sad'||m==='wow'){g.save();g.translate(x,y);g.scale(3.6,3.6);g.translate(0,-86);g.lineCap='round';
   g.strokeStyle='#e6b892';g.lineWidth=3.2;g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-5,-7.6,-2,-6);g.moveTo(2,-6);g.quadraticCurveTo(5,-7.6,8,-6);g.stroke();
   g.strokeStyle='#f1f1ec';g.lineWidth=2;g.beginPath();
   if(m==='sad'){g.moveTo(-8,-5.6);g.lineTo(-2.2,-8);g.moveTo(8,-5.6);g.lineTo(2.2,-8);}
   else{g.moveTo(-8,-8);g.quadraticCurveTo(-5,-10,-2,-8.4);g.moveTo(2,-8.4);g.quadraticCurveTo(5,-10,8,-8);}
   g.stroke();if(m==='wow'){g.fillStyle='#6b2a22';RY.el(g,.4,10.4,1.9,2.4);g.fill();}g.restore();}}
 try{return URL[k]=c.toDataURL('image/png');}catch(e){return '';}}
return {draw:draw};})();

/* ===== общий вид ===== */
var INFO={
  zina:{name:'Баба Зина',short:'Зина',role:'учительница русского, 40 лет в школе №7 — теперь поднимает её сама',from:'Баба Зина'},
  yat:{name:'Кот Ять',short:'Ять',role:'дежурный по живому уголку, находит буквы под диваном',from:'Баба Зина'},
  vp:{name:'Валентина Петровна',short:'Валентина Петровна',role:'завуч: журнал, звонок, «родителей в школу»',from:'Соседки по подъезду'},
  valya:{name:'Тётя Валя',short:'Валя',role:'столовая: пирожки, компот и «добавки нет»',from:'Гастроном'},
  tolik:{name:'Толик «Карбюратор»',short:'Толик',role:'трудовик: шьёт наряды, точит блюдца',from:'Покер на спички'},
  kolya:{name:'Дядя Коля',short:'Коля',role:'школьный музей: открытки, марки, стенд выпускников',from:'Дворовая викторина'},
  valerka:{name:'Валерка',short:'Валерка',role:'двоечник с задней парты, диктует на переменах',from:'Дворовая викторина'},
  mityai:{name:'Дед Митяй',short:'Митяй',role:'кричит «барабанные палочки!» в лото',from:'Рыбалка с Петровичем'},
  galya:{name:'Галя с третьего',short:'Галя',role:'родительский комитет: знает всё про всех',from:'Соседки по подъезду'},
  semyon:{name:'Дед Семён',short:'Семён',role:'загадки и сканворды с 1974 года',from:'Соседки по подъезду'},
  tamara:{name:'Тамара из 15-й',short:'Тамара',role:'пришкольный участок, рассада и рецепты',from:'Соседки по подъезду'},
  lyusya:{name:'Люся-почтальонка',short:'Люся',role:'приносит телеграммы и стенгазету',from:'Соседки по подъезду'},
  nina:{name:'Нина Аркадьевна',short:'Нина Аркадьевна',role:'хор в актовом зале',from:'Соседки по подъезду'},
  barsik:{name:'Барсик с пятого',short:'Барсик',role:'кот-сосед, друг Яти',from:'Соседки по подъезду'}
};
var IDS=Object.keys(INFO);
var SOSI={vp:0,galya:1,semyon:2,tamara:3,lyusya:4,nina:5,barsik:6};
var BG={zina:'#fde7c6',yat:'#ffe9cf',valya:'#ffe7e0',tolik:'#e3e9f2',kolya:'#e6efe2',valerka:'#e2f2e4',mityai:'#e2ecf6'};
function inner(s){return String(s||'').replace(/^\s*<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');}
var BLOB={};
function blobUrl(d){if(!d)return '';if(BLOB[d])return BLOB[d];try{var b=atob(d.split(',')[1]),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);
  return BLOB[d]=URL.createObjectURL(new Blob([a],{type:'image/png'}));}catch(e){return BLOB[d]=d;}}
var UID=0;
// соседки: портрет 100×100 (голова и плечи) без круга-фона; id обрезки — свой на вставку
function sos(i,noBg){var raw=(typeof SOS_FACE_RAW!=='undefined'&&SOS_FACE_RAW[i])||'';if(!raw)return '';var u='zbps'+(++UID);
  raw=raw.replace(/CLIPID/g,u);if(noBg)raw=raw.replace(/<clipPath[^>]*>.*?<\/clipPath>/,'').replace(/ clip-path="url\(#[^)]*\)"/,'').replace(/<circle cx="50" cy="50" r="50" fill="[^"]*"\/>/,'');
  return inner(raw);}
// содержимое бюста в координатах 200×220
function bustInnerOf(id,m){m=m==='clap'?'happy':(m||'norm');
  if(id==='zina')return typeof zinaSVG==='function'?'<g transform="translate(0 20)">'+inner(zinaSVG(m==='sad'?'stern':m))+'</g>':'';
  if(id==='yat')return typeof catSVG==='function'?'<g transform="translate(0 20) scale(1.6667)">'+inner(catSVG())+'</g>':'';
  if(id in SOSI)return '<g transform="translate(0 20) scale(2)">'+sos(SOSI[id],true)+'</g>';
  if(id==='tolik'){var s=inner(HD.headSvg(HD.TOLIK,m)).replace(/<rect width="200" height="200" fill="[^"]*"\/>/,'');return '<g transform="translate(0 20)">'+s+'</g>';}
  if(id==='kolya'||id==='valerka')return VK.bustInner(id,m);
  if(id==='mityai'||id==='valya')return '<image href="'+blobUrl(KN.draw(id,m))+'" x="0" y="0" width="200" height="220"/>';
  return '';}
function bust(id,m,cls){if(!INFO[id])return '';m=m||'norm';
  // без кэша: у Зины и Толика id градиентов свои на каждую вставку (одинаковые id ломаются, когда первую убирают)
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" class="'+(cls||'zbbust')+'" data-who="'+id+'/'+m+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+bustInnerOf(id,m)+'</svg>';}
// окно лица (в координатах бюста)
var FACE={zina:'30 12 140 140',yat:'20 20 160 160',tolik:'36 32 128 128',kolya:'34 18 132 132',valerka:'34 20 132 132',mityai:'38 20 124 124',valya:'38 22 124 124',
  vp:'30 34 140 140',galya:'30 34 140 140',semyon:'30 34 140 140',tamara:'24 34 152 152',lyusya:'30 34 140 140',nina:'30 30 140 140',barsik:'26 34 148 148'};
function face(id,cls){if(!INFO[id])return '';return '<svg xmlns="http://www.w3.org/2000/svg" class="'+(cls||'zbface')+'" viewBox="'+(FACE[id]||'34 20 132 132')+'" aria-hidden="true">'+bustInnerOf(id,'norm')+'</svg>';}
function round(id,cls){if(!INFO[id])return '';if(id in SOSI){var r=(typeof sosFace==='function')?sosFace(SOSI[id]):'';return r.replace('<svg','<svg class="'+(cls||'zbround')+'" aria-hidden="true"');}
  var u='zbpr'+(++UID),v=(FACE[id]||'34 20 132 132').split(' ').map(Number),cx=v[0]+v[2]/2,cy=v[1]+v[3]/2,r=v[2]/2;
  return '<svg xmlns="http://www.w3.org/2000/svg" class="'+(cls||'zbround')+'" viewBox="'+v.join(' ')+'" aria-hidden="true"><clipPath id="'+u+'"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'"/></clipPath>'+
    '<g clip-path="url(#'+u+')"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+(BG[id]||'#eee')+'"/>'+bustInnerOf(id,'norm')+'</g></svg>';}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function say(id,text,m){return '<div class="zbp-say"><div class="zbp-who">'+bust(id,m||'norm')+'</div><div class="zbp-bub"><b>'+esc(INFO[id]?INFO[id].short:'')+'</b>'+esc(text)+'</div></div>';}
(function(){try{var st=document.createElement('style');st.textContent=
  '.zbbust,.zbface,.zbround{display:block}.zbp-say{display:flex;align-items:flex-end;gap:8px;text-align:left;margin:4px 0}'+
  '.zbp-who{width:64px;height:70px;flex:none}.zbp-who svg{width:100%;height:100%}'+
  '.zbp-bub{position:relative;flex:1;min-width:0;background:var(--card,#fff);border-radius:14px;padding:8px 10px;box-shadow:0 2px 0 var(--edge2,#e6dcc8);font-size:15px;line-height:1.3;color:var(--ink,#2a2a2a)}'+
  '.zbp-bub b{display:block;font-size:12.5px;color:var(--ink2,#6b6b6b);margin-bottom:1px}'+
  '.zbp-bub:before{content:"";position:absolute;left:-7px;bottom:12px;border:7px solid transparent;border-right-color:var(--card,#fff);border-left:0}';
  document.head.appendChild(st);}catch(e){}})();
window.ZBP={ids:IDS,info:INFO,bust:bust,face:face,round:round,say:say};
})();
