/* ui-modes.js — викторина дня и дуэль «не как лестница» (поток UX, буст 09.10; 06-visual-ux В8).
   Табло над вопросом (строка #ladInfo): день — «Ты: 4 из 5 · Двор: ≈3,9» (двор — ожидаемое число верных по статистике ответов, PRICE.pOf из js/price.js);
   дуэль — «Ты: 4 · Друг: 7 из 10» с полосками. Зовётся в конце renderQ() — UIM.render(). Высоту экрана не добавляет (та же строка). */
(function(){'use strict';
  var W=window;
  function fmt(x){return (Math.round(x*10)/10).toString().replace('.',',');}
  function bar(v,n,cls){return '<span class="vsb '+(cls||'')+'"><span style="width:'+Math.round(100*Math.min(1,v/(n||10)))+'%"></span></span>';}
  function render(){if(!G||G.mode==='lad')return;var el=document.getElementById('ladInfo');if(!el)return;
    var ok=G.res.filter(function(x){return x===1;}).length,n=G.res.length;
    if(G.mode==='day'){var e=0;if(W.PRICE&&PRICE.pOf)for(var j=0;j<n;j++){var q=QI[G.qs[j]];if(q)e+=PRICE.pOf(q);}
      el.innerHTML='<span class="vs vsMe">'+L('Ты','You')+': <b>'+ok+'</b>'+(n?' '+L('из','of')+' '+n:'')+bar(ok,10,'vsMe')+'</span>'+(W.PRICE&&n?'<span class="vs yard">'+L('Двор','Yard')+': <b>≈'+fmt(e)+'</b>'+bar(e,10,'yard')+'</span>':'<span class="vs yard">'+L('Вопрос ','Question ')+(G.i+1)+'/10</span>');}
    else if(G.mode==='duel'){
      el.innerHTML='<span class="vs vsMe">'+L('Ты','You')+': <b>'+ok+'</b>'+bar(ok,10,'vsMe')+'</span>'+(G.foe!=null?'<span class="vs foe">'+L('Друг','Friend')+': <b>'+G.foe+'</b> '+L('из 10','of 10')+bar(G.foe,10,'foe')+'</span>':'<span class="vs foe">'+L('Вопрос ','Question ')+(G.i+1)+'/10</span>');}
    el.classList.add('vsOn');}
  // итог дня: строка «двор в среднем»
  function dayLine(){if(!W.PRICE||!PRICE.pOf||!G)return '';var e=0;for(var j=0;j<10;j++){var q=QI[G.qs[j]];if(q)e+=PRICE.pOf(q);}return '<p class="goal">🏠 '+L('Двор в среднем на этих вопросах: ≈','Yard average: ≈')+fmt(e)+L(' из 10',' of 10')+'</p>';}
  W.UIM={render:render,dayLine:dayLine};
})();
