'use strict';
/* zb-MGA мини-игра №4 «Вечерка» (Люся-почтальонка) + «Сканворд деда Семёна» по субботам и воскресеньям.
   Газетный кроссворд дня: будни — 5–7 слов, Сб–Вс — 12–15. Вопросы — толкования (GLOSS) и шутки Зины (DEFS). Нажми вопрос (или клетку) — под ним круг букв ответа.
   Одна газета на всех: раскладка строится здесь же из зерна дня (o.seed в режиме 'paper'/'day') и «ступени» игрока — пул слов уровней ≤ ступени
   (10/20/35/50/75/100/150/200/300/400/500/700/1000/1500 — наибольшая, не больше пройденных уровней), поэтому слова всегда из пройденных глав,
   а у игроков одной ступени газета одна. Генератор — gen() (тот же код гоняет ../tools/zmg_vecherka.py в jsc по 365 дням × ступеням).
   Подсказки: «💡 Буква» — без ограничения (считаются в h), «🎬 Открыть слово» — ролик по нужде, 1 за заход. «Сдать газету» — конец в любой момент.
   Звёзды: всё разгадано и подсказок 0 — 3★, ≤ 3 — 2★, иначе 1★; не всё — 1★ при половине слов, иначе 0. Награда — 10 💰 (оболочка, ZBECO.mg.vech).
   Праздники (host.fest): halloween — «Вечерка-страшилки», ny — новогодний выпуск: шкурка + 3 (Сб–Вс 5) праздничных слова с вопросами из js/zmg-vecherka-data.js (ZMG_VFEST, тексты TEXT fest.json) — курированные, вне правила «только пройденные». ПК: ↑/↓ — вопрос, буквы/Enter — круг, Tab — к газете.
   Договор — шапка js/zmg-core.js. Имена/классы — zma-. */
(function(){
if(typeof ZMG_REG!=='function')return;
const TIERS=[10,20,35,50,75,100,150,200,300,400,500,700,1000,1500];
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const cap=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t;
const tierOf=l=>{let t=TIERS[0];for(const x of TIERS)if(x<=l)t=x;return t;};
function RNG(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function dow(day){const s=String(day||'');const d=new Date(+s.slice(0,4),+s.slice(4,6)-1,+s.slice(6,8));return isNaN(d)?1:d.getDay();}
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const DOW=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
/* ---------- пул слов ступени: ответы уровней < T, существительные с вопросом, без отказных/грубых ---------- */
function stemIn(t,w){t=String(t).toLowerCase().replace(/ё/g,'е');return t.indexOf(w.slice(0,Math.max(3,w.length-2)))>=0;}
function clueOf(w,r){const G=typeof GLOSS!=='undefined'?GLOSS:{},D=typeof DEFS!=='undefined'?DEFS:{};
  const g=G[w]&&!stemIn(G[w],w)?G[w]:'',j=D[w]&&!stemIn(D[w],w)&&D[w].length<=110?D[w]:'';
  if(g&&j)return r()<.45?[j,1]:[g,0];return g?[g,0]:j?[j,1]:null;}
function pool(T){const out=[],seen={};let deny={},rude=null;
  try{if(typeof ZINA_DENY==='string')ZINA_DENY.split(' ').forEach(w=>deny[w]=1);}catch(e){}
  try{if(typeof ZINA_RUDE==='string'&&ZINA_RUDE&&typeof h32==='function'){rude={};ZINA_RUDE.split(' ').forEach(h=>rude[h]=1);}}catch(e){}
  const L=typeof LEVELS!=='undefined'?LEVELS:[];
  for(let i=0;i<T&&i<L.length;i++)for(const x of L[i].w||[]){const w=x[0];if(!w||seen[w]||deny[w]||w.length<3||w.length>8||!/^[а-я]+$/.test(w))continue;
    if(rude&&rude[h32(w)])continue;seen[w]=1;out.push(w);}
  return out;}
/* ---------- генератор кроссворда: детерминированно от rnd; words — кандидаты по порядку ---------- */
function gen(words,rnd,n,MW,MH){let best=null;
  for(let start=0;start<6&&start<words.length;start++){const r=place(words,start,n,MW,MH);if(!best||r.length>best.length)best=r;if(best.length>=n)break;}
  return best||[];}
function place(words,start,n,MW,MH){const cell={},dirs={},out=[];let x0=0,x1=0,y0=0,y1=0;
  const K=(r,c)=>r+','+c;
  function put(w,r,c,v){for(let i=0;i<w.length;i++){const rr=r+(v?i:0),cc=c+(v?0:i),k=K(rr,cc);cell[k]=w[i];dirs[k]=(dirs[k]||0)|(v?2:1);
      x0=Math.min(x0,cc);x1=Math.max(x1,cc);y0=Math.min(y0,rr);y1=Math.max(y1,rr);}out.push({w,r,c,v});}
  function fit(w,r,c,v){let cross=0;const bx0=Math.min(x0,c),by0=Math.min(y0,r),bx1=Math.max(x1,v?c:c+w.length-1),by1=Math.max(y1,v?r+w.length-1:r);
    if(bx1-bx0+1>MW||by1-by0+1>MH)return -1;
    const b=v?K(r-1,c):K(r,c-1),a=v?K(r+w.length,c):K(r,c+w.length);if(cell[b]||cell[a])return -1;
    for(let i=0;i<w.length;i++){const rr=r+(v?i:0),cc=c+(v?0:i),k=K(rr,cc),L=cell[k];
      if(L){if(L!==w[i]||(dirs[k]&(v?2:1)))return -1;cross++;continue;}
      const s1=v?K(rr,cc-1):K(rr-1,cc),s2=v?K(rr,cc+1):K(rr+1,cc);if(cell[s1]||cell[s2])return -1;}
    return cross;}
  const used={},w0=words[start];put(w0,0,0,false);used[w0]=1;
  for(let pass=0;pass<2&&out.length<n;pass++)for(let wi=0;wi<words.length&&out.length<n;wi++){const w=words[wi];if(used[w])continue;
    // не брать слово, целиком входящее в уже взятое (и наоборот) — газета скучнее
    let sub=false;for(const o of out)if(o.w.indexOf(w)>=0||w.indexOf(o.w)>=0){sub=true;break;}if(sub)continue;
    let bp=null,bc=0;
    for(const k in cell){const p=k.split(','),r0=+p[0],c0=+p[1],L=cell[k];if(dirs[k]===3)continue;const v=dirs[k]===1;
      for(let i=0;i<w.length;i++){if(w[i]!==L)continue;const r=v?r0-i:r0,c=v?c0:c0-i,cr=fit(w,r,c,v);if(cr>bc){bc=cr;bp=[r,c,v];}}}
    if(bp&&(bc>=1)){put(w,bp[0],bp[1],bp[2]);used[w]=1;}}
  // нормализация и номера
  out.forEach(o=>{o.r-=y0;o.c-=x0;});out.sort((a,b)=>a.r-b.r||a.c-b.c||(a.v?1:0)-(b.v?1:0));
  let num=0,last='';out.forEach(o=>{const k=o.r+','+o.c;if(k!==last){num++;last=k;}o.n=num;});
  out.W=x1-x0+1;out.H=y1-y0+1;return out;}
/* ---------- выпуск: зерно дня + ступень → {sun, T, words:[{w,r,c,v,n,q,j}], W, H} ---------- */
function issue(seed,day,lvl,fest){const T=tierOf(Math.max(TIERS[0],lvl|0)),wk=dow(day),sun=wk===0||wk===6;
  const rnd=RNG((seed^Math.imul(T,2654435761))>>>0);
  // праздник (halloween/ny): впереди 3–5 праздничных слов со своими вопросами (ZMG_VFEST), остальное — пул ступени
  const FQ={},FL=fest&&typeof ZMG_VFEST!=='undefined'&&ZMG_VFEST[fest]?ZMG_VFEST[fest].slice():[];
  for(let i=FL.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=FL[i];FL[i]=FL[j];FL[j]=t;}
  FL.forEach(x=>FQ[x[0]]=x[1]);const F=FL.map(x=>x[0]).slice(0,sun?5:3);
  const P=pool(T).filter(w=>!FQ[w]&&clueOf(w,()=>0));for(let i=P.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=P[i];P[i]=P[j];P[j]=t;}
  // сначала длинные (каркас), потом короткие (заполнение)
  const L=F.concat(P.filter(w=>w.length>=5),P.filter(w=>w.length<5));
  const n=sun?12+Math.floor(rnd()*4):5+Math.floor(rnd()*3),MW=sun?12:9,MH=sun?12:9;
  const g=gen(L,rnd,n,MW,MH);
  const words=g.map(o=>{const q=FQ[o.w]?[FQ[o.w],1]:clueOf(o.w,rnd)||['',0];return {w:o.w,r:o.r,c:o.c,v:o.v,n:o.n,q:cap(q[0]),j:q[1]};});
  return {sun,T,words,W:g.W||0,H:g.H||0,n,fw:words.filter(x=>FQ[x.w]).length};}
const SAY={start:['Свежая, ещё краской пахнет! Разгадаешь — Зина пятёрку поставит.','Вот ваша «Вечерка»! Весь подъезд уже гадает.','Газетку несу! Кроссворд сегодня — загляденье.'],
  sun:['Выходной! Дед Семён прислал свой сканворд — большой, на весь вечер.','Сканворд деда Семёна! Говорит, сам с 1974-го разгадывает.'],
  ok:['Верно!','Есть!','Вписываю!','Умница!','Так и есть!'],bad:['Не то слово…','Не подходит.','Мимо, подумай ещё.']};
ZMG_REG({id:'vecherka',deps:['krug','js/zmg-vecherka-data.js'],
  open:()=>typeof LEVELS!=='undefined',
  lines:{good:'Вся газета разгадана! Люся, неси завтра ещё.',ok:'Почти всю разгадали — завтра будет новая.',bad:'Ничего, газету можно и завтра дочитать.'},
  sim(o,k){const n=6;let h=0,s=0;for(let i=0;i<n;i++){if(o.rnd()<.4+.55*k)s++;else h+=1+(o.rnd()*2|0);}return {sc:s,st:s===n?(h===0?3:h<=3?2:1):s>=n/2?1:0};},
  gen,issue,pool,tierOf,
  run(host,o){const day=o.day,seed=o.seed>>>0,fest=host.fest&&host.fest.id,iss=issue(seed,day,o.lvl,fest),W=iss.words;if(W.length<3){host.quit();return;}
    const R=RNG(seed^0x51ed);
    let cur=-1,hints=0,adUsed=false,fin=false,K=null,solvedN=0;
    W.forEach(x=>{x.open={};x.done=false;x.by='';});
    const at={};W.forEach((x,i)=>{for(let k=0;k<x.w.length;k++){const key=(x.r+(x.v?k:0))+','+(x.c+(x.v?0:k));(at[key]=at[key]||[]).push([i,k]);}});
    const dd=String(day),dt=+dd.slice(6,8)+' '+(MON[+dd.slice(4,6)-1]||''),num=Math.max(1,Math.round((new Date(+dd.slice(0,4),+dd.slice(4,6)-1,+dd.slice(6,8))-new Date(2026,0,1))/864e5)+1);
    const mastT=fest==='halloween'?'ВЕЧЕРКА-СТРАШИЛКИ':fest==='ny'?'НОВОГОДНЯЯ ВЕЧЕРКА':iss.sun?'СКАНВОРД ДЕДА СЕМЁНА':'ВЕЧЕРКА';
    host.el.innerHTML='<div class="zma-wrap zma-vc'+(fest?' zma-'+esc(fest):'')+(iss.sun?' zma-vc-sun':'')+'"><div class="zma-vc-paper">'+
      '<div class="zma-vc-mast"><h1>'+mastT+'</h1><div><span>№ '+num+'</span><span>'+esc(DOW[dow(day)]+', '+dt)+'</span><span>'+(iss.sun?'выходной выпуск':'цена 0 коп.')+'</span></div></div>'+
      '<div class="zma-vc-sec">'+(iss.sun?'РАЗГАДАЙ С ДЕДОМ СЕМЁНОМ':'РАЗГАДАЙ С БАБОЙ ЗИНОЙ')+'</div>'+
      '<div class="zma-vc-body"><div class="zma-vc-left"><div class="zma-vc-grid"></div></div><div class="zma-vc-right"><ol class="zma-vc-qs"></ol><div class="zma-vc-solve"></div></div></div></div>'+
      '<div class="zma-row zma-vc-bar"><button class="btn sec zma-vc-give">Сдать газету</button></div></div>';
    const $=s=>host.el.querySelector(s),root=$('.zma-vc'),grid=$('.zma-vc-grid'),qs=$('.zma-vc-qs'),solve=$('.zma-vc-solve'),bGive=$('.zma-vc-give');
    // клетки
    let cs=30;
    const wide=()=>host.w>=860&&host.h>=540;
    function size(){root.classList.toggle('wide',wide());root.classList.toggle('nogrid',cur>=0&&!wide()&&host.h<800);
      const rows=iss.H,cols=iss.W,avail=wide()?Math.min(host.w,1000)/2-40:Math.min(host.w-36,540);
      const hMax=wide()?host.h-150:Math.max(150,(host.h||600)*(cur>=0?.3:.42));
      cs=Math.max(18,Math.min(38,Math.floor(avail/cols),Math.floor(hMax/rows)));grid.style.width=cols*cs+'px';grid.style.height=rows*cs+'px';
      grid.style.setProperty('--cs',cs+'px');}
    function cellsHtml(){let h='';const st={};W.forEach(x=>{st[x.r+','+x.c]=x.n;});
      for(const key in at){const p=key.split(','),r=+p[0],c=+p[1];let ch='',cls='zma-vc-c';
        for(const [i,k] of at[key]){const x=W[i];if(x.done||x.open[k])ch=x.w[k];if(i===cur)cls+=' sel';}
        if(ch&&at[key].every(([i])=>W[i].done))cls+=' ok';
        h+='<div class="'+cls+'" data-k="'+key+'" style="top:'+r*cs+'px;left:'+c*cs+'px">'+(st[key]?'<sup>'+st[key]+'</sup>':'')+esc(ch.toUpperCase())+'</div>';}
      grid.innerHTML=h;[].forEach.call(grid.querySelectorAll('.zma-vc-c'),e=>e.onclick=()=>{const L=at[e.dataset.k];if(!L)return;
        const ids=L.map(a=>a[0]);let pick=ids.find(i=>!W[i].done&&i!==cur);if(pick==null)pick=ids.find(i=>!W[i].done);if(pick!=null){try{host.snd.tap();}catch(x){}sel(pick);}});}
    function strip(){const e=solve.querySelector('.zma-vc-strip');if(!e||cur<0)return;const x=W[cur];let h='';
      for(let j=0;j<x.w.length;j++){const key=(x.r+(x.v?j:0))+','+(x.c+(x.v?0:j));const kn=x.done||x.open[j]||(at[key]||[]).some(([i])=>W[i].done);
        h+='<b class="'+(x.done?'ok':kn?'h':'')+'">'+(kn?esc(x.w[j].toUpperCase()):'')+'</b>';}e.innerHTML=h;}
    function arrow(x){return x.v?'↓':'→';}
    function listHtml(){qs.innerHTML=W.map((x,i)=>'<li data-i="'+i+'" class="'+(x.done?'done':'')+(i===cur?' cur':'')+'"><b>'+x.n+arrow(x)+'</b> '+esc(x.q)+(x.j?' <i class="zma-vc-j">😄</i>':'')+
      ' <span class="zma-vc-len">('+x.w.length+')</span>'+(x.done?' ✔':'')+'</li>').join('');
      [].forEach.call(qs.querySelectorAll('li'),e=>e.onclick=()=>{const i=+e.dataset.i;if(W[i].done)return;try{host.snd.tap();}catch(x){}sel(i);});}
    function draw(){size();cellsHtml();listHtml();strip();host.top(solvedN+' из '+W.length);bGive.textContent=solvedN?'Сдать газету':'Сдать газету';}
    function sel(i){cur=i;root.classList.add('solving');const x=W[i];
      solve.innerHTML='<div class="zma-vc-strip"></div><div class="zma-vc-q"><b>'+x.n+arrow(x)+'</b> '+esc(x.q)+' <span class="zma-vc-len">('+x.w.length+' '+(typeof plural==='function'?plural(x.w.length,'буква','буквы','букв'):'букв')+')</span></div>'+
        '<div class="zma-vc-msg"></div><div class="zma-kr"></div><div class="zma-row"><button class="btn zma-vc-h">💡 Буква</button>'+
        (!adUsed&&host.adOk()?'<button class="btn zbad zmg-ad zma-vc-ad">🎬 Слово</button>':'')+
        '<button class="btn sec zma-vc-back">'+(host.pc?host.kc('Tab')+' ':'')+'📰 Газета</button></div>';
      try{if(K)K.destroy();}catch(e){}K=null;
      solve.querySelector('.zma-vc-h').onclick=()=>{try{host.snd.tap();}catch(e){}hint();};
      solve.querySelector('.zma-vc-back').onclick=()=>{try{host.snd.tap();}catch(e){}back();};
      const ab=solve.querySelector('.zma-vc-ad');if(ab)ab.onclick=()=>{ab.disabled=true;host.adNeed('word').then(ok=>{if(ok&&!fin&&cur>=0){adUsed=true;hints++;solveCur('ad');}else{ab.disabled=false;}if(ok){adUsed=true;const b=solve.querySelector('.zma-vc-ad');if(b)b.remove();}});};
      draw();try{host.el.querySelector('.zma-wrap').scrollTop=0;}catch(e){}
      // круг — по месту, что осталось под вопросом (кнопки и строка набора должны влезть без прокрутки)
      const kr=solve.querySelector('.zma-kr'),top=kr.getBoundingClientRect().top-host.el.getBoundingClientRect().top;
      const avail=host.h-top-58-122-20-(host.pc?48:0);
      K=host.krug(kr,{letters:x.w,onWord:word,min:2,size:Math.max(124,Math.min(wide()?300:260,avail))});}
    function back(){cur=-1;root.classList.remove('solving');try{if(K)K.destroy();}catch(e){}K=null;solve.innerHTML='';draw();}
    function msg(t,c){const m=solve.querySelector('.zma-vc-msg');if(m){m.className='zma-vc-msg '+(c||'');m.textContent=t;}}
    function word(w){if(cur<0||fin)return 'bad';const x=W[cur];if(w===x.w){solveCur('me');return 'ok';}
      // слово подходит в другой вопрос? засчитаем туда
      const j=W.findIndex(y=>!y.done&&y.w===w);if(j>=0){W[j].done=true;W[j].by='me';solvedN++;msg('Это ответ на вопрос '+W[j].n+arrow(W[j])+' — вписала!','ok');draw();check();return 'ok';}
      msg(SAY.bad[(R()*3)|0],'no');return 'bad';}
    function solveCur(by){const x=W[cur];if(!x||x.done)return;x.done=true;x.by=by;solvedN++;try{host.snd.word&&host.snd.word(x.w.length,solvedN);}catch(e){}
      if(check())return;const nx=nextOpen(cur);msg(SAY.ok[(R()*5)|0],'ok');
      if(nx>=0)setTimeout(()=>{if(!fin&&W[cur]&&W[cur].done)sel(nx);},host.calm?900:650);else back();}
    function nextOpen(i){for(let k=1;k<=W.length;k++){const j=(i+k)%W.length;if(!W[j].done)return j;}return -1;}
    function check(){if(W.every(x=>x.done)){draw();setTimeout(end,700);fin=true;try{if(K)K.lock(true);}catch(e){}return true;}return false;}
    function hint(){if(cur<0||fin)return;const x=W[cur];let k=-1;for(let j=0;j<x.w.length;j++){const key=(x.r+(x.v?j:0))+','+(x.c+(x.v?0:j));
        const known=x.open[j]||(at[key]||[]).some(([i])=>W[i].done);if(!known){k=j;break;}}
      if(k<0){solveCur('hint');hints++;return;}x.open[k]=1;hints++;
      // открытая буква видна и в пересекающих словах
      const key=(x.r+(x.v?k:0))+','+(x.c+(x.v?0:k));(at[key]||[]).forEach(([i,kk])=>{W[i].open[kk]=1;});
      try{host.snd.letter&&host.snd.letter(k);}catch(e){}draw();
      if(Object.keys(x.open).length>=x.w.length)solveCur('hint');}
    let ended=false;
    function end(){if(ended)return;ended=true;fin=true;const me=W.filter(x=>x.by==='me'||x.by==='hint').length,all=W.every(x=>x.done);
      const st=all?(hints===0?3:hints<=3?2:1):(solvedN>=W.length/2?1:0);
      host.finish({sc:me,st,h:hints,label:solvedN+' из '+W.length+' слов'+(iss.sun?' сканворда':'')});}
    bGive.onclick=()=>{try{host.snd.tap();}catch(e){}if(fin)return;fin=true;end();};
    host.keys(k=>{if(fin)return false;if(k==='Tab'){if(cur>=0)back();else{const j=nextOpen(-1);if(j>=0)sel(j);}return true;}
      if(k==='ArrowDown'||k==='ArrowUp'){const d=k==='ArrowDown'?1:-1;let j=cur;for(let t=0;t<W.length;t++){j=(j+d+W.length)%W.length;if(!W[j].done)break;}if(j>=0&&!W[j].done)sel(j);return true;}
      if(cur<0&&(k==='Enter'||k===' ')){const j=nextOpen(-1);if(j>=0)sel(j);return true;}return false;});
    host.onResize(()=>{if(!fin)draw();});
    host.onQuit(()=>{fin=true;});
    host.bot=k=>{if(fin)return;if(cur<0){const j=nextOpen(-1);if(j>=0)sel(j);return;}const x=W[cur];if(!K||x.done)return;
      if(Math.random()<k)K.type(x.w);else hint();};
    draw();
    host.intro({who:iss.sun?'semyon':'lyusya',text:esc(iss.sun?SAY.sun[(R()*2)|0]:SAY.start[(R()*3)|0])+' <b>Нажми на вопрос — соберёшь ответ из букв.</b>',
      btn:iss.sun?'Разгадывать сканворд':'Читать газету',hint:W.length+' слов · без спешки · подсказки — без штрафа'}).then(()=>{const j=nextOpen(-1);if(j>=0)sel(j);else draw();});}});
(function(){if(document.getElementById('zma-vc-css'))return;const st=document.createElement('style');st.id='zma-vc-css';st.textContent=
'.zma-vc-paper{margin:0 auto;width:calc(100% - 20px);max-width:560px;box-sizing:border-box;background:#f4ecd6;border:1px solid #d9cba5;box-shadow:0 2px 10px rgba(80,60,20,.15);display:flex;flex-direction:column;padding-bottom:8px}'+
'.zma-vc-mast{text-align:center;border-bottom:3px double #3a3326;padding:6px 8px 4px}.zma-vc-mast h1{margin:0;font:900 24px/1.1 Georgia,"Times New Roman",serif;letter-spacing:2px;color:#2b241a}'+
'.zma-vc-mast div{font:600 12px Georgia,serif;color:#5b4f3a;display:flex;justify-content:space-between;gap:6px;margin-top:2px}'+
'.zma-vc-sec{font:700 13px Georgia,serif;text-align:center;padding:4px;color:#7a2d1f;border-bottom:1px solid #b9a77f}'+
'.zma-vc-grid{position:relative;margin:10px auto 6px;--cs:30px}'+
'.zma-vc-c{position:absolute;width:var(--cs);height:var(--cs);box-sizing:border-box;background:#fff;border:1.5px solid #8d7d5c;display:flex;align-items:center;justify-content:center;'+
'font:800 calc(var(--cs)*.55)/1 var(--font,Arial);color:var(--blue,#1d4fa3);cursor:pointer;margin:-0.75px 0 0 -0.75px}'+
'.zma-vc-c sup{position:absolute;top:1px;left:2px;font:600 calc(var(--cs)*.3)/1 Arial;color:#5b4f3a}'+
'.zma-vc-c.sel{background:#fff4c9;border-color:#e08a00;z-index:1}.zma-vc-c.ok{color:var(--green2,#237a3b)}'+
'.zma-vc-qs{list-style:none;margin:0;padding:0 10px;font:17px/1.3 Georgia,serif;color:#2b241a}'+
'.zma-vc-qs li{padding:6px 6px;border-radius:8px;margin-bottom:2px;cursor:pointer;min-height:24px}.zma-vc-qs li.done{color:#8a7d64;text-decoration:line-through;cursor:default}'+
'.zma-vc-qs li.cur{background:#fff4c9;outline:2px solid #f5b72d}.zma-vc-len{color:#8a7d64;font-size:14px;white-space:nowrap}.zma-vc-j{font-style:normal;font-size:14px}'+
'.zma-vc.solving .zma-vc-qs,.zma-vc.solving .zma-vc-bar{display:none}.zma-vc.nogrid .zma-vc-left,.zma-vc.nogrid .zma-vc-mast div{display:none}.zma-vc.nogrid .zma-vc-mast h1{font-size:18px}'+
'.zma-vc-strip{display:flex;justify-content:center;gap:3px;margin:8px 10px 0;flex-wrap:wrap}.zma-vc-strip b{width:32px;height:36px;background:#fff;border:1.5px solid #8d7d5c;display:flex;align-items:center;justify-content:center;font:900 20px/1 var(--font,Arial);color:var(--blue,#1d4fa3)}'+
'.zma-vc-strip b.h{background:#fff4c9}.zma-vc-strip b.ok{color:var(--green2,#237a3b)}'+
'.zma-vc.wide .zma-vc-paper{max-width:1000px}.zma-vc.wide .zma-vc-body{display:flex;gap:14px;align-items:flex-start;padding:0 8px}.zma-vc.wide .zma-vc-left{flex:0 0 auto;min-width:46%}.zma-vc.wide .zma-vc-right{flex:1 1 auto;min-width:0;padding-top:10px}'+
'.zma-vc.wide .zma-vc-strip{display:none}'+
'.zma-vc-q{margin:4px 10px 0;padding:8px 10px;border-radius:10px;background:#fff4c9;outline:2px solid #f5b72d;font:18px/1.3 Georgia,serif;color:#2b241a}'+
'.zma-vc-msg{min-height:20px;text-align:center;font:700 15px/1.3 var(--font,Arial);margin-top:4px}.zma-vc-msg.ok{color:var(--green2,#237a3b)}.zma-vc-msg.no{color:var(--red2,#d0342c)}'+
'.zma-vc .zma-kr{min-height:0;flex:0 0 auto}.zma-vc .zma-row .btn{font-size:16px;padding:6px 6px;white-space:nowrap}.zma-vc .zma-row{gap:8px}'+
'.zma-vc-bar{margin-top:10px}'+
'.zma-vc-sun .zma-vc-mast h1{font-size:21px}.zma-vc-sun .zma-vc-qs{font-size:16px}'+
'.zma-halloween .zma-vc-paper{background:#2d2a36;border-color:#4a4458;color:#f0e6d2}.zma-halloween .zma-vc-mast h1{color:#ff9b3d}.zma-halloween .zma-vc-mast div,.zma-halloween .zma-vc-sec{color:#d9c9a8}'+
'.zma-halloween .zma-vc-qs{color:#f0e6d2}.zma-halloween .zma-vc-q{background:#3d3550;color:#fff}.zma-halloween .zma-vc-mast{border-color:#ff9b3d}'+
'.zma-ny .zma-vc-paper{background:#eef6fc;border-color:#b7d3ea}.zma-ny .zma-vc-mast h1{color:#b3261e}.zma-ny .zma-vc-mast h1:before,.zma-ny .zma-vc-mast h1:after{content:" ❄ ";color:#5aa0d8}'+
'@media (max-height:600px){.zma-vc-strip b{height:30px;width:28px;font-size:17px}.zma-vc-q{font-size:15px!important;padding:5px 8px!important}.zma-vc-len{display:none}}'+
'@media (max-height:620px){.zma-vc-mast h1{font-size:19px}.zma-vc-mast div{display:none}.zma-vc-q{font-size:16px;padding:6px 8px}.zma-vc-qs{font-size:16px}}';
document.head.appendChild(st);})();
// общие стили игр MGA (одинаковые в каждом файле — грузится любая первой)
(function(){if(document.getElementById('zma-css'))return;const st=document.createElement('style');st.id='zma-css';st.textContent=
'.zma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:8px 0 10px;min-height:0;overflow-y:auto}'+
'.zma-kr{flex:1 1 auto;min-height:250px;display:flex;align-items:center;justify-content:center}'+
'.zma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 24px);max-width:480px}.zma-row .btn{flex:1 1 0;min-height:50px;font-size:17px;margin:0}'+
'@media (max-height:620px){.zma-kr{min-height:210px}}';document.head.appendChild(st);})();
})();
