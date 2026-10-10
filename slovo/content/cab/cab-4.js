/* Кабинет 4 «Библиотека» (CAB-1). Три состояния 400×300: 1 — пустые полки, книги кучей, 2 — ремонт, первые полки заполнены, 3 — «как новенькая», все 29 полок А…Я.
   Подключение: ZB.load('content/cab/cab-4.js').then(()=>el.innerHTML=ZB_CAB[4].svg(lv,0,full)) — см. README-1.md.
   Роль: дом «Толкового словаря» — полки по буквам. Третий параметр full (необязательный) — список собранных полок (строка букв, например 'АБВК'):
   тогда на ур.2–3 заполнены именно эти полки (остальные — пустые с табличкой), иначе — как на картинке.
   Герой: кот Ять дремлет на шкафу на ур.3 (облик 1:1 с catSVG() из slovo/js/text.js). */
(function(){var A=window.ZB_CAB=window.ZB_CAB||{},k=0;
var LET='АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ';
var COL=['#c0392b','#2f6fd6','#4f9a4a','#e8a13a','#7b3fa0','#1d4fa3','#d26a8a','#8a5a1c','#3b9cc4','#e86a3a'];
function rnd(n){n=Math.sin(n*12.9898)*43758.5453;return n-Math.floor(n);}
/* ряд книг в ячейке */
function books(x,y,w,h,seed,frac){var o='',cx=x+2,i=0;var lim=x+w*frac-2;
while(cx<lim){var bw=4+Math.floor(rnd(seed+i)*4),bh=h-4-Math.floor(rnd(seed+i+50)*8),c=COL[Math.floor(rnd(seed+i+99)*COL.length)];
if(cx+bw>lim)break;var tilt=(rnd(seed+i+7)>.93&&frac<1)?` transform="rotate(-12 ${cx} ${y+h})"`:'';
o+=`<g${tilt}><rect x="${cx}" y="${y+h-bh}" width="${bw}" height="${bh}" fill="${c}"/><path d="M${cx} ${y+h-bh+3} h${bw} M${cx} ${y+h-4} h${bw}" stroke="#fff" stroke-width=".7" opacity=".55"/></g>`;cx+=bw+.6;i++;}
return o;}
function yat(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})">
<path d="M95 104 q24 -6 14 -30 q-4 -8 -10 -4 q6 10 0 22 q-6 8 -12 8z" fill="#f0a24c"/><path d="M28 110 q-6 -40 16 -56 h32 q22 16 16 56z" fill="#f5b060"/>
<path d="M42 70 q18 8 36 0 M40 84 q20 8 40 0 M40 98 q20 6 40 0" stroke="#e08a36" stroke-width="4" fill="none" opacity=".7"/><ellipse cx="60" cy="96" rx="14" ry="14" fill="#fff3e3"/>
<circle cx="60" cy="46" r="28" fill="#f5b060"/><path d="M36 34 l-4 -26 l20 14z M84 34 l4 -26 l-20 14z" fill="#f5b060"/><path d="M38 30 l-2 -15 l11 8z M82 30 l2 -15 l-11 8z" fill="#f7c9a8"/>
<path d="M48 24 l4 8 M60 20 v10 M72 24 l-4 8" stroke="#e08a36" stroke-width="3.5" stroke-linecap="round"/>
<path d="M44 46 q6 -5 12 0 M64 46 q6 -5 12 0" stroke="#3a2a22" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="60" cy="56" rx="12" ry="8" fill="#fff3e3"/><path d="M57 53 h6 l-3 4z" fill="#e0707a"/><path d="M60 57 q-3 5 -7 3 M60 57 q3 5 7 3" stroke="#3a2a22" stroke-width="1.8" fill="none"/>
<path d="M40 56 l-16 -3 M40 60 l-15 3 M80 56 l16 -3 M80 60 l15 3" stroke="#fff" stroke-width="1.6" opacity=".9"/>
<path d="M46 74 l14 6 l14 -6 l-4 10 l-10 -4 l-10 4z" fill="#1d4fa3"/><circle cx="60" cy="80" r="3.5" fill="#f5b72d"/>
<text x="92" y="30" font-size="14" font-weight="800" fill="#2f6fd6" opacity=".7">z</text><text x="104" y="18" font-size="10" font-weight="800" fill="#2f6fd6" opacity=".5">z</text></g>`;}
A[4]={id:'biblioteka',n:'Библиотека',c:'#f3ead8',svg:function(lv,r,full){lv=lv||1;var u='c4_'+(++k);r=r||'xMidYMid slice';
var L1=lv===1,L3=lv===3;
var wall=L1?'#d3c9b4':'#efe4cc',wood=L1?'#7f6448':'#8a5a30',wood2=L1?'#6b523a':'#6e4422',back=L1?'#a8957a':'#c9a87a',fl=L1?'#9b8466':'#a8743f';
var s=`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}">
<defs><radialGradient id="l${u}" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff3b0" stop-opacity=".75"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs>
<rect width="400" height="300" fill="${wall}"/>
${L3?`<g fill="#e6d7b6">${Array.from({length:20},(_,i)=>`<circle cx="${(i%10)*42+10}" cy="${(i/10|0)*8+4}" r="2"/>`).join('')}</g>`:''}
<rect y="214" width="400" height="86" fill="${fl}"/>
<g stroke="${L1?'#6e5c45':'#8a5a2c'}" stroke-width="1.4">${[232,254,278].map(y=>`<path d="M0 ${y} H400"/>`).join('')}${[[70,214,232],[210,232,254],[330,214,232],[120,254,278],[270,254,278],[40,278,300],[350,278,300]].map(a=>`<path d="M${a[0]} ${a[1]} V${a[2]}"/>`).join('')}</g>`;
/* шкаф: 8 колонок × 4 ряда, 29 полок-букв + 3 ячейки с украшениями */
var X0=12,cw=47,ch=42,top=26,need=(full!=null)?String(full):null;
s+=`<rect x="${X0-6}" y="${top-12}" width="${cw*8+12}" height="${ch*4+18}" fill="${wood}"/><rect x="${X0}" y="${top}" width="${cw*8}" height="${ch*4}" fill="${back}"/>
<rect x="${X0-10}" y="${top-16}" width="${cw*8+20}" height="8" rx="2" fill="${wood2}"/>`;
var cells=[];for(var row=0;row<4;row++)for(var col=0;col<8;col++)cells.push([X0+col*cw,top+row*ch]);
var deco={7:L3?'yat':'globe',15:'vase',31:'clock'},li=0,lab='';
cells.forEach(function(c,i){var x=c[0],y=c[1];
if(deco[i]){var d=deco[i];if(L1){if(i===15)s+=`<path d="M${x+8} ${y+ch-4} l10 -6 l14 4 l-6 2z" fill="#a89a80"/>`;return;}
if(d==='yat')s+=yat(x+2,y+2,.33);
if(d==='globe')s+=`<g transform="translate(${x+24} ${y+20})"><circle r="11" fill="#5aa0e0"/><path d="M-8 -6 q6 4 2 10 q6 2 6 6 M2 -11 q6 6 10 2" stroke="#7ac46a" stroke-width="4" fill="none"/><path d="M-12 4 a12 12 0 0 0 20 8" stroke="#b9860f" stroke-width="2" fill="none"/><rect x="-5" y="16" width="10" height="4" fill="#b9860f"/></g>`;
if(d==='vase')s+=L3?`<g transform="translate(${x+24} ${y+ch})"><path d="M-6 0 h12 l2 -14 q-8 -6 -16 0z" fill="#2f6fd6"/><path d="M0 -14 l-6 -12 M0 -14 l0 -16 M0 -14 l6 -12" stroke="#4f9a4a" stroke-width="1.4"/><circle cx="-6" cy="-27" r="3.5" fill="#f5b72d"/><circle cx="0" cy="-31" r="4" fill="#e8475a"/><circle cx="6" cy="-27" r="3.5" fill="#fff"/></g>`:books(x,y,cw,ch,i*31,.5);
if(d==='clock')s+=`<g transform="translate(${x+24} ${y+22})"><rect x="-13" y="-16" width="26" height="34" rx="4" fill="#6e4422"/><circle r="10" fill="#fff6dc"/><path d="M0 0 V-7 M0 0 H5" stroke="#333" stroke-width="1.6" stroke-linecap="round"/></g>`;
return;}
var L=LET[li++],has;
if(L1)has=rnd(li*3)<.18?.3:0;
else if(need!==null)has=need.indexOf(L)>=0?1:0;
else has=L3?1:(li<=9?1:(li<=12?.45:0));
if(has)s+=books(x,y+2,cw,ch-6,li*17,has);
else if(!L1)s+=`<path d="M${x+6} ${y+ch-5} h${cw-12}" stroke="#b38f62" stroke-width="1" stroke-dasharray="2 3"/>`;
/* табличка буквы */
if(!L1||rnd(li*5)<.35)lab+=`<g transform="translate(${x+cw/2} ${y+ch-6})${L1?` rotate(${(rnd(li)*30-15).toFixed(0)})`:''}"><rect x="-8" y="-3" width="16" height="11" rx="2" fill="${L1?'#e6dcc6':(has===1?'#fff6dc':'#f4efe6')}" stroke="${L1?'#b9ad94':(has===1?'#c9a24a':'#bba98a')}" stroke-width="1"/><text y="6" font-size="8.5" font-weight="800" text-anchor="middle" fill="${L1?'#a08a7a':(has===1?'#1d4fa3':'#a0907a')}">${L}</text>${L3?'<circle cx="7" cy="-3" r="2.2" fill="#d7263d"/>':''}</g>`;
});
/* полки и стойки */
for(var row2=1;row2<=4;row2++)s+=`<rect x="${X0}" y="${top+row2*ch-3}" width="${cw*8}" height="${row2===4?6:4}" fill="${wood2}"/>`;
for(var col2=1;col2<8;col2++)s+=`<rect x="${X0+col2*cw-1.5}" y="${top}" width="3" height="${ch*4}" fill="${wood2}"/>`;
s+=lab;
if(L1)s+=`<g transform="rotate(14 ${X0+cw*5} ${top+ch*2})"><rect x="${X0+cw*4}" y="${top+ch*2-3}" width="${cw*2}" height="4" fill="${wood2}"/></g>
<path d="M${X0+cw*6} ${top} l10 24 l-6 10 l8 20" stroke="#5a4028" stroke-width="1.6" fill="none"/>
<g fill="none" stroke="#bbb" stroke-width=".8"><path d="M400 0 L360 0 Q378 14 400 40z M400 6 L372 0 M400 18 L382 2 M392 0 Q392 14 400 22"/><path d="M${X0} ${top} q14 8 20 22 M${X0} ${top+10} q8 0 12 12"/></g>`;
/* вывеска */
s+=`<g transform="translate(140 ${top-15})"><rect x="0" y="-9" width="120" height="16" rx="3" fill="${L1?'#b0a690':'#2f5a43'}" ${L1?'transform="rotate(-3 60 0)"':''}/><text x="60" y="3" font-size="10" font-weight="800" text-anchor="middle" fill="${L1?'#ece4d0':'#f5d48a'}" letter-spacing="1">${L1?'БИБЛИОТ…':'БИБЛИОТЕКА'}</text></g>`;
/* Ять дремлет на шкафу (ур.3) */
/* передний план */
if(L1)s+=`<g>${[[40,268,0],[58,262,1],[48,256,2],[80,272,3],[62,250,4],[96,266,5],[150,280,6],[300,272,7],[318,266,8]].map((b,i)=>`<g transform="translate(${b[0]} ${b[1]}) rotate(${(rnd(i)*50-25).toFixed(0)})"><rect x="-14" y="-4" width="28" height="9" rx="1" fill="${['#8a6a5a','#7a8a6a','#9a8a5a','#6a7a8a','#8a5a5a'][i%5]}"/><path d="M-12 -2 h24" stroke="#e6dcc6" stroke-width="1"/></g>`).join('')}</g>
<g transform="translate(330 196)"><path d="M0 70 L14 0 M30 70 L18 18" stroke="#9a8a6a" stroke-width="4"/><path d="M4 50 h22 M8 30 h12" stroke="#9a8a6a" stroke-width="3"/><path d="M18 18 l8 -10" stroke="#9a8a6a" stroke-width="4"/></g>
<g transform="translate(176 226) rotate(-4)"><rect width="66" height="40" fill="#e6dcc6" stroke="#b9ad94"/><text x="33" y="16" font-size="7" text-anchor="middle" fill="#a08a7a" font-weight="700">КНИГИ</text><text x="33" y="27" font-size="7" text-anchor="middle" fill="#a08a7a" font-weight="700">НЕ ВЫДАЮТСЯ</text><path d="M66 40 l-6 6 v-6z" fill="#cfc3a8"/></g>`;
else{
s+=L3?`<ellipse cx="200" cy="276" rx="190" ry="20" fill="#b03a2e"/><ellipse cx="200" cy="276" rx="172" ry="14" fill="none" stroke="#f5d48a" stroke-width="2" stroke-dasharray="6 4"/>`:'';
/* стол читальни с лампой */
s+=`<g transform="translate(110 222)"><rect width="150" height="10" rx="2" fill="${L3?'#7a4a24':'#93602f'}"/>${L3?'<rect y="-2" width="150" height="4" fill="#3f7a4a"/>':''}<rect x="8" y="10" width="6" height="40" fill="#6e4422"/><rect x="136" y="10" width="6" height="40" fill="#6e4422"/>
<g transform="translate(24 0)">${L3?`<path d="M-14 -22 q14 -14 28 0 z" fill="#2e7d4a"/><rect x="-1.5" y="-22" width="3" height="20" fill="#c9a24a"/><ellipse cx="0" cy="-1" rx="9" ry="3" fill="#c9a24a"/><path d="M-30 -18 L30 -18 L50 40 L-50 40z" fill="url(#l${u})"/>`
:`<path d="M-10 -24 q10 -8 16 0 z" fill="#ddd"/><path d="M0 -20 l-6 18" stroke="#888" stroke-width="2"/><ellipse cx="-6" cy="-1" rx="7" ry="2.5" fill="#888"/>`}</g>
<g transform="translate(76 -2)"><path d="M-30 0 q15 -8 30 -2 q15 -6 30 2 v-24 q-15 -8 -30 -2 q-15 -6 -30 2z" fill="#fff" stroke="#c9b48e"/><path d="M0 -26 V-2" stroke="#c9b48e"/>
<path d="M-24 -20 h18 M-24 -15 h18 M-24 -10 h14 M6 -20 h18 M6 -15 h18 M6 -10 h12" stroke="#9aa6c0" stroke-width="1"/>${L3?'<text x="-15" y="-4" font-size="5" fill="#d7263d" text-anchor="middle" font-weight="800">ТОЛКОВЫЙ</text><text x="15" y="-4" font-size="5" fill="#d7263d" text-anchor="middle" font-weight="800">СЛОВАРЬ</text>':''}</g>
${L3?`<g transform="translate(118 -6)"><rect x="-8" y="-4" width="16" height="6" fill="#2f6fd6"/><rect x="-7" y="-9" width="14" height="5" fill="#e8a13a"/><rect x="-8" y="-14" width="16" height="5" fill="#c0392b"/></g>`:''}</g>`;
/* стулья */
s+=`<g fill="${L3?'#7a4a24':'#93602f'}"><rect x="96" y="216" width="6" height="56" rx="2"/><rect x="88" y="244" width="20" height="5"/><rect x="88" y="249" width="3" height="24"/><rect x="266" y="216" width="6" height="56" rx="2"/><rect x="262" y="244" width="20" height="5"/><rect x="279" y="249" width="3" height="24"/></g>`;
if(lv===2)s+=`<g transform="translate(300 268)">${[0,7,14,21].map((y,i)=>`<rect x="${i%2*3}" y="${-y}" width="40" height="7" rx="1" fill="${COL[i*3%10]}"/>`).join('')}</g>
<g transform="translate(350 268)">${[0,7,14].map((y,i)=>`<rect x="${i%2*4}" y="${-y}" width="36" height="7" rx="1" fill="${COL[(i*7+1)%10]}"/>`).join('')}</g>
<g transform="translate(20 236) rotate(-3)"><rect width="62" height="34" fill="#fff" stroke="#c9b48e"/><text x="31" y="14" font-size="7.5" text-anchor="middle" fill="#2f5a43" font-weight="800">ТИШЕ!</text><text x="31" y="26" font-size="6.5" text-anchor="middle" fill="#555">Идёт расстановка</text></g>`;
if(L3)s+=`<g transform="translate(300 214)"><rect width="78" height="56" rx="2" fill="#8a5a30"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${4+c*25}" y="${4+r*17}" width="21" height="13" rx="1" fill="#a8743f"/><rect x="${11+c*25}" y="${9+r*17}" width="7" height="3" rx="1" fill="#e8d7a8"/>`).join('')).join('')}<text x="39" y="-4" font-size="7" text-anchor="middle" fill="#6e4422" font-weight="700">КАРТОТЕКА</text></g>
<g transform="translate(28 232)"><path d="M-12 40 h24 l-3 -18 h-18z" fill="#c8643c"/><path d="M0 22 V-14" stroke="#6b4a2a" stroke-width="2.4"/>${[[-10,8,-30],[10,2,30],[-9,-6,-25],[9,-10,25],[0,-18,0]].map(a=>`<ellipse cx="${a[0]}" cy="${a[1]}" rx="11" ry="6" fill="#3f8f45" transform="rotate(${a[2]} ${a[0]} ${a[1]})"/>`).join('')}</g>`;
}
return s+'</svg>';}};
})();
