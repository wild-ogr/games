'use strict';
/* gb-MGC мини-игра №13 «Пирамида из банок» (ведущая — тётя Валя). 10.10.2026. Договор — шапка js/gmg-core.js (MG0).
   Витрина 80-х: банка сгущёнки или шпрот качается над прилавком — отпустите, когда она над пунктиром. Пирамида 4-3-2-1 = 10 банок.
   Банок 14 (4 запасных); мимо — банка укатывается, без наказания. Кончились — ролик «по нужде»: «📺 Ещё банка» (+2, один раз за заход).
   Без таймера. Качание быстрее с каждым рядом, в спокойном режиме — медленнее и место шире.
   Звёзды: 10 банок и ≤1 промаха — 3★, 10 банок — 2★, 5+ — 1★. Очки: 10 за банку + 3 за «ровно».
   Шкурка к Новому году (host.fest.id==='ny'): пирамида-ёлка — ночь, снег, огоньки на банках, звезда на макушке.
   Управление: нажатие/щелчок по полю, кнопка «Отпустить», ПК — Пробел, Enter, ↓.
   Тексты — js/gmg-piramida-data.js. Выключение: GB.flag('mg_piramida') (оболочка) или PR_ON=false. */
(function(){
if(typeof GMG_REG!=='function')return;
const PR_ON=true;
if(!PR_ON)return;
const ROWS=[4,3,2,1],NEED=10,CANS=14,MORE=2;
const EN=()=>typeof LANG!=='undefined'&&LANG==='en';
const tier=(p,m)=>p>=NEED&&m<=1?3:p>=NEED?2:p>=5?1:0;
// попадание: |dx| ≤ tol·ширины банки; «ровно» — ≤ 0,1
const TOL=.36,TOL_CALM=.46,PERF=.1;
function slots(){const L=[];let k=0;for(let r=0;r<ROWS.length;r++)for(let c=0;c<ROWS[r];c++)L.push({r,c,k:k++,off:(c-(ROWS[r]-1)/2)});return L;}
GMG_REG({id:'piramida',n:13,host:'valya',who:'valya',deps:['js/gmg-mgc.js','js/gmg-piramida-data.js'],
  open:()=>true,
  lines:{get good(){return GMC.line('piramida','st3');},get ok(){return GMC.line('piramida','st2');},get bad(){return GMC.line('piramida','st1');}},
  sim(o,k){let p=0,m=0,cans=CANS,r=0,ad=false;const S=slots();
    while(p<NEED){if(cans<=0){if(!ad&&o.rnd()<.5){ad=true;cans+=MORE;}else break;}cans--;
      const row=S[p].r,hit=o.rnd()<Math.min(.97,.5+.48*k-.04*row);if(hit){p++;if(o.rnd()<k*.5)r++;}else m++;}
    if(p<0||p>NEED||m>CANS+MORE)throw new Error('piramida: счёт');return {sc:p*10+r*3,st:tier(p,m)};},
  run(host,o){
    GMC.art=host.art||null;const K=GMC,TX=K.T('piramida'),calm=!!host.calm,weak=K.weak(host),ny=!!(host.fest&&host.fest.id==='ny');
    K.css('gmc-pr-css','.gmg-piramida .gmg-el,.gmg-piramida .zmg-el{position:relative;overflow:hidden}.gmc-pr-ui button{min-width:200px}');
    const C=K.cv(host),x=C.x,say=K.msg(host);
    const ui=document.createElement('div');ui.className='gmc-ui bot gmc-pr-ui';
    ui.innerHTML='<button class="ok gmc-pr-drop">⬇ '+K.esc(TX.drop||'Отпустить')+(host.pc?'<kbd>Пробел</kbd>':'')+'</button>';host.el.appendChild(ui);
    const bDrop=ui.querySelector('.gmc-pr-drop');bDrop.onclick=()=>drop();
    const S=slots();
    let p=0,miss=0,perf=0,cans=CANS,started=false,over=false,t=0,ph=o.rnd()*6,adAsked=false;
    const placed=[];          // {k, type, dy (осадка)}
    let fall=null;            // {x,y,vy,type,target,hit,rot,vx,done}
    const away=[];            // укатившиеся
    let Z=null,curType=1;
    const typeOf=k=>{const r=S[k].r;return r%2?2:1;};   // ряды: сгущёнка, шпроты, сгущёнка, шпроты
    function lay(){const w=C.w,h=C.h,ub=ui.offsetHeight||72,fw=Math.min(w,640),x0=(w-fw)/2;
      const cw=Math.min(fw/5.2,96,(h-ub)/7.2);           // ширина места под банку
      const counterY=(h-ub)-Math.max(40,cw*.7);
      const rh=[cw*.92,cw*.6,cw*.92,cw*.6];               // высота ряда (сгущёнка выше шпрот)
      const ry=[];let y=counterY;for(let r=0;r<4;r++){ry.push(y);y-=rh[r];}
      Z={w,h,ub,fw,x0,cw,counterY,rh,ry,cx:w/2,hookY:Math.max(26,y-cw*1.6),amp:Math.max(cw,Math.min(fw/2-cw*.65,cw*2.6))};}
    function slotX(k){return Z.cx+S[k].off*Z.cw;}
    function swingX(){const r=p<NEED?S[p].r:3,w=(calm?1.25:1.7)*(1+r*.16);return Z.cx+Math.sin(t*w+ph)*Z.amp;}
    function can(g,type,cx,by,sz,lit){K.good(g,type,cx,by,sz);if(lit&&!weak){const cols=['#ff5a5a','#ffd84a','#5ad1ff','#7cff7a'];
      for(let j=0;j<3;j++){g.fillStyle=cols[(j+lit)%4];g.globalAlpha=.6+.4*Math.sin(t*4+j+lit);g.beginPath();g.arc(cx+(j-1)*sz*.2,by-sz*.32,Math.max(2,sz*.035),0,7);g.fill();}g.globalAlpha=1;}}
    const SZ=type=>type===2?Z.cw*1.12:Z.cw*1.5;           // размер drawGood: шпроты шире, сгущёнка выше
    function bg(g){const z=Z;if(ny){const gr=g.createLinearGradient(0,0,0,z.h);gr.addColorStop(0,'#1d2a4a');gr.addColorStop(1,'#34497a');g.fillStyle=gr;g.fillRect(0,0,z.w,z.h);
        g.fillStyle='rgba(255,255,255,.8)';const n=weak?18:40;for(let i=0;i<n;i++){const sx=(i*137.5)%z.w,sy=((i*71+t*(20+i%5*6))%z.h);g.fillRect(sx,sy,2,2);}}
      else{g.fillStyle='#f3ead6';g.fillRect(0,0,z.w,z.h);g.fillStyle='#9fbfa4';g.fillRect(0,z.counterY-z.cw*4.6,z.w,6);
        g.fillStyle='#e6dcc4';for(let xx=((z.w/2)%60)-60;xx<z.w;xx+=60)g.fillRect(xx,0,2,z.counterY);}
      // прилавок
      g.fillStyle=ny?'#5b3a29':'#8a5a33';g.fillRect(0,z.counterY,z.w,z.h-z.counterY);g.fillStyle=ny?'#7a4f36':'#b07a46';g.fillRect(0,z.counterY,z.w,8);
      g.fillStyle=ny?'#4a2f22':'#74482a';for(let xx=z.x0+20;xx<z.x0+z.fw;xx+=z.fw/4)g.fillRect(xx,z.counterY+16,z.fw/4-40,z.h-z.counterY-z.ub-24);}
    function frame(dt){t+=dt;if(!Z)lay();const z=Z,g=x;g.setTransform(C.dpr,0,0,C.dpr,0,0);bg(g);
      // пунктир следующего места
      if(started&&!over&&p<NEED){const k=p,sx=slotX(k),by=z.ry[S[k].r],hh=z.rh[S[k].r];g.save();g.setLineDash([6,5]);g.strokeStyle=ny?'#ffd84a':'#c2410c';g.lineWidth=3;
        K.rr(g,sx-z.cw*.46,by-hh,z.cw*.92,hh-2,8);g.stroke();g.restore();}
      // стоящие банки
      for(const q of placed){const sx=slotX(q.k),by=z.ry[S[q.k].r];q.dy=Math.max(0,q.dy-dt*60);can(g,q.type,sx,by-q.dy,SZ(q.type),ny?q.k+1:0);}
      if(ny&&p>=NEED){star(g,z.cx,z.ry[3]-z.rh[3]-z.cw*.35,z.cw*.45);}
      // падающая
      if(fall){fall.vy+=(calm?1500:2200)*dt;fall.y+=fall.vy*dt;fall.x+=fall.vx*dt;fall.rot+=fall.vr*dt;
        if(!fall.done&&fall.hit&&fall.y>=fall.ty){fall.done=1;placed.push({k:fall.k,type:fall.type,dy:6});const ok1=fall.perf;
          try{host.snd.drop&&host.snd.drop();if(ok1&&host.snd.coin)host.snd.coin();}catch(e){}
          say(K.pick(ok1?TX.perfect:TX.good,o.rnd)||'Есть!','ok',900);fall=null;afterLand();}
        else if(fall&&!fall.hit&&!fall.bounced&&fall.y>=fall.ty){fall.bounced=1;fall.vy=-fall.vy*.25;fall.vx=(fall.x<z.cx?-1:1)*z.w*.5;fall.vr=(fall.vx>0?1:-1)*7;}
        if(fall){g.save();g.translate(fall.x,fall.y);g.rotate(fall.rot);can(g,fall.type,0,0,SZ(fall.type),0);g.restore();
          if(fall.y>z.h+z.cw||fall.x<-z.cw||fall.x>z.w+z.cw){fall=null;afterLand();}}}
      // качающаяся (на верёвке с крюка)
      if(started&&!over&&!fall&&cans>0&&p<NEED){const sx=swingX(),sy=z.hookY+z.cw*1.1;g.strokeStyle=ny?'#ddd':'#6b5a3e';g.lineWidth=2;g.beginPath();g.moveTo(z.cx,z.hookY-z.cw*.4);g.lineTo(sx,sy-SZ(curType)*.45);g.stroke();
        g.save();g.translate(sx,sy);g.rotate((sx-z.cx)/z.amp*-.12);can(g,curType,0,0,SZ(curType),0);g.restore();
        g.fillStyle=ny?'#ddd':'#6b5a3e';g.beginPath();g.arc(z.cx,z.hookY-z.cw*.4,5,0,7);g.fill();}
      host.top(K.sub(TX.left||'🥫 {k}',{k:cans})+' · '+p+'/'+NEED);}
    function star(g,cx,cy,r){g.save();g.translate(cx,cy);g.rotate(Math.sin(t*2)*.08);g.fillStyle='#ffd84a';g.strokeStyle='#c2410c';g.lineWidth=2;g.beginPath();
      for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fill();g.stroke();g.restore();}
    function drop(){if(!started||over||fall||cans<=0||p>=NEED)return;const z=Z,k=p,sx=swingX(),dx=Math.abs(sx-slotX(k))/z.cw,tol=calm?TOL_CALM:TOL;
      cans--;const hit=dx<=tol;const ty=z.ry[S[k].r];
      fall={x:sx,y:z.hookY+z.cw*1.1,vy:0,vx:0,vr:0,rot:(sx-z.cx)/z.amp*-.12,type:curType,k,hit,perf:hit&&dx<=PERF,ty:hit?ty:ty,done:0};
      if(hit){fall.x=sx;fall.vx=(slotX(k)-sx)*3;fall.rot=0;}
      try{host.snd.pick&&host.snd.pick();}catch(e){}}
    function afterLand(){const last=placed.length&&placed[placed.length-1];
      if(last&&last.k===p)p++;
      if(p>=NEED){end();return;}curType=typeOf(p);
      if(cans===1)say(TX.last||'Последняя банка!','',1600);
      if(cans<=0)outOf();}
    function outOf(){if(over)return;if(!adAsked&&host.adOk&&host.adOk()){adAsked=true;showMore();return;}end();}
    function showMore(){const v=document.createElement('div');v.className='gmc-ui top';v.style.top='40%';
      v.innerHTML='<button class="rw">'+K.esc(TX.more||'📺 Ещё банка за рекламу')+'</button><button class="sec">'+(EN()?'Finish':'Закончить')+'</button>';host.el.appendChild(v);
      const bs=v.querySelectorAll('button');bs[0].onclick=()=>{v.remove();host.adNeed('more').then(ok2=>{if(ok2){cans+=MORE;curType=typeOf(p);}else end();});};
      bs[1].onclick=()=>{v.remove();end();};host.el._prMore=v;}
    // попадание учитываем в момент отпускания (fall.hit/perf), а счёт — при посадке
    const _push=placed.push.bind(placed);placed.push=q=>{_push(q);if(fall&&fall.perf)perf++;return placed.length;};
    function end(){if(over)return;over=true;bDrop.disabled=true;const m=host.mem();m.bp=Math.max(+m.bp||0,p);m.n=(+m.n||0)+1;
      try{(p>=NEED?host.snd.happy:host.snd.sigh)&&(p>=NEED?host.snd.happy():host.snd.sigh());}catch(e){}
      const st=tier(p,miss);setTimeout(()=>host.finish({sc:p*10+perf*3,st,h:miss,label:K.sub(TX.label||'{p} из 10',{p,r:perf}),line:K.line('piramida','st'+st,o.rnd)}),ny&&p>=NEED?1400:800);}
    // промах считаем при отпускании
    const _drop=drop;
    function dropCount(){const before=cans;_drop();if(cans<before&&fall&&!fall.hit){miss++;say(K.pick(TX.miss,o.rnd)||'Мимо!','no',1400);}}
    bDrop.onclick=()=>dropCount();
    host.ptr(C.cv,{down:()=>dropCount()});
    host.keys(k=>{if(k===' '||k==='Enter'||k==='ArrowDown'||k==='s'||k==='S'||k==='ы'||k==='Ы'){dropCount();return true;}return false;});
    host.onResize(()=>{Z=null;});
    // бот стенда: отпускает, когда банка близко к месту (k — точность), иногда — наугад
    host.bot=k=>{if(!started||over)return;const mv=host.el._prMore;if(mv&&mv.parentNode){mv.querySelector('.rw').click();return;}
      if(fall||!Z||p>=NEED)return;const dx=Math.abs(swingX()-slotX(p))/Z.cw;if(dx<TOL*(1.15-k)||Math.random()<(1-k)*.08)dropCount();};
    host.loop(frame);
    host.intro({who:'valya',text:K.esc(K.pick(ny?(TX.introNy||TX.intro):TX.intro,o.rnd)),btn:TX.btn||'Начать',
      hint:(host.pc?(TX.hint&&TX.hint.pc):(TX.hint&&TX.hint.tel))+' · 10 банок · без спешки'})
      .then(()=>{started=true;Z=null;curType=typeOf(0);});}});
})();
