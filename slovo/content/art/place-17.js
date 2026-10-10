/* Место 17 «Круиз по Волге» (ART-2). Фон главы 400×300: теплоход «Зинаида», чайки, гармонь на палубе, берег с церковкой. */
(function(){var A=window.ZB_ART=window.ZB_ART||{};
A[17]={id:'kruiz',n:'Круиз по Волге',c:'#dbeafc',
svg:function(r){var u='a17_'+(++A._n||(A._n=1));r=r||'xMidYMid slice';
var gull=function(x,y,s){return `<path d="M${x-10*s} ${y} q${5*s} ${-6*s} ${10*s} 0 q${5*s} ${-6*s} ${10*s} 0" stroke="#5b6b7a" stroke-width="${2*s}" fill="none" stroke-linecap="round"/>`;};
var birch=function(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-30" width="4" height="32" fill="#f4f1ea"/><circle cx="0" cy="-34" r="12" fill="#7cbf63"/><circle cx="-8" cy="-28" r="8" fill="#6fae52"/></g>`;};
return `<svg viewBox="0 0 400 300" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0f5"/><stop offset="1" stop-color="#eaf5ff"/></linearGradient>
<linearGradient id="${u}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a9fd6"/><stop offset="1" stop-color="#2f6fa8"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#${u}s)"/>
<circle cx="60" cy="50" r="22" fill="#ffd54a"/><g stroke="#ffd54a" stroke-width="3" stroke-linecap="round">${[0,45,90,135,180,225,270,315].map(a=>`<path d="M60 18 v-8" transform="rotate(${a} 60 50)"/>`).join('')}</g>
<g fill="#fff" opacity=".9"><ellipse cx="300" cy="40" rx="34" ry="10"/><ellipse cx="322" cy="32" rx="20" ry="10"/><ellipse cx="160" cy="26" rx="22" ry="6"/></g>
<!-- дальний берег с церковкой -->
<path d="M0 150 q50 -26 110 -16 q60 -10 110 4 q90 -22 180 0 v20 h-400z" fill="#8cc46a"/>
${[[20,150,1],[40,148,.8],[350,150,1],[372,150,.9],[392,148,.7]].map(a=>birch(...a)).join('')}
<g transform="translate(300 146)"><rect x="-14" y="-28" width="28" height="28" fill="#fff"/><rect x="-6" y="-46" width="12" height="18" fill="#fff"/><path d="M-8 -46 q8 -16 16 0z" fill="#f5b72d"/><path d="M0 -62 v-8 M-3 -66 h6" stroke="#b9860f" stroke-width="1.6"/><path d="M-14 -28 l14 -8 l14 8z" fill="#3f9a4c"/><rect x="-4" y="-16" width="8" height="16" rx="4" fill="#8fb7d8"/></g>
<g transform="translate(110 144)"><rect x="-10" y="-14" width="20" height="14" fill="#c89a62"/><path d="M-12 -14 l12 -9 l12 9z" fill="#a8532c"/></g>
<!-- Волга -->
<rect x="0" y="150" width="400" height="150" fill="url(#${u}r)"/>
<g stroke="#fff" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round">${[[30,170],[90,190],[340,176],[370,210],[20,240],[60,280],[350,270],[300,290]].map(([x,y])=>`<path d="M${x} ${y} q6 -4 12 0 q6 -4 12 0"/>`).join('')}</g>
<!-- теплоход -->
<g transform="translate(200 214)">
<path d="M-130 -14 h250 l20 -18 v4 q-10 40 -40 44 h-230 q-12 -6 -20 -30z" fill="#fff"/><path d="M-128 4 h236 q-6 10 -16 12 h-210 q-6 -4 -10 -12z" fill="#e2463b"/><path d="M-130 -14 h250" stroke="#1d4fa3" stroke-width="3"/>
${[-110,-90,-70,-50,-30,-10,10,30,50,70,90].map(x=>`<circle cx="${x}" cy="-4" r="4" fill="#2f6fa8" stroke="#cfd8e6" stroke-width="1.5"/>`).join('')}
<text x="-10" y="14" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" font-family="Rubik,Arial,sans-serif" letter-spacing="1">ЗИНАИДА</text>
<rect x="-110" y="-48" width="200" height="34" fill="#f4f8fc"/><path d="M-114 -48 h208" stroke="#1d4fa3" stroke-width="3"/>${[-100,-78,-56,-34,-12,10,32,54,76].map(x=>`<rect x="${x}" y="-42" width="14" height="14" rx="3" fill="#9fd0ea"/>`).join('')}
<rect x="-70" y="-74" width="120" height="26" fill="#fff"/><path d="M-74 -74 h128" stroke="#1d4fa3" stroke-width="3"/>${[-62,-44,-26,-8,10,28].map(x=>`<rect x="${x}" y="-68" width="12" height="12" rx="2" fill="#9fd0ea"/>`).join('')}
<path d="M-20 -74 v-28 h22 l4 28z" fill="#e2463b"/><rect x="-20" y="-98" width="26" height="6" fill="#1d4fa3"/>
<path d="M-12 -104 q-6 -10 2 -16 q8 -6 4 -14" stroke="#fff" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
<path d="M70 -74 v-40" stroke="#555" stroke-width="2"/><path d="M70 -114 l22 6 l-22 6z" fill="#e2463b"/>
<path d="M-114 -48 v-12 M90 -48 v-12 M-114 -56 h204" stroke="#1d4fa3" stroke-width="1.5"/>
<g transform="translate(-96 -30)"><circle r="8" fill="#fff" stroke="#e2463b" stroke-width="4" stroke-dasharray="6 6.5"/></g>
<!-- гармонь на палубе -->
<g transform="translate(48 -86)"><rect x="-12" y="-10" width="7" height="14" rx="1" fill="#e2463b"/><rect x="5" y="-10" width="7" height="14" rx="1" fill="#e2463b"/><path d="M-5 -10 l2.5 14 l2.5 -14 l2.5 14 l2.5 -14" stroke="#3a2a22" stroke-width="1.2" fill="#f5b72d"/>
<g fill="#fff"><circle cx="-8.5" cy="-6" r="1"/><circle cx="-8.5" cy="-2" r="1"/><circle cx="8.5" cy="-6" r="1"/><circle cx="8.5" cy="-2" r="1"/></g></g>
<g fill="#3a2a22" font-size="10" font-family="Arial"><text x="64" y="-104">♪</text><text x="74" y="-120">♫</text></g>
</g>
<!-- волна от носа -->
<path d="M318 220 q14 6 30 4 q-10 6 -26 4" fill="#fff" opacity=".7"/><path d="M60 236 q-20 4 -36 0" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>
${gull(150,70,1.2)}${gull(180,86,.9)}${gull(250,64,1)}${gull(340,96,.8)}
<!-- буй и спасательный круг на воде -->
<g transform="translate(36 268)"><path d="M-8 0 l8 -24 l8 24z" fill="#e2463b"/><path d="M-5 -8 h10" stroke="#fff" stroke-width="3"/><ellipse rx="12" ry="3" fill="#1d4fa3" opacity=".6"/></g>
<g transform="translate(372 266)"><ellipse rx="14" ry="5" fill="#fff"/><ellipse rx="7" ry="2.5" fill="#2f6fa8"/><path d="M-12 -2 l4 4 M12 -2 l-4 4" stroke="#e2463b" stroke-width="3"/></g>
</svg>`;}};})();
