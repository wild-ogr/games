'use strict';
(function(){
var W=window.Z4W,X=window.Z4WX;if(!W||!X)return;
var STEP=[3,6,9,10];
function baraban(back){if(!window.ZMG||!ZMG.open){back(null);return;}ZMG.open('baraban',{mode:'cab',train:true,back:back});}
function boxes(sc,base,head,then){var r=Math.random,vl=r()<.2,k=-1;
sc.el.innerHTML='<div class="z4w-q"><p class="z4w-qt">'+W.esc(head)+'</p></div><div class="z4w-boxes">'+[0,1,2].map(function(i){return'<button class="z4w-box" data-i="'+i+'">🎁'+(sc.pc?'<kbd class="z4w-kc">'+(i+1)+'</kbd>':'')+'</button>';}).join('')+'</div>';
function hit(i){if(k>=0)return;k=i;try{SND.open();}catch(e){}var b=sc.el.querySelectorAll('.z4w-box')[i];if(b){b.classList.add('on');b.textContent=vl?'🥾':'💰';}
setTimeout(function(){then(vl?{c:0,vl:1}:{c:base,vl:0});},sc.calm?150:650);}
sc.el.querySelectorAll('.z4w-box').forEach(function(b){b.onclick=function(){hit(+b.getAttribute('data-i'));};});
sc.keys(function(key){if(k>=0)return false;if(/^[1-3]$/.test(key)){hit(+key-1);return true;}return false;});}
function prizeEnd(sc,id,score,got){var z=W.S();if(got.vl&&z)z.vl++;
var t=got.vl?W.T('z4w.pole.valenok'):W.T('z4w.pole.box',{n:got.c}),g=W.T('z4w.pole.gift');
X.finish(sc,id,score,got.c,'zina',t||(got.vl?'Валенок!':'В коробке '+got.c+' монет.'),g?'<p class="z4w-ex">'+W.esc(g)+'</p>':'');}
X.shows.pole=function(sc){
sc.panel('zina',W.T('z4w.pole.hi')||'«Слово на барабане»! Крути, называй буквы.',[{t:'Крутить барабан',f:function(){sc.close();
baraban(function(res){if(!res){window.Z4&&Z4.ev('z4w',{a:'quit',id:'pole'});return;}var s2=X.scene('pole');
boxes(s2,STEP[Math.max(0,Math.min(3,res.tier|0))],'Слово отгадано! Приз в студию — выбирай коробку.',function(got){prizeEnd(s2,'pole',res.score|0,got);});});}}]);};
X.shows.priz=function(sc){var z=W.S();
function take(){if(z)z.pt=Math.max(z.pt,z.pz);}
sc.panel('zina',W.T('z4w.card.priz')||'Глава пройдена! Приз или суперигра?',[
{t:'🎁 Приз',f:function(){take();boxes(sc,6,'Выбирай коробку!',function(got){prizeEnd(sc,'priz',0,got);});}},
{t:'🎡 Суперигра',cls:'blue',f:function(){take();sc.close();baraban(function(res){var s2=X.scene('priz');
if(!res){X.finish(s2,'priz',0,3,'zina','Ушёл с барабана — держи утешительные. Я не обижаюсь. Почти.');return;}
if(res.tier>=2)boxes(s2,Math.min(20,STEP[Math.min(3,res.tier)]*2),'Суперигра выиграна! Приз двойной — выбирай коробку.',function(got){prizeEnd(s2,'priz',res.score|0,got);});
else X.finish(s2,'priz',res.score|0,3,'zina','Суперигра не далась — держи утешительные. В следующей главе отыграешься.');});}}]);};
})();
