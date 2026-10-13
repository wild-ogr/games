'use strict';
/* ob2:IZBA · набор для ловкостных мини-игр «Удали» (js/ob2-izba-lk.js → window.ZLK). Перенос ZLK Зины (slovo-zb2-lov js/zmg-lkit.js) на избу Обороны: те же имена и поведение.
   Грузится ЛЕНИВО перед первой ловкостной (IZU.play). Договор — шапка js/ob2-izba-ui.js. Классы — zl-.
   ZLK.frame(host,{who,nm}) → {el, top, main, foot, say(text, mood, who?, nm?), info(html)} — «ведущий сверху · поле · кнопки снизу» внутри host.el.
   ZLK.canvas(box) → {cv, ctx, w, h, dpr, fit()} · ZLK.loop(host, fn(dt,t)) · ZLK.keys(host, fn(key,e,down)) (с отпусканием) · ZLK.dir(key) → 'L'|'R'|'U'|'D'|null
   ZLK.tap(host, el, fn(x,y)) — касание + Пробел/Enter/↑ · ZLK.cont(host, box, {text, onYes, onNo}) — «Продолжить с того же места за рекламу?» раз за партию (ролика нет — сразу onNo)
   ZLK.pop(host, box, text, cls) · ZLK.calm(host) · ZLK.btn(html,cls,fn) · ZLK.rr(ctx,x,y,w,h,r) · ZLK.kc(t,host) · ZLK.buzz(ms) · ZLK.pick(arr,rnd) · ZLK.tier(sc,[c1,c2,c3]) · ZLK.snd(host,k)
   НОВОЕ (понятность, урок Скакалки): ZLK.hand(ctx,x,y,press,px) — нарисованный палец 👆 (press — «нажал»: палец ниже и круг касания);
     ZLK.demo(host, box, {text, sec}) → Promise — плашка «Смотри, как надо» на sec секунд (игра сама играет ботом), кнопка «Понятно!» — пропустить. Показ — при o.first. */
(function(){if(window.ZLK)return;
var W=window;
function css(){if(document.getElementById('zl-kit'))return;var s=document.createElement('style');s.id='zl-kit';s.textContent=[
 '.zl-fr{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none}',
 '.zl-top{display:flex;align-items:flex-end;gap:8px;padding:6px 10px 4px;flex:none;max-width:760px;width:100%;box-sizing:border-box;margin:0 auto}',
 '.zl-ph{flex:none;width:52px;height:52px;border-radius:50%;overflow:hidden;background:#fffaf0;box-shadow:0 0 0 3px #fff,0 3px 8px rgba(0,0,0,.2)}.zl-ph img{width:100%;height:100%;display:block}',
 '.zl-bub{position:relative;flex:1;min-width:0;min-height:38px;background:#fffaf0;border:2px solid var(--wood,#9a6332);border-radius:16px 16px 16px 4px;padding:5px 12px;font:600 15.5px/1.3 var(--f);color:var(--ink,#3b2412);box-shadow:0 2px 0 var(--lip,rgba(0,0,0,.15))}',
 '.zl-bub b.zl-who{display:block;font:800 11px/1.2 var(--f);letter-spacing:.04em;text-transform:uppercase;color:var(--rib,#c9361d)}',
 '.zl-bub.pop{animation:zlPop .28s ease-out}@keyframes zlPop{0%{transform:scale(.96)}60%{transform:scale(1.02)}100%{transform:none}}',
 '.zl-info{flex:none;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:0 10px 4px;font:800 14px/1.2 var(--f);color:var(--ink,#3b2412)}.zl-info:empty{display:none}',
 '.zl-info span{background:var(--goldBg,#fff0bf);border-radius:12px;padding:3px 10px;box-shadow:0 2px 0 var(--goldB,#e0a92e);white-space:nowrap}',
 '.zl-main{position:relative;flex:1;min-height:0;overflow:hidden}.zl-main canvas{position:absolute;left:0;top:0;display:block;touch-action:none}',
 '.zl-foot{flex:none;display:flex;gap:8px;justify-content:center;align-items:center;padding:6px 10px calc(8px + var(--sb,0px));max-width:760px;width:100%;box-sizing:border-box;margin:0 auto}.zl-foot:empty{display:none}',
 '.zl-b{min-height:56px;min-width:56px;padding:10px 16px;font-size:17px;line-height:1.1;touch-action:none;width:auto}',
 '.zl-b.on{transform:translateY(3px)}.zl-b small{display:block;font-weight:500;font-size:12px;opacity:.8;margin-top:2px}',
 '.zl-kc{display:inline-block;font:700 11px/1 var(--f);border:1px solid currentColor;border-radius:5px;padding:2px 4px;margin-left:6px;opacity:.65;vertical-align:middle}',
 '.zl-pop{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font:900 30px/1 var(--f);color:#2f7a1c;text-shadow:0 2px 0 #fff,0 0 12px #fff;pointer-events:none;white-space:nowrap;animation:zlUp .9s ease-out forwards}',
 '.zl-pop.bad{color:#b3261e}.zl-pop.big{font-size:40px}@keyframes zlUp{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}100%{opacity:0;transform:translate(-50%,-110%) scale(1)}}',
 '.zl-cont,.zl-demo{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(40,24,10,.38);z-index:3;padding:12px}',
 '.zl-cont>div{background:var(--paper,#fffaf0);border:3px solid var(--wood,#9a6332);border-radius:18px;padding:14px 16px;max-width:340px;width:100%;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.25)}',
 '.zl-cont p{margin:0 0 10px;font:700 17px/1.3 var(--f);color:var(--ink)}.zl-cont .btn{width:100%;margin:5px 0;min-height:52px}',
 '.zl-demo{background:none;align-items:flex-start;pointer-events:none}.zl-demo>div{pointer-events:auto;margin-top:8px;display:flex;align-items:center;gap:10px;background:var(--paper,#fffaf0);border:2px solid var(--goldB,#e0a92e);border-radius:14px;padding:6px 8px 6px 14px;font:800 16px/1.2 var(--f);color:var(--ink);box-shadow:0 3px 0 rgba(0,0,0,.2)}',
 '.zl-demo .btn{width:auto;min-width:0;min-height:40px;padding:6px 14px;margin:0}',
 '@media (prefers-reduced-motion:reduce){.zl-pop{animation-duration:.01s}.zl-bub.pop{animation:none}}',
 '@media (min-width:700px){.zl-ph{width:64px;height:64px}.zl-bub{font-size:17px}}',
 '@media (max-height:560px){.zl-ph{width:40px;height:40px}.zl-bub{font-size:14px;padding:4px 10px;min-height:0}.zl-top{padding:4px 8px 2px}.zl-b{min-height:48px}}'
 ].join('\n');document.head.appendChild(s);}
function face(host,who,m){try{var h=host.face(who,m);if(h)return h;}catch(e){}return '';}
function frame(host,opt){css();opt=opt||{};var who=opt.who||'voevoda',el=document.createElement('div');el.className='zl-fr';
  el.innerHTML='<div class="zl-top"><div class="zl-ph"></div><div class="zl-bub"><b class="zl-who"></b><span class="zl-tx"></span></div></div><div class="zl-info"></div><div class="zl-main"></div><div class="zl-foot"></div>';
  host.el.appendChild(el);el.addEventListener('contextmenu',function(e){e.preventDefault();});
  var q=function(s){return el.querySelector(s);},lw='';
  var f={el:el,top:q('.zl-top'),main:q('.zl-main'),foot:q('.zl-foot'),inf:q('.zl-info'),
    say:function(t,m,w,nm){w=w||who;if(lw!==w){q('.zl-ph').innerHTML=face(host,w,m);lw=w;}
      q('.zl-who').textContent=nm||opt.nm||(host.whoName?host.whoName(w):'');var b=q('.zl-bub'),x=q('.zl-tx');if(x.innerHTML===t)return;x.innerHTML=t;
      if(!calm(host)){b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');}},
    info:function(h){if(f.inf.innerHTML!==h)f.inf.innerHTML=h;}};
  return f;}
function canvas(box){var cv=document.createElement('canvas');box.appendChild(cv);var c={cv:cv,ctx:cv.getContext('2d'),w:1,h:1,dpr:1};
  c.fit=function(){var w=box.clientWidth||1,h=box.clientHeight||1,d=Math.min(2,W.devicePixelRatio||1);if(w===c.w&&h===c.h&&d===c.dpr&&cv.width>1)return false;
    c.w=w;c.h=h;c.dpr=d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';c.ctx.setTransform(d,0,0,d,0,0);return true;};
  c.fit();return c;}
function loop(host,fn){var on=true;host.loop(function(dt,t){if(!on)return;try{fn(dt,t);}catch(e){on=false;console.error(e);}});return function(){on=false;};}
var DIRS={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D',a:'L',d:'R',w:'U',s:'D',A:'L',D:'R',W:'U',S:'D','ф':'L','в':'R','ц':'U','ы':'D','Ф':'L','В':'R','Ц':'U','Ы':'D'};
function dir(k){return DIRS[k]||null;}
function keys(host,fn){var held={};
  host.keys(function(k,e){if(e&&e.repeat&&held[k])return true;held[k]=1;return fn(k,e,true);});
  var up=function(e){if(!held[e.key])return;delete held[e.key];try{fn(e.key,e,false);}catch(x){}};
  var rel=function(){for(var k in held){delete held[k];try{fn(k,null,false);}catch(x){}}};
  W.addEventListener('keyup',up,true);var pz=setInterval(function(){if(host.paused)rel();},200);W.addEventListener('blur',rel);
  host.onQuit(function(){W.removeEventListener('keyup',up,true);W.removeEventListener('blur',rel);clearInterval(pz);});return rel;}
function tap(host,el,fn){host.ptr(el,{down:function(x,y){if(!host.el.querySelector('.zl-cont'))fn(x,y);}});
  host.keys(function(k){if(host.el.querySelector('.zl-cont'))return false;if(k===' '||k==='Enter'||k==='ArrowUp'||k==='w'||k==='W'||k==='ц'||k==='Ц'){fn(-1,-1);return true;}return false;});}
function calm(host){if(host&&host.calm)return true;try{return W.matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}}
function pop(host,box,t,cls){if(!box)return;var d=document.createElement('div');d.className='zl-pop'+(cls?' '+cls:'');d.textContent=t;box.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},calm(host)?400:950);}
function btn(h,cls,fn){var b=document.createElement('button');b.type='button';b.className='btn zl-b'+(cls?' '+cls:'');b.innerHTML=h;if(fn)b.onclick=fn;return b;}
function kc(t,host){return host&&host.pc?'<span class="zl-kc">'+t+'</span>':'';}
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function buzz(ms){try{if(navigator.vibrate&&!(typeof S!=='undefined'&&S.shake===false))navigator.vibrate(ms==='bad'?40:typeof ms==='number'?ms:15);}catch(e){}}
function pick(a,R){return a[Math.floor((R||Math.random)()*a.length)%a.length];}
function tier(s,c){return s>=c[2]?3:s>=c[1]?2:s>=c[0]?1:0;}
function snd(host,k){try{var S2=host.snd||{};if(typeof S2[k]==='function')S2[k]();}catch(e){}}
/* «продолжить с того же места» за рекламу — раз за партию */
function cont(host,box,o){o=o||{};var used=host.__zlc;if(used||!host.adOk||!host.adOk()){o.onNo();return;}host.__zlc=1;
  var d=document.createElement('div');d.className='zl-cont';
  d.innerHTML='<div><p>'+(o.text||Lg('Сбился! Продолжить с того же места?','Missed! Continue from the same spot?'))+'</p><button class="btn gold ad" type="button">'+Lg('🎬 Продолжить за рекламу','🎬 Continue for an ad')+'</button><button class="btn ghost" type="button">'+Lg('Нет, к итогам','No, to the results')+'</button></div>';
  box.appendChild(d);var bs=d.querySelectorAll('button'),done=false;
  var no=function(){if(done)return;done=true;if(d.parentNode)d.parentNode.removeChild(d);o.onNo();};
  bs[1].onclick=function(){snd(host,'tap');no();};
  bs[0].onclick=function(){if(done)return;snd(host,'tap');bs[0].disabled=true;host.adNeed('cont').then(function(ok){if(done)return;
    if(ok){done=true;if(d.parentNode)d.parentNode.removeChild(d);try{STAT.ev('cont',{id:host.id});}catch(e){}o.onYes();}else no();});};
  host.keys(function(k){if(done)return false;if(k==='Enter'||k===' '){bs[0].click();return true;}if(k==='n'||k==='т'){no();return true;}return false;});}
/* палец 👆: x,y — кончик пальца; press — нажатие (палец опущен, круг касания) */
function hand(c,x,y,press,px){px=px||44;c.save();if(press){c.globalAlpha=.45;c.fillStyle='#ffffff';c.beginPath();c.arc(x,y,px*.36,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3;c.beginPath();c.arc(x,y,px*.5,0,Math.PI*2);c.stroke();}
  c.font=Math.round(px)+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';c.textAlign='center';c.textBaseline='top';c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=6;c.shadowOffsetY=3;
  c.fillText('👆',x+px*.08,y+(press?-px*.02:px*.14));c.restore();}
/* показ «Смотри, как надо»: sec секунд или «Понятно!» */
function demo(host,box,o){o=o||{};css();return new Promise(function(res){var d=document.createElement('div');d.className='zl-demo';
  d.innerHTML='<div><span>👀 '+(o.text||Lg('Смотри, как надо','Watch how it’s done'))+'</span><button class="btn gold" type="button">'+Lg('Понятно!','Got it!')+kc('Enter',host)+'</button></div>';
  (box||host.el).appendChild(d);var done=false,t=setTimeout(go,(o.sec||4)*1000);
  function go(){if(done)return;done=true;clearTimeout(t);if(d.parentNode)d.parentNode.removeChild(d);res();}
  d.querySelector('button').onclick=function(){snd(host,'tap');go();};
  host.keys(function(k){if(done)return false;if(k==='Enter'||k===' '){go();return true;}return false;});host.onQuit(go);});}
W.ZLK={frame:frame,canvas:canvas,loop:loop,keys:keys,dir:dir,tap:tap,calm:calm,pop:pop,btn:btn,kc:kc,rr:rr,buzz:buzz,pick:pick,tier:tier,snd:snd,cont:cont,face:face,hand:hand,demo:demo};
})();
