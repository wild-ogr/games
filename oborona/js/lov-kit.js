'use strict';
/* ob2-LOVA · набор ловкостных «на рекорд» (js/lov-kit.js → window.LOVK). Грузится ЛЕНИВО (OB2.need) при первом запуске ловкостной игры — на старт не влияет.
   Журнал — hobby-analytics/release-i/oborona-boost2/logs/LOVA.md. Основа — нажимаемые макеты preview/MG.html и игры Зины (Скакалка, Стопка, Компот, Парковка).
   LOVK.run(host,o,G) — партия внутри оболочки избы (MG_OPEN/host из js/mg-core.js). G — описание игры (файлы js/lov-*.js кладут его в LOVK.G[id]):
     {id, num, name:[ru,en], who:[ru,en], face:'ключ ART', unit:[[ru×3],[en×2]], lower — меньше = лучше (время), fmt(v) — как писать счёт,
      mid — счёт «середнячка» (соседи), medal:[бронза,серебро,золото], demoT — секунд показа, demoTxt/goTxt/warmTxt:[ru,en], buttons:[{k,t,kc}], make(sh)}.
   make(sh) → {reset(demo), press(down,key), step(dt), draw(ctx), bg(ctx,w,h), finger()→{x,y,down}|null, fingerBtn()→key|null}.
   sh: S {st:'demo'|'play'|'res', t, auto, score, best, pc, calm, k, w, h, rnd}, say(t), pop(t,bad), setScore(html), warm(on,t), end(score,why), put(key,x,y,px,opt), snd(name), L(ru,en), pl(n).
   Мир игры — 360×520, вписывается в поле. Показ с пальцем — пока игрок ни разу не играл (или кнопка «Как играть?»); разминка — первая партия захода.
   Подключение — договор IZBA, способ «В» (свой итог): полка «Удаль», флаги lov-<id> и запуск — IZBA (каталог CAT в js/ob2-izba-ui.js, r:1 грузит этот файл; LOVK.reg() → MG_REG).
   Рекорд — S.dzr.b[num] (у «меньше — лучше» хранится 99999−десятые), партии — S.dzr.n[num], награда дня — S.dzr.d.p[num] (1 трофей за первую партию дня, не тренировка),
   рекорд дня — S.dzr.d.p['r'+num] (+5 очков Дозорного). Новых полей сохранения нет. Соседи — IZR.rows(num) (как на доске IZBA), без IZBA — 4 воеводы TOUR_NB 0–3 от рекорда на начало захода.
   События: OB2.emit('mg',{id,sc,rec}) после каждой партии (БЕЗ num — IZBA досчитает Удаль дня, игрища, медали), OB2.emit('rec',{id,sc,pl}) — новый рекорд, pl — место среди соседей.
   STAT: mg {id,score(у Ступы — десятые с),tier:медаль,m:'lov',rec,n:№ партии захода,w:1 — разминка,src}, mg {a:'first',id}. */
(function(){if(window.LOVK)return;
var WW=360,WH=520;
function L(r,e){return typeof Lg==='function'?Lg(r,e):r;}
function pl(n,u){n=Math.abs(Math.round(n));if(typeof LANG!=='undefined'&&LANG==='en')return n===1?u[1][0]:u[1][1];var a=n%10,b=n%100;return u[0][(a===1&&b!==11)?0:(a>=2&&a<=4&&(b<10||b>=20))?1:2];}
function css(){if(document.getElementById('lvCss'))return;var s=document.createElement('style');s.id='lvCss';s.textContent=[
 '.lv-fr{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;background:#1b2238;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none;font-family:var(--f,system-ui)}',
 '.lv-top{flex:none;display:flex;align-items:flex-end;gap:8px;padding:calc(var(--st,0px) + 8px) 68px 4px 10px;max-width:800px;width:100%;box-sizing:border-box;margin:0 auto}',
 '.lv-ph{flex:none;width:54px;height:54px;border-radius:50%;background:radial-gradient(#fff6dc,#e9cf98);border:3px solid #6a4320;box-shadow:0 3px 0 rgba(0,0,0,.35);object-fit:contain;padding:2px;box-sizing:border-box}',
 '.lv-bub{position:relative;flex:1;min-width:0;min-height:40px;background:linear-gradient(#fff8e6,#f4e2b8);color:#3b2412;border:2px solid #8a5a2e;border-radius:16px 16px 16px 4px;padding:5px 11px;font-size:15px;line-height:1.28;font-weight:700;box-shadow:0 3px 0 rgba(0,0,0,.3)}',
 '.lv-bub b{display:block;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#9a3a1a;font-weight:900}',
 '.lv-bub.pop{animation:lvPop .28s ease-out}@keyframes lvPop{0%{transform:scale(.96)}60%{transform:scale(1.02)}100%{transform:none}}',
 '.lv-info{flex:none;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:2px 10px 4px;font-weight:900;font-size:15px;color:#3b2412}',
 '.lv-info span{background:linear-gradient(#fff0bf,#f3d27a);border:2px solid #b0760a;border-radius:12px;padding:2px 12px;white-space:nowrap}.lv-info span:empty{display:none}.lv-info small{font-size:12px;font-weight:700}',
 '.lv-fld{position:relative;flex:1;min-height:0;overflow:hidden}.lv-fld canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none}',
 '.lv-warm{position:absolute;left:50%;top:8px;transform:translateX(-50%);background:#2f7a1c;color:#fff;font-weight:900;font-size:14px;border-radius:12px;padding:3px 12px;box-shadow:0 2px 0 rgba(0,0,0,.3);pointer-events:none;white-space:nowrap}.lv-warm:empty{display:none}',
 '.lv-pop{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);font:900 30px/1.1 var(--f,system-ui);color:#ffe066;text-shadow:0 3px 0 #5a2e0a,0 0 12px rgba(0,0,0,.5);-webkit-text-stroke:1px #5a2e0a;pointer-events:none;white-space:nowrap;opacity:0}',
 '.lv-pop.on{animation:lvUp 1s ease-out forwards}.lv-pop.bad{color:#ff8a7a}@keyframes lvUp{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}100%{opacity:0;transform:translate(-50%,-105%) scale(1)}}',
 '.lv-ft{flex:none;display:flex;gap:8px;justify-content:center;align-items:stretch;padding:6px 10px calc(8px + env(safe-area-inset-bottom));max-width:800px;width:100%;box-sizing:border-box;margin:0 auto}.lv-ft:empty{display:none}',
 '.lv-b{flex:1;max-width:120px;min-height:60px;border:3px solid #3a2410;border-radius:16px;background:linear-gradient(#fdf0cf,#e6c98a);color:#3a2410;font:900 24px/1 var(--f,system-ui);box-shadow:0 4px 0 rgba(40,24,10,.6);touch-action:none;padding:4px}',
 '.lv-b small{display:block;font-size:12px;font-weight:800;margin-top:3px}.lv-b.on{transform:translateY(3px);box-shadow:0 1px 0 rgba(40,24,10,.6);background:linear-gradient(#ffe27a,#f0b030)}',
 '.lv-kc{display:inline-block;font:800 11px/1 system-ui,sans-serif;border:1.5px solid currentColor;border-radius:5px;padding:2px 4px;margin-left:5px;opacity:.75;vertical-align:middle}',
 '.lv-fr:not(.lv-pc) .lv-kc{display:none}',
 '.lv-res{position:absolute;left:0;top:0;right:0;bottom:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(14,10,6,.55);overflow-y:auto;-webkit-overflow-scrolling:touch}',
 '.lv-res .panel{margin:auto;max-width:400px;padding:14px 14px 10px;text-align:center}',
 '.lv-res h3{margin:0 0 2px;font-size:19px}.lv-res .lv-big{font:900 56px/1 var(--f,system-ui);margin:2px 0 0}.lv-res .lv-u{font-weight:700;opacity:.85;font-size:14px}',
 '.lv-res .lv-rec{display:inline-block;margin:6px auto 2px;padding:3px 14px;border-radius:12px;background:linear-gradient(#ffe066,#f5b21a);color:#4a2c04;font-weight:900;border:2px solid #b0760a;animation:mgGlow 1.6s ease-in-out infinite}',
 '.lv-res .lv-why{font-size:14px;margin:6px 0 2px;font-weight:700;opacity:.9}',
 '.lv-res .lv-gap{font-weight:900;font-size:16px;color:var(--cOk,#2f7a1c);margin:6px 0 4px}',
 '.lv-tb{width:100%;border-collapse:collapse;margin:2px 0 4px;font-size:14px}.lv-tb td{padding:2px 6px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}.lv-tb td:last-child{text-align:right;font-weight:900}',
 '.lv-tb img{width:26px;height:26px;vertical-align:middle;margin-right:6px;border-radius:50%;background:rgba(255,255,255,.15)}.lv-tb tr.me td{background:rgba(255,216,74,.28);font-weight:900}.lv-tb tr.me td:first-child{border-radius:10px 0 0 10px}.lv-tb tr.me td:last-child{border-radius:0 10px 10px 0}',
 '.lv-md{font-weight:800;font-size:14px;margin:4px 0}.lv-rw{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:4px 0}.lv-rw span{display:inline-flex;align-items:center;gap:4px;padding:3px 10px 3px 4px;border-radius:12px;background:#fff0bf;border:2px solid #e0a92e;color:#a85c00;font-weight:900}.lv-rw img{width:26px;height:26px}',
 '.lv-res .btns{display:flex;flex-direction:column;gap:6px;margin-top:8px}.lv-res .lv-again{font-size:21px;min-height:56px}.lv-res .lv-stop{background:none;border:0;box-shadow:none;text-decoration:underline;font-weight:700;color:inherit;opacity:.85;min-height:40px;font-size:15px;cursor:pointer;font-family:inherit}',
 '.lv-row{display:flex;justify-content:space-around;gap:8px}.lv-row .lv-stop{flex:1}',
 '.lv-note{font-size:12px;opacity:.75;margin-top:4px}',
 '@media (max-height:600px){.lv-ph{width:42px;height:42px}.lv-bub{font-size:13.5px;padding:3px 9px;min-height:0}.lv-res .lv-big{font-size:42px}.lv-res .panel{padding:10px 12px 8px}.lv-res .lv-again{min-height:50px}.lv-tb td{padding:1px 6px}.lv-tb{font-size:13px}.lv-tb img{width:22px;height:22px}.lv-b{min-height:52px}}',
 '@media (min-width:700px){.lv-ph{width:64px;height:64px}.lv-bub{font-size:17px}}',
 'body.mgCalm .lv-pop.on,body.mgCalm .lv-bub.pop{animation-duration:.01s}'
 ].join('\n');document.head.appendChild(s);}
/* соседи из турнира: имена в родительном падеже для «До Ратибора — 3» */
var NB_GEN=[['Воеводы Ратибора','Commander Ratibor'],['Боярыни Марфы','Boyarynya Marfa'],['Деда Пахома','Grandpa Pakhom'],['Атаманши Василисы','Atamansha Vasilisa']];
var NB_ACC=[['Ратибора','Ratibor'],['Марфу','Marfa'],['Пахома','Pakhom'],['Василису','Vasilisa']];
var NB_K=[1.16,1.05,.93,.82];
function rnd01(s){if(typeof tourRnd==='function')return tourRnd(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
function nbRows(G,base){var w=typeof weekNo==='function'?weekNo():0,lo=!!G.lower,rows=[],cap=lo?G.medal[2]:G.medal[2];
  var b=lo?Math.max(cap,Math.min(base||G.mid,G.mid)):Math.min(cap,Math.max(base||0,G.mid));
  for(var i=0;i<4;i++){var k=NB_K[i]*(.96+.08*rnd01(w+':lv:'+G.id+':'+i)),v=lo?b/k:b*k;v=lo?Math.round(v*10)/10:Math.max(1,Math.round(v));
    var nm=typeof TOUR_NB!=='undefined'&&TOUR_NB[i]?L(TOUR_NB[i].n,TOUR_NB[i].en):'?',fc=typeof tourFace==='function'?tourFace(i):'';rows.push({i:i,n:nm,f:fc,v:v});}
  return rows;}
function enc(G,v){return G.lower?(v>0?Math.max(1,99999-Math.round(v*10)):0):Math.max(0,Math.round(v));}
function dec(G,x){x=+x||0;return G.lower?(x>0?(99999-x)/10:0):x;}
function better(G,a,b){return G.lower?(a>0&&(!b||a<b)):a>b;}
function medal(G,v){var m=G.medal;if(!v)return 0;return G.lower?(v<=m[2]?3:v<=m[1]?2:v<=m[0]?1:0):(v>=m[2]?3:v>=m[1]?2:v>=m[0]?1:0);}
function fmt(G,v){return G.fmt?G.fmt(v):G.lower?(Math.round(v*10)/10).toFixed(1).replace('.',typeof LANG!=='undefined'&&LANG==='en'?'.':','):String(Math.round(v));}
var MD=[['пока нет','not yet'],['🥉 бронза','🥉 bronze'],['🥈 серебро','🥈 silver'],['🥇 золото','🥇 gold']];

function run(host,o,G){css();var Z=typeof DZ==='function'?DZ():null,num=G.num,pc=typeof mgPC==='function'?mgPC():false;
  var fr=document.createElement('div');fr.className='lv-fr'+(pc?' lv-pc':'');host.el.appendChild(fr);
  fr.innerHTML='<div class="lv-top"><img class="lv-ph" alt=""><div class="lv-bub"><b></b><span class="lv-tx"></span></div></div>'+
    '<div class="lv-info"><span class="lv-sc"></span><span class="lv-bs"></span></div><div class="lv-fld"><canvas></canvas><div class="lv-warm"></div><div class="lv-pop"></div></div><div class="lv-ft"></div>';
  var q=function(c){return fr.querySelector(c);},cv=q('canvas'),ctx=cv.getContext('2d'),tx=q('.lv-tx'),bub=q('.lv-bub'),scEl=q('.lv-sc'),bsEl=q('.lv-bs'),fld=q('.lv-fld'),pop=q('.lv-pop'),wEl=q('.lv-warm'),ft=q('.lv-ft');
  try{q('.lv-ph').src=ic(G.face,128);}catch(e){}q('.lv-bub b').textContent=L(G.who[0],G.who[1]);
  var best0=Z?dec(G,Z.b[num]):0,plays0=Z?Z.n[num]|0:0;
  var Q={st:'demo',t:0,auto:true,score:0,best:best0,pc:pc,calm:!!o.calm,k:1,w:0,h:0,d:1,rnd:Math.random,try:0,warmOn:true,o:o};
  var sessBase=best0,dead=false,keyUp=null,qb=host.btnQuit,qb0=qb?qb.onclick:null,popT=0;
  var sh={S:Q,L:L,pl:function(n){return pl(n,G.unit);},
    say:function(t){tx.innerHTML=t;bub.classList.remove('pop');void bub.offsetWidth;bub.classList.add('pop');},
    pop:function(t,bad){pop.textContent=t;pop.className='lv-pop';void pop.offsetWidth;pop.className='lv-pop on'+(bad?' bad':'');clearTimeout(popT);popT=setTimeout(function(){pop.className='lv-pop';},1000);},
    setScore:function(h){scEl.innerHTML=h;},
    warm:function(on,t){wEl.textContent=on?t:'';},
    end:function(score,why){if(Q.st!=='play')return;Q.st='res';setTimeout(function(){if(!dead)result(score,why);},G.endDelay!=null?G.endDelay:650);},
    put:function(key,x,y,px,op){try{MGK.put(ctx,key,x,y,px,Q.d*Q.k,op);}catch(e){}},
    snd:function(n){try{if(typeof SND!=='undefined'&&SND[n])SND[n]();}catch(e){}},
    rr:function(x,y,w,h,r){var c=ctx;c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();},
    text:function(s,x,y,px,op){try{MGK.text(ctx,s,x,y,px,op);}catch(e){}}};
  var g=G.make(sh);window.__lov={S:Q,g:g,sh:sh,G:G};   // для стенда LOVA-tools
  function showBest(){bsEl.innerHTML=Q.best?L('рекорд ','best ')+fmt(G,Q.best):'';}
  showBest();
  /* ---------- ввод: касание поля / кнопки / клавиши ---------- */
  var btns=[];
  if(G.buttons){G.buttons.forEach(function(b){var x=document.createElement('button');x.className='lv-b';x.innerHTML=b.t+(b.kc?'<small><span class="lv-kc">'+b.kc+'</span></small>':'');ft.appendChild(x);
    var dn=function(e){e.preventDefault();x.classList.add('on');if(Q.st==='play')g.press(true,b.k);},up=function(){x.classList.remove('on');if(Q.st==='play')g.press(false,b.k);};
    x.addEventListener('pointerdown',dn);x.addEventListener('pointerup',up);x.addEventListener('pointerleave',up);x.addEventListener('pointercancel',up);b.el=x;btns.push(b);});}
  else{fld.addEventListener('pointerdown',function(e){e.preventDefault();if(Q.st==='play')g.press(true,'tap');else if(Q.st==='demo')skipDemo();});
    var pu=function(){if(Q.st==='play')g.press(false,'tap');};window.addEventListener('pointerup',pu);window.addEventListener('pointercancel',pu);host.onQuit(function(){window.removeEventListener('pointerup',pu);window.removeEventListener('pointercancel',pu);});}
  if(G.buttons)fld.addEventListener('pointerdown',function(e){e.preventDefault();if(Q.st==='demo')skipDemo();});
  var KM={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D',a:'L',d:'R',w:'U',s:'D',A:'L',D:'R',W:'U',S:'D','ф':'L','в':'R','ц':'U','ы':'D',' ':'tap',Enter:'ent'};
  var down={};
  function mine(){return typeof MG!=='undefined'&&MG.cur&&MG.cur.host===host&&!host.paused&&!host.root.querySelector('.mgVeil');}
  function kd(e){var k=KM[e.key];if(!k||!mine())return;e.preventDefault();if(down[e.key])return;down[e.key]=1;
    if(Q.st==='res'){if(k==='tap'||k==='ent')again();return;}if(Q.st==='demo'){if(k==='tap'||k==='ent')skipDemo();return;}
    if(Q.st!=='play')return;if(G.buttons){if(k==='tap'||k==='ent')k='U';if(k==='U'||k==='D'||k==='L'||k==='R'){g.press(true,k);lit(k,true);}}else if(k==='tap'||k==='ent'||k==='U')g.press(true,'tap');}
  keyUp=function(e){var k=KM[e.key];if(!k)return;var was=down[e.key];down[e.key]=0;if(!was||Q.st!=='play')return;
    if(G.buttons){if(k==='tap'||k==='ent')k='U';g.press(false,k);lit(k,false);}else if(k==='tap'||k==='ent'||k==='U')g.press(false,'tap');};
  function lit(k,on){btns.forEach(function(b){if(b.k===k)b.el.classList.toggle('on',on);});}
  window.addEventListener('keydown',kd);window.addEventListener('keyup',keyUp);
  var blur=function(){for(var key in down)if(down[key])keyUp({key:key});};window.addEventListener('blur',blur);
  host.onQuit(function(){dead=true;window.removeEventListener('keydown',kd);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',blur);});
  /* ---------- холст ---------- */
  function fit(){var r=fld.getBoundingClientRect(),d=Math.min(2.5,host.dpr||1);if(Math.abs(r.width-Q.w)<1&&Math.abs(r.height-Q.h)<1&&d===Q.d)return;
    cv.width=Math.max(1,Math.round(r.width*d));cv.height=Math.max(1,Math.round(r.height*d));Q.w=r.width;Q.h=r.height;Q.d=d;}
  /* ---------- ход партии ---------- */
  function start(demo){Q.st=demo?'demo':'play';Q.auto=!!demo;Q.t=0;Q.score=0;if(!demo)Q.try++;Q.warmOn=!demo&&Q.try===1;
    try{g.reset(!!demo);}catch(e){console.error(e);}
    if(demo){sh.say(L(G.demoTxt[0],G.demoTxt[1]));sh.warm(false);}else{sh.say(L((Q.warmOn?G.goTxt:G.againTxt||G.goTxt)[0],(Q.warmOn?G.goTxt:G.againTxt||G.goTxt)[1]));}
    btns.forEach(function(b){b.el.classList.remove('on');});}
  function skipDemo(){if(Q.st!=='demo'||Q.t<.6)return;start(false);}
  function again(){var r=fr.querySelector('.lv-res');if(r)r.remove();if(qb)qb.onclick=qb0;try{SND.click();}catch(e){}start(false);}
  function close(){try{SND.click();}catch(e){}if(qb)qb.onclick=qb0;var izba=!!document.getElementById('dzIzba');try{MG_CLOSE();}catch(e){}
    if(izba&&typeof MG_IZBA==='function')try{MG_IZBA();}catch(e){}else try{if(typeof setPills==='function')setPills();}catch(e){}}
  function result(score,why){var prev=Q.best,rec=better(G,score,prev),first=!prev,train=o.mode==='train',out={trf:null,xp:0};
    if(rec)Q.best=score;
    if(Z){if(rec){Z.b[num]=enc(G,score);}Z.n[num]=(Z.n[num]|0)+1;
      if(!train&&!Z.d.p[num]&&typeof mgTrf==='function'){Z.d.p[num]=1;out.trf=mgTrf(1);}
      if(rec&&!first&&!Z.d.p['r'+num]){Z.d.p['r'+num]=1;out.xp=(typeof MG_RW!=='undefined'&&MG_RW.xpRec)||5;Z.x+=out.xp;}
      try{dzTouch();}catch(e){}try{save();}catch(e){}}
    var md=medal(G,Q.best),md0=medal(G,prev);
    try{STAT.ev('mg',{id:G.id,score:G.lower?Math.round(score*10):score,tier:md,m:'lov',rec:rec?1:0,n:Q.try,w:Q.warmOn?1:0,src:(MG.cur&&MG.cur.src)||''});}catch(e){}
    if(rec)sh.snd('win');else sh.snd('lose');
    // соседи: от рекорда на начало захода (за заход «не убегают»)
    var rows=(window.IZR&&IZR.rows)?IZR.rows(num).map(function(x){return {i:x.i,n:x.n,f:x.f,v:x.v};}):nbRows(G,sessBase),passed=[];if(prev)rows.forEach(function(r){if(better(G,Q.best,r.v)||Q.best===r.v){if(!(prev&&(better(G,prev,r.v)||prev===r.v)))passed.push(r);}});
    rows.push({me:1,n:L('Ты','You'),f:'',v:Q.best});rows.sort(function(a,b){if(G.lower)return (a.v||1e9)-(b.v||1e9)||(a.me?-1:b.me?1:0);return b.v-a.v||(a.me?-1:b.me?1:0);});
    var mi=0;for(var i=0;i<rows.length;i++)if(rows[i].me)mi=i;
    // события для IZBA (Удаль дня, игрища, медали, Ратибор), VKT и NAKAZ — способ «В» договора IZBA: без num
    try{if(typeof OB2!=='undefined'){OB2.emit('mg',{id:G.id,sc:score,rec:rec});if(rec)OB2.emit('rec',{id:G.id,sc:score,pl:mi+1});}}catch(e){}
    var gap;if(mi>0){var a=rows[mi-1],d=G.lower?Math.round((Q.best-a.v)*10)/10:a.v-Q.best,nm=NB_GEN[a.i]||[a.n,a.n];if(d<=0)d=G.lower?.1:1;
      gap=L('До ','To ')+L(nm[0],nm[1])+' — '+fmt(G,d)+' '+(G.lower?L('с','s'):pl(d,G.unit))+L('. Ещё разок?','. One more go?');}
    else gap=L('Ты первый на заставах! Удержишь?','You lead all the outposts! Can you hold it?');
    if(passed.length){var pn=NB_ACC[passed[0].i];gap=L('Обогнал '+pn[0]+'! ','You passed '+pn[1]+'! ')+gap;}
    var r=document.createElement('div');r.className='lv-res';
    var rw='';if(out.trf&&typeof trfIc==='function')rw+='<span><img src="'+ic(trfIc(out.trf.id),64)+'" alt="">+'+out.trf.n+' '+L('трофей','trophy')+'</span>';
    if(out.xp)rw+='<span><img src="'+ic('mg_book',64)+'" alt="">+'+out.xp+' '+L('дозора','watch')+'</span>';
    r.innerHTML='<div class="panel"><h3>'+L(G.name[0],G.name[1])+'</h3><div class="lv-big">'+fmt(G,score)+'</div><div class="lv-u">'+(G.lower?L('секунд — меньше лучше','seconds — lower is better'):pl(score,G.unit))+(rec?'':' · '+L('рекорд ','best ')+fmt(G,Q.best))+'</div>'+
      (rec&&!first?'<div class="lv-rec">'+L('Новый рекорд!','New record!')+'</div>':'')+(why?'<div class="lv-why">'+why+'</div>':'')+
      '<div class="lv-gap">'+gap+'</div><table class="lv-tb">'+rows.map(function(x){return '<tr class="'+(x.me?'me':'')+'"><td>'+(x.f?'<img src="'+x.f+'" alt="">':'<img src="'+ic(G.meIc||'voevoda',64)+'" alt="">')+x.n+'</td><td>'+(x.v?fmt(G,x.v):'—')+'</td></tr>';}).join('')+'</table>'+
      '<div class="lv-md">'+L('Медаль: ','Medal: ')+L(MD[md][0],MD[md][1])+(md>md0?' — '+L('новая!','new!'):'')+'</div>'+(rw?'<div class="lv-rw">'+rw+'</div>':'')+
      '<div class="btns"><button class="btn big gold lv-again">'+L('Ещё разок','One more go')+'<span class="lv-kc">'+L('Пробел','Space')+'</span></button><div class="lv-row"><button class="lv-stop">'+L('Хватит','Enough')+'</button><button class="lv-stop lv-how">'+L('Как играть?','How to play?')+'</button></div></div>'+
      '<div class="lv-note">'+(train?L('Тренировка — только рекорд.','Training — record only.'):L('Награда дня (1 трофей) — за первую партию, дальше — на рекорд.','Daily reward (1 trophy) is for the first game, then play for the record.'))+'</div></div>';
    fr.appendChild(r);r.querySelector('.lv-again').onclick=again;r.querySelector('.lv-stop').onclick=close;r.querySelector('.lv-how').onclick=function(){r.remove();if(qb)qb.onclick=qb0;Q.try=0;start(true);};if(qb)qb.onclick=close;
    showBest();}
  /* ---------- кадры ---------- */
  var stop=MGK.loop(host,function(dt){if(dead)return;fit();if(!Q.w||!Q.h)return;Q.t+=dt;
    if(Q.st!=='res'||G.stepRes)try{g.step(dt);}catch(e){console.error(e);}
    if(Q.st==='demo'&&Q.t>G.demoT)start(false);
    var c=ctx;c.setTransform(Q.d,0,0,Q.d,0,0);c.clearRect(0,0,Q.w,Q.h);g.bg(c,Q.w,Q.h);
    var k=Math.min(Q.w/WW,Q.h/WH);Q.k=k;c.translate((Q.w-WW*k)/2,(Q.h-WH*k)/2);c.scale(k,k);g.draw(c);
    if(Q.st==='demo'){var f=g.finger&&g.finger();if(f){c.save();c.globalAlpha=.95;c.font='46px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('👆',f.x,f.y+(f.down?8:-4));
        if(f.down){c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;c.beginPath();c.arc(f.x-6,f.y-22,14+Math.sin(Q.t*12)*3,0,7);c.stroke();}c.restore();}
      c.setTransform(Q.d,0,0,Q.d,0,0);c.fillStyle='rgba(40,24,10,.82)';c.fillRect(0,Q.h-34,Q.w,34);
      sh.text(L('Показ: смотри, как играть… (нажми — начать)','Demo: watch how to play… (tap to start)'),Q.w/2,Q.h-17,14,{col:'#fff6dc',ol:false,w:800,mw:Q.w-16});
      if(btns.length){var fb=g.fingerBtn&&g.fingerBtn();btns.forEach(function(b){b.el.classList.toggle('on',fb===b.k||(fb&&fb.indexOf&&fb.indexOf(b.k)>=0));});}}});
  host.onQuit(stop);
  fit();
  // показ — пока не играл; дальше — сразу партия (с разминкой)
  Q.rnd=o.rnd||Math.random;var showDemo=!plays0||!!(MG.cur&&MG.cur.opt&&MG.cur.opt.demo);start(showDemo);
  return sh;}
/* ---------- регистрация в оболочке избы (MG_REG). Полка «Удаль», запуск и флаги lov-<id> — IZBA (каталог CAT в js/ob2-izba-ui.js, r:1 — грузит этот файл) ---------- */
// [id, num, ru, en, значок ART, открытие: 0 — с избой (1-3), 1 — после 1-го босса, 2 — после Бабы-яги (босс главы 2), подпись замка ru/en]
var A=[['srub',15,'Сруб заставы','Log Fort','tour_nb4',0,'после 1-3','after 1-3'],['zelie',16,'Зелье до черты','Potion to the Line','flask',0,'после 1-3','after 1-3'],
 ['cep',17,'Златая цепь','The Golden Chain','kot',1,'после 1-го босса','after the 1st boss'],['stupa',18,'Ступа тётушки Яги','Auntie Yaga’s Mortar','tetka',2,'после Бабы-яги','after Baba Yaga']];
function on(x){return typeof OB2==='undefined'||!OB2.off('lov-'+x[0]);}
function op(x){try{return x[5]===2?!!(S.stars&&S.stars['1-5']):x[5]===1?mgBoss(1):mgIzbaOpen();}catch(e){return false;}}
function load(id){return OB2.need('js/lov-'+id+'.js').then(function(){if(!LOVK.G[id])throw new Error('lov '+id);return LOVK.G[id];});}
function reg(){if(typeof MG_REG!=='function')return;A.forEach(function(x){if(!on(x)||(MG.by&&MG.by[x[0]]))return;
  MG_REG({id:x[0],num:x[1],n:{ru:x[2],en:x[3]},icon:x[4],kind:'lov',open:function(){return op(x);},run:function(h,o){h.el.innerHTML='<p style="color:#fff6dc;text-align:center;margin-top:40vh;font-weight:800">…</p>';
    load(x[0]).then(function(G){if(MG.cur&&MG.cur.host===h){h.el.innerHTML='';run(h,o,G);}}).catch(function(e){console.warn(e);toast(L('Нет связи — игра не загрузилась','No connection — the game did not load'));h.quit();});}});});}
function open(id,op2){op2=op2||{};reg();try{SND.click();}catch(e){}var x=null;A.forEach(function(a){if(a[0]===id)x=a;});if(!x||!on(x))return null;
  var z=DZ();if(!z.s[x[1]]){z.s[x[1]]=1;try{STAT.ev('mg',{a:'first',id:id});}catch(e){}}
  return MG_OPEN(id,{mode:op2.train?'train':'lov',train:!!op2.train,from:op2.from||'',src:op2.src||op2.from||'',demo:op2.demo});}
window.LOVK={v:1,G:{},A:A,run:run,reg:reg,open:open,load:load,WW:WW,WH:WH,pl:pl,L:L,nbRows:nbRows,medal:medal,_enc:enc,_dec:dec};
reg();
})();
