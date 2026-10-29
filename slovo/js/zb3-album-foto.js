'use strict';
(function(){
var AL=window.Z3ALB;if(!AL||AL.foto)return;
var E0=20260105,NF=7,NAME={1:'Санаторий',2:'Свадьба'},
PROP={1:['🧳','👟','🤸','🛁','🎲','🍲','🏠'],2:['🏃','📌','☕','⛺','💍','🎂','🚗']},
MOOD={1:['happy','stern','happy','wow','stern','norm','happy'],2:['wow','stern','wow','stern','happy','wow','happy']},
TIME=['day','day','day','day','eve','day','eve'],SEAS={1:['sum','sum','sum','aut','aut','aut','aut'],2:['spr','spr','sum','sum','sum','sum','aut']};
function T(k,ctx){var s='';try{s=AL.T(k,ctx);}catch(e){}return s;}
function cur(){var dn=Z3.days(E0,Z3.tk()),wk=Math.floor(dn/7),sw=((wk%8)+8)%8,w0=wk-sw%4;return{dn:dn,s:sw<4?1:2,w0:w0,d:dn-w0*7};}
function seasons(){var c=cur();return[{s:3-c.s,d0:(c.w0-4)*7,done:NF,fin:1},{s:c.s,d0:c.w0*7,done:Math.floor(c.d*NF/28),fin:0}];}
function frames(S){var o=[];for(var k=1;k<=NF;k++)o.push({s:S.s,k:k,dn:S.d0+Math.round((k-1)*28/NF),ok:k<=S.done});return o;}
AL.fotoBox=function(){var c=cur();return['f','📷','Фотоальбом сезона','сезон «'+NAME[3-c.s]+'» — снимки готовы',''];};
var css0=0;function css(){if(css0)return;css0=1;var s=document.createElement('style');s.id='z3afCss';s.textContent=
'.z3af-ph{background:var(--z3-paper);padding:10px 10px 14px;border-radius:4px;box-shadow:var(--z3-shadow);transform:rotate(-1.2deg);max-width:440px;margin:6px auto 0}'+
'.z3af-ph.r{transform:rotate(1.2deg)}.z3af-pic{position:relative;height:230px;overflow:hidden;background:var(--z3-line);border-radius:2px}.z3af-pic>svg{width:100%;height:100%;display:block}'+
'.z3af-z{position:absolute;left:6px;bottom:0;width:96px;height:96px}.z3af-z svg{width:100%;height:100%}'+
'.z3af-st{position:absolute;right:10px;top:10px;font-size:34px;line-height:1;filter:drop-shadow(0 2px 0 var(--z3-paper))}'+
'.z3af-cn{position:absolute;width:26px;height:26px;border:3px solid var(--z3-a-edge);opacity:.55}.z3af-cn.a{left:4px;top:4px;border-right:0;border-bottom:0}.z3af-cn.b{right:4px;bottom:4px;border-left:0;border-top:0}'+
'.z3af-cap{font-family:var(--z3-font-hand);font-size:21px;line-height:1.25;margin:10px 4px 4px}.z3af-ph .f{font-size:13.5px;color:var(--z3-ink2);margin:4px 4px 0}'+
'.z3af-ph .q{font-size:14px;margin:6px 4px 0;color:var(--z3-ink)}.z3af-wait .z3af-pic{display:flex;align-items:center;justify-content:center;font-size:44px;background:var(--z3-a-linen)}'+
'.z3af-end .z3af-pic{background:var(--z3-a-card);display:flex;align-items:center;justify-content:center}.z3af-end .z3af-pic .z3af-z{position:static;width:150px;height:150px}';
document.head.appendChild(s);}
function yardCss(){var A=window.Z3ART;if(!A||!A.yardCss||document.getElementById('z3yArtCss'))return;var c=document.createElement('style');c.id='z3yArtCss';c.textContent=A.yardCss;document.head.appendChild(c);}
function pic(f){var A=window.Z3ART,U=AL.ui,i=f.k-1,y='';
if(A&&A.yard)y=ZB.safe('z3af-yard',function(){return A.yard({lay:'sq',time:TIME[i],season:SEAS[f.s][i]});})||'';
return y+'<span class="z3af-cn a"></span><span class="z3af-cn b"></span><div class="z3af-z">'+U.zina(MOOD[f.s][i])+'</div><div class="z3af-st">'+PROP[f.s][i]+'</div>';}
function draw(f,i){var U=AL.ui,cls='z3af-ph'+(i%2?' r':'');
if(!f.ok)return'<div class="'+cls+' z3af-wait"><div class="z3af-pic">🎞️</div><p class="z3af-cap">'+U.esc(T('foto-wait')||'Плёнку ещё проявляют. Мой держит фонарь — красный, как он сам.')+'</p>'+
'<p class="f">снимок '+f.k+' из '+NF+' · будет '+U.esc(U.dt(U.dnKey(f.dn)))+'</p></div>';
return'<div class="'+cls+'"><div class="z3af-pic">'+pic(f)+'</div><p class="z3af-cap">'+U.esc(T('foto-s'+f.s+'-'+f.k)||'Снимок '+f.k+'.')+'</p>'+
'<p class="f">сезон «'+U.esc(NAME[f.s])+'» · снимок '+f.k+' из '+NF+' · '+U.esc(U.dt(U.dnKey(f.dn)))+'</p></div>';}
AL.foto=function(el,op){css();var U=AL.ui,L=seasons(),si=op.si===1?1:0,S=L[si],F=frames(S);
el.innerHTML='<div class="z3a-scr">'+U.hdr('Фотоальбом Зины','сериал «Из жизни двора»','al')+'<div class="z3a-body">'+
'<div class="z3a-say"><div class="z3a-av">'+U.zina('happy')+'</div><div class="z3a-bub">'+U.esc(T('foto-hi')||'Каждую неделю — снимок. Мой снимает, я командую. Поэтому ровно.')+'</div></div>'+
'<div class="z3a-chips">'+L.map(function(x,i){return'<button type="button" class="btn small'+(i===si?'':' ghost')+'" data-si="'+i+'">'+(x.fin?'Итоги: ':'Снимаем: ')+U.esc(NAME[x.s])+'</button>';}).join('')+'</div>'+
'<div class="z3a-view"></div></div></div>';U.bindBack(el);
[].forEach.call(el.querySelectorAll('[data-si]'),function(b){b.onclick=function(){U.snd();ZB.go('z3album',{s:'f',si:+b.getAttribute('data-si')});};});
var go=function(){if(!el.isConnected)return;yardCss();U.flip('f',U.viewer(el,F,op.i|0,draw));};
Promise.all([window.Z3ART&&Z3ART.yard?0:ZB.load('js/zb3-art-yard.js')].map(function(p){return Promise.resolve(p).catch(function(){});})).then(go,go);
AL.ev('foto',{s:S.s,e:'open',f:S.fin});};
})();
