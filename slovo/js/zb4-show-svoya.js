'use strict';
(function(){
var W=window.Z4W,X=window.Z4WX;if(!W||!X)return;
var DATA=['js/zmg-zagadki-data.js','js/zmg-loto-data.js','js/zmg-pogovorka-data.js','js/zmg-lishnee-data.js'],TURNS=7;
function low(s){return String(s).toLowerCase().replace(/ё/g,'е');}
function stemIn(w,d){w=low(w);var s=w.slice(0,Math.max(3,Math.min(5,w.length-2)));return low(d).indexOf(s)>=0;}
function cap(t){t=String(t||'');return t.charAt(0).toUpperCase()+t.slice(1);}
function topics(r){var T=[],A;
var Zg=window.ZMG_ZAGADKI&&ZMG_ZAGADKI.items;
if(Zg&&Zg.length>=8){A=Zg.map(function(x){return x[0];});T.push({t:'Загадки Семёна',mk:function(v){var x=Zg[Math.floor(r()*Zg.length)],cl=x.slice(1),n=Math.max(1,Math.min(cl.length,6-v/100));
return{q:cl.slice(0,n).join(' '),o:wrong(x[0],A,3)};}});}
var Lt=window.ZMG_LOTO&&ZMG_LOTO.items;
if(Lt&&Lt.length>=8){A=Lt.map(function(x){return x.a;});T.push({t:'Лото Митяя',mk:function(){var x=Lt[Math.floor(r()*Lt.length)];return{q:String(x.c),o:wrong(x.a,A,3)};}});}
var Pg=window.ZMG_POGOV&&ZMG_POGOV.own;
if(Pg&&Pg.length>=8)T.push({t:'Поговорки',mk:function(){var x=Pg[Math.floor(r()*Pg.length)];var o=[x[2]].concat((x[3]||[]).slice(0,2));
return{q:x[1]+' …',o:o,a:0};}});
var Ls=window.ZMG_LISHNEE&&ZMG_LISHNEE.s;
if(Ls&&Ls.length>=8)T.push({t:'Что лишнее?',mk:function(){var x=Ls[Math.floor(r()*Ls.length)];return{q:'Что здесь лишнее?',o:x[1].slice(),a:x[2],ex:x[4]};}});
var G=gloss(r);
if(G.length>=8){A=G.map(function(x){return x.w;});T.unshift({t:'Толковый словарь',mk:function(v){var P=G.filter(function(x){return Math.abs(x.w.length-(3+v/100))<=1;});if(P.length<1)P=G;
var x=P[Math.floor(r()*P.length)];return{q:cap(x.d),o:wrong(x.w,A,3)};}});}
while(T.length<5&&G.length>=8)T.push({t:'Толковый словарь '+(T.length+1),mk:T[0].mk});
return T.slice(0,5);
function wrong(a,all,n){var o=[a],tries=0;while(o.length<n+1&&tries++<200){var w=all[Math.floor(r()*all.length)];if(o.indexOf(w)<0)o.push(w);}
return{o:o};}}
function gloss(r){var L=[];try{L=(window.ZMG&&ZMG.words({min:3,max:8,def:true}))||[];}catch(e){}var out=[];
for(var i=0;i<L.length&&out.length<80;i++){var d='';try{d=ZMG.def(L[i]);}catch(e){}if(d&&!stemIn(L[i],d)&&d.length<=140)out.push({w:L[i],d:d});}return out;}
function ask(t,v,r){var q=t.mk(v);if(q.o&&q.o.o){var right=q.o.o[0],o=X.shuffle(q.o.o.slice(),r);return{q:q.q,o:o.map(cap),a:o.indexOf(right),ex:''};}
var o2=q.o.map(function(x,i){return{t:x,ok:i===q.a};});X.shuffle(o2,r);return{q:q.q,o:o2.map(function(x){return cap(x.t);}),a:o2.map(function(x){return x.ok;}).indexOf(true),ex:q.ex||''};}
X.svoyaQ={topics:topics,ask:ask};
X.shows.svoya=function(sc){var z=W.S()||{},r=X.rng((W.tk()||1)*7+(z.n||0)),prep=Math.max(z.p||0,z.pl||0),help=prep>=400?3:prep>=150?2:prep>=30?1:0;
sc.el.innerHTML='<p class="z4w-wait">Зина раскладывает табло…</p>';
Promise.all(DATA.map(function(f){return ZB.load(f).catch(function(){return null;});})).then(function(){if(!sc.root.parentNode)return;
var T=topics(r);if(T.length<3){sc.panel('zina','Табло сегодня не собралось — пройди ещё пару уровней, и в четверг сыграем.',[{t:'Закрыть',f:sc.close}]);return;}
var cat=1+Math.floor(r()*4),catT=Math.floor(r()*T.length),used={},score=0,turn=0;
var hi=W.T('z4w.svoya.hi')||'«Табло у Зины»! Выбирай клетку.';
sc.panel('zina',hi+(help?' '+'Подсказок Зины: '+help+' (готовилась: '+prep+' слов).':''),[{t:'Начать',f:board}]);
function board(){sc.top((turn+1)+'/'+TURNS+' · '+score);
var h='<div class="z4w-board" style="--z4w-cols:'+T.length+'">'+T.map(function(t){return'<div class="z4w-th">'+W.esc(t.t)+'</div>';}).join('');
for(var row=0;row<5;row++)for(var c=0;c<T.length;c++){var k=c+'_'+row;h+='<button class="z4w-cell'+(used[k]?' used':'')+'" data-k="'+k+'"'+(used[k]?' disabled':'')+'>'+(used[k]?'':(row+1)*100)+'</button>';}
sc.el.innerHTML=h+'</div>'+(sc.pc?'<p class="z4w-hint">Клетку выбирай мышкой; Esc — выйти</p>':'');
sc.el.querySelectorAll('.z4w-cell:not(.used)').forEach(function(b){b.onclick=function(){try{SND.tap();}catch(e){}pick(b.getAttribute('data-k'));};});}
function pick(k){used[k]=1;var p=k.split('_'),c=+p[0],row=+p[1],v=(row+1)*100,t=T[c];
if(row===cat&&c===catT){v*=2;var o=(c+1+Math.floor(r()*(T.length-1)))%T.length;t=T[o];
sc.panel('yat',W.T('z4w.svoya.cat')||'Кот в мешке! Вопрос двойной цены.',[{t:'Давай вопрос',f:function(){q(t,v,'«Кот в мешке» · '+T[o].t);}}]);return;}
q(t,v,t.t+' · '+v);}
function q(t,v,lab){var Qn=ask(t,Math.min(500,v),r);sc.top((turn+1)+'/'+TURNS+' · '+score);
sc.el.innerHTML='<div class="z4w-q"><p class="z4w-ql">'+W.esc(lab)+'</p><p class="z4w-qt">'+W.esc(Qn.q)+'</p></div>';
var od=X.opts(sc,Qn.o,function(i,d){var ok=i===Qn.a;d.querySelectorAll('.z4w-opt').forEach(function(b,j){b.disabled=true;if(j===Qn.a)b.classList.add('ok');else if(j===i)b.classList.add('no');});
if(ok){score+=v;try{SND.word(5,0);}catch(e){}}else{try{SND.bad();}catch(e){}}
turn++;var said=ok?W.T('z4w.svoya.ok'):W.T('z4w.svoya.no',{w:Qn.o[Qn.a]});
var nx=document.createElement('div');nx.className='z4w-after';nx.innerHTML=sc.say('zina',said||(ok?'Верно!':'Правильно: '+Qn.o[Qn.a]))+(Qn.ex?'<p class="z4w-ex">'+W.esc(Qn.ex)+'</p>':'')+
'<div class="z4w-btns"><button class="btn green">'+(turn>=TURNS?'Итог':'Дальше')+(sc.pc?' <kbd class="z4w-kc">Enter</kbd>':'')+'</button></div>';
sc.el.appendChild(nx);var go=0,b=nx.querySelector('button');b.onclick=function(){if(go)return;go=1;try{SND.tap();}catch(e){}if(turn>=TURNS)end();else board();};
sc.keys(function(k){if(go||!nx.parentNode)return false;if(k==='Enter'||k===' '){b.click();return true;}return false;});try{b.focus();}catch(e){}});
sc.el.appendChild(od);
if(help>0&&Qn.o.length>=4){var hb=document.createElement('div');hb.className='z4w-btns';hb.innerHTML='<button class="btn sec z4w-help">✏️ Подсказка Зины ('+help+')</button>';sc.el.appendChild(hb);
hb.querySelector('button').onclick=function(){if(help<=0)return;help--;var n=0;try{SND.open();}catch(e){}
od.querySelectorAll('.z4w-opt').forEach(function(b,j){if(j!==Qn.a&&n<2&&!b.disabled){b.disabled=true;b.classList.add('off');n++;}});hb.remove();
var s=document.createElement('p');s.className='z4w-ex';s.textContent=W.T('z4w.svoya.help')||'Два лишних я вычеркнула.';sc.el.insertBefore(s,od);};}}
function end(){var coins=Math.min(10,Math.ceil(score/300));
X.finish(sc,'svoya',score,coins,'zina',W.T('z4w.svoya.end',{n:score})||('Итог: '+score+' очков.'));}
sc.onClose(function(){if(turn<TURNS)window.Z4&&Z4.ev('z4w',{a:'quit',id:'svoya',sc:score,t:turn});});
});};
})();
