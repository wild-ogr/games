/* Рыбалка с Петровичем — мини-игры на пути игрока (upd0910, решение владельца 09.10: в мини-игры двора играет 23 % игроков,
   в Богатыре, где забава стоит строкой в «Делах на сегодня», — 64 %). Двор Петровича не меняется. Образцы: Богатырь «Забавы» в «Делах»,
   Викторина «Переменка»/«Затея дня» (viktorina/js/vmg-board.js).
   1) «Мини-игра дня» — строка в «Целях» (вкладка «День», гнездо dailySlots, id 'mg_delo' — заменяет прежнюю строку «Дело дня во дворе»):
      есть «Дело дня» Двора (MG.deloState) — оно и есть игра дня; иначе одна из открытых игр kind 'daily' по кругу (своя на день, S.mg.md).
      Одно нажатие — сразу игра (src 'day'), после неё — обратно в «Цели».
   2) «Перекур» — плашка в итогах рыбалки (гнездо resultSlots): раз в 3–4 рыбалки, если есть игра с наградой на сегодня (MG.leftToday)
      и дневной потолок мини-игр не выбран; не в турнире/«в гостях», не вместе с «Ухой». Кнопки «Сыграть» и «Не сейчас»; два «Не сейчас»
      подряд — дальше раз в 6–7 рыбалок. Игра идёт поверх итогов (src 'win'), окно итогов остаётся.
   Награды — обычные (MG_RW, общий дневной потолок CAP в оболочке), новых наград нет.
   STAT: mg {a:'show', id, src} — предложили (раз за окно/сеанс); mg {a:'no', id, src:'win'} — «Не сейчас»; заходы/итоги — поле src в событиях оболочки. */
(function(){
'use strict';
var W=window;if(!W.MG||!W.MG.play||typeof slotAdd!=='function')return;
var M=W.MG;
function st(o){try{STAT.ev('mg',o);}catch(e){}}
function nm(id){var m=M.by[id];return m?L(m.n[0],m.n[1]):id;}
function dayOrd(k){return Math.floor(Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5);}
function room(){try{return Math.max(0,W.MG_RW.CAP-(M.day().dv||0));}catch(e){return 0;}}
function maxC(id){var r=M.rw(id)||{};return (r.c?r.c[3]:0)+(r.per?r.per*5:0)+(r.full||0);}
function rwTxt(id){var v=Math.min(maxC(id),room());var c=Math.round(v*M.R());return c>0?L('до +','up to +')+coinsTxt(c):'';}
function daily(){var o=[];M.list.forEach(function(m){var g=M.reg[m.id];if(g&&g.kind==='daily'&&M.isOpen(m.id))o.push(m.id);});return o;}
var CSS='.mgp{display:flex;align-items:center;gap:10px;justify-content:space-between;padding:8px 10px;border-radius:14px;background:var(--in,rgba(255,255,255,.08));border:1px dashed var(--inB,rgba(255,255,255,.3));text-align:left;font-size:17px;line-height:1.25}'+
 '.mgp>span{flex:1;min-width:0}.mgp small{display:block;font-size:17px;color:var(--tx3,rgba(255,255,255,.7))}.mgp .btn{flex:none;margin:0;min-height:48px}.mgp.done{opacity:.8}'+
 '.mgp .mgpb{display:flex;gap:8px;flex:none}.mgp.win{border-style:solid;border-color:rgba(255,207,122,.55)}'+
 '.mgp.win{flex-wrap:wrap}.mgp.win>span:first-child{flex:1 1 100%}.mgp.win .mgpb{width:100%}.mgp.win .mgpb .btn{flex:1}';
function css(){if(document.getElementById('mgpCss'))return;var s=document.createElement('style');s.id='mgpCss';s.textContent=CSS;document.head.appendChild(s);}

/* ---------- 1) мини-игра дня ---------- */
function dayPick(){if(!M.dvorOpen())return null;var d=M.deloState();
  if(d)return {id:d.id,delo:true,done:!!d.n};
  var m=M.day(),ids=daily();if(!ids.length)return null;
  var id=m.md&&m.mdk===m.d&&ids.indexOf(m.md)>=0?m.md:ids[dayOrd(m.d||0)%ids.length]; // своя на день (md + день mdk)
  if(m.md!==id||m.mdk!==m.d){m.md=id;m.mdk=m.d;try{save();}catch(e){}}
  return {id:id,delo:false,done:M.playsToday(id)>0};}
var dayShown=0;
function dayPlay(p){try{hideModal();}catch(e){}
  M.play(p.id,{delo:p.delo,src:'day',noBack:true,back:function(){try{if(typeof openDaily==='function')openDaily('d');}catch(e){}}});}
slotAdd(dailySlots,{id:'mg_delo',pri:40,when:function(){return !!dayPick();},
  html:function(){css();var p=dayPick(),r=p.done?'':rwTxt(p.id);
    if(!p.done&&!dayShown){dayShown=1;st({a:'show',id:p.id,src:'day'});}
    return '<div class="mgp'+(p.done?' done':'')+'"><span>'+(p.done?'✓ ':'🎲 ')+(p.delo?L('Дело дня: ','Task of the day: '):L('Мини-игра дня: ','Mini-game of the day: '))+'<b>'+esc(nm(p.id))+'</b>'+
      '<small>'+(p.done?L('сыграно — завтра будет другая','done — a new one tomorrow'):L('необязательно','optional')+(r?' · '+r:''))+'</small></span>'+
      (p.done?'':'<button type="button" class="btn green noenter" data-a="go">▶ '+L('Играть','Play')+'</button>')+'</div>';},
  bind:function(e){var b=e.querySelector('[data-a=go]');if(b)b.onclick=function(){try{SND.tap();}catch(x){}var p=dayPick();if(p)dayPlay(p);};}});

/* ---------- 2) «Перекур» в итогах рыбалки ---------- */
function tips(){if(!S.tips||typeof S.tips!=='object')S.tips={};return S.tips;}
function gap(){var t=tips();return ((t.pkNo|0)>=2?6:3)+((+S.sessions||0)%2);} // 3–4 рыбалки; после двух «Не сейчас» подряд — 6–7
function winPick(g){if(!g||g.tourn||g.guest||g.quit||!M.dvorOpen())return '';
  if(g._pk!==undefined)return g._pk;g._pk='';
  var n=+S.sessions||0,t=tips();if(n<4||n-(t.pkL|0)<gap())return '';
  if(room()<.05)return '';
  try{var u=(W.resultSlots||[]).find(function(x){return x.id==='uha';});if(u&&u.when&&u.when({g:g}))return '';}catch(e){}
  var ids=daily().filter(function(id){return M.leftToday(id)>0;});if(!ids.length)return '';
  g._pk=ids[Math.floor(n/3)%ids.length];t.pkL=n;try{save();}catch(e){}st({a:'show',id:g._pk,src:'win'});return g._pk;}
slotAdd(resultSlots,{id:'mg_perekur',pri:30,ad:true,when:function(c){return !!winPick(c&&c.g);},
  html:function(c){css();var id=c.g._pk,r=rwTxt(id);
    return '<div class="mgp win"><span>☕ '+L('Перекур: сыграть в','Take a break: play')+' <b>«'+esc(nm(id))+'»</b>?<small>'+L('пара минут, без спешки','a couple of minutes')+(r?' · '+r:'')+'</small></span>'+
      '<span class="mgpb"><button type="button" class="btn green noenter" data-a="go">▶ '+L('Сыграть','Play')+'</button><button type="button" class="btn noenter" data-a="no">'+L('Не сейчас','Not now')+'</button></span></div>';},
  bind:function(el,c){var g=c.g,id=g._pk,b=el.querySelector('[data-a=go]'),x=el.querySelector('[data-a=no]');
    if(x)x.onclick=function(){try{SND.tap();}catch(e){}var t=tips();t.pkNo=(t.pkNo|0)+1;try{save();}catch(e){}st({a:'no',id:id,src:'win'});el.style.visibility='hidden';};
    if(b)b.onclick=function(){try{SND.tap();}catch(e){}tips().pkNo=0;try{save();}catch(e){}
      M.play(id,{src:'win',noBack:true,cb:function(r){if(!r)return;var p=el.querySelector('.mgp');if(p)p.innerHTML='<span>✓ '+L('Перекур удался!','Nice break!')+' <b>«'+esc(nm(id))+'»</b><small>'+L('ещё игры — во Дворе Петровича','more games in Petrovich\'s yard')+'</small></span>';}});};}});
W.MG_PATH={dayPick:dayPick,winPick:winPick};
})();
