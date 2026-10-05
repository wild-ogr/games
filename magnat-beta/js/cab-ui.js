/* ================= «Из ларька в магнаты: бизнес» — Кабинет героя (M8): вещи, Стена почёта, звание магната; окно награды REW и очередь наград =================
   Модель вещей — ECON.LUX (js/biz.js), звания/стена/наборы/итоги недели — GAME (js/game.js). Здесь — только вид и порядок окон.
   CAB.open(tab) — окно «Кабинет» (tab: 'lx' вещи | 'wall' стена | 'rk' звания), CAB.card() — карточка для «Сегодня» и карты недр (зовёт META.card),
   CAB.chLine(st) — строка «фото на стену» для окна новой главы, CAB.badge() — значок ★ в шапке.
   REW.show(o) — единое окно награды («Забрать» — главная, «📺 ×2» — вторая светлая, как в Козле/Зине/Гастрономе). Награда зачисляется при показе окна,
   ×2 доплачивает ещё столько же только после досмотра. Очередь REWQ: звание, набор, итог недели — одним окном, не чаще раза в 90 с,
   не поверх других окон, пролога, обучения и рекламы (мелочь — тостом). Реклама — только кнопкой при adOk(). Шрифт 17–18 px, кнопки ≥ 48 px, без inset и flex-gap. */
(function(){
'use strict';
if(typeof ECON==='undefined'||!window.GAME)return;
const E=ECON,$c=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const T=(ru,en)=>L(ru,en),cr=n=>n+' 💎';
const snd=k=>{try{(SND[k]||SND.tap)();}catch(e){}};
const ad=()=>{try{return typeof adOk==='function'&&adOk();}catch(e){return false;}};
const W=()=>GAME.W;
const fem=()=>{try{return !!(window.HERO&&HERO.fem&&HERO.fem());}catch(e){return false;}};
const hg=(m,f)=>fem()?f:m;
const calmMode=()=>{try{return typeof calm==='function'&&calm();}catch(e){return false;}};
const sponsor=()=>{try{return typeof PAY!=='undefined'&&PAY.own('sponsor');}catch(e){return false;}};
const M=x=>FMT.money(x);
let tab='lx',slotOpen='',cssOn=false;

/* ---------- стиль (префикс cb-) ---------- */
function css(){if(cssOn)return;cssOn=true;const s=document.createElement('style');s.id='cabCss';s.textContent=`
.cb-card{background:var(--card,#fff);color:var(--ink,#1d2733);border:1px solid var(--line,#e3e7ee);border-left:5px solid var(--gold,#b8860b);border-radius:var(--r2,16px);padding:12px 14px;margin:0 0 10px;font-size:17px;line-height:1.35}
.cb-card h4{margin:0 0 4px;font-size:18px;font-weight:700}
.cb-mut{color:var(--muted,#5a6675);font-size:16px}
.cb-row{display:flex;align-items:center;flex-wrap:wrap}.cb-row>*{margin:4px 8px 4px 0}
.cb-f1{flex:1 1 170px;min-width:0}
.cb-bar{height:10px;border-radius:6px;background:var(--track,#e4e7ec);overflow:hidden;margin:6px 0 2px}
.cb-bar i{display:block;height:100%;background:var(--gold,#b8860b);border-radius:6px}
.cb-btn{min-height:48px;padding:8px 14px;border-radius:12px;border:1px solid var(--line2,#d0d5dd);background:var(--card,#fff);color:var(--ink,#1d2733);font:inherit;font-size:17px;font-weight:600;cursor:pointer}
.cb-btn.go{background:var(--good,#2e7d32);border-color:var(--good,#2e7d32);color:#fff}
.cb-btn.gd{background:#fff4d6;border:2px solid #f0a020;color:#7a3f05}
.cb-btn[disabled]{opacity:.55;cursor:default}
.cb-say{font-size:16px;color:var(--muted,#5a6675);margin:2px 0 4px;font-style:italic}
.cb-now{font-size:22px;letter-spacing:2px;line-height:1.2}
#rkBtn{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:48px;height:44px;margin:0 10px 0 0;padding:0 10px;border-radius:14px;border:0;background:var(--hd-btn,#eef1f4);color:var(--hd-ink,var(--ink,#1d2733));font:inherit;font-weight:800;font-size:18px;white-space:nowrap;cursor:pointer}
.cb-new{background:var(--accent-t,#eaefff);border-radius:16px;padding:10px 14px;margin:0 0 10px}.cb-new ul{margin:6px 0 0;padding-left:4px;list-style:none}.cb-new li{margin:4px 0;font-size:16px}.cb-new small{font-size:15px;color:var(--ink2)}
#rkBtn .rkS{color:var(--gold,#b8860b);margin-right:2px}body.th-office #rkBtn{color:#ffd66b}body.th-office #rkBtn .rkS{color:#ffd66b}body.th-90s #rkBtn{color:var(--hd-ink,#1d2733)}
#rkBtn i{position:absolute;right:2px;top:6px;width:10px;height:10px;border-radius:50%;background:var(--bad,#c62828);display:none}
#rkBtn.dot i{display:block}#rkBtn i.n{width:auto;height:auto;min-width:20px;right:-4px;top:-4px;padding:0 5px;font:700 14px/20px Arial,sans-serif;font-style:normal;color:#fff!important;background:#c62828!important;text-align:center;border-radius:10px}
.cb-top{text-align:center;margin:0 0 8px}
.cb-top b{font-size:22px;display:block;line-height:1.25}
.cb-tabs{display:flex;flex-wrap:wrap;margin:8px 0 10px}
.cb-tabs button{flex:1 1 30%;min-width:96px;min-height:52px;margin:0 6px 6px 0;border-radius:14px;border:2px solid var(--line,#e3e7ee);background:var(--soft,#f2f4f7);color:var(--ink,#1d2733);font:inherit;font-size:17px;font-weight:700;cursor:pointer}
.cb-tabs button.on{border-color:var(--gold,#b8860b);background:var(--card,#fff)}
.cb-tabs button:last-child{margin-right:0}
.cb-tabs i.cb-tn{display:inline-block;min-width:22px;height:22px;line-height:22px;border-radius:11px;background:#d32f2f;color:#fff;font-size:14px;font-weight:700;font-style:normal;padding:0 5px;margin-left:6px;text-align:center;vertical-align:middle}
.cb-slots{display:flex;flex-wrap:wrap;margin:4px 0 8px}
.cb-slot{flex:0 0 auto;width:31.5%;min-height:96px;margin:0 2.75% 8px 0;padding:8px 6px;border-radius:14px;border:2px solid var(--line,#e3e7ee);background:var(--card,#fff);color:var(--ink,#1d2733);font:inherit;font-size:15px;line-height:1.2;cursor:pointer;text-align:center}
.cb-slot:nth-child(3n){margin-right:0}
.cb-slot b{display:block;font-size:32px;line-height:1.1;margin-bottom:2px}
.cb-slot span{display:block;font-weight:700;font-size:15px;color:var(--muted,#5a6675)}
.cb-slot small{display:block;font-size:15px;margin-top:2px}
.cb-slot.cb-many{border-color:var(--gold,#b8860b)}
.cb-it{display:flex;align-items:center;padding:10px 0;border-top:1px solid var(--line,#e3e7ee)}
.cb-it:first-child{border-top:0}
.cb-it>i{font-style:normal;font-size:32px;width:44px;flex:none;text-align:center;line-height:1}
.cb-it>div{flex:1 1 auto;min-width:0;padding:0 8px}
.cb-it b{font-size:18px;display:block;line-height:1.25}
.cb-it small{display:block;font-size:16px;color:var(--muted,#5a6675);line-height:1.3}
.cb-it .cb-side{flex:none;text-align:right;padding:0}
.cb-it .cb-side .cb-btn{display:block;margin:2px 0 2px auto}
.cb-it.dream>i{opacity:.8}
.cb-it.later>i{opacity:.6}
.cb-set{display:inline-block;font-size:15px;background:var(--soft,#f2f4f7);border-radius:8px;padding:1px 6px;margin:2px 4px 0 0;color:var(--ink,#1d2733)}
.cb-rep{display:block;font-size:16px;color:var(--good,#2e7d32);font-style:italic}
.cb-h{font-size:18px;margin:14px 0 4px}
.cb-wall{display:flex;flex-wrap:wrap;margin:4px 0}
.cb-gr{flex:0 0 31%;min-width:96px;min-height:104px;margin:0 2% 8px 0;padding:8px 4px;border-radius:10px;border:5px solid var(--wf,#8d5a2b);background:#fffaf0;color:#3b2a1a;font:inherit;font-size:15px;line-height:1.2;text-align:center;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.cb-gr b{display:block;font-size:30px;margin-bottom:4px}
.cb-gr.no{border-style:dashed;border-color:var(--line2,#d0d5dd);background:var(--soft,#f2f4f7);color:var(--muted,#5a6675)}
.cb-gr.no b{opacity:.75}
.cb-ph{flex:0 0 48%;min-width:136px;min-height:150px;margin:0 2% 8px 0;padding:8px;border-radius:12px;border:6px solid var(--wf,#8d5a2b);background:#fdf6e3;color:#3b2a1a;font:inherit;font-size:15px;line-height:1.25;text-align:center;cursor:pointer}
.cb-ph.gold{border-color:#d4a017;box-shadow:0 0 0 2px #f4d58d}
.cb-ph.no{border-style:dashed;border-color:var(--line2,#d0d5dd);background:var(--soft,#f2f4f7);color:var(--muted,#5a6675)}
.cb-scn{display:flex;justify-content:center;align-items:center;min-height:64px}
.cb-scn>b{font-size:40px;line-height:1;margin:0 4px}
.cb-scn .cb-fc{display:inline-block;width:40px;height:40px;border-radius:50%;overflow:hidden;margin:0 -4px;border:2px solid #fff;background:#eceff2;vertical-align:middle}
.cb-scn .cb-fc svg{width:100%;height:100%;display:block}
.cb-ph.no .cb-scn{opacity:.8}
.cb-cup{flex:0 0 23%;min-width:72px;min-height:96px;margin:0 2% 8px 0;padding:6px 2px;border-radius:12px;border:2px solid var(--line,#e3e7ee);background:var(--card,#fff);color:var(--ink,#1d2733);font:inherit;font-size:15px;line-height:1.2;text-align:center;cursor:pointer}
.cb-cup b{display:block;font-size:34px}
.cb-rk{display:flex;align-items:center;padding:8px 6px;border-top:1px solid var(--line,#e3e7ee);font-size:17px}
.cb-rk:first-child{border-top:0}
.cb-rk>span:first-child{width:40px;flex:none;font-weight:800;color:var(--gold,#b8860b);text-align:center}
.cb-rk>span.f{flex:1 1 auto;min-width:0}
.cb-rk small{display:block;color:var(--muted,#5a6675);font-size:15px}
.cb-rk.cur{background:#fff4d6;border-radius:12px}
.cb-rk.done{color:var(--muted,#5a6675)}
.cb-big{text-align:center}
.cb-big .cb-e{font-size:64px;line-height:1.1}
.cb-big h2{font-size:22px;margin:6px 0}
.rw{text-align:center}
.rw-e{font-size:64px;line-height:1.1;margin-top:4px}
.rw h2{font-size:22px;margin:6px 0 2px}
.rw-cr{font-size:32px;font-weight:800;color:var(--ink,#1d2733);margin:4px 0}
.rw ul{list-style:none;padding:0;margin:6px 0 10px;font-size:17px;line-height:1.4}
.rw ul li{margin:3px 0}
.rw .btn{display:block;width:100%;margin:8px 0 0}
.rw .btn.green{min-height:56px;font-size:20px}
.rw-note{font-size:16px;color:var(--muted,#5a6675);margin:8px 0 0}
.rw-link{display:inline-block;margin:12px 0 2px;font-size:16px;color:var(--blue,#1f5f99);text-decoration:underline;cursor:pointer;background:none;border:0;min-height:48px;padding:0 12px;font-family:inherit}
/* рисунки (js/art.js): вещи, грамоты, фото, кубки, герой — инлайн-SVG */
:root{--lxbg:#edf1fb}body.th-office{--lxbg:#d9dfe8}
.cb-slot b svg,.cb-it>i svg{display:block;width:44px;height:44px;margin:0 auto}
.cb-slot b svg{width:48px;height:48px}
.cb-now svg{display:inline-block;width:30px;height:30px;margin:0 4px 2px 0;vertical-align:middle}
.cb-now.cb-art{flex:1 1 100%;letter-spacing:0;white-space:nowrap}
.cb-ii svg{display:inline-block;width:1.5em;height:1.5em;vertical-align:-.4em;margin:0 2px}
.cb-gr b svg{display:block;width:56px;height:70px;margin:0 auto}
.cb-scn .cb-pic{display:block;width:100%;background:#fff;padding:3px;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,.18)}
.cb-scn .cb-pic svg{display:block;width:100%;height:auto}
.cb-ph .cb-scn{margin-bottom:6px}
.cb-cup b svg{display:block;width:44px;height:52px;margin:0 auto 2px}
.cb-big .cb-e svg{display:block;height:128px;width:auto;margin:0 auto}
.cb-big .cb-e .cb-pic{display:block;max-width:360px;margin:0 auto;background:#fff;padding:4px;border:6px solid var(--wf,#8d5a2b);border-radius:6px}
.cb-big .cb-e .cb-pic svg{height:auto;width:100%}
.rw-e svg{display:block;width:72px;height:84px;margin:0 auto}
.cb-hero{display:flex;align-items:center;text-align:left}
.cb-hf{flex:none;width:66px;height:110px;margin:0 12px 0 0;border-radius:14px;background:#e9eefb;overflow:hidden}
.cb-hf svg{display:block;width:100%;height:100%}
.cb-ht{flex:1 1 auto;min-width:0}
@media (max-width:400px),(max-height:600px){.cb-hf{width:52px;height:86px;margin-right:10px}.cb-top b{font-size:20px}}
.cb-hface{float:right;width:56px;height:56px;margin:0 0 4px 8px;border-radius:50%;overflow:hidden}
.cb-hface svg{display:block;width:100%;height:100%}
.cb-chp{display:block;width:150px;max-width:60%;margin:4px auto 6px;background:#fff;padding:3px;border:4px solid #8d5a2b;border-radius:4px}
.cb-chp svg{display:block;width:100%;height:auto}
/* телефон героя: пока в ходу «смартфон с трещиной» — на экране телефона тонкая трещина в углу (купили новый — трещины нет) */
body.cb-crack .ph-body{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cpath d='M220 0 L168 44 L176 70 L130 108 L140 128 L96 176 M168 44 L140 40 L118 60 M130 108 L104 104 M176 70 L206 92' fill='none' stroke='%23000' stroke-opacity='.22' stroke-width='1.6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right top}
@media (max-height:500px){.rw-e{font-size:40px}.rw h2{margin:2px 0}.rw-cr{font-size:26px;margin:0}.rw ul{font-size:16px;margin:2px 0 6px;line-height:1.3}.rw .btn.green{min-height:52px}.cb-big .cb-e{font-size:44px}}
@media (max-width:420px){.cb-it{flex-wrap:wrap}.cb-it>div{flex:1 1 60%}.cb-it .cb-side{flex:1 1 100%;display:flex;flex-wrap:wrap;justify-content:flex-end;padding:4px 0 0 44px}.cb-it .cb-side .cb-btn{margin:2px 0 2px 8px}}
@media (max-width:359px){.cb-gr{flex-basis:48%}.cb-ph{flex-basis:98%}.cb-slot{width:48.5%;margin-right:3%}.cb-slot:nth-child(3n){margin-right:3%}.cb-slot:nth-child(2n){margin-right:0}.cb-cup{flex-basis:31%}}
`;document.head.appendChild(s);}
const bar=f=>`<div class="cb-bar"><i style="width:${(Math.max(0,Math.min(1,f))*100).toFixed(1)}%"></i></div>`;

/* ---------- тексты ---------- */
const SLOT={home:['🏠','Жильё','Home'],car:['🚗','Транспорт','Transport'],phone:['📱','Телефон','Phone'],watch:['⌚','Часы','Watch'],look:['👔','Образ','Style'],rest:['🎣','Отдых','Leisure'],pet:['🐾','Питомец','Pet']};
const CHN={1:['Карьера','Career'],2:['Своё дело','My business'],3:['Сеть','Network'],4:['Карьер','Quarry'],5:['Недра','Mining'],6:['После IPO','After the IPO']};
const QL=()=>T('«','“'),QR=()=>T('»','”');
const chName=n=>CHN[n]?QL()+T(CHN[n][0],CHN[n][1])+QR():'';
const lxName=x=>x?T(x.ru,x.en):'';
// реплики при покупке: кто и что говорит (в строке вещи и сообщением в телефоне)
const REP={phone2:['lud','Наконец-то. Я читала ваши сообщения через паутину.','At last. I used to read your messages through a spider web.'],
  pt1:['vit','Кеша, скажи «прибыль»! …Сказал «налоги». Весь в хозяина.','Kesha, say “profit”! …He said “taxes”. Just like his owner.'],
  watch1:['vit','Идут, если не трясти.','They keep time, as long as you don’t shake them.'],
  suit1:['owl','Вот теперь похож на заёмщика.','Now you look like a borrower.','Вот теперь похожа на заёмщицу.'],
  h1:['beav','Своя комната! Соседи те же, зато замок свой.','Your own room! Same neighbours, but your own lock.'],
  car1:['beav','Ну хоть не на велосипеде.','Well, at least not on a bike.'],
  dacha:['lud','Помидоры — это тоже бизнес, только медленный.','Tomatoes are a business too, just a slow one.'],
  grill:['bars','Позовёшь на шашлык — привезу угли с разреза.','Invite me for a barbecue — I’ll bring coal from the pit.'],
  brief:['lud','Портфель есть — теперь бумаги в нём должны быть в порядке.','You’ve got the briefcase — now the papers inside must be in order.'],
  ph3:['vit','Три камеры! Сфоткай меня на фоне своей сети.','Three cameras! Take a photo of me in front of your chain.'],
  car2:['vit','Дадите порулить? Я аккуратно, я же таксист.','Can I have a drive? I’m careful, I’m a cab driver.'],
  h2:['lud','Двушка! Во второй комнате, надеюсь, будет кабинет, а не склад.','Two rooms! I hope the second one is an office, not a storeroom.'],
  watch2:['lud','Время — деньги. У вас теперь и то и другое.','Time is money. Now you have both.'],
  banya:['bars','Позовёте — приеду с вениками.','Invite me — I’ll come with the birch brooms.'],
  boat:['beav','Возьмёшь на рыбалку? Червей накопаю сам.','Take me fishing? I’ll dig the worms myself.'],
  paint1:['owl','Висит ровно. Проверила уровнем.','It hangs straight. I checked with a level.'],
  car2b:['beav','Водитель? Ты же сам любил за рулём…','A driver? But you used to love driving yourself…','Водитель? Ты же сама любила за рулём…'],
  dog:['lud','Он добрее вашего главного инженера.','He’s kinder than your chief engineer.'],
  ph4:['bars','Теперь дозвонюсь до тебя даже из забоя.','Now I can reach you even from the coal face.'],
  suv:['bars','Такой по разрезу пройдёт.','This one will get through the pit.'],
  lk3:['owl','Пальто — как у председателя правления. Банк одобряет.','A coat like a board chairman’s. The bank approves.'],
  watch3:['lud','Что такое турбийон, не знает никто, но звучит солидно.','Nobody knows what a tourbillon is, but it sounds respectable.'],
  house:['lud','Камин — это хорошо. Главное — не топить им отчётами.','A fireplace is nice. Just don’t burn the reports in it.'],
  teplica:['lud','Помидоры в феврале — вот это статус.','Tomatoes in February — now that’s status.'],
  gift_l:['lud','Я их надену на совет директоров. Спасибо… Я не плачу, это ветер.','I’ll wear it to the board meeting. Thank you… I’m not crying, it’s the wind.'],
  paint2:['owl','Очень хорошая копия. Оригинал бы столько не стоил… в смысле, стоил бы больше.','A very good copy. The original wouldn’t cost that… I mean, it would cost more.'],
  h4:['vit','Пентхаус! А лифт до самого верха? Я проверю.','A penthouse! Does the lift go all the way up? I’ll check.'],
  gym11:['beav','Новый спортзал в нашей школе! Физрук плакал. Я тоже, но тихо.','A new gym at our school! The PE teacher cried. So did I, but quietly.'],
  yacht:['beav','Возьмёшь на рыбалку? Я свою лодку продал.','Will you take me fishing? I sold my boat.'],
  heli:['lud','Совещание теперь можно проводить над Кузбассом.','Now we can hold meetings above Kuzbass.'],
  hockey:['vit','Проиграли 2:7, зато болельщики довольны! Беру абонемент.','We lost 2–7, but the fans are happy! I’m buying a season ticket.']};
const SET_N=k=>{const c=GAME.COL[k];return c?c.ico+' '+T(c.ru,c.en):'';};
const SET_B={dacha:['эмблема 🌻, +10 💎','🌻 emblem, +10 💎'],solid:['раз в день можно заменить поручение Планёрки','once a day you can swap a Briefing task'],auto:['номер «777» на все машины бесплатно','free “777” plates on all cars'],hobby:['эмблема ⚓, +10 💎','⚓ emblem, +10 💎'],patron:['грамота «Почётный гражданин», +10 💎','“Honorary citizen” certificate, +10 💎']};
// M30: во втором и следующих холдингах карьера нет — звание «Человек с карьером» там звучит странно, показываем «Человек с размахом»
const RK_H2={8:['Человек с размахом','Женщина с размахом','A person of scope']};
function rkName(i){const r=GAME.RK[i];if(!r)return '';const w=W(),h2=w&&w.hold>=2&&RK_H2[i];if(typeof LANG!=='undefined'&&LANG==='en')return h2?h2[2]:r.en;if(h2)return fem()?h2[1]:h2[0];return fem()&&GAME.RK_F[i]?GAME.RK_F[i]:r.ru;}
function cosTxt(id){const c=GAME.COS.find(x=>x.id===id);if(!c)return '';const n=T('«','“')+T(c.ru,c.en)+T('»','”');
  if(c.k==='fr')return n+T(' для портрета Людмилы',' for Lyudmila’s portrait');if(c.k==='wf')return T('рамка стены ','wall frame ')+n;
  return (c.k==='emb'?T('эмблема ','emblem ')+c.ic+' ':T('цвет вывесок ','sign colour '))+n;}
function rkPrize(i){const r=GAME.RK[i];if(!r)return '';const a=[];if(r.cr)a.push('+'+cr(r.cr));if(r.cos)a.push(cosTxt(r.cos));return a.join(' · ');}
// грамоты: название, эмодзи, глава, шутка
const ACHN={z_gig1:['📦','Первый заказ','First order',1,'Выдана курьером самому себе.','Issued by the courier to himself.'],z_rt48:['⭐','Рейтинг 4,8','Rating 4.8',1,'Клиенты довольны. Даже тот, с третьего этажа.','Clients are happy. Even the one on the third floor.'],
  z_ip:['📝','Своё ИП','Sole trader',1,'Налоговая теперь знает вас по имени.','The tax office now knows you by name.'],z_biz1:['☕','Первое своё дело','First business',2,'Автомат варит кофе, а вы — планы.','The machine brews coffee, you brew plans.'],
  z_quit:['🚪','Сам себе начальник','Your own boss',2,'Уволились с работы. Начальник до сих пор не верит.','Quit the job. The boss still can’t believe it.'],z_mgr1:['🤝','Первый управляющий','First manager',2,'Теперь есть кому звонить в семь утра.','Now there’s someone to call at 7 a.m.'],
  z_ooo:['🏢','ООО','The LLC',3,'Печать заказана, ручка с гравировкой ждёт.','The company seal is ordered, the engraved pen awaits.'],z_chain:['🔗','Первая сеть','First chain',3,'Три одинаковые вывески — это уже бренд.','Three identical signs make a brand.'],
  z_truck:['🚛','Первый самосвал','First dump truck',3,'Витя просится за руль. Не давайте.','Vitya wants to drive it. Don’t let him.'],z_opi:['📜','Лицензия на карьер','Quarry licence',4,'Бумага толще, чем кажется.','The paper is thicker than it looks.'],
  z_quarry:['⛰','Первый карьер','First quarry',4,'Щебень — это камень, у которого получилось.','Gravel is a stone that made it.'],z_nedra:['⛏','Выход в недра','Into mining',5,'Под землёй тоже есть биржа — только тише.','There’s a market underground too, just quieter.'],
  expl:['🔎','Первая разведка','First exploration',5,'Геологи нашли что-то. Что — расскажут за премию.','The geologists found something. They’ll tell you for a bonus.'],lic:['📜','Первая лицензия на недра','First mining licence',5,'Теперь у вас есть право копать. И обязанность отчитываться.','Now you have the right to dig. And the duty to report.'],
  profit:['📈','Первая прибыль в недрах','First mining profit',5,'Людмила Санна проверила дважды. Правда прибыль.','Lyudmila Sanna checked twice. It really is a profit.'],year:['🗓','Год в недрах','A year in mining',5,'Двенадцать отчётов — и ни одного пропущенного.','Twelve reports and not one missed.']};
const MILE_J=[['Выдана Людмилой Санной под расписку.','Issued by Lyudmila Sanna against a signature.'],['Висит ровно — Соня проверила уровнем.','Hangs straight — Sonya checked with a level.'],['Борис сказал: «Повезло». Людмила сказала: «Заработал».','Boris said “lucky”. Lyudmila said “earned”.'],['Мама бы гордилась. Мама и гордится.','Mum would be proud. Mum is proud.']];
const MCH={gig:1,small:2,mid:3,quarry:4,nedra:5};
function gramInfo(k){const w=S.wall&&S.wall[k];
  if(ACHN[k]){const a=ACHN[k];return {ico:a[0],t:T(a[1],a[2]),ch:a[3],j:T(a[4],a[5]),w};}
  if(k.indexOf('b_')===0){const t=k.slice(2);let n=t;try{n=NM.obj(t);}catch(e){}return {ico:'🏗',t:T('Первый объект: ','First site: ')+n,ch:5,j:T('Ленточку резали втроём: вы, Людмила Санна и прораб.','Three cut the ribbon: you, Lyudmila Sanna and the foreman.'),w};}
  if(k.indexOf('ms_')===0){const id=k.slice(3);for(const st in E.MILES){const i=E.MILES[st].findIndex(m=>m[0]===id);if(i>=0){const m=E.MILES[st][i],j=MILE_J[i%MILE_J.length];
        return {ico:'🎯',t:T(m[1],m[2]),ch:MCH[st]||1,j:T(j[0],j[1]),w};}}}
  if(k==='g_patron')return {ico:'🏛',t:T('Почётный гражданин','Honorary citizen'),ch:5,j:T('Картины, спортзал — город запомнит. Особенно физрук.','Paintings, a gym — the town will remember. Especially the PE teacher.'),w};
  if(k.indexOf('g_ud_')===0)return {ico:'🏅',t:T('Ударник недели','Worker of the week'),ch:0,j:T('Пять дней Планёрки без единого «потом».','Five Briefing days without a single “later”.'),w,wk:k.slice(5)};
  return {ico:'📜',t:k,ch:0,j:'',w};}
const PHN={ph_gig1:['Первый заказ','First order','Выполните первый заказ','Complete your first order','Людмила Санна сфотографировала: «Для истории. Через двадцать лет будете смеяться».','Lyudmila Sanna took the photo: “For history. In twenty years you’ll laugh.”'],
  ph_small:['У своего автомата','By my own machine','Откройте своё дело','Open your own business','Первый стакан кофе — себе. Второй — Людмиле Санне.','The first cup of coffee is yours. The second is Lyudmila Sanna’s.'],
  ph_mid:['Разрезаем ленточку ООО','Cutting the LLC ribbon','Зарегистрируйте ООО','Register the LLC','Ножницы взяли у Сони. Вернули через год.','Scissors borrowed from Sonya. Returned a year later.'],
  ph_truck:['Первый самосвал','First dump truck','Купите первый самосвал','Buy the first dump truck','Витя сидит за рулём «просто посидеть».','Vitya sits behind the wheel “just to sit”.'],
  ph_quarry:['В каске на карьере','In a hard hat at the quarry','Дойдите до главы «Карьер»','Reach the “Quarry” chapter','Пётр поправил каску: «Теперь похоже».','Pyotr straightened the hat: “Now you look the part.”'],
  ph_home:['Новоселье','Housewarming','Купите дом за городом','Buy the country house','Борис принёс кота «на счастье». Кот остался.','Boris brought a cat “for luck”. The cat stayed.'],
  ph_nedra:['Первый день в недрах','First day in mining','Выйдите в недра','Go into mining','Под землёй связи нет, но Людмила Санна всё равно дозвонилась.','No signal underground, but Lyudmila Sanna got through anyway.'],
  ph_ipo:['Звонок на бирже','Ringing the exchange bell','Выведите холдинг на биржу','Take the holding public','В колокол звонили вдвоём: вы и 11 «Б».','Two rang the bell: you and class 11B.']};
function phInfo(k){const w=S.wall&&S.wall[k];if(k==='ph_meet_10')return {ico:'🎓',t:T('Пари 11 «Б»: встреча через 10 лет','The 11B bet: 10-year reunion'),who:['owl','beav','bars','vit'],w,ch:0,j:T('Поспорили, кто через пять лет будет богаче. Спор записан на салфетке, салфетка — у Сони.','We bet on who’d be richest in five years. The bet is written on a napkin; Sonya keeps the napkin.')};
  if(k.indexOf('ph_meet_')===0){const y=+k.slice(8);return {ico:'🎓',t:T('Встреча выпускников: '+y+' '+plural(y,'год','года','лет'),'Class reunion: '+y+' years'),who:['owl','beav','bars','vit'],w,ch:0,j:T('Все пришли. Даже Витя — вовремя.','Everyone came. Even Vitya — on time.')};}
  const p=GAME.PH.find(x=>x.k===k),n=PHN[k]||[k,k,'','','',''];return {ico:p?p.ico:'📷',t:T(n[0],n[1]),need:T(n[2],n[3]),j:T(n[4],n[5]),who:p?p.who:[],ch:p?p.ch:0,w,gold:GAME.phGold(k)};}
function cupInfo(k){const w=S.wall&&S.wall[k]||{};if(k.indexOf('cup_w_')===0){const t=w.w|0,n=[[],['🥉','Бронза недели','Bronze of the week'],['🥈','Серебро недели','Silver of the week'],['🥇','Золото недели','Gold of the week']][t]||['🥉','',''];
    return {ico:n[0],t:T(n[1],n[2]),sub:wkLbl(k.slice(6)),j:T('Капитал за неделю вырос — кубок на полку.','Equity grew over the week — a cup for the shelf.')};}
  if(k.indexOf('cup_11b_')===0){const y=+k.slice(8);return {ico:'🏆',t:T('Кубок 11 «Б»','Class 11B Cup'),sub:T('встреча «'+y+' '+plural(y,'год','года','лет')+'»',y+'-year reunion'),j:T('Капитал больше, чем у Бориса. Борис требует пересчёта.','Equity bigger than Boris’s. Boris demands a recount.')};}
  if(k.indexOf('cup_plan_')===0)return {ico:'🏆',t:T('Кубок Планёрки','Briefing Cup'),sub:wkLbl(k.slice(9)),j:T('Четыре недели подряд — «Ударник». Людмила Санна повесила кубок сама.','Four weeks in a row as “Worker of the week”. Lyudmila Sanna hung the cup herself.')};
  return {ico:'🏆',t:k,sub:'',j:''};}
// «2026-W40» → «29 сен – 5 окт»
function wkLbl(k){const m=/^(\d{4})-W(\d{2})$/.exec(k||'');if(!m)return '';const y=+m[1],w=+m[2],j4=new Date(Date.UTC(y,0,4)),d0=(j4.getUTCDay()+6)%7,mon=new Date(j4.getTime()+((w-1)*7-d0)*864e5),sun=new Date(mon.getTime()+6*864e5);
  const MS=typeof LANG!=='undefined'&&LANG==='en'?['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']:['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  return mon.getUTCDate()+' '+MS[mon.getUTCMonth()]+' – '+sun.getUTCDate()+' '+MS[sun.getUTCMonth()];}
function faces(ids){let h='';for(const id of ids||[]){let s='';try{s=id==='lud'&&window.UI&&UI.face?UI.face('happy'):window.friendSvg?friendSvg(id,'happy'):'';}catch(e){s='';}
    if(s)h+=`<span class="cb-fc">${s}</span>`;}return h;}
// рисунки: есть ART — SVG, нет — эмодзи, как было
const ART=()=>window.ART||null;
function lxIco(x,mode){const A=ART();return A&&A.has(x.id)?A.lux(x.id,mode==='dream'?{ghost:1}:mode==='later'?{sil:1}:null):x.ico;}
// каким был герой на фото: снимок при получении (S.wall[k].hr), иначе — по главе фото (текущая глава — как сейчас)
const HR_CH={1:['lk0','w0'],2:['lk0','w0'],3:['suit1','watch1'],4:['brief','watch2'],5:['lk3','watch3']};
function heroAt(k,info){const A=ART(),me=A.me(),w=S.wall&&S.wall[k];if(w&&w.hr&&typeof w.hr==='object')return {g:me.g,st:w.hr.st||me.st,lk:w.hr.lk||me.lk,wt:w.hr.wt||me.wt};
  const ch=info&&info.ch;if(!ch||ch>=me.st)return me;const d=HR_CH[ch]||HR_CH[1];return {g:me.g,st:ch,lk:d[0],wt:d[1]};}
function scn(k,info,got){const A=ART();if(!A)return `<b>${info.ico}</b>${faces(info.who)}`;return `<span class="cb-pic">${A.scene(k,{ghost:!got,hero:heroAt(k,info)})}</span>`;}
function cupKind(k){const w=S.wall&&S.wall[k]||{};return k.indexOf('cup_w_')===0?['w',w.w|0]:k.indexOf('cup_11b_')===0?['11b',3]:k.indexOf('cup_plan_')===0?['plan',3]:k==='g_patron'?['patron',3]:k.indexOf('g_ud_')===0?['ud',3]:['w',3];}
function cupIco(k,emo){const A=ART();if(!A)return emo;const c=cupKind(k);return A.cup(c[0],c[1]);}
function gramIco(info,got){const A=ART();return A?A.gram(got?info.ico:'?',{ghost:!got}):info.ico;}
const dateTxt=w=>w&&typeof w.m==='number'?FMT.date(w.m)+(w.h>1?' · '+T('холдинг №','holding #')+w.h:''):'';

/* ---------- вещи ---------- */
function st(id){return E.luxState(W(),id);}
function lxList(){return E.LUX.filter(x=>x.p>0);}
function etaTxt(nd){if(!nd||nd.k!=='eq'||nd.cur>=nd.need)return '';const n=GAME.eta(nd.need,nd.cur);if(n==null)return '';const d=n/24;   // ≈ 24 игровых месяца в реальный день
  if(d<.2)return T('≈ пара часов игры','≈ a couple of hours of play');if(d<.7)return T('≈ полдня игры','≈ half a day of play');if(d<1.5)return T('≈ день игры','≈ a day of play');
  const k=Math.round(d);return '≈ '+pl(k,'день','дня','дней','day','days')+T(' игры',' of play');}
function needTxt(x,nd){if(!nd)return '';const v=nd.need;switch(nd.k){
  case 'eq':return T('когда капитал ','when equity is ')+M(v)+' · '+T('сейчас ','now ')+M(nd.cur);
  case 'ach':return nd.v==='z_biz1'?T('когда откроете своё дело','when you open your own business'):T('после достижения','after an achievement');
  case 'pts':return T(`когда будет ${v} ${plural(v,'точка','точки','точек')} · сейчас ${nd.cur}`,`at ${v} outlets · now ${nd.cur}`);
  case 'gigs':return T(`после ${v} заказов · сейчас ${nd.cur}`,`after ${v} jobs · now ${nd.cur}`);   // M17: удобная кровать
  case 'city':return T('когда откроете дело во втором городе','when you open in a second city');
  case 'has':{const p=E.luxOf(nd.v);return T('к вещи: ','goes with: ')+(p?p.ico+' '+lxName(p):'');}
  case 'stg':return T('в главе ','in chapter ')+chName(E.STAGES.indexOf(nd.v)+1);
  case 'opi':return T('когда получите лицензию на карьер','when you get the quarry licence');
  case 'pit':return T('когда заработает карьер','when the quarry is running');
  case 'nobj':return T('когда заработает первый объект недр','when your first mining site runs');
  case 'nyear':return T('после первого года недр с прибылью','after the first profitable year in mining');
  case 'hold':return v<=2?T('после первого IPO','after the first IPO'):T('после второго IPO','after the second IPO');}return '';}
function setBadge(x){if(!x.set)return '';const a=E.LUX_SET[x.set],n=a.filter(id=>S.lxE&&S.lxE[id]).length;return `<span class="cb-set">${SET_N(x.set)} ${n} ${T('из','of')} ${a.length}</span>`;}
function decoOf(id){for(const k in GAME.LXC)if(GAME.LXC[k].ids.indexOf(id)>=0)return k;return '';}
function decoTxt(id){const k=decoOf(id);return k&&S.lxc&&S.lxc[k]?' '+GAME.LXC[k].ico:'';}
let repId='',repT=0;
function itemRow(x){const s=st(x.id),w=W();let cls='',side='',sub='';const use=x.s&&w.use&&w.use[x.s]===x.id;
  if(s.st==='own'){sub=x.p?M(x.p)+' · '+T('куплено','bought')+(typeof w.lx[x.id]==='number'?' '+FMT.date(w.lx[x.id]).toLowerCase():''):T('с самого начала','from the very start');
    side=x.s?(use?`<span class="cb-mut">✓ ${T('сейчас','in use')}</span>`:`<button class="cb-btn noenter" data-cb="use:${x.id}">${x.s==='home'?T('Переехать','Move in'):x.s==='car'?T('Пересесть','Switch'):x.s==='look'?T('Надеть','Wear'):T('Выбрать','Choose')}</button>`):`<span class="cb-mut">✓ ${T('ваше','yours')}</span>`;
    const dk=decoOf(x.id);if(dk&&!(S.lxc&&S.lxc[dk]))side+=`<button class="cb-btn gd noenter" data-cb="deco:${dk}">${T('Украсить','Decorate')} · ${cr(GAME.LXC[dk].cr)}</button>`;}
  else if(s.st==='sale'){sub=`<b style="display:inline;font-size:18px">${M(x.p)}</b>`;
    if(s.why==='lud')sub+=`<span class="cb-rep" style="color:var(--muted,#5a6675)">${T('Людмила Санна: сначала подушка на три месяца — нужно, чтобы после покупки осталось ','Lyudmila Sanna: a three-month cushion first — after the purchase you need to keep ')}${M(s.cush)}.</span>`;
    else if(s.why==='cash')sub+=`<span class="cb-mut"> · ${T('не хватает ','short by ')}${M(x.p-w.cash)}</span>`;
    side=`<button class="cb-btn go noenter" data-cb="buy:${x.id}"${s.why?' disabled':''}>${T('Купить','Buy')}</button>`;}
  else if(s.st==='dream'){cls='dream';const e=etaTxt(s.nd);sub=`💭 ${T('Мечта','Dream')} · ${M(x.p)} · ${esc(needTxt(x,s.nd))}${e?' · '+e:''}`;
    if(s.nd.k==='eq')sub+=bar(s.nd.cur/s.nd.need);}
  else{cls='later';sub=`🔒 ${T('в главе ','in chapter ')}${chName(x.ch)} · ${M(x.p)}`;}
  const rep=repId===x.id&&Date.now()-repT<6000&&REP[x.id]?`<span class="cb-rep">${QL()}${esc(repTxt(x.id))}${QR()}</span>`:'';
  const ef=x.ef?`<small style="color:var(--good,#2e7d32)">⚡ +${x.ef} ${T('сил за ночь — навсегда','energy per night — for good')}</small>`:'';   // M17: вещи, которые дают силы
  return `<div class="cb-it ${cls}"><i>${lxIco(x,cls)}</i><div><b>${esc(lxName(x))}${decoTxt(x.id)}</b><small>${sub}</small>${ef}${setBadge(x)}${rep}</div><div class="cb-side">${side}</div></div>`;}
function repTxt(id){const r=REP[id];if(!r)return '';return T(fem()&&r[3]?r[3]:r[1],r[2]);}
function slotsHtml(){const w=W();let h='<div class="cb-slots">';for(const s of E.LUXS){const x=E.luxCur(w,s),n=E.LUX.filter(y=>y.s===s&&(!y.p||y.id in w.lx)).length;
    h+=`<button class="cb-slot noenter${n>1?' cb-many':''}" data-cb="slot:${s}"><b>${lxIco(x)}</b><span>${T(SLOT[s][1],SLOT[s][2])}</span><small>${esc(lxName(x))}${decoTxt(x.id)}</small></button>`;}
  return h+'</div>';}
function tabLx(){const w=W(),ch=E.luxCh(w);let h=`<p class="cb-mut">${T('Всё купленное остаётся вашим — выбирайте, чем пользоваться сейчас. Нажмите на плитку, чтобы переехать или пересесть.','Everything you buy stays yours — choose what to use now. Tap a tile to move house or switch cars.')}</p>`+slotsHtml();
  const all=lxList(),cur=all.filter(x=>x.ch<=ch&&st(x.id).st!=='own').sort((a,b)=>{const o={sale:0,dream:1};return (o[st(a.id).st]-o[st(b.id).st])||a.ch-b.ch||a.p-b.p;});
  if(cur.length)h+=`<h3 class="cb-h">🛍 ${T('Можно купить и мечты','For sale and dreams')}</h3><div class="cb-card">${cur.map(itemRow).join('')}</div>`;
  const own=all.filter(x=>st(x.id).st==='own');if(own.length)h+=`<h3 class="cb-h">✓ ${T('Уже ваше','Already yours')}</h3><div class="cb-card">${own.map(itemRow).join('')}</div>`;
  const soon=all.filter(x=>x.ch===ch+1).slice(0,3);if(soon.length)h+=`<h3 class="cb-h">🔒 ${T('Скоро','Coming later')}</h3><div class="cb-card">${soon.map(itemRow).join('')}</div>`;
  h+=`<p class="cb-mut">💡 ${T('Покупка для себя — это деньги из дела: капитал станет меньше, прибыль месяца — нет. Место в рейтинге недели не упадёт.','A purchase for yourself is money out of the business: equity goes down, monthly profit doesn’t. Your weekly leaderboard place won’t drop.')}</p>`;
  return h;}
function slotSheet(s){const w=W(),xs=E.LUX.filter(y=>y.s===s);let h=`<h2>${SLOT[s][0]} ${T(SLOT[s][1],SLOT[s][2])}</h2><div class="cb-card">`;
  h+=xs.map(itemRow).join('')+`</div><div class="row"><button class="btn" data-cb="back" data-esc="1">← ${T('Назад','Back')}</button></div>`;return h;}

/* ---------- Стена почёта ---------- */
function gramTile(k,info,got,need){return got?`<button class="cb-gr noenter" data-cb="gr:${k}"><b>${gramIco(info,1)}</b>${esc(info.t)}</button>`:`<button class="cb-gr no noenter" data-cb="grn:${k}"><b>${gramIco(info,0)}</b>${ART()?'':'? '}${esc(need||info.t)}</button>`;}
function phTile(k,info,got){return `<button class="cb-ph noenter${got?'':' no'}${got&&info.gold?' gold':''}" data-cb="${got?'ph':'phn'}:${k}"><div class="cb-scn">${scn(k,info,got)}</div>${esc(info.t)}${got&&info.w&&typeof info.w.m==='number'?'<br><small class="cb-mut">'+(2027+Math.floor(info.w.m/12))+'</small>':got?'':'<br><small>'+esc(info.need||'')+'</small>'}</button>`;}
function tabWall(){const w=S.wall||{},ch=E.luxCh(W()),gr=GAME.wallGrams();let h='';
  const byCh={};for(const g of gr){const i=gramInfo(g.k);(byCh[i.ch]=byCh[i.ch]||[]).push({k:g.k,i});}
  for(let c=1;c<=Math.min(5,Math.max(ch,1));c++){const phs=GAME.PH.filter(p=>p.ch===c),gs=byCh[c]||[];const got=gs.filter(g=>w[g.k]),no=gs.filter(g=>!w[g.k]);
    if(c<Math.min(5,ch)&&!got.length&&!phs.some(p=>w[p.k]))continue;   // пройденная мимо глава (игра началась сразу с недр) — не показываем пустую
    h+=`<h3 class="cb-h">${T('Глава ','Chapter ')+c} ${chName(c)} · ${got.length+phs.filter(p=>w[p.k]).length} ${T('из','of')} ${gs.length+phs.length}</h3><div class="cb-wall">`;
    for(const p of phs)h+=phTile(p.k,phInfo(p.k),!!w[p.k]);h+='</div><div class="cb-wall">';
    for(const g of got)h+=gramTile(g.k,g.i,true);
    // пустые места — это цели: 3 ближайших в текущей главе, в прошлых — сколько осталось
    if(c===Math.min(5,ch)){for(const g of no.slice(0,3))h+=gramTile(g.k,g.i,false);}
    h+='</div>';if(no.length>(c===Math.min(5,ch)?3:0))h+=`<p class="cb-mut">${T('Пустых мест: ','Empty spots: ')}${no.length}</p>`;}
  const meets=Object.keys(w).filter(k=>k.indexOf('ph_meet_')===0);if(meets.length){h+=`<h3 class="cb-h">🎓 ${T('Встречи выпускников','Class reunions')}</h3><div class="cb-wall">`+meets.map(k=>phTile(k,phInfo(k),true)).join('')+'</div>';}
  const cups=Object.keys(w).filter(k=>k.indexOf('cup_')===0),sp=Object.keys(w).filter(k=>k.indexOf('g_')===0);
  h+=`<h3 class="cb-h">🏆 ${T('Полка кубков','Trophy shelf')}</h3>`;
  if(cups.length||sp.length){const grp={};for(const k of cups){const i=cupInfo(k),key=i.ico+i.t;(grp[key]=grp[key]||{i,ks:[]}).ks.push(k);}
    h+='<div class="cb-wall">'+Object.values(grp).map(g=>`<button class="cb-cup noenter" data-cb="cup:${g.ks[g.ks.length-1]}"><b>${cupIco(g.ks[g.ks.length-1],g.i.ico)}</b>${esc(g.i.t)}${g.ks.length>1?' ×'+g.ks.length:''}</button>`).join('')+sp.map(k=>{const i=gramInfo(k);return `<button class="cb-cup noenter" data-cb="gr:${k}"><b>${cupIco(k,i.ico)}</b>${esc(i.t)}</button>`;}).join('')+'</div>';}
  else h+=`<p class="cb-mut">${T('Кубки дают за итоги недели: капитал вырос на 5 % — бронза, на 15 % — серебро, на 30 % — золото. Итог — в понедельник.','Cups come from the week’s results: equity +5% — bronze, +15% — silver, +30% — gold. Results on Monday.')}</p>`;
  // рамки стены: дерево бесплатно, остальное — за 💎 (или за звания)
  const cur=GAME.cosCur('wf');h+=`<h3 class="cb-h">🖼 ${T('Рамки стены','Wall frames')}</h3><div class="cb-row">`;
  for(const c of GAME.COS.filter(x=>x.k==='wf')){const has=GAME.cosHas(c.id),sel=cur?cur.id===c.id:!!c.free;
    h+=`<button class="cb-btn noenter${sel?' go':''}" data-cb="wf:${c.id}" style="border:3px solid ${c.c}">${esc(T(c.ru,c.en))}${sel?' ✓':has?'':' · '+cr(c.cr)}</button>`;}
  return h+'</div>';}
function bigCard(ico,title,sub,j,back){return `<div class="cb-big"><div class="cb-e">${ico}</div><h2>${esc(title)}</h2>${sub?`<p class="cb-mut">${sub}</p>`:''}${j?`<p>${QL()}${esc(j)}${QR()}</p>`:''}</div><div class="row"><button class="btn" data-cb="back" data-esc="1">← ${T('Назад','Back')}</button></div>`;}

/* ---------- звания ---------- */
function tabRk(){const rk=S.rk|0,n=GAME.stars().n;let h=`<p class="cb-mut">${T('★ дают вещи, грамоты (1), фото (3), кубки (2–5) и наборы (5). Звание не падает — даже после «Начать заново».','★ come from things, certificates (1), photos (3), cups (2–5) and sets (5). Your rank never drops — even after “Start over”.')}</p><div class="cb-card">`;
  GAME.RK.forEach((r,i)=>{const c=i===rk?' cur':i<rk?' done':'';h+=`<div class="cb-rk${c}"><span>${i<=rk?'✓':i+1}</span><span class="f"><b>${esc(rkName(i))}</b><small>${r.s} ★${rkPrize(i)?' · '+esc(rkPrize(i)):''}</small></span></div>`;});
  return h+`</div><p class="cb-mut">${T('Сейчас у вас','You have')} ${n} ★.</p>`;}

/* ---------- окно «Кабинет» ---------- */
function top(){const rk=S.rk|0,n=GAME.stars().n,nx=GAME.RK[rk+1];
  const A=ART();return `<div class="cb-top${A?' cb-hero':''}">${A?'<span class="cb-hf">'+A.hero()+'</span><div class="cb-ht">':''}<b>★ ${rk+1} · ${esc(rkName(rk))}</b>${nx?bar((n-GAME.RK[rk].s)/(nx.s-GAME.RK[rk].s))+`<span class="cb-mut">${T('Следующее','Next')}: <b style="display:inline;font-size:17px">${esc(rkName(rk+1))}</b> — ${n} ${T('из','of')} ${nx.s} ★${GAME.rkLockTxt?esc(GAME.rkLockTxt(rk+1)):''}${rkPrize(rk+1)?' · '+esc(rkPrize(rk+1)):''}</span>`:`<span class="cb-mut">${T('Высшее звание!','The highest rank!')} ${n} ★</span>`}${A?'</div>':''}</div>`;}
/* M43: один учёт «нового» Кабинета — из него число на ★, блок «🆕 Новое» и метки вкладок:
   pend — награды, которые ждут окна (звание/набор/итог недели), rw — мелкие звания (S.rwNew), wall — новое на Стене (GAME.wallNew), lx — вещи в продаже, которые ещё не показывали (S.lxSeen). */
function news(){const r={pend:pend().length,rw:Array.isArray(S.rwNew)?S.rwNew.length:0,wall:[],lx:[]};
  try{r.wall=GAME.wallNew?GAME.wallNew():[];}catch(e){r.wall=[];}
  try{if(W()){const seen=S.lxSeen||{};r.lx=lxList().filter(x=>{const s2=st(x.id);return s2.st==='sale'&&!s2.why&&!seen[x.id];}).map(x=>x.id);}}catch(e){r.lx=[];}
  r.n=r.pend+r.rw+r.wall.length;r.dot=r.n>0||r.lx.length>0;return r;}   // вещи в продаже — точка без числа (их бывает много сразу)
function wallLbl(k){try{const i=k.indexOf('ph_')===0?phInfo(k):k.indexOf('cup_')===0?cupInfo(k):gramInfo(k);return {ico:(i&&i.ico)||'🖼',t:(i&&i.t)||k};}catch(e){return {ico:'🖼',t:k};}}
function open(t,from){css();if(!GAME.W)return;slotOpen='';
  // M43: пришли за наградой, которая ждёт окна, — выдаём сразу (окно награды; мелкое звание — тостом и в «Новое» ниже)
  if(from!=='rew'&&pend().length){flush();if(rw)return;}
  const nz=news();
  if(t)tab=t;else if(from==='hdr')tab=nz.wall.length?'wall':nz.lx.length?'lx':nz.rw?'rk':tab;
  if(tab==='wall')GAME.wallSeen();if(tab==='lx'){const sn=S.lxSeen&&typeof S.lxSeen==='object'?S.lxSeen:(S.lxSeen={});for(const x of lxList())if(st(x.id).st==='sale')sn[x.id]=1;}
  try{STAT.ev('cab',{t:tab,f:from||'x',n:nz.n|0});}catch(e){}   // M44: n — число на ★ (новое) в момент открытия
  const body=tab==='wall'?tabWall():tab==='rk'?tabRk():tabLx();
  // M38: мелкие награды (звания) — списком «Новое» вверху Кабинета; M43: там же всё, что входит в число на ★ (новое на Стене, вещь в продаже); увидели — список очищается
  let nw='';const li=[];
  if(nz.rw)for(const x of S.rwNew.slice().reverse())li.push(`<li>${x.ico||'🎖'} ${esc(x.title)}${x.cr?' · +'+x.cr+' 💎':''}${x.lines&&x.lines.length?'<br><small>'+x.lines.join('<br>')+'</small>':''}</li>`);
  for(const k of nz.wall.slice(-6).reverse()){const l=wallLbl(k);li.push(`<li>${l.ico} ${T('На Стене почёта','On the Wall of fame')}: ${esc(l.t)}</li>`);}
  if(nz.wall.length>6)li.push(`<li>${T('и ещё','and')} ${nz.wall.length-6}${T('',' more')}</li>`);
  for(const id of nz.lx.slice(0,3)){const x=E.luxOf(id);if(x)li.push(`<li>🛍 ${T('В продаже','For sale')}: ${esc(lxName(x))} — ${M(x.p)}</li>`);}
  if(nz.lx.length>3)li.push(`<li>🛍 ${T('и ещё','and')} ${nz.lx.length-3}${T(' — во вкладке «Вещи»',' more in “Things”')}</li>`);
  if(li.length){const bt=(nz.wall.length&&tab!=='wall'?`<button class="cb-btn go noenter" data-cb="tab:wall">🖼 ${T('Смотреть на Стене','See on the Wall')}</button>`:'')+(nz.lx.length&&tab!=='lx'?`<button class="cb-btn noenter" data-cb="tab:lx">🛍 ${T('К вещам','To things')}</button>`:'');
    nw=`<div class="cb-new"><b>🆕 ${T('Новое','New')}</b><ul>${li.join('')}</ul>${bt?'<div class="cb-row">'+bt+'</div>':''}</div>`;
    S.rwNew=[];try{GAME.wallSeen(nz.wall);}catch(e){}const sn=S.lxSeen&&typeof S.lxSeen==='object'?S.lxSeen:(S.lxSeen={});for(const id of nz.lx)sn[id]=1;try{save();}catch(e){}}
  const tm=n=>n?`<i class="cb-tn">${n>9?'9+':n}</i>`:'';
  modal(`<h2>🏛 ${T('Кабинет','Office')}</h2>${nw}${top()}<div class="cb-tabs"><button class="noenter${tab==='lx'?' on':''}" data-cb="tab:lx">🛍 ${T('Вещи','Things')}${tm(nz.lx.length)}</button><button class="noenter${tab==='wall'?' on':''}" data-cb="tab:wall">🖼 ${T('Стена почёта','Wall of fame')}${tm(nz.wall.length)}</button><button class="noenter${tab==='rk'?' on':''}" data-cb="tab:rk">★ ${T('Звания','Ranks')}${tm(nz.rw)}</button>${window.FRUI?`<button class="noenter" data-cb="fr">👥 ${T('Друзья','Friends')}</button>`:''}</div>
    <div id="cbBody" style="--wf:${(GAME.cosCur('wf')||{c:'#8d5a2b'}).c}">${body}</div><div class="row"><button class="btn" id="cbClose" data-esc="1">${T('Закрыть','Close')}</button></div>`);
  try{modalRe=()=>open();}catch(e){}bind();badge();}
function sub(html,re){css();modal(`<div style="--wf:${(GAME.cosCur('wf')||{c:'#8d5a2b'}).c}">${html}</div>`);try{modalRe=re;}catch(e){}bind();}
function bind(){const mc=$c('mcard');if(!mc)return;mc.querySelectorAll('[data-cb]').forEach(b=>b.onclick=()=>act(b.dataset.cb,b));const c=$c('cbClose');if(c)c.onclick=()=>{snd('tap');hideModal();refresh();};}
function act(a,btn){const i=a.indexOf(':'),k=i<0?a:a.slice(0,i),v=i<0?'':a.slice(i+1);
  if(k==='tab'){snd('tap');open(v);}
  else if(k==='fr'){snd('tap');if(window.FRUI)FRUI.open('cab');}   // M18: окно «Друзья» (js/friends-ui.js)
  else if(k==='back'){snd('tap');if(slotOpen&&a==='back'&&btn&&btn.closest&&!btn.closest('.cb-big')){open('lx');}else open();}
  else if(k==='slot'){snd('tap');slotOpen=v;sub(slotSheet(v),()=>sub(slotSheet(v)));}
  else if(k==='buy')buy(v,btn);
  else if(k==='use'){const x=E.luxOf(v);if(GAME.luxUse(v)==='ok'){snd('coin');toast(x.ico+' '+(x.s==='home'?T('Переехали: ','Moved into: '):x.s==='car'?T('Пересели: ','Now driving: '):T('Теперь: ','Now: '))+lxName(x),2600);}reopen();}
  else if(k==='deco'){const c=GAME.LXC[v];if(!c)return;if(GAME.cr()<c.cr){snd('no');toast(T('Не хватает кристаллов','Not enough crystals'));return;}
    const r=GAME.lxcBuy(v);if(r==='ok'){snd('coin');toast(c.ico+' '+T(c.ru,c.en));}reopen();}
  else if(k==='wf'){const c=GAME.COS.find(x=>x.id===v);if(!c)return;if(!GAME.cosHas(v)&&GAME.cr()<c.cr){snd('no');toast(T('Не хватает кристаллов','Not enough crystals'));return;}
    const had=GAME.cosHas(v);if(GAME.wfBuy(v)==='ok'){snd(had?'tap':'coin');}open('wall');}
  else if(k==='gr'||k==='grn'){const g=gramInfo(v);snd('tap');sub(bigCard(v.indexOf('g_')===0?cupIco(v,g.ico):gramIco(g,k==='gr'),(k==='gr'?T('Грамота «','Certificate “'):T('Пока пусто: ','Not yet: '))+g.t+(k==='gr'?T('»','”'):''),k==='gr'?esc(dateTxt(g.w)||(g.wk?wkLbl(g.wk):'')):T('Это место ждёт: ','This spot is waiting for: ')+esc(g.t),k==='gr'?g.j:''),()=>act(a));}
  else if(k==='ph'||k==='phn'){const p=phInfo(v);snd('tap');sub(`<div class="cb-big"><div class="cb-ph${k==='ph'?'':' no'}${k==='ph'&&p.gold?' gold':''}" style="flex:none;width:100%;max-width:340px;margin:0 auto;cursor:default"><div class="cb-scn">${ART()?scn(v,p,k==='ph'):`<b style="font-size:56px">${p.ico}</b>${faces(p.who)}`}</div></div><h2>📷 ${esc(p.t)}</h2>${k==='ph'?`<p class="cb-mut">${esc(dateTxt(p.w))}${p.gold?' · '+T('золотая рамка: все вехи главы','gold frame: all chapter milestones'):''}</p><p>${QL()}${esc(p.j)}${QR()}</p>`:`<p class="cb-mut">${esc(p.need||'')}</p>`}</div><div class="row"><button class="btn" data-cb="back" data-esc="1">← ${T('Назад','Back')}</button></div>`,()=>act(a));}
  else if(k==='cup'){const c=cupInfo(v);snd('tap');sub(bigCard(ART()&&v.indexOf('cup_11b_')===0?`<span class="cb-pic">${ART().scene(v,{hero:heroAt(v,null)})}</span>`:cupIco(v,c.ico),c.t,esc(c.sub||''),c.j),()=>act(a));}}
function reopen(){if(slotOpen){const s=slotOpen;sub(slotSheet(s),()=>sub(slotSheet(s)));slotOpen=s;}else open();}
function buy(id,btn){const x=E.luxOf(id);if(!x)return;const r=GAME.luxBuy(id);
  if(r==='ok'){snd('win');try{buzz(20);}catch(e){}if(!calmMode())try{UI.salute(true);}catch(e){}repId=id;repT=Date.now();
    const rp=REP[id];if(rp&&window.PHONE&&PHONE.say)try{PHONE.say(rp[0],fem()&&rp[3]?rp[3]:rp[1],rp[2],null,{push:false,mood:'happy'});}catch(e){}
    toast(x.ico+' '+lxName(x)+(x.st?' · ★ +'+x.st:''),2800);pulseBadge();reopen();setTimeout(()=>{if(modalOn&&repId===id)reopen();},6200);}
  else if(r==='lud'){snd('no');toast(T('Людмила Санна: сначала подушка на три месяца','Lyudmila Sanna: a three-month cushion first'),3000);}
  else if(r==='cash'){snd('no');toast(T('Пока не хватает денег','Not enough money yet'));}}

/* ---------- значок ★ в шапке ---------- */
function badge(){css();let b=$c('rkBtn');const hn=$c('hName');if(!hn)return;
  if(!b){b=document.createElement('button');b.id='rkBtn';b.className='noenter';b.setAttribute('aria-label',T('Кабинет и звание','Office and rank'));b.onclick=e=>{e.stopPropagation();snd('tap');open(null,'hdr');};   // M43: open сам выдаёт ждущую награду и выбирает вкладку, где новое
    // во второй строке шапки, между деньгами и полосой месяца: в первой строке кнопок уже много — на 360–390 px пропало бы название главы
    const hm=document.querySelector('#hdr .hmon');if(hm&&hm.parentNode)hm.parentNode.insertBefore(b,hm);else hn.parentNode.insertBefore(b,hn.nextSibling);}
  crack();const nz=news(),rk=(S.rk|0)+1,nn=nz.n,dot=nz.dot,t='<span class="rkS">★</span> '+rk+'<i'+(nn>0?' class="n">'+Math.min(9,nn):'>')+'</i>';if(b.innerHTML!==t)b.innerHTML=t;b.classList.toggle('dot',dot);b.setAttribute('data-w',T('звание','rank'));}
function crack(){try{const w=W();document.body.classList.toggle('cb-crack',!!w&&E.luxCur(w,'phone').id==='ph0');}catch(e){}}
function pulseBadge(){const b=$c('rkBtn');if(b&&window.UI&&UI.pulse)try{UI.pulse(b);}catch(e){}badge();}
// есть что купить прямо сейчас (новая вещь в продаже и хватает денег по правилу Людмилы) — точка на ★
function saleNow(){const w=W();if(!w)return false;const seen=S.lxSeen||{};return lxList().some(x=>{const s=st(x.id);return s.st==='sale'&&!s.why&&!seen[x.id];});}

/* ---------- карточка для «Сегодня» и карты недр ---------- */
function greet(){const h=new Date().getHours(),w=W(),rk=S.rk|0;const hi=h<5?T('Доброй ночи','Good night'):h<12?T('Доброе утро','Good morning'):h<17?T('Добрый день','Good afternoon'):T('Добрый вечер','Good evening');
  const nm=rkName(rk);let tail='';try{const car=E.luxCur(w,'car'),home=E.luxCur(w,'home'),d=new Date().getDate()%4;
    if(d===0&&car.id!=='c0')tail=T(' Машина у подъезда.',' The car is outside.');else if(d===1&&home.id!=='h0')tail=T(' Как спалось на новом месте?',' How did you sleep in the new place?');
    else if(w.ned){}   // M30: в «Недрах» и во втором холдинге — без автобуса и проездного
    else if(d===2&&car.id==='c0'&&GAME.stN()<=2)tail=T(' Проездной не забыли?',' Got your bus pass?');
    else if(d===2&&car.id==='c0')tail=T(' Может, пора пересесть с автобуса? Загляните в Кабинет.',' Maybe it’s time to get off the bus? Take a look in the Office.');}catch(e){}
  return `${hi}, ${esc(nm.charAt(0).toLowerCase()+nm.slice(1))}!${tail}`;}
function cardHtml(){const w=W();if(!w)return '';css();const rk=S.rk|0,n=GAME.stars().n,nx=GAME.RK[rk+1];
  let h=`<div class="cb-card">${ART()?'<span class="cb-hface">'+ART().face()+'</span>':''}<div class="cb-say">${T('Людмила Санна','Lyudmila Sanna')}: ${QL()}${greet()}${QR()}</div><h4>🏛 ${T('Кабинет','Office')} · ★ ${rk+1} ${QL()}${esc(rkName(rk))}${QR()}</h4>`;
  if(nx)h+=bar((n-GAME.RK[rk].s)/(nx.s-GAME.RK[rk].s))+`<p class="cb-mut" style="margin:2px 0">${T('до звания','to the rank of')} ${QL()}${esc(rkName(rk+1))}${QR()}: ${n} ${T('из','of')} ${nx.s} ★${GAME.rkLockTxt?esc(GAME.rkLockTxt(rk+1)):''}</p>`;
  // одна вещь: в продаже (купить можно) → мечта с ближайшим сроком
  let all=lxList().filter(x=>x.ch<=E.luxCh(w));if(w.ned){const lc=E.luxCh(w),nn=all.filter(x=>x.ch>=lc-1);if(nn.length)all=nn;}   // M30: в «Недрах» не предлагаем кровать за 9 000 ₽ — только вещи последних глав
  let pick=all.find(x=>{const s=st(x.id);return s.st==='sale'&&!s.why;})||all.find(x=>st(x.id).st==='sale');let line='';
  if(pick){line=`🛍 ${T('В продаже','For sale')}: <span class="cb-ii">${lxIco(pick)}</span>${esc(lxName(pick))} — <b>${M(pick.p)}</b>`;}
  else{const d=all.filter(x=>st(x.id).st==='dream').sort((a,b)=>{const na=st(a.id).nd,nb=st(b.id).nd;const fa=na.k==='eq'?na.cur/na.need:.5,fb=nb.k==='eq'?nb.cur/nb.need:.5;return fb-fa;})[0];
    if(d){const s=st(d.id),e=etaTxt(s.nd);line=`💭 ${T('Мечта','Dream')}: <span class="cb-ii">${lxIco(d,'dream')}</span>${esc(lxName(d))} — ${esc(needTxt(d,s.nd))}${e?' ('+e+')':''}`;}}
  if(line)h+=`<p style="margin:6px 0 2px">${line}</p>`;
  const now=E.LUXS.map(s=>lxIco(E.luxCur(w,s))).join(ART()?'':' ');
  h+=`<div class="cb-row"${ART()?' style="justify-content:flex-end"':''}><span class="cb-f1 cb-now${ART()?' cb-art':''}" title="${esc(T('Сейчас у вас','You have now'))}">${now}</span><button class="cb-btn${pick&&!st(pick.id).why?' go':''} noenter" data-cbo="${pick?'lx':'lx'}">${pick&&!st(pick.id).why?T('Посмотреть','Take a look'):T('Открыть','Open')}</button></div></div>`;
  return h;}
function chLine(stg){const k={small:'ph_small',mid:'ph_mid',quarry:'ph_quarry',nedra:'ph_nedra'}[stg];if(!k)return '';const p=phInfo(k);
  return `${ART()?'<span class="cb-chp">'+ART().scene(k,{hero:ART().me()})+'</span>':''}<p class="cb-mut" style="margin:6px 0">📷 ${T('На Стену почёта — фото','On the Wall of fame — a photo')} ${QL()}${esc(p.t)}${QR()} · ★ +3</p>`;}
document.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('[data-cbo]'):null;if(!t)return;e.preventDefault();snd('tap');open(t.dataset.cbo,'today');},false);
function refresh(){try{if(window.META&&META.refresh)META.refresh();}catch(e){}badge();}

/* ---------- окно награды REW ---------- */
let rw=null,lastRw=0,busyT=0;
function x2Ok(n){try{return n>0&&ad()&&GAME.adLeft('rw')>0;}catch(e){return false;}}
// o: {k, ico, title, cr (уже зачислено), lines:[…]}
function show(o){css();rw=o;lastRw=Date.now();const e=(o.cr||0)*(sponsor()?2:1);
  const x2=x2Ok(o.cr)?`<button class="btn noenter mt-x2b" id="rwX2">📺 ${e===o.cr?T('×2 за рекламу','×2 for an ad'):T('За рекламу','For an ad')}: +${o.cr} → +${cr(o.cr+e)}</button>`:'';
  modal(`<div class="rw"><div class="rw-e">${o.ico}</div><h2>${esc(o.title)}</h2>${o.cr?`<div class="rw-cr">+${cr(o.cr)}</div>`:''}${o.lines&&o.lines.length?'<ul>'+o.lines.map(x=>`<li>${x}</li>`).join('')+'</ul>':''}
    <button class="btn green" id="rwTake">${T('Забрать','Take')}${o.cr?' +'+cr(o.cr):''}</button>${x2}${o.note?`<p class="rw-note">${o.note}</p>`:''}${o.soc&&typeof socBragHtml==='function'?socBragHtml(o.soc):''}<button class="rw-link noenter" id="rwCab">${T('Посмотреть в кабинете','See it in the Office')}</button></div>`);
  try{modalRe=null;}catch(e){}
  $c('rwTake').onclick=()=>{const b=$c('rwTake').getBoundingClientRect();snd('coin');hideModal();if(o.cr&&window.UI&&UI.fly&&!calmMode())try{UI.fly({x:b.left+b.width/2,y:b.top},o.cr,'cr');}catch(x){}
    stat(o,'take');rw=null;refresh();};
  if($c('rwX2'))$c('rwX2').onclick=()=>{try{STAT.place('rw_'+o.k);}catch(x){}showRewarded(()=>{GAME.adUse('rw');GAME.addCr(e,'rew');snd('coin');hideModal();toast('📺 +'+cr(e)+' · '+T('всего','total')+' +'+cr(o.cr+e),3000);stat(o,'x2',o.cr+e);rw=null;refresh();},
    ()=>{stat(o,'x2fail');o.note=T('Ролик не загрузился — ничего не потеряно: награда уже ваша.','The video didn’t load — nothing is lost: the reward is already yours.');show(o);});};
  $c('rwCab').onclick=()=>{snd('tap');stat(o,'take');rw=null;open(o.k==='wk'?'wall':o.k==='col'?'lx':'rk','rew');};}
function stat(o,a,c){try{STAT.ev('rw',{k:o.k,a,c:c==null?o.cr||0:c});}catch(e){}}

/* ---------- очередь наград REWQ ---------- */
function pend(){const o=[];if((S.rk|0)>(S.rkG|0))o.push({k:'rk'});for(const k in (S.col||{}))if(S.col[k]&&!(S.colG&&S.colG[k]))o.push({k:'col',id:k});
  if(S.wkR&&!S.wkR.got)o.push({k:'wk'});return o;}
function quiet(){if(typeof modalOn!=='undefined'&&modalOn)return false;if(typeof winCalm==='function'&&!winCalm())return false;if(typeof paused!=='undefined'&&paused)return false;if(document.hidden)return false;
  try{if(GAME.hold&&GAME.hold.size)return false;}catch(e){}const a=$c('adv');if(a&&a.classList.contains('on'))return false;const d=$c('ad');if(d&&d.classList.contains('on'))return false;
  try{if(window.BIZUI&&BIZUI.tutStep&&BIZUI.tutStep())return false;}catch(e){}try{if(window.UI&&UI.tutStep&&UI.tutStep())return false;}catch(e){}
  if(window.PHONE&&PHONE.isOpen)return false;return true;}
// одно окно на всё, что накопилось: звание(я) + набор(ы) + итог недели; 💎 — суммой (зачисляется сразу), ×2 — на всю сумму
function flush(){let p=pend();if(!p.length)return;let rkSoc=false;const q=a=>T('«','“')+a+T('»','”');let sum=0;const lines=[],parts=[];let ico='🏅',title='';
  // звание — последним: набор и итог недели сами поднимают ★
  p=p.filter(x=>x.k!=='rk');
  for(const x of p){if(x.k==='col'){const c=GAME.COL[x.id],n=GAME.colClaim(x.id);sum+=n;parts.push('col');title=T('Набор собран: ','Set complete: ')+T(c.ru,c.en);ico=c.ico;
      lines.push(`${c.ico} ${T('Набор','Set')} ${q(esc(T(c.ru,c.en)))} · ★ +5 · ${esc(T(SET_B[x.id][0],SET_B[x.id][1]))}`);if(c.cos&&!GAME.cosCur('emb'))GAME.cosSel('emb',c.cos);}
    else if(x.k==='wk'){const r=S.wkR;const n=GAME.wkClaim();sum+=n;parts.push('wk');title=T('Итоги недели','The week’s results');ico=ART()?ART().cup(r.t?'w':'ud',r.t||3):r.t?['','🥉','🥈','🥇'][r.t]:'🏅';
      lines.push(`📈 ${T('Капитал за неделю','Equity this week')}: <b>+${FMT.pct(r.pct,r.pct<.1?1:0)}</b> · ${esc(wkLbl(r.k))}`);
      if(r.t)lines.push(['','🥉','🥈','🥇'][r.t]+' '+esc(cupInfo('cup_w_'+r.k).t)+' — '+T('на полку кубков','on the trophy shelf'));
      lines.push(`📋 ${T('Планёрка — все поручения','Briefing — all tasks')}: ${r.pd} ${T('из 7 дней','of 7 days')}${r.pd>=5?' · 🏅 '+T('грамота','certificate')+' '+q(T('Ударник недели','Worker of the week')):''}`);}}
  GAME.rankSync();
  if((S.rk|0)>(S.rkG|0)){const r=GAME.rkClaim();sum+=r.cr;parts.push('rk');const nm=rkName(S.rk|0);title=T('Звание: ','Rank: ')+nm;ico='🎖';rkSoc=r.lv.some(i=>GAME.RK[i]&&GAME.RK[i].ru==='Магнат'); // VK: «📤 Похвастаться» — за звание «Магнат»
    lines.unshift(`★ ${(S.rk|0)+1} · <b>${esc(nm)}</b>${r.lv.length>1?' ('+T('званий: ','ranks: ')+r.lv.length+')':''}`+r.cos.map(id=>'<br>🎁 '+esc(cosTxt(id))).join(''));
    for(const id of r.cos){const c=GAME.COS.find(y=>y.id===id);if(c&&c.k==='wf')GAME.cosSel('wf',id);else if(c&&!GAME.cosCur(c.k))GAME.cosSel(c.k,id);}
    try{if(window.META&&META.applyCos)META.applyCos();}catch(e){}}
  if(!parts.length)return;const k=parts.length>1?'multi':parts[0];if(k==='multi'){title=T('Сегодня у вас','Today you’ve got');ico='🎉';}
  // M38 (a45): мелкая награда (звание без «Магната», < 20 💎) — без окна: короткий тост и список «Новое» в Кабинете (★ с точкой)
  if(k==='rk'&&!rkSoc&&sum<20){const it={t:Date.now(),ico,title,cr:sum,lines};S.rwNew=(Array.isArray(S.rwNew)?S.rwNew:[]).concat([it]).slice(-6);
    try{save();}catch(e){}snd('coin');toast('🎖 '+title+(sum?' · +'+sum+' 💎':'')+' — '+T('в Кабинете ★','in the Office ★'));stat({k:'rk',cr:sum},'cab');lastRw=Date.now()-60000;badge();pulseBadge();return;}
  if(!calmMode())try{UI.salute(true);}catch(e){}snd('win');
  show({k,ico,title,cr:sum,lines,soc:rkSoc?'rank':''});badge();}
let ipoT=0;   // M30: после IPO окно звания — не сразу (через 3 минуты), чтобы не было стопки окон
function tick(){if(!GAME.W)return;if(typeof modalOn!=='undefined'&&modalOn){busyT=Date.now();return;}if(ipoT&&Date.now()-ipoT<180000)return;
  if(!pend().length||Date.now()-busyT<1500)return;
  // M43: мелкое звание — без окна (тост + «Новое»): не ждём закрытия телефона и 90 с после прошлой награды
  if(smallRk()){const d=$c('ad');if(!document.hidden&&!(d&&d.classList.contains('on')))flush();return;}
  if(Date.now()-lastRw<90000||!quiet())return;flush();}
function smallRk(){const p=pend();if(!p.length||p.some(x=>x.k!=='rk'))return false;let s=0;
  for(let i=(S.rkG|0)+1;i<=(S.rk|0);i++){const r=GAME.RK[i];if(!r)continue;s+=r.cr||0;if(r.ru==='Магнат')return false;}return s<20;}
setInterval(tick,1500);

/* ---------- события ---------- */
function hook(){if(!GAME.on){setTimeout(hook,200);return;}css();
  GAME.on('change',badge);GAME.on('reset',badge);GAME.on('ipo',()=>{ipoT=Date.now();});GAME.on('cos',()=>{try{const b=$c('cbBody');if(b)b.style.setProperty('--wf',(GAME.cosCur('wf')||{c:'#8d5a2b'}).c);}catch(e){}});
  // новое на стене: фото — тост (редко), грамоты — только точка на ★ (о них уже сказали тостом за 💎 / веху)
  // друзья узнают о новом звании — короткое сообщение в телефон (без баннера)
  GAME.on('rank',i=>{if(i<2||!window.PHONE||!PHONE.say)return;const nm=rkName(i),who=['beav','vit','owl','bars'][i%4],ln=nm.charAt(0).toLowerCase()+nm.slice(1);
    const tx={beav:[`Слышал, ты теперь «${ln}». Ну-ну. Я тоже скоро.`,`Heard you’re now a “${ln}”. Well, well. Me too, soon.`,`Слышал, ты теперь «${ln}». Ну-ну. Я тоже скоро.`],
      vit:[`Здорово, «${ln}»! Подвезти по такому случаю?`,`Hey, “${ln}”! Need a lift to celebrate?`],owl:[`Поздравляю! «${nm}» — звучит как хорошая кредитная история.`,`Congratulations! “${nm}” sounds like a good credit history.`],
      bars:[`«${nm}»! В забое тебя теперь уважают ещё больше.`,`“${nm}”! The miners respect you even more now.`]}[who];
    setTimeout(()=>{try{PHONE.say(who,tx[0],tx[1],null,{push:false,mood:'happy'});}catch(e){}},4000);});
  GAME.on('wall',ks=>{try{const A=ART();if(A)for(const k of ks)if(k.indexOf('ph_')===0&&S.wall[k]&&!S.wall[k].hr){const m=A.me();S.wall[k].hr={st:m.st,lk:m.lk,wt:m.wt};}}catch(e){}
    const ph=ks.filter(k=>k.indexOf('ph_')===0);if(ph.length){const p=phInfo(ph[0]);let n=0;const go=()=>{if(((typeof modalOn!=='undefined'&&modalOn)||document.body.classList.contains('advon'))&&n++<40)return setTimeout(go,1500);toast('📷 '+T('Новое фото на Стене почёта','A new photo on the Wall of fame')+': '+QL()+p.t+QR()+' · ★ +3',3200);};setTimeout(go,1800);}badge();});
  badge();}
hook();
window.addEventListener('load',badge);
// карточка кабинета — в слоте META (Сегодня / карта недр): дописываем её к карточкам Планёрки
window.CAB={open,card:cardHtml,cardHtml,chLine,badge,refresh,pend,flush,news};
window.REW={show,flush,pend};
})();
