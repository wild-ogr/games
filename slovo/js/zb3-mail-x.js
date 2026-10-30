'use strict';
(function(){
var M=window.Z3MAIL;if(!M||M.ui)return;
var Z=M.Z,F=M.F,ev=M.ev,lsG=M.lsG,lsS=M.lsS;
var MS=[100,200,500,1000,1500,2000],E0=20260105;
var KEYS=[['СЕСТРА','Сестре'],['ПОДРУГА','Подруге'],['МАМА','Маме'],['СОСЕДКА','Соседке']];
var HOL=[['eld','hol.elderly',1001,1002,0],['dch2','hol.dacha2',601,602,0]];
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function snd(){try{SND.tap();}catch(e){}}
function sv(){try{save();}catch(e){}}
function tk(){return Z3.tk();}
function h32(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(a){a=a>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function D(){return window.Z3MD||null;}
function data(){return D()?Promise.resolve(D()):ZB.load('js/zb3-mail-data.js').then(function(){return D()||{t:{},cw:[],harm:[]};});}
function isSub(){try{return!!(window.Z3KIOSK&&Z3KIOSK.sub&&Z3KIOSK.sub());}catch(e){return false;}}
function dkTxt(k){var M2=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];return(k%100)+' '+M2[Math.floor(k/100)%100-1];}
function coins(n,why){var k=0;try{if(window.ZBECO&&ZBECO.give)k=ZBECO.give('z3m',n,why);else if(typeof addCoins==='function'){addCoins(n,'z3m');k=n;}}catch(e){}
try{if(typeof updCoins==='function')updCoins();}catch(e){}return k;}
function bulb(n){try{var mx=typeof HB_MAX!=='undefined'?HB_MAX:9,a=+S.hb||0,b=Math.min(mx,a+n);S.hb=b;return b-a;}catch(e){return 0;}}
function coinI(){return'<span class="coin"></span>';}
function T(k,def){var d=D(),t=d&&d.t&&d.t[k];return t||def||'';}
function U(k,def,ctx){var s=T('ui.'+k,def);if(ctx)s=s.replace(/\{(\w+)\}/g,function(m,x){return ctx[x]!=null?ctx[x]:m;});return s;}
function box(){return M.box();}
function put(L){lsS('z3-mbox',L.slice(0,40));}
function add(e){var L=box();for(var i=0;i<L.length;i++)if(L[i].i===e.i)return false;e.d=e.d||tk();e.u=1;L.unshift(e);put(L);ev('new',{k:e.k});refresh();return true;}
function upd(id,f){var L=box();L.forEach(function(x){if(x.i===id)f(x);});put(L);}
function refresh(){try{if(window.Z3Y&&Z3Y.render&&ZB.cur!=='z3mail'&&document.querySelector('#z3yTags'))Z3Y.render();}catch(e){}}
function keyOf(e){var t=D()&&D().t||{};if(t[e.k])return e.k;var L=[];for(var k in t)if(k.indexOf(e.k+'.')===0&&!/\.(word|ps)$/.test(k)&&/\.\d+$/.test(k))L.push(k);
L.sort(function(a,b){return(+a.split('.').pop())-(+b.split('.').pop());});return L.length?L[(e.r||0)%L.length]:'';}
function nm(){var n=Z().nm;return n||'внучек';}
function fill(s,c){c=c||{};var o={name:nm(),nm:nm()};for(var k in c)o[k]=c[k];
s=s.replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?String(o[k]):m;});
return s.split('\n').map(function(x){return x.replace(/^([\s«"„“'—–\-.…(]*)([a-zа-яё])/,function(m,a,b){return a+b.toUpperCase();});}).join('\n');}
function body(e){var k,t,w='';
if(e.k==='my')return{h:U('my','Твоё письмо'),t:e.x||'',sig:''};
if(e.k==='re')return{h:U('re','Ответ Зины'),t:e.x||'',sig:'',w:e.w||''};
if(e.k==='harm')return{h:U('re','Ответ Зины'),t:e.x||'',sig:''};
if(e.k==='ev')return{h:e.h||'Итог события',t:fill(e.x||''),sig:''};
if(e.k==='pie'){t=Z3.txt('yard-letter-pie')||T('pie');return{h:'Письмо от Зины',t:fill(t),sig:''};}
k=keyOf(e);t=k?T(k):'';if(!t)return{h:'Письмо от Зины',t:'',sig:''};
if(e.k==='fork'){var ps=T('fork.ps');if(ps)t+='\n'+ps;}
w=T(k+'.word');return{h:title(e),t:fill(t,/^nb\./.test(k)?{name:Z().nm||'соседушка',nm:Z().nm||'соседушка'}:e.c),w:w,key:k};}
function title(e){var k=e.k;if(/^lv\d/.test(k))return'Юбилей: '+k.slice(2)+'-й урок';if(k==='chap')return'Глава закрыта';if(k==='streak')return'Про серию';
if(/^back/.test(k))return'Где же ты?';if(/^(hol|fest)\./.test(k))return k==='fest.uch'?'С Днём учителя!':'С праздником!';if(k==='fork')return'Итог голосования';if(k==='sub')return'Личное письмо';
if(/^nb\./.test(k)){var wh=T('nb.'+k.split('.')[1]+'.from');return wh?'Письмо от '+wh:'Письмо от соседки';}if(k==='fr')return'Новосёлы';if(k==='gin')return'Открытка-кроссворд';return'Письмо от Зины';}
function lines(t){return String(t||'').split('\n').map(function(x){x=x.replace(/\s*Слово:\s*[А-ЯЁ]+\.?\s*$/,'');
var c=/^P\.S\./.test(x)?'ps':/^Твоя Зина\.?$/.test(x)?'sig':'';return'<p'+(c?' class="z3m-'+c+'"':'')+'>'+esc(x)+'</p>';}).join('');}
var busy=0;
M.tick=function(why){if(busy)return;var z=Z(),t=tk(),lv=+S.lv||0,d=Z3.day();if(!t)return;
if(!z.v){z.v=t;MS.forEach(function(m){if(lv>=m)z.m=m;});z.c=chapsDone();z.k=alive()?+S.streak||0:0;sv();after(why);return;}
var mm=0;MS.forEach(function(m){if(lv>=m&&z.m<m)mm=m;});if(mm){z.m=mm;add({i:'lv'+mm,k:'lv'+mm});}
var cd=chapsDone();if(cd>z.c){var ch=null;try{ch=ZB.chap(cd-1);}catch(e){}z.c=cd;add({i:'ch'+cd,k:'chap',r:cd-1,c:{chap:ch&&ch.name||'глава '+cd}});}
if(z.d!==t&&d>=2){var e=daily(z,t);if(e){z.d=t;add(e);}else{busy=1;
evP().then(function(e1){return e1||(forkDue(Z(),t)?fork(Z(),t):null);}).then(function(e2){return e2||nb(Z(),t);}).then(function(e2){busy=0;if(!e2&&isSub())e2=subL(t);
if(e2&&Z().d!==t){Z().d=t;if(e2.nb){Z().nb=t;Z().nn=(+Z().nn||0)+1;delete e2.nb;}add(e2);if(e2.k==='ev')try{Z3PAPER.evMailDone(e2.i);}catch(x){}sv();}},function(){busy=0;});}}
if(alive())z.k=Math.max(+S.streak||0,0);z.v=t;sv();after(why);};
function evP(){try{if(window.Z3PAPER&&Z3PAPER.evMail)return Z3PAPER.evMail().then(function(o){return o&&o.i&&o.t?{i:String(o.i),k:'ev',h:String(o.h||''),x:String(o.t).slice(0,1500)}:null;},function(){return null;});}catch(e){}return Promise.resolve(null);}
function after(why){if(why==='win')return;pieArch();morning();gin();}
function pieArch(){var y=S.z3y||{};if(!((+y.l||0)&1))return;var L=box();for(var i=0;i<L.length;i++)if(L[i].i==='pie')return;L.push({i:'pie',k:'pie',d:tk(),u:0});put(L);}
function chapsDone(){try{var lv=+S.lv||0;if(typeof LEVELS!=='undefined'&&lv>=LEVELS.length)return ZB.chapCount?ZB.chapCount():ZB.chapAt(LEVELS.length-1)+1;return ZB.chapAt(lv);}catch(e){return 0;}}
function alive(){var l=+S.lastDaily||0;return l===tk()||l===yday();}
function yday(){var t=tk(),d=new Date(Date.UTC(Math.floor(t/1e4),Math.floor(t/100)%100-1,t%100)-864e5);return d.getUTCFullYear()*1e4+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function daily(z,t){var g=Z3.days(z.v,t),r=h32(t);
if(g>=14)return{i:'b'+t,k:'back14',r:r};if(g>=7)return{i:'b'+t,k:'back7',r:r};if(g>=3)return{i:'b'+t,k:'back3',r:r};
var l=+S.lastDaily||0;if(z.k>=3&&l&&l<yday()&&z.sb!==l){z.sb=l;var n=z.k;z.k=0;return{i:'s'+t,k:'streak',r:r,c:{n:n}};}
var md=t%10000,y=Math.floor(t/1e4),fs=[];try{fs=Z3.fest?Z3.fest():[];}catch(e){}
for(var j=0;j<fs.length;j++){var fid='f'+fs[j]+'-'+(md<300?y-1:y);if(fs[j]!=='ny'&&md<300)fid='f'+fs[j]+'-'+y;if(!hDone(z,fid)&&hasFest(fs[j])){hMark(z,fid);return{i:'h'+fid,k:'fest.'+fs[j],r:r};}}
for(var i=0;i<HOL.length;i++){var H=HOL[i],id=H[0]+'-'+(H[2]>=1200&&md<200?y-1:y);
if(md>=H[2]&&md<=H[3]&&(!H[4]||H[4]===y)&&!hDone(z,id)){hMark(z,id);return{i:'h'+id,k:H[1]};}}
return null;}
function hDone(z,id){return(','+z.h+',').indexOf(','+id+',')>=0;}
function hMark(z,id){var a=z.h?z.h.split(','):[];a.push(id);z.h=a.slice(-3).join(',');}
function hasFest(k){var d=D();if(!d)return true;var t=d.t||{};for(var x in t)if(x.indexOf('fest.'+k+'.')===0)return true;return false;}
function nbKeys(d){if(d&&d.nb&&d.nb.length)return d.nb;var t=d&&d.t||{},L=[];for(var k in t){var m=/^nb\.([a-z]+)\.(\d+)$/.exec(k);if(m)L.push([+m[2],m[1],k]);}
L.sort(function(a,b){return a[0]-b[0]||(a[1]<b[1]?-1:a[1]>b[1]?1:0);});return L.map(function(x){return x[2];});}
function nb(z,t){var d=Z3.day(),g=z.nb?Z3.days(z.nb,t):99;if(d<7||g<7||g<10&&h32('nb'+t)%3)return null;
return data().then(function(D0){var L=nbKeys(D0);if(!L.length)return null;var k=L[(+z.nn||0)%L.length];return{i:'n'+t,k:k,nb:1};},function(){return null;});}
function subL(t){return{i:'u'+t,k:'sub',r:h32('u'+t)};}
function forkDue(z,t){if(!(window.Z3PAPER&&Z3PAPER.on&&Z3PAPER.on()))return false;var wk=Math.floor(Z3.days(E0,t)/7);return wk>0&&z.f<wk;}
function fork(z,t){var wk=Math.floor(Z3.days(E0,t)/7),pw=wk-1,sw=((pw%8)+8)%8,s=sw<4?1:2,w=sw%4+1,f='s'+s+'.w'+w+'#'+pw;
return ZB.load('js/zb3-paper-data.js').then(function(){var se=window.Z3PD&&Z3PD.se||{},O=[];['A','B','C','D'].forEach(function(x){var o=se['s'+s+'.w'+w+'.fork.opt'+x];if(o)O.push(o);});
Z().f=wk;sv();if(!O.length)return null;
return Z3.srv.get('vote',{f:f}).then(function(v){var n=v&&v.n||[],b=0;for(var i=1;i<O.length;i++)if((+n[i]||0)>(+n[b]||0))b=i;
return{i:'f'+wk,k:'fork',r:h32(f),c:{opt:O[b]},ps:'paper'};},function(){return null;});});}
var MQ='z3-mq',MM='z3-mmem',MU='z3-mused',mBusy=0;
var FN={ny:'Новый год',hw:'Хеллоуин',feb23:'23 Февраля',mar:'8 Марта',mas:'Масленица',may:'майские',sep1:'1 Сентября',uch:'День учителя'};
var SEAS=['зима','зима','весна','весна','весна','лето','лето','лето','осень','осень','осень','зима'];
var SAFE=[['rude',/(дура([^а-я]|$)|дурак|дебил|идиот|(^|[^а-я])урод([аыуов]|ами|ина)?([^а-я]|$)|тварь|козел|скотина)/],
['politics',/(путин|войн[аеуыо]|власт|выбор[ыао]|президент|депутат|санкци|(^|[^а-я])сво([^а-я]|$)|политик|украин|америк|навальн|митинг)/],
['contact',/(номер телефон|ваш телефон|твой телефон|дайте телефон|дай телефон|адрес|встретимся|встретиться с вами|приезжайте|приеду к вам|в гости к вам|whatsapp|ватсап|вотсап|телеграм|viber|вайбер)/]];
var SAFE2=[['health',/(бол(ит|ею|ел[аи]?|езн)|давлени|таблет|лекарств|врач|больниц|операци|диабет|онколог|(^|[^а-я])рак([^а-я]|$)|инсульт|инфаркт|умер|похорон|лечени)/],
['money',/(деньг|(^|[^а-я])долг(и|ов|ам|ами|ах)?([^а-я]|$)|кредит|займ|рубл|перевед|наследств|банк|пенси[яию])/]];
function R(){return window.Z3MR||null;}
function reData(){return R()?Promise.resolve(R()):ZB.load('js/zb3-mail-re.js').then(function(){return R()||{tp:[],re:{},safe:{}};});}
function norm(t){return' '+String(t||'').toLowerCase().replace(/ё/g,'е').replace(/[^а-яa-z0-9]+/g,' ').replace(/^\s+|\s+$/g,'')+' ';}
var SIG=/([.!?…,)]\s*|\s+[-—–]\s*)([А-ЯЁ][а-яё]+\.?(\s+[А-ЯЁ][а-яё]+\.?){0,2})\s*[.!]?\s*$/;
function unsig(r){r=String(r||'').replace(/^\s+|\s+$/g,'');var m=r.match(SIG);if(m&&!/^(Ять|Гал[яиюе]|Сем[её]н|Валерк[аеиу]|Зин[аеуы]|Веч[её]рк[аеиу])([^а-яё]|$)/.test(m[2]))r=r.slice(0,m.index)+m[1];return r;}
function topic(raw,d){var t=norm(unsig(raw)),i,b=null;if(HARM.test(raw))return'harm';
for(i=0;i<SAFE.length;i++)if(SAFE[i][1].test(t))return SAFE[i][0];
(d.tp||[]).forEach(function(x){var n=0;x[2].forEach(function(k){if(k.length<=4||k.indexOf(' ')>=0?t.indexOf(' '+k)>=0:t.indexOf(k)>=0)n++;});
if(n&&(!b||n>b.n||n===b.n&&x[1]>b.p))b={id:x[0],p:x[1],n:n};});
if(b&&b.n>=2)return b.id;
for(i=0;i<SAFE2.length;i++)if(SAFE2[i][1].test(t))return SAFE2[i][0];
return b?b.id:'any';}
var NOTNM=/^(Зина|Зиночка|Галя|Галина|Валерка|Семен|Семён|Ять|Люся|Мой|Моя|Мои|Очень|Тоже|Уже|Ещ[её]|Был|Была|Есть|Спасибо|Привет|Когда|Тогда|Как|Так|Все|Всё|Сегодня|Вчера|Завтра|Очень)$/;
function mem(){var m=lsG(MM,null);return m&&typeof m==='object'?m:{};}
function learn(raw){var m=mem(),s=String(raw||''),x,P=[['cat',/(?:^|[^А-Яа-яЁё])[Кк](?:от|ошк|отик|отейк|от[её]н|ис[ау]|исуль)[а-яё]*(?:[\s,:—-]+(?:у\s+меня|мой|моя|наш|наша|по\s+имени|по\s+кличке|зовут|звать|кличут))*[\s,:—-]+([А-ЯЁ][а-яё]{2,11})/],
['cat',/[Кк](?:от|ошк)[а-яё]*[^.!?]{0,25}?(?:зовут|звать|кличут|кличка)\s+([А-ЯЁ][а-яё]{2,11})/],
['vnuk',/(?:^|[^А-Яа-яЁё])[Вв]ну(?:к|чк|чек|чок|ч[её]к|чен|чат)[а-яё]*(?:[\s,:—-]+(?:у\s+меня|мой|моя|мо[иею]|наш|наша|по\s+имени|зовут|звать))*[\s,:—-]+([А-ЯЁ][а-яё]{2,11})/],
['vnuk',/[Вв]ну(?:к|чк)[а-яё]*[^.!?]{0,25}?(?:зовут|звать)\s+([А-ЯЁ][а-яё]{2,11})/]],ch=0;
P.forEach(function(p){if(m[p[0]+'_'])return;x=p[1].exec(s);if(x&&!NOTNM.test(x[1])){m[p[0]]=x[1];m[p[0]+'_']=1;ch=1;}});
for(var k in m)if(/_$/.test(k))delete m[k];if(ch)lsS(MM,m);return m;}
function serial(){try{if(!(window.Z3PAPER&&Z3PAPER.on&&Z3PAPER.on()&&window.Z3PD))return'';var dn=Z3.days(E0,tk())-1;if(dn<0)return'';
var wk=Math.floor(dn/7),sw=((wk%8)+8)%8,s=sw<4?1:2,w=sw%4+1,dw=((dn%7)+8)%7,e=dw===0?7:dw,t=(Z3PD.se||{})['s'+s+'.w'+w+'.e'+e]||'';
t=t.split(' / ')[0].split(':')[0].replace(/[.,!?…\s]+$/,'');return t.length>=8&&t.length<=60?t:'';}catch(e){return'';}}
function ctx(){var m=mem(),o={name:nm(),nm:nm()},lv=+S.lv||0,f=[];if(m.cat)o.cat=m.cat;if(m.vnuk)o.vnuk=m.vnuk;if(lv>0)o.lvl=lv;
try{var ld=typeof levelData==='function'?levelData(lv-1):null,w='';(ld&&ld.w||[]).forEach(function(x){if(String(x[0]).length>w.length)w=String(x[0]);});if(w)o.word=w.toLowerCase();}catch(e){}
try{f=Z3.fest&&Z3.fest()||[];}catch(e){}if(f[0]&&FN[f[0]])o.fest=FN[f[0]];o.season=SEAS[new Date().getMonth()];var se=serial();if(se)o.serial=se;return o;}
function fillR(s,o){var miss=0;s=String(s).replace(/\{(\w+)(?:[|\/]([^}]*))?\}/g,function(m,k,alt){var v=o[k];if(v!=null&&v!=='')return String(v);if(alt!=null)return alt;miss=1;return'';});return miss?null:s;}
function pickRe(d,top,seed){var used=lsG(MU,[]),o=ctx(),C=[],F,i;if(!(used instanceof Array))used=[];
function cand(tp){var r=[];(d.re[tp]||[]).forEach(function(x){var id=tp+'.'+x[0],t=fillR(x[1],o);if(t!=null)r.push({id:id,t:t,w:x[2]||'',u:used.indexOf(id)});});return r;}
C=cand(top);F=C.filter(function(c){return c.u<0;});if(!F.length&&top!=='any'){F=cand('any').filter(function(c){return c.u<0;});}
if(!F.length){F=C.length?C:cand('any');F.sort(function(a,b){return a.u-b.u;});F=F.slice(0,1);}if(!F.length)return null;
var pers=F.filter(function(c){return(o.cat&&c.t.indexOf(o.cat)>=0)||(o.vnuk&&c.t.indexOf(o.vnuk)>=0);});if(pers.length)F=pers;
var c=F[seed%F.length];i=used.indexOf(c.id);if(i>=0)used.splice(i,1);used.push(c.id);lsS(MU,used.slice(-300));
var t=c.t,zn=Z().nm,gm=/^(\s*(?:здравствуй(?:те)?|привет|доброе утро|добрый день|добрый вечер))([!.,])/i;
if(zn&&t.indexOf(zn)<0)t=gm.test(t)?t.replace(gm,'$1, '+zn+'$2'):'Здравствуй, '+zn+'!\n'+t;
return{t:fill(t,o),w:c.w};}
function safeRe(d,top,seed){var L=d.safe&&d.safe[top]||[];if(!L.length)return null;return{t:fill(L[seed%L.length],{}),w:''};}
function due(ts){var d=new Date(ts);d.setHours(6,0,0,0);if(d.getTime()<ts+2*3600e3)d.setDate(d.getDate()+1);return d.getTime();}
function queue(){var Q=lsG(MQ,[]);return Q instanceof Array?Q:[];}
function morning(){if(mBusy||!F.lt)return;var Q=queue(),now=Date.now();if(!Q.some(function(q){return now>=due(q.ts);}))return;mBusy=1;
var pp=window.Z3PAPER&&Z3PAPER.on&&Z3PAPER.on()&&!window.Z3PD?ZB.load('js/zb3-paper-data.js').then(function(){},function(){}):Promise.resolve();
pp.then(reData).then(function(d){var keep=[];queue().forEach(function(q){if(Date.now()<due(q.ts)){keep.push(q);return;}
learn(q.t);var top=topic(q.t,d),sd=h32(q.t+'|'+q.ts),r=d.safe&&d.safe[top]?safeRe(d,top,sd):pickRe(d,top,sd);
if(r&&add({i:'re'+q.i,k:'re',x:r.t.slice(0,900),w:r.w,tp:top}))ev('re',{tp:top});});
lsS(MQ,keep);mBusy=0;},function(){mBusy=0;});}
M.morning=morning;M.topic=function(t){return reData().then(function(d){return topic(t,d);});};
function frGot(o){if(!F.fr||!o||o.kind!=='house'||!o.data||o.data._off||o.data._sim)return;var g=o.data.gift||{},n=Math.min(5,+g.fr||0);if(n<=0)return;
var key=String(o.data.d||'')+':'+(g.frn||[]).join('|')+':'+n;if(lsG('z3-frk','')===key)return;lsS('z3-frk',key);
var c=coins(30*n,'fr'),h=bulb(n),z=Z();z.fr+=n;sv();(g.frn&&g.frn.length?g.frn:['подруга']).slice(0,n).forEach(function(who,i){add({i:'fr'+key+i,k:'fr',r:h32(key+i),c:{fr:who},rew:[c,h]});c=0;h=0;});
try{Z3.srv.send('got',{fr:+g.fr||0});}catch(e){}ev('fr',{n:n});}
ZB.on('z3srv',frGot);
try{var hc=Z3.srv&&Z3.srv.peek&&Z3.srv.peek('house');if(hc)frGot({kind:'house',data:hc});}catch(e){}
function gin(){var cw=lsG('z3-cwin','');if(!cw)return;lsS('z3-cwin','');if(!dec(cw))return;
if(add({i:'g'+cw,k:'gin',r:h32(cw),c:{},cw:cw})){ev('cw',{s:'in'});
if((+S.lv||0)>=5&&(ZB.cur==='home'||!ZB.cur)&&!($('modal')&&$('modal').classList.contains('on'))){data().then(function(){openLetter('g'+cw,true);});}}}
function pool(){var d=D();return d&&d.cw||[];}
var SEEN=null;function seen(){if(SEEN)return SEEN;SEEN={};try{var n=Math.min(+S.lv||0,LEVELS.length);for(var i=0;i<n;i++)(LEVELS[i].w||[]).forEach(function(w){SEEN[String(w[0]).toUpperCase()]=1;});}catch(e){}return SEEN;}
function gen(ki,seed){var key=KEYS[ki][0],P=pool(),r=rng(seed),used={},out=[],sn=seen();
for(var i=0;i<key.length;i++){var a=[],b=[];P.forEach(function(p,j){if(!used[j]&&p[0].indexOf(key[i])>=0)(sn[p[0]]?a:b).push(j);});
var L=a.length&&(r()<.7||!b.length)?a:b;if(!L.length)return null;var j=L[Math.floor(r()*L.length)];used[j]=1;out.push(j);}
return out;}
function enc(ki,rows){return ki+'-'+rows.map(function(j){return('0'+j.toString(36)).slice(-2);}).join('');}
function dec(s){var m=/^(\d)-([0-9a-z]+)$/.exec(String(s||''));if(!m||!KEYS[+m[1]]||m[2].length%2)return null;var ki=+m[1],key=KEYS[ki][0],rows=[],P=pool();
if(m[2].length!==key.length*2)return null;if(!P.length)return{ki:ki,rows:[]};
for(var i=0;i<key.length;i++){var j=parseInt(m[2].substr(i*2,2),36);if(!P[j]||P[j][0].indexOf(key[i])<0)return null;rows.push(j);}return{ki:ki,rows:rows};}
function play(el,ki,rows,done,show){var key=ki>=0?KEYS[ki][0]:'',P=pool(),R=rows.map(function(j,i){var w=typeof j==='string'?j:P[j][0],at=key?w.indexOf(key[i]):0;return{w:w,c:typeof j==='string'?'':P[j][1],at:at};}),
L=0,W=0;R.forEach(function(x){L=Math.max(L,x.at);});R.forEach(function(x){W=Math.max(W,L-x.at+x.w.length);});
var ok=R.map(function(){return!!show;}),cur=0,g='';
function draw(){var h='<div class="z3m-cw" style="--n:'+W+'">';R.forEach(function(x,i){h+='<button type="button" class="z3m-row'+(i===cur&&!ok[i]?' on':'')+(ok[i]?' ok':'')+'" data-i="'+i+'">';
for(var k=0;k<W;k++){var p=k-(L-x.at),ch=p>=0&&p<x.w.length?(ok[i]?x.w[p]:i===cur&&p<g.length?g[p]:''):null;
h+=ch===null?'<i class="z3m-sp"></i>':'<i class="z3m-c'+(key&&k===L?' k':'')+'">'+esc(ch)+'</i>';}h+='</button>';});h+='</div>';
var x=R[cur];if(!ok[cur]&&x){var t=x.w.split(''),r=rng(h32(x.w+cur));for(var i=t.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),q=t[i];t[i]=t[j];t[j]=q;}
h+=(x.c?'<p class="z3m-clue">'+(R.length>1?(cur+1)+'. ':'')+esc(x.c)+'</p>':'')+'<div class="z3m-tiles">'+t.map(function(c,i){return'<button type="button" class="z3m-t" data-t="'+i+'">'+esc(c)+'</button>';}).join('')+
'<button type="button" class="z3m-t z3m-bk" data-t="-1" aria-label="стереть">⌫</button></div>';}
el.innerHTML=h;var used={};
[].forEach.call(el.querySelectorAll('.z3m-row'),function(b){b.onclick=function(){var i=+b.getAttribute('data-i');if(ok[i])return;snd();cur=i;g='';draw();};});
[].forEach.call(el.querySelectorAll('.z3m-t'),function(b){b.onclick=function(){var i=+b.getAttribute('data-t');snd();
if(i<0){if(!g)return;g=g.slice(0,-1);draw();return;}if(b.disabled)return;g+=b.textContent;draw();
if(g.length>=x.w.length){if(g===x.w){ok[cur]=true;g='';var n=-1;for(var k=1;k<=R.length;k++)if(!ok[(cur+k)%R.length]){n=(cur+k)%R.length;break;}
if(n<0){draw();done();return;}cur=n;draw();}
else{var row=el.querySelector('.z3m-row.on');if(row){row.classList.add('bad');}setTimeout(function(){g='';draw();},500);}}};});
var cnt={};g.split('').forEach(function(c){cnt[c]=(cnt[c]||0)+1;});[].forEach.call(el.querySelectorAll('.z3m-t'),function(b){var c=b.textContent;if(b.getAttribute('data-t')!=='-1'&&cnt[c]){cnt[c]--;b.disabled=true;}});}
draw();}
var CUR={op:{}};
M.render=function(el,op){css();CUR={el:el,op:op};data().then(function(){if(ZB.cur!=='z3mail')return;
if(op.id)return letter(el,op.id);if(op.pg==='write')return write(el);if(op.pg==='cw')return make(el,op.ki||0,op.seed);list(el);});};
function hdr(title,back){return'<div class="z3m-hd"><button type="button" class="btn ghost small z3m-back" data-go="'+back+'">‹ '+(back==='home'?'Двор':'Почта')+'</button><h2>'+esc(title)+'</h2></div>';}
function bindBack(el){[].forEach.call(el.querySelectorAll('[data-go]'),function(b){b.onclick=function(){snd();var a=b.getAttribute('data-go');
if(a==='mail'&&CUR.op&&CUR.op.back){var bk=CUR.op.back,f=CUR.op.from;CUR.op.back=null;try{if(f==='win'){if(typeof show==='function')show('game');}else if(typeof openMenu==='function')openMenu();}catch(e){}ZB.safe('z3m-back',bk);return;}
if(a==='home'){try{if(typeof openMenu==='function')openMenu();else ZB.go('home');}catch(e){}}else ZB.go('z3mail',{});};});}
function canLt(){return F.lt&&Z3.day()>=4;}
function canCw(){return F.cw&&Z3.day()>=4&&typeof PLAT!=='undefined'&&PLAT==='vk'&&(!(typeof OK!=='undefined'&&OK)||(typeof OK_LINK!=='undefined'&&!!OK_LINK));}
function list(el){var L=box(),h='<div class="z3m-scr">'+hdr('✉️ Почта бабы Зины','home')+'<div class="scroll z3m-body">';
var acts='';if(canLt())acts+='<button type="button" class="btn green z3m-act" data-a="write">✍ '+esc(U('write.h','Напиши Зине'))+'</button>';
else if(F.lt&&Z3.day()<4&&Z3.day()>=2)acts+='<p class="z3m-sm">'+esc(U('write.soon','«Напиши Зине» откроется на {d}-й день.',{d:4}))+'</p>';
if(canCw())acts+='<button type="button" class="btn ghost z3m-act" data-a="cw">🎁 '+esc(U('cw.h','Кроссворд в подарок'))+'</button>';
if(acts)h+='<div class="z3m-acts">'+acts+'</div>';
if(!L.length)h+='<p class="z3m-empty">'+esc(U('empty','Писем пока нет.'))+'</p>';
else h+='<div class="z3m-list">'+L.map(function(e){var b=body(e),f=b.t.split('\n')[0].replace(/\s*Слово:.*$/,'');if(f.length>56)f=f.slice(0,54)+'…';
var ic=e.k==='my'?'📝':e.k==='re'||e.k==='harm'?'💌':e.k==='gin'?'🎁':e.k==='fr'?'🏠':'✉️';
return'<button type="button" class="z3m-it'+(e.u?' u':'')+'" data-id="'+esc(e.i)+'"><span class="z3m-ic">'+ic+'</span><span class="z3m-tx"><b>'+esc(b.h)+'</b><small>'+esc(f)+'</small></span><span class="z3m-dt">'+dkTxt(e.d)+'</span></button>';}).join('')+'</div>';
el.innerHTML=h+'</div></div>';bindBack(el);
[].forEach.call(el.querySelectorAll('.z3m-it'),function(b){b.onclick=function(){snd();ZB.go('z3mail',{id:b.getAttribute('data-id')});};});
[].forEach.call(el.querySelectorAll('.z3m-act'),function(b){b.onclick=function(){snd();ZB.go('z3mail',{pg:b.getAttribute('data-a')});};});
morning();}
function desk(el,inner){var w=el.clientWidth||innerWidth,h=el.clientHeight||innerHeight,pc=w>=860,A=window.Z3ART||{};
var paint=function(){var bg=el.querySelector('.z3m-desk'),sh=el.querySelector('.z3m-sheet');if(!bg||!sh||!A.desk)return;
if(A.deskCss&&!$('z3mDeskCss')){var c=document.createElement('style');c.id='z3mDeskCss';c.textContent=A.deskCss;document.head.appendChild(c);}
var bx={width:bg.offsetWidth,height:bg.offsetHeight};pc=bx.width>=760;bg.innerHTML=Z3.art('desk',{kind:'mail',w:bx.width,h:bx.height,pc:pc});var r=A.deskFree?A.deskFree('mail',bx.width,bx.height,pc):null;
if(r&&bx.width>660){var sw=Math.min(620,bx.width-40);r=[(bx.width-sw)/2,r[1],sw,r[3]];}
if(r&&r[2]>=260){sh.style.left=Math.round(r[0])+'px';sh.style.top=Math.round(r[1])+'px';sh.style.width=Math.round(r[2])+'px';sh.style.maxHeight=Math.round(r[3])+'px';sh.classList.add('z3-letter','z3m-on');}};
if(A.desk)setTimeout(paint,0);else if(Z3.artLoad)Z3.artLoad('desk').then(function(){A=window.Z3ART||{};paint();},function(){});}
function openLetter(id,modalMode){if(modalMode){ZB.go('z3mail',{id:id});return;}}
function letter(el,id){var L=box(),e=null;L.forEach(function(x){if(x.i===id)e=x;});if(!e){list(el);return;}
if(e.u){upd(id,function(x){x.u=0;});ev('read',{k:e.k});refresh();}
var b=body(e),h='<div class="z3m-scr">'+hdr(b.h,'mail')+'<div class="z3m-wrap"><div class="z3m-desk"></div><div class="z3m-sheet scroll">';
h+='<p class="z3m-date">'+dkTxt(e.d)+'</p>'+lines(b.t);
if(e.k==='my')h+='<p class="z3m-sm">'+esc(U('wait','Ответ придёт утром.'))+'</p>';
if(e.rew&&(e.rew[0]||e.rew[1]))h+='<p class="z3m-rew">'+esc(U('fr.rew','Подарок:'))+' '+(e.rew[1]?'💡 +'+e.rew[1]+' ':'')+(e.rew[0]?'+'+e.rew[0]+' '+coinI():'')+'</p>';
if(b.w)h+='<div class="z3m-ps">'+(e.s?'<p class="z3m-ok">✓ '+esc(b.w)+'</p><button type="button" class="btn green z3m-lv">'+esc(U('ps.go','К уроку ▶'))+'</button>':
'<button type="button" class="btn green z3m-psgo">🔎 '+esc(U('ps.h','Разгадать загадку'))+'</button>')+'<div class="z3m-psplay"></div></div>';
if(e.ps==='paper'&&window.Z3PAPER&&Z3PAPER.on&&Z3PAPER.on())h+='<button type="button" class="btn ghost z3m-paper">📰 '+esc(U('ps.paper','Открыть «Вечёрку»'))+'</button>';
if(e.k==='gin')h+='<div class="z3m-gin"></div>';
el.innerHTML=h+'</div></div></div>';bindBack(el);desk(el.querySelector('.z3m-wrap'));
var g=el.querySelector('.z3m-psgo');if(g)g.onclick=function(){snd();g.style.display='none';var p=el.querySelector('.z3m-psplay');
play(p,-1,[b.w],function(){var c=coins(15,'ps');upd(id,function(x){x.s=1;});Z().p++;sv();ev('ps',{k:e.k,c:c});
p.innerHTML='<p class="z3m-ok">'+esc(U('ps.ok','Угадал!'))+' +'+c+' '+coinI()+'</p><button type="button" class="btn green z3m-lv">'+esc(U('ps.go','К уроку ▶'))+'</button>';bindLv(p);});};
bindLv(el);var pp=el.querySelector('.z3m-paper');if(pp)pp.onclick=function(){snd();Z3.yardGo('paper');};
if(e.k==='gin')ginPlay(el.querySelector('.z3m-gin'),e);}
function bindLv(el){[].forEach.call(el.querySelectorAll('.z3m-lv'),function(b){b.onclick=function(){snd();try{var y=window.Z3Y&&Z3Y.DEF&&Z3Y.DEF.kitchen;if(typeof openMenu==='function')openMenu();
setTimeout(function(){var p=$('btnPlay');if(p)p.click();else if(y)y.go();},60);}catch(x){}};});}
function ginPlay(el,e){var c=dec(e.cw);if(!c||!c.rows.length){el.innerHTML='<p class="z3m-sm">Открытка помялась в дороге — кроссворд не прочитать.</p>';return;}
var got=(','+Z().gr+',').indexOf(','+e.cw+',')>=0;
el.innerHTML='<p class="z3m-sm">'+esc(U('cw.solve','Нажми на строку, собери слово из букв.'))+'</p><div class="z3m-pl"></div><div class="z3m-end"></div>';
play(el.querySelector('.z3m-pl'),c.ki,c.rows,function(){var z=Z(),h=0,k=0;if(!got){var a=z.gr?z.gr.split(','):[];a.push(e.cw);z.gr=a.slice(-6).join(',');h=bulb(1);k=coins(20,'cw');sv();got=true;}
ev('cw',{s:'done',k:c.ki,c:k});var end=el.querySelector('.z3m-end');
end.innerHTML='<p class="z3m-ok">'+esc(U('cw.done','Всё разгадано!'))+'</p>'+(h||k?'<p class="z3m-rew">'+esc(U('cw.rew','Гостинец:'))+' '+(h?'💡 +'+h+' ':'')+(k?'+'+k+' '+coinI():'')+'</p>':'')+
(canCw()?'<button type="button" class="btn ghost z3m-ans">🎁 '+esc(U('cw.answer','Сделать кроссворд в ответ'))+'</button>':'');
var a=end.querySelector('.z3m-ans');if(a)a.onclick=function(){snd();ZB.go('z3mail',{pg:'cw'});};},got);}
var BAD=/(^|[^а-яё])(х[уy][йяеёию]|пизд|бля([дт]|[^а-яё]|$)|еба[нлтш]|ёба|(за|вы|у|до|на|от|раз|при)ъ?[её]б[аиуыло]|сук[аи]([^а-яё]|$)|муда[кч]|пид[оа]р|залуп|гандон)/i;
var HARM=/(не хочу жить|жить не хочу|жить не хочется|покончить с собой|убить себя|убью себя|суицид|повешусь|повеситься|вскрыть вены|наложить на себя руки)/i;
function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f]+/g,' ');
t=t.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'').replace(/\S+@\S+\.\S+/g,'').replace(/(?:\+?\d[\d\s()-]{5,}\d)/g,'');return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,300);}
function left(){var z=Z(),lim=isSub()?3:1;return z.w===tk()?Math.max(0,lim-z.wn):lim;}
function write(el){var from=CUR.op&&CUR.op.from;if(!(canLt()||F.lt&&from)){list(el);return;}var z=Z(),n=left(),h='<div class="z3m-scr">'+hdr('✍ '+U('write.h','Напиши Зине'),'mail')+'<div class="scroll z3m-body"><div class="z3m-form">';
h+='<p class="z3m-say">'+esc(U('write.say','Пиши как есть. Отвечу утром.'))+'</p>';
if(!n)h+='<p class="z3m-say">'+esc(U('write.left0','Сегодня письмо уже ушло.'))+'</p>';
else h+='<textarea id="z3mTxt" class="z3m-ta" maxlength="300" rows="5" placeholder="'+esc(U('write.ph','Дорогая баба Зина, …'))+'"></textarea>'+
'<div class="z3m-cnt"><small>'+esc(U('write.hint','Телефон и ссылки не пиши.'))+'</small><b id="z3mCnt">0 / 300</b></div>'+
'<label class="z3m-lab">'+esc(U('write.nm','Как подписать письмо'))+'<input id="z3mNm" class="z3m-in" maxlength="20" value="'+esc(z.nm)+'"></label>'+
'<p class="z3m-msg" id="z3mMsg"></p><button type="button" class="btn green" id="z3mSend" disabled>'+esc('Отправить ✉️')+'</button>';
el.innerHTML=h+'</div></div></div>';bindBack(el);var ta=$('z3mTxt'),bs=$('z3mSend');if(!ta)return;
ta.oninput=function(){var k=ta.value.replace(/^\s+|\s+$/g,'').length;$('z3mCnt').textContent=Math.min(ta.value.length,300)+' / 300';bs.disabled=k<2;};
bs.onclick=function(){snd();var raw=ta.value,t=scrub(raw),nm2=scrub($('z3mNm').value).replace(/[^А-Яа-яЁёA-Za-z \-]/g,'').slice(0,20),msg=$('z3mMsg');
if(t.length<2)return;
if(BAD.test(raw)||BAD.test(nm2)){msg.textContent=U('write.bad','Перепиши, а?');ev('lt',{s:'bad',n:t.length});return;}
var z2=Z();if(z2.w!==tk()){z2.w=tk();z2.wn=0;}z2.wn++;z2.n++;if(nm2)z2.nm=nm2;sv();
var mid='m'+Date.now();add({i:mid,k:'my',x:t});upd0();
if(HARM.test(raw)){var H=(D()&&D().harm)||[],r=H.length?H[h32(t)%H.length]:'';ev('lt',{s:'harm',n:t.length});
if(r)add({i:'hm'+Date.now(),k:'harm',x:fill(r,{nm:nm()})});}
else{var Q=queue();Q.push({i:mid,ts:Date.now(),t:t});lsS(MQ,Q.slice(-3));ev('lt',{s:'send',n:t.length,sub:isSub()?1:0});
try{if(window.ZB2MAIL)ZB.load('js/zb2-mail-ui.js').then(function(){if(ZB2MAIL.send)ZB2MAIL.send(t,{f:from||'z3'});},function(){});}catch(e){}}
if(from&&window.ZB2MAIL&&ZB2MAIL._z)try{var o=ZB2MAIL._z();o.n=(+o.n||0)+1;o.d=ZB2MAIL._day();ZB2MAIL._st('send',from);sv();}catch(e){}
el.querySelector('.z3m-form').innerHTML='<p class="z3m-say">'+esc(U('write.sent','Письмо ушло! Ответ — завтра утром.'))+'</p><button type="button" class="btn green" data-go="mail">Хорошо, бабуль!</button>';bindBack(el);};}
function upd0(){refresh();}
function make(el,ki,seed){if(!canCw()){list(el);return;}seed=seed||((Date.now()^h32(Z3.tk()))>>>0);var rows=gen(ki,seed),tries=0;while(!rows&&tries++<20){seed++;rows=gen(ki,seed);}
var h='<div class="z3m-scr">'+hdr('🎁 '+U('cw.h','Кроссворд в подарок'),'mail')+'<div class="scroll z3m-body"><div class="z3m-form">';
h+='<p class="z3m-say">'+esc(U('cw.say','Сделаем кроссворд про мою сестру Галю.'))+'</p><p class="z3m-sm">'+esc(U('cw.who','Кому отправим?'))+'</p><div class="z3m-who">'+
KEYS.map(function(k,i){return'<button type="button" class="z3m-chip'+(i===ki?' on':'')+'" data-k="'+i+'">'+esc(k[1])+'</button>';}).join('')+'</div>';
h+='<div class="z3m-pl"></div><p class="z3m-msg" id="z3mMsg"></p><div class="z3m-acts"><button type="button" class="btn ghost" id="z3mRe">🔄 '+esc(U('cw.redo','Другие слова'))+'</button>'+
'<button type="button" class="btn green" id="z3mGo">'+esc(U('cw.send','Отправить открыткой ✉️'))+'</button></div><p class="z3m-link" id="z3mLink"></p>';
el.innerHTML=h+'</div></div></div>';bindBack(el);if(!rows){$('z3mGo').disabled=true;return;}
play(el.querySelector('.z3m-pl'),ki,rows,function(){},true);ev('cw',{s:'make',k:ki});
[].forEach.call(el.querySelectorAll('.z3m-chip'),function(b){b.onclick=function(){snd();make(el,+b.getAttribute('data-k'));};});
$('z3mRe').onclick=function(){snd();make(el,ki,seed+7919);};
$('z3mGo').onclick=function(){snd();var bt=$('z3mGo');bt.disabled=true;var cw=enc(ki,rows);
Z3.srv.get('code').then(function(r){return r&&r.code||'';},function(){return'';}).then(function(code){share(cw,code,function(ok,why){bt.disabled=false;
var msg=$('z3mMsg');if(ok){var z=Z();z.g++;sv();if(msg)msg.textContent=U('cw.sent','Открытка ушла!');ev('cw',{s:'send',k:ki,g:code?1:0});}
else{if(msg)msg.textContent=U('cw.noshare','Отправить не вышло.');ev('cw',{s:'fail',e:why||''});}});});};}
function share(cw,code,cb){var okp=typeof OK!=='undefined'&&OK,app=(/[?&]vk_app_id=(\d+)/.exec(location.search)||[])[1]||'',tag='#cw='+cw+(code?'&gift='+code:'');
var u=okp?(typeof OK_LINK!=='undefined'?OK_LINK:'')+tag:'https://vk.com/app'+app+tag,txt='Баба Зина сделала кроссворд про сестру Галю. Разгадаешь?';
var real=typeof VK_REAL!=='undefined'&&VK_REAL;
if(!real){var l=$('z3mLink');if(l)l.textContent=u;cb(true,'dev');return;}
SHR.post(txt,{k:'cw',link:u,cb:function(h){if(h==='vk'||h==='copy')cb(true,h==='copy'?'copy':'');else cb(false,h);}});}
function css(){if($('z3mCss'))return;var c=document.createElement('style');c.id='z3mCss';c.textContent=
'.z3m-scr{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--z3-bg);color:var(--z3-ink);font-family:var(--z3-font)}'+
'.z3m-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--z3-line);background:var(--z3-paper)}.z3m-hd h2{margin:0;font:700 19px var(--z3-font-head);flex:1;min-width:0}.z3m-back{min-height:44px;white-space:nowrap}'+
'.z3m-body{flex:1;min-height:0;overflow:auto;padding:12px 14px 24px}.z3m-acts{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.z3m-acts .btn{flex:1 1 160px;min-height:44px;margin:0}'+
'.z3m-list{display:flex;flex-direction:column;gap:8px}.z3m-it{display:flex;align-items:center;gap:10px;text-align:left;width:100%;min-height:56px;padding:8px 12px;border:1px solid var(--z3-line);border-radius:var(--z3-r);background:var(--z3-paper);color:var(--z3-ink);font:inherit;cursor:pointer;box-shadow:var(--z3-shadow)}'+
'.z3m-it.u{border-color:var(--z3-acc);border-width:2px}.z3m-it.u b:after{content:" ●";color:var(--z3-acc)}.z3m-ic{font-size:24px}.z3m-tx{flex:1;min-width:0;display:flex;flex-direction:column}.z3m-tx b{font-size:15.5px}.z3m-tx small{font-size:13.5px;color:var(--z3-ink2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.z3m-dt{font-size:13.5px;color:var(--z3-ink2);white-space:nowrap}'+
'.z3m-empty,.z3m-say{font-size:16px;margin:4px 0 12px}.z3m-sm{font-size:14px;color:var(--z3-ink2);margin:6px 0}'+
'.z3m-wrap{position:relative;flex:1;min-height:0;overflow:hidden}.z3m-desk{position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden}.z3m-desk svg{display:block;width:100%;height:100%}'+
'.z3m-sheet{position:absolute;left:10px;right:10px;top:10px;bottom:10px;overflow:auto;padding:16px 18px;background:var(--z3-paper);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);font-family:var(--z3-font-hand);font-size:17px;line-height:1.45}'+
'.z3m-sheet.z3m-on{right:auto;bottom:auto;padding:14px 18px}.z3m-sheet p{margin:0 0 8px}.z3m-sheet .btn{min-height:44px;margin:6px 0 0}'+
'.z3m-date{font-size:13.5px;color:var(--z3-ink2);text-align:right}.z3m-sig{text-align:right;font-weight:700}.z3m-ps{margin:10px 0 4px;font-style:italic}'+
'.z3m-gin,.z3m-psplay{font-family:var(--z3-font);line-height:1.3}.z3m-gin .z3m-sm{font-size:15px}.z3m-ok{color:var(--z3-ok);font-weight:700}.z3m-rew{font-weight:700}'+
'.z3m-cw{display:flex;flex-direction:column;gap:4px;margin:8px 0;align-items:center}.z3m-row{display:flex;gap:3px;padding:2px;border:2px solid transparent;border-radius:8px;background:none;cursor:pointer;font:inherit;min-height:40px}'+
'.z3m-row.on{border-color:var(--z3-blue)}.z3m-row.bad{border-color:var(--z3-acc)}.z3m-c,.z3m-sp{display:inline-flex;align-items:center;justify-content:center;width:calc(min(34px,(100vw - 90px)/var(--n)));height:calc(min(34px,(100vw - 90px)/var(--n)));font:700 17px var(--z3-font);font-style:normal}'+
'.z3m-c{background:var(--z3-paper);border:1px solid var(--z3-line);color:var(--z3-ink);border-radius:4px}.z3m-c.k{background:var(--z3-acc);color:var(--z3-acc-ink);border-color:var(--z3-acc)}.z3m-row.ok .z3m-c{color:var(--z3-ok)}.z3m-row.ok .z3m-c.k{color:var(--z3-acc-ink)}'+
'.z3m-clue{font-size:15.5px;margin:8px 0;font-family:var(--z3-font)}.z3m-tiles{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0}'+
'.z3m-t{min-width:44px;min-height:44px;border-radius:var(--z3-rb);border:2px solid var(--z3-line);background:var(--z3-paper);color:var(--z3-ink);font:700 19px var(--z3-font);cursor:pointer}.z3m-t:disabled{opacity:.35}.z3m-bk{color:var(--z3-ink2)}'+
'.z3m-form{max-width:560px;margin:0 auto}.z3m-ta{display:block;box-sizing:border-box;width:100%;min-height:120px;max-height:34vh;padding:10px 12px;border-radius:var(--z3-rb);border:2px solid var(--z3-line);font:inherit;font-size:16px;background:var(--z3-paper);color:var(--z3-ink);-webkit-user-select:text;user-select:text}'+
'.z3m-cnt{display:flex;justify-content:space-between;gap:8px;margin:6px 0;font-size:13.5px}.z3m-lab{display:block;font-size:14px;margin:8px 0}.z3m-in{display:block;box-sizing:border-box;width:100%;min-height:44px;margin-top:4px;padding:6px 10px;border-radius:var(--z3-rb);border:2px solid var(--z3-line);font:inherit;font-size:16px;background:var(--z3-paper);color:var(--z3-ink);-webkit-user-select:text;user-select:text}'+
'.z3m-msg{min-height:20px;font-size:15px;color:var(--z3-acc);margin:6px 0}.z3m-who{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 6px}'+
'.z3m-chip{font:inherit;font-size:14.5px;font-weight:700;min-height:44px;padding:6px 14px;border-radius:999px;border:2px solid var(--z3-line);background:var(--z3-paper);color:var(--z3-ink);cursor:pointer}.z3m-chip.on{border-color:var(--z3-blue);background:var(--z3-blue);color:var(--z3-acc-ink)}'+
'.z3m-link{font-size:13.5px;word-break:break-all;color:var(--z3-ink2)}';
(document.head||document.documentElement).appendChild(c);}
M.ui=1;M._={gen:gen,enc:enc,dec:dec,daily:daily,KEYS:KEYS};
})();
