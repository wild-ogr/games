var TIH=(function(){'use strict';var TIH0={ev:{day:4,gap:9,calm:0},flock:{gap:10},who:{gap:4},txt:{chat:2,chatCalm:3,home:1,user:1500,dupDay:1},hand:{midK:.15,nbK:.2,calmK:.15,grM:.6,grC:.8,first:1.4},heat:{fast:.55,calm:.9,slow:1.2},fzDay:4};var TUT=[/Тяни палец/,/Читай рыбу/,/гляди на почерк/,/Держи палец — подматывай/,/Проведи пальцем/];var ACT=/^r3-(boj|zab|mem|calm|fst|first|day-call|wx)$/;function N(){var E=null;try{E=typeof R3E==='object'&&R3E&&R3E.tih;}catch(e){}if(!E)return TIH0;var o={},k,x;for(k in TIH0){o[k]=TIH0[k];if(E[k]&&typeof E[k]==='object'){o[k]={};for(x in TIH0[k])o[k][x]=E[k][x]!=null?E[k][x]:TIH0[k][x];}else if(E[k]!=null)o[k]=E[k];}return o;}
var on={all:false,ev:false,txt:false,who:false,hand:false};function isCalm(){try{return!!calm();}catch(e){return false;}}
function day(){try{return R3.day()||1;}catch(e){return 1;}}
function dk(){try{return R3.dk();}catch(e){return 0;}}
var MEM_K='rybak-tih',M=null;function mem(){if(M)return M;try{M=JSON.parse(localStorage.getItem(MEM_K)||'null');}catch(e){M=null;}
if(!M||typeof M!=='object')M={};M.n=+M.n||0;M.e=M.e!=null?+M.e:-99;M.f=M.f!=null?+M.f:-99;M.w=M.w!=null?+M.w:-99;M.d=+M.d||0;M.h=Array.isArray(M.h)?M.h:[];M.t=Array.isArray(M.t)?M.t:[];return M;}
function memSave(){try{localStorage.setItem(MEM_K,JSON.stringify(M));}catch(e){}}
function hash(s){var h=2166136261>>>0;s=String(s).replace(/[\d\s]+/g,' ').trim();for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(36);}
var POM={cat:1,gull:1,wife:1,malek:1};function inZor(){try{return!!(G&&G.zor&&!G.tourn&&!G.cup&&!G.guest);}catch(e){return false;}}
function may(k){if(!on.ev)return true;var c=N(),m=mem();if(k==='fz')return day()>=c.fzDay;if(isCalm()&&!c.ev.calm&&(POM[k]||k==='flock'))return false;if(day()<c.ev.day)return false;if(k==='flock')return m.n-m.f>=c.flock.gap;if(POM[k])return m.n-m.e>=c.ev.gap;return true;}
function took(k){if(!on.ev)return;var m=mem();if(k==='flock')m.f=m.n;else if(POM[k])m.e=m.n;memSave();}
function cast(){var m=mem();m.n++;memSave();cur.n++;cur.lines=0;cur.cast=m.n;}
function whoOk(f,tr){if(!on.who)return true;var m=mem();if(tr)return true;if(cur.n<=1)return false;if(m.n-m.w<N().who.gap)return false;m.w=m.n;memSave();return true;}
var cur={n:0,lines:0,cast:-1,chat:-99,drop:0,home:0},lastUser=0,lastUi=0;function srcOf(){var s='';try{s=(new Error()).stack||'';}catch(e){}var L=s.split('\n');for(var i=1;i<L.length;i++){var l=L[i],m=/\/js\/([a-z0-9\-]+)\.js/.exec(l);if(m){if(m[1]==='r3-tih')continue;return m[1];}if(/index\.html/.test(l))return'base';}
return'lazy';}
function isR3(src){return/^(r3-|mg-r3-)/.test(src)||(src==='lazy'&&fishing());}
function fishing(){try{return!!(G&&!G.over&&G.phase!=='done');}catch(e){return false;}}
function seenTut(t){var m=mem();for(var i=0;i<TUT.length;i++)if(TUT[i].test(t)){var k='u'+i;if(m.t.indexOf(k)>=0)return true;m.t.push(k);memSave();return false;}return null;}
function dupToday(t){var m=mem(),d=dk(),h=hash(t);if(m.d!==d){m.d=d;m.h=[];}if(m.h.indexOf(h)>=0)return true;m.h.push(h);if(m.h.length>300)m.h=m.h.slice(-300);memSave();return false;}
var force=0;function pass(kind,t,src){if(!on.txt||!t||force)return true;t=String(t);if(/опубликован|Скопировано|Отправлено|больше друга|Друг пока впереди/.test(t))return true;var c=N().txt;var r3=isR3(src);if(kind==='hint'){if(!r3)return true;var s=seenTut(t);if(s===true){cur.drop++;return false;}return true;}
var tu=seenTut(t);if(r3&&tu===true){cur.drop++;return false;}
if(!fishing()){if(Date.now()-lastUser<c.user)return true;if(!r3){cur.home++;return true;}
if(c.dupDay&&dupToday(t)){cur.drop++;return false;}
if(cur.home>=c.home){cur.drop++;return false;}
cur.home++;return true;}
if(Date.now()-lastUi<c.user)return true;if(!inZor()&&r3)return true;if(!r3){cur.lines++;return true;}
var act=ACT.test(src)||(kind==='say'&&arguments[3]==='wife');if(act){if(cur.lines>=1&&!/^r3-(boj|zab|mem|fst|first)$/.test(src)){cur.drop++;return false;}cur.lines++;return true;}
if(cur.lines>=1){cur.drop++;return false;}
if(c.dupDay&&dupToday(t)){cur.drop++;return false;}
var gap=isCalm()?c.chatCalm:c.chat;if(cur.n-cur.chat<gap){cur.drop++;return false;}
cur.chat=cur.n;cur.lines++;return true;}
function wrapTxt(){if(typeof say==='function'&&!say._tih){var s0=say;say=function(who,txt){try{if(!pass('say',txt,srcOf(),who))return;}catch(e){}return s0.apply(this,arguments);};say._tih=1;}
if(typeof toast==='function'&&!toast._tih){var t0=toast,tq={at:0,min:0,t:'',q:null,tm:0};var tShow=function(ctx,a){tq.at=Date.now();tq.t=String(a[0]);tq.min=Math.min(+a[1]||2000,1800);return t0.apply(ctx,a);};var tFlush=function(){var q=tq.q;tq.q=null;if(q)try{tShow(q[0],q[1]);}catch(e){}};toast=function(t){try{if(!pass('toast',t,srcOf()))return;}catch(e){}try{var nw=Date.now(),el=document.getElementById('toast');if(on.txt&&tq.at&&nw<tq.at+tq.min&&String(t)!==tq.t&&el&&el.classList.contains('on')){tq.q=[this,arguments];clearTimeout(tq.tm);tq.tm=setTimeout(tFlush,tq.at+tq.min-nw);return;}}catch(e){}return tShow(this,arguments);};toast._tih=1;}
if(typeof hint==='function'&&!hint._tih){var h0=hint;hint=function(t){try{if(t&&!pass('hint',t,srcOf()))return;}catch(e){}return h0.apply(this,arguments);};hint._tih=1;}}
function wrapCast(){if(typeof doCast!=='function'||doCast._tih)return;var d0=doCast;doCast=function(){var p0=null;try{p0=G&&G.phase;}catch(e){}var r=d0.apply(this,arguments);try{if(G&&G.phase!==p0&&inZor())cast();}catch(e){}return r;};doCast._tih=1;}
function nums(){if(!on.hand)return;var c=N();try{if(typeof R3E==='object'&&R3E){var h=R3E.hand&&typeof R3E.hand==='object'?R3E.hand:{},k;for(k in c.hand)h[k]=c.hand[k];R3E.hand=h;if(typeof LAD==='object'&&LAD&&LAD.DEF&&!R3E.lad){var L=JSON.parse(JSON.stringify(LAD.DEF));for(k in c.heat)L.heat[k]=c.heat[k];R3E.lad=L;}
if(R3E.lad&&R3E.lad.fz)R3E.lad.fz.day=Math.max(R3E.lad.fz.day||0,c.fzDay);}}catch(e){}}
function init(){if(typeof R3!=='object'||!R3||!R3.on)return;on.all=R3.reg('tih',{s:'R3-CALM',t:'тихая рыбалка: помехи редко, текста меньше, вываживание мягче'});if(!on.all)return;on.ev=R3.reg('tih.ev',{s:'R3-CALM',t:'помехи и события в ловле: с 4-го дня, раз в 9 забросов, не подряд'});on.txt=R3.reg('tih.txt',{s:'R3-CALM',t:'всплывающий текст: ≤1 строки за заброс, Мостки — 1 строка, повтор — раз в день, обучение — раз'});on.who=R3.reg('tih.who',{s:'R3-CALM',t:'«Кто тянет?» — раз в 4 заброса'});on.hand=R3.reg('tih.hand',{s:'R3-CALM',t:'вываживание обычной рыбы мягче, «жар руки» без гонки'});try{document.addEventListener('pointerdown',function(e){lastUser=Date.now();try{if(!e.target||e.target.tagName!=='CANVAS')lastUi=lastUser;}catch(x){}},true);document.addEventListener('keydown',function(){lastUser=Date.now();},true);}catch(e){}
if(on.txt)wrapTxt();wrapCast();nums();try{if(on.txt&&typeof R3D==='object'&&R3D&&R3D.busy&&!R3D.busy._tih){var b0=R3D.busy;R3D.busy=function(){if(b0.apply(this,arguments))return true;try{var e=document.getElementById('toast');return!!(e&&e.classList.contains('on'));}catch(x){return false;}};R3D.busy._tih=1;}}catch(e){}
R3.sub('run',function(){cur.n=0;cur.lines=0;cur.chat=-99;cur.drop=0;},'tih');R3.sub('end',function(){if(cur.drop)try{R3.ev('tih',{k:'drop',n:cur.drop});}catch(e){}cur.drop=0;cur.home=0;},'tih');R3.sub('home',function(){cur.home=0;},'tih');}
init();function now(fn){force++;try{return fn();}finally{force--;}}
return{now:now,N:N,may:may,took:took,whoOk:whoOk,mem:mem,on:on,cur:cur,_reset:function(){M={};memSave();M=null;},_pass:pass};})();