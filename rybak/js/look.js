/* Рыбалка с Петровичем — ВИД «Стекло и свет» (rlook, 03.10). Журнал: hobby-analytics/release-f/rybak-redesign.md
   Грузится в <head> до игры. Только вид: сцена, рыбы, Петрович, лупа (кроме рамки), звук и механика — без изменений.
   - свои SVG-значки (IG, 24×24, одна геометрия: линия .ic + заливка деталей .d — подачу задаёт тема через CSS-переменные),
     своя монета, нарисованные товары ART (магазин, покупки), лица отправителей AV;
   - подмена эмодзи интерфейса значками на лету (MutationObserver): эмодзи остаётся скрытым текстом <lk-t> —
     textContent, проверки и автопрогоны не меняются; на холсте (сцена) ничего не подменяется;
   - рамка лупы и шкала натяжения на холсте — в стиле темы (CSS-переменные --cv-*: LOOK.ring / LOOK.tension);
   - фон экранов меню — пейзаж места из той же paintBg (LOOK.bg), запасной вид без размытия (класс nb: старые WebView — CSS @supports,
     слабые телефоны — замер кадра на рыбалке, ?nb=1).
   Старые WebView: без inset, без ?. и ??, эмодзи ≤ Emoji 11. window.LOOK = {I, art, coin, av, cv, ring, tension, bg, refresh}. */
(function(){
'use strict';
var IG={
 back:'<path d="M15 5l-7 7 7 7"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 set:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle class="d" cx="15" cy="7" r="2.3"/><circle class="d" cx="9" cy="17" r="2.3"/>',
 rod:'<path d="M4.5 20.5L19.5 3.5"/><path d="M19.5 3.5v10.5"/><path d="M19.5 14c0 1.8-1.2 2.6-2.4 2.6"/><circle class="d" cx="8" cy="16.6" r="2.4"/>',
 reel:'<circle class="d" cx="11" cy="13.5" r="6.5"/><circle cx="11" cy="13.5" r="2.2"/><path d="M11 7V3.5M7.5 3.5h7M17.5 13.5h2.5v4.5"/><circle cx="20" cy="19.2" r="1.3"/>',
 line:'<path class="d" d="M7 6h10v12H7z"/><path d="M5 4h14M5 20h14M7 9.5h10M7 12.5h10M7 15.5h10"/>',
 float:'<path d="M12 2.5V7"/><path class="d" d="M12 7c2.8 0 3.8 3.4 3.8 6.3 0 2.9-1.9 5.8-3.8 8.2-1.9-2.4-3.8-5.3-3.8-8.2C8.2 10.4 9.2 7 12 7z"/><path d="M8.3 13.4h7.4"/>',
 hook:'<path d="M12 3v11a4 4 0 01-8 0v-1.5"/><path d="M4 12.5l-1.5 2"/><circle cx="12" cy="3" r="1"/>',
 worm:'<path d="M3.5 14.5c1.8-3.5 4.2-3.5 5.6-.6 1.3 2.7 3.6 2.8 5.2-.1 1.4-2.6 3.6-3.4 6.2-1.6"/><circle cx="20.4" cy="12" r=".6"/>',
 bell:'<path class="d" d="M6 16v-4.5a6 6 0 0112 0V16l1.8 2H4.2z"/><path d="M10 20.5a2 2 0 004 0M12 3.5v2"/>',
 bag:'<path class="d" d="M5 8.5h14l-1.2 11.5H6.2z"/><path d="M9 8.5V6.8a3 3 0 016 0v1.7"/>',
 map:'<path class="d" d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
 mail:'<rect class="d" x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7.5l8.5 6 8.5-6"/>',
 goal:'<circle cx="12" cy="12" r="8.5"/><circle class="d" cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
 cal:'<rect class="d" x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4M8 13.5h2M14 13.5h2M8 16.5h2"/>',
 cup:'<path class="d" d="M5 6.5h11v6a5 5 0 01-5 5h-1a5 5 0 01-5-5z"/><path d="M16 8.5h1.5a2.5 2.5 0 010 5H16M4 20.5h13"/>',
 trophy:'<path class="d" d="M8 4h8v5.5a4 4 0 01-8 0z"/><path d="M8 6H5.2a3 3 0 003 4.3M16 6h2.8a3 3 0 01-3 4.3M12 13.5v3.5M8.5 20.5h7M10 17h4v3.5h-4z"/>',
 book:'<path class="d" d="M4.5 5.2A2.2 2.2 0 016.7 3H19.5v15H6.7a2.2 2.2 0 00-2.2 2.2z"/><path d="M4.5 20.2V5.2M4.5 20.2c0 .5.4.8.9.8H19.5M8.5 7.5h7"/>',
 fish:'<path class="d" d="M2.8 12c2.9-4.1 9-5.2 13.1-1.2L20.5 7.5v9l-4.6-3.3C11.8 17.2 5.7 16.1 2.8 12z"/><circle cx="7" cy="11.4" r=".9"/>',
 sun:'<circle class="d" cx="12" cy="12" r="4"/><path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
 morning:'<path class="d" d="M6.5 16a5.5 5.5 0 0111 0z"/><path d="M3 16h18M5 19.5h14M12 5.5v2M4.6 9.6l1.4 1.4M19.4 9.6L18 11"/>',
 evening:'<path class="d" d="M6.5 16a5.5 5.5 0 0111 0z"/><path d="M3 16h18M5 19.5h14M12 4v4M10 6l2 2 2-2"/>',
 cloud:'<path class="d" d="M7 18.5a4.5 4.5 0 01-.6-9A6 6 0 0117.8 8.3 4.6 4.6 0 0117.5 18.5z"/>',
 moon:'<path class="d" d="M19 14.5A7.5 7.5 0 019.5 5a7.5 7.5 0 109.5 9.5z"/>',
 wind:'<path d="M3 9h11.5a2.5 2.5 0 10-2.5-2.5M3 13h15.5a2.5 2.5 0 11-2.5 2.5M3 17h7"/>',
 star:'<path class="d" d="M12 3.2l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L12 16.4l-5.3 3 1.2-5.9-4.5-4.1 6-.7z"/>',
 lock:'<rect class="d" x="5" y="10.5" width="14" height="10" rx="2.3"/><path d="M8 10.5V8a4 4 0 018 0v2.5M12 14.5v2.5"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 ad:'<rect class="d" x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M10.2 9.2l4.6 2.8-4.6 2.8z"/>',
 gift:'<rect class="d" x="4" y="9.5" width="16" height="11" rx="1.5"/><path d="M3 7h18v2.5H3zM12 7v13.5M12 7c-1.5-3.5-5.5-3.5-5-1 .3 1.3 2.5 1 5 1zM12 7c1.5-3.5 5.5-3.5 5-1-.3 1.3-2.5 1-5 1z"/>',
 card:'<rect class="d" x="2.8" y="5.5" width="18.4" height="13" rx="2.5"/><path d="M2.8 9.5h18.4M6.5 15h4"/>',
 home:'<path class="d" d="M4 11l8-6.5 8 6.5v9H4z"/><path d="M9.8 20v-5h4.4v5"/>',
 again:'<path d="M19 12a7 7 0 11-2.1-5"/><path d="M19.5 4v4h-4"/>',
 clock:'<circle class="d" cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 pin:'<path class="d" d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
 phone:'<path class="d" d="M6.5 3.5h3l1.5 4.2-2.1 1.3a11 11 0 006.1 6.1l1.3-2.1 4.2 1.5v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.7a2 2 0 012-2.2z"/>',
 depth:'<path d="M12 4v11M8.5 11.5L12 15l3.5-3.5M3 19c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0"/>',
 leaf:'<path class="d" d="M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-14 15"/><path d="M5 19l8-8"/>',
 medal:'<path d="M8 3l2.5 6M16 3l-2.5 6"/><circle class="d" cx="12" cy="15" r="5.5"/><path d="M12 12.5v5"/>',
 list:'<rect class="d" x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5V2.5h6v1M8.5 9h7M8.5 12.5h7M8.5 16h4.5"/>',
 noads:'<rect class="d" x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4.5 4.5l15 15"/>',
 wallet:'<path class="d" d="M3.5 7.5h15a2 2 0 012 2v9a2 2 0 01-2 2h-13a2 2 0 01-2-2z"/><path d="M3.5 7.5L15 3.8l1.3 3.7M16 14h4.5"/>',
 chest:'<path class="d" d="M3.5 10.5h17v9h-17z"/><path d="M3.5 10.5a8.5 5 0 0117 0M3.5 14h17M12 12.5v3"/>',
 box:'<path class="d" d="M3.5 9h17v10.5h-17z"/><path d="M8.5 9V6.5h7V9M3.5 13h17"/>',
 shield:'<path class="d" d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 spark:'<path class="d" d="M12 3l1.8 5.6L19.5 10l-5.7 1.6L12 17l-1.8-5.4L4.5 10l5.7-1.4z"/><path d="M19 16v4M17 18h4"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 bars:'<path d="M5 19V13M10 19V9M15 19V11M20 19V5"/>',
 user:'<circle class="d" cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0115 0"/>'
};
var ART={
 rod:'<svg viewBox="0 0 120 120"><defs><linearGradient id="rd1" x1="0" x2="1"><stop offset="0" stop-color="#3b4a5a"/><stop offset=".5" stop-color="#6d8299"/><stop offset="1" stop-color="#2a3644"/></linearGradient><linearGradient id="rd2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset="1" stop-color="#8a5a2b"/></linearGradient></defs><path d="M22 104L104 14" stroke="url(#rd1)" stroke-width="5" stroke-linecap="round"/><path d="M22 104l20-22" stroke="url(#rd2)" stroke-width="9" stroke-linecap="round"/><circle cx="53" cy="70" r="3.2" fill="none" stroke="#b9c6d3" stroke-width="2"/><circle cx="72" cy="49" r="2.6" fill="none" stroke="#b9c6d3" stroke-width="2"/><circle cx="89" cy="30.5" r="2.1" fill="none" stroke="#b9c6d3" stroke-width="2"/><path d="M104 14 Q110 50 96 82" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/><g transform="translate(96 82)"><path d="M0 0v6" stroke="#333" stroke-width="1.5"/><path d="M0 6c3 0 4 4 4 7s-2 6-4 8c-2-2-4-5-4-8s1-7 4-7z" fill="#e03131"/><path d="M-4 14h8c0 3-2 5-4 7-2-2-4-4-4-7z" fill="#f4f1ea"/></g><circle cx="36" cy="92" r="9" fill="#c7d1db" stroke="#5c6b7a" stroke-width="2"/><circle cx="36" cy="92" r="3" fill="#5c6b7a"/></svg>',
 line:'<svg viewBox="0 0 120 120"><defs><linearGradient id="ln1" x1="0" x2="1"><stop offset="0" stop-color="#1f6f8b"/><stop offset=".45" stop-color="#5fb3cf"/><stop offset="1" stop-color="#1a5568"/></linearGradient></defs><ellipse cx="60" cy="96" rx="34" ry="9" fill="#14394a"/><rect x="26" y="34" width="68" height="62" fill="url(#ln1)"/><g stroke="#bfe7f5" stroke-width="1.4" opacity=".55">'+[0,1,2,3,4,5,6,7,8,9,10].map(function(i){return '<path d="M26 '+(39+i*5.4)+'h68"/>';}).join('')+'</g><ellipse cx="60" cy="34" rx="34" ry="9" fill="#f2f6f8"/><ellipse cx="60" cy="34" rx="10" ry="3" fill="#9fb2bd"/><path d="M94 52c10 4 14 14 6 26" stroke="#bfe7f5" stroke-width="1.6" fill="none"/><rect x="38" y="60" width="44" height="16" rx="3" fill="#fff" opacity=".92"/><text x="60" y="72.5" text-anchor="middle" font-size="11" font-weight="700" fill="#1a5568" font-family="KF,sans-serif">0,28</text></svg>',
 reel:'<svg viewBox="0 0 120 120"><defs><linearGradient id="re1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f5"/><stop offset=".5" stop-color="#a9b6c2"/><stop offset="1" stop-color="#5d6b78"/></linearGradient><linearGradient id="re2" x1="0" x2="1"><stop offset="0" stop-color="#d9480f"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs><path d="M60 22v20" stroke="#5d6b78" stroke-width="7" stroke-linecap="round"/><rect x="34" y="14" width="52" height="9" rx="4.5" fill="#3d4a57"/><ellipse cx="56" cy="70" rx="30" ry="30" fill="url(#re1)"/><ellipse cx="56" cy="70" rx="19" ry="19" fill="url(#re2)"/><ellipse cx="56" cy="70" rx="6" ry="6" fill="#3d4a57"/><path d="M86 70h12" stroke="#5d6b78" stroke-width="5" stroke-linecap="round"/><path d="M98 70v18" stroke="#5d6b78" stroke-width="4" stroke-linecap="round"/><ellipse cx="98" cy="92" rx="5" ry="7" fill="#3d4a57"/><path d="M36 52a28 28 0 0116-10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></svg>',
 donka:'<svg viewBox="0 0 120 120"><path d="M14 100L98 30" stroke="#4a5a6a" stroke-width="4.5" stroke-linecap="round"/><path d="M14 100l18-15" stroke="#9a6a3a" stroke-width="8" stroke-linecap="round"/><path d="M98 30 Q104 60 110 104" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/><g transform="translate(86 40)"><path d="M0-8v6" stroke="#6b5a2a" stroke-width="2"/><path d="M-10 12V4a10 10 0 0120 0v8l3 4h-26z" fill="#f2b632"/><path d="M-6 0a7 7 0 018-6" stroke="#fff3c4" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="0" cy="19" r="3.4" fill="#b07a0c"/></g><path d="M64 34l-6-6M108 46l7-2M100 26l4-6" stroke="#f2b632" stroke-width="2.4" stroke-linecap="round"/></svg>',
 worm:'<svg viewBox="0 0 120 120"><ellipse cx="60" cy="98" rx="38" ry="8" fill="#000" opacity=".12"/><path d="M28 70c6-20 22-22 28-6 6 15 18 14 24-2 5-13 16-14 20-4" stroke="#d9777f" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M28 70c6-20 22-22 28-6 6 15 18 14 24-2 5-13 16-14 20-4" stroke="#f0a1a6" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7" transform="translate(-1 -3)"/><g stroke="#b9545d" stroke-width="2" opacity=".6"><path d="M42 54l3 8M64 74l4-7M84 54l4 6"/></g><circle cx="99" cy="57" r="1.8" fill="#5a2a2e"/><path d="M30 92h60" stroke="#7a5a3a" stroke-width="10" stroke-linecap="round" opacity=".55"/></svg>',
 maggot:'<svg viewBox="0 0 120 120"><defs><linearGradient id="tn" x1="0" x2="1"><stop offset="0" stop-color="#8d99a6"/><stop offset=".5" stop-color="#dde3e8"/><stop offset="1" stop-color="#7f8b97"/></linearGradient></defs><ellipse cx="60" cy="96" rx="40" ry="10" fill="#6b7783"/><rect x="20" y="52" width="80" height="44" fill="url(#tn)"/><ellipse cx="60" cy="52" rx="40" ry="10" fill="#c6ced6"/><ellipse cx="60" cy="54" rx="34" ry="7.5" fill="#efe6cf"/>'+[[42,52,-20],[56,50,10],[70,54,-35],[50,57,30],[78,51,15],[64,57,-5]].map(function(a){return '<ellipse cx="'+a[0]+'" cy="'+a[1]+'" rx="6.5" ry="3.2" fill="#fffaf0" stroke="#d8cba8" stroke-width="1" transform="rotate('+a[2]+' '+a[0]+' '+a[1]+')"/>';}).join('')+'<rect x="34" y="66" width="52" height="18" rx="4" fill="#f4bf3a"/><text x="60" y="79" text-anchor="middle" font-size="11" font-weight="800" fill="#6b4a00" font-family="KF,sans-serif">ОПАРЫШ</text></svg>',
 dough:'<svg viewBox="0 0 120 120"><ellipse cx="60" cy="98" rx="42" ry="9" fill="#000" opacity=".12"/><path d="M18 64h84c-2 22-20 34-42 34S20 86 18 64z" fill="#3f7d6e"/><path d="M18 64h84" stroke="#2c5d52" stroke-width="3"/><ellipse cx="60" cy="64" rx="42" ry="9" fill="#2c5d52"/><circle cx="48" cy="58" r="13" fill="#f6dfb0"/><circle cx="68" cy="56" r="12" fill="#f1d39a"/><circle cx="60" cy="47" r="10" fill="#f9e7c3"/><path d="M44 52a7 7 0 016-5M64 50a6 6 0 015-4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/></svg>',
 blood:'<svg viewBox="0 0 120 120"><defs><linearGradient id="jr" x1="0" x2="1"><stop offset="0" stop-color="#cfe3ea" stop-opacity=".9"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#b4cdd6" stop-opacity=".9"/></linearGradient></defs><ellipse cx="60" cy="100" rx="30" ry="6" fill="#000" opacity=".12"/><rect x="32" y="26" width="56" height="12" rx="3" fill="#c0392b"/><path d="M34 38h52v52a8 8 0 01-8 8H42a8 8 0 01-8-8z" fill="url(#jr)" stroke="#9bb5bf" stroke-width="1.5"/><g stroke="#c8283a" stroke-width="3.2" fill="none" stroke-linecap="round">'+[[42,60],[52,72],[62,58],[70,78],[48,86],[64,90],[74,64]].map(function(a){return '<path d="M'+a[0]+' '+a[1]+'q4 -6 8 0t8 0"/>';}).join('')+'</g><path d="M40 44v40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>',
 corn:'<svg viewBox="0 0 120 120"><defs><linearGradient id="cn" x1="0" x2="1"><stop offset="0" stop-color="#2f7d4a"/><stop offset=".5" stop-color="#4caf6a"/><stop offset="1" stop-color="#256b3d"/></linearGradient></defs><ellipse cx="60" cy="98" rx="30" ry="7" fill="#1f5a33"/><rect x="30" y="40" width="60" height="58" fill="url(#cn)"/><ellipse cx="60" cy="40" rx="30" ry="7" fill="#dfe6e9"/><ellipse cx="60" cy="41" rx="26" ry="5" fill="#f2c230"/><g fill="#ffd84d" stroke="#d9a400" stroke-width="1">'+[[44,40],[52,38],[60,41],[68,38],[76,41],[50,43],[64,44]].map(function(a){return '<circle cx="'+a[0]+'" cy="'+a[1]+'" r="3.2"/>';}).join('')+'</g><rect x="36" y="60" width="48" height="20" rx="10" fill="#ffd84d"/><g fill="#f2b632">'+[44,52,60,68,76].map(function(x){return '<circle cx="'+x+'" cy="70" r="3.3"/>';}).join('')+'</g></svg>',
 live:'<svg viewBox="0 0 120 120"><defs><linearGradient id="bk" x1="0" x2="1"><stop offset="0" stop-color="#8a96a3"/><stop offset=".5" stop-color="#d4dbe2"/><stop offset="1" stop-color="#7a8693"/></linearGradient></defs><path d="M24 44h72l-8 52H32z" fill="url(#bk)"/><ellipse cx="60" cy="44" rx="36" ry="9" fill="#5e8fa3"/><ellipse cx="60" cy="44" rx="36" ry="9" fill="none" stroke="#6b7783" stroke-width="3"/><path d="M26 44c0-26 68-26 68 0" stroke="#6b7783" stroke-width="2.5" fill="none"/><g transform="translate(60 40) rotate(-12)"><path d="M-16 0c6-8 18-9 26-2l6-5v14l-6-5c-8 7-20 6-26-2z" fill="#c9d6c2" stroke="#7f9174" stroke-width="1.2"/><circle cx="-10" cy="-1" r="1.6" fill="#223"/></g><path d="M40 50c4 2 8 2 12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></svg>',
 spoon:'<svg viewBox="0 0 120 120"><defs><linearGradient id="sp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfdfd"/><stop offset=".45" stop-color="#b8c2cc"/><stop offset="1" stop-color="#6e7a86"/></linearGradient></defs><circle cx="60" cy="18" r="5" fill="none" stroke="#8a96a3" stroke-width="3"/><path d="M60 24c18 6 22 34 12 54-6 12-18 12-24 0-10-20-6-48 12-54z" fill="url(#sp)" stroke="#5d6b78" stroke-width="1.5"/><path d="M52 40c-4 10-3 24 2 32" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="60" cy="60" r="5" fill="#e03131"/><path d="M60 84v8" stroke="#5d6b78" stroke-width="2.5"/><path d="M60 92c-6 0-8 8-2 10M60 92c6 0 8 8 2 10M60 92v12" stroke="#5d6b78" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
 club:'<svg viewBox="0 0 120 120"><defs><linearGradient id="cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f4f63"/><stop offset=".6" stop-color="#14323f"/><stop offset="1" stop-color="#0d222b"/></linearGradient><linearGradient id="clg" x1="0" x2="1"><stop offset="0" stop-color="#f7dc8a"/><stop offset="1" stop-color="#c9952a"/></linearGradient></defs><g transform="rotate(-8 60 60)"><rect x="12" y="30" width="96" height="62" rx="9" fill="url(#cl)"/><rect x="12" y="30" width="96" height="62" rx="9" fill="none" stroke="url(#clg)" stroke-width="2"/><path d="M22 76c10-14 30-16 44-4l8-6v16l-8-6c-14 12-34 10-44-4z" fill="url(#clg)" opacity=".9" transform="translate(4 -14) scale(.9)"/><rect x="22" y="40" width="16" height="12" rx="2.5" fill="url(#clg)"/><text x="98" y="84" text-anchor="end" font-size="10" font-weight="700" fill="#f7dc8a" font-family="KF,sans-serif" letter-spacing="1">КЛУБ</text></g></svg>',
 book:'<svg viewBox="0 0 120 120"><g transform="rotate(-6 60 60)"><rect x="26" y="18" width="70" height="86" rx="6" fill="#c8641e"/><rect x="26" y="18" width="12" height="86" rx="4" fill="#9c4a12"/><rect x="46" y="32" width="40" height="30" rx="4" fill="#fff3e0"/><path d="M52 54c8-14 18-18 28-16-4 10-12 16-28 16z" fill="#e0952f"/><path d="M52 54l14-10" stroke="#9c4a12" stroke-width="1.6"/><rect x="46" y="72" width="40" height="5" rx="2.5" fill="#fff3e0" opacity=".85"/><rect x="46" y="82" width="28" height="5" rx="2.5" fill="#fff3e0" opacity=".6"/></g></svg>',
 noads:'<svg viewBox="0 0 120 120"><defs><linearGradient id="na" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ec9a0"/><stop offset="1" stop-color="#1d7a5f"/></linearGradient></defs><path d="M60 14l38 14v28c0 24-16 42-38 50-22-8-38-26-38-50V28z" fill="url(#na)"/><rect x="40" y="44" width="40" height="28" rx="5" fill="#fff" opacity=".95"/><path d="M55 51l10 7-10 7z" fill="#1d7a5f"/><path d="M36 40l48 40" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M36 40l48 40" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></svg>',
 starter:'<svg viewBox="0 0 120 120"><ellipse cx="60" cy="104" rx="36" ry="6" fill="#000" opacity=".14"/><path d="M30 46c0-16 60-16 60 0v52a6 6 0 01-6 6H36a6 6 0 01-6-6z" fill="#4a7c59"/><path d="M44 30a16 12 0 0132 0" stroke="#365c41" stroke-width="5" fill="none"/><rect x="38" y="62" width="44" height="28" rx="5" fill="#3a6347"/><path d="M38 70h44" stroke="#2c4b35" stroke-width="2"/><circle cx="60" cy="76" r="3" fill="#f2b632"/><path d="M86 20L70 60" stroke="#5d6b78" stroke-width="3" stroke-linecap="round"/><path d="M36 50c6-6 18-8 24-6" stroke="#8fc59d" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/></svg>',
 wallet:'<svg viewBox="0 0 120 120"><ellipse cx="60" cy="102" rx="40" ry="6" fill="#000" opacity=".14"/><path d="M20 44h72a8 8 0 018 8v40a8 8 0 01-8 8H28a8 8 0 01-8-8z" fill="#8a5a2b"/><path d="M20 44l52-18 6 18" fill="#a8733d"/><rect x="74" y="62" width="28" height="18" rx="5" fill="#6e4520"/><circle cx="84" cy="71" r="3.5" fill="#f2c230"/><path d="M26 52h60" stroke="#b9854b" stroke-width="2" stroke-dasharray="4 4"/></svg>',
 chest:'<svg viewBox="0 0 120 120"><defs><linearGradient id="ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3773d"/><stop offset="1" stop-color="#7a4a1f"/></linearGradient></defs><ellipse cx="60" cy="104" rx="44" ry="6" fill="#000" opacity=".14"/><g fill="#f4bf3a" stroke="#c98a12" stroke-width="1.2">'+[[40,44],[52,40],[64,42],[76,44],[46,48],[70,48],[58,46]].map(function(a){return '<ellipse cx="'+a[0]+'" cy="'+a[1]+'" rx="7" ry="4"/>';}).join('')+'</g><path d="M16 56h88v44H16z" fill="url(#ch)"/><path d="M16 56c0-26 88-26 88 0" fill="#c58748" opacity=".0"/><path d="M16 56h88" stroke="#5a3514" stroke-width="3"/><path d="M28 56v44M92 56v44" stroke="#c9952a" stroke-width="5"/><rect x="52" y="62" width="16" height="18" rx="3" fill="#e8c260" stroke="#9c6f12" stroke-width="1.5"/><circle cx="60" cy="70" r="2.4" fill="#5a3514"/></svg>',
 box:'<svg viewBox="0 0 120 120"><ellipse cx="60" cy="104" rx="44" ry="6" fill="#000" opacity=".14"/><path d="M42 36V28h36v8" stroke="#2c5d52" stroke-width="5" fill="none"/><rect x="16" y="36" width="88" height="64" rx="7" fill="#2f8f7a"/><rect x="16" y="36" width="88" height="22" rx="7" fill="#3aa58d"/><rect x="52" y="52" width="16" height="10" rx="2" fill="#f2c230"/><g opacity=".9"><rect x="26" y="68" width="18" height="22" rx="3" fill="#f4f1ea"/><rect x="51" y="68" width="18" height="22" rx="3" fill="#ffd84d"/><rect x="76" y="68" width="18" height="22" rx="3" fill="#e57373"/></g></svg>',
 tea:'<svg viewBox="0 0 120 120"><ellipse cx="58" cy="102" rx="38" ry="6" fill="#000" opacity=".14"/><path d="M48 30c-6-8 6-12 0-20M62 30c-6-8 6-12 0-20M76 30c-6-8 6-12 0-20" stroke="#c9d6dd" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M28 40h62v34a22 22 0 01-22 22H50a22 22 0 01-22-22z" fill="#e8eef1"/><path d="M28 40h62v34a22 22 0 01-22 22H50a22 22 0 01-22-22z" fill="none" stroke="#9fb2bd" stroke-width="2"/><path d="M90 50h6a10 10 0 010 20h-6" stroke="#9fb2bd" stroke-width="6" fill="none"/><ellipse cx="59" cy="42" rx="29" ry="5" fill="#9c5a1f"/><path d="M36 56c0 12 4 20 12 26" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".9"/><path d="M48 66h22" stroke="#d64545" stroke-width="5" stroke-linecap="round"/><circle cx="52" cy="66" r="2" fill="#fff"/><circle cx="62" cy="66" r="2" fill="#fff"/></svg>'
};
function COIN(cls){return '<svg class="coin '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id="cg" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffe9a3"/><stop offset=".55" stop-color="#f4bf3a"/><stop offset="1" stop-color="#c98a12"/></radialGradient></defs><circle cx="12" cy="12" r="10.5" fill="url(#cg)"/><circle cx="12" cy="12" r="8" fill="none" stroke="#b07a0c" stroke-width="1" opacity=".55"/><path d="M7 12.4c2-2.6 5.6-2.8 8-.3l2.2-1.6v3.8l-2.2-1.6c-2.4 2.5-6 2.3-8-.3z" fill="#a8710a" opacity=".8"/><path d="M5.5 8.5a7.5 7.5 0 015-4" stroke="#fff6d6" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".9"/></svg>';}

function AV(k){
  if(k==='petr')return '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#7aa6b8"/><path d="M10 64c2-14 10-20 22-20s20 6 22 20z" fill="#3e4a57"/><circle cx="32" cy="30" r="13" fill="#d9a77c"/><path d="M17 26c2-10 28-12 30 0l4 2H13z" fill="#4a3d33"/><path d="M13 28h38" stroke="#3a2f27" stroke-width="2.5"/><circle cx="27" cy="31" r="1.6" fill="#2a211b"/><circle cx="37" cy="31" r="1.6" fill="#2a211b"/><path d="M25 38c4 3 10 3 14 0" stroke="#8a5a3a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M24 36c5 2 11 2 16 0" stroke="#9a9a9a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
  if(k==='mit')return '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#c9a96e"/><path d="M10 64c2-14 10-20 22-20s20 6 22 20z" fill="#6b5a3a"/><circle cx="32" cy="30" r="13" fill="#e2b48c"/><path d="M19 34c0 12 26 12 26 0-4 6-22 6-26 0z" fill="#eeeeee"/><path d="M19 24c3-9 23-9 26 0-6-3-20-3-26 0z" fill="#dcdcdc"/><circle cx="27" cy="29" r="1.6" fill="#2a211b"/><circle cx="37" cy="29" r="1.6" fill="#2a211b"/><path d="M23 25h6M35 25h6" stroke="#bdbdbd" stroke-width="2" stroke-linecap="round"/></svg>';
  return '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1f5f7a"/><path d="M14 34c7-10 22-12 31-3l7-5v16l-7-5c-9 9-24 7-31-3z" fill="#f4bf3a"/><circle cx="21" cy="33" r="2" fill="#1f5f7a"/></svg>';}
/* ---- значки, которых не было в макете ---- */
IG.camera='<rect class="d" x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7l1.6-2.5h3.8L15.5 7"/><circle cx="12" cy="13.5" r="3.6"/>';
IG.search='<circle class="d" cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>';
IG.warn='<path class="d" d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.3"/>';
IG.sound='<path class="d" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>';
IG.quest='<circle class="d" cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5M12 16.8v.3"/>';
IG.frame='<rect class="d" x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 16l5-5 4 4 2.5-2.5 5 5"/><circle cx="15.5" cy="9" r="1.5"/>';
IG.fore='<circle class="d" cx="12" cy="11" r="7"/><path d="M7 19.5h10M8.5 21h7M9 8.5a3.5 3.5 0 013-2"/>';
IG.rain='<path class="d" d="M7 15.5a4.5 4.5 0 01-.6-9A6 6 0 0117.8 5.3 4.6 4.6 0 0117.5 15.5z"/><path d="M8 18.5l-1 2M12 18.5l-1 2M16 18.5l-1 2"/>';
IG.palette='<path class="d" d="M12 3.5a8.5 8.5 0 100 17c1.3 0 1.8-.9 1.4-1.9-.5-1.2.2-2.3 1.5-2.3h2.1a3.5 3.5 0 003.5-3.5c0-5.2-3.8-9.3-8.5-9.3z"/><circle cx="8" cy="11" r="1.2"/><circle cx="10.5" cy="7.5" r="1.2"/><circle cx="15" cy="7.8" r="1.2"/>';
IG.users='<circle class="d" cx="9" cy="8.5" r="3.5"/><path d="M2.5 19.5a6.5 6.5 0 0113 0M16 5.5a3.2 3.2 0 010 6.2M18 13.5a6 6 0 013.5 6"/>';
IG.fwd='<path d="M9 5l7 7-7 7"/>';
/* ---- рисунки товаров, которых не было в макете: «На Волгу», поплавки «Русские промыслы», оформление ---- */
ART.volga='<svg viewBox="0 0 120 120"><ellipse cx="60" cy="104" rx="40" ry="6" fill="#000" opacity=".14"/><g transform="rotate(-8 60 60)"><rect x="18" y="30" width="84" height="56" rx="8" fill="#f4ead2"/><path d="M78 30v56" stroke="#c9b48a" stroke-width="2" stroke-dasharray="4 4"/><rect x="18" y="30" width="84" height="14" rx="7" fill="#2f7d9a"/><path d="M26 70c6-6 12-6 18 0s12 6 18 0" stroke="#2f7d9a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 60h40" stroke="#8a7a5a" stroke-width="3" stroke-linecap="round"/><circle cx="90" cy="62" r="7" fill="#e03131"/></g></svg>';
ART.floats='<svg viewBox="0 0 120 120"><ellipse cx="60" cy="104" rx="40" ry="6" fill="#000" opacity=".14"/><g><path d="M34 14v14" stroke="#333" stroke-width="2"/><path d="M34 28c7 0 9 12 9 22s-5 24-9 32c-4-8-9-22-9-32s2-22 9-22z" fill="#d42a1f"/><path d="M27 48h14M28 58h12" stroke="#f2b632" stroke-width="3"/><circle cx="34" cy="40" r="2.5" fill="#1d1d1d"/></g><g><path d="M60 10v14" stroke="#333" stroke-width="2"/><path d="M60 24c7 0 9 12 9 22s-5 24-9 32c-4-8-9-22-9-32s2-22 9-22z" fill="#f6f8fb"/><path d="M53 40c4 3 10 3 14 0M54 52c3 3 9 3 12 0M55 63c3 2 7 2 10 0" stroke="#1f4fa8" stroke-width="2.6" fill="none"/></g><g><path d="M86 14v14" stroke="#333" stroke-width="2"/><path d="M86 28c7 0 9 12 9 22s-5 24-9 32c-4-8-9-22-9-32s2-22 9-22z" fill="#1d1d1d"/><path d="M80 44l6 4 6-4M80 56l6 4 6-4" stroke="#e8b33a" stroke-width="2.6" fill="none"/></g></svg>';
ART.theme='<svg viewBox="0 0 120 120"><ellipse cx="60" cy="104" rx="40" ry="6" fill="#000" opacity=".14"/><rect x="22" y="22" width="76" height="76" rx="18" fill="#fffaf1"/><rect x="22" y="22" width="76" height="30" rx="15" fill="#ff9365"/><rect x="32" y="60" width="56" height="10" rx="5" fill="#1f8a7e"/><rect x="32" y="76" width="36" height="10" rx="5" fill="#f2b134"/><circle cx="84" cy="81" r="6" fill="#4f9d55"/></svg>';
ART.sea=ART.book;
var PAY_ART={no_ads:'noads',coins_s:'wallet',coins_l:'chest',starter:'starter',bait_box:'box',club30:'club',volga_kit:'volga',tea:'tea',floats_rus:'floats',th_warm:'theme'};
/* одинаковые id градиентов в нескольких копиях рисунка ломают заливку в скрытых окнах — даём каждой копии свои id */
var UID=0;
function uniq(svg){if(svg.indexOf(' id="')<0)return svg;var n='_'+(++UID);return svg.replace(/ id="([^"]+)"/g,' id="$1'+n+'"').replace(/url\(#([^)]+)\)/g,'url(#$1'+n+')');}
function I(k,cls){return '<svg class="ic '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(IG[k]||'')+'</svg>';}
var ART_EN={'ОПАРЫШ':'MAGGOT','КЛУБ':'CLUB'};/*BL1: надписи на рисунках — по языку игры*/
function art(k){var s=ART[k]?uniq(ART[k]):'';if(s&&typeof LANG!=='undefined'&&LANG==='en')for(var r in ART_EN)s=s.split('>'+r+'<').join('>'+ART_EN[r]+'<');return s;}
function coin(cls){return uniq(COIN(cls));}

/* ---------- эмодзи → значок. Свой ключ — линия (цвет по смыслу в CSS: lk-i.i-<ключ>); монета — цветная; наживка в списках — рисунок ---------- */
var MAP={'🏆':'trophy','🐟':'fish','🐠':'fish','🎣':'rod','📅':'cal','🗓':'cal','🎁':'gift','✨':'spark','🎫':'card','📺':'ad','📷':'camera','⚙':'set','⭐':'star',
 '✉':'mail','📮':'mail','📖':'book','📚':'book','☕':'cup','🔔':'bell','🏅':'medal','🎖':'medal','📦':'box','🧰':'box','🍂':'leaf','🌿':'leaf','🔮':'fore','📋':'list','🖼':'frame',
 '🔍':'search','👥':'users','🛒':'bag','🎒':'bag','📍':'pin','📌':'pin','⚠':'warn','🏡':'home','🏠':'home','🕑':'clock','⏳':'clock','📊':'bars','🎯':'goal','🔒':'lock',
 '📞':'phone','📲':'phone','🗺':'map','☀':'sun','⛅':'cloud','🌁':'cloud','🌧':'rain','🌬':'wind','🚫':'noads','🔊':'sound','❓':'quest','❔':'quest','🧵':'line','🎨':'palette',
 '←':'back','💰':'coin'};
var ARTM={'🐛':'worm','⚪':'maggot','🍞':'dough','🔴':'blood','🌽':'corn','🥄':'spoon','🐟':'live'};
var AVM={'👴':'mit','🧢':'petr'};
var ARTCTX='#baitBtn,.bait,.lkbt',AVCTX='.a3g .ai,.a3let';
var keys=Object.keys(MAP).concat(Object.keys(ARTM),Object.keys(AVM)).filter(function(k,i,a){return a.indexOf(k)===i;}).sort(function(a,b){return b.length-a.length;});
var RE=new RegExp('('+keys.map(function(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+')\uFE0F?','g');
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,'LK-I':1,'LK-T':1,svg:1,SVG:1,OPTION:1,TITLE:1,CANVAS:1};
function inSvg(n){for(var p=n.parentNode;p&&p.nodeType===1;p=p.parentNode){if(p.namespaceURI==='http://www.w3.org/2000/svg'||SKIP[p.nodeName])return true;if(p.classList&&p.classList.contains('lk-raw'))return true;}return false;}
function closest(el,sel){for(var p=el;p&&p.nodeType===1;p=p.parentNode){if(p.matches&&p.matches(sel))return p;}return null;}
function swapText(t){if(!t.parentNode)return;var s=t.nodeValue;if(!s||!RE.test(s)){RE.lastIndex=0;return;}RE.lastIndex=0;if(inSvg(t))return;
  var par=t.parentNode,inArt=!!closest(par,ARTCTX),inAv=!!closest(par,AVCTX);
  var fr=document.createDocumentFragment(),last=0,mm;
  while((mm=RE.exec(s))){var e=mm[1],h='',cls='';
    if(inAv&&AVM[e]){h=AV(AVM[e]);cls='i-av';}
    else if(inArt&&ARTM[e]){h=art(ARTM[e]);cls='i-art';}
    else if(MAP[e]==='coin'){h=coin();cls='i-coin';}
    else if(MAP[e]){h=I(MAP[e]);cls='i-'+MAP[e];}
    if(!h)continue;
    var pre=s.slice(last,mm.index),el=document.createElement('lk-i');el.className=cls;el.innerHTML=h+'<lk-t>'+mm[0]+'</lk-t>';last=mm.index+mm[0].length;
    if(cls==='i-coin'){/*BL1: монета не отрывается от числа, знак после неё — от монеты («(+30 💰)», «40 💰.»): число + монета + знак в одной неразрывной обёртке <lk-nw>; пробел перед знаком убираем*/
      var a=/([^\s\u00A0]{1,14})[ \u00A0]?$/.exec(pre),z=/^[ \u00A0]?([)\].,!?:;»…]+)/.exec(s.slice(last)),nw=document.createElement('lk-nw');
      if(a&&/\d/.test(a[1])){nw.appendChild(document.createTextNode(a[1]+'\u00A0'));pre=pre.slice(0,a.index);}
      nw.appendChild(el);if(z){nw.appendChild(document.createTextNode(z[1]));last+=z[0].length;RE.lastIndex=last;}
      if(pre)fr.appendChild(document.createTextNode(pre));fr.appendChild(nw);continue;}
    if(pre)fr.appendChild(document.createTextNode(pre));
    fr.appendChild(el);}
  if(!last)return;
  if(last<s.length)fr.appendChild(document.createTextNode(s.slice(last)));
  par.replaceChild(fr,t);}
function walk(root){if(!root)return;if(root.nodeType===3){swapText(root);return;}if(root.nodeType!==1||SKIP[root.nodeName]||root.namespaceURI==='http://www.w3.org/2000/svg')return;
  var w=document.createTreeWalker(root,4,null,false),L=[],x;while((x=w.nextNode()))L.push(x);for(var i=0;i<L.length;i++)swapText(L[i]);}
var busy=false;
function onMut(list){if(busy)return;busy=true;try{for(var i=0;i<list.length;i++){var r=list[i];
    if(r.type==='characterData')swapText(r.target);else for(var j=0;j<r.addedNodes.length;j++)walk(r.addedNodes[j]);}}finally{busy=false;}}

/* ---------- холст: цвета шкалы и рамка лупы — из CSS-переменных темы (--cv-*) ---------- */
var CV0={pn:'rgba(16,26,36,.52)',pnb:'rgba(255,255,255,.22)',tx:'#ffffff',tx2:'rgba(255,255,255,.8)',track:'rgba(255,255,255,.16)',ok:'#6be3b0',warn:'#ffd36b',bad:'#ff7b6b',
  mark:'#ffffff',glow:'rgba(255,255,255,.85)',ring:'glass',ringc:'#ffffff',ringc2:'rgba(255,255,255,.28)',lbl:'0',font:'LkGolos'};
var CV={};for(var k0 in CV0)CV[k0]=CV0[k0];
function refresh(){try{var cs=getComputedStyle(document.body);for(var k in CV0){var v=cs.getPropertyValue('--cv-'+k).trim();CV[k]=v?v.replace(/^"|"$/g,''):CV0[k];}}catch(e){}}
function rr(g,x,y,w,h,r){r=Math.min(r,h/2,w/2);g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();}
// рамка лупы: glass — тонкое «стекло объектива» с бликом (А), brass — латунь с винтами (Б), finder — белое кольцо с рисками (В)
function ring(g,cx,cy,r){var k=CV.ring;g.save();
  if(k==='brass'){var rg=g.createLinearGradient(cx-r,cy-r,cx+r,cy+r);rg.addColorStop(0,'#f3d58a');rg.addColorStop(.5,'#b9862d');rg.addColorStop(1,'#7a5418');
    g.strokeStyle=rg;g.lineWidth=Math.max(6,r*.13);g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();
    g.strokeStyle='rgba(60,40,10,.6)';g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,r-Math.max(3,r*.065)-1,0,7);g.stroke();
    g.fillStyle='#6b4a14';for(var i=0;i<4;i++){var a=Math.PI/4+i*Math.PI/2;g.beginPath();g.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,Math.max(2,r*.035),0,7);g.fill();}}
  else if(k==='finder'){g.strokeStyle=CV.ringc2;g.lineWidth=Math.max(5,r*.09);g.beginPath();g.arc(cx,cy,r+r*.03,0,7);g.stroke();
    g.strokeStyle=CV.ringc;g.lineWidth=Math.max(2.5,r*.035);g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();
    g.lineWidth=Math.max(1.5,r*.02);for(var j=0;j<24;j++){var b=j*Math.PI/12,l=j%6===0?r*.12:r*.06;g.beginPath();g.moveTo(cx+Math.cos(b)*r,cy+Math.sin(b)*r);g.lineTo(cx+Math.cos(b)*(r-l),cy+Math.sin(b)*(r-l));g.stroke();}}
  else{g.strokeStyle=CV.ringc2;g.lineWidth=Math.max(5,r*.07);g.beginPath();g.arc(cx,cy,r+r*.04,0,7);g.stroke();
    g.strokeStyle=CV.ringc;g.globalAlpha*=.9;g.lineWidth=Math.max(2.5,r*.032);g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();
    g.lineCap='round';g.lineWidth=Math.max(2.5,r*.045);g.globalAlpha*=.75;g.beginPath();g.arc(cx,cy,r*.84,Math.PI*1.08,Math.PI*1.38);g.stroke();}
  g.restore();}
// шкала натяжения: та же логика зон и подписей, что в drawTension; вид — по теме
function tension(g,o){var x0=o.x0,y0=o.y0,bw=o.bw,bh=o.bh,fs=o.fs,T=o.T,sc=o.sc,lbl=CV.lbl==='1',pad=12,top=y0-fs-12,hh=bh+fs+20+(lbl?fs+6:0);
  g.save();g.fillStyle=CV.pn;rr(g,x0-pad,top,bw+pad*2,hh,16);g.fill();g.strokeStyle=CV.pnb;g.lineWidth=1;g.stroke();
  g.fillStyle=CV.track;rr(g,sc(0),y0,bw,bh,bh/2);g.fill();
  // красная зона — штриховкой
  g.save();rr(g,sc(0),y0,bw,bh,bh/2);g.clip();g.fillStyle=CV.bad;g.globalAlpha=.32;g.fillRect(sc(1),y0,sc(1.3)-sc(1),bh);g.globalAlpha=.55;g.strokeStyle=CV.bad;g.lineWidth=3;g.beginPath();
  for(var x=sc(1)-bh;x<sc(1.3)+bh;x+=8){g.moveTo(x,y0+bh);g.lineTo(x+bh,y0);}g.stroke();g.restore();
  // заполнение до натяжения
  var w=Math.max(bh,sc(T)-sc(0));g.save();rr(g,sc(0),y0,w,bh,bh/2);g.clip();
  if(T>1){g.fillStyle=CV.bad;}else{var gr=g.createLinearGradient(sc(0),0,sc(1),0);gr.addColorStop(0,CV.ok);gr.addColorStop(.7,CV.ok);gr.addColorStop(1,CV.warn);g.fillStyle=gr;}
  g.fillRect(sc(0),y0,w,bh);g.restore();
  // бегунок со свечением
  g.save();g.shadowColor=CV.glow;g.shadowBlur=window.__low?0:12;g.fillStyle=CV.mark;rr(g,sc(T)-3,y0-6,6,bh+12,3);g.fill();g.restore();
  g.font='600 '+fs+'px '+CV.font+',-apple-system,Segoe UI,Roboto,sans-serif';g.textBaseline='alphabetic';g.textAlign='left';g.fillStyle=CV.tx;
  g.fillText(o.t1,x0,y0-7);g.textAlign='right';g.fillStyle=CV.tx2;g.fillText(o.t2,x0+bw,y0-7);
  if(lbl){g.font='500 '+(fs-1)+'px '+CV.font+',-apple-system,Segoe UI,Roboto,sans-serif';g.fillStyle=CV.tx2;g.textAlign='center';var yl=y0+bh+fs+3;
    g.fillText(o.z[0],(sc(0)+sc(.7))/2,yl);g.fillText(o.z[1],(sc(.7)+sc(1))/2,yl);g.fillStyle=CV.bad;g.fillText(o.z[2],(sc(1)+sc(1.3))/2,yl);}
  if(o.brk>0){g.strokeStyle=CV.bad;g.globalAlpha=.5+.5*Math.sin(o.t*30);g.lineWidth=3;rr(g,x0-pad,top,bw+pad*2,hh,16);g.stroke();}
  g.restore();}

/* ---------- фон меню: пейзаж места (та же paintBg игры), один раз на место/время ---------- */
var BGK='';
function bg(pi,tod,wx){try{var app=document.getElementById('app');if(!app||typeof paintBg!=='function')return;var wide=app.clientWidth>app.clientHeight;
  var k=pi+tod+wx+(wide?'w':'p');if(k===BGK)return;BGK=k;
  var W=wide?640:360,H=wide?400:640,c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d'),geo=geoMake(W,H*1.6);geo.hz=H*(wide?.5:.36);
  paintBg(g,W,H*1.9,geo,pi,pal(PLACES[pi].look,tod,wx),true);
  app.style.setProperty('--bgimg','url('+c.toDataURL('image/jpeg',.82)+')');}catch(e){}}

/* ---------- слабый телефон: на рыбалке кадр дольше 24 мс (медиана 2 с) — плотное стекло без размытия ---------- */
var NBK='rybak-lk-nb';
function nbOn(){document.body.classList.add('nb');}
function nbWatch(){var q=location.search;if(/[?&]nb=1/.test(q)){nbOn();return;}try{if(localStorage.getItem(NBK)==='1'){nbOn();return;}}catch(e){}
  var fr=[],last=0,t0=0;function step(t){var fs=document.getElementById('scr-fish');if(!fs||!fs.classList.contains('on')||document.hidden){last=0;t0=0;fr.length=0;setTimeout(function(){requestAnimationFrame(step);},500);return;}
    if(!t0)t0=t;if(last&&t-t0>1000)fr.push(t-last);last=t;
    if(fr.length>=120){fr.sort(function(a,b){return a-b;});var m=fr[60];if(m>24){nbOn();try{localStorage.setItem(NBK,'1');}catch(e){}return;}return;}
    requestAnimationFrame(step);}
  requestAnimationFrame(step);}

function start(){document.body.classList.add('lk');refresh();walk(document.body);try{new MutationObserver(onMut).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}nbWatch();}
if(!/\blk\b/.test(document.documentElement.className))document.documentElement.className+=' lk';
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.LOOK={I:I,art:art,coin:coin,av:AV,ART:ART,IG:IG,PAY_ART:PAY_ART,cv:CV,refresh:refresh,ring:ring,tension:tension,bg:bg,walk:walk,nb:nbOn};
})();
