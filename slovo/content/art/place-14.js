/* Место 14 «Рыбалка с дедом» (ART-2). Фон главы 400×300: утреннее озеро, мостки, два ведра — у деда ёрш, у Зины слова. */
(function(){var A=window.ZB_ART=window.ZB_ART||{};
A[14]={id:'rybalka',n:'Рыбалка с дедом',c:'#dcefe9',
svg:function(r){var u='a14_'+(++A._n||(A._n=1));r=r||'xMidYMid slice';
var pine=function(x,y,s,c){return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M0 -60 l14 22 h-8 l12 18 h-8 l12 20 h-44 l12 -20 h-8 l12 -18 h-8z"/><rect x="-2" y="0" width="4" height="6" fill="#6b4626"/></g>`;};
var reed=function(x,y,h){return `<path d="M${x} ${y} q2 ${-h/2} 0 ${-h}" stroke="#6f9a3e" stroke-width="2.5" fill="none"/><rect x="${x-2.5}" y="${y-h-12}" width="5" height="14" rx="2.5" fill="#7a4a2a"/>`;};
var bucket=function(x,y,lbl){return `<g transform="translate(${x} ${y})"><path d="M-20 -30 h40 l-5 32 h-30z" fill="#9aa3ad"/><ellipse cx="0" cy="-30" rx="20" ry="5" fill="#5fb7e0" stroke="#7c8590" stroke-width="2"/><path d="M-12 -14 h24" stroke="#7c8590" stroke-width="2"/><text x="0" y="-4" text-anchor="middle" font-size="7.5" font-weight="800" fill="#fff" font-family="Arial">${lbl}</text></g>`;};
return `<svg viewBox="0 0 400 300" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9b8"/><stop offset=".55" stop-color="#fdeedd"/><stop offset="1" stop-color="#e6f4ef"/></linearGradient>
<linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3cf"/><stop offset="1" stop-color="#5fa8a8"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#${u}s)"/>
<circle cx="250" cy="118" r="30" fill="#ffb86b" opacity=".85"/>
<g fill="#fff" opacity=".8"><ellipse cx="80" cy="50" rx="34" ry="8"/><ellipse cx="320" cy="40" rx="26" ry="7"/></g>
<path d="M150 60 q5 -5 10 0 q5 -5 10 0 M300 80 q4 -4 8 0 q4 -4 8 0" stroke="#5b6b7a" stroke-width="1.8" fill="none"/>
<!-- дальний берег -->
<path d="M0 132 q60 -18 120 -6 q80 -20 160 0 q60 -12 120 4 v14 h-400z" fill="#7fae7a"/>
${[[20,136,.8],[44,134,1],[70,138,.7],[330,136,.9],[356,134,1.1],[382,138,.8]].map(([x,y,s])=>pine(x,y,s,'#4f8a5a')).join('')}
<g transform="translate(110 132)"><rect x="-10" y="-22" width="20" height="22" fill="#f4f1ea"/><path d="M-12 -22 l12 -10 l12 10z" fill="#c8261b"/><rect x="-3" y="-14" width="6" height="7" fill="#8fb7d8"/></g>
<!-- озеро -->
<rect x="0" y="144" width="400" height="156" fill="url(#${u}l)"/>
<path d="M226 150 h48 M232 158 h36 M238 166 h24" stroke="#ffd9a8" stroke-width="3" opacity=".7" stroke-linecap="round"/>
<g stroke="#fff" stroke-width="1.6" fill="none" opacity=".55"><path d="M30 180 q8 -4 16 0 M90 210 q8 -4 16 0 M320 196 q8 -4 16 0 M350 240 q8 -4 16 0"/></g>
<rect x="0" y="146" width="400" height="10" fill="#fff" opacity=".25"/>
<!-- лодка -->
<g transform="translate(330 172)"><path d="M-34 -6 h68 q-6 14 -20 14 h-28 q-14 0 -20 -14z" fill="#3f8f5a"/><path d="M-30 -6 h60" stroke="#f5b72d" stroke-width="2"/><path d="M-6 -6 l-26 -16" stroke="#8a5d36" stroke-width="2"/></g>
<!-- мостки -->
<path d="M110 236 L170 196 h120 l-40 40z" fill="#b98a52"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${170+i*15} 196 L${110+i*17.5} 236" stroke="#8a5d36" stroke-width="1.6"/>`).join('')}
<path d="M120 236 v40 M246 236 v36 M176 196 v20 M286 196 v14" stroke="#7a5a3a" stroke-width="6"/>
<!-- удочки и поплавки -->
<path d="M172 220 L118 108" stroke="#6b4626" stroke-width="3"/><path d="M118 108 q-30 50 -32 96" stroke="#5b6b7a" stroke-width=".8" fill="none"/><g transform="translate(86 206)"><ellipse rx="3" ry="6" fill="#e2463b"/><rect x="-3" y="-1" width="6" height="2" fill="#fff"/></g>
<path d="M238 212 L300 104" stroke="#6b4626" stroke-width="3"/><path d="M300 104 q26 60 30 112" stroke="#5b6b7a" stroke-width=".8" fill="none"/><g transform="translate(330 216)"><ellipse rx="3" ry="6" fill="#e2463b"/><rect x="-3" y="-1" width="6" height="2" fill="#fff"/></g>
<ellipse cx="330" cy="222" rx="10" ry="2.5" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>
<!-- панама деда и термос -->
<g transform="translate(206 204)"><ellipse rx="16" ry="5" fill="#e8dcb8"/><path d="M-10 -1 q0 -12 10 -12 q10 0 10 12z" fill="#efe4c4"/><path d="M-10 -3 h20" stroke="#3f8f5a" stroke-width="2.5"/></g>
<g transform="translate(266 206)"><rect x="-6" y="-22" width="12" height="24" rx="3" fill="#e2463b"/><rect x="-6" y="-26" width="12" height="6" rx="2" fill="#555"/><path d="M-6 -12 h12" stroke="#fff" stroke-width="1.5"/></g>
<!-- вёдра -->
${bucket(162,236,'ДЕД')}<path d="M156 -0" fill="none"/>
<g transform="translate(162 206)"><path d="M-6 0 q6 -6 12 0 q-6 6 -12 0z M6 0 l5 -4 v8z" fill="#b9860f"/><circle cx="-3" cy="-.6" r=".9" fill="#3a2a22"/></g>
${bucket(224,234,'ЗИНА')}
<g font-family="Rubik,Arial,sans-serif" font-weight="800" font-size="9" text-anchor="middle">${[['Ё',-12,-38,'#2f6fd6',-14],['Р',0,-42,'#e2463b',6],['Ш',11,-37,'#3f9a4c',16],['К',-4,-50,'#b9860f',-4],['А',8,-52,'#2f6fd6',10]].map(([t,x,y,c,a])=>`<g transform="translate(${224+x} ${234+y}) rotate(${a})"><rect x="-6" y="-8" width="12" height="11" rx="2" fill="#fff" stroke="${c}" stroke-width="1.2"/><text y="1" fill="${c}">${t}</text></g>`).join('')}</g>
<!-- камыши и кувшинки -->
${[[18,300,70],[30,300,90],[42,300,62],[364,300,80],[378,300,96],[390,300,66]].map(([x,y,h])=>reed(x,y,h)).join('')}
<g fill="#4fa15a">${[[70,268],[340,262],[300,286]].map(([x,y])=>`<path d="M${x} ${y} m-12 0 a12 5 0 1 0 24 0 l-12 0z"/>`).join('')}</g><circle cx="74" cy="264" r="4" fill="#fbe0dc"/><circle cx="74" cy="264" r="1.6" fill="#f5b72d"/>
</svg>`;}};})();
