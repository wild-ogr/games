'use strict';
/* MGB затея №10 «Кроссвордик дня» (газета «Двор», принёс Валерка). Один кроссворд на день — одинаковый у всех (по дате, не по зерну):
   сетки строит заранее tools/vmb_xword.py → js/vmg-krossv-data.js (VMB_KR), определения — вопросы базы QI[id].q, ответ — их верный вариант.
   5–7 слов, сетка до 8×8. Без таймера. Слово заполнено — проверка: верно — слово зеленеет и запирается; неверно — слово трясётся, буквы можно поправить.
   «Открыть букву» — 2 бесплатно; дальше можно ещё, но звёзд меньше (или ролик «по нужде», если он есть). «Сдаюсь» — показать ответы (с двойным нажатием).
   Ступени: всё разгадано и без лишних букв — 3★, лишних 1–3 — 2★, больше — 1★; сдался — 1★, если разгадана половина слов.
   Клавиатура: на телефоне — буквы текущего слова + 3 лишние (крупные клавиши), от 700 px — вся ЙЦУКЕН. ПК: печатать буквы, стрелки — по клеткам,
   Tab / Shift+Tab — следующее/прошлое слово, Backspace — стереть, Enter — следующее слово. Ё = Е.
   Недорешённый кроссворд дня хранится в host.mem() (S.vmg.m.kross) {k:день, v:буквы, h:открыто, x:лишних, f:1 — дорешан} (если ядро завело S.vmg). S.seen не трогаем. */
(function(){if(typeof VMG_REG!=='function')return;   // без оболочки MG0 затея не регистрируется
const ID='kross',FREE=2;
const V=window.VMB;
const KB=['ЙЦУКЕНГШЩЗХ','ФЫВАПРОЛДЖЭ','ЯЧСМИТЬБЮЪ'];
const AL='АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
function qtext(id){try{const q=typeof QI!=='undefined'&&QI[id];return q?q.q:'';}catch(e){return '';}}
function qans(id){try{const q=typeof QI!=='undefined'&&QI[id];return q?V.norm(q.a[0]):'';}catch(e){return '';}}
/* кроссворд дня: номер дня от d0 по кругу; слово не сходится с базой (вопрос убрали/поправили) — берём следующий день */
function pick(o){const K=window.VMB_KR;if(!K||!Array.isArray(K.p)||!K.p.length)return null;const L=K.p.length;let n=V.dayN(o.day)-V.dayN(K.d0);
  if(o.train)n-=1+Math.floor((o.rnd||Math.random)()*Math.min(60,L-1));
  for(let t=0;t<L&&t<30;t++){const idx=((n+t)%L+L)%L,g=K.p[idx];if(!g||!Array.isArray(g[2]))continue;
    if(g[2].every(e=>qans(e[0])===e[1]&&qtext(e[0])))return {idx,H:g[0],W:g[1],E:g[2]};}
  return null;}
function build(P){const H=P.H,W=P.W,cells={},words=[];
  P.E.forEach((e,i)=>{const [id,w,r,c,d]=e,dr=d==='d'?1:0,dc=d==='a'?1:0,cs=[];
    for(let k=0;k<w.length;k++){const y=r+dr*k,x=c+dc*k,key=y*W+x;const cl=cells[key]||(cells[key]={r:y,c:x,ch:w[k],v:'',lock:0,w:[]});cl.w.push(i);cs.push(key);}
    words.push({i,id,w,d,r,c,cs,clue:qtext(id),ok:0});});
  // номера — по порядку начала слов (сверху вниз, слева направо)
  const st=[...new Set(words.map(x=>x.cs[0]))].sort((a,b)=>a-b);words.forEach(x=>{x.num=st.indexOf(x.cs[0])+1;cells[x.cs[0]].num=x.num;});
  words.sort((a,b)=>(a.d===b.d?a.num-b.num:a.d==='a'?-1:1));words.forEach((x,i)=>x.i=i);
  for(const k in cells)cells[k].w=[];words.forEach(x=>x.cs.forEach(k=>cells[k].w.push(x.i)));
  return {H,W,cells,words};}
const CSS=
'.vmb.kr{--acc:#e8590c}'+
'.vmb.kr .vmb-stage{display:none}'+
'.vmb-kr{display:flex;flex-direction:column;gap:10px}'+
'.vmb-kr-paper{position:relative;align-self:center;background:#fffdf3;border:var(--bd);box-shadow:var(--sh);border-radius:14px;padding:8px 10px 10px;'+
 'background-image:repeating-linear-gradient(0deg,rgba(35,50,71,.035) 0 1px,transparent 1px 22px)}'+
'.vmb-kr-mast{display:flex;align-items:baseline;justify-content:space-between;gap:8px;border-bottom:2px solid var(--o);margin:0 0 8px;padding-bottom:3px;font-weight:900;font-size:calc(15px*var(--k));letter-spacing:.02em;white-space:nowrap}'+
'.vmb-kr-mast span{font-weight:700;font-size:.86em;color:var(--ink2)}'+
'.vmb-kr-g{position:relative;margin:0 auto;display:grid;gap:0}'+
'.vmb-kr-c{position:relative;border:2px solid var(--o);margin:-1px;background:#fff;display:flex;align-items:center;justify-content:center;font:800 calc(var(--cs)*.56)/1 KF,Rubik,sans-serif;color:var(--ink);cursor:pointer;touch-action:manipulation;transition:background .15s}'+
'.vmb-kr-c i{position:absolute;left:2px;top:1px;font:700 calc(var(--cs)*.27)/1 Manrope,KF,sans-serif;font-style:normal;color:var(--ink2)}'+
'.vmb-kr-c.wd{background:#fff3c4}.vmb-kr-c.cur{background:#ffb066;box-shadow:inset 0 0 0 2px #fff}'+
'.vmb-kr-c.ok{background:#d6f5de;color:var(--okd)}.vmb-kr-c.ok.wd{background:#bfeccb}.vmb-kr-c.ok.cur{background:#9fe0b2}'+
'.vmb-kr-c.op{color:var(--tip)}.vmb-kr-c.bad{background:#ffd4d1}'+
'.vmb-kr-c.pop{animation:vmbPop .35s ease-out}'+
'.vmb-kr-bar{display:flex;align-items:stretch;gap:8px}'+
'.vmb-kr-cl{flex:1;min-width:0;min-height:calc(58px*var(--k));display:flex;align-items:center;gap:9px;background:#fff;border:var(--bd);box-shadow:0 3px 0 var(--o);border-radius:14px;padding:6px 10px;font-weight:600;font-size:calc(16.5px*var(--k));line-height:1.25}'+
'.vmb-kr-cl>span{display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}.vmb-kr-cl b{margin-right:6px;display:inline-block;vertical-align:1px}'+
'.vmb-kr-cl b{flex:none;min-width:40px;padding:3px 7px;border-radius:9px;background:var(--acc);color:#fff;border:2px solid var(--o);font:800 calc(15px*var(--k))/1.1 Manrope,KF,sans-serif;text-align:center}'+
'.vmb-kr-cl small{color:var(--ink2);font-weight:700;white-space:nowrap}'+
'.vmb-kr-nav{flex:none;width:46px;appearance:none;-webkit-appearance:none;font:900 22px/1 KF,sans-serif;border-radius:14px;border:var(--bd);background:var(--pan);box-shadow:0 3px 0 var(--o);color:var(--ink);cursor:pointer;touch-action:manipulation}'+
'.vmb-kr-nav:active{transform:translateY(2px);box-shadow:0 1px 0 var(--o)}'+
'.vmb-kr-kb{display:flex;flex-direction:column;gap:7px}'+
'.vmb-kr-row{display:flex;gap:6px;justify-content:center}'+
'.vmb-kr-k{flex:1 1 0;max-width:62px;min-width:0;height:calc(52px*var(--k));appearance:none;-webkit-appearance:none;font:800 calc(22px*var(--k))/1 KF,Rubik,sans-serif;border-radius:12px;border:var(--bd);background:#fff;box-shadow:0 3px 0 var(--o);color:var(--ink);cursor:pointer;padding:0;touch-action:manipulation}'+
'.vmb-kr-k:active{transform:translateY(2px);box-shadow:0 1px 0 var(--o);background:#fff3c4}'+
'.vmb-kr-k.bs{flex:1.6 1 0;max-width:96px;background:var(--pan)}'+
'.vmb-kr-k.hk{position:relative;background:#eaf3ff;font-size:calc(20px*var(--k))}.vmb-kr-k.hk sup{position:absolute;right:-6px;top:-8px;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:var(--tip);color:#fff;border:2px solid var(--o);font:800 12px/18px Manrope,KF,sans-serif}'+
'.vmb-kr:not(.full) #vmbKrH{display:none}.vmb-kr:not(.full) .vmb-kr-act{justify-content:center}.vmb-kr:not(.full) .gu{flex:0 1 220px}'+
'.vmb-kr.full .vmb-kr-row{gap:4px}.vmb-kr.full .vmb-kr-k{max-width:46px;height:calc(44px*var(--k));font-size:calc(18px*var(--k));border-radius:10px}'+
'.vmb-kr-act{display:flex;gap:8px}.vmb-kr-act .vmb-btn{flex:1;min-height:50px;font-size:calc(16.5px*var(--k));padding:6px 10px}'+
'.vmb-kr-act .gu{flex:.7;background:transparent;box-shadow:none;border-style:dashed;color:var(--ink2)}'+
'.vmb-kr-act .gu.sure{background:#fde6e4;color:var(--nod);border-style:solid}'+
'.vmb-kr-side{display:none}'+
'.vmb-kr-ls h4{margin:0 0 4px;font-size:calc(15px*var(--k));text-transform:uppercase;letter-spacing:.05em;color:var(--ink2)}'+
'.vmb-kr-ls button{display:flex;gap:8px;width:100%;appearance:none;-webkit-appearance:none;font:inherit;text-align:left;background:transparent;border:2px solid transparent;border-radius:10px;padding:5px 7px;font-weight:600;font-size:calc(15.5px*var(--k));line-height:1.25;color:var(--ink);cursor:pointer}'+
'.vmb-kr-ls button b{flex:none;min-width:22px;font-family:Manrope,KF,sans-serif}'+
'.vmb-kr-ls button.cur{background:#fff3c4;border-color:var(--o)}.vmb-kr-ls button.ok{color:var(--okd);text-decoration:line-through;text-decoration-thickness:2px;opacity:.75}'+
// в оболочке MG0: точки хода не нужны (счёт слов — в шапке), реплика Валерки — поверх газеты, не сдвигает клавиатуру
'.vmb.in.kr .vmb-pipsrow{display:none}.vmb.in.kr .vmb-stage{position:absolute;top:0;left:0;right:0;z-index:6;pointer-events:none}'+
'@media (hover:hover){.vmb-kr-ls button:hover{background:#fff8de}}'+
'.vmb-kr-done{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,34,52,.35);animation:vmbIn .3s ease-out both}'+
'.vmb-kr-done>div{max-width:420px;width:100%;display:flex;flex-direction:column;gap:12px;align-items:stretch}'+
'@media (min-width:700px) and (min-height:480px){.vmb.kr .vmb-col{max-width:1100px}.vmb-kr.full{display:grid;grid-template-columns:auto minmax(300px,1fr);grid-template-rows:auto auto auto 1fr;grid-template-areas:"g b" "g k" "g a" "g s";gap:12px 18px;align-items:start}'+
 '.vmb-kr.full .vmb-kr-paper{align-self:start}.vmb-kr.full .vmb-kr-k{flex:1 1 0}'+
 '.vmb-kr.full .vmb-kr-paper{grid-area:g}.vmb-kr.full .vmb-kr-bar{grid-area:b}.vmb-kr.full .vmb-kr-kb{grid-area:k}.vmb-kr.full .vmb-kr-act{grid-area:a}'+
 '.vmb-kr.full .vmb-kr-side{grid-area:s;display:flex;flex-direction:column;gap:10px;background:#fffdf6;border:var(--bd);box-shadow:var(--sh);border-radius:16px;padding:10px 12px;min-height:0;max-height:100%;align-self:stretch;overflow:auto}.vmb-kr.full .vmb-kr-cl>span{-webkit-line-clamp:6}}'+
'@media (max-width:420px){.vmb-kr-nav{width:36px;font-size:20px}.vmb-kr-bar{gap:6px}}'+
'@media (max-width:370px){.vmb-kr-cl{font-size:calc(15px*var(--k));padding:5px 8px}.vmb-kr-k{height:calc(48px*var(--k))}}';
function css(){if(document.getElementById('vmbKrCss'))return;const s=document.createElement('style');s.id='vmbKrCss';s.textContent=CSS;document.head.appendChild(s);}
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dTxt(day){const s=String(day||'').replace(/\D/g,'');if(s.length<8)return '';return (+s.slice(6,8))+' '+MON[+s.slice(4,6)-1];}
function plw(n){return n%10===1&&n%100!==11?'буква':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'буквы':'букв';}

function run(host,o){css();const P=pick(o),R=o.rnd||Math.random;
  const Wd=V.shell(host,{cls:'kr',who:'valerka',name:'Кроссвордик дня',short:'Кроссвордик',mark:'kr',nm:'Валерка'});
  if(!P){Wd.stage.style.display='flex';Wd.say('Газету сегодня не принесли… Загляни завтра!','sad');setTimeout(()=>host.done({score:0,tier:0,label:'нет кроссворда'}),60);return;}
  const G=build(P),NW=G.words.length;Wd.pips(NW);
  const st={w:0,cell:G.words[0].cs[0],h:0,x:0,err:0,done:0,gu:0,fin:0};
  const day=o.train?'':String(o.day||'');const bx=o.train?null:V.box(ID);
  // недорешённый кроссворд дня — вернуть буквы
  if(bx&&bx.k===P.idx+'|'+day&&!bx.f&&typeof bx.v==='string'){const ks=Object.keys(G.cells).map(Number).sort((a,b)=>a-b);
    ks.forEach((k,i)=>{const ch=bx.v[i];if(ch&&ch!=='.')G.cells[k].v=ch;if(bx.v[i+ks.length]==='1')G.cells[k].lock=1;});st.h=bx.h|0;st.x=bx.x|0;
    G.words.forEach(w=>{if(w.cs.every(k=>G.cells[k].v===G.cells[k].ch)){w.ok=1;w.cs.forEach(k=>G.cells[k].lock=1);}});}
  function keep(){if(!bx)return;const ks=Object.keys(G.cells).map(Number).sort((a,b)=>a-b);
    bx.k=P.idx+'|'+day;bx.v=ks.map(k=>G.cells[k].v||'.').join('')+ks.map(k=>G.cells[k].lock?'1':'0').join('');bx.h=st.h;bx.x=st.x;bx.f=st.fin?1:0;V.save();}
  const wide=()=>host.el.clientWidth>=700;
  Wd.main.innerHTML='<div class="vmb-kr"><div class="vmb-kr-paper"><div class="vmb-kr-mast">Газета «Двор»<span>'+(o.train?'из подшивки':(dTxt(o.day)||'сегодня'))+'</span></div><div class="vmb-kr-g"></div></div>'+
    '<div class="vmb-kr-bar"><button class="vmb-kr-nav" data-n="-1" aria-label="Прошлое слово">‹</button><div class="vmb-kr-cl"></div><button class="vmb-kr-nav" data-n="1" aria-label="Следующее слово">›</button></div>'+
    '<div class="vmb-kr-kb"></div><div class="vmb-kr-act"><button class="vmb-btn blue" id="vmbKrH"></button><button class="vmb-btn gu" id="vmbKrG">Сдаюсь</button></div>'+
    '<div class="vmb-kr-side"></div></div>'+'<p class="vmb-pchint">На компьютере: печатай буквы, стрелки — по клеткам, Tab — следующее слово, Backspace — стереть</p>';
  const box=V.$q(Wd.main,'.vmb-kr'),gEl=V.$q(Wd.main,'.vmb-kr-g'),clEl=V.$q(Wd.main,'.vmb-kr-cl'),kbEl=V.$q(Wd.main,'.vmb-kr-kb'),side=V.$q(Wd.main,'.vmb-kr-side');
  /* сетка */
  let cellEl={};
  function grid(){gEl.innerHTML='';cellEl={};gEl.style.gridTemplateColumns='repeat('+G.W+',var(--cs))';gEl.style.gridTemplateRows='repeat('+G.H+',var(--cs))';
    for(let r=0;r<G.H;r++)for(let c=0;c<G.W;c++){const k=r*G.W+c,cl=G.cells[k],d=document.createElement('div');
      if(!cl){d.style.visibility='hidden';gEl.appendChild(d);continue;}d.className='vmb-kr-c';d.dataset.k=k;d.innerHTML=(cl.num?'<i>'+cl.num+'</i>':'')+'<span></span>';
      d.onclick=()=>tapCell(k);gEl.appendChild(d);cellEl[k]=d;}
    size();}
  function size(){const full=wide();box.classList.toggle('full',full);const colW=Wd.col.clientWidth||host.el.clientWidth-24;
    const hh=host.el.clientHeight||600,big=document.body.classList.contains('big')?1.14:1;
    // телефон: под сеткой — определение (~64), клавиатура 2 ряда (~118), «Сдаюсь» уходит под прокрутку; ПК/VK: сетка слева во всю высоту
    const availW=full?Math.min(colW*.56,640):colW-24,availH=full?hh-150:hh-(Wd.core?0:66)-48-66*big-122*big-26;
    let cs=Math.floor(Math.min(full?64:46,availW/G.W,availH/G.H));cs=Math.max(26,cs);box.style.height=full?Math.max(420,hh-(Wd.core?44:92))+'px':'';
    gEl.style.setProperty('--cs',cs+'px');kb();
    // телефон: подгонка по самому длинному определению — клавиатура целиком видна без прокрутки
    if(!full){const cur=clEl.innerHTML,lw=G.words.reduce((a,b)=>b.clue.length>a.clue.length?b:a);clEl.innerHTML='<span><b>0 →</b>'+V.esc(lw.clue)+' <small>(9 букв)</small></span>';
      const bb=Wd.body.getBoundingClientRect().bottom-8;for(let t=0;t<12&&cs>26&&kbEl.getBoundingClientRect().bottom>bb;t++){cs-=2;gEl.style.setProperty('--cs',cs+'px');}
      clEl.innerHTML=cur;}}
  function paint(){const w=G.words[st.w];for(const k in cellEl){const cl=G.cells[k],e=cellEl[k];
      e.className='vmb-kr-c'+(cl.lock||G.words.some(x=>x.ok&&x.cs.includes(+k))?' ok':'')+(cl.op?' op':'')+(w&&w.cs.includes(+k)?' wd':'')+(+k===st.cell?' cur':'');
      e.lastChild.textContent=cl.v||'';}
    clue();lists();hintBtn();Wd.prog(G.words.filter(x=>x.ok).length+' из '+NW);}
  function clue(){const w=G.words[st.w];clEl.innerHTML='<span><b>'+w.num+(w.d==='a'?' →':' ↓')+'</b>'+V.esc(w.clue)+' <small>('+w.w.length+' '+plw(w.w.length)+')</small></span>';}
  function lists(){if(!wide()){side.innerHTML='';return;}const L=d=>G.words.filter(w=>w.d===d).map(w=>'<button data-w="'+w.i+'" class="'+(w.i===st.w?'cur ':'')+(w.ok?'ok':'')+'"><b>'+w.num+'.</b><span>'+V.esc(w.clue)+'</span></button>').join('');
    side.innerHTML='<div class="vmb-kr-ls"><h4>По горизонтали →</h4>'+L('a')+'</div><div class="vmb-kr-ls"><h4>По вертикали ↓</h4>'+L('d')+'</div>';
    for(const b of V.$a(side,'button'))b.onclick=()=>{goWord(+b.dataset.w);};}
  /* клавиатура */
  let kbKey='';
  function kb(){const full=wide(),w=G.words[st.w],k=full?'full':'w'+st.w;if(k===kbKey&&kbEl.firstChild)return;kbKey=k;let rows;
    if(full)rows=KB.map((r,i)=>r.split('').concat(i===2?['⌫']:[]));
    else{const u=[...new Set(w.w.split(''))],r2=V.R((o.seed||7)+st.w*31),pool=AL.split('').filter(c=>!u.includes(c)&&'ЪЫЬЁЙЩ'.indexOf(c)<0);V.mix(pool,r2);
      const want=Math.max(8,Math.min(11,u.length+3)),ls=V.mix(u.concat(pool.slice(0,Math.max(0,want-u.length))),r2);const half=Math.ceil((ls.length+1)/2);
      rows=[ls.slice(0,half),ls.slice(half).concat(['⌫'])];if(rows[1].length<rows[0].length)rows[1].unshift('?');else rows[0].push('?');}
    kbEl.innerHTML=rows.map(r=>'<div class="vmb-kr-row">'+r.map(c=>(c==='?'?'<button class="vmb-kr-k hk" data-c="?" aria-label="Открыть букву">💡<sup></sup></button>':'<button class="vmb-kr-k'+(c==='⌫'?' bs':'')+'" data-c="'+c+'"'+(c==='⌫'?' aria-label="Стереть"':'')+'>'+c+'</button>')).join('')+'</div>').join('');
    for(const b of V.$a(kbEl,'button'))b.onclick=()=>{const c=b.dataset.c;c==='⌫'?back():c==='?'?hint():put(c);};hintBtn();}
  /* выбор */
  function goWord(i,keepCell){if(st.done)return;st.w=(i+NW)%NW;const w=G.words[st.w];if(!keepCell){const e=w.cs.find(k=>!G.cells[k].v&&!G.cells[k].lock);st.cell=e!=null?e:w.cs[0];}
    kbKey=wide()?kbKey:'';kb();paint();}
  function tapCell(k){if(st.done)return;V.snd(host,'tap');const cl=G.cells[k];if(!cl)return;let wi=cl.w[0];
    if(cl.w.length>1){wi=k===st.cell?cl.w.find(x=>x!==st.w):(cl.w.includes(st.w)?st.w:cl.w[0]);}
    st.cell=k;goWord(wi,true);}
  // следующая незапертая клетка слова; в конце слова — первая пустая (если есть)
  function nextOpen(){const w=G.words[st.w],i=w.cs.indexOf(st.cell);for(let j=i+1;j<w.cs.length;j++)if(!G.cells[w.cs[j]].lock){st.cell=w.cs[j];return;}
    const e=w.cs.find(k=>!G.cells[k].lock&&!G.cells[k].v);if(e!=null)st.cell=e;}
  function put(ch){if(st.done)return;ch=V.norm(ch);if(!/^[А-Я]$/.test(ch))return;const w=G.words[st.w];if(w.ok){const nx=G.words.findIndex(x=>!x.ok);if(nx>=0)goWord(nx);return;}
    const cl=G.cells[st.cell];if(cl.lock){nextOpen();if(G.cells[st.cell].lock)return;}const c2=G.cells[st.cell];c2.v=ch;V.snd(host,'pick');
    const e=cellEl[st.cell];if(e){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}
    if(w.cs.every(k=>G.cells[k].v)){check(w);if(!w.ok){const i=w.cs.indexOf(st.cell);for(let j=i+1;j<w.cs.length;j++)if(!G.cells[w.cs[j]].lock){st.cell=w.cs[j];break;}}}else nextOpen();paint();keep();}
  function back(){if(st.done)return;const w=G.words[st.w],cl=G.cells[st.cell];
    if(cl.v&&!cl.lock&&!w.ok){cl.v='';}else{const i=w.cs.indexOf(st.cell);for(let j=i-1;j>=0;j--)if(!G.cells[w.cs[j]].lock&&!G.words[st.w].ok){st.cell=w.cs[j];G.cells[st.cell].v='';break;}}
    V.snd(host,'tap');paint();keep();}
  function check(w){if(w.cs.every(k=>G.cells[k].v===G.cells[k].ch)){solve(w);return;}
    st.err++;V.snd(host,'wrong');V.buzz(60);w.cs.forEach(k=>{const e=cellEl[k];if(e){e.classList.add('bad');V.shake(e);setTimeout(()=>e.classList.remove('bad'),700);}});
    say('Что-то не сходится — проверь буквы.');}
  function solve(w){w.ok=1;w.cs.forEach(k=>G.cells[k].lock=1);Wd.pip(G.words.filter(x=>x.ok).length-1,'ok');
    // пересечения: соседнее слово могло дорешиться само
    G.words.forEach(x=>{if(!x.ok&&x.cs.every(k=>G.cells[k].v===G.cells[k].ch)){x.ok=1;x.cs.forEach(k=>G.cells[k].lock=1);Wd.pip(G.words.filter(y=>y.ok).length-1,'ok');}});
    V.snd(host,'right');V.pop(cellEl[w.cs[Math.floor(w.cs.length/2)]],12);
    if(G.words.every(x=>x.ok)){finish(false);return;}
    const nx=G.words.findIndex((x,i)=>i>st.w&&!x.ok),n2=nx>=0?nx:G.words.findIndex(x=>!x.ok);setTimeout(()=>{if(!st.done)goWord(n2);},260);}
  /* подсказка-буква */
  function hintBtn(){const b=document.getElementById('vmbKrH');if(!b)return;const left=FREE-st.h;
    b.innerHTML=left>0?'Открыть букву <small>· ещё '+left+' даром</small>':'Открыть букву <small>· звёзд меньше</small>';b.disabled=!!st.done;
    const hk=V.$q(kbEl,'.hk sup');if(hk)hk.textContent=left>0?left:'−★';}
  function hint(){if(st.done)return;const w=G.words[st.w];let k=st.cell;if(G.cells[k].lock||G.cells[k].v===G.cells[k].ch&&!w.cs.some(x=>!G.cells[x].lock))k=null;
    if(k==null||G.cells[k].lock)k=w.cs.find(x=>!G.cells[x].lock&&G.cells[x].v!==G.cells[x].ch);if(k==null)k=w.cs.find(x=>!G.cells[x].lock);
    if(k==null){const nx=G.words.findIndex(x=>!x.ok);if(nx>=0)goWord(nx);return;}
    const cl=G.cells[k];cl.v=cl.ch;cl.lock=1;cl.op=1;st.h++;if(st.h>FREE)st.x++;V.snd(host,'hint');st.cell=k;
    if(w.cs.every(x=>G.cells[x].v))check(w);else nextOpen();paint();keep();}
  document.getElementById('vmbKrH').onclick=hint;
  const gu=document.getElementById('vmbKrG');gu.onclick=()=>{if(st.done)return;if(!st.gu){st.gu=1;gu.classList.add('sure');gu.textContent='Точно? Ещё раз';setTimeout(()=>{st.gu=0;gu.classList.remove('sure');gu.textContent='Сдаюсь';},3000);return;}finish(true);};
  for(const b of V.$a(Wd.main,'.vmb-kr-nav'))b.onclick=()=>{V.snd(host,'tap');goWord(st.w+(+b.dataset.n));};
  let sayT=0;function say(t){Wd.stage.style.display='flex';Wd.say(t,'norm');clearTimeout(sayT);sayT=setTimeout(()=>{if(!st.done)Wd.stage.style.display='';},2600);}
  function finish(gave){if(st.done)return;st.done=1;const sol=G.words.filter(x=>x.ok).length;
    if(gave)for(const k in G.cells){const cl=G.cells[k];if(cl.v!==cl.ch){cl.v=cl.ch;cl.op=1;}}
    // STAT (просьба STAT к затеям): определения — вопросы базы, по каждому слову один ответ; mode 'vmg-kross'; в тренировке не шлём
    if(!o.train)try{if(window.STATANS&&typeof STATANS.ans==='function')for(const w of G.words){const op=w.cs.some(k=>G.cells[k].op),q=typeof QI!=='undefined'&&QI[w.id];
      STATANS.ans({id:w.id,ok:w.ok&&!op?1:0,mode:'vmg-kross',step:0,price:0,tries:1,sec:0,d:q&&q.d||0,hint:op?'o':''});}}catch(e){}
    st.fin=1;keep();paint();const all=sol===NW&&!gave;
    const tier=all?(st.x===0?3:st.x<=3?2:1):(sol*2>=NW?1:0);
    Wd.stage.style.display='flex';Wd.say(all?(st.x?'Разгадал! Завтра будет новый — заходи.':'Весь кроссворд — сам, без лишних подсказок. Высший класс!'):'Вот ответы. Завтра — новый кроссворд!',all?'happy':'norm');
    if(all){V.snd(host,'win');for(const k in cellEl)V.pop(cellEl[k],2);}
    const d=document.createElement('div');d.className='vmb-kr-done';d.innerHTML='<div><button class="vmb-btn go" id="vmbKrN">Итоги ▸ '+V.kc('Enter')+'</button><button class="vmb-btn" id="vmbKrV">Посмотреть сетку</button></div>';
    Wd.el.appendChild(d);document.getElementById('vmbKrV').onclick=()=>{d.style.background='transparent';d.style.alignItems='flex-end';document.getElementById('vmbKrV').remove();};
    document.getElementById('vmbKrN').onclick=()=>{V.snd(host,'tap');V.save();host.done({score:sol,tier,label:sol+' из '+NW+' слов'+(st.h?' · букв открыто: '+st.h:'')});};}
  V.keys(host,(k,e)=>{if(st.done){if(k==='Enter'||k===' '){const n=document.getElementById('vmbKrN');if(n){n.click();return true;}}return false;}
    if(k==='Backspace'){back();return true;}if(k==='Tab'){goWord(st.w+(e.shiftKey?-1:1));return true;}if(k==='Enter'){const nx=G.words.findIndex((x,i)=>i>st.w&&!x.ok);goWord(nx>=0?nx:st.w+1);return true;}
    const mv={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[k];
    if(mv){const cl=G.cells[st.cell];let r=cl.r+mv[0],c=cl.c+mv[1];while(r>=0&&c>=0&&r<G.H&&c<G.W){const kk=r*G.W+c;if(G.cells[kk]){const want=mv[0]?'d':'a',wi=G.cells[kk].w.find(x=>G.words[x].d===want);st.cell=kk;goWord(wi!=null?wi:G.cells[kk].w[0],true);break;}r+=mv[0];c+=mv[1];}return true;}
    if(k.length===1&&/[а-яёА-ЯЁ]/.test(k)){put(k);return true;}
    // латиница на русской раскладке не нужна: подсказать
    if(k.length===1&&/[a-zA-Z]/.test(k)){say('Включи русскую раскладку — печатай русскими буквами.');return true;}return false;});
  host.onResize(()=>{kbKey='';size();paint();});host.onQuit(()=>{st.done=1;keep();});
  grid();const s0=G.words.findIndex(x=>!x.ok);goWord(s0>=0?s0:0);
  Wd.stage.style.display='flex';
  Wd.say(bx&&bx.k===P.idx+'|'+day&&G.words.some(x=>x.ok)?'Продолжим? Буквы я сохранил.':o.train?'Старый номер из подшивки — разомнёмся!':'Свежая газета! Кроссворд сегодня у всех один — поглядим, кто быстрее разгадает.','happy');
  sayT=setTimeout(()=>{if(!st.done)Wd.stage.style.display='';},3200);
  if(G.words.every(x=>x.ok))finish(false);
  if(/[?&]vmg=/.test(location.search))window.__auto=()=>{if(st.done){const n=document.getElementById('vmbKrN');if(n)n.click();return;}
    const w=G.words[st.w];if(w.ok){goWord(G.words.findIndex(x=>!x.ok));return;}const cl=G.cells[st.cell];
    if(R()<.08){hint();return;}put(R()<.93?cl.ch:'Ж');};
  window.__vmbKr={G,st,put,hint,goWord,finish};}
/* бот для сверки наград: знание k — доля слов, отгаданных без подсказок; остальные — открытием букв */
function sim(o,k){const r=V.R((o.seed||1)^0x6b),n=6;let x=0,h=0;for(let i=0;i<n;i++)if(r()>Math.min(.95,.35+k*.6)){h+=1+Math.floor(r()*2);}x=Math.max(0,h-FREE);
  return {score:n,tier:x===0?3:x<=3?2:1};}
VMG_REG({id:ID,run,sim,pick});
})();
