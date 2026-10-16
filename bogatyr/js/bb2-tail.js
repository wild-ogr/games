/* bb2-tail.js — заглушка потока TAIL («хвост для быстрых»): сохранение S.bb2.tail и догрузка. Всё остальное и описание — js/bb2-tail-run.js (набор 'tail'). */
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  var ob=BB2.ob;
  function nm(v){return typeof v==='number'&&v>0&&isFinite(v)?Math.floor(v):0;}
  function a3(a,mx){var r=[0,0,0],i;if(Array.isArray(a))for(i=0;i<3;i++)r[i]=Math.min(mx,nm(a[i]));return r;}
  function mp(o,mx,and){var a={},n=0,k,v;if(ob(o))for(k in o){v=Math.min(mx,nm(o[k]))&and;if(v){a[k]=v;n++;}}return n?a:0;}
  function bt(s){var c=0,i,n;for(i=0;i<3;i++)for(n=s[i];n;n>>=1)c+=n&1;return c;}
  function fix(o){var r={},a,i,x,k,N=['vc','ln','ls','rn','mb','ts'];
    if(a=mp(o.v,30,63))r.v=a;if(a=mp(o.h,31,31))r.h=a;
    for(i=0;i<N.length;i++)if(nm(o[N[i]]))r[N[i]]=nm(o[N[i]]);
    if(typeof o.vl==='string'&&o.vl)r.vl=o.vl.replace(/[^a-z]/g,'').slice(0,16);
    if(typeof o.rd==='string'&&o.rd)r.rd=o.rd.slice(0,10);
    if(ob(o.l)&&nm(o.l.w))r.l={w:nm(o.l.w),c:a3(o.l.c,999),s:a3(o.l.s,7),g:nm(o.l.g)&7};
    if(ob(o.m)&&nm(o.m.s))r.m={s:nm(o.m.s),f:Math.min(100,nm(o.m.f)),t:Math.min(100,nm(o.m.t))};
    if(Array.isArray(o.r)){a=[];for(i=0;i<o.r.length&&a.length<8;i++){x=o.r[i];if(Array.isArray(x)&&typeof x[0]==='string'&&/^[0-9a-z]{2,96}$/.test(x[1]))a.push([x[0].slice(0,6),x[1]]);}if(a.length)r.r=a;}
    return r;}
  function merge(a,c){var r=BB2.mx(a,c),x=a.l,y=c.l,k,i,q; /* числа — максимум, объекты — объединение; ниже — то, что так сливать нельзя */
    if(x&&y)r.l=x.w!==y.w?(x.w>y.w?x:y):''+x.c===''+y.c?{w:x.w,c:x.c,s:[x.s[0]|y.s[0],x.s[1]|y.s[1],x.s[2]|y.s[2]],g:x.g|y.g}:bt(x.s)>=bt(y.s)?x:y;
    x=a.m;y=c.m;if(x&&y)r.m=x.s!==y.s?(x.s>y.s?x:y):{s:x.s,f:Math.max(x.f,y.f),t:Math.max(x.t,y.t)};
    if(a.h&&c.h)for(k in c.h)r.h[k]=(a.h[k]|0)|c.h[k];
    if(a.r&&c.r){r.r=a.r.slice();for(i=0;i<c.r.length&&r.r.length<8;i++){q=0;for(k=0;k<r.r.length;k++)if(r.r[k][0]===c.r[i][0])q=1;if(!q)r.r.push(c.r[i]);}}
    if(a.rd&&c.rd)r.rd=a.rd>c.rd?a.rd:c.rd;
    if(a.vl!==undefined)r.vl=a.vl;return r;}
  BB2.save('tail',{fix:fix,merge:merge});
  BB2.lazy('tail',['js/bb2-tail-run.js'],function(){return !!(BB2.tail&&BB2.tail.ok);});
  var F=['vow','lih','race','most','hq'],i,on=0;for(i=0;i<5;i++)if(BB2.on(F[i]))on=1;
  if(on&&BB2.late)BB2.late('tail');
})();
