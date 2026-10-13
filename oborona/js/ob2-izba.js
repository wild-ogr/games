'use strict';
/* ob2:IZBA старт (мал — бюджет старта). Договор и всё остальное — js/ob2-izba-ui.js (лениво). Сейв новых игр — в S.dzr (q, tb, b/n[num]). */
var IZ=(function(){
  ['udal','izba2','udal-day','udal-call','igrisha'].forEach(function(k){OB2.reg(k,{s:'IZBA'});});
  function on(id){return !OB2.off(id)&&!OB2.off('udal');}
  function load(){return OB2.need('js/ob2-izba-ui.js');}
  var ob=function(v){return v&&typeof v==='object'&&!Array.isArray(v);},cp=function(v){return JSON.parse(JSON.stringify(v));},M=OB2.merge,
    KN={x:1,b:1,n:1,d:1,l:1,lr:1,w:1,nb:1,s:1,u:1,chp:1,ts:1};
  function qm(a,b){if(String(b.d||'')>String(a.d||'')){a.d=b.d;a.p=ob(b.p)?cp(b.p):{};a.u=+b.u||0;}else if(b.d===a.d&&ob(b.p)){a.p=a.p||{};M(a.p,b.p);a.u=Math.max(+a.u||0,+b.u||0);}
    if(ob(b.w)&&(!ob(a.w)||(+b.w.w||0)>(+a.w.w||0)))a.w=cp(b.w);else if(ob(b.w)&&b.w.w===a.w.w)M(a.w,b.w);
    if((+b.nd||0)>(+a.nd||0)){a.nd=b.nd;a.nw=b.nw;}for(var k in b)if(ob(b[k])&&k!=='p'&&k!=='w'){if(!ob(a[k]))a[k]={};M(a[k],b[k]);}}
  /* облако: свои ключи S.dzr — q «Удаль», tb Борть (TIHO, по дню), прочие — максимум (DZR_MERGE знает только старые) */
  META_MODS.push({id:'dzr2',MERGE:function(x,o){var b=ob(x)&&x.dzr,a=o&&o.dzr;if(!ob(a)||!ob(b)||a===b)return;
    for(var k in b){var v=b[k];if(KN[k])continue;
      if(k==='tb'){if(ob(v)&&(!ob(a.tb)||String(v.d||'')>String(a.tb.d||'')))a.tb=cp(v);}
      else if(k==='q'){if(!ob(a.q))a.q={};if(ob(v))qm(a.q,v);}
      else if(ob(v)){if(!ob(a[k]))a[k]={};M(a[k],v);}else if(a[k]===undefined)a[k]=v;else if(typeof v==='number')a[k]=Math.max(+a[k]||0,v);}}});
  /* итог любой мини-игры → события для потоков ('mg', 'rec'); ловкостные 15–24 — своё окно итога */
  var f0=MG_FIN;MG_FIN=function(g,o,r){var n=g.num|0,b=S.dzr.b[n]|0,sc=Math.round(+r.score||0);
    try{OB2.emit('mg',{id:g.id,num:n,sc:sc,tier:r.tier|0,m:o.mode,rec:sc>b?1:0});if(sc>b&&(n<15||n>24))OB2.emit('rec',{id:g.id,num:n,sc:sc});}catch(e){}
    if(n>=15&&n<=24){var a=arguments;load().then(function(){IZU.fin.apply(null,a);},function(){f0.apply(null,a);});return;}return f0.apply(this,arguments);};
  var u0=MG_FIN_UI;MG_FIN_UI=function(g){var x=u0.apply(this,arguments),a=arguments;if(on('izba2')&&g.num<15)load().then(function(){IZU.old.apply(null,a);}).catch(function(){});return x;};
  OB2.slot('izba','udal',function(el,fresh){var a=el.querySelector('.dzA'),d=document.createElement('div');if(!a)return;d.id='izUdal';a.insertBefore(d,a.children[1]||null);
    load().then(function(){if(d.isConnected)IZU.shelf(d,fresh);}).catch(function(){d.remove();});},50);
  OB2.on('menu',function(){if(mgIzbaOpen())setTimeout(function(){load().catch(function(){});},4000);},'udal');
  var rq=renderQuests;renderQuests=function(){var x=rq.apply(this,arguments);try{if(window.IZU&&on('udal-day'))IZU.quest();}catch(e){}return x;};
  return {on:on,load:load};
})();
