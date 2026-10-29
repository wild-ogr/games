'use strict';
(function(){
var W=window.Z4W,X=window.Z4WX;if(!W||!X)return;
var STEP=[3,5,8,10];
X.shows.loto=function(sc){
sc.panel('mityai',W.T('z4w.loto.hi')||'Лото у Зины! Карточка — из твоих слов.',[{t:'Тянуть бочонки',f:function(){sc.close();
if(!window.ZMG||!ZMG.open)return;
ZMG.open('loto',{mode:'cab',train:true,back:function(res){if(!res){window.Z4&&Z4.ev('z4w',{a:'quit',id:'loto'});return;}
var s2=X.scene('loto'),sc2=Math.max(0,res.score|0),c=STEP[Math.max(0,Math.min(3,res.tier|0))];
X.finish(s2,'loto',sc2,c,'mityai',W.T('z4w.loto.res',{n:sc2})||('Лото закрыто: '+sc2+' очков.'),
'<p class="z4w-ex">Итоги у подъезда — сегодня в 21:00, на Доме.</p>');}});}}]);};
})();
