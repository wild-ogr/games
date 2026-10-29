'use strict';
(function(){
if(!window.Z3)return;
var Z=window.Z4={},so=0,sf=ZB.safe;try{so=localStorage.getItem('z4-off')==='1';}catch(e){}Z.soff=so;
ZB2.reg('zb4',{t:'Zina 4.0',who:'BASE',on:!so});
var ON=Z.on=!!Z3.on&&!ZB2.off('zb4');
Z.reg=function(id,o){var r=ZB2.reg(id,o),i=id.indexOf('.');return ON&&r&&!(i>0&&ZB2.off(id.slice(0,i)));};
Z.field=function(k,o){return/^z4[a-z]$/.test(k)?ZB2.field(k,o):console.error('[zb4] '+k);};
Z.day=function(){return Z3.day();};Z.OPEN={};Z.open=function(id){var d=Z.OPEN[id];return ON&&Z.day()>=(d==null?4:d);};
var la={};
Z.txt=function(k,c){var L=window.Z4T&&Z4T[k];if(!L||!L.length)return'';var i=Math.random()*L.length|0;if(L.length>1&&i===la[k])i=(i+1)%L.length;la[k]=i;
return String(L[i]).replace(/\{(\w+)\}/g,function(m,x){return c&&c[x]!=null?String(c[x]):m;});};
Z.ev=function(n,o){if(ON)Z3.ev(n,o);};
Z.srv={send:function(op,d){if(ON)sf('z4v',function(){Z3.srv.send(op,d||{});});},get:function(op,q){return ON?Z3.srv.get(op,q||{}):Promise.reject(new Error('off'));}};
function tk(){try{return+todayKey();}catch(e){return 0;}}var F=['d0','el','en','wl'];
Z.field('z4b',{def:{d0:0,el:0,en:0,wl:0},merge:function(m,c){var a=m.d0,b=c.d0;m.d0=a&&b?Math.min(a,b):a||b||0;F.forEach(function(k){if(k!=='d0')m[k]=Math.max(+m[k]||0,+c[k]||0);});},
fix:function(z){F.forEach(function(k){z[k]=Math.max(0,Math.floor(+z[k]||0));});}});
Z.S=function(){return typeof S!=='undefined'&&S&&S.z4b||{};};
var B={word:[],miss:[],start:[],win:[]},N={word:0,miss:0,start:0,win:0},cur=null,h0=0,inF=0,pw=null;
function fire(k,o){N[k]++;B[k].forEach(function(f){sf('z4:'+k,function(){f(o);});});}
['Word','Miss','Start','Win'].forEach(function(k){Z['on'+k]=function(f){f&&B[k.toLowerCase()].push(f);};});
Z.bus=function(){return{n:N};};function gl(){return typeof G!=='undefined'&&G?G:null;}function W(g,w,b){return{w:w,byHint:!!b&&b!==2,bonus:b===2,combo:g.combo,left:g.words.filter(function(x){return!x.found;}).length,lv:g.idx+1,G:g};}
function L(){return{L:[],add:function(o){if(o&&o.id)ZB.add(this.L,o);}};}
Z.lvlEvent=L();Z.winLine=L();Z.card=L();
Z.fx=function(id,g){g=g||gl();if(!g)return true;if(g.__z4fx&&g.__z4fx!==id)return false;g.__z4fx=id;return true;};
var SC=Z.score={p:0,k:1,add:function(n){SC.p+=+n||0;},mult:function(k){SC.k*=+k||1;},get:function(){return Math.round(SC.p*SC.k);},reset:function(){SC.p=0;SC.k=1;}};
function wrap(){var fw=window.foundWord,sb=window.submit,w,s;
if(typeof fw==='function'&&!fw.__z4){w=function(wd,bh){var a=wd&&wd.found,g=gl(),r;inF++;try{r=fw.apply(this,arguments);}finally{inF--;}if(g&&wd&&!a&&wd.found)fire('word',W(g,wd.w,bh));if(pw&&!inF){a=pw;pw=null;fire('win',a);}return r;};w.__z4=1;window.foundWord=w;}
if(typeof sb==='function'&&!sb.__z4){s=function(x){var g=gl(),b=g?g.bonus.size:0,m=g?g.miss:0,r=sb.apply(this,arguments);
if(g&&gl()===g){if(g.bonus.size>b)fire('word',W(g,x,2));else if(g.miss>m)fire('miss',{w:x,why:typeof nearWord==='function'&&nearWord(x)?'near':'bad',lv:g.idx+1,G:g});}return r;};s.__z4=1;window.submit=s;}}
if(ON){ZB.on('ready',function(){sf('z4w',wrap);var z=Z.S();if(!z.d0&&Z.day()>=4&&tk()){z.d0=tk();Z.ev('z4b',{a:'on',d:Math.min(Z.day(),99)});}});
ZB.on('start',function(i){var k=window.Z3K,z=S.z3k;h0=+S.hintsUsed||0;sf('z4s',Z.score.reset.bind(Z.score));
cur={lv:i.l,idx:i.idx,mode:i.mode||'',daily:!!i.daily,mix:!!(k&&k.mix&&!i.daily&&z&&+z.m===i.l&&i.idx===+S.lv),key:i.key,G:gl()};fire('start',cur);});
ZB.on('level',function(i){if(i&&i.ok){var o={lv:i.l,idx:i.idx,hints:Math.max(0,(+S.hintsUsed||0)-h0),sec:i.s,words:i.words,of:i.of,bonus:i.bonus,
daily:!!i.daily,mode:i.mode||'',first:!!i.first,mix:!!(cur&&cur.idx===i.idx&&cur.mix),G:gl()};if(inF)pw=o;else fire('win',o);}});
Z3.late('js/zb4-core-s.js',{day:4});
document.documentElement.classList.add('z4');}
})();
