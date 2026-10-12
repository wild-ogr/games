'use strict';
/* zb2-LOV · рекорды ловкостных: поле S.z2r и загрузка (js/zmg-rec.js → window.ZMGREC). Всё остальное и договор — js/zmg-rec-ui.js (лениво). Флаги 'rec', 'recboard'. */
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||!ZB2.reg('rec',{t:'Рекорды ловкостных: соседки, «Ещё разок»',who:'LOV'}))return;
ZB2.reg('recboard',{t:'Доска рекордов на Доме',who:'LOV'});var FA=ZB2.reg('fotoauto',{t:'«Фото класса» само при переходе в новый класс',who:'LOV'});
/* S.z2r: r {id:'рекорд.партий.Галя.деньГали.неделя'}, wk — неделя, nw/nd — новость «Галя побила» и её день, nt — день заметки за рекорд, fc — класс последнего «Фото класса» */
var OK=/^[a-z]{2,12}$/;
function T(s){var a=String(s||'').split('.');return {b:+a[0]||0,n:+a[1]||0,g:+a[2]||0,gd:+a[3]||0,w:+a[4]||0};}
function P(t){return [t.b,t.n,t.g,t.gd,t.w].map(function(x){return Math.max(0,Math.round(+x||0));}).join('.');}
ZB2.field('z2r',{def:{r:{},wk:0,nw:'',nd:0,nt:0,fc:0},
  fix:function(z){if(!z.r||typeof z.r!=='object'||Array.isArray(z.r))z.r={};for(var k in z.r)if(!OK.test(k))delete z.r[k];else z.r[k]=P(T(z.r[k]));
    ['wk','nd','nt','fc'].forEach(function(k){z[k]=Math.max(0,+z[k]||0);});if(typeof z.nw!=='string')z.nw='';},
  merge:function(m,c){var cw=+c.wk||0,mw=+m.wk||0,cr=c.r&&typeof c.r==='object'?c.r:{};if(!m.r||typeof m.r!=='object')m.r={};
    for(var k in cr){if(!OK.test(k))continue;var a=T(m.r[k]),b=T(cr[k]),gb=b.gd>a.gd||(b.gd===a.gd&&b.g>a.g);
      m.r[k]=P({b:Math.max(a.b,b.b),n:Math.max(a.n,b.n),g:gb?b.g:a.g,gd:gb?b.gd:a.gd,w:cw>mw?b.w:cw<mw?a.w:Math.max(a.w,b.w)});}
    if(cw>mw){for(var j in m.r)if(!(j in cr)){var t=T(m.r[j]);t.w=0;m.r[j]=P(t);}m.wk=cw;}
    if((+c.nd||0)>(+m.nd||0)){m.nd=+c.nd;m.nw=String(c.nw||'');}m.nt=Math.max(+m.nt||0,+c.nt||0);m.fc=Math.max(+m.fc||0,+c.fc||0);}});
function load(){return R.ui?Promise.resolve(R):ZB.load('js/zmg-rec-ui.js').then(function(){return R;});}
var R=window.ZMGREC={v:1,T:T,P:P,load:load,cfg:function(id,o){(R._q=R._q||{})[id]=o;},best:function(id){return T(S.z2r&&S.z2r.r&&S.z2r.r[id]).b;},
  /* до загрузки ленивой части: итог оболочки сразу, рекорд и таблица — как догрузится */
  finish:function(host,x){x=x||{};host.finish({sc:x.sc,st:x.st,h:x.h,label:x.label});load().then(function(){R.again(host,R.put(host.id,x.sc));});}};
/* играл в ловкостные — догрузить Доску рекордов (полоска на Доме, «Галя отыгралась») в тишине после старта */
ZB.on('ready',function(){setTimeout(function(){ZB.safe('zl-load',function(){if(S.z2r&&Object.keys(S.z2r.r||{}).length)load().catch(function(){});});},2000);});
/* «Фото класса» само: на Доме после перехода в новый класс (тихо: нет окна, нет игры; первый раз — только запомнить класс) */
if(FA)ZB.on('home',function(){setTimeout(function(){ZB.safe('zl-foto',function(){var z=S.z2r,c=window.ZBS&&ZBS.cls?ZBS.cls():0,m=document.getElementById('modal');if(!z||!c||!window.ZMG)return;
  if(!z.fc){z.fc=c;return;}if(c<=z.fc||c>11||ZMG.busy||(m&&m.classList.contains('on'))||!(document.getElementById('menu')||{classList:{contains:function(){}}}).classList.contains('on'))return;
  try{if(window.ZBNB&&ZBNB.turn&&!ZBNB.turn('foto'))return;}catch(e){}z.fc=c;try{save();}catch(e){}ZMG.open('foto',{mode:'auto',ctx:{cls:c},back:function(){ZB.refresh();}});});},1800);});
})();
