'use strict';
(function(){
var K=window.Z3K,Z3=window.Z3;if(!K||K.ui||!Z3)return;
K.on.say=Z3.reg('zsay',{t:'STAT показа реплики Зины z3c (H61)',who:'CORE'});K.on.rate=Z3.reg('zrate',{t:'Просьба оценить игру после победы, без награды (G6, Яндекс)',who:'CORE'});
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function snd(){try{SND.tap();}catch(e){}}
function sv(){try{save();}catch(e){}}
function coinI(){try{return COIN_I;}catch(e){return'💰';}}
function give(n,src){try{if(window.ZBECO&&ZBECO.give)return ZBECO.give(src,n,'mg');if(typeof addCoins==='function'){addCoins(n,'mg');return n;}}catch(e){}return 0;}
K.esc=esc;
var MIX_REW=5,IL0=200000;
function stat(id){var r=K.Z().r;return r[id]||(r[id]=[0,0,0]);}
K.mixGo=function(idx,p,start){var z=K.Z(),l=idx+1,t0=Date.now(),done=0;z.m=Math.max(z.m||0,l);stat(p.id)[0]++;sv();
Z3.ev('z3k',{a:'mix',r:p.id,l:l,s:'show'});
function fin(ok,how){if(done)return;done=1;var a=stat(p.id);if(ok)a[1]++;else a[2]++;sv();
Z3.ev('z3k',{a:'mix',r:p.id,l:l,s:how||(ok?'ok':'fail'),t:Math.round((Date.now()-t0)/1000)});}
if(p.num){var W=window.ZBNUM;
W.x().then(function(){return ZB.load('js/zb3-num-data.js');}).then(function(){
if(typeof W.ilPlay!=='function')throw new Error('ilPlay');
W.ilPlay(idx,p.id,function(){var ok=false;try{ok=W.R.stOf(p.id,IL0+idx)===1;}catch(e){}fin(ok,ok?'ok':'skip');start();});
}).catch(function(){fin(false,'err');start();});return;}
ZB.go('z3mix',{idx:idx,p:p,start:start,fin:fin});};
function mixRender(el,op){css();var p=op.p,l=op.idx+1,ended=0;
el.innerHTML='<div class="z3m"><div class="z3m-hd"><button type="button" class="btn ghost small z3m-skip">Пропустить ›</button>'+
'<div class="z3m-t"><b>'+esc(p.ic+' '+p.t)+'</b><small>перемена перед уровнем '+l+'</small></div></div><div class="z3m-b"></div><div class="z3m-end"></div></div>';
var body=el.querySelector('.z3m-b'),end=el.querySelector('.z3m-end'),sk=el.querySelector('.z3m-skip');
sk.onclick=function(){if(!ended)op.fin(false,'skip');ended=2;snd();op.start();};
function done(res){if(ended)return;ended=1;var ok=!!(res&&res.ok);op.fin(ok);var c=ok?give(MIX_REW,'z3mix'):0;
sk.textContent='К уровню ›';
end.innerHTML='<p>'+(ok?'Решено!'+(c?' +'+c+' '+coinI():''):'Не беда — в газете ещё будет.')+'</p><button type="button" class="btn green z3m-go">К уровню '+l+' ▶</button>';
end.classList.add('on');end.querySelector('.z3m-go').onclick=function(){ended=2;snd();op.start();};
try{if(ok)SND.coin();}catch(e){}}
var r=p.z3;Promise.resolve(r.lazy?r.lazy():0).then(function(){ZB.safe('z3mix:'+p.id,function(){r.play(body,{seed:300000+l,from:'level',done:done});});},
function(){op.fin(false,'err');ended=2;op.start();});}
ZB.screen('z3mix',{title:'Перемена',render:function(el,op){ZB.safe('z3mix',function(){mixRender(el,op||{});});}});
var FIX={podyezd:['лампочку на этаже','почтовые ящики','перила','дверь с доводчиком','коврик у лифта'],
lavochka:['доску на лавочке','урну','клумбу','фонарь','навес от дождя'],rynok:['весы у тёти Нюры','прилавок','зонт над рядами','табличку «Мёд»','тележку'],
poliklinika:['часы в коридоре','кулер','стул у кабинета','звонок регистратуры','фикус'],dacha:['калитку','бочку для воды','грядку','скворечник','шланг'],
elektrichka:['окно в вагоне','скамейку на платформе','расписание','табло','кассу'],banya:['веник','ковшик','печку','полок','кран с холодной'],
sberkassa:['окошко кассира','ручку на цепочке','очередь-автомат','табличку «Обед»','стол для бланков'],yubiley:['гирлянду','стол','баян','фотоаппарат','торт'],
sanatoriy:['кресло-качалку','бювет','шезлонг','дорожку в парке','радио в холле'],vypusk:['звонок','доску','глобус','школьные часы','ленту выпускника'],
pochta:['весы для посылок','ящик для писем','штемпель','окошко','клей'],zhek:['кран в подвале','доску объявлений','трубу','дверь в подвал','лампу на крыльце'],
rybalka:['удочку','лодку','садок','мостки','котелок'],griby:['корзинку','тропинку','мостик через ручей','компас','термос'],
svadba:['арку из цветов','скатерть','музыку','фату','тамаду'],kruiz:['спасательный круг','шезлонг на палубе','бинокль','флажок','гудок'],
moskva:['карту метро','чемодан','фотоаппарат','зонтик','открытку'],'novyj-god':['гирлянду на ёлке','звезду','хлопушку','часы на стене','ёлочный шар'],
akademiya:['кафедру','микрофон','мантию','библиотечную лестницу','чернильницу'],'hor-dk':['пианино','занавес','пюпитр','прожектор','стулья в зале'],
mfc:['электронную очередь','кресло','кнопку вызова','терминал','табличку окна'],'poezd-yug':['полку в купе','подстаканник','окно','ночник','столик'],
'vnuk-smartfon':['зарядку','экран','звонок','будильник','чехол'],solenya:['крышки','банки','погреб','полку','рассол']};
function KD(){return window.Z3KD||null;}
K.data=function(){return KD()?Promise.resolve(KD()):ZB.load('js/zb3-core-data.js');};
function chOf(ch){return typeof ZBCH!=='undefined'?ZBCH.list[ch-1]:null;}
function fixList(ch){var c=chOf(ch),d=KD(),f=d&&c&&c.pn&&d.fix[c.pn-1]||null,last=(c&&FIX[c.place])||FIX.podyezd;
return f&&f.length>=4?f.slice(0,4).map(function(r){return r[0];}).concat([last[4]]):last;}
K.fixTxt=function(ch,k){var c=chOf(ch),d=KD(),f=d&&c&&c.pn&&d.fix[c.pn-1];if(f&&k<=4&&f[k-1])return f[k-1][1];
var it=fixList(ch)[k-1]||'',t=Z3.txt('z3k-fix',{item:it});if(!t)return'';return t.charAt(0).toUpperCase()+t.slice(1);};
ZB.add(ZB.winSlots,{id:'z3fix',order:40,zone:'goal',fit:5,render:function(ctx){var L=K.last;if(!K.on.fix||!L||!ctx||!ctx.g||ctx.daily||L.l!==ctx.g.idx+1||L.f<=L.f0||L.ch<2||Z3.day()<2)return'';
css();var ch=ZBCH.list[L.ch-1]||{},h='<div class="z3fx"><b>🔧 Починили: '+esc(fixList(L.ch)[L.f-1]||'')+' ('+L.f+'/'+K.REP.length+')</b><p>'+esc(K.fixTxt(L.ch,L.f))+'</p></div>';return h;}});
function h32(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
var FW=null;function fwGet(){if(FW)return FW;FW={};try{(localStorage.getItem('z3-fw')||'').split(',').forEach(function(k){if(k)FW[k]=1;});}catch(e){}return FW;}
var fwT=0;function fwSave(){clearTimeout(fwT);fwT=setTimeout(function(){try{localStorage.setItem('z3-fw',Object.keys(FW).join(','));}catch(e){}},800);}
function fwSeed(){var n=0;try{n=+localStorage.getItem('z3-fwn')||0;}catch(e){}var to=Math.min(+S.lv||0,typeof LEVELS!=='undefined'?LEVELS.length:0);if(to<=n)return;fwGet();
for(var i=n;i<to;i++){try{var lv=levelData(i,false);lv.w.forEach(function(w){FW[h32(w[0])]=1;});}catch(e){}}
try{localStorage.setItem('z3-fwn',String(to));}catch(e){}fwSave();}
K.fresh=function(w){var k=h32(w),f=fwGet();if(f[k])return false;f[k]=1;fwSave();return true;};
function chip(t,cls){var b=document.getElementById('board');if(!b)return;var e=document.createElement('div');e.className='z3chip '+(cls||'')+(CALM()?' still':'');e.textContent=t;b.appendChild(e);setTimeout(function(){e.remove();},1600);}
var FRESH_N=0;K.FRESH_FROM=100;
function wrapFound(){var f=window.foundWord;if(typeof f!=='function'||f.__z3k)return;var w=function(wd,byHint){var g=G,r=f.apply(this,arguments);
ZB.safe('z3k-found',function(){if(byHint||!g||g.daily||g.mode||G!==g||(+S.lv||0)<10)return;css();
var fr=K.on.fresh&&(+S.lv||0)>=20&&K.fresh(wd.w);if(fr&&(+S.lv||0)>=K.FRESH_FROM&&(g.z3fr=(g.z3fr||0)+1)<=2){FRESH_N++;chip('✨ первый раз!','fr');Z3.ev('z3k',{a:'fresh',n:FRESH_N,l:g.idx+1});}
else if(K.on.juice&&g.combo>=3&&!g.won)chip(g.combo+' подряд!'+(g.combo>=5?' 🔥':''),'cb');
if(K.on.juice&&g.combo>=3){var b=document.getElementById('board');if(b&&!CALM()){b.classList.remove('z3glow');void b.offsetWidth;b.classList.add('z3glow');}}});
return r;};w.__z3k=1;window.foundWord=w;}
function nKey(k){return'z3k-note-'+k;}
function noteOf(){var d=new Date(typeof nowMs==='function'?nowMs():Date.now()),h=d.getHours(),wd=d.getDay(),t=K.tk(),last=0;
try{last=+localStorage.getItem('z3-last')||0;}catch(e){}try{localStorage.setItem('z3-last',String(t));}catch(e){}
var gap=last&&t?Z3.days(last,t):0,sr=+S.streak||0;
if(gap>=3)return['back',{n:gap}];if(gap===2)return['broke',{}];
if(sr>=3&&sr%5===0)return['streak',{n:sr}];
if(h>=0&&h<5)return['night',{}];if(h>=5&&h<8)return['morning',{}];
if(wd===1)return['mon',{}];if(wd===5)return['fri',{}];if(wd===0)return['sun',{}];return null;}
var noted=0,NT=null;
function noteStart(info){if(noted||!K.on.note||!info||info.daily||info.mode||Z3.day()<2||(+S.lv||0)<10||info.idx%20===0)return;
if(NT===null)NT=noteOf();var n=NT;if(!n)return;var seen='';try{seen=localStorage.getItem('z3-note')||'';}catch(e){}
var key=n[0]+K.tk();if(seen===key){noted=1;return;}noted=1;var g=G;
setTimeout(function(){if(G!==g||!g||g.won||(document.getElementById('modal')||{}).classList&&document.getElementById('modal').classList.contains('on'))return;
var t=Z3.txt(nKey(n[0]),n[1]);if(!t)return;
try{SK='note';zina(t,'happy',6);localStorage.setItem('z3-note',key);}catch(e){}Z3.ev('z3k',{a:'note',k:n[0]});},3600);}
var SV_FROM=100,SV_GAP=10;
function svSt(){try{var o=JSON.parse(localStorage.getItem('z3-sv')||'{}');return o&&typeof o==='object'?o:{};}catch(e){return{};}}
function svDue(){var d=KD();if(!d||!d.sv||!d.sv.length||!K.on.svaty)return null;if((+S.lv||0)<SV_FROM||Z3.day()<3)return null;
var o=svSt(),t=K.tk();if(o.t&&t&&Z3.days(o.t,t)<SV_GAP)return null;return d.sv[(+o.i||0)%d.sv.length];}
var WHO={klava:['Клава','сватья'],fedor:['Фёдор','сват']};
function face(id){var a=Z3.art('face_'+id);if(a)return a;
if(WHO[id])return'<span class="z3sv-ini z3sv-'+id+'">'+WHO[id][0].charAt(0)+'</span>';
try{if(id==='zina')return zinaSVG('happy');if(window.ZBP&&ZBP.face)return ZBP.face(id==='cat'?'yat':id);}catch(e){}return'';}
function nameOf(id){if(WHO[id])return WHO[id][1]+' '+WHO[id][0];if(id==='zina')return'баба Зина';try{return ZBP.info[id].short||ZBP.info[id].name;}catch(e){return'';}}
function svRender(el,op){css();var sc=op.sc,h='<div class="z3m"><div class="z3m-hd"><button type="button" class="btn ghost small z3m-skip">Пропустить ›</button>'+
'<div class="z3m-t"><b>🧳 '+esc(sc.t)+'</b><small>сваты приехали «на денёк»</small></div></div><div class="z3m-b"><div class="z3sv">';
sc.l.forEach(function(r,i){h+='<div class="z3sv-l'+(r[0]==='zina'?' me':'')+'" style="animation-delay:'+(i*0.8)+'s"><div class="z3sv-f">'+face(r[0])+'</div><div class="z3sv-b"><small>'+esc(nameOf(r[0]))+'</small>'+esc(r[2])+'</div></div>';});
h+='<p class="z3sv-r"><button type="button" class="btn green z3sv-go">Дальше ▶</button></p></div></div></div>';el.innerHTML=h;var done=0;
function go(){if(done)return;done=1;snd();Z3.ev('z3k',{a:'svaty',n:sc.n});if(op.then)op.then();}
el.querySelector('.z3sv-go').onclick=go;el.querySelector('.z3m-skip').onclick=go;}
ZB.screen('z3svaty',{title:'Сваты',render:function(el,op){ZB.safe('z3sv',function(){svRender(el,op||{});});}});
ZB.add(ZB.chapSlots,{id:'z3svaty',order:80,render:function(ctx){return ctx&&!ctx.again&&svDue()?'<span hidden></span>':'';},
mount:function(el,ctx){ZB.safe('z3sv-m',function(){var sc=svDue();if(!sc||!ctx||!ctx.g||ctx.again)return;var b=document.getElementById('mGo');if(!b||b.__z3sv)return;b.__z3sv=1;
var c=Math.floor(ctx.g.idx/20);
b.addEventListener('click',function(e){if(b.__z3sv===2)return;e.stopImmediatePropagation();e.preventDefault();b.__z3sv=2;
var o=svSt();try{localStorage.setItem('z3-sv',JSON.stringify({t:K.tk(),i:(+o.i||0)+1}));
var L=(localStorage.getItem('zn-sc')||'').split(',').filter(Boolean);if(L.indexOf(String(c))<0){L.push(String(c));localStorage.setItem('zn-sc',L.slice(-200).join(','));}}catch(x){}
try{hideModal();}catch(x){}ZB.go('z3svaty',{sc:sc,then:function(){try{show('game');}catch(x){}try{b.click();}catch(x){}}});},true);});}});
K.VOICE_URL='';
try{if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){var vq=/[?&]voice=([^&]+)/.exec(location.search),vp=/[?&]z3srv=(\d{2,5})/.exec(location.search);
if(vq)K.VOICE_URL=decodeURIComponent(vq[1]);else if(vp)K.VOICE_URL='http://127.0.0.1:'+vp[1]+'/?op=tts';}}catch(e){}
var VNO=0;
var VC={};
function vPref(){try{return localStorage.getItem('z3-voice')==='1';}catch(e){return false;}}
function vOn(){return!!(K.on.voice&&K.VOICE_URL&&VNO<3&&vPref());}
K.voiceSet=function(on){try{localStorage.setItem('z3-voice',on?'1':'0');}catch(e){}Z3.ev('z3k',{a:'voice',r:on?'on':'off'});};
var vAu=null,vLast=0;
K.speak=function(t){if(!vOn())return;try{if(!S.sound||muted||paused||document.hidden)return;}catch(e){}
t=String(t||'').replace(/[☀-⟿]|[\ud83c-\ud83e][\udc00-\udfff]/g,'').trim().slice(0,250);if(!t||Date.now()-vLast<4000)return;vLast=Date.now();
var go=function(u){try{if(vAu)vAu.pause();vAu=new Audio(u);vAu.play().catch(function(){});}catch(e){}};
if(VC[t]){go(VC[t]);return;}
fetch(K.VOICE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({t:t,v:'zina'})})
.then(function(r){if(r.status===204){VNO=3;Z3.ev('z3k',{a:'voice',r:'none'});return null;}if(!r.ok)throw new Error(r.status);return r.blob();})
.then(function(b){if(!b)return;if(!b.size){VNO=3;return;}VNO=0;var u=URL.createObjectURL(b);var ks=Object.keys(VC);if(ks.length>40){URL.revokeObjectURL(VC[ks[0]]);delete VC[ks[0]];}VC[t]=u;go(u);})
.catch(function(e){VNO++;Z3.ev('z3k',{a:'voice',r:'err',e:String(e&&e.message||e).slice(0,40)});});};
function wrapZina(){var f=window.zina;if(typeof f!=='function'||f.__z3v)return;var w=function(t){var r=f.apply(this,arguments);if(r===false)return r;
try{if(vOn()&&typeof G!=='undefined'&&G&&document.getElementById('game').classList.contains('on'))K.speak(t);}catch(e){}return r;};w.__z3v=1;window.zina=w;}
function wrapSettings(){var f=window.openSettings;if(typeof f!=='function'||f.__z3v)return;var w=function(){var r=f.apply(this,arguments);
ZB.safe('z3voice-set',function(){if(!K.on.voice||!K.VOICE_URL)return;var c=document.getElementById('mcard');if(!c||c.querySelector('.z3vc'))return;
var on=vPref(),b=document.createElement('button');b.type='button';b.className='btn ghost small z3vc';b.textContent='🗣 Голос Зины: '+(on?'вкл':'выкл');
b.onclick=function(){on=!on;K.voiceSet(on);b.textContent='🗣 Голос Зины: '+(on?'вкл':'выкл');snd();};
var bt=c.querySelector('.btns');if(bt)bt.parentNode.insertBefore(b,bt);else c.appendChild(b);});return r;};w.__z3v=1;window.openSettings=w;}
var CHC=['#f3e1ea','#e3efd9','#dfe8f7','#f7eccb','#efe3f5','#e8e0d0','#fbe1d8','#ece6da'];
K.chAdd=function(n){if(typeof ZBCH==='undefined'||typeof CHAPTERS==='undefined')return;
var C4=(KD()&&KD().ch4)||[];while(CHAPTERS.length<n){var i=CHAPTERS.length-100,x=C4[i%Math.max(1,C4.length)]||['Сверх программы','📖',''];CHAPTERS.push({n:x[0],e:x[1],c:CHC[i%CHC.length],s:x[2]});}
while(ZBCH.list.length<n){var m=ZBCH.list.length+1,src=ZBCH.list[(m-26)%50+25],t=CHAPTERS[m-1];
ZBCH.list.push({n:m,place:src.place,pn:src.pn,v:src.v,from:(m-1)*20+1,to:m*20,hard:m%2===1?1:0,cell:'',cells:src.cells.slice(),cls:12,boss:0,
name:t.n,e:t.e,c:t.c,s:t.s,end:'',souv:'',se:'',note:''});}};
K.endNote=function(){var c=document.getElementById('mcard');if(!c||c.querySelector('.z3k-end'))return;var d=K.next4(),h=c.querySelector('h2');
if(h)h.textContent='Сверх программы — глава в неделю';
var p=document.createElement('p');p.className='z3k-end';
p.innerHTML=d>0?'Следующая глава откроется '+(d===1?'<b>завтра</b>':'через <b>'+d+' '+plural(d,'день','дня','дней')+'</b>')+'. А пока — домашка на повторение и <b>газета</b>: в архиве номеров задачек на месяц вперёд.'
:'Все главы «Сверх программы» пройдены! Новые я уже пишу. А пока — домашка на повторение и <b>газета</b> с архивом номеров.';
var b=c.querySelector('.btns');if(b)b.parentNode.insertBefore(p,b);else c.appendChild(p);
if(b&&!ZB2.off('num')){var g=document.createElement('button');g.className='btn ghost small';g.textContent='📰 Архив газеты';
g.onclick=function(){try{hideModal();}catch(e){}snd();ZB.go('vech',{arch:1});};b.insertBefore(g,b.firstChild);}
Z3.ev('z3k',{a:'end4',d:d,o:K.open4()});};
var SE_CH=6;
K.seasonOf=function(idx){if(idx<2000)return null;var c=Math.floor((idx-2000)/20),s=Math.floor(c/SE_CH)+1,nch=Math.floor(K.Z4_N/20),
len=Math.max(1,Math.min(SE_CH,nch-(s-1)*SE_CH)),ci=c%SE_CH+1,k=ci===1?1:(ci===len?3:(ci===Math.floor(len/2)+1?2:0));
return{s:s,ci:ci,len:len,k:k,from:2001+(s-1)*SE_CH*20,to:2000+(s-1)*SE_CH*20+len*20};};
K.seasonTxt=function(s){var L=(KD()&&KD().se)||[];return L.length?L[(s-1)%L.length]:null;};
function seasonStart(info){if(!K.on.season||!info||info.daily||info.mode||info.idx<2000)return;var q=K.seasonOf(info.idx);if(!q||!q.k)return;
var z=K.Z(),key=q.s*4+q.k;if((+z.n||0)>=key)return;var g=G;
K.data().then(function(){var t=K.seasonTxt(q.s);if(!t||G!==g||!g||g.won)return;
var mo=document.getElementById('modal');if(q.k===1){if(mo&&mo.classList.contains('on'))return;}
z.n=key;noted=1;try{save();}catch(e){}Z3.ev('z3k',{a:'season',s:q.s,k:q.k});
if(q.k===1){css();modal('<div class="z3se"><div class="z3se-e">'+esc(t.e||'📺')+'</div><small>Сверх программы · сезон '+q.s+'</small><h2>'+esc(t.t)+'</h2>'+
'<p>'+esc(t.a)+'</p><div class="btns"><button type="button" class="btn" id="z3seGo">Смотреть!</button></div></div>');
var b=document.getElementById('z3seGo');if(b)b.onclick=function(){try{snd();}catch(e){}hideModal();setTimeout(function(){if(G===g&&!g.won&&t.l&&t.l[0]){SK='season';zina(t.l[0],'happy',6);}},400);};}
else setTimeout(function(){if(G!==g||g.won||(mo&&mo.classList.contains('on')))return;var r=t.l&&t.l[q.k-1];if(r){SK='season';zina(r,'happy',6);}},2500);},function(){});}
K.seasonStart=seasonStart;
var cssOn=0;
function css(){if(cssOn)return;cssOn=1;var s=document.createElement('style');s.id='z3kCss';s.textContent=
'.z3m{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--z3-bg);color:var(--z3-ink)}'+
'.z3m-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--z3-paper);border-bottom:1px solid var(--z3-line)}'+
'.z3m-skip{white-space:nowrap;flex:0 0 auto;min-height:44px}.z3m-t{display:flex;flex-direction:column;line-height:1.2;min-width:0}'+
'.z3m-t b{font:700 19px var(--z3-font-head);color:var(--z3-ink)}.z3m-t small{font-size:13.5px;color:var(--z3-ink2)}'+
'.z3m-b{flex:1;min-height:0;overflow:auto}.z3m-end{display:none;padding:10px 14px 14px;background:var(--z3-paper);border-top:1px solid var(--z3-line);text-align:center}'+
'.z3fx{margin:6px auto;max-width:420px;padding:8px 12px;border-radius:var(--z3-rb);background:var(--z3-paper);color:var(--z3-ink);font-size:14px;line-height:1.3;text-align:left;box-shadow:var(--z3-shadow)}.z3fx p{margin:4px 0 0;font-size:14px;color:var(--z3-ink2)}'+
'#board .z3chip{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);z-index:6;pointer-events:none;padding:6px 14px;border-radius:999px;font-weight:700;font-size:16px;white-space:nowrap;box-shadow:var(--z3-shadow);animation:z3chip 1.5s ease-out forwards}'+
'#board .z3chip.fr{top:18%;background:#fff6d6;color:#7a4a12}#board .z3chip.cb{background:var(--z3-acc);color:var(--z3-acc-ink)}#board .z3chip.still{animation:none}'+
'@keyframes z3chip{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-90%)}}'+
'#board.z3glow{animation:z3glow .6s ease-out}@keyframes z3glow{0%{box-shadow:0 0 0 0 rgba(255,196,60,.0)}30%{box-shadow:0 0 0 6px rgba(255,196,60,.55)}100%{box-shadow:0 0 0 0 rgba(255,196,60,0)}}'+
'html.z3:not(.th-x) .zblvbg:not(.z3k) .veil{background:linear-gradient(rgba(251,247,236,.22),rgba(251,247,236,.55) 50%,rgba(251,247,236,.82))}'+
'.z3sv{max-width:560px;margin:0 auto;padding:12px}.z3sv-l{display:flex;align-items:flex-end;gap:8px;margin:0 0 10px;animation:z3in .4s both}.z3sv-l.me{flex-direction:row-reverse}'+
'.z3sv-f{flex:0 0 52px;width:52px;height:52px}.z3sv-f svg{width:100%;height:100%}.z3sv-ini{display:flex;width:52px;height:52px;border-radius:50%;align-items:center;justify-content:center;font:700 24px var(--z3-font-head);color:#fff;background:#8a5a32}.z3sv-fedor{background:#4c6e8a}'+
'.z3sv-b{background:var(--z3-paper);border-radius:var(--z3-r);padding:8px 12px;font-size:15.5px;line-height:1.35;box-shadow:var(--z3-shadow);color:var(--z3-ink)}.z3sv-b small{display:block;font-size:13.5px;color:var(--z3-ink2)}'+
'.z3sv-r{text-align:center;margin:14px 0}.z3sv-r .btn{min-height:46px;min-width:200px}@keyframes z3in{from{opacity:0;transform:translateY(6px)}to{opacity:1}}@media (prefers-reduced-motion:reduce){.z3sv-l{animation:none}}'+
'.z3se{text-align:center;padding:4px 2px}.z3se-e{font-size:44px;line-height:1.1}.z3se small{display:block;font-size:13.5px;color:var(--z3-ink2)}'+
'.z3se h2{margin:4px 0 6px;font:700 22px var(--z3-font-head);color:var(--z3-ink)}.z3se p{margin:0 0 12px;font-size:15.5px;line-height:1.35;color:var(--z3-ink)}.z3se .btn{min-height:46px;min-width:200px}'+
'.z3rt{margin:2px auto 0;max-width:440px;text-align:center}.z3rt p{margin:0;font-size:14.5px;line-height:1.3;color:var(--z3-ink)}.z3rt .btn{min-height:44px;margin:2px 0 0 6px;vertical-align:middle}'+
'.z3m-end.on{display:block}.z3m-end p{margin:0 0 8px;font-size:15px}.z3m-end .btn{min-height:46px;width:100%;max-width:420px}';
document.head.appendChild(s);}
K.css=css;
var SK='',SAY_P=.25,SAY={g:null,last:null,n:0,c:null,on:0,l:0};
function sayFlush(){var s=SAY;if(s.g&&s.c&&s.on&&s.last!==s.g){s.last=s.g;Z3.ev('z3c',{a:'say',k:s.c.k,id:s.c.id,n:s.n,l:s.l});}s.g=null;s.n=0;s.c=null;}
function wrapSay(){var f=window.zina;if(typeof f!=='function'||f.__z3c)return;
var w=function(t){var k=SK,g=typeof G!=='undefined'?G:null;SK='';var r=f.apply(this,arguments);
if(g&&!g.won&&t)setTimeout(function(){ZB.safe('z3c-say',function(){var e=document.getElementById('zSay');if(G!==g||!e||!e.classList.contains('on')||e.textContent.indexOf(String(t))!==0)return;
if(SAY.g!==g){sayFlush();SAY.g=g;SAY.l=(g.idx|0)+1;SAY.on=!g.daily&&SAY.last!==g&&Math.random()<SAY_P;}
var rt=e.querySelector('.znr'),id=rt&&rt.getAttribute('data-id')||'z'+h32(String(t));if(!k)k=g.tut?'tut':rt&&rt.getAttribute('data-s')||'lv';
SAY.n++;if(Math.random()*SAY.n<1)SAY.c={k:k,id:id.slice(0,40)};});},0);
return r;};
w.__z3c=1;window.zina=w;
ZB.levelHook.push(function(){ZB.safe('z3c-flush',sayFlush);});ZB.on('start',function(){ZB.safe('z3c-flush',sayFlush);});ZB.on('home',function(){ZB.safe('z3c-flush',sayFlush);});}
K.sayP=function(p){SAY_P=+p;};
var RT={can:null,busy:0,DAYS:14,FROM_DAY:7,FROM_LV:30};K.RT=RT;
function rtLs(){var o=null;try{o=JSON.parse(localStorage.getItem('z3-rate')||'null');}catch(e){}return o&&typeof o==='object'?o:{t:0,n:0};}
function rtFb(){try{return typeof PLAT!=='undefined'&&PLAT!=='vk'&&typeof ysdk!=='undefined'&&ysdk&&ysdk.feedback&&typeof ysdk.feedback.canReview==='function'?ysdk.feedback:null;}catch(e){return null;}}
function rtDue(){if(!K.on.rate||Z3.day()<RT.FROM_DAY||(+S.lv||0)<RT.FROM_LV)return false;var o=rtLs(),now=typeof nowMs==='function'?nowMs():Date.now();return!o.t||now-o.t>=RT.DAYS*864e5;}
function rtCheck(){if(RT.can!==null||RT.busy||!rtDue())return;var fb=rtFb();if(!fb)return;RT.busy=1;
try{fb.canReview().then(function(r){RT.busy=0;RT.can=!!(r&&r.value);},function(){RT.busy=0;RT.can=false;});}catch(e){RT.busy=0;RT.can=false;}}
function rtTxt(k){return Z3.txt(k?'z3k-rate-'+k:'z3k-rate')||(k?'С удовольствием':'Хочешь — оцени игру. Не хочешь — урок окончен, все свободны.');}
ZB.add(ZB.winSlots,{id:'z3rate',order:95,zone:'extra',render:function(ctx){
if(!ctx||ctx.busy||ctx.daily||ctx.again||ctx.mode||!ctx.first||!ctx.g||RT.can!==true||!rtDue()||!rtFb())return'';
css();return'<div class="z3rt"><p>'+esc(rtTxt(''))+' <button type="button" class="btn ghost small" id="z3rtGo">⭐ '+esc(rtTxt('yes'))+'</button></p></div>';},
mount:function(el){var b=el&&el.querySelector('#z3rtGo');if(!b)return;
setTimeout(function(){ZB.safe('z3k-rate-show',function(){if(!b.offsetParent||!document.body.contains(b))return;var m=document.getElementById('mcard'),bx=b.closest('.zbs')||b.parentNode;
var ov=false;if(m){var hz=m.classList.contains('zbfit');if(!hz)m.classList.add('zbfit');ov=m.scrollHeight>m.clientHeight+6;if(!hz)m.classList.remove('zbfit');}
if(ov){if(bx)bx.remove();return;}var o=rtLs();o.t=typeof nowMs==='function'?nowMs():Date.now();o.n=(o.n|0)+1;
try{localStorage.setItem('z3-rate',JSON.stringify(o));}catch(e){}RT.can=null;Z3.ev('z3k',{a:'rate',s:'show',p:'ya',n:o.n});});},400);b.onclick=function(){snd();var fb=rtFb(),box=b.closest('.z3rt');if(!fb)return;b.disabled=true;Z3.ev('z3k',{a:'rate',s:'go',p:'ya'});
var fin=function(s){Z3.ev('z3k',{a:'rate',s:s,p:'ya'});if(box)box.remove();};
try{fb.requestReview().then(function(r){fin(r&&r.feedbackSent?'sent':'no');},function(){fin('err');});}catch(e){fin('err');}};}});
K.boot=function(){if(K._b)return;K._b=1;css();if(K.on.voice){ZB.safe('z3voice',wrapZina);ZB.safe('z3voice2',wrapSettings);}if((+S.lv||0)>=10)K.data().catch(function(){});
if(K.on.juice||K.on.fresh){ZB.safe('z3k-fw',wrapFound);if(K.on.fresh&&(+S.lv||0)>=20)ZB.safe('z3k-seed',fwSeed);ZB.on('levels',function(){ZB.safe('z3k-seed',fwSeed);});}
if(K.on.say)ZB.safe('z3c-wrap',wrapSay);if(K.on.rate)ZB.on('start',function(){ZB.safe('z3k-rate',rtCheck);});
ZB.on('start',function(i){ZB.safe('z3k-note',function(){noteStart(i);});ZB.safe('z3k-season',function(){seasonStart(i);});});
try{if(typeof G!=='undefined'&&G&&!G.won){var i0={idx:G.idx,daily:G.daily,mode:G.mode};noteStart(i0);ZB.safe('z3k-season',function(){seasonStart(i0);});}}catch(e){}};
K.ui=1;
})();
