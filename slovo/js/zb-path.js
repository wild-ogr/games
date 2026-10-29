'use strict';
(function(){
if(typeof ZB==='undefined'||!ZB.vw)return;
function $(id){return document.getElementById(id);}
var esc=ZB.esc,io=null;
function NODE(){return ZB.pathSlots.filter(function(s){return s&&(s.zone==='node'||!s.zone);});}
function TOP(){return ZB.pathSlots.filter(function(s){return s&&(s.zone==='top'||!s.zone);});}
function face(){return typeof zinaSVG==='function'?zinaSVG('happy'):'👵';}
function render(el){var n=ZB.chapCount(),cur=ZB.chapAt(Math.min(S.lv,Math.max(0,LEVELS.length-1))),allDone=S.lv>=LEVELS.length,h='',cls0=-1;
var total=typeof ZBCH!=='undefined'&&ZBCH.total?ZBCH.total():LEVELS.length;
for(var c=0;c<n;c++){var ch=ZB.chap(c),len=ch.to-ch.from+1,done=Math.max(0,Math.min(len,S.lv-ch.from)),lock=S.lv<ch.from,isCur=!allDone&&c===cur,full=done>=len;
if(ch.cls&&ch.cls!==cls0){cls0=ch.cls;h+='<div class="zbp-cls"><span>'+(ch.cls>=12?'🎓 Выпускной':'🏫 '+ch.cls+' класс')+'</span></div>';}
var ctx={c:c,n:c+1,done:done,cur:isCur,lock:lock,from:ch.from,to:ch.to,ch:ch},slot=ZB.html(NODE(),'',ctx);
h+='<div class="zbp-node '+(c%2?'r':'l')+(lock?' lock':'')+(isCur?' cur':'')+(full?' done':'')+(ch.hard?' hard':'')+'" data-c="'+c+'">'+
'<button type="button" class="zbp-pic" data-c="'+c+'" aria-label="'+esc(ch.name)+'"><span class="art" data-pc="'+c+'" style="background-color:'+ch.color+'"><em>'+ch.e+'</em></span>'+
(lock?'<i class="lk">🔒</i>':full?'<i class="ok">✓</i>':'')+(isCur?'<span class="here"><span class="f">'+face()+'</span><b>Зина тут</b></span>':'')+'</button>'+
'<div class="zbp-lbl"><b>'+ch.n+'. '+esc(ch.name)+'</b><small>'+(lock?'с урока '+(ch.from+1):full?'пройдена'+(ch.hard?' · трудная':''):done+' / '+len+(ch.hard?' · трудная':''))+'</small>'+
(slot?'<div class="zbp-slot">'+slot+'</div>':'')+'</div></div>';}
var t=ZB.html(TOP(),'',{}),b=ZB.html(ZB.pathSlots,'bottom',{});
el.innerHTML=ZB.vwHdr('🗺️ Путешествие Зины','пройдено уровней: '+Math.min(S.lv,total)+' из '+total)+
'<div class="scroll zbscr zbp" id="zbPathList">'+t+'<div class="zbp-road">'+h+'</div>'+b+'</div>';
ZB.mount(el.querySelector('.zbp')||el,TOP(),{});
[].forEach.call(el.querySelectorAll('.zbp-node'),function(nd){var c=+nd.getAttribute('data-c'),ch=ZB.chap(c),len=ch.to-ch.from+1,done=Math.max(0,Math.min(len,S.lv-ch.from));
ZB.mount(nd,NODE(),{c:c,n:c+1,done:done,cur:nd.classList.contains('cur'),lock:S.lv<ch.from,from:ch.from,to:ch.to,ch:ch});});
[].forEach.call(el.querySelectorAll('.zbp-pic'),function(btn){btn.onclick=function(){var c=+btn.getAttribute('data-c'),ch=ZB.chap(c);
if(S.lv<ch.from){toast('Сначала пройди главу «'+ZB.chap(Math.max(0,c-1)).name+'»');return;}
if(typeof SND!=='undefined')SND.tap();openLevels(c);};});
var arts=[].slice.call(el.querySelectorAll('.art[data-pc]'));
var load=function(a){if(a.getAttribute('data-ld'))return;a.setAttribute('data-ld','1');var c=+a.getAttribute('data-pc');
ZB.place(c,'xMidYMid slice').then(function(svg){if(svg){a.innerHTML=svg;var v=ZB.chap(c).v;if(v)a.classList.add('zbpv-'+v);}});};
if(io)io.disconnect();
if('IntersectionObserver'in window){io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){load(e.target);io.unobserve(e.target);}});},{root:$('zbPathList'),rootMargin:'200px 0px'});
arts.forEach(function(a){io.observe(a);});}
else arts.slice(Math.max(0,cur-3),cur+4).forEach(load);
var node=el.querySelector('.zbp-node.cur')||el.querySelector('.zbp-node:not(.lock):last-of-type');
if(node)setTimeout(function(){var L=$('zbPathList');if(L&&node.offsetParent)L.scrollTop=Math.max(0,node.offsetTop-L.clientHeight/2+60);},0);}
ZB.screen('path',{render:function(el){ZB.safe('vw:path',function(){render(el);});},title:'Путь'});
if(typeof openLevels==='function'){var ol=window.openLevels;window.openLevels=function(c){ol(c);ZB.safe('vw:levels',function(){
var ch=ZB.chap(c),t=$('lvTitle'),s=$('lvSub'),b=document.querySelector('#levels .hdr .ibtn');if(t)t.textContent=ch.e+' '+ch.n+'. '+ch.name;if(s)s.textContent=ch.s;
if(b){b.onclick=function(){if(typeof SND!=='undefined')SND.tap();ZB.go('path');};}});};}
})();
