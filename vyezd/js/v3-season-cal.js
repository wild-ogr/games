(function(root){
'use strict';
var A0=20261026;
var SER=['prava','inomarka','novosel','volga','pobeda','domino','barsik','svadba','urok','moskvich','ugon','vybory'];
var EVT=[
{id:'clean',g:'clean',n:25,t:['Неделя аккуратных','Careful drivers'],p:['Аккуратный серебристый','Careful silver'],c:'#c9d3dc'},
{id:'cars',g:'cars',n:300,t:['Большой разъезд','The big departure'],p:['Разъездной оранжевый','Departure orange'],c:'#ff8c2a'},
{id:'stars',g:'stars',n:60,t:['Звёздный двор','Starry yard'],p:['Звёздный синий','Starry blue'],c:'#2f5fd0'},
{id:'yards',g:'yards',n:40,t:['Сорок дворов','Forty yards'],p:['Дворовый зелёный','Yard green'],c:'#3fae5a'},
{id:'three',g:'three',n:20,t:['Три звезды подряд','Three stars'],p:['Золотой «три звезды»','Three-star gold'],c:'#e0b030'},
{id:'nohint',g:'nohint',n:20,t:['Сам справлюсь','On my own'],p:['Самостоятельный вишнёвый','Self-made cherry'],c:'#9b1b30'}];
var FIX={'1231':'ny','0101':'ny','0308':'mar8','0901':'sep1','0715':'bday','1115':'snow'};
var PRI=['ny','mar8','sep1','bday','snow','season','evt','novosel','chaika','number','ep'];
var LET='АВЕКМНОРСТУХ',LET_EN='ABEKMHOPCTYX';
function dnOf(k){k=+k;var y=Math.floor(k/1e4),m=Math.floor(k/100)%100,d=k%100;y-=m<=2?1:0;var era=Math.floor(y/400),yoe=y-era*400,mp=(m+9)%12,doy=Math.floor((153*mp+2)/5)+d-1,doe=yoe*365+Math.floor(yoe/4)-Math.floor(yoe/100)+doy;return era*146097+doe-719468;}
function keyOf(z){z+=719468;var era=Math.floor(z/146097),doe=z-era*146097,yoe=Math.floor((doe-Math.floor(doe/1460)+Math.floor(doe/36524)-Math.floor(doe/146096))/365),y=yoe+era*400,doy=doe-(365*yoe+Math.floor(yoe/4)-Math.floor(yoe/100)),mp=Math.floor((5*doy+2)/153),d=doy-Math.floor((153*mp+2)/5)+1,m=mp<10?mp+3:mp-9;if(m<=2)y++;return y*1e4+m*100+d;}
function wd(k){var z=dnOf(k);return((z+3)%7+7)%7;}
function md(k){var s=String(+k);return s.slice(4);}
function mon(k){return Math.floor(+k/100)%100;}
function add(k,n){return keyOf(dnOf(k)+n);}
function mod(a,n){return((a%n)+n)%n;}
function hash(x){x=(x|0)^0x9e3779b9;x=Math.imul(x^x>>>16,0x45d9f3b);x=Math.imul(x^x>>>16,0x45d9f3b);return(x^x>>>16)>>>0;}
function season(k){var d=dnOf(k)-dnOf(A0),s=Math.floor(d/28);var day=d-s*28;return{n:s+1,day:day+1,week:Math.floor(day/7)+1,start:keyOf(dnOf(A0)+s*28),end:keyOf(dnOf(A0)+s*28+27),
ser:SER[mod(s,SER.length)],evt:evtAt(s,day<14?0:1)};}
function evtAt(s,half){var i=mod(s*2+half,EVT.length),e=EVT[i];var st=keyOf(dnOf(A0)+s*28+half*14);return{id:e.id,g:e.g,n:e.n,t:e.t,p:e.p,c:e.c,paint:'v3c_'+e.id,start:st,end:add(st,13),key:(s+1)*2+half};}
function weekKey(k){return add(k,-wd(k));}
function number(k){var m=weekKey(k),h=hash(dnOf(m)*7+13),dg=100+h%900,a=Math.floor(h/900)%12,b=Math.floor(h/10800)%12,c=Math.floor(h/129600)%12;
return{ru:LET[a]+' '+dg+' '+LET[b]+LET[c],en:LET_EN[a]+' '+dg+' '+LET_EN[b]+LET_EN[c],dg:dg,wk:m};}
function numberYard(k){return 2+hash(dnOf(weekKey(k))+5)%4;}
function winter(k){var m=mon(k);return m===12||m===1||m===2;}
function bazar(k){var s=md(k);return s>='1220'||s<='0108';}
function yearSeason(k){var m=mon(k);return m<=2||m===12?'winter':m<=5?'spring':m<=8?'summer':'autumn';}
function snowKey(y,srv){return srv&&Math.floor(+srv/1e4)===y?+srv:y*1e4+1115;}
function evs(k,o){o=o||{};k=+k;var r={},s=season(k),f=FIX[md(k)],y=Math.floor(k/1e4);
if(f&&f!=='snow')r[f]=1;
if(k===snowKey(y,o.snow))r.snow=1;
if(s.day===1)r.season=1;if(s.day===15)r.evt=1;
var nv=novoselKey(s);if(k===nv)r.novosel=1;
if(wd(k)===3)r.chaika=1;if(wd(k)===0)r.number=1;
r.ep=1;return r;}
function novoselKey(s){var k=add(s.start,9);for(var i=0;i<6;i++){var f=FIX[md(k)];if(!f||f==='snow')return k;k=add(k,1);}return k;}
function day(k,o){var e=evs(k,o),main=null,also=[];for(var i=0;i<PRI.length;i++)if(e[PRI[i]]){if(!main)main=PRI[i];else if(PRI[i]!=='ep')also.push(PRI[i]);}
var s=season(k);
return{k:+k,wd:wd(k),main:main,also:also,s:s.n,sday:s.day,week:s.week,ser:s.ser,evt:s.evt,winter:winter(+k),bazar:bazar(+k),ys:yearSeason(+k),
rule:e.mar8?'mar8':e.sep1?'sep1':'',no:number(k)};}
function chaikaNow(k,h){return wd(k)===3&&h===19;}
function nextOf(k,id,o,lim){lim=lim||400;for(var i=0;i<lim;i++){var x=add(k,i),d=day(x,o);if(d.main===id||d.also.indexOf(id)>=0)return x;}return 0;}
function week(k,o){var m=weekKey(k),r=[];for(var i=0;i<7;i++)r.push(day(add(m,i),o));return r;}
var C={A0:A0,SER:SER,EVT:EVT,PRI:PRI,FIX:FIX,dnOf:dnOf,keyOf:keyOf,wd:wd,add:add,season:season,evtAt:evtAt,number:number,numberYard:numberYard,
winter:winter,bazar:bazar,yearSeason:yearSeason,evs:evs,day:day,week:week,chaikaNow:chaikaNow,nextOf:nextOf,weekKey:weekKey,novoselKey:novoselKey,hash:hash};
if(typeof module!=='undefined'&&module.exports)module.exports=C;else root.V3CAL=C;
})(this);