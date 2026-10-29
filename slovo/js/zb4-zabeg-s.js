'use strict';
(function(){
var Z=window.Z4,X=Z&&Z.ZAB;if(!X||X.s||typeof S==='undefined')return;X.s=1;
var O=X.on,D=document;
function tk(){try{return+todayKey();}catch(e){return 0;}}
X.tk=tk;
X.zz=function(){var z=S.z4q;if(!z||typeof z!=='object')z=S.z4q={ks:''};return z;};
X.can=function(k){return!!O[k]&&Z.open('z4q.'+k)&&(+S.lv||0)>=X.LV;};
X.any=function(){return X.can('port')||X.can('tetr')||X.can('kontr');};
X.ev=function(a,o){o=o||{};o.a=a;Z.ev('z4q',o);};
X.esc=function(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
X.run=function(){try{var r=JSON.parse(localStorage.getItem('z4q-run')||'null');return r&&r.L&&r.L.length===5?r:null;}catch(e){return null;}};
X.kDone=function(){var z=X.zz();return+z.kd===tk()&&+z.ki>=5;};
X.x=function(){return Promise.all([window.Z4T&&Z4T['z4q.port.start']?0:ZB.load('js/zb4-zabeg-data.js').catch(function(){}),
window.Z4QX?0:ZB.load('js/zb4-zabeg-x.js')]);};
X.open=function(k,o){X.ev('open',{k:k,f:o&&o.from||''});
X.x().then(function(){if(window.Z4QX)Z4QX.open(k,o||{});},function(){try{toast('Не загрузилось — проверь интернет',3000);}catch(e){}});};
function T(k,c,d){return Z.txt(k,c)||d;}
function pick(){if(X.can('port')&&X.run())return'port';if(X.can('kontr')&&!X.kDone())return'kontr';
if(X.can('tetr'))return'tetr';if(X.can('port'))return'port';return'';}
var CH={port:['🎒','Портфель четверти','5 пройденных уровней и школьные вещи'],
kontr:['📝','Контрольная дня','5 коротких уровней — одни на всех'],
tetr:['📓','Бесконечная тетрадь','Страница за страницей, клетка за клеткой']};
function sub(k){var z=X.zz(),r;
if(k==='port'&&(r=X.run()))return'Уровень '+(Math.min(5,r.st+1))+' из 5 · '+r.sc+' очк.';
if(k==='kontr'&&+z.kd===tk()&&+z.ki>0)return'Решено '+z.ki+' из 5 — допиши';
if(k==='tetr'&&+z.tp>0)return'Исписано клеток: '+(+z.tc||0)+' · дальше стр. '+((+z.tp||0)+1);
return T('z4q.card.'+k,0,CH[k][2]);}
var shown='';
Z.card.add({id:'z4q',order:70,show:function(){return!!pick();},
html:function(){var k=pick(),c=CH[k];if(!c)return'';if(shown!==k+tk()){shown=k+tk();X.ev('card',{k:k});}
return'<div class="z4q-c" style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;border-radius:var(--z3-rb,16px);background:var(--z3-card,#fff);box-shadow:var(--z3-shadow);color:var(--z3-ink,#27324a);font-family:var(--z3-font)">'+
'<span style="font-size:30px;line-height:1">'+c[0]+'</span><span style="flex:1;min-width:0;text-align:left"><b style="display:block;font-size:16px">'+c[1]+'</b>'+
'<small style="display:block;font-size:14px;color:var(--z3-ink2,#5d6781)">'+X.esc(sub(k))+'</small></span>'+
'<button type="button" class="btn green small z4q-cb" data-k="'+k+'" style="min-height:44px">Открыть</button></div>';},
mount:function(el){var b=el&&el.querySelector('.z4q-cb');if(!b)return;b.onclick=function(){try{SND.tap();}catch(e){}X.open(b.getAttribute('data-k'),{from:'card'});};}});
var wlG=null;
function wlDay(v){try{if(v)localStorage.setItem('z4q-wl',String(v));return+localStorage.getItem('z4q-wl')||0;}catch(e){return 0;}}
Z.winLine.add({id:'z4q',order:70,txt:function(i){wlG=null;if(i.daily||i.mode||!i.G||!X.can('kontr')||X.kDone()||wlDay()===tk())return'';
wlG=i.G;wlDay(tk());return'📝 '+T('z4q.wl',0,'Контрольная дня: пять коротких уровней, одни на всех')+' ›';}});
D.addEventListener('click',function(e){var t=e.target;while(t&&t!==D&&!(t.classList&&t.classList.contains('z4wl')))t=t.parentNode;
if(!t||t===D||!wlG||typeof G==='undefined'||G!==wlG||String(t.textContent).indexOf('📝')!==0)return;
wlG=null;try{SND.tap();}catch(x){}try{hideModal();}catch(x){}X.open('kontr',{from:'win'});},true);
var M=ZB._scr&&ZB._scr.modes;
if(M&&M.render&&!M.z4q){var r0=M.render;M.z4q=1;M.render=function(el){r0.apply(this,arguments);ZB.safe('z4q-modes',function(){
if(!X.any())return;var L=el.querySelector('.mdlist')||el,h='';
['port','kontr','tetr'].forEach(function(k){if(!X.can(k))return;var c=CH[k];
h+='<div class="mdcard z4q-md"><div class="mdic">'+c[0]+'</div><div class="mdct"><b>'+c[1]+'</b><small>'+X.esc(sub(k))+'</small>'+
'<div class="mdbt"><button class="btn green small" data-z4q="'+k+'">Открыть ▶</button></div></div></div>';});
var w=D.createElement('div');w.className='z4q-mds';w.innerHTML='<p style="margin:14px 4px 4px;font-size:16px;font-weight:700">🏃 Забеги</p>'+h;L.appendChild(w);
[].forEach.call(w.querySelectorAll('[data-z4q]'),function(b){b.onclick=function(){try{SND.tap();}catch(e){}X.open(b.getAttribute('data-z4q'),{from:'modes'});};});});};}
})();
