'use strict';
const NB={upto:25,coachS:20,coachMiss:2,stuckS:40,catS:60};
const hfFree=()=>!!G&&!G.daily&&!G.tut&&!S.tip.hf&&S.lv<NB.upto&&G.idx>=2;
const nbNew=()=>!!G&&!G.daily&&!G.tut&&G.idx>=2&&G.idx<NB.upto&&S.lv<NB.upto;
(function(){const s=document.createElement('style');s.textContent=
'#hLet.coach{animation:nbp 1.1s ease-in-out infinite}'+
'@keyframes nbp{50%{box-shadow:0 0 0 8px rgba(255,138,61,.6),0 4px 0 var(--edge)}}'+
'html.th-x #hLet.coach{animation:nbo 1.1s ease-in-out infinite;outline:6px solid rgba(255,138,61,0);outline-offset:2px}@keyframes nbo{50%{outline-color:rgba(255,138,61,.65)}}'+
'.hcoach{position:absolute;right:calc(100% + 10px);bottom:-24px;background:#c2410c;color:#fff;font-size:14px;font-weight:800;line-height:1.2;'+
'padding:7px 10px;border-radius:12px;white-space:nowrap;pointer-events:none;box-shadow:0 3px 8px rgba(0,0,0,.22);z-index:4;animation:nbin .3s ease-out both}'+
'.hcoach::after{content:"";position:absolute;left:100%;top:6px;border:7px solid transparent;border-left-color:#c2410c}'+
'@keyframes nbin{from{opacity:0;transform:translateX(10px)}}'+
'.mcard .retp{font-weight:800;color:var(--ink);font-size:16.5px;margin-bottom:4px}'+
'@media (prefers-reduced-motion:reduce){#hLet.coach{animation:none;box-shadow:0 0 0 5px rgba(255,138,61,.6),0 4px 0 var(--edge)}html.th-x #hLet.coach{outline-color:rgba(255,138,61,.65)}.hcoach{animation:none}}';
document.head.appendChild(s);})();
function coachOff(){const b=$('hLet');if(!b)return;b.classList.remove('coach');const t=b.querySelector('.hcoach');if(t)t.remove();}
function coachOn(tag){const b=$('hLet');coachOff();b.classList.add('coach');
if(tag){const t=document.createElement('span');t.className='hcoach';t.textContent=tag;b.appendChild(t);
setTimeout(()=>{if(t.parentNode)t.remove();},12000);}}
function hintLesson(why){if(S.tip.hl||!hfFree())return;S.tip.hl=1;save();
zina(pick(['Застрял? Жми 💡 — первая подсказка даром!','Не идёт слово? Нажми 💡 — первую букву отдам даром!']),'happy',8);
coachOn('Жми — первая даром!');STAT.ev('hint1',{s:'show',l:G.idx+1,w:why});}
function hfTake(open){if(!hfFree())return typeof ZBNB!=='undefined'&&ZBNB.zeroTake?ZBNB.zeroTake(open):false;
STAT.ev('hint1',{s:'take',l:G.idx+1,t:G.nw||0});
open('Первая — даром, как обещала! Дальше раз в день Ять букву принесёт, а остальное — за монетки.',1);return true;}
setInterval(()=>{if(!G||G.won||G.daily||G.tut||paused||document.hidden||!$('game').classList.contains('on')||$('modal').classList.contains('on'))return;
const f=G.words.filter(w=>w.found).length;
if(G.nbG!==G){G.nbG=G;G.nbF=f;G.nw=0;G.nbS=0;}
if(f!==G.nbF){G.nbF=f;G.nw=0;if(G.nbS)coachOff();G.nbS=0;return;}
G.nw=(G.nw||0)+1;
if(G.idx>=2&&G.idx<=4&&!S.tip.hl&&hfFree()&&(G.nw>=(G.idx===4?6:NB.coachS)||G.miss>=NB.coachMiss)){hintLesson(G.nw>=NB.coachS?'idle':G.miss>=NB.coachMiss?'miss':'l5');return;}
const zb=typeof ZBNB!=='undefined'&&ZBNB.on,fast=zb&&ZBNB.fast(),zd=zb&&ZBNB.zeroDue();
const rp=typeof ZB2N!=='undefined'&&ZB2N.ramp?ZB2N.ramp():null;
if(rp){if(G.nw===rp.b&&!G.nbS){G.nbS=1;coachOn(hfFree()?'Жми — первая даром!':zd?'Жми — даром!':'');if(!$('zSay').classList.contains('pin'))zina(pick(['Застрял? Подсказка 💡 — справа внизу.','Не стесняйся — жми 💡, открою букву.']),'norm',6);STAT.ev('stk',{l:G.idx+1,a:'blink'});}
else if(G.nw>=rp.c&&(G.nbC||0)<rp.n){G.catD=0;if(catHelp(false,true)){G.nbC=(G.nbC||0)+1;G.nw=0;G.nbS=0;coachOff();STAT.ev('stk',{l:G.idx+1,a:'cat',n:G.nbC});}}
return;}
if(!nbNew()){if(zd&&G.nw===60&&!G.nbS){G.nbS=1;coachOn('Жми — даром!');zina('Монеток маловато? Жми 💡 — эту букву подарю.','norm',6);STAT.ev('stk',{l:G.idx+1,a:'zero'});}return;}
if(fast){if(G.nw===25&&!G.nbS){G.nbS=1;coachOn(hfFree()?'Жми — первая даром!':zd?'Жми — даром!':'');STAT.ev('stk',{l:G.idx+1,a:'blink'});}
else if(G.nw>=40&&(G.nbC||0)<3){G.catD=0;if(catHelp(false,true)){G.nbC=(G.nbC||0)+1;G.nw=0;G.nbS=0;coachOff();STAT.ev('stk',{l:G.idx+1,a:'cat',n:G.nbC});}}
return;}
if(G.nw===NB.stuckS&&!G.nbS){G.nbS=1;coachOn(hfFree()?'Жми — первая даром!':'');
if(!$('zSay').classList.contains('pin'))zina(hfFree()?'Застрял? Жми 💡 — первая подсказка даром!':pick(['Застрял? Подсказка 💡 — справа внизу.','Не стесняйся — жми 💡, открою букву.']),'norm',6);
STAT.ev('stk',{l:G.idx+1,a:'blink'});}
else if(G.nw===NB.catS&&catHelp(false,true))STAT.ev('stk',{l:G.idx+1,a:'cat'});
},1000);
document.addEventListener('DOMContentLoaded',()=>{['hLet','hWord'].forEach(id=>{const b=$(id);if(b)b.addEventListener('click',coachOff);});});
let retArm=false,retSeen=false,retGo=false;
function retDue(){if(SHOT||S.lv<LOGIN_FROM||retSeen)return false;const tk=todayKey();
if(S.lg&&+S.lg.d>0&&+S.lg.d<tk)retArm=true;
return retArm&&!S.daily[tk]&&+S.tip.rc!==tk;}
function retCard(){if(!retDue()||!$('menu').classList.contains('on')||$('modal').classList.contains('on'))return;
retSeen=true;S.tip.rc=todayKey();if(!S.tip.dly)S.tip.dly=1;save();
const alive=S.lastDaily===dayKey(1),sk=alive?S.streak||0:0;
STAT.ev('ret',{a:'show',sk,l:S.lv,mx:S.lastDaily===dayKey(2)?1:0});
openDaily('ret');}
function retPick(go){retGo=!!go;STAT.ev('ret',{a:go?'go':'later'});}
const askHold=g=>!g.daily&&retGo&&!S.daily[todayKey()];
let nbNoInt=0;
function nbAsk(g){if(!g.daily&&typeof ZBNB!=='undefined'&&ZBNB.cur&&!ZBNB.turn('ask'))return null;
const a=pickAsk(!!g.daily);if(!a||!g.daily)return a;nbNoInt=Date.now();STAT.ev('dask',{k:a.k,r:'show',sk:S.streak||0});const run=a.run;
a.run=()=>run().then(ok=>{STAT.ev('dask',{k:a.k,r:ok?'ok':'no'});return ok;},e=>{STAT.ev('dask',{k:a.k,r:'err'});throw e;});return a;}
{const mi=maybeInterstitial;maybeInterstitial=function(cb){if(nbNoInt&&Date.now()-nbNoInt<300000){nbNoInt=0;cb();return;}nbNoInt=0;return mi.apply(this,arguments);};}
{const fw=fitWin;fitWin=function(){fw.apply(this,arguments);const m=$('mcard'),w=m&&m.firstElementChild;if(!w)return;
const cs=getComputedStyle(m),pad=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0),fits=()=>w.offsetHeight+pad<=m.clientHeight+1;
const tm=[...w.querySelectorAll(':scope > p')].find(p=>/^Завтра:/.test(p.textContent.trim()));
for(const e of[w.querySelector(':scope > .week'),tm,w.querySelector(':scope > .stamp')]){if(fits())break;if(e)e.style.display='none';}};}
