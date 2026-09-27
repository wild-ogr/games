'use strict';
/* ---- товары «Богатыря» (каталог — hobby-analytics/13-purchases-catalog.md, п. 4.3). Золото, дары, воскрешения, «награду без ролика»
   НЕ продаём: золото покупает силу, а у игры рейтинги endless/kills/weekly/daily. Только удобство и красота ----
   vk — цена в голосах, обязана совпадать с ~/Projects/hobby-pay/catalog.json (сервер vk-pay отдаёт её VK) */
const PAY_ROW='prow';
const PAY_ITEMS={
  no_ads:{perm:1,vk:14,ic:'🚫',name:'Без рекламы между походами',desc:'Навсегда. Жар-птица, «Подняться», ×2 и ×3 остаются за рекламу — по желанию'},
  skins_fest:{perm:1,vk:11,ic:'🎉',name:'Праздничные облики',desc:'Масленичный, Новогодний и Купальский облики для всех 9 богатырей. Только внешний вид',done:'Праздничные облики — во вкладке «Богатыри»!'},
  mead:{perm:1,vk:7,ic:'🍯',name:'Чаша мёда мастеру',desc:'Поддержать автора: золотая рамка «Меценат» у портретов богатырей',done:'Спасибо, меценат! Мёд пьём за твоё здоровье'}
};
const PAY_TEST={no_ads:99,skins_fest:79,mead:49}; // цены только для ?paytest=1; настоящие — в консоли
function payAdd(n){S.gold=(+S.gold||0)+n;} // золото не продаём — нужно только общему модулю
function payFlush(){cloudFlush();}
function payPause(on){if(!adShowing)setMuted(on);}
// покупки — только в меню (в походе и на экране итогов их нет)
function payHere(){return PAY.on&&!G;}
// после покупки/восстановления: перерисовать окно (PAY.re) или вкладку «Богатыри»
function payAfter(){if($('modal').classList.contains('on')&&PAY.re)PAY.re();if(!G&&curTab==='Heroes')renderHeroes();}
/* ================= покупки за деньги: Яндекс Игры (ysdk.payments) и VK Игры (VKWebAppShowOrderBox) — общий модуль (одинаковый в 5 играх) =================
   Товары игры — PAY_ITEMS (выше), id совпадают с id в консоли Яндекса («Инап-покупки») и в hobby-pay/catalog.json (VK).
   Кнопок покупок НЕТ совсем, если платежи недоступны: нет SDK/моста (мак), каталог Яндекса пуст, VK не поддерживает оплату (iOS).
   Постоянные (perm) — флаг S.buy[id], разовый бонус монет — один раз на игрока (S.buyB). Выдача — только после подтверждения площадки.
   Яндекс: цена и значок валюты — только из getCatalog; расходуемые: выдать → сохранить (облако сразу) → consumePurchase;
     незавершённые при запуске довыдаём (getPurchases). Токены выданных — S.payT (и в облаке), сбой consume не даст выдать второй раз.
   VK: на кнопке число голосов (PAY_ITEMS.vk). success:true + order_id → выдать → сохранить → стереть ключ pay_<order_id>.
     Страховка: сервер vk-pay при оплате пишет в хранилище VK игрока pay_<order_id>=id (расходуемые) и own_<id>=1 (постоянные);
     при запуске читаем их и довыдаём. Выданные order_id — S.payV (последние 30); покупка без order_id оставляет метку «x:<id>»,
     которая «съест» первый чужой pay_ этого товара — второй раз не выдастся.
   Мак: ?paytest=1 — имитация Яндекса (localStorage «paytest»), ?vk=1&paytest=1 — имитация VK с сервером (localStorage «paytestvk»),
   ?paytest=fail — отказ. В настоящем VK (vk_app_id) и в Яндексе заглушек нет */
const payObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const PAY={on:false,p:null,v:null,list:[],busy:false,
  test:/[?&]paytest=/.test(location.search),
  // запуск: после SDK/моста и облака. Незавершённые покупки обрабатываем, даже если каталог не пришёл
  async init(){if(PAY.p||PAY.v)return;
    if(PLAT==='vk')return PAY.initVK();
    try{if(ysdk)PAY.p=ysdk.getPayments?await payT(ysdk.getPayments({signed:false})):ysdk.payments;
      else if(PAY.test&&!window.YaGames)PAY.p=payStub();}catch(e){PAY.p=null;}
    if(!PAY.p)return;
    try{await PAY.restore();}catch(e){}
    try{const c=await payT(PAY.p.getCatalog());PAY.list=(Array.isArray(c)?c:[]).filter(x=>x&&PAY_ITEMS[x.id]);}catch(e){PAY.list=[];}
    PAY.on=PAY.list.length>0;if(PAY.on)payAfter();},
  async initVK(){
    if(VK){let ok=false;try{ok=!!(VK.supportsAsync&&await payT(VK.supportsAsync('VKWebAppShowOrderBox'),8000));}catch(e){}if(ok)PAY.v=payVK();}
    else if(PAY.test&&!VK_REAL)PAY.v=payStubVK();
    if(!PAY.v)return;
    try{await PAY.restore();}catch(e){}
    PAY.list=Object.keys(PAY_ITEMS).filter(id=>PAY_ITEMS[id].vk>0).map(id=>({id}));
    PAY.on=PAY.list.length>0;if(PAY.on)payAfter();},
  own(id){return !!(payObj(S.buy)&&S.buy[id]);},
  item(id){return PAY.list.find(x=>x.id===id)||null;},
  give(id){const it=PAY_ITEMS[id];
    if(it.perm){if(!payObj(S.buy))S.buy={};S.buy[id]=1;
      if(it.bonus){if(!payObj(S.buyB))S.buyB={};if(!S.buyB[id]){S.buyB[id]=1;payAdd(it.bonus);}}}
    else payAdd(it.n||0);
    if(it.give)it.give();},
  // при запуске и «Восстановить покупки»: постоянные — выдать, если флага нет; расходуемые — довыдать и отметить
  async restore(){let got=0;
    if(PAY.v)got=await PAY.restoreVK();
    else{const ps=await payT(PAY.p.getPurchases());
      for(const x of (Array.isArray(ps)?ps:[])){const it=x&&PAY_ITEMS[x.productID];if(!it)continue;
        if(it.perm){if(!PAY.own(x.productID)){PAY.give(x.productID);got=1;}}else if(await PAY.credit(x))got=1;}}
    if(got){save();payFlush();payAfter();toast('Покупка зачислена',2600);}
    return got;},
  // VK: ключи own_<id> (постоянные, не стираем) и pay_<order_id> (расходуемые: выдать, сохранить, стереть)
  async restoreVK(){const ks=await PAY.v.keys();let got=0;const done=[];if(!Array.isArray(S.payV))S.payV=[];
    for(const k of ks){const m=/^(own|pay)_(.+)$/.exec(k.key||'');if(!m||!k.value)continue;
      if(m[1]==='own'){const it=PAY_ITEMS[m[2]];if(it&&it.perm&&!PAY.own(m[2])){PAY.give(m[2]);got=1;}continue;}
      const id=String(k.value),it=PAY_ITEMS[id];if(!it)continue;
      if(S.payV.indexOf(m[2])<0){const x=S.payV.indexOf('x:'+id); // покупка без order_id уже выдана — это её заказ
        if(x>=0)S.payV[x]=m[2];else{PAY.give(id);payMark(m[2]);got=1;}}
      done.push(k.key);}
    if(done.length){save();payFlush();for(const k of done)try{await PAY.v.clear(k);}catch(e){}}
    return got;},
  // расходуемая: выдать (если этот токен ещё не выдавали), сохранить в облако и только потом consumePurchase
  async credit(x){const t=String(x.purchaseToken||'');if(!Array.isArray(S.payT))S.payT=[];let fresh=false;
    if(!t||S.payT.indexOf(t)<0){PAY.give(x.productID);if(t)S.payT.push(t);if(S.payT.length>30)S.payT=S.payT.slice(-30);save();payFlush();fresh=true;}
    try{if(t)await payT(PAY.p.consumePurchase(t));}catch(e){}
    return fresh;},
  async buy(id){const it=PAY_ITEMS[id];if(!it||PAY.busy||!PAY.on||!PAY.item(id)||(it.perm&&PAY.own(id)))return;PAY.busy=true;payPause(true);
    try{if(PAY.v){const r=await PAY.v.order(id);if(!r||!r.success)throw new Error('cancel');
        const oid=r.order_id!=null?String(r.order_id):'';if(!Array.isArray(S.payV))S.payV=[];
        if(!oid||S.payV.indexOf(oid)<0){PAY.give(id);payMark(oid||'x:'+id);}
        save();payFlush();if(oid)PAY.v.clear('pay_'+oid).catch(()=>{});}
      else{const x=await PAY.p.purchase({id});
        if(it.perm){PAY.give(id);save();payFlush();}
        else await PAY.credit(x&&x.productID===id?x:{productID:id,purchaseToken:x&&x.purchaseToken});}
      SND.coin();toast(it.done||'Готово! Спасибо за покупку',2800);payAfter(id);}
    catch(e){toast('Покупка не состоялась',2200);}
    finally{PAY.busy=false;payPause(false);}},
  // «Восстановить покупки» (Об игре): заново читаем getPurchases / ключи VK
  async again(){if(!(PAY.p||PAY.v)||PAY.busy)return;PAY.busy=true;let got=0;try{got=await PAY.restore();}catch(e){}PAY.busy=false;if(!got)toast('Покупки проверены — всё на месте',2400);},
  // цена: VK — число голосов (требование VK); Яндекс — из каталога: число + значок валюты (getPriceCurrencyImage), иначе готовая строка price
  price(pr){if(PAY.v){const n=PAY_ITEMS[pr.id].vk,a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'голос':a>=2&&a<=4&&(b<12||b>14)?'голоса':'голосов');}
    let img='';try{img=pr.getPriceCurrencyImage?pr.getPriceCurrencyImage('svg'):'';}catch(e){}
    return img&&pr.priceValue?payEsc(pr.priceValue)+'<img class="pcur" src="'+payEsc(img)+'" alt="">':payEsc(pr.price||pr.priceValue||'');},
  row(pr){const it=PAY_ITEMS[pr.id],own=it.perm&&PAY.own(pr.id),txt='<span>'+it.ic+' '+payEsc(it.name)+'<br><small>'+payEsc(it.desc)+'</small></span>';
    return own?'<div class="'+PAY_ROW+' pown">'+txt+'<i>куплено</i></div>':'<button class="'+PAY_ROW+' pbuy" data-pid="'+payEsc(pr.id)+'">'+txt+'<b>'+PAY.price(pr)+'</b></button>';},
  // список товаров (ids — только эти, по порядку каталога); owned=false — без уже купленных
  html(ids,owned){const L=PAY.list.filter(pr=>(!ids||ids.indexOf(pr.id)>=0)&&(owned!==false||!(PAY_ITEMS[pr.id].perm&&PAY.own(pr.id))));
    return L.length?'<div class="pay"><h3>Покупки</h3>'+L.map(PAY.row).join('')+'</div>':'';},
  bind(root){(root||document).querySelectorAll('.pbuy').forEach(b=>b.onclick=()=>{try{(SND.tap||SND.click)();}catch(e){}PAY.buy(b.dataset.pid);});}
};
function payMark(v){if(!Array.isArray(S.payV))S.payV=[];if(S.payV.indexOf(v)<0)S.payV.push(v);if(S.payV.length>30)S.payV=S.payV.slice(-30);}
// слияние облака (d) в сохранение T (по умолчанию S): купленное, выданные бонусы, токены и заказы — объединение (покупка не теряется ни с какой стороны)
function payMerge(d,T){T=T||S;if(!payObj(d)||!payObj(T))return;
  for(const f of ['buy','buyB'])if(payObj(d[f])){if(!payObj(T[f]))T[f]={};for(const k in d[f])if(d[f][k])T[f][k]=1;}
  for(const f of ['payT','payV'])if(Array.isArray(d[f])){if(!Array.isArray(T[f]))T[f]=[];for(const t of d[f])if(typeof t==='string'&&T[f].indexOf(t)<0)T[f].push(t);if(T[f].length>30)T[f]=T[f].slice(-30);}}
function payT(p,ms){return Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms||15000))]);}
function payEsc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);}
// VK: окно оплаты (игрок может думать долго — ждём до 10 мин) и ключи хранилища, которые пишет сервер vk-pay
function payVK(){return {order:id=>vkSend('VKWebAppShowOrderBox',{type:'item',item:id},600000),
  keys:async()=>{const r=await vkSend('VKWebAppStorageGetKeys',{count:1000,offset:0},8000),ks=((r&&r.keys)||[]).filter(k=>/^(own|pay)_/.test(k));
    if(!ks.length)return [];const g=await vkSend('VKWebAppStorageGet',{keys:ks},8000);return (g&&g.keys)||[];},
  clear:k=>vkSend('VKWebAppStorageSet',{key:k,value:''},8000)};}
// имитация платежей для проверки на маке (?paytest=1): цены — PAY_TEST, покупки лежат в localStorage «paytest», consume их убирает
function payStub(){const K='paytest',rd=()=>{try{return JSON.parse(localStorage.getItem(K))||[];}catch(e){return [];}},wr=a=>{try{localStorage.setItem(K,JSON.stringify(a));}catch(e){}};
  const cur='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#f5b400"/><text x="10" y="14.5" font-size="12" text-anchor="middle" font-family="Arial" font-weight="700" fill="#fff">T</text></svg>');
  const wait=v=>new Promise(ok=>setTimeout(()=>ok(v),250)),fail=()=>window.__payCancel||/[?&]paytest=fail/.test(location.search);
  return {getCatalog:()=>wait(Object.keys(PAY_TEST).map(id=>({id,title:id,description:'',imageURI:'',price:PAY_TEST[id]+' тест',priceValue:String(PAY_TEST[id]),priceCurrencyCode:'TST',getPriceCurrencyImage:()=>cur}))),
    getPurchases:()=>wait(rd()),
    purchase:({id})=>fail()?Promise.reject(new Error('cancel')):wait(null).then(()=>{const x={productID:id,purchaseToken:'t'+Date.now()+Math.random().toString(36).slice(2,6),developerPayload:''};const a=rd();a.push(x);wr(a);return x;}),
    consumePurchase:t=>{if(window.__payNoConsume)return Promise.reject(new Error('fail'));wr(rd().filter(x=>x.purchaseToken!==t));return wait();}};}
// имитация VK (?vk=1&paytest=1): «сервер» пишет pay_/own_ в localStorage «paytestvk», как vk-pay в хранилище VK.
// __payNoOid — ответ без order_id, __payNoClear — стирание ключа не прошло, ?paytest=fail / __payCancel — отказ
function payStubVK(){const K='paytestvk',rd=()=>{try{return JSON.parse(localStorage.getItem(K))||{};}catch(e){return {};}},wr=o=>{try{localStorage.setItem(K,JSON.stringify(o));}catch(e){}};
  const wait=v=>new Promise(ok=>setTimeout(()=>ok(v),250)),fail=()=>window.__payCancel||/[?&]paytest=fail/.test(location.search);
  return {order:id=>fail()?Promise.reject({error_type:'client_error'}):wait().then(()=>{const oid=String(Date.now()),o=rd();
      if(PAY_ITEMS[id].perm)o['own_'+id]='1';else o['pay_'+oid]=id;wr(o);return window.__payNoOid?{success:true}:{success:true,order_id:+oid};}),
    keys:()=>wait(Object.entries(rd()).filter(([k,v])=>v).map(([key,value])=>({key,value}))),
    clear:k=>{if(window.__payNoClear)return Promise.reject(new Error('fail'));const o=rd();delete o[k];wr(o);return wait();}};}
