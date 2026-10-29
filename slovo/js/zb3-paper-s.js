'use strict';
(function(){
if(typeof ZB==='undefined'||typeof S==='undefined'||!window.Z3||!Z3.on||!window.Z3PAPER||Z3PAPER.Z)return;
var P0=window.Z3PAPER,ON=P0.ON,RON=P0.RON,DEF=P0.DEF;
function Z(){if(!S.z3p)S.z3p=JSON.parse(JSON.stringify(DEF));var z=S.z3p,t=Z3.tk();
if(t&&z.k!==t){z.k=t;z.o=0;z.s=0;z.w=0;z.rc=0;z.q=0;}return z;}
var BIT={fw:1,vy:2,ef:4,bb:8,sk:16,zg:32,sv:64,sh:128,rp:256,ff:512};
var DOW=['sk','sv','sh','fw','vy','bb','sk'];
function dow(k){k=k||Z3.tk();return new Date(Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)).getUTCDay();}
function ev(a,p){var o={a:a},k;for(k in p||{})o[k]=p[k];Z3.ev('z3p',o);}
var P=P0;var PX={Z:Z,BIT:BIT,DOW:DOW,dow:dow,ev:ev,on:function(){return ON&&Z3.open('paper');},
x:function(){return P.ui?Promise.resolve(P):ZB.load('js/zb3-paper-x.js').then(function(){return P;});},
stat:function(){var z=Z();return{n:z.n,d1:z.d1,r:z.r,b:z.b,t:z.t,qn:z.qn,gp:z.gp};},
pero:function(){return Z().gp;},
left:function(){var z=Z(),r=DOW[dow()],n=0;if(!(z.s&BIT[r]))n++;if(!(z.s&BIT.zg))n++;if(!(z.s&BIT.rp))n++;return n;}};
for(var pk in PX)P[pk]=PX[pk];
ZB.screen('z3paper',{title:'Вечёрка у Зины',render:function(el,op){
if(P.ui){ZB.safe('z3p-scr',function(){P.render(el,op||{});});return;}
el.innerHTML='<div class="z3p-wait" style="padding:40px 16px;text-align:center;color:var(--z3-ink2,#6b5f4c)">📰 Люся несёт номер…</div>';
P.x().then(function(){if(ZB.cur==='z3paper')ZB.safe('z3p-scr',function(){P.render(el,op||{});});},
function(){try{if(typeof toast==='function')toast('Номер не загрузился — попробуй ещё раз',3000);}catch(e){}try{if(typeof openMenu==='function')openMenu();}catch(e){}});}});
P.go=function(){ev('open',{s:'yard',d:Math.min(Z3.day(),99)});ZB.go('z3paper',{});};
P.badge=function(){if(!Z3.open('paper'))return'';var z=Z();return z.o&1?(P.left()?String(P.left()):''):'!';};
P.note=function(){var z=Z(),h=0;try{h=new Date(typeof nowMs==='function'?nowMs():Date.now()).getHours();}catch(e){}
if(!(z.o&1))return'свежий номер';if(h>=19&&!(z.o&2))return'вечерний выпуск';var l=P.left();if(l)return'номер не дочитан';var e=P.evNow&&P.evNow();return e&&!e.done?e.ic+' '+e.sh:'номер прочитан ✓';};
P.hot=function(){var z=Z();return Z3.open('paper')&&!(z.o&1);};
var RUBS=[['sv','Связи','🧩'],['sh','Шифровка','🔢'],['rp','Красная ручка','🖍'],['fw','Филворд','🔤'],['vy','Вышивка','🧵'],
['bb','Барабан','🎡'],['sk','Сканворд деда Семёна','📰'],['zg','Зина загадала','🟩']];
if(RON)RUBS.forEach(function(x,i){Z3.rubAdd({id:x[0],order:i+1,t:x[1],ic:x[2],
lazy:function(){return P.x().then(function(){return P.lazy(x[0]);});},
play:function(el,o){var once=0,o2={};for(var k in o||{})o2[k]=o[k];
o2.done=function(res){if(once++)return;try{if(o&&o.done)o.done(res||{ok:false,m:0,s:0});}catch(e){console.error(e);}};
P.x().then(function(){P.play(x[0],el,o2);},function(){el.innerHTML='<p style="padding:16px">Не загрузилось — попробуй ещё раз.</p>';o2.done({ok:false,m:0,s:0,err:1});});}});});
function ridDue(c){if(!ON||!Z3.open('paper')||!c||c.daily||c.again)return false;var z=Z();if(z.q>=1)return false;
var lv=+S.lv||0;return lv>=10&&lv%4===1;}
function ridWord(){try{if(typeof G==='undefined'||!G||!G.words)return'';var L=G.words.map(function(w){return w.w;}).filter(function(w){return/^[а-я]{4,10}$/.test(w);});
L.sort(function(a,b){return b.length-a.length;});var d=window.GLOSS||(typeof GLOSS!=='undefined'?GLOSS:null);
for(var i=0;i<L.length;i++)if(!d||d[L[i]])return L[i];return L[0]||'';}catch(e){return'';}}
ZB.add(ZB.winSlots,{id:'z3p-rid',order:90,zone:'extra',fit:1,
render:function(c){if(!ridDue(c))return'';var w=ridWord();if(!w)return'';c.z3pw=w;
return'<div class="z3p-wr" style="text-align:center;margin-top:4px"><button type="button" class="btn ghost small z3p-wrb">✍ Загадать «'+w.toUpperCase()+'» соседям</button></div>';},
mount:function(el,c){var b=el&&el.querySelector('.z3p-wrb');if(!b||!c.z3pw)return;ev('rid',{s:'show'});
b.onclick=function(ev2){if(ev2&&ev2.stopPropagation)ev2.stopPropagation();try{SND.tap();}catch(e){}var w=c.z3pw;
P.x().then(function(){P.mk(w,function(sent){if(sent){b.disabled=true;b.textContent='✓ Загадка в номере';}});},function(){});};}});
ZB.load('js/zb3-paper-ev.js').then(function(){ZB.emit('z3late');},function(){});
})();
