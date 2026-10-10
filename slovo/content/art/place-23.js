/* Место 23 (ART-3) · глава 23 «Поезд на юг» — «Плацкарт, курочка в фольге, чай в подстаканнике. Едем к морю!»
   Фон главы 400×300. Подключение: ZB.load('content/art/place-23.js').then(()=>el.innerHTML=ZB_ART[23].svg()) — см. README-3.md.
   Купе плацкарта: в окне море, солнце, горы и пальма; на столике курочка в фольге, яйца, огурец,
   два стакана чая в подстаканниках, соль в спичечном коробке; полки, полосатый матрас,
   с верхней полки торчат ноги соседа в полосатых носках, табличка «Чай — у проводника». */
(function(){
var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[23]={id:'poezd-yug',n:'Поезд на юг',c:'#fdeed5',svg:function(PA){var u='a23_'+(++k);PA=PA||'xMidYMid slice';
  var tea=function(x){return '<rect x="'+(x-7)+'" y="150" width="14" height="22" rx="1" fill="#c96a2a" opacity=".85"/><rect x="'+(x-7)+'" y="148" width="14" height="5" fill="#e9d6b8" opacity=".7"/>'
    +'<path d="M'+(x-9)+' 158 h18 l-2 16 h-14z" fill="#c9cdd6" stroke="#8d95a3" stroke-width="1"/><path d="M'+(x-6)+' 164 l3 3 l3 -3 l3 3 l3 -3" stroke="#8d95a3" stroke-width="1" fill="none"/>'
    +'<path d="M'+(x+9)+' 160 q8 0 8 6 q0 6 -8 6" stroke="#8d95a3" stroke-width="2.2" fill="none"/><path d="M'+(x+3)+' 138 l-3 14" stroke="#c9cdd6" stroke-width="2"/>'
    +'<path d="M'+(x-3)+' 144 q-3 -6 0 -10 M'+(x+2)+' 142 q3 -6 0 -10" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/>';};
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="'+PA+'" style="width:100%;height:100%;display:block">'
  +'<defs><linearGradient id="sk_'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#e6f6ff"/></linearGradient>'
  +'<linearGradient id="sea_'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f9fd6"/><stop offset="1" stop-color="#69c6e8"/></linearGradient>'
  +'<linearGradient id="fo_'+u+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fa"/><stop offset=".5" stop-color="#b9c0cc"/><stop offset="1" stop-color="#e8ebf0"/></linearGradient>'
  +'<clipPath id="wc_'+u+'"><rect x="118" y="34" width="164" height="112" rx="14"/></clipPath></defs>'
  +'<rect width="400" height="300" fill="#efe5cc"/><rect x="0" y="0" width="400" height="26" fill="#e2d6b8"/><rect x="0" y="176" width="400" height="80" fill="#cfd9c4"/>'
  // окно
  +'<g clip-path="url(#wc_'+u+')"><rect x="118" y="34" width="164" height="112" fill="url(#sk_'+u+')"/>'
  +'<circle cx="244" cy="62" r="14" fill="#ffe08a"/><circle cx="244" cy="62" r="22" fill="#ffe08a" opacity=".3"/>'
  +'<path d="M118 112 l26 -30 l20 18 l24 -26 l30 38z" fill="#9db7c9"/><path d="M144 82 l6 7 l6 -2 M188 74 l8 10 l6 -3" stroke="#fff" stroke-width="2" fill="none"/>'
  +'<rect x="118" y="110" width="164" height="40" fill="url(#sea_'+u+')"/><path d="M130 122 q6 -3 12 0 M170 130 q6 -3 12 0 M214 120 q6 -3 12 0 M240 134 q6 -3 12 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>'
  +'<path d="M232 112 q4 -10 14 -12 l-4 -4 l12 2 l-6 6z" fill="#fff"/><path d="M238 112 v-4" stroke="#c8434c" stroke-width="2"/>'
  +'<path d="M264 146 q-2 -30 4 -50" stroke="#8a5a3c" stroke-width="4" fill="none"/>'
  +'<g fill="#3f9a4c"><path d="M268 96 q-16 -6 -26 6 q12 -4 26 -6z"/><path d="M268 96 q16 -8 26 4 q-12 -2 -26 -4z"/><path d="M268 96 q-6 -14 -20 -14 q10 4 20 14z"/><path d="M268 96 q8 -14 22 -12 q-12 4 -22 12z"/></g>'
  +'<path d="M150 56 q4 -3 8 0 q4 -3 8 0 M178 46 q3 -2 6 0 q3 -2 6 0" stroke="#4a5a6a" stroke-width="1.4" fill="none"/></g>'
  +'<rect x="114" y="30" width="172" height="120" rx="16" fill="none" stroke="#b8bfc9" stroke-width="7"/><path d="M118 92 h164" stroke="#b8bfc9" stroke-width="4"/>'
  // занавески
  +'<path d="M104 30 h40 q-6 24 2 46 q-22 4 -42 0z" fill="#fff"/><path d="M296 30 h-40 q6 24 -2 46 q22 4 42 0z" fill="#fff"/>'
  +'<path d="M104 70 h42 M254 70 h42" stroke="#2f6fd6" stroke-width="3"/><path d="M98 30 h204" stroke="#8d95a3" stroke-width="3"/>'
  // столик
  +'<path d="M120 172 h160 v8 h-160z" fill="#d6c3a0"/><rect x="120" y="170" width="160" height="4" fill="#bfa77e"/><path d="M196 180 v62 M204 180 v62" stroke="#8d95a3" stroke-width="3"/>'
  +'<path d="M182 242 h36" stroke="#8d95a3" stroke-width="4" stroke-linecap="round"/>'
  // курочка в фольге
  +'<path d="M140 170 q-4 -18 18 -22 q22 -2 24 12 q2 8 -4 10z" fill="url(#fo_'+u+')" stroke="#9aa2b0" stroke-width="1"/><path d="M146 158 l6 4 M160 152 l2 6 M170 156 l-4 5" stroke="#9aa2b0" stroke-width="1"/>'
  +'<path d="M168 160 q10 -10 18 -6 q4 4 -2 8 q-6 2 -16 6z" fill="#d99a4e"/><circle cx="188" cy="154" r="3.4" fill="#f4ead6"/><circle cx="190" cy="157" r="3" fill="#f4ead6"/>'
  // яйца и огурец, соль
  +'<ellipse cx="200" cy="166" rx="5" ry="6.5" fill="#fbf6ec" stroke="#d8cdb8" stroke-width=".8"/><ellipse cx="210" cy="167" rx="5" ry="6" fill="#fbf6ec" stroke="#d8cdb8" stroke-width=".8"/>'
  +'<path d="M180 170 q-4 -8 8 -10 q16 -2 18 4" fill="none"/><ellipse cx="226" cy="168" rx="11" ry="4" fill="#4c9a5a" transform="rotate(-12 226 168)"/><g fill="#8fcf7a">'+[220,226,232].map(function(x){return '<circle cx="'+x+'" cy="'+(168-(x-226)*.2)+'" r=".9"/>';}).join('')+'</g>'
  +'<rect x="238" y="162" width="14" height="9" fill="#f2d14b"/><rect x="238" y="162" width="14" height="3" fill="#d8433f"/><g fill="#fff">'+[241,244,247,249].map(function(x,i){return '<circle cx="'+x+'" cy="'+(160-(i%2))+'" r=".9"/>';}).join('')+'</g>'
  +tea(130)+tea(266)
  // полки нижние
  +'<rect x="0" y="198" width="104" height="40" rx="5" fill="#3a6e8c"/><rect x="0" y="236" width="100" height="10" fill="#2e5a74"/><path d="M8 210 h86" stroke="#4d84a6" stroke-width="2"/>'
  +'<rect x="296" y="198" width="104" height="40" rx="5" fill="#3a6e8c"/><rect x="300" y="236" width="100" height="10" fill="#2e5a74"/><path d="M306 210 h86" stroke="#4d84a6" stroke-width="2"/>'
  // матрас свёрнутый
  +'<rect x="18" y="176" width="58" height="24" rx="12" fill="#f4f1ea"/><g stroke="#5a8fcf" stroke-width="3">'+[26,36,46,56,66].map(function(x){return '<path d="M'+x+' 177 v22"/>';}).join('')+'</g>'
  // верхняя полка и ноги соседа
  +'<rect x="300" y="44" width="100" height="14" rx="3" fill="#3a6e8c"/><rect x="300" y="58" width="100" height="4" fill="#2e5a74"/><path d="M300 62 l-4 22" stroke="#8d95a3" stroke-width="2"/>'
  +'<rect x="318" y="30" width="82" height="16" rx="6" fill="#f4f1ea"/>'
  +'<g><rect x="304" y="34" width="16" height="11" rx="5" fill="#e8475a"/><path d="M308 35 v9 M313 35 v9" stroke="#fff" stroke-width="2"/><path d="M304 36 q-8 0 -8 6 q0 4 8 3z" fill="#e8475a"/>'
  +'<rect x="304" y="47" width="16" height="11" rx="5" fill="#e8475a" transform="translate(0 -1)"/><path d="M308 47 v9 M313 47 v9" stroke="#fff" stroke-width="2"/><path d="M304 48 q-8 0 -8 6 q0 4 8 3z" fill="#e8475a"/></g>'
  +'<text x="372" y="26" font-family="Georgia,serif" font-size="9" font-style="italic" fill="#6a6f7b">хр-р…</text>'
  // табличка
  +'<rect x="20" y="40" width="70" height="30" rx="3" fill="#fff" stroke="#b8c6d4"/><text x="55" y="53" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="7.5" font-weight="700" fill="#2f6fd6">ЧАЙ —</text><text x="55" y="64" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="7.5" font-weight="700" fill="#2f6fd6">у проводника</text>'
  +'<path d="M20 100 h76 M20 104 h76" stroke="#8d95a3" stroke-width="2"/><rect x="34" y="88" width="20" height="12" rx="2" fill="#c8434c"/><rect x="58" y="90" width="14" height="10" rx="2" fill="#f2d14b"/>'
  // пол и дорожка
  +'<rect x="0" y="246" width="400" height="54" fill="#a8977c"/><path d="M150 246 h100 l30 54 h-160z" fill="#b83b44"/><path d="M160 252 h80 M150 270 h100 M140 288 h120" stroke="#e8b33a" stroke-width="2"/>'
  +'</svg>';}};
})();
