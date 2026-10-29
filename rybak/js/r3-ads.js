var R3ADS=(function(){'use strict';var W=window;function qp(k){try{var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):null;}catch(e){return null;}}
function local(){try{return/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);}catch(e){return false;}}
var ON=false;try{ON=typeof R3!=='undefined'&&R3&&R3.on&&typeof LANG!=='undefined'&&LANG!=='en'&&!!R3.reg('ads',{s:'R3-ADS',t:'ролики по нужде (ещё заход, где стоит), пустые ролики убраны, баннер ПК за флагом'});}catch(e){ON=false;}
function part(id){if(!ON)return false;try{return!R3.off('ads.'+id);}catch(e){return false;}}
function E(){try{return W.R3E&&R3E.ad?R3E.ad:null;}catch(e){return null;}}
function ev(k,e,o){try{var p={k:k,e:e};for(var x in o||{})p[x]=o[x];R3.ev('ads',p);}catch(er){}}
function s2(){try{return typeof ses2==='function'?ses2():true;}catch(e){return false;}}
function dk(){try{return typeof R3.dk==='function'?R3.dk():dayNum();}catch(e){return 0;}}
function fixV(o){if(!o||typeof o!=='object')o={};o.d=+o.d||0;o.m=Math.max(0,+o.m||0);o.h=Math.max(0,+o.h||0);return o;}
if(ON)try{R3.field('v',{id:'ads',def:function(){return{d:0,m:0,h:0};},fix:function(o){return fixV(o);},merge:function(a,b){a=fixV(a);b=fixV(b);if(b.d>a.d)return b;if(b.d===a.d){a.m=Math.max(a.m,b.m);a.h=Math.max(a.h,b.h);}return a;}});}catch(e){}
function V(){var v=S.r3v=fixV(S.r3v),d=dk();if(v.d!==d){v.d=d;v.m=0;v.h=0;}return v;}
function left(k){var A=E();if(!A)return 0;var per=k==='m'?(A.more&&A.more.perDay)||0:(A.hint&&A.hint.perDay)||0;return per-V()[k];}
function use(k){V()[k]++;try{save();}catch(e){}}
function adCan(){try{return adOk()&&adLikely();}catch(e){return false;}}
function drop(id){var A=E();return part('drop')&&!!A&&!!A.drop&&A.drop.indexOf(id)>=0;}
W.r3AdDrop=drop;if(typeof adCoinsLeft==='function'){var acl=adCoinsLeft;adCoinsLeft=function(){var n=acl.apply(this,arguments);try{if(drop('coins'))return 0;}catch(e){}return n;};}
function zon(){return!!(typeof G!=='undefined'&&G&&G.zor&&!G.over&&!G.tourn&&!G.cup&&!G.guest);}
function moreCan(){if(!part('more')||!zon()||G.uiFirst||G.extra||G.r3more||!s2()||left('m')<=0||!adCan())return false;try{if(interSoon())return false;}catch(e){}return true;}
function casts(){var A=E();return A&&A.more&&A.more.casts||3;}
function newLeg(){var s=G.zor;if(!s||typeof ZOR==='undefined')return;try{s.legs++;var sp=ZOR.zSpots(s);ZOR.zLeg(s,sp[0]);G.zsg={};for(var i=0;i<sp.length;i++)G.zsg[sp[i].k]=sp[i].sign;s.spots=sp;G.zStep=1;}catch(e){}}
if(typeof endSession==='function'){var es=endSession;endSession=function(){try{if(zon()){if(moreCan())return moreAsk();if(ON&&part('more')){var al=adLikely;adLikely=function(){return false;};try{return es.apply(this,arguments);}finally{adLikely=al;}}}}catch(e){}
return es.apply(this,arguments);};}
function moreAsk(){var g=G,n=casts();G.phase='done';G.adAsked=1;hint('');try{SND.phone();buzz([100,80,100]);}catch(e){}
modal('<h2>📞 '+L('Звонит жена','Your wife is calling')+'</h2><p class="quote"><b>'+L('Жена','Wife')+'</b>'+esc(pick(PH.wife))+'</p>'
+'<p class="r3adN">'+esc(L('Петрович: «Клёв только пошёл… Ещё заход? Пройдём к новому месту — '+n+' заброса.»',''))+'</p>'
+'<div class="row"><button class="btn accent noenter" id="eMore">📺 '+L('Ещё заход','One more spot')+' <small>+'+n+' '+L('заброса','casts')+'</small></button><button class="btn green" id="eHome">🏠 '+L('Иду-иду!','Coming!')+'</button></div>');try{STAT.offer('r3more');}catch(e){}ev('more','offer');$('eHome').onclick=function(){hideModal();finish();};$('eMore').onclick=function(){if(adHold('r3more'))return;hideModal();try{STAT.place('r3more');}catch(e){}
showRewarded(function(){if(G!==g||!G||G.over)return;use('m');G.r3more=1;G.extra=(G.extra||0)+n;newLeg();G.phase='aim';updHud();kick();ev('more','ok');hint(L('🚶 Ещё заход: '+n+' заброса — коснись воды','One more spot: '+n+' casts — tap the water'));later(function(){try{say('petr',L('Пошли вон туда, там ещё не кидали. Гляди на воду!',''),3800);}catch(e){}},600);},function(){finish();},function(){use('m');ev('more','late');return adLateCoins(more3Price(g));});};}
function goalFish(){var s=G.zor,g=s&&s.goal;if(!g||g.k==='any')return null;return FISH[g.id]||LEG[g.id]||null;}
function hintCan(){if(!part('hint')||!zon()||G.uiFirst||G.r3hint||G.phase!=='aim'||modalOn||!s2())return false;var s=G.zor;if(!s||s.hit>0||s.leg<1||!goalFish())return false;try{if(typeof paused!=='undefined'&&paused)return false;}catch(e){}
return left('h')>0&&adCan();}
function where(){var s=G.zor,f=goalFish(),c=s.ctx,best=null,bv=-1,sp=s.spots||[];if(f.leg){return{f:f,leg:1,b:f.bait,t:(f.tod||[])[0]||''};}
for(var i=0;i<sp.length;i++){var x=0;try{x=ZOR.act(f,s.pi,sp[i].k,c);}catch(e){}if(x>bv){bv=x;best=sp[i];}}
var a=null;try{a=a2Best(f);}catch(e){}
return{f:f,sp:best,b:ZOR.bestBait(f),d:a&&a.d&&a.d[0]||''};}
var DEP={top:'поверху',mid:'в полводы',bot:'у самого дна'},TOD={morning:'утром',day:'днём',evening:'под вечер',night:'затемно'};function hintSay(w){var bn='';try{bn=BAIT[w.b]?BAIT[w.b].acc:'';}catch(e){}
if(w.leg)return'Слушай сюда. '+nm(w.f)+' берёт только на '+(bn||'свою наживку')+(w.t?', '+TOD[w.t]:'')+' — и кидать подальше. Следы ищи.';var zn=w.sp&&ZONES[w.sp.k]?ZONES[w.sp.k].n.toLowerCase():'чистая вода';return'Видал, плеснуло? Вон там — '+zn+'. Там '+nm(w.f).toLowerCase()+' и стоит. Бери '+(bn||'червя')+(w.d&&DEP[w.d]?', '+DEP[w.d]:'')+'.';}
function mark(w){var m=$('r3adMk');if(!m){m=document.createElement('div');m.id='r3adMk';m.className='r3adMk';m.innerHTML='<b>📍</b><span></span>';$('scr-fish').appendChild(m);}
if(!w||!w.sp||!GEO){m.classList.remove('on');return;}
var r=cv.getBoundingClientRect(),k=r.width/(GEO.W||r.width),x=GEO.W*w.sp.x,y=GEO.yOf(w.sp.d);m.style.left=Math.round(x*k)+'px';m.style.top=Math.round(y*k)+'px';m.querySelector('span').textContent=ZONES[w.sp.k]?ZONES[w.sp.k].n:'';m.classList.add('on');G.r3mk={leg:G.zor.leg,t:Date.now()};}
function hintBtn(){var b=$('r3adHint');if(!b){b=document.createElement('button');b.id='r3adHint';b.className='r3adHint noenter';$('scr-fish').appendChild(b);b.onpointerdown=function(e){e.stopPropagation();};b.onclick=function(e){e.stopPropagation();if(adHold('r3hint'))return;if(!hintCan())return;var g=G;try{STAT.place('r3hint');SND.tap();}catch(x){}
showRewarded(function(){if(G!==g||!G||G.over||!G.zor)return;use('h');G.r3hint=1;var w=where();ev('hint','ok',{l:w.leg?1:0});mark(w);try{say('petr',hintSay(w),7000);}catch(x){}hint('📍 '+(w.sp&&ZONES[w.sp.k]?ZONES[w.sp.k].n:L('Наживка и время','Bait and time')));kick();},null,function(){if(G!==g||!G||G.over||!G.zor)return'';use('h');G.r3hint=1;var w=where();ev('hint','late');mark(w);return L('Петрович показал, где стоит','shown');});};}
b.innerHTML='📺 '+esc(L('Где стоит '+nm(goalFish()).toLowerCase()+'?','Where is it?'));return b;}
function hintSync(){try{if(!ON)return;var on=false;if(hintCan()){on=true;}
var b=$('r3adHint');if(on&&!b)b=hintBtn();if(b){if(on&&!b.classList.contains('on')){hintBtn();b.classList.add('on');try{STAT.offer('r3hint');}catch(e){}ev('hint','offer');}else if(!on&&b.classList.contains('on'))b.classList.remove('on');}
var m=$('r3adMk');if(m&&m.classList.contains('on')&&(!zon()||!G.r3mk||G.zor.leg!==G.r3mk.leg||Date.now()-G.r3mk.t>25000||G.phase==='fight'))m.classList.remove('on');}catch(e){}}
var BN={on:false,busy:false,shown:false,fail:0,next:0,closed:false};function pc(){try{return PLAT==='vk'&&/[?&]vk_platform=desktop_web/.test(location.search);}catch(e){return false;}}
function banFlag(){var v=null;try{v=W.localStorage.getItem('rybak-r3ban');}catch(e){}return v==='1'||(local()&&/(^|,)ban(,|$)/.test(qp('on')||''));}
function banOk(){if(!part('ban')||!pc()||!banFlag()||BN.closed||BN.fail>=3)return false;try{if(!W.vkBridge||!VK)return false;if(!s2()||(+S.sessions||0)<5)return false;if(PAY.own('no_ads'))return false;if(typeof clubOn==='function'&&clubOn())return false;}catch(e){return false;}
return true;}
function banWant(){try{if(!banOk())return false;if(typeof G!=='undefined'&&G&&!G.over)return false;if(!$('scr-map').classList.contains('on'))return false;if(document.querySelector('.mg-lay'))return false;var ad=$('ad');if(ad&&ad.classList.contains('on'))return false;return!document.hidden;}catch(e){return false;}}
function bsend(m,p){try{return typeof vkSend==='function'?vkSend(m,p||{},8000):W.vkBridge.send(m,p||{});}catch(e){return Promise.reject(e);}}
function banShow(){if(BN.busy||BN.shown||Date.now()<BN.next)return;BN.busy=true;bsend('VKWebAppShowBannerAd',{banner_location:'bottom',layout_type:'resize'}).then(function(r){BN.busy=false;if(r&&r.result){BN.shown=true;BN.fail=0;ev('ban','show',{h:r.banner_height||0});if(!banWant())banHide();}
else{BN.fail++;BN.next=Date.now()+60000;ev('ban','none');}},function(e){BN.busy=false;BN.fail++;BN.next=Date.now()+60000;var c='';try{c=String(e&&e.error_data&&(e.error_data.error_code||e.error_data.error_reason)||'').slice(0,20);}catch(x){}ev('ban','err',{c:c});});}
function banHide(){if(!BN.shown)return;BN.shown=false;bsend('VKWebAppHideBannerAd').then(function(){ev('ban','hide');},function(){});}
function banSync(){try{if(!ON)return;if(banWant())banShow();else if(BN.shown)banHide();}catch(e){}}
try{if(ON&&pc()&&W.vkBridge&&W.vkBridge.subscribe)W.vkBridge.subscribe(function(e){try{var t=e&&e.detail&&e.detail.type;if(t==='VKWebAppBannerAdClosedByUser'){BN.shown=false;BN.closed=true;ev('ban','close');}}catch(x){}});}catch(e){}
try{if(ON){R3.sub('run',function(){banHide();},'ads');R3.sub('home',banSync,'ads');R3.sub('oldhome',banSync,'ads');}}catch(e){}
if(ON)try{var css=document.createElement('style');css.textContent='.r3adHint{position:absolute;right:12px;bottom:calc(144px + env(safe-area-inset-bottom,0px));z-index:6;display:none;min-height:44px;padding:8px 12px;border:0;border-radius:14px;'
+'background:rgba(255,246,214,.94);color:#5a3a06;font:800 15px -apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 3px 0 rgba(0,0,0,.15)}.r3adHint.on{display:block}'
+'.r3adMk{position:absolute;z-index:5;display:none;transform:translate(-50%,-100%);pointer-events:none;text-align:center;color:#fff;font:800 13px -apple-system,Segoe UI,Roboto,sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.9)}'
+'.r3adMk.on{display:block;animation:r3adP 1.2s ease-in-out infinite}.r3adMk b{display:block;font-size:30px;line-height:1}'
+'@keyframes r3adP{0%,100%{margin-top:0}50%{margin-top:-6px}}.r3adN{font-size:15px;opacity:.9}'
+'html.rbNoAd #r3adHint{display:none!important}';document.head.appendChild(css);}catch(e){}
if(ON)setInterval(function(){hintSync();banSync();},700);return{on:function(){return ON;},drop:drop,left:left,moreCan:moreCan,hintCan:hintCan,where:where,ban:BN,banOk:banOk,banWant:banWant,pc:pc};})();