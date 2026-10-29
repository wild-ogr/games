'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.OTKR||Z.OTKR.s)return;
var X=Z.OTKR,O=X.on;X.s=1;
var Q=location.search,FK=(/[?&]z4o=([a-z]+)/.exec(Q)||[])[1]||'',FD=(/[?&]z4od=(\d{4})/.exec(Q)||[])[1]||'';
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function isVK(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&!isOK();}
function now(){var t=0;try{t=typeof nowMs==='function'?nowMs():Date.now();}catch(e){t=Date.now();}return new Date(t);}
function tk(d){d=d||now();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function mon(){var d=now(),w=(d.getDay()+6)%7;return tk(new Date(d.getFullYear(),d.getMonth(),d.getDate()-w));}
function zz(){if(typeof S==='undefined'||!S)return{};if(!S.z4o||typeof S.z4o!=='object')S.z4o={};var z=S.z4o,t=tk(),m=mon();
if(+z.k!==m){z.k=m;z.n=z.w=z.h=z.b=z.c=z.d=0;}if(+z.td!==t){z.td=t;z.tn=z.tw=0;}return z;}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function ev(a,o){o=o||{};o.a=a;Z.ev('z4o',o);}
X.tk=tk;X.zz=zz;X.ev=ev;X.isVK=isVK;X.isOK=isOK;
X.dn=function(){var d=now();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);};
X.pick=function(key,salt){var L=window.Z4T&&Z4T[key];if(!L||!L.length)return'';var n=L.length,st=n>7?7:1;while(n%st===0&&st>1)st++;
return L[((X.dn()+(salt||0))*st%n+n)%n];};
X.data=function(){return window.Z4T&&Z4T['z4o.utro']?Promise.resolve():ZB.load('js/zb4-otkr-data.js');};
X.x=function(){return Promise.all([X.data(),window.Z4OX?Promise.resolve():ZB.load('js/zb4-otkr-x.js')]);};
X.open=function(k,o){ev('open',{k:k});X.x().then(function(){if(window.Z4OX)Z4OX.open(k,o||{});},function(){try{toast('Открытка не загрузилась — попробуй ещё раз',3000);}catch(e){}});};
X.data().catch(function(){});
var seq=[],seqG=null;
Z.onStart(function(i){seq=[];seqG=i.G;});
Z.onWord(function(o){var z=zz();if(!z.k)return;if(o.bonus)z.b++;else{z.w++;z.tw++;if(o.byHint)z.h++;}
if(o.G===seqG&&seq.length<40)seq.push(o.bonus?'s':o.byHint?'y':'g');});
Z.onWin(function(i){var z=zz();if(!z.k)return;z.n++;z.tn++;if(!i.hints)z.c++;z.d|=1<<((now().getDay()+6)%7);});
X.seq=function(){return seq.slice();};
var tabG=null,tabI=null;
if(O.tab)Z.winLine.add({id:'z4o',order:60,txt:function(i){tabG=null;if(!Z.open('z4o.tab')||i.daily||i.mode||!i.G||i.G!==seqG||seq.length<3)return'';
var g=seq.filter(function(x){return x!=='s';}).length;if(g<3)return'';
tabG=i.G;tabI={lv:i.lv,seq:seq.slice()};return'Табель: '+X.grid(seq,10)+' — переслать ›';}});
X.grid=function(s,max){var M={g:'🟩',y:'🟨',s:'⭐'},t='';s.slice(0,max||40).forEach(function(x){t+=M[x]||'';});return t+(s.length>(max||40)?'…':'');};
document.addEventListener('click',function(e){var t=e.target;while(t&&t!==document&&!(t.classList&&t.classList.contains('z4wl')))t=t.parentNode;
if(!t||t===document||!tabG||typeof G==='undefined'||G!==tabG||String(t.textContent).indexOf('Табель:')!==0)return;
try{SND.tap();}catch(x){}X.open('tab',tabI);},true);
function hour(){return now().getHours();}
X.hol=function(){var md=FD||String(tk()).slice(4),L=window.Z4T&&Z4T['z4o.hol']||[];
for(var i=0;i<L.length;i++){var p=String(L[i]).split('|');if(p[0]===md)return{md:p[0],t:p[1],m:p[2]};}return null;};
function due(){var z=zz(),t=tk();if(!z.k)return'';
if(FK)return FK==='hol'&&!O.hol?'':(O[FK]?FK:'');
if(O.dnev&&Z.open('z4o.dnev')&&now().getDay()===0&&z.n>0&&+z.dv!==t)return'dnev';
if(O.den&&isVK()&&Z.open('z4o.den')&&hour()>=17&&z.tn>=3&&+z.st!==t)return'den';
if(O.utro&&Z.open('z4o.utro')&&hour()<13&&+z.u!==t)return O.hol&&X.hol()?'hol':'utro';
return'';}
var CH={utro:['☀️','Открытка «С добрым утром»','Зина проверила её красной ручкой — перешли соседям'],
hol:['🎉','Праздничная открытка','Зина подписала — перешли соседям'],
dnev:['📒','Дневник за неделю','Оценки выставлены. Нужна подпись родителей'],
den:['📸','История дня','Зина, твои уровни за сегодня и шутка — в историю ВКонтакте']};
var shown='';
if(O.utro||O.dnev||O.den)Z.card.add({id:'z4o',order:60,show:function(){return!!due();},
html:function(){var k=due(),c=CH[k];if(!c)return'';if(k==='hol'){var h=X.hol();if(h)c=[c[0],h.t,c[2]];}
if(shown!==k+tk()){shown=k+tk();ev('show',{k:k});}
return'<div class="z4o-c" style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;border-radius:var(--z3-rb,16px);background:var(--z3-card,#fff);box-shadow:var(--z3-shadow);color:var(--z3-ink,#27324a);font-family:var(--z3-font)">'+
'<span style="font-size:30px;line-height:1">'+c[0]+'</span><span style="flex:1;min-width:0;text-align:left"><b style="display:block;font-size:16px">'+esc(c[1])+'</b>'+
'<small style="display:block;font-size:14px;color:var(--z3-ink2,#5d6781)">'+esc(c[2])+'</small></span>'+
'<button type="button" class="btn green small z4o-cb" data-k="'+k+'" style="min-height:44px">Открыть</button></div>';},
mount:function(el){var b=el&&el.querySelector('.z4o-cb');if(!b)return;b.onclick=function(){try{SND.tap();}catch(e){}var k=b.getAttribute('data-k'),z=zz();
if(k==='dnev')z.dv=tk();else if(k==='den')z.st=tk();else z.u=tk();sv();X.open(k,k==='hol'?X.hol():null);
setTimeout(function(){try{ZB.refresh();}catch(e){}},300);};}});
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
X.esc=esc;
X.perl=function(){return X.pick('z4o.perl',3);};
function perlLoad(){return window.Z4T&&Z4T['z4o.perl']?Promise.resolve():ZB.load('js/zb4-otkr-perl.js');}
function perlIns(el,op){op=op||{};if(!el||op.arch||op.r||op.pg||op.dn!=null||ZB.cur!=='z3paper'||!Z.open('z4o.perl'))return;
perlLoad().then(function(){var sh=el.querySelector('.z3p-sheet');if(!sh||sh.querySelector('.z4o-perl')||ZB.cur!=='z3paper')return;var p=X.perl();if(!p)return;
var a=String(p).split('|'),d=document.createElement('div');d.className='z4o-perl';
d.style.cssText='margin:10px 0;padding:10px 12px;border-radius:12px;background:var(--z3-paper,#fbf7ec);border:1px dashed var(--z3-line,#e6dcc8);text-align:left;color:var(--z3-ink,#27324a)';
d.innerHTML='<b style="display:block;font:700 16px/1.3 var(--z3-font-news,Georgia,serif)">📝 Перлы моих учеников</b>'+
'<p style="margin:6px 0 4px;font-size:15px;line-height:1.35;font-style:italic">«'+esc(a[0])+'»</p>'+
(a[1]?'<p style="margin:0 0 6px;font:600 19px/1.25 var(--z3-font-hand,cursive);color:var(--z3-red,#d0342c)">'+esc(a[1])+'</p>':'')+
'<button type="button" class="btn ghost small z4o-pb" style="min-height:44px">✉️ Переслать перл</button>';
var arb=sh.querySelector('.z3p-arb');if(arb)sh.insertBefore(d,arb);else sh.appendChild(d);
d.querySelector('.z4o-pb').onclick=function(){try{SND.tap();}catch(e){}X.open('perl',{p:p});};},function(){});}
function perlWrap(){var P=window.Z3PAPER;if(!P||typeof P.render!=='function'||P.render.__z4o)return!!(P&&P.render&&P.render.__z4o);
var r0=P.render,w=function(el,op){var r=r0.apply(this,arguments);ZB.safe('z4o-perl',function(){perlIns(el,op);});return r;};for(var k in r0)w[k]=r0[k];w.__z4o=1;P.render=w;return true;}
if(O.perl&&ZB._scr&&ZB._scr.z3paper){var sc=ZB._scr.z3paper,s0=sc.render;
sc.render=function(el,op){var r=s0.apply(this,arguments);var P=window.Z3PAPER;
if(P&&!perlWrap()&&P.x)P.x().then(function(){perlWrap();ZB.safe('z4o-perl',function(){perlIns(el,op);});},function(){});
else ZB.safe('z4o-perl',function(){perlIns(el,op);});return r;};}
})();
