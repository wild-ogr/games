'use strict';
(function(){
var X=window.Z4LX,L=window.Z4L;if(!X||!L)return;
var TURNS=4,HINTS=2;
function okp(){try{return typeof OK!=='undefined'&&!!OK;}catch(e){return false;}}
function src(){var W=X.words(),r=Math.random,best=null,bn=0;
var long=W.filter(function(w){return w.length>=7;});
for(var t=0;t<40&&long.length;t++){var w=long[Math.floor(r()*long.length)],c=X.cnt(w),sub=W.filter(function(x){return x!==w&&X.fits(x,c);});
if(sub.length>bn){bn=sub.length;best={w:w,sub:sub};}if(bn>=14)break;}
return best;}
X.games.vnuk=function(sc){
var T=L.T,P=src();if(!P){sc.panel('zina','Буквы рассыпались — попробуй ещё раз.',[{t:'Закрыть',f:function(){sc.close();}}]);return;}
var st={p:'g',n:0,s:{g:0,v:0},used:{},hints:HINTS,first:'g'},NM={g:'Бабушка',v:'Внук'},IC={g:'👵',v:'👦'},TT=okp()?50:40,tm=0,talk='';
function score(){sc.top(IC.g+' '+st.s.g+' : '+st.s.v+' '+IC.v);}
function intro(){sc.panel('zina',T('z4l.vnuk.hi')||'Бабушка и внук за одним столом. Телефон один, ходы по очереди.',
[{t:'Начинает бабушка',f:function(){st.first=st.p='g';hand();}},{t:'Начинает внук',cls:'',f:function(){st.first=st.p='v';hand();}}],
'<p class="z4l-rule">Из букв слова «'+P.w.toUpperCase()+'» собирайте слова по очереди. По '+TURNS+' хода каждому. У внука — таймер, у бабушки — подсказки.</p>');}
function hand(){clearInterval(tm);score();
if(st.n>=TURNS*2)return end();
var t=st.p==='v'?(T('z4l.vnuk.tov')||'Передай телефон внуку. Часы пойдут, когда он нажмёт.'):(T('z4l.vnuk.tog')||'Телефон — бабушке. У бабушки времени сколько угодно.');
sc.panel('zina',t,[{t:st.p==='v'?'Я внук — поехали!':'Я бабушка — мой ход',f:turn}]);}
function turn(){var me=st.p,sel=[],left=TT,box=document.createElement('div');box.className='z4l-vn z4l-vn-'+me;
var letters=P.w.split('');
box.innerHTML='<div class="z4l-who">'+IC[me]+' Ход: <b>'+NM[me]+'</b>'+(me==='v'?' <span class="z4l-tm"><i></i></span>':'')+'</div>'+
'<div class="z4l-talk"></div><div class="z4l-cur" aria-live="polite"></div>'+
'<div class="z4l-tiles">'+letters.map(function(c,i){return'<button class="z4l-t" data-i="'+i+'">'+c.toUpperCase()+'<sub>'+X.V[c]+'</sub></button>';}).join('')+'</div>'+
'<div class="z4l-btns"><button class="btn" data-k="x">⌫ Стереть</button><button class="btn green" data-k="ok">Готово</button></div>'+
'<div class="z4l-btns">'+(me==='g'?'<button class="btn" data-k="h">🤫 Зина шепчет ('+st.hints+')</button>':'')+'<button class="btn" data-k="pass">Пропустить ход</button></div>'+
'<p class="z4l-used">'+used()+'</p>';
sc.el.innerHTML='';sc.el.appendChild(box);var cur=box.querySelector('.z4l-cur'),tk=box.querySelector('.z4l-talk'),dead=0;
if(talk)sc.talk(tk,'zina',talk,1);
function draw(){cur.textContent=sel.map(function(i){return letters[i];}).join('').toUpperCase()||' ';
box.querySelectorAll('.z4l-t').forEach(function(b){b.classList.toggle('on',sel.indexOf(+b.getAttribute('data-i'))>=0);});
var h=box.querySelector('[data-k=h]');if(h){h.disabled=st.hints<=0;h.textContent='🤫 Зина шепчет ('+st.hints+')';}}
function tap(i){var k=sel.indexOf(i);if(k>=0){if(k===sel.length-1)sel.pop();}else sel.push(i);try{SND.tap();}catch(e){}draw();}
box.querySelectorAll('.z4l-t').forEach(function(b){b.onclick=function(){tap(+b.getAttribute('data-i'));};});
function next(pts,w){if(dead)return;dead=1;clearInterval(tm);st.s[me]+=pts;if(w)st.used[w]=me;st.n++;st.p=me==='g'?'v':'g';
talk=pts?(T('z4l.vnuk.ok'+me,{w:w.toUpperCase(),n:pts})||(NM[me]+': «'+w.toUpperCase()+'» — +'+pts)):(T('z4l.vnuk.skip')||'Ход пропущен — бывает.');hand();}
function ok(){if(dead)return;var w=sel.map(function(i){return letters[i];}).join('');
if(w.length<3)return sc.talk(tk,'zina','Слово — от трёх букв.',1);
if(st.used[w])return sc.talk(tk,'zina','«'+w.toUpperCase()+'» уже было — у '+(st.used[w]==='g'?'бабушки':'внука')+'.',1);
if(!X.isW(w)){sel=[];draw();return sc.talk(tk,'zina',T('z4l.vnuk.no',{w:w.toUpperCase()})||'«'+w.toUpperCase()+'» в тетрадь не пишу. Ещё раз!',1);}
try{SND.word&&SND.word(w.length,1);}catch(e){}next(w.length+(w.length>=6?2:0),w);}
box.querySelector('[data-k=x]').onclick=function(){sel.pop();draw();};
box.querySelector('[data-k=ok]').onclick=ok;
box.querySelector('[data-k=pass]').onclick=function(){next(0,'');};
var hb=box.querySelector('[data-k=h]');if(hb)hb.onclick=function(){if(st.hints<=0)return;var f=P.sub.filter(function(x){return!st.used[x];});
if(!f.length)return sc.talk(tk,'zina','Всё уже нашли! Пропускай ход.',1);var w=f[Math.floor(Math.random()*f.length)];st.hints--;draw();
sc.talk(tk,'zina','Шепчу: начинается на «'+w[0].toUpperCase()+'», '+w.length+' '+X.pl(w.length,'буква','буквы','букв')+'.',1);};
sc.keys(function(k){if(dead||!box.parentNode)return false;if(k==='Enter'){ok();return true;}if(k==='Backspace'){sel.pop();draw();return true;}
var c=String(k).toLowerCase();for(var i=0;i<letters.length;i++)if(letters[i]===c&&sel.indexOf(i)<0){tap(i);return true;}return false;});
if(me==='v'){var bar=box.querySelector('.z4l-tm i');tm=setInterval(function(){if(sc.dead()){clearInterval(tm);return;}left--;
if(bar)bar.style.width=Math.max(0,left/TT*100)+'%';if(left<=0){talk=T('z4l.vnuk.time')||'Время вышло — ход бабушке.';next(0,'');}},1000);}
draw();}
function used(){var a=Object.keys(st.used);return a.length?'Было: '+a.map(function(w){return IC[st.used[w]]+w;}).join(', '):'';}
function end(){var g=st.s.g,v=st.s.v,w=g>v?'g':v>g?'v':'d',k=w==='g'?'z4l.vnuk.wg':w==='v'?'z4l.vnuk.wv':'z4l.vnuk.wd';
var head=w==='g'?'Бабушка победила внука':w==='v'?'Внук победил бабушку':'Ничья за одним столом';
X.finish(sc,'vnuk',{w:w,sc:Math.max(g,v),c:2},'zina',T(k)||head+'!',
'<b>'+head+'</b> · '+IC.g+' '+g+' : '+v+' '+IC.v);}
intro();};
})();
