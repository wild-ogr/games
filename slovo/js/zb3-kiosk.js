'use strict';
(function(){
var Z=window.Z3;if(!Z||!Z.on||typeof ZB==='undefined')return;
if(!Z.reg('z3s',{t:'Ларёк «Учительская» во дворе: подписка, копилка, узелок, витрина',who:'KIOSK'}))return;
var F={sub:Z.reg('z3s-sub',{t:'Подписка на «Вечёрку» (30 дней без межэкранной, 💡 в день)',who:'KIOSK'}),
pig:Z.reg('z3s-pig',{t:'Копилка на подоконнике (монеты сверх — разбить за покупку)',who:'KIOSK'}),
uz:Z.reg('z3s-uz',{t:'Узелок новичка — с 3-го по 9-й день',who:'KIOSK'})};
F.ab=F.sub&&Z.reg('z3s-ab',{t:'Абонемент в библиотеку входит в Подписку на «Вечёрку»',who:'KIOSK'});
['pigp','train','mgad'].forEach(function(k){F[k]=Z.reg('z3s-'+k,{t:'ларёк этап 4: '+k,who:'KIOSK'});});F.pigp=F.pig&&F.pigp;
F.pass=Z.reg('z3s-pass',{t:'Сезонный пропуск «Сезон двора»: бесплатная и платная дорожки на месяц',who:'KIOSK'});
var DAY=864e5,SUB={days:30,vk:15},PIG={share:.25,cap:1500,min:300,vk:7,part:400,pmax:1000,pvk:3},UZ={from:3,to:9},SK={c:20};
var NK=['to','n','hd','pg','pb','sk','u','v','yd','yn'];
Z.field('z3s',{def:{to:0,n:0,hd:0,pg:0,pb:0,sk:0,u:0,v:0},
fix:function(m){NK.forEach(function(k){var x=+m[k];m[k]=isFinite(x)&&x>0?Math.floor(x):0;});for(var k in m)if(NK.indexOf(k)<0&&k!=='ps')delete m[k];
if(m.pg>PIG.cap)m.pg=PIG.cap;psFix(m);},
merge:function(m,c){var pb=+c.pb||0;if(pb>(+m.pb||0)){m.pb=pb;m.pg=+c.pg||0;}else if(pb===(+m.pb||0))m.pg=Math.max(+m.pg||0,+c.pg||0);
['to','n','hd','sk','u','v'].forEach(function(k){m[k]=Math.max(+m[k]||0,+c[k]||0);});
if(+c.yd===+m.yd)m.yn=Math.max(+m.yn||0,+c.yn||0);else if(+c.yd>+m.yd){m.yd=+c.yd;m.yn=+c.yn||0;}
psFix(m);psFix(c);var a=m.ps,b=c.ps;if(b.k>a.k){a.k=b.k;a.p=b.p;a.f=b.f;a.g=b.g;}else if(b.k===a.k)PSK.forEach(function(k){a[k]=Math.max(a[k],b[k]);});
a.b=Math.max(a.b,b.b);a.n=Math.max(a.n,b.n);}});
var PSK=['p','f','g'];
function psFix(m){var p=m.ps;if(!p||typeof p!=='object'||Array.isArray(p))p=m.ps={};['k','p','f','g','b','n'].forEach(function(k){var x=+p[k];p[k]=isFinite(x)&&x>0?Math.floor(x):0;});
for(var k in p)if('kpfgbn'.indexOf(k)<0||k.length!==1)delete p[k];}
function K(){return S.z3s||(S.z3s={to:0,n:0,hd:0,pg:0,pb:0,sk:0,u:0,v:0});}
function now(){try{return nowMs();}catch(e){return Date.now();}}
function tk(){try{return+todayKey();}catch(e){return 0;}}
function sv(){try{save();}catch(e){}}
function ev(o){Z.ev('z3s',o);}
var X='js/zb3-kiosk-s.js';function xs(){return Z.need(X);}
if(typeof PAY_ITEMS!=='undefined'){
if(F.sub)PAY_ITEMS.vecherka={vk:SUB.vk,ic:'📰',name:'Подписка на «Вечёрку»',desc:'На 30 дней: без рекламы между уровнями, 💡 подсказка каждый день, сканворд подписчика'+(F.ab?' и дорожка четверти в Школе':'')+'. Продлевается, само не списывается',
done:'Подписка оформлена! Почтальонка уже несёт «Вечёрку»',give:function(){subGive();}};
if(F.pig)PAY_ITEMS.kopilka={vk:PIG.vk,ic:'🐷',name:'Копилка на подоконнике',desc:'Разбить копилку — все монеты из неё твои',
done:'Дзынь! Копилка разбита — монеты твои',give:function(){pigGive();}};
if(F.pigp)PAY_ITEMS.kopilka_p={vk:PIG.pvk,ic:'🐷',name:'Копилка: отсыпать '+PIG.part+' монет',desc:'Остальное копится дальше',done:'Отсыпали! Свинка и не заметила',give:function(){pigGive(PIG.part);}};
try{if(F.sub)PAY_TEST.vecherka=99;if(F.pig)PAY_TEST.kopilka=59;if(F.pigp)PAY_TEST.kopilka_p=25;}catch(e){}}
var THS=[{id:'zima',vk:11,n:'Зимний двор',d:'Двор в снегу, ёлка у подъезда и иней на окнах. Навсегда'},
{id:'osen',vk:11,n:'Осенний двор',d:'Золотые клёны, лужи с листьями и рябина у подъезда круглый год. Навсегда'}];
function thAdd(){THS.forEach(function(t){try{var id='th_'+t.id;if(typeof PAY_ITEMS==='undefined'||PAY_ITEMS[id]||!window.THEME||!THEME.get||!THEME.get(t.id))return;
PAY_ITEMS[id]={perm:1,vk:t.vk,ic:'🎨',name:'Оформление «'+t.n+'»',desc:THEME.get(t.id).ds||t.d,done:'Оформление «'+t.n+'» включено!'};
PAY_TEST[id]=79;}catch(e){}});}
thAdd();
function payList(){try{if(PAY.v&&PAY.on)thAdd();['vecherka','kopilka','pass_s'].concat(THS.map(function(t){return'th_'+t.id;})).forEach(function(id){if(PAY_ITEMS[id]&&!PAY.item(id))PAY.list.push({id:id});});}catch(e){}}
function payOn(){try{return typeof PAY!=='undefined'&&PAY.on;}catch(e){return false;}}
function has(id){try{return payOn()&&!!PAY.item(id);}catch(e){return false;}}
var AB0=null,ABT0=null;
function abOld(){try{return!!(F.ab&&AB0&&AB0());}catch(e){return false;}}
function abOldTo(){try{return F.ab&&ABT0?+ABT0()||0:0;}catch(e){return 0;}}
function subOwn(){return F.sub&&+K().to>now();}
function subOn(){return subOwn()||abOld();}
function subTo(){return subOn()?Math.max(subOwn()?+K().to:0,abOld()?abOldTo():0):0;}
function wrapAb(){var E=window.ZBECO;if(!F.ab||!E||typeof E.abonOn!=='function'||E.abonOn.__z3s)return;AB0=E.abonOn;ABT0=E.abonTo;
var a=function(){return subOwn()||AB0.apply(E,arguments);};a.__z3s=1;E.abonOn=a;
var t=function(){return Math.max(subOwn()?+K().to:0,+ABT0.apply(E,arguments)||0);};t.__z3s=1;E.abonTo=t;}
function hideAb(){try{if(!F.ab||typeof PAY==='undefined'||PAY.item.__z3s)return;var f=PAY.item;var w=function(id){return id==='abon'?null:f.apply(PAY,arguments);};w.__z3s=1;PAY.item=w;}catch(e){}}
wrapAb();hideAb();
function subGive(){var z=K(),t=now();z.to=Math.max(t,+z.to||0,subTo())+SUB.days*DAY;z.n=(+z.n||0)+1;ev({a:'buy',k:'sub',n:z.n});sv();
setTimeout(function(){xs().then(function(){KI.daily();},function(){});},1500);ZB.emit('z3sub',{to:z.to});}
function pigAdd(n){if(!F.pig||!(n>0))return;var z=K(),was=+z.pg||0;z.pg=Math.min(PIG.cap,was+n);if(was<PIG.cap&&z.pg>=PIG.cap)ev({a:'full'});}
var pigR=0;
function wrapCoins(){var f=window.addCoins;if(typeof f!=='function'||f.__z3s)return;
var w=function(n,src){var r=f.apply(this,arguments);if(n>0&&src==='lvl'){pigR+=n*PIG.share;var k=Math.floor(pigR);if(k>0){pigR-=k;pigAdd(k);}}return r;};w.__z3s=1;window.addCoins=w;}
function wrapGive(){var E=window.ZBECO;if(!E||typeof E.give!=='function'||E.give.__z3s)return;var f=E.give;
var w=function(src,n){var k=f.apply(E,arguments),x=Math.floor(+n||0)-(+k||0);if(x>0)pigAdd(x);return k;};w.__z3s=1;E.give=w;}
function pigGive(p){var z=K(),c=Math.max(+z.pg||0,PIG.min);if(p)c=Math.min(c,p);z.pg=Math.max(0,(+z.pg||0)-c);z.pb=(+z.pb||0)+1;pigR=0;try{payAdd(c);}catch(e){}ev({a:p?'pigp':'pig',c:c,n:z.pb,r:z.pg});sv();}
if(F.pig){wrapCoins();wrapGive();}
function uzOn(){var s=S;if(s&&s.buy&&s.buy.starter)return false;var d=Z.day();return d>=UZ.from&&d<=UZ.to;}
function wrapUz(){var E=window.ZBECO;if(!E||typeof E.uzelokOn!=='function'||E.uzelokOn.__z3s)return;var w=function(){return uzOn();};w.__z3s=1;E.uzelokOn=w;}
if(F.uz)wrapUz();
var PS={step:6,steps:20,vk:20,late:7,pts:{first:2,lvl:1}};
function mk(){return Math.floor(tk()/100);}
function mNext(k){var y=Math.floor(k/100),m=k%100;return m>=12?(y+1)*100+1:k+1;}
function mLeft(){var d=tk(),y=Math.floor(d/1e4),m=Math.floor(d/100)%100;return new Date(y,m,0).getDate()-d%100+1;}
function P(){var z=K();psFix(z);var p=z.ps,k=mk();if(k&&p.k!==k){p.k=k;p.p=0;p.f=0;p.g=0;}return p;}
function psSteps(){return Math.min(PS.steps,Math.floor(P().p/PS.step));}
function psPaid(){var p=P();return!!(F.pass&&p.k&&(p.b===p.k||p.n===p.k));}
function psGive(){var p=P();if(psPaid())return;p.b=p.k;if(mLeft()<=PS.late)p.n=mNext(p.k);ev({a:'pass_buy',s:psSteps(),n:p.n?1:0});sv();ZB.emit('z3pass',{});}
if(F.pass&&typeof PAY_ITEMS!=='undefined'){PAY_ITEMS.pass_s={vk:PS.vk,ic:'🎫',name:'Пропуск «Сезон двора»',desc:'Платная дорожка сезона до конца месяца: монеты, 💡, наряд Зины и блюдце. Прошлые ступени — сразу. Каждый месяц — свой пропуск',
done:'Пропуск твой! Награды — в ларьке',give:function(){psGive();}};try{PAY_TEST.pass_s=129;}catch(e){}}
var KI=window.Z3KIOSK={F:F,X:X,thAdd:thAdd,payList:payList,PS:PS,P:P,psSteps:psSteps,psPaid:psPaid,mLeft:mLeft,mNext:mNext,TH:THS[0],THS:THS,SUB:SUB,PIG:PIG,SK:SK,K:K,
sub:subOn,subTo:subTo,subOwn:subOwn,has:has,payOn:payOn,ev:ev,now:now,tk:tk,sv:sv,
open:function(from){payList();xs().then(function(){KI.go(from);},function(){try{toast('Ларёк не открылся — проверь интернет',2400);}catch(e){}});}};
function L(k,d){return typeof KI[k]==='function'?KI[k]():d;}
Z.yardAdd({id:'kiosk',order:70,t:'Ларёк',go:function(){KI.open('yard');},
note:function(){return L('note',payOn()?'подписка и копилка':'оформление');},badge:function(){return L('badge','');},hot:function(){return L('hot',false);}});
if(ZB.startHook)ZB.startHook.push(function(o){if(!o||KI.go||(+S.lv||0)<25)return;xs().then(function(){if(KI.yatSt)KI.yatSt(o);},function(){});});
function adX(){return ZB.load('js/zb3-kiosk-ad.js');}KI.mg=function(h,o){if(F.mgad)adX().then(function(){Z3KAD.mg(h,o);},function(){});};
if(F.train)ZB.startHook.push(function(o){if(o&&o.mode==='train')adX().then(null,function(){});});
ZB.on('ready',function(){wrapAb();hideAb();if(F.pig){wrapCoins();wrapGive();}if(F.uz)wrapUz();payList();if(subOn()||(+S.lv||0)>=25)xs().then(null,function(){});});
setTimeout(payList,6000);
Z.late(X,{day:5});
})();
