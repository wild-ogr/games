/* RB:MGD — общие рисунки и «сцена» мини-игр потока MGD (№6 Распутай, №13 Домино, №14 Спор, №8 Рынок).
   Только вид: холст во весь host.el + слой DOM-кнопок в стиле «Стекло и свет» (переменные --pn/--acc*).
   Персонажи кодом в полном качестве: Петрович, Жора-перекупщик, тётя Валя, кот Васька. Фоны: двор, рынок, мостки.
   Без ?. и ??, без inset. Слабый телефон (LOW) — холст ≤1,25 точки (lowDp), без shadowBlur, частиц меньше. */
(function(){
'use strict';
var A={};
function low(){try{return !!LOW;}catch(e){return false;}}
function dp(){try{return lowDp();}catch(e){return Math.min(2,window.devicePixelRatio||1);}}
function Lx(ru,en){try{return L(ru,en);}catch(e){return ru;}}
A.L=Lx;A.low=low;
A.snd=function(k){try{if(SND[k])SND[k]();}catch(e){}};
A.clack=function(v){try{noise(.05,.14*(v||1),2600,'bandpass');tone('triangle',1500,1100,.04,.03);}catch(e){}};
A.rng=function(seed){var s=(seed>>>0)||1;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
A.clamp=function(v,a,b){return v<a?a:v>b?b:v;};
A.ease=function(k){k=A.clamp(k,0,1);return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;};
A.back=function(k){k=A.clamp(k,0,1);var c=1.7;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2);};
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
A.rr=rr;
/* сколько «говорит» персонаж: по длине реплики (без тегов) */
A.talkT=function(t){var n=String(t||'').replace(/<[^>]*>/g,'').length;return Math.min(3.6,.8+n*.035);};
function ell(g,x,y,rx,ry,rot){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,Math.PI*2);}
A.ell=ell;
function shade(hex,k){var n=parseInt(hex.slice(1),16),r=n>>16,gg=n>>8&255,b=n&255;
  if(k<0){r*=1+k;gg*=1+k;b*=1+k;}else{r+=(255-r)*k;gg+=(255-gg)*k;b+=(255-b)*k;}
  return 'rgb('+Math.round(r)+','+Math.round(gg)+','+Math.round(b)+')';}
A.shade=shade;
A.txt=function(g,s,x,y,px,col,al,ol,wt){g.font=(wt||600)+' '+px+'px LkGolos,-apple-system,Segoe UI,Roboto,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';
  if(ol){g.lineJoin='round';g.lineWidth=Math.max(2,px*.2);g.strokeStyle=ol;g.strokeText(s,x,y);}g.fillStyle=col||'#fff';g.fillText(s,x,y);};

/* ---------- стиль DOM (один раз) ---------- */
var CSS='.mgd{position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;font-family:var(--font,LkGolos,sans-serif);color:#fff;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
'.mgd canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none}'+
'.mgd-ui{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}'+
'.mgd-ui>*{pointer-events:auto}'+
'.mgd-top{position:absolute;left:70px;right:70px;top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;align-items:center;justify-content:center;pointer-events:none}'+
'.mgd-ttl{background:var(--pn,rgba(16,26,36,.42));-webkit-backdrop-filter:var(--blur,blur(18px));backdrop-filter:var(--blur,blur(18px));border:1px solid var(--pnB,rgba(255,255,255,.2));box-shadow:var(--sh);border-radius:18px;padding:8px 18px;font-size:19px;font-weight:600;text-shadow:var(--txSh);max-width:100%;text-align:center;line-height:1.2}'+
'.mgd-ttl small{display:block;font-size:17px;font-weight:400;color:var(--tx2,rgba(255,255,255,.84))}'+
'.mgd-bar{position:absolute;left:0;right:0;bottom:0;padding:12px 14px calc(14px + env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center}'+
'.mgd-row{display:flex;width:100%;max-width:560px;justify-content:center}.mgd-row>*{flex:1 1 0;margin:0 6px}'+
'.mgd-btn{min-height:64px;border-radius:20px;border:1px solid var(--secB,rgba(255,255,255,.28));background:var(--pn2,rgba(16,26,36,.66));-webkit-backdrop-filter:var(--blur,blur(18px));backdrop-filter:var(--blur,blur(18px));color:#fff;font:600 20px/1.15 var(--font,LkGolos,sans-serif);padding:8px 14px;box-shadow:var(--sh),inset 0 1px 0 var(--pnH,rgba(255,255,255,.1));cursor:pointer;text-shadow:var(--txSh);transition:transform .12s}'+
'.mgd-btn:active{transform:scale(.96)}'+
'.mgd-btn.pri{background:linear-gradient(180deg,var(--acc1,#ffcf7a),var(--acc2,#ff8f4f));color:var(--accT,#3b1c00);border-color:rgba(255,255,255,.5);text-shadow:none;box-shadow:var(--accSh),inset 0 1px 0 rgba(255,255,255,.6)}'+
'.mgd-btn.ok{background:linear-gradient(180deg,#8be8b9,#3fbf86);color:#073b24;text-shadow:none;border-color:rgba(255,255,255,.5)}'+
'.mgd-btn.ad{border-style:dashed;font-size:18px;min-height:56px;margin-top:10px;max-width:560px;width:100%}'+
'.mgd-btn[disabled]{opacity:.45}'+
'.mgd-btn .ic{width:1.1em;height:1.1em;vertical-align:-.18em;margin-right:.3em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
'.mgd-say{position:absolute;max-width:88%;max-width:min(88%,520px);background:var(--say,rgba(16,26,36,.72));-webkit-backdrop-filter:var(--blur,blur(18px));backdrop-filter:var(--blur,blur(18px));border:1px solid var(--pnB,rgba(255,255,255,.2));box-shadow:var(--sh);border-radius:20px;padding:10px 16px 12px;font-size:19px;line-height:1.3;color:var(--sayT,#fff);pointer-events:none;transition:opacity .25s,transform .25s;transform-origin:50% 100%}'+
'.mgd-say b{display:block;color:var(--sayN,#ffd27a);font-size:17px;margin-bottom:2px}'+
'.mgd-say.hid{opacity:0;transform:scale(.92) translateY(8px)}'+
'.mgd-say:after{content:"";position:absolute;left:var(--tx-arrow,40px);bottom:-9px;width:18px;height:18px;background:inherit;border-right:1px solid var(--pnB,rgba(255,255,255,.2));border-bottom:1px solid var(--pnB,rgba(255,255,255,.2));transform:rotate(45deg);-webkit-backdrop-filter:none;backdrop-filter:none}'+
'.mgd-say.up:after{bottom:auto;top:-9px;transform:rotate(225deg)}'+
'.mgd-res{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));width:92%;width:min(92%,440px);max-height:calc(100% - 90px);overflow:auto;transform:translate(-50%,30px) scale(.95);opacity:0;transition:opacity .3s,transform .35s cubic-bezier(.2,1.4,.4,1);background:var(--pnS,rgba(20,32,44,.86));-webkit-backdrop-filter:var(--blur,blur(18px));backdrop-filter:var(--blur,blur(18px));border:1px solid var(--pnB,rgba(255,255,255,.2));border-radius:26px;box-shadow:0 20px 60px rgba(0,0,0,.45),inset 0 1px 0 var(--pnH,rgba(255,255,255,.1));padding:18px 18px 16px;text-align:center}'+
'.mgd-res.on{opacity:1;transform:translate(-50%,0) scale(1)}'+
'.mgd-res h2{margin:4px 0 2px;font-size:26px;font-weight:600;color:var(--gold,#ffd27a);text-shadow:var(--txSh)}'+
'.mgd-res p{margin:6px 0;font-size:18px;line-height:1.35;color:var(--tx2,rgba(255,255,255,.84))}'+
'.mgd-res .big{font-size:22px;color:#fff;font-weight:600}'+
'.mgd-stars{display:flex;justify-content:center;margin:6px 0 4px}.mgd-stars svg{width:58px;height:58px;margin:0 4px;opacity:.25;transform:scale(.6);transition:transform .35s cubic-bezier(.2,1.6,.4,1),opacity .2s}.mgd-stars svg.on{opacity:1;transform:scale(1)}.mgd-stars svg:nth-child(2){width:70px;height:70px;margin-top:-8px}'+
'.mgd-res .mgd-btn{width:100%;margin-top:10px}'+
'.mgd-chip{display:inline-block;margin:6px 4px 0;padding:6px 12px;border-radius:14px;background:var(--in,rgba(255,255,255,.08));border:1px solid var(--inB,rgba(255,255,255,.14));font-size:17px;color:#fff}'+
'@media (prefers-reduced-motion:reduce){.mgd-res,.mgd-say,.mgd-stars svg{transition:none}}'+
'body.calm .mgd-res,body.calm .mgd-stars svg{transition:none}'+
'@media (min-width:900px){.mgd-btn{font-size:21px}.mgd-say{font-size:20px}}'+
'@media (max-aspect-ratio:11/10){.mgd-wideonly{display:none}}'+
/* RB:MGPC ПК: подсветка кнопок под мышью, неактивные — без «руки» */
'html.mg-pc .mgd-btn.kf:not([disabled]),html.mg-pc .kf{outline:3px dashed #fff;outline-offset:4px}'+
'html.mg-pc .mgd-btn:not([disabled]):hover{filter:brightness(1.14);transform:translateY(-1px)}html.mg-pc .mgd-btn[disabled]{cursor:default}.mgd-btn .mg-k{margin-left:10px}'+
'@media (max-width:640px){.mgd-top{left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 66px)}.mgd-ttl{font-size:18px;padding:6px 14px}}';
function css(){if(document.getElementById('mgd-css'))return;var s=document.createElement('style');s.id='mgd-css';s.textContent=CSS;document.head.appendChild(s);}
A.STAR='<svg viewBox="0 0 64 64"><defs><linearGradient id="mgs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b0"/><stop offset=".5" stop-color="#ffcf4a"/><stop offset="1" stop-color="#e89a12"/></linearGradient></defs><path d="M32 4l8.6 17.6 19.4 2.8-14 13.7 3.3 19.3L32 48.3 14.7 57.4 18 38.1 4 24.4l19.4-2.8z" fill="url(#mgs)" stroke="#b5700a" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 22c3-1 6-1 9 0" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" fill="none"/></svg>';
A.icon=function(k){try{return LOOK.I(k);}catch(e){return '';}};
A.coinSvg=function(){try{return LOOK.coin();}catch(e){return '💰';}};

/* ---------- сцена: холст + слой кнопок + кадр ---------- */
A.stage=function(host,o){css();var root=document.createElement('div');root.className='mgd';var c=document.createElement('canvas');var ui=document.createElement('div');ui.className='mgd-ui';
  root.appendChild(c);root.appendChild(ui);host.el.appendChild(root);
  var S={root:root,c:c,g:c.getContext('2d'),ui:ui,W:1,H:1,d:1,t:0,alive:true,fx:[],calm:!!(o&&o.calm),frame:null,resize:null,down:null,move:null,up:null,hover:null,tm:[],pc:!!host.pc};
  function fit(){var r=root.getBoundingClientRect(),W=Math.max(1,Math.round(r.width)),H=Math.max(1,Math.round(r.height)),d=dp();
    if(W===S.W&&H===S.H&&d===S.d&&c.width)return;S.W=W;S.H=H;S.d=d;c.width=Math.round(W*d);c.height=Math.round(H*d);if(S.resize)S.resize(W,H);}
  S.fit=fit;fit();
  var last=0,raf=0;
  function loop(ts){if(S.alive&&c.isConnected===false)S.alive=false;/*MERGE: окно игры закрыто оболочкой — цикл стоп*/if(!S.alive)return;raf=requestAnimationFrame(loop);var dt=last?Math.min(.05,(ts-last)/1000):.016;last=ts;if(host.paused)dt=0;/*RB:MGPC пауза: время игры и таймеры S.later стоят*/S.step(dt);}
  S.step=function(dt){fit();S.t+=dt;if(dt>0&&S.tm.length){var due=[];for(var i=S.tm.length-1;i>=0;i--)if(S.tm[i].at<=S.t){due.unshift(S.tm[i]);S.tm.splice(i,1);}due.forEach(function(q){try{q.fn();}catch(e){try{console.error(e);}catch(x){}}});}var g=S.g;g.setTransform(S.d,0,0,S.d,0,0);if(S.frame)S.frame(dt,S.t);A.fxStep(S,dt);};
  raf=requestAnimationFrame(loop);
  function pt(e){var r=c.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  var pid=null;
  /* RB:MGPC таймеры по времени игры (в паузе стоят): S.later(fn,мс) вместо setTimeout */
  S.later=function(fn,ms){var q={at:S.t+(ms||0)/1000,fn:fn};S.tm.push(q);return q;};
  S.cancel=function(q){var i=S.tm.indexOf(q);if(i>=0)S.tm.splice(i,1);};
  /* RB:MGPC ПК: значок клавиши (на телефоне сам прячется), клавиши игры, плашка-подсказка, курсор */
  S.kc=function(k){try{return MG.kc(k);}catch(e){return '';}};
  S.keys=function(fn){if(host.keys)host.keys(function(k,e){if(!S.alive)return false;return fn(k,e);});};
  // pos: 'top'|'bottom' или число — отступ снизу (над своими кнопками), чтобы плашка их не закрывала
  S.kbd=function(html,sec,pos){if(!host.kbd||!host.pc)return;host.kbd(html,sec||7,typeof pos==='number'?'bottom':pos);
    if(typeof pos==='number'){var lay=root.parentNode&&root.parentNode.parentNode,kh=lay&&lay.querySelector('.mg-kh');if(kh)kh.style.bottom='calc(env(safe-area-inset-bottom,0px) + '+pos+'px)';}};
  /* RB:MGPC выбор кнопок клавишами: list() — кнопки по порядку; 1..n — нажать n-ю видимую, ←/→ (↑/↓) — выбрать (пунктир), Enter/пробел — нажать выбранную.
     opt.first — Enter без выбора сначала выбирает первую (а не жмёт data-enter); opt.keep — нажатая цифрой остаётся выбранной; opt.sel — цифра только выбирает (жмёт Enter). */
  S.nav=function(list,opt){opt=opt||{};var cur=null;
    function vis(){return list().filter(function(b){return b&&b.isConnected&&!b.disabled&&b.offsetParent&&!b.classList.contains('gone');});}
    function mark(b){if(cur)cur.classList.remove('kf');cur=b;if(b)b.classList.add('kf');}
    S.keys(function(k){var l=vis();if(cur&&l.indexOf(cur)<0)mark(null);if(!l.length)return false;
      if(/^[1-9]$/.test(k)){var b=l[+k-1];if(!b)return true;if(opt.sel){mark(b);A.snd('tap');return true;}mark(opt.keep?b:null);b.click();return true;}
      var d=k==='ArrowLeft'||k==='ArrowUp'?-1:k==='ArrowRight'||k==='ArrowDown'?1:0;
      if(d){var i=l.indexOf(cur);mark(l[i<0?(d>0?0:l.length-1):A.clamp(i+d,0,l.length-1)]);return true;}
      if(k==='Enter'||k===' '){if(cur){cur.click();return true;}if(opt.first){mark(l[0]);return true;}return false;}
      return false;});
    return {mark:mark,get cur(){return cur;}};};
  S.cursor=function(v){if(c.style.cursor!==(v||''))c.style.cursor=v||'';};
  c.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;if(pid!==null&&pid!==e.pointerId)return;pid=e.pointerId;try{c.setPointerCapture(e.pointerId);}catch(x){}if(S.down)S.down(pt(e));e.preventDefault();});
  // RB:MGPC движение мыши без кнопки — только наведение (S.hover), игру не трогает
  c.addEventListener('pointermove',function(e){if(pid===null){if(S.hover&&e.pointerType==='mouse')S.hover(pt(e));return;}if(pid!==e.pointerId)return;if(S.move)S.move(pt(e));e.preventDefault();});
  function up(e){if(pid!==e.pointerId)return;pid=null;if(S.up)S.up(pt(e));}
  c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);c.addEventListener('lostpointercapture',up);
  c.addEventListener('pointerleave',function(e){if(pid===null&&S.hover&&e.pointerType==='mouse')S.hover(null);});
  S.stop=function(){S.alive=false;cancelAnimationFrame(raf);};
  S.el=function(tag,cls,html,parent){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;(parent||ui).appendChild(e);return e;};
  // key — клавиша кнопки: значок MG.kc на ПК; 'Enter' ещё и data-enter (Enter/пробел жмут её через оболочку)
  S.btn=function(cls,html,fn,parent,key){var b=S.el('button','mgd-btn '+(cls||''),html+(key?S.kc(key==='Enter'?'Enter':key):''),parent);b.type='button';if(key==='Enter')b.setAttribute('data-enter','');b.onclick=function(e){e.stopPropagation();if(b.disabled)return;A.snd('tap');fn(b);};return b;};
  S.say=null;
  /* реплика: who — имя, txt — слова, x,y — точка, куда показывает хвостик (низ облачка над точкой) */
  S.speak=function(who,txt,x,y,opt){opt=opt||{};if(!S.say){S.say=S.el('div','mgd-say hid');}var e=S.say;e.innerHTML=(who?'<b>'+who+'</b>':'')+txt;
    e.classList.toggle('up',!!opt.up);var w=Math.min(S.W*.88,520);e.style.maxWidth=w+'px';e.style.left='0px';e.style.top='0px';
    var bw=e.offsetWidth,bh=e.offsetHeight,lx=A.clamp(x-bw*.3,12,S.W-bw-12),ty=opt.up?y+14:y-bh-14;e.style.left=lx+'px';e.style.top=Math.max(opt.minTop!=null?opt.minTop:(S.W<=640?118:76),ty)+'px';
    e.style.setProperty('--tx-arrow',A.clamp(x-lx-9,18,bw-36)+'px');void e.offsetWidth;e.classList.remove('hid');clearTimeout(S._sayT);if(opt.hide)S._sayT=setTimeout(function(){e.classList.add('hid');},opt.hide);};
  S.hush=function(){if(S.say)S.say.classList.add('hid');};
  return S;};

/* окно итогов: o={title, stars 0..3, lines:[html], chips:[html], btn:'Готово', ad:{txt,fn}} → вызывает onClose */
A.result=function(S,o,onClose){var w=S.el('div','mgd-res'),h='';
  if(o.stars!=null){h+='<div class="mgd-stars">'+[0,1,2].map(function(){return A.STAR.replace(/mgs/g,'mgs'+Math.random().toString(36).slice(2,7));}).join('')+'</div>';}
  h+='<h2>'+o.title+'</h2>';(o.lines||[]).forEach(function(l){h+='<p>'+l+'</p>';});
  if(o.chips&&o.chips.length)h+='<div>'+o.chips.map(function(c){return '<span class="mgd-chip">'+c+'</span>';}).join('')+'</div>';
  w.innerHTML=h;
  if(o.ad){var ab=S.btn('ad',A.icon('ad')+o.ad.txt,function(){ab.disabled=true;o.ad.fn(ab);},w);}
  S.btn('pri',o.btn||Lx('Готово','Done'),function(){if(onClose)onClose();},w,'Enter');
  requestAnimationFrame(function(){w.classList.add('on');});
  if(o.stars!=null){var ss=w.querySelectorAll('.mgd-stars svg');for(var i=0;i<o.stars;i++)(function(i){setTimeout(function(){ss[i].classList.add('on');A.snd(i===2?'catch':'coin');},S.calm?0:350+i*320);})(i);}
  return w;};

/* ---------- частицы: искры, листья, монетки ---------- */
A.fxAdd=function(S,p){if(S.calm&&p.k!=='coin'&&p.k!=='leaf')return;if(low()&&S.fx.length>60)return;S.fx.push(p);};
A.burst=function(S,x,y,n,cols){n=low()?Math.ceil(n/3):n;for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,v=80+Math.random()*220;
  A.fxAdd(S,{k:'spark',x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,life:.9+Math.random()*.5,t:0,c:cols[i%cols.length],r:3+Math.random()*4,rot:Math.random()*6});}};
A.coins=function(S,x,y,tx,ty,n){for(var i=0;i<n;i++)A.fxAdd(S,{k:'coin',x:x,y:y,x0:x+(Math.random()-.5)*60,y0:y-40-Math.random()*60,tx:tx,ty:ty,t:-i*.07,life:.9});};
A.fxStep=function(S,dt){var g=S.g,f=S.fx;for(var i=f.length-1;i>=0;i--){var p=f[i];p.t+=dt;if(p.t>p.life){f.splice(i,1);continue;}if(p.t<0)continue;var k=p.t/p.life;
  if(p.k==='spark'){p.vy+=420*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*8;g.save();g.globalAlpha=1-k;g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.c;g.fillRect(-p.r,-p.r*.5,p.r*2,p.r);g.restore();}
  else if(p.k==='coin'){var e=A.ease(k),bx=(1-e)*(1-e)*p.x+2*(1-e)*e*p.x0+e*e*p.tx,by=(1-e)*(1-e)*p.y+2*(1-e)*e*(p.y0-80)+e*e*p.ty;A.coin(g,bx,by,11*(1-.3*k),S.t*6+i);}
  else if(p.k==='leaf'){p.x+=p.vx*dt+Math.sin(S.t*2+p.ph)*20*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;g.save();g.globalAlpha=Math.min(1,(1-k)*3);g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.c;
    g.beginPath();g.moveTo(-p.r,0);g.quadraticCurveTo(0,-p.r*.7,p.r,0);g.quadraticCurveTo(0,p.r*.7,-p.r,0);g.fill();g.strokeStyle='rgba(90,50,10,.4)';g.lineWidth=1;g.beginPath();g.moveTo(-p.r,0);g.lineTo(p.r,0);g.stroke();g.restore();}
  else if(p.k==='txt'){g.save();g.globalAlpha=k<.7?1:1-(k-.7)/.3;var pxs=p.px||24,tx=p.x;if(p.coin){g.font='600 '+pxs+'px LkGolos,sans-serif';var tw=g.measureText(p.s).width;tx=p.x-pxs*.45;A.coin(S.g,tx+tw/2+pxs*.5,p.y-k*50,pxs*.38,0);}A.txt(g,p.s,tx,p.y-k*50,pxs,p.c||'#ffd27a','center','rgba(40,20,0,.7)');g.restore();}}};
A.coin=function(g,x,y,r,spin){var sx=Math.abs(Math.cos(spin||0))*.8+.2;g.save();g.translate(x,y);g.scale(sx,1);var gr=g.createRadialGradient(-r*.3,-r*.35,r*.1,0,0,r);gr.addColorStop(0,'#fff0b0');gr.addColorStop(.55,'#f4bf3a');gr.addColorStop(1,'#c98a12');
  g.fillStyle=gr;ell(g,0,0,r,r);g.fill();g.strokeStyle='rgba(150,95,10,.7)';g.lineWidth=Math.max(1,r*.12);ell(g,0,0,r*.72,r*.72);g.stroke();g.restore();};
A.leaves=function(S,n){if(S.calm)n=Math.ceil(n/2);for(var i=0;i<n;i++)S.fx.push(A.leaf(S,true));};
A.leaf=function(S,rand){var cols=['#e8a33a','#d9692a','#f2c14e','#b8541f','#c9a03a'];return {k:'leaf',x:Math.random()*S.W,y:rand?Math.random()*S.H*.8:-20,vx:-10+Math.random()*25,vy:22+Math.random()*30,rot:Math.random()*6,vr:-1+Math.random()*2,ph:Math.random()*6,life:(S.H+40)/30,t:rand?Math.random()*3:0,c:cols[Math.floor(Math.random()*cols.length)],r:5+Math.random()*4};};
A.leafTick=function(S){var n=0;for(var i=0;i<S.fx.length;i++)if(S.fx[i].k==='leaf')n++;if(n<(S.calm?4:low()?6:12)&&Math.random()<.04)S.fx.push(A.leaf(S,false));};

/* ---------- небо, свет ---------- */
A.sky=function(g,W,H,hz){var sg=g.createLinearGradient(0,0,0,hz);sg.addColorStop(0,'#7fb3d6');sg.addColorStop(.6,'#bcd9e6');sg.addColorStop(1,'#f3e2c0');g.fillStyle=sg;g.fillRect(0,0,W,hz+2);
  var sun=g.createRadialGradient(W*.82,hz*.35,4,W*.82,hz*.35,Math.max(W,H)*.45);sun.addColorStop(0,'rgba(255,240,200,.85)');sun.addColorStop(.2,'rgba(255,220,160,.35)');sun.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=sun;g.fillRect(0,0,W,hz+2);
  // облака
  var R=A.rng(77);for(var i=0;i<5;i++){var cx=R()*W,cy=hz*(.15+R()*.45),s=Math.min(W,H)*(.05+R()*.05);g.fillStyle='rgba(255,255,255,'+(.55+R()*.3)+')';
    for(var j=0;j<5;j++){ell(g,cx+(j-2)*s*.7,cy+(j%2?-.25:.1)*s,s*(.8+R()*.4),s*(.55+R()*.2));g.fill();}}};
A.forest=function(g,W,y,h,col,seed){var R=A.rng(seed||5);g.fillStyle=col;g.beginPath();g.moveTo(0,y+h);for(var x=0;x<=W+20;x+=8+R()*10){var th=h*(.4+R()*.6);if(R()<.55){g.lineTo(x,y+h-th*.3);g.lineTo(x+5,y+h-th);g.lineTo(x+10,y+h-th*.3);}else{g.quadraticCurveTo(x+6,y+h-th*1.1,x+12,y+h-th*.4);}}g.lineTo(W,y+h);g.closePath();g.fill();};
A.grass=function(g,W,y0,y1,c0,c1,seed){var gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(0,y0,W,y1-y0);
  var R=A.rng(seed||9);g.lineCap='round';for(var i=0;i<W*(y1-y0)/900;i++){var x=R()*W,y=y0+R()*(y1-y0),h=4+R()*9*(.5+(y-y0)/(y1-y0));g.strokeStyle='rgba('+(R()<.5?'40,80,20':'150,170,70')+','+(.25+R()*.3)+')';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*4,y-h);g.stroke();}};

/* ---------- двор Петровича ---------- */
A.yard=function(g,W,H,o){o=o||{};var wide=W>H*1.1,hz=H*(wide?.42:.34),fy=hz+H*(wide?.03:.02);
  A.sky(g,W,H,hz);
  A.forest(g,W,hz-H*.09,H*.1,'#7e9c8e',3);A.forest(g,W,hz-H*.05,H*.07,'#5f8270',8);
  // соседская крыша вдали
  var nx=W*(wide?.62:.58),ny=hz-H*.02;g.fillStyle='#a26a4a';g.beginPath();g.moveTo(nx-W*.08,ny);g.lineTo(nx,ny-H*.05);g.lineTo(nx+W*.08,ny);g.fill();g.fillStyle='#d8c7a6';g.fillRect(nx-W*.06,ny,W*.12,H*.03);
  // забор-штакетник
  var fh=H*(wide?.12:.1),ft=fy-fh;g.fillStyle='#6f5a44';g.fillRect(0,ft+fh*.25,W,fh*.09);g.fillRect(0,ft+fh*.7,W,fh*.09);
  var pw=Math.max(10,W*.022),R=A.rng(4);for(var x=-4;x<W+pw;x+=pw*1.45){var hh=fh*(.92+R()*.1);var gr=g.createLinearGradient(x,0,x+pw,0);gr.addColorStop(0,'#b59a74');gr.addColorStop(.5,'#cdb38b');gr.addColorStop(1,'#9c8160');g.fillStyle=gr;
    g.beginPath();g.moveTo(x,fy);g.lineTo(x,fy-hh+pw*.5);g.lineTo(x+pw/2,fy-hh);g.lineTo(x+pw,fy-hh+pw*.5);g.lineTo(x+pw,fy);g.fill();}
  g.fillStyle='rgba(30,40,20,.18)';g.fillRect(0,fy-3,W,6);
  A.grass(g,W,fy,H,'#8fae55','#5d7d36',11);
  // изба слева (сруб с окном и резным наличником)
  var hx=wide?W*.0:-W*.12,hw=wide?W*.24:W*.42,ht=hz-H*(wide?.2:.14),hb=fy+H*.06;
  for(var y=ht+H*.06;y<hb;y+=H*.034){var lg=g.createLinearGradient(0,y,0,y+H*.034);lg.addColorStop(0,'#a8754a');lg.addColorStop(.5,'#8a5a34');lg.addColorStop(1,'#6a4224');g.fillStyle=lg;rr(g,hx,y,hw,H*.034,H*.017);g.fill();
    g.fillStyle='#c79a68';ell(g,hx+hw,y+H*.017,H*.016,H*.016);g.fill();g.strokeStyle='rgba(90,55,25,.6)';g.lineWidth=1;ell(g,hx+hw,y+H*.017,H*.008,H*.008);g.stroke();}
  // крыша избы
  g.fillStyle='#5b6a72';g.beginPath();g.moveTo(hx-W*.04,ht+H*.07);g.lineTo(hx+hw*.45,ht-H*.04);g.lineTo(hx+hw+W*.05,ht+H*.07);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(hx+hw*.45,ht-H*.04);g.lineTo(hx+hw+W*.05,ht+H*.07);g.lineTo(hx+hw*.45+W*.02,ht+H*.07);g.closePath();g.fill();
  // окно
  var wx=hx+hw*.55,wy=ht+H*.11,ww=Math.min(hw*.32,H*.1),wh=ww*1.25;
  g.fillStyle='#f4efe4';rr(g,wx-ww*.18,wy-wh*.25,ww*1.36,wh*1.45,6);g.fill(); // наличник
  g.fillStyle='#4f8fb5';g.beginPath();g.moveTo(wx-ww*.18,wy-wh*.25);g.lineTo(wx+ww*.5,wy-wh*.55);g.lineTo(wx+ww*1.18,wy-wh*.25);g.fill();
  var wg=g.createLinearGradient(wx,wy,wx+ww,wy+wh);wg.addColorStop(0,'#bfe3f2');wg.addColorStop(1,'#3d6f8c');g.fillStyle=wg;g.fillRect(wx,wy,ww,wh);
  g.fillStyle='#f4efe4';g.fillRect(wx+ww*.46,wy,ww*.08,wh);g.fillRect(wx,wy+wh*.4,ww,wh*.07);
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(wx+ww*.1,wy+wh*.9);g.lineTo(wx+ww*.35,wy+wh*.1);g.lineTo(wx+ww*.42,wy+wh*.1);g.lineTo(wx+ww*.17,wy+wh*.9);g.fill();
  // герань на подоконнике
  g.fillStyle='#b5523a';rr(g,wx+ww*.15,wy+wh*.82,ww*.25,wh*.16,3);g.fill();g.fillStyle='#4e8a3a';ell(g,wx+ww*.27,wy+wh*.76,ww*.17,wh*.09);g.fill();g.fillStyle='#e8414f';ell(g,wx+ww*.24,wy+wh*.7,ww*.06,ww*.06);g.fill();ell(g,wx+ww*.33,wy+wh*.72,ww*.05,ww*.05);g.fill();
  // яблоня справа
  var tx=wide?W*.9:W*.93,tb=fy+H*.05;var tg=g.createLinearGradient(tx-W*.03,0,tx+W*.03,0);tg.addColorStop(0,'#5a4030');tg.addColorStop(1,'#3c2a1e');g.fillStyle=tg;
  g.beginPath();g.moveTo(tx-W*.025,tb);g.quadraticCurveTo(tx-W*.01,hz,tx-W*.05,hz-H*.12);g.lineTo(tx-W*.02,hz-H*.13);g.quadraticCurveTo(tx+W*.01,hz-H*.03,tx+W*.03,hz-H*.14);g.lineTo(tx+W*.05,hz-H*.13);g.quadraticCurveTo(tx+W*.02,hz,tx+W*.03,tb);g.fill();
  var cr=Math.min(W,H)*(wide?.17:.2),cx=tx,cy=hz-H*.16;var R2=A.rng(21);
  var cols=['#4f7a32','#5d8a3a','#6f9a44','#88a84a','#c9a03a'];
  for(var i=0;i<26;i++){var a=R2()*Math.PI*2,d=R2()*cr,bx=cx+Math.cos(a)*d*1.3,by=cy+Math.sin(a)*d*.75;g.fillStyle=cols[Math.floor(R2()*cols.length)];ell(g,bx,by,cr*(.3+R2()*.25),cr*(.25+R2()*.2));g.fill();}
  for(i=0;i<14;i++){var a2=R2()*Math.PI*2,d2=R2()*cr*.9,ax=cx+Math.cos(a2)*d2*1.2,ay=cy+Math.sin(a2)*d2*.7,ar=Math.max(3,cr*.06);var ag=g.createRadialGradient(ax-ar*.3,ay-ar*.3,1,ax,ay,ar);ag.addColorStop(0,'#ffd27a');ag.addColorStop(.5,'#e8472f');ag.addColorStop(1,'#a8281a');g.fillStyle=ag;ell(g,ax,ay,ar,ar);g.fill();}
  // солнечные лучи
  g.save();g.globalCompositeOperation='lighter';for(i=0;i<4;i++){var rx=W*(.15+i*.22);var lgx=g.createLinearGradient(0,0,0,H);lgx.addColorStop(0,'rgba(255,230,170,.10)');lgx.addColorStop(1,'rgba(255,230,170,0)');g.fillStyle=lgx;g.beginPath();g.moveTo(rx,0);g.lineTo(rx+W*.08,0);g.lineTo(rx-W*.12,H);g.lineTo(rx-W*.25,H);g.fill();}g.restore();
  return {hz:hz,fy:fy};};

/* стол во дворе: верх (x,y,w,h) — вид чуть сверху; ножки ниже */
A.table=function(g,x,y,w,h,o){o=o||{};var th=Math.max(10,h*.07);
  g.fillStyle='rgba(30,25,10,.28)';ell(g,x+w/2,y+h+th*3.5,w*.55,th*1.6);g.fill();
  g.fillStyle='#5a3b22';g.fillRect(x+w*.06,y+h,w*.05,th*4);g.fillRect(x+w*.89,y+h,w*.05,th*4);
  var tg=g.createLinearGradient(0,y,0,y+h);tg.addColorStop(0,'#b88654');tg.addColorStop(1,'#9a6a3c');g.fillStyle=tg;rr(g,x,y,w,h,th*.8);g.fill();
  // доски
  var n=Math.max(4,Math.round(h/34));g.strokeStyle='rgba(70,40,15,.35)';g.lineWidth=1.5;for(var i=1;i<n;i++){var yy=y+h*i/n;g.beginPath();g.moveTo(x+4,yy);g.lineTo(x+w-4,yy);g.stroke();}
  var R=A.rng(o.seed||31);g.strokeStyle='rgba(255,230,190,.12)';g.lineWidth=1;for(i=0;i<n*5;i++){var yy2=y+h*(Math.floor(R()*n)+.2+R()*.6)/n,xx=x+R()*w*.8;g.beginPath();g.moveTo(xx,yy2);g.bezierCurveTo(xx+w*.05,yy2-2,xx+w*.1,yy2+2,xx+w*.18,yy2);g.stroke();}
  g.fillStyle='#7a5030';rr(g,x,y+h-th*.2,w,th*1.2,th*.5);g.fill();g.fillStyle='rgba(255,220,170,.25)';g.fillRect(x+th,y+2,w-th*2,2);};

/* ---------- рынок ---------- */
A.market=function(g,W,H,o){var wide=W>H*1.1,hz=H*(wide?.4:.3);A.sky(g,W,H,hz);
  A.forest(g,W,hz-H*.06,H*.07,'#7e9c8e',13);
  // здание рынка с вывеской
  var bx=W*(wide?.3:.1),bw=W*(wide?.4:.8),bt=hz-H*.14;g.fillStyle='#d9cdb5';g.fillRect(bx,bt,bw,H*.16);g.fillStyle='#8a5040';g.beginPath();g.moveTo(bx-12,bt);g.lineTo(bx+bw/2,bt-H*.06);g.lineTo(bx+bw+12,bt);g.fill();
  var sw=Math.min(bw*.5,260),sh=Math.max(26,H*.04);g.fillStyle='#2f6f8f';rr(g,bx+bw/2-sw/2,bt+H*.015,sw,sh,6);g.fill();A.txt(g,Lx('РЫНОК','MARKET'),bx+bw/2,bt+H*.015+sh/2+1,Math.round(sh*.62),'#fff3d0');
  for(var i=0;i<5;i++){g.fillStyle='#6c8ea3';g.fillRect(bx+bw*(.08+i*.19),bt+H*.075,bw*.09,H*.07);}
  // ряд дальних палаток
  var cols=[['#d9483b','#f6efe2'],['#2f7fb6','#f6efe2'],['#e0a030','#fff6dc'],['#3f9a5a','#f6efe2']];
  var pw=W*(wide?.16:.3),py=hz-H*.01;for(i=0;i*pw*.9<W+pw;i++){var px=i*pw*.9-pw*.2,c=cols[i%4];
    g.fillStyle='#6b4a2e';g.fillRect(px+pw*.05,py,pw*.04,H*.07);g.fillRect(px+pw*.85,py,pw*.04,H*.07);
    for(var j=0;j<6;j++){g.fillStyle=c[j%2];g.beginPath();g.moveTo(px+pw*j/6,py);g.lineTo(px+pw*(j+1)/6,py);g.lineTo(px+pw*(j+1)/6,py+H*.02);g.quadraticCurveTo(px+pw*(j+.5)/6,py+H*.03,px+pw*j/6,py+H*.02);g.fill();}
    g.fillStyle='#8a6a48';g.fillRect(px,py+H*.05,pw,H*.025);}
  // флажки
  g.strokeStyle='rgba(60,40,20,.6)';g.lineWidth=1.5;g.beginPath();g.moveTo(0,hz-H*.12);g.quadraticCurveTo(W/2,hz-H*.06,W,hz-H*.12);g.stroke();
  var fc=['#e8472f','#ffcf4a','#2f9fd6','#5bbf5b'];for(i=0;i<16;i++){var t=(i+.5)/16,fx=W*t,fyy=(1-t)*(1-t)*(hz-H*.12)+2*(1-t)*t*(hz-H*.06)+t*t*(hz-H*.12);g.fillStyle=fc[i%4];g.beginPath();g.moveTo(fx-7,fyy);g.lineTo(fx+7,fyy);g.lineTo(fx,fyy+15);g.fill();}
  // мостовая
  var gy=hz+H*.06;var pg=g.createLinearGradient(0,gy,0,H);pg.addColorStop(0,'#9c8f7c');pg.addColorStop(1,'#6e6354');g.fillStyle=pg;g.fillRect(0,hz+H*.04,W,H);
  var R=A.rng(15);for(var y=gy;y<H;y+=16+(y-gy)*.06){var sh2=12+(y-gy)*.05;for(var x=-(R()*30);x<W;x+=sh2*2.2){g.fillStyle='rgba('+(R()<.5?'255,255,255,.06':'0,0,0,.08')+')';rr(g,x,y,sh2*2,sh2*.8,sh2*.3);g.fill();}}
  return {hz:hz};};
/* прилавок: доски + полосатый навес; навес сверху на высоте ay */
A.stall=function(g,W,H,cy,ay,c1,c2){var aw=W*1.04,ax=-W*.02;var post='#5b3d22';g.fillStyle=post;g.fillRect(W*.04,ay,Math.max(8,W*.02),cy-ay);g.fillRect(W*.94,ay,Math.max(8,W*.02),cy-ay);
  var n=Math.max(8,Math.round(W/70)),ah=Math.max(36,H*.06);for(var j=0;j<n;j++){g.fillStyle=j%2?c2:c1;g.beginPath();g.moveTo(ax+aw*j/n,ay);g.lineTo(ax+aw*(j+1)/n,ay);g.lineTo(ax+aw*(j+1)/n,ay+ah);g.quadraticCurveTo(ax+aw*(j+.5)/n,ay+ah*1.35,ax+aw*j/n,ay+ah);g.fill();}
  g.fillStyle='rgba(0,0,0,.12)';g.fillRect(ax,ay,aw,ah*.18);
  var sg=g.createLinearGradient(0,ay+ah,0,ay+ah*2);sg.addColorStop(0,'rgba(0,0,0,.2)');sg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sg;g.fillRect(0,ay+ah,W,ah);};
A.counter=function(g,W,H,cy){var ch=H-cy;var tg=g.createLinearGradient(0,cy,0,cy+ch*.18);tg.addColorStop(0,'#c49563');tg.addColorStop(1,'#a2744a');g.fillStyle=tg;g.fillRect(0,cy,W,ch*.18);
  g.fillStyle='#7a5132';g.fillRect(0,cy+ch*.18,W,ch);var R=A.rng(3);g.strokeStyle='rgba(40,20,5,.35)';g.lineWidth=2;for(var x=0;x<W;x+=Math.max(40,W/12)){g.beginPath();g.moveTo(x,cy+ch*.18);g.lineTo(x,H);g.stroke();}
  g.strokeStyle='rgba(255,230,190,.15)';g.lineWidth=1;for(var i=0;i<20;i++){var xx=R()*W,yy=cy+ch*(.25+R()*.7);g.beginPath();g.moveTo(xx,yy);g.lineTo(xx,yy+ch*.1);g.stroke();}
  g.fillStyle='rgba(255,230,190,.25)';g.fillRect(0,cy,W,2);};
/* ящик с яблоками/капустой */
A.crate=function(g,x,y,w,h,kind){g.fillStyle='rgba(0,0,0,.2)';ell(g,x+w/2,y+h,w*.55,h*.1);g.fill();
  var R=A.rng(kind==='a'?5:kind==='c'?7:9);var cc=kind==='a'?['#e8472f','#c9302a','#f0a030']:kind==='c'?['#9ccf6a','#7fb24e']:['#f0a030','#e08a20'];
  for(var i=0;i<9;i++){var ax=x+w*(.12+R()*.76),ay=y+h*(.1+R()*.15),r=w*(kind==='c'?.16:.11);var ag=g.createRadialGradient(ax-r*.3,ay-r*.3,1,ax,ay,r);ag.addColorStop(0,'#fff3c0');ag.addColorStop(.4,cc[i%cc.length]);ag.addColorStop(1,shade(cc[i%cc.length],-.35));g.fillStyle=ag;ell(g,ax,ay,r,r);g.fill();}
  g.fillStyle='#b58650';g.fillRect(x,y+h*.25,w,h*.75);g.fillStyle='#9a6c3a';for(var k=0;k<3;k++)g.fillRect(x,y+h*(.32+k*.24),w,h*.05);g.fillStyle='#7a5030';g.fillRect(x,y+h*.25,w*.06,h*.75);g.fillRect(x+w*.94,y+h*.25,w*.06,h*.75);};
/* весы-безмен «чашечные» */
A.scales=function(g,x,y,s,tilt){g.fillStyle='#3d4a52';rr(g,x-s*.45,y-s*.12,s*.9,s*.12,s*.04);g.fill();g.fillStyle='#56656e';g.fillRect(x-s*.04,y-s*.5,s*.08,s*.4);
  g.save();g.translate(x,y-s*.5);g.rotate(tilt||0);g.fillStyle='#56656e';g.fillRect(-s*.45,-s*.025,s*.9,s*.05);
  [-1,1].forEach(function(d){var gx=d*s*.42;g.strokeStyle='#8a969c';g.lineWidth=1.5;g.beginPath();g.moveTo(gx,0);g.lineTo(gx-s*.12,s*.22);g.moveTo(gx,0);g.lineTo(gx+s*.12,s*.22);g.stroke();var pg=g.createLinearGradient(gx-s*.16,0,gx+s*.16,0);pg.addColorStop(0,'#c8a24a');pg.addColorStop(.5,'#f0d27a');pg.addColorStop(1,'#a8822a');g.fillStyle=pg;g.beginPath();g.ellipse(gx,s*.22,s*.17,s*.05,0,0,Math.PI);g.fill();});
  g.restore();g.fillStyle='#2a3238';ell(g,x,y-s*.5,s*.05,s*.05);g.fill();};
/* ведро с рыбой: fish — массив id FISH */
A.bucket=function(g,x,y,s,fish,t){var bw=s,bh=s*.85;g.fillStyle='rgba(0,0,0,.22)';ell(g,x,y+2,bw*.62,bh*.12);g.fill();
  var bg=g.createLinearGradient(x-bw/2,0,x+bw/2,0);bg.addColorStop(0,'#8d969c');bg.addColorStop(.45,'#dfe5e8');bg.addColorStop(1,'#717a80');g.fillStyle=bg;
  // рыбы торчат
  var R=A.rng(fish.length*7+3);for(var i=0;i<fish.length;i++){var f=null;try{f=FISH[fish[i]];}catch(e){}if(!f)continue;g.save();var a=-1.2+i*2.4/Math.max(1,fish.length-1)+(R()-.5)*.3;g.translate(x+(i-(fish.length-1)/2)*bw*.16,y-bh+bw*.05);g.rotate(a-Math.PI/2+Math.sin((t||0)*2+i)*.04);try{drawFish(g,f.lk,bw*.18,0,bw*.62);}catch(e){}g.restore();}
  g.fillStyle=bg;g.beginPath();g.moveTo(x-bw*.5,y-bh);g.lineTo(x+bw*.5,y-bh);g.lineTo(x+bw*.4,y);g.lineTo(x-bw*.4,y);g.closePath();g.fill();
  g.strokeStyle='rgba(60,70,75,.5)';g.lineWidth=2;g.beginPath();g.moveTo(x-bw*.47,y-bh*.6);g.lineTo(x+bw*.47,y-bh*.6);g.moveTo(x-bw*.43,y-bh*.2);g.lineTo(x+bw*.43,y-bh*.2);g.stroke();
  g.strokeStyle='#a9b1b6';g.lineWidth=Math.max(2,s*.04);ell(g,x,y-bh,bw*.5,bh*.08);g.stroke();
  g.strokeStyle='#6d777c';g.lineWidth=Math.max(2,s*.03);g.beginPath();g.arc(x,y-bh,bw*.52,Math.PI*1.08,Math.PI*1.92,false);g.stroke();};

/* ---------- мостки (для «бороды»): вид сверху ---------- */
A.pier=function(g,W,H,o){o=o||{};var wy=H*(o.water||.16);
  var wg=g.createLinearGradient(0,0,0,wy);wg.addColorStop(0,'#3f7f8f');wg.addColorStop(1,'#2a5f70');g.fillStyle=wg;g.fillRect(0,0,W,wy+4);
  var R=A.rng(41);g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;g.lineCap='round';for(var i=0;i<26;i++){var x=R()*W,y=R()*wy;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+10,y-3,x+22+R()*20,y);g.stroke();}
  // кувшинки
  for(i=0;i<4;i++){var lx=W*(.1+R()*.8),ly=wy*(.25+R()*.5),lr=Math.min(W,H)*.03;g.fillStyle='#4f8a3a';g.beginPath();g.arc(lx,ly,lr,.3,Math.PI*2-.1);g.lineTo(lx,ly);g.fill();if(R()<.5){g.fillStyle='#f4f0e6';ell(g,lx+lr*.3,ly-lr*.2,lr*.35,lr*.25);g.fill();g.fillStyle='#ffd24a';ell(g,lx+lr*.3,ly-lr*.25,lr*.1,lr*.1);g.fill();}}
  // доски
  var bw=Math.max(54,Math.min(W,H)*.12),n=Math.ceil(W/bw)+1;
  for(i=0;i<n;i++){var x0=i*bw-bw*.1,R3=A.rng(i*13+5),base=['#b98c5a','#ad7f4f','#c39662','#a87a4a'][i%4];var pg=g.createLinearGradient(x0,0,x0+bw,0);pg.addColorStop(0,shade(base,-.12));pg.addColorStop(.5,base);pg.addColorStop(1,shade(base,-.2));g.fillStyle=pg;g.fillRect(x0+2,wy,bw-4,H-wy);
    g.strokeStyle='rgba(90,55,25,.28)';g.lineWidth=1.2;for(var k=0;k<5;k++){var gx=x0+bw*(.15+R3()*.7);g.beginPath();g.moveTo(gx,wy);for(var yy=wy;yy<H;yy+=40)g.lineTo(gx+Math.sin(yy*.02+k)*3,yy);g.stroke();}
    if(R3()<.7){var kx=x0+bw*(.3+R3()*.4),ky=wy+(H-wy)*(.2+R3()*.6);g.strokeStyle='rgba(90,55,25,.35)';ell(g,kx,ky,bw*.08,bw*.14);g.stroke();ell(g,kx,ky,bw*.04,bw*.07);g.stroke();}
    g.fillStyle='#3a3530';[.12,.88].forEach(function(f){ell(g,x0+bw*.5,wy+(H-wy)*f,2.5,2.5);g.fill();});
    g.fillStyle='rgba(20,15,10,.55)';g.fillRect(x0-2,wy,4,H-wy);}
  var sh=g.createLinearGradient(0,wy,0,wy+18);sh.addColorStop(0,'rgba(0,0,0,.35)');sh.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sh;g.fillRect(0,wy,W,18);
  g.fillStyle='#8a6038';g.fillRect(0,wy-6,W,8);
  // свет
  var lg=g.createRadialGradient(W*.5,H*.55,10,W*.5,H*.55,Math.max(W,H)*.7);lg.addColorStop(0,'rgba(255,230,180,.12)');lg.addColorStop(1,'rgba(30,20,10,.28)');g.fillStyle=lg;g.fillRect(0,0,W,H);
  return {wy:wy};};
/* ящик для снастей (вид сверху) */
A.tackleBox=function(g,x,y,w,h){g.fillStyle='rgba(0,0,0,.3)';rr(g,x+5,y+7,w,h,10);g.fill();var bg=g.createLinearGradient(x,y,x,y+h);bg.addColorStop(0,'#3a9a7f');bg.addColorStop(1,'#2a7560');g.fillStyle=bg;rr(g,x,y,w,h,10);g.fill();
  g.fillStyle='#257060';for(var i=0;i<3;i++){for(var j=0;j<2;j++){g.fillStyle='#1e5e50';rr(g,x+w*(.06+i*.31),y+h*(.08+j*.46),w*.27,h*.4,5);g.fill();}}
  var it=[['#e03131','f'],['#ffcf4a','b'],['#c0c8cc','h'],['#f2f2f2','f'],['#ff8f4f','b'],['#7a8a90','s']];for(i=0;i<6;i++){var cx=x+w*(.195+(i%3)*.31),cy=y+h*(.28+Math.floor(i/3)*.46),c=it[i];g.fillStyle=c[0];
    if(c[1]==='f'){ell(g,cx,cy,w*.03,h*.13);g.fill();g.fillStyle='#fff';g.fillRect(cx-w*.03,cy-1,w*.06,2);}else if(c[1]==='b'){for(var k=0;k<4;k++){ell(g,cx-w*.06+k*w*.04,cy+(k%2)*4,w*.018,w*.018);g.fill();}}else{g.strokeStyle=c[0];g.lineWidth=2;g.beginPath();g.arc(cx,cy,w*.03,0,Math.PI);g.moveTo(cx+w*.03,cy);g.lineTo(cx+w*.03,cy-h*.12);g.stroke();}}};

/* ---------- персонажи ---------- */
/* лицо: общий рисунок глаз/рта по настроению; m: smile|sly|laugh|sad|wow|think|talk */
function face(g,x,y,s,m,t,o){var blink=(Math.sin(t*1.3+o.ph)>.985)||m==='laugh';var ey=y,ex=s*.065;
  // брови
  g.strokeStyle=o.brow;g.lineWidth=s*.028;g.lineCap='round';var bA=m==='sad'?.25:m==='sly'?-.12:m==='wow'?-.05:m==='think'?.12:0,bY=(m==='wow'?-s*.075:-s*.055)-(o.talk?Math.abs(Math.sin(t*5))*s*.012:0);
  [-1,1].forEach(function(d){var bx=x+d*ex;g.beginPath();g.moveTo(bx-s*.04,ey+bY+d*bA*s*.1*(m==='sly'&&d<0?-1:1));g.lineTo(bx+s*.04,ey+bY-d*bA*s*.1*(m==='sly'&&d<0?-1:1));g.stroke();});
  // глаза
  [-1,1].forEach(function(d){var bx=x+d*ex+(o.lx||0)*s*.012;if(blink){g.strokeStyle='#2a211b';g.lineWidth=s*.016;g.beginPath();g.arc(bx,ey-(m==='laugh'?s*.005:0),s*.022,m==='laugh'?Math.PI*1.1:.2,m==='laugh'?Math.PI*1.9:Math.PI-.2,false);g.stroke();}
    else{g.fillStyle='#fff';ell(g,bx,ey,s*.026,s*(m==='wow'?.032:.024));g.fill();g.fillStyle='#2a211b';ell(g,bx+(o.lx||0)*s*.008,ey+s*.003,s*.016,s*.018);g.fill();g.fillStyle='#fff';ell(g,bx+s*.006,ey-s*.006,s*.005,s*.005);g.fill();
      if(m==='sly'&&d>0){g.fillStyle=o.skin;g.fillRect(bx-s*.03,ey-s*.03,s*.06,s*.022);}}});}
function mouth(g,x,y,s,m,t,talk){var op=talk?Math.abs(Math.sin(t*14))*.6+.2:0;g.fillStyle='#6b2b22';g.strokeStyle='#7a3a2a';g.lineWidth=s*.018;g.lineCap='round';
  if(m==='laugh'||m==='wow'||op>.25){var h=m==='laugh'?s*.05:m==='wow'?s*.04:s*.045*op;ell(g,x,y+h*.3,m==='wow'?s*.03:s*.05,Math.max(s*.012,h));g.fill();if(m==='laugh'){g.fillStyle='#f5f0e6';g.fillRect(x-s*.035,y-h*.5,s*.07,s*.014);}}
  else if(m==='sad'){g.beginPath();g.arc(x,y+s*.04,s*.04,Math.PI*1.2,Math.PI*1.8);g.stroke();}
  else if(m==='think'){g.beginPath();g.moveTo(x-s*.03,y+s*.008);g.lineTo(x+s*.03,y-s*.004);g.stroke();}
  else{g.beginPath();g.arc(x+(m==='sly'?s*.01:0),y-s*.02,s*.045,Math.PI*.2,Math.PI*.8);g.stroke();}}
/* рука: от плеча (sx,sy) к кисти (hx,hy), рукав цвета c */
function arm(g,sx,sy,hx,hy,s,c,skin,mit){var mx=(sx+hx)/2+(hx>sx?-1:1)*s*.11,my=(sy+hy)/2+s*.09;g.strokeStyle=c;g.lineWidth=s*.13;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(mx,my,hx,hy);g.stroke();
  g.strokeStyle='rgba(0,0,0,.12)';g.lineWidth=s*.04;g.beginPath();g.moveTo(sx+s*.03,sy+s*.03);g.quadraticCurveTo(mx+s*.03,my+s*.03,hx+s*.02,hy);g.stroke();
  g.fillStyle=skin;ell(g,hx,hy,s*.055,s*.05);g.fill();if(mit){g.fillStyle=shade(skin,-.15);ell(g,hx+s*.035*(hx>sx?1:-1),hy-s*.02,s*.022,s*.03,.4);g.fill();}}
/* общий «бюст за столом»: (x,y) — середина пояса (край стола), s — рост от пояса до макушки */
function bust(g,x,y,s,t,o){var m=o.mood||'smile',br=Math.sin(t*1.6)*s*.006,talk=!!o.talk,nod=talk?Math.sin(t*7)*s*.006:0;
  var ph=o.ph||0,sway=Math.sin(t*.55+ph)*s*.012+(talk?Math.sin(t*2.3+ph)*s*.01:0);if(m==='laugh')br+=Math.sin(t*24)*s*.007;
  var by=y+br,sh=by-s*.5,hx=x+(o.tilt||0)*s*.05+sway,hy=by-s*.72+nod;
  var hang=Math.sin(t*.6+ph)*.035+(talk?Math.sin(t*4.2+ph)*.04:0)+(m==='think'?.12:m==='sad'?-.08:m==='wow'?-.05:0)+(m==='laugh'?Math.sin(t*12)*.05:0);
  if(!o.armsOnly){
  // тень на столе/фоне
  g.fillStyle='rgba(0,0,0,.14)';ell(g,x+s*.05,y+s*.01,s*.42,s*.05);g.fill();
  // корпус
  var tg=g.createLinearGradient(x-s*.35,0,x+s*.35,0);tg.addColorStop(0,shade(o.coat,.12));tg.addColorStop(.6,o.coat);tg.addColorStop(1,shade(o.coat,-.25));g.fillStyle=tg;
  g.beginPath();g.moveTo(x-s*.31,by+s*.05);g.quadraticCurveTo(x-s*.35,sh+s*.2,x-s*.31,sh+s*.07);g.quadraticCurveTo(x-s*.27,sh-s*.02,x-s*.14,sh-s*.04);g.lineTo(x+s*.14,sh-s*.04);g.quadraticCurveTo(x+s*.27,sh-s*.02,x+s*.31,sh+s*.07);g.quadraticCurveTo(x+s*.35,sh+s*.2,x+s*.31,by+s*.05);g.closePath();g.fill();
  if(o.quilt){g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=Math.max(1,s*.008);for(var k=1;k<5;k++){var yy=sh+s*.04+k*s*.1;g.beginPath();g.moveTo(x-s*.33,yy);g.quadraticCurveTo(x,yy+s*.015,x+s*.33,yy);g.stroke();}}
  if(o.apron){g.fillStyle=o.apron;g.beginPath();g.moveTo(x-s*.2,by+s*.05);g.lineTo(x-s*.18,sh+s*.15);g.lineTo(x+s*.18,sh+s*.15);g.lineTo(x+s*.2,by+s*.05);g.fill();g.strokeStyle='rgba(0,0,0,.1)';g.lineWidth=1;g.strokeRect(x-s*.1,sh+s*.3,s*.2,s*.1);}
  // ворот/рубашка
  if(o.vest==='tel'){g.save();g.beginPath();g.moveTo(x-s*.1,sh-s*.02);g.lineTo(x,sh+s*.14);g.lineTo(x+s*.1,sh-s*.02);g.closePath();g.clip();g.fillStyle='#f4f4f0';g.fillRect(x-s*.12,sh-s*.04,s*.24,s*.2);g.fillStyle='#2a4f8a';for(var j=0;j<5;j++)g.fillRect(x-s*.12,sh+j*s*.035,s*.24,s*.016);g.restore();}
  else{g.fillStyle=o.vest||'#c9b48a';g.beginPath();g.moveTo(x-s*.1,sh-s*.02);g.lineTo(x,sh+s*.12);g.lineTo(x+s*.1,sh-s*.02);g.closePath();g.fill();}
  g.fillStyle=shade(o.coat,-.12);g.beginPath();g.moveTo(x-s*.2,sh-s*.04);g.lineTo(x-s*.03,sh+s*.16);g.lineTo(x-s*.12,sh+s*.03);g.closePath();g.fill();g.beginPath();g.moveTo(x+s*.2,sh-s*.04);g.lineTo(x+s*.03,sh+s*.16);g.lineTo(x+s*.12,sh+s*.03);g.closePath();g.fill();
  if(o.buttons){g.fillStyle=shade(o.coat,-.35);for(var b=0;b<3;b++){ell(g,x+s*.01,sh+s*.2+b*s*.1,s*.012,s*.012);g.fill();}}
  // шея, уши, голова (голова качается: покой, разговор, настроение)
  g.save();g.translate(hx,hy+s*.16);g.rotate(hang);g.translate(-hx,-(hy+s*.16));
  g.fillStyle=shade(o.skin,-.12);g.fillRect(hx-s*.05,hy+s*.1,s*.1,s*.08);
  g.fillStyle=o.skin;ell(g,hx-s*.155,hy+s*.01,s*.035,s*.045);g.fill();ell(g,hx+s*.155,hy+s*.01,s*.035,s*.045);g.fill();
  var hg=g.createRadialGradient(hx-s*.05,hy-s*.05,s*.02,hx,hy,s*.2);hg.addColorStop(0,shade(o.skin,.12));hg.addColorStop(1,shade(o.skin,-.1));g.fillStyle=hg;ell(g,hx,hy,s*.155,s*.175);g.fill();
  if(o.blush){g.fillStyle='rgba(230,90,80,'+o.blush+')';ell(g,hx-s*.09,hy+s*.04,s*.04,s*.025);g.fill();ell(g,hx+s*.09,hy+s*.04,s*.04,s*.025);g.fill();}
  // волосы сбоку
  if(o.hair){g.fillStyle=o.hair;ell(g,hx-s*.14,hy-s*.03,s*.035,s*.07);g.fill();ell(g,hx+s*.14,hy-s*.03,s*.035,s*.07);g.fill();}
  face(g,hx,hy-s*.01,s,m,t,o);
  // нос
  g.fillStyle=shade(o.skin,-.06);ell(g,hx+s*.005,hy+s*.045,s*.042,s*.036);g.fill();g.fillStyle='rgba(255,255,255,.3)';ell(g,hx-s*.008,hy+s*.035,s*.012,s*.01);g.fill();
  // усы
  if(o.mous){g.fillStyle=o.mous;g.beginPath();g.moveTo(hx,hy+s*.07);g.quadraticCurveTo(hx-s*.06,hy+s*.06,hx-s*.1,hy+s*.1);g.quadraticCurveTo(hx-s*.05,hy+s*.095,hx,hy+s*.085);g.quadraticCurveTo(hx+s*.05,hy+s*.095,hx+s*.1,hy+s*.1);g.quadraticCurveTo(hx+s*.06,hy+s*.06,hx,hy+s*.07);g.fill();}
  mouth(g,hx,hy+s*.115,s,m,t,talk);
  // кепка / платок
  if(o.cap){var cg=g.createLinearGradient(0,hy-s*.2,0,hy-s*.05);cg.addColorStop(0,shade(o.cap,.1));cg.addColorStop(1,shade(o.cap,-.15));g.fillStyle=cg;g.beginPath();g.ellipse(hx,hy-s*.085,s*(o.flat?.2:.17),s*(o.flat?.1:.11),0,Math.PI,0);g.fill();
    if(o.check){g.save();g.beginPath();g.ellipse(hx,hy-s*.085,s*.2,s*.1,0,Math.PI,0);g.clip();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1;for(var cx2=-5;cx2<6;cx2++){g.beginPath();g.moveTo(hx+cx2*s*.04,hy-s*.2);g.lineTo(hx+cx2*s*.04,hy);g.stroke();}for(var cy2=0;cy2<4;cy2++){g.beginPath();g.moveTo(hx-s*.2,hy-s*.1-cy2*s*.03);g.lineTo(hx+s*.2,hy-s*.1-cy2*s*.03);g.stroke();}g.restore();}
    g.fillStyle=shade(o.cap,-.3);g.beginPath();g.ellipse(hx+s*.01,hy-s*.08,s*.19,s*.035,0,0,Math.PI);g.fill();g.fillStyle=shade(o.cap,-.1);ell(g,hx,hy-s*.19,s*.02,s*.012);g.fill();}
  if(o.scarf){g.fillStyle=o.scarf;g.beginPath();g.moveTo(hx-s*.19,hy+s*.06);g.quadraticCurveTo(hx-s*.2,hy-s*.24,hx,hy-s*.22);g.quadraticCurveTo(hx+s*.2,hy-s*.24,hx+s*.19,hy+s*.06);g.quadraticCurveTo(hx+s*.16,hy-s*.12,hx,hy-s*.13);g.quadraticCurveTo(hx-s*.16,hy-s*.12,hx-s*.19,hy+s*.06);g.fill();
    g.fillStyle='rgba(255,255,255,.55)';for(var d=0;d<7;d++){ell(g,hx-s*.14+d*s*.047,hy-s*.16+Math.abs(d-3)*s*.012,s*.01,s*.01);g.fill();}}
  g.restore();
  }
  if(o.noArms)return {hx:hx,hy:hy,top:hy-s*.22};
  // руки по позе
  var pose=o.pose||'rest',L0={x:x-s*.27,y:sh+s*.08},R0={x:x+s*.27,y:sh+s*.08},a=o.armK||0;
  var lh={x:x-s*.2,y:y+s*.04},rh={x:x+s*.21,y:y+s*.035};
  if(pose==='point'){rh={x:x+s*.42,y:sh-s*.12-Math.sin(t*5)*s*.02};}
  else if(pose==='shake'){rh={x:x+s*.18+a*s*.06,y:y+s*.18+a*s*.1};}
  else if(pose==='think'){rh={x:hx+s*.12,y:hy+s*.13};}
  else if(pose==='wave'){rh={x:x+s*.45+Math.sin(t*8)*s*.05,y:sh-s*.25};}
  else if(pose==='scratch'){rh={x:hx+s*.13,y:hy-s*.15+Math.sin(t*12)*s*.01};}
  else if(pose==='cross'){lh={x:x+s*.12,y:y-s*.05};rh={x:x-s*.12,y:y-s*.04};}
  else if(pose==='hold'){lh={x:x-s*.2,y:y-s*.04};rh={x:x+s*.2,y:y-s*.04};}
  else if(pose==='rest'&&talk){var gk=Math.abs(Math.sin(t*3.6+ph));rh={x:x+s*.33+gk*s*.05,y:sh+s*.32-gk*s*.17};lh.y-=Math.abs(Math.sin(t*3.6+ph+1.3))*s*.04;}
  else if(pose==='rest'&&Math.sin(t*.45+ph)>.75){rh.y+=Math.sin(t*14)*s*.008-s*.01;} // барабанит пальцами
  if(o.lhand)lh=o.lhand;if(o.rhand)rh=o.rhand;
  arm(g,L0.x,L0.y,lh.x,lh.y,s,shade(o.coat,-.05),o.skin,true);arm(g,R0.x,R0.y,rh.x,rh.y,s,shade(o.coat,-.12),o.skin,true);
  if(pose==='point'){g.strokeStyle=o.skin;g.lineWidth=s*.022;g.lineCap='round';g.beginPath();g.moveTo(rh.x,rh.y);g.lineTo(rh.x+s*.02,rh.y-s*.07);g.stroke();}
  return {hx:hx,hy:hy,top:hy-s*.22,rh:rh,lh:lh};}
A.petr=function(g,x,y,s,t,o){o=o||{};return bust(g,x,y,s,t,{noArms:o.noArms,armsOnly:o.armsOnly,mood:o.mood,talk:o.talk,pose:o.pose,armK:o.armK,tilt:o.tilt,lx:o.lx,rhand:o.rhand,lhand:o.lhand,coat:'#46566a',quilt:true,vest:'tel',skin:'#e3b48e',mous:'#b9b4ac',brow:'#8a8580',hair:'#a9a49c',cap:'#4a3f33',blush:.18,ph:0});};
A.zhora=function(g,x,y,s,t,o){o=o||{};return bust(g,x,y,s,t,{noArms:o.noArms,armsOnly:o.armsOnly,mood:o.mood,talk:o.talk,pose:o.pose,armK:o.armK,tilt:o.tilt,lx:o.lx,rhand:o.rhand,lhand:o.lhand,coat:'#7a4a2e',vest:'#d9d2c0',apron:'#eef0ea',buttons:true,skin:'#f0bf98',mous:'#3a2a20',brow:'#3a2a20',hair:'#3a2a20',cap:'#7d7f6a',flat:true,check:true,blush:o.red!=null?o.red:.22,ph:2});};
A.valya=function(g,x,y,s,t,o){o=o||{};return bust(g,x,y,s,t,{noArms:o.noArms,armsOnly:o.armsOnly,mood:o.mood,talk:o.talk,pose:o.pose,armK:o.armK,coat:'#8a3a52',vest:'#f2e6d0',skin:'#f2c4a0',brow:'#6a4a3a',scarf:'#3a6ab0',blush:.3,ph:4});};
/* кот Васька (сидит, мордой к нам); s — высота */
A.cat=function(g,x,y,s,t,o){o=o||{};var tail=Math.sin(t*2.2)*.5,bl=Math.sin(t*1.1+1)>.97||o.sleep;
  g.fillStyle='rgba(0,0,0,.18)';ell(g,x,y,s*.38,s*.07);g.fill();
  g.strokeStyle='#6d6f72';g.lineWidth=s*.09;g.lineCap='round';g.beginPath();g.moveTo(x+s*.18,y-s*.05);g.quadraticCurveTo(x+s*.45,y-s*.05+tail*s*.1,x+s*.38+tail*s*.12,y-s*.38);g.stroke();
  var bg=g.createRadialGradient(x-s*.08,y-s*.4,s*.05,x,y-s*.3,s*.4);bg.addColorStop(0,'#a3a5a8');bg.addColorStop(1,'#6d6f72');g.fillStyle=bg;
  g.beginPath();g.moveTo(x-s*.22,y);g.quadraticCurveTo(x-s*.26,y-s*.45,x,y-s*.55);g.quadraticCurveTo(x+s*.26,y-s*.45,x+s*.22,y);g.closePath();g.fill();
  g.fillStyle='#e8e2d8';ell(g,x,y-s*.2,s*.1,s*.18);g.fill();
  g.strokeStyle='rgba(60,60,62,.6)';g.lineWidth=s*.025;for(var i=0;i<3;i++){g.beginPath();g.arc(x,y-s*.3-i*s*.08,s*.2,Math.PI*1.15,Math.PI*1.35);g.stroke();g.beginPath();g.arc(x,y-s*.3-i*s*.08,s*.2,Math.PI*1.65,Math.PI*1.85);g.stroke();}
  var hy=y-s*.62;g.fillStyle='#8f9194';ell(g,x,hy,s*.2,s*.17);g.fill();
  [-1,1].forEach(function(d){g.fillStyle='#8f9194';g.beginPath();g.moveTo(x+d*s*.17,hy-s*.05);g.lineTo(x+d*s*.16,hy-s*.27);g.lineTo(x+d*s*.04,hy-s*.13);g.fill();g.fillStyle='#e8a8a0';g.beginPath();g.moveTo(x+d*s*.15,hy-s*.08);g.lineTo(x+d*s*.145,hy-s*.21);g.lineTo(x+d*s*.07,hy-s*.13);g.fill();});
  g.strokeStyle='#5a5c5f';g.lineWidth=s*.02;for(i=-1;i<=1;i++){g.beginPath();g.moveTo(x+i*s*.04,hy-s*.16);g.lineTo(x+i*s*.035,hy-s*.1);g.stroke();}
  [-1,1].forEach(function(d){if(bl){g.strokeStyle='#2a2a2a';g.lineWidth=s*.02;g.beginPath();g.arc(x+d*s*.075,hy-s*.01,s*.03,.2,Math.PI-.2);g.stroke();}else{g.fillStyle='#b8d65a';ell(g,x+d*s*.075,hy-s*.01,s*.038,s*.036);g.fill();g.fillStyle='#1a1a1a';ell(g,x+d*s*.075+(o.lx||0)*s*.01,hy-s*.01,s*.012,s*.03);g.fill();}});
  g.fillStyle='#e88a8a';g.beginPath();g.moveTo(x-s*.025,hy+s*.05);g.lineTo(x+s*.025,hy+s*.05);g.lineTo(x,hy+s*.08);g.fill();
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;[-1,1].forEach(function(d){for(var k=0;k<3;k++){g.beginPath();g.moveTo(x+d*s*.06,hy+s*.08);g.lineTo(x+d*s*.26,hy+s*.04+k*s*.04);g.stroke();}});
  g.fillStyle='#e8e2d8';ell(g,x-s*.08,y-s*.02,s*.07,s*.04);g.fill();ell(g,x+s*.08,y-s*.02,s*.07,s*.04);g.fill();};

/* «бумажка-ценник» на холсте */
A.tag=function(g,x,y,w,h,s,rot,col){g.save();g.translate(x,y);g.rotate(rot||0);g.fillStyle='rgba(0,0,0,.25)';rr(g,-w/2+3,-h/2+5,w,h,8);g.fill();g.fillStyle=col||'#fff6dc';rr(g,-w/2,-h/2,w,h,8);g.fill();g.strokeStyle='rgba(120,90,40,.4)';g.lineWidth=1.5;rr(g,-w/2+5,-h/2+5,w-10,h-10,5);g.stroke();
  g.fillStyle='#8a6a40';ell(g,0,-h/2+9,3,3);g.fill();var px=Math.round(h*.46);
  if(typeof s==='number'){g.font='700 '+px+'px LkGolos,sans-serif';var tw=g.measureText(String(s)).width,cr=px*.42,tot=tw+cr*2+6;A.txt(g,String(s),-tot/2+tw/2,4,px,'#3a2a14','center',null,700);A.coin(g,tot/2-cr,3,cr,0);}
  else A.txt(g,s,0,3,px,'#3a2a14','center',null,700);g.restore();};
window.MGDA=A;
})();
