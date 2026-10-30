(function(){'use strict';
var W=window,D=document;
function ok(f,d){try{return f();}catch(e){return d;}}
function isO(x){return!!x&&typeof x==='object'&&!Array.isArray(x);}
var ON=false;
if(W.V3&&V3.reg){ok(function(){V3.reg('rs',{s:'RS',t:'реструктуризация 30.10'});});ON=V3.reg('rs.drip',{s:'RS-П2',t:'открытие по дням, одно окно при входе'});}
function S_(){return ok(function(){return typeof S!=='undefined'&&isO(S)?S:null;},null);}
function T(ru,en){return ok(function(){return L(ru,en);},ru);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function done(){return ok(function(){return+S.levelsDone||0;},0);}
function yards(){return ok(function(){return Math.max(0,(+S.unlocked||1)-1);},0);}
function sv(){ok(function(){save();});}
var NOV={today:2,night:3,myyard:4,cars:5,rest:6,rights:7,light:7,event:8,league:9,avtodrom:10,orders:11,news:12,workshop:13,photo:14,mail:14};
var OLD_NOW={today:1,myyard:1,cars:1,rest:1,rights:1,light:1,avtodrom:1,orders:1,league:1};
var OLD={order:1,night:2,bench:3,event:4,news:5,mail:6,workshop:7,photo:8,quarter:9,shift:10,attic:11};
var NEW_TXT={
today:['На сегодня','Каждый день — три дела и сундучок дня. Карточка — на главном, под кнопкой «Выехать».','Gifts and three jobs a day with a daily chest.'],
night:['Вечерний двор','Вечером соседи возвращаются с работы — поставь их машины во дворе. Утром — разъезд.','In the evening, park the neighbours’ cars; in the morning they drive off.'],
myyard:['Мой двор','Свой двор: постройки, цветы, лавочки. Кнопка «Мой двор» — внизу экрана.','Your own yard: buildings and decor. The “My yard” button is at the bottom.'],
cars:['Мои машины','Альбом машин и покраска — в «Моём дворе», вкладка «Машины».','Car album and paint — My yard, “Cars” tab.'],
rest:['Отдых','У Толика игры для передышки: завести мотор, фото, мойка. Кнопка «Отдых» — внизу экрана.','Tolik’s games for a break. The “Rest” button is at the bottom.'],
rights:['Права','Твои права и звания водителя — строкой вверху «Маршрута».','Your driving licence and ranks — at the top of the Route.'],
event:['Событие недели','Каждую неделю во дворе своё событие. Смотри плашку на главном.','A new event every week — see the bar on the main screen.'],
league:['Соседи','Таблица недели: кто из соседей прошёл больше дворов. «Мой двор» → «Соседи».','The week’s table of neighbours. My yard → Neighbours.'],
avtodrom:['Автодром деда Митяя','Дед Митяй учит парковаться. «Отдых» → «Автодром».','Grandpa Mityai teaches parking. Rest → Driving ground.'],
orders:['Заказы жильцов','Жильцы просят помочь — их заказы появятся в «На сегодня».','Residents’ requests now appear in “Today”.'],
news:['Новости двора','Доска объявлений, календарь подъезда и сериал — в «На сегодня» → «Новости двора».','Notice board, calendar and the serial — Today → Yard news.'],
workshop:['Мастерская Толика','Толик собирает «Москвич» из запчастей. «Мой двор» → «Машины».','Tolik builds a Moskvich from parts. My yard → Cars.'],
photo:['Фото двора и письмо','Сфотографируй свой двор, а бабе Шуре можно написать письмо (⚙).','Take a photo of your yard; you can also write to Granny Shura (⚙).'],
mail:['Письмо бабе Шуре','Бабе Шуре можно написать письмо — ⚙ → «Письмо Шуре».','You can write to Granny Shura — ⚙.'],
order:['Мы навели порядок','Всё на месте: Маршрут, Мой двор и игры Толика — кнопками внизу. Дела дня — в карточке «На сегодня».','Everything is still here: Route, My yard and games are at the bottom; daily jobs are in “Today”.'],
bench:['Шура на лавочке','Нажми на бабу Шуру у подъезда — расскажет что-нибудь. А в её тетрадке — всё, что она про тебя помнит.','Tap Granny Shura on the bench for a chat.'],
quarter:['Наш квартал','Общий счёт квартала и субботник — в «Моём дворе» → «Соседи».','The quarter’s score — My yard → Neighbours.'],
shift:['Пять дворов подряд','Пять дворов подряд с тремя сердечками — кнопка в «Маршруте».','Five yards in a row — on the Route.'],
attic:['Чердак','Чердак для бывалых — кнопка в «Маршруте».','The attic for veterans — on the Route.']};
NEW_TXT.light=NEW_TXT.rights;
function goKey(k){var g={today:function(){if(W.RST&&RST.open)RST.open();},night:function(){scr('home');},myyard:function(){scr('my','garage-yard');},
cars:function(){scr('my','garage',{tab:'cars'});},rest:function(){scr('rest','garazhi');},rights:function(){scr('map');},light:function(){scr('map');},event:function(){scr('home');},
league:function(){scr('my','league',{tab:'nb'});},avtodrom:function(){scr('avtodrom');},orders:function(){ok(function(){ORD.open();});},
news:function(){if(W.RST&&RST.news)RST.news();},workshop:function(){scr('my','garage',{tab:'cars'});},photo:function(){scr('my');},
mail:function(){ok(function(){VYMAIL.open('about');});},order:function(){scr('home');},bench:function(){ok(function(){V3SKIN.say();});},
quarter:function(){scr('my','league',{tab:'nb'});},shift:function(){scr('map');},attic:function(){scr('map');}}[k];if(g)ok(g);}
function scr(a,b,o){if(ok(function(){return UI.has(a);},false))return ok(function(){UI.go(a,o);});if(b&&ok(function(){return UI.has(b);},false))ok(function(){UI.go(b);});}
function fixR(o){if(!isO(o))o={v:1};o.v=1;['d0','dk','n','ew'].forEach(function(k){if(typeof o[k]!=='number'||!isFinite(o[k])||o[k]<0)o[k]=0;});
if(!isO(o.sh))o.sh={};if(!isO(o.sn))o.sn={};return o;}
if(ON)V3.field('v3rd',{s:'RS-П2',def:{v:1},fix:function(o){return fixR(o);},
merge:function(a,b){a=fixR(a);b=fixR(b);var r={v:1,d0:a.d0&&b.d0?Math.min(a.d0,b.d0):(a.d0||b.d0),dk:Math.max(a.dk,b.dk),n:Math.max(a.n,b.n),ew:Math.max(a.ew,b.ew),sh:{},sn:{}},k;
for(k in a.sh)r.sh[k]=a.sh[k];for(k in b.sh)r.sh[k]=Math.max(r.sh[k]||0,b.sh[k]);for(k in a.sn)r.sn[k]=1;for(k in b.sn)r.sn[k]=1;return r;}});
function R(){var s=S_();if(!s)return fixR({});if(!isO(s.v3rd))s.v3rd=fixR({});return s.v3rd;}
function dk(){return ok(function(){return V3.dk();},0);}
function stamp(){if(!ON)return;var r=fixR(R()),d=dk();if(!d)return;var ch=false;
if(!r.d0){r.d0=d;ch=true;ok(function(){V3.ev('rs',{k:'d0',v:vet()?1:0,u:yards()});});}
if(r.dk!==d){r.dk=d;r.n=(r.n||0)+1;ch=true;}
if(ch)sv();}
function vet(){return ok(function(){return V3.vet();},false);}
function vday(){return ok(function(){return V3.day();},1);}
function rday(){var r=R();return r.n>0?r.n:1;}
function used(k){var s=S_();if(!s)return false;return ok(function(){
if(k==='night')return isO(s.v3n)&&((+s.v3n.k||0)>0||!!s.v3n.e);
if(k==='event')return isO(s.v3n)&&(+s.v3n.mn||0)>0;
if(k==='mail')return isO(s.vml)&&(+s.vml.n||0)>0;
if(k==='news')return isO(s.v3season)&&(+s.v3season.seen||0)>0;
if(k==='photo')return isO(s.v3m)&&!!s.v3m.ph;
return false;},false);}
function needDay(k){if(vet()){if(OLD_NOW[k])return 1;if(OLD[k])return OLD[k];return 1;}return NOV[k]||1;}
function curDay(){return vet()?rday():vday();}
function open(k){if(!ON)return true;if(vet()&&used(k))return true;return curDay()>=needDay(k);}
function dayLeft(k){if(open(k))return 0;return Math.max(1,needDay(k)-curDay());}
function todayNew(){var c=curDay(),tbl=vet()?OLD:NOV,k,best=null;if(c<1)return null;
for(k in tbl){if(tbl[k]!==c)continue;if(vet()&&used(k))continue;if(!NEW_TXT[k])continue;if(k==='light'||(k==='mail'&&!vet()))continue;
if(k==='quarter'&&!ok(function(){return V3.is('quarter');},false))continue;if(k==='shift'&&yards()<30)continue;if(k==='attic'&&yards()<210)continue;
if(wasShown(k))continue;best=k;break;}
return best;}
function fresh(k){if(!ON)return false;if(!open(k)||R().sn[k])return false;var nd=needDay(k);return nd>1&&curDay()-nd<3;}
function seen(k){if(!ON)return;var r=R();if(!r.sn[k]){r.sn[k]=1;sv();}}
var GAMES=['zavedi','foto','moyka','parkovka','doroga','bagazh','domino','bayki','regul','nomera','otlich','polomka','zapravka','ugaday','sneg'];
function games(){if(!ON||vet())return 15;var d=vday();if(d<6)return 0;if(d<15)return 3;return Math.min(15,3+(d-14));}
var AT={night:'night',calendar:'news',moskvich:'event',mail:'mail',garages:'rest',chalk:'league',camera:'photo',flowers:'myyard',bench:'bench'};
function wrapGate(){if(!ON||!W.V3UX||!V3UX.gate||V3UX.gate.__rs)return;var g0=V3UX.gate;
var g1=function(at){var k=AT[at];if(!k)return g0.apply(this,arguments);if(k==='bench'&&!vet())return true;return open(k);};g1.__rs=1;V3UX.gate=g1;}
function busy(){return ok(function(){if(typeof G!=='undefined'&&G)return true;if(W.__demo)return true;var m=D.getElementById('modal');if(m&&m.classList.contains('on'))return true;
var a=D.getElementById('ad');if(a&&a.classList.contains('on'))return true;if(UI.cur!=='home')return true;if(D.querySelector('.uxtut'))return true;return false;},true);}
var shownAt=0,arrive=0;
function giftDue(){return ok(function(){return!streakState().claimed&&done()>=1;},false);}
function retDue(){return ok(function(){return!!(W.TD&&TD.retState&&TD.retState());},false);}
function showGift(){if(retDue()&&ok(function(){return TD.openReturn();},false))return true;
return ok(function(){var st=streakState();if(st.claimed)return false;if(st.day===1&&typeof giftN==='function'&&!giftN()){claimStreak(1,true);return false;}showStreak();return true;},false);}
function doorQuiet(){
ok(function(){var s=S_();if(!s||!isO(s.v3n)||!V3.is('night.door'))return;var t=dayKey(0);if(s.v3n.dr!==t){s.v3n.dr=t;sv();}});}
function festQuiet(){
ok(function(){var s=S_(),c=W.FESTVY&&FESTVY.cur?FESTVY.cur():null;if(!s||!c||!isO(s.fst))return;if(!isO(s.fst.seen))return;
if(!s.fst.seen[c.id]){s.fst.seen[c.id]=1;var r=R();if(!isO(r.sh))r.sh={};if(!r.sh['f:'+c.id])r.sh['f:'+c.id]=-1;sv();}});}
function festDue(){return ok(function(){var c=W.FESTVY&&FESTVY.cur?FESTVY.cur():null;if(!c||done()<1)return null;var q='f:'+c.id,v=R().sh[q];if(MEM[q]||lsGet()[q]>0)return null;return v===-1||v===undefined?c:null;},null);}
var MEM={},LSK='vyezd-rsd-sh';
function lsGet(){try{var o=JSON.parse(W.localStorage.getItem(LSK)||'{}');return isO(o)?o:{};}catch(e){return{};}}
function lsPut(k,v){try{var o=lsGet();o[k]=v;W.localStorage.setItem(LSK,JSON.stringify(o));}catch(e){}}
function wasShown(k){if(MEM[k]||R().sh[k])return true;var l=lsGet();if(l[k]){R().sh[k]=l[k];return true;}return false;}
function markShown(k,v){MEM[k]=v;R().sh[k]=v;lsPut(k,v);}
function newWin(k){var t=NEW_TXT[k];if(!t)return false;if(wasShown(k))return false;var r=R();markShown(k,dk());r.ew=dk();sv();
ok(function(){V3.ev('rs',{k:'new',w:k,d:curDay()});});
var h='<div class="rsd-new"><div class="rsd-tag">'+esc(T('Новое во дворе','New in the yard'))+'</div><h2>'+esc(T(t[0],t[0]))+'</h2><p class="rsd-p">'+esc(T(t[1],t[2]))+'</p>'+
'<div class="row rsd-btns"><button class="btn green rsd-go" id="rsdGo" type="button">'+esc(k==='order'?T('Понятно','Got it'):T('Посмотреть','Show me'))+'</button>'+
(k==='order'?'':'<button class="btn rsd-later" id="rsdLater" type="button">'+esc(T('Потом','Later'))+'</button>')+'</div></div>';
ok(function(){modal(h);});var g=D.getElementById('rsdGo'),l=D.getElementById('rsdLater');
if(g)g.onclick=function(){ok(function(){SND.tap();});ok(function(){hideModal();});ok(function(){V3.ev('rs',{k:'newgo',w:k});});setTimeout(function(){goKey(k);},120);};
if(l)l.onclick=function(){ok(function(){SND.tap();});ok(function(){hideModal();});};
return true;}
function entry(){if(!ON||busy())return false;var t=Date.now();if(t-shownAt<4000)return false;stamp();doorQuiet();festQuiet();
if(done()<1)return false;
if(arrive===shownArr)return false;
var shown=false;
if(giftDue()||retDue())shown=showGift();
if(!shown){var k=todayNew();if(k)shown=newWin(k);}
if(!shown){var c=festDue();if(c){markShown('f:'+c.id,dk());sv();shown=ok(function(){FESTVY.open();return true;},false);}}
if(shown){shownAt=t;shownArr=arrive;}
return shown;}
var shownArr=-1;
function onHome(){arrive++;setTimeout(entry,700);}
function css(){if(D.getElementById('rsdCss'))return;var s=D.createElement('style');s.id='rsdCss';
s.textContent='.rsd-new{text-align:center;font-family:Rubik,-apple-system,Roboto,sans-serif;color:#17324a}.rsd-tag{display:inline-block;background:#fff4d6;color:#8a5a00;border-radius:12px;padding:4px 12px;font-size:15px;font-weight:600}'+
'.rsd-new h2{font-size:24px;margin:10px 0 6px}.rsd-p{font-size:18px;line-height:1.4;margin:0 0 14px}.rsd-btns{display:flex;flex-direction:column;gap:10px}'+
'.rsd-btns .btn{min-height:56px;font-size:19px;width:100%}';D.head.appendChild(s);}
function wireRSH(){if(!W.RSH||!RSH.on||!RSH.gate)return;ok(function(){RSH.gate(function(id){if(id==='my')return open('myyard');if(id==='rest')return open('rest');return true;});});}
function init(){if(!ON)return;css();stamp();wrapGate();wireRSH();
if(typeof W.maybeStreak==='function'&&!W.maybeStreak.__rs){var f=function(){entry();};f.__rs=1;ok(function(){maybeStreak=f;});}
doorQuiet();festQuiet();V3.sub('map',festQuiet,'rs.drip');V3.sub('cloud',function(){doorQuiet();festQuiet();},'rs.drip');V3.sub('home',onHome,'rs.drip');V3.sub('day',function(){stamp();},'rs.drip');V3.sub('cloud',function(){stamp();},'rs.drip');
ok(function(){if(UI.cur==='home')onHome();});}
if(ON){if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init);else setTimeout(init,0);}
W.RSD={on:ON,open:open,day:dayLeft,need:needDay,fresh:fresh,seen:seen,games:games,GAMES:GAMES,entry:entry,todayNew:todayNew,
cur:curDay,NOV:NOV,OLD:OLD,_r:R,_used:used};
})();