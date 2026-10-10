'use strict';
/* ================= zb-cells — ZBCELL: новые клетки поля в главах 26+ (поток LVL, буст «Школа бабы Зины», 10.10.2026) =================
   Данные — у уровня lv.z (генерирует tools/build_zb.py, cells()): f — золотая «пятёрка» ('x,y'), r — тайное слово уровня (бонусное слово
   с шуткой из DEFS), m — убегающее молоко ('x,y'), b — клякса Ятя (['x,y',…]), p — посылка с замком (номер слова в lv.w),
   s/k — марка главы ('x,y', номер буквы в тайном слове главы LV_ZB_SW[глава], js/levels-zb.js).
   Каждая глава вводит одну клетку (ZBCH.list[].cell), дальше они смешиваются. Уровни 1–500 и задания дня — без клеток.
   Точки в game.js (метки zb-LVL): openCell → ZBCELL.open(c, how) (how: null — своим словом, 'hint', 'cat'); submit → ZBCELL.block(wd)
   (посылка заперта), ZBCELL.bonus(w); foundWord/checkAutoFound → ZBCELL.found(wd, byHint); подсказка и кот не ставят букву под кляксу
   (c.lock); saveCur хранит G.zc (состояние клеток незаконченного уровня).
   Монеты — ZBECO.cells (поток ECO) через ZBECO.give('cell', n) с потолком дня, только за ПЕРВУЮ победу уровня; в окне победы — строка
   гнезда 'zbcell' (зона ladder). Сохранение: S.lzS {глава: битовая маска собранных марок}, S.lzT — какие клетки уже объяснены
   (ZB.onSave 'lvl', слияние — объединение).
   API для FEST и других: ZBCELL.add(key, {start(g,z,st), open(c,how,st), found(wd,byHint,st), block(wd,st), bonus(w,st), win(g,st)→[{ic,t,n}],
   intro:'реплика Зины при первой встрече'}) — key — ключ в lv.z (свой, напр. 'w' — паутинка). ZBCELL.ON=false — клетки не включаются.
*/
(function(){
  var C=window.ZBCELL={ON:true,K:{},v:1};
  var $$=function(id){return document.getElementById(id);};
  var cellAt=function(k){return G&&G.cells.get(k);};
  var Z=function(){return window.ZBECO||{};};
  // монеты клетки: ZBECO.cells[id] (ECO назвал gold/secret/parcel/def), запасные числа — здесь
  var ALIAS={five:'gold',riddle:'secret',parcel:'parcel',milk:'milk',word:'word'},DEF={five:5,riddle:10,parcel:15,milk:3,word:20};
  function price(id){var c=Z().cells||{};return +(c[id]!=null?c[id]:c[ALIAS[id]]!=null?c[ALIAS[id]]:c.def!=null&&id!=='word'?c.def:DEF[id])||0;}
  function give(n){if(n<=0)return 0;var E=Z();if(E.give)return E.give('cell',n,'cell')||0;if(typeof addCoins==='function'){addCoins(n,'cell');return n;}return 0;}
  C.add=function(key,o){C.K[key]=o;return o;};
  function st(){return G&&G.zc;}
  function seen(key){var t=String(S.lzT||'');return t.indexOf(key)>=0;}
  function see(key){if(!seen(key)){S.lzT=String(S.lzT||'')+key;save();}}
  function chOf(g){return Math.floor(g.idx/20)+1;}
  function each(fn,g){var z=g.lv.z;if(!z)return;for(var k in C.K)if(z[k]!=null)ZB.safe('cell:'+k,function(){fn(C.K[k],z,k);});}

  /* ---------- золотая «пятёрка»: открыл своим словом — пятёрка (монеты), подсказкой/котом — сгорела ---------- */
  C.add('f',{intro:'Видишь золотую клетку с «5»? Открой её своим словом, без подсказки, — получишь пятёрку!',
    start:function(g,z,s){var c=cellAt(z.f);if(!c)return;if(s.f==null)s.f=c.open?-1:0;if(s.f===0&&!c.open){c.zk=1;c.el.classList.add('zf');}},
    open:function(c,how,s){var z=G.lv.z;if(!z.f||G.cells.get(z.f)!==c||s.f!==0)return;c.el.classList.remove('zf');
      if(!how){s.f=1;c.el.classList.add('zfok');setTimeout(function(){c.el.classList.remove('zfok');},1600);boardSay('5','zb5');}
      else{s.f=-1;if(how==='hint')setTimeout(function(){if(G&&!G.won)zina('Пятёрка с подсказкой не считается. Ничего, в следующий раз — сам!','norm',4);},600);}},
    win:function(g,s){return s.f===1?[{ic:'⭐',t:'Пятёрка',id:'five'}]:[];}});

  /* ---------- тайное слово уровня: бонусное слово, загаданное шуткой ---------- */
  function ridTxt(w){var d=typeof DEFS!=='undefined'&&DEFS[w];return d?'Тайное слово: '+d+' Его нет в кроссворде — ищи среди лишних!':'';}
  C.add('r',{intro:'Сегодня у меня тайное слово! В кроссворде его нет — найди его среди лишних слов. Нажми 🔍, повторю загадку.',
    start:function(g,z,s){if(s.r==null)s.r=g.bonus.has(z.r)?1:0;},
    chip:function(z,s){return s.r?'<b class="zbc ok">🔍 ✓</b>':'<button type="button" class="zbc" data-zbc="r">🔍 Тайное слово</button>';},
    tap:function(z){var t=ridTxt(z.r);if(t)zina(t,'wow',8);},
    bonus:function(w,s){var z=G.lv.z;if(w!==z.r||s.r)return false;s.r=1;boardSay('🔍','zbr');
      zina('Нашёл моё тайное слово — «'+w+'»! Ну голова.','wow',5);chips();return true;},
    win:function(g,s){return s.r?[{ic:'🔍',t:'Тайное слово',id:'riddle'}]:[];}});

  /* ---------- убегающее молоко: 60 с на клетку, успел своим словом — бонус; не успел — «убежало», клетка обычная ---------- */
  var MILK=60,mt=0;
  C.add('m',{intro:'Молоко на плите! Открой клетку с молоком за минуту — успеешь, будет награда. Не успеешь — убежит, ничего страшного.',
    start:function(g,z,s){var c=cellAt(z.m);if(!c)return;if(s.m==null)s.m=c.open?-1:MILK;if(s.m>0&&!c.open){c.zk=1;c.el.classList.add('zm');milkDraw(c,s);}},
    chip:function(z,s){return s.m>0?'<b class="zbc" id="zbcMilk">🥛 '+fmt(s.m)+'</b>':s.m===-2?'<b class="zbc ok">🥛 ✓</b>':'';},
    open:function(c,how,s){var z=G.lv.z;if(!z.m||G.cells.get(z.m)!==c||!(s.m>0))return;c.el.classList.remove('zm');c.el.style.removeProperty('--mt');
      s.m=how?-1:-2;if(!how){boardSay('🥛','zbm');}chips();},
    win:function(g,s){return s.m===-2?[{ic:'🥛',t:'Молоко спасено',id:'milk'}]:[];}});
  function fmt(t){t=Math.max(0,t|0);return Math.floor(t/60)+':'+('0'+t%60).slice(-2);}
  function milkDraw(c,s){c.el.style.setProperty('--mt',Math.round(100*s.m/MILK)+'%');}
  function milkTick(){var s=st();if(!s||!(s.m>0)||!G||G.won||!G.lv.z||!G.lv.z.m)return;
    if((typeof paused!=='undefined'&&paused)||!$$('game').classList.contains('on')||$$('modal').classList.contains('on')||document.hidden)return;
    s.m--;var c=cellAt(G.lv.z.m),e=$$('zbcMilk');if(e)e.textContent='🥛 '+fmt(s.m);if(c)milkDraw(c,s);
    if(s.m<=0){s.m=-1;if(c){c.zk=0;c.el.classList.remove('zm');c.el.style.removeProperty('--mt');c.el.classList.add('zms');setTimeout(function(){c.el.classList.remove('zms');},1200);}
      zina(pick(['Ой, молоко убежало! Ну и ладно, плиту потом протру.','Убежало молоко… Ничего, кот Ять подлижет.']),'norm',4);chips();if(typeof saveCur==='function')saveCur();}}

  /* ---------- клякса Ятя: клетки под кляксой подсказка и кот не открывают — только своё слово ---------- */
  C.add('b',{intro:'Ять опрокинул чернильницу! Клетки под кляксой подсказкой не откроешь — только найденным словом.',
    start:function(g,z,s){(z.b||[]).forEach(function(k){var c=cellAt(k);if(c&&!c.open){c.zk=1;c.lock=1;c.el.classList.add('zbl');}});},
    open:function(c){if(!c.lock)return;c.lock=0;c.el.classList.remove('zbl');}});

  /* ---------- посылка с замком: слово откроется, когда найдены все слова, что её пересекают ---------- */
  function parcelOf(){var z=G&&G.lv.z;return z&&z.p!=null?G.words[z.p]:null;}
  function crossing(wd){var cs=wordCells(wd);return G.words.filter(function(w){return w!==wd&&wordCells(w).some(function(c){return cs.indexOf(c)>=0;});});}
  function parcelCheck(s,quiet){var wd=parcelOf();if(!wd||!wd.lock)return;if(crossing(wd).every(function(w){return w.found;})){wd.lock=0;s.p=1;
    wordCells(wd).forEach(function(c){c.el.classList.remove('zpl');c.el.classList.add('zpo');});
    if(!quiet&&!wd.found)zina('Посылка открыта! Теперь угадай, что в ней.','wow',4);chips();}}
  C.add('p',{intro:'Посылка с замком! Это слово откроется, когда найдёшь все слова, которые её пересекают.',
    start:function(g,z,s){var wd=g.words[z.p];if(!wd)return;if(s.p==null)s.p=0;var cs=wordCells(wd);
      if(wd.found){cs.forEach(function(c){c.el.classList.add('zpo');});return;}
      wd.lock=1;cs.forEach(function(c,i){c.el.classList.add('zp','zpl');if(i===0)c.el.classList.add('zp0');});parcelCheck(s,true);},
    chip:function(z,s){var wd=parcelOf();return wd&&!wd.found?'<b class="zbc">'+(wd.lock?'🔒':'📦')+' Посылка</b>':'';},
    block:function(wd,s){if(!wd.lock)return false;flashPreview(wd.w,'old');SND.old();highlightWord(wd);
      zina('Это посылка с замком! Сначала найди слова, которые её пересекают.','stern',4);return true;},
    found:function(wd,byHint,s){parcelCheck(s);var p=parcelOf();if(p&&wd===p){s.p=byHint?3:2;wordCells(p).forEach(function(c){c.el.classList.remove('zp','zpl','zp0','zpo');});chips();}},
    win:function(g,s){return s.p===2?[{ic:'📦',t:'Посылка',id:'parcel'}]:[];}});

  /* ---------- марки главы: по марке в 6–8 уровнях главы, буквы складываются в тайное слово главы ---------- */
  function swOf(ch){return typeof LV_ZB_SW!=='undefined'&&LV_ZB_SW[ch]||'';}
  function swMask(ch){S.lzS=S.lzS||{};return +S.lzS[ch]||0;}
  function swFull(ch){var w=swOf(ch);return !!w&&swMask(ch)===(1<<w.length)-1;}
  function swLine(ch){var w=swOf(ch),m=swMask(ch),o='';for(var i=0;i<w.length;i++)o+=(m&(1<<i))?w[i].toUpperCase():'·';return o;}
  C.add('s',{intro:'Марка! Собирай марки по главе — из букв на них сложится моё тайное слово главы. За него — сундучок.',
    start:function(g,z,s){var c=cellAt(z.s),ch=chOf(g);if(!c||!swOf(ch))return;if(s.s==null)s.s=0;
      if(!(swMask(ch)&(1<<z.k))&&!c.open){c.zk=1;c.el.classList.add('zs');}
      else if(!(swMask(ch)&(1<<z.k))&&c.open)stamp(g,z,s);},
    chip:function(z){var ch=chOf(G);return swOf(ch)?'<button type="button" class="zbc" data-zbc="s">✉️ '+swLine(ch)+'</button>':'';},
    tap:function(z){var ch=chOf(G),w=swOf(ch),n=0;for(var i=0;i<w.length;i++)if(swMask(ch)&(1<<i))n++;
      zina(swFull(ch)?'Тайное слово главы — «'+w+'»! '+(typeof DEFS!=='undefined'&&DEFS[w]||''):'Марок собрано '+n+' из '+w.length+'. Буквы на них сложатся в моё тайное слово главы — ищи марки дальше!','happy',6);},
    open:function(c,how,s){var z=G.lv.z;if(z.s==null||G.cells.get(z.s)!==c)return;c.el.classList.remove('zs');stamp(G,z,s);}});
  function stamp(g,z,s){var ch=chOf(g),w=swOf(ch);if(!w||(swMask(ch)&(1<<z.k)))return;S.lzS[ch]=swMask(ch)|(1<<z.k);s.s=1;save();boardSay('✉️','zbs');
    if(swFull(ch)){s.sw=1;setTimeout(function(){if(G===g)zina('Все марки собраны! Тайное слово главы — «'+w.toUpperCase()+'». '+(typeof DEFS!=='undefined'&&DEFS[w]||''),'wow',8);},700);}
    else setTimeout(function(){if(G===g&&!g.won)zina('Марка с буквой «'+w[z.k].toUpperCase()+'»! Слово главы: '+swLine(ch),'happy',4.5);},600);
    chips();}
  C.add('k',{}); // номер буквы марки — данные для 's'
  C.K.s.win=function(g,s){return s.sw?[{ic:'✉️',t:'Слово главы «'+swOf(chOf(g))+'»',id:'word'}]:[];};

  /* ---------- общее ---------- */
  // плашки над полем (внутри #board, поверх — сам кроссворд не сдвигают): тайное слово, молоко, посылка, марки
  function chips(){var b=$$('board');if(!b||!G)return;var e=$$('zbcChips');if(!e){e=document.createElement('div');e.id='zbcChips';b.appendChild(e);}
    var z=G.lv.z,s=st(),h='';if(z&&s&&C.ON)for(var k in C.K)if(z[k]!=null&&C.K[k].chip)h+=ZB.safe('chip:'+k,function(){return C.K[k].chip(z,s);})||'';
    e.innerHTML=h;e.style.display=h?'':'none';
    var hh=h?e.offsetHeight+4:0;if((G.zcH||0)!==hh){G.zcH=hh;if(typeof layoutGrid==='function')layoutGrid();}
    [].forEach.call(e.querySelectorAll('[data-zbc]'),function(x){x.onclick=function(){if(typeof SND!=='undefined')SND.tap();var o=C.K[x.dataset.zbc];if(o&&o.tap)o.tap(G.lv.z);};});}
  C.chips=chips;
  function boardSay(t,cls){var b=$$('board');if(!b||(typeof CALM==='function'&&CALM()))return;var e=document.createElement('div');e.className='zbsay '+(cls||'');e.textContent=t;b.appendChild(e);setTimeout(function(){e.remove();},1300);}
  C.start=function(){var g=G;if(!g)return;var e=$$('zbcChips');if(e){e.innerHTML='';e.style.display='none';}if(g.zcH){g.zcH=0;}
    if(!C.ON||g.daily||!g.lv.z)return;
    var cur=S.curs&&S.curs[g.key];g.zc=cur&&cur.z&&typeof cur.z==='object'?cur.z:{};
    each(function(o,z){if(o.start)o.start(g,z,g.zc);},g);chips();
    // первая встреча с клеткой — Зина объясняет (после приветствия главы, если оно было)
    var nk=Object.keys(g.lv.z).filter(function(k){return C.K[k]&&C.K[k].intro&&!seen(k);});
    if(nk.length){var k=nk[0],first=g.idx%20===0;setTimeout(function(){if(G!==g||g.won)return;zina(C.K[k].intro,'wow',99);see(k);},first?6500:400);}};
  C.open=function(c,how){var g=G;if(!C.ON||!g||!g.zc||!g.lv.z)return;each(function(o,z){if(o.open)o.open(c,how,g.zc);},g);};
  C.found=function(wd,byHint){var g=G;if(!C.ON||!g||!g.zc||!g.lv.z)return;each(function(o,z){if(o.found)o.found(wd,byHint,g.zc);},g);};
  C.block=function(wd){var g=G,r=false;if(!C.ON||!g||!g.zc||!g.lv.z)return false;each(function(o,z){if(!r&&o.block&&o.block(wd,g.zc))r=true;},g);return r;};
  C.bonus=function(w){var g=G,r=false;if(!C.ON||!g||!g.zc||!g.lv.z)return false;each(function(o,z){if(!r&&o.bonus&&o.bonus(w,g.zc))r=true;},g);return r;};
  C.check=function(){var g=G;if(g&&g.zc&&g.lv.z&&g.lv.z.p!=null)parcelCheck(g.zc);};
  // победа: что заработал (монеты — только за первую победу уровня)
  C.result=function(g,first){if(!g||!g.zc||!g.lv.z||g.zcR)return g&&g.zcR||[];var out=[];
    each(function(o,z){if(o.win)out=out.concat(o.win(g,g.zc)||[]);},g);
    out.forEach(function(x){x.n=first?give(price(x.id)):0;});g.zcR=out;return out;};
  setInterval(milkTick,1000);
  if(typeof ZB!=='undefined'){
    ZB.startHook.push(function(){C.start();});
    ZB.levelHook.push(function(i){if(i.ok&&G&&G.zc&&!i.daily)C.result(G,i.first);});
    ZB.add(ZB.winSlots,{id:'zbcell',order:30,zone:'ladder',fit:3,render:function(ctx){var g=ctx.g||G,r=g&&g.zcR;if(!r||!r.length)return '';
      return '<div class="zbcw">'+r.map(function(x){return x.ic+' '+x.t+(x.n?' <b>+'+x.n+'</b> <span class="coin"></span>':'');}).join(' · ')+'</div>';}});
    ZB.onSave({id:'lvl',prefix:'lz',
      fix:function(S){if(!S.lzS||typeof S.lzS!=='object')S.lzS={};if(typeof S.lzT!=='string')S.lzT='';},
      merge:function(S,d){if(d.lzS&&typeof d.lzS==='object'){S.lzS=S.lzS||{};for(var k in d.lzS)S.lzS[k]=(+S.lzS[k]||0)|(+d.lzS[k]||0);}
        if(typeof d.lzT==='string'){var t=String(S.lzT||'');for(var i=0;i<d.lzT.length;i++)if(t.indexOf(d.lzT[i])<0)t+=d.lzT[i];S.lzT=t;}}});
  }
  // стили клеток (только классы zf/zm/zbl/zp/zs, плашки #zbcChips) — тема оформления их не трогает
  var css=document.createElement('style');css.textContent=
    '#board{position:relative}'+
    '.cell.zf{background:#fff3c4;border-color:#f5b72d;box-shadow:0 0 0 2px rgba(245,183,45,.35)}'+
    '.cell.zf::after,.cell.zp0::after,.cell.zm::after,.cell.zs::after{position:absolute;right:-.28em;top:-.38em;font-size:.48em;line-height:1;font-weight:800;pointer-events:none}'+
    '.cell.zf::after{content:"5";color:#fff;background:#e2463b;border-radius:50%;width:1.25em;height:1.25em;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(0,0,0,.25)}'+
    '.cell.zfok{animation:zbgold 1.4s ease-out}@keyframes zbgold{0%{box-shadow:0 0 0 0 rgba(245,183,45,.9)}100%{box-shadow:0 0 0 14px rgba(245,183,45,0)}}'+
    '.cell.zm{background:conic-gradient(#bfe3ff var(--mt,100%),var(--cell,#f3f1ea) 0)}.cell.zm::after{content:"🥛"}'+
    '.cell.zms{animation:zbmilk 1.2s ease-out}@keyframes zbmilk{0%{background:#fff}100%{background:var(--cell,#f3f1ea)}}'+
    '.cell.zbl:not(.open){background:radial-gradient(circle at 38% 42%,#2b2f5a 0 34%,transparent 35%),radial-gradient(circle at 66% 62%,#2b2f5a 0 26%,transparent 27%),radial-gradient(circle at 60% 28%,#2b2f5a 0 14%,transparent 15%),var(--cell,#f3f1ea);border-color:#5a5f8f}'+
    '.cell.zp{border-style:dashed;border-color:#a0662a}.cell.zpl:not(.open){background:#f6e6cf}.cell.zp0::after{content:"🔒"}.cell.zpo.zp0::after{content:"🔓"}'+
    '.cell.zs:not(.open){background:#e6efff;outline:2px dotted #2f6fd6;outline-offset:-5px}.cell.zs::after{content:"✉️"}'+
    '#zbcChips{position:absolute;left:6px;bottom:2px;display:flex;flex-wrap:wrap;gap:6px;z-index:3;max-width:calc(100% - 12px);pointer-events:none}'+
    '#zbcChips .zbc{pointer-events:auto;font:700 13.5px/1 inherit;font-family:inherit;padding:6px 10px;border-radius:14px;border:1.5px solid #c9b48a;background:rgba(255,253,246,.94);color:#5a3d1a;white-space:nowrap;min-height:30px}'+
    '#zbcChips button.zbc{cursor:pointer}#zbcChips .zbc.ok{border-color:#34a853;color:#237a3b}'+
    '.zbsay{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font:900 64px/1 inherit;font-family:inherit;color:#e2463b;pointer-events:none;z-index:4;animation:zbsay 1.3s ease-out forwards;text-shadow:0 2px 0 #fff}'+
    '@keyframes zbsay{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}25%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-70%) scale(1)}}'+
    '.zbcw{font-size:14.5px;font-weight:700;margin:4px 0;color:#5a3d1a}'+
    '@media (prefers-reduced-motion:reduce){.zbsay,.cell.zfok,.cell.zms{animation:none}}';
  document.head.appendChild(css);
})();
