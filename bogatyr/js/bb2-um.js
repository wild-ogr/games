/* bb2-um.js — УМЕНИЯ, заглушка старта (поток UM). Договор BB2.um.* — js/bb2-um-core.js, бой — bb2-um-run.js, окна — bb2-um-ui.js (набор 'um', догружается в меню).
   Флаг UM_ON выключен → дар срабатывает сам, как v24.1. Сохранение S.bb2.um: sl гнёзда, op открытые, lv ступени, m режим, n нажатий, l левая рука, p «под палец», h подсказка, g гостинец. */
(function(){
  var U=BB2.um={rt:null,ui:null,on:function(){return BB2.on('UM_ON');}},Q='sl,m,l,p,g'.split(',');
  BB2.save('um',{fix:function(o){var k,a=Array.isArray(o.sl)?o.sl:[],r={},n; /* храним только отличное от «как у новичка»; незнакомые поля не теряем */
      a=[typeof a[0]==='string'?a[0].slice(0,16):'',typeof a[1]==='string'?a[1].slice(0,16):''];if(a[0]||a[1])r.sl=a;
      a=BB2.ob(o.op);if(a)for(k in a)if(a[k])(r.op||(r.op={}))[k]=1;
      a=BB2.ob(o.lv);if(a)for(k in a){n=Math.max(0,Math.min(5,a[k]|0));if(n)(r.lv||(r.lv={}))[k]=n;}
      if(o.m===1||o.m===2)r.m=o.m;n=Math.max(0,Math.min(99,o.n|0));if(n)r.n=n;if(o.l)r.l=1;if(o.p)r.p=1;if(o.h)r.h=1;if(typeof o.g==='string'&&o.g)r.g=o.g.slice(0,16);
      for(k in o)if(!(k in r)&&'sl,op,lv,m,n,l,p,h,g,v'.indexOf(k)<0)r[k]=o[k];return r;},
    merge:function(a,b){var o=BB2.mx(a,b),k;for(k=0;k<5;k++){if(Q[k] in a)o[Q[k]]=a[Q[k]];else delete o[Q[k]];}return o;}}); /* ступени, открытое, счётчики — максимум; настройки и гостинец — свои */
  BB2.lazy('um',['js/bb2-um-core.js','js/bb2-um-run.js','js/bb2-um-ui.js'],function(){return !!(U.rt&&U.ui);});
  BB2.hook('ready',function(){if(U.on())BB2.bg('um');}); /* не BB2.late: новичку кнопка нужна уже в первом походе (он начинается сразу), а late ждёт меню */
  BB2.hook('run',function(g){if(!U.on())return;if(U.rt)U.rt.run(g);else BB2.need('um').then(function(){},function(){});}); /* не успел догрузиться — подхватит поход сам, а пока дар срабатывает как раньше */
  BB2.hook('dar',function(g){return g.um&&U.rt?U.rt.dar(g):undefined;});   /* true — дар сам не срабатывает */
  BB2.hook('hudDar',function(c,g){return g.um&&U.rt?true:undefined;});      /* true — старый портрет с кольцом не рисуем */
  BB2.hook('chInfo',function(s,a,b){if(!U.on())return;if(U.ui)U.ui.ch(s,a,b);else BB2.after('um',function(){if(typeof curTab!=='undefined'&&curTab==='Map')renderChInfo();});});
})();
