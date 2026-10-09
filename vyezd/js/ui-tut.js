/* ui-tut.js — подсказка первого хода во дворе 1 (поток UX, буст «Наш двор»).
   Зачем: каждый 4-й новичок (−23 %) видел двор 1 и НИ РАЗУ не нажал машину (06-visual-ux.md). Было: маленький белый кружок.
   Стало: машина-«приглашение» —
     сразу: крупная рука над машиной, которая может уехать, и кольцо-«пульс»; в плашке сверху — баба Шура одной фразой;
     через 3 с без касания: машина «бибикает», включается подсветка пути (та же, что у подсказки: поле темнеет, жёлтые штрихи до края);
     дальше — каждые 7 с то же самое; после 2-го напоминания рука «стучит» сильнее, надпись крупнее.
   Только двор 1, только пока не сделан первый ход (G.moves===0). Монеты/подсказки игрока не тратятся (G.helps не меняется).
   Читает глобальные G, cs, cam, toPx, trackPt, S из index.html (общая область классических скриптов). Нет файла — работает старый кружок. */
(function(){'use strict';
  if(!window.UI)return;
  var ov=null,raf=0,g0=null,t0=0,nN=0,lastN=0;
  var HAND='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M26 30V9.5a5 5 0 0 1 10 0V27l2-.6a5 5 0 0 1 6 3l.4 1 1.6-.4a5 5 0 0 1 5.9 3.4l.5 1.7 1.2-.2a4.6 4.6 0 0 1 5.3 4.4V49c0 8-6 13-14 13H36c-5 0-8-2-11-6L13.6 41a5 5 0 0 1 7.6-6.4L26 39z" fill="#fff" stroke="#17324a" stroke-width="3.2" stroke-linejoin="round"/><path d="M36 27v9M46 31v7M55 36v5" stroke="#17324a" stroke-width="2.6" stroke-linecap="round"/></svg>';
  function on(){try{return !!(G&&!G.over&&!G.daily&&G.idx===0&&G.tutorId>=0&&G.moves===0&&!window.__demo);}catch(e){return false;}}
  function stop(){cancelAnimationFrame(raf);raf=0;if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);ov=null;g0=null;}
  function shuraTip(){try{var t=document.getElementById('tip');if(!t||t.style.display==='none'||t.querySelector('.uxsh'))return;
      var tx=VY.L('Нажми на машину со стрелкой — она уедет туда, куда смотрит стрелка!','Tap the car with the arrow — it drives where the arrow points!');
      t.innerHTML='<span class="uxsh">'+(typeof shuraSvg==='function'?shuraSvg('happy'):'')+'</span><span class="uxtx"><b>'+VY.L('Баба Шура','Granny Shura')+'</b>'+tx+'</span>';t.classList.add('uxtip');}catch(e){}}
  function beep(){try{if(typeof SND==='object'&&SND.horn)SND.horn();}catch(e){}}
  function nudge(){nN++;try{G.hint=G.tutorId;G.hintT=4;G.hintQ=[];}catch(e){}beep();if(ov)ov.classList.add('loud');
    try{var t=document.getElementById('tip');if(t&&nN>=2)t.classList.add('uxbig');}catch(e){}}
  function frame(){raf=0;if(!on()||G!==g0){stop();var t=document.getElementById('tip');if(t)t.classList.remove('uxbig');return;}
    var v=G.vs[G.tutorId],cv=document.getElementById('cv');
    if(v&&v.state==='idle'&&v.ap>=1&&cv){var p=toPx(trackPt(v.track,v.s+(v.L-1)/2)),x=cv.offsetLeft+p[0]*cam.z+cam.x,y=cv.offsetTop+p[1]*cam.z+cam.y,r=Math.max(30,cs*cam.z*.9);
      ov.style.display='';ov.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px)';ov.style.setProperty('--r',Math.round(r)+'px');}
    else ov.style.display='none';
    var idle=(performance.now()-t0)/1000;
    if(idle>3&&nN===0)nudge();else if(nN>0&&idle>3+nN*7)nudge();
    raf=requestAnimationFrame(frame);}
  function start(){stop();if(!on())return;g0=G;t0=performance.now();nN=0;
    var st=document.getElementById('stage');if(!st)return;
    ov=document.createElement('div');ov.className='uxtut';ov.innerHTML='<i class="uxring"></i><i class="uxring r2"></i><b class="uxhand">'+HAND+'</b>';st.appendChild(ov);
    shuraTip();raf=requestAnimationFrame(frame);}
  UI.on('yard-start',function(o){var t=document.getElementById('tip');if(t)t.classList.remove('uxtip','uxbig');if(o&&!o.daily&&o.idx===0)setTimeout(start,60);else stop();});
  UI.on('screen',function(n){if(n!=='game')stop();});
  // любое касание двора (мимо машины тоже) — сбрасывает таймер «бездействия»
  document.addEventListener('pointerdown',function(e){if(ov&&e.target&&e.target.id==='cv')t0=performance.now();},{passive:true,capture:true});
  if(on())setTimeout(start,60); // новичок: двор 1 запускается ещё до загрузки модуля
  UI.tut={start:start,stop:stop,get n(){return nN;}};
})();
