'use strict';
/* ================= gb-path — «Путь»: командировка по Союзу (поток VIEW, 11.10.2026) =================
   GB.go('path') — экран с железной дорогой: республика = глава (цвет, название, новая помеха), станции = города (10 магазинов,
   10-й — Ревизия, 100-й уровень республики — «Главк»). Паровозик с тётей Валей — на текущей станции. Пройденные республики —
   свёрнуты (нажать — развернуть), следующая — видна «под замком» (что она даст). Нажатие на станцию — 10 магазинов города
   (переиграть любой пройденный, как на старой карте). Данные — GB.lvInfo / GBU (LVL); без GBU — прежние 10 городов.
   Гнёзда: GB.pathSlots zone 'top' (над дорогой: праздник, режимы), 'node' (на станции — ctx {l, idx, c (город с 0), rep, city, n, cur}),
   'bottom'. Без анимаций в «спокойном режиме». */
(function(){
  if(!window.GB||!GB.viewOn)return;
  var P=window.GBPATH={},open={};
  function $(id){return document.getElementById(id);}
  function Lx(ru,en){return typeof L==='function'?L(ru,en):ru;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function S_(){return typeof S!=='undefined'?S:{};}
  function U(){return window.GBU&&GBU.of?GBU:null;}
  function repOf(c){var u=U();if(u){var o=GB.safe('GBU.of',function(){return u.of(c*10);});if(o)return o.sp?15+Math.floor((c-150)/10):o.rep;}return Math.floor(c/10);}
  function repInfo(r){var u=U();if(u&&u.REPS&&u.REPS[r]){var R=u.REPS[r];return {n:R.n,s:R.s,c:R.c,ob:R.ob};}
    if(r>=15)return {n:Lx('Сверхплан','Over the plan'),s:Lx('Сверхплан','Over the plan'),c:'#8e1f17',ob:0};
    return {n:'',s:'',c:'#b3261e',ob:0};}
  function obName(id){if(!id)return '';var o=window.GBOB;if(o){var x=o.get?GB.safe('GBOB.get',function(){return o.get(id);}):(o[id]||null);if(x&&(x.n||x.name))return x.n||x.name;}return '';}
  function cityStars(c){var s=S_(),n=0;for(var i=c*10;i<c*10+10;i++)n+=s.stars&&s.stars[i]||0;return n;}
  function cityDoneN(c){var s=S_(),n=0;for(var i=c*10;i<c*10+10;i++)if(s.stars&&s.stars[i])n++;return n;}

  function station(c,cur,curC){var f=GB.lvInfo(c*10),un=c*10<(S_().unlocked||1),done=un&&c<curC,isCur=c===curC,k=c%10;
    var side=k%2?'r':'l',ic=done?'<i class="vw-ck">✓</i>':isCur?'🚂':'🔒',ch=S_().chest&&S_().chest[c];
    var sub=done?(ch?'📜 '+Lx('грамота','certificate')+' · ':'')+'⭐ '+cityStars(c):isCur?(cur%10===9?(f.glavk||GB.lvInfo(cur).glavk?Lx('«Главк»!','Head office!'):Lx('Ревизия!','Inspection!')):Lx('магазин '+(cur%10+1)+' из 10','store '+(cur%10+1)+' of 10')):(k===9?Lx('«Главк»','Head office'):'');
    var ctx={l:c*10+1,idx:c*10,c:c,rep:f.rep,city:f.city,n:isCur?cur%10+1:0,cur:isCur};
    var node=GB.html(GB.pathSlots,'node',ctx);
    return '<div class="vw-st '+side+(done?' done':'')+(isCur?' cur':'')+(un?'':' lock')+'" data-c="'+c+'">'+
      '<button type="button" class="vw-stb" '+(un?'':'disabled')+' aria-label="'+esc(f.city)+'">'+ic+(isCur?'<canvas class="vw-vh"></canvas>':'')+'</button>'+
      '<div class="vw-stl"><b>'+esc(f.city)+'</b><small>'+sub+'</small>'+node+'</div></div>'+
      (open[c]&&un?levels(c):'');}
  function levels(c){var s=S_(),h='';for(var i=c*10;i<c*10+10;i++){var un=i<(s.unlocked||1),st=s.stars&&s.stars[i]||0,boss=i%10===9;
      h+='<button type="button" class="vw-lv'+(st?' done':'')+(un&&!st?' cur':'')+(boss?' boss':'')+'" data-i="'+i+'" '+(un?'':'disabled')+'><b>'+(un?(boss?'🔥':(i%10+1)):'🔒')+'</b><small>'+(st?'★'.repeat(st):'')+'</small></button>';}
    return '<div class="vw-lvs">'+h+'</div>';}
  function railSvg(n){// зигзаг: станции попеременно слева (28%) и справа (72%), шаг 84 px
    var d='',H=84;for(var k=0;k<n;k++){var x=k%2?72:28,y=42+k*H;if(!k)d='M'+x+' '+y;else{var x0=(k-1)%2?72:28,y0=y-H;d+=' C'+x0+' '+(y0+H*.6)+' '+x+' '+(y-H*.6)+' '+x+' '+y;}}
    return '<svg class="vw-rail" viewBox="0 0 100 '+(n*H)+'" preserveAspectRatio="none" aria-hidden="true"><path d="'+d+'" fill="none" stroke="#5b4636" stroke-width="9" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'+
      '<path d="'+d+'" fill="none" stroke="#f6ecd8" stroke-width="3" stroke-dasharray="6 7" vector-effect="non-scaling-stroke"/></svg>';}
  function repBlock(r,cur,curC,mode){var ri=repInfo(r),c0=r*10,ob=obName(ri.ob);
    var head='<div class="vw-rep" style="--rc:'+esc(ri.c)+'" data-r="'+r+'"><b class="vw-poster">'+esc(ri.n||Lx('Командировка','Trip'))+'</b>';
    if(mode==='done'){var g=0;for(var c=c0;c<c0+10;c++)if(S_().chest&&S_().chest[c])g++;
      return head+'<small>✓ '+Lx('пройдена','done')+(g?' · 📜 '+g:'')+' · '+Lx('нажмите, чтобы открыть','tap to open')+'</small></div>';}
    if(mode==='next')return head+'<small>🔒 '+Lx('с '+(c0*10+1)+'-го уровня','from level '+(c0*10+1))+(ob?' · '+Lx('новая помеха: ','new obstacle: ')+esc(ob):'')+'</small></div>';
    head+='<small>'+(ob?Lx('Новая помеха: ','New obstacle: ')+esc(ob)+' · ':'')+Lx('городов ','towns ')+Math.max(0,Math.min(10,curC-c0))+Lx(' из 10',' of 10')+'</small></div>';
    var st='',n=0;for(var c2=c0;c2<c0+10;c2++){st+=station(c2,cur,curC);n++;}
    return head+'<div class="vw-line">'+railSvg(n)+st+'</div>';}
  function render(el){var s=S_(),cur=Math.max(0,(s.unlocked||1)-1),curC=Math.floor(cur/10),curR=repOf(curC),ri=repInfo(curR),u=U();
    var nR=u&&u.REPS?u.REPS.length:Math.max(1,curR+1);
    var body=GB.html(GB.pathSlots,'top',{cur:cur});
    for(var r=0;r<=Math.min(curR+1,nR);r++){if(r===curR||open['r'+r])body+=repBlock(r,cur,curC,'cur');else if(r<curR)body+=repBlock(r,cur,curC,'done');else if(r<nR)body+=repBlock(r,cur,curC,'next');}
    body+=GB.html(GB.pathSlots,'bottom',{cur:cur});
    var sc=GBVW.frame(el,'🚂 '+Lx('Путь по Союзу','Route across the USSR'),ri.n?esc(ri.n)+(nR>1?' · '+(Math.min(curR,nR-1)+1)+Lx(' из ',' of ')+nR:''):'',body);
    // нажатия
    sc.onclick=function(e){var t=e.target;while(t&&t!==sc&&!(t.getAttribute&&(t.getAttribute('data-i')||t.getAttribute('data-c')||t.getAttribute('data-r'))))t=t.parentNode;if(!t||t===sc)return;
      if(typeof SND!=='undefined'&&SND.tap)SND.tap();
      var i=t.getAttribute('data-i');if(i!=null){if(!t.disabled&&typeof startLevel==='function')startLevel(+i);return;}
      var c=t.getAttribute('data-c');if(c!=null){if(+c*10>=(S_().unlocked||1))return;open[c]=!open[c];P.re(+c);return;}
      var r0=t.getAttribute('data-r');if(r0!=null&&+r0<curR){open['r'+r0]=!open['r'+r0];P.re();}};
    // Валя в паровозике
    var vh=sc.querySelector('.vw-st.cur .vw-vh');if(vh&&typeof drawPerson==='function')GB.safe('path:valya',function(){var d=Math.min(2,window.devicePixelRatio||1),w=40;vh.width=w*d;vh.height=w*d;var g=vh.getContext('2d');g.setTransform(d,0,0,d,0,0);
      g.save();g.beginPath();g.arc(w/2,w/2,w/2,0,Math.PI*2);g.clip();g.fillStyle='#f6dcb0';g.fillRect(0,0,w,w);drawPerson(g,'valya',w/2,w*1.3,w*1.12,1,0,0);g.restore();});
    return sc;}
  var lastEl=null;
  P.re=function(c){if(!lastEl)return;var sc=lastEl.querySelector('.vw-scroll'),top=sc?sc.scrollTop:0;var s2=render(lastEl);if(s2)s2.scrollTop=top;};
  GB.screen('path',{render:function(el,o){lastEl=el;var sc=render(el);
    if(typeof STAT!=='undefined'&&STAT.screen)STAT.screen('path');
    setTimeout(function(){var c=sc&&sc.querySelector('.vw-st.cur');if(c&&c.scrollIntoView)c.scrollIntoView({block:'center'});},30);}});
  // в «Путь» — снова отрисовать при возврате (звёзды/город могли измениться)
})();
