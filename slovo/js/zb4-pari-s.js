'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.PARI||Z.PARI.s||typeof ZB==='undefined')return;var P=Z.PARI;P.s=1;var O=P.on,n=P.n;
var CAP=20,CAPB=60,STAKE=10,QS=location.search;
var FP=/[?&]z4pp=1/.test(QS),FK=/[?&]z4pk=1/.test(QS),FW=(/[?&]z4pw=(\d+)/.exec(QS)||[])[1];
try{if(window.ZBECO&&ZBECO.cap){if(ZBECO.cap.z4p==null)ZBECO.cap.z4p=CAP;if(ZBECO.cap.z4pb==null)ZBECO.cap.z4pb=CAPB;}}catch(e){}
function data(){try{if(!window.Z4T||!Z4T['z4p.w'])return ZB.load('js/zb4-pari-data.js').catch(function(){});}catch(e){}return Promise.resolve();}
data();
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function zz(){if(!S.z4p||typeof S.z4p!=='object')S.z4p=JSON.parse(JSON.stringify(P.DEF));return S.z4p;}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function tk(){try{return+todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function now(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}}
function ev(a,p){var o={a:a},k;for(k in p||{})o[k]=p[k];Z.ev('z4p',o);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function up(s){return String(s).toUpperCase();}
function say(t,m,s){try{if(t&&typeof zina==='function')zina(t,m||'happy',s||0);}catch(e){}}
function give(src,k){try{return window.ZBECO?ZBECO.give(src,k,src)||0:0;}catch(e){return 0;}}
function plur(k,a,b,c){try{return typeof plural==='function'?plural(k,a,b,c):c;}catch(e){return c;}}
function coinI(){try{return COIN_I;}catch(e){return'монет';}}
function mon(k){return k+' '+plur(k,'монета','монеты','монет');}
function nrm(c){return c==='ё'?'е':c;}
var VOW='аеёиоуыэюя';
var RL=[['v','','слова на гласную — очки ×2'],['l','р','слова с буквой Р — ×2'],['n',5,'слова из 5 букв и длиннее — +3 ✦'],['b','','бонусные слова — ×3'],
['l','к','слова с буквой К — ×2'],['e','а','слова на -А — ×2'],['s','с','слова на С — +5 ✦'],['d','','слова с двумя одинаковыми буквами — ×2'],
['l','л','слова с буквой Л — ×2'],['x',3,'слова из трёх букв — ×2'],['s','п','слова на П — +5 ✦'],['l','т','слова с буквой Т — ×2'],
['e','о','слова на -О — ×2'],['n',6,'слова из 6 букв и длиннее — +5 ✦'],['l','м','слова с буквой М — ×2'],['s','к','слова на К — +5 ✦'],
['c','','слова на согласную — +2 ✦'],['l','н','слова с буквой Н — ×2'],['e','к','слова на -К — ×2'],['s','м','слова на М — +5 ✦'],
['l','д','слова с буквой Д — ×2'],['b','','бонусные слова — ×3'],['l','в','слова с буквой В — ×2'],['s','т','слова на Т — +5 ✦'],
['e','т','слова на -Т — ×2'],['l','б','слова с буквой Б — ×2'],['v','','слова на гласную — очки ×2'],['s','б','слова на Б — +5 ✦'],
['l','г','слова с буквой Г — ×2'],['n',5,'слова из 5 букв и длиннее — +3 ✦'],['e','р','слова на -Р — ×2'],['l','з','слова с буквой З — ×2'],
['s','в','слова на В — +5 ✦'],['l','у','слова с буквой У — ×2'],['d','','слова с двумя одинаковыми буквами — ×2'],['s','д','слова на Д — +5 ✦'],
['l','ч','слова с буквой Ч — ×3'],['x',3,'слова из трёх букв — ×2'],['l','ш','слова с буквой Ш — ×3'],['s','р','слова на Р — +5 ✦'],
['e','а','слова на -А — ×2'],['l','ж','слова с буквой Ж — ×3'],['s','л','слова на Л — +5 ✦'],['l','и','слова с буквой И — ×2'],
['n',6,'слова из 6 букв и длиннее — +5 ✦'],['l','я','слова с буквой Я — ×2'],['s','г','слова на Г — +5 ✦'],['l','ь','слова с мягким знаком — ×2'],
['c','','слова на согласную — +2 ✦'],['l','ц','слова с буквой Ц — ×3'],['s','н','слова на Н — +5 ✦'],['l','х','слова с буквой Х — ×3']];
function wkNo(){var d=new Date(now()),u=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5;return Math.floor((u+3)/7);}
function ruleI(){return FW!=null?(+FW%52):(wkNo()%52);}
function rule(){return RL[ruleI()];}
function rPts(r,w,bonus){var L=w.length,c0=nrm(w.charAt(0)),cz=nrm(w.charAt(L-1)),t=r[0],x=r[1],base=bonus?Math.ceil(L/2):L;
if(t==='v')return VOW.indexOf(c0)>=0?base:0;
if(t==='c')return VOW.indexOf(c0)<0&&'ьъ'.indexOf(c0)<0?2:0;
if(t==='l'){if(w.indexOf(x)<0)return 0;return/×3/.test(r[2])?base*2:base;}
if(t==='n')return L>=x?(x>=6?5:3):0;
if(t==='b')return bonus?base*2:0;
if(t==='e')return cz===x?base:0;
if(t==='s')return c0===x?5:0;
if(t==='d'){var s={};for(var i=0;i<L;i++){if(s[w.charAt(i)])return base;s[w.charAt(i)]=1;}return 0;}
if(t==='x')return L===3?base:0;return 0;}
P.rule=function(){var r=rule();return{i:ruleI(),t:r[2],wk:wkNo()};};
var st={g:null};P.st=function(){return st;};
function lvOf(g){return g.idx+1;}
function fit(g,mix){return!!g&&Z.open('z4p')&&!g.daily&&!g.mode&&!g.tut&&!g.fest&&!mix;}
function isNew(g){try{return g.idx===+S.lv;}catch(e){return false;}}
function schoolCtl(lv){try{return window.ZBS&&ZBS.ctlAt?!!ZBS.ctlAt(lv):false;}catch(e){return false;}}
function rare(g,lv){var R='жшщцчфхэюзгбдпвкмтслнрапо',firsts={};g.words.forEach(function(x){firsts[x.w.charAt(0)]=1;});
var L=[];for(var i=0;i<R.length;i++)if(firsts[R.charAt(i)])L.push(R.charAt(i));if(!L.length)return'';
return L[Math.min(L.length-1,(lv%3))];}
function goals(g,lv){var G2=[],W=g.words.map(function(x){return x.w;}),b=rare(g,lv);
if(b)G2.push({k:'z',b:b});
if(W.filter(function(w){return w.length>=5;}).length>=2)G2.push({k:'d'});else if(W.some(function(w){return w.length>=6;}))G2.push({k:'l'});
G2.push({k:'n'});if(G2.length<3)G2.push({k:'b'});
G2.forEach(function(x){x.r=0;});return G2.slice(0,3);}
function gTxt(x){if(x.k==='z')return'на «'+up(x.b)+'»';if(x.k==='d')return'5+ и 5+ подряд';if(x.k==='l')return'слово 6+';
if(x.k==='n')return isOK()?'≤1 промаха':'без промахов';return'бонусное';}
var CR=[['nh','без подсказок'],['bo','найди бонусное слово'],['lg','слово из 6 букв сам']];
function ctlRule(g,lv){var L=CR.filter(function(r){return r[0]!=='lg'||g.words.some(function(x){return x.w.length>=6;});});return L[(lv/20|0)%L.length];}
function init(g,mix){if(!g)return st;if(st.g===g)return st;var lv=lvOf(g),z=zz();
st={g:g,lv:lv,on:fit(g,mix)?1:0,ctl:null,stk:null,stOff:0,pari:null,pw:0,wl:'',last:0,miss:0,hint0:0,wk:0,wkSaid:0,res:null,gift:0,nw:0};
if(!st.on)return st;
var nw=isNew(g)||FP||FK;st.nw=isNew(g)?1:0;
var fx=function(){return FP||FK||!Z.fx||Z.fx('z4p',g);};
if(O.ctl&&nw&&(FK||(lv>=40&&lv%20===0&&!schoolCtl(lv))||n(z.kr))&&fx()){var r=ctlRule(g,lv);
st.ctl={re:!(FK||(lv>=40&&lv%20===0))&&!!n(z.kr),lim:isOK()?4:3,r:r[0],rt:r[1],bad:0,ok:1,bon:0,lg:0};
if(st.ctl.re){z.kr=0;st.gift=1;}z.kl=lv;sv();}
else if(O.moy&&nw&&(FP||(lv>=20&&lv%(isOK()?4:3)===0))&&fx()){st.pari=goals(g,lv);}
else if(O.st&&nw&&lv>=20&&lv%(isOK()?4:3)===1&&(+S.coins||0)>=40&&(n(z.sd)!==tk()||n(z.sn)<2)&&fx())st.stOff=1;
if(O.s5&&n(z.op)){z.op=0;st.gift=st.gift||2;sv();}
return st;}
function giftLetter(why){var g=st.g;setTimeout(function(){if(typeof G==='undefined'||G!==g||g.won)return;ZB.safe('z4p-gift',function(){
var ok=function(c){return!c.open&&!c.lock;},ws=g.words.filter(function(x){return!x.found&&wordCells(x).some(ok);});if(!ws.length)return;
ws.sort(function(a,b){return b.w.length-a.w.length;});var c=null,cs=wordCells(ws[0]);for(var i=0;i<cs.length;i++)if(ok(cs[i])){c=cs[i];break;}if(!c)return;
openCell(c,0,'cat');try{SND.open();}catch(e){}
if(why===1)say(Z.txt('z4p.kr')||'Валентина Петровна: пересдача! Одну букву даю — остальное сам.','norm');
else say(Z.txt('z4p.s3')||'Три уровня без подсказок — буква тебе в подарок!','happy');
try{checkAutoFoundAndWin();saveCur();}catch(e){}});},1400);}
function mm(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
function stTxt(){var k=st.stk;if(!k)return'';if(k.r===1)return'✅ Ставка сыграла! После уровня — '+mon(STAKE*3);if(k.r===-1)return'✗ Ставка не сыграла — ничего, бывает';
return'🤝 Ставка '+STAKE+': '+(k.k==='tm'?'успеть за <b>'+mm(k.to-(now()-k.t0)/1000)+'</b>':'<b>без подсказок</b>');}
function draw(){var e=document.getElementById('z4pBar');if(!e)return;var g=typeof G!=='undefined'?G:null;
if(!st.on||!g||st.g!==g){e.style.display='none';e.innerHTML='';return;}var h='';
if(st.ctl){var c=st.ctl;h='<span class="z4pi">📝</span><span class="z4pt">'+(c.re?'Пересдача':'Контрольная')+' · ошибок <b>'+c.bad+'/'+c.lim+'</b> · '+esc(c.rt)+(c.ok?'':' · <b class="z4pr">2</b>')+'</span>';}
else if(st.stk)h='<span class="z4pt">'+stTxt()+'</span>';
else if(st.pari)h='<span class="z4pi">🤝</span><span class="z4pt">Пари с моим:</span>'+st.pari.map(function(x){
return'<i class="z4pg'+(x.r>0?' ok':x.r<0?' no':'')+'">'+(x.r>0?'✓ ':x.r<0?'✗ ':'')+esc(gTxt(x))+'</i>';}).join('');
else if(st.stOff&&!st.fw&&!st.miss)h='<span class="z4pt">Поспорим на этот уровень?</span><button type="button" class="z4pb" id="z4pBet">Спорим?</button>';
if(!h){e.style.display='none';e.innerHTML='';return;}css();e.style.display='';e.innerHTML=h;
var b=document.getElementById('z4pBet');if(b)b.onclick=betAsk;}
var cssOk=0;function css(){if(cssOk)return;cssOk=1;var s=document.createElement('style');s.id='z4p-css';s.textContent=
'.z4pbar{display:flex;align-items:center;flex-wrap:wrap;gap:4px 6px;margin:2px 12px 0;padding:3px 8px;min-height:30px;border-radius:12px;background:var(--z3-card);'+
'box-shadow:0 1px 0 var(--z3-line);font:14px/1.25 var(--z3-font);color:var(--z3-ink);box-sizing:border-box;min-width:0}'+
'.z4pbar .z4pi{flex:0 0 auto}.z4pbar .z4pt{flex:0 1 auto;min-width:0;font-size:13.5px;color:var(--z3-ink2)}.z4pbar .z4pt b{color:var(--z3-ink)}.z4pbar .z4pr{color:var(--z3-red,#c62828)}'+
'.z4pbar .z4pg{flex:0 0 auto;font-style:normal;font-size:13.5px;font-weight:700;padding:1px 7px;border-radius:9px;background:var(--z3-paper,#fbf7ec);box-shadow:inset 0 0 0 1px var(--z3-line)}'+
'.z4pbar .z4pg.ok{background:#e3f4e6;color:#1d5e2c}.z4pbar .z4pg.no{color:var(--z3-ink2);text-decoration:line-through}'+
'.z4pbar .z4pb{flex:0 0 auto;margin-left:auto;min-height:44px;min-width:44px;margin-top:-7px;margin-bottom:-7px;padding:0 12px;border:0;border-radius:12px;font:800 15px var(--z3-font);'+
'color:var(--z3-acc-ink,#fff);background:var(--z3-acc-grad,#c2410c);box-shadow:0 2px 0 var(--z3-acc-edge,#8a2e08);cursor:pointer}'+
'.z4pm .btns .btn{min-height:48px}.z4pm p{margin:6px 0}';
document.head.appendChild(s);}
function betAsk(){if(!st.on||!st.stOff||st.stk||typeof G==='undefined'||st.g!==G||G.won)return;try{SND.tap();}catch(e){}
var tm=isOK()?3:2,line=Z.txt('z4p.st0')||'Спорим на монетки? Выиграешь — втрое.';
modal('<div class="z4pm"><h2>🤝 На что спорим?</h2><p>'+esc(line)+'</p><p>Ставка — <b>'+STAKE+'</b> '+coinI()+' (у тебя '+(+S.coins||0)+'). Выиграешь — получишь <b>'+(STAKE*3)+'</b>.</p>'+
'<div class="btns" style="flex-direction:column"><button class="btn green" id="z4pNh">Пройду без подсказок</button><button class="btn blue" id="z4pTm">Пройду за '+tm+' минуты</button>'+
'<button class="btn ghost" id="z4pNo">Не спорим</button></div></div>');
var g=st.g;function go(k){hideModal();if(typeof G==='undefined'||G!==g||g.won)return;P.stake(k);}
document.getElementById('z4pNh').onclick=function(){go('nh');};document.getElementById('z4pTm').onclick=function(){go('tm');};
document.getElementById('z4pNo').onclick=function(){hideModal();st.stOff=0;draw();};}
P.stake=function(k){if(!st.on||st.stk||(+S.coins||0)<STAKE)return false;var z=zz(),d=tk();if(n(z.sd)!==d){z.sd=d;z.sn=0;}if(z.sn>=2)return false;
z.sn++;try{addCoins(-STAKE);STAT.ev('spend',{k:'z4p',c:STAKE});}catch(e){S.coins=(+S.coins||0)-STAKE;}sv();
st.stk={k:k==='tm'?'tm':'nh',t0:now(),to:(isOK()?3:2)*60,r:0};st.stOff=0;st.hint0=+S.hintsUsed||0;draw();tick();return true;};
var tt=0;function tick(){clearTimeout(tt);var k=st.stk;if(!k||k.r||typeof G==='undefined'||st.g!==G||G.won)return;
if(k.k==='nh'&&(G.hinted||(+S.hintsUsed||0)>st.hint0))return stLose();
if(k.k==='tm'&&(now()-k.t0)/1000>k.to)return stLose();draw();tt=setTimeout(function(){ZB.safe('z4p-tick',tick);},1000);}
function stLose(){var k=st.stk;if(!k||k.r)return;k.r=-1;draw();say(Z.txt('z4p.stl')||'Ставка не сыграла. Ничего, монетки — дело наживное.','norm');ev('st',{k:k.k,r:0,lv:st.lv});}
function onStart(i){init(i.G,i.mix);if(!st.on){draw();return;}var z=zz();
if(st.gift)giftLetter(st.gift);
if(st.ctl){var c=st.ctl;if(!c.re)setTimeout(function(){if(st.g===i.G)say(Z.txt('z4p.k0',{n:c.lim,r:c.rt})||('Валентина Петровна: контрольная! Ошибок — не больше '+c.lim+'. Правило: '+c.rt+'.'),'norm');},st.gift?3500:900);}
else if(st.pari){var x=st.pari[0],k=x.k==='z'?'z4p.pz':'z4p.p'+x.k;setTimeout(function(){if(st.g===i.G)say(Z.txt(k,{b:up(x.b||'')})||('Мой спорит, что ты не найдёшь слово '+gTxt(x)+'.'),'happy');},st.gift?3500:900);}
else if(O.wk&&n(z.wa)!==wkNo()&&!st.gift){z.wa=wkNo();sv();var r=rule();setTimeout(function(){if(st.g===i.G)say(Z.txt('z4p.wk',{r:r[2]})||('Правило недели: '+r[2]+'.'),'happy');},900);}
draw();}
function onWord(o){var s=st;if(!s.on||o.G!==s.g)return;var w=o.w,len=w.length;s.fw=(s.fw||0)+1;
if(O.wk&&!o.byHint){var p=rPts(rule(),w,o.bonus);if(p){s.wk+=p;Z.score.add(p,'z4p.wk');}}
if(s.ctl){var c=s.ctl;if(o.bonus)c.bon=1;if(!o.byHint&&!o.bonus&&len>=6)c.lg=1;}
if(s.pari&&!o.byHint){var won=0;s.pari.forEach(function(x){if(x.r)return;
if(x.k==='z'&&w.charAt(0)===x.b)x.r=1;else if(x.k==='l'&&len>=6)x.r=1;else if(x.k==='b'&&o.bonus)x.r=1;
else if(x.k==='d'&&!o.bonus){if(len>=5&&s.last>=5)x.r=1;}
if(x.r>0)won++;});
if(!o.bonus)s.last=len;
if(won){Z.score.add(5*won,'z4p.pari');if(!s.pw){s.pw=1;say(Z.txt('z4p.w')||'Мой проиграл! Сегодня посуда — его.','happy');}}}
else if(s.pari&&o.byHint&&!o.bonus)s.last=0;
draw();}
function onMiss(o){var s=st;if(!s.on||o.G!==s.g)return;s.miss++;
if(s.pari)s.pari.forEach(function(x){if(x.k==='n'&&!x.r&&s.miss>(isOK()?1:0))x.r=-1;});
if(s.ctl){var c=s.ctl;c.bad++;if(c.bad>c.lim&&c.ok){c.ok=0;say(Z.txt('z4p.k2')||'Валентина Петровна: двойка. Пересдашь — исправлю.','stern');}}
draw();}
function onWin(i){var s=st;if(!s.on||i.G!==s.g||s.res)return;var z=zz(),g=s.g,hinted=!!(i.hints||g.hinted),r={};s.res=r;clearTimeout(tt);
if(s.ctl){var c=s.ctl;if(c.ok&&c.bad>c.lim)c.ok=0;
if(c.ok&&c.r==='nh'&&hinted)c.ok=0;if(c.ok&&c.r==='bo'&&!c.bon)c.ok=0;if(c.ok&&c.r==='lg'&&!c.lg)c.ok=0;
if(c.ok){z.km=n(z.km)+1;r.k=5;r.kc=give('z4p',c.re?5:10);Z.score.add(20,'z4p.ctl');}
else{z.kf=n(z.kf)+1;r.k=2;if(!c.re)z.kr=1;}
ev('ctl',{lv:s.lv,r:r.k,re:c.re?1:0,b:c.bad});}
if(s.stk&&!s.stk.r){var k=s.stk;if(k.k==='nh'&&(hinted||(+S.hintsUsed||0)>s.hint0))k.r=-1;else if(k.k==='tm'&&(now()-k.t0)/1000>k.to+1)k.r=-1;else k.r=1;
if(k.r>0){z.sw=n(z.sw)+1;r.sc=give('z4pb',STAKE*3);}ev('st',{k:k.k,r:k.r>0?1:0,lv:s.lv});}
if(s.pari){var lim=isOK()?1:0;s.pari.forEach(function(x){if(!x.r)x.r=x.k==='n'&&s.miss<=lim?1:-1;});
var w=s.pari.filter(function(x){return x.r>0;}).length;z.pn=n(z.pn)+1;z.pw=n(z.pw)+w;if(w===3)z.pa=n(z.pa)+1;
r.pw=w;r.pc=w?give('z4p',w+(w===3?2:0)):0;ev('pari',{lv:s.lv,g:s.pari.map(function(x){return x.k;}).join(''),w:w});}
if(O.s5&&s.nw){if(hinted)z.s=0;else{z.s=n(z.s)+1;z.sb=Math.max(n(z.sb),z.s);var m=z.s%10;
if(m===3){z.op=1;r.s=3;}else if(m===5){try{hbAdd(1,'z4p');}catch(e){}r.s=5;}else if(m===0){z.gp=n(z.gp)+1;r.s=10;r.gc=give('z4p',10);}
if(r.s)ev('s',{n:z.s});}r.sn=z.s;}
if(s.wk){r.wk=s.wk;ev('wk',{i:ruleI(),p:s.wk});}
draw();sv();}
function winTxt(i){var s=st,r=s.res;if(!r||i.G!==s.g)return'';var t;
if(r.k===5)return'🏅 '+(Z.txt('z4p.k5')||'Пятёрка от завуча! Медаль в табель.')+(r.kc?' +'+mon(r.kc):'');
if(r.k===2)return'📝 '+(Z.txt('z4p.k2')||'Двойка у завуча. Пересдача — на следующем уровне, с буквой в помощь.');
if(s.stk&&s.stk.r>0)return'🤝 '+(Z.txt('z4p.stw')||'Ставка сыграла!')+(r.sc?' +'+mon(r.sc):'');
if(r.pw!=null){t=r.pw===3?Z.txt('z4p.all'):r.pw?'':Z.txt('z4p.lose');return'🤝 Пари с моим: '+r.pw+' из 3'+(r.pc?' (+'+mon(r.pc)+')':'')+(t?'. '+t:'');}
if(r.s===10)return'🖋 '+(Z.txt('z4p.s10')||'Десять уровней без подсказок — золотая ручка!')+(r.gc?' +'+mon(r.gc):'');
if(r.s===5)return'🐈 '+(Z.txt('z4p.s5')||'Пять без подсказок — Ять положил 💡 в корзинку.');
if(r.s===3)return'✍️ Три уровня без подсказок — на следующем буква откроется сама.';
if(r.sn>=1&&r.sn%10!==3&&r.sn%10!==5&&r.sn%10!==0&&r.sn>=2){var nx=r.sn%10<3?3:r.sn%10<5?5:10,left=nx-r.sn%10;
return'✍️ Без подсказок подряд: '+r.sn+'. Ещё '+left+' — '+(nx===3?'буква в подарок':nx===5?'Ять на подхвате':'золотая ручка')+'.';}
if(r.wk)return'📜 Правило недели («'+rule()[2]+'»): +'+r.wk+' ✦';
return'';}
Z.onStart(function(i){ZB.safe('z4p-start',function(){onStart(i);});});
Z.onWord(onWord);Z.onMiss(onMiss);Z.onWin(onWin);
ZB.add(ZB.levelSlots,{id:'z4p',order:4,zone:'top',render:function(){return Z.on?'<div id="z4pBar" class="z4pbar" style="display:none"></div>':'';},
mount:function(){ZB.safe('z4p-draw',draw);}});
Z.winLine.add({id:'z4p',order:12,urg:function(i){var r=st.res;return!!(r&&i.G===st.g&&r.pw!=null);},txt:winTxt});
function papIns(el,op){op=op||{};if(!O.wk||!el||op.arch||op.r||op.pg||op.dn!=null||ZB.cur!=='z3paper'||!Z.open('z4p'))return;
var sh=el.querySelector('.z3p-sheet');if(!sh||sh.querySelector('.z4p-pap'))return;var z=zz(),r=rule(),d=document.createElement('div');d.className='z4p-pap';
d.style.cssText='margin:10px 0;padding:10px 12px;border-radius:12px;background:var(--z3-paper,#fbf7ec);border:1px dashed var(--z3-line,#e6dcc8);text-align:left;color:var(--z3-ink,#27324a)';
var tab=[];if(n(z.km))tab.push('медалей завуча — '+n(z.km));if(n(z.gp))tab.push('золотых ручек — '+n(z.gp));if(n(z.pw))tab.push('пари с моим выиграно — '+n(z.pw));
d.innerHTML='<b style="display:block;font:700 16px/1.3 var(--z3-font-news,Georgia,serif)">📜 Правило недели</b>'+
'<p style="margin:6px 0 2px;font-size:15px;line-height:1.35">До воскресенья на всех уровнях: <b>'+esc(r[2])+'</b>.</p>'+
'<p style="margin:0;font-size:13.5px;color:var(--z3-ink2,#5d6781)">На задания дня не действует.'+(tab.length?' Табель: '+esc(tab.join(', '))+'.':'')+'</p>';
var arb=sh.querySelector('.z3p-arb');if(arb)sh.insertBefore(d,arb);else sh.appendChild(d);}
function papWrap(){var PP=window.Z3PAPER;if(!PP||typeof PP.render!=='function')return false;if(PP.render.__z4p)return true;
var r0=PP.render,w=function(el,op){var r=r0.apply(this,arguments);ZB.safe('z4p-pap',function(){papIns(el,op);});return r;};for(var k in r0)w[k]=r0[k];w.__z4p=1;PP.render=w;return true;}
if(O.wk&&ZB._scr&&ZB._scr.z3paper){var sc=ZB._scr.z3paper,s0=sc.render;
sc.render=function(el,op){var r=s0.apply(this,arguments);var PP=window.Z3PAPER;
if(PP&&!papWrap()&&PP.x)PP.x().then(function(){papWrap();ZB.safe('z4p-pap',function(){papIns(el,op);});},function(){});
else ZB.safe('z4p-pap',function(){papIns(el,op);});return r;};}
Z3.whenReady(function(){var g=typeof G!=='undefined'?G:null,gm=document.getElementById('game');
if(!g||g.won||!gm||!gm.classList.contains('on')||st.g===g)return;st={g:g,lv:lvOf(g),on:0};});
})();
