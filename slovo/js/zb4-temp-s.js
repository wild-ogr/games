'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.TEMP||Z.TEMP.s)return;var T=Z.TEMP;T.s=1;var O=T.on,ZB=window.ZB,Q=location.search;
function $$(i){return document.getElementById(i);}
function zS(){var z=S.z4t;if(!z||typeof z!=='object')z=S.z4t={p:0,h:[],c:[0,''],d:0,n:0,u:0,k:0};if(!(z.h instanceof Array))z.h=[];if(!(z.c instanceof Array))z.c=[0,''];return z;}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function sv(){try{save();}catch(e){}}
function tk(){try{return+todayKey();}catch(e){return 0;}}
function ev(o){Z.ev('z4t',o);}
function gG(){return typeof G!=='undefined'&&G?G:null;}
function say(t,m,s){try{if(t)zina(t,m||'norm',s||5);}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function num(re,d){var m=re.exec(Q);return m?+m[1]:d;}
function plu(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return n%10===1&&n%100!==11?a:n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?b:c;}}
function tx(k,d,c){var t=Z.txt(k,c);return t||String(d).replace(/\{(\w+)\}/g,function(m,x){return c&&c[x]!=null?c[x]:m;});}
ZB.load('js/zb4-temp-data.js').catch(function(){});
if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4t==null)ZBECO.cap.z4t=10;
function modalOn(){var m=$$('modal');return!!(m&&m.classList.contains('on'));}
function play(){try{return typeof inPlay==='function'&&inPlay();}catch(e){return false;}}
function css(){if($$('z4tCss'))return;var s=document.createElement('style');s.id='z4tCss';s.textContent=
'#board .z4tp{position:absolute;left:8px;right:8px;bottom:8px;z-index:7;padding:10px 12px;border-radius:16px;background:var(--z3-paper,#fffaf0);'+
'color:var(--z3-ink,#222);box-shadow:var(--z3-shadow,0 3px 12px rgba(0,0,0,.25));font:15px/1.35 var(--z3-font,inherit)}'+
'#board .z4tp p{margin:0 0 8px}#board .z4tp .z4tb{display:flex;flex-wrap:wrap;gap:8px}'+
'.z4tbt{min-height:44px;padding:0 14px;border:0;border-radius:12px;font:700 15px var(--z3-font,inherit);cursor:pointer;background:var(--z3-card,#fff);'+
'color:var(--z3-ink,#222);box-shadow:0 2px 0 var(--z3-line,#ccc)}.z4tbt.ok{color:var(--z3-acc-ink,#fff);background:var(--z3-acc-grad,#237a3b);box-shadow:0 2px 0 var(--z3-acc-edge,#185c2a)}'+
'#board .z4tch{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:6;pointer-events:none;max-width:92%;padding:6px 12px;border-radius:999px;'+
'background:#fff6d6;color:#7a4a12;font:700 14px/1.3 var(--z3-font,inherit);text-align:center;box-shadow:var(--z3-shadow,0 2px 6px rgba(0,0,0,.2))}'+
'#wheel .let.z4t-med{box-shadow:0 0 0 4px #d4a017,0 0 0 7px rgba(212,160,23,.35)}#wheel .let.z4t-med:after{content:"🏅";position:absolute;right:-6px;top:-8px;font-size:15px}'+
'.hb.z4t-mic.on{background:#ffe1e1;box-shadow:0 0 0 3px #d9534f}'+
'.z4t-card{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--z3-card);border:1px solid var(--z3-line);border-radius:var(--z3-rb);color:var(--z3-ink);font-size:14px;line-height:1.35}'+
'.z4t-card .z4t-ic{font-size:26px}.z4t-card .z4t-ct{flex:1;display:flex;flex-direction:column;gap:2px}'+
'.z4tdz h2{margin:0 0 6px}.z4tdz .z4tw{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.z4tdz .z4tw span{padding:6px 10px;border-radius:10px;background:var(--z3-card,#fff);'+
'border:1px solid var(--z3-line,#ccc);font:700 17px var(--z3-font,inherit);letter-spacing:2px}.z4tdz .z4tw span.ok{background:#e3f4e6;border-color:#2b7a3f}'+
'.z4tdz .z4tin{min-height:34px;margin:6px 0;font:800 22px var(--z3-font,inherit);letter-spacing:3px;text-align:center}'+
'.z4tdz .z4tl{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:6px 0 10px}.z4tdz .z4tl button{width:48px;height:48px;border:0;border-radius:12px;'+
'font:800 22px var(--z3-font,inherit);background:#fff3d0;color:var(--z3-ink,#222);box-shadow:0 2px 0 var(--z3-gold,#d4a017);cursor:pointer}.z4tdz .z4tl button[disabled]{opacity:.3}'+
'.z4tdz .z4tb{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}';
document.head.appendChild(s);}
function panel(h){var b=$$('board');if(!b)return null;css();var e=$$('z4tP');if(!e){e=document.createElement('div');e.id='z4tP';e.className='z4tp';b.appendChild(e);}e.innerHTML=h;return e;}
function panelOff(){var e=$$('z4tP');if(e&&e.parentNode)e.parentNode.removeChild(e);}
function busy(){return!!($$('z4tP')||$$('z4eP'));}
function chip(t,ms){var b=$$('board');if(!b)return;css();var e=$$('z4tC');if(!e){e=document.createElement('div');e.id='z4tC';e.className='z4tch';b.appendChild(e);}
e.textContent=t;clearTimeout(chip.t);chip.t=setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},ms||3500);}
function btns(a){return'<div class="z4tb">'+a.map(function(x,i){return'<button type="button" class="z4tbt'+(i?'':' ok')+'" data-i="'+i+'">'+esc(x)+'</button>';}).join('')+'</div>';}
function ask(txt,a,cb){var e=panel('<p>'+esc(txt)+'</p>'+btns(a));if(!e)return;[].forEach.call(e.querySelectorAll('.z4tbt'),function(b){
b.onclick=function(){panelOff();try{SND.tap();}catch(x){}cb(+b.getAttribute('data-i'));};});}
var C=null;
function plain(i){return!!i&&!i.daily&&!i.mode&&i.idx===+S.lv;}
function found(g){return g.words.filter(function(w){return w.found;}).length;}
Z.onStart(function(i){panelOff();var g=i.G;C=null;if(!g)return;var z=zS();
C={g:g,lv:i.lv,idx:i.idx,a:0,lw:0,uo:0,ph:0,med:'',cell:null};
C.u=O.urok&&plain(i)&&i.lv>=20&&!g.tut;
if(O.cell&&plain(i)&&z.c[0]===i.lv&&z.c[1]){var p=rubOf(z.c[1]);if(p){C.cell=p;chip('📰 Последнее слово откроет рубрика «'+p.t+'»',4000);}}
if(O.pace&&plain(i)&&i.lv>=30&&!i.mix&&z.p>0&&z.p<=80&&i.lv%3===0&&g.letters&&g.letters.length){var L=g.letters.filter(function(c,k){return g.letters.indexOf(c)===k;});
C.med=L[(i.lv*7)%L.length];setTimeout(function(){if(C&&C.g===g){medMark();say(tx('z4t.pace.med','Медальная буква «{b}»: слова с ней — очки вдвойне.',{b:C.med.toUpperCase()}),'wow',5);}},1500);
ev({a:'pace',r:'med',lv:i.lv,p:z.p});}
micBtn();});
function day(){var z=zS(),d=tk();if(z.d!==d){z.d=d;z.n=0;}return z;}
Z.onWord(function(o){var c=C;if(!c||o.G!==c.g)return;var z=zS();
if(!o.bonus&&!o.byHint){var dt=c.a-c.lw;c.lw=c.a;if(O.pace&&dt>0&&dt<=300){z.p=z.p?Math.round(z.p*.8+dt*10*.2):dt*10;}
if(c.med&&o.w.indexOf(c.med)>=0&&!o.G.won){try{Z.score.add(o.w.length,'z4t.med');}catch(e){}chip('🏅 Медальная «'+c.med.toUpperCase()+'»: очки ×2',1800);}}
if(o.byHint)c.lw=c.a;
if(c.cell&&!c.co&&o.left===1&&!o.G.won)setTimeout(cellAsk,600);
if(c.u&&!c.uo)setTimeout(urokChk,400);});
Z.onWin(function(i){if(C&&C.cell&&i.lv===C.lv){var z=zS();if(z.c[0]===i.lv){z.c=[0,''];sv();}}panelOff();medOff();});
setInterval(function(){var c=C,g=gG();if(!c||!g||g!==c.g||g.won||!play())return;c.a++;
if(c.med&&c.a%2===0)medMark();
if(c.u&&!c.uo)urokChk();
if(O.pace&&!c.ph)paceChk();},1000);
var LONG={bb:1,sk:1,zg:1};
function rubOf(id){var K=window.Z3K;if(!K||!K.rubs)return null;var L=K.rubs();for(var k=0;k<L.length;k++)if(L[k].id===id)return L[k];return null;}
function pk(){var K=window.Z3K;if(!K||!K.mixDue||K.mixDue.__z4t)return;var md=K.mixDue,rb=K.rubs;
if(O.mix7&&rb&&!rb.__z4t){K.rubs=function(){var L=rb.apply(this,arguments),M=L.filter(function(x){return!LONG[x.id];});return M.length?M:L;};K.rubs.__z4t=1;}
var w=function(idx,daily){var r=md.apply(this,arguments);if(!r)return false;var l=idx+1;
if(O.mix7&&l%7!==0)return false;
if(O.cell&&Z.on){var p=ZB.safe('z4t.pick',function(){return K.pick(l);});if(p){var z=K.Z(),y=zS();z.m=Math.max(+z.m||0,l);y.c=[l,p.id];sv();ev({a:'mix',r:'cell',lv:l,id:p.id});return false;}}
return true;};
w.__z4t=1;K.mixDue=w;}
ZB.safe('z4t.mix',pk);ZB.on('z3late',function(){ZB.safe('z4t.mix',pk);});ZB.on('home',function(){ZB.safe('z4t.mix',pk);});
function cellAsk(){var c=C,g=gG();if(!c||!c.cell||c.co||!g||g!==c.g||g.won)return;if(modalOn()||busy()){setTimeout(cellAsk,2500);return;}c.co=1;var p=c.cell,K=window.Z3K;
ask(tx('z4t.cell.ask','Последнее слово — в «{r}». Решишь — откроется само.',{r:p.t}),['Решить ›','Сам найду'],function(k){
if(k){ev({a:'mix',r:'no',lv:c.lv,id:p.id});try{var r=K.Z().r,a=r[p.id]||(r[p.id]=[0,0,0]);a[0]++;a[2]++;sv();}catch(e){}say(tx('z4t.cell.no','Ничего, одно слово осталось.'),'norm',4);return;}
var r0=0;try{r0=(K.Z().r[p.id]||[0,0,0])[1];}catch(e){}
K.x().then(function(){K.mixGo(c.idx,p,function(){back(c,p,r0);});
setTimeout(function(){var s=document.querySelector('#zb-z3mix .z3m-t small');if(s)s.textContent='последнее слово уровня '+c.lv;},0);},
function(){ev({a:'mix',r:'fail',lv:c.lv,id:p.id});});});}
function back(c,p,r0){var g=gG(),ok=false;try{ok=(window.Z3K.Z().r[p.id]||[0,0,0])[1]>r0;}catch(e){}
try{show('game');}catch(e){}try{if(play())YG.start();}catch(e){}
ev({a:'mix',r:ok?'ok':'fail',lv:c.lv,id:p.id});if(!g||g!==c.g||g.won)return;
if(ok){var wd=g.words.filter(function(w){return!w.found;})[0];say(tx('z4t.cell.ok','Решено — слово твоё!'),'happy',4);if(wd)setTimeout(function(){if(gG()===g&&!g.won)foundWord(wd,true);},500);}
else say(tx('z4t.cell.no','Ничего, одно слово осталось.'),'norm',4);}
function urokSec(){return num(/[?&]z4tu=(\d+)/,isOK()?180:300);}
function urokChk(){var c=C,g=gG();if(!c||!c.u||c.uo||!g||g!==c.g||g.won||c.a<urokSec())return;
var n=g.words.length,f=found(g);if(f*4<n*3||f>=n||modalOn()||busy())return;c.uo=1;ev({a:'urok',r:'ask',lv:c.lv,n:n-f,s:c.a});
try{SND.tap();}catch(e){}
ask('🔔 '+tx('z4t.urok.ask','Дзинь! Урок окончен. Остальные слова — на дом.'),['Сдать урок','Доиграю'],function(k){
if(k){ev({a:'urok',r:'no',lv:c.lv,n:n-f,s:c.a});return;}urokGo(c,g);});}
function urokGo(c,g){if(gG()!==g||g.won)return;var L=g.words.filter(function(w){return!w.found;}),z=zS();if(!L.length)return;
z.h=[[c.lv,L.map(function(w){return w.w;}).join(' ').slice(0,80),String(g.lv&&g.lv.l||g.letters.join('')).slice(0,12)]].concat(z.h.filter(function(x){return x[0]!==c.lv;})).slice(0,3);
z.u++;g.hinted=true;c.ud=L.length;sv();ev({a:'urok',r:'ok',lv:c.lv,n:L.length,s:c.a});
say(tx('z4t.urok.ok','Тетрадку сдала. Остальные слова — в домашке, на Доме.'),'happy',5);
L.forEach(function(w){if(!w.found&&!g.won)foundWord(w,true);});}
Z.winLine.add({id:'z4t.urok',order:25,txt:function(i){var c=C;if(!c||!c.ud||i.lv!==c.lv)return'';var n=c.ud;
return tx('z4t.urok.win','Урок сдан. Домашка — {n} — ждёт на Доме.',{n:n+' '+plu(n,'слово','слова','слов')});}});
Z.card.add({id:'z4t.dz',order:50,show:function(){return!!O.urok&&zS().h.length>0;},
html:function(){var x=zS().h[0],n=x[1].split(' ').length;css();
return'<div class="z4t-card"><span class="z4t-ic" aria-hidden="true">📒</span><div class="z4t-ct"><b>Домашка от Зины</b><span>'+n+' '+plu(n,'слово','слова','слов')+
' из уровня '+x[0]+'. Сделаешь — монетки.</span></div><button type="button" class="btn ghost small z4t-go">Сделать</button></div>';},
mount:function(el){var b=el&&el.querySelector('.z4t-go');if(b)b.onclick=function(){dzOpen();};}});
function dzOpen(){var z=zS(),x=z.h[0];if(!x)return;css();var W=x[1].split(' '),got={},L=x[2].split(''),sel=[];ev({a:'dz',r:'open',lv:x[0],n:W.length});
try{SND.tap();}catch(e){}
function draw(){var m=$$('mcard');if(!m)return;
m.innerHTML='<div class="z4tdz"><h2>📒 Домашка</h2><p>Уровень '+x[0]+': найди слова из этих букв.</p><div class="z4tw">'+
W.map(function(w){return'<span class="'+(got[w]?'ok':'')+'">'+(got[w]?w.toUpperCase():w.charAt(0).toUpperCase()+new Array(w.length).join('·'))+'</span>';}).join('')+
'</div><div class="z4tin">'+esc(sel.map(function(k){return L[k];}).join('').toUpperCase())+'&nbsp;</div><div class="z4tl">'+
L.map(function(ch,k){return'<button type="button" data-k="'+k+'"'+(sel.indexOf(k)>=0?' disabled':'')+'>'+esc(ch.toUpperCase())+'</button>';}).join('')+
'</div><div class="z4tb"><button type="button" class="z4tbt ok noenter" data-a="ok">Проверить</button><button type="button" class="z4tbt noenter" data-a="del">⌫</button>'+
'<button type="button" class="z4tbt noenter" data-a="x">Потом</button></div></div>';
[].forEach.call(m.querySelectorAll('.z4tl button'),function(b){b.onclick=function(){sel.push(+b.getAttribute('data-k'));try{SND.tap();}catch(e){}draw();};});
m.querySelector('[data-a=del]').onclick=function(){sel.pop();draw();};
m.querySelector('[data-a=x]').onclick=function(){try{hideModal();}catch(e){}};
m.querySelector('[data-a=ok]').onclick=function(){var w=sel.map(function(k){return L[k];}).join('');sel=[];
if(W.indexOf(w)>=0&&!got[w]){got[w]=1;try{SND.word(w.length,0);}catch(e){}}else{try{SND.bad();}catch(e){}}
if(W.every(function(v){return got[v];}))return done();draw();};}
function done(){var c=0;try{c=window.ZBECO?ZBECO.give('z4t',2*W.length,'z4t'):0;}catch(e){}z.h=z.h.filter(function(y){return y!==x;});z.k++;sv();
ev({a:'dz',r:'ok',lv:x[0],n:W.length,c:c});
var m=$$('mcard');if(m)m.innerHTML='<div class="z4tdz"><h2>📒 Домашка сдана</h2><p>'+esc(tx('z4t.dz.done','Домашка сдана! Ставлю «пять».'))+'</p>'+
(c?'<p><b>+'+c+' '+plu(c,'монета','монеты','монет')+'</b></p>':'')+'<div class="z4tb"><button type="button" class="z4tbt ok" data-a="x">Спасибо</button></div></div>';
if(m)m.querySelector('[data-a=x]').onclick=function(){try{hideModal();}catch(e){}try{ZB.refresh();}catch(e){}};try{if(c)SND.coin();}catch(e){}}
try{modal('');}catch(e){return;}draw();}
function paceChk(){var c=C,g=gG(),z=zS();if(!c||c.ph||!g||g.tut||g.daily||g.mode)return;if(!(z.p>=250)||c.lv<10||c.a-c.lw<num(/[?&]z4tp=(\d+)/,40))return;
if(modalOn()||busy())return;day();if(z.n>=4)return;
var ws=g.words.filter(function(w){return!w.found;}).sort(function(a,b){return b.w.length-a.w.length;}),wd=null,cs;
for(var k=0;k<ws.length;k++){cs=wordCells(ws[k]);if(cs.length&&!cs[0].open){wd=ws[k];break;}}
c.ph=1;if(!wd)return;z.n++;sv();ev({a:'pace',r:'slow',lv:c.lv,p:z.p});
say(tx('z4t.pace.slow','Ой, проговорилась: там слово на «{b}», {n} букв.',{b:wd.w.charAt(0).toUpperCase(),n:wd.w.length}),'wow',6);
var el=cs[0].el;if(el&&!calm()){el.classList.add('flash');setTimeout(function(){el.classList.remove('flash');},900);setTimeout(function(){el.classList.add('flash');setTimeout(function(){el.classList.remove('flash');},900);},1100);}}
function medMark(){var c=C,wh=$$('wheel');if(!wh||!c||!c.med)return;css();var on=0;[].forEach.call(wh.querySelectorAll('.let'),function(e){var m=!on&&e.textContent===c.med;if(m)on=1;e.classList.toggle('z4t-med',m);});}
function medOff(){var wh=$$('wheel');if(wh)[].forEach.call(wh.querySelectorAll('.let.z4t-med'),function(e){e.classList.remove('z4t-med');});}
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function micCan(){return!!O.mic&&!!SR&&Z.open('z4t.mic')&&!(typeof VK_IOS!=='undefined'&&VK_IOS);}
function micOn(){try{return localStorage.getItem('z4t-mic')==='1';}catch(e){return false;}}
function micSet(v){try{localStorage.setItem('z4t-mic',v?'1':'0');}catch(e){}}
function micBtn(){var s=document.querySelector('#wheelWrap .side.l'),b=$$('z4tMic');
if(!micCan()||!micOn()){if(b&&b.parentNode)b.parentNode.removeChild(b);return;}if(!s||b)return;css();
b=document.createElement('button');b.type='button';b.id='z4tMic';b.className='hb z4t-mic';b.title='Сказать слово вслух';b.setAttribute('aria-label','Сказать слово вслух');
b.innerHTML='🎤<span class="lbl">Сказать</span>';b.onclick=listen;s.appendChild(b);}
var REC=null;
function listen(){var g=gG(),b=$$('z4tMic');if(!g||g.won||!SR)return;try{poke();}catch(e){}
if(REC){try{REC.abort();}catch(e){}REC=null;if(b)b.classList.remove('on');return;}
var r;try{r=new SR();}catch(e){ev({a:'mic',r:'err',e:'new'});return;}REC=r;r.lang='ru-RU';r.interimResults=false;r.maxAlternatives=5;r.continuous=false;
r.onresult=function(e){var A=[];try{var x=e.results[0];for(var k=0;k<x.length;k++)A.push(x[k].transcript);}catch(er){}heard(A);};
r.onerror=function(e){var c=e&&e.error||'?';ev({a:'mic',r:'err',e:String(c).slice(0,20)});
if(c==='not-allowed'||c==='service-not-allowed'){micSet(0);micBtn();try{toast('Микрофон не разрешён — кнопку 🎤 убрала. Включить снова — в ⚙.',4500);}catch(x){}}
else if(c==='no-speech')say(tx('z4t.mic.bad','Говорите чётче, вы не на рынке.'),'stern',3);};
r.onend=function(){if(REC===r)REC=null;var bb=$$('z4tMic');if(bb)bb.classList.remove('on');};
try{r.start();if(b)b.classList.add('on');}catch(e){REC=null;ev({a:'mic',r:'err',e:'start'});}}
function fits(w,L){var h={};L.forEach(function(c){h[c]=(h[c]||0)+1;});for(var k=0;k<w.length;k++){if(!h[w[k]])return false;h[w[k]]--;}return true;}
function heard(A){var g=gG();if(!g||g.won)return;var L=g.letters.slice(),T=[];
A.forEach(function(s){String(s).toLowerCase().replace(/ё/g,'е').split(/[^а-я]+/).forEach(function(w){if(w.length>=2&&T.indexOf(w)<0)T.push(w);});});
var open=g.words.filter(function(w){return!w.found;}).map(function(w){return w.w;}),F=T.filter(function(w){return fits(w,L);});
var best=F.filter(function(w){return open.indexOf(w)>=0;})[0]||F.sort(function(a,b){return b.length-a.length;})[0];
if(!best){ev({a:'mic',r:'none'});say(tx('z4t.mic.bad','Говорите чётче, вы не на рынке.'),'stern',3.5);return;}
ev({a:'mic',r:open.indexOf(best)>=0?'ok':'miss'});try{submit(best);}catch(e){}}
function setRow(){if(!micCan())return;var rs=$$('setRows');if(!rs||$$('sZ4mic'))return;var b=document.createElement('button');b.type='button';b.id='sZ4mic';
var draw=function(){var on=micOn();b.className='setrow'+(on?'':' off');b.innerHTML='<span>🎤 Говорить слова вслух<br><small>голос распознаёт браузер</small></span><b>'+(on?'● вкл':'○ выкл')+'</b>';};draw();
b.onclick=function(){var on=!micOn();micSet(on);try{SND.tap();}catch(e){}ev({a:'mic',r:on?'on':'off'});draw();micBtn();
if(on)try{toast('Кнопка 🎤 — в уровне, слева от круга. Голос уходит в распознавание браузера.',4500);}catch(e){}};
var a=$$('sZq')||rs;a.parentNode.insertBefore(b,a.nextSibling);}
function wrapSet(){var os=window.openSettings;if(typeof os!=='function'||os.__z4t)return;var o=function(){var r=os.apply(this,arguments);ZB.safe('z4t.set',setRow);return r;};o.__z4t=1;window.openSettings=o;}
if(O.mic&&SR){ZB.safe('z4t.set',wrapSet);ZB.on('screen',function(id){if(id==='game')ZB.safe('z4t.mic',micBtn);});}
T.st=function(){var c=C;return{z:zS(),c:c&&{lv:c.lv,a:c.a,lw:c.lw,u:!!c.u,uo:c.uo,ph:c.ph,med:c.med,cell:c.cell&&c.cell.id,co:c.co||0,ud:c.ud||0},
p:!!$$('z4tP'),mic:!!$$('z4tMic'),can:micCan(),mix:!!(window.Z3K&&Z3K.mixDue&&Z3K.mixDue.__z4t)};};
T.dz=dzOpen;T.pk=pk;T.heard=heard;
})();
