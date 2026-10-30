'use strict';
(function(){
if(typeof ZB==='undefined'||typeof S==='undefined'||!window.RS||!RS.sect||RS.sect.shopOn)return;RS.sect.shopOn=1;
var esc=ZB.esc||function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
function tap(){try{SND.tap();}catch(e){}}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function ev(a,o){try{o=o||{};o.a=a;STAT.ev('rs',o);}catch(e){}}
function $(id){return document.getElementById(id);}
var H=document.documentElement;
var LT='home',PEND=null,PREV='';
var LAR={z3kiosk:1,'z3kiosk-sk':1,'z3kiosk-pass':1,uchit:1};
function KI(){return window.Z3KIOSK&&Z3KIOSK.open?Z3KIOSK:null;}
function payK(){var k=KI();return!!(k&&ZB.safe('rs-kpay',function(){return k.payOn();}));}
function shelfOn(){return!!(window.ZBSHOP&&ZBSHOP.has&&ZB.safe('rs-shelf',function(){return ZBSHOP.has();}));}
function tabs(){var L=[];if(typeof window.openShop==='function')L.push(['look','Наряды']);if(KI())L.push(['home','Для дома']);
if(KI()?payK():shelfOn())L.push(['hint','Подсказки']);return L;}
function shop(t){var T=tabs().map(function(x){return x[0];});if(!T.length)return false;
if(!t||T.indexOf(t)<0)t=T.indexOf('home')>=0?'home':T[0];LT=t;ev('shop',{t:t});
if(t==='look'){ZB.safe('rs-look',function(){openShop();});return true;}
if(t==='hint'&&!KI()){ZB.safe('rs-uchit',function(){ZBSHOP.open('rs');});return true;}
PEND={t:t,ts:Date.now()};
if(ZB._scr.z3kiosk)ZB.go('z3kiosk',{from:'rs'});else KI().open('rs');return true;}
function strip(cur){var L=tabs();if(L.length<2)return null;var d=document.createElement('div');d.className='rs-tabs rs-lar';d.setAttribute('role','tablist');
d.innerHTML=L.map(function(x){return'<button type="button" role="tab" class="rs-tab'+(x[0]===cur?' on':'')+'" data-lt="'+x[0]+'">'+x[1]+'</button>';}).join('');
[].forEach.call(d.querySelectorAll('[data-lt]'),function(b){b.onclick=function(){var k=b.getAttribute('data-lt');if(k===cur)return;tap();shop(k);};});return d;}
function putStrip(parent,before,cur){var o=parent.querySelector(':scope>.rs-lar');if(o)o.remove();var d=strip(cur);if(d)parent.insertBefore(d,before);}
function hookLook(){var f=window.openShop;if(typeof f!=='function'||f.rsW)return;
var w=window.openShop=function(){var r=f.apply(this,arguments);ZB.safe('rs-look',function(){var sec=$('shopS'),li=$('shopList');if(!sec||!li)return;LT='look';
var b=sec.querySelector('.hdr .t b'),s=sec.querySelector('.hdr .t small');if(b)b.textContent='Ларёк';if(s)s.textContent='Наряды и блюдца';
var o=sec.querySelector('.rs-lar');if(o)o.remove();var d=strip('look');if(d)sec.insertBefore(d,li);
var zt=li.querySelector('.tabs [data-t=zina]');if(zt&&/Наряды/.test(zt.textContent))zt.textContent='👗 Одежда Зины';});return r;};w.rsW=1;}
function hookKiosk(){var o=ZB._scr.z3kiosk;if(!o||o.rsW||!o.render)return;var r=o.render;o.rsW=1;
o.render=function(el,op){r.call(o,el,op);ZB.safe('rs-kiosk',function(){
if(PEND&&Date.now()-PEND.ts<8000)LT=PEND.t;else if(!LAR[PREV]||LT==='look')LT='home';PEND=null;if(LT==='hint'&&!payK())LT='home';
var k=el.querySelector('.z3k');if(!k)return;k.setAttribute('data-rst',LT);
var b=k.querySelector('.z3k-tt b'),s=k.querySelector('.z3k-tt small');if(b)b.textContent='Ларёк';if(s)s.textContent=LT==='hint'?'подсказки, подписка, узелок':'для дома и двора';
var hd=k.querySelector('.z3k-hd');if(hd)putStrip(k,hd.nextSibling,LT);
if(LT==='home')traty(k);});};}
function hookUchit(){var o=ZB._scr.uchit;if(!o||o.rsW||!o.render)return;var r=o.render;o.rsW=1;
o.render=function(el,op){var from=PREV;r.call(o,el,op);ZB.safe('rs-uchit',function(){var hd=el.querySelector('.hdr');if(!hd)return;
var b=hd.querySelector('.t b'),s=hd.querySelector('.t small');if(b)b.textContent='Ларёк';if(s)s.textContent='Вся полка: монеты, без рекламы';
putStrip(el,hd.nextSibling,'hint');
var bk=$('ztBack');if(bk&&KI()&&LAR[from])bk.onclick=function(){tap();shop('hint');};});};}
function traty(k){var o=k.querySelector('.rs-kv');if(o)o.remove();var X=window.Z4Y,D=X&&X.dbg,Z=window.Z4;
if(!D||!Z||!Z.open||!ZB.safe('rs-kv',function(){return Z.open('z4y');}))return;
var n=ZB.safe('rs-kvn',function(){return D.ownN();})||0;if(n<1&&(+S.lv||0)<60)return;
var id=ZB.safe('rs-kvo',function(){return D.offer();}),it=id&&D.IT&&D.IT[id],p=id?ZB.safe('rs-kvp',function(){return D.price(id);}):0;
var d=document.createElement('div');d.className='rs-row rs-kv';
d.innerHTML='<div class="rs-rh"><span class="rs-ri">🏠</span><span class="rs-rt"><b>Квартира Зины</b><small>вещей: '+n+' из '+((X.IDS||[]).length||17)+' · для красоты, на подсказки не влияет</small></span></div>'+
'<div class="rs-rk"><button type="button" class="btn ghost rs-k" data-kv="room">Заглянуть</button>'+(it&&p?'<button type="button" class="btn rs-k" data-kv="buy">'+esc(it.n)+' · '+p+' <span class="coin"></span></button>':'')+'</div>';
var sc=k.querySelector('.z3k-sc')||k;sc.appendChild(d);
[].forEach.call(d.querySelectorAll('[data-kv]'),function(b){b.onclick=function(){tap();var a=b.getAttribute('data-kv');ev('kv',{k:a});
if(a==='buy'&&id)ZB.safe('rs-kvb',function(){D.buyOpen(id);});else ZB.safe('rs-kvr',function(){D.room('');});};});}
var SHELF=[['al','Альбомы',['j','p','f']],['pc','Открытки',['c','rs-zc']],['nag','Награды и рукоделие',['r','v','rs-mg']],['nah','Находки',[]]];
var KBACK=0;
function magN(){var D=window.ZB2ZAP_DATA,m=(S.z2z&&S.z2z.mg)||'';if(!D||!D.MAG)return null;var n=0;for(var i=0;i<m.length;i++)if(m.charAt(i)==='1')n++;return[n,D.MAG.length];}
function magOpen(){var D=window.ZB2ZAP_DATA,m=(S.z2z&&S.z2z.mg)||'';if(!D||!D.MAG||typeof modal!=='function')return;var mn=magN();ev('mag',{n:mn[0]});
modal('<div class="rs-mag"><h2>🧲 Магнитики на холодильнике</h2><p>'+(mn[0]?'Собрано '+mn[0]+' из '+mn[1]+'. Новый — за связку записок.':'Пока ни одного. Первый — за связку записок.')+'</p><div class="rs-magg">'+
D.MAG.map(function(x,i){var on=m.charAt(i)==='1';return'<span class="'+(on?'on':'')+'" title="'+(on?esc(x[1]):'')+'"><i>'+(on?x[0]:'?')+'</i><small>'+(on?esc(x[1]):'')+'</small></span>';}).join('')+
'</div><div class="btns"><button class="btn green" id="rsMagOk">Хорошо</button></div></div>');
var b=$('rsMagOk');if(b)b.onclick=function(){tap();hideModal();};}
function kBox(s,ic,t,sub,go){var b=document.createElement('button');b.type='button';b.className='z3a-box rs-kx';b.setAttribute('data-s',s);
b.innerHTML='<span class="z3a-knob"></span><span class="z3a-lab"><b>'+ic+' '+esc(t)+'</b><small>'+esc(sub)+'</small></span>';b.onclick=function(){tap();ev('komod',{s:s});go();};return b;}
function komod(el){var b2=el.querySelector('.z3a-body2');if(!b2)return;
if(!b2.querySelector('[data-s="rs-mg"]')){var mn=magN();if(mn)b2.appendChild(kBox('rs-mg','🧲','Магнитики',mn[0]?mn[0]+' из '+mn[1]+' на холодильнике':'первый — за связку записок',magOpen));}
if(!b2.querySelector('[data-s="rs-zc"]')&&ZB._scr.zcards)b2.appendChild(kBox('rs-zc','📮','Открытки глав','виды пройденных глав — родным',function(){KBACK=1;ZB.go('zcards');}));
var sh={};SHELF.forEach(function(x){var d=b2.querySelector('.rs-ksh[data-k="'+x[0]+'"]');
if(!d){d=document.createElement('div');d.className='rs-ksh';d.setAttribute('data-k',x[0]);d.innerHTML='<b class="rs-kst">'+x[1]+'</b><div class="rs-ksg"></div>';b2.appendChild(d);}sh[x[0]]=d;});
[].forEach.call(b2.querySelectorAll('.z3a-box'),function(b){var s=b.getAttribute('data-s')||'';
if(s==='o'){b.style.display='none';return;}
var k='nah';SHELF.forEach(function(x){if(x[2].indexOf(s)>=0)k=x[0];});var g=sh[k].querySelector('.rs-ksg');if(b.parentNode!==g)g.appendChild(b);});
SHELF.forEach(function(x){var d=sh[x[0]];d.style.display=d.querySelector('.z3a-box')?'':'none';b2.appendChild(d);});
if(!el.querySelector('.rs-kline')&&typeof window.openShop==='function'){var dr=el.querySelector('.z3a-dr');if(dr){var l=document.createElement('button');l.type='button';l.className='rs-line rs-kline';
l.innerHTML='<span>👗</span><b>Наряды и блюдца — в Ларьке</b><i>›</i>';l.onclick=function(){tap();shop('look');};dr.parentNode.insertBefore(l,dr.nextSibling);}}
H.classList.add('rs-komod');}
function hookKomod(){var o=ZB._scr.z3album;if(!o||o.rsW||!o.render)return;var r=o.render;o.rsW=1;
o.render=function(el,op){r.call(o,el,op);if(op&&op.s)return;var f=function(){if(ZB.cur==='z3album')ZB.safe('rs-komod',function(){komod(el);});};f();[0,300,1200].forEach(function(t){setTimeout(f,t);});};}
function hookCards(){var o=ZB._scr.zcards;if(!o||o.rsW||!o.render)return;var r=o.render;o.rsW=1;
o.render=function(el,op){var k=KBACK;KBACK=0;r.call(o,el,op);if(!k)return;var b=el.querySelector('[data-zm="back"]');if(b){b.textContent='← Назад';b.onclick=function(){tap();ZB.go('z3album',{});};}};}
function mailOn(){var M=window.ZB2MAIL;return!!(M&&M.go&&M.go.__z3&&ZB._scr.z3mail&&window.Z3&&Z3.day&&ZB.safe('rs-md',function(){return Z3.day()>=4;}));}
function mailCls(){H.classList.toggle('rs-mail1',mailOn());}
function sosOk(){return typeof openSosedki==='function'&&typeof sosOn==='function'&&ZB.safe('rs-sos',function(){return sosOn();});}
function sosCard(){if(!sosOk()||typeof sosTick!=='function'||typeof sosTable!=='function'||typeof SOSN==='undefined')return null;
var o=sosTick();if(!o)return null;var pend=typeof sosPend==='function'&&sosPend(o),tb=sosTable(o,typeof nowMs==='function'?nowMs():Date.now()),pl1=tb.findIndex(function(r){return r.i<0;})+1;
var rows=tb.slice(0,8).map(function(x,j){var me=x.i<0,nb=SOSN[x.i];
return'<div class="rs-sr'+(me?' me':'')+'"><span class="rs-sp">'+(j+1)+'</span><span class="rs-sn">'+(me?'<b>Ты и баба Зина</b>':esc(nb.n))+'</span><span class="rs-ss">'+(!me&&!x.pts?'—':x.pts)+'</span></div>';}).join('');
var d=document.createElement('div');d.className='z3h-card rs-sos';
d.innerHTML='<h3>🏆 Соседки недели</h3><p class="z3h-sm">'+(pend?'Итоги прошлой недели готовы — забери монеты!':'Твоё место — '+pl1+'-е. Буква — очко, итоги в понедельник.')+'</p>'+
'<div class="rs-sl">'+rows+'</div><button type="button" class="btn z3h-go rs-sosall">'+(pend?'Забрать итоги':'Показать всех')+'</button>';
d.querySelector('.rs-sosall').onclick=function(){tap();ev('sos',{p:pend?1:0});openSosedki('bench');};return d;}
function bench(el){var go=el.querySelector('[data-h="sos"]'),old=go&&go.closest('.z3h-card');if(el.querySelector('.rs-sos'))return;
var c=sosCard();if(!c)return;if(old)old.remove();var first=el.querySelector('.z3h-card');if(first)first.parentNode.insertBefore(c,first);
[].forEach.call(el.querySelectorAll('.z3h-card h3'),function(h){if(/Жильцы подъезда/.test(h.textContent))h.textContent=h.textContent.replace('Жильцы подъезда','Общий счёт подъезда · жильцов:').replace(' · жильцов: ·',' · жильцов:');});
var m=el.querySelector('[data-h="more"]');if(m)m.textContent='Все жильцы';}
function hookBench(){var o=ZB._scr.z3bench;if(!o||o.rsW||!o.render)return;var r=o.render;o.rsW=1;
o.render=function(el,op){r.call(o,el,op);var f=function(){if(ZB.cur==='z3bench')ZB.safe('rs-bench',function(){bench(el);});};f();[0,400,1500].forEach(function(t){setTimeout(f,t);});};}
function sosFix(){var mc=$('mcard');if(!mc||!mc.querySelector('.sosm'))return;var h=mc.querySelector('.sosm>h2');if(h&&/Соседки по подъезду/.test(h.textContent))h.textContent='🏆 Соседки недели';
var dv=mc.querySelector('.sosdv');if(dv&&!dv.rsW){dv.rsW=1;dv.innerHTML=dv.innerHTML.replace(/Дивизион\s*/,'Мы сейчас в ');}
var z=$('zuRow');if(z&&!z.rsW){z.rsW=1;var sp=z.querySelector('span');if(sp)sp.innerHTML='👥 <b>Показать всех</b> · живые соседи';}}
function hookSos(){var f=window.openSosedki;if(typeof f!=='function'||f.rsW)return;var w=window.openSosedki=function(){var r=f.apply(this,arguments);ZB.safe('rs-sosfix',sosFix);setTimeout(function(){ZB.safe('rs-sosfix',sosFix);},0);return r;};
for(var k in f)if(Object.prototype.hasOwnProperty.call(f,k))w[k]=f[k];w.rsW=1;}
var O=RS.sect.OPEN;if(O){O.shop=function(o){shop(o&&o.tab);};O.mail=function(){var Y=window.Z3&&Z3.yard,i;for(i=0;Y&&i<Y.length;i++)if(Y[i]&&Y[i].id==='mail'&&Y[i].go){Y[i].go();return;}if(ZB._scr.z3mail)ZB.go('z3mail',{});};
O.write=function(){if(mailOn())ZB.go('z3mail',{pg:'write'});else if(window.ZB2MAIL)ZB2MAIL.go('about');};}
function hookAll(){hookLook();hookKiosk();hookUchit();hookKomod();hookCards();hookBench();hookSos();mailCls();}
hookAll();ZB.on('ready',hookAll);ZB.on('z3late',hookAll);
var go0=ZB.go;ZB.go=function(id){PREV=ZB.cur;ZB.safe('rs-hook2',hookAll);if(id!=='z3album')H.classList.remove('rs-komod');return go0.apply(this,arguments);};
RS.sect.shop=shop;RS.sect.komod=komod;
})();
