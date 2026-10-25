'use strict';
/* zb3-art-desk — «стол Зины» под газетой и письмом в стиле MIX (поток SKIN; СОБРАН скриптом z3-skin-tools/desk_port.py из art/art3-tools/src/mix.js —
   руками не править: правка в desk_tpl.js и перегнать). Грузится лениво: Z3.artLoad('desk').then(…) (js/zb3-skin.js).
   Z3ART.desk({kind:'paper'|'mail', w, h, pc}) → <svg> w×h: деревянный стол + предметы по краям (газета: карандаш, чай с лимоном, баранки, лупа;
     письмо: клетчатая салфетка, связка писем, ключ №12, чай). Лист кладёт сам экран (PAPER/MAIL) поверх, в свободное место:
   Z3ART.deskFree(kind, w, h, pc) → [x, y, w, h] — куда класть лист (предметы туда не заходят).
   Z3ART.deskCss — классы листа (вставить один раз): .z3-sheet (газетный лист: бумага, тень, лёгкий поворот), .z3-mast (шапка «Вечёрка» Lobster),
     .z3-letter (линованный лист письма, почерк ZCaveat), .z3-sig (подпись Зины). Цвета — var(--z3-*). Зина/кот — игровые, экраны вставляют сами. */
(function(){
  var A=window.Z3ART=window.Z3ART||{};
  function sv(vb,inner){return '<svg viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg">'+inner+'</svg>';}
  function strip(s){return s.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');}
function pencil(){return sv('0 0 260 30',`<rect x="20" y="6" width="200" height="18" fill="#f5b72d"/><rect x="20" y="6" width="200" height="6" fill="#ffd25e"/><path d="M220 6 L254 15 L220 24Z" fill="#f2d2a8"/><path d="M244 12 L254 15 L244 18Z" fill="#27324a"/><rect x="2" y="6" width="22" height="18" rx="3" fill="#e2463b"/><rect x="20" y="5" width="8" height="20" fill="#c9cfdc"/>`)}
function teaTop(){return sv('0 0 200 200',`<circle cx="100" cy="100" r="96" fill="#fff" opacity=".95"/><circle cx="100" cy="100" r="86" fill="none" stroke="#d0342c" stroke-width="3"/><circle cx="100" cy="100" r="64" fill="#fff"/><circle cx="100" cy="100" r="56" fill="#8a4a1e"/><circle cx="100" cy="100" r="56" fill="url(#gTea)"/><circle cx="118" cy="86" r="16" fill="#f5d36a" opacity=".9"/><circle cx="118" cy="86" r="11" fill="none" stroke="#e8b63a" stroke-width="2"/><path d="M160 100 h30 q8 0 8 8 v4" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round"/>`)}
function bagels(){return sv('0 0 200 150',[[60,60],[130,50],[100,105]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="40" fill="#c9843a"/><circle cx="${x-4}" cy="${y-4}" r="34" fill="#e0a256"/><circle cx="${x}" cy="${y}" r="13" fill="#9a5d34"/>${[0,1,2,3,4,5].map(j=>`<circle cx="${x+Math.cos(j)*24}" cy="${y+Math.sin(j)*24}" r="2" fill="#fff6e0"/>`).join('')}`).join(''))}
function magnifier(){return sv('0 0 200 120',`<path d="M110 70 L190 110" stroke="#8a5a2a" stroke-width="14" stroke-linecap="round"/><circle cx="70" cy="50" r="44" fill="#dff1ff" opacity=".35"/><circle cx="70" cy="50" r="44" fill="none" stroke="#c9a25a" stroke-width="8"/><path d="M44 32 q14 -16 36 -12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`)}
function bundle(){return sv('0 0 240 170',`<g transform="rotate(-8 120 85)">${[16,10,4].map((o,i)=>`<rect x="${20+o}" y="${30-o}" width="190" height="120" rx="6" fill="${['#e9dcc0','#efe3c8','#f6ecd6'][i]}"/>`).join('')}<path d="M24 92 H214 M120 26 V150" stroke="#a9673a" stroke-width="4"/><path d="M120 92 q-26 -24 -30 4 q20 6 30 -4 q26 -24 30 4 q-20 6 -30 -4z" fill="none" stroke="#a9673a" stroke-width="4"/><text x="160" y="58" font-family="ZCaveat,cursive" font-size="20" fill="#6b5a4a">от Гали, 1979</text></g>`)}
function keyTag(){return sv('0 0 200 90',`<rect x="6" y="20" width="56" height="30" rx="4" fill="#efe6d4" transform="rotate(-12 34 35)"/><text x="16" y="44" font-family="ZRubik,sans-serif" font-weight="800" font-size="15" fill="#6b5a4a" transform="rotate(-12 34 35)">№12</text><path d="M60 40 Q80 44 96 50" stroke="#d0342c" stroke-width="2" fill="none"/><circle cx="114" cy="52" r="18" fill="none" stroke="#c9a25a" stroke-width="8"/><path d="M130 58 L190 80 M170 72 l-4 10 M182 76 l-4 10" stroke="#c9a25a" stroke-width="8" stroke-linecap="round"/>`)}
  function put(svgStr,vbw,vbh,x,y,wd,rot){var k=wd/vbw;return '<g transform="translate('+x.toFixed(0)+' '+y.toFixed(0)+') rotate('+(rot||0)+' '+(wd/2).toFixed(0)+' '+(vbh*k/2).toFixed(0)+') scale('+k.toFixed(3)+')">'+strip(svgStr)+'</g>';}
  A.deskFree=function(kind,w,h,pc){if(!pc)return [10,64,w-20,h-74];return kind==='mail'?[w*.4,h*.1,w*.5,h*.8]:[w*.14,h*.1,w*.72,h*.86];};
  var K=0;
  A.desk=function(o){o=o||{};var w=Math.max(200,Math.round(o.w||390)),h=Math.max(300,Math.round(o.h||700)),pc=!!o.pc,kind=o.kind==='mail'?'mail':'paper',k='dk'+(++K),s='';
    s+='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" preserveAspectRatio="none" aria-hidden="true"><defs>'+
      '<radialGradient id="gTea" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#c9772e" stop-opacity=".6"/><stop offset="1" stop-color="#5a2a0e" stop-opacity=".4"/></radialGradient>'+
      '<radialGradient id="'+k+'v" cx=".5" cy=".45" r=".8"><stop offset=".6" stop-color="#3a2010" stop-opacity="0"/><stop offset="1" stop-color="#3a2010" stop-opacity=".3"/></radialGradient>'+
      '<pattern id="'+k+'c" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#fff6ef"/><rect width="20" height="20" fill="#e88a80" opacity=".7"/><rect x="20" y="20" width="20" height="20" fill="#e88a80" opacity=".7"/><rect x="20" width="20" height="20" fill="#e88a80" opacity=".3"/><rect y="20" width="20" height="20" fill="#e88a80" opacity=".3"/></pattern></defs>';
    s+='<rect width="'+w+'" height="'+h+'" fill="#b97a48"/>';
    for(var i=0,y=0;y<h;i++,y+=64)s+='<rect y="'+y+'" width="'+w+'" height="62" fill="'+(i%2?'#c4864f':'#bd7e4a')+'"/><rect y="'+(y+62)+'" width="'+w+'" height="2" fill="#8a5530"/><path d="M'+(i*97%w)+' '+(y+20)+' q60 -8 120 0 t120 0" stroke="#a96d3e" stroke-width="2" fill="none" opacity=".5"/>';
    if(kind==='paper'){
      s+=pc?put(pencil(),260,30,w*.04,h*.16,w*.2,-28)+put(teaTop(),200,200,w*.86,h*.05,w*.16)+put(bagels(),200,150,w*.86,h*.7,w*.15)+put(magnifier(),200,120,w*.01,h*.74,w*.15,-20)
           :put(pencil(),260,30,w*.6,h*.035,w*.42,-14);
    }else{
      s+=pc?'<g transform="rotate(6 '+(w*.2)+' '+(h*.5)+')"><rect x="'+(-w*.05)+'" y="'+(-h*.08)+'" width="'+(w*.42)+'" height="'+(h*1.2)+'" fill="url(#'+k+'c)"/></g>'+
             put(bundle(),240,170,w*.08,h*.14,w*.19)+put(keyTag(),200,90,w*.2,h*.86,w*.14)+put(teaTop(),200,200,w*.87,h*.82,w*.15)
           :'<g transform="rotate(8 0 0)"><rect x="-60" y="-40" width="'+(w*.75)+'" height="'+(h*.45)+'" fill="url(#'+k+'c)"/></g>'+put(keyTag(),200,90,w*.58,h*.01,w*.36);
    }
    s+='<rect width="'+w+'" height="'+h+'" fill="url(#'+k+'v)"/>';
    return s+'</svg>';};
  A.deskCss='.z3-sheet{background:linear-gradient(#fffdf6,#f8f0dc);color:var(--z3-ink);border-radius:4px;box-shadow:0 18px 30px rgba(40,20,10,.35);transform:rotate(-.5deg)}'+
    '.z3-mast{text-align:center}.z3-mast .t{font:400 52px/1 var(--z3-font-paper);color:var(--z3-red)}.z3-mast .row{display:flex;justify-content:space-between;border-top:2px solid var(--z3-ink);border-bottom:1px solid var(--z3-ink);padding:4px 2px;font:700 13.5px var(--z3-font)}'+
    '.z3-letter{background:repeating-linear-gradient(transparent 0 33px,rgba(90,130,210,.26) 33px 34px) 0 18px,linear-gradient(#fffef9,#fdf6e6);color:#2c3e8a;font:600 22px/34px var(--z3-font-hand);box-shadow:0 18px 30px rgba(40,20,10,.35);border-radius:3px;transform:rotate(-.6deg)}'+
    '.z3-sig{font:700 28px var(--z3-font-hand);color:var(--z3-blue);text-align:right}';
})();
