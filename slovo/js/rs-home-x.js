'use strict';
(function(){
if(!window.RSH0||!document.documentElement.classList.contains('rs-home-on')||typeof ZB==='undefined'||!ZB.vw)return;
var DE=document.documentElement,Z=window.Z3,H=window.RSH={mode:'home'};
function $(id){return document.getElementById(id);}
function tap(){try{SND.tap();}catch(e){}}
function sect(id){return!!ZB.safe('rs:sect',function(){return window.RS.sect&&RS.sect.open&&RS.sect.open(id);});}
function yardOn(){return!!(window.Z3Y0&&Z&&Z.on);}
function st(a,o){try{if(window.STAT&&STAT.ev){o=o||{};o.a=a;STAT.ev('rsh',o);}}catch(e){}}
var want='';
function setMode(m){H.mode=m;DE.classList.toggle('rs-yard',m==='yard');if(ZB.navOf)ZB.navOf.menu=m==='yard'?'yard':'home';place();}
function wrapMenu(){var om=window.openMenu;if(typeof om!=='function'||om.__rs)return;
var w=window.openMenu=function(){setMode(want||'home');want='';return om.apply(this,arguments);};w.__rs=1;}
H.home=function(){openMenu();};
H.yard=function(){if(!yardOn()){openMenu();return;}want='yard';st('yard');openMenu();};
var DOT0={};
function nget(id){var L=ZB.navSlots;for(var i=0;i<L.length;i++)if(L[i]&&L[i].id===id)return L[i];return null;}
function dotOf(id){var f=DOT0[id];return!!(f&&ZB.safe('rs:dot:'+id,f));}
function yardDot(){if(!yardOn())return false;var o=(orgGet?orgGet.call(Z,'mail'):null)||window.Z3Y&&Z3Y.DEF.mail;if(!o||!Z.open('mail'))return false;
return!!ZB.safe('rs:ydot',function(){return(typeof o.hot==='function'&&o.hot())||(typeof o.badge==='function'&&o.badge());});}
function dotWin(){var hm=ZB.cur==='menu'||!ZB.cur;
if(H.mode==='home'&&hm&&$('menu')&&$('menu').classList.contains('on')&&window.RST&&RST.dot&&ZB.safe('rs:tdot',function(){return RST.dot();}))return'';
if(yardDot())return'yard';if(dotOf('school'))return'school';if(dotOf('mg'))return'mg';return'';}
function nav(){
['path','dict'].forEach(function(id){var s=nget(id);if(s)s.on=function(){return false;};});
var hm=nget('home');if(hm){hm.go=H.home;hm.ic='🏠';hm.t='Дом';hm.order=10;}
if(yardOn())ZB.add(ZB.navSlots,{id:'yard',order:20,ic:'🌳',t:'Двор',go:H.yard,dot:yardDot});
var mg=nget('mg');if(!mg)mg=ZB.add(ZB.navSlots,{id:'mg',go:function(){ZB.go('mg');}});
if(!mg.__rs){var g0=mg.go;DOT0.mg=mg.dot;mg.go=function(){if(!sect('games'))g0();};mg.__rs=1;}
mg.t='Игры';mg.ic='🔔';mg.order=30;mg.on=function(){return true;};
var sc=nget('school');if(sc&&!sc.__rs){var s0=sc.go;DOT0.school=sc.dot;sc.go=function(){if(!sect('school'))s0();};sc.__rs=1;}
if(sc)sc.order=40;
['home','yard','mg','school'].forEach(function(id){var s=nget(id);if(s)s.dot=function(){return dotWin()===id;};});
var NO=ZB.navOf;if(NO){var M={school:['zb-path','chapters','levels','dictS','rateS','zb-cab','zb-diary','zb-modes'],
mg:['zb-zcards','zb-zsport'],yard:['shopS','zb-vech','zb-z3bench','zb-z3build','zb-z3paper','zb-z3mail','zb-z3kiosk','zb-z3kiosk-sk','zb-z3kiosk-pass','zb-z3album','zb-uchit'],home:['zb-season','zb-week']};
Object.keys(M).forEach(function(k){M[k].forEach(function(s){NO[s]=k;});});NO.menu=H.mode==='yard'?'yard':'home';}}
var YID=['paper','mail','bench','build','kiosk','album'],YT={paper:'Газета',mail:'Почта',bench:'Подъезд',build:'Стройка',kiosk:'Ларёк',album:'Комод'};
var orgGet=null,WR={};
function wrapItem(o){if(!o)return o;if(o.__rs)return o;var id=o.id,w=WR[id];if(w&&w.__o===o)return w;
var def=window.Z3Y&&Z3Y.DEF[id]===o;
w=WR[id]={id:id,order:o.order,t:YT[id]||o.t,ic:o.ic,__o:o,__rs:1,note:'',badge:'',
hot:function(){return id==='mail'&&typeof o.hot==='function'&&o.hot();},
go:function(){if(sect(id))return;if(def&&typeof o.stub==='function'&&o.stub()){var m=$('mSay');if(m)m.textContent='Скоро откроется — загляни завтра.';return;}
if(typeof o.go==='function')o.go();}};
return w;}
function yard(){if(!yardOn()||Z.__rsY)return;Z.__rsY=1;orgGet=Z.yardGet;
Z.yardGet=function(id){var o=orgGet.call(Z,id);if(YID.indexOf(id)<0)return o;return wrapItem(o||window.Z3Y&&Z3Y.DEF[id]||null);};
try{Object.defineProperty(Z,'YARD',{configurable:true,get:function(){return YID.filter(function(id){
return!(window.RSD&&RSD.open&&ZB.safe('rs:drip',function(){return RSD.open(id)===false;}));});},set:function(){}});}catch(e){}}
function build(){var m=$('menu');if(!m)return false;if($('rsHome'))return true;
var y=document.createElement('div');y.id='rsYardTop';y.className='rsh-ytop';
y.innerHTML='<button type="button" class="rs-back" id="rsYBack">← Назад</button><b>Двор дома №7</b>'+coins('rsYCoins');
var d=document.createElement('div');d.id='rsHome';d.className='rsh';
d.innerHTML='<div class="rsh-top"><button type="button" class="rsh-set" id="rsSet"><i>⚙</i>Настройки</button><span class="rsh-fire" id="rsFire"></span>'+coins('rsCoins')+'</div>'+
'<div class="rsh-main"><div class="rsh-win" id="rsWin"><div class="rsh-art" id="rsArt"></div><div class="rsh-say" id="rsSay"></div></div><div class="rsh-play" id="rsPlay"></div></div>'+
'<div class="rsh-side"><div class="rsh-today" id="rsToday"></div><div class="rsh-ev" id="rsEv"></div></div>';
m.insertBefore(d,m.firstChild);m.insertBefore(y,m.firstChild);
$('rsSet').onclick=function(){st('set');openSettings();};
$('rsYBack').onclick=function(){tap();H.home();};
[$('rsCoins'),$('rsYCoins')].forEach(function(b){b.onclick=function(){tap();st('coins');kiosk();};});
$('rsWin').onclick=function(e){if(e.target.closest&&e.target.closest('button'))return;var s=$('mSay');if(!s)return;
try{s.textContent=say(Math.random()<.5?'idle':'hello');}catch(x){}st('zina');};
var b=$('btnPlay');if(b){$('rsPlay').appendChild(b);label();new MutationObserver(label).observe(b,{childList:true,characterData:true,subtree:true});}
window.addEventListener('resize',function(){ZB.safe('rs:fit',fit);});
return true;}
function coins(id){return'<button type="button" class="rsh-coins" id="'+id+'" aria-label="Монеты — Ларёк"><span class="coin"></span><span class="cc">'+(typeof S!=='undefined'&&S?S.coins:0)+'</span></button>';}
function kiosk(){if(sect('kiosk'))return;if(yardOn()&&Z.open('kiosk')&&Z.yardGo('kiosk'))return;openShop();}
var lab=0;function label(){if(lab)return;lab=1;try{var b=$('btnPlay');if(!b)return;var ns=b.childNodes,tx=null;
for(var i=0;i<ns.length;i++)if(ns[i].nodeType===3&&/[А-Яа-яЁё]/.test(ns[i].nodeValue)){tx=ns[i];break;}
if(tx){var ic=tx.previousSibling&&tx.previousSibling.nodeType===1,v=(ic?' ':'▶ ')+'Играть ';if(tx.nodeValue!==v)tx.nodeValue=v;}
var e=b.querySelector('.rsh-sub');if(!e){e=document.createElement('small');e.className='rsh-sub';b.appendChild(e);}
var t=sub();if(e.textContent!==t)e.textContent=t;}finally{lab=0;}}
function sub(){if(typeof S==='undefined'||!S||typeof LEVELS==='undefined')return'';if(S.lv>=LEVELS.length)return'все уроки пройдены';
var c=ZB.chapAt(S.lv),ch=ZB.chap(c),len=ch.to-ch.from+1,k=Math.max(0,Math.min(len-1,S.lv-ch.from));
return'урок '+(S.lv+1)+' · '+ch.name+' · '+(k+1)+' из '+len;}
var akey='';
function art(){var box=$('rsArt'),A=window.Z3ART;if(!box)return;
if(!A||!A.yardLay||!Z||!Z.art){if(!box.firstChild&&typeof heroSVG==='function')box.innerHTML='<div class="rsh-hero">'+heroSVG()+'</div>';return;}
if(A.yardCss&&!$('z3yArtCss')){var c=document.createElement('style');c.id='z3yArtCss';c.textContent=A.yardCss;document.head.appendChild(c);}
var sc=ZB.safe('rs:scene',function(){return Z.scene?Z.scene({}):null;})||{},k=(S.outfit||'')+'|'+sc.time+'|'+sc.season+'|'+(A.yardRev||0);
if(k!==akey){var h=Z.art('yard',{lay:'tall',time:sc.time,season:sc.season,hot:{kitchen:1}});if(h){akey=k;box.innerHTML=h;}}
fit();}
function fit(){var box=$('rsArt'),sv=box&&box.querySelector('svg'),A=window.Z3ART;if(!sv||!A||!A.yardLay)return;
var w=A.yardLay.tall.win,W=box.clientWidth,Hh=box.clientHeight;if(!W||!Hh)return;
var vw=w[2]*(W/Hh>1.3?9:7),vh=vw*Hh/W;if(vh<w[3]*3){vh=w[3]*3;vw=vh*W/Hh;}
var x=w[0]+w[2]/2-vw/2,y=w[1]+w[3]*.5-vh*.48;
sv.setAttribute('viewBox',[x,y,vw,vh].map(function(v){return v.toFixed(1);}).join(' '));sv.setAttribute('preserveAspectRatio','xMidYMid slice');}
function place(){var s=$('mSay');if(!s||!$('rsSay'))return;var yb=$('zbSayBox');
if(H.mode==='yard'&&yb){if(s.parentNode!==yb)yb.appendChild(s);}else if(s.parentNode!==$('rsSay'))$('rsSay').appendChild(s);
var b=$('btnPlay');if(b&&b.parentNode!==$('rsPlay'))$('rsPlay').appendChild(b);
var t=$('zbHomeTop'),ev=$('rsEv'),own=!ZB.homeSlots.some(function(o){return o&&o.zone==='rs-event';});
if(t&&ev){if(own&&t.parentNode!==ev)ev.appendChild(t);else if(!own&&t.parentNode===ev&&$('zbHub'))$('zbHub').insertBefore(t,$('zbHub').firstChild);}}
function ownToday(){var done=!!(S.daily&&S.daily[todayKey()]);
return'<div class="rsh-card"><div class="t"><small>Сегодня у Зины</small><b>'+(done?'Задание дня решено':'Задание дня — кроссворд')+'</b></div>'+
'<button type="button" class="rsh-do'+(done?' ok':'')+'" id="rsDaily">'+(done?'✓':'Сделать')+'</button></div>';}
function slots(){var c={hub:1,rs:1},L=ZB.homeSlots.filter(function(o){return o&&(o.zone==='rs-today'||o.zone==='rs-event');}),
td=$('rsToday'),ev=$('rsEv'),hasT=L.some(function(o){return o.zone==='rs-today';});
td.innerHTML=hasT?ZB.html(ZB.homeSlots,'rs-today',c):ownToday();
if(!hasT){var b=$('rsDaily');if(b)b.onclick=function(){st('daily');openDaily();};}
if(L.some(function(o){return o.zone==='rs-event';})){ev.innerHTML=ZB.html(ZB.homeSlots,'rs-event',c);}
ZB.mount($('rsHome'),L,c);
td.classList.toggle('empty',!td.firstChild);ev.classList.toggle('empty',!ev.textContent.replace(/\s/g,''));}
function top(){var n=S.streak||0,al=S.lastDaily===String(todayKey())||(typeof dayKey==='function'&&S.lastDaily===dayKey(1)),f=$('rsFire');
if(f){f.textContent=n>=2&&al?'🔥 '+n:'';f.style.display=n>=2&&al?'':'none';}}
function render(){if(typeof S==='undefined'||!S||!build())return;nav();yard();place();label();top();slots();art();
try{updCoins();}catch(e){}if(ZB.navRender)ZB.navRender();}
H.render=function(){ZB.safe('rs:home',render);};
wrapMenu();
var hr0=ZB.homeRender;ZB.homeRender=function(){var r=hr0.apply(this,arguments);H.render();return r;};
nav();yard();wrapSet();
ZB.load('js/zb3-yard-data.js').then(function(){if(window.Z3T)Z3T['yard-play']=['Играть'];label();},function(){});
ZB.on('ready',function(){wrapMenu();nav();wrapSet();H.render();});
ZB.on('yard',function(){ZB.safe('rs:art',art);});
ZB.on('z3late',function(){nav();H.render();});
ZB.on('screen',function(id){if(id!=='menu'&&H.mode==='yard'){H.mode='home';DE.classList.remove('rs-yard');if(ZB.navOf)ZB.navOf.menu='home';}});
H.render();if(window.Z3Y&&Z3Y.render)ZB.safe('rs:y',Z3Y.render);RSH0.done();
function wrapSet(){var os=window.openSettings;if(typeof os!=='function'||os.__rs)return;
var w=window.openSettings=function(){var r=os.apply(this,arguments);ZB.safe('rs:set',function(){var mc=$('mcard'),bt=mc&&mc.querySelector('.btns');if(!bt||$('rsSetAb'))return;
if(window.ZB2MAIL&&ZB2MAIL.go&&!$('rsSetMl')){var a=document.createElement('button');a.className='setrow';a.id='rsSetMl';
a.innerHTML='<span>✉️ Написать Зине<br><small>похвалить, поругать, подсказать</small></span><b>›</b>';bt.parentNode.insertBefore(a,bt);
a.onclick=function(){tap();ZB2MAIL.go('about',function(){window.openSettings();});};}
var b=document.createElement('button');b.className='setrow';b.id='rsSetAb';b.innerHTML='<span>ℹ️ Об игре<br><small>авторы, музыка, оформление</small></span><b>›</b>';
bt.parentNode.insertBefore(b,bt);b.onclick=function(){tap();openCredits();};});return r;};w.__rs=1;}
})();
