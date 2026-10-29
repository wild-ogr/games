'use strict';
(function(){
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
