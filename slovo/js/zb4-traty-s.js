'use strict';
(function(){
var Z4=window.Z4,X=window.Z4Y;if(!Z4||!Z4.on||!X||X._s)return;X._s=1;
var F=X.F,ZB=window.ZB,Q=location.search,QD=/[?&]z4yd=(\d{8})/.exec(Q);
function Z(){return typeof S!=='undefined'&&S&&S.z4y||null;}
function tk(){if(QD)return+QD[1];try{return+todayKey();}catch(e){return 0;}}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function ev(a,p){var o={a:a},k;for(k in p||{})o[k]=p[k];Z4.ev('z4y',o);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function say(t,m,s){try{if(typeof zina==='function'&&t)zina(t,m||'happy',s||6);}catch(e){}}
function refresh(){try{if(ZB.refresh)ZB.refresh();}catch(e){}}
function tap(){try{if(typeof SND!=='undefined'&&SND.tap)SND.tap();}catch(e){}}
function CFG(){return window.ZBECO&&ZBECO.z4y||{res:5000,lv:60,kv:{},yat:{}};}
function coins(){return typeof S!=='undefined'&&S?+S.coins||0:0;}
function cat(){try{return typeof catSVG==='function'?catSVG():'';}catch(e){return'';}}
function zsvg(m){try{return typeof zinaSVG==='function'?zinaSVG(m||'happy'):'';}catch(e){return'';}}
function away(){try{var b=window.Z4K&&Z4K.dbg&&Z4K.dbg.begState&&Z4K.dbg.begState();return!!(b&&b.away);}catch(e){return false;}}
var IT={
ger:{g:'kv',n:'Герань на окне',t:'Герань — от моли, от сглаза и от Гали. Последнее проверено.',
s:'<rect x="18" y="40" width="28" height="18" rx="3" fill="#b45309"/><path d="M32 40V24" stroke="#15803d" stroke-width="3"/><circle cx="24" cy="26" r="8" fill="#16a34a"/><circle cx="40" cy="26" r="8" fill="#16a34a"/><g fill="#dc2626"><circle cx="26" cy="16" r="5"/><circle cx="36" cy="14" r="5"/><circle cx="31" cy="22" r="4"/></g>'},
sal:{g:'kv',n:'Кружевная салфетка',t:'Скажу всем, что связала сама. Сорок лет учила детей не врать — имею право раз.',
s:'<circle cx="32" cy="32" r="24" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><circle cx="32" cy="32" r="16" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="3 3"/><g fill="#e2e8f0"><circle cx="32" cy="10" r="4"/><circle cx="32" cy="54" r="4"/><circle cx="10" cy="32" r="4"/><circle cx="54" cy="32" r="4"/></g><circle cx="32" cy="32" r="5" fill="#cbd5e1"/>'},
slon:{g:'kv',n:'Семь слоников',t:'Семь слоников — на счастье. Восьмого не взяла: счастья столько пенсия не выдержит.',
s:'<rect x="4" y="46" width="56" height="4" fill="#92400e"/><g fill="#94a3b8"><ellipse cx="14" cy="38" rx="9" ry="7"/><ellipse cx="34" cy="40" rx="7" ry="5"/><ellipse cx="50" cy="42" rx="5" ry="4"/></g><g stroke="#94a3b8" stroke-width="3" fill="none"><path d="M6 38q-3 6 0 8"/><path d="M28 40q-2 5 0 6"/><path d="M46 42q-2 3 0 4"/></g>'},
chas:{g:'kv',n:'Часы с кукушкой',t:'Кукушка кукует каждый час. Наконец в доме кто-то разговаривает чаще Гали.',
s:'<path d="M12 22L32 6l20 16z" fill="#78350f"/><rect x="14" y="22" width="36" height="30" fill="#a16207"/><circle cx="32" cy="38" r="10" fill="#fef3c7"/><path d="M32 38V31M32 38l5 3" stroke="#1f2937" stroke-width="2"/><rect x="28" y="14" width="8" height="7" fill="#fde68a"/><path d="M24 52v8M40 52v6" stroke="#1f2937" stroke-width="2"/><circle cx="24" cy="60" r="2" fill="#ca8a04"/><circle cx="40" cy="58" r="2" fill="#ca8a04"/>'},
tor:{g:'kv',n:'Торшер с бахромой',t:'Под торшером читаю кроссворды, под люстрой — квитанции. Чувствуете разницу в настроении?',
s:'<path d="M18 22h28l-6-14H24z" fill="#f59e0b"/><path d="M18 22v4M24 22v5M30 22v4M36 22v5M42 22v4M46 22v4" stroke="#b45309" stroke-width="2"/><path d="M32 22v32" stroke="#475569" stroke-width="3"/><ellipse cx="32" cy="56" rx="10" ry="3" fill="#475569"/>'},
sam:{g:'kv',n:'Самовар',t:'Самовар на столе — значит, ждём гостей. Гости не пришли — значит, весь самовар мой.',
s:'<rect x="26" y="6" width="12" height="6" rx="2" fill="#b45309"/><path d="M18 14h28l4 24H14z" fill="#d97706"/><rect x="20" y="38" width="24" height="10" fill="#b45309"/><path d="M14 22H8v8h6M50 22h6v8h-6" stroke="#92400e" stroke-width="3" fill="none"/><path d="M44 30h8" stroke="#92400e" stroke-width="3"/><path d="M22 48l-4 8h28l-4-8" fill="#92400e"/>'},
rad:{g:'kv',n:'Радиола',t:'Радиола ловит «Маяк» и соседа сверху. Сосед, правда, громче.',
s:'<rect x="6" y="18" width="52" height="30" rx="4" fill="#7c2d12"/><rect x="10" y="22" width="26" height="22" fill="#fcd34d" opacity=".85"/><path d="M12 33h22" stroke="#7c2d12" stroke-width="1"/><circle cx="46" cy="28" r="4" fill="#fde68a"/><circle cx="46" cy="40" r="4" fill="#fde68a"/><path d="M12 48v8M52 48v8" stroke="#7c2d12" stroke-width="3"/>'},
kov:{g:'kv',n:'Ковёр на стену',t:'Повесила ковёр — тишина как в библиотеке. Галя теперь подслушивает с балкона.',
s:'<rect x="6" y="8" width="52" height="48" rx="3" fill="#b91c1c"/><rect x="12" y="14" width="40" height="36" fill="none" stroke="#fbbf24" stroke-width="2"/><path d="M32 18l12 14-12 14-12-14z" fill="#1e3a8a"/><path d="M32 24l6 8-6 8-6-8z" fill="#fbbf24"/><g fill="#fbbf24"><circle cx="16" cy="18" r="2"/><circle cx="48" cy="18" r="2"/><circle cx="16" cy="46" r="2"/><circle cx="48" cy="46" r="2"/></g>'},
tv:{g:'kv',n:'Телевизор под салфеткой',t:'Телевизор под кружевной салфеткой. Включать не буду — салфетку жалко.',
s:'<rect x="8" y="16" width="48" height="34" rx="5" fill="#57534e"/><rect x="13" y="21" width="32" height="24" rx="4" fill="#94a3b8"/><circle cx="50" cy="26" r="2.5" fill="#d6d3d1"/><circle cx="50" cy="34" r="2.5" fill="#d6d3d1"/><path d="M8 18q24-10 48 0v-4H8z" fill="#fff"/><path d="M8 18l4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6" fill="none" stroke="#e2e8f0" stroke-width="1.5"/><path d="M18 50l-4 8M46 50l4 8" stroke="#57534e" stroke-width="3"/>'},
serv:{g:'kv',n:'Сервант с хрусталём',t:'Хрусталь — только по праздникам. Сорок лет жду праздника, достойного хрусталя.',
s:'<rect x="8" y="4" width="48" height="56" rx="2" fill="#78350f"/><rect x="12" y="8" width="40" height="28" fill="#bae6fd" opacity=".7"/><path d="M12 22h40" stroke="#78350f" stroke-width="2"/><g fill="#e0f2fe" stroke="#38bdf8"><path d="M16 20l3-8 3 8z"/><path d="M28 20h6l-1-7h-4z"/><path d="M40 20l4-7 4 7z"/><path d="M18 34h6l-3-8z"/><path d="M32 34h8l-1-6h-6z"/></g><rect x="12" y="40" width="19" height="16" fill="#92400e"/><rect x="33" y="40" width="19" height="16" fill="#92400e"/>'},
mis:{g:'yat',n:'Миска с рыбкой',t:'Купила Ятю миску с нарисованной рыбкой. Третий час он пытается её съесть.',
s:'<ellipse cx="32" cy="44" rx="24" ry="10" fill="#2563c9"/><ellipse cx="32" cy="40" rx="20" ry="6" fill="#dbeafe"/><path d="M24 40q8-6 14 0-6 6-14 0zM38 40l6-4v8z" fill="#f97316"/>'},
klu:{g:'yat',n:'Клубок шерсти',t:'Клубок брала себе на носки. Носков, судя по Ятю, этой зимой не будет.',
s:'<circle cx="30" cy="34" r="18" fill="#db2777"/><path d="M16 26q14 8 28 0M14 36q16 8 32 0M22 18q4 16 0 32M36 17q-4 17 2 34" stroke="#9d174d" stroke-width="2" fill="none"/><path d="M46 44q8 4 10 12" stroke="#db2777" stroke-width="2" fill="none"/>'},
bant:{g:'yat',n:'Праздничный бант',t:'Повязала Ятю бант к празднику. Он носил его ровно до первого зеркала.',
s:'<path d="M32 32L10 18v28zM32 32l22-14v28z" fill="#dc2626"/><circle cx="32" cy="32" r="6" fill="#b91c1c"/><path d="M28 36l-6 18M36 36l6 18" stroke="#dc2626" stroke-width="4"/>'},
pod:{g:'yat',n:'Подушка на подоконник',t:'Подушка на подоконник: Ять следит за двором с удобствами. Как Галя, только молча.',
s:'<rect x="4" y="44" width="56" height="8" fill="#e5e7eb"/><rect x="10" y="30" width="44" height="16" rx="8" fill="#16a34a"/><g fill="#fef08a"><circle cx="20" cy="38" r="2"/><circle cx="32" cy="36" r="2"/><circle cx="44" cy="39" r="2"/></g><rect x="4" y="6" width="56" height="38" fill="none" stroke="#94a3b8" stroke-width="2"/><path d="M32 6v24" stroke="#94a3b8" stroke-width="2"/>'},
kog:{g:'yat',n:'Когтеточка',t:'Когтеточка спасёт диван, сказали в магазине. Ять попробовал: хорошая. Диван лучше.',
s:'<rect x="24" y="8" width="16" height="44" fill="#d6b48a"/><path d="M24 14h16M24 20h16M24 26h16M24 32h16M24 38h16M24 44h16" stroke="#a8825a" stroke-width="2"/><rect x="12" y="52" width="40" height="6" rx="2" fill="#78350f"/><circle cx="32" cy="8" r="6" fill="#f59e0b"/>'},
lez:{g:'yat',n:'Лежанка-корзинка',t:'Лежанка мягкая, тёплая, с бортиками. Ять спит в коробке от неё.',
s:'<ellipse cx="32" cy="42" rx="26" ry="12" fill="#b45309"/><ellipse cx="32" cy="38" rx="20" ry="8" fill="#fca5a5"/><path d="M8 40q24 14 48 0" stroke="#78350f" stroke-width="2" fill="none"/><path d="M12 36l4 10M20 34l2 13M30 33v15M40 34l-2 13M50 36l-4 10" stroke="#92400e" stroke-width="1.5"/>'},
dom:{g:'yat',n:'Кошачий домик',t:'У Ятя теперь свой домик. Прописывать не стану — начнёт водить гостей.',
s:'<path d="M8 28L32 8l24 20z" fill="#b91c1c"/><rect x="12" y="28" width="40" height="28" fill="#fde68a"/><path d="M26 56V42a6 6 0 0 1 12 0v14z" fill="#1f2937"/><circle cx="20" cy="36" r="3" fill="#60a5fa"/><path d="M42 33l3 3 3-3" stroke="#b91c1c" stroke-width="2" fill="none"/>'}};
function svg(id,dim){var it=IT[id];return'<svg viewBox="0 0 64 64" aria-hidden="true"'+(dim?' class="z4y-dim"':'')+'>'+(it?it.s:'')+'</svg>';}
function price(id){var c=CFG(),it=IT[id];return it&&c[it.g]?+c[it.g][id]||0:0;}
function bit(id){var i=X.IDS.indexOf(id);return i<0?0:1<<i;}
function own(id){var z=Z();return!!(z&&(z.o&bit(id)));}
function ownN(){var n=0;X.IDS.forEach(function(id){if(own(id))n++;});return n;}
function gOn(g){return g==='kv'?!!F.kv:!!F.yat;}
function nextId(){var b=null,bp=1e9,aw=away();X.IDS.forEach(function(id){var it=IT[id],p=price(id);if(!it||!p||own(id)||!gOn(it.g))return;if(it.g==='yat'&&aw)return;
if(p<bp){bp=p;b=id;}});return b;}
var OFF=null;
function offer(){var z=Z(),c=CFG(),t=tk();if(!z||!Z4.open('z4y')||!t)return null;
if((+S.lv||0)<(+c.lv||60)||z.pd===t||z.ld===t)return null;
var id=nextId();if(!id||coins()<price(id)+(+c.res||0))return null;return id;}
var shown={};
function seen(id,w){var k=w+id;if(shown[k])return;shown[k]=1;ev('show',{id:id,w:w,c:price(id)});}
function css(){if(document.getElementById('z4yCss'))return;var s=document.createElement('style');s.id='z4yCss';s.textContent=
'.z4y-c{font-size:15px;line-height:1.4;color:var(--z3-ink,#27324a)}.z4y-c h4{margin:0 0 4px;font-size:16px;font-family:var(--z3-font-head,inherit)}.z4y-c p{margin:4px 0}'+
'.z4y-row{display:flex;align-items:center;gap:10px}.z4y-row svg{width:56px;height:56px;flex:0 0 56px}'+
'.z4y-sm{font-size:13.5px;opacity:.85}'+
'.z4y-bt{display:inline-block;min-height:44px;min-width:44px;margin:6px 6px 0 0;padding:8px 14px;border-radius:10px;border:1px solid var(--z3-acc-edge,#9a3412);background:var(--z3-acc,#c2410c);color:#fff;font-size:15px;cursor:pointer}'+
'.z4y-bt.z4y-2{background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);border-color:var(--z3-line,#cbd5e1)}'+
'.z4y-m{text-align:center}.z4y-m h2{margin:4px 0 6px}.z4y-m .z4y-big svg{width:110px;height:110px}'+
'.z4y-say{display:flex;gap:8px;align-items:center;text-align:left;margin:4px 0 8px;font-size:15px;line-height:1.35}.z4y-say .z4y-av{width:64px;height:64px;flex:0 0 64px}'+
'.z4y-h{margin:10px 0 4px;font-size:15px;font-weight:700;text-align:left;display:flex;align-items:center;gap:6px}.z4y-h .z4y-cat{width:40px;height:40px;display:inline-block}'+
'.z4y-g{display:flex;flex-wrap:wrap;gap:5px;justify-content:center}'+
'.z4y-t{width:72px;min-height:80px;border:1px solid var(--z3-line,#cbd5e1);border-radius:10px;padding:4px 2px;background:var(--z3-card,#fff);font-size:13.5px;line-height:1.2;box-sizing:border-box}'+
'.z4y-t svg{width:42px;height:42px;display:block;margin:0 auto 2px}.z4y-t.z4y-new{border:2px solid var(--z3-acc,#c2410c)}'+
'.z4y-dim{filter:grayscale(1);opacity:.3}.z4y-q{color:#57534e}';
document.head.appendChild(s);}
function buyOpen(id){var p=price(id),it=IT[id];if(!it)return;css();tap();
modal('<div class="z4y-m"><h2>🛍 '+esc(it.n)+'</h2><div class="z4y-big">'+svg(id)+'</div>'+
'<p>'+(it.g==='yat'?'Ятю — для красоты и уюта.':'В квартиру Зины — для красоты.')+'<br><span class="z4y-sm">Подсказок не прибавит — просто глаз радует.</span></p>'+
'<p>Цена: <b>'+p+'</b> монет · у тебя '+coins()+'</p>'+
'<div class="btns"><button type="button" class="z4y-bt" id="z4yBuy">Купить за '+p+'</button><button type="button" class="z4y-bt z4y-2" id="z4yNo">Не сейчас</button></div></div>');
var b=document.getElementById('z4yBuy'),n=document.getElementById('z4yNo');
if(b)b.onclick=function(){buy(id);};
if(n)n.onclick=function(){var z=Z();if(z){z.ld=tk();sv();}ev('no',{id:id,c:p});try{hideModal();}catch(e){}refresh();};}
function buy(id){var z=Z(),p=price(id);if(!z||!p||own(id))return;
if(coins()<p){try{toast('Монеток пока маловато',2500);}catch(e){}return;}
if(typeof addCoins==='function')addCoins(-p);else S.coins=coins()-p;
z.o|=bit(id);z.pd=tk();sv();ev('buy',{id:id,c:p,n:ownN()});try{STAT.ev('spend',{k:'z4y',c:p});}catch(e){}
try{if(typeof cloudSoon==='function')cloudSoon();}catch(e){}
room(id);refresh();}
function tiles(g,nw){return X.IDS.filter(function(id){return IT[id].g===g&&gOn(g);}).map(function(id){var o=own(id);
return'<div class="z4y-t'+(id===nw?' z4y-new':'')+'">'+svg(id,!o)+(o?esc(IT[id].n):'<span class="z4y-q">? · '+price(id)+'</span>')+'</div>';}).join('');}
function room(nw){css();var z=Z();if(z){z.rv=tk();sv();}ev('room',{n:ownN(),w:nw?'buy':'see'});
var t=nw&&IT[nw]?IT[nw].t:(ownN()?'Заходи, не разувайся. Всё, что тут красивое, — твоими монетками.':'Пока пусто. Но я уже присмотрела, что куда поставлю.');
var aw=away(),h='<div class="z4y-m"><h2>🏠 Квартира Зины</h2><div class="z4y-say"><div class="z4y-av">'+zsvg('happy')+'</div><div>'+esc(t)+'</div></div>';
var hk=F.kv?'<div class="z4y-h">Квартира · '+X.IDS.filter(function(id){return IT[id].g==='kv'&&own(id);}).length+' из 10</div><div class="z4y-g">'+tiles('kv',nw)+'</div>':'',hy='';
if(F.yat)hy='<div class="z4y-h">'+(aw?'':'<span class="z4y-cat">'+cat()+'</span>')+'Уголок Ятя · '+X.IDS.filter(function(id){return IT[id].g==='yat'&&own(id);}).length+' из 7'+(aw?' · Ять в бегах, вещи ждут':'')+'</div><div class="z4y-g">'+tiles('yat',nw)+'</div>';
h+=(nw&&IT[nw]&&IT[nw].g==='yat'?hy+hk:hk+hy);
h+='<p class="z4y-sm">Новую вещь Зина присмотрит сама, когда монет будет с запасом.</p><div class="btns"><button type="button" class="z4y-bt" id="z4yOk">Красота!</button></div></div>';
modal(h);try{var q=document.querySelector('.z4y-t.z4y-new');if(q&&q.scrollIntoView)q.scrollIntoView({block:'nearest'});}catch(e){}var b=document.getElementById('z4yOk');if(b)b.onclick=function(){try{hideModal();}catch(e){}refresh();};}
var CK='';
function sunday(){var t=tk();if(!t)return false;return new Date(Math.floor(t/1e4),Math.floor(t/100)%100-1,t%100).getDay()===0;}
function cardKind(){OFF=offer();if(OFF)return'buy';var z=Z();if(z&&ownN()&&sunday()&&z.rv!==tk()&&Z4.open('z4y'))return'room';return'';}
function cardHtml(){css();if(CK==='buy'){var id=OFF,it=IT[id];seen(id,'card');
return'<div class="z4y-c"><h4>🛍 Барахолка во дворе</h4><div class="z4y-row">'+svg(id)+'<p>Зина присмотрела: <b>'+esc(it.n)+'</b> — '+price(id)+' монет.<br><span class="z4y-sm">Для красоты, подсказок не прибавит.</span></p></div>'+
'<button type="button" class="z4y-bt" data-z4y="buy">Посмотреть</button>'+(ownN()?'<button type="button" class="z4y-bt z4y-2" data-z4y="room">🏠 Квартира ('+ownN()+')</button>':'')+'</div>';}
if(CK==='room')return'<div class="z4y-c"><h4>🏠 Квартира Зины</h4><p>Воскресенье — Зина вытирает пыль с покупок. Вещей: '+ownN()+' из '+X.IDS.length+'.</p><button type="button" class="z4y-bt" data-z4y="room">Заглянуть</button></div>';
return'';}
Z4.card.add({id:'z4y',order:65,show:function(){CK=cardKind();return!!CK;},html:cardHtml,
mount:function(el){if(!el)return;[].forEach.call(el.querySelectorAll('[data-z4y]'),function(b){b.addEventListener('click',function(){
var a=b.dataset.z4y;if(a==='buy'&&OFF)buyOpen(OFF);if(a==='room')room('');});});}});
Z4.winLine.add({id:'z4y',order:70,txt:function(i){if(i&&i.daily)return'';var id=offer();if(!id)return'';seen(id,'win');
return'🛍 Зина присмотрела «'+IT[id].n+'» за '+price(id)+' монет — загляни на Дом';}});
X.dbg={offer:offer,nextId:nextId,price:price,own:own,ownN:ownN,buy:buy,room:room,buyOpen:buyOpen,cardKind:cardKind,IT:IT};
})();
