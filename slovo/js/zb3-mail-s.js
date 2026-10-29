'use strict';
(function(){
var M=window.Z3MAIL;
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||!window.Z3||!Z3.on||!M||!M.ON||M.F)return;
var F={lt:Z3.reg('z3m-lt',{t:'Почта: «Напиши Зине» (ответ утром)',who:'MAIL'}),cw:Z3.reg('z3m-cw',{t:'Почта: кроссворд про Галю в подарок (открытка)',who:'MAIL'}),
fr:Z3.reg('z3m-fr',{t:'Почта: подарок за пришедшего друга',who:'MAIL'})};
var num=M.num,str=M.str,DEF=M.DEF;
function Z(){if(!S.z3m||typeof S.z3m!=='object')S.z3m=JSON.parse(JSON.stringify(DEF));return S.z3m;}
function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function box(){var b=lsG('z3-mbox',[]);return b instanceof Array?b:[];}
function unread(){var n=0;box().forEach(function(x){if(x&&x.u)n++;});return n;}
function ev(a,p){var o={a:a},k;for(k in p||{})o[k]=p[k];Z3.ev('z3m',o);}
(function(){try{var h=location.hash||'',q=/[?&]hash=([^&]*)/.exec(location.search);if(q)h+='&'+decodeURIComponent(q[1]);
var c=/(?:^|[#&])cw=([0-9a-z-]{5,60})/.exec(h);if(c&&(','+Z().gr+',').indexOf(','+c[1]+',')<0)lsS('z3-cwin',c[1]);}catch(e){}})();
function Y(){return S.z3y||{};}
function pie(){var y=Y(),d=window.Z3Y&&Z3Y.DEF&&Z3Y.DEF.mail,F0=window.Z3Y0&&Z3Y0.F;if(!d)return null;
if(y.p&&!y.g&&y.p<=now())return d;if(!((+y.l||0)&1)&&F0&&F0.pie)return d;return null;}
function oven(){var y=Y(),d=window.Z3Y&&Z3Y.DEF&&Z3Y.DEF.mail;return y.p&&!y.g&&y.p>now()&&d?d:null;}
function now(){try{return nowMs();}catch(e){return Date.now();}}
(window.Z3SUB=window.Z3SUB||[]).push({id:'mail',t:'✉️ Письмо от Зины каждый день'});
M.F=F;M.Z=Z;M.ev=ev;M.box=box;M.unread=unread;M.lsG=lsG;M.lsS=lsS;
M.x=function(){return M.ui?Promise.resolve(M):ZB.load('js/zb3-mail-x.js').then(function(){return M;});};
M.ynote=function(){var p=pie()||oven();if(p&&p.note)return p.note();var n=unread();return n?(n>1?'новых писем: '+n:'новое письмо'):box().length?'письма Зины':'писем пока нет';};
M.ybadge=function(){var p=pie();if(p&&p.badge){var b=p.badge();if(b)return b;}var n=unread();return n?String(Math.min(n,9)):'';};
M.yhot=function(){var p=pie();if(p&&p.hot&&p.hot())return true;return unread()>0;};
M.ygo=function(){var p=pie();if(p){ZB.safe('z3m-pie',function(){p.go();});return;}ev('show',{s:'yard',u:unread(),d:Math.min(Z3.day(),99)});ZB.go('z3mail',{});};
if(F.lt&&window.ZB2MAIL&&ZB2MAIL.go&&!ZB2MAIL.go.__z3){var og=ZB2MAIL.go;ZB2MAIL.go=function(f,back){try{if(typeof hideModal==='function')hideModal();}catch(e){}
ev('show',{s:f==='win'?'win':'about'});ZB.go('z3mail',{pg:'write',from:f==='win'?'win':'about',back:back});};ZB2MAIL.go.__z3=1;ZB2MAIL.go0=og;}
ZB.screen('z3mail',{title:'Почта бабы Зины',render:function(el,op){
if(M.ui){ZB.safe('z3m-scr',function(){M.render(el,op||{});});return;}
el.innerHTML='<div style="padding:40px 16px;text-align:center;color:var(--z3-ink2)">✉️ Люся несёт почту…</div>';
M.x().then(function(){if(ZB.cur==='z3mail')ZB.safe('z3m-scr',function(){M.render(el,op||{});});},
function(){try{if(typeof toast==='function')toast('Почта не открылась — попробуй ещё раз',3000);}catch(e){}try{if(typeof openMenu==='function')openMenu();}catch(e){}});}});
var started=0;
function tick(why){if(!Z3.open('mail'))return;M.x().then(function(){ZB.safe('z3m-tick',function(){M.tick(why);});},function(){});}
Z3.whenReady(function(){setTimeout(function(){started=1;tick('ready');},1200);});
ZB.on('home',function(){if(started)tick('home');});
ZB.levelHook.push(function(i){if(started&&i&&i.ok&&i.end==='win'&&M.ui)ZB.safe('z3m-win',function(){M.tick('win');});});
})();
