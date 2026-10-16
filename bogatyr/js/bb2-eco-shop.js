/* ===== bb2-eco-shop.js — поток ECO: окно «Лавка» и окно «Обоз». Грузится по требованию (набор 'eco', BB2.open). Заглушки и товары — js/bb2-eco-m.js ===== */
(function(){'use strict';
if(typeof BB2==='undefined'||!BB2.eco)return;
var E=BB2.eco;
function sh(id){return id==='uzelok'?L('Облик, 3 свитка перебора и золото на два похода','Outfit, 3 reroll scrolls and gold worth two runs'):id==='saga_pass'?L('Верхняя дорожка наград — на весь сказ','Upper reward track for the whole tale'):
  id==='saga_pass10'?L('Дорожка и сразу +10 ступеней','The track and +10 steps right away'):id==='no_ads'?L('Навсегда. Ролики за награду — по желанию','Forever. Reward videos stay optional'):
  id==='skins_fest'?L('3 праздничных облика всем богатырям','3 holiday outfits for every hero'):id==='mead'?L('Спасибо автору и рамка «Меценат»','Thank the maker, get the “Patron” frame'):'';}
function row(id){var pr=PAY.item(id),it=PAY_ITEMS[id];if(!pr||!it)return '';var own=it.perm&&PAY.own(id),d=sh(id)||it.desc,
    t='<span style="font-size:14.5px;line-height:1.2">'+it.ic+' '+payEsc(it.name)+'<br><small style="font-size:12px;line-height:1.25;display:block;margin-top:2px">'+payEsc(d)+'</small></span>',st=' style="padding:7px 10px;min-height:0;margin:4px 0"';
  return own?'<div class="'+PAY_ROW+' pown"'+st+'>'+t+'<i>'+L('куплено','owned')+'</i></div>':'<button class="'+PAY_ROW+' pbuy" data-pid="'+id+'"'+st+'>'+t+'<b style="white-space:nowrap;font-size:14px">'+PAY.price(pr)+'</b></button>';}
function head(t){return '<div style="font-weight:800;font-size:12.5px;margin:6px 2px 0;opacity:.8">'+t+'</div>';}
function sagaOk(){try{return typeof slSaga==='function'&&typeof slPayOk==='function'&&slPayOk()&&!slSaga().b&&(typeof slSagaLeft!=='function'||slSagaLeft()>3);}catch(e){return false;}}
function shop(){if(typeof payHere!=='function'||!payHere())return;var h='<h3>'+L('Лавка','Shop')+'</h3><div class="pay" style="margin:0">',a;
  if(PAY_ITEMS.uzelok&&!PAY.own('uzelok')&&(a=row('uzelok')))h+=head(L('🎁 Первая покупка — самая выгодная','🎁 First purchase — the best deal'))+'<div style="border:2.5px solid #e0a82a;border-radius:14px;padding:0 3px;margin:3px 0">'+a+'</div>';
  if(sagaOk()&&(a=row('saga_pass')+row('saga_pass10')))h+=head(L('🔥 Сказ месяца','🔥 Tale of the Month'))+a;
  a=row('no_ads')+row('skins_fest')+row('mead')+(PAY_ITEMS.uzelok&&PAY.own('uzelok')?row('uzelok'):'');if(a)h+=head(L('Навсегда','Forever'))+a;
  h+='</div><p class="sub" style="font-size:11.5px;margin:6px 0 0">'+L('Только удобство и красота: силу и умения за деньги не продаём.','Convenience and looks only: power and skills are not for sale.')+'</p>'+
    '<div class="btns stick" style="flex-direction:row"><button class="btn ghost" id="bb2ShRe" style="flex:1;font-size:12.5px">'+L('↻ Вернуть покупки','↻ Restore')+'</button><button class="btn big" id="bb2ShOk" style="flex:1">'+L('Готово','Done')+'</button></div>';
  showModal(h,'shop');PAY.bind($('mBody'));PAY.re=shop;on('bb2ShRe',function(){PAY.again();});on('bb2ShOk',hideModal);
  try{STAT.screen('lavka');}catch(e){}E.stat('shop');}
function oboz(){var o=E.oboz();if(!o){toast(L('Золота уже хватает — куй!','You have enough gold now — forge away!'));renderForge();return;}
  var g=fmtNum(Math.floor(S.gold));
  showModal('<h3>'+L('Обоз кузнецу','Wagon for the smith')+'</h3><div class="card"><div class="row"><img class="ic" src="'+ic(o.f.icon)+'"><div class="t"><b>'+o.f.name+L(', ур. ',', lv ')+o.l+'</b><span>'+
    L('Цена — '+fmtNum(o.c)+' золота, у тебя '+g+'. Не хватает '+fmtNum(o.lack)+'.','Price — '+fmtNum(o.c)+' gold, you have '+g+'. '+fmtNum(o.lack)+' short.')+'</span></div></div></div>'+
    '<p class="sub">'+L('Обоз довезёт недостающее золото, и кузнец сделает уровень сразу. Твоё золото уйдёт в счёт цены. Обоз ходит только до 10-го уровня — мастерскую ковку берут трудом.',
      'The wagon delivers the missing gold and the smith forges the level right away. Your gold goes toward the price. The wagon only runs up to level 10 — master forging is earned.')+'</p>'+
    '<div class="btns"><button class="btn gold big" id="bb2ObGo" data-bpid="'+o.pid+'">'+L('Заказать обоз','Order the wagon')+' · '+PAY.price({id:o.pid})+'</button><button class="btn ghost" id="bb2ObNo">'+L('Не сейчас','Not now')+'</button></div>','oboz');
  var back=function(){hideModal();if(curTab==='Forge')renderForge();setGold();};PAY.re=back;
  on('bb2ObNo',function(){E.stat('obno',{t:o.t});back();});
  on('bb2ObGo',function(){E.st().ob=[o.f.id,o.l];save();PAY.buy(o.pid);});}
/* ---------- кузница: «закалки» (шаги), строка «Обоз», бесплатный дар ---------- */
var X=E,st=E.st,stat=E.stat,tk=E.tk,tn=E.tn,retw=E.retw,trim=E.trim,free=E.free,paid=E.paid,see=E.see;
function N(p,d){return BB2.n('eco.'+p,d);}
function tOf(kind,id){var w=kind==='w',l=w?(S.armory||{})[id]||0:S.forge[id]||0,f=w?null:FORGE.find(function(x){return x.id===id;}),max=w?ARMORY_MAX:f?f.max:0;
  if(!BB2.on('temper')||l>=max||l<N(w?'temper.wpnFrom':'temper.forgeFrom',w?7:10))return null;
  var n=tn(),full=w?armoryCost(l):forgeCost(l,id),k=tk((w?'w_':'')+id,l),stp=Math.floor(full/n/5)*5;return {w:w,id:id,l:l,k:k,n:n,key:(w?'w_':'')+id,cost:k>=n-1?full-stp*(n-1):stp};}
function tBuy(kind,id){var o=tOf(kind,id);if(!o||S.gold<o.cost)return;var pw=powerNow(),s=st();s.t=s.t||{};S.gold-=o.cost;STAT.ev('spend',{k:(o.w?'arm:':'forge:')+id,c:o.cost});stat('temper',{i:o.key,l:o.l+1,k:o.k+1});
  if(o.k+1>=o.n){delete s.t[o.key];if(o.w)S.armory[id]=o.l+1;else S.forge[id]=o.l+1;SND.level();if(typeof achToast==='function')achToast();if(!o.w)gearRefresh();}else{s.t[o.key]=[o.l,o.k+1];SND.coin();}
  if(!Object.keys(s.t).length)delete s.t;retw();save();renderForge();setGold();powerToast(pw);}
function pickOb(){if(!paid('oboz')||typeof payHere!=='function'||!payHere()||!PAY.item('oboz1'))return null;var best=null,a=N('oboz.lack',[1500,4000,8000,12000]),mx=N('oboz.maxLvl',10);
  FORGE.forEach(function(f){var l=S.forge[f.id]||0,c,lack,i,t=0;if(l>=f.max||l+1>mx)return;c=forgeCost(l,f.id);lack=c-Math.floor(S.gold);if(lack<N('oboz.minLack',300))return;
    for(i=0;i<a.length&&!t;i++)if(lack<=a[i])t=i+1;if(t&&(!best||lack<best.lack))best={f:f,l:l+1,c:c,lack:lack,t:t,pid:'oboz'+t};});return best;}
E.oboz=pickOb;
function deco(){var el=$('tabForge'),q,i,b,o,nb,c;if(!el)return;
  q=el.querySelectorAll('[data-f],[data-a]');
  for(i=0;i<q.length;i++){b=q[i];c=b.hasAttribute('data-a')?'w':'f';o=tOf(c,b.getAttribute(c==='w'?'data-a':'data-f'));if(!o)continue;
    nb=document.createElement('button');nb.className='btn gold';nb.setAttribute('data-bt',c+':'+o.id);if(S.gold<o.cost)nb.disabled=true;
    nb.innerHTML='<img src="'+ic('coin',36)+'"><span style="line-height:1.1">'+fmtNum(o.cost)+'<small style="display:block;font-size:11px;font-weight:700;opacity:.85">'+L('закалка ','temper ')+(o.k+1)+'/'+o.n+'</small></span>';
    nb.onclick=(function(k,id){return function(){tBuy(k,id);};})(c,o.id);b.parentNode.replaceChild(nb,b);}
  b=el.querySelector('#needAd');if(b&&trim()&&b.classList.contains('ad'))free(b);
  if(!el.querySelector('#bb2Oboz')&&el.querySelector('[data-f]')){o=pickOb();b=o&&el.querySelector('[data-f="'+o.f.id+'"]');c=b;while(c&&!(c.classList&&c.classList.contains('card')))c=c.parentNode;
    if(c){nb=document.createElement('button');nb.className='btn ghost';nb.id='bb2Oboz';nb.setAttribute('data-bpid',o.pid);nb.style.cssText='width:100%;margin-top:8px;font-size:13px;white-space:normal;line-height:1.2;min-height:44px;padding:6px 10px';
      nb.innerHTML=L('🛒 Обоз довезёт '+fmtNum(o.lack)+' золота · ','🛒 Wagon brings '+fmtNum(o.lack)+' gold · ')+PAY.price({id:o.pid});
      nb.onclick=function(){SND.click();BB2.open('eco',function(){BB2.eco.x.oboz();},nb);};c.appendChild(nb);see(c,'forge');}}}
E.x={shop:shop,oboz:oboz,deco:deco};
})();
