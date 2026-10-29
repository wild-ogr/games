'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4a',{t:'Зина 4.0: кухня, дача и авоська',who:'KUHNYA'});
var F={borsch:'Общий борщ недели (уровни — ингредиенты)',book:'Кулинарная книга: слова-продукты → блюда',dacha:'Грядка слов на балконе',
pod:'Подкидыш-слово дня',avo:'Авоська дня',val:'Словарь Валерки (выдуманные толкования не-слов)'};
var O={};for(var k in F)O[k]=Z.reg('z4a.'+k,{t:'Кухня: '+F[k],who:'KUHNYA'});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
function bits(a,b){a=typeof a==='string'?a:'';b=typeof b==='string'?b:'';var r='',L=Math.max(a.length,b.length);
for(var i=0;i<L;i++)r+=(a.charAt(i)==='1'||b.charAt(i)==='1')?'1':'0';return r.slice(0,64);}
var DEF={w:0,bi:[],bn:[0,0],bf:0,bh:'',kp:'',kc:'',g:[],gw:0,gj:0,gd:0,gh:0,gk:0,pd:0,pw:'',pl:0,ps:0,pn:0,ad:0,ai:'',af:0,an:0,vn:0,vd:0,vc:0};
var NK=['w','bf','gw','gj','gd','gh','gk','pd','pl','ps','pn','ad','af','an','vn','vd','vc'];
function str(x,L){return typeof x==='string'?x.slice(0,L):'';}
Z.field('z4a',{def:JSON.parse(JSON.stringify(DEF)),
fix:function(z){NK.forEach(function(k){z[k]=n(z[k]);});z.gj=Math.min(3,z.gj);
z.bi=(z.bi instanceof Array?z.bi:[]).slice(0,2).map(n);z.bn=(z.bn instanceof Array?z.bn:[0,0]).slice(0,2).map(n);while(z.bn.length<2)z.bn.push(0);
z.bh=str(z.bh,80);z.kp=str(z.kp,64).replace(/[^01]/g,'0');z.kc=str(z.kc,64).replace(/[^01]/g,'0');z.pw=str(z.pw,16);z.ai=str(z.ai,60);
z.g=(z.g instanceof Array?z.g:[]).slice(0,3).map(function(b){return b instanceof Array&&typeof b[0]==='string'&&b[0].length===1?[b[0],n(b[1])]:'';});
for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c,newer){if(!c||typeof c!=='object')return;
if(n(c.w)>n(m.w)){m.w=n(c.w);m.bi=c.bi;m.bn=c.bn;m.bf=n(c.bf);}
else if(n(c.w)===n(m.w)&&c.bn instanceof Array&&m.bn instanceof Array){for(var i=0;i<2;i++)m.bn[i]=Math.max(n(m.bn[i]),n(c.bn[i]));m.bf=n(m.bf)|n(c.bf);}
var h={};(str(m.bh,80)+','+str(c.bh,80)).split(',').forEach(function(x){var p=x.split(':');if(p.length===2&&n(p[0]))h[p[0]]=Math.max(h[p[0]]||0,n(p[1]));});
m.bh=Object.keys(h).sort().slice(-6).map(function(k){return k+':'+h[k];}).join(',');
m.kp=bits(m.kp,c.kp);m.kc=bits(m.kc,c.kc);
if(newer){m.g=c.g;m.gj=n(c.gj);}m.gw=Math.max(n(m.gw),n(c.gw));m.gd=Math.max(n(m.gd),n(c.gd));m.gh=Math.max(n(m.gh),n(c.gh));m.gk=Math.max(n(m.gk),n(c.gk));
if(n(c.pd)>n(m.pd)){m.pd=n(c.pd);m.pw=str(c.pw,16);m.pl=n(c.pl);m.ps=n(c.ps);}else if(n(c.pd)===n(m.pd))m.ps=Math.max(n(m.ps),n(c.ps));m.pn=Math.max(n(m.pn),n(c.pn));
if(n(c.ad)>n(m.ad)){m.ad=n(c.ad);m.ai=str(c.ai,60);m.af=n(c.af);}else if(n(c.ad)===n(m.ad))m.af=n(m.af)|n(c.af);m.an=Math.max(n(m.an),n(c.an));
m.vn=Math.max(n(m.vn),n(c.vn));if(n(c.vd)>n(m.vd)){m.vd=n(c.vd);m.vc=n(c.vc);}else if(n(c.vd)===n(m.vd))m.vc=Math.max(n(m.vc),n(c.vc));}});
if(!ON)return;
Z.KUHNYA={on:O,DEF:DEF,n:n,bits:bits};
Z.OPEN.z4a=4;Z.OPEN['z4a.pod']=5;Z.OPEN['z4a.dacha']=6;
if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4a==null)ZBECO.cap.z4a=15;
Z3.late('js/zb4-kuhnya-s.js',{day:4});
})();
