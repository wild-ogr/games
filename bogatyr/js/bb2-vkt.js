/* bb2-vkt.js — заглушка VKT. Справка — шапка js/bb2-vkt-x.js */
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  var V=BB2.vkt={},P={},K='bb2pult',Q=location.search,ls=localStorage;
  function rj(k){try{return JSON.parse(ls.getItem(k)||'null');}catch(e){return null;}}
  function wj(k,v){try{ls.setItem(k,JSON.stringify(v));}catch(e){}}
  function day(){try{return dayKey();}catch(e){return '';}}
  function ok(p){return !!(BB2.ob(p)&&p.v===1&&!(p.until&&String(p.until)<day()));}
  function use(p,run){var a=p.off,i,k,w,o,t,v;P=p;
    if(!run&&a&&a.join)for(i=0;i<a.length&&i<40;i++){t=String(a[i]);if(/^[a-z0-9-]{1,16}$/.test(t)&&t!=='pult')BB2.off(t);}
    if(BB2.ob(p.n)&&typeof BB2E==='object')for(k in p.n){w=k.split('.');o=BB2E;for(i=0;o&&i<w.length-1;i++)o=o[w[i]];
      if(!BB2.ob(o)||w[0]==='rules')continue;t=o[w[i]];v=p.n[k];
      if(typeof t==='number'?typeof v==='number'&&isFinite(v)&&v>=0:Array.isArray(t)&&Array.isArray(v)&&v.length===t.length&&v.every(function(x){return typeof x==='number'&&isFinite(x);}))o[w[i]]=v;}}
  V.ok=ok;V.use=use;
  if(BB2.on('pult')&&!/[?&]pult=0/.test(Q)){var c=rj(K);if(ok(c))use(c);
    BB2.hook('utroRow',function(a){var m=P.msg;if(BB2.ob(m)&&m.t&&!(m.until&&String(m.until)<day()))a.unshift({ic:m.ic||'📜',t:String(m.t).slice(0,48),s:String(m.s||'').slice(0,120),hot:1});});}
  BB2.pult=function(path,def){var o=P.x,w=String(path).split('.'),i;for(i=0;BB2.ob(o)&&i<w.length;i++)o=o[w[i]];return o===undefined||o===null?def:o;};
  BB2.lazy('vkt',['js/bb2-vkt-x.js'],function(){return !!V.mail;});
  if(BB2.on('pult')||BB2.on('mail')||BB2.on('vkm2')&&typeof vkmOn==='function'&&vkmOn())BB2.late('vkt');
  V.btn=btn;function btn(el,id,t,f){var d=BB2.put(el,'btns','<button class="btn ghost" id="'+id+'" style="width:100%;margin:8px 0 0">'+t+'</button>',id+'W'),b=d&&d.firstChild;
    if(b)b.onclick=function(){try{SND.click();}catch(e){}BB2.stat('mail',{a:'tap',f:f});BB2.open('vkt',function(){V.mail(f);},b);};}
  BB2.hook('modal',function(k,el){
    if(OK&&el.querySelector('#credOk'))BB2.put(el,'btns','<p class="sub"><b>Поддержка.</b> Вопросы и пожелания — в группе «Игры во дворе» в Одноклассниках.<br><a class="btn ghost" href="https://ok.ru/group/70000058939568" target="_blank" rel="noopener">Открыть группу</a></p>','vktOk'); // i18n:ru ОК п.1.6
    if(!BB2.on('mail'))return;
    if(el.querySelector('#setOk'))btn(el,'vktMl',L('✉️ Челобитная князю Владимиру','✉️ A petition to Prince Vladimir'),'set');
});
})();
