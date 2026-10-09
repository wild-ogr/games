/* vy-art: жильцы «Выезда» — общие герои серии (правило владельца 09.10: один герой = один облик во всех играх). Поток ART.
   ФАЙЛ СОБРАН СКРИПТОМ hobby-analytics/release-i/vyezd-boost/ART-tools/build_people.py — рисунки перенесены из родных игр КАК ЕСТЬ:
   - Баба Шура и дед с газетой — родные Выезда (index.html shuraSvg, shuraFig, dedFig; d2bb74b);
   - Толик «Карбюратор» — «Покер на спички» (~/Projects/holdem/index.html headSvg + LOOK.tolik + HATS, 8e65c53);
   - Михалыч, Валерка — Викторина (~/Projects/viktorina/js/look.js NEW.* + bustInner, a6ac64a; контур темы «двор»);
   - дед Митяй — «Рыбалка» (rybak/js/mg-art.js mit()) и тётя Валя — «Гастроном» (drawPerson 'valya') — через рамку Викторины js/look-kin.js (a6ac64a, код рисования без изменений);
   - Сан Саныч — Викторина-CAR js/look-sansan.js (fffafab); баба Зина — «Баба Зина» через js/look-zina.js Викторины (c6b4189).
   Новых персонажей здесь НЕТ; безымянные силуэты в окнах (VYPEOPLE.win('')) — это фон, а не герои.
   ДОГОВОР:
   VYPEOPLE.ids                 — ['shura','tolik','mityai','mihalych','valerka','valya','sansan','zina','ded']
   VYPEOPLE.info[id]            — {name, short, role, from}
   VYPEOPLE.bust(id,mood)       — '<svg viewBox="0 0 200 220">' по пояс (окна, реплики, заказы). mood: 'norm'|'happy'|'sad'|'wow'
   VYPEOPLE.face(id,cls)        — '<svg>' только голова, квадрат (значки, лента «Сегодня», лига); cls — класс <svg>
   VYPEOPLE.win(id,opts)        — '<svg viewBox="0 0 100 120">' окно пятиэтажки с жильцом: id героя, '' — пустое окно, 'man'|'woman'|'kid' — силуэт соседа;
                                  opts {lit:true — вечерний свет, mood, far:true — по пояс мельче (по умолчанию крупно, голова и плечи), pet:'cat'|'flower', open:true — форточка, badge:'!' — значок поручения, w, h}
   VYPEOPLE.fig(id,g,x,y,s)     — фигурка на canvas: x,y — середина внизу, s — масштаб как у shuraFig игры (шура и дед — родные фигурки; остальные — бюст картинкой)
   VYPEOPLE.img(id,mood)        — HTMLImageElement с бюстом (для canvas)
   VYPPL.svg(who,mood,{cls})    — (просьба UX/MG0) квадрат 190×190 «по пояс», низ — плечи, без фона; mood 'clap' рисуется как 'happy'.
                                  Размер строки: векторные герои 1,5–4 КБ; Митяй, Валя, дед — родные canvas-рисунки, в разметке короткая blob:-ссылка на PNG.
   Ничего не пишет в сохранение. Не загрузился — проверяйте window.VYPEOPLE. */
(function(){
'use strict';
const OUTS='stroke="#233247" stroke-width="3" stroke-linejoin="round"';
function OUT(){return OUTS;}
function rrect(g,x,y,w,h,r){g.beginPath();r=Math.max(0,Math.min(r||0,w/2,h/2));g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}

/* ===== Баба Шура, дед с газетой — родные «Выезда» (index.html) ===== */
function shuraSvg(mood){const mouth=mood==='sad'?'<path d="M25 42q5-3 10 0" stroke="#8a3b2e" stroke-width="2.2" fill="none" stroke-linecap="round"/>':'<path d="M24 39q6 6 12 0" stroke="#8a3b2e" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  return '<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M6 62q2-17 24-17t24 17z" fill="#7a5c4a"/>'
    +'<path d="M30 6C16 6 9 16 10 30c1 9 5 15 11 19l9 4 9-4c6-4 10-10 11-19C51 16 44 6 30 6z" fill="#e84393"/>'
    +'<circle cx="19" cy="14" r="1.6" fill="#fff"/><circle cx="30" cy="10" r="1.6" fill="#fff"/><circle cx="41" cy="14" r="1.6" fill="#fff"/><circle cx="14" cy="24" r="1.6" fill="#fff"/><circle cx="46" cy="24" r="1.6" fill="#fff"/><circle cx="16" cy="38" r="1.6" fill="#fff"/><circle cx="44" cy="38" r="1.6" fill="#fff"/>'
    +'<ellipse cx="30" cy="33" rx="12.5" ry="13.5" fill="#f7d3b0"/><path d="M19 25q11-8 22 0-11-4-22 0z" fill="#e3e3e3"/>'
    +'<circle cx="22.5" cy="36.5" r="3" fill="#f29a9a" opacity=".55"/><circle cx="37.5" cy="36.5" r="3" fill="#f29a9a" opacity=".55"/>'
    +'<circle cx="24.5" cy="32" r="4.6" fill="#fff" fill-opacity=".35" stroke="#5d4037" stroke-width="1.5"/><circle cx="35.5" cy="32" r="4.6" fill="#fff" fill-opacity=".35" stroke="#5d4037" stroke-width="1.5"/><path d="M29.1 32h1.8" stroke="#5d4037" stroke-width="1.5"/>'
    +'<circle cx="24.5" cy="32.3" r="1.5" fill="#2d3436"/><circle cx="35.5" cy="32.3" r="1.5" fill="#2d3436"/>'+(mood==='sad'?'<path d="M21 26.5l6 1.5M39 26.5l-6 1.5" stroke="#8d8d8d" stroke-width="1.6" stroke-linecap="round"/>':'')
    +mouth+'<path d="M24 49l6 4 6-4 2 9H22z" fill="#d63384"/></svg>';}
function shuraFig(g,x,y,s){
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x+s*.1,y+s*.35,s*.62,s*.2,0,0,7);g.fill();
  g.fillStyle='#7a5c4a';g.beginPath();g.moveTo(x-s*.55,y+s*.3);g.lineTo(x-s*.36,y-s*.85);g.lineTo(x+s*.36,y-s*.85);g.lineTo(x+s*.55,y+s*.3);g.closePath();g.fill();
  g.fillStyle='#e84393';g.beginPath();g.arc(x,y-s*1.22,s*.5,0,7);g.fill();g.beginPath();g.moveTo(x-s*.42,y-s*1.05);g.lineTo(x,y-s*.62);g.lineTo(x+s*.42,y-s*1.05);g.closePath();g.fill();
  g.fillStyle='#fff';for(const [dx,dy] of [[-.3,-1.5],[0,-1.62],[.3,-1.5],[-.42,-1.25],[.42,-1.25]]){g.beginPath();g.arc(x+dx*s,y+dy*s,s*.045,0,7);g.fill();}
  g.fillStyle='#f7d3b0';g.beginPath();g.ellipse(x,y-s*1.14,s*.33,s*.35,0,0,7);g.fill();
  g.fillStyle='#e3e3e3';g.beginPath();g.ellipse(x,y-s*1.4,s*.26,s*.09,0,0,7);g.fill();
  g.fillStyle='rgba(242,154,154,.6)';g.beginPath();g.arc(x-s*.2,y-s*1.03,s*.07,0,7);g.arc(x+s*.2,y-s*1.03,s*.07,0,7);g.fill();
  g.strokeStyle='#5d4037';g.lineWidth=Math.max(1,s*.05);g.fillStyle='rgba(255,255,255,.45)';for(const sd of [-1,1]){g.beginPath();g.arc(x+sd*s*.14,y-s*1.18,s*.11,0,7);g.fill();g.stroke();}
  g.fillStyle='#2d3436';g.beginPath();g.arc(x-s*.14,y-s*1.17,s*.04,0,7);g.arc(x+s*.14,y-s*1.17,s*.04,0,7);g.fill();
  g.strokeStyle='#8a3b2e';g.lineWidth=Math.max(1,s*.05);g.lineCap='round';g.beginPath();g.arc(x,y-s*1.02,s*.11,.25,Math.PI-.25);g.stroke();
  g.fillStyle='#d63384';g.beginPath();g.moveTo(x-s*.12,y-s*.74);g.lineTo(x,y-s*.64);g.lineTo(x+s*.12,y-s*.74);g.lineTo(x+s*.16,y-s*.5);g.lineTo(x-s*.16,y-s*.5);g.closePath();g.fill();}
function dedFig(g,x,y,s){
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x+s*.1,y+s*.35,s*.62,s*.2,0,0,7);g.fill();
  g.fillStyle='#4b6584';g.beginPath();g.moveTo(x-s*.52,y+s*.3);g.lineTo(x-s*.36,y-s*.85);g.lineTo(x+s*.36,y-s*.85);g.lineTo(x+s*.52,y+s*.3);g.closePath();g.fill();
  g.fillStyle='#f3c9a3';g.beginPath();g.ellipse(x,y-s*1.14,s*.34,s*.36,0,0,7);g.fill();
  g.fillStyle='#596275';g.beginPath();g.ellipse(x,y-s*1.42,s*.4,s*.17,0,Math.PI,0);g.fill();g.fillRect(x-s*.4,y-s*1.44,s*.8,s*.07);g.beginPath();g.ellipse(x+s*.14,y-s*1.38,s*.36,s*.07,0,0,7);g.fill();
  g.fillStyle='#2d3436';g.beginPath();g.arc(x-s*.13,y-s*1.2,s*.04,0,7);g.arc(x+s*.13,y-s*1.2,s*.04,0,7);g.fill();
  g.fillStyle='#dfe4ea';g.beginPath();g.ellipse(x,y-s*1.0,s*.19,s*.07,0,0,7);g.fill();
  g.fillStyle='#fdfdfd';rrect(g,x-s*.36,y-s*.72,s*.72,s*.5,s*.03);g.fill();g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=Math.max(1,s*.03);g.beginPath();g.moveTo(x,y-s*.72);g.lineTo(x,y-s*.22);
  for(const k of [-.6,-.48,-.36])for(const sd of [-1,1]){g.moveTo(x+sd*s*.06,y+k*s);g.lineTo(x+sd*s*.3,y+k*s);}g.stroke();}

/* ===== Толик «Карбюратор» — «Покер на спички» (holdem/index.html) ===== */
const HD=(function(){
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

/* ===== Михалыч, Валерка — Викторина (js/look.js) ===== */
const VK=(function(){
var NEW={
 mihalych:function(s){return{old:1,body:'#5d6b7c',brow:'#9a9a9a',
  back:'<g transform="rotate(14 172 120)"><rect x="168" y="34" width="8" height="190" rx="4" fill="#b98a55" '+s+'/><path d="M152 6 h40 l-6 44 h-28z" fill="#e2b25c" '+s+'/><path d="M160 12 v32 M168 10 v36 M176 10 v36 M184 12 v32" stroke="#b98533" stroke-width="2.4"/><rect x="154" y="44" width="36" height="9" rx="3" fill="#c0392b" '+s+'/></g>',
  bodyX:'<path d="M56 158 l24 -6 l20 30 l20 -30 l24 6 q30 8 38 34 v28 H18 v-28 q8 -26 38 -34z" fill="#ff8a1f" '+s+'/><path d="M20 196 h160" stroke="#f4f6f4" stroke-width="12"/><path d="M20 196 h160" stroke="#c9d2cf" stroke-width="2" stroke-dasharray="3 5"/><path d="M80 152 l20 30 l20 -30" fill="#39485a" '+s+'/>',
  hat:'<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#6f5136" '+s+'/><path d="M42 82 q58 -22 116 0 v14 q-58 -20 -116 0z" fill="#9b7650" '+s+'/><path d="M42 84 q-12 30 0 52 q10 -4 13 -18 q-5 -16 -3 -32z M158 84 q12 30 0 52 q-10 -4 -13 -18 q5 -16 3 -32z" fill="#9b7650" '+s+'/><path d="M92 28 q8 -8 16 0" stroke="#4d3722" stroke-width="3" fill="none" stroke-linecap="round"/>',
  under:'<path d="M70 128 q14 -10 30 -3 q16 -7 30 3 q-6 14 -30 9 q-24 5 -30 -9z" fill="#c9cdd2" '+s+'/>'};},
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

/* ===== Сан Саныч — Викторина-CAR (js/look-sansan.js) ===== */
const SS=(function(){
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
return {look:look,bust:bust};})();

/* ===== Митяй (Рыбалка) и тётя Валя (Гастроном) — рамка Викторины js/look-kin.js ===== */
const KN=(function(){
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

/* ===== Баба Зина — js/look-zina.js Викторины (рисунок игры «Баба Зина») ===== */
const ZN=(function(){
var N=0;
function draw(m,s){m=m||'norm';s=s||'';
 var u='zv'+(++N),B='#8d8f99';
 var eyes=m==='happy'
  ?'<path d="M75 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.2" fill="none" stroke-linecap="round"/>'
  :m==='wow'
  ?'<circle cx="83" cy="95" r="5.2" fill="#3a2a22"/><circle cx="117" cy="95" r="5.2" fill="#3a2a22"/><circle cx="84.5" cy="93.5" r="1.6" fill="#fff"/><circle cx="118.5" cy="93.5" r="1.6" fill="#fff"/>'
  :'<ellipse cx="83" cy="'+(m==='sad'?97:96)+'" rx="4" ry="'+(m==='sad'?3.8:4.6)+'" fill="#3a2a22"/><ellipse cx="117" cy="'+(m==='sad'?97:96)+'" rx="4" ry="'+(m==='sad'?3.8:4.6)+'" fill="#3a2a22"/><circle cx="84.3" cy="94.4" r="1.3" fill="#fff"/><circle cx="118.3" cy="94.4" r="1.3" fill="#fff"/>';
 var brows=m==='stern'
  ?'<path d="M72 80 L92 85" stroke="'+B+'" stroke-width="4" stroke-linecap="round"/><path d="M128 80 L108 85" stroke="'+B+'" stroke-width="4" stroke-linecap="round"/>'
  :m==='wow'
  ?'<path d="M72 78 q10 -7 20 -1" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M108 77 q10 -6 20 1" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='sad'
  ?'<path d="M72 85 q10 -1 20 -8" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M128 85 q-10 -1 -20 -8" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :'<path d="M72 83 q10 -5 20 0" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M108 83 q10 -5 20 0" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
 var mouth=m==='wow'
  ?'<ellipse cx="100" cy="126" rx="7" ry="8" fill="#b83b44"/><ellipse cx="100" cy="129" rx="4" ry="3.5" fill="#e0707a"/>'
  :m==='stern'
  ?'<path d="M89 126 q11 -3 22 0" stroke="#b83b44" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='sad'
  ?'<path d="M88 128 q12 -9 24 0" stroke="#b83b44" stroke-width="4.2" fill="none" stroke-linecap="round"/>'
  :m==='happy'
  ?'<path d="M84 119 q16 19 32 0 q-16 6 -32 0z" fill="#b83b44"/><path d="M89 123 q11 6 22 0" fill="#fff" opacity=".9"/>'
  :'<path d="M86 121 q14 13 28 0" stroke="#b83b44" stroke-width="4.2" fill="none" stroke-linecap="round"/>';
 var beads='';for(var i=0;i<9;i++){var a=Math.PI*(.15+.7*i/8);beads+='<circle cx="'+(100-Math.cos(a)*30).toFixed(1)+'" cy="'+(150+Math.sin(a)*14).toFixed(1)+'" r="4.2"/>';}
 return '<defs><radialGradient id="zf'+u+'" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="#f2bf9b"/></radialGradient>'+
  '<linearGradient id="zh'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f5"/><stop offset="1" stop-color="#b9bfcc"/></linearGradient>'+
  '<linearGradient id="zc'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a64b8"/><stop offset="1" stop-color="#6f3f8c"/></linearGradient></defs>'+
  '<path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="url(#zc'+u+')" '+s+'/>'+
  '<path d="M84 146 l16 22 l16 -22z" fill="#fff"/><path d="M84 146 l-8 12 l14 8z M116 146 l8 12 l-14 8z" fill="#f4f1fa"/>'+
  '<g fill="#fff8e6" stroke="#e8d9b0" stroke-width="1">'+beads+'</g>'+
  '<path d="M40 188 q10 -20 26 -26 M160 188 q-10 -20 -26 -26" stroke="#5c3375" stroke-width="3" fill="none" opacity=".5"/>'+
  '<rect x="88" y="128" width="24" height="22" rx="8" fill="#eab28f"/>'+
  '<circle cx="100" cy="30" r="22" fill="url(#zh'+u+')" '+s+'/><path d="M84 26 q16 -12 32 0" stroke="#a8afbf" stroke-width="2.5" fill="none"/>'+
  '<circle cx="53" cy="104" r="8" fill="#f2bf9b" '+s+'/><circle cx="147" cy="104" r="8" fill="#f2bf9b" '+s+'/>'+
  '<ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#zf'+u+')" '+s+'/>'+
  '<path d="M52 92 q-4 -46 48 -50 q52 4 48 50 q-6 -26 -22 -32 q-10 14 -52 12 q-16 4 -22 20z" fill="url(#zh'+u+')" '+s+'/>'+
  '<path d="M60 70 q10 -14 24 -16 M140 70 q-10 -14 -24 -16 M76 56 q12 -8 26 -6" stroke="#a8afbf" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
  '<circle cx="52" cy="115" r="3.5" fill="#f5b72d"/><circle cx="148" cy="115" r="3.5" fill="#f5b72d"/>'+
  '<ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/>'+
  brows+eyes+
  '<g fill="rgba(200,225,255,.28)" stroke="#6d4b3d" stroke-width="3"><circle cx="83" cy="96" r="14"/><circle cx="117" cy="96" r="14"/></g>'+
  '<path d="M97 95 q3 -3 6 0" stroke="#6d4b3d" stroke-width="3" fill="none"/><path d="M69 94 l-14 -5 M131 94 l14 -5" stroke="#6d4b3d" stroke-width="3"/>'+
  '<path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="#d99a78" stroke-width="3" fill="none" stroke-linecap="round"/>'+mouth+
  '<path d="M66 132 q6 4 10 2 M134 132 q-6 4 -10 2" stroke="#e0a585" stroke-width="2" fill="none" opacity=".7"/>';}
// контур темы (stroke="…" stroke-width="3") — в масштабе 1,1 тоньше, чтобы на экране совпал с соседями
function thin(s){return (s||'').replace(/stroke-width="([\d.]+)"/,function(a,w){return 'stroke-width="'+(w/1.1).toFixed(2)+'"';});}
return {draw:draw,thin:thin};})();

/* ===== общий вид ===== */
const INFO={
  shura:{name:'Баба Шура',short:'Шура',role:'старшая по двору, голос игры',from:'Выезд со двора'},
  tolik:{name:'Толик «Карбюратор»',short:'Толик',role:'гаражный мастер: реставрация машин, барахолка',from:'Покер на спички'},
  mityai:{name:'Дед Митяй',short:'Митяй',role:'рыбак-враль, Запорожец «на рыбалку»',from:'Рыбалка с Петровичем'},
  mihalych:{name:'Михалыч',short:'Михалыч',role:'дворник, ворчит про машины на газоне',from:'Дворовая викторина'},
  valerka:{name:'Валерка',short:'Валерка',role:'школьник, учится водить',from:'Дворовая викторина'},
  valya:{name:'Тётя Валя',short:'Валя',role:'продавщица, хлебный фургон к открытию',from:'Гастроном'},
  sansan:{name:'Сан Саныч',short:'Сан Саныч',role:'физрук-пенсионер, чемпион города',from:'Дворовая викторина'},
  zina:{name:'Баба Зина',short:'Зина',role:'учительница, «внучок, отвези на дачу»',from:'Баба Зина'},
  ded:{name:'Дед с газетой',short:'Дед',role:'сосед с лавочки, комментатор',from:'Выезд со двора'}
};
const IDS=Object.keys(INFO);
const inner=s=>s.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
let UID=0;
function canvasUrl(fn,w,h){try{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g);return c.toDataURL('image/png');}catch(e){return '';}}
const DEDURL={};
// Митяй, Валя и дед — родные рисунки на canvas: в разметку кладём короткую blob:-ссылку (а не data: на 50 КБ в каждом окне)
const BLOB={};
function blobUrl(d){if(!d)return '';if(BLOB[d])return BLOB[d];try{const b=atob(d.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);
  return BLOB[d]=URL.createObjectURL(new Blob([a],{type:'image/png'}));}catch(e){return BLOB[d]=d;}}
function dedUrl(){return DEDURL.u||(DEDURL.u=canvasUrl(g=>{g.scale(2,2);dedFig(g,100,247,145);},400,440));}
// содержимое бюста в координатах 200×220
function bustInnerOf(id,m,asData){m=m==='clap'?'happy':(m||'norm');
  if(id==='shura')return '<g transform="translate(0 20) scale(3.3333)">'+inner(shuraSvg(m==='sad'?'sad':''))+'</g>';
  if(id==='tolik'){const s=inner(HD.headSvg(HD.TOLIK,m)).replace(/<rect width="200" height="200" fill="[^"]*"\/>/,'');return '<g transform="translate(0 20)">'+s+'</g>';}
  if(id==='mihalych'||id==='valerka')return VK.bustInner(id,m);
  if(id==='sansan')return SS.bust(SS.look(OUT()),m);
  if(id==='zina')return '<g transform="matrix(1.1 0 0 1.1 -10 0)">'+ZN.draw(m,ZN.thin(OUT()))+'</g>';
  if(id==='mityai'||id==='valya')return '<image href="'+(asData?KN.draw(id,m):blobUrl(KN.draw(id,m)))+'" x="0" y="0" width="200" height="220"/>';
  if(id==='ded')return '<image href="'+(asData?dedUrl():blobUrl(dedUrl()))+'" x="0" y="0" width="200" height="220"/>';
  return '';}
const BC={};
function bust(id,m){m=m||'norm';if(!INFO[id])return '';
  // без кэша: у Толика и Зины id градиентов свои на каждую вставку — одинаковые id в разных местах страницы ломаются, когда первое убирают
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" class="bust" data-who="'+id+'/'+m+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+bustInnerOf(id,m)+'</svg>';}
// окно лица (в координатах бюста)
const FACE={shura:'30 40 140 140',tolik:'36 32 128 128',mihalych:'34 14 132 132',valerka:'34 20 132 132',sansan:'34 20 132 132',zina:'34 14 132 132',mityai:'38 20 124 124',valya:'38 22 124 124',ded:'36 22 128 128'};
function face(id,cls){if(!INFO[id])return '';return '<svg xmlns="http://www.w3.org/2000/svg" class="'+(cls||'face')+'" viewBox="'+(FACE[id]||'34 6 132 150')+'" aria-hidden="true">'+bustInnerOf(id,'norm')+'</svg>';}

/* окно пятиэтажки 100×120: рама, стекло (день — небо, вечер — тёплый свет), занавески, жилец по пояс, подоконник (кот/герань), значок поручения */
const SIL={man:['#4a6278','#3a4f63'],woman:['#9a5a7a','#7d4762'],kid:['#5c8a4a','#476d39']};
function silhouette(k,lit){const c=SIL[k]||SIL.man,b=lit?c[1]:c[0],hair=k==='woman'?'<path d="M66 70 q-6 -40 34 -42 q40 2 34 42 q-4 -22 -34 -24 q-30 2 -34 24z" fill="#5a3a2a"/>':k==='kid'?'<path d="M70 60 q2 -26 30 -28 q28 2 30 28 q-30 -14 -60 0z" fill="#b8742e"/>':'<path d="M68 58 q4 -26 32 -26 q28 0 32 26 q-32 -10 -64 0z" fill="#3a3330"/>';
  const sc=k==='kid'?.82:1;return '<g transform="translate('+(100-100*sc)+' '+(220-220*sc)+') scale('+sc+')"><path d="M30 220 q4 -60 70 -66 q66 6 70 66z" fill="'+b+'"/><ellipse cx="100" cy="80" rx="34" ry="38" fill="'+(lit?'#d9a37f':'#f1c7a6')+'"/>'+hair+'</g>';}
function win(id,o){o=o||{};const u='vw'+(++UID),lit=!!o.lit,glass=lit?'#ffd98a':'#a9d4ef',glass2=lit?'#ffc65a':'#cfe9f8',fr='#f4efe4',dk='#8a7f70';
  let who='';
  if(id&&INFO[id])who='<svg x="8" y="16" width="84" height="88" viewBox="'+(o.far?'0 0 200 220':'16 18 168 176')+'" preserveAspectRatio="xMidYMax meet">'+bustInnerOf(id,o.mood||'norm')+'</svg>';
  else if(id&&SIL[id])who='<svg x="16" y="30" width="68" height="72" viewBox="0 0 200 220" preserveAspectRatio="xMidYMax meet">'+silhouette(id,lit)+'</svg>';
  const pet=o.pet==='cat'?'<g transform="translate(66 92)"><ellipse cx="10" cy="10" rx="11" ry="7" fill="#3b3b40"/><circle cx="20" cy="2" r="6" fill="#3b3b40"/><path d="M16 -2 l1 -6 l4 4z M22 -3 l3 -6 l2 6z" fill="#3b3b40"/><path d="M-1 10 q-6 -2 -5 -9" stroke="#3b3b40" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="21" cy="2" r="1.2" fill="#ffd23f"/></g>'
    :o.pet==='flower'?'<g transform="translate(70 84)"><path d="M2 10 h16 l-2 12 h-12z" fill="#c8643a"/><circle cx="6" cy="4" r="5" fill="#e5484d"/><circle cx="14" cy="3" r="5" fill="#ff6b7a"/><circle cx="10" cy="-2" r="5" fill="#e5484d"/><path d="M4 9 q6 -4 12 0" stroke="#3f8a3a" stroke-width="3" fill="none"/></g>':'';
  const badge=o.badge?'<g transform="translate(80 10)"><circle r="11" fill="#ffc233" stroke="#233247" stroke-width="2.5"/><text y="5" font-family="Arial" font-weight="900" font-size="15" text-anchor="middle" fill="#233247">'+o.badge+'</text></g>':'';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"'+(o.w?' width="'+o.w+'"':'')+(o.h?' height="'+o.h+'"':'')+' class="vywin" aria-hidden="true">'+
    '<defs><clipPath id="'+u+'"><rect x="10" y="10" width="80" height="92" rx="2"/></clipPath></defs>'+
    '<rect x="4" y="4" width="92" height="104" rx="4" fill="'+fr+'" stroke="'+dk+'" stroke-width="2"/>'+
    '<g clip-path="url(#'+u+')"><rect x="10" y="10" width="80" height="92" fill="'+glass+'"/><path d="M10 10 h80 v40 q-40 -16 -80 0z" fill="'+glass2+'" opacity=".6"/>'+
    (lit?'<circle cx="50" cy="20" r="5" fill="#fff6c8"/>':'')+(who?'<path d="M10 36 h80 M50 10 v26" stroke="'+fr+'" stroke-width="3.5"/>':'')+who+
    '<path d="M10 10 h22 q-6 30 4 92 h-26z" fill="'+(lit?'#e8a04a':'#f2d0d6')+'" opacity=".92"/><path d="M90 10 h-22 q6 30 -4 92 h26z" fill="'+(lit?'#e8a04a':'#f2d0d6')+'" opacity=".92"/>'+
    '<path d="M10 10 h80 v7 h-80z" fill="'+(lit?'#d48a36':'#e7b9c2')+'"/></g>'+
    (who?'':'<path d="M10 36 h80 M50 10 v26 M50 36 v66" stroke="'+fr+'" stroke-width="3.5"/>')+(o.open?'<path d="M50 11 l20 -5 v28 l-20 3z" fill="'+glass2+'" stroke="'+fr+'" stroke-width="2.5"/>':'')+
    '<rect x="1" y="100" width="98" height="9" rx="3" fill="#e9e2d2" stroke="'+dk+'" stroke-width="2"/>'+pet+badge+'</svg>';}

const IMG={};
function img(id,m){const k=id+':'+(m||'norm');if(IMG[k])return IMG[k];if(!INFO[id])return null;
  const s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">'+bustInnerOf(id,m,true)+'</svg>';const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);return IMG[k]=im;}
function fig(id,g,x,y,s){if(id==='shura'){shuraFig(g,x,y,s);return true;}if(id==='ded'){dedFig(g,x,y,s);return true;}
  const im=img(id,'norm');if(!im||!im.complete||!im.naturalWidth)return false;const w=s*1.25,h=w*1.1;g.drawImage(im,x-w/2,y-h+s*.3,w,h);return true;}

// просьба UX (ART.md): VYPPL.svg(who,mood,opts) — квадрат «по пояс», без фона, низ — плечи; mood 'clap' = 'happy'
function sq(id,m,o){if(!INFO[id])return '';o=o||{};return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="5 28 190 190"'+(o.cls?' class="'+o.cls+'"':'')+' preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+bustInnerOf(id,m)+'</svg>';}
window.VYPEOPLE={ids:IDS,info:INFO,bust:bust,face:face,win:win,fig:fig,img:img,sq:sq};
window.VYPPL={svg:sq,ids:IDS,info:INFO};
})();
