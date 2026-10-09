/* ui-fx.js — «сочность» ответа (поток UX, буст 09.10; 06-visual-ux В4/В7).
   Верно: монеты вылетают из ответа и летят в ступень лестницы, ступень «бьётся», звон монеты; серия верных подряд — огонёк «×3, ×5…»;
   5-я и 10-я ступени — вспышка «Несгораемая!». Неверно: карточка трясётся (+вибрация уже есть в игре).
   Окно итога: монеты «+N» считают вверх. Главный: счётчик монет считает вверх, когда монет прибавилось.
   Всё гасится «спокойным режимом» и prefers-reduced-motion (calm() игры). Зовётся из reveal() — UIF.right()/UIF.wrong(k). */
(function(){'use strict';
  var W=window;
  function $(id){return document.getElementById(id);}
  function quiet(){try{return calm();}catch(e){return false;}}
  function rect(el){var r=el.getBoundingClientRect(),a=$('app').getBoundingClientRect();return{x:r.left-a.left+r.width/2,y:r.top-a.top+r.height/2,w:r.width,h:r.height};}
  function bump(el,cls){if(!el)return;el.classList.remove(cls||'fxBump');void el.offsetWidth;el.classList.add(cls||'fxBump');setTimeout(function(){el.classList.remove(cls||'fxBump');},700);}
  function coinEl(){var d=document.createElement('div');d.className='fxCoin';d.innerHTML=W.LK&&LK.on()?LK.ic('coin'):'💰';return d;}
  // n монет из from в to; done — когда долетела последняя
  function fly(from,to,n,done){if(!from||!to){if(done)done();return;}var app=$('app'),a=rect(from),b=rect(to),left=n;
    for(var i=0;i<n;i++)(function(i){var c=coinEl(),dx=(Math.random()-.5)*60,dy=-30-Math.random()*40;c.style.left=(a.x-14)+'px';c.style.top=(a.y-14)+'px';app.appendChild(c);
      var dur=620+i*70;
      if(c.animate){c.animate([{transform:'translate(0,0) scale(.6)',opacity:0},{transform:'translate('+dx+'px,'+dy+'px) scale(1.1)',opacity:1,offset:.3},{transform:'translate('+(b.x-a.x)+'px,'+(b.y-a.y)+'px) scale(.55)',opacity:.9}],{duration:dur,easing:'cubic-bezier(.5,0,.75,1)',delay:i*40,fill:'forwards'});}
      setTimeout(function(){c.remove();if(--left===0&&done)done();},dur+i*40);})(i);}
  function streakN(){var n=0;for(var j=G.i;j>=0&&G.res[j]===1;j--)n++;return n;}
  function badge(txt,cls){var g=$('scr-game');if(!g)return;var b=document.createElement('div');b.className='fxBadge '+(cls||'');b.textContent=txt;g.appendChild(b);setTimeout(function(){b.remove();},1700);}
  function right(){if(!G||quiet())return;var btn=document.querySelector('#answers .ans.ok'),step=document.querySelectorAll('#ladder span')[G.i];
    var n=G.mode==='lad'?Math.min(6,2+Math.round(prz(G.i)/8)):3;
    fly(btn,step,n,function(){bump(step);try{SND.coin();}catch(e){}});
    var s=streakN();if(s>=3&&(s===3||s===5||s===7||s===10))setTimeout(function(){badge('🔥 ×'+s,'streak');},350);
    if(G.mode==='lad'&&SAFE.indexOf(G.i)>=0)setTimeout(function(){badge(G.i===9?'Вся лестница!':'Несгораемая!','safe');},s>=3?1250:350);}
  function wrong(k){if(!G||quiet())return;var q=document.querySelector('#scr-game .qcard'),b=document.querySelector('#answers .ans[data-k="'+k+'"]');bump(b,'fxShake');bump(q,'fxShake');}
  // окно итога: «+N» считает вверх
  function countUp(el,to,ms){if(!el||quiet()||!(to>0))return;var t0=performance.now(),tn=null;
    for(var w=document.createTreeWalker(el,4,null,false),x;(x=w.nextNode());)if(/\d/.test(x.nodeValue)){tn=x;break;}if(!tn)return;var tpl=tn.nodeValue;
    (function f(){var p=Math.min(1,(performance.now()-t0)/(ms||800)),v=Math.round(to*(1-Math.pow(1-p,3)));tn.nodeValue=tpl.replace(/\d+/,v);if(p<1)requestAnimationFrame(f);else bump(el);})();}
  function result(){var c=document.querySelector('#mcard .coins-won');if(!c)return;var m=/\+(\d+)/.exec(c.textContent);if(m)countUp(c,+m[1],900);}
  // главный: счётчик монет считает вверх (только если прибавилось)
  var shown=null;
  function menuCoins(){var el=$('coinCnt');if(!el)return;var to=S.coins;if(shown==null||quiet()||to<=shown||!$('scr-menu').classList.contains('on')){shown=to;return;}
    var from=shown,t0=performance.now();shown=to;(function f(){var p=Math.min(1,(performance.now()-t0)/900);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f);else bump($('mCoins'));})();}
  // цена вопроса на плашке (js/price.js от BOARD) — вместо «лёгкий/средний/трудный»
  qSlots.push({id:'price',order:10,render:function(c){if(typeof priceOf!=='function')return null;var p=priceOf(c.q,{mode:c.mode,step:c.step,lvl:(S.lvl||0)+1});return p?'<span class="qprice" title="цена вопроса">'+p+'</span>':null;}});
  W.UIF={right:right,wrong:wrong,result:result,fly:fly,bump:bump,badge:badge,countUp:countUp,menuCoins:menuCoins};
})();
