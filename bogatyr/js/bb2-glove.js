/* bb2-glove.js — заглушка GLOVE («Перчатка», «Спор богатырей», гости): сохранение S.bb2.glove, метка входа из ссылки, догрузка набора 'glove' (js/bb2-glove-run.js — там описание). */
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  function nm(v){v=+v;return v>0&&isFinite(v)?Math.floor(v):0;}
  function fix(o){var r={},i,k,a=['d','n','gg','s','p','w'];for(i=0;i<a.length;i++){k=nm(o[a[i]]);if(k)r[a[i]]=k;}
    if(/^[goz]$/.test(o.gs))r.gs=o.gs;
    if(Array.isArray(o.u)){a=[];for(i=0;i<o.u.length;i++)if(/^[0-9a-z]{1,8}$/.test(o.u[i])&&a.indexOf(o.u[i])<0)a.push(o.u[i]);if(a.length)r.u=a.slice(-6);}
    return r;}
  function merge(a,c){var r=BB2.mx(a,c),x,i;if((a.d|0)!==(c.d|0)){x=(a.d|0)>(c.d|0)?a:c;r.d=x.d;r.n=x.n;}
    x=(a.u||[]).slice();for(i=0;c.u&&i<c.u.length;i++)x.push(c.u[i]);r.u=x;r.gs=a.gs||c.gs;return fix(r);}
  BB2.save('glove',{fix:fix,merge:merge});
  BB2.lazy('glove',['js/bb2-glove-run.js'],function(){return !!BB2.glove;});
  var h='',m,t0=Date.now();
  try{h=String(location.hash||'').replace(/^#/,'');m=/[?&]hash=([^&]*)/.exec(location.search);if(!/^[gz]1\.|from=/.test(h)&&m)h=decodeURIComponent(m[1]);}catch(e){h='';}
  m=/^([gz])1\.[0-9a-z.~%_-]{4,600}$/i.exec(h);
  var X=BB2.gl={h:m&&BB2.on(m[1]==='g'?'glove':'chal')?h:'',z:0,o:/(^|[&?#])from=54791569(&|$)/.test(h)&&BB2.on('xworld')?1:0};
  if(!X.o&&BB2.on('xworld'))try{X.o=localStorage.getItem('oborona-v1')?2:0;}catch(e){}
  if(X.h&&m[1]==='z'){X.z=1;BB2.hook('march',function(){if(X.z&&Date.now()-t0<25000)return true;},5);}   /* друг по «Спору богатырей»: сначала забава, потом поход */
  /* гость из ленты/виджета/окна выхода (флаг gfeed): новичок в бою через 1,2 с, а не ждёт облако до 3 с (у него облака нет) */
  X.f=/[?&]vk_ref=[^&]*(recommended_game|exit_dialog)/.test(location.search)&&!/[?&](bot|promo)\b/.test(location.search)&&BB2.on('gfeed');
  BB2.hook('ready',function(){X.r=1;if(X.f&&!S.runs)setTimeout(function(){try{if(!G&&!S.runs&&!X.z&&!$('modal').classList.contains('on')){firstGo=true;startRun(0);BB2.stat('glove',{a:'feed'});}}catch(e){}},1200);});
  if(X.h||X.o)BB2.need('glove').then(null,function(){});else if(BB2.on('glove')||BB2.on('chal'))BB2.late('glove');
})();
