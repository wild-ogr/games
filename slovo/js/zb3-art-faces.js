'use strict';
/* zb3-art-faces — портреты новых героев сценок «Зины 3.0» кружками, как соседки (sosFace в js/sosedki.js: viewBox 0 0 100 100, круг-обрезка,
   та же кожа, глаза, румянец, рот). Поток SKIN, 25.10.2026 (заказ владельца через LEAD). Грузится лениво: Z3.artLoad('faces').then(…).
   Z3ART.face_klava(mood) → <svg> — сватья Клава из Подгорного: цветастый платок в горох, румянец, бусы-рябина, ситцевая кофта.
   Z3ART.face_fedor(mood) → <svg> — сват Фёдор: кепка-восьмиклинка, пышные усы, нос картошкой, клетчатая рубашка, загар.
   mood: 'happy' (по умолчанию, глаза-дуги) | 'norm' | 'open' (удивлён/смеётся) | 'strict'. Облик Зины, кота и соседок здесь не трогаем. */
(function(){
  var A=window.Z3ART=window.Z3ART||{},N=0;
  var SK='#f6c9a8',SK2='#eab28f',BL='#f58f8f',EY='#3a2a22',MO='#b83b44';
  function face(sk){sk=sk||SK;return '<ellipse cx="50" cy="56" rx="25" ry="27" fill="'+sk+'"/><circle cx="25" cy="58" r="5" fill="'+sk+'"/><circle cx="75" cy="58" r="5" fill="'+sk+'"/>';}
  function blush(o){return '<ellipse cx="37" cy="66" rx="6" ry="3.8" fill="'+BL+'" opacity="'+(o||.55)+'"/><ellipse cx="63" cy="66" rx="6" ry="3.8" fill="'+BL+'" opacity="'+(o||.55)+'"/>';}
  function eyes(m){return m==='happy'||!m
    ?'<path d="M37 56 q4 -4 8 0 M55 56 q4 -4 8 0" stroke="'+EY+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    :'<circle cx="41" cy="56" r="2.8" fill="'+EY+'"/><circle cx="59" cy="56" r="2.8" fill="'+EY+'"/><circle cx="41.8" cy="55.2" r=".9" fill="#fff"/><circle cx="59.8" cy="55.2" r=".9" fill="#fff"/>';}
  function mouth(m){return m==='strict'?'<path d="M44 72 q6 -1.5 12 0" stroke="'+MO+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
    :m==='open'?'<path d="M42 70 q8 10 16 0 q-8 3 -16 0z" fill="'+MO+'"/>'
    :'<path d="M42 70 q8 8 16 0" stroke="'+MO+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>';}
  function wrap(s){var id='z3f'+(++N);return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><clipPath id="'+id+'"><circle cx="50" cy="50" r="50"/></clipPath><g clip-path="url(#'+id+')">'+s+'</g></svg>';}
  // сватья Клава из Подгорного
  A.face_klava=function(m){m=m||'happy';
    var dots='';[[30,24],[44,18],[58,18],[72,24],[24,40],[78,40],[36,32],[64,32],[50,28]].forEach(function(p){dots+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.6" fill="#fff"/>';});
    return wrap('<circle cx="50" cy="50" r="50" fill="#fdeacb"/>'+
      '<path d="M12 100 q2 -21 24 -25 h28 q22 4 24 25z" fill="#5aa0d8"/><g fill="#fff" opacity=".85"><circle cx="26" cy="90" r="2"/><circle cx="40" cy="96" r="2"/><circle cx="62" cy="94" r="2"/><circle cx="76" cy="88" r="2"/><circle cx="50" cy="86" r="2"/></g>'+
      '<path d="M40 76 l10 8 l10 -8" fill="#fff"/>'+
      face()+'<path d="M28 50 q4 -14 22 -14 q18 0 22 14 q-8 -8 -22 -7 q-14 -1 -22 7z" fill="#c9773f"/>'+
      // платок: облегает голову, узел под подбородком
      '<path d="M50 12 q30 0 33 36 q2 20 -6 30 q-4 -26 -6 -34 q-6 -14 -21 -14 q-15 0 -21 14 q-2 8 -6 34 q-8 -10 -6 -30 q3 -36 33 -36z" fill="#e2463b"/>'+dots+
      '<path d="M40 82 q10 -6 20 0 l-4 10 q-6 -4 -12 0z" fill="#e2463b"/><circle cx="50" cy="83" r="4" fill="#c7352b"/>'+
      blush(.7)+eyes(m)+'<path d="M35 49 q6 -3 11 0 M54 49 q6 -3 11 0" stroke="#8a4a24" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
      '<ellipse cx="50" cy="63" rx="3" ry="2.4" fill="'+SK2+'"/>'+mouth(m)+
      '<g fill="#e2463b">'+[30,37,44,50,56,63,70].map(function(x,i){return '<circle cx="'+x+'" cy="'+(90+Math.abs(3-i)*-1.2+4)+'" r="2.8"/>';}).join('')+'</g>');};
  // сват Фёдор
  A.face_fedor=function(m){m=m||'happy';var sk='#eebd96';
    return wrap('<circle cx="50" cy="50" r="50" fill="#fbe3c8"/>'+
      // клетчатая рубашка
      '<path d="M12 100 q2 -21 24 -25 h28 q22 4 24 25z" fill="#3f6fb0"/>'+
      '<g stroke="#c9d8ef" stroke-width="2.2" opacity=".8"><path d="M22 84 v16 M34 77 v23 M66 77 v23 M78 84 v16"/><path d="M14 90 h72 M18 97 h64"/></g>'+
      '<path d="M41 76 l9 10 l9 -10" fill="#f4efe2"/><path d="M50 86 v14" stroke="#2c548c" stroke-width="1.6"/>'+
      face(sk)+'<path d="M26 54 q-1 -8 4 -12 M74 54 q1 -8 -4 -12" stroke="#b9b2a6" stroke-width="5" stroke-linecap="round" fill="none"/>'+
      // кепка-восьмиклинка с козырьком
      '<path d="M22 40 q2 -24 30 -24 q28 0 28 22 q-4 4 -28 4 q-24 0 -30 -2z" fill="#6b5a4a"/><path d="M52 16 v22 M36 20 l6 18 M68 20 l-6 18" stroke="#57483a" stroke-width="1.6"/>'+
      '<circle cx="52" cy="17" r="2.6" fill="#57483a"/><path d="M28 40 q22 8 52 -2 q4 4 0 6 q-28 8 -54 0z" fill="#4a3d31"/>'+
      eyes(m)+'<path d="M34 48 q6 -3 11 0 M55 48 q6 -3 11 0" stroke="#8d8579" stroke-width="3" fill="none" stroke-linecap="round"/>'+
      blush(.45)+'<ellipse cx="50" cy="63" rx="5.5" ry="4.6" fill="#e2a079"/><ellipse cx="48.5" cy="61.6" rx="1.8" ry="1.2" fill="#fff" opacity=".5"/>'+
      (m==='open'?'<path d="M43 72 q7 8 14 0 q-7 2 -14 0z" fill="'+MO+'"/>':'')+
      // усы
      '<path d="M50 67 q-8 -3 -14 1 q-6 4 -11 0 q3 8 13 6 q8 -2 12 -4 q4 2 12 4 q10 2 13 -6 q-5 4 -11 0 q-6 -4 -14 -1z" fill="#c9c2b6"/>');};
})();
