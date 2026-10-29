(function(){'use strict';
var W=window;if(!W.V3||!V3.reg('stat',{s:'V3-CORE',t:'STAT 3.0: касания, мимо, уход, метки, 😂/😐'}))return;
function st(n,p){try{if(typeof STAT==='object'&&STAT&&STAT.ev){var o={},k;for(k in p)if(p[k]!==undefined&&p[k]!==null&&p[k]!=='')o[k]=p[k];STAT.ev(n,o);}}catch(e){}}
function g(){try{return typeof G!=='undefined'?G:null;}catch(e){return null;}}
var y={g:null,t:0,mi:0,t0:0,left:0};
function reset(){y.g=g();y.t=0;y.mi=0;y.t0=Date.now();y.left=0;}
function wrapTap(){if(typeof tapAt!=='function'||tapAt.__v3)return false;var f=tapAt;
var w=function(){var G0=g(),mv=G0?G0.moves:0,tw=G0&&G0.towMode;var r=f.apply(this,arguments);
try{if(G0&&!G0.over){if(y.g!==G0)reset();y.t++;var G1=g();if(G1===G0&&G0.moves===mv&&!tw&&!G0.towMode)y.mi++;}}catch(e){}return r;};
w.__v3=1;w.__orig=f;tapAt=w;return true;}
if(!wrapTap())document.addEventListener('DOMContentLoaded',wrapTap);
V3.sub('yard-start',function(){reset();},'stat');
V3.sub('yard',function(i){if(!i)return;var e=i.end==='quit'?'q':i.end==='restart'?'r':i.end==='lose'?'l':'';
st('yt',{l:i.lv,ok:i.ok?1:0,e:e,t:y.t,mi:y.mi,s:i.sec,mv:i.moves});reset();},'stat');
V3.sub('leave',function(){var G0=g();if(!G0||G0.over||y.left)return;try{if(!document.getElementById('scr-game').classList.contains('on'))return;}catch(e){return;}
y.left=1;V3.ev('leave',{l:G0.daily?0:G0.idx+1,s:Math.round((Date.now()-(y.t0||Date.now()))/1000),t:y.t,mv:G0.moves,m:G0.daily?'daily':(G0.mode&&G0.mode!=='n'?G0.mode:'')});},'stat');
var src=null;
(function(){var h='';try{h=String(location.hash||'').replace(/^#/,'');}catch(e){}
if(!h){try{var m=/[?&]hash=([^&]*)/.exec(location.search);if(m)h=decodeURIComponent(m[1]).replace(/^#/,'');}catch(e){}}
if(!h)return;var k='',v='';
if(/^f_/.test(h)){k='f';v=h.slice(2);}else if(/(^|&)help=/.test(h)){k='help';v=(/(^|&)y=(\d+)/.exec(h)||[])[2]||'';}else if(/(^|&)y=\d+/.test(h)){k='y';v=h;}
if(!k)return;src={k:k,v:String(v).replace(/[^0-9A-Za-z_.=&-]/g,'').slice(0,24)};})();
V3.src=src;
V3.sub('boot',function(){if(!src)return;V3.ev('src',src);try{if(S.v3&&!S.v3.src){S.v3.src=src.k;}}catch(e){}});
var seen={},voted={};
V3.joke=function(id,v,w){id=String(id||'').slice(0,24);if(!id||voted[id])return false;voted[id]=1;st('joke',{id:id,v:v?1:0,w:w||''});return true;};
V3.jokeSeen=function(id,w){id=String(id||'').slice(0,24);if(!id||seen[id])return;seen[id]=1;st('jk',{id:id,w:w||''});};
V3.jokeHtml=function(id,w){id=String(id||'').slice(0,24);V3.jokeSeen(id,w);var d=voted[id]?' disabled':'';
return'<span class="v3jk" data-v3jk="'+id+'" data-w="'+(w||'')+'"><button type="button" class="v3jkb noenter" data-v="1" aria-label="😂"'+d+'>😂</button><button type="button" class="v3jkb noenter" data-v="0" aria-label="😐"'+d+'>😐</button></span>';};
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('.v3jkb'):null;if(!b)return;var p=b.parentNode;if(!p)return;
if(V3.joke(p.getAttribute('data-v3jk'),b.getAttribute('data-v')==='1',p.getAttribute('data-w'))){b.classList.add('on');var q=p.querySelectorAll('button');for(var i=0;i<q.length;i++)q[i].disabled=true;}},true);
try{var cs=document.createElement('style');cs.textContent='.v3jk{display:inline-flex;gap:6px;vertical-align:middle;margin-left:6px}.v3jkb{border:0;background:rgba(23,50,74,.08);border-radius:12px;min-width:40px;min-height:36px;font-size:18px;line-height:1;padding:4px 8px;cursor:pointer}.v3jkb.on{background:#ffd75e}.v3jkb[disabled]{opacity:.55}.v3jkb.on[disabled]{opacity:1}';document.head.appendChild(cs);}catch(e){}
V3.subEv=function(k,r){V3.ev('sub',{k:String(k||'').slice(0,12),r:String(r||'on').slice(0,6)});};
V3.statY=function(){return{t:y.t,mi:y.mi};};
})();