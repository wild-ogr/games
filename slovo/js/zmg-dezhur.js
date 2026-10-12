'use strict';
/* zb2-LOV · ловкостная «Дежурный» (js/zmg-dezhur.js, id 'dezhur', ведущий — Валерка; волна 2). Набор — ZLK, рекорды — ZMGREC. Основа — «Мойка» Выезда (тереть пальцем).
   Сотри доску тряпкой до звонка: води пальцем (мышью; ПК — стрелки двигают тряпку), а Валерка снова рисует рожицы, Ять оставляет следы лап мелом.
   Рисунок стёрт, когда от него осталось меньше 15 %. 40 секунд, рисуют всё чаще; 8 рисунков сразу на доске — входит Нина Аркадьевна, конец. Рекорд — стёртые рисунки. Выключение — DEZ_ON=false, ?off=dezhur. */
(function(){
if(typeof ZMG_REG!=='function')return;
var DEZ_ON=true;if(!DEZ_ON||(window.ZB2&&ZB2.off('dezhur')))return;
if(window.ZB2)ZB2.reg('dezhur',{t:'Мини-игра «Дежурный»',who:'LOV'});
var ID='dezhur',CUT=[25,42,55],TIME=40,RAD=.075,MAXD=8;   // в долях ширины доски; доска — 1 × .62
var BH=.62;
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
/* рисунки — наборы точек-штрихов: рожица, домик, лапы, «Валерка — дурак»-закорючка (без слов), солнце */
function shape(R,kind,cx,cy,s){var P=[],L=[];function seg(a){var st=P.length;a.forEach(function(q){P.push({x:cx+q[0]*s,y:cy+q[1]*s,on:1});});for(var i=st;i<P.length-1;i++)L.push([i,i+1]);}
  function circ(r,n,ox,oy){var a=[];for(var i=0;i<=n;i++){var t=i/n*Math.PI*2;a.push([(ox||0)+Math.cos(t)*r,(oy||0)+Math.sin(t)*r]);}seg(a);}
  if(kind===0){circ(1,14);circ(.12,4,-.35,-.25);circ(.12,4,.35,-.25);var m=[];for(var i=0;i<=6;i++){var t=Math.PI*(.2+.6*i/6);m.push([Math.cos(t)*.55,Math.sin(t)*.55]);}seg(m);seg([[-.8,-.8],[-.5,-1.3],[-.2,-.9]]);seg([[.2,-.9],[.5,-1.3],[.8,-.8]]);}
  else if(kind===1){seg([[-1,1],[-1,-.2],[1,-.2],[1,1],[-1,1]]);seg([[-1.2,-.1],[0,-1.2],[1.2,-.1]]);seg([[-.2,1],[-.2,.4],[.3,.4],[.3,1]]);}
  else if(kind===2){[[-.5,.4],[.5,-.4]].forEach(function(o){circ(.32,6,o[0],o[1]);circ(.1,3,o[0]-.3,o[1]-.35);circ(.1,3,o[0],o[1]-.45);circ(.1,3,o[0]+.3,o[1]-.35);});}
  else{circ(.55,10);for(var k=0;k<8;k++){var t2=k/8*Math.PI*2;seg([[Math.cos(t2)*.75,Math.sin(t2)*.75],[Math.cos(t2)*1.15,Math.sin(t2)*1.15]]);}}
  /* уплотнить: между соседями точки через ≤ .02 */
  var Q=[],LL=[],map={};L.forEach(function(e){var a=P[e[0]],b=P[e[1]],d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(d/.018)),prev=-1;
    for(var i=0;i<=n;i++){var x=a.x+(b.x-a.x)*i/n,y=a.y+(b.y-a.y)*i/n,k2=Math.round(x*500)+':'+Math.round(y*500),id=map[k2];if(id==null){id=Q.length;Q.push({x:x,y:y,on:1});map[k2]=id;}if(prev>=0&&prev!==id)LL.push([prev,id]);prev=id;}});
  return {p:Q,l:LL,n:Q.length,left:Q.length,kind:kind,col:['#ffffff','#ffe066','#d0ebff','#ffd8a8'][Math.floor(R()*4)],done:false,t:0};}
function init(rnd){var st={t:0,n:0,dr:[],next:.2,dead:false,rnd:rnd,sx:.5,sy:BH/2,ev:''};for(var i=0;i<3;i++)add(st);return st;}
function add(st){var R=st.rnd,s=.07+.03*R(),cx,cy,tries=0;do{cx=.12+.76*R();cy=.12+(BH-.24)*R();tries++;}while(tries<12&&st.dr.some(function(d){return Math.hypot(d.cx-cx,d.cy-cy)<.22;}));
  var d=shape(R,Math.floor(R()*4),cx,cy,s);d.cx=cx;d.cy=cy;d.s=s;st.dr.push(d);}
function step(st,dt){st.ev='';if(st.dead)return;st.t+=dt;if(st.t>=TIME){st.dead=true;st.ev='time';return;}
  st.next-=dt;if(st.next<=0){add(st);st.ev='draw';st.next=Math.max(.45,1.6-.045*st.t)*(.7+.6*st.rnd());}
  if(st.dr.filter(function(d){return !d.done;}).length>=MAXD){st.dead=true;st.ev='dirty';return;}
  for(var j=st.dr.length-1;j>=0;j--){var d=st.dr[j];if(d.done){d.t+=dt;if(d.t>.5)st.dr.splice(j,1);}}}
/* тряпка в точке (x,y) — стирает */
function rub(st,x,y){if(st.dead)return 0;var got=0;st.sx=x;st.sy=y;st.dr.forEach(function(d){if(d.done)return;if(Math.abs(d.cx-x)>d.s*1.4+RAD||Math.abs(d.cy-y)>d.s*1.4+RAD)return;
    d.p.forEach(function(q){if(q.on&&Math.abs(q.x-x)<RAD&&Math.abs(q.y-y)<RAD&&(q.x-x)*(q.x-x)+(q.y-y)*(q.y-y)<RAD*RAD){q.on=0;d.left--;}});
    if(d.left<d.n*.15){d.done=true;d.p.forEach(function(q){q.on=0;});st.n++;got++;}});if(got)st.ev='clean';return got;}
function botMove(st,k,dt,m){var tg=null,bd=9;st.dr.forEach(function(d){if(d.done)return;var e=Math.hypot(d.cx-st.sx,d.cy-st.sy);if(e<bd){bd=e;tg=d;}});if(!tg)return null;
  var q=null;tg.p.forEach(function(p){if(p.on&&(!q||Math.hypot(p.x-st.sx,p.y-st.sy)<Math.hypot(q.x-st.sx,q.y-st.sy)))q=p;});if(!q)return null;
  var v=(.2+.8*k)*dt,dx=q.x-st.sx,dy=q.y-st.sy,dd=Math.hypot(dx,dy);if(dd<v)return [q.x,q.y];return [st.sx+dx/dd*v,st.sy+dy/dd*v];}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(rnd),n=0,m={};while(!st.dead&&n<60*45){n++;step(st,1/60);var p=botMove(st,k,1/60,m);if(p)rub(st,p[0],p[1]);}return {sc:st.n,st:tierOf(st.n)};}
var SAY={start:['Я дежурный! Ну, почти… Сотри, пока Нина Аркадьевна не пришла.','Доска должна быть чистой к звонку!'],draw:['Ой, это не я нарисовал!','Это Ять наследил, честно!','Ну, почти не рисовал…'],
  clean:['Чисто!','Как новенькая!','Блестит!'],end:'Звонок! Ну, доска почти чистая.'};
ZMG_REG({a:'Води тряпкой — сотри доску до звонка, пока кто-то рисует',ns:'Ты сегодня дежурный. Доску стереть до звонка — а кто там опять рисует?',/* zb2-MERGE: правило и «Новая затея!» (просьба MGR) */id:ID,finWho:'valerka',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
  lines:{good:'Доска блестит! Нина Аркадьевна даже очки протёрла.',ok:'Почти чисто! Пару рожиц никто и не заметит.',bad:'Ну, это… художественная доска. Сойдёт!'},
  run:function(host,o){var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
    var f=K.frame(host,{who:'valerka'}),C=K.canvas(f.main),c=C.ctx,st=init(rnd),fin=false,go=false,down=false,keys={L:0,R:0,U:0,D:0};
    window.__zl_dezhur=st;
    function u(n){return n+' '+(typeof plural==='function'?plural(n,'рисунок','рисунка','рисунков'):'рисунков');}
    var lastS=-1;function info(){var b=REC&&REC.best?REC.best(ID):0;f.info('<span>🧽 '+st.n+'</span><span>⏱ '+Math.max(0,Math.ceil(TIME-st.t))+'</span><span>Рекорд: '+b+'</span>');host.top('Стёрто: '+st.n);}
    function geo(){var W=C.w,H=C.h,bw=Math.min(W-16,(H-16)/BH),bh=bw*BH;return {W:W,H:H,bw:bw,bh:bh,x:(W-bw)/2,y:(H-bh)/2};}
    function at(x,y){var g=geo();return [(x-g.x)/g.bw,(y-g.y)/g.bw];}
    function doRub(x,y){if(!go||fin)return;var r=rub(st,x,y);if(r){K.snd(host,'coin');K.pop(host,f.main,K.pick(SAY.clean,rnd));info();if(st.n===(REC.best(ID)|0)+1&&REC.best(ID)>0)K.pop(host,f.main,'Рекорд!','big');}}
    var lx=null,ly=null;function drag(x,y){var p=at(x,y);if(lx!=null){var n=Math.ceil(Math.hypot(p[0]-lx,p[1]-ly)/(RAD*.5));for(var i=1;i<=n;i++)doRub(lx+(p[0]-lx)*i/n,ly+(p[1]-ly)*i/n);}else doRub(p[0],p[1]);lx=p[0];ly=p[1];}
    host.ptr(f.main,{down:function(x,y){down=true;lx=null;drag(x,y);},move:function(x,y){if(down)drag(x,y);else{var p=at(x,y);st.sx=p[0];st.sy=p[1];}},up:function(){down=false;lx=null;}});
    K.keys(host,function(k,e,d){var m=K.dir(k);if(m){keys[m]=d?1:0;return true;}return false;});
    function draw(dt){C.fit();var g=geo();
      if(!fin&&go){step(st,dt);if(st.ev==='draw'&&rnd()<.5)f.say(K.pick(SAY.draw,rnd),'happy');if(Math.floor(st.t)!==lastS){lastS=Math.floor(st.t);info();}if(st.ev==='time'||st.ev==='dirty')end();
        var kx=keys.R-keys.L,ky=keys.D-keys.U;if(kx||ky){var v=.9*dt,nx=Math.max(0,Math.min(1,st.sx+kx*v)),ny=Math.max(0,Math.min(BH,st.sy+ky*v)),n=Math.ceil(Math.hypot(nx-st.sx,ny-st.sy)/(RAD*.5)),x0=st.sx,y0=st.sy;
          for(var i=1;i<=n;i++)doRub(x0+(nx-x0)*i/n,y0+(ny-y0)*i/n);st.sx=nx;st.sy=ny;}}
      c.fillStyle='#e9dcc3';c.fillRect(0,0,g.W,g.H);c.fillStyle='#8a5a2b';c.fillRect(g.x-8,g.y-8,g.bw+16,g.bh+16);c.fillStyle='#2f5d3a';c.fillRect(g.x,g.y,g.bw,g.bh);
      c.fillStyle='rgba(255,255,255,.04)';for(var s=0;s<12;s++)c.fillRect(g.x+((s*97)%g.bw),g.y+((s*53)%g.bh),g.bw*.2,2);
      c.lineCap='round';st.dr.forEach(function(d){c.strokeStyle=d.col;c.globalAlpha=d.done?Math.max(0,1-d.t/.5):.92;c.lineWidth=Math.max(2,g.bw*.008);c.beginPath();
        d.l.forEach(function(e){var a=d.p[e[0]],b=d.p[e[1]];if(a.on&&b.on){c.moveTo(g.x+a.x*g.bw,g.y+a.y*g.bw);c.lineTo(g.x+b.x*g.bw,g.y+b.y*g.bw);}});c.stroke();c.globalAlpha=1;});
      var sx=g.x+st.sx*g.bw,sy=g.y+st.sy*g.bw,rr=RAD*g.bw;c.fillStyle='rgba(255,230,140,.9)';K.rr(c,sx-rr,sy-rr*.7,rr*2,rr*1.4,rr*.3);c.fill();c.fillStyle='rgba(180,140,60,.6)';c.fillRect(sx-rr,sy-rr*.15,rr*2,rr*.3);
      if(!go&&!fin){c.fillStyle='rgba(255,255,255,.9)';var tw=Math.min(g.W-20,320);K.rr(c,(g.W-tw)/2,g.H-58,tw,44,22);c.fill();c.fillStyle='#2d3436';c.font='700 15px sans-serif';c.textAlign='center';c.textBaseline='middle';
        c.fillText(host.pc?'Води мышью с нажатием или стрелками':'Води пальцем по доске — стирай',g.W/2,g.H-36);c.textAlign='left';c.textBaseline='alphabetic';}}
    function end(){if(fin)return;fin=true;f.say(st.ev==='dirty'||st.t<TIME?'Нина Аркадьевна вошла — а доска вся в рожицах! Ой…':SAY.end,st.t<TIME?'sad':'happy');setTimeout(function(){var x={sc:st.n,st:tierOf(st.n),label:'Стёрто '+u(st.n)};if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);},calm?200:600);}
    st.api={bot:function(k){var m={};host.loop(function(dt){if(go&&!fin){var p=botMove(st,k,dt,m);if(p)doRub(p[0],p[1]);}});},end:function(){st.dead=true;end();}};
    f.say(K.pick(SAY.start,rnd),'happy');info();K.loop(host,draw);
    host.intro({who:'valerka',text:'Я сегодня дежурный! Сотри доску до звонка — води тряпкой. Только я… то есть кто-то… опять рисует. 40 секунд!',
      hint:host.pc?'Мышь с нажатой кнопкой или стрелки — тряпка':'Води пальцем по доске',btn:'Стирать!'}).then(function(){go=true;});
  }});
})();
