'use strict';
const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function plural(n,a,b,c){const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;}
const coinsTxt=n=>n+' '+plural(n,'монета','монеты','монет');
const COIN_I='<span class="coin" style="width:16px;height:16px;vertical-align:-2px"></span>';
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function toast(t,ms){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast._t);
toast._t=setTimeout(()=>e.classList.remove('on'),ms||Math.max(2500,1000+60*t.length));}
if($('toast'))$('toast').addEventListener('click',()=>{clearTimeout(toast._t);$('toast').classList.remove('on');});
const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms))]);
const T0=Date.now();
let MAIN=null,EXTRA=null,MORE=null,WHY=null,DENY=null,RUDEH=null;
const dictReady=()=>typeof DICT_MAIN!=='undefined'&&typeof ZINA_NO==='object';
const DLOAD={n:{},t:{}};
const DWAIT={w:'',g:null,t:0};
function ensureDict(){[['js/dict.js',typeof DICT_MAIN==='undefined'],['js/zina.js',typeof ZINA_NO!=='object']].forEach(([f,need])=>{
if(need&&!(window.__lz||{})[f]&&typeof window.__lzGo==='function'){window.__lzGo();return;}
const z=(window.__lz||{})[f];if(!need||(z&&z.s===0&&Date.now()-z.t<20000)||(DLOAD.p&&DLOAD.p[f]))return;
const n=DLOAD.n[f]||0,ago=Date.now()-(DLOAD.t[f]||0);if(ago<(n>=4?60000:3000))return;DLOAD.n[f]=n+1;DLOAD.t[f]=Date.now();
(DLOAD.p=DLOAD.p||{})[f]=1;const done=()=>{DLOAD.p[f]=0;};
new Promise((ok,no)=>{const e=document.createElement('script');e.src=f+'?r='+(n+1);e.setAttribute('data-lazy','');e.onload=ok;e.onerror=no;document.head.appendChild(e);setTimeout(no,20000);})
.then(()=>{done();dictCame();},done);});}
function dictCame(){if(!dictReady()||!DWAIT.w)return;const w=DWAIT.w,g=DWAIT.g,t=DWAIT.t;DWAIT.w='';DWAIT.g=null;
try{if(typeof G==='undefined'||!G||G!==g||G.won||Date.now()-t>120000)return;if(!isWord(w)||G.words.some(x=>x.w===w)||G.bonus.has(w))return;submit(w);}catch(e){}}
addEventListener('load',()=>setTimeout(()=>{if(!dictReady())ensureDict();},1500));
function isWord(w){if(!dictReady())return false;
if(!MAIN){MAIN=new Set(DICT_MAIN.split(' '));EXTRA=new Set(DICT_EXTRA.split(' '));
MORE=new Set(typeof ZINA_MORE==='string'&&ZINA_MORE?ZINA_MORE.split(' '):[]);DENY=new Set(typeof ZINA_DENY==='string'&&ZINA_DENY?ZINA_DENY.split(' '):[]);
RUDEH=new Set(typeof ZINA_RUDE==='string'&&ZINA_RUDE?ZINA_RUDE.split(' '):[]);WHY=null;}
return!DENY.has(w)&&(MAIN.has(w)||EXTRA.has(w)||MORE.has(w))&&!RUDEH.has(h32(w));}
function h32(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
function whyNot(w){if(!WHY||(!WHY.size&&typeof ZINA_NO==='object')){WHY=new Map();if(typeof ZINA_NO==='object')for(const k in ZINA_NO)ZINA_NO[k].split(' ').forEach(x=>WHY.set(x,k));
if(typeof ZINA_RUDE==='string'&&ZINA_RUDE)ZINA_RUDE.split(' ').forEach(x=>WHY.set('#'+x,'rude'));}
return WHY.get('#'+h32(w))||WHY.get(w)||'';}
const SKEY='slovo-v1';
function freshSave(){return{v:1,ts:0,lv:0,coins:50,sound:1,bonusAll:0,jar:0,dict:{},daily:{},streak:0,lastDaily:'',found:0,hintsUsed:0,plays:0,tip:{},curs:{},
music:1,ex:'',skin:'gzhel',outfit:'lilac',own:{},bestStreak:0,ask:{},vib:1,big:0,hb:0,box:0};}
let S=freshSave();
const SHOT=/[?&]shot=/.test(location.search);
try{const r=!SHOT&&localStorage.getItem(SKEY);if(r){const o=JSON.parse(r);if(o&&typeof o==='object'&&!Array.isArray(o))S=Object.assign(S,o);}}catch(e){}
const BOOT={ts:S.ts||0,coins:+S.coins||0,jar:+S.jar||0,hb:+S.hb||0};
const bootSnap=()=>({ts:S.ts,coins:+S.coins||0,jar:+S.jar||0,hb:+S.hb||0});
function synced(s){Object.assign(BOOT,s);}
let cloudT=0,cloudReady=false,cloudBusy=false,cloudTry=0,cloudFails=0;
function save(){if(SHOT)return;S.ts=Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}
if(!cloudT)cloudT=setTimeout(()=>{cloudT=0;cloudSave();},PLAT==='vk'?15000:3000);}
function cloudSoon(ms){if(SHOT)return;clearTimeout(cloudT);cloudT=setTimeout(()=>{cloudT=0;cloudSave();},ms||1500);}
function cloudSave(flush){if(SHOT)return;if(!cloudReady){cloudLoad();return;}if(cloudBusy){cloudSoon(2000);return;}
try{if(YP)yaSave(flush);else if(PLAT==='vk'&&VK)vkSaveCloud();}catch(e){}}
const yaLog=[];let yaT=0;
function yaSave(flush){const now=Date.now();while(yaLog.length&&now-yaLog[0]>300000)yaLog.shift();
if(yaLog.length>=90){clearTimeout(yaT);yaT=setTimeout(()=>cloudSave(),300000-(now-yaLog[0])+1000);return;}
yaLog.push(now);const snap=bootSnap();YP.setData(S,!!flush).then(()=>synced(snap)).catch(()=>{});}
function canon(o){return JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((r,x)=>(r[x]=v[x],r),{}):v);}
const noTs=o=>Object.assign({},o,{ts:0});
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
function mergeSave(d){if(!isObj(d))return false;const before=canon(noTs(S)),newer=(+d.ts||0)>BOOT.ts;
S.lvo=lvoOf(S)&&(lvoOf(d)||(+S.lv||0)>=8&&(+S.lv||0)>=(+d.lv||0))?1:0;
for(const k in d)if(!(k in S)&&!(typeof ZB!=='undefined'&&ZB.owns(k)))S[k]=d[k];
SOC.merge(d.soc);
STAT.merge(d.stc);
for(const k of['lv','found','bonusAll','hintsUsed','plays','bestStreak','wins'])S[k]=Math.max(+S[k]||0,+d[k]||0);
for(const k of['dict','daily','own','tip','ask','chg'])S[k]=Object.assign({},isObj(d[k])?d[k]:{},isObj(S[k])?S[k]:{});
const a=typeof S.ex==='string'?S.ex:'',b=typeof d.ex==='string'?d.ex:'';let e='';for(let i=0;i<Math.max(a.length,b.length);i++)e+=a[i]==='1'||b[i]==='1'?'1':'0';S.ex=e;
S.curs=isObj(S.curs)?S.curs:{};if(isObj(d.curs))for(const k in d.curs){const x=d.curs[k];if(isObj(x)&&(!S.curs[k]||(x.t||0)>(S.curs[k].t||0)))S.curs[k]=x;}
const la=+S.lastDaily||0,lb=+d.lastDaily||0;
if(lb>la){S.lastDaily=d.lastDaily;S.streak=+d.streak||0;}else if(lb===la)S.streak=Math.max(+S.streak||0,+d.streak||0);
if(isObj(d.dailyPick)&&(!S.dailyPick||d.dailyPick.d>S.dailyPick.d))S.dailyPick=d.dailyPick;
if(isObj(d.fix)&&(!S.fix||d.fix.d>S.fix.d))S.fix=d.fix;
if(isObj(d.adc)&&(!S.adc||d.adc.d>S.adc.d||d.adc.d===S.adc.d&&d.adc.n>S.adc.n))S.adc=d.adc;
if(isObj(d.fl)&&(!S.fl||d.fl.d>S.fl.d||d.fl.d===S.fl.d&&d.fl.n>S.fl.n))S.fl=d.fl;
if(isObj(d.gift)&&(!S.gift||d.gift.d>S.gift.d))S.gift=d.gift;
if(isObj(d.adf)&&(!S.adf||d.adf.d>S.adf.d))S.adf=d.adf;
if(isObj(d.lg)&&(!S.lg||(+d.lg.n||0)>(+S.lg.n||0)||(+d.lg.n||0)===(+S.lg.n||0)&&(+d.lg.d||0)>(+S.lg.d||0)))S.lg=d.lg;
if(isObj(d.wk)&&(!S.wk||d.wk.w>S.wk.w))S.wk=d.wk;
for(const k of['exAll','catW'])if(+d[k]>(+S[k]||0))S[k]=+d[k];
if(typeof thMerge==='function')thMerge(d,newer);
if(typeof payMerge==='function')payMerge(d);
if(typeof ZB!=='undefined')ZB._merge(d,newer);
if(typeof sosMerge==='function')sosMerge(d);
if(newer){
const js=typeof JAR_SIZE!=='undefined'?JAR_SIZE:0,jp=typeof JAR_PRIZE!=='undefined'?JAR_PRIZE:0;
S.coins=Math.max(0,(+d.coins||0)+((+S.coins||0)-BOOT.coins));
let jar=Math.max(0,(+d.jar||0)+((+S.jar||0)-BOOT.jar));if(js)while(jar>=js){jar-=js;S.coins+=jp;}S.jar=jar;
if(d.box!=null)S.box=+d.box||0;
S.hb=Math.min(typeof HB_MAX!=='undefined'?HB_MAX:9,Math.max(0,(+d.hb||0)+((+S.hb||0)-BOOT.hb)));
for(const k of['sound','music'])if(k in d)S[k]=d[k];
const has=(t,L,id)=>{const it=L&&L.find(x=>x.id===id);return!!it&&(!it.p&&!it.gift||!!(S.own||{})[t+':'+id]);};
if(has('s',typeof SKINS!=='undefined'&&SKINS,d.skin))S.skin=d.skin;if(has('o',typeof OUTFITS!=='undefined'&&OUTFITS,d.outfit))S.outfit=d.outfit;
synced({ts:+d.ts,coins:+d.coins||0,jar:+d.jar||0,hb:+d.hb||0});}
migrate();return canon(noTs(S))!==before;}
async function cloudLoad(){if(cloudBusy||cloudReady||SHOT||cloudFails>=4||!(ysdk||PLAT==='vk'&&VK)||Date.now()-cloudTry<10000)return;cloudBusy=true;cloudTry=Date.now();
try{let d;
if(ysdk){if(!YP)YP=await withTimeout(ysdk.getPlayer({scopes:false}),10000);d=await withTimeout(YP.getData(),10000);}
else d=await vkLoadCloud();
const ch=mergeSave(d);cloudReady=true;if(isObj(d)&&+d.ts>0&&!S.cl){S.cl=1;try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}}statProg();updCoins();if(ch){try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}}
if(!d||canon(noTs(d))!==canon(noTs(S)))save();
if(ch&&typeof onCloud==='function')onCloud();
}catch(e){cloudFails++;if(cloudFails<4)setTimeout(cloudLoad,11000);}finally{cloudBusy=false;}}
let cloudHid=0;
async function cloudRe(){if(!cloudReady||cloudBusy||SHOT||!(YP||PLAT==='vk'&&VK))return;cloudBusy=true;clearTimeout(cloudT);cloudT=0;
try{const d=YP?await withTimeout(YP.getData(),10000):await vkLoadCloud();const ch=mergeSave(d);
if(ch){try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}if(typeof onCloud==='function')onCloud();}
if(isObj(d)&&canon(noTs(d))!==canon(noTs(S)))cloudSoon(500);}catch(e){}finally{cloudBusy=false;}}
function lvoOf(s){return s.lvo===0||s.lvo===1?s.lvo:+s.lv>=8?0:1;}
function migrate(){S.lvo=lvoOf(S);S.curs=isObj(S.curs)?S.curs:{};if(S.cur&&S.cur.key&&!S.curs[S.cur.key])S.curs[S.cur.key]=Object.assign({t:Date.now()},S.cur);delete S.cur;
if(!isObj(S.ask))S.ask={};if(!isObj(S.tip))S.tip={};
for(const k of['payT','payV'])if(S[k]!=null&&!Array.isArray(S[k]))S[k]=[];for(const k of['buy','buyB'])if(S[k]!=null&&!isObj(S[k]))S[k]={};
if(typeof thFix==='function')thFix();if(typeof ZB!=='undefined')ZB._fix();}
migrate();
function addCoins(n,src){S.coins=Math.max(0,S.coins+n);if(n>0)STAT.earn(src||'oth',n);save();updCoins();}
function updCoins(){document.querySelectorAll('.cc').forEach(e=>e.textContent=S.coins);STAT.bal(+S.coins||0);}
const PLAT=/[?&](vk_app_id|vk)=/.test(location.search)?'vk':'yandex';
const OK=PLAT==='vk'&&/[?&](vk_client=ok|vk_platform=[a-z_]*_ok|ok=1)(&|$)/.test(location.search);
const OK_GROUP=70000058939568,OK_GROUP_LINK='https://ok.ru/group/'+OK_GROUP;
const OK_LINK='https://ok.ru/game/512005727621';
const VK_MOBILE=/[?&]vk_platform=mobile_/.test(location.search);
let ysdk=null,YP=null,VK=null,paused=false,muted=false;
function nowMs(){try{if(ysdk&&ysdk.serverTime){const t=ysdk.serverTime();if(typeof t==='number'&&t>1.6e12)return t;}}catch(e){}return Date.now();}
var STAT=(function(){
var V=1,SV=16,FB='https://stat.assortiz.ru/ev',U2='',pFail=0,pOk=0,slN=0,SLMAX=8,FLUSH=90,MAXQ=40,MAXB=60,PMAX=30,PBYTES=3e5,SESS_GAP=30*60e3,MAXERR=5,THR=2e4;
var O={},on=false,dev=false,G='',Q=[],pend=[],sk='',seq=0,t0=0,act=0,actT=0,vis=true,hideT=0,timer=0,
st={c:0,n:0,d:0},hdr={},lvl=null,scr='',errN=0,resN=0,errSeen={},once={},lastErr='',
srv=false,nm=0,fly={},fails=0,nextT=0,sP=null,sTm=0,prog=null,cb,mvT=0,aR={},thr={},eS=null,aC={},
cfgO=null,cfgS=0,abs={},rdT=0,acted=0,pre=0,tp=0,fL=0,fP=0,fR=0,fX=0,fA=0,fC=0,fN=0,fH=[],fLo=999,fHg=0,fJ=0,pfS=0,FGR=100;
function ls(k,v){try{if(v===undefined)return window.localStorage.getItem(k);if(v===null)window.localStorage.removeItem(k);else window.localStorage.setItem(k,v);}catch(e){}return null;}
function jp(s){try{return s?JSON.parse(s):null;}catch(e){return null;}}
function now(){var t=0;try{t=O.now?O.now():0;}catch(e){}return typeof t==='number'&&t>1.6e12?t:Date.now();}
function dk(t){var d=new Date(t);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function bdk(){var d=new Date(now()+108e5);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function dms(k){return Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100);}
function ddiff(a,b){return Math.round((dms(b)-dms(a))/864e5);}
function rnd(){var s='',i;for(i=0;i<3;i++)s+=('0000'+Math.floor(Math.random()*1679616).toString(36)).slice(-4);return s;}
function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);try{return m?decodeURIComponent(m[1]):'';}catch(e){return'';}}
function sec(){return Math.round((Date.now()-t0)/100)/10;}
function actSec(){return Math.round((act+(vis?Date.now()-actT:0))/1000);}
function scrub(s,n){s=String(s).replace(/[?&#][\w.\-]+=[^\s&#)'"]*/g,'').replace(/(https?:\/\/[^\s?#)'"]*)[?#][^\s)'"]*/g,'$1').replace(/https?:\/\/[^\/\s)'"]+/g,'').replace(/\d{7,}/g,'#');return s.slice(0,n||40);}
function clean(p){var o={},n=0,k,v;if(!p||typeof p!=='object')return o;
for(k in p){if(!p.hasOwnProperty(k)||n>=8)continue;v=p[k];
if(typeof v==='number'){if(!isFinite(v))continue;v=Math.round(v*100)/100;}
else if(typeof v==='boolean')v=v?1:0;else if(typeof v==='string')v=scrub(v);else continue;
o[String(k).slice(0,12)]=v;n++;}return o;}
function device(){var ua=navigator.userAgent||'',w=Math.round(window.innerWidth||0),h=Math.round(window.innerHeight||0),
os=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)?'ios':/Android/.test(ua)?'android':/Windows/.test(ua)?'win':/Mac OS X/.test(ua)?'mac':/Linux|CrOS/.test(ua)?'linux':'other',
touch=('ontouchstart'in window)||navigator.maxTouchPoints>0,m=Math.min(w,h);
var cv=/Chrome\/(\d+)/.exec(ua),sv=/Version\/(\d+)[.\d]* (Mobile\/\S+ )?Safari/.exec(ua);
return{os:os,dv:touch?(m<600?'m':'t'):'d',sw:Math.round(w/20)*20,sh:Math.round(h/20)*20,
wv:/; wv\)|VKAndroidApp|com\.vkontakte/.test(ua)||(os==='ios'&&!/Safari\//.test(ua))?1:0,
br:cv?'c'+cv[1]:sv?'s'+sv[1]:/Firefox\/(\d+)/.test(ua)?'f'+/Firefox\/(\d+)/.exec(ua)[1]:'?'};}
function hw(p){try{var m=+navigator.deviceMemory,c=+navigator.hardwareConcurrency;if(m>0)p.mem=m;if(c>0)p.cpu=Math.min(64,Math.round(c));}catch(e){}return p;}
function slow(sc,ms,o){if(!on||!(ms>=300)||slN>=SLMAX)return;slN++;var p={sc:String(sc||'').slice(0,24),ms:Math.round(ms)},k;for(k in o||{})if(p[k]===undefined)p[k]=o[k];ev('slow',p);}
function saveSt(){if(O.S){O.S.stc={c:st.c,n:st.n,d:st.d};}ls('stat-'+G,JSON.stringify(st));}
var first=false,hooked=false,cut='';
function locH(h){return/^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|)$|\.localhost$|\.local$|\.test$|^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(String(h||''));}
function locU(u){var m=/^https?:\/\/(\[[^\]]*\]|[^\/:?#]+)/i.exec(u);return!!m&&locH(m[1]);}
function init(o){O=o||{};O.url=String(O.url||'');G=String(O.g||'game').slice(0,16);t0=Date.now();actT=t0;
cut='';if(/^https?:/i.test(O.url)&&!locU(O.url)){var wd=false;try{wd=navigator.webdriver===true||/HeadlessChrome|PhantomJS|Puppeteer|Playwright/.test(navigator.userAgent||'');}catch(e){}
cut=wd?'wd':location.protocol==='file:'?'file':locH(location.hostname)?'local':'';if(cut)O.url='';}
U2=O.url?String(O.url2!==undefined?O.url2:/^https?:\/\/functions\.yandexcloud\.net\//i.test(O.url)?FB:''):'';
dev=!O.url&&(O.dev===true||(/[?&]stat=dev/.test(location.search)&&/^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$|\.test$/.test(location.hostname)));
var s=jp(ls('stat-'+G))||{},c=O.S&&O.S.stc||{};
st={c:+s.c||+c.c||0,n:Math.max(+s.n||0,+c.n||0),d:Math.max(+s.d||0,+c.d||0)};
var today=dk(now());first=!st.c;if(first)st.c=today;st.n++;srv=ls('stat-srv')==='2';
if(!O.url&&!dev){on=false;window.__se=[];saveSt();return;}
if(!enabled()||Math.random()>=(typeof O.rate==='number'?O.rate:1)){on=false;ls('stat-q-'+G,null);saveSt();return;}
start();}
function okSrc(){var r=qp('vk_ok_ref')||qp('refplace')||qp('vk_ref'),h=qp('hash')||qp('custom_args')||String(location.hash||'').slice(1),m,k='';
try{h=decodeURIComponent(h);}catch(e){}
m=/^([a-z][a-z0-9]{0,4})(?:[^a-z0-9]|$)/.exec(h);if(m){k=m[1];var v=/^[a-z][a-z0-9]{0,4}=([a-z][a-z.]{0,7})(&|$)/.exec(h);if(v)k+='.'+v[1];}
return scrub(r,k?31-k.length:32)+(k?'~'+k:'');}
function start(){var d=device(),i,x,se=window.__se;on=true;sk=rnd();seq=0;
var okp=/[?&](vk_client=ok|vk_platform=[a-z_]*_ok|ok=1)(&|$)/.test(location.search);
hdr={v:V,sv:SV,g:G,gv:String(O.gv||'').slice(0,20),p:String(O.plat==='yandex'&&/\.github\.io$/.test(location.hostname)?'web':O.plat==='vk'&&okp?'ok':O.plat||'').slice(0,8),l:String(O.lang||'').slice(0,4),
vp:scrub(qp('vk_platform').replace(/_ok$/,''),16),src:okp?okSrc():scrub(qp('vk_ref'),32),os:d.os,dv:d.dv,wv:d.wv,br:d.br,sw:d.sw,sh:d.sh,sk:sk};
pend=dev&&!O.url?[]:jp(ls('stat-q-'+G))||[];if(!(pend instanceof Array))pend=[];
sP=['start',sec(),hw({sn:st.n,f:first?1:0,ld:Math.round(window.performance&&performance.now?performance.now():0)})];slN=0;
if(prog)rel();else sTm=setTimeout(rel,3000);
dayMark();saveSt();
if(se&&se.length){for(i=0;i<se.length;i++){x=se[i];if(x&&x[0]===2)res(x[1],x[2]);else if(x)err(x[1],x[2],x[3],0,{e:1});}}window.__se=[];
if(!hooked){hooked=true;
window.addEventListener('error',function(e){var x=e&&e.target;if(x&&x!==window&&x.tagName){res(x.src||x.href||'',x.tagName);return;}
err(e&&e.message,e&&e.filename,e&&e.lineno,e&&e.colno);},true);
window.addEventListener('unhandledrejection',function(e){var r=e&&e.reason;err('promise: '+(r&&r.message||r),r&&r.stack?String(r.stack).split('\n')[1]:'');});
document.addEventListener('visibilitychange',function(){document.visibilityState==='hidden'?hide():show();});
window.addEventListener('pagehide',hide);
window.addEventListener('blur',function(){fBrk();});window.addEventListener('focus',function(){fBrk();});
var ts=['pointerdown','touchstart','keydown'];for(i=0;i<3;i++)document.addEventListener(ts[i],tap,{capture:true,passive:true});
timer=setInterval(function(){if(on&&vis&&(Q.length||pend.length))flush();},FLUSH*1000);}
setTimeout(flush,5000);
}
function rel(){if(!sP)return;clearTimeout(sTm);var e=sP,k;sP=null;if(prog)for(k in prog)e[2][k]=prog[k];e[2]=clean(e[2]);Q.unshift(e);log(e);
if(cfgO||hasAb())cfg();}
function log(e){if(dev){try{(window.__stat=window.__stat||[]).push(e);if(window.console)console.log('[STAT]',e[0],JSON.stringify(e[2]));}catch(x){}}}
function dayMark(){var t=dk(now());if(st.d===t)return;st.d=t;ev('day',{dn:Math.max(0,ddiff(st.c,t)),sn:st.n});saveSt();}
function ev(n,p){if(!on)return;var e=[String(n).slice(0,16),sec(),clean(p)];Q.push(e);log(e);
if(e[0]==='ready'&&!rdT)rdT=Date.now();
if(Q.length>=MAXQ)flush();}
function onceEv(n,p){if(once[n])return;once[n]=1;ev(n,p);}
function progress(o){o=o||{};prog={};if(o.pl!==undefined)prog.pl=+o.pl||0;if(o.cn!==undefined){prog.cn=+o.cn||0;if(cb===undefined)cb=prog.cn;}
if(o.bt!==undefined)prog.bt=o.bt?1:0;rel();}
function bal(n){if(typeof n==='number'&&isFinite(n))cb=n;}
function setPl(n){n=+n;if(!isFinite(n))return;prog=prog||{};prog.pl=n;}
function lvlStart(l,m,x){if(lvl)lvlEnd('quit');lvl={l:l,m:m||'',t:Date.now(),h:0,u:0,x:{}};var p={l:l},k,n=0;if(m)p.m=m;
if(x)for(k in x)if(x.hasOwnProperty(k)&&n++<3)p[k]=x[k];ev('lvl',p);}
function use(k,n){if(lvl){if(k==='hint')lvl.h+=n||1;else if(k==='undo')lvl.u+=n||1;else lvl.x[k]=(lvl.x[k]||0)+(n||1);}}
function lvlEnd(r,p){if(!lvl)return;var o={l:lvl.l,r:r,s:Math.round((Date.now()-lvl.t)/1000)},k;if(lvl.m)o.m=lvl.m;if(lvl.h)o.h=lvl.h;if(lvl.u)o.u=lvl.u;
if(r==='quit'&&mvT)o.idle=idle();for(k in p||{})if(p.hasOwnProperty(k))o[k]=p[k];lvl=null;ev('end',o);}
function screen(n){if(n===scr)return;scr=String(n).slice(0,16);if(!once['s_'+scr]){once['s_'+scr]=1;ev('scr',{n:scr});}}
function move(){mvT=Date.now();}
function idle(){return Math.round((Date.now()-mvT)/1000);}
var place='';
function setPlace(p){place=String(p||'').slice(0,16);}
function adReq(f){aR[f]=Date.now();fBrk(2e5);}
function thrN(k,n,p){var x=thr[k]||(thr[k]={c:0,t:0}),t=Date.now();x.c++;x.n=n;x.p=p;if(t-x.t>=THR){x.t=t;thrOut(x);}}
function thrOut(x){if(!x.c)return;x.p.n=x.c;x.c=0;ev(x.n,x.p);}
function ad(f,r,code,x){var p={f:f,r:r,p:f==='int'?'int':(place||'?')},k;if(code!==undefined&&code!==null&&code!=='')p.c=scrub(code,24);
if(x)for(k in x)if(x[k]!==undefined&&x[k]!==null&&p[k]===undefined)p[k]=x[k];
if(r==='hold'){thrN('h'+p.p,'ad',p);return;}
fX=0;fBrk(r==='show'?2e5:1000);
if(aR[f]){p.ms=Date.now()-aR[f];aR[f]=0;}ev('ad',p);if(f!=='int'&&r!=='show')place='';}
function offer(p){p=String(p).slice(0,13);thrN('o'+p,'of_'+p,{p:p});}
function adChk(f,ok){var x=aC[f]||(aC[f]={y:0,n:0});x[ok?'y':'n']++;}
function earn(s,n){if(!(n>0))return;s=/^(lvl|ad|gift|chest|buy|quest)$/.test(s)?s:'oth';eS=eS||{};eS[s]=(eS[s]||0)+n;}
function ab(id,n,nw){id=String(id).toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8);n=Math.max(2,Math.min(26,n|0||2));
var k='stat-ab-'+G+'-'+id,v=abs[id]||ls(k)||'';if(!/^([A-Z]|-)$/.test(v)){v=nw&&!first?'-':String.fromCharCode(65+Math.floor(Math.random()*n));ls(k,v);}
abs[id]=v;return v==='-'?'':v;}
function hasAb(){for(var k in abs)if(abs[k]!=='-')return true;return false;}
function cfg(o){var k,a=[],p;if(o){cfgO=cfgO||{};for(k in o)if(/^(th|snd|calm)$/.test(k))cfgO[k]=o[k];}
if(!on||sP||cfgS)return;cfgS=1;for(k in abs)if(abs[k]!=='-')a.push(k+':'+abs[k]);p={};if(a.length)p.ab=a.join(',');
for(k in cfgO||{})p[k]=cfgO[k];p.lg=String(O.lang||'');ev('cfg',p);}
function tap(){if(acted||!on)return;var t=Date.now();if(!rdT){pre++;if(!tp)tp=t;return;}acted=1;var p={ms:t-rdT};if(pre)p.pre=pre;ev('act',p);}
function frame(){fL=Date.now();if(!fR&&on&&window.requestAnimationFrame){fR=1;requestAnimationFrame(ftick);}}
function ftick(){var t=Date.now(),d=t-fP,ok=fP>0&&fL>=fP-FGR&&fX<fP&&vis&&d>=0&&d<=5000;fR=0;
if(t-fL>FGR&&!ok){fP=0;return;}
fP=t;fR=1;requestAnimationFrame(ftick);if(!ok)return;
fN++;fC++;fA+=d;if(d>1000)fHg++;if(d>250)fJ++;
if(fA>=1000){d=Math.min(240,Math.round(fC*1000/fA));fH[d]=(fH[d]||0)+1;if(d<fLo)fLo=d;fA=0;fC=0;}}
function fBrk(ms){var t=Date.now()+(ms||0);if(t>fX)fX=t;}
function perf(){var i,s=0,h=0;if(pfS||fN<300)return;for(i=0;i<=240;i++)s+=fH[i]||0;if(!s)return;pfS=1;for(i=0;i<=240;i++){h+=fH[i]||0;if(h*2>=s)break;}
ev('perf',{fps:i,lo:fLo,hg:fHg,jk:fJ,s:s,v:2});}
function err(m,src,ln,col,x){if(!on||errN>=MAXERR)return;m=scrub(m||'?',120);src=scrub(String(src||'').replace(/[?#].*$/,'').replace(/^.*\//,''),40)+(ln?':'+ln+(col?':'+col:''):'');
var k=m+'|'+src,p={m:m,s:src,l:lvl?lvl.l:'',sc:scr};if(errSeen[k])return;errSeen[k]=1;errN++;lastErr=m;if(x&&x.e)p.e=x.e;ev('err',p);if(!sP)flush();}
function res(u,tag){u=String(u||'');if(!on||resN>=MAXERR||(/\/sdk\.js([?#]|$)/.test(u)&&hdr.p!=='yandex'))return;
var f=scrub(u.replace(/[?#].*$/,'').replace(/^.*\//,''),40);if(errSeen['f|'+f])return;errSeen['f|'+f]=1;resN++;
ev('err',{m:'load '+String(tag||'').toLowerCase(),e:2,f:f,sc:scr});}
function pack(){var b={},k;for(k in hdr)b[k]=hdr[k];b.dk=dk(now());b.dn=Math.max(0,ddiff(st.c,b.dk));b.sn=st.n;b.q=++seq;b.bd=bdk();b.e=Q.splice(0,MAXB);return b;}
function bk(b){return b.sk+'.'+b.q;}
function keep(){var s=JSON.stringify(pend),n=0;while(pend.length&&(pend.length>PMAX||s.length>PBYTES)){pend.shift();n++;s=JSON.stringify(pend);}
if(n){var L=pend[pend.length-1],e=['lost',sec(),{n:n}];if(L&&L.e.length<MAXB){L.e.push(e);s=JSON.stringify(pend);}else Q.push(e);}
if(O.url)ls('stat-q-'+G,pend.length?s:null);}
function drop(b){for(var i=0;i<pend.length;i++)if(bk(pend[i])===bk(b)){pend.splice(i,1);keep();return;}}
function got(b,s,mark){if(mark){if(!srv)ls('stat-srv','2');srv=true;nm=0;}else if(s>=200&&s<300&&srv&&++nm>=3){srv=false;ls('stat-srv',null);}
if(s>=500||s===429||!s)return bad();fails=0;nextT=0;drop(b);flush();}
function bad(){fails++;if(fails>=3)nextT=Date.now()+Math.min(900,90*Math.pow(2,fails-3))*1000;}
function post(u,s,done){
try{if(window.fetch){fetch(u,{method:'POST',mode:'cors',body:s,keepalive:s.length<6e4,headers:{'Content-Type':'text/plain'}}).then(function(r){
var h='';try{h=r.headers.get('X-Stat')||'';}catch(e){}
return r.text().then(function(x){done(r.status,h==='2'||/"v"\s*:\s*2/.test(x));},function(){done(r.status,h==='2');});},function(){done(0,false);});return;}
var x=new XMLHttpRequest();x.open('POST',u,true);x.setRequestHeader('Content-Type','text/plain');
x.onload=function(){done(x.status,/x-stat:\s*2/i.test(x.getAllResponseHeaders()||'')||/"v"\s*:\s*2/.test(x.responseText||''));};x.onerror=function(){done(0,false);};x.send(s);}catch(e){done(0,false);}}
function urls(){return U2?(pFail&&Date.now()-pFail<6e5?[U2,O.url]:[O.url,U2]):[O.url];}
function send(b){var s=JSON.stringify(b),k=bk(b),t=Date.now();if(fly[k]&&t-fly[k]<3e4)return;fly[k]=t;
var L=urls();
function go(i){post(L[i],s,function(c,mark){
var okc=c>=200&&c<300;
if(L[i]===O.url){if(okc){pFail=0;pOk=1;}else if(c>=500||c===429||!c)pFail=Date.now();}
if(!okc&&(c>=500||c===429||!c)&&i+1<L.length)return go(i+1);
delete fly[k];got(b,c,mark);});}
go(0);}
function flush(){if(!on||sP)return;while(Q.length)pend.push(pack());keep();
if(dev&&!O.url){pend=[];keep();return;}
if(navigator.onLine===false||!pend.length||Date.now()<nextT)return;send(pend[0]);}
function bUrl(){return U2&&(!pOk||(pFail&&Date.now()-pFail<6e5))?U2:O.url;}
function beacon(){var i,b,ok,left=[];if(dev&&!O.url){pend=[];keep();return;}if(navigator.onLine===false)return;
for(i=0;i<pend.length;i++){b=pend[i];ok=false;try{ok=!!(navigator.sendBeacon&&navigator.sendBeacon(bUrl(),JSON.stringify(b)));}catch(e){}
if(!ok||srv)left.push(b);}
pend=left;keep();if(pend.length&&!srv)send(pend[0]);}
function hide(){if(!on||!vis)return;vis=false;act+=Date.now()-actT;hideT=Date.now();fP=0;fBrk();rel();var k,p={d:actSec()};
for(k in thr)thrOut(thr[k]);if(eS){ev('earn',eS);eS=null;}for(k in aC){if(aC[k].y||aC[k].n)ev('adchk',{f:k,y:aC[k].y,n:aC[k].n});aC[k]={y:0,n:0};}
perf();if(!acted&&tp&&!rdT){acted=1;ev('act',{ms:tp-t0,nr:1});}
if(lvl)p.l=lvl.l;if(scr)p.sc=scr;if(cb!==undefined)p.cb=cb;if(mvT)p.idle=idle();if(prog&&prog.pl!==undefined)p.pl=prog.pl;ev('pause',p);
while(Q.length)pend.push(pack());keep();beacon();}
function show(){if(!on||vis)return;vis=true;actT=Date.now();fBrk();
if(Date.now()-hideT>SESS_GAP){
if(lvl)lvl=null;once={};errN=0;resN=0;errSeen={};mvT=0;sk=rnd();hdr.sk=sk;seq=0;t0=Date.now();act=0;st.n++;saveSt();cfgS=0;
var p=hw({sn:st.n,f:0,r:1}),k;slN=0;for(k in prog||{})p[k]=prog[k];if(cb!==undefined)p.cn=cb;ev('start',p);if(cfgO||hasAb())cfg();}
dayMark();}
function merge(c){if(!c||typeof c!=='object')return;if(+c.c&&(!st.c||+c.c<st.c))st.c=+c.c;if(+c.n>st.n)st.n=+c.n;if(+c.d>st.d)st.d=+c.d;saveSt();}
function tx(ru,en){return typeof LANG!=='undefined'&&LANG==='en'?en:ru;}
function enabled(){return ls('stat-off')!=='1';}
function available(){return!!(O.url||dev);}
function setEnabled(v){if(v){ls('stat-off',null);if(!on&&available())start();}
else{ls('stat-off','1');Q=[];pend=[];sP=null;clearTimeout(sTm);ls('stat-q-'+G,null);on=false;}}
function optOut(v){setEnabled(!v);}
function label(){return tx('📊 Анонимная статистика: ','📊 Anonymous statistics: ')+(enabled()?tx('вкл','on'):tx('выкл','off'));}
function note(){return tx('Уровни, ошибки и нажатия кнопок — без имени, ID и IP. Помогает делать игру лучше.',
'Levels, errors and button taps — no name, ID or IP. Helps us improve the game.');}
function toggle(){setEnabled(!enabled());return label();}
return{v:SV,init:init,enabled:enabled,available:available,setEnabled:setEnabled,label:label,note:note,toggle:toggle,ev:ev,once:onceEv,lvl:lvlStart,use:use,end:lvlEnd,screen:screen,
place:setPlace,ad:ad,adReq:adReq,offer:offer,adChk:adChk,err:err,flush:function(){rel();flush();},merge:merge,optOut:optOut,
progress:progress,pl:setPl,bal:bal,move:move,earn:earn,frame:frame,ab:ab,cfg:cfg,slow:slow,
_dbg:function(){return{on:on,dev:dev,cut:cut,Q:Q,pend:pend,st:st,hdr:hdr,lvl:lvl,lastErr:lastErr,srv:srv,nm:nm,fails:fails,nextT:nextT,sP:!!sP,cb:cb,fN:fN,fHg:fHg,fJ:fJ,pl:place};}};
})();
const STAT_URL='https://functions.yandexcloud.net/d4efqgmii6honbajplim?op=ev';
STAT.init({g:'slovo',gv:'v6.0-103000',plat:PLAT,lang:'ru',url:STAT_URL,now:()=>nowMs(),S:S});
let statPr=0;function statProg(){if(statPr)return;statPr=1;STAT.progress({pl:+S.lv||0,cn:+S.coins||0,bt:S.cl?1:0});}
setTimeout(statProg,2500);STAT.bal(+S.coins||0);STAT.cfg({snd:S.sound?1:0});
const PR=new Set();
function setPause(r,on){if(on)PR.add(r);else PR.delete(r);paused=PR.has('ad')||PR.has('sdk')||PR.has('vk');muted=PR.size>0;
if(AC){if(muted)AC.suspend().catch(()=>{});else if(AC.state!=='running'&&(S.sound||S.music))AC.resume().catch(()=>{});}}
const YG={on:false,
start(){if(this.on||!ysdk||document.hidden||PR.has('sdk'))return;this.on=true;try{ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.start();}catch(e){}},
stop(){if(!this.on)return;this.on=false;try{ysdk&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.stop();}catch(e){}}
};
function inPlay(){return!!(typeof G!=='undefined'&&G&&!G.won&&!paused&&$('game').classList.contains('on')&&!$('modal').classList.contains('on'));}
const LOCAL=/^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname)&&!/[?&]vk_app_id=/.test(location.search);
const AD_FAIL='Реклама сейчас недоступна — загляни чуть позже';
const AD_CLOSED='Ролик закрыт до конца — награды нет';
const VK_REAL=/[?&]vk_app_id=/.test(location.search);
const adsOk=()=>!!(VK||ysdk||LOCAL);
document.addEventListener('contextmenu',e=>{const t=e.target;if(!(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.classList&&t.classList.contains('cardimg'))))e.preventDefault();});
document.addEventListener('gesturestart',e=>e.preventDefault());
function loadScript(src,ms){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);setTimeout(no,ms||20000);});}
function vkSend(method,params,ms){return withTimeout(window.vkBridge.send(method,params||{}),ms||4000);}
function socInvTxt(){const u=typeof REF!=='undefined'&&REF&&REF.on&&REF.on()&&!OK?REF.link():SHR.link('');return'Заходи в игру «Баба Зина: слова из букв» — посоревнуемся!'+(u?'\n'+u:'');}
var SHR=(function(){
var busy=0;
function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):'';}
function br(){return PLAT==='vk'&&!!window.vkBridge&&typeof vkSend==='function';}
function vk(){return br()&&!OK&&VK_REAL;}
function link(tag){tag=tag||'';if(OK)return OK_LINK?OK_LINK+tag:'';if(PLAT==='vk')return'https://vk.com/app'+(+qp('vk_app_id')||54787973)+tag;return'';}
function ev(k,e){try{STAT.ev('z3sh',{k:k||'',e:e});}catch(x){}}
function t(s,ms){try{toast(s,ms||3500);}catch(e){}}
function exec(s){try{var a=document.createElement('textarea');a.value=s;a.setAttribute('readonly','');a.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
document.body.appendChild(a);a.select();var r=document.execCommand('copy');a.remove();return!!r;}catch(e){return false;}}
function web(s){return new Promise(function(res){var f=function(){res(exec(s));};
try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(function(){res(true);},f);return;}}catch(e){}f();});}
function copy(s){if(br())return vkSend('VKWebAppCopyText',{text:s},3000).then(function(r){return r&&r.result===false?web(s):true;},function(){return web(s);});return web(s);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function manual(s){try{modal('<h2>📋 Скопируй и отправь</h2><p>Выдели текст, скопируй и вставь другу в сообщение:</p>'+
'<textarea id="shrTa" readonly style="width:100%;min-height:120px;font:inherit;font-size:15px;border-radius:12px;padding:8px;box-sizing:border-box">'+esc(s)+'</textarea>'+
'<div class="btns"><button class="btn green" id="shrOk">Готово</button></div>');
var a=$('shrTa');if(a){a.onfocus=a.onclick=function(){a.select();};}$('shrOk').onclick=function(){try{SND.tap();}catch(e){}hideModal();};}catch(e){}}
function fallback(s,msg){return copy(s).then(function(ok){if(ok){t(msg||'Ссылка скопирована — вставь её другу в сообщение');return'copy';}manual(s);return'manual';});}
function isCancel(e){var d=e&&e.error_data||{};return d.error_code===4||/denied|cancel/i.test(String(d.error_reason||d.error_msg||''));}
function post(txt,o){o=o||{};var cb=o.cb||function(){},k=o.k||'',u=o.link!=null?o.link:link(''),full=txt+(u?'\n'+u:'');
if(Date.now()-busy<1500)return;busy=Date.now();
if(vk()||OK&&br()&&VK_REAL&&o.link){var pf=qp('vk_platform'),app=/^mobile_(android|iphone|ipad)/.test(pf),done=0,left=0;
if(!app&&txt)copy(txt);
t(app||!txt?'Открываю «Поделиться»…':'Текст скопирован — вставь его в сообщение после ссылки',app?2000:4500);
var away=function(){left=1;};window.addEventListener('blur',away);document.addEventListener('visibilitychange',away);
var off=function(){window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',away);};
var wd=setTimeout(function(){off();if(done||left)return;done=1;ev(k,'hang');fallback(full,'Если окно не открылось — текст со ссылкой уже скопирован, вставь его другу').then(cb);},8000);
vkSend('VKWebAppShare',{link:u||link(''),text:txt},120000).then(function(){clearTimeout(wd);off();if(done)return;done=1;ev(k,'vk');cb('vk');},
function(e){clearTimeout(wd);off();if(done)return;done=1;if(isCancel(e)){ev(k,'cancel');cb('cancel');return;}
var d=e&&e.error_data||{};ev(k,'err'+(d.error_code||''));fallback(full,'Окно не открылось — текст со ссылкой скопирован, вставь его другу').then(cb);});
return;}
fallback(full,'Скопировано — вставь другу в сообщение').then(function(h){ev(k,h);cb(h);});}
var wfired=0;
function watch(pr,txt){var done=0,left=0,away=function(){left=1;};window.addEventListener('blur',away);document.addEventListener('visibilitychange',away);
var off=function(){window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',away);};
var wd=setTimeout(function(){off();if(done||left)return;wfired=Date.now();ev('soc','hang');fallback(txt,'Если окно не открылось — приглашение уже скопировано, вставь его другу');},8000);
return Promise.resolve(pr).then(function(r){done=1;clearTimeout(wd);off();return r;},function(e){done=1;clearTimeout(wd);off();throw e;});}
function fired(){return Date.now()-wfired<90000;}
return{post:post,copy:copy,fallback:fallback,link:link,manual:manual,isCancel:isCancel,vk:vk,watch:watch,fired:fired};
})();
var SOC=(function(){
var GROUP=241793582,DAY=864e5,VER=2.6;
var GAMES=[
{id:54791564,t:'Выезд со двора',a:6,i:0,g:'p',ok:512004864050},
{id:54787973,t:'Баба Зина: слова из букв',a:0,i:1,g:'p',ok:512005727621},
{id:54791567,t:'Богатырь против нечисти',a:6,i:2,g:'s',ok:512005580574},
{id:54791569,t:'Тридевятая оборона: защита башен',a:6,i:3,g:'s',ok:512005500650},
{id:54791634,t:'Гастроном номер 1',a:0,i:4,g:'p',ok:512005037494},
{id:54792006,t:'Дурак во дворе',a:12,i:5,g:'c',ok:512005141228},
{id:54792009,t:'Косынка во дворе',a:0,i:6,g:'c',ok:512005597603},
{id:54792011,t:'Паук на даче',a:0,i:7,g:'c',ok:512005626567},
{id:54792015,t:'Свободная ячейка в санатории',a:0,i:8,g:'c',ok:512005010476},
{id:54792674,t:'Козёл во дворе',a:12,i:9,g:'c',off:'all',ok:512005062986},
{id:54792676,t:'Кирпичики во дворе',a:0,i:10,g:'p',ok:512005552366},
{id:54794412,t:'Рыбалка с Петровичем',a:0,i:11,g:'r',ok:512005219424},
{id:54794419,t:'Дворовая викторина',a:6,i:12,g:'p',ok:512005471658}
];
var N=GAMES.length;
function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):'';}
var APP=+qp('vk_app_id')||0,PF=qp('vk_platform'),WEB=PF.indexOf('desktop')===0;
var OKP=/[?&](vk_client=ok|vk_platform=[a-z_]*_ok|ok=1)(&|$)/.test(location.search),OKWEB=PF.indexOf('web')>=0;
var st={},O={},T0=Date.now(),asked=false,askedK='',homeOk=null,readyOn=false;
function tx(ru,en){return typeof LANG!=='undefined'&&LANG==='en'?en:ru;}
function nop(){}
function saveFn(){(O.save||nop)();}
function toastFn(t){(O.toast||nop)(t);}
function ok(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&typeof VK!=='undefined'&&!!VK&&APP>0;}
function send(m,p){return vkSend(m,p||{},60000);}
function can(k){if(!ok())return false;
if(k==='more')return list(1).length>0;
if(k==='ntf')return!OKP&&!ntfOn();
if(k==='msg')return!OKP&&!(st.msg&&st.msg.d);
if(!OKP)return k==='home'?!!homeOk:k==='fav'?!(st.fav&&st.fav.d):true;
return k==='inv'||(k==='share'&&!!O.okLink)||(k==='grp'&&!!O.okGroup);}
function me(){for(var i=0;i<N;i++)if(GAMES[i].id===APP)return GAMES[i];return null;}
function done(k){st[k]={d:1};saveFn();}
function tried(k){var x=st[k]||{};x.n=(x.n||0)+1;x.t=Date.now();st[k]=x;saveFn();}
function sx(a,r,n,x){try{if(typeof STAT!=='undefined'&&STAT.ev){var p={a:a,r:r},k;if(n)p.n=n;if(x)for(k in x)if(x[k]!==''&&x[k]!=null)p[k]=x[k];STAT.ev('soc',p);}}catch(e){}}
function sr(a){return function(e){var d=e&&e.error_data||{},r=d.error_code===4||/denied|cancel/i.test(String(d.error_reason||d.error_msg||''))?'no':'err';sx(a,r);
if(r==='err'&&O.fail)try{O.fail(a,e);}catch(x){}};}
function due(k){var x=st[k]||{};return!x.d&&(x.n||0)<3&&(!x.t||Date.now()-x.t>30*DAY);}
function init(S,opt){O=opt||{};if(!S.soc||typeof S.soc!=='object')S.soc={};st=S.soc;
if(!st.ses&&!st.d0)st.d0=nowFn();
st.ses=(st.ses||0)+1;if(!OKP&&qp('vk_is_favorite')==='1')st.fav={d:1};evInit();saveFn();ready();}
function ready(){if(readyOn||!ok())return;readyOn=true;evPlan(8000);ntfSes();
if(!OKP&&PF.indexOf('android')>=0)vkSend('VKWebAppAddToHomeScreenInfo',{},4000).then(function(r){
homeOk=!!(r&&r.is_feature_supported&&!r.is_added_to_home_screen);},function(){homeOk=false;});
else homeOk=false;}
function merge(d){if(!d||typeof d!=='object')return;
for(var k in d){var a=st[k],b=d[k];
if(k==='ses'){if(typeof b==='number'&&b>(st.ses||0))st.ses=b;continue;}
if(k==='ev'){evMerge(b);continue;}
if(k==='d0'){if(+b>0&&(!st.d0||+b<st.d0))st.d0=+b;continue;}
if(!b||typeof b!=='object')continue;
if(!a||typeof a!=='object'){st[k]=b;continue;}
if(a.d||b.d){st[k]={d:1};continue;}
a.n=Math.max(a.n||0,b.n||0);a.t=Math.max(a.t||0,b.t||0);}}
function fav(){return send('VKWebAppAddToFavorites').then(function(r){if(r&&r.result)done('fav');sx('fav',r&&r.result?'ok':'no');return!!(r&&r.result);},function(e){sr('fav')(e);tried('fav');return false;});}
function home(){return send('VKWebAppAddToHomeScreen').then(function(r){if(r&&r.result){done('home');homeOk=false;}sx('home',r&&r.result?'ok':'no');return!!(r&&r.result);},function(e){sr('home')(e);tried('home');return false;});}
function refOn(){return typeof REF!=='undefined'&&!!REF&&typeof REF.on==='function'&&REF.on();}
function invite(){if(OKP)return send('VKWebAppShowInviteBox',{message:O.okMsg||tx('Заходи в игру — посоревнуемся!','Come and play — let us compete!')}).then(function(r){if(r&&r.success!==false)done('inv');sx('inv',r&&r.success!==false?'ok':'no');return true;},function(e){sr('inv')(e);tried('inv');return false;});
if(refOn())return send('VKWebAppShare',{link:REF.link()}).then(function(){done('inv');sx('inv','ok');return true;},function(e){sr('inv')(e);tried('inv');return false;});
return send('VKWebAppShowInviteBox').then(function(r){if(r&&r.success!==false)done('inv');sx('inv',r&&r.success!==false?'ok':'no');return true;},function(e){sr('inv')(e);tried('inv');return false;});}
function share(){if(OKP&&!O.okLink)return Promise.resolve(false);
return send('VKWebAppShare',{link:OKP?O.okLink:refOn()?REF.link():'https://vk.com/app'+APP}).then(function(){sx('shr','ok');return true;},function(e){sr('shr')(e);return false;});}
function group(){if(OKP&&!O.okGroup)return Promise.resolve(false);
return send('VKWebAppJoinGroup',{group_id:OKP?O.okGroup:GROUP}).then(function(r){var y=!!(r&&r.result);if(y)done('grp');sx('grp',y?'ok':'no');if(y)grpRew();return y;},function(e){sr('grp')(e);if(askedK!=='grp')tried('grp');return false;});}
function grpN(){if(OKP||!O.grp||typeof O.grp.give!=='function'||(st.grw&&st.grw.d))return 0;var n=0;try{n=+(typeof O.grp.n==='function'?O.grp.n():O.grp.n)||0;}catch(e){}return n>0?Math.floor(n):0;}
function grpC(){return O.grp&&O.grp.c||'💰';}
function grpPlus(){var n=grpN();return n?' — +'+n+' '+grpC():'';}
function grpRew(){var n=grpN();if(!n)return 0;st.grw={d:1};
try{O.grp.give(n);}catch(e){}saveFn();sx('grp','rew',0,{v:n});
toastFn(O.grp.ok||tx('Спасибо, что с нами! +'+n+' '+grpC(),'Thanks for joining! +'+n+' '+grpC()));return n;}
function msg(){if(OKP)return Promise.resolve(false);
return send('VKWebAppAllowMessagesFromGroup',{group_id:GROUP}).then(function(r){var y=!!(r&&r.result);if(y){done('msg');toastFn(tx('Готово — сообщим о новом','Done — we will let you know'));}sx('msg',y?'ok':'no');return y;},function(e){sr('msg')(e);return false;});}
function open(g){if(OKP)return Promise.resolve(false);
return send('VKWebAppOpenApp',OKP?{app_id:g.ok,app_is_local:true}:{app_id:g.id,location:'from='+APP}).then(function(){return true;},function(){
toastFn(tx('Найдите «'+g.t+'» в разделе «Игры»','Find "'+g.t+'" in the Games section'));return false;});}
function list(n){var m=me(),mg=m?m.g:'',out=[],i,g,day=Math.floor(Date.now()/DAY);
for(i=0;i<N;i++){g=GAMES[i];if(g.id===APP||g.a>=18)continue;
if(g.off==='all'||OKP||(g.off==='web'&&WEB))continue;out.push(g);}
out.sort(function(a,b){var x=(b.g===mg)-(a.g===mg);if(x)return x;return((a.i+day)%N)-((b.i+day)%N);});
return out.slice(0,n||6);}
function css(){if(document.getElementById('socCss'))return;var s=document.createElement('style');s.id='socCss';
s.textContent='.soc-list{margin:6px 0 4px;text-align:left}'+
'.soc-g{display:flex;align-items:center;width:100%;padding:7px 4px;border:0;border-top:1px solid rgba(0,0,0,.08);background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}'+
'.soc-g:first-child{border-top:0}'+
'.soc-ic{width:48px;height:48px;border-radius:11px;flex:none;margin-right:12px;background-color:#ddd;background-repeat:no-repeat;box-shadow:0 1px 3px rgba(0,0,0,.2)}'+
'.soc-t{flex:1;min-width:0;font-weight:700;font-size:17px;line-height:1.2}'+
'.soc-t small{font-weight:800;color:#8a6d4b;margin-left:4px;white-space:nowrap}'+
'.soc-a{font-size:24px;opacity:.5;margin-left:6px}'+
'.soc-box{position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:9999;overflow:auto;padding:12px 16px}'+
'.soc-card{background:#fff;color:#222;border-radius:16px;max-width:420px;margin:0 auto;padding:14px 16px;font:17px/1.3 sans-serif}'+
'.soc-set>*+*{margin-top:8px}'+
'@media (max-height:620px){.soc-g{padding:4px}}'+
'@media (max-height:440px) and (min-width:600px){.soc-list{display:-webkit-box;display:flex;flex-wrap:wrap}.soc-g{width:50%;border-top:0}}';
document.head.appendChild(s);}
function btn(k,label){return'<button class="'+(O.cls||'btn noenter')+'" data-soc="'+k+'">'+label+'</button>';}
function settingsHtml(){if(!ok())return'';
var b=btn('inv',tx('👥 Позвать друзей','👥 Invite friends'));
if(can('share'))b+=btn('share',tx('📤 Поделиться игрой','📤 Share the game'));
if(can('fav'))b+=btn('fav',tx('⭐ В избранное','⭐ Add to favourites'));
if(can('home'))b+=btn('home',tx('📲 На экран телефона','📲 Add to home screen'));
if(can('grp'))b+=btn('grp',tx('📣 Новости двора','📣 Yard news')+grpPlus());
if(can('msg'))b+=btn('msg',tx('🔔 Сообщать о новом','🔔 Tell me what is new'));
if(O.ntf&&can('ntf'))b+=btn('ntf',O.ntf.s||tx('🔔 Напоминания от игры','🔔 Game reminders'));
if(can('more'))b+=btn('more',tx('🎲 Ещё игры во дворе','🎲 More yard games'));
return'<div class="soc-set">'+b+'</div>';}
function bind(root,back){if(!root)return;var bs=root.querySelectorAll('[data-soc]');
for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var k=this.getAttribute('data-soc');
if(k==='inv')invite();else if(k==='share')share();else if(k==='fav')fav().then(function(){if(back)back();});
else if(k==='home')home().then(function(){if(back)back();});else if(k==='ntf')ntf(0).then(function(){if(back)back();});else if(k==='grp')group().then(function(){if(back)back();});else if(k==='msg')msg().then(function(){if(back)back();});else if(k==='more')showMore(back);};}
function showMore(back){if(!can('more'))return;css();var G=list(6),spr=O.sprite||'js/dvor.jpg',h='';
for(var i=0;i<G.length;i++)h+='<button class="soc-g" data-g="'+i+'"><span class="soc-ic" style="background-image:url('+spr+');background-position:'+(-48*G[i].i)+'px 0;background-size:'+(48*N)+'px 48px"></span>'+
'<span class="soc-t">'+G[i].t+(G[i].a>=12?'<small>'+G[i].a+'+</small>':'')+'</span><span class="soc-a">›</span></button>';
var head='<h2>'+tx('Ещё игры во дворе','More yard games')+'</h2>',
foot='<div class="row"><button class="'+(O.cls||'btn noenter')+'" id="socClose">'+(back?tx('← Назад','← Back'):tx('Закрыть','Close'))+'</button></div>',
root,box=null;
if(O.modal)root=O.modal(head+'<div class="soc-list">'+h+'</div>'+foot);
else{box=document.createElement('div');box.className='soc-box';box.id='socBox';
box.innerHTML='<div class="soc-card">'+head+'<div class="soc-list">'+h+'</div>'+foot+'</div>';document.body.appendChild(box);root=box;
box.onclick=function(e){if(e.target===box)close();};}
function close(){if(box){if(box.parentNode)box.parentNode.removeChild(box);}else if(O.close)O.close();}
var c=root.querySelector('#socClose');if(c)c.onclick=function(){if(back&&O.modal)back();else close();};
var rows=root.querySelectorAll('[data-g]');
for(var j=0;j<rows.length;j++)rows[j].onclick=function(){open(G[+this.getAttribute('data-g')]);};}
function offer(wins,busy){if(!ok()||asked||busy||Date.now()-T0<120000)return null;
var o=null;
var nn=ntfDue()&&(wins||0)>=3?ntfN()+1:0,nt=nn?ntfText(nn):'';
if(nn&&nt)o={k:'ntf',n:nn,t:nt,b:O.ntf.b||tx('🔔 Напоминать','🔔 Remind me'),ok:O.ntf.ok||'',run:function(){return ntf(nn);}};
else if((st.ses||0)<2)return null;
else if(can('grp')&&!OKP&&due('grp')){var gn=grpN();o={k:'grp',v:gn,t:tx('Новости и новые игры — в сообществе «Игры во дворе».','News and new games — in the "Yard Games" community.')+(gn?tx(' За вступление — +'+gn+' '+grpC()+'.',' Join and get +'+gn+' '+grpC()+'.'):''),b:tx('📣 Вступить','📣 Join')+grpPlus(),run:group};}
else if(can('fav')&&due('fav'))o={k:'fav',t:tx('Добавьте игру в избранное — будет всегда под рукой.','Add the game to favourites — always at hand.'),b:tx('⭐ В избранное','⭐ Add to favourites'),run:fav};
else if(can('home')&&st.ses>=3&&due('home'))o={k:'home',t:tx('Значок игры на экране — заходить в одно касание.','A game icon on your screen — one tap to play.'),b:tx('📲 На экран телефона','📲 Add to home screen'),run:home};
else if(st.ses>=3&&(wins||0)>=5&&due('inv'))o={k:'inv',t:tx('Позовите друзей — будет с кем посоревноваться.','Invite friends — someone to compete with.'),b:tx('👥 Позвать друзей','👥 Invite friends'),run:invite};
else{var x=st.more||{};if(!x.t||Date.now()-x.t>7*DAY){var g=list(1)[0];
if(g)o={k:'more',t:tx('Попробуйте ещё: «'+g.t+'»'+(g.a>=12?' ('+g.a+'+)':'')+'.','Try another one: "'+g.t+'".'),b:tx('🎲 Открыть','🎲 Open'),run:function(){return open(g);}};}}
if(!o)return null;asked=true;askedK=o.k;sx(o.k,'show',o.n,o.k==='ntf'?{d:ntfDay()}:null);
if(o.k==='more'){st.more={t:Date.now()};saveFn();}
else if(o.k==='ntf'){st.ntf={n:o.n,t:nowFn()};saveFn();}
else tried(o.k);return o;}
var ntfNow=false;
function ntfOn(){var v=qp('vk_are_notifications_enabled');return ntfNow||v==='1'||(v!=='0'&&!!(st.ntf&&st.ntf.d));}
function ntfDay(){return st.d0?Math.max(0,dayNo(nowFn())-dayNo(st.d0)+1):0;}
function ntfSes(){if(!O.ntf||OKP)return;var v=qp('vk_are_notifications_enabled'),d=!!(st.ntf&&st.ntf.d);
if(v==='1')sx('ntf','on',0,{s:'vk'});else if(d)sx('ntf',v==='0'?'off':'on',0,v==='0'?null:{s:'me'});}
var NTF_MAX=3,NTF_DAYS=[1,3,7];
function dayNo(t){var d=new Date(t);return Math.floor((t-d.getTimezoneOffset()*60000)/DAY);}
function nowFn(){var t=0;try{t=+(O.now&&O.now())||0;}catch(e){}return t>0?t:Date.now();}
function ntfN(){return st.ntf&&+st.ntf.n||0;}
function ntfDue(){if(!O.ntf||!can('ntf')||(st.ntf&&st.ntf.d))return false;var n=ntfN();
if(n>=NTF_MAX)return false;if(!n)return true;
var now=dayNo(nowFn()),last=dayNo(+st.ntf.t||0);if(now<=last)return false;
return st.d0?now-dayNo(st.d0)+1>=NTF_DAYS[n]:now-last>=NTF_DAYS[n]-NTF_DAYS[n-1];}
function ntfText(n){var t=O.ntf.t;if(typeof t==='function'){try{t=t(n);}catch(e){t='';}}
return t==null?tx('Напомнить, когда появится что-то новое?','Remind you when there is something new?'):String(t||'');}
function ntf(n){n=+n||0;return send('VKWebAppAllowNotifications').then(function(r){var y=!!(r&&r.result);if(y){done('ntf');ntfNow=true;}sx('ntf',y?'ok':'no',n,{d:ntfDay()});return y;},
function(e){var d=e&&e.error_data||{},c=+d.error_code||0,why=String(d.error_reason||d.error_msg||'');
sx('ntf',c===4||/denied|cancel/i.test(why)?'no':'err',n,{d:ntfDay(),e:c||String(why||(e&&(e.error_type||e.message))||'?').slice(0,24)});return false;});}
var evT=0,evBusy=false,evLast=0,evSes=0,evDead=false,evWait=0,evFails=0,evSkip={},EV_RETRY_DAYS=1;
function evHold(k){var e=evSt(),t=e.f&&+e.f[k]||0;return evSkip[k]||(t>0&&nowFn()-t<EV_RETRY_DAYS*DAY&&nowFn()>=t);}
function evSt(){if(!st.ev||typeof st.ev!=='object')st.ev={};if(!st.ev.m||typeof st.ev.m!=='object')st.ev.m={};return st.ev;}
function evKeep(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&!OKP;}
function evOn(){return ok()&&!OKP&&!!O.evUrl&&!!qp('sign')&&!evDead&&typeof fetch==='function';}
function evNum(code){var n=0;try{n=+(typeof O.evId==='function'?O.evId(code):O.evId&&O.evId[code])||0;}catch(e){}return n>=3?n:0;}
function evStat(a,r,k){try{if(typeof STAT!=='undefined'&&STAT.ev){var p={a:a,r:String(r).slice(0,8)};if(k)p.k=k;STAT.ev('vkev',p);}}catch(e){}}
function evInit(){if(!evKeep())return;evSt();
try{document.addEventListener('visibilitychange',function(){if(document.hidden)evFlush(true);});}catch(e){}}
function evMerge(b){if(!b||typeof b!=='object')return;var e=evSt(),k,i,ks=['l','ls','p','ps'];
for(i=0;i<ks.length;i++){k=ks[i];if(+b[k]>(+e[k]||0))e[k]=+b[k];}
if(b.m&&typeof b.m==='object')for(k in b.m)if(e.m[k]==null||+b.m[k]>+e.m[k])e.m[k]=+b.m[k]===1?1:0;
if(b.f&&typeof b.f==='object'){if(!e.f)e.f={};for(k in b.f)if(+b.f[k]>(+e.f[k]||0))e.f[k]=+b.f[k];}}
function evSet(k,n){if(!evKeep())return;n=Math.floor(+n||0);var e=evSt();if(!(n>(+e[k]||0)))return;e[k]=n;saveFn();evPlan(5000);}
function level(n){evSet('l',n);}
function score(n){evSet('p',n);}
function missionKnown(code){return!evKeep()||evSt().m[code]!=null;}
function mission(code){if(!evKeep()||!code)return false;var e=evSt();if(e.m[code]!=null)return false;e.m[code]=0;saveFn();evPlan(5000);return true;}
function evPick(force){var e=evSt(),out=[],k,n=0,gap=+O.evGap||180000,now=Date.now();
for(k in e.m){if(e.m[k]!==0||evHold(k)||!evNum(k))continue;if(n>=2||evSes+n>=4)break;out.push({m:k,id:evNum(k)});n++;}
if(out.length||!evLast||now-evLast>=(force?30000:gap)){
if((+e.l||0)>(+e.ls||0))out.push({a:1,v:+e.l});
if((+e.p||0)>(+e.ps||0))out.push({a:2,v:+e.p});}
return out;}
function evPlan(ms){if(evT||!evOn())return;var e=evSt(),gap=+O.evGap||180000,left=evLast?evLast+gap-Date.now():0,k,mis=false;
for(k in e.m)if(e.m[k]===0&&!evHold(k)&&evNum(k)&&evSes<4){mis=true;break;}
if(!mis&&!((+e.l||0)>(+e.ls||0)||(+e.p||0)>(+e.ps||0)))return;
evT=setTimeout(function(){evT=0;evFlush();},Math.max(ms||5000,mis?0:left,evWait-Date.now()));}
function evFlush(force){if(evBusy||!evOn()||Date.now()<evWait)return;
try{if(navigator.onLine===false)return;}catch(e){}
var list=evPick(force);if(!list.length)return;evBusy=true;evLast=Date.now();
var fin=false,guard=setTimeout(function(){end(null);},15000);
function end(d){if(fin)return;fin=true;clearTimeout(guard);evBusy=false;evDone(list,d);}
try{fetch(O.evUrl,{method:'POST',mode:'cors',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({app:String(APP),q:location.search,ev:list})})
.then(function(r){return r.json();}).then(function(d){end(d&&typeof d==='object'?d:null);},function(){end(null);});}catch(e){end(null);}}
function evDone(list,d){var e=evSt(),i,x,r,again=false;
if(!d){evFails++;evWait=Date.now()+Math.min(3600000,60000*Math.pow(2,evFails));evStat('req','net');evPlan(5000);return;}
if(!d.ok||!d.r){evDead=true;evStat('req',d.why||'bad');return;}
evFails=0;
for(i=0;i<list.length;i++){x=list[i];r=String(d.r[i]||'net');
if(x.m){evStat('mis',r,x.m);
if(r==='ok'||r==='dup'){e.m[x.m]=1;evSes++;if(e.f)delete e.f[x.m];}
else if(r==='off')evSkip[x.m]=1;
else if(r==='busy'||r==='net')again=true;
else{if(!e.f)e.f={};e.f[x.m]=nowFn();evSkip[x.m]=1;}}
else{evStat(x.a===1?'lvl':'pts',r);
if(r==='busy'||r==='net')again=true;
else if(x.a===1)e.ls=x.v;else e.ps=x.v;}}
saveFn();if(again)evWait=Date.now()+120000;evPlan(20000);}
return{v:VER,ok:ok,isOk:OKP,can:can,init:init,ready:ready,merge:merge,fav:fav,home:home,invite:invite,share:share,group:group,msg:msg,grpN:grpN,open:open,list:list,
settingsHtml:settingsHtml,bind:bind,showMore:showMore,offer:offer,games:GAMES,
ntf:ntf,ntfOn:ntfOn,ntfDue:ntfDue,ntfDay:ntfDay,level:level,score:score,mission:mission,missionKnown:missionKnown,evOn:evOn,evFlush:evFlush};
})();
const EV_URL=(()=>{const m=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&/[?&]evurl=([^&#]*)/.exec(location.search);return m?decodeURIComponent(m[1]):'https://functions.yandexcloud.net/d4e7egf62asn7suf30m0?op=vkev';})();
SOC.init(S,{save:()=>save(),toast:t=>toast(t),cls:'btn ghost',modal:h=>{modal(h);return $('mcard');},close:()=>hideModal(),okLink:OK_LINK,
fail:k=>{if((k==='inv'||k==='shr')&&!SHR.fired())SHR.fallback(socInvTxt(),'Окно не открылось — приглашение скопировано, вставь его другу');},
evUrl:EV_URL,evId:c=>typeof VKM_ID==='object'&&VKM_ID[c]||0,
grp:{n:35,c:'💰',give:n=>addCoins(n,'quest')},
now:()=>nowMs(),
ntf:{t:n=>{if(typeof ZB2N!=='undefined'&&ZB2N.ntfT){const z=ZB2N.ntfT(n);if(z!==null)return z;}
const dly=S.lv>=10,done=!!(S.daily&&S.daily[todayKey()]);
if(n<=1)return done?'Напомнить завтра про новое задание дня?':dly?'Напомнить, когда будет новое задание дня?':'Напомнить, когда приготовлю новый гостинец?';
if(n===2)return done&&(S.streak||0)>=2?'Напомнить, чтобы серия не прервалась?':done?'Напомнить завтра про новое задание дня?':'Напомнить о себе, если соскучусь?';
return'Напоминать изредка про гостинцы и новые слова?';},
b:'🔔 Напоминать',ok:'Хорошо, напомню! Нечасто — я не назойливая.',s:'🔔 Включить напоминания'}});
const VK_CHUNK=900,VK_MAXCH=120,vkSent={};let vkSlot=null,vkBusy=false,vkAgain=false,vkBig=0;
function vkHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
const vkBroken=()=>Object.assign(new Error('broken'),{broken:true});
async function vkSet(k,v){if(vkSent[k]===v)return;delete vkSent[k];await vkSend('VKWebAppStorageSet',{key:k,value:v},8000);vkSent[k]=v;}
async function vkSaveCloud(){if(vkBusy){vkAgain=true;return;}vkBusy=true;
try{do{vkAgain=false;const str=JSON.stringify(S),n=Math.ceil(str.length/VK_CHUNK);if(n>VK_MAXCH){if(!vkBig){vkBig=1;try{STAT.ev('cloud',{a:'big',n:n});}catch(e){}}break;}
const snap=bootSnap(),slot=vkSlot==='a'?'b':'a';
for(let i=0;i<n;i++)await vkSet('sv'+slot+i,str.slice(i*VK_CHUNK,(i+1)*VK_CHUNK));
await vkSet('svn',slot+':'+n+':'+str.length+':'+vkHash(str));vkSlot=slot;synced(snap);
}while(vkAgain);}catch(e){}finally{vkBusy=false;}}
async function vkLoadCloud(){
const r0=await vkSend('VKWebAppStorageGet',{keys:['svn']},8000),p0=((r0&&r0.keys)||[]).find(k=>k.key==='svn'),svn=p0&&p0.value||'';
if(!svn)return null;
let slot='',n=0,len=-1,hash='';
if(/^\d+$/.test(svn))n=+svn;else{const p=svn.split(':');slot=p[0];n=+p[1];len=+p[2];hash=p[3]||'';if(slot!=='a'&&slot!=='b')throw vkBroken();}
if(!(n>0&&n<=VK_MAXCH))throw vkBroken();
const keys=[];for(let i=0;i<n;i++)keys.push('sv'+slot+i);
const r=await vkSend('VKWebAppStorageGet',{keys},8000),m={};((r&&r.keys)||[]).forEach(k=>m[k.key]=k.value);
let str='';for(const k of keys){if(typeof m[k]!=='string'||!m[k])throw vkBroken();str+=m[k];}
if(len>=0&&(str.length!==len||vkHash(str)!==hash))throw vkBroken();
let d;try{d=JSON.parse(str);}catch(e){throw vkBroken();}
if(!isObj(d))throw vkBroken();
for(const k of keys)vkSent[k]=m[k];vkSent.svn=svn;vkSlot=slot||null;return d;}
var VK_FIT={top:130,min:560,max:900,last:0,t:0};
function vkFit(vh){if(!vh||!window.vkBridge)return;
var h=Math.round(Math.max(VK_FIT.min,Math.min(VK_FIT.max,vh-VK_FIT.top)));
if(Math.abs(h-VK_FIT.last)<8)return;VK_FIT.last=h;
var w=Math.max(600,Math.min(1000,window.innerWidth||911));
vkSend('VKWebAppResizeWindow',{width:w,height:h},8000).catch(function(){VK_FIT.last=0;});}
function vkFitInit(){try{
window.vkBridge.subscribe(function(e){var d=e&&e.detail;
if(d&&d.type==='VKWebAppUpdateConfig'&&d.data&&d.data.viewport_height){clearTimeout(VK_FIT.t);
VK_FIT.t=setTimeout(function(){vkFit(d.data.viewport_height);},200);}});
if(!OK)vkSend('VKWebAppGetConfig',{},8000).then(function(c){if(c&&c.viewport_height)vkFit(c.viewport_height);}).catch(function(){});
}catch(e){}}
async function initSDK(){
if(typeof onReady==='function')onReady();
if(PLAT==='vk'){
try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js').catch(function(){return new Promise(function(r){setTimeout(r,1500);}).then(function(){return window.vkBridge||loadScript('js/vk-bridge.min.js?r=2');});});
await vkSend('VKWebAppInit',{},20000);VK=window.vkBridge;adPreload('boot');setTimeout(vkIntLoad,4000);intTick();vkFitInit();SOC.ready();if(typeof updMore==='function')updMore();
VK.subscribe(e=>{const t=e.detail&&e.detail.type;if(t==='VKWebAppViewHide'){setPause('vk',true);clearTimeout(cloudT);cloudT=0;cloudSave();}else if(t==='VKWebAppViewRestore'){setPause('vk',false);if(typeof adBack==='function')adBack();setTimeout(adBackChk,300);}});
Promise.resolve(cloudLoad()).then(payInit,payInit);if(typeof askProbe==='function')askProbe();if(typeof updGift==='function')updGift();
}catch(e){VK=null;}
if(!VK)payInit();
return;
}
if(/[?&]nosdk/.test(location.search))return;
try{await loadScript('/sdk.js');}catch(e){}
if(!window.YaGames){payInit();return;}
try{ysdk=await withTimeout(YaGames.init(),20000);}catch(e){ysdk=null;return;}
try{window.LANG=ysdk.environment.i18n.lang||'ru';}catch(e){window.LANG='ru';}
try{ysdk.on&&ysdk.on('game_api_pause',()=>{setPause('sdk',true);YG.stop();});ysdk.on&&ysdk.on('game_api_resume',()=>{setPause('sdk',false);setTimeout(()=>{if(inPlay())YG.start();},0);});}catch(e){}
try{ysdk.features.LoadingAPI&&ysdk.features.LoadingAPI.ready();}catch(e){}
try{ysdk.getFlags&&ysdk.getFlags().then(f=>{if(typeof applyFlags==='function')applyFlags(f);}).catch(()=>{});}catch(e){}
if(typeof updGift==='function')updGift();
if(inPlay())YG.start();
Promise.resolve(cloudLoad()).then(payInit,payInit);if(typeof askProbe==='function')askProbe();
}
try{ZB2.reg('okpay',{t:'Покупки в Одноклассниках за ОКи',who:'SRV'});}catch(e){}
function okPayOn(){try{return!OK||!(typeof ZB2!=='undefined'&&ZB2.off('okpay'));}catch(e){return!OK;}}
try{ZB2.reg('payios',{t:'VK на iPhone: покупки спрятаны',who:'KIOSK'});}catch(e){}
function payIosOff(){try{if(!VK_IOS||(typeof ZB2!=='undefined'&&ZB2.off('payios')))return false;}catch(e){return false;}return true;}
const VK_IOS=PLAT==='vk'&&!OK&&(/[?&]vk_platform=mobile_ip(hone|ad)/.test(location.search)||/[?&]vkios=1(&|$)/.test(location.search));
function payInit(){if(typeof PAY!=='undefined'&&okPayOn())Promise.resolve(PAY.init()).then(()=>{if(payIosOff()&&PAY.on){PAY.on=false;try{STAT.ev('z3s',{a:'ios'});}catch(e){}try{ZB.refresh();}catch(e){}}},()=>{});}
function stubAd(cb){const ad=$('ad'),tEl=$('adT');adOpen();ad.classList.add('on');let n=3;tEl.textContent=n;
const it=setInterval(()=>{n--;tEl.textContent=n;if(n<=0){clearInterval(it);ad.classList.remove('on');adClose();cb();}},600);}
function adOpen(){setPause('ad',true);YG.stop();}
function adClose(){setPause('ad',false);setTimeout(()=>{if(inPlay())YG.start();},0);}
const AD_RETRY_MS=3000,AD_COOL_MS=30000,AD_COOL_MIN=8000,AD_POLL_MS=5000,AD_BTN_SEL='#mAd,#jfX2:not([disabled]),#mX2:not([disabled]),#mChX2:not([disabled]),#mFix,#btnGift.adg,.thad,#mBox:not([disabled]),#lgAd:not([disabled]),.zbad:not([disabled])';let adCoolT=0,adCoolS=0,adDimT=0,adChkT=0,adRdyT=0;
function adErrCode(e){const d=e&&e.error_data||{};return d.error_code||d.error_reason||(e&&(e.error_type||e.message))||'';}
function adShut(e){const d=e&&e.error_data||{};return+d.error_code===4;}
function adNoFill(e){const d=e&&e.error_data||{};return+d.error_code===20||/no ads?\b/i.test(String(d.error_reason||''));}
function adSoon(){return'Ролик будет через несколько секунд — кнопка загорится, когда он загрузится';}
let AD_STEP=[5000,5000,5000,5000,5000,5000,15000,15000,15000,15000],AD_STEP_MAX=45000,AD_ASK_MIN=3000,AD_FRESH=120000,AD_LOOK_MS=20000;
let adSt=0,adStT=0,adAskT=0,adAsking=0,adAskN=0,adNoN=0,adNoT0=0,adStepN=0,adAskWhy='boot',adMarkT=0,adRdyToastT=0;
function adBtns(){try{return Array.prototype.slice.call(document.querySelectorAll(AD_BTN_SEL));}catch(e){return[];}}
function adLikely(){return!VK||adSt===1&&Date.now()>=adCoolT;}
let adVisT=0;
function adVis(){clearTimeout(adVisT);const no=!adLikely();try{const D=document.documentElement,was=D.classList.contains('adno');D.classList.toggle('adno',no);
if(was&&!no&&typeof fitWin==='function'&&$('modal').classList.contains('on'))fitWin();}catch(e){}
if(no&&Date.now()<adCoolT)adVisT=setTimeout(adVis,adCoolT-Date.now()+50);}
{const so=STAT.offer;STAT.offer=function(){if(!adLikely())return;return so.apply(STAT,arguments);};}
function adWinAsk(){return!!adAsking&&adAskWhy==='win'&&Date.now()-adAskT<5000;}
if(typeof ZB!=='undefined')ZB.on('level',i=>{if(i&&i.ok&&VK&&adSt<1&&!adBusy&&!adW)adPreload('win');});
function adPreload(why){if(!VK)return;adVis();clearTimeout(adChkT);if(typeof why==="string"){adAskWhy=why;adStepN=0;}
if(document.hidden||PR.has('vk')||adW)return;
const now=typeof why==='string'&&why!=='back'&&why!=='look';
if(!now){const wait=adAsking?AD_ASK_MIN:adAskT+AD_ASK_MIN-Date.now();if(wait>0){adChkT=setTimeout(adPreload,wait);return;}}
adAskT=Date.now();const id=adAsking=++adAskN;
vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).then(r=>{if(id!==adAskN)return;adAsking=0;const ok=!!(r&&r.result);STAT.adChk('rew',ok?1:0);adAns(ok);},()=>{if(id!==adAskN)return;adAsking=0;STAT.adChk('rew',0);adAns(null);});}
function adAns(ok){const t=Date.now();
if(ok){if(adNoN)STAT.ev('adchk',{f:'rew',w:Math.round((t-adNoT0)/1000),k:adNoN,s:adAskWhy});
const was=adSt<0&&adNoN>=2;adSt=1;adStT=t;adNoN=0;adStepN=0;adReady();
if(adMark()&&was&&t>=adCoolT&&!adBusy&&t-adRdyToastT>30000){adRdyToastT=t;toast('Ролик готов — можно смотреть');}
return;}
if(ok===false){if(!adNoN)adNoT0=t;adNoN++;adSt=-1;adStT=t;adMark();}
adChkT=setTimeout(adPreload,AD_STEP[adStepN++]||AD_STEP_MAX);}
function adMark(){clearTimeout(adMarkT);const was=document.documentElement.classList.contains('adno');adVis();if(!was||!adLikely())return false;
const q=adBtns();for(let i=0;i<q.length;i++)if(q[i].offsetParent)return true;return false;}
function adBackChk(tick){if(!VK||adBusy||document.hidden||PR.has('vk'))return;
if(adSt<1){if(tick!==1)adPreload('back');else if(Date.now()-adAskT>AD_STEP_MAX+2*AD_ASK_MIN)adPreload();return;}
if(Date.now()-adStT<AD_FRESH)return;const q=adBtns();for(let i=0;i<q.length;i++)if(q[i].offsetParent){adPreload('look');return;}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(adChkT);else setTimeout(adBackChk,300);});
setInterval(()=>adBackChk(1),AD_LOOK_MS);
function adReady(){if(Date.now()>=adCoolT)return;clearTimeout(adRdyT);adRdyT=setTimeout(()=>{if(Date.now()>=adCoolT)return;adCoolT=0;adDim();adVis();let vis=false;try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++)if(q[i].offsetParent)vis=true;}catch(e){}if(vis&&!adBusy)toast('Ролик готов — можно смотреть');},Math.max(0,adCoolS+AD_COOL_MIN-Date.now()));}
function adWait(on,txt,exit){let w=document.getElementById('adWait');if(!on){if(w)w.style.display='none';return;}
if(!w){w=document.createElement('div');w.id='adWait';w.style.cssText='position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,.74);color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;font-weight:800;font-size:20px;line-height:1.35';document.body.appendChild(w);}
w.textContent=txt||'Ролик загружается…';
if(exit){const n=document.createElement('div');n.style.cssText='margin-top:14px;font-weight:600;font-size:16px;max-width:340px';n.textContent='Ролик уже закрыт, а награды нет? Можно не ждать: подтвердится просмотр — награду отдам.';w.appendChild(n);
const b=document.createElement('button');b.id='adExit';b.className='noenter';b.textContent='Продолжить без награды';b.style.cssText='margin-top:18px;min-height:52px;padding:12px 22px;border:0;border-radius:14px;background:#fff;color:#222;font:inherit;font-size:18px;cursor:pointer';b.onclick=exit;w.appendChild(b);}
w.style.display='flex';}
function adDim(){clearTimeout(adDimT);const off=Date.now()<adCoolT;try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++)q[i].style.opacity=off?'.45':'';}catch(e){}if(off)adDimT=setTimeout(adDim,1000);}
function adCool(){adCoolS=Date.now();adCoolT=adCoolS+AD_COOL_MS;if(VK){adSt=-1;adStT=Date.now();}adDim();adVis();adPreload('none');}
let AD_WAIT_MS=180000,AD_SLOW_MS=60000,AD_CHK_MS=1500,AD_EXIT_MS=15000,AD_TAP_MS=5000,AD_LATE_MS=600000;
const AD_CHK='Проверяем просмотр ролика…';
let adW=null,adPl='',adLateC=0;const adLateQ=[];
{const sp=STAT.place;STAT.place=function(p){adPl=String(p||'');return sp.apply(STAT,arguments);};}
function adStat(r,c,ms,x){const p={f:'rew',r:r,p:x&&x.p||adPl||'?',ms:ms};if(c!==''&&c!=null)p.c=String(c).slice(0,24);if(x&&x.dup)p.dup=1;if(x&&x.pr!=null)p.pr=x.pr;STAT.ev('ad',p);}
function adWatch(rel){adUnwatch();const w=adW={t0:Date.now(),back:0,rel:rel};w.tS=setTimeout(adBack,AD_SLOW_MS);w.tW=setTimeout(()=>{if(adW===w)rel('timeout');},AD_WAIT_MS);}
function adUnwatch(){const w=adW;if(!w)return;adW=null;clearTimeout(w.tS);clearTimeout(w.tW);clearTimeout(w.tC);clearTimeout(w.tE);adWait(0);}
function adBack(){const w=adW;if(!w||w.back)return;w.back=Date.now();
w.tC=setTimeout(()=>{if(adW===w)adWait(1,AD_CHK);},AD_CHK_MS);
w.tE=setTimeout(()=>{if(adW===w)adWait(1,AD_CHK,()=>w.rel('exit'));},AD_EXIT_MS);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)adBack();else adLateFlush();});
window.addEventListener('focus',adBack);window.addEventListener('pagehide',adLateFlush);
['pointerdown','touchstart','keydown'].forEach(n=>document.addEventListener(n,()=>{if(adW&&Date.now()-adW.t0>=AD_TAP_MS)adBack();},true));
function adLatePend(rec){adLateQ.push(rec);rec.tF=setTimeout(()=>adLateFin(rec),AD_LATE_MS);}
function adLateFin(rec){if(rec.fin||rec.hold)return;rec.fin=1;clearTimeout(rec.tF);const i=adLateQ.indexOf(rec);if(i>=0)adLateQ.splice(i,1);adStat('err',rec.exit?'exit':'timeout',rec.w,{p:rec.p,pr:rec.pr});}
function adLateFlush(){adLateQ.slice().forEach(adLateFin);}
function adLateEnd(rec,r,c){const dup=rec.fin;rec.fin=1;clearTimeout(rec.tF);const i=adLateQ.indexOf(rec);if(i>=0)adLateQ.splice(i,1);if(dup&&r!=='ok')return;
adStat(r,c,Date.now()-rec.t0,{p:rec.p,dup:dup,pr:rec.pr});}
function adLateCoins(n){n=n>0?n:ECO.adCoins;adLateC=1;addCoins(n,'ad');SND.coin();return'держи монеты: +'+n;}
let adBusy=false;
let adFailWhy='';
function showRewarded(cb0,onFail0,late0){
if(adBusy)return;
if(Date.now()<adCoolT){STAT.ad('rew','hold');toast('Ролик ещё загружается — подожди несколько секунд');adFailWhy='hold';if(onFail0)onFail0();return;}
adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;adWait(0);},AD_WAIT_MS*2+AD_RETRY_MS+15000);
STAT.adReq('rew');
const t0=Date.now(),rec={p:adPl,t0:t0,fin:0};adPl='';if(VK&&adSt)rec.pr=adSt>0?1:0;
let paid=false,st=0;
const cb=()=>{if(paid)return;paid=true;adBusy=false;lastRew=Date.now();cb0();},onFail=w=>{adBusy=false;lastRew=Date.now();adFailWhy=w||'';onFail0&&onFail0();};
const stat=(r,c)=>STAT.ad('rew',r,Date.now()-t0>=AD_SLOW_MS?c||'slow':c,{pr:rec.pr});
const rel=why=>{if(st)return;st=2;rec.w=Date.now()-t0;rec.exit=why==='exit';adUnwatch();adClose();adPreload('exit');
toast(rec.exit?'Хорошо. Подтвердится просмотр — награду отдам':'Не дождалась ответа о просмотре. Придёт — награду отдам',4500);onFail(rec.exit?'exit':'timeout');adDim();adLatePend(rec);};
const lateOk=()=>{if(paid)return;rec.hold=1;if(adBusy||interOn||document.hidden){setTimeout(lateOk,1000);return;}
paid=true;lastRew=Date.now();adLateC=0;let m='';try{m=late0&&late0()||'';}catch(e){}
adLateEnd(rec,'ok',m?(adLateC?'latec':'late'):'late0');if(m)toast('Просмотр подтвердился — '+m,4500);};
if(VK){
let tries=0;
const go=()=>{clearTimeout(adChkT);if(adSt>0){adSt=0;adMark();}adOpen();adWatch(rel);window.vkBridge.send('VKWebAppShowNativeAds',{ad_format:'reward'}).then(r=>{
if(st===2){if(r&&r.result)lateOk();else adLateEnd(rec,'fail','late');return;}
if(st)return;st=1;adUnwatch();adClose();
if(r&&r.result){stat('ok',tries?'retry':'');adPreload('shown');cb();}else{stat('fail','noresult');toast(AD_FAIL);adPreload('fail');onFail('fail');}
},e=>{
if(st===2){adLateEnd(rec,'err','late:'+adErrCode(e));return;}
if(st)return;adUnwatch();
if(adNoFill(e)&&!tries){tries=1;adWait(1);adPreload('retry');setTimeout(()=>{adWait(0);go();},AD_RETRY_MS);return;}
st=1;adClose();const nf=adNoFill(e),sh=!nf&&adShut(e);if(nf){stat('none',adErrCode(e));toast(adSoon());adCool();}else{stat('err',adErrCode(e));toast(sh?AD_CLOSED:AD_FAIL);adPreload('err');}
onFail(nf?'none':sh?'skip':'err');adDim();});};
go();return;}
if(!VK&&!ysdk){if(LOCAL){STAT.ad('rew','ok','stub');stubAd(cb);}else{STAT.ad('rew','fail',PLAT==='vk'?'nobridge':'nosdk');toast(AD_FAIL);onFail('nosdk');}return;}
let got=false;adWatch(rel);
const lateY=f=>{if(!adBusy)adClose();f();};
try{ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
onClose:()=>{if(st===2){lateY(()=>{if(got)lateOk();else adLateEnd(rec,'skip','late');});return;}if(st)return;st=1;adUnwatch();
adClose();stat(got?'ok':'skip','');if(got)cb();else{toast(AD_CLOSED);onFail('skip');}},
onError:()=>{if(st===2){lateY(()=>adLateEnd(rec,'err','late'));return;}if(st)return;st=1;adUnwatch();
adClose();stat('err','');toast(AD_FAIL);adCool();onFail('err');adDim();}}});}
catch(e){if(st)return;st=1;adUnwatch();adClose();stat('err','throw');toast(AD_FAIL);adCool();onFail('err');adDim();}
}
const AD={gap:180,afterRew:90,minLv:8,sess:180};
let lastInter=0,lastRew=0,interOn=false,interNext=null;
function zbTiho(){return!!(S.z2m&&+S.z2m.th>Date.now());}
function interDue(){const now=Date.now();
return!SHOT&&!(typeof PAY!=='undefined'&&PAY.own('no_ads'))&&!zbTiho()&&!!(ysdk||VK||LOCAL)&&S.lv>=AD.minLv&&now-T0>=AD.sess*1000&&now-lastInter>=AD.gap*1000&&now-lastRew>=AD.afterRew*1000;}
function interWhy(){if(SHOT||(typeof PAY!=='undefined'&&PAY.own('no_ads'))||zbTiho()||S.lv<AD.minLv||Date.now()-T0<AD.sess*1000)return;
const c=!(ysdk||VK||LOCAL)?'nosdk':Date.now()-lastInter<AD.gap*1000?'gap':'cap';STAT.ad('int','none',c);}
let INT_PAUSE_MS=60000;
let vkIntOk=null,vkIntT=0,vkIntBusy=0,intFails=0,intPauseT=0;
function vkIntLoad(){if(!VK||document.hidden||vkIntBusy)return;vkIntBusy=1;vkIntT=Date.now();
vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'},5000).then(r=>!!(r&&r.result),()=>false).then(ok=>{vkIntBusy=0;vkIntOk=ok;vkIntT=Date.now();STAT.adChk('int',ok?1:0);});}
function intPre(){if(!VK)return true;const now=Date.now();
if(now<intPauseT){STAT.ad('int','none','pause');return false;}
if(vkIntOk===false){STAT.ad('int','none','pre');if(!ADBG&&now-vkIntT>=60000)vkIntLoad();return false;}
return true;}
function intRes(ok){if(ok){intFails=0;return;}if(++intFails>=2){intFails=0;intPauseT=Date.now()+INT_PAUSE_MS;}}
const ADBG=typeof ZB2==='undefined'||ZB2.reg('adbg',{t:'Межэкранная: фон, ошибка 10',who:'TECH'});
if(typeof ZB2!=='undefined')ZB2.reg('int6',{t:'Межэкранная после мини-игры',who:'TECH'});
let INT_POLL_MS=30000,INT_PRE_MS=15000,INT_E10_MS=180000,INT_TICK_MS=5000,intTickT=0;
function intWant(){return!!VK&&!SHOT&&!(typeof PAY!=='undefined'&&PAY.own('no_ads'))&&!zbTiho()&&S.lv>=AD.minLv;}
function intPoll(){if(!VK||document.hidden||interOn||adBusy||vkIntBusy||!intWant())return;const now=Date.now();
if(now<intPauseT)return;
if(vkIntOk===false&&now-vkIntT>=INT_POLL_MS){vkIntLoad();return;}
const due=Math.max(lastInter+AD.gap*1000,lastRew+AD.afterRew*1000,T0+AD.sess*1000,intPauseT);
if(now>=due-INT_PRE_MS&&now<due+INT_POLL_MS&&vkIntT<due-INT_PRE_MS)vkIntLoad();}
function intTick(){if(intTickT||!VK||!ADBG)return;intTickT=setInterval(()=>{try{intPoll();}catch(e){}},INT_TICK_MS);}
function intErr10(e){return ADBG&&+adErrCode(e)===10;}
function intMgBack(opt){const b0=opt&&opt.back;if(typeof b0!=='function'||b0.__zi||opt.mode==='win'||(typeof ZB2!=='undefined'&&ZB2.off('int6')))return opt;
const b=function(r){if(r)maybeInterstitial(()=>b0(r));else b0(r);};b.__zi=1;return Object.assign({},opt,{back:b});}
function maybeInterstitial(cb){
if(interOn){interNext=cb;return;}
S.plays=(S.plays||0)+1;
if(!interDue()){interWhy();cb();return;}
if(!intPre()){cb();return;}
const prev=lastInter;lastInter=Date.now();interOn=true;const done=()=>{interOn=false;const f=interNext||cb;interNext=null;f();};
if(!ysdk&&!VK&&!LOCAL){lastInter=prev;interOn=false;STAT.ad('int','none','nosdk');cb();return;}
STAT.adReq('int');
if(VK){const fin=()=>{adClose();done();setTimeout(vkIntLoad,3000);};adOpen();vkIntOk=null;vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(r=>{if(r&&r.result)STAT.ad('int','show');else STAT.ad('int','none','nofill');if(!(r&&r.result))lastInter=prev;intRes(!!(r&&r.result));}).catch(e=>{if(intErr10(e)){STAT.ad('int','none','e10');lastInter=prev;intFails=0;intPauseT=Date.now()+INT_E10_MS;vkIntOk=false;vkIntT=Date.now();return;}
if(adNoFill(e))STAT.ad('int','none','nofill');else STAT.ad('int','err',adErrCode(e));lastInter=prev;intRes(false);})
.then(fin,fin);return;}
if(!ysdk&&LOCAL){STAT.ad('int','show','stub');stubAd(done);return;}
let fin=0,wd=0,opened=0;const end=(r,c)=>{if(fin)return;fin=1;clearTimeout(wd);STAT.ad('int',r,c);if(r!=='show'&&!opened)lastInter=prev;adClose();done();};
wd=setTimeout(()=>end('err','wd'),8000);
try{ysdk.adv.showFullscreenAdv({callbacks:{onOpen:()=>{opened=1;clearTimeout(wd);adOpen();if(!fin)wd=setTimeout(()=>end('err','wd2'),120000);},
onClose:shown=>{if(fin){adClose();return;}if(shown!==false)end('show');else end('none','nofill');},
onError:()=>{if(fin){adClose();return;}end('err','sdk');}}});}catch(e){end('err','throw');}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cloudHid=Date.now();setPause('hidden',true);YG.stop();clearTimeout(cloudT);cloudT=0;cloudSave(true);}else{if(cloudHid&&Date.now()-cloudHid>=60000)setTimeout(cloudRe,800);cloudHid=0;setPause('hidden',false);setTimeout(()=>{if(inPlay())YG.start();},0);}});
let AC=null,OUT=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();
const c=AC.createDynamicsCompressor();c.threshold.value=-14;c.knee.value=8;c.ratio.value=4;c.attack.value=.004;c.release.value=.2;
OUT=AC.createGain();OUT.gain.value=.9;OUT.connect(c);c.connect(AC.destination);}catch(e){AC=null;}}
if(AC&&AC.state!=='running'&&!muted)AC.resume().catch(()=>{});return AC;}
function tone(f,d,type,v,f2,delay){if(!S.sound||muted)return;const a=ac();if(!a)return;const t=a.currentTime+(delay||0);
const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.12,t+.012);g.gain.exponentialRampToValueAtTime(.0008,t+d);
o.connect(g).connect(OUT);o.start(t);o.stop(t+d+.03);}
const CAN_VIB=typeof navigator.vibrate==='function';
function buzz(kind){if(S.vib===0||paused)return;
if(PLAT==='vk'&&VK&&VK_MOBILE&&!OK){vkSend(kind==='bad'?'VKWebAppTapticNotificationOccurred':'VKWebAppTapticImpactOccurred',
kind==='bad'?{type:'warning'}:{style:kind==='long'||kind==='win'?'medium':'light'},1500).catch(()=>{});return;}
if(CAN_VIB&&!(navigator.userActivation&&!navigator.userActivation.hasBeenActive))try{navigator.vibrate(kind==='long'?[18,60,30]:kind==='win'?[25,70,25,70,45]:kind==='bad'?[35]:14);}catch(e){}}
const CALM=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const NOTES=[523.25,587.33,659.25,698.46,783.99,880,987.77,1046.5,1174.66];
const SND={
letter(i){tone(NOTES[Math.min(i,8)],.16,'triangle',.13);},
word(n,combo){const up=Math.pow(2,Math.min(combo||0,6)/12),seq=n>=5?[0,2,4,7]:[0,2,4];
seq.forEach((k,i)=>tone(NOTES[k]*up,.22,'triangle',.11,0,i*.07));
if(n>=7){const t=seq.length*.07+.02;[NOTES[4],NOTES[7],NOTES[7]*1.26].forEach(f=>tone(f*up,.5,'triangle',.07,0,t));}
else if(n>=5)tone(NOTES[8]*up,.3,'sine',.06,0,seq.length*.07);},
bonus(){tone(1318,.12,'sine',.1,0,0);tone(1760,.2,'sine',.09,0,.08);},
bad(){tone(220,.22,'sawtooth',.05,150);tone(185,.25,'square',.03,120,.05);},
old(){tone(440,.12,'sine',.08);tone(440,.12,'sine',.08,0,.14);},
open(){tone(1567,.1,'sine',.07);},
win(){[0,2,4,7,4,7].forEach((n,i)=>tone(NOTES[n]*(i>3?2:1),.3,'triangle',.11,0,i*.11));},
coin(){tone(1975,.08,'square',.04);tone(2637,.14,'square',.04,0,.06);},
tap(){tone(700,.05,'sine',.06);},
shuffle(){for(let i=0;i<5;i++)tone(400+i*90,.05,'triangle',.05,0,i*.035);},
meow(){tone(700,.35,'sawtooth',.03,1100);tone(1100,.25,'triangle',.05,600,.2);}
};
let unlocked=false;
function unlockAudio(){if(!S.music&&!S.sound)return;const a=ac();if(!a)return;
if(!unlocked){unlocked=true;try{const s=a.createBufferSource();s.buffer=a.createBuffer(1,1,22050);s.connect(a.destination);s.start(0);}catch(e){}}
if(typeof musPrime==='function')musPrime();}
['pointerdown','touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
const MUSF={tea:'audio/tea.m4a'},MUS_VOL=.2;
const MUS={el:null,g:null,ok:0,bad:0,on:0,t:0};
function musWant(){return S.music&&!muted&&!paused&&!document.hidden?'tea':null;}
function musEl(){if(MUS.el||MUS.bad||window.NO_MUSIC||!AC||!OUT)return MUS.el;
try{const a=new Audio();a.loop=true;a.preload='auto';a.setAttribute('playsinline','');a.setAttribute('webkit-playsinline','');
a.addEventListener('error',()=>{MUS.bad=1;MUS.on=0;try{STAT.ev('mus',{a:'err',c:a.error&&a.error.code||0});}catch(e){}});a.src=MUSF.tea;
const src=AC.createMediaElementSource(a),g=AC.createGain();g.gain.value=0;src.connect(g).connect(OUT);MUS.el=a;MUS.g=g;}catch(e){MUS.bad=1;}
return MUS.el;}
function musFade(to,dur){const g=MUS.g;if(!g||!AC)return;try{const t=AC.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(to,t+dur);}catch(e){}}
function musGo(){const a=MUS.el;if(!a)return;try{const p=a.play();if(p&&p.then)p.then(()=>{MUS.ok=1;},()=>{});else MUS.ok=1;}catch(e){}}
function musPrime(){if(!S.music||!AC||MUS.bad)return;const a=musEl();if(!a)return;if(MUS.ok&&!(musWant()&&a.paused))return;
try{const p=a.play();if(p&&p.then)p.then(()=>{MUS.ok=1;if(!MUS.on)a.pause();},()=>{});}catch(e){}}
function musTick(){if(!AC)return;const n=musWant(),run=AC.state==='running';
if(n&&!run)AC.resume().catch(()=>{});
if(!n||!run){if(MUS.on){MUS.on=0;const a=MUS.el;musFade(0,.05);if(a)setTimeout(()=>{if(!MUS.on)a.pause();},80);}return;}
const a=musEl();if(!a)return;
if(!MUS.on){MUS.on=1;MUS.t=Date.now();musGo();musFade(MUS_VOL,1.2);return;}
if(a.paused&&Date.now()-MUS.t>3000){MUS.t=Date.now();musGo();}}
setInterval(musTick,200);
document.addEventListener('click',musPrime,{passive:true});
