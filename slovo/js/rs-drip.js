'use strict';
(function(){
if(!window.ZB||!window.ZB2||!window.Z3)return;
var RS=window.RS,ON=RS&&RS.on?!!RS.on('drip'):true,D=document;
function sf(id,f){return ZB.safe('rsd:'+id,f);}
function tk(){return Z3.tk?Z3.tk():0;}
function days(a,b){return Z3.days(a,b);}
function wk(t){var n=Math.round(Date.UTC(Math.floor(t/1e4),Math.floor(t/100)%100-1,t%100)/864e5);return Math.floor((n+3)/7);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function tap(){try{SND.tap();}catch(e){}}
function sv(){try{save();}catch(e){}}
function $(id){return D.getElementById(id);}
function lv(){return+S.lv||0;}
ZB2.field('z2s',{def:{d0:0,k:'',u:'',w0:-1,g:0,s:0,t:{}},
fix:function(z){['d0','g','s'].forEach(function(k){z[k]=Math.max(0,Math.floor(+z[k]||0));});z.w0=isFinite(+z.w0)?Math.floor(+z.w0):-1;
if(z.k!=='n'&&z.k!=='o')z.k='';if(typeof z.u!=='string')z.u='';if(!z.t||typeof z.t!=='object'||Array.isArray(z.t))z.t={};},
merge:function(m,c){var a=+m.d0||0,b=+c.d0||0;m.d0=a&&b?Math.min(a,b):a||b;if(!m.k)m.k=c.k||'';
String(c.u||'').split(',').forEach(function(x){if(x&&(','+m.u+',').indexOf(','+x+',')<0)m.u+=','+x;});
if(+c.w0>=0&&(+m.w0<0||+c.w0<+m.w0))m.w0=+c.w0;m.g=Math.max(+m.g||0,+c.g||0);m.s=Math.max(+m.s||0,+c.s||0);
var x=m.t||{},y=c.t||{};if(+y.d>(+x.d||0))m.t=JSON.parse(JSON.stringify(y));
else if(+y.d===+x.d&&x.d){x.m=x.m||{};for(var k in y.m||{})if(y.m[k])x.m[k]=1;['w','r','f','p'].forEach(function(k){x[k]=Math.max(+x[k]||0,+y[k]||0);});
if(!x.L&&y.L)x.L=y.L;if(!x.x&&y.x)x.x=y.x;}}});
function Z(){if(!S.z2s||typeof S.z2s!=='object')S.z2s={d0:0,k:'',u:'',w0:-1,g:0,s:0,t:{}};return S.z2s;}
var V5=['today','school','paper','mail','games','album','kiosk','bench','build'];
var Y3={paper:'paper',build:'build',mail:'mail',bench:'bench',school:'school',kiosk:'kiosk',album:'album'};
var F4={kuhnya:'z4a',show:'z4w',zabeg:'z4q',igry:'z4i',stol:'z4l',traty:'z4y',sto:'z4r',kot:'z4k',interes:'z4p',surprise:'z4c',news:'z4n',mail2:'z4m',event:'z4v'};
function flat(o,p,r){if(o&&typeof o==='object'){for(var k in o)flat(o[k],p+'.'+k,r);}else r[p]=o;return r;}
function used4(k){var v=S[k];if(!v||typeof v!=='object')return false;var f=ZB2._fld&&ZB2._fld[k],d=flat(f&&f.def||{},'',{}),a=flat(v,'',{}),n=0;
for(var x in a){var y=a[x];if(!y||y===d[x]||typeof y==='number'&&y>=20200101&&y<=20991231)continue;if(++n>=2)return true;}return false;}
function first(){var z=Z();if(z.k&&z.d0)return z;var t=tk(),d1=S.z2n&&+S.z2n.d1;
if(!t||!d1&&lv()<5)return{k:'n',d0:0,u:'',w0:z.w0,g:z.g,s:z.s,t:z.t,tmp:1};var d=Z3.day(),nb=!!d1&&d<=14;
z.k=nb?'n':'o';z.d0=t;var u=[];
if(!nb||d>1)for(var y in Y3)if(sf('z3o',function(){return Z3.open(y);}))u.push(Y3[y]);
if(!nb||d>1)if(lv()>=6)u.push('games');
for(var k in F4)if(used4(F4[k]))u.push(k);
if(used4('z4d')||used4('z4v'))u.push('event');if(used4('z4o')||used4('z4u')||used4('z4h'))u.push('news');if(used4('z4e')||used4('z4c'))u.push('surprise');
z.u=u.length?','+u.join(','):'';sv();return z;}
var NEW={today:2,school:3,paper:4,mail:5,games:6,album:7,kiosk:8,bench:9,build:10,event:11,news:12,interes:13,surprise:14,
kuhnya:15,show:16,zabeg:17,igry:18,stol:19,traty:20,sto:21,kot:22,mail2:23};
var OLD={news:2,mail2:3,event:4,interes:5,kuhnya:6,show:7,zabeg:8,igry:8,stol:9,surprise:10,traty:11,sto:12,kot:13};
function day(){var z=first();if(z.tmp)return 1;if(z.k==='n')return Math.max(1,Z3.day());return z.d0?Math.max(1,days(z.d0,tk())+1):1;}
function openAt(id){var z=first();if(z.k==='n')return NEW[id]||1;return V5.indexOf(id)>=0?1:OLD[id]||1;}
function isOpen(id){if(!ON)return true;var z=first();if((','+z.u+',').indexOf(','+id+',')>=0)return true;
if(id==='traty'&&lv()<60)return false;
var e=wkEv();if(e&&e.d===id)return true;return day()>=openAt(id);}
function todayNew(){var d=day(),z=first(),T=z.k==='n'?NEW:OLD,L=[];if(z.k==='o'&&!z.h0&&d<=3)return['home'];
for(var id in T)if(T[id]===d&&(','+z.u+',').indexOf(','+id+',')<0&&!(id==='traty'&&lv()<60))L.push(id);return L;}
var M4={z4a:'kuhnya',z4w:'show',z4q:'zabeg',z4i:'igry',z4l:'stol',z4y:'traty',z4r:'sto',z4k:'kot',z4p:'interes',z4s:'interes',z4c:'surprise',z4e:'surprise',
z4n:'news',z4u:'news',z4o:'news',z4m:'mail2',z4h:'mail2',z4v:'event',z4d:'event'};
if(window.Z4&&Z4.open&&!Z4.open.__rs){var o4=Z4.open;Z4.open=function(id){if(!o4(id))return false;if(!ON)return true;var m=M4[String(id).split('.')[0]];return!m||isOpen(m);};Z4.open.__rs=1;}
function cardOpen(cid){var m=M4[String(cid||'').split('.')[0]];return!ON||!m||isOpen(m);}
var EV=[{id:'vsem',d:'event',ic:'🔤',t:'Одна на всех',sub:'пропавшая буква, Час Зины, выборы старшей',c:['z4v']},
{id:'show',d:'show',ic:'📺',t:'Телешоу у Зины',sub:'Лото, Барабан, своя игра, песня',c:['z4w']},
{id:'sport',d:'event',ic:'🏅',t:'Спартакиада подъезда',sub:'кто ловчее из соседок',scr:'zsport'},
{id:'kuhnya',d:'kuhnya',ic:'🥒',t:'Кухня и дача',sub:'рецепты, банки, авоська',c:['z4a'],scr:'z4kuh'},
{id:'sto',d:'sto',ic:'💬',t:'Сто к одному',sub:'Великий спор: что ответили соседи',c:['z4r.spor']},
{id:'kot',d:'kot',ic:'🐈',t:'Ять главный',sub:'бега, санаторий, тетрадка',c:['z4k']},
{id:'olimp',d:'event',ic:'🏆',t:'Олимпиада подъездов',sub:'общий кроссворд и цвет подъезда',c:['z4d']}];
var inEv=0;
function wkEv(){if(!ON||inEv)return null;inEv=1;try{var z=first(),w=wk(tk());if(day()<openAt('event')&&(','+z.u+',').indexOf(',event,')<0)return null;
if(z.w0<0){z.w0=w;sv();}return EV[((w-z.w0)%7+7)%7];}finally{inEv=0;}}
function evGo(e){tap();X().then(function(){ZB.go('rs-event',{e:e.id});});}
var xp=null;function X(){return xp||(xp=ZB.load('js/rs-today-x.js').then(function(){return window.RSX;},function(e){xp=null;throw e;}));}
function home(){try{if(ZB._scr.home)return ZB.go('home');}catch(e){}try{openMenu();}catch(e){}}
var lg0=null,own=0;
function calThreat(){var C=window.ZB2CAL;if(!C||!C.win||!sf('cdue',function(){return C.due();}))return false;var o=C.c();
return o.q==='s'||(C.streak()>=3&&o.d!==C.tk());}
function busy(){var m=$('modal'),g=$('game');return!!(m&&m.classList.contains('on'))||!!(g&&g.classList.contains('on'));}
function onHome(){var mn=$('menu');return!!(mn&&mn.classList.contains('on'))||ZB.cur==='home';}
var tries=0;
function gate(){if(!ON)return false;var z=first(),t=tk();if(!t||z.g===t)return false;if(typeof SHOT!=='undefined'&&SHOT)return false;
if(busy()){if(++tries<12)setTimeout(gate,1000);return false;}if(!onHome())return false;tries=0;
if(calThreat()&&lg0){z.g=t;sv();own=1;try{lg0(null);}finally{own=0;}return true;}
var L=todayNew();if(L.length&&z.s!==t){z.g=t;z.s=t;if(L[0]==='home')z.h0=1;sv();X().then(function(x){x.newWin(L[0]);});return true;}
var A=window.RS&&RS.lvl&&RS.lvl.ask;S.tip=S.tip||{};if(A&&!S.tip.rsbig&&!S.big&&!(z.k==='n'&&day()===1)){z.g=t;S.tip.rsbig=1;sv();try{STAT.ev('rsd',{a:'big'});}catch(e){}
A({t:'Крупные буквы',q:'Сделать буквы крупнее? Так легче читать. Поменять можно в Настройках.',y:'Да, крупнее',n:'Нет, спасибо',
go:function(){S.big=1;sv();try{applyBig();}catch(e){}try{STAT.ev('rsd',{a:'big',r:1});}catch(e){}}});return true;}
return false;}
function one(k){if(!ON)return true;var z=first(),t=tk();if(!t)return true;if(z.g===t)return false;z.g=t;sv();try{STAT.ev('rsd',{a:'one',k:k});}catch(e){}return true;}
if(!RS||!RS.on||RS.on('today'))ZB.on('ready',function(){ZB.load('js/rs-today.js').then(function(){ZB.refresh();},function(){});});
if(ON){
ZB.on('home',function(){setTimeout(gate,900);});
ZB.on('ready',function(){first();setTimeout(gate,1200);
var ol=window.openLogin;if(typeof ol==='function'&&!ol.__rs){lg0=ol;window.openLogin=function(then,cont){if(own)return ol.apply(this,arguments);
if(cont){if(typeof then==='function')sf('lgthen',then);return;}
var ev=window.event;if(ev&&(ev.type==='click'||ev.type==='pointerup'||ev.type==='keydown'))return ol.apply(this,arguments);};window.openLogin.__rs=1;}
window.retDue=function(){return false;};
var y=S.z3y;if(y&&typeof y==='object'&&!y.r&&!(+y.l&1)){y.r=1;sv();}
ZB.on('screen',function(id){if(id!=='zb-school'||!Z().nk)return;Z().nk=0;sv();setTimeout(function(){try{toast('🔑 Класс русского — ваш! Отремонтирован даром.',4000);}catch(e){}},400);});});
}
window.RSD={on:ON,day:day,open:isOpen,today:todayNew,gate:gate,one:one,cardOpen:cardOpen,kind:function(){return first().k;},z:Z,go:{},newWin:function(id){X().then(function(x){x.newWin(id);});},css:function(){},Y3:Y3,sf:sf,esc:esc,tap:tap,
X:function(){return X();},home:home,first:first,wkEv:wkEv,EV:EV,
note:function(k){if(k==='cab'){Z().nk=1;sv();}}};
window.RSE={cur:function(){return null;},week:wkEv,list:EV,go:evGo};
})();
