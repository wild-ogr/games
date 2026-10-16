/* bb2-nech.js — заглушка NECH «Ночь нечисти» (флаг nech; режим — js/bb2-nech-run.js, справка там). S.bb2.nech={b,n,d,g,w,wb,l,i} */
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  function num(v){return typeof v==='number'&&isFinite(v)&&v>0?Math.floor(v):0;}
  function str(v){return typeof v==='string'&&v.length<12?v:'';}
  BB2.save('nech',{
    fix:function(o){var r={},b={},k,nb=0;if(BB2.ob(o.b))for(k in o.b)if(/^[a-z_0-9]{2,12}$/.test(k)&&num(o.b[k])){b[k]=Math.min(99999,num(o.b[k]));nb++;}
      if(nb)r.b=b;if(num(o.n))r.n=num(o.n);if(str(o.d)){r.d=o.d;if(num(o.g))r.g=Math.min(9,num(o.g));}
      if(num(o.w)){r.w=num(o.w);if(num(o.wb))r.wb=num(o.wb);}if(o.i)r.i=1;if(str(o.l))r.l=o.l;return r;},
    merge:function(a,c){var r=BB2.mx({b:a.b||{},n:a.n||0,i:a.i||0},{b:c.b||{},n:c.n||0,i:c.i||0});
      var ad=a.d||'',cd=c.d||'';if(ad||cd){r.d=ad>=cd?ad:cd;r.g=ad===cd?Math.max(a.g||0,c.g||0):(ad>cd?a.g:c.g)||0;}
      var aw=a.w||0,cw=c.w||0;if(aw||cw){r.w=Math.max(aw,cw);r.wb=aw===cw?Math.max(a.wb||0,c.wb||0):(aw>cw?a.wb:c.wb)||0;}
      if(a.l||c.l)r.l=a.l||c.l;return r;}});
  BB2.lazy('nech',['js/bb2-nech-run.js'],function(){return !!(BB2.nech&&BB2.nech.ok);});
  function done(){var n=0,k;try{for(k in S.done)if(S.done[k])n++;}catch(e){}return n;}
  BB2.nechOpen=function(){return BB2.on('nech')&&done()>=BB2.n('nech.openCh',6);};
  BB2.hook('map',function(el){try{if(!el||!BB2.nechOpen())return;var w=isWide(),ci=el.querySelector(w?'#chInfo':'.gobar');if(!ci)return;
    var d=document.createElement('div');d.id='nechBar';d.className='card';d.style.cssText='display:flex;align-items:center;gap:8px;margin:6px 0;padding:6px 10px;cursor:pointer';
    d.innerHTML='<img src="'+iconURL('solo',64)+'" width="40" height="40" alt=""><div style="flex:1;text-align:left;line-height:1.25"><b>'+L('🌙 Ночь нечисти','🌙 Night of the Fiends')+
      '</b><br><span style="font-size:12px;opacity:.8">'+L('Сыграй за злодея — до первых петухов','Play the villain — until the roosters crow')+'</span></div><button class="btn" id="nechGo">'+L('Играть','Play')+'</button>';
    ci.parentNode.insertBefore(d,w?ci:ci.nextSibling);BB2.stat('nech',{a:'show'});
    d.onclick=function(){if(typeof SND!=='undefined')SND.click();BB2.stat('nech',{a:'tap'});BB2.open('nech',function(){BB2.nech.open('map');},d.querySelector('#nechGo'));};
  }catch(e){try{console.warn('bb2 nech map',e);}catch(x){}}});
})();
