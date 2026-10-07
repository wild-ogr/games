/* Дворовая викторина — НОВЫЙ ВИД (look1, 04.10). Журнал: hobby-analytics/release-g/viktorina-look1.md, макеты — release-g/viktorina-look/.
   Грузится в <head> до игры. Что здесь (без зависимостей от кода игры):
   - LK.ic(key) — 70 своих SVG-значков 48×48 (цвета из темы: --i1 основной, --i2 акцент, --i3 светлый, --il контур, --coin1/2);
   - эмодзи в тексте игры подменяются значками на лету (MutationObserver): <lk-i>svg</lk-i><lk-t>эмодзи</lk-t>. В «Классике» видно эмодзи,
     в новых видах — значок; textContent не меняется (проверки и статистика видят то же). Новый эмодзи в тексте → строка в MAP (иначе остаётся эмодзи).
     Не трогаются: вопрос, ответы, пояснение, реплика (#qText,#answers) — там может быть «½» или «→» из самого вопроса (на 04.10 в базе таких нет);
   - LK.who(id,mood) — перерисованные персонажи по пояс (mihalych, zina, valya, kolya, mityai, valerka; mood: norm|happy|sad|wow), контур — из темы;
   - LK.scene(kind) — фон-место темы во весь экран (#scene): kind 'full' (меню, итоги) или 'dim' (вопрос, темы);
   - ранняя тема: класс на <html> ДО отрисовки (без мигания «Классики»): html.lk = новый вид, + th-tele / th-doska; «Классика» — без lk.
   Темы (реестр, покупка, окно «Оформление») — js/themes.js. Вёрстка — css/look.css (основной вид А «Дворовое шоу») и css/themes.css. */
(function(){
'use strict';
var D=document.documentElement;
/* ---------- темы: как рисовать (контур персонажей) ---------- */
var TH={dvor:{ink:'#233247',w:3},tele:{ink:'',w:0},doska:{ink:'#2a2a2a',w:2.6}};
function thId(){return D.classList.contains('th-tele')?'tele':D.classList.contains('th-doska')?'doska':'dvor';}
function on(){return D.classList.contains('lk');}

/* ---------- значки ---------- */
var S1='fill="var(--i1)"',S2='fill="var(--i2)"',S3='fill="var(--i3)"',LN='fill="none" stroke="var(--il)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"',
  ST1='stroke="var(--i1)" stroke-width="2.6"',RND='stroke-linecap="round" stroke-linejoin="round"';
function medal(c1,c2,r1,r2){return '<path d="M14 4 h8 l4 16 h-8z" fill="'+r1+'"/><path d="M34 4 h-8 l-4 16 h8z" fill="'+r2+'"/><circle cx="24" cy="31" r="13" fill="'+c1+'" stroke="'+c2+'" stroke-width="2.6"/><path d="M24 23 l2.5 5 l5.5 .8 l-4 3.9 l1 5.5 l-5 -2.6 l-5 2.6 l1 -5.5 l-4 -3.9 l5.5 -.8z" fill="'+c2+'"/>';}
var IC={
 ussr:'<rect x="6" y="15" width="36" height="24" rx="5" '+S1+'/><circle cx="17" cy="27" r="7" '+S3+'/><circle cx="17" cy="27" r="2.5" '+S1+'/><rect x="28" y="21" width="10" height="3" rx="1.5" '+S3+'/><rect x="28" y="27" width="10" height="3" rx="1.5" '+S3+'/><circle cx="33" cy="34.5" r="2" '+S2+'/><path d="M30 15 L40 5" '+LN+'/><circle cx="40" cy="5" r="2" '+S2+'/>',
 kino:'<rect x="6" y="18" width="36" height="23" rx="4" '+S1+'/><path d="M6 18 L40 8 l1.5 5 L7.5 23z" '+S2+'/><path d="M13 16 l4 5 M22 13.5 l4 5 M31 11 l4 5" stroke="var(--i3)" stroke-width="3"/><path d="M21 25 v10 l9 -5z" '+S3+'/>',
 geo:'<path d="M6 12 l12 -4 l12 4 l12 -4 v28 l-12 4 l-12 -4 l-12 4z" '+S3+' '+ST1+' stroke-linejoin="round"/><path d="M18 8 v28 M30 12 v28" stroke="var(--i1)" stroke-width="2" opacity=".5"/><path d="M24 15 a6 6 0 0 1 6 6 c0 5 -6 10 -6 10 s-6 -5 -6 -10 a6 6 0 0 1 6 -6z" '+S2+'/><circle cx="24" cy="21" r="2.2" '+S3+'/>',
 world:'<circle cx="24" cy="24" r="18" '+S1+'/><path d="M13 14 q6 -3 9 1 q1 5 -4 6 q-1 5 -6 4 q-4 -5 1 -11z M27 22 q7 -2 10 3 q-1 8 -7 10 q-5 -3 -3 -13z M26 8 q5 0 8 4 q-4 2 -8 0z" '+S3+'/><circle cx="24" cy="24" r="18" fill="none" stroke="var(--i2)" stroke-width="2.6"/>',
 nature:'<rect x="21.5" y="34" width="5" height="9" rx="1.5" '+S2+'/><path d="M24 4 l9 12 h-5 l8 10 h-6 l8 10 H10 l8 -10 h-6 l8 -10 h-5z" '+S1+'/><path d="M24 10 l4 6 M21 22 l6 0 M19 32 h10" stroke="var(--i3)" stroke-width="2" stroke-linecap="round" opacity=".7"/>',
 kitchen:'<path d="M7 22 h34 v8 a10 10 0 0 1 -10 10 h-14 a10 10 0 0 1 -10 -10z" '+S1+'/><rect x="4" y="19" width="40" height="5" rx="2.5" '+S2+'/><rect x="20" y="13" width="8" height="5" rx="2.5" '+S2+'/><path d="M15 12 q-3 -3 0 -6 M33 12 q-3 -3 0 -6" '+LN+'/><path d="M13 30 q5 4 10 0" stroke="var(--i3)" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
 lang:'<path d="M6 10 h14 q4 0 4 4 v26 q0 -3 -4 -3 h-14z" '+S1+'/><path d="M42 10 h-14 q-4 0 -4 4 v26 q0 -3 4 -3 h14z" '+S2+'/><path d="M10 17 h9 M10 23 h9 M10 29 h6 M29 17 h9 M29 23 h9 M29 29 h6" stroke="var(--i3)" stroke-width="2.4" stroke-linecap="round"/>',
 history:'<path d="M9 42 V18 h-3 v-8 h5 v4 h4 v-4 h5 v8 h8 v-8 h5 v4 h4 v-4 h5 v8 h-3 v24z" '+S1+'/><path d="M19 42 v-9 a5 5 0 0 1 10 0 v9z" '+S2+'/><rect x="13" y="22" width="4" height="6" rx="2" '+S3+'/><rect x="31" y="22" width="4" height="6" rx="2" '+S3+'/><path d="M24 10 V3 l7 2.5 l-7 2.5" '+LN+'/>',
 sport:'<circle cx="24" cy="24" r="18" '+S3+' '+ST1+'/><path d="M24 15 l8 6 l-3 9 h-10 l-3 -9z" '+S1+'/><path d="M24 15 V7 M32 21 l8 -3 M29 30 l5 7 M19 30 l-5 7 M16 21 l-8 -3" stroke="var(--i1)" stroke-width="2.6" stroke-linecap="round"/>',
 tech:'<path d="M5 30 q0 -6 6 -7 l4 -8 q1 -2 4 -2 h11 q3 0 5 2 l5 8 q4 1 4 7 v4 h-39z" '+S1+'/><path d="M17 16 h6 v7 h-10z M26 16 h5 l4 7 h-9z" '+S3+'/><circle cx="15" cy="35" r="5.5" '+S2+'/><circle cx="34" cy="35" r="5.5" '+S2+'/><circle cx="15" cy="35" r="2" '+S3+'/><circle cx="34" cy="35" r="2" '+S3+'/>',
 space:'<path d="M24 3 q10 9 10 22 v8 h-20 v-8 q0 -13 10 -22z" '+S1+'/><circle cx="24" cy="19" r="4.5" '+S3+'/><path d="M14 26 l-7 9 h7z M34 26 l7 9 h-7z" '+S2+'/><path d="M19 35 q5 12 5 10 q0 2 5 -10z" '+S2+'/>',
 dacha:'<path d="M15 20 q9 -6 18 0 q-1 16 -9 25 q-8 -9 -9 -25z" '+S2+'/><path d="M24 18 q-8 -6 -10 -14 q7 2 10 9 q1 -8 6 -10 q4 6 -6 15z" '+S1+'/><path d="M19 27 h5 M22 33 h5" stroke="var(--i3)" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>',
 lit:'<rect x="7" y="30" width="34" height="10" rx="2.5" '+S1+'/><rect x="10" y="20" width="30" height="10" rx="2.5" '+S2+'/><rect x="6" y="10" width="32" height="10" rx="2.5" '+S1+'/><path d="M12 15 h12 M15 25 h12 M13 35 h12" stroke="var(--i3)" stroke-width="2.4" stroke-linecap="round"/><path d="M31 10 v8 l2.5 -2 l2.5 2 v-8z" '+S2+'/>',
 art:'<path d="M18 9 l20 -5 v24 a6.5 5.5 0 1 1 -4 -5 V13 l-12 3 v17 a6.5 5.5 0 1 1 -4 -5z" '+S1+'/><ellipse cx="11.5" cy="33" rx="6.5" ry="5.5" '+S2+'/><ellipse cx="31.5" cy="28" rx="6.5" ry="5.5" '+S2+'/>',
 sci:'<ellipse cx="24" cy="24" rx="19" ry="7.5" fill="none" stroke="var(--i1)" stroke-width="2.8"/><ellipse cx="24" cy="24" rx="19" ry="7.5" fill="none" stroke="var(--i1)" stroke-width="2.8" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="19" ry="7.5" fill="none" stroke="var(--i1)" stroke-width="2.8" transform="rotate(120 24 24)"/><circle cx="24" cy="24" r="5" '+S2+'/>',
 all:'<rect x="7" y="7" width="34" height="34" rx="8" '+S3+' '+ST1+'/><circle cx="16" cy="16" r="3.2" '+S1+'/><circle cx="32" cy="16" r="3.2" '+S1+'/><circle cx="24" cy="24" r="3.2" '+S2+'/><circle cx="16" cy="32" r="3.2" '+S1+'/><circle cx="32" cy="32" r="3.2" '+S1+'/>',
 coin:'<circle cx="24" cy="24" r="18" fill="var(--coin2)"/><circle cx="24" cy="22.5" r="17" fill="var(--coin1)"/><circle cx="24" cy="22.5" r="12" fill="none" stroke="var(--coin2)" stroke-width="2.4"/><path d="M19 30 V15 h7 a4.5 4.5 0 0 1 0 9 h-7 M16 27.5 h9" fill="none" stroke="var(--coin2)" stroke-width="3" '+RND+'/>',
 gear:'<path d="M21 4 h6 l1 5 l4 2 l4.5 -3 l4.5 4.5 l-3 4.5 l2 4 l5 1 v6 l-5 1 l-2 4 l3 4.5 l-4.5 4.5 l-4.5 -3 l-4 2 l-1 5 h-6 l-1 -5 l-4 -2 l-4.5 3 l-4.5 -4.5 l3 -4.5 l-2 -4 l-5 -1 v-6 l5 -1 l2 -4 l-3 -4.5 l4.5 -4.5 l4.5 3 l4 -2z" '+S1+'/><circle cx="24" cy="24" r="7" '+S3+'/>',
 back:'<path d="M28 10 L14 24 l14 14" fill="none" stroke="var(--i1)" stroke-width="5" '+RND+'/><path d="M15 24 h22" stroke="var(--i1)" stroke-width="5" stroke-linecap="round"/>',
 next:'<path d="M8 24 h28 M26 12 l12 12 l-12 12" fill="none" stroke="currentColor" stroke-width="5.5" '+RND+'/>',
 play:'<path d="M14 7 v34 l28 -17z" fill="currentColor"/>',
 again:'<path d="M37 17 a15 15 0 1 0 2 12" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M40 6 v13 h-13" fill="none" stroke="currentColor" stroke-width="5" '+RND+'/>',
 lock:'<rect x="9" y="21" width="30" height="22" rx="5" '+S1+'/><path d="M15 21 v-6 a9 9 0 0 1 18 0 v6" fill="none" stroke="var(--i1)" stroke-width="4"/><circle cx="24" cy="31" r="3.5" '+S3+'/>',
 half:'<circle cx="24" cy="24" r="18" '+S3+' '+ST1+'/><path d="M24 6 a18 18 0 0 1 0 36z" '+S1+'/><path d="M11 24 h8" stroke="var(--i1)" stroke-width="3" stroke-linecap="round"/><path d="M29 24 h8" stroke="var(--i3)" stroke-width="3" stroke-linecap="round"/>',
 flag:'<path d="M11 44 V5" stroke="var(--i1)" stroke-width="4" stroke-linecap="round"/><path d="M13 7 h24 l-6 9 l6 9 h-24z" '+S2+'/>',
 rep:'<path d="M12 44 V5" stroke="var(--il)" stroke-width="4" stroke-linecap="round"/><path d="M14 7 h22 l-5 8 l5 8 h-22z" fill="var(--no)"/>',
 cal:'<rect x="6" y="9" width="36" height="33" rx="6" '+S3+' '+ST1+'/><path d="M6 15 a6 6 0 0 1 6 -6 h24 a6 6 0 0 1 6 6 v5 h-36z" '+S2+'/><path d="M15 5 v8 M33 5 v8" stroke="var(--i1)" stroke-width="3.6" stroke-linecap="round"/><path d="M16 31 l5 5 l11 -11" fill="none" stroke="var(--i1)" stroke-width="4" '+RND+'/>',
 medal:medal('var(--coin1)','var(--coin2)','var(--i1)','var(--i2)'),
 m1:medal('#e3a06a','#9a5a24','var(--i1)','var(--i2)'),
 m2:medal('#e4e8ee','#7f8a99','var(--i1)','var(--i2)'),
 m3:medal('var(--coin1)','var(--coin2)','var(--i1)','var(--i2)'),
 gift:'<rect x="6" y="19" width="36" height="24" rx="4" '+S1+'/><rect x="4" y="13" width="40" height="9" rx="3" '+S2+'/><rect x="20.5" y="13" width="7" height="30" '+S3+'/><path d="M24 13 q-10 -12 -13 -5 q-1 5 13 5 q10 -12 13 -5 q1 5 -13 5" fill="none" stroke="var(--i2)" stroke-width="3" stroke-linecap="round"/>',
 duel:'<path d="M8 8 l5 0 l20 22 l-4 4 l-21 -21z" '+S1+'/><path d="M40 8 l-5 0 l-20 22 l4 4 l21 -21z" '+S2+'/><path d="M11 30 l8 8 M37 30 l-8 8 M10 40 l4 -4 M38 40 l-4 -4" stroke="var(--i1)" stroke-width="3.6" stroke-linecap="round"/>',
 tv:'<rect x="5" y="12" width="38" height="26" rx="6" '+S1+'/><rect x="10" y="17" width="22" height="16" rx="3" '+S3+'/><circle cx="37.5" cy="20" r="2" '+S3+'/><circle cx="37.5" cy="27" r="2" '+S3+'/><path d="M17 5 l7 7 l7 -7 M14 43 h20" '+LN+'/><path d="M18.5 21 v8 l7 -4z" '+S2+'/>',
 okc:'<circle cx="24" cy="24" r="20" fill="var(--ok)"/><path d="M13 25 l8 8 l15 -17" fill="none" stroke="#fff" stroke-width="6" '+RND+'/>',
 noc:'<circle cx="24" cy="24" r="20" fill="var(--no)"/><path d="M15 15 l18 18 M33 15 l-18 18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>',
 ok:'<circle cx="24" cy="24" r="20" fill="#fff"/><path d="M13 25 l8 8 l15 -17" fill="none" stroke="var(--ok)" stroke-width="6" '+RND+'/>',
 no:'<circle cx="24" cy="24" r="20" fill="#fff"/><path d="M15 15 l18 18 M33 15 l-18 18" fill="none" stroke="var(--no)" stroke-width="6" stroke-linecap="round"/>',
 tick:'<path d="M9 25 l10 10 l20 -22" fill="none" stroke="currentColor" stroke-width="6.5" '+RND+'/>',
 cross:'<path d="M12 12 l24 24 M36 12 l-24 24" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round"/>',
 fire:'<path d="M24 3 q4 9 10 14 q7 7 5 15 q-2 11 -15 12 q-13 -1 -15 -12 q-1 -7 5 -12 q1 5 4 6 q-1 -12 6 -23z" '+S2+'/><path d="M24 24 q7 6 5 12 q-1 5 -5 6 q-5 -1 -6 -6 q0 -4 3 -6 q2 -1 3 -6z" fill="var(--coin1)"/>',
 star:'<path d="M24 4 l6 12.5 l13.5 2 l-10 9.5 l2.5 13.5 l-12 -6.5 l-12 6.5 l2.5 -13.5 l-10 -9.5 l13.5 -2z" fill="var(--coin1)" stroke="var(--coin2)" stroke-width="2.4" stroke-linejoin="round"/>',
 bulb:'<path d="M24 5 a13 13 0 0 1 8 23 q-2 2 -2 5 h-12 q0 -3 -2 -5 a13 13 0 0 1 8 -23z" fill="var(--coin1)"/><rect x="18" y="35" width="12" height="4" rx="2" '+S1+'/><rect x="20" y="41" width="8" height="3.5" rx="1.7" '+S1+'/>',
 games:'<rect x="5" y="14" width="38" height="24" rx="12" '+S1+'/><path d="M15 21 v10 M10 26 h10" stroke="var(--i3)" stroke-width="3.6" stroke-linecap="round"/><circle cx="31" cy="23" r="2.8" '+S2+'/><circle cx="36" cy="29" r="2.8" '+S3+'/>',
 friends:'<circle cx="17" cy="16" r="7" '+S1+'/><path d="M4 40 q1 -14 13 -14 q12 0 13 14z" '+S1+'/><circle cx="32" cy="18" r="6" '+S2+'/><path d="M22 41 q1 -12 10 -12 q11 0 12 12z" '+S2+'/>',
 stat:'<rect x="6" y="26" width="8" height="15" rx="2" '+S1+'/><rect x="20" y="16" width="8" height="25" rx="2" '+S2+'/><rect x="34" y="8" width="8" height="33" rx="2" '+S1+'/><path d="M4 43 h40" stroke="var(--il)" stroke-width="2.6" stroke-linecap="round"/>',
 phone:'<rect x="13" y="4" width="22" height="40" rx="5" '+S1+'/><rect x="16" y="9" width="16" height="26" rx="2" '+S3+'/><circle cx="24" cy="39.5" r="2" '+S3+'/><path d="M20 22 h10 M26 17 l5 5 l-5 5" fill="none" stroke="var(--i2)" stroke-width="3" '+RND+'/>',
 horn:'<path d="M6 19 h8 l18 -10 v30 l-18 -10 h-8z" '+S1+'/><rect x="9" y="28" width="7" height="12" rx="2" '+S2+'/><path d="M37 17 q4 7 0 14 M41 13 q7 11 0 22" '+LN+'/>',
 cup:'<path d="M13 6 h22 v10 a11 11 0 0 1 -22 0z" fill="var(--coin1)" stroke="var(--coin2)" stroke-width="2.4"/><path d="M13 10 h-6 q0 9 7 10 M35 10 h6 q0 9 -7 10" fill="none" stroke="var(--coin2)" stroke-width="2.6"/><rect x="21" y="27" width="6" height="8" fill="var(--coin2)"/><rect x="14" y="35" width="20" height="7" rx="2" '+S1+'/>',
 help:'<circle cx="24" cy="24" r="19" '+S1+'/><path d="M18 18 a6 6 0 1 1 9 5 q-3 2 -3 6" fill="none" stroke="var(--i3)" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="35" r="2.6" '+S3+'/>',
 info:'<circle cx="24" cy="24" r="19" '+S1+'/><rect x="21.5" y="20" width="5" height="16" rx="2.5" '+S3+'/><circle cx="24" cy="14" r="3" '+S3+'/>',
 share:'<path d="M8 24 v14 a4 4 0 0 0 4 4 h24 a4 4 0 0 0 4 -4 v-14" fill="none" stroke="var(--i1)" stroke-width="4" stroke-linecap="round"/><path d="M24 30 V6 M15 14 l9 -9 l9 9" fill="none" stroke="var(--i2)" stroke-width="4.5" '+RND+'/>',
 thumb:'<path d="M15 21 l7 -14 q5 0 5 6 l-1 7 h12 q4 1 3 5 l-3 14 q-1 4 -5 4 h-18z" '+S2+'/><rect x="5" y="21" width="9" height="22" rx="2" '+S1+'/>',
 ten:'<rect x="4" y="8" width="40" height="32" rx="8" '+S1+'/><path d="M13 17 l4 -3 v20 M29 14 a6 6 0 0 1 6 6 v8 a6 6 0 0 1 -12 0 v-8 a6 6 0 0 1 6 -6z" fill="none" stroke="var(--i3)" stroke-width="3.6" '+RND+'/>',
 ban:'<circle cx="24" cy="24" r="17" fill="none" stroke="var(--no)" stroke-width="5"/><path d="M12 12 l24 24" stroke="var(--no)" stroke-width="5"/>',
 home:'<path d="M5 24 L24 7 l19 17" fill="none" stroke="var(--i2)" stroke-width="4.5" '+RND+'/><path d="M10 22 v20 h28 v-20 L24 10z" '+S1+'/><rect x="20" y="29" width="8" height="13" rx="1.5" '+S3+'/>',
 mail:'<rect x="5" y="11" width="38" height="27" rx="4" '+S1+'/><path d="M7 14 l17 13 l17 -13" fill="none" stroke="var(--i3)" stroke-width="3" '+RND+'/>',
 sound:'<path d="M6 18 h8 l11 -9 v30 l-11 -9 h-8z" '+S1+'/><path d="M31 18 q4 6 0 12 M36 13 q8 11 0 22" fill="none" stroke="var(--i2)" stroke-width="3.4" stroke-linecap="round"/>',
 music:'<path d="M18 34 v-23 l20 -5 v23" fill="none" stroke="var(--i2)" stroke-width="3.6" '+RND+'/><path d="M18 17 l20 -5" fill="none" stroke="var(--i2)" stroke-width="3.6" '+RND+'/><ellipse cx="12.5" cy="35" rx="6.5" ry="5" '+S1+'/><ellipse cx="32.5" cy="30" rx="6.5" ry="5" '+S1+'/>',
 vib:'<rect x="15" y="6" width="18" height="36" rx="4" '+S1+'/><rect x="18" y="10" width="12" height="24" rx="2" '+S3+'/><path d="M9 16 l-4 4 l4 4 l-4 4 l4 4 M39 16 l4 4 l-4 4 l4 4 l-4 4" fill="none" stroke="var(--i2)" stroke-width="2.6" '+RND+'/>',
 zoom:'<circle cx="20" cy="20" r="13" '+S3+' stroke="var(--i1)" stroke-width="4"/><path d="M30 30 l12 12" stroke="var(--i2)" stroke-width="6" stroke-linecap="round"/><path d="M14 20 h12 M20 14 v12" stroke="var(--i1)" stroke-width="3" stroke-linecap="round"/>',
 leaf:'<path d="M8 40 q0 -30 32 -32 q2 30 -28 32z" '+S1+'/><path d="M8 40 q12 -14 24 -24" fill="none" stroke="var(--i3)" stroke-width="2.6" stroke-linecap="round"/>',
 cart:'<path d="M4 8 h6 l5 22 h22 l5 -16 h-29" fill="none" stroke="var(--i1)" stroke-width="3.6" '+RND+'/><path d="M14 14 h27 l-4 13 h-20z" '+S2+'/><circle cx="18" cy="38" r="3.5" '+S1+'/><circle cx="34" cy="38" r="3.5" '+S1+'/>',
 repeat:'<path d="M8 22 v-4 a6 6 0 0 1 6 -6 h22 M30 6 l6 6 l-6 6 M40 26 v4 a6 6 0 0 1 -6 6 h-22 M18 42 l-6 -6 l6 -6" fill="none" stroke="var(--i1)" stroke-width="4" '+RND+'/>',
 kbd:'<rect x="3" y="12" width="42" height="25" rx="4" '+S1+'/><g '+S3+'><rect x="8" y="17" width="5" height="4" rx="1"/><rect x="16" y="17" width="5" height="4" rx="1"/><rect x="24" y="17" width="5" height="4" rx="1"/><rect x="32" y="17" width="8" height="4" rx="1"/><rect x="8" y="24" width="8" height="4" rx="1"/><rect x="19" y="24" width="5" height="4" rx="1"/><rect x="27" y="24" width="5" height="4" rx="1"/><rect x="35" y="24" width="5" height="4" rx="1"/><rect x="13" y="30" width="22" height="3.5" rx="1.5"/></g>',
 bell:'<path d="M24 6 q-12 1 -12 15 v8 l-5 7 h34 l-5 -7 v-8 q0 -14 -12 -15z" '+S1+'/><path d="M19 39 q5 6 10 0z" '+S2+'/><circle cx="24" cy="5.5" r="2.6" '+S2+'/><path d="M16 21 q0 -8 6 -10" fill="none" stroke="var(--i3)" stroke-width="2.4" stroke-linecap="round"/>',
 palette:'<path d="M24 5 a19 19 0 1 0 0 38 q4 0 4 -4 q0 -3 -2 -5 q-2 -3 2 -5 h7 q9 0 9 -9 q0 -15 -20 -15z" '+S3+' stroke="var(--il)" stroke-width="2.6" stroke-linejoin="round"/><circle cx="14" cy="22" r="3.6" '+S2+'/><circle cx="19" cy="13" r="3.6" '+S1+'/><circle cx="29" cy="12" r="3.6" fill="var(--coin1)"/><circle cx="14" cy="32" r="3.6" fill="var(--ok)"/>'
};
// Эмодзи → значок. Лица соседа и Зины — головы перерисованных персонажей (face:<id>)
var MAP={'💰':'coin','⚙':'gear','←':'back','→':'next','▶':'play','↻':'again','⭐':'star','🎁':'gift','✓':'tick','✅':'okc','✗':'cross','❌':'noc','⚔':'duel','🔥':'fire',
 '🎲':'all','🥉':'m1','🥈':'m2','🥇':'m3','🏅':'medal','📅':'cal','📺':'tv','👥':'friends','📊':'stat','📲':'phone','📣':'horn','🏆':'cup','⚑':'rep','🙋':'face:kolya','🏳':'flag',
 '❓':'help','ℹ':'info','½':'half','👵':'face:zina','📤':'share','👍':'thumb','🔟':'ten','💡':'bulb','🚫':'ban','🔒':'lock','🏠':'home','📨':'mail','🔊':'sound','🎵':'music','📳':'vib',
 '🔎':'zoom','🌿':'leaf','🛒':'cart','🔁':'repeat','⌨':'kbd','🎨':'palette','🎮':'games','🔔':'bell',
 '📻':'ussr','🎬':'kino','🗺':'geo','🌍':'world','🌲':'nature','🥟':'kitchen','📖':'lang','🏰':'history','⚽':'sport','🚗':'tech','🚀':'space','🥕':'dacha','📚':'lit','🎻':'art','🔬':'sci'};
function ic(k,cls){if(k.indexOf('face:')===0)return face(k.slice(5),cls);
  return '<svg class="ic'+(cls?' '+cls:'')+'" viewBox="0 0 48 48" aria-hidden="true" focusable="false">'+(IC[k]||'')+'</svg>';}

/* ---------- персонажи по пояс (200×220): взрослые пропорции, у Михалыча седые усы, ушанка, жилет и метла; у Зины шаль и очки ---------- */
function OUT(){var t=TH[thId()];return t.w?'stroke="'+t.ink+'" stroke-width="'+t.w+'" stroke-linejoin="round"':'';}
var NEW={
 mihalych:function(s){return{old:1,body:'#5d6b7c',brow:'#9a9a9a',
  back:'<g transform="rotate(14 172 120)"><rect x="168" y="34" width="8" height="190" rx="4" fill="#b98a55" '+s+'/><path d="M152 6 h40 l-6 44 h-28z" fill="#e2b25c" '+s+'/><path d="M160 12 v32 M168 10 v36 M176 10 v36 M184 12 v32" stroke="#b98533" stroke-width="2.4"/><rect x="154" y="44" width="36" height="9" rx="3" fill="#c0392b" '+s+'/></g>',
  bodyX:'<path d="M56 158 l24 -6 l20 30 l20 -30 l24 6 q30 8 38 34 v28 H18 v-28 q8 -26 38 -34z" fill="#ff8a1f" '+s+'/><path d="M20 196 h160" stroke="#f4f6f4" stroke-width="12"/><path d="M20 196 h160" stroke="#c9d2cf" stroke-width="2" stroke-dasharray="3 5"/><path d="M80 152 l20 30 l20 -30" fill="#39485a" '+s+'/>',
  hat:'<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#6f5136" '+s+'/><path d="M42 82 q58 -22 116 0 v14 q-58 -20 -116 0z" fill="#9b7650" '+s+'/><path d="M42 84 q-12 30 0 52 q10 -4 13 -18 q-5 -16 -3 -32z M158 84 q12 30 0 52 q-10 -4 -13 -18 q5 -16 3 -32z" fill="#9b7650" '+s+'/><path d="M92 28 q8 -8 16 0" stroke="#4d3722" stroke-width="3" fill="none" stroke-linecap="round"/>',
  under:'<path d="M70 128 q14 -10 30 -3 q16 -7 30 3 q-6 14 -30 9 q-24 5 -30 -9z" fill="#c9cdd2" '+s+'/>'};},
 zina:function(s){return{old:1,body:'#8d5fae',brow:'#9b9eab',skin:'#f1c7a6',
  hair:'<circle cx="100" cy="34" r="22" fill="#dfe2ea" '+s+'/><path d="M50 98 q-6 -54 50 -58 q56 4 50 58 q-8 -30 -24 -36 q-12 14 -52 12 q-18 4 -24 24z" fill="#dfe2ea" '+s+'/>',
  bodyX:'<path d="M60 158 l40 44 l40 -44 q24 6 36 22 l-40 40 H64 l-40 -40 q12 -16 36 -22z" fill="#f4e3c2" '+s+'/><path d="M36 188 l12 14 M52 176 l14 22 M148 176 l-14 22 M164 188 l-12 14" stroke="#c9a96a" stroke-width="2.4" stroke-dasharray="4 4"/>',
  glasses:'<g fill="rgba(210,230,255,.35)" stroke="#6d4b3d" stroke-width="3.4"><circle cx="81" cy="103" r="15"/><circle cx="119" cy="103" r="15"/></g><path d="M96 101 q4 -4 8 0 M66 100 l-16 -6 M134 100 l16 -6" stroke="#6d4b3d" stroke-width="3.4" fill="none"/>'};},
 valya:function(s){var s2=s||'stroke="#d9d9d9" stroke-width="2"';return{body:'#fafafa',brow:'#8a3a2a',
  hair:'<g fill="#b9533a" '+s+'><circle cx="52" cy="84" r="15"/><circle cx="148" cy="84" r="15"/><circle cx="48" cy="108" r="12"/><circle cx="152" cy="108" r="12"/></g>',
  hat:'<path d="M56 70 q44 -20 88 0 v-18 q-44 -22 -88 0z" fill="#fff" '+s2+'/><path d="M58 54 q-14 -26 12 -34 q10 -18 30 -8 q20 -10 30 8 q26 8 12 34 q-42 -16 -84 0z" fill="#fff" '+s2+'/>',
  bodyX:'<path d="M100 160 V220" stroke="#d5d5d5" stroke-width="2.4"/><circle cx="108" cy="182" r="3" fill="#c8c8c8"/><circle cx="108" cy="202" r="3" fill="#c8c8c8"/><path d="M80 152 l20 18 l20 -18" fill="#e9534f" '+s+'/>',
  face:'<circle cx="48" cy="126" r="4.5" fill="#f5b72d"/><circle cx="152" cy="126" r="4.5" fill="#f5b72d"/>'};},
 kolya:function(s){return{body:'#2f5fa6',brow:'#5b3a29',
  hat:'<path d="M48 78 q2 -50 54 -52 q50 2 52 44 q-52 -10 -106 8z" fill="#6b5b4a" '+s+'/><path d="M48 78 q52 -18 106 -8 q18 4 24 14 q-64 -12 -130 -6z" fill="#51443a" '+s+'/>',
  bodyX:'<path d="M80 152 l20 20 l20 -20" fill="#e3e9f0" '+s+'/><path d="M66 164 v56 M134 164 v56" stroke="#1f4275" stroke-width="9"/>',
  under:'<path d="M72 128 q14 -9 28 -2 q14 -7 28 2 q-7 12 -28 7 q-21 5 -28 -7z" fill="#5b3a29" '+s+'/>'};},
 mityai:function(s){return{old:1,body:'#fff',brow:'#c2c6cd',
  hair:'<path d="M50 104 q-6 -24 8 -36 q-2 18 5 30z M150 104 q6 -24 -8 -36 q2 18 -5 30z" fill="#d9dde3" '+s+'/>',
  bodyX:'<g stroke="#1f4f9a" stroke-width="8"><path d="M40 176 h120 M24 194 h152 M18 212 h164"/></g>',
  face:'<path d="M68 142 q32 18 64 0" stroke="#c4c4c4" stroke-width="2.4" fill="none" stroke-dasharray="2 5"/><circle cx="101" cy="118" r="8" fill="#e8826f" opacity=".55"/>'};},
 valerka:function(s){return{body:'#2f9e44',brow:'#6b4420',skin:'#f6cfae',
  hair:'<path d="M52 96 q-6 -44 46 -50 q52 2 52 48 q-10 -22 -26 -20 q-10 -12 -24 -6 q-14 -10 -30 2 q-12 4 -18 26z" fill="#8a5a2b" '+s+'/>',
  hat:'<path d="M50 76 q2 -44 50 -46 q48 2 50 46 q-50 -14 -100 0z" fill="#1c6fb8" '+s+'/><path d="M100 64 q38 -6 68 10 q-4 9 -18 9 q-24 -9 -50 -7z" fill="#155a96" '+s+'/>',
  bodyX:'<path d="M80 152 l20 22 l20 -22" fill="#fff" '+s+'/>',
  face:'<g fill="#d9905b" opacity=".7"><circle cx="68" cy="116" r="2"/><circle cx="76" cy="121" r="2"/><circle cx="62" cy="122" r="2"/><circle cx="132" cy="116" r="2"/><circle cx="124" cy="121" r="2"/><circle cx="138" cy="122" r="2"/></g>'};}
};
function bustInner(id,m){var o=(NEW[id]||NEW.mihalych)(OUT()),st=OUT();
 var sk=o.skin||'#eebf99',sk2=o.skin2||'#dba27c',brow=o.brow||'#8c8c8c';
 var eyes=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/><circle cx="83" cy="101" r="1.8" fill="#fff"/><circle cx="121" cy="101" r="1.8" fill="#fff"/>'
  :'<ellipse cx="81" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><circle cx="82.5" cy="101.5" r="1.4" fill="#fff"/><circle cx="120.5" cy="101.5" r="1.4" fill="#fff"/>';
 var brows=m==='sad'?'<path d="M68 90 q10 -5 22 2 M132 90 q-10 -5 -22 2" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
  :m==='happy'||m==='wow'?'<path d="M67 86 q11 -9 23 -3 M133 86 q-11 -9 -23 -3" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
  :'<path d="M68 90 q11 -6 22 -2 M132 90 q-11 -6 -22 -2" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>';
 var mouth=m==='happy'?'<path d="M82 132 q18 20 36 0 q-18 5 -36 0z" fill="#8f2f35"/><path d="M87 134.5 q13 5 26 0 l-2 3 q-11 4 -22 0z" fill="#fff"/>'
  :m==='sad'?'<path d="M88 140 q12 -9 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<ellipse cx="100" cy="137" rx="8" ry="9" fill="#8f2f35"/>'
  :'<path d="M86 133 q14 11 28 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
 return (o.back||'')+'<path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="'+o.body+'" '+st+'/>'+(o.bodyX||'')+
  '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'" '+st+'/>'+
  '<ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'" '+st+'/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'" '+st+'/>'+
  '<path d="M52 92 q0 -48 48 -48 q48 0 48 48 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'" '+st+'/>'+(o.hair||'')+
  '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
  (o.old?'<path d="M64 112 q5 3 10 2 M136 112 q-5 3 -10 2 M80 76 q20 -5 40 0" stroke="'+sk2+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'')+
  brows+eyes+(o.glasses||'')+'<path d="M100 104 q-9 18 -3 22 q5 3 11 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".9"/>'+(o.under||'')+mouth+(o.face||'')+(o.hat||'');}
var BC={};
function who(id,m){m=m||'norm';var k=thId()+':'+id+':'+m;if(BC[k])return BC[k];
 return BC[k]='<svg viewBox="0 0 200 220" class="bust" data-pv="'+id+'/'+m+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+bustInner(id,m)+'</svg>';}
function face(id,cls){var k=thId()+':f:'+id;if(!BC[k])BC[k]=bustInner(id,'norm');
 return '<svg class="ic face'+(cls?' '+cls:'')+'" viewBox="34 6 132 150" aria-hidden="true" focusable="false">'+BC[k]+'</svg>';}

/* ---------- сцены (фон-место темы) ---------- */
function flags(){var s='',c=['#ff7a1a','#ffcf40','#3f8fe0','#2fa84f','#e5484d'];for(var i=0;i<14;i++){var x=10+i*29,y=26+Math.sin(i/13*Math.PI)*16;s+='<path d="M'+x+' '+y+' l20 0 l-10 20z" fill="'+c[i%5]+'" stroke="#233247" stroke-width="1.6" stroke-linejoin="round"/>';}
 return '<path d="M0 22 Q200 62 400 22" fill="none" stroke="#233247" stroke-width="2"/>'+s;}
function house(x,y,fl,cols,lit){var s='<rect x="'+x+'" y="'+y+'" width="'+(cols*30+14)+'" height="'+(fl*34+10)+'" fill="#f3e3c6" stroke="#233247" stroke-width="2.5"/><rect x="'+(x-4)+'" y="'+(y-8)+'" width="'+(cols*30+22)+'" height="10" fill="#c9765a" stroke="#233247" stroke-width="2.5"/>';
 for(var f=0;f<fl;f++)for(var c=0;c<cols;c++){var o=lit.indexOf(f*cols+c)>=0;s+='<rect x="'+(x+12+c*30)+'" y="'+(y+10+f*34)+'" width="18" height="22" rx="2" fill="'+(o?'#ffd24a':'#bfe0f2')+'" stroke="#233247" stroke-width="2"/><path d="M'+(x+21+c*30)+' '+(y+10+f*34)+' v22" stroke="#233247" stroke-width="1.4"/>';}return s;}
var SCN={
 dvor:function(W,vw,full){
  return '<defs><linearGradient id="lkSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3f4"/><stop offset=".55" stop-color="#d8f1fb"/><stop offset="1" stop-color="#eaf7df"/></linearGradient></defs>'+
  '<rect width="'+vw+'" height="800" fill="url(#lkSky)"/><circle cx="'+(vw-70)+'" cy="'+(W?90:150)+'" r="34" fill="#fff3b0"/><circle cx="'+(vw-70)+'" cy="'+(W?90:150)+'" r="24" fill="#ffd24a"/>'+
  '<g fill="#fff"><ellipse cx="80" cy="160" rx="46" ry="16"/><ellipse cx="110" cy="148" rx="30" ry="16"/><ellipse cx="'+(vw-150)+'" cy="220" rx="40" ry="13"/>'+(W?'<ellipse cx="480" cy="110" rx="60" ry="16"/>':'')+'</g>'+
  '<g opacity="'+(full?1:.55)+'">'+house(-6,300,9,W?7:5,[2,6,7,13,18,24,26,31,37,40,45,52])+house(W?770:238,360,7,W?8:6,[1,4,9,14,16,22,27,33,35,38,44,50])+
  '<path d="M'+(vw/2-22)+' 470 q-30 4 -26 34 q-26 12 -8 40 q-8 30 26 30 q16 16 36 0 q32 2 26 -30 q20 -26 -8 -40 q4 -32 -26 -34 q-10 -12 -20 0z" fill="#5fbf5a" stroke="#233247" stroke-width="2.5"/><rect x="'+(vw/2-10)+'" y="560" width="12" height="60" fill="#8a5a3a" stroke="#233247" stroke-width="2.5"/></g>'+
  '<path d="M0 606 h'+vw+' v194 H0z" fill="#8fd27a"/><path d="M0 606 q'+(vw/4)+' -12 '+(vw/2)+' 0 t'+(vw/2)+' 0 v14 H0z" fill="#a9e08f"/><path d="M0 700 q'+(vw/2)+' -30 '+vw+' 0 v100 H0z" fill="#e9d9b6"/>'+
  (full?'<g stroke="#233247" stroke-width="2.5" transform="translate('+(W?360:0)+' 0)"><rect x="250" y="640" width="120" height="12" rx="3" fill="#e0a85a"/><rect x="250" y="618" width="120" height="10" rx="3" fill="#e0a85a"/><path d="M262 628 v40 M358 628 v40" stroke-width="5" stroke-linecap="round"/></g><g transform="translate(0 '+(W?60:66)+')'+(W?' scale(2.5 1.3)':'')+'">'+flags()+'</g>':'');},
 tele:function(W,vw,full){var b='';for(var x=10;x<vw;x+=26)b+='<circle cx="'+x+'" cy="'+(W?70:74)+'" r="5" fill="'+((x/26|0)%2?'#fff3b8':'#f2a900')+'"/>';
  return '<defs><radialGradient id="lkSt" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#3a4fc0"/><stop offset=".55" stop-color="#1a2666"/><stop offset="1" stop-color="#0b1233"/></radialGradient><linearGradient id="lkBm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b8" stop-opacity=".5"/><stop offset="1" stop-color="#fff3b8" stop-opacity="0"/></linearGradient></defs>'+
  '<rect width="'+vw+'" height="800" fill="url(#lkSt)"/>'+
  '<path d="M'+(vw*.15)+' -20 L'+(vw*.02)+' 700 h'+(vw*.3)+'z" fill="url(#lkBm)" opacity=".55"/><path d="M'+(vw*.85)+' -20 L'+(vw*.98)+' 700 h-'+(vw*.3)+'z" fill="url(#lkBm)" opacity=".55"/><path d="M'+(vw*.5)+' -20 L'+(vw*.3)+' 760 h'+(vw*.4)+'z" fill="url(#lkBm)" opacity="'+(full?.8:.35)+'"/>'+
  (full?'<path d="M0 0 h'+(W?90:46)+' q-14 300 6 640 q-30 20 -52 10z" fill="#a3152f"/><path d="M'+vw+' 0 h-'+(W?90:46)+' q14 300 -6 640 q30 20 52 10z" fill="#a3152f"/><path d="M'+(W?30:14)+' 0 q-8 300 4 630 M'+(vw-(W?30:14))+' 0 q8 300 -4 630" stroke="#6e0d1f" stroke-width="5" fill="none"/><rect x="0" y="'+(W?56:60)+'" width="'+vw+'" height="28" fill="#7c1228"/>'+b:'')+
  '<ellipse cx="'+(vw/2)+'" cy="790" rx="'+(vw*.75)+'" ry="150" fill="#0a1030"/><ellipse cx="'+(vw/2)+'" cy="790" rx="'+(vw*.62)+'" ry="120" fill="none" stroke="#f4c542" stroke-width="3" opacity=".7"/><ellipse cx="'+(vw/2)+'" cy="800" rx="'+(vw*.45)+'" ry="86" fill="#1d2b74" opacity=".8"/>'+
  '<g fill="#fff" opacity=".7"><circle cx="'+(40*vw/400)+'" cy="140" r="1.6"/><circle cx="'+(360*vw/400)+'" cy="180" r="1.6"/><circle cx="'+(90*vw/400)+'" cy="260" r="1.6"/><circle cx="'+(310*vw/400)+'" cy="110" r="1.6"/><circle cx="'+(200*vw/400)+'" cy="130" r="1.6"/></g>';},
 doska:function(W,vw,full){var C='fill="none" stroke="#f8f5ea" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".42"';
  return '<defs><radialGradient id="lkBd" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#3a6b57"/><stop offset="1" stop-color="#27503f"/></radialGradient></defs>'+
  '<rect width="'+vw+'" height="800" fill="url(#lkBd)"/><g fill="#fff" opacity=".05"><ellipse cx="'+(vw*.3)+'" cy="300" rx="'+(vw*.4)+'" ry="60" transform="rotate(-8 '+(vw*.3)+' 300)"/><ellipse cx="'+(vw*.7)+'" cy="560" rx="'+(vw*.4)+'" ry="50" transform="rotate(6 '+(vw*.7)+' 560)"/></g>'+
  (full?'<g '+C+'><path d="M'+(vw-90)+' 120 l10 22 l24 3 l-18 16 l5 24 l-21 -12 l-21 12 l5 -24 l-18 -16 l24 -3z"/><path d="M30 150 h60 M60 150 v40 M36 190 h48"/><circle cx="'+(vw-60)+'" cy="330" r="22"/><path d="M'+(vw-60)+' 300 v-12 M'+(vw-60)+' 372 v-12 M'+(vw-90)+' 330 h-12 M'+(vw-18)+' 330 h-12"/><path d="M24 380 q20 -30 40 0 t40 0"/></g>'+
   '<text x="'+(vw-120)+'" y="250" font-family="KF,sans-serif" font-weight="800" font-size="34" fill="#ffe08a" opacity=".5" transform="rotate(-8 '+(vw-120)+' 250)">5+</text><text x="26" y="290" font-family="KF,sans-serif" font-weight="700" font-size="22" fill="#f8f5ea" opacity=".4">2 × 2 = ?</text>':'')+
  '<rect x="0" y="772" width="'+vw+'" height="28" fill="#8a5a30"/><rect x="0" y="768" width="'+vw+'" height="6" fill="#b98652"/><rect x="'+(vw*.12)+'" y="758" width="34" height="10" rx="3" fill="#f8f5ea"/><rect x="'+(vw*.12+44)+'" y="758" width="26" height="10" rx="3" fill="#ffe08a"/><rect x="'+(vw*.78)+'" y="750" width="56" height="18" rx="4" fill="#d9a15a"/><rect x="'+(vw*.78)+'" y="750" width="56" height="7" rx="3" fill="#f3e2c4"/>';}
};
var sKind='full',sKey='';
function scene(kind){if(kind)sKind=kind;var el=document.getElementById('scene');if(!el)return;if(!on()){if(el.innerHTML){el.innerHTML='';sKey='';}return;}
 var app=document.getElementById('app')||D,w=app.clientWidth||innerWidth,h=app.clientHeight||innerHeight,W=w>=700&&w>=h,vw=W?1000:400,id=thId(),k=id+sKind+W;
 if(k===sKey)return;sKey=k;
 el.innerHTML='<svg viewBox="0 0 '+vw+' 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+SCN[id](W,vw,sKind==='full')+'</svg>';}
var rT=0;window.addEventListener('resize',function(){clearTimeout(rT);rT=setTimeout(function(){sKey='';scene();},120);});
/* лучи за окном итогов (праздник) — тоже SVG, без conic-gradient (старые WebView) */
function rays(){var s='';for(var i=0;i<18;i++){var a=i*20*Math.PI/180,b=(i*20+9)*Math.PI/180;s+='<path d="M500 500 L'+(500+900*Math.cos(a)).toFixed(0)+' '+(500+900*Math.sin(a)).toFixed(0)+' L'+(500+900*Math.cos(b)).toFixed(0)+' '+(500+900*Math.sin(b)).toFixed(0)+'z"/>';}
 return '<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="var(--ray)">'+s+'</g></svg>';}

/* ---------- эмодзи → значки на лету ---------- */
var KEYS=Object.keys(MAP).sort(function(a,b){return b.length-a.length;});
var RE=new RegExp('(?:'+KEYS.map(function(k){return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+')\uFE0F?','g');
var SKIP={qText:1,answers:1};
function skip(el){for(var e=el;e&&e!==document.body;e=e.parentNode){var t=e.nodeName;if(t==='LK-I'||t==='LK-T'||t==='SCRIPT'||t==='STYLE'||t==='TEXTAREA'||e.namespaceURI==='http://www.w3.org/2000/svg')return true;if(e.id&&SKIP[e.id])return true;}return false;}
var IHC={};
function iconHtml(k){return IHC[k]||(IHC[k]=ic(k));}
function fixText(n){var v=n.nodeValue;if(!v)return;RE.lastIndex=0;if(!RE.test(v))return;if(skip(n.parentNode))return;
 RE.lastIndex=0;var f=document.createDocumentFragment(),last=0,m;
 while((m=RE.exec(v))){if(m.index>last)f.appendChild(document.createTextNode(v.slice(last,m.index)));
  var key=MAP[m[0].replace('\uFE0F','')];var i=document.createElement('lk-i');i.setAttribute('data-k',key);i.innerHTML=iconHtml(key);f.appendChild(i);
  var t=document.createElement('lk-t');t.textContent=m[0];f.appendChild(t);last=m.index+m[0].length;}
 if(last<v.length)f.appendChild(document.createTextNode(v.slice(last)));
 if(n.parentNode)n.parentNode.replaceChild(f,n);}
function scan(root){if(!root)return;if(root.nodeType===3){fixText(root);return;}if(root.nodeType!==1)return;
 var w=document.createTreeWalker(root,4,null,false),a=[],n;while((n=w.nextNode()))a.push(n);for(var i=0;i<a.length;i++)fixText(a[i]);}
function watch(){var app=document.getElementById('app');if(!app||!window.MutationObserver)return;scan(app);
 new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==='characterData')fixText(m.target);else for(var j=0;j<m.addedNodes.length;j++)scan(m.addedNodes[j]);}})
  .observe(app,{childList:true,subtree:true,characterData:true});}
// значки поменялись (тема перекрасила лица соседа/Зины) — перерисовать уже вставленные
function reIcons(){IHC={};var q=document.querySelectorAll('lk-i[data-k^="face:"]');for(var i=0;i<q.length;i++)q[i].innerHTML=iconHtml(q[i].getAttribute('data-k'));}

/* ---------- ранняя тема (до отрисовки): та же логика выбора, что в themes.js, но только по сохранению ---------- */
function early(){var id='dvor';try{var o=JSON.parse(localStorage.getItem('viktorina-v1')||'{}')||{};
  var m=/[?&]theme=([a-z0-9_]+)/.exec(location.search),loc=/^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(location.hostname);
  var want=loc&&m?m[1]:o.th||'dvor',u=o.thU||{},b=o.buy||{};
  if(want==='classic'||want==='dvor'||(loc&&m)||u[want]||(want==='tele'&&b.th_tele)||(want==='doska'&&(o.adTot||0)>=15))id=want;}catch(e){}
 setCls(id);}
function setCls(id){var c=D.classList;c.remove('lk','th-tele','th-doska','th-dark');if(id==='classic')return;c.add('lk');if(id==='tele')c.add('th-tele','th-dark');if(id==='doska')c.add('th-doska');}
early();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();

window.LK={ic:ic,IC:IC,MAP:MAP,who:who,face:face,on:on,scene:scene,rays:rays,setCls:function(id){setCls(id);BC={};sKey='';scene();reIcons();},th:thId,scan:scan};
})();
