(function(){'use strict';
var W=window,D=document;
if(!W.UI||!W.VY||!W.homeSlots)return;
var Q=location.search;
if(!W.V3||!V3.reg||!V3.reg('skin',{s:'SKIN',t:'Вид A «Двор живёт»'}))return;
var PARTS={home:'главный — сцена двора',nav:'нижняя панель 5 кнопок',win:'победа — праздник и диета окна',pc:'ПК на всю ширину',big:'крупно для 45+',zoom:'автоприближение больших дворов',yard:'силуэт региона над двором'};
var ON={};for(var p in PARTS){try{V3.reg('skin.'+p,{s:'SKIN',t:PARTS[p]});}catch(e){}ON[p]=!!V3.is('skin.'+p);}
var html=D.documentElement;html.classList.add('v3skin');for(p in ON)if(ON[p])html.classList.add('v3s-'+p);
function $(id){return D.getElementById(id);}
function L(a,b){return VY.L(a,b);}
function ok(f,d){try{return f();}catch(e){return d;}}
function esc(s){return UI.esc(s);}
function calmOn(){return ok(function(){return calm();},false);}
var G_=new Function('k','try{return eval(k);}catch(e){return undefined;}');
function ev(a,o){ok(function(){if(W.V3&&V3.ev)V3.ev(a,o);});}
function hour(){return ok(function(){return new Date(nowMs()).getHours();},new Date().getHours());}
function tod(){var f=(Q.match(/[?&]sky=(morning|day|evening|night)/)||[])[1];if(f)return f;
if(ok(function(){return UI.night&&UI.night.on();},false))return'night';var h=hour();return h<6?'night':h<10?'morning':h<17?'day':h<20?'evening':'night';}
function hash(s){var h=7;s=String(s);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%2147483647;return h;}
function weather(){var f=(Q.match(/[?&]wx=(clear|cloud|rain|snow)/)||[])[1];if(f)return f;
var dk=ok(function(){return todayKey();},''),m=ok(function(){return new Date(nowMs()).getMonth();},0),r=hash('wx'+dk)%100,win=m===11||m<=1;
if(win)return r<40?'snow':r<65?'cloud':'clear';return r<14?'rain':r<40?'cloud':'clear';}
var SKY={morning:['#f6a57f','#ffe2c2','#fff3c4'],day:['#7cc6f0','#d3f0ff','#fff6c9'],evening:['#6c5b9e','#ffa46b','#ffd9a0'],night:['#0b1433','#2a3c72','#fff6d2']};
var HAZE={morning:'#d9a493',day:'#a9cde3',evening:'#7d6a9c',night:'#1d2b55'};
function rng(s){s=s%2147483647||7;return function(){s=s*48271%2147483647;return s/2147483647;};}
var SH={
block:function(x,w,h){return'M'+x+' 60V'+(60-h)+'H'+(x+w)+'V60Z';},
dome:function(x,w,h){var y=60-h*.6,c=x+w/2;return'M'+x+' 60V'+y+'H'+(x+w)+'V60Z M'+(c-w*.42)+' '+y+'Q'+(c-w*.5)+' '+(y-h*.22)+' '+c+' '+(y-h*.36)+'Q'+(c+w*.5)+' '+(y-h*.22)+' '+(c+w*.42)+' '+y+'Z M'+(c-.8)+' '+(y-h*.36)+'V'+(y-h*.4-4)+'H'+(c+.8)+'V'+(y-h*.36)+'Z';},
tower:function(x,w,h){var y=60-h*.72,c=x+w/2;return'M'+x+' 60V'+y+'H'+(x+w)+'V60Z M'+(x-1)+' '+y+'L'+c+' '+(60-h)+'L'+(x+w+1)+' '+y+'Z';},
spire:function(x,w,h){var c=x+w/2,y=60-h*.4;return'M'+x+' 60V'+y+'H'+(x+w)+'V60Z M'+(c-w*.18)+' '+y+'L'+c+' '+(60-h)+'L'+(c+w*.18)+' '+y+'Z';},
fir:function(x,w,h){var c=x+w/2;return'M'+c+' '+(60-h)+'L'+(x+w*.8)+' '+(60-h*.55)+'H'+(x+w*.65)+'L'+(x+w)+' '+(60-h*.12)+'H'+(c+1)+'V60H'+(c-1)+'V'+(60-h*.12)+'H'+x+'L'+(x+w*.35)+' '+(60-h*.55)+'H'+(x+w*.2)+'Z';},
mtn:function(x,w,h){return'M'+x+' 60L'+(x+w*.45)+' '+(60-h)+'L'+(x+w*.6)+' '+(60-h*.78)+'L'+(x+w)+' 60Z';},
hill:function(x,w,h){return'M'+x+' 60Q'+(x+w/2)+' '+(60-h*2)+' '+(x+w)+' 60Z';},
pagoda:function(x,w,h){var c=x+w/2,s='',n=3;for(var i=0;i<n;i++){var y=60-h*(i+1)/n,hw=w*(.5-i*.1);s+='M'+(c-hw*.7)+' '+(y+h/n)+'V'+(y+h/n*.3)+'L'+(c-hw-2)+' '+(y+h/n*.25)+'Q'+c+' '+(y-h/n*.25)+' '+(c+hw+2)+' '+(y+h/n*.25)+'L'+(c+hw*.7)+' '+(y+h/n*.3)+'V'+(y+h/n)+'Z ';}return s;},
chimney:function(x,w,h){return'M'+x+' 60V'+(60-h*.35)+'H'+(x+w*.55)+'V'+(60-h)+'H'+(x+w*.7)+'V'+(60-h*.35)+'H'+(x+w)+'V60Z';},
palm:function(x,w,h){var c=x+w/2,t=60-h;return'M'+(c-1.2)+' 60Q'+(c-2)+' '+(60-h*.5)+' '+c+' '+t+'L'+(c+1.4)+' '+t+'Q'+(c)+' '+(60-h*.5)+' '+(c+1.2)+' 60Z M'+c+' '+t+'Q'+(c-w*.5)+' '+(t-4)+' '+(c-w*.6)+' '+(t+6)+'Q'+(c-w*.3)+' '+(t-1)+' '+c+' '+t+'Q'+(c+w*.5)+' '+(t-4)+' '+(c+w*.6)+' '+(t+6)+'Q'+(c+w*.3)+' '+(t-1)+' '+c+' '+t+'Z';},
tv:function(x,w,h){var c=x+w/2;return'M'+(c-w*.3)+' 60L'+(c-1)+' '+(60-h)+'H'+(c+1)+'L'+(c+w*.3)+' 60Z M'+(c-3)+' '+(60-h*.62)+'H'+(c+3)+'V'+(60-h*.55)+'H'+(c-3)+'Z';},
eiffel:function(x,w,h){var c=x+w/2;return'M'+x+' 60Q'+(c-w*.12)+' '+(60-h*.4)+' '+(c-1)+' '+(60-h)+'H'+(c+1)+'Q'+(c+w*.12)+' '+(60-h*.4)+' '+(x+w)+' 60H'+(c+w*.18)+'Q'+c+' '+(60-h*.22)+' '+(c-w*.18)+' 60Z';},
sky:function(x,w,h){return'M'+x+' 60V'+(60-h*.8)+'H'+(x+w*.25)+'V'+(60-h)+'H'+(x+w*.75)+'V'+(60-h*.8)+'H'+(x+w)+'V60Z';},
minaret:function(x,w,h){var c=x+w/2;return'M'+(c-w*.15)+' 60V'+(60-h*.8)+'L'+c+' '+(60-h)+'L'+(c+w*.15)+' '+(60-h*.8)+'V60Z M'+(c-w*.25)+' '+(60-h*.55)+'H'+(c+w*.25)+'V'+(60-h*.5)+'H'+(c-w*.25)+'Z';},
pyr:function(x,w,h){return'M'+x+' 60L'+(x+w/2)+' '+(60-h)+'L'+(x+w)+' 60Z';},
wood:function(x,w,h){var c=x+w/2,y=60-h*.6;return'M'+x+' 60V'+y+'L'+c+' '+(60-h)+'L'+(x+w)+' '+y+'V60Z';},
bridge:function(x,w,h){return'M'+x+' 60V'+(60-h*.3)+'Q'+(x+w/2)+' '+(60-h*1.1)+' '+(x+w)+' '+(60-h*.3)+'V60H'+(x+w-3)+'Q'+(x+w/2)+' '+(60-h*.7)+' '+(x+3)+' 60Z';},
crane:function(x,w,h){return'M'+(x+w*.2)+' 60V'+(60-h)+'H'+(x+w)+'V'+(60-h+2)+'H'+(x+w*.3)+'V60Z';}
};
var KIT={volga:'dome block dome hill block bridge',ural0:'fir chimney block fir wood fir',dv:'hill crane block mtn crane',
zoloto:'dome dome hill dome block',piter:'spire block bridge block spire',chernozem:'hill block chimney hill',moskva:'block tv block sky block',
arktika:'hill mtn hill block',karelia:'fir fir wood fir fir',yug:'palm mtn palm block palm',baikal:'mtn mtn fir mtn',zavod:'chimney block chimney chimney',
dacha:'wood fir wood fir wood',volga2:'dome bridge block dome',altai:'mtn fir mtn mtn',europe:'spire eiffel block tower',asia:'pagoda block pagoda sky',
trassib:'fir block fir wood fir',future:'sky tv sky sky',town:'block dome block block tower'};
var WORLDK=['block','block','minaret','mtn','dome','mtn','minaret','minaret','sky','dome','pagoda','pagoda','pagoda','pagoda','pyr','dome','eiffel','tower','spire','sky'];
function regInfo(idx){var r=ok(function(){return W.VYREG&&VYREG.at?VYREG.at(idx):null;},null),id=r&&r.id||'',k='town';
if(id&&KIT[id])k=id;else if(idx<10)k='volga';else if(idx<20)k='ural0';else if(idx<30)k='dv';else if(idx<50)k='w'+(idx-30);
return{k:k,name:r?L(r.name,r.en||r.name):'',seed:hash(k)};}
function silPath(k){var list;if(k.charAt(0)==='w'&&!KIT[k]){var w=WORLDK[+k.slice(1)]||'block';list=[w,'block',w,'block',w];}else list=(KIT[k]||KIT.town).split(' ');
var R=rng(hash('sil'+k)),d='',x=-6,i=0;
while(x<404){var t=list[i%list.length],w=t==='mtn'||t==='hill'?60+R()*50:t==='fir'||t==='palm'?12+R()*8:t==='bridge'?70:t==='eiffel'?30:22+R()*20,
h=t==='mtn'?30+R()*25:t==='hill'?12+R()*10:t==='fir'?22+R()*16:t==='tv'?56:t==='spire'||t==='minaret'?40+R()*14:t==='sky'?34+R()*20:t==='eiffel'?52:t==='bridge'?18:18+R()*20;
d+=SH[t](Math.round(x),Math.round(w),Math.round(h))+' ';x+=w*(.75+R()*.5);i++;if(t==='fir'&&R()<.6){d+=SH.fir(Math.round(x),Math.round(w*.8),Math.round(h*.8))+' ';x+=w*.7;}}
return d;}
W.V3SKIN_sil=silPath;
function skySvg(t,wx,reg){var c=SKY[t],dark=t==='night'||t==='evening',cl=wx==='cloud'||wx==='rain'||wx==='snow',R=rng(hash('cl'+t+wx)),h='';
var top=cl?(t==='night'?'#141c3a':t==='evening'?'#5a5480':'#9fb3c4'):c[0],bot=cl?(t==='night'?'#2a3456':t==='evening'?'#c79a8f':'#dfe8ef'):c[1];
h+='<svg class="v3sky" viewBox="0 0 400 300" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><defs><linearGradient id="v3sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+top+'"/><stop offset="1" stop-color="'+bot+'"/></linearGradient></defs><rect width="400" height="300" fill="url(#v3sg)"/>';
if(t==='night'){for(var i=0;i<40;i++)h+='<circle cx="'+(R()*400).toFixed(1)+'" cy="'+(R()*120).toFixed(1)+'" r="'+(.5+R()*.9).toFixed(2)+'" fill="#fffbe6" opacity="'+(.4+R()*.6).toFixed(2)+'" class="v3st"/>';
if(!cl)h+='<circle cx="340" cy="20" r="11" fill="'+c[2]+'"/><circle cx="345" cy="16" r="9.5" fill="'+top+'"/>';}
else if(!cl){var sx=t==='morning'?60:t==='evening'?340:320,sy=t==='day'?16:26;h+='<circle cx="'+sx+'" cy="'+sy+'" r="26" fill="'+c[2]+'" opacity=".35"/><circle cx="'+sx+'" cy="'+sy+'" r="13" fill="'+c[2]+'"/>';}
var cc=t==='night'?'rgba(150,160,200,.35)':t==='evening'?'rgba(255,205,185,.85)':cl?'rgba(240,244,248,.95)':'rgba(255,255,255,.92)',nc=cl?6:3;
for(var j=0;j<nc;j++){var x=20+R()*360,y=8+R()*(cl?30:40),s=12+R()*10;h+='<g class="v3cl" fill="'+cc+'" style="animation-delay:-'+(R()*40).toFixed(1)+'s"><circle cx="'+x+'" cy="'+y+'" r="'+s*.55+'"/><circle cx="'+(x+s*.5)+'" cy="'+(y+3)+'" r="'+s*.42+'"/><circle cx="'+(x-s*.5)+'" cy="'+(y+4)+'" r="'+s*.4+'"/><circle cx="'+(x+s*.15)+'" cy="'+(y-s*.25)+'" r="'+s*.4+'"/></g>';}
h+='</svg><svg class="v3sil" viewBox="0 0 400 60" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path d="'+silPath(reg.k)+'" fill="'+HAZE[t]+'" opacity="'+(dark?.95:.6)+'"/>';
if(t==='night'||t==='evening'){var R2=rng(hash('lw'+reg.k));for(var k=0;k<16;k++)h+='<rect x="'+(R2()*400).toFixed(0)+'" y="'+(44+R2()*14).toFixed(0)+'" width="2.2" height="2.2" fill="#ffd36b" opacity=".8"/>';}
h+='</svg>';
if(wx==='rain'||wx==='snow'){h+='<div class="v3wx v3'+wx+'" aria-hidden="true">';var R3=rng(hash('wx'+wx));for(var n=0;n<26;n++)h+='<i style="left:'+(R3()*100).toFixed(1)+'%;animation-delay:-'+(R3()*3).toFixed(2)+'s;animation-duration:'+(wx==='snow'?3+R3()*3:.7+R3()*.5).toFixed(2)+'s"></i>';h+='</div>';}
return h;}
var GROUND=(W.V3&&V3.is&&V3.is('light'))?['bench','flowers','night','garages','camera','moskvich','kiosk','chalk','arch','street']:['bench','camera','flowers','night','moskvich','arch','chalk','kiosk','garages','street'],FACADE={board:[140,200],intercom:[183,200],mail:[226,204],calendar:[96,202],attic:[306,8]};
function propSvg(at){var s='<svg viewBox="0 0 48 40" class="v3pr" aria-hidden="true">';
switch(at){
case'arch':s+='<path d="M4 40V12Q24-4 44 12V40H34V18Q24 8 14 18V40Z" fill="#c96f4a"/><path d="M14 40V18Q24 8 34 18V40Z" fill="#3b2a24"/><path d="M19 30h10m-4-4 4 4-4 4" stroke="#ffd36b" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';break;
case'street':s+='<rect x="22" y="14" width="3" height="26" fill="#8a95a5"/><rect x="8" y="4" width="32" height="14" rx="3" fill="#2e7d32" stroke="#fff" stroke-width="1.6"/><path d="M14 11h18m-4-4 4 4-4 4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';break;
case'kiosk':s+='<rect x="8" y="16" width="32" height="24" fill="#f1e3c8"/><rect x="13" y="20" width="22" height="12" fill="#8fc2e3"/><path d="M4 16 8 6H40L44 16Z" fill="#e74c3c"/><path d="M12 6 10 16M20 6v10M28 6v10M36 6l2 10" stroke="#fff" stroke-width="3"/><rect x="8" y="34" width="32" height="6" fill="#c9a77a"/>';break;
case'garages':s+='<rect x="0" y="12" width="23" height="28" fill="#9aa5b1"/><rect x="25" y="12" width="23" height="28" fill="#8a95a5"/><rect x="3" y="18" width="17" height="22" fill="#5f6f82"/><rect x="28" y="18" width="17" height="22" fill="#55657a"/><path d="M3 23h17M3 28h17M3 33h17M28 23h17M28 28h17M28 33h17" stroke="#7a8a9c" stroke-width="1.2"/><rect x="-1" y="9" width="50" height="4" fill="#6b7785"/>';break;
case'flowers':s+='<path d="M10 40h28l-3-10H13z" fill="#a5714a"/><path d="M14 30V18M24 30V14M34 30V19" stroke="#3e8e41" stroke-width="2.2"/><circle cx="14" cy="16" r="5" fill="#ff6fa8"/><circle cx="24" cy="12" r="5.5" fill="#ffc233"/><circle cx="34" cy="17" r="5" fill="#9a6bff"/><circle cx="14" cy="16" r="1.8" fill="#fff3b0"/><circle cx="24" cy="12" r="2" fill="#fff"/><circle cx="34" cy="17" r="1.8" fill="#fff3b0"/>';break;
case'night':s+='<rect x="2" y="26" width="44" height="14" fill="#5d6b7d"/><path d="M8 26V40M20 26V40M32 26V40" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 2"/><circle cx="38" cy="10" r="7" fill="#ffd36b"/><circle cx="41" cy="8" r="6" fill="#2a3c72"/><rect x="6" y="14" width="10" height="10" rx="2" fill="#3f86ff"/><text x="11" y="22.5" text-anchor="middle" font-size="9" font-weight="900" fill="#fff">P</text>';break;
case'moskvich':s+='<rect x="4" y="22" width="40" height="11" rx="4" fill="#3d7fd6"/><path d="M12 22l4-8h16l5 8z" fill="#3d7fd6"/><path d="M15 21l3-5.5h12l3.5 5.5z" fill="#cfeaff"/><circle cx="13" cy="34" r="4.2" fill="#263238"/><circle cx="35" cy="34" r="4.2" fill="#263238"/><circle cx="13" cy="34" r="1.6" fill="#c3ced9"/><circle cx="35" cy="34" r="1.6" fill="#c3ced9"/>';break;
case'chalk':s+='<rect x="2" y="24" width="44" height="16" fill="#9aa3ad"/><path d="M8 34q6-8 12 0t12 0m4-4h6m-3-3v6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M30 16l8-6 3 3-8 6z" fill="#fff"/>';break;
case'camera':s+='<rect x="8" y="16" width="32" height="20" rx="4" fill="#37474f"/><rect x="16" y="11" width="12" height="7" rx="2" fill="#37474f"/><circle cx="24" cy="26" r="7" fill="#90a4ae"/><circle cx="24" cy="26" r="4" fill="#263238"/><circle cx="35" cy="20" r="1.8" fill="#ffd36b"/>';break;
default:s+='<circle cx="24" cy="22" r="12" fill="#fff"/>';}
return s+'</svg>';}
var FAC_IC={board:'<svg viewBox="0 0 30 30"><rect x="3" y="4" width="24" height="18" rx="2" fill="#a0703f"/><rect x="5" y="6" width="20" height="14" fill="#fff6dc"/><path d="M8 10h9M8 13h12M8 16h7" stroke="#7a5a3a" stroke-width="1.4"/><rect x="18" y="7" width="5" height="5" fill="#ffc233"/><path d="M8 22v6M22 22v6" stroke="#7a5a3a" stroke-width="2"/></svg>',
intercom:'<svg viewBox="0 0 30 30"><rect x="8" y="3" width="14" height="24" rx="3" fill="#455a64"/><rect x="10.5" y="6" width="9" height="5" rx="1" fill="#b2ebf2"/><circle cx="12.5" cy="15" r="1.5" fill="#cfd8dc"/><circle cx="17.5" cy="15" r="1.5" fill="#cfd8dc"/><circle cx="12.5" cy="19.5" r="1.5" fill="#cfd8dc"/><circle cx="17.5" cy="19.5" r="1.5" fill="#cfd8dc"/><rect x="11" y="22.5" width="8" height="2" rx="1" fill="#ffc233"/></svg>',
mail:'<svg viewBox="0 0 30 30"><rect x="4" y="6" width="22" height="18" rx="3" fill="#1e88e5"/><rect x="8" y="10" width="14" height="3" rx="1.5" fill="#0d47a1"/><path d="M9 17h12l-6 4z" fill="#fff"/><rect x="13" y="24" width="4" height="5" fill="#607d8b"/></svg>',
calendar:'<svg viewBox="0 0 30 30"><rect x="4" y="5" width="22" height="21" rx="2" fill="#fff"/><rect x="4" y="5" width="22" height="7" rx="2" fill="#e53935"/><path d="M9 3v5M21 3v5" stroke="#455a64" stroke-width="2"/><text x="15" y="23" text-anchor="middle" font-size="10" font-weight="900" fill="#263238">'+new Date().getDate()+'</text></svg>',
attic:'<svg viewBox="0 0 30 30"><path d="M3 16 15 5l12 11z" fill="#7a4a35"/><rect x="10" y="13" width="10" height="10" fill="#ffd36b"/><path d="M15 13v10M10 18h10" stroke="#7a4a35" stroke-width="1.5"/></svg>'};
var THING_T={arch:['Выезд','Drive'],bench:['Лавочка','Bench'],night:['Стоянка','Parking'],moskvich:['«Москвич»','Moskvich'],garages:['Гаражи','Garages'],board:['Доска','Board'],
chalk:['Асфальт','Chalk'],street:['На улицу','Street'],flowers:['Мой двор','My yard'],intercom:['Домофон','Intercom'],mail:['Почта','Mail'],kiosk:['Ларёк','Kiosk'],camera:['Фото','Photo'],calendar:['Календарь','Calendar'],attic:['Чердак','Attic']};
var LINES=[['shura','Я из окна всё вижу. Даже то, чего не было.','I see everything from my window. Even what didn’t happen.'],['ded','В восемьдесят третьем тут три машины стояло. И то тесно было.','In ’83 there were three cars here. Even that felt crowded.'],
['shura','Каждая машина у меня на учёте. С тысяча девятьсот восемьдесят третьего.','Every car is in my notebook. Since 1983.'],['ded','Мой «Москвич» заводится с третьего раза. Зато как!','My Moskvich starts on the third try. But what a start!'],
['shura','Выезжай аккуратно — клумбу Михалыч только вчера покрасил.','Drive carefully — Mikhalych painted the flower bed yesterday.'],['ded','Газету дочитаю — и сам поеду. Лет через десять.','I’ll finish the paper and drive off myself. In ten years or so.'],
['shura','Пирожки остывают, а двор сам себя не освободит.','The pies are getting cold, and the yard won’t clear itself.'],['ded','Главное в выезде — не торопиться. И не стоять.','The trick to getting out: don’t rush. And don’t stand still.']];
var lastL=-1,said=null;
function line(){var i=Math.floor(Math.random()*LINES.length);if(i===lastL)i=(i+1)%LINES.length;lastL=i;var x=LINES[i];return{who:x[0],t:L(x[1],x[2])};}
function whoName(w){return w==='ded'?L('Дед','Grandpa'):ok(function(){return UI.whoName(w);},L('Баба Шура','Granny Shura'));}
function benchCv(cv,big){var r=cv.getBoundingClientRect(),dpr=Math.min(2,W.devicePixelRatio||1),w=Math.max(40,r.width),h=Math.max(30,r.height);
cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);var g=cv.getContext('2d');if(!g)return;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
var s=Math.min(h/2.0,w/4.2),y=h-s*.42;
g.fillStyle='#8a6a4a';g.fillRect(w*.08,y-s*.18,w*.84,s*.16);g.fillStyle='#6d5038';g.fillRect(w*.12,y-s*.02,s*.12,s*.4);g.fillRect(w*.88-s*.12,y-s*.02,s*.12,s*.4);
g.fillStyle='#a07a52';g.fillRect(w*.08,y-s*.62,w*.84,s*.12);
ok(function(){if(W.VYPEOPLE&&VYPEOPLE.fig){VYPEOPLE.fig('shura',g,w*.32,y,s);VYPEOPLE.fig('ded',g,w*.68,y,s*.96);}else{shuraFig(g,w*.32,y,s);dedFig(g,w*.68,y,s*.96);}});}
function sayHtml(o){return'<b>'+esc(whoName(o.who))+'</b>'+esc(o.t);}
function th(id,o){homeSlots.push({id:'th-'+id,zone:'thing',order:o.order||50,render:o.render});}
function scrHas(n){return ok(function(){return UI.has(n);},false);}
th('arch',{order:10,render:function(ctx){return{at:'arch',t:L('Выезд · двор ','Drive · yard ')+ctx.lv,go:function(){var b=$('hGo');if(b)b.click();}};}});
th('bench',{order:10,render:function(){return{at:'bench',t:L('Лавочка','Bench'),go:function(){V3SKIN.say();}};}});
th('garages',{order:10,render:function(){if(!scrHas('garazhi'))return null;var dot=ok(function(){var x=UI.list(navSlots).filter(function(n){return n.id==='garazhi';})[0];return!!(x&&x.dot&&x.dot());},false);
return{at:'garages',t:L('Гаражи Толика','Tolik’s garages'),go:'garazhi',badge:dot?'!':''};}});
th('board',{order:10,render:function(){var n=ok(function(){return W.NEWS&&NEWS.count?NEWS.count():0;},0),lk=ok(function(){return dailyLocked();},true),d=!lk&&ok(function(){return(VY.S.daily||{})[todayKey()];},0);
if(n)return{at:'board',t:L('Вести со двора','Yard news'),go:function(){ok(function(){NEWS.open();});},badge:'!'};
if(lk)return{at:'board',t:L('Доска объявлений','Notice board'),go:function(){V3SKIN.say(L('Задание дня повесят на доску после 7-го двора.','The daily challenge goes up on the board after yard 7.'),'shura');}};
return{at:'board',t:L('Задание дня','Daily challenge'),go:'daily',badge:d?'':'!'};}});
th('street',{order:10,render:function(){return{at:'street',t:L('Маршрут','Route'),go:'map'};}});
th('flowers',{order:10,render:function(){var my=scrHas('my');var dot=my&&ok(function(){return MY.dot();},false);return{at:'flowers',t:L('Мой двор','My yard'),go:my?'my':'garage-yard',badge:dot?'!':''};}});
th('intercom',{order:10,render:function(){if(!ok(function(){return PLAT==='vk'&&W.SOC&&typeof openSocial==='function'&&!W.__demo;},false))return null;return{at:'intercom',t:L('Позвать соседа','Call a neighbour'),go:function(){openSocial();}};}});
th('mail',{order:10,render:function(){if(!W.VYMAIL||!VYMAIL.open||W.__demo)return null;return{at:'mail',t:L('Письмо бабе Шуре','Write to Granny Shura'),go:function(){ok(function(){VYMAIL.open('about');});}};}});
th('kiosk',{order:10,render:function(){return scrHas('shop')?{at:'kiosk',t:L('Лавка','Shop'),go:'shop'}:null;}});
th('calendar',{order:10,render:function(){var st=ok(function(){return streakState();},null);if(!st||!(VY.S.levelsDone>0))return null;return{at:'calendar',t:st.claimed?L('Гостинец взят','Gift collected'):L('Гостинец ждёт','Gift waiting'),go:'gift',badge:st.claimed?'':'🎁'};}});
var sceneEl=null;
function things(ctx){var o=UI.objs(homeSlots,ctx,'thing'),m={};for(var i=0;i<o.length;i++){var x=o[i];if(x&&x.at&&THING_T[x.at])m[x.at]=x;}return m;}
function act(x){return function(e){if(e)e.stopPropagation();ok(function(){STAT.ev('v3',{a:'thing',k:x.at});});if(typeof x.go==='function')x.go();else if(x.go)UI.go(x.go);};}
function homeScene(){var sec=$('scr-home'),hh=$('hHouse');if(!sec||!hh)return;var S=VY.S,idx=Math.max(0,(S.unlocked||1)-1),ctx={S:S,lv:idx+1,pc:UI.pc(),wide:sec.classList.contains('wide')};
var t=tod(),wx=weather(),reg=regInfo(idx),svg=hh.querySelector('svg.hHouse');sec.classList.add('v3h');sec.setAttribute('data-tod',t);sec.classList.toggle('v3calm',calmOn());
var sky=D.createElement('div');sky.className='v3skyW';sky.innerHTML=skySvg(t,wx,reg);hh.insertBefore(sky,hh.firstChild);
var T=things(ctx),g=D.createElement('div');g.className='v3gnd';g.setAttribute('role','group');g.setAttribute('aria-label',L('Двор','Yard'));
for(var i=0;i<GROUND.length;i++){var at=GROUND[i],x=T[at];if(!x)continue;var b=D.createElement('button');b.className='v3th v3th-'+at+(x.hot||x.badge?' hot':'');b.setAttribute('aria-label',x.t||L(THING_T[at][0],THING_T[at][1]));b.title=x.t||'';
if(at==='bench'){b.innerHTML='<canvas class="v3bcv"></canvas>';}else b.innerHTML=propSvg(at)+'<span class="v3tl">'+esc(x.short||L(THING_T[at][0],THING_T[at][1]))+'</span>';
if(x.badge)b.innerHTML+='<em class="v3bd">'+esc(x.badge)+'</em>';b.onclick=act(x);g.appendChild(b);}
hh.appendChild(g);
if(svg){var fw=D.createElement('div');fw.className='v3fac';for(var k in FACADE){var y=T[k];if(!y)continue;var f=D.createElement('button');f.className='v3fi v3fi-'+k;f.setAttribute('aria-label',y.t||'');f.title=y.t||'';f.innerHTML=FAC_IC[k]+(y.badge?'<em class="v3bd">'+esc(y.badge)+'</em>':'');f.onclick=act(y);f.setAttribute('data-x',FACADE[k][0]);f.setAttribute('data-y',FACADE[k][1]);fw.appendChild(f);}
hh.appendChild(fw);placeFac();}
var bc=g.querySelector('.v3bcv');if(bc)requestAnimationFrame(function(){benchCv(bc);});
var go=$('hGo'),nav=$('hNav'),colB=sec.querySelector('.hColB');if(go&&nav&&colB){if(!ctx.wide){if(go.parentNode!==sec)sec.insertBefore(go,nav);}else if(go.parentNode!==colB)colB.appendChild(go);}
benchCol(ctx);
UI.emit('skin:scene',{tod:t,wx:wx,reg:reg.k});}
function placeFac(){var hh=$('hHouse'),svg=hh&&hh.querySelector('svg.hHouse'),fw=hh&&hh.querySelector('.v3fac');if(!svg||!fw)return;
var hr=hh.getBoundingClientRect(),r=svg.getBoundingClientRect();if(!r.width)return;var k=Math.min(r.width/340,r.height/232),ox=r.left-hr.left+(r.width-340*k)/2,oy=r.top-hr.top+(r.height-232*k)/2;
var q=fw.children;for(var i=0;i<q.length;i++){var e=q[i];e.style.left=(ox+(+e.getAttribute('data-x'))*k)+'px';e.style.top=(oy+(+e.getAttribute('data-y'))*k)+'px';}}
function benchCol(ctx){var body=sec2('hBody');if(!body)return;var col=body.querySelector('.v3bench');
if(!ctx.wide||!ON.pc||!(W.matchMedia&&matchMedia('(min-width:1100px)').matches)){if(col)col.parentNode.removeChild(col);return;}
if(!col){col=D.createElement('div');col.className='v3bench';body.insertBefore(col,body.firstChild);}
said=said||line();col.innerHTML='<div class="v3say" aria-live="polite">'+sayHtml(said)+'</div><canvas class="v3bcvL"></canvas><button class="btn sec v3more">'+L('💬 Ещё словечко','💬 Another word')+'</button>';
col.querySelector('.v3more').onclick=function(){V3SKIN.say();};col.querySelector('.v3bcvL').onclick=function(){V3SKIN.say();};
requestAnimationFrame(function(){var c=col.querySelector('.v3bcvL');if(c)benchCv(c,1);});}
function sec2(cls){var s=$('scr-home');return s&&s.querySelector('.'+cls);}
var V3SKIN=W.V3SKIN={lines:LINES,
say:function(t,who){var o=t?{who:who||'shura',t:t}:line();said=o;ok(function(){tone('triangle',660,880,.08,.03);});
var c=D.querySelector('.v3bench .v3say');if(c&&c.offsetParent){c.innerHTML=sayHtml(o);c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');return;}
var gs=D.querySelector('#gSide .v3say');if(gs&&gs.offsetParent){gs.innerHTML=sayHtml(o);return;}
var hh=$('hHouse'),b=hh&&hh.querySelector('.v3th-bench');if(!hh)return;var bb=$('v3bub');if(!bb){bb=D.createElement('div');bb.id='v3bub';bb.className='hBub v3bub';}hh.appendChild(bb);
var hr=hh.getBoundingClientRect(),br=b?b.getBoundingClientRect():hr;bb.innerHTML=sayHtml(o);bb.style.left=Math.max(4,Math.min(hr.width-214,br.left-hr.left+br.width/2-60))+'px';bb.style.top=Math.max(0,br.top-hr.top-4)+'px';
bb.classList.remove('on');void bb.offsetWidth;bb.classList.add('on');clearTimeout(V3SKIN._t);V3SKIN._t=setTimeout(function(){bb.classList.remove('on');},3600);},
sil:silPath,reg:regInfo,tod:tod,weather:weather,on:ON};
function sceneSoon(){var hh=$('hHouse');if(hh&&!hh.querySelector('.v3skyW'))ok(homeScene);}
if(ON.home&&UI.homeRender){var hr0=UI.homeRender;UI.homeRender=function(){if(ON.nav)navFix();var r=hr0.apply(this,arguments);sceneSoon();return r;};
UI.on('home',sceneSoon);
var mo=null;function watch(){var hh=$('hHouse');if(!hh||mo||!W.MutationObserver)return;mo=new MutationObserver(function(){sceneSoon();});mo.observe(hh,{childList:true});}
UI.on('home',watch);watch();
W.addEventListener('resize',function(){if(UI.cur==='home')setTimeout(placeFac,250);});
if(UI.cur==='home')UI.refresh();}
var myNav=null;
function navFix(){var a=W.navSlots;if(!a)return;var i;
for(i=a.length-1;i>=0;i--)if(a[i]&&a[i].id==='my'){myNav=myNav||a[i];a.splice(i,1);}
var it=UI.list(a),home=null,gar=null;for(i=0;i<it.length;i++){if(it[i].id==='home')home=it[i];if(it[i].id==='garage')gar=it[i];}
if(home&&!home.v3){var hd=home.dot;a.push({id:'home',order:home.order,ic:home.ic,t:home.t,go:home.go,v3:1,dot:function(){return ok(function(){return!!((hd&&hd())||(myNav&&myNav.dot&&myNav.dot()));},false);}});}
if(gar&&!gar.v3)a.push({id:'garage',order:gar.order,ic:'🚗',t:function(){return L('Машины','Cars');},go:gar.go,dot:gar.dot,v3:1});}
if(ON.nav&&W.navSlots){var np0=navSlots.push;navSlots.push=function(){var r=np0.apply(navSlots,arguments);navFix();return navSlots.length;};}
if(ON.nav){navFix();UI.on('screen',navFix);}
if(ON.yard&&typeof W.drawHouse==='function'){var dh0=W.drawHouse,pc={};
W.drawHouse=function(g,R,P,hBot,U){if(hBot>U*2.2&&hBot<U*3.6)U=Math.max(26,U*.8);var r=dh0.call(this,g,R,P,hBot,U);ok(function(){var G=VY.G;if(!G||!W.Path2D)return;
var hy=hBot-Math.min(hBot+2,U*2.6),top=hy-U*.12,hgt=Math.min(top*.6,U*1.6);if(hy<U*.9||hgt<10)return;
var t=G.tod||'day',k=regInfo(G.idx||0).k,p=pc[k]||(pc[k]=new Path2D(silPath(k))),ww=G_('W')||400,sc=hgt/60,step=400*sc;
g.save();g.beginPath();g.rect(0,0,ww,top);g.clip();g.fillStyle=HAZE[t]||HAZE.day;g.globalAlpha=t==='night'||t==='evening'?.85:.5;
for(var x=-step*.3;x<ww;x+=step){g.save();g.translate(x,top-hgt);g.scale(sc,sc);g.fill(p);g.restore();}g.restore();});return r;};}
function wideGame(){return W.matchMedia&&matchMedia('(min-width:1200px) and (min-height:600px) and (min-aspect-ratio:1/1)').matches;}
function gameRight(){var sg=$('scr-game');if(!sg)return;var r=$('v3gR');
if(!wideGame()||W.__demo){if(r)r.style.display='none';return;}
if(!r){r=D.createElement('div');r.id='v3gR';r.className='v3gR';sg.appendChild(r);}r.style.display='';
var S=VY.S,ctx={S:S,lv:(S.unlocked||1),pc:true,wide:true};r.innerHTML='<h3>'+L('Сегодня во дворе','Today in the yard')+'</h3><div class="v3gF"></div>';
var n=ok(function(){return UI.fill(r.querySelector('.v3gF'),homeSlots,ctx,'hs','feed','feed');},0);if(!n)r.querySelector('h3').style.display='none';
var bs=r.querySelectorAll('button');for(var i=0;i<bs.length;i++){bs[i].tabIndex=-1;bs[i].onclick=null;bs[i].removeAttribute('data-go');}}
if(ON.pc){
if(typeof W.sideUpd==='function'){var su0=W.sideUpd;W.sideUpd=function(){var r=su0.apply(this,arguments);ok(function(){var e=$('gSide');if(!e||W.__demo||!wideGame())return;
if(!e.querySelector('.v3sideB')){var d=D.createElement('div');d.className='v3sideB';said=said||line();d.innerHTML='<div class="v3say">'+sayHtml(said)+'</div><canvas class="v3bcvS"></canvas>';e.insertBefore(d,e.firstChild);
d.onclick=function(){V3SKIN.say();};requestAnimationFrame(function(){var c=d.querySelector('canvas');if(c)benchCv(c,1);});}});return r;};}
UI.on('yard-start',function(){said=line();setTimeout(gameRight,0);});
W.addEventListener('resize',function(){if(UI.cur==='game'){clearTimeout(gameRight.t);gameRight.t=setTimeout(function(){gameRight();ok(function(){sideUpd();});},200);}});}
var fete=null;
function feteOff(){if(fete&&fete.parentNode)fete.parentNode.removeChild(fete);fete=null;var m=$('modal');if(m)m.classList.remove('v3wm');}
function feteOn(ctx){feteOff();var app=$('app'),m=$('modal');if(!app||!m)return;m.classList.add('v3wm');
var calm=calmOn(),who=['shura','tolik','mihalych','valerka','mityai'],h='<div class="v3fW">';
for(var i=0;i<who.length;i++)h+='<span class="v3fWin" style="animation-delay:'+(i*.09)+'s">'+ok(function(){return UI.who(who[i],'clap');},'')+'</span>';
h+='</div>';
if(!calm){var R=rng(hash('cf'+(ctx&&ctx.idx))),col=['#ff5a6e','#ffc233','#4fc24a','#3f86ff','#9a6bff','#ff9340'];h+='<div class="v3conf">';
for(var k=0;k<36;k++)h+='<i style="left:'+(R()*100).toFixed(1)+'%;background:'+col[k%col.length]+';animation-delay:'+(R()*1.2).toFixed(2)+'s;animation-duration:'+(2.2+R()*1.6).toFixed(2)+'s;transform:rotate('+Math.round(R()*360)+'deg)"></i>';h+='</div>';}
h+='<canvas class="v3fB"></canvas>';
fete=D.createElement('div');fete.className='v3fete'+(calm?' calm':'');fete.setAttribute('aria-hidden','true');fete.innerHTML=h;app.insertBefore(fete,m);
requestAnimationFrame(function(){var c=fete&&fete.querySelector('.v3fB');if(c)benchCv(c,1);});UI.emit('skin:fete',ctx);}
function keep(e){var c=e.classList;if(!c)return true;
if(e.tagName==='H2'||c.contains('big-stars')||c.contains('rew')||c.contains('row')||c.contains('wSay')||c.contains('shura')||c.contains('tipl'))return true;
if(c.contains('newcar')&&!c.contains('sm'))return true;
if(c.contains('uslot')){var s=e.getAttribute('data-slot')||'';return/^(vymg-perekur|vypark-fin|vml)$/.test(s)||e.getAttribute('data-keep')==='1';}
if(c.contains('soc')||/^soc/.test(e.id||'')||e.querySelector&&e.querySelector('.soc-ntf'))return true;
if(e.tagName==='P'&&e.getAttribute('data-fit')==='3')return true;
if(c.contains('wk')||c.contains('week'))return true;
return false;}
function diet(ctx){var card=$('mcard');if(!card)return;card.classList.add('v3win');var kids=[].slice.call(card.children),goal=null,move=[];
for(var i=0;i<kids.length;i++){var e=kids[i];if(e.classList.contains('wTop'))continue;if(keep(e))continue;
if(!goal&&(e.classList.contains('goal')&&!e.classList.contains('gift')||e.classList.contains('uslot')&&/^(td|ord|car-pts)$/.test(e.getAttribute('data-slot')||''))){goal=e;continue;}
move.push(e);}
if(move.length<2)return;
var row=card.querySelector('.row'),d=D.createElement('details');d.className='v3more';
var ic=[];for(var j=0;j<move.length;j++){var t=(move[j].textContent||'').replace(/^\s+/,''),m=t.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF]|^[☀-➿]/);if(m&&ic.indexOf(m[0])<0&&ic.length<4)ic.push(m[0]);}
d.innerHTML='<summary>'+(ic.length?ic.join(' ')+' ':'')+L('Ещё новости двора','More yard news')+' · '+move.length+'</summary>';
for(j=0;j<move.length;j++)d.appendChild(move[j]);card.insertBefore(d,row||null);ok(function(){if(W.icoFix)icoFix(d.querySelector('summary'));});
d.addEventListener('toggle',function(){if(d.open)ev('wmore',{n:move.length});});}
if(ON.win){
UI.on('win',function(ctx){ok(function(){diet(ctx);});ok(function(){feteOn(ctx);});});
if(typeof W.hideModal==='function'){var hm0=W.hideModal;W.hideModal=function(){feteOff();return hm0.apply(this,arguments);};}
if(typeof W.modal==='function'){var mo0=W.modal;W.modal=function(){feteOff();return mo0.apply(this,arguments);};}
UI.on('screen',function(){feteOff();});UI.on('yard-start',function(){feteOff();});
ok(function(){var mc=$('mcard');if(mc&&W.MutationObserver)new MutationObserver(function(){if(fete&&!mc.classList.contains('v3win'))feteOff();}).observe(mc,{attributes:true,attributeFilter:['class']});});}
if(ON.zoom&&typeof W.autoZoom==='function'){W.V3SKIN_CS=32;
W.autoZoom=function(g){var c=G_('cs');if(!c)return;var z=Math.max(1.25,Math.min(1.9,40/c,G_('zoomMax()')||1.9)),sx=0,sy=0,n=0,ox=G_('ox'),oy=G_('oy');
for(var i=0;i<g.vs.length;i++){var v=g.vs[i];if(v.state==='idle'&&canExit(v,g.occ,g.p.w,g.p.h,v.id).free){var q=v.cells[0];sx+=ox+(q[0]+.5)*c;sy+=oy+(q[1]+.5)*c;n++;}}
var WW=G_('W'),HH=G_('H'),cx=n?sx/n:WW/2,cy=n?sy/n:HH/2,x=Math.min(0,Math.max(WW-WW*z,WW/2-cx*z)),y=Math.min(0,Math.max(HH-HH*z,HH/2-cy*z)),tipOn=$('tip')&&$('tip').style.display==='block';
setTimeout(function(){if(VY.G!==g||g.over||G_('cam.z')>1.02)return;camTo(z,x,y);var S=VY.S;
if(!S.zoomTip2){S.zoomTip2=1;ok(function(){save();});var fine=G_('FINE');VY.toast(fine?L('Двор большой — мы его приблизили. Колёсико мыши — масштаб, «🔍 Весь двор» — целиком','Big yard — we zoomed in. Mouse wheel to zoom, “🔍 Whole yard” to see it all'):L('Двор большой — мы его приблизили. Двигай двор пальцем, «🔍 Весь двор» — показать целиком','Big yard — we zoomed in. Drag to move around, “🔍 Whole yard” to see it all'),3500);}},tipOn?2100:650);};}
})();