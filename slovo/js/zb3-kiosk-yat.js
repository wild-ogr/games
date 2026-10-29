'use strict';
(function(){
var Z=window.Z3,KI=window.Z3KIOSK;if(!Z||!KI||window.Z3YAT)return;
var YAT={idle:120,idleH:60,miss:8,missH:5,day:5};
var g0=null,nf=-1,idle=0,shown=null,busy=0;
function $(id){return document.getElementById(id);}
function core(){var K=window.Z3K;return!!(K&&K.onHard&&K.on&&K.on.hard&&typeof K.openWord==='function');}
function on(){try{return!!(typeof G!=='undefined'&&G&&!G.won&&!G.tut&&$('game').classList.contains('on'));}catch(e){return false;}}
function hard(g){try{if(window.Z3K&&typeof Z3K.hard==='function'&&core())return!!Z3K.hard();}catch(e){}
try{if(!g.daily&&window.ZBCH&&ZBCH.of){var c=ZBCH.of(g.idx+1).ch;if(c&&(c.hard||c.boss))return true;}}catch(e){}
try{return typeof isTest==='function'&&isTest(g.idx,g.daily);}catch(e){return false;}}
function dayOk(){var z=KI.K(),d=KI.tk();return+z.yd!==d||(+z.yn||0)<YAT.day;}
function adOk(){try{return adsOk()&&(typeof adLikely!=='function'||adLikely());}catch(e){return false;}}
function left(){return G.words.filter(function(w){return!w.found;});}
function btn(){return $('z3yat');}
function hide(){var b=btn();if(b)b.remove();}
function mk(box,why,h){if(btn()||!on()||shown===G||!dayOk()||!adsOk()||left().length<1)return;
var b=document.createElement('button');b.type='button';b.id='z3yat';b.className='btn gold zbad z3yat'+(box?' in':' up');
b.innerHTML=box?'🐈🎬':'🐈 Ять откроет слово · 🎬';b.title='Ять откроет слово за рекламу';b.setAttribute('aria-label',b.title);
if(box)box.appendChild(b);else{var w=$('wheelWrap');if(!w)return;try{if(getComputedStyle(w).position==='static')w.style.position='relative';}catch(e){}w.appendChild(b);}
b.onclick=tapB;shown=G;KI.ev({a:'yat_show',l:G.idx+1,h:h?1:0,w:why});
try{var t=Z.txt('kiosk-yat');if(t&&!$('zSay').classList.contains('pin'))zina(t,'happy',5);}catch(e){}}
function give(g){var w='';
if(core())w=Z3K.openWord();
else{var L=g.words.filter(function(x){return!x.found;}).sort(function(a,b){return b.w.length-a.w.length;}),wd=L[0];if(!wd)return false;
g.hinted=true;try{STAT.use('hint');SND.open();}catch(e){}foundWord(wd,true);w=wd.w;}
if(!w)return false;S.hintsUsed=(S.hintsUsed||0)+1;
try{zina('Ять нашёл слово «'+String(w).toUpperCase()+'». Хвалить кота будем потом.','happy',4);}catch(e){}
try{if(typeof saveCur==='function')saveCur();}catch(e){}return true;}
function cnt(){var z=KI.K(),d=KI.tk();if(+z.yd!==d){z.yd=d;z.yn=0;}z.yn=(+z.yn||0)+1;KI.sv();}
function tapB(){var b=btn(),g=G;if(!b||b.disabled||busy)return;b.disabled=true;busy=1;KI.ev({a:'yat_tap',l:g.idx+1});try{SND.tap();STAT.place('yat');}catch(e){}
showRewarded(function(){busy=0;hide();if(G===g&&!g.won){cnt();give(g);KI.ev({a:'yat_got',l:g.idx+1,late:0});}},
function(){busy=0;var x=btn();if(x)x.disabled=false;},
function(){busy=0;hide();if(G===g&&!g.won&&$('game').classList.contains('on')){cnt();give(g);KI.ev({a:'yat_got',l:g.idx+1,late:1});return'Ять открыл слово';}
try{return adLateCoins(PRICE.word);}catch(e){return'';}});}
function onHard(box){ZB.safe('z3yat:hard',function(){mk(box,'core',1);});}
function tick(){if(!on()){if(typeof G==='undefined'||!G||G.won)hide();return;}
if(G!==g0){g0=G;nf=-1;idle=0;if(shown!==G)hide();}
var f=G.words.length-left().length;if(f!==nf){nf=f;idle=0;if(!core())hide();return;}
idle++;var b=btn();if(b){b.style.visibility=G.sel&&G.sel.length&&!b.classList.contains('in')?'hidden':'';return;}
if(core()||(+S.lv||0)<25||G.idx<25&&!G.daily||G.mode||shown===G||left().length<2||!dayOk()||!adOk())return;
var h=hard(G),why=idle>=(h?YAT.idleH:YAT.idle)?'idle':(+G.miss||0)>=(h?YAT.missH:YAT.miss)?'miss':'';
if(why)mk(null,why,h);}
var css=document.createElement('style');css.textContent='.z3yat{min-height:44px;font-size:15px;line-height:1.2;padding:6px 12px;white-space:nowrap;box-shadow:var(--z3-shadow,0 2px 8px rgba(0,0,0,.2))}'+
'.z3yat.in{min-width:56px;padding:4px 8px;font-size:20px;border-radius:22px;opacity:.96}'+
'.z3yat.up{position:absolute;left:50%;top:-46px;transform:translateX(-50%);z-index:5;padding:6px 14px}';
document.head.appendChild(css);
window.Z3YAT={YAT:YAT,hard:hard,tick:tick,onHard:onHard,core:core};
setInterval(function(){ZB.safe('z3yat',tick);},1000);
})();
