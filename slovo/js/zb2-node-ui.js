'use strict';
(function(){
var X=ZB.mgr;if(!X)return;var Z=X.Z,M=X.M,$=function(id){return document.getElementById(id);},esc=function(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return{'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});};
function ev(n,p){try{STAT.ev(n,p);}catch(e){}}
function tap(){try{SND.tap();}catch(e){}}
function curG(){return typeof G!=='undefined'?G:null;}
function card(g,id){if(curG()!==g||g.won)return;var m=M(),i=m.info(id),gm=m.REG.by[id];if(!i)return;
if($('modal').classList.contains('on'))hideModal();ev('node',{a:'show',id:id,l:g.idx+1});
modal('<div class="zr-nd"><div class="zr-ndb">🔔</div><h2>Перемена!</h2>'+m.say(i.who,'Уровень '+(g.idx+1)+' — это игра: <b>'+esc(i.t)+'</b>. '+esc(String((gm&&gm.a)||i.a||'').replace(/[.!?…]+$/,''))+'. Выиграешь — урок засчитан, монеты как за уровень.','happy')+
'<div class="btns"><button class="btn green" id="zrNdGo">'+i.ic+' Играть · '+i.s+' с</button><button class="btn ghost small" id="zrNdNo">Хочу обычный уровень</button></div></div>');
$('zrNdGo').onclick=function(){tap();hideModal();go(g,id);};
$('zrNdNo').onclick=function(){tap();hideModal();var z=Z();z.sk=g.idx;g.zrNode='';save();ev('node',{a:'skip',id:id,l:g.idx+1});
try{zina('Хорошо, решаем кроссворд. Перемена подождёт!','happy',4);}catch(e){}};}
function go(g,id){ev('node',{a:'go',id:id,l:g.idx+1});var done=false;
var fin=function(res){if(done)return;if(res&&res.tier>=1){done=true;win(g,id,res);}
else if(res){ev('node',{a:'lose',id:id,l:g.idx+1});try{zina('Не беда! Можно ещё раз — или решить кроссворд.','happy',5);}catch(e){}}};
M().open(id,{mode:'node',ctx:{idx:g.idx},next:{t:'Дальше ▶',f:function(res){if(res&&res.tier>=1)fin(res);else if(curG()===g&&!g.won){ev('node',{a:'lose',id:id,l:g.idx+1});card(g,id);}}},back:fin});}
function win(g,id,res){if(curG()!==g||g.won)return;var z=Z();z.r++;z.k=X.kindOf(id);z.ni=-1;z.ng='';z.sk=-1;ev('node',{a:'win',id:id,l:g.idx+1,st:res.tier});
var n=0;g.words.forEach(function(wd){if(wd.found)return;wd.found=true;try{collectDef(wd.w);}catch(e){}
wordCells(wd).forEach(function(c){if(c&&!c.open)openCell(c,(n++)*25,'hint');});});
try{updCount();}catch(e){}save();setTimeout(function(){if(curG()===g&&!g.won)checkWin();},Math.min(900,n*25+150));}
function count(c,next0){var n=3,done=false,t=0,gone=false,next=function(){if(gone)return;gone=true;next0();};ev('auto',{id:'najdi',a:'show',c:c+1});
var d=document.createElement('div');d.className='zr-cd';d.innerHTML='<div class="zr-cdp"><div class="zr-cdc">'+(typeof catSVG==='function'?catSVG():'🐈')+'</div>'+
'<h2>Ять потерялся на экскурсии!</h2><p>Найди кота и вещи по списку.</p><b class="zr-cdn">3</b><div class="btns"><button class="btn green" id="zrCdGo">🔍 Искать сейчас</button><button class="btn ghost small" id="zrCdNo">Потом</button></div></div>';
document.body.appendChild(d);
var end=function(go){if(done)return;done=true;clearInterval(t);d.remove();window.removeEventListener('keydown',kd,true);
if(!go){ev('auto',{id:'najdi',a:'later',c:c+1});next();return;}
ev('auto',{id:'najdi',a:'go',c:c+1});M().open('najdi',{mode:'auto',ctx:{c:c},back:next,next:{t:'Дальше ▶',f:next}}).then(function(h){if(!h)next();},next);};
var kd=function(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();end(false);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();end(true);}};
$('zrCdGo').onclick=function(){tap();end(true);};$('zrCdNo').onclick=function(){tap();end(false);};window.addEventListener('keydown',kd,true);
t=setInterval(function(){n--;var e=d.querySelector('.zr-cdn');if(e)e.textContent=n>0?n:'🔍';if(n<=0)end(true);},1000);}
var st=document.createElement('style');st.textContent=
'.zr-nd{text-align:center}.zr-ndb{font-size:44px;line-height:1;animation:zrbell 1s ease-in-out 2}.zr-nd .zmg-say{text-align:left;margin:8px 0 12px}'+
'@keyframes zrbell{25%{transform:rotate(-14deg)}75%{transform:rotate(14deg)}}'+
'.zr-cd{position:fixed;left:0;top:0;right:0;bottom:0;z-index:31;display:flex;align-items:center;justify-content:center;background:rgba(30,35,50,.55);padding:16px}'+
'.zr-cdp{background:var(--card,#fff);border-radius:20px;padding:16px 16px 12px;max-width:340px;width:100%;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.3)}'+
'.zr-cdc{width:96px;height:96px;margin:0 auto}.zr-cdc svg{width:100%;height:100%}.zr-cdp h2{margin:6px 0 2px;font-size:21px}.zr-cdp p{margin:0 0 4px;color:var(--ink2,#5b6475)}'+
'.zr-cdp .btns{flex-direction:column;align-items:stretch}.zr-cdn{display:block;font-size:46px;line-height:1.1;color:#e8661b;animation:zrcd 1s ease-in-out infinite}@keyframes zrcd{50%{transform:scale(1.2)}}'+
'@media (prefers-reduced-motion:reduce){.zr-ndb,.zr-cdn{animation:none}}';
document.head.appendChild(st);
window.ZBNODEUI={card:card,count:count};
})();
