'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.reg('z4l',{t:'Зина 4.0: за одним столом',who:'STOL'})||window.Z4L)return;
var Q=location.search;function qp(k){var m=new RegExp('[?&]'+k+'=([a-z0-9]+)').exec(Q);return m?m[1]:'';}
var F={vnuk:Z.reg('z4l.vnuk',{t:'Бабушка и внук: по очереди на одном телефоне (B32+M52)',who:'STOL'}),
banka:Z.reg('z4l.banka',{t:'Буквы падают в банку (B48)',who:'STOL'}),
scr:Z.reg('z4l.scr',{t:'Скрэббл с Галей: «Своя тетрадь» (M19)',who:'STOL'})};
var G4={vnuk:{t:'Бабушка и внук',ic:'👵',b:1,who:'zina'},banka:{t:'Буквы в банку',ic:'🍯',b:2,who:'zina'},scr:{t:'Своя тетрадь с Галей',ic:'📝',b:4,who:'galya'}};
var IDS=['vnuk','banka','scr'];
function tk(){try{return+todayKey();}catch(e){return 0;}}
function now(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}}
function dow(){var d=qp('z4lday');return d!==''?(+d)%7:new Date(now()).getDay();}
function zs(){if(typeof S==='undefined'||!S||!S.z4l||typeof S.z4l!=='object')return null;var z=S.z4l,t=tk();if(t&&z.k!==t){z.k=t;z.d=0;}return z;}
function open(){return Z.open('z4l');}
function list(){return IDS.filter(function(id){return F[id];});}
function today(){var L=list();if(!L.length)return'';var d=dow();if((d===0||d===6)&&F.vnuk)return'vnuk';
var o=L.filter(function(x){return x!=='vnuk';});if(!o.length)return L[0];return o[(Math.floor(tk()/1)%o.length+o.length)%o.length];}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function face(who,m){try{return window.ZMG&&ZMG.face?ZMG.face(who,m||'happy'):'';}catch(e){return'';}}
function T(k,c){return Z.txt(k,c);}
var dataP=null;function data(){return dataP||(dataP=ZB.load('js/zb4-stol-data.js').then(function(){ZB.refresh&&ZB.refresh();}).catch(function(){dataP=null;}));}
var cssOn=0;function css(){if(cssOn)return;cssOn=1;try{var l=document.createElement('link');l.rel='stylesheet';l.href='css/zb4-stol.css';l.setAttribute('data-z4l','1');document.head.appendChild(l);}catch(e){}}
function pay(n,why){var k=0;try{if(n>0&&window.ZBECO&&ZBECO.give)k=ZBECO.give('mg',n,'mg');}catch(e){}return k;}
var busy=0;
function go(id){if(busy||!G4[id]||!F[id]||!open())return Promise.resolve(null);busy=1;css();Z.ev('z4l',{a:'open',id:id});
try{if(typeof ensureDict==='function'&&!(typeof dictReady==='function'&&dictReady()))ensureDict();}catch(e){}
var f={vnuk:'vnuk',banka:'banka',scr:'scrabble'}[id];
return data().then(function(){return ZB.load('js/zb4-stol-x.js');}).then(function(){return ZB.load('js/zb4-stol-'+f+'.js');}).then(function(){busy=0;
return window.Z4LX?Z4LX.run(id):null;}).catch(function(e){busy=0;console.warn('z4l',id,e);try{toast('Игра не загрузилась — проверь интернет',3500);}catch(x){}return null;});}
function fin(id,o){var z=zs();o=o||{};var c=0;if(z){z.d|=G4[id].b;z.n++;
if(id==='vnuk'){if(o.w==='g')z.vb++;else if(o.w==='v')z.vv++;else z.vd++;}
if(id==='banka'&&o.sc>z.bb)z.bb=o.sc;
if(id==='scr'){if(o.w==='me')z.sw++;else if(o.w==='gal')z.sl++;if(o.sc>z.sb)z.sb=o.sc;}}
c=pay(o.c||0,id);Z.ev('z4l',{a:'end',id:id,sc:o.sc||0,w:o.w||'',c:c});
try{if(typeof save==='function')save();if(typeof cloudSoon==='function')cloudSoon();}catch(e){}return c;}
function cardOk(){var z=zs();return!!(open()&&z&&!z.d&&today());}
Z.card.add({id:'z4l',order:50,show:cardOk,
html:function(){if(!cardOk())return'';data();var id=today(),g=G4[id],t=T('z4l.card.'+id)||g.t+' — за одним столом у Зины.';
var oth=list().filter(function(x){return x!==id;}).map(function(x){return'<button class="btn z4l-cs" data-z4l="'+x+'">'+G4[x].ic+' '+esc(G4[x].t)+'</button>';}).join('');
return'<div class="z4l-card"><span class="z4l-cf">'+face(g.who)+'</span><div class="z4l-ct"><b>'+g.ic+' '+esc(g.t)+'</b><p>'+esc(t)+'</p>'+
'<button class="btn green z4l-cb" data-z4l="'+id+'">Сесть за стол</button>'+(oth?'<div class="z4l-co">'+oth+'</div>':'')+'</div></div>';},
mount:function(){css();}});
document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('.z4l-card [data-z4l]');if(!b)return;
try{SND.tap();}catch(x){}var id=b.getAttribute('data-z4l');Z.ev('z4l',{a:'card',id:id});go(id);});
window.Z4L={G4:G4,F:F,S:zs,go:go,fin:fin,T:T,esc:esc,face:face,tk:tk,today:today,open:open,list:list};
var st=qp('z4l');if(st&&G4[st])Z3.whenReady(function(){setTimeout(function(){go(st);},600);});
})();
