'use strict';
/* zb3-NUM «Номер-лайт» — старт (поле S.z2v, ZBNUM, A/B только ?numab=1). Договор и поля — шапка js/zb3-num-x.js. */
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined')return;
var ON=ZB2.reg('num',{t:'Вечёрка у Зины (номер-лайт) + юмор, опыт A/B VK/ОК',who:'NUM'});
var VKOK=false;try{VKOK=PLAT==='vk';}catch(e){}
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var NK=['gt','d','r','b','n','k','s','o','w','il'];
ZB2.field('z2v',{def:{il:0,g:'',gt:0,d:0,r:0,b:0,n:0,k:0,s:0,o:0,w:0,p:{}},
  fix:function(z){NK.forEach(function(k){z[k]=num(z[k]);});if(z.g!=='A'&&z.g!=='B')z.g='';if(!z.p||typeof z.p!=='object'||Array.isArray(z.p))z.p={};},
  merge:function(m,c){if(!c||typeof c!=='object')return;
    if((c.g==='A'||c.g==='B')&&(!m.g||(num(c.gt)&&num(c.gt)<num(m.gt)))){m.g=c.g;m.gt=num(c.gt);}
    if(num(c.d)>num(m.d)||(num(c.d)===num(m.d)&&num(c.r)>num(m.r))){m.d=num(c.d);m.r=num(c.r);}
    m.b=Math.max(num(m.b),num(c.b));m.il=Math.max(num(m.il),num(c.il));m.n=Math.max(num(m.n),num(c.n));
    if(num(c.k)>num(m.k)){m.k=num(c.k);m.s=num(c.s);m.o=num(c.o);m.w=num(c.w);if(c.p&&typeof c.p==='object')m.p=JSON.parse(JSON.stringify(c.p));}
    else if(num(c.k)===num(m.k)){m.s|=num(c.s);m.o|=num(c.o);m.w|=num(c.w);}}});
function Z(){return S.z2v||(S.z2v={g:'',gt:0,d:0,r:0,b:0,n:0,k:0,s:0,o:0,w:0,p:{}});}
function tk(){try{return +todayKey();}catch(e){return 0;}}
function grp(){if(!VKOK)return '';var z=Z();if(z.g!=='A'&&z.g!=='B'){z.g=Math.random()<.5?'A':'B';z.gt=Date.now();try{save();}catch(e){}}return z.g;}
/* 2-й день игры: S.z2n.d1 — день первого уровня (новички с 17.10); у старых игроков d1 нет — день установки STAT (S.stc.c) или уже ≥ 20 уровней */
function el(){var lv=+S.lv||0;if(lv<5)return false;var t=tk(),d1=S.z2n&&+S.z2n.d1||0;if(d1)return t>d1;
  var c=S.stc&&+S.stc.c||0;return lv>=20||(c>0&&t>c);}
/* решение владельца 24.10: «Зина 3.0» целиком, всем. Деление A/B — только возможность: ?numab=1 или window.ZBNUM_AB=true (тогда новинки — только группе B VK/ОК) */
var AB=window.ZBNUM_AB===true||/[?&]numab=1(&|$)/.test(location.search);
function on(){return ON&&el()&&(!AB||VKOK&&grp()==='B');}
function dd(a,b){function f(k){return Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100);}return Math.round((f(b)-f(a))/864e5);}
function ev(a,p){var o={a:a,g:grp()},k;for(k in p||{})o[k]=p[k];try{STAT.ev('vch',o);}catch(e){}}
var W=window.ZBNUM={ab:AB,grp:grp,on:on,el:el,Z:Z,ev:ev,dd:dd,tk:tk,
  x:function(){return W.ui?Promise.resolve(W):ZB.load('js/zb3-num-x.js').then(function(){return W;});}};
if(!ON)return;
/* буква опыта — в cfg сеанса (cfg уходит вместе со start через ~2,5 с; модуль грузится раньше) */
if(AB&&VKOK){try{localStorage.setItem('stat-ab-slovo-vech',grp());}catch(e){}try{if(STAT.ab)STAT.ab('vech',2);}catch(e){}}
var sent=0;
function grpEv(){if(sent)return;sent=1;var z=Z(),t=tk(),fd=0;
  try{var l=localStorage.getItem('zn-vday');fd=l!==String(t)?1:0;localStorage.setItem('zn-vday',String(t));}catch(e){}
  ev('grp',{el:el()?1:0,ls:z.d?Math.min(99,dd(z.d,t)):0,fd:fd,lv:+S.lv||0,sr:z.r||0});}
ZB.on('ready',function(){setTimeout(function(){ZB.safe('num-grp',grpEv);
  if(on())W.x().then(function(){ZB.safe('num-ref',function(){if(W.boot)W.boot();ZB.refresh();});},function(){});},1200);});
/* облако пришло позже (другая буква) или игрок дорос до показа — при входе в Дом догрузить */
ZB.on('home',function(){ZB.safe('num-home',function(){if(AB&&VKOK)try{localStorage.setItem('stat-ab-slovo-vech',grp());}catch(e){}
  if(on()&&!W.ui)W.x().then(function(){if(W.boot)W.boot();ZB.refresh();},function(){});});});
})();
