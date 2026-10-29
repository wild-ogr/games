'use strict';
(function(){
var Z4=window.Z4;if(!Z4||!Z4.on||Z4._soch||typeof S==='undefined')return;Z4._soch=1;
var ZB=window.ZB,ZB2=window.ZB2,Q=location.search,CAP=10,DATA='js/zb4-soch-data.js',XJS='js/zb4-soch-x.js';
function on(k){return Z4.on&&!ZB2.off('z4m')&&!ZB2.off('z4m.'+k);}
var F={so:on('so'),mem:on('mem'),vn:on('vn'),nm:on('nm')&&!!window.Z3MAIL,fut:on('fut')};
if(!F.so&&!F.mem&&!F.vn&&!F.nm&&!F.fut)return;
function Z(){if(!S.z4m||typeof S.z4m!=='object')S.z4m={};return S.z4m;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function sv(){try{save();}catch(e){}}
function snd(){try{SND.tap();}catch(e){}}
function tst(t,ms){try{if(t&&typeof toast==='function')toast(t,ms||3600);}catch(e){}}
function hh(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
var TD=(/[?&]z4md=(\d{8})/.exec(Q)||[])[1],FC=(/[?&]z4mc=([a-z]+)/.exec(Q)||[])[1]||'';
function tk(){return TD?+TD:Z3.tk();}
function T(k){return window.Z4T&&Z4T[k]||[];}
function ev(a,o){o=o||{};o.a=a;Z4.ev('z4m',o);}
function day(){return Z4.day();}
function give(n){var z=Z(),t=tk(),r=0;if(z.cd!==t){z.cd=t;z.cc=0;}var k=Math.min(n,CAP-(+z.cc||0));if(k<=0)return 0;
try{var E=window.ZBECO;if(E&&typeof E.give==='function'){if(E.cap&&!('z4m'in E.cap))E.cap.z4m=CAP;r=E.give('z4m',k,'quest');}else if(typeof addCoins==='function'){addCoins(k,'quest');r=k;}}catch(e){}
z.cc=(+z.cc||0)+r;sv();try{if(typeof updCoins==='function')updCoins();}catch(e){}return r;}
var ld=null;function data(){if(!ld)ld=ZB.load(DATA).catch(function(e){ld=null;throw e;});return ld;}
var lx=null;function ux(){if(!lx)lx=Promise.all([data(),ZB.load(XJS)]).catch(function(e){lx=null;throw e;});return lx;}
var DENY=('смерть гроб могила покойник труп война бомба кровь рана болезнь рак морг похороны убийца убийство враг пьяница водка пиво '+
'вино самогон тюрьма зэк вор бандит нож пистолет ружьё ружье пуля яд зад попа пузо бюст грудь сосок жопа задница').split(' ');
var RU=null;function rude(w){if(RU===null){RU={};try{if(typeof ZINA_RUDE==='string'&&ZINA_RUDE&&typeof h32==='function')ZINA_RUDE.split(' ').forEach(function(x){RU[x]=1;});else RU=null;}catch(e){RU=null;}}
try{return!!(RU&&typeof h32==='function'&&RU[h32(w)]);}catch(e){return false;}}
function clean(w){w=String(w||'').toLowerCase();return/^[а-яё]{3,14}$/.test(w)&&DENY.indexOf(w)<0&&!rude(w);}
function nm(){var m=S.z3m,n=m&&typeof m.nm==='string'?m.nm:'';return Z().nn?'':n;}
var KEEP=/^(Я|Галя|Гали|Валерка|Семён|Семен|Тамара|Люся|Ять|Нина|Петрович|Клава|Зина|Леночка|Тёма|Коля|Толик|Валентина|Москва|Россия|Бог|Господи)$/;
function named(t,n){if(t.length>84||t.indexOf(n)>=0)return'';var m=/^([А-ЯЁ][а-яё]*)([\s,!.?—-][\s\S]*)$/.exec(t);if(!m)return'';
var w=m[1];return n+', '+(KEEP.test(w)&&w!=='Я'?w:w.toLowerCase())+m[2];}
var LVN=0;
function inLevel(){try{var g=typeof G!=='undefined'?G:null,e=document.getElementById('game');return!!(g&&!g.won&&e&&e.classList.contains('on'));}catch(e){return false;}}
function wrapZina(){var f=window.zina;if(!F.nm||typeof f!=='function'||f.__z4m)return;
var w=function(t,mood,sec){var a=arguments;try{if(typeof t==='string'&&LVN<2&&on('nm')){var n=nm();if(n&&inLevel()&&Math.random()<1/6){var t2=named(t,n);if(t2){LVN++;a=[t2,mood,sec];}}}}catch(e){}
return f.apply(this,a);};
for(var k in f)if(Object.prototype.hasOwnProperty.call(f,k))w[k]=f[k];w.__z4m=1;window.zina=w;}
var LW=[],RARE='',LAST={w:[],lv:0},MEMNEW='',LN={so:'',mem:''},wins=0;
Z4.onStart(function(){LW=[];RARE='';MEMNEW='';LVN=0;wrapZina();});
Z4.onWord(function(o){var w=String(o.w||'').toLowerCase();if(!clean(w))return;if(LW.indexOf(w)<0)LW.push(w);
if(!o.byHint&&!o.bonus&&w.length>=7&&w.length>RARE.length)RARE=w;});
Z4.onWin(function(i){wins++;LAST={w:LW.slice(0,12),lv:i.lv};
if(F.mem&&on('mem')&&RARE){var z=Z(),t=tk(),L=z.mw?String(z.mw).split(','):[];
if(z.md!==t&&L.indexOf(RARE)<0){L.push(RARE);if(L.length>30)L=L.slice(-30);z.mw=L.join(',');z.mc=(+z.mc||0)+1;z.md=t;MEMNEW=RARE;ev('mem',{n:z.mc});sv();}}
mailHook();setTimeout(mark,400);setTimeout(mark,1500);});
var DEFW={so:'📝 Зина сочинила из твоих слов. Прочитать ›',mem:'📖 Зина вписала главу в мемуары. Прочитать ›'};
if(F.mem)Z4.winLine.add({id:'z4m.mem',order:45,txt:function(){if(!on('mem')||!MEMNEW)return'';
LN.mem='📖 Зина вписала в мемуары главу «'+MEMNEW.toUpperCase()+'». Прочитать ›';return LN.mem;}});
if(F.so)Z4.winLine.add({id:'z4m.so',order:55,txt:function(i){if(!on('so')||LAST.w.length<3||i.daily&&LAST.w.length<4)return'';
if((+Z().sn||0)>=3&&wins%2)return'';var L=T('z4m.win');LN.so=L.length?'📝 '+L[hh('w'+i.lv)%L.length].replace(/^\s*📝\s*/,'')+' ›':DEFW.so;return LN.so;}});
function mine(t){t=String(t||'').replace(/\s+/g,' ').trim();if(t&&t===LN.so)return'so';if(t&&t===LN.mem)return'mem';return'';}
function mark(){[].forEach.call(document.querySelectorAll('.z4wl'),function(d){if(mine(d.textContent)&&!d.classList.contains('z4m-wl')){d.classList.add('z4m-wl');d.setAttribute('role','button');d.tabIndex=0;css();}});}
document.addEventListener('click',function(e){var d=e.target&&e.target.closest?e.target.closest('.z4wl'):null;if(!d)return;var k=mine(d.textContent);if(!k)return;
e.stopPropagation();snd();if(k==='so')openSo();else ZB.safe('z4m-mem',function(){X.ov('mem',{});});},true);
function openSo(){ev('so',{k:'so'});ux().then(function(){ZB.safe('z4m-so',function(){X.ov('so',{w:LAST.w.slice(),lv:LAST.lv});});},function(){tst('Не загрузилось — попробуй ещё раз');});}
function visit(){if(/[?&]z4mv=1/.test(Q))return true;var t=tk(),md=t%10000,d=new Date(Math.floor(t/1e4),Math.floor(md/100)-1,md%100).getDay();
if(md>=601&&md<=831||md>=1026&&md<=1103||md>=1228||md<=110||md>=322&&md<=330)return true;return d===0||d===6;}
function vnToday(){return F.vn&&on('vn')&&visit()&&Z().vd!==tk();}
function futDue(){var z=Z();if(!F.fut||!on('fut')||+z.fs!==1||!z.ft)return false;return/[?&]z4mf=1/.test(Q)||Z3.days(z.ft,tk())>=30;}
function futLetter(){if(!futDue())return Promise.resolve(null);var z=Z(),id='z4mf-'+z.ft;
return data().then(function(){var p=String(z.fp||'').split(','),A=T('z4m.fa'),B=T('z4m.fb'),C=T('z4m.fc'),ok=(+S.lv||0)>=(+z.fg||0);
function g(L,i){return L.length?L[(+i||0)%L.length]:'';}
var lv=+z.fg||0,b=g(B,p[1]).replace(/\{lv\}/g,lv),c=ok?g(T('z4m.fd'),hh(id)):g(T('z4m.fe'),hh(id));
var t=[g(A,p[0]),b,g(C,p[2])].filter(Boolean).join('\n')+'\n\n'+String(c||'').replace(/\{lv\}/g,lv).replace(/\{name\}/g,nm()||'внучек');
return{i:id,h:'Письмо из прошлого',t:t};},function(){return null;});}
function futDone(){var z=Z();if(+z.fs===1){z.fs=2;z.fw=tk();ev('fut',{s:'got',ok:(+S.lv||0)>=(+z.fg||0)?1:0});sv();}}
function cp(a,b){for(var k in a)if(Object.prototype.hasOwnProperty.call(a,k)&&!(k in b))b[k]=a[k];}
function mailHook(){var P=window.Z3PAPER;if(!F.fut||!P)return;var o=P.evMail,od=P.evMailDone;if(o&&o.__z4m)return;
var w=function(){var a=arguments,self=this,b=o?Promise.resolve().then(function(){return o.apply(self,a);}):Promise.resolve(null);
return b.then(function(r){return r||futLetter();},function(){return futLetter();});};
var wd=function(i){if(/^z4mf-/.test(String(i||''))){futDone();return;}if(od)return od.apply(this,arguments);};
if(o)cp(o,w);if(od)cp(od,wd);w.__z4m=1;wd.__z4m=1;P.evMail=w;P.evMailDone=wd;}
function futOffer(){var z=Z();if(!F.fut||!on('fut')||day()<6||(+S.lv||0)<15)return false;
if(+z.fs===1)return false;if(+z.fs===2&&Z3.days(z.fw,tk())<60)return false;return hh('f'+tk())%3===0;}
function nmAsk(){var z=Z();if(!F.nm||!on('nm')||nm()||+z.nn||+z.nq===1)return false;return!z.nq||Z3.days(z.nq,tk())>=3;}
function what(){if(FC)return FC;var z=Z();if(nmAsk())return'nm';if(vnToday())return'vn';if(F.mem&&on('mem')&&(+z.mv||0)<(+z.mc||0))return'mem';if(futOffer())return'fut';return'';}
var CARD={nm:['🙋','Как Зине тебя звать?','Сорок лет по журналу звала — а тебя не знает','Сказать'],
vn:['👦','Внук Тёма приехал','Говорит не по-нашему. Нужен переводчик','Перевести'],
mem:['📖','Мемуары Зины: новая глава','Из твоего слова — читай первой','Читать'],
fut:['✉️','Письмо себе в будущее','Зина спрячет и вручит через 30 дней','Написать']};
var shown={};
Z4.card.add({id:'z4m',order:30,show:function(){return!!what();},
html:function(){css();var k=what(),c=CARD[k];if(!c)return'';
return'<div class="z4m-cd" data-k="'+k+'"><span class="z4m-ci">'+c[0]+'</span><span class="z4m-ct"><b>'+esc(c[1])+'</b><small>'+esc(c[2])+'</small></span>'+
'<button type="button" class="btn z4m-go">'+esc(c[3])+'</button></div>';},
mount:function(el){var d=el&&el.querySelector('.z4m-cd');if(!d)return;var k=d.getAttribute('data-k');mailHook();
if(!shown[k]){shown[k]=1;ev('card',{k:k});}d.onclick=function(){snd();ZB.go('z4m',{v:k});};}});
function home(){try{if(typeof openMenu==='function')openMenu();else ZB.go('home');}catch(e){}}
ZB.screen('z4m',{title:'Твои слова',render:function(el,op){css();op=op||{};
if(X.render){ZB.safe('z4m:'+op.v,function(){X.render(el,op);});return;}
el.innerHTML='<div class="z4m-scr"><p class="z4m-wait">Зина ищет очки…</p></div>';
ux().then(function(){if(ZB.cur==='z4m')ZB.safe('z4m:'+op.v,function(){X.render(el,op);});},function(){tst('Не загрузилось — попробуй ещё раз');home();});}});
function papIns(el,op){if(!vnToday()||!el||op&&(op.r||op.pg||op.arch||op.dn!=null)||el.querySelector('.z4m-pap'))return;
var sh=el.querySelector('.z3p-sheet');if(!sh)return;
data().then(function(){if(ZB.cur!=='z3paper'||el.querySelector('.z4m-pap')||!vnToday())return;var L=T('z4m.vn'),z=Z(),it=L.length?String(L[(+z.vk||0)%L.length]).split('|'):[],hd=T('z4m.vnh');
var d=document.createElement('div');d.className='z4m-pap';css();var n=nm();
d.innerHTML='<b>👦 Внук приехал: бабушкин переводчик</b><p>'+esc(hd.length?hd[hh('h'+tk())%hd.length]:'Тёма на каникулах. Говорит — вроде по-русски, а не понять.')+'</p>'+
(it[0]?'<p>Тёма: «'+esc(n?'Привет, '+n+'! ':'')+'Ба, это прям '+it[0]+'». Что по-нашему?</p>':'')+
'<button type="button" class="btn z4m-pgo" style="min-height:44px">Перевести ›</button>';
var arb=sh.querySelector('.z3p-arb');if(arb)sh.insertBefore(d,arb);else sh.appendChild(d);
d.querySelector('.z4m-pgo').onclick=function(){snd();ZB.go('z4m',{v:'vn',back:'paper'});};},function(){});}
function papHook(){var P=window.Z3PAPER;if(!F.vn||!P||typeof P.render!=='function'||P.render.__z4m)return;var o=P.render;
var w=function(el,op){var r=o.apply(this,arguments);ZB.safe('z4m-pap',function(){papIns(el,op||{});});return r;};cp(o,w);w.__z4m=1;P.render=w;}
ZB.on('screen',function(id){if(id!=='zb-z3paper'&&id!=='z3paper')return;papHook();setTimeout(function(){ZB.safe('z4m-pap',function(){papHook();
var el=document.getElementById('zb-z3paper');if(el&&ZB.cur==='z3paper'&&!el.querySelector('.z3p-game'))papIns(el,{});});},80);});
if(F.vn&&ZB._scr&&ZB._scr.z3paper){var sc=ZB._scr.z3paper,s0=sc.render;
sc.render=function(el,op){var r=s0.apply(this,arguments);ZB.safe('z4m-pap',function(){papHook();if(!op||!(op.r||op.pg||op.arch||op.dn!=null))setTimeout(function(){papIns(el,op||{});},60);});return r;};}
var X=window.Z4M={F:F,on:on,Z:Z,esc:esc,sv:sv,snd:snd,tst:tst,hh:hh,tk:tk,T:T,ev:ev,give:give,nm:nm,clean:clean,home:home,data:data,visit:visit,futDue:futDue,
last:function(){return LAST;},so:function(){openSo();},words:function(){return LW.slice();}};
X.ov=function(k,o){ux().then(function(){if(X.ovo)ZB.safe('z4m-ov',function(){X.ovo(k,o||{});});},function(){tst('Не загрузилось — попробуй ещё раз');});};
var c0=0;function css(){if(c0)return;c0=1;var s=document.createElement('style');s.setAttribute('data-z4m','1');s.textContent=
'.z4m-cd{display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;background:var(--z3-card,#fff);border-radius:var(--z3-rb,16px);box-shadow:var(--z3-shadow);color:var(--z3-ink,#27324a);cursor:pointer}'+
'.z4m-ci{flex:0 0 46px;width:46px;height:46px;display:flex;align-items:center;justify-content:center;font-size:30px}'+
'.z4m-ct{flex:1 1 auto;min-width:0;display:flex;flex-direction:column}.z4m-ct b{font-size:16px}.z4m-ct small{font-size:14px;color:var(--z3-ink2,#5d6781)}'+
'.z4m-go{flex:0 0 auto;min-height:44px;padding:0 14px;font-size:15px}'+
'.z4m-wl{cursor:pointer;text-decoration:underline;text-underline-offset:3px;min-height:44px;display:flex!important;align-items:center;justify-content:center;color:var(--z3-acc,#c2410c)}'+
'.z4m-pap{margin:12px 0;padding:10px 12px;border:2px dashed var(--z3-line,#e6dcc8);border-radius:12px;background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);font-size:15px;line-height:1.4}'+
'.z4m-pap p{margin:6px 0}.z4m-scr{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--z3-bg,#f6efe3);color:var(--z3-ink,#27324a)}.z4m-wait{padding:40px 16px;text-align:center}';
document.head.appendChild(s);}
Z3.whenReady(function(){wrapZina();mailHook();papHook();});
ZB.on('z3late',function(){ZB.safe('z4m-mail',mailHook);});ZB.on('home',function(){ZB.safe('z4m-mail',mailHook);});
try{ZB.refresh();}catch(e){}
})();
