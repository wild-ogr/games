/* Фасад «Школа №7» (поток CAB). 400×300, стиль кабинетов CAB-1/CAB-2 (плоские цвета, ZRubik).
   ZB_CAB.school.svg(lv, r, lit): lv 1 — облупленная (доски на окнах, трещины, «Закрыто»), 2 — ремонт (леса, краска), 3 — как новенькая (клумбы, флаг);
   r — preserveAspectRatio (по умолчанию xMidYMid slice); lit — сколько кабинетов открыто (0–8): столько окон светятся тёплым. id градиентов — свои на каждый вызов. */
(function(){var A=window.ZB_CAB=window.ZB_CAB||{},k=0;
var LITW=[7,10,4,12,1,16,6,17]; // какие окна загораются по мере открытия кабинетов (номер окна — ряд*6+столбец)
function win(x,y,i,lv,lit,u){var on=LITW.indexOf(i)>=0&&LITW.indexOf(i)<lit,s='';
  var glass=on?'#ffd97a':lv===1?'#7d8ea3':'#a9d4ef';
  s+='<rect x="'+x+'" y="'+y+'" width="30" height="36" rx="2" fill="'+(lv===1?'#e9e0cc':'#fbf7ec')+'"/>';
  s+='<rect x="'+(x+3)+'" y="'+(y+3)+'" width="24" height="30" fill="'+glass+'"/>';
  if(!on&&lv>1)s+='<path d="M'+(x+3)+' '+(y+3)+' h24 v10 q-12 -5 -24 2z" fill="#cfe9f8" opacity=".7"/>';
  if(on)s+='<path d="M'+(x+3)+' '+(y+3)+' h7 q-3 14 1 30 h-8z M'+(x+27)+' '+(y+3)+' h-7 q3 14 -1 30 h8z" fill="#e8a04a" opacity=".85"/>';
  s+='<path d="M'+(x+15)+' '+(y+3)+' v30 M'+(x+3)+' '+(y+14)+' h24" stroke="'+(lv===1?'#e9e0cc':'#fbf7ec')+'" stroke-width="2.4"/>';
  if(lv===1&&!on&&(i%4===1||i===14))s+='<path d="M'+(x+1)+' '+(y+4)+' l28 26 M'+(x+29)+' '+(y+4)+' l-28 26" stroke="#b08a5a" stroke-width="5" stroke-linecap="round"/>';
  if(lv===1&&!on&&i===5)s+='<path d="M'+(x+6)+' '+(y+8)+' l8 9 l-3 7 l9 6" stroke="#fff" stroke-width="1.6" fill="none"/>';
  if(lv===3&&!on&&i%3===0)s+='<g transform="translate('+(x+15)+' '+(y+36)+')"><rect x="-13" y="-4" width="26" height="6" rx="2" fill="#c8643a"/><circle cx="-7" cy="-7" r="4" fill="#e5484d"/><circle cx="0" cy="-8" r="4" fill="#ff6b7a"/><circle cx="7" cy="-7" r="4" fill="#e5484d"/></g>';
  s+='<rect x="'+(x-3)+'" y="'+(y+35)+'" width="36" height="4" rx="1.5" fill="'+(lv===1?'#cfc4ad':'#e9e2d2')+'"/>';
  return s;}
function tree(x,y,s,lv){var c=lv===1?['#8a9a5b','#76874c']:['#5aa04a','#3f8a3a'];
  return '<g transform="translate('+x+' '+y+') scale('+s+')"><rect x="-4" y="-6" width="8" height="40" fill="#8a5a3c"/><circle cx="0" cy="-22" r="24" fill="'+c[0]+'"/><circle cx="-14" cy="-10" r="16" fill="'+c[1]+'"/><circle cx="14" cy="-12" r="17" fill="'+c[1]+'"/>'+
    (lv===3?'<circle cx="-6" cy="-30" r="3" fill="#ff6b7a"/><circle cx="9" cy="-20" r="3" fill="#ffd166"/>':'')+'</g>';}
A.school={id:'school',n:'Школа №7',c:'#cfe6f7',svg:function(lv,r,lit){lv=lv===2||lv===3?lv:1;lit=Math.max(0,Math.min(8,+lit||0));var u='zs'+(++k);
var wall=lv===1?'#e3c48a':lv===2?'#f1cf8c':'#f6d58f',wall2=lv===1?'#c9a76c':'#e3b96b',roof=lv===1?'#7a5a48':'#9a4a3a',sky1=lv===3?'#8fd0f5':'#a9cfe6',sky2=lv===3?'#e6f6ff':'#e7eef3';
var s='<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="'+(r||'xMidYMid slice')+'" font-family="ZRubik,Arial,sans-serif">'+
'<defs><linearGradient id="'+u+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky1+'"/><stop offset="1" stop-color="'+sky2+'"/></linearGradient></defs>'+
'<rect width="400" height="300" fill="url(#'+u+'s)"/>';
// облака / солнце
s+=lv===3?'<circle cx="340" cy="40" r="20" fill="#ffe27a"/><circle cx="340" cy="40" r="28" fill="#ffe27a" opacity=".3"/>':'';
s+='<g fill="#fff" opacity="'+(lv===1?.75:.95)+'"><ellipse cx="70" cy="40" rx="26" ry="10"/><ellipse cx="90" cy="34" rx="18" ry="10"/><ellipse cx="250" cy="28" rx="22" ry="8"/></g>';
// двор
s+='<rect y="236" width="400" height="64" fill="'+(lv===1?'#a9a28a':'#b8c98f')+'"/><path d="M150 300 L172 240 h56 L250 300z" fill="'+(lv===1?'#9b917a':'#d9cfb4')+'"/>';
s+=tree(34,232,1,lv)+tree(372,236,.9,lv);
// здание
s+='<rect x="52" y="78" width="296" height="160" fill="'+wall+'"/><rect x="52" y="78" width="296" height="10" fill="'+wall2+'"/>';
s+='<path d="M44 80 L200 52 L356 80z" fill="'+roof+'"/><rect x="44" y="76" width="312" height="6" fill="'+roof+'"/>';
// окна 3 ряда × 6, середина — вход
var i=0;for(var rw=0;rw<3;rw++)for(var cl=0;cl<6;cl++){var x=66+cl*46+(cl>=3?14:0)-(cl>=3?0:0),y=96+rw*46;
  if((rw===2||rw===1)&&(cl===2||cl===3)){i++;continue;}s+=win(x>=170&&x<230?x:x,y,i,lv,lit,u);i++;}
// портик и вход
s+='<rect x="168" y="176" width="64" height="62" fill="'+wall2+'"/><rect x="180" y="190" width="40" height="48" rx="3" fill="'+(lv===1?'#6b4a32':'#8a5a3c')+'"/><path d="M200 190 v48" stroke="#5a3a28" stroke-width="2"/>';
s+='<circle cx="196" cy="216" r="2" fill="#f5b72d"/><circle cx="204" cy="216" r="2" fill="#f5b72d"/><rect x="160" y="236" width="80" height="6" fill="#bcb3a0"/>';
// вывеска
var tilt=lv===1?' rotate(-6 200 162)':'';
s+='<g transform="translate(0 0)'+tilt+'"><rect x="146" y="150" width="108" height="24" rx="4" fill="'+(lv===1?'#4d5d77':'#1d4fa3')+'"/><text x="200" y="167" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">ШКОЛА №7</text></g>';
// флагшток / часы
s+='<circle cx="200" cy="66" r="9" fill="#fbf7ec" stroke="'+wall2+'" stroke-width="2"/><path d="M200 60 v6 l4 3" stroke="#27324a" stroke-width="1.6" fill="none"/>';
if(lv===1){
  // трещины, облупленная штукатурка, «Закрыто», лужа, голубь
  s+='<g fill="#d9b679" opacity=".9"><path d="M60 120 q12 -6 20 4 q-8 10 -20 4z"/><path d="M300 200 q14 -4 22 6 q-10 8 -22 2z"/><path d="M240 92 q10 -2 14 6 q-8 6 -14 0z"/></g>';
  s+='<path d="M120 80 l6 18 l-5 10 l7 16 M330 150 l-8 14 l4 12" stroke="#8a6a45" stroke-width="2" fill="none"/>';
  s+='<g transform="translate(250 196) rotate(8)"><rect width="62" height="30" rx="2" fill="#fff"/><text x="31" y="13" font-size="9" font-weight="800" fill="#d7263d" text-anchor="middle">ЗАКРЫТО</text><text x="31" y="24" font-size="6.5" fill="#27324a" text-anchor="middle">на учёт. Навсегда</text></g>';
  s+='<ellipse cx="120" cy="262" rx="40" ry="7" fill="#8ea6b8" opacity=".7"/>';
  s+='<g transform="translate(300 78)"><ellipse cx="0" cy="-5" rx="8" ry="6" fill="#8d97a6"/><circle cx="6" cy="-10" r="4" fill="#8d97a6"/><path d="M10 -10 l4 1 l-4 1z" fill="#e0a040"/></g>';
}else if(lv===2){
  // леса справа, ведро, валик, баннер «Идёт ремонт»
  s+='<g stroke="#8a5a3c" stroke-width="4"><path d="M286 236 V90 M344 236 V90 M280 132 h70 M280 178 h70 M280 222 h70"/><path d="M286 132 l58 46 M344 178 l-58 44" stroke-width="2.5"/></g>';
  s+='<rect x="296" y="122" width="40" height="10" fill="#c99b5a"/><g transform="translate(316 112)"><rect x="-6" y="-4" width="12" height="14" fill="#2f6fd6"/><path d="M-6 -4 q6 -6 12 0" stroke="#27324a" stroke-width="1.5" fill="none"/></g>';
  s+='<path d="M66 236 v-30 h18 v30" fill="none"/><g transform="translate(98 248)"><path d="M-10 -14 h20 l-3 16 h-14z" fill="#e8e8e8"/><path d="M-10 -14 h20 v4 h-20z" fill="#5aa04a"/></g>';
  s+='<g transform="translate(74 250) rotate(-30)"><rect x="-4" y="-22" width="8" height="18" rx="3" fill="#5aa04a"/><rect x="-1" y="-4" width="2" height="18" fill="#8a5a3c"/></g>';
  s+='<rect x="64" y="58" width="96" height="16" rx="3" fill="#fff" transform="rotate(-4 112 66)"/><text x="112" y="70" font-size="9" font-weight="800" fill="#c2410c" text-anchor="middle" transform="rotate(-4 112 66)">ИДЁТ РЕМОНТ!</text>';
}else{
  // клумбы, флажки, баннер «Добро пожаловать»
  s+='<path d="M52 92 Q120 110 200 92 Q280 110 348 92" stroke="#c2410c" stroke-width="1.5" fill="none"/>';
  [70,96,122,148,252,278,304,330].forEach(function(x,j){var y=98+(Math.abs(x-200)<80?2:0);s+='<path d="M'+(x-5)+' '+(y)+' l5 10 l5 -10z" fill="'+['#e5484d','#f5b72d','#2f6fd6','#34a853'][j%4]+'"/>';});
  s+='<ellipse cx="110" cy="250" rx="38" ry="9" fill="#7a4a2a"/><ellipse cx="290" cy="250" rx="38" ry="9" fill="#7a4a2a"/>';
  [[84,244],[98,240],[112,244],[126,240],[138,246],[264,244],[278,240],[292,244],[306,240],[318,246]].forEach(function(p,j){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="'+['#ff6b7a','#ffd166','#e5484d','#fff','#b18cff'][j%5]+'"/>';});
  s+='<g transform="translate(200 30)"><rect x="-1" y="0" width="2" height="24" fill="#8a8f9a"/><path d="M1 1 h22 l-4 6 l4 6 h-22z" fill="#e5484d"/></g>';
  s+='<rect x="150" y="134" width="100" height="12" rx="3" fill="#fff"/><text x="200" y="143" font-size="7.5" font-weight="800" fill="#237a3b" text-anchor="middle">ДОБРО ПОЖАЛОВАТЬ!</text>';
}
return s+'</svg>';}};
})();
