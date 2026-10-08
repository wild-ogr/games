'use strict';
/* RB:MGA №5 «Чистка улова и кот Васька» (js/mg-chist.js). План — 09-minigames.md (таблица, №5), 00-plan.md §5.
   На столе у избы — разделочная доска. Веди пальцем по рыбе — чешуя летит, рыба блестит; чистая сама уезжает в миску, из ведра — следующая.
   Васька время от времени крадётся по столу к ведру — коснись кота, он шуганётся. Не успел — утащит рыбку (−1, Петрович смеётся).
   Мягкая полоска «пока жена не позвала» (45 с, спокойный режим 60 с, кот медленнее). Всё одним пальцем; промах ничего не отнимает.
   Итог: host.done({score: чистых − утащено, tier, rec, extra:{clean, stolen, shoo, price:5, txt}}) — «+5 % к цене улова» начисляет оболочка MG0.
   Рыбы — из последнего улова (o.ctx.fish = [id…]) или по зерну дня из прудовых/речных. Бот — та же модель (время на рыбу и окна кота). */
(function(){
const HINT=0;
const POOL=['karas','okun','plotva','lesh','lin','karasz','golavl','yaz','plotva','karas'];
const T=a=>typeof LANG!=='undefined'&&LANG==='en'?a[1]:a[0];
function plan(o){const R=MAK.R((o.seed^0x7a11c3)>>>0),D=o.calm?60:45,sneak=o.calm?5.5:3.6,cats=[];let t=6+R()*2;while(t<D-3){cats.push({t,r:R()});t+=(o.calm?12:9)+R()*(o.calm?4:4);}
  const fish=[];const ctx=o.ctx&&Array.isArray(o.ctx.fish)?o.ctx.fish.filter(id=>typeof FISH!=='undefined'&&FISH[id]):[];for(let i=0;i<14;i++)fish.push(ctx[i]||POOL[(R()*POOL.length)|0]);
  return {D,sneak,cats,fish};}
function outcome(clean,stolen){const sc=Math.max(0,clean-stolen),tier=sc>=9?3:sc>=4?2:sc>=1?1:0;return {sc,tier};}
function bot(sk,o){const p=plan(o),Rb=MAK.R((o.seed*13+3)>>>0),A={bad:[10,.4],mid:[6.5,.7],good:[3.9,.95]}[sk]||[6.5,.7];let t=0,clean=0,stolen=0,shoo=0,ci=0;
  while(t<p.D){let need=A[0]*(.85+Rb()*.3);while(need>0&&t<p.D){t+=.1;need-=.1;const c=p.cats[ci];if(c&&t>=c.t){ci++;if(Rb()<A[1]){shoo++;t+=.6;}else stolen++;}}if(need<=0){clean++;t+=.45;}}
  const r=outcome(clean,stolen);return {score:r.sc,tier:r.tier,extra:{clean,stolen,shoo,price:r.tier?5:0}};}

function run(host,o){
  if(o.bot){const r=bot(o.bot,o);host.done({score:r.score,tier:r.tier});return;} // авто-игрок оболочки (mgBot): та же модель, без рисования
  const P=MAK.P(MAK.tod()),tn=P.tint,pl=plan(o),best=MAK.best(o),first=MAK.first('chist');
  let A=null,petr=null,cat=null,bucket=null,bowl=null,board=null;
  const st={ph:'intro',t:0,gt:0,clean:0,stolen:0,shoo:0,parts:[],flies:[],leaves:[],say:{tx:T(['Чистим улов! Веди ножом по рыбе — от хвоста к голове. А за Васькой глаз да глаз!','Let’s clean the catch! Scrape along the fish. And keep an eye on Vasya!']),t:0,d:6},
    petr:{pose:'talk',pt:0},fin:0,fi:0,f:null,down:false,lx:0,ly:0,ddist:0,ci:0,cat:{k:'sit',t:0},cs:null,hand:first?1:0,inBowl:[],bump:0};
  const LL=MAK.cv(host,L=>{layout(L);if(st.f)mkFish(st.f.id,true);});
  function layout(L){const W=L.W,H=L.H,u=L.u;
    if(L.land){A={x:W*.16,y:H*.5,w:W*.68,h:H*.48};petr={x:W*.1,yb:H*.72,s:H*.38};cat={x:W*.9,yb:H*.56,s:H*.12};}
    else{A={x:W*.02,y:H*.5,w:W*.96,h:H*.46};petr={x:W*.2,yb:H*.56,s:H*.24};cat={x:W*.84,yb:H*.52,s:H*.08};}
    board={cx:A.x+A.w*.48,cy:A.y+A.h*.6,w:A.w*.82,h:A.h*.5};bucket={x:A.x+A.w*.86,y:A.y+A.h*.3,s:Math.min(u*15,A.w*.16)};bowl={x:A.x+A.w*.13,y:A.y+A.h*.3,s:Math.min(u*15,A.w*.17)};}
  layout(LL);const ui=MAK.ui(host);
  if(host.amb)host.amb('yard',MAK.tod()); // RB:MGPC звуки природы: двор, время суток как на рисунке
  /* ---------- рыба на доске: грязная «чешуя» поверх, стираем пальцем ---------- */
  function fishGeo(id){const f=FISH[id]||FISH.karas,sh=(typeof SHAPES!=='undefined'&&SHAPES[f.lk[0]])||[.3],L=Math.min(board.w*.78,LL.u*(LL.land?62:78)),h=sh[0]*L/2;
    return {L,h,x:board.cx+L*.04,y:board.cy-LL.u*.5,ex:board.cx-L*.06,rx:L*.4,ry:h*.92};}
  function mkFish(id,keep){const gm=fishGeo(id),d=LL.d,c=document.createElement('canvas'),bw=gm.L*1.3,bh=gm.h*3;c.width=Math.ceil(bw*d);c.height=Math.ceil(bh*d);const g=c.getContext('2d');g.scale(d,d);
    const ox=gm.x-bw/2,oy=gm.y-bh/2,R=MAK.R(id.length*31+st.fi);g.save();g.translate(-ox,-oy);g.beginPath();g.ellipse(gm.ex,gm.y,gm.rx,gm.ry,0,0,7);g.clip();
    g.fillStyle='rgba(96,104,80,.62)';g.fillRect(gm.ex-gm.rx,gm.y-gm.ry,gm.rx*2,gm.ry*2);
    const sc=Math.max(5,gm.L*.035);g.lineWidth=Math.max(1,sc*.18);for(let yy=gm.y-gm.ry;yy<gm.y+gm.ry;yy+=sc*.62)for(let xx=gm.ex-gm.rx+((yy/sc|0)%2)*sc*.5;xx<gm.ex+gm.rx;xx+=sc){g.strokeStyle='rgba(230,236,226,'+(.35+R()*.25)+')';g.beginPath();g.arc(xx,yy,sc*.55,-1.3,1.3);g.stroke();
      g.fillStyle='rgba(60,70,50,.18)';g.beginPath();g.arc(xx-sc*.1,yy,sc*.35,-1.2,1.2);g.fill();}
    for(let i=0;i<8;i++){g.fillStyle='rgba(70,80,50,.35)';g.beginPath();g.ellipse(gm.ex+(R()-.5)*gm.rx*1.6,gm.y+(R()-.5)*gm.ry*1.4,gm.rx*(.1+R()*.15),gm.ry*(.15+R()*.2),R()*3,0,7);g.fill();}
    g.restore();
    const cells=[];const nx=16,ny=6;for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const x=gm.ex-gm.rx+(i+.5)*gm.rx*2/nx,y=gm.y-gm.ry+(j+.5)*gm.ry*2/ny;if(((x-gm.ex)/gm.rx)**2+((y-gm.y)/gm.ry)**2<.92)cells.push({x,y,c:0});}
    if(keep&&st.f){st.f.gm=gm;st.f.ov=c;st.f.ox=ox;st.f.oy=oy;st.f.cells=cells;st.f.k=0;return;}
    st.f={id,gm,ov:c,ox,oy,cells,k:0,in:0,done:0,t:0};}
  function nextFish(){st.fi++;mkFish(pl.fish[st.fi%pl.fish.length]);}
  function scrub(x0,y0,x1,y1){const f=st.f;if(!f||f.done||f.in<1)return;const u=LL.u,r=Math.max(15,u*4.4)*(o.calm?1.2:1),g=f.ov.getContext('2d');g.save();g.setTransform(LL.d,0,0,LL.d,-f.ox*LL.d,-f.oy*LL.d);g.globalCompositeOperation='destination-out';g.globalAlpha=.5;
    const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/(r*.4)));let hit=0;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;g.beginPath();g.arc(x,y,r,0,7);g.fill();
      for(const c of f.cells)if(c.c<2&&st.t-(c.tl||-9)>.3&&Math.hypot(c.x-x,c.y-y)<r*1.05){c.c++;c.tl=st.t;hit++;}}g.restore();
    if(hit){f.k=f.cells.reduce((a,c)=>a+c.c,0)/(2*f.cells.length);st.hand=0;if(Math.random()<.9)MAK.burst(st.parts,x1,y1,{n:o.calm?1:2+hit,col:['#e8eef2','#c8d4da','#ffffff','#b8c8c0'],sp:180,g:520,s:LL.u*.7,d:.55,a0:-Math.PI*.9,arc:Math.PI*.8});
      st.ddist+=Math.hypot(x1-x0,y1-y0);if(st.ddist>LL.u*9){st.ddist=0;MAK.snd('click');}}
    if(f.k>=.88)doneFish();}
  function doneFish(){const f=st.f;if(f.done)return;f.done=1;st.clean++;MAK.snd('coin');MAK.buzz(15,o);const gm=f.gm,id=f.id;
    MAK.burst(st.parts,gm.x,gm.y,{n:o.calm?4:14,col:['#fff','#ffd27a','#bfe6ff'],k:'star',sp:220,g:200,s:LL.u*1.2,d:.8});MAK.pop(st.parts,gm.x,gm.y-gm.h*1.6,'+1',Math.max(22,LL.u*6),'#fff4c2');
    MAK.fly(st.flies,{x0:gm.x,y0:gm.y,x1:bowl.x,y1:bowl.y-bowl.s*.35,d:o.calm?.8:.65,h:LL.u*16,draw:(g,x,y,k)=>{g.save();g.translate(x,y);g.rotate(-k*.6);try{drawFish(g,FISH[id].lk,0,0,gm.L*(1-k*.6));}catch(e){}g.restore();},end:()=>{st.inBowl.push(id);st.bump=1;}});
    if(st.clean===1||st.clean%3===0){st.say={tx:T([['Блестит! Хоть на выставку.','Shiny! Fit for a show.'],['Ловко у тебя выходит!','You’re a natural!'],['Вот это хозяйка будет рада!','The missus will be pleased!']][(st.clean/3|0)%3]),t:0,d:2.2};st.petr={pose:'point',pt:0};}
    st.nf=o.calm?.65:.45;}
  /* ---------- кот ---------- */
  function catPath(){const u=LL.u;return {x0:LL.W+u*8,x1:bucket.x+bucket.s*.55,y:bucket.y+u*.5};}
  function catStart(){st.cs={ph:'sneak',t:0,d:pl.sneak};st.cat={k:'gone',t:0};if(!o.calm)MAK.snd('meow');}
  function catPos(){const c=st.cs,p=catPath();if(!c)return null;let k=0;if(c.ph==='sneak')k=MAK.ease.out(Math.min(1,c.t/c.d));else if(c.ph==='grab')k=1;else k=Math.max(0,1-c.t/.7);return {x:MAK.lerp(p.x0,p.x1,k),y:p.y};}
  function shoo(){const c=st.cs;if(!c||c.ph!=='sneak')return false;st.shoo++;c.ph='run';c.t=0;c.fish=null;MAK.snd('no');MAK.buzz(25,o);st.petr={pose:'point',pt:0};
    st.say={tx:T([['Брысь, разбойник!','Shoo, you rascal!'],['Васька, а ну кыш!','Vasya, scram!'],['Ишь, хитрый какой!','Sly one, aren’t you!']][st.shoo%3]),t:0,d:1.8};const p=catPos();if(p)MAK.burst(st.parts,p.x,p.y-LL.u*4,{n:o.calm?2:6,col:'#fff',k:'star',sp:160,g:100,s:LL.u,d:.5});return true;}
  function catTick(dt){const c=st.cs;if(st.ph==='play'&&!c&&st.ci<pl.cats.length&&st.gt>=pl.cats[st.ci].t){st.ci++;catStart();}
    if(!c)return;c.t+=dt;if(c.ph==='sneak'&&c.t>=c.d){c.ph='grab';c.t=0;}
    else if(c.ph==='grab'&&c.t>=.5){c.ph='run';c.t=0;st.stolen++;c.fish=pl.fish[(st.fi+3)%pl.fish.length];MAK.snd('meow');st.petr={pose:'cheer',pt:0};
      st.say={tx:T([['Утащил-таки! Ну артист…','He got one! What an artist…'],['Эх, Васька, твоя доля.','Oh well, that’s your share, Vasya.']][st.stolen%2]),t:0,d:2.2};}
    else if(c.ph==='run'&&c.t>=.75){st.cs=null;st.cat={k:c.fish?'happy':'alarm',t:0};}}
  /* ---------- касания: на кота — шугнуть, на рыбе — чистить ---------- */
  const pos=ev=>{const r=LL.c.getBoundingClientRect();return [ev.clientX-r.left,ev.clientY-r.top];};
  LL.c.addEventListener('pointerdown',ev=>{ev.preventDefault();if(st.ph!=='play'||(ev.pointerType==='mouse'&&ev.button>0))return;const [x,y]=pos(ev),cp=catPos(),u=LL.u;
    if(onCat(x,y)){shoo();return;}
    st.down=true;st.lx=x;st.ly=y;try{LL.c.setPointerCapture(ev.pointerId);}catch(e){}scrub(x,y,x,y);});
  /* RB:MGPC мышь: движение без кнопки только наводит (курсор-рука на коте, нож над рыбой), отпустил за холстом — не залипает */
  const ms={x:-1e4,y:-1e4,in:0};
  LL.c.addEventListener('pointermove',ev=>{const [x,y]=pos(ev);if(ev.pointerType==='mouse'){ms.x=x;ms.y=y;ms.in=1;}if(!st.down||st.ph!=='play')return;if(ev.pointerType==='mouse'&&!(ev.buttons&1)){st.down=false;return;}scrub(st.lx,st.ly,x,y);st.lx=x;st.ly=y;});
  const up=()=>{st.down=false;};LL.c.addEventListener('pointerup',up);LL.c.addEventListener('pointercancel',up);LL.c.addEventListener('lostpointercapture',up);
  LL.c.addEventListener('pointerleave',()=>{ms.in=0;MAK.cur(LL.c,false);});
  function onCat(x,y){const cp=catPos();return !!(cp&&st.cs.ph==='sneak'&&Math.hypot(x-cp.x,y-(cp.y-cat.s*.35))<Math.max(48,cat.s*1.3));}
  function onFish(x,y){const f=st.f;if(!f||f.done||f.in<1)return false;const gm=f.gm;return ((x-gm.ex)/(gm.rx*1.1))**2+((y-gm.y)/(gm.ry*1.4))**2<1;}
  /* RB:MGPC клавиши: ← → — нож ходит по рыбе змейкой (держи — скоблит), ↑ ↓ — ряд выше/ниже, пробел — шугнуть Ваську */
  const kb={x:0,y:0,row:0,t:-9,f:null,lock:0};
  function kRows(){const f=st.f,r=Math.max(15,LL.u*4.4)*(o.calm?1.2:1);return Math.max(2,Math.ceil(f.gm.ry*1.7/(r*1.15))+1);}
  function kRowY(row){const gm=st.f.gm,n=kRows();return gm.y-gm.ry*.82+gm.ry*1.64*row/(n-1);}
  function kHalf(y){const gm=st.f.gm,k=Math.max(0,1-((y-gm.y)/gm.ry)**2);return gm.rx*Math.max(.25,Math.sqrt(k))*.9;}
  function kMove(dx,drow){const f=st.f;if(!f||f.done||f.in<1)return;const gm=f.gm,n=kRows();
    if(kb.f!==f){kb.f=f;kb.row=0;kb.y=kRowY(0);kb.x=gm.ex+kHalf(kb.y);kb.dir=-1;}
    const x0=kb.x,y0=kb.y;if(drow){kb.row=Math.max(0,Math.min(n-1,kb.row+drow));kb.y=kRowY(kb.row);kb.x=Math.max(gm.ex-kHalf(kb.y),Math.min(gm.ex+kHalf(kb.y),kb.x));}
    else{const stp=Math.max(15,LL.u*4.4)*.9,h=kHalf(kb.y);let x=kb.x+dx*stp;
      // дошёл до края — как каретка: следующий ряд с другого края (держишь стрелку — нож проходит всю рыбу)
      if(x<gm.ex-h-1||x>gm.ex+h+1){if(Math.abs(kb.x-(gm.ex+dx*h))>2)x=gm.ex+dx*h;else{kb.row=(kb.row+1)%n;kb.y=kRowY(kb.row);kb.x=gm.ex-dx*kHalf(kb.y);kb.t=st.t;return;}}kb.x=x;}
    kb.t=st.t;scrub(x0,y0,kb.x,kb.y);}
  if(host.keys)host.keys(k=>{if(st.ph!=='play')return false;
    if(k==='ArrowLeft'||k==='ArrowRight'){kMove(k==='ArrowLeft'?-1:1,0);return true;}
    if(k==='ArrowUp'||k==='ArrowDown'){kMove(0,k==='ArrowUp'?-1:1);return true;}
    if(k===' '||k==='Spacebar'){if(st.t<kb.lock)return true;if(!shoo())kb.lock=st.t+(o.calm?.4:.8);return true;}
    return false;});
  /* ---------- рисунок стола (кэш) ---------- */
  let surf=null;
  function paintSurf(){const L=LL,d=L.d,c=document.createElement('canvas');c.width=Math.round(L.W*d);c.height=Math.round(L.H*d);const g=c.getContext('2d');g.scale(d,d);const u=L.u,R=MAK.R(17);
    const fy=A.y+A.h*.9,ins=A.w*.05;g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(A.x+A.w/2,A.y+A.h,A.w*.52,u*2,0,0,7);g.fill();
    const top=new Path2D();top.moveTo(A.x+ins,A.y);top.lineTo(A.x+A.w-ins,A.y);top.lineTo(A.x+A.w,fy);top.lineTo(A.x,fy);top.closePath();g.save();g.clip(top);
    for(let i=0;i<5;i++){const y0=A.y+(fy-A.y)*i/5,y1=A.y+(fy-A.y)*(i+1)/5,gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,tn(i%2?'#a87a4a':'#b88a58'));gr.addColorStop(1,tn(i%2?'#906438':'#9a6e42'));g.fillStyle=gr;g.fillRect(A.x,y0,A.w,y1-y0);
      g.fillStyle='rgba(60,30,10,.35)';g.fillRect(A.x,y1-u*.35,A.w,u*.35);g.strokeStyle='rgba(90,50,20,.16)';g.lineWidth=1;for(let k=0;k<3;k++){g.beginPath();const yy=y0+(y1-y0)*(.25+k*.25);g.moveTo(A.x,yy);for(let x=A.x;x<A.x+A.w;x+=u*7)g.quadraticCurveTo(x+u*3.5,yy+(R()-.5)*u,x+u*7,yy);g.stroke();}}
    g.restore();const eg=g.createLinearGradient(0,fy,0,A.y+A.h);eg.addColorStop(0,tn('#7a5030'));eg.addColorStop(1,tn('#4e3218'));g.fillStyle=eg;g.fillRect(A.x,fy,A.w,A.y+A.h-fy);
    // клеёнка в клетку под доской
    g.save();g.clip(top);g.globalAlpha=.85;const ox=board.cx-board.w*.62,oy=board.cy-board.h*.75,ow=board.w*1.24,oh=board.h*1.5;g.fillStyle='#f2efe6';g.fillRect(ox,oy,ow,oh);g.fillStyle='rgba(60,120,190,.35)';const cs=u*3.2;for(let x=ox;x<ox+ow;x+=cs*2)g.fillRect(x,oy,cs,oh);for(let y=oy;y<oy+oh;y+=cs*2)g.fillRect(ox,y,ow,cs);g.restore();
    // доска
    const bx=board.cx-board.w/2,by=board.cy-board.h/2;g.fillStyle='rgba(0,0,0,.25)';rr(g,bx+u,by+u*1.6,board.w,board.h,u*2);g.fill();g.fillStyle=tn('#8a5a2a');rr(g,bx,by+u*1.2,board.w,board.h,u*2);g.fill();
    const bgd=g.createLinearGradient(bx,by,bx+board.w,by+board.h);bgd.addColorStop(0,tn('#e8c08a'));bgd.addColorStop(1,tn('#c8965a'));g.fillStyle=bgd;rr(g,bx,by,board.w,board.h,u*2);g.fill();
    g.strokeStyle='rgba(140,90,40,.25)';g.lineWidth=1;for(let k=0;k<7;k++){g.beginPath();const yy=by+board.h*(.1+k*.13);g.moveTo(bx+u,yy);g.bezierCurveTo(bx+board.w*.3,yy+u,bx+board.w*.6,yy-u,bx+board.w-u,yy);g.stroke();}
    g.fillStyle='rgba(120,60,40,.15)';g.beginPath();g.ellipse(board.cx+board.w*.3,board.cy+board.h*.2,u*4,u*1.5,.3,0,7);g.fill();
    g.fillStyle=tn('#5a3a1a');g.beginPath();g.arc(bx+board.w-u*3,by+u*3,u*1,0,7);g.fill();
    surf=c;}
  function drawBucket(g,t){const {x,y,s}=bucket,w=s*.9,h=s*.8,left=Math.max(0,pl.fish.length-st.fi);const bg=g.createLinearGradient(x-w/2,0,x+w/2,0);bg.addColorStop(0,tn('#7a838a'));bg.addColorStop(.5,tn('#cfd6da'));bg.addColorStop(1,tn('#6a7378'));
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y,w*.55,s*.08,0,0,7);g.fill();
    for(let i=0;i<3;i++){g.save();g.translate(x+(i-1)*w*.22,y-h-s*.02);g.rotate(-.5+i*.5+Math.sin(t*2+i)*.05);try{drawFish(g,FISH[pl.fish[(st.fi+1+i)%pl.fish.length]].lk,0,-s*.12,s*.6);}catch(e){}g.restore();}
    g.fillStyle=bg;g.beginPath();g.moveTo(x-w/2,y-h);g.lineTo(x+w/2,y-h);g.lineTo(x+w*.38,y);g.lineTo(x-w*.38,y);g.closePath();g.fill();
    g.strokeStyle=tn('#5a6268');g.lineWidth=s*.03;g.beginPath();g.ellipse(x,y-h,w/2,s*.08,0,0,Math.PI);g.stroke();g.beginPath();g.arc(x,y-h,w*.5,Math.PI*1.1,Math.PI*1.9);g.stroke();}
  function drawBowl(g){const {x,y,s}=bowl,w=s*1.05,h=s*.4,b=st.bump>0?1+.08*Math.sin(st.bump*Math.PI):1;g.save();g.translate(x,y);g.scale(b,b);
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,0,w*.5,s*.07,0,0,7);g.fill();
    for(let i=0;i<Math.min(6,st.inBowl.length);i++){g.save();g.translate((i%3-1)*w*.22,-h-s*.03-(i/3|0)*s*.06);g.rotate(-.3+(i%3)*.3);try{drawFish(g,FISH[st.inBowl[i]].lk,0,0,s*.55);}catch(e){}g.restore();}
    g.fillStyle='#f4f2ea';g.beginPath();g.moveTo(-w/2,-h);g.quadraticCurveTo(-w*.45,0,0,0);g.quadraticCurveTo(w*.45,0,w/2,-h);g.closePath();g.fill();g.fillStyle='#2f68b0';g.fillRect(-w/2,-h-s*.02,w,s*.04);
    g.fillStyle='#d84a3a';for(let i=-1;i<=1;i++){g.beginPath();g.arc(i*w*.22,-h*.5,s*.04,0,7);g.fill();}g.restore();}
  function drawKnife(g,x,y){const u=LL.u;g.save();g.translate(x,y);g.rotate(-.5);g.fillStyle='#dfe6ea';g.beginPath();g.moveTo(-u*1.2,0);g.lineTo(u*1.2,0);g.lineTo(u*1.2,-u*5);g.quadraticCurveTo(0,-u*7,-u*1.2,-u*5);g.closePath();g.fill();
    g.strokeStyle='#8a969c';g.lineWidth=1;for(let i=0;i<5;i++){g.beginPath();g.moveTo(-u*1,-u*(1+i*.8));g.lineTo(u*1,-u*(1+i*.8));g.stroke();}g.fillStyle='#6a3a1a';rr(g,-u*.9,0,u*1.8,u*6,u*.6);g.fill();g.fillStyle='#c8c0b0';g.beginPath();g.arc(0,u*1.5,u*.35,0,7);g.arc(0,u*4,u*.35,0,7);g.fill();g.restore();}
  let res=null,finBtn=null;
  function finish(){if(st.ph!=='play')return;st.ph='end';st.fin=0;st.down=false;st.wife=.01;MAK.snd('phone');const r=outcome(st.clean,st.stolen);res={score:r.sc,tier:r.tier,rec:r.sc>best&&r.sc>0};
    st.say={tx:st.clean>=4?T(['Всё, несу! Жарёха будет — пальчики оближешь.','Coming! It’ll be a feast.']):T(['Иду-иду! Остальное завтра дочистим.','Coming! We’ll finish tomorrow.']),t:0,d:3};st.petr={pose:st.clean>=4?'cheer':'talk',pt:0};
    if(st.cs&&st.cs.ph==="sneak"){st.cs.ph="run";st.cs.t=0;}}
  function drawFin(g,dt){if(st.closed)return;st.fin+=dt;const L=LL,W=L.W,H=L.H,u=L.u,k=Math.max(0,(st.fin-1.9)/.5);if(k<=0)return;
    if(!finBtn&&k>=1){finBtn=1;const b=ui.next(()=>{MAK.snd('tap');b.remove();ui.clear();st.closed=1;st.say.t=99;try{frame(0);}catch(e){}host.done({score:res.score,tier:res.tier,rec:res.rec,extra:{line:T(['Почищено: ','Cleaned: '])+st.clean+(st.stolen?T([' · Васька утащил: ',' · Vasya took: '])+st.stolen:'')+T([' · шуганули: ',' · shooed: '])+st.shoo}});});
      if(!o.calm)MAK.burst(st.parts,W/2,H*.42,{n:res.tier*12,col:['#ffd27a','#ff8f4f','#6be3b0','#fff'],k:'star',sp:320,g:420,s:6,d:1.2});MAK.snd(res.tier>=2?'catch':'coin');}
    const e=MAK.ease.out(Math.min(1,k));g.save();g.globalAlpha=e*.62;g.fillStyle='#0a1218';g.fillRect(0,0,W,H);g.restore();
    const cw=Math.min(W-32,440),ch=Math.min(H*.52,u*(L.land?62:74)),cx=W/2,cy=H*.44-(1-e)*u*6;g.save();g.globalAlpha=e;
    g.fillStyle='rgba(16,26,36,.86)';rr(g,cx-cw/2,cy-ch/2,cw,ch,24);g.fill();g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1;g.stroke();
    const sr=Math.min(u*6,30);MAK.stars(g,cx,cy-ch/2+sr*1.6,sr,res.tier,Math.min(1,(st.fin-2.2)*1.6),st.fin);
    const fl=Math.min(u*22,cw*.36);for(let i=0;i<Math.min(3,st.inBowl.length);i++){g.save();g.translate(cx-fl*.5+i*fl*.5,cy-ch*.04+i%2*u*1.5);g.rotate(-.15+i*.15);try{drawFish(g,FISH[st.inBowl[i]].lk,0,0,fl);}catch(e2){}g.restore();}
    if(st.shoo||st.stolen){MAK.cat(g,cx+cw*.36,cy+ch*.08,Math.min(u*12,ch*.22),{t:st.t,k:st.stolen?'happy':'alarm'});}
    const px=Math.max(24,Math.min(34,u*7.5));MAK.txt(g,o.train?T(['Тренировка','Practice']):T(['Почищено: ','Cleaned: '])+st.clean,cx,cy+ch*.22,px,{col:'#ffd27a'});
    MAK.txt(g,(st.stolen?T(['Васька утащил: ','Vasya took: '])+st.stolen+' · ':'')+T(['шуганули: ','shooed: '])+st.shoo+(res.rec?T([' · рекорд!',' · record!']):''),cx,cy+ch*.22+px*1.25,Math.max(17,px*.6),{col:'rgba(255,255,255,.88)',ol:false});
    g.restore();}
  function frame(dt){const g=LL.g,L=LL,W=L.W,H=L.H,u=L.u;st.t+=dt;const t=st.t;
    g.drawImage(MAK.yard(L,P,{ground:L.land?H*.62:H*.46,hz:L.land?H*.4:H*.3}),0,0,W,H);if(!surf)paintSurf();
    if(!o.calm){MAK.birds(g,L,t,3);MAK.leaves(st.leaves,L,dt,g,false);}MAK.wife(g,st.wife||0,t,tn);if(st.wife)st.wife=Math.min(1,st.wife+dt*1.5);
    st.petr.pt+=dt;if(st.petr.pose!=='idle'&&st.petr.pt>(st.petr.pose==='talk'?st.say.d:1.6))st.petr={pose:'idle',pt:0};
    const cp=catPos();MAK.petr(g,petr.x,petr.yb,petr.s,{t,tn,pose:st.petr.pose,look:cp?1:st.f?Math.max(-1,Math.min(1,(st.f.gm.x-petr.x)/(W*.3))):0});
    st.cat.t+=dt;if((st.cat.k==='happy'&&st.cat.t>2)||(st.cat.k==='alarm'&&st.cat.t>1.2))st.cat={k:'sit',t:0};
    if(!st.cs)MAK.cat(g,cat.x,cat.yb,cat.s,{t,tn,k:st.cat.k==='gone'?'sit':st.cat.k,look:st.f?(board.cx-cat.x)/(W*.3):0});
    g.drawImage(surf,0,0,W,H);drawBowl(g);if(st.bump>0)st.bump=Math.max(0,st.bump-dt*4);drawBucket(g,t);
    if(st.ph==='play'){st.gt+=dt;if(st.nf>0){st.nf-=dt;if(st.nf<=0)nextFish();}if(st.gt>=pl.D)finish();}
    catTick(st.ph==='end'&&!st.cs?0:dt);
    // рыба
    const f=st.f;if(f){f.t+=dt;if(f.in<1)f.in=Math.min(1,f.in+dt*(o.calm?2:2.8));const gm=f.gm,e=MAK.ease.out(f.in),sx=MAK.lerp(bucket.x,gm.x,e),sy=MAK.lerp(bucket.y-bucket.s,gm.y,e)-Math.sin(f.in*Math.PI)*u*8;
      if(!f.done){g.save();g.translate(sx-gm.x,sy-gm.y);g.fillStyle='rgba(60,30,10,.22)';g.beginPath();g.ellipse(gm.x,gm.y+gm.h*1.05,gm.L*.42,gm.h*.25,0,0,7);g.fill();
        try{drawFish(g,FISH[f.id].lk,gm.x,gm.y,gm.L);}catch(e2){}g.drawImage(f.ov,f.ox,f.oy,f.ov.width/L.d,f.ov.height/L.d);
        // полоска чистоты над рыбой
        const bw=gm.L*.5,bx=gm.x-bw/2,by=gm.y-gm.h*1.55;g.fillStyle='rgba(16,26,36,.55)';rr(g,bx-3,by-3,bw+6,u*1.6+6,u*1.2);g.fill();g.fillStyle='#6be3b0';rr(g,bx,by,Math.max(u*1.6,bw*Math.min(1,f.k/.88)),u*1.6,u*.8);g.fill();g.restore();}}
    // кот на столе
    if(st.cs){const p=catPos(),c=st.cs;MAK.catSide(g,p.x,p.y,cat.s*1.15,{t,tn,k:c.ph==='run'?'run':c.ph==='grab'?'grab':'sneak',dir:c.ph==='run'?1:-1,fish:c.fish&&FISH[c.fish]?FISH[c.fish].lk:null});
      if(c.ph==='sneak'){const k=c.t/c.d;g.strokeStyle='rgba(255,210,122,'+(.5+.4*Math.sin(t*8))+')';g.lineWidth=3;g.beginPath();g.arc(p.x,p.y-cat.s*.4,cat.s*(.95+.08*Math.sin(t*8)),0,7);g.stroke();
        if(k>.15)MAK.txt(g,'!',p.x,p.y-cat.s*1.45,Math.max(22,u*6),{col:'#ffd27a'});}}
    MAK.flies(g,st.flies,dt);MAK.parts(g,st.parts,dt);
    if(st.down&&st.ph==='play')drawKnife(g,st.lx,st.ly);
    else if(st.ph==='play'&&f&&!f.done&&kb.f===f&&st.t-kb.t<.6)drawKnife(g,kb.x,kb.y);
    if(st.ph==='play'&&ms.in&&!st.down){const oc=onCat(ms.x,ms.y),of=!oc&&onFish(ms.x,ms.y);MAK.cur(LL.c,oc||of);if(of&&st.t-kb.t>=.6){g.save();g.globalAlpha=.55;drawKnife(g,ms.x,ms.y);g.restore();}}
    else if(st.ph!=='play')MAK.cur(LL.c,false);
    if(st.ph==='play'&&host.pc&&st.cs&&st.cs.ph==='sneak'){const p=catPos();MAK.keycap(g,p.x+cat.s*1.05,p.y-cat.s*1.45,T(['Пробел','Space']),Math.max(24,Math.min(32,u*5)));}
    if(st.hand&&st.ph==='play'&&f&&f.in>=1){const k=(t*.6)%1,hx=MAK.lerp(f.gm.ex+f.gm.rx*.7,f.gm.ex-f.gm.rx*.6,MAK.ease.io(k));MAK.hand(g,hx,f.gm.y,u,.1);}
    st.say.t+=dt;if(st.say.tx&&st.say.t<st.say.d){const a=Math.min(1,st.say.t*4,(st.say.d-st.say.t)*3);MAK.bubble(g,petr.x+petr.s*.05,petr.yb-petr.s*1.02,st.say.tx,L,{a,ax:.25,who:T(['Петрович','Petrovich'])});}
    if(st.wife&&MAK._win&&st.fin<1.9)MAK.bubble(g,MAK._win.x,MAK._win.y-MAK._win.h*.5,T(['Неси рыбу, сковородка греется!','Bring the fish, the pan is hot!']),L,{a:Math.min(1,st.wife*2),ax:.2,who:T(['Жена','Wife'])});
    MAK.hud(g,L,null,T(['Почищено: ','Cleaned: '])+st.clean,{bump:st.bump,drawIc:(gg,x,y,r)=>{try{drawFish(gg,FISH.karas.lk,x+r*.15,y,r*1.75);}catch(e){}}},st.gt/pl.D,st.ph==='intro'?null:T(['Пока жена не позвала','Until wife calls']));
    if(st.ph==='end')drawFin(g,dt);}
  host.el.__t={st,shoo,scrub,fish:()=>st.f&&st.f.in>=1&&!st.f.done?st.f.gm:null,cat:()=>st.cs&&st.cs.ph==='sneak'?catPos():null,skip(){st.gt=pl.D;}};
  mkFish(pl.fish[0]);st.f.in=1;
  ui.intro({title:T(['Чистка улова','Cleaning the Catch']),sub:T(['и кот Васька','and Vasya the cat']),art:null,train:o.train,
    lines:host.pc?[T(['<b>Зажми мышку и води по рыбе</b> — чешуя полетит. Чистая рыба сама уедет в миску.','<b>Hold the mouse button and drag over the fish</b> — scales fly off. A clean fish goes to the bowl.']),T(['Васька крадётся к ведру — <b>щёлкни по коту</b>, и он шуганётся.','Vasya sneaks to the bucket — <b>click the cat</b> to shoo him.']),
      T(['<b>Клавиши:</b> ','<b>Keys:</b> '])+MAK.kc('←')+MAK.kc('→')+T([' — скоблить, ',' — scrape, '])+MAK.kc(T(['Пробел','Space']))+T([' — шугнуть кота',' — shoo the cat'])]
     :[T(['<b>Веди пальцем по рыбе</b> — чешуя полетит. Чистая рыба сама уедет в миску.','<b>Swipe along the fish</b> — scales fly off. A clean fish goes to the bowl.']),T(['Васька крадётся к ведру — <b>коснись кота</b>, и он шуганётся.','Vasya sneaks to the bucket — <b>tap the cat</b> to shoo him.'])],btn:T(['Чистить','Start'])})
    .then(()=>{st.ph='play';st.gt=0;st.petr={pose:'talk',pt:0};
      if(host.kbd)host.kbd(T(['Мышь или ','Mouse or '])+MAK.kc('←')+MAK.kc('→')+T([' — чистить, ',' — scrape, '])+MAK.kc(T(['Пробел','Space']))+T([' — шугнуть кота',' — shoo the cat']),7);});
  {const im=ui.el.querySelector('.mak-hd');if(im){const c=document.createElement('canvas');c.width=c.height=152;c.style.cssText='width:76px;height:76px;flex:none;margin:-10px 12px -6px -6px';const gg=c.getContext('2d');gg.scale(2,2);try{drawFish(gg,FISH.okun.lk,40,34,62);}catch(e){}MAK.cat(gg,58,74,30,{k:'sit',t:0,look:-.6});im.insertBefore(c,im.firstChild);}}
  MAK.loop(host,frame);
}
MG_REG({id:'chist',n:{ru:'Чистка с Васькой',en:'Cleaning with Vaska'},icon:'<path class="d" d="M3 12c3-4 9-4 13 0-4 4-10 4-13 0z"/><path d="M16 12l4-3v6zM8 11.5h.01M14 5l-3 5"/>',kind:'daily',run,bot:(lv)=>bot(lv,{seed:1,day:0})});
})();
