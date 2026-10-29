'use strict';
/* zb4-core-s — поздняя часть каркаса «Зина 4.0» (Z4-BASE, часть Б): события в уровне, строка 4.0 в окне победы, карточка 4.0 на Доме.
   Грузится Z3.late с 4-го дня (новичку дней 1–3 не грузится вовсе). Договор — docs/zb4-core.txt. Chrome 92: без ?. ?? .at :has. */
(function(){
  var Z=window.Z4;if(!Z||!Z.on||Z._s)return;Z._s=1;
  var ZB=window.ZB,ZB2=window.ZB2;
  function isOK(){return typeof OK!=='undefined'&&!!OK;}
  function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
  var Q=location.search,force=(/[?&]z4ev=([a-z0-9.]+)/.exec(Q)||[])[1]||'';
  Z.R={vk:5,ok:8,ya:5};
  Z.since=function(){var d=Z.S().d0,t=0;try{t=+todayKey();}catch(e){}return d&&t?Z3.days(d,t)+1:0;};
  var EV=Z.reg('z4b.ev',{t:'Зина 4.0: события посреди уровня (≤1 на уровень, с 30-го уровня и 4-го дня)',who:'BASE'});
  function rate(){return isOK()?Z.R.ok:(typeof PLAT!=='undefined'&&PLAT==='vk'?Z.R.vk:Z.R.ya);}
  // годен ли уровень для события (запреты BASE)
  Z.lvlEvent.fit=function(i){if(!EV||!Z.on||Z.day()<4||!i||i.lv<30||i.daily||i.mix||i.mode||typeof S==='undefined'||i.idx!==+S.lv)return false;
    var g=i.G;return !!g&&!g.fest&&!g.tut;};
  Z.lvlEvent.wants=Z.lvlEvent.wants||[]; // Z4-SOBYT 28.10: fn(info)→id события | '-' (уровень без события) | '' — выбор игрока (развилка M50), без частоты
  var cur=null; // {e: событие, info, g, ran}
  Z.onStart(function(i){cur=null;var L=Z.lvlEvent.L;if(!L.length||!Z.lvlEvent.fit(i))return;
    var z=Z.S(),info={lv:i.lv,idx:i.idx,mode:i.mode,daily:i.daily,mix:i.mix,calm:calm(),ok:isOK()},C=[],sum=0;
    var want=force;if(!want)Z.lvlEvent.wants.some(function(f){var r=ZB.safe('z4ev.want',function(){return f(info);});if(r)want=r;return !!r;}); // Z4-SOBYT: развилка
    if(want==='-')return;
    if(!want){var R=rate(),gap=Math.ceil(R/2);if(z.el&&i.lv-z.el<gap)return;if(Math.random()>=1/(R-gap+1))return;}
    L.forEach(function(e){if(want&&e.id!==want)return;var ok=ZB.safe('z4ev.ok:'+e.id,function(){return !e.ok||e.ok(info);});
      if(ok){var w=+e.w>0?+e.w:1;C.push([e,w]);sum+=w;}});
    if(!C.length)return;var x=Math.random()*sum,e=C[C.length-1][0];
    for(var k=0;k<C.length;k++){x-=C[k][1];if(x<0){e=C[k][0];break;}}
    if(Z.fx&&!want&&!Z.fx('z4b.ev',i.G))return; /* Z4-UX: событие уровня — тоже «фишка»: одна на уровень */
    cur={e:e,info:info,g:i.G,ran:0};});
  // «посреди уровня»: найдена ~треть слов кроссворда, осталось ≥2
  Z.onWord(function(o){var c=cur;if(!c||c.ran||o.bonus||o.G!==c.g||o.G.won)return;
    if(o.G.zc&&o.G.zc.z4&&o.G.zc.z4.f==='flip'){cur=null;return;} /* Z4-MERGE: в «перевёртыше» KLETKI чужих событий уровня нет */var of=o.G.words.length;
    if(o.left<2||of-o.left<Math.max(1,Math.round(of/3)))return;c.ran=1;var z=Z.S();z.el=o.lv;z.en=(+z.en||0)+1;
    Z.ev('z4b',{a:'lev',id:c.e.id,lv:o.lv,ok:c.info.ok?1:0});var d=0;
    ZB.safe('z4ev.run:'+c.e.id,function(){c.e.run(o.G,function(){d=1;},c.info);});});
  Z.onWin(function(){cur=null;});
  if(Z.reg('z4b.t',{t:'Стенд: тестовое событие/строка/карточка 4.0 (только ?z4test=1)',who:'BASE',on:/[?&]z4test=1/.test(Q)})){
    Z.lvlEvent.add({id:'z4b.t',who:'BASE',run:function(g,done){try{toast('Z4: событие');}catch(e){}done();}});
    Z.winLine.add({id:'z4b.t',order:999,txt:function(i){return 'Z4: строка победы, уровень '+i.lv;}});
    Z.card.add({id:'z4b.t',order:999,show:function(){return true;},html:function(){return '<div class="z4tc">Z4: карточка</div>';}});}
  // ---- одна строка 4.0 в окне победы (по кругу) ----
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var wg=null,wh='';
  ZB.add(ZB.winSlots,{id:'z4line',order:70,zone:'ladder',fit:2,render:function(ctx){var g=ctx.g;if(!Z.on)return '';if(g&&g===wg)return wh;wg=g;wh='';
    var L=Z.winLine.L.slice().sort(function(a,b){return (a.order||0)-(b.order||0);}),n=L.length;if(!n||!g)return '';var z=Z.S(),s0=(+z.wl||0)%n;
    var info={lv:g.idx+1,idx:g.idx,daily:!!g.daily,mode:g.mode||'',first:!!ctx.first,hints:0,words:g.words.length,of:g.words.length,bonus:g.bonus.size,G:g,r:ctx.r};
    /* Z4-REL 29.10 (аудит, список для выпуска п.2): «срочные» строки (поле urg(info)→true: Час Зины VSEM, решённое пари PARI) — первыми, круг остальных не сдвигаем */
    for(var u=0;u<n;u++){var iu=L[u];if(iu.urg&&ZB.safe('z4wu:'+iu.id,function(){return iu.urg(info);})){var tu=ZB.safe('z4wl:'+iu.id,function(){return iu.txt(info);});
      if(tu){wh='<div class="z4wl" style="font-size:14px;line-height:1.35;margin:4px 0">'+esc(tu)+'</div>';return wh;}}}
    for(var k=0;k<n;k++){var it=L[(s0+k)%n],t=ZB.safe('z4wl:'+it.id,function(){return it.txt(info);});
      if(t){z.wl=(s0+k+1)%n;wh='<div class="z4wl" style="font-size:14px;line-height:1.35;margin:4px 0">'+esc(t)+'</div>';break;}}
    return wh;}});
  // ---- одна карточка 4.0 на Доме ----
  var cc=null,cv=-1,ct=0;Z.card.okLow=Z.card.okLow||['z4h','z4d','z4x','z4m'];
  ZB.add(ZB.homeSlots,{id:'z4card',order:3,zone:'today',render:function(){cc=null;if(!Z.on||Z.day()<4)return '';
    var O=function(c){var o=c.order;if(typeof o==='function')o=ZB.safe('z4card:'+c.id,o);return +o||0;},L=Z.card.L.slice().sort(function(a,b){return O(a)-O(b);});
    /* Z4-MERGE 28.10: срочные (order ≤15) — первыми; остальные — ПО КРУГУ (новый круг — заход на Дом через ≥3 мин), иначе сюжет ROMAN (20) закрывал всех */
    /* Z4-UX 29.10 (совет аналитика п.6, «шум для ОК 45+»): в ОК чат, подъезд, школа-экзамены, сочинения-мемуары — в хвост круга: карточка, только если других нет */
    var U=[],R=[],T=[],k,c,h,now=Date.now(),lo=isOK()?Z.card.okLow:[];for(k=0;k<L.length;k++)(O(L[k])<=15?U:lo.indexOf(L[k].id)>=0?T:R).push(L[k]);
    if(now-ct>180000){cv++;}ct=now;var n=R.length,s0=n?(Z.day()+cv)%n:0,Q=U.slice();for(k=0;k<n;k++)Q.push(R[(s0+k)%n]);Q=Q.concat(T);
    for(k=0;k<Q.length;k++){c=Q[k];if(ZB.safe('z4card:'+c.id,function(){return c.show();})){h=ZB.safe('z4card:'+c.id,function(){return c.html();});if(h){cc=c;return h;}}}return '';},
    mount:function(el){if(cc&&cc.mount)ZB.safe('z4card:'+cc.id,function(){cc.mount(el);});}});
})();
