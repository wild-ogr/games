/* ================= M27: вид A «Мягкий объём» (основной для всех) + свой набор SVG-значков вместо эмодзи =================
   Стиль — css/look-a.css (класс html.lk.lk-a ставит index.html), цвета тем — js/themes.js + css/themes.css (body.th-<тема>).
   - заменяет эмодзи главных сущностей своими SVG (MutationObserver): эмодзи остаётся в DOM скрытым текстом (<lk-t>),
     поэтому textContent, проверки и чтение с экрана не меняются; morphHTML возвращает эмодзи — наблюдатель снова подменяет
     (микрозадача, до отрисовки — без мигания);
   - под линиями графиков (fin.js) дорисовывает мягкую заливку.
   Одна геометрия (24×24): f — силуэт, d — детали (линия), k — акцент (заливка); как рисовать — решает CSS направления.
   window.ICONS = {svg(key), list, look, map}. Старые WebView: без inset, без optional chaining. */
(function(){
'use strict';
var LOOK='a';
/* ---------- геометрия: ключ → [цвет, f, d, k] ---------- */
var G={
 // ресурсы и интерфейс
 cr:['#6a5cff','M6.5 4h11l4.5 5.2L12 21 2 9.2z','M2.3 9.2h19.4M9 4l3 5.2L15 4M7 9.2l5 11.3M17 9.2l-5 11.3'],
 en:['#f2a20c','M13.5 2L4.5 13.5h6.5L10 22l9.5-12H13z',''],
 hand:['#e8875a','M7 12.5V6a1.5 1.5 0 013 0v5V4a1.5 1.5 0 013 0v7V5a1.5 1.5 0 013 0v7V8a1.5 1.5 0 013 0v6.5c0 4.2-3 7.5-7.2 7.5h-1C8.5 22 7 20.5 5.5 18l-2.6-4.3a1.5 1.5 0 012.5-1.7L7 14.2z',''],
 heart:['#e5484d','M12 21s-8.5-5.3-8.5-11.2A4.6 4.6 0 0112 7.2a4.6 4.6 0 018.5 2.6C20.5 15.7 12 21 12 21z',''],
 star:['#f2a20c','M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z',''],
 ad:['#2e5bff','M3.5 7h17A1.5 1.5 0 0122 8.5v10a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 18.5v-10A1.5 1.5 0 013.5 7z','M8 3l4 4 4-4','M10 10.5v6l5-3z'],
 money:['#1f9d57','M9 3h6l-1.8 3.5h-2.4zM12 6.5c5 0 8.5 5.2 8.5 9.2 0 3.3-2.6 5.3-8.5 5.3s-8.5-2-8.5-5.3c0-4 3.5-9.2 8.5-9.2z','M14.2 11.8c-.4-.8-1.2-1.2-2.2-1.2-1.3 0-2.2.7-2.2 1.6 0 2.2 4.5 1.3 4.5 3.6 0 1-1 1.7-2.3 1.7-1 0-1.9-.4-2.3-1.2M12 9.3v1.3M12 17.5v1.3'],
 gift:['#e5484d','M3 8.5h18v4.5H3zM4.5 13h15v8h-15z','M12 8.5V21M12 8.5c-1.2-3.4-5.5-4.3-5.5-1.6 0 1.6 3.3 1.6 5.5 1.6 2.2 0 5.5 0 5.5-1.6 0-2.7-4.3-1.8-5.5 1.6'],
 goal:['#e5484d','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19z','M12 7a5 5 0 110 10 5 5 0 010-10z','M12 10.6a1.4 1.4 0 110 2.8 1.4 1.4 0 010-2.8z'],
 plan:['#4f6d8f','M6 4h12a1 1 0 011 1v15.5a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z','M8.5 10.5h7M8.5 14h7M8.5 17.5h4','M9 2.5h6v3.5H9z'],
 ok:['#12a150','M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z','M7.5 12.3l3 3 6-6.6'],
 box0:['#a8b0bc','M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z',''],
 cab:['#9a7440','M12 2.5L21.5 7v2h-19V7zM3 19h18v2.5H3z','','M5 10.5h2.6v7.5H5zM10.7 10.5h2.6v7.5h-2.6zM16.4 10.5H19v7.5h-2.6z'],
 bank:['#2e5bff','M12 2.5L21.5 7v2h-19V7zM3 19h18v2.5H3z','','M5 10.5h2.6v7.5H5zM10.7 10.5h2.6v7.5h-2.6zM16.4 10.5H19v7.5h-2.6z'],
 friends:['#2e8bd8','M9 3.5a3.7 3.7 0 110 7.4 3.7 3.7 0 010-7.4zM2.5 20.5c0-4.2 2.9-6.8 6.5-6.8s6.5 2.6 6.5 6.8z','','M16.5 5a3.1 3.1 0 110 6.2 3.1 3.1 0 010-6.2zM16.8 13.6c2.9.3 4.9 2.7 4.9 6.9h-4.4c0-2.8-.9-5-2.8-6.3z'],
 deal:['#e8875a','M1.5 9l4.5-3.2 4.3 2h3.4l4.3-2L22.5 9v5.5l-3.3 2.2-5.2 4c-.9.7-2.1.6-2.9-.2L4.3 15H1.5z','M10.3 7.8l-3.1 3c-.8.9.1 2.2 1.1 1.7l3-1.6 4.2 4.2M13 15.7l-1.6 1.6M10.9 13.6l-1.6 1.6'],
 home:['#e0782f','M3 11.2L12 3.5l9 7.7v10H3z','','M10 21.2v-5.5h4v5.5z'],
 sleep:['#6a5cff','M2 19V8.5h2.2V14H21a1 1 0 011 1v4z','M2 19v2.5M22 19v2.5','M6.6 9.6a2.2 2.2 0 110 4.4 2.2 2.2 0 010-4.4zM10 10.3h7.7a3.3 3.3 0 013.3 3.3v.4H10z'],
 doc:['#7d8a97','M6 2.5h8.5L19 7v13.5a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z','M14.5 2.5V7H19M8.5 12h7M8.5 15.5h7M8.5 19h4'],
 party:['#e5484d','M3 21l5.3-13.5 8.2 8.2z','M14 4.5l.8 2M19.5 6l-2 1.4M20.5 11.3h-2.1M11 3c1 2 .2 3.5.2 3.5M16.5 9.6c1.5-1.4 3.6-.9 3.6-.9','M6.7 11.6l5.7 5.7-2.6 1z'],
 grad:['#2b3445','M12 3.5l10.5 5.2L12 14 1.5 8.7z','M21.2 9.3v5.4','M6.3 11.4v4.8c0 1.6 2.6 3.2 5.7 3.2s5.7-1.6 5.7-3.2v-4.8L12 14.2z'],
 dice:['#e5484d','M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z','','M8.1 6.6a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM15.9 14.4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z'],
 factory:['#6b7a8f','M2 21.5V11l6 3.5V11l6 3.5V5h4.2l1.6 16.5z','','M5.5 17h2.5v2H5.5zM10.5 17H13v2h-2.5z'],
 hammer:['#9a7440','M3.5 6.5L8 2.8l5.2 3.9-2.6 2.8-3.4-1.8-1.6 1.4z','','M10 10.2l2.4-2.4 8.9 9.6a1.7 1.7 0 01-2.4 2.4z'],
 cup:['#f2a20c','M7 3h10v5.5a5 5 0 01-10 0z','M7 5H4v1.6A3.6 3.6 0 007.6 10.2M17 5h3v1.6a3.6 3.6 0 01-3.6 3.6','M10.6 13.4h2.8v3.8h-2.8zM7.5 17.2h9V21h-9z'],
 call:['#12a150','M5.2 3h3.5l2.1 5.1-2.6 1.6a11.5 11.5 0 006.1 6.1l1.6-2.6L21 15.3v3.5A2.2 2.2 0 0118.8 21C10.6 21 3 13.4 3 5.2A2.2 2.2 0 015.2 3z',''],
 phone:['#2b3445','M7.2 2h9.6A1.7 1.7 0 0118.5 3.7v16.6a1.7 1.7 0 01-1.7 1.7H7.2a1.7 1.7 0 01-1.7-1.7V3.7A1.7 1.7 0 017.2 2z','M10.5 18.6h3'],
 lock:['#7d8a97','M5 11h14v10.5H5z','M8 11V8a4 4 0 018 0v3M12 14.8v3'],
 mega:['#e0782f','M3 9.5h4.2L17.5 4.5v15L7.2 14.5H3z','M20.3 9.5v5','M7.2 14.5l1.6 6h2.6l-1.1-6z'],
 bell:['#f2a20c','M12 3a6.2 6.2 0 016.2 6.2v4l2.1 3.6H3.7l2.1-3.6v-4A6.2 6.2 0 0112 3z','M9.8 19.6a2.2 2.2 0 004.4 0'],
 chart:['#2e5bff','M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z','M7.5 17v-4.5M12 17V8M16.5 17v-6.5'],
 up:['#12a150','M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z','M6.5 16l4-4.2 3 3 4.5-5.3M14.5 9.5h3.5V13'],
 box:['#b9793f','M12 2.5l9 4.6v9.8l-9 4.6-9-4.6V7.1z','M3 7.1l9 4.6 9-4.6M12 11.7v9.7M7.5 4.8l9 4.6'],
 wrench:['#6b7a8f','M15 2.5a5.5 5.5 0 00-5.3 7L2.8 16.3a2.1 2.1 0 003 3l6.8-6.9A5.5 5.5 0 0019.5 7.5l-3.3 3.2-2.9-.6-.6-2.9L16 4a5.4 5.4 0 00-1-1.5z',''],
 tire:['#3d424a','M12 2a10 10 0 110 20 10 10 0 010-20z','M12 2.8v4.7M12 16.5v4.7M2.8 12h4.7M16.5 12h4.7','M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z'],
 meet:['#f2a20c','M4 3h6.2l-.5 5.4a2.6 2.6 0 01-5.2 0zM13.8 3H20l-.5 5.4a2.6 2.6 0 01-5.2 0z','M7.1 11v9.3M16.9 11v9.3M4.6 20.8h5M14.4 20.8h5'],
 mail:['#2e5bff','M3.5 5h17A1.5 1.5 0 0122 6.5v11a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 17.5v-11A1.5 1.5 0 013.5 5z','M2.6 6.2L12 13l9.4-6.8'],
 fire:['#e0582f','M12 2c1 4.2 6.3 6.1 6.3 12.2a6.3 6.3 0 01-12.6 0c0-3 1.5-4.6 3.1-6.1 0 2 1 3.1 2 3.1 0-3-.5-6.1 1.2-9.2z','','M12 13.5c.7 1.5 2.6 2.3 2.6 4.6a2.6 2.6 0 01-5.2 0c0-1.5.9-2.3 1.7-3 0 .8.4 1.2.9 1.2 0-1.1-.3-2 0-2.8z'],
 news:['#4f6d8f','M3 4.5h14.5V19a2.5 2.5 0 002.5 2.5H5A2 2 0 013 19.5zM17.5 9H21v10a2.5 2.5 0 01-2.5 2.5','M6 8.5h8.5M6 12h8.5M6 15.5h5.5'],
 warn:['#f2a20c','M12 3l10 18H2z','M12 10v5M12 18.2v.1'],
 office:['#4f6d8f','M5 2.5h14v19H5z','M8.5 6.5h2M13.5 6.5h2M8.5 10.5h2M13.5 10.5h2M8.5 14.5h2M13.5 14.5h2','M10.5 21.5v-3.5h3v3.5z'],
 cal:['#e5484d','M4 5h16v16H4z','M8 3v4M16 3v4M7.5 13.5h2M14.5 13.5h2M7.5 17h2','M4 5h16v4.5H4z'],
 search:['#4f6d8f','M10.5 3a7.5 7.5 0 110 15 7.5 7.5 0 010-15z','M16 16l5 5'],
 pic:['#2e8bd8','M3 4h18v16H3z','M3 16l5-5 4 4 3-3 6 6','M15.8 6.8a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4z'],
 medal:['#f2a20c','M12 9a6.2 6.2 0 110 12.4A6.2 6.2 0 0112 9z','M8 2.5l3 6.3M16 2.5l-3 6.3','M12 12.3l1 2.2 2.3.2-1.8 1.5.6 2.3-2.1-1.2-2.1 1.2.6-2.3-1.8-1.5 2.3-.2z'],
 bag:['#e5484d','M5 8h14l-1 13.5H6z','M9 8V6.5a3 3 0 016 0V8'],
 pause:['#7d8a97','M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z','M10 8.5v7M14 8.5v7'],
 // виды точек
 cupc:['#8a5a3a','M4 8.5h13v5.5a5 5 0 01-5 5H9a5 5 0 01-5-5z','M17 10.5h1.4a2.5 2.5 0 010 5H16.5M7.5 2.8c-.8 1 .8 1.9 0 3M11.5 2.8c-.8 1 .8 1.9 0 3M3 21.3h16'],
 kiosk:['#e0782f','M3 10.5h18V21H3z','M8.5 21v-6h4v6','M3.5 4h17l1.5 6.5H2zM14.5 14h4v3h-4z'],
 shaw:['#d0893a','M7 21.5L5 9.5C5 5.6 8 3 12 3s7 2.6 7 6.5l-2 12z','M8 8.6c1.3.8 2.7.8 4 0s2.7-.8 4 0M8.4 11.8h7.2','M5.9 15h12.2l-1.1 6.5H7z'],
 flow:['#e85a8a','M7.2 12.5h9.6l-2.8 9h-4z','M12 8.5v4.5M8.2 10.4l3 2.6M15.8 10.4l-3 2.6','M12 3.2a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM7 5.8a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM17 5.8a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2z'],
 togo:['#8a5a3a','M6.3 7.5h11.4l-1.5 14h-8.4z','M12 4.5l1-3M7 12.5h10','M5 4.5h14v3H5z'],
 wash:['#2e8bd8','M4 9.5a8 8 0 0116 0z','M12 1.5v2M7 13v2M12 13v3M17 13v2M9.5 18.5v2M14.5 18.5v2'],
 gazel:['#2e8bd8','M2 5.5h12v11.5H2zM14 8.5h4.6l3.4 4.2V17h-8z','M16 9.8v3h4','M6.5 15.2a2.3 2.3 0 110 4.6 2.3 2.3 0 010-4.6zM17.5 15.2a2.3 2.3 0 110 4.6 2.3 2.3 0 010-4.6z'],
 barber:['#e5484d','M8 4.5h8v15H8z','M8 7.5l8 4M8 12l8 4M8 16.5l8 3','M6.5 2.5h11v2.2h-11zM6.5 19.3h11v2.2h-11z'],
 bakery:['#d89a3a','M2.5 15.5c1-5.2 5-8.5 9.5-8.5s8.5 3.3 9.5 8.5c-2 1-4 1-5.5 0-.5 2-2 3-4 3s-3.5-1-4-3c-1.5 1-3.5 1-5.5 0z','M9 7.6l1.5 9.4M15 7.6l-1.5 9.4'],
 pot:['#e0782f','M3 11h18v2a7 7 0 01-7 7h-4a7 7 0 01-7-7z','M8 3.8c-.8 1.2.8 2.3 0 3.5M12 2.8c-.8 1.2.8 2.3 0 3.5M16 3.8c-.8 1.2.8 2.3 0 3.5M1.5 11h21'],
 broom:['#b9793f','M8 13h8l2.2 8.5H5.8z','M12 2v11M9.2 16.5l-.6 5M12 16.5v5M14.8 16.5l.6 5'],
 pharm:['#12a150','M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',''],
 pad:['#6a5cff','M7 7h10a5 5 0 015 5v2.6a3.5 3.5 0 01-6.2 2.2L14 15h-4l-1.8 1.8A3.5 3.5 0 012 14.6V12a5 5 0 015-5z','M7 9.8v4.4M4.8 12h4.4M16 10.5v.1M18.5 13v.1'],
 shirt:['#2e8bd8','M8 3l4 3 4-3 5.5 3.2-2.2 5.3H17v10H7v-10H4.7L2.5 6.2z','M12 6l-1.5 3L12 17l1.5-8z'],
 hotdog:['#e0782f','M3 13a4.3 4.3 0 014.3-4.3h9.4a4.3 4.3 0 010 8.6H7.3A4.3 4.3 0 013 13z','M5.5 13c1.5-1 3 1 4.5 0s3-1 4.5 0 3 1 4 0','M1.8 11.8h20.4v2.4H1.8z'],
 whs:['#6b7a8f','M2 9.2l10-5.2 10 5.2V21H2z','M6 21v-8h12v8M6 16.5h12'],
 crane:['#f2a20c','M5 3h2.4v18H5zM2.5 20h7.4v1.6H2.5zM7.4 4h14v2.6h-14z','M18.5 6.6v5M7.4 6.6l3-3.4','M17 11.6h3v2.8h-3z'],
 truck:['#f2a20c','M2 6.5h11.5l1 9H2zM14.5 9.5h3.8l3.7 3.7V17h-7.5z','M5 6.5l2 9','M6.3 15.2a2.3 2.3 0 110 4.6 2.3 2.3 0 010-4.6zM17.5 15.2a2.3 2.3 0 110 4.6 2.3 2.3 0 010-4.6z'],
 pick:['#9a7440','M2.5 8.5C6 3.8 18 3.8 21.5 8.5 17 7 7 7 2.5 8.5z','','M11.1 6.3h1.8l-.6 15.2h-1.8z'],
 mount:['#8a7a6a','M2 20.5L9 7l4 6.2 2-3.2 7 10.5z','M7.4 10.2l1.6 2 1.6-2'],
 // главы
 ch_gig:['#4f6d8f','M6 4h12a1 1 0 011 1v15.5a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z','M8.5 10.5h7M8.5 14h7M8.5 17.5h4','M9 2.5h6v3.5H9z'],
 ch_net:['#2e8bd8','M12 2.8a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM5 15.8a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM19 15.8a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2z','M10.9 7.8L6.2 16M13.1 7.8l4.7 8.2M7.6 18.4h8.8'],
 ch_nedra:['#3d424a','M3 21.5V12l4-3 4 3v9.5zM13 21.5V8.5h8v13z','M15.5 12h3M15.5 15h3M15.5 18h3','M5.5 2.5h3v6h-3z'],
 car:['#e5484d','M4 12l2-5.5h12l2 5.5v6H4z','M4 12h16','M6.8 16a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zM17.2 16a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2z'],
 bike:['#2e8bd8','','M5.5 13.5a4 4 0 110 8 4 4 0 010-8zM18.5 13.5a4 4 0 110 8 4 4 0 010-8zM5.5 17.5L9 9.5h6l3.5 8M9 9.5l3.5 8 2.5-8M8 7h3M15 9.5l-1-3h2.5'],
 books:['#6a5cff','M4 4h5v16.5H4zM9 4h5v16.5H9z','M5.5 8h2M10.5 8h2','M14.5 5.2l4.5-1.2 3.6 15.6-4.6 1.2z'],
 camera:['#4f6d8f','M3.5 7.5h4l1.8-2.5h5.4l1.8 2.5h4A1.5 1.5 0 0122 9v10a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 19V9a1.5 1.5 0 011.5-1.5z','','M12 10a3.7 3.7 0 110 7.4 3.7 3.7 0 010-7.4z'],
 laptop:['#4f6d8f','M5 4.5h14a1 1 0 011 1V16H4V5.5a1 1 0 011-1z','M1.5 19.5h21','M2.5 16h19l1 3.5h-21z'],
 // M27: настройки, лица друзей, вещи, прочее
 gear:['#6b7a8f','M12 4.4L13.95 2.19L15.83 2.76L16.22 5.68L17.37 6.63L20.31 6.44L21.24 8.17L19.45 10.52L19.6 12L21.81 13.95L21.24 15.83L18.32 16.22L17.37 17.37L17.56 20.31L15.83 21.24L13.48 19.45L12 19.6L10.05 21.81L8.17 21.24L7.78 18.32L6.63 17.37L3.69 17.56L2.76 15.83L4.55 13.48L4.4 12L2.19 10.05L2.76 8.17L5.68 7.78L6.63 6.63L6.44 3.69L8.17 2.76L10.52 4.55z','M12 9a3 3 0 110 6 3 3 0 010-6z'],
 sound:['#2e5bff','M3 9h4l5-4.5v15L7 15H3z','M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13'],
 music:['#7c4dff','M6 14.5a3 3 0 100 6 3 3 0 000-6zM17 12.5a3 3 0 100 6 3 3 0 000-6zM8.2 4.6L20.8 1.8v3.3L8.2 7.9z','M9 17.5V6M20 15.5V3.5'],   // M47e: 🎵 Музыка (js/music.js)
 vib:['#12a150','M8 3h8a1.5 1.5 0 011.5 1.5v15A1.5 1.5 0 0116 21H8a1.5 1.5 0 01-1.5-1.5v-15A1.5 1.5 0 018 3z','M3 8.5v7M21 8.5v7M10.5 17.5h3'],
 leaf:['#2f9e44','M20.5 3.5C10.5 3.5 4 8.5 4 15.5c0 1.6.3 3 .9 4.2C6.4 13 11 10 16 8.8c-4.2 2.6-8 6.2-10 11.7 1.1.3 2.3.5 3.5.5 7 0 11-6.5 11-17.5z',''],
 font:['#4f6d8f','M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z','M6.5 16.5l3-9 3 9M7.5 13.6h4M14.6 11.6c.4-.8 1.2-1.2 2.1-1.2 1.3 0 2.1.8 2.1 2.1v4M18.8 14c-2.6 0-4.3.6-4.3 1.6 0 .6.5 1 1.4 1 1.5 0 2.9-1 2.9-2.6'],
 globe:['#2e8bd8','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19z','M2.5 12h19M12 2.5c3.2 3 3.2 16 0 19M12 2.5c-3.2 3-3.2 16 0 19M4.5 7h15M4.5 17h15'],
 palette:['#e0782f','M12 2.5C6.5 2.5 2.5 6.6 2.5 11.8c0 5 4 9.7 9 9.7 1.6 0 2.4-.9 2.4-2 0-1.4-1.3-1.8-1.3-3 0-1.1.9-1.8 2-1.8h2.6c2.8 0 4.3-2 4.3-4.6C21.5 5.8 17.4 2.5 12 2.5z','','M7.4 9.4a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zM9.8 5.2a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zM14.6 5a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zM17.8 8.6a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2z'],
 quest:['#6a5cff','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19z','M9.3 9.3a2.8 2.8 0 015.4 1c0 1.9-2.7 2.4-2.7 4.2M12 17.6v.2'],
 info:['#2e5bff','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19z','M12 11v6M12 7.4v.2'],
 save:['#4f6d8f','M5 3h11.5L21 7.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z','M7.5 21v-6h9v6','M7 3h8v5H7z'],
 refresh:['#12a150','M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z','M17 9A6 6 0 006.6 9.8M7 15a6 6 0 0010.4.8M6.5 6v3.8h3.8M17.5 18v-3.8h-3.8'],
 person:['#4f6d8f','M12 3a4.2 4.2 0 110 8.4A4.2 4.2 0 0112 3zM3.5 21c0-4.8 3.8-8 8.5-8s8.5 3.2 8.5 8z',''],
 // M30: пролог «Мужчина/Женщина» — два разных значка (раньше оба были 'person'): мужчина — короткая стрижка и галстук, женщина — длинные волосы и платье
 man:['#2e6bd8','M12 3a4.2 4.2 0 110 8.4A4.2 4.2 0 0112 3zM3.5 21c0-4.8 3.8-8 8.5-8s8.5 3.2 8.5 8z','','M7.8 7.2C8 4.5 9.8 2.8 12 2.8s4 1.7 4.2 4.4c-1.2-.8-2.5-1.2-4.2-1.2s-3 .4-4.2 1.2zM10.9 13.1h2.2l.5 1.5-1.6 4.6-1.6-4.6z'],
 woman:['#d6457a','M12 3.6a4 4 0 110 8 4 4 0 010-8zM4 21c.6-4.7 3.9-7.6 8-7.6s7.4 2.9 8 7.6z','','M12 2.6c3 0 5 2.2 5 5.4v5.6c-1.2.6-2.4.8-3.4.6 1.2-1 1.8-2.6 1.8-4.2 0-.4 0-.7-.1-1-2-.2-3.7-1.1-4.8-2.6-.5 1.5-1.6 2.7-3 3.2.1 1.8.8 3.4 2 4.6-1.1.2-2.3 0-3.5-.6V8c0-3.2 2-5.4 5-5.4z'],
 cart:['#e0782f','M6 6.5h15.5l-2.4 8H7.7z','M2.5 3.5h3l2.6 13h10.4','M9.5 18.4a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4zM17 18.4a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4z'],
 fhappy:['#f2a20c','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19z','M7.8 13.8c1 2 2.4 3.1 4.2 3.1s3.2-1.1 4.2-3.1zM8.8 9v1.2M15.2 9v1.2'],
 fsmile:['#f2a20c','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19z','M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8M9 9.2v1.2M15 9.2v1.2'],
 fwink:['#f2a20c','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19z','M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8M9 9.2v1.2M13.8 9.8h2.6'],
 fsad:['#f2a20c','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19z','M8.5 16.5c.9-1.2 2.1-1.8 3.5-1.8s2.6.6 3.5 1.8M9 9.2v1.2M15 9.2v1.2'],
 bear:['#9a6a3a','M6.5 3.5a3 3 0 012.9 2.2 8 8 0 015.2 0 3 3 0 115 3.1A8 8 0 0120 13c0 4.5-3.6 8-8 8s-8-3.5-8-8a8 8 0 01.5-2.8 3 3 0 012-6.7z','M9 10.6v.2M15 10.6v.2M11 15.2h2','M12 13a3.5 2.8 0 110 5.6 3.5 2.8 0 010-5.6z'],
 city:['#4f6d8f','M2 21V9h6V3h8v6h6v12z','M11 6.5h2M11 10h2M11 13.5h2M4.5 12.5h1M4.5 16h1M18.5 12.5h1M18.5 16h1M10.5 21v-3.5h3V21'],
 train:['#e5484d','M5 3.5h14a1 1 0 011 1V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4.5a1 1 0 011-1z','M8 21.5l2-3.5M16 21.5l-2-3.5M8 14.5h.1M16 14.5h.1','M6.5 6h11v5h-11z'],
 share:['#2e5bff','M3 13h5l1.5 2.5h5L16 13h5v6a2 2 0 01-2 2H5a2 2 0 01-2-2z','M12 3v9M8.2 6.5L12 2.8l3.8 3.7'],
 cake:['#e5484d','M4.5 11.5h15a1 1 0 011 1V21h-17v-8.5a1 1 0 011-1z','M12 11V7.5M12 3.6c.8.9.8 1.8 0 2.4-.8-.6-.8-1.5 0-2.4','M3.5 12.5h17v2.3c-1.4 1.3-3 1.3-4.3 0-1.4 1.3-3 1.3-4.2 0-1.4 1.3-3 1.3-4.3 0-1.3 1.3-2.9 1.3-4.2 0z'],
 sunfl:['#f2a20c','M18.6 9.4a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM17.34 13.28a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM14.04 15.68a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM9.96 15.68a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM6.66 13.28a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM5.4 9.4a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM6.66 5.52a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM9.96 3.12a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM14.04 3.12a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2zM17.34 5.52a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2z','','M12 7.6a4.4 4.4 0 110 8.8 4.4 4.4 0 010-8.8z'],
 ball:['#6a5cff','M12 2.5a7.5 7.5 0 110 15 7.5 7.5 0 010-15z','M8.6 7.8a4 4 0 013-2.4','M6.5 18.5h11l1.2 3h-13.4z'],
 watch:['#4f6d8f','M8.5 2.5h7l.7 3.6a7 7 0 010 11.8l-.7 3.6h-7l-.7-3.6a7 7 0 010-11.8z','M12 9v3.2l2.2 1.4'],
 toolbox:['#e5484d','M3 9h18v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5z','M8.5 9V6a1.5 1.5 0 011.5-1.5h4A1.5 1.5 0 0115.5 6v3M3 13.5h18M10.5 12.3h3v2.4h-3z'],
 case:['#9a7440','M3.5 7.5h17a1 1 0 011 1V19a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 19V8.5a1 1 0 011-1z','M9 7.5v-2A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5v2M2.5 13h19'],
 door:['#9a7440','M6 3h12v18H6z','M3.5 21h17M15 12.5h.1'],
 anchor:['#2e5bff','','M12 7v14M8.5 10h7M4 13.5c0 4.2 3.6 7.5 8 7.5s8-3.3 8-7.5M2.5 15.5L4 13.5l2 1.5M21.5 15.5L20 13.5l-2 1.5','M12 2.3a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8z'],
 moon:['#6a5cff','M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z',''],
 tag:['#e0782f','M3 4.5v6.8l9.6 9.6a1.6 1.6 0 002.3 0l6-6a1.6 1.6 0 000-2.3L11.3 3H4.5A1.5 1.5 0 003 4.5z','M7.8 6.4a1.4 1.4 0 110 2.8 1.4 1.4 0 010-2.8z'],
 pen:['#4f6d8f','M15.5 3.5l5 5L9 20H4v-5z','M13 6l5 5'],
 clock:['#2e8bd8','M12 4.5a8.5 8.5 0 110 17 8.5 8.5 0 010-17z','M12 8.8V13l3 2M9.5 2.5h5'],
 chat:['#2e8bd8','M4 4h16a1.5 1.5 0 011.5 1.5v10A1.5 1.5 0 0120 17h-9l-5 4v-4H4a1.5 1.5 0 01-1.5-1.5v-10A1.5 1.5 0 014 4z','M7 9h10M7 12.5h6'],
 bulb:['#f2a20c','M12 2.5a6.5 6.5 0 00-3.8 11.8c.8.6 1.3 1.5 1.3 2.5V17h5v-.2c0-1 .5-1.9 1.3-2.5A6.5 6.5 0 0012 2.5z','M10.5 10.5l1.5 2 1.5-2','M9.5 18.5h5V20a1.5 1.5 0 01-1.5 1.5h-2A1.5 1.5 0 019.5 20z'],
 ticket:['#e5484d','M3 6.5h18V10a2 2 0 000 4v3.5H3V14a2 2 0 000-4z','M15 7.5v1.5M15 11.2v1.6M15 15v1.5'],
 buoy:['#e5484d','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z','M5.3 5.3l3.5 3.5M18.7 5.3l-3.5 3.5M5.3 18.7l3.5-3.5M18.7 18.7l-3.5-3.5'],
 sign:['#9a7440','M3 4h18v10H3z','M8 14v7M16 14v7M6.5 8h11M6.5 11h7'],
 sun:['#f2a20c','M12 7a5 5 0 110 10 5 5 0 010-10z','M19.4 12L22 12M17.23 17.23L19.07 19.07M12 19.4L12 22M6.77 17.23L4.93 19.07M4.6 12L2 12M6.77 6.77L4.93 4.93M12 4.6L12 2M17.23 6.77L19.07 4.93'],
 hat:['#2b3445','M7 4h10v11H7zM2.5 15h19v3h-19z','','M7 11.5h10V15H7z'],
 pin:['#e5484d','M12 2.5a7 7 0 017 7c0 5-7 12-7 12s-7-7-7-12a7 7 0 017-7z','','M12 7a2.5 2.5 0 110 5 2.5 2.5 0 010-5z'],
 card:['#2e5bff','M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z','M5.5 15.5h4','M2 8.5h20v3H2z'],
 paw:['#9a6a3a','M12 12c3 0 5.5 3 5.5 5.5 0 1.8-1.3 3-3 3-1 0-1.6-.6-2.5-.6s-1.5.6-2.5.6c-1.7 0-3-1.2-3-3C6.5 15 9 12 12 12z','','M5.5 8a2 2 0 110 4 2 2 0 010-4zM9.5 4a2 2 0 110 4 2 2 0 010-4zM14.5 4a2 2 0 110 4 2 2 0 010-4zM18.5 8a2 2 0 110 4 2 2 0 010-4z'],
 no:['#e5484d','M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19zM12 4.8a7.2 7.2 0 100 14.4 7.2 7.2 0 000-14.4z','M6.9 6.9l10.2 10.2'],
 bus:['#f2a20c','M5 3h14a1.5 1.5 0 011.5 1.5V18H3.5V4.5A1.5 1.5 0 015 3z','M7 18v2.5M17 18v2.5M7 14.5h.1M17 14.5h.1','M5.5 6h13v5.5h-13z'],
 crown:['#f2a20c','M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5z','M5.5 16h13']
};
/* ---------- эмодзи → значок ---------- */
var MAP={'💎':'cr','⚡':'en','✋':'hand','❤':'heart','⭐':'star','★':'star','📺':'ad','📼':'ad','💰':'money','🎁':'gift','🎯':'goal','📋':'plan','✅':'ok','⬜':'box0',
 '🏛':'cab','🏦':'bank','👥':'friends','🤝':'deal','🏠':'home','🏡':'home','🛌':'sleep','📄':'doc','🧾':'doc','📜':'doc','🎉':'party','🎓':'grad','🎲':'dice','🏭':'factory',
 '🔨':'hammer','🏆':'cup','📞':'call','📱':'phone','📲':'phone','🔒':'lock','📣':'mega','🔔':'bell','📊':'chart','📈':'up','📦':'box','🔧':'wrench','🛠':'wrench',
 '🔩':'tire','🛞':'tire','🥂':'meet','✉':'mail','🔥':'fire','📰':'news','⚠':'warn','🏢':'office','🗓':'cal','🔍':'search','🔎':'search','🖼':'pic','🏅':'medal',
 '🥇':'medal','🥈':'medal','🥉':'medal','🎖':'medal','🛍':'bag','⏸':'pause',
 '☕':'cupc','🏪':'kiosk','🥙':'shaw','💐':'flow','🥤':'togo','🚿':'wash','🚚':'gazel','💈':'barber','🥐':'bakery','🍲':'pot','🧹':'broom','💊':'pharm',
 '🎮':'pad','👔':'shirt','🌭':'hotdog','🏬':'whs','🏗':'crane','🚛':'truck','⛏':'pick','⛰':'mount','🏔':'mount','🚗':'car','🚕':'car','🚙':'car','🚘':'car',
 '🚲':'bike','📚':'books','📘':'books','📷':'camera','💻':'laptop',
 '⚙':'gear','🔊':'sound','🔈':'sound','🔉':'sound','🔇':'sound','📳':'vib','🎵':'music','🎶':'music','🌿':'leaf','🌱':'leaf','☘':'leaf','🔤':'font','🔠':'font','🌐':'globe','🎨':'palette','❓':'quest','❔':'quest','ℹ':'info','💾':'save','🔄':'refresh','🔁':'refresh','👤':'person','🧍':'person','🚶':'person','🧑':'person','👨':'man','👩':'woman','🙋':'person','📖':'books','📒':'books','📝':'pen','✍':'pen','✎':'pen','🛒':'cart','😄':'fhappy','😊':'fhappy','😃':'fhappy','😅':'fhappy','🙂':'fsmile','😉':'fwink','😏':'fwink','🤕':'fsad','😠':'fsad','😟':'fsad','🙏':'hand','👋':'hand','👍':'hand','🐻':'bear','🏙':'city','🌆':'city','🏘':'city','🚂':'train','🚆':'train','📤':'share','🎂':'cake','🌻':'sunfl','🔮':'ball','⌚':'watch','🧰':'toolbox','💼':'case','🚪':'door','⚓':'anchor','🌙':'moon','🏷':'tag','⏱':'clock','⏰':'clock','🕐':'clock','💬':'chat','💭':'chat','🗣':'chat','💡':'bulb','🎫':'ticket','🛟':'buoy','☂':'buoy','🪧':'sign','🔖':'sign','☀':'sun','🌅':'sun','🎩':'hat','📍':'pin','💳':'card','🐕':'paw','🐈':'paw','🐾':'paw','🚫':'no','⛔':'no','🚌':'bus','👑':'crown','📅':'cal','🛏':'sleep'};
var cache={};
function svg(k){if(cache[k])return cache[k];var g=G[k];if(!g)return '';
  var s='<svg class="lk-s" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(g[1]?'<path class="f" d="'+g[1]+'"/>':'')+(g[3]?'<path class="k" d="'+g[3]+'"/>':'')+(g[2]?'<path class="d" d="'+g[2]+'"/>':'')+'</svg>';
  return (cache[k]=s);}
function hx(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function mix(h,t,a){var c=hx(h),w=hx(t);return 'rgb('+c.map(function(v,i){return Math.round(v+(w[i]-v)*a);}).join(',')+')';}
function vars(k){var c=G[k][0],v=hx(c);return '--c:'+c+';--c2:'+mix(c,'#ffffff',.38)+';--c3:'+mix(c,'#000000',.18)+';--ct:'+mix(c,'#ffffff',.86)+';--cs:rgba('+v.join(',')+',.32)';}
window.ICONS={svg:svg,list:Object.keys(G),map:MAP,look:LOOK,color:function(k){return G[k]&&G[k][0];},vars:vars};
/* ---------- стиль: классы html.lk.lk-a (на случай, если index.html без них) ---------- */
if(!/\blk-a\b/.test(document.documentElement.className))document.documentElement.className+=' lk lk-a';
function bodyCls(){if(document.body){document.body.classList.add('lk','lk-'+LOOK);return true;}return false;}
if(!bodyCls())document.addEventListener('DOMContentLoaded',bodyCls);
var RM=false;try{RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}

/* ---------- эмодзи → SVG ---------- */
var keys=Object.keys(MAP).sort(function(a,b){return b.length-a.length;});
var RE=new RegExp('('+keys.map(function(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+')\uFE0F?','g');
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,'LK-I':1,'LK-T':1,svg:1,SVG:1,text:1,OPTION:1,TITLE:1};
// значок «в кружке» — когда эмодзи единственное содержимое такого места
var BADGE='.bz-ic,.bz-hand>i,.qs>i,.fu-av,.mt-ic,.cb-ic';
function inSvg(n){for(var p=n.parentNode;p&&p.nodeType===1;p=p.parentNode){if(p.namespaceURI==='http://www.w3.org/2000/svg'||SKIP[p.nodeName])return true;if(p.id==='splash')return true;}return false;}
// M38 (a45): числа не рвутся по строкам — «10 000 ₽», «30-го», «10 лет»: пробел после цифры и дефис в «30-го» — неразрывные
// M41: и «₽/мес» не рвётся на «₽/» и «мес» (после «/» — неразрывный соединитель U+2060)
var NBR=/(\d) (?=[\dА-Яа-яЁёA-Za-z₽%$€])|(\d)-(?=[а-яё]{1,3}(?![а-яёА-ЯЁ]))|(тыс\.|млн|млрд) (?=₽)|(₽\/)(?=мес|mo\b|год|yr)/g;
function nbFix(m,a,b,c,d){return a?a+'\u00a0':b?b+'\u2011':c?c+'\u00a0':d+'\u2060';}
var WORD={en:['силы','energy'],cr:['кр.','cr.'],hand:['время','hands'],heart:['отношения','relations'],star:['рейтинг','rating'],sleep:['выходной','day off'],lock:['закрыто','locked'],ad:['реклама','ad']};
function isEn(){try{return typeof LANG!=='undefined'&&LANG==='en';}catch(e){return false;}}
// «Без значков»: эмодзи без своего SVG — тоже в обёртку (прячется), только когда режим включён
var RAW=/(?:[\u2600-\u27BF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDFFF])\uFE0F?/g;
function rawWrap(t){if(!document.body||!document.body.classList.contains('noico'))return false;var s=t.nodeValue;if(!s||!RAW.test(s)){RAW.lastIndex=0;return false;}RAW.lastIndex=0;if(inSvg(t))return false;
  var par=t.parentNode,fr=document.createDocumentFragment(),last=0,mm;
  while((mm=RAW.exec(s))){if(mm.index>last)fr.appendChild(document.createTextNode(s.slice(last,mm.index)));var el=document.createElement('lk-i');el.className='i-raw';el.innerHTML='<lk-t>'+mm[0]+'</lk-t>';fr.appendChild(el);last=mm.index+mm[0].length;}
  if(last<s.length)fr.appendChild(document.createTextNode(s.slice(last)));par.replaceChild(fr,t);return true;}
function swapText(t){if(!t.parentNode)return;var s=t.nodeValue;
  if(s&&NBR.test(s)){NBR.lastIndex=0;if(!inSvg(t)){var s2=s.replace(NBR,nbFix);if(s2!==s){t.nodeValue=s2;s=s2;}}}NBR.lastIndex=0;
  if(!RE.test(s)){RE.lastIndex=0;rawWrap(t);return;}RE.lastIndex=0;if(!s||!RE.test(s)){RE.lastIndex=0;return;}RE.lastIndex=0;if(inSvg(t))return;
  var par=t.parentNode,only=s.replace(RE,'').trim()==='',bd=false;
  if(only&&par&&par.matches&&par.matches(BADGE)){var n=0;for(var c=par.firstChild;c;c=c.nextSibling)if(c.nodeType===3?c.nodeValue.trim():c.nodeName!=='I'||!par.classList.contains('bz-ic'))n++;bd=n===1;}
  var fr=document.createDocumentFragment(),last=0,mm;
  while((mm=RE.exec(s))){if(mm.index>last)fr.appendChild(document.createTextNode(s.slice(last,mm.index)));
    var k=MAP[mm[1]],el=document.createElement('lk-i');el.className='i-'+k+(bd?' bd':'');el.setAttribute('style',vars(k));
    // M38 (a45): «Без значков» (body.noico): у значка-единицы рядом с числом («⚡ 60», «+3 💎», «⭐ 4,2») — слово вместо значка (data-w)
    var wd=WORD[k];if(wd){var bef=s.slice(Math.max(0,mm.index-3),mm.index),aft=s.slice(mm.index+mm[0].length,mm.index+mm[0].length+3);
      if(/[\d+−-]\s?$/.test(bef)||/^\s?[\d+−-]/.test(aft))el.setAttribute('data-w',(isEn()?wd[1]:wd[0]));}
    el.innerHTML=svg(k)+'<lk-t>'+mm[0]+'</lk-t>';fr.appendChild(el);last=mm.index+mm[0].length;}
  if(last<s.length)fr.appendChild(document.createTextNode(s.slice(last)));
  par.replaceChild(fr,t);}
function walk(root){if(!root)return;if(root.nodeType===3){swapText(root);return;}if(root.nodeType!==1||SKIP[root.nodeName]||root.namespaceURI==='http://www.w3.org/2000/svg')return;
  var w=document.createTreeWalker(root,4,null,false),L=[],x;while((x=w.nextNode()))L.push(x);for(var i=0;i<L.length;i++)swapText(L[i]);
  area(root);}
/* ---------- графики: мягкая заливка под линией (fin.js рисует path fill=none) ---------- */
function area(root){if(!root.querySelectorAll)return;var ps=root.querySelectorAll('.spk svg path[fill="none"],.f-ich svg path[fill="none"],.bz-spark path[fill="none"]');
  for(var i=0;i<ps.length;i++){var p=ps[i];if(p.previousSibling&&p.previousSibling.getAttribute&&p.previousSibling.getAttribute('class')==='lk-area')continue;
    var d=p.getAttribute('d')||'',sv=p.ownerSVGElement;if(!sv||!/^M/.test(d))continue;var vb=(sv.getAttribute('viewBox')||'').split(/[ ,]+/),H=+vb[3]||+sv.getAttribute('height')||0;if(!H)continue;
    var pts=d.match(/-?\d+(\.\d+)?/g);if(!pts||pts.length<4)continue;var x0=pts[0],x1=pts[pts.length-2],c=p.style.stroke||p.getAttribute('stroke')||'currentColor';
    var a=document.createElementNS('http://www.w3.org/2000/svg','path');a.setAttribute('class','lk-area');a.setAttribute('d',d+'L'+x1+' '+H+'L'+x0+' '+H+'Z');a.setAttribute('style','fill:'+c);
    p.parentNode.insertBefore(a,p);}}
var busy=false;
function onMut(list){if(busy)return;busy=true;try{for(var i=0;i<list.length;i++){var r=list[i];
    if(r.type==='characterData')swapText(r.target);
    else for(var j=0;j<r.addedNodes.length;j++)walk(r.addedNodes[j]);
    if(r.type==='childList'&&r.target&&r.target.querySelector&&r.target.closest&&r.target.closest('svg'))area(r.target.closest('svg').parentNode||r.target);}}
  finally{busy=false;}}
function start(){bodyCls();walk(document.body);try{new MutationObserver(onMut).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}
  if(!RM)document.body.classList.add('lk-anim');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
