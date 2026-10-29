'use strict';
(function(){
var Z=window.Z3,KI=window.Z3KIOSK;if(!Z||!KI||window.Z3KAD)return;
var LIM={tr:5,mg:5},TR={add:60};
function $(id){return document.getElementById(id);}
function lim(k,add){var d=KI.tk(),o={};try{o=JSON.parse(localStorage.getItem('z3-kad')||'{}')||{};}catch(e){}if(o.d!==d)o={d:d};var n=+o[k]||0;
if(add){o[k]=++n;try{localStorage.setItem('z3-kad',JSON.stringify(o));}catch(e){}}return n;}
function adOk(){try{return adsOk()&&(typeof adLikely!=='function'||adLikely());}catch(e){return false;}}
var busy=0;
function trOn(){try{return!!(KI.F.train&&typeof G!=='undefined'&&G&&G.mode==='train'&&!G.won&&$('game').classList.contains('on'));}catch(e){return false;}}
function trBtn(){return $('z3tr');}
function trHide(){var b=trBtn();if(b&&!busy)b.remove();}
function trLeft(g){return g.words.filter(function(w){return!w.found;}).length;}
function trTick(){if(!trOn()){trHide();return;}var g=G,b=trBtn();
if(b){if(b.__g!==g||!g.mdLate)trHide();else trPos(b);return;}
if(!g.mdLate||g.z3tr||trLeft(g)<1||lim('tr')>=LIM.tr||!adOk())return;
var m=$('mdBar'),w=m&&m.parentNode;if(!w)return;try{if(getComputedStyle(w).position==='static')w.style.position='relative';}catch(e){}
b=document.createElement('button');b.type='button';b.id='z3tr';b.className='btn gold zbad z3tr';b.__g=g;
b.innerHTML='🎬 Подождать минуту';b.title='Ещё минута до отправления — за рекламу';b.setAttribute('aria-label',b.title);
b.onclick=trTap;w.appendChild(b);trPos(b);g.z3tr=1;KI.ev({a:'tr_show',l:g.idx+1});}
function trPos(b){var m=$('mdBar');if(!m)return;b.style.top=Math.round(m.offsetTop+(m.offsetHeight-b.offsetHeight)/2)+'px';
b.style.right=Math.max(4,Math.round(m.parentNode.clientWidth-m.offsetLeft-m.offsetWidth+4))+'px';}
function trGive(g){g.mdLate=0;g.mdEl=Math.max(0,g.mdLim-TR.add);g.mdS=null;g.mdLast=Date.now();
try{if(window.MD&&MD.bar)MD.bar();}catch(e){}
try{zina('Машинист подождал минутку. Сказала ему, что везу диктанты на проверку.','happy',4);}catch(e){}
try{if(typeof saveCur==='function')saveCur();}catch(e){}}
function trTap(){var b=trBtn(),g=G;if(!b||b.disabled||busy)return;b.disabled=true;busy=1;KI.ev({a:'tr_tap',l:g.idx+1});try{SND.tap();STAT.place('train');}catch(e){}
var fin=function(){busy=0;var x=trBtn();if(x)x.remove();};
showRewarded(function(){fin();if(G===g&&!g.won){lim('tr',1);trGive(g);KI.ev({a:'tr_got',l:g.idx+1,late:0});}},
function(){busy=0;var x=trBtn();if(x)x.disabled=false;},
function(){fin();if(G===g&&!g.won&&$('game').classList.contains('on')){lim('tr',1);trGive(g);KI.ev({a:'tr_got',l:g.idx+1,late:1});return'Электричка подождала';}
try{return adLateCoins(PRICE.word);}catch(e){return'';}});}
function rm(b){var p=b&&b.parentNode;if(p&&p.className==='z3kad-w')p.remove();else if(b)b.remove();}
function mg(host,o){if(!KI.F.mgad||!host||!o||!o.at||typeof o.when!=='function'||typeof o.go!=='function')return;
var b=null,done=0,iv=setInterval(function(){ZB.safe('z3kad:mg',step);},600);
function alive(){return!done&&document.body.contains(o.at);}
function step(){if(!alive()){clearInterval(iv);return;}var need=!!o.when();if(b&&!b.disabled&&!o.at.contains(b))b=null;
if(b){if(!b.disabled)b.parentNode.style.display=need?'':'none';return;}
if(!need||!host.adOk()||lim('mg')>=LIM.mg)return;
b=document.createElement('button');b.type='button';b.className='btn gold zbad zmg-ad z3kad';b.textContent=o.t||'🎬 Подсказка за рекламу';
var bx=document.createElement('div');bx.className='z3kad-w';bx.appendChild(b);o.at.appendChild(bx);KI.ev({a:'mg_show',id:host.id,k:o.kind||'x'});
b.onclick=function(e){if(e)e.stopPropagation();if(!b||b.disabled)return;b.disabled=true;KI.ev({a:'mg_tap',id:host.id,k:o.kind||'x'});try{host.snd.tap();}catch(x){}
host.adNeed(o.kind||'hint').then(function(ok){if(!b)return;
if(ok){done=1;clearInterval(iv);rm(b);b=null;lim('mg',1);if(document.body.contains(o.at)&&o.when())o.go();KI.ev({a:'mg_got',id:host.id,k:o.kind||'x'});}
else{rm(b);b=null;}});};}
step();}
var css=document.createElement('style');
css.textContent='.z3tr{position:absolute;z-index:6;min-height:44px;font-size:15px;line-height:1.2;padding:6px 12px;white-space:nowrap;box-shadow:var(--z3-shadow,0 2px 8px rgba(0,0,0,.2))}.z3kad-w{display:flex;justify-content:center;margin:6px 0}.z3kad{min-height:44px;font-size:15px;line-height:1.2;padding:6px 12px}';
document.head.appendChild(css);
window.Z3KAD={LIM:LIM,TR:TR,mg:mg,trTick:trTick,lim:lim};
if(KI.F.train)setInterval(function(){ZB.safe('z3kad:tr',trTick);},1000);
})();
