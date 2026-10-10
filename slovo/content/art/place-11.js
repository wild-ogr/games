/* Место 11 «Встреча выпускников» (ART-2). Фон главы 400×300: класс школы №7, доска «Выпуск 1968». */
(function(){var A=window.ZB_ART=window.ZB_ART||{};
A[11]={id:'vypusk',n:'Встреча выпускников',c:'#f1ead9',
svg:function(r){var u='a11_'+(++A._n||(A._n=1));r=r||'xMidYMid slice';
var desk=function(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 -10 h80 l6 -14 h-92z" fill="#4f8f5a"/><rect x="-46" y="-10" width="92" height="5" fill="#3d7448"/><rect x="-40" y="-5" width="80" height="22" fill="#6aa673"/><path d="M-38 -5 v30 M38 -5 v30" stroke="#6b625a" stroke-width="4"/><circle cx="-14" cy="-17" r="2.6" fill="#2f6fd6"/></g>`;};
var ball=function(x,y,c){return `<path d="M${x} ${y+14} q-3 18 4 34" stroke="#999" stroke-width="1" fill="none"/><ellipse cx="${x}" cy="${y}" rx="11" ry="13" fill="${c}"/><path d="M${x-2} ${y+12} l2 3 l2 -3z" fill="${c}"/><ellipse cx="${x-4}" cy="${y-5}" rx="3" ry="4.5" fill="#fff" opacity=".45"/>`;};
return `<svg viewBox="0 0 400 300" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efdc"/><stop offset="1" stop-color="#ebe0c4"/></linearGradient>
<linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f5d45"/><stop offset="1" stop-color="#244a37"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#${u}w)"/>
<rect x="0" y="0" width="400" height="160" fill="#cfe3d2" opacity=".55"/><rect x="0" y="158" width="400" height="5" fill="#b9a988"/>
<!-- окно -->
<g transform="translate(14 36)"><rect width="72" height="96" fill="#fff"/><rect x="5" y="5" width="62" height="86" fill="#bfe3fb"/><circle cx="20" cy="40" r="12" fill="#7cbf63"/><circle cx="34" cy="48" r="14" fill="#6fae52"/><rect x="26" y="56" width="4" height="35" fill="#f4f1ea"/><path d="M36 5 v86 M5 46 h62" stroke="#fff" stroke-width="4"/><path d="M-4 96 h80 v6 h-80z" fill="#e3d6c1"/><path d="M8 96 q2 -14 10 -14 q8 0 8 14z" fill="#c8673b"/><circle cx="17" cy="78" r="6" fill="#e2463b"/></g>
<!-- доска -->
<rect x="104" y="34" width="192" height="104" rx="3" fill="#8a5d36"/><rect x="110" y="40" width="180" height="92" fill="url(#${u}b)"/>
<g fill="#f4f1ea" font-family="'Comic Sans MS','Marker Felt',cursive" text-anchor="middle"><text x="200" y="64" font-size="15">Встреча</text><text x="200" y="82" font-size="15">выпускников</text>
<text x="200" y="106" font-size="21" font-weight="700" fill="#ffe08a">1968</text><text x="200" y="124" font-size="7.5" opacity=".85">все постарели, кроме Зины</text></g>
<path d="M126 52 q8 -6 14 0 M268 120 l10 -4" stroke="#f4f1ea" stroke-width="1.5" fill="none" opacity=".6"/>
<rect x="110" y="132" width="180" height="5" fill="#6b4626"/><rect x="246" y="128" width="12" height="4" fill="#fff"/><rect x="262" y="128" width="16" height="5" rx="1" fill="#c9b48c"/>
<!-- портрет и часы -->
<rect x="318" y="40" width="38" height="48" fill="#c89a62"/><rect x="322" y="44" width="30" height="40" fill="#efe6d2"/><circle cx="337" cy="58" r="8" fill="#b9a988"/><path d="M325 84 q12 -18 24 0" fill="#8a7a62"/><path d="M332 56 h10" stroke="#6b625a" stroke-width="1.5"/>
<circle cx="370" cy="112" r="14" fill="#fff" stroke="#6b625a" stroke-width="3"/><path d="M370 104 v8 h6" stroke="#3a2a22" stroke-width="2" fill="none"/>
<!-- гирлянда шаров -->
${ball(108,26,'#e2463b')}${ball(126,20,'#f5b72d')}${ball(274,20,'#2f6fd6')}${ball(292,26,'#e2463b')}
<path d="M110 14 q90 26 180 0" stroke="#e2463b" stroke-width="1.5" fill="none"/>${[0,1,2,3,4,5,6,7].map(i=>{const x=126+i*21,y=14+Math.sin(Math.PI*(i+.5)/8)*13;return `<path d="M${x} ${y} l7 0 l-3.5 9z" fill="${['#f5b72d','#2f6fd6','#3f9a4c','#e2463b'][i%4]}"/>`;}).join('')}
<!-- пол -->
<rect x="0" y="198" width="400" height="102" fill="#c9a074"/>${[0,1,2,3].map(i=>`<path d="M0 ${214+i*24} h400" stroke="#b58a5e" stroke-width="2"/>`).join('')}
<!-- учительский стол с букетом и звонком -->
<g transform="translate(200 214)"><rect x="-58" y="-18" width="116" height="10" fill="#8a5d36"/><rect x="-54" y="-8" width="40" height="40" fill="#a8774a"/><rect x="14" y="-8" width="40" height="40" fill="#a8774a"/><rect x="-46" y="4" width="24" height="3" fill="#6b4626"/>
<path d="M-26 -18 l-4 -24 h16 l-4 24z" fill="#9fd0ea" opacity=".85"/>${[[-30,-52,'#e2463b'],[-20,-58,'#fff'],[-12,-50,'#e2463b'],[-24,-46,'#f5b72d'],[-36,-46,'#fff']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke="#e8c9c9" stroke-width="1"/>`).join('')}<path d="M-22 -40 l-6 -6 M-22 -40 l8 -6" stroke="#3f9a4c" stroke-width="2"/>
<path d="M14 -18 q0 -18 12 -18 q12 0 12 18z" fill="#f5b72d" stroke="#b9860f" stroke-width="1.5"/><rect x="23" y="-44" width="6" height="9" rx="2" fill="#8a5d36"/><circle cx="26" cy="-16" r="3" fill="#b9860f"/>
<path d="M38 -30 q10 6 6 18 M40 -32 q14 0 14 14" stroke="#e2463b" stroke-width="3" fill="none"/>
<rect x="-4" y="-24" width="22" height="6" fill="#2f6fd6"/><rect x="-2" y="-29" width="20" height="5" fill="#e2463b"/></g>
${desk(58,262,1.1)}${desk(342,262,1.1)}
<!-- фотоальбом на парте слева -->
<g transform="translate(46 236) rotate(-8)"><rect width="28" height="20" fill="#7a3b2e"/><rect x="3" y="3" width="22" height="14" fill="#efe6d2"/><text x="14" y="13" text-anchor="middle" font-size="5" font-family="Arial" fill="#7a3b2e">1968</text></g>
<g transform="translate(330 232)"><rect width="22" height="16" rx="2" fill="#fff" stroke="#c9b48c"/><path d="M3 5 h16 M3 9 h16 M3 13 h10" stroke="#2f6fd6" stroke-width="1"/><text x="18" y="15" font-size="10" font-weight="800" fill="#e2463b" font-family="Arial">5</text></g>
</svg>`;}};})();
