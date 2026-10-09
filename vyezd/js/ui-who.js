/* ui-who.js — портреты жильцов для экранов UX (главный, окно победы). Рисунки — поток ART (js/art-people.js → VYPPL.svg(who,mood)).
   Пока ART нет — заглушки здесь (простые, в стиле бабы Шуры игры: viewBox 0 0 60 60, плечи снизу).
   UI.who(id, mood) → '<svg …>' ; UI.whoName(id) → имя (оба языка). id: shura, tolik, mihalych, valerka, mityai. */
(function(){'use strict';
  if(!window.UI)return;
  var SK='#f7d3b0',INK='#5d4037';
  function eyes(y,sad){return '<circle cx="24.5" cy="'+y+'" r="1.7" fill="#2d3436"/><circle cx="35.5" cy="'+y+'" r="1.7" fill="#2d3436"/>'+(sad?'<path d="M21 '+(y-5)+'l6 1.5M39 '+(y-5)+'l-6 1.5" stroke="#6d4c41" stroke-width="1.6" stroke-linecap="round"/>':'');}
  function mouth(m,y){return m==='sad'?'<path d="M26 '+(y+2)+'q4-3 8 0" stroke="#8a3b2e" stroke-width="2" fill="none" stroke-linecap="round"/>':m==='happy'||m==='clap'?'<path d="M24 '+y+'q6 7 12 0z" fill="#8a3b2e"/>':'<path d="M25 '+y+'q5 4 10 0" stroke="#8a3b2e" stroke-width="2" fill="none" stroke-linecap="round"/>';}
  function cheeks(y){return '<circle cx="21.5" cy="'+y+'" r="2.6" fill="#f29a9a" opacity=".5"/><circle cx="38.5" cy="'+y+'" r="2.6" fill="#f29a9a" opacity=".5"/>';}
  function hands(m,col){return m==='clap'?'<circle cx="23" cy="52" r="4.5" fill="'+SK+'" stroke="'+col+'" stroke-width="1.2"/><circle cx="37" cy="52" r="4.5" fill="'+SK+'" stroke="'+col+'" stroke-width="1.2"/>':'';}
  var STUB={
    // Толик «Карбюратор» (облик Покера: синий комбинезон, кепка, усы)
    tolik:function(m){return '<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M6 62q2-16 24-16t24 16z" fill="#2c5aa0"/><path d="M22 47v15M38 47v15" stroke="#1d3f73" stroke-width="3"/><circle cx="22" cy="54" r="1.6" fill="#f5b72d"/><circle cx="38" cy="54" r="1.6" fill="#f5b72d"/>'
      +'<ellipse cx="30" cy="31" rx="12.5" ry="13.5" fill="'+SK+'"/><path d="M15 23q2-11 15-11t15 11z" fill="#3c4f68"/><path d="M14 23h26q8 0 9 3H14z" fill="#2c3e55"/>'
      +eyes(30,m==='sad')+'<path d="M22 37q8-4 16 0q-3 3-8 1q-5 2-8-1z" fill="#6d4c41"/>'+mouth(m,40)+'<path d="M36 42l4 1" stroke="#555" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>'+hands(m,'#1d3f73')+'</svg>';},
    // Михалыч-дворник (ушанка, усы, оранжевый жилет)
    mihalych:function(m){return '<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M6 62q2-16 24-16t24 16z" fill="#5d6b7c"/><path d="M14 62q1-12 9-15l7 9 7-9q8 3 9 15z" fill="#ff8a1f"/><path d="M15 56h30" stroke="#f4f6f4" stroke-width="3"/>'
      +'<ellipse cx="30" cy="32" rx="12.5" ry="13.5" fill="'+SK+'"/><path d="M15 26q0-15 15-15t15 15z" fill="#7a5c45"/><path d="M14 22q-3 8 1 14l3-1v-12zM46 22q3 8-1 14l-3-1v-12z" fill="#8d6e55"/><path d="M17 20q13-5 26 0" stroke="#5d4535" stroke-width="2" fill="none"/>'
      +eyes(31,m==='sad')+cheeks(36)+'<path d="M21 38q9-5 18 0q-4 4-9 1q-5 3-9-1z" fill="#9e9e9e"/>'+mouth(m,41)+hands(m,'#c56a12')+'</svg>';},
    // Валерка — школьник-отличник (чёлка, очки, пионерский галстук)
    valerka:function(m){return '<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M8 62q2-15 22-15t22 15z" fill="#f5f6fa"/><path d="M27 48l3 6 3-6z" fill="#e53935"/><path d="M24 48l6 4 6-4-4 10h-4z" fill="#e53935"/>'
      +'<ellipse cx="30" cy="32" rx="12" ry="13" fill="'+SK+'"/><path d="M17 27q-1-14 13-15q15 0 13 15q-6-7-13-5q-7-3-13 5z" fill="#c8893f"/>'
      +'<circle cx="24.5" cy="31" r="4.4" fill="#fff" fill-opacity=".35" stroke="#3949ab" stroke-width="1.5"/><circle cx="35.5" cy="31" r="4.4" fill="#fff" fill-opacity=".35" stroke="#3949ab" stroke-width="1.5"/><path d="M29 31h2" stroke="#3949ab" stroke-width="1.5"/>'
      +eyes(31,m==='sad')+cheeks(37)+mouth(m,39)+'<circle cx="27" cy="25" r=".8" fill="#a0672b"/><circle cx="34" cy="26" r=".8" fill="#a0672b"/>'+hands(m,'#c9ccd8')+'</svg>';},
    // Дед Митяй (панама рыбака, седая борода)
    mityai:function(m){return '<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M6 62q2-16 24-16t24 16z" fill="#6b8e4e"/>'
      +'<ellipse cx="30" cy="31" rx="12.5" ry="13.5" fill="'+SK+'"/><path d="M19 37q11 18 22 0q-2 12-11 13q-9-1-11-13z" fill="#eceff1"/>'
      +'<path d="M12 23q3-12 18-12t18 12q-3 2-18 2t-18-2z" fill="#c9b27a"/><path d="M10 24q20 4 40 0" stroke="#a8925c" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
      +eyes(30,m==='sad')+'<path d="M21 26l6 .5M39 26l-6 .5" stroke="#cfd8dc" stroke-width="2" stroke-linecap="round"/><ellipse cx="30" cy="34" rx="2.2" ry="2.6" fill="#eab08c"/>'+mouth(m,40)+hands(m,'#4c6b35')+'</svg>';}
  };
  var NAMES={shura:['Баба Шура','Granny Shura'],tolik:['Толик «Карбюратор»','Tolik “Carburettor”'],mihalych:['Михалыч','Mikhalych'],valerka:['Валерка','Valerka'],mityai:['Дед Митяй','Grandpa Mityai']};
  UI.who=function(id,mood){mood=mood||'norm';
    try{if(window.VYPPL&&VYPPL.svg){var s=VYPPL.svg(id,mood);if(s)return s;}}catch(e){}
    if(id==='shura'&&typeof shuraSvg==='function')return shuraSvg(mood==='sad'?'sad':'');
    return (STUB[id]||STUB.mityai)(mood);};
  UI.whoName=function(id){var n=NAMES[id]||[id,id];return VY.L(n[0],n[1]);};
  UI.WHO=Object.keys(NAMES);
})();
