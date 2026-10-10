/* Место 15 «За грибами» (ART-2). Фон главы 400×300: осенний лес, тропинка, корзинка, мухомор «НЕ БРАТЬ», указатель «Домой» в обе стороны. */
(function(){var A=window.ZB_ART=window.ZB_ART||{};
A[15]={id:'griby',n:'За грибами',c:'#f3e6d6',
svg:function(r){var u='a15_'+(++A._n||(A._n=1));r=r||'xMidYMid slice';
var pine=function(x,y,s,c){return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><rect x="-3" y="-24" width="6" height="28" fill="#6b4626"/><path d="M0 -96 l16 26 h-9 l15 22 h-9 l17 26 h-60 l17 -26 h-9 l15 -22 h-9z"/></g>`;};
var birch=function(x,y,s,c){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-80" width="8" height="84" fill="#f4f1ea"/><g fill="#333">${[-66,-50,-34,-18].map(v=>`<rect x="-4" y="${v}" width="5" height="2.4"/>`).join('')}</g><g fill="${c}"><circle cx="0" cy="-92" r="24"/><circle cx="-18" cy="-76" r="16"/><circle cx="18" cy="-76" r="16"/></g></g>`;};
var boro=function(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 0 q-2 -12 0 -18 h12 q2 6 0 18z" fill="#f2e8d2"/><path d="M-16 -16 q16 -22 32 0 q-16 5 -32 0z" fill="#8a4f24"/><ellipse cx="-5" cy="-21" rx="4" ry="2" fill="#a8683a" opacity=".7"/></g>`;};
var leaf=function(x,y,a,c){return `<path d="M0 -5 q5 2 0 10 q-5 -8 0 -10z" fill="${c}" transform="translate(${x} ${y}) rotate(${a})"/>`;};
return `<svg viewBox="0 0 400 300" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f0e0"/><stop offset="1" stop-color="#f7ead2"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#${u}s)"/>
<g opacity=".55">${[[30,170,.9],[100,160,.8],[160,166,.7],[250,162,.75],[300,168,.85],[370,158,.8]].map(([x,y,s])=>pine(x,y,s,'#8fb08a')).join('')}</g>
<rect x="0" y="168" width="400" height="132" fill="#c9b778"/><path d="M0 172 q100 -10 200 0 t200 0 v14 h-400z" fill="#b5a564"/>
${birch(70,196,1.25,'#f2b33d')}${birch(330,190,1.15,'#e98a2e')}${pine(16,206,1.1,'#4f7d4a')}${pine(384,210,1.2,'#4f7d4a')}${birch(260,182,.8,'#f5c95a')}${pine(130,186,.85,'#5f8f5a')}
<!-- тропинка -->
<path d="M170 300 q20 -60 20 -90 q0 -24 14 -40 h10 q-6 16 -2 40 q6 40 60 90z" fill="#e3cfa2"/>
<!-- указатель -->
<g transform="translate(206 168)"><rect x="-3" y="0" width="6" height="66" fill="#8a5d36"/>
<path d="M0 6 h46 l10 9 l-10 9 h-46z" fill="#c89a62" stroke="#8a5d36" stroke-width="2"/><text x="24" y="18.5" text-anchor="middle" font-size="8" font-weight="800" fill="#3a2a22" font-family="Arial">ДОМОЙ</text>
<path d="M0 28 h-46 l-10 9 l10 9 h46z" fill="#c89a62" stroke="#8a5d36" stroke-width="2"/><text x="-24" y="40.5" text-anchor="middle" font-size="8" font-weight="800" fill="#3a2a22" font-family="Arial">ДОМОЙ</text>
<circle cx="0" cy="-6" r="7" fill="#fff" stroke="#8a5d36" stroke-width="1.5"/><path d="M0 -12 v6 l3 3" stroke="#e2463b" stroke-width="1.5" fill="none"/><text x="0" y="-15" text-anchor="middle" font-size="7" font-weight="800" fill="#e2463b" font-family="Arial">?</text></g>
<!-- корзинка с грибами -->
<g transform="translate(200 262)"><path d="M-40 -18 q40 -60 80 0" stroke="#a8774a" stroke-width="6" fill="none"/><path d="M-40 -18 q40 -60 80 0" stroke="#c89a62" stroke-width="2.5" fill="none"/>
${boro(-22,-16,1)}${boro(0,-20,1.15)}${boro(22,-16,.95)}<g transform="translate(-10 -20)"><path d="M-3 0 v-8 h6 v8z" fill="#fff"/><path d="M-9 -7 q9 -12 18 0z" fill="#f08a24"/></g>
<path d="M-44 -18 h88 l-8 34 h-72z" fill="#c89a62"/>${[0,1,2].map(i=>`<path d="M-42 ${-10+i*9} h84" stroke="#a8774a" stroke-width="3"/>`).join('')}${[-30,-15,0,15,30].map(x=>`<path d="M${x} -18 v34" stroke="#a8774a" stroke-width="2" opacity=".7"/>`).join('')}
<rect x="-46" y="-21" width="92" height="6" rx="3" fill="#a8774a"/><path d="M30 -18 q12 -6 14 6" stroke="#e2463b" stroke-width="3" fill="none"/></g>
<!-- мухомор с табличкой -->
<g transform="translate(298 262)"><path d="M-6 0 q-2 -14 0 -22 h12 q2 8 0 22z" fill="#fff"/><path d="M-8 -12 q8 4 16 0" stroke="#e3dccc" stroke-width="2" fill="none"/><path d="M-22 -20 q22 -30 44 0 q-22 6 -44 0z" fill="#e2463b"/>${[[-10,-26],[2,-32],[12,-24],[-2,-22],[-16,-21]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`).join('')}
<path d="M28 0 v-38" stroke="#8a5d36" stroke-width="2.5"/><rect x="14" y="-56" width="32" height="18" fill="#fff" stroke="#8a5d36" stroke-width="1.5"/><text x="30" y="-48" text-anchor="middle" font-size="5.4" font-weight="800" fill="#e2463b" font-family="Arial">НЕ</text><text x="30" y="-41.5" text-anchor="middle" font-size="5.4" font-weight="800" fill="#e2463b" font-family="Arial">БРАТЬ!</text></g>
<!-- боровики в траве, ёж, пень -->
${boro(98,262,1.3)}${boro(118,268,.9)}
<g transform="translate(60 284)"><ellipse rx="22" ry="12" fill="#7a5a3a"/>${[-16,-10,-4,2,8,14].map(x=>`<path d="M${x} -10 l3 -9 l3 9z" fill="#5a3f26"/>`).join('')}<circle cx="-20" cy="2" r="5" fill="#a8774a"/><circle cx="-24" cy="1" r="1.6" fill="#3a2a22"/><circle cx="-18" cy="-1" r="1.2" fill="#3a2a22"/><g transform="translate(4 -18)"><circle r="5" fill="#e2463b"/><path d="M0 -5 l2 -3" stroke="#3f9a4c" stroke-width="2"/></g></g>
<g transform="translate(350 272)"><path d="M-20 0 v-18 h40 v18z" fill="#a8774a"/><ellipse cx="0" cy="-18" rx="20" ry="6" fill="#e3cfa2"/><ellipse cx="0" cy="-18" rx="12" ry="3.5" fill="none" stroke="#c89a62" stroke-width="1.5"/>${[-12,0,10].map((x,i)=>`<g transform="translate(${x} -21)"><path d="M-1.5 0 v-6 h3 v6z" fill="#f2e8d2"/><ellipse cx="0" cy="-6" rx="4" ry="2.4" fill="#c88a3a"/></g>`).join('')}</g>
<!-- забытый компас... лежит дома, а тут — листья -->
${[[40,130,20,'#f2b33d'],[120,90,-30,'#e98a2e'],[260,70,40,'#e2463b'],[340,110,-10,'#f5c95a'],[180,120,60,'#e98a2e'],[300,40,10,'#f2b33d'],[90,200,30,'#e2463b'],[250,240,-40,'#f2b33d'],[150,280,15,'#e98a2e'],[380,280,-20,'#f5c95a']].map(a=>leaf(...a)).join('')}
</svg>`;}};})();
