(function(){'use strict';
var W=window,D=document;
if(!W.V3||!V3.reg)return;
V3.reg('rs',{s:'RS',t:'реструктуризация 30.10 (выкл — как v24.2)'});
var ON=V3.reg('rs.win',{s:'RS-П3',t:'окна победы/проигрыша — 4 блока'});
var R=W.RSW=W.RSW||{};R.news=R.news||[];R.yq=R.yq||[];R.on=ON;
if(!ON)return;
try{D.documentElement.classList.add('rsw');}catch(e){}
function ok(f,d){try{return f();}catch(e){return d;}}
function $(id){return D.getElementById(id);}
function L(a,b){return ok(function(){return W.VY.L(a,b);},a);}
function txt(e){return(e&&e.textContent||'').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ev(o){ok(function(){V3.ev('rsw',o);});}
function slotOf(e){return e&&e.getAttribute&&e.getAttribute('data-slot')||'';}
function hide(e){if(e&&e.classList)e.classList.add('rsw-h');}
function wrapFit(){if(typeof W.fitWin!=='function'||W.fitWin.__rs)return;var f=W.fitWin;
W.fitWin=function(){if(V3.is('rs.win'))return;return f.apply(this,arguments);};W.fitWin.__rs=1;}
wrapFit();
function kind(e){var c=e.classList,s=slotOf(e),t=txt(e);
if(e.tagName==='H2'||c.contains('big-stars')||c.contains('rew')||c.contains('row'))return{k:'keep'};
if(c.contains('shura'))return{k:'news',p:1};
if(e.tagName==='P'&&e.getAttribute('data-fit')==='3'&&e.querySelector('b'))return{k:'news',p:2};
if(c.contains('newcar')&&!c.contains('tmrc'))return{k:'news',p:3};
if(s==='vypark-fin')return{k:'news',p:4};
if(c.contains('tipl')&&/Набор|Set /.test(t))return{k:'news',p:5};
if(s==='vymg-perekur')return/Нов|New/.test(t)?{k:'news',p:6}:{k:'hide'};
if(s==='td'&&e.querySelector('button')&&/[Сс]ундук|chest/.test(t))return{k:'news',p:7};
if(c.contains('tipl')&&/[Сс]ундук|chest/.test(t))return{k:'news',p:7};
if(s==='v3n-eve')return{k:'news',p:8};
if(s==='ord'&&e.querySelector('.ord-done'))return{k:'news',p:9};
if(c.contains('tipl'))return{k:'news',p:10};
if(s==='v3p-hlpS')return{k:'news',p:11};
if(c.contains('clean')||s==='v3n-omen'||s==='v3h-res'||s==='v3dt-res'||(c.contains('gift')&&c.contains('goal')))return{k:'bon'};
if(s==='deep-clip')return{k:'clip'};
return{k:'hide'};}
function shortBon(e){var t=txt(e);if(!t)return'';
if(e.classList.contains('clean'))return L('без аварий','no crashes');
var m=t.match(/\+\s?(\d+)\s?💰/);if(m)t=t.replace(/«[^»]*»/g,'').replace(/\+\s?\d+\s?💰.*/,'');
t=t.replace(/^[^\wА-Яа-яЁё]+/,'').replace(/[\s:—,.!]+$/,'');
var w=t.split(' ');if(w.length>6)t=w.slice(0,6).join(' ')+'…';
return t+(m?' +'+m[1]+' 💰':'');}
function lookBtn(e){if(e.querySelector('button'))return;var t=txt(e),go=null;
if(/Маршрут|карт|Route|map/.test(t))go=function(){ok(function(){if(G)G.over=true;});hideModal();ok(function(){openMap();});};
else if(/гараж|garage/.test(t))go=function(){ok(function(){if(G)G.over=true;});hideModal();ok(function(){openGarage('cars');});};
if(!go)return;var b=D.createElement('button');b.className='btn sec sm noenter rsw-look';b.textContent=L('Посмотреть','Take a look');b.onclick=go;e.appendChild(b);}
function items(card){var out=[];[].slice.call(card.children).forEach(function(e){
if(e.tagName==='DETAILS'){[].slice.call(e.children).forEach(function(x){if(x.tagName!=='SUMMARY')out.push(x);});out.push(e);}
else out.push(e);});return out;}
var busy=false;
function fixWin(){var card=$('mcard');if(!card||!V3.is('rs.win'))return;
if(!card.querySelector('.big-stars')||!$('mMap'))return;
if(!fresh(card))return;
busy=true;try{build(card);}catch(e){ok(function(){console.warn('rs-win',e);});}busy=false;}
fixWin.n=0;
function fresh(c){return[].slice.call(c.children).some(function(e){return!e.getAttribute('data-rsw-k')&&!/rsw-(news|bon)/.test(e.className);});}
function build(card){card.classList.add('rsw-card');
var rew=card.querySelector('.rew'),row=card.querySelector(':scope > .row')||card.querySelector('.row'),news=[],bons=[],gone=[],clip=null;
var cl=rew&&rew.querySelector('.clean'),clean='';if(cl&&!cl.getAttribute('data-rsw-k')){cl.setAttribute('data-rsw-k','bon');clean=shortBon(cl);hide(cl);}
items(card).forEach(function(e){if(e.getAttribute&&e.getAttribute('data-rsw-k'))return;var k=kind(e);e.setAttribute('data-rsw-k',k.k);
if(e.tagName==='DETAILS'){hide(e);return;}
if(k.k==='keep')return;
if(k.k==='news'){news.push({e:e,p:k.p});return;}
if(k.k==='bon'){var b=shortBon(e);if(b)bons.push(b);hide(e);return;}
if(k.k==='clip'){clip=e;return;}
hide(e);var t=txt(e);if(t&&!e.classList.contains('wTop'))gone.push({k:slotOf(e)||(e.className+'').split(' ')[0]||e.tagName,t:t.slice(0,140)});});
var yq=(R.yq||[]).splice(0);var cn=bons.filter(function(t){return/💰/.test(t);}),ot=bons.filter(function(t){return!/💰/.test(t);});bons=cn.concat(yq,ot);if(clean)bons.push(clean);
if(rew&&!card.querySelector('.rsw-bon')&&(bons.length||clip)){var p=D.createElement('p');p.className='rsw-bon';
var shown=bons.slice(0,3);gone=bons.slice(3).map(function(t){return{k:'bon',t:t};}).concat(gone);
p.innerHTML=shown.length?L('и ещё: ','and also: ')+shown.map(esc).join(' · '):'';
rew.parentNode.insertBefore(p,rew.nextSibling);
if(clip){var b=clip.querySelector('button');if(b){b.className='rsw-link noenter';b.id=b.id||'v3dCl';b.textContent='▶ '+L('Повтор двора','Replay the yard');p.appendChild(b);}hide(clip);}}
else if(clip){hide(clip);}
news.sort(function(a,b){return a.p-b.p;});
if(news.length){var box=card.querySelector('.rsw-news');if(!box){box=D.createElement('div');box.className='rsw-news';card.insertBefore(box,row||null);}
if(!box.children.length){var top=news[0].e;box.appendChild(top);lookBtn(top);news=news.slice(1);}
news.forEach(function(n){hide(n.e);gone.push({k:slotOf(n.e)||'news',t:txt(n.e).slice(0,140)});});}
if(row){var nx=$('mNext'),mp=$('mMap');if(nx){nx.classList.add('rsw-main');row.insertBefore(nx,row.firstChild);}
if(mp&&nx){mp.classList.remove('green');mp.classList.add('sec','rsw-2');if(/Во двор|To my yard/.test(mp.textContent))mp.textContent=L('В свой двор','To my yard');}
else if(mp&&!nx)mp.classList.add('rsw-main');
if(card.lastElementChild!==row)card.appendChild(row);}
fixWin.n++;card.setAttribute('data-rsw',String(fixWin.n));
if(gone.length){R.news=gone.slice(0,20);ok(function(){V3.emit('rs:news',R.news);});}
ev({k:'win',n:news.length?1:0,b:bons.length,g:gone.length});}
function fixLose(){var card=$('mcard');if(!card||!V3.is('rs.win'))return;var re=$('mRe'),mp=$('mMap2');if(!re||!mp)return;
if(re.classList.contains('rsw-main'))return;busy=true;try{buildLose(card,re,mp);}catch(e){ok(function(){console.warn('rs-lose',e);});}busy=false;}
function buildLose(card,re,mp){card.classList.add('rsw-card','rsw-lose');
var h=card.querySelector('h2');if(h){h.setAttribute('data-was',txt(h));h.textContent=L('Не получилось','Didn’t work out');}
[].slice.call(card.querySelectorAll('.v3jk')).forEach(hide);
var row=card.querySelector('.row');if(!row)return;
var life=D.createElement('div');life.className='rsw-life';
var rv=$('mRev'),lf=$('mLife');
if(rv){rv.innerHTML='📺 '+L('+1 жизнь за ролик','+1 life for a video');life.appendChild(rv);}
if(lf){var pr=(lf.textContent.match(/(\d+)\s*💰/)||[])[1];lf.innerHTML='❤️ '+L('+1 жизнь','+1 life')+(pr?' — '+pr+' 💰':'');life.appendChild(lf);}
re.className='btn green rsw-main';re.textContent=L('Ещё раз','Try again');
mp.className='btn sec rsw-2';
var keep={'v3p-vyr':1,'v3p-place':1,'v3h-skip':1},extra=[],gone=[];
[].slice.call(card.children).forEach(function(e){if(e===row||e.tagName==='H2'||e.classList.contains('shura'))return;var s=slotOf(e);
if(keep[s])extra.push(e);else{hide(e);var t=txt(e);if(t)gone.push({k:s||'lose',t:t.slice(0,140)});}});
row.innerHTML='';row.appendChild(re);if(life.children.length)row.appendChild(life);extra.forEach(function(e){row.appendChild(e);});row.appendChild(mp);
if(gone.length){R.news=gone.slice(0,20);ok(function(){V3.emit('rs:news',R.news);});}
ev({k:'lose',r:rv?1:0,c:lf?1:0,x:extra.length});}
function soon(f){if(W.Promise)Promise.resolve().then(f);else setTimeout(f,0);}
V3.sub('win',function(){soon(fixWin);},'rs.win');
V3.sub('lose',function(){soon(fixLose);},'rs.win');
function watch(){var c=$('mcard');if(!c||!W.MutationObserver||c.__rsw)return;c.__rsw=1;
new MutationObserver(function(){if(busy)return;
if($('mNext')||$('mMap')){if(c.querySelector('.big-stars'))fixWin();}
else if($('mRe')&&$('mMap2'))fixLose();}).observe(c,{childList:true});}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',watch);else watch();
R.fixWin=fixWin;R.fixLose=fixLose;
})();