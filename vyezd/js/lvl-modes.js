/* vy-lvl: режимы «Час пик» ⏰ и «Гололёд» ❄️, двор дня — один на всех, данные для yardHook.
   Правила (владелец 05.10, разбор 03): режимы открываются прохождением региона (босса десятка), не за монеты/рекламу; раскладка та же,
   что у обычного двора (то же зерно и тот же слой трудности); свои звёзды; награда ×1,5.
     «Час пик» (rush): 1 ❤️, без подсказки и эвакуатора; ★ = прошёл (1 звезда).
     «Гололёд» (ice): 3 ❤️, норма времени на двор; звёзды за время (≤60 % нормы ★★★, ≤80 % ★★, ≤100 % ★); время вышло — поражение
                      (жизнь за ролик/монеты добавляет полнормы времени).
   Сохранение (только поля LVL, S.lv*): S.lvR {индекс двора: 1} — «Час пик», S.lvI {индекс: звёзды} — «Гололёд», S.lvF {ключ: неудачных попыток подряд}.
   API для UX (карта, mapSlots) и CAR/YARD/STAT:
     LVLM.open(k)          — открыты ли режимы в регионе-десятке k (дворы k*10+1…k*10+10)
     LVLM.start(idx,mode)  — запустить двор в режиме ('rush'|'ice')
     LVLM.stars(k,mode)    — звёзд в режиме по десятку k (макс. 10 у «Час пик», 30 у «Гололёда»)
     LVLM.mapHtml(k)       — готовые кнопки «⏰ Час пик · ★n/10» / «❄️ Гололёд · ★n/30» для строки региона на карте (onclick — LVLM.pick)
     LVLM.hook(G,ok)       — {mode, region, fails} для yardHook (mode: 'n' обычный, 'rush', 'ice', 'daily', 'fest')
     LVLM.norm(G)          — норма «Гололёда», с
     LVLM.dayOne           — true: задание дня (двор дня) одно на всех — ступень «как двор 15» у всех (было: по прогрессу игрока)
   Счёт «пройдено дворов» в режимах для CAR — отдельно (CAR не считает режимы в очки карьеры). */
(function(W){
  function curG(){try{return G;}catch(e){return null;}}function curM(){try{return modalOn;}catch(e){return false;}} /* G, S, modalOn — let в index.html: видны по имени, не через window */
  var MODES={rush:{ico:'⏰',ru:'Час пик',en:'Rush hour'},ice:{ico:'❄️',ru:'Гололёд',en:'Black ice'}};
  function Sv(){try{return S;}catch(e){return {};}}
  function fix(){var S=Sv();['lvR','lvI','lvF'].forEach(function(f){if(!S[f]||typeof S[f]!=='object'||Array.isArray(S[f]))S[f]={};});}
  function open(k){var S=Sv();return (S.unlocked||1)>k*10+10;}
  function stars(k,mode){fix();var S=Sv(),o=mode==='rush'?S.lvR:S.lvI,n=0;for(var i=k*10;i<k*10+10;i++)n+=o[i]||0;return n;}
  function L2(a,b){try{return L(a,b);}catch(e){return a;}}
  /* норма времени: по p75 статистики (17/25/39/36 с по блокам) ×1,2, с поправкой на число машин (новые дворы крупнее) */
  function norm(G){var n=G&&G.vs?G.vs.length:20,i=G?G.idx:0,base=i<10?20:i<20?30:i<30?47:43;return Math.max(base,Math.round(1.2*(6+1.25*n)));}
  var T={t0:0,lim:0,el:null,timer:0,g:null,extra:0};
  function hudEl(){if(T.el&&document.body.contains(T.el))return T.el;var e=document.createElement('div');e.id='lvTimer';
    e.style.cssText='position:absolute;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 54px);z-index:6;padding:3px 12px;border-radius:14px;background:rgba(20,40,70,.82);color:#dff3ff;font:700 15px Rubik,-apple-system,sans-serif;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,.25)';
    var sg=document.getElementById('scr-game');(sg||document.body).appendChild(e);T.el=e;return e;}
  function stopTimer(){clearInterval(T.timer);T.timer=0;if(T.el)T.el.style.display='none';}
  function tick(){var G=curG();if(!G||G!==T.g||G.mode!=='ice'){stopTimer();return;}
    if(G.over&&!G.winT){return;} // окно поражения: время стоит
    if(G.winT)return;
    var paused=curM()||document.hidden;if(paused){T.t0+=.25;return;}
    var used=(performance.now()/1000-T.t0),left=Math.max(0,T.lim-used),e=hudEl();e.style.display='';
    e.textContent='❄️ '+Math.ceil(left)+' '+L2('с','s');e.style.background=left<=T.lim*.2?'rgba(200,40,40,.88)':'rgba(20,40,70,.82)';
    if(left<=0&&!G.over){G.over=true;G.hearts=0;try{renderHearts();toast(L2('❄️ Время вышло!','❄️ Time is up!'));loseLater(500);}catch(e2){}}}
  /* вызывается из startLevel после создания G (до STAT.lvl) */
  function begin(G,o){var mode=o&&o.mode||(G.daily?'daily':'n');G.mode=mode;
    try{var r=W.VYREG&&VYREG.at(G.idx);G.region=G.daily?'daily':r?r.id:'endless';}catch(e){G.region='';}
    stopTimer();T.g=G;
    var hb=document.getElementById('gHint'),tb=document.getElementById('gTow');
    if(hb)hb.style.visibility=mode==='rush'?'hidden':'';
    if(mode==='rush'){G.hearts=1;if(tb)tb.style.display='none';try{renderHearts();}catch(e){}var e1=hudEl();e1.style.display='';e1.style.background='rgba(200,60,20,.88)';e1.textContent='⏰ '+L2('Час пик','Rush hour');}
    if(mode==='ice'){T.lim=norm(G);T.t0=performance.now()/1000;T.timer=setInterval(tick,250);tick();}
    if(mode==='rush'||mode==='ice'){var m=MODES[mode];setTimeout(function(){if(curG()===G&&!G.over)try{toast(m.ico+' '+L2(m.ru,m.en)+(mode==='rush'?L2(': одна ❤️, без подсказок',': one ❤️, no hints'):L2(': успей за '+T.lim+' с',': clear it in '+T.lim+' s')),2600);}catch(e){}},400);}}
  /* жизнь в окне поражения «Гололёда» — +полнормы времени */
  function revive(G){if(G&&G.mode==='ice'&&G===T.g){T.t0+=T.lim*.5;if(!T.timer)T.timer=setInterval(tick,250);}}
  function iceStars(G){var used=performance.now()/1000-T.t0,q=used/Math.max(1,T.lim);return q<=.6?3:q<=.8?2:1;}
  function key(G){return (G.mode||'n')+':'+G.idx;}
  function fail(G){if(!G||G.daily)return;fix();var S=Sv(),k=key(G);S.lvF[k]=(S.lvF[k]||0)+1;}
  function hook(G,ok){fix();var S=Sv();return {mode:G.mode||'n',region:G.region||'',fails:(S.lvF[key(G)]||0)};}
  /* победа в режиме: свои звёзды, обычные S.stars/unlocked/гараж не трогаем. true — обработано */
  function win(G,st){if(!G||(G.mode!=='rush'&&G.mode!=='ice'))return false;fix();var S=Sv(),o=G.mode==='rush'?S.lvR:S.lvI;
    o[G.idx]=Math.max(o[G.idx]||0,G.mode==='rush'?1:st);delete S.lvF[key(G)];stopTimer();return true;}
  function winN(G){fix();if(G&&!G.daily)delete Sv().lvF[key(G)];stopTimer();}
  function start(idx,mode){if(!MODES[mode])mode=undefined;try{hideModal();}catch(e){}startLevel(idx,false,mode?{mode:mode}:undefined);}
  /* выбор двора режима: первый двор десятка без звезды режима, иначе первый */
  function pick(k,mode){fix();var S=Sv(),o=mode==='rush'?S.lvR:S.lvI;for(var i=k*10;i<k*10+10;i++)if(!o[i])return start(i,mode);start(k*10,mode);}
  function mapHtml(k,lab){if(!open(k))return '';var h=lab?'<span class="lvmlab">'+(k*10+1)+'–'+(k*10+10)+'</span>':'';
    for(var m in MODES)h+='<button class="btn sec sm lvm" style="flex:1 1 40%;min-width:130px;padding:6px 8px;font-size:14px" onclick="LVLM.pick('+k+',\''+m+'\')">'+MODES[m].ico+' '+L2(MODES[m].ru,MODES[m].en)+' · ★'+stars(k,m)+'/'+(m==='rush'?10:30)+'</button>';
    return '<div class="lvmrow" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin:4px 8px 8px">'+h+'</div>';}
  /* карта (гнездо UX mapSlots, зона 'region'): под заголовком региона — кнопки режимов по каждому пройденному десятку.
     ctx.region — индекс в REGIONS (у «Вокруг света» 20 дворов — две строки с номерами дворов) */
  (W.mapSlots=W.mapSlots||[]).push({id:'lvl-modes',order:30,zone:'region',render:function(ctx){try{
    var R=REGIONS,r=R[ctx.region];if(!r)return null;var nx=R[ctx.region+1],to=nx?nx.from:r.from+10,h='',many=to-r.from>10;
    for(var k=Math.floor(r.from/10);k*10<to&&k<21;k++)h+=mapHtml(k,many);return h||null;}catch(e){return null;}}});
  /* ---- вид «Гололёда» (только рисунок — раскладка, решатель и правила те же): наледь на асфальте, блики, следы заноса ---- */
  var ICE={g:null,patches:[],skids:[]};
  function iceInit(G){ICE.g=G;ICE.skids=[];ICE.patches=[];var a=(G.idx*7919+17)>>>0,rnd=function(){a=(a*1103515245+12345)>>>0;return a/4294967296;};
    var n=Math.round(G.p.w*G.p.h/9);for(var i=0;i<n;i++)ICE.patches.push({x:rnd()*G.p.w,y:rnd()*G.p.h,r:.6+rnd()*1.1,a:rnd()*3,e:.45+rnd()*.4,ph:rnd()*6});}
  function onExit(v){var G=curG();if(!G||G.mode!=='ice')return;var d=DIRS[v.dir],h=v.cells[0];
    ICE.skids.push({x:h[0],y:h[1],dx:d[0],dy:d[1],L:v.cells.length,t:performance.now()/1000,s:(v.id%2?1:-1)});if(ICE.skids.length>12)ICE.skids.shift();}
  function draw(g,layer,t){var G=curG();if(!G||G.mode!=='ice')return;if(ICE.g!==G)iceInit(G);
    if(layer==='under'){g.save();
      for(var i=0;i<ICE.patches.length;i++){var q=ICE.patches[i],c=toPx([q.x-.5,q.y-.5]);g.fillStyle='rgba(200,232,255,.55)';g.beginPath();g.ellipse(c[0],c[1],q.r*cs*.6,q.r*cs*.6*q.e,q.a,0,7);g.fill();
        g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(c[0]-q.r*cs*.15,c[1]-q.r*cs*.1,q.r*cs*.22,q.r*cs*.06,q.a,0,7);g.fill();}
      /* следы заноса: две дуги шин от места выезда, тают за 2 с */
      for(var k=0;k<ICE.skids.length;k++){var sk=ICE.skids[k],age=t-sk.t;if(age>2.2||age<0)continue;var p0=toPx([sk.x,sk.y]),al=Math.max(0,1-age/2.2);
        g.strokeStyle='rgba(60,80,100,'+(.35*al)+')';g.lineWidth=Math.max(1.5,cs*.07);g.lineCap='round';
        for(var o=-1;o<=1;o+=2){var px=-sk.dy*o*cs*.22,py=sk.dx*o*cs*.22,L2=cs*(1.2+sk.L*.4),wob=sk.s*cs*.35;
          g.beginPath();g.moveTo(p0[0]+px-sk.dx*cs*.4,p0[1]+py-sk.dy*cs*.4);
          g.quadraticCurveTo(p0[0]+px+sk.dx*L2*.5-sk.dy*wob,p0[1]+py+sk.dy*L2*.5+sk.dx*wob,p0[0]+px+sk.dx*L2,p0[1]+py+sk.dy*L2);g.stroke();}}
      g.restore();}
    else{if(typeof calm==='function'&&calm())return;g.save(); /* блики-искры на наледи */
      for(var j=0;j<ICE.patches.length;j+=2){var q2=ICE.patches[j],f=Math.sin(t*2.2+q2.ph);if(f<.7)continue;var c2=toPx([q2.x-.5,q2.y-.5]),r=cs*.12*(f-.7)/.3;
        g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(c2[0],c2[1]-r*2);g.lineTo(c2[0]+r*.35,c2[1]);g.lineTo(c2[0],c2[1]+r*2);g.lineTo(c2[0]-r*.35,c2[1]);g.closePath();g.fill();
        g.beginPath();g.moveTo(c2[0]-r*2,c2[1]);g.lineTo(c2[0],c2[1]+r*.35);g.lineTo(c2[0]+r*2,c2[1]);g.lineTo(c2[0],c2[1]-r*.35);g.closePath();g.fill();}
      g.restore();}}
  W.LVLM={MODES:MODES,open:open,start:start,pick:pick,stars:stars,mapHtml:mapHtml,hook:hook,norm:norm,begin:begin,revive:revive,iceStars:iceStars,
    win:win,winN:winN,fail:fail,fix:fix,dayOne:true,stop:stopTimer,onExit:onExit,draw:draw};
  /* для STAT prg (просьба TECH): звёзд в режимах */
  W.LVL=W.LVL||{};W.LVL.prg=function(){fix();var S=Sv(),n=0,k;for(k in S.lvR)n+=S.lvR[k]||0;for(k in S.lvI)n+=S.lvI[k]||0;return {md:n};};
})(window);
