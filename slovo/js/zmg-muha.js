'use strict';
/* zb2-MGW мини-игра №17 «Из мухи слона» (буст_в2.0, 12.10.2026). Галя с третьего «раздувает»: преврати одно слово в другое, меняя по одной букве;
   каждое промежуточное — настоящее существительное (isWord). Задача дня — одна на весь подъезд (Пн–Вт 3 шага у Зины, Ср–Чт 4, Пт–Сб 5, Вс 6).
   Ход: нажми букву в слове (или ←/→, 1–6 на ПК) и выбери новую на клавиатуре. «↶ Назад» — убрать последний шаг. «💡 Шепни» — Зина подскажет следующее
   слово кратчайшего пути (первая даром, потом — ролик по нужде, 1 за заход). «Сдаюсь» — Зина показывает свой путь.
   Звёзды: шагов не больше, чем у Зины — ★★★, +1…2 — ★★, больше — ★; сдался — 0. Награда — оболочка (раз в день). Серия дней — ZBWD ('muha').
   Сегодняшняя уже решена → в тренировке — задача из архива прошлых дней. Данные — js/zmg-muha-data.js (tools/zmg_muha.py). Классы — zmw-. Флаг: ?off=muha. */
(function(){
if(typeof ZMG_REG!=='function')return;
const ID='muha';
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const E0=Date.UTC(2026,0,5),AB='абвгдежзийклмнопрстуфхцчшщъыьэюя';
const tk=()=>typeof todayKey==='function'?+todayKey():20261012;
const dn=k=>Math.round((Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)-E0)/864e5);
function task(d){const P=window.ZMG_MUHA.p.split(' '),x=P[((d%P.length)+P.length)%P.length].split('.');return {a:x[0],b:x[1],n:+x[2]};}
const okWord=w=>{try{return typeof isWord==='function'?isWord(w):false;}catch(e){return false;}};
/* граф слов длины n — только DICT_MAIN (как в скрипте): путь Зины = кратчайший */
const VS={};
function vset(n){if(VS[n])return VS[n];const s=new Set();try{if(typeof DICT_MAIN==='string')DICT_MAIN.split(' ').forEach(w=>{if(w.length===n&&okWord(w))s.add(w);});}catch(e){}return VS[n]=s;}
function nb(w,V){const o=[];for(let i=0;i<w.length;i++)for(const c of AB)if(c!==w[i]){const v=w.slice(0,i)+c+w.slice(i+1);if(V.has(v))o.push(v);}return o;}
function path(a,b){const V=vset(a.length);V.add(a);V.add(b);const P=new Map([[a,null]]),q=[a];
  for(let i=0;i<q.length;i++){const u=q[i];if(u===b)break;for(const v of nb(u,V))if(!P.has(v)){P.set(v,u);q.push(v);}}
  if(!P.has(b))return null;const out=[];for(let x=b;x!=null;x=P.get(x))out.push(x);return out.reverse();}
const tierOf=(ok,s,n)=>!ok?0:s<=n?3:s<=n+2?2:1;
const ROWS=['йцукенгшщзхъ','фывапролджэ','ячсмитьбю'];
const CODE={KeyQ:'й',KeyW:'ц',KeyE:'у',KeyR:'к',KeyT:'е',KeyY:'н',KeyU:'г',KeyI:'ш',KeyO:'щ',KeyP:'з',BracketLeft:'х',BracketRight:'ъ',KeyA:'ф',KeyS:'ы',KeyD:'в',KeyF:'а',KeyG:'п',
  KeyH:'р',KeyJ:'о',KeyK:'л',KeyL:'д',Semicolon:'ж',Quote:'э',KeyZ:'я',KeyX:'ч',KeyC:'с',KeyV:'м',KeyB:'и',KeyN:'т',KeyM:'ь',Comma:'б',Period:'ю',Backquote:'е'};
const STEP=['Есть! Галя аж рот открыла.','Так, так… Пишу в тетрадку.','Хороший ход!','Вот это да, и такое слово знаешь!','Ять одобрительно мурчит.'];
ZMG_REG({a:'Меняй по одной букве, чтобы из первого слова вышло последнее',ns:'Из мухи слона сделать — это я умею. Теперь твоя очередь: по одной букве за раз.',/* zb2-MERGE: правило и «Новая затея!» (просьба MGR) */id:ID,finWho:'galya',deps:['js/zmg-muha-data.js','js/zb2-wordday-x.js'],
  open:()=>true,
  lines:{good:'Ну ты даёшь — как у Зины, шаг в шаг! Пойду всему подъезду расскажу.',ok:'Слона сделали! Пусть и с лишним шажком.',bad:'Ничего, завтра новую муху принесу.'},
  /* бот баланса: шаг по пути Зины с вероятностью k, иначе — крюк (+2 шага); слабый иногда сдаётся */
  sim(o,k){const P=window.ZMG_MUHA.p.split(' '),x=P[Math.floor(o.rnd()*P.length)].split('.'),n=+x[2];let s=0;
    for(let i=0;i<n;i++){s++;if(o.rnd()>k)s+=2;if(s>n*3)return {sc:0,st:0};}return {sc:Math.max(1,30-s),st:tierOf(true,s,n)};},
  run(host,o){const D=window.ZMG_MUHA;if(!D){host.quit();return;}
    const mem=host.mem(),today=tk(),dT=dn(today);if(+mem.k!==today){mem.k=today;mem.e=0;}
    if(o.train&&!+mem.e&&!o.ctx.arch){host.quit();setTimeout(()=>{try{ZMG.open(ID,{mode:'home',back:()=>{try{ZB.refresh();}catch(e){}}});}catch(e){}},30);return;}
    const arch=!!+mem.e||!!o.ctx.arch;const day=arch?dT-1-Math.floor(o.rnd()*Math.min(120,Math.max(1,dT))):dT;
    const T=task(day),L=T.a.length;
    const chain=[T.a];let pos=-1,fin=false,hints=0,free=1;
    host.el.innerHTML='<div class="zmw-wrap zmh"><div class="zmh-goal"></div><div class="zmh-ch"></div><div class="zmh-cur"></div>'+
      '<div class="zmh-msg"></div><div class="zmh-bt"><button class="btn sec zmh-un">↶ Назад</button><button class="btn zmh-hi">💡 Шепни</button><button class="btn sec zmh-gu">Сдаюсь</button></div><div class="zmw-kb"></div></div>';
    const $=s=>host.el.querySelector(s),gEl=$('.zmh-goal'),chEl=$('.zmh-ch'),cEl=$('.zmh-cur'),msg=$('.zmh-msg'),kb=$('.zmw-kb'),bU=$('.zmh-un'),bH=$('.zmh-hi'),bG=$('.zmh-gu');
    gEl.innerHTML='<span class="zmh-w">'+esc(T.a.toUpperCase())+'</span> → <span class="zmh-w t">'+esc(T.b.toUpperCase())+'</span><small>у Зины — '+T.n+' '+pl(T.n,'шаг','шага','шагов')+(arch?' · архив':'')+'</small>';
    let kh='';ROWS.forEach(row=>{kh+='<div class="zmw-kr">';for(const c of row)kh+='<button class="zmw-k" data-k="'+c+'">'+c+'</button>';kh+='</div>';});kb.innerHTML=kh;
    function pl(n,a,b,c){return typeof plural==='function'?plural(n,a,b,c):c;}
    let mt=0;function say(t,cls){msg.className='zmh-msg '+(cls||'');msg.textContent=t;clearTimeout(mt);mt=setTimeout(()=>{if(!fin){msg.className='zmh-msg';msg.textContent=pos<0?'Нажми букву, которую меняем':'Теперь — новую букву внизу';}},2600);}
    const curW=()=>chain[chain.length-1];
    function tiles(w,cls,sel){let h='';for(let i=0;i<w.length;i++){const same=w[i]===T.b[i];h+='<span class="zmh-t'+(same?' ok':'')+(i===sel?' sel':'')+'" data-i="'+i+'">'+esc(w[i])+'</span>';}return '<div class="zmh-row '+(cls||'')+'">'+h+'</div>';}
    function paint(){chEl.innerHTML=chain.slice(0,-1).map((w,i)=>'<div class="zmh-li"><i>'+(i||'')+'</i>'+tiles(w,'sm',-1)+'</div>').join('');chEl.scrollTop=chEl.scrollHeight;
      cEl.innerHTML=tiles(curW(),'big',pos);host.top((chain.length-1)+' '+pl(chain.length-1,'шаг','шага','шагов'));
      bU.disabled=chain.length<2||fin;bG.disabled=fin;
      if(free)bH.innerHTML='💡 Шепни';else if(host.adOk())bH.innerHTML='🎬 Шепни';else bH.style.display='none';
      bH.classList.toggle('zbad',!free);bH.classList.toggle('zmg-ad',!free);
      [].forEach.call(kb.querySelectorAll('.zmw-k'),b=>b.disabled=pos<0||fin);}
    function sel(i){if(fin)return;pos=i===pos?-1:i;try{host.snd.tap();}catch(e){}paint();if(pos>=0)say('Какую букву вместо «'+curW()[pos].toUpperCase()+'»?');}
    function put(c){if(fin||pos<0)return;const w=curW(),v=w.slice(0,pos)+c+w.slice(pos+1);
      if(v===w){say('Это та же буква!','no');return;}
      if(chain.indexOf(v)>=0){say('Это слово уже было в цепочке.','no');return;}
      if(!okWord(v)){let why='';try{why=typeof whyNot==='function'?whyNot(v):'';}catch(e){}
        say('«'+v.toUpperCase()+'» — '+(why==='plural'?'это много, а нужна одна штука.':why==='adj'?'это «какой», а нужно «что».':why==='verb'?'это глагол, а нужен предмет.':why==='name'?'это имя, а нужен предмет.':'такого слова у меня в тетради нет.'),'no');
        try{host.snd.bad();}catch(e){}cEl.firstChild.classList.add('bad');setTimeout(()=>{if(cEl.firstChild)cEl.firstChild.classList.remove('bad');},400);return;}
      step(v);}
    function step(v){chain.push(v);pos=-1;try{host.snd.word&&host.snd.word(L,chain.length%4);}catch(e){}
      if(v===T.b){paint();end(true);return;}
      const s=chain.length-1;say(s>T.n+3?'Галя хихикает: «Слон-то уже с бегемота раздулся!» Попробуй «Назад».':STEP[s%STEP.length],'ok');paint();}
    function undo(){if(fin||chain.length<2)return;chain.pop();pos=-1;try{host.snd.tap();}catch(e){}say('Стёрла последний шаг.');paint();}
    function hint(){if(fin)return;const go=()=>{const p=path(curW(),T.b);if(!p||p.length<2){say('Ой, отсюда я дорогу не знаю — попробуй «Назад».','no');return;}
        hints++;const v=p[1];let i=0;while(v[i]===curW()[i])i++;pos=i;paint();say('Зина шепчет: «'+v.toUpperCase()+'» — меняй «'+curW()[i].toUpperCase()+'» на «'+v[i].toUpperCase()+'»','ok');
        cEl.querySelector('.zmh-t[data-i="'+i+'"]').classList.add('hint');};
      if(free){free=0;go();paint();return;}
      if(!host.adOk())return;bH.disabled=true;host.adNeed('hint').then(ok=>{bH.disabled=false;if(ok&&!fin)go();paint();});}
    function giveUp(){if(fin)return;const p=path(T.a,T.b)||[T.a,T.b];fin=true;
      chEl.innerHTML='<div class="zmh-sol">Путь Зины: '+p.map(w=>esc(w.toUpperCase())).join(' → ')+'</div>';cEl.innerHTML='';say('Галя довольна: «Не смогла, не смогла!» Ничего, завтра отыграешься.','no');
      setTimeout(()=>finish(false),2200);}
    function end(ok){fin=true;const s=chain.length-1;
      say(s<=T.n?'Слон! Ровно как у Зины — '+s+' '+pl(s,'шаг','шага','шагов')+'!':'Слон готов! '+s+' '+pl(s,'шаг','шага','шагов')+' (у Зины '+T.n+').','ok');try{host.snd.win();}catch(e){}
      setTimeout(()=>finish(true),1200);}
    function finish(ok){const s=chain.length-1;let sr=null;
      if(!arch){mem.e=ok?1:2;try{if(typeof save==='function')save();}catch(e){}if(window.ZBWD)sr=ok?ZBWD.win(ID,s):(ZBWD.lose(ID),null);}
      host.finish({sc:ok?Math.max(1,30-s):0,st:tierOf(ok,s,T.n),h:hints,label:ok?T.a.toUpperCase()+' → '+T.b.toUpperCase()+': '+s+' '+pl(s,'шаг','шага','шагов')+' (у Зины '+T.n+')':'Сдался — путь Зины: '+T.n+' '+pl(T.n,'шаг','шага','шагов')});
      if(sr&&sr.r>1)setTimeout(()=>{const p=host.root.querySelector('.zmg-res .zmg-panel'),bt=p&&p.querySelector('.zmg-btns');if(!p)return;const d=document.createElement('div');d.className='zmw-res';
        d.innerHTML='<div class="zmw-sr">Серия 🔥'+sr.r+'</div><div class="zmw-sm">Новая муха — завтра</div>';p.insertBefore(d,bt);},30);}
    cEl.addEventListener('click',e=>{const t=e.target.closest('.zmh-t');if(t)sel(+t.dataset.i);});
    kb.addEventListener('click',e=>{const b=e.target.closest('.zmw-k');if(b&&!b.disabled)put(b.dataset.k);});
    bU.onclick=undo;bH.onclick=()=>{try{host.snd.tap();}catch(e){}hint();};bG.onclick=()=>{try{host.snd.tap();}catch(e){}giveUp();};
    host.keys((k,e)=>{if(fin)return false;if(k==='Backspace'){undo();return true;}if(k==='ArrowLeft'){sel(pos<=0?L-1:pos-1);return true;}if(k==='ArrowRight'){sel(pos<0||pos>=L-1?0:pos+1);return true;}
      if(/^[1-6]$/.test(k)&&+k<=L){sel(+k-1);return true;}let c=String(k).toLowerCase().replace('ё','е');if(!/^[а-я]$/.test(c))c=e&&CODE[e.code]||'';if(c&&pos>=0){put(c);return true;}return false;});
    /* бот стенда: шаг по пути Зины (k), иначе — любой соседний */
    host.bot=k=>{if(fin)return;const w=curW();let v=null;if(Math.random()<k){const p=path(w,T.b);if(p&&p.length>1)v=p[1];}
      if(!v){const n=nb(w,vset(L)).filter(x=>chain.indexOf(x)<0);v=n.length?n[Math.floor(Math.random()*n.length)]:null;}
      if(!v||chain.length>T.n*4){giveUp();return;}let i=0;while(v[i]===w[i])i++;pos=i;put(v[i]);};
    host.onResize(()=>{chEl.scrollTop=chEl.scrollHeight;});host.onQuit(()=>clearTimeout(mt));
    const intro=(arch?'Задачка из архива (без серии и наград). ':'')+'Ой, что расскажу! Из <b>'+esc(T.a.toUpperCase())+'</b> сделали <b>'+esc(T.b.toUpperCase())+'</b>! Меняй по одной букве — каждое слово настоящее. У Зины вышло за <b>'+T.n+' '+pl(T.n,'шаг','шага','шагов')+'</b>.';
    host.intro({who:'galya',text:intro,btn:'Раздуваем!',hint:'нажми букву в слове, потом — новую на клавиатуре'+(host.pc?' · ←/→ и буквы, Backspace — назад':'')}).then(()=>{paint();say('Нажми букву, которую меняем');});}});
(function(){if(document.getElementById('zmw-kb-css'))return;const st=document.createElement('style');st.id='zmw-kb-css';st.textContent=
'.zmw-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;padding:6px 8px 8px;min-height:0;box-sizing:border-box;gap:6px}'+
'.zmw-kb{width:100%;max-width:520px;display:flex;flex-direction:column;gap:5px;margin-top:auto}.zmw-kr{display:flex;gap:4px;justify-content:center}'+
'.zmw-k{flex:1 1 0;min-width:0;height:46px;padding:0;border:0;border-radius:7px;background:#e7e2d6;color:#2b2b2b;font:700 17px/1 var(--font,Arial);text-transform:uppercase;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.15)}'+
'.zmw-k:active{transform:translateY(1px)}.zmw-k.s2{background:#5fae5d;color:#fff}.zmw-k.s1{background:#e7c23a;color:#2b2b2b}.zmw-k.s0{background:#b9b2a5;color:#6f685c}'+
'@keyframes zmwIn{0%{transform:scale(.85)}60%{transform:scale(1.08)}100%{transform:none}}@keyframes zmwSh{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'+
'.zmw-res{margin:6px 0 4px}.zmw-sr{font:800 20px/1.3 var(--font,Arial);color:#c2410c}.zmw-sm{font-size:14px;color:#6b5a3e;margin:3px 0}.zmw-res .btn{margin:8px auto 0;min-height:46px}';
document.head.appendChild(st);})();   // общие стили MGW (одинаковые в zagadala/muha — грузится любая первой)
(function(){if(document.getElementById('zmw-m-css'))return;const st=document.createElement('style');st.id='zmw-m-css';st.textContent=
'.zmh .zmh-goal{text-align:center;font:700 19px/1.3 var(--font,Arial);color:#3b2a14}.zmh-goal small{display:block;font-size:13px;font-weight:600;color:#7a6a50}'+
'.zmh-w{letter-spacing:2px}.zmh-w.t{color:#2f8a2d}'+
'.zmh-ch{flex:1 1 auto;min-height:40px;overflow-y:auto;width:100%;max-width:420px;display:flex;flex-direction:column;align-items:center;gap:3px}'+
'.zmh-li{display:flex;align-items:center;gap:6px}.zmh-li i{width:16px;font:600 12px/1 var(--font,Arial);color:#9a8a6a;text-align:right}'+
'.zmh-row{display:flex;gap:4px}.zmh-t{display:flex;align-items:center;justify-content:center;box-sizing:border-box;border:2px solid #b7c8da;border-radius:6px;background:#fff;'+
'font:700 18px/1 "Comic Sans MS","Segoe Print","Trebuchet MS",cursive;color:#22324a;text-transform:uppercase}'+
'.zmh-row.sm .zmh-t{width:30px;height:30px;font-size:16px}.zmh-row.big .zmh-t{width:52px;height:56px;font-size:30px;cursor:pointer}'+
'.zmh-t.ok{background:#e4f5e1;border-color:#7fbf7d}.zmh-t.sel{border-color:#c2410c;box-shadow:0 0 0 3px rgba(194,65,12,.3);background:#fff3e8}.zmh-t.hint{border-color:#d6a700;background:#fff3c4}'+
'.zmh-row.bad{animation:zmwSh .35s}'+
'.zmh-msg{min-height:22px;text-align:center;font:600 15px/1.3 var(--font,Arial);color:#5b4a2e;padding:0 8px}.zmh-msg.no{color:#b3261e}.zmh-msg.ok{color:#237a3b}'+
'.zmh-bt{display:flex;gap:6px;width:100%;max-width:420px}.zmh-bt .btn{flex:1 1 0;margin:0;min-height:44px;font-size:15px;padding:0 4px}'+
'.zmh .zmw-k:disabled{opacity:.45}.zmh-sol{font:600 16px/1.5 var(--font,Arial);color:#22324a;text-align:center;padding:6px}'+
'@media (max-width:340px){.zmh-row.big .zmh-t{width:46px;height:50px}}@media (max-height:600px){.zmh-row.big .zmh-t{height:46px}.zmh .zmw-k{height:40px}}';
document.head.appendChild(st);})();
})();
