'use strict';
(function(){
var Z=window.Z4,R=window.Z4R;if(!Z||!Z.on||!R||R.s)return;R.s=1;var F=R.F,ZB=window.ZB;
var Q=location.search,FMUT=/[?&]z4rmut=1/.test(Q),FPOD=+((/[?&]z4rpod=(\d+)/.exec(Q)||[])[1]||0);
var CAP=10;try{if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4r==null)ZBECO.cap.z4r=CAP;}catch(e){}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function up(s){return String(s).toUpperCase();}
function now(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}}
function tk(){try{return+todayKey();}catch(e){return 0;}}
function dn(t){t=String(t||tk());return Math.round(Date.UTC(+t.slice(0,4),+t.slice(4,6)-1,+t.slice(6,8))/864e5);}
function ykey(){var d=new Date(dn()*864e5-864e5);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function h32(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function zS(){var z=S.z4r;if(!z||typeof z!=='object')z=S.z4r={h:[0,0,0,0],m:[0,0,0,0],sd:0,so:-1,sr:0,sn:0,zd:0,zn:0,hu:0};
if(!(z.h instanceof Array))z.h=[0,0,0,0];if(!(z.m instanceof Array))z.m=[0,0,0,0];return z;}
function sv(){try{save();}catch(e){}}
function ev(a,o){o=o||{};o.a=a;Z.ev('z4r',o);}
function give(n){try{return window.ZBECO&&ZBECO.give?ZBECO.give('z4r',n,'z4r'):0;}catch(e){return 0;}}
function snd(){try{SND.tap();}catch(e){}}
function T(k,c){return Z.txt(k,c);}
var DP=null;function data(){if(window.Z4T&&Z4T['z4r.spor'])return Promise.resolve();if(!DP)DP=ZB.load('js/zb4-sto-data.js').then(null,function(e){DP=null;throw e;});return DP;}
function say(t,m){if(!t)return;try{zina(t,m||'happy',Math.min(20,5+.12*t.length));}catch(e){}}
var CK='z4r-c',C=null;
function cache(){if(C)return C;C=lsG(CK,null);if(!C||typeof C!=='object')C={};if(!C.l||typeof C.l!=='object')C.l={};if(!C.h||typeof C.h!=='object')C.h={};return C;}
function csave(){var c=cache(),k=Object.keys(c.l);if(k.length>60){k.sort(function(a,b){return(c.l[a].t||0)-(c.l[b].t||0);});k.slice(0,k.length-60).forEach(function(x){delete c.l[x];});}lsS(CK,c);}
function good(d){return d&&typeof d==='object'&&!d._sim&&!d._off&&d.ok!==0;}
function ensureL(lv){var c=cache().l,e=c[lv],t=now();if(e&&t-(e.t||0)<2*864e5)return;var L=[];
for(var i=lv;i<lv+5;i++){var x=c[i];if(!x||t-(x.t||0)>=2*864e5){c[i]={t:t,p:0};L.push(i);}}csave();if(!L.length)return;
Z.srv.get('r4',{l:L}).then(function(d){if(!good(d)||!d.l)return;for(var k in d.l){var v=d.l[k];if(v&&+v.p>0)c[k]={t:t,p:+v.p,w:v.w||{},b:v.b||{},f:v.f||{}};}csave();},function(){});}
function inMain(w){try{return typeof MAIN!=='undefined'&&MAIN?MAIN.has(w):(typeof DICT_MAIN==='string'&&(' '+DICT_MAIN+' ').indexOf(' '+w+' ')>=0);}catch(e){return true;}}
var BC={3:93,4:88,5:80,6:72,7:63},BBM={3:55,4:42,5:30,6:20,7:13},BBE={3:18,4:12,5:8,6:5,7:3};
function guess(w,k){var n=Math.min(8,w.length),j=h32(w+'z4r')%9;
if(k==='c'){var b=(BC[n]||55)-(inMain(w)?0:14)-j;return Math.max(30,Math.min(98,b));}
var m=inMain(w),bb=m?(BBM[n]||8):(BBE[n]||2);return Math.max(1,Math.min(80,Math.round(bb*(1-j/22))));}
function pct(w,k,lv){var e=cache().l[lv];
if(e&&+e.p>=20){var m=(k==='c'?e.w:e.b)||{},n=+m[w]||0;if(k==='b'&&!n)return{p:1,s:1};return{p:Math.max(1,Math.min(99,Math.round(100*n/e.p))),s:1};}
return{p:guess(w,k),s:0};}
function tier(p){return p<5?3:p<15?2:p<40?1:0;}
var TN=['обычное','хорошее','редкое','ЗОЛОТОЕ'];
R.pct=function(w,k,lv){return pct(w,k,lv||(st.lv||1));};
var CSS=0;function css(){if(CSS)return;CSS=1;var s=document.createElement('style');s.id='z4r-css';s.textContent=
'#board .z4rc{position:absolute;left:50%;bottom:6%;transform:translate(-50%,0);z-index:6;pointer-events:none;padding:5px 12px;border-radius:999px;font:700 15px/1.25 var(--z3-font,inherit);white-space:nowrap;background:var(--z3-card,#fff);color:var(--z3-ink,#3b2f22);border:1px solid var(--z3-line,#e6dcc8);box-shadow:var(--z3-shadow,0 2px 6px rgba(0,0,0,.15));animation:z4rc 2.6s ease-out forwards}'+
'#board .z4rc.t1{background:#eef7e6;color:#2d5a1b}#board .z4rc.t2{background:#e6eefb;color:#1f3f7a}#board .z4rc.t3,#board .z4rc.mu{background:#fff3c4;color:#6b4a00;border-color:#e8c45a}'+
'#board .z4rc.still{animation:z4rs 2.6s linear forwards}#board .z4rc small{font-weight:400;font-size:13.5px}'+
'@keyframes z4rc{0%{opacity:0;transform:translate(-50%,30%)}12%{opacity:1;transform:translate(-50%,0)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-20%)}}@keyframes z4rs{0%,90%{opacity:1}100%{opacity:0}}'+
'#zSay .z4rp{display:inline-block;margin-left:6px;vertical-align:middle}#zSay .z4rp button{min-height:44px;padding:4px 12px;border-radius:22px;border:1px solid #c0392b;background:#fff;color:#a52a1d;font:700 14px var(--z3-font,inherit);cursor:pointer}'+
'.z4r-sp{margin:4px 0}.z4r-sp b{font-size:15.5px}.z4r-sp .z4r-q{font-size:15px;margin:4px 0;color:var(--z3-ink,#3b2f22)}.z4r-ob{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}'+
'.z4r-ob button{flex:1 1 40%;min-height:46px;font-size:17px;padding:6px 10px;border-radius:12px;border:1px solid var(--z3-line,#e6dcc8);background:var(--z3-card,#fff);color:var(--z3-ink,#3b2f22);cursor:pointer}'+
'.z4r-ob button.ok{border-color:#3c8a2e;background:#eef7e6;color:#245117}.z4r-ob button.no{border-color:#c0392b;background:#fdecea;color:#8e2418}'+
'.z4r-v{font-size:14.5px;line-height:1.35;color:var(--z3-ink,#3b2f22)}.z4r-v i{color:var(--z3-ink2,#6b5a45);font-style:normal}.z4r-p{font-size:14.5px;line-height:1.35;margin:4px 0;color:var(--z3-ink,#3b2f22)}'+
'.z4r-hb{padding:12px 16px 24px;max-width:640px;margin:0 auto;color:var(--z3-ink,#3b2f22)}.z4r-hb h2{font:700 22px var(--z3-font-head,inherit);margin:6px 0}'+
'.z4r-hb .z4r-say{font-size:15px;line-height:1.35;margin:6px 0 10px}.z4r-hb h3{font-size:16.5px;margin:14px 0 6px}.z4r-tg{display:flex;flex-wrap:wrap;gap:6px}'+
'.z4r-tg span{padding:5px 10px;border-radius:14px;background:var(--z3-card,#fff);border:1px solid var(--z3-line,#e6dcc8);font-size:15px}.z4r-tg span.t2{background:#e6eefb}.z4r-tg span.t3,.z4r-tg span.t4{background:#fff3c4;border-color:#e8c45a}'+
'.z4r-hb small{font-size:13.5px;color:var(--z3-ink2,#6b5a45)}.z4r-hb .btn{min-height:46px}';
document.head.appendChild(s);}
function chip(t,cls){var b=document.getElementById('board');if(!b)return;css();var o=b.querySelector('.z4rc');if(o)o.parentNode.removeChild(o);
var e=document.createElement('div');e.className='z4rc '+(cls||'')+(calm()?' still':'');e.innerHTML=t;b.appendChild(e);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},2700);}
var st={};R.st=function(){return st;};
function fit(i){var g=i&&i.G;return!!g&&Z.open('z4r')&&!i.daily&&!i.mode&&!i.mix&&!g.tut&&!g.fest&&!g.daily;}
Z.onStart(function(i){var on=fit(i);st={g:i.G,lv:i.lv,on:on,self:[],bon:[],first:'',chips:0,cw:0,rare:0,best:null,bc:null,t0:Date.now(),lastT:Date.now(),hu:0,mutAt:0,mutN:0,src:0};
if(!on)return;if(F.sto||F.yat||F.pod)ensureL(i.lv);
if(F.mut&&(i.lv>=30||FMUT)&&(FMUT||Math.random()<1/(isOK()?16:12))){var of=i.G.words.length;st.mutAt=FMUT?2:2+Math.floor(Math.random()*Math.max(1,of-2));}
if(F.err||F.mut||F.pod)data().catch(function(){});});
Z.onWord(function(o){var s=st;if(!s.on||o.G!==s.g)return;s.lastT=Date.now();if(o.byHint)return;var w=o.w,lv=s.lv;
if(o.bonus){if(s.bon.indexOf(w)<0)s.bon.push(w);}else{s.self.push(w);if(!s.first)s.first=w;}
s.mutN++;var mu=F.mut&&s.mutAt&&s.mutN===s.mutAt;if(mu){s.mutAt=0;ZB.safe('z4r-mut',function(){mutate(w,lv);});return;}
var r=pct(w,o.bonus?'b':'c',lv);if(r.s)s.src=1;
if(o.bonus){var t=tier(r.p),yat=0;
if(F.yat&&t===3&&h32(w+'|'+lv+'|'+tk())%25===0)yat=1;
if(F.yat&&t>=1)ZB.safe('z4r-herb',function(){herbAdd(w,t+yat,lv);});
if(F.sto||F.yat&&t>=1){s.chips++;chip(esc(up(w))+' — '+(r.s?'':'≈')+r.p+' из 100'+(F.yat&&t>=1?' <small>· '+(yat?'с ятем!':TN[t])+'</small>':''),'t'+t);}
if(t>=1)try{Z.score.add(t===3?8:t===2?4:2,'z4r');}catch(e){}
if(t>=2){s.rare++;if(!s.best||r.p<s.best.p)s.best={w:w,p:r.p};}}
else if(F.sto){s.cw++;if(r.p<40)try{Z.score.add(r.p<25?4:2,'z4r');}catch(e){}if(!s.bc||r.p<s.bc.p)s.bc={w:w,p:r.p};
if(!isOK()||s.cw%2){s.chips++;chip(esc(up(w))+' — '+(r.s?'':'≈')+r.p+' из 100 <small>нашли сами</small>','');}}});
Z.onWin(function(i){var s=st;if(!s.on||i.G!==s.g)return;s.on=false;
if(i.first&&(s.self.length||s.bon.length))Z.srv.send('r4_w',{l:s.lv,w:s.self.slice(0,16),b:s.bon.slice(0,24),f:s.first});
ev('lv',{lv:s.lv,c:s.chips,r:s.rare,s:s.src?'s':'p'});});
Z.winLine.add({id:'z4r',order:45,txt:function(i){var s=st;if(s.g!==i.G)return'';
if(s.best&&F.yat)return T('z4r.win-r',{w:up(s.best.w),p:s.best.p});
if(s.bc&&F.sto&&s.bc.p<40)return T('z4r.win-c',{w:up(s.bc.w),p:s.bc.p});return'';}});
function podLim(){return FPOD?FPOD*1000:(isOK()?60000:40000);}
function onGame(){var g=document.getElementById('game'),m=document.getElementById('modal');return!!g&&g.classList.contains('on')&&!(m&&m.classList.contains('on'))&&!document.hidden;}
setInterval(function(){ZB.safe('z4r-pod',function(){var s=st,g=s.g;if(!F.pod||!s.on||s.hu||typeof G==='undefined'||G!==g||!g||g.won||!onGame())return;
if(!FPOD&&(+S.lv||0)<25)return;if(Date.now()-s.lastT<podLim())return;
var U=g.words.filter(function(x){return!x.found;});if(U.length<1||!window.Z4T||!Z4T['z4r.hint'])return;
var e=cache().l[s.lv],best=null,p=0;
if(e&&+e.p>=20&&e.f){var tot=0;for(var k in e.f)tot+=+e.f[k]||0;U.forEach(function(x){var n=+e.f[x.w]||0;if(n&&(!best||n>(+e.f[best.w]||0)))best=x;});if(best&&tot)p=Math.round(100*(+e.f[best.w])/tot);}
if(!best){U.forEach(function(x){var q=pct(x.w,'c',s.lv).p;if(!best||q>p){best=x;p=q;}});}
if(!best||!p)return;s.hu=1;var z=zS();z.hu++;sv();
say(T('z4r.hint',{p:p,L:up(best.w.charAt(0))}),'happy');ev('pod',{lv:s.lv});});},4000);
var MK=[[1,'✨','золотое','g'],[2,'👢','в валенках','v'],[4,'👑','в кокошнике','k']];
function mutate(w,lv){var tri=Math.random()<1/40,k=tri?7:MK[Math.floor(Math.random()*3)][0],z=zS();
var L=lsG('z4r-mut',[]);if(!(L instanceof Array))L=[];L.unshift([w,k,tk()]);lsS('z4r-mut',L.slice(0,150));
if(tri)z.m[3]++;else MK.forEach(function(m,i){if(m[0]===k)z.m[i]++;});sv();
var ic='',nm='';MK.forEach(function(m){if(k&m[0]){ic+=m[1];nm=m[2];}});
chip(ic+' '+esc(up(w))+(tri?' — тройная мутация!':' '+(k===1?'— золотое!':nm+'!')),'mu');give(tri?3:1);
var key=tri?'z4r.mut-3':'z4r.mut-'+(k===1?'g':k===2?'v':'k');data().then(function(){setTimeout(function(){say(T(key),'wow');},900);},function(){});
if(tri)Z.srv.send('r4_m',{w:w,k:7});ev('mut',{k:k,lv:lv});}
function herbAdd(w,t,lv){var L=lsG('z4r-herb',[]);if(!(L instanceof Array))L=[];for(var i=0;i<L.length;i++)if(L[i][0]===w)return;
L.unshift([w,t,tk()]);lsS('z4r-herb',L.slice(0,300));var z=zS();z.h[t-1]++;sv();if(t>=2)give(t===4?5:t===3?2:1);}
function errToday(){var E=window.Z4T&&Z4T['z4r.err'];return E&&E.length?E[dn()%E.length]:null;}
function errOf(d){var E=window.Z4T&&Z4T['z4r.err'];return E&&E.length?E[dn(d)%E.length]:null;}
function who(o){return o&&o.nm?o.nm:'соседка из кв. '+((o&&o.kv)||1);}
Z.lvlEvent.add({id:'z4r.err',who:'STO',w:1,ok:function(){return!!F.err&&Z.open('z4r')&&zS().zd!==tk()&&lsG('z4r-es',0)!==tk();},
run:function(g,done){data().then(function(){var e=errToday();if(!e||typeof G==='undefined'||G!==g||g.won){done();return;}
lsS('z4r-es',tk());try{zina(e[0],'happy',16);}catch(x){done();return;}
var b=document.getElementById('zSay');if(b){css();var sp=document.createElement('span');sp.className='z4rp';
sp.innerHTML='<button type="button">🖊 '+esc(T('z4r.err-btn')||'Красная ручка на Зину')+'</button>';b.appendChild(sp);
sp.querySelector('button').addEventListener('click',function(x){x.stopPropagation();x.preventDefault();snd();catchZ(e);},true);}
ev('err',{s:'show'});done();},function(){done();});}});
function catchZ(e){var z=zS(),d=tk();if(z.zd===d)return;z.zd=d;z.zn++;sv();give(2);lsS('z4r-zb',{d:d,b:e[1],g:e[2]});
say(T('z4r.err-ok')+' «'+e[1]+'» → «'+e[2]+'».','wow');Z.srv.send('r4_z',{d:d});
Z.srv.get('r4',{z:[d]}).then(function(r){var o=good(r)&&r.z&&r.z[String(d)];if(!o){ev('err',{s:'catch',f:0});return;}
ev('err',{s:'catch',f:o.me?1:0});setTimeout(function(){say(o.me?T('z4r.err-first'):T('z4r.err-late',{who:who(o)}),o.me?'wow':'happy');},6000);},
function(){ev('err',{s:'catch',f:0});});}
function sporQ(d){var P=window.Z4T&&Z4T['z4r.spor'];if(!P||!P.length)return null;var n=P.length,i=((dn(d)*50+7)%n+n)%n;return P[i];}
function fid(d){return'r4s-'+d;}
function home(){var c=cache().h;if(c.d===tk())return;c.d=tk();csave();var t=tk(),y=ykey();
Z.srv.get('r4',{v:[fid(t),fid(y)],z:[y,t],m:1}).then(function(d){if(!good(d))return;var h=cache().h;h.v=d.v||{};h.z=d.z||{};h.m=d.m||[];csave();papRedo();},function(){});}
function optsHtml(q,mine){var k=q[2];return'<div class="z4r-ob">'+q[1].map(function(o,i){var cl='';if(mine>=0){if(k===0||i===k-1)cl='ok';else if(i===mine)cl='no';}
return'<button type="button" data-z4r="'+i+'"'+(mine>=0?' disabled':'')+(cl?' class="'+cl+'"':'')+'>'+esc(o)+'</button>';}).join('')+'</div>';}
function verdict(q,o){var k=q[2],ok=k===0||o===k-1,t=k===0?T('z4r.spor-both'):ok?T('z4r.spor-ok'):T('z4r.spor-no');
var v=cache().h.v&&cache().h.v[fid(tk())],h='';if(v&&v.all>=10){var a=v.n.slice(0,q[1].length),i=k?k-1:0;h=' <i>По дому: '+Math.round(100*(+a[i]||0)/v.all)+' % за «'+esc(q[1][i])+'».</i>';}
return'<div class="z4r-v">'+esc(t)+' <i>'+esc(q[3])+'</i>'+h+'</div>';}
function sporHtml(q){var z=zS(),mine=z.sd===tk()?z.so:-1;
return'<div class="z4r-sp"><b>⚖️ Великий спор: как правильно?</b>'+(q[0]&&q[0]!=='Как правильно?'?'<div class="z4r-q">'+esc(q[0])+'</div>':'')+optsHtml(q,mine)+(mine>=0?verdict(q,mine):'')+'</div>';}
function answer(o,w,redo){var q=sporQ();if(!q)return;var z=zS(),d=tk();if(z.sd===d)return;var k=q[2],ok=k===0||o===k-1;
z.sd=d;z.so=o;z.sn++;if(ok){z.sr++;give(2);}sv();Z.srv.send('r4_v',{f:fid(d),o:o});ev('spor',{o:o,ok:ok?1:0,w:w});snd();if(redo)redo();}
function bindSpor(root,w,redo){[].forEach.call(root.querySelectorAll('[data-z4r]'),function(b){b.onclick=function(){answer(+b.getAttribute('data-z4r'),w,redo);};});}
var cardSess=0;
Z.card.add({id:'z4r.spor',order:45,show:function(){if(!F.spor||!Z.open('z4r'))return false;if(zS().sd!==tk()||cardSess===tk()){if(!window.Z4T||!Z4T['z4r.spor']){data().catch(function(){});return false;}home();return true;}return false;},
html:function(){var q=sporQ();if(!q)return'';css();return'<div class="z4r-card">'+sporHtml(q)+'</div>';},
mount:function(el){var box=el&&el.querySelector('.z4r-card');if(!box)return;var redo=function(){cardSess=tk();var q=sporQ();box.innerHTML=sporHtml(q);bindSpor(box,'card',redo);};bindSpor(box,'card',redo);}});
function papBlocks(){var B=[],h=cache().h,y=ykey();
if(F.spor){var q=sporQ();if(q)B.push(sporHtml(q));
var qy=sporQ(y);if(qy){var v=h.v&&h.v[fid(y)],r=qy[2]?qy[1][qy[2]-1]:qy[1].join('» и «'),t='Вчера спорили: «'+esc(qy[1].join('» или «'))+'».';
if(qy[2]&&v&&v.all>=10){var p=100-Math.round(100*(+v.n[qy[2]-1]||0)/v.all);t+=' '+p+' % дома ошиблись. Правильно — «'+esc(r)+'».';}
else t+=qy[2]?' Правильно — «'+esc(r)+'».':' Правы все: можно и так, и так.';
var pc=T('z4r.spor-pc');B.push('<div class="z4r-p">'+t+(pc?' '+esc(pc):'')+'</div>');}}
if(F.err){var zy=h.z&&h.z[String(y)],ey=errOf(y),loc=lsG('z4r-zb',null);
if(zy&&ey)B.push('<div class="z4r-p">🖊 '+esc(T('z4r.err-pap',{bad:ey[1],who:zy.me?'ты':who(zy),n:zy.n}))+'</div>');
else if(loc&&loc.d===y)B.push('<div class="z4r-p">🖊 Вчера ты поймал Зину на «'+esc(loc.b)+'». Красная ручка — у тебя на день.</div>');}
if(F.mut&&h.m&&h.m.length){var m=h.m[h.m.length-1];B.push('<div class="z4r-p">👑 Легенда дома: «'+esc(up(m[0]))+'» — тройная мутация. Нашла '+esc(who({nm:m[1],kv:m[2]}))+'.</div>');}
return B;}
function papInject(el,op){op=op||{};if(!el||op.r||op.arch||op.pg||op.dn!=null)return;var sh=el.querySelector('.z3p-sheet');if(!sh)return;
if(!window.Z4T||!Z4T['z4r.spor']){data().then(function(){if(ZB.cur==='z3paper')papInject(el,op);},function(){});return;}
home();var old=sh.querySelector('.z4r-pap');if(old)old.parentNode.removeChild(old);var B=papBlocks();if(!B.length)return;css();
var d=document.createElement('div');d.className='z4r-pap';d.innerHTML=B.join('<hr style="border:0;border-top:1px dashed var(--z3-line,#e6dcc8);margin:8px 0">');
var fr=sh.querySelector('.z3p-front');if(fr&&fr.nextSibling)sh.insertBefore(d,fr.nextSibling);else sh.appendChild(d);
bindSpor(d,'pap',function(){papInject(el,op);});}
function papRedo(){var el=document.getElementById('zb-z3paper');if(el&&ZB.cur==='z3paper'&&el.querySelector('.z4r-pap'))papInject(el,{});}
function papHook(){var P=window.Z3PAPER;if(!P||!P.render||P.render._z4r)return;var o=P.render;
P.render=function(el,op){var r=o.apply(this,arguments);ZB.safe('z4r-pap',function(){papInject(el,op);});return r;};for(var k in o)P.render[k]=o[k];P.render._z4r=1;}
function papLate(){var el=document.getElementById('zb-z3paper');if(el&&ZB.cur==='z3paper'&&!el.querySelector('.z4r-pap')&&!el.querySelector('.z3p-game'))papInject(el,{});}
var TI=['🌿','🍀','✨','Ѣ'];
function herbView(el){css();var z=zS(),H=lsG('z4r-herb',[]),M=lsG('z4r-mut',[]),h=cache().h,leg=(h.m||[]).slice(-5).reverse();if(!(H instanceof Array))H=[];if(!(M instanceof Array))M=[];
var say0=T('z4r.herb-hi')||'Гербарий слов. Редкие находки — под стекло.';
var s='<div class="z4r-hb"><button type="button" class="btn ghost" data-z4rb="1">◀ Комод</button><h2>🌿 Гербарий слов</h2><div class="z4r-say">'+esc(say0)+'</div>'+
'<div class="z4r-tg"><span>🌿 хорошие: '+z.h[0]+'</span><span class="t2">🍀 редкие: '+z.h[1]+'</span><span class="t3">✨ золотые: '+z.h[2]+'</span><span class="t4">Ѣ с ятем: '+z.h[3]+'</span></div>';
s+='<h3>Последние находки</h3>'+(H.length?'<div class="z4r-tg">'+H.slice(0,40).map(function(x){return'<span class="t'+x[1]+'">'+TI[x[1]-1]+' '+esc(up(x[0]))+'</span>';}).join('')+'</div>':
'<small>Пока пусто. Редкие бонусные слова (их находят меньше 40 из 100 соседей) сушатся тут сами.</small>');
if(F.mut){s+='<h3>Полка мутантов</h3>'+(M.length?'<div class="z4r-tg">'+M.slice(0,30).map(function(x){var ic='';MK.forEach(function(m){if(x[1]&m[0])ic+=m[1];});return'<span class="'+(x[1]===7?'t4':'t3')+'">'+ic+' '+esc(up(x[0]))+'</span>';}).join('')+'</div>':'<small>Пока ни одного.</small>')+
'<p><small>Честно: мутирует примерно одно слово на 12 уровней; тройная (золотое, в валенках и в кокошнике) — одна из 40 мутаций.</small></p>';
if(leg.length)s+='<h3>Легенды дома</h3>'+leg.map(function(m){return'<div class="z4r-p">👑 «'+esc(up(m[0]))+'» — '+esc(who({nm:m[1],kv:m[2]}))+'</div>';}).join('');}
s+='</div>';el.innerHTML=s;var b=el.querySelector('[data-z4rb]');if(b)b.onclick=function(){snd();ZB.go('z3album',{});};ev('herb',{n:H.length});}
function albHook(){var A=window.Z3ALB;if(!A||!A.render||A.render._z4r)return;var o=A.render;
A.render=function(el,op){if(op&&op.s==='z4r'&&(F.yat||F.mut)){ZB.safe('z4r-herb',function(){herbView(el);});return;}var r=o.apply(this,arguments);ZB.safe('z4r-alb',function(){albInject(el,op);});return r;};
for(var k in o)A.render[k]=o[k];A.render._z4r=1;}
function albInject(el,op){if(!(F.yat||F.mut)||!el||op&&op.s)return;var b2=el.querySelector('.z3a-body2');if(!b2||b2.querySelector('[data-s="z4r"]'))return;
var z=zS(),n=z.h[0]+z.h[1]+z.h[2]+z.h[3]+z.m[0]+z.m[1]+z.m[2]+z.m[3];
var bt=document.createElement('button');bt.type='button';bt.className='z3a-box';bt.setAttribute('data-s','z4r');
bt.innerHTML='<span class="z3a-knob"></span><span class="z3a-lab"><b>🌿 Гербарий слов</b><small>'+(n?n+' редких находок и мутантов':'редкие слова и мутанты')+'</small></span>';
bt.onclick=function(){snd();ZB.go('z3album',{s:'z4r'});};b2.appendChild(bt);}
ZB.on('screen',function(id){if(id==='zb-z3paper'){papHook();var P=window.Z3PAPER;if(P&&P.x&&!P.ui)P.x().then(function(){ZB.safe('z4r-pap',function(){papHook();setTimeout(function(){ZB.safe('z4r-pap',papLate);},80);});},function(){});
setTimeout(function(){ZB.safe('z4r-pap',function(){papHook();papLate();});},80);}
if(id==='zb-z3album'){albHook();[80,400,1200,2500].forEach(function(t){setTimeout(function(){ZB.safe('z4r-alb',function(){albHook();var el=document.getElementById('zb-z3album');if(el&&ZB.cur==='z3album'&&!el.querySelector('.z4r-hb'))albInject(el,{});});},t);});}});
})();
