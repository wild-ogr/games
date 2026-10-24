/* ДОГОВОР УЛИЦЫ (HOME, 18.10). API регистрируется в js/b2-home.js (доступно сразу, даже до загрузки этого файла).
   ДОГОВОР УЛИЦЫ (для FEST, ECO, QUARRY, RIVAL, JUICE):
   B2.street.add(id, fn(ctx) → item | [item] | null, prio=50) — свой объект на Улице. ctx = {W, ch:'gig'|'small'|'mid'|'quarry', ses:'win'|'spr'|'sum'|'aut' (по игровому месяцу),
     date:'ММ-ДД' (настоящая), eve: вечер по часам устройства}.
     item = {k:'tent'|'lot'|'deco', key:'строка — изменилась → Улица перерисуется', lab:'вывеска ≤ 9 знаков', col:'#цвет вывески',
             ico:'ключ ICONS' | svg:'<g>…</g>' (рамка 72×80, низ = тротуар; для deco — 360×60 над крышами), tap:'<id>:<действие>:<арг>' (как data-b2)}
     tent — палатка на тротуаре перед витринами (праздник, ёлочный базар); lot — место в ряду витрин (парк, памятник меценату); deco — украшение всей улицы (одно, верхнее по prio).
   B2.street.scene(id, fn(ctx) → '<svg …>' | null, prio) — своя сцена главы вместо Улицы (QUARRY: разрез карьера в гл.4). svg — viewBox по ширине ctx.w, высота ctx.h.
   B2.street.pop(text, {id: точка игрока|'best', col}) — всплывающая надпись над Улицей (не чаще раза в 2 с; на слабом телефоне — нет).
   B2.street.dirty() — перерисовать на следующем «Сегодня» (обычно не нужно: Улица сравнивает ключи сама).
   Соперники — B2.rivals() (договор RIVAL), пока его нет — заглушка в b2-home-street.js.
   ГНЕЗДО 'home' — строки под целью на «Сегодня» (Поток заданий — EVENT, лига — CUP): B2.slot('home','<id>',ctx=>html,prio). ctx {W}.
   ГНЕЗДО 'now' — кандидаты в карточку «Сейчас» (до 3 строк, по pr): B2.now.add('<id>', W => [{pr:0–100, ico:'эмодзи', t:'текст', s:'подпись', tap:'<id>:<д>:<а>'}]). */
/* b2-home-street.js — HOME: «Улица» на «Сегодня» (грузится по требованию из b2-home.js через B2.need).
   Как устроено (без тормозов):
   - фон — одна статичная SVG (небо, дома, витрины игрока и соперников, тротуар, дорога), перерисовывается ТОЛЬКО когда меняется ключ
     (глава, набор точек/видов, стройка/проблема, сезон игрового месяца, вечер по часам, соперники, предметы других потоков, ширина);
   - движение — до 5 отдельных слоёв (прохожие, машина, газель опта, курьер, самосвал): только CSS transform, каждый на своём слое
     композитора; вне экрана — пауза (IntersectionObserver); спокойный режим, «меньше движения», слабый телефон — всё стоит;
   - «+₽» над лучшей точкой — один элемент, раз в игровой день, Web Animations (transform/opacity).
   Нажатия: прозрачные <button> поверх витрин (≥ 48 px, подписи для чтения с экрана) → карточка точки / список / соперник / предмет потока. */
(function(){'use strict';
if(typeof document==='undefined'||!window.B2||B2.off('home'))return;
const R=B2.street._r,ST=B2.street._s,E=window.ECON;
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
const LL=(r,e)=>typeof L==='function'?L(r,e):r;
/* ---------- стиль ---------- */
const CSS=`
.b2st{margin:0 0 10px}
.b2sv{position:relative;overflow:hidden;border-radius:22px;background:#cfe6ff;contain:strict;-webkit-tap-highlight-color:transparent;box-shadow:0 6px 18px -10px rgba(28,39,76,.35)}
.b2sv>svg{position:absolute;left:0;top:0;display:block}
.b2mv{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.b2mv>i{position:absolute;left:0;display:block;will-change:transform}
.b2mv.css>i{width:100%;animation:b2x linear infinite}
.b2mv>i>svg{position:absolute;left:0;bottom:0;overflow:visible}
.b2mv.css>i.r{animation-name:b2xr}.b2mv>i.r>svg{transform:scaleX(-1)}
@keyframes b2x{from{transform:translate3d(-14%,0,0)}to{transform:translate3d(104%,0,0)}}
@keyframes b2xr{from{transform:translate3d(104%,0,0)}to{transform:translate3d(-14%,0,0)}}
.b2sv.ps .b2mv.css>i{animation-play-state:paused}
.b2sv.still .b2mv{display:none}
body.calm .b2mv{display:none}
@media (prefers-reduced-motion:reduce){.b2mv{display:none}}
.b2hit{position:absolute;bottom:0;padding:0;margin:0;border:0;background:transparent;border-radius:12px;min-height:48px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.b2hit.rvmv{box-shadow:inset 0 0 0 3px #e53935;animation:b2rv 1s ease-in-out infinite alternate}@keyframes b2rv{from{background:rgba(229,57,53,.05)}to{background:rgba(229,57,53,.28)}}
.b2sv.still .b2hit.rvmv{animation:none;background:rgba(229,57,53,.18)}
.b2hi{position:absolute;left:8px;right:8px;top:8px;background:#fff;border-radius:14px;padding:8px 12px;font:600 16px/1.3 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1c274c;box-shadow:0 4px 14px -6px rgba(0,0,0,.4);border:2px solid #3359f0}
.b2hit:active,.b2hit:focus-visible{background:rgba(255,255,255,.22);outline:0;box-shadow:inset 0 0 0 2px rgba(51,89,240,.45)}
.b2pp{position:absolute;left:0;top:0;font:900 14px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0a7a3a;white-space:nowrap;pointer-events:none;opacity:0;will-change:transform,opacity;
  text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 2px #fff}
.b2pp.neg{color:#c62828}
`;
if(!document.getElementById('b2hsCss')){const s=document.createElement('style');s.id='b2hsCss';s.textContent=CSS;document.head.appendChild(s);}

/* ---------- данные ---------- */
const KS={vend:['КОФЕ','COFFEE','#7b4a2a','v'],kiosk:['ЛАРЁК','KIOSK','#2f6fd0','k'],shaw:['ШАУРМА','SHAWARMA','#d9534f','k'],flow:['ЦВЕТЫ','FLOWERS','#c2558f','k'],
  pvz:['ПВЗ','PICK-UP','#6a5acd','s'],coffee:['КОФЕ','COFFEE','#8a5a3a','k'],wash:['МОЙКА','CAR WASH','#2a8fd0','g'],tire:['ШИНЫ','TYRES','#444c58','g'],sto:['АВТО','SERVICE','#3d6b8e','g'],
  gazel:['ГАЗЕЛЬ','VAN','#2f6fd0','van'],barber:['БАРБЕР','BARBER','#8b3a3a','s'],bakery:['ПЕКАРНЯ','BAKERY','#c8841e','s'],canteen:['СТОЛОВАЯ','CANTEEN','#b5651d','s'],
  hard:['ХОЗМАГ','HARDWARE','#5a8a3a','s'],pharm:['АПТЕКА','PHARMACY','#1f9a6a','s'],club:['КЛУБ','GAMES','#7a3bd0','s'],clean:['ХИМЧИСТКА','CLEANERS','#3b7bd0','s'],
  truckf:['ХОТ-ДОГИ','HOT DOGS','#e0663b','k'],whs:['ОПТ','WHOLESALE','#2e5c9a','w'],base:['СТРОЙБАЗА','YARD','#a0682a','w'],tk:['ТК','TRANSPORT','#3a7a5a','w']};
const SKIP={truck:1,van:1,sandpit:1,gravpit:1};
const icoKey=t=>{try{const B=E.BIZ[t],m=window.ICONS&&ICONS.map;if(B&&m)return m[B.ico]||m[String(B.ico).replace(/️/g,'')]||'';}catch(e){}return '';};
function ico(t,x,y,s){const k=typeof t==='string'&&t.indexOf(':')===0?t.slice(1):icoKey(t);if(!k||!window.ICONS)return '';const v=ICONS.svg(k);if(!v)return '';
  return '<g style="'+ICONS.vars(k)+'">'+v.replace('<svg ','<svg x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+s+'" height="'+s+'" ')+'</g>';}
const lastPm=b=>{const h=b&&b.pm;return h&&h.length?h[h.length-1]:null;};
function hu(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let a=seed>>>0||1;return ()=>{a^=a<<13;a>>>=0;a^=a>>17;a^=a<<5;a>>>=0;return a/4294967296;};}
function ses(W){if(window.__b2ses)return window.__b2ses;const m=((W.m|0)%12+12)%12;return m===11||m<=1?'win':m<=4?'spr':m<=7?'sum':'aut';}
function tod(){if(window.__b2tod)return window.__b2tod;const h=new Date().getHours();return h>=22||h<6?'night':h>=18?'eve':'day';}
function dk(){return document.body&&document.body.classList.contains('th-dark');}
/* соперники: договор RIVAL B2.rivals() → [{id, nm|name, col, n|pts (точек на улице/в городе), t|kinds:[виды]}]; пока его нет — заглушка */
function rivals(W,ch){   /* договор RIVAL a2053f2: B2.rivals.street(W,город,max) → [{id,t,col,sg,sge}]; firm(id).n — полное имя. Нет RIVAL — заглушка «Бобров и Ко» с гл.2 */
  const R2=B2.rivals;if(R2&&typeof R2.street==='function'){let r=[];try{r=R2.street(W,W.home,3)||[];}catch(e){r=[];}const seen={};
    return r.filter(x=>x&&x.id&&!seen[x.id]&&(seen[x.id]=1)).map(x=>{let f={};try{f=R2.firm(x.id)||{};}catch(e){}return {id:String(x.id),nm:String((en()?f.en:f.n)||(en()?x.sge:x.sg)||x.id),sg:String((en()?x.sge:x.sg)||''),col:x.id==='beav'?'var(--b2-rival,'+(x.col||'#b23a2b')+')':(x.col||'#c62828'),n:0,stub:0,live:1};});}
  if(ch==='gig')return [];
  return [{id:'bobr',nm:en()?'Bobrov & Co':'Бобров и Ко',col:'var(--b2-rival,#b23a2b)',n:0,stub:1}];}

/* ---------- сборка сцены ---------- */
function ctxOf(W,w,h){const ch=W.st==='gig'?'gig':W.st==='small'?'small':W.st==='quarry'?'quarry':'mid';let d='';try{const n=new Date(typeof nowMs==='function'?nowMs():Date.now());d=('0'+(n.getMonth()+1)).slice(-2)+'-'+('0'+n.getDate()).slice(-2);}catch(e){}
  return {W,ch,ses:ses(W),date:d,eve:tod()!=='day',tod:dk()?'night':tod(),w,h};}
/* b2-fix15: «＋» на витрине — точку можно улучшить (окупится ≤ 18 мес., деньги есть сверх запаса); кэш на день */
const UPC={k:''};function upSet(W){const k=W.t+'|'+(W.biz||[]).length+'|'+Math.round(W.cash/1e4);if(UPC.k===k&&UPC.W===W)return UPC.s;const s={};
  try{if(E&&E.lvGain){const fr=W.cash-(E.ptUpRes?E.ptUpRes(W):0);for(const b of W.biz||[]){if(b.st!=='w')continue;const g=E.lvGain(W,b);if(g&&g.g>0&&g.pay<=18&&g.x&&g.x.c<=fr)s[b.id]=1;}}}catch(e){}
  UPC.k=k;UPC.W=W;UPC.s=s;return s;}
function outlets(W,ch){const bz=(W.biz||[]).filter(b=>!SKIP[b.t]&&KS[b.t]);const us=upSet(W);const att=b=>{try{return !!(BIZUI.h&&BIZUI.h.bizDot&&BIZUI.h.bizDot(W,b));}catch(e){return false;}};
  if(ch==='small'||ch==='gig'){return bz.map(b=>({k:'pt',id:b.id,t:b.t,n:1,bld:b.st==='b',left:b.left|0,bad:att(b)||(b.down>0),up:!!us[b.id],off:b.down>0,pm:b.st==='w'?lastPm(b):null}));}
  const g={};for(const b of bz){const x=g[b.t]||(g[b.t]={k:'grp',id:b.t,t:b.t,n:0,bld:0,bad:false,off:false,pm:0,first:b.id});x.n++;if(b.st==='b')x.bld++;if(att(b))x.bad=true;if(us[b.id])x.up=true;const p=b.st==='w'?lastPm(b):null;if(p)x.pm+=p;}
  return Object.keys(g).map(k=>{const x=g[k];x.bld=x.bld>=x.n;return x;});}
/* какие витрины влезут: проблемные → строящиеся → по прибыли; на улице — в постоянном порядке (по id), чтобы не «прыгали» */
function pick(list,n){const sc=x=>(x.bad?3e12:0)+(x.bld?2e12:0)+(x.pm||0);const top=list.slice().sort((a,b)=>sc(b)-sc(a)).slice(0,n);
  const ord=x=>x.k==='grp'?(E.BL?E.BL.indexOf(x.t):0):(parseInt(String(x.id).replace(/\D/g,''),10)||0);return top.sort((a,b)=>ord(a)-ord(b));}

/* ---------- рисование ---------- */
const PAL={day:{s1:'#bcdcff',s2:'#eef6ff',far:'#d9e4f1',far2:'#cbd8e8',win:'#eef4fb',walk:'#cfd6df',curb:'#a9b4c1',road:'#6d7887',lane:'#ffffff',glass:'#fff1c2',ink:'#1d2733'},
  eve:{s1:'#5b6aa8',s2:'#f6b47a',far:'#7d84a8',far2:'#6a7196',win:'#ffd98a',walk:'#b7bdca',curb:'#8f98a8',road:'#555f70',lane:'#f2f2f2',glass:'#ffe08a',ink:'#1d2733'},
  night:{s1:'#141b33',s2:'#33426b',far:'#2b3658',far2:'#232d4b',win:'#ffd36b',walk:'#8d96a8',curb:'#6f7889',road:'#3b4352',lane:'#d9d9d9',glass:'#ffd36b',ink:'#1d2733'}};
const WALLS=['#fff8ee','#f4f7fc','#fdf2f0','#eef7f0','#f6f1fb','#f9f5e6'];
function sky(c,w,h,p,gy){let s=`<defs><linearGradient id="b2sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.s1}"/><stop offset="1" stop-color="${p.s2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#b2sky)"/>`;
  if(c.tod==='night'){const r=rng(7);for(let i=0;i<Math.round(w/28);i++)s+=`<circle cx="${(r()*w).toFixed(0)}" cy="${(4+r()*(gy-70)).toFixed(0)}" r="${(r()*.9+.4).toFixed(1)}" fill="#fff" opacity="${(.4+r()*.5).toFixed(2)}"/>`;
    s+=`<circle cx="${w-34}" cy="20" r="9" fill="#fff6d8"/><circle cx="${w-30}" cy="17" r="8" fill="${p.s1}"/>`;}
  else if(c.tod==='eve')s+=`<circle cx="${Math.round(w*.78)}" cy="${gy-56}" r="15" fill="#ffd38a" opacity=".9"/>`;
  else{s+=`<circle cx="${w-30}" cy="20" r="11" fill="#fff3b0"/><circle cx="${w-30}" cy="20" r="17" fill="#fff3b0" opacity=".35"/>`;
    const r=rng(hu(c.ch)),cl=(x,y,k)=>`<g fill="#fff" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="${16*k}" ry="${6*k}"/><ellipse cx="${x-9*k}" cy="${y+2*k}" rx="${9*k}" ry="${5*k}"/><ellipse cx="${x+6*k}" cy="${y-4*k}" rx="${9*k}" ry="${6*k}"/></g>`;
    for(let i=0;i<Math.max(2,Math.round(w/220));i++)s+=cl(Math.round(30+r()*(w-120)),Math.round(14+r()*14),.8+r()*.5);}
  return s;}
function far(c,w,gy,p,seed){const r=rng(seed);let s='',x=-6;const lit=c.tod!=='day';
  while(x<w){const bw=30+Math.floor(r()*34),bh=34+Math.floor(r()*40);s+=`<rect x="${x}" y="${gy-bh-8}" width="${bw}" height="${bh+8}" rx="3" fill="${r()<.5?p.far:p.far2}"/>`;
    if(lit)for(let yy=gy-bh;yy<gy-16;yy+=9)for(let xx=x+5;xx<x+bw-6;xx+=8)if(r()<.38)s+=`<rect x="${xx}" y="${yy}" width="4" height="4" fill="${p.win}" opacity=".85"/>`;
    if(c.ses==='win')s+=`<rect x="${x}" y="${gy-bh-9}" width="${bw}" height="4" rx="2" fill="#fff" opacity=".9"/>`;
    x+=bw+2+Math.floor(r()*6);}
  return s;}
function tree(x,gy,c,k){k=k||1;const leaf=c.ses==='win'?null:c.ses==='aut'?['#e39b3a','#d0742a']:c.ses==='spr'?['#9fd27c','#f5c6d6']:['#5fae5a','#4c9a4a'];
  let s=`<rect x="${x-1.5*k}" y="${gy-22*k}" width="${3*k}" height="${22*k}" rx="1.5" fill="#8a6a4a"/>`;
  if(!leaf)return `<rect x="${x-1.5*k}" y="${gy-10*k}" width="${3*k}" height="${10*k}" fill="#8a6a4a"/>`+[[0,13,30],[7,10,23],[13,7,16]].map(([d,hw,hh])=>`<path d="M${x} ${gy-10*k-hh*k-d*k}l${hw*k} ${hh*k}h${-2*hw*k}z" fill="#3f8a5a"/><path d="M${x} ${gy-10*k-hh*k-d*k}l${hw*.55*k} ${hh*.5*k}q${-hw*.55*k} ${3*k} ${-hw*1.1*k} 0z" fill="#fff"/>`).join('');   /* зимой — ель в снегу */
  return s+`<circle cx="${x}" cy="${gy-30*k}" r="${11*k}" fill="${leaf[0]}"/><circle cx="${x-6*k}" cy="${gy-25*k}" r="${7*k}" fill="${leaf[0]}"/><circle cx="${x+6*k}" cy="${gy-26*k}" r="${7*k}" fill="${leaf[0]}"/>`+(c.ses==='spr'?`<circle cx="${x+4*k}" cy="${gy-33*k}" r="${2*k}" fill="${leaf[1]}"/><circle cx="${x-5*k}" cy="${gy-28*k}" r="${2*k}" fill="${leaf[1]}"/>`:'');}
function lamp(x,gy,c){const on=c.tod!=='day';return `<rect x="${x-1}" y="${gy-46}" width="2" height="46" fill="#5d6776"/><rect x="${x-1}" y="${gy-47}" width="9" height="2.5" rx="1" fill="#5d6776"/><rect x="${x+4}" y="${gy-46}" width="6" height="3" rx="1.5" fill="${on?'#ffe08a':'#cfd6df'}"/>`+(on?`<circle cx="${x+7}" cy="${gy-40}" r="12" fill="#ffe08a" opacity=".22"/>`:'');}
function person(x,gy,col,k){k=k||1;return `<g><circle cx="${x}" cy="${gy-19*k}" r="${3.6*k}" fill="#f1c7a3"/><rect x="${x-3.8*k}" y="${gy-15*k}" width="${7.6*k}" height="${10*k}" rx="${2.6*k}" fill="${col}"/><rect x="${x-3*k}" y="${gy-6*k}" width="${2.4*k}" height="${6*k}" rx="1" fill="#39404b"/><rect x="${x+.6*k}" y="${gy-6*k}" width="${2.4*k}" height="${6*k}" rx="1" fill="#39404b"/></g>`;}
function sign(x,y,w,txt,col,fs){const n=String(txt).length||1;fs=Math.min(fs||10,(w-8)/(n*.66));return `<rect x="${x}" y="${y}" width="${w}" height="16" rx="5" style="fill:${col}"/><rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="#fff" opacity=".16"/><text x="${(x+w/2).toFixed(1)}" y="${y+11.6}" font-size="${fs.toFixed(1)}" font-weight="800" fill="#fff" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" letter-spacing=".3">${esc(txt)}</text>`;}
function badge(x,y,t,col){return `<g><circle cx="${x}" cy="${y}" r="9" fill="${col||'#d32f2f'}" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y+4}" font-size="11.5" font-weight="900" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">${esc(t)}</text></g>`;}
/* витрина: x — левый край места, w — ширина места, gy — линия тротуара */
function awn(x,y,w,col,n){n=n||Math.max(3,Math.round(w/11));const d=w/n;let s=`<rect x="${x}" y="${y}" width="${w}" height="4" fill="${col}"/>`;
  for(let i=0;i<n;i++)s+=`<path d="M${(x+i*d).toFixed(1)} ${y+3}h${d.toFixed(1)}v4a${(d/2).toFixed(1)} ${(d/2).toFixed(1)} 0 0 1 ${(-d).toFixed(1)} 0z" fill="${i%2?'#fff':col}"/>`;return s;}
function snowCap(x,y,w){return `<rect x="${x-1}" y="${y-3}" width="${w+2}" height="5" rx="2.5" fill="#fff"/><circle cx="${x+w*.3}" cy="${y+2}" r="2" fill="#fff"/><circle cx="${x+w*.72}" cy="${y+2.4}" r="1.6" fill="#fff"/>`;}
function shade(x,gy,w){return `<ellipse cx="${(x+w/2).toFixed(1)}" cy="${gy+1.5}" rx="${(w/2+2).toFixed(1)}" ry="3" fill="#1c274c" opacity=".1"/>`;}
/* витрина: x — левый край места, w — ширина места, gy — линия тротуара; высота не выше gy-18 */
function shop(c,p,o,x,w,gy,rv){const kk=KS[o.t]||['','','#6b7685','s'],form=rv?'s':kk[3],col=rv?o.col:kk[2],r=rng(hu(o.id)),lab=rv?o.lab:(en()?kk[1]:kk[0]);
  const wall=WALLS[Math.floor(r()*WALLS.length)],x0=x+4,ww=w-8,maxH=gy-16,win=c.ses==='win';let s='',top;
  const glass=o.off?'#9aa4b2':c.tod==='day'?p.glass:'#ffe7a0';
  if(form==='v'){const mw=Math.min(32,ww*.5),mx=x+w/2-mw/2,mh=Math.min(60,maxH-4);top=gy-mh;   /* кофейный автомат */
    s+=shade(mx,gy,mw)+`<rect x="${mx}" y="${top}" width="${mw}" height="${mh}" rx="7" fill="${col}"/><rect x="${mx+mw-6}" y="${top+4}" width="4" height="${mh-8}" rx="2" fill="#000" opacity=".12"/>`+
      `<rect x="${mx+4}" y="${top+14}" width="${mw-8}" height="${mh*.38}" rx="4" fill="${glass}"/>`+ico(o.t,mx+mw/2-9,top+14+mh*.19-9,18)+
      `<rect x="${mx+5}" y="${top+16+mh*.38}" width="${mw-10}" height="7" rx="2" fill="#2a2f38"/><rect x="${mx+mw/2-4}" y="${gy-12}" width="8" height="6" rx="1.5" fill="#1d2129"/>`+
      `<rect x="${mx+2}" y="${top+2}" width="${mw-4}" height="8" rx="4" fill="#fff" opacity=".2"/><text x="${mx+mw/2}" y="${top+9.6}" font-size="6.8" font-weight="800" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">${esc(lab)}</text>`;
    if(win)s+=snowCap(mx+2,top,mw-4);}
  else if(form==='k'||form==='van'){const kw=Math.min(ww,66),kx=x+w/2-kw/2,kh=Math.min(58,maxH-6);top=gy-kh;   /* ларёк / павильон / фудтрак */
    s+=shade(kx,gy,kw)+`<rect x="${kx+2}" y="${top+14}" width="${kw-4}" height="${kh-14}" rx="4" fill="${wall}" stroke="#d8dfe8"/>`+
      `<rect x="${kx-2}" y="${top}" width="${kw+4}" height="15" rx="6" fill="${col}"/><rect x="${kx}" y="${top+1}" width="${kw}" height="5" rx="2.5" fill="#fff" opacity=".18"/>`+
      `<text x="${kx+kw/2}" y="${top+11}" font-size="${Math.min(9.6,(kw-6)/(lab.length*.66)).toFixed(1)}" font-weight="800" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif" letter-spacing=".3">${esc(lab)}</text>`+
      awn(kx,top+14,kw,col)+`<rect x="${kx+6}" y="${top+25}" width="${kw-12}" height="${kh-40}" rx="3" fill="${glass}"/>`+ico(o.t,kx+kw/2-9,top+25+(kh-40)/2-9,18)+
      `<rect x="${kx+3}" y="${gy-14}" width="${kw-6}" height="5" rx="2" fill="${col}" opacity=".9"/><rect x="${kx+3}" y="${gy-9}" width="${kw-6}" height="9" fill="#000" opacity=".06"/>`;
    if(win)s+=snowCap(kx-1,top,kw+2);}
  else if(form==='g'){const gh=Math.min(64,maxH-4);top=gy-gh;   /* гараж: мойка, шины, автосервис */
    s+=shade(x0,gy,ww)+`<rect x="${x0}" y="${top}" width="${ww}" height="${gh}" rx="6" fill="${wall}" stroke="#d8dfe8"/>`+sign(x0+5,top+5,ww-10,lab,col)+
      `<rect x="${x0+6}" y="${top+26}" width="${ww-12}" height="${gh-26}" rx="3" fill="#c3cad4"/>`;for(let yy=top+30;yy<gy-2;yy+=5)s+=`<rect x="${x0+6}" y="${yy}" width="${ww-12}" height="1.4" fill="#a9b2bf"/>`;
    s+=`<rect x="${x0+ww/2-12}" y="${top+29}" width="24" height="20" rx="5" fill="#fff" opacity=".9"/>`+ico(o.t,x0+ww/2-9,top+30,18);
    if(win)s+=snowCap(x0,top,ww);}
  else if(form==='w'){const wh=Math.min(60,maxH-4);top=gy-wh;   /* склад / база / ТК */
    s+=shade(x0,gy,ww)+`<path d="M${x0} ${gy}V${top+14}l${ww/2} -14 ${ww/2} 14V${gy}z" fill="${wall}" stroke="#d8dfe8"/>`+sign(x0+5,top+16,ww-10,lab,col)+`<rect x="${x0+9}" y="${top+36}" width="${ww-18}" height="${gy-top-36}" rx="2" fill="#b8c0cb"/>`+
      `<rect x="${x0+9}" y="${top+36}" width="${ww-18}" height="3" fill="#9aa4b2"/>`+ico(o.t,x0+ww/2-8,top+40,16);
    if(win)s+=`<path d="M${x0-1} ${top+14}l${ww/2+1} -15 ${ww/2+1} 15" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;}
  else{const fl=c.ch==='mid'?1+Math.floor(r()*2):Math.floor(r()*2),bh=Math.min(maxH-2,50+fl*13);top=gy-bh;   /* магазин в доме */
    s+=shade(x0,gy,ww)+`<rect x="${x0}" y="${top}" width="${ww}" height="${bh}" rx="6" fill="${wall}" stroke="#d8dfe8"/><rect x="${x0-2}" y="${top}" width="${ww+4}" height="5" rx="2.5" fill="#1c274c" opacity=".09"/>`+
      `<rect x="${x0+ww-6}" y="${top+5}" width="5" height="${bh-5}" fill="#1c274c" opacity=".04"/>`;
    for(let f=0;f<fl;f++){const yy=top+8+f*13,n=ww>64?3:2,gw=(ww-12)/n;for(let i=0;i<n;i++)s+=`<rect x="${(x0+6+i*gw+1.5).toFixed(1)}" y="${yy}" width="${(gw-3).toFixed(1)}" height="8" rx="2" fill="${c.tod!=='day'&&r()<.6?p.win:'#dbe7f4'}"/>`;}
    s+=sign(x0+3,gy-47,ww-6,lab,col)+awn(x0+3,gy-32,ww-6,col)+`<rect x="${x0+6}" y="${gy-24}" width="${ww-24}" height="20" rx="3" fill="${glass}"/>`+ico(rv?':person':o.t,x0+6+(ww-24)/2-8.5,gy-23,17)+
      `<rect x="${x0+ww-16}" y="${gy-24}" width="11" height="24" rx="2" fill="#8a6a4a"/><circle cx="${x0+ww-8}" cy="${gy-11}" r="1" fill="#f3d27a"/>`;
    if(win)s+=snowCap(x0,top,ww);}
  if(o.bld){let sc='';for(let xx=x+7;xx<x+w-4;xx+=12)sc+=`<rect x="${xx}" y="${top-2}" width="1.8" height="${gy-top+2}" fill="#c99a46"/>`;for(let yy=top+6;yy<gy;yy+=14)sc+=`<rect x="${x+5}" y="${yy}" width="${w-10}" height="1.8" fill="#c99a46"/>`;
    s=`<g opacity=".55">${s}</g>`+sc+`<rect x="${x+w/2-25}" y="${top+4}" width="50" height="15" rx="7.5" fill="#fff" stroke="#e0a030" stroke-width="1.4"/><text x="${x+w/2}" y="${top+14.6}" font-size="8.8" font-weight="800" fill="#8a5a00" text-anchor="middle" font-family="system-ui,sans-serif">${esc(o.left?LL('ещё ','in ')+o.left+LL(' дн.',' d'):LL('СКОРО','SOON'))}</text>`;}
  if(o.off&&!o.bld)s+=`<rect x="${x+w/2-22}" y="${gy-30}" width="44" height="13" rx="3" fill="#fff" stroke="#c62828"/><text x="${x+w/2}" y="${gy-20.6}" font-size="8" font-weight="900" fill="#c62828" text-anchor="middle" font-family="system-ui,sans-serif">${esc(LL('ЗАКРЫТО','CLOSED'))}</text>`;
  if(o.n>1)s+=`<g><rect x="${x+w-31}" y="${gy-19}" width="28" height="17" rx="8.5" fill="#fff" stroke="${col}" stroke-width="1.6"/><text x="${x+w-17}" y="${gy-6.8}" font-size="10.5" font-weight="900" fill="${col}" text-anchor="middle" font-family="system-ui,sans-serif">×${o.n}</text></g>`;
  if(o.bad&&!o.bld)s+=badge(x+11,top+1,'!');else if(o.up&&!o.bld)s+=badge(x+11,top+1,'+','#2e7d32');   /* b2-fix15 */
  return {s,top};}
function moreLot(x,w,gy,n){return `<g><rect x="${x+8}" y="${gy-44}" width="${w-16}" height="38" rx="12" fill="#fff" opacity=".92" stroke="#c9d3df"/><text x="${x+w/2}" y="${gy-21}" font-size="14" font-weight="900" fill="#3359f0" text-anchor="middle" font-family="system-ui,sans-serif">+${n}</text><text x="${x+w/2}" y="${gy-10}" font-size="8" fill="#4f5d72" text-anchor="middle" font-family="system-ui,sans-serif">${esc(LL('ещё','more'))}</text></g>`;}
function home5(c,p,x,gy,w,r){const bh=78,top=gy-bh;let s=`<rect x="${x}" y="${top}" width="${w}" height="${bh}" rx="3" fill="#e8dccb" stroke="#cdbfa9"/>`;   /* пятиэтажка с подъездом */
  for(let f=0;f<5;f++)for(let i=0;i<Math.floor((w-10)/16);i++){const wx=x+6+i*16,yy=top+6+f*14;if(f===4&&Math.abs(wx+5-(x+w/2))<14)continue;s+=`<rect x="${wx}" y="${yy}" width="10" height="9" rx="1.5" fill="${c.tod!=='day'&&r()<.5?p.win:'#cfe0f2'}"/>`;}
  const dx=x+w/2;s+=`<rect x="${dx-13}" y="${gy-26}" width="26" height="4" rx="2" fill="#9a8a74"/><rect x="${dx-9}" y="${gy-22}" width="18" height="22" rx="2" fill="#6b5844"/><rect x="${dx-7}" y="${gy-20}" width="6" height="8" rx="1" fill="${p.glass}" opacity=".7"/>`+
    `<rect x="${dx+14}" y="${gy-9}" width="22" height="3" rx="1.5" fill="#8a6a4a"/><rect x="${dx+16}" y="${gy-6}" width="2" height="6" fill="#5d4a36"/><rect x="${dx+32}" y="${gy-6}" width="2" height="6" fill="#5d4a36"/>`;
  if(c.ses==='win')s+=`<rect x="${x-1}" y="${top-3}" width="${w+2}" height="5" rx="2.5" fill="#fff"/>`;return s;}
function bike(x,gy){return `<g fill="none" stroke="#2f3a4a" stroke-width="1.8"><circle cx="${x}" cy="${gy-6}" r="5.5"/><circle cx="${x+18}" cy="${gy-6}" r="5.5"/><path d="M${x} ${gy-6}l6 -9h9l3 9M${x+6} ${gy-15}l-2 -3h-3M${x+15} ${gy-15}l1 -3" stroke-linecap="round"/></g><rect x="${x+2}" y="${gy-25}" width="12" height="9" rx="2" fill="#f2b233"/>`;}
function busStop(x,gy){return `<g><rect x="${x}" y="${gy-40}" width="40" height="4" rx="2" fill="#2f6fd0"/><rect x="${x+2}" y="${gy-36}" width="2" height="36" fill="#5d6776"/><rect x="${x+36}" y="${gy-36}" width="2" height="36" fill="#5d6776"/><rect x="${x+6}" y="${gy-32}" width="28" height="18" rx="2" fill="#dfeaf7" opacity=".8"/><rect x="${x+8}" y="${gy-9}" width="24" height="3" rx="1.5" fill="#8a6a4a"/><circle cx="${x+48}" cy="${gy-34}" r="7" fill="#fff" stroke="#2f6fd0" stroke-width="2"/><text x="${x+48}" y="${gy-30.5}" font-size="9" font-weight="900" fill="#2f6fd0" text-anchor="middle" font-family="system-ui,sans-serif">А</text><rect x="${x+47}" y="${gy-27}" width="2" height="27" fill="#5d6776"/></g>`;}
function metro(x,gy){return `<g><rect x="${x}" y="${gy-30}" width="34" height="30" rx="4" fill="#efe9df" stroke="#cdbfa9"/><rect x="${x+6}" y="${gy-18}" width="22" height="18" rx="2" fill="#5d6776"/><circle cx="${x+17}" cy="${gy-38}" r="9" fill="#d32f2f"/><text x="${x+17}" y="${gy-34}" font-size="11" font-weight="900" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">М</text></g>`;}
/* сцена «Карьер» (гл.4), если QUARRY не дал своей */
function quarry(c,w,h,p){const gy=h;let s=sky(c,w,h,p,48)+`<rect y="46" width="${w}" height="${h-46}" fill="${c.ses==='win'?'#e8eef5':'#86ad62'}"/>`;
  const st=['#d9b98a','#c9a46f','#b98f58','#a87b46','#9a6d3c'],m=Math.max(20,w*.08);
  for(let i=0;i<5;i++){const x=m+i*18,y=56+i*15;s+=`<rect x="${x}" y="${y}" width="${w-2*x}" height="${i===4?h-y:15}" fill="${st[i]}"/>`;}
  s+=`<path d="M${m} 56L${m+90} ${h}" stroke="#c4a172" stroke-width="7" opacity=".7"/>`;
  const ex=Math.round(w*.62);s+=`<g><rect x="${ex}" y="${h-26}" width="34" height="14" rx="3" fill="#f2b233"/><rect x="${ex+4}" y="${h-36}" width="14" height="11" rx="2" fill="#f2b233"/><rect x="${ex+6}" y="${h-34}" width="8" height="6" fill="#cfe6ff"/><rect x="${ex-2}" y="${h-12}" width="38" height="7" rx="3.5" fill="#39404b"/><path d="M${ex+30} ${h-24}l22 -18 12 10" stroke="#e0a020" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${ex+60} ${h-34}l9 4 -4 9 -10 -3z" fill="#5d6776"/></g>`;
  s+=`<g><rect x="${Math.round(w*.25)}" y="${h-48}" width="30" height="8" rx="3" fill="#7d8796"/><circle cx="${Math.round(w*.25)+8}" cy="${h-40}" r="0" fill="none"/></g>`;
  /* меценатство ECO (B2.eco.mec): подарки городу — на бровке карьера */
  let mc=[];try{mc=B2.eco&&typeof B2.eco.mec==='function'?B2.eco.mec(c.W)||[]:[];}catch(e){mc=[];}
  mc.slice(0,4).forEach((m,i)=>{const x=Math.round(w-20-i*44),y=44;s+=`<rect x="${x-17}" y="${y-2}" width="34" height="5" rx="2.5" fill="#1c274c" opacity=".1"/>`+ico(':'+(window.ICONS&&ICONS.map[m.ic]||'leaf'),x-13,y-26,26);});
  return s;}
function scene(c){const W=c.W,w=c.w,h=c.h,p=PAL[c.tod]||PAL.day,gy=h-34,seed=hu((W.home||'kuz')+(W.id||W.hid||'')+c.ch);
  const hits=[],mv=[],ex=[];let best=null;
  /* сцена от другого потока (QUARRY: разрез карьера) */
  for(const x of R.scene){if(B2.off(x.id))continue;let v=null;try{v=x.fn(c);}catch(e){v=null;}if(v)return {svg:v,hits:c.ch==='quarry'?[{x:Math.round(w*.15),w:Math.round(w*.7),a:'home:pit',lab:LL('Карьер — открыть','Quarry — open')}]:hits,mv:[{k:'truck',y:h-62,d:13}],best:null,key:'sc:'+x.id+':'+String(v).length};}
  if(c.ch==='quarry'){return {svg:quarry(c,w,h,p),hits:[{x:Math.round(w*.15),w:Math.round(w*.7),a:'home:pit',lab:LL('Карьер — открыть','Quarry — open')}],mv:[{k:'truck',y:h-60,d:14}],best:null};}
  let s=sky(c,w,h,p,gy)+far(c,w,gy,p,seed);
  /* предметы других потоков */
  const items=[];for(const a of R.add){if(B2.off(a.id))continue;let v=null;try{v=a.fn(c);}catch(e){v=null;}if(!v)continue;(Array.isArray(v)?v:[v]).forEach(it=>{if(it&&it.k)items.push(Object.assign({o:a.id},it));});}
  const deco=items.find(i=>i.k==='deco'),tents=items.filter(i=>i.k==='tent').slice(0,2),lots=items.filter(i=>i.k==='lot').slice(0,2);
  const LW=w<420?Math.max(62,Math.floor((w-8)/5)):w<760?78:88,nL=Math.max(3,Math.floor((w-8)/LW));
  const r=rng(seed);let row=[];
  if(c.ch==='gig'){row=[{k:'home'}];if((W.biz||[]).length)row=row.concat(pick(outlets(W,'small'),nL-2));}
  else{const ol=outlets(W,c.ch),rv=rivals(W,c.ch).sort((a,b)=>(b.id===rvMv(W))-(a.id===rvMv(W)))/* b2-fix15: соперник с ходом — на виду */,nR=Math.min(rv.length,nL>=6?2:1),lotN=Math.min(lots.length,1);let free=nL-nR-lotN;
    const more=ol.length>free;if(more)free--;const ours=pick(ol,Math.max(1,free));row=ours.slice();
    rv.slice(0,nR).forEach((x,i)=>{row.splice(Math.min(row.length,1+i*3),0,{k:'rv',id:x.id,lab:(x.sg||x.nm.split(/\s/)[0]||x.nm).toUpperCase().slice(0,9),col:x.col,nm:x.nm,stub:x.stub,live:x.live,t:''});});
    lots.slice(0,lotN).forEach(x=>row.push({k:'lot',it:x}));
    if(more)row.push({k:'more',n:ol.length-ours.length});
    if(!ol.length)row.unshift({k:'empty'});}
  /* раскладка: равные места по ширине */
  const used=row.reduce((a,o)=>a+(o.k==='home'?2:1),0),lw=Math.min(LW+16,Math.floor((w-8)/Math.max(used,1)));let x=Math.max(4,Math.round((w-lw*used)/2));
  s+=`<rect x="0" y="${gy}" width="${w}" height="9" fill="${c.ses==='win'?'#f2f6fb':p.walk}"/><rect x="0" y="${gy+9}" width="${w}" height="2.5" fill="${p.curb}"/><rect x="0" y="${gy+11.5}" width="${w}" height="${h-gy-11.5}" fill="${p.road}"/>`;
  for(let lx=8;lx<w;lx+=38)s+=`<rect x="${lx}" y="${gy+21}" width="18" height="2.6" rx="1.3" fill="${p.lane}" opacity=".7"/>`;
  if(c.ses==='win')for(let i=0;i<w/14;i++)s+=`<circle cx="${(r()*w).toFixed(0)}" cy="${(r()*(gy-6)).toFixed(0)}" r="${(r()*1.2+.8).toFixed(1)}" fill="#fff" opacity=".85"/>`;
  let fr='';const bnd=[];
  for(const o of row){const ww=(o.k==='home'?2:1)*lw;bnd.push(x);
    if(o.k==='home'){fr+=home5(c,p,x+6,gy,ww-50,r)+metro(x+ww-40,gy);const eq=W.me&&W.me.eq&&W.me.eq.bike;if(eq)fr+=bike(x+ww/2-10,gy);
      hits.push({x,w:ww,a:'home:gig',lab:LL('Дом. Заказы и подработки','Home. Orders and gigs')});mv.push({k:'bike',y:gy+3,d:11});}
    else if(o.k==='empty'){fr+=busStop(x+8,gy)+person(x+20,gy,'#3a7bd5')+person(x+30,gy,'#d4a017');hits.push({x,w:ww,a:'home:open',lab:LL('Открыть первое дело','Open your first business')});}
    else if(o.k==='more'){fr+=moreLot(x,ww,gy,o.n);hits.push({x,w:ww,a:'home:list',lab:LL('Все точки','All outlets')+': +'+o.n});}
    else if(o.k==='lot'){const it=o.it;fr+=`<g transform="translate(${x},${gy-80})">${it.svg||''}</g>`+(it.lab?sign(x+6,gy-16,ww-12,it.lab,it.col||'#3a7a5a',9):'');if(it.tap)hits.push({x,w:ww,a:it.tap,lab:it.lab||''});}
    else if(o.k==='rv'){const z=shop(c,p,{id:o.id,t:'',col:o.col,lab:o.lab,n:1},x,ww,gy,true);fr+=z.s;hits.push({x,w:ww,a:o.live?'rival:open:'+o.id:'home:rv:'+o.id,lab:LL('Соперник: ','Rival: ')+o.nm,rv:rvMv(W)===o.id});}
    else{const z=shop(c,p,o,x,ww,gy,false);fr+=z.s;const nm=(window.BIZUI&&BIZUI.h&&BIZUI.h.bn?BIZUI.h.bn(o.t):o.t)+(o.n>1?' × '+o.n:'');
      hits.push({x,w:ww,a:o.k==='grp'?'home:grp:'+o.t:'home:pt:'+o.id,lab:nm+(o.bld?LL(' — строится',' — being built'):o.bad?LL(' — нужно внимание',' — needs attention'):'')});
      const pm=o.k==='grp'?o.pm:o.pm;if(!o.bld&&pm>0&&(!best||pm>best.pm))best={pm,x:x+ww/2,y:z.top-12,n:o.n||1};}
    x+=ww;}
  /* фонари и деревья между витринами, прохожие у витрин (стоят — видно и на слабом телефоне) */
  bnd.push(x);let back='',dec='';
  for(let i=0;i<bnd.length;i++){const bx=bnd[i];if(i%2===0)back+=tree(Math.max(10,Math.min(w-10,bx)),gy+1,c,.95);else if(bx>12&&bx<w-12)dec+=lamp(bx-4,gy+7,c);}   /* деревья — за витринами, фонари — на тротуаре между ними */
  if(c.ch!=='gig'&&bnd.length>2)dec+=person(Math.round(bnd[1]+lw*.22),gy+9,'#2e9d5b',.9)+person(Math.round(bnd[Math.min(bnd.length-2,3)]+lw*.7),gy+9,'#e0663b',.9);
  for(const t of tents){const tx=Math.round(w*(.3+.4*tents.indexOf(t)));dec+=`<g transform="translate(${tx-36},${gy-72})">${t.svg||''}</g>`+(t.lab?sign(tx-30,gy-14,60,t.lab,t.col||'#c62828',9):'');if(t.tap)hits.push({x:tx-36,w:72,a:t.tap,lab:t.lab||'',y:1});}
  if(deco&&deco.svg)dec+=`<g>${deco.svg}</g>`;
  s+=back+fr+dec;
  /* движение */
  if(c.ch!=='gig'){mv.push({k:'walk',y:gy+9,d:15,c:'#3a7bd5'},{k:'walk',y:gy+9,d:19,c:'#d4a017',r:1},{k:'car',y:h-6,d:8});
    if((W.biz||[]).some(b=>b.t==='whs'||b.t==='van'||b.t==='gazel'))mv.push({k:'van',y:h-14,d:11});}
  else mv.push({k:'walk',y:gy+9,d:17,c:'#5a8a3a',r:1},{k:'car',y:h-6,d:9});
  return {svg:s,hits,mv:mv.slice(0,5),best};}
/* спрайты движения (рисуются вправо; .r — отражение) */
const SP={walk:c=>`<svg width="12" height="24" viewBox="0 0 12 24">${person(6,24,c||'#3a7bd5',1)}</svg>`,
  car:()=>`<svg width="38" height="18" viewBox="0 0 38 18"><rect x="1" y="6" width="36" height="9" rx="4" fill="#e2463a"/><path d="M8 7l4 -6h12l5 6z" fill="#e2463a"/><path d="M11 6.5l2.6 -4h4.4v4zM19.6 6.5v-4h3.6l3.2 4z" fill="#cfe6ff"/><circle cx="9" cy="15" r="3.2" fill="#262b33"/><circle cx="29" cy="15" r="3.2" fill="#262b33"/><rect x="34" y="8" width="3" height="2.5" rx="1" fill="#ffe08a"/></svg>`,
  van:()=>`<svg width="46" height="22" viewBox="0 0 46 22"><rect x="1" y="2" width="30" height="15" rx="2" fill="#f4f6f9" stroke="#9aa4b2"/><path d="M31 6h8l5 6v5H31z" fill="#2f6fd0"/><path d="M33 7.5h5l3.5 4.5H33z" fill="#cfe6ff"/><text x="16" y="13" font-size="7.5" font-weight="900" fill="#2f6fd0" text-anchor="middle" font-family="system-ui,sans-serif">${en()?'OPT':'ОПТ'}</text><circle cx="9" cy="18" r="3.2" fill="#262b33"/><circle cx="37" cy="18" r="3.2" fill="#262b33"/></svg>`,
  bike:()=>`<svg width="30" height="30" viewBox="0 0 30 30"><g fill="none" stroke="#2f3a4a" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="24" r="5"/><circle cx="24" cy="24" r="5"/><path d="M6 24l6 -9h8l4 9M12 15l-1 -3"/></g><circle cx="15" cy="5" r="3.2" fill="#f1c7a3"/><rect x="11" y="8" width="8" height="8" rx="2.5" fill="#2e9d5b"/><rect x="2" y="11" width="9" height="8" rx="2" fill="#f2b233"/></svg>`,
  truck:()=>`<svg width="48" height="24" viewBox="0 0 48 24"><path d="M2 4h28l-3 12H2z" fill="#e0a020"/><path d="M4 4h24l-2 4H4z" fill="#a87b46"/><path d="M31 8h9l6 6v4H31z" fill="#f2b233"/><rect x="33" y="9.5" width="6" height="4" fill="#cfe6ff"/><circle cx="9" cy="19" r="3.6" fill="#262b33"/><circle cx="38" cy="19" r="3.6" fill="#262b33"/></svg>`};
/* ---------- показ ---------- */
let cur=null,io=null,slowT=0;
function still(){const s=B2.s('h');if(window.__chk)return false;if(B2.slow===true)return true;try{if(window.POL&&POL.still&&POL.still())return true;}catch(e){}if(document.documentElement.classList.contains('b2-still'))return true;return !!(s.slow&&Date.now()-s.slow<7*864e5);}
function hgt(w){return w>=900?168:w>=600?152:132;}
function keyOf(c,W){const ol=(W.biz||[]).map(b=>b.t+(b.st==='b'?'b'+Math.ceil((b.left|0)/5):'')+(b.down>0?'d':'')).join(',');
  let it='';for(const a of R.add){if(B2.off(a.id))continue;try{const v=a.fn(c);(Array.isArray(v)?v:[v]).forEach(x=>{if(x)it+=a.id+(x.key||x.lab||x.k);});}catch(e){}}
  let rv='';try{rv=rivals(W,c.ch).map(x=>x.id+x.n).join(',');}catch(e){}
  try{if(B2.eco&&B2.eco.mec)rv+='|'+(B2.eco.mec(W)||[]).map(m=>m.k).join(',');}catch(e){}
  let at='';try{if(BIZUI.h&&BIZUI.h.bizDot)at=(W.biz||[]).filter(b=>BIZUI.h.bizDot(W,b)).map(b=>b.id).join(',');}catch(e){}
  const eq=W.me&&W.me.eq&&W.me.eq.bike?'b':'';const fx=Object.keys(upSet(W)).join(',')+'|'+(rvMv(W)||'');   /* b2-fix15 */
  return [c.ch,c.ses,c.tod,c.w,c.h,ol,it,rv,at,eq,LANG,R.scene.length,fx].join('|');}
function rvMv(W){const m=W.b2&&W.b2.rival&&W.b2.rival.mv;return m?m.f:'';}
function hiH(z){const s=B2.s('h');if(s.hi||z.hits.length<2)return '';s.hi=1;try{if(typeof save==='function')setTimeout(save,50);}catch(e){}B2.ev('home','hi',{});   /* b2-fix15: при первом показе — подсказка Людмилы */
  setTimeout(()=>{const e=document.querySelector('.b2hi');if(e)e.remove();},15000);return `<div class="b2hi" onclick="this.remove()">👩‍💼 ${esc(LL('Людмила: нажмите на витрину — откроется точка. «!» — нужно внимание, «+» — можно улучшить.','Lyudmila: tap a shop window to open the outlet. “!” needs attention, “+” can be upgraded.'))}</div>`;}
function draw(el,W){const box=document.getElementById('b2St');if(!box)return;
  const iw=innerWidth+'|'+(S.bigF|0)+'|'+document.documentElement.className;let wv=box.firstElementChild&&draw.iw===iw?draw.w:0;   /* ширину читаем только при смене окна — без лишней вёрстки в смене дня */
  if(!wv){wv=Math.round(box.clientWidth);if(!wv)return;draw.iw=iw;draw.w=wv;}const h=hgt(wv),c=ctxOf(W,wv,h),k=keyOf(c,W);
  const sv=box.firstElementChild;if(sv&&sv.__k===k&&!ST.dirty)return;ST.dirty=0;
  const z=scene(c);if(!z)return;
  let hs='';for(const t of z.hits){const lw=Math.max(48,t.w);hs+=`<button class="b2hit noenter${t.rv?' rvmv':''}" style="left:${Math.round(t.x)}px;width:${Math.round(lw)}px;height:${t.y?72:Math.round(h-30)}px;bottom:${t.y?34:30}px" data-b2="${esc(t.a)}" aria-label="${esc(t.lab)}"></button>`;}
  let mh='';for(const m of z.mv){const sp=SP[m.k];if(!sp)continue;const ht=m.k==='walk'?24:m.k==='bike'?30:24;
    const sw=m.k==='walk'?12:m.k==='bike'?30:m.k==='van'||m.k==='truck'?48:38;
    mh+=`<i class="${m.r?'r':''}" data-d="${m.d}" data-sw="${sw}" style="top:${m.y-ht}px;height:${ht}px;width:${sw}px;animation-duration:${m.d}s;animation-delay:-${((hu(m.k+m.d)%100)/100*m.d).toFixed(1)}s">${sp(m.c)}</i>`;}
  const cls='b2sv'+(still()?' still':'');
  box.innerHTML=`<div class="${cls}" style="height:${h}px" role="group" aria-label="${esc(LL('Улица: ваши точки','Street: your outlets'))}"><svg width="${wv}" height="${h}" viewBox="0 0 ${wv} ${h}" aria-hidden="true">${z.svg}</svg><div class="b2mv${Element.prototype.animate?'':' css'}" aria-hidden="true">${mh}</div>${hs}<i class="b2pp" aria-hidden="true"></i>${hiH(z)}</div>`;
  const d=box.firstElementChild;d.__k=k;cur={best:z.best,el:d,h};
  /* движение — Web Animations в пикселях (замер ×6: CSS-анимации давали ~14 пересчётов стиля в секунду и вёрстку, WAAPI — ~5 без вёрстки) */
  cur.an=[];if(!still()&&Element.prototype.animate){let calm0=false;try{calm0=document.body.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
    if(!calm0)d.querySelectorAll('.b2mv>i').forEach(e=>{const sw=+e.dataset.sw,du=+e.dataset.d*1000,k=[{transform:`translate3d(${-sw}px,0,0)`},{transform:`translate3d(${wv}px,0,0)`}];if(e.classList.contains('r'))k.reverse();
      e.style.animation='none';const a=e.animate(k,{duration:du,iterations:Infinity,delay:-(hu(e.dataset.d+sw)%1000)/1000*du});cur.an.push(a);});}
  if(window.IntersectionObserver){if(io)io.disconnect();io=new IntersectionObserver(es=>{for(const e of es){e.target.classList.toggle('ps',!e.isIntersecting);if(cur&&cur.el===e.target)cur.an.forEach(a=>{try{e.isIntersecting?a.play():a.pause();}catch(x){}});}});io.observe(d);}
  if(!slowT&&!still())slowT=setTimeout(slowTest,6000);
  B2.ev('home','draw',{ch:c.ch,n:z.hits.length,w:wv});}
/* слабый телефон: 1,5 с кадров, пока Улица на экране; если кадры рваные — Улица стоит неделю */
function slowTest(){if(window.__chk||!cur||!cur.el||!cur.el.offsetParent||document.hidden||!window.requestAnimationFrame)return;let n=0,bad=0,t0=0;
  const f=t=>{if(t0){const d=t-t0;n++;if(d>34)bad++;}t0=t;if(n<90)requestAnimationFrame(f);else if(bad>n*.3){B2.s('h').slow=Date.now();if(cur&&cur.el){cur.el.classList.add('still');(cur.an||[]).forEach(x=>{try{x.cancel();}catch(e){}});}B2.ev('home','slow',{b:bad});}};requestAnimationFrame(f);}
/* «+₽» над лучшей точкой раз в игровой день */
function day(W){if(!cur||!cur.best||!cur.el||!cur.el.isConnected||!cur.el.offsetParent||cur.el.classList.contains('still')||cur.el.classList.contains('ps')||document.hidden)return;
  try{if(document.body.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch(e){}
  const b=cur.best,e=cur.el.querySelector('.b2pp');if(!e||!e.animate)return;const v=Math.round(b.pm/30/(b.n>1?1:1)/10)*10;if(v<=0)return;
  const t='+'+(typeof FMT!=='undefined'?FMT.money(v):v+' ₽');if(e.textContent!==t)e.textContent=t;const w=e.offsetWidth||60,x=Math.max(4,Math.min(cur.el.clientWidth-w-4,b.x-w/2)),y=Math.max(2,b.y-6);
  e.animate([{opacity:0,transform:`translate(${x}px,${y+8}px)`},{opacity:1,transform:`translate(${x}px,${y}px)`,offset:.18},{opacity:1,transform:`translate(${x}px,${y-4}px)`,offset:.7},{opacity:0,transform:`translate(${x}px,${y-14}px)`}],{duration:1700,easing:'ease-out'});}
function pop(){const q=ST.pq;if(!q.length||!cur||!cur.el||!cur.el.offsetParent)return;const now=Date.now();if(pop.t&&now-pop.t<2000){clearTimeout(pop.tm);pop.tm=setTimeout(pop,2000-(now-pop.t));return;}
  pop.t=now;const [t,o]=q.shift(),e=cur.el.querySelector('.b2pp');if(!e||!e.animate)return;e.textContent=t;e.classList.toggle('neg',/^[−-]/.test(t));
  const x=Math.max(4,Math.min(cur.el.clientWidth-(e.offsetWidth||60)-4,(cur.best?cur.best.x:cur.el.clientWidth/2)-(e.offsetWidth||60)/2)),y=cur.best?cur.best.y:20;
  e.animate([{opacity:0,transform:`translate(${x}px,${y+8}px)`},{opacity:1,transform:`translate(${x}px,${y}px)`,offset:.2},{opacity:0,transform:`translate(${x}px,${y-14}px)`}],{duration:1600});if(q.length)pop.tm=setTimeout(pop,2000);}
/* нажатия */
B2.click('home',(act,arg,el)=>{try{if(typeof snd==='function')snd('tap');}catch(e){}B2.ev('home','tap',{a:act});
  const W=GAME.W;if(!W)return;
  if(act==='pt'){BIZUI.openBiz(arg,'today');return;}
  if(act==='grp'||act==='list'){const b=act==='grp'&&(W.biz||[]).find(x=>x.t===arg);if(b&&(W.biz||[]).filter(x=>x.t===arg).length===1){BIZUI.openBiz(b.id,'today');return;}BIZUI.open(E.MID&&E.MID.indexOf(arg)>=0?'net':'biz');return;}
  if(act==='open'){BIZUI.open('biz');return;}
  if(act==='gig'){if(!BIZUI.openGigs||!BIZUI.openGigs())BIZUI.open();return;}
  if(act==='pit'){BIZUI.open('pit');return;}
  if(act==='rv'){if(typeof B2.rivalOpen==='function'&&B2.rivalOpen(arg)!==false)return;
    const r=rivals(W,W.st).find(x=>x.id===arg);if(typeof toast==='function')toast('⚔ '+(r?r.nm:'')+LL(' — соперник на вашей улице. Скоро он начнёт ходить.',' — a rival on your street. Soon they will make moves.'),2600);return;}});
window.B2H={draw,day,pop,_scene:scene,_ctx:ctxOf};
})();
