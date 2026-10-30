'use strict';
(function(){
var CFG={on:true,cap:40,perLv:10};
window.ZBMIG_CFG=CFG;
if(window.ZB_OFF&&ZB_OFF.school)CFG.on=false;
if(!CFG.on||typeof ZB==='undefined')return;
function num(x){x=+x;return isFinite(x)&&x>0?x:0;}
function isO(x){return!!x&&typeof x==='object'&&!Array.isArray(x);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function fix(s){s=s||S;if(!isO(s.zbM)){s.zbM=num(s.lv)>0?{v:1,need:1}:{v:1,b:1};}var m=s.zbM;m.v=1;
['b','need','done','shown','g'].forEach(function(k){m[k]=m[k]?1:0;});m.c=num(m.c);m.f=num(m.f);}
function merge(s,d){fix(s);var m=s.zbM;if(!d)return;
if(isO(d.zbM)){var b=d.zbM;['done','shown','g'].forEach(function(k){if(b[k])m[k]=1;});m.c=Math.max(m.c,num(b.c));m.f=Math.max(m.f,num(b.f));
if(b.need&&!m.done){m.need=1;m.b=0;}}
else if(num(d.lv)>0&&!m.done){m.need=1;m.b=0;}}
ZB.onSave({id:'migrate',keys:['zbM'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function pending(){try{if(SHOT)return false;}catch(e){}fix();var m=S.zbM;return!!(m.need&&!m.shown);}
function oldFives(){var d=0,lg=0;try{for(var k in S.daily)if(S.daily[k])d++;}catch(e){}try{lg=num(S.lg&&S.lg.n);}catch(e){}
return Math.min(CFG.cap,Math.max(d,lg,Math.floor(num(S.lv)/CFG.perLv)));}
function run(){fix();var m=S.zbM;if(!m.need||m.done||!window.ZBS)return false;var c=S.sc,f=oldFives();
c.f=Math.max(c.f,f);var n=ZBS.calc();if(n>c.c){var t=0;try{t=todayKey();}catch(e){}for(var i=c.c+1;i<=n;i++)if(!c.cd[i])c.cd[i]=t;c.c=n;}
c.sh=c.c;m.done=1;m.c=c.c;m.f=f;grant();
try{STAT.ev('zbm',{c:c.c,f:f,l:num(S.lv)});}catch(e){}try{save();}catch(e){}return true;}
var granted=null;
function grant(){var m=S.zbM;if(m.g||!m.done)return;if(!window.ZBCAB||typeof ZBCAB.grant!=='function')return;
granted=ZB.safe('cab-grant',function(){return ZBCAB.grant(m.c);});m.g=1;try{save();}catch(e){}}
function cabTxt(){var g=granted;if(g==null)return'';if(typeof g==='number')return g>0?g+' '+pl(g,'кабинет','кабинета','кабинетов')+' уже отремонтированы — по старым заслугам':'';
if(Array.isArray(g)){var L=g.map(function(x){return x&&typeof x==='object'?(x.n||x.id||''):String(x);}).filter(Boolean);
return L.length?'Отремонтировано: '+L.join(', '):'';}return typeof g==='string'?g:'';}
function face(){try{return zinaSVG('happy');}catch(e){return'👵';}}
function open(then){if(!pending()){if(then)then();return false;}run();var m=S.zbM;m.shown=1;try{save();}catch(e){}
try{if(window.RSD&&RSD.one)RSD.one('mig');}catch(e){}
var inf=ZBS.info(),cards=ZBS.cards().filter(function(x){return x.got;}).length,ct=cabTxt();try{STAT.screen('zbm');}catch(e){}
modal('<div class="sc-mig"><h2>🏫 Зина открыла школу!</h2><div class="sc-cerz">'+face()+'</div>'+
'<p>«Школу №7, где я сорок лет учила русскому, хотели закрыть: крыша течёт, в химии живёт голубь. Не дам! '+
'Ты ученик со стажем — значит, сразу в <b>'+esc(inf.short.toLowerCase())+'</b>».</p>'+
'<div class="sc-migl"><span>🎓 <b>'+esc(inf.short)+'</b> · «'+esc(inf.name)+'»</span>'+
'<span>✏️ Пятёрок в дневнике: <b>'+S.sc.f+'</b> — за прежние задания дня и заходы</span>'+
'<span>🖼 Открыток классов в музее: <b>'+cards+'</b></span>'+(ct?'<span>🔨 '+esc(ct)+'</span>':'')+
'<span>💰 Монеты, наряды, соседки, словарь, серия — всё на месте</span></div>'+
'<p class="sc-mut sc-migf">3 дела из 5 в «Сегодня у Зины» → «5» в дневник. Пятёрки ведут в следующий класс.</p>'+
'<div class="btns"><button type="button" class="btn green" id="scMgOk">За парту!</button></div></div>');
try{SND.win();}catch(e){}
$('scMgOk').onclick=function(){hideModal();try{SND.tap();}catch(e){}if(then)then();else try{ZB.refresh();}catch(e){}};return true;}
function dictVet(){try{if(typeof DEFS==='undefined'||typeof LEVELS==='undefined')return;if(!S.dict||typeof S.dict!=='object')return;
var n=Math.min(num(S.lv),LEVELS.length),k=0,i,j,L,w;for(i=0;i<n;i++){L=LEVELS[i];if(!L||!L.w)continue;for(j=0;j<L.w.length;j++){w=L.w[j]&&L.w[j][0];if(w&&DEFS[w]&&!S.dict[w]){S.dict[w]=1;k++;}}}
if(k){try{STAT.ev('rs',{a:'dict',n:k});}catch(e){}save();}}catch(e){}}
ZB.on('ready',function(){fix();
try{var m0=S.zbM,c0=S.sc;if(!m0.rv&&(m0.done||m0.b)&&num(S.lv)>=60&&window.ZBS&&ZBS.cls()===1&&c0&&c0.f<oldFives()){m0.rv=1;m0.need=1;m0.done=0;m0.shown=0;m0.g=0;}}catch(e){}
if(S.zbM.need&&!S.zbM.done)run();
dictVet();ZB.on('levels',dictVet);
if(typeof window.openLogin==='function'&&!window.openLogin.zbMig){var ol=window.openLogin;
window.openLogin=function(then){var self=this,a=arguments;if(pending())return open(function(){ol.apply(self,a);});return ol.apply(self,a);};
window.openLogin.zbMig=1;window.openLogin.zbBack=ol.zbBack;}});
function atHome(fn){ZB.on('home',fn);ZB.on('ready',function(){var m=document.querySelector('.screen.on');if(m&&(m.id==='menu'||m.id==='zb-home'))fn();});}
var t0=0;atHome(function(){if(S.zbM&&S.zbM.done&&!S.zbM.g)grant();clearTimeout(t0);t0=setTimeout(function(){
try{if($('modal').classList.contains('on'))return;if(G&&!G.won)return;}catch(e){}if(pending())open();},650);});
window.ZBMIG={pending:pending,run:run,open:open,oldFives:oldFives,fix:function(){fix();}};
})();
