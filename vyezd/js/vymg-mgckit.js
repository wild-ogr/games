'use strict';
/* vy-mgc — общий набор мини-игр потока MGC (Найди поломку, Заправка, Угадай машину, Парковка задним). Подключать ПОСЛЕ js/vymg-core.js и ДО js/vymg-<id>.js потока MGC.
   Наружу — только window.VYC (префикс CSS — vyc-). Оболочку (шапка, итоги, награды, STAT) не трогает: игры зовут host.done().
   VYC.frame(host,o,{who,title}) → {top,main,foot,say(text,mood),prog(n,i,res),cv()} — раскладка «ведущий сверху · поле · кнопки снизу»;
   VYC.canvas(box) → {cv,ctx,w,h,dpr,fit()} — холст во весь box с учётом retina; VYC.loop(host,fn(dt,t)) — кадр (стоит на паузе оболочки);
   VYC.keys(host,fn(key,e,down)) — клавиши ПК; VYC.face(who,mood) — портрет общего героя (tolik|mityai|mihalych|shura|valerka);
   VYC.dir(key) → L|R|U|D; VYC.near(items,cur,d) — сосед по стрелке; VYC.optKeys(box,key) — цифры/стрелки/Enter по кнопкам box;
   VYC.snd(host,k) — звук (tap/right/wrong/coin/win/pick/horn/crash/go); VYC.tier(score,[c1,c2,c3]); VYC.pick(arr,R); VYC.shuffle(arr,R). */
(function(){
if(window.VYC)return;
var W=window;
/* ---------- портреты общих героев ----------
   Сначала — общий набор ART (js/art-people.js), потом host.face оболочки; запасной облик — копии кода из игр:
   Толик «Карбюратор» — holdem LOOK.tolik (headSvg), Михалыч и дед Митяй — viktorina js/look.js (bustInner), баба Шура — vyezd shuraSvg. Ничего не перерисовано. */
var pv=0;
function eyes(m){return m==='happy'?'<path d="M75 96 q8 -8 16 0 M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="83" cy="95" r="5.4" fill="#3a2a22"/><circle cx="117" cy="95" r="5.4" fill="#3a2a22"/><circle cx="84.5" cy="93.5" r="1.6" fill="#fff"/><circle cx="118.5" cy="93.5" r="1.6" fill="#fff"/>'
  :'<ellipse cx="83" cy="96" rx="4" ry="4.6" fill="#3a2a22"/><ellipse cx="117" cy="96" rx="4" ry="4.6" fill="#3a2a22"/><circle cx="84.3" cy="94.4" r="1.3" fill="#fff"/><circle cx="118.3" cy="94.4" r="1.3" fill="#fff"/>';}
function brows(m,c){return m==='sad'?'<path d="M72 80 q10 -2 18 5 M128 80 q-10 -2 -18 5" stroke="'+c+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<path d="M72 77 q10 -7 20 -1 M108 76 q10 -6 20 1" stroke="'+c+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :'<path d="M72 83 q10 -5 20 0 M108 83 q10 -5 20 0" stroke="'+c+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>';}
function mouth(m,c){c=c||'#b83b44';return m==='wow'?'<ellipse cx="100" cy="127" rx="7" ry="8" fill="'+c+'"/>'
  :m==='sad'?'<path d="M88 130 q12 -9 24 0" stroke="'+c+'" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='happy'?'<path d="M84 119 q16 19 32 0 q-16 6 -32 0z" fill="'+c+'"/><path d="M89 123 q11 6 22 0" fill="#fff" opacity=".9"/>'
  :'<path d="M86 121 q14 13 28 0" stroke="'+c+'" stroke-width="4.2" fill="none" stroke-linecap="round"/>';}
var TOLIK={bg:'#e3e9f2',body:'#2c5aa0',bodyX:'<path d="M72 150 v50 M128 150 v50" stroke="#1d3f73" stroke-width="8"/><circle cx="72" cy="172" r="4" fill="#f5b72d"/><circle cx="128" cy="172" r="4" fill="#f5b72d"/>',
  hat:'<path d="M50 74 q4 -44 52 -46 q46 2 50 40 q-50 -8 -102 6z" fill="#6b6f76"/><path d="M50 74 q50 -14 102 -6 q18 4 22 12 q-62 -10 -124 -6z" fill="#565a61"/><circle cx="102" cy="30" r="4" fill="#565a61"/>',
  face:'<path d="M76 116 q12 -8 24 -2 q12 -6 24 2 q-6 10 -24 6 q-18 4 -24 -6z" fill="#5b3a29"/><path d="M60 104 l8 2" stroke="#555" stroke-width="3" opacity=".5"/>',brow:'#5b3a29'};
function tolik(m){var o=TOLIK,u='vyc'+(++pv),sk='#f5c9a8',sk2='#e9ae88';
  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="f'+u+'" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="'+sk+'"/></radialGradient></defs>'+
  '<rect width="200" height="200" fill="'+o.bg+'"/><path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="'+o.body+'"/>'+o.bodyX+
  '<rect x="88" y="128" width="24" height="22" rx="8" fill="'+sk2+'"/><circle cx="53" cy="104" r="8" fill="'+sk+'"/><circle cx="147" cy="104" r="8" fill="'+sk+'"/>'+
  '<ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#f'+u+')"/><ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/>'+
  brows(m,o.brow)+eyes(m)+'<path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="'+sk2+'" stroke-width="3" fill="none" stroke-linecap="round"/>'+mouth(m)+o.face+o.hat+'</svg>';}
var BUST={
 mihalych:{old:1,body:'#5d6b7c',brow:'#9a9a9a',bg:'#e6eadf',
  bodyX:'<path d="M56 158 l24 -6 l20 30 l20 -30 l24 6 q30 8 38 34 v28 H18 v-28 q8 -26 38 -34z" fill="#ff8a1f"/><path d="M20 196 h160" stroke="#f4f6f4" stroke-width="12"/><path d="M80 152 l20 30 l20 -30" fill="#39485a"/>',
  hat:'<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#6f5136"/><path d="M42 82 q58 -22 116 0 v14 q-58 -20 -116 0z" fill="#9b7650"/><path d="M42 84 q-12 30 0 52 q10 -4 13 -18 q-5 -16 -3 -32z M158 84 q12 30 0 52 q-10 -4 -13 -18 q5 -16 3 -32z" fill="#9b7650"/>',
  under:'<path d="M70 128 q14 -10 30 -3 q16 -7 30 3 q-6 14 -30 9 q-24 5 -30 -9z" fill="#c9cdd2"/>'},
 mityai:{old:1,body:'#fff',brow:'#c2c6cd',bg:'#e2edf3',
  hair:'<path d="M50 104 q-6 -24 8 -36 q-2 18 5 30z M150 104 q6 -24 -8 -36 q2 18 -5 30z" fill="#d9dde3"/>',
  bodyX:'<g stroke="#1f4f9a" stroke-width="8"><path d="M40 176 h120 M24 194 h152 M18 212 h164"/></g>',
  face:'<path d="M68 142 q32 18 64 0" stroke="#c4c4c4" stroke-width="2.4" fill="none" stroke-dasharray="2 5"/><circle cx="101" cy="118" r="8" fill="#e8826f" opacity=".55"/>'},
 valerka:{body:'#2f9e44',brow:'#6b4420',skin:'#f6cfae',bg:'#e5eef8',
  hair:'<path d="M52 96 q-6 -44 46 -50 q52 2 52 48 q-10 -22 -26 -20 q-10 -12 -24 -6 q-14 -10 -30 2 q-12 4 -18 26z" fill="#8a5a2b"/>',
  hat:'<path d="M50 76 q2 -44 50 -46 q48 2 50 46 q-50 -14 -100 0z" fill="#1c6fb8"/><path d="M100 64 q38 -6 68 10 q-4 9 -18 9 q-24 -9 -50 -7z" fill="#155a96"/>',
  bodyX:'<path d="M80 152 l20 22 l20 -22" fill="#fff"/>'}};
function bust(id,m){var o=BUST[id],sk=o.skin||'#eebf99',sk2='#dba27c',brow=o.brow;
 var ey=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/><circle cx="83" cy="101" r="1.8" fill="#fff"/><circle cx="121" cy="101" r="1.8" fill="#fff"/>'
  :'<ellipse cx="81" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><circle cx="82.5" cy="101.5" r="1.4" fill="#fff"/><circle cx="120.5" cy="101.5" r="1.4" fill="#fff"/>';
 var br=m==='sad'?'<path d="M68 90 q10 -5 22 2 M132 90 q-10 -5 -22 2" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
  :m==='happy'||m==='wow'?'<path d="M67 86 q11 -9 23 -3 M133 86 q-11 -9 -23 -3" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
  :'<path d="M68 90 q11 -6 22 -2 M132 90 q-11 -6 -22 -2" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>';
 var mo=m==='happy'?'<path d="M82 132 q18 20 36 0 q-18 5 -36 0z" fill="#8f2f35"/><path d="M87 134.5 q13 5 26 0 l-2 3 q-11 4 -22 0z" fill="#fff"/>'
  :m==='sad'?'<path d="M88 140 q12 -9 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<ellipse cx="100" cy="137" rx="8" ry="9" fill="#8f2f35"/>'
  :'<path d="M86 133 q14 11 28 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
 return '<svg viewBox="20 20 160 160" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="200" height="220" fill="'+o.bg+'"/><path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="'+o.body+'"/>'+(o.bodyX||'')+
  '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'"/><ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'"/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'"/>'+
  '<path d="M52 92 q0 -48 48 -48 q48 0 48 48 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'"/>'+(o.hair||'')+
  '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
  (o.old?'<path d="M64 112 q5 3 10 2 M136 112 q-5 3 -10 2 M80 76 q20 -5 40 0" stroke="'+sk2+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'')+
  br+ey+'<path d="M100 104 q-9 18 -3 22 q5 3 11 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".9"/>'+(o.under||'')+mo+(o.face||'')+(o.hat||'')+'</svg>';}
function face(id,m,host){m=m||'norm';
  try{if(host&&typeof host.face==='function'){var h=host.face(id,m);if(h)return h;}}catch(e){}
  try{var A=W.VYPPL;if(A&&typeof A.svg==='function'){var s=A.svg(id,m);if(s)return s;}}catch(e){}
  if(id==='tolik')return tolik(m);if(BUST[id])return bust(id,m);
  if(id==='shura'&&typeof W.shuraSvg==='function')return W.shuraSvg(m==='sad'?'sad':'');
  return tolik(m);}
var NAME={tolik:'Толик',mityai:'Дед Митяй',mihalych:'Михалыч',shura:'Баба Шура',valerka:'Валерка'},NAME_EN={tolik:'Tolik',mityai:'Grandpa Mityai',mihalych:'Mikhalych',shura:'Granny Shura',valerka:'Valerka'};
/* язык игры: L(рус, англ) — как в index.html (VK — всегда русский) */
function en(){try{return typeof LANG!=='undefined'&&LANG==='en';}catch(e){return false;}}
function Lg(ru,eng){return en()&&eng!=null?eng:ru;}
/* машина по-русски/по-английски: VYCARS.nm (ART), иначе поле name/full */
function carName(c,full){try{if(window.VYCARS&&typeof VYCARS.nm==='function'){var r=VYCARS.nm(c,full);if(r)return r;}}catch(e){}return c?(full?c.full||c.name:c.name):'';}

/* ---------- стили (свои, префикс vyc-) ---------- */
function css(){if(document.getElementById('vyc-css'))return;var s=document.createElement('style');s.id='vyc-css';s.textContent=[
 '.vyc-fr{position:absolute;inset:0;display:flex;flex-direction:column;font-family:Rubik,-apple-system,"Segoe UI",Roboto,sans-serif;color:#2d3436;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none}',
 '.vyc-top{display:flex;align-items:flex-end;gap:8px;padding:6px 10px 4px;flex:none;max-width:760px;width:100%;box-sizing:border-box;margin:0 auto}',
 '.vyc-ph{flex:none;width:56px;height:56px;border-radius:16px;overflow:hidden;box-shadow:0 0 0 3px #fff,0 3px 8px rgba(0,0,0,.18);background:#eee}',
 '.vyc-ph svg{width:100%;height:100%;display:block}',
 '.vyc-bub{position:relative;flex:1;min-height:40px;background:#fffdf7;border-radius:16px;padding:7px 12px;font-size:15px;line-height:1.3;box-shadow:0 2px 0 #e2dccb,0 4px 10px rgba(0,0,0,.08)}',
 '.vyc-bub:before{content:"";position:absolute;left:-7px;bottom:12px;border:7px solid transparent;border-right-color:#fffdf7;border-left:0}',
 '.vyc-bub b.vyc-who{display:block;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#1d3f73;font-weight:800}',
 '.vyc-bub.pop{animation:vycPop .28s ease-out}@keyframes vycPop{0%{transform:scale(.96)}60%{transform:scale(1.02)}100%{transform:none}}',
 '.vyc-prog{display:flex;gap:5px;justify-content:center;padding:2px 0 4px;flex:none}',
 '.vyc-prog i{width:10px;height:10px;border-radius:50%;background:rgba(0,0,0,.14)}.vyc-prog i.cur{background:#ff7a45;box-shadow:0 0 0 3px rgba(255,122,69,.3)}',
 '.vyc-prog i.p3{background:#2b8a3e}.vyc-prog i.p2{background:#74b816}.vyc-prog i.p1{background:#f2a900}.vyc-prog i.p0{background:#e03131}',
 '.vyc-main{position:relative;flex:1;min-height:0;overflow:hidden}',
 '.vyc-main canvas{position:absolute;left:0;top:0;display:block;touch-action:none}',
 '.vyc-foot{flex:none;display:flex;gap:8px;justify-content:center;flex-wrap:nowrap;padding:6px 10px calc(8px + env(safe-area-inset-bottom));max-width:760px;width:100%;box-sizing:border-box;margin:0 auto}',
 '.vyc-b{min-height:56px;min-width:56px;border:0;border-radius:16px;padding:10px 16px;font-size:17px;line-height:1.1;font-weight:700;font-family:inherit;cursor:pointer;transition:transform .08s;touch-action:manipulation}',
 '.vyc-b:not(.green){color:#2d3436;background:#fff;box-shadow:0 4px 0 #c7c1b0,0 6px 14px rgba(0,0,0,.12)}',
 '.vyc-b:active,.vyc-b.on{transform:translateY(3px)}',
 '.vyc-b[disabled]{opacity:.45;pointer-events:none}',
 '.vyc-b.ok{background:#d3f9d8!important;box-shadow:0 4px 0 #2b8a3e!important}.vyc-b.no{background:#ffe3e3!important;box-shadow:0 4px 0 #e03131!important}',
 '.vyc-b small{display:block;font-weight:500;font-size:12px;opacity:.75;margin-top:2px}',
 '.vyc-kc{display:inline-block;font:600 11px/1 inherit;font-family:inherit;border:1px solid currentColor;border-radius:5px;padding:2px 4px;margin-left:6px;opacity:.6;vertical-align:middle}',
 '.vyc-b.kf{outline:3px solid #ff7a45;outline-offset:2px}',
 '.vyc-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}',
 '.vyc-opts .vyc-b{font-size:16px;padding:8px 10px}',
 '.vyc-hint{font-size:12px;opacity:.6;text-align:center;width:100%}',
 '@media (min-width:700px){.vyc-ph{width:72px;height:72px}.vyc-bub{font-size:17px}}'
 ].join('\n');document.head.appendChild(s);}

/* ---------- раскладка ---------- */
function frame(host,o,opt){css();opt=opt||{};var who=opt.who||'tolik';
  var el=document.createElement('div');el.className='vyc-fr';
  el.innerHTML='<div class="vyc-top"><div class="vyc-ph"></div><div class="vyc-bub"><b class="vyc-who"></b><span class="vyc-tx"></span></div></div><div class="vyc-prog"></div><div class="vyc-main"></div><div class="vyc-foot"></div>';
  var st=getComputedStyle(host.el);if(st.position==='static')host.el.style.position='relative';
  host.el.appendChild(el);el.addEventListener('contextmenu',function(e){e.preventDefault();});
  var q=function(s){return el.querySelector(s);};var lastM='',lastW='';
  var f={el:el,top:q('.vyc-top'),main:q('.vyc-main'),foot:q('.vyc-foot'),progEl:q('.vyc-prog'),
   say:function(text,mood,w){w=w||who;mood=mood||'norm';var ph=q('.vyc-ph');if(lastM!==mood||lastW!==w){ph.innerHTML=face(w,mood,host);lastM=mood;lastW=w;}
     q('.vyc-who').textContent=(en()?NAME_EN[w]:NAME[w])||'';var b=q('.vyc-bub'),t=q('.vyc-tx');if(t.innerHTML===text)return;t.innerHTML=text;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');},
   prog:function(n,i,res){var h='';for(var k=0;k<n;k++){var r=res&&res[k];h+='<i class="'+(k===i?'cur':r!=null?'p'+r:'')+'"></i>';}f.progEl.innerHTML=h;f.progEl.style.display=n?'':'none';}};
  f.prog(0);return f;}
function canvas(box){var cv=document.createElement('canvas');box.appendChild(cv);var c={cv:cv,ctx:cv.getContext('2d'),w:1,h:1,dpr:1};
  c.fit=function(){var w=box.clientWidth||1,h=box.clientHeight||1,d=Math.min(2.5,W.devicePixelRatio||1);
    if(w===c.w&&h===c.h&&d===c.dpr&&cv.width)return false;c.w=w;c.h=h;c.dpr=d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';
    c.ctx.setTransform(d,0,0,d,0,0);return true;};
  c.fit();return c;}
/* кадр: fn(dt сек, t сек); пауза оболочки — время стоит; конец — host.onQuit или вызов stop() */
function loop(host,fn){if(typeof host.loop==='function'){var on=true;host.loop(function(dt,t){if(on)try{fn(dt,t);}catch(e){on=false;console.error(e);}});return function(){on=false;};}
  var run=true,last=0,t=0,id=0;
  function fr(ts){if(!run)return;id=requestAnimationFrame(fr);var dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;if(host.paused)return;t+=dt;try{fn(dt,t);}catch(e){run=false;console.error(e);}}
  id=requestAnimationFrame(fr);var stop=function(){run=false;cancelAnimationFrame(id);};onQuit(host,stop);return stop;}
var quits=[];
function onQuit(host,fn){if(typeof host.onQuit==='function')host.onQuit(fn);else{(host._vycQ=host._vycQ||[]).push(fn);}}
/* клавиши: fn(key,e,down) → true — съедена. Отпускание приходит с down=false (для «держи»). */
function keys(host,fn){if(typeof host.keys==='function'){host.keys(function(k,e){return fn(k,e,true);});if(typeof host.keysUp==='function')host.keysUp(function(k,e){return fn(k,e,false);});
    /* оболочка на паузе отпускания не передаёт — иначе зажатая до паузы стрелка «залипнет» (руль крутится сам) */
    var pu=function(e){if(host.paused)try{fn(e.key,e,false);}catch(x){}};W.addEventListener('keyup',pu,true);onQuit(host,function(){W.removeEventListener('keyup',pu,true);});return;}
  var dn=function(e){if(e.repeat&&(e.key===' '||e.key.indexOf('Arrow')===0)){e.preventDefault();return;}if(host.paused||e.key==='Escape')return;if(fn(e.key,e,true))e.preventDefault();},
  up=function(e){if(e.key==='Escape')return;if(fn(e.key,e,false))e.preventDefault();};
  W.addEventListener('keydown',dn);W.addEventListener('keyup',up);onQuit(host,function(){W.removeEventListener('keydown',dn);W.removeEventListener('keyup',up);});}
/* клавиши-стрелки: ←/→/↑/↓, WASD, ЦФЫВ (и заглавные) → 'L'|'R'|'U'|'D' */
var DIRS={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D',a:'L',d:'R',w:'U',s:'D',A:'L',D:'R',W:'U',S:'D','ф':'L','в':'R','ц':'U','ы':'D','Ф':'L','В':'R','Ц':'U','Ы':'D'};
function dir(k){return DIRS[k]||null;}
/* ближайший по направлению: items [{id,x,y}], cur — id или null, d — 'L'|'R'|'U'|'D'. Экран: y вниз. Нет кандидата — по кругу по порядку. */
function near(items,cur,d){if(!items.length)return null;var c=null;for(var i=0;i<items.length;i++)if(items[i].id===cur)c=items[i];if(!c)return items[0].id;
  var vx=d==='L'?-1:d==='R'?1:0,vy=d==='U'?-1:d==='D'?1:0,best=null,bs=1e9;
  items.forEach(function(it){if(it===c)return;var dx=it.x-c.x,dy=it.y-c.y,along=dx*vx+dy*vy;if(along<=.5)return;var across=Math.abs(dx*vy-dy*vx);if(across>along*2.2)return;var sc=along+across*2;if(sc<bs){bs=sc;best=it;}});
  if(best)return best.id;var k=items.indexOf(c),n=items.length;return items[(k+(vx+vy>0?1:n-1))%n].id;}
/* кнопки-варианты в box (.vyc-b по порядку): цифры 1–9 — нажать N-ю; стрелки/WASD — рамка .kf по кнопкам; Enter/Пробел — нажать выделенную.
   true — клавиша съедена. Enter без выделения — false (игра решает сама). */
function optKeys(box,k){if(!box)return false;var bs=[].slice.call(box.querySelectorAll('.vyc-b'));if(!bs.length)return false;
  if(/^[1-9]$/.test(k)){var b=bs[+k-1];if(!b)return false;if(!b.disabled)b.click();return true;}
  var en=bs.filter(function(b){return !b.disabled;}),cur=box.querySelector('.vyc-b.kf'),dr=dir(k);
  if(dr){if(!en.length)return true;var it=en.map(function(b,i){var r=b.getBoundingClientRect();return {id:i,x:r.left+r.width/2,y:r.top+r.height/2};});
    var ni=near(it,en.indexOf(cur)<0?null:en.indexOf(cur),dr);bs.forEach(function(b){b.classList.remove('kf');});if(ni!=null)en[ni].classList.add('kf');return true;}
  if((k==='Enter'||k===' ')&&cur&&!cur.disabled){cur.click();return true;}return false;}
function snd(host,k){try{var S=host.snd||W.SND;if(!S)return;var map={right:'coin',wrong:'honk2',pick:'tap',win:'win',crash:'crash',horn:'horn',go:'go',tap:'tap',coin:'coin',tow:'tow',step:'step'};
  var f=S[k]||S[map[k]];if(typeof f==='function')f.call(S,arguments[2]);}catch(e){}}
function buzz(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function tier(s,c){return s>=c[2]?3:s>=c[1]?2:s>=c[0]?1:0;}
function pick(a,R){return a[Math.floor((R||Math.random)()*a.length)%a.length];}
function shuffle(a,R){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor((R||Math.random)()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pc(host){if(host&&host.pc!=null)return !!host.pc;try{return W.matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function kc(t,host){return pc(host)?'<span class="vyc-kc">'+t+'</span>':'';}
function calm(o){if(o&&o.calm)return true;try{return W.matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}}
/* «одно нажатие до начала»: карточка оболочки host.intro, иначе сразу */
function intro(host,t,go){if(typeof host.intro==='function'){host.intro(t).then(go);}else go();}
function btn(txt,cls,fn){var b=document.createElement('button');b.type='button';cls=(cls||'').replace(/\b(acc|grn)\b/g,'green');b.className='btn vyc-b'+(cls?' '+cls:'');b.innerHTML=txt;if(fn)b.onclick=fn;return b;}
/* скруглённый прямоугольник */
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
W.VYC={L:Lg,en:en,carName:carName,intro:intro,frame:frame,canvas:canvas,loop:loop,keys:keys,onQuit:onQuit,face:face,NAME:NAME,snd:snd,buzz:buzz,tier:tier,pick:pick,shuffle:shuffle,pc:pc,kc:kc,dir:dir,near:near,optKeys:optKeys,calm:calm,btn:btn,rr:rr};
})();
