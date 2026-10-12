'use strict';
/* gb-MG0 — холст-помощники мини-игр Гастронома (js/gmg-ckit.js) → window.GMGK. Форк vymg-mgckit «Выезда» (10.10.2026).
   Грузится оболочкой: в игре deps:['ckit']. Оболочку (шапка, итоги, награды, STAT) не трогает: игры зовут host.finish().
   GMGK.frame(host,o,{who}) → {top,main,foot,say(html,mood,who),prog(n,i,res),el} — раскладка «ведущий сверху · поле · кнопки снизу»;
   GMGK.canvas(box) → {cv,ctx,w,h,dpr,fit()} — холст во весь box (dpr ≤ 2, на слабых/спокойном — ≤ 1,25);
   GMGK.loop(host,fn(dt,t)) — кадр (стоит на паузе оболочки); GMGK.keys(host,fn(key,e,down)) — клавиши ПК (down=false — отпускание);
   GMGK.dir(key) → L|R|U|D; GMGK.near(items,cur,d); GMGK.optKeys(box,key) — цифры/стрелки/Enter по кнопкам .gm0-b в box;
   GMGK.snd(host,k) — звук (tap/right/wrong/coin/win/pick/drop/till/happy/grumble…); GMGK.buzz(ms); GMGK.tier(score,[c1,c2,c3]);
   GMGK.pick(arr,R); GMGK.shuffle(arr,R); GMGK.pc(host); GMGK.kc(t,host); GMGK.calm(o); GMGK.intro(host,t,go); GMGK.btn(html,cls,fn); GMGK.rr(c,x,y,w,h,r);
   GMGK.pops — всплывающие надписи на холсте: p=GMGK.pops(); p.add(text,x,y,col); p.draw(ctx,dt). Классы — префикс gm0-. */
(function(){
if(window.GMGK)return;
var W=window;
function en(){try{return typeof LANG!=='undefined'&&LANG==='en';}catch(e){return false;}}
function Lg(ru,eng){return en()&&eng!=null?eng:ru;}
/* ---------- стили ---------- */
function css(){if(document.getElementById('gm0-css'))return;var s=document.createElement('style');s.id='gm0-css';s.textContent=[
 '.gm0-fr{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;color:#3b2a1a;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}',
 '.gm0-top{display:flex;align-items:flex-end;gap:8px;padding:6px 10px 4px;flex:none;max-width:760px;width:100%;box-sizing:border-box;margin:0 auto}',
 '.gm0-ph{flex:none;width:56px;height:56px;border-radius:16px;overflow:hidden;box-shadow:0 0 0 3px #fff,0 3px 8px rgba(0,0,0,.18);background:#fff}',
 '.gm0-ph svg,.gm0-ph img{width:100%;height:100%;display:block}',
 '.gm0-bub{position:relative;flex:1;min-height:40px;background:#fffaf0;border-radius:16px;padding:7px 12px;font-size:16px;line-height:1.3;box-shadow:0 2px 0 #e2d2b4,0 4px 10px rgba(0,0,0,.08)}',
 '.gm0-bub:before{content:"";position:absolute;left:-7px;bottom:12px;border:7px solid transparent;border-right-color:#fffaf0;border-left:0}',
 '.gm0-bub b.gm0-who{display:block;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#8b2a14;font-weight:800}',
 '.gm0-bub.pop{animation:gm0Pop .28s ease-out}@keyframes gm0Pop{0%{transform:scale(.96)}60%{transform:scale(1.02)}100%{transform:none}}',
 '.gm0-prog{display:flex;gap:5px;justify-content:center;padding:2px 0 4px;flex:none}',
 '.gm0-prog i{width:11px;height:11px;border-radius:50%;background:rgba(0,0,0,.14)}.gm0-prog i.cur{background:#f29a38;box-shadow:0 0 0 3px rgba(242,154,56,.3)}',
 '.gm0-prog i.p3{background:#2b8a3e}.gm0-prog i.p2{background:#74b816}.gm0-prog i.p1{background:#f2a900}.gm0-prog i.p0{background:#c8401c}',
 '.gm0-main{position:relative;flex:1;min-height:0;overflow:hidden}',
 '.gm0-main canvas{position:absolute;left:0;top:0;display:block;touch-action:none}',
 '.gm0-foot{flex:none;display:flex;gap:8px;justify-content:center;flex-wrap:nowrap;padding:6px 10px 10px;max-width:760px;width:100%;box-sizing:border-box;margin:0 auto}',
 '.gm0-b{min-height:56px;min-width:56px;border-radius:16px;padding:10px 16px;font-size:18px;line-height:1.1;font-weight:800;touch-action:manipulation}',
 '.gm0-b.on{transform:translateY(3px)}',
 '.gm0-b[disabled]{opacity:.45;pointer-events:none}',
 '.gm0-b.ok{background:#d3f9d8!important;box-shadow:0 4px 0 #2b8a3e!important}.gm0-b.no{background:#ffe3e3!important;box-shadow:0 4px 0 #c8401c!important}',
 '.gm0-b small{display:block;font-weight:500;font-size:12px;opacity:.8;margin-top:2px}',
 '.gm0-b.kf{outline:3px solid #f29a38;outline-offset:2px}',
 '.gm0-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}',
 '@media (min-width:700px){.gm0-ph{width:72px;height:72px}.gm0-bub{font-size:18px}}',
 '@media (max-height:560px){.gm0-ph{width:44px;height:44px}.gm0-bub{font-size:15px;padding:5px 10px}}'
 ].join('\n');document.head.appendChild(s);}
function face(who,m,host){try{if(host&&typeof host.face==='function'){var h=host.face(who,m);if(h)return h;}}catch(e){}return '';}
function whoName(who,host){try{if(host&&typeof host.whoName==='function')return host.whoName(who);}catch(e){}return '';}
/* ---------- раскладка ---------- */
function frame(host,o,opt){css();opt=opt||{};var who=opt.who||'valya';
  var el=document.createElement('div');el.className='gm0-fr';
  el.innerHTML='<div class="gm0-top"><div class="gm0-ph"></div><div class="gm0-bub"><b class="gm0-who"></b><span class="gm0-tx"></span></div></div><div class="gm0-prog"></div><div class="gm0-main"></div><div class="gm0-foot"></div>';
  host.el.appendChild(el);el.addEventListener('contextmenu',function(e){e.preventDefault();});
  var q=function(s){return el.querySelector(s);};var lastM='',lastW='';
  var f={el:el,top:q('.gm0-top'),main:q('.gm0-main'),foot:q('.gm0-foot'),progEl:q('.gm0-prog'),
   say:function(text,mood,w){w=w||who;mood=mood||'norm';var ph=q('.gm0-ph');if(lastM!==mood||lastW!==w){ph.innerHTML=face(w,mood,host);lastM=mood;lastW=w;}
     q('.gm0-who').textContent=whoName(w,host);var b=q('.gm0-bub'),t=q('.gm0-tx');if(t.innerHTML===text)return;t.innerHTML=text;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');},
   prog:function(n,i,res){var h='';for(var k=0;k<n;k++){var r=res&&res[k];h+='<i class="'+(k===i?'cur':r!=null?'p'+r:'')+'"></i>';}f.progEl.innerHTML=h;f.progEl.style.display=n?'':'none';}};
  f.prog(0);return f;}
function canvas(box,o){var cv=document.createElement('canvas');box.appendChild(cv);var c={cv:cv,ctx:cv.getContext('2d'),w:1,h:1,dpr:1};
  var lim=calm(o)?1.25:2;
  c.fit=function(){var w=box.clientWidth||1,h=box.clientHeight||1,d=Math.min(lim,W.devicePixelRatio||1);
    if(w===c.w&&h===c.h&&d===c.dpr&&cv.width>1)return false;c.w=w;c.h=h;c.dpr=d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';
    c.ctx.setTransform(d,0,0,d,0,0);return true;};
  c.fit();return c;}
/* кадр: fn(dt сек, t сек); пауза оболочки — время стоит */
function loop(host,fn){var on=true,t=0;host.loop(function(dt){if(!on)return;t+=dt;try{fn(dt,t);}catch(e){on=false;console.error(e);}});return function(){on=false;};}
function onQuit(host,fn){host.onQuit(fn);}
/* клавиши: fn(key,e,down) → true — съедена. Отпускание приходит с down=false (для «держи Пробел»). */
function keys(host,fn){host.keys(function(k,e){return fn(k,e,true);});host.keysUp(function(k,e){return fn(k,e,false);});}
var DIRS={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D',a:'L',d:'R',w:'U',s:'D',A:'L',D:'R',W:'U',S:'D','ф':'L','в':'R','ц':'U','ы':'D','Ф':'L','В':'R','Ц':'U','Ы':'D'};
function dir(k){return DIRS[k]||null;}
function near(items,cur,d){if(!items.length)return null;var c=null;for(var i=0;i<items.length;i++)if(items[i].id===cur)c=items[i];if(!c)return items[0].id;
  var vx=d==='L'?-1:d==='R'?1:0,vy=d==='U'?-1:d==='D'?1:0,best=null,bs=1e9;
  items.forEach(function(it){if(it===c)return;var dx=it.x-c.x,dy=it.y-c.y,along=dx*vx+dy*vy;if(along<=.5)return;var across=Math.abs(dx*vy-dy*vx);if(across>along*2.2)return;var sc=along+across*2;if(sc<bs){bs=sc;best=it;}});
  if(best)return best.id;var k=items.indexOf(c),n=items.length;return items[(k+(vx+vy>0?1:n-1))%n].id;}
function optKeys(box,k){if(!box)return false;var bs=[].slice.call(box.querySelectorAll('.gm0-b'));if(!bs.length)return false;
  if(/^[1-9]$/.test(k)){var b=bs[+k-1];if(!b)return false;if(!b.disabled)b.click();return true;}
  var on=bs.filter(function(b){return !b.disabled;}),cur=box.querySelector('.gm0-b.kf'),dr=dir(k);
  if(dr){if(!on.length)return true;var it=on.map(function(b,i){var r=b.getBoundingClientRect();return {id:i,x:r.left+r.width/2,y:r.top+r.height/2};});
    var ni=near(it,on.indexOf(cur)<0?null:on.indexOf(cur),dr);bs.forEach(function(b){b.classList.remove('kf');});if(ni!=null)on[ni].classList.add('kf');return true;}
  if((k==='Enter'||k===' ')&&cur&&!cur.disabled){cur.click();return true;}return false;}
/* звуки игры (SND Гастронома): right → happy, wrong → grumble, tap/pick → pick, coin → coin, win → win; остальное — как есть */
function snd(host,k){try{var S=host.snd||W.SND;if(!S)return;var map={right:'happy',wrong:'grumble',tap:'pick',ok:'till',bad:'stuck'};
  var f=S[k]||S[map[k]];if(typeof f==='function')f.call(S,arguments[2]);}catch(e){}}
function buzz(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function tier(s,c){return s>=c[2]?3:s>=c[1]?2:s>=c[0]?1:0;}
function pick(a,R){return a[Math.floor((R||Math.random)()*a.length)%a.length];}
function shuffle(a,R){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor((R||Math.random)()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pc(host){if(host&&host.pc!=null)return !!host.pc;try{return W.matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function kc(t,host){return pc(host)?'<kbd class="gmg-kc">'+t+'</kbd>':'';}
function calm(o){if(o&&o.calm)return true;try{return W.matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}}
function intro(host,t,go){host.intro(t).then(go);}
function btn(txt,cls,fn){var b=document.createElement('button');b.type='button';cls=(cls||'').replace(/\b(acc|grn)\b/g,'green');b.className='btn gm0-b'+(cls?' '+cls:'');b.innerHTML=txt;if(fn)b.onclick=fn;return b;}
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
/* всплывающие надписи (+5 г, «Как в аптеке!») */
function pops(){var L=[];return {add:function(t,x,y,col,sz){L.push({t:t,x:x,y:y,c:col||'#2b8a3e',s:sz||22,a:1.4});},
  draw:function(c,dt){for(var i=L.length-1;i>=0;i--){var p=L[i];p.a-=dt;p.y-=dt*30;if(p.a<=0){L.splice(i,1);continue;}
    c.save();c.globalAlpha=Math.min(1,p.a);c.font='900 '+p.s+'px -apple-system,"Segoe UI",Roboto,sans-serif';c.textAlign='center';c.textBaseline='middle';
    c.lineWidth=4;c.strokeStyle='rgba(255,255,255,.9)';c.strokeText(p.t,p.x,p.y);c.fillStyle=p.c;c.fillText(p.t,p.x,p.y);c.restore();}},
  clear:function(){L.length=0;}};}
W.GMGK={L:Lg,en:en,intro:intro,frame:frame,canvas:canvas,loop:loop,keys:keys,onQuit:onQuit,face:face,snd:snd,buzz:buzz,tier:tier,pick:pick,shuffle:shuffle,
  pc:pc,kc:kc,dir:dir,near:near,optKeys:optKeys,calm:calm,btn:btn,rr:rr,pops:pops};
})();
