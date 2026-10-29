'use strict';
(function(){
var X=window.Z4LX,L=window.Z4L;if(!X||!L)return;
var N=9,M=4,BAG=56,RACK=7;
var BON={};[[1,1],[1,7],[7,1],[7,7]].forEach(function(p){BON[p[0]*N+p[1]]='w2';});
[[0,4],[4,0],[8,4],[4,8],[2,2],[2,6],[6,2],[6,6]].forEach(function(p){BON[p[0]*N+p[1]]='l2';});
function at(b,r,c){return r>=0&&c>=0&&r<N&&c<N?b[r*N+c]:null;}
function check(b,placed){if(!placed.length)return{err:'Поставь буквы на доску.'};
var t=b.slice(),empty=!b.some(function(x){return x;}),i,p;
for(i=0;i<placed.length;i++){p=placed[i];if(at(b,p.r,p.c))return{err:'Клетка занята.'};t[p.r*N+p.c]=p.ch;}
var rows={},cols={};placed.forEach(function(p){rows[p.r]=1;cols[p.c]=1;});
var nr=Object.keys(rows).length,nc=Object.keys(cols).length;if(nr>1&&nc>1)return{err:'Буквы — в одну линию: по строке или по столбцу.'};
var dir;if(placed.length>1)dir=nr===1?'h':'v';else{p=placed[0];dir=(at(t,p.r,p.c-1)||at(t,p.r,p.c+1))?'h':'v';}
var dr=dir==='h'?0:1,dc=dir==='h'?1:0,mn=placed[0],mx=placed[0];
placed.forEach(function(p){if(p.r*dr+p.c*dc<mn.r*dr+mn.c*dc)mn=p;if(p.r*dr+p.c*dc>mx.r*dr+mx.c*dc)mx=p;});
for(var r=mn.r,c=mn.c;r<=mx.r&&c<=mx.c;r+=dr,c+=dc)if(!at(t,r,c))return{err:'Без дырок: буквы должны идти подряд.'};
if(empty&&!placed.some(function(p){return p.r===M&&p.c===M;}))return{err:'Первое слово — через середину доски ★.'};
var isNew={};placed.forEach(function(p){isNew[p.r*N+p.c]=1;});
function line(r,c,a,bb){while(at(t,r-a,c-bb)){r-=a;c-=bb;}var w='',cells=[];while(at(t,r,c)){w+=t[r*N+c];cells.push(r*N+c);r+=a;c+=bb;}return{w:w,cells:cells};}
var W=[],m=line(mn.r,mn.c,dr,dc);if(m.w.length>=2)W.push(m);
placed.forEach(function(p){var x=line(p.r,p.c,dc,dr);if(x.w.length>=2)W.push(x);});
if(!W.length)return{err:'Одна буква — ещё не слово.'};
if(!empty&&!W.some(function(x){return x.cells.some(function(k){return!isNew[k];});}))return{err:'Слово должно касаться букв на доске.'};
for(i=0;i<W.length;i++)if(!X.isW(W[i].w))return{err:'«'+W[i].w.toUpperCase()+'» — не слово из моей тетради.',bad:W[i].w};
var pts=0;W.forEach(function(x){var s=0,k2=1;x.cells.forEach(function(k){var v=X.V[t[k]]||1;if(isNew[k]&&BON[k]==='l2')v*=2;if(isNew[k]&&BON[k]==='w2')k2*=2;s+=v;});pts+=s*k2;});
pts+=(W.length-1)*5;if(placed.length===RACK)pts+=15;
return{ok:1,words:W.map(function(x){return x.w;}),pts:pts};}
function moves(b,rack,want,maxChk){var have=X.cnt(rack.join('')),W=X.words(),out=[],chk=0,empty=!b.some(function(x){return x;});
var anc={},k;for(k=0;k<N*N;k++)if(b[k])(anc[b[k]]=anc[b[k]]||[]).push(k);
var order=X.shuffle(W.slice());
for(var wi=0;wi<order.length&&out.length<want&&chk<maxChk;wi++){var w=order[wi];if(w.length>RACK+1)continue;
var c=X.cnt(w),def=0,dl='',ch;for(ch in c)if(c[ch]>(have[ch]||0)){def+=c[ch]-(have[ch]||0);dl=ch;}
if(empty){if(def||w.length>RACK)continue;var s0=Math.max(0,Math.min(N-w.length,M-Math.floor(w.length/2)));
var pl=w.split('').map(function(x,j){return{r:M,c:s0+j,ch:x};});chk++;var res=check(b,pl);if(res.ok)out.push({pl:pl,pts:res.pts,words:res.words});continue;}
if(def>1)continue;
for(var i=0;i<w.length;i++){if(def===1&&w[i]!==dl)continue;var A=anc[w[i]];if(!A)continue;
for(var a=0;a<A.length;a++){var ar=Math.floor(A[a]/N),ac=A[a]%N;
for(var d=0;d<2;d++){var dr=d?1:0,dc=d?0:1,r0=ar-i*dr,c0=ac-i*dc,rN=r0+(w.length-1)*dr,cN=c0+(w.length-1)*dc;
if(r0<0||c0<0||rN>=N||cN>=N)continue;if(at(b,r0-dr,c0-dc)||at(b,rN+dr,cN+dc))continue;
var P=[],bad=0;for(var j=0;j<w.length;j++){var rr=r0+j*dr,cc=c0+j*dc;if(j===i)continue;if(at(b,rr,cc)){bad=1;break;}P.push({r:rr,c:cc,ch:w[j]});}
if(bad||!P.length)continue;chk++;var rs=check(b,P);if(rs.ok&&rs.words[0]!==undefined)out.push({pl:P,pts:rs.pts,words:rs.words});}}}}
return out;}
X.games.scr=function(sc){
var T=L.T,z=L.S()||{};
function intro(){sc.panel('galya',T('z4l.scr.hi')||'Сыграем в «Свою тетрадь»? Я сегодня добрая. Пока.',
[{t:'Галя — слабая',f:function(){z.gs=0;play();}},{t:'Галя — в ударе',cls:'',f:function(){z.gs=1;play();}}],
'<p class="z4l-rule">Ставь буквы на доску словом по линии, через уже стоящие буквы. Первое слово — через ★. Голубая клетка — буква ×2, розовая — слово ×2. За пересечения — по +5.</p>');}
function play(){
var b=[],bag=X.bag(BAG),me=[],gal=[],s={me:0,gal:0},pend=[],selI=-1,passes=0,turn='me',hint=1,over=0;for(var k=0;k<N*N;k++)b.push(null);
function fill(r){while(r.length<RACK&&bag.length)r.push(bag.pop());}fill(me);fill(gal);
var box=document.createElement('div');box.className='z4l-sc';
box.innerHTML='<div class="z4l-talk"></div><div class="z4l-brd"></div><div class="z4l-rack"></div>'+
'<div class="z4l-btns"><button class="btn" data-k="back">↩ Вернуть</button><button class="btn green" data-k="go">Ход</button></div>'+
'<div class="z4l-btns"><button class="btn" data-k="h">🤫 Зина шепчет</button><button class="btn" data-k="pass">Пас</button><button class="btn" data-k="end">Закончить</button></div>'+
'<p class="z4l-used z4l-bagn"></p>';
sc.el.innerHTML='';sc.el.appendChild(box);
var brd=box.querySelector('.z4l-brd'),rk=box.querySelector('.z4l-rack'),tk=box.querySelector('.z4l-talk'),bn=box.querySelector('.z4l-bagn');
function top(){sc.top('Я '+s.me+' : '+s.gal+' Галя');}
function draw(){top();var h='',pm={};pend.forEach(function(p){pm[p.r*N+p.c]=p;});
for(var i=0;i<N*N;i++){var x=b[i],p=pm[i],cls='z4l-c'+(BON[i]?' z4l-'+BON[i]:'')+(i===M*N+M?' z4l-mid':'')+(x?' z4l-f':'')+(p?' z4l-p':'');
h+='<button class="'+cls+'" data-c="'+i+'">'+(x?x.toUpperCase()+'<sub>'+X.V[x]+'</sub>':p?p.ch.toUpperCase()+'<sub>'+X.V[p.ch]+'</sub>':i===M*N+M?'★':BON[i]?'×2':'')+'</button>';}
brd.innerHTML=h;
rk.innerHTML=me.map(function(ch,i){var used=pend.some(function(p){return p.i===i;});
return'<button class="z4l-t'+(i===selI?' on':'')+(used?' z4l-u':'')+'" data-i="'+i+'"'+(used?' disabled':'')+'>'+ch.toUpperCase()+'<sub>'+X.V[ch]+'</sub></button>';}).join('');
bn.textContent='В мешке: '+bag.length+' · у Гали '+gal.length+' '+X.pl(gal.length,'буква','буквы','букв');
var dis=turn!=='me'||over;box.querySelectorAll('.z4l-btns .btn').forEach(function(x){x.disabled=dis;});
var hb=box.querySelector('[data-k=h]');if(hb&&!hint)hb.disabled=true;}
rk.onclick=function(e){var t=e.target.closest&&e.target.closest('[data-i]');if(!t||turn!=='me'||over)return;var i=+t.getAttribute('data-i');selI=selI===i?-1:i;try{SND.tap();}catch(x){}draw();};
brd.onclick=function(e){var t=e.target.closest&&e.target.closest('[data-c]');if(!t||turn!=='me'||over)return;var c=+t.getAttribute('data-c'),r=Math.floor(c/N);c=c%N;
var k=-1;pend.forEach(function(p,j){if(p.r===r&&p.c===c)k=j;});
if(k>=0){pend.splice(k,1);draw();return;}
if(at(b,r,c))return;if(selI<0){sc.talk(tk,'zina','Сначала выбери букву внизу, потом клетку.',1);return;}
pend.push({r:r,c:c,ch:me[selI],i:selI});selI=-1;try{SND.tap();}catch(x){}draw();};
function go(){if(turn!=='me'||over)return;var res=check(b,pend);
if(!res.ok){sc.talk(tk,'zina',res.err,1);return;}
pend.forEach(function(p){b[p.r*N+p.c]=p.ch;});var idx=pend.map(function(p){return p.i;});me=me.filter(function(x,i){return idx.indexOf(i)<0;});pend=[];selI=-1;
s.me+=res.pts;passes=0;fill(me);try{SND.word&&SND.word(Math.min(8,res.words[0].length),1);}catch(e){}
sc.talk(tk,'zina',(res.words.length>1?'Пересечение! ':'')+'«'+res.words[0].toUpperCase()+'» — +'+res.pts,1);
after();}
function after(){draw();if(endNow())return fin();turn='gal';draw();setTimeout(galMove,sc.calm?400:900);}
function endNow(){return over||!bag.length&&(!me.length||!gal.length)||passes>=2;}
function galMove(){if(sc.dead()||over)return;var mv=moves(b,gal,z.gs?40:10,z.gs?6000:1500);
if(mv.length){mv.sort(function(a,c){return c.pts-a.pts;});var m=z.gs?mv[0]:mv[Math.floor(mv.length/2+Math.random()*mv.length/2)];
m.pl.forEach(function(p){b[p.r*N+p.c]=p.ch;var j=gal.indexOf(p.ch);if(j>=0)gal.splice(j,1);});s.gal+=m.pts;passes=0;fill(gal);
sc.talk(tk,'galya','«'+m.words[0].toUpperCase()+'» — +'+m.pts+(m.words.length>1?', с пересечением':'')+'. '+(T('z4l.scr.gal')||''));}
else{passes++;sc.talk(tk,'galya',T('z4l.scr.pass')||'Пас. Буквы у меня сегодня — как пенсия: не разгуляешься.');}
turn='me';draw();if(endNow())fin();}
function fin(){if(over)return;over=1;turn='';pend=[];draw();var w=s.me>s.gal?'me':s.gal>s.me?'gal':'d';
X.finish(sc,'scr',{w:w,sc:s.me,c:w==='me'?5:2},'galya',T(w==='me'?'z4l.scr.lose':w==='gal'?'z4l.scr.win':'z4l.scr.draw')||(w==='me'?'Твоя взяла.':'Моя взяла!'),
'<b>'+(w==='me'?'Победа над Галей':w==='gal'?'Галя победила':'Ничья')+'</b> · '+s.me+' : '+s.gal);}
box.querySelector('[data-k=go]').onclick=go;
box.querySelector('[data-k=back]').onclick=function(){pend=[];selI=-1;draw();};
box.querySelector('[data-k=pass]').onclick=function(){if(turn!=='me'||over)return;pend=[];selI=-1;passes++;sc.talk(tk,'zina','Пас — тоже ход.',1);after();};
box.querySelector('[data-k=end]').onclick=function(){if(turn!=='me'||over)return;fin();};
box.querySelector('[data-k=h]').onclick=function(){if(!hint||turn!=='me'||over)return;var mv=moves(b,me,15,3000);hint=0;
if(!mv.length){sc.talk(tk,'zina','Шепчу: тут и я не вижу. Пасуй смело.',1);draw();return;}mv.sort(function(a,c){return c.pts-a.pts;});
sc.talk(tk,'zina','Шепчу: попробуй «'+mv[0].words[0].toUpperCase()+'».',1);draw();};
sc.keys(function(k){if(over||turn!=='me'||!box.parentNode)return false;if(k==='Enter'){go();return true;}
var c=String(k).toLowerCase();for(var i=0;i<me.length;i++)if(me[i]===c&&!pend.some(function(p){return p.i===i;})){selI=i;draw();return true;}return false;});
draw();sc.talk(tk,'galya',T('z4l.scr.go')||'Ходи первой. Я пока очки протру.',1);}
intro();};
X.scr={check:check,moves:moves,N:N};
})();
