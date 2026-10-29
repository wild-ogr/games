(function(){'use strict';
var W=window;
if(!W.V3||!W.V3UX||!W.V3UXL||!V3.reg)return;
V3.reg('ux.build',{s:'UX',t:'постройки Моего двора в ядре: стоянка +1 место, голубь, эвакуатор'});
var UX=V3UX,X=V3UXL,B={};
function on(p){return V3.is('ux.'+p);}
function ok(f,d){try{return f();}catch(e){return d;}}
function Lg(a,b){return ok(function(){return L(a,b);},a);}
function g0(){return ok(function(){return G;},null);}
function dk(){return UX.dk();}
function u(){return UX.u();}
function tst(t,ms){ok(function(){toast(t,ms||(W.VYSAY?VYSAY.ms(t):3500));});}
function ev(k,o){var x={k:k};for(var i in o)x[i]=o[i];ok(function(){V3.ev('ux',x);});}
function has(id){if(!on('build'))return false;return!!B[id]||ok(function(){return UX.builds().indexOf(id)>=0;},false);}
V3.sub('ux:build',function(id){if(id==='tow')id='garage';if(id)B[id]=1;},'ux.build');
UX.has=has;
var said={};
function placeKind(K){return!!(K&&K.L&&(K.kind==='pocket'||K.kind==='shop'));}
function wrapK(){var K0=W.V3K;if(!K0||K0.__uxb||typeof K0.begin!=='function'||typeof K0.pre!=='function')return false;K0.__uxb=1;
var b0=K0.begin,p0=K0.pre;
K0.begin=function(g){var r=b0.apply(this,arguments);
try{var K=g&&g.v3k;if(placeKind(K)&&!K.park&&has('park')){K.park=1;if(K.kind==='pocket')K.L.K++;else K.L.cap++;
ev('bpark',{i:(g.idx|0)+1});
if(!said.park){said.park=1;setTimeout(function(){if(g0()===g&&!g.over)tst(K.kind==='pocket'?Lg('🅿 Стоянка «Моего двора»: +1 место в кармане','🅿 Your yard’s parking: +1 pocket spot'):Lg('🅿 Стоянка «Моего двора»: +1 место у магазина','🅿 Your yard’s parking: +1 shop spot'));},1600);}}}catch(e){}
return r;};
K0.pre=function(v){try{var g=g0(),K=g&&g.v3k;
if(placeKind(K)&&v&&!g.over&&on('stage')&&(K.unc||!V3.is('deep.uncle'))){var fits=K.kind==='pocket'?K0.pocketOk(K.L,K.st,v.id):K0.shopOk(K.L,K.st,v.id);
if(!fits&&UX.hold()&&UX.holdUse()){K.held=1;if(K.kind==='pocket')K.L.K++;else K.L.cap++;UX.note('hold','');
tst(Lg('🪑 Шура держит место у подъезда — эта машина встанет туда (раз в день)','🪑 Shura holds a spot by the entrance — this car goes there (once a day)'));}}}catch(e){}
return p0.apply(this,arguments);};
return true;}
if(!wrapK())V3.sub('boot',wrapK,'ux.build');
function garOk(){return has('garage')&&u().tw!==dk();}
ok(function(){UI.on('yard-start',function(o){var g=g0();if(!g||!o||o.daily||g.towFree||!garOk())return;
g.towFree=1;g.v3gar=1;ok(function(){updCoins();});ok(function(){var b=document.getElementById('gTow');if(b)b.style.display='';});
if(!said.gar){said.gar=1;setTimeout(function(){if(g0()===g&&g.towFree&&!g.over)tst(Lg('🚚 Гараж Толика: эвакуатор сегодня бесплатно (раз в день)','🚚 Tolik’s garage: a free tow today (once a day)'));},2200);}});});
ok(function(){W.yardHook.push(function(){var g=g0();if(!g||!g.v3gar)return;g.v3gar=0;
if(!g.towFree){u().tw=dk();UX.sv();ev('bgar',{});}else g.towFree=0;});});
function pgOk(){var g=g0();return has('pigeon')&&u().pg!==dk()&&!!g&&!g.over&&!g.daily&&g.mode!=='rush'&&!ok(function(){return S.freeHint;},0);}
function pgHint(){var g=g0(),w=g.p.w,h=g.p.h,cand=g.vs.filter(function(v){return v.state==='idle'&&canExit(v,g.occ,w,h,v.id).free;});if(!cand.length)return false;
var best=g.v3k&&W.V3K&&V3K.hintPick?ok(function(){return V3K.hintPick(cand);},null):null;
if(!best&&g.amb&&!g.amb.done)best=ok(function(){var need=closureOf(g.vs,g.occ,w,h,g.amb.id);return cand.filter(function(v){return v.id===g.amb.id;})[0]||cand.filter(function(v){return need.has(v.id);})[0];},null);
best=best||cand.filter(function(v){return v.id===g.police;})[0]||cand[Math.floor(Math.random()*cand.length)];
u().pg=dk();UX.sv();ok(function(){STAT.use('hint');});g.hint=best.id;g.hintT=4;g.hintQ=g.v3k?[]:ok(function(){return hintChain(best.id);},[]);g.helps++;
ok(function(){SND.coin();});tst(Lg('🕊 Голубь с голубятни показал, кому ехать (раз в день)','🕊 The dovecote pigeon shows who goes (once a day)'));ok(function(){updCoins();});ev('bpig',{i:(g.idx|0)+1});return true;}
function wrapHint(){if(typeof W.hint!=='function'||W.hint.__uxb)return;var h0=W.hint;
W.hint=function(mode){if(!mode&&pgOk()&&ok(function(){return!modalOn;},true)&&pgHint())return;return h0.apply(this,arguments);};W.hint.__uxb=1;
if(typeof W.updCoins==='function'&&!W.updCoins.__uxb){var c0=W.updCoins;W.updCoins=function(){var r=c0.apply(this,arguments);
try{if(pgOk()){var e=document.getElementById('hintPr');if(e)e.textContent=Lg('🕊 бесплатно','🕊 free');}}catch(x){}return r;};W.updCoins.__uxb=1;}}
wrapHint();
V3.sub('quarter:thing',function(o){var it=null;ok(function(){var a=V3QS.things();for(var i=0;i<a.length;i++)if(a[i].id===(o&&o.id))it=a[i];});
UX.qNew=1;tst('🧹 '+Lg('На «Моём дворе» новое: ','New in My yard: ')+(it?(it.ic?it.ic+' ':'')+it.t:Lg('вещь с субботника','a thing from the clean-up')),4500);ev('qthing',{id:o&&o.id});},'ux.my');
function isOK(){return ok(function(){return!!OK;},false);}
function vkOn(){return ok(function(){return PLAT==='vk'&&!!VK;},false);}
UX.fotoShareOk=function(){return V3.is('ux.gar')&&vkOn();};
function fotoCard(cv,name){var c=document.createElement('canvas');c.width=720;c.height=900;var x=c.getContext('2d');if(!x)return'';
x.fillStyle='#fbf3df';x.fillRect(0,0,720,900);x.strokeStyle='#8a6a4a';x.lineWidth=10;x.strokeRect(20,20,680,860);
var w=600,h=Math.min(560,Math.round(w*cv.height/Math.max(1,cv.width)));x.fillStyle='#fff';x.fillRect(52,72,616,h+16);x.drawImage(cv,60,80,w,h);
x.fillStyle='#3b2a1a';x.textAlign='center';x.font='bold 42px Georgia,serif';x.fillText(Lg('Новая машина во дворе!','A new car in the yard!'),360,h+160);
x.font='34px Georgia,serif';x.fillText(String(name||''),360,h+212);x.font='italic 28px Georgia,serif';x.fillText(Lg('Снимал Валерка, улыбалась баба Шура','Shot by Valerka, Granny Shura smiled'),360,h+262);
x.fillStyle='#8a6a4a';x.font='24px sans-serif';x.fillText(Lg('«Выезд со двора»','“Yard Escape”'),360,860);
try{return c.toDataURL('image/jpeg',.86);}catch(e){return'';}}
UX.fotoShare=function(cv,name){if(!UX.fotoShareOk())return;ev('fshare',{p:isOK()?'ok':'vk'});
ok(function(){if(isOK()){vkSend('VKWebAppShowWallPostBox',{message:Lg('Новая машина во дворе — ','A new car in the yard — ')+String(name||'')+'!'+(ok(function(){return OK_LINK;},'')?'\n'+OK_LINK:'')},60000).then(function(){ev('fshare',{r:'ok'});},function(){ev('fshare',{r:'no'});});return;}
var img=fotoCard(cv,name);if(!img)return;vkSend('VKWebAppShowStoryBox',{background_type:'image',blob:img},60000).then(function(){ev('fshare',{r:'ok'});},function(){ev('fshare',{r:'no'});});});};
V3.sub('money:cartype',function(id){if(id)UX.note('ct',String(id));},'ux.stage');
})();