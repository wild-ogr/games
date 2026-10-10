'use strict';
/* zb-MGB мини-игра №8 «Загадки деда Семёна» (разгадывает с 1974-го). 5 загадок; у каждой 3 подсказки — от трудной к лёгкой — и 4 варианта, видны сразу.
   Ответил с 1-й подсказки — 3 очка, со 2-й — 2, с 3-й — 1; неверно — вариант зачёркивается и открывается следующая подсказка; неверно после 3-й — 0, Семён называет ответ.
   Подсказку можно открыть и самому («Ещё подсказка»). Без таймера. Ступени по очкам из 15: 12+ — 3★, 9+ — 2★, 5+ — 1★.
   Загадки: 42 ручных (ZMG_ZAGADKI.items [ответ, п1, п2, п3, реплика Семёна]) + добор из слов ПРОЙДЕННЫХ уровней (ZMG_ZAGADKI.gen ∩ host.words):
   подсказки добора — толкование/шутка Зины → первая буква → половина букв шаблоном. Данные — js/zmg-zagadki-data.js (../MGB-tools/mkdata.py).
   Затея дня (Вт, o.mode 'day'/'fest') — одна раскладка по зерну дня; иначе — свой круг (host.mem().k), без повторов подряд.
   ПК: 1–4 — ответ, Пробел — ещё подсказка, Enter — дальше. Договор — шапка js/zmg-core.js. Классы — zmb-z*. */
(function(){
if(typeof ZMG_REG!=='function')return;
const N=5,TH=[5,9,12],GEN_MAX=2;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const cap=t=>{t=String(t||'').trim();return t.charAt(0).toUpperCase()+t.slice(1);};
const nrm=w=>String(w).toLowerCase().replace(/ё/g,'е');
const tierOf=s=>s>=TH[2]?3:s>=TH[1]?2:s>=TH[0]?1:0;
function mix(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
function permOf(n,seed){let s=seed>>>0;const r=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  return mix(Array.from({length:n},(_,i)=>i),r);}
const SEM_OK=['Ишь ты! С первой подсказки — я так только в 1983-м смог.','Верно! Записываю в тетрадку: «молодец».','Угадал! Пойду Зине расскажу.',
  'Правильно. А я, между прочим, полчаса думал.','Вот это голова! Как у меня, только моложе.'];
const SEM_LATE=['Верно, хоть и не сразу. Я тоже не сразу — с 1974-го учусь.','Угадал! Подсказки — не стыдно, стыдно — сдаваться.','Правильно. Главное — не торопиться, как я на пенсии.'];
const SEM_MISS=['Эх! Это было «%». Ничего, в газете тоже ошибаются.','Не угадал? Там было «%». Я в 1974-м тоже не угадал бы.','«%» это было. Записывай — в следующий раз пригодится.'];
const SEM_BAD=['Не то, но мысль хорошая! Вот тебе ещё подсказка.','Холодно… Держи подсказку полегче.','Хм. Нет. Давай-ка ещё подскажу.'];
function patt(w,rnd){const L=w.split(''),idx=mix(L.map((_,i)=>i).slice(1),rnd).slice(0,Math.ceil((L.length-1)/2)-1);
  return L.map((c,i)=>i===0||idx.indexOf(i)>=0?c.toUpperCase():'_').join(' ');}
/* раскладка: до GEN_MAX слов добора (только из пройденных уровней), остальное — ручные загадки */
function make(host,o){const D=window.ZMG_ZAGADKI,I=D&&D.items||[],m=host.mem(),day=o.mode==='day'||o.mode==='fest';
  if(!I.length)return [];
  let st;const P=permOf(I.length,0x5e3a);
  if(day)st=Math.floor(o.rnd()*I.length);else{st=(m.k|0)%I.length;}
  const pool=new Set((host.words({min:4,max:9,def:true})||[]).map(nrm)),gen=(D.gen||[]).filter(w=>pool.has(w));
  const nGen=Math.min(GEN_MAX,gen.length),man=[];for(let i=0;man.length<N-nGen&&i<I.length;i++)man.push(I[P[(st+i)%I.length]]);
  if(!day)m.k=(st+man.length)%I.length;
  const out=man.map(x=>({a:x[0],h:[x[1],x[2],x[3]],s:x[4]||''}));
  mix(gen,o.rnd).slice(0,nGen).forEach(w=>{const d=cap(host.def(w)||'');if(!d)return;out.push({a:w,h:[d,'Первая буква — «'+w.charAt(0).toUpperCase()+'».','Вот так: '+patt(w,o.rnd)],s:''});});
  const L=mix(out,o.rnd).slice(0,N);
  // варианты: ответ + 3 слова похожей длины (сначала другие ответы загадок, потом знакомые слова)
  const all=I.map(x=>x[0]).concat(Array.from(pool));
  L.forEach(q=>{const len=q.a.length,used=new Set([q.a]);let c=mix(all.filter(w=>Math.abs(w.length-len)<=1&&!used.has(w)&&w.slice(0,3)!==q.a.slice(0,3)),o.rnd);
    const same=c.filter(w=>w.length===len);c=same.concat(c.filter(w=>w.length!==len));const ds=[];for(const w of c){if(ds.length>=3)break;if(used.has(w))continue;used.add(w);ds.push(w);}
    while(ds.length<3){const w=I[Math.floor(o.rnd()*I.length)][0];if(!used.has(w)){used.add(w);ds.push(w);}}
    q.opts=mix([q.a].concat(ds),o.rnd);});
  return L;}
ZMG_REG({id:'zagadki',finWho:'semyon',deps:['js/zmg-zagadki-data.js'],
  open:()=>true,
  /* реплики итога: свои + content/texts/hosts.json games.zagadki (TEXT, черновик) */
  lines:(function(){const P=a=>a[Math.floor(Math.random()*a.length)],S3=["С первой подсказки! Уважаю. Садись рядом.", "Ну голова! Я до такого лет десять доходил.", "Вот это да! Беру в соавторы — будем вместе в «Вечерку» писать."],S2=["Угадал! Не сразу, но верно.", "Хорошо! Вторая подсказка — тоже честь."],S1=["С третьей подсказки, но угадал! Это главное.", "Угадал! Дед доволен, хоть и подсказал.", "Неплохо! Ещё немного — и догонишь меня. А я с 1974-го разгадываю."],S0=["Не угадал? Загадка старая, я сам неделю думал.", "Ничего! Завтра загадаю полегче. Может быть.", "Ничего! Я в первый год тоже только «кот» отгадывал. Завтра — новые."];
    return {good:r=>P(r&&r.tier===3?S3:S2),ok:()=>P(S1),bad:()=>P(S0)};})(),
  sim(o,k){let s=0;for(let i=0;i<N;i++){const r=o.rnd();if(r<.25+.5*k)s+=3;else if(r<.5+.4*k)s+=2;else if(r<.72+.26*k)s+=1;}return {sc:s,st:tierOf(s)};},
  run(host,o){const L=make(host,o);if(!L.length){host.quit();return;}
    let i=0,q=null,shown=1,score=0,busy=false,timer=0,hints=0,okN=0,bdN=0,msN=0,ltN=0;const res=[];
    host.el.innerHTML='<div class="zmb-z"><div class="zmb-zp"><span class="zmb-zpt">Очки: <b>0</b></span><div class="zmg-dots">'+L.map(()=>'<i></i>').join('')+'</div><span class="zmb-zpv"></span></div>'+
      '<div class="zmb-zh"></div><div class="zmg-opts zmb-zo">'+[0,1,2,3].map(k=>'<button class="zmg-opt" data-i="'+k+'"></button>').join('')+'</div>'+
      '<div class="zmb-zs"></div>'+(host.pc?'<p class="zmg-hint zmb-zk">на компьютере: '+host.kc('1')+'–'+host.kc('4')+' — ответ, '+host.kc('Пробел')+' — ещё подсказка, '+host.kc('Enter')+' — дальше</p>':'')+'</div>';
    const $=s=>host.el.querySelector(s),hl=$('.zmb-zh'),say=$('.zmb-zs'),pt=$('.zmb-zpt b'),pv=$('.zmb-zpv'),
      btns=[].slice.call(host.el.querySelectorAll('.zmb-zo .zmg-opt')),dots=[].slice.call(host.el.querySelectorAll('.zmb-zp .zmg-dots i'));
    const pts=()=>Math.max(0,4-shown);
    function drawHints(){let h='';for(let k=0;k<shown&&k<3;k++)h+='<div class="zmb-zc'+(k===shown-1?' new':'')+'"><span class="zmb-zn">'+(k+1)+'</span><span>'+esc(q.h[k])+'</span></div>';
      if(shown<3&&!busy)h+='<button type="button" class="zmb-zc lock"><span class="zmb-zn">'+(shown+1)+'</span><span class="zmb-zt">Ещё подсказка</span><small>за '+(4-shown-1)+' '+(4-shown-1===1?'очко':'очка')+'</small></button>';
      hl.innerHTML=h;const b=hl.querySelector('.lock');if(b)b.onclick=()=>{try{host.snd.tap();}catch(e){}more();};
      pv.textContent=busy?'':'сейчас — '+pts()+' '+(pts()===1?'очко':'очка');}
    function show(){q=L[i];shown=1;busy=false;say.innerHTML='';
      btns.forEach((b,k)=>{b.className='zmg-opt';b.disabled=false;b.textContent=q.opts[k].toUpperCase();});
      dots.forEach((d,k)=>d.className=k<i?(res[k]>0?'ok':'no'):k===i?'cur':'');host.top('Загадка '+(i+1)+' из '+L.length);drawHints();}
    function more(){if(busy||shown>=3)return;shown++;hints++;drawHints();}
    function choose(k){if(busy||!q||btns[k].disabled)return;const right=q.opts[k]===q.a;
      if(right){busy=true;const p=pts();score+=p;res[i]=p;pt.textContent=score;btns[k].classList.add('ok');btns.forEach(b=>b.disabled=true);
        try{host.snd.word&&host.snd.word(p,0);}catch(e){}
        const line=q.s&&shown===1?q.s:(shown===1?SEM_OK[okN++%SEM_OK.length]:SEM_LATE[ltN++%SEM_LATE.length]);
        say.innerHTML=host.say('semyon','<b class="zmb-zpl">+'+p+'</b> '+esc(line),'happy');end1();return;}
      btns[k].classList.add('no');btns[k].disabled=true;try{host.snd.bad&&host.snd.bad();}catch(e){}
      if(shown<3){shown++;hints++;drawHints();say.innerHTML=host.say('semyon',esc(SEM_BAD[bdN++%SEM_BAD.length]),'norm');return;}
      busy=true;res[i]=0;hints++;btns.forEach(b=>{b.disabled=true;if(b.textContent===q.a.toUpperCase())b.classList.add('ok');});
      say.innerHTML=host.say('semyon',esc(SEM_MISS[msN++%SEM_MISS.length].replace('%',q.a.toUpperCase()))+(q.s?' '+esc(q.s):''),'sad');end1();}
    function end1(){drawHints();dots[i].className=res[i]>0?'ok':'no';timer=setTimeout(next,host.calm?3600:2600);}
    function next(){clearTimeout(timer);timer=0;if(!busy)return;i++;if(i>=L.length){fin();return;}show();}
    function fin(){const max=L.length*3,s=score*N*3/max;host.finish({sc:score,st:tierOf(Math.round(s)),h:hints,label:score+' очков из '+max});}
    btns.forEach((b,k)=>b.onclick=()=>{try{host.snd.tap();}catch(e){}choose(k);});
    say.onclick=()=>{if(busy&&timer)next();};hl.onclick=e=>{if(busy&&timer&&!e.target.closest('.lock'))next();};
    host.keys(k=>{if(/^[1-4]$/.test(k)){if(busy){if(timer)next();return true;}choose(+k-1);return true;}
      if(k===' '){if(busy){if(timer)next();}else more();return true;}
      if(k==='Enter'&&busy&&timer){next();return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);timer=0;});
    // бот: k — вероятность угадать на текущей подсказке (растёт с подсказкой)
    host.bot=k=>{if(!q)return;if(busy){if(timer)next();return;}const p=Math.min(1,k*(.6+.2*shown));
      if(Math.random()<p){choose(q.opts.indexOf(q.a));return;}const w=btns.map((b,j)=>j).filter(j=>!btns[j].disabled&&q.opts[j]!==q.a);if(w.length)choose(w[Math.floor(Math.random()*w.length)]);else choose(q.opts.indexOf(q.a));};
    host.intro({who:'semyon',text:'Я, дед Семён, кроссворды разгадываю <b>с 1974-го</b>. Загадаю слово — сперва трудно, потом полегче. <b>Угадаешь с первой подсказки — три очка!</b>',
      btn:'Загадывай!',hint:'5 загадок · ~45 секунд · ошибка не страшна — просто следующая подсказка'}).then(show);}});
(function(){if(document.getElementById('zmb-z-css'))return;const st=document.createElement('style');st.id='zmb-z-css';st.textContent=
'.zmb-z{flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-start;padding:8px 0 10px;overflow-y:auto}'+
'.zmb-zp{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 auto;width:calc(100% - 24px);max-width:460px;font-weight:800;font-size:16px;color:var(--ink2,#5d6781)}'+
'.zmb-zp .zmg-dots{margin:0}.zmb-zpt b{color:var(--ink,#27324a);font-size:19px}.zmb-zpv{font-size:15px;text-align:right;min-width:92px}'+
'.zmb-zh{display:flex;flex-direction:column;gap:8px;margin:10px auto 0;width:calc(100% - 24px);max-width:460px}'+
'.zmb-zc{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:16px;background:#fffdf6;box-shadow:var(--shadow);font-weight:600;font-size:18px;line-height:1.32;text-align:left;color:var(--ink,#27324a)}'+
'.zmb-zc.new{animation:zmbIn .35s ease-out both}@keyframes zmbIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'+
'.zmb-zn{flex:none;width:30px;height:30px;border-radius:50%;background:#2f6fb5;color:#fff;font:800 16px/30px var(--font,Arial);text-align:center}'+
'.zmb-zc.lock{appearance:none;-webkit-appearance:none;font:inherit;font-weight:800;font-size:17px;cursor:pointer;width:100%;align-items:center;min-height:52px;background:#eaf3ff;border:2px dashed #2f6fb5;box-shadow:none;color:#2f6fb5}'+
'.zmb-zc.lock .zmb-zt{flex:1}.zmb-zc.lock small{font-weight:600;color:var(--ink2,#5d6781);font-size:15px}.zmb-zc.lock .zmb-zn{background:#fff;color:#2f6fb5;box-shadow:inset 0 0 0 2px #2f6fb5}'+
'.zmb-zo{display:grid;grid-template-columns:1fr 1fr;gap:10px}.zmb-zo .zmg-opt{font-size:20px;min-height:58px;letter-spacing:.5px;word-break:break-word}'+
'.zmb-zo .zmg-opt.no{text-decoration:line-through;opacity:.75}.zmb-zo .zmg-opt:disabled{cursor:default}'+
'.zmb-zs{min-height:70px;margin:0 auto;width:calc(100% - 24px);max-width:460px;cursor:pointer}.zmb-zs .zmg-av{width:52px;height:52px}'+
'.zmb-zpl{color:var(--green2,#237a3b)}.zmb-zk{text-align:center;margin:4px 0 0}'+
'@media (max-height:620px){.zmb-zc{font-size:16.5px;padding:7px 10px}.zmb-zo .zmg-opt{min-height:50px;font-size:18px}.zmb-zs{min-height:58px}}';
document.head.appendChild(st);})();
})();
