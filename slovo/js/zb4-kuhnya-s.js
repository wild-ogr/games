'use strict';
(function(){
var Z=window.Z4,KU=Z&&Z.KUHNYA;if(!Z||!Z.on||!KU||KU._s)return;KU._s=1;
var O=KU.on,n=KU.n,ZB=window.ZB;
var Q=location.search,SHIFT=+((/[?&]z4ak=(\d+)/.exec(Q)||[])[1]||0);
function okp(){return typeof OK!=='undefined'&&!!OK;}
function now(){var t=0;try{t=typeof nowMs==='function'?nowMs():Date.now();}catch(e){t=Date.now();}return t+SHIFT*60000;}
function day(){try{return+todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function wk(){var d=new Date(now()),k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function hsh(s){s=String(s);var h=0x811c9dc5;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function norm(w){return String(w||'').toLowerCase().replace(/ё/g,'е');}
function A(){if(!S.z4a||typeof S.z4a!=='object')S.z4a=JSON.parse(JSON.stringify(KU.DEF));return S.z4a;}
function sv(){try{save();}catch(e){}}
function lsG(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function ev(a,o){o=o||{};o.a=a;Z.ev('z4a',o);}
function tx(k,c){return Z.txt(k,c)||'';}
function give(k){try{return window.ZBECO?ZBECO.give('z4a',k,'z4a'):0;}catch(e){return 0;}}
if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4a==null)ZBECO.cap.z4a=15;
function op(id){return O[id]&&Z.open(id==='pod'||id==='dacha'?'z4a.'+id:'z4a');}
var D=null,CAT=null;
function data(){if(D)return Promise.resolve(D);return ZB.load('js/zb4-kuhnya-data.js').then(function(){D=window.Z4A_D||null;if(D)prep();return D;});}
function cats(){if(CAT)return Promise.resolve(CAT);return ZB.load('js/zb4-cat.js').then(function(){var C=window.Z4A_CAT||{};CAT={};
for(var k in C){CAT[k]={};C[k].split(' ').forEach(function(w){CAT[k][w]=1;});}return CAT;});}
var PW=[],PWI={};
function prep(){PW=[];PWI={};D.rc.forEach(function(r){r[1].forEach(function(w){if(!(w in PWI)){PWI[w]=PW.length;PW.push(w);}});});}
function bit(s,i){return(s||'').charAt(i)==='1';}
function setBit(s,i){s=s||'';while(s.length<=i)s+='0';return s.slice(0,i)+'1'+s.slice(i+1);}
var LV=[];
function note(p,t){if(t)LV.push([p,t]);}
var NB=['Зоя Макаровна','Павел Игнатьевич','Фаина Степановна','Борис Львович','Роза Фёдоровна','Савелий Палыч'];
function need(){return okp()?4:5;}
function week(){var z=A(),w=wk();if(!D||z.w===w)return z;
if(z.w&&z.bi.length===2){var full=z.bf?1:0,i=z.bn[0]<need()?z.bi[0]:z.bi[1],g=(D.ing[i]||[])[1]||'свёклы';
var h=(z.bh?z.bh.split(','):[]).filter(Boolean);h.push(z.w+':'+full);z.bh=h.slice(-6).join(',');
lsS('z4a-k',{d:day(),t:full?tx('z4a.full'):tx('z4a.pale',{ing:g}),f:full});ev('borsch',{r:full?'full':'pale',a1:z.bn[0],a2:z.bn[1]});}
var r=hsh('b'+w),a=r%D.ing.length,b=(a+1+(r>>>8)%(D.ing.length-1))%D.ing.length;
z.w=w;z.bi=[a,b];z.bn=[0,0];z.bf=0;sv();return z;}
function frac(){var d=new Date(now()),k=(d.getDay()+6)%7;return Math.min(1,(k+d.getHours()/24+0.5)/7);}
function nbHave(){var f=frac(),N=need();return Math.min(N,Math.ceil(N*f*1.7));}
function bAdd(k,why){var z=week();if(!z.bi.length)return;var j=k==null?(z.bn[0]<=z.bn[1]?0:1):k,N=need();
if(z.bn[j]>=N)j=1-j;if(z.bn[j]>=N)return;z.bn[j]++;var ing=D.ing[z.bi[j]][0];
note(2,'В общий борщ — '+ing+': '+z.bn[j]+' из '+N+'.');
if(!z.bf&&z.bn[0]>=N&&z.bn[1]>=N){z.bf=1;var c=give(10);note(6,(c?'+'+c+' 💰 · ':'')+tx('z4a.full'));ev('borsch',{r:'done',why:why});}sv();}
function bLine(){var z=week();if(!z.bi.length)return'';var N=need();
return'Общий борщ: твои '+D.ing[z.bi[0]][0]+' '+Math.min(N,z.bn[0])+'/'+N+' и '+D.ing[z.bi[1]][0]+' '+Math.min(N,z.bn[1])+'/'+N+(z.bf?' — сварен!':'');}
function bookWord(w){var i=PWI[w];if(i==null)return;var z=A();if(bit(z.kp,i))return;z.kp=setBit(z.kp,i);
D.rc.forEach(function(r,k){if(bit(z.kc,k))return;if(r[1].every(function(x){return bit(z.kp,PWI[x]);})){z.kc=setBit(z.kc,k);var c=give(3);
note(5,(c?'+'+c+' 💰 · ':'')+tx('z4a.book',{dish:r[0]}));ev('book',{i:k,n:z.kc.split('1').length-1});}});sv();}
function bookN(){return(A().kc.match(/1/g)||[]).length;}
function lvWords(i){try{if(typeof levelData!=='function'||typeof LEVELS==='undefined'||i>=LEVELS.length)return null;
return levelData(i,false).w.map(function(x){return x[0];});}catch(e){return null;}}
function podPick(){var z=A(),d=day();if(z.pd===d)return;
if(z.pd&&z.pw&&!z.ps){z.ps=2;lsS('z4a-pg',{d:d,t:tx('z4a.gone',{w:z.pw.toUpperCase()})});ev('pod',{r:'gone'});}
var L=+S.lv||0,best='',bs=-1,miss=0;
for(var i=L;i<L+5;i++){var ws=lvWords(i);if(!ws){miss=1;break;}
ws.forEach(function(w){var s=w.length*10+(typeof DEFS!=='undefined'&&DEFS[w]?5:0)+(hsh(w+d)%5);if(w.length>=5&&s>bs){bs=s;best=w;}});}
if(miss&&!best){if(window.ZBCH&&ZBCH.load&&!podPick._l){podPick._l=1;ZBCH.load().then(function(){podPick._l=0;podPick();},function(){});}return;}
if(!best)return;z.pd=d;z.pw=best;z.pl=L;z.ps=0;sv();ev('pod',{r:'new',l:best.length});}
function podCheck(w,lv){var z=A();if(z.ps||!z.pw)return;if(w===z.pw){z.ps=1;z.pn++;var c=give(3),sh=lsG('z4a-p',[]);if(!(sh instanceof Array))sh=[];
sh.push({w:w,d:day(),lv:lv,t:typeof DEFS!=='undefined'&&DEFS[w]||''});lsS('z4a-p',sh.slice(-40));
note(9,(c?'+'+c+' 💰 · ':'')+tx('z4a.pod',{w:w.toUpperCase()}));ev('pod',{r:'ok',lv:lv});sv();}}
function podLate(){var z=A();if(!z.ps&&z.pw&&(+S.lv||0)>z.pl+5){z.ps=2;lsS('z4a-pg',{d:day(),t:tx('z4a.gone',{w:z.pw.toUpperCase()})});ev('pod',{r:'gone'});sv();}}
var CN={ovosh:'овощ или гриб',frukt:'фрукт или ягоду',eda:'что-нибудь съестное',posuda:'посуду',odezhda:'одёжку',mebel:'вещь для дома',zver:'зверя или рыбу',
ptica:'птицу',bukashka:'букашку',rastenie:'дерево или цветок',chelovek:'кого-нибудь из людей',transport:'транспорт',telo:'часть тела',instrument:'инструмент',priroda:'что-нибудь из природы'};
var FOOD=['eda','eda','ovosh','frukt'],OTH=['zver','chelovek','odezhda','priroda','rastenie','ptica','posuda','transport','telo','mebel'],LET='кспмтрбвдгнл';
function avoNew(){var z=A(),d=day();if(z.ad===d||!CAT)return;var r=hsh('a'+d+(S.lv>>>4));
var a=FOOD[r%FOOD.length],b=OTH[(r>>>4)%OTH.length],c=LET.charAt((r>>>9)%LET.length),L=3+(r>>>13)%3;
z.ad=d;z.ai='c:'+a+'|c:'+b+'|l:'+c+L;z.af=0;sv();ev('avo',{r:'new',i:z.ai});}
function avoItems(){var z=A();return z.ai?z.ai.split('|'):[];}
function avoLbl(it){var p=it.split(':');if(p[0]==='c')return CN[p[1]]||p[1];var L=+p[1].slice(1);return'слово на «'+p[1].charAt(0).toUpperCase()+'» из '+L+' букв';}
function avoWord(w){var z=A();if(z.ad!==day()||!CAT)return;var I=avoItems(),all=(1<<I.length)-1;if(!I.length||z.af===all)return;
for(var i=0;i<I.length;i++){if(z.af&(1<<i))continue;var p=I[i].split(':'),ok=p[0]==='c'?!!(CAT[p[1]]&&CAT[p[1]][w]):(w.charAt(0)===p[1].charAt(0)&&w.length===+p[1].slice(1));
if(ok){z.af|=1<<i;note(3,'В авоську: '+w.toUpperCase()+' ('+avoLbl(I[i])+').');break;}}
if(z.af===all){z.an++;var c=give(5);note(7,(c?'+'+c+' 💰 · ':'')+tx('z4a.avo'));ev('avo',{r:'done',n:z.an});}sv();}
function avoDone(){var z=A();return z.ad===day()&&z.af===(1<<avoItems().length)-1;}
var GROW=480,GROWW=300;
function mins(){return Math.floor(now()/60000);}
function bed(i){var g=A().g[i];return g&&g instanceof Array?g:null;}
function ripe(i){var b=bed(i);if(!b)return false;return mins()-b[1]>=(A().gw===day()?GROWW:GROW);}
function left(i){var b=bed(i);if(!b)return 0;return Math.max(0,(A().gw===day()?GROWW:GROW)-(mins()-b[1]));}
function seeds(){var r=hsh('s'+day()),s=[];for(var k=0;s.length<3&&k<12;k++){var c=LET.charAt((r>>>k*2)%LET.length);if(s.indexOf(c)<0)s.push(c);}return s;}
function plant(i,c){var z=A();if(!z.g.length)z.g=['','',''];if(bed(i))return;z.g[i]=[c,mins()];sv();ev('plant',{c:c});}
function water(){var z=A();if(z.gw===day())return'';z.gw=day();sv();ev('water');return tx('z4a.water');}
function grow(c,salt){var L=[];try{if(typeof DEFS!=='undefined')for(var w in DEFS)if(w.charAt(0)===c&&w.length>=4&&w.length<=7)L.push(w);}catch(e){}
if(!L.length&&typeof DICT_MAIN==='string')L=DICT_MAIN.split(' ').filter(function(w){return w.charAt(0)===c&&w.length>=4&&w.length<=6;}).slice(0,400);
return L.length?L[hsh(c+salt)%L.length]:c+'…';}
function harvest(i){var b=bed(i);if(!b||!ripe(i))return null;var z=A(),w=grow(b[0],b[1]),cat=hsh('k'+b[1])%5===0,msg='';
if(cat){w=grow(LET.charAt(hsh('c'+b[1])%LET.length),b[1]+1);msg=tx('z4a.cat',{w:w.toUpperCase()});}
z.g[i]='';z.gh++;var jar=0;if(z.gk!==day()&&z.gj<3){z.gj++;z.gk=day();jar=1;}
var H=lsG('z4a-g',[]);if(!(H instanceof Array))H=[];H.push(w);lsS('z4a-g',H.slice(-40));sv();ev('harvest',{cat:cat?1:0,jar:jar});
return{w:w,jar:jar,msg:msg};}
function jarOk(){var z=A();return op('dacha')&&z.gj>0&&z.gd!==day();}
function jarUse(){var z=A();if(!jarOk())return false;z.gj--;z.gd=day();sv();ev('jar',{lv:(+S.lv||0)+1});
try{if(typeof hbAdd==='function')hbAdd(1,'z4a');else S.hb=(+S.hb||0)+1;}catch(e){}
try{if(typeof hintLetter==='function')hintLetter();}catch(e){}
setTimeout(function(){try{if(!(S.z3k&&S.z3k.z)&&typeof zina==='function')zina(tx('z4a.jar'),'happy',4);}catch(e){}},900);return true;}
function hardReg(){var K=window.Z3K;if(!K||!K.onHard||K.onHard.__z4a)return;K.onHard.__z4a=1;
K.onHard.push(function(box,c){if(!jarOk()||!box||document.getElementById('z4aJar'))return;var b=document.createElement('button');b.type='button';b.id='z4aJar';
b.className='btn ghost small';b.title='Банка с грядки: одна буква';b.style.cssText='min-width:44px;min-height:44px;font-size:20px;padding:0 8px';
b.textContent='🍯';b.onclick=function(){if(jarUse())b.remove();};box.appendChild(b);});}
function rude(w){try{if(typeof h32!=='function'||typeof ZINA_RUDE!=='string')return false;var R=rude.R||(rude.R=new Set(ZINA_RUDE.split(' ')));
for(var a=0;a<w.length;a++)for(var b=a+3;b<=w.length;b++)if(R.has(h32(w.slice(a,b))))return true;}catch(e){return true;}return false;}
function valDef(w){var a=(Z4T&&Z4T['z4a.va'])||[],b=(Z4T&&Z4T['z4a.vb'])||[];if(!a.length||!b.length)return'';var h=hsh(w);
return w.toUpperCase()+' — '+a[h%a.length]+'. '+b[(h>>>7)%b.length];}
function valMiss(w){if(!/^[а-я]{4,9}$/.test(w))return;var z=A(),d=day();if(z.vd!==d){z.vd=d;z.vc=0;}if(z.vc>=3)return;
try{if(typeof isWord==='function'&&isWord(w))return;if(typeof whyNot==='function'&&whyNot(w))return;}catch(e){return;}
if(rude(w))return;var V=lsG('z4a-v',[]);if(!(V instanceof Array))V=[];if(V.some(function(x){return x.w===w;}))return;
var t=valDef(w);if(!t)return;V.push({w:w,t:t,d:d});lsS('z4a-v',V.slice(-60));z.vc++;z.vn++;sv();note(4,'📓 '+t);ev('val',{n:z.vn,l:w.length});}
var CUR=null;
Z.onStart(function(i){LV=[];CUR=i;if(!D)return;if(op('borsch'))week();if(op('pod'))podPick();if(op('avo')&&!CAT)cats().then(avoNew,function(){});else if(op('avo'))avoNew();});
Z.onWord(function(o){if(!D)return;var w=norm(o.w);
if(op('pod')&&!o.G.daily)podCheck(w,o.lv);
if(op('book'))bookWord(w);
if(op('avo'))avoWord(w);
if(op('borsch')&&!o.G.daily&&!o.G.mode){var z=week(),k=-1;if(z.bi.length)for(var j=0;j<2;j++)if(D.ing[z.bi[j]][2]===w&&!(o.G.__z4ab&(1<<j))){k=j;o.G.__z4ab=(o.G.__z4ab||0)|(1<<j);}
if(k>=0)bAdd(k,'word');}});
Z.onMiss(function(o){if(!D||o.why!=='bad'||!op('val'))return;if(o.G&&(o.G.tut||o.G.daily))return;valMiss(norm(o.w));});
Z.onWin(function(i){if(!D)return;if(op('borsch')&&i.first&&!i.daily&&!i.mode&&!i.mix)bAdd(null,'lvl');if(op('pod'))podLate();});
Z.winLine.add({id:'z4a',order:40,txt:function(){if(!LV.length)return'';var b=LV[0];LV.forEach(function(x){if(x[0]>b[0])b=x;});LV=[];return b[1];}});
function cardLine(){var z=A(),k=lsG('z4a-k',null),pg=lsG('z4a-pg',null);
if(k&&k.t&&!k.seen)return['🍲',k.t,'k'];
if(pg&&pg.t&&pg.d===day()&&!pg.seen)return['🧺',pg.t,'pg'];
if(op('pod')&&z.pd===day()&&!z.ps&&z.pw)return['🧺','Под дверью подкидыш: '+z.pw.toUpperCase()+'. Пристрой его — найди в ближайших пяти уровнях.',''];
if(op('dacha')){for(var i=0;i<3;i++)if(ripe(i))return['🌱','На балконе поспело слово! Собери урожай в банку.',''];
if(!A().g.length||!bed(0)&&!bed(1)&&!bed(2))return['🌱','Ящик на балконе пустует. Посади букву — к вечеру вырастет слово.',''];}
if(op('avo')&&z.ad===day()&&!avoDone()){var I=avoItems(),got=0;I.forEach(function(x,j){if(z.af&(1<<j))got++;});
return['🛒','Авоська дня: '+got+' из '+I.length+'. '+I.filter(function(x,j){return!(z.af&(1<<j));}).map(avoLbl).join(', ')+'.',''];}
if(op('borsch'))return['🍲',bLine(),''];
return null;}
Z.card.add({id:'z4a',order:40,show:function(){return!!D&&op('borsch')||!!D&&op('avo');},
html:function(){var c=cardLine();if(!c)return'';CL=c;
return'<div class="z4a-card"><span class="z4a-ic" aria-hidden="true">'+c[0]+'</span><div class="z4a-ct"><b>Кухня Зины</b><span>'+esc(c[1])+'</span></div>'+
'<button type="button" class="btn ghost small z4a-go">На кухню</button></div>';},
mount:function(el){var b=el&&el.querySelector('.z4a-go');if(b)b.onclick=function(){if(CL&&CL[2]){var x=lsG('z4a-'+CL[2],null);if(x){x.seen=1;lsS('z4a-'+CL[2],x);}}ZB.go('z4kuh');};}});
var CL=null;
function css(){if(document.getElementById('z4aCss'))return;var s=document.createElement('style');s.id='z4aCss';
s.textContent='.z4a-card{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--z3-card);border:1px solid var(--z3-line);border-radius:var(--z3-rb);color:var(--z3-ink);font-size:14px;line-height:1.35}'+
'.z4a-ic{font-size:26px}.z4a-ct{flex:1;display:flex;flex-direction:column;gap:2px}.z4a-go{min-height:44px;white-space:nowrap}'+
'#zb-z4kuh{background:var(--z3-bg);color:var(--z3-ink);font-family:var(--z3-font);overflow-y:auto}'+
'.z4k{max-width:640px;margin:0 auto;padding:10px 12px 40px}.z4k-hd{display:flex;align-items:center;gap:10px;margin:4px 0 10px}.z4k-hd b{font-size:20px;font-family:var(--z3-font-head)}'+
'.z4k-s{background:var(--z3-card);border:1px solid var(--z3-line);border-radius:var(--z3-rb);padding:12px;margin:0 0 10px;font-size:15px;line-height:1.4}'+
'.z4k-s h3{margin:0 0 6px;font-size:16px;font-family:var(--z3-font-head)}.z4k-s small{color:var(--z3-ink2);font-size:13.5px}'+
'.z4k-row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.z4k-row .btn{min-height:44px;min-width:44px}'+
'.z4k-i{display:inline-block;padding:3px 8px;border-radius:10px;background:var(--z3-paper);border:1px solid var(--z3-line);margin:2px;font-size:14px}.z4k-i.ok{background:#e3f1e5;border-color:var(--z3-ok)}'+
'.z4k-bed{flex:1;min-width:90px;text-align:center;padding:8px 4px;border:1px dashed var(--z3-line);border-radius:12px;background:var(--z3-paper)}.z4k-bed b{display:block;font-size:22px}'+
'.z4k-l{margin:4px 0;font-size:14px}.z4k-l b{text-transform:uppercase}';
document.head.appendChild(s);}
function bar(a,N){var s='';for(var i=0;i<N;i++)s+=i<a?'●':'○';return s;}
function render(el,msg){var z=A();if(op('borsch'))week();var h='<div class="z4k"><div class="z4k-hd"><button type="button" class="btn ghost small" data-k="home" style="min-height:44px">‹ Дом</button><b>Кухня Зины</b></div>';
if(msg)h+='<div class="z4k-s" style="background:var(--z3-paper)">'+esc(msg)+'</div>';
if(op('pod')){h+='<div class="z4k-s"><h3>🧺 Подкидыш</h3>';
if(z.pd===day()&&z.pw)h+=z.ps===1?'<p>'+esc(z.pw.toUpperCase())+' пристроен — живёт на полке.</p>':z.ps===2?'<p>'+esc(z.pw.toUpperCase())+' ушёл к соседке.</p>':
'<p>Под дверью — <b>'+esc(z.pw.toUpperCase())+'</b>. Найди это слово в ближайших пяти уровнях — и оно наше.</p>';
else h+='<p><small>Утром под дверью появится диковинное слово.</small></p>';
var sh=lsG('z4a-p',[]);if(sh instanceof Array&&sh.length){h+='<small>Полка ('+sh.length+'):</small>';sh.slice(-8).reverse().forEach(function(x){
h+='<div class="z4k-l"><b>'+esc(x.w)+'</b> — пристроен на '+esc(x.lv)+'-м уровне'+(x.t?'. '+esc(x.t):'')+'</div>';});}
h+='</div>';}
if(op('avo')&&z.ad===day()){var I=avoItems();h+='<div class="z4k-s"><h3>🛒 Авоська дня</h3><div>';
I.forEach(function(x,j){h+='<span class="z4k-i'+(z.af&(1<<j)?' ok':'')+'">'+(z.af&(1<<j)?'✓ ':'')+esc(avoLbl(x))+'</span>';});
h+='</div><small>Закрывается любыми словами в любых уровнях — и бонусными тоже.</small></div>';}
if(op('borsch')&&z.bi.length){var N=need(),nb=nbHave();h+='<div class="z4k-s"><h3>🍲 Общий борщ недели</h3><small>Бригада стройки обедает у Зины. Каждый пройденный уровень — порция в кастрюлю, слово-продукт — ещё одна.</small>';
D.ing.forEach(function(g,i){var j=z.bi.indexOf(i),who=j>=0?'ты':NB[(hsh(z.w+':'+i))%NB.length],a=j>=0?z.bn[j]:nb;
h+='<div class="z4k-l">'+esc(g[0])+' — '+esc(who)+': '+bar(Math.min(a,N),N)+'</div>';});
h+=z.bf?'<p>Твоё — в кастрюле. Борщ будет наваристый!</p>':'<p><small>Не хватит своего к воскресенью — борщ выйдет бледный. Ничего страшного.</small></p>';
var bh=(z.bh?z.bh.split(','):[]).filter(Boolean);if(bh.length)h+='<small>Прошлые: '+bh.map(function(x){return x.split(':')[1]==='1'?'наваристый':'бледный';}).join(', ')+'</small>';
h+='</div>';}
if(op('dacha')){var sd=seeds();h+='<div class="z4k-s"><h3>🌱 Грядка на балконе</h3><div class="z4k-row">';
for(var i=0;i<3;i++){var b=bed(i);h+='<div class="z4k-bed">';
if(!b){h+='<small>пусто</small><div class="z4k-row" style="justify-content:center">';sd.forEach(function(c){h+='<button type="button" class="btn ghost small" data-p="'+i+':'+c+'">'+c.toUpperCase()+'</button>';});h+='</div>';}
else if(ripe(i))h+='<b>'+esc(b[0].toUpperCase())+'</b><button type="button" class="btn small" data-h="'+i+'" style="min-height:44px">Собрать</button>';
else{var m=left(i);h+='<b>'+esc(b[0].toUpperCase())+'</b><small>растёт ещё '+(m>=60?Math.ceil(m/60)+' ч':m+' мин')+'</small>';}
h+='</div>';}
h+='</div><div class="z4k-row">'+(z.gw===day()?'<small>Сегодня полито.</small>':'<button type="button" class="btn ghost small" data-w="1">Полить (раз в день)</button>')+'</div>';
h+='<small>Банок с урожаем: '+z.gj+' из 3. На трудном уровне банка откроет букву (одну в день).</small>';
var H=lsG('z4a-g',[]);if(H instanceof Array&&H.length)h+='<div><small>Выросло: '+H.slice(-10).map(function(x){return esc(String(x).toUpperCase());}).join(', ')+'</small></div>';
h+='</div>';}
if(op('book')){var nk=bookN();h+='<div class="z4k-s"><h3>📒 Кулинарная книга ('+nk+' из '+D.rc.length+')</h3><small>Слова-продукты из любых уровней открывают блюда.</small>';
D.rc.forEach(function(r,k){var got=r[1].filter(function(w){return bit(z.kp,PWI[w]);});if(!got.length&&!bit(z.kc,k))return;
h+='<div class="z4k-l">'+(bit(z.kc,k)?'✓ <b style="text-transform:none">'+esc(r[0])+'</b>':esc(r[0])+': '+r[1].map(function(w){return bit(z.kp,PWI[w])?esc(w):'…';}).join(', '))+'</div>';});
h+='</div>';}
if(op('val')){var V=lsG('z4a-v',[]);if(V instanceof Array&&V.length){h+='<div class="z4k-s"><h3>📓 Словарь Валерки ('+V.length+')</h3><small>Слова, которых нет. Валерка с этим не согласен.</small>';
V.slice(-12).reverse().forEach(function(x){h+='<div class="z4k-l">'+esc(x.t)+'</div>';});h+='</div>';}}
h+='</div>';el.innerHTML=h;
[].forEach.call(el.querySelectorAll('[data-k]'),function(b){b.onclick=function(){try{openMenu();}catch(e){}};});
[].forEach.call(el.querySelectorAll('[data-p]'),function(b){b.onclick=function(){var p=b.getAttribute('data-p').split(':');plant(+p[0],p[1]);render(el);};});
[].forEach.call(el.querySelectorAll('[data-h]'),function(b){b.onclick=function(){var r=harvest(+b.getAttribute('data-h'));
render(el,r?(r.msg||'Выросло «'+r.w.toUpperCase()+'»!')+(r.jar?' Закатала в банку.':' Банка на сегодня уже есть — слово в копилку.'):'');};});
[].forEach.call(el.querySelectorAll('[data-w]'),function(b){b.onclick=function(){render(el,water());};});}
ZB.screen('z4kuh',{title:'Кухня Зины',render:function(el){css();el.innerHTML='<div class="z4k"><p style="padding:16px">Зина ставит чайник…</p></div>';
data().then(function(){if(ZB.cur==='z4kuh'||!ZB.cur)render(el);ev('open');},function(){el.innerHTML='<div class="z4k"><p style="padding:16px">Кухня закрыта на проветривание. Загляни позже.</p><button type="button" class="btn ghost small" onclick="openMenu()">‹ Дом</button></div>';});}});
css();
data().then(function(){week();if(op('pod'))podPick();if(op('avo'))cats().then(avoNew,function(){});
if(op('dacha'))hardReg();try{if(ZB.cur==='home'||document.getElementById('menu')&&document.getElementById('menu').classList.contains('on'))ZB.refresh();}catch(e){}},function(){});
KU.st=function(){return A();};
KU.T={week:week,bAdd:bAdd,bookWord:bookWord,podPick:podPick,podCheck:podCheck,podLate:podLate,avoNew:avoNew,avoWord:avoWord,avoLbl:avoLbl,
plant:plant,water:water,ripe:ripe,harvest:harvest,jarOk:jarOk,jarUse:jarUse,valMiss:valMiss,cardLine:cardLine,need:need,data:data,cats:cats,
lv:function(){return LV;},render:render,wk:wk,day:day};
})();
