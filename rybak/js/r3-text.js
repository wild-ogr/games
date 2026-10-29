(function(){var E0={k:{},sc:{},g:{fish:{},place:{}}};function Dget(){return window.R3T_DATA||window.R3T_DATA0||E0;}
var D=Dget(),lst=0,lcb=[];function full(){if(window.R3T_DATA){D=window.R3T_DATA;return true;}D=Dget();return false;}
function want(){if(!ru())return false;try{if(typeof R3==='object'&&R3&&!R3.on)return false;}catch(e){}return true;}
function done(){full();var a=lcb;lcb=[];for(var i=0;i<a.length;i++)try{a[i]();}catch(e){}}
function load(cb){if(cb)lcb.push(cb);if(full())return done();if(lst||!want())return;lst=1;try{var sc=document.createElement('script');sc.src='js/r3-text-data.js';sc.async=true;sc.onload=function(){lst=2;done();};sc.onerror=function(){lst=0;};(document.head||document.documentElement).appendChild(sc);}catch(e){lst=0;}}
function auto(){setTimeout(function(){load();},600);}
try{if(document.readyState==='complete')auto();else window.addEventListener('load',auto);}catch(e){}
var WHO={p:'Петрович',w:'Жена',k:'Кум',m:'Дед Митяй',c:'Васька',z:'Жора',v:'Тётя Валя',h:'Михалыч',s:'Баба Шура',t:'Тётя Валя',n:'Зина'};var SEEN_KEY='r3t-seen',seen=null;function ls(){if(seen)return seen;seen={};try{var s=localStorage.getItem(SEEN_KEY);if(s)seen=JSON.parse(s)||{};}catch(e){seen={};}return seen;}
function save(){try{localStorage.setItem(SEEN_KEY,JSON.stringify(seen));}catch(e){}}
function ru(){return typeof LANG==='undefined'||LANG!=='en';}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
function w(kg){if(typeof kg!=='number'||!(kg>0))return null;if(kg<1)return Math.max(5,Math.round(kg*100)*10)+' г';var v=kg<10?Math.round(kg*10)/10:Math.round(kg);return String(v).replace('.',',')+' кг';}
function fill(t,c){c=c||{};full();var ok=true,F=c.fish&&D.g.fish[c.fish],P=c.place&&D.g.place[c.place];var out=t.replace(/\{([^}]*)\}/g,function(m,k){var v=null;if(k.indexOf('g:')===0){if(F){var a=k.slice(2).split('|');v=a[F[3]==='f'?1:F[3]==='n'?2:0];if(v==null)v=a[0];}}
else if(k==='fish')v=F&&F[0];else if(k==='Fish')v=F&&cap(F[0]);else if(k==='fish_a')v=F&&F[1];else if(k==='fish_g')v=F&&F[2];else if(k==='place')v=P&&P[0];else if(k==='Place')v=P&&cap(P[0]);else if(k==='place_p')v=P&&P[1];else if(k==='w')v=w(c.w);else if(k==='w2')v=w(typeof c.w2==='number'?c.w2:(typeof c.w==='number'?c.w*(1+.25*Math.max(1,c.k||1)):null));else if(k==='name')v=c.name||'сосед';else if(k==='n'||k==='days')v=c[k]!=null?String(c[k]):null;else v=c[k]!=null&&c[k]!==''?String(c[k]):null;if(v==null)ok=false;return v==null?'':v;});return ok?out:null;}
function pick(key,c){if(!ru())return null;full();var a=D.k[key];if(!a||!a.length){if(!window.R3T_DATA)load();return null;}
var S=ls(),h=S[key]||[],keep=Math.min(30,a.length-1),idx=[],i;for(i=0;i<a.length;i++)if(h.indexOf(i)<0)idx.push(i);if(!idx.length){h=[];for(i=0;i<a.length;i++)idx.push(i);}
while(idx.length){var j=Math.floor(Math.random()*idx.length),n=idx[j],t=fill(a[n],c);if(t!=null){h.push(n);while(h.length>keep)h.shift();S[key]=h;save();R3T.last={key:key,i:n};return t;}
idx.splice(j,1);}
return null;}
function any(keys,c){for(var i=0;i<keys.length;i++){var t=pick(keys[i],c);if(t!=null)return t;}return null;}
function scene(id,c){if(!ru())return null;full();var s=D.sc[id];if(!s){if(!window.R3T_DATA)load();return null;}var r=[];for(var i=0;i<s.length;i++){var t=fill(s[i][1],c);if(t==null)return null;r.push([s[i][0],t]);}
R3T.last={key:id,i:0};return r;}
function keys(p){full();var r=[];for(var k in D.k)if(!p||k.indexOf(p)===0)r.push(k);return r;}
function scenes(p){full();var r=[];for(var k in D.sc)if(!p||k.indexOf(p)===0)r.push(k);return r;}
var R3T={load:load,ready:function(cb){load(cb);},full:full,pick:pick,any:any,scene:scene,fill:fill,w:w,keys:keys,scenes:scenes,WHO:WHO,last:null,has:function(k){full();return!!(D.k[k]&&D.k[k].length);},n:function(k){full();return D.k[k]?D.k[k].length:0;}};window.R3T=R3T;})();