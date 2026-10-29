'use strict';
(function(){
var AL=window.Z3ALB;if(!AL||AL.RANKS)return;
var A=AL.A,ev=AL.ev,sv=AL.sv,lsG=AL.lsG,cards=AL.cards,num=AL.num;
function h32(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
function norm(t){return String(t||'').replace(/ё/g,'е').replace(/Ё/g,'Е').replace(/\s+/g,' ').trim().toLowerCase();}
function vyDays(){var o=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i),m=/^z3-vy-(\d+)$/.exec(k||'');if(!m)continue;
var v=lsG(k,null);if(v&&v.ok)o.push(+m[1]);}}catch(e){}o.sort(function(a,b){return a-b;});return o;}
function vyN(){var P=window.Z3PD;return P&&P.vy&&P.vy.length||12;}
function vyPics(){var n=vyN(),seen={},o=[];vyDays().forEach(function(d){var p=((Math.floor(d/7)%n)+n)%n;if(!seen[p]){seen[p]=1;o.push({p:p,d:d});}});return o;}
function chapsDone(){var o=[];try{var n=ZB.chapCount(),lv=+S.lv||0;for(var c=0;c<n;c++){var ch=ZB.chap(c);if(ch.to<lv)o.push(c);else break;}}catch(e){}return o;}
function pst(){try{return window.Z3PAPER&&Z3PAPER.stat?Z3PAPER.stat():{};}catch(e){return{};}}
function stats(){var z=A(),p=pst(),v=vyPics().length;if(v>z.e)z.e=v;
return{lv:+S.lv||0,j:Math.max(z.l,cards().length),p:num(p.n),b:num(p.b),v:Math.max(v,z.e),c:chapsDone().length,d:Z3.day(),g:pero()};}
function pero(){try{return window.Z3PAPER&&Z3PAPER.pero?num(Z3PAPER.pero()):0;}catch(e){return 0;}}
var RANKS=[
['nov',function(s){return s.d>=7;},'прожить неделю в доме №7'],
['l100',function(s){return s.lv>=100;},'пройти 100 уровней'],['l300',function(s){return s.lv>=300;},'пройти 300 уровней'],
['l700',function(s){return s.lv>=700;},'пройти 700 уровней'],['l1200',function(s){return s.lv>=1200;},'пройти 1200 уровней'],
['l2000',function(s){return s.lv>=2000;},'пройти 2000 уровней'],
['j10',function(s){return s.j>=10;},'посмеяться 😂 над 10 шутками'],['j50',function(s){return s.j>=50;},'посмеяться 😂 над 50 шутками'],
['j150',function(s){return s.j>=150;},'посмеяться 😂 над 150 шутками'],
['p7',function(s){return s.p>=7;},'прочитать 7 номеров «Вечёрки»'],['p30',function(s){return s.p>=30;},'прочитать 30 номеров «Вечёрки»'],
['s7',function(s){return s.b>=7;},'читать газету 7 дней подряд'],
['v3',function(s){return s.v>=3;},'вышить 3 рушника'],['v12',function(s){return s.v>=12;},'вышить все 12 рушников'],
['c5',function(s){return s.c>=5;},'пройти 5 глав'],['c25',function(s){return s.c>=25;},'пройти 25 глав'],
['pero',function(s){return s.g>0;},'выиграть конкурс загадок «Золотое перо»']];
var lastNew='';
function check(quiet){var z=A(),s=stats(),got=0;RANKS.forEach(function(r,i){var b=1<<i;if(!(z.t&b)&&ZB.safe('z3a-r',function(){return r[1](s);})){z.t|=b;got=1;lastNew=r[0];if(!quiet)ev('rank',{r:r[0]});}});
if(got)sv();return s;}
function unseen(){var z=A();return z.t&~z.s;}
function topRank(){var z=A(),r='';RANKS.forEach(function(x,i){if(z.t&(1<<i))r=x[0];});return r;}
function TT(k,ctx){return Z3.txt('album-'+k,ctx);}
function rname(id){var L=window.Z3T&&Z3T['album-rn-'+id];return L&&L[0]||'';}
var DP=null;function data(){return DP||(DP=ZB.load('js/zb3-album-data.js').catch(function(){DP=null;}));}
var XP=null;function xload(){return XP||(XP=ZB.load('js/zb3-album-x.js').catch(function(e){XP=null;throw e;}));}
var DP=null;function data(){return DP||(DP=ZB.load('js/zb3-album-data.js').catch(function(){DP=null;}));}
var XP=null;function xload(){return XP||(XP=ZB.load('js/zb3-album-x.js').catch(function(e){XP=null;throw e;}));}
function scr(el,op){
if(AL.render){ZB.safe('z3a-scr',function(){AL.render(el,op||{});});return;}
Promise.all([xload(),data()]).then(function(){if(ZB.cur==='z3album')ZB.safe('z3a-scr',function(){AL.render(el,op||{});});},
function(){try{if(typeof toast==='function')toast('Комод заело — попробуй ещё раз',3000);}catch(e){}try{if(typeof openMenu==='function')openMenu();}catch(e){}});}
var O={h32:h32,norm:norm,vyDays:vyDays,vyPics:vyPics,chapsDone:chapsDone,stats:stats,RANKS:RANKS,check:check,unseen:unseen,topRank:topRank,rname:rname,T:TT,data:data,pst:pst,scr:scr,
badge:function(){if(!Z3.open('album'))return'';var z=A();return!z.f||unseen()?'!':'';},
hot:function(){if(!Z3.open('album'))return false;var z=A();return!z.f||!!unseen();},
note:function(){if(!Z3.open('album'))return'наряды и блюдца';var z=A();if(!z.f)return'альбом недели';if(unseen())return'новое звание!';
var r=topRank(),n=r&&rname(r);if(n)return n;var j=cards().length;return j?'шуток в альбоме: '+j:'альбом и наряды';}};
for(var k in O)AL[k]=O[k];
function home(){if(!Z3.open('album'))return;ZB.safe('z3a-home',function(){check();data();});}
ZB.on('home',home);
Z3.whenReady(function(){if(ZB.cur==='home')home();});
})();
