'use strict';
/* ob2-vkt (VKT, буст_в2.0; см. logs/VKT.md): счётчики миссий VK новинок S.o2v по событиям OB2 (флаг vkm2, только VK). Остальное — js/ob2-vkx.js (через 1,5 с). */
(function(){if(typeof OB2==='undefined')return;
  const VK=typeof VKM_ON!=='undefined'&&VKM_ON,M2=OB2.reg('vkm2',{s:'VKT'}),SX=OB2.reg('stx',{s:'VKT'}),ML=OB2.reg('mail',{s:'VKT'});
  const n=x=>Math.max(0,Math.floor(+x||0));
  if(VK&&M2){OB2.field('v',{id:'vkm2'});  // слияние каркаса: числа — максимум, наборы {id:1} — объединение
    let T=0;const V=()=>S.o2v||(S.o2v={}),soon=()=>{if(!T)T=setTimeout(()=>{T=0;try{save();}catch(e){}if(typeof vkmSoon==='function')vkmSoon(800);},300);},
      hi=(k,x)=>{x=n(x);const v=V();if(x>n(v[k])){v[k]=x;soon();}},inc=k=>{const v=V();v[k]=n(v[k])+1;soon();},
      put=(k,id)=>{if(!id)return;const v=V(),o=v[k]&&typeof v[k]==='object'?v[k]:(v[k]={});id=String(id).slice(0,16);if(!o[id]){o[id]=1;soon();}},
      hf=id=>OB2.flags().some(f=>f.id===id),kd=o=>o.k==='lov'||o.k==='tiho'?o.k:hf('lov-'+o.id)?'lov':hf('tiho-'+o.id)?'tiho':'',
      E={mg:o=>{const k=kd(o);if(k)put(k==='lov'?'g':'t',o.id);},rec:o=>{inc('r');if(+o.pl===1)put('p1',o.id);if(kd(o)==='lov')put('g',o.id);},
        igr:o=>{hi('ig',1);if(o.a==='win'||o.a==='end'&&+o.pl===1)inc('iw');},let:o=>hi('lt',o.n),nb7:o=>hi('nb',o.n),skaz:o=>{if(n(o.of)&&n(o.n)>=n(o.of))inc('sk');},
        nakaz:()=>inc('nk'),svz:o=>{inc('sv');hi('ob',o.n);},deco:o=>hi('uk',o.n||1),
        moroz:o=>{const k=o.a==='adv'?'ad':{tree:'el',kar:'kr',look:'sn'}[o.a];if(k)hi(k,o.a==='adv'?o.n:1);}};
    for(const e in E)OB2.on(e,o=>E[e](o&&typeof o==='object'?o:{}),'vkm2');
    // ['код','v',порог,'ключ S.o2v']: набор — число id; Сказ — и по знамёнам sg*
    if(typeof VKM_CNT!=='undefined')VKM_CNT.v=k=>{const v=S.o2v||{},x=v[k];let r=x&&typeof x==='object'?Object.keys(x).length:n(x);
      if(k==='sk'){let s=0;for(const b in S.bns||{})if(/^sg\d+$/.test(b)&&S.bns[b])s++;r=Math.max(r,s);}return r;};}
  if(SX||ML)setTimeout(()=>OB2.need('js/ob2-vkx.js').catch(()=>{}),1500);
})();
