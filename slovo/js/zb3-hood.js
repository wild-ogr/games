'use strict';
/* zb3-hood «Подъезд и стройка» — старт (BUILD 25.10, диета): флаг z3h, поле S.z3h, вклад звёзд уровня, предметы двора build/bench обёртками.
   Всё остальное и договор — js/zb3-hood-x.js (Z3.late, с 3-го дня; журнал HOUSE — zina-boost3/Z3-HOUSE.md). */
(function(){
if(typeof ZB==='undefined'||!window.Z3||!Z3.on)return;
var ON=Z3.reg('z3h',{t:'Подъезд и стройка недели во дворе',who:'HOUSE'});if(!ON)return;
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var NK=['w','m','pw','pm','ci','cf','d','g','ak','ag','k','kw','gv'],DEF={w:0,m:0,pw:0,pm:0,ci:0,cf:0,d:0,g:0,gt:[],ak:0,ag:0,k:0,kw:0,gv:0};
function cp(){return JSON.parse(JSON.stringify(DEF));}
Z3.field('z3h',{def:cp(),
  fix:function(z){NK.forEach(function(k){z[k]=n(z[k]);});z.gt=(z.gt instanceof Array?z.gt:[]).map(String).slice(-3);for(var k in z)if(!(k in DEF))delete z[k];},
  merge:function(m,c){if(!c||typeof c!=='object')return;
    if(n(c.w)>n(m.w)){m.w=n(c.w);m.m=n(c.m);m.kw=n(c.kw);m.pw=n(c.pw);m.pm=n(c.pm);}else if(n(c.w)===n(m.w)){m.m=Math.max(n(m.m),n(c.m));m.kw=Math.max(n(m.kw),n(c.kw));}
    if(n(c.d)>n(m.d)){m.d=n(c.d);m.g=n(c.g);m.gt=c.gt instanceof Array?c.gt.slice(-3):[];m.ak=n(c.ak);m.ag=n(c.ag);}
    else if(n(c.d)===n(m.d)){m.g=Math.max(n(m.g),n(c.g));m.ak=Math.max(n(m.ak),n(c.ak));m.ag=Math.max(n(m.ag),n(c.ag));}
    ['cf','k','gv'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});if(n(c.ci)&&(!n(m.ci)||n(c.ci)<n(m.ci)))m.ci=n(c.ci);}});
function Z(){if(!S.z3h)S.z3h=cp();var z=S.z3h,h=Z3.srv&&Z3.srv._h;if(!h)return z;var w=h.wkey(),d=h.dkey();
  if(z.w!==w){if(z.w){z.pw=z.w;z.pm=z.m;}z.w=w;z.m=0;z.kw=0;}if(z.d!==d){z.d=d;z.g=0;z.gt=[];z.ak=0;z.ag=0;}return z;}
var X='js/zb3-hood-x.js';function x(){return Z3.need(X).then(function(){return P;});}
var P=window.Z3H={Z:Z,n:n,x:x,ui:null,yd:null};
function W(k,d){P[k]=function(){return x().then(function(){return P._x?P[k]():d;},function(){return d;});};}
W('front','');W('notice','');W('thanks',[]); // для PAPER; zb3-hood-x заменяет настоящими
/* звёзды и слова уровня → стройка недели (с 1-го дня; сервер копит пачкой, без него — свой вклад в расчёте на месте) */
ZB.levelHook.push(function(i){if(!i||!i.ok)return;var st=i.first&&!i.daily&&!i.mode?1+(i.hinted?0:1)+(i.bonus>0?1:0):0,wd=n(i.words);
  if(!st&&!wd)return;try{Z3.srv.send('add',{st:st,wd:wd,lv:i.l});}catch(e){}if(st)Z().m+=st;});
function Y(id,o,t,ic,sc,nt){Z3.yardAdd({id:id,order:o,t:t,ic:ic,stub:function(){return false;},go:function(){x().then(function(){if(P._x)P.go(sc);},function(){});},
  note:function(){var f=P.yd&&P.yd[id];return f?f.note():nt;},badge:function(){var f=P.yd&&P.yd[id];return f?f.badge():'';},hot:function(){var f=P.yd&&P.yd[id];return f?f.hot():false;}});}
Y('build',30,'Стройка','🏗️','z3build','всем домом');Y('bench',50,'Подъезд','🏠','z3bench','соседи на лавочке');
Z3.late(X,{day:3});
})();
