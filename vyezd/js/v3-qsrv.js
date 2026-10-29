(function(){'use strict';
var W=window,D=document;
if(!W.V3||!V3.is||!V3.is('quarter'))return;
if(!V3.reg('quarter.link',{s:'V3F-QSRV',t:'Связки с сервером квартала: лично, свежий банк, слух, ДР, рейтинг ОК, REF'}))return;
function ok(f,d){try{return f();}catch(e){return d;}}
function L(a,b){return ok(function(){return VY.L(a,b);},a);}
function ev(a,o){ok(function(){V3.ev(a,o||{});});}
var LK='vyezd-v3x';
var M=ok(function(){var o=JSON.parse(localStorage.getItem(LK)||'null');return o&&typeof o==='object'?o:null;},null)||{};
if(!Array.isArray(M.li))M.li=[];
function sv(){ok(function(){localStorage.setItem(LK,JSON.stringify(M));});}
function dk(){return ok(function(){return V3.dk();},Math.floor(Date.now()/864e5));}
ok(function(){var nq=/(^|[#&])v3n=(q\d{1,2})/.exec(location.hash||'')||(function(){var h=/[?&]hash=([^&]*)/.exec(location.search||'');return h?/(^|[#&?])v3n=(q\d{1,2})/.exec(decodeURIComponent(h[1])):null;})();
if(nq)V3.sub('boot',function(){setTimeout(function(){ev('ntf_open',{k:nq[2]});},1500);});});
if(!W.V3QS||!V3QS.call)return;
var OK_=ok(function(){return!!OK;},false);
function S_(){return ok(function(){return VY.S;},null)||{};}
var TXK='vyezd-v3txt';
function txUrl(){var u=ok(function(){return V3QS.url();},'');return u?u.replace(/([?&])op=v3\b/,'$1op=v3txt'):'';}
function txApply(o){if(!o||!o.t||!W.V3T)return 0;var n=0;
for(var k in o.t){var l=o.t[k];if(!/^[a-z0-9_.]{1,32}$/.test(k)||!Array.isArray(l))continue;l=l.filter(function(s){return typeof s==='string'&&s;});if(!l.length)continue;
if(k==='week.letter'){var w=l[ok(function(){return Math.floor(dk()/7);},0)%l.length].split('|');if(w.length>=3&&W.V3UX){V3UX.weekLetter={name:w[0].slice(0,24),city:w[1].slice(0,24),t:w.slice(2).join('|')};n++;}continue;}
var root=V3T,p=k.split('.');if(p[0]==='en'){root=V3T.en=V3T.en||{};p.shift();}if(!p.length)continue;
var o2=root,i;for(i=0;i<p.length-1;i++){if(o2[p[i]]==null)o2[p[i]]={};o2=o2[p[i]];if(typeof o2!=='object'||Array.isArray(o2))break;}
if(i<p.length-1)continue;var cur=o2[p[i]];if(cur!=null&&!Array.isArray(cur))continue;
o2[p[i]]=l;n++;}
return n;}
function txLoad(){var u=txUrl();if(!u||!W.fetch)return;var c=ok(function(){return JSON.parse(localStorage.getItem(TXK)||'null');},null);
function use(o){if(!W.V3T||!V3T.ready)return;V3T.ready(function(){var n=txApply(o);if(n)ev('txt',{v:o.v||0,n:n});});}
if(c&&c.t&&Date.now()-(c.at||0)<12*3600e3){use(c);return;}
ok(function(){fetch(u,{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(o){
if(o&&o.t){o.at=Date.now();ok(function(){localStorage.setItem(TXK,JSON.stringify(o));});use(o);}else if(c&&c.t)use(c);},function(){if(c&&c.t)use(c);});});}
function mkCode(){var s='';while(s.length<6)s+=Math.random().toString(36).slice(2);return s.slice(0,6).replace(/^[^a-z]/,'k');}
function liOn(){return!!(W.VYMAIL&&V3.is('ux.mail'));}
if(W.VYMAIL)VYMAIL.rc=function(){if(!liOn())return'';var c=mkCode();M.li=M.li.filter(function(e){return dk()-e[1]<30;}).concat([[c,dk()]]).slice(-5);sv();ev('mail',{a:'code'});return c;};
function liCodes(){return M.li.filter(function(e){return dk()-e[1]<30&&!e[2];}).map(function(e){return e[0];});}
function liGot(r){if(!r)return;var got=false;M.li.forEach(function(e){if(r[e[0]]&&!e[2]){e[2]=1;(M.lp=M.lp||[]).push(String(r[e[0]]).slice(0,400));got=true;}});if(got){sv();liShow();}}
function liShow(){if(!M.lp||!M.lp.length||!W.V3UX||!V3UX.lichno)return;if(ok(function(){return UI.cur&&UI.cur()!=='home';},false))return;if(ok(function(){return VY.modalOn;},false))return;
var t=M.lp.shift();sv();ok(function(){V3UX.lichno(t);});}
V3.sub('home',function(){setTimeout(liShow,600);},'quarter.link');
function bdayNow(){var d=new Date(ok(function(){return nowMs();},Date.now()));return d.getMonth()===6&&Math.abs(d.getDate()-15)<=1;}
V3.sub('season:wish',function(o){var y=o&&o.y?Math.floor(+o.y):new Date().getFullYear();if(y>2000)ok(function(){V3QS.push('wi',{y:y});V3QS.call([['wish',{y:y}]],wishGot);});},'quarter.link');
function wishGot(r){var w=r&&r.r&&r.r.wish;if(w&&w.n>0)W.V3C_WISH_TOTAL=w.n;}
function country(){if(!M.ru||M.ru[0]<dk()-1||!(M.ru[1]>0))return'';var n=M.ru[1];
var t=ok(function(){var a=V3T.all('quarter.country');return a.length?a[(dk()*7)%a.length]:null;},null);
var s=t?(Array.isArray(t)?L(t[0],t[1]||t[0]):t):L('По всей стране вчера вывели {y} дворов. Михалыч в газете прочитал — значит, правда.','Yesterday the whole country cleared {y} yards. Mikhalych read it in the paper, so it’s true.');
return s.replace(/\{y\}/g,String(n));}
function lbHas(){return typeof LB!=='undefined'&&LB&&typeof LB.ok==='function';}
var LBS=null;
function lbShow(){ev('qs',{k:'lb'});ok(function(){VY.modal('<h2>🏆 '+L('Рейтинг недели','Weekly leaderboard')+'</h2><p>'+L('Загружаем…','Loading…')+'</p>');});
V3QS.call([['lb',{}]],function(r){var b=r&&r.r&&r.r.lb;if(!b||!b.l){ok(function(){VY.toast(L('Рейтинг сейчас отдыхает — загляни позже.','The leaderboard is resting — check back later.'),2400);VY.hide();});return;}
var esc=function(s){return ok(function(){return UI.esc(s);},String(s));},rows=b.l.map(function(e,i){return'<div class="lbr"><b>'+(i+1)+'</b><span>'+esc(e[0])+'</span><i>'+e[1]+' 📅</i></div>';}).join('');
var me=b.me||ok(function(){return LB.days();},0);
var m=VY.modal('<h2>🏆 '+L('Рейтинг недели','Weekly leaderboard')+'</h2><p>'+L('Сколько дней выполнено задание дня. У тебя:','Days with the daily challenge completed. You:')+' <b>'+me+'</b></p><div class="lb">'+(rows||'<p>'+L('Пока пусто — будь первым!','Nobody here yet — be the first!')+'</p>')+'</div>'+
'<p><small>'+L('Имя видно, только если ты разрешил его показывать. Иначе — «Игрок NNNN».','Your name shows only if you allowed it. Otherwise — “Player NNNN”.')+'</small></p><div class="row"><button class="btn" id="v3xLbX">'+L('Закрыть','Close')+'</button></div>');
var x=m&&m.querySelector('#v3xLbX');if(x)x.onclick=function(){VY.hide();};});}
if(OK_&&lbHas()&&V3.is('quarter.link.lb')){LBS={ok:LB.ok,show:LB.show};
LB.ok=function(){return ok(function(){return V3QS.live();},false)||ok(function(){return LBS.ok.call(LB);},false);};
LB.show=function(){if(ok(function(){return V3QS.live();},false))return lbShow();return LBS.show.apply(LB,arguments);};}
V3.sub('yard',function(i){if(!OK_||!i||!i.ok||!i.daily)return;var d=dk();if(M.dd===d)return;M.dd=d;sv();
ok(function(){V3QS.push('dd',{n:Math.max(1,lbHas()?LB.days():1)});});},'quarter.link');
var REF_COINS=200;
function myRc(){return ok(function(){return S_().v3p&&S_().v3p.rc;},'')||'';}
V3.sub('money:ref',function(c){if(c&&/^[a-z0-9]{4,8}$/.test(c)&&M.rf!==c){M.rf=c;sv();ok(function(){V3QS.push('rf',{c:c});V3QS.call([],null);});}},'quarter.link');
function refGot(r){var f=r&&r.r&&r.r.ref;if(!f||!(f.n>0))return;var n=Math.min(5,f.n|0),sum=n*REF_COINS;
ok(function(){VY.coins(sum);});ok(function(){ern('ref',sum);});ev('mn',{k:'refg',n:n});
ok(function(){var m=VY.modal('<h2>🤝 '+L('Сосед пришёл!','A neighbour came!')+'</h2><p><b>'+L('Шура: ','Shura: ')+'</b>'+
L(n>1?n+' соседа пришли по твоему приглашению и уже прошли пять дворов. Держи от двора: ':'Сосед пришёл по твоему приглашению и уже прошёл пять дворов. Держи от двора: ',(n>1?n+' neighbours':'A neighbour')+' came on your invite and cleared five yards. From the yard: ')+
'<b>+'+sum+' 💰</b></p><div class="row"><button class="btn green" id="v3xRf">'+L('Спасибо!','Thanks!')+'</button></div>');var b=m&&m.querySelector('#v3xRf');if(b)b.onclick=function(){VY.hide();};});}
var lastT=0;
function sync(force){if(!force&&Date.now()-lastT<6*3600e3)return;lastT=Date.now();var g=[],d=dk();
var rc=myRc();if(rc&&M.rc!==rc)V3QS.push('rc',{c:rc});
if(!M.ru||M.ru[0]!==d)g.push(['rumor',{}]);
var cs=liCodes();if(cs.length)g.push(['li',{c:cs}]);
if(rc&&(M.rc===rc||M.rcT))g.push(['ref',{}]);
if(bdayNow())g.push(['wish',{y:new Date().getFullYear()}]);
V3QS.call(g,function(r){if(!r||!r.r){lastT=Date.now()-5.5*3600e3;return;}var x=r.r;
if(rc&&M.rc!==rc){M.rc=rc;sv();}
if(x.rumor&&typeof x.rumor.y==='number'){M.ru=[d,x.rumor.y];sv();}
if(x.li)liGot(x.li);if(x.ref)refGot(r);if(x.wish)wishGot(r);});}
V3.sub('boot',function(){setTimeout(function(){sync(true);},3500);setTimeout(txLoad,5000);},'quarter.link');
V3.sub('home',function(){sync(false);},'quarter.link');
W.V3QX={country:country,sync:sync,txApply:txApply,lbShow:lbShow,st:function(){return M;},code:mkCode};
})();