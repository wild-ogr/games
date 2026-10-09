/* vy-mg0 №5 «Фото у новой машины» (Валерка с «Зенитом»). Само предлагается, когда в гараже новая машина (o.ctx.car — номер в MODELS).
   Три кадра плёнки: «Снимаю!» в момент, когда голубь не загородил, баба Шура улыбается и машина в середине кадра — за каждое по очку (кадр до 3).
   Ступень — лучший кадр, счёт — сумма трёх кадров (до 9). */
(function(){if(typeof VYMG_REG!=='function')return;
const L0=(r,e)=>typeof L==='function'?L(r,e):r;
function sim(o,k){const rnd=o.rnd;let best=0,sc=0;for(let i=0;i<3;i++){let p=0;for(let q=0;q<3;q++)if(rnd()<.45+k*.5)p++;sc+=p;best=Math.max(best,p);}return {score:sc,tier:best};}
function carOf(o){const M=typeof MODELS!=='undefined'?MODELS:[];let k=o.ctx&&o.ctx.car!=null?+o.ctx.car:(typeof S!=='undefined'&&S.garage&&S.garage.length?S.garage[S.garage.length-1]:0);
  const m=M[k]||{name:L0('«Москвич»','Moskvich'),len:2,color:'#4f8fc0'};return {k,n:o.ctx&&o.ctx.name||m.name,col:m.color==='#ffffff'||m.color==='#f1f2f6'?'#eef2f6':m.color,kind:m.len>=4?'bus':m.len>=3?'van':'sedan'};}
VYMG_REG({id:'foto',sim,run(host,o){
  const A=VYMG.art,c=host.cv(),x=c.x,rnd=o.rnd,car=carOf(o);
  let state='intro',T=0,shots=[],flash=0,mood='norm',moodT=1.2,bird=null,birdT=1.5+rnd()*1.5,dev=0;
  const imgs={};for(const m of['norm','sad']){const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent((typeof shuraSvg==='function'?shuraSvg(m):'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"/>').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));imgs[m]=im;}
  const bw=document.createElement('div');bw.className='vymg-float';bw.style.bottom='14px';
  bw.innerHTML='<button class="vymg-big" style="width:120px;height:120px">📷<br>'+L0('Снимаю!','Snap!')+'</button>';host.el.appendChild(bw);const btn=bw.firstChild;
  const strip=document.createElement('div');strip.className='vy0-strip';host.el.appendChild(strip);
  const mg=document.createElement('div');mg.className='vymg-msg';mg.style.top='96px';mg.style.opacity=0;host.el.appendChild(mg);
  function say(t,ms){mg.textContent=t;mg.style.opacity=1;clearTimeout(say.t);say.t=setTimeout(()=>mg.style.opacity=0,ms||1300);}
  host.onQuit(()=>clearTimeout(say.t));
  function geo(){const W=c.w,H=c.h,cw=Math.min(W*.6,H*.5,330),by=Math.min(H*.6,H-170),amp=Math.min(W*.1,60);return {W,H,cw,by,amp,fw:Math.min(W*.72,cw*1.75),fh:Math.min(H*.42,cw*.95)};}
  function sway(t){const g=geo();return (Math.sin(t*1.25)+.55*Math.sin(t*2.9+1))*g.amp*(o.calm?.6:1);}
  function snap(){if(state!=='play'||host.paused)return;const g=geo(),off=sway(T),fx=g.W/2+off,cx=g.W/2;
    const okB=!(bird&&Math.abs(bird.x-fx)<g.fw*.45&&bird.y>g.by-g.fh&&bird.y<g.by+20),okS=mood==='norm',okC=Math.abs(off)<g.amp*.38;
    const pts=(okB?1:0)+(okS?1:0)+(okC?1:0);flash=1;try{host.snd.tap();}catch(e){}
    // кадр на память: вырезаем видоискатель
    const tc=document.createElement('canvas'),tw=96,th=Math.round(96*g.fh/g.fw);tc.width=tw*2;tc.height=th*2;
    try{const d=c.dpr;tc.getContext('2d').drawImage(c.cv,(fx-g.fw/2)*d,(g.by-g.fh*.78)*d,g.fw*d,g.fh*d,0,0,tc.width,tc.height);}catch(e){}
    shots.push({pts,okB,okS,okC});tc.className='vy0-shot';strip.appendChild(tc);const lab=document.createElement('b');lab.textContent='★'.repeat(pts)||'—';strip.appendChild(lab);
    say(!okB?L0('Голубь влез в кадр!','A pigeon photobombed!'):!okS?L0('Шура не улыбнулась…','Shura wasn’t smiling…'):!okC?L0('Машина ушла из кадра','The car is off-centre'):L0('Вот это кадр!','What a shot!'));
    host.top(L0('кадров: ','frames: ')+(3-shots.length));
    if(shots.length>=3){state='end';setTimeout(finish,1300);}}
  function finish(){const sc=shots.reduce((a,s)=>a+s.pts,0),best=Math.max(0,...shots.map(s=>s.pts));
    try{const z=VYMG.Z();z.w.f['m'+car.k]=1;VYMG.touch();}catch(e){}
    host.done({score:sc,tier:best,label:L0('Лучший кадр: ','Best shot: ')+best+' '+L0('из 3','of 3')+' · '+car.n});}
  host.ptr(btn,{down:snap});
  host.keys(k=>{if(k===' '||k==='Enter'){snap();return true;}return false;});
  host.loop((dt,t)=>{if(state==='play')T+=dt;flash=Math.max(0,flash-dt*3);
    moodT-=dt;if(moodT<=0){mood=mood==='norm'?'sad':'norm';moodT=mood==='norm'?1.1+rnd()*1.3:.7+rnd()*.8;}
    birdT-=dt;const g=geo();if(!bird&&birdT<=0){const ltr=rnd()<.5;bird={x:ltr?-30:g.W+30,y:g.by-g.cw*.15-rnd()*g.fh*.5,v:(ltr?1:-1)*(g.W/(1.5+rnd()*.8))};}
    if(bird){bird.x+=bird.v*dt;if(bird.x<-60||bird.x>g.W+60){bird=null;birdT=1.6+rnd()*2.2;}}
    draw(t);});
  function draw(t){const g=geo(),{W,H}=g;A.sky(x,W,H,'#9fd6f2','#f2fbff');const hw=Math.min(W*.95,620);A.house(x,(W-hw)/2,g.by-g.cw*.08,hw,Math.min(H*.45,g.by-30),{fl:5,lit:.15,seed:o.seed});
    A.ground(x,W,H,g.by-g.cw*.08,'#cfc9bb');x.fillStyle='#9bd27e';x.fillRect(0,g.by+g.cw*.1,W,H);
    // гирлянда флажков — праздник новой машины
    const fc=['#e5484d','#ffcf40','#3f8fe0','#2fa84f'];x.strokeStyle='#555';x.lineWidth=1.2;x.beginPath();x.moveTo(0,g.by-g.fh*.95);x.quadraticCurveTo(W/2,g.by-g.fh*.75,W,g.by-g.fh*.95);x.stroke();
    for(let k=0;k<14;k++){const u=(k+.5)/14,fx=u*W,fy=g.by-g.fh*.95+Math.sin(u*Math.PI)*g.fh*.1;x.fillStyle=fc[k%4];x.beginPath();x.moveTo(fx-6,fy);x.lineTo(fx+6,fy);x.lineTo(fx,fy+12);x.closePath();x.fill();}
    const cx=W/2-g.cw*.12;A.car(x,{cx,by:g.by,w:g.cw,col:car.col,kind:car.kind});
    // баба Шура рядом с машиной
    const sx=cx+g.cw*.62,sh=g.cw*.42,im=imgs[mood];x.fillStyle='#7a5c4a';A.rr(x,sx-sh*.28,g.by-sh*.75,sh*.56,sh*.75,sh*.15);x.fill();
    if(im&&im.complete)try{x.drawImage(im,sx-sh*.38,g.by-sh*1.3,sh*.76,sh*.76);}catch(e){}
    if(bird){x.save();x.translate(bird.x,bird.y);if(bird.v<0)x.scale(-1,1);x.fillStyle='#8a94a6';x.beginPath();x.ellipse(0,0,15,9,0,0,7);x.fill();x.fillStyle='#6f7a8c';x.beginPath();x.arc(12,-5,6,0,7);x.fill();
      const f=Math.sin(t*28)*11;x.fillStyle='#a3adbd';x.beginPath();x.moveTo(-6,-2);x.lineTo(6,-2);x.lineTo(-2,-14-f);x.closePath();x.fill();x.restore();}
    // видоискатель
    if(state==='play'||state==='end'){const off=sway(T),fx=W/2+off,fy=g.by-g.fh*.78,ok=Math.abs(off)<g.amp*.38;x.strokeStyle=ok?'#2fa84f':'#ffffff';x.lineWidth=3;
      const L=fx-g.fw/2,R=fx+g.fw/2,B=fy+g.fh,q=18;x.beginPath();x.moveTo(L,fy+q);x.lineTo(L,fy);x.lineTo(L+q,fy);x.moveTo(R-q,fy);x.lineTo(R,fy);x.lineTo(R,fy+q);
      x.moveTo(R,B-q);x.lineTo(R,B);x.lineTo(R-q,B);x.moveTo(L+q,B);x.lineTo(L,B);x.lineTo(L,B-q);x.stroke();
      x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,0,W,fy);x.fillRect(0,B,W,H-B);x.fillRect(0,fy,L,g.fh);x.fillRect(R,fy,W-R,g.fh);
      x.beginPath();x.arc(fx,fy+g.fh/2,6,0,7);x.stroke();}
    if(flash){x.fillStyle='rgba(255,255,255,'+flash+')';x.fillRect(0,0,W,H);}}
  host.top(L0('кадров: ','frames: ')+3);
  host.intro({who:'valerka',text:L0('Новая машина во дворе — '+car.n+'! Сфотографируемся с бабой Шурой. Жми «Снимаю!», когда голубь не мешает, Шура улыбается, а машина посередине. Три кадра плёнки.',
      'A new car in the yard — the '+car.n+'! Let’s take a photo with Granny Shura. Press “Snap!” when no pigeon is in the way, Shura smiles and the car is centred. Three frames of film.'),
    hint:host.pc?L0('На компьютере: ','On a computer: ')+host.kc(L0('Пробел','Space')):'',btn:L0('Взять «Зенит»','Take the camera')}).then(()=>{state='play';});
  if(VYMG.cur)VYMG.cur.dbg={get state(){return state;},snap,get mood(){return mood;},get bird(){return bird;},sway:()=>sway(T),geo,get shots(){return shots;}};
}});
})();
