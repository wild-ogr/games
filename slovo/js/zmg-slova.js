'use strict';
/* zb-MGA мини-игра №3 «Слово из слова» (Зина у доски мелом). Длинное слово на доске — набери из его букв слова (круг букв, ≥3 букв).
   Засчитывается любое существительное словаря Зины (isWord) из этих букв; 6/8/10 слов — 1/2/3★, на 10-м — конец; «Хватит» — конец в любой момент.
   Подсказки: одна даром («Зина шепнёт»), потом — ролик по нужде «Зина подскажет 3 слова» (1 за заход, host.adNeed). Подсказанные идут в счёт, но считаются в h.
   Длинное слово: Затея дня ('day') — из своего списка знакомых (одно на всех); иначе — свой список + слова пройденных уровней (7–8 букв).
   Данные — js/zmg-slova-data.js (ZMG_SLOVA.b = [[слово, уровень (0 — свой), подсказки…]], генерирует ../MGA-tools/mkdata.py). Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const GOAL=[6,8,10],MIN=3;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const nrm=w=>String(w).toLowerCase().replace(/ё/g,'е');
const tierOf=n=>n>=GOAL[2]?3:n>=GOAL[1]?2:n>=GOAL[0]?1:0;
const okWord=w=>{try{return typeof isWord==='function'?isWord(w):false;}catch(e){return false;}};
function fits(w,b){const c={};for(const x of b)c[x]=(c[x]||0)+1;for(const x of w){if(!c[x])return false;c[x]--;}return true;}
function pickBase(o){const B=window.ZMG_SLOVA.b,day=o.mode==='day'||o.mode==='paper',l=o.lvl||0;
  const L=B.filter(x=>day?x[1]===0:x[1]===0||x[1]<=l);const mem=o.mem||{},last=String(mem.r||'').split(',');
  let P=L.filter(x=>last.indexOf(x[0])<0);if(!P.length)P=L;return P[Math.floor(o.rnd()*P.length)]||B[0];}
ZMG_REG({id:'slova',finWho:'zina',deps:['krug','js/zmg-slova-data.js'],
  open:()=>true,
  lines:{good:'Десять слов — как у отличницы! Ставлю на доске пятёрку.',ok:'Хорошо поискали! Ещё бы парочку — и пятёрка.',bad:'Слова прячутся, а мы найдём. Завтра доску новую вытру.'},
  sim(o,k){let n=0;for(let t=0;t<14;t++)if(o.rnd()<.3+.62*k)n++;n=Math.min(10,n);return {sc:n,st:tierOf(n)};},
  run(host,o){const D=window.ZMG_SLOVA;if(!D||!D.b||!D.b.length){host.quit();return;}
    const mem=host.mem(),rec=pickBase({mode:o.mode,lvl:o.lvl,rnd:o.rnd,mem}),base=rec[0],tips=rec.slice(2);
    try{const r=String(mem.r||'').split(',').filter(Boolean);r.push(base);mem.r=r.slice(-12).join(',');}catch(e){}
    const found=[],given={};let fin=false,full=0,free=1,K=null,toast=0;
    const fest=host.fest&&host.fest.id;
    host.el.innerHTML='<div class="zma-wrap'+(fest?' zma-'+esc(fest):'')+'"><div class="zma-sl-board"><div class="zma-sl-base">'+esc(base.toUpperCase())+'</div>'+
      '<div class="zma-sl-bar"><i></i><b data-n="6">6</b><b data-n="8">8</b><b data-n="10">10</b></div><div class="zma-sl-list"></div><div class="zma-sl-msg"></div></div>'+
      '<div class="zma-kr"></div><div class="zma-row"><button class="btn zma-sl-tip">💡 Шепни</button><button class="btn sec zma-sl-end">Хватит'+(host.pc?' '+host.kc('Tab'):'')+'</button></div></div>';
    const $=s=>host.el.querySelector(s),list=$('.zma-sl-list'),msg=$('.zma-sl-msg'),bar=$('.zma-sl-bar i'),bT=$('.zma-sl-tip'),bE=$('.zma-sl-end');
    function upd(){const n=found.length;bar.style.width=Math.min(100,n*10)+'%';[].forEach.call(host.el.querySelectorAll('.zma-sl-bar b'),b=>b.classList.toggle('on',n>=+b.dataset.n));
      host.top(n+' из '+GOAL[2]);bE.textContent=n>=GOAL[0]?'Готово':'Хватит';if(host.pc)bE.innerHTML+=' '+host.kc('Tab');
      const left=tips.filter(w=>found.indexOf(w)<0).length;
      if(free)bT.innerHTML='💡 Шепни';else if(host.adOk()&&left)bT.innerHTML='🎬 3 слова за рекламу';else bT.style.display='none';
      bT.classList.toggle('zbad',!free);bT.classList.toggle('zmg-ad',!free);}
    function say(t,cls){msg.className='zma-sl-msg '+(cls||'');msg.textContent=t;clearTimeout(toast);toast=setTimeout(()=>{msg.textContent='';},2200);}
    function add(w,hint){found.push(w);if(hint)given[w]=1;const s=document.createElement('span');s.className='zma-sl-w'+(hint?' h':'');s.textContent=w;list.appendChild(s);
      try{host.snd.word&&host.snd.word(w.length,found.length%4);}catch(e){}upd();if(found.length>=GOAL[2]&&!full){full=1;try{K&&K.lock(true);}catch(e){}setTimeout(end,700);}}
    function word(w){if(fin||full)return 'bad';w=nrm(w);if(w===base){say('Это само слово с доски — ищи другие!','no');return 'dup';}
      if(w.length<MIN){say('Нужно хотя бы три буквы.','no');return 'bad';}
      if(found.indexOf(w)>=0){say('Это уже есть на доске.','no');return 'dup';}
      if(!fits(w,base))return 'bad';
      if(!okWord(w)){let why='Такого слова у меня в тетради нет.';try{if(typeof whyNot==='function'){const y=whyNot(w);if(y)why=y;}}catch(e){}say(why,'no');return 'bad';}
      add(w,false);say(['Молодец!','Пишу на доску!','Верно!','Есть такое!','Умница!'][found.length%5],'ok');return 'ok';}
    function tipWords(n){const T=tips.filter(okWord);const P=host.words({}).filter(w=>T.indexOf(w)>=0&&found.indexOf(w)<0);const rest=T.filter(w=>found.indexOf(w)<0&&P.indexOf(w)<0);
      return P.concat(rest).slice(0,n);}
    function tip(){if(fin||full)return;if(free){const w=tipWords(1)[0];if(!w){say('Я и сама больше не знаю!');return;}free=0;add(w,true);say('Зина шепнула: «'+w+'»','ok');return;}
      if(!host.adOk())return;bT.disabled=true;host.adNeed('hint').then(ok=>{bT.disabled=false;if(!ok||fin){upd();return;}tipWords(3).forEach(w=>add(w,true));if(!fin)say('Зина подсказала три слова мелом','ok');upd();});}
    function end(){if(fin)return;fin=true;clearTimeout(toast);const n=found.length,h=Object.keys(given).length;
      host.finish({sc:n,st:tierOf(n),h,label:n+' '+(typeof plural==='function'?plural(n,'слово','слова','слов'):'слов')+' из «'+base+'»'});}
    bT.onclick=()=>{try{host.snd.tap();}catch(e){}tip();};bE.onclick=()=>{try{host.snd.tap();}catch(e){}end();};
    host.keys(k=>{if(k==='Tab'){end();return true;}return false;});
    host.onQuit(()=>{clearTimeout(toast);});
    // бот: k — доля верных попыток; верные — из подсказок словаря
    host.bot=k=>{if(fin||full||!K)return;if(Math.random()<k){const w=tips.find(x=>found.indexOf(x)<0);if(w){K.type(w);return;}end();return;}
      if(Math.random()<.1&&found.length>=GOAL[0]){end();return;}K.type(base.slice(0,3).split('').reverse().join(''));};
    host.intro({who:'zina',text:'Пишу на доске слово <b>'+esc(base.toUpperCase())+'</b>. Сколько слов спряталось в нём? Набирай из его букв — <b>6, 8, 10 слов</b> — и будет пятёрка!',
      btn:'К доске!',hint:'слова от трёх букв · без спешки · «Хватит» — когда захочешь'}).then(()=>{K=host.krug($('.zma-kr'),{letters:base,onWord:word,min:2});upd();});}});
(function(){if(document.getElementById('zma-sl-css'))return;const st=document.createElement('style');st.id='zma-sl-css';st.textContent=
'.zma-sl-board{margin:0 auto;width:calc(100% - 24px);max-width:520px;box-sizing:border-box;background:#2f5b45;border:6px solid #a4794a;border-radius:10px;padding:8px 10px;color:#f4f4ee;'+
'font-family:"Comic Sans MS","Segoe Print","Trebuchet MS",cursive;box-shadow:var(--shadow)}'+
'.zma-sl-base{text-align:center;font-size:26px;font-weight:800;letter-spacing:3px;word-break:break-all}'+
'.zma-sl-bar{position:relative;height:14px;border-radius:7px;background:rgba(255,255,255,.18);margin:6px 4px 14px}.zma-sl-bar i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:7px;background:#f5d76e;transition:width .3s}'+
'.zma-sl-bar b{position:absolute;top:14px;font:700 13px/1 var(--font,Arial);color:#dfe8df;transform:translateX(-50%)}.zma-sl-bar b[data-n="6"]{left:60%}.zma-sl-bar b[data-n="8"]{left:80%}.zma-sl-bar b[data-n="10"]{left:97%}'+
'.zma-sl-bar b.on{color:#f5d76e}.zma-sl-bar b.on:after{content:" ★"}'+
'.zma-sl-list{display:flex;flex-wrap:wrap;gap:4px 10px;min-height:28px;font-size:19px;justify-content:center}.zma-sl-w{white-space:nowrap}.zma-sl-w.h{color:#f5d76e}'+
'.zma-sl-msg{min-height:22px;text-align:center;font:600 16px/1.3 var(--font,Arial);color:#fff}.zma-sl-msg.no{color:#ffd0c8}.zma-sl-msg.ok{color:#c9f2c4}'+
'.zma-ny .zma-sl-board{border-color:#c0392b}.zma-halloween .zma-sl-board{background:#3a3550}'+
'@media (max-height:620px){.zma-sl-base{font-size:21px}.zma-sl-list{font-size:17px}}';
document.head.appendChild(st);})();
// общие стили игр MGA (одинаковые в каждом файле — грузится любая первой)
(function(){if(document.getElementById('zma-css'))return;const st=document.createElement('style');st.id='zma-css';st.textContent=
'.zma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:8px 0 10px;min-height:0;overflow-y:auto}'+
'.zma-kr{flex:1 1 auto;min-height:250px;display:flex;align-items:center;justify-content:center}'+
'.zma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 24px);max-width:480px}.zma-row .btn{flex:1 1 0;min-height:50px;font-size:17px;margin:0}'+
'@media (max-height:620px){.zma-kr{min-height:210px}}';document.head.appendChild(st);})();
})();
