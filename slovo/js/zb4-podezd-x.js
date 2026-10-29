'use strict';
(function(){
if(!window.Z4||!window.Z3||typeof ZB==='undefined'||!Z4.on)return;
if(!Z4.reg('z4d'))return;
var F={gh:Z4.reg('z4d.gh',{t:'Наперегонки с соседкой (призрак игрока / Зины над кроссвордом)',who:'PODEZD'}),
nt:Z4.reg('z4d.nt',{t:'Записка на полях (заготовки, без свободного текста)',who:'PODEZD'}),
okn:Z4.reg('z4d.okn',{t:'Окна подъезда светятся по жильцам дня',who:'PODEZD'}),
cw:Z4.reg('z4d.cw',{t:'Общий кроссворд подъезда (слова недели)',who:'PODEZD'})};
Z4.OPEN['z4d.gh']=4;Z4.OPEN['z4d.okn']=4;Z4.OPEN['z4d.cw']=5;Z4.OPEN['z4d.nt']=6;
function on(k){return F[k]&&Z4.open('z4d.'+k);}
function Z(){return typeof S!=='undefined'&&S&&S.z4d||{};}
function sv(){try{save();}catch(e){}}
function tk(){try{return+todayKey();}catch(e){return 0;}}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function ev(a,o){o=o||{};o.a=a;try{Z4.ev('z4d',o);}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function hsh(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(a){a=a>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function now(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}}
function wkey(){var d=new Date(now()+3*3600e3),x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),w=(x.getUTCDay()+6)%7;x.setUTCDate(x.getUTCDate()-w+3);
var y=x.getUTCFullYear(),f=new Date(Date.UTC(y,0,4));return y*100+1+Math.round(((x-f)/864e5-3+(f.getUTCDay()+6)%7)/7);}
function wfrac(){var d=new Date(now()+3*3600e3),w=(d.getUTCDay()+6)%7;return Math.max(0,Math.min(1,(w+(d.getUTCHours()*60+d.getUTCMinutes())/1440)/7));}
function pw(n){n=Math.abs(n)%100;var a=n%10;return n>10&&n<20?'слов':a===1?'слово':a>1&&a<5?'слова':'слов';}
function $i(id){return document.getElementById(id);}
var DP=null;function data(){if(window.Z4DD)return Promise.resolve();if(!DP)DP=ZB.load('js/zb4-podezd-data.js').then(function(){if(!window.Z4DD)throw new Error('z4d data');},function(e){DP=null;throw e;});return DP;}
function tx(k,c){return Z4.txt(k,c)||'';}
function kvOf(t){return 1+hsh('kv'+t)%60;}
function myKv(){try{var h=Z3.srv.peek('house'),en=h&&h.en||[];for(var i=0;i<en.length;i++)if(en[i].me)return kvOf(en[i].t);}catch(e){}
var u=lsG('z4d-kv',0);if(!u){u=1+Math.floor(Math.random()*60);lsS('z4d-kv',u);}return u;}
function css(){if($i('z4dCss'))return;var s=document.createElement('style');s.id='z4dCss';s.textContent=
'.z4db{display:flex;align-items:center;gap:8px;margin:2px 8px;padding:4px 10px;min-height:28px;border-radius:12px;background:var(--z3-paper,#fff8e6);color:var(--z3-ink,#27324a);font-size:14px;line-height:1.3;box-shadow:var(--z3-shadow)}'+
'.z4db span{flex:1 1 auto;min-width:0}.z4db button{flex:0 0 auto;min-height:44px;min-width:44px;padding:0 10px;font-size:14px}'+
'.z4dn{outline:3px dashed var(--z3-acc,#e0a030);outline-offset:-3px}'+
'.z4d-cd{display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;background:var(--z3-card,#fff);border-radius:var(--z3-rb,16px);box-shadow:var(--z3-shadow);color:var(--z3-ink,#27324a);cursor:pointer}'+
'.z4d-ci{flex:0 0 46px;width:46px;height:46px}.z4d-ct{flex:1 1 auto;min-width:0;display:flex;flex-direction:column}.z4d-ct b{font-size:16px}.z4d-ct small{font-size:14px;color:var(--z3-ink2,#5d6781)}'+
'.z4d-h{font-size:17px;margin:4px 0 8px}.z4d-f{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px;background:var(--z3-h-b2,#c9b79c);border-radius:10px}'+
'.z4d-w{min-height:44px;border:2px solid var(--z3-line,#8a7a64);border-radius:6px;background:#44506a;color:#fff;font-size:13.5px;padding:2px}'+
'.z4d-w.on{background:#ffe08a;color:#27324a}.z4d-w.me{border-color:var(--z3-acc,#e0a030);border-width:3px}'+
'.z4d-say{min-height:40px;margin:8px 0;font-size:15px}.z4d-cw{max-height:42vh;overflow:auto;font-size:14px;border-top:1px solid var(--z3-line,#ddd);margin-top:6px}'+
'.z4d-r{display:flex;gap:8px;padding:5px 2px;border-bottom:1px solid var(--z3-line,#eee)}.z4d-r b{flex:0 0 auto;letter-spacing:2px;min-width:7em}.z4d-r small{color:var(--z3-ink2,#5d6781)}'+
'.z4d-nb{display:block;width:100%;min-height:44px;margin:4px 0;font-size:15px}';
document.head.appendChild(s);}
var L={g:null};
ZB.add(ZB.levelSlots,{id:'z4d',order:4,zone:'top',render:function(){return Z4.on?'<div id="z4dBar" class="z4db" style="display:none"></div>':'';}});
function bar(html){var e=$i('z4dBar');if(!e)return null;css();if(html==null){e.style.display='none';e.innerHTML='';return e;}e.innerHTML=html;e.style.display='';return e;}
function elapsed(g){return Math.max(0,(Date.now()-(g.t0||Date.now()))/1000);}
function freshG(){return typeof G!=='undefined'&&G&&G===L.g&&!G.won;}
function ghZina(g){var n=g.words.length,r=rng(hsh('ghz'+g.idx)),T=[],t=6,i;
var ord=[];for(i=0;i<n;i++)ord.push(i);for(i=n-1;i>0;i--){var j=Math.floor(r()*(i+1)),q=ord[i];ord[i]=ord[j];ord[j]=q;}
for(i=0;i<n;i++){t+=7+r()*(8+g.words[ord[i]].w.length*1.5);T.push([ord[i],Math.round(t)]);}
return{who:'Зина',zina:1,t:T,s:Math.round(t)};}
Z4.onStart(function(i){L={g:i.G,trk:[],last:0,asked:0,seen:0,cwW:'',res:null,gh:null,notes:null,mark:null};bar(null);
if(i.daily||i.mode||i.mix||i.idx!==+S.lv)return;var lv=i.lv,g=i.G,R=isOK()?4:3;
var wantGh=on('gh')&&lv>=10&&(hsh('gh'+i.idx)%R===0&&(!Z4.fx||Z4.fx('z4d',g))||/[?&]z4dgh=1(&|$)/.test(location.search)),wantNt=on('nt')&&lv>=30;
if(!wantGh&&!wantNt)return;
data().then(function(){if(!freshG()||L.g!==g)return;
var go=function(r){if(L.g!==g)return;r=r||{};
if(wantNt)L.notes=r.n&&typeof r.n==='object'?r.n:{};
if(wantGh){var x=r.g;if(x&&x.t&&x.t.length>=2&&+x.s>0){var T=[];x.t.forEach(function(e){if(e&&+e[0]>=0&&+e[0]<g.words.length)T.push([+e[0],+e[1]||0]);});
T.sort(function(a,b){return a[1]-b[1];});L.gh={who:x.nm?String(x.nm).slice(0,20):'соседка из кв. '+(+x.k||kvOf(x.nm||'x')),t:T,s:+x.s,real:1};}
if(!L.gh)L.gh=ghZina(g);}
tick();};
if(lv>=30)Z4.srv.get('d4_lv',{lv:lv}).then(go,function(){go({});});else go({});},function(){});});
var TT=0;function tick(){clearTimeout(TT);if(!freshG())return;var g=L.g,el=elapsed(g),last=L.last||0;
if(L.ask&&Date.now()<L.ask){TT=setTimeout(tick,1000);return;}if(L.ask){L.ask=0;}
var idle=isOK()?60:45;
if(on('nt')&&L.notes&&!L.seen&&el-last>=idle&&el>=idle)seeNote(g);
if(L.gh&&!L.ntOn){var gh=L.gh,c=0,mine=g.words.filter(function(w){return w.found;}).length,n=g.words.length;
gh.t.forEach(function(e){if(e[1]<=el)c++;});c=Math.min(c,n);
var s=c>=n?esc(gh.who)+': всё, за '+gh.s+' с. Догоняй без спешки':esc(gh.who)+': '+c+' из '+n+' · у тебя '+mine;
bar('<span>🏃 '+s+'</span>');}
TT=setTimeout(tick,1000);}
function seeNote(g){L.seen=1;var best=null,k,N=Z4T['z4d.notes']||[];
for(k in L.notes){var i=+k,w=g.words[i],c=L.notes[k];if(!w||w.found||!(c instanceof Array))continue;var m=0,p=-1;
c.forEach(function(v,j){if(+v>m&&N[j]){m=+v;p=j;}});if(p>=0&&(!best||m>best.m))best={i:i,p:p,m:m};}
var z=Z(),t='',kind='';
if(best){t=tx('z4d.ntSee',{n:g.words[best.i].w.length,p:N[best.p]});kind='s';mark(g,best.i);}
else if(z.ng!==tk()){var un=g.words.filter(function(w){return!w.found;}).sort(function(a,b){return b.w.length-a.w.length;})[0];
if(un){z.ng=tk();sv();t=tx('z4d.ntGalya')+' Слово из '+un.w.length+' букв, на «'+un.w.charAt(0).toUpperCase()+'».';kind='g';mark(g,g.words.indexOf(un));}}
if(!t)return;ev('nts',{k:kind});L.ntOn=1;bar('<span>📝 '+esc(t)+'</span><button type="button" class="btn noenter" data-x="1" aria-label="Закрыть">✕</button>');
var e=$i('z4dBar'),b=e&&e.querySelector('[data-x]'),off=function(){L.ntOn=0;unmark();bar(null);};if(b)b.onclick=off;setTimeout(function(){if(L.g===g&&L.ntOn)off();},12000);}
function mark(g,i){try{var w=g.words[i],c=g.cells.get(cellKey(w.x,w.y));if(c&&c.el){c.el.classList.add('z4dn');L.mark=c.el;}}catch(e){}}
function unmark(){try{if(L.mark)L.mark.classList.remove('z4dn');}catch(e){}L.mark=null;}
Z4.onWord(function(o){if(o.G!==L.g)return;var g=o.G,el=Math.round(elapsed(g)),w=String(o.w||'');
if(L.ntOn){L.ntOn=0;unmark();bar(null);}
cwWord(w);
if(o.bonus)return;var i=-1;for(var k=0;k<g.words.length;k++)if(g.words[k].w===w){i=k;break;}
var gap=el-(L.last||0);L.last=el;if(i<0)return;if(L.trk.length<30)L.trk.push([i,el]);
if(on('nt')&&L.notes&&!L.asked&&!o.byHint&&w.length>=5&&gap>=40&&o.left>0&&(Z().d===tk()?Z().nt|0:0)<3&&+o.lv>=30)askNote(g,i,o.lv);});
function askNote(g,i,lv){L.asked=1;L.ask=Date.now()+10000;
bar('<span>✍ '+esc(tx('z4d.ntAsk'))+'</span><button type="button" class="btn noenter" data-n="1">Записка</button><button type="button" class="btn noenter" data-x="1" aria-label="Не надо">✕</button>');
var e=$i('z4dBar');if(!e)return;e.querySelector('[data-x]').onclick=function(){L.ask=0;bar(null);tick();};
e.querySelector('[data-n]').onclick=function(){L.ask=0;bar(null);var N=Z4T['z4d.notes']||[],w=g.words[i].w;
modal('<div class="z4d-h"><b>Записка на полях</b><br><small>к слову из '+w.length+' букв — выбери, что подсказать</small></div>'+
N.map(function(t,j){return'<button type="button" class="btn noenter z4d-nb" data-p="'+j+'">'+esc(t)+'</button>';}).join('')+
'<button type="button" class="btn noenter z4d-nb" data-p="-1">Не надо</button>');
[].forEach.call($i('mcard').querySelectorAll('[data-p]'),function(b){b.onclick=function(){var p=+b.getAttribute('data-p');hideModal();
if(p>=0){var z=Z();if(z.d!==tk()){z.d=tk();z.nt=0;}z.nt=(z.nt|0)+1;sv();Z4.srv.send('d4_nt',{lv:lv,i:i,p:p});ev('nt',{p:p});
try{toast(tx('z4d.ntThanks'),3500);}catch(e){}}tick();};});};}
Z4.onWin(function(i){var g=i.G;if(!g)return;var z=Z();clearTimeout(TT);unmark();
if(L.g===g&&L.gh&&!i.daily){var s=+i.sec||Math.round(elapsed(g)),d=Math.round(L.gh.s-s);L.res={w:d>=0,n:Math.max(1,Math.abs(d)),who:L.gh.who,zina:L.gh.zina};
if(L.res.w)z.gw=(z.gw|0)+1;else z.gl=(z.gl|0)+1;ev('gh',{r:L.res.w?'w':'l',z:L.gh.zina?1:0,n:L.res.n});}
if(L.g===g&&!i.daily&&!i.mode&&!i.mix&&i.lv>=30&&L.trk.length>=2&&(z.gr|0)!==i.lv&&i.first){
z.gr=i.lv;Z4.srv.send('d4_gh',{lv:i.lv,t:L.trk.slice(0,30),s:Math.max(5,Math.min(3600,+i.sec||5)),k:myKv()});ev('ghs');}
var n=Math.min(60,(+i.words||0)+(+i.bonus||0));if(on('okn')&&n>0){var w=lsG('z4d-wd',null);if(!w||w.d!==tk())w={d:tk(),n:0};w.n+=n;lsS('z4d-wd',w);Z4.srv.send('d4_wd',{n:n});}
sv();});
Z4.winLine.add({id:'z4d',order:55,txt:function(info){if(info.G!==L.g)return'';var r=L.res;
if(r&&on('gh'))return tx(r.zina?(r.w?'z4d.ghZinaWin':'z4d.ghZinaLose'):(r.w?'z4d.ghWin':'z4d.ghLose'),{who:r.who,n:r.n});
if(L.cwDone&&on('cw'))return tx('z4d.cwDone');
if(L.cwW&&on('cw'))return tx('z4d.cwLine',{w:L.cwW.toUpperCase()});return'';}});
function norm(w){return String(w||'').toLowerCase().replace(/ё/g,'е');}
var CW=null;function cwList(){var wk=wkey();if(CW&&CW.wk===wk)return CW;if(!window.Z4DD)return null;var P=Z4DD.pool.slice(),r=rng(hsh('cw'+wk)),i;
for(i=P.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),q=P[i];P[i]=P[j];P[j]=q;}P=P.slice(0,40);
var hero=['Галя','Толик','Валентина Петровна','Ять'],H={},k=Math.floor(wfrac()*14);for(i=0;i<k;i++)H[norm(P[i][0])]=hero[hsh(P[i][0]+wk)%hero.length];
CW={wk:wk,L:P,ix:{},hero:H};P.forEach(function(e,j){CW.ix[norm(e[0])]=j;});return CW;}
function cwMine(){var m=lsG('z4d-cw',null),wk=wkey();if(!m||m.wk!==wk||!(m.w instanceof Array))m={wk:wk,w:[]};return m;}
function cwWord(w){if(!on('cw'))return;var c=cwList();if(!c){data().then(function(){cwWord(w);},function(){});return;}var k=norm(w);if(c.ix[k]==null)return;
var m=cwMine();if(m.w.indexOf(k)>=0)return;m.w.push(k);lsS('z4d-cw',m);var z=Z();z.cwk=m.wk;z.cwn=m.w.length;sv();
Z4.srv.send('d4_cw',{w:k});ev('cw',{n:m.w.length});if(L.g)L.cwW=w;if(cwOpen(null).n>=40)L.cwDone=1;}
var HM=null,HO=null,HT=0;
function cwOpen(hm){var c=cwList();if(!c)return{n:0,o:{}};var m=cwMine(),o={},n=0,sc=hm&&hm.c&&hm.wk===c.wk?hm.c:{};
c.L.forEach(function(e){var k=norm(e[0]),v=m.w.indexOf(k)>=0?'твоё':+sc[k]>0||+sc[e[0]]>0?'соседи ×'+(+sc[k]||+sc[e[0]]):c.hero[k]||'';if(v){o[k]=v;n++;}});return{n:n,o:o};}
var LP=null;function load(force){if(LP)return LP;if(!force&&Date.now()-HT<180000)return Promise.resolve();HT=Date.now();
return LP=Promise.all([data(),Z3.srv.get('house').then(null,function(){return{};}),Z4.srv.get('d4_hm',{}).then(null,function(){return{};})])
.then(function(r){HO=r[1]||{};HM=r[2]||{};},function(){}).then(function(){LP=null;});}
function people(){var en=(HO&&HO.en||[]).slice(),w=HM&&!HM._sim&&!HM._off&&HM.w||{},my=lsG('z4d-wd',null),out=[];
if(HO&&HO._sim)en=en.filter(function(x){return!(x.b&&/ \(\d+\)$/.test(x.n||''));});
en.slice(0,16).forEach(function(x){var nm=x.me?'Ты':x.b?String(x.n||'Соседка'):(x.n?String(x.n).slice(0,20):'Жилец кв. '+kvOf(x.t)),
wd=x.me?(my&&my.d===tk()?my.n:0):+w[String(x.t)]||0;out.push({nm:nm,me:!!x.me,b:!!x.b,on:!!(x.a||wd>0||(x.me&&wd>0)),wd:wd});});
if(!out.some(function(p){return p.me;})){var wd=my&&my.d===tk()?my.n:0;out.unshift({nm:'Ты',me:true,on:wd>0,wd:wd});}
return out;}
function facade(P){var s='<svg class="z4d-ci" viewBox="0 0 46 46" aria-hidden="true"><rect x="5" y="4" width="36" height="40" rx="2" fill="var(--z3-h-b2,#c9b79c)"/>';
for(var i=0;i<12;i++){var p=P[i];s+='<rect x="'+(9+(i%3)*10)+'" y="'+(8+Math.floor(i/3)*9)+'" width="7" height="6" fill="'+(p&&p.on?'#ffd75a':'#44506a')+'"/>';}return s+'</svg>';}
Z4.card.add({id:'z4d',order:50,show:function(){return(on('okn')||on('cw'))&&+S.lv>=10;},
html:function(){css();if(!HO){if(!LP)load().then(function(){if(HO)try{if(ZB.refresh)ZB.refresh();}catch(e){}});return'';}
var P=people(),lit=P.filter(function(p){return p.on;}).length,c=on('cw')?cwOpen(HM):null;
return'<div class="z4d-cd" role="button" tabindex="0" data-z4d="1">'+facade(P)+'<div class="z4d-ct"><b>Подъезд №'+(+(HO&&HO.e)||1)+': '+(on('okn')?'светится окон — '+lit:'доска у подъезда')+'</b>'+
(c?'<small>Кроссворд у подъезда: '+c.n+' из 40</small>':'<small>Загляни в окна</small>')+'</div></div>';},
mount:function(el){var b=el&&el.querySelector('[data-z4d]');if(b)b.onclick=function(){board();};load();}});
function board(){css();ev('brd');load(true).then(function(){var P=on('okn')?people():[],c=on('cw')?cwList():null,o=c?cwOpen(HM):null,h='';
if(P.length){h+='<div class="z4d-h"><b>Окна подъезда</b> <small>— сегодня</small></div><div class="z4d-f">'+P.map(function(p,j){
return'<button type="button" class="z4d-w noenter'+(p.on?' on':'')+(p.me?' me':'')+'" data-w="'+j+'">'+esc(p.me?'ты':p.nm.split(' ')[0])+'</button>';}).join('')+'</div><div class="z4d-say" id="z4dSay">Нажми на окно.</div>';}
if(c){h+='<div class="z4d-h"><b>Кроссворд у подъезда</b> <small>— '+o.n+' из 40, неделя</small></div>'+(o.n>=40?'<div class="z4d-say">'+esc(tx('z4d.cwDone'))+'</div>':'')+
'<div class="z4d-cw">'+c.L.map(function(e){var k=norm(e[0]),v=o.o[k];return'<div class="z4d-r"><b>'+(v?esc(e[0].toUpperCase()):e[0].split('').map(function(){return'_';}).join(' '))+'</b><span>'+esc(e[1])+(v?' <small>· '+esc(v)+'</small>':'')+'</span></div>';}).join('')+'</div>';}
h+='<button type="button" class="btn noenter z4d-nb" id="z4dX">Закрыть</button>';modal(h);
$i('z4dX').onclick=function(){hideModal();};
[].forEach.call($i('mcard').querySelectorAll('[data-w]'),function(b){b.onclick=function(){var p=P[+b.getAttribute('data-w')],s;
if(p.me)s=tx('z4d.myWin')+(p.wd?' Сегодня — '+p.wd+' '+pw(p.wd)+'.':'');
else if(p.wd>0)s=p.nm+': '+p.wd+' '+pw(p.wd)+' сегодня';else s=p.nm+': '+(p.on?'сегодня заходила':'сегодня ещё не заходила');
var e=$i('z4dSay');if(e)e.textContent=s;ev('okn',{m:p.me?1:0});};});},function(){});}
Z4.pod={board:board,L:function(){return L;},cw:function(){return cwList();},open:function(){return cwOpen(HM);},cwWord:cwWord,see:function(n){if(n)L.notes=n;L.seen=0;seeNote(L.g);}};
})();
