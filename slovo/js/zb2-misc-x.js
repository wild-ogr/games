'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||window.ZB2M)return;
var M=window.ZB2M={v:1};
function $(id){return document.getElementById(id);}
var esc=M.esc=function(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return{'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});};
M.pl=function(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}};
M.ev=function(n,p){try{STAT.ev(n,p);}catch(e){}};
M.sv=function(){try{save();}catch(e){}};
M.tap=function(){try{SND.tap();}catch(e){}};
M.E=function(){return window.ZBECO||{};};
var ON={sport:ZB2.reg('sport',{t:'Спартакиада подъезда (неделя ловкостных против соседок)',who:'MISC'}),
diarymd:ZB2.reg('diarymd',{t:'Медали ловкостных и кубки в дневнике',who:'MISC'}),
cards20:ZB2.reg('cards20',{t:'Открытки глав из рисунков мест + альбом на «Пути»',who:'MISC'}),
deco:ZB2.reg('deco',{t:'Украшения кабинетов: гирлянда и наклейки',who:'MISC'}),
tiho:ZB2.reg('tiho',{t:'«Тихий час» — день/неделя без межэкранной (голоса)',who:'MISC',on:false}),
easy5:ZB2.reg('easy5',{t:'«Лёгкий урок» каждый 5-й с 10-го по 60-й',who:'MISC'})};
M.on=function(id){return!!ON[id]&&!ZB2.off(id);};
function isO(o){return o&&typeof o==='object'&&!Array.isArray(o);}
ZB2.field('z2m',{def:{w:0,ss:0,g:'',pw:0,pp:0,cw:0,cr:0,cu:0,pd:0,dc:{},th:0},
fix:function(z){['w','ss','pw','pp','cw','cr','cu','pd','th'].forEach(function(k){z[k]=Math.max(0,Math.round(+z[k]||0));});
if(typeof z.g!=='string'||!/^[a-z,]{0,60}$/.test(z.g))z.g='';if(!isO(z.dc))z.dc={};
for(var k in z.dc){if(!/^[a-z]{2,16}$/.test(k))delete z.dc[k];else z.dc[k]=(+z.dc[k]||0)&3;}},
merge:function(m,c){if(!isO(c))return;var cw=+c.w||0;
if(cw>(+m.w||0)){m.w=cw;m.ss=+c.ss||0;m.g=String(c.g||'');}else if(cw===+m.w)m.ss=Math.max(+m.ss||0,+c.ss||0);
if((+c.cw||0)>(+m.cw||0)){m.cw=+c.cw;m.cr=+c.cr||0;}
if((+c.pw||0)>(+m.pw||0)){m.pw=+c.pw;m.pp=+c.pp||0;}
m.cu=Math.max(+m.cu||0,+c.cu||0);m.pd=Math.max(+m.pd||0,+c.pd||0);m.th=Math.max(+m.th||0,+c.th||0);
if(!isO(m.dc))m.dc={};if(isO(c.dc))for(var k in c.dc)m.dc[k]=((+m.dc[k]||0)|(+c.dc[k]||0))&3;}});
M.z=function(){if(!isO(S.z2m))S.z2m={w:0,ss:0,g:'',pw:0,pp:0,cw:0,cr:0,cu:0,pd:0,dc:{},th:0};if(!isO(S.z2m.dc))S.z2m.dc={};return S.z2m;};
function easyLv(n){return n>=10&&n<=60&&n%5===0;}
M.easy=function(){return M.on('easy5')&&+S.lv<60&&easyLv((+S.lv||0)+1);};
if(M.on('easy5')){
ZB.on('start',function(){ZB.safe('m:easy',function(){
if(typeof G==='undefined'||!G||G.daily||G.tut||G.won||G.idx!==+S.lv||!easyLv(G.idx+1)||G.giftN)return;
if(G.words.some(function(w){return w.found;}))return;
var gift=false;G.cells.forEach(function(c){if(c.gift)gift=true;});if(gift)return;
var ws=G.words.filter(function(w){return!w.found;}).sort(function(a,b){return b.w.length-a.w.length;}),w=ws[0];if(!w)return;
var c=wordCells(w).find(function(c){return!c.open;});if(!c)return;
openCell(c,500,'cat');c.gift=true;try{saveCur();}catch(e){}
try{zina('Лёгкий урок! Одну букву я уже открыла — отдыхай, но не расслабляйся.','happy',5);}catch(e){}
M.ev('nb2',{a:'easy',l:G.idx+1});});});
var lab=function(){var pl=$('playLv');if(pl&&M.easy()&&!/лёгкий/.test(pl.textContent))pl.textContent+=' · лёгкий';};
ZB.on('home',function(){setTimeout(function(){ZB.safe('m:easylab',lab);},0);});ZB.safe('m:easylab',lab);
}
M.tihoOn=function(){return+M.z().th>Date.now();};
M.tihoGive=function(h){var z=M.z();z.th=Math.max(+z.th||0,Date.now())+h*36e5;M.sv();M.ev('tiho',{a:'give',h:h});try{payFlush();}catch(e){}};
if(M.on('tiho')&&typeof PAY_ITEMS!=='undefined'&&!(typeof PAY!=='undefined'&&PAY.own('no_ads'))){ZB.safe('m:tiho',function(){
var T=(M.E().pay||{}).tiho||{},d=T.day||{id:'tiho_d',vk:3,h:24},w=T.week||{id:'tiho_w',vk:9,h:168};
PAY_ITEMS[d.id]={vk:d.vk,ic:'🤫',name:'Тихий час: сутки',desc:'24 часа без рекламы между уровнями. Зина вяжет, Ять спит, никто не мешает',done:'Тихий час! Сутки без рекламы между уровнями',give:function(){M.tihoGive(d.h);}};
PAY_ITEMS[w.id]={vk:w.vk,ic:'😴',name:'Тихий час: неделя',desc:'7 дней без рекламы между уровнями — выгоднее, чем по дню',done:'Тихая неделя! Реклама между уровнями не потревожит',give:function(){M.tihoGive(w.h);}};
if(typeof PAY!=='undefined'&&PAY.on&&typeof VK!=='undefined'&&VK)[d.id,w.id].forEach(function(id){if(!PAY.item(id))PAY.list.push({id:id});});});}
ZB.diarySlots=ZB.diarySlots||[];
if(M.on('diarymd'))ZB.add(ZB.diarySlots,{id:'zm-md',order:50,render:function(){var R=window.ZMGREC,z=M.z(),a=[];
if(R&&R.medal&&R.ids)R.ids().forEach(function(id){var m=R.medal(id);if(m)a.push({m:m,t:(R.cf(id).nm?gName(id):id)});});
if(!a.length&&!z.cu&&!z.pd)return'';a.sort(function(x,y){return y.m-x.m;});var MD=['','🥉','🥈','🥇'];
return'<button type="button" class="zm-md"><b>Медали за ловкость</b><span>'+
(z.cu?'<i>🏆×'+z.cu+'</i>':'')+a.slice(0,8).map(function(x){return'<i>'+MD[x.m]+' '+esc(x.t)+'</i>';}).join('')+(a.length>8?'<i>…ещё '+(a.length-8)+'</i>':'')+'</span>'+
(z.cu||z.pd?'<small>Спартакиада подъезда: '+(z.cu?'кубков '+z.cu:'')+(z.cu&&z.pd?' · ':'')+(z.pd?'на пьедестале '+z.pd+' '+M.pl(z.pd,'раз','раза','раз'):'')+'</small>':'')+'</button>';},
mount:function(el){css();var b=el.querySelector('.zm-md');if(b)b.onclick=function(){M.tap();if(window.ZMGREC&&ZB._scr.rec)ZB.go('rec');};}});
function gName(id){try{var i=ZMG.info(id);if(i)return i.t;}catch(e){}return id;}
M.gName=gName;
if(M.on('diarymd')&&window.ZMGREC&&S.z2r&&Object.keys(S.z2r.r||{}).length)ZMGREC.load().catch(function(){});
function css(){if($('zm-css'))return;var s=document.createElement('style');s.id='zm-css';s.textContent=
'.zm-md{display:block;width:100%;box-sizing:border-box;border:0;border-radius:14px;margin:8px 0;padding:8px 12px;background:#fff8e1;box-shadow:0 2px 0 #f0d58a;font:inherit;color:inherit;text-align:left;cursor:pointer}'+
'.zm-md b{display:block;font-size:15px}.zm-md span{display:flex;flex-wrap:wrap;gap:4px 10px;margin:4px 0;font-size:14px}.zm-md i{font-style:normal;white-space:nowrap}.zm-md small{display:block;opacity:.75;font-size:13px}'+
'.zm-dl{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:2}.zm-gir{position:absolute;left:0;top:0;width:100%;height:28%}'+
'.zm-gir .b{animation:zmBl 1.6s ease-in-out infinite}.zm-gir .b:nth-child(3n){animation-delay:.5s}.zm-gir .b:nth-child(3n+1){animation-delay:1s}'+
'@keyframes zmBl{0%,100%{opacity:1}50%{opacity:.45}}@media (prefers-reduced-motion:reduce){.zm-gir .b{animation:none}}'+
'.zm-st{position:absolute;font-size:clamp(18px,6vw,30px);line-height:1;background:#fff;border-radius:30%;padding:4px;box-shadow:0 2px 3px rgba(0,0,0,.25)}'+
'.zm-deco{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 8px}.zm-deco .btn{flex:1 1 130px;min-height:44px;font-size:14px;padding-left:6px;padding-right:6px;white-space:nowrap}.zm-deco small{flex:1 1 100%;opacity:.7;font-size:13px;text-align:center}'+
'.zm-alb{display:flex;flex-direction:column;height:100%;max-width:720px;margin:0 auto}.zm-hd{display:flex;align-items:center;gap:8px;padding:8px 12px}.zm-hd h2{margin:0;font-size:20px}'+
'.zm-grid{flex:1;overflow:auto;padding:0 12px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;align-content:start;grid-auto-rows:max-content}'+
'.zm-pc{position:relative;display:block;height:auto;border:0;padding:0;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 2px 0 #e2dccb;font:inherit;color:inherit;cursor:pointer;text-align:center}'+
'.zm-pc .a{position:relative;aspect-ratio:4/3;background:#e8eef7;overflow:hidden}@supports not (aspect-ratio:4/3){.zm-pc .a{height:112px}}.zm-pc .a svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}.zm-pc b{display:block;font-size:14px;padding:4px 6px 6px}'+
'.zm-pc.no{cursor:default}.zm-pc.no .a{filter:grayscale(1) blur(2px);opacity:.45}.zm-pc.no b{opacity:.55}.zm-pc .n{position:absolute;left:6px;top:6px;background:#fff;border-radius:8px;padding:0 6px;font-size:12px;font-weight:700}'+
'.zm-path{display:block;width:calc(100% - 24px);max-width:520px;margin:10px auto;border:0;border-radius:14px;padding:10px 14px;background:#fff;box-shadow:0 3px 0 #ddd3bd;font:inherit;color:inherit;text-align:left;cursor:pointer}'+
'.zm-path b{font-size:15px}.zm-path small{display:block;opacity:.7;font-size:13px}';
document.head.appendChild(s);}
M.css=css;
M.parts={};
if(M.on('cards20'))ZB.load('js/zb2-misc-cards.js').catch(function(){});
if(M.on('deco'))ZB.load('js/zb2-misc-deco.js').catch(function(){});
if(M.on('sport')&&window.ZMGREC)ZMGREC.load().then(function(){return ZB.load('js/zb2-sport.js');}).catch(function(){});
ZB.safe('m:refresh',function(){var on=document.querySelector('.screen.on');if(on&&(on.id==='menu'||on.id==='zb-home'))ZB.refresh();});
})();
