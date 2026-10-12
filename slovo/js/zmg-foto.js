'use strict';
/* zb2-LOV · ловкостная «Фото класса» (js/zmg-foto.js, id 'foto', фотограф — Толик; волна 2). Набор — ZLK, рекорды — ZMGREC. Основа — «Фото» Рыбалки (снимай, когда все спокойны).
   Класс стоит на фото. Дети моргают, Валерка ставит соседу «рожки», Ять лезет в кадр. Жми «Снимаю!» (палец, Пробел), когда все спокойны.
   Три кадра за 15 секунд (не успела — Толик щёлкает сам), в зачёт — лучший: 100 баллов минус моргнувшие (−15), рожки (−25), кот в кадре (−20), смазано (снимок сразу после прошлого, −10).
   С каждым классом детей больше (o.ctx.cls или уровень игрока). Сама запускается при переходе в новый класс (js/zmg-rec.js, флаг fotoauto, mode 'auto').
   Рекорд — лучший кадр (баллы). Выключение — FOTO_ON=false, ?off=foto. */
(function(){
if(typeof ZMG_REG!=='function')return;
var FOTO_ON=true;if(!FOTO_ON||(window.ZB2&&ZB2.off('foto')))return;
if(window.ZB2)ZB2.reg('foto',{t:'Мини-игра «Фото класса»',who:'LOV'});
var ID='foto',CUT=[60,85,100],SHOTS=3,LIM=15;
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
function init(rnd,nk){var st={t:0,kids:[],cat:{x:-1,on:0,next:3+3*rnd()},horn:{on:0,next:2+3*rnd(),i:0},shots:[],best:0,dead:false,rnd:rnd,lastShot:-9};
  for(var i=0;i<nk;i++)st.kids.push({blink:0,next:.5+2.5*rnd(),col:Math.floor(rnd()*6)});return st;}
function step(st,dt){if(st.dead)return;st.t+=dt;if(st.t>=LIM&&!st.over){st.over=1;}if(st.over&&st.t-st.lastShot>.7){st.auto=1;shoot(st);return;}var R=st.rnd,hard=Math.min(1,st.t/25);
  st.kids.forEach(function(k){if(k.blink>0){k.blink-=dt;}else{k.next-=dt;if(k.next<=0){k.blink=.3+.2*R();k.next=(.6-.25*hard)+1.0*R();}}});
  var h=st.horn;if(h.on>0){h.on-=dt;}else{h.next-=dt;if(h.next<=0){h.on=1.2+.9*R();h.i=Math.floor(R()*st.kids.length);h.next=1.4+2.2*R()-hard;}}
  var c=st.cat;if(c.on){c.x+=c.v*dt;if(c.x>1.2||c.x<-.2)c.on=0;}else{c.next-=dt;if(c.next<=0){c.on=1;c.v=(R()<.5?1:-1)*(.25+.15*R());c.x=c.v>0?-.15:1.15;c.next=3+3.5*R()-hard*1.5;}}}
function inFrame(st){return st.cat.on&&st.cat.x>-.05&&st.cat.x<1.05;}
function quality(st){var q=100,bl=0;st.kids.forEach(function(k){if(k.blink>0)bl++;});q-=bl*15;if(st.horn.on>0)q-=25;if(inFrame(st))q-=20;if(st.t-st.lastShot<.6)q-=10;return {q:Math.max(0,q),bl:bl,horn:st.horn.on>0,cat:inFrame(st)};}
function shoot(st){if(st.dead)return null;var r=quality(st);r.t=st.t;st.shots.push(r);st.lastShot=st.t;if(r.q>st.best)st.best=r.q;if(st.shots.length>=SHOTS)st.dead=true;return r;}
/* бот: ждёт «все спокойны» и жмёт с запаздыванием; терпение — от умения */
function botAct(st,k,m,rnd){if(st.dead)return false;if(m.pend!=null){m.pend-=1/60;if(m.pend<=0){m.pend=null;return true;}return false;}
  var left=SHOTS-st.shots.length,tl=LIM-st.t,calm=quality(st).q>=100||(tl<left*2.5&&quality(st).q>=70);if(calm&&rnd()<.04+.12*k){m.pend=.18+.3*(1-k)+.25*(1-k)*rnd();}return false;}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(rnd,7),m={},n=0;while(!st.dead&&n<60*60){n++;step(st,1/60);if(botAct(st,k,m,rnd))shoot(st);}return {sc:st.best,st:tierOf(st.best)};}
var SAY={start:['Внимание, снимаю! Смотрим в объектив и не моргаем!','Сейчас вылетит птичка! Валерка, руки опусти!'],
  q:function(r){return r.q>=100?'Идеальный кадр! В школьный музей!':r.horn?'Валерка опять «рожки» поставил!':r.cat?'Кот в кадре! Ять, брысь!':r.bl?'Кто-то моргнул… Ещё кадр!':'Смазано — не дёргай!';}};
var SKIN=['#f6cfae','#eebf99','#f2c9a8','#e8b48c','#f6d5b8','#dca783'],CLO=['#3d6fc4','#c4466b','#2b8a3e','#e8590c','#7048e8','#0c8599'];
ZMG_REG({a:'Поймай класс в кадр, пока все улыбаются, — 3 кадра',ns:'Фото класса на память! Толик с фотоаппаратом, а улыбаться надо всем сразу.',/* zb2-MERGE: правило и «Новая затея!» (просьба MGR) */id:ID,finWho:'tolik',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
  lines:{good:'Снимок — на доску почёта!',ok:'Хорошее фото! Только Валерка какой-то хитрый.',bad:'Ну, на память и так сойдёт!'},
  run:function(host,o){var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
    var cls=(o.ctx&&o.ctx.cls)||(window.ZBS&&ZBS.cls?Math.min(11,ZBS.cls()):Math.min(11,1+Math.floor((o.lvl||0)/50))),nk=Math.max(4,Math.min(9,3+Math.ceil(cls/2)));
    var f=K.frame(host,{who:'tolik',nm:'Толик, фотограф'}),C=K.canvas(f.main),c=C.ctx,st=init(rnd,nk),fin=false,go=false,flash=0,want=false,catI=null;
    window.__zl_foto=st;
    try{if(typeof catSVG==='function'){var im=new Image();im.onload=function(){catI=im;};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(catSVG());}}catch(e){}
    function info(){var b=REC&&REC.best?REC.best(ID):0;f.info('<span>'+cls+' класс</span><span>Кадр '+Math.min(SHOTS,st.shots.length+1)+' из '+SHOTS+'</span><span>Лучший: '+st.best+'</span><span>Рекорд: '+b+'</span>');host.top('📷 '+st.shots.length+' из '+SHOTS);}
    var bShot=K.btn('📷 Снимаю!'+K.kc('Пробел',host),'green',function(){want=true;});bShot.style.flex='1';bShot.style.maxWidth='420px';bShot.style.fontSize='20px';f.foot.appendChild(bShot);
    host.ptr(f.main,{down:function(){want=true;}});host.keys(function(k){if(k===' '||k==='Enter'){want=true;return true;}return false;});
    function kid(x,y,s,k,i){var col=CLO[k.col],sk=SKIN[k.col];c.fillStyle=col;K.rr(c,x-s*.42,y,s*.84,s*1.1,s*.2);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(x-s*.15,y);c.lineTo(x,y+s*.25);c.lineTo(x+s*.15,y);c.fill();
      c.fillStyle=sk;c.beginPath();c.arc(x,y-s*.3,s*.36,0,7);c.fill();c.fillStyle=i%2?'#8a5a2b':'#5b3a29';c.beginPath();c.arc(x,y-s*.42,s*.37,Math.PI,0);c.fill();
      c.fillStyle='#3a2a22';if(k.blink>0){c.fillRect(x-s*.18,y-s*.32,s*.12,s*.03);c.fillRect(x+s*.06,y-s*.32,s*.12,s*.03);}else{c.beginPath();c.arc(x-s*.12,y-s*.31,s*.045,0,7);c.arc(x+s*.12,y-s*.31,s*.045,0,7);c.fill();}
      c.strokeStyle='#8f2f35';c.lineWidth=2;c.beginPath();c.arc(x,y-s*.2,s*.1,.2,Math.PI-.2);c.stroke();}
    function scene(W,H){c.fillStyle='#f3ead2';c.fillRect(0,0,W,H);c.fillStyle='#2f6b3a';c.fillRect(W*.15,H*.08,W*.7,H*.28);c.strokeStyle='#8a5a2b';c.lineWidth=6;c.strokeRect(W*.15,H*.08,W*.7,H*.28);
      c.fillStyle='rgba(255,255,255,.85)';c.font='700 '+Math.round(Math.min(W,H)*.045)+'px sans-serif';c.textAlign='center';c.fillText(cls+' «Б» — '+new Date().getFullYear(),W/2,H*.24);
      c.fillStyle='#b98a5a';c.fillRect(0,H*.85,W,H*.15);
      var n=st.kids.length,row2=n>5,s=Math.min(W/(Math.ceil(n/(row2?2:1))+1)*.9,H*.2);
      var back=row2?Math.floor(n/2):0;for(var i=0;i<n;i++){var r=i<back?0:1,inRow=r?n-back:back,j=r?i-back:i,x=W*(j+1)/(inRow+1),y=r?H*.62:H*.48;kid(x,y,s,st.kids[i],i);
        if(st.horn.on>0&&st.horn.i===i){c.strokeStyle='#e8b48c';c.lineWidth=s*.08;c.beginPath();c.moveTo(x-s*.12,y-s*.65);c.lineTo(x-s*.2,y-s*.95);c.moveTo(x+s*.12,y-s*.65);c.lineTo(x+s*.2,y-s*.95);c.stroke();}}
      if(st.cat.on&&catI){var cs=s*1.1;c.drawImage(catI,st.cat.x*W-cs/2,H*.85-cs*.9,cs,cs);}
      c.textAlign='left';}
    function draw(dt){C.fit();var W=C.w,H=C.h;if(!fin&&go){step(st,dt);if(want){want=false;var r=shoot(st);if(r){flash=1;K.snd(host,r.q>=95?'win':'tap');f.say(SAY.q(r)+' ('+r.q+')',r.q>=80?'happy':'norm');info();
          if(st.dead){bShot.disabled=true;setTimeout(end,calm?300:900);}}}}else want=false;
      scene(W,H);var cw=W*.08;c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=3;[[cw,cw,1,1],[W-cw,cw,-1,1],[cw,H-cw,1,-1],[W-cw,H-cw,-1,-1]].forEach(function(q){c.beginPath();c.moveTo(q[0],q[1]+q[3]*30);c.lineTo(q[0],q[1]);c.lineTo(q[0]+q[2]*30,q[1]);c.stroke();});
      if(flash>0){c.fillStyle='rgba(255,255,255,'+(calm?flash*.4:flash)+')';c.fillRect(0,0,W,H);flash=Math.max(0,flash-dt*3);}}
    function end(){if(fin)return;fin=true;var x={sc:st.best,st:tierOf(st.best),label:'Лучший кадр: '+st.best+' баллов из 100'};if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);}
    st.api={bot:function(k){var m={};host.loop(function(){if(go&&!fin&&botAct(st,k,m,Math.random))want=true;});},end:function(){st.dead=true;end();}};
    f.say(K.pick(SAY.start,rnd),'happy');info();K.loop(host,draw);
    host.intro({who:'zina',text:(o.mode==='auto'?'Новый класс — новое фото! ':'')+'Толик снимает класс на память. Жми «Снимаю!», когда никто не моргает, Валерка не ставит рожки, а Ять не лезет в кадр. Три кадра — лучший в альбом.',
      hint:host.pc?'Пробел или кнопка — снимок':'Нажми «Снимаю!» в удачный миг',btn:'Позируем!'}).then(function(){go=true;});
  }});
})();
