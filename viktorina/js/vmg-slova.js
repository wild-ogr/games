/* MGC · затея №14 «Слово из букв» (школьная доска). Поток MGC буста 09.10 (журнал hobby-analytics/release-i/viktorina-boost/logs/MGC.md).
   Правила: из букв длинного слова собери как можно больше слов; 3★ — найти 10. Без таймера. «Готово» — когда захочешь.
   Договор оболочки — шапка js/vmg-core.js (05-minigames.md §4.2): VMG_REG({id,num,n,icon,run(host,o),bot(o)}); награды/итоги/рекорды — только оболочка.
   Всё своё — внутри этой функции (наружу только VMG_REG), CSS-классы и анимации — с приставкой vmc (.vmc-s…). Сейв не трогаем.
   Словарь — авторский «словарь Михалыча»: нарицательные существительные в начальной форме (ед. ч., кроме «вилы/сани/санки»), каждое слово
   проверено на сборку из букв программой (MGC: scratchpad gen.py); чужих словарей нет. Ввод: буквы на экране или с клавиатуры, Backspace, Enter; ё = е. */
(function(){'use strict';
var ID='slova',NUM=14,STAR=[4,7,10],HINTS=2;
/* [длинное слово, слова через пробел] — день выбирает одно по зерну o.seed (одно на всех) */
var W=[
  ["электричка","акр акт актёр икра карлик катер кирка кит клерк клетка клич кличка крик крикет лак лик лира литр рак река речка тёрка тик тир ткач трек чек чека черта электрик электрика"],
  ["проигрыватель","автор апрель вал валет вар вера вилы вопль вор враг гарь гол гора гриль грот ель ива иволга игла игра лагерь лапоть лев лето липа лира литр опера орёл отвар отрыв пар пароль перо пила пилот пир пират пирог плато плита плот повар пол поле порт порыв пот правило привал провал пролив прорыв пыль рапорт рев репа ретро рог рот рота тело тигр тир товар толпа торг трель тропа тыл"],
  ["подстаканник","аист акт диск дно док доска икона канат капитан капот каска каток кино кипа кит кнопка код кон коса кот котик наст нитка нос нота оса осина пакт паника паста пик пинок пион писк поиск пони посад посадка пост пот сад сани санки сатин сито сноп сода сок сон соната спина стадион стакан стан станок сток стон стопка танк тапок тик тина ток тон"],
  ["викторина","автор акр акт актив вар ватин вина вино винт винтик виток витрина вор ива икона икра картон кино кит кон кора корт кот кран кров крона крот нива нитка нора норка нота отвар рак рок рот рота танк тик тина тир тиран товар ток тон трон"],
  ["гастроном","агроном астроном атом гам гном гора горн гром грот манго март матрос мост мотор наст нора нос нота омар оса рог ром рост рот рота сом сон сор сорт стан стог стон том тон торг торс трон трос"],
  ["раскладушка","акр акула арка аул дар драка душ душа кадр кадушка каска каша клад кладка краса краска кукла кулак курс лад лак ласка лук рак раскладка руда рука сад сакура скала суд сук сушка шакал шар шарада шкала шлак"],
  ["консерватория","автор аист акр акт актёр актив ария вар ватин век вера версия вес весна ветка вина вино винт висок виток вор ворон ворона ворота ворс ива икона икра искра картон катер квас керосин кино кит ковёр кон кора корова корона корсет корт коса костёр кот кран крест кров крона крот наст нектар нерв нива нитка нора норка нос носок нота овёс окно око оркестр оса осина остров отвар отсек рак рев река ректор рента ресторан ретро рис рок рокот рост рот рота ряса сани санки сатин свая свитер сектор сено сера сет сетка сирена сито сканер сова совок сок сон сор сорока сорт стан станок стая стена сток стон танк танкер тенор тёрка тик тина тир тиран товар ток тон торс трек треск трон трос"],
  ["перекрёсток","кекс корсет корт костёр кот крест крот оркестр отсек перекос перо перст пёс песок покер порт пост пот ректор ретро рок рост рот секрет сектор серп сет сок сор сорт спектр спорт сток ток торс трек треск трос"],
  ["кинотеатр","акр акт актёр икона икра картон катер катет кино кит кон кора корт кот кран крона крот нектар нитка нора норка нота рак река рента рок рот рота танк танкер театр тенор тёрка тик тина тир тиран титан ток тон торт тракт трек трон"],
  ["парикмахерская","акр ария арка армия икра искра камера каска кекс керамика кипа кирка краса краска крем крик мак марка маска маяк мера мерка мех мир миска пар парик парикмахер парк персик пёс пескарик пик пир писк прах рак рама река репа рис ряса сахар сера серп скрепка скрипка смех хек химера храм яма ярмарка"],
  ["сковородка","аккорд акр вар вода вор ворс дар двор док доска дрова кадр квас код кокос кора корова коса кров овод око окорок оса рак род рок сад свод сковорода сова совок сода сок сор сорока"],
  ["поликлиника","икона кино кипа клан клин клиника клоп кнопка кол колпак кон лак лик липа пик пикник пила пинок пион пол полка пони"]
];

function vmcN(s){return String(s||'').toLowerCase().replace(/ё/g,'е');}
function vmcRnd(o){if(o&&typeof o.rnd==='function')return o.rnd;var a=(o&&+o.seed>>>0)||(Math.random()*4e9>>>0);
  return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function vmcPick(o){var r=vmcRnd(o),i=Math.floor(r()*W.length)%W.length,w=W[i],m={};
  w[1].split(' ').forEach(function(x){m[vmcN(x)]=x;});return {big:w[0],bn:vmcN(w[0]),dict:m,all:Object.keys(m),r:r};}
function vmcTier(n){return n>=STAR[2]?3:n>=STAR[1]?2:n>=STAR[0]?1:0;}
function vmcPC(){try{if(typeof window.vmgPC==='function')return !!window.vmgPC();return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function vmcSnd(host,k){try{var s=host&&host.snd||window.SND;if(s&&s[k])s[k]();}catch(e){}}
function vmcPortrait(m){try{return typeof portrait==='function'?portrait('mihalych',m||'norm'):'';}catch(e){return '';}}
function vmcEsc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function vmcStars(t){var s='';for(var i=0;i<3;i++)s+='<i class="vmc-s-sr'+(i<t?' on':'')+'">★</i>';return s;}
function vmcCols(n){return n<=6?n:n<=12?Math.ceil(n/2):Math.ceil(n/3);}

var CSS='\
.vmc-s{position:relative;flex:1 1 0;min-height:0;display:flex;flex-direction:column;font-family:KF,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink,#233247);-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}\
.vmc-s *{box-sizing:border-box}\
.vmc-s-in{width:100%;flex:1;min-height:0;display:flex;flex-direction:column;gap:8px}\
.vmc-s-in>*{flex:none}.vmc-s-in>.vmc-s-fd{flex:1 1 0}\
.vmc-s-top{display:flex;align-items:center;justify-content:center;gap:10px;min-height:34px}\
.vmc-s-tt{line-height:1.1;min-width:0}\
.vmc-s-tt small{display:block;font-weight:600;font-size:13px;color:var(--muted,#5a6676)}\
.vmc-s-sr{font-style:normal;font-size:20px;color:#cfc6ae;-webkit-text-stroke:1.5px #233247;margin-left:1px;display:inline-block}\
.vmc-s-sr.on{color:var(--gold,#ffcf40);animation:vmcSPop .45s}\
.vmc-s-cnt{font-weight:800;font-size:16px;background:var(--card,#fffaf0);border:2px solid #233247;border-radius:12px;padding:3px 9px;box-shadow:0 2px 0 #233247;white-space:nowrap}\
.vmc-s-brd{position:relative;background:#2f5240;border:5px solid #9b6a3c;border-radius:14px;box-shadow:inset 0 0 0 2px #233247,0 4px 0 #233247;padding:10px 10px 12px;text-align:center;color:#f4f1e6}\
.vmc-s-big{font-weight:900;font-size:30px;letter-spacing:.06em;line-height:1.15;text-shadow:0 0 1px rgba(255,255,255,.6);word-break:break-all}\
.vmc-s-wd{margin-top:8px;min-height:44px;display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;border-top:2px dashed rgba(244,241,230,.35);padding-top:8px}\
.vmc-s-wd b{display:inline-block;min-width:26px;font-size:26px;font-weight:800;line-height:1.2;border-bottom:3px solid rgba(244,241,230,.75)}\
.vmc-s-wd .ph{font-weight:600;font-size:17px;color:rgba(244,241,230,.65);border:0}\
.vmc-s-wd.bad{animation:vmcSShake .35s}.vmc-s-wd.ok b{color:#b9f5b0;border-color:#b9f5b0}\
.vmc-s-say{display:flex;align-items:center;gap:8px;min-height:46px}\
.vmc-s-pt{width:46px;height:46px;flex:none;border-radius:50%;overflow:hidden;background:var(--pan2,#fff0c9);border:2px solid #233247}\
.vmc-s-pt svg{width:100%;height:100%;display:block}\
.vmc-s-bub{flex:1;background:var(--card,#fffaf0);border:2px solid #233247;border-radius:14px;padding:6px 10px;font-size:16px;line-height:1.25;font-weight:600;box-shadow:0 2px 0 #233247}\
.vmc-s-keys{display:flex;flex-wrap:wrap;justify-content:center}\
.vmc-s-k{height:52px;min-width:0;margin:3px;flex:none;border:2.5px solid #233247;border-radius:12px;background:#fff3d6;box-shadow:0 4px 0 #233247;font:800 24px/1 KF,-apple-system,sans-serif;color:#233247;text-transform:uppercase;cursor:pointer;padding:0;transition:transform .06s}\
.vmc-s-k:active{transform:translateY(3px);box-shadow:0 1px 0 #233247}\
.vmc-s-k.us{background:#ebe6d8;color:#b5ae9c;border-color:#c9c3b2;box-shadow:0 2px 0 #c9c3b2;transform:translateY(2px)}\
.vmc-s-row{display:flex;gap:8px}\
.vmc-s-b{flex:1;min-height:50px;border:2.5px solid #233247;border-radius:14px;background:var(--btn,#fffdf6);box-shadow:0 4px 0 #233247;font:800 17px/1.1 KF,-apple-system,sans-serif;color:#233247;cursor:pointer;padding:4px 8px;display:flex;align-items:center;justify-content:center;gap:6px}\
.vmc-s-b:active{transform:translateY(3px);box-shadow:0 1px 0 #233247}\
.vmc-s-b.go{background:var(--go,#ff7a1a);color:#fff}\
.vmc-s-b.gr{background:var(--grn,#2fa84f);color:#fff}\
.vmc-s-b[disabled]{opacity:.45;pointer-events:none}\
.vmc-s-b.sm{flex:none;min-width:64px}.vmc-s-b[data-k=hint]{white-space:nowrap;font-size:16px}.vmc-s-hn{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;border-radius:12px;background:var(--gold,#ffcf40);border:2px solid #233247;font-size:14px}@media (max-width:360px){.vmc-s-tt{font-size:17px}.vmc-s-tt small{font-size:12px}.vmc-s-sr{font-size:17px}.vmc-s-cnt{font-size:15px;padding:3px 7px}}\
.vmc-s-kc{display:none;font:700 12px/1 KF,sans-serif;border:1.5px solid currentColor;border-radius:5px;padding:2px 4px;opacity:.8}\
.vmc-s.pc .vmc-s-kc{display:inline-block}\
.vmc-s-fd{flex:1;min-height:56px;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--pan,#fffdf6);border:2px solid #233247;border-radius:14px;padding:8px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px}\
.vmc-s-fd .em{color:var(--muted,#5a6676);font-size:15px;font-weight:600;padding:4px}\
.vmc-s-ch{background:#e3f6dd;border:2px solid #1d7a36;border-radius:10px;padding:3px 9px;font-size:17px;font-weight:700;color:#173f22;animation:vmcSIn .3s}\
.vmc-s-ch.ms{background:#f3eee0;border-color:#c9c3b2;color:#6d6758;animation:none}\
.vmc-s-hl{position:fixed;left:0;top:0;right:0;bottom:0}\
.vmc-s-card{margin:auto;max-width:440px;width:100%;background:var(--card,#fffaf0);border:2.5px solid #233247;border-radius:20px;box-shadow:0 5px 0 #233247;padding:16px;text-align:center;display:flex;flex-direction:column;gap:10px;max-height:100%;overflow-y:auto}\
.vmc-s-card h2{margin:0;font-size:24px;font-weight:900}\
.vmc-s-card p{margin:0;font-size:17px;line-height:1.35}\
.vmc-s-card .pt{width:110px;height:110px;margin:0 auto -4px}\
.vmc-s-card .pt svg{width:100%;height:100%}\
.vmc-s-card .vmc-s-sr{font-size:40px}\
.vmc-s-ms{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}\
.vmc-s-wrap{flex:1;display:flex;padding:4px 0;min-height:0}\
body.big .vmc-s-bub{font-size:19px}body.big .vmc-s-ch{font-size:20px}body.big .vmc-s-card p{font-size:20px}body.big .vmc-s-b{font-size:19px}\
@media (max-height:600px){.vmc-s-in{gap:5px}.vmc-s-top{min-height:24px}.vmc-s-sr{font-size:17px}.vmc-s-cnt{font-size:14px;padding:1px 7px}.vmc-s-brd{padding:5px 8px 6px;border-width:4px}.vmc-s-wd{min-height:34px;margin-top:4px;padding-top:4px}.vmc-s-wd b{font-size:22px}.vmc-s-k{height:46px;margin:2px}.vmc-s-say{min-height:0}.vmc-s-pt{display:none}.vmc-s-bub{font-size:15px;padding:4px 9px}.vmc-s-b{min-height:46px}.vmc-s-fd{min-height:40px;padding:5px}.vmc-s-ch{font-size:15px;padding:2px 7px}}\
@media (min-width:700px) and (min-height:600px){.vmc-s-k{height:58px;font-size:27px}}\
@keyframes vmcSShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}\
@keyframes vmcSIn{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}\
@keyframes vmcSPop{0%{transform:scale(1)}50%{transform:scale(1.5)}100%{transform:scale(1)}}\
@media (prefers-reduced-motion:reduce){.vmc-s *{animation:none!important;transition:none!important}}';
function vmcCss(){if(document.getElementById('vmc-css-'+ID))return;var s=document.createElement('style');s.id='vmc-css-'+ID;s.textContent=CSS;document.head.appendChild(s);}

function run(host,o){
  o=o||{};vmcCss();
  var P=vmcPick(o),big=P.big.toUpperCase(),dead=false,keyH=null,found=[],cur=[],hints=HINTS,shown=0;
  var root=document.createElement('div');root.className='vmc-s';root.setAttribute('data-vmc',ID);host.el.appendChild(root);
  function off(){dead=true;if(keyH){window.removeEventListener('keydown',keyH,true);keyH=null;}}
  if(host.onQuit)host.onQuit(off);
  function busy(){return dead||host.paused||host.hold||!root.isConnected;}
  var PC=host.pc!=null?!!host.pc:vmcPC();if(PC)root.classList.add('pc');else root.classList.remove('pc');
  function keys(fn){if(typeof host.keys==='function'){host.keys(function(k,e){return !busy()&&fn(k,e);});return;}keyH=function(e){if(busy()||e.ctrlKey||e.metaKey||e.altKey)return;if(fn(e.key,e)){e.preventDefault();e.stopPropagation();}};window.addEventListener('keydown',keyH,true);}

  /* ---- 2. игра ---- */
  var el={},tiles=[];
  function play(){
    var L=P.big.split(''),cols=vmcCols(L.length);
    root.innerHTML='<div class="vmc-s-in">'+
      '<div class="vmc-s-top"><span class="vmc-s-st">'+vmcStars(0)+'</span><span class="vmc-s-cnt">0 / 10</span><span class="vmc-s-tt"><small>4 — ★ · 7 — ★★ · 10 — ★★★</small></span></div>'+
      '<div class="vmc-s-brd"><div class="vmc-s-big">'+vmcEsc(big)+'</div><div class="vmc-s-wd"></div></div>'+
      '<div class="vmc-s-say"><div class="vmc-s-pt">'+vmcPortrait('norm')+'</div><div class="vmc-s-bub" aria-live="polite"></div></div>'+
      '<div class="vmc-s-keys"></div>'+
      '<div class="vmc-s-row"><button class="vmc-s-b sm" data-k="del" aria-label="Стереть букву">⌫ <span class="vmc-s-kc">Bksp</span></button><button class="vmc-s-b go" data-k="ok">Проверить <span class="vmc-s-kc">Enter</span></button></div>'+
      '<div class="vmc-s-fd"><span class="em">Найденные слова появятся здесь</span></div>'+
      '<div class="vmc-s-row"><button class="vmc-s-b" data-k="hint">💡 Подсказка <b class="vmc-s-hn">'+hints+'</b></button><button class="vmc-s-b gr" data-k="end">Готово</button></div></div>';
    el.wd=root.querySelector('.vmc-s-wd');el.bub=root.querySelector('.vmc-s-bub');el.keys=root.querySelector('.vmc-s-keys');el.fd=root.querySelector('.vmc-s-fd');
    el.st=root.querySelector('.vmc-s-st');el.cnt=root.querySelector('.vmc-s-cnt');el.hint=root.querySelector('[data-k=hint]');el.pt=root.querySelector('.vmc-s-pt');
    tiles=L.map(function(ch,i){var b=document.createElement('button');b.className='vmc-s-k';b.textContent=ch.toUpperCase();b.setAttribute('data-l',vmcN(ch));b.setAttribute('data-i',i);
      b.style.width='calc('+(100/cols).toFixed(3)+'% - 6px)';b.style.maxWidth='62px';
      b.onclick=function(){add(i);};el.keys.appendChild(b);return b;});
    fitBig();if(host.onResize)host.onResize(fitBig);
    root.querySelector('[data-k=del]').onclick=function(){del();};
    root.querySelector('[data-k=ok]').onclick=function(){check();};
    el.hint.onclick=function(){hint();};
    root.querySelector('[data-k=end]').onclick=function(){vmcSnd(host,'tap');finish();};
    say('Собери из букв доски слова поменьше — существительные: «кот», «река».'+(PC?' Печатай буквы, Enter — проверить.':' Жми на буквы.'),'norm');
    drawWord();
    keys(function(k){
      if(fin){if(k==='Enter'||k===' '){fin();return true;}return false;}
      if(k==='Enter'){check();return true;}
      if(k==='Backspace'){del();return true;}
      if(k==='Escape'&&cur.length){clear();return true;}
      if(k&&k.length===1){var c=vmcN(k);if(/[а-я]/.test(c)){var i=-1;for(var j=0;j<tiles.length;j++)if(tiles[j].getAttribute('data-l')===c&&cur.indexOf(j)<0){i=j;break;}
        if(i<0){vmcSnd(host,'no');flash('bad');say('Буквы «'+c.toUpperCase()+'» '+(P.bn.indexOf(c)<0?'нет в слове':'больше не осталось')+'.','sad');}else add(i);return true;}}
      return false;});
  }
  function fitBig(){var b=root.querySelector('.vmc-s-big');if(!b)return;var w=(b.parentNode.clientWidth||300)-24;b.style.fontSize=Math.max(18,Math.min(innerHeight<600?26:34,Math.floor(w/(big.length*.86))))+'px';}
  function say(t,m){el.bub.textContent=t;if(m&&el.pt){el.pt.innerHTML=vmcPortrait(m);}}
  function word(){return cur.map(function(i){return tiles[i].getAttribute('data-l');}).join('');}
  function drawWord(){el.wd.classList.remove('ok','bad');
    el.wd.innerHTML=cur.length?cur.map(function(i){return '<b>'+tiles[i].textContent+'</b>';}).join(''):'<span class="ph">'+(PC?'печатай или жми буквы':'жми буквы внизу')+'</span>';
    tiles.forEach(function(t,i){t.classList.toggle('us',cur.indexOf(i)>=0);});}
  function flash(c){el.wd.classList.remove('ok','bad');void el.wd.offsetWidth;el.wd.classList.add(c);}
  function add(i){if(busy())return;if(cur.indexOf(i)>=0){/* повторное нажатие по букве — убрать её */cur.splice(cur.indexOf(i),1);vmcSnd(host,'tap');drawWord();return;}
    if(cur.length>=tiles.length)return;cur.push(i);vmcSnd(host,'pick');drawWord();}
  function del(){if(busy()||!cur.length)return;cur.pop();vmcSnd(host,'tap');drawWord();}
  function clear(){cur=[];drawWord();}
  function check(){if(busy())return;var w=word();
    if(w.length<3){vmcSnd(host,'no');flash('bad');say(w.length?'Слово — от трёх букв.':'Сначала собери слово из букв.','norm');return;}
    if(found.indexOf(w)>=0){vmcSnd(host,'no');flash('bad');say('«'+P.dict[w]+'» уже есть — ищи другое.','norm');clear();return;}
    if(!P.dict[w]){vmcSnd(host,'wrong');flash('bad');
      say(w===P.bn?'Это же само слово с доски — ищи слова покороче!':'«'+w+'» нет в словаре Михалыча. Берём только существительные в начальной форме: «кот», а не «коты».','sad');cur=[];setTimeout(function(){if(!dead)drawWord();},380);return;}
    found.push(w);vmcSnd(host,'right');try{if(navigator.vibrate&&window.S&&S.vib!==false)navigator.vibrate(15);}catch(e){}
    var n=found.length,t=vmcTier(n),was=vmcTier(n-1);
    if(el.fd.querySelector('.em'))el.fd.innerHTML='';
    var c=document.createElement('span');c.className='vmc-s-ch';c.textContent=P.dict[w];el.fd.appendChild(c);el.fd.scrollTop=el.fd.scrollHeight;
    el.wd.classList.add('ok');setTimeout(function(){if(!dead){cur=[];drawWord();}},350);
    el.cnt.textContent=n+' / '+(n>=STAR[2]?P.all.length:STAR[2]);
    if(t>was){el.st.innerHTML=vmcStars(t);setTimeout(function(){vmcSnd(host,'coin');},200);}
    if(n===P.all.length){say('Все слова из моего словаря! Ну ты голова!','wow');setTimeout(function(){if(!dead)finish();},900);return;}
    say(t>was?(t===3?'Три звезды! Можно искать дальше или жать «Готово».':'Есть '+'★'.repeat(t)+'! До следующей — '+(STAR[t]-n)+'.'):
      ['Верно!','Есть такое!','Молодец!','Точно!','Хорошее слово!'][n%5]+' Найдено '+n+'.','happy');}
  function hint(){if(busy())return;if(hints<=0){vmcSnd(host,'no');say('Подсказки кончились — дальше сам.','norm');return;}
    var rest=P.all.filter(function(w){return found.indexOf(w)<0;});if(!rest.length)return;
    rest.sort(function(a,b){return a.length-b.length;});var w=rest[Math.floor(P.r()*Math.min(6,rest.length))];
    hints--;el.hint.querySelector('.vmc-s-hn').textContent=hints;if(!hints)el.hint.disabled=true;vmcSnd(host,'hint');
    say('Подскажу: слово на «'+w[0].toUpperCase()+'», в нём '+w.length+' '+(w.length<5?'буквы':'букв')+'.','happy');}
  /* ---- 3. конец: показать, какие слова ещё были, и отдать итог оболочке (окно итогов, награды — у неё) ---- */
  var finished=false;
  function finish(){if(dead||finished)return;finished=true;
    var n=found.length,t=vmcTier(n),miss=P.all.filter(function(w){return found.indexOf(w)<0;});
    for(var i=miss.length-1;i>0;i--){var j=Math.floor(P.r()*(i+1)),x=miss[i];miss[i]=miss[j];miss[j]=x;}
    miss=miss.slice(0,14);
    var sayH=typeof host.say==='function'?host.say('mihalych',vmcEsc(t===3?'Отличный словарный запас — весь двор завидует!':t?'Неплохо! Глянь, что ещё можно было найти.':'Ничего, начни в другой раз с коротких слов из трёх букв.'),t?'happy':'norm'):'';
    root.innerHTML='<div class="vmc-s-wrap"><div class="vmc-s-card">'+sayH+'<h2>Найдено слов: '+n+'</h2>'+
      (miss.length?'<p style="font-size:15px;color:var(--muted,#5a6676)">А ещё в словаре Михалыча были:</p><div class="vmc-s-ms">'+miss.map(function(w){return '<span class="vmc-s-ch ms">'+vmcEsc(P.dict[w])+'</span>';}).join('')+'</div>':'')+
      '<button class="vmc-s-b go" data-k="done">Итоги <span class="vmc-s-kc">Enter</span></button></div></div>';
    var go=function(){if(dead)return;vmcSnd(host,'tap');off();host.done({score:n,tier:t,rec:n,label:'Найдено слов: '+n+' из '+P.all.length,extra:{w:P.bn,all:P.all.length}});};
    root.querySelector('[data-k=done]').onclick=go;fin=go;}
  var fin=null;
  play();
}
/* sim(o,k) для VMG.bot: игрок с «знанием» k (0..1) находит часть словаря; за длинными словами не гонится */
function sim(o,k){var P=vmcPick(o),r=P.r,n=0;k=k==null?.6:k;for(var i=0;i<P.all.length;i++){var w=P.all[i];if(r()<k*(w.length<=4?.55:.3))n++;}return {score:n,tier:vmcTier(n)};}

var G={id:ID,run:run,sim:sim};   /* название, ведущий, значок, правило — из VMG_INFO оболочки */
function reg(){if(typeof window.VMG_REG==='function'){window.VMG_REG(G);return true;}return false;}
if(!reg()){var t=0,f=function(){if(!reg()&&++t<40)setTimeout(f,250);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',f);else setTimeout(f,0);}
})();
