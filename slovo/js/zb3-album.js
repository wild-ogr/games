'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||!window.Z3||!Z3.on)return;
var ON=Z3.reg('album',{t:'Комод Зины: альбом шуток, рушники, подшивка, открытки мест, звания',who:'ALBUM'});
if(!ON)return;
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var DEF={t:0,s:0,l:0,m:0,e:0,f:0,v:0},NK=['t','s','l','m','e','f','v'];
Z3.field('z3a',{def:{t:0,s:0,l:0,m:0,e:0,f:0,v:0},
fix:function(z){NK.forEach(function(k){z[k]=num(z[k]);});for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;m.t|=num(c.t);m.s|=num(c.s);['l','m','e','v'].forEach(function(k){m[k]=Math.max(num(m[k]),num(c[k]));});
if(num(c.f)&&(!num(m.f)||num(c.f)<num(m.f)))m.f=num(c.f);}});
function A(){if(!S.z3a||typeof S.z3a!=='object')S.z3a={t:0,s:0,l:0,m:0,e:0,f:0,v:0};return S.z3a;}
function ev(a,o){o=o||{};o.a=a;Z3.ev('z3a',o);}
function sv(){try{save();}catch(e){}}
function lsG(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
var JK='z3-aj',JMAX=400,JC=null;
function cards(){if(JC)return JC;JC=lsG(JK,[]);if(!(JC instanceof Array))JC=[];return JC;}
function textOf(box){if(!box)return'';var c=box.cloneNode(true);[].forEach.call(c.querySelectorAll('.znr,.z3p-rate,button,svg'),function(x){x.parentNode.removeChild(x);});
return String(c.textContent||'').replace(/\s+/g,' ').trim().slice(0,300);}
function catchRate(e){var b=e.target&&e.target.closest?e.target.closest('.znr button,.z3p-rate button'):null;if(!b)return;
ZB.safe('z3a-jk',function(){var sp=b.parentNode,id=sp&&sp.getAttribute('data-id');if(!id)return;var v=+b.getAttribute('data-v')===1?1:0;
var paper=sp.classList.contains('z3p-rate'),src=paper?'paper':(sp.getAttribute('data-s')||'lv');
var L0=lsG(paper?'z3-rt':'zn-rated',[]);if(L0 instanceof Array&&L0.indexOf(id)>=0)return;if(cards().some(function(c){return c.i===id;}))return;
var z=A();if(v)z.l++;else z.m++;
if(v){var t=textOf(sp.parentNode);if(t.length>=6){var L=cards();for(var i=0;i<L.length;i++)if(L[i].i===id){L.splice(i,1);break;}
L.push({i:String(id).slice(0,60),t:t,s:src,k:Z3.tk()});if(L.length>JMAX)L.splice(0,L.length-JMAX);lsS(JK,L);}}
sv();});}
window.addEventListener('click',catchRate,true);
(function(){try{var h=location.hash||'',q=/[?&]hash=([^&]*)/.exec(location.search);if(q)h+='&'+decodeURIComponent(q[1]);var c=/(?:^|[#&])jk=(a[A-Za-z0-9_-]{8,330})/.exec(h);if(c)lsS('z3-ajin',c[1]);}catch(e){}})();
var X='js/zb3-album-s.js',AL=window.Z3ALB={A:A,ev:ev,sv:sv,lsG:lsG,lsS:lsS,num:num,cards:cards,on:function(){return ON&&Z3.open('album');}};
function L(k,d){return typeof AL[k]==='function'?AL[k]():d;}
Z3.yardAdd({id:'album',order:80,t:'Комод',ic:'🗄️',stub:function(){return false;},
go:function(){ZB.go('z3album',{});},
badge:function(){return L('badge','');},hot:function(){return L('hot',false);},
note:function(){return L('note',Z3.open('album')?'альбом недели':'наряды и блюдца');}});
ZB.screen('z3album',{title:'Комод Зины',render:function(el,op){
if(AL.render){ZB.safe('z3a-scr',function(){AL.render(el,op||{});});return;}
el.innerHTML='<div style="padding:40px 16px;text-align:center;color:var(--z3-ink2,#6b5f4c);background:var(--z3-bg,#fff8ec);min-height:100%">🗄️ Зина открывает комод…</div>';
Z3.need(X).then(function(){AL.scr(el,op);},function(){try{if(typeof toast==='function')toast('Комод заело — попробуй ещё раз',3000);}catch(e){}try{if(typeof openMenu==='function')openMenu();}catch(e){}});}});
Z3.late(X,{day:7});
})();
