'use strict';
(function(){
if(typeof ZB==='undefined'||!window.ZB2)return;
var F={l1:ZB2.reg('fx.l1',{t:'1-й урок: первое слово сам',who:'FIX-ZN'}),dvor:ZB2.reg('fx.dvor',{t:'Раз в игру: «Загляни во Двор»',who:'FIX-ZN'})};
var X=window.FXZN={ok:function(k){return!!F[k];},goal:function(){return'Заполни клеточки словами из букв! ';}};
ZB.on('ready',function(){ZB.load('js/fx-zn-x.js');});
})();
