/* bb2-rp.js — заглушка REPLAY «Запись похода» (14.10). Флаги 'rec', 'ghost'. Договор (вызовы, формат) — шапка js/bb2-rp-run.js (набор 'rp').
   Здесь только сама запись: путь и счёт каждые 0,5 с по G.t (не пересчёт боя). Хранение и тень — в догружаемом файле. */
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  var R={A:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',Q:6},A=R.A,Q=6,cur=null;
  BB2.rp=R;
  BB2.save('rp',{fix:function(o){return o.n>0?{n:Math.min(1e6,o.n|0)}:{};},merge:function(a,c){return BB2.mx(a,c);}});
  BB2.lazy('rp',['js/bb2-rp-run.js'],function(){return !!R.fin;});
  R.key=function(g){return g.daily?'D'+g.chi:g.endless?'E':g.chi+(g.dif||'n');};
  R.cur=function(){return cur&&cur.r;};
  BB2.hook('run',function(g){cur=null;if(R.gh0)R.gh0();if(!BB2.on('rec'))return;cur={g:g,r:{k:R.key(g),h:g.heroId,s:''},nx:.5,x:0,y:0,n:0};BB2.need('rp').then(null,function(){});},0);
  BB2.hook('frame',function(dt,g){var c=cur;if(!c||c.g!==g)return;
    while(g.t>=c.nx&&c.nx<=900){c.nx+=.5;var H=g.hero,dx=Math.max(-32,Math.min(31,Math.round((H.x-c.x)/Q))),dy=Math.max(-32,Math.min(31,Math.round((H.y-c.y)/Q))),dk=Math.min(63,g.kills-c.n);
      c.x+=dx*Q;c.y+=dy*Q;c.n+=dk;c.r.s+=A[dx+32]+A[dy+32]+A[dk];}});
  BB2.hook('end',function(g,w){var c=cur,r;cur=null;if(!c||c.g!==g||g.t<20)return;r=c.r;r.t=Math.round(g.t);r.n=g.kills;r.w=w?1:0;r.v=g.hero.lvl;
    BB2.after('rp',function(){R.fin(r,g);});});
})();
