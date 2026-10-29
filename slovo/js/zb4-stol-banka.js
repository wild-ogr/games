'use strict';
(function(){
var X=window.Z4LX,L=window.Z4L;if(!X||!L)return;
function okp(){try{return typeof OK!=='undefined'&&!!OK;}catch(e){return false;}}
X.games.banka=function(sc){
var T=L.T,C=6,R=(window.innerHeight||800)<700?7:8,ok=okp();
function intro(){sc.panel('zina',T('z4l.banka.hi')||'Буквы сыплются в банку. Собирай слова, пока банка не переполнилась.',[{t:'Начать',f:play}],
'<p class="z4l-rule">Нажимай соседние буквы по порядку (можно наискосок) и жми «✓». Одинаковые буквы сливаются — очков больше, места тоже.</p>');}
function play(){
var g=[],sel=[],sc0=0,nid=0,spawned=0,over=0,tm=0,words=0;for(var c=0;c<C;c++)g.push([]);
var box=document.createElement('div');box.className='z4l-bk';
box.innerHTML='<div class="z4l-talk"></div><div class="z4l-jar"><div class="z4l-lid"></div></div><div class="z4l-cur" aria-live="polite"> </div>'+
'<div class="z4l-btns"><button class="btn" data-k="x">✕ Сбросить</button><button class="btn green" data-k="ok">✓ Слово</button></div>';
sc.el.innerHTML='';sc.el.appendChild(box);
var jar=box.querySelector('.z4l-jar'),cur=box.querySelector('.z4l-cur'),tk=box.querySelector('.z4l-talk');
var cw=Math.floor(Math.min(box.clientWidth||340,420)/C);if(cw>64)cw=64;if(cw<44)cw=44;
jar.style.width=cw*C+'px';jar.style.height=cw*R+'px';
function top(){sc.top('Очки: '+sc0);}top();
function pos(t,c,r){t.c=c;t.r=r;t.el.style.left=c*cw+'px';t.el.style.top=(R-1-r)*cw+'px';}
function mk(ch,c){var t={ch:ch,m:1,id:++nid},e=document.createElement('button');e.className='z4l-bt';e.style.width=e.style.height=(cw-4)+'px';
e.innerHTML=ch.toUpperCase()+'<sub>'+X.V[ch]+'</sub>';t.el=e;e.onclick=function(){tap(t);};return t;}
function lab(t){t.el.innerHTML=t.ch.toUpperCase()+'<sub>'+X.V[t.ch]*t.m+'</sub>'+(t.m>1?'<i>×'+t.m+'</i>':'');t.el.classList.toggle('z4l-m',t.m>1);}
function letter(){var n=0,v=0;g.forEach(function(col){col.forEach(function(t){n++;if(X.VOW.indexOf(t.ch)>=0)v++;});});
return X.pick(Math.random,Math.random()<(n&&v/n<.38?.65:.42));}
function drop(c,ch,fast){var col=g[c],t0=col[col.length-1];
if(t0&&t0.ch===ch&&t0.m<8&&sel.indexOf(t0)<0){t0.m*=2;lab(t0);t0.el.classList.remove('z4l-pop');void t0.el.offsetWidth;t0.el.classList.add('z4l-pop');return true;}
if(col.length>=R)return false;var t=mk(ch,c);col.push(t);jar.appendChild(t.el);
if(!fast&&!sc.calm){t.el.style.left=c*cw+'px';t.el.style.top=-cw+'px';void t.el.offsetWidth;}pos(t,c,col.length-1);return true;}
var qw=/[?&]z4lbk=([^&]+)/.exec(location.search),qf=/[?&]z4lbf=1/.test(location.search);qw=qw?decodeURIComponent(qw[1]).slice(0,C):'';
for(var i=0;i<10;i++)drop(i%C,i<qw.length?qw[i]:letter(),1);
function iv(){return qf?120:Math.max(ok?1300:950,(ok?3000:2400)*Math.pow(.975,spawned));}
function tick(){if(over||sc.dead())return;if(!document.hidden){spawned++;if(!drop(Math.floor(Math.random()*C),letter()))return end();}tm=setTimeout(tick,iv());}
tm=setTimeout(tick,iv());sc.onClose(function(){clearTimeout(tm);over=1;});
function draw(){cur.textContent=sel.map(function(t){return t.ch;}).join('').toUpperCase()||' ';
g.forEach(function(col){col.forEach(function(t){t.el.classList.toggle('on',sel.indexOf(t)>=0);});});}
function adj(a,b){return Math.abs(a.c-b.c)<=1&&Math.abs(a.r-b.r)<=1;}
function tap(t){if(over)return;var k=sel.indexOf(t);if(k>=0)sel=sel.slice(0,k);else if(!sel.length||adj(sel[sel.length-1],t))sel.push(t);else sel=[t];
try{SND.tap();}catch(e){}draw();}
function word(){if(over)return;var w=sel.map(function(t){return t.ch;}).join('');
if(w.length<3){sc.talk(tk,'zina','Слово — от трёх букв.',1);return;}
if(!X.isW(w)){sel=[];draw();if(!sc.calm){jar.classList.remove('z4l-no');void jar.offsetWidth;jar.classList.add('z4l-no');}
sc.talk(tk,'zina',T('z4l.banka.no',{w:w.toUpperCase()})||'«'+w.toUpperCase()+'» — нет такого слова в банке.',1);return;}
var p=0;sel.forEach(function(t){p+=X.V[t.ch]*t.m;});if(w.length>=5)p*=2;sc0+=p;words++;top();
sel.forEach(function(t){var col=g[t.c];col.splice(col.indexOf(t),1);t.el.remove();});sel=[];
g.forEach(function(col,c){col.forEach(function(t,r){pos(t,c,r);});});draw();
try{SND.word&&SND.word(w.length,1);}catch(e){}
if(w.length>=5||Math.random()<.3)sc.talk(tk,'zina',T(w.length>=5?'z4l.banka.big':'z4l.banka.ok',{w:w.toUpperCase(),n:p})||'«'+w.toUpperCase()+'» — +'+p);}
box.querySelector('[data-k=x]').onclick=function(){sel=[];draw();};
box.querySelector('[data-k=ok]').onclick=word;
sc.keys(function(k){if(over||!box.parentNode)return false;if(k==='Enter'){word();return true;}if(k==='Backspace'){sel.pop();draw();return true;}return false;});
function end(){over=1;clearTimeout(tm);var b=(L.S()||{}).bb||0;
X.finish(sc,'banka',{sc:sc0,c:Math.min(5,Math.floor(sc0/40))},'zina',
(sc0>b&&sc0>0?T('z4l.banka.best'):T('z4l.banka.end'))||'Банка полна! '+(sc0>b?'Это рекорд.':''),
'<b>'+sc0+'</b> '+X.pl(sc0,'очко','очка','очков')+' · '+words+' '+X.pl(words,'слово','слова','слов')+(b&&sc0<=b?' · рекорд '+b:''));}
sc.talk(tk,'zina',T('z4l.banka.go')||'Сыплю! Не зевай.',1);}
intro();};
})();
