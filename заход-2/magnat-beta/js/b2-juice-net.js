/* b2-juice-net.js — JUICE: «Сеть» плитками (грузится по требованию; крючок — biz-ui rNet → B2.emit('net', el, W, ctx)).
   После обычной отрисовки «Сети» список «Сети точек» (по строке с 3 кнопками на вид) превращается в плитки видов:
   значок, имя, «×N», полоска прибыли, сумма за месяц, красная точка «требуют внимания». Нажал плитку — под плитками
   строка этой сети (её кнопки: опердиректор, ⬆ улучшить, ＋ ещё одна) и точки этого вида списком (как в «Бизнесе», ведут в карточку).
   Города — одной прокручиваемой строкой. Расчётов нет: прибыль — последний закрытый месяц точки (lastPm), точка — bizDot.
   На странице остаются только плитки (≤ 15) и одна раскрытая сеть — меньше элементов, чем строки всех сетей. */
(function(){'use strict';
if(typeof window==='undefined'||typeof document==='undefined')return;const J=window.B2J;if(!J)return;
const T=J.T;
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const css=document.createElement('style');css.id='b2jCssNet';
css.textContent=[
'#scr-net .bz-cities{-webkit-flex-wrap:nowrap;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px}',
'#scr-net .bz-cities::-webkit-scrollbar{display:none}#scr-net .bz-cities button{-webkit-flex:0 0 auto;flex:0 0 auto;white-space:nowrap}',
'.b2j-tiles{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;margin:0 -4px 8px}',
'.b2j-tile{position:relative;-webkit-box-sizing:border-box;box-sizing:border-box;width:calc(33.333% - 8px);margin:4px;min-height:132px;padding:10px 8px 8px;border-radius:14px;background:var(--card,#fff);border:1.5px solid var(--line,#d5dbe2);color:var(--ink,#1d2733);font:inherit;text-align:center;cursor:pointer;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;-webkit-align-items:center;align-items:center}',
'html.lk-a .b2j-tile{background:var(--lkc,#fff);box-shadow:0 2px 6px rgba(var(--lk-shc,40,60,90),.10)}',
'.b2j-tile.on{border-color:var(--blue,#1f5f99);box-shadow:0 0 0 2px var(--blue,#1f5f99) inset}',
'.b2j-tile .em{font-size:30px;line-height:36px;height:36px}.b2j-tile .em svg{width:34px;height:34px;vertical-align:middle}',
'.b2j-tile .tn{font-size:15px;font-weight:700;line-height:1.15;margin-top:4px;max-height:3.45em;overflow:hidden;-webkit-hyphens:auto;hyphens:auto;overflow-wrap:break-word;word-wrap:break-word}',
'.b2j-tile .tn.sm{font-size:14px}',
'.b2j-tile .tc{font-size:15px;color:var(--muted,#4f5d72);font-weight:700;margin-top:2px}',
'.b2j-tile .pb{width:100%;height:6px;border-radius:3px;background:var(--track,var(--line,#e3e8ee));margin:6px 0 4px;overflow:hidden}',
'.b2j-tile .pb i{display:block;height:100%;width:100%;border-radius:3px;background:var(--barfill,var(--good,#0a7a3a));-webkit-transform-origin:0 50%;transform-origin:0 50%}',
'.b2j-tile .pb i{background:var(--good,#0a7a3a)}.b2j-tile.bad .pb i{background:var(--bad,#c62828)}',
'.b2j-tile .tp{font-size:15px;font-weight:800;color:var(--good,#0a7a3a);white-space:nowrap}.b2j-tile.bad .tp{color:var(--bad,#c62828)}.b2j-tile .tp.no{color:var(--muted,#4f5d72);font-weight:600}',
'.b2j-tile .dot{position:absolute;right:8px;top:8px;width:12px;height:12px;border-radius:50%;background:var(--b2-dot,var(--bad,#c62828))}',
'.b2j-pan{-webkit-box-sizing:border-box;box-sizing:border-box;width:calc(100% - 8px);margin:4px}.b2j-pan>.card{margin:0}',
'.b2j-hint{margin:0 4px 10px;font-size:15px;color:var(--muted,#4f5d72)}',
'.b2j-more{display:block;width:100%;min-height:48px;margin:6px 0 0;border:0;background:none;color:var(--blue,#1f5f99);font:inherit;font-weight:700;cursor:pointer}',
'@media (min-width:560px){.b2j-tile{width:calc(25% - 8px)}}@media (min-width:900px){.b2j-tile{width:calc(20% - 8px)}}',
'body.th-dark .b2j-tile{background:var(--card)}'
].join('\n');
(document.head||document.documentElement).appendChild(css);

let sel=null,all=false,auto=false,shut=false;   // раскрытый вид, «показать все точки»; auto — раскрыта сама самая большая сеть (кнопки сети видны сразу, точки — кнопкой); shut — игрок свернул, сама больше не раскрывается до ухода с экрана
const CAP=30;
const MK=x=>{try{if(window.POL&&POL.ds)return POL.ds(x);}catch(e){}const a=Math.abs(x),sg=x>0?'+':x<0?'−':'';if(a>=1e6)return sg+FMT.money(a);if(a>=1e3)return sg+Math.round(a/1e3)+T('\u00a0тыс.','k');return sg+Math.round(a)+'\u00a0₽';};                    // точек списком сразу; остальные — кнопкой
let last=null;
let VW=window.innerWidth||360;window.addEventListener('resize',()=>{VW=window.innerWidth||VW;},{passive:true});   // ширину читаем заранее: innerWidth посреди перерисовки заставляет браузер пересчитать страницу (×6 — 70 мс)                   // {el,W,c} — перерисовать раскрытие без полного rNet

function chainCard(el){const L0=T('Сети точек','Chains');const secs=el.querySelectorAll('.bz-sec');
  for(let i=0;i<secs.length;i++){if(secs[i].textContent.trim()!==L0)continue;let n=secs[i].nextElementSibling;
    while(n&&!(n.classList.contains('card')&&n.classList.contains('bz-list'))){if(n.classList.contains('bz-sec'))return null;n=n.nextElementSibling;}
    return n?{sec:secs[i],card:n}:null;}
  return null;}

J.net=function(el,W,c){if(!el||!W||!c||!el.isConnected||el.querySelector('#b2jTiles'))return;
  const E=ECON,ts=(E.SMALL||[]).filter(t=>E.chainN(W,t)>0);if(ts.length<2)return;   // одна сеть — как было
  const f=chainCard(el);if(!f)return;const rows=[].slice.call(f.card.children).filter(x=>x.classList&&x.classList.contains('bz-li'));
  if(rows.length!==ts.length)return;   // разметка поменялась — не трогаем (остаётся список)
  last={el,W,c};
  const cf=c.cf||'all',pts=t=>W.biz.filter(b=>b.t===t&&(cf==='all'||b.c===cf));
  const D=ts.map((t,i)=>{const a=pts(t);let s=0,k=0,dot=false;for(const b of a){const p=c.lastPm(b);if(b.st==='w'&&p!=null){s+=p;k++;}if(!dot)try{dot=!!c.bizDot(W,b);}catch(e){}}
    return {t,i,a,n:a.length,s,k,dot};}).filter(x=>x.n>0);
  if(!D.length)return;
  if(sel&&!D.some(x=>x.t===sel)){sel=null;all=false;auto=false;}
  if(!sel&&!shut){const od=x=>!!rows[x.i].querySelector('[data-b="opd"]');let b=null;for(const y of D)if(!b||(od(y)&&!od(b))||(od(y)===od(b)&&y.n>b.n))b=y;sel=b.t;auto=true;}   // сама раскрывается самая большая сеть с опердиректором (её кнопки нужнее всего)
  const mx=Math.max.apply(null,D.map(x=>Math.abs(x.s)))||1;
  let h='';for(const x of D){const w=Math.max(4,Math.round(Math.abs(x.s)/mx*100));
    h+='<button class="b2j-tile noenter'+(x.s<0?' bad':'')+(sel===x.t?' on':'')+'" data-b2="juice:nt:'+x.t+'" aria-expanded="'+(sel===x.t)+'">'+(x.dot?'<b class="dot" title="'+esc(T('Требуют внимания','Need attention'))+'"></b>':'')
      +'<span class="em">'+c.bico(x.t)+'</span><span class="tn">'+esc(c.bn(x.t))+'</span><span class="tc">×'+x.n+'</span>'
      +'<span class="pb"><i style="-webkit-transform:scaleX('+(w/100)+');transform:scaleX('+(w/100)+')"></i></span>'
      +(x.k?'<b class="tp b2-num">'+esc(MK(x.s))+'</b>'+''+'':'<span class="tp no">'+esc(T('открываются','opening'))+'</span>')+'</button>';}
  const box=document.createElement('div');box.className='b2j-tiles';box.setAttribute('lang',(typeof LANG!=='undefined'&&LANG==='en')?'en':'ru');box.id='b2jTiles';box.innerHTML=h;
  f.card.parentNode.insertBefore(box,f.card);
  const hint=document.createElement('p');hint.className='b2j-hint';hint.textContent=sel&&!auto?T('Ещё раз на плитку — свернуть.','Tap the tile again to collapse.'):T('Нажмите плитку — точки этого вида списком. Красная точка — требуют внимания; полоска — прибыль за прошлый месяц.','Tap a tile to list its outlets. A red dot means they need attention; the bar is last month’s profit.');
  box.parentNode.insertBefore(hint,box.nextSibling);
  // строки сетей: оставляем только раскрытую, под ней — её точки
  rows.forEach((r,i)=>{if(ts[i]!==sel)r.parentNode.removeChild(r);});
  if(!sel){f.card.parentNode.removeChild(f.card);return;}
  const x=D.find(y=>y.t===sel);const a=x.a.slice().sort((p,q)=>(c.lastPm(q)||0)-(c.lastPm(p)||0)),n=all?a.length:auto?0:Math.min(CAP,a.length);
  let lh='';for(let i=0;i<n;i++)lh+=c.ptRow(W,a[i]).replace('data-b="bpt"','data-b="bpt" data-from="net"');
  if(a.length>n)lh+='<button class="b2j-more noenter" data-b2="juice:nall">'+esc(T(`Показать ${n?'все ':''}${a.length} ${pl(a.length,'точку','точки','точек','outlet','outlets')}`,`Show ${n?'all ':''}${a.length} outlets`))+'</button>';
  f.card.insertAdjacentHTML('beforeend',lh);
  // раскрытие — сразу под рядом выбранной плитки (не в конце всех плиток): последняя плитка того же ряда
  const pan=document.createElement('div');pan.className='b2j-pan';pan.appendChild(f.card);
  // ряд считаем по числу колонок (как в CSS: 3 / 4 с 560 px / 5 с 900 px) — без чтения вёрстки
  const ts0=[].slice.call(box.children),iw=VW,cols=iw>=900?5:iw>=560?4:3,k=ts0.indexOf(box.querySelector('.b2j-tile.on'));
  const after=k<0?null:ts0[Math.min(ts0.length-1,Math.floor(k/cols)*cols+cols-1)];
  box.insertBefore(pan,after?after.nextSibling:null);};

J.click=function(act,arg){
  if(act==='nt'){if(auto&&sel===arg){auto=false;}else{sel=sel===arg?null:arg;shut=!sel;all=false;auto=false;}try{SND.tap();}catch(e){}try{B2.ev('juice','tile',{t:arg,o:sel?1:0});}catch(e){}rerender();
    if(sel)setTimeout(()=>{const t=document.querySelector('#b2jTiles .b2j-tile.on');if(t&&t.scrollIntoView&&window.innerHeight){const r=t.getBoundingClientRect();if(r.bottom>window.innerHeight-160)t.scrollIntoView({block:'center'});}},30);}
  else if(act==='nall'){all=true;auto=false;try{SND.tap();}catch(e){}rerender();}};
function rerender(){try{UI.render();}catch(e){}}
/* ушли с «Сети» — плитки свёрнуты при следующем входе */
try{const nav=document.getElementById('nav');if(nav)nav.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tab]');if(b&&b.getAttribute('data-tab')!=='net'){sel=null;auto=false;shut=false;all=false;}},true);}catch(e){}
J.netSel=()=>sel;
})();
