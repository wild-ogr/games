/* Баба Зина — ОБЩИЙ персонаж серии (правило владельца 09.10: один герой = один облик во всех играх).
   Родной рисунок — игра «Баба Зина: слова из букв» (~/Projects/slovo, js/text.js zinaSVG, наряд по умолчанию «Выходная кофта» lilac):
   седой пучок, круглые очки в коричневой оправе, золотые серёжки, лиловая кофта с белым воротничком и жемчужными бусами.
   Здесь — та же рисовка, лицо и цвета один в один; добавлено только:
   - настроение sad (в «Зине» есть norm|happy|wow|stern, Викторине нужно norm|happy|sad|wow);
   - контур из темы Викторины (в «Дворовом шоу» у всех жителей обводка) — тонкий, только по силуэту.
   ZINA_ART.bust(m,stroke) — по пояс 200×220 (новый вид, LK.who), ZINA_ART.head(m) — 200×200 с фоном («Классика», portrait),
   ZINA_ART.face(stroke,cls) — голова для значка 👵 (face:zina). Грузится в <head> ДО js/look.js; look.js и portrait() зовут его для id 'zina'. */
(function(){
'use strict';
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
function bust(m,s){return '<svg viewBox="0 0 200 220" class="bust" data-pv="zina/'+(m||'norm')+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><g transform="matrix(1.1 0 0 1.1 -10 0)">'+draw(m,thin(s))+'</g></svg>';}
function head(m){return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" data-pv="zina/'+(m||'norm')+'"><rect width="200" height="200" fill="#f3ecf7"/>'+draw(m,'')+'</svg>';}
function face(s,cls){return '<svg class="ic face'+(cls?' '+cls:'')+'" viewBox="36 4 128 146" aria-hidden="true" focusable="false">'+draw('norm',s)+'</svg>';}
window.ZINA_ART={bust:bust,head:head,face:face,draw:draw};
})();
