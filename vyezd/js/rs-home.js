(function(){'use strict';
var W=window,D=document;
if(!W.UI||!W.VY||!W.homeSlots||!W.V3||!V3.reg)return;
if(!V3.reg('rs',{s:'RS',t:'реструктуризация 30.10'}))return;
if(!V3.reg('rs.home',{s:'RS-П1',t:'новый главный: 6 вещей, панель 4 кнопки'}))return;
var html=D.documentElement;html.classList.add('rsh');
function $(id){return D.getElementById(id);}
function L(a,b){return VY.L(a,b);}
function ok(f,d){try{return f();}catch(e){return d;}}
function esc(s){return UI.esc(s);}
function ev(a,o){ok(function(){V3.ev('rsh',(function(){var x={a:a};for(var k in o)x[k]=o[k];return x;})());});}
function idx(){return Math.max(0,((VY.S&&VY.S.unlocked)||1)-1);}
function wide(){return!!(W.matchMedia&&matchMedia('(min-width:860px) and (min-height:600px) and (min-aspect-ratio:1/1)').matches);}
function ctx(){return{S:VY.S,lv:idx()+1,pc:UI.pc(),wide:wide()};}
function run(go){if(!go)return;if(typeof go==='function')go();else UI.go(go);}
var EVS=[],TODAY=[],TGT={},GATE=[],DOTS={};
var RSH=W.RSH={on:true,
event:function(fn,order){EVS.push({fn:fn,o:order==null?50:order});EVS.sort(function(a,b){return a.o-b.o;});RSH.refresh();},
today:function(fn){TODAY.push(fn);RSH.refresh();},
target:function(id,t){TGT[id]=t;},
gate:function(fn){GATE.push(fn);navAll();},
dot:function(id,fn){DOTS[id]=fn;},
go:function(id){var t=tgt(id);ev('nav',{k:id});run(t);},
nav:function(el,cur){navFill(el,cur);},
say:function(t){say(t);},
refresh:function(){if(UI.cur==='home')ok(paint);navAll();}};
function slotById(id){var a=UI.list(homeSlots);for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null;}
function thing(at){var o=ok(function(){return UI.objs(homeSlots,ctx(),'thing');},[]);var r=null;for(var i=0;i<o.length;i++)if(o[i]&&o[i].at===at)r=o[i];return r;}
RSH.event(function(){var s=slotById('fest');if(!s||!s.render)return null;var h=ok(function(){return s.render(ctx());},null);if(!h||typeof h!=='string')return null;
return{raw:h,mount:s.mount};},10);
RSH.event(function(){var x=thing('night');if(!x||!x.hot)return null;var morn=/утр|morning/i.test(x.t||'');
return{ic:morn?'🌅':'🌙',t:morn?L('Утро: разъезд после вечернего двора','Morning: drive out after the evening yard'):L('Вечерний двор','Evening yard'),s:x.t,go:x.go,cls:'night'};},20);
function todayDef(){var st=ok(function(){return streakState();},null);
if(st&&!st.claimed&&VY.S.levelsDone>0)return{h:L('На сегодня','Today'),t:L('Гостинец · день '+st.day+' из 7','Gift · day '+st.day+' of 7'),b:L('Забрать','Collect'),go:'gift'};
var lk=ok(function(){return dailyLocked();},true),d=!lk&&ok(function(){return(VY.S.daily||{})[todayKey()];},0);
if(!lk&&!d)return{h:L('На сегодня','Today'),t:L('Двор дня','Yard of the day'),s:'+'+ok(function(){return DAILY_REWARD;},20)+' 💰',b:L('Сделать','Go'),go:'daily'};
return null;}
function todayCur(){for(var i=TODAY.length-1;i>=0;i--){var r=ok(function(){return TODAY[i](ctx());},undefined);if(r!==undefined)return r;}return todayDef();}
var NAV=[{id:'home',ic:'🏠',t:['Двор','Yard']},{id:'map',ic:'🗺️',t:['Маршрут','Route']},{id:'my',ic:'🏡',t:['Мой двор','My yard']},{id:'rest',ic:'🎲',t:['Отдых','Leisure']}];
function tgt(id){if(TGT[id])return TGT[id];
if(id==='home')return'home';if(id==='map')return'map';
if(id==='my')return UI.has('rs-my')?'rs-my':UI.has('my')?'my':'garage-yard';
if(id==='rest')return UI.has('rest')?'rest':UI.has('rs-rest')?'rs-rest':UI.has('garazhi')?'garazhi':'garage';return id;}
function navOld(id){var a=UI.list(navSlots);for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null;}
var FRESH={my:'myyard',rest:'rest'};
function dotOf(id){if(DOTS[id])return ok(DOTS[id],false);
if((id==='my'||id==='rest')&&W.RSS&&RSS.on&&RSS.dot)return ok(function(){return!!RSS.dot(id);},false);
if(FRESH[id]&&ok(function(){return!!(W.RSD&&RSD.fresh&&RSD.fresh(FRESH[id]));},false))return true;
if(id==='my')return ok(function(){return!!(W.MY&&MY.dot&&MY.dot());},false)||ok(function(){return setsReady();},false);
if(id==='rest'){var g=navOld('garazhi');return!!(g&&g.dot&&ok(g.dot,false));}
return false;}
function shownIds(){var o=[];for(var i=0;i<NAV.length;i++){var id=NAV[i].id,v=true;for(var j=0;j<GATE.length;j++)if(ok(function(){return GATE[j](id);},true)===false)v=false;if(v)o.push(NAV[i]);}return o;}
var CUR={home:'home',map:'map',my:'my','rs-my':'my',garage:'my',album:'my',league:'my',garazhi:'rest',avtodrom:'rest',tolik:'rest','rs-rest':'rest',rest:'rest'};
function navFill(el,cur){if(!el)return;var it=shownIds(),h='',dotDone=false;cur=CUR[cur]||cur;
for(var i=0;i<it.length;i++){var x=it[i],dot=!dotDone&&x.id!==cur&&dotOf(x.id);if(dot)dotDone=true;
h+='<button class="unB rsB'+(x.id===cur?' on':'')+'" data-nav="'+x.id+'"'+(x.id===cur?' aria-current="page"':'')+'><span class="unI">'+x.ic+'</span><span class="unT">'+esc(L(x.t[0],x.t[1]))+'</span>'+(dot?'<i class="unDot"></i>':'')+'</button>';}
el.innerHTML=h;el.classList.add('rsNav');
var q=el.querySelectorAll('[data-nav]');for(var k=0;k<q.length;k++)(function(b){b.onclick=function(){var id=b.getAttribute('data-nav');ok(function(){SND.tap();});
if(id==='home'&&UI.cur==='home')return;RSH.go(id);};})(q[k]);}
UI.navFill=navFill;
var NONAV={game:1,home:1,map:1};
function secOf(n){var s=$('scr-'+n);return s&&s.classList.contains('screen')?s:null;}
function onScreen(n){if(NONAV[n])return;var s=secOf(n);if(!s)return;
if(!(n in CUR)&&!/^rs-/.test(n)&&n!=='lavka'&&n!=='shop')return;
var nv=s.querySelector(':scope>nav.unav');if(!nv){nv=D.createElement('nav');nv.className='unav rsNavX';s.appendChild(nv);s.classList.add('rsHasNav');}
navFill(nv,n);backWord(s);var k=FRESH[CUR[n]];if(k)ok(function(){if(W.RSD&&RSD.seen)RSD.seen(k);});}
function navAll(){var q=D.querySelectorAll('nav.rsNav');for(var i=0;i<q.length;i++){var s=q[i].closest('.screen');var n=s&&s.id?s.id.replace(/^scr-/,''):UI.cur;if(s&&s.classList.contains('on'))navFill(q[i],n);}}
function backWord(s){var hd=s.querySelector('header');if(!hd)return;var b=hd.querySelector('button');if(!b||b.__rsb)return;
var t=(b.textContent||'').trim(),a=(b.getAttribute('aria-label')||'');if(!/^(←|‹|<|⬅|⬅️|✕|×)$/.test(t)&&!/назад|back/i.test(a))return;
b.__rsb=1;b.classList.add('rsBack');b.innerHTML='<span aria-hidden="true">‹</span> '+esc(L('Назад','Back'));}
UI.on('screen',function(n){html.classList.toggle('rshCur',n==='home');});
ok(function(){UI.keys.hint('home',function(){return L('Enter — выехать','Enter — drive');});});
UI.on('screen',function(n){setTimeout(function(){ok(function(){onScreen(n);});},0);});
var LINES0=[['Я из окна всё вижу. Даже то, чего не было.','I see everything from my window. Even what didn’t happen.'],['Пирожки остывают, а двор сам себя не освободит.','The pies are getting cold, and the yard won’t clear itself.'],
['Выезжай аккуратно — клумбу Михалыч только вчера покрасил.','Drive carefully — Mikhalych painted the flower bed yesterday.'],['Главное в выезде — не торопиться. И не стоять.','The trick to getting out: don’t rush. And don’t stand still.']];
var said=null,taps=0,lastI=-1;
function short(t){t=String(t||'').replace(/\s+/g,' ').trim();if(t.length<=80)return t;var c=t.slice(0,80),k=Math.max(c.lastIndexOf('. '),c.lastIndexOf('! '),c.lastIndexOf('? '));return k>30?c.slice(0,k+1):c.replace(/\s+\S*$/,'')+'…';}
function nextLine(){var t=null;
ok(function(){if(W.V3T&&V3T.on&&V3T.on()){var r=V3T.line('shura')||V3T.line('bench');if(r&&r.t)t=V3T.fill?V3T.fill(r.t,{lv:idx()+1}):r.t;}});
if(!t||/\{/.test(t)){var a=(W.V3SKIN&&V3SKIN.lines)||null,o=[];if(a)for(var i=0;i<a.length;i++)if(a[i][0]==='shura')o.push([a[i][1],a[i][2]]);if(!o.length)o=LINES0;
var k=Math.floor(Math.random()*o.length);if(k===lastI)k=(k+1)%o.length;lastI=k;t=L(o[k][0],o[k][1]);}
return short(t);}
function benchCv(cv){var r=cv.getBoundingClientRect(),dpr=Math.min(2,W.devicePixelRatio||1),w=Math.max(40,r.width),h=Math.max(30,r.height);
cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);var g=cv.getContext('2d');if(!g)return;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
var s=Math.min(h/2.0,w/4.2),y=h-s*.42;
g.fillStyle='#8a6a4a';g.fillRect(w*.08,y-s*.18,w*.84,s*.16);g.fillStyle='#6d5038';g.fillRect(w*.12,y-s*.02,s*.12,s*.4);g.fillRect(w*.88-s*.12,y-s*.02,s*.12,s*.4);
g.fillStyle='#a07a52';g.fillRect(w*.08,y-s*.62,w*.84,s*.12);
ok(function(){if(W.VYPEOPLE&&VYPEOPLE.fig){VYPEOPLE.fig('shura',g,w*.32,y,s);VYPEOPLE.fig('ded',g,w*.68,y,s*.96);}else{shuraFig(g,w*.32,y,s);dedFig(g,w*.68,y,s*.96);}});}
function sayTo(t){var e=D.querySelector('#scr-home .rsSayT');if(!e)return;e.textContent=t;var b=e.parentNode;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');}
function say(t){said=short(t)||nextLine();sayTo(said);}
function benchTap(){taps++;ok(function(){tone('triangle',660,880,.08,.03);});var b=thing('bench'),due=b&&b.badge;
if(b&&typeof b.go==='function'&&(due||taps%4===0)&&!(W.V3SKIN&&b.go===V3SKIN.say)){ev('bench',{k:'open'});b.go();return;}
ev('bench',{k:'line'});say();}
function evHtml(e){if(e.raw){var m=/<button[\s\S]*?<\/button>/.exec(e.raw);return m?m[0]:e.raw;}
return'<button class="rsEvB '+esc(e.cls||'')+'"><span class="rsEvI">'+(e.ic||'⭐')+'</span><span class="rsEvT"><b>'+esc(e.t||'')+'</b>'+(e.s&&e.s!==e.t?'<small>'+esc(e.s)+'</small>':'')+'</span><i class="rsEvG">›</i></button>';}
function evCur(){var c=ctx();for(var i=0;i<EVS.length;i++){var r=ok(function(){return EVS[i].fn(c);},null);if(r===false)return null;if(r)return r;}return null;}
function routeHtml(){var S=VY.S,n=0,st=S.stars||{};for(var k in st)n+=st[k]||0;var nm=ok(function(){return yardName(idx());},'');
return'<button class="rsRoute" data-go="map"><span>🗺️ '+esc(L('Маршрут','Route'))+(nm?': '+esc(nm):'')+'</span><b>★ '+n+'</b></button>';}
function paint(){var sec=$('scr-home');if(!sec)return;var body=sec.querySelector('.hBody'),colA=sec.querySelector('.hColA'),colB=sec.querySelector('.hColB');if(!body||!colA||!colB)return;
var wd=sec.classList.contains('wide'),c=ctx();sec.classList.add('rsHome');
var bn=colA.querySelector('.rsBench');if(!bn){bn=D.createElement('button');bn.className='rsBench';bn.setAttribute('aria-label',L('Баба Шура на лавочке: ещё словечко','Granny Shura on the bench: another word'));
bn.innerHTML='<span class="rsBenchF"><canvas class="rsBcv"></canvas></span><span class="rsSay" aria-live="polite"><b>'+esc(L('Баба Шура','Granny Shura'))+'</b><span class="rsSayT"></span></span>';
var hh=$('hHouse');if(hh&&hh.parentNode===colA)colA.insertBefore(bn,hh.nextSibling);else colA.appendChild(bn);
bn.onclick=benchTap;}
if(!said)said=nextLine();bn.querySelector('.rsSayT').textContent=said;
requestAnimationFrame(function(){var cv=bn.querySelector('.rsBcv');if(cv)ok(function(){benchCv(cv);});});
var box=colB.querySelector('.rsBox');if(!box){box=D.createElement('div');box.className='rsBox';colB.insertBefore(box,colB.firstChild);}
var h='';if(wd)h+=routeHtml();
var e=evCur();if(e)h+='<div class="rsEv">'+evHtml(e)+'</div>';
var t=todayCur();if(t)h+='<div class="rsToday"><div class="rsTdT"><small>'+esc(t.h||L('На сегодня','Today'))+'</small><b>'+esc(t.t||'')+'</b>'+(t.s?'<em>'+esc(t.s)+'</em>':'')+'</div>'+(t.b?'<button class="btn green rsTdB">'+esc(t.b)+'</button>':'')+'</div>'
+(wd&&t.next?'<div class="rsNext">'+esc(t.next)+'</div>':'');
box.innerHTML=h;UI.bind(box);
if(e){var eb=box.querySelector('.rsEv button');if(eb){if(e.raw){if(e.mount)ok(function(){e.mount(box.querySelector('.rsEv'),c);});}else eb.onclick=function(){ev('ev',{k:e.cls||''});run(e.go);};}}
if(t){var tc=box.querySelector('.rsToday'),go=function(){ev('today',{k:'b'});run(t.go);};var tb=box.querySelector('.rsTdB');if(tb)tb.onclick=function(x){x.stopPropagation();go();};
if(t.open||t.go)tc.onclick=function(){ev('today',{k:'card'});run(t.open||t.go);};}
var g=$('hGo');if(g&&wd&&g.parentNode===colB&&g!==colB.lastElementChild)colB.appendChild(g);
if(g){var sm=g.querySelector('small');if(sm&&wd&&!/Enter/.test(sm.textContent))sm.textContent+=' · Enter';}
navFill($('hNav'),'home');
var stp=$('hStars');if(stp&&stp.parentNode&&stp.parentNode.classList.contains('pill'))stp.parentNode.classList.add('rsHide');
if(!wd){requestAnimationFrame(function(){ok(fit);});setTimeout(fitSoon,400);}
var rs=sec.querySelectorAll('#hHouse [data-res]');for(var j=0;j<rs.length;j++){rs[j].removeAttribute('tabindex');rs[j].removeAttribute('role');rs[j].onclick=null;rs[j].onkeydown=null;}
var hb=sec.querySelectorAll('#hHouse .hBadge');for(var i=0;i<hb.length;i++)hb[i].parentNode.removeChild(hb[i]);}
function fit(){var sec=$('scr-home'),b=sec&&sec.querySelector('.hBody'),sv=sec&&sec.querySelector('#hHouse svg.hHouse');if(!b||!sv||sec.classList.contains('wide'))return;
sv.style.maxHeight='';sec.classList.remove('rsTight');var over=b.scrollHeight-b.clientHeight;if(over<=1)return;var h=sv.getBoundingClientRect().height;sv.style.maxHeight=Math.max(96,Math.floor(h-over-2))+'px';
over=b.scrollHeight-b.clientHeight;if(over<=1)return;sec.classList.add('rsTight');
over=b.scrollHeight-b.clientHeight;if(over>1){h=sv.getBoundingClientRect().height;sv.style.maxHeight=Math.max(72,Math.floor(h-over-2))+'px';}}
function fitSoon(){if(UI.cur!=='home')return;clearTimeout(fitSoon.t);fitSoon.t=setTimeout(function(){ok(fit);},80);}
ok(function(){V3.sub('rs:today',fitSoon,'rs.home');});
if(UI.homeRender){var hr0=UI.homeRender;UI.homeRender=function(){var r=hr0.apply(this,arguments);ok(paint);return r;};}
UI.on('home',function(){ok(paint);setTimeout(function(){ok(paint);},60);});
UI.on('map',function(){ok(function(){navFill($('mNav2'),'map');});});
UI.on('coins',function(){if(UI.cur==='home'){clearTimeout(paint.t);paint.t=setTimeout(function(){ok(paint);},120);}});
if(UI.cur==='home')html.classList.add('rshCur');
UI.on('skin:scene',function(){if(UI.cur==='home')ok(paint);});
W.addEventListener('resize',function(){if(UI.cur==='home')setTimeout(function(){ok(paint);},220);});
if(UI.cur==='home')UI.refresh();
ev('on',{w:wide()?1:0});
})();