/* ui-shop.js — «Лавка» как место во дворе (поток UX): ларёк тёти Вали вместо окна «Монеты».
   Полки: «Кошелёк» (монеты за ролик — та же награда и те же правила, что в окне «Монеты»: adOk/adHold/showRewarded с поздним зачётом),
   «Покупки» — блок модуля PAY как есть (payHtml + PAY.bind; модуль не трогаем, есть только при PAY.on, во дворе не показываем),
   «Для двора» — украшения DECOR (нажатие — окно украшения игры openDecor), «Гараж» — краски/наборы.
   Экран 'lavka' (UI.go('lavka')), кнопка «Лавка» нижней панели и 💰 на главном ведут сюда; 💰 во дворе — по-прежнему окно «Монеты».
   Другие потоки могут добавить полку: shopSlots.push({id, order, render:ctx=>html, mount:(el,ctx)=>{}}) (ctx={S}). */
(function(){'use strict';
  if(!window.UI)return;
  var W=window,D=document;if(!Array.isArray(W.shopSlots))W.shopSlots=[];
  function $(id){return D.getElementById(id);}
  function L(a,b){return VY.L(a,b);}
  function ok(f,d){try{return f();}catch(e){return d;}}
  var sec=null;
  var VALYA=[['Заходи, милок! Что брать будем?','Come on in, love! What can I get you?'],['Свежее завезли — для двора самое то.','Fresh delivery — just right for the yard.'],['Монетки береги, а на уют не жалей.','Save your coins, but don’t skimp on the yard.']];
  function build(){if(sec)return sec;sec=D.createElement('section');sec.id='scr-lavka';sec.className='screen uxshop';
    sec.innerHTML='<header class="gh"><button class="icon" id="lvBack" aria-label="'+L('Назад','Back')+'">←</button><div class="gt"><div>'+L('Лавка','Shop')+'</div><div class="sub">'+L('ларёк тёти Вали','Aunt Valya’s kiosk')+'</div></div><button class="pill" id="lvCoins">💰 0</button></header>'
      +'<div class="lvBody" id="lvBody"></div><nav class="unav" id="lvNav"></nav>';
    $('app').insertBefore(sec,$('modal'));$('lvBack').onclick=function(){UI.go('home');};return sec;}
  function kiosk(){var v=VALYA[Math.floor(Math.random()*VALYA.length)];
    return '<div class="lvKiosk"><div class="lvAwn"></div><div class="lvWin"><span class="lvV">'+UI.who('valya','happy')+'</span><p><b>'+L('Тётя Валя','Aunt Valya')+'</b>'+L(v[0],v[1])+'</p></div><div class="lvSign">'+L('ПРОДУКТЫ · ТОВАРЫ ДЛЯ ДВОРА','GROCERIES · YARD GOODS')+'</div></div>';}
  function render(){build();var S=VY.S,h='',ad=ok(function(){return adOk();},false),pay=ok(function(){return PAY.on&&!inYard();},false);
    $('lvCoins').textContent='💰 '+(S.coins||0);
    h+=kiosk();
    h+='<section class="lvShelf"><h3>💰 '+L('Кошелёк','Wallet')+'</h3><p class="lvNote">'+L('У тебя ','You have ')+'<b>'+ok(function(){return coinsTxt(S.coins);},S.coins)+'</b>. '+L('Монеты — за дворы, звёзды, сундуки и гостинцы бабы Шуры.','Coins come from yards, stars, chests and Granny Shura’s gifts.')+'</p>'
      +(ad?'<button class="btn accent noenter lvAd" id="lvAd">📺 +'+ok(function(){return coinsTxt(AD_COINS);},'30')+' '+L('за рекламу','for watching an ad')+'</button>':'')+'</section>';
    if(pay)h+='<section class="lvShelf lvPay" id="lvPay">'+ok(function(){return payHtml();},'')+'</section>';
    var dec=ok(function(){return DECOR;},[]);
    if(dec.length){h+='<section class="lvShelf"><h3>🏡 '+L('Для двора','For the yard')+'</h3><div class="lvGrid">';
      dec.forEach(function(d){var has=!!(S.dec&&S.dec[d.id]);h+='<button class="lvItem'+(has?' own':'')+'" data-dec="'+d.id+'"><canvas class="lvIc" data-ic="'+d.id+'"></canvas><b>'+UI.esc(d.name)+'</b><small>'+(has?'✓ '+L('стоит во дворе','in your yard'):d.price+' 💰')+'</small></button>';});
      h+='</div></section>';}
    h+='<div class="lvSlots" id="lvSlots"></div>';
    h+='<section class="lvShelf"><h3>🎨 '+L('Краски и машины','Paint & cars')+'</h3><p class="lvNote">'+L('Покрасить машину или выставить её во дворы — у Толика в гараже.','Paint a car or put it in the yards — at Tolik’s garage.')+'</p><button class="btn" data-go="garage">🅿️ '+L('В гараж','To the garage')+'</button></section>';
    $('lvBody').innerHTML=h;UI.bind($('lvBody'));UI.fill($('lvSlots'),shopSlots,{S:S},'lvShelf');
    D.querySelectorAll('#lvBody [data-ic]').forEach(function(c){requestAnimationFrame(function(){ok(function(){decorIcon(c,c.getAttribute('data-ic'));});});});
    D.querySelectorAll('#lvBody [data-dec]').forEach(function(b){b.onclick=function(){ok(function(){openDecor(b.getAttribute('data-dec'));});};});
    if(pay)ok(function(){PAY.bind($('lvPay'));});
    var a=$('lvAd');if(a){ok(function(){STAT.offer('coins');});a.onclick=function(){if(ok(function(){return adHold('coins');},false))return;ok(function(){STAT.place('coins');});
      showRewarded(function(){ern('ad',AD_COINS);setCoins(S.coins+AD_COINS);SND.coin();toast('+'+AD_COINS+' 💰');if(UI.cur==='lavka')render();},
        function(){},function(){ern('ad',AD_COINS);setCoins(S.coins+AD_COINS);SND.coin();return adLateMsg(AD_COINS);});};}
    if(UI.navFill)UI.navFill($('lvNav'),'shop');}
  function open(){VY.leave();ok(function(){if(VY.modalOn)hideModal();});ok(function(){STAT.screen('shop');});render();show('scr-lavka');}
  UI.screen('lavka',open);
  // «Лавка» в нижней панели и 💰 на главном — сюда
  navSlots.push({id:'shop',order:40,ic:'🛒',t:function(){return L('Лавка','Shop');},go:'lavka'});
  UI.on('coins',function(n){var e=$('lvCoins');if(e)e.textContent='💰 '+n;});
  // после покупки PAY перерисовывает окно — у нас перерисуем полки, когда окно закроется / монеты изменятся
  UI.on('coins',function(){if(UI.cur==='lavka'&&!VY.modalOn){clearTimeout(open.t);open.t=setTimeout(function(){if(UI.cur==='lavka')render();},300);}});
  D.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('#hCoins');if(t){e.stopImmediatePropagation();e.preventDefault();UI.go('lavka');}},true);
  D.addEventListener('keydown',function(e){if(UI.cur==='lavka'&&e.key==='Escape'&&!VY.modalOn)UI.go('home');});
  UI.lavka={render:render};
})();
