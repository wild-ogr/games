(function(){'use strict';var GRP='https://ok.ru/group/70000058939568';try{if(typeof OK==='undefined'||!OK||typeof openAbout!=='function')return;if(typeof R2==='object'&&R2&&R2.off&&R2.off('r3.grow'))return;}catch(e){return;}
var oa=openAbout;window.openAbout=function(){var r=oa.apply(this,arguments);try{var mc=document.getElementById('mcard');if(mc&&!document.getElementById('abGrp')){var row=mc.querySelector('.row'),p=document.createElement('p');p.className='about';p.innerHTML='<b>Поддержка:</b> <a id="abGrp" href="'+GRP+'" target="_blank" rel="noopener" style="color:#ffd36a;text-decoration:underline">группа «Игры во дворе» в Одноклассниках</a> — вопросы и пожелания пишите туда.';if(row)mc.insertBefore(p,row);else mc.appendChild(p);}}catch(e){}
return r;};})();(function(){'use strict';if(typeof R3!=='object'||!R3.on)return;if(!R3.reg('grow',{s:'R3-GROW',t:'приток: оповещения ОК 2/7/13-й день, просьба уведомлений VK после трофея, приход по оповещению'}))return;var ON={okn:R3.reg('grow.okn',{s:'R3-GROW',t:'ОК: день 1 игрока серверу (оповещения 2/7/13-й день шлёт сервер)'}),ask:R3.reg('grow.ask',{s:'R3-GROW',t:'VK: вопрос про напоминания — после трофея, голосом Петровича'})};var LSD='rybak-r3okd',MSK=108e5;function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;}
function qp(k){try{var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):null;}catch(e){return null;}}
function vk(){try{return PLAT==='vk'&&!window.__demo;}catch(e){return false;}}
function isOk(){try{return!!OK;}catch(e){return false;}}
function ru(){try{return typeof LANG==='undefined'||LANG!=='en';}catch(e){return true;}}
function now(){try{if(window.R3D&&R3D.now)return R3D.now();}catch(e){}try{return nowMs();}catch(e){return Date.now();}}
function mskDk(t){var d=new Date(t+MSK);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function srv(){return!!(window.R3S&&R3S.url&&R3S.url());}
function okd(){if(!ON.okn||!vk()||!isOk()||!srv())return null;var t=now(),today=mskDk(t),o;if(ls(LSD)===String(today))return null;var c=null;try{c=S.r3c;}catch(e){}
if(c&&c.v)o={old:1};else{var n=1;try{n=R3.day();}catch(e){}if(!(n>=1&&n<99))return null;o={d1:mskDk(t-(n-1)*864e5)};}
ls(LSD,String(today));R3S.send('okd',o);R3.ev('okd',o.old?{old:1}:{n:R3.day()});return o;}
function arrived(){var m=/(?:^|[#&?])ntf=(r3[a-z0-9]{1,10})/i.exec(location.hash||'');if(!m){var h=qp('hash');if(h)m=/(?:^|&)ntf=(r3[a-z0-9]{1,10})/i.exec(h);}
if(!m)return'';R3.ev('ntfin',{k:m[1].slice(2,12),p:isOk()?'ok':'vk'});return m[1];}
var luck=null;function curG(){try{return G;}catch(e){return null;}}
function mark(k){return function(c){var g=curG();if(!g||!c)return;var p={tr:1,rec:2,leg:3,'new':0};if(luck&&luck.g===g&&p[luck.k]>=p[k])return;luck={g:g,k:k,c:c};};}
R3.sub('trophy',mark('tr'),'grow.ask');R3.sub('record',mark('rec'),'grow.ask');R3.sub('legend',mark('leg'),'grow.ask');R3.sub('catch',function(c){if(c&&c.first)mark('new')(c);},'grow.ask');function ses(){try{return+(S.soc&&S.soc.ses)||0;}catch(e){return 0;}}
function caught(g){try{return(g.catch||[]).some(function(c){return c&&c.id&&!c.lost&&!c.junk;});}catch(e){return false;}}
function lucky(g){if(luck&&luck.g===g)return luck.k;if(ses()>=4&&caught(g))return'any';return'';}
var askFor=null;function askText(n){if(!ru()||!window.R3T)return null;var k=n<=1?(askFor&&askFor.k!=='any'?'grow.ask1':'grow.ask0'):n===2?'grow.ask2':'grow.ask3',c={};if(askFor&&askFor.c&&askFor.c.id){c.fish=askFor.c.id;c.w=+askFor.c.w||0;}
var t=null;try{t=R3T.pick(k,c);if(!t&&k==='grow.ask1')t=R3T.pick('grow.ask0',{});}catch(e){}return t||null;}
if(ON.ask){try{if(typeof ntfText==='function'){var nt0=ntfText;window.ntfText=function(n){var t=null;try{t=askText(+n||1);}catch(e){}return t||nt0.apply(this,arguments);};}}catch(e){}
try{if(typeof socEarly==='function'){var se0=socEarly;window.socEarly=function(g){var k='';try{k=lucky(g);}catch(e){}
if(!k){try{if(window.SOC&&SOC.ntfDue&&SOC.ntfDue()&&typeof ses2==='function'&&ses2())R3.ev('ntfask',{k:'wait'});}catch(e){}return;}
askFor={k:k,c:luck&&luck.g===g?luck.c:null};var had=!!document.getElementById('mSocBox');var r=se0.apply(this,arguments);try{if(!had&&document.getElementById('mSocBox'))R3.ev('ntfask',{k:k,n:(S.soc&&S.soc.ntf&&+S.soc.ntf.n)||0});}catch(e){}return r;};}}catch(e){}}
var onSent=false;function ntfOnPoll(){if(onSent||!vk()||isOk()||!srv())return;try{if(qp('vk_are_notifications_enabled')==='1'){onSent=true;return;}
if(window.SOC&&SOC.ntfOn&&SOC.ntfOn()){onSent=true;R3S.send('ntfon',{on:1});}}catch(e){}}
R3.sub('boot',function(){arrived();setTimeout(okd,3500);setInterval(ntfOnPoll,5000);},'grow');R3.sub('day',function(){setTimeout(okd,1500);},'grow');window.R3G={okd:okd,lucky:lucky,askText:askText,arrived:arrived,_st:function(){return{luck:luck?{k:luck.k,id:luck.c&&luck.c.id}:null,onSent:onSent,okd:ls(LSD)};}};})();