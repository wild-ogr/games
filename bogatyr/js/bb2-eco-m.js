/* ===== bb2-eco-m.js — поток ECO (деньги): заглушки на старте; окна Лавки/Обоза и кузница — js/bb2-eco-shop.js по требованию (набор 'eco').
   Флаги: adtrim, adfree, temper, buysee; платные shop, uzelok, oboz, saga15 — только при BB2E.eco.live=1 (стенд: ?ecopay=1), не в ОК.
   S.bb2.eco: t{ключ:[уровень,шагов]} · gd/rd день дара/перебора · fr[день,n] «Взять так» · ob[ветка,уровень] заказ обоза. Потокам: BB2.eco.band(), BB2.eco.rw('s'|'m'|'b'). */
(function(){'use strict';
if(typeof BB2==='undefined')return;
var Q=location.search,X=BB2.eco={};
function N(p,d){return BB2.n('eco.'+p,d);}
function ob(x){return x&&typeof x==='object'&&!Array.isArray(x)?x:null;}
function live(){return !!(N('live',0)||/[?&]ecopay=1/.test(Q))&&!(typeof OK!=='undefined'&&OK);}
function paid(f){return live()&&BB2.on(f);}
function st(){return BB2.s('eco');}
function pair(a,str){return Array.isArray(a)&&a.length===2&&typeof a[0]===(str?'string':'number')&&typeof a[1]==='number'?a:null;}
function later(a,b){return typeof b==='string'&&(typeof a!=='string'||b>a)?b:a;}
BB2.save('eco',{fix:function(o){var t=ob(o.t)||{},k;for(k in t)if(!pair(t[k]))delete t[k];o.t=t;if(!Object.keys(t).length)delete o.t; /* пустое не храним: нет поля = как у новичка */
    if(typeof o.gd!=='string')delete o.gd;if(typeof o.rd!=='string')delete o.rd;if(!pair(o.fr,1))delete o.fr;
    if(!(Array.isArray(o.ob)&&typeof o.ob[0]==='string'&&typeof o.ob[1]==='number'))delete o.ob;return o;},
  merge:function(a,b){var k,x,y;a.t=ob(a.t)||{};b=ob(b)||{};
    for(k in ob(b.t)||{}){x=pair(a.t[k]);y=pair(b.t[k]);if(y&&(!x||y[0]>x[0]||(y[0]===x[0]&&y[1]>x[1])))a.t[k]=y.slice();}
    a.gd=later(a.gd,b.gd);a.rd=later(a.rd,b.rd);x=pair(a.fr,1);y=pair(b.fr,1);if(y&&(!x||y[0]>x[0]||(y[0]===x[0]&&y[1]>x[1])))a.fr=y.slice();
    if(!a.ob&&b.ob)a.ob=b.ob;if(!Object.keys(a.t).length)delete a.t;return a;}});
function stat(a,o){o=o||{};o.a=a;BB2.stat('eco',o);}
X.live=live;X.paid=paid;X.st=st;X.stat=stat;

/* ---------- отрезок глав и размер награды (для всех потоков) ---------- */
X.band=function(){var n=0,k,b=BB2.n('base.band',[3,18]);try{for(k in S.done)if(S.done[k])n++;}catch(e){}return n<=b[0]?0:n<=b[1]?1:2;};
X.rw=function(v){var k=v==='s'?'small':v==='m'?'mid':v==='b'?'big':'';return k?BB2.n('base.'+k,[0,0,0])[X.band()]:+v||0;};

/* ---------- 1. чистка кнопок ролика (adtrim): дар Жар-птицы — раз в день даром; «казна сразу» и «новый товар коробейника» убраны; первый перебор дня — даром ---------- */
var trim=function(){return BB2.on('adtrim');};
var gR=giftReady,gT=takeGift,gH=giftLeftH,bL=boostLeft;
giftReady=function(){return trim()?!!S.runs&&st().gd!==dayKey():gR();};
giftLeftH=function(){if(!trim())return gH();var d=new Date(dayMs());return Math.max(1,24-d.getHours());};
boostLeft=function(){return trim()?0:bL();};
takeGift=function(after,p){if(!trim())return gT(after,p);if(giftReady()){var a=giftAmt();S.gold+=a;ern('gift',a);S.gift=nowMs();st().gd=dayKey();save();SND.chest();
    toast('+'+fmtNum(a)+L(' золота!',' gold!'));setGold();stat('gift',{g:a,p:p||'vil'});}if(after)after();};
function giftTxt(){return giftReady()?L('+'+fmtNum(giftAmt())+' золота — даром, раз в день','+'+fmtNum(giftAmt())+' gold — free, once a day'):L('Прилетит завтра','Back tomorrow');}
function free(b,txt){b.className='btn gold';b.innerHTML=txt||L('Забрать','Take');}
BB2.hook('vil',function(el){if(!trim()||!el)return;var b=el.querySelector('#afkBoost'),c;
  if(b){c=b.parentNode;while(c&&!(c.classList&&c.classList.contains('card')))c=c.parentNode;if(c&&c.parentNode)c.parentNode.removeChild(c);}
  b=el.querySelector('#giftBtn');if(b){c=b.parentNode.querySelector('.t span');if(c)c.textContent=giftTxt();free(b);}
  else{c=el.querySelectorAll('.card.gift .t span');if(c.length&&!giftReady()&&/\d/.test(c[0].textContent))c[0].textContent=giftTxt();}});
BB2.hook('today',function(TL){if(!trim()||!TL)return;for(var i=0;i<TL.length;i++)if(TL[i].k==='gift'){TL[i].s=giftTxt();TL[i].b=L('Забрать','Take');TL[i].ad=0;}});
BB2.hook('run',function(g){if(!trim()||!g||g.first||g.endless||g.daily||g.weekly)return;var s=st(),d=dayKey();if(s.rd===d)return;s.rd=d;g.rerolls=(g.rerolls||0)+N('adtrim.rerollFree',1);stat('reroll');});
function cut(m,id){var b=m&&m.querySelector('#'+id),p;if(!b)return;p=b.parentNode;p.removeChild(b);if(p.classList.contains('btns')&&!p.children.length&&p.parentNode)p.parentNode.removeChild(p);}

/* ---------- 2. показы кнопок покупки (buysee): buy {i, r:'see', v, w: окно} — не чаще раза в минуту на товар ---------- */
var seen={};
function see(root,w){if(!BB2.on('buysee')||!root||typeof PAY==='undefined'||!PAY.on)return;var q=root.querySelectorAll('.pbuy[data-pid],[data-bpid],#slBuy1,#slBuy2'),i,id,t=Date.now();
  for(i=0;i<q.length;i++){id=q[i].getAttribute('data-pid')||q[i].getAttribute('data-bpid')||(q[i].id==='slBuy1'?'saga_pass':'saga_pass10');
    if(seen[id]&&t-seen[id]<60000)continue;seen[id]=t;try{STAT.ev('buy',{i:id,r:'see',v:(PAY_ITEMS[id]||{}).vk|0,w:String(w||'').slice(0,12)});}catch(e){}}}
X.see=see;
BB2.hook('modal',function(kind,m){if(trim()){if(kind==='level')cut(m,'rrAd');cut(m,'trPdAd');}
  setTimeout(function(){see(m,kind||'win');},0);});

/* ---------- 3. «Взять так» на ПК (adfree): VK дважды ответил «ролика нет» → пока кнопки погашены, награда без ролика, до 3 раз в день ---------- */
var deny=0,PC=/[?&]vk_platform=desktop/.test(Q)||/[?&]pc=1/.test(Q);
function frLeft(){var f=st().fr;return N('adfree.perDay',3)-(f&&f[0]===dayKey()?f[1]:0);}
function frOk(){return PC&&PLAT==='vk'&&deny>=N('adfree.deny',2)&&Date.now()<adCoolT&&BB2.on('adfree')&&frLeft()>0;}
if(PC&&PLAT==='vk'){
  var sA=STAT.ad;STAT.ad=function(f,r){if(f==='rew'){if(r==='none')deny+=2;else if(r==='ok')deny=0;}return sA.apply(STAT,arguments);}; /* none = отказ и после тихого повтора: два «нет» */
  var sR=showRewarded,aD=adDim;
  showRewarded=function(cb,fail,late){if(adBusy||!frOk())return sR(cb,fail,late);var s=st(),d=dayKey(),n=(s.fr&&s.fr[0]===d?s.fr[1]:0)+1,p=adPl;adPl='';s.fr=[d,n];save();
    stat('free',{p:p||'?',n:n});toast(L('Ролика сейчас нет — держи так','No video right now — take it anyway'));try{cb();}catch(e){}adDim();};
  adDim=function(){aD();var ok=frOk(),q,i,b,h;try{q=document.querySelectorAll('.btn.ad,[data-g]');}catch(e){return;}
    for(i=0;i<q.length;i++){b=q[i];h=b.getAttribute('data-bb2f');
      if(ok){b.style.opacity='';if(h==null&&b.classList.contains('ad')){b.setAttribute('data-bb2f',b.innerHTML);b.innerHTML=L('🎁 Взять так','🎁 Take it')+' · '+frLeft();}}
      else if(h!=null){b.innerHTML=h;b.removeAttribute('data-bb2f');}}};
}

/* ---------- 4. «закалки» (temper): уровни кузницы после 10-го и Оружейной после 7-го — по 5 шагов (1/5 цены, 1/5 силы) ---------- */
var TW={}; /* оружие → доля шага (кэш: armFx зовётся на каждый удар) */
function tn(){return N('temper.steps',5);}
function tk(key,l){var e=st().t;e=e&&e[key];return e&&e[0]===l?e[1]:0;}
function retw(){TW={};if(!BB2.on('temper'))return;try{var t=st().t||{},k,id;for(k in t)if(k.slice(0,2)==='w_'){id=k.slice(2);if(t[k][0]===((S.armory||{})[id]||0)&&t[k][1]>0)TW[id]=t[k][1]/tn();}}catch(e){}}
var cS=calcStats,aF=armFx;
calcStats=function(h,pas,wm,sm,fo){var r=cS(h,pas,wm,sm,fo);if(fo||!BB2.on('temper'))return r;
  try{var f=S.forge,hm=heroMod(h),p=pas||{},n=tn(),l,k,b;
    l=f.hp|0;k=tk('hp',l);if(k){b=1+(hm.hp||0)+.1*forgeEff(l)+.15*(p.apple||0);r.maxHp*=(b+.1*(forgeEff(l+1)-forgeEff(l))*k/n)/b;}
    l=f.might|0;k=tk('might',l);if(k){b=1+(hm.might||0)+.06*forgeEff(l)+.1*(p.ring||0);r.might*=(b+.06*(forgeEff(l+1)-forgeEff(l))*k/n)/b;}}catch(e){}
  return r;};
armFx=function(id,l){var r=aF(id,l),q=TW[id],c,x;if(!q)return r;c=(S.armory||{})[id]||0;if((l!=null&&l!==c)||c>=ARMORY_MAX)return r;x=aF(id,c+1);return {d:r.d+(x.d-r.d)*q,a:r.a+(x.a-r.a)*q};};
X.tk=tk;X.tn=tn;X.retw=retw;X.trim=trim;X.free=free;
BB2.hook('run',retw,1);BB2.hook('cloud',retw);BB2.hook('ready',retw);

/* кузница: шаги закалки на кнопках, строка «Обоз», бесплатный дар в карточке «не хватает» — рисует догружаемый файл (X.x.deco); перерисовку ловит наблюдатель */
var mo=0;function deco(){if(BB2.eco.x)BB2.eco.x.deco();}
BB2.hook('tab',function(t,el){shopBtn();if(t!=='Forge'||!el||!(BB2.on('temper')||trim()||paid('oboz')))return;
  if(!mo&&window.MutationObserver){mo=new MutationObserver(deco);mo.observe(el,{childList:true});}BB2.need('eco').then(deco,function(){});});

/* ---------- 5. платное: товары, цена «Удалой», кнопка Лавки в шапке ---------- */
function setup(){if(typeof PAY_ITEMS==='undefined'||!live())return;var P=function(k,d){return N('price.'+k,d);};
  if(BB2.on('saga15')){PAY_ITEMS.saga_pass.vk=P('saga_pass',15);PAY_ITEMS.saga_pass10.vk=P('saga_pass10',29);}
  if(BB2.on('uzelok')){PAY_ITEMS.uzelok={perm:1,meta:1,vk:P('uzelok',5),ic:'🎒',get name(){return L('Узелок новобранца','Recruit’s Bundle');},get desc(){return L('Облик «Походный» всем богатырям, 3 свитка перебора и золото на два похода','“Wayfarer” outfit for every hero, 3 reroll scrolls and gold worth two runs');},
      get done(){return L('Узелок твой: облик, свитки и золото!','The bundle is yours: outfit, scrolls and gold!');},give:function(){BB2.eco.uzGive();}};
    try{PAY_TEST.uzelok=29;var pal={body:'#8a6a4a',cloak:'#4a6a3a',helm:'#a8a898',rim:'#c8b070',cap:'#6a4a2a',fur:'#d8c8a0',kok:'#c8a060',belt:'#c0392b',boots:'#5a3a1a'},h,k,o,sk;
      for(h in HERO_ART){o={};for(k in pal)if(typeof HERO_ART[h][k]==='string'&&HERO_ART[h][k][0]==='#')o[k]=pal[k];sk={id:'uzel',hero:h,get name(){return L('Походный','Wayfarer');},pay:'uzelok',pal:o};SKINS.push(sk);}}catch(e){}}
  if(BB2.on('oboz'))for(var i=1;i<=4;i++){PAY_ITEMS['oboz'+i]={meta:1,vk:P('oboz'+i,[0,3,5,7,10][i]),ic:'🛒',get name(){return L('Обоз кузнецу','Wagon for the smith');},get desc(){return L('Недостающее золото на выбранный уровень кузницы','The missing gold for the forge level you picked');},
      get done(){return L('Обоз пришёл — кузнец сделал!','The wagon arrived — forged!');},give:(function(t){return function(){BB2.eco.obGive(t);};})(i)};try{PAY_TEST['oboz'+i]=[0,19,39,59,79][i];}catch(e){}}}
X.uzGive=function(){if(!ob(S.buyB))S.buyB={};if(S.buyB.uzelok)return;S.buyB.uzelok=1;var g=N('uzelok.gold',[1400,3800,3800])[X.band()];payAdd(g);
  try{var s=typeof SL==='function'&&SL();if(s&&s.it)s.it.rr=(s.it.rr||0)+N('uzelok.scroll',3);}catch(e){}stat('uzelok',{g:g});};
X.obGive=function(t){var s=st(),o=s.ob,ok=0,f,cur,c,pay;try{if(o){f=FORGE.find(function(x){return x.id===o[0];});cur=S.forge[o[0]]||0;
    if(f&&cur===o[1]-1&&o[1]<=f.max&&o[1]<=N('oboz.maxLvl',10)){c=forgeCost(cur,f.id);pay=Math.min(Math.floor(S.gold),c);S.gold-=pay;if(pay>0)STAT.ev('spend',{k:'forge:'+f.id,c:pay});S.forge[f.id]=o[1];gearRefresh();ok=1;}}}catch(e){}
  delete s.ob;if(!ok)payAdd(N('oboz.lack',[1500,4000,8000,12000])[t-1]||0); /* заказ не найден (довыдача на другом устройстве) — золотом по размеру обоза */
  stat('oboz',{t:t,ok:ok});};
function shopBtn(){var tb=document.querySelector('#menu .topbar');if(!tb)return;var b=$('bb2Shop'),show=paid('shop')&&typeof payHere==='function'&&typeof PAY!=='undefined'&&PAY.on;
  if(!show){if(b)b.style.display='none';return;}
  if(!b){b=document.createElement('button');b.className='ibtn';b.id='bb2Shop';b.setAttribute('aria-label',L('Лавка','Shop'));b.style.position='relative';tb.insertBefore(b,$('moreBtn'));
    b.onclick=function(){SND.click();BB2.open('eco',function(){BB2.eco.x.shop();},null);};}
  b.innerHTML='🛒'+(PAY_ITEMS.uzelok&&!PAY.own('uzelok')?'<i style="position:absolute;right:4px;top:4px;width:10px;height:10px;border-radius:50%;background:#e0332a;border:1.5px solid #fff"></i>':'');b.style.display='';}
X.shopBtn=shopBtn;
try{setup();}catch(e){}
if(typeof payAfter==='function'){var pA=payAfter;payAfter=function(id){pA(id);shopBtn();};}
BB2.hook('ready',shopBtn);BB2.hook('cloud',shopBtn);BB2.hook('menu',shopBtn);
BB2.lazy('eco',['js/bb2-eco-shop.js'],function(){return !!BB2.eco.x;});
})();
