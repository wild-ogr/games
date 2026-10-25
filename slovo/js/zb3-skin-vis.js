'use strict';
/* ================= zb3-skin-vis — «VIS-мелочи старых экранов» (поток SKIN, 25.10.2026; журнал hobby-analytics/release-i/zina-boost3/Z3-SKIN.md, VIS.md ш2–4/ИТОГ 4) =================
   Грузит js/zb3-skin.js лениво (ZB.load, не старт), флаг z3vis (?off=z3vis — всё как было). Вид — css/zb3-vis.css (подключается отсюда), логику игры не трогает.
   Здесь только то, что нельзя сделать одним CSS:
   - класс #game.z3talk, пока реплика Зины на экране (на низком телефоне пузырь лежит поверх шапки — шапка под ним прячется целиком, без «хвостов» кнопок, V15/V31);
     #game.z3tall — длинная реплика дотянулась до ленты главы: лента на это время прячется целиком (не торчит обрезком из-под пузыря);
   - класс html.z3toast, пока виден тост (#toast): на телефоне в уровне тост — в шапке, пузырь Зины на это время прячется (не пузырь+тост сразу, тост не на сетке, V17);
     тост ушёл, а реплика ещё на экране — у неё снова полное время чтения (таймер zina._t, как в zina());
   - Путь (V3): первая карточка списка («Повторение 🔎») не остаётся обрезанной под шапкой после прокрутки к «Зина тут».
*/
(function(){
  var DE=document.documentElement;
  if(!document.getElementById('z3visCss')){var l=document.createElement('link');l.id='z3visCss';l.rel='stylesheet';l.href='css/zb3-vis.css';document.head.appendChild(l);}
  DE.classList.add('z3vis');
  function $(id){return document.getElementById(id);}
  /* ---- пузырь Зины и тост ---- */
  var say=$('zSay'),gm=$('game'),tst=$('toast'),wasT=false;
  function sync(){var on=!!(say&&say.classList.contains('on')&&say.textContent);if(gm)gm.classList.toggle('z3talk',on);
    var rb=$('gRib'),tall=false;if(on&&rb&&rb.offsetParent){var r1=say.getBoundingClientRect(),r2=rb.getBoundingClientRect();tall=r1.bottom>r2.top+2&&r1.right>r2.left;}if(gm)gm.classList.toggle('z3tall',tall);
    var t=!!(tst&&tst.classList.contains('on'));DE.classList.toggle('z3toast',t);
    if(wasT&&!t&&on&&!say.classList.contains('pin')&&typeof zinaHide==='function'){try{clearTimeout(zina._t);zina._t=setTimeout(zinaHide,Math.max(3,1.5+say.textContent.length*.06)*1000);}catch(e){}}
    wasT=t;}
  try{var mo=new MutationObserver(function(){ZB.safe('z3vis:say',sync);});
    if(say)mo.observe(say,{attributes:true,attributeFilter:['class'],childList:true});
    if(tst)mo.observe(tst,{attributes:true,attributeFilter:['class']});}catch(e){}
  sync();
  /* ---- Путь: не оставлять верхнюю карточку обрезанной ---- */
  function pathFix(){var L=$('zbPathList');if(!L||!L.offsetParent)return;var f=L.firstElementChild;if(!f||f.classList.contains('zbp-road'))return;
    var b=f.getBoundingClientRect().bottom-L.getBoundingClientRect().top+L.scrollTop;if(L.scrollTop>0&&L.scrollTop<b+8)L.scrollTop=0;}
  ZB.on('screen',function(n){if(n==='path'||n==='zb-path')setTimeout(function(){ZB.safe('z3vis:path',pathFix);},40);});
})();
