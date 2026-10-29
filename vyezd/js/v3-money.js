(function(){'use strict';
var W=window,D=document;
if(!W.V3||!W.UI||!W.VY||!W.homeSlots||!V3.reg||!V3.reg('money',{s:'MONEY',t:'Деньги и приток'}))return;
var PARTS={kiosk:'Лавка Шуры',vyr:'Выручка в окне поражения',place:'+1 место в кармане',parcel:'Посылка деда (ролики дня)',don:'Двойной или ничего',
'int':'Межэкранная A/B EVERY2/GAP120/FROM6 (выкл.)',tr:'Межэкранная на переходах вне двора (вкл.)',camera:'Фотоаппарат — карточки',invite:'Позвать соседа',help:'Спросить у соседа',ref:'Приглашения REF',
chip:'Вклад покупкой в «Скинулись на шлагбаум»',track:'Абонемент — вторая дорожка сезона',frank:'Франкенштейн Толика в Автоальбоме'};
for(var p0 in PARTS)try{V3.reg('money.'+p0,{s:'MONEY',t:PARTS[p0]});}catch(e){}
function on(p){try{return V3.is('money.'+p);}catch(e){return false;}}
function ok(f,d){try{return f();}catch(e){return d;}}
function Lg(a,b){return ok(function(){return L(a,b);},a);}
function en(){return ok(function(){return LANG==='en';},false);}
function esc(s){return UI.esc(s);}
function S_(){return VY.S;}
function G_(){return VY.G;}
function el(id){return D.getElementById(id);}
function ev(k,o){o=o||{};o.k=k;ok(function(){V3.ev('mn',o);});}
function now(){return ok(function(){return nowMs();},Date.now());}
function tk(){return ok(function(){return String(todayKey());},'');}
function dnum(){var s=tk();if(s.length!==8)return Math.floor(now()/864e5);return Math.round(Date.UTC(+s.slice(0,4),+s.slice(4,6)-1,+s.slice(6,8))/864e5);}
function plat(){return ok(function(){return OK?'ok':PLAT==='vk'?(VK_IOS?'ios':'vk'):'ya';},'ya');}
function tst(t,ms){ok(function(){toast(t,ms);});}
function coins(n,src){if(!n)return;ok(function(){ern(src||'v3p',n);});VY.coins(n);}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function bank(path,ctx){return ok(function(){if(!W.V3T||!V3T.on())return null;var x=V3T.line(path,ctx||{});return x&&x.t?x.t:null;},null);}
function num(x){x=+x;return isFinite(x)?x:0;}
function fixP(v){if(!v||typeof v!=='object'||Array.isArray(v))v={v:1};v.v=1;
['pn','ab','pv','sl','rd','hm','sw','wc','pk','pt','fk'].forEach(function(k){if(v[k]!=null)v[k]=num(v[k]);});
if(v.dn&&(typeof v.dn!=='object'||!(v.dn.s>0)))delete v.dn;
if(v.sh&&(typeof v.sh!=='object'||!Array.isArray(v.sh.q)))delete v.sh;
if(v.cs!=null){if(!Array.isArray(v.cs))v.cs=[];v.cs=v.cs.filter(function(x){return typeof x==='string'&&x.length<12;}).slice(0,16);}
if(v.tk!=null&&(typeof v.tk!=='object'||Array.isArray(v.tk)))delete v.tk;if(v.tk){v.tk={s:num(v.tk.s),w:num(v.tk.w),g:num(v.tk.g)};}
if(v.qb!=null&&(typeof v.qb!=='object'||Array.isArray(v.qb)))delete v.qb;if(v.qb){v.qb={w:String(v.qb.w||''),n:num(v.qb.n),q:num(v.qb.q)};}
if(!v.st||typeof v.st!=='object')v.st={n:0,cr:0,s:0,h:0};
if(!v.rc)v.rc=Math.random().toString(36).slice(2,8);
return v;}
V3.field('v3p',{s:'MONEY',def:function(){return fixP({});},fix:function(v){return fixP(v);},
merge:function(loc,cl,newer){loc=fixP(loc);cl=fixP(cl);var o=newer?cl:loc,x=newer?loc:cl;
['ab','pv','sl','rd','hm','sw','pk','pt','fk'].forEach(function(k){o[k]=Math.max(num(o[k]),num(x[k]));});
if(x.cs&&x.cs.length){o.cs=o.cs||[];x.cs.forEach(function(c){if(o.cs.indexOf(c)<0&&o.cs.length<16)o.cs.push(c);});}
if(x.tk&&(!o.tk||x.tk.s>o.tk.s||x.tk.s===o.tk.s&&x.tk.w>o.tk.w))o.tk=x.tk;
if(o.st.n<x.st.n)o.st=x.st;if(!o.ct&&x.ct)o.ct=x.ct;if(!o.fc&&x.fc)o.fc=x.fc;if(!o.rb&&x.rb)o.rb=x.rb;
if(x.pd===o.pd)o.pn=Math.max(num(o.pn),num(x.pn));else if(String(x.pd||'')>String(o.pd||'')){o.pd=x.pd;o.pn=x.pn;}
return o;}});
function P(){var S=S_();if(!S.v3p||typeof S.v3p!=='object')S.v3p=fixP({});return S.v3p;}
function sv(){VY.save();}
var ITEMS={
pie:{n:200,vk:4,ic:'🥧',name:'Пирожки бабе Шуре',desc:'Шуре — к чаю, тебе — 200 💰 и доброе слово',done:'+200 💰 — Шура довольна!',
en:{name:'Pies for Granny Shura',desc:'Tea treats for Shura, 200 💰 and a kind word for you',done:'+200 💰 — Shura is pleased!'},
give:function(){ok(function(){V3.emit('money:buy','pie');});setTimeout(function(){tst(bank('money.pie')||Lg(pick(['С капустой! Угадал. Теперь ты мне как внук.','Ой, с яйцом и луком… Ты где ж такой вежливый вырос?','Пирожки взяла. Твою машину теперь ставлю у самого подъезда.']),pick(['Cabbage pies! You guessed. You’re like a grandson to me now.','Oh, egg and onion… Where did you learn such manners?','Got the pies. Your car now parks right by my door.'])),3200);},600);}},
ab7:{n:0,vk:7,ic:'🎫',name:'Абонемент двора · 7 дней',desc:'Каждое утро — сундучок 25 💰 и заряженный свисток Шуры; вторая дорожка сезона',done:'Абонемент на 7 дней — спасибо!',
en:{name:'Yard pass · 7 days',desc:'Every morning — a 25 💰 chest and Shura’s whistle charged; a second season track',done:'7-day pass — thank you!'},give:function(){abAdd(7);}},
ab30:{n:0,vk:21,ic:'🎫',name:'Абонемент двора · 30 дней',desc:'Месяц сундучков 25 💰, свистка и вторая дорожка сезона',done:'Абонемент на 30 дней — спасибо!',
en:{name:'Yard pass · 30 days',desc:'A month of 25 💰 chests, the whistle and a second season track',done:'30-day pass — thank you!'},give:function(){abAdd(30);}},
toys:{perm:1,vk:11,ic:'🧸',name:'Тема «Игрушки на коврике»',desc:'Пластиковые машинки на ковре — весь двор как в детстве',done:'Тема «Игрушки» — твоя!',
en:{name:'“Toys on the rug” theme',desc:'Plastic toy cars on a rug — the whole yard like childhood',done:'“Toys” theme is yours!'},give:function(){lookSet('toys');}},
vyr:{n:0,vk:3,ic:'🧰',name:'Выручка',desc:'Жизнь, подсказка и эвакуатор — прямо сейчас',done:'Выручка приехала!',
en:{name:'Rescue kit',desc:'A life, a hint and a tow truck — right now',done:'Rescue is here!'},give:function(){vyrGive('pay');}}
};
var PT={pie:49,ab7:79,ab30:199,toys:129,vyr:39};
ok(function(){for(var id in ITEMS){if(!PAY_ITEMS[id])PAY_ITEMS[id]=ITEMS[id];if(PAY_TEST[id]==null)PAY_TEST[id]=PT[id];}
if(PAY.on&&PAY.v)for(var k in ITEMS)if(!PAY.item(k))PAY.list.push({id:k});});
function canBuy(id){return on('kiosk')&&ok(function(){return PAY.on&&!!PAY.item(id)&&!(PAY_ITEMS[id].perm&&PAY.own(id));},false);}
function price(id){return ok(function(){return PAY.price(PAY.item(id));},'');}
function shown(ids){ids.forEach(function(id){if(canBuy(id))ok(function(){STAT.ev('buy',{i:id,r:'show',v:PAY_ITEMS[id].vk|0});});});}
function buy(id){ok(function(){PAY.buy(id);});}
function abLeft(){return Math.max(0,num(P().ab)-dnum()+1);}
function abAdd(n){var p=P(),d=dnum();p.ab=Math.max(num(p.ab),d-1)+n;sv();abChest();ok(function(){V3.emit('money:buy','ab'+n);});}
function abChest(){if(!on('kiosk'))return;var p=P(),d=tk();if(abLeft()<1||p.ac===d)return;p.ac=d;p.wc=1;sv();coins(25,'chest');
ok(function(){V3.emit('money:whistle');});ev('ab',{l:abLeft()});
setTimeout(function(){tst(Lg('🎫 Абонемент: сундучок +25 💰 и свисток заряжен (дней: ','🎫 Yard pass: chest +25 💰 and whistle charged (days left: ')+abLeft()+')',3200);},900);}
function tone(pal,t){var o={};for(var k in pal)o[k]=pal[k];for(var j in t)o[j]=t[j];return o;}
ok(function(){var B=LOOKS.summer;if(!B||LOOKS.toys)return;
LOOKS.toys={name:'Игрушки на коврике',en:'Toys on the rug',pal:['#ff3b30','#007aff','#34c759','#ffcc00','#af52de','#ff9500','#00c7be','#ffffff','#5856d6','#ff2d55'],map:B.map,glass:'#1c3d6e',tyre:'#222',
tod:{day:tone(B.tod.day,{sky:['#f7e3c4','#fbeedd'],lawn:['#c9874f','#b8763f'],asph:'#d9a066',asph2:'#e2ad78',mark:'rgba(255,240,200,.85)',walk:'#e8c79a',curb:'#f3dcb8',bush:'#3fae4a',bush2:'#68c76f'}),
morning:tone(B.tod.morning,{sky:['#ffd9b8','#fff0e0'],lawn:['#cf8e55','#bd7c45'],asph:'#dca56c',asph2:'#e6b17e',walk:'#ebcb9e'}),
evening:tone(B.tod.evening,{lawn:['#b9783f','#a86a35'],asph:'#c9915c',asph2:'#d39d6a',walk:'#d8b88c'}),
night:tone(B.tod.night,{lawn:['#6b4a32','#5e402b'],asph:'#7a5a40',asph2:'#86664a'})}};
LOOKS.poster={name:'Плакат',en:'Poster',pal:['#d7263d','#1b4f9c','#2e8540','#f4c20d','#5e2b97','#e56b1f','#138a8a','#f2efe6','#22313f','#d94f8a'],map:B.map,glass:'#22313f',tyre:'#111',
tod:{day:tone(B.tod.day,{sky:['#f2efe6','#f2efe6'],lawn:['#e9d8a6','#e1cd94'],asph:'#d0c7b5',asph2:'#dad2c2',walk:'#f2efe6',curb:'#22313f',mark:'rgba(34,49,63,.55)',bush:'#2e8540',bush2:'#3a9a4f'}),
morning:tone(B.tod.morning,{lawn:['#ecdcaa','#e3cf98']}),evening:tone(B.tod.evening,{lawn:['#d8c08a','#ccb37c']}),night:tone(B.tod.night,{})}};});
function lookOwn(id){if(id==='summer')return true;if(id==='toys')return ok(function(){return PAY.own('toys');},false);if(id==='poster')return num(P().pv)>=15;return false;}
function lookSet(id){if(!LOOKS[id]||!lookOwn(id))id='summer';P().lk=id==='summer'?'':id;sv();ok(function(){setLook(id);});ok(function(){UI.refresh();});}
V3.sub('boot',function(){var id=P().lk;if(id&&lookOwn(id))ok(function(){setLook(id);});},'money.kiosk');
var BOOST={};
function boostRows(){var h='';for(var id in BOOST){var b=BOOST[id];if(!b||!b.give)continue;
h+='<div class="v3pRow"><span>'+b.ic+' '+esc(en()&&b.en?b.en:b.name)+(b.have?' · <b>'+esc(String(ok(b.have,0)))+'</b>':'')+'</span>'+
(b.c?'<button class="btn sm coinb noenter" data-bc="'+id+'">'+b.c+' 💰</button>':'')+(b.ad&&adOk_()?'<button class="btn sm accent noenter" data-ba="'+id+'">📺</button>':'')+'</div>';}return h;}
function adOk_(){return ok(function(){return adOk();},false);}
function lavka(){if(!on('kiosk'))return ok(function(){openShop();});var S=S_(),p=P(),buyOn=ok(function(){return PAY.on&&!inYard();},false),ids=['pie','ab7','ab30','toys'];
var h='<h2>🏪 '+Lg('Лавка Шуры','Shura’s kiosk')+'</h2>'+ok(function(){return shura(bank('money.lavka')||Lg('Свои люди — свои цены. Бери, не стесняйся.','Neighbours get neighbour prices. Help yourself.'),'happy');},'')+
'<p>'+Lg('У тебя ','You have ')+esc(ok(function(){return coinsTxt(S.coins);},S.coins+''))+(abLeft()?' · 🎫 '+Lg('абонемент ещё ','pass: ')+abLeft()+' '+Lg('дн.','days'):'')+'</p>';
if(buyOn)h+=ok(function(){return payHtml(ids,false);},'');
if(abLeft()||buyOn)h+=tkRow();
var th='<div class="v3pTh"><b>'+Lg('Вид двора','Yard look')+'</b>';
['summer','toys','poster'].forEach(function(id){var Lk=LOOKS[id];if(!Lk)return;var own=lookOwn(id),cur=(P().lk||'summer')===id;
th+='<button class="btn sm'+(cur?' green':'')+' noenter" data-lk="'+id+'"'+(own?'':' disabled')+'>'+(id==='toys'?'🧸 ':id==='poster'?'🖼 ':'☀️ ')+esc(en()?Lk.en:Lk.name)+(own?'':' 🔒')+'</button>';});
var pv=Math.min(15,num(p.pv));
if(pv<15&&adOk_())th+='<div class="v3pRow"><span>🖼 '+Lg('«Плакат» — за 15 роликов: ','“Poster” — for 15 videos: ')+'<b>'+pv+'/15</b></span><button class="btn sm accent noenter" id="v3pPv">📺 '+Lg('за рекламу','watch')+'</button></div>';
h+=th+'</div>'+boostRows();
h+='<div class="row"><button class="btn sec noenter" id="v3pCoins">💰 '+Lg('Монеты','Coins')+'</button><button class="btn" id="mCancel">'+Lg('Закрыть','Close')+'</button></div>';
var m=VY.modal(h);ok(function(){modalRe=lavka;});
if(buyOn){ok(function(){PAY.bind(m);PAY.re=lavka;});shown(ids);}
ev('kiosk',{b:buyOn?1:0,p:plat()});
var q=m.querySelectorAll('[data-lk]');for(var i=0;i<q.length;i++)q[i].onclick=function(){lookSet(this.getAttribute('data-lk'));ev('look',{id:this.getAttribute('data-lk')});lavka();};
var b=el('v3pPv');if(b)b.onclick=function(){if(ok(function(){return adHold('poster');},false))return;VY.hide();ok(function(){STAT.place('poster');});
showRewarded(function(){pvAdd();lavka();},function(){lavka();},function(){pvAdd();return Lg('«Плакат»: +1 ролик','“Poster”: +1 video');});};
q=m.querySelectorAll('[data-bc]');for(i=0;i<q.length;i++)q[i].onclick=function(){var id=this.getAttribute('data-bc'),x=BOOST[id];if(!x)return;
if(S_().coins<x.c){tst(Lg('Не хватает монет','Not enough coins'));return;}ok(function(){setCoins(S_().coins-x.c);STAT.ev('spend',{k:'b_'+id,c:x.c});});x.give('c');lavka();};
q=m.querySelectorAll('[data-ba]');for(i=0;i<q.length;i++)q[i].onclick=function(){var id=this.getAttribute('data-ba'),x=BOOST[id];if(!x||ok(function(){return adHold('b_'+id);},false))return;VY.hide();
showRewarded(function(){x.give('ad');lavka();},function(){lavka();},function(){x.give('ad');return x.name;});};
el('v3pCoins').onclick=function(){VY.hide();ok(function(){openShop();});};el('mCancel').onclick=function(){trClose('kiosk');};}
function pvAdd(){var p=P();p.pv=Math.min(15,num(p.pv)+1);sv();ev('pv',{n:p.pv});if(p.pv===15)tst(Lg('🖼 Тема «Плакат» открыта!','🖼 “Poster” theme unlocked!'),3000);}
homeSlots.push({id:'th-kiosk',zone:'thing',order:60,render:function(){if(!on('kiosk'))return null;abChest();
return{at:'kiosk',t:Lg('Лавка Шуры','Shura’s kiosk'),s:abLeft()?Lg('абонемент: ','pass: ')+abLeft():'',badge:'',go:lavka};}});
var VYR_C=150;
function vyrOk(c){var g=G_();return on('vyr')&&g&&g.over&&!c.daily&&c.idx>=10&&c.mode!=='rush'&&!g.v3vyr;}
function vyrGive(how){var g=G_();
if(!g||!g.over||g.v3vyr||!VY.modalOn){coins(VYR_C,'buy');tst(Lg('Выручка: +'+VYR_C+' 💰','Rescue: +'+VYR_C+' 💰'));return;}
g.v3vyr=1;ok(function(){if(W.V3K)V3K.revive(g);});g.stRv=(g.stRv||0)+1;g.hearts=1;g.over=false;
ok(function(){if(W.LVLM)LVLM.revive(g);});ok(function(){renderHearts();});VY.hide();ok(function(){YG.start();});
g.towFree=1;ok(function(){updCoins();});setTimeout(function(){if(G_()===g&&!g.over)ok(function(){hint('late');});},350);
ev('vyr',{h:how,i:g.idx+1});tst('🧰 '+(bank('money.vyr')||Lg('Выручка: +1 жизнь, подсказка и бесплатный эвакуатор','Rescue: +1 life, a hint and a free tow truck')),3000);}
loseSlots.push({id:'v3p-vyr',order:30,fit:4,render:function(c){if(!vyrOk(c))return null;var pay=canBuy('vyr'),cn=S_().coins>=VYR_C;if(!pay&&!cn)return null;
return'<div class="v3pVyr"><button class="btn sec sm noenter" id="v3pVyr">🧰 '+Lg('Выручка: жизнь + подсказка + эвакуатор ›','Rescue: life + hint + tow ›')+'</button></div>';},
mount:function(e,c){var b=e&&e.querySelector('#v3pVyr');if(!b)return;var pay=canBuy('vyr');if(pay)shown(['vyr']);ev('vyrs',{i:c.lv});
b.onclick=function(){var cn=S_().coins>=VYR_C;
e.innerHTML='<div class="v3pVyr">'+(cn?'<button class="btn sm coinb noenter" id="v3pVyrC">🧰 '+VYR_C+' 💰</button>':'')+(pay?'<button class="btn sm accent noenter" id="v3pVyrP">🧰 '+price('vyr')+'</button>':'')+'</div>';
var x=el('v3pVyrC');if(x)x.onclick=function(){if(S_().coins<VYR_C)return;ok(function(){setCoins(S_().coins-VYR_C);STAT.ev('spend',{k:'vyr',c:VYR_C});SND.coin();});vyrGive('c');};
x=el('v3pVyrP');if(x)x.onclick=function(){buy('vyr');};};}});
loseSlots.push({id:'v3p-place',order:5,fit:0,render:function(){return null;},mount:function(){var g=G_();if(!on('place')||!g||!g.v3dead)return;
var r=el('mRev'),l=el('mLife');if(r)r.textContent=Lg('📺 +1 место в кармане за рекламу','📺 +1 pocket space for an ad');
if(l)l.innerHTML='🧺 '+Lg('+1 место','+1 space')+' — '+ok(function(){return PRICE.life;},70)+' 💰';}});
var PAR=[{c:10},{c:15},{c:20},{p:3},{s:10}],PAR_POOR=300;
function parLeft(){var p=P();if(p.pd!==tk()){p.pd=tk();p.pn=0;}return Math.max(0,PAR.length-num(p.pn));}
function parOn(){var S=S_();return on('parcel')&&num(S.levelsDone)>=4&&adOk_();}
function parGive(late){var p=P();parLeft();var k=num(p.pn);if(k>=PAR.length)return late?Lg('посылки на сегодня кончились','no more parcels today'):'';var st=PAR[k],t='';p.pn=k+1;p.pt=num(p.pt)+1;
if(st.c){var n=st.c*(S_().coins<PAR_POOR?2:1);coins(n,'ad');t='+'+n+' 💰';}
else if(st.p){var g=ok(function(){return VYPRT.add(st.p,'gift',true);},0);if(g)t='+'+g+' 🔩';else{coins(15,'ad');t='+15 💰';}}
else if(st.s){if(ok(function(){return W.VYSEASON&&VYSEASON.add?(VYSEASON.add(st.s,'ad'),1):0;},0))t='+'+st.s+' 🎟';else{coins(15,'ad');t='+15 💰';}}
sv();ev('par',{n:p.pn,w:S_().coins<PAR_POOR?1:0});ok(function(){SND.coin();});if(!late)tst('📦 '+Lg('Посылка деда: ','Grandpa’s parcel: ')+t,2600);return t;}
function parcel(){if(!parOn())return;var left=parLeft(),k=PAR.length-left;
var steps=PAR.map(function(s,i){var lb=s.c?(s.c*(S_().coins<PAR_POOR?2:1))+' 💰':s.p?s.p+' 🔩':s.s+' 🎟';return'<span class="v3pSt'+(i<k?' got':i===k?' cur':'')+'">'+(i<k?'✓':lb)+'</span>';}).join('');
var h='<h2>📦 '+Lg('Посылка от деда','Grandpa’s parcel')+'</h2>'+ok(function(){return shura(bank('money.parcel')||Lg('Дед с утра по гаражам собрал. Открывай — только сначала реклама, у нас всё по-честному.','Grandpa put this together in the garages. Open it — an ad first, we’re honest here.'),'happy');},'')+
'<div class="v3pLad">'+steps+'</div><p class="v3pNote">'+(S_().coins<PAR_POOR?Lg('Кошелёк тощий — монеты в посылке ×2.','Your wallet is thin — coins in the parcel ×2.'):Lg('До 5 посылок в день.','Up to 5 parcels a day.'))+'</p>'+
'<div class="row">'+(left?'<button class="btn green noenter" id="v3pPar">📺 '+Lg('Открыть за рекламу','Open for an ad')+'</button>':'<p>'+Lg('На сегодня всё — завтра дед ещё соберёт.','That’s all for today — grandpa will pack more tomorrow.')+'</p>')+'<button class="btn" id="mCancel">'+Lg('Закрыть','Close')+'</button></div>';
VY.modal(h);ok(function(){modalRe=parcel;});ev('pars',{n:k});
var b=el('v3pPar');if(b){ok(function(){STAT.offer('parcel');});b.onclick=function(){if(ok(function(){return adHold('parcel');},false))return;VY.hide();ok(function(){STAT.place('parcel');});
showRewarded(function(){parGive();parcel();},function(){},function(){return parGive(true);});};}
el('mCancel').onclick=function(){trClose('parcel');};}
homeSlots.push({id:'v3p-parcel',zone:'feed',order:45,render:function(){if(!parOn())return null;var l=parLeft();if(!l)return null;
return ok(function(){return UI.tile({ic:'📦',t:Lg('Посылка от деда','Grandpa’s parcel'),s:Lg('📺 за рекламу · осталось ','📺 for an ad · left ')+l+'/5',tag:S_().coins<PAR_POOR?'×2':'',cls:'noenter',go:parcel});},null);}});
function donOk(c){return on('don')&&c&&!c.daily&&(c.mode==='n'||!c.mode)&&c.lv>=30&&c.coins>0&&!P().dn&&c.lv<num(S_().unlocked)+1;}
winSlots.push({id:'v3p-don',zone:'extra',order:80,fit:2,render:function(c){if(!donOk(c))return null;var st=Math.min(30,c.coins);if(S_().coins<st)return null;
return'<div class="v3pDon"><button class="btn sec sm noenter" id="v3pDon">🎲 '+Lg('Двойной или ничего: '+st+' 💰 на следующий двор','Double or nothing: '+st+' 💰 on the next yard')+'</button></div>';},
mount:function(e,c){var b=e&&e.querySelector('#v3pDon');if(!b)return;b.onclick=function(){var st=Math.min(30,c.coins);if(S_().coins<st)return;
ok(function(){setCoins(S_().coins-st);STAT.ev('spend',{k:'don',c:st});});P().dn={i:c.idx+1,s:st};sv();ev('don',{s:st,i:c.lv});
e.innerHTML='<p class="goal">🎲 '+Lg('Ставка принята: пройди следующий двор с первой попытки — получишь ','Bet placed: clear the next yard on the first try to get ')+(st*2)+' 💰</p>';};}});
UI.on('yard-start',function(o){var p=P();if(!p.dn||!on('don'))return;if(o&&!o.daily&&o.idx===p.dn.i)tst('🎲 '+Lg('Ставка: ','Bet: ')+p.dn.s+' 💰 — '+Lg('с первой попытки!','first try!'),2200);});
yardHook.push(function(r){var p=P();if(!p.dn||!r)return;var d=p.dn;
if(r.daily||r.idx!==d.i){if(r.end==='win'||r.end==='lose'){coins(d.s,'don');delete p.dn;sv();}return;}
if(r.end==='win'&&!r.fails){coins(d.s*2,'don');ev('donw',{s:d.s});setTimeout(function(){tst('🎲 '+Lg('Двойной! +','Doubled! +')+(d.s*2)+' 💰',2800);},700);}
else ev('donl',{s:d.s});delete p.dn;sv();});
(function(){var LS='vyezd-v3mint',pct=0;try{pct=+localStorage.getItem(LS)||0;}catch(e){}
var f=W.applyFlags;if(typeof f==='function')W.applyFlags=function(x){try{if(x&&x.v3mint!=null){var n=parseInt(x.v3mint,10);if(isFinite(n)&&n>=0&&n<=100)localStorage.setItem(LS,String(n));}}catch(e){}return f.apply(this,arguments);};
var grp=/[?&]mint=1/.test(location.search)||(pct>0&&ok(function(){return V3.bucket();},100)<pct);
if(!on('int')||!grp)return;
ok(function(){AD_EVERY=2;AD_GAP=120000;AD_FROM=6;});ev('int',{p:pct});
var ban=0;function bOk(){return ok(function(){return PLAT==='vk'&&!OK&&VK&&!PAY.own('no_ads');},false);}
V3.sub('screen',function(s){if(!bOk())return;if(s==='game'){if(ban){ban=0;ok(function(){vkSend('VKWebAppHideBannerAd');});}return;}
if(!ban&&(s==='home'||s==='map')){ban=1;ok(function(){vkSend('VKWebAppShowBannerAd',{banner_location:'bottom'}).then(function(){ev('ban',{r:'ok'});},function(){ban=0;});});}},'money.int');})();
(function(){if(!on('tr'))return;
var TR_GAP=180000,TR_SES=180000,TR_MAX=6,t0=Date.now(),n=0,prev='',pend=0;
if(/[?&]trtest=1/.test(location.search)&&ok(function(){return AD_LOCAL;},false))TR_SES=0;
var OUT={garage:1,myyard:1,garazhi:1,tolik:1,album:1,avtodrom:1,shop:1,daily:1,chest:1,gift:1,fest:1,season:1,league:1,quarter:1,mail:1,orders:1,career:1,kiosk:1,camera:1,parcel:1};
function out(sn){return!!OUT[sn]||/^mg_|^q_|^v3/.test(sn);}
function can(){return ok(function(){var S=S_();
return!W.__demo&&!PAY.own('no_ads')&&!inYard()&&!G_()&&!VY.modalOn&&!adBusy&&!PAY.busy&&!D.hidden&&n<TR_MAX&&
Date.now()-t0>=TR_SES&&Date.now()-lastAdT>=TR_GAP&&(S.unlocked||1)>AD_FROM&&num(S.levelsDone)>AD_FROM&&!(PLAT==='vk'&&!VK&&VK_REAL);},false);}
function why(){return ok(function(){return PAY.own('no_ads')?'na':Date.now()-lastAdT<TR_GAP?'gap':Date.now()-t0<TR_SES?'ses':num(S_().levelsDone)<=AD_FROM?'new':n>=TR_MAX?'max':'busy';},'?');}
function go(w){if(pend)return;if(!can()){if(Date.now()-lastAdT>=TR_GAP)ev('tr',{w:w,r:'skip',c:why()});return;}
if(!ok(function(){return intPre();},true)){ev('tr',{w:w,r:'none',c:'pre'});return;}
pend=1;tst(Lg('Реклама через секунду…','Ad in a second…'),1200);
setTimeout(function(){pend=0;if(!can()){ev('tr',{w:w,r:'skip',c:'late'});return;}n++;ev('tr',{w:w,r:'show',n:n});ok(function(){showInterstitial(function(){});});},1000);}
function wrap(){ok(function(){if(!W.STAT&&typeof STAT==='undefined')return;var st=STAT,f=st.screen;if(typeof f!=='function'||f.__v3tr)return;
st.screen=function(sn){var r=f.apply(this,arguments);try{sn=String(sn||'');if(sn!==prev){var was=prev;prev=sn;if(out(was)&&(sn==='home'||sn==='map'))setTimeout(function(){go(was);},400);}}catch(e){}return r;};st.screen.__v3tr=1;});}
wrap();V3.sub('boot',wrap,'money.tr');
W.V3P_tr=go;})();
function trClose(w){VY.hide();ok(function(){if(W.V3P_tr)setTimeout(function(){V3P_tr(w);},400);});}
function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):null;}
function link(hash){return ok(function(){if(PLAT==='vk'&&!OK){var id=qp('vk_app_id');return id?'https://vk.com/app'+id+'#'+hash:'';}if(OK)return OK_LINK?OK_LINK+'#'+hash:'';return'';},'');}
function sendLink(text,hash,k){var u=link(hash),full=text+(u?'\n'+u:'');ev('sh',{w:k,p:plat()});
ok(function(){
if(OK&&VK){vkSend('VKWebAppShowInviteBox',{message:text.slice(0,120)}).then(function(){ev('sho',{w:k});},function(){copy(full);});return;}
if(PLAT==='vk'&&VK&&u){vkSend('VKWebAppShare',{link:u}).then(function(){ev('sho',{w:k});},function(){copy(full);});return;}
copy(full);});}
function copy(t){ok(function(){if(PLAT==='vk'&&VK){vkSend('VKWebAppCopyText',{text:t}).then(function(){tst(Lg('Скопировано — отправь соседу','Copied — send it to a neighbour'));},function(){});return;}
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){tst(Lg('Скопировано — отправь соседу','Copied — send it to a neighbour'));},function(){});});}
function shareOk(){return ok(function(){return PLAT==='vk'&&(!OK||!!OK_LINK);},false)||/[?&]v3share=1/.test(location.search);}
winSlots.push({id:'v3p-inv',zone:'extra',order:70,fit:1,render:function(c){if(!on('invite')||!shareOk()||!c||c.daily||c.mode&&c.mode!=='n'||c.lv<6)return null;
if(!(c.clean||c.stars>=3||c.lv%5===0))return null;
return'<button class="btn sec sm noenter" id="v3pInv">📨 '+Lg('Позвать соседа: вытащишь?','Challenge a neighbour')+'</button>';},
mount:function(e,c){var b=e&&e.querySelector('#v3pInv');if(!b)return;b.onclick=function(){var cr=ok(function(){return G_().crashes;},0)||0;
var t=Lg('Двор '+c.lv+': '+c.moves+' '+ok(function(){return pl(c.moves,'ход','хода','ходов','move','moves');},'ходов')+(cr?', аварий: '+cr:', без аварий')+'. Вытащишь лучше?',
'Yard '+c.lv+': '+c.moves+' moves'+(cr?', crashes: '+cr:', no crashes')+'. Can you do better?');
sendLink(t,'y='+c.lv+'&m='+c.moves+'&c='+cr+'&r='+P().rc,'y');};}});
loseSlots.push({id:'v3p-help',order:40,fit:1,render:function(c){if(!on('help')||!shareOk()||!c||c.daily||c.lv<5||(c.fails|0)<1)return null;
return'<button class="btn sec sm noenter" id="v3pHelp">🙋 '+Lg('Спросить у соседа','Ask a neighbour')+'</button>';},
mount:function(e,c){var b=e&&e.querySelector('#v3pHelp');if(!b)return;b.onclick=function(){
sendLink(Lg('Застрял во дворе '+c.lv+'. Сосед, выручай — покажи, кто первым выезжает!','Stuck in yard '+c.lv+'. Neighbour, help — show me who drives out first!'),'help='+c.lv+'&r='+P().rc,'help');};}});
ok(function(){var f=W.startExit;if(typeof f!=='function')return;W.startExit=function(v){try{var g=G_();if(g&&v&&!g.over){if(!g.v3pq)g.v3pq=[];if(g.v3pq.length<12&&g.v3pq.indexOf(v.id)<0)g.v3pq.push(v.id);}}catch(e){}return f.apply(this,arguments);};});
var HS=null;
function inHash(){var h='';try{h=String(location.hash||'').replace(/^#/,'');}catch(e){}if(!h){var m=qp('hash');if(m)h=m.replace(/^#/,'');}
var o={},a=h.split('&');for(var i=0;i<a.length;i++){var kv=a[i].split('=');if(kv[0])o[kv[0]]=kv[1]||'';}return o;}
HS=inHash();
if(HS.r&&/^[a-z0-9]{4,8}$/.test(HS.r))V3.sub('boot',function(){var p=P();if(!p.rb&&p.rc!==HS.r&&num(S_().levelsDone)<3){p.rb=HS.r;sv();ev('rin',{w:HS.help!=null?'help':HS.s!=null?'s':'y'});}},'money.ref');
var helpIdx=-1;
function wait(fn,n){n=n||0;var busy=ok(function(){return!!G_()||VY.modalOn||UI.cur!=='home';},true);if(busy){if(n<80)setTimeout(function(){wait(fn,n+1);},1500);return;}fn();}
if(HS.help!=null&&/^\d+$/.test(HS.help))V3.sub('boot',function(){if(!on('help'))return;var lv=+HS.help;wait(function(){var S=S_();
if(num(S.levelsDone)<1){ev('hlp',{r:'new'});return;}if(lv>num(S.unlocked)){tst(Lg('Сосед застрял во дворе '+lv+' — у тебя он ещё закрыт. Дойдёшь — выручишь!','Your neighbour is stuck in yard '+lv+' — you haven’t opened it yet.'),4000);return;}
helpIdx=lv-1;ev('hlp',{r:'go',i:lv});tst(Lg('🙋 Сосед застрял во дворе '+lv+'. Пройди — и отправь ему подсказку!','🙋 A neighbour is stuck in yard '+lv+'. Clear it and send a hint!'),3500);VY.start(lv-1,false);});},'money.help');
winSlots.push({id:'v3p-hlpS',zone:'goal',order:4,fit:0,render:function(c){var g=G_();if(!on('help')||!c||c.daily||c.idx!==helpIdx||!g||!g.v3pq||!g.v3pq.length)return null;
return'<button class="btn accent sm noenter" id="v3pHlpS">📨 '+Lg('Отправить подсказку соседу','Send the hint to your neighbour')+'</button>';},
mount:function(e,c){var b=e&&e.querySelector('#v3pHlpS');if(!b)return;var q=(G_().v3pq||[]).slice(0,3);b.onclick=function(){
sendLink(Lg('Двор '+c.lv+' — вот с чего начинать. Жми по ссылке, подсвечу!','Yard '+c.lv+' — here’s where to start. Tap the link, I’ll highlight it!'),'s='+c.lv+'.'+q.join('.'),'s');
var p=P();p.sl=num(p.sl)+1;sv();helpIdx=-1;ev('soul',{n:p.sl});
tst(p.sl===1?Lg('💛 Значок «Душа двора» — ты выручил соседа!','💛 “Heart of the yard” badge — you helped a neighbour!'):Lg('💛 Душа двора: выручил соседей — ','💛 Heart of the yard: neighbours helped — ')+p.sl,3200);};}});
if(HS.s&&/^\d+(\.\d+){1,5}$/.test(HS.s))V3.sub('boot',function(){if(!on('help'))return;var a=HS.s.split('.').map(Number),lv=a.shift();P().sh={i:lv-1,q:a};sv();ev('sin',{i:lv});
wait(function(){if(lv<=num(S_().unlocked))VY.start(lv-1,false);});},'money.help');
UI.on('yard-start',function(o){var p=P();if(!on('help')||!p.sh||!o||o.daily||o.idx!==p.sh.i)return;var q=p.sh.q.slice();delete p.sh;sv();
setTimeout(function(){var g=G_();if(!g||g.over)return;var ids=g.vs.map(function(v){return v.id;});q=q.filter(function(id){return ids.indexOf(id)>=0;});if(!q.length)return;
g.hint=q[0];g.hintT=6;g.hintQ=q.slice(1);tst('🙋 '+Lg('Сосед подсказал: начни с подсвеченной!','Your neighbour’s hint: start with the highlighted one!'),3000);ev('sgo',{n:q.length});},900);});
yardHook.push(function(r){var p=P();if(!on('ref')||!p.rb||p.rd||!r||r.end!=='win')return;if(num(S_().levelsDone)>=5){p.rd=1;sv();ev('ref',{c:p.rb});ok(function(){V3.emit('money:ref',p.rb);});}});
yardHook.push(function(r){if(!r||r.daily||r.end!=='win')return;var st=P().st;st.n=num(st.n)+1;st.cr+=num(r.crashes);st.s+=Math.min(600,num(r.sec));st.h+=num(r.hint)+num(r.tow);if(st.n>400){st.n/=2;st.cr/=2;st.s/=2;st.h/=2;}});
function carType(){var st=P().st,n=Math.max(1,st.n),cr=st.cr/n,s=st.s/n,h=st.h/n,T=ok(function(){return V3T.all('car_type');},[]);if(!T.length)return null;
var fast=s<45?0:s<90?1:2,care=cr<.3?0:cr<1?1:2,i=(fast*3+care+(h>.5?9:0))%T.length;var o=T[i];if(!P().ct||P().ct!==o.id){P().ct=o.id;sv();ok(function(){V3.emit('money:cartype',o.id);});}return o;}
function wrap(cx,t,x,y,w,lh,max){var words=String(t).split(' '),line='',n=0;for(var i=0;i<words.length;i++){var tt=line?line+' '+words[i]:words[i];
if(cx.measureText(tt).width>w&&line){cx.fillText(line,x,y);y+=lh;line=words[i];if(++n>=max)return y;}else line=tt;}if(line){cx.fillText(line,x,y);y+=lh;}return y;}
function card(o){var c=D.createElement('canvas');c.width=720;c.height=900;var x=c.getContext('2d');if(!x)return'';
x.fillStyle=o.bg||'#fbf3df';x.fillRect(0,0,720,900);x.strokeStyle='#8a6a4a';x.lineWidth=10;x.strokeRect(20,20,680,860);x.lineWidth=2;x.strokeRect(36,36,648,828);
x.fillStyle='#3b2a1a';x.textAlign='center';x.font='bold 46px Georgia,serif';var y=wrap(x,o.head||'',360,120,600,54,2);
if(o.big){x.font='120px sans-serif';x.fillText(o.big,360,y+110);y+=170;}
x.font='32px Georgia,serif';x.textAlign='left';(o.lines||[]).forEach(function(t){y=wrap(x,t,70,y+24,580,42,5);});
if(o.sign){x.font='italic 30px Georgia,serif';x.textAlign='right';x.fillText(o.sign,650,800);}
if(o.stamp){x.save();x.translate(170,760);x.rotate(-.25);x.strokeStyle='rgba(40,70,170,.8)';x.lineWidth=6;x.beginPath();x.arc(0,0,80,0,7);x.stroke();x.lineWidth=2;x.beginPath();x.arc(0,0,64,0,7);x.stroke();
x.fillStyle='rgba(40,70,170,.85)';x.textAlign='center';x.font='bold 22px sans-serif';x.fillText(Lg('ДВОР','YARD'),0,-8);x.font='bold 18px sans-serif';x.fillText(Lg('НА УЧЁТЕ','REGISTERED'),0,18);x.restore();}
x.fillStyle='#8a6a4a';x.font='24px sans-serif';x.textAlign='center';x.fillText(Lg('«Выезд со двора»','“Yard Escape”'),360,860);
try{return c.toDataURL('image/jpeg',.86);}catch(e){return'';}}
function nm(){return ok(function(){var S=S_();return S.name||S.nick||'';},'')||Lg('нашему водителю','our driver');}
function dt(){var d=new Date(now());return('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+d.getFullYear();}
function doc(kind,o){var x=ok(function(){return V3T.docMake(kind,o);},null);return x&&x.head?{head:x.head,lines:x.lines||[],sign:x.sign,stamp:1}:null;}
var FIRST=[['🚗','Копейка','Lada 2101'],['🚙','Москвич','Moskvich'],['🚐','Запорожец','Zaporozhets'],['🛻','Нива','Niva'],['🚘','Девятка','Lada Samara'],['🚖','Волга','Volga'],['🏎','Иномарка','A foreign car'],['🚲','Не было — велосипед','None — a bicycle']];
function cards(){var S=S_(),p=P(),lv=num(S.levelsDone),o=[],ctx={name:nm(),date:dt(),lv:Math.max(1,num(S.unlocked)-1),n:lv,car:'',days:ok(function(){return V3.day();},1)};
o.push({id:'yard',t:Lg('Мой двор','My yard'),f:function(){return{head:Lg('Мой двор','My yard'),big:'🏘',lines:[Lg('Дворов пройдено: ','Yards cleared: ')+lv,Lg('Звёзд: ','Stars: ')+ok(function(){var k=0;for(var i in S.stars)k+=num(S.stars[i]);return k;},0),Lg('Машин в гараже: ','Cars in garage: ')+ok(function(){return(S.garage||[]).length;},1)],sign:dt()};}});
var pr=ok(function(){return V3T.protoLine({lv:ctx.lv,name:ctx.name});},null);
if(pr&&pr.t)o.push({id:'proto',t:Lg('Протокол аварии','Crash report'),f:function(){return{head:Lg('Протокол','Report'),lines:[pr.t],sign:Lg('Свидетель — баба Шура','Witness: Granny Shura'),stamp:1};}});
o.push({id:'first',t:Lg('Моя первая машина','My first car'),f:function(){if(!p.fc)return null;var f=FIRST[num(p.fc)-1]||FIRST[0];return{head:Lg('Моя первая машина','My first car'),big:f[0],lines:[en()?f[2]:f[1],Lg('А какая была у тебя?','And what was yours?')],sign:dt()};},ask:1});
if(lv>=10){var h=doc('harakter',ctx);if(h)o.push({id:'harakter',t:Lg('Характеристика от Шуры','Shura’s reference'),f:function(){p.hm=Math.floor(dnum()/30);sv();return h;}});}
if(lv>=5){var s=doc('spravka',ctx);if(s)o.push({id:'spravka',t:Lg('Справка «Водитель 1-го класса двора»','Certificate: first-class yard driver'),f:function(){return s;}});}
var ps=doc('propusk',ctx);if(ps)o.push({id:'propusk',t:Lg('Пропуск во двор','Yard pass'),f:function(){return ps;},inv:1});
if(lv>=30){var ct=carType();if(ct)o.push({id:'ctype',t:Lg('Какая ты машина','What car are you'),f:function(){return{head:ct.t,lines:[ct.s,ct.w],sign:Lg('Баба Шура, наблюдала лично','Granny Shura, observed in person'),stamp:1};}});}
if(W.V3P&&typeof V3P.clip==='function')o.push({id:'clip',t:Lg('5 секунд счастья','5 seconds of joy'),f:V3P.clip});
return o;}
function camera(){if(!on('camera'))return;var o=cards(),h='<h2>📷 '+Lg('Фотоаппарат','Camera')+'</h2><p>'+Lg('Карточки на память — покажи соседям.','Keepsake cards — show the neighbours.')+'</p><div class="v3pCam">';
o.forEach(function(c){h+='<button class="btn sec noenter" data-cd="'+c.id+'">'+esc(c.t)+'</button>';});
h+='</div><div class="row"><button class="btn" id="mCancel">'+Lg('Закрыть','Close')+'</button></div>';VY.modal(h);ev('cam',{n:o.length});
var q=D.querySelectorAll('[data-cd]');for(var i=0;i<q.length;i++)q[i].onclick=function(){var id=this.getAttribute('data-cd');for(var j=0;j<o.length;j++)if(o[j].id===id)return show(o[j]);};
el('mCancel').onclick=function(){trClose('camera');};}
function askFirst(c){var h='<h2>🚗 '+Lg('Какая была твоя первая машина?','What was your first car?')+'</h2><div class="v3pCam">';
FIRST.forEach(function(f,i){h+='<button class="btn sec noenter" data-fc="'+(i+1)+'">'+f[0]+' '+esc(en()?f[2]:f[1])+'</button>';});VY.modal(h+'</div>');
var q=D.querySelectorAll('[data-fc]');for(var i=0;i<q.length;i++)q[i].onclick=function(){P().fc=+this.getAttribute('data-fc');sv();ev('fc',{v:P().fc});show(c);};}
function show(c){if(c.ask&&!P().fc)return askFirst(c);var d=c.f();if(!d)return camera();var img=d.img||card(d);ev('card',{id:c.id});csAdd(c.id);
var sh=storyOk()||okPostOk();
VY.modal('<div class="v3pCard"><img src="'+img+'" alt=""></div><div class="row">'+(sh?'<button class="btn green noenter" id="v3pSh">'+(OKv()?Lg('📤 В ленту ОК','📤 Post to OK'):Lg('📤 В историю','📤 To my story'))+(storyOk()&&weekFree()?' · +20 💰':'')+'</button>':'')+
(c.inv&&shareOk()?'<button class="btn sec noenter" id="v3pPs">📨 '+Lg('Отправить пропуск','Send the pass')+'</button>':'')+'<button class="btn" id="mCancel">'+Lg('Назад','Back')+'</button></div>');
var b=el('v3pSh');if(b)b.onclick=function(){post(img,c.id);};b=el('v3pPs');if(b)b.onclick=function(){var lv=Math.max(1,num(S_().unlocked)-1);
sendLink(Lg('Пропуск во двор '+lv+'. Предъявителю — проехать!','A pass to yard '+lv+'. Bearer may drive through!'),'y='+lv+'&r='+P().rc,'pass');};
el('mCancel').onclick=camera;}
function OKv(){return ok(function(){return OK;},false);}
function storyOk(){return ok(function(){return PLAT==='vk'&&!OK&&!!VK;},false);}
function okPostOk(){return ok(function(){return OK&&!!VK;},false);}
function wk(){return Math.floor((dnum()+3)/7);}
function weekFree(){return num(P().sw)<wk();}
function post(img,id){ok(function(){
if(storyOk()){var u=link('f_'+id);vkSend('VKWebAppShowStoryBox',{background_type:'image',blob:img,attachment:u?{text:'go_to',type:'url',url:u}:undefined},60000).then(function(r){ev('story',{id:id,r:'ok'});
if(weekFree()){P().sw=wk();sv();coins(20,'story');tst(Lg('История опубликована: +20 💰 (раз в неделю)','Story posted: +20 💰 (once a week)'),3000);}},function(){ev('story',{id:id,r:'no'});});return;}
if(okPostOk()){vkSend('VKWebAppShowWallPostBox',{message:Lg('Открытка из «Выезда со двора»','A card from “Yard Escape”')+(OK_LINK?'\n'+OK_LINK+'#f_'+id:'')},60000).then(function(){ev('okpost',{id:id,r:'ok'});},function(){ev('okpost',{id:id,r:'no'});});}});}
homeSlots.push({id:'th-camera',zone:'thing',order:60,render:function(){if(!on('camera')||num(S_().levelsDone)<3)return null;
return{at:'camera',t:Lg('Фотоаппарат','Camera'),s:Lg('карточки на память','keepsake cards'),badge:'',go:camera};}});
var CHIP_WK=3;
function qWeek(){return ok(function(){var q=W.V3Q&&V3Q.q&&V3Q.q();return q&&q.wk?String(q.wk):'';},'')||String(Math.floor((dnum()+3)/7));}
function qb(){var p=P(),w=qWeek();if(!p.qb||p.qb.w!==w)p.qb={w:w,n:0,q:0};return p.qb;}
function qLive(){return ok(function(){return!!(W.V3QS&&V3QS.live&&V3QS.live());},false);}
function chipFlush(){if(!on('chip'))return 0;var b=qb();if(!b.q||!qLive())return 0;var k=b.q;
for(var i=0;i<k;i++)ok(function(){V3QS.push('v',{k:'chip',o:0,b:1});});b.n+=k;b.q=0;sv();
ok(function(){V3.emit('quarter:chip',{by:'buy',n:k});});
tst('🚧 '+(bank('money.chip')||Lg('Шура записала: и от тебя вклад в шлагбаум. Всем подъездом скинулись!','Shura noted it: your share for the barrier too. The whole block chipped in!')),3000);return k;}
function chipBuy(id){if(!on('chip')||!id)return;var b=qb();if(b.n+b.q>=CHIP_WK)return;b.q++;sv();ev('chip',{by:'buy',i:String(id).slice(0,12),l:qLive()?1:0});setTimeout(chipFlush,1800);}
ok(function(){var pa=W.payAfter;if(typeof pa!=='function'||pa.__v3p)return;W.payAfter=function(id){var r=pa.apply(this,arguments);if(id)ok(function(){chipBuy(id);});return r;};W.payAfter.__v3p=1;});
V3.sub('quarter:chip',function(o){if(o&&o.by==='yard')ev('chip',{by:'yard'});},'money.chip');
V3.sub('screen',function(){if(P().qb&&P().qb.q)setTimeout(chipFlush,500);},'money.chip');
var TRK=[{w:5,p:3},{w:10,h:1},{w:20,p:3},{w:30,s:30},{w:45,p:5,end:1}];
function tkSt(n){var p=P();if(!p.tk||p.tk.s!==n)p.tk={s:n,w:0,g:0};return p.tk;}
function tkGive(r){var t='';
if(r.p){var g=ok(function(){return VYPRT.add(r.p,'gift',true);},0);t='+'+(g||r.p)+' 🔩';}
else if(r.h){var S=S_();if(S&&!S.freeHint){S.freeHint=true;t=Lg('бесплатная подсказка 💡','a free hint 💡');}else{ok(function(){VYPRT.add(2,'gift',true);});t='+2 🔩';}}
else if(r.s){if(ok(function(){return W.VYSEASON&&VYSEASON.add?(VYSEASON.add(r.s,'ab'),1):0;},0))t='+'+r.s+' 🎟';else{ok(function(){VYPRT.add(2,'gift',true);});t='+2 🔩';}}
return t;}
V3.sub('season:track',function(o){if(!on('track')||!o||abLeft()<1)return;var t=tkSt(num(o.n)),r=TRK[t.g];t.w++;
if(r&&t.w>=r.w){t.g++;var got=tkGive(r);ev('trk',{s:t.s,g:t.g,w:t.w});
if(r.end)ok(function(){if(W.V3UX&&V3UX.note)V3UX.note('ab',Lg('дорожка абонемента','pass track'));});
setTimeout(function(){tst('🎫 '+Lg('Дорожка абонемента, ступень ','Pass track, step ')+t.g+'/'+TRK.length+': '+got,3000);},1500);}
sv();},'money.track');
function tkRow(){if(!on('track'))return'';var d=ok(function(){return W.V3C&&V3C.today?V3C.today():null;},null);if(!d)return'';var t=tkSt(num(d.s)),nx=TRK[t.g];
var steps=TRK.map(function(r,i){return'<span class="v3pSt'+(i<t.g?' got':i===t.g&&abLeft()?' cur':'')+'">'+(i<t.g?'✓':r.p?r.p+' 🔩':r.h?'💡':'🎟')+'</span>';}).join('');
return'<div class="v3pTk"><b>🎫 '+Lg('Вторая дорожка сезона','Second season track')+'</b><div class="v3pLad">'+steps+'</div><p class="v3pNote">'+
(abLeft()?(nx?Lg('Побед в сезоне с абонементом: ','Pass wins this season: ')+t.w+' · '+Lg('до ступени ','next step at ')+nx.w:Lg('Дорожка сезона пройдена!','Season track complete!')):
Lg('Идёт, пока действует абонемент: каждая победа — штамп.','Runs while your pass is active: every win is a stamp.'))+'</p></div>';}
function fkN(){return Math.max(num(P().fk),ok(function(){return num(S_().v3u&&S_().v3u.fk);},0));}
var fkSeq=0;
function fkSvg(){return ok(function(){if(!W.VYCARS||!VYCARS.svg)return'';var parts=[['zapor','#e07a9a'],['volga','#2b2f36'],['niva','#4f8a3c']],vb=null,h='',id='v3fk'+(++fkSeq);
for(var i=0;i<3;i++){var s=String(VYCARS.svg(parts[i][0],{view:'side',state:'new',color:parts[i][1]})||'');var m=/viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(s);if(!m)return'';if(!vb)vb=[+m[1],+m[2]];
var w=vb[0]/3;
h+='<clipPath id="'+id+i+'"><rect x="'+(i===0?0:i===1?w:2*w)+'" y="0" width="'+(w+1)+'" height="'+vb[1]+'"/></clipPath><g clip-path="url(#'+id+i+')">'+s.replace(/<svg[^>]*>/,'<svg x="0" y="0" width="'+vb[0]+'" height="'+vb[1]+'" viewBox="0 0 '+vb[0]+' '+vb[1]+'">')+'</g>';}
var seam='';for(var j=1;j<3;j++){var X=vb[0]/3*j;seam+='<line x1="'+X+'" y1="'+vb[1]*.18+'" x2="'+X+'" y2="'+vb[1]*.78+'" stroke="#c9ccd1" stroke-width="3" stroke-dasharray="5 4"/>'+
'<circle cx="'+X+'" cy="'+vb[1]*.3+'" r="3.2" fill="#8a8f96"/><circle cx="'+X+'" cy="'+vb[1]*.62+'" r="3.2" fill="#8a8f96"/>';}
return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+vb[0]+' '+vb[1]+'" class="albsvg v3pFk"><defs></defs>'+h+seam+'</svg>';},'')||'<span style="font-size:40px">🧟</span>';}
function fkCard(){var n=fkN();if(!n||!on('frank'))return'';
return'<h3 class="albser">🧟 '+Lg('Особые','Special')+' <small>1</small></h3><div class="albgrid"><button class="albc r2 own v3pFkC" id="v3pFk"><i class="albrs"></i><span class="albpic">'+fkSvg()+'</span><b>'+
Lg('Франкенштейн','Frankenstein')+'</b><small>'+Lg('Толик собрал','Built by Tolik')+(n>1?' ×'+n:'')+'</small></button></div>';}
function fkInfo(){var n=fkN();VY.modal('<h2>🧟 '+Lg('Франкенштейн Толика','Tolik’s Frankenstein')+'</h2><div class="albbig">'+fkSvg()+'</div><p>'+
Lg('Перед от «Запорожца», середина от «Волги», корма от «Нивы». Толик собрал из деталей после твоих аварий — по 12 штук на одно чудище.','Front of a Zaporozhets, middle of a Volga, rear of a Niva. Tolik built it from parts left after your crashes — 12 per monster.')+'</p><p><b>'+
Lg('Собрано: ','Built: ')+n+'</b></p><div class="row"><button class="btn" id="mCancel">'+Lg('Закрыть','Close')+'</button></div>');ev('fk',{n:n});
var b=el('mCancel');if(b)b.onclick=function(){VY.hide();};}
ok(function(){if(!W.ALB)return;if(!ALB.more)ALB.more=[];ALB.more.push({id:'v3p-frank',html:fkCard,bind:function(root){var b=root.querySelector('#v3pFk');if(b)b.onclick=function(){fkInfo();};}});});
V3.sub('ux:frank',function(n){var p=P();p.fk=Math.max(num(p.fk),num(n)||1);sv();ev('fkc',{n:p.fk});
setTimeout(function(){tst('📒 '+Lg('Франкенштейн Толика — в Автоальбоме, в «Особых»!','Tolik’s Frankenstein is in the car album, under “Special”!'),3200);},2600);},'money.frank');
yardHook.push(function(r){if(!r||r.end!=='win'||r.daily)return;var g=G_();if(g&&g.v3k&&g.v3k.kind==='pocket'){var p=P();p.pk=num(p.pk)+1;sv();}});
function csAdd(id){var p=P();if(!p.cs)p.cs=[];if(p.cs.indexOf(id)<0&&p.cs.length<16){p.cs.push(id);sv();}}
W.V3P={open:lavka,cam:camera,card:card,link:link,parcel:parcel,boost:function(id,o){if(id&&o)BOOST[id]=o;},abLeft:abLeft,
get state(){return P();},take:function(k){var p=P();if(k==='wc'&&p.wc){p.wc=0;sv();return 1;}return 0;}};
W.V3P.clip=null;
ok(function(){var s=D.createElement('style');s.textContent='.v3pRow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0}.v3pRow span{flex:1;text-align:left}'+
'.v3pTh{margin:10px 0;display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.v3pTh b{width:100%}.v3pLad{display:flex;gap:6px;justify-content:center;margin:10px 0}'+
'.v3pSt{min-width:52px;padding:8px 4px;border-radius:10px;background:#f1ece2;font-weight:700}.v3pSt.got{background:#cdeccd}.v3pSt.cur{background:#ffe08a;box-shadow:0 0 0 2px #e0a800}'+
'.v3pNote{font-size:.9em;opacity:.8}.v3pCam{display:flex;flex-direction:column;gap:8px;margin:8px 0}.v3pCard img{width:100%;max-width:360px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.25)}'+
'.v3pTk{margin:10px 0;padding:8px;border-radius:12px;background:#fbf6ea}.v3pTk .v3pLad{flex-wrap:wrap}.v3pFk{display:block;width:100%;height:100%}'+
'.v3pVyr,.v3pDon{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:6px 0}';D.head.appendChild(s);});
})();