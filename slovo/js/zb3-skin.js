'use strict';
/* zb3-skin — кожа «Зины 3.0» (MIX), старт (BUILD 25.10, диета): время/сезон двора (Z3.scene, классы html.z3t-…/z3s-…), праздники Z3.fest, Z3.artLoad.
   Договор и остальное (значки, фон «кухня» уровня, пяльцы, события двора) — js/zb3-skin-s.js (Z3.late, 1-й день; на старте уровня — Z3.need). */
(function(){
  var Z=window.Z3;if(!Z||!Z.on||typeof ZB==='undefined')return;
  var TM=Z.reg('z3time',{t:'Двор: день/вечер/ночь и сезон по местному времени',who:'SKIN'});
  var DE=document.documentElement,QQ={};
  try{var u=new URLSearchParams(location.search);QQ={t:u.get('time'),s:u.get('season')};}catch(e){}
  var SE={win:1,spr:1,sum:1,aut:1},TI={day:1,eve:1,night:1};
  function now(){try{return new Date(nowMs());}catch(e){return new Date();}}
  Z.scene=function(qs){var d=now(),h=d.getHours(),m=d.getMonth();
    var t=!TM?'day':(h>=22||h<7?'night':h>=18?'eve':'day'),s=!TM?'sum':(m===11||m<=1?'win':m<=4?'spr':m<=7?'sum':'aut');
    if(DE.classList.contains('th-zima'))s='win'; /* темы ларька */
    else if(DE.classList.contains('th-osen'))s='aut';
    if(TI[QQ.t])t=QQ.t;if(SE[QQ.s])s=QQ.s;
    if(qs){if(TI[qs.t])t=qs.t;var q=qs.s==='autumn'?'aut':qs.s==='summer'?'sum':qs.s;if(SE[q])s=q;}
    return {time:t,season:s};};
  var last='';
  function tick(){var s=Z.scene(),k='z3t-'+s.time+' z3s-'+s.season;if(k===last)return;
    DE.className=(DE.className.replace(/\s*\bz3[ts]-[a-z]+/g,'')+' '+k).trim();
    if(last){try{window.dispatchEvent(new Event('resize'));}catch(e){}}last=k;}
  tick();setInterval(function(){ZB.safe('z3skin:tick',tick);},300000);
  function thk(){return DE.classList.contains('th-zima')?'z':DE.classList.contains('th-osen')?'o':'';}
  try{var zw=thk();new MutationObserver(function(){var z=thk();if(z!==zw){zw=z;ZB.safe('z3skin:th',tick);}}).observe(DE,{attributes:true,attributeFilter:['class']});}catch(e){}
  /* праздники двора: Z3.fest() — см. шапку js/zb3-skin-s.js */
  var FK={ny:'ny',kan:'ny',sng:'ny',hw:'hw',bog:'feb23',mar:'mar',mas:'mas',may:'may',shk:'sep1',uch:'uch'};
  Z.fest=function(){var r=[],seen={};try{if(ZB2.off('z3fest')||!window.FEST||!FEST.table)return r;var d=FEST.today(),dbg=FEST._dbg?FEST._dbg():{};
    FEST.table().forEach(function(f){var k=FK[String(f.id).replace(/\d+$/,'')];if(!k||seen[k]||ZB2.off('z3f-'+k))return;
      if(dbg&&dbg.forced?FEST.on(f.id):(f.from<=d&&d<=f.to)){seen[k]=1;r.push(k);}});}catch(e){}return r;};
  var L={};Z.artLoad=function(id){return L[id]||(L[id]=ZB.load('js/zb3-art-'+id+'.js'));};
  var X='js/zb3-skin-s.js';
  ZB.on('start',function(i){if(!(i&&i.daily)&&!ZB2.off('z3kit'))Z.need(X).catch(function(){});});
  Z.late(X,{day:1});
  if(Z.reg('z3vis',{t:'VIS-мелочи старых экранов (пузырь/тост, окно победы ПК, стенгазета, превью тем, шрифты ≥13 px) — js/zb3-skin-vis.js + css/zb3-vis.css',who:'SKIN'}))setTimeout(function(){ZB.load('js/zb3-skin-vis.js').catch(function(){});},0);
})();
