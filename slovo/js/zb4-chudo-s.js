'use strict';
(function(){
var U=window.Z4U;if(!U||U.S||!window.Z4||!Z4.on||typeof ZB==='undefined'||typeof S==='undefined')return;U.S=1;
var F=U.F,n=U.n,DE=document.documentElement,DATA='js/zb4-chudo-data.js';
function Z(){if(!S.z4u||typeof S.z4u!=='object')S.z4u=JSON.parse(JSON.stringify(U.DEF));return S.z4u;}
var QH=/[?&]z4uh=(\d{1,2})/.exec(location.search),QD=/[?&]z4ud=(\d{8})/.exec(location.search);
function tk(){if(QD)return+QD[1];try{return+todayKey();}catch(e){return 0;}}
function hour(){if(QH)return+QH[1];try{return new Date(typeof nowMs==='function'?nowMs():Date.now()).getHours();}catch(e){return 12;}}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function ev(a,p){var o={a:a},k;for(k in p||{})o[k]=p[k];Z4.ev('z4u',o);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function h32(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function T(k){var L=window.Z4T&&Z4T[k];return L&&L.length?L:[];}
function pick(k,seed){var L=T(k);return L.length?L[h32(seed)%L.length]:'';}
function tx(k,c){return Z4.txt(k,c);}
function data(){return window.Z4U_DATA?Promise.resolve():ZB.load(DATA);}
function days(a,b){try{return Z3.days(a,b);}catch(e){return 99;}}
function dnum(t){t=t||tk();return Math.round(Date.UTC(Math.floor(t/1e4),Math.floor(t/100)%100-1,t%100)/864e5);}
function say(t,m,s){try{if(typeof zina==='function'&&t)zina(t,m||'norm',s||4);}catch(e){}}
function refresh(){try{if(ZB.refresh)ZB.refresh();}catch(e){}}
if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4u==null)ZBECO.cap.z4u=15;
function give(k,why){try{return window.ZBECO&&ZBECO.give?ZBECO.give('z4u',k,why||'gift'):0;}catch(e){return 0;}}
function isApr(){return F.apr&&tk()%10000===401&&Z().af!==tk();}
function isNight(){var h=hour();return F.night&&h>=0&&h<5;}
function isMorn(){var h=hour();return F.utro&&h>=7&&h<10;}
var AB='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
function horIdx(){return h32('hor'+tk())%33;}
function css(){if(document.getElementById('z4uCss'))return;var s=document.createElement('style');s.id='z4uCss';s.textContent=
'.z4u-pap{margin:10px 0;padding:10px 12px;border:1px dashed var(--z3-line,#e6dcc8);border-radius:var(--z3-r,12px);background:var(--z3-paper,#fbf7ec);color:var(--z3-ink,#27324a);font-size:15px;line-height:1.4}'+
'.z4u-pap h4{margin:6px 0 4px;font-size:16px;font-family:var(--z3-font-head,inherit)}.z4u-pap p{margin:4px 0}.z4u-sm{font-size:13.5px;color:var(--z3-ink2,#5d6781)}'+
'.z4u-bt{display:inline-block;min-height:44px;min-width:44px;margin:4px 6px 4px 0;padding:8px 12px;border-radius:10px;border:1px solid var(--z3-line,#e6dcc8);background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);font-size:15px;cursor:pointer}'+
'.z4u-bt.acc{background:var(--z3-acc,#c2410c);color:#fff;border-color:var(--z3-acc-edge,#9a3412)}'+
'.z4u-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9500;background:rgba(20,24,36,.55);display:flex;align-items:center;justify-content:center;padding:16px}'+
'.z4u-box{max-width:420px;width:100%;max-height:92vh;overflow:auto;background:var(--z3-paper,#fbf7ec);color:var(--z3-ink,#27324a);border-radius:var(--z3-rb,16px);padding:16px;font-size:16px;line-height:1.4;box-shadow:var(--z3-shadow,0 6px 24px rgba(0,0,0,.25))}'+
'.z4u-box h3{margin:0 0 8px;font-family:var(--z3-font-head,inherit);font-size:19px}'+
'.z4u-lets{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}.z4u-let{min-width:46px;min-height:46px;font-size:22px;font-weight:700;border-radius:10px;border:1px solid var(--z3-line,#e6dcc8);background:var(--z3-card,#fff);color:var(--z3-ink,#27324a)}'+
'.z4u-let[disabled]{opacity:.35}.z4u-ans{min-height:34px;text-align:center;font-size:24px;letter-spacing:4px;font-weight:700}'+
'.z4u-note{position:fixed;left:50%;bottom:18px;z-index:9400;transform:translateX(-50%) rotate(-1.5deg);max-width:340px;width:calc(100% - 32px);padding:14px 16px;background:var(--z3-paper,#fbf7ec);color:var(--z3-ink,#27324a);font-family:var(--z3-font-hand,cursive);font-size:21px;line-height:1.25;border-radius:4px;box-shadow:var(--z3-shadow,0 6px 24px rgba(0,0,0,.25));cursor:pointer}'+
'.z4u-note small{display:block;font-family:var(--z3-font,inherit);font-size:13.5px;color:var(--z3-ink2,#5d6781);margin-top:6px}'+
'#z4uStrip{position:relative;margin:6px 8px;min-height:36px;display:flex;align-items:center;gap:6px;padding:3px 8px;border-radius:10px;background:rgba(20,24,36,.72);color:#fff;font-size:14px;overflow:hidden;cursor:pointer;white-space:nowrap}'+
'#z4uStrip .z4u-run{flex:1;overflow:hidden}#z4uStrip .z4u-run span{display:inline-block;padding-left:100%;animation:z4uRun 16s linear infinite}'+
'#z4uStrip.calm .z4u-run span{padding-left:0;animation:none;white-space:normal}#z4uStrip button{min-height:36px;border-radius:8px;border:0;padding:2px 10px;background:var(--z3-acc,#c2410c);color:#fff;font-size:14px}'+
'@keyframes z4uRun{from{transform:translateX(0)}to{transform:translateX(-100%)}}'+
'html.z4u-night #z3yArt{filter:brightness(.55) saturate(.8)}'+
'#z4uLamp{position:absolute;right:6%;top:24%;width:120px;height:120px;margin:-60px -60px 0 0;border-radius:50%;pointer-events:none;z-index:2;background:radial-gradient(circle,rgba(255,214,140,.55),rgba(255,190,90,0) 70%)}'+
'#z4uLamp i{position:absolute;font-style:normal;font-weight:700;font-size:13.5px;color:#ffe7b0;animation:z4uMoth 5s ease-in-out infinite}'+
'#z4uLamp i:nth-child(2){animation-delay:-1.7s;animation-duration:6s}#z4uLamp i:nth-child(3){animation-delay:-3.1s;animation-duration:7s}'+
'#z4uLamp.calm i{animation:none}@keyframes z4uMoth{0%{transform:translate(30px,40px)}25%{transform:translate(70px,20px)}50%{transform:translate(50px,70px)}75%{transform:translate(20px,30px)}100%{transform:translate(30px,40px)}}'+
'html.z4u-night #game::after{content:"";position:fixed;left:0;top:0;width:60vw;height:60vh;pointer-events:none;z-index:1;background:radial-gradient(circle at 0 0,rgba(255,200,120,.16),rgba(255,200,120,0) 70%)}'+
'html.z4u-apr #z3yArt{transform:rotate(180deg)}'+
'@media (prefers-reduced-motion:reduce){#z4uStrip .z4u-run span{animation:none;padding-left:0}#z4uLamp i{animation:none}}';
document.head.appendChild(s);}
function ov(html,bind){css();var d=document.createElement('div');d.className='z4u-ov';d.innerHTML='<div class="z4u-box">'+html+'</div>';
function close(){if(d.parentNode)d.parentNode.removeChild(d);}
d.addEventListener('click',function(e){if(e.target===d)close();});document.body.appendChild(d);
[].forEach.call(d.querySelectorAll('[data-x]'),function(b){b.onclick=close;});if(bind)ZB.safe('z4u-ov',function(){bind(d.firstChild,close);});return close;}
var noteEl=null;
function note(t,sub,then){css();if(noteEl&&noteEl.parentNode)noteEl.parentNode.removeChild(noteEl);var d=noteEl=document.createElement('div');d.className='z4u-note';
d.innerHTML=esc(t)+(sub?'<small>'+esc(sub)+'</small>':'')+'<small>нажми, чтобы убрать</small>';var done=0;
function close(){if(done++)return;if(d.parentNode)d.parentNode.removeChild(d);if(then)ZB.safe('z4u-note',then);}
d.onclick=close;document.body.appendChild(d);setTimeout(close,9000);}
function horHtml(){var i=horIdx(),L=T('z4u.hor'),x=L[i]||'',p=x.split('|');if(!x)return'';
return'<h4>🔮 Бабушкин гороскоп · буква «'+esc(p[0])+'»</h4><p>'+esc(p[1]||'')+'</p><p class="z4u-sm">'+esc(pick('z4u.horf',tk()))+'</p>';}
function horSeen(w){var z=Z();if(z.hd!==tk()){z.hd=tk();sv();ev('hor',{w:w,l:horIdx()});}}
function utroHtml(){var z=Z(),t=tk(),d=z.um===t;
return'<h4>☀ Утро с Зиной</h4><p>'+esc(pick('z4u.wx','wx'+t))+'</p><p>'+esc(pick('z4u.tip','tip'+t))+'</p>'+
'<button type="button" class="z4u-bt acc" data-z4u="zar">'+(d?'Зарядка ещё раз':'🏃 Зарядка для ума: 3 слова')+'</button>'+
(z.ub?'<span class="z4u-sm"> лучшее время: '+z.ub+' с</span>':'');}
function zarWords(){var L=T('z4u.zar').slice(),t=tk(),R=[];if(!L.length)return R;for(var k=0;k<3&&L.length;k++){var i=h32('zar'+t+'-'+k)%L.length;R.push(L.splice(i,1)[0]);}return R;}
function shuf(w,seed){var a=w.split(''),s=h32(seed);for(var i=a.length-1;i>0;i--){s=(Math.imul(s,1103515245)+12345)>>>0;var j=s%(i+1),x=a[i];a[i]=a[j];a[j]=x;}
if(a.join('')===w&&a.length>1){var y=a[0];a[0]=a[1];a[1]=y;}return a;}
function zar(){data().then(function(){var W=zarWords();if(!W.length)return;var k=0,t0=Date.now(),skip=0;ev('utro',{a2:'zar0'});
ov('<h3>🏃 Зарядка для ума</h3><p class="z4u-sm">Собери слово из букв — по порядку. Три слова на скорость.</p><p class="z4u-sm z4u-k"></p><div class="z4u-ans"></div><div class="z4u-lets"></div>'+
'<p style="text-align:center"><button type="button" class="z4u-bt" data-z4u="clr">✕ Стереть</button><button type="button" class="z4u-bt" data-z4u="giv">Подскажи</button><button type="button" class="z4u-bt" data-x>Закрыть</button></p>',
function(b,close){var cur='',used=[];
function draw(){var w=W[k],L=shuf(w,'zs'+tk()+k);b.querySelector('.z4u-k').textContent='Слово '+(k+1)+' из 3';b.querySelector('.z4u-ans').textContent=cur||'·';
var box=b.querySelector('.z4u-lets');box.innerHTML=L.map(function(c,i){return'<button type="button" class="z4u-let" data-i="'+i+'"'+(used[i]?' disabled':'')+'>'+esc(c)+'</button>';}).join('');
[].forEach.call(box.querySelectorAll('.z4u-let'),function(e){e.onclick=function(){var i=+e.getAttribute('data-i');if(used[i])return;used[i]=1;cur+=L[i];
if(cur.length>=w.length){if(cur===w){k++;cur='';used=[];if(k>=W.length){fin();return;}}else{cur='';used=[];b.querySelector('.z4u-ans').textContent='не то слово…';setTimeout(draw,700);return;}}draw();};});}
function fin(){var sec=Math.max(1,Math.round((Date.now()-t0)/1000)),z=Z(),best=0;z.um=tk();if(!skip&&(!z.ub||sec<z.ub)){z.ub=sec;best=1;}sv();ev('zar',{s:sec,sk:skip,b:best});
b.innerHTML='<h3>☀ Готово!</h3><p>'+esc(tx('z4u.zok'))+'</p><p class="z4u-sm">Время: '+sec+' с'+(skip?' (с подсказкой — в рекорд не идёт)':best?' — это твой рекорд!':' · лучшее: '+z.ub+' с')+'</p><p><button type="button" class="z4u-bt acc" data-c>Спасибо</button></p>';
b.querySelector('[data-c]').onclick=function(){close();refresh();};}
b.querySelector('[data-z4u=clr]').onclick=function(){cur='';used=[];draw();};
b.querySelector('[data-z4u=giv]').onclick=function(){skip=1;cur='';used=[];b.querySelector('.z4u-ans').textContent=W[k];setTimeout(function(){k++;if(k>=W.length)fin();else draw();},1200);};
draw();});},function(){});}
var WHO={v:'Валерка',y:'кот Ять',m:'мой'},WK=['v','y','m'];
function ddCase(){var L=T('z4u.dd');if(!L.length)return null;var p=L[dnum()%L.length].split('|');return{q:p[0],a:p[1],r:p[2]};}
function ddHtml(){var c=ddCase(),z=Z();if(!c)return'';var h='<h4>🥧 Кто съел пирожки? Дело дня</h4><p>'+esc(c.q)+'</p>';
if(z.dm===tk())h+='<p><b>'+(z.ds===1?'Верно! ':'Мимо. ')+'</b>'+esc(c.r)+'</p>';
else h+='<p>'+WK.map(function(k){return'<button type="button" class="z4u-bt" data-z4u="dd:'+k+'">'+esc(WHO[k])+'</button>';}).join('')+'</p>';
return h;}
function ddAns(k){var c=ddCase(),z=Z();if(!c||z.dm===tk())return;z.dm=tk();z.ds=k===c.a?1:2;sv();ev('dd',{ok:z.ds===1?1:0});}
function papBlocks(op){var B=[],t=tk();
if(isApr())B.push('<h4>😄 Первоапрельская «Утренняя»</h4><p>'+esc(pick('z4u.ap','ap'+t))+'</p>');
if(isNight())B.push('<h4>🌙 Ночной выпуск</h4><p>'+esc(pick('z4u.np','np'+t+hour()).replace(/^Ночной выпуск:\s*/,''))+'</p>');
if(isMorn())B.push(utroHtml());
if(F.hor)B.push(horHtml());
if(F.det&&S.lv>=20)B.push(ddHtml());
return B.filter(function(x){return x;});}
function papInject(el,op){op=op||{};if(!el||op.r||op.arch||op.pg||op.dn!=null)return;
var sh=el.querySelector('.z3p-sheet');if(!sh)return;
if(!window.Z4U_DATA){data().then(function(){if(ZB.cur==='z3paper')papInject(el,op);},function(){});return;}
var old=sh.querySelector('.z4u-pap');if(old)old.parentNode.removeChild(old);
var B=papBlocks(op);if(!B.length)return;css();
if(isApr())[].forEach.call(el.querySelectorAll('h1,h2,h3,b,span,div'),function(e){if(!e.children.length&&e.textContent==='Вечёрка у Зины')e.textContent='Утренняя у Зины';});
var d=document.createElement('div');d.className='z4u-pap';d.innerHTML=B.join('<hr style="border:0;border-top:1px dashed var(--z3-line,#e6dcc8);margin:8px 0">');
var fr=sh.querySelector('.z3p-front');if(fr&&fr.nextSibling)sh.insertBefore(d,fr.nextSibling);else sh.appendChild(d);
if(F.hor)horSeen('paper');if(isMorn())ev('utro',{a2:'paper'});
bindAll(d,function(){papInject(el,op);});}
function bindAll(root,redo){[].forEach.call(root.querySelectorAll('[data-z4u]'),function(b){b.onclick=function(){var a=b.getAttribute('data-z4u');
try{if(typeof SND!=='undefined'&&SND.tap)SND.tap();}catch(e){}
if(a==='zar')zar();
else if(a.indexOf('dd:')===0){ddAns(a.slice(3));if(redo)redo();}
else if(a.indexOf('vd:')===0)verdict(a.slice(3));
else if(a.indexOf('ks:')===0)saucer(a.slice(3));
else if(a==='pap'){try{ZB.go('z3paper',{});}catch(e){}}
else if(a==='tv')tvOpen();};});}
function papHook(){var P=window.Z3PAPER;if(!P||!P.render||P.render._z4u)return;var o=P.render;
P.render=function(el,op){var r=o.apply(this,arguments);ZB.safe('z4u-pap',function(){if(op&&op.dn!=null)return;papInject(el,op);});return r;};for(var k in o)P.render[k]=o[k];P.render._z4u=1;}
function papLate(){var el=document.getElementById('zb-z3paper');if(el&&ZB.cur==='z3paper'&&!el.querySelector('.z4u-pap')&&!el.querySelector('.z3p-game'))papInject(el,{});}
ZB.on('screen',function(id){if(id!=='zb-z3paper')return;papHook();var P=window.Z3PAPER;
if(P&&P.x&&!P.ui)P.x().then(function(){ZB.safe('z4u-pap',function(){papHook();setTimeout(function(){ZB.safe('z4u-pap',papLate);},60);});},function(){});
setTimeout(function(){ZB.safe('z4u-pap',function(){papHook();var el=document.getElementById('zb-z3paper');
if(el&&ZB.cur==='z3paper'&&!el.querySelector('.z4u-pap')&&!el.querySelector('.z3p-game'))papInject(el,{});});},60);});
function cardKind(){var z=Z(),t=tk(),h=hour();
if(F.det&&z.dp&&z.dv<z.dp)return'vd';
if(F.kuz&&z.kd&&z.kd<t&&z.kg<z.kd&&h>=5)return'kg';
if(isMorn()&&z.um!==t)return'utro';
if(F.kuz&&h>=18&&z.kd!==t&&Z4.day()>=5)return'ks';
if(F.hor&&(z.hd!==t||horSess===t))return'hor';
return'';}
var CK='',horSess=0;
function cardHtml(){var k=CK=cardKind(),z=Z(),h='';if(!k||!window.Z4U_DATA)return'';
if(k==='vd'){var c=z.dp-1,cl=caseClues(c),got=[];cl.forEach(function(x,j){if(z.dl&(1<<j))got.push(x.w);});
h='<b>🥧 Кто съел пирожки?</b><br>Глава закрыта, дело на столе. Улики: '+(got.length?esc(got.join(', ')):'не найдены — гадай по чутью')+'.<br>'+
WK.map(function(x){return'<button type="button" class="z4u-bt" data-z4u="vd:'+x+'">'+esc(WHO[x])+'</button>';}).join('');}
else if(k==='kg')h='<b>📝 Записка на блюдце</b><br><span style="font-family:var(--z3-font-hand,cursive);font-size:20px">'+esc(tx('z4u.kg',{w:'«'+(z.ks||'угощение').toLowerCase()+'»'}))+'</span>';
else if(k==='utro')h=utroHtml();
else if(k==='ks'){var L=T('z4u.kw'),t=tk(),W=[];for(var i=0;i<3&&L.length;i++){var w=L[h32('kw'+t+i)%L.length];if(W.indexOf(w)<0)W.push(w);}
h='<b>🍵 Блюдце для Кузьмы</b><br>Домовой любит угощение. Оставь на блюдце одно слово — утром посмотрим.<br>'+
W.map(function(w){return'<button type="button" class="z4u-bt" data-z4u="ks:'+esc(w)+'">'+esc(w)+'</button>';}).join('');}
else if(k==='hor')h=horHtml();
return h?'<div class="z4u-pap z4u-card">'+h+'</div>':'';}
Z4.card.add({id:'z4u',order:30,show:function(){return!!cardKind();},
html:function(){css();if(!window.Z4U_DATA){data().then(refresh,function(){});return'';}return cardHtml();},
mount:function(el){if(!el)return;bindAll(el);var z=Z();
if(CK==='hor'){if(Z().hd!==tk())horSess=tk();horSeen('home');}
if(CK==='kg'&&z.kg<z.kd){z.kg=z.kd;var g=give(3,'gift');sv();ev('kgift',{c:g});if(g)try{toast('+'+g+' от Кузьмы',2500);}catch(e){}}}});
function kuzDay(){var z=Z(),t=tk();if(!F.kuz||!t||z.kv===t)return;z.kv=t;
if(Z4.day()>=5&&+S.lv>=10&&days(z.kn||0,t)>=3&&(h32('kuz'+t+(S.lv|0))%100)<35){z.kn=t;z.kp=1;z.kc=(z.kc|0)+1;ev('kuz',{n:z.kc});}sv();}
function saucer(w){var z=Z(),t=tk();if(z.kd===t)return;z.kd=t;z.ks=String(w).slice(0,12);sv();ev('saucer',{});
note('Блюдце с «'+z.ks.toLowerCase()+'» поставлено. Утром посмотрим, что скажет Кузьма.','',refresh);refresh();}
Z4.onStart(function(i){var z=Z();if(!F.kuz||!z.kp||i.daily||i.mode||i.mix||i.idx!==+S.lv)return;z.kp=0;sv();var g=i.G;
setTimeout(function(){if(typeof G==='undefined'||G!==g||g.won)return;ZB.safe('z4u-kuz',function(){if(typeof shuffleLetters==='function')shuffleLetters();
data().then(function(){var first=(z.kc|0)<=1;note(tx('z4u.kn'),'',function(){if(first)say(tx('z4u.kz'),'norm',5);});},function(){});});},900);});
function caseClues(c){var cu=WK[h32('cu'+c)%3],ot=WK[(WK.indexOf(cu)+1+h32('ot'+c)%2)%3],K=[cu,cu,ot,'n'],R=[];
var ord=[0,1,2,3].sort(function(a,b){return h32('o'+c+a)%97-h32('o'+c+b)%97||a-b;});
ord.forEach(function(x,j){var s=K[x],L=T(s==='n'?'z4u.cn':'z4u.c'+s);var e=L.length?L[h32('cl'+c+'-'+j)%L.length].split('|'):['УЛИКА',''];R.push({s:s,w:e[0],t:e[1]});});
R.cu=cu;return R;}
function clueLevels(c){var ch=null;try{ch=ZB.chap(c);}catch(e){}if(!ch||!(ch.to>=ch.from))return[];var len=ch.to-ch.from+1,P=[],k=0;
if(len<6)return[];while(P.length<4&&k<40){var o=1+h32('cv'+c+'-'+k)%(len-2);var x=ch.from+o;if(P.indexOf(x)<0)P.push(x);k++;}return P.sort(function(a,b){return a-b;});}
var curC=null;
Z4.onStart(function(i){curC=null;if(!F.det||i.daily||i.mode||i.mix||i.lv<30||i.idx!==+S.lv)return;var c=0;try{c=ZB.chapAt(i.idx);}catch(e){return;}var z=Z();
if(z.dc!==c+1){if(z.dc&&z.dl&&z.dv<z.dc&&!z.dp)z.dp=z.dc;z.dc=c+1;z.dl=0;sv();ev('case',{c:c});}
var P=clueLevels(c),j=P.indexOf(i.idx);if(j>=0&&!(z.dl&(1<<j)))curC={j:j,c:c,g:i.G,got:0,idx:i.idx};});
Z4.onWord(function(o){var c=curC;if(!c||c.got||!o.bonus||o.G!==c.g)return;c.got=1;var z=Z();if(z.dc!==c.c+1)return;z.dl|=1<<c.j;sv();
data().then(function(){var x=caseClues(c.c)[c.j];say('🔎 Улика «'+x.w+'»! '+x.t,'happy',6);ev('clue',{c:c.c,j:c.j});},function(){});});
Z4.onWin(function(i){var z=Z();if(curC&&i.idx===curC.idx)curC.won=1;if(!F.det||i.daily||i.mode)return;var c=0,ch=null;try{c=ZB.chapAt(i.idx);ch=ZB.chap(c);}catch(e){return;}
if(ch&&i.idx===ch.to&&z.dc===c+1&&z.dl&&z.dv<z.dc){z.dp=z.dc;sv();}});
function verdict(k){var z=Z();if(!z.dp||z.dv>=z.dp)return;var c=z.dp-1,cl=caseClues(c),ok=k===cl.cu,g=0;z.dv=z.dp;z.dp=0;
if(ok){z.dr=(z.dr|0)+1;g=give(10,'gift');}sv();ev('verdict',{c:c,ok:ok?1:0,n:0+(z.dl&1)+(z.dl>>1&1)+(z.dl>>2&1)+(z.dl>>3&1)});
var conf=tx('z4u.da'+cl.cu);note(ok?'Верно! '+conf:tx('z4u.dw')+' '+conf,ok&&g?'+'+g+' — пирожок сыщику':'',refresh);refresh();}
Z4.winLine.add({id:'z4u',order:55,txt:function(i){if(!F.det||!window.Z4U_DATA)return'';var z=Z();
if(curC&&curC.idx===i.idx&&curC.won){var r=curC;curC=null;if(r.got){var n=0;for(var j=0;j<4;j++)if(z.dl&(1<<j))n++;return'🔎 Улика в деле о пирожках: '+n+' из 4.';}return tx('z4u.dh');}
if(z.dp&&z.dv<z.dp)return'🥧 Дело о пирожках ждёт вердикта на Доме.';return'';}});
function night(){var on=isNight();if(on!==DE.classList.contains('z4u-night')){DE.classList.toggle('z4u-night',on);if(on)ev('night',{h:hour()});}
var sc=document.getElementById('zbScene'),L=document.getElementById('z4uLamp');
if(on&&sc&&!L){L=document.createElement('div');L.id='z4uLamp';L.innerHTML='<i>А</i><i>Я</i><i>Ё</i>';sc.appendChild(L);}
if(L){if(!on)L.parentNode.removeChild(L);else L.className=calm()?'calm':'';}}
function apr(){var on=isApr();DE.classList.toggle('z4u-apr',on);
if(on){var t=tk();var seen=0;try{seen=localStorage.getItem('z4u-at')===String(t);if(!seen)localStorage.setItem('z4u-at',String(t));}catch(e){}
if(!seen){ev('apr',{});data().then(function(){try{toast(tx('z4u.at'),4000);}catch(e){}},function(){});}}}
var tvI=0,tvT=0;
function tvItem(){var L=T('z4u.tv');if(!L.length)return null;var x=L[(dnum()*3+tvI)%L.length],p=x.split('|'),m=/\*([^*]+)\*/.exec(p[0]);
return{raw:p[0],txt:p[0].replace(/\*/g,''),e:m?m[1]:'',c:p[1]||''};}
function strip(){var sc=document.getElementById('zbScene'),el=document.getElementById('z4uStrip');
var mode=isApr()?'apr':isNight()?'night':F.tv&&Z4.open('z4u.tv')?'tv':'';
if(!sc||!mode||!window.Z4U_DATA){if(el)el.parentNode.removeChild(el);if(sc&&mode&&!window.Z4U_DATA)data().then(strip,function(){});return;}
css();if(!el){el=document.createElement('div');el.id='z4uStrip';}var an=document.getElementById('zbChips')||sc;
if(el.previousSibling!==an||el.parentNode!==an.parentNode)an.parentNode.insertBefore(el,an.nextSibling);
if(el.getAttribute('data-m')===mode&&mode!=='tv')return;el.setAttribute('data-m',mode);el.className=calm()?'calm':'';
if(mode==='apr'){el.innerHTML='<span class="z4u-run"><span>🙃 Двор вверх ногами — Ять постарался.</span></span><button type="button">Вернуть как было</button>';
el.onclick=function(){var z=Z();z.af=tk();sv();ev('aprback',{});apr();strip();};}
else if(mode==='night'){el.innerHTML='<span>🌙</span><span class="z4u-run"><span>'+esc(pick('z4u.nh','nh'+tk()))+'</span></span>';el.onclick=null;}
else{var it=tvItem();if(!it){el.parentNode.removeChild(el);return;}
el.innerHTML='<span>📺</span><span class="z4u-run"><span>'+esc(it.txt)+'</span></span>';el.onclick=function(){tvOpen();};}}
function tvOpen(){var it=tvItem();if(!it)return;ev('tv',{});var W=it.raw.split(' ');
ov('<h3>📺 Телевизор соседей</h3><p class="z4u-sm">В новости ошибка. Найди её — Зина напишет в телеканал.</p><p>'+
W.map(function(w,i){return'<button type="button" class="z4u-bt" data-w="'+i+'">'+esc(w.replace(/\*/g,''))+'</button>';}).join('')+'</p><p class="z4u-tvr"></p>'+
'<p><button type="button" class="z4u-bt" data-x>Закрыть</button></p>',function(b,close){var done=0;
[].forEach.call(b.querySelectorAll('[data-w]'),function(e){e.onclick=function(){if(done)return;var w=W[+e.getAttribute('data-w')],r=b.querySelector('.z4u-tvr');
if(w.indexOf('*')<0){r.textContent=tx('z4u.tw');return;}done=1;var z=Z(),t=tk();if(z.td!==t){z.td=t;z.tc=0;}z.tc++;z.tn=(z.tn|0)+1;sv();ev('tvl',{n:z.tn});
r.innerHTML='<span style="font-family:var(--z3-font-hand,cursive);font-size:20px">'+esc(tx('z4u.tl',{e:it.e,c:it.c}))+'</span><br><span class="z4u-sm">Писем в телеканал: '+z.tn+'</span>';
tvI++;strip();};});});}
function mailHook(){var P=window.Z3PAPER;if(!P||P.evMail&&P.evMail._z4u)return;var o=P.evMail,od=P.evMailDone;
P.evMail=function(){var a=arguments,self=this,b=o?Promise.resolve().then(function(){return o.apply(self,a);}):Promise.resolve(null);
return b.then(function(r){if(r)return r;if(!isApr())return null;var y=Math.floor(tk()/1e4),f='';try{f=localStorage.getItem('z4u-apl')||'';}catch(e){}
if(f===String(y))return null;return data().then(function(){var t=tx('z4u.ay');return t?{i:'z4uapr-'+y,h:'Письмо от кота Ятя',t:t}:null;});});};
P.evMail._z4u=1;
P.evMailDone=function(i){if(/^z4uapr-/.test(String(i||''))){try{localStorage.setItem('z4u-apl',String(i).slice(7));}catch(e){}ev('aprl',{});return;}
if(od)return od.apply(this,arguments);};
var k;if(o)for(k in o)if(!(k in P.evMail))P.evMail[k]=o[k];if(od)for(k in od)if(!(k in P.evMailDone))P.evMailDone[k]=od[k];P.evMailDone._z4u=1;}
var nW=0;
Z4.onWord(function(o){if(!isNight()||o.bonus||o.byHint)return;nW++;if(nW<4)return;if((h32('nw'+Date.now())%100)>=(isOK()?10:18))return;nW=0;
data().then(function(){var t=tx('z4u.ns');setTimeout(function(){if(typeof G!=='undefined'&&G===o.G&&!o.G.won)say(t,'norm',3.5);},900);},function(){});});
function yard(){ZB.safe('z4u-yard',function(){night();apr();strip();});}
Z3.whenReady(function(){ZB.safe('z4u-ready',function(){css();kuzDay();mailHook();papHook();yard();});
data().then(function(){ZB.safe('z4u-data',function(){yard();if(cardKind())refresh();});},function(){});});
ZB.on('yard',function(){mailHook();yard();});
ZB.on('z3late',function(){ZB.safe('z4u-late',mailHook);});
ZB.on('screen',function(){ZB.safe('z4u-scr',function(){night();mailHook();});});
setInterval(function(){ZB.safe('z4u-tick',function(){kuzDay();yard();});},60000);
U.dbg={Z:Z,isApr:isApr,isNight:isNight,isMorn:isMorn,caseClues:caseClues,clueLevels:clueLevels,cardKind:cardKind,horIdx:horIdx,zarWords:zarWords,tvItem:tvItem,ddCase:ddCase};
})();
