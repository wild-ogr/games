/* b2-nedra.js — NEDRA «Магнат 2.0»: «Недра» живее (N4 П1–П5), «деньги без дела» конкретными делами, кандидаты карточки цели.
   Стартовый файл (≤ 8 КБ): флаг, договор B2.nedra (для KRAI/HOME — logs/NEDRA.md «ДОГОВОР NEDRA→KRAI»), обёртки ECON.nedDay/nedClose/advise/nedMig.
   Модель — js/b2-nedra-m.js (честная окупаемость, советы, события, доразведка, выкуп рудника), вид — js/b2-nedra-ui.js; обе грузятся по требованию
   (в jsc-симуляторах — сразу). nedra.js/nedra-ui.js не правятся: econ.js зовёт хуки через объект ECON, тексты событий — window.NEDTXT.
   Мир: W.b2.nedra {v: версия поправки рынка, r: своя случайность, dz:{oid:мес}, …}. Устройство: S.b2n. Флаг: B2.off.nedra. */
(function(root){'use strict';
B2.off.nedra=0;          // 1 — выключено по умолчанию
if(B2.off('nedra'))return;
if(Array.isArray(root.B2_OFF)&&root.B2_OFF.indexOf('nedra')>=0)return;   // jsc: опыты «как main» (NEDRA-tools/ned.sh OFF=1)
const E=root.ECON;if(!E||!E._)return;
const HAS_DOM=typeof document!=='undefined';
/* настройки «Недр» (край №1 = нынешние «Недра»). KRAI меняет через B2.nedra.tune(fn) — ключи в logs/NEDRA.md */
const NK={ev:{},up:30,pb:36,idle:6,dz:{on:1,k:2,add:[.35,.6],dk:1.3,dp:.6},buy:{on:1,k:1.05},
  V:{steel:2.5,roll:2.5,wire:3,pig:2.5,cucon:1.5,cu:1.5},P0:{steel:.04,roll:.03,wire:.07,pig:.04,cucon:.03,cu:.03}};
if(!HAS_DOM&&root.NEDRA_NK)for(const k in root.NEDRA_NK)NK[k]=root.NEDRA_NK[k];   // jsc: опыты (NEDRA-tools)
const tunes=[],hooks={day:[],close:[],adv:[]},evx={},evt={};
function cfg(W){if(!tunes.length)return NK;const o=Object.assign({},NK);for(const f of tunes){let x=null;try{x=f(W);}catch(e){}if(x&&typeof x==='object')for(const k in x)o[k]=(x[k]&&typeof x[k]==='object'&&!Array.isArray(x[k])&&NK[k]&&typeof NK[k]==='object')?Object.assign({},NK[k],x[k]):x[k];}return o;}
const N={NK,cfg,v:1,M:null,
  tune(fn){if(typeof fn==='function')tunes.push(fn);},
  hook(k,fn){if(hooks[k]&&typeof fn==='function')hooks[k].push(fn);},
  addEv(k,d){evx[k]=d;if(N.M)N.M.addEv(k,d);},
  evText(k,t){evt[k]=t;if(N.UI)N.UI.evText(k,t);},
  evx,evt,hooks,
  // наружу (HOME, KRAI): модель ещё не загружена — пусто
  fore:(W,t,r,o)=>N.M?N.M.fore(W,t,r,o):null,
  deals:(W,n)=>N.M&&W&&W.ned?N.M.deals(W,n):[],
  idle:W=>N.M&&W&&W.ned?N.M.idle(W):null};
B2.nedra=N;
const run=(k,...a)=>{for(const f of hooks[k])try{f(...a);}catch(e){try{console.error('b2-nedra hook',k,e);}catch(x){}}};
/* загрузка модели и вида: в игре — когда мир в «Недрах»; в jsc — сразу */
let want=false;
function need(){if(want)return;want=true;
  B2.need('b2-nedra-m.js').then(()=>{if(HAS_DOM&&root.UI)return B2.need('b2-nedra-ui.js');}).catch(()=>{want=false;});}
if(!HAS_DOM)need();
/* поправка рынка передела (П1/П2): ёмкость V больше — свой завод меньше сбивает цену; спрос p0 чуть выше. Раз на мир «Недр» (W.n5). */
function mkFix(W,o){if(!W||!W.n5||!W.mk||o.v>=1)return;const K=cfg(W);
  for(const g in K.V){const M=W.mk[g];if(!M||!M.V)continue;const k=K.V[g]||1;M.V*=k;M.p0=(M.p0||0)/k+((K.P0&&K.P0[g])||0);}o.v=1;}
B2.mig('nedra',(W,o)=>{if(W&&W.ned)mkFix(W,o);});
/* обёртки хуков econ.js (econ зовёт root.ECON.nedDay/nedClose — подменяем свойство) */
const d0=E.nedDay,c0=E.nedClose,m0=E.nedMig,a0=E.advise;
if(d0)E.nedDay=function(W,off,out){const r=d0.apply(this,arguments);if(W&&W.ned&&!B2.off('nedra')){need();const o=B2.w(W,'nedra');if(!o.v)mkFix(W,o);if(N.M)N.M.day(W,off,out);run('day',W,off);}return r;};
if(c0)E.nedClose=function(W,M,off){const r=c0.apply(this,arguments);if(W&&W.ned&&!B2.off('nedra')){if(N.M)N.M.close(W,M,off);run('close',W,M,off);}return r;};
if(a0)E.advise=function(W){const l=a0.apply(this,arguments);if(!W||!W.ned||!W.n5||B2.off('nedra'))return l;need();if(N.M)try{N.M.adv(W,l);}catch(e){try{console.error('b2-nedra adv',e);}catch(x){}}run('adv',W,l);return l;};
// честная маржа для старых вызовов (sim.js chainsF, события): E.nedMargin(W,t,r,vc) → с падением цены своей продукции
const nm0=E.nedMargin;if(nm0)E.nedMargin=function(W,t,r,vc){if(N.M&&W&&W.n5&&!B2.off('nedra')){const f=N.M.fore(W,t,r,{vc});if(f)return f.m;}return nm0.apply(this,arguments);};
if(HAS_DOM){B2.on('ready',()=>{const W=root.GAME&&GAME.W;if(W&&W.ned)need();});if(root.GAME&&GAME.on)GAME.on('nedra',need);}
/* бот симулятора (tools/sim.js smart, крючок b2-nedra): «живой игрок» слушает новые советы — модернизация, доразведка, выкуп */
E.b2bot=function(W,st){if(root.NEDRA_NOBOT)return;if(N.M&&W&&W.ned&&W.n5&&!B2.off('nedra'))try{N.M.bot(W,st);}catch(e){}};
})(typeof window!=='undefined'?window:this);
