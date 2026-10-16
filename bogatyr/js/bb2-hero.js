/* bb2-hero.js — ГЕРОИ, заглушка старта (поток HERO): флаги, сохранение, догрузка набора 'hero' (js/bb2-hero-run.js — там справка и всё остальное).
   Флаги HERO_X, HERO_UM2, HERO_KINO, HERO_FIN, HERO_LUBOK; все выключены → бой как v24.1. S.bb2.hero = {x:{карточка:раз взята}, f, a, k — счётчики}. */
(function(){
  var HR={rt:null,F:['HERO_X','HERO_UM2','HERO_KINO','HERO_FIN','HERO_LUBOK']};
  HR.any=function(){for(var i=0;i<HR.F.length;i++)if(BB2.on(HR.F[i]))return true;return false;};
  HR.sv=function(){return BB2.s('hero');};
  BB2.save('hero',{fix:function(o){var r={},k,n,a=BB2.ob(o.x),q='f,a,k'.split(','),i;
      if(a)for(k in a){n=Math.max(0,Math.min(9999,a[k]|0));if(n)(r.x||(r.x={}))[String(k).slice(0,8)]=n;}
      for(i=0;i<q.length;i++){n=Math.max(0,Math.min(99999,o[q[i]]|0));if(n)r[q[i]]=n;}
      for(k in o)if(!(k in r)&&'x,f,a,k'.indexOf(k)<0)r[k]=o[k];return r;},
    merge:function(a,b){return BB2.mx(a,b);}});
  HR.cards=function(h){return HR.rt?HR.rt.cards(h):[];};
  HR.um2=function(h){return HR.rt?HR.rt.um2(h):'';};
  HR.busy=function(){return !!(HR.rt&&HR.rt.busy());};
  BB2.lazy('hero',['js/bb2-hero-run.js'],function(){return !!HR.rt;});
  BB2.hook('ready',function(){if(HR.any())BB2.bg('hero');});
  BB2.hook('run',function(g){if(!HR.any())return;if(HR.rt){HR.rt.run(g);return;}
    BB2.need('hero').then(function(){if(typeof G!=='undefined'&&G===g&&!g.over&&HR.rt)HR.rt.run(g);},function(){});});
  BB2.hero=HR;
})();
