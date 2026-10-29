'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!window.Z3||typeof ZB==='undefined'||typeof S==='undefined'||window.Z4H)return;
var F={};
F.chat=Z.reg('z4h.chat',{t:'Чат дома №7: соседи-герои пишут, игрок отвечает стикером или словом',who:'CHAT'});
F.fr=Z.reg('z4h.fr',{t:'Общий холодильник: записки из магнитов-слов, видны соседям (вместо «Загадать соседям»)',who:'CHAT'});
F.tel=Z.reg('z4h.tel',{t:'Испорченный телефон: слово по цепочке, цепочка дня — в «Вечёрке»',who:'CHAT'});
F.reg=Z.reg('z4h.reg',{t:'Как у вас называют? Вопрос недели и карта округов (регион — по выбору)',who:'CHAT'});
F.gift=Z.reg('z4h.gift',{t:'Свёрток под дверью: редкое слово соседа и 💡 от Зины',who:'CHAT'});
var OPEN={chat:4,fr:5,tel:6,gift:7,reg:9};for(var k0 in OPEN)Z.OPEN['z4h.'+k0]=OPEN[k0];
function on(id){return!!F[id]&&Z.open('z4h.'+id);}
var Q=location.search,LOC=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
var DD=LOC?+((/[?&]z4hd=(\d{8})/.exec(Q)||[])[1]||0):0,DH=LOC?(/[?&]z4hh=(\d{1,2})/.exec(Q)||[])[1]:null;
var DATA='js/zb4-chat-data.js',D=null;
function load(){if(D)return Promise.resolve(D);return ZB.load(DATA).then(function(){D=window.Z4HD||null;return D;},function(){return null;});}
function safe(n,f){return ZB.safe('z4h:'+n,f);}
function ev(a,o){var x={a:a};for(var k in o||{})x[k]=o[k];Z.ev('z4h',x);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function T(k,c){return Z.txt(k,c)||'';}
function snd(){try{SND.tap();}catch(e){}}
function say(t){try{if(t&&typeof toast==='function')toast(t,3600);}catch(e){}}
function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function tk(){if(DD)return DD;try{return+Z3.tk();}catch(e){return 0;}}
function hr(){if(DH!=null)return+DH;try{return new Date(typeof nowMs==='function'?nowMs():Date.now()).getHours();}catch(e){return new Date().getHours();}}
function dt(k){return new Date(Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100));}
function kt(d){return d.getUTCFullYear()*1e4+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function addD(k,n){var d=dt(k);d.setUTCDate(d.getUTCDate()+n);return kt(d);}
function dnum(k){return Math.round(dt(k)/864e5);}
function wnum(k){return Math.floor((dnum(k)+3)/7);}
function H(){var z=S.z4h;if(!z||typeof z!=='object')z=S.z4h={};if(!z.ra||typeof z.ra!=='object')z.ra={};return z;}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function rng(a){a=a>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function hsh(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function shuf(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
var CAP=10;
function give(n){var r=0;try{var E=window.ZBECO;if(E&&typeof E.give==='function'){if(E.cap&&!('z4h'in E.cap))E.cap.z4h=CAP;r=E.give('z4h',n,'quest');}
else if(typeof addCoins==='function'){addCoins(n,'quest');r=n;}}catch(e){}return r;}
function coin(n){return n+' монет';}
function live(op,q){return Z.srv.get(op,q||{}).then(function(r){if(!r||r._sim||r.ok===0||(r._off&&r._age>86400))return null;return r;},function(){return null;});}
var WHO={zina:'Зина',vp:'Валентина Петровна',galya:'Галя',tolik:'Толик',kolya:'дядя Коля',valerka:'Валерка',semyon:'дед Семён',tamara:'Тамара',
lyusya:'Люся',nina:'Нина Аркадьевна',yat:'кот Ять',valya:'тётя Валя'};
function face(id){try{if(window.ZBP&&ZBP.round){var s=ZBP.round(id,'z4h-av');if(s)return s;}}catch(e){}return'<span class="z4h-av z4h-ave">🏠</span>';}
var ST=['👍','😂','🌸','😮'];
var GEN={zina:'Зины',vp:'Валентины Петровны',galya:'Гали',tolik:'Толика',kolya:'дяди Коли',valerka:'Валерки',semyon:'деда Семёна',tamara:'Тамары',lyusya:'Люси',nina:'Нины Аркадьевны',valya:'тёти Вали'};
function flat(kh){return'кв. '+(1+(hsh(kh)%60));}
function amb(){var o={};((D&&D.AMB)||[]).forEach(function(w){o[w]=1;});return o;}
function myWords(n,seed){var A=amb(),L=[],seen={};function put(w){w=String(w||'').toLowerCase();if(!/^[а-яё]{3,10}$/.test(w)||seen[w]||A[w])return;
try{if(typeof isWord==='function'&&!isWord(w)&&!(typeof DEFS!=='undefined'&&DEFS&&DEFS[w]))return;}catch(e){}seen[w]=1;L.push(w);}
try{if(typeof G!=='undefined'&&G&&G.words)G.words.forEach(function(x){if(x.found)put(x.w);});}catch(e){}
try{for(var w in S.dict||{})put(w);}catch(e){}
if(L.length<n)((D&&D.MAG)||[]).forEach(put);
return shuf(L,rng(seed)).slice(0,n);}
function thr(k){if(!D||!D.C||!D.C.length)return null;var i=dnum(k)%D.C.length;return{i:i,m:D.C[i]};}
function chatNew(){return on('chat')&&H().cd!==tk();}
function chatAns(){var a=lsG('z4h-ca',null);return a&&a.d===tk()?a:null;}
function chatPick(kind,v){var t=thr(tk());if(!t)return;var who=t.m[t.m.length-1][0],nm=WHO[who]||'Галя',a={d:tk(),k:kind,v:v,who:who};
if(kind==='s'){a.r=T('z4h.re.'+v,{who:nm});Z.srv.send('h4_st',{d:tk(),s:v});ev('st',{s:v,t:t.i});}
else{a.r=T('z4h.re.w',{who:nm,W:String(v).toUpperCase()});ev('word',{l:String(v).length,t:t.i});}
lsS('z4h-ca',a);var z=H();z.cs=tk();z.cn++;sv();}
function frMine(){var L=lsG('z4h-fr',[]);return L instanceof Array?L.filter(function(x){return x&&x.d&&dnum(tk())-dnum(x.d)<=1;}):[];}
function frLeft(){var z=H();return z.fd===tk()?Math.max(0,3-z.fn):3;}
function frHang(ws){if(!ws.length||!frLeft())return false;var z=H();if(z.fd!==tk()){z.fd=tk();z.fn=0;}z.fn++;z.ft++;sv();
var L=frMine();L.push({d:tk(),w:ws});lsS('z4h-fr',L.slice(-6));Z.srv.send('h4_fn',{w:ws});ev('note',{n:ws.length});return true;}
function frHid(){var h=lsG('z4h-frx',[]);return h instanceof Array?h:[];}
function frRep(id){var h=frHid();if(h.indexOf(id)<0){h.push(id);lsS('z4h-frx',h.slice(-60));}if(!/^c/.test(id))Z.srv.send('h4_fx',{id:id});ev('rep',{});}
function telSeed(k){var L=(D&&D.TS)||[];return L.length?L[hsh('z4h-t'+k)%L.length]:'чай';}
function telNext(w,seed){var A=(D&&D.TEL&&D.TEL[w])||[];if(A.length<3)A=(D&&D.TEL&&D.TEL[telSeed(seed)])||[];return shuf(A,rng(hsh(w+'|'+seed))).slice(0,3);}
var HEROS=['galya','tolik','vp','kolya','tamara','semyon','lyusya','nina','valerka','valya'];
function telSim(k){var r=rng(hsh('z4h-ts'+k)),w=telSeed(k),c=[w],who=shuf(HEROS,r),n=7+Math.floor(r()*6);
for(var i=0;i<n;i++){var A=(D&&D.TEL&&D.TEL[w])||[];if(!A.length)break;var nx=null;for(var j=0;j<6&&!nx;j++){var x=A[Math.floor(r()*A.length)];if(c.indexOf(x)<0)nx=x;}if(!nx)break;c.push(nx);w=nx;}
return{c:c,who:who,sim:1};}
function telMy(){var m=lsG('z4h-tm',null);return m&&m.d===tk()?m:null;}
function telDone(){return H().td===tk();}
var TELC={};
function telGet(){return live('h4_tl',{}).then(function(r){if(r&&r.c instanceof Array)TELC=r;return r;});}
function telLast(r){var c=r&&r.c instanceof Array&&r.c.length?r.c:null;return c?c[c.length-1]:telSeed(tk());}
function telPick(prev,w){var z=H();if(z.td===tk())return 0;z.td=tk();z.tn++;sv();lsS('z4h-tm',{d:tk(),p:prev,w:w});
Z.srv.send('h4_tl',{p:prev,w:w});var g=give(5);ev('tel',{c:g});return g;}
function chainOf(k,r){var c=r&&r.y instanceof Array&&r.y.length>=3&&k===addD(tk(),-1)?{c:r.y,n:r.yn||r.y.length-1}:
(r&&r.c instanceof Array&&r.c.length>=3&&k===tk()?{c:r.c,n:r.n||r.c.length-1}:null);return c||telSim(k);}
function rq(){var L=(D&&D.RQ)||[];return L.length?L[wnum(tk())%L.length]:null;}
function rqPick(q,o){var z=H();if(z.ra[q[0]])return 0;z.ra[q[0]]=o+1;sv();var fd=rgFd();Z.srv.send('h4_rg',{q:q[0],o:o,fd:fd});var g=give(3);ev('reg',{q:q[0],o:o,fd:fd,c:g});return g;}
function rgFd(){var z=H(),R=(D&&D.RG)||[];var x=z.rg?R[z.rg-1]:null;return x?x[0]:0;}
function giftDue(){if(!on('gift'))return false;var z=H();return!z.gd||dnum(tk())-dnum(z.gd)>=2;}
function giftOpen(cb){var z=H();if(!giftDue())return cb(null);
live('h4_gf',{}).then(function(r){var g;
if(r&&r.w&&/^[а-яё]{3,14}$/.test(r.w)){var fl=flat(String(r.by||r.id));g={id:r.id,w:r.w,from:'соседки из '+fl,nom:'Соседка из '+fl};}
else{var L=(D&&D.GW)||[],x=L.length?L[hsh('z4h-g'+tk())%L.length]:['ветла','galya'];g={id:'',w:x[0],from:GEN[x[1]]||'Гали',nom:WHO[x[1]]||'Галя',hero:x[1]};g.nom=g.nom.charAt(0).toUpperCase()+g.nom.slice(1);}
if(r&&r.ty instanceof Array&&r.ty.length)g.ty=r.ty.slice(0,3);
z.gd=tk();z.gn++;var hb=0;try{if(typeof hbAdd==='function'){hbAdd(1,'z4h');hb=1;}}catch(e){}sv();ev('gift',{s:g.id?'srv':'hero',hb:hb});cb(g);});}
var gwSent=0;
Z.onWord(function(o){safe('word',function(){if(!o||!o.bonus||gwSent||!on('gift'))return;var w=String(o.w||'').toLowerCase(),z=H();
if(w.length<7||z.gw===tk()||!/^[а-яё]+$/.test(w)||amb()[w])return;z.gw=tk();gwSent=1;sv();Z.srv.send('h4_gw',{w:w});ev('gw',{l:w.length});});});
function items(){var L=[];
if(giftDue())L.push({id:'gift',ic:'📦',t:'Под дверью свёрток',s:'кто-то из соседей оставил слово'});
if(on('tel')&&!telDone())L.push({id:'tel',ic:'📞',t:'Испорченный телефон',s:'Зина шепчет слово — твой черёд'});
if(chatNew())L.push({id:'chat',ic:'💬',t:'Чат дома №7',s:'соседи что-то обсуждают'});
var q;if(on('reg')&&(q=rq())&&!H().ra[q[0]])L.push({id:'reg',ic:'🗺️',t:'Как у вас называют?',s:q[2]+' или '+q[3]+'?'});
return L;}
Z.card.add({id:'z4h',order:35,show:function(){return items().length>0;},
html:function(){var it=items()[0];if(!it)return'';css();if(!D)load();
return'<button type="button" class="z4h-card" data-p="'+it.id+'"><span class="z4h-ci">'+it.ic+'</span><span class="z4h-ct"><b>'+esc(it.t)+'</b><small>'+esc(it.s)+'</small></span><em>›</em></button>';},
mount:function(el){var b=el&&el.querySelector('.z4h-card');if(b)b.onclick=function(){snd();var p=b.getAttribute('data-p');ev('card',{p:p});
if(p==='gift')openGift();else go(p,'home');};}});
var wins=0;
Z.winLine.add({id:'z4h',order:35,txt:function(o){wins++;if(wins%3!==1)return'';
if(on('tel')&&!telDone())return'📞 Зина шепнула слово по цепочке — твой черёд. На Доме.';
if(chatNew())return'💬 В чате дома №7 новое. Галя уже ответила дважды.';
if(giftDue())return'📦 Под дверью свёрток. Галя видела, кто положил, но молчит.';return'';}});
function paperRow(){if(!on('tel')||!D)return'';var k=hr()>=18?tk():addD(tk(),-1),ch=chainOf(k,TELC),c=ch.c;
return'<button type="button" class="z3p-row z4h-prow"><span class="z3p-ri">📞</span><span class="z3p-rt"><b>Испорченный телефон'+(k===tk()?' — сегодня':' — вчера')+'</b><small>'+
esc(c[0].toUpperCase()+' → … → '+c[c.length-1].toUpperCase())+' · '+(ch.sim?'передавали герои':'звеньев: '+(c.length-1))+'</small></span><em></em></button>';}
function inject(el,op){if(!el||op.r||op.pg||op.arch||op.dn!=null)return;var n=0;
(function tick(){var sh=el.querySelector('.z3p-sheet');if(sh&&!el.querySelector('.z4h-prow')&&el.querySelector('.z3p-front')){var h=paperRow();if(!h)return;
var d=document.createElement('div');d.innerHTML=h;var f=sh.querySelector('.z3p-front'),at=f?f.nextSibling:sh.firstChild;while(d.firstChild)sh.insertBefore(d.firstChild,at);
var b=sh.querySelector('.z4h-prow');if(b)b.onclick=function(){snd();go('tel','paper');};ev('paper',{});return;}
if(++n<16)setTimeout(tick,250);})();}
function wrapPaper(){var o=ZB._scr&&ZB._scr.z3paper;if(!o||o.__z4h||typeof o.render!=='function')return;var r0=o.render;
o.render=function(el,op){var r=r0.apply(this,arguments);safe('paper',function(){if(!on('tel'))return;css();var g=function(){inject(el,op||{});};if(D)g();else load().then(g);
telGet();});return r;};o.__z4h=1;}
wrapPaper();try{ZB.on('z3late',wrapPaper);}catch(e){}setTimeout(wrapPaper,3000);
function wrapRid(){var L=ZB.winSlots||[],s=null;for(var i=0;i<L.length;i++)if(L[i]&&L[i].id==='z3p-rid')s=L[i];if(!s||s.__z4h)return!!s;s.__z4h=1;
var r0=s.render,m0=s.mount;
s.render=function(c){var h=r0.apply(this,arguments);if(!h||!on('fr')||!c||!c.z3pw)return h;c.z4hfr=1;
return'<div class="z3p-wr" style="text-align:center;margin-top:4px"><button type="button" class="btn ghost small z4h-frb">🧲 «'+esc(String(c.z3pw).toUpperCase())+'» — на холодильник дома</button></div>';};
s.mount=function(el,c){if(!c||!c.z4hfr)return m0.apply(this,arguments);var b=el&&el.querySelector('.z4h-frb');if(!b)return;ev('frbtn',{s:'show'});
b.onclick=function(e){if(e&&e.stopPropagation)e.stopPropagation();snd();ev('frbtn',{s:'tap'});go('fr','win',{w:c.z3pw});};};return true;}
if(!wrapRid()){try{ZB.on('z3late',wrapRid);}catch(e){}setTimeout(wrapRid,3000);}
var CSS=0;function css(){if(CSS)return;CSS=1;var s=document.createElement('style');s.setAttribute('data-z4h','1');s.textContent=
'.z4h-card{display:flex;align-items:center;gap:10px;width:100%;min-height:56px;padding:10px 12px;border:0;border-radius:var(--z3-rb,16px);background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);box-shadow:var(--z3-shadow,none);font:inherit;text-align:left;cursor:pointer}'+
'.z4h-ci{font-size:28px;line-height:1}.z4h-ct{flex:1;display:flex;flex-direction:column}.z4h-ct b{font-size:16px}.z4h-ct small{font-size:14px;color:var(--z3-ink2,#5d6781)}.z4h-card em{font-style:normal;font-size:24px;color:var(--z3-acc,#c2410c)}'+
'.z4h-scr{display:flex;flex-direction:column;height:100%;background:var(--z3-bg,#f6efe3);color:var(--z3-ink,#27324a);font-family:var(--z3-font,inherit)}'+
'.z4h-hd{display:flex;align-items:center;gap:10px;padding:10px 12px}.z4h-hd b{font-family:var(--z3-font-news,Georgia,serif);font-size:19px;line-height:1.2}'+
'.z4h-tabs{display:flex;gap:6px;padding:0 12px 8px;overflow-x:auto;max-width:640px;margin:0 auto;width:100%;box-sizing:border-box}'+
'.z4h-tab{flex:0 0 auto;min-height:44px;padding:6px 12px;border-radius:22px;border:2px solid var(--z3-line,#e6dcc8);background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);font:inherit;font-size:15px;cursor:pointer}'+
'.z4h-tab.on{border-color:var(--z3-blue,#2563c9);font-weight:600}'+
'.z4h-body{flex:1;overflow-y:auto;padding:0 12px 24px;max-width:640px;margin:0 auto;width:100%;box-sizing:border-box}'+
'.z4h-blk{background:var(--z3-paper,#fbf7ec);border:1px solid var(--z3-line,#e6dcc8);border-radius:var(--z3-rb,16px);padding:12px 14px;margin:0 0 10px}'+
'.z4h-blk h4{margin:0 0 6px;font-size:16px}.z4h-blk p{margin:4px 0;font-size:15px;line-height:1.4}.z4h-sm{font-size:14px!important;color:var(--z3-ink2,#5d6781)}'+
'.z4h-msg{display:flex;gap:8px;align-items:flex-end;margin:8px 0}.z4h-msg.me{flex-direction:row-reverse}'+
'.z4h-av{width:40px;height:40px;flex:0 0 40px;border-radius:50%}.z4h-ave{display:inline-flex;align-items:center;justify-content:center;font-size:24px;background:var(--z3-card,#fff)}'+
'.z4h-bub{background:var(--z3-card,#fff);border:1px solid var(--z3-line,#e6dcc8);border-radius:16px 16px 16px 4px;padding:8px 12px;font-size:15px;line-height:1.4;max-width:80%}'+
'.z4h-msg.me .z4h-bub{border-radius:16px 16px 4px 16px;background:#e3ecfb}.z4h-bub small{display:block;font-size:13.5px;color:var(--z3-ink2,#5d6781);font-weight:600}'+
'.z4h-big{font-size:30px}.z4h-opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}'+
'.z4h-opt{flex:1 1 120px;min-height:48px;border-radius:14px;border:2px solid var(--z3-line,#e6dcc8);background:#fff;color:var(--z3-ink,#27324a);font:inherit;font-size:16px;padding:8px 10px;cursor:pointer}'+
'.z4h-opt.on{border-color:var(--z3-blue,#2563c9);background:#e3ecfb;font-weight:600}.z4h-opt.st{font-size:26px;flex:1 1 60px}'+
'.z4h-fridge{background:#eef1f4;border:2px solid #c9d0d8;border-radius:18px;padding:12px;min-height:120px}'+
'.z4h-note{display:flex;flex-wrap:wrap;align-items:center;gap:6px;background:#fff;border-radius:10px;padding:8px 10px;margin:0 0 8px;box-shadow:0 1px 2px rgba(0,0,0,.12)}'+
'.z4h-mag{display:inline-block;padding:4px 8px;border-radius:6px;font-weight:700;font-size:15px;letter-spacing:.5px;color:#fff;background:#2563c9}'+
'.z4h-mag.c1{background:#b4361e}.z4h-mag.c2{background:#1d7a46}.z4h-mag.c3{background:#7a4ab0}'+
'.z4h-by{flex:1 1 100%;font-size:13.5px;color:#5d6781;display:flex;justify-content:space-between;align-items:center}'+
'.z4h-rep{border:0;background:none;color:#5d6781;font:inherit;font-size:13.5px;min-height:44px;min-width:44px;cursor:pointer}'+
'.z4h-word{font-size:28px;font-weight:700;letter-spacing:2px;text-align:center;margin:8px 0}'+
'.z4h-chain{font-size:15px;line-height:1.7}.z4h-chain b{white-space:nowrap}'+
'.z4h-map{display:block;width:100%;max-width:560px;height:auto;margin:6px auto}.z4h-map text{font-size:11px;fill:#27324a}'+
'.z4h-leg{display:flex;gap:12px;flex-wrap:wrap;font-size:14px}.z4h-sw{display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-2px;margin-right:4px}'+
'.z4h-sel{width:100%;min-height:48px;font:inherit;font-size:16px;border-radius:12px;border:2px solid var(--z3-line,#e6dcc8);background:#fff;color:var(--z3-ink,#27324a);padding:6px}'+
'.z4h-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;background:rgba(20,24,36,.55);display:flex;align-items:center;justify-content:center;padding:16px}'+
'.z4h-ovp{background:var(--z3-paper,#fbf7ec);color:var(--z3-ink,#27324a);border-radius:18px;padding:16px;max-width:420px;width:100%;max-height:90%;overflow-y:auto;text-align:center}'+
'.z4h-ovp p{font-size:15px;line-height:1.4;margin:6px 0}.z4h-row2{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}';
document.head.appendChild(s);}
var CUR=null,TAB=[['chat','💬 Чат'],['fr','🧲 Холодильник'],['tel','📞 Телефон'],['reg','🗺️ Как у вас']];
function go(p,from,x){css();ev('open',{p:p,s:from||''});var o={p:p,from:from||'home'};for(var k in x||{})o[k]=x[k];ZB.go('z4chat',o);}
function back(op){try{if(op.from==='paper'&&ZB._scr.z3paper){ZB.go('z3paper',{});return;}}catch(e){}try{if(typeof openMenu==='function')openMenu();else ZB.go('home');}catch(e){}}
ZB.screen('z4chat',{title:'Двор на связи',render:function(el,op){op=op||{};CUR={el:el,op:op};css();
if(!D){el.innerHTML='<div class="z4h-scr"><p style="padding:40px 16px;text-align:center">📮 Люся несёт почту…</p></div>';
load().then(function(){if(ZB.cur==='z4chat'&&CUR&&CUR.el===el)safe('page',function(){page(el,op);});});return;}
safe('page',function(){page(el,op);});}});
function rer(){if(CUR&&ZB.cur==='z4chat')safe('page',function(){page(CUR.el,CUR.op);});}
function blk(h,p,cls){return'<div class="z4h-blk'+(cls?' '+cls:'')+'">'+(h?'<h4>'+h+'</h4>':'')+p+'</div>';}
function P_(s,sm){return s?'<p'+(sm?' class="z4h-sm"':'')+'>'+esc(s)+'</p>':'';}
function frame(el,op,body){var t='';TAB.forEach(function(x){if(on(x[0]))t+='<button type="button" class="z4h-tab'+(op.p===x[0]?' on':'')+'" data-t="'+x[0]+'">'+x[1]+'</button>';});
el.innerHTML='<div class="z4h-scr"><div class="z4h-hd"><button type="button" class="btn ghost small z4h-back">‹ '+(op.from==='paper'?'Номер':'Двор')+'</button><b>Дом №7 на связи</b></div>'+
'<div class="z4h-tabs">'+t+'</div><div class="z4h-body">'+body+'</div></div>';
var b=el.querySelector('.z4h-back');if(b)b.onclick=function(){snd();back(op);};
[].forEach.call(el.querySelectorAll('.z4h-tab'),function(x){x.onclick=function(){snd();op.p=x.getAttribute('data-t');op.w='';ev('open',{p:op.p,s:'tab'});rer();};});}
function btns(el,sel,cb){[].forEach.call(el.querySelectorAll(sel),function(b){b.onclick=function(){snd();safe('pick',function(){cb(b.getAttribute('data-o'),b);});};});}
function page(el,op){var p=op.p;if(!on(p))for(var i=0;i<TAB.length;i++)if(on(TAB[i][0])){p=op.p=TAB[i][0];break;}
if(p==='chat')return pgChat(el,op);if(p==='fr')return pgFr(el,op);if(p==='tel')return pgTel(el,op);if(p==='reg')return pgReg(el,op);
frame(el,op,blk('',P_('Во дворе тихо. Галя говорит, это подозрительно.')));}
function msg(who,txt,me){return'<div class="z4h-msg'+(me?' me':'')+'">'+(me?'<span class="z4h-av z4h-ave">🙂</span>':face(who))+
'<div class="z4h-bub"><small>'+esc(me?'Ты':(WHO[who]||who))+'</small>'+txt+'</div></div>';}
function pgChat(el,op){var t=thr(tk());if(!t){frame(el,op,blk('',P_('Чат молчит. Наверное, Люся опять перепутала провода.')));return;}
var z=H();if(z.cd!==tk()){z.cd=tk();sv();}var h='',a=chatAns(),last=t.m[t.m.length-1];
t.m.forEach(function(x){h+=msg(x[0],esc(x[1]));});
if(a){h+=msg('',a.k==='s'?'<span class="z4h-big">'+ST[a.v]+'</span>':'<b>'+esc(String(a.v).toUpperCase())+'</b>',1);if(a.r)h+=msg(a.who,esc(a.r));}
var body=blk('💬 Чат дома №7 · '+esc(WHO[last[0]]||'')+' спрашивает',h);
if(!a){var ws=myWords(4,hsh('z4h-cw'+tk())),sb='',wb='';ST.forEach(function(s,i){sb+='<button type="button" class="z4h-opt st z4h-cs" data-o="'+i+'">'+s+'</button>';});
ws.forEach(function(w){wb+='<button type="button" class="z4h-opt z4h-cwd" data-o="'+esc(w)+'">'+esc(w.toUpperCase())+'</button>';});
body+=blk('Ответить',P_('Стикером:',1)+'<div class="z4h-opts">'+sb+'</div>'+(wb?P_('Или словом из твоего словаря:',1)+'<div class="z4h-opts">'+wb+'</div>':''));}
else body+='<div class="z4h-blk z4h-cnt">'+P_('Завтра — новая тема. Галя уже готовит три.',1)+'</div>';
frame(el,op,body);
btns(el,'.z4h-cs',function(v){chatPick('s',+v);rer();});btns(el,'.z4h-cwd',function(v){chatPick('w',v);rer();});
if(a&&a.k==='s')live('h4_ch',{d:tk()}).then(function(r){if(!r||!(r.n instanceof Array))return;var all=0,s='';r.n.forEach(function(x,i){all+=+x||0;if(+x)s+=ST[i]+' '+x+' · ';});
var c=el.querySelector('.z4h-cnt');if(c&&all>=3&&ZB.cur==='z4chat')c.innerHTML=P_('Соседи ответили: '+s.replace(/ · $/,''),1)+P_('Завтра — новая тема.',1);});}
function note(ws,by,id,mine){var h='';ws.forEach(function(w,i){h+='<span class="z4h-mag c'+(hsh(w)%4)+'">'+esc(String(w).toUpperCase())+'</span>';});
return'<div class="z4h-note">'+h+'<span class="z4h-by"><span>'+esc(by)+'</span>'+(id&&!mine?'<button type="button" class="z4h-rep" data-o="'+esc(id)+'" aria-label="Пожаловаться">⚑</button>':'')+'</span></div>';}
var FRL=null;
function pgFr(el,op){var hid=frHid(),A=amb(),h='',L=[],mine=frMine(),pre=op.w&&/^[а-яё]{3,10}$/.test(op.w)&&!A[op.w]?String(op.w):'';
mine.forEach(function(x){h+=note(x.w,'ты · сегодня'+(x.d!==tk()?' (вчера)':''),'',1);});
function draw(srv){var n=0,hh=h;
(srv||[]).forEach(function(x){if(n>=10||!x||!(x.w instanceof Array)||hid.indexOf(x.id)>=0)return;if(x.w.some(function(w){return A[w];}))return;n++;hh+=note(x.w,'соседка из '+flat(String(x.by||x.id)),x.id);});
if(n<6){var F2=(D&&D.FN)||[],r=rng(hsh('z4h-fn'+tk()));shuf(F2,r).slice(0,6-n).forEach(function(x,i){var id='c'+hsh(x[1]);if(hid.indexOf(id)<0)hh+=note(String(x[1]).split(' '),WHO[x[0]]||x[0],id);});}
return hh;}
var left=frLeft(),pick=[],pool=myWords(12,hsh('z4h-fw'+tk()+(op.sh||0)));if(pre&&pool.indexOf(pre)<0)pool.unshift(pre);if(pre)pick.push(pre);pool=pool.slice(0,12);
function comp(){if(!left)return blk('🧲 Твоя записка',P_('Три записки за день — холодильник не резиновый. Завтра ещё.',1));
var b='';pool.forEach(function(w){b+='<button type="button" class="z4h-opt z4h-pw'+(pick.indexOf(w)>=0?' on':'')+'" data-o="'+esc(w)+'">'+esc(w.toUpperCase())+'</button>';});
return blk('🧲 Повесить записку',P_('Магниты — слова, которые ты уже находил. До трёх, по порядку. Сегодня можно ещё '+left+'.',1)+
(pick.length?note(pick,'так увидят соседи'):'')+'<div class="z4h-opts">'+b+'</div><div class="z4h-row2"><button type="button" class="btn green z4h-hang"'+(pick.length?'':' disabled')+'>Повесить</button>'+
'<button type="button" class="btn ghost small z4h-more">Другие магниты</button></div>');}
function paint(){frame(el,op,comp()+blk('Холодильник дома №7','<div class="z4h-fridge">'+draw(FRL)+'</div>'+P_('⚑ — пожаловаться: Зина снимет магнит.',1)));
btns(el,'.z4h-pw',function(w){var i=pick.indexOf(w);if(i>=0)pick.splice(i,1);else if(pick.length<3)pick.push(w);paint();});
btns(el,'.z4h-more',function(){op.sh=(op.sh||0)+1;op.w='';pgFr(el,op);});
btns(el,'.z4h-hang',function(){if(frHang(pick.slice(0,3))){say(T('z4h.fr.hang')||'Повесила. Галя уже читает.');op.w='';pgFr(el,op);}});
btns(el,'.z4h-rep',function(id){frRep(id);hid=frHid();say(T('z4h.fr.rep')||'Зина сняла магнит. И строго посмотрела на холодильник.');paint();});}
paint();
live('h4_fr',{}).then(function(r){if(r&&r.l instanceof Array&&ZB.cur==='z4chat'&&CUR&&CUR.op===op&&op.p==='fr'){FRL=r.l;paint();}});}
function pgTel(el,op){
function paint(r){var my=telMy(),last=telLast(r),h='';
if(!my&&!telDone()){var opts=telNext(last,tk()),b='';opts.forEach(function(w){b+='<button type="button" class="z4h-opt z4h-tw" data-o="'+esc(w)+'">'+esc(w.toUpperCase())+'</button>';});
h+=blk('📞 Тебе шепнули',(r&&r.c&&r.c.length>1?P_('Слово пришло по цепочке от соседки из '+flat(String(r.by||last))+'.',1):P_('Зина шепчет первой. Утром у неё всегда одно слово.',1))+
'<div class="z4h-word">'+esc(last.toUpperCase())+'</div>'+P_('Что первое приходит в голову? Передай дальше — следующий услышит только твоё слово.',1)+'<div class="z4h-opts">'+b+'</div>');}
else h+=blk('📞 Ты передал'+(my?': «'+esc(String(my.w).toUpperCase())+'»':''),P_(T('z4h.tel.done')||'Передала. Дальше пусть слушают сами.')+P_('Вся цепочка — вечером в «Вечёрке».',1));
var k=hr()>=18?tk():addD(tk(),-1),ch=chainOf(k,r),c=ch.c,s='';
c.forEach(function(w,i){s+=(i?' → ':'')+'<b>'+esc(w.toUpperCase())+'</b>'+(ch.sim&&i?' <span class="z4h-sm">('+esc(WHO[ch.who[(i-1)%ch.who.length]])+')</span>':'');});
h+=blk(k===tk()?'Цепочка сегодня':'Цепочка вчера','<p class="z4h-chain">'+s+'</p>'+P_(ch.sim?'Передавали соседи-герои. Начала Зина, чем кончилось — сами удивились.':'Звеньев: '+(c.length-1)+'. Начала Зина. Кончили — сами видите.',1));
frame(el,op,h);
btns(el,'.z4h-tw',function(w){var g=telPick(last,w);say((T('z4h.tel.pick')||'Передано!')+(g?' +'+coin(g):''));paint(r);});}
paint(TELC&&TELC.c?TELC:null);
telGet().then(function(r){if(r&&ZB.cur==='z4chat'&&CUR&&CUR.op===op&&op.p==='tel'&&!telMy())paint(r);});}
var FDN=['','Центр','Северо-Запад','Юг','Сев. Кавказ','Поволжье','Урал','Сибирь','Дальний Восток'];
var FDB=[null,[60,70,70,60],[60,10,140,58],[20,132,70,48],[20,182,70,34],[132,70,70,80],[204,40,70,90],[276,30,110,110],[388,10,130,150]];
function svgMap(col,mine){var s='<svg class="z4h-map" viewBox="0 0 540 222" role="img" aria-label="Схема России по округам">';
for(var i=1;i<=8;i++){var b=FDB[i];s+='<rect x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" rx="8" fill="'+(col[i]||'#dfe3ea')+'" stroke="'+(i===mine?'#27324a':'#fff')+'" stroke-width="'+(i===mine?3:2)+'"/>'+
'<text x="'+(b[0]+b[2]/2)+'" y="'+(b[1]+b[3]/2+4)+'" text-anchor="middle">'+esc(FDN[i])+'</text>';}
return s+'</svg>';}
var CA='#f2a65a',CB='#6fa8dc';
function pgReg(el,op){var q=rq(),z=H(),R=(D&&D.RG)||[];if(!q){frame(el,op,blk('',P_('Вопросов пока нет.')));return;}
function paint(r){var my=z.ra[q[0]],fd=rgFd(),col={},h='',live0=0;
if(r&&r.fd){for(var i=1;i<=8;i++){var x=r.fd[i]||r.fd[String(i)];if(x&&(+x[0]+ +x[1])>=5){col[i]=+x[0]>=+x[1]?CA:CB;live0=1;}}}
if(my&&fd&&!col[fd])col[fd]=my===1?CA:CB;
var b='';[2,3].forEach(function(j,o){b+='<button type="button" class="z4h-opt z4h-ra'+(my===o+1?' on':'')+'" data-o="'+o+'"'+(my?' disabled':'')+'>'+esc(q[j])+'</button>';});
h+=blk('🗺️ '+esc(q[1]),(q[4]?P_(q[4],1):'')+'<div class="z4h-opts">'+b+'</div>'+(my?P_('Твой ответ записан. Перерешать нельзя — Валентина Петровна за этим следит.',1):''));
h+=blk('Как говорят по России',svgMap(col,fd)+'<div class="z4h-leg"><span><i class="z4h-sw" style="background:'+CA+'"></i>'+esc(q[2])+'</span><span><i class="z4h-sw" style="background:'+CB+'"></i>'+esc(q[3])+'</span><span><i class="z4h-sw" style="background:#dfe3ea"></i>пока мало ответов</span></div>'+
P_(live0?'Округ красится, когда ответили хотя бы пятеро. Схема по округам, без точных границ.':'Ответы копятся — округ покрасится, когда ответят хотя бы пятеро. Это может занять не один месяц.',1));
var o='<option value="0">не скажу</option>',g=0;for(var j=0;j<R.length;j++){if(R[j][0]!==g){if(g)o+='</optgroup>';g=R[j][0];o+='<optgroup label="'+esc(FDN[g])+'">';}
o+='<option value="'+(j+1)+'"'+(z.rg===j+1?' selected':'')+'>'+esc(R[j][1])+'</option>';}if(g)o+='</optgroup>';
h+=blk('Твой край',P_('Только если хочешь: ответ попадёт в свой округ. Из профиля мы ничего не берём.',1)+'<select class="z4h-sel">'+o+'</select>');
frame(el,op,h);
btns(el,'.z4h-ra',function(v){var g2=rqPick(q,+v);say((T('z4h.reg.ok')||'Записала!')+(g2?' +'+coin(g2):''));paint(r);});
var se=el.querySelector('.z4h-sel');if(se)se.onchange=function(){var v=+se.value||0;z.rg=v>0&&v<=R.length?v:0;sv();ev('rgn',{fd:rgFd()});paint(r);};}
paint(null);
live('h4_rg',{q:q[0]}).then(function(r){if(r&&r.fd&&ZB.cur==='z4chat'&&CUR&&CUR.op===op&&op.p==='reg')paint(r);});}
function openGift(){css();load().then(function(){giftOpen(function(g){if(!g)return;
var d=document.createElement('div'),df='';d.className='z4h-ov';try{var x=(typeof DEFS!=='undefined'&&DEFS&&DEFS[g.w])||(typeof GLOSS!=='undefined'&&GLOSS&&GLOSS[g.w]);if(x)df=String(typeof x==='string'?x:x[0]||'').slice(0,140);}catch(e){}
var st='';ST.forEach(function(s,i){st+='<button type="button" class="z4h-opt st z4h-gt" data-o="'+i+'">'+s+'</button>';});
var ty='';(g.ty||[]).forEach(function(x){if(x&&x[0])ty+=P_('Твоё слово «'+String(x[0]).toUpperCase()+'» получили соседи: '+(ST[+x[1]]||'🌸')+' спасибо!',1);});
d.innerHTML='<div class="z4h-ovp" role="dialog"><div class="z4h-big">📦</div><p>Свёрток от '+esc(g.from)+'. Внутри — слово:</p><div class="z4h-word">'+esc(g.w.toUpperCase())+'</div>'+
(df?P_(df,1):'')+P_('А Зина вложила 💡 подсказку — в запас.',1)+ty+P_('Сказать спасибо:',1)+'<div class="z4h-opts">'+st+'</div>'+
'<div class="z4h-row2"><button type="button" class="btn ghost small z4h-gx">Закрыть</button></div></div>';
document.body.appendChild(d);
function close(){try{d.remove();}catch(e){}try{if(typeof ZB.home==='function')ZB.home();}catch(e){}}
btns(d,'.z4h-gt',function(v){if(g.id)Z.srv.send('h4_ty',{id:g.id,s:+v});ev('ty',{s:+v,h:g.id?0:1});
var p=d.querySelector('.z4h-opts');if(p)p.innerHTML='<p>'+ST[+v]+' '+esc(T('z4h.gift.ty',{who:g.nom})||'Спасибо передано.')+'</p>';});
btns(d,'.z4h-gx',close);d.onclick=function(e){if(e.target===d)close();};});});}
window.Z4H={v:1,on:on,items:items,go:go,gift:openGift,_t:{tk:tk,thr:thr,telSim:telSim,telNext:telNext,rq:rq,myWords:myWords,load:load}};
load();
})();
