'use strict';
/* gb-MGA мини-игра №5 «Авоська» (баба Зина за покупками; id 'avoska'). Договор — шапка js/gmg-core.js (MG0). Основа — «Багажник» Выезда (vymg-bagazh).
   Авоська — сетка 5×5. Покупки — фигуры из клеток (без поворота), падают вниз, как в тетрисе: выбрал покупку на полке → нажал столбец авоськи.
   Правила: банки (h) — на дно: под ними только дно или другие банки; хрупкое (f: яйца, батон, хлеб, пряники) — сверху: на нём ничего.
   Нарушил — покупка краснеет, Зина ворчит; «Достать» снимает последнюю положенную (без штрафа, считаются только для 3★).
   Раскладка от зерна: набор проверен жадным укладчиком (банки → обычное → хрупкое), значит, решение есть всегда. Без таймера.
   Звёзды: без нарушений и ≤ 3 «Достать» — 3★; без нарушений — 2★; одно — 1★; больше — 0★. Затея дня — набор по дню.
   ПК: 1–9 — покупка, ← → — столбец, ↓ / Пробел / Enter — опустить, Backspace — достать, Enter (всё уложено) — отдать.
   Тексты и покупки — js/gmg-avoska-data.js (GMG.data.avoska). */
(function(){
if(typeof GMG_REG!=='function')return;
const ID='avoska',C=5,R=5;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const fill=(t,c)=>String(t||'').replace(/\{(\w+)\}/g,(m,k)=>c&&c[k]!=null?c[k]:'');
const cap=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t;
const T=()=>window.GMG&&GMG.data&&GMG.data.avoska||{};
const pick=(a,r)=>a&&a.length?a[Math.floor(r()*a.length)%a.length]:'';
function dayN(o){const d=String(o.day||0);return +d.slice(0,4)*372+(+d.slice(4,6))*31+(+d.slice(6,8));}
function rng(seed){let s=seed>>>0;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const ORD={h:0,n:1,f:2};
/* ---------- поле ---------- */
function Board(){const b={occ:[],put:[]};for(let y=0;y<R;y++){b.occ.push([]);for(let x=0;x<C;x++)b.occ[y].push(-1);}return b;}
function fits(b,it,x,y){if(x<0||x+it.w>C||y<0||y+it.h>R)return false;for(let j=0;j<it.h;j++)for(let i=0;i<it.w;i++)if(b.occ[y+j][x+i]>=0)return false;return true;}
function landY(b,it,x){if(x<0||x+it.w>C)return -1;let y=R-it.h;if(!fits(b,it,x,y))return -1;while(y>0&&fits(b,it,x,y-1))y--;return y;}
function place(b,it,k,x,y){for(let j=0;j<it.h;j++)for(let i=0;i<it.w;i++)b.occ[y+j][x+i]=k;b.put.push({k,x,y});}
function unplace(b){const p=b.put.pop();if(!p)return null;for(let y=0;y<R;y++)for(let x=0;x<C;x++)if(b.occ[y][x]===p.k)b.occ[y][x]=-1;return p;}
/* нарушения: {k: 'f'|'h'} по положенным покупкам */
function viol(b,items){const out={};for(const p of b.put){const it=items[p.k];
    if(it.c==='f'){for(let i=0;i<it.w;i++)for(let y=p.y+it.h;y<R;y++){const o=b.occ[y][p.x+i];if(o>=0&&o!==p.k)out[p.k]='f';}}
    if(it.c==='h'){for(let i=0;i<it.w;i++)for(let y=p.y-1;y>=0;y--){const o=b.occ[y][p.x+i];if(o>=0&&items[o].c!=='h')out[p.k]='h';}}}
  return out;}
const nViol=(b,items)=>Object.keys(viol(b,items)).length;
/* жадный укладчик: для покупки — столбец с наименьшими нарушениями, потом ниже, потом левее. noise — доля случайных ходов (бот) */
function bestCol(b,items,k,rnd,noise){const it=items[k],c=[];for(let x=0;x+it.w<=C;x++){const y=landY(b,it,x);if(y<0)continue;place(b,it,k,x,y);const v=nViol(b,items);unplace(b);c.push({x,y,v});}
  if(!c.length)return null;if(noise&&rnd()<noise)return c[Math.floor(rnd()*c.length)];c.sort((a,z)=>a.v-z.v||a.y-z.y||a.x-z.x);return c[0];}
function greedy(items,rnd,noise){const b=Board(),ord=items.map((it,k)=>k).sort((a,z)=>ORD[items[a].c]-ORD[items[z].c]||items[z].w*items[z].h-items[a].w*items[a].h);
  for(const k of ord){const p=bestCol(b,items,k,rnd,noise);if(!p)return null;place(b,items[k],k,p.x,p.y);}return b;}
/* набор покупок захода: 2–3 банки, 3–5 обычных, 1–2 хрупких (по ширине ≤ 5), клеток 16–21 из 25, укладывается без нарушений */
function make(o){const r=(o.mode==='plan'||o.mode==='day')?rng(dayN(o)*7919+5):o.rnd,A=(T().items||[]).filter(x=>x&&x[2]>0&&x[3]>0);
  const by=c=>A.filter(x=>x[4]===c);const H=by('h'),Nn=by('n'),F=by('f');
  const take=(L,n)=>{const a=L.slice(),out=[];while(out.length<n&&a.length)out.push(a.splice(Math.floor(r()*a.length),1)[0]);return out;};
  for(let tr=0;tr<200;tr++){const f=take(F,r()<.55?2:1);if(f.reduce((s,x)=>s+x[2],0)>C)continue;
    const L=take(H,2+(r()<.5?1:0)).concat(take(Nn,3+Math.floor(r()*3)),f);
    const items=L.map(x=>({g:x[0],n:x[1],w:x[2],h:x[3],c:x[4]})),cells=items.reduce((s,it)=>s+it.w*it.h,0);if(cells<16||cells>21)continue;
    if(greedy(items,r,0)){const sh=items.map((it,k)=>k);for(let i=sh.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const t=sh[i];sh[i]=sh[j];sh[j]=t;}return sh.map(k=>items[k]);}}
  return [{g:1,n:'Сгущёнка',w:1,h:1,c:'h'},{g:5,n:'Молоко',w:1,h:2,c:'n'},{g:16,n:'Яйца',w:2,h:1,c:'f'}];}
const tierOf=(v,u)=>v===0?(u<=3?3:2):v===1?1:0;
function sim(o,k){const items=make(o),r=o.rnd,b=greedy(items,r,Math.max(0,(1-k)*.9));
  if(!b)return {sc:20,st:0};let v=nViol(b,items),u=0;if(v&&r()<k){u+=v;v=Math.max(0,v-1);}u+=r()<(1-k)?2:0;return {sc:Math.max(0,100-v*30-u*5),st:tierOf(v,u)};}

const COL={h:['#dfe7ee','#8aa0b4'],n:['#f6ead2','#c9a874'],f:['#fff3c4','#e0b84c']};
function tile(g,it,x,y,w,h,bad,alpha){g.save();if(alpha!=null)g.globalAlpha=alpha;const c=COL[it.c],r=Math.min(10,w*.12,h*.12);
  g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();
  g.fillStyle=bad?'#fde6e4':c[0];g.fill();g.lineWidth=bad?3:2;g.strokeStyle=bad?'#c8401c':c[1];g.stroke();
  const s=it.w>it.h?Math.min(h*1.35,w*.62):it.h>it.w?Math.min(h*.78,w*1.55):Math.min(w,h)*1.0;
  try{if(typeof drawGood==='function')drawGood(g,it.g,x+w/2,y+h-Math.max(3,h*.07),s);}catch(e){}
  if(bad){g.fillStyle='#c8401c';g.beginPath();g.arc(x+w-9,y+9,9,0,Math.PI*2);g.fill();g.fillStyle='#fff';g.font='900 14px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('!',x+w-9,y+10);}
  g.restore();}

function run(host,o){const D=T(),items=make(o),b=Board();
  let sel=-1,gx=1,undo=0,fin=false,msg='',msgT=0,flash=null;const fest=host.fest&&host.fest.id;
  host.el.innerHTML='<div class="gma-wrap gma-av'+(fest?' gma-f-'+esc(fest):'')+'"><div class="gma-say"></div>'+
    '<div class="gma-av-leg"><span class="h">'+esc(D.legH||'')+'</span><span class="f">'+esc(D.legF||'')+'</span></div>'+
    '<div class="gma-av-sc"><canvas></canvas></div><div class="gma-av-shelf"></div>'+
    '<div class="gma-row"><button class="btn gma-av-take">↩ '+esc(D.take||'Достать')+(host.pc?' '+host.kc('Backspace'):'')+'</button>'+
    '<button class="btn green gma-av-done">✓ '+esc(D.done||'Отдать')+(host.pc?' '+host.kc('Enter'):'')+'</button></div></div>';
  const $=s=>host.el.querySelector(s),say=$('.gma-say'),box=$('.gma-av-sc'),cvs=$('.gma-av-sc canvas'),shelf=$('.gma-av-shelf'),tB=$('.gma-av-take'),dB=$('.gma-av-done');
  const left=()=>items.map((it,k)=>k).filter(k=>!b.put.some(p=>p.k===k));
  let G=null;
  function fit(){const w=box.clientWidth,h=box.clientHeight,d=host.dpr;if(!w||!h)return;if(!G||G.W!==w||G.H!==h){cvs.width=Math.round(w*d);cvs.height=Math.round(h*d);cvs.style.width=w+'px';cvs.style.height=h+'px';
    const cs=Math.floor(Math.min((w-24)/C,(h-30)/(R+.55)));G={W:w,H:h,cs,bx:Math.round((w-cs*C)/2),by:Math.round(h-8-cs*R)};}}
  function cellXY(x,y){return [G.bx+x*G.cs,G.by+(R-1-y)*G.cs];}
  function draw(){fit();if(!G)return;const g=cvs.getContext('2d'),cs=G.cs;g.setTransform(host.dpr,0,0,host.dpr,0,0);g.clearRect(0,0,G.W,G.H);
    // авоська: ручки, сетка
    const x0=G.bx-6,y0=G.by-4,w=cs*C+12,h=cs*R+10;g.strokeStyle='#b5523b';g.lineWidth=5;g.lineCap='round';
    g.beginPath();g.moveTo(x0+w*.25,y0+4);g.quadraticCurveTo(x0+w*.32,y0-cs*.55,x0+w*.42,y0+4);g.moveTo(x0+w*.58,y0+4);g.quadraticCurveTo(x0+w*.68,y0-cs*.55,x0+w*.75,y0+4);g.stroke();
    g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x0,y0,w,h);g.save();g.beginPath();g.rect(x0,y0,w,h);g.clip();g.strokeStyle='rgba(181,82,59,.45)';g.lineWidth=1.5;
    const st=Math.max(12,cs*.34);for(let t=-h;t<w+h;t+=st){g.beginPath();g.moveTo(x0+t,y0);g.lineTo(x0+t+h,y0+h);g.stroke();g.beginPath();g.moveTo(x0+t,y0+h);g.lineTo(x0+t+h,y0);g.stroke();}g.restore();
    g.strokeStyle='#b5523b';g.lineWidth=3;g.strokeRect(x0,y0,w,h);
    // положенное
    const V=viol(b,items);for(const p of b.put){const it=items[p.k],xy=cellXY(p.x,p.y+it.h-1);tile(g,it,xy[0]+2,xy[1]+2,it.w*cs-4,it.h*cs-4,!!V[p.k]);}
    // куда упадёт
    if(sel>=0&&!fin){const it=items[sel];gx=Math.max(0,Math.min(C-it.w,gx));const y=landY(b,it,gx),ax=G.bx+gx*cs;
      g.fillStyle='rgba(43,138,62,.18)';g.fillRect(ax,G.by-2,it.w*cs,cs*R+2);
      if(y>=0){const xy=cellXY(gx,y+it.h-1);tile(g,it,xy[0]+2,xy[1]+2,it.w*cs-4,it.h*cs-4,false,.55);}
      g.fillStyle=y>=0?'#2b8a3e':'#c8401c';g.beginPath();const mx=ax+it.w*cs/2;g.moveTo(mx-12,G.by-cs*.45);g.lineTo(mx+12,G.by-cs*.45);g.lineTo(mx,G.by-6);g.closePath();g.fill();}
    if(flash&&flash.t>0){g.fillStyle='rgba(200,64,28,'+(.35*flash.t)+')';g.fillRect(G.bx+flash.x*cs,G.by,flash.w*cs,cs*R);}}
  function drawShelf(){const L=left();if(sel>=0&&L.indexOf(sel)<0)sel=L.length?L[0]:-1;
    shelf.innerHTML=L.map((k,n)=>'<button class="gma-av-it'+(k===sel?' sel':'')+'" data-k="'+k+'" aria-label="'+esc(items[k].n)+'">'+(host.pc&&n<9?'<i class="gma-kn">'+(n+1)+'</i>':'')+'<canvas width="112" height="112"></canvas></button>').join('');
    [].forEach.call(shelf.querySelectorAll('.gma-av-it'),bt=>{const k=+bt.dataset.k,it=items[k],c=bt.querySelector('canvas'),g=c.getContext('2d');
      g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,112,112);
      // форма покупки — клеточки в углу (ширина × высота), цвет — класс (банка / обычное / хрупкое)
      const q=11,cc=COL[it.c];for(let j=0;j<it.h;j++)for(let i=0;i<it.w;i++){g.fillStyle=cc[0];g.fillRect(4+i*q,108-(j+1)*q,q-2,q-2);g.strokeStyle=cc[1];g.lineWidth=2;g.strokeRect(4+i*q,108-(j+1)*q,q-2,q-2);}
      try{drawGood(g,it.g,62,106,it.w>it.h?84:it.h>it.w?98:94);}catch(e){}
      bt.onclick=()=>{if(fin)return;sel=k;try{host.snd.pick();}catch(e){}drawShelf();draw();};});
    tB.disabled=!b.put.length||fin;dB.disabled=!!L.length||fin;
    if(!L.length&&!fin)say.innerHTML=host.say('zina',esc(D.allIn||''),nViol(b,items)?'sad':'happy');}
  function drop(x){if(fin)return;if(sel<0){say.innerHTML=host.say('zina',esc(D.pickFirst||''),'norm');return;}const it=items[sel];x=Math.max(0,Math.min(C-it.w,x));
    const y=landY(b,it,x);if(y<0){flash={x,w:it.w,t:1};try{host.snd.bad();}catch(e){}
      const any=left().some(k=>{for(let xx=0;xx+items[k].w<=C;xx++)if(landY(b,items[k],xx)>=0)return true;return false;});
      say.innerHTML=host.say('zina',esc(any?D.noFit:D.stuck),'sad');return;}
    const k=sel;place(b,it,k,x,y);const V=viol(b,items);try{host.snd.drop();}catch(e){}
    let line=pick(D.okSay,o.rnd),mood='happy';
    if(V[k]==='h'){line=fill(pick(D.badH,o.rnd),{n:it.n});mood='sad';}
    else{const crushed=Object.keys(V).filter(q=>+q!==k&&V[q]==='f');if(crushed.length){line=fill(pick(D.badF,o.rnd),{n:items[+crushed[0]].n.toLowerCase()});mood='sad';}}
    if(mood==='sad')try{host.snd.bad();}catch(e){}
    say.innerHTML=host.say('zina',esc(cap(line)),mood);sel=-1;const L=left();if(L.length){sel=L[0];gx=Math.min(gx,C-items[sel].w);}drawShelf();draw();host.top(b.put.length+' из '+items.length);}
  function take(){if(fin||!b.put.length)return;const p=unplace(b);undo++;sel=p.k;gx=p.x;try{host.snd.back();}catch(e){}drawShelf();draw();host.top(b.put.length+' из '+items.length);}
  function done(){if(fin||left().length)return;fin=true;const v=nViol(b,items),u=undo;host.top('');
    host.finish({sc:Math.max(0,100-v*30-u*5),st:tierOf(v,u),h:v,label:fill(D.label,{n:items.length-v,m:items.length})});}
  host.ptr(cvs,{down:(x,y)=>{if(!G||fin)return;const c=Math.floor((x-G.bx)/G.cs);if(c<0||c>=C||y<G.by-G.cs*.8)return;
    if(sel>=0){const it=items[sel];let xx=c-Math.floor(it.w/2);xx=Math.max(0,Math.min(C-it.w,xx));gx=xx;drop(xx);}else drop(c);}});
  tB.onclick=take;dB.onclick=done;
  host.loop(dt=>{if(flash){flash.t-=dt*2;if(flash.t<=0)flash=null;draw();}});
  host.onResize(()=>{G=null;draw();});
  host.keys(k=>{if(fin)return false;if(/^[1-9]$/.test(k)){const L=left(),q=L[+k-1];if(q!=null){sel=q;try{host.snd.pick();}catch(e){}drawShelf();draw();}return true;}
    if(k==='ArrowLeft'){gx=Math.max(0,gx-1);draw();return true;}if(k==='ArrowRight'){gx=Math.min(C-(sel>=0?items[sel].w:1),gx+1);draw();return true;}
    if(k==='ArrowDown'||k===' '){drop(gx);return true;}if(k==='Enter'){if(left().length)drop(gx);else done();return true;}
    if(k==='Backspace'||k==='Delete'){take();return true;}return false;});
  host.onQuit(()=>{fin=true;});
  /* бот стенда: хороший — банки, потом обычное, потом хрупкое, лучший столбец; слабый — случайно; видит нарушение — достаёт (с вероятностью k) */
  host.bot=k=>{if(fin)return;const L=left();if(!L.length){if(nViol(b,items)&&Math.random()<k*.7&&undo<6){take();return;}done();return;}
    const last=b.put[b.put.length-1];if(last&&viol(b,items)[last.k]&&Math.random()<k*.8&&undo<8){take();return;}
    const ord=L.slice().sort((a,z)=>ORD[items[a].c]-ORD[items[z].c]||items[z].w*items[z].h-items[a].w*items[a].h);const q=Math.random()<k?ord[0]:L[Math.floor(Math.random()*L.length)];
    const p=bestCol(b,items,q,Math.random,(1-k)*.6);sel=q;if(!p){if(b.put.length)take();return;}gx=p.x;drop(p.x);};
  host.el._mga={items,b,left,ord:()=>left().sort((a,z)=>ORD[items[a].c]-ORD[items[z].c]||items[z].w*items[z].h-items[a].w*items[a].h),viol:()=>viol(b,items),best:q=>bestCol(b,items,q,Math.random,0),sel:()=>sel,gx:()=>gx,fin:()=>fin};
  say.innerHTML=host.say('zina',esc(D.start||D.pickFirst||''),'norm');
  sel=left()[0];drawShelf();host.top('0 из '+items.length);
  host.intro({who:'zina',text:D.intro,hint:esc(host.pc?D.hintPC||D.hint:D.hint),btn:D.btn||'Начать'}).then(()=>{G=null;draw();});
  setTimeout(()=>{G=null;draw();},0);}

GMG_REG({id:ID,deps:['js/gmg-avoska-data.js'],run,sim,make,greedy,tile,
  get lines(){return T().lines||{};}});

(function(){if(document.getElementById('gma-av-css'))return;const st=document.createElement('style');st.id='gma-av-css';st.textContent=
'.gma-av-leg{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:2px auto;font-weight:800;font-size:16px}'+
'.gma-av-leg span{padding:3px 10px;border-radius:10px;border:2px solid}.gma-av-leg .h{background:#dfe7ee;border-color:#8aa0b4}.gma-av-leg .f{background:#fff3c4;border-color:#e0b84c}'+
'.gma-av-sc{flex:1 1 auto;min-height:190px;max-height:430px;margin:2px auto;width:calc(100% - 16px);max-width:520px;position:relative}'+
'.gma-av-sc canvas{display:block;position:absolute;left:0;top:0;touch-action:none}'+
'.gma-av-shelf{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px auto;width:calc(100% - 16px);max-width:560px;min-height:58px}'+
'.gma-av-it{position:relative;width:58px;height:58px;padding:0;border:2px solid #d8c8a8;border-radius:12px;background:#fffaf0;cursor:pointer}'+
'.gma-av-it canvas{width:54px;height:54px;display:block}.gma-av-it .gma-kn{font-style:normal}.gma-av-it.sel{border-color:#2b8a3e;box-shadow:0 0 0 3px rgba(43,138,62,.35);background:#eefaf0}'+
'@media (min-width:700px) and (min-height:700px){.gma-av-it{width:68px;height:68px}.gma-av-it canvas{width:64px;height:64px}}';
document.head.appendChild(st);})();
(function(){if(document.getElementById('gma-css'))return;const st=document.createElement('style');st.id='gma-css';st.textContent=
'.gma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:4px 0 10px;min-height:0;overflow-y:auto;overflow-x:hidden;font-size:17px}'+
'.gma-say{margin:0 auto;width:calc(100% - 20px);max-width:560px;min-height:58px}'+
'.gma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 20px);max-width:560px}.gma-row .btn{flex:1 1 0;min-height:56px;font-size:18px;margin:0}'+
'.gma-row .btn[disabled]{opacity:.45}';document.head.appendChild(st);})();
})();
