(function(){'use strict';
var W=window,D=document;
if(!W.V3||!W.VY||!V3.reg)return;
function L(a,b){return VY.L(a,b);}
function ok(f,d){try{return f();}catch(e){return d;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ev(k,o){ok(function(){var x={k:k};for(var j in o)x[j]=o[j];V3.ev('qpod',x);});}
var POD=V3.reg('quarter.pod',{s:'QPOD',t:'Подъезд — живая лига 30'});
var RACE=V3.reg('quarter.race',{s:'QPOD',t:'Призрак соседа — живая гонка'});
var SP=V3.reg('spichki',{s:'QPOD',t:'«Спички» с дедом Митяем'});
if(!POD&&!RACE&&!SP)return;
var DEV=ok(function(){return/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&/[?&]v3sp=1/.test(location.search);},false);
function fixP(v){v=v&&typeof v==='object'&&!Array.isArray(v)?v:{};var o={};['lw','p','n','od','sd','sw','sl'].forEach(function(k){var x=+v[k];o[k]=isFinite(x)&&x>0?Math.floor(x):0;});
o.p=Math.min(30,o.p);o.n=Math.min(30,o.n);return o;}
ok(function(){V3.field('v3pd',{s:'QPOD',def:function(){return fixP({});},fix:function(v){return fixP(v);},
merge:function(a,b,newer){a=fixP(a);b=fixP(b);var r=fixP(newer?b:a);r.sw=Math.max(a.sw,b.sw);r.sl=Math.max(a.sl,b.sl);r.sd=Math.max(a.sd,b.sd);r.od=Math.max(a.od,b.od);return r;}});});
function P(){var S=VY.S;if(!S)return fixP({});if(!S.v3pd||typeof S.v3pd!=='object')S.v3pd=fixP({});return S.v3pd;}
function today(){return ok(function(){return V3.dk();},Math.floor(Date.now()/864e5));}
var PD={on:null,d:null,at:0,ask:0,below:null};
var MY=W.MY;
function srv(){return!!(W.V3QS&&V3QS.call);}
function podOn(){return!!(POD&&MY&&MY.lgOpen&&MY.lgOpen()&&srv()&&PD.on===true&&PD.d&&Date.now()-PD.at<30*60e3);}
function pull(force,cb){if(!POD||!srv()||!MY||!MY.lgOpen||!MY.lgOpen()){if(cb)cb();return;}
if(!force&&Date.now()-PD.ask<(PD.on===false?6*3600e3:3*60e3)){if(cb)cb();return;}PD.ask=Date.now();
var sc=ok(function(){return MY.lgScore();},0);if(sc>0)ok(function(){V3QS.push('pd',{s:sc});});
V3QS.call([['pod',{}]],function(r){var x=r&&r.r&&r.r.pod;if(x&&x.on===0){PD.on=false;PD.d=null;}else if(x&&x.on===1){PD.on=true;PD.d=x;PD.at=Date.now();remember();}
else PD.ask=Date.now()-2*60e3;
if(cb)cb();});}
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function best5(a){a=a.slice().sort(function(x,y){return y-x;});var s=0;for(var i=0;i<5;i++)s+=a[i]||0;return s;}
function frac(){var d=MY.date();return(d.getHours()*60+d.getMinutes())/1440;}
function botScore(w,l,j,g,upto,fr){var B=MY.lgBOTS,st=B[l][j%7],R=rng(w*7919+l*104729+(j+40)*1299709+(g+1)*15485863+29),cap=MY.lgDAYCAP||400;
var n=st.a[0]+Math.floor(R()*(st.a[1]-st.a[0]+1)),days=[0,1,2,3,4,5,6];for(var i=6;i>0;i--){var x=Math.floor(R()*(i+1)),t=days[i];days[i]=days[x];days[x]=t;}
var form=.8+R()*.4,out=[0,0,0,0,0,0,0];for(var q=0;q<n;q++){var v=st.m*form*(.6+R()*.8);out[days[q]]=Math.min(cap,Math.round(v/5)*5);}
var a=[];for(var k=0;k<7;k++)a.push(k<upto?out[k]:k===upto?Math.round(out[k]*fr/5)*5:0);return best5(a);}
function botOf(j){var B=MY.lgBOTS;return B[Math.floor(j/7)%B.length][j%7];}
function rows(){var d=PD.d,S=VY.S,l=S.lgaL||0,w=S.lgaW||MY.week(),g=d.n>=0?d.n:0,mine=ok(function(){return MY.lgScore();},0),up=MY.wday(),fr=frac();
var r=[],me=false;(d.l||[]).forEach(function(e){if(e[2]){me=true;r.push({me:1,nm:'',s:Math.max(e[1],mine)});}else{var nm=String(e[0]).slice(0,24),mm=/^Игрок (\d+)$/.exec(nm);r.push({hu:1,nm:mm?L('Игрок '+mm[1],'Player '+mm[1]):nm,s:+e[1]||0});}});
if(!me)r.push({me:1,nm:'',s:mine});
var nb=Math.min(28,30-r.length);for(var j=0;j<nb;j++)r.push({j:j,s:botScore(w,l,j,g,up,fr)});
r.sort(function(a,b){return b.s-a.s||(a.me?-1:b.me?1:a.hu?-1:b.hu?1:(a.j||0)-(b.j||0));});return r;}
function myPlace(r){for(var i=0;i<r.length;i++)if(r[i].me)return i+1;return r.length;}
function eq8(p,n){return Math.max(1,Math.min(8,Math.ceil(p*8/Math.max(1,n))));}
function rowName(x){return x.me?L('Ты','You'):x.hu?x.nm:L(botOf(x.j).n,botOf(x.j).en)+L(' (сосед)',' (neighbour)');}
var LSK='vyezd-v3pod';
function remember(){if(!podOn())return;var r=rows(),p=myPlace(r),o=P(),S=VY.S;o.lw=S.lgaW||MY.week();o.p=p;o.n=r.length;
var below={};for(var i=p;i<r.length;i++)below[rowName(r[i])]=1;
var prev=PD.below;if(!prev)prev=ok(function(){var x=JSON.parse(localStorage.getItem(LSK)||'null');return x&&x.w===o.lw?x.b:null;},null);
if(prev){var by=null;for(var k=0;k<p-1;k++){var nm=rowName(r[k]);if(prev[nm]&&!r[k].me){by=nm;break;}}
if(by&&o.od!==today()){o.od=today();PD.by=by;ev('pod',{a:'pass',p:p});}}
PD.below=below;ok(function(){localStorage.setItem(LSK,JSON.stringify({w:o.lw,b:below}));});ok(function(){VY.save();});}
if(POD&&MY){
MY.lgPod=function(w,l,mine){var o=P();if(!o.p||!o.n||o.lw!==w)return null;return{p:eq8(o.p,o.n),p30:o.p,n:o.n};};
MY.lgPodLine=function(){if(!podOn())return null;var r=rows(),p=myPlace(r),o=P();
var t=L('Подъезд: ты ','Stairwell: you’re ')+p+L('-й из ',' of ')+r.length;if(PD.by&&o.od===today())t=L('Тебя обогнал ','You were overtaken by ')+PD.by+'. '+t;
return{ic:'🏢',t:t,a:'league'};};
MY.lgPodRender=function(el){if(!podOn()){pull(false,function(){if(podOn()&&MY.cur&&MY.cur()==='league')ok(function(){MY.render();});});return false;}
pull(false,function(){if(MY.cur&&MY.cur()==='league')ok(function(){MY.render();});});render(el);return true;};
}
var ME_AV=['#ffcf7a','#e8b48e','cap','#ff7a1a',0,0,'#5a3a22'];
var HUAV=[['#9ad0e8','#f0c29a','cap','#2f6fd0',0,0,'#4a2e1e'],['#f0d48a','#efc39f','scarf','#c23b5a',0,0,'#7a4a22'],['#a9cf9a','#e7b48c','none','',1,0,'#3a2a1a'],
['#c8a8d8','#f0c4a4','none','',0,1,'#a85a2a'],['#e8c080','#e0a880','ushanka','#5a4a3a',0,0,'#6a6a6a'],['#88c0c0','#ecbc98','panama','#e8e0c8',0,1,'#2a2a2a']];
function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);}
function render(el){var S=VY.S,l=S.lgaL||0,r=rows(),me=myPlace(r),n=r.length,p8=eq8(me,n),z=MY.lgZone(p8,l),d=MY.wday(),DP=S.lgaP||[],mine=ok(function(){return MY.lgScore();},0),cap=MY.lgDAYCAP||400;
var left=PD.d.left>0?Math.ceil(PD.d.left/86400):0;
var h='<div class="lghead">'+MY.lgBadge(l,64)+'<div><b>🏢 '+L('Подъезд','The stairwell')+' · '+esc(MY.lgName(l))+'</b><small>'+L('30 соседей по подъезду: живые игроки и соседи двора. Неделя пн–вс · ','30 neighbours in your stairwell: real players and yard neighbours. Week Mon–Sun · ')+
(left>1?L('до итогов '+(left-1)+' '+MY.pl(left-1,'день','дня','дней'),(left-1)+' days to the results'):L('итоги сегодня в полночь','results tonight at midnight'))+'</small><small>'+L('Твои очки: ','Your points: ')+'<b>'+mine+'</b> · '+L('сегодня ','today ')+(DP[d]||0)+L(' из ',' of ')+cap+'</small></div></div>';
var zt=!(mine>0)?L('Соседи уже выезжают. Каждый пройденный двор — очки недели!','The neighbours are already driving. Every yard you clear earns weekly points!')
:z==='up'?L('Ты в верхушке подъезда — зона повышения. Удержись до понедельника!','You’re at the top of the stairwell — promotion zone. Hold on until Monday!')
:z==='down'?L('Внизу подъезда — зона вылета. Пара дворов — и выберешься!','Bottom of the stairwell — relegation zone. A couple of yards and you’re out!')
:p8<=3?L('Ты среди призёров подъезда: ','You’re among the stairwell prize-winners: ')+MY.ct(MY.lgPay(l,p8).c)+' + '+MY.lgPay(l,p8).p+' 🔩!'
:L('До призёров — ','To the prize-winners — ')+Math.max(1,me-Math.floor(3*n/8))+' '+MY.pl(Math.max(1,me-Math.floor(3*n/8)),'место','места','мест')+'.';
if(PD.by&&P().od===today())zt='🏃 '+L('Тебя обогнал ','You were overtaken by ')+esc(PD.by)+'. '+zt;
h+='<p class="goal lgzt '+(z||'')+'">'+zt+'</p><div class="lgt v3pdT">';
for(var i=0;i<r.length;i++){var x=r[i],pp=i+1,zz=MY.lgZone(eq8(pp,n),l),fc,sub;
if(x.me){fc=MY.lgFace(ME_AV,36);sub=mine>0?L('5 лучших дней недели','your 5 best days'):L('ещё не играл на этой неделе','not played this week yet');}
else if(x.hu){fc=MY.lgFace(HUAV[hash(x.nm)%HUAV.length],36);sub=L('живой сосед по подъезду','a real neighbour');}
else{var b=botOf(x.j);fc=MY.lgHero(b)||MY.lgFace(b.av,36);sub=L('сосед · ','neighbour · ')+esc(L(b.h,b.he));}
h+='<div class="lgr'+(x.me?' lgme':'')+(zz?' '+zz:'')+'"><b class="lgp">'+pp+'</b>'+fc+'<span class="lgn"><b>'+esc(rowName(x))+'</b><small>'+sub+'</small></span><i class="lgg">'+(x.s||'—')+'</i></div>';}
h+='</div><div class="lgdays">'+L('пн вт ср чт пт сб вс','Mo Tu We Th Fr Sa Su').split(' ').map(function(nm,i){return'<span class="'+(i===d?'on':'')+(i>d?' fu':'')+'"><small>'+nm+'</small><b>'+(DP[i]?DP[i]:i<d?'·':'')+'</b></span>';}).join('')+'</div>';
h+='<p class="mynote">'+L('Очки — те же, что в лиге: 5 лучших дней недели, за двор 10 + 5 за каждую ★, задание дня — вдвойне. Итог — в понедельник по месту в подъезде: верхняя четверть — в лигу выше, нижняя — ниже, первые '+Math.ceil(3*n/8)+' — призы, как за тройку в лиге. Живые соседи — «Игрок NNNN» (имя — только если человек сам разрешил показ). Соседи двора добивают подъезд до 30 — они подписаны.',
'Points are the same as in the league: your 5 best days. Results on Monday by your place in the stairwell: top quarter goes up, bottom quarter goes down, the first '+Math.ceil(3*n/8)+' get prizes like a league top-3. Real neighbours show as “Player NNNN” unless they chose to show their name. Yard neighbours fill the stairwell up to 30 — they are marked.')+'</p>';
el.innerHTML=h;ev('pod',{a:'open',p:me,n:n,hu:(PD.d.l||[]).length});
ok(function(){var m=el.querySelector('.lgme');if(m&&m.scrollIntoView&&me>6)m.scrollIntoView({block:'center'});});
if(MY.lgAfter)ok(function(){MY.lgAfter(el);});}
if(POD){V3.sub('yard',function(info){if(!info||!info.ok||!srv()||PD.on===false)return;setTimeout(function(){var sc=ok(function(){return MY.lgScore();},0);if(sc>0)ok(function(){V3QS.push('pd',{s:sc});});},30);},'quarter.pod');
V3.sub('home',function(){pull(false);},'quarter.pod');
V3.sub('boot',function(){setTimeout(function(){pull(true);},4000);},'quarter.pod');}
var RC={g:null,el:null,cv:null,raf:0,t0:0,cum:null,lay:null,done:false};
function raceStop(){if(RC.raf)ok(function(){cancelAnimationFrame(RC.raf);});RC.raf=0;if(RC.el&&RC.el.parentNode)RC.el.parentNode.removeChild(RC.el);RC.el=null;RC.g=null;}
function raceBegin(g){raceStop();var gh=g.v3gh;if(!gh||!gh.log||!gh.log.length)return;var tm=gh.tm&&gh.tm.length===gh.log.length?gh.tm:null,c=0,cum=[];
for(var i=0;i<gh.log.length;i++){c+=tm?Math.max(1,tm[i]):16;cum.push(c/10);}
RC.g=g;RC.cum=cum;RC.t0=g.t0||Date.now();RC.done=false;RC.real=!!tm;
RC.lay=g.vs.map(function(v){return v.cells.map(function(c){return[c[0],c[1]];});});
var st=D.getElementById('stage');if(!st)return;var el=D.createElement('div');el.className='v3pRace';el.setAttribute('aria-hidden','true');
el.innerHTML='<canvas width="120" height="140"></canvas><b></b>';st.appendChild(el);RC.el=el;RC.cv=el.querySelector('canvas');
racePlace();ev('race',{a:'start',mv:gh.mv,tm:tm?1:0});RC.raf=requestAnimationFrame(raceTick);}
function racePlace(){var el=RC.el,g=RC.g,st=D.getElementById('stage');if(!el||!g||!st)return;ok(function(){
var sr=st.getBoundingClientRect(),hd=D.querySelector('#scr-game .gh'),ft=D.querySelector('#scr-game .gf'),hb=hd?hd.getBoundingClientRect().bottom:sr.top,fb=ft?ft.getBoundingClientRect().top:sr.bottom;
var yt=sr.top+oy,yb=sr.top+oy+g.p.h*cs,up=yt-hb-6,dn=fb-yb-6,top=dn<56&&up>dn,room=Math.max(up,dn),Hh=Math.max(46,Math.min(132,room))-24,Ww=Math.min(130,Math.round(Hh*g.p.w/g.p.h));
RC.cv.width=Ww*2;RC.cv.height=Hh*2;RC.cv.style.width=Ww+'px';RC.cv.style.height=Hh+'px';el.style.width=Math.max(Ww,96)+'px';
el.style.top=Math.round((top?hb+3:yb+3)-sr.top)+'px';el.style.right=top?'6px':'auto';el.style.left=top?'auto':Math.round((sr.width-Math.max(Ww,96))/2)+'px';el.style.opacity=room<40?'.5':'.8';});}
function raceTick(){RC.raf=0;var g=RC.g;if(!g||g!==VY.G||!RC.el){raceStop();return;}
var t=(Date.now()-RC.t0)/1000,k=0;while(k<RC.cum.length&&RC.cum[k]<=t)k++;var gone={};for(var i=0;i<k;i++)gone[g.v3gh.log[i]]=1;
var cv=RC.cv,x=cv.getContext('2d'),pw=g.p.w,ph=g.p.h,s=Math.min((cv.width-8)/pw,(cv.height-8)/ph),ox=(cv.width-pw*s)/2,oy=(cv.height-ph*s)/2;
x.clearRect(0,0,cv.width,cv.height);x.fillStyle='rgba(40,48,66,.8)';x.fillRect(ox-2,oy-2,pw*s+4,ph*s+4);
for(var j=0;j<RC.lay.length;j++){if(gone[j])continue;var cs=RC.lay[j],x0=1e9,y0=1e9,x1=-1,y1=-1;cs.forEach(function(c){x0=Math.min(x0,c[0]);y0=Math.min(y0,c[1]);x1=Math.max(x1,c[0]);y1=Math.max(y1,c[1]);});
x.fillStyle=g.v3gh.log[k]===j?'rgba(255,230,120,.95)':'rgba(235,245,255,.85)';x.fillRect(ox+x0*s+1,oy+y0*s+1,(x1-x0+1)*s-2,(y1-y0+1)*s-2);}
var left=RC.lay.length-k,mine=g.vs.filter(function(v){return v.state==='idle'||v.state==='bump';}).length;
var lb=RC.el.querySelector('b');if(lb)lb.textContent=k>=RC.cum.length?L('👻 Сосед выехал: ','👻 Neighbour done: ')+RC.cum[RC.cum.length-1].toFixed(1).replace('.',',')+L(' с',' s'):L('👻 Сосед: ещё ','👻 Neighbour: ')+left+L('',' left')+(mine<left?' · '+L('ты впереди!','you lead!'):'');
RC.n=(RC.n||0)+1;if(RC.n%60===0)racePlace();
if(!g.over||!RC.done)RC.raf=requestAnimationFrame(raceTick);}
if(RACE){V3.sub('yard-start',function(){raceStop();setTimeout(function(){var g=VY.G;if(g&&g.v3gh&&!g.daily)raceBegin(g);},60);},'quarter.race');
V3.sub('yard',function(info){var g=RC.g;if(!g){return;}if(info&&info.ok&&g===VY.G){var me=(Date.now()-RC.t0)/1000,gt=RC.cum[RC.cum.length-1],dd=Math.abs(me-gt).toFixed(1).replace('.',',');
RC.done=true;var t=me<gt?L('👻 Ты обогнал соседа на '+dd+' с!','👻 You beat the neighbour by '+dd+' s!'):L('👻 Сосед был быстрее на '+dd+' с. Ещё заход?','👻 The neighbour was faster by '+dd+' s. Another go?');
ok(function(){VY.toast(t,3200);});ev('race',{a:'end',w:me<gt?1:0,d:Math.round(Math.abs(me-gt)),real:RC.real?1:0});RC.res={w:me<gt,d:dd};}
setTimeout(raceStop,1500);},'quarter.race');
V3.sub('screen',function(s){if(s!=='game')raceStop();},'quarter.race');}
var SPN='Дед Митяй',SPE='Grandpa Mityai';
function spTodayDone(){return!DEV&&P().sd===today();}
function spScore(){var o=P();return L('Счёт: ты ','Score: you ')+o.sw+' : '+o.sl+L(' Митяй',' Mityai');}
function spOpen(){if(!SP)return;var o=P(),done=spTodayDone();ev('sp',{a:'open'});
var h='<h2>🔥 '+L('«Спички» с дедом Митяем','“Matchsticks” with Grandpa Mityai')+'</h2><p class="v3qS"><b>'+L('Митяй: ','Mityai: ')+'</b>'+esc(L('Двор один на двоих. Ходим по очереди: за ход выпускаешь одну, две или три машины. Кто выпустит последнюю — тот и выиграл. Думай, внучок: тут считать надо.',
'One yard for two. We take turns: each turn you drive out one, two or three cars. Whoever drives out the last one wins. Think, kiddo — it takes counting.'))+'</p>'+
'<p class="v3qHint">'+L('Митяй играет раз в день. Без ставок — только на интерес.','Mityai plays once a day. No stakes — just for fun.')+' '+(o.sw+o.sl?spScore()+'.':'')+'</p>'+
'<div class="mBtns">'+(done?'<button class="btn sec" disabled>'+L('Сегодня сыграли — реванш завтра','Played today — rematch tomorrow')+'</button>':'<button class="btn" id="v3spGo">'+L('Сыграть','Play')+'</button>')+'<button class="btn sec" id="v3spX">'+L('Закрыть','Close')+'</button></div>';
var m=VY.modal(h);if(!m)return;var g=m.querySelector('#v3spGo');if(g)g.onclick=spStart;var x=m.querySelector('#v3spX');if(x)x.onclick=function(){VY.hide();};}
function spParams(){var p=ok(function(){return levelParams(6);},null);if(!p)return null;var q={};for(var k in p)q[k]=p[k];q.amb=false;q.police=false;q.boss=false;return q;}
function spStart(){var p=spParams();if(!p)return;var o=P();if(!spTodayDone()){o.sd=today();ok(function(){VY.save();});}ev('sp',{a:'go'});
ok(function(){VY.hide();});ok(function(){if(W.MY&&MY.close)MY.close();});
ok(function(){startLevel(5,false,{mode:'fest',p:p,seed:(today()%100000)*10+7});G.v3sp={turn:'me',took:0,me:0,bot:0,end:null,cnt:!DEV||o.sd===today()};G.soft=1;var t=D.getElementById('gLevel');if(t)t.textContent=L('🔥 «Спички» с Митяем','🔥 Matchsticks');});
spBar();}
function spLeft(g){return g.vs.filter(function(v){return v.state==='idle'||v.state==='bump';}).length;}
function spBar(){var g=VY.G,sg=D.getElementById('scr-game');if(!g||!g.v3sp||!sg)return;sg.classList.add('v3sp');var f=sg.querySelector('.gf');if(!f)return;
var b=D.getElementById('v3spBar');if(!b){b=D.createElement('div');b.id='v3spBar';b.className='v3spBar';f.appendChild(b);}
var s=g.v3sp,left=spLeft(g),t;
if(s.end)t=s.end==='me'?L('🏆 Последнюю выпустил ты!','🏆 You drove out the last one!'):L('Последнюю выпустил Митяй.','Mityai drove out the last one.');
else if(s.turn==='me')t=L('Твой ход: выпусти 1–3 машины','Your turn: drive out 1–3 cars')+(s.took?' · '+L('уже ','done: ')+s.took:'');
else t=L('Ходит дед Митяй…','Grandpa Mityai’s turn…');
b.innerHTML='<span><b>'+esc(t)+'</b><small>'+L('Осталось машин: ','Cars left: ')+left+'</small></span>'+(s.turn==='me'&&!s.end?'<button class="btn accent noenter" id="v3spPass"'+(s.took?'':' disabled')+'>'+L('Хватит — ход Митяю','Done — Mityai’s turn')+'</button>':'');
var pb=D.getElementById('v3spPass');if(pb)pb.onclick=function(){if(g.v3sp.turn==='me'&&g.v3sp.took>0&&!g.v3sp.end)spBot();};}
function spClean(){var sg=D.getElementById('scr-game');if(sg)sg.classList.remove('v3sp');var b=D.getElementById('v3spBar');if(b&&b.parentNode)b.parentNode.removeChild(b);}
function spGone(g){return g.vs.filter(function(v){return v.state==='exit'||v.state==='gone'||v.state==='tow';}).length;}
function spEnd(g,who){var s=g.v3sp;if(s.end)return;s.end=who;g.over=true;spBar();var o=P();
if(s.cnt){if(who==='me')o.sw++;else o.sl++;s.cnt=false;ok(function(){VY.save();});}ev('sp',{a:'end',w:who==='me'?1:0,me:s.me,bot:s.bot});
setTimeout(function(){if(VY.G!==g)return;var win=who==='me';
var h='<h2>🔥 '+(win?L('Победа в «спички»!','You won at “matchsticks”!'):L('Митяй выиграл','Mityai won'))+'</h2><p class="v3qS"><b>'+L('Митяй: ','Mityai: ')+'</b>'+esc(win?L('Ишь ты! Последнюю увёл. Завтра отыграюсь — я ночью потренируюсь.','Well I never! You took the last one. I’ll win it back tomorrow — I’ll practise tonight.')
:L('Учись, внучок: на четвёрки считай. Завтра ещё сыграем.','Learn, kiddo: count in fours. Let’s play again tomorrow.'))+'</p><p class="v3qHint">'+spScore()+'</p><div class="mBtns"><button class="btn" id="v3spHome">'+L('Домой','Home')+'</button></div>';
var m=VY.modal(h);if(!m)return;var b=m.querySelector('#v3spHome');if(b)b.onclick=function(){VY.hide();spClean();ok(function(){VY.leave();});};},1500);}
function spBot(){var g=VY.G,s=g&&g.v3sp;if(!s||s.end)return;s.turn='bot';s.took=0;spBar();
var rem=spLeft(g),k=rem%4;if(!k)k=1;if(Math.random()<.22)k=1+Math.floor(Math.random()*3);k=Math.min(k,rem);var n=0;
function step(){if(VY.G!==g||s.end)return;var w=g.p.w,h=g.p.h,free=g.vs.filter(function(v){return v.state==='idle'&&canExit(v,g.occ,w,h,v.id).free;});
if(!free.length||n>=k){s.turn='me';s.took=0;spBar();return;}
var v=free[Math.floor(Math.random()*free.length)];ok(function(){v.flash=1;});
setTimeout(function(){if(VY.G!==g||s.end||v.state!=='idle')return step();var r=canExit(v,g.occ,w,h,v.id);if(!r.free)return step();
g.moves++;startExit(v,r);n++;s.bot++;if(v.last||spLeft(g)===0){spEnd(g,'bot');return;}spBar();setTimeout(step,520);},380);}
setTimeout(step,700);}
function spHook(){var f=W.tapAt;if(typeof f!=='function'||f.__v3sp)return;var w=function(){var g=VY.G,s=g&&g.v3sp;if(!s)return f.apply(this,arguments);
if(s.end||s.turn!=='me')return;var a=spGone(g),r=f.apply(this,arguments);var b=spGone(g);
if(b>a){s.took+=b-a;s.me+=b-a;if(spLeft(g)===0){spEnd(g,'me');return r;}if(s.took>=3)spBot();else spBar();}return r;};
w.__v3sp=1;for(var k in f)if(Object.prototype.hasOwnProperty.call(f,k)&&!(k in w))w[k]=f[k];W.tapAt=w;}
if(SP){V3.sub('boot',function(){setTimeout(spHook,50);},'spichki');
V3.sub('yard-start',function(){spClean();},'spichki');
V3.sub('screen',function(s){if(s!=='game')spClean();},'spichki');
if(MY)MY.lgAfter=function(el){if(!SP)return;var o=P(),done=spTodayDone();
var d=D.createElement('p');d.className='v3qS v3spRow';d.innerHTML='🔥 <b>'+L('«Спички» с дедом Митяем','“Matchsticks” with Grandpa Mityai')+'</b> — '+esc(L('по очереди 1–3 машины, кто выпустит последнюю — выиграл.','take turns, 1–3 cars each; whoever drives out the last one wins.'))+
(o.sw+o.sl?' <small>'+esc(spScore())+'</small>':'')+' <button class="btn sec sm noenter" id="v3spOpen"'+(done?' disabled':'')+'>'+(done?L('Завтра','Tomorrow'):L('Сыграть','Play'))+'</button>';
el.appendChild(d);var b=d.querySelector('#v3spOpen');if(b)b.onclick=spOpen;};}
W.V3POD={pull:pull,st:function(){return PD;},rows:function(){return podOn()?rows():null;},on:podOn,eq8:eq8,race:function(){return RC;},raceBegin:raceBegin,sp:spOpen,spStart:spStart,spBot:spBot,P:P};
})();