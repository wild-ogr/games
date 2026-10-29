'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.SHK||Z.SHK.s)return;
var X=Z.SHK,O=X.on;X.s=1;
var Q=location.search,FK=(/[?&]z4x=([a-z]+)/.exec(Q)||[])[1]||'',FP=/[?&]z4xp=1/.test(Q);
var LV={ant:60,ege:30,dk:30,yat:40,otl:30};
function now(){var t=0;try{t=typeof nowMs==='function'?nowMs():Date.now();}catch(e){t=Date.now();}return new Date(t);}
function tk(d){d=d||now();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function ym(d){d=d||now();return d.getFullYear()*100+d.getMonth()+1;}
function mon(){var d=now(),w=(d.getDay()+6)%7;return tk(new Date(d.getFullYear(),d.getMonth(),d.getDate()-w));}
function sat1(d){d=d||now();var f=new Date(d.getFullYear(),d.getMonth(),1),k=(6-f.getDay()+7)%7;return tk(new Date(d.getFullYear(),d.getMonth(),1+k));}
function zz(){if(typeof S==='undefined'||!S)return{};if(!S.z4x||typeof S.z4x!=='object')S.z4x={ab:''};return S.z4x;}
function lv(){return typeof S!=='undefined'&&S?+S.lv||0:0;}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function ev(a,o){o=o||{};o.a=a;Z.ev('z4x',o);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
X.now=now;X.tk=tk;X.ym=ym;X.mon=mon;X.sat1=sat1;X.zz=zz;X.sv=sv;X.ev=ev;X.esc=esc;
X.data=function(){return window.Z4XD?Promise.resolve():ZB.load('js/zb4-shkola-data.js');};
X.lvs=function(){return window.Z4XL?Promise.resolve():ZB.load('js/zb4-shkola-lv.js');};
X.x=function(){return Promise.all([X.data(),window.Z4SX?Promise.resolve():ZB.load('js/zb4-shkola-x.js')]);};
X.open=function(k,o){ev('open',{k:k});X.x().then(function(){if(window.Z4SX)Z4SX.open(k,o||{});},function(){try{toast('Не загрузилось — попробуй ещё раз',3000);}catch(e){}});};
function can(k){return!!O[k]&&Z.open('z4x.'+k)&&(lv()>=LV[k]||FK===k||FK==='dks'&&k==='dk');}
X.can=can;
X.page=function(){var b=zz().ab||'',n=window.Z4XD?Z4XD.tet.length:26;for(var i=0;i<n;i++)if(b.charAt(i)!=='1')return i;return-1;};
X.dkDay=function(){return FK==='dk'||FK==='dks'?tk():sat1();};
X.dkPhase=function(){var d=now(),h=d.getHours(),z=zz();if(FK==='dk')return+z.dm===ym()?'':'now';if(FK==='dks')return'soon';
if(tk(d)!==sat1(d)||+z.dm===ym())return'';return h<12?'soon':h<14?'now':'';};
X.yatDue=function(){var c=Math.floor(lv()/20)+1;return FK==='yat'||zz().yc<c;};
function due(k){var z=zz(),t=tk();if(!can(k))return false;if(FK)return FK===k||(FK==='dks'&&k==='dk');
if(k==='ant')return X.page()>=0&&+z.ap<mon();
if(k==='ege')return+z.em!==ym();
if(k==='dk')return!!X.dkPhase();
if(k==='yat')return X.yatDue();
if(k==='otl')return+z.od!==t;return false;}
X.due=due;
var ORD=['dk','ege','ant','yat','otl'];
function first(skip){for(var i=0;i<ORD.length;i++)if(ORD[i]!==skip&&due(ORD[i]))return ORD[i];return'';}
X.first=first;
var CH={ant:['📒','Тетрадь 1975 года','z4x.ant.card','Новая страница — слово, которого больше нет'],
ege:['🎓','Экзамен месяца у Зины','z4x.ege.card','20 заданий — и аттестат с подписью'],
dk:['✍️','Диктант дома','z4x.dk.now','Сегодня в 12:00 — весь подъезд пишет'],
yat:['🐈','Уровень с ятем','z4x.yat.card','Ять покажет, как писали до 1918 года'],
otl:['👩‍🏫','У доски','z4x.otl.intro','15 вопросов — кто дойдёт до пятёрки?']};
function sub(k){var c=CH[k],key=k==='dk'&&X.dkPhase()==='soon'?'z4x.dk.soon':c[2];return Z.txt(key)||(k==='dk'&&X.dkPhase()==='now'?'Диктант идёт до 14:00 — садись, бери ручку':c[3]);}
var shown='';
Z.card.add({id:'z4x',order:55,show:function(){return!!first();},
html:function(){var k=first(),c=CH[k];if(!c)return'';if(shown!==k+tk()){shown=k+tk();ev('show',{k:k});}
return'<div class="z4x-c" style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;border-radius:var(--z3-rb,16px);background:var(--z3-card,#fff);box-shadow:var(--z3-shadow);color:var(--z3-ink,#27324a);font-family:var(--z3-font)">'+
'<span style="font-size:30px;line-height:1">'+c[0]+'</span><span style="flex:1;min-width:0;text-align:left"><b style="display:block;font-size:16px">'+esc(c[1])+'</b>'+
'<small style="display:block;font-size:14px;color:var(--z3-ink2,#5d6781)">'+esc(sub(k))+'</small></span>'+
'<button type="button" class="btn green small z4x-cb" data-k="'+k+'" style="min-height:44px">Открыть</button></div>';},
mount:function(el){var b=el&&el.querySelector('.z4x-cb');if(!b)return;b.onclick=function(){try{SND.tap();}catch(e){}X.open(b.getAttribute('data-k'),{from:'card'});};}});
X.data().catch(function(){});
var wlK='',wlG=null,NM={ege:'Экзамен месяца',yat:'Уровень с ятем',otl:'«У доски»',ant:'Тетрадь 1975 года',dk:'Диктант дома'};
Z.winLine.add({id:'z4x',order:55,txt:function(i){wlK='';wlG=null;if(i.daily||i.mode||!i.G)return'';
var k=first('dk');if(!k||k==='ant')return'';wlK=k;wlG=i.G;
var t=Z.txt('z4x.wl',{t:NM[k]})||NM[k]+' ждёт';return'🎓 '+t+' ›';}});
document.addEventListener('click',function(e){var t=e.target;while(t&&t!==document&&!(t.classList&&t.classList.contains('z4wl')))t=t.parentNode;
if(!t||t===document||!wlK||typeof G==='undefined'||G!==wlG||String(t.textContent).indexOf('🎓')!==0)return;
var k=wlK;wlK='';try{SND.tap();}catch(x){}try{hideModal();}catch(x){}X.open(k,{from:'win'});},true);
Z.onWord(function(o){var g=o.G;if(!g||!g.z4x||g.z4x.k!=='yat'||!window.Z4XD)return;var y=Z4XD.yat[o.w];if(!y)return;
g.z4x.got=g.z4x.got||[];if(g.z4x.got.indexOf(o.w)<0)g.z4x.got.push(o.w);
try{zina('«'+y[0]+'». '+y[1],'wow',7);}catch(e){}});
Z.onWord(function(o){var g=o.G;if(!g||!g.z4x||g.z4x.k!=='ant'||!window.Z4XD||o.w!==g.lv.d)return;var t=Z4XD.tet[g.z4x.i];
if(t)try{zina(t[2],'happy',8);}catch(e){}});
function dkPaper(){if(!can('dk'))return'';if(FP)return String(tk());var d=now(),s=sat1(d),t=tk(d);
if(t<s||(t===s&&d.getHours()<13))return'';var a=new Date(Math.floor(s/1e4),Math.floor(s/100)%100-1,s%100+7);return t<tk(a)?String(s):'';}
X.dkPaper=dkPaper;
var pend=0;
function papIns(el,op){op=op||{};if(pend||!el||op.arch||op.r||op.pg||op.dn!=null||ZB.cur!=='z3paper')return;var s=dkPaper();if(!s)return;
pend=1;X.x().then(function(){pend=0;var sh=el.querySelector('.z3p-sheet');if(!sh||sh.querySelector('.z4x-pap')||ZB.cur!=='z3paper'||!window.Z4SX)return;
var d=document.createElement('div');d.className='z4x-pap';
d.style.cssText='margin:10px 0;padding:10px 12px;border-radius:12px;background:var(--z3-paper,#fbf7ec);border:1px dashed var(--z3-line,#e6dcc8);text-align:left;color:var(--z3-ink,#27324a)';
d.innerHTML='<b style="display:block;font:700 16px/1.3 var(--z3-font-news,Georgia,serif)">✍️ Диктант дома: самая частая ошибка</b><p class="z4x-pt" style="margin:6px 0 0;font-size:15px;line-height:1.35">Зина проверяет тетради…</p>';
var arb=sh.querySelector('.z3p-arb');if(arb)sh.insertBefore(d,arb);else sh.appendChild(d);
Z4SX.paper(s).then(function(t){var p=d.querySelector('.z4x-pt');if(p&&t)p.textContent=t;else if(!t)d.remove();},function(){d.remove();});},function(){pend=0;});}
function papWrap(){var P=window.Z3PAPER;if(!P||typeof P.render!=='function'||P.render.__z4x)return!!(P&&P.render&&P.render.__z4x);
var r0=P.render,w=function(el,op){var r=r0.apply(this,arguments);ZB.safe('z4x-pap',function(){papIns(el,op);});return r;};for(var k in r0)w[k]=r0[k];w.__z4x=1;P.render=w;return true;}
if(O.dk&&ZB._scr&&ZB._scr.z3paper){var sc=ZB._scr.z3paper,s0=sc.render;
sc.render=function(el,op){var r=s0.apply(this,arguments);var P=window.Z3PAPER;
if(P&&!papWrap()&&P.x)P.x().then(function(){papWrap();ZB.safe('z4x-pap',function(){papIns(el,op);});},function(){});
else ZB.safe('z4x-pap',function(){papIns(el,op);});return r;};}
})();
