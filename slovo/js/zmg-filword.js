'use strict';
/* zb-MGC мини-игра №13 «Филворд на лавочке» (ведущая — Тамара из 15-й, дачница).
   Поле 5×5, спрятаны 4–6 слов темы главы змейкой (соседи по стороне), слова закрывают всё поле. Проводи пальцем/мышью по буквам или нажимай клетки по очереди;
   на ПК — стрелки + Пробел/Enter (взять клетку), Backspace — назад, H или ? — подсказка. Без таймера, ошибка не наказывает.
   Подсказка Тамары — открывает первую букву ещё не найденного слова (минус звезда за каждые две). Поля — js/zmg-filword-data.js (генератор tools/zmg_filword.py, 365 полей,
   каждое слово читается одним путём). Затея дня (Сб) — поле по номеру дня года (одно на всех); иначе — поле темы текущей главы.
   Выключение — ZMG_OFF в zmg-core.js или FW_ON=false. Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const FW_ON=true;
if(!FW_ON)return;
const N=5;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const D=()=>window.ZMG_FILWORD||null;
const adj=(a,b)=>{const ar=Math.floor(a/N),ac=a%N,br=Math.floor(b/N),bc=b%N;return Math.abs(ar-br)+Math.abs(ac-bc)===1;};
function doy(day){const y=Math.floor(day/10000),m=Math.floor(day/100)%100,d=day%100;const t=Date.UTC(y,m-1,d),s=Date.UTC(y,0,1);return Math.round((t-s)/864e5);}
function pickField(o){const F=D();if(!F||!F.f||!F.f.length)return null;
  if(o.mode==='day'||o.mode==='paper')return F.f[doy(o.day)%F.f.length];
  let th=-1;try{const ch=typeof chapOf==='function'?chapOf(Math.max(0,+S.lv||0)):null;if(ch&&F.ch&&F.ch[ch.n]!=null)th=F.ch[ch.n];}catch(e){}
  const L=th>=0&&o.rnd()<.7?F.f.filter(f=>f[0]===th):F.f;return L[Math.floor(o.rnd()*L.length)];}
const tierOf=h=>h<=0?3:h<=2?2:h<=4?1:0;
const LINES={found:['Нашёл! Глаз — как у моей рассады: всё видит.','Вот! А Валентина Петровна говорила — не найдёт.','Есть! Ещё немного — и лавочка наша.','Правильно! Я так и спрятала.'],
  miss:['Такого тут нет — это я тебе как дачница говорю.','Мимо. Ищи дальше, не торопись — мы не на электричку.','Не-а. Прополи глазами ещё разок.'],
  other:'Слово верное, да дорожка не та — я его по-другому выложила.'};
ZMG_REG({id:'filword',finWho:'tamara',deps:['js/zmg-filword-data.js'],
  open:()=>true,
  lines:{good:'Все нашёл и без подсказок! Пойдёшь ко мне на дачу — грядки искать.',ok:'Нашёл! С подсказкой, но кто ж без неё рассаду высаживал.',bad:'Нашли вместе — и то хорошо. Завтра новое поле спрячу.'},
  sim(o,k){let h=0;const n=5;for(let i=0;i<n;i++)if(o.rnd()>.45+.55*k)h+=o.rnd()<.5?1:2;return {sc:Math.max(0,n*10-h*5),st:tierOf(h)};},
  run(host,o){const f=pickField(o);if(!f){host.quit();return;}
    const th=(D().th||[])[f[0]]||'',g=f[1],W=f[2].map(x=>({w:x[0],p:x[1].split('').map(c=>c.charCodeAt(0)-97),found:false,hint:0}));
    let sel=[],drag=false,hints=0,cur=12,kbd=false,fN=0,mN=0,lock=false;
    const fest=host.fest&&host.fest.id;
    host.el.innerHTML='<div class="zmc-fw'+(fest?' zmc-f-'+esc(fest):'')+'"><div class="zmc-fw-say"></div><div class="zmc-fw-sheet"><div class="zmc-fw-th">Тема: <b>'+esc(th)+'</b></div>'+
      '<div class="zmc-fw-cur"></div><div class="zmc-fw-g">'+g.split('').map((c,i)=>'<span class="zmc-fw-c" data-i="'+i+'">'+esc(c.toUpperCase())+'</span>').join('')+'</div></div>'+
      '<div class="zmc-fw-ws">'+W.map((x,i)=>'<span class="zmc-fw-w" data-i="'+i+'">'+'·'.repeat(x.w.length).split('').join(' ')+'</span>').join('')+'</div>'+
      '<div class="zmc-fw-bt"><button class="btn sec zmc-fw-h">💡 Тамара, подскажи</button></div>'+
      (host.pc?'<p class="zmg-hint zmc-fw-kh">на компьютере: '+host.kc('←')+host.kc('↑')+host.kc('→')+host.kc('↓')+' и '+host.kc('Пробел')+' — по буквам, '+host.kc('⌫')+' — назад, '+host.kc('H')+' — подсказка</p>':'')+'</div>';
    const $=s=>host.el.querySelector(s),grid=$('.zmc-fw-g'),cells=[].slice.call(host.el.querySelectorAll('.zmc-fw-c')),wsEl=[].slice.call(host.el.querySelectorAll('.zmc-fw-w')),say=$('.zmc-fw-say'),curEl=$('.zmc-fw-cur'),hb=$('.zmc-fw-h');
    function talk(t,m){say.innerHTML=host.say('tamara',t,m||'norm');}
    function top(){const n=W.filter(x=>x.found).length;host.top(n+' из '+W.length);}
    function paint(){cells.forEach((c,i)=>{c.classList.toggle('sel',sel.indexOf(i)>=0);c.classList.toggle('kb',kbd&&i===cur);});
      curEl.textContent=sel.map(i=>g[i]).join('').toUpperCase();curEl.classList.toggle('on',sel.length>0);}
    const owner=i=>{for(let k=0;k<W.length;k++)if(W[k].found&&W[k].p.indexOf(i)>=0)return k;return -1;};
    function add(i){if(lock||i<0||i>=N*N||owner(i)>=0)return;const k=sel.indexOf(i);
      if(k>=0){if(k===sel.length-2||(!drag&&k===sel.length-1)){sel.splice(k+(k===sel.length-2?1:0));try{host.snd.tap();}catch(e){}paint();}return;}
      if(sel.length&&!adj(sel[sel.length-1],i)){if(drag)return;sel=[];}
      sel.push(i);try{host.snd.letter&&host.snd.letter(sel.length-1);}catch(e){}paint();if(!drag)check(false);}
    // проверка: точное совпадение пути → найдено; те же буквы другим путём → подсказка; на отпускании — «нет такого»
    function check(final){const w=sel.map(i=>g[i]).join('');if(!w)return;
      for(let k=0;k<W.length;k++){const x=W[k];if(x.found||x.w!==w)continue;
        if(x.p.length===sel.length&&x.p.every((c,j)=>c===sel[j])||x.p.slice().reverse().every((c,j)=>c===sel[j])){found(k);return;}
        if(final){talk(esc(LINES.other),'norm');sel=[];paint();return;}}
      if(final&&sel.length>1){talk(esc(LINES.miss[mN++%LINES.miss.length]),'sad');grid.classList.remove('bad');void grid.offsetWidth;grid.classList.add('bad');try{host.snd.bad();}catch(e){}sel=[];paint();}}
    function found(k){const x=W[k];x.found=true;fN++;sel=[];
      x.p.forEach(i=>{cells[i].classList.add('got','g'+(k%6));});wsEl[k].textContent=x.w.toUpperCase();wsEl[k].classList.add('got','g'+(k%6));
      try{host.snd.word&&host.snd.word(x.w.length,fN);}catch(e){}
      const d=host.def(x.w);talk('<b>'+esc(x.w.charAt(0).toUpperCase()+x.w.slice(1))+'</b>'+(d?' — '+esc(d)+'.':'')+' '+esc(LINES.found[(fN-1)%LINES.found.length]),'happy');
      paint();top();if(W.every(y=>y.found)){lock=true;setTimeout(end,host.calm?1300:900);}}
    function end(){host.finish({sc:Math.max(0,W.length*10-hints*5),st:tierOf(hints),h:hints,label:'Слов: '+W.length+(hints?' · подсказок '+hints:' · без подсказок')});}
    function hint(){if(lock)return;const x=W.find(y=>!y.found&&y.hint<y.w.length-1);if(!x)return;
      x.hint++;hints++;for(let j=0;j<x.hint;j++)cells[x.p[j]].classList.add('hn');try{host.snd.tap();}catch(e){}
      talk(x.hint===1?'Подскажу: одно слово начинается тут — где светится. В нём '+x.w.length+' '+(x.w.length<5?'буквы':'букв')+'.':'Ещё буковку открыла — веди дальше.','norm');}
    // касания/мышь: протягивание или нажатия по клеткам
    const at=(x,y)=>{const w=grid.clientWidth/N,h=grid.clientHeight/N;const c=Math.floor(x/w),r=Math.floor(y/h);if(c<0||r<0||c>=N||r>=N)return -1;
      const cx=(c+.5)*w,cy=(r+.5)*h;return Math.abs(x-cx)<w*.42&&Math.abs(y-cy)<h*.42?r*N+c:-1;};
    let moved=false,wasLast=false;
    host.ptr(grid,{down(x,y){kbd=false;const i=at(x,y);if(i<0||lock)return;drag=true;moved=false;wasLast=sel.length>0&&sel[sel.length-1]===i;
        if(!wasLast){if(sel.length&&sel.indexOf(i)<0&&!adj(sel[sel.length-1],i))sel=[];add(i);}},
      move(x,y){if(!drag)return;const i=at(x,y);if(i>=0&&i!==sel[sel.length-1]){moved=true;add(i);}},
      up(){if(!drag)return;drag=false;
        if(moved&&sel.length>1){check(true);return;}
        if(!moved&&wasLast){sel.pop();try{host.snd.tap();}catch(e){}paint();return;}
        check(false);}});
    hb.onclick=hint;
    host.keys(k=>{if(lock)return false;const r=Math.floor(cur/N),c=cur%N;
      if(/^Arrow/.test(k)){kbd=true;const nr=r+(k==='ArrowDown')-(k==='ArrowUp'),nc=c+(k==='ArrowRight')-(k==='ArrowLeft');if(nr>=0&&nr<N&&nc>=0&&nc<N)cur=nr*N+nc;paint();return true;}
      if(k===' '||k==='Enter'){kbd=true;if(sel.indexOf(cur)<0)add(cur);else check(true);return true;}
      if(k==='Backspace'){if(sel.length){sel.pop();paint();}return true;}
      if(k==='h'||k==='H'||k==='р'||k==='Р'||k==='?'){hint();return true;}return false;});
    // бот стенда: k — доля «нашёл сам», иначе подсказка
    host.bot=k=>{if(lock)return;const x=W.find(y=>!y.found);if(!x)return;if(Math.random()>k&&x.hint<2){hint();return;}
      if(Math.random()>k+.1){sel=[];drag=true;add(x.p[0]);add(x.p[1]);drag=false;check(true);return;}
      sel=[];drag=true;x.p.forEach(i=>add(i));drag=false;check(true);};
    top();talk('Тема — <b>'+esc(th)+'</b>. Ищи!','happy');
    host.intro({who:'tamara',text:'Пока рассада всходит, я слова на лавочке спрятала — <b>'+W.length+' слов</b> про «'+esc(th)+'». Веди пальцем по буквам: вверх, вниз, вбок, но не наискосок. Все буквы — чьи-то!',
      btn:'Искать слова',hint:'поле 5×5 · без таймера · подсказка — если застрял'});}});
(function(){if(document.getElementById('zmc-fw-css'))return;const st=document.createElement('style');st.id='zmc-fw-css';st.textContent=
'.zmc-fw{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 12px 10px;gap:8px;overflow-y:auto}'+
'.zmc-fw-say{width:100%;max-width:460px;min-height:58px}.zmc-fw-say .zmg-av{width:46px;height:46px}'+
'.zmc-fw-sheet{background:#f6efe0;border-radius:16px;padding:8px 10px 10px;box-shadow:var(--shadow);border:3px solid #b98a5a;position:relative}'+
'.zmc-fw-th{text-align:center;font-size:16px;color:#6b4a2a;margin-bottom:4px}'+
'.zmc-fw-cur{position:absolute;left:50%;top:-18px;transform:translateX(-50%);background:#fff;border-radius:12px;padding:2px 12px;font:900 20px/1.4 var(--font,Arial);letter-spacing:2px;color:var(--ink,#27324a);box-shadow:0 3px 0 var(--edge,#d5d9e3);visibility:hidden;white-space:nowrap}'+
'.zmc-fw-cur.on{visibility:visible}'+
'.zmc-fw-g{display:grid;grid-template-columns:repeat(5,var(--fw,58px));grid-auto-rows:var(--fw,58px);gap:5px;touch-action:none;user-select:none;-webkit-user-select:none}'+
'.zmc-fw-c{display:flex;align-items:center;justify-content:center;background:#fff;border-radius:12px;font:900 calc(var(--fw,58px)*.48)/1 var(--font,Arial);color:#3a2f25;box-shadow:0 3px 0 #e2d3b6;cursor:pointer;transition:background .12s,transform .12s}'+
'.zmc-fw-c.sel{background:var(--blue2,#2f6fd6);color:#fff;transform:scale(1.05)}.zmc-fw-c.kb{outline:3px solid var(--gold,#f5b72d);outline-offset:1px}'+
'.zmc-fw-c.hn:not(.got){box-shadow:0 0 0 3px var(--gold,#f5b72d) inset,0 3px 0 #e2d3b6}'+
'.zmc-fw-c.got{color:#fff;box-shadow:none;cursor:default}'+
'.g0{background:#5aa469!important}.g1{background:#e0883a!important}.g2{background:#4f86c6!important}.g3{background:#b5579a!important}.g4{background:#c9a227!important}.g5{background:#6b6fc4!important}'+
'.zmc-fw-g.bad{animation:zmgShake .35s}'+
'.zmc-fw-ws{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:460px}'+
'.zmc-fw-w{min-width:44px;padding:4px 10px;border-radius:10px;background:#fff;color:#a08a6a;font:800 17px/1.3 var(--font,Arial);letter-spacing:1px;box-shadow:0 2px 0 var(--edge,#d5d9e3)}.zmc-fw-w.got{color:#fff}'+
'.zmc-fw-bt .btn{min-height:48px;font-size:17px}.zmc-fw-kh{text-align:center;margin:0}'+
'.zmc-f-halloween .zmc-fw-sheet{background:#2d2340;border-color:#e07a1f}.zmc-f-halloween .zmc-fw-th{color:#f3c27a}'+
'.zmc-f-ny .zmc-fw-sheet{background:#eef6fb;border-color:#5b9bd5}'+
'.zmc-fw{--fw:min(58px,calc((100vw - 64px)/5))}'+
'@media (max-height:640px){.zmc-fw{--fw:min(50px,calc((100vw - 64px)/5));gap:5px}.zmc-fw-say{min-height:0}.zmc-fw-say .zmg-av{width:36px;height:36px}.zmc-fw-say .zmg-sb{font-size:15px}}'+
'@media (min-width:860px) and (min-height:700px){.zmc-fw{--fw:66px}}';
document.head.appendChild(st);})();
})();
