'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.SOBYT||Z.SOBYT.s)return;var SB=Z.SOBYT;SB.s=1;var O=SB.on,ZB=window.ZB;
var CAP=4,CD={drill:15,kettle:6,galya:3,draft:10,fork:10,lift:0};
try{if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4e==null)ZBECO.cap.z4e=CAP;}catch(e){}
try{if(!window.Z4T||!Z4T['z4e.drill.go'])ZB.load('js/zb4-sobyt-data.js').catch(function(){});}catch(e){}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function $$(id){return document.getElementById(id);}
function zS(){var z=typeof S!=='undefined'&&S?S.z4e:null;if(!z)return{l:{},ld:0,f:{lv:0,id:''},n:0};if(!z.l)z.l={};if(!z.f)z.f={lv:0,id:''};return z;}
function tk(){try{return+todayKey();}catch(e){return 0;}}
function gG(){return typeof G!=='undefined'&&G?G:null;}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function snd(k){try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}}
function T(k,d,c){var t=Z.txt(k,c);return t||d||'';}
function sayZ(t,m){try{if(t&&typeof zina==='function')zina(t,m||'happy');}catch(e){}}
function ev(o){Z.ev('z4e',o);}
function coins(n){try{return window.ZBECO?ZBECO.give('z4e',n,'z4e'):0;}catch(e){return 0;}}
function pts(o){var n=o.w.length;return o.bonus?Math.ceil(n/2):n;}
function modalOn(){var m=$$('modal');return!!(m&&m.classList.contains('on'));}
function cd(id,lv){var l=zS().l[id]||0;return!l||lv-l>=CD[id]||lv<l;}
var A=null;SB.st=function(){return{a:A&&{id:A.id,left:A.left,n:A.n,p:A.p,r:A.r||''},z:zS(),res:res};};SB.A=function(){return A;};
function badge(ico,txt){var b=$$('board');if(!b)return null;css();var e=$$('z4eBg');if(!e){e=document.createElement('div');e.id='z4eBg';e.className='z4ebg';b.appendChild(e);}
e.innerHTML='<span class="z4ei">'+ico+'</span><span class="z4et">'+txt+'</span>';e.style.display='';return e;}
function badgeOff(){var e=$$('z4eBg');if(e&&e.parentNode)e.parentNode.removeChild(e);}
function panel(h){var b=$$('board');if(!b)return null;css();var e=$$('z4eP');if(!e){e=document.createElement('div');e.id='z4eP';e.className='z4ep';b.appendChild(e);}
e.innerHTML=h;return e;}
function panelOff(){var e=$$('z4eP');if(e&&e.parentNode)e.parentNode.removeChild(e);}
function chip(t){var b=$$('board');if(!b)return;css();var e=document.createElement('div');e.className='z4ech'+(calm()?' still':'');e.innerHTML=t;b.appendChild(e);
setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},1700);}
function mm(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
function start(o){stop('new');A=o;A.n=0;A.p=0;A.fresh=1;setTimeout(function(){if(A===o)o.fresh=0;},0);A.left=o.sec||0;A.t=Date.now();
if(o.sec)A.iv=setInterval(function(){ZB.safe('z4e-tick',function(){var g=gG(),now=Date.now(),dt=(now-A.t)/1000;A.t=now;
if(!A||g!==A.g||g.won){stop('gone');return;}if(document.hidden||modalOn())return;A.left-=dt;if(A.tick)A.tick(A.left);if(A&&A.left<=0)stop('time');});},250);
ev({a:'go',id:o.id,lv:o.lv});var z=zS();z.l[o.id.replace('z4e.','')]=o.lv;z.n=(+z.n||0)+1;sv();}
function stop(why){var a=A;if(!a)return;A=null;if(a.iv)clearInterval(a.iv);
ZB.safe('z4e-end',function(){if(a.end)a.end(why,a);});
ev({a:'end',id:a.id,lv:a.lv,r:a.r||why,n:a.n,p:a.p});if(a.done)ZB.safe('z4e-done',a.done);}
function x2(o,lbl){var p=pts(o);if(o.byHint)return;try{Z.score.add(p,'z4e');}catch(e){}A.n++;A.p+=p;chip(lbl+' +'+p+' ✦');}
Z.onWord(function(o){if(A&&o.G===A.g&&A.word&&!A.fresh)ZB.safe('z4e-word',function(){A.word(o);});});
Z.onStart(function(i){if(A)stop('gone');res=null;resG=null;var z=zS();
if(z.f&&z.f.lv&&z.f.lv<i.lv){z.f={lv:0,id:''};}
if(z.f&&z.f.lv===i.lv&&z.f.id==='-'&&Z.lvlEvent.fit(i))ZB.safe('z4e-calm',function(){setTimeout(function(){if(gG()===i.G)sayZ(T('z4e.calm.go','Спокойный уровень. Без сверла, без звонков.'),'happy');},1200);});});
Z.onWin(function(i){if(A&&A.g===i.G)stop('win');var z=zS();if(z.f&&z.f.lv&&z.f.lv<=i.lv){z.f={lv:0,id:''};}});
var res=null,resG=null;function result(g,t){resG=g;res=t;}
Z.winLine.add({id:'z4e',order:40,txt:function(i){return res&&i.G===resG?res:'';}});
function reshuf(g){if(g.won||(typeof dragging!=='undefined'&&dragging)||g.sel&&g.sel.length)return;var old=g.letters.join('');
for(var k=0;k<8;k++){shuffle(g.letters);if(g.letters.join('')!==old)break;}var wh=$$('wheel');if(!wh)return;
wh.querySelectorAll('.let').forEach(function(e,i){e.textContent=g.letters[i];});try{saveCur();}catch(e){}}
Z.lvlEvent.add({id:'z4e.drill',who:'SOBYT',w:1,ok:function(i){return O.drill&&cd('drill',i.lv);},run:function(g,done,info){
var still=info.calm||calm(),wh=$$('wheel'),k=0;sayZ(T('z4e.drill.go','Сосед сверлит! Слова сейчас ×2 — за терпение.'),'stern');snd('bad');
if(wh&&!still)wh.classList.add('z4e-shake');
start({id:'z4e.drill',lv:info.lv,g:g,sec:30,done:done,
tick:function(l){badge('🔨','×2 · '+mm(l));if(!still&&++k%20===0)reshuf(g);},
word:function(o){x2(o,'За терпение ×2');},
end:function(why,a){var w=$$('wheel');if(w)w.classList.remove('z4e-shake');badgeOff();
if(why!=='gone'){if(why==='time')sayZ(T('z4e.drill.end','Затихло. Сверлил Семён — вешал мне полку.'),'happy');
if(a.n)result(g,'Сверлили, а ты нашла '+a.n+' сл. ×2: +'+a.p+' ✦');}}});}});
Z.lvlEvent.add({id:'z4e.kettle',who:'SOBYT',w:1.2,ok:function(i){return O.kettle&&cd('kettle',i.lv);},run:function(g,done,info){
sayZ(T('z4e.kettle.go','Чайник засвистел! Найди слово, пока не выкипел.'),'wow');snd('tap');
start({id:'z4e.kettle',lv:info.lv,g:g,sec:info.ok?30:20,done:done,
tick:function(l){badge('☕','Слово за '+Math.ceil(Math.max(0,l))+' с — чай!');},
word:function(o){if(o.byHint)return;A.r='ok';A.n=1;A.p=10;try{Z.score.add(10,'z4e');}catch(e){}var c=coins(1);snd('coin');
chip('Чай с пирожком! +10 ✦'+(c?' +'+c+' монета':''));sayZ(T('z4e.kettle.ok','Успела! Чай с пирожком.'),'happy');result(g,'Успела к чаю: пирожок и +10 ✦');stop('ok');},
end:function(why){badgeOff();if(why==='time')sayZ(T('z4e.kettle.miss','Выкипел. Ничего, долью — штрафов не держим.'),'norm');}});}});
var GL=null;function gData(){if(window.ZMG_SPLET)return Promise.resolve(ZMG_SPLET);return ZB.load('js/zmg-splet-data.js').then(function(){return window.ZMG_SPLET;});}
function gPick(D){var I=(D&&D.items||[]).filter(function(x){return x[3]&&x[3].length===5;}),seen=[];try{seen=(localStorage.getItem('z4e-g')||'').split(',');}catch(e){}
if(!I.length)return null;var U=I.filter(function(x){return seen.indexOf(x[0])<0;});if(!U.length){U=I;seen=[];}var it=U[Math.random()*U.length|0];
seen.push(it[0]);try{localStorage.setItem('z4e-g',seen.slice(-8).join(','));}catch(e){}return it;}
function bust(id){try{return window.ZBP&&ZBP.bust?ZBP.bust(id,'norm'):'';}catch(e){return'';}}
Z.lvlEvent.add({id:'z4e.galya',who:'SOBYT',w:1,ok:function(i){return O.galya&&(want(i)==='z4e.galya'||cd('galya',i.lv));},run:function(g,done,info){
var sec=info.ok?25:15,st=0,it=null,pick=[],L=[];snd('tap');
function ring(){var e=panel('<div class="z4epw"><div class="z4eav">'+bust('galya')+'</div><div class="z4ebx"><b>📞 Звонит Галя!</b>'+
'<div class="z4ebt"><button type="button" class="z4eb ok" id="z4eTake">Взять трубку</button><button type="button" class="z4eb" id="z4eNo">Не брать</button></div></div></div>');
if(!e)return stop('gone');if(!info.calm&&!calm())e.classList.add('ring');
$$('z4eTake').onclick=function(){snd('tap');take();};$$('z4eNo').onclick=function(){A.r='no';sayZ(T('z4e.galya.no','Не взяли — Галя сама перезвонит.'),'norm');stop('no');};}
function take(){st=1;gData().then(function(D){if(!A||A.g!==g)return;it=gPick(D);if(!it){A.r='nodata';return stop('nodata');}
L=it[3].toLowerCase().split('');A.ans=it[3].toLowerCase();var mix=L.slice();for(var k=0;k<9;k++){shuffle(mix);if(mix.join('')!==L.join(''))break;}L=mix;A.left=sec;A.t=Date.now();st=2;draw();},
function(){if(A&&A.g===g){A.r='nodata';stop('nodata');}});}
function draw(){var w=it[3].toLowerCase(),q=esc(it[2]).replace('___','<b class="z4egap">'+pick.map(function(i){return esc(L[i].toUpperCase());}).join('')+'<i>'+new Array(6-pick.length).join('·')+'</i></b>');
var h='<div class="z4epw"><div class="z4eav">'+bust('galya')+'</div><div class="z4ebx"><b>Галя: «Записывай быстро!»</b><p class="z4eq">'+q+'</p><div class="z4elt">';
L.forEach(function(c,i){h+='<button type="button" class="z4el" data-i="'+i+'"'+(pick.indexOf(i)>=0?' disabled':'')+'>'+esc(c.toUpperCase())+'</button>';});
h+='<button type="button" class="z4el x" id="z4eClr" aria-label="Стереть">✕</button></div><div class="z4etm"><i id="z4eTm"></i></div></div></div>';var e=panel(h);if(!e)return;
e.querySelectorAll('.z4el[data-i]').forEach(function(b){b.onclick=function(){if(st!==2)return;var i=+b.getAttribute('data-i');if(pick.indexOf(i)>=0)return;pick.push(i);snd('tap');
if(pick.length===5){var s=pick.map(function(j){return L[j];}).join('');if(s===w)return win();pick=[];chip('Не то! Галя повторяет…');}draw();};});
$$('z4eClr').onclick=function(){pick=[];draw();};tm();}
function tm(){var b=$$('z4eTm');if(b)b.style.width=Math.max(0,Math.min(100,A.left/sec*100))+'%';}
function win(){st=3;A.r='ok';A.n=1;A.p=20;try{Z.score.add(20,'z4e');}catch(e){}var c=coins(2);snd('coin');
panel('<div class="z4epw"><div class="z4eav">'+bust('galya')+'</div><div class="z4ebx"><b>Успела! +20 ✦'+(c?' +'+c+' монеты':'')+'</b><p class="z4eq">'+esc(it[2].replace('___',it[3].toLowerCase()))+'</p></div></div>');
sayZ(it[4]||'Записала. Завтра весь двор будет знать — от меня.','happy');result(g,'Галя: «'+it[5]+'» — записала, +20 ✦');setTimeout(function(){if(A&&A.id==='z4e.galya')stop('ok');},3500);}
start({id:'z4e.galya',lv:info.lv,g:g,sec:12,done:done,
tick:function(l){if(st===0&&l<=0){A.r='skip';}else if(st===1){A.left=Math.max(A.left,1);}else if(st===2){tm();if(l<=0){A.r='fail';sayZ(T('z4e.galya.fail','«Ну и ладно, — говорит Галя, — я Тамаре позвоню».'),'norm');}}else if(st===3)A.left=Math.max(A.left,1);},
end:function(){panelOff();}});ring();}});
var LW=['semyon','galya','tamara','valerka'];
function liftBuilt(){try{var H=window.Z3ART&&Z3ART.yardHas;return!!(H&&H[3])||!!(window.Z3&&Z3.open&&Z3.open('build'));}catch(e){return false;}}
function freeCell(g,odd){var cl=[];g.cells.forEach(function(c){if(!c.open&&!c.lock)cl.push(c);});if(cl.length<2)return null;if(odd)return cl[Math.random()*cl.length|0];
var ws=g.words.filter(function(w){return!w.found;}).sort(function(a,b){return a.w.length-b.w.length;});
for(var k=0;k<ws.length;k++){var c=wordCells(ws[k]).filter(function(c){return!c.open&&!c.lock;});if(c.length>1)return c[0];}return cl[0];}
Z.lvlEvent.add({id:'z4e.lift',who:'SOBYT',w:0.7,ok:function(){return O.lift&&zS().ld!==tk()&&liftBuilt();},run:function(g,done,info){
var who=LW[Math.random()*LW.length|0],nm={semyon:'Семён',galya:'Галя',tamara:'Тамара',valerka:'Валерка'}[who],at=180,hint=0,said=0;
zS().ld=tk();sayZ(T('z4e.lift.'+who+'.go','Лифт встал между этажами. Со мной — '+nm+'.'),'wow');
start({id:'z4e.lift',lv:info.lv,g:g,sec:at,done:done,
tick:function(l){badge('<span class="z4eb0">'+bust(who)+'</span>','Лифт · '+esc(nm)+' · '+mm(l));
if(!hint&&l<=at-25){hint=1;var c=freeCell(g,who==='semyon');if(c&&!g.won){try{openCell(c,0,'hint');snd('open');sayZ(T('z4e.lift.'+who+'.hint',nm+' подсказал букву.'),'happy');
A.n=1;checkAutoFoundAndWin();saveCur();}catch(e){}}}
if(!said&&l<=at-100){said=1;sayZ(T('z4e.lift.'+who+'.say',''),'norm');}},
end:function(why,a){badgeOff();if(why==='time')sayZ(T('z4e.lift.end','Лифт поехал! Изолента держит.'),'happy');if(why!=='gone')result(g,'Застряли в лифте с соседом: '+nm+(a.n?' подсказал букву':' составил компанию'));}});}});
var DW=null;function dwords(){if(DW)return DW;if(typeof DICT_MAIN!=='string')return null;DW=(DICT_MAIN+' '+(typeof DICT_EXTRA==='string'?DICT_EXTRA:'')).split(' ');return DW;}
function cnt(s){var m={};for(var i=0;i<s.length;i++)m[s[i]]=(m[s[i]]||0)+1;return m;}
function fits(w,m){var u={};for(var i=0;i<w.length;i++){var c=w[i];u[c]=(u[c]||0)+1;if(!m[c]||u[c]>m[c])return false;}return true;}
function draftPlan(g){var D=dwords();if(!D||typeof isWord!=='function')return null;var L=g.letters.slice(),n=L.length,C='аеиоуклмнпрстдвб'.split('').filter(function(c){return L.indexOf(c)<0;});
if(C.length<2||n<4)return null;var al={};L.concat(C).forEach(function(c){al[c]=1;});var cw={};g.words.forEach(function(x){cw[x.w]=1;});
var P=D.filter(function(w){if(w.length<3||w.length>n||cw[w])return false;for(var i=0;i<w.length;i++)if(!al[w[i]])return false;return true;});
var best=null;for(var t=0;t<24;t++){var i=Math.random()*n|0,j=(i+1+(Math.random()*(n-1)|0))%n,a=C[Math.random()*C.length|0],b=C[Math.random()*C.length|0];if(a===b||i===j)continue;
var M=L.slice();M[i]=a;M[j]=b;var m=cnt(M.join('')),W=P.filter(function(w){return(w.indexOf(a)>=0||w.indexOf(b)>=0)&&fits(w,m)&&isWord(w);});
if(W.length>=2&&(!best||W.length>best.W.length))best={i:i,j:j,a:a,b:b,oa:L[i],ob:L[j],W:W};if(best&&best.W.length>=4)break;}return best;}
function marks(pl){var wh=$$('wheel');if(!wh)return;wh.querySelectorAll('.let').forEach(function(e){var c=(e.textContent||'').toLowerCase();e.classList.toggle('z4e-new',!!pl&&(c===pl.a||c===pl.b));});}
function back(g,pl){var M=g.letters,k=M.indexOf(pl.a);if(k>=0)M[k]=pl.oa;k=M.indexOf(pl.b);if(k>=0)M[k]=pl.ob;}
SB.plan=function(){return draftPlan(gG());};
var DR=null;
function wrapSave(){var f=window.saveCur;if(typeof f!=='function'||f.__z4e)return;var w=function(){var d=DR,g=gG();if(!d||d.g!==g)return f.apply(this,arguments);
var keep=g.letters.slice();back(g,d.pl);try{return f.apply(this,arguments);}finally{g.letters=keep;}};w.__z4e=1;window.saveCur=w;}
Z.lvlEvent.add({id:'z4e.draft',who:'SOBYT',w:0.8,ok:function(i){var g=gG();return O.draft&&cd('draft',i.lv)&&!!g&&g.letters.length>=5;},run:function(g,done,info){
var pl=null;try{pl=draftPlan(g);}catch(e){}if(!pl){done();return;}wrapSave();
g.letters[pl.i]=pl.a;g.letters[pl.j]=pl.b;DR={g:g,pl:pl};SB.pl=pl;var wh=$$('wheel');if(wh)wh.querySelectorAll('.let').forEach(function(e,i){e.textContent=g.letters[i];});marks(pl);
sayZ(T('z4e.draft.go','Форточка хлопнула! Две буквы сменило — новые слова ×2.'),'wow');snd('shuffle');
start({id:'z4e.draft',lv:info.lv,g:g,sec:info.ok?45:30,done:done,
tick:function(l){badge('🌬','Сквозняк ×2 · '+mm(l));marks(pl);},
word:function(o){if(o.w.indexOf(pl.a)>=0||o.w.indexOf(pl.b)>=0)x2(o,'Сквозняк ×2');},
end:function(why,a){DR=null;badgeOff();if(!g.won&&gG()===g){back(g,pl);var w=$$('wheel');if(w)w.querySelectorAll('.let').forEach(function(e,i){e.textContent=g.letters[i];});
try{G.sel=[];updSel();drawLine();}catch(e){}try{saveCur();}catch(e){}}marks(null);
if(why==='time')sayZ(T('z4e.draft.end','Закрыла форточку, буквы вернулись.'),'norm');if(a.n)result(g,'Сквозняк принёс '+a.n+' сл. ×2: +'+a.p+' ✦');}});}});
function want(i){var f=zS().f;if(!O.fork||!f||f.lv!==i.lv||!f.id)return'';return f.id==='-'?'-':'z4e.'+f.id;}
(Z.lvlEvent.wants=Z.lvlEvent.wants||[]).push(function(i){return want(i);});
var DOORS=[['dark','🌑','Тёмный ×2'],['galya','📞','С Галей'],['-','🍵','Спокойный']];
Z.lvlEvent.add({id:'z4e.fork',who:'SOBYT',w:0.8,ok:function(i){var r=i.lv%10;return O.fork&&r>=1&&r<=8&&cd('fork',i.lv)&&zS().f.lv<i.lv+1;},run:function(g,done,info){
var h='<div class="z4epw"><div class="z4ebx"><b>Три двери в следующий уровень. Какую открываем?</b><div class="z4ebt">';
DOORS.forEach(function(d){if(d[0]==='galya'&&!O.galya)return;h+='<button type="button" class="z4eb door" data-d="'+d[0]+'"><span>'+d[1]+'</span>'+d[2]+'</button>';});
h+='</div><button type="button" class="z4eb ln" id="z4eLater">Потом</button></div></div>';
start({id:'z4e.fork',lv:info.lv,g:g,sec:20,done:done,end:function(){panelOff();}});A.r='skip';
var e=panel(h);if(!e)return stop('gone');
e.querySelectorAll('.door').forEach(function(b){b.onclick=function(){var d=b.getAttribute('data-d');zS().f={lv:info.lv+1,id:d};sv();A.r=d;snd('tap');
ev({a:'pick',c:d,lv:info.lv});sayZ(T('z4e.fork.pick','Договорились. Следующий уровень — как скажешь.'),'happy');result(g,'Следующая дверь: '+(d==='dark'?'тёмный уровень ×2':d==='galya'?'Галя на телефоне':'спокойный уровень'));stop('pick');};});
$$('z4eLater').onclick=function(){stop('skip');};}});
Z.lvlEvent.add({id:'z4e.dark',who:'SOBYT',w:1,ok:function(i){return want(i)==='z4e.dark';},run:function(g,done,info){
var b=$$('board');if(b)b.classList.add('z4e-dark');sayZ(T('z4e.dark.go','Свет отключили! Слова в темноте — ×2.'),'wow');
start({id:'z4e.dark',lv:info.lv,g:g,sec:0,done:done,word:function(o){x2(o,'В темноте ×2');badge('🕯','Темно · ×2 · +'+A.p+' ✦');},
end:function(why,a){var b=$$('board');if(b)b.classList.remove('z4e-dark');badgeOff();if(why!=='gone')result(g,'В темноте нашла '+a.n+' сл. ×2: +'+a.p+' ✦');}});
badge('🕯','Темно · все слова ×2');}});
var cssOk=0;function css(){if(cssOk)return;cssOk=1;var s=document.createElement('style');s.id='z4e-css';s.textContent=
'#board .z4ebg{position:absolute;right:6px;top:4px;z-index:6;display:flex;align-items:center;gap:6px;max-width:70%;padding:4px 10px;border-radius:999px;background:var(--z3-card,#fff);'+
'box-shadow:var(--z3-shadow,0 2px 6px rgba(0,0,0,.2));font:700 14px/1.2 var(--z3-font);color:var(--z3-ink,#222);pointer-events:none;white-space:nowrap}'+
'#board .z4ebg .z4et{overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}#board .z4ebg .z4ei{font-size:18px;line-height:1}'+
'#board .z4eb0{display:inline-block;width:30px;height:30px;overflow:hidden;border-radius:50%;vertical-align:middle}#board .z4eb0 svg,#board .z4eav svg{width:100%;height:100%}'+
'#board .z4ep{position:absolute;left:8px;right:8px;top:8px;z-index:7;padding:10px;border-radius:16px;background:var(--z3-paper,#fffaf0);box-shadow:var(--z3-shadow,0 3px 12px rgba(0,0,0,.25));'+
'font:15px/1.35 var(--z3-font);color:var(--z3-ink,#222)}#board .z4ep.ring{animation:z4ering .5s ease-in-out 3}'+
'#board .z4epw{display:flex;gap:10px;align-items:flex-start}#board .z4eav{flex:0 0 56px;width:56px;height:56px;border-radius:50%;overflow:hidden;background:var(--z3-card,#fff)}'+
'#board .z4ebx{flex:1 1 auto;min-width:0}#board .z4ebx b{display:block;font-size:16px;margin-bottom:6px}#board .z4eq{margin:0 0 8px;font-size:14px}'+
'#board .z4ebx b.z4egap{display:inline;margin:0;font-size:16px;letter-spacing:2px;color:var(--z3-acc,#c2410c)}#board .z4egap i{font-style:normal;color:var(--z3-ink2,#555)}'+
'#board .z4ebt{display:flex;flex-wrap:wrap;gap:8px}#board .z4eb{min-height:44px;padding:0 14px;border:0;border-radius:12px;font:700 15px var(--z3-font);cursor:pointer;'+
'background:var(--z3-card,#fff);color:var(--z3-ink,#222);box-shadow:0 2px 0 var(--z3-line,#ccc)}#board .z4eb.ok{color:var(--z3-acc-ink,#fff);background:var(--z3-acc-grad,#237a3b);box-shadow:0 2px 0 var(--z3-acc-edge,#185c2a)}'+
'#board .z4eb.door{flex:1 1 0;min-width:84px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 8px;font-size:14px}#board .z4eb.door span{font-size:22px}'+
'#board .z4eb.ln{margin-top:8px;background:none;box-shadow:none;color:var(--z3-ink2,#555);text-decoration:underline}'+
'#board .z4elt{display:flex;flex-wrap:wrap;gap:6px}#board .z4el{width:46px;height:46px;border:0;border-radius:12px;font:800 20px var(--z3-font);color:var(--z3-ink,#222);background:#fff3d0;box-shadow:0 2px 0 var(--z3-gold,#d4a017);cursor:pointer}'+
'#board .z4el[disabled]{opacity:.35}#board .z4el.x{background:var(--z3-card,#fff);box-shadow:0 2px 0 var(--z3-line,#ccc);font-size:16px}'+
'#board .z4etm{height:6px;margin-top:8px;border-radius:3px;background:var(--z3-line,#ddd);overflow:hidden}#board .z4etm i{display:block;height:100%;background:var(--z3-acc,#c2410c)}'+
'#board .z4ech{position:absolute;left:50%;top:22%;transform:translate(-50%,-50%);z-index:6;pointer-events:none;padding:6px 14px;border-radius:999px;font:700 16px var(--z3-font);'+
'white-space:nowrap;background:#fff6d6;color:#7a4a12;box-shadow:var(--z3-shadow,0 2px 6px rgba(0,0,0,.2));animation:z4ech 1.6s ease-out forwards}#board .z4ech.still{animation:none}'+
'#wheel.z4e-shake .let{animation:z4eshk .18s linear infinite}#wheel .let.z4e-new{box-shadow:0 0 0 3px #4a90c8;background:#e6f2ff}'+
'#board.z4e-dark #grid{filter:brightness(.5)}#board.z4e-dark{background:radial-gradient(circle at 50% 40%,rgba(255,214,120,.25),rgba(20,20,40,.35) 70%)}'+
'@keyframes z4eshk{0%{transform:translate(0,0)}25%{transform:translate(1px,-1px)}50%{transform:translate(-1px,1px)}75%{transform:translate(1px,1px)}100%{transform:translate(0,0)}}'+
'@keyframes z4ering{0%,100%{transform:rotate(0)}25%{transform:rotate(-1.5deg)}75%{transform:rotate(1.5deg)}}'+
'@keyframes z4ech{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%)}}'+
'@media (prefers-reduced-motion:reduce){#wheel.z4e-shake .let,#board .z4ep.ring{animation:none}}';
document.head.appendChild(s);}
})();
