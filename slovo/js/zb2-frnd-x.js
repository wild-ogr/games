'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||window.ZB2F)return;
var F=window.ZB2F={on:{gift:ZB2.reg('gift',{t:'Гостинец соседу',who:'FRND'}),word:ZB2.reg('word',{t:'Загадай слово другу',who:'FRND'}),brag:ZB2.reg('brag',{t:'Похвастаться',who:'FRND'})}};
try{F.hs=(/zf[gtwr]_[a-z0-9_]{12,110}/.exec(location.hash+'&'+decodeURIComponent((/[?&]hash=([^&]*)/.exec(location.search)||[0,''])[1]))||[''])[0];}catch(e){F.hs='';}
var E=window.ZBECO||{},C=E.frnd||{};
var N={hb:C.hb||2,gc:C.gc||30,ty:C.ty||20,wc:C.wc||10,take:C.take||3,tyDay:C.tyDay||3,send:C.send||5,wsend:C.wsend||5,wsolve:C.wsolve||5,from:C.from||5};
var VK=typeof PLAT!=='undefined'&&PLAT==='vk',OKP=typeof OK!=='undefined'&&OK,SH=VK&&!OKP;
var REAL=/[?&]vk_app_id=/.test(location.search);
var ON={gift:F.on.gift&&SH,word:F.on.word&&SH,brag:F.on.brag};
var RU='абвгдеёжзийклмнопрстуфхцчшщъыьэюя',NA=RU+'abcdefghijklmnopqrstuvwxyz -';
try{if(window.STATZB&&STATZB.Z2&&!STATZB.Z2.fr)STATZB.Z2.fr=['a','k','e','n','c'];}catch(e){}
function ev(p){try{if(window.STATZB&&STATZB.z2)STATZB.z2('fr',p);else STAT.ev('fr',p);}catch(e){}}
function tap(){try{SND.tap();}catch(e){}}
function $$(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function face(m){try{return zinaSVG(m||'happy');}catch(e){return'👵';}}
function sv(){try{save();}catch(e){}}
function tk(){try{return+todayKey();}catch(e){return 20261012;}}
function pl(n,a,b,c){n=Math.abs(n)%100;var m=n%10;return n>10&&n<20?c:m===1?a:m>=2&&m<=4?b:c;}
function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);try{return m?decodeURIComponent(m[1]):'';}catch(e){return'';}}
function Z(){var z=S.z2f||(S.z2f={}),t=tk();if(z.d!==t){z.d=t;z.gs=0;z.gr=0;z.ty=0;z.ws=0;z.wv=0;}return z;}
function list(k){return String(Z()[k]||'').split(',').filter(Boolean);}
function push(k,v,n){var a=list(k).filter(function(x){return x!==v;});a.push(v);Z()[k]=a.slice(-n).join(',');}
function has(k,v){return list(k).indexOf(v)>=0;}
function h32(s){var h=2166136261,i;s=String(s);for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function b36(n,k){var s=(n>>>0).toString(36);while(s.length<k)s='0'+s;return s.slice(-k);}
function cs(body){return b36(h32('zina-frnd|'+body),3);}
function rid(){var s='',i;for(i=0;i<5;i++)s+=Math.floor(Math.random()*36).toString(36);return s;}
function me(){var z=Z();if(!/^[a-z0-9]{6}$/.test(z.me||'')){var u=qp('vk_user_id');z.me=u?b36(h32('u'+u+'|zina'),6):b36(h32(rid()+Date.now()),6);sv();}return z.me;}
function encN(s){var r='',i,j;s=String(s||'').toLowerCase();for(i=0;i<s.length&&r.length<20;i++){j=NA.indexOf(s[i]);if(j>=0)r+=b36(j,2);}return r;}
function decN(t){var r='',i,j;for(i=0;i+1<t.length;i+=2){j=parseInt(t.substr(i,2),36);if(j>=0&&j<NA.length)r+=NA[j];}r=r.replace(/\s+/g,' ').trim();
return r?r.charAt(0).toUpperCase()+r.slice(1):'';}
function encW(w,id){var r='',i,j;for(i=0;i<w.length;i++){j=RU.indexOf(w[i]);if(j<0)return'';r+=((j+h32(id+i)%33)%33).toString(36);}return r;}
function decW(t,id){var r='',i,j;for(i=0;i<t.length;i++){j=parseInt(t[i],36);if(!(j>=0&&j<33))return'';r+=RU[(j-h32(id+i)%33+33*2)%33];}return r;}
function mk(k,parts){var b='zf'+k+'_'+parts.join('_');return b+'_'+cs(b);}
function parse(h){var p=String(h||'').split('_'),k,o;if(p.length<5||!/^zf[gtwr]$/.test(p[0]))return null;
var c=p.pop();if(cs(p.join('_'))!==c)return null;k=p[0].charAt(2);
if(!/^[a-z0-9]{5}$/.test(p[1])||!/^[a-z0-9]{6}$/.test(p[2]))return null;
o={k:k,id:p[1],fp:p[2],nm:decN(p[3]||'')||'Сосед'};
if(k==='w'){o.w=decW(p[4]||'',p[1]);o.hint=parseInt(p[5]||'0',36)||0;if(!o.w||!okWord(o.w))return null;}
if(k==='r'){var r=p[4]||'';if(!/^[a-z0-9]{5}$/.test(r))return null;o.tr=parseInt(r[0],36);o.hn=parseInt(r[1],36);o.gu=r[2]==='1';o.sec=parseInt(r.substr(3,2),36);}
return o;}
function link(h){var a=+qp('vk_app_id')||54787973;return'https://vk.com/app'+a+'#'+h;}
function myName(){var z=Z();if(z.nm)return Promise.resolve(z.nm);
if(!SH||!REAL||!window.vkBridge||typeof vkSend!=='function')return Promise.resolve('');
return vkSend('VKWebAppGetUserInfo',{},3000).then(function(d){var n=String(d&&d.first_name||'').slice(0,12);if(n){Z().nm=n;sv();}return n;},function(){return'';});}
var WSET=null;
function allWords(){if(WSET)return WSET;WSET={};try{LEVELS.forEach(function(l){(l.w||[]).forEach(function(x){WSET[x[0]]=1;});});}catch(e){}return WSET;}
function okWord(w){if(!/^[а-яё]{3,8}$/.test(w))return false;if(allWords()[w])return true;try{return typeof isWord==='function'&&isWord(w);}catch(e){return false;}}
function myWords(){var r={},a=[],lv=Math.min(+S.lv||0,LEVELS.length),i,ld;
for(i=Math.max(0,lv-60);i<lv;i++){try{ld=typeof levelData==='function'?levelData(i):LEVELS[i];}catch(e){ld=LEVELS[i];}
(ld&&ld.w||[]).forEach(function(x){var w=x[0];if(w.length>=4&&w.length<=7&&!r[w]){r[w]=1;a.push(w);}});}
return a;}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
var HINTS=['Подсказки не будет — я в тебя верю!','Это есть у бабы Зины на кухне','Это бывает во дворе','Кот Ять это бы съел','Это слово про живое',
'Это можно потрогать руками','Это знает каждый первоклассник','Это слово далось мне с боем','Отгадаешь — с меня пирожок','За это слово Зина ставит пятёрку'];
function copy(t,done){var f=function(){try{var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();done();}catch(e){}};
try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,f);return;}}catch(e){}f();}
function send(h,txt,ok){var u=link(h);
var cp=function(){copy(txt+'\n'+u,function(){try{toast('Ссылка скопирована — вставь соседу в личные сообщения',3500);}catch(e){}ok('copy');});};
if(!REAL||!window.vkBridge||typeof vkSend!=='function'){cp();return;}
if(window.SHR){SHR.post(txt,{k:'frnd',link:u,cb:function(h){if(h==='vk')ok('vk');else if(h==='copy')ok('copy');}});return;}
vkSend('VKWebAppShare',{link:u,text:txt},120000).then(function(d){ok('vk');},function(e){var t=e&&(e.error_data&&(e.error_data.error_reason||e.error_data.error_code))||'';
if(/cancel|denied|4/i.test(String(t)))return;cp();});}
function css(){if($$('zqCss'))return;var c=document.createElement('style');c.id='zqCss';c.textContent=
'.zq-card{margin:6px 0;padding:8px 10px 10px;border-radius:14px;background:var(--card,#fff);box-shadow:0 3px 0 var(--edge,#d9dce6);color:var(--ink,#1e2333)}'+
'.zq-card h4{margin:0 0 6px;font-size:14.5px;font-weight:800;color:var(--ink2,#5a6276)}'+
'.zq-row{display:flex;gap:6px}.zq-b{flex:1 1 0;min-width:0;min-height:48px;padding:6px 4px;border:0;border-radius:12px;background:#eef2fb;color:#1d3f7a;font:inherit;font-weight:800;font-size:14px;line-height:1.15;cursor:pointer}'+
'.zq-b b{display:block;font-size:20px}.zq-b:active{transform:translateY(1px)}'+
'.zq-in{display:block;width:100%;min-height:44px;margin:4px 0;padding:8px 10px;border:0;border-radius:12px;background:#2563c9;color:#fff;font:inherit;font-weight:800;font-size:15px;line-height:1.25;text-align:left;cursor:pointer}'+
'.zq-w h2{margin:0 0 6px}.zq-say{display:flex;gap:10px;align-items:flex-start;text-align:left;margin:0 0 10px}.zq-say .av{flex:0 0 64px;width:64px;height:64px}.zq-say .av svg{width:100%;height:100%}.zq-say p{margin:0;font-size:16px}'+
'.zq-ch{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 8px}'+
'.zq-c{font:inherit;font-size:15px;font-weight:700;min-height:44px;padding:6px 12px;border-radius:999px;border:2px solid var(--edge,#c9cfe0);background:var(--card,#fff);color:var(--ink,#27324a);cursor:pointer}'+
'.zq-c.on{border-color:#2563c9;background:#2563c9;color:#fff}.zq-c.h{font-size:13.5px;font-weight:600;border-radius:12px;text-align:left;padding:4px 10px}'+
'.zq-lb{margin:6px 0 2px;font-size:13.5px;font-weight:700;color:var(--ink2,#5a6276);text-align:left}'+
'.zq-sl{display:flex;gap:5px;justify-content:center;margin:8px 0}.zq-sl span{width:38px;height:44px;border-radius:8px;border:2px solid #9aa6c2;background:#fff;color:#1e2333;font-size:24px;font-weight:800;line-height:40px;text-transform:uppercase;box-sizing:border-box}'+
'.zq-sl span.fx{background:#e6f4ea;border-color:#237a3b}.zq-sl.bad{animation:zqsh .35s}@keyframes zqsh{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'+
'.zq-tl{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0 10px}.zq-tl button{width:46px;height:48px;border:0;border-radius:10px;background:#ffd66b;box-shadow:0 3px 0 #c99a1c;color:#3a2a00;font:inherit;font-size:24px;font-weight:800;text-transform:uppercase;cursor:pointer}'+
'.zq-tl button:disabled{opacity:.25;box-shadow:none}.zq-hint{margin:0 0 4px;font-size:15px;font-style:italic}'+
'.zq-pre{white-space:pre-wrap;text-align:left;font-size:15px;line-height:1.35;background:#fffbe9;border:1px dashed #d9c27a;border-radius:12px;padding:10px 12px;margin:0 0 10px;max-height:38vh;overflow:auto;color:#2b2b2b}'+
'.zq-sm{font-size:13.5px;color:var(--ink2,#5a6276);margin:6px 0 0}'+
'@media (max-width:340px){.zq-sl span{width:32px;height:40px;font-size:20px;line-height:36px}.zq-tl button{width:40px;height:44px;font-size:21px}}'+
'@media (max-height:600px){.zq-say .av{flex-basis:48px;width:48px;height:48px}.zq-say p{font-size:14.5px}}';
(document.head||document.documentElement).appendChild(c);}
function win(h){css();modal('<div class="zq-w">'+h+'</div>');}
function say(m,t){return'<div class="zq-say"><div class="av">'+face(m)+'</div><p>'+t+'</p></div>';}
function done(){hideModal();ZB.safe('frnd-ref',function(){ZB.refresh();});}
function key(o){return o.k+o.id;}
function check(h,from){var o=parse(h),z=Z();
if(!o){ev({a:'in',k:String(h).charAt(2),e:'bad'});return null;}
if(o.k==='g'&&!ON.gift||o.k==='t'&&!ON.gift||o.k==='w'&&!ON.word||o.k==='r'&&!ON.word)return null;
if(has('rx',key(o))){if(from==='hs')ev({a:'in',k:o.k,e:'dup'});return null;}
if(o.fp===me()){if(from==='hs'){ev({a:'in',k:o.k,e:'own'});
try{toast(o.k==='g'?'Это твой же гостинец — Ять его второй раз не понесёт 😼':o.k==='w'?'Своё слово отгадывать — это как самому себе гадать на ромашке 🙂':'Это ссылка для соседа, а не для тебя 🙂',4000);}catch(e){}}return null;}
if(o.k==='t'&&!has('sx',o.id)||o.k==='r'&&!wxWord(o.id)){if(from==='hs')ev({a:'in',k:o.k,e:'alien'});return null;}
return o;}
function wxWord(id){var a=list('wx'),i;for(i=0;i<a.length;i++)if(a[i].slice(0,5)===id)return a[i].slice(5);return'';}
function pend(){var z=Z();if(!z.pg)return null;var o=check(z.pg,'pg');if(!o){z.pg='';sv();}return o;}
(function(){if(!F.hs)return;var o=check(F.hs,'hs');if(!o)return;ev({a:'in',k:o.k});var z=Z();z.pg=F.hs;sv();})();
function HFIT(){try{return!!(window.ZB2&&ZB2._reg.homefit&&!ZB2.off('homefit'));}catch(e){return false;}}
function banner(){var o=pend();if(!o)return'';var n=esc(o.nm);
if(HFIT())return'<button type="button" class="zn-chip" id="zqIn" data-zn-tag="🎁"><i>'+({g:'🎁',t:'💌',w:'🔤'}[o.k]||'📬')+'</i><b>'+n+'</b><small>'+({g:'гостинец ›',t:'спасибо ›',w:'загадка ›'}[o.k]||'ответ ›')+'</small></button>';
return'<button type="button" class="zq-in" id="zqIn">'+(o.k==='g'?'🎁 '+n+' шлёт тебе гостинец от бабы Зины! Открыть ›':o.k==='t'?'💌 '+n+' шлёт спасибо за гостинец ›':
o.k==='w'?'🔤 '+n+' загадывает тебе слово — отгадаешь? ›':'📬 '+n+' шлёт ответ на твою загадку ›')+'</button>';}
function openIn(){var o=pend();if(!o)return;tap();ev({a:'open',k:o.k});
if(o.k==='g')takeGift(o);else if(o.k==='t')takeThanks(o);else if(o.k==='w')solve(o);else seeReply(o);}
function claim(o){var z=Z();push('rx',key(o),16);z.pg='';sv();}
function takeGift(o){var z=Z(),n=esc(o.nm);
if(z.gr>=N.take){ev({a:'take',k:'g',e:'cap'});win('<h2>🎁 Гостинец ждёт</h2>'+say('think','Сегодня ты уже '+z.gr+' '+pl(z.gr,'гостинец','гостинца','гостинцев')+' принял. Почтальонка Люся говорит: «Остальное — завтра, у меня ноги не казённые».')+
'<div class="btns"><button class="btn green" id="zqOk">Ладно, завтра</button></div>');$$('zqOk').onclick=function(){tap();done();};return;}
var hb=0,c=0;try{if(typeof hbAdd==='function'&&typeof hbN==='function'&&hbN()+N.hb<=(typeof HB_MAX!=='undefined'?HB_MAX:9)){hbAdd(N.hb,'frnd');hb=N.hb;}}catch(e){}
if(!hb){try{c=E.give?E.give('frnd',N.gc,'gift'):(addCoins(N.gc,'gift'),N.gc);}catch(e){c=0;}}
z.gr++;z.G++;claim(o);ev({a:'take',k:'g',n:hb,c:c});
try{SND.coin();}catch(e){}
win('<h2>🎁 Гостинец от соседа</h2>'+say('happy','Почтальонка Люся принесла свёрток. Подписано: <b>'+n+'</b>. Внутри — '+(hb?'<b>💡 ×'+hb+'</b> подсказки':'<b>+'+c+' 💰</b> (подсказок у тебя и так полный карман)')+' и записка: «Заходи почаще, соседушка!»')+
'<div class="btns"><button class="btn blue" id="zqTy">💌 Сказать «спасибо»</button><button class="btn ghost small" id="zqOk">Готово</button></div>'+
'<p class="zq-sm">Спасибо — дело добровольное: '+n+' получит от Зины пирожок, а тебе Зина просто улыбнётся.</p>');
$$('zqOk').onclick=function(){tap();done();};
$$('zqTy').onclick=function(){tap();var b=this;b.disabled=true;myName().then(function(nm){
send(mk('t',[o.id,me(),encN(nm)]),'Спасибо за гостинец! Баба Зина всё передала 💌',function(how){ev({a:'send',k:'t',e:how});try{toast('Спасибо полетело! Ять понёс его через двор',3000);}catch(e){}done();});
setTimeout(function(){b.disabled=false;},1500);});};}
function takeThanks(o){var z=Z(),n=esc(o.nm);
if(z.ty>=N.tyDay){ev({a:'take',k:'t',e:'cap'});win('<h2>💌 Спасибо от соседа</h2>'+say('think','<b>'+n+'</b> — по твоему гостинцу — шлёт спасибо! Пирожки на сегодня кончились — Зина допечёт завтра, спасибо подождёт.')+
'<div class="btns"><button class="btn green" id="zqOk">Хорошо</button></div>');$$('zqOk').onclick=function(){tap();done();};return;}
var c=0;try{c=E.give?E.give('frnd',N.ty,'gift'):(addCoins(N.ty,'gift'),N.ty);}catch(e){}
z.ty++;z.T++;claim(o);ev({a:'take',k:'t',c:c});try{SND.coin();}catch(e){}
win('<h2>💌 Спасибо от соседа</h2>'+say('happy','Гостинец дошёл! <b>'+n+'</b> шлёт спасибо. Зина на радостях испекла тебе пирожок'+(c?': <b>+'+c+' 💰</b>':'')+'. «Вот это я понимаю — добрососедство!»')+
'<div class="btns"><button class="btn green" id="zqOk">Пожалуйста!</button></div>');$$('zqOk').onclick=function(){tap();done();};}
function gift(){if(!ON.gift)return;var z=Z();tap();ev({a:'open',k:'g',e:'out'});
if(z.gs>=N.send){win('<h2>🎁 Гостинец соседу</h2>'+say('think','Сегодня ты уже '+z.gs+' '+pl(z.gs,'гостинец отправил','гостинца отправил','гостинцев отправил')+'. Люся с сумкой еле ходит — давай завтра, а то двор подумает, что у нас спам.')+
'<div class="btns"><button class="btn green" id="zqOk">Понятно</button></div>');$$('zqOk').onclick=function(){tap();done();};return;}
win('<h2>🎁 Гостинец соседу</h2>'+say('happy','Собрала свёрток: <b>💡 ×'+N.hb+'</b> подсказки. Выбери соседа — отправлю ссылку в личку. Откроет игру по ней — гостинец его.')+
'<div class="btns"><button class="btn blue" id="zqGo">📨 Выбрать соседа</button><button class="btn ghost small" id="zqNo">Не сейчас</button></div>'+
'<p class="zq-sm">Если сосед потом скажет «спасибо» — Зина и тебе испечёт пирожок. Сегодня можно отправить ещё '+(N.send-z.gs)+'.</p>');
$$('zqNo').onclick=function(){tap();ev({a:'send',k:'g',e:'cancel'});done();};
$$('zqGo').onclick=function(){tap();var b=this;b.disabled=true;myName().then(function(nm){var id=rid();
send(mk('g',[id,me(),encN(nm)]),'Баба Зина передаёт тебе гостинец — '+N.hb+' подсказки! Открой игру по ссылке 🎁',function(how){var z=Z();
z.gs++;z.N++;push('sx',id,8);sv();ev({a:'send',k:'g',e:how,n:z.N});
win('<h2>🎁 Гостинец ушёл!</h2>'+say('happy','Ять понёс свёрток через двор. Как только сосед откроет — гостинец его. Скажет «спасибо» — узнаешь первым.')+
'<div class="btns"><button class="btn green" id="zqOk">Отлично</button></div>');$$('zqOk').onclick=function(){tap();done();};});
setTimeout(function(){b.disabled=false;},1500);});};}
function word(){if(!ON.word)return;var z=Z();tap();ev({a:'open',k:'w',e:'out'});
if(z.ws>=N.wsend){win('<h2>🔤 Загадай слово</h2>'+say('think','На сегодня загадок хватит — '+z.ws+' уже ушло. Соседям тоже надо спать.')+
'<div class="btns"><button class="btn green" id="zqOk">Ладно</button></div>');$$('zqOk').onclick=function(){tap();done();};return;}
var all=myWords();if(all.length<3){win('<h2>🔤 Загадай слово</h2>'+say('think','Пройди ещё пару уроков — загадывать будем из тех слов, что ты уже нашёл.')+
'<div class="btns"><button class="btn green" id="zqOk">Хорошо</button></div>');$$('zqOk').onclick=function(){tap();done();};return;}
var pick='',hint=0,ws=[];
function draw(){ws=shuffle(all).slice(0,6);if(ws.indexOf(pick)<0)pick='';draw0();}
function draw0(){
win('<h2>🔤 Загадай слово другу</h2>'+say('happy','Выбери слово из тех, что ты нашёл. Друг соберёт его из букв, а ответит — узнаешь, как справился.')+
'<div class="zq-lb">Слово</div><div class="zq-ch" id="zqWs">'+ws.map(function(w){return'<button class="zq-c'+(w===pick?' on':'')+'" data-w="'+w+'">'+w.toUpperCase()+'</button>';}).join('')+
'<button class="zq-c" id="zqMore">🔄 Другие</button></div>'+
'<div class="zq-lb">Подсказка (нажми — другая)</div><div class="zq-ch"><button class="zq-c h on" id="zqH">🔄 '+HINTS[hint]+'</button></div>'+
'<div class="btns"><button class="btn blue" id="zqGo"'+(pick?'':' disabled')+'>📨 Отправить другу</button><button class="btn ghost small" id="zqNo">Не сейчас</button></div>');
[].forEach.call(document.querySelectorAll('#mcard [data-w]'),function(b){b.onclick=function(){tap();pick=b.getAttribute('data-w');
[].forEach.call(document.querySelectorAll('#mcard [data-w]'),function(x){x.classList.toggle('on',x===b);});$$('zqGo').disabled=false;};});
$$('zqH').onclick=function(){tap();hint=(hint+1)%HINTS.length;this.textContent='🔄 '+HINTS[hint];};
$$('zqMore').onclick=function(){tap();pick='';draw();};
$$('zqNo').onclick=function(){tap();ev({a:'send',k:'w',e:'cancel'});done();};
$$('zqGo').onclick=function(){if(!pick)return;tap();var b=this;b.disabled=true;myName().then(function(nm){var id=rid(),w=pick,e=encW(w,id);if(!e)return;
send(mk('w',[id,me(),encN(nm),e,hint.toString(36)]),'Загадка от соседа: слово из '+w.length+' '+pl(w.length,'буквы','букв','букв')+'. Отгадаешь? 🔤',function(how){var z=Z();
z.ws++;z.W++;push('wx',id+w,6);sv();ev({a:'send',k:'w',e:how,n:w.length});
win('<h2>🔤 Загадка ушла!</h2>'+say('happy','Загадано: <b>'+w.toUpperCase()+'</b>. Когда друг отгадает и нажмёт «Ответить» — откроешь его ссылку и увидишь, как он справился.')+
'<div class="btns"><button class="btn green" id="zqOk">Ждём!</button></div>');$$('zqOk').onclick=function(){tap();done();};});
setTimeout(function(){b.disabled=false;},1500);});};}
draw();}
function solve(o){var w=o.w,L=w.split(''),n=esc(o.nm),t0=Date.now(),tries=0,hn=0,fx=0,cur=[],used=[],bag;
do{bag=shuffle(L);}while(L.length>2&&bag.join('')===w);
function slots(){var h='',i;for(i=0;i<L.length;i++)h+='<span'+(i<fx?' class="fx"':'')+'>'+(i<fx?L[i]:(cur[i-fx]!==undefined?bag[cur[i-fx]]:''))+'</span>';return h;}
function draw(){win('<h2>🔤 Загадка от соседа</h2>'+say('think','<b>'+n+'</b> загадывает слово из '+L.length+' '+pl(L.length,'буквы','букв','букв')+'. Собери его из букв!')+
'<p class="zq-hint">Подсказка: «'+esc(HINTS[o.hint]||HINTS[0])+'»</p><div class="zq-sl" id="zqSl">'+slots()+'</div>'+
'<div class="zq-tl" id="zqTl">'+bag.map(function(c,i){return'<button data-i="'+i+'">'+c+'</button>';}).join('')+'</div>'+
'<div class="zq-row"><button class="zq-b" id="zqDel"><b>⌫</b>Стереть</button><button class="zq-b" id="zqLt"><b>💡</b>Открыть букву</button><button class="zq-b" id="zqGu"><b>🏳️</b>Сдаюсь</button></div>');
bind();}
function lock(){var fi=[],i,j;for(i=0;i<fx;i++){for(j=0;j<bag.length;j++)if(bag[j]===L[i]&&fi.indexOf(j)<0){fi.push(j);break;}}return fi;}
function bind(){var fi=lock();
[].forEach.call(document.querySelectorAll('#zqTl button'),function(b){var i=+b.getAttribute('data-i');b.disabled=cur.indexOf(i)>=0||fi.indexOf(i)>=0;
b.onclick=function(){if(b.disabled)return;tap();cur.push(i);if(fx+cur.length>=L.length)test();else upd();};});
$$('zqDel').onclick=function(){tap();cur.pop();upd();};
$$('zqLt').onclick=function(){if(fx>=L.length-1){try{toast('Последнюю букву — сам, а то неинтересно 🙂',2500);}catch(e){}return;}tap();hn++;fx++;cur=[];upd();
if(fx>=L.length)test();};
$$('zqGu').onclick=function(){tap();fin(true);};}
function upd(){var s=$$('zqSl');if(s){s.innerHTML=slots();s.classList.remove('bad');}bind();}
function test(){var g=L.slice(0,fx).join('')+cur.map(function(i){return bag[i];}).join('');
if(g===w){fin(false);return;}
tries++;var s=$$('zqSl');if(s){s.innerHTML=slots();s.classList.add('bad');}
var real=false;try{real=typeof isWord==='function'&&isWord(g);}catch(e){}
try{toast(real?'«'+g.toUpperCase()+'» — слово хорошее, но загадано другое':'Не то. Зина зачёркивает красной ручкой ✍️',2500);}catch(e){}
setTimeout(function(){cur=[];upd();},500);}
function fin(gu){var z=Z(),sec=Math.min(1295,Math.round((Date.now()-t0)/1000)),c=0;tries++;
if(!gu&&z.wv<N.wsolve){try{c=E.give?E.give('frnd',N.wc,'gift'):(addCoins(N.wc,'gift'),N.wc);}catch(e){}z.wv++;}
if(!gu)z.V++;claim(o);ev({a:'solve',k:'w',e:gu?'gu':'ok',n:tries,c:c});
var res=b36(Math.min(35,tries),1)+b36(Math.min(35,hn),1)+(gu?'1':'0')+b36(sec,2),mm=Math.floor(sec/60)+':'+('0'+sec%60).slice(-2);
win('<h2>'+(gu?'🏳️ Сдаёшься?':'🎉 Отгадано!')+'</h2>'+say(gu?'think':'happy',gu?'Загадано было <b>'+w.toUpperCase()+'</b>. Ничего, в следующий раз — пятёрка. Зато соседу будет чем гордиться.':
'Это <b>'+w.toUpperCase()+'</b>! С '+tries+'-й попытки за '+mm+(hn?', подсказок: '+hn:', без подсказок')+'. Зина ставит пятёрку'+(c?' и даёт <b>+'+c+' 💰</b>':'')+'.')+
'<div class="btns"><button class="btn blue" id="zqRe">📬 Ответить: '+n+' узнает, как вышло</button>'+(ON.word?'<button class="btn green" id="zqBack">🔤 Загадать в ответ</button>':'')+'<button class="btn ghost small" id="zqOk">Готово</button></div>');
$$('zqOk').onclick=function(){tap();done();};
var bk=$$('zqBack');if(bk)bk.onclick=function(){word();};
$$('zqRe').onclick=function(){tap();var b=this;b.disabled=true;myName().then(function(nm){
send(mk('r',[o.id,me(),encN(nm),res]),gu?'Сдаюсь! Ну и словечко — сама баба Зина бы задумалась 🏳️':'Отгадано! Открой — узнаешь, за сколько попыток 😎',function(how){ev({a:'send',k:'r',e:how});try{toast('Ответ полетел!',2500);}catch(e){}done();});
setTimeout(function(){b.disabled=false;},1500);});};}
function kd(e){var tl=$$('zqTl');if(!tl){document.removeEventListener('keydown',kd);return;}var k=String(e.key||'').toLowerCase(),bs;
if(k==='backspace'){e.preventDefault();$$('zqDel').click();return;}
if(k.length!==1||RU.indexOf(k)<0)return;bs=tl.querySelectorAll('button');for(var i=0;i<bs.length;i++)if(!bs[i].disabled&&bs[i].textContent===k){e.preventDefault();bs[i].click();return;}}
document.addEventListener('keydown',kd);
draw();}
function seeReply(o){var z=Z(),w=wxWord(o.id),n=esc(o.nm),mm=Math.floor(o.sec/60)+':'+('0'+o.sec%60).slice(-2);
z.R++;claim(o);ev({a:'take',k:'r',e:o.gu?'gu':'ok',n:o.tr});
win('<h2>📬 Ответ на загадку</h2>'+say(o.gu?'think':'happy',o.gu?'<b>'+n+'</b> сдаётся на слове <b>'+esc(w.toUpperCase())+'</b>! Зина: «Хитро загадано. Пятёрка — загадчику».':
'<b>'+n+'</b> отгадывает твоё <b>'+esc(w.toUpperCase())+'</b> с '+o.tr+'-й попытки за '+mm+(o.hn?', подсказок: '+o.hn:', без подсказок')+'. Зина: «Вот это соседи у нас — сплошь отличники!»')+
'<div class="btns">'+(ON.word?'<button class="btn blue" id="zqAg">🔤 Загадать ещё</button>':'')+'<button class="btn ghost small" id="zqOk">Готово</button></div>');
$$('zqOk').onclick=function(){tap();done();};var a=$$('zqAg');if(a)a.onclick=function(){word();};}
function grid(n){var r='',i,full=Math.min(n,28);for(i=0;i<full;i++){r+='🟩';if(i%7===6&&i<full-1)r+='\n';}if(n>28)r+=' +'+(n-28);return r;}
function recs(){var a=[],r=S.z2r&&S.z2r.r,id,b,t,m,i;if(!r||!window.ZMG||!ZMG.INFO)return a;
for(i in ZMG.INFO){t=ZMG.INFO[i];if(!t||!t.id)continue;id=t.id;b=0;try{b=window.ZMGREC?+ZMGREC.best(id)||0:0;}catch(e){}if(b>0){m=0;try{if(ZMGREC.medal)m=+ZMGREC.medal(id)||0;}catch(e){}a.push({id:id,t:t.t,b:b,m:m});}}
return a.sort(function(x,y){return y.m-x.m||y.b-x.b;});}
function unit(id,b){try{if(ZMGREC.unit)return ZMGREC.unit(id,b);}catch(e){}return String(b);}
function bragText(k,id){var L=['👵 Баба Зина: слова из букв'],c=window.ZB2CAL,n=0,bs=0,MD=['','🥉','🥈','🥇'];
try{if(c&&c.streak){n=+c.streak()||0;bs=c.best?+c.best()||0:0;}}catch(e){}
if(n>0&&k!=='rec')L.push('🔥 Серия: '+n+' '+pl(n,'день','дня','дней')+' подряд'+(bs>n?' (лучшая — '+bs+')':'')+'\n'+grid(n));
var r=recs();if(k==='rec'&&id)r=r.filter(function(x){return x.id===id;}).concat(r.filter(function(x){return x.id!==id;}));
if(r.length)L.push('🏆 Рекорды: '+r.slice(0,k==='rec'?1:3).map(function(x){return x.t.replace(/[«»]/g,'')+' — '+unit(x.id,x.b)+(MD[x.m]?' '+MD[x.m]:'');}).join(' · '));
var lv=+S.lv||0;if(lv>0&&k!=='rec')L.push('📚 Пройдено уроков: '+lv);
L.push(n>=7?'Баба Зина ставит мне пятёрку за прилежание. Догоняй!':'Догоняй — у бабы Зины на всех пирожков хватит!');
return L.join('\n');}
function brag(k,id){if(!ON.brag)return;tap();k=k==='cal'||k==='rec'?k:'';var txt=bragText(k,id),wall=VK&&!OKP&&REAL&&!!window.vkBridge&&typeof vkSend==='function';ev({a:'open',k:'b',e:k||'home'});
win('<h2>📣 Похвастаться</h2>'+say('happy','Вот что я про тебя напишу. Скромничать не будем.')+'<div class="zq-pre">'+esc(txt)+'</div>'+
'<div class="btns"><button class="btn blue" id="zqGo">'+(wall?'📨 Отправить ВКонтакте':'📋 Скопировать текст')+'</button><button class="btn ghost small" id="zqOk">Не сейчас</button></div>');
$$('zqOk').onclick=function(){tap();done();};
$$('zqGo').onclick=function(){tap();var Z2=Z();
if(window.SHR){done();SHR.post(txt,{k:'brag',cb:function(h){ev({a:'brag',k:'b',e:h==='vk'?'vk':h==='cancel'?'vkno':h});}});return;}
copy(txt,function(){ev({a:'brag',k:'b',e:'copy'});try{toast('Скопировано — вставь другу в сообщение',3000);}catch(e){}done();});};}
ZB.add(ZB.homeSlots,{id:'zq-in',order:HFIT()?5:4,zone:HFIT()?'chips':'top',render:function(){var h=banner();if(h)css();return h;},
mount:function(el){var b=el&&el.querySelector('#zqIn');if(b)b.onclick=openIn;}});
var cardShown=0;
var OKCLEAN=ZB2.reg('okclean',{t:'ОК: без карточки «С соседями» на Доме',who:'SRV'});
ZB.add(ZB.homeSlots,{id:'zq-card',order:66,zone:'bottom',render:function(){if((+S.lv||0)<N.from||OKP&&OKCLEAN)return'';
var b=[];if(ON.gift)b.push('<button class="zq-b" data-f="gift"><b>🎁</b>Гостинец соседу</button>');
if(ON.word)b.push('<button class="zq-b" data-f="word"><b>🔤</b>Загадать слово</button>');
if(ON.brag)b.push('<button class="zq-b" data-f="brag"><b>📣</b>Похвастаться</button>');
if(!b.length)return'';css();return'<div class="zq-card"><h4>👥 С соседями</h4><div class="zq-row">'+b.join('')+'</div></div>';},
mount:function(el){var c=el&&el.querySelector('.zq-card');if(!c)return;if(!cardShown){cardShown=1;ev({a:'card'});}
[].forEach.call(c.querySelectorAll('[data-f]'),function(b){b.onclick=function(){var f=b.getAttribute('data-f');if(f==='gift')gift();else if(f==='word')word();else brag('');};});}});
F.ui=1;F.gift=gift;F.word=word;F.brag=brag;F.open=openIn;F.N=N;F.ON=ON;
F._t={parse:parse,mk:mk,encW:encW,decW:decW,encN:encN,decN:decN,me:me,check:check,bragText:bragText,myWords:myWords,Z:Z};
})();
