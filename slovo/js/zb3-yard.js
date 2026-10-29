'use strict';
(function(){
var Z=window.Z3;if(!Z||!Z.on||typeof ZB==='undefined'||!ZB.vw)return;
if(!Z.reg('z3y',{t:'Двор дома №7 вместо Дома',who:'YARD'}))return;
var F={cer:Z.reg('z3y-cer',{t:'Двор: церемония открытия предмета',who:'YARD'}),pie:Z.reg('z3y-pie',{t:'Двор после 4-го уровня, письмо, пирожок',who:'YARD'}),
demo:Z.reg('z3y-demo',{t:'1-й уровень: Зина сама собирает первое слово',who:'YARD'}),okpc:Z.reg('z3y-okpc',{t:'ОК на ПК: где найти игру завтра',who:'YARD'})};
var K=['c','w','l','p','g','d','k','r'];
Z.field('z3y',{def:{c:0,w:0,l:0,p:0,g:0,d:0,k:0,r:0},
merge:function(m,c){c=c||{};['c','l'].forEach(function(k){m[k]=(+m[k]||0)|(+c[k]||0);});['w','g','d','k','r'].forEach(function(k){m[k]=Math.max(+m[k]||0,+c[k]||0);});
var a=+m.p||0,b=+c.p||0;m.p=a&&b?Math.min(a,b):a||b;},
fix:function(m){K.forEach(function(k){m[k]=+m[k]||0;});}});
var DE=document.documentElement,st=document.createElement('style');DE.classList.add('z3y-wait');
st.textContent='html.z3y-wait #zbScene>*{visibility:hidden}html.z3y-wait #zbScene{background:var(--z3-y-sky2,#cfe9f4)}';document.head.appendChild(st);
function unwait(){DE.classList.remove('z3y-wait');}
setTimeout(unwait,6000);
window.Z3Y0={F:F,unwait:unwait};
ZB.load('js/zb3-yard-x.js').then(function(){},unwait);
})();
