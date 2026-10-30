'use strict';
(function(){
if(typeof ZB==='undefined'||!window.RS||!RS.lvl||!RS.lvl.win||window.RSW)return;
var W=window.RSW={},L=RS.lvl;L.bits=L.bits||[];
function $(id){return document.getElementById(id);}
function esc(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return{'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function ev(a,o){try{var p={a:a};for(var k in o)p[k]=o[k];STAT.ev('rsw',p);}catch(e){}}
function phrase(t){t=String(t||'').replace(/<[^>]*>/g,'').trim();var m=t.match(/^[\s\S]*?[.!?…]+(\s|$)/);return(m?m[0]:t).trim();}
function najdiDue(g){var X=ZB.mgr,M=window.ZMG;if(!L.najdi||!X||!M||g.daily||(M.isOff&&M.isOff('najdi')))return false;
try{return X.Z().a<Math.floor(g.idx/CH_LEN)+1;}catch(e){return false;}}
function urgent(g,r,p){var Z=window.Z4;
if(p.chapDone&&najdiDue(g))return{t:'Ять потерялся на экскурсии! Сыграем в «Найди Ять»?',b:'🔍 Посмотреть',id:'rsNajdi'};
if(p.chapDone||p.last)return{t:p.lastAll?'Новые главы — скоро. А задание дня — каждый день новое.':'Дальше — подарок за главу.'};
if(Z&&Z.on&&Z.winLine&&Z.winLine.L){var info={lv:g.idx+1,idx:g.idx,daily:!!g.daily,mode:g.mode||'',first:!!r.first,hints:0,words:g.words.length,of:g.words.length,bonus:g.bonus.size,G:g,r:r};
for(var i=0;i<Z.winLine.L.length;i++){var it=Z.winLine.L[i];if(it.urg&&ZB.safe('rsw.urg:'+it.id,function(){return it.urg(info);})){var t=ZB.safe('rsw.txt:'+it.id,function(){return it.txt(info);});if(t)return{t:t};}}}
if(r.dly&&!(S.daily&&S.daily[todayKey()]))return{t:'Открылось задание дня: каждый день — новый кроссворд с подарком.',b:'📅 Сыграть',id:'mDly'};
return null;}
function card(p){var w=p.dw;if(!p.hasDef||!w||typeof DEFS==='undefined'||!DEFS[w])return'<div class="zbw-zina rsw-z">'+(typeof zinaSVG==='function'?zinaSVG('happy'):'')+'</div>';
var y=w;try{y=yo(w);}catch(e){}
return'<div class="defcard rsw-card'+(p.isNew?' new':'')+'"><div class="word">'+esc(y)+'</div><div class="def">'+esc(phrase(DEFS[w]))+'</div><div class="sig"><span>— баба Зина</span></div></div>';}
function line(g,r){var a=[];
if(g.daily){if(r.streak)a.push('серия '+r.streak+' '+pl(r.streak,'день','дня','дней'));else a.push('задание дня ✓');}
else{try{var ch=ZB.chap(ZB.chapAt(g.idx)),len=ch.to-ch.from+1,d=Math.max(0,Math.min(len,S.lv-ch.from));a.push('Глава: '+d+' из '+len);}catch(e){}}
if(r.exBonus)a.push('Отличник +'+r.exBonus);else if(r.exc&&!g.daily)a.push('без подсказок');
if(L.kind==='int'&&window.Z4&&Z4.score){var sc=Z4.score.get();if(sc>0)a.push('очки '+sc);}
L.bits.forEach(function(b){var t=ZB.safe('rsw.bit',function(){return typeof b==='function'?b(g,r):b;});if(t)a.push(String(t));});
return a.slice(0,4).join(' · ');}
var H0=null,A0=null;
function html(p){var g=p.g,r=p.r;
var title=p.lastAll||p.chapDone||p.last?p.title:(r.exc?'Пять с плюсом!':'Садись, пять!');
var stamp='<div class="zbw-stamp'+(r.exc?' plus':'')+'" aria-hidden="true">5'+(r.exc?'<sup>+</sup>':'')+'</div>';
var u=urgent(g,r,p),c=u?'<div class="rsw-urg"><p>'+esc(u.t)+'</p>'+(u.b?'<button class="btn blue rsw-ub" id="'+u.id+'">'+esc(u.b)+'</button>':'')+'</div>':card(p);
if(u&&u.b)ev('urg',{id:u.id,l:g.idx+1});
var E=window.ZBECO,box=r.box==='on'&&!(E&&E.x2===false)?(r.boxGot?'<button class="btn gold small" disabled>✅ '+boxTxt()+'</button>':'<button class="btn gold small box" id="mBox">🎬 🧺 Корзинка за рекламу: <span class="nw">'+boxTxt()+'</span></button>'):'';
var ask=p.ask&&!box?(p.ask.soc?'<div class="soc-o"><span>'+p.ask.soc+'</span><button class="btn ghost small" id="mAsk">'+p.ask.t+'</button></div>':'<button class="btn ghost small" id="mAsk">'+p.ask.t+'</button>'):'';
var nx=p.nextTxt==='В меню'?'Домой':p.nextTxt;
return'<div class="'+(p.again?'':'win ')+'zbw rsw">'+
'<div class="zbw-top"><h2>'+esc(title)+'</h2>'+stamp+'</div>'+
'<div class="rsw-rew"><div class="rsw-c" id="mRew">+'+p.reward+' <span class="coin"></span></div><div class="rsw-l">'+esc(line(g,r))+'</div></div>'+
c+'<div class="btns"><button class="btn green rsw-next" id="mNext">'+esc(nx)+'</button></div>'+(box||ask?'<div class="rsw-x">'+box+ask+'</div>':'')+'</div>';}
function after(g,r,again){var m=$('mMenu'),bs=document.querySelector('#mcard .rsw .btns');
if(m){m.textContent='Домой';m.className='btn rs-white rsw-home';}
var n=$('rsNajdi');if(n)n.onclick=function(){var c=Math.floor(g.idx/CH_LEN),X=ZB.mgr;try{X.Z().a=c+1;save();}catch(e){}hideModal();try{SND.tap();}catch(e){}ev('najdi',{c:c+1});
var back=function(){if(r.chap&&!r.chapSeen){var ni=g.idx+1<LEVELS.length?g.idx+1:-1;openChapFinale(g,r,ni);}else openMenu();};
ZMG.open('najdi',{mode:'auto',ctx:{c:c},back:back,next:{t:'Дальше ▶',f:back}}).then(function(h){if(!h)back();},back);};
if(bs&&!m&&!document.querySelector('#mcard .rsw-home')&&!g.daily&&g.idx>0&&$('mNext')&&$('mNext').textContent!=='Домой'){
var b=document.createElement('button');b.className='btn rs-white rsw-home';b.id='mMenu';b.textContent='Домой';bs.appendChild(b);
b.onclick=function(){hideModal();try{SND.tap();}catch(e){}if(r.chap&&!r.chapSeen){openChapFinale(g,r,-1);return;}maybeInterstitial(openMenu);};}
if(!again){var mc=$('mcard');if(mc){mc.style.overflowY='hidden';setTimeout(function(){mc.style.overflowY='';},1600);}}}
function wrap(){var Z=window.ZBW;if(!Z||Z.__rs)return!!Z;H0=Z.html;A0=Z.after;
Z.html=function(p){if(!(RS.lvl&&RS.lvl.win))return H0.apply(this,arguments);var h=ZB.safe('rsw.html',function(){return html(p);});return h||H0.apply(this,arguments);};
Z.after=function(g,r,again){if(!document.querySelector('#mcard .rsw'))return A0&&A0.apply(this,arguments);ZB.safe('rsw.after',function(){after(g,r,again);});};
Z.__rs=1;return true;}
wrap();
var wm=window.winModal;if(typeof wm==='function'&&!wm.__rs){var w2=function(g,r){var x=wm.apply(this,arguments);
ZB.safe('rsw.train',function(){if(!g||g.mode!=='train'||!r||!r.late||!window.MD||!MD.play)return;var bs=document.querySelector('#mcard .mdwin .btns');if(!bs||$('rsAgain'))return;
var b=document.createElement('button');b.className='btn green';b.id='rsAgain';b.textContent='↻ Ещё раз';bs.insertBefore(b,bs.firstChild);
var nx=$('mNext');if(nx)nx.className='btn rs-white';var mm=$('mMenu');if(mm)mm.textContent='Домой';
b.onclick=function(){hideModal();try{SND.tap();}catch(e){}maybeInterstitial(function(){MD.play('train',g.idx);});};});
return x;};w2.__rs=1;window.winModal=w2;}
})();
