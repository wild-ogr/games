'use strict';
/* MGB затея №8 «Что лишнее?» (ведёт баба Зина). 6 наборов по 4 слова — одно не из той компании; после ответа — что объединяет остальные и почему лишнее лишнее.
   Без таймера. Ступени: 6/6 — 3★, 5 — 2★, 3–4 — 1★. ПК: 1–4 — выбрать, Enter/пробел — дальше. Мышь и касание работают всегда.
   Наборы — VMB_LS (js/vmg-lishnee-data.js, собирает tools/vmb_content.py из проверенных наборов). Затея дня (o.mode='day') — одинаково у всех по дате;
   в остальных заходах — свой круг игрока S.vmg.lishnee.k (повтор набора — после всего банка). «Уже видел» лестниц (S.seen) не трогаем. */
(function(){if(typeof VMG_REG!=='function')return;   // без оболочки MG0 затея не регистрируется
const ID='lishnee',N=6,TH=[3,5,6];
const V=window.VMB;
function bank(){return Array.isArray(window.VMB_LS)?window.VMB_LS.filter(s=>s&&Array.isArray(s[1])&&s[1].length===4&&s[2]>=0&&s[2]<4):[];}
/* наборы захода: день — по номеру дня (у всех одинаково), иначе — свой круг */
function make(o){const B=bank(),L=B.length;if(!L)return [];const P=V.perm(L,0x5a1e),out=[];let st;
  if(o.mode==='day')st=V.dayN(o.day)*N;
  else{const b=V.box(ID);st=b&&b.k>=0?b.k|0:Math.floor((o.rnd||Math.random)()*L);if(b)b.k=(st+N)%L;}
  const used={};for(let i=0;out.length<N&&i<N*3;i++){const s=B[P[(st+i)%L]];if(used[s[1].join()])continue;used[s[1].join()]=1;
    // порядок слов в наборе перемешан зерном захода (одинаково у всех в день)
    const R=V.R((o.seed||1)+i*7919),ord=V.mix([0,1,2,3],R);out.push({t:s[0],w:ord.map(k=>s[1][k]),o:ord.indexOf(s[2]),g:s[3],x:s[4]});}
  return out;}
const CSS=
'.vmb.ls{--acc:#8d5fae}'+
'.vmb-ls-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}'+
'.vmb-ls-w{position:relative;appearance:none;-webkit-appearance:none;font:inherit;cursor:pointer;min-height:calc(86px*var(--k));padding:12px 10px;border-radius:18px;border:var(--bd);background:#fff;box-shadow:0 5px 0 var(--o);'+
 'display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:calc(21px*var(--k));line-height:1.15;color:var(--ink);word-break:break-word;hyphens:auto;touch-action:manipulation;transition:transform .08s,box-shadow .08s,background .2s;animation:vmbPop .32s ease-out both}'+
'.vmb-ls-w:nth-child(2){animation-delay:.05s}.vmb-ls-w:nth-child(3){animation-delay:.1s}.vmb-ls-w:nth-child(4){animation-delay:.15s}'+
'.vmb-ls-w:active{transform:translateY(4px);box-shadow:0 1px 0 var(--o)}'+
'.vmb-ls-w .vmb-kc{position:absolute;left:8px;top:8px}'+
'@media (hover:hover){.vmb-ls-w:not([disabled]):hover{background:#fff7e0}}'+
'.vmb-ls-w[disabled]{cursor:default}'+
'.vmb-ls-w.same{background:#e3f7e8;border-color:var(--okd);box-shadow:0 5px 0 var(--okd);color:var(--okd)}'+
'.vmb-ls-w.odd{background:#fff1d6}'+
'.vmb-ls-w.miss{background:#fde6e4;border-color:var(--nod);box-shadow:0 5px 0 var(--nod)}'+
'.vmb-ls-st{position:absolute;right:-6px;top:-12px;padding:3px 9px;border:3px solid #c62828;border-radius:8px;color:#c62828;background:rgba(255,255,255,.92);font:900 calc(14px*var(--k))/1 KF,Rubik,sans-serif;letter-spacing:.06em;transform:rotate(9deg);animation:vmbStamp .35s cubic-bezier(.2,1.6,.4,1) both}'+
'@keyframes vmbStamp{0%{transform:rotate(9deg) scale(2.2);opacity:0}100%{transform:rotate(9deg) scale(1);opacity:1}}'+
'.vmb-ls-g{display:flex;align-items:center;gap:8px;margin-top:-2px;font-weight:800;font-size:calc(17px*var(--k));color:var(--okd);animation:vmbIn .3s ease-out both}'+
'.vmb-ls-g:before{content:"";flex:none;width:22px;height:22px;border-radius:50%;background:var(--ok) url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M6 12.5l4 4 8-9%27 fill=%27none%27 stroke=%27%23fff%27 stroke-width=%273.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E") center/16px no-repeat;border:2px solid var(--o)}'+
'.vmb-ls-nx{width:100%}'+
'@media (max-width:370px){.vmb-ls-grid{gap:9px}.vmb-ls-w{font-size:calc(18.5px*var(--k));min-height:calc(74px*var(--k))}}'+
'@media (min-width:760px) and (min-height:520px){.vmb-ls-w{min-height:calc(104px*var(--k));font-size:calc(25px*var(--k))}.vmb-ls-grid{gap:16px}}';
function css(){if(document.getElementById('vmbLsCss'))return;const s=document.createElement('style');s.id='vmbLsCss';s.textContent=CSS;document.head.appendChild(s);}
const HI=['Какое слово тут лишнее?','Найди, кто не из этой компании.','Одно слово сюда случайно затесалось. Какое?','Тут один чужой. Кто?','Ну-ка, что здесь лишнее?','Последний набор! Какое слово лишнее?'];
const OK=['Верно, милок!','Глаз-алмаз!','Вот это я понимаю!','Точно так!','Умница!','Ай, молодец!'];
const NO=['Ох, нет…','Не угадал, бывает.','Мимо, голубчик.'];
function run(host,o){css();const R=o.rnd||Math.random;
  const W=V.shell(host,{cls:'ls',who:'zina',name:'Что лишнее?',mark:'ls',nm:'Баба Зина'});const Q=make(o);W.pips(Q.length||N);
  const st={i:0,sc:0,lock:0,done:0};
  function show(){const q=Q[st.i];if(!q){finish();return;}W.pip(st.i,'cur');W.prog((st.i+1)+' из '+Q.length);st.lock=0;
    W.say(HI[st.i===Q.length-1?5:st.i%5],'norm','Набор '+(st.i+1)+' из '+Q.length);
    W.main.innerHTML='<div class="vmb-ls-grid">'+q.w.map((w,k)=>'<button class="vmb-ls-w" data-k="'+k+'">'+V.kc(k+1)+'<span>'+V.esc(w)+'</span></button>').join('')+'</div>'+
      '<div class="vmb-ls-out"></div>'+(st.i===0?'<p class="vmb-pchint">На компьютере: клавиши 1–4 — выбрать, Enter — дальше</p>':'');
    for(const b of V.$a(W.main,'.vmb-ls-w'))b.onclick=()=>pickW(+b.dataset.k);W.top();}
  function pickW(k){const q=Q[st.i];if(st.lock||!q)return;st.lock=1;const ok=k===q.o;if(ok)st.sc++;
    const bs=V.$a(W.main,'.vmb-ls-w');bs.forEach((b,j)=>{b.disabled=true;if(j===q.o){b.classList.add('odd');b.insertAdjacentHTML('beforeend','<i class="vmb-ls-st">ЛИШНЕЕ</i>');}else b.classList.add('same');});
    if(!ok){bs[k].classList.remove('same');bs[k].classList.add('miss');V.shake(bs[k]);V.buzz(60);}
    W.pip(st.i,ok?'ok':'no');V.snd(host,ok?'right':'wrong');if(ok)V.pop(bs[q.o],16);
    W.say(ok?OK[st.i%OK.length]:NO[st.i%NO.length],ok?'happy':'sad','Набор '+(st.i+1)+' из '+Q.length);
    const last=st.i>=Q.length-1;
    V.$q(W.main,'.vmb-ls-out').innerHTML='<div class="vmb-ls-g">Остальные: '+V.esc(q.g)+'</div>'+
      '<div class="vmb-note '+(ok?'ok':'no')+'"><b class="h">'+(ok?'Лишнее — «'+V.esc(q.w[q.o])+'»':'Лишнее тут — «'+V.esc(q.w[q.o])+'»')+'</b>'+V.esc(q.x)+'</div>'+
      '<button class="vmb-btn go vmb-ls-nx" id="vmbLsN">'+(last?'Итоги':'Дальше ▸')+' '+V.kc('Enter')+'</button>';
    const n=document.getElementById('vmbLsN');n.onclick=()=>{V.snd(host,'tap');st.i++;show();};
    try{n.scrollIntoView({block:'nearest',behavior:V.calm()?'auto':'smooth'});}catch(e){}}
  function finish(){if(st.done)return;st.done=1;V.save();host.done({score:st.sc,tier:V.tier(st.sc,TH),label:st.sc+' из '+Q.length+' — верно'});}
  V.keys(host,k=>{const n=document.getElementById('vmbLsN');if(n&&(k==='Enter'||k===' ')){n.click();return true;}
    const i={'1':0,'2':1,'3':2,'4':3}[k];if(i==null||st.lock)return false;pickW(i);return true;});
  host.onQuit(()=>{st.done=1;});
  if(!Q.length){W.say('Ой, наборы потерялись. Загляни попозже!','sad');W.main.innerHTML='';setTimeout(()=>host.done({score:0,tier:0,label:'нет наборов'}),50);return;}
  show();
  if(/[?&]vmg=/.test(location.search))window.__auto=()=>{const n=document.getElementById('vmbLsN');if(n){n.click();return;}const q=Q[st.i];if(q&&!st.lock)pickW(R()<.8?q.o:(q.o+1)%4);};}
function sim(o,k){const r=V.R((o.seed||1)^0x15e),p=Math.min(.97,.4+k*.55);let s=0;for(let i=0;i<N;i++)if(r()<p)s++;return {score:s,tier:V.tier(s,TH)};}
VMG_REG({id:ID,run,sim,make});
})();
