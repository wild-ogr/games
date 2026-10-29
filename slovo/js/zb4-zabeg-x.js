'use strict';
(function(){
var Z=window.Z4,X=Z&&Z.ZAB;if(!X||!X.s||window.Z4QX)return;
var QX=window.Z4QX={},D=document,esc=X.esc;
if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4q==null)ZBECO.cap.z4q=20;
function $$(id){return D.getElementById(id);}
function snd(k){try{SND[k]();}catch(e){}}
function T(k,c,d){return Z.txt(k,c)||d||'';}
function face(m){try{return zinaSVG(m||'happy');}catch(e){return'';}}
function say(s,m){try{if(s)zina(s,m||'happy');}catch(e){}}
function rng(seed){var s=(seed>>>0)||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function okp(){try{return typeof OK!=='undefined'&&!!OK;}catch(e){return false;}}
function home(){try{if(typeof maybeInterstitial==='function')maybeInterstitial(openMenu);else openMenu();}catch(e){try{openMenu();}catch(x){}}}
function inter(f){try{if(typeof maybeInterstitial==='function')maybeInterstitial(f);else f();}catch(e){f();}}
function give(n,why){var k=0;try{k=window.ZBECO&&ZBECO.give?ZBECO.give('z4q',n,'quest'):0;}catch(e){}if(k)try{updCoins();}catch(e){}X.ev('rw',{c:k,w:why});return k;}
function sv(){try{save();}catch(e){}try{cloudSoon();}catch(e){}}
function plu(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
var POOL=null;
QX.pool=function(){if(POOL)return POOL;var set={},n=Math.min(500,typeof LEVELS!=='undefined'?LEVELS.length:0);
for(var i=0;i<n;i++)LEVELS[i].w.forEach(function(a){set[a[0]]=1;});POOL=Object.keys(set).sort();return POOL;};
function cnt(w){var m={};for(var i=0;i<w.length;i++)m[w[i]]=(m[w[i]]||0)+1;return m;}
function fits(w,bm){var m={};for(var i=0;i<w.length;i++){var c=w[i];m[c]=(m[c]||0)+1;if(m[c]>(bm[c]||0))return false;}return true;}
function place(list,maxW,minW,maxG,r){
var grid={},dir={},ws=[],x0=0,x1=0,y0=0,y1=0;
function at(x,y){return grid[x+','+y];}
function put(w,x,y,d){for(var i=0;i<w.length;i++){var k=(x+(d?0:i))+','+(y+(d?i:0));grid[k]=w[i];dir[k]=(dir[k]||0)|(d?2:1);}
ws.push([w,x,y,d]);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+(d?0:w.length-1));y1=Math.max(y1,y+(d?w.length-1:0));}
function ok(w,x,y,d){var cr=0,i,cx,cy,c;
if(at(x-(d?0:1),y-(d?1:0))||at(x+(d?0:w.length),y+(d?w.length:0)))return-1;
if(Math.max(x1,x+(d?0:w.length-1))-Math.min(x0,x)+1>maxG||Math.max(y1,y+(d?w.length-1:0))-Math.min(y0,y)+1>maxG)return-1;
for(i=0;i<w.length;i++){cx=x+(d?0:i);cy=y+(d?i:0);c=at(cx,cy);
if(c){if(c!==w[i]||dir[cx+','+cy]&(d?2:1))return-1;cr++;}
else if(d?(at(cx-1,cy)||at(cx+1,cy)):(at(cx,cy-1)||at(cx,cy+1)))return-1;}
return cr===w.length?-1:cr;}
put(list[0],0,0,0);
for(var k=1;k<list.length&&ws.length<maxW;k++){var w=list[k],best=null,bc=0,n=0;
ws.forEach(function(p){for(var j=0;j<p[0].length;j++)for(var i=0;i<w.length;i++){if(w[i]!==p[0][j])continue;
var d=p[3]?0:1,x=d?p[1]+j:p[1]-i,y=d?p[2]-i:p[2]+j,c=ok(w,x,y,d);if(c<1)continue;
if(c>bc||(c===bc&&r()<1/(++n))){if(c>bc)n=1;bc=c;best=[x,y,d];}}});
if(best)put(w,best[0],best[1],best[2]);}
if(ws.length<minW)return null;
return{w:ws.map(function(a){return[a[0],a[1]-x0,a[2]-y0,a[3]];}),g:[x1-x0+1,y1-y0+1]};}
QX.gen=function(seed,o){var pool=QX.pool(),r=rng(seed),B=pool.filter(function(w){return w.length>=o.min&&w.length<=o.max;});if(!B.length)return null;
for(var t=0;t<60;t++){var b=B[Math.floor(r()*B.length)],bm=cnt(b);
var subs=pool.filter(function(w){return w!==b&&w.length>=3&&w.length<=b.length&&fits(w,bm);});
if(subs.length<o.nw[0]-1)continue;
subs.sort(function(a,c){return c.length-a.length+(r()-.5)*2.5;});
var L=place([b].concat(subs.slice(0,24)),o.nw[1],o.nw[0],o.g,r);if(!L)continue;
var l=b.split('');for(var i=l.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),q=l[i];l[i]=l[j];l[j]=q;}
if(l.join('')===b){l.push(l.shift());}
return{l:l.join(''),w:L.w,g:L.g,d:b};}
return null;};
var GT={min:6,max:7,nw:[5,8],g:9},GK={min:5,max:6,nw:[4,6],g:8};
function page(p){return QX.gen(100003+p*7919,GT);}
function cells(lv){var s={};lv.w.forEach(function(a){for(var i=0;i<a[0].length;i++)s[(a[1]+(a[3]?0:i))+','+(a[2]+(a[3]?i:0))]=a[0][i];});return s;}
function ncell(lv){return Object.keys(cells(lv)).length;}
var IT={lin:['📏','Линейка','Длинные слова (5+ букв) — вдвое'],mel:['🖍️','Мелок','Слова из 3 букв — втрое'],
pero:['✒️','Перо','Бонусное слово — 5 очков, а не 1'],skr:['📎','Скрепка','Слова подряд без промаха — каждое на очко дороже'],
sch:['🧮','Счёты','Счёт уровня ×1,5'],ukaz:['👆','Указка','В начале уровня одна буква уже открыта'],
prom:['🧻','Промокашка','Промахи не отнимают очков'],zvon:['🔔','Звонок','Успел за 2 минуты — +15'],
zvez:['⭐','Звёздочка','Без подсказок — +10']};
var IDS=Object.keys(IT),EVS=['lin','mel','pero','skr','zvon','zvez','buk'];
function fast(){return okp()?180:120;}
function itDesc(id,g){if(id==='zvon')return'Успел за '+(fast()/60)+' '+plu(fast()/60,'минуту','минуты','минут')+' — +15';
if(id==='buk')return'Слова на букву «'+((g&&g.bl)||'').toUpperCase()+'» — вдвое';return IT[id]?IT[id][2]:'';}
function itName(id){return id==='buk'?'🔤 Буква':IT[id]?IT[id][0]+' '+IT[id][1]:'';}
function has(q,id){return q.it.indexOf(id)>=0;}
function wordPts(q,o){var n=o.bonus?1:o.w.length,k=1;
if(o.bonus&&has(q,'pero'))n=5;
if(!o.bonus&&has(q,'lin')&&o.w.length>=5)k*=2;
if(!o.bonus&&has(q,'mel')&&o.w.length===3)k*=3;
if(has(q,'buk')&&q.bl&&o.w.charAt(0)===q.bl)k*=2;
n*=k;if(has(q,'skr'))n+=q.run;return n;}
function endPts(q,g){var b=0,sec=(Date.now()-(g.t0||Date.now()))/1000;
if(has(q,'zvon')&&sec<=fast())b+=15;if(has(q,'zvez')&&!g.hinted)b+=10;
var s=Math.max(0,q.sc)+b;if(has(q,'sch'))s=Math.round(s*1.5);return s;}
Z.onWord(function(o){var g=o.G,q=g&&g.z4q;if(!q||q.k==='tetr')return;q.sc+=wordPts(q,o);q.run++;rib();});
Z.onMiss(function(o){var g=o.G,q=g&&g.z4q;if(!q||q.k==='tetr')return;q.run=0;if(!has(q,'prom'))q.sc=Math.max(0,q.sc-1);rib();});
var P=null,wrapped=0;
function ribTxt(q){if(q.k==='tetr')return['📓 Тетрадь, стр. '+(q.i+1),'📓 '+(q.i+1)];
if(q.k==='port')return['🎒 Портфель '+(q.i+1)+'/5 · '+q.sc+' очк.','🎒 '+q.sc];
return['📝 Контрольная '+(q.i+1)+'/5 · '+q.sc+' очк.','📝 '+q.sc];}
function rib(){var g=typeof G!=='undefined'?G:null,q=g&&g.z4q,gs=$$('gSub');if(!q||!gs)return;var t=ribTxt(q);
gs.dataset.full=t[0];gs.dataset.short=t[1];gs.title='';try{fitSub();}catch(e){}}
function wrap(){if(wrapped)return;wrapped=1;
var oLD=levelData;levelData=function(){if(P&&P.arm)return P.lv;return oLD.apply(this,arguments);};
var oLK=levelKey;levelKey=function(){if(P&&P.arm)return P.key;return oLK.apply(this,arguments);};
var oRb=ribbon;ribbon=function(){oRb.apply(this,arguments);var q=P&&P.arm?P.q:typeof G!=='undefined'&&G&&G.z4q;if(!q)return;
var r=$$('gRib'),gt=$$('gTitle'),c=q.k==='tetr'?'#e6eef9':q.k==='port'?'#f3e6d4':'#e8f0dc';if(!r)return;
r.style.setProperty('--rc',c);r.style.setProperty('--rb',typeof shade==='function'?shade(c,.28):c);
if(gt)gt.textContent=q.k==='tetr'?'Бесконечная тетрадь':q.k==='port'?'Портфель четверти':'Контрольная дня';
var gs=$$('gSub');if(gs){var t=ribTxt(q);gs.dataset.full=t[0];gs.dataset.short=t[1];gs.title='';}try{fitSub();}catch(e){}};
ZB.startHook.unshift(function(info){if(P&&P.arm&&typeof G!=='undefined'&&G){info.mode='z4q';G.mode='z4q';G.z4q=P.q;}});
var oFin=finishLevel;finishLevel=function(g){if(!g||!g.z4q)return oFin.apply(this,arguments);return fin(g);};
var oWin=winModal;winModal=function(g,r,again){if(!g||!g.z4q)return oWin.apply(this,arguments);return win(g,r,again);};
ZB.on('screen',function(sc){if(sc!=='game')D.body.classList.remove('z4qlv');});}
function play(lv,q){if(!lv){try{toast('Страница не сложилась — попробуй ещё раз',2500);}catch(e){}return;}wrap();
var key='Q'+q.k+q.tag;for(var k in S.curs)if(k.indexOf('Q'+q.k)===0&&k!==key)delete S.curs[k];
q.sc=q.sc||0;q.run=0;q.it=q.it||[];
inter(function(){P={lv:lv,key:key,q:q,arm:true};var cel=typeof ZBCELL!=='undefined'&&ZBCELL.ON,oL=STAT.lvl;if(cel)ZBCELL.ON=false;
STAT.lvl=function(){return oL.call(STAT,q.i+1,'z4q',{e:q.k});};
try{startLevel(Math.max(0,Math.min(+S.lv||0,LEVELS.length-1)),false);}finally{STAT.lvl=oL;if(P)P.arm=false;if(cel)ZBCELL.ON=true;}
if(typeof G==='undefined'||!G||G.lv!==lv)return;
G.z4q=q;G.mode='z4q';D.body.classList.add('z4qlv');
if(G.rid){try{wordCells(G.rid).forEach(function(c){c.el.classList.remove('rid');});}catch(e){}G.rid=null;}
if(has(q,'ukaz'))ukaz(G);
X.ev('lv',{k:q.k,i:q.i});ribbon(G.idx,false);
var s=q.k==='port'?T('z4q.port.lv',0,'Портфель, уровень '+(q.i+1)+' из 5. Вещи в деле — считай очки.')
:q.k==='kontr'?'Условие: '+itDesc(q.it[0],q).toLowerCase()+'. '+T('z4q.kontr.lv',0,'Списывать не у кого — все пишут то же самое.')
:T('z4q.tetr.lv',0,'Страница '+(q.i+1)+'. Пиши аккуратно — тетрадь не кончится.');
say(s,'happy');});}
QX.play=play;
function ukaz(g){var open=0;g.cells.forEach(function(c){if(c.open&&!c.gift)open++;});if(open)return;
var cand=[];g.cells.forEach(function(c,k){if(c.open)return;var ok=true;g.words.forEach(function(w){var cs=wordCells(w);
if(cs.indexOf(c)>=0&&cs.filter(function(x){return!x.open;}).length<2)ok=false;});if(ok)cand.push(c);});
if(!cand.length)return;var c=cand[Math.floor(Math.random()*cand.length)];c.open=true;
try{c.el.textContent=c.ch;c.el.classList.add('open');}catch(e){}try{saveCur();}catch(e){}}
function base(q){return{first:false,reward:0,base:0,dw:null,isNew:false,streak:0,sbonus:0,exc:false,exBonus:0,exLoud:false,week:0,chap:0,dk:0,rankUp:'',test:false,z4q:q};}
function fin(g){var q=g.z4q,r=base(q),z=X.zz();delete S.curs[g.key];
if(q.k==='tetr'){var n=ncell(g.lv);if(q.i>=+z.tp){z.tp=q.i+1;z.tc=(+z.tc||0)+n;r.reward=give(2,'tetr');r.first=true;}r.cells=n;}
else{var s=endPts(q,g);r.lvSc=s;
if(q.k==='port'){var R=X.run();if(R&&R.st===q.i){R.ls.push(s);R.sc+=s;R.st++;
if(R.st<5){R.off=offer(R);R.ph='pick';}else{R.ph='done';var gr=R.sc>=300?5:R.sc>=200?4:3;r.grade=gr;r.total=R.sc;
z.pn=(+z.pn||0)+1;r.best=R.sc>(+z.pb||0);z.pb=Math.max(+z.pb||0,R.sc);r.reward=give(gr===5?12:gr===4?8:5,'port');
X.ev('end',{k:'port',s:R.sc,g:gr,c:r.reward,it:R.it.join(',')});}
runSave(R.ph==='done'?null:R);r.run=R;}}
else{kDay();if(q.i===+z.ki){z.ki++;z.ks=(z.ks||'')+(g.hinted?'y':'g');z.kp=(+z.kp||0)+s;
if(z.ki>=5){r.reward=give(5,'kontr');X.ev('end',{k:'kontr',s:z.kp,t:z.ks,c:r.reward});}}}}
X.ev('win',{k:q.k,i:q.i,s:r.lvSc||r.cells||0});sv();return r;}
function runSave(R){try{if(R)localStorage.setItem('z4q-run',JSON.stringify(R));else localStorage.removeItem('z4q-run');}catch(e){}}
function offer(R){var r=rng((R.seed+R.st*977)>>>0),L=IDS.filter(function(i){return R.it.indexOf(i)<0;});
for(var i=L.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=L[i];L[i]=L[j];L[j]=t;}return L.slice(0,3);}
function portNew(){var n=Math.min(+S.lv||0,LEVELS.length,500),seed=(Date.now()%1000000007)>>>0,r=rng(seed),L=[];
if(n<5)return null;var tries=0;while(L.length<5&&tries++<200){var i=Math.floor(r()*n);if(L.indexOf(i)<0)L.push(i);}
var R={seed:seed,L:L,st:0,it:[],ls:[],sc:0,ph:'pick',d:X.tk()};R.off=offer(R);runSave(R);X.ev('start',{k:'port'});return R;}
function portTake(R,id){if(R.ph!=='pick'||R.off.indexOf(id)<0)return;R.it.push(id);R.ph='play';R.off=[];runSave(R);X.ev('item',{id:id,st:R.st});}
function portPlay(R){if(!R||R.ph!=='play')return;var i=R.L[R.st];
play(levelData(i,false),{k:'port',i:R.st,tag:R.seed%100000+'_'+R.st,it:R.it.slice()});}
function tiles(R){return'<div class="z4q-its" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0">'+R.off.map(function(id){var t=IT[id];
return'<button type="button" class="z4q-it" data-it="'+id+'" style="flex:1 1 100px;max-width:160px;min-height:120px;padding:8px;border-radius:14px;border:2px solid var(--z3-line,#d9cdb5);background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);font-family:var(--z3-font);cursor:pointer">'+
'<span style="display:block;font-size:40px;line-height:1.1">'+t[0]+'</span><b style="display:block;font-size:15px;margin:4px 0">'+t[1]+'</b>'+
'<span style="display:block;font-size:13.5px;line-height:1.25">'+esc(itDesc(id))+'</span></button>';}).join('')+'</div>';}
function bag(R){return R.it.length?'<p style="font-size:15px;margin:6px 0">В портфеле: '+R.it.map(function(i){return'<span title="'+esc(IT[i][1])+'">'+IT[i][0]+'</span>';}).join(' ')+'</p>':'';}
function mountTiles(el,R,then){[].forEach.call(el.querySelectorAll('.z4q-it'),function(b){b.onclick=function(){snd('tap');portTake(R,b.getAttribute('data-it'));then();};});}
function kDay(){var z=X.zz(),d=X.tk();if(+z.kd!==d){z.kd=d;z.ki=0;z.ks='';z.kp=0;}return z;}
function kLevel(i){var d=X.tk(),lv=QX.gen(d*10+i+7,GK),r=rng(d*31+i),ev=EVS[Math.floor(r()*EVS.length)],q={k:'kontr',i:i,tag:d+'_'+i,it:[ev]};
if(ev==='buk'&&lv){var f=lv.w.map(function(a){return a[0].charAt(0);});q.bl=f[Math.floor(r()*f.length)];}
return{lv:lv,q:q};}
function kPlay(){var z=kDay();if(z.ki>=5)return;var k=kLevel(+z.ki);play(k.lv,k.q);}
function tabel(z){var s='',t=z.ks||'';for(var i=0;i<5;i++)s+=t.charAt(i)==='g'?'🟩':t.charAt(i)==='y'?'🟨':'⬜';return s;}
function dm(){var d=String(X.tk());return d.slice(6)+'.'+d.slice(4,6);}
function kShare(){var z=X.zz(),O=Z.OTKR,msg='Контрольная дня у бабы Зины, '+dm()+': '+tabel(z)+' · '+(+z.kp||0)+' очк.';X.ev('share',{t:z.ks});
if(O&&O.on&&O.on.tab&&O.x)O.x().then(function(){if(window.Z4OX)Z4OX.open('txt',{title:'Контрольная дня',head:'Контрольная дня, '+dm(),
body:tabel(z)+'\n'+(+z.kp||0)+' очков',note:T('z4q.kontr.share',0,'Задания у всех одинаковые. Оправдания — у каждого свои.'),msg:msg});},function(){});
else{try{toast(msg,4000);}catch(e){}}}
function canShare(){var O=Z.OTKR;return!!(O&&O.on&&O.on.tab&&O.x);}
function win(g,r,again){var q=g.z4q,z=X.zz(),body='',btn='',ttl='',R=r.run;
if(q.k==='tetr'){ttl='Страница '+(q.i+1)+' исписана!';
body='<p style="font-size:17px">+'+r.cells+' '+plu(r.cells,'клетка','клетки','клеток')+'. Всего исписано: <b>'+(+z.tc||0)+'</b></p><p class="exsay" style="font-size:15px">'+esc(T('z4q.tetr.win',0,'Тетрадь толще, чем вчера. Как и я после праздников.'))+'</p>';
btn='<button class="btn green" id="mNext">Следующая страница ▶</button><button class="btn ghost small" id="z4qScr">Тетрадь</button>';}
else if(q.k==='port'){
if(R&&R.ph==='pick'){ttl='Уровень '+R.st+' из 5 сдан!';
body='<p style="font-size:17px">За уровень: <b>'+r.lvSc+'</b> · всего: <b>'+R.sc+'</b></p>'+bag(R)+'<p style="font-size:15px;margin:4px 0">Возьми ещё одну вещь в портфель:</p>'+tiles(R);
btn='';}
else if(R){ttl='Четверть закрыта: '+r.grade+'!';
body='<div style="width:90px;height:90px;margin:2px auto">'+face(r.grade===5?'happy':'norm')+'</div><p style="font-size:17px">Счёт за четверть: <b>'+R.sc+'</b>'+(r.best?' — лучший!':'')+'</p>'+bag(R)+
'<p class="exsay" style="font-size:15px">'+esc(T('z4q.port.g'+r.grade,0,r.grade===5?'Пятёрка за четверть. В журнал — ручкой, не карандашом.':r.grade===4?'Четвёрка. Крепкая, как мой чай.':'Тройка. Зато честная — сама ставила.'))+'</p>';
btn='<button class="btn green" id="mNext">Новый портфель ▶</button>';}
else{ttl='Уровень сдан!';btn='<button class="btn green" id="mNext">Дальше ▶</button>';}}
else{var done=+z.ki>=5;ttl=done?'Контрольная сдана!':'Задание '+(q.i+1)+' из 5 решено';
body='<p style="font-size:26px;letter-spacing:2px;margin:6px 0">'+tabel(z)+'</p><p style="font-size:17px">За уровень: <b>'+r.lvSc+'</b> · всего: <b>'+(+z.kp||0)+'</b></p>'+
(done?'<p class="exsay" style="font-size:15px">'+esc(T('z4q.kontr.end',0,'Сдано. Завтра новая — у всех одна на всех.'))+'</p>':'');
btn=done?(canShare()?'<button class="btn green" id="z4qShr">Переслать табель</button>':'')+'<button class="btn ghost small" id="z4qScr">Забеги</button>'
:'<button class="btn green" id="mNext">Задание '+(+z.ki+1)+' ▶</button>';}
modal('<div class="'+(again?'':'win')+' z4qwin"><h2>'+esc(ttl)+'</h2>'+body+
(r.reward?'<div class="reward big" id="mRew">+'+r.reward+' <span class="coin"></span></div>':'')+
'<div class="btns">'+btn+'<button class="wmenu" id="mMenu">В меню</button></div></div>');
try{if(typeof fitWin==='function')fitWin();}catch(e){}
if(!again&&r.reward){snd('coin');try{coinBurst($$('mRew'),r.reward);}catch(e){}}
var box=D.querySelector('.z4qwin');
if(q.k==='port'&&R&&R.ph==='pick'&&box)mountTiles(box,R,function(){hideModal();portPlay(R);});
var n=$$('mNext');if(n)n.onclick=function(){hideModal();snd('tap');
if(q.k==='tetr')play(page(+z.tp||0),{k:'tetr',i:+z.tp||0,tag:String(+z.tp||0)});
else if(q.k==='kontr')kPlay();
else{var R2=portNew();if(R2)ZB.go('z4q',{k:'pick'});else home();}};
var sc=$$('z4qScr');if(sc)sc.onclick=function(){hideModal();snd('tap');inter(function(){ZB.go('z4q',{k:q.k==='tetr'?'tetr':'home'});});};
var sh=$$('z4qShr');if(sh)sh.onclick=function(){snd('tap');kShare();};
$$('mMenu').onclick=function(){hideModal();snd('tap');home();};}
function weak(){try{var n=navigator;return(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=4);}catch(e){return false;}}
function mini(lv,p){var s=cells(lv),W=lv.g[0],H=lv.g[1],h='';
for(var y=0;y<H;y++)for(var x=0;x<W;x++){var c=s[x+','+y];
h+=c?'<span style="display:block;width:18px;height:18px;line-height:18px;font-size:13.5px;text-align:center;background:#fff;border:1px solid #9fb3d6;box-sizing:border-box;color:#2a4c8f;font-family:var(--z3-hand,var(--z3-font))">'+c+'</span>':'<span></span>';}
return'<div class="z4q-pg" style="margin:8px auto;padding:8px 10px;border-radius:10px;background:repeating-linear-gradient(#f9fbff 0 17px,#dfe8f7 17px 18px);box-shadow:var(--z3-shadow);width:max-content;max-width:100%">'+
'<small style="display:block;font-size:13.5px;color:var(--z3-ink2,#5d6781);margin-bottom:4px">Стр. '+(p+1)+' · '+Object.keys(s).length+' кл.</small>'+
'<div style="display:grid;grid-template-columns:repeat('+W+',18px);grid-auto-rows:18px;gap:1px">'+h+'</div></div>';}
function sect(ic,t,sub,inner){return'<div class="z4q-s" style="padding:12px;margin:10px 0;border-radius:var(--z3-rb,16px);background:var(--z3-card,#fff);box-shadow:var(--z3-shadow)">'+
'<div style="display:flex;align-items:center;gap:10px"><span style="font-size:32px">'+ic+'</span><span style="flex:1"><b style="display:block;font-size:17px">'+t+'</b>'+
'<small style="display:block;font-size:14px;color:var(--z3-ink2,#5d6781)">'+sub+'</small></span></div>'+inner+'</div>';}
function bt(id,t,g){return'<button type="button" class="btn '+(g?'green':'ghost')+' small" data-a="'+id+'" style="min-height:44px;margin:8px 6px 0 0">'+t+'</button>';}
var cur=null;
ZB.screen('z4q',{title:'Забеги',render:function(el,op){cur={el:el,k:op.k||'home'};el.innerHTML='';el.className='screen zb-scr z4q-scr';
el.style.cssText='background:var(--z3-bg,#f6f1e6);color:var(--z3-ink,#27324a);font-family:var(--z3-font);overflow-y:auto;-webkit-overflow-scrolling:touch';
var w=D.createElement('div');w.style.cssText='max-width:560px;margin:0 auto;padding:10px 16px 24px;box-sizing:border-box';el.appendChild(w);
var R=X.run(),z=X.zz(),h='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><button type="button" class="btn ghost small" data-a="back" style="min-height:44px">← Дом</button>'+
'<b style="flex:1;font-size:18px;text-align:center">🏃 Забеги на пройденных</b><span style="min-width:60px"></span></div>';
if(cur.k==='pick'&&R&&R.ph==='pick'){
h+='<div style="display:flex;gap:10px;align-items:center"><div style="width:72px;height:72px;flex:none">'+face('happy')+'</div><p style="font-size:16px">'+
esc(R.st?T('z4q.port.pick',0,'Ещё одну вещь — и дальше. Портфель не резиновый, но я верю.'):T('z4q.port.start',0,'Пять пройденных уровней подряд. Выбери, что взять в портфель.'))+'</p></div>'+
bag(R)+tiles(R)+'<p style="font-size:14px;color:var(--z3-ink2,#5d6781)">Вещь остаётся до конца портфеля. Счёт — за слова: сколько букв, столько очков; промах −1.</p>';
w.innerHTML=h;mountTiles(w,R,function(){portPlay(R);});}
else{
if(X.can('port')){var pi=R?(R.ph==='pick'?bt('pick','Выбрать вещь ▶',1):bt('pplay','Уровень '+(R.st+1)+' из 5 ▶',1))+bt('pnew','Начать заново'):bt('pnew','Собрать портфель ▶',1);
h+=sect('🎒','Портфель четверти',R?'Идёт: уровень '+Math.min(5,R.st+1)+' из 5 · '+R.sc+' очк.':'5 пройденных уровней подряд и школьные вещи'+(+z.pb?' · лучший счёт '+z.pb:''),(R?bag(R):'')+pi);}
if(X.can('kontr')){var kz=+z.kd===X.tk()?z:{ki:0,ks:'',kp:0},dn=+kz.ki>=5;
h+=sect('📝','Контрольная дня','5 коротких уровней — у всех одинаковые, с тем же условием',
'<p style="font-size:24px;letter-spacing:2px;margin:8px 0 0">'+tabel(kz)+(dn?' <span style="font-size:15px">'+(+kz.kp||0)+' очк.</span>':'')+'</p>'+
(dn?(canShare()?bt('kshr','Переслать табель',1):'')+'<p style="font-size:14px;margin:6px 0 0">Завтра — новая.</p>':bt('kplay',kz.ki?'Задание '+(+kz.ki+1)+' ▶':'Писать ▶',1)));}
if(X.can('tetr')){var tp=+z.tp||0,MX=weak()?6:15,from=Math.max(0,tp-MX),pg='';
for(var p=from;p<tp;p++){var lv=page(p);if(lv)pg+=mini(lv,p);}
h+=sect('📓','Бесконечная тетрадь','Исписано клеток: <b>'+(+z.tc||0)+'</b> · страниц: '+tp,
(from?'<p style="font-size:14px;text-align:center;margin:8px 0 0">… ещё '+from+' '+plu(from,'страница','страницы','страниц')+' выше</p>':'')+pg+
'<div style="text-align:center">'+bt('tplay','Страница '+(tp+1)+' ▶',1)+'</div>');}
w.innerHTML=h;}
[].forEach.call(w.querySelectorAll('[data-a]'),function(b){b.onclick=function(){snd('tap');var a=b.getAttribute('data-a'),R1=X.run(),z1=X.zz();
if(a==='back'){cur=null;home();}
else if(a==='pnew'){if(portNew())ZB.go('z4q',{k:'pick'});else try{toast('Нужно пройти побольше уровней',2500);}catch(e){}}
else if(a==='pick')ZB.go('z4q',{k:'pick'});
else if(a==='pplay')portPlay(R1);
else if(a==='kplay')kPlay();
else if(a==='kshr')kShare();
else if(a==='tplay')play(page(+z1.tp||0),{k:'tetr',i:+z1.tp||0,tag:String(+z1.tp||0)});};});
if(cur.k==='tetr')setTimeout(function(){try{el.scrollTop=el.scrollHeight;}catch(e){}},30);
X.ev('scr',{k:cur.k});}});
QX.open=function(k){if(!X.any()){try{toast('Забеги откроются с '+X.LV+'-го уровня',2500);}catch(e){}return;}
var R=X.run();if(k==='port'&&R&&R.ph==='pick'){ZB.go('z4q',{k:'pick'});return;}
ZB.go('z4q',{k:k==='tetr'?'tetr':'home'});};
})();
