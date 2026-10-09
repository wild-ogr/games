/* vy-mg0 №2 «Мойка у подъезда» (баба Шура). Стираешь грязь пальцем/мышью (губка), голубь садится на крышу и пачкает — тапни, шугни.
   С 80 % чистоты — кнопка «Хватит, чисто!», с 97 % — само. Мягкое время: через 50 с (спокойный режим — 75 с) Шура зовёт — итог по чистоте.
   Счёт — процент чистоты; ступени: 95 % — 3★, 85 % — 2★, 70 % — 1★. */
(function(){if(typeof VYMG_REG!=='function')return;
const L0=(r,e)=>typeof L==='function'?L(r,e):r;
const TIER=p=>p>=95?3:p>=85?2:p>=70?1:0,COLS=['#e74c3c','#4f8fc0','#27ae60','#f2a900','#8e5bd0'];
function sim(o,k){/* за 50 с хороший игрок отмывает всё, плохой — 75–85 % */const rnd=o.rnd;const p=Math.min(100,Math.round(70+k*32+(rnd()-.5)*14));return {score:p,tier:TIER(p)};}
VYMG_REG({id:'moyka',sim,run(host,o){
  const A=VYMG.art,c=host.cv(),x=c.x,rnd=o.rnd,col=COLS[Math.floor(rnd()*COLS.length)];
  const GW=48,GH=22,dirt=new Float32Array(GW*GH),mask=new Uint8Array(GW*GH),tone=new Float32Array(GW*GH);let geo=null,state='intro',T=0,limit=o.calm?75:50,sp=null,bird=null,nextBird=5+rnd()*3,shoo=0,fin=false,splash=[];
  const bw=document.createElement('div');bw.className='vymg-float';bw.style.bottom='12px';bw.innerHTML='<button class="btn green" style="min-height:56px;padding:0 22px;display:none">'+L0('Хватит, чисто!','Clean enough!')+(host.pc?' <kbd class="vymg-kc vymg-kn">Enter</kbd>':'')+'</button>';host.el.appendChild(bw);
  const fb=bw.firstChild;fb.onclick=()=>finish();
  const mg=document.createElement('div');mg.className='vymg-msg';mg.style.top='10px';mg.style.opacity=0;host.el.appendChild(mg);
  function say(t,ms){mg.textContent=t;mg.style.opacity=1;clearTimeout(say.t);say.t=setTimeout(()=>mg.style.opacity=0,ms||1500);}
  host.onQuit(()=>clearTimeout(say.t));
  function layout(){const W=c.w,H=c.h,cw=Math.min(W*.86,H*.95,520),by=Math.min(H*.58,H-110);geo={W,H,cw,cx:W/2,by,L:W/2-cw/2,top:by-cw*.5,h:cw*.5};}
  // маска машины на сетке: рисуем силуэт в маленький холст и читаем пиксели
  function buildMask(){const m=document.createElement('canvas');m.width=GW*4;m.height=GH*4;const mx=m.getContext('2d');
    A.car(mx,{cx:m.width/2,by:m.height-2,w:m.width*.98,col:'#000',kind:'sedan'});const d=mx.getImageData(0,0,m.width,m.height).data;
    for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){let n=0;for(let yy=0;yy<4;yy++)for(let xx=0;xx<4;xx++){if(d[((j*4+yy)*m.width+i*4+xx)*4+3]>120)n++;}
      const k=j*GW+i;mask[k]=n>=8?1:0;dirt[k]=mask[k]?.75+rnd()*.25:0;tone[k]=rnd();}
    {const w=m.width*.98,r=w*.095,cx=m.width/2,by=m.height-2;for(const wx of[cx-w*.29,cx+w*.29])for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){if(Math.hypot(i*4+2-wx,j*4+2-(by-r))<r*1.1){mask[j*GW+i]=0;dirt[j*GW+i]=0;}}}
    // пятна погуще
    for(let s=0;s<9;s++){const ci=Math.floor(rnd()*GW),cj=Math.floor(rnd()*GH);for(let j=-2;j<=2;j++)for(let i=-3;i<=3;i++){const k=(cj+j)*GW+ci+i;if(cj+j>=0&&cj+j<GH&&ci+i>=0&&ci+i<GW&&mask[k])dirt[k]=1;}}}
  const dc=document.createElement('canvas');dc.width=GW;dc.height=GH;const dx=dc.getContext('2d');
  layout();buildMask();host.onResize(layout);
  const sc=()=>geo.cw/(GW*4*.98),cell=()=>({w:4*sc(),h:4*sc()}),gx0=()=>geo.cx-GW*2*sc(),gy0=()=>geo.by-(GH*4-2)*sc();
  function clean(){let a=0,b=0;for(let k=0;k<dirt.length;k++)if(mask[k]){a++;b+=Math.min(1,dirt[k]);}return a?Math.round(100*(1-b/a)):100;}
  function rub(px,py){const cs=cell(),X0=gx0(),Y0=gy0(),r=Math.max(18,geo.cw*.075);
    if(bird&&bird.st==='sit'&&Math.hypot(px-bird.x,py-bird.y)<44){shooBird();return;}
    for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const k=j*GW+i;if(!mask[k]||dirt[k]<=0)continue;const cx=X0+(i+.5)*cs.w,cy=Y0+(j+.5)*cs.h,d=Math.hypot(cx-px,cy-py);
      if(d<r){dirt[k]=Math.max(0,dirt[k]-(d<r*.6?.09:.04));if(Math.random()<.04)splash.push({x:cx,y:cy,t:0,vx:(Math.random()-.5)*60,vy:-30-Math.random()*40});}}}
  function shooBird(){if(!bird||bird.st!=='sit')return;bird.st='fly';bird.t=0;shoo++;try{host.snd.flutter();}catch(e){}say(L0('Кыш, кыш!','Shoo!'),900);}
  let last=null;
  host.ptr(c.cv,{down(px,py){if(state!=='play')return;sp=[px,py];last=[px,py];rub(px,py);},move(px,py){if(state!=='play'||!last)return;sp=[px,py];
      const d=Math.hypot(px-last[0],py-last[1]),n=Math.ceil(d/10);for(let s=1;s<=n;s++)rub(last[0]+(px-last[0])*s/n,last[1]+(py-last[1])*s/n);last=[px,py];},
    up(){last=null;}});
  c.cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&state==='play'){const b=c.cv.getBoundingClientRect();sp=[e.clientX-b.left,e.clientY-b.top];}});
  /* клавиатура (ПК): стрелки/WASD/ЦФЫВ — губка ездит и трёт, Пробел — шугнуть голубя, Enter — «Хватит, чисто!» */
  const KD={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1],'ф':[-1,0],'в':[1,0],'ц':[0,-1],'ы':[0,1]},held={};
  const kd=k=>KD[k]||KD[String(k).toLowerCase()];
  host.keys(k=>{const m=kd(k);if(m){held[String(k).toLowerCase()]=m;if(state==='play'&&!sp)sp=[geo.cx,geo.by-geo.h*.5];return true;}
    if(k===' '){if(state==='play'&&bird&&bird.st==='sit')shooBird();return true;}
    if(k==='Enter'){if(fb.style.display!=='none')finish();return true;}return false;});
  host.keysUp(k=>{const m=kd(k);if(m){delete held[String(k).toLowerCase()];return true;}return false;});
  const blur=()=>{for(const k in held)delete held[k];};window.addEventListener('blur',blur);host.onQuit(()=>window.removeEventListener('blur',blur));
  function keyMove(dt){let vx=0,vy=0;for(const k in held){vx+=held[k][0];vy+=held[k][1];}if(!vx&&!vy||!sp)return;const n=Math.hypot(vx,vy),v=Math.max(220,geo.cw*.9)*dt,
      nx=Math.max(geo.L-10,Math.min(geo.L+geo.cw+10,sp[0]+vx/n*v)),ny=Math.max(geo.top-geo.h*.3,Math.min(geo.by+6,sp[1]+vy/n*v)),st=Math.ceil(Math.hypot(nx-sp[0],ny-sp[1])/10);
    for(let i=1;i<=st;i++)rub(sp[0]+(nx-sp[0])*i/st,sp[1]+(ny-sp[1])*i/st);sp=[nx,ny];}
  function finish(){if(fin)return;fin=true;state='end';const p=clean();
    host.done({score:p,tier:TIER(p),label:L0('Чистота: ','Clean: ')+p+' %'+(shoo?L0(' · голубей шуганул: ',' · pigeons shooed: ')+shoo:'')});}
  host.loop((dt,t)=>{if(state==='play'){T+=dt;nextBird-=dt;keyMove(dt);
      if(!bird&&nextBird<=0){const top=geo.top+geo.h*.08;bird={x:-30,y:top-40,tx:geo.cx+(rnd()-.5)*geo.cw*.3,ty:top+4,st:'in',t:0,drop:1.6};}
      if(bird){bird.t+=dt;if(bird.st==='in'){bird.x+=(bird.tx-bird.x)*Math.min(1,dt*3);bird.y+=(bird.ty-bird.y)*Math.min(1,dt*3);if(Math.hypot(bird.tx-bird.x,bird.ty-bird.y)<3){bird.st='sit';bird.t=0;say(L0('Шура: «Опять голубь! Шугани!»','Shura: “A pigeon again! Shoo it!”'),1500);}}
        else if(bird.st==='sit'){bird.drop-=dt;if(bird.drop<=0){bird.drop=1.8;const cs=cell(),i=Math.round((bird.x-gx0())/cs.w),j=Math.round((bird.y+20-gy0())/cs.h)+2+Math.floor(rnd()*4);
            for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const k=(j+a)*GW+i+b;if(j+a>=0&&j+a<GH&&i+b>=0&&i+b<GW&&mask[k])dirt[k]=Math.max(dirt[k],.9);}}
          if(bird.t>7){bird.st='fly';bird.t=0;}}
        else{bird.x+=dt*260;bird.y-=dt*170;if(bird.y<-60){bird=null;nextBird=6+rnd()*4;}}}
      const p=clean();host.top(p+' %');fb.style.display=p>=80?'':'none';
      if(p>=97){say(L0('Блестит!','Sparkling!'),900);setTimeout(finish,500);state='wait';}
      else if(T>=limit){say(L0('Шура: «Обедать пора!»','Shura: “Lunchtime!”'),1200);setTimeout(finish,700);state='wait';}}
    for(const s of splash){s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=200*dt;}splash=splash.filter(s=>s.t<.6);
    draw(t);});
  function draw(t){const {W,H}=geo;A.sky(x,W,H,'#a8dcf5','#eef8fc');const gy=geo.by+4,hw=Math.min(W*.92,600);A.house(x,(W-hw)/2,gy-geo.cw*.05,hw,Math.min(H*.42,gy-20),{fl:5,lit:.1,seed:o.seed+3});
    A.ground(x,W,H,gy-geo.cw*.05,'#c9c3b5');x.fillStyle='#9bd27e';x.fillRect(0,gy+geo.cw*.12,W,H);
    {const gy2=gy+geo.cw*.12;x.fillStyle='#86c46a';for(let k=0;k<7;k++){const bx2=(k+.5)*W/7,bs=18+(k*37%11);x.beginPath();x.arc(bx2,gy2+26,bs,Math.PI,0);x.fill();}
      const fc=['#ff7a9c','#ffd23f','#ffffff','#b58cff'];for(let k=0;k<22;k++){x.fillStyle=fc[k%4];x.beginPath();x.arc((k*53.7)%W,gy2+30+((k*29)%Math.max(30,H-gy2-60)),3.2,0,7);x.fill();}}
    // подъезд и лавочка
    x.fillStyle='#7a5a3f';x.fillRect(geo.L-30,gy-geo.cw*.05-60,34,60);
    A.car(x,{cx:geo.cx,by:geo.by,w:geo.cw,col,kind:'sedan'});
    const cs=cell(),X0=gx0(),Y0=gy0();
    const id=dx.createImageData(GW,GH);for(let k=0;k<GW*GH;k++){const d=mask[k]?dirt[k]:0,tn=tone[k];id.data[k*4]=110+tn*30;id.data[k*4+1]=85+tn*20;id.data[k*4+2]=55+tn*10;id.data[k*4+3]=Math.min(.92,d*.95)*255;}
    dx.putImageData(id,0,0);x.imageSmoothingEnabled=true;x.drawImage(dc,X0,Y0,GW*cs.w,GH*cs.h);
    // ведро
    const bx=geo.L+geo.cw+14>W-40?geo.L+10:geo.L+geo.cw+6;x.fillStyle='#8aa0b4';x.beginPath();x.moveTo(bx,gy+6);x.lineTo(bx+30,gy+6);x.lineTo(bx+26,gy+38);x.lineTo(bx+4,gy+38);x.closePath();x.fill();
    x.fillStyle='rgba(255,255,255,.7)';for(const s of splash){x.beginPath();x.arc(s.x,s.y,2.5,0,7);x.fill();}
    if(bird)drawBird(bird.x,bird.y,bird.st!=='sit',t);
    if(sp&&state==='play'){x.save();x.translate(sp[0],sp[1]);x.rotate(-.2);x.fillStyle='#ffd23f';A.rr(x,-18,-12,36,24,6);x.fill();x.strokeStyle='#c99a00';x.lineWidth=2;x.stroke();
      x.fillStyle='rgba(255,255,255,.8)';for(let k=0;k<4;k++){x.beginPath();x.arc(-10+k*7,-16-Math.sin(t*6+k)*3,3,0,7);x.fill();}x.restore();}
    if(state==='play'){const left=Math.max(0,limit-T);x.fillStyle='rgba(43,51,64,.7)';x.font='bold 13px sans-serif';x.textAlign='left';x.fillText('🕑 '+Math.ceil(left)+L0(' с до обеда',' s till lunch'),12,H-12);}}
  function drawBird(bx,by,fly,t){x.save();x.translate(bx,by);x.fillStyle='#8a94a6';x.beginPath();x.ellipse(0,0,16,11,0,0,7);x.fill();
    x.fillStyle='#6f7a8c';x.beginPath();x.arc(13,-8,7,0,7);x.fill();x.fillStyle='#e38b2c';x.beginPath();x.moveTo(19,-8);x.lineTo(25,-6);x.lineTo(19,-5);x.fill();
    x.fillStyle='#222';x.beginPath();x.arc(15,-10,1.6,0,7);x.fill();
    const f=fly?Math.sin(t*30)*10:0;x.fillStyle='#a3adbd';x.beginPath();x.moveTo(-6,-4);x.lineTo(6,-4);x.lineTo(-4,-14-f);x.closePath();x.fill();
    if(!fly){x.strokeStyle='#e38b2c';x.lineWidth=2;x.beginPath();x.moveTo(-3,10);x.lineTo(-3,15);x.moveTo(4,10);x.lineTo(4,15);x.stroke();}x.restore();}
  host.intro({who:'shura',text:L0('Машину помой — весь двор в грязи! Три губкой, пока не заблестит. Голубь сядет — тапни его, пусть летит.','Wash the car — the whole yard is muddy! Scrub till it shines. If a pigeon lands, tap it away.'),
    hint:host.pc?L0('На компьютере: води мышью с зажатой кнопкой или губкой — ','On a computer: drag with the mouse or move the sponge with ')+host.kc('←↑→↓')+'/'+host.kc('WASD')+
      L0(', голубя — ',', shoo the pigeon — ')+host.kc(L0('Пробел','Space'))+L0(', «Хватит, чисто!» — ',', “Clean enough!” — ')+host.kc('Enter'):'',btn:L0('Взять губку','Grab the sponge')}).then(()=>{state='play';say(L0('Три!','Scrub!'),700);});
  if(VYMG.cur)VYMG.cur.dbg={get state(){return state;},clean,rub,get geo(){return geo;},finish,get bird(){return bird;},shooBird,get sp(){return sp;}};
}});
})();
