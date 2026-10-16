/* «Былина о походе» (BYL): заглушка, флаг byl. Справка — js/bb2-byl-run.js */
(function(){
  var Y={},ob=BB2.ob,H=BB2.hook;
  function q(e){return parseInt(e,36)||0;}
  function ss(a,n){var r=[],i;a=Array.isArray(a)?a:[];for(i=0;i<a.length;i++)if(typeof a[i]==='string'&&a[i]&&a[i].length<181&&r.indexOf(a[i])<0)r.push(a[i]);return r.slice(-n);}
  function sq(a){return ss(a,99).sort(function(x,y){return q(x)-q(y);});}
  function fix(o){var r={},a=sq(o.l).slice(-12),c=sq(o.b),b=[],s={},i,k;
    for(i=0;i<c.length;i++){k=c[i].split('|')[2];try{k=chDef(q(k)).boss;}catch(e){}if(!s[k]){s[k]=1;b.push(c[i]);}}
    if(a[0])r.l=a;if(b[0])r.b=b;if(o.n>0)r.n=Math.floor(o.n);if(o.g)r.g=1;if(o.bk>0)r.bk=Math.floor(o.bk);if(typeof o.r==='string'&&o.r)r.r=o.r.slice(-48);
    c=ss(o.k,2);if(c[0])r.k=c;
    while(JSON.stringify(r).length>1900){if(r.k)delete r.k;else if(a[5])a.shift();else if(b[1])b.shift();else break;}
    return r;}
  BB2.save('byl',{fix:fix,merge:function(a,c){a=ob(a)||{};c=ob(c)||{};function u(k){return (Array.isArray(a[k])?a[k]:[]).concat(c[k]||[]);}
    return fix({l:u('l'),b:u('b'),n:Math.max(a.n|0,c.n|0),g:a.g||c.g,bk:Math.max(a.bk|0,c.bk|0),r:a.r||c.r,k:u('k')});}});
  Y.fix=fix;
  function ck(){return !!Y.eng;}var N=typeof LANG!=='undefined'&&LANG==='en'?'bylen':'byl';
  BB2.lazy('byl',['js/bb2-byl-ru.js','js/bb2-byl-run.js'],ck);BB2.lazy('bylen',['js/bb2-byl-en.js','js/bb2-byl-run.js'],ck);
  function go(f,a,b){if(BB2.on('byl'))return BB2.need(N).then(function(){return Y.eng[f](a,b);},function(){});}
  function R(){return Y.run||(Y.run={ch:[],um:{},pd:0,x:{}});}
  H('run',function(){Y.run=Y.end=null;});
  H('chudo',function(id){var c=R().ch;if(c.indexOf(id)<0)c.push(id);});
  H('um',function(id,x){var u=R().um;if(x&&x.over)id='over';u[id]=(u[id]||0)+1;});
  H('pdvDone',function(o){if(o&&o.run)R().pd++;});
  H('sud',function(o){var v=ob(o)?o.v:o;if(ob(o)&&o.src==='book')return;Y.fact('sud',v==='m'?'mercy':v==='x'?'exile':v);});
  Y.fact=function(k,v){R().x[k]=v===undefined?1:v;if(Y.eng)Y.eng.fact();};
  H('end',function(G,w){Y.end=[G,w];go('end',G,w);},80);
  H('modal',function(k,el){var n=k==='result'||k==='nv',r,g;if(!el||!BB2.on('byl'))return;
    if(n){r=BB2.put(el,'btns','','bylRow');r.style.minHeight='56px';g=el.querySelector('.goldrow');if(g&&S.runs>1)g.parentNode.insertBefore(r,g.nextSibling);}
    if(n||k==='evku')go('modal',k,el);});
  function warm(){if(BB2.on('byl')&&S.runs>0)BB2.bg(N);}
  H('ready',warm);H('menu',warm);
  H('vil',function(el){if(BB2.s('byl').n)go('vil',el);});
  ['open','book','svitok','nameAsk'].forEach(function(f){Y[f]=function(){return go(f)||Promise.resolve('');};});
  Y.name=function(){return Y.nm||'';};
  BB2.byl=Y;
})();
