'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined')return;
var R=window.RS,hc=document.documentElement.classList;
function on(p){if(R&&R.on)return R.on(p);return!(ZB2.off('rs')||ZB2.off('rs.'+p));}
var ON=on('level'),WIN=on('win');
if(!(R&&R.on)){if(ON)hc.add('rs-level');if(WIN)hc.add('rs-win');}
if(!ON&&!WIN)return;
var L=window.RS=window.RS||{};L=L.lvl={on:ON,win:WIN,kind:'',next:'',cur:null};
function $(id){return document.getElementById(id);}
function tk(){try{return+todayKey();}catch(e){return 0;}}
function gG(){return typeof G!=='undefined'&&G?G:null;}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;}
function ev(a,o){try{var p={a:a};for(var k in o)p[k]=o[k];STAT.ev('rsl',p);}catch(e){}}
function esc(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return{'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='css/rs-level.css';document.head.appendChild(l);})();
L.calm=function(v){if(v!==undefined)ls('rs-calm',v?'1':'0');return ls('rs-calm')!=='0';};
var KIND={int:{t:'Уровень на интерес',q:'Сыграем на интерес? Счёт очков, а если захочешь — пари с моим. Проиграешь — не беда.',y:'Да, на интерес'},
sur:{t:'Уровень с сюрпризом',q:'Сыграем с сюрпризом? Особая клетка, кот Ять или соседи что-нибудь учудят.',y:'Да, с сюрпризом'}};
L.KIND=KIND;
L.used=function(k){var o={};try{o=JSON.parse(ls('rs-lvk')||'{}')||{};}catch(e){}return o.d===tk()&&!!o[k];};
L.can=function(k){return ON&&!!KIND[k]&&!!(window.Z4&&Z4.on)&&!L.used(k)&&(+S.lv||0)>=30;};
function use(k){var o={};try{o=JSON.parse(ls('rs-lvk')||'{}')||{};}catch(e){}if(o.d!==tk())o={d:tk()};o[k]=1;ls('rs-lvk',JSON.stringify(o));}
L.ask=function(o){var Z=typeof zinaSVG==='function'?zinaSVG('happy'):'';
modal('<div class="rs-ask"><div class="rs-askz">'+Z+'</div><h2>'+esc(o.t)+'</h2><p>'+esc(o.q)+'</p><div class="btns"><button class="btn green" id="rsAskY">'+esc(o.y)+'</button>'+
'<button class="btn rs-white" id="rsAskN">'+esc(o.n||'Нет, обычный урок')+'</button></div></div>');
$('rsAskY').onclick=function(){hideModal();try{SND.tap();}catch(e){}ZB.safe('rs.ask.y',o.go);};
$('rsAskN').onclick=function(){hideModal();try{SND.tap();}catch(e){}if(o.no)ZB.safe('rs.ask.n',o.no);};};
L.play=function(k){var K=KIND[k],lv=+S.lv||0,go=function(x){L.next=x?k:'';if(x){use(k);ev('play',{k:k,l:lv+1});}
try{maybeInterstitial(function(){startLevel(lv);});}catch(e){startLevel(lv);}};
if(!K||!L.can(k)){go(false);return;}
L.ask({t:K.t,q:K.q,y:K.y,n:'Нет, просто так',go:function(){go(true);},no:function(){go(false);}});};
var t0=0,wn=0,wT=0,saved=null;
function special(info){return!!info&&(info.daily||info.mode);}
ZB.startHook.push(function(info){var g=gG(),k=L.next;L.next='';t0=Date.now();wn=3;wT=0;
var clean=ON&&!!g&&!special(info)&&!k&&!g.fest;L.cur={g:g,kind:k,clean:clean,idx:info&&info.idx};L.kind=k;
var gm=$('game');if(gm){gm.classList.toggle('rs-clean',clean);gm.classList.toggle('rs-int',k==='int');gm.classList.toggle('rs-sur',k==='sur');}
if(!g)return;
if(clean)g.__z4fx='rs';else if(k==='int')g.__z4fx='z4p';else if(k==='sur')g.__z4fx='z4c';
ZB.safe('rs.hdr',hdr);
if(clean)setTimeout(function(){if(gG()!==g||g.won)return;var e=document.querySelector('#zbLevel .sc-ctlbar');if(e&&e.textContent)ZB.safe('rs.ctl',function(){window.zina(e.textContent.replace(/^\s*📝\s*/,''),'norm',8);});},700);
if(gm)gm.classList.remove('rs-one');
if(k==='int')setTimeout(function(){var a=$('z4pBar');if(gG()===g&&gm&&a&&a.offsetParent&&a.innerText.trim())gm.classList.add('rs-one');},1500);
});
function hdr(){var b=$('gBack');if(b&&ON&&b.textContent!=='← Назад'){b.textContent='← Назад';b.classList.add('rs-bk');}
var t=$('gTitle'),g=gG();if(t&&g&&ON&&!g.daily&&!g.mode&&/^Уровень \d+$/.test(t.textContent))t.textContent='Урок '+(g.idx+1);}
var Z=window.Z4;
if(Z&&Z.on&&ON){
Z.onStart(function(o){var c=L.cur;saved=null;if(!c||c.g!==o.G||!c.clean)return;saved={o:o,mode:o.mode,mix:o.mix};o.mode='rs';o.mix=true;});
ZB.on('start',function(){if(saved){saved.o.mode=saved.mode;saved.o.mix=saved.mix;saved=null;}});
Z.lvlEvent.wants=Z.lvlEvent.wants||[];
Z.lvlEvent.wants.unshift(function(i){var c=L.cur;if(!c)return'';if(c.clean)return'-';if(c.kind==='int')return'-';
if(c.kind!=='sur')return'';var C=[],E=Z.lvlEvent.L||[];E.forEach(function(e){if(ZB.safe('rs.ev',function(){return!e.ok||e.ok(i);}))C.push(e.id);});
return C.length?C[Math.floor(Math.random()*C.length)]:'';});}
function inLvl(){var g=gG(),gm=$('game'),m=$('modal');return!!g&&!g.won&&!!gm&&gm.classList.contains('on')&&!(m&&m.classList.contains('on'));}
function quiet(){var g=gG();return ON&&inLvl()&&!g.tut&&(+S.lv||0)>=8&&!(L.cur&&L.cur.kind);}
function wrapW(){['foundWord','submit'].forEach(function(n){var f=window[n];if(typeof f!=='function'||f.__rs)return;
var w=function(){var g=gG(),a=g?g.words.filter(function(x){return x.found;}).length+g.bonus.size:0,r=f.apply(this,arguments);
if(g&&g.words.filter(function(x){return x.found;}).length+g.bonus.size>a){wn++;wT=Date.now();}return r;};w.__rs=1;window[n]=w;});}
function wordish(ms){return wT&&Date.now()-wT<(ms||1600);}
if(typeof window.zina==='function'){var z0=window.zina;window.zina=function(t,mood,sec){
if(quiet()&&wordish()){if(Date.now()-t0<5000||wn<3)return;wn=0;}
return z0.apply(this,arguments);};}
if(typeof window.toast==='function'){var to0=window.toast;window.toast=function(t,ms){
if(quiet()){if(wordish(3500))return;try{window.zina(String(t),'norm',Math.max(3,(ms||2600)/1000));return;}catch(e){}}
return to0.apply(this,arguments);};}
var NU;try{Object.defineProperty(window,'ZBNODEUI',{configurable:true,get:function(){return NU;},set:function(v){NU=v;if(ON&&v&&v.card&&!v.card.__rs){var c0=v.card;
v.card=function(g,id){c0.apply(this,arguments);ZB.safe('rs.node',function(){var h=document.querySelector('#mcard .zr-nd h2'),y=$('zrNdGo'),n=$('zrNdNo');if(!h||!y||!n)return;
h.textContent='Сыграем в перемену?';n.textContent='Нет, обычный урок';n.className='btn rs-white';var b=document.querySelector('#mcard .zr-ndb');if(b)b.style.animation='none';});};v.card.__rs=1;}}});}catch(e){}
var K=window.Z3K;
if(ON&&K){var md0=null,mdB=null,mdIn=0,mdW=function(idx,daily){if(mdIn)return mdB?mdB.apply(this,arguments):false;
var r=false;mdIn=1;try{r=md0?md0.apply(this,arguments):false;}finally{mdIn=0;}if(!r)return r;
var p=K.pick&&K.pick(idx+1);if(!p)return r;
setTimeout(function(){var g=gG();if(!g||g.idx!==idx||g.won)return;ZB.safe('rs.mix',function(){
L.ask({t:'Перемена перед уроком',q:'Хочешь сначала газетную рубрику «'+p.t+'»? Решишь — монеты сверху. Можно и сразу урок.',y:'Сыграть: '+p.t,
go:function(){try{saveCur();}catch(e){}K.x().then(function(){K.mixGo(idx,p,function(){startLevel(idx);});},function(){});},
no:function(){var z=K.Z&&K.Z();if(z){z.m=Math.max(+z.m||0,idx+1);try{save();}catch(e){}}ev('mix',{s:'no',l:idx+1});}});});},350);
return false;};
try{Object.defineProperty(K,'mixDue',{configurable:true,get:function(){return md0?mdW:undefined;},set:function(v){if(!mdB)mdB=v;md0=v;}});}catch(e){}}
if(ON&&ZB2._reg.autonajdi){ZB2._reg.autonajdi.on=false;L.najdi=1;}
function setRow(){var c=$('mcard'),bt=c&&c.querySelector('.btns');if(!bt||$('rsCalm')||!$('setRows'))return;var v=L.calm(),b=document.createElement('button');
b.className='setrow'+(v?'':' off');b.id='rsCalm';b.innerHTML='<span>🍵 Спокойная игра<br><small>без пари, гонок и сюрпризов в уровне</small></span><b>'+(v?'● вкл':'○ выкл')+'</b>';
bt.parentNode.insertBefore(b,bt);b.onclick=function(){L.calm(!L.calm());try{SND.tap();}catch(e){}b.remove();setRow();};}
function wrapSet(){var f=window.openSettings;if(typeof f!=='function'||f.__rsl)return;var w=function(){var r=f.apply(this,arguments);ZB.safe('rs.set',setRow);return r;};
w.__rsl=1;window.openSettings=w;var gs=$('gSet');if(gs)gs.onclick=function(){window.openSettings();};}
ZB.on('ready',function(){ZB.safe('rs.wrap',wrapW);if(ON)ZB.safe('rs.set',wrapSet);setTimeout(function(){ZB.safe('rs.set2',wrapSet);},4000);
if(WIN)ZB.load('js/rs-win.js').catch(function(){});});
ZB.on('screen',function(){ZB.safe('rs.wrap',wrapW);});
})();
