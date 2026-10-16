/* bb2-cup.js — заглушка CUP-BG «Живая лига» (hobby-cup); всё остальное — набор 'cup' (js/cup.js, js/bb2-cup-ui.js), справка — в его шапке */
var CUP_URL='https://functions.yandexcloud.net/d4e5nfg9u466prmmiooj';
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  function n(v){return typeof v==='number'&&isFinite(v)&&v>0?Math.floor(v):0;}
  BB2.save('cup',{fix:function(o){var r={},k,a=['jw','lgw','sw'];if(o.ask===1)r.ask=1;for(k=0;k<3;k++)if(n(o[a[k]]))r[a[k]]=n(o[a[k]]);
      if(o.tr>=0&&o.tr<64)r.tr=Math.floor(o.tr);if(/^(up|stay|down|top)$/.test(o.mv||''))r.mv=o.mv;return r;},
    merge:function(a,c){var r=BB2.mx(a,c);if(a&&a.tr!=null){r.tr=a.tr;if(a.mv)r.mv=a.mv;else delete r.mv;}return r;}});
  BB2.lazy('cup',['js/cup.js','js/bb2-cup-ui.js'],function(){return !!(BB2.cup&&BB2.cup.ok);});
  var X=BB2.cupS={};
  X.on=function(){if(!BB2.on('cup')||!CUP_URL||typeof CUP!=='undefined'&&CUP.state()==='gone')return false;var q=/[?&]cup=/.test(location.search);
    if(/^(localhost|127\.|192\.168\.|10\.|$)/.test(location.hostname)||location.protocol==='file:')return q;
    try{if(navigator.webdriver)return false;return PLAT==='vk'?!!VK&&!OK:!!(ysdk&&YP&&YP.getMode&&YP.getMode()!=='lite');}catch(e){return false;}};
  X.in=function(){return BB2.s('cup').ask===1;};
  X.mode=function(g){if(!g||g.first||g.short||g.nvm||g.bb2lih||g.bb2most||g.bb2race)return '';return g.daily?'day':g.weekly?'week':g.endless?'endless':'';};
  function go(f,a,b){BB2.need('cup').then(function(){BB2.cup[f](a,b);},function(){});}
  function ok(){return X.on()&&X.in();}
  BB2.hook('ready',function(){if(ok())BB2.late('cup');});
  BB2.hook('run',function(g){if(ok()&&X.mode(g)){g.cupM=X.mode(g);go('run',g);}});
  BB2.hook('end',function(g,w){if(g.cupM)go('end',g,w);});
  BB2.hook('modal',function(k,m){if(!ok())return;if(k==='result'&&typeof G!=='undefined'&&G&&G.cupM)go('res',m);else if(!k&&m.querySelector('#setOk'))go('set',m);});
  BB2.hook('chInfo',function(s,sel,el){if(!el||!X.on()||!S.done[0])return;var c=document.createElement('div');c.className='card';c.id='cupCard';c.style.marginTop='14px';
    c.innerHTML='<div class="row"><div class="t"><b>🌐 '+L('Живая лига','Live league')+'</b><span id="cupCardT">'+L('Лиги по 30 богатырей, ступень и награда каждую неделю','Leagues of 30 heroes, a new step and a reward every week')+'</span></div><button class="btn" id="cupCardB">'+L('Открыть','Open')+'</button></div>';
    el.appendChild(c);var b=c.querySelector('#cupCardB');b.onclick=function(){BB2.open('cup',function(){BB2.cup.open();},b);};if(BB2.ready('cup'))BB2.cup.card(c);});
})();
