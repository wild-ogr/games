'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!window.Z3||typeof ZB==='undefined'||typeof S==='undefined'||window.Z4V)return;
var F={};
F.yo=Z.reg('z4v.yo',{t:'Дело о пропавшей букве: неделя следствия раз в сезон (улики, допросы, голос «кто взял», разоблачение)',who:'VSEM'});
F.yos=F.yo&&Z.reg('z4v.yos',{t:'Неделя следствия: пропавшая буква пропадает и в тостах игры',who:'VSEM'});
F.hour=Z.reg('z4v.hour',{t:'Час Зины: вт и пт 19:00 — звёзды стройки ×3, золотые слова, общий счёт дома',who:'VSEM'});
F.color=Z.reg('z4v.color',{t:'Ремонт в подъезде: голосуем цвет стен мазками-словами',who:'VSEM'});
F.elect=Z.reg('z4v.elect',{t:'Выборы старшей по дому: Зина против Валентины Петровны, бюллетень — каждое слово',who:'VSEM'});
F.team=Z.reg('z4v.team',{t:'Мужья против жён: неделя, команда по желанию, сводки с фронта',who:'VSEM'});
var Q=location.search,LOC=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
var DD=LOC?+((/[?&]z4vd=(\d{8})/.exec(Q)||[])[1]||0):0,DH=LOC?(/[?&]z4vh=(\d{1,2})/.exec(Q)||[])[1]:null;
var DATA='js/zb4-vsem-data.js',dataOk=false;
function load(){return ZB.load(DATA).then(function(){dataOk=true;},function(){});}
function safe(n,f){return ZB.safe('z4v:'+n,f);}
function tk(){if(DD)return DD;try{return Z3.tk();}catch(e){return 0;}}
function hr(){if(DH!=null)return+DH;try{return new Date(typeof nowMs==='function'?nowMs():Date.now()).getHours();}catch(e){return new Date().getHours();}}
function dt(k){return new Date(Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100));}
function kt(d){return d.getUTCFullYear()*1e4+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function add(k,n){var d=dt(k);d.setUTCDate(d.getUTCDate()+n);return kt(d);}
function dow(k){return dt(k).getUTCDay();}
function lastSun(k){return add(k,-dow(k));}
function days(a,b){return Math.round((dt(b)-dt(a))/864e5);}
var MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dmy(k){return(k%100)+' '+MON[Math.floor(k/100)%100-1];}
function h32(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function T(k,seed,ctx){var L=window.Z4T&&Z4T[k];if(!L||!L.length)return'';var s=String(L[h32(k+'|'+seed)%L.length]);
return s.replace(/\{(\w+)\}/g,function(m,x){return ctx&&ctx[x]!=null?String(ctx[x]):m;});}
var LEN={y:6,h:4,c:4,e:4,t:4,q:2};
function V(k){if(!S.z4v||typeof S.z4v!=='object')S.z4v={};var a=S.z4v[k];if(!(a instanceof Array)||a.length!==LEN[k]){a=[];for(var i=0;i<LEN[k];i++)a.push(0);S.z4v[k]=a;}return a;}
function R(k,key){var a=V(k);if(a[0]!==key){for(var i=0;i<a.length;i++)a[i]=0;a[0]=key;}return a;}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function ev(a,o){var x={a:a};for(var k in o||{})x[k]=o[k];Z.ev('z4v',x);}
try{if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4v==null)ZBECO.cap.z4v=60;}catch(e){}
function give(n){var k=0;try{if(window.ZBECO&&ZBECO.give)k=ZBECO.give('z4v',n,'quest');}catch(e){}try{if(typeof updCoins==='function')updCoins();}catch(e){}return k;}
function coin(n){return n+' '+pl(n,'монета','монеты','монет');}
var own=0;function say(s,ms){if(!s)return;own=1;try{if(typeof toast==='function')toast(s,ms||2600);}catch(e){}own=0;}
var KIND={yo:{L:'Ё',t:'Дело о пропавшей букве Ё',sh:'пропала Ё'},tz:{L:'Ъ',t:'Дело о пропавшем твёрдом знаке',sh:'пропал твёрдый знак'},
zap:{L:',',t:'Дело о пропавших запятых',sh:'пропали запятые'}};
var KORD=['yo','tz','zap'],CULPRIT={yo:3,tz:2,zap:0};
var SUS=[['Галя с третьего','👒'],['Дед Семён','👴'],['Валерка','👦'],['Кот Ять','🐈']];
var SEAS=[427,701,930,1211];
var CLUE={yo:'елка елочка ежик мед лед клен тетя береза пес шелк щетка черт желудь пчелка свекла котенок теленок орел осел козел василек огонек паренек утенок щеголь шепот лен жернов чечетка',
tz:'подъезд подъем съезд съем съемка въезд объезд отъезд разъезд разъем объем объект объектив изъян субъект инъекция',zap:''};
var CW={};for(var ck in CLUE){CW[ck]={};CLUE[ck].split(' ').forEach(function(w){if(w)CW[ck][w]=1;});}
function yoNow(t){t=t||tk();if(!F.yo||!t)return null;var Y=Math.floor(t/1e4);
for(var s=0;s<4;s++){var sun=lastSun(Y*1e4+SEAS[s]),mon=add(sun,-6),di=days(mon,t);
if(di>=0&&di<=9){var n=(Y-2026)*4+s-3;if(n<0)return null;var k=KORD[n%3];return{kind:k,mon:mon,sun:sun,di:di,live:di<=6,K:KIND[k]};}}
return null;}
function hourNow(t){t=t||tk();if(!F.hour||!t)return null;var d=dow(t),h=hr();
if(d===2||d===5)return{st:h<19?'soon':h===19?'live':'done',t:t,h:h};
if((d===1||d===4)&&h>=12)return{st:'eve',t:t,h:h};return null;}
var COL=[['салатовый','#b9dd8f'],['голубой','#9ccbe8'],['персиковый','#f6c3a0'],['сиреневый','#c9b6e6']];
var CAND=[['Зина','👵'],['Валентина Петровна','👩‍🏫']];
var TEAM=[['Мужья','🧔'],['Жёны','👩'],['Болею за обе','🤝']];
function pev(f,md0,md1,keep){return function(t){t=t||tk();if(!F[f]||!t)return null;var Y=Math.floor(t/1e4);
for(var dy=0;dy<2;dy++){var from=(Y-dy)*1e4+md0,to=(Y-dy)*1e4+md1;
if(from<20261101)continue;
if(t>=from&&t<=to)return{from:from,to:to,live:true,left:days(t,to)+1,di:days(from,t)};
if(t>to&&days(to,t)<=keep)return{from:from,to:to,live:false,ago:days(to,t)};}
return null;};}
var colorNow=pev('color',224,305,365),electNow=pev('elect',202,215,30);
function teamNow(t){t=t||tk();if(!F.team||!t)return null;var Y=Math.floor(t/1e4),sun=lastSun(Y*1e4+531),mon=add(sun,-6),di=days(mon,t);
return di>=0&&di<=9?{mon:mon,sun:sun,di:di,live:di<=6,left:6-di+1}:null;}
var P={};
function pend(key,n){var q=V('q'),t=tk();if(q[0]!==t){q[0]=t;q[1]=0;}if(q[1]>=600)return;n=Math.min(n,600-q[1]);q[1]+=n;P[key]=(P[key]||0)+n;}
function flush(){var k;for(k in P){var n=P[k];while(n>0){var m=Math.min(300,n);Z.srv.send('ev',{e:k,n:m});n-=m;}}P={};}
window.addEventListener('pagehide',function(){safe('flush',flush);});
function vote(f,o){Z.srv.send('v4v',{f:f,o:o});}
function live(E,Fs){return Z.srv.get('v4',{e:E||[],f:Fs||[]}).then(function(r){if(!r||r._sim||!r.ev||!r.vt)return null;
for(var i=0;i<(E||[]).length;i++)if(!r.ev[E[i]])return null;for(var j=0;j<(Fs||[]).length;j++)if(!r.vt[Fs[j]])return null;return r;},function(){return null;});}
function best(r,keys){var b=-1,bn=0,p=0,tot=0;keys.forEach(function(k,i){var x=r.ev[k]||{};p+=+x.p||0;tot+=+x.n||0;if((+x.n||0)>bn){bn=+x.n;b=i;}});return{i:b,p:p,n:tot};}
function lsG(k){try{var v=localStorage.getItem(k);return v==null?null:JSON.parse(v);}catch(e){return null;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
var clueNow=0;
function Y(o){return R('y',o.mon);}
function clueDue(){var o=yoNow();if(!o||o.di>5)return null;var y=Y(o);return y[2]===tk()||y[1]>=6?null:o;}
function clue(o,why){var y=Y(o);y[1]++;y[2]=tk();clueNow=1;sv();say(T('z4v.y.clue',tk()+'|'+y[1])||'🔍 Улика!');ev('clue',{e:'y',k:o.kind,c:y[1],w:why});}
if(F.yo)Z.lvlEvent.add({id:'z4v.yo',who:'VSEM',w:1,ok:function(){return!!clueDue();},run:function(g,done){safe('yo.ev',function(){var o=clueDue();if(o)clue(o,'ev');});done();}});
if(F.yos&&typeof window.toast==='function'&&!window.toast.__z4v){(function(){var t0=window.toast,f=function(s,ms){
if(!own&&typeof s==='string'){var o=yoNow();if(o&&o.live&&o.di<6){if(o.kind==='yo')s=s.replace(/ё/g,'е').replace(/Ё/g,'Е');else if(o.kind==='tz')s=s.replace(/ъ/g,'ь').replace(/Ъ/g,'Ь');else s=s.replace(/,/g,'');}}
return t0.call(this,s,ms);};f.__z4v=1;window.toast=f;})();}
var hourWin=0,wins=0;
Z.onWord(function(o){safe('word',function(){var t=tk();if(!o||!o.w)return;var w=String(o.w).toLowerCase();
var yo=yoNow();if(yo&&yo.di<=5){var y=Y(yo);if(y[2]!==t&&y[1]<6&&(o.bonus||CW[yo.kind][w]))clue(yo,o.bonus?'bonus':'word');}
if(o.bonus)return;
var h=hourNow();if(h&&h.st==='live'){var a=R('h',t);a[1]++;pend('v4h-'+t,1);
if(!o.byHint&&w.length>=6&&a[2]<20){var g=give(2);if(g){a[2]+=g;say(T('z4v.h.gold',t+'|'+a[1])+' +'+coin(g));ev('gold',{e:'h',c:g});}}}
var c=colorNow();if(c&&c.live){var cc=R('c',c.from);if(cc[1]){cc[2]++;pend('v4c'+(cc[1]-1)+'-'+c.from,1);}}
var e=electNow();if(e&&e.live){var ee=R('e',e.from);if(ee[1]){ee[2]++;pend('v4e'+(ee[1]-1)+'-'+e.from,1);}}
var m=teamNow();if(m&&m.live){var tt=R('t',m.mon);if(tt[1]===1||tt[1]===2){tt[2]++;pend('v4t'+(tt[1]===1?'m':'w')+'-'+m.mon,1);}}});});
Z.onStart(function(){clueNow=0;hourWin=0;});
Z.onWin(function(o){safe('win',function(){wins++;var h=hourNow();
if(h&&h.st==='live'&&o&&o.first&&!o.daily&&!o.mode){var st=1+(o.hints?0:1)+(o.bonus>0?1:0),x=st*2,a=R('h',tk());
Z.srv.send('add',{st:x,lv:o.lv});try{if(window.Z3H&&Z3H.Z)Z3H.Z().m+=x;}catch(e){}a[3]+=x;hourWin=x;ev('hour',{e:'h',st:x});}
sv();flush();});});
Z.winLine.add({id:'z4v',order:20,urg:function(){return!!hourWin;},txt:function(){var o;
if(hourWin)return'⏰ Час Зины: звёзды стройки ×3 — дому +'+hourWin+' ⭐';
if(clueNow&&(o=yoNow()))return'🔍 Улика к делу найдена: '+Y(o)[1]+' из 6. Допросы — в «Вечёрке».';
var it=items()[0];if(it&&wins%4===1&&it.inv)return it.inv;return'';}});
function items(){var L=[],t=tk(),o;
if((o=hourNow())&&o.st!=='done')L.push({id:'h',ic:'⏰',pri:o.st==='live'?0:6,t:'Час Зины',s:o.st==='live'?'идёт до 20:00 · звёзды ×3':o.st==='soon'?'сегодня в 19:00':'завтра в 19:00',inv:o.st==='live'?'⏰ Идёт Час Зины: звёзды стройки ×3 до 20:00':''});
else if(o&&o.st==='done'&&V('h')[0]===t&&V('h')[1])L.push({id:'h',ic:'⏰',pri:8,t:'Час Зины прошёл',s:'итог часа',inv:''});
if(o=yoNow()){var y=Y(o);L.push({id:'y',ic:'🔍',pri:o.di>=6?2:1,t:o.K.t,s:o.di>=6?(y[5]?'дело закрыто':'разоблачение!'):'улик '+y[1]+' из 6 · '+(o.di?'допрос дня':'следствие началось'),
inv:o.di>=6&&!y[5]?'🔍 Разоблачение! Кто взял букву — на Доме':''});}
if(o=electNow()){var e=R('e',o.from);L.push({id:'e',ic:'🗳️',pri:o.live?3:9,t:o.live?'Выборы старшей':'Итоги выборов',s:o.live?(e[1]?'ваших бюллетеней: '+e[2]:'выбери кандидатку'):'старшая по дому',
inv:o.live&&!e[1]?'🗳️ Выборы старшей: каждое слово — бюллетень. Выбор — на Доме':''});if(!o.live&&o.ago>14)L.pop();}
if(o=colorNow()){var c=R('c',o.from);if(o.live)L.push({id:'c',ic:'🎨',pri:4,t:'Красим подъезд',s:c[1]?'ваш цвет — '+COL[c[1]-1][0]+' · мазков '+c[2]:'выбери цвет',
inv:!c[1]?'🎨 Красим подъезд: выбери цвет на Доме — каждое слово мазок':''});else if(o.ago<=10)L.push({id:'c',ic:'🎨',pri:9,t:'Подъезд покрасили',s:'какой цвет победил',inv:''});}
if(o=teamNow()){var m=R('t',o.mon);L.push({id:'t',ic:'⚖️',pri:o.live?5:9,t:'Мужья против жён',s:o.live?(m[1]?TEAM[m[1]-1][0]+(m[1]<3?' · слов '+m[2]:''):'выбери команду — по желанию'):'итог недели',
inv:o.live&&!m[1]?'⚖️ Неделя «Мужья против жён»: команда — по желанию, на Доме':''});}
L.sort(function(a,b){return a.pri-b.pri;});return L;}
Z.card.add({id:'z4v',order:function(){var it=items()[0];return it&&(it.pri===0||it.pri===2)?10:it&&it.pri>=3&&it.pri<=5&&it.inv?15:40;},
show:function(){return items().length>0;},
html:function(){var it=items()[0];if(!it)return'';if(!dataOk)load();css();
return'<button type="button" class="z4v-card" data-z4v="'+it.id+'"><span class="z4v-ci">'+it.ic+'</span><span class="z4v-ct"><b>'+esc(it.t)+'</b><small>'+esc(it.s)+'</small></span><em>›</em></button>';},
mount:function(el){var b=el&&el.querySelector('.z4v-card');if(b)b.onclick=function(){try{SND.tap();}catch(e){}go(b.getAttribute('data-z4v'),'home');};}});
function paperRows(){var L=items().slice(0,2);return L.map(function(it){var s=it.s;
if(it.id==='y'){var o=yoNow();if(o&&o.di>=1&&o.di<=4)s='допрос: '+SUS[o.di-1][0];else if(o&&o.di===5)s='показания свидетеля';}
if(it.id==='e'&&electNow()&&electNow().live)s='дебаты дня · '+s;if(it.id==='t'&&teamNow()&&teamNow().live)s='сводка с фронта · '+s;
return'<button type="button" class="z3p-row z4v-prow" data-z4v="'+it.id+'"><span class="z3p-ri">'+it.ic+'</span><span class="z3p-rt"><b>'+esc(it.t)+'</b><small>'+esc(s)+'</small></span><em></em></button>';}).join('');}
function inject(el,op){if(!el||op.r||op.pg||op.arch||op.dn!=null)return;var n=0;
(function tick(){var sh=el.querySelector('.z3p-sheet');if(sh&&!el.querySelector('.z4v-prow')&&el.querySelector('.z3p-front')){var h=paperRows();if(!h)return;
var d=document.createElement('div');d.innerHTML=h;var f=sh.querySelector('.z3p-front'),at=f?f.nextSibling:sh.firstChild;
while(d.firstChild)sh.insertBefore(d.firstChild,at);
[].forEach.call(sh.querySelectorAll('.z4v-prow'),function(b){b.onclick=function(){try{SND.tap();}catch(e){}go(b.getAttribute('data-z4v'),'paper');};});
ev('paper',{n:sh.querySelectorAll('.z4v-prow').length});return;}
if(++n<16)setTimeout(tick,250);})();}
function wrapPaper(){var o=ZB._scr&&ZB._scr.z3paper;if(!o||o.__z4v||typeof o.render!=='function')return;var r0=o.render;
o.render=function(el,op){var r=r0.apply(this,arguments);safe('paper',function(){if(items().length){css();if(!dataOk)load();inject(el,op||{});}});return r;};o.__z4v=1;}
wrapPaper();try{ZB.on('z3late',wrapPaper);}catch(e){}setTimeout(wrapPaper,3000);
var CSS=0;function css(){if(CSS)return;CSS=1;var s=document.createElement('style');s.setAttribute('data-z4v','1');s.textContent=
'.z4v-card{display:flex;align-items:center;gap:10px;width:100%;min-height:56px;padding:10px 12px;border:0;border-radius:var(--z3-rb,16px);background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);box-shadow:var(--z3-shadow,none);font:inherit;text-align:left;cursor:pointer}'+
'.z4v-ci{font-size:28px;line-height:1}.z4v-ct{flex:1;display:flex;flex-direction:column}.z4v-ct b{font-size:16px}.z4v-ct small{font-size:14px;color:var(--z3-ink2,#5d6781)}.z4v-card em{font-style:normal;font-size:24px;color:var(--z3-acc,#c2410c)}'+
'.z4v-scr{display:flex;flex-direction:column;height:100%;background:var(--z3-bg,#f6efe3);color:var(--z3-ink,#27324a);font-family:var(--z3-font,inherit)}'+
'.z4v-hd{display:flex;align-items:center;gap:10px;padding:10px 12px}.z4v-hd b{font-family:var(--z3-font-news,Georgia,serif);font-size:19px;line-height:1.2}'+
'.z4v-body{flex:1;overflow-y:auto;padding:0 12px 24px;max-width:640px;margin:0 auto;width:100%;box-sizing:border-box}'+
'.z4v-blk{background:var(--z3-paper,#fbf7ec);border:1px solid var(--z3-line,#e6dcc8);border-radius:var(--z3-rb,16px);padding:12px 14px;margin:0 0 10px}'+
'.z4v-blk h4{margin:0 0 6px;font-size:16px}.z4v-blk p{margin:4px 0;font-size:15px;line-height:1.4}.z4v-sm{font-size:14px!important;color:var(--z3-ink2,#5d6781)}'+
'.z4v-opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.z4v-opt{flex:1 1 140px;min-height:48px;border-radius:14px;border:2px solid var(--z3-line,#e6dcc8);background:#fff;color:var(--z3-ink,#27324a);font:inherit;font-size:15px;padding:8px 10px;cursor:pointer}'+
'.z4v-opt.on{border-color:var(--z3-blue,#2563c9);background:#e3ecfb;font-weight:600}.z4v-sw{display:inline-block;width:18px;height:18px;border-radius:5px;vertical-align:-3px;margin-right:6px;border:1px solid rgba(0,0,0,.2)}'+
'.z4v-clues{font-size:22px;letter-spacing:3px}.z4v-wall{display:block;margin:6px auto;max-width:240px;width:100%;height:auto}';
document.head.appendChild(s);}
var CUR=null;
function go(p,from){css();ev('open',{e:p,s:from||''});ZB.go('z4vsem',{p:p,from:from||'home'});}
function back(op){try{if(op.from==='paper'&&ZB._scr.z3paper){ZB.go('z3paper',{});return;}}catch(e){}try{if(typeof openMenu==='function')openMenu();else ZB.go('home');}catch(e){}}
ZB.screen('z4vsem',{title:'События дома',render:function(el,op){op=op||{};CUR={el:el,op:op};css();
if(!dataOk){el.innerHTML='<div class="z4v-scr"><p style="padding:40px 16px;text-align:center">📰 Люся несёт новости…</p></div>';
load().then(function(){if(ZB.cur==='z4vsem'&&CUR&&CUR.el===el)page(el,op);});return;}
page(el,op);}});
function frame(el,op,title,body){el.innerHTML='<div class="z4v-scr"><div class="z4v-hd"><button type="button" class="btn ghost small z4v-back">‹ '+(op.from==='paper'?'Номер':'Двор')+'</button><b>'+esc(title)+'</b></div><div class="z4v-body">'+body+'</div></div>';
var b=el.querySelector('.z4v-back');if(b)b.onclick=function(){try{SND.tap();}catch(e){}back(op);};}
function opts(el,cls,cb){[].forEach.call(el.querySelectorAll('.'+cls),function(b){b.onclick=function(){try{SND.tap();}catch(e){}safe('pick',function(){cb(+b.getAttribute('data-o'));});};});}
function rerender(){if(CUR&&ZB.cur==='z4vsem')page(CUR.el,CUR.op);}
function blk(h,p,cls){return'<div class="z4v-blk'+(cls?' '+cls:'')+'">'+(h?'<h4>'+h+'</h4>':'')+p+'</div>';}
function P_(s,sm){return s?'<p'+(sm?' class="z4v-sm"':'')+'>'+esc(s)+'</p>':'';}
function page(el,op){var p=op.p;
if(p==='y'&&yoNow())return pgY(el,op);if(p==='h'&&hourNow())return pgH(el,op);if(p==='c'&&colorNow())return pgC(el,op);
if(p==='e'&&electNow())return pgE(el,op);if(p==='t'&&teamNow())return pgT(el,op);
frame(el,op,'События дома',blk('',P_('Сейчас во дворе тихо. Галя уверена, что это ненадолго.')));}
function pgY(el,op){var o=yoNow(),y=Y(o),k=o.kind,seed=o.mon,h='',i;
h+=blk('🔍 '+(o.di>=6?'Разоблачение':'Следствие идёт'),P_(T('z4v.y.'+k+'.open',seed))+P_('Неделя '+dmy(o.mon)+' — '+dmy(o.sun)+'. Улика — бонусное слово'+(CLUE[k]?' или «подозрительное» слово уровня':'')+'. Одна в день.',1));
var cl='';for(i=0;i<6;i++)cl+=i<y[1]?'🔍':'▫️';h+=blk('Улики: '+y[1]+' из 6','<p class="z4v-clues">'+cl+'</p>');
var q='';for(i=1;i<=Math.min(o.di,4);i++){q+='<p><b>'+SUS[i-1][1]+' '+esc(SUS[i-1][0])+'.</b> '+esc(T('z4v.y.'+k+'.ask'+(i-1),seed))+'</p>';y[3]|=1<<(i-1);}
if(o.di>=5){q+='<p><b>Свидетель.</b> '+esc(T('z4v.y.wit',seed))+'</p>';y[3]|=16;}
h+=blk('Допросы',q||P_('Допросы начнутся завтра. Зина точит карандаш.',1));
if(o.di>=1&&o.di<=5){var b='';SUS.forEach(function(s,j){b+='<button type="button" class="z4v-opt z4v-yv'+(y[4]===j+1?' on':'')+'" data-o="'+j+'">'+s[1]+' '+esc(s[0])+'</button>';});
h+=blk('Кто взял?',P_(y[4]?'Твой голос — '+SUS[y[4]-1][0]+'. Передумать можно до субботы.':'Проголосуй — разоблачение в воскресенье.',1)+'<div class="z4v-opts">'+b+'</div>');}
if(o.di>=6){var cu=CULPRIT[k],ok=y[4]===cu+1,txt=T('z4v.y.'+k+'.end',seed)+(y[4]?' '+T(ok?'z4v.y.right':'z4v.y.wrong',seed):''),rw='';
if(!y[5]&&(y[1]||y[4])){var c=give(Math.min(40,5*y[1]+(ok?10:0)));y[5]=1;if(c)rw='Награда за следствие: +'+coin(c)+'.';ev('rew',{e:'y',c:c,g:ok?1:0,n:y[1]});}
h+=blk('Кто взял: '+SUS[cu][1]+' '+esc(SUS[cu][0]),P_(txt)+P_(rw,1)+'<p class="z4v-sm z4v-dom"></p>');}
sv();frame(el,op,o.K.t,h);
opts(el,'z4v-yv',function(j){if(y[4]===j+1)return;y[4]=j+1;vote('v4y-'+o.mon,j);sv();ev('vote',{e:'y',o:j});rerender();});
if(o.di>=6)live([],['v4y-'+o.mon]).then(function(r){var d=el.querySelector('.z4v-dom'),v=r&&r.vt['v4y-'+o.mon];if(!d||!v||v.all<5)return;
d.textContent='Двор подозревал: '+SUS.map(function(s,j){return s[0]+' — '+Math.round(100*v.n[j]/v.all)+'%';}).join(', ')+'.';});}
function pgH(el,op){var o=hourNow(),a=V('h'),t=tk(),mine=a[0]===t,h='';
var st={eve:T('z4v.h.eve',t),soon:T('z4v.h.soon',t),live:T('z4v.h.live',t),done:T('z4v.h.done',t)}[o.st];
h+=blk(o.st==='live'?'⏰ Идёт Час Зины':'⏰ Час Зины',P_(st)+P_('Вторник и пятница, 19:00–20:00. Первая победа уровня — звёзды стройки ×3. Слово от 6 букв — золотое: +2 монеты (до 20 за час).',1));
if(mine&&(a[1]||a[3]))h+=blk('Твой час',P_('Слов за час: '+a[1]+(a[3]?' · звёзд стройке: +'+a[3]:'')+(a[2]?' · золотых монет: '+a[2]:'')));
h+='<div class="z4v-blk z4v-dom" style="display:none"></div>';frame(el,op,'Час Зины',h);
if(o.st==='live'||o.st==='done')live(['v4h-'+t]).then(function(r){var d=el.querySelector('.z4v-dom'),x=r&&r.ev['v4h-'+t];if(!d||!x||x.p<2)return;
d.style.display='';d.innerHTML='<h4>Весь дом</h4><p>За '+(o.st==='live'?'этот':'прошедший')+' час дом нашёл '+x.n+' '+pl(x.n,'слово','слова','слов')+'.</p>';});}
function wallSVG(ci,f){var c=ci>=0?COL[ci][1]:'#e6dcc8';f=Math.max(0,Math.min(1,f));
return'<svg class="z4v-wall" viewBox="0 0 240 150" role="img" aria-label="Подъезд"><rect x="10" y="10" width="220" height="130" rx="6" fill="#efe6d4"/>'+
'<rect x="10" y="'+(140-130*f).toFixed(1)+'" width="220" height="'+(130*f).toFixed(1)+'" fill="'+c+'"/>'+
'<rect x="95" y="60" width="50" height="80" rx="3" fill="#8a5a3c"/><circle cx="136" cy="102" r="3" fill="#f5b72d"/><rect x="30" y="30" width="40" height="34" rx="3" fill="#cfe9f4" stroke="#fff" stroke-width="3"/>'+
'<rect x="170" y="30" width="40" height="34" rx="3" fill="#cfe9f4" stroke="#fff" stroke-width="3"/><rect x="100" y="40" width="40" height="14" rx="3" fill="#2563c9"/><text x="120" y="51" font-size="10" text-anchor="middle" fill="#fff">№ 7</text></svg>';}
function colorRes(o){var key='z4v-cr-'+o.from,s=lsG(key);return s!=null?{i:+s,live:1}:{i:h32('c'+o.from)%4,live:0};}
function pgC(el,op){var o=colorNow(),c=R('c',o.from),h='';
if(o.live){h+=blk('🎨 Красим подъезд',P_(T('z4v.c.ask',o.from))+P_('До '+dmy(o.to)+'. Каждое слово уровня — мазок в твой цвет.',1));
h+=blk(c[1]?'Твой цвет':'Выбери цвет',wallSVG(c[1]-1,c[1]?Math.min(1,c[2]/80):0)+P_(c[1]?T('z4v.c.mine',o.from,{c:COL[c[1]-1][0]})+' Мазков: '+c[2]+'.':'',0)+'<div class="z4v-opts">'+
COL.map(function(x,j){return'<button type="button" class="z4v-opt z4v-cv'+(c[1]===j+1?' on':'')+'" data-o="'+j+'"><span class="z4v-sw" style="background:'+x[1]+'"></span>'+x[0]+'</button>';}).join('')+'</div>');}
else{var r=colorRes(o);h+=blk('🎨 Подъезд покрасили','<div class="z4v-res">'+wallSVG(r.i,1)+P_(T(r.live?'z4v.c.res':'z4v.c.sim',o.from,{c:COL[r.i][0]}))+'</div>');
if(c[1]&&c[2]>=20&&!c[3]){var g=give(15);c[3]=1;sv();if(g)h+=blk('',P_('За помощь с ремонтом: +'+coin(g)+'.',1));ev('rew',{e:'c',c:g});}}
frame(el,op,'Ремонт в подъезде',h);
opts(el,'z4v-cv',function(j){if(c[1]===j+1)return;c[1]=j+1;vote('v4c-'+o.from,j);sv();ev('pick',{e:'c',o:j});rerender();});
if(!o.live){var K=COL.map(function(x,j){return'v4c'+j+'-'+o.from;});live(K).then(function(r){if(!r)return;var b=best(r,K);if(b.i<0||b.p<3)return;
lsS('z4v-cr-'+o.from,b.i);wallSet();var d=el.querySelector('.z4v-res');if(d)d.innerHTML=wallSVG(b.i,1)+P_(T('z4v.c.res',o.from,{c:COL[b.i][0]}));});}}
function wallSet(){var o=colorNow();if(!o||o.live)return;try{document.documentElement.style.setProperty('--z4v-wall',COL[colorRes(o).i][1]);}catch(e){}}
function electRes(o){var s=lsG('z4v-er-'+o.from);return s!=null?{i:+s,live:1}:{i:Math.floor(o.from/1e4)%2,live:0};}
function pgE(el,op){var o=electNow(),e=R('e',o.from),h='';
if(o.live){h+=blk('🗳️ Выборы старшей по дому',P_(T('z4v.e.ask',o.from))+P_('До '+dmy(o.to)+'. Каждое слово уровня — бюллетень за твою кандидатку. Никакой политики — только двор.',1));
h+=blk('Дебаты дня',P_(T('z4v.e.deb',tk())));
h+=blk(e[1]?'Твой выбор':'За кого?',P_(e[1]?CAND[e[1]-1][0]+' · бюллетеней: '+e[2]:'',0)+'<div class="z4v-opts">'+
CAND.map(function(x,j){return'<button type="button" class="z4v-opt z4v-ev'+(e[1]===j+1?' on':'')+'" data-o="'+j+'">'+x[1]+' '+x[0]+'</button>';}).join('')+'</div>');}
else{var r=electRes(o);h+=blk('🗳️ Итоги выборов','<div class="z4v-res">'+P_(T(r.i?'z4v.e.v':'z4v.e.z',o.from))+P_(r.live?'':'Голоса считала комиссия. Комиссия — Галя.',1)+'</div>');
if(e[1]&&e[2]>=20&&!e[3]){var g=give(15);e[3]=1;sv();if(g)h+=blk('',P_('За активную гражданскую позицию у подъезда: +'+coin(g)+'.',1));ev('rew',{e:'e',c:g});}}
frame(el,op,'Выборы старшей',h);
opts(el,'z4v-ev',function(j){if(e[1]===j+1)return;e[1]=j+1;vote('v4e-'+o.from,j);sv();ev('pick',{e:'e',o:j});rerender();});
if(!o.live){var K=['v4e0-'+o.from,'v4e1-'+o.from];live(K).then(function(r){if(!r)return;var b=best(r,K);if(b.i<0||b.p<3)return;lsS('z4v-er-'+o.from,b.i);stSet();
var d=el.querySelector('.z4v-res');if(d)d.innerHTML=P_(T(b.i?'z4v.e.v':'z4v.e.z',o.from));});}}
function stSet(){var o=electNow(),c=document.documentElement.classList;c.remove('z4v-st-z');c.remove('z4v-st-v');if(!o||o.live)return;c.add(electRes(o).i?'z4v-st-v':'z4v-st-z');}
function pgT(el,op){var o=teamNow(),m=R('t',o.mon),h='';
h+=blk('⚖️ Мужья против жён',P_(T('z4v.t.ask',o.mon))+P_('Неделя '+dmy(o.mon)+' — '+dmy(o.sun)+'. Команда — по желанию: слова уровня идут в её счёт.',1));
if(o.live){h+=blk('Сводка с фронта',P_(T('z4v.t.s',tk())));
h+=blk(m[1]?'Твоя команда':'Выбери команду',P_(m[1]?TEAM[m[1]-1][0]+(m[1]<3?' · слов: '+m[2]:''):'',0)+'<div class="z4v-opts">'+
TEAM.map(function(x,j){return'<button type="button" class="z4v-opt z4v-tv'+(m[1]===j+1?' on':'')+'" data-o="'+j+'">'+x[1]+' '+x[0]+'</button>';}).join('')+'</div>');}
else{h+=blk('Итог недели',P_(T('z4v.t.end',o.mon)));
if((m[1]===1||m[1]===2)&&m[2]>=20&&!m[3]){var g=give(15);m[3]=1;sv();if(g)h+=blk('',P_('За командный дух: +'+coin(g)+'.',1));ev('rew',{e:'t',c:g});}}
h+='<div class="z4v-blk z4v-dom" style="display:none"></div>';frame(el,op,'Мужья против жён',h);
opts(el,'z4v-tv',function(j){if(m[1]===j+1)return;m[1]=j+1;vote('v4t-'+o.mon,j);sv();ev('pick',{e:'t',o:j});rerender();});
var K=['v4tm-'+o.mon,'v4tw-'+o.mon];live(K).then(function(r){var d=el.querySelector('.z4v-dom');if(!r||!d)return;var a=r.ev[K[0]],b=r.ev[K[1]];if((+a.p||0)+(+b.p||0)<3)return;
d.style.display='';d.innerHTML='<h4>Весь дом</h4><p>Мужья — '+a.n+' '+pl(a.n,'слово','слова','слов')+', жёны — '+b.n+' '+pl(b.n,'слово','слова','слов')+'.</p>';});}
safe('init',function(){wallSet();stSet();if(items().length)load();});
window.Z4V={F:F,items:items,yo:yoNow,hour:hourNow,color:colorNow,elect:electNow,team:teamNow,go:go,tk:tk,P:function(){return P;},
_t:{add:add,lastSun:lastSun,dow:dow,days:days}};
})();
