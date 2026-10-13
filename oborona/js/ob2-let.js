'use strict';
/* ob2-LET: заглушка старта (флаги let, newb7; поле S.o2l), остальное — js/ob2-letx.js. Журнал hobby-analytics/release-i/oborona-boost2/logs/LET.md */
var LET={ready:0};
(function(){
  var a=OB2.reg('let',{s:'LET',t:'Летопись заставы'}),
      b=OB2.reg('newb7',{s:'LET',t:'Неделя новичка'});
  LET.on=a;LET.nb=b;if(!a&&!b)return;
  OB2.field('l',{id:a?'let':'newb7',def:function(){return {};}});
  var ld=LET.load=function(){return OB2.need('js/ob2-letx.js');};
  if(b){try{SKINS.push({id:'druzh',get n(){return Lg('Дружинный','Druzhina');},get about(){return Lg('щиты и стяг дружины','shields and a host banner');},cost:0,get:'newb',fest:'newb7'});
    if(typeof xbnAdd==='function')xbnAdd({id:'novb',n:'Знамя «Новобранец»',en:'“Recruit” banner',c1:'#2f5a9a',c2:'#ffd84a',em:[5,.45]});}catch(e){}}
  if(a){
    window.loginOffer=function(){return false;};
    window.awayOffer=function(){return false;}; 
    for(var i=0;i<META_MODS.length;i++)if(META_MODS[i].id==='tour')META_MODS[i].MENU=function(){};
 
    if(typeof tourRoll==='function'){var r0=tourRoll;window.tourRoll=function(o,w,now){var P=+o.P||TOUR.P0,miss=+o.w!==w-1;r0(o,w,now);
      if(miss)o.P=Math.round(Math.min(TOUR.Pmax,Math.max(TOUR.Pmin,.85*P)));};}
 
    if(typeof tourCum==='function'){var c0=tourCum;window.tourCum=function(w,i,t){if(i!==0&&i!==2)return c0(w,i,t);
      var st=tourStart(w),en=tourStart(w+1);return t<=st?0:t>=en?1:(t-st)/(en-st);};}
 
    OB2.enter('let',200,function(){if(!S.wins)return false;if(LET.ready)return LET.offer();
      ld().then(function(){if(!G&&!$('modal').classList.contains('on'))LET.offer();}).catch(function(){});return true;});}
  setTimeout(function(){ld().catch(function(){});},0);
})();
