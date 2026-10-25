'use strict';
/* zb3-core — каркас «Зина 3.0 / Дом №7» (Z3: флаг zb3, двор, Неделя новосёла, поля S.z3*, Z3.late/need). ДОГОВОР — docs/zb3-core.txt (не в архиве игры); правила — zina-boost3/Z3-COMMON.md. Chrome 92: без ?. ?? .at :has structuredClone. */
(function(){
  if(typeof window.ZB==='undefined'||typeof window.ZB2==='undefined')return;
  var ZB=window.ZB,ZB2=window.ZB2;
  var Z=window.Z3={v:1,yard:[],q:[]};
  var so=0;try{so=localStorage.getItem('z3-off')==='1';}catch(e){}Z.soff=so; // VERDICT-ZINA: выключатель с сервера (HOUSE_Z3OFF) — запомнен прошлым запуском (zb3-house)
  ZB2.reg('zb3',{t:'Зина 3.0: мир «Двор» (главный флаг, откат на старый Дом)',who:'LEAD',on:!so});
  Z.on=!ZB2.off('zb3');
  Z.reg=function(id,o){var r=ZB2.reg(id,o);return Z.on&&r;};
  Z.field=function(key,o){if(!/^z3[a-z]$/.test(key)){console.error('[zb3] поле должно быть z3<буква>: '+key);return;}return ZB2.field(key,o);};

  // ---- день игрока и «Неделя новосёла» ----
  function tk(){try{return +todayKey();}catch(e){return 0;}}
  function days(a,b){function f(k){return Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100);}return Math.round((f(b)-f(a))/864e5);}
  Z.days=days;Z.tk=tk;
  Z.day=function(){if(typeof S==='undefined'||!S)return 1;var d1=S.z2n&&+S.z2n.d1||0,t=tk();
    if(d1&&t)return Math.max(1,days(d1,t)+1);
    var lv=+S.lv||0;if(lv>=20)return 99;var c=S.stc&&+S.stc.c||0;return c&&t?Math.max(1,days(c,t)+1):(lv>=5?2:1);};
  Z.YARD=['kitchen','paper','build','mail','bench','school','kiosk','album'];
  Z.OPEN={kitchen:1,mail:1,paper:2,build:3,bench:3,school:3,kiosk:5,album:7};
  Z.open=function(id){if(!Z.on)return false;var d=Z.OPEN[id];return d==null?true:Z.day()>=d;};

  // ---- двор ----
  Z.yardAdd=function(o){if(!o||!o.id)return;return ZB.add(Z.yard,o);};
  Z.yardGet=function(id){for(var i=0;i<Z.yard.length;i++)if(Z.yard[i].id===id)return Z.yard[i];return null;};
  Z.yardGo=function(id){var o=Z.yardGet(id);if(!o||!Z.open(id))return false;Z.ev('z3y',{a:'go',id:id,d:Math.min(Z.day(),99)});
    ZB.safe('yard:'+id,function(){o.go();});return true;};

  // ---- сервер (заглушка до SRV) ----
  Z.srv={stub:1,send:function(kind,data){if(Z.q.length<200)Z.q.push({k:kind,d:data,t:Date.now()});},
    get:function(){return Promise.reject(new Error('no srv'));}};

  // ---- рубрики ----
  Z.rub=[];Z.rubAdd=function(o){if(!o||!o.id)return;return ZB.add(Z.rub,o);};
  Z.rubs=function(){return Z.rub.slice();};
  Z.rubGet=function(id){for(var i=0;i<Z.rub.length;i++)if(Z.rub[i].id===id)return Z.rub[i];return null;};

  // ---- тексты ----
  var last={};
  Z.txt=function(key,ctx){var L=window.Z3T&&window.Z3T[key];if(!L||!L.length)return '';var i=Math.floor(Math.random()*L.length);
    if(L.length>1&&i===last[key])i=(i+1)%L.length;last[key]=i;var s=String(L[i]);
    if(ctx)s=s.replace(/\{(\w+)\}/g,function(m,k){return ctx[k]!=null?String(ctx[k]):m;});return s;};

  // ---- кожа и рисунки ----
  window.Z3ART=window.Z3ART||{};
  Z.art=function(id,opts){var f=window.Z3ART[id];return f?ZB.safe('art:'+id,function(){return f(opts||{});})||'':'';};

  // ---- поздняя часть модулей (диета старта) ----
  var LL=[],lgo=0;
  Z.whenReady=function(f){if(ZB.isReady)ZB.safe('z3ready',f);else ZB.on('ready',f);};
  Z.need=function(src){return ZB.load(src);};
  function lrun(){var P=[];LL.forEach(function(it){if(!it.p&&Z.day()>=it.day)it.p=Z.need(it.src).catch(function(){});if(it.p)P.push(it.p);});
    if(P.length)Promise.all(P).then(function(){ZB.emit('z3late');ZB.refresh();});}
  Z.late=function(src,o){if(!Z.on)return;LL.push({src:src,day:o&&o.day||1,p:null});if(lgo)lrun();};
  Z.lateList=function(){return LL.map(function(it){return it.src+(it.p?' +':'');});};
  if(Z.on)ZB.on('ready',function(){setTimeout(function(){lgo=1;var ric=window.requestIdleCallback;if(ric)ric(lrun,{timeout:1500});else lrun();},1200);});

  Z.ev=function(name,o){try{if(window.STAT&&STAT.ev)STAT.ev(name,o||{});}catch(e){}};
  if(Z.on)try{document.documentElement.classList.add('z3');}catch(e){}
})();
