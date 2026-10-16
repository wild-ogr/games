/* bb2-lov-rist.js — «Ристалище»: забавы на движке самого боя (поток LOVA; грузится перед «Увернись!», позже — для «Ста чучел» LOVB). Наружу — только LOVRIST.
   Как устроено: настоящий поход (newRun из game.js) в ПЕСОЧНИЦЕ. На время забавы подменяются четыре глобальные функции и шина:
     META_HK      → только наши кадр/рисование (мета — узелок, сила забав, питомцы, трофеи, слава — похода не видит и ничего не тратит);
     BB2.hk/ev/has → только наш ответ на удар (умения, чудеса и прочие потоки на арене молчат), дар героя не срабатывает;
     drawHUD      → свой лёгкий HUD (полос опыта/времени нет);  togglePause → вместо «Привала» — вопрос «Выйти из забавы?».
   Всё возвращается на место в close() (его же зовёт выход из забавы, host.onQuit). endRun не вызывается никогда: ни золота, ни S.runs, ни заданий, ни статистики похода.
   Оружия нет, событий главы нет, нечисть ставит сама игра-забава (LOVRIST.spawn). Характеристики героя — ровные для всех (рекорд не зависит от прокачки).
   API: var A=LOVRIST.open(host,{chi, frame(dt,G), hit(src,G), draw(c,G), hud(c,G,W,H)}) → {G, pause(bool), close()};
        LOVRIST.spawn(type,x,y,{spd,fly,life}) → враг; LOVRIST.types() → виды без повадок: {slow:[],mid:[],fast:[],fly:[]}; LOVRIST.R — радиус арены (мировые единицы). */
var LOVRIST=(function(){
  var X={R:250,cur:null},keep=null;
  function css(){if(document.getElementById('lovRistCss'))return;var s=document.createElement('style');s.id='lovRistCss';
    s.textContent='#zabHost.lovR{background:transparent;pointer-events:none}#zabHost.lovR .zabVeil,#zabHost.lovR .zabX{pointer-events:auto}body.lovRist #pauseBtn,body.lovRist #tip,body.lovRist #tipX{display:none!important}';document.head.appendChild(s);}
  X.types=function(){var o={slow:[],mid:[],fast:[],fly:[]},k,d;for(k in EN){d=EN[k];if(!d||d.boss||d.prop||d.beh||d.ranged||k==='egg'||!ART[k]||d.r>16)continue;
      if(d.fly)o.fly.push(k);else if(d.spd<56)o.slow.push(k);else if(d.spd<95)o.mid.push(k);else o.fast.push(k);}
    if(!o.slow.length)o.slow=['muh'];if(!o.mid.length)o.mid=['wolf'];if(!o.fast.length)o.fast=o.mid;if(!o.fly.length)o.fly=['bat'];return o;};
  X.spawn=function(type,x,y,p){p=p||{};var e=mkEnemy(type,x,y);e.spd=p.spd||e.spd;e.dmg=1;e.ranged=false;e.beh=p.beh||null;e.fly=p.fly?1:e.fly;e.lovT=p.life||0;e.xp=0;return e;};
  X.open=function(host,cfg){if(X.cur)X.cur.close();css();var A={host:host,G:null,dead:false},t0=S.tut;
    keep={mh:window.META_HK,hk:BB2.hk,ev:BB2.ev,has:BB2.has,hud:window.drawHUD,tp:window.togglePause};
    function mute(n,a,b,c){if(n==='hurt'){try{if(cfg.hit)cfg.hit(b,c);}catch(e){console.warn('rist hit',e);}return false;}if(n==='dar'||n==='hudDar'||n==='down')return true;return undefined;}
    window.META_HK=function(k,a,b){try{if(k==='FRAME'&&cfg.frame)cfg.frame(a,b);else if(k==='DRAW'&&cfg.draw)cfg.draw(a,b);}catch(e){console.warn('rist '+k,e);}};
    BB2.hk=mute;BB2.ev=mute;BB2.has=function(n){return n==='hurt';};
    window.drawHUD=function(){var c=ctx,d=VIEW.dpr;c.setTransform(d,0,0,d,0,0);
      if(IN.on&&!A.fake){c.fillStyle='rgba(255,255,255,.10)';c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.beginPath();c.arc(IN.ox,IN.oy,48,0,6.283);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(IN.px,IN.py,18,0,6.283);c.fill();}
      try{if(cfg.hud)cfg.hud(c,G,VIEW.W,VIEW.H);}catch(e){console.warn('rist hud',e);}};
    window.togglePause=function(){if(document.hidden)return;try{ZAB_QUIT_ASK(host);}catch(e){}};
    document.body.classList.add('run','lovRist');host.root.classList.add('lovR');layout();
    try{S.tut=1;newRun(cfg.chi||0,HERO_BY[S.hero]?S.hero:'dob',false,false,null);}finally{S.tut=t0;}
    var g=G;A.G=g;g.lovRist=1;g.first=false;g.short=null;g.tut=null;g.en.length=0;g.ev=[];g.weapons=[];g.wk={cap:1e-9};g.propT=1e9;g.revives=0;g.adRevive=false;g.banner=null;g.bq=[];g.nov=0;g.novHeal=0;g.pity=0;g.curse=0;g.df=null;g.soft=null;g.K=null;g.dif='';
    g.st={maxHp:100,spd:118,armor:0,regen:0,might:1,area:1,cd:1,magnet:0,xp:0,luck:1,gold:0,amount:0};g.hero.hp=100;g.hero.max=100;g.darT=1e9;g.paused=true;
    try{tipHide();}catch(e){}rDirty=true;
    A.pause=function(b){if(G===g)g.paused=!!b;if(b)IN.on=false;};
    A.close=function(){if(A.dead)return;A.dead=true;X.cur=null;
      if(keep){window.META_HK=keep.mh;BB2.hk=keep.hk;BB2.ev=keep.ev;BB2.has=keep.has;window.drawHUD=keep.hud;window.togglePause=keep.tp;keep=null;}
      IN.on=false;if(G===g)G=null;host.root.classList.remove('lovR');host.root.style.background='rgba(20,14,8,.25)';document.body.classList.remove('lovRist');};
    /* выход из забавы совсем: вернуть меню под окном */
    host.onQuit(function(){A.close();document.body.classList.remove('run');rDirty=true;try{cloudApply();}catch(e){}});
    X.cur=A;return A;};
  return X;})();
