/* vy-mg0 №1 «Заведи „Москвич“» (Толик). Утро, мороз: держишь ключ — стрелка оборотов ползёт; отпустил в зелёной зоне — завёлся.
   Перегазовал — «залил свечи», 2 с ждём. Три машины подряд, зона всё уже. Счёт: с 1-й попытки 3, со 2-й 2, дальше 1; после 4 неудач Толик толкает «с толкача» (0). */
(function(){if(typeof VYMG_REG!=='function')return;
const L0=(r,e)=>typeof L==='function'?L(r,e):r;
const CARS=[{n:'«Москвич»',en:'Moskvich',col:'#4f8fc0',kind:'sedan'},{n:'«Запорожец»',en:'Zaporozhets',col:'#e8a33a',kind:'old'},{n:'«Буханка»',en:'Bukhanka',col:'#6ab04c',kind:'van'}];
const ZW=[.12,.09,.07],MAXT=4;
/* стрелка: доля 0..1, растёт с ускорением; при calm медленнее. Время до зоны ≈ 1,5–2,2 с */
function spd(p,calm){return (calm?.34:.44)*(.55+.9*p);}
function zoneAt(rnd,i,calm){const w=ZW[i]*(calm?1.3:1),c=.6+rnd()*.2;return [c-w/2,c+w/2];}
function sim(o,k){const rnd=o.rnd;let sc=0;for(let i=0;i<3;i++){const z=zoneAt(rnd,i,false),c=(z[0]+z[1])/2,w=z[1]-z[0];let got=0;
    for(let t=0;t<MAXT;t++){const sg=(1-k)*.13+.015,e=(rnd()+rnd()+rnd()-1.5)*sg*1.4;if(Math.abs(e)<w/2){got=t===0?3:t===1?2:1;break;}}sc+=got;}
  return {score:sc,tier:sc>=8?3:sc>=6?2:sc>=3?1:0};}
VYMG_REG({id:'zavedi',sim,run(host,o){
  const A=VYMG.art,c=host.cv(),x=c.x,rnd=o.rnd;let i=0,tries=0,sc=0,p=0,hold=false,state='wait',st=0,zone=zoneAt(rnd,0,o.calm),smoke=[],shake=0,pts=[],crank=0,msg=null,rot=0,drive=0;
  const res=[];
  const bw=document.createElement('div');bw.className='vymg-float';bw.style.bottom='14px';
  bw.innerHTML='<button class="vymg-big" aria-label="'+L0('Ключ','Key')+'">🔑<br>'+L0('Держи','Hold')+'</button>';host.el.appendChild(bw);const btn=bw.firstChild;
  const mg=document.createElement('div');mg.className='vymg-msg';mg.style.opacity=0;host.el.appendChild(mg);
  function say(t,ms){mg.textContent=t;mg.style.opacity=1;clearTimeout(say.t);say.t=setTimeout(()=>mg.style.opacity=0,ms||1400);}
  host.onQuit(()=>clearTimeout(say.t));
  function upd(){host.top((i+1)+' '+L0('из','of')+' 3');}
  upd();
  function down(){if(state!=='wait'||host.paused)return;hold=true;btn.classList.add('on');state='crank';p=0;crank=0;try{host.snd.tap();}catch(e){}}
  function up(){if(!hold)return;hold=false;btn.classList.remove('on');if(state!=='crank')return;
    if(p>=zone[0]&&p<=zone[1]){const g=tries===0?3:tries===1?2:1;sc+=g;res.push(g);state='ok';st=0;try{host.snd.go();}catch(e){}
      for(let k=0;k<14;k++)smoke.push({x:0,y:0,vx:-20-Math.random()*40,vy:-8-Math.random()*16,t:0,l:1+Math.random()*.8,r:4+Math.random()*6});
      say(g===3?L0('Завёлся с пол-оборота!','Started first time!'):L0('Завёлся!','It started!'));}
    else{tries++;try{host.snd.honk2();}catch(e){}state='fail';st=0;shake=.35;
      say(p<zone[0]?L0('Рано отпустил — не схватил','Too early — didn’t catch'):L0('Поздно!','Too late!'));
      if(tries>=MAXT){res.push(0);state='push';st=0;say(L0('Толик: «Давай с толкача!»','Tolik: “Let’s push-start it!”'),1800);}}
    p=Math.min(p,1);}
  host.ptr(btn,{down,up});
  host.keys(k=>{if(k===' '||k==='Enter'||k==='ArrowUp'){down();return true;}return false;});
  host.keysUp(k=>{if(k===' '||k==='Enter'||k==='ArrowUp'){up();return true;}return false;});
  function next(){i++;tries=0;if(i>=3){const t=sc>=8?3:sc>=6?2:sc>=3?1:0;host.done({score:sc,tier:t,label:L0('Очков: ','Points: ')+sc+' '+L0('из 9','of 9')});return;}
    zone=zoneAt(rnd,i,o.calm);state='wait';p=0;drive=0;smoke.length=0;upd();say(L0('Теперь '+CARS[i].n,'Now the '+CARS[i].en),1300);}
  host.loop((dt,t)=>{
    if(state==='crank'){p+=dt*spd(p,o.calm);crank+=dt;if(crank>.18){crank=0;try{host.snd.flutter();}catch(e){}}
      if(p>=1){p=1;hold=false;btn.classList.remove('on');tries++;state='flood';st=0;shake=.5;try{host.snd.crash();}catch(e){}say(L0('Перегазовал — залил свечи! Ждём…','Flooded the plugs! Wait…'),1900);
        if(tries>=MAXT){res.push(0);state='push';}}}
    else if(state==='flood'){st+=dt;p=Math.max(0,1-st/2);if(st>=2){state=tries>=MAXT?'push':'wait';p=0;st=0;}}
    else if(state==='fail'){st+=dt;p=Math.max(0,p-dt*1.6);if(st>.7&&p<=0){state='wait';p=0;}}
    else if(state==='ok'){st+=dt;p=zone[0]+(zone[1]-zone[0])/2+Math.sin(t*30)*.01;if(st>1.2)drive+=dt*(60+drive*3);rot+=dt*drive/20;if(st>2.6)next();}
    else if(state==='push'){st+=dt;drive+=dt*35;rot+=dt*drive/20;if(st>2.4)next();}
    shake=Math.max(0,shake-dt);
    for(const s of smoke){s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=dt*10;}smoke=smoke.filter(s=>s.t<s.l);
    if(state==='ok'&&Math.random()<.4)smoke.push({x:0,y:0,vx:-30-Math.random()*30,vy:-6-Math.random()*10,t:0,l:1.2,r:4});
    draw(t);});
  function draw(t){const W=c.w,H=c.h;A.sky(x,W,H,'#bcd9ee','#f4f8fb');
    const gy=Math.round(H*.5);const hw=Math.min(W*.9,560);A.house(x,(W-hw)/2,gy,hw,H*.32,{fl:5,lit:.25,seed:o.seed,col:'#e6e0d2'});
    A.ground(x,W,H,gy,'#f4f7fa');x.fillStyle='#dfe7ee';x.fillRect(0,gy+18,W,6);
    // снежинки
    x.fillStyle='rgba(255,255,255,.9)';for(let k=0;k<26;k++){const sx=(k*97+t*(12+k%5*4))%W,sy=(k*53+t*(20+k%7*5))%gy;x.beginPath();x.arc(sx,sy,1.6+(k%3)*.6,0,7);x.fill();}
    const cw=Math.min(W*.62,260,H*.4),cx=W*.5+drive,by=gy+cw*.2,car=CARS[i]||CARS[2],sh=shake&&!o.calm?Math.sin(t*60)*3*shake:0;
    const run=state==='ok';const b=A.car(x,{cx:cx+sh,by,w:cw,col:car.col,kind:car.kind,lights:run,frost:run?0:1,rot,lean:run&&!o.calm?Math.sin(t*40)*.006:0});
    if(state==='push'){x.font='bold 15px sans-serif';x.fillStyle='#2b2a26';x.textAlign='center';x.fillText('💪 '+L0('Толик толкает','Tolik is pushing'),cx-cw*.6,by-cw*.3);}
    x.fillStyle='rgba(120,120,130,.5)';for(const s of smoke){x.globalAlpha=Math.max(0,1-s.t/s.l)*.6;x.beginPath();x.arc(b.L+s.x-4,by-b.r*.6+s.y,s.r,0,7);x.fill();}x.globalAlpha=1;
    // тахометр
    const R=Math.min(W*.33,H*.17,130),gx=W/2,gyy=H-Math.max(170,H*.22)-8;x.save();
    x.fillStyle='#2b3340';x.beginPath();x.arc(gx,gyy,R+10,Math.PI,0);x.lineTo(gx+R+10,gyy+12);x.lineTo(gx-R-10,gyy+12);x.closePath();x.fill();
    const a=q=>Math.PI+q*Math.PI;x.lineWidth=R*.16;x.strokeStyle='#4b5566';x.beginPath();x.arc(gx,gyy,R*.82,Math.PI,0);x.stroke();
    x.strokeStyle='#e5484d';x.beginPath();x.arc(gx,gyy,R*.82,a(.9),0);x.stroke();
    x.strokeStyle='#47c45b';x.beginPath();x.arc(gx,gyy,R*.82,a(zone[0]),a(zone[1]));x.stroke();
    x.strokeStyle='#fff';x.lineWidth=2;for(let k=0;k<=10;k++){const q=a(k/10);x.beginPath();x.moveTo(gx+Math.cos(q)*R*.6,gyy+Math.sin(q)*R*.6);x.lineTo(gx+Math.cos(q)*R*.68,gyy+Math.sin(q)*R*.68);x.stroke();}
    const q=a(Math.max(0,Math.min(1,p)));x.strokeStyle='#ffb020';x.lineWidth=4;x.lineCap='round';x.beginPath();x.moveTo(gx,gyy);x.lineTo(gx+Math.cos(q)*R*.9,gyy+Math.sin(q)*R*.9);x.stroke();
    x.fillStyle='#ffb020';x.beginPath();x.arc(gx,gyy,6,0,7);x.fill();x.restore();
    // попытки
    x.font='bold 13px sans-serif';x.textAlign='center';x.fillStyle='#2b3340';x.fillText(L0('Попытка ','Try ')+Math.min(MAXT,tries+1)+' / '+MAXT+'  ·  '+L0('очков ','points ')+sc,gx,gyy+30);}
  host.intro({text:L0('Мороз! Машины с утра не заводятся. Держи ключ — стрелка поползёт. Отпусти, когда она в <b>зелёном</b>. Перегазуешь — зальёшь свечи.','Frost! The cars won’t start. Hold the key — the needle climbs. Let go when it’s in the <b>green</b>. Too far — you flood the plugs.'),
    hint:host.pc?L0('На компьютере: держи ','On a computer: hold ')+host.kc(L0('Пробел','Space')):'',btn:L0('Поехали!','Let’s go!')}).then(()=>{state='wait';});
  state='intro';
  if(VYMG.cur)VYMG.cur.dbg={get p(){return p;},get zone(){return zone;},get state(){return state;},get sc(){return sc;},down,up};
}});
})();
