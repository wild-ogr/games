'use strict';
try{(function(){
if(!window.Z4||!window.Z3||typeof ZB==='undefined')return;
var L={y:6,h:4,c:4,e:4,t:4,q:2};
function A(a,n){var r=[];for(var i=0;i<n;i++){var x=a&&+a[i];r.push(isFinite(x)&&x>0?Math.floor(x):0);}return r;}
Z4.field('z4v',{def:{},
merge:function(m,c){for(var k in L){var a=A(m[k],L[k]),b=A(c&&c[k],L[k]);if(b[0]>a[0])a=b;else if(b[0]===a[0])for(var i=1;i<a.length;i++)a[i]=Math.max(a[i],b[i]);m[k]=a;}},
fix:function(z){for(var k in L)z[k]=A(z[k],L[k]);for(var j in z)if(!L[j])delete z[j];}});
var ON=Z4.reg('z4v',{t:'Зина 4.0: события дома для всех (буква пропала, Час Зины, цвет подъезда, выборы, мужья и жёны)',who:'VSEM'});
if(ON)Z3.late('js/zb4-vsem-x.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(!window.Z4||!Z4.on||typeof S==='undefined')return;
var R={sem:'Дед Семён влюбился: записки с ошибками, финал — голос двора',gal:'Галя хвастается внучкой Леночкой (строка победы)',call:'Зина звонит раз в неделю (рисованный звонок, карточка Дома)',
cur:'Курьер перепутал посылку Валентины Петровны',blog:'Зина-блогер: пост Валерки и комментарии соседей',wed:'Свадьба Ятя — финал сезона 2',pet:'Петрович заходил (встречные строки гостя из Рыбалки)'};
if(!Z4.reg('z4n',{t:'ROMAN: сериал двора, герои живут',who:'ROMAN'}))return;
for(var k in R)Z4.reg('z4n.'+k,{t:R[k],who:'ROMAN'});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var NK=['d','lt','gb','gx','sc','sn','sd','vc','vo','rs','cw','pd','ps','bd','bl','bn','gw','ww','pt','cd','cc'],DEF={pw:'',wg:''};NK.forEach(function(k){DEF[k]=0;});
var G=[['d','lt','gb','gx'],['sc','sn','sd'],['vc','vo'],['pd','ps','pw'],['gw','wg'],['cd','cc']];
Z4.field('z4n',{def:DEF,
fix:function(z){NK.forEach(function(k){z[k]=n(z[k]);});z.pw=typeof z.pw==='string'?z.pw.slice(0,16):'';z.wg=typeof z.wg==='string'?z.wg.slice(0,160):'';for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
G.forEach(function(g){var a=n(m[g[0]]),b=n(c[g[0]]);if(b>a)g.forEach(function(k){m[k]=c[k];});
else if(a===b)g.slice(1).forEach(function(k){if(k==='wg'){var u=[];(String(m.wg||'')+','+String(c.wg||'')).split(',').forEach(function(x){if(x&&u.indexOf(x)<0)u.push(x);});m.wg=u.slice(0,10).join(',');}
else if(k==='pw'){if(!m.pw)m.pw=c.pw||'';}else m[k]=Math.max(n(m[k]),n(c[k]));});});
['rs','cw','bd','bl','bn','ww','pt'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});}});
Z3.late('js/zb4-roman-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(!window.Z4||!Z4.on||typeof ZB==='undefined'||typeof S==='undefined')return;
if(!Z4.reg('z4u',{t:'Зина 4.0: «Зина чудит» — особые дни и атмосфера',who:'CHUDO'}))return;
var F={},L=[['apr','1 апреля: двор вверх ногами, «Утренняя», письмо от Ятя'],['night','Ночная смена 0–5: торшер, шёпот, буквы-мотыльки'],
['kuz','Домовой Кузьма: записки и блюдце'],['det','Кто съел пирожки: улики в главе и дело дня в газете'],['hor','Бабушкин гороскоп по букве дня'],
['utro','Утро с Зиной 7–10: зарядка, погода, совет'],['tv','Телевизор соседей: бегущая строка с ошибками']];
L.forEach(function(x){F[x[0]]=Z4.reg('z4u.'+x[0],{t:x[1],who:'CHUDO'});});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var NK=['k','af','kv','kn','kp','kd','kg','kc','dc','dl','dp','dv','dr','dm','ds','um','ub','tn','td','tc','hd'];
var DEF={};NK.forEach(function(k){DEF[k]=0;});DEF.ks='';
Z4.field('z4u',{def:JSON.parse(JSON.stringify(DEF)),
fix:function(z){NK.forEach(function(k){z[k]=n(z[k]);});z.ks=typeof z.ks==='string'?z.ks.slice(0,12):'';for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
['k','af','kv','kn','kg','kc','dv','dr','dm','ds','um','tn','td','hd'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});
if(n(c.dc)>n(m.dc)){m.dc=n(c.dc);m.dl=n(c.dl);}else if(n(c.dc)===n(m.dc))m.dl=n(m.dl)|n(c.dl);
m.dp=Math.max(n(m.dp),n(c.dp));if(m.dp&&m.dv>=m.dp)m.dp=0;
if(n(c.kd)>n(m.kd)){m.kd=n(c.kd);m.ks=typeof c.ks==='string'?c.ks.slice(0,12):'';}
if(n(c.td)>=n(m.td))m.tc=Math.max(n(m.tc),n(c.tc));
if(n(c.um)>n(m.um))m.ub=n(c.ub);else if(n(c.um)===n(m.um)&&n(c.ub))m.ub=m.ub?Math.min(n(m.ub),n(c.ub)):n(c.ub);
m.kp=0;}});
window.Z4U={F:F,DEF:DEF,n:n};
Z3.late('js/zb4-chudo-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4w',{t:'Зина 4.0: телешоу у Зины (табло, барабан, лото, квартирник)',who:'SHOW'});if(!ON)return;
var N=['m','p','pl','k','d','ls','n','bs','bp','bl','bk','pz','pt','vl','vol'];
function num(v){v=Math.floor(+v||0);return v>0?v:0;}
Z.field('z4w',{def:{m:0,p:0,pl:0,k:0,d:0,ls:0,n:0,bs:0,bp:0,bl:0,bk:0,pz:0,pt:0,vl:0,vol:2,lw:null},
merge:function(a,c){
if(num(c.m)>num(a.m)){a.m=num(c.m);a.p=num(c.p);a.pl=num(c.pl);}else if(num(c.m)===num(a.m)){a.p=Math.max(num(a.p),num(c.p));a.pl=Math.max(num(a.pl),num(c.pl));}
if(num(c.k)>num(a.k)){a.k=num(c.k);a.d=num(c.d);a.ls=num(c.ls);}else if(num(c.k)===num(a.k)){a.d=num(a.d)|num(c.d);a.ls=Math.max(num(a.ls),num(c.ls));}
['n','bs','bp','bl','bk','vl','pz','pt'].forEach(function(k){a[k]=Math.max(num(a[k]),num(c[k]));});
if(c.lw&&typeof c.lw==='object'&&(!a.lw||num(c.lw.k)>num(a.lw.k)))a.lw={i:num(c.lw.i),w:String(c.lw.w||'').slice(0,12),k:num(c.lw.k)};},
fix:function(z){N.forEach(function(k){z[k]=num(z[k]);});if(z.vol>2)z.vol=2;z.d&=63;
if(z.lw&&(typeof z.lw!=='object'||typeof z.lw.w!=='string'))z.lw=null;else if(z.lw)z.lw={i:num(z.lw.i),w:z.lw.w.slice(0,12),k:num(z.lw.k)};}});
Z.OPEN.z4w=8;
Z3.late('js/zb4-show-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4o',{t:'Зина 4.0: открытки и табели «переслать»',who:'OTKR'});
var F={utro:'Открытка «С добрым утром» (Дом, до 13:00)',hol:'Праздничная открытка (без голоса)',perl:'«Перл дня» в «Вечёрке»',
dnev:'Дневник за неделю (воскресенье)',den:'«История дня» (сторис VK)',tab:'Табель уровня (строка окна победы)'};
var O={};for(var k in F)O[k]=Z.reg('z4o.'+k,{t:'Открытки: '+F[k],who:'OTKR'});
var D=['u','dv','st'],W=['n','w','h','b','c'],T=['tn','tw'];
function fx(z){D.concat(W,T,['k','d','td']).forEach(function(x){z[x]=Math.max(0,Math.floor(+z[x]||0));});z.d&=127;}
Z.field('z4o',{def:{u:0,dv:0,st:0,k:0,n:0,w:0,h:0,b:0,c:0,d:0,td:0,tn:0,tw:0},
merge:function(m,c){fx(c);D.forEach(function(x){m[x]=Math.max(+m[x]||0,c[x]);});
if(c.k>(+m.k||0)){m.k=c.k;m.d=c.d;W.forEach(function(x){m[x]=c[x];});}
else if(c.k===+m.k){m.d=(+m.d|0)|c.d;W.forEach(function(x){m[x]=Math.max(+m[x]||0,c[x]);});}
if(c.td>(+m.td||0)){m.td=c.td;T.forEach(function(x){m[x]=c[x];});}
else if(c.td===+m.td)T.forEach(function(x){m[x]=Math.max(+m[x]||0,c[x]);});},
fix:fx});
if(!ON)return;
Z.OTKR={on:O};
Z.OPEN.z4o=4;
Z3.late('js/zb4-otkr-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4s',{t:'Зина 4.0: счёт уровня (медали, фишки счёта)',who:'SCHET'});
var F={medal:'Буквы-медали (основа счёта уровня)',bank:'Фишка «Банк!»: кон удваивается, промах сжигает кон',last:'Фишка: каждое слово дороже, последнее — золотое',
ladder:'Фишка «Лесенка»: слова по возрастанию длины',chalk:'Фишка «Мел-множитель» ×1–×5',chain:'Фишка «Цепочка слов» (на последнюю букву)',twin:'Фишка «Близнецы» (КОТ—ТОК)'};
var O={};for(var k in F)O[k]=Z.reg('z4s.'+k,{t:'Счёт: '+F[k],who:'SCHET'});
Z.field('z4s',{def:{b:0,n:0,cd:0,cn:0},merge:function(m,c){m.b=Math.max(+m.b||0,+c.b||0);m.n=Math.max(+m.n||0,+c.n||0);
if((+c.cd||0)>(+m.cd||0)){m.cd=+c.cd;m.cn=+c.cn||0;}else if(+c.cd===+m.cd)m.cn=Math.max(+m.cn||0,+c.cn||0);},
fix:function(z){['b','n','cd','cn'].forEach(function(x){z[x]=Math.max(0,Math.floor(+z[x]||0));});}});
if(!ON)return;
Z.SCHET={on:O};
Z.OPEN.z4s=4;
Z3.late('js/zb4-schet-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(!window.Z4||!Z4.on||typeof S==='undefined')return;
var R={vn:'Внук Тёма: бабушкин переводчик (сленг → русское слово из букв)',mem:'Мемуары Зины из твоих редких слов',so:'Сочинение и «чепуха» из слов уровня',
nm:'Как Зине тебя звать (одно имя на всю игру)',fut:'Письмо себе в будущее (вручит через 30 дней)'};
if(!Z4.reg('z4m',{t:'SOCH: твои слова — в текст',who:'SOCH'}))return;
for(var k in R)Z4.reg('z4m.'+k,{t:R[k],who:'SOCH'});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
function s(x,m){return typeof x==='string'?x.slice(0,m):'';}
var NK=['nq','nn','vd','vk','vn','mc','md','mv','sn','fs','ft','fg','fl','fw','cd','cc'],DEF={mw:'',fp:''};NK.forEach(function(k){DEF[k]=0;});
function uni(a,b,m){var u=[];(s(a,400)+','+s(b,400)).split(',').forEach(function(x){if(x&&u.indexOf(x)<0)u.push(x);});return u.slice(0,m).join(',');}
Z4.field('z4m',{def:DEF,
fix:function(z){NK.forEach(function(k){z[k]=n(z[k]);});z.mw=s(z.mw,400);z.fp=s(z.fp,20);for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
['nq','nn','vd','vk','vn','md','mv','sn','fw'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});
if(n(c.nq)===1||n(m.nq)===1)m.nq=1;
m.mw=uni(m.mw,c.mw,30);m.mc=Math.max(n(m.mc),n(c.mc),m.mw?m.mw.split(',').length:0);
if(n(c.ft)>n(m.ft)){['fs','ft','fg','fl','fw'].forEach(function(k){m[k]=n(c[k]);});m.fp=s(c.fp,20);}
else if(n(c.ft)===n(m.ft))m.fs=Math.max(n(m.fs),n(c.fs));
if(n(c.cd)>n(m.cd)){m.cd=n(c.cd);m.cc=n(c.cc);}else if(n(c.cd)===n(m.cd))m.cc=Math.max(n(m.cc),n(c.cc));}});
Z4.OPEN['z4m']=4;
Z3.late('js/zb4-soch-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(!window.Z4||!window.Z3||typeof ZB==='undefined')return;
var N=['cd','cs','cn','fd','fn','ft','td','tn','rg','gd','gn','gw'];
function I(v){v=Math.floor(+v||0);return isFinite(v)&&v>0?v:0;}
Z4.field('z4h',{def:{},
merge:function(m,c){c=c||{};N.forEach(function(k){if(k==='rg'){m.rg=I(m.rg)||I(c.rg);return;}m[k]=Math.max(I(m[k]),I(c[k]));});
var a=m.ra&&typeof m.ra==='object'?m.ra:{},b=c.ra&&typeof c.ra==='object'?c.ra:{};for(var q in b)if(!a[q])a[q]=b[q];m.ra=a;},
fix:function(z){N.forEach(function(k){z[k]=I(z[k]);});var r=z.ra&&typeof z.ra==='object'?z.ra:{},o={},n=0;
for(var q in r)if(/^[a-z0-9]{1,8}$/.test(q)&&(r[q]===1||r[q]===2)&&n++<40)o[q]=r[q];z.ra=o;
for(var j in z)if(N.indexOf(j)<0&&j!=='ra')delete z[j];}});
var ON=Z4.reg('z4h',{t:'Зина 4.0: двор на связи (чат дома, холодильник, испорченный телефон, как у вас называют, свёрток под дверью)',who:'CHAT'});
if(ON)Z3.late('js/zb4-chat-x.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var N=['ap','em','eb','en','dm','de','yc','yn','od','ob','os'];
function n(x){x=Math.floor(+x||0);return x>0?x:0;}
function bits(s){return String(s||'').replace(/[^01]/g,'').slice(0,60);}
function or(a,b){a=bits(a);b=bits(b);var r='',i;for(i=0;i<Math.max(a.length,b.length);i++)r+=(a[i]==='1'||b[i]==='1')?'1':'0';return r;}
function fx(z){N.forEach(function(k){z[k]=n(z[k]);});z.ab=bits(z.ab);for(var k in z)if(k!=='ab'&&N.indexOf(k)<0)delete z[k];}
function pair(m,c,k,L){if(c[k]>m[k]){m[k]=c[k];L.forEach(function(x){m[x]=c[x];});}else if(c[k]===m[k])L.forEach(function(x){m[x]=Math.max(m[x],c[x]);});}
Z.field('z4x',{def:{ab:''},
merge:function(m,c){fx(m);c=c||{};fx(c);m.ab=or(m.ab,c.ab);m.ap=Math.max(m.ap,c.ap);
pair(m,c,'em',['eb']);pair(m,c,'dm',['de']);pair(m,c,'od',['os']);
['en','yc','yn','ob'].forEach(function(k){m[k]=Math.max(m[k],c[k]);});},
fix:fx});
var ON=Z.reg('z4x',{t:'Зина 4.0: экзамены и грамотность (антресоль, экзамен месяца, диктант дома, ять, у доски)',who:'SHKOLA'});
if(!ON)return;
var F={ant:'«Антресоль»: тетрадь 1975 года, страница в неделю',ege:'Экзамен месяца у Зины',dk:'Диктант дома (1-я суббота, 12:00)',
yat:'Дореформенный уровень с ятем (раз в главу)',otl:'«У доски»: 15 вопросов'},O={};
for(var k in F)O[k]=Z.reg('z4x.'+k,{t:'Школа: '+F[k],who:'SHKOLA'});
Z.SHK={on:O};
Z.OPEN['z4x.ant']=8;Z.OPEN['z4x.ege']=8;Z.OPEN['z4x.otl']=8;Z.OPEN['z4x.dk']=4;Z.OPEN['z4x.yat']=8;
Z3.late('js/zb4-shkola-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
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
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on||typeof ZB==='undefined')return;
var ON=Z.reg('z4p',{t:'Зина 4.0: пари, ставки, пятёрки, контрольная завуча, правило недели',who:'PARI'});
var F={moy:'Пари с моим: 3 маленькие цели по ходу уровня',st:'Ставка на уровень (монеты игры, ×3)',s5:'Пятёрки подряд: уровни без подсказок',
ctl:'Контрольная завуча (каждый 20-й уровень с 40-го)',wk:'Правило недели (очки ✦, в «Вечёрке»)'};
var O={};for(var k in F)O[k]=Z.reg('z4p.'+k,{t:'Пари: '+F[k],who:'PARI'});
var MX=['sb','gp','pn','pw','pa','sw','kl','km','kf','wa'],NW=['s','op','kr'],ALL=MX.concat(NW,['sd','sn']);
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var DEF={};ALL.forEach(function(x){DEF[x]=0;});
Z.field('z4p',{def:JSON.parse(JSON.stringify(DEF)),
merge:function(m,c,newer){if(!c||typeof c!=='object')return;MX.forEach(function(x){m[x]=Math.max(n(m[x]),n(c[x]));});
if(newer)NW.forEach(function(x){m[x]=n(c[x]);});
if(n(c.sd)>n(m.sd)){m.sd=n(c.sd);m.sn=n(c.sn);}else if(n(c.sd)===n(m.sd))m.sn=Math.max(n(m.sn),n(c.sn));
m.sb=Math.max(n(m.sb),n(m.s));},
fix:function(z){ALL.forEach(function(x){z[x]=n(z[x]);});for(var k in z)if(!(k in DEF))delete z[k];if(z.op>1)z.op=1;if(z.kr>1)z.kr=1;}});
if(!ON)return;
Z.PARI={on:O,DEF:DEF,n:n};
Z.OPEN.z4p=4;
Z3.late('js/zb4-pari-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4c',{t:'Зина 4.0: клетки и виды кроссворда',who:'KLETKI'});
var F={bag:'«Кот в мешке» — клетка-сюрприз',pie:'«Горячий пирожок» — ×2 за минуту',flip:'«Кроссворд-перевёртыш» — ошибки Валерки',
dark:'«Тёмный кроссворд» — свет отключили',theme:'«Что общего?» — тетрадка Зины',key:'«Ключевое слово» в серых клетках'};
var O={};for(var k in F)O[k]=Z.reg('z4c.'+k,{t:'Клетки: '+F[k],who:'KLETKI'});
Z.field('z4c',{def:{s:'',d:0,n:0,c:[0,0]},
merge:function(m,c){var s=String(m.s||''),t=String(c.s||'');for(var i=0;i<t.length;i++)if(s.indexOf(t[i])<0)s+=t[i];m.s=s;
m.d=Math.max(+m.d||0,+c.d||0);m.n=Math.max(+m.n||0,+c.n||0);
var a=m.c instanceof Array?m.c:[0,0],b=c.c instanceof Array?c.c:[0,0];m.c=(+b[0]||0)>(+a[0]||0)?b:(+b[0]===+a[0]?[+a[0]||0,Math.max(+a[1]||0,+b[1]||0)]:a);},
fix:function(z){z.s=String(z.s||'').replace(/[^a-z]/g,'').slice(0,12);z.d=Math.max(0,Math.floor(+z.d||0));z.n=Math.max(0,Math.floor(+z.n||0));
if(!(z.c instanceof Array)||z.c.length!==2)z.c=[0,0];}});
if(!ON)return;
Z.KLETKI={on:O};
Z.OPEN.z4c=4;Z.OPEN['z4c.flip']=8;Z.OPEN['z4c.dark']=8;
Z3.late('js/zb4-kletki-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4e',{t:'Зина 4.0: происшествия в уровне (сверлят, лифт, звонок Гали, сквозняк, чайник, развилка)',who:'SOBYT'});
var F={drill:'Сосед сверлит: буквы дрожат 30 с, слова ×2 «за терпение»',lift:'Застряли в лифте с соседом: 3 минуты, сосед подсказывает',
galya:'Звонок Гали: собери слово из 5 букв за 15 с (ОК 25 с)',draft:'Сквозняк: две буквы круга другие на 30 с, новые слова ×2',
kettle:'Чайник засвистел: следующее слово за 20 с — чай с пирожком',fork:'Развилка: выбор события следующего уровня (Тёмный ×2 / Галя / Спокойный)'};
var O={};for(var k in F)O[k]=Z.reg('z4e.'+k,{t:'Происшествие: '+F[k],who:'SOBYT'});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
Z.field('z4e',{def:{l:{},ld:0,f:{lv:0,id:''},n:0},
merge:function(m,c){if(!c||typeof c!=='object')return;m.l=m.l||{};var L=c.l||{};for(var k in L)m.l[k]=Math.max(n(m.l[k]),n(L[k]));
m.ld=Math.max(n(m.ld),n(c.ld));m.n=Math.max(n(m.n),n(c.n));if(c.f&&n(c.f.lv)>n(m.f&&m.f.lv))m.f={lv:n(c.f.lv),id:String(c.f.id||'').slice(0,8)};},
fix:function(z){var L=z.l&&typeof z.l==='object'?z.l:{},o={};for(var k in F)if(L[k])o[k]=n(L[k]);if(L.dark)o.dark=n(L.dark);z.l=o;
z.ld=n(z.ld);z.n=n(z.n);var f=z.f&&typeof z.f==='object'?z.f:{};z.f={lv:n(f.lv),id:/^(dark|galya|-)$/.test(f.id)?f.id:''};
for(var x in z)if(!/^(l|ld|f|n)$/.test(x))delete z[x];}});
if(!ON)return;
Z.SOBYT={on:O};
Z.OPEN.z4e=4;
Z3.late('js/zb4-sobyt-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on||typeof ZB==='undefined'||typeof S==='undefined')return;
if(!Z.reg('z4r',{t:'Зина 4.0: «Сто к одному» — слова соседей',who:'STO'}))return;
var F={},L=[['sto','M35 «Сто к одному»: у слова — сколько соседей его нашли'],['yat','M31 Ять-слова: редкость бонусных слов, гербарий в комоде'],
['pod','M30 Подсказка от подъезда (застрял — буква слова, с которого начинали соседи)'],['mut','B47 Слово-мутант (золотое, в валенках, в кокошнике)'],
['spor','B19 Великий спор: как правильно? (вопрос дня, дом голосует)'],['err','B38 Зина ошиблась! Красная ручка на Зину']];
L.forEach(function(x){F[x[0]]=Z.reg('z4r.'+x[0],{t:x[1],who:'STO'});});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
function arr(a,k){var o=[];for(var i=0;i<k;i++)o.push(n(a&&a[i]));return o;}
var NK=['sd','sr','sn','zd','zn','hu'];
Z.field('z4r',{def:{h:[0,0,0,0],m:[0,0,0,0],sd:0,so:-1,sr:0,sn:0,zd:0,zn:0,hu:0},
fix:function(z){z.h=arr(z.h,4);z.m=arr(z.m,4);NK.forEach(function(k){z[k]=n(z[k]);});z.so=(+z.so>=0&&+z.so<=3)?Math.floor(+z.so):-1;
for(var k in z)if(!/^(h|m|so|sd|sr|sn|zd|zn|hu)$/.test(k))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
['h','m'].forEach(function(k){var a=arr(m[k],4),b=arr(c[k],4);m[k]=a.map(function(x,i){return Math.max(x,b[i]);});});
['sr','sn','zd','zn','hu'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});
if(n(c.sd)>n(m.sd)){m.sd=n(c.sd);m.so=(+c.so>=0&&+c.so<=3)?Math.floor(+c.so):-1;}}});
Z.OPEN.z4r=4;
window.Z4R={F:F,n:n};
Z3.late('js/zb4-sto-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(!window.Z4||!Z4.on||typeof ZB==='undefined'||typeof S==='undefined')return;
if(!Z4.reg('z4k',{t:'Зина 4.0: «Ять — главный» — кот в уровне, тетрадка, побег, санаторий',who:'KOT'}))return;
var F={};[['vor','Ять ворует буквы из круга (событие в уровне)'],['kr','Ять садится на клетку кроссворда (событие в уровне)'],
['tet','Тетрадка Ятя: проверь красной ручкой (карточка Дома)'],['beg','Ять в бегах: «видели…», молоко по возвращении'],
['san','Зина в санатории — неделю ведёт кот (раз в сезон, с 8-го дня)']].forEach(function(x){F[x[0]]=Z4.reg('z4k.'+x[0],{t:x[1],who:'KOT'});});
Z4.OPEN['z4k.san']=8;
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var K=['vl','kl','vn','kn','lp','tq','td','tn','tg','bm'],DEF={};K.forEach(function(k){DEF[k]=0;});
Z4.field('z4k',{def:JSON.parse(JSON.stringify(DEF)),
fix:function(z){K.forEach(function(k){z[k]=n(z[k]);});for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;K.forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});}});
window.Z4K={F:F,DEF:DEF,n:n};
Z3.late('js/zb4-kot-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(!window.Z4||!window.Z3||typeof ZB==='undefined')return;
var N=['d','nt','ng','gr','gw','gl','cwk','cwn'];
function I(v){v=Math.floor(+v||0);return isFinite(v)&&v>0?v:0;}
Z4.field('z4d',{def:{},
merge:function(m,c){c=c||{};var dm=I(m.d),dc=I(c.d),wm=I(m.cwk),wc=I(c.cwk);
m.nt=dm===dc?Math.max(I(m.nt),I(c.nt)):dc>dm?I(c.nt):I(m.nt);m.cwn=wm===wc?Math.max(I(m.cwn),I(c.cwn)):wc>wm?I(c.cwn):I(m.cwn);
['d','ng','gr','gw','gl','cwk'].forEach(function(k){m[k]=Math.max(I(m[k]),I(c[k]));});},
fix:function(z){N.forEach(function(k){z[k]=I(z[k]);});for(var j in z)if(N.indexOf(j)<0)delete z[j];}});
if(Z4.reg('z4d',{t:'Зина 4.0: подъезд играет вместе (наперегонки с соседкой, записки на полях, окна дома, общий кроссворд)',who:'PODEZD'}))
Z3.late('js/zb4-podezd-x.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var N=['pb','pn','tp','tc','kd','ki','kp'];
function fx(z){N.forEach(function(k){var v=Math.floor(+z[k]||0);z[k]=v>0?v:0;});z.ki=Math.min(5,z.ki);z.ks=String(z.ks||'').replace(/[^gy]/g,'').slice(0,z.ki);
for(var k in z)if(k!=='ks'&&N.indexOf(k)<0)delete z[k];}
Z.field('z4q',{def:{ks:''},fix:fx,
merge:function(m,c){fx(m);c=c||{};fx(c);['pb','pn','tp','tc'].forEach(function(k){m[k]=Math.max(m[k],c[k]);});
if(c.kd>m.kd||(c.kd===m.kd&&c.ki>m.ki)){m.kd=c.kd;m.ki=c.ki;m.ks=c.ks;m.kp=c.kp;}}});
if(!Z.reg('z4q',{t:'Зина 4.0: забеги на пройденных',who:'ZABEG'}))return;
var F={port:'Портфель четверти',tetr:'Бесконечная тетрадь',kontr:'Контрольная дня'},O={};
for(var k in F){O[k]=Z.reg('z4q.'+k,{t:'Забеги: '+F[k],who:'ZABEG'});Z.OPEN['z4q.'+k]=8;}
Z.ZAB={on:O,LV:30};
Z3.late('js/zb4-zabeg-s.js',{day:8});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var N=['td','tn','sc','sn','bd','bn','kb','kn','kd','kc'];
function n(x){x=Math.floor(+x||0);return x>0?x:0;}
function fx(z){N.forEach(function(k){z[k]=n(z[k]);});for(var k in z)if(N.indexOf(k)<0)delete z[k];}
Z.field('z4i',{def:{},
merge:function(m,c){fx(m);c=c||{};fx(c);
if(c.kd>m.kd){m.kd=c.kd;m.kc=c.kc;}else if(c.kd===m.kd)m.kc=Math.max(m.kc,c.kc);
['td','tn','sc','sn','bd','bn','kb','kn'].forEach(function(k){m[k]=Math.max(m[k],c[k]);});},
fix:fx});
if(!Z.reg('z4i',{t:'Зина 4.0: новые виды уровня (две тетради, мешок букв, половинки, чашка чая)',who:'IGRY'}))return;
var F={two:'«Две тетради»: два кроссворда на одном круге',bag:'«Мешок букв»: живое колесо без кроссворда',
slog:'«Слово-половинки»: круг из слогов (раз в главу)',big:'«Чашка чая»: крупный короткий уровень'},O={};
for(var k in F)O[k]=Z.reg('z4i.'+k,{t:'Виды уровня: '+F[k],who:'IGRY'});
Z.IGR={on:O};
Z.OPEN['z4i.two']=8;Z.OPEN['z4i.bag']=8;Z.OPEN['z4i.big']=8;Z.OPEN['z4i.slog']=8;
Z3.late('js/zb4-igry-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.reg('z4l',{t:'Зина 4.0: за одним столом (внук, банка, скрэббл с Галей)',who:'STOL'}))return;
var K=['k','d','n','vb','vv','vd','bb','sw','sl','sb','gs'];
function n(v){v=Math.floor(+v||0);return v>0?v:0;}
Z.field('z4l',{def:{k:0,d:0,n:0,vb:0,vv:0,vd:0,bb:0,sw:0,sl:0,sb:0,gs:0},
merge:function(a,c){if(n(c.k)>n(a.k)){a.k=n(c.k);a.d=n(c.d);}else if(n(c.k)===n(a.k))a.d=n(a.d)|n(c.d);
K.forEach(function(k){if(k!=='k'&&k!=='d'&&k!=='gs')a[k]=Math.max(n(a[k]),n(c[k]));});},
fix:function(z){K.forEach(function(k){z[k]=n(z[k]);});z.d&=7;z.gs=z.gs?1:0;}});
Z.OPEN.z4l=8;
Z3.late('js/zb4-stol-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4t',{t:'Зина 4.0: темп и доступность',who:'TEMP'});
var F={cloud:'облако VK после победы',mix7:'смешанные уровни 1 из 7, без долгих рубрик',cell:'рубрика — клетка уровня',urok:'«Урок окончен» и домашка',
pace:'Зина подстраивается под темп',mic:'«Скажи слово вслух» (🎤, выкл. по умолчанию)'};
var O={};for(var k in F)O[k]=Z.reg('z4t.'+k,{t:'Темп: '+F[k],who:'TEMP'});
function n(x){x=Math.floor(+x||0);return x>0?x:0;}
Z.field('z4t',{def:{p:0,h:[],c:[0,''],d:0,n:0,u:0,k:0},
merge:function(m,c,cn){var h=(m.h||[]).slice();(c.h||[]).forEach(function(x){if(!h.some(function(y){return y[0]===x[0];}))h.push(x);});
m.h=h.sort(function(a,b){return b[0]-a[0];}).slice(0,3);if(cn&&c.p)m.p=n(c.p);
if(n(c.c&&c.c[0])>n(m.c&&m.c[0]))m.c=c.c;if(n(c.d)>n(m.d)){m.d=n(c.d);m.n=n(c.n);}else if(n(c.d)===n(m.d))m.n=Math.max(n(m.n),n(c.n));
m.u=Math.max(n(m.u),n(c.u));m.k=Math.max(n(m.k),n(c.k));},
fix:function(z){['p','d','n','u','k'].forEach(function(k){z[k]=n(z[k]);});z.p=Math.min(z.p,3000);
z.h=(z.h instanceof Array?z.h:[]).filter(function(x){return x instanceof Array&&x.length===3&&n(x[0])&&typeof x[1]==='string'&&typeof x[2]==='string';})
.map(function(x){return[n(x[0]),x[1].slice(0,80),x[2].slice(0,12)];}).slice(0,3);
if(!(z.c instanceof Array)||z.c.length!==2)z.c=[0,''];z.c=[n(z.c[0]),String(z.c[1]||'').slice(0,4)];}});
if(!ON)return;
Z.TEMP={on:O};
Z.OPEN['z4t.mic']=4;
if(O.cloud)Z.onWin(function(){if(typeof PLAT!=='undefined'&&PLAT==='vk'&&typeof cloudSoon==='function')cloudSoon(3000);});
Z3.late('js/zb4-temp-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(!window.Z4||typeof window.zina!=='function'||typeof window.zinaHide!=='function')return;
if(!Z4.reg('z4z.joke',{t:'Шутки Зины дольше на экране',who:'SHUTKI'}))return;
var JK={a:8,b:.2,max:30,lock:12,after:2,short:40},PL={a:5,b:.12,max:20},UA=1200;
var cur=null,FORCE=0,UACT=0;
var K=window.Z4SH={JK:JK,PL:PL,cur:function(){return cur;}};
function el(){return document.getElementById('zSay');}
function gl(){try{return typeof G!=='undefined'&&G?G:null;}catch(e){return null;}}
function inGame(){var g=document.getElementById('game');return!!(g&&g.classList.contains('on'));}
function isOn(e){return!!(e&&e.classList.contains('on'));}
function txtOf(e){var c=e.cloneNode(true);[].forEach.call(c.querySelectorAll('.znr'),function(x){x.parentNode.removeChild(x);});return c.textContent.replace(/\s+/g,' ').trim();}
function same(e){return!!(cur&&isOn(e)&&e.textContent.indexOf(cur.t)===0);}
function sched(ms){clearTimeout(zina._t);zina._t=setTimeout(function(){window.zinaHide();},Math.max(50,ms));}
K.dur=function(n,j,sec){var P=j?JK:PL,d=Math.min(P.max,P.a+P.b*n);if(!j&&sec&&sec!==99)d=Math.max(d,+sec||0);return d;};
function apply(t,sec,g){var e=el();if(!isOn(e)||e.textContent.indexOf(t)!==0)return;
if(!g||g.tut||sec===99){cur=null;return;}
var b=e.querySelector('.znr button'),id=b&&b.parentNode.getAttribute('data-id')||'',n=txtOf(e).length;
var j=!!b&&(!/^z[0-9a-z]+$/.test(id)||n>=JK.short),now=Date.now(),d=K.dur(n,j,sec);
cur={t:t,j:j,g:g,t0:now,end:now+d*1000,hov:0,rated:0,pend:0};
if(!e.classList.contains('pin')||j)sched(d*1000);}
function pass(t,sec,g){
if(!g||g.tut||g.won||!inGame()||cur.g!==g||sec===99||g.mdLim)return true;
if(Date.now()-UACT<UA)return true;
try{if(!g.words.some(function(x){return!x.found;}))return true;}catch(e){}
try{if(typeof JAR_PRIZE!=='undefined'&&String(t).slice(-(String(JAR_PRIZE).length+2))===' +'+JAR_PRIZE)return true;}catch(e){}
return false;}
function wrapZina(){var f=window.zina;if(typeof f!=='function'||f.__z4j)return;
var w=function(t,mood,sec){var g=gl(),e=el();
try{if(cur&&cur.j&&!cur.rated&&same(e)&&Date.now()<cur.t0+JK.lock*1000&&!pass(t,sec,g))return false;}catch(x){}
var r=f.apply(this,arguments);if(t){var s=String(t);setTimeout(function(){ZB.safe('z4j-say',function(){apply(s,sec,g);});},0);}return r;};
for(var k in f)if(/^__z/.test(k))w[k]=f[k];w.__z4j=1;window.zina=w;}
function wrapHide(){var f=window.zinaHide;if(f.__z4j)return;
var w=function(soft){var e=el();
if(cur&&!FORCE&&same(e)){var now=Date.now(),live=cur.j&&!cur.rated;
if(soft){if(live&&now<cur.end)return;}
else if(cur.hov&&!cur.rated){cur.pend=1;clearTimeout(zina._t);return;}
else if(now<cur.end-40){sched(cur.end-now);return;}}
var r=f.apply(this,arguments);if(!isOn(el()))cur=null;return r;};
w.__z4j=1;window.zinaHide=w;}
function hover(on){var e=el();if(!cur||!same(e)||cur.rated)return;var now=Date.now();
if(on){if(!cur.hov){cur.hov=1;cur.rem=Math.max(0,cur.end-now);}return;}
if(!cur.hov)return;cur.hov=0;cur.end=now+Math.max(cur.rem||0,2000);if(cur.pend){cur.pend=0;sched(cur.end-now);}}
function bind(){var e=el();if(!e||e.__z4j)return;e.__z4j=1;
e.addEventListener('pointerenter',function(){ZB.safe('z4j-in',function(){hover(1);});});
['pointerleave','pointercancel'].forEach(function(n){e.addEventListener(n,function(){ZB.safe('z4j-out',function(){hover(0);});});});
window.addEventListener('click',function(ev){var t=ev.target;if(!t||!t.closest)return;
if(t.closest('#zSay')){
if(t.closest('.znr button')){setTimeout(function(){ZB.safe('z4j-rate',function(){var s=el();if(!cur||!same(s)||!cur.j)return;
cur.rated=1;cur.hov=0;cur.pend=0;s.classList.remove('pin');cur.end=Date.now()+JK.after*1000;sched(JK.after*1000);});},0);}
else{FORCE=1;setTimeout(function(){FORCE=0;},0);}
return;}
if(!t.closest('#wheel')&&!t.closest('#pvOk'))UACT=Date.now();},true);}
wrapZina();wrapHide();bind();
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(typeof maybeInterstitial!=='function'||typeof interDue!=='function')return;
var O={t:'Межэкранная на переходах вне уровня',who:'REKLAMA'};
var ON=window.Z4&&Z4.reg?Z4.reg('z4ad',O):!!(window.ZB2&&ZB2.reg('z4ad',O));
if(!ON)return;
var CFG={on:1,gap:180,retry:30,day:4,hold:8,delay:450};
try{var c=window.Z4AD_CFG;if(c&&typeof c==='object')for(var k in c)if(k in CFG&&isFinite(+c[k]))CFG[k]=+c[k];}catch(e){}
if(typeof applyFlags==='function'&&!applyFlags.__z4ad){var af=applyFlags;applyFlags=function(f){af.apply(this,arguments);try{if(f&&typeof f==='object'){
var a=parseInt(f.scr_ad,10),g=parseInt(f.scr_gap,10);if(a===0||a===1)CFG.on=a;if(g>=120&&g<=600)CFG.gap=g;}}catch(e){}};applyFlags.__z4ad=1;}
var T=0,tryT=0,MINE=0,tapT=0,tapBad=0,mT=0,cur='';
function day(){try{return window.Z4?Z4.day():window.Z3?Z3.day():99;}catch(e){return 1;}}
function scrOn(){var e=document.querySelector('.screen.on');return e?e.id:'';}
function play(id){return!id||id==='game'||id.indexOf('mg_')===0||id==='zb-z3kiosk-sk';}
function busy(){return document.documentElement.classList.contains('zmg-open')||$('modal').classList.contains('on')||document.hidden||
(typeof interOn!=='undefined'&&interOn)||(typeof adBusy!=='undefined'&&adBusy)||(typeof PAY!=='undefined'&&PAY.busy)||
(typeof introOn!=='undefined'&&introOn)||(typeof inPlay==='function'&&inPlay());}
function nb(){return typeof nbNoInt!=='undefined'&&nbNoInt&&Date.now()-nbNoInt<300000;}
document.addEventListener('click',function(e){try{var t=e.target;tapT=Date.now();
tapBad=!!(t&&t.closest&&(t.closest(typeof AD_BTN_SEL!=='undefined'?AD_BTN_SEL:'.zbad')||t.closest('[data-pay],.pay,.zbpay,.adbtn')));}catch(x){tapBad=0;}},true);
function ok(){var now=Date.now();
return CFG.on&&!SHOT&&day()>=CFG.day&&now-lastInter>=CFG.gap*1000&&now-tryT>=CFG.retry*1000&&
!(tapBad&&now-tapT<3000)&&!nb()&&!busy()&&interDue();}
function want(k,sid){if(!ok())return;setTimeout(function(){go(k,sid);},CFG.delay);}
function go(k,sid){if(scrOn()!==sid||play(sid)||!ok())return;
var p=S.plays,li=lastInter;try{if(window.Z4)Z4.ev('z4ad',{a:'try',k:k,s:String(sid).slice(0,16)});}catch(e){}
MINE=1;maybeInterstitial(function(){MINE=0;if(lastInter!==li){T=lastInter;tryT=0;}else tryT=Date.now();});S.plays=p;}
if(typeof STAT!=='undefined'&&STAT.ad&&!STAT.ad.__z4ad){var sa=STAT.ad;STAT.ad=function(f,r,c,x){if(MINE&&f==='int'){x=x||{};x.w='scr';}return sa.call(this,f,r,c,x);};STAT.ad.__z4ad=1;}
ZB.on('screen',function(id){var prev=scrOn();cur=id;if(!prev||prev===id||play(prev)||play(id))return;want('s',id);});
if(typeof modal==='function'&&typeof hideModal==='function'){
var m0=modal;modal=function(){if(!$('modal').classList.contains('on'))mT=Date.now();return m0.apply(this,arguments);};
var h0=hideModal;hideModal=function(){var was=$('modal').classList.contains('on'),t=mT,r=h0.apply(this,arguments);
try{if(was&&t&&Date.now()-t>=CFG.hold*1000){var sid=scrOn();if(!play(sid))want('m',sid);}}catch(e){}return r;};}
window.Z4AD={cfg:CFG,ok:ok,last:function(){return T;},mine:function(){return MINE;}};
})();
}catch(e){setTimeout(function(){throw e;});}
try{(function(){
if(!window.Z4||!Z4.on||typeof ZB==='undefined'||typeof S==='undefined')return;
if(!Z4.reg('z4y',{t:'Зина 4.0: траты для красоты — квартира Зины и вещи Ятя',who:'TRATY'}))return;
var F={kv:Z4.reg('z4y.kv',{t:'Квартира Зины: вещи за монеты (герань, самовар, сервант…)',who:'TRATY'}),
yat:Z4.reg('z4y.yat',{t:'Приданое Ятя: вещи коту за монеты (миска, лежанка, домик…)',who:'TRATY'})};
var IDS=['ger','sal','slon','chas','tor','sam','rad','kov','tv','serv','mis','klu','bant','pod','kog','lez','dom'];
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var K=['o','pd','ld','rv'],DEF={o:0,pd:0,ld:0,rv:0};
Z4.field('z4y',{def:{o:0,pd:0,ld:0,rv:0},
fix:function(z){K.forEach(function(k){z[k]=n(z[k]);});z.o&=(1<<IDS.length)-1;for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;m.o=(n(m.o)|n(c.o))&((1<<IDS.length)-1);['pd','ld','rv'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});}});
window.Z4Y={F:F,IDS:IDS,n:n};
Z3.late('js/zb4-traty-s.js',{day:4});
})();
}catch(e){setTimeout(function(){throw e;});}
