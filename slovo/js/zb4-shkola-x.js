'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.SHK||window.Z4SX)return;
var X=Z.SHK,esc=X.esc,D=document;
var SX=window.Z4SX={};
if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4x==null)ZBECO.cap.z4x=40;
function $$(id){return D.getElementById(id);}
function give(n,why){var k=0;try{k=window.ZBECO&&ZBECO.give?ZBECO.give('z4x',n,'quest'):0;}catch(e){}if(k)try{updCoins();}catch(e){}X.ev('rw',{c:k,w:why});return k;}
function snd(k){try{SND[k]();}catch(e){}}
function face(m){try{return zinaSVG(m||'happy');}catch(e){return'';}}
function T(k,c,d){return Z.txt(k,c)||d||'';}
function rng(seed){var s=(seed>>>0)||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function shuf(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function home(){try{if(typeof maybeInterstitial==='function')maybeInterstitial(openMenu);else openMenu();}catch(e){try{openMenu();}catch(x){}}}
function CALMx(){try{return typeof CALM==='function'&&CALM();}catch(e){return false;}}
var P=null,wrapped=0;
function wrap(){if(wrapped)return;wrapped=1;
var oLD=levelData;levelData=function(){if(P&&P.arm)return P.lv;return oLD.apply(this,arguments);};
var oLK=levelKey;levelKey=function(){if(P&&P.arm)return'X'+P.k+P.i;return oLK.apply(this,arguments);};
var oRb=ribbon;ribbon=function(){oRb.apply(this,arguments);var f=P&&P.arm?P:typeof G!=='undefined'&&G&&G.z4x;if(!f)return;
var r=$$('gRib'),gs=$$('gSub'),gt=$$('gTitle'),c=f.k==='yat'?'#efe4cf':'#e3ecd9';if(!r||!gs)return;
r.style.setProperty('--rc',c);r.style.setProperty('--rb',typeof shade==='function'?shade(c,.28):c);
gs.dataset.full=f.k==='yat'?'🐈 Как писали до 1918 года':'📒 Тетрадь 1975 года, стр. '+(f.i+1);gs.dataset.short=f.k==='yat'?'🐈 ять':'📒 '+(f.i+1);gs.title='';
if(gt)gt.textContent=f.k==='yat'?'Уровень с ятем':'Антресоль';if(typeof fitSub==='function')fitSub();};
ZB.startHook.unshift(function(info){if(P&&P.arm){info.mode='z4x';}});
var oWI=wordInfo;wordInfo=function(w){var t=oWI.apply(this,arguments),g=typeof G!=='undefined'?G:null,d=window.Z4XD;if(!g||!g.z4x||!d)return t;
if(g.z4x.k==='ant'&&w===g.lv.d){var tt=d.tet[g.z4x.i];if(tt)return w.charAt(0).toUpperCase()+w.slice(1)+' — '+tt[1]+'.';}
if(g.z4x.k==='yat'&&d.yat[w])return(t?t+' ':'')+'До 1918 года: «'+d.yat[w][0]+'».';return t;};
var oFin=finishLevel;finishLevel=function(g){if(!g||!g.z4x)return oFin.apply(this,arguments);return fin(g);};
var oWin=winModal;winModal=function(g,r,again){if(!g||!g.z4x)return oWin.apply(this,arguments);return win(g,r,again);};
ZB.on('screen',function(sc){if(sc!=='game')D.body.classList.remove('z4xlv');});}
function play(k,i){X.lvs().then(function(){var L=window.Z4XL&&Z4XL[k],lv=L&&L[i];if(!lv){toast('Уровень не нашёлся',2500);return;}wrap();
var go=function(){P={k:k,i:i,lv:lv,arm:true};var oL=STAT.lvl;STAT.lvl=function(){return oL.call(STAT,i+1,'z4x',{e:k});};
try{startLevel(Math.max(0,Math.min(+S.lv||0,LEVELS.length-1)),false);}finally{STAT.lvl=oL;if(P)P.arm=false;}
if(typeof G==='undefined'||!G||G.lv!==lv)return;
G.z4x={k:k,i:i};G.mode='z4x';D.body.classList.add('z4xlv');
if(G.rid){try{wordCells(G.rid).forEach(function(c){c.el.classList.remove('rid');});}catch(e){}G.rid=null;}
X.ev('lv',{k:k,i:i});
var s=k==='yat'?T('z4x.yat.start',0,'До 1918 года писали с ятем и твёрдым знаком. Найдёшь такое слово — Ять покажет.')
:T('z4x.ant.start',0,'Тетрадь 1975 года, страница '+(i+1)+'. Главное слово тут — из тех, которых больше нет.');
try{zina(s,'happy',7);}catch(e){}ribbon(G.idx,false);};
if(typeof maybeInterstitial==='function')maybeInterstitial(go);else go();},function(){toast('Не загрузилось — проверь интернет',3000);});}
SX.play=play;
function fin(g){var f=g.z4x,z=X.zz(),first=false,rw=0;
if(f.k==='ant'){var b=z.ab||'';first=b.charAt(f.i)!=='1';if(first){while(b.length<=f.i)b+='0';z.ab=b.slice(0,f.i)+'1'+b.slice(f.i+1);z.ap=X.mon();}}
else{var c=Math.floor((+S.lv||0)/20)+1;first=+z.yc<c;if(first){z.yc=c;z.yn=(+z.yn||0)+1;}}
delete S.curs[g.key];rw=first?give(10,f.k):0;X.sv();try{cloudSoon();}catch(e){}
X.ev('end',{k:f.k,i:f.i,f:first?1:0,c:rw});
return{first:first,reward:rw,base:rw,dw:null,isNew:false,streak:0,sbonus:0,exc:!g.hinted,exBonus:0,exLoud:false,week:0,chap:0,dk:0,rankUp:'',test:false,z4x:f};}
function win(g,r,again){var f=g.z4x,d=window.Z4XD||{},body='';
if(f.k==='ant'){var t=(d.tet||[])[f.i]||[g.lv.d,'',''];
body='<div class="defcard"><div class="tag">📒 Тетрадь 1975 года · стр. '+(f.i+1)+'</div><div class="word">'+esc(t[0])+'</div><div class="def">'+esc(t[1])+'</div>'+
'<p style="margin:8px 0 0;font-size:15px;font-style:italic">'+esc(t[2])+'</p><div class="sig"><span>— баба Зина</span></div></div>'+
(r.first?'<p style="font-size:15px">'+esc(T('z4x.ant.win',{w:t[0]},'Слово «'+t[0]+'» — в тетради. Следующая страница — через неделю.'))+'</p>':'');}
else{var got=(f.got||[]).map(function(w){return(d.yat||{})[w]?d.yat[w][0]:'';}).filter(Boolean);
body='<div style="width:96px;height:96px;margin:4px auto">'+face('happy')+'</div>'+
(got.length?'<p style="font-size:17px">До 1918 года ты писал бы: <b>'+got.map(esc).join(', ')+'</b></p>':'<p style="font-size:15px">Слов с ятем ты не нашёл — Ять расстроился, но виду не подаёт.</p>')+
(r.first?'<p class="tmr">Следующий уровень с ятем — в новой главе.</p>':'');}
modal('<div class="'+(again?'':'win')+' z4xwin"><h2>'+(f.k==='ant'?'Страница пройдена!':'Грамотно по-старому!')+'</h2>'+body+
(r.reward?'<div class="reward big" id="mRew">+'+r.reward+' <span class="coin"></span></div>':r.first?'':'<p class="money">Повтор — без монет</p>')+
'<div class="btns"><button class="btn green" id="mNext">Дальше ▶</button><button class="wmenu" id="mMenu">В меню</button></div></div>');
if(typeof fitWin==='function')fitWin();
if(!again&&r.reward){snd('coin');try{coinBurst($$('mRew'),r.reward);}catch(e){}}
$$('mNext').onclick=function(){hideModal();snd('tap');try{if(typeof maybeInterstitial==='function')maybeInterstitial(function(){startLevel(S.lv,false);});else startLevel(S.lv,false);}catch(e){openMenu();}};
$$('mMenu').onclick=function(){hideModal();snd('tap');home();};}
var cur=null;
ZB.screen('z4x',{title:'Школа',render:function(el,op){cur={el:el,k:op.k};el.innerHTML='';el.className='screen zb-scr z4x-scr';
el.style.cssText='background:var(--z3-bg,#f6f1e6);color:var(--z3-ink,#27324a);font-family:var(--z3-font);overflow-y:auto;-webkit-overflow-scrolling:touch';
var w=D.createElement('div');w.className='z4x-w';w.style.cssText='max-width:560px;margin:0 auto;padding:10px 16px 24px;box-sizing:border-box';el.appendChild(w);
var top=D.createElement('div');top.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:8px';
top.innerHTML='<button type="button" class="btn ghost small z4x-back" style="min-height:44px">← Дом</button><b class="z4x-ttl" style="flex:1;font-size:18px;text-align:center"></b><span class="z4x-top" style="min-width:70px;text-align:right;font-size:15px"></span>';
w.appendChild(top);var b=D.createElement('div');b.className='z4x-b';w.appendChild(b);cur.b=b;cur.top=top.querySelector('.z4x-top');
top.querySelector('.z4x-back').onclick=function(){snd('tap');cur=null;home();};
var R={ant:ant,ege:ege,dk:dk,otl:otl}[op.k];if(R)ZB.safe('z4x-'+op.k,function(){R(b,op);});}});
function title(t){if(cur){var e=cur.el.querySelector('.z4x-ttl');if(e)e.textContent=t;}}
function topTxt(t){if(cur&&cur.top)cur.top.textContent=t||'';}
function say(t,m){return'<div style="display:flex;gap:10px;align-items:center;margin:8px 0"><div style="width:64px;height:64px;flex:none">'+face(m)+'</div>'+
'<p style="flex:1;margin:0;font-size:16px;line-height:1.35;text-align:left">'+esc(t)+'</p></div>';}
function btn(id,t,cls){return'<button type="button" class="btn '+(cls||'green')+'" id="'+id+'" style="min-height:48px;font-size:17px">'+t+'</button>';}
var keyFn=null;D.addEventListener('keydown',function(e){if(keyFn&&cur&&ZB.cur==='z4x')ZB.safe('z4x-key',function(){if(keyFn(e.key,e))e.preventDefault();});});
SX.open=function(k,o){o=o||{};if(k==='yat'){yatGo();return;}keyFn=null;ZB.go('z4x',{k:k,from:o.from||''});};
function yatGo(){X.lvs().then(function(){var L=window.Z4XL&&Z4XL.yat||[];if(!L.length){toast('Уровни с ятем не загрузились',2500);return;}
var z=X.zz();play('yat',(+z.yn||0)%L.length);},function(){toast('Не загрузилось — проверь интернет',3000);});}
function ant(b){title('📒 Тетрадь 1975 года');var d=window.Z4XD;if(!d||!d.tet.length){b.innerHTML=say('Тетрадь куда-то задевалась. Наверное, «мой» опять на антресоль убрал.','sad');return;}
var z=X.zz(),p=X.page(),ab=z.ab||'',wait=+z.ap>=X.mon();
var h='';d.tet.forEach(function(t,i){if(ab.charAt(i)==='1')h+='<li style="margin:4px 0"><b>'+esc(t[0])+'</b> — '+esc(t[1])+'</li>';});
var nx=p>=0?d.tet[p]:null;
b.innerHTML='<div class="zmg-card" style="padding:12px 14px;text-align:left">'+
(nx&&!wait?say('Страница '+(p+1)+'. Слово недели — из тех, которых больше нет. Найдёшь его в кроссворде — вспомню, что это было.','happy')+
'<div class="btns" style="margin:8px 0">'+btn('z4xAntGo','▶ Открыть страницу '+(p+1))+'</div>'
:nx?say('Эту неделю ты уже отгадал. Следующая страница — с понедельника.','happy'):say('Тетрадь кончилась. Новую купить негде — их больше не делают.','wow'))+
(h?'<p style="margin:12px 0 4px;font-size:15px;color:var(--z3-ink2,#5d6781)">Уже в тетради:</p><ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.35">'+h+'</ul>':'')+'</div>';
var g=$$('z4xAntGo');if(g)g.onclick=function(){snd('tap');play('ant',p);};}
function two(b,o){
var ord=o.r()<.5?[0,1]:[1,0],done=0;
b.innerHTML='<div class="zmg-card" style="padding:14px;text-align:center"><div class="zmg-q" style="font-size:19px;line-height:1.4;margin:6px 0 12px">'+o.q+'</div>'+
'<div class="zmg-opts" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'+ord.map(function(j,n){return'<button type="button" class="zmg-opt" data-j="'+j+'" style="min-width:120px;min-height:56px;font-size:19px">'+esc(o.a[j])+'</button>';}).join('')+'</div>'+
'<p class="z4x-aft" style="min-height:44px;margin:10px 0 0;font-size:15px;line-height:1.35"></p>'+
'<div class="btns" style="margin-top:6px">'+btn('z4xNext','Дальше ▶')+'</div></div>';
var nb=$$('z4xNext');nb.style.visibility='hidden';
var bs=b.querySelectorAll('.zmg-opt');
function pick(btnEl){if(done)return;done=1;var ok=btnEl.getAttribute('data-j')==='0';
[].forEach.call(bs,function(x){if(x.getAttribute('data-j')==='0')x.classList.add('ok');else if(x===btnEl)x.classList.add('no');x.disabled=true;});
snd(ok?'word':'bad');var a=b.querySelector('.z4x-aft');if(a)a.textContent=o.after(ok)||'';o.res(ok);nb.style.visibility='';nb.focus&&nb.focus();}
[].forEach.call(bs,function(x){x.onclick=function(){pick(x);};});
nb.onclick=function(){snd('tap');o.next();};
keyFn=function(k){if(!done&&(k==='1'||k==='2'||k==='ArrowLeft'||k==='ArrowRight')){pick(bs[k==='1'||k==='ArrowLeft'?0:1]);return true;}if(done&&k==='Enter'){nb.onclick();return true;}return false;};}
function gl(w){try{return typeof GLOSS!=='undefined'&&GLOSS[w]||'';}catch(e){return'';}}
function deny(w){try{return typeof ZINA_DENY!=='undefined'&&(ZINA_DENY.has?ZINA_DENY.has(w):ZINA_DENY[w]);}catch(e){return false;}}
function words(n,lo,hi,r){var L=[];try{if(typeof GLOSS==='undefined')return L;for(var w in GLOSS)if(w.length>=lo&&w.length<=hi&&/^[а-я]+$/.test(w)&&!deny(w)&&String(GLOSS[w]).length<=80)L.push(w);}catch(e){return[];}
L.sort();return shuf(L,r).slice(0,n);}
var ABC='аеиоуклмнпрст';
function anag(b,o){
var w=o.w,LT=w.split('');for(var i=0;i<(o.dec||0);i++){var c=ABC.charAt(Math.floor(o.r()*ABC.length));LT.push(c);}
LT=shuf(LT,o.r).map(function(c,i){return{c:c,i:i};});
var dec=[],cnt={};w.split('').forEach(function(c){cnt[c]=(cnt[c]||0)+1;});var seen={};
LT.forEach(function(t){seen[t.c]=(seen[t.c]||0)+1;if(seen[t.c]>(cnt[t.c]||0))dec.push(t.i);});
var sel=[],done=0,gone={};
b.innerHTML='<div class="zmg-card" style="padding:14px;text-align:center"><p style="margin:4px 0 2px;font-size:14px;color:var(--z3-ink2,#5d6781)">Слово из '+w.length+' букв:</p>'+
'<div class="zmg-q" style="font-size:18px;line-height:1.4;margin:4px 0 10px">'+esc(o.clue)+'</div>'+
'<div class="z4x-ans" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0 12px"></div>'+
'<div class="z4x-LT" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"></div>'+
'<div style="display:flex;gap:8px;justify-content:center;margin-top:10px">'+btn('z4xClr','⌫ Стереть','ghost small')+'</div>'+(o.help||'')+
'<p class="z4x-aft" style="min-height:40px;margin:10px 0 0;font-size:15px;line-height:1.35"></p>'+
'<div class="btns" style="margin-top:6px">'+btn('z4xNext','Дальше ▶')+'</div></div>';
var nb=$$('z4xNext');nb.style.visibility='hidden';
var A=b.querySelector('.z4x-ans'),LL=b.querySelector('.z4x-LT');
function fixed(){var f={};if(o.give&&o.give.first)f[0]=w.charAt(0);if(o.give&&o.give.last)f[w.length-1]=w.charAt(w.length-1);return f;}
function draw(){var f=fixed(),h='',k=0;for(var p=0;p<w.length;p++){var ch=f[p]!=null?f[p]:(sel[k]!=null?LT[sel[k++]].c:'');
h+='<span style="display:inline-flex;width:38px;height:44px;align-items:center;justify-content:center;border-bottom:3px solid var(--z3-line,#c9bda5);font-size:24px;font-weight:700;text-transform:uppercase;'+(f[p]!=null?'color:var(--z3-red,#d0342c)':'')+'">'+esc(ch)+'</span>';}
A.innerHTML=h;var u={};sel.forEach(function(s){u[s]=1;});
LL.innerHTML=LT.map(function(t){if(gone[t.i])return'';return'<button type="button" class="zmg-opt z4x-l" data-i="'+t.i+'" '+(u[t.i]||done?'disabled ':'')+'style="min-width:48px;min-height:52px;font-size:22px;text-transform:uppercase;padding:0 6px'+(u[t.i]?';opacity:.35':'')+'">'+esc(t.c)+'</button>';}).join('');
[].forEach.call(LL.querySelectorAll('.z4x-l'),function(x){x.onclick=function(){tap(+x.getAttribute('data-i'));};});}
function need(){return w.length-Object.keys(fixed()).length;}
function guess(){var f=fixed(),s='',k=0;for(var p=0;p<w.length;p++)s+=f[p]!=null?f[p]:LT[sel[k++]].c;return s;}
function lock(){var f=fixed();for(var p in f){var c=f[p],used=false;for(var j=0;j<LT.length&&!used;j++){var t=LT[j];if(t.c===c&&!gone[t.i]&&dec.indexOf(t.i)<0&&!t.lk){t.lk=1;gone[t.i]=1;used=true;}}}}
function tap(i){if(done||sel.indexOf(i)>=0)return;snd('letter');sel.push(i);if(sel.length>=need())check();else draw();}
function check(){var g=guess(),ok=g===w;if(!ok&&g.length===w.length){try{ok=!deny(g)&&typeof isWord==='function'&&isWord(g)&&g.split('').sort().join('')===w.split('').sort().join('');}catch(e){}}
done=1;draw();snd(ok?'word':'bad');var a=b.querySelector('.z4x-aft');if(a)a.textContent=ok?o.okTxt||'':'Было слово: «'+w.toUpperCase()+'». '+(o.noTxt||'');
o.res(ok);if(ok||!o.stop)nb.style.visibility='';}
$$('z4xClr').onclick=function(){if(done)return;snd('tap');sel=[];draw();};
nb.onclick=function(){snd('tap');o.next();};
keyFn=function(k){if(done){if(k==='Enter'){nb.onclick();return true;}return false;}if(k==='Backspace'){sel.pop();draw();return true;}
var c=String(k).toLowerCase();if(c==='ё')c='е';for(var j=0;j<LT.length;j++){var t=LT[j];if(t.c===c&&!gone[t.i]&&sel.indexOf(t.i)<0){tap(t.i);return true;}}return false;};
SX._an={w:w,fifty:function(){dec.slice(0,2).forEach(function(i){gone[i]=1;var s=sel.indexOf(i);if(s>=0)sel.splice(s,1);});draw();},
first:function(){o.give=o.give||{};o.give.first=1;sel=[];lock();if(need()<=0)check();else draw();},
last:function(){o.give=o.give||{};o.give.last=1;sel=[];lock();if(need()<=0)check();else draw();},done:function(){return done;}};
draw();}
function ege(b){title('🎓 Экзамен месяца');var d=window.Z4XD,z=X.zz(),m=X.ym();
if(!d||!d.ege||d.ege.ud.length<7||d.ege.sr.length<7){b.innerHTML=say('Билеты ещё печатаются. Загляни попозже.','sad');return;}
var r=rng(m*7+11),L=[];shuf(d.ege.ud,r).slice(0,7).forEach(function(x){L.push({t:'ud',x:x});});shuf(d.ege.sr,r).slice(0,7).forEach(function(x){L.push({t:'sr',x:x});});
words(6,5,7,r).forEach(function(w){L.push({t:'an',w:w});});L=shuf(L,r);
var rep=+z.em===m,n=0,ok=0;
b.innerHTML='<div class="zmg-card" style="padding:12px 14px">'+say(rep?'Этот месяц ты уже сдал'+(z.eb?' на '+z.eb+' баллов':'')+'. Пересдать можно — для себя, без монет.':
'Экзамен месяца: '+L.length+' заданий — ударения, «слитно или раздельно», слово из букв. Своё, не школьное. Шпаргалки — к Валерке.','happy')+
'<div class="btns" style="margin:8px 0">'+btn('z4xGo',rep?'Пересдать':'▶ Начать экзамен')+'</div></div>';
$$('z4xGo').onclick=function(){snd('tap');X.ev('go',{k:'ege',r:rep?1:0});step();};
function res(v){if(v)ok++;}
function step(){if(n>=L.length)return end();topTxt((n+1)+' из '+L.length);var it=L[n++];
if(it.t==='ud')two(b,{q:'Где ударение?',a:[it.x[0],it.x[1]],r:r,res:res,next:step,after:function(v){return(v?T('z4x.ege.ok',0,'Верно!'):T('z4x.ege.no',0,'Не так.'))+' '+it.x[2];}});
else if(it.t==='sr')two(b,{q:esc(it.x[0]).replace('___','<b style="color:var(--z3-red,#d0342c)">___</b>'),a:[it.x[1],it.x[2]],r:r,res:res,next:step,
after:function(v){return(v?T('z4x.ege.ok',0,'Верно!'):T('z4x.ege.no',0,'Не так.'))+' '+it.x[3];}});
else{var c=gl(it.w);if(!c){step();return;}anag(b,{w:it.w,clue:c,r:r,dec:0,res:res,next:step,okTxt:T('z4x.ege.ok',0,'Верно!')});}}
function end(){keyFn=null;topTxt('');var all=L.length,ball=Math.round(ok*100/all),rw=0,att=['','',''];
(d.ege.att||[]).some(function(a){if(ball>=a[0]){att=a;return true;}return false;});
if(!rep){z.em=m;z.eb=ball;z.en=(+z.en||0)+1;rw=give(Math.min(20,Math.floor(ball/5)),'ege');}else if(ball>+z.eb)z.eb=ball;
X.sv();X.ev('end',{k:'ege',b:ball,c:rw,r:rep?1:0});snd(ball>=50?'win':'tap');
b.innerHTML='<div class="zmg-card" style="padding:14px;text-align:center;background:var(--z3-paper,#fbf7ec)">'+
'<p style="margin:0;font:700 15px/1.3 var(--z3-font-news,Georgia,serif);letter-spacing:.08em">АТТЕСТАТ</p>'+
'<p style="margin:2px 0 8px;font-size:14px;color:var(--z3-ink2,#5d6781)">об экзамене месяца у бабы Зины</p>'+
'<div style="font:700 44px/1.1 var(--z3-font-hand,cursive);color:var(--z3-red,#d0342c)">'+ball+'</div><p style="margin:0 0 8px;font-size:14px">баллов из 100 · верно '+ok+' из '+all+'</p>'+
(att[1]?'<p style="font-size:18px;margin:6px 0"><b>'+esc(att[1])+'</b></p>':'')+say(att[2]||'Подпись: Зина. Печать: кот Ять.','happy')+
(rw?'<div class="reward big">+'+rw+' <span class="coin"></span></div>':'')+
'<div class="btns">'+btn('z4xEnd','В Дом')+'</div></div>';
$$('z4xEnd').onclick=function(){snd('tap');cur=null;home();};}}
function dkText(s){var d=window.Z4XD,L=d&&d.dk||[];if(!L.length)return null;var m=Math.floor(s/100);return L[(m%L.length+L.length)%L.length];}
function gapWord(p,ok){var t=p.replace('_',ok),m=/[А-Яа-яЁё-]*_[А-Яа-яЁё-]*/.exec(p);return m?m[0].replace('_',ok).toLowerCase():t;}
function dk(b){title('✍️ Диктант дома');var z=X.zz(),ph=X.dkPhase(),s=X.dkDay(),tx=dkText(s);
if(!tx){b.innerHTML=say('Текст диктанта ещё у меня в черновике. Ждём.','sad');return;}
if(ph!=='now'){b.innerHTML='<div class="zmg-card" style="padding:12px 14px">'+say(+z.dm===X.ym()?'Диктант этого месяца ты написал. Итоги — в «Вечёрке».':
'Диктант дома — в первую субботу месяца, с 12:00 до 14:00. Весь подъезд пишет один текст, а потом в «Вечёрке» — самая частая ошибка.','happy')+'</div>';return;}
var r=rng(s),L=tx.p,n=0,err=[];
b.innerHTML='<div class="zmg-card" style="padding:12px 14px">'+say('Диктант «'+tx.t+'». '+L.length+' фраз — выбирай букву. Списывать у Гали нельзя: она сама у меня спрашивает.','happy')+
'<div class="btns" style="margin:8px 0">'+btn('z4xGo','▶ Пишем')+'</div></div>';
$$('z4xGo').onclick=function(){snd('tap');X.ev('go',{k:'dk'});step();};
function step(){if(n>=L.length)return end();topTxt((n+1)+' из '+L.length);var i=n,p=L[n++];
two(b,{q:'<div class="zm0-sheet" style="padding:10px 12px;text-align:left"><div class="zm0-ttl" style="font-size:15px">'+esc(tx.t)+'</div><div style="font-size:19px;line-height:1.5">'+
esc(p[0]).replace('_','<b style="color:var(--z3-red,#d0342c)">_</b>')+'</div></div>',a:[p[1],p[2]],r:r,next:step,
res:function(v){if(!v)err.push(i);},after:function(v){return v?'':p[3];}});}
function end(){keyFn=null;topTxt('');var first=+z.dm!==X.ym(),rw=0;
if(first){z.dm=X.ym();z.de=err.length;rw=give(10,'dk');
var e=String(s);Z.srv.send('ev',{e:'z4xd-'+e,n:1});err.forEach(function(i){Z.srv.send('ev',{e:'z4xd'+i+'-'+e,n:1});});
try{localStorage.setItem('z4x-dk',JSON.stringify({s:s,e:err}));}catch(x){}}
X.sv();X.ev('end',{k:'dk',n:err.length,c:rw});snd(err.length<2?'win':'tap');
b.innerHTML='<div class="zmg-card" style="padding:14px;text-align:center">'+
'<div style="font:700 40px/1.1 var(--z3-font-hand,cursive);color:var(--z3-red,#d0342c)">'+(err.length===0?'5':err.length<=2?'4':err.length<=4?'3':'2')+'</div>'+
say(T('z4x.dk.end',{n:err.length},'Ошибок: '+err.length+'. Красная ручка довольна.'),'happy')+
(err.length?'<ul style="text-align:left;font-size:15px;line-height:1.35;margin:6px 0">'+err.map(function(i){return'<li>'+esc(L[i][0].replace('_',L[i][1]))+'</li>';}).join('')+'</ul>':'')+
'<p class="tmr">С 13:00 в «Вечёрке» — самая частая ошибка дома.</p>'+(rw?'<div class="reward big">+'+rw+' <span class="coin"></span></div>':'')+
'<div class="btns">'+btn('z4xEnd','В Дом')+'</div></div>';
$$('z4xEnd').onclick=function(){snd('tap');cur=null;home();};}}
SX.paper=function(s){return X.data().then(function(){var tx=dkText(+s);if(!tx)return'';var c=null;try{c=JSON.parse(localStorage.getItem('z4x-pap')||'null');}catch(e){}
if(c&&c.s===s&&c.t)return c.t;
function sim(){var own=null;try{own=JSON.parse(localStorage.getItem('z4x-dk')||'null');}catch(e){}var i=own&&own.s==s&&own.e&&own.e.length?own.e[0]:(+s)%tx.p.length;
return T('z4x.dk.sim',{w:gapWord(tx.p[i][0],tx.p[i][1])},'Зина проверила тетради соседей: чаще всего ошибались в слове «'+gapWord(tx.p[i][0],tx.p[i][1])+'».');}
function live(d){return d&&!d._sim&&!d._off&&+d.p>=0;}
return Z.srv.get('ev',{e:'z4xd-'+s}).then(function(d){if(!live(d)||+d.p<2)return sim();var pAll=+d.p,best=-1,bn=0,i=0;
function nx(){if(i>=tx.p.length){if(best<0||bn<1)return sim();var t=T('z4x.dk.paper',{w:gapWord(tx.p[best][0],tx.p[best][1]),p:bn},'Чаще всего ошибались в слове «'+gapWord(tx.p[best][0],tx.p[best][1])+'». Ошиблись соседей: '+bn+' из '+pAll+'.');
try{localStorage.setItem('z4x-pap',JSON.stringify({s:s,t:t}));}catch(e){}return t;}
var j=i++;return Z.srv.get('ev',{e:'z4xd'+j+'-'+s}).then(function(r){if(live(r)&&+r.n>bn){bn=+r.n;best=j;}return nx();},nx);}
return nx();},sim);});};
var OTL=[0,0,0,0,5,5,5,5,5,10,10,10,10,10,20];
function otl(b){title('👩‍🏫 У доски');var z=X.zz(),t=X.tk(),paid=+z.od===t;
if(typeof GLOSS==='undefined'){b.innerHTML=say('Мел есть, доска есть, а вопросы ещё несут. Минутку.','sad');setTimeout(function(){if(cur&&cur.k==='otl')otl(b);},1500);return;}
var r=rng(t*13+(paid?Date.now()%997:0)),Q=[];for(var s=0;s<15;s++){var ln=s<3?4:s<6?5:s<9?6:s<12?7:8,w=words(1,ln,ln,r)[0];if(w)Q.push(w);}
if(Q.length<15){b.innerHTML=say('Вопросов не хватило — Валерка опять унёс журнал.','sad');return;}
var n=0,life={f:1,g:1,p:1};
b.innerHTML='<div class="zmg-card" style="padding:12px 14px">'+say(T('z4x.otl.intro',0,'К доске! 15 вопросов: угадай слово по толкованию. На 5-м и 10-м отметка зачтена — её уже не отнять.'),'happy')+
'<p style="font-size:15px;margin:4px 0">Подсказки по разу: 🐈 Ять убирает 2 лишние буквы · ☎️ звонок Гале — первая буква · 🏠 помощь подъезда — последняя.</p>'+
(paid?'<p class="tmr">Сегодня ты уже отвечал — сейчас для себя, без монет.</p>':'')+'<div class="btns" style="margin:8px 0">'+btn('z4xGo','▶ К доске')+'</div></div>';
$$('z4xGo').onclick=function(){snd('tap');X.ev('go',{k:'otl',r:paid?1:0});step();};
function lad(){var h='';for(var i=0;i<15;i++)h+='<i style="display:inline-block;width:14px;height:14px;margin:2px;border-radius:50%;background:'+(i<n-1?'var(--z3-green,#237a3b)':i===n-1?'var(--z3-gold,#e0a526)':'var(--z3-line,#ddd)')+(i===4||i===9?';outline:2px solid var(--z3-red,#d0342c)':'')+'"></i>';return'<div style="text-align:center;margin:0 0 6px">'+h+'</div>';}
function helpH(){return'<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px">'+
'<button type="button" class="btn ghost small z4x-h" data-h="f" '+(life.f?'':'disabled ')+'style="min-height:44px">🐈 Ять</button>'+
'<button type="button" class="btn ghost small z4x-h" data-h="g" '+(life.g?'':'disabled ')+'style="min-height:44px">☎️ Гале</button>'+
'<button type="button" class="btn ghost small z4x-h" data-h="p" '+(life.p?'':'disabled ')+'style="min-height:44px">🏠 Подъезд</button></div><p class="z4x-hs" style="min-height:20px;margin:6px 0 0;font-size:15px"></p>';}
function step(){if(n>=15)return end(15);var w=Q[n++];topTxt('Вопрос '+n);
anag(b,{w:w,clue:gl(w),r:r,dec:2,help:helpH(),res:function(v){if(!v){setTimeout(function(){end(n-1);},900);}else if(n===5||n===10){var a=b.querySelector('.z4x-aft');if(a)a.textContent=T('z4x.otl.safe',0,'Отметка зачтена!');}},
next:step,okTxt:'Верно!',noTxt:'',stop:1});
var c=b.querySelector('.zmg-card');if(c)c.insertAdjacentHTML('afterbegin',lad());
[].forEach.call(b.querySelectorAll('.z4x-h'),function(x){x.onclick=function(){var h=x.getAttribute('data-h'),A=SX._an,hs=b.querySelector('.z4x-hs');if(!life[h]||A.done())return;life[h]=0;x.disabled=true;snd('tap');
if(h==='f'){A.fifty();if(hs)hs.textContent=T('z4x.otl.fifty',0,'Ять смахнул лапой две лишние буквы.');}
else if(h==='g'){A.first();if(hs)hs.textContent=T('z4x.otl.gala',{l:w.charAt(0).toUpperCase()},'Галя: «На «'+w.charAt(0).toUpperCase()+'», я тебе точно говорю!»');}
else{A.last();if(hs)hs.textContent=T('z4x.otl.pod',{l:w.charAt(w.length-1).toUpperCase()},'Подъезд посовещался: кончается на «'+w.charAt(w.length-1).toUpperCase()+'».');}};});}
function end(got){keyFn=null;topTxt('');var safe=got>=15?15:got>=10?10:got>=5?5:0,rw=0;
if(!paid&&safe){z.od=t;z.os=safe;rw=give(OTL[safe-1],'otl');}else if(!paid&&!safe){z.od=t;z.os=0;}
z.ob=Math.max(+z.ob||0,got);X.sv();X.ev('end',{k:'otl',n:got,s:safe,c:rw,r:paid?1:0});
var mk=safe===15?'5':safe===10?'4':safe===5?'3':'';snd(got>=15?'win':'tap');
b.innerHTML='<div class="zmg-card" style="padding:14px;text-align:center">'+(mk?'<div style="font:700 44px/1.1 var(--z3-font-hand,cursive);color:var(--z3-red,#d0342c)">'+mk+'</div>':'')+
'<p style="font-size:16px;margin:4px 0">Верных ответов подряд: <b>'+got+' из 15</b></p>'+
say(got>=15?T('z4x.otl.win',0,'Все пятнадцать! Отличник. Валерка, смотри и учись.'):T('z4x.otl.lose',0,'Садись. Завтра снова к доске — я злопамятная, но добрая.'),got>=15?'wow':'happy')+
(rw?'<div class="reward big">+'+rw+' <span class="coin"></span></div>':'')+'<div class="btns">'+btn('z4xEnd','В Дом')+'</div></div>';
$$('z4xEnd').onclick=function(){snd('tap');cur=null;home();};}}
})();
