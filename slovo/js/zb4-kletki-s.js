'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.KLETKI||Z.KLETKI.s)return;var K=Z.KLETKI;K.s=1;var O=K.on,ZB=window.ZB,C=window.ZBCELL;if(!C||!ZB)return;
var COIN={bag:2,pie:3,key:3,flip:3,dark:2,theme:2},CAP=10;
try{if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4c==null)ZBECO.cap.z4c=CAP;}catch(e){}
var force=(/[?&]z4cf=([a-z]+)/.exec(location.search)||[])[1]||'';
var data=null;function load(){if(window.Z4C_TH)return Promise.resolve();if(!data)data=ZB.load('js/zb4-kletki-data.js').catch(function(){data=null;});return data;}
load();
var FB={'z4c.bag.intro':'Клетка с мешком! Открой её своим словом — в мешке сюрприз.','z4c.pie.intro':'Пирожок! Открой клетку своим словом за минуту — очки уровня удвою.',
'z4c.flip.intro':'Валерка всё заполнил! Найди пальцем его ошибки и исправь — собери слово на круге.','z4c.dark.on':'Свет отключили! Каждое слово — свечка.',
'z4c.key.intro':'Серые клетки! Их буквы складываются в ключевое слово.','z4c.theme.ask':'Три слова у тебя из одной моей тетрадки. Из какой?'};
function T(k,c){var t=Z.txt(k,c);return t||FB[k]||'';}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function zS(){return typeof S!=='undefined'&&S&&S.z4c||{};}
function h32(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rnd(seed){var x=(seed|0)||1;return function(){x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%100000)/100000;};}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function up(s){return String(s).toUpperCase();}
function say(k,c,mood,sec){var t=T(k,c);if(t&&typeof zina==='function')zina(t,mood||'happy',sec||Math.min(20,5+t.length*.12));return t;}
function seen(ch){return String(zS().s||'').indexOf(ch)>=0;}
function see(ch){var z=zS();if(!seen(ch)){z.s=String(z.s||'')+ch;try{save();}catch(e){}}}
function intro(g,ch,k,delay){if(seen(ch))return;setTimeout(function(){if(G!==g||g.won)return;var t=T(k);if(t)zina(t,'wow',Math.min(20,6+t.length*.12));see(ch);},delay||900);}
function chips(){try{C.chips();}catch(e){}}
function cellOf(k){return G&&G.cells.get(k);}
function busy(c){if(!c||c.open||c.zk||c.lock||c.gift)return true;for(var k in c)if(k.indexOf('z4')===0&&c[k])return true;return false;}
function keys(g){var a=[];g.cells.forEach(function(c,k){a.push(k);});return a;}
function wordsOf(g,c){return g.words.filter(function(w){return wordCells(w).indexOf(c)>=0;});}
function inject(g,o){var lv=g.lv,z={},l2={},k;if(lv.z)for(k in lv.z)z[k]=lv.z[k];for(k in o)z[k]=o[k];for(k in lv)l2[k]=lv[k];l2.z=z;g.lv=l2;if(!g.zc)g.zc={};}
function nz(lv){var n=0;if(lv.z)for(var k in lv.z)if(k!=='k'&&k.indexOf('z4')!==0)n++;return n;}
var BAG=['x3','gos','let','cat'];
C.add('z4b',{
start:function(g,z,s){var q=s.z4;if(!q||q.f!=='bag')return;var c=cellOf(z.z4b);if(!c||q.r)return;if(c.open){q.r='gone';return;}c.zk=1;c.z4c='bag';c.el.classList.add('z4c-bag');},
open:function(c,how,s){var q=s.z4;if(!q||q.f!=='bag'||q.r||G.cells.get(G.lv.z.z4b)!==c)return;c.el.classList.remove('z4c-bag');c.z4c='';
if(how){q.r='hint';setTimeout(function(){if(G&&!G.won)say('z4c.bag.hint',null,'norm');},700);return;}
var g=G,r=BAG[h32('bag'+g.idx)%BAG.length];if(r==='let'&&!giftCell(g))r='x3';q.r=r;see('b');
setTimeout(function(){if(G!==g)return;
if(r==='x3'){var w=wordsOf(g,c).filter(function(x){return x.found;}).sort(function(a,b){return b.w.length-a.w.length;})[0];Z.score.add(2*(w?w.w.length:4),'z4c.bag');}
if(r==='let'){var t=giftCell(g);if(t){openCell(t,0,'hint');setTimeout(function(){if(G===g&&typeof checkAutoFound==='function'){checkAutoFound();if(typeof saveCur==='function')saveCur();}},450);}}
if(!g.won)say('z4c.bag.'+r,null,r==='gos'?'wow':'happy');},650);}});
function giftCell(g){var best=null;g.cells.forEach(function(c){if(best||busy(c))return;
if(wordsOf(g,c).every(function(w){return!w.found&&wordCells(w).filter(function(x){return!x.open;}).length>=2;}))best=c;});return best;}
var PIE=60;
C.add('z4p',{
start:function(g,z,s){var q=s.z4;if(!q||q.f!=='pie')return;var c=cellOf(z.z4p);if(!c)return;if(q.t==null)q.t=PIE;if(c.open){if(!q.r)q.r='gone';return;}
c.zk=1;c.z4c='pie';c.el.classList.add('z4c-pie');pieDraw(c,q);},
chip:function(z,s){var q=s.z4;if(!q||q.f!=='pie')return'';if(q.r==='hot')return'<b class="zbc ok">🥧 ×2</b>';if(q.r)return'';
return'<b class="zbc" id="z4cPie">🥧 '+(q.t>0?fmt(q.t):'остыл')+'</b>';},
open:function(c,how,s){var q=s.z4;if(!q||q.f!=='pie'||q.r||G.cells.get(G.lv.z.z4p)!==c)return;c.el.classList.remove('z4c-pie','z4c-cold');c.el.style.removeProperty('--z4t');c.z4c='';see('p');
var g=G;if(!how&&q.t>0){q.r='hot';Z.score.mult(2,'z4c.pie');}else{q.r=how?'hint':'cold';if(!how)Z.score.add(3,'z4c.pie');}
if(q.r!=='hint')setTimeout(function(){if(G===g&&!g.won)say(q.r==='hot'?'z4c.pie.hot':'z4c.pie.cold',null,q.r==='hot'?'wow':'happy');},650);chips();}});
function fmt(t){t=Math.max(0,t|0);return Math.floor(t/60)+':'+('0'+t%60).slice(-2);}
function pieDraw(c,q){c.el.style.setProperty('--z4t',Math.round(100*Math.max(0,q.t)/PIE)+'%');if(q.t<=0)c.el.classList.add('z4c-cold');}
setInterval(function(){var g=typeof G!=='undefined'&&G,q=g&&g.zc&&g.zc.z4;if(!q||q.f!=='pie'||q.r||!(q.t>0)||g.won||!g.lv.z||!g.lv.z.z4p)return;
if((typeof paused!=='undefined'&&paused)||!document.getElementById('game').classList.contains('on')||document.getElementById('modal').classList.contains('on')||document.hidden)return;
q.t--;var c=cellOf(g.lv.z.z4p),e=document.getElementById('z4cPie');if(e)e.textContent='🥧 '+(q.t>0?fmt(q.t):'остыл');if(c)pieDraw(c,q);
if(q.t<=0&&typeof saveCur==='function')saveCur();},1000);
var DM=null;
function dictMain(){if(!DM&&typeof DICT_MAIN==='string')DM=DICT_MAIN.split(' ');return DM||[];}
function keyPick(g){if(typeof dictReady==='function'&&!dictReady())return null;var L=dictMain();if(!L.length)return null;
var cnt={},W={};g.letters.forEach(function(c){cnt[c]=(cnt[c]||0)+1;});g.words.forEach(function(w){W[w.w]=1;});
var cand=L.filter(function(w){if(w.length<4||w.length>6||W[w]||g.bonus.has(w))return false;var u={};
for(var i=0;i<w.length;i++){var c=w.charAt(i);u[c]=(u[c]||0)+1;if(u[c]>(cnt[c]||0))return false;}return true;});
if(!cand.length)return null;var r=rnd(h32('key'+g.idx));
for(var t=0;t<8&&cand.length;t++){var w=cand.splice(Math.floor(r()*cand.length),1)[0];if(typeof isWord==='function'&&!isWord(w))continue;
var used={},cs=[],closed=0,ok=true;
for(var i=0;i<w.length&&ok;i++){var best=null,bc=null;g.cells.forEach(function(c,k){if(used[k]||c.ch!==w.charAt(i)||c.zk||c.lock||c.z4c)return;
if(!best||(!c.open&&bc.open))best=k,bc=c;});
if(!best)ok=false;else{used[best]=1;cs.push(best);if(!bc.open)closed++;}}
if(ok&&closed*2>=w.length)return{w:w,c:cs};}
return null;}
function keyLine(q){return q.c.map(function(k,i){var c=cellOf(k);return c&&c.open?up(q.w.charAt(i)):'·';}).join('');}
C.add('z4k',{
start:function(g,z,s){var q=s.z4;if(!q||q.f!=='key')return;if(!q.ok&&g.bonus.has(q.w))q.ok=1;
q.c.forEach(function(k,i){var c=cellOf(k);if(!c)return;c.zk=1;c.z4c='key';c.el.classList.add('z4c-key');c.el.setAttribute('data-z4n',i+1);});},
chip:function(z,s){var q=s.z4;if(!q||q.f!=='key')return'';return q.ok?'<b class="zbc ok">🔑 '+esc(up(q.w))+' ✓</b>':'<button type="button" class="zbc" data-zbc="z4k">🔑 '+keyLine(q)+'</button>';},
tap:function(){var q=G.zc&&G.zc.z4;if(q)zina(T('z4c.key.intro')+' Букв: '+q.w.length+'. Ищи среди лишних слов.','happy',9);},
open:function(c,how,s){var q=s.z4;if(q&&q.f==='key'&&c.z4c==='key')setTimeout(chips,450);},
bonus:function(w,s){var q=s.z4;if(!q||q.f!=='key'||q.ok||w!==q.w)return false;see('k');
var left=q.c.filter(function(k){var c=cellOf(k);return c&&!c.open;}).length;q.ok=left?2:1;Z.score.add(left?5+4*left:3,'z4c.key');
var g=G;setTimeout(function(){if(G===g&&!g.won)say(left?'z4c.key.early':'z4c.key.late',{w:up(w)},'wow');},600);chips();return true;}});
function flipSetup(g,q){var cnt=new Map();g.words.forEach(function(w){wordCells(w).forEach(function(c){cnt.set(c,(cnt.get(c)||0)+1);});});
var r=rnd(h32('flip'+g.idx)),W=g.words.filter(function(w){return!w.found&&wordCells(w).some(function(c){return cnt.get(c)===1&&!c.open;});});
for(var i=W.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=W[i];W[i]=W[j];W[j]=t;}
W=W.slice(0,5);if(W.length<3)return false;var L=g.letters.filter(function(c,i,a){return a.indexOf(c)===i;});q.b={};q.t=[];q.m=0;
W.forEach(function(w){var cs=wordCells(w).filter(function(c){return cnt.get(c)===1&&!c.open;}),c=cs[Math.floor(r()*cs.length)],
o=L.filter(function(x){return x!==c.ch;});q.b[c.x+','+c.y]=o[Math.floor(r()*o.length)]||'о';});
g.cells.forEach(function(c,k){if(!q.b[k]&&!c.open){c.open=true;c.el.textContent=c.ch;c.el.classList.add('open');}});
g.words.forEach(function(w){if(!w.found&&wordCells(w).every(function(c){return c.open;}))w.found=true;});
return true;}
function flipShow(g,q){for(var k in q.b){var c=cellOf(k);if(!c||c.open)continue;c.zk=1;c.z4c='flip';c.el.textContent=q.b[k];c.el.classList.add('open','z4c-bad');
if(q.t.indexOf(k)>=0)c.el.classList.add('z4c-tap');}
g.half=g.words.filter(function(w){return w.found;}).length*2>=g.words.length;if(typeof updCount==='function')updCount();}
function flipN(q){var n=0;for(var k in q.b)n++;return n;}
function flipFixed(q){var n=0;for(var k in q.b){var c=cellOf(k);if(c&&c.open)n++;}return n;}
function flipGrade(q){var n=flipN(q),t=q.t.length;return t>=n&&q.m<=1?5:t>=n-2?4:3;}
C.add('z4f',{
chip:function(z,s){var q=s.z4;if(!q||q.f!=='flip')return'';return'<button type="button" class="zbc" data-zbc="z4f">🖍 Ошибок: '+q.t.length+' из '+flipN(q)+'</button>';},
tap:function(){say('z4c.flip.intro',null,'happy');},
open:function(c,how,s){var q=s.z4;if(!q||q.f!=='flip'||c.z4c!=='flip')return;c.z4c='';c.el.classList.remove('z4c-bad','z4c-tap');setTimeout(chips,50);}});
function flipTap(e){var g=typeof G!=='undefined'&&G,q=g&&g.zc&&g.zc.z4;if(!q||q.f!=='flip'||g.won||g.hintMode)return;
var el=e.target&&e.target.closest?e.target.closest('.cell'):null;if(!el)return;var cell=null,key='';g.cells.forEach(function(c,k){if(c.el===el){cell=c;key=k;}});if(!cell)return;
if(flipFixed(q)>=flipN(q))return;e.stopImmediatePropagation();if(typeof SND!=='undefined'&&SND.tap)SND.tap();
if(q.b[key]&&!cell.open){if(q.t.indexOf(key)<0){q.t.push(key);el.classList.add('z4c-tap');say('z4c.flip.tap',null,'wow',6);chips();if(typeof saveCur==='function')saveCur();}
else zina('Тут ошибка — собери это слово на круге правильно.','happy',5);return;}
if(!q.w)q.w={};if(!q.w[key]){q.w[key]=1;q.m++;}say('z4c.flip.miss',null,'norm');}
try{document.getElementById('grid').addEventListener('click',flipTap,true);}catch(e){}
var THL=null;
function themes(){if(THL)return THL;var D=window.Z4C_TH;if(!D)return null;THL={};for(var t in D)D[t].split(' ').forEach(function(w){THL[w]=t;});return THL;}
function themePick(g){var M=themes();if(!M)return null;var c={};g.words.forEach(function(w){var t=M[w.w];if(t)(c[t]=c[t]||[]).push(w.w);});
var best=null;for(var t in c)if(c[t].length>=3&&(!best||c[t].length>c[best].length))best=t;return best?{t:best,w:c[best]}:null;}
function themeFound(g,q){return q.w.filter(function(w){return g.words.some(function(x){return x.w===w&&x.found;});}).length;}
C.add('z4t',{
chip:function(z,s){var q=s.z4t;if(!q)return'';if(q.r)return q.r>0?'<b class="zbc ok">🤔 '+esc(q.t)+' ✓</b>':'';
return themeFound(G,q)>=3?'<button type="button" class="zbc" data-zbc="z4t">🤔 Что общего?</button>':'';},
tap:function(){themeAsk();}});
function themeAsk(){var g=G,q=g&&g.zc&&g.zc.z4t;if(!q||q.r||g.won)return;var D=window.Z4C_TH||{},all=Object.keys(D).filter(function(t){return t!==q.t;}),r=rnd(h32('th'+g.idx));
var opt=[q.t];while(opt.length<4&&all.length)opt.push(all.splice(Math.floor(r()*all.length),1)[0]);opt.sort(function(){return r()-.5;});
modal('<div class="z4c-ask"><h2>🤔 Что общего?</h2><p>'+esc(T('z4c.theme.ask'))+'</p>'+opt.map(function(t){return'<button type="button" class="btn ghost z4c-opt" data-t="'+esc(t)+'">'+esc(t)+'</button>';}).join('')+
'<button type="button" class="btn small z4c-no" data-t="">Потом</button></div>');
[].forEach.call(document.querySelectorAll('#mcard .z4c-opt,#mcard .z4c-no'),function(b){b.onclick=function(){var t=b.getAttribute('data-t');hideModal();if(!t||G!==g)return;
var n=themeFound(g,q);q.r=t===q.t?(n<=3?2:1):-1;if(q.r>0)Z.score.add(q.r===2?8:5,'z4c.theme');see('t');
Z.ev('z4c',{a:'theme',r:q.r,n:n,lv:g.idx+1});say(q.r>0?'z4c.theme.ok':'z4c.theme.no',{t:q.t},q.r>0?'wow':'norm');chips();if(typeof saveCur==='function')saveCur();};});}
var DK=null,NEED=3;
C.add('z4d',{chip:function(){return DK&&DK.g===G&&!DK.end?'<b class="zbc">🕯️ '+DK.n+' из '+NEED+'</b>':'';}});
function darkOn(g,done,info){var b=document.getElementById('board');if(!b)return done();
var cnt=new Map();g.words.forEach(function(w){wordCells(w).forEach(function(c){cnt.set(c,(cnt.get(c)||0)+1);});});
DK={g:g,n:0,done:done,end:0};g.cells.forEach(function(c){if(c.open&&cnt.get(c)>1)c.el.classList.add('z4c-dim');});
b.classList.add('z4c-dark');if(info&&info.calm)b.classList.add('z4c-calm');inject(g,{z4d:1});var z=zS();z.d=g.idx+1;
Z.ev('z4c',{a:'dark',lv:g.idx+1});say('z4c.dark.on',null,'wow');see('d');chips();}
function darkOff(win){var d=DK;if(!d||d.end)return;d.end=1;var b=document.getElementById('board');if(b)b.classList.remove('z4c-dark','z4c-calm');
[].forEach.call(document.querySelectorAll('#grid .z4c-dim,#grid .z4c-lit'),function(e){e.classList.remove('z4c-dim','z4c-lit');});
if(d.n>=NEED){Z.score.add(2*d.n,'z4c.dark');d.ok=1;if(!win&&G===d.g)say('z4c.dark.end',null,'happy');}chips();ZB.safe('z4c.dark.done',d.done);}
Z.lvlEvent.add({id:'z4c.dark',who:'KLETKI',w:1,
ok:function(info){var g=typeof G!=='undefined'&&G;return!!O.dark&&Z.open('z4c.dark')&&(info.lv-(+zS().d||0)>=10||/z4ev=z4c\.dark/.test(location.search))&&!(g&&g.zc&&g.zc.z4&&g.zc.z4.f==='flip');},
run:function(g,done,info){darkOn(g,done,info);}});
var FW={bag:3,pie:3,key:3,flip:2};
function can(f,g){if(!O[f])return false;if(f==='flip')return Z.open('z4c.flip')&&g.words.length>=5&&!nz(g.lv);return nz(g.lv)<2;}
function choose(i,g){var L=[],s=0,k;
if(force){return can(force,g)?force:'';}
var R=isOK()?8:5;if(h32('z4c'+i.idx)%R)return'';
for(k in FW)if(can(k,g)){L.push(k);s+=FW[k];}if(!L.length)return'';var x=h32('z4cf'+i.idx)%s;
for(var j=0;j<L.length;j++){x-=FW[L[j]];if(x<0)return L[j];}return L[0];}
function place(g,f){var cs=[],r=rnd(h32(f+g.idx));g.cells.forEach(function(c,k){if(!busy(c)&&wordsOf(g,c).some(function(w){return!w.found;}))cs.push(k);});
return cs.length?cs[Math.floor(r()*cs.length)]:'';}
function setup(i){var g=i.G;DK=null;if(!g||g.daily)return;var cur=S.curs&&S.curs[g.key],z0=cur&&cur.z&&typeof cur.z==='object'?cur.z:null;
if(!g.lv.z&&z0&&(z0.z4||z0.z4t))g.zc=z0;
var q=g.zc&&g.zc.z4,qt=g.zc&&g.zc.z4t;
if(!q&&!qt){if(!Z.lvlEvent.fit||!Z.lvlEvent.fit(i))return;var f=choose(i,g);if(f&&!force&&Z.fx&&!Z.fx('z4c',g))f='';
if(f==='bag'||f==='pie'){var k=place(g,f);if(k)q={f:f,c:k};}
else if(f==='key'){var kk=keyPick(g);if(kk)q={f:'key',w:kk.w,c:kk.c};}
else if(f==='flip'){q={f:'flip'};if(!flipSetup(g,q))q=null;}
if(O.theme&&(!q||q.f!=='flip')&&(!force||force==='theme')){var th=themePick(g);if(th)qt={t:th.t,w:th.w,r:0};}
if(!q&&!qt)return;if(!g.zc)g.zc={};if(q)g.zc.z4=q;if(qt)g.zc.z4t=qt;var zz=zS();zz.n=(+zz.n||0)+1;
Z.ev('z4c',{a:'on',f:q?q.f:'theme',lv:g.idx+1});}
var o={};if(q){o[q.f==='bag'?'z4b':q.f==='pie'?'z4p':q.f==='key'?'z4k':'z4f']=q.c||1;}if(qt)o.z4t=1;inject(g,o);
if(q){var ok=C.K[q.f==='bag'?'z4b':q.f==='pie'?'z4p':q.f==='key'?'z4k':'z4f'];if(ok.start)ZB.safe('z4c.start',function(){ok.start(g,g.lv.z,g.zc);});
if(q.f==='flip')flipShow(g,q);
var IN={bag:['b','z4c.bag.intro'],pie:['p','z4c.pie.intro'],key:['k','z4c.key.intro'],flip:['f','z4c.flip.intro']}[q.f];
if(q.f==='flip')setTimeout(function(){if(G===g&&!g.won){say('z4c.flip.intro',null,'happy');see('f');}},seen('f')?500:900);
else intro(g,IN[0],IN[1]);}
chips();if(typeof saveCur==='function')saveCur();}
Z.onStart(function(i){ZB.safe('z4c.setup',function(){setup(i);});});
Z.onWord(function(o){var d=DK;if(!d||d.end||o.bonus||o.G!==d.g)return;d.n++;var wd=o.G.words.filter(function(x){return x.w===o.w;})[0];
if(wd)wordCells(wd).forEach(function(c){c.el.classList.remove('z4c-dim');c.el.classList.add('z4c-lit');});
if(d.n>=NEED&&o.left>0)setTimeout(function(){darkOff(false);},900);else chips();});
Z.onWord(function(o){var g=o.G,q=g&&g.zc&&g.zc.z4t;if(q&&!q.r&&!o.bonus)setTimeout(chips,300);});
var RES=null;
Z.onWin(function(i){var g=i.G;if(DK&&DK.g===g)darkOff(true);RES=null;if(!g||!g.zc)return;var q=g.zc.z4,qt=g.zc.z4t,R={g:g,t:[],c:0},gr=0;
if(q){var good=q.f==='bag'?BAG.indexOf(q.r)>=0:q.f==='pie'?q.r==='hot':q.f==='key'?!!q.ok:true;
if(q.f==='flip'){gr=flipGrade(q);Z.score.add(4*q.t.length,'z4c.flip');R.t.push('🖍 Красная ручка: '+gr+'. Ошибок найдено пальцем: '+q.t.length+' из '+flipN(q));
try{toast('🖍 Оценка за перевёртыш: '+gr,3500);}catch(e){}if(i.first)R.c+=give(gr===5?3:gr===4?2:1);}
else if(good){R.t.push(q.f==='bag'?'👝 Кот в мешке открыт своим словом':q.f==='pie'?'🥧 Пирожок горячий — очки ×2':q.ok===2?'🔑 Ключ «'+up(q.w)+'» угадан раньше букв':'🔑 Ключ «'+up(q.w)+'» угадан');
if(i.first)R.c+=give(COIN[q.f]);}
Z.ev('z4c',{a:'win',f:q.f,r:q.f==='flip'?gr:q.r||q.ok||0,lv:i.lv});}
if(qt&&qt.r>0){R.t.push('🤔 Угадана тетрадка «'+qt.t+'»');if(i.first)R.c+=give(COIN.theme);}
if(DK&&DK.g===g&&DK.ok){R.t.push('🕯️ Разгадал при свечах');if(i.first)R.c+=give(COIN.dark);}
RES=R.t.length?R:null;});
function give(n){if(!n||!window.ZBECO||!ZBECO.give)return 0;var k=ZBECO.give('z4c',n,'z4c')||0;
if(k){var z=zS(),d=0;try{d=+todayKey();}catch(e){}if(!(z.c instanceof Array)||z.c[0]!==d)z.c=[d,0];z.c[1]+=k;}return k;}
Z.winLine.add({id:'z4c',order:45,txt:function(i){var r=RES;if(!r||r.g!==i.G)return'';return r.t[0]+(r.c?' · +'+r.c+' монет':'');}});
K.st=function(){var g=typeof G!=='undefined'&&G;return{zc:g&&g.zc?JSON.parse(JSON.stringify(g.zc)):null,z:g&&g.lv?g.lv.z||null:null,dark:DK?{n:DK.n,end:DK.end}:null,res:RES?RES.t:null,data:!!window.Z4C_TH};};
var css=document.createElement('style');css.textContent=
'.cell.z4c-bag:not(.open){background:var(--z4c-bag,#efe0c2);border-color:#a0662a}'+
'.cell.z4c-bag::after,.cell.z4c-pie::after,.cell.z4c-key::after{position:absolute;right:-.28em;top:-.38em;font-size:.48em;line-height:1;font-weight:800;pointer-events:none}'+
'.cell.z4c-bag::after{content:"👝"}'+
'.cell.z4c-pie:not(.open){background:conic-gradient(var(--z4c-pie,#ffc98a) var(--z4t,100%),var(--cell,#f3f1ea) 0)}.cell.z4c-pie::after{content:"🥧"}'+
'.cell.z4c-pie.z4c-cold:not(.open){background:var(--cell,#f3f1ea)}'+
'.cell.z4c-key{background:var(--z4c-key,#dcdcdc)}.cell.z4c-key::after{content:attr(data-z4n);color:#fff;background:#6b6b6b;border-radius:50%;width:1.25em;height:1.25em;display:flex;align-items:center;justify-content:center}'+
'.cell.z4c-tap{box-shadow:inset 0 0 0 3px var(--z4c-pen,#d93025);color:var(--z4c-pen,#c62828)}'+
'#board.z4c-dark #grid .cell{background:var(--z4c-dark,#3b4058);border-color:#5b6182;color:#f4e9c8;transition:background .6s}'+
'#board.z4c-dark #grid .cell.z4c-dim{color:transparent}'+
'#board.z4c-dark #grid .cell.z4c-lit{background:var(--z4c-lit,#fff1c1);color:#5a3d1a}'+
'#board.z4c-calm #grid .cell{transition:none}'+
'.z4c-ask{text-align:center}.z4c-ask p{font-size:16px;margin:6px 0 12px}.z4c-ask .z4c-opt{display:block;width:100%;min-height:46px;margin:6px 0;font-size:16px}'+
'.z4c-ask .z4c-no{margin-top:8px;min-height:44px}';
document.head.appendChild(css);
})();
