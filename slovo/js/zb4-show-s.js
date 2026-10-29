'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.reg('z4w',{t:'Зина 4.0: телешоу у Зины',who:'SHOW'})||window.Z4W)return;
var Q=location.search;
function qp(k){var m=new RegExp('[?&]'+k+'=([a-z0-9]+)').exec(Q);return m?m[1]:'';}
var F={svoya:Z.reg('z4w.svoya',{t:'Табло у Зины (чт): 5 тем × 5 клеток, кот в мешке, подготовка месяцем',who:'SHOW'}),
pole:Z.reg('z4w.pole',{t:'Слово на барабане (пт): шоу над Барабаном, коробка-приз',who:'SHOW'}),
priz:Z.reg('z4w.priz',{t:'Приз или суперигра после главы',who:'SHOW'}),
loto:Z.reg('z4w.loto',{t:'Лото у Зины (вс): лото Митяя из твоих слов, итог в 21:00',who:'SHOW'}),
kvart:Z.reg('z4w.kvart',{t:'Квартирник Валерки (сб): песня с пропусками, строчка в стенгазету',who:'SHOW'}),
pesnya:Z.reg('z4w.pesnya',{t:'Допой песню: буквы найденных слов — нотами народной мелодии',who:'SHOW'})};
var SH={svoya:{dw:4,t:'Табло у Зины',who:'zina',b:1,f:'svoya',ic:'📺'},pole:{dw:5,t:'Слово на барабане',who:'zina',b:2,f:'pole',ic:'🎡'},
kvart:{dw:6,t:'Квартирник Валерки',who:'valerka',b:8,f:'pesnya',ic:'🎸'},loto:{dw:0,t:'Лото у Зины',who:'mityai',b:4,f:'loto',ic:'🎱'},
priz:{dw:-1,t:'Приз или суперигра',who:'zina',b:16,f:'pole',ic:'🎁'}};
function now(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}}
function tk(){try{return+todayKey();}catch(e){return 0;}}
function dow(){var d=qp('z4wday');return d!==''?(+d)%7:new Date(now()).getDay();}
function hour(){var h=qp('z4wh');return h!==''?+h:new Date(now()).getHours();}
function zs(){if(typeof S==='undefined'||!S)return null;var z=S.z4w;if(!z||typeof z!=='object')return null;var t=tk();
if(t&&z.k!==t){z.k=t;z.d=0;z.ls=0;}
var m=Math.floor(t/100);if(m&&z.m!==m){var pm=z.m,y=Math.floor(m/100),mm=m%100;z.pl=pm&&(pm===(mm===1?(y-1)*100+12:m-1))?z.p:0;z.m=m;z.p=0;}
return z;}
function open(){return Z.open('z4w');}
function today(){var d=dow();for(var id in SH)if(SH[id].dw===d&&F[id]&&!(id==='kvart'&&!F.kvart))return id;return'';}
function done(id){var z=zs();return!!(z&&z.d&SH[id].b);}
function prizDue(){var z=zs();return!!(F.priz&&z&&z.pz>z.pt);}
function lotoRes(){var z=zs();return!!(F.loto&&z&&dow()===0&&hour()>=21&&(z.d&4)&&!(z.d&32));}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function face(who){try{return window.ZMG&&ZMG.face?ZMG.face(who,'happy'):'';}catch(e){return'';}}
function T(k,c){return Z.txt(k,c);}
var dataP=null;function data(){return dataP||(dataP=ZB.load('js/zb4-show-data.js').then(function(){ZB.refresh&&ZB.refresh();}).catch(function(){dataP=null;}));}
var cssOn=0;function css(){if(cssOn)return;cssOn=1;try{var l=document.createElement('link');l.rel='stylesheet';l.href='css/zb4-show.css';l.setAttribute('data-z4w','1');document.head.appendChild(l);}catch(e){}}
Z.onWord(function(o){if(!F.svoya||o.byHint)return;var z=zs();if(z&&z.p<99999)z.p++;});
Z.onWin(function(i){if(!F.priz||!open()||!i.first||i.daily||i.mode)return;var L=typeof CH_LEN!=='undefined'?CH_LEN:20,z=zs();
if(z&&L>0&&i.lv%L===0){var c=i.lv/L;if(c>z.pz){z.pz=c;if(z.pt<c-1)z.pt=c-1;}}});
function pay(n,why){var k=0;try{if(window.ZBECO&&ZBECO.give)k=ZBECO.give('mg',n,'mg');}catch(e){}if(k)Z.ev('z4w',{a:'rw',id:why||'',c:k});return k;}
var busy=0;
function go(id,ctx){if(busy||!SH[id]||!F[id]||!open())return Promise.resolve(null);busy=1;css();Z.ev('z4w',{a:'open',id:id});
var fs=['js/zb4-show-x.js',
'js/zb4-show-'+SH[id].f+'.js'];
return data().then(function(){return ZB.load(fs[0]);}).then(function(){return ZB.load(fs[1]);}).then(function(){busy=0;
var run=window.Z4WX&&Z4WX.run;if(!run)return null;return run(id,ctx||{});}).catch(function(e){busy=0;console.warn('z4w',id,e);
try{toast('Шоу не загрузилось — проверь интернет',3500);}catch(x){}return null;});}
function fin(id,sc){var z=zs();if(!z)return;z.d|=SH[id].b;z.n++;sc=Math.max(0,Math.floor(+sc||0));
var bk={svoya:'bs',pole:'bp',loto:'bl',kvart:'bk'}[id];if(bk&&sc>z[bk])z[bk]=sc;if(id==='loto')z.ls=Math.max(z.ls,sc);
Z.ev('z4w',{a:'end',id:id,sc:sc});try{if(typeof save==='function')save();if(typeof cloudSoon==='function')cloudSoon();}catch(e){}ZB.refresh&&ZB.refresh();}
function lotoNb(){var t=tk(),a=(t*2654435761)>>>0;function r(n){a=(a*1103515245+12345)>>>0;return a%n;}return{m:300+r(40)*10,g:250+r(45)*10};}
function cardId(){if(!open())return'';if(prizDue())return'priz';if(lotoRes())return'loto21';var id=today();return id&&!done(id)?id:'';}
Z.card.add({id:'z4w',order:40,show:function(){return!!cardId();},
html:function(){var id=cardId();if(!id)return'';data();var k=id==='loto21'?'loto':id,s=SH[k],t=T('z4w.card.'+id);
if(id==='loto21'){var z=zs(),n=lotoNb();t=T('z4w.loto.week',{me:z.ls,m:n.m,g:n.g})||t;}
if(!t)t=s.t+' — сегодня у Зины.';
return'<div class="z4w-card"><span class="z4w-cf">'+face(s.who)+'</span><div class="z4w-ct"><b>'+s.ic+' '+esc(s.t)+'</b><p>'+esc(t)+'</p>'+
'<button class="btn z4w-cb" data-z4w="'+id+'">'+(id==='loto21'?'Спасибо, Митяй!':id==='priz'?'Выбрать':'Смотреть шоу')+'</button></div></div>';},
mount:function(){css();}});
document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('.z4w-card [data-z4w]');if(!b)return;
try{SND.tap();}catch(x){}var id=b.getAttribute('data-z4w');Z.ev('z4w',{a:'card',id:id});
if(id==='loto21'){var z=zs();if(z)z.d|=32;ZB.refresh&&ZB.refresh();return;}go(id);});
Z.winLine.add({id:'z4w',order:40,txt:function(){if(!open())return'';var z=zs();if(!z)return'';data();var id=today();
if(id&&!done(id))return T('z4w.line.show',{t:SH[id].t});
if(z.lw&&z.lw.k&&tk()-z.lw.k<=1&&F.kvart){var s=line(z.lw.i,z.lw.w);if(s)return T('z4w.kvart.paper',{s:s});}
if(F.svoya&&z.p>=20&&dow()!==4&&Math.random()<.35)return T('z4w.prep',{n:z.p});return'';}});
function line(i,w){var L=window.Z4W_SONGS,s=L&&L[Math.floor(i/10)],l=s&&s.l[i%10];return l?l.replace(/\[[а-яё]+\]/,String(w).toUpperCase()):'';}
window.Z4W={SH:SH,F:F,S:zs,go:go,fin:fin,pay:pay,T:T,esc:esc,face:face,dow:dow,tk:tk,line:line,lotoNb:lotoNb,today:today,open:open};
var st=qp('z4w');if(st&&SH[st])Z3.whenReady(function(){setTimeout(function(){go(st);},600);});
if(open())data();
})();
