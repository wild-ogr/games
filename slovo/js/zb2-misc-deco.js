'use strict';
/* zb2-MISC · deco: украшения кабинетов за монеты — гирлянда (провод + лампочки, SVG/CSS) и наклейки (эмодзи в белой рамке). Новых картинок нет.
   Обёртка экрана 'cab' (zb-cab.js): после его отрисовки — слой поверх рисунка кабинета (.zbc-room) и строка покупки под ним (только открытый кабинет).
   S.z2m.dc {кабинет: биты 1 гирлянда, 2 наклейки}. Цены — ZBECO.deco {gir, nak} (ECO), запасные 250 / 120. STAT spend {k:'deco:<id>:gir|nak', c}. */
(function(){var M=window.ZB2M;if(!M||!M.on('deco')||M.parts.deco||!ZB._scr.cab)return;M.parts.deco=1;
var IT={gir:{b:1,n:'Гирлянда',ic:'✨',p:250,ok:'Гирлянда висит — праздник каждый день!'},nak:{b:2,n:'Наклейки',ic:'⭐',p:120,ok:'Наклейки на месте — Толик одобрил!'}};
function price(k){var d=M.E().deco||{};return +d[k]>0?+d[k]:IT[k].p;}
function has(id,k){return !!((+M.z().dc[id]||0)&IT[k].b);}
function coins(){return +S.coins||0;}
var COL=['#ff5a4e','#ffd23f','#3ec46d','#4aa3ff','#ff8ad1'];
function girSvg(){var b='',n=13;
  for(var i=0;i<n;i++){var t=(i+.5)/n,seg=t<.5?t*2:(t-.5)*2,x=t*400,y=6+38*4*seg*(1-seg)*.5+4,c=COL[i%COL.length];
    b+='<g class="b"><rect x="'+(x-2.5).toFixed(1)+'" y="'+(y-3).toFixed(1)+'" width="5" height="5" rx="1" fill="#555"/><ellipse cx="'+x.toFixed(1)+'" cy="'+(y+7).toFixed(1)+'" rx="5" ry="7.5" fill="'+c+'"/>'+
      '<ellipse cx="'+(x-1.6).toFixed(1)+'" cy="'+(y+4.5).toFixed(1)+'" rx="1.6" ry="2.6" fill="#fff" opacity=".7"/></g>';}
  return '<svg class="zm-gir" viewBox="0 0 400 60" preserveAspectRatio="xMidYMin meet"><path d="M0 6 Q100 50 200 6 Q300 50 400 6" fill="none" stroke="#3a5a2a" stroke-width="2.2"/>'+b+'</svg>';}
var ST=[['⭐','left:5%;top:52%;transform:rotate(-12deg)'],['🍎','right:6%;top:40%;transform:rotate(10deg)'],['🐱','left:30%;bottom:5%;transform:rotate(6deg)'],['🌼','right:24%;bottom:7%;transform:rotate(-8deg)']];
function layer(id){var h='';if(has(id,'gir'))h+=girSvg();if(has(id,'nak'))h+=ST.map(function(s){return '<span class="zm-st" style="'+s[1]+'">'+s[0]+'</span>';}).join('');
  return h?'<div class="zm-dl">'+h+'</div>':'';}
function bar(id){var a=[];['gir','nak'].forEach(function(k){if(has(id,k))return;var p=price(k);
    a.push('<button type="button" class="btn '+(coins()>=p?'gold':'ghost')+'" data-zmd="'+k+'">'+IT[k].ic+' '+IT[k].n+' '+p+' <span class="coin"></span></button>');});
  if(!a.length)return '';return '<div class="zm-deco">'+a.join('')+'<small>Только для красоты — Толик повесит за минуту</small></div>';}
function lvOf(id){try{return window.ZBCAB?ZBCAB.lv(id):0;}catch(e){return 0;}}
var last='russkij';
function deco(el,id){var room=el.querySelector('.zbc-room');if(!room||!lvOf(id))return;M.css();
  var old=room.querySelector('.zm-dl');if(old)old.remove();var L=layer(id);if(L)room.insertAdjacentHTML('beforeend',L);
  var ob=el.querySelector('.zm-deco');if(ob)ob.remove();var B=bar(id);if(!B)return;room.insertAdjacentHTML('afterend',B);
  [].forEach.call(el.querySelectorAll('[data-zmd]'),function(b){b.onclick=function(){buy(el,id,b.getAttribute('data-zmd'),b);};});}
function buy(el,id,k,b){var p=price(k);if(has(id,k))return;
  if(coins()<p){try{SND.bad();}catch(e){}try{toast('Монет пока не хватает: нужно '+p);}catch(e){}return;}
  try{addCoins(-p);}catch(e){S.coins=coins()-p;}var z=M.z();z.dc[id]=((+z.dc[id]||0)|IT[k].b)&3;M.sv();
  M.ev('spend',{k:'deco:'+id+':'+k,c:p});try{SND.coin();}catch(e){}try{toast(IT[k].ok,3000);}catch(e){}
  if(window.ZB2ZAP)try{ZB2ZAP.hook('shop',1,{id:'deco'});}catch(e){}
  deco(el,id);try{updCoins();}catch(e){}}
var scr=ZB._scr.cab,r0=scr.render;
scr.render=function(el,o){var id=o&&o.id||last;last=id;r0.apply(this,arguments);ZB.safe('zm-deco',function(){deco(el,id);});};
ZB.safe('zm-deco:ref',function(){var on=document.querySelector('.screen.on');if(on&&on.id==='zb-cab')deco(on,last);});
M.deco={has:has,price:price};
})();
