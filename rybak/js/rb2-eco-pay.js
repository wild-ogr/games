'use strict';
/* rb2-eco-pay — товары за голоса буста (поток ECO, флаг pay2; ВЫКЛЮЧЕНО в сборке: грузится только при RECO.pay2() — ?on=pay2 или window.R2_PAY2=true).
   Оплату не выкатываем: в каталог hobby-pay эти товары НЕ внесены (нужно вместе с оплатой: trip_near 8, trip_far 14, kit_next 11/21 — см. RECO.vk).
   П2 «Путёвка с доплатой» (trip_near/trip_far) — в окне «Не хватает монет» на путёвку: путёвка на следующее место + снасть под него.
   П3 «Набор следующего водоёма» (kit_next) — полка «Наборы»: путёвка + снасть + 30 наживки + полсундука монет.
   П4 Клуб: пробная неделя подарком на 2-й день (window.ECO_CLUB_TRIAL для «Утра» FIRSTFIX + строка в Почте), потом «Клуб 7 дней» на главном.
   П5 старожилам (открыто ≥6 мест) — «Кошелёк» не на первой полке (уходит к «Монетам»). Ядро PAY не трогаем: только PAY_ITEMS/PAY_TEST и обёртки снаружи. */
(function(){
var E=window.RECO;if(!E||window.RB2_PAY2)return;
function T(r,e){return typeof LANG!=='undefined'&&LANG==='en'?e:r;}
function np(){try{return nextPlace(S.open);}catch(e){return -1;}}
function nm2(i){try{return nm(PLACES[i]);}catch(e){return '';}}
function far(i){return i>=0&&PLACES[i].p>=E.vk.tripFarFrom;}
function north(i){return i>=0&&PLACE_ORD.indexOf(i)>PLACE_ORD.indexOf(7);} // глава II — после Камчатки
function tkUp(i){var r=Math.max(1,PLACES[i].rec|0);['rod','line','reel'].forEach(function(k){S.tk[k]=Math.max(S.tk[k]|0,Math.min(4,r));});}
function openNext(){var i=np();if(i<0){payAdd(CHEST[topPlace()]);return -1;}S.open[i]=1;tkUp(i);return i;}
function stat(a,k){try{STAT.ev('mod',{m:'pay2',a:a,k:k||''});}catch(e){}}
/* ---------- товары ---------- */
PAY_ITEMS.trip_near={vk:E.vk.tripNear,ic:'🎫',name:'Путёвка с доплатой',en:'Trip with top-up',desc:'Путёвка на следующее место и снасть под его рыбу',de:'A trip to the next place and tackle for its fish',done:'🎫 Новое место открыто — Петрович уже сложил снасти!',
  give:function(){var i=openNext();stat('trip',i);}};
PAY_ITEMS.trip_far={vk:E.vk.tripFar,ic:'🎫',name:'Дальняя путёвка с доплатой',en:'Far trip with top-up',desc:'Путёвка на следующее дальнее место и снасть под его рыбу',de:'A trip to the next far place and tackle for its fish',done:'🎫 Новое место открыто — Петрович уже сложил снасти!',
  give:function(){var i=openNext();stat('tripf',i);}};
PAY_ITEMS.kit_next={vk:E.vk.kitCh1,ic:'🎒',name:'Набор следующего водоёма',en:'Next waters kit',desc:'Путёвка, снасть под место, 30 лучшей наживки и полсундука монет',de:'A trip, tackle for the place, 30 best bait and half a chest of coins',done:'🎒 Набор собран — новое место ждёт!',
  give:function(){var i=openNext(),t=topPlace(),b=a3BestBait(t);S.bait[b]=(S.bait[b]||0)+30;payAdd(Math.round(CHEST[t]/2/50)*50);stat('kit',i);}};
PAY_TEST.trip_near=59;PAY_TEST.trip_far=99;PAY_TEST.kit_next=79;
function kitPrice(){var i=np();return north(i)?E.vk.kitNorth:E.vk.kitCh1;}
function kitOk(){var i=np();if(i<0)return false;if(PLACES[i].id==='chud')return false;/* у Чудского — свой «Экспедиция на Север» */if(PLACES[i].id==='volga'||PLACES[i].id==='rechka')return false;/* «На Волгу» */return true;}
function list(){if(!PAY.v)return;['trip_near','trip_far','kit_next'].forEach(function(id){if(!PAY.item(id))PAY.list.push({id:id});});}
list();{var iv=PAY.initVK;PAY.initVK=function(){return Promise.resolve(iv.apply(PAY,arguments)).then(list);};}
function can(id){try{return !!(PAY.on&&!inGame()&&PAY.item(id)&&!OK);}catch(e){return false;}}
function votes(n){var a=n%10,b=n%100;return n+' '+(T(a===1&&b!==11?'голос':a>=2&&a<=4&&(b<12||b>14)?'голоса':'голосов',n===1?'vote':'votes'));}
/* ---------- П2: «Не хватает монет» на путёвку ---------- */
{var ne=notEnough;notEnough=function(p){ne(p);try{var i=np(),nb=document.getElementById('neBuy');if(!nb||i<0||PLACES[i].p!==p)return;var id=far(i)?'trip_far':'trip_near';if(!can(id))return;
  nb.innerHTML='⭐ '+T('Путёвка «'+nm2(i)+'» + снасть · ','Trip to '+nm2(i)+' + tackle · ')+votes(PAY_ITEMS[id].vk);
  nb.onclick=function(){hideModal();PAY.re=function(){if(!G)openMap();};PAY.buy(id);};stat('ne',id);}catch(e){}};}
/* ---------- П3 и П5: витрина ---------- */
{var os=openShop;openShop=function(tab,hl){os.apply(this,arguments);try{if(shopTab!=='p')return;var l=document.getElementById('shList');if(!l)return;
  // П5: старожилу «Кошелёк» — не на первой полке
  if(E.ord()>=E.vk.coinsHideOrd){var cs=l.querySelector('[data-vc="coins_s"]'),cl=l.querySelector('[data-vc="coins_l"]');if(cs&&cl&&cl.parentNode!==cs.parentNode){var sec=cs.closest('.vt-sh');cl.parentNode.appendChild(cs);if(sec&&!sec.querySelector('.vt-c'))sec.parentNode.removeChild(sec);}}
  // П3: карточка набора — первой в «Наборах»
  if(can('kit_next')&&kitOk()){var it=PAY_ITEMS.kit_next;it.vk=kitPrice();var i=np(),g=l.querySelector('.vt-sh .vt-g [data-vc="starter"],.vt-sh .vt-g [data-vc="big_catch"],.vt-sh .vt-g [data-vc="bait_box"]');
    var art=window.LOOK&&LOOK.art&&LOOK.PAY_ART&&LOOK.PAY_ART.north_kit?LOOK.art('volga'):'<span class="vt-em">🎒</span>';
    var h='<div class="vt-c vt-w vt-hot" data-vc="kit_next"><i class="vt-tag">'+T('Следующее место','Next place')+'</i><div class="vt-a">'+art+'</div><div class="vt-t"><b>'+T('Набор: ','Kit: ')+esc(nm2(i))+'</b><small>'+esc(T(it.desc,it.de))+'</small><em>'+T('путёвка сразу · ≈ ','trip right now · ≈ ')+coinsTxt(PLACES[i].p+Math.round(CHEST[topPlace()]/2/50)*50)+T(' ценности',' value')+'</em></div><button class="vt-buy pbuy0 noenter" data-vpid="kit_next">'+votes(it.vk)+'</button></div>';
    var grid=g?g.parentNode:null;if(grid){grid.insertAdjacentHTML('afterbegin',h);var c=grid.querySelector('[data-vc="kit_next"]');c.onclick=function(){try{SND.tap();}catch(e){}PAY.buy('kit_next');};stat('show','kit');}}}catch(e){}};}
/* ---------- П4: пробная неделя Клуба на 2-й день ---------- */
function dayN(){try{return dayNum()-(S.d0||dayNum())+1;}catch(e){return 0;}}
var TR={ok:function(){try{return !OK&&!!S.r2k&&!S.r2k.cl&&dayN()>=E.vk.clubTrialDay&&!(a3Club().n)&&(S.caught||0)>=1;}catch(e){return false;}},
  take:function(){if(!TR.ok())return false;var t=a3Now();S.club.b['w'+t+'_'+Math.floor(Math.random()*1e4)]=t;S.club.flt=1;S.r2k.cl=dayNum();try{save();}catch(e){}stat('clubtry');
    try{toast('🎫 '+T('Неделя в Клубе рыбаков — подарок!','A week in the Anglers’ Club — a gift!'),3200,true);}catch(e){}return true;},
  txt:function(){return T('Неделя в Клубе рыбаков — в подарок: посылки, 6-й заброс, без рекламы','A free week in the Anglers’ Club: parcels, 6th cast, no ads');}};
window.ECO_CLUB_TRIAL=TR;
try{MAILX.push({id:'clubtry',ok:TR.ok,ic:'🎫',part:T('неделя в Клубе','a club week'),t:T('Петрович: «Записал тебя в Клуб на недельку!»','Petrovich: “I signed you up to the Club for a week!”'),sub:T('посылки каждый день, 6-й заброс, без рекламы','daily parcels, 6th cast, no ads'),take:function(){TR.take();}});}catch(e){}
// после пробной недели — «Клуб 7 дней» на главном (3 дня, пока не купил)
if(window.R2)R2.slot('home','club7',{pri:4,when:function(){try{var c=S.r2k.cl;return !!c&&!a3Club().on&&dayNum()-c>=7&&dayNum()-c<=10&&can('club7');}catch(e){return false;}},
  html:function(){return '<button class="a3m noenter">🎫 <b>'+T('Клуб — ещё неделя за ','Club — another week for ')+votes(E.vk.club7)+'</b> ›</button>';},
  bind:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){try{SND.tap();}catch(e){}stat('club7');PAY.buy('club7');};}});
window.RB2_PAY2={trip:function(){return far(np())?'trip_far':'trip_near';},kitOk:kitOk,kitPrice:kitPrice,club:TR};
})();
