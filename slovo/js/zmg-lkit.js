'use strict';
/* zb2-LOV · набор для ловкостных мини-игр (js/zmg-lkit.js → window.ZLK). Грузится лениво: в игре deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'].
   Перенос идей VYC Выезда (vymg-mgckit.js) на оболочку Зины (zmg-core.js). Классы — zl-. Журнал — release-i/zina-boost2/logs/LOV.md.
   ZLK.frame(host,{who,nm}) → {el, top, main, foot, say(text, mood, who?, nm?), info(html)} — раскладка «ведущий сверху · поле · кнопки снизу» внутри host.el.
   ZLK.canvas(box) → {cv, ctx, w, h, dpr, fit()} — холст во весь box (fit() → true, если размер сменился).
   ZLK.loop(host, fn(dt,t)) — кадры оболочки (на паузе стоят) + STAT.frame() для замера плавности.
   ZLK.keys(host, fn(key, e, down)) — клавиши ПК с отпусканием (down=false); на паузе/при выходе всё «отпускается». ZLK.dir(key) → 'L'|'R'|'U'|'D'|null.
   ZLK.tap(host, el, fn(x,y)) — касание/клик по el + Пробел/Enter/↑ на ПК (одна кнопка игры).
   ZLK.cont(host, {text, onYes, onNo}) — «Сбилась! Продолжить с того же места за рекламу?» — один раз за партию (оболочка: один ролик за заход);
     ролика нет (host.adOk() — нет) — сразу onNo. Кнопка — классы zbad zmg-ad (AD_BTN_SEL), поздний досмотр — через host.adNeed. STAT 'cont' {id}.
   ZLK.pop(host, text, cls) — всплывающая надпись над полем («Отлично!»), только transform/opacity. ZLK.calm(host) — спокойный режим или prefers-reduced-motion.
   ZLK.btn(html, cls, fn), ZLK.rr(ctx,x,y,w,h,r), ZLK.kc(t,host) — значок клавиши (только ПК), ZLK.buzz(ms), ZLK.pick(arr,rnd), ZLK.tier(sc,[c1,c2,c3]).
   Портрет Михалыча (приёмщик «Тележки») — в ZMG.faces.mihalych. */
(function(){if(window.ZLK)return;
var W=window,NM={zina:'Баба Зина',mihalych:'Михалыч',valerka:'Валерка',nina:'Нина Аркадьевна',vp:'Валентина Петровна',galya:'Галя с третьего',yat:'Кот Ять',valya:'Тётя Валя',lyusya:'Люся-почтальонка'};
function css(){if(document.getElementById('zl-kit'))return;var s=document.createElement('style');s.id='zl-kit';s.textContent=[
 '.zl-fr{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none}',
 '.zl-top{display:flex;align-items:flex-end;gap:8px;padding:6px 10px 4px;flex:none;max-width:760px;width:100%;box-sizing:border-box;margin:0 auto}',
 '.zl-ph{flex:none;width:52px;height:52px;border-radius:50%;overflow:hidden;background:#fff;box-shadow:0 0 0 3px #fff,0 3px 8px rgba(0,0,0,.16)}.zl-ph svg{width:100%;height:100%;display:block}',
 '.zl-bub{position:relative;flex:1;min-width:0;min-height:38px;background:#fff;border-radius:16px 16px 16px 4px;padding:6px 12px;font-size:15.5px;line-height:1.3;box-shadow:0 2px 6px rgba(0,0,0,.1)}',
 '.zl-bub b.zl-who{display:block;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#1d3f73;font-weight:800}',
 '.zl-bub.pop{animation:zlPop .28s ease-out}@keyframes zlPop{0%{transform:scale(.96)}60%{transform:scale(1.02)}100%{transform:none}}',
 '.zl-info{flex:none;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:0 10px 4px;font-size:14px;font-weight:700;min-height:0}.zl-info:empty{display:none}',
 '.zl-info span{background:#fff8e1;border-radius:12px;padding:3px 10px;box-shadow:0 2px 0 #f0d58a;white-space:nowrap}',
 '.zl-main{position:relative;flex:1;min-height:0;overflow:hidden}.zl-main canvas{position:absolute;left:0;top:0;display:block;touch-action:none}',
 '.zl-foot{flex:none;display:flex;gap:8px;justify-content:center;align-items:center;padding:6px 10px calc(8px + env(safe-area-inset-bottom));max-width:760px;width:100%;box-sizing:border-box;margin:0 auto}.zl-foot:empty{display:none}',
 '.zl-b{min-height:56px;min-width:56px;border:0;border-radius:16px;padding:10px 16px;font-size:17px;line-height:1.1;font-weight:700;font-family:inherit;cursor:pointer;touch-action:none}',
 '.zl-b.on{transform:translateY(3px)}.zl-b small{display:block;font-weight:500;font-size:12px;opacity:.8;margin-top:2px}',
 '.zl-kc{display:inline-block;font:600 11px/1 inherit;border:1px solid currentColor;border-radius:5px;padding:2px 4px;margin-left:6px;opacity:.6;vertical-align:middle}',
 '.zl-pop{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:30px;font-weight:900;color:#2b8a3e;text-shadow:0 2px 0 #fff,0 0 12px #fff;pointer-events:none;white-space:nowrap;animation:zlUp .9s ease-out forwards}',
 '.zl-pop.bad{color:#c92a2a}.zl-pop.big{font-size:40px}@keyframes zlUp{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}100%{opacity:0;transform:translate(-50%,-110%) scale(1)}}',
 '.zl-cont{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(40,30,20,.35);z-index:3;padding:12px}',
 '.zl-cont>div{background:#fffdf7;border-radius:18px;padding:14px 16px;max-width:340px;width:100%;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.2)}',
 '.zl-cont p{margin:0 0 10px;font-size:17px;line-height:1.3}.zl-cont .btn{width:100%;margin:5px 0;min-height:52px}',
 '@media (prefers-reduced-motion:reduce){.zl-pop{animation-duration:.01s}.zl-bub.pop{animation:none}}',
 '@media (min-width:700px){.zl-ph{width:64px;height:64px}.zl-bub{font-size:17px}}',
 '@media (max-height:560px){.zl-ph{width:40px;height:40px}.zl-bub{font-size:14px;padding:4px 10px;min-height:0}.zl-top{padding:4px 8px 2px}.zl-b{min-height:48px}}'
 ].join('\n');document.head.appendChild(s);}
/* Михалыч — приёмщик (облик из Викторины/Выезда: ушанка, оранжевый жилет) */
function mih(m){var sk='#eebf99',sk2='#dba27c',br='#9a9a9a';
 var ey=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>':m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/>':'<ellipse cx="81" cy="103" rx="4.2" ry="5" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="5" fill="#3a2a22"/>';
 var bw=m==='sad'?'M68 90 q10 -5 22 2 M132 90 q-10 -5 -22 2':'M68 90 q11 -6 22 -2 M132 90 q-11 -6 -22 -2';
 var mo=m==='happy'?'<path d="M82 132 q18 20 36 0 q-18 5 -36 0z" fill="#8f2f35"/>':m==='sad'?'<path d="M88 140 q12 -9 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>':m==='wow'?'<ellipse cx="100" cy="137" rx="8" ry="9" fill="#8f2f35"/>':'<path d="M86 133 q14 11 28 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
 return '<svg viewBox="20 20 160 160" aria-hidden="true"><rect width="200" height="220" fill="#e6eadf"/><path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="#5d6b7c"/>'+
  '<path d="M56 158 l24 -6 l20 30 l20 -30 l24 6 q30 8 38 34 v28 H18 v-28 q8 -26 38 -34z" fill="#ff8a1f"/><path d="M20 196 h160" stroke="#f4f6f4" stroke-width="12"/><path d="M80 152 l20 30 l20 -30" fill="#39485a"/>'+
  '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'"/><ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'"/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'"/>'+
  '<path d="M52 92 q0 -48 48 -48 q48 0 48 48 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'"/>'+
  '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
  '<path d="'+bw+'" stroke="'+br+'" stroke-width="6" fill="none" stroke-linecap="round"/>'+ey+'<path d="M100 104 q-9 18 -3 22 q5 3 11 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".9"/>'+
  '<path d="M70 128 q14 -10 30 -3 q16 -7 30 3 q-6 14 -30 9 q-24 5 -30 -9z" fill="#c9cdd2"/>'+mo+
  '<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#6f5136"/><path d="M42 82 q58 -22 116 0 v14 q-58 -20 -116 0z" fill="#9b7650"/>'+
  '<path d="M42 84 q-12 30 0 52 q10 -4 13 -18 q-5 -16 -3 -32z M158 84 q12 30 0 52 q-10 -4 -13 -18 q5 -16 3 -32z" fill="#9b7650"/></svg>';}
try{if(W.ZMG&&ZMG.faces&&!ZMG.faces.mihalych)ZMG.faces.mihalych=mih;}catch(e){}
function face(host,who,m){try{if(who==='mihalych')return mih(m);var h=host.face(who,m);if(h)return h;}catch(e){}return mih(m);}
function frame(host,opt){css();opt=opt||{};var who=opt.who||'zina',el=document.createElement('div');el.className='zl-fr';
  el.innerHTML='<div class="zl-top"><div class="zl-ph"></div><div class="zl-bub"><b class="zl-who"></b><span class="zl-tx"></span></div></div><div class="zl-info"></div><div class="zl-main"></div><div class="zl-foot"></div>';
  if(getComputedStyle(host.el).position==='static')host.el.style.position='relative';host.el.appendChild(el);el.addEventListener('contextmenu',function(e){e.preventDefault();});
  var q=function(s){return el.querySelector(s);},lm='',lw='';
  var f={el:el,top:q('.zl-top'),main:q('.zl-main'),foot:q('.zl-foot'),inf:q('.zl-info'),
    say:function(t,m,w,nm){w=w||who;m=m||'norm';if(lm!==m||lw!==w){q('.zl-ph').innerHTML=face(host,w,m);lm=m;lw=w;}
      q('.zl-who').textContent=nm||opt.nm||NM[w]||(host.whoName?host.whoName(w):'');var b=q('.zl-bub'),x=q('.zl-tx');if(x.innerHTML===t)return;x.innerHTML=t;
      if(!calm(host)){b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');}},
    info:function(h){if(f.inf.innerHTML!==h)f.inf.innerHTML=h;}};
  return f;}
function canvas(box){var cv=document.createElement('canvas');box.appendChild(cv);var c={cv:cv,ctx:cv.getContext('2d'),w:1,h:1,dpr:1};
  c.fit=function(){var w=box.clientWidth||1,h=box.clientHeight||1,d=Math.min(2,W.devicePixelRatio||1);if(w===c.w&&h===c.h&&d===c.dpr&&cv.width>1)return false;
    c.w=w;c.h=h;c.dpr=d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';c.ctx.setTransform(d,0,0,d,0,0);return true;};
  c.fit();return c;}
function loop(host,fn){var on=true;host.loop(function(dt,t){if(!on)return;try{if(W.STAT&&STAT.frame)STAT.frame();}catch(e){}try{fn(dt,t);}catch(e){on=false;console.error(e);}});return function(){on=false;};}
var DIRS={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D',a:'L',d:'R',w:'U',s:'D',A:'L',D:'R',W:'U',S:'D','ф':'L','в':'R','ц':'U','ы':'D','Ф':'L','В':'R','Ц':'U','Ы':'D'};
function dir(k){return DIRS[k]||null;}
/* клавиши с отпусканием: нажатие — через host.keys (оболочка: только когда игра на экране и не на паузе), отпускание — своим слушателем */
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
function buzz(ms){try{if(typeof W.buzz==='function')W.buzz(ms);}catch(e){}}
function pick(a,R){return a[Math.floor((R||Math.random)()*a.length)%a.length];}
function tier(s,c){return s>=c[2]?3:s>=c[1]?2:s>=c[0]?1:0;}
function snd(host,k){try{var S2=host.snd||W.SND;if(S2&&typeof S2[k]==='function')S2[k]();}catch(e){}}
/* «продолжить с того же места» за рекламу — раз за партию */
function cont(host,box,o){o=o||{};var used=host.__zlc;if(used||!host.adOk||!host.adOk()){o.onNo();return;}host.__zlc=1;
  var d=document.createElement('div');d.className='zl-cont';
  d.innerHTML='<div><p>'+(o.text||'Сбилась! Продолжить с того же места?')+'</p><button class="btn green zbad zmg-ad" type="button">🎬 Продолжить за рекламу</button><button class="btn sec" type="button">Нет, к итогам</button></div>';
  box.appendChild(d);var bs=d.querySelectorAll('button'),done=false;
  var no=function(){if(done)return;done=true;if(d.parentNode)d.parentNode.removeChild(d);o.onNo();};
  bs[1].onclick=function(){snd(host,'tap');no();};
  bs[0].onclick=function(){if(done)return;snd(host,'tap');bs[0].disabled=true;host.adNeed('cont').then(function(ok){if(done)return;
    if(ok){done=true;if(d.parentNode)d.parentNode.removeChild(d);try{STAT.ev('cont',{id:host.id});}catch(e){}o.onYes();}else no();});};
  host.keys(function(k){if(done)return false;if(k==='Enter'||k===' '){bs[0].click();return true;}if(k==='Escape'||k==='n'||k==='т'){no();return true;}return false;});}
W.ZLK={frame:frame,canvas:canvas,loop:loop,keys:keys,dir:dir,tap:tap,calm:calm,pop:pop,btn:btn,kc:kc,rr:rr,buzz:buzz,pick:pick,tier:tier,snd:snd,cont:cont,face:face,mih:mih,NM:NM};
})();
