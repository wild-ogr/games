'use strict';
/* zb3-art-kitchen — фон уровня «кухня Зины» в стиле MIX (поток SKIN; СОБРАН скриптом z3-skin-tools/kit_port.py из art/art3-tools/src/mix.js
   и art3.html — руками не править: правка в z3-skin-tools/kit_tpl.js и перегнать). Грузится лениво из js/zb3-skin.js при входе в уровень.
   Z3ART.kitchen({w, h, pc, time:'day'|'eve'|'night'}) → <svg> w×h: стена в сердечках, деревянная панель, полка с банками, стол в клетчатой
     скатерти (под кругом букв), на ПК — абажур и пирожки с чайником. ОКНО — сквозное (маска): в нём виден рисунок места главы (#zbLvBg .art,
     поток VIEW/CORE) — глава остаётся «за окном». Z3ART.kitchenWin(w,h,pc) → [x,y,w,h] окна.
   Читаемость клеток: всё спокойное, светлое; сверху — лёгкая вуаль (Z3ART.kitchenCss). Зина и кот — не здесь (игра рисует свои). */
(function(){
  var A=window.Z3ART=window.Z3ART||{};
  function pts(a){return a.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');}
function abajur(cx,top,k){return `<path d="M${cx} 0 V${top}" stroke="#5a4636" stroke-width="3"/><path d="M${cx-48*k} ${top+4} L${cx+48*k} ${top+4} L${cx+124*k} ${top+78*k} L${cx-124*k} ${top+78*k}Z" fill="#f08a3a"/><path d="M${cx} ${top+4} L${cx+48*k} ${top+4} L${cx+124*k} ${top+78*k} L${cx} ${top+78*k}Z" fill="#dc7228"/>
  <path d="M${cx-60*k} ${top+30*k} H${cx+60*k}" stroke="#ffd09a" stroke-width="${4*k}" opacity=".6"/>${[...Array(25)].map((_,i)=>`<path d="M${cx-122*k+i*10.2*k} ${top+78*k} v${12*k}" stroke="#c45f1e" stroke-width="${3*k}" stroke-linecap="round"/>`).join('')}
  <ellipse cx="${cx}" cy="${top+80*k}" rx="${100*k}" ry="${10*k}" fill="#fff4c8"/><rect x="${cx-12*k}" y="${top-6}" width="${24*k}" height="${12*k}" rx="4" fill="#5a4636"/>`}
function jarsRow(x,y,n){let s=`<rect x="${x-10}" y="${y+52}" width="${n*58+20}" height="10" rx="3" fill="#a9673a"/><rect x="${x-10}" y="${y+60}" width="${n*58+20}" height="5" fill="#7a4520"/>`;
  for(let i=0;i<n;i++){const jx=x+i*58;const c=['#d0342c','#f5a13a','#8e2a4a','#e8b63a','#c8405a'][i%5];s+=`<rect x="${jx}" y="${y+10}" width="44" height="42" rx="8" fill="${c}"/><rect x="${jx+22}" y="${y+10}" width="22" height="42" rx="8" fill="#000" opacity=".1"/><rect x="${jx+8}" y="${y+24}" width="28" height="14" rx="2" fill="#fff8ec"/><path d="M${jx-4} ${y+12} q26 -10 52 0 l-4 -8 h-44z" fill="#fff"/><path d="M${jx-4} ${y+12} ${[...Array(6)].map(()=>'l4.3 4 l4.3 -4').join(' ')}" fill="#fff"/>${[0,1,2,3].map(j=>`<rect x="${jx+j*12}" y="${y+4}" width="6" height="6" fill="#d0342c" opacity=".55"/>`).join('')}<path d="M${jx+8} ${y+16} v30" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>`}return s}
function geran(x,y,k=1){return `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-22 0 h44 l-6 34 h-32z" fill="#c9653a"/><rect x="-25" y="-4" width="50" height="9" rx="3" fill="#d97a4a"/>${[[-18,-14,14],[0,-22,15],[18,-12,13],[-8,-30,11],[12,-32,11]].map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}" fill="#5aa84a"/>`).join('')}${[[-10,-44,9],[10,-50,10],[24,-34,8],[-24,-30,7]].map(([a,b,r])=>`<g>${[0,1,2,3,4].map(j=>`<circle cx="${a+Math.cos(j*1.256)*r*.55}" cy="${b+Math.sin(j*1.256)*r*.55}" r="${r*.5}" fill="#e2463b"/>`).join('')}<circle cx="${a}" cy="${b}" r="${r*.3}" fill="#ff8f7a"/></g>`).join('')}</g>`}
function pirozhki(x,y,k=1){return `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="80" cy="34" rx="92" ry="26" fill="#fff"/><ellipse cx="80" cy="34" rx="80" ry="20" fill="none" stroke="#2a86c2" stroke-width="3"/>${[[50,24],[90,20],[120,30],[70,38],[105,42]].map(([a,b])=>`<ellipse cx="${a}" cy="${b}" rx="22" ry="11" fill="#d98a3a"/><ellipse cx="${a-4}" cy="${b-4}" rx="12" ry="4" fill="#f2b36a"/>`).join('')}</g>`}
function teapot(){return `<ellipse cx="44" cy="64" rx="40" ry="7" fill="rgba(90,26,16,.2)"/><path d="M76 34 q18 -6 14 -20" fill="none" stroke="#d0342c" stroke-width="7" stroke-linecap="round"/><path d="M10 30 q-12 4 -6 18 q4 8 12 4" fill="none" stroke="#d0342c" stroke-width="5"/><ellipse cx="44" cy="40" rx="34" ry="26" fill="#e2463b"/><path d="M44 14 a34 26 0 0 1 0 52z" fill="#d0342c"/><g fill="#fff"><circle cx="30" cy="36" r="4"/><circle cx="48" cy="46" r="4"/><circle cx="58" cy="30" r="4"/><circle cx="36" cy="54" r="3"/></g><ellipse cx="44" cy="16" rx="18" ry="6" fill="#f26b5e"/><circle cx="44" cy="9" r="5" fill="#f5b72d"/><ellipse cx="30" cy="28" rx="8" ry="5" fill="#fff" opacity=".4"/>
  <g class="z3k-steam"><path d="M86 6 q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M92 4 q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M80 4 q-6 -8 0 -16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`}
  function win(w,h,pc){return pc?[w*.035,h*.11,w*.25,h*.42]:[w*.63,h*.1,w*.32,h*.18];}
  A.kitchenWin=win;
  var K=0;
  A.kitchen=function(o){o=o||{};var w=Math.max(200,Math.round(o.w||390)),h=Math.max(300,Math.round(o.h||700)),pc=!!o.pc,t=o.time||'day',k='kt'+(++K);
    var eve=t!=='day',night=t==='night';
    var T=Math.round(h*(pc?.79:.665)),WS=Math.round(h*(pc?.7:.575));
    var W=win(w,h,pc),wx=W[0],wy=W[1],ww=W[2],wh=W[3],s='';
    s+='<svg xmlns="http://www.w3.org/2000/svg" class="z3kit-svg" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" preserveAspectRatio="none" aria-hidden="true"><defs>'+
      '<pattern id="'+k+'h" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M18 22 c-4 -6 -12 -2 -8 4 l8 7 l8 -7 c4 -6 -4 -10 -8 -4z" fill="#ecd3b0" opacity=".55"/><path d="M53 57 c-4 -6 -12 -2 -8 4 l8 7 l8 -7 c4 -6 -4 -10 -8 -4z" fill="#ecd3b0" opacity=".55"/><circle cx="53" cy="20" r="2.4" fill="#e3c39a"/><circle cx="18" cy="55" r="2.4" fill="#e3c39a"/></pattern>'+
      '<pattern id="'+k+'c" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#fffaf2"/><circle cx="5" cy="5" r="2.6" fill="#e2463b"/><circle cx="15" cy="15" r="2.6" fill="#e2463b"/></pattern>'+
      '<radialGradient id="'+k+'l"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf70" stop-opacity="0"/></radialGradient>'+
      '<radialGradient id="'+k+'v" cx=".5" cy=".45" r=".8"><stop offset=".62" stop-color="#3a2010" stop-opacity="0"/><stop offset="1" stop-color="#3a2010" stop-opacity=".16"/></radialGradient>'+
      '<mask id="'+k+'m"><rect width="'+w+'" height="'+h+'" fill="#fff"/><rect x="'+wx+'" y="'+wy+'" width="'+ww+'" height="'+wh+'" rx="6" fill="#000"/></mask></defs>';
    // стена, панель, плинтус
    var g='<rect width="'+w+'" height="'+h+'" fill="#f7e8cf"/><rect width="'+w+'" height="'+WS+'" fill="url(#'+k+'h)"/>';
    g+='<rect y="'+WS+'" width="'+w+'" height="'+(T-WS)+'" fill="#d9a774"/>';
    for(var i=0;i*52<w;i++)g+='<rect x="'+(i*52)+'" y="'+WS+'" width="2" height="'+(T-WS)+'" fill="#c28a55"/><rect x="'+(i*52+2)+'" y="'+WS+'" width="3" height="'+(T-WS)+'" fill="#ecc394" opacity=".5"/>';
    g+='<rect y="'+(WS-10)+'" width="'+w+'" height="14" fill="#e3b27c"/><rect y="'+(WS+2)+'" width="'+w+'" height="4" fill="#b8784a"/>';
    // стол: скатерть в клетку в перспективе (мягкая — под кругом букв)
    var rows=pc?6:5,cols=pc?16:9,tl=pc?w*.22:w*.06,tr=pc?w*.9:w*.94,bl=-w*.25,br=w*1.25,cl='';
    function at(c,r){var q=Math.pow(r/rows,1.35),y=T+(h-T)*q,L=tl+(bl-tl)*q,R=tr+(br-tr)*q;return [L+(R-L)*c/cols,y];}
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var a=at(c,r),b=at(c+1,r),d=at(c+1,r+1),e=at(c,r+1),odd=(r+c)%2;
      cl+='<polygon points="'+pts([a,b,d,e])+'" fill="'+(odd?'#f5cfc7':'#fffaf5')+'"/>';}
    g+='<rect y="'+(T-6)+'" width="'+w+'" height="12" fill="#b8784a"/><polygon points="'+pts([[tl,T],[tr,T],[br,h],[bl,h]])+'" fill="#fff6ef"/>'+cl;
    // полка с банками (на ней сидит кот Ять игры)
    var jy=pc?h*.17:h*.555,jx=pc?w*.77:w*.6,jk=pc?.75:.5;g+='<g transform="translate('+jx.toFixed(0)+' '+(jy-62*jk).toFixed(0)+') scale('+jk+')">'+jarsRow(0,0,pc?3:3)+'</g>';
    if(pc){g+=pirozhki(w*.03,h*.86,1)+'<g transform="translate('+(w*.9).toFixed(0)+' '+(h*.885).toFixed(0)+') scale(1.1)">'+teapot()+'</g>';}
    if(eve)g+='<rect width="'+w+'" height="'+T+'" fill="#2a1840" opacity="'+(night?.3:.2)+'"/>';
    s+='<g mask="url(#'+k+'m)">'+g+'</g>';
    // окно: вечером/ночью стекло темнее (за окном — место главы)
    if(eve)s+='<rect x="'+wx+'" y="'+wy+'" width="'+ww+'" height="'+wh+'" rx="6" fill="'+(night?'#0b1030':'#2b2f6b')+'" opacity="'+(night?.55:.38)+'"/>';
    s+='<rect x="'+(wx-10)+'" y="'+(wy-10)+'" width="'+(ww+20)+'" height="'+(wh+20)+'" rx="12" fill="none" stroke="#fff" stroke-width="12"/>';
    s+='<rect x="'+(wx+ww/2-4)+'" y="'+wy+'" width="8" height="'+wh+'" fill="#fff"/><rect x="'+wx+'" y="'+(wy+wh*.36)+'" width="'+ww+'" height="8" fill="#fff"/>';
    function curt(x0,f){return '<path d="M'+x0+' '+(wy-20)+' h'+(f*ww*.22)+' q'+(-f*26)+' '+(wh*.5)+' '+(f*8)+' '+(wh+34)+' h'+(-f*(ww*.22+10))+'z" fill="url(#'+k+'c)"/>';}
    s+=curt(wx-24,1)+curt(wx+ww+24,-1);
    var vl='';for(i=0;i<10;i++)vl+=' q-'+((ww+70)/20).toFixed(1)+' 14 -'+((ww+70)/10).toFixed(1)+' 0';
    s+='<path d="M'+(wx-35)+' '+(wy-30)+' h'+(ww+70)+' v24'+vl+'z" fill="url(#'+k+'c)"/><rect x="'+(wx-36)+'" y="'+(wy-34)+'" width="'+(ww+72)+'" height="7" rx="3.5" fill="#a9673a"/>';
    s+='<rect x="'+(wx-26)+'" y="'+(wy+wh+7)+'" width="'+(ww+52)+'" height="14" rx="5" fill="#e3b27c"/><rect x="'+(wx-26)+'" y="'+(wy+wh+18)+'" width="'+(ww+52)+'" height="5" fill="#b8784a"/>';
    s+=geran(wx+ww*.18,wy+wh+7,pc?.8:.5)+geran(wx+ww*.82,wy+wh+7,pc?.8:.5);
    if(pc){var lx=w*.7;s+=(eve?'<ellipse cx="'+lx+'" cy="'+(h*.2)+'" rx="'+(eve?380:300)+'" ry="'+(eve?240:180)+'" fill="url(#'+k+'l)" opacity="'+(night?.8:.6)+'"/>':'')+abajur(lx,Math.round(h*.04),.62);}
    s+='<rect width="'+w+'" height="'+h+'" fill="url(#'+k+'v)"/>';
    return s+'</svg>';};
  A.kitchenCss='#zbLvBg .z3kit{position:absolute;top:0;left:0;right:0;bottom:0}#zbLvBg:not(.z3k) .z3kit{display:none}#zbLvBg .z3kit svg{display:block;width:100%;height:100%}'+
    '#zbLvBg.z3k .veil{background:linear-gradient(rgba(251,247,236,.18),rgba(251,247,236,.3) 58%,rgba(251,247,236,.42) 72%)}'+
    '.z3kit .z3k-pend{animation:z3kpend 2s ease-in-out infinite alternate}@keyframes z3kpend{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}'+
    '.z3kit .z3k-steam{animation:z3ksteam 2.4s ease-in-out infinite;opacity:.8}@keyframes z3ksteam{0%,100%{transform:translateY(0);opacity:.2}50%{transform:translateY(-6px);opacity:.85}}'+
    '@media (prefers-reduced-motion:reduce){.z3kit *{animation:none!important}}';
})();
