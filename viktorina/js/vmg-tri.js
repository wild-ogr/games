'use strict';
/* MGB затея №9 «По трём подсказкам» (загадывает Михалыч). 5 загадок; у каждой 3 подсказки — от трудной к лёгкой — и 4 варианта, видны сразу.
   Ответил с 1-й подсказки — 3 очка, со 2-й — 2, с 3-й — 1. Неверный ответ — вариант зачёркивается и открывается следующая подсказка (очков меньше);
   неверно после 3-й — 0 очков, Михалыч называет ответ. Без таймера. Ступени по очкам из 15: 12+ — 3★, 9+ — 2★, 5+ — 1★.
   ПК: 1–4 — ответ, пробел — ещё подсказка, Enter — дальше. Карточки — VMB_TRI (js/vmg-tri-data.js, собирает tools/vmb_content.py).
   Затея дня (o.mode='day') — одинаково у всех по дате; иначе — свой круг S.vmg.tri.k. S.seen не трогаем. */
(function(){if(typeof VMG_REG!=='function')return;   // без оболочки MG0 затея не регистрируется
const ID='tri',N=5,TH=[5,9,12];
const V=window.VMB;
function bank(){return Array.isArray(window.VMB_TRI)?window.VMB_TRI.filter(c=>c&&Array.isArray(c[2])&&c[2].length===4&&Array.isArray(c[3])&&c[3].length===3):[];}
function make(o){const B=bank(),L=B.length;if(!L)return [];const P=V.perm(L,0x7e1),out=[];let st;
  if(o.mode==='day')st=V.dayN(o.day)*N;
  else{const b=V.box(ID);st=b&&b.k>=0?b.k|0:Math.floor((o.rnd||Math.random)()*L);if(b)b.k=(st+N)%L;}
  for(let i=0;i<Math.min(N,L);i++){const c=B[P[(st+i)%L]],R=V.R((o.seed||1)+i*104729),ord=V.mix([0,1,2,3],R);
    out.push({t:c[0],k:c[1],a:ord.map(j=>c[2][j]),ok:ord.indexOf(0),c:c[3],x:c[4]||''});}
  return out;}
const CSS=
'.vmb.tri{--acc:#2f6fb5}'+
'.vmb-tr-cl{display:flex;flex-direction:column;gap:8px}'+
'.vmb-tr-c{position:relative;display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:16px;border:var(--bd);background:#fff;box-shadow:0 3px 0 var(--o);font-weight:600;font-size:calc(17.5px*var(--k));line-height:1.3;animation:vmbIn .35s ease-out both}'+
'.vmb-tr-c .n{flex:none;width:30px;height:30px;border-radius:50%;background:var(--acc);border:2px solid var(--o);color:#fff;font:800 16px/26px Manrope,KF,sans-serif;text-align:center}'+
'.vmb-tr-c.lock{appearance:none;-webkit-appearance:none;font:inherit;cursor:pointer;width:100%;text-align:left;background:#eaf3ff;border-style:dashed;border-color:var(--acc);box-shadow:none;color:var(--acc);font-weight:800;font-size:calc(17px*var(--k));align-items:center;min-height:52px;padding:7px 12px;touch-action:manipulation}'+
'.vmb-tr-c.lock .t{flex:1}.vmb-tr-c.lock small{font-weight:600;color:var(--ink2);font-size:.86em}.vmb-tr-c.lock:active{transform:translateY(2px)}@media (hover:hover){.vmb-tr-c.lock:hover{background:#dbeaff}}'+
'.vmb-tr-c.lock .n{background:#fff;color:var(--acc)}'+
'.vmb-tr-pts>*{white-space:nowrap}@media (max-width:370px){.vmb-tr-pts .w{display:none}}'+
'.vmb-tr-pts .k{padding:3px 10px;border-radius:10px;background:rgba(255,253,246,.92);border:2px solid var(--o)}'+
'.vmb-tr-pts{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:800;font-size:calc(16px*var(--k));color:var(--ink2)}'+
'.vmb-tr-pts b{display:inline-flex;align-items:center;gap:6px;padding:3px 12px 3px 4px;border-radius:999px;background:var(--gold);border:2px solid var(--o);box-shadow:0 2px 0 var(--o);color:#3b2a00;font-size:calc(17px*var(--k))}'+
'.vmb-tr-pts b i{width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid var(--o);font:800 14px/20px Manrope,KF,sans-serif;font-style:normal;text-align:center}'+
'.vmb-tr-a{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
'.vmb-tr-o{position:relative;appearance:none;-webkit-appearance:none;font:inherit;cursor:pointer;min-height:calc(62px*var(--k));padding:8px 10px;border-radius:16px;border:var(--bd);background:#fff;box-shadow:0 4px 0 var(--o);font-weight:800;font-size:calc(18px*var(--k));line-height:1.15;color:var(--ink);text-align:center;touch-action:manipulation;transition:transform .08s,box-shadow .08s,background .2s}'+
'.vmb-tr-o:active{transform:translateY(3px);box-shadow:0 1px 0 var(--o)}'+
'.vmb-tr-o .vmb-kc{position:absolute;left:7px;top:50%;margin-top:-13px}.vmb.pc .vmb-tr-o{padding-left:40px}'+
'@media (hover:hover){.vmb-tr-o:not([disabled]):hover{background:#eef6ff}}'+
'.vmb-tr-o.no{background:#fde6e4;border-color:var(--nod);box-shadow:0 2px 0 var(--nod);color:var(--nod);text-decoration:line-through;opacity:.8}'+
'.vmb-tr-o.ok{background:var(--ok);color:#fff;border-color:var(--o)}'+
'.vmb-tr-o[disabled]{cursor:default}'+
'.vmb-tr-more{width:100%}'+
'@media (max-width:370px){.vmb-tr-c{font-size:calc(16px*var(--k));padding:8px 10px}.vmb-tr-o{font-size:calc(16.5px*var(--k));min-height:calc(56px*var(--k))}.vmb-tr-a{gap:8px}}'+
'@media (min-width:760px) and (min-height:520px){.vmb-tr-o{min-height:calc(70px*var(--k));font-size:calc(20px*var(--k))}.vmb-tr-c{font-size:calc(19px*var(--k))}}';
function css(){if(document.getElementById('vmbTrCss'))return;const s=document.createElement('style');s.id='vmbTrCss';s.textContent=CSS;document.head.appendChild(s);}
const PTS=['3 очка','2 очка','1 очко'];
function run(host,o){css();const R=o.rnd||Math.random;
  const W=V.shell(host,{cls:'tri',who:'mihalych',name:'По трём подсказкам',short:'Три подсказки',mark:'tri',nm:'Михалыч'});const Q=make(o);W.pips(Q.length||N);
  const st={i:0,sc:0,op:1,lock:0,done:0,end:0};
  function head(){return 'Загадка '+(st.i+1)+' из '+Q.length;}
  function show(){const q=Q[st.i];if(!q){finish();return;}st.op=1;st.end=0;st.lock=0;W.pip(st.i,'cur');W.prog((st.i+1)+' из '+Q.length);
    W.say(st.i===0?'Угадаешь с первой подсказки — 3 очка!':['Слушай новую загадку!','А эту отгадаешь?','Ну-ка, а тут?','Последняя — не подведи!'][st.i===Q.length-1?3:(st.i-1)%3],'norm',head());
    W.main.innerHTML='<div class="vmb-tr-pts"><span class="k">Загадка: '+V.esc(q.k)+'</span><b id="vmbTrP"></b></div><div class="vmb-tr-cl"></div>'+
      '<div class="vmb-tr-a">'+q.a.map((a,k)=>'<button class="vmb-tr-o" data-k="'+k+'">'+V.kc(k+1)+V.esc(a)+'</button>').join('')+'</div>'+
      '<div class="vmb-tr-out"></div>'+(st.i===0?'<p class="vmb-pchint">На компьютере: 1–4 — ответ, пробел — ещё подсказка, Enter — дальше</p>':'');
    for(const b of V.$a(W.main,'.vmb-tr-o'))b.onclick=()=>ans(+b.dataset.k);
    clues();W.top();}
  function clues(){const q=Q[st.i];let h='';for(let k=0;k<st.op;k++)h+='<div class="vmb-tr-c"><span class="n">'+(k+1)+'</span><span>'+V.esc(q.c[k])+'</span></div>';
    if(!st.end&&st.op<3)h+='<button class="vmb-tr-c lock" id="vmbTrM"><span class="n">'+(st.op+1)+'</span><span class="t">Ещё подсказка <small>— ответ будет за '+PTS[st.op]+'</small></span>'+V.kc('Пробел')+'</button>';
    V.$q(W.main,'.vmb-tr-cl').innerHTML=h;const p=document.getElementById('vmbTrP');if(p){p.style.display=st.end?'none':'';p.innerHTML='<i>'+(4-st.op)+'</i>'+(4-st.op===1?'очко':'очка')+'<span class="w"> за ответ</span>';}
    const m=document.getElementById('vmbTrM');if(m)m.onclick=more;}
  function more(){if(st.lock||st.end||st.op>=3)return;st.op++;V.snd(host,'hint');clues();
    W.say(st.op===2?'Ладно, вот попроще.':'Последняя — совсем простая!','norm',head());
    const c=V.$a(W.main,'.vmb-tr-c:not(.lock)').pop();if(c)try{c.scrollIntoView({block:'nearest',behavior:V.calm()?'auto':'smooth'});}catch(e){}}
  function ans(k){const q=Q[st.i];if(st.lock||st.end||!q)return;const b=V.$a(W.main,'.vmb-tr-o')[k];if(!b||b.disabled)return;
    if(k===q.ok){const p=4-st.op;st.sc+=p;b.classList.add('ok');V.pop(b,18);V.snd(host,'right');end(true,p);return;}
    b.classList.add('no');b.disabled=true;V.shake(b);V.snd(host,'wrong');V.buzz(60);
    if(st.op<3){st.op++;clues();W.say('Не то! Держи ещё подсказку.','sad',head());return;}
    const g=V.$a(W.main,'.vmb-tr-o')[q.ok];g.classList.add('ok');end(false,0);}
  function end(ok,p){const q=Q[st.i];st.end=1;st.lock=1;for(const b of V.$a(W.main,'.vmb-tr-o'))b.disabled=true;
    st.op=3;clues();W.pip(st.i,ok?'ok':'no');
    W.say(ok?(p===3?'С первой подсказки! Вот это голова!':p===2?'Молодец, угадал!':'Угадал — и это главное!'):'Эх! Это было «'+V.esc(q.a[q.ok])+'».',ok?'happy':'sad',head());
    const last=st.i>=Q.length-1;
    V.$q(W.main,'.vmb-tr-out').innerHTML='<div class="vmb-note '+(ok?'ok':'no')+'"><b class="h">'+V.esc(q.a[q.ok])+(ok?' — +'+p+' '+(p===1?'очко':'очка'):'')+'</b>'+V.esc(q.x)+'</div>'+
      '<button class="vmb-btn go" id="vmbTrN" style="width:100%;margin-top:10px">'+(last?'Итоги':'Следующая загадка ▸')+' '+V.kc('Enter')+'</button>';
    const n=document.getElementById('vmbTrN');n.onclick=()=>{V.snd(host,'tap');st.i++;W.fit(0);show();};W.fit();
    try{n.scrollIntoView({block:'nearest',behavior:V.calm()?'auto':'smooth'});}catch(e){}}
  function finish(){if(st.done)return;st.done=1;V.save();host.done({score:st.sc,tier:V.tier(st.sc,TH),label:st.sc+' из '+(Q.length*3)+' очков'});}
  V.keys(host,(k)=>{const n=document.getElementById('vmbTrN');if(n&&(k==='Enter'||k===' ')){n.click();return true;}
    if(k===' '||k==='Spacebar'){more();return true;}const i={'1':0,'2':1,'3':2,'4':3}[k];if(i==null)return false;ans(i);return true;});
  host.onQuit(()=>{st.done=1;});
  if(!Q.length){W.say('Что-то я все загадки позабыл. Загляни попозже!','sad');setTimeout(()=>host.done({score:0,tier:0,label:'нет загадок'}),50);return;}
  show();
  if(/[?&]vmg=/.test(location.search))window.__auto=()=>{const n=document.getElementById('vmbTrN');if(n){n.click();return;}const q=Q[st.i];if(!q||st.end)return;
    const r=R();if(r<.25&&st.op<3){more();return;}if(r<.85)ans(q.ok);else{const w=[0,1,2,3].find(j=>j!==q.ok&&!V.$a(W.main,'.vmb-tr-o')[j].disabled);ans(w==null?q.ok:w);}};}
/* бот для сверки наград: знание k — шанс узнать ответ на каждой подсказке растёт */
function sim(o,k){const r=V.R((o.seed||1)^0x7e1);let s=0;for(let i=0;i<N;i++){let got=0;for(let c=0;c<3&&!got;c++)if(r()<Math.min(.95,(.15+.25*c)+k*.45))got=3-c;s+=got;}return {score:s,tier:V.tier(s,TH)};}
VMG_REG({id:ID,run,sim,make});
})();
