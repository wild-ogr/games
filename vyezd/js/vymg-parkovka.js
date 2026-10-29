'use strict';
(function(){if(typeof VYMG_REG!=='function'||!window.VYC||!window.VYPE)return;
var K=window.VYC,ID='parkovka',N=3,CUT=[3,5,8],T=function(a,b){return K.L(a,b);};
var DIM0=[4.2,1.76,2.45,.85],TASKS=[['bay','yard',.25],['par','yard',0],['gar','gar',.3]];
function run(host,o){if(o&&o.ctx&&o.ctx.park&&window.VYPARK&&VYPARK.run)return VYPARK.run(host,o);
var R=o.rnd||Math.random,calm=K.calm(o),myCar=K.pick(['moskvich','kopeyka','niva','devyatka','zapor'],R),seed=(o.seed>>>0)||Math.floor(R()*4294967296);
var lots=TASKS.map(function(t,k){return{kind:t[0],th:t[1],tight:t[2],car:myCar,dim:DIM0,seed:(seed+k*7919)>>>0,calm:calm};});
return VYPE.play(host,o,{lots:lots,mode:'classic',who:'mityai',
done:function(rs){var pts=rs.map(function(r){return r.pts|0;}),sc=pts.reduce(function(a,b){return a+b;},0),clean=pts.filter(function(x){return x===3;}).length;
return{score:sc,tier:K.tier(sc,CUT),label:T('Поставил ','Parked ')+pts.filter(function(x){return x>0;}).length+T(' из ',' of ')+N+T(' · без единого касания: ',' · without a scratch: ')+clean,extra:{max:N*3}};}});}
function sim(o,k){var R=o.rnd||Math.random,s=0;k=k==null?.6:k;for(var i=0;i<N;i++){if(R()<.3*(1-k)*(1-k)*(1+i*.3))continue;var tc=0,l=(1-k)*2.4*(1+i*.25),e=Math.exp(-l),q=R(),pp=e;while(q>pp&&tc<5){tc++;e*=l/tc;pp+=e;}
s+=Math.max(1,3-Math.min(2,tc)-(R()<.45*(1-k)?1:0));}return{score:s,tier:K.tier(s,CUT)};}
VYMG_REG({id:ID,n:K.L('Парковка задним ходом','Reverse Parking'),a:K.L('«Левее! Ещё! Стоп!» — поставь машину в карман','“Left! More! Stop!” — park the car in the gap'),run:run,sim:sim});
})();