'use strict';
(function(){
var K=window.Z3K,Z3=window.Z3;if(!K||K.sl||!Z3||!Z3.on||typeof S==='undefined')return;
var O={fix:Z3.reg('zfix',{t:'Звёзды уровней чинят место главы',who:'CORE'}),juice:Z3.reg('zjuice',{t:'Сочность слова (вспышка, комбо)',who:'CORE'}),
note:Z3.reg('znote',{t:'Зина замечает (время, серия, возвращение)',who:'CORE'}),fresh:Z3.reg('zfresh',{t:'Свежие слова: первый раз нашёл',who:'CORE'}),
y2001:Z3.reg('z2001',{t:'Сверх программы 2001+: глава в неделю',who:'CORE'}),
svaty:Z3.reg('zsvaty',{t:'Сваты: редкий визит в конце главы',who:'CORE'}),
voice:Z3.reg('zvoice',{t:'Голос Зины (SpeechKit, каркас; ВЫКЛ. — без ИИ)',who:'CORE',on:(function(){try{return/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&/[?&]z3voice=1/.test(location.search);}catch(e){return false;}})()}),
season:Z3.reg('zseason',{t:'Пародийные сезоны 2001+ (6 глав-недель, плашка и реплики)',who:'CORE'}),
quiet:Z3.reg('zquiet',{t:'«Зина, помолчи»: выключатель реплик Зины в уровне (⚙)',who:'CORE'}),
hard:K.on.hard};
for(var k in O)K.on[k]=O[k];
var Z4_N=K.Z4_N,Z4_V=K.Z4_V;
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
K.Z=function(){var z=S.z3k;if(!z||typeof z!=='object')z=S.z3k={m:0,r:{},c:0,s:0,f:0,t:0,q:0,n:0,z:0};if(!z.r)z.r={};return z;};
K.REL4=20261026;K.PRE4=1940;K.Z4_N=Z4_N;
K.tk=function(){try{return+todayKey();}catch(e){return 0;}};
K.open4=function(){var t=K.tk(),w=t&&t>K.REL4?Math.floor(Z3.days(K.REL4,t)/7):0;return Math.max(0,Math.min(Math.floor(Z4_N/20),1+w));};
K.next4=function(){var t=K.tk();if(!t||K.open4()*20>=Z4_N)return-1;var d=t>K.REL4?Z3.days(K.REL4,t):0;return 7-d%7;};
var l4=null;
K.load4=function(){if(!K.on.y2001||!Z4_N||typeof LEVELS==='undefined')return Promise.resolve(0);
if(LEVELS.length<2000)return Promise.resolve(0);
if(l4)return l4;l4=K.x().then(function(){return Promise.all([K.data().catch(function(){}),window.LV_ZB4?0:ZB.load('js/levels-zb4.js?v='+Z4_V)]);}).then(function(){var L=window.LV_ZB4||[],n=K.open4()*20;
if(LEVELS.length>=2000&&LEVELS.length<2000+n){LEVELS.push.apply(LEVELS,L.slice(LEVELS.length-2000,n));K.chAdd(100+K.open4());
ZB.emit('levels',LEVELS.length);}l4=null;return LEVELS.length;},function(e){l4=null;throw e;});return l4;};
function need4(){return K.on.y2001&&Z4_N&&(+S.lv||0)>=K.PRE4;}
function try4(){if(!need4())return;var go=function(){K.load4().catch(function(){});};
if(typeof ZBCH!=='undefined'&&!ZBCH.loaded())ZBCH.load().then(go,function(){});else go();}
K.REP=[3,9,17,27,38];
K.fixOf=function(s){var f=0;while(f<K.REP.length&&s>=K.REP[f])f++;return f;};
K.chSync=function(){var z=K.Z(),lv=+S.lv||0,ch=Math.floor(lv/20)+1;if(z.c===ch)return z;
if(z.c&&z.c>ch)return z;z.c=ch;z.s=(lv%20)*2;z.f=K.fixOf(z.s);return z;};
K.star=function(i){if(!i||!i.ok||i.daily||i.mode||!i.first||!K.on.fix)return;
var ch=Math.floor(i.idx/20)+1,z=K.Z();if(z.c!==ch){z.c=ch;z.s=(i.idx%20)*2;z.f=K.fixOf(z.s);}
var n=1+(i.hinted?0:1)+(i.bonus>0?1:0),f0=z.f;z.s+=n;z.t+=n;z.f=(i.idx%20===19)?K.REP.length:K.fixOf(z.s);
K.last={l:i.l,n:n,ch:ch,f0:f0,f:z.f};Z3.ev('z3k',{a:'star',n:n,l:i.l});
if(z.f>f0)Z3.ev('z3k',{a:'fix',ch:ch,k:z.f,n:z.s});try{save();}catch(e){}};
K.q.splice(0).forEach(function(i){ZB.safe('z3k-star',function(){K.star(i);});});
K.HARD_FROM=30;K.HARD_TRY=5;K.HARD_SEC=120;
var HT={g:null,t:0,w:-1,h:0};
function hardTick(){try{if(typeof G==='undefined'||!G)return null;var w=G.words.filter(function(x){return x.found;}).length,n=Date.now();
if(HT.g!==G||HT.w!==w){HT.g=G;HT.w=w;HT.t=n;HT.h=0;}else if(document.hidden){HT.t+=Math.min(n-(HT.k||n),5000);}HT.k=n;return HT;}catch(e){return null;}}
K.hard=function(){if(!K.on.hard)return false;try{if(typeof G==='undefined'||!G||G.won||G.mode||!(+S.lv>=K.HARD_FROM))return false;
if(!G.words.some(function(x){return!x.found;}))return false;var h=hardTick();if(!h)return false;
return(+G.miss||0)>=K.HARD_TRY||Date.now()-h.t>=K.HARD_SEC*1000;}catch(e){return false;}};
K.openWord=function(){try{if(typeof G==='undefined'||!G||G.won)return'';var wd=G.words.filter(function(x){return!x.found;}).sort(function(a,b){return b.w.length-a.w.length;})[0];
if(!wd)return'';G.hinted=true;try{STAT.use('hint');SND.open();}catch(e){}foundWord(wd,true);Z3.ev('z3k',{a:'open',l:G.idx+1,n:wd.w.length});return wd.w;}catch(e){return'';}};
var hardIv=0;
function hardBox(){var b=document.getElementById('board');if(!b)return null;var x=document.getElementById('z3kHard');
if(!x){x=document.createElement('div');x.id='z3kHard';x.className='z3hard';x.style.cssText='position:absolute;right:6px;bottom:6px;z-index:6;display:flex;gap:6px;align-items:center';b.appendChild(x);}return x;}
var HS={id:'z3hard',zone:'board',order:95,render:function(c){var x=document.getElementById('z3kHard');if(x&&x.parentNode)x.parentNode.removeChild(x);
clearInterval(hardIv);hardIv=0;return K.onHard.length&&c&&!c.daily&&!c.mode?'<i hidden></i>':'';},
mount:function(el,c){var g=G;hardTick();hardIv=setInterval(function(){if(G!==g||!g||g.won){clearInterval(hardIv);hardIv=0;return;}
if(!K.hard())return;clearInterval(hardIv);hardIv=0;var box=hardBox();if(!box)return;
K.onHard.forEach(function(f){ZB.safe('z3hard-f',function(){f(box,c);});});},3000);}};
if(K.on.hard){ZB.add(ZB.levelSlots,HS);var st=ZB._st,gm=document.getElementById('game');
if(st&&gm&&gm.classList.contains('on')&&!hardIv&&HS.render(st))ZB.safe('z3hard-late',function(){HS.mount(null,st);});}
K.quiet=function(){return!!(K.on.quiet&&num(K.Z().z));};
var QA=0;
function qWrap(){var f=window.zina;if(typeof f!=='function'||f.__z3q)return;
var w=function(){try{if(K.quiet()&&typeof G!=='undefined'&&G&&!G.tut&&Date.now()>QA&&document.getElementById('game').classList.contains('on'))return;}catch(e){}return f.apply(this,arguments);};
w.__z3q=1;window.zina=w;
['hintLetter','hintWord','catHelp'].forEach(function(n){var h=window[n];if(typeof h!=='function'||h.__z3q)return;var x=function(){QA=Date.now()+60000;return h.apply(this,arguments);};x.__z3q=1;window[n]=x;});
var fw=window.foundWord;if(typeof fw==='function'&&!fw.__z3q){var y=function(wd,byHint){if(!byHint)QA=0;return fw.apply(this,arguments);};y.__z3q=1;window.foundWord=y;}
var os=window.openSettings;if(typeof os==='function'&&!os.__z3q){var o=function(){var r=os.apply(this,arguments);ZB.safe('z3quiet-set',qRow);return r;};o.__z3q=1;window.openSettings=o;}}
function qRow(){var c=document.getElementById('mcard'),rs=document.getElementById('setRows');if(!c||!rs||document.getElementById('sZq'))return;
var b=document.createElement('button');b.type='button';b.id='sZq';
var draw=function(){var on=!K.quiet();b.className='setrow'+(on?'':' off');b.innerHTML='<span>💬 Реплики Зины</span><b>'+(on?'● вкл':'○ выкл')+'</b>';};draw();
b.onclick=function(){var z=K.Z();z.z=z.z?0:1;try{save();SND.tap();}catch(e){}Z3.ev('z3k',{a:'quiet',r:z.z?'on':'off'});
if(z.z){try{var e=document.getElementById('zSay');if(e)e.classList.remove('on');}catch(x){}}draw();};
rs.parentNode.insertBefore(b,rs.nextSibling);}
if(K.on.quiet)Z3.whenReady(function(){ZB.safe('z3k-quiet',qWrap);});
K.mixDue=function(idx,daily){try{if(!K.mix||daily||(window.MD&&MD.pend))return false;var lv=+S.lv||0,l=idx+1;
if(lv<K.MIX_FROM||idx!==lv||l%20===1||Z3.day()<2)return false;if(l%7!==0&&l%7!==4)return false;return num(K.Z().m)<l;}catch(e){return false;}};
var NUMR={sv:['Связи у Зины','🧩'],sh:['Шифровка','🔢'],rp:['Красная ручка','🖍']};
K.rubs=function(){var L=[],seen={};Z3.rubs().forEach(function(r){if(r&&r.id&&typeof r.play==='function'&&!seen[r.id]){seen[r.id]=1;L.push({id:r.id,t:r.t||r.id,ic:r.ic||'📰',z3:r});}});
if(window.ZBNUM&&ZBNUM.ilPlay!==0&&!ZB2.off('num'))Object.keys(NUMR).forEach(function(id){if(!seen[id])L.push({id:id,t:NUMR[id][0],ic:NUMR[id][1],num:1});});return L;};
K.pick=function(l){var L=K.rubs();if(!L.length)return null;var r=K.Z().r,best=null,bv=1e9;
L.forEach(function(x,i){var a=r[x.id]||[0,0,0],w=Math.max(.3,Math.min(3,(1+a[1])/(1+a[2]))),v=(a[0]+1)/w+((i+l)%L.length)*1e-3;if(v<bv){bv=v;best=x;}});return best;};
var BUSY=null;
K.sl=function(w,s0,a0){var idx=a0[0],daily=a0[1];
if(!daily&&typeof LEVELS!=='undefined'&&idx>=LEVELS.length&&LEVELS.length>=2000&&need4()){K.load4().then(function(){if(idx<LEVELS.length)w.apply(s0,a0);else openTheEnd();},function(){try{openMenu();}catch(e){}});return;}
if(!BUSY&&K.mixDue(idx,daily)){var p=K.pick(idx+1);if(p){BUSY={idx:idx};
K.x().then(function(){BUSY=null;K.mixGo(idx,p,function(){w.__orig.apply(s0,a0);});},function(){BUSY=null;w.__orig.apply(s0,a0);});return;}}
return w.__orig.apply(s0,a0);};
ZB.on('level',function(){ZB.safe('z3k-4',try4);if(!K._b)K.x().then(function(){ZB.safe('z3k-boot',function(){if(K.boot)K.boot();});},function(){});});ZB.on('home',function(){ZB.safe('z3k-4',try4);});
function wrapEnd(){var f=window.openTheEnd;if(typeof f!=='function'||f.__z3k)return;var w=function(){var a=arguments;
if(need4()&&LEVELS.length>=2000&&S.lv>=LEVELS.length&&LEVELS.length<2000+K.open4()*20){K.load4().then(function(){if(S.lv<LEVELS.length){try{hideModal();}catch(e){}startLevel(S.lv);}else f.apply(null,a);},function(){f.apply(null,a);});return;}
f.apply(this,a);if(K.on.y2001&&LEVELS.length>=2000)ZB.safe('z3k-end',function(){K.x().then(function(){if(K.endNote)K.endNote();});});};
w.__z3k=1;window.openTheEnd=w;}
Z3.whenReady(function(){ZB.safe('z3k-4',try4);wrapEnd();
setTimeout(function(){if(+S.lv>=1)K.x().then(function(){ZB.safe('z3k-boot',function(){if(K.boot)K.boot();});},function(){});},300);});
})();
