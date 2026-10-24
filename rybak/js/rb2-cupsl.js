/* ================= BK-RB 24.10 — автовход в живую лигу (как «Слава недели» Обороны v4.4) =================
   Журнал: hobby-analytics/release-i/backlog-2410/BK-RB.md (п.7). Почему: в живую лигу попадали только сдав турнир по путёвке
   («Турниры» → «Живая лига») — ~7 из ~90 заходов в день. Оборона сдаёт Славу недели сама — там 90 % сеансов в лиге.
   Что: каждая законченная ОБЫЧНАЯ рыбалка (не турнир, не путёвка лиги, не гости, не демо) даёт очки лиги: 10 + кг улова (до 20 за рыбалку).
   Очки недели — S.cup.sl {w — неделя МСК (год·100 + ISO-неделя, как на сервере), v}; потолок — 120 за начатый день недели и 840 за неделю
   (тот же pace, что у турнира 'sl' на сервере: games/rybak.py). После рыбалки (и при входе, если не отправлено) — тихо CUP.ticket('sl') →
   CUP.submit: первая же сдача сама ставит игрока в группу лиги; турниры по путёвке дают очки, как раньше, — они складываются.
   S.cup.sv {w, v} — что уже принял сервер. Один раз — тост «Ты в живой лиге». Только где cupOn() и не ОК; ?off=cupsl — выключить.
   Статистика: mod {m:'cupsl', a: in|sub|no}. Синтаксис — старый (как rb2-*). */
(function(){
'use strict';
if(typeof R2!=='object'||typeof CUP!=='object'||typeof cupOn!=='function')return;
var PACE=120,MAXW=840,tk=null,busy=false,dead=false; // dead — сервер без турнира 'sl' (старая функция): в этом сеансе больше не спрашиваем
R2.reg('cupsl',{s:'BK-RB',t:'автовход в живую лигу: очки за обычные рыбалки недели сдаются сами'});
function st(a,k){try{STAT.ev('mod',{m:'cupsl',a:a,k:k});}catch(e){}}
function msk(){return new Date(nowMs()+3*3600e3);}
// неделя МСК как week_key сервера (ISO: год недели·100 + номер) и номер дня недели (пн = 1 … вс = 7)
function wk(){var d=msk(),t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),dw=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-dw);
  var y=t.getUTCFullYear(),n=Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7);return y*100+n;}
function dow(){return msk().getUTCDay()||7;}
function on(){try{return !R2.off('cupsl')&&cupOn()&&!OK&&!window.__demo;}catch(e){return false;}}
function cs(){return cupSave();}
function cur(){var c=cs(),w=wk();if(!isObj(c.sl)||c.sl.w!==w)c.sl={w:w,v:0};return c.sl;}
function pts(g){var kg=0;(g.catch||[]).forEach(function(c){if(c&&!c.lost&&c.w>0)kg+=c.w;});return 10+Math.min(10,Math.round(kg));}
function tkOk(t){return t&&t.t&&t.got&&Date.now()-t.got<(t.exp||0)*1000-60e3&&t.wk0===wk();}
// сдать очки недели, если сервер знает меньше (или игрок ещё не в группе этой недели)
function send(){if(busy||dead||!on())return;var s=cur(),sv=isObj(cs().sv)&&cs().sv.w===s.w?cs().sv:null;
  if(!(s.v>0)||(sv&&sv.v>=s.v))return;busy=true;
  var go=function(t){if(!t||t.no||!t.t){busy=false;if(t&&(t.why==='mode'||t.no==='mode'))dead=true;return;}t.wk0=t.wk0||wk();
    CUP.submit(t,s.v,{next:true},function(r){busy=false;
      if(!r){st('no','net');return;}if(r.no){st('no',r.no);return;}
      var c=cs();c.sv={w:s.w,v:Math.max(s.v,sv?sv.v:0)};tk=r.next&&r.next.t?r.next:null;if(tk){tk.got=tk.got||Date.now();tk.wk0=s.w;}
      if(r.lg&&CUP.me()&&CUP.me().wk){if(!c.jw){try{STAT.ev('lg',{a:'in',t:r.lg.tr||0});}catch(e){}}
        if((c.jw||0)<CUP.me().wk)c.jw=CUP.me().wk;if(r.lg.tr>=0)c.tr=r.lg.tr;
        if(!c.slt){c.slt=1;st('in');setTimeout(function(){try{toast('🌐 '+L('Ты в Живой лиге! Очки идут за каждую рыбалку — таблица в «Турнирах»','You\'re in the Live league! Every fishing trip earns points — see «Contests»'),4500);}catch(e){}},600);}}
      st('sub');save();});};
  if(tkOk(tk)){var t=tk;tk=null;go(t);}else CUP.ticket('sl',function(t){if(t&&t.t){t.got=t.got||Date.now();t.wk0=wk();}go(t);});}
R2.on('end',function(g){if(!g||g.tourn||g.cup||g.guest||window.__demo)return;
  var s=cur();s.v=Math.min(MAXW,PACE*dow(),s.v+pts(g));save();
  if(on())setTimeout(send,1500);},'cupsl');
// при входе: если что-то не отправлено (не было связи) — когда карта на экране и окон нет
(function(){var n=0,tm=setInterval(function(){if(++n>90){clearInterval(tm);return;}
  try{if(window.__sdkDone&&!G&&!modalOn&&$('scr-map').classList.contains('on')){clearInterval(tm);if(on())send();}}catch(e){clearInterval(tm);}},2000);})();
window.cupSlSend=send; // для стенда
})();
