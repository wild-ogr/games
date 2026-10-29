(function(){'use strict';if(typeof R3!=='object'||!R3.on)return;if(!R3.reg('joke',{s:'R3-JOKE',t:'банк учится: 😂/😐 под шутками, Байка недели по воскресеньям, свежий банк с сервера'}))return;if(typeof R3T!=='object'||!R3T||!R3T.pick)return;var W=window,$=function(id){return document.getElementById(id);};function err(e){try{console.warn('r3 joke',e&&e.message||e);}catch(x){}}
function lsg(k){try{return W.localStorage.getItem(k);}catch(e){return null;}}
function lss(k,v){try{if(v===null)W.localStorage.removeItem(k);else W.localStorage.setItem(k,v);}catch(e){}}
function jp(s){try{return s?JSON.parse(s):null;}catch(e){return null;}}
function num(v){v=+v;return isFinite(v)?v:0;}
function esc_(s){try{return esc(s);}catch(e){return String(s).replace(/[&<>"]/g,'');}}
function ev(a,o){try{R3.ev(a,o);}catch(e){}}
function qp(k){try{var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):null;}catch(e){return null;}}
function offB(){return R3.off('joke.btn');}
function offW(){return R3.off('joke.week');}
function offF(){return R3.off('joke.fresh');}
function dk(){try{if(W.__r3jDk)return W.__r3jDk;return dayNum();}catch(e){return Math.floor(Date.now()/864e5);}}
function hour(){try{if(W.__r3jH!=null)return W.__r3jH;return new Date(nowMs()).getHours();}catch(e){return new Date().getHours();}}
function wkOf(d){return Math.floor((d+3)/7);}
function isSun(d){return((d%7)+7)%7===3;}
function hh(s){var h=5381;s=String(s);for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return('0000'+(h>>>0).toString(36)).slice(-5);}
function norm(t){return String(t||'').replace(/[«»"„“”]/g,'').replace(/\s+/g,' ').trim();}
function ses(){try{return+S.sessions||0;}catch(e){return 0;}}
var LSK='r3j',st=jp(lsg(LSK));if(!st||typeof st!=='object')st={};if(!st.r||typeof st.r!=='object')st.r={};if(!Array.isArray(st.ro))st.ro=[];function save(){if(st.ro.length>400){var d=st.ro.splice(0,st.ro.length-400);for(var i=0;i<d.length;i++)delete st.r[d[i]];}lss(LSK,JSON.stringify(st));}
function rated(id){return st.r.hasOwnProperty(id)?st.r[id]:null;}
var SKIP=/^(hunt\.[zdtwpb]\.|hunt\.intro|mail\.safe|ref\.|ntf\.|first\.|nbr\.|puz\.|rid\.|art\.|sez\.|order\.|wkr\.|wk\.|fly\.hint|boat\.troll\.hint|shd\.)/;var recent=[];function data(){return W.R3T_DATA||W.R3T_DATA0||null;}
function rawOf(key,i){try{var D=data();return D&&D.k[key]?D.k[key][i]:null;}catch(e){return null;}}
function idOf(key,i){var r=rawOf(key,i);return key+'#'+(r==null?'i'+i:hh(r));}
function okKey(k){return!!k&&!SKIP.test(k)&&!/\.n$/.test(k);}
function note(t,id,sc){if(!t)return;recent.push({t:norm(t),id:id,at:Date.now(),sc:sc?1:0});if(recent.length>30)recent.shift();}
var P0=R3T.pick,S0=R3T.scene;function pick(key,c){var t=P0.call(R3T,key,c);try{if(t!=null&&R3T.last&&R3T.last.key===key){var id=idOf(key,R3T.last.i);if(rated(id)===0&&!offB()){var t2=P0.call(R3T,key,c);if(t2!=null&&R3T.last){var id2=idOf(key,R3T.last.i);if(rated(id2)!==0){t=t2;id=id2;}}}
if(okKey(key))note(t,id,0);}}catch(e){err(e);}
return t;}
R3T.pick=pick;R3T.any=function(keys,c){for(var i=0;i<(keys||[]).length;i++){var t=pick(keys[i],c);if(t!=null)return t;}return null;};R3T.scene=function(id,c){var r=S0.call(R3T,id,c);try{if(r&&r.length){var D=data(),raw=D&&D.sc&&D.sc[id];var sid=id+'#'+hh(JSON.stringify(raw||r));R3T.last={key:id,i:0,id:sid};note(r[r.length-1][1],sid,1);}}catch(e){err(e);}
return r;};var shown=[];function flushShown(){if(!shown.length)return;var l=shown.join(',');while(l.length>400){shown.shift();l=shown.join(',');}ev('jkv',{l:l,n:shown.length});shown=[];}
function markShown(id){shown.push(id);if(shown.length>=8)flushShown();}
try{R3.sub('leave',function(){flushShown();save();},'joke');}catch(e){}
function calmPhase(){try{if(!G)return true;var p=G.phase;return p==='aim'||p==='wait'||p==='card'||p==='done'||p==='miss'||p==='lost';}catch(e){return true;}}
function allowed(id,s){if(offB()||rated(id)!==null)return false;if(s!=='w'){if(ses()<3)return false;if(!calmPhase())return false;var now=Date.now(),d=dk();if(st.dd!==d){st.dd=d;st.dc=0;}if(st.dc>=12)return false;if(now-num(st.lt)<90000)return false;}
return true;}
function spent(s){if(s==='w')return;st.lt=Date.now();st.dc=num(st.dc)+1;save();}
var THX={1:['Записал: смешно. Петрович загордился.','Записал. Петрович расскажет это Куму.'],0:['Записал. Петрович придумает смешнее.','Понял. Эту Петрович больше не рассказывает.']};function rowHtml(id,s){return'<div class="r3jk" data-id="'+esc_(id)+'" data-s="'+s+'"><span class="r3jk-q">Смешно?</span>'
+'<button class="r3jk-b noenter" type="button" data-v="1" aria-label="Смешно">😂</button><button class="r3jk-b noenter" type="button" data-v="0" aria-label="Не смешно">😐</button></div>';}
function rate(id,v,s){if(rated(id)!==null)return false;st.r[id]=v?1:0;st.ro.push(id);save();ev('joke',{id:String(id).slice(0,48),v:v?1:0,s:s});try{R3.emit('joke:rate',id,v?1:0);}catch(e){}return true;}
function wire(row){if(!row||row.__w)return;row.__w=1;var id=row.getAttribute('data-id'),s=row.getAttribute('data-s')||'m';var stop=function(e){try{e.stopPropagation();}catch(x){}};['pointerdown','touchstart','mousedown'].forEach(function(n){try{row.addEventListener(n,stop,{passive:true});}catch(e){}});var bs=row.querySelectorAll('.r3jk-b');for(var i=0;i<bs.length;i++)bs[i].onclick=function(e){stop(e);try{tap();}catch(x){}var v=+this.getAttribute('data-v');if(!rate(id,v,s))return;var a=THX[v?1:0];row.classList.add('done');row.innerHTML='<span class="r3jk-t">'+(v?'😂 ':'😐 ')+esc_(a[Math.floor(Math.random()*a.length)])+'</span>';if(s==='s'){try{R3.emit('joke:rated',row);}catch(x){}if(!W.__r3uxSay)setTimeout(function(){try{row.parentNode&&row.parentNode.removeChild(row);}catch(x){}},1600);}};}
function modalUp(){try{return $('modal').classList.contains('on');}catch(e){return false;}}
function findRecent(text){var now=Date.now(),t=norm(text);for(var i=recent.length-1;i>=0;i--){var r=recent[i];if(now-r.at>20*60000||r.t.length<8)continue;if(t.indexOf(r.t)>=0)return r;}return null;}
function attachModal(){try{if(offB()||!modalUp())return;var mc=$('mcard');if(!mc||mc.querySelector('.r3jk')||mc.querySelector('[data-r3jno]'))return;var r=findRecent(mc.textContent);if(!r||!allowed(r.id,'m'))return;var els=mc.querySelectorAll('p,div,li,span'),host=null;for(var i=0;i<els.length;i++){var e=els[i];if(e.closest&&e.closest('.r3jk'))continue;if(norm(e.textContent).indexOf(r.t)>=0)host=e;}
if(!host)return;while(host!==mc&&host.parentNode&&host.parentNode!==mc&&/^(SPAN|B|I|SMALL|EM)$/.test(host.tagName))host=host.parentNode;if(host.parentNode&&host.parentNode.className&&/r3dd-l/.test(host.parentNode.className))host=host.parentNode;var d=document.createElement('div');d.innerHTML=rowHtml(r.id,'m');var row=d.firstChild;if(host===mc)mc.appendChild(row);else host.parentNode.insertBefore(row,host.nextSibling);wire(row);spent('m');markShown(r.id);}catch(e){err(e);}}
var mt=0;function mObs(){clearTimeout(mt);mt=setTimeout(attachModal,160);}
try{var mc0=$('mcard');if(mc0&&W.MutationObserver)new MutationObserver(mObs).observe(mc0,{childList:true,subtree:true});}catch(e){err(e);}
var chip=null,chipT=0;function dropChip(){clearTimeout(chipT);if(chip&&(W.__r3uxSay||!chip.classList.contains('done'))){var c=chip;chip=null;c.classList.add('out');setTimeout(function(){try{c.parentNode&&c.parentNode.removeChild(c);}catch(x){}},300);}}
function attachSay(){try{var e=$('say');if(!e)return;if(!e.classList.contains('on')){if(chip){if(W.__r3uxSay)dropChip();else chipT=setTimeout(dropChip,1800);}return;}
if(chip&&W.__r3uxSay&&chip.__t&&norm(e.textContent)!==chip.__t)dropChip();if(offB()||!G||G.over||G.r3jk||modalUp())return;var who='';try{who=sayWho;}catch(x){}if(who!=='petr')return;var r=findRecent(e.textContent);if(!r||!allowed(r.id,'s'))return;dropChip();var d=document.createElement('div');d.innerHTML=rowHtml(r.id,'s');chip=d.firstChild;chip.classList.add('r3jkS');e.parentNode.appendChild(chip);chip.style.left=Math.max(4,e.offsetLeft)+'px';chip.style.top=(e.offsetTop+e.offsetHeight+12)+'px';wire(chip);G.r3jk=1;spent('s');markShown(r.id);chip.__t=norm(e.textContent);try{R3.emit('joke:chip',chip,e);}catch(x){}}catch(x){err(x);}}
function sObs(){clearTimeout(chipT);setTimeout(attachSay,60);}
try{var se=$('say');if(se&&W.MutationObserver)new MutationObserver(sObs).observe(se,{childList:true,attributes:true,attributeFilter:['class']});}catch(e){err(e);}
try{R3.sub('run',function(){dropChip();},'joke');R3.sub('end',function(){dropChip();},'joke');}catch(e){}
try{setInterval(function(){if(chip&&!calmPhase())dropChip();},400);}catch(e){}
var WK='r3j-wk';function wkGet(){var w=jp(lsg(WK)),c=wkOf(dk());if(!w||typeof w!=='object'||w.w!==c)w={w:c,n:0,dawn:0,late:0,rain:0,ice:0,lost:0,vo:0,junk:0,zoo:0,leg:0,ds:[],bf:null};return w;}
function wkSave(w){lss(WK,JSON.stringify(w));}
try{R3.sub('end',function(g,s){try{if(!g||g.tourn||g.guest||g.cup||g.lg)return;var w=wkGet(),h=hour(),d=dk(),sp={};w.n++;if(h>=3&&h<7)w.dawn++;if(h>=22||h<3)w.late++;try{if(g.cond&&g.cond.wx==='rain')w.rain++;}catch(x){}try{if(W.RSEZ&&RSEZ.ice&&RSEZ.ice(g.pi))w.ice++;}catch(x){}
(g.catch||[]).forEach(function(c){if(!c)return;if(c.lost)w.lost++;else if(c.junk)w.junk++;else if(c.id){sp[c.id]=1;if(num(c.w)>=3)w.vo++;if(!w.bf||num(c.w)>w.bf[1])w.bf=[c.id,Math.round(num(c.w)*1000)/1000];}});var n=Object.keys(sp).length;if(n>w.zoo)w.zoo=n;w.leg+=num(s&&s.leg);if(w.ds.indexOf(d)<0){w.ds.push(d);w.ds=w.ds.slice(-7);}
wkSave(w);st.ed=d;save();}catch(e){err(e);}},'joke');}catch(e){}
var TITLES=[['legends',function(w){return w.leg>=1?w.leg:0;}],['week',function(w){return w.ds.length>=7?7:0;}],['zoo',function(w){return w.zoo>=5?w.zoo:0;}],['vo',function(w){return w.vo>=3?w.vo:0;}],['dawn',function(w){return w.dawn>=3?w.dawn:0;}],['late',function(w){return w.late>=3?w.late:0;}],['rain',function(w){return w.rain>=3?w.rain:0;}],['ice',function(w){return w.ice>=3?w.ice:0;}],['kind',function(w){return w.lost>=5?w.lost:0;}],['junk',function(w){return w.junk>=2?w.junk:0;}],['five',function(w){return w.n>=20?w.n:0;}]];function titles(w){var r=[];for(var i=0;i<TITLES.length&&r.length<3;i++){var n=TITLES[i][1](w);if(!n)continue;var id=TITLES[i][0];var nm=P0.call(R3T,'rank.'+id+'.n',{}),cap=P0.call(R3T,'wkr.'+id,{n:n});if(nm&&cap)r.push([id,nm,cap]);}return r;}
function brehWeek(w){try{if(!W.R3BREH||R3.off('breh')||!S.r3bh||typeof S.r3bh!=='object')return null;var j=S.r3bh,d0=w.w*7-3,best=null;(j.tp||[]).forEach(function(x){if(x&&x[5]>=d0&&x[5]<=d0+6&&(!best||x[3]>best[3]))best=x;});return{rank:R3BREH.rank?R3BREH.rank(num(j.sl)):'',sl:num(j.sl),best:best};}catch(e){return null;}}
function wkScene(wid){var L=[];try{L=R3T.scenes('scene.wk.');}catch(e){}if(!L.length)try{L=R3T.scenes('scene.');}catch(e){}
L.sort();for(var i=0;i<L.length;i++){var id=L[(wid+i)%L.length],sc=R3T.scene(id,{});if(sc)return{id:id,sc:sc,sid:(R3T.last&&R3T.last.id)||id};}return null;}
var WHO={p:'Петрович',w:'Моя (по телефону)',k:'Кум',m:'Дед Митяй',c:'',z:'Жора',v:'Тётя Валя',h:'Михалыч',s:'Баба Шура',t:'Тётя Валя',n:'Зина'};function fnm(id){try{var f=FISH[id]||LEG[id];return f?(LANG==='en'&&f.en?f.en:f.n):id;}catch(e){return id;}}
function openWeek(src){if(offW())return false;var w=wkGet(),sc=wkScene(w.w);if(!sc){try{R3T.ready(function(){openWeek(src);});}catch(e){}return false;}
var intro=pick('wk.intro',{})||'Воскресенье — время байки недели.';var h='<div class="r3jw" data-r3jno="1"><h2>📜 Байка недели</h2><p class="r3jw-i"><b>Петрович</b>'+esc_(intro)+'</p><div class="r3jw-sc">';sc.sc.forEach(function(l){var who=l[0];h+=who==='c'?'<div class="r3jw-l r3jw-c"><i>'+esc_(l[1])+'</i></div>':'<div class="r3jw-l r3jw-'+who+'"><b>'+esc_(WHO[who]||'')+'</b><span>'+esc_(l[1])+'</span></div>';});h+='</div>'+(allowed(sc.sid,'w')?rowHtml(sc.sid,'w'):'');var T=titles(w);h+='<div class="r3jw-sec">🏅 Звания недели</div>';if(T.length)T.forEach(function(t){h+='<div class="r3jw-t"><b>'+esc_(t[1])+'</b><span>'+esc_(t[2])+'</span></div>';});else h+='<p class="r3jw-n">'+esc_(pick('wk.none',{})||'Званий на этой неделе нет.')+'</p>';if(w.bf){var bt=pick('wk.best',{fish:w.bf[0],w:w.bf[1]});if(bt)h+='<p class="r3jw-n">🐟 '+esc_(bt)+'</p>';}
var B=brehWeek(w);if(B){h+='<div class="r3jw-sec">🤥 Доска брехунов</div><p class="r3jw-n">Ты: «'+esc_(B.rank)+'» · слава '+B.sl+'</p>';if(B.best){var bb=pick('wk.breh',{fish:B.best[1],w:B.best[2]/1000,w2:B.best[3]/1000});if(bb)h+='<p class="r3jw-n">'+esc_(bb)+'</p>';}}
h+='<div class="row">'+(B&&R3BREH.openBoard?'<button class="btn noenter" id="r3jwBd">🤥 Доска брехунов</button>':'')+'<button class="btn green noenter" id="r3jwOk">Хорошо посидели</button></div></div>';try{modal(h);}catch(e){err(e);return false;}
var row=document.querySelector('#mcard .r3jk');if(row){wire(row);markShown(sc.sid);}
$('r3jwOk').onclick=function(){try{tap();}catch(x){}hideModal();};if($('r3jwBd'))$('r3jwBd').onclick=function(){try{tap();}catch(x){}var pi=0;try{pi=B.best?B.best[0]:+S.pi||0;}catch(x){}R3BREH.openBoard(pi);};try{if(W.LOOK&&LOOK.walk)LOOK.walk($('mcard'));}catch(e){}
if(src!=='test'){st.ws=w.w;save();}
ev('wkb',{w:w.w%1000,sc:sc.id.replace('scene.','').slice(0,14),t:T.map(function(t){return t[0];}).join(',').slice(0,30),n:w.n,b:B?1:0,src:src||''});return true;}
function weekDue(){var d=dk();if(offW())return false;if(qp('r3jwk')==='1')return st.ws!==wkOf(d);try{if(R3.day()<3)return false;}catch(e){}return isSun(d)&&st.ed===d&&st.ws!==wkOf(d);}
function busy(){try{return!!(modalOn||G||(W.MG&&MG.on));}catch(e){return false;}}
function onHome(){try{var m=$('r3m');return!!(m&&m.style.display!=='none'&&$('scr-map').classList.contains('on'));}catch(e){return false;}}
var wTry=0;function tryWeek(){if(!weekDue())return;var t0=Date.now();clearTimeout(wTry);(function tick(){if(!weekDue())return;if(!busy()&&onHome()){openWeek('auto');return;}if(Date.now()-t0<9e4)wTry=setTimeout(tick,900);})();}
try{R3.sub('home',function(){setTimeout(tryWeek,1200);},'joke');}catch(e){}
var FK='r3t-fresh',FT='r3t-freshT',FR_H=6*3600e3;var SURL=(function(){var p=qp('r3srv'),loc=false;try{loc=IS_LOCAL;}catch(e){loc=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);}
if(loc)return p&&/^\d+$/.test(p)?'http://127.0.0.1:'+p+'/':'';try{return typeof CUP_URL==='string'?CUP_URL:'';}catch(e){return'';}})();try{if(W.__demo)SURL='';}catch(e){}
var KEY_RE=/^[a-z0-9_]{1,24}(\.[a-z0-9_]{1,24}){0,5}$/,HS_RE=/^[0-9a-z]{5}$/,BAD_T=/[<>]/;function okT(t){return typeof t==='string'&&t.length>=2&&t.length<=300&&!BAD_T.test(t);}
function valid(p){try{if(!p||typeof p!=='object'||typeof p.v!=='number'||!(p.v>0)||p.v!==Math.floor(p.v))return false;var n=0,k,i;if(p.k!=null){if(typeof p.k!=='object'||Array.isArray(p.k))return false;for(k in p.k){if(!KEY_RE.test(k)||!Array.isArray(p.k[k])||p.k[k].length>40)return false;for(i=0;i<p.k[k].length;i++){if(!okT(p.k[k][i]))return false;n++;}}}
if(p.x!=null){if(typeof p.x!=='object'||Array.isArray(p.x))return false;for(k in p.x){if(!KEY_RE.test(k)||!Array.isArray(p.x[k])||p.x[k].length>60)return false;for(i=0;i<p.x[k].length;i++)if(!HS_RE.test(p.x[k][i]))return false;}}
if(p.sc!=null){if(typeof p.sc!=='object'||Array.isArray(p.sc))return false;for(k in p.sc){var s=p.sc[k];if(!/^scene\./.test(k)||!KEY_RE.test(k)||!Array.isArray(s)||s.length<2||s.length>8)return false;for(i=0;i<s.length;i++){if(!Array.isArray(s[i])||typeof s[i][0]!=='string'||!/^[pwkmczvhstn]$/.test(s[i][0])||!okT(s[i][1]))return false;n++;}}}
if(p.xs!=null){if(!Array.isArray(p.xs)||p.xs.length>60)return false;for(i=0;i<p.xs.length;i++)if(typeof p.xs[i]!=='string'||!KEY_RE.test(p.xs[i]))return false;}
return n<=3000;}catch(e){return false;}}
function own(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function restore(D){var o=D&&D.__r3jo;if(!o)return;var k;for(k in o.k){if(o.k[k]===null)delete D.k[k];else D.k[k]=o.k[k];}
for(k in o.sc){if(o.sc[k]===null)delete D.sc[k];else D.sc[k]=o.sc[k];}D.__r3jo=null;D.__r3jv=0;}
function applyTo(D,p,full){if(!D||!D.k||!p)return;if(D.__r3jv===p.v)return;restore(D);var o={k:{},sc:{}},k;D.__r3jo=o;if(!D.sc)D.sc={};function keepK(k){if(!own(o.k,k))o.k[k]=own(D.k,k)?D.k[k]:null;}
function keepS(k){if(!own(o.sc,k))o.sc[k]=own(D.sc,k)?D.sc[k]:null;}
for(k in(p.x||{})){if(!D.k[k])continue;var hs=p.x[k],keep=D.k[k].filter(function(t){return hs.indexOf(hh(t))<0;});var add=p.k&&p.k[k]&&p.k[k].length;if(!keep.length&&!add)continue;keepK(k);D.k[k]=keep;}
for(k in(p.k||{})){if(!full&&!D.k[k])continue;keepK(k);D.k[k]=(D.k[k]||[]).concat(p.k[k]);}
if(full||D.sc){for(k in(p.sc||{})){keepS(k);D.sc[k]=p.sc[k];}(p.xs||[]).forEach(function(k){if(D.sc[k]){keepS(k);delete D.sc[k];}});}
D.__r3jv=p.v;}
var cur=null;function applyAll(){if(!cur||offF())return;applyTo(W.R3T_DATA0,cur,false);if(W.R3T_DATA)applyTo(W.R3T_DATA,cur,true);try{R3T.full();}catch(e){}}
function dropAll(){cur=null;lss(FK,null);restore(W.R3T_DATA0);restore(W.R3T_DATA);try{R3T.full();}catch(e){}}
if(!offF()){var c0=jp(lsg(FK));if(c0&&valid(c0)){cur=c0;applyAll();}else if(c0||lsg(FK)){lss(FK,null);ev('jfr',{k:'bad',v:0});}
try{R3T.ready(function(){applyAll();});}catch(e){}}
var fst=0;function fetchFresh(force){if(offF()||!SURL||fst)return;if(!force&&Date.now()-num(lsg(FT))<FR_H)return;fst=1;var done=false,to=setTimeout(function(){if(!done){done=true;fst=0;ev('jfr',{k:'fail',v:cur?cur.v:0});}},9000);try{fetch(SURL+'?op=r3txt&v='+(cur?cur.v:0),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){if(done)return;done=true;clearTimeout(to);fst=0;if(!j||!j.ok){ev('jfr',{k:'fail',v:cur?cur.v:0,w:j&&j.why?String(j.why).slice(0,8):''});return;}
lss(FT,String(Date.now()));if(j.off||!(j.v>0)){if(cur)ev('jfr',{k:j.off?'off':'none',v:cur.v});dropAll();return;}
if(j.same&&cur&&cur.v===j.v){ev('jfr',{k:'same',v:j.v});return;}
var p=j.p;if(!p||!valid(p)||p.v!==j.v){ev('jfr',{k:'bad',v:j.v});return;}
var s=JSON.stringify(p);if(s.length>250000){ev('jfr',{k:'bad',v:j.v});return;}
if(cur){restore(W.R3T_DATA0);restore(W.R3T_DATA);}cur=p;lss(FK,s);applyAll();ev('jfr',{k:'new',v:p.v});try{R3.emit('joke:fresh',p.v);}catch(e){}}).catch(function(){if(done)return;done=true;clearTimeout(to);fst=0;ev('jfr',{k:'fail',v:cur?cur.v:0});});}catch(e){fst=0;}}
setTimeout(function(){fetchFresh(qp('r3jfresh')==='1');},4000);(function css(){var s=document.createElement('style');s.id='r3jCss';s.textContent='.r3jk{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:6px 0 10px;font-size:17px;color:inherit}'
+'.r3jk>*{margin-right:6px}.r3jk-q{font-weight:600;opacity:.75}'
+'.r3jk-b{min-width:48px;min-height:44px;padding:4px 10px;border-radius:22px;border:1px solid rgba(0,0,0,.15);background:rgba(255,255,255,.75);font-size:22px;line-height:1;cursor:pointer}'
+'.r3jk-b:active{transform:scale(.94)}.r3jk.done{opacity:.85}.r3jk-t{font-size:17px}'
+'.r3jkS{position:absolute;z-index:4;margin:0;padding:4px 8px;border-radius:24px;background:rgba(255,253,243,.92);color:#2a3338;box-shadow:0 3px 10px rgba(0,0,0,.2);transition:opacity .3s}'
+'.r3jkS.out{opacity:0}.r3jkS .r3jk-q{display:none}.r3jkS.done{padding:6px 12px}'
+'.r3jw h2{margin-bottom:6px}.r3jw-i{font-size:17px;margin:4px 0 10px}.r3jw-i b,.r3jw-l b{display:block;font-size:17px;color:#9c5a12}'
+'.r3jw-sc{border-left:3px solid rgba(156,90,18,.35);padding:2px 0 2px 10px;margin:6px 0}.r3jw-l{font-size:17px;margin:6px 0;line-height:1.3}'
+'.r3jw-c i{opacity:.8}.r3jw-sec{font-weight:700;font-size:18px;margin:12px 0 4px}.r3jw-t{margin:6px 0;font-size:17px}.r3jw-t b{display:block}'
+'.r3jw-t span,.r3jw-n{font-size:17px;opacity:.9}';(document.head||document.documentElement).appendChild(s);})();W.R3J={rate:rate,rated:rated,recent:function(){return recent.slice();},attachModal:attachModal,attachSay:attachSay,openWeek:openWeek,weekDue:weekDue,wk:wkGet,titles:titles,valid:valid,applyTo:applyTo,fetchFresh:fetchFresh,cur:function(){return cur;},hh:hh,idOf:idOf,flush:flushShown,st:function(){return st;},reset:function(){st={r:{},ro:[]};save();lss(WK,null);}};})();