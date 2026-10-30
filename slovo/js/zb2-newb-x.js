'use strict';
(function(){
var N=window.ZB2N;if(!N)return;
function $(id){return document.getElementById(id);}
var ev=N.ev,Z=N.z;
function inGame(){return typeof G!=='undefined'&&G&&!G.won&&$('game')&&$('game').classList.contains('on')&&!$('modal').classList.contains('on')&&!document.hidden&&!(typeof paused!=='undefined'&&paused);}
function foundN(){return G.words.filter(function(w){return w.found;}).length;}
function shortestOpen(){var a=G.words.filter(function(w){return!w.found;}).sort(function(a,b){return a.w.length-b.w.length;});return a[0]||null;}
function letIdx(w){var r=[],used={};for(var k=0;k<w.length;k++){for(var j=0;j<G.letters.length;j++)if(G.letters[j]===w[k]&&!used[j]){used[j]=1;r.push(j);break;}}return r;}
function upw(w){return w.toUpperCase().split('').join(' → ');}
function els(){return(typeof WH!=='undefined'&&WH.els)||[].slice.call(document.querySelectorAll('#wheel .let'));}
function unnum(){[].forEach.call(document.querySelectorAll('#wheel .zn-num'),function(e){e.remove();});
[].forEach.call(document.querySelectorAll('#wheel .zn-sp'),function(e){e.classList.remove('zn-sp');});}
function num(e,k){var b=document.createElement('i');b.className='nbn zn-num';b.textContent=k+1;e.appendChild(b);}
function numbers(w){unnum();var E=els();letIdx(w).forEach(function(i,k){var e=E[i];if(!e)return;e.classList.remove('nbp');void e.offsetWidth;e.classList.add('nbp');num(e,k);});}
function hand(w){if(typeof startTutorial!=='function'||typeof shortestWord!=='function')return;
var sw=shortestWord;shortestWord=function(){return w;};try{startTutorial();}finally{shortestWord=sw;}}
var L1={g:null,f:0,t:0,s1:0,s3:0,busy:0},timer=0;
var L1_HAND=4000,L1T=0;
document.addEventListener('pointerdown',function(e){var w=$('wheel');if(w&&e.target&&w.contains(e.target))L1T=Date.now();},true);
function spell(wd,why){var g=G,ix=letIdx(wd.w),E=els(),k=0,up=wd.w.toUpperCase().split('');L1.busy=1;unnum();
if(typeof stopTutorial==='function')stopTutorial();
ev({a:'auto1',l:1,ms:Date.now()-g.t0,w:why,m:g.miss||0});
function end(){unnum();L1.busy=0;L1.t=Date.now();L1.s1=L1.s3=0;}
function step(){if(G!==g||g.won||wd.found){end();return;}
if(k<ix.length){var e=E[ix[k]];if(e){e.classList.add('zn-sp');num(e,k);}
zina('Давай вместе: '+up.slice(0,k+1).join('… ')+(k+1<up.length?'…':'!'),'happy',99);
if(typeof SND!=='undefined'&&SND.tap)SND.tap();k++;setTimeout(step,650);return;}
setTimeout(function(){end();if(G===g&&!g.won&&!wd.found)submit(wd.w);},350);}
step();}
function tick(){if(!N.l1On()||L1.busy||(typeof dragging!=='undefined'&&dragging))return;
if(L1.g!==G)L1={g:G,f:foundN(),t:Date.now(),s1:0,s3:0,busy:0};
var f=foundN(),now=Date.now();if(f!==L1.f){L1.f=f;L1.t=now;L1.s1=L1.s3=0;unnum();return;}
var w=shortestOpen();if(!w)return;var idle=now-L1.t,m=G.miss||0,still=now-Math.max(L1.t,L1T);
if(G.tut){if(m>=6||idle>=40000)spell(w,m>=6?'miss':'idle');return;}
if(m>=4||idle>=20000){spell(w,m>=4?'miss':'idle');return;}
if(!L1.s1&&(m>=2||still>=L1_HAND)){L1.s1=1;numbers(w.w);hand(w.w);
zina('Смотри на цифры: '+upw(w.w)+'. Веди по порядку!','happy',8);ev({a:'help1',l:1,ms:now-G.t0,w:m>=2?'miss':'idle'});}
else if(L1.s1&&m>=3&&!L1.s3){L1.s3=1;numbers(w.w);}}
function l1(){L1.g=null;if(!timer)timer=setInterval(function(){if(!N.l1On()){if(S.lv>0){clearInterval(timer);timer=0;}return;}if(inGame())ZB.safe('nb2:l1t',tick);},500);}
function calm(){try{return typeof CALM==='function'&&CALM();}catch(e){return false;}}
function cg(then){var c=window.ZBCAB,o=N.CG();if(!c||c.lv(o.id)||Z().cg){then();return;}
ZB.safe('nb2:grant',function(){c.grant(1);});if(!c.lv(o.id)){then();return;}
Z().cg=1;save();
if(window.RSD&&RSD.on){ev({a:'cab8',l:o.at,c:S.coins,q:1});ZB.safe('nb2:cgnote',function(){RSD.note('cab');});then();return;}
if(window.ZBNB&&ZBNB.turn)ZBNB.turn('cab');
var row=(window.ZBECO&&ZBECO.cab||[]).filter(function(r){return r.id===o.next;})[0],nxN=row&&row.n||'Столовая тёти Вали',nxP=c.price(o.next)||(row&&row.p&&row.p[0])||250;
ev({a:'cab8',l:o.at,c:S.coins});
modal('<div class="zn-cg"><h2>🔑 Ключ от класса русского</h2>'+
'<div class="zn-cgs"><div class="zn-cgk">🔑</div><div class="zn-cgvp">'+(window.ZBP&&ZBP.bust?ZBP.bust('vp','happy'):'')+'</div></div>'+
'<p class="zn-cg1">Вера Павловна принимает класс…</p>'+
'<div class="zn-cg2"><p class="zn-cgt"><b>Класс русского — твой!</b> Отремонтирован даром.</p>'+
'<p class="zn-cgw">📖 Тут доска со словом дня и «Красный уголок».</p>'+
'<p class="zn-cgn">Следующий: <b>'+ZB.esc(nxN)+'</b> — '+nxP+' '+COIN_I+', у тебя '+S.coins+' '+COIN_I+'</p>'+
'<div class="btns"><button class="btn green" id="znCgGo">Дальше ▶</button><button class="btn ghost small" id="znCgSch">🏫 Посмотреть класс</button></div></div></div>');
var m=$('mcard');setTimeout(function(){var w=m&&m.querySelector('.zn-cg');if(w)w.classList.add('on');},calm()?0:2000);
$('znCgGo').onclick=function(){hideModal();if(typeof SND!=='undefined')SND.tap();then();};
$('znCgSch').onclick=function(){hideModal();if(typeof SND!=='undefined')SND.tap();ZB.safe('nb2:cgsch',function(){if(c.go)c.go(o.id);else ZB.go('school');});};}
function ask(){var tries=0;setTimeout(function try1(){ZB.safe('nb2:ask',function(){if(!$('menu').classList.contains('on')||Z().ak&1)return;
if($('modal').classList.contains('on')){if(++tries<30)setTimeout(try1,1000);return;}
var o=N.ask();if(!o)return;if(window.RSD&&RSD.one&&!RSD.one('ask'))return;
Z().ak|=1;save();ev({a:'ask',d:1,k:o.k});
modal('<div class="zn-ask"><div class="zn-askz">'+(typeof zinaSVG==='function'?zinaSVG('happy'):'')+'</div><h2>До завтра?</h2><p>'+ZB.esc(o.t)+'</p>'+
'<div class="btns"><button class="btn green" id="znAskY">'+ZB.esc(o.b||'🔔 Напоминать')+'</button><button class="btn ghost small" id="znAskN">Не надо</button></div></div>');
$('znAskY').onclick=function(){this.disabled=true;Promise.resolve(o.run()).then(function(ok){hideModal();if(ok&&typeof toast==='function')toast(o.ok||'Хорошо, напомню!',3000);},function(){hideModal();});};
$('znAskN').onclick=function(){hideModal();};});},1200);}
N.X={l1:l1,cg:cg,ask:ask,spell:spell,numbers:numbers};
})();
