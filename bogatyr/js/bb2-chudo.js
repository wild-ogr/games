/* ===== bb2-chudo.js — заглушка потока CHUDO (супер-буст в2, 13.10.2026). На старте — только это; всё остальное догружается: js/bb2-chudo-run.js.
   Флаги: 'chudo' — «Чудеса» (редкие карточки из сундука вожака, меняют правила боя) и «Книга чудес»;
          'evmix' — перемешанное расписание событий похода с 7-го места кампании;
          'fuse13' — былинные слияния и на Обычной, с 13-го места кампании, не раньше 3:30.
   Сохранение: S.bb2.chudo = {b:{id:сколько раз брал}, pg:{страница:1 — награда за страницу выдана}, n:всего взято} (поля — только когда есть что хранить). Старый синтаксис: без ?. ?? .finally */
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  function num(v){return typeof v==='number'&&isFinite(v)&&v>0?Math.floor(v):0;}
  BB2.save('chudo',{
    fix:function(o){var b={},p={},r={},k,nb=0,np=0;if(BB2.ob(o.b))for(k in o.b)if(num(o.b[k])){b[k]=Math.min(9999,num(o.b[k]));nb++;}
      if(BB2.ob(o.pg))for(k in o.pg)if(o.pg[k]){p[k]=1;np++;}
      if(nb)r.b=b;if(np)r.pg=p;if(num(o.n))r.n=num(o.n);return r;}, /* у новичка — пустой объект: «нет поля = как у новичка» */
    merge:function(a,c){return BB2.mx(a,c);}});
  BB2.lazy('chudo',['js/bb2-chudo-run.js'],function(){return !!(BB2.chudo&&BB2.chudo.ok);});
  function any(){return BB2.on('chudo')||BB2.on('evmix');}
  /* догрузка: в фоне, когда меню готово; если поход начался раньше — догружаем сразу, чудеса включатся с первого же сундука */
  BB2.hook('ready',function(){if(any())BB2.bg('chudo');});
  BB2.hook('run',function(g){fuse();if(!any()||BB2.ready('chudo'))return;
    BB2.need('chudo').then(function(){if(BB2.chudo&&typeof G!=='undefined'&&G===g&&!g.over)BB2.chudo.late(g);},function(){});});
  /* былинные слияния на Обычной: условие живёт в meta-wpn.js (wpnBylOk) — оборачиваем, файл не правим */
  var fz=0;
  function fuse(){if(fz||typeof wpnBylOk!=='function')return;fz=1;var old=wpnBylOk;
    wpnBylOk=function(){if(old())return true;
      try{if(!BB2.on('fuse13')||!G||G.dif!=='n'||G.wpnBy||G.daily||G.weekly||G.endless||G.short)return false;
        if(chPos(G.chi)<BB2.n('chudo.fuseCh',13)||G.t<BB2.n('chudo.fuseT',210/*ECO?*/))return false;
        var ev=0,i,k;for(i=0;i<G.weapons.length;i++)if(G.weapons[i].lvl>=6&&G.weapons[i].id!=='byl')ev++;
        if(ev<2)return false;for(k in G.pas)if(PASSIVES[k]&&G.pas[k]>=PASSIVES[k].max)return true;}catch(e){}
      return false;};}
})();
