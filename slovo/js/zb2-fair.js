'use strict';
(function(){
if(!window.ZB||!window.ZB2)return;
window.ZE_PIC={
portfel:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="28" ry="4" fill="#000" opacity=".12"/><path d="M28 24v-6h24v6" fill="none" stroke="#7a4a1f" stroke-width="4"/><rect x="10" y="24" width="60" height="44" rx="7" fill="#b5651d"/><rect x="10" y="24" width="60" height="16" rx="7" fill="#c97a2c"/><rect x="34" y="34" width="12" height="10" rx="2" fill="#f5b400" stroke="#8a5a00" stroke-width="2"/><circle cx="62" cy="58" r="10" fill="#f5b400" stroke="#c98a00" stroke-width="2.5"/><text x="62" y="62.5" font-size="11" font-weight="900" text-anchor="middle" fill="#7a4a00" font-family="Arial">5</text></svg>',
remont_all:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="32" ry="4" fill="#000" opacity=".12"/><path d="M6 34L40 12l34 22z" fill="#c0392b"/><rect x="10" y="34" width="60" height="34" fill="#f3e3c2"/><g fill="#7fb1ff"><rect x="15" y="40" width="9" height="9"/><rect x="29" y="40" width="9" height="9"/><rect x="43" y="40" width="9" height="9"/><rect x="57" y="40" width="9" height="9"/></g><rect x="35" y="52" width="10" height="16" fill="#9b6a3c"/><rect x="22" y="24" width="36" height="7" rx="2" fill="#f5b400"/><text x="40" y="29.6" font-size="5.6" font-weight="900" text-anchor="middle" fill="#6b3d00" font-family="Arial">ШКОЛА №7</text><circle cx="64" cy="16" r="7" fill="#f5b400"/><path d="M60 16l3 3 5-6" stroke="#fff" stroke-width="2.2" fill="none"/></svg>',
hw_uzel26:'<svg viewBox="0 0 80 80"><ellipse cx="40" cy="72" rx="26" ry="5" fill="#000" opacity=".12"/><ellipse cx="40" cy="50" rx="26" ry="20" fill="#ef7d1a"/><path d="M28 34c-4 8-4 24 0 34M52 34c4 8 4 24 0 34M40 31v38" stroke="#c45f0c" stroke-width="2.5" fill="none"/><path d="M38 31c0-6 2-10 7-12" stroke="#3a6b2a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M30 46l5-4 5 4zM42 46l5-4 5 4zM31 56c4 4 14 4 18 0" fill="#2b1640"/><path d="M8 10l14 14M8 24L22 10M15 6v22M4 17h22" stroke="#6b3fa0" stroke-width="1.2" opacity=".6"/></svg>'};
var HW=ZB2.reg('hwshop',{t:'Хэллоуинская лавка и наряд узелка',who:'ECO',on:true}),FAIR=ZB2.reg('fair',{t:'Школьная ярмарка',who:'ECO',on:true});
if(!HW&&!FAIR)return;
function E(){return window.ZBECO||null;}
var YA=typeof PLAT!=='undefined'&&PLAT!=='vk';
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function st(ev,o){try{if(window.STAT&&STAT.ev)STAT.ev(ev,o);}catch(e){}}
function own(k,id){return!!(S.own||{})[k+':'+id];}
var ITEMS={
hw_tykva:{t:'o',it:{id:'hw_tykva',n:'Тыквенный платок',d:'Зелёная кофта и рыжий платок в горошек. На огороде тыквы оборачиваются — завидуют.',
c1:'#2f5d3a',c2:'#1f4228',f:'#163020',beads:'amber',scarf:{c:'#ef7d1a',dot:'#2b1640'}}},
hw_web:{t:'s',it:{id:'hw_web',n:YA?'Бабье лето':'Паутинка',d:YA?'Осеннее блюдце с паутинкой-«бабьим летом». Летает — к тёплым дням.':'Блюдце с паутинкой. Паук съехал, рисунок остался — красота же.',
lc:'#2b1640',lb:'rgba(239,125,26,.12)',on:'#ef7d1a',onc:'#1f1030',line:'#6b3fa0',sh:'#d9cce8'}},
hw_fonar:{t:'o',pay:1,it:{id:'hw_fonar',n:'Вожатая с фонариком',pay:'hw_uzel26',d:'Синяя кофта, красный галстук и фонарик под подушкой. Страшилки после отбоя — только с ней.',
c1:'#1f3a6b',c2:'#132649',f:'#0b1a36',beads:'none',neck:'#d0342c',brooch:1}}};
function hwPrice(id){var L=(E()&&E().hwShop.items)||[];for(var i=0;i<L.length;i++)if(L[i].id===id)return+L[i].p||0;return 0;}
function hwOn(){var e=E();return!!(e&&e.hwShopOn());}
function dd(n){return('0'+n%100).slice(-2)+'.'+('0'+Math.floor(n/100)%100).slice(-2);}
function sync(){if(typeof OUTFITS==='undefined'||typeof SKINS==='undefined'||typeof S==='undefined')return;var e=E();if(!e)return;
Object.keys(ITEMS).forEach(function(id){var x=ITEMS[id],L=x.t==='o'?OUTFITS:SKINS,at=-1,i;for(i=0;i<L.length;i++)if(L[i].id===id)at=i;
var vis;
if(x.pay)vis=!!(typeof PAY!=='undefined'&&PAY.own('hw_uzel26'))||(HW&&e.hwUzelOn()&&!YA&&!(typeof OK!=='undefined'&&OK));
else{x.it.p=hwPrice(id);vis=own(x.t,id)||(HW&&hwOn()&&x.it.p>0);
x.it.d=ITEMS[id].d0||(ITEMS[id].d0=x.it.d);if(hwOn()&&!own(x.t,id))x.it.d=x.it.d+' 🎃 Только до '+dd(e.hwShop.to)+'.';}
if(vis&&at<0)L.push(x.it);else if(!vis&&at>=0&&!(x.t==='o'?S.outfit===id:S.skin===id))L.splice(at,1);});
if(ITEMS[S.outfit]){['heroArt','zAv'].forEach(function(k){var a=document.getElementById(k);if(a&&!a.dataset.ze){a.dataset.ze=1;a.dataset.o='';}});}
if(ITEMS[S.skin]&&typeof applySkin==='function'){var w=document.getElementById('wheel');if(w)ZB.safe('fair:skin0',function(){applySkin(w,S.skin);});}}
if(HW){ZB.safe('fair:sync',sync);ZB.on('ready',function(){ZB.safe('fair:sync',sync);});
ZB.on('screen',function(sc){if(sc==='shopS')ZB.safe('fair:sync',sync);});ZB.on('cloud',function(){ZB.safe('fair:sync',sync);});}
function fairOn(){var e=E();return FAIR&&!!e&&!!e.fair&&(+S.lv||0)>=e.fair.fromLv&&typeof OUTFITS!=='undefined';}
function pool(){var f=E().fair,L=[];
OUTFITS.forEach(function(it){if(it.p>=f.minP&&it.p<=f.maxP&&!it.pay&&!it.gift&&!ITEMS[it.id])L.push({k:'o',it:it});});
SKINS.forEach(function(it){if(it.p>=f.minP&&it.p<=f.maxP&&!it.pay&&!it.gift&&!ITEMS[it.id])L.push({k:'s',it:it});});return L;}
function today(){var e=E(),q=S.z2e||(S.z2e={}),d=e.day();
if(!q.f||q.f.d!==d){var L=pool().filter(function(x){return!own(x.k,x.it.id);}),seed=d%9973+7,out=[];
while(L.length&&out.length<e.fair.n){seed=(seed*16807)%2147483647;out.push(L.splice(seed%L.length,1)[0]);}
q.f={d:d,i:out.map(function(x){return x.k+':'+x.it.id;}).join(',')};try{save();}catch(e){}}
var all=pool(),r=[];String(q.f.i||'').split(',').forEach(function(k){for(var i=0;i<all.length;i++)if(all[i].k+':'+all[i].it.id===k)r.push(all[i]);});return r;}
function fp(it){var e=E();return Math.max(5,Math.round(it.p*(1-e.fair.disc)/5)*5);}
function left(){return today().filter(function(x){return!own(x.k,x.it.id);}).length;}
function cardHtml(){if(!fairOn())return'';var n=left();
return'<button type="button" class="ze-fair'+(n?'':' done')+'"'+(n?' data-zn-tag="'+n+'"':'')+'><i>🎪</i><span><b>'+(YA?'Ярмарка у ворот':'Ярмарка у ворот')+'</b><small>'+(n?'Сегодня завезли: '+n+' '+pl(n,'вещь','вещи','вещей')+' со скидкой':'Всё раскупили — завтра завезут новое')+'</small></span><em>›</em></button>';}
function pl(n,a,b,c){n=Math.abs(n)%100;var k=n%10;return n>10&&n<20?c:k===1?a:k>1&&k<5?b:c;}
function chipsOn(){return!!(ZB2._reg.homefit&&!ZB2.off('homefit'));}
if(FAIR){var slot={id:'ze-fair',order:30,render:cardHtml,mount:function(el){var b=el.querySelector('.ze-fair');if(b)b.onclick=function(){try{SND.tap();}catch(e){}open();};}};
Object.defineProperty(slot,'zone',{get:function(){return chipsOn()?'after':'school';}});
Object.defineProperty(slot,'order',{get:function(){return chipsOn()?30:45;}});ZB.add(ZB.homeSlots,slot);}
function open(){if(!fairOn()||typeof modal!=='function')return;var L=today();st('fair',{a:'open',n:L.length});
var who=window.ZBP&&ZBP.bust?ZB.safe('zbp',function(){return ZBP.bust('valya','happy');}):'';
modal('<div class="ze-fw"><div class="dhead"><div class="av">'+(who||zinaSVG('happy'))+'</div><p>'+(who?'<b>Тётя Валя:</b> ':'')+
esc(['Сегодня завезли! Завтра будет другое — не зевай.','Подходи, не стесняйся! Скидка — пока я добрая.','Свежий завоз! Блюдца — не битые, проверяла лично.'][E().day()%3])+'</p></div>'+
'<div class="ze-fg">'+(L.length?L.map(function(x){var o=own(x.k,x.it.id),p=fp(x.it);
return'<div class="ze-fc"><div class="pv">'+(x.k==='o'?zinaSVG('norm',x.it.id):'<div class="mini" id="zfPv_'+x.it.id+'" style="width:84px;height:84px"><div class="plate"></div></div>')+'</div><b>'+esc(x.it.n)+'</b>'+
(o?'<div class="ze-own">✓ куплено</div>':'<s>'+x.it.p+'</s><button class="btn'+(S.coins<p?' ghost':' green')+' small" data-k="'+x.k+'" data-id="'+x.it.id+'">'+p+' 💰</button>')+'</div>';}).join(''):'<p>Пусто: всё уже есть! Тётя Валя ушла за новым товаром.</p>')+'</div>'+
'<p class="ze-fn">Подсказки на ярмарке не продают — они у бабы Зины.</p><button class="btn ghost" id="zfX">Закрыть</button></div>');
L.forEach(function(x){if(x.k==='s'){var el=document.getElementById('zfPv_'+x.it.id);if(el&&typeof applySkin==='function')ZB.safe('fair:skin',function(){applySkin(el,x.it.id);});}});
document.getElementById('zfX').onclick=function(){try{SND.tap();}catch(e){}hideModal();ZB.refresh();};
[].forEach.call(document.querySelectorAll('.ze-fc .btn[data-id]'),function(b){b.onclick=function(){buy(b.getAttribute('data-k'),b.getAttribute('data-id'));};});}
function buy(k,id){var x=null;today().forEach(function(y){if(y.k===k&&y.it.id===id)x=y;});if(!x||own(k,id))return;var p=fp(x.it);
if(S.coins<p){try{SND.bad();toast('Не хватает '+(p-S.coins)+' монет — тётя Валя в долг не даёт',2600);}catch(e){}return;}
S.own=S.own||{};S.own[k+':'+id]=1;if(typeof addCoins==='function')addCoins(-p);else S.coins-=p;st('spend',{k:k+':'+id,c:p,f:'fair'});st('fair',{a:'buy',id:id,p:p});
if(k==='o')S.outfit=id;else S.skin=id;try{save();SND.coin();if(typeof vkmCheck==='function')vkmCheck();}catch(e){}
try{toast((k==='o'?'Обновка! Баба Зина уже примеряет':'Новое блюдце уже на столе')+' · −'+p+' 💰',2600);}catch(e){}open();}
var css='.ze-fair{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:var(--card);border:0;border-radius:16px;padding:8px 12px;box-shadow:var(--shadow);color:var(--ink);font:inherit;cursor:pointer;margin:6px 0}'+
'.ze-fair>i{font-style:normal;font-size:26px}.ze-fair span{flex:1;min-width:0}.ze-fair b{display:block;font-size:15px}.ze-fair small{font-size:13px;color:var(--ink2)}.ze-fair em{font-style:normal;color:var(--ink2);font-size:20px}.ze-fair.done{opacity:.75}'+
'.ze-fg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.ze-fc{background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:6px 4px 8px;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;min-width:0}'+
'.ze-fc .pv{width:84px;height:84px;display:flex;align-items:center;justify-content:center}.ze-fc .pv svg{width:100%;height:100%}.ze-fc b{font-size:13.5px;line-height:1.2}.ze-fc s{font-size:12.5px;color:var(--ink2)}.ze-fc .btn{width:100%;padding-left:2px;padding-right:2px;font-size:14px}'+
'.ze-fc .ze-own{font-weight:800;color:#237a3b;font-size:13.5px;padding:8px 0}.ze-fn{font-size:13.5px;color:var(--ink2);text-align:center;margin:6px 0}.ze-fw .btn.ghost{width:100%}@media (max-width:340px){.ze-fc .pv{width:70px;height:70px}}';
try{var el=document.createElement('style');el.id='zfCss';el.textContent=css;document.head.appendChild(el);}catch(e){}
window.ZB2FAIR={sync:sync,today:today,open:open,price:fp};
})();
