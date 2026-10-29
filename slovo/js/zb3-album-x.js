'use strict';
(function(){
var AL=window.Z3ALB;if(!AL||AL.render)return;
var CARD=Z3.reg('z3a-card',{t:'Комод: открытка-звание «Поделиться» (без награды)',who:'ALBUM'});
function cardGo(id){var f=function(){if(AL.card)AL.card(id);};if(AL.card)return f();ZB.load('js/zb3-album-card.js').then(f,function(){try{toast('Открытка не загрузилась — попробуй ещё раз',3000);}catch(e){}});}
var GIFT=Z3.reg('z3a-gift',{t:'Комод: подарить лишнюю карточку шутки другу (без награды)',who:'ALBUM'});
var FOTO=Z3.reg('z3a-foto',{t:'Комод: фотоальбом Зины по сезонам сериала',who:'ALBUM'});
function lazy(f,src){return AL[f]?Promise.resolve():ZB.load(src);}
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function snd(){try{SND.tap();}catch(e){}}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function zina(m){try{return zinaSVG(m||'happy');}catch(e){return'';}}
var MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dt(k){k=+k||0;if(!k)return'';return(k%100)+' '+MON[(Math.floor(k/100)%100)-1];}
function dnKey(dn){var d=new Date(Date.UTC(2026,0,5)+dn*864e5);return d.getUTCFullYear()*1e4+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function T(k,ctx){return AL.T(k,ctx);}
function merge(a,b){var o={},k;for(k in a)o[k]=a[k];for(k in b)o[k]=b[k];return o;}
var SRC={lv:'в уровне',word:'на найденное слово',home:'во дворе',win:'из словаря',num:'из «Вечёрки»',paper:'из «Вечёрки»',scene:'сценка'};
var css0=0;function css(){if(css0)return;css0=1;var s=document.createElement('style');s.id='z3aCss';s.textContent=
'.z3a-scr{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--z3-bg);color:var(--z3-ink);font-family:var(--z3-font)}'+
'.z3a-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--z3-paper);border-bottom:1px solid var(--z3-line)}'+
'.z3a-hd .btn{min-height:44px;white-space:nowrap;flex:0 0 auto}.z3a-hd b{display:block;font:900 19px/1.15 var(--z3-font-head)}.z3a-hd small{display:block;font-size:13.5px;color:var(--z3-ink2)}'+
'.z3a-body{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px 24px}'+
'.z3a-say{display:flex;gap:10px;align-items:flex-end;max-width:520px;margin:0 auto 6px}.z3a-av{width:64px;height:64px;flex:0 0 64px}.z3a-av svg{width:100%;height:100%}'+
'.z3a-bub{background:var(--z3-paper);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);padding:10px 14px;font-size:15px;line-height:1.35}'+
'.z3a-dr{max-width:520px;margin:0 auto}.z3a-top{height:96px;display:block}.z3a-top svg{width:100%;height:100%;display:block}'+
'.z3a-body2{background:var(--z3-a-body);border-radius:10px 10px 6px 6px;padding:10px;box-shadow:var(--z3-shadow);border-top:8px solid var(--z3-a-edge)}'+
'.z3a-box{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;margin:0 0 10px;padding:8px 12px;border:0;border-radius:8px;background:var(--z3-a-drawer);'+
'box-shadow:inset 0 -4px 0 var(--z3-a-edge);font:inherit;color:var(--z3-ink);cursor:pointer;text-align:left;position:relative}.z3a-box:last-child{margin-bottom:0}'+
'.z3a-box:active{transform:translateY(2px)}.z3a-knob{flex:0 0 18px;height:18px;border-radius:50%;background:var(--z3-a-knob);box-shadow:0 2px 0 var(--z3-a-edge)}'+
'.z3a-lab{flex:1 1 auto;min-width:0;background:var(--z3-paper);border-radius:6px;padding:6px 10px;box-shadow:0 1px 0 var(--z3-a-edge)}'+
'.z3a-lab b{display:block;font-size:16px;line-height:1.2}.z3a-lab small{display:block;font-size:13.5px;color:var(--z3-ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.z3a-box em{position:absolute;right:6px;top:-6px;min-width:22px;height:22px;border-radius:11px;background:var(--z3-red);color:#fff;font:800 13.5px/22px var(--z3-font);text-align:center;font-style:normal;padding:0 5px}'+
'.z3a-legs{display:flex;justify-content:space-between;padding:0 18px}.z3a-legs i{width:22px;height:14px;background:var(--z3-a-edge);border-radius:0 0 6px 6px}'+
'.z3a-chips{display:flex;gap:8px;justify-content:center;margin:0 0 10px;flex-wrap:wrap}.z3a-chips .btn{min-height:44px}'+
'.z3a-view{max-width:460px;margin:0 auto;touch-action:pan-y}.z3a-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}'+
'.z3a-nav .btn{min-width:64px;min-height:48px;font-size:20px}.z3a-nav span{font-size:14px;color:var(--z3-ink2)}'+
'.z3a-card{background:var(--z3-a-card);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);padding:18px 18px 14px;position:relative;min-height:220px;display:flex;flex-direction:column;justify-content:center}'+
'.z3a-card .t{font-family:var(--z3-font-hand);font-size:24px;line-height:1.25;margin:6px 0 12px}.z3a-card .f{font-size:13.5px;color:var(--z3-ink2)}'+
'.z3a-card.gold{box-shadow:0 0 0 3px var(--z3-gold),var(--z3-shadow)}.z3a-rib{position:absolute;right:12px;top:-10px;background:var(--z3-gold);color:var(--z3-ink);font-weight:800;font-size:13.5px;border-radius:8px;padding:3px 9px}'+
'.z3a-vy{align-items:center;text-align:center;background:var(--z3-a-linen)}.z3a-vy svg{max-width:100%;height:auto}.z3a-vy h3,.z3a-pc h3,.z3a-rk h3{margin:8px 0 4px;font:900 20px/1.2 var(--z3-font-head)}'+
'.z3a-pc{padding:10px}.z3a-pic{height:200px;border-radius:14px;overflow:hidden;background:var(--z3-line);position:relative}.z3a-pic svg{width:100%;height:100%;display:block}'+
'.z3a-st{position:absolute;right:8px;top:8px;width:46px;height:54px;background:var(--z3-paper);border:2px dashed var(--z3-red);border-radius:4px;font-size:26px;line-height:50px;text-align:center}'+
'.z3a-pc .tx{padding:4px 8px}.z3a-pc .tx p{margin:4px 0 0;font-family:var(--z3-font-hand);font-size:21px;line-height:1.2}'+
'.z3a-rk{text-align:center;border:3px double var(--z3-gold)}.z3a-rk .md{font-size:44px;line-height:1}.z3a-rk p{margin:8px 0 0;font-size:15.5px;line-height:1.35}.z3a-rk.lock{border-color:var(--z3-line)}.z3a-rk.lock .md{filter:grayscale(1);opacity:.6}'+
'.z3a-pd{max-width:460px;margin:0 auto}.z3a-pd .z3a-card{min-height:0}.z3a-pd dl{margin:6px 0 0;display:grid;grid-template-columns:1fr auto;gap:8px 12px;font-size:15.5px}.z3a-pd dt{color:var(--z3-ink2)}.z3a-pd dd{margin:0;font-weight:800;text-align:right}'+
'.z3a-pd .stz{font-family:var(--z3-font-hand);font-size:26px;text-align:center;margin:4px 0 8px}.z3a-go{display:block;width:100%;margin-top:14px;min-height:48px}'+
'.z3a-empty{max-width:460px;margin:0 auto}.z3a-empty .z3a-card{text-align:center;font-size:16px;line-height:1.4}'+
'@media (min-width:860px){.z3a-body{padding:18px 24px 30px}.z3a-top{height:120px}}';
document.head.appendChild(s);}
function hdr(title,sub,back){return'<div class="z3a-hd"><button type="button" class="btn ghost small" data-go="'+back+'">‹ '+(back==='home'?'Двор':'Комод')+'</button>'+
'<div><b>'+esc(title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</div></div>';}
function bindBack(el){[].forEach.call(el.querySelectorAll('[data-go]'),function(b){b.onclick=function(){snd();var a=b.getAttribute('data-go');
if(a==='home'){try{if(typeof openMenu==='function')openMenu();else ZB.go('home');}catch(e){}}else ZB.go('z3album',{});};});}
function artTop(el){var box=el.querySelector('.z3a-top');if(!box)return;var f=function(){if(window.Z3ART&&Z3ART.album&&box.isConnected)box.innerHTML=Z3.art('album',{});};
if(window.Z3ART&&Z3ART.album)f();else(Z3.artLoad?Z3.artLoad('album'):ZB.load('js/zb3-art-album.js')).then(f,function(){});}
function gold(){var s=null;try{s=Z3.srv&&Z3.srv.peek?Z3.srv.peek('jk'):null;}catch(e){}
if(s&&s.gold&&s.gold.length&&!s._sim){var o={};s.gold.forEach(function(id){o['i'+id]=1;});return{sv:1,has:function(c){return!!o['i'+c.i];}};}
var H={};((window.Z3AD&&Z3AD.gold)||[]).forEach(function(h){H[h]=1;});return{sv:0,has:function(c){return!!H[AL.h32(AL.norm(c.t))];}};}
function boxes(st){var z=AL.A(),J=AL.cards(),g=gold(),gn=J.filter(g.has).length,ps=AL.pst(),V=AL.vyPics(),C=AL.chapsDone(),tr=AL.topRank(),nr=0;
AL.RANKS.forEach(function(r,i){if(z.t&(1<<i))nr++;});
return[
['j','😂','Альбом шуток',J.length?J.length+' '+pl(J.length,'шутка','шутки','шуток')+(gn?' · ★ '+gn:''):'пока пусто',''],
['v','🧵','Рушники',V.length?V.length+' из '+(window.Z3PD&&Z3PD.vy?Z3PD.vy.length:12)+' вышито':'вышивка — по четвергам',''],
['p','📰','Подшивка «Вечёрки»',ps.n?ps.n+' '+pl(ps.n,'номер','номера','номеров')+(ps.d1?' · с '+dt(ps.d1):''):'пока ни одного номера',''],
['c','💌','Открытки мест',C.length?C.length+' '+pl(C.length,'открытка','открытки','открыток'):'первая — за главу',''],
['r','🏅','Звания',tr?(AL.rname(tr)||nr+' '+pl(nr,'звание','звания','званий')):'пока без звания',AL.unseen()?'!':''],
['o','👗','Наряды и блюдца','Облики Зины','']].concat(FOTO&&AL.fotoBox?[AL.fotoBox()]:[]).sort(function(a,b){return(a[0]==='o')-(b[0]==='o');});}
function dresser(el,op){var z=AL.A(),st=AL.check(),t=Z3.tk(),first=!z.f;if(first)z.f=t;z.v=t;AL.sv();
var nu=AL.unseen(),say='';if(nu){var id='';AL.RANKS.forEach(function(r,i){if(nu&(1<<i))id=r[0];});say=T('rank-new',{rank:AL.rname(id)});}
if(op.gin>0)say=T(op.gin===2?'gift-dup':'gift-in')||'Тебе подарили карточку шутки! Вклеила в альбом.';
if(!say)say=T('hi')||'Открываю комод. Тут всё наше.';
var B=boxes(st),h='<div class="z3a-scr">'+hdr('Комод Зины',AL.rname(AL.topRank())?'звание: '+AL.rname(AL.topRank()):'альбом дома №7','home')+'<div class="z3a-body">'+
'<div class="z3a-say"><div class="z3a-av">'+zina('happy')+'</div><div class="z3a-bub">'+esc(say)+'</div></div>'+
'<div class="z3a-dr"><div class="z3a-top"></div><div class="z3a-body2">';
B.forEach(function(b){h+='<button type="button" class="z3a-box" data-s="'+b[0]+'"><span class="z3a-knob"></span><span class="z3a-lab"><b>'+b[1]+' '+esc(b[2])+'</b><small>'+esc(b[3])+'</small></span>'+(b[4]?'<em>'+b[4]+'</em>':'')+'</button>';});
h+='</div><div class="z3a-legs"><i></i><i></i></div></div></div></div>';el.innerHTML=h;bindBack(el);artTop(el);
[].forEach.call(el.querySelectorAll('.z3a-box'),function(b){b.onclick=function(){snd();var s=b.getAttribute('data-s');AL.ev('shelf',{s:s});
if(s==='o'){AL.ev('shop',{});try{openShop();}catch(e){}return;}ZB.go('z3album',{s:s});};});
AL.ev('open',{d:Math.min(Z3.day(),99),j:AL.cards().length,v:st.v,p:st.p,c:st.c,r:AL.topRank(),f:first?1:0});}
function viewer(el,list,i,draw,onI){var n=list.length;i=Math.max(0,Math.min(n-1,i|0));var v=el.querySelector('.z3a-view');
function show(){v.innerHTML='<div class="z3a-cardbox">'+draw(list[i],i)+'</div>'+(n>1?'<div class="z3a-nav"><button type="button" class="btn ghost z3a-pv" aria-label="Назад"'+(i?'':' disabled')+'>◀</button>'+
'<span>'+(i+1)+' из '+n+'</span><button type="button" class="btn ghost z3a-nx" aria-label="Дальше"'+(i<n-1?'':' disabled')+'>▶</button></div>':'');
var p=v.querySelector('.z3a-pv'),x=v.querySelector('.z3a-nx');if(p)p.onclick=function(){go(-1);};if(x)x.onclick=function(){go(1);};if(onI)onI(list[i],i,v);}
var flips=0;function go(d){var j=i+d;if(j<0||j>=n)return;snd();i=j;flips++;show();}
var x0=null;v.addEventListener('touchstart',function(e){x0=e.touches&&e.touches[0]?e.touches[0].clientX:null;},{passive:true});
v.addEventListener('touchend',function(e){if(x0==null)return;var t=e.changedTouches&&e.changedTouches[0];if(t){var dx=t.clientX-x0;if(Math.abs(dx)>50)go(dx<0?1:-1);}x0=null;},{passive:true});
show();return function(){return flips;};}
function empty(el,title,txt){el.innerHTML='<div class="z3a-scr">'+hdr(title,'','al')+'<div class="z3a-body"><div class="z3a-empty">'+
'<div class="z3a-say"><div class="z3a-av">'+zina('norm')+'</div><div class="z3a-bub">'+esc(txt)+'</div></div></div></div></div>';bindBack(el);}
var FL=null;function flipStat(s,f){if(FL&&FL.f&&FL.f())AL.ev('flip',{s:FL.s,n:FL.f()});FL=f?{s:s,f:f}:null;}
var SH={
j:function(el,op){var g=gold(),all=AL.cards().slice().reverse(),gl=all.filter(g.has),L=op.g?gl:all;
if(!all.length){empty(el,'Альбом шуток',T('j-empty')||'Шуток пока нет. Жми 😂 под репликой — вклею сюда.');return;}
el.innerHTML='<div class="z3a-scr">'+hdr('Альбом шуток',all.length+' '+pl(all.length,'шутка','шутки','шуток'),'al')+'<div class="z3a-body">'+
'<div class="z3a-chips"><button type="button" class="btn small'+(op.g?' ghost':'')+'" data-g="0">Все · '+all.length+'</button>'+
'<button type="button" class="btn small'+(op.g?'':' ghost')+'" data-g="1">★ Золотые · '+gl.length+'</button></div>'+
(op.g?'<p style="text-align:center;font-size:14px;color:var(--z3-ink2);margin:0 0 10px">'+esc(T(g.sv?'j-gold':'j-gold0'))+'</p>':'')+
(L.length?'<div class="z3a-view"></div>':'<div class="z3a-card" style="text-align:center;max-width:460px;margin:0 auto">Золотых пока нет. Смейся дальше — найдутся.</div>')+'</div></div>';bindBack(el);
[].forEach.call(el.querySelectorAll('[data-g]'),function(b){b.onclick=function(){snd();var gg=+b.getAttribute('data-g');if(gg)AL.ev('gold',{n:gl.length,sv:g.sv});ZB.go('z3album',{s:'j',g:gg});};});
if(L.length)flipStat('j',viewer(el,L,op.i,function(c){var gd=g.has(c);return'<div class="z3a-card'+(gd?' gold':'')+'">'+(gd?'<span class="z3a-rib">★ золотая</span>':'')+
'<div class="t">'+esc(c.t)+'</div><div class="f">'+(c.s==='gift'?'🎁 подарок от друга':'😂 '+esc(SRC[c.s]||'в игре'))+(c.k?' · '+dt(c.k):'')+'</div>'+
(GIFT?'<button type="button" class="btn ghost z3a-go z3a-gift">🎁 Подарить другу</button><p class="f z3a-gout" style="margin:6px 0 0;overflow-wrap:anywhere"></p>':'')+'</div>';},
function(c,i,v){var b=v.querySelector('.z3a-gift');if(!b)return;lazy('gift','js/zb3-album-gift.js').then(function(){if(!b.isConnected)return;
if(AL.isGiven(c)){b.textContent='✓ Подарена';b.disabled=true;}else if(!AL.giftCan(c))b.style.display='none';
b.onclick=function(){snd();AL.gift(c,b,v.querySelector('.z3a-gout'));};},function(){b.style.display='none';});}));},
v:function(el,op){var V=AL.vyPics();if(!V.length){empty(el,'Рушники',T('vy-empty')||'Рушников нет. Вышивка — в «Вечёрке» по четвергам.');return;}
el.innerHTML='<div class="z3a-scr">'+hdr('Рушники',V.length+' '+pl(V.length,'рушник','рушника','рушников'),'al')+'<div class="z3a-body"><div class="z3a-view"></div></div></div>';bindBack(el);
var go=function(){if(!el.isConnected)return;flipStat('v',viewer(el,V.slice().reverse(),op.i,function(x){var P=window.Z3PD&&Z3PD.vy&&Z3PD.vy[x.p],A=window.Z3ART;
return'<div class="z3a-card z3a-vy">'+(P&&A&&A.albumVy?A.albumVy({bits:P[2],w:220}):'🧵')+'<h3>'+esc(P?P[1]:'Рушник')+'</h3><div class="f">вышит '+esc(dt(dnKey(x.d)))+'</div></div>';}));};
var art=window.Z3ART&&Z3ART.albumVy?Promise.resolve():(Z3.artLoad?Z3.artLoad('album'):ZB.load('js/zb3-art-album.js'));
Promise.all([window.Z3PD?Promise.resolve():ZB.load('js/zb3-paper-data.js'),art]).then(go,go);},
p:function(el){var s=AL.pst();if(!s.n){empty(el,'Подшивка',T('pd-empty')||'Подшивка пустая. Прочитай номер «Вечёрки».');return;}
var say=s.d1?T('pd',{date:dt(s.d1)}):'';
el.innerHTML='<div class="z3a-scr">'+hdr('Подшивка «Вечёрки»','','al')+'<div class="z3a-body"><div class="z3a-pd">'+
(say?'<div class="z3a-say"><div class="z3a-av">'+zina('happy')+'</div><div class="z3a-bub">'+esc(say)+'</div></div>':'')+
'<div class="z3a-card">'+(s.d1?'<div class="stz">Читаете с '+esc(dt(s.d1))+'</div>':'')+'<dl>'+
'<dt>Номеров прочитано</dt><dd>'+s.n+'</dd><dt>Подряд сейчас</dt><dd>'+(s.r||0)+' '+pl(s.r||0,'день','дня','дней')+'</dd>'+
'<dt>Рекорд подряд</dt><dd>'+(s.b||0)+'</dd><dt>Рубрик решено</dt><dd>'+(s.t||0)+'</dd><dt>Загадок соседям</dt><dd>'+(s.qn||0)+'</dd></dl>'+
(Z3.open('paper')&&ZB._scr.z3paper?'<button type="button" class="btn green z3a-go">📰 Листать архив номеров</button>':'')+'</div></div></div></div>';bindBack(el);
var b=el.querySelector('.z3a-go');if(b)b.onclick=function(){snd();AL.ev('shelf',{s:'arch'});ZB.go('z3paper',{arch:1});};},
c:function(el,op){var C=AL.chapsDone();if(!C.length){empty(el,'Открытки мест',T('pc-empty')||'Открытки — за пройденные главы.');return;}
el.innerHTML='<div class="z3a-scr">'+hdr('Открытки мест',C.length+' '+pl(C.length,'открытка','открытки','открыток'),'al')+'<div class="z3a-body"><div class="z3a-view"></div></div></div>';bindBack(el);
flipStat('c',viewer(el,C.slice().reverse(),op.i,function(c){var ch=ZB.chap(c);return'<div class="z3a-card z3a-pc"><div class="z3a-pic" style="background:'+esc(ch.color)+'"><div class="z3a-st">'+esc(ch.e)+'</div></div>'+
'<div class="tx"><h3>'+esc(ch.name)+'</h3><div class="f">глава '+ch.n+' · пройдена</div>'+(ch.s?'<p>'+esc(ch.s)+'</p>':'')+'</div></div>';},
function(c,i,v){var pic=v.querySelector('.z3a-pic');if(!pic)return;ZB.place(c,'xMidYMid slice').then(function(svg){if(svg&&pic.isConnected)pic.insertAdjacentHTML('afterbegin',svg);},function(){});}));},
r:function(el,op){var z=AL.A(),R=AL.RANKS,got=[],lock=[];R.forEach(function(r,i){(z.t&(1<<i)?got:lock).push({r:r,i:i,on:!!(z.t&(1<<i)),nw:!!(z.t&~z.s&(1<<i))});});
var L=got.reverse().concat(lock);if(z.s!==z.t){z.s=z.t;AL.sv();}
el.innerHTML='<div class="z3a-scr">'+hdr('Звания',got.length+' из '+R.length,'al')+'<div class="z3a-body"><div class="z3a-view"></div></div></div>';bindBack(el);
flipStat('r',viewer(el,L,op.i,function(x){var id=x.r[0];if(!x.on)return'<div class="z3a-card z3a-rk lock"><div class="md">🏅</div><h3>Звание за семью замками</h3><p>Как получить: '+esc(x.r[2])+'.</p></div>';
var says=window.Z3T&&Z3T['album-rs-'+id];return'<div class="z3a-card z3a-rk">'+(x.nw?'<span class="z3a-rib">новое!</span>':'')+'<div class="md">🏅</div><div class="f">Грамота · дом №7</div><h3>'+esc(AL.rname(id)||'Звание')+'</h3>'+
(says&&says[0]?'<p>'+esc(says[0])+'</p>':'')+'<div class="f" style="margin-top:8px">за то, что: '+esc(x.r[2])+'</div>'+(CARD?'<button type="button" class="btn blue z3a-go z3a-share" data-r="'+esc(id)+'">📮 Поделиться</button>':'')+'</div>';},
function(x,i,v){var b=v.querySelector('.z3a-share');if(b)b.onclick=function(){cardGo(b.getAttribute('data-r'));};}));}};
AL.ui={hdr:hdr,bindBack:bindBack,viewer:viewer,empty:empty,esc:esc,zina:zina,snd:snd,pl:pl,dt:dt,dnKey:dnKey,flip:flipStat};
AL.render=function(el,op){css();op=op||{};flipStat('',null);
if(GIFT&&!op.s&&!op.gin&&AL.lsG('z3-ajin','')){lazy('gift','js/zb3-album-gift.js').then(function(){var c=AL.giftIn&&AL.giftIn();
if(ZB.cur==='z3album')AL.render(el,{gin:c?(c.dup?2:1):0});},function(){if(ZB.cur==='z3album')AL.render(el,{gin:-1});});return;}
if(FOTO&&!AL.fotoBox&&!op.fl){lazy('fotoBox','js/zb3-album-foto.js').then(function(){if(ZB.cur==='z3album')AL.render(el,merge(op,{fl:1}));},
function(){if(ZB.cur==='z3album')AL.render(el,merge(op,{fl:1}));});return;}
if(op.s==='f'&&FOTO&&AL.foto){ZB.safe('z3a-f',function(){AL.foto(el,op);});return;}
if(op.s&&SH[op.s]){ZB.safe('z3a-'+op.s,function(){SH[op.s](el,op);});return;}
dresser(el,op);};
document.addEventListener('visibilitychange',function(){if(document.hidden)flipStat('',null);});
})();
