'use strict';
/* ob2-LOVB · набор для 6 ловкостных на рекорд (js/lovb-kit.js → window.LVB). Грузится лениво (OB2.need) вместе с файлом игры.
   Журнал — hobby-analytics/release-i/oborona-boost2/logs/LOVB.md. Без ?. ?? .at() (старые WebView).
   LVB.run(host,o,G) — общий ход партии для игры G (договор MG_REG, js/mg-core.js):
     G = {id, who:'ключ рисунка ведущего', nm:'имя ведущего', title, rule:'одна строка правил', hint:{pc,ph}, unit:['вёрста','вёрсты','вёрст'], cut:[бронза,серебро,золото],
          warm:N — первые N «ошибок» прощаются (разминка), btn:{t,k} — большая кнопка снизу (иначе нажатие по полю),
          init(st) — состояние (st.rnd, st.W, st.H — поле в px, st.calm), step(st,dt,inp) — шаг (inp — {press, hold, tap:{x,y}, dir}),
          draw(st,c) — рисование (c — 2d-контекст в px поля), resize(st), bot(st,inp) — автоигра для показа (ставит inp.press/hold/tap/dir, вернёт true — палец «жмёт»),
          finger(st) → {x,y} где рисовать палец показа (иначе — у кнопки), say:{start:[],warm:[],good:[],bad:{причина:текст}}, revive(st), label(st)}
     Игра сообщает: st.sc — счёт; st.err='причина' — ошибка (в разминке прощается: зовётся G.forgive(st)); st.over='причина' — конец партии; st.msg('текст',mood) — реплика.
   Показ с пальцем: первый запуск игры — 3,5 с играет бот, рисуется палец 👆 (флаг в localStorage 'ob-lovb-demo'), потом «Теперь ты!».
   Конец: «Продолжить с того же места» за ролик (раз за партию, если ролик есть) → LVB.finish(host,{score,tier,label,why}).
   Итог с рекордом/соседями/«Ещё разок» — оболочка избы (договор IZBA); пока его нет — host.done (окно итогов mg-izba). */
(function(){if(window.LVB)return;
var W=window,DEMO_K='ob-lovb-demo',ses={};
function L(ru,en){return typeof Lg==='function'?Lg(ru,en):ru;}
function pl(n,u){if(!u)return String(n);var a=n%10,b=n%100;return n+' '+(a===1&&b!==11?u[0]:a>=2&&a<=4&&(b<10||b>=20)?u[1]:u[2]);}
function css(){if(document.getElementById('lvbCss'))return;var s=document.createElement('style');s.id='lvbCss';s.textContent=[
 '.lvFr{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;background:#1c2236}',
 '.lvTop{flex:none;display:flex;align-items:flex-end;gap:8px;padding:calc(var(--st,0px) + 8px) 68px 4px 8px;max-width:820px;width:100%;box-sizing:border-box;margin:0 auto}',
 '.lvPh{flex:none;width:52px;height:52px;border-radius:50%;background:#fdf0cf;border:3px solid #3a2410;overflow:hidden;box-shadow:0 3px 0 rgba(0,0,0,.35)}.lvPh img{width:100%;height:100%;display:block}',
 '.lvBub{flex:1;min-width:0;min-height:40px;background:linear-gradient(#fffaf0,#f3e2bc);border:2px solid #3a2410;border-radius:16px 16px 16px 4px;padding:4px 10px;font:600 14.5px/1.25 var(--f,system-ui);color:#3a2410;box-shadow:0 3px 0 rgba(0,0,0,.3)}',
 '.lvBub b{display:block;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#a0281e;font-weight:900}',
 '.lvBub.pop{animation:lvPop .28s ease-out}@keyframes lvPop{0%{transform:scale(.96)}60%{transform:scale(1.02)}100%{transform:none}}',
 '.lvInf{flex:none;display:flex;justify-content:center;gap:6px;flex-wrap:wrap;padding:2px 8px 4px;font:800 14px/1 var(--f,system-ui)}',
 '.lvInf span{background:#fdf0cf;color:#3a2410;border:2px solid #3a2410;border-radius:12px;padding:4px 10px;white-space:nowrap}.lvInf span.w{background:#d8f0c0}',
 '.lvMain{position:relative;flex:1;min-height:0;overflow:hidden}.lvMain canvas{position:absolute;left:0;top:0;display:block;touch-action:none}',
 '.lvFoot{flex:none;display:flex;justify-content:center;gap:8px;padding:6px 10px calc(8px + env(safe-area-inset-bottom));max-width:620px;width:100%;box-sizing:border-box;margin:0 auto}.lvFoot:empty{display:none}',
 '.lvFoot .btn{flex:1;min-height:60px;font-size:20px;touch-action:none}.lvFoot .btn.on{transform:translateY(3px);filter:brightness(.92)}',
 '.lvKc{display:inline-block;font:700 11px/1 var(--f,system-ui);border:1.5px solid currentColor;border-radius:5px;padding:2px 4px;margin-left:8px;opacity:.65;vertical-align:middle}',
 '.lvPop{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);font:900 30px/1 var(--f,system-ui);color:#ffe27a;-webkit-text-stroke:1.5px #3a2410;text-shadow:0 3px 0 #3a2410;pointer-events:none;white-space:nowrap;animation:lvUp .95s ease-out forwards;z-index:2}',
 '.lvPop.bad{color:#ff8a7a}.lvPop.big{font-size:38px}@keyframes lvUp{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}100%{opacity:0;transform:translate(-50%,-115%)}}',
 '.lvVeil{position:absolute;left:0;top:0;right:0;bottom:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(14,10,6,.5);overflow-y:auto}',
 '.lvVeil .panel{max-width:400px;width:100%;margin:auto;text-align:center;animation:mgPop .3s cubic-bezier(.2,1.4,.4,1) both}.lvVeil h3{margin:2px 0 6px}',
 '.lvVeil p{margin:4px 0 8px;font-weight:600}.lvVeil .btn{width:100%;margin:5px 0;min-height:54px}.lvVeil img.lvIc{width:84px;height:84px;display:block;margin:-4px auto 2px}',
 '.lvVeil .lvHint{font-size:14px;opacity:.85;margin-top:-2px}',
 '.lvDemo{position:absolute;left:50%;top:6px;transform:translateX(-50%);z-index:3;background:rgba(255,250,240,.95);color:#3a2410;border:2px solid #3a2410;border-radius:14px;padding:6px 14px;font:800 15px/1.2 var(--f,system-ui);white-space:nowrap;pointer-events:none}',
 '@media (prefers-reduced-motion:reduce){.lvPop{animation-duration:.01s}.lvBub.pop{animation:none}}',
 '@media (min-width:700px){.lvPh{width:62px;height:62px}.lvBub{font-size:16px}}',
 '@media (max-height:560px){.lvPh{width:40px;height:40px}.lvBub{font-size:13px;min-height:0}.lvFoot .btn{min-height:48px}}'
 ].join('\n');document.head.appendChild(s);}
function calm(o){if(o&&o.calm)return true;try{return W.matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}}
function pc(){try{return typeof mgPC==='function'?mgPC():W.matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
var SNDM={tap:'click',bad:'leak',ok:'coin',good:'star'};function snd(k){try{k=SNDM[k]||k;if(typeof SND!=='undefined'&&typeof SND[k]==='function')SND[k]();}catch(e){}}
function buzz(ms){try{if(navigator.vibrate&&!(typeof S!=='undefined'&&S.vib===0))navigator.vibrate(ms);}catch(e){}}
function pick(a,R){return a[Math.floor((R||Math.random)()*a.length)%a.length];}
function tier(s,c){return s>=c[2]?3:s>=c[1]?2:s>=c[0]?1:0;}
function font(px,w){return (w||900)+' '+Math.round(px)+'px '+(typeof CVL!=='undefined'&&CVL&&CVL.font?CVL.font:'"BgF",system-ui,sans-serif');}
function text(c,s,x,y,px,o){o=o||{};c.font=font(px,o.w);if(o.mw){var mw=c.measureText(s).width;if(mw>o.mw){px=px*o.mw/mw;c.font=font(px,o.w);}}
  c.textAlign=o.al||'center';c.textBaseline=o.bl||'middle';c.lineJoin='round';if(o.ol!==false){c.lineWidth=o.lw||Math.max(3,px*.2);c.strokeStyle=o.olc||'#3a2410';c.strokeText(s,x,y);}
  c.fillStyle=o.col||'#fff6dc';c.fillText(s,x,y);}
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
/* рисунки art.js на холсте игры: кэш по ключу и размеру (шаг 8 px), холст по настоящим границам рисунка */
var SPC={};
function spr(key,px,d){var a=typeof artGet==='function'?artGet(key):null;if(!a)return null;var q=Math.max(16,Math.ceil(px*d/8)*8),id=key+'@'+q,s=SPC[id];if(s)return s;
  var b=artBox(key),k=q/a.size;return SPC[id]={c:drawArtK(key,k,b),b:b,s:a.size};}
function put(c,key,x,y,sz,o,d){var s=spr(key,sz,d||1);if(!s)return;o=o||{};var f=sz/s.s,b=s.b;c.save();c.translate(x,y);if(o.rot)c.rotate(o.rot);c.scale((o.fx||1)*(o.sx||1),o.sy||1);
  if(o.a!=null)c.globalAlpha*=Math.max(0,Math.min(1,o.a));c.drawImage(s.c,b.x0*f,b.y0*f,b.w*f,b.h*f);c.restore();}
function face(key){try{return typeof ic==='function'?ic(key,96):'';}catch(e){return '';}}
/* палец показа: x,y — кончик; on — «нажал» */
function finger(c,x,y,on,t){c.save();c.translate(x,y+(on?4:-6+Math.sin(t*6)*2));c.font='44px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';c.textAlign='center';c.textBaseline='top';
  if(on){c.fillStyle='rgba(255,240,160,.55)';c.beginPath();c.arc(0,-2,22,0,7);c.fill();}c.fillText('👆',0,-4);c.restore();}
function pop(box,t,cls,cl){var d=document.createElement('div');d.className='lvPop'+(cls?' '+cls:'');d.textContent=t;box.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},cl?450:1000);}
function kc(t){return pc()?'<span class="lvKc">'+t+'</span>':'';}
function seen(id){try{return (localStorage.getItem(DEMO_K)||'').split(',').indexOf(id)>=0;}catch(e){return !!ses['d'+id];}}
function seenSet(id){ses['d'+id]=1;try{var a=(localStorage.getItem(DEMO_K)||'').split(',').filter(Boolean);if(a.indexOf(id)<0){a.push(id);localStorage.setItem(DEMO_K,a.join(','));}}catch(e){}}
/* итог: оболочка избы (договор IZBA) или старое окно итогов */
function finish(host,r){var lab=r.label||'';
  try{if(W.OBREC&&typeof OBREC.finish==='function')return OBREC.finish(host,{sc:r.score,st:r.tier,label:lab,why:r.why||''});}catch(e){console.error(e);}
  host.done({score:r.score,tier:r.tier,extra:{label:lab,lbl:r.word||'',why:r.why||'',lov:1}});}

/* ---------- общий ход партии ---------- */
function run(host,o,G){css();var rnd=o.rnd||Math.random,cl=calm(o),PC=pc();
  var el=document.createElement('div');el.className='lvFr';
  el.innerHTML='<div class="lvTop"><div class="lvPh"><img alt=""></div><div class="lvBub"><b></b><span></span></div></div><div class="lvInf"></div><div class="lvMain"></div><div class="lvFoot"></div>';
  host.el.appendChild(el);el.addEventListener('contextmenu',function(e){e.preventDefault();});
  var q=function(s){return el.querySelector(s);},main=q('.lvMain'),foot=q('.lvFoot'),bub=q('.lvBub'),inf=q('.lvInf');
  var cv=document.createElement('canvas');main.appendChild(cv);var c=cv.getContext('2d'),D=1;
  var st={rnd:rnd,calm:cl,pc:PC,W:1,H:1,t:0,sc:0,warm:G.warm||0,lives:G.lives||1,demo:false,live:false,over:'',err:'',id:G.id,o:o};
  var inp={press:false,hold:false,tap:null,dir:null,rel:false},held=0,fin=false,contUsed=false,stop=false,lastT=0,raf=0,demoT=0,demoOn=false,fx=0,fy=0,fon=false,lastSay='';
  function fit(){var w=main.clientWidth||1,h=main.clientHeight||1,d=Math.min(2,W.devicePixelRatio||1);if(w===st.W&&h===st.H&&d===D&&cv.width>1)return;
    st.W=w;st.H=h;D=d;st.dpr=d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';if(G.resize)try{G.resize(st);}catch(e){console.error(e);}}
  function say(t,m,who,nm){if(!t||t===lastSay&&!who)return;lastSay=t;var img=q('.lvPh img'),k=who||G.who;if(img.getAttribute('data-k')!==k){img.src=face(k);img.setAttribute('data-k',k);}
    q('.lvBub b').textContent=nm||G.nm||'';q('.lvBub span').innerHTML=t;if(!cl){bub.classList.remove('pop');void bub.offsetWidth;bub.classList.add('pop');}}
  st.msg=function(t,m){say(t,m);};st.pop=function(t,k){pop(main,t,k,cl);};st.snd=snd;st.buzz=buzz;st.put=function(k,x,y,sz,op){put(c,k,x,y,sz,op,D);};st.text=function(s,x,y,px,op){text(c,s,x,y,px,op);};st.rr=function(x,y,w,h,r){rr(c,x,y,w,h,r);};
  function info(){var b=0;try{b=W.OBREC&&OBREC.best?OBREC.best(G.id):(typeof DZ==='function'&&G.num?(DZ().b[G.num]|0):0);}catch(e){}
    var h='<span>'+(G.icoTxt||'★')+' '+st.sc+'</span>'+(b?'<span>'+L('Рекорд: ','Best: ')+b+'</span>':'')+(G.lives&&st.live?'<span>'+(st.lives>0?new Array(st.lives+1).join('❤'):'')+'</span>':'')+(st.live&&st.warm>0&&!st.demo?'<span class="w">'+L('Разминка','Warm-up')+'</span>':'')+(G.info?G.info(st):'');
    if(inf.innerHTML!==h)inf.innerHTML=h;}
  st.info=info;
  /* ввод: нажатие по полю/кнопке, Пробел/Enter/↑ — «жми», стрелки — направление */
  var btn=null;if(G.btn){btn=document.createElement('button');btn.type='button';btn.className='btn big';btn.innerHTML=G.btn.t+kc(G.btn.k||L('Пробел','Space'));foot.appendChild(btn);}
  function down(x,y){if(fin||stop||st.demo||host.paused||el.querySelector('.lvVeil'))return;inp.press=true;inp.hold=true;held=1;if(x!=null)inp.tap={x:x,y:y};if(btn)btn.classList.add('on');}
  function up(){if(!held)return;held=0;inp.hold=false;inp.rel=true;inp.drag=null;if(btn)btn.classList.remove('on');}
  function pdown(e){if(e.button>0)return;e.preventDefault();var r=cv.getBoundingClientRect();down(e.target===cv?e.clientX-r.left:null,e.target===cv?e.clientY-r.top:null);
    if(G.drag&&e.target===cv)inp.drag={x:e.clientX-r.left,y:e.clientY-r.top};}
  /* свайп (G.swipe): нажатие отдаётся при отпускании, если пальцем не провели; провёл ≥24 px — направление inp.dir */
  var sw=null;
  function sdown(e){if(e.button>0||fin||stop||st.demo||host.paused||el.querySelector('.lvVeil'))return;e.preventDefault();var r=cv.getBoundingClientRect();sw={x:e.clientX-r.left,y:e.clientY-r.top,d:0};}
  function smove(e){if(!sw||sw.d)return;var r=cv.getBoundingClientRect(),dx=e.clientX-r.left-sw.x,dy=e.clientY-r.top-sw.y;if(dx*dx+dy*dy<576)return;sw.d=1;inp.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U');}
  function sup(){if(!sw)return;if(!sw.d){inp.press=true;inp.tap={x:sw.x,y:sw.y};}sw=null;}
  if(G.swipe){main.addEventListener('pointerdown',sdown);main.addEventListener('pointermove',smove);W.addEventListener('pointerup',sup);W.addEventListener('pointercancel',function(){sw=null;});}
  function pmove(e){if(!G.drag||!held)return;var r=cv.getBoundingClientRect();inp.drag={x:e.clientX-r.left,y:e.clientY-r.top};}
  if(!G.swipe)main.addEventListener('pointerdown',pdown);if(btn)btn.addEventListener('pointerdown',pdown);
  main.addEventListener('pointermove',pmove);W.addEventListener('pointerup',up);W.addEventListener('pointercancel',up);
  var DIR={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D',a:'L',d:'R',w:'U',s:'D',A:'L',D:'R',W:'U',S:'D','ф':'L','в':'R','ц':'U','ы':'D','Ф':'L','В':'R','Ц':'U','Ы':'D'};
  var keyHeld={};
  function kd(e){if(!MG.cur||MG.cur.host!==host||host.paused||(host.root&&host.root.querySelector('.mgVeil')))return;var k=e.key,v=el.querySelector('.lvVeil');
    if(v){if(k==='Enter'||k===' '){var b=v.querySelector('.btn');if(b){e.preventDefault();b.click();}}return;}
    if(G.keys&&G.keys[k]!=null){e.preventDefault();if(e.repeat)return;inp.key=G.keys[k];down(null,null);keyHeld[k]=1;return;}
    var d=DIR[k];if(d&&G.dirs){e.preventDefault();if(!e.repeat&&!fin&&!st.demo)inp.dir=d;return;}
    if(k===' '||k==='Enter'||k==='ArrowUp'){e.preventDefault();if(e.repeat)return;keyHeld[k]=1;down(null,null);}}
  function ku(e){if(keyHeld[e.key]){delete keyHeld[e.key];up();}}
  W.addEventListener('keydown',kd);W.addEventListener('keyup',ku);
  function blur(){keyHeld={};up();}W.addEventListener('blur',blur);
  /* кадры */
  function frame(ts){if(stop)return;raf=requestAnimationFrame(frame);var dt=lastT?Math.min(.05,(ts-lastT)/1000):0;lastT=ts;fit();
    if(host.paused){if(held)up();draw();return;}
    try{if(typeof STAT!=='undefined'&&STAT.frame)STAT.frame();}catch(e){}
    st.t+=dt;
    if(st.demo){demoT+=dt;var di={press:false,hold:false,tap:null,dir:null,rel:false};fon=!!(G.bot&&G.bot(st,di));
      var fp=G.finger?G.finger(st):null;if(fp){fx=fp.x;fy=fp.y;}else{fx=st.W/2;fy=st.H-40;}
      G.step(st,dt,di);if(st.err){st.err='';if(G.forgive)G.forgive(st);}if(st.over){st.over='';if(G.revive)G.revive(st);}
      if(demoT>3.6)demoEnd();}
    else if(st.live&&!fin){G.step(st,dt,inp);inp.press=false;inp.tap=null;inp.dir=null;inp.rel=false;inp.key=null;
      if(st.err){var why=st.err;st.err='';if(st.warm<=0&&st.lives>1){st.lives--;if(G.lose)G.lose(st,why);say((G.say&&G.say.bad&&G.say.bad[why])||'','sad');pop(main,'−❤','bad',cl);snd('bad');buzz(40);}
        else if(st.warm>0){st.warm--;if(G.forgive)G.forgive(st,why);say(((G.say&&G.say.bad&&G.say.bad[why])||'')+' '+pick(G.say&&G.say.warm||[L('Не беда — это разминка!','No worries — just a warm-up!')],rnd),'norm');pop(main,L('Разминка','Warm-up'),'',cl);
          if(st.warm===0)setTimeout(function(){if(!fin)say(L('Разминка кончилась — теперь всё всерьёз!','Warm-up over — now it counts!'),'norm');},1400);}
        else st.over=why;info();}
      if(st.over)crash(st.over);}
    if(st.scChanged||G.info&&st.live&&(st.t*4|0)!==st.it4){st.scChanged=0;st.it4=st.t*4|0;info();}
    draw();}
  function draw(){c.setTransform(D,0,0,D,0,0);try{G.draw(st,c);}catch(e){console.error(e);stop=true;}
    if(st.demo)finger(c,fx,fy,fon,st.t);}
  /* начало: вступление (первый раз в сеансе), показ с пальцем (первый раз вообще) */
  function veil(h,bt,fn,b2,fn2){var v=document.createElement('div');v.className='lvVeil';v.innerHTML='<div class="panel">'+h+'<button class="btn big" type="button">'+bt+kc('Enter')+'</button>'+(b2?'<button class="btn ghost" type="button">'+b2+'</button>':'')+'</div>';
    main.appendChild(v);var bs=v.querySelectorAll('.btn');bs[0].onclick=function(){snd('click');v.remove();fn();};if(bs[1])bs[1].onclick=function(){snd('click');v.remove();fn2();};return v;}
  function intro(){var hint=PC?G.hint.pc:G.hint.ph;
    veil('<img class="lvIc" src="'+face(G.icon||G.who)+'" alt=""><h3>'+G.title+'</h3><p>'+G.rule+'</p><p class="lvHint">'+hint+'</p>',L('Начать!','Start!'),go,seen(G.id)?L('👆 Показать, как играть','👆 Show me how'):'',demo);}
  function demo(){st.demo=true;demoT=0;st.sc=0;G.init(st);fit();if(G.resize)G.resize(st);say(G.rule,'happy');
    var d=document.createElement('div');d.className='lvDemo';d.textContent=L('Показ: смотри на палец 👆','Demo: watch the finger 👆');main.appendChild(d);st.demoEl=d;}
  function demoEnd(){st.demo=false;seenSet(G.id);if(st.demoEl)st.demoEl.remove();
    veil('<h3>'+L('Теперь ты!','Your turn!')+'</h3><p>'+(PC?G.hint.pc:G.hint.ph)+'</p>'+(G.warm0?'<p class="lvHint">'+L('Первые '+G.warm0+' ошибки — разминка, не считаются.','The first '+G.warm0+' mistakes are a warm-up and don’t count.')+'</p>':''),L('Начать!','Start!'),go,L('👆 Ещё раз показать','👆 Show again'),demo);}
  function go(){st.demo=false;st.sc=0;st.warm=G.warm0!=null?G.warm0:G.warm||0;st.lives=G.lives||1;st.over='';st.err='';G.init(st);fit();if(G.resize)G.resize(st);st.live=true;ses['p'+G.id]=(ses['p'+G.id]|0)+1;
    say(pick(G.say.start,rnd),'happy');info();}
  /* сбой: «Продолжить с того же места» за ролик — раз за партию */
  function crash(why){if(fin)return;st.live=false;var t=(G.say&&G.say.bad&&G.say.bad[why])||'';if(why==='time'){if(t)say(t,'happy');snd('win');setTimeout(function(){end(why);},cl?300:900);return;}if(t)say(t,'sad');snd('bad');buzz(60);
    setTimeout(function(){if(fin)return;var ok=false;try{ok=!contUsed&&host.adOk()&&st.sc>0&&G.revive;}catch(e){}
      if(!ok){end(why);return;}contUsed=true;
      veil('<h3>'+L('Эх, сбился!','Oops!')+'</h3><p>'+(t||'')+'</p><p class="lvHint">'+L('Продолжить с того же места? Счёт сохранится.','Continue from here? Your score stays.')+'</p>',
        '🎬 '+L('Продолжить за рекламу','Continue for an ad'),function(){host.ad('cont').then(function(ok2){if(ok2&&!fin){try{STAT.ev('mg',{a:'cont',id:G.id});}catch(e){}st.over='';G.revive(st);st.live=true;say(L('Ну, с того же места!','Right, from where we left off!'),'happy');}else end(why);});},
        L('Нет, к итогам','No, finish'),function(){end(why);});},cl?300:900);}
  function end(why){if(fin)return;fin=true;var sc=Math.max(0,Math.round(st.sc)),tr=tier(sc,G.cut),lab=G.label?G.label(st):pl(sc,G.unit);
    var w=(G.say&&G.say.bad&&G.say.bad[why])||'';cleanup();finish(host,{score:sc,tier:tr,label:lab,why:w,word:pl(sc,G.unit).replace(/^\d+ /,'')});}
  function cleanup(){stop=true;cancelAnimationFrame(raf);W.removeEventListener('keydown',kd);W.removeEventListener('keyup',ku);W.removeEventListener('blur',blur);W.removeEventListener('pointerup',up);W.removeEventListener('pointerup',sup);W.removeEventListener('pointercancel',up);}
  host.onQuit(cleanup);
  st.end=function(why){st.over=why||'time';};
  /* тест и бот баланса: window.__lvb — состояние партии */
  W.__lvb={st:st,G:G,go:go,end:end,demo:demo,inp:inp,say:say};
  /* оболочка IZBA: «Ещё разок» (opt.fast) — сразу в игру; первая партия (n[num]=0) — показ с пальцем; разминка — только в первых 3 партиях */
  var op=MG.cur&&MG.cur.opt||{},plays=0;try{plays=G.num&&typeof DZ==='function'?DZ().n[G.num]|0:0;}catch(e){}
  if(plays>=3)G.warm0=0;else G.warm0=G.warm||0;
  fit();G.init(st);say(G.say.hello||pick(G.say.start,rnd),'happy');info();raf=requestAnimationFrame(frame);
  if(op.fast||ses['p'+G.id]&&!G.alwaysIntro){go();}
  else if(!plays&&!seen(G.id)){demo();}else intro();}

/* регистрация игры: id, num, имя, значок; run — LVB.run; sim — бот баланса (для mgBot) */
function reg(G){if(typeof MG_REG!=='function')return;var g=MG.by[G.id];
  if(!g){g={id:G.id,num:G.num,n:G.n,icon:G.icon,kind:'lov',lov:1};g.run=function(host,o){run(host,o,G);};MG_REG(g);}
  g.run2=function(host,o){run(host,o,G);};g.cut=G.cut;g.G=G;
  if(G.sim)g.sim=function(o,k){var r=G.sim(o,k);return {score:r.sc,tier:tier(r.sc,G.cut)};};}
W.LVB={run:run,reg:reg,tier:tier,pick:pick,text:text,rr:rr,put:put,spr:spr,finger:finger,pl:pl,L:L,pc:pc,calm:calm,font:font,finish:finish,seen:seen};
})();
