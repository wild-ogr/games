'use strict';
/* MGB затея №11 «Пословицы» (ведёт Валерка; 09.10 — вместо «Городов», решение владельца). Валерка начинает пословицу или поговорку,
   игрок выбирает концовку из трёх: одна настоящая, две — шутливые «дворовые» переделки Валерки в том же ритме. После ответа — вся пословица
   и её смысл в одну строку. 8 пословиц за заход, без таймера. Ступени: 8/8 — 3★, 6–7 — 2★, 4–5 — 1★ (как у «Городов»).
   ПК: 1–3 — выбрать, Enter/пробел — дальше. Мышь и касание работают всегда.
   Пословицы — VMB_POSL (js/vmg-posl-data.js, собирает tools/vmb_content.py из tools/vmb-src/posl.txt + проверка check-posl.jsonl):
   [номер, начало, настоящая концовка, [2 ложные], смысл]; номер — постоянный (id в статистике posl-NNN), новые — только в конец.
   Затея дня (o.mode='day') — одинаково у всех по дате; в остальных заходах — свой круг игрока host.mem().k (повтор — после всего банка).
   Статистика: на каждый ответ STATANS.ans({id:'posl-NNN', ok, mode:'vmg-posl', step, sec}) — кроме тренировки. S.seen не трогаем. */
(function(){if(typeof VMG_REG!=='function')return;   // без оболочки MG0 затея не регистрируется
const ID='posl',N=8,TH=[4,6,8];
const V=window.VMB;
function bank(){return Array.isArray(window.VMB_POSL)?window.VMB_POSL.filter(p=>p&&p[0]>0&&p[1]&&p[2]&&Array.isArray(p[3])&&p[3].length===2&&p[4]):[];}
/* пословицы захода: день — по номеру дня (у всех одинаково), иначе — свой круг */
function make(o){const B=bank(),L=B.length;if(!L)return [];const P=V.perm(L,0x9051),out=[];let st;
  if(o.mode==='day')st=V.dayN(o.day)*N;
  else{const b=V.box(ID);st=b&&b.k>=0?b.k|0:Math.floor((o.rnd||Math.random)()*L);if(b)b.k=(st+N)%L;}
  for(let i=0;i<Math.min(N,L);i++){const p=B[P[(st+i)%L]];
    // порядок концовок перемешан зерном захода (одинаково у всех в день)
    const R=V.R((o.seed||1)+i*7919),ord=V.mix([0,1,2],R),e=[p[2],p[3][0],p[3][1]];
    out.push({n:p[0],b:p[1],e:ord.map(k=>e[k]),o:ord.indexOf(0),x:p[4]});}
  return out;}
const pad=n=>('00'+n).slice(-3);
const CSS=
'.vmb.po{--acc:#c2410c}'+
'.vmb-po-card{position:relative;background:#fffdf3;border:var(--bd);border-radius:18px;box-shadow:var(--sh);padding:14px 16px 14px 20px;animation:vmbPop .3s ease-out both;'+
 'background-image:repeating-linear-gradient(transparent 0 calc(30px*var(--k)),#e9e1c8 calc(30px*var(--k)) calc(31px*var(--k)))}'+
'.vmb-po-card:before{content:"";position:absolute;left:10px;top:12px;bottom:12px;width:3px;border-radius:2px;background:#ef9a9a}'+
'.vmb-po-b{font:800 calc(23px*var(--k))/1.25 KF,Rubik,sans-serif;color:var(--ink);word-break:break-word}'+
'.vmb-po-b i{font-style:normal;color:#c2410c}'+
'.vmb-po-b em{font-style:normal;color:var(--okd);background:linear-gradient(transparent 60%,#bff0cc 60%)}'+
'.vmb-po-op{display:flex;flex-direction:column;gap:10px;margin-top:12px}.vmb-po-out:not(:empty){margin-top:12px}'+
'.vmb-po-o{position:relative;appearance:none;-webkit-appearance:none;font:inherit;cursor:pointer;min-height:calc(58px*var(--k));padding:8px 14px 8px 44px;border-radius:16px;border:var(--bd);background:#fff;box-shadow:0 4px 0 var(--o);'+
 'font-weight:700;font-size:calc(19px*var(--k));line-height:1.2;color:var(--ink);text-align:left;touch-action:manipulation;transition:transform .08s,box-shadow .08s,background .2s;animation:vmbIn .3s ease-out both}'+
'.vmb-po-o:nth-child(2){animation-delay:.05s}.vmb-po-o:nth-child(3){animation-delay:.1s}'+
'.vmb-po-o:active{transform:translateY(3px);box-shadow:0 1px 0 var(--o)}'+
'.vmb-po-o .vmb-po-k{position:absolute;left:10px;top:50%;margin-top:-14px;width:26px;height:28px;border-radius:8px;background:var(--gold);border:2px solid var(--o);display:flex;align-items:center;justify-content:center;font:900 16px/1 KF,Rubik,sans-serif;color:#3b2a00}'+
'@media (hover:hover){.vmb-po-o:not([disabled]):hover{background:#fff4e6}}'+
'.vmb-po-o[disabled]{cursor:default}'+
'.vmb-po-o.ok{background:var(--ok);color:#fff;border-color:var(--okd);box-shadow:0 3px 0 var(--okd)}'+
'.vmb-po-o.no{background:#fde6e4;border-color:var(--nod);box-shadow:0 2px 0 var(--nod);color:var(--nod)}.vmb-po-o.no .t{text-decoration:line-through;text-decoration-thickness:2px}'+
'.vmb-po-o.dim{opacity:.5}'+
'.vmb-po-o .vmb-po-tag{display:block;font-size:.7em;font-weight:800;margin-top:2px;opacity:.9}'+
'.vmb-po-nx{width:100%}'+
'.vmb.po.done .vmb-po-o.dim{display:none}'+   // после ответа лишние переделки убираем — место под смысл и «Дальше»
'@media (max-width:370px){.vmb-po-b{font-size:calc(20px*var(--k))}.vmb-po-o{font-size:calc(17px*var(--k));min-height:calc(52px*var(--k))}.vmb-po-op{gap:8px}}'+
'@media (max-height:600px){.vmb-po-card{padding:10px 12px 10px 18px}.vmb-po-op{gap:8px;margin-top:10px}}'+
'@media (min-width:760px) and (min-height:520px){.vmb-po-b{font-size:calc(27px*var(--k))}.vmb-po-o{font-size:calc(21px*var(--k));min-height:calc(64px*var(--k))}.vmb-po-op{gap:12px}}';
function css(){if(document.getElementById('vmbPoCss'))return;const s=document.createElement('style');s.id='vmbPoCss';s.textContent=CSS;document.head.appendChild(s);}
const ASK=['Как там дальше, помнишь?','Ну-ка, договори!','Бабушка так говорила… а дальше как?','Я тут конец подзабыл. Выручишь?','А чем кончается, а?','Тут я мог и приврать. Какой конец настоящий?','Ещё одна! Как дальше?','Последняя! Чем кончается?'];
const OK=['Точно! Не купился на мои шутки.','Верно! Так и говорят.','Знаток! Тебя не проведёшь.','Оно самое!','В точку!','Правильно! Это я так, для смеха.','Молодец, помнишь!','Верно! Вот это память!'];
const NO=['Ха, купился! Это я сочинил.','Попался! Это моя переделка.','Эх, это я присочинил!','Не-а, это Валеркина отсебятина!'];
function run(host,o){css();const R=o.rnd||Math.random;
  const W=V.shell(host,{cls:'po',who:'valerka',name:'Пословицы',mark:'po',nm:'Валерка'});const Q=make(o);if(o.mode!=='day')V.save();W.pips(Q.length||N);   // круг сдвинут сразу — вышел посреди захода, в следующий раз будут новые
  const st={i:0,sc:0,lock:0,done:0,t0:0};
  function show(){const q=Q[st.i];if(!q){finish();return;}W.el.classList.remove('done');W.fit(0);W.pip(st.i,'cur');W.prog((st.i+1)+' из '+Q.length);st.lock=0;st.t0=Date.now();
    W.say(ASK[st.i===Q.length-1?7:st.i%7],'happy','Пословица '+(st.i+1)+' из '+Q.length);
    W.main.innerHTML='<div class="vmb-po-card"><div class="vmb-po-b">'+V.esc(q.b)+(/[,—:]$/.test(q.b)?' ':'')+'<i>…</i></div></div>'+
      '<div class="vmb-po-op">'+q.e.map((e,k)=>'<button class="vmb-po-o" data-k="'+k+'"><span class="vmb-po-k">'+(k+1)+'</span><span class="t">…'+V.esc(e)+'</span></button>').join('')+'</div>'+
      '<div class="vmb-po-out"></div>'+(st.i===0?'<p class="vmb-pchint">На компьютере: клавиши 1–3 — выбрать, Enter — дальше</p>':'');
    for(const b of V.$a(W.main,'.vmb-po-o'))b.onclick=()=>pick(+b.dataset.k);W.top();}
  function stat(q,ok){if(o.train)return;try{if(window.STATANS&&typeof STATANS.ans==='function')
    STATANS.ans({id:'posl-'+pad(q.n),ok:ok?1:0,mode:'vmg-posl',step:st.i+1,price:0,tries:ok?0:1,sec:Math.min(600,Math.round((Date.now()-st.t0)/1000)),d:0,hint:''});}catch(e){}}
  function pick(k){const q=Q[st.i];if(st.lock||!q||!q.e[k])return;st.lock=1;const ok=k===q.o;if(ok)st.sc++;stat(q,ok);
    const bs=V.$a(W.main,'.vmb-po-o');bs.forEach((b,j)=>{b.disabled=true;if(j===q.o)b.classList.add('ok');else if(j===k){b.classList.add('no');b.insertAdjacentHTML('beforeend','<span class="vmb-po-tag">переделка Валерки</span>');}else b.classList.add('dim');});
    if(ok)V.pop(bs[q.o],16);else{V.shake(bs[k]);V.buzz(60);}
    W.pip(st.i,ok?'ok':'no');V.snd(host,ok?'right':'wrong');
    W.say(ok?OK[st.i%OK.length]:NO[st.i%NO.length],ok?'happy':'wow','Пословица '+(st.i+1)+' из '+Q.length);
    V.$q(W.main,'.vmb-po-b').innerHTML=V.esc(q.b)+' <em>'+V.esc(q.e[q.o])+'</em>';
    const last=st.i>=Q.length-1;W.el.classList.add('done');
    V.$q(W.main,'.vmb-po-out').innerHTML='<div class="vmb-note '+(ok?'ok':'no')+'"><b class="h">'+(ok?'Верно! Так и говорят':'Не та концовка — это Валеркина шутка')+'</b>'+V.esc(q.x)+'</div>'+
      '<button class="vmb-btn go vmb-po-nx" id="vmbPoN" style="margin-top:10px">'+(last?'Итоги':'Дальше ▸')+' '+V.kc('Enter')+'</button>';
    const n=document.getElementById('vmbPoN');n.onclick=()=>{V.snd(host,'tap');st.i++;show();};
    W.fit();try{n.scrollIntoView({block:'nearest',behavior:V.calm()?'auto':'smooth'});}catch(e){}}
  function finish(){if(st.done)return;st.done=1;V.save();host.done({score:st.sc,tier:V.tier(st.sc,TH),label:st.sc+' из '+Q.length+' — верно'});}
  V.keys(host,k=>{const n=document.getElementById('vmbPoN');if(n&&(k==='Enter'||k===' ')){n.click();return true;}
    const i={'1':0,'2':1,'3':2}[k];if(i==null||st.lock)return false;pick(i);return true;});
  host.onQuit(()=>{st.done=1;});
  if(!Q.length){W.say('Ой, тетрадка с пословицами потерялась. Загляни попозже!','sad');W.main.innerHTML='';setTimeout(()=>host.done({score:0,tier:0,label:'нет пословиц'}),50);return;}
  show();
  if(/[?&]vmg=/.test(location.search))window.__auto=()=>{const n=document.getElementById('vmbPoN');if(n){n.click();return;}const q=Q[st.i];if(q&&!st.lock)pick(R()<.8?q.o:(q.o+1)%3);};
  window.__vmbPo={st,Q,pick};}
function sim(o,k){const r=V.R((o.seed||1)^0x9051),p=Math.min(.97,.45+k*.5);let s=0;for(let i=0;i<N;i++)if(r()<p)s++;return {score:s,tier:V.tier(s,TH)};}
VMG_REG({id:ID,run,sim,make});
})();
