/* RB:SHOP (блок E, 08.10) — статистика рыбалки по забросам. Только чтение состояния игры: клёв, вываживание, лупа — НЕ меняются.
   Одно событие STAT `cast` на каждый заброс (когда его судьба решилась), поля (≤ 8, без личных данных):
     r  — итог: ok (поймал), junk (находка), miss (не успел подсечь), brk (обрыв), off (слабина — сошла), far (ушла на глубину),
          q (тишина A2 — «мёртвый час»), no (на эту наживку тут не берут), quit (рыбалку закрыли посреди заброса);
     f  — вид рыбы, что клюнула ('' — поклёвки не было, 'junk' — находка); p — место (номер); b — наживка;
     dp — «глубина.точка[.L][.eN][.t]»: глубина A2 (top/mid/bot, донка — led), точка на воде, L — лупа была видна на поклёвке,
          eN — сколько раз подсёк рано, t — турнир;
     tk — снасть «удочка леска катушка» ступенями (например '210'); rt — реакция на поклёвку, мс (от «Клюёт!» до подсечки); w — вес, г (если поймал).
   Мини-игры: statMg(id, a, o) → STAT `mg` {g:id, a, …o} — общий вход для MG0 (a: open|start|done|train|ad; o: score, tier, n).
   Настройки (лупа, звуки природы) — событие `set` раз за сеанс (модуль STAT пускает в cfg только th/snd/calm, сам модуль не трогаем). */
(function(){
  'use strict';
  if(typeof STAT==='undefined'||typeof update!=='function')return;
  var R=null;              // текущий заброс
  function tk(){try{var t=curTk();return ''+(t.rod|0)+(t.line|0)+(t.reel|0);}catch(e){return '';}}
  function begin(){if(!G||!G.fl)return;
    R={p:G.pi,b:G.bait,dp:G.o?(G.o.way==='led'?'led':G.o.dp||'mid'):'-',z:G.fl.z||'open',tk:tk(),f:'',e:0,L:0,bt:0,rt:0,t:G.tourn?1:0};}
  function send(r,w){if(!R)return;var x=R;R=null;
    var dp=x.dp+'.'+x.z+(x.L?'.L':'')+(x.e?'.e'+x.e:'')+(x.t?'.t':''),o={r:r,f:x.f,p:x.p,b:x.b,dp:dp,tk:x.tk};
    if(x.rt)o.rt=x.rt;if(w)o.w=Math.round(w*1000);
    try{STAT.ev('cast',o);}catch(e){}}
  // переходы фаз — по кадру (update зовётся из loop по имени)
  var u0=update;
  update=function(dt){var g=G,ph=g&&g.phase,quiet=g&&g.quiet;u0.apply(this,arguments);if(!g||g!==G)return;var nw=g.phase;
    if((nw==='nibble'||nw==='bite')&&R){var a=g.a1;if(a&&a.lp>.5)R.L=1;}
    if(nw===ph)return;
    if(ph==='fly'&&nw==='wait')begin();
    else if(ph==='wait'&&nw==='aim')send(quiet?'q':'no');
    else if(ph==='wait'&&nw==='nibble'&&R)R.f=g.pk?(g.pk.junk?'junk':g.pk.f&&g.pk.f.id||''):'';
    else if(nw==='bite'&&R)R.bt=Date.now();
    else if(nw==='miss')send('miss');};
  if(typeof early==='function'){var e0=early;early=function(){if(R)R.e++;return e0.apply(this,arguments);};}
  if(typeof doHook==='function'){var h0=doHook;doHook=function(){if(R&&R.bt&&!R.rt)R.rt=Date.now()-R.bt;return h0.apply(this,arguments);};}
  if(typeof fightEnd==='function'){var f0=fightEnd;fightEnd=function(res){if(R&&res!=='ok')send(res==='break'?'brk':res==='slack'?'off':'far');return f0.apply(this,arguments);};}
  if(typeof landed==='function'){var l0=landed;landed=function(){var pk=G&&G.pk;
    if(R)send(pk&&pk.junk?'junk':'ok',pk&&!pk.junk?pk.w:0);
    else if(pk&&pk.bk){try{STAT.ev('cast',{r:'back',f:pk.f&&pk.f.id||'',p:G.pi,w:Math.round((pk.w||0)*1000)});}catch(e){}} // «вернуть сошедшую рыбу» за ролик
    return l0.apply(this,arguments);};}
  if(typeof finish==='function'){var fi=finish;finish=function(){if(R&&G&&!G.over)send('quit');return fi.apply(this,arguments);};}
  // настройки сеанса — раз: лупа (0 авто, 1 всегда, 2 выкл), звуки природы, спокойный режим
  var setDone=false;
  function setEv(){if(setDone)return;setDone=true;try{STAT.ev('set',{lp:S.loupe==null?0:S.loupe,amb:S.amb===false?0:1,calm:typeof calm==='function'&&calm()?1:0});}catch(e){}}
  setTimeout(setEv,4000);
  window.statMg=function(id,a,o){var p={g:String(id||''),a:String(a||'')},k,n=0;if(o)for(k in o)if(o.hasOwnProperty(k)&&n<5){p[k]=o[k];n++;}try{STAT.ev('mg',p);}catch(e){}};
  window.__evstat={get R(){return R;}};
})();
