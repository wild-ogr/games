'use strict';
/* BGB (08.10) «Забава» №7 «Перетягивание каната» (id 'kanat').
   Поляна у ручья: богатырь против Лешего (лесная поляна) или Водяного (пруд) — соперник по зерну дня.
   Ритм, не скорость: внизу полоса «тяни на выдохе» — огонёк ходит туда-сюда; жми, когда он в зелёной середине.
   Зелёная — сильный рывок, жёлтая — слабый, красная — сбился (канат уходит к сопернику). Жать чаще одного раза за проход — «не спеши» (сбился).
   Соперник тянет сам и раз в 3–4 с делает рывок (раздувается — «!»): попал в зелёное в этот миг — «Упёрся!», рывок не прошёл.
   Ленточка за колышек у богатыря — победа (соперник летит в ручей), за колышек соперника — богатырь в воде. 30 с — по положению ленточки.
   Логика — чистые функции kn*, бот (sim) играет ими же. */
(function(){
const KN={T:30,PER:1.25,G:.14,Y:.3,GAIN:{perf:.14,green:.105,yel:.035,red:-.07,spam:-.06},DRIFT:.045,HEAVE:.2,HV0:3.0,HV1:4.2,WARN:.75,HOLD:.6,TIERS:[1,2,3]};
// огонёк: 0…1 туда-обратно, phase — время; середина (0,5) — «выдох»
function knLight(t,per){const q=(t/per)%2;return q<1?q:2-q;}
function knZone(x,calm){const d=Math.abs(x-.5),g=KN.G*(calm?1.4:1),y=KN.Y*(calm?1.2:1);return d<=.045*(calm?1.4:1)?'perf':d<=g?'green':d<=y?'yel':'red';}
function knPass(t,per){return Math.floor(t/per);}
// рывки соперника: моменты по зерну
function knHeaves(seed,calm){const r=zbbK.rng(seed*7+11),a=[];let t=2.4+r()*1.2;while(t<KN.T){a.push(+t.toFixed(2));t+=(KN.HV0+r()*(KN.HV1-KN.HV0))*(calm?1.25:1);}return a;}
function knFoe(seed){return ((seed>>>3)&1)?'vod':'lesh';}
function knTier(r){return r.win?(r.left>=8?3:2):r.pos>0?1:0;}
function knScore(pos,win,left){return Math.max(0,Math.round((Math.max(-1,Math.min(1,pos))+1)*40+(win?20+left*2:0)));}

/* ---------- бот: жмёт раз за проход с ошибкой по умению ---------- */
function knSim(o,k){o=o||{};k=k==null?.6:+k;const seed=(o.seed|0)||20261008,calm=!!o.calm,per=KN.PER*(calm?1.2:1),hv=knHeaves(seed,calm),me=zbbK.rng(seed+511*(1+Math.round(k*100)));
  const g=()=>{let s=0;for(let i=0;i<4;i++)s+=me();return (s-2)/1.15;};let pos=0,t=0,dt=1/30,nextTap=per*.5+g()*.1,hi=0,last=-1,win=0;const sig=(1-k)*.28+.035;
  while(t<KN.T){t+=dt;pos-=KN.DRIFT*dt*(calm?.75:1)*(1+Math.min(1,(o.lvl|0)/12)*.3);
    if(t>=nextTap){const z=knZone(knLight(t,per),calm),ps=knPass(t,per);let gain=KN.GAIN[z];if(ps===last)gain=KN.GAIN.spam;last=ps;pos+=gain;
      if(hi<hv.length&&hv[hi]>0&&t>=hv[hi]-KN.WARN&&t<=hv[hi]+KN.HOLD&&(z==='green'||z==='perf'))hv[hi]=-hv[hi];
      // следующий: середина следующего прохода + ошибка; иногда «спешит» второй раз в тот же проход
      const nm=(Math.floor(t/per)+1)*per+per*.5;nextTap=me()<(1-k)*.15?t+.18:nm+g()*sig*per;}
    if(hi<hv.length&&t>=Math.abs(hv[hi])+KN.HOLD){if(hv[hi]>0)pos-=KN.HEAVE;hi++;}
    if(pos>=1){win=1;break;}if(pos<=-1)break;}
  const left=Math.max(0,KN.T-t),r={win,pos,left};return {score:knScore(pos,win,left),tier:knTier(r)};}

/* =================================== игра =================================== */
function knRun(host,o){o=o||{};const K=zbbK,seed=(o.seed|0)||20261008,calm=K.calm(o),pc=K.pc(),foe=knFoe(seed),per=KN.PER*(calm?1.2:1),hv=knHeaves(seed,calm).map(t=>({t,st:0}));
  const G={t:0,run:0,pos:0,shown:0,state:'intro',P:[],N:[],msg:null,last:-1,intro:{t:0},taps:[],flash:null,hvI:0,over:null,lean:0,strain:0,foeAnim:0,heroAnim:0,stats:{perf:0,green:0,yel:0,red:0,spam:0,block:0},ripple:0,hint:1};
  let V=null;window.__zbbG={G,tap:()=>tap(),hv};
  const FN=foe==='vod'?[L('Водяной','The Vodyanoy'),'tr_bol']:[L('Леший','The Leshy'),'tr_les'];
  const stg=K.stage(host,{resize,down,up,step,draw,paused:()=>host.paused});
  const END=K.ender(host,o,{tier:s=>G.tier,title:t=>t>=3?L('Силач! В ручей его!','Strongman! Into the brook!'):t>=2?L('Перетянул!','You won the tug!'):t>=1?L('По очкам — твоя','You win on points'):L('Искупался…','Took a dip…'),
    unit:()=>L('сила рывков','pulling power'),adWant:()=>false,
    finish:(s,t)=>{if(G.done)return;G.done=1;stg.kill();host.done&&host.done({score:s,tier:t,rec:false,extra:{tro:FN[1],foe,win:G.over&&G.over.win?1:0,block:G.stats.block}});}});

  function resize(W,H){const port=H>W*1.1;V={W,H,port,gy:H*(port?.64:.66),cx:W/2,u:Math.min(W*(port?.255:.16),H*(port?.17:.27))};}
  function down(p){if(END.down(p))return;if(G.state==='intro'){const b=G.intro.b;if(b&&K.hit(b,p))b.pressed=1;return;}tap();}
  function up(p){if(END.up(p))return;if(G.state==='intro'){const b=G.intro.b;if(b&&b.pressed&&K.hit(b,p))start();if(b)b.pressed=0;}}
  K.keys(host,(k,e,dn)=>{if(!dn)return /^( |Enter|ArrowUp)$/.test(k);if(END.on())return END.key(k);
    if(G.state==='intro'){if(k==='Enter'||k===' '){start();return true;}return false;}
    if(k===' '||k==='Enter'||k==='ArrowUp'||k==='ArrowLeft'){tap();return true;}return false;});
  function start(){if(G.state!=='intro')return;G.state='ready';G.rt=0;K.snd('click');}
  function tap(){if(G.state!=='go')return;G.hint=0;const x=knLight(G.run,per),ps=knPass(G.run,per);let z=knZone(x,calm);if(ps===G.last)z='spam';G.last=ps;
    const gain=KN.GAIN[z];G.pos+=gain;G.stats[z]++;G.taps.push({x,z,t:0});G.heroAnim=1;
    // рывок соперника идёт — зелёное его гасит
    const h=hv[G.hvI];if(h&&h.st===1&&(z==='green'||z==='perf')){h.st=2;G.stats.block++;say(L('Упёрся!','Held firm!'),'#c8ff9a');K.snd('combo');burstFeet(-1,10);}
    else if(z==='perf'){say(L('Отлично!','Perfect!'),'#ffe27a');K.snd('crit');}
    else if(z==='green'){K.snd('hit');}
    else if(z==='yel'){K.snd('tick');}
    else if(z==='spam'){say(L('Не спеши — один рывок на выдох','Don’t rush — one pull per breath'),'#ffd2a0');K.snd('hurt');}
    else{say(L('Сбился!','Out of rhythm!'),'#ffb0a0');K.snd('hurt');}
    if(gain>0){burstFeet(-1,z==='perf'?10:6);G.strain=1;}else G.flash={t:0,c:'#e0482a'};}
  function say(s,col){G.msg={s,t:0,col:col||'#fff3c8'};}
  function burstFeet(side,n){const f=side<0?heroPos():foePos();K.dust(G.P,f.x+side*-V.u*.18,V.gy,V.u*.18,'#8a6a3a',calm?Math.ceil(n/2):n);}

  /* ---------- шаг ---------- */
  function step(dt){G.t+=dt;
    if(G.state==='ready'){G.rt+=dt;if(G.rt>=2.4){G.state='go';K.snd('boss');say(L('Тяни!','Pull!'),'#ffe27a');}}
    if(G.state==='go'){G.run+=dt;G.pos-=KN.DRIFT*dt*(calm?.75:1)*(1+Math.min(1,(o.lvl|0)/12)*.3);
      const h=hv[G.hvI];if(h){if(h.st===0&&G.run>=h.t-KN.WARN){h.st=1;K.snd('whistle');G.foeAnim=1;}
        if(G.run>=h.t+KN.HOLD){if(h.st===1){G.pos-=KN.HEAVE;say(L('Рывок! ','Yank! ')+FN[0]+L(' тянет',' pulls'),'#ffb0a0');K.snd('swing');burstFeet(1,10);if(!calm)stg.shake=Math.max(stg.shake,.3);G.flash={t:0,c:'#e0482a'};}G.hvI++;}}
      if(G.pos>=1)finish(true);else if(G.pos<=-1)finish(false);else if(G.run>=KN.T)finish(G.pos>0,true);}
    if(G.state==='over'){const ov=G.over;ov.t+=dt;if(ov.t>.55&&!ov.splash){ov.splash=1;splash(ov.win?1:-1);}if(ov.t>2.2&&!ov.ended){ov.ended=1;END.end(knScore(G.pos,ov.win&&!ov.time,ov.left));}}
    G.shown+=(G.pos-G.shown)*(1-Math.exp(-dt*9));
    G.heroAnim=Math.max(0,G.heroAnim-dt*3);G.foeAnim=Math.max(0,G.foeAnim-dt*.8);G.strain=Math.max(0,G.strain-dt*2);G.ripple+=dt;
    for(const q of G.taps)q.t+=dt;G.taps=G.taps.filter(q=>q.t<.8);
    if(G.flash){G.flash.t+=dt;if(G.flash.t>.35)G.flash=null;}
    if(G.msg){G.msg.t+=dt;if(G.msg.t>1.5)G.msg=null;}}
  function finish(win,time){if(G.state!=='go')return;G.state='over';const left=Math.max(0,KN.T-G.run);G.over={win,time:!!time,left,t:0};
    const r={win:win&&!time,pos:G.pos,left};G.tier=knTier(r);if(time&&win)G.tier=1;
    K.snd(win?'win':'lose');say(win?(time?L('Время! Ленточка на твоей стороне','Time! The ribbon is on your side'):L('Перетянул!','You won the tug!')):(time?L('Время! Ленточка у соперника','Time! The ribbon is on their side'):L('Ой-ой — в ручей!','Uh-oh — into the brook!')),win?'#c8ff9a':'#ffb0a0');
    if(time)G.over.splash=1;}
  function splash(side){const x=V.cx,y=V.gy+V.u*.12;K.snd('boss');for(let i=0;i<(calm?14:30);i++){const a=-Math.PI/2+(Math.random()-.5)*1.6,v=V.u*(2+Math.random()*3);K.part(G.P,{k:'drop',x:x+(Math.random()-.5)*V.u*.4,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:V.u*9,s:V.u*.03+1.5,dur:1,col:i%3?'#cfe8ff':'#ffffff'});}
    K.part(G.P,{k:'ring',x,y,s:V.u*1.2,dur:.8,col:'#e8f6ff',w:4,fl:.25});if(!calm)stg.shake=Math.max(stg.shake,.5);}

  /* ---------- положения: ленточка и бойцы ---------- */
  const SH=()=>V.u*.55;   // сдвиг на pos=1
  function heroPos(){const ov=G.over;let x=V.cx-V.u*1.0-G.shown*V.u*.2;if(ov&&!ov.win&&!ov.time){const q=Math.min(1,ov.t/.55);x+=(V.cx-x)*q*q;}return {x,y:V.gy};}   // pos>0 — всё смещается к богатырю (влево)
  function foePos(){const ov=G.over;let x=V.cx+V.u*1.0-G.shown*V.u*.2;if(ov&&ov.win&&!ov.time){const q=Math.min(1,ov.t/.55);x+=(V.cx-x)*q*q;}return {x,y:V.gy};}

  /* =================================== рисование =================================== */
  const C={};
  function draw(g,W,H,dt){if(!V)return;g.save();if(stg.shx||stg.shy)g.translate(stg.shx,stg.shy);
    drawBack(g,W,H);drawBrook(g,W,H);drawStakes(g);drawFighters(g);K.parts(g,G.P,dt);K.pops(g,G.N,dt,20);g.restore();
    drawBar(g,W,H);drawHUD(g,W,H);
    if(G.flash){g.fillStyle=rgba(G.flash.c,.18*(1-G.flash.t/.35)*(calm?.5:1));g.fillRect(0,0,W,H);}
    if(G.state==='intro')K.intro(g,W,H,Object.assign(G.intro,{title:L('Перетягивание каната','Tug of War'),lines:[L('Сегодня тянет ','Today’s rival: ')+FN[0]+'. '+L('Перетяни ленточку за свой колышек — и он в ручье!','Pull the ribbon past your stake — and into the brook he goes!'),
      L('Ритм, а не скорость: жми, когда огонёк в зелёной середине полосы. Один рывок на выдох.','Rhythm, not speed: tap when the light is in the green middle. One pull per breath.'),
      L('Соперник раздулся — «!» — сейчас дёрнет: попади в зелёное и упрись!','The rival puffs up — “!” — he’s about to yank: hit the green and hold firm!')],
      pc:[[[L('Пробел','Space'),'↑'],L('тянуть (или щелчок мышью)','pull (or click)')]],
      art:(g2,x,y,s)=>{K.art(g2,K.heroKey(),x-s*.55,y,s*.75);K.art(g2,foe,x+s*.55,y,s*.8,{flip:true});g2.strokeStyle='#c8a060';g2.lineWidth=5;g2.beginPath();g2.moveTo(x-s*.35,y+4);g2.quadraticCurveTo(x,y+14,x+s*.35,y+4);g2.stroke();ell(g2,x,y+9,5,7,'#e0332a');}}),dt);
    if(G.state==='ready'){const n=Math.ceil(2.4-G.rt),s=n>0?String(n):'';const q=(G.rt%1);if(n>0)K.txt(g,n>=3?L('Бери канат…','Grab the rope…'):n===2?L('Упрись ногами…','Dig in your heels…'):L('Вдох…','Breathe in…'),W/2,H*.3,W<380?26:32,'#fff3c8');}
    END.draw(g,W,H,dt);}

  function drawBack(g,W,H){const gy=V.gy,t=G.t,vod=foe==='vod';
    const sky=g.createLinearGradient(0,0,0,gy);if(vod){sky.addColorStop(0,'#7ab8e0');sky.addColorStop(1,'#e8f4e0');}else{sky.addColorStop(0,'#8ac0d8');sky.addColorStop(1,'#f0f0c8');}g.fillStyle=sky;g.fillRect(0,0,W,gy);
    K.glow(g,W*.5,gy*.18,Math.min(W,H)*.4,'#fff2b0',.45);
    const cl=K.cloud();for(let i=0;i<3;i++){const s=(60+i*30)*Math.min(1.5,W/600+.5),x=((t*(5+i*3)+i*W*.4)%(W+s*2))-s;g.globalAlpha=.8;g.drawImage(cl,x-s,gy*.08+i*gy*.08,s*2,s*1.1);}g.globalAlpha=1;
    // лес / камыши — три слоя
    if(!C.L||C.W!==W||C.H!==H){C.W=W;C.H=H;C.L=[];for(let j=0;j<3;j++){const p=new Path2D(),rr=mulberry(seed+j*13);p.moveTo(-10,gy+20);let x=-10;const base=gy-(vod?20:40)+j*(vod?14:22),sc=(1.4-j*.35)*Math.min(1.5,H/700+.3);
        while(x<W+20){const h=(30+rr()*50)*sc,w=(14+rr()*16)*sc;if(vod&&j===2){p.lineTo(x,base);p.lineTo(x+w*.2,base-h*.6);p.lineTo(x+w*.35,base);x+=w*.3;continue;}p.lineTo(x,base);p.lineTo(x+w*.5,base-h);p.lineTo(x+w,base);x+=w*.7;}p.lineTo(W+20,gy+20);p.closePath();C.L.push(p);}}
    const cols=vod?['#8ab0a0','#5a8a70','#3e6a4a']:['#7a9a8a','#4f7a5a','#2f5a3a'];for(let j=0;j<3;j++){g.fillStyle=cols[j];g.fill(C.L[j]);}
    if(!vod){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=W*(.15+i*.24)+Math.sin(t*.3+i)*8;const gr=g.createLinearGradient(x,0,x+W*.08,gy);gr.addColorStop(0,'rgba(255,240,180,.16)');gr.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x,0);g.lineTo(x+W*.05,0);g.lineTo(x+W*.14,gy);g.lineTo(x+W*.06,gy);g.closePath();g.fill();}g.restore();}
    else{// дальний пруд с бликами и мельница
      const py=gy-14;g.fillStyle='rgba(110,170,200,.75)';g.beginPath();g.ellipse(W*.72,py,W*.3,12,0,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,255,255,.45)';for(let i=0;i<6;i++){g.fillRect(W*.5+i*W*.07+Math.sin(t+i)*4,py-2+(i%2)*4,W*.03,1.5);}}
    // земля
    const gr=g.createLinearGradient(0,gy-10,0,H);gr.addColorStop(0,vod?'#8ab858':'#7aaa4a');gr.addColorStop(.25,'#5a8a34');gr.addColorStop(1,'#3a5a24');g.fillStyle=gr;g.fillRect(0,gy-6,W,H-gy+6);
    const rr=mulberry(seed+77);for(let i=0;i<40;i++){const x=rr()*W,y=gy+rr()*(H-gy)*.5;g.fillStyle=i%4?'rgba(40,80,20,.25)':'#ffd84a';if(i%4){g.fillRect(x,y,2,6);g.fillRect(x+3,y+1,2,5);}else{g.beginPath();g.arc(x,y,2,0,Math.PI*2);g.fill();}}
    // по краям: грибы, пни / камыши, кувшинки
    const u=V.u;if(!vod){K.art(g,'d_shroom',W*.06,gy+u*.1,u*.45);K.art(g,'d_stump',W*.94,gy+u*.05,u*.6);K.art(g,'d_bush',W*.9,gy-u*.25,u*.7);}
    else{K.art(g,'d_reeds',W*.05,gy-u*.1,u*.6);K.art(g,'d_reeds',W*.95,gy-u*.1,u*.65);}}
  function drawBrook(g,W,H){const x=V.cx,y=V.gy+V.u*.08,w=V.u*.7,h=V.u*.2;g.save();
    const gr=g.createLinearGradient(0,y-h,0,y+h);gr.addColorStop(0,'#5aa0d0');gr.addColorStop(1,'#2a6a9a');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,w,h,0,0,Math.PI*2);g.fill();
    g.strokeStyle='rgba(120,90,50,.6)';g.lineWidth=3;g.stroke();g.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<4;i++){const q=(G.ripple*.6+i/4)%1;g.globalAlpha=1-q;g.beginPath();g.ellipse(x+(i-1.5)*w*.3,y,w*.12*(1+q),h*.2*(1+q),0,0,Math.PI*2);g.strokeStyle='#fff';g.lineWidth=1.2;g.stroke();}g.globalAlpha=1;
    // камни по берегам
    for(const [dx,s] of[[-1.05,.18],[1.02,.16],[-.8,.1],[.85,.11]])ell(g,x+dx*w,y+h*.2,V.u*s,V.u*s*.6,'#9a9a9a',{hl:.4});
    if(foe==='vod')for(const dx of[-.4,.35])ell(g,x+dx*w,y-h*.1,V.u*.07,V.u*.03,'#4f9a4a',{ol:false});
    g.restore();}
  // колышки: свой (слева) и соперника (справа); ленточка должна пройти за свой
  function drawStakes(g){for(const s of[-1,1]){const x=V.cx+s*SH()*1,y=V.gy-V.u*.02;ln(g,[x,y,x,y-V.u*.42],'#6a4020',Math.max(3,V.u*.05));ell(g,x,y-V.u*.44,V.u*.05,V.u*.035,s<0?'#3a9a3a':'#c0392b');
    g.fillStyle=s<0?'#3a9a3a':'#c0392b';g.beginPath();g.moveTo(x,y-V.u*.42);g.lineTo(x+(-s)*V.u*.2,y-V.u*.36);g.lineTo(x,y-V.u*.3);g.closePath();g.fill();}}
  function drawFighters(g){const u=V.u,h=heroPos(),f=foePos(),lean=.16+G.strain*.08+Math.max(0,G.shown)*.05,fl=.14+G.foeAnim*.12+Math.max(0,-G.shown)*.05,ov=G.over;
    const hs=u*1.45,fs=u*1.45;
    // богатырь (смотрит вправо — к сопернику), наклон назад
    const hRot=ov&&!ov.win&&!ov.time?Math.min(1.2,ov.t*2)*.9:-lean,hy=h.y-hs*.42-(ov&&!ov.win&&!ov.time&&ov.t>.55?-u*.2:0);
    const fRot=ov&&ov.win&&!ov.time?-Math.min(1.2,ov.t*2)*.9:fl,fy=f.y-fs*.42;
    // руки: точки хвата
    const hh={x:h.x+Math.cos(-hRot)*hs*.28,y:hy+hs*.05},fh={x:f.x-Math.cos(fRot)*fs*.3,y:fy+fs*.08};
    // тени
    ell(g,h.x,h.y,hs*.3,hs*.06,'rgba(20,30,10,.3)',{ol:false,flat:true});ell(g,f.x,f.y,fs*.3,fs*.06,'rgba(20,30,10,.3)',{ol:false,flat:true});
    g.save();g.translate(h.x,h.y);g.rotate(hRot);K.art(g,K.heroKey(),0,-hs*.42,hs,{flip:true});g.restore();
    const puff=1+G.foeAnim*.12*Math.sin(G.t*20)*.5+G.foeAnim*.08;g.save();g.translate(f.x,f.y);g.rotate(fRot);g.scale(puff,puff);K.art(g,foe,0,-fs*.42,fs,{flip:true});g.restore();
    // канат: провис, витой
    rope(g,hh,fh);
    // кулаки на канате
    ell(g,hh.x,hh.y,u*.06,u*.055,'#f4c9a3');ell(g,hh.x-u*.09,hh.y+u*.01,u*.055,u*.05,'#f4c9a3');ell(g,fh.x,fh.y,u*.07,u*.06,foe==='vod'?'#5ab0a0':'#7a5a30');
    // пот / «!» у соперника
    if(G.foeAnim>0&&!ov){const a=Math.min(1,G.foeAnim*3);g.globalAlpha=a;K.txt(g,'!',f.x+fs*.05,fy-fs*.62,u*.5,'#ff5a3a',{ol:'#4a1006'});g.globalAlpha=1;if(Math.random()<.2&&foe==='lesh')K.part(G.P,{k:'leaf',x:f.x+(Math.random()-.5)*fs*.4,y:fy-fs*.4,vx:(Math.random()-.5)*40,vy:20,g:40,s:u*.05,dur:1.4,col:Math.random()<.5?'#6ab04a':'#c8a040',vr:3});}
    if(G.strain>.5&&Math.random()<.12)K.part(G.P,{k:'drop',x:h.x+hs*.1,y:hy-hs*.35,vx:-u*.4,vy:-u*.6,g:u*5,s:Math.max(1.5,u*.025),dur:.6,col:'#bfe8ff'});}
  function rope(g,a,b){const sag=V.u*(.12+.06*(1-G.strain)),mx=(a.x+b.x)/2,my=(a.y+b.y)/2+sag;g.save();g.lineCap='round';
    const path=()=>{g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo(mx,my,b.x,b.y);};
    g.strokeStyle='#5a3a14';g.lineWidth=V.u*.07+2;path();g.stroke();g.strokeStyle='#d8b070';g.lineWidth=V.u*.07;path();g.stroke();
    g.setLineDash([V.u*.05,V.u*.05]);g.lineDashOffset=-G.shown*V.u*.5;g.strokeStyle='rgba(120,80,30,.55)';g.lineWidth=V.u*.035;path();g.stroke();g.setLineDash([]);
    // ленточка: на середине каната (точка кривой при t=0,5 со сдвигом)
    const cxr=V.cx-G.shown*SH(),tt=Math.max(.05,Math.min(.95,(cxr-a.x)/Math.max(1,b.x-a.x))),rx=(1-tt)*(1-tt)*a.x+2*(1-tt)*tt*mx+tt*tt*b.x,ry=(1-tt)*(1-tt)*a.y+2*(1-tt)*tt*my+tt*tt*b.y;
    const sw=Math.sin(G.t*5)*.2;g.translate(rx,ry);g.fillStyle='#e0332a';g.beginPath();g.moveTo(0,0);g.lineTo(-V.u*.08,V.u*.28);g.lineTo(0,V.u*.22);g.lineTo(V.u*.08+sw*V.u*.1,V.u*.3);g.closePath();g.fill();g.strokeStyle='#7a1010';g.lineWidth=1.5;g.stroke();
    ell(g,0,0,V.u*.06,V.u*.06,'#ff4a3a',{hl:.5});g.restore();}

  /* ---------- полоса «тяни на выдохе» ---------- */
  function drawBar(g,W,H){if(G.state==='intro')return;const bw=Math.min(W-40,560),bh=34,bx=(W-bw)/2,by=H-(V.port?118:96);
    K.plate(g,bx-12,by-34,bw+24,bh+64,{r:16});
    const zx=(x0,x1,c)=>{g.fillStyle=c;g.fillRect(bx+bw*x0,by,bw*(x1-x0),bh);};const gg=KN.G*(calm?1.4:1),yy=KN.Y*(calm?1.2:1);
    g.save();rrect(g,bx,by,bw,bh,10);g.clip();zx(0,1,'#b8402a');zx(.5-yy,.5+yy,'#e8b030');zx(.5-gg,.5+gg,'#5ab83a');zx(.5-.045*(calm?1.4:1),.5+.045*(calm?1.4:1),'#9aee6a');
    g.fillStyle='rgba(255,255,255,.18)';g.fillRect(bx,by,bw,bh*.4);g.restore();rrect(g,bx,by,bw,bh,10);g.lineWidth=2.5;g.strokeStyle='#3a1a08';g.stroke();
    // отметки нажатий
    for(const q of G.taps){const x=bx+bw*q.x;g.globalAlpha=1-q.t/.8;g.strokeStyle=q.z==='red'||q.z==='spam'?'#ffb0a0':'#fff';g.lineWidth=3;g.beginPath();g.moveTo(x,by-4);g.lineTo(x,by+bh+4);g.stroke();g.globalAlpha=1;}
    // огонёк
    const lx=bx+bw*knLight(G.state==='go'?G.run:G.t*.6,per),ly=by+bh/2,z=knZone(knLight(G.state==='go'?G.run:G.t*.6,per),calm);K.glow(g,lx,ly,bh*1.3,z==='green'||z==='perf'?'#c8ff9a':'#ffe27a',.9);
    g.beginPath();g.arc(lx,ly,bh*.32,0,Math.PI*2);g.fillStyle='#fffbe0';g.fill();g.lineWidth=2;g.strokeStyle='#7a4a10';g.stroke();
    const lab=G.state!=='go'?L('тяни на выдохе','pull as you breathe out'):z==='green'||z==='perf'?L('ВЫДОХ — тяни!','BREATHE OUT — pull!'):L('вдох…','breathe in…');
    K.txt(g,lab,W/2,by-16,W<380?16:18,z==='green'||z==='perf'?'#c8ff9a':'#fff3c8',{mw:bw});
    if(pc)K.keycap(g,bx+bw-24,by-16,L('Пробел','Space'),22);
    if(G.hint&&G.state==='go'){const q=(G.t*1.6)%1;K.hand(g,W/2+bw*.08,by+bh+26,40,q<.3);}}
  function drawHUD(g,W,H){const top=8;
    const left=Math.max(0,KN.T-(G.state==='go'?G.run:G.state==='over'?KN.T-G.over.left:0)),pw=130;K.plate(g,10,top,pw,46);K.txt(g,L('Время','Time'),22,top+15,12,'#e6c98a',{al:'left',ol:false,sh:false,w:700});K.txt(g,Math.ceil(left)+L(' с',' s'),pw-4,top+26,24,left<6?'#ffb0a0':'#ffd24a',{al:'right'});
    const vs=FN[0],ww=Math.min(W-150-70,Math.max(140,K.tw(g,vs,16)+60));const vx=pw+18;K.plate(g,vx,top,ww,46);K.txt(g,L('Соперник','Rival'),vx+12,top+15,12,'#e6c98a',{al:'left',ol:false,sh:false,w:700});K.txt(g,vs,vx+12,top+32,16,'#fff3c8',{al:'left',mw:ww-24});
    // шкала положения ленточки
    const sw=Math.min(W-40,420),sx=(W-sw)/2,sy=top+60;rrect(g,sx,sy,sw,14,7);g.fillStyle='rgba(30,16,6,.6)';g.fill();
    const mid=sx+sw/2,px=mid-Math.max(-1,Math.min(1,G.shown))*sw/2;g.fillStyle=G.shown>0?'#5ab83a':'#c0392b';rrect(g,Math.min(mid,px),sy+2,Math.max(2,Math.abs(px-mid)),10,5);g.fill();
    K.txt(g,L('ты','you'),sx-2,sy+7,12,'#c8ff9a',{al:'right',ol:'#1a3a10',lw:3});K.txt(g,'',sx+sw+2,sy+7,12,'#ffb0a0',{al:'left'});ell(g,px,sy+7,7,7,'#e0332a',{hl:.5});
    if(G.msg&&!END.on()){const a=G.msg.t<.12?G.msg.t/.12:G.msg.t>1.15?Math.max(0,1-(G.msg.t-1.15)/.35):1;g.globalAlpha=a;K.txt(g,G.msg.s,W/2,V.gy-V.u*1.85,W<380?22:28,G.msg.col,{mw:W-30});g.globalAlpha=1;}}
}

/* ---------- значок: канат с ленточкой ---------- */
if(typeof art==='function')art('zbb_i7',64,g=>{g.lineCap='round';g.strokeStyle='#5a3a14';g.lineWidth=9;g.beginPath();g.moveTo(-28,-10);g.quadraticCurveTo(0,10,28,-10);g.stroke();g.strokeStyle='#d8b070';g.lineWidth=6;g.beginPath();g.moveTo(-28,-10);g.quadraticCurveTo(0,10,28,-10);g.stroke();
  g.setLineDash([4,4]);g.strokeStyle='rgba(120,80,30,.6)';g.lineWidth=3;g.beginPath();g.moveTo(-28,-10);g.quadraticCurveTo(0,10,28,-10);g.stroke();g.setLineDash([]);
  poly(g,[0,0,-6,20,0,16,6,22],'#e0332a');ell(g,0,0,5,5,'#ff4a3a',{hl:.5});ell(g,-27,-10,6,6,'#f4c9a3');ell(g,27,-10,6,6,'#7a5a30');});

zbbK.reg({id:'kanat',num:7,n:zabN('Перетягивание каната','Tug of War'),icon:'zbb_i7',kind:'week',en:true,open:()=>true,
  run:knRun,sim:knSim,bot:knSim,_kn:{KN,knLight,knZone,knHeaves,knFoe}});
})();
