'use strict';
(function(){
if(!window.ZB||!window.RSD)return;
var RS=window.RS,ON=RS&&RS.on?!!RS.on('today'):true,D=document;
function sf(id,f){return ZB.safe('rst:'+id,f);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function tap(){try{SND.tap();}catch(e){}}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
var ON0=RSD.on,isOpen=RSD.open,wkEv=RSE.week,evGo=RSE.go,lv=function(){return+S.lv||0;};
function fest(){var F=window.FESTZB;if(!F||!F.now||lv()<3)return null;var n=sf('fnow',function(){return F.now();});if(!n)return null;
var ev=F.ev&&F.ev[n.k]||{},all=+ev.n||0,d=+F.doneN(n.id)||0;return{k:n.k,id:n.id,ic:n.ic,t:n.title,d:d,n:all,left:+n.left||0};}
function season(){var A=window.ZBSEA;if(!A||!A.cur||lv()<3)return null;var c=sf('scur',function(){return A.cur();});if(!c||!c.s)return null;
return{id:c.s.id,ic:c.s.ic,t:c.s.id==='osen'?'Осень у Зины':c.s.n,st:+sf('sst',function(){return A.steps();})||0,of:+(A.CFG&&A.CFG.steps)||30};}
function cur(){if(!ON0||!isOpen('event'))return null;var f=fest(),s=season(),w=wkEv(),r=null,more=w?{t:w.t,go:function(){evGo(w);}}:null;
if(s&&s.id==='osen'){var fh=f&&f.k==='hw'?f:null;r={id:'osen',ic:s.ic,t:s.t+' · '+s.st+' из '+s.of,
sub:fh?'страшилка дня: '+fh.d+' из '+fh.n+(fh.left>0?' · ещё '+fh.left+' '+pl(fh.left,'день','дня','дней'):''):'шаг за каждый урок',
go:function(){tap();if(fh&&fh.d<fh.n&&window.FESTZB)FESTZB.open(fh.k);else ZBSEA.open();}};if(fh)f=null;}
if(f&&!r)r={id:'fest',ic:f.ic,t:f.t+' · '+f.d+' из '+f.n,sub:f.left>1?'ещё '+f.left+' '+pl(f.left,'день','дня','дней'):'последний день',go:function(){tap();FESTZB.open(f.k);}};
if(!r&&s)r={id:'sea',ic:s.ic,t:s.t+' · '+s.st+' из '+s.of,sub:'шаг за каждый урок',go:function(){tap();ZBSEA.open();}};
if(r){r.more=more;return r;}
if(w)return{id:w.id,ic:w.ic,t:w.t,sub:'событие недели: '+w.sub,go:function(){evGo(w);},more:null};return null;}
RSE.cur=cur;
ZB.add(ZB.homeSlots,{id:'rs-event',order:10,zone:'rs-event',render:function(){var e=cur();if(!e)return'';ecssF();
return'<div class="rse-w"><button type="button" class="rse"><span class="rse-i">'+e.ic+'</span><span class="rse-b"><small>Событие</small><b>'+esc(e.t)+'</b><span>'+esc(e.sub)+'</span></span><em>›</em></button>'+
(e.more?'<button type="button" class="rse-m">И ещё на этой неделе: <b>'+esc(e.more.t)+'</b> ›</button>':'')+'</div>';},
mount:function(el){var e=cur();if(!e)return;var b=el.querySelector('.rse'),m=el.querySelector('.rse-m');if(b)b.onclick=function(){sf('ego',e.go);};if(m&&e.more)m.onclick=function(){sf('emo',e.more.go);};}});
var ecss=0;function ecssF(){if(ecss)return;ecss=1;var s=D.createElement('style');s.id='rsdCss';s.textContent=
'.rse-w{border-radius:16px;background:#fbf7ec;box-shadow:0 3px 0 #e4d9c2,0 6px 14px rgba(39,50,74,.08)}'+
'.rse{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:10px 14px;border:0;border-radius:16px;background:none;color:#27324a;text-align:left;font:inherit;cursor:pointer}'+
'.rse-i{font-size:30px;line-height:1}.rse-b{flex:1;min-width:0;display:flex;flex-direction:column}.rse-b small{font-size:15px;color:#8a6a3a;font-weight:700}'+
'.rse-b b{font-size:18px;line-height:1.2}.rse-b span{font-size:15px;color:#5a6276;line-height:1.25}.rse em{font-style:normal;font-size:24px;color:#2563c9}'+
'.rse-m{display:block;width:100%;min-height:48px;margin:0;border:0;border-top:1px solid #eadfc8;background:none;color:#2563c9;font:inherit;font-size:16px;text-align:left;padding:4px 14px;cursor:pointer}';
D.head.appendChild(s);}
if(!ON){ZB.refresh();return;}
function tk(){try{return todayKey();}catch(e){return 0;}}
function sv(){try{save();}catch(e){}}
function $(id){return D.getElementById(id);}
function coin(){return'монет';}
function wd(){var k=tk();return new Date(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100,12).getDay();}
function noOld(){if(window.ZBTD_CFG)ZBTD_CFG.need=99;var e=window.ZBECO&&ZBECO.school;if(e)e.need=99;}
noOld();ZB.on('ready',noOld);
function T(){var z=RSD.z(),t=z.t;if(!t||+t.d!==tk()){t=z.t={d:tk(),m:{},w:0,r:0,f:0,p:0,L:null,x:''};}if(!t.m)t.m={};return t;}
function task(id){var L=ZB.todayTasks;for(var i=0;i<L.length;i++)if(L[i].id===id){var x=L[i];
return sf('on:'+id,function(){return(!x.on||x.on()!==false)&&!(x.off&&x.off());})!==false?x:null;}return null;}
function z4card(){var t=T(),L=window.Z4&&Z4.on&&Z4.card&&Z4.card.L||[],ok=function(c){return RSD.cardOpen(c.id)&&!!sf('c4:'+c.id,function(){return c.show();});};
if(t.x){for(var i=0;i<L.length;i++)if(L[i].id===t.x)return ok(L[i])||t.m.z4?L[i]:null;}
var R=L.filter(ok);if(!R.length)return null;var c=R[(tk()%97)%R.length];t.x=c.id;sv();return c;}
function startNext(){try{hideModal();}catch(e){}try{var i=Math.min(+S.lv||0,LEVELS.length-1);if(typeof maybeInterstitial==='function')maybeInterstitial(function(){startLevel(i);});else startLevel(i);}catch(e){}}
var POOL={
lesson:{ic:'📅',t:'Задание дня',av:function(){return true;},done:function(){return!!(S.daily&&S.daily[tk()])||!!T().m.lesson;},
h:function(){return'кроссворд дня — один на всех';},go:function(){try{openDaily();}catch(e){}}},
two:{ic:'📚',t:'Пройдите 2 урока',av:function(){return true;},done:function(){return T().w>=2;},
h:function(){return Math.min(T().w,2)+' из 2';},go:startNext},
game:{ic:'🎲',t:'Игра дня',av:function(){return RSD.open('games')&&!!task('mg');},done:function(){var x=task('mg');return!!x&&!!sf('d:mg',x.done);},
h:function(){var x=task('mg');return x?String(x.t||'').replace(/^Затея дня:?\s*/,''):'';},go:function(){var x=task('mg');if(x)sf('g:mg',x.go);}},
word:{ic:'🔠',t:'Слово дня',av:function(){return!!task('wd');},done:function(){var x=task('wd');return!!x&&!!sf('d:wd',x.done);},
h:function(){var x=task('wd');return x?String(x.t||''):'';},go:function(){var x=task('wd');if(x)sf('g:wd',x.go);}},
paper:{ic:'📰',t:'Загляните в газету',av:function(){return RSD.open('paper')&&!!(ZB._scr.z3paper||ZB._scr.vech||(RS&&RS.sect)||1);},done:function(){return!!T().m.paper;},
h:function(){return'свежий номер «Вечёрки»';},go:function(){T().m.paper=1;sv();RSD.X().then(function(x){x.go.paper();});}},
z4:{ic:'🏠',t:'Загляните к соседям',av:function(){return RSD.open('news')&&!!z4card();},done:function(){return!!T().m.z4;},
h:function(){return'новое у соседей — на этой странице';},go:function(){open();}}};
var WK=[['z4','word'],['two','word'],['game','paper'],['two','z4'],['word','game'],['paper','z4'],['two','game']],ALT=['two','game','word','paper','z4'];
function z4ready(){return!(window.Z4&&Z4.on&&Z4.day&&Z4.day()>=4)||!!(Z4.card&&Z4.card.L.length);}
function ids(){var t=T();if(t.L&&t.L.length)return t.L;var L=['lesson'];WK[wd()].concat(ALT).forEach(function(id){if(L.length<3&&L.indexOf(id)<0&&sf('av:'+id,POOL[id].av))L.push(id);});
if(z4ready()&&!wdWait()){t.L=L;sv();}return L;}
function wdWait(){var W=window.ZBWD;return!!(W&&W.on===true&&!W.win&&W.x);}
if(wdWait())sf('wdx',function(){ZBWD.x().then(function(){ZB.refresh();},function(){});});
function cal(){var C=window.ZB2CAL;return C&&C.win?C:null;}
function list(){var R=[],C=cal();
if(C){var n=+sf('st',C.streak)||0,c=C.c();R.push({id:'cal',ic:'🗓',t:n?'Календарь · серия '+n+' '+pl(n,'день','дня','дней'):'Календарь',h:c.g===tk()?'листок оторван':'Оторвать листок — подарок дня',
b:'Оторвать',ok:c.g===tk(),go:function(){C.open(1);}});}
ids().forEach(function(id){var p=POOL[id];R.push({id:id,ic:p.ic,t:p.t,h:sf('h:'+id,p.h)||'',b:'Сделать',ok:!!sf('d:'+id,p.done),go:p.go});});return R;}
function left(){var L=list(),n=L.filter(function(x){return x.ok;}).length;return{n:n,of:L.length};}
function pf(){var p=window.ZBTD&&ZBTD.pf?sf('pf',ZBTD.pf):null;return p&&p.c?p:{c:40,hb:0};}
function pfTxt(){var p=pf();return'+'+p.c+' '+coin()+(p.hb?' и 💡 +1':'');}
function td(){if(window.ZBTD&&ZBTD.fix)sf('tdfix',ZBTD.fix);return S.td&&+S.td.d===tk()?S.td:null;}
function check(){var t=T(),l=left();if(t.f||l.n<l.of)return;t.f=1;var d=td();if(d)d.f=1;
if(window.ZBS&&ZBS.giveFive)sf('five',function(){ZBS.giveFive('td');});try{STAT.ev('rst',{a:'five',n:l.of});}catch(e){}sv();}
function ready(){var t=T(),d=td();return!!t.f&&!(d&&d.p)&&!t.p;}
function take(el){var t=T();if(!ready())return;t.p=1;if(window.ZBTD&&ZBTD.takePf)sf('take',function(){ZBTD.takePf(el);});sv();}
ZB.levelHook.push(function(i){if(i&&i.ok&&i.end==='win'&&!i.daily&&!i.mode){T().w++;sv();}setTimeout(function(){sf('chk',check);},0);});
ZB.on('today',function(){sf('chk',check);});
var n0=-1,bt='';ZB.startHook.push(function(){bt='';n0=RSD.open('today')?left().n:-1;});
ZB.levelHook.push(function(i){if(n0<0||!i||!i.ok)return;var l=left();bt=l.n<=n0?'':l.n>=l.of?'все дела дня ✓':'дело дня ✓';n0=-1;});
function bit(){return bt;}
if(window.RS&&RS.lvl){RS.lvl.bits=RS.lvl.bits||[];RS.lvl.bits.push(bit);}
ZB.on('screen',function(id){if(id==='zb-z3paper'||id==='zb-vech'){T().m.paper=1;sv();}});
function next(){var L=list();for(var i=0;i<L.length;i++)if(!L[i].ok)return L[i];return null;}
function replace(){var t=T();if(t.r)return;var L=ids().slice(),i,id;for(i=1;i<L.length;i++)if(!sf('d:'+L[i],POOL[L[i]].done))break;if(i>=L.length)return;
for(var k=0;k<ALT.length;k++){id=ALT[k];if(L.indexOf(id)<0&&sf('av:'+id,POOL[id].av)){L[i]=id;t.L=L;t.r=1;sv();try{STAT.ev('rst',{a:'swap',id:id});}catch(e){}return;}}}
function home(){try{if(ZB._scr.home)return ZB.go('home');}catch(e){}try{openMenu();}catch(e){}}
function open(){RSD.X().then(function(){try{STAT.screen('rs-today');}catch(e){}ZB.go('rs-today');},function(){try{toast('Не открылось — проверьте интернет',3000);}catch(e){}});}
ZB.on('refresh',function(){var e=$('zb-rs-today');if(e&&e.classList.contains('on')&&window.RSX)sf('rr',function(){RSX.today(e);});});
ZB.add(ZB.homeSlots,{id:'rs-today',order:10,zone:'rs-today',render:function(){if(!RSD.open('today'))return'';sf('chk',check);css();
var l=left(),x=next(),t=T(),r=ready();
var line=r?'Все дела сделаны — пятёрка в дневник!':t.f?'Пятёрка за сегодня — в дневнике. Завтра — новые дела.':x?x.ic+' '+x.t:'';
return'<div class="rst-home"><button type="button" class="rst-hh" id="rstHo"><small>Сегодня у Зины</small><b>'+l.n+' из '+l.of+'</b></button>'+
'<p class="rst-hl">'+esc(line)+'</p>'+(r?'<button type="button" class="btn green rst-hb" id="rstHt">Забрать: '+pfTxt()+'</button>':
x?'<button type="button" class="btn green rst-hb" id="rstHd">'+(x.id==='cal'?'Оторвать листок':'Сделать')+'</button>':'<button type="button" class="btn ghost rst-hb" id="rstHo2">Открыть</button>')+'</div>';},
mount:function(el){var o=function(){tap();open();};['rstHo','rstHo2'].forEach(function(i){var b=el.querySelector('#'+i);if(b)b.onclick=o;});
var d=el.querySelector('#rstHd');if(d)d.onclick=function(){var x=next();tap();if(x)sf('hgo:'+x.id,x.go);};
var t=el.querySelector('#rstHt');if(t)t.onclick=function(){take(t);ZB.refresh();};}});
var cssOn=0;function css(){if(cssOn)return;cssOn=1;var s=D.createElement('style');s.id='rstCss';s.textContent=
'.rst-home{padding:12px 14px;border-radius:16px;background:#fbf7ec;box-shadow:0 3px 0 #e4d9c2,0 6px 14px rgba(39,50,74,.08);color:#27324a}'+
'.rst-hh{display:flex;width:100%;align-items:baseline;justify-content:space-between;border:0;background:none;padding:0;font:inherit;color:inherit;cursor:pointer;min-height:32px}'+
'.rst-hh small{font-size:17px;font-weight:800;color:#2563c9}.rst-hh b{font-size:17px}.rst-hl{margin:4px 0 8px;font-size:16px;line-height:1.3}.rst-hb{width:100%;min-height:52px;margin:0;font-size:18px}';
D.head.appendChild(s);}
window.RST={_:{T:T,ids:ids,POOL:POOL,ALT:ALT,ready:ready,take:take,pfTxt:pfTxt,wd:wd,z4card:z4card,replace:replace,check:check,pl:pl},open:open,list:list,left:left,dot:function(){return RSD.open('today')&&(!T().f||ready());},check:check,ready:ready};
})();
