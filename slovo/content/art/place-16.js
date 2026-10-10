/* Место 16 «Свадьба внучки» (ART-2). Фон главы 400×300: зал, цветочная арка, торт в три яруса, растяжка «ГОРЬКО!». */
(function(){var A=window.ZB_ART=window.ZB_ART||{};
A[16]={id:'svadba',n:'Свадьба внучки',c:'#fbe3e8',
svg:function(r){var u='a16_'+(++A._n||(A._n=1));r=r||'xMidYMid slice';
var rose=function(x,y,s,c){return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="7" fill="${c}"/><path d="M-3 -1 q3 -5 6 0 q-3 4 -6 0z" fill="#fff" opacity=".45"/><path d="M-7 3 q-6 4 -8 0 M7 3 q6 4 8 0" stroke="#4fa15a" stroke-width="3" stroke-linecap="round"/></g>`;};
var heart=function(x,y,s,c){return `<path d="M0 4 q-10 -8 -6 -13 q4 -4 6 1 q2 -5 6 -1 q4 5 -6 13z" fill="${c}" transform="translate(${x} ${y}) scale(${s})"/>`;};
var glass=function(x,y,a){return `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-5 -22 h10 l-1 14 q-4 4 -8 0z" fill="#fff6c4" stroke="#c9b48c" stroke-width="1"/><path d="M-4.4 -16 h8.8 l-.6 8 q-4 4 -7.6 0z" fill="#f5d77a"/><path d="M0 -6 v10 M-5 4 h10" stroke="#c9b48c" stroke-width="1.6"/></g>`;};
var arc=[];for(var i=0;i<=20;i++){var t=Math.PI*i/20;arc.push([200-Math.cos(t)*92,196-Math.sin(t)*130]);}
return `<svg viewBox="0 0 400 300" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdeef1"/><stop offset="1" stop-color="#f8d9e0"/></linearGradient>
<radialGradient id="${u}g" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#${u}w)"/>
${[0,1,2,3,4,5,6,7,8,9].map(i=>`<rect x="${i*40+18}" y="0" width="4" height="200" fill="#f3c9d3" opacity=".6"/>`).join('')}
<!-- гирлянда-флажки и растяжка -->
<path d="M0 22 q100 30 200 0 q100 30 200 0" stroke="#d98aa0" stroke-width="1.5" fill="none"/>
${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i=>{const x=8+i*25,y=22+Math.abs(Math.sin(Math.PI*x/200))*15;return heart(x,y+6,.75,['#e8475a','#fff','#f5b72d','#f08aa6'][i%4]);}).join('')}
<!-- окна-арки по бокам -->
${[40,360].map(x=>`<g transform="translate(${x} 70)"><path d="M-26 90 v-60 q26 -36 52 0 v60z" fill="#fff"/><path d="M-21 86 v-54 q21 -30 42 0 v54z" fill="#cfe6f5"/><path d="M0 -6 v92 M-21 40 h42" stroke="#fff" stroke-width="3"/><path d="M-30 90 h60 v6 h-60z" fill="#ead2d8"/></g>`).join('')}
<!-- арка из цветов -->
<circle cx="200" cy="120" r="120" fill="url(#${u}g)"/>
<path d="M${arc.map(p=>p.join(' ')).join(' L')}" stroke="#4fa15a" stroke-width="8" fill="none" stroke-linecap="round"/>
${arc.map(([x,y],k)=>rose(x,y,k%2?1.15:1.4,['#e8475a','#fff','#f08aa6','#f5b72d'][k%4])).join('')}
<!-- растяжка ГОРЬКО -->
<g transform="translate(200 96)"><path d="M-66 -14 h132 l-8 14 l8 14 h-132 l8 -14z" fill="#e8475a"/><text x="0" y="6" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="Rubik,Arial,sans-serif" letter-spacing="2">ГОРЬКО!</text></g>
<g fill="#fff" opacity=".95">${[[150,140,-10],[250,140,10]].map(([x,y,a])=>`<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0 q-8 -10 -18 -6 q8 2 6 8 q-8 2 -10 8 q10 0 22 -10z"/><circle cx="2" cy="-2" r="4"/><path d="M5 -2 l4 1 l-4 1z" fill="#f5b72d"/></g>`).join('')}</g>
<!-- пол и стол -->
<rect x="0" y="196" width="400" height="104" fill="#e9c8b8"/>${[0,1,2,3,4,5,6,7,8].map(i=>`<path d="M${i*50} 196 l-30 104" stroke="#dcb4a4" stroke-width="2"/>`).join('')}
<rect x="96" y="214" width="208" height="12" rx="3" fill="#fff"/><path d="M96 226 h208 v40 q-26 8 -52 0 q-26 8 -52 0 q-26 8 -52 0 q-26 8 -52 0z" fill="#fff"/>
${[0,1,2,3].map(i=>`<path d="M${122+i*52} 226 q0 20 0 40" stroke="#f3d9df" stroke-width="2"/><circle cx="${148+i*52-26}" cy="230" r="0" />`).join('')}
<path d="M96 230 q26 16 52 0 q26 16 52 0 q26 16 52 0 q26 16 52 0" stroke="#f08aa6" stroke-width="3" fill="none"/>
<!-- торт -->
<g transform="translate(200 214)"><ellipse cx="0" cy="0" rx="40" ry="5" fill="#e3dccc"/><rect x="-34" y="-24" width="68" height="24" rx="3" fill="#fff6ec"/><rect x="-24" y="-44" width="48" height="20" rx="3" fill="#fff6ec"/><rect x="-14" y="-60" width="28" height="16" rx="3" fill="#fff6ec"/>
${[[-34,-24,68],[-24,-44,48],[-14,-60,28]].map(([x,y,w])=>`<path d="M${x} ${y+3} q${w/8} 6 ${w/4} 0 q${w/8} 6 ${w/4} 0 q${w/8} 6 ${w/4} 0 q${w/8} 6 ${w/4} 0" stroke="#f08aa6" stroke-width="2.5" fill="none"/>`).join('')}
${[-26,-12,2,16,28].map(x=>`<circle cx="${x}" cy="-10" r="2.5" fill="#e8475a"/>`).join('')}
<g transform="translate(0 -62)"><path d="M-6 0 q-9 -7 -5 -12 q3 -3 5 1 q2 -4 5 -1 q4 5 -5 12z" fill="#e8475a"/><path d="M6 0 q-9 -7 -5 -12 q3 -3 5 1 q2 -4 5 -1 q4 5 -5 12z" fill="#f08aa6"/></g></g>
${glass(140,214,-8)}${glass(152,214,8)}${glass(250,214,-8)}${glass(262,214,8)}
<!-- кольца -->
<g transform="translate(116 210)" fill="none" stroke="#f5b72d" stroke-width="3"><circle r="6"/><circle cx="7" cy="2" r="6"/></g>
<!-- каравай -->
<g transform="translate(284 210)"><ellipse rx="16" ry="5" fill="#e8475a"/><path d="M-14 -2 q14 -18 28 0z" fill="#e0a052"/><path d="M-8 -6 q8 -6 16 0" stroke="#b9772a" stroke-width="2" fill="none"/><circle cx="0" cy="-9" r="3" fill="#fff"/></g>
<!-- шары-сердца по бокам -->
${[[34,190,'#e8475a'],[58,206,'#fff'],[342,192,'#f08aa6'],[368,206,'#e8475a']].map(([x,y,c])=>`<path d="M${x} ${y} q-4 40 4 92" stroke="#c9a0aa" stroke-width="1" fill="none"/>${heart(x,y,2.2,c)}`).join('')}
${[[70,120],[330,124],[110,40],[290,44],[200,8]].map(([x,y])=>`<path d="M${x} ${y-5} l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6z" fill="#f5b72d"/>`).join('')}
</svg>`;}};})();
