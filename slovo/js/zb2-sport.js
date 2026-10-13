'use strict';
/* zb2-MISC · sport: «Спартакиада подъезда» — раз в неделю (пн–вс) 3 ловкостные игры из открытых, сумма очков против соседок, награда.
   Лениво: zb2-misc-x.js грузит после js/zmg-rec-ui.js (ZMGREC: ids/get/cf/unit/play). Без ZMGREC или с 1 открытой игрой — ничего не рисует.
   Очки игры = 100 × недельный рекорд / mid (mid — «хорошая рука» из ZMGREC.cf), не больше 250. Соседки (персонажи, не живые люди): сила ×(0,85–1,15)
   от недели, их счёт растёт по дням недели — к воскресенью полный. Итог прошлой недели — полоска на Доме (окон при входе не открываем — правило CAL),
   «Забрать» — на экране ZB.go('zsport'). Награда ZBECO.sport.r [_, 1-е, 2-е, 3-е, 4-е, 5-е] (запасные 60/35/15/5/5) — ZBECO.give('sport').
   S.z2m: w, g, ss — текущая неделя; pw, pp — неделя и место неполученной награды; cw, cr — последняя полученная; cu кубков (1-е), pd пьедесталов (1–3).
   STAT sport {a: show|open|play|take, pl, s, c}. */
(function(){var M=window.ZB2M,R=window.ZMGREC;if(!M||!M.on('sport')||M.parts.sport||!R||!R.ui)return;M.parts.sport=1;
var esc=M.esc,pl=M.pl;
function day(){return typeof todayKey==='function'?+todayKey():20260101;}
function dn(k){k=+k||0;return Math.floor(Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)/864e5);}
function wk(){return Math.floor((dn(day())+3)/7);}
function dow(){return (dn(day())+3)%7;}   // 0 — понедельник
function rn(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h=Math.imul(h^h>>>15,1|h);h^=h+Math.imul(h^h>>>7,61|h);return ((h^h>>>14)>>>0)/4294967296;}
var NB=[{k:'galya',nm:'Галя с третьего',f:1},{k:'tamara',nm:'Тамара из 15-й',f:.93},{k:'valerka',nm:'Валерка',f:.85},{k:'semyon',nm:'Дед Семён',f:.72}];
function HF(){try{return !!(window.ZB2&&ZB2._reg.homefit&&!ZB2.off('homefit'));}catch(e){return false;}}   /* zb2-MERGE */
function RW(){var e=(M.E().sport||{}).r;return e&&e.length>=4?e:[0,60,35,15,5,5];}
function pts(id){var t=R.get(id),mid=+R.cf(id).mid||10;return Math.min(250,Math.round(100*(+t.w||0)/mid));}
function okIds(){return R.ids().filter(function(id){return !(window.ZMG&&ZMG.isOff&&ZMG.isOff(id));});}
/* соседка k: полный счёт недели w по играм g; prog — доля недели (1 — итог) */
function nbSum(n,w,g,prog){var s=0;g.forEach(function(id){s+=Math.round(100*n.f*(.85+.3*rn('sp|'+w+'|'+n.k+'|'+id))*prog);});return s;}
function table(w,g,my,prog){var L=NB.map(function(n){return {nm:n.nm,sc:nbSum(n,w,g,prog)};});L.push({nm:'Ты',sc:my,me:true});
  L.sort(function(a,b){return b.sc-a.sc||(a.me?-1:b.me?1:0);});return L;}
function place(L){for(var i=0;i<L.length;i++)if(L[i].me)return i+1;return L.length;}
/* неделя: сменилась — итог прошлой в «ждёт награды», выбрать игры новой */
function roll(){var z=M.z(),w=wk();
  if(z.w!==w){if(z.w&&z.w<w&&z.ss>0&&z.cw<z.w&&z.pw<z.w){var g0=z.g?z.g.split(','):[];if(g0.length){z.pw=z.w;z.pp=place(table(z.w,g0,z.ss,1));}}
    var P=okIds();if(P.length<2){if(z.w<w){z.w=0;z.g='';z.ss=0;}return z;}
    z.w=w;z.g=P.slice().sort(function(a,b){return rn('sp|'+w+'|'+a)-rn('sp|'+w+'|'+b);}).slice(0,3).join(',');z.ss=0;M.sv();}
  return z;}
function games(){var z=roll();return z.w&&z.g?z.g.split(','):[];}
function mySum(){var g=games(),s=0;g.forEach(function(id){s+=pts(id);});var z=M.z();if(z.w&&s>z.ss){z.ss=s;M.sv();}return Math.max(s,z.ss||0);}
function prog(){return .35+.65*(dow()+1)/7;}   // в понедельник соседки уже размялись (≈44 %), к воскресенью — полный счёт
function now(){var g=games();if(g.length<2)return null;var my=mySum(),L=table(M.z().w,g,my,prog());return {g:g,my:my,L:L,pl:place(L)};}
function pend(){var z=roll();return z.pw&&z.pw>z.cw&&z.pp?{w:z.pw,pl:z.pp,c:+RW()[z.pp]||0}:null;}
function take(){var p=pend();if(!p)return 0;var z=M.z(),n=0;z.cw=p.w;z.cr=p.pl;z.pw=0;if(p.pl===1)z.cu=(+z.cu||0)+1;if(p.pl<=3)z.pd=(+z.pd||0)+1;
  var E=M.E();if(p.c>0){if(E.give)n=E.give('sport',p.c,'gift');else{try{addCoins(p.c,'gift');}catch(e){}n=p.c;}}
  M.sv();M.ev('sport',{a:'take',pl:p.pl,c:n});if(window.ZB2ZAP)try{ZB2ZAP.hook('sosup',1,{id:'sport'});}catch(e){}return n;}
var PLN=['','1-е','2-е','3-е','4-е','5-е'],CUP=['','🥇','🥈','🥉','🎽','🎽'];
function left(){var d=6-dow();return d?'до финала '+d+' '+pl(d,'день','дня','дней'):'финал сегодня';}
/* ---------- экран ---------- */
function tbl(L){return '<ol class="zl-tb">'+L.map(function(x,i){return '<li'+(x.me?' class="me"':'')+'><span>'+(i+1)+'</span><b>'+esc(x.nm)+'</b><i>'+x.sc+' очк.</i></li>';}).join('')+'</ol>';}
function render(el){R.css();M.css();var p=pend(),n=now(),z=M.z(),h='<div class="zl-scr"><div class="zl-hd"><button class="btn ghost small" data-zs="back">‹ Дом</button><h2>🏃 Спартакиада подъезда</h2></div><div class="scroll zl-list">';
  if(p){var g0=(z.g&&z.w===p.w?z.g:'');h+='<div class="zl-card" style="background:#fff8e1"><div class="zl-ct"><b>Итоги прошлой недели</b><span>'+CUP[p.pl]+'</span></div>'+
    '<p>Ты занял(а) <b>'+PLN[p.pl]+' место</b>'+(p.pl===1?' — кубок твой! Галя ушла пить валерьянку.':p.pl<=3?' — на пьедестале! Тамара уже шьёт ленточку.':' — зато размялся(-ась). На следующей неделе — реванш!')+'</p>'+
    (p.c?'<button class="btn green zl-go" data-zs="take">🎁 Забрать +'+p.c+' <span class="coin"></span></button>':'<button class="btn green zl-go" data-zs="take">Понятно</button>')+'</div>';}
  if(!n)h+='<p class="zl-empty">Спартакиада начнётся, когда на переменах откроются хотя бы две игры на ловкость. Тренируйся!</p>';
  else{h+='<div class="zl-card"><div class="zl-ct"><b>Эта неделя: '+n.g.length+' '+pl(n.g.length,'вид','вида','видов')+'</b><span>'+left()+'</span></div>'+
      '<p style="opacity:.8">Очки — твой лучший результат недели в каждой игре: средний результат — 100 очков. Соседки тоже тренируются всю неделю. Итоги — в понедельник.</p></div>';
    n.g.forEach(function(id){var t=R.get(id);h+='<div class="zl-card"><div class="zl-ct"><b>'+esc(M.gName(id))+'</b><span>'+pts(id)+' очк.</span></div>'+
      '<p>Лучшее за неделю: <b>'+(t.w?R.unit(id,t.w):'ещё не играл(а)')+'</b></p><button class="btn green zl-go" data-id="'+id+'">▶ Играть</button></div>';});
    h+='<div class="zl-card"><div class="zl-ct"><b>Таблица подъезда</b><span>ты '+n.pl+'-й</span></div>'+tbl(n.L)+
      '<p style="opacity:.75;font-size:13px">Награда: 1-е место — '+RW()[1]+', 2-е — '+RW()[2]+', 3-е — '+RW()[3]+' монет и кубок в дневник.</p></div>';}
  el.innerHTML=h+'</div></div>';
  el.querySelector('[data-zs="back"]').onclick=function(){M.tap();ZB.go('home');};
  var tb=el.querySelector('[data-zs="take"]');if(tb)tb.onclick=function(){var k=take();try{if(k){SND.coin();coinBurst(tb,k);}else M.tap();}catch(e){}try{updCoins();}catch(e){}render(el);};
  [].forEach.call(el.querySelectorAll('.zl-go[data-id]'),function(b){b.onclick=function(){M.tap();var id=b.getAttribute('data-id');M.ev('sport',{a:'play',id:id});
    if(window.ZMG)ZMG.open(id,{mode:'gym',back:function(){ZB.go('zsport');}});};});}
ZB.screen('zsport',{title:'Спартакиада',render:render});
/* ---------- полоска на Доме (рядом с Доской рекордов) ---------- */
ZB.add(ZB.homeSlots,{id:'zm-sport',order:HF()?30:58,zone:HF()?'after':'school',   /* zb2-MERGE: с homefit — в 'after' (Порядок Дома NEWB), «Школа» не уезжает */
  render:function(){var p=pend(),n=p?null:now();if(!p&&!n)return '';R.css();
    return '<button class="zl-strip'+(p?' zl-nw':'')+'" type="button"><span class="zl-ic">'+(p?'🏆':'🏃')+'</span><span class="zl-tx"><b>'+
      (p?'Итоги Спартакиады: '+PLN[p.pl]+' место!':'Спартакиада: ты '+n.pl+'-й из '+n.L.length)+'</b><small>'+
      (p?(p.c?'Забери +'+p.c+' монет':'Посмотри итоги'):left()+' · '+n.g.map(function(id){return M.gName(id);}).join(', '))+'</small></span><i>›</i></button>';},
  mount:function(el){var b=el.querySelector('.zl-strip');if(!b)return;if(!b.__s){b.__s=1;M.ev('sport',{a:'show',p:pend()?1:0});}
    b.onclick=function(){M.tap();M.ev('sport',{a:'open'});ZB.go('zsport');};}});
ZB.on('zmg',function(d){if(d&&d.a==='end'&&games().indexOf(d.id)>=0)ZB.safe('zm-sport:sum',mySum);});
M.sport={now:now,pend:pend,take:take,roll:roll,pts:pts,table:table};
ZB.safe('zm-sport:ref',function(){var on=document.querySelector('.screen.on');if(on&&(on.id==='menu'||on.id==='zb-home'))ZB.refresh();});
})();
