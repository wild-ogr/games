'use strict';
/* gb-EN: слой перевода буста. В ?lang=en переводит текст (DOM, атрибуты, холст, реплики GBT) по словарю js/gb-en-dict.js (ленивая загрузка только в en),
   что не переведено — прячет (в en русского нет). ru/VK — не трогает. Промахи: GBEN.miss */
(function(){
var RU=/[Ѐ-ӿ]/,D=null,keys=null,re=null,cache=new Map(),miss=[],loading=false,done=new Set(),ATTR=['title','aria-label','placeholder','alt'];
function isEn(){return typeof LANG!=='undefined'&&LANG==='en';}
function nrm(s){return s.replace(/[ \s]+/g,' ');}
function build(){var k=Object.keys(D),N={},i;for(i=0;i<k.length;i++){var n=nrm(k[i]);if(!(n in N))N[n]=D[k[i]];var t=n.replace(/^ | $/g,'');if(t!==n&&t&&!(t in N))N[t]=D[k[i]].replace(/^\s+|\s+$/g,'');}D=N;
  keys=Object.keys(D).filter(function(x){return x.replace(/[^Ѐ-ӿ]/g,'').length>=2;}).sort(function(a,b){return b.length-a.length;});
  tpl();re=new RegExp(keys.map(function(x){return x.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');}).join('|'),'g');}
var CY=/[Ѐ-ӿ]/;
var TP=[];
function tpl(){TP=[];Object.keys(D).forEach(function(k){if(!/\{\w+\}/.test(k)||/\{[^}]*\|/.test(k))return;
  var q=k.replace(/[.*+?^$()|[\]\\\/]/g,'\\$&').replace(/\{(\w+)\}/g,'(.+?)');try{TP.push({r:new RegExp('^'+q+'$'),e:D[k]});}catch(e){}});
  TP.sort(function(a,b){return b.r.source.length-a.r.source.length;});}
function tplTr(c){for(var i=0;i<TP.length;i++){var m=TP[i].r.exec(c);if(m){var j=0;return TP[i].e.replace(/\{\w+\}/g,function(){j++;var v=m[j]||'';return CY.test(v)?tr(v):v;});}}return null;}
function one(core){var r,m=/^([\u00ab\u201c"]?)(.*?)([\u00bb\u201d"]?)$/.exec(core);
  if(D[core]!==undefined)return D[core];
  if(TP.length&&(r=tplTr(core))!==null)return r;
  r=core.replace(re,function(m,off,str){var a=str.charAt(off-1),b=str.charAt(off+m.length),f=m.charAt(0),l=m.charAt(m.length-1);
    if((CY.test(f)&&CY.test(a))||(CY.test(l)&&CY.test(b)))return m;return D[m];});
  if(CY.test(r)&&core.charAt(0)==='\u00ab'&&core.charAt(core.length-1)==='\u00bb'){var q=one(core.slice(1,-1));if(!CY.test(q))return '\u201c'+q+'\u201d';}
  return r;}
function tr(s){ // -> переведённая строка; '' если перевести нельзя
  if(typeof s!=='string'||!RU.test(s))return s;
  if(!D)return s;
  var c=cache.get(s);if(c!==undefined)return c;
  var lead=(/^\s*/.exec(s)||[''])[0],trail=(/\s*$/.exec(s)||[''])[0],core=nrm(s.slice(lead.length,s.length-trail.length)),r;
  r=one(core);
  if(CY.test(r)){var ps=core.match(/[^.!?\u2026]+[.!?\u2026]*\s*/g),ok=ps&&ps.length>1,o=[];
    if(ok)for(var q=0;q<ps.length;q++){var x=one(nrm(ps[q]).replace(/^\s+|\s+$/g,''));if(CY.test(x)){ok=false;break;}o.push(x);}
    if(ok)r=o.join(' ');}
  if(CY.test(r)){r='';if(miss.length<2000&&miss.indexOf(core)<0)miss.push(core);}
  else r=(lead?' ':'')+r+(trail?' ':'');
  if(cache.size>20000)cache.clear();r=fx(r);cache.set(s,r);return r;}

// правки английского (после перевода и для английских строк основной игры): единые термины, лишние слова, кавычки
var FIX=[[/\bmore (\d+) more\b/g,'$1 more'],[/(\d+) more to the stamp/g,'$1 more for the stamp'],[/Enough for:/g,'You can afford:'],[/\bHaggle\b/g,'Trade Office'],[/\bSpice cakes\b/g,'Gingerbread'],[/\bspice cakes\b/g,'gingerbread'],[/\bgingerbreads\b/g,'gingerbread'],
  [/\bKiev\b/g,'Kyiv'],[/\bMoskva\b/g,'Moscow'],[/\bThank-yous\b/g,'Thank-you notes'],[/\bthank-yous\b/g,'thank-you notes'],[/\bSpare table/g,'Extra table'],[/\bin (\d+) day\(s\) of play/g,'unlocks after $1 days of play'],
  [/\bRare Goods collection\b/g,'Rare goods collection'],[/Two Hundred Grams of Doctor's Sausage/g,"200 g of Doctor's Sausage"],[/Spot the Differences on the Counter/g,'Spot the Difference'],[/What's in the Paper Cone\?/g,'Paper Cone'],
  [/Purchases for the store and Aunt Valya's? shop/g,'For the store & Aunt Valya'],[/«/g,'“'],[/»/g,'”']];
function fx(t){if(!/[A-Za-z«»]/.test(t))return t;for(var i=0;i<FIX.length;i++)t=t.replace(FIX[i][0],FIX[i][1]);return t;}
function text(n){var d=n.data;if(!RU.test(d)){if(isEn()){var f=fx(d);if(f!==d){n.data=f;}}return;}var pt=n.parentNode&&n.parentNode.tagName;if(pt==='SCRIPT'||pt==='STYLE')return;var r=fx(tr(d));if(r!==d){n.data=r;done.add(n);}}
function attrs(e){for(var i=0;i<ATTR.length;i++){var v=e.getAttribute&&e.getAttribute(ATTR[i]);if(v&&RU.test(v)){var r=tr(v);if(r!==v){if(!e.__gbo)e.__gbo={};e.__gbo[ATTR[i]]=v;e.setAttribute(ATTR[i],r);}}}}
function walk(n){if(!n)return;if(n.nodeType===3){text(n);return;}if(n.nodeType!==1)return;var t=n.tagName;if(t==='SCRIPT'||t==='STYLE')return;
  attrs(n);
  if(n.firstElementChild&&n.innerHTML.length<1500&&RU.test(n.innerHTML)){var h=D[nrm(n.innerHTML)];if(h!==undefined&&!CY.test(h)){n.innerHTML=h;return;}}for(var c=n.firstChild;c;c=c.nextSibling)walk(c);}
var mo=null,busy=false;
function onMut(list){if(!isEn()||!D)return;busy=true;try{for(var i=0;i<list.length;i++){var m=list[i];
  if(m.type==='characterData')text(m.target);else if(m.type==='attributes')attrs(m.target);else{if(m.target&&m.target.nodeType===1&&m.target.innerHTML.length<1500&&RU.test(m.target.innerHTML)){var hh=D[nrm(m.target.innerHTML)];if(hh!==undefined&&!CY.test(hh)){m.target.innerHTML=hh;continue;}}for(var j=0;j<m.addedNodes.length;j++)walk(m.addedNodes[j]);}}}catch(e){}busy=false;}
function start(){if(mo||!document.body)return;mo=new MutationObserver(onMut);mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});
  if(isEn()&&D)walk(document.body);}
function load(){if(loading||D||!isEn())return;loading=true;var s=document.createElement('script');s.src='js/gb-en-dict.js';s.onerror=function(){loading=false;};document.head.appendChild(s);}
var G=window.GBEN={tr:tr,miss:miss,on:isEn,
  ready:function(){if(window.GBEN_D&&!D){D=window.GBEN_D;build();start();if(isEn()&&document.body){walk(document.body);try{if(window.GMG)GMG.enOk=true;if(window.GBMD&&window.GBEN_MODE)GBMD.EN=window.GBEN_MODE;}catch(e){}try{if(typeof setLang==='function')setLang('en',true);}catch(e){}if(window.GB&&GB.refresh)try{GB.refresh();}catch(e){}}}},
  sync:function(){if(isEn()){load();if(D)walk(document.body);}}};
// договор META/OBST: GB_EN['рус'] -> английский (нет — '' = прячут)
try{window.GB_EN=new Proxy({},{get:function(t,k){if(typeof k!=='string'||!D)return undefined;var r=tr(k);return r||undefined;},has:function(t,k){return !!D;}});}catch(e){}
// холст
var P=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
if(P)['fillText','strokeText','measureText'].forEach(function(k){var o=P[k];if(!o)return;P[k]=function(t){if(isEn()&&typeof t==='string'&&RU.test(t)){arguments[0]=tr(t);}return o.apply(this,arguments);};});
function init(){start();if(isEn())load();
  setInterval(function(){if(isEn()){if(!D)load();}else if(done.size){done.clear();}},1500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
