'use strict';
(function(){
var X=window.ZB2CAL;if(!X||typeof ZB==='undefined')return;
var ST=X.st,WIN=X.win,W1=X.w1on,TMR=X.tmrOn,FROM=X.FROM,Z2=window.ZB2,c=X.c,tk=X.tk,dn=X.dn,wk=X.wk,hr=X.hr,pl=X.pl,streak=X.streak,due=X.due,day=X.day,open=X.open;
var CAL0={days:[{c:10},{c:0,hb:1},{c:30,box:'posylka'},{c:20},{c:30},{c:0,hb:1},{c:50,box:'sunduk',part:1}],wk2mul:1.25,back:50,backDays:2,forgive:1,saveAd:1,parts:4},
WK0=[{k:'penal',c:10,hb:2},{k:'dnevnik',c:20},{k:'posylka',c:20,hb:1},{k:'klyuch',c:30},{k:'zapiska',c:20},{k:'lentochka',c:20,hb:1},{k:'tabel',c:40,part:'bant'}];
function E(){return window.ZBECO||{};}
function cfg(){return E().cal||CAL0;}
function gift(n){var e=E();if(e.calGift)return e.calGift(n);n=Math.max(1,n|0);var d=CAL0.days[(n-1)%7],o={};for(var k in d)o[k]=d[k];
if(n>7&&o.c)o.c=Math.round(o.c*CAL0.wk2mul/5)*5;return o;}
function w1g(n){var e=E();return e.week1Gift?e.week1Gift(n):WK0[Math.max(1,Math.min(7,n|0))-1];}
var OUT=[{id:'modnica',n:'Модница с рынка',gift:'cal',d:'Кофта «как у артистки», платок с базара и янтарь. Торговалась за каждую часть — четыре недели!',c1:'#d2563a',c2:'#a63a22',f:'#7a2614',beads:'amber',scarf:{c:'#f5b72d',dot:'#7a2614'},brooch:1},
{id:'perv',n:'Первоклассница',gift:'cal',d:'Коричневое платье и белый фартук — как первого сентября. Бант тоже есть, просто он скромный.',c1:'#6b4a35',c2:'#4a3020',f:'#2e1c10',beads:'none',apron:{c:'#fffdf8',dot:'#fffdf8'}}];
if(WIN&&typeof OUTFITS!=='undefined')OUT.forEach(function(x){if(!OUTFITS.some(function(y){return y.id===x.id;}))OUTFITS.push(x);});
function own(t,id){S.own=S.own||{};S.own[t+':'+id]=1;}
function shop(it){var o=c();if(it.id==='modnica')return'<div class="ok" style="color:var(--ink2)">🧰 Сундук недели<br>('+Math.min(o.p,cfg().parts||4)+' из '+(cfg().parts||4)+' частей)</div>';
if(it.id==='perv')return'<div class="ok" style="color:var(--ink2)">📜 Табель первой недели</div>';
if(it.gift==='sea')return'<div class="ok" style="color:var(--ink2)">'+(it.ic||'🎓')+' Финал четверти<br>(ступень 30)</div>';
if(it.gift==='lg'&&WIN)return'<div class="ok" style="color:var(--ink2)">🧰 Первый сундук недели<br>в календаре</div>';return'';}
var BOX={posylka:'📦 посылка от внука',sunduk:'🧰 сундук недели'},ENV={penal:'✏️ Пенал',dnevnik:'📒 Дневник',posylka:'📦 Посылка от внука',klyuch:'🔑 Ключ от кабинета',zapiska:'💌 Записка от соседки',lentochka:'🎀 Ленточка',tabel:'📜 Табель'};
function coin(){try{return COIN_I;}catch(e){return'💰';}}
function gTxt(g,mul){var a=[];if(g.box)a.push(BOX[g.box]);if(g.c)a.push('+'+g.c*(mul||1)+' '+coin());if(g.hb)a.push('💡 буква');if(g.part)a.push('часть наряда');return a.join(' · ');}
function tomorrow(){if(!TMR||(+S.lv||0)<FROM)return'';var o=c(),a=[],x=(tk()%10000===1103)?2:1;
if(WIN){var w=o.w,taken=o.g===tk();
if(W1&&w>=0&&w<7){var k=taken?w+1:w+2;if(k<=7)a.push('✉️ конверт «'+ENV[w1g(k).k].replace(/^\S+ /,'')+'»');}
else{var n=day()+1;a.push('🗓 листок '+n+'-го дня: '+gTxt(gift(n),x));}}
try{if(window.ZBNB&&ZBNB.tmrItems)ZBNB.tmrItems.slice().sort(function(p,q){return(p.order||0)-(q.order||0);}).forEach(function(i){var h=ZB.safe('tmr-'+i.id,i.t);if(h&&a.length<3)a.push(h);});}catch(e){}
return a.length?'Завтра у Зины: '+a.join(' · '):'';}
if(TMR){ZB.add(ZB.winSlots,{id:'zc-tmr',order:10,zone:'tmr',fit:9,render:function(){var t=tomorrow();return t?'<p class="tmr zc-tmr">'+t+'</p>':'';}});
if(typeof window.tmrHtml==='function'){var th0=window.tmrHtml;window.tmrHtml=function(){return ZB.safe('cal-tmr',tomorrow)||th0();};}}
function paint(){if(!ST)return;var n=streak(),t=n?'🔥'+n:'';[].forEach.call(document.querySelectorAll('#menu .coins,#game .ghdr .coins'),function(e){
var f=e.previousElementSibling;if(!f||!f.classList.contains('zc-fire')){f=document.createElement('span');f.className='zc-fire';e.parentNode.insertBefore(f,e);
f.onclick=function(){if(WIN)open(1);};}
f.textContent=t;f.style.display=t?'':'none';f.title=n?'Серия: '+n+' дн.':'';});}
if(ST&&typeof window.updCoins==='function'){var uc=window.updCoins;window.updCoins=function(){var r=uc.apply(this,arguments);ZB.safe('cal-fire',paint);return r;};}
function late(){var o=c(),t=dn(tk());return ST&&o.n>0&&dn(o.d)===t-1&&hr()>=18&&o.f===wk(t);}
var CHIP={id:'zc-cal',order:10,zone:'chips',render:function(){if(!ST||(+S.lv||0)<FROM)return'';var n=streak(),d=due();
return'<button type="button" class="zn-chip zc-chip'+(late()?' zc-hot':'')+'"'+(d?' data-zn-tag="🎁"':'')+'><i>'+(n?'🔥':'🗓')+'</i><b>'+(n?n+' '+pl(n,'день','дня','дней'):'Календарь')+'</b><small>'+
(d?'листок ждёт':late()?'до полуночи!':'завтра 🎁')+'</small></button>';},
mount:function(el){var b=el.querySelector('.zc-chip');if(b)b.onclick=function(){try{SND.tap();}catch(e){}open(1);};}};
if(ST)ZB.add(ZB.homeSlots,{id:'zc-late',order:6,zone:'top',render:function(){if(!late())return'';var n=c().n;
return'<button type="button" class="zc-late">🔥 Серия '+n+' '+pl(n,'день','дня','дней')+' сгорит в полночь — пройди один урок!</button>';},
mount:function(el){var b=el.querySelector('.zc-late');if(b)b.onclick=function(){try{SND.tap();startLevel(Math.min(S.lv,LEVELS.length-1));}catch(e){}};}});
if(ST&&!ZB.homeSlots.some(function(s){return s.id==='zc-cal';})){CHIP.zone=Z2._reg.homefit&&!Z2.off('homefit')?'chips':'today';CHIP.order=CHIP.zone==='chips'?10:1;ZB.add(ZB.homeSlots,CHIP);}
if(WIN)try{if(/^(modnica|perv)$/.test(S.outfit)){var ha=document.getElementById('heroArt');if(ha)ha.dataset.o='';var av=document.getElementById('zAv');if(av)av.dataset.o='';}}catch(e){}
(function(){if(document.getElementById('zcCss'))return;var l=document.createElement('link');l.id='zcCss';l.rel='stylesheet';l.href='css/zb2-cal.css';document.head.appendChild(l);})();
var Z=window.ZBSEA;if(Z&&Z.bar){
function finIt(s){var FIN=Z.FIN,finId=Z.finId;var f=FIN[s.id];return{id:finId(s),n:f[0],gift:'sea',d:'Блюдце-финал четверти «'+s.n+'»: достаётся всем, кто прошёл все 30 ступеней.',lc:f[1],lb:'rgba(255,255,255,.6)',on:f[1],onc:'#fff',line:f[1],sh:f[2],ic:s.ic};}
function finAdd(){var BAR=Z.bar,FIN=Z.FIN,finId=Z.finId,SEAS=Z.SEAS,cur=Z.cur;if(!BAR||typeof SKINS==='undefined')return;var cs=cur().s;SEAS.forEach(function(x){var own=!!((S.own||{})['s:'+finId(x)]);if((own||x===cs)&&!SKINS.some(function(k){return k.id===finId(x);}))SKINS.push(finIt(x));});}
if(Z.bar&&typeof plateSVG==='function'){var BAR=1,FIN=Z.FIN,finId=Z.finId,SEAS=Z.SEAS,p0=plateSVG;plateSVG=function(id){var x=/^sea_/.test(id)&&SEAS.filter(function(z){return finId(z)===id;})[0];if(!x)return p0.apply(this,arguments);var f=FIN[x.id],ch='';
for(var i=0;i<8;i++){var a=i*Math.PI/4;ch+='<text x="'+(50+Math.cos(a)*40).toFixed(1)+'" y="'+(53+Math.sin(a)*40).toFixed(1)+'" font-size="9" text-anchor="middle">'+x.ic+'</text>';}
return'<svg viewBox="0 0 100 100" style="position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%"><circle cx="50" cy="50" r="49.5" fill="'+f[2]+'"/><circle cx="50" cy="50" r="47" fill="none" stroke="'+f[1]+'" stroke-width="1.8"/><circle cx="50" cy="50" r="33" fill="#fffdf7" stroke="'+f[1]+'" stroke-width=".6"/>'+ch+'</svg>';};}
finAdd();}
if(typeof SOSF!=='undefined'&&SOSF){
window.sosCalHtml=function(){if(!SOSF)return'';const o=sosTick();if(!sosPend(o))return'';const r=o.r,lead=r.lead!=null&&r.lead>=0?SOSN[r.lead]:null;
return`<div class="zc-sos">${r.pl===1?'🏆':r.pl<=3?['','','🥈','🥉'][r.pl]:'🏠'} <b>Итоги недели в подъезде: ${plTxt(r.pl)}</b>${r.c?` · +${r.c} ${COIN_I}`:''}<br><small>${r.pl===1?'Концерт хора «Рябинушка» — в твою честь!':lead?lead.n+' '+(lead.g==='m'?'обошёл':'обошла')+' совсем чуть-чуть. На этой неделе покажем!':''}${r.dv!=null&&r.dm?' · '+(r.dm>0?'⬆️ новый дивизион':'⬇️ дивизион')+' «'+SOS_DIV[r.dv]+'»':''}</small></div>`;}
window.sosCalTake=function(){if(!SOSF)return;const o=sosTick();if(!sosPend(o))return;const r=o.r,c=+r.c||0;if(sosPlateDue(o))sosPlateGive();
o.c=r.w;if(c)addCoins(c,'quest');try{STAT.ev('sos',{a:'claim',pl:r.pl,c:c,pts:r.pts,f:'cal'});}catch(e){}if($('btnSos'))sosMenu();}
ZB.add(ZB.homeSlots,{id:'sos-sun',order:7,zone:'top',render:function(){if(!sosOn())return'';const d=new Date(nowMs());if(d.getDay()!==0||d.getHours()<17)return'';
const o=sosTick();if(!o)return'';const tb=sosTable(o,nowMs()),pl=sosPlace(tb),h=24-d.getHours();
return`<button type="button" class="zc-late sos-sun">🏠 До конца недели ${h} ${plural(h,'час','часа','часов')} — ты на ${plOn(pl)}${pl>1?', '+SOSN[tb[pl-2].i].n+' впереди на '+(tb[pl-2].pts-sosPts(o)):''}</button>`;},
mount:function(el){const b=el.querySelector('.sos-sun');if(b)b.onclick=()=>{SND.tap();openSosedki('sun');};}});
}
if(WIN&&typeof window.updGift==='function'){var ug=window.updGift;window.updGift=function(){var r=ug.apply(this,arguments);try{var b=document.getElementById('btnGift');if(b&&b.classList.contains('gold'))b.style.display='none';}catch(e){}return r;};try{window.updGift();}catch(e){}}
X.cfg=cfg;X.gift=gift;X.w1g=w1g;X.own=own;X.shop=shop;X.tomorrow=tomorrow;X.paint=paint;X.late=late;X.gTxt=gTxt;X.ENV=ENV;X.BOX=BOX;
})();
