'use strict';
/* RB:MGA №2 «Наживка дня» (js/mg-bait.js). План — rybak-boost/09-minigames.md «2. Наживка дня», 00-plan.md §5.
   Одно правило на четыре «шкурки» по дню недели: тапай, где шевелится/блестит/подошло — наживка сама прыгает в банку.
   Пн/Чт — мотыль из ила (таз), Вт/Пт — кукуруза с початков, Ср/Сб — тесто на доске, Вс — живец сачком у мостков.
   У кого открыт только Пруд — вместо кукурузы тесто, вместо живца мотыль (то, что берёт на пруду).
   Мягкая полоска «пока жена не позвала» (45 с, спокойный режим 58 с), без секунд; промах ничего не отнимает.
   Награда — НАЖИВКА, не монеты: host.done({score:поймано, tier, rec, extra:{bait:{<id>:n}, x2:'bait'}}); n = 0,65·поймано (3…15).
   Зерно дня o.seed — одинаковое расписание у всех. Бот: MG_REG(...).bot('bad'|'mid'|'good', o) — та же модель расписания. */
(function(){
const N=24,HINT=.45;
const KD={
  blood:{art:'blood',n:['Мотыль','Bloodworm'],gen:['мотыля','bloodworms'],w:['Таз с илом','A basin of silt'],
    say:['Мотыля намой — карась его любит. Где пузырики в иле — там и он!','Wash out bloodworms — crucians love them. Bubbles in the silt mean a worm!'],
    rule:['Где в иле <b>пузырики</b> — там вылезет <b>мотыль</b>. Коснись его — и он в банке.','Where the silt <b>bubbles</b>, a <b>bloodworm</b> pops up. Tap it into the jar.']},
  corn:{art:'corn',n:['Кукуруза','Corn'],gen:['кукурузы','corn'],w:['Початки на столе','Cobs on the table'],
    say:['Лущи кукурузу! Какое зёрнышко блестит — то спелое, его и бери.','Shell the corn! A shiny kernel is a ripe one — take it.'],
    rule:['Какое зёрнышко <b>заблестело</b> — коснись, оно прыгнет в миску.','When a kernel <b>sparkles</b>, tap it into the bowl.']},
  dough:{art:'dough',n:['Тесто','Dough'],gen:['теста','dough'],w:['Тесто на доске','Dough on the board'],
    say:['Тесто подходит! Как комочек вспухнет — катай шарик, пока не опал.','The dough is rising! When a lump puffs up, roll a ball before it sinks.'],
    rule:['Комочек <b>вспух</b> — коснись, и шарик скатится в банку.','A lump <b>puffs up</b> — tap it to roll a ball into the tin.']},
  live:{art:'live',n:['Живец','Live bait'],gen:['живца','live bait'],w:['Мелководье у мостков','Shallows by the jetty'],
    say:['Живца сачком лови — мальки у мостков так и шныряют. Щука спасибо скажет!','Net some live bait — the fry dart around the jetty. The pike will thank you!'],
    rule:['Малёк <b>проплывает</b> — коснись, и сачок его подхватит.','A fry <b>swims by</b> — tap and the net scoops it.']}};
const CHEER=[['Во, пошло дело!','Now we’re talking!'],['Ай да глаз!','Sharp eyes!'],['Молодец, внучок!','Well done, kiddo!'],['Ещё чуток — и на неделю хватит!','A bit more and we’re set for the week!'],['Вот это я понимаю!','That’s the spirit!']];
const T=(a)=>typeof LANG!=='undefined'&&LANG==='en'?a[1]:a[0];
function kindOf(o){const wd=MAK.wd(o);let k=['live','blood','corn','dough','blood','corn','dough'][wd];const q=/[?&]bait=(blood|corn|dough|live)/.exec(location.search);if(q)k=q[1];
  let river=true;try{river=!!(S.open&&S.open[1]);}catch(e){}if(!river&&!q){if(k==='corn')k='dough';if(k==='live')k='blood';}return k;}
/* расписание дня: одинаково у всех (o.seed) */
function plan(o){const R=MAK.R((o.seed^0x9e3779b9)>>>0),D=o.calm?58:45,life=o.calm?1.9:1.25,list=[];
  for(let i=0;i<N;i++){const t=1.8+(D-4.6)*(i+.15+R()*.7)/N;list.push({t,x:R(),y:R(),dir:R()<.5?-1:1,r:R()});}
  return {D,life,list,cross:o.calm?3.8:2.7};}
function outcome(c){const tier=c>=18?3:c>=10?2:c>=4?1:0,n=c?Math.max(3,Math.min(15,Math.round(c*.65))):0;return {tier,n};}
/* авто-игрок: та же модель окон, реакция и внимание по уровню */
function bot(sk,o){const p=plan(o),k=kindOf(o),Rb=MAK.R((o.seed*7+13)>>>0),A={bad:[.24,1.3],mid:[.52,.85],good:[.95,.5]}[sk]||[.6,.8];let free=0,c=0;
  for(const e of p.list){const win=HINT+(k==='live'?p.cross:p.life);if(Rb()>A[0])continue;const react=Math.max(.2,A[1]+(Rb()-.5)*.6),at=Math.max(e.t+react,free);
    if(at<e.t+win){c++;free=at+.25;}}
  const r=outcome(c);return {score:c,tier:r.tier,extra:{bait:r.n?{[k]:r.n}:{}}};}

function run(host,o){
  if(o.bot){const r=bot(o.bot,o);host.done({score:r.score,tier:r.tier});return;} // авто-игрок оболочки (mgBot): та же модель, без рисования
  const kind=kindOf(o),K=KD[kind],P=MAK.P(MAK.tod()),tn=P.tint,pl=plan(o),best=MAK.best(o),first=MAK.first('nazh');
  let A=null,surf=null,jar=null,cat=null,petr=null;
  /* награда наживкой — по договору MG0: give() кладёт в S.bait, val — «стоимость» в долях Р для дневного потолка, line — строка итогов */
  const giveX=n=>{if(!n||o.train)return {};const b=(typeof BAIT!=='undefined'&&BAIT[kind])||{p:20,pack:10},R=o.R||30,add=m=>{m=Math.max(0,Math.round(m));if(!m)return;S.bait[kind]=(S.bait[kind]||0)+m;try{save();}catch(e){}};
    const n0=res&&res.x2?n/2:n; // удвоенное за ролик — сверх дневного потолка
    return {val:n0*b.p/b.pack/R,line:'<b>'+T(K.n)+' +'+n+'</b>'+(res&&res.x2?' '+T(['(удвоено)','(doubled)']):'')+' — '+T(['на рыбалку','for fishing']),give:()=>add(n),giveCapped:f=>add(n*f)};};
  const st={ph:'intro',t:0,gt:0,c:0,next:0,act:[],parts:[],flies:[],leaves:[],say:{tx:T(K.say),t:0,d:6},bump:0,hand:first?1:0,cat:{k:'sit',t:0,pt:0},petr:{pose:'talk',pt:0},fin:0,wife:0,eaten:{},streak:0,jarN:0,net:null,caus:0};
  const LL=MAK.cv(host,L=>{layout(L);});
  function layout(L){const W=L.W,H=L.H,u=L.u;
    if(kind==='live'){const hz=H*(L.land?.36:.3),gy=H*(L.land?.84:.85);A={x:0,y:hz+(gy-hz)*.28,w:W,h:(gy-hz)*.62,hz,gy};
      petr={x:L.land?W*.2:W*.24,yb:L.land?H*.58:H*.53,s:L.land?H*.26:H*.17};A.px=petr.x-u*(L.land?5:6.5);A.py=petr.yb+u*.6;
      cat={x:L.land?W*.66:W*.6,yb:H*(L.land?.97:.975),s:H*(L.land?.13:.09)};jar={x:L.land?W*.8:W*.84,y:H*.975,s:Math.min(u*(L.land?20:22),W*.2)};surf=null;return;}
    if(L.land){A={x:W*.3,y:H*.5,w:W*.44,h:H*.44};jar={x:W*.82,y:H*.9,s:Math.min(u*20,W*.1)};petr={x:W*.225,yb:H*.69,s:H*.36};cat={x:W*.9,yb:H*.64,s:H*.13};}
    else{A={x:W*.03,y:H*.55,w:W*.76,h:H*.37};jar={x:W*.885,y:H*.9,s:Math.min(u*24,W*.22)};petr={x:W*.22,yb:H*.57,s:H*.26};cat={x:W*.87,yb:H*.6,s:H*.095};}
    surf=null;}
  layout(LL);
  const ui=MAK.ui(host),img=MAK.art(K.art);
  if(host.amb)host.amb(kind==='live'?'shore':'yard',MAK.tod()); // RB:MGPC звуки природы по нарисованному месту и времени суток
  /* ---------- геометрия целей ---------- */
  function basin(){const rx=A.w/2,ry=A.h*.36,dz=A.h*.17;return {cx:A.x+A.w/2,cy:A.y+ry+A.h*.03,rx,ry,dz};}
  function board(){return {cx:A.x+A.w*.46,cy:A.y+A.h*.5,rx:A.w*.39,ry:A.h*.31};}
  function corn(){const cobs=[],n=3;for(let i=0;i<n;i++){const k=.84+i*.08,ch=A.h*.19*k,cy=A.y+A.h*(.17+i*.26),w=A.w*.7*k,x0=A.x+A.w*.45-w/2+(i%2?A.w*.03:-A.w*.02);cobs.push({cy,x0,x1:x0+w,ch});}return cobs;}
  function posOf(e){const L=LL;if(kind==='blood'){const B=basin(),a=e.x*Math.PI*2,r=Math.sqrt(.12+e.y*.88)*.78;return {x:B.cx+Math.cos(a)*B.rx*r,y:B.cy+B.ry*.12+Math.sin(a)*B.ry*.72*r};}
    if(kind==='corn'){const cb=corn(),ci=Math.min(2,e.y*3|0),cob=cb[ci],cols=11;let col=Math.min(cols-1,e.x*cols|0),row=e.r*3|0;
      for(let k=0;k<cols*3&&st.eaten[ci+'_'+col+'_'+row];k++){col=(col+1)%cols;if(col===0)row=(row+1)%3;}e.key=ci+'_'+col+'_'+row;e.ci=ci;e.col=col;e.row=row;
      const kw=(cob.x1-cob.x0)/(cols+1.6);return {x:cob.x0+kw*(1.3+col),y:cob.cy+(row-1)*cob.ch*.28};}
    if(kind==='dough'){const D=board(),a=e.x*Math.PI*2,r=Math.sqrt(.1+e.y*.9)*.74;return {x:D.cx+Math.cos(a)*D.rx*r,y:D.cy+Math.sin(a)*D.ry*r};}
    return {x:0,y:A.y+A.h*(.08+e.y*.84)};}
  function spawn(e){const p=posOf(e);for(const a of st.act){if(kind!=='live'&&Math.hypot(a.x-p.x,a.y-p.y)<LL.u*11){p.x+=LL.u*12*(p.x<A.x+A.w/2?1:-1);}}
    const it={e,x:p.x,y:p.y,t:0,life:pl.life,dir:e.dir,ph:e.r*7,done:0};if(kind==='live'){it.life=pl.cross;it.x=e.dir>0?A.x-LL.u*6:A.x+A.w+LL.u*6;it.x0=it.x;it.x1=e.dir>0?A.x+A.w+LL.u*6:A.x-LL.u*6;}
    st.act.push(it);if(kind==='blood'&&!o.calm)MAK.snd('nib');}
  function posNow(it){if(kind!=='live')return {x:it.x,y:it.y};const k=Math.max(0,(it.t-HINT)/it.life);return {x:MAK.lerp(it.x0,it.x1,k),y:it.y+Math.sin(it.t*3+it.ph)*LL.u*1.2};}
  /* ---------- касание ---------- */
  function tap(px,py){if(st.ph!=='play')return;let bestI=-1,bd=1e9;const rad=tapRad();
    for(let i=0;i<st.act.length;i++){const it=st.act[i];if(it.done)continue;const p=posNow(it);const d=Math.hypot(p.x-px,p.y-py);if(d<rad&&d<bd){bd=d;bestI=i;}}
    if(bestI<0){miss(px,py);return;}catchIt(st.act[bestI]);}
  function miss(px,py){if(px<A.x||px>A.x+A.w||py<A.y||py>A.y+A.h)return;
    if(kind==='blood')MAK.burst(st.parts,px,py,{n:6,col:['#4a3a24','#6a5636'],sp:90,g:420,s:3,d:.4});
    else if(kind==='live')MAK.burst(st.parts,px,py,{n:1,col:'rgba(255,255,255,.7)',k:'ring',sp:0,g:0,s:LL.u*2,d:.6});
    else if(kind==='dough')MAK.burst(st.parts,px,py,{n:6,col:'#fffaf0',sp:60,g:-20,s:2.5,d:.6});
    else MAK.burst(st.parts,px,py,{n:3,col:'#c89a5a',sp:60,s:2,d:.3});}
  function catchIt(it){it.done=1;const p=posNow(it);st.c++;st.streak++;st.hand=0;
    if(kind==='corn')st.eaten[it.e.key]=1;
    const u=LL.u;MAK.snd(kind==='live'?'splash':kind==='blood'?'plop':'tap',.6);MAK.buzz(12,o);
    if(kind==='blood')MAK.burst(st.parts,p.x,p.y,{n:o.calm?4:9,col:['#4a3a24','#7a6040','#a8c8d0'],sp:150,g:500,s:3.2,d:.5});
    if(kind==='live'){st.net={x:p.x,y:p.y,t:0};MAK.burst(st.parts,p.x,p.y,{n:o.calm?5:12,col:'rgba(220,240,255,.9)',k:'drop',sp:200,g:600,s:4,d:.6,a0:-Math.PI,arc:Math.PI});}
    if(kind==='corn')MAK.burst(st.parts,p.x,p.y,{n:o.calm?3:7,col:'#fff2a0',k:'star',sp:120,g:60,s:5,d:.5});
    if(kind==='dough')MAK.burst(st.parts,p.x,p.y,{n:o.calm?4:8,col:'#ffffff',sp:90,g:-30,s:3,d:.7});
    MAK.pop(st.parts,p.x,p.y-u*5,'+1',Math.max(20,u*5.5),'#fff4c2');
    const fishLk=it.e.r<.5?'ukleyka':it.e.r<.8?'plotva':'peskar';
    MAK.fly(st.flies,{x0:p.x,y0:p.y,x1:jar.x,y1:jar.y-jar.s*.55,d:o.calm?.75:.6,h:LL.u*(kind==='live'?24:16),draw:(g,x,y,k)=>drawItem(g,x,y,1-k*.35,k,fishLk),end:()=>{st.jarN++;st.bump=1;MAK.snd('click');}});
    if(st.c===1||st.c%5===0){st.say={tx:T(CHEER[(st.c/5|0)%CHEER.length]),t:0,d:2.4};st.petr={pose:st.c%10===0?'cheer':'point',pt:0};}
    if(st.streak>=4&&st.cat.k==='sit'){st.cat={k:'happy',t:0};if(!o.calm)MAK.snd('meow');}else if(Math.random()<.35&&st.cat.k==='sit')st.cat={k:'paw',t:0,pt:0,dir:p.x>cat.x?1:-1};}
  /* касания: pointerdown по холсту */
  LL.c.addEventListener('pointerdown',ev=>{if(ev.pointerType==='mouse'&&ev.button>0)return;const r=LL.c.getBoundingClientRect();tap(ev.clientX-r.left,ev.clientY-r.top);ev.preventDefault();});
  /* RB:MGPC мышь: наведение (рука-курсор и светлое кольцо над целью); движение без кнопки игру не трогает */
  const ms={x:-1e4,y:-1e4,in:0};
  LL.c.addEventListener('pointermove',ev=>{if(ev.pointerType!=='mouse')return;const r=LL.c.getBoundingClientRect();ms.x=ev.clientX-r.left;ms.y=ev.clientY-r.top;ms.in=1;});
  LL.c.addEventListener('pointerleave',()=>{ms.in=0;MAK.cur(LL.c,false);});
  function tapRad(){return Math.max(40,LL.u*(kind==='live'?11:9.5))*(o.calm?1.15:1);}
  function hovIt(){if(!ms.in||st.ph!=='play')return null;let b=null,bd=tapRad();for(const it of st.act){if(it.done||it.t<HINT)continue;const p=posNow(it),d=Math.hypot(p.x-ms.x,p.y-ms.y);if(d<bd){bd=d;b=it;}}return b;}
  /* RB:MGPC клавиши: над каждой целью — цифра (только ПК); нажал цифру — цель твоя. Пустое нажатие — короткая заминка (не барабанить) */
  let klock=0;
  function okIt(it){return !it.done&&it.t>=HINT&&it.t<=HINT+it.life;}
  if(host.keys)host.keys(k=>{if(st.ph!=='play'||!/^[1-9]$/.test(k))return false;if(st.t<klock)return true;const it=st.act.find(a=>a.kk===+k&&okIt(a));
    if(it)catchIt(it);else{klock=st.t+(o.calm?.2:.35);MAK.snd('tap',.25);}return true;});
  /* ---------- рисунок: поверхность (кэш) ---------- */
  function paintSurf(){const L=LL,d=L.d,c=document.createElement('canvas');c.width=Math.round(L.W*d);c.height=Math.round(L.H*d);const g=c.getContext('2d');g.scale(d,d);const u=L.u,R=MAK.R(91);
    const sh=(x,y,w,h)=>{g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x,y,w,h,0,0,7);g.fill();};
    if(kind==='blood'){const B=basin(),cx=B.cx,cy=B.cy,rx=B.rx,ry=B.ry,dz=B.dz;sh(cx+u,cy+dz+ry*.55,rx*1.02,ry*.5);
      // стенка таза (вид чуть сверху)
      const wall=g.createLinearGradient(cx-rx,0,cx+rx,0);wall.addColorStop(0,tn('#6d767c'));wall.addColorStop(.35,tn('#c9d0d4'));wall.addColorStop(.55,tn('#e8eef0'));wall.addColorStop(1,tn('#5d666c'));
      g.fillStyle=wall;g.beginPath();g.moveTo(cx-rx,cy);g.lineTo(cx-rx*.93,cy+dz);g.ellipse(cx,cy+dz,rx*.93,ry*.93,0,Math.PI,0,true);g.lineTo(cx+rx,cy);g.ellipse(cx,cy,rx,ry,0,0,Math.PI,false);g.fill();
      g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=u*.5;for(const k of [.35,.7]){g.beginPath();g.ellipse(cx,cy+dz*k,rx*(1-.07*k),ry*(1-.07*k),0,.15,Math.PI-.15);g.stroke();}
      // обод и внутренняя стенка
      const rim=g.createLinearGradient(cx-rx,0,cx+rx,0);rim.addColorStop(0,tn('#8d969c'));rim.addColorStop(.3,tn('#eef2f4'));rim.addColorStop(.7,tn('#b3bcc2'));rim.addColorStop(1,tn('#7d868c'));
      g.fillStyle=rim;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();
      g.fillStyle=tn('#6a7378');g.beginPath();g.ellipse(cx,cy,rx*.955,ry*.93,0,0,7);g.fill();
      const sg=g.createRadialGradient(cx-rx*.2,cy-ry*.1,u,cx,cy+ry*.1,rx);sg.addColorStop(0,tn('#6a5a3e'));sg.addColorStop(.75,tn('#4a3d28'));sg.addColorStop(1,tn('#30281a'));
      g.fillStyle=sg;g.beginPath();g.ellipse(cx,cy+ry*.1,rx*.93,ry*.82,0,0,7);g.fill();
      g.save();g.beginPath();g.ellipse(cx,cy+ry*.1,rx*.93,ry*.82,0,0,7);g.clip();
      for(let i=0;i<70;i++){const a=R()*7,r=Math.sqrt(R())*.95,x=cx+Math.cos(a)*rx*r,y=cy+ry*.1+Math.sin(a)*ry*.8*r;g.fillStyle=tn(['#5e4e34','#3c3020','#6e5a3a'][i%3]);g.globalAlpha=.35;g.beginPath();g.ellipse(x,y,u*(1.5+R()*3),u*(.6+R()*1),R()*.6-.3,0,7);g.fill();}
      g.globalAlpha=1;for(let i=0;i<4;i++){const x=cx+(R()-.5)*rx*1.3,y=cy+ry*.1+(R()-.5)*ry*.9;g.fillStyle=tn('#8a8478');g.beginPath();g.ellipse(x,y,u*1.4,u*.8,R()*3,0,7);g.fill();g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(x-u*.4,y-u*.25,u*.5,u*.22,0,0,7);g.fill();}
      g.strokeStyle=tn('#6a4a2a');g.lineWidth=u*.6;g.lineCap='round';g.beginPath();g.moveTo(cx+rx*.35,cy+ry*.5);g.lineTo(cx+rx*.65,cy+ry*.25);g.stroke();
      // тонкая плёнка воды: отражение неба
      const wg=g.createLinearGradient(0,cy-ry,0,cy+ry);wg.addColorStop(0,rgba(P.bot,.35));wg.addColorStop(.5,'rgba(190,220,235,.06)');wg.addColorStop(1,'rgba(190,220,235,.14)');g.fillStyle=wg;g.fillRect(cx-rx,cy-ry,rx*2,ry*2);
      g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.ellipse(cx-rx*.32,cy-ry*.3,rx*.36,ry*.07,-.08,0,7);g.fill();g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.ellipse(cx+rx*.2,cy-ry*.4,rx*.18,ry*.04,-.05,0,7);g.fill();g.restore();
      g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=u*.5;g.beginPath();g.ellipse(cx,cy,rx*.985,ry*.97,0,Math.PI*1.08,Math.PI*1.55);g.stroke();
      // сито у таза
      const sx=A.x+A.w*.86,sy=A.y+A.h*.06;g.fillStyle=tn('#8a6a3a');g.beginPath();g.ellipse(sx,sy,u*7,u*3,-.2,0,7);g.fill();g.fillStyle=tn('#c8c0a8');g.beginPath();g.ellipse(sx,sy,u*6,u*2.4,-.2,0,7);g.fill();
      g.strokeStyle='rgba(90,80,60,.45)';g.lineWidth=.8;for(let i=-5;i<=5;i++){g.beginPath();g.moveTo(sx+i*u*1.1-u*2,sy-u*2.4);g.lineTo(sx+i*u*1.1+u*2,sy+u*2.4);g.stroke();}}
    else if(kind==='corn'||kind==='dough'){const fy=A.y+A.h*.86,ins=A.w*.07;sh(A.x+A.w/2+u,A.y+A.h*1.01,A.w*.54,A.h*.07);
      // стол из досок в перспективе: столешница-трапеция и торец
      const top=new Path2D();top.moveTo(A.x+ins,A.y);top.lineTo(A.x+A.w-ins,A.y);top.lineTo(A.x+A.w,fy);top.lineTo(A.x,fy);top.closePath();
      g.save();g.clip(top);const n=5;for(let i=0;i<n;i++){const y0=A.y+(fy-A.y)*i/n,y1=A.y+(fy-A.y)*(i+1)/n,gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,tn(i%2?'#b88450':'#c8925c'));gr.addColorStop(1,tn(i%2?'#a06e40':'#ac7848'));g.fillStyle=gr;g.fillRect(A.x,y0,A.w,y1-y0);
        g.fillStyle='rgba(60,30,10,.35)';g.fillRect(A.x,y1-u*.35,A.w,u*.35);
        g.strokeStyle='rgba(90,50,20,.18)';g.lineWidth=1;for(let k=0;k<3;k++){g.beginPath();const yy=y0+(y1-y0)*(.25+k*.25);g.moveTo(A.x,yy);for(let x=A.x;x<A.x+A.w;x+=u*7)g.quadraticCurveTo(x+u*3.5,yy+(R()-.5)*u*1.1,x+u*7,yy);g.stroke();}
        g.fillStyle='rgba(60,30,10,.5)';g.beginPath();g.arc(A.x+A.w*(.15+R()*.7),(y0+y1)/2,u*.45,0,7);g.fill();}
      const lg=g.createLinearGradient(0,A.y,0,fy);lg.addColorStop(0,'rgba(255,255,255,.12)');lg.addColorStop(1,'rgba(0,0,0,.08)');g.fillStyle=lg;g.fill(top);g.restore();
      const eg=g.createLinearGradient(0,fy,0,A.y+A.h);eg.addColorStop(0,tn('#8a5a30'));eg.addColorStop(1,tn('#5e3a1c'));g.fillStyle=eg;g.fillRect(A.x,fy,A.w,A.y+A.h-fy);g.fillStyle='rgba(255,230,190,.25)';g.fillRect(A.x,fy,A.w,u*.4);
      if(kind==='dough'){const D=board(),cx=D.cx,cy=D.cy,rx=D.rx,ry=D.ry;sh(cx+u,cy+u*2.5,rx*1.02,ry*1.02);
        g.fillStyle=tn('#8a5a2a');g.beginPath();g.ellipse(cx,cy+u*1.8,rx,ry,0,0,7);g.fill();g.fillRect(cx+rx*.96,cy-u*1.6+u*1.8,A.w*.09,u*3.2);
        g.fillStyle=tn('#c8945a');rr(g,cx+rx*.96,cy-u*1.6,A.w*.09,u*3.2,u*1.6);g.fill();g.fillStyle=tn('#6a4020');g.beginPath();g.arc(cx+rx*.96+A.w*.065,cy,u*.7,0,7);g.fill();
        const bg=g.createRadialGradient(cx-rx*.25,cy-ry*.3,u,cx,cy,rx);bg.addColorStop(0,tn('#e8be86'));bg.addColorStop(1,tn('#c08a50'));g.fillStyle=bg;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill();
        g.strokeStyle='rgba(120,70,30,.35)';g.lineWidth=1;for(let i=1;i<4;i++){g.beginPath();g.ellipse(cx,cy,rx*i/4,ry*i/4,0,0,7);g.stroke();}
        // мука: мягкие пятна и крупинки
        for(let i=0;i<6;i++){const a=R()*7,r=R()*.6,x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r,fr=rx*(.18+R()*.15);const fg=g.createRadialGradient(x,y,1,x,y,fr);fg.addColorStop(0,'rgba(255,255,250,.28)');fg.addColorStop(1,'rgba(255,255,250,0)');g.fillStyle=fg;g.fillRect(x-fr,y-fr,fr*2,fr*2);}
        g.fillStyle='#fffdf6';for(let i=0;i<70;i++){const a=R()*7,r=Math.sqrt(R())*.92;g.globalAlpha=.3+R()*.5;g.beginPath();g.arc(cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r,u*(.2+R()*.35),0,7);g.fill();}g.globalAlpha=1;
        // скалка на столе (лежит у дальнего края)
        g.save();g.translate(A.x+A.w*.62,A.y+A.h*.07);g.rotate(-.05);g.fillStyle='rgba(0,0,0,.2)';rr(g,-u*13,-u*.6,u*26,u*3.2,u*1.6);g.fill();const pg=g.createLinearGradient(0,-u*1.6,0,u*1.6);pg.addColorStop(0,tn('#f0cc94'));pg.addColorStop(1,tn('#b8844a'));g.fillStyle=pg;rr(g,-u*12,-u*1.6,u*24,u*3.2,u*1.6);g.fill();
        g.fillStyle=tn('#9a6a3a');rr(g,-u*16.5,-u*.8,u*5,u*1.6,u*.8);g.fill();rr(g,u*11.5,-u*.8,u*5,u*1.6,u*.8);g.fill();g.restore();
        // мешочек муки
        const mx=A.x+A.w*.13,my=A.y+A.h*.1;g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(mx+u,my+u*5,u*5,u*1.2,0,0,7);g.fill();g.fillStyle=tn('#ece2c8');g.beginPath();g.moveTo(mx-u*4.4,my+u*5);g.quadraticCurveTo(mx-u*5.6,my-u*2,mx-u*1.6,my-u*4);g.lineTo(mx+u*1.6,my-u*4);g.quadraticCurveTo(mx+u*5.6,my-u*2,mx+u*4.4,my+u*5);g.closePath();g.fill();
        g.fillStyle='#fffdf6';g.beginPath();g.ellipse(mx,my-u*3.6,u*1.8,u*.7,0,0,7);g.fill();g.strokeStyle=tn('#a08a5a');g.lineWidth=u*.5;g.beginPath();g.moveTo(mx-u*2,my-u*2.8);g.lineTo(mx+u*2,my-u*2.8);g.stroke();MAK.txt(g,T(['МУКА','FLOUR']),mx,my+u*1.6,u*2.1,{col:tn('#7a5a3a'),ol:false});}
      else{for(const cb of corn()){const {cy,x0,x1,ch}=cb;sh((x0+x1)/2,cy+ch*.55,(x1-x0)*.52,ch*.18);
        // листья обёртки
        g.fillStyle=tn('#c8c08a');g.beginPath();g.moveTo(x1-u*2,cy-ch*.4);g.quadraticCurveTo(x1+u*8,cy-ch*.9,x1+u*12,cy-ch*.2);g.quadraticCurveTo(x1+u*5,cy,x1-u*2,cy+ch*.1);g.fill();
        g.fillStyle=tn('#a8b06a');g.beginPath();g.moveTo(x1-u*2,cy+ch*.4);g.quadraticCurveTo(x1+u*9,cy+ch*.8,x1+u*13,cy+ch*.3);g.quadraticCurveTo(x1+u*5,cy,x1-u*2,cy-ch*.1);g.fill();
        const bg=g.createLinearGradient(0,cy-ch/2,0,cy+ch/2);bg.addColorStop(0,tn('#f0c040'));bg.addColorStop(.5,tn('#e8a820'));bg.addColorStop(1,tn('#b87810'));g.fillStyle=bg;
        g.beginPath();g.moveTo(x0,cy);g.quadraticCurveTo(x0,cy-ch/2,x0+ch*.6,cy-ch/2);g.lineTo(x1,cy-ch*.44);g.quadraticCurveTo(x1+u,cy,x1,cy+ch*.44);g.lineTo(x0+ch*.6,cy+ch/2);g.quadraticCurveTo(x0,cy+ch/2,x0,cy);g.fill();
        const cols=11,kw=(x1-x0)/(cols+1.6);for(let r=0;r<3;r++)for(let k=0;k<cols;k++){const kx=x0+kw*(1.3+k),ky=cy+(r-1)*ch*.28;const kg=g.createRadialGradient(kx-kw*.15,ky-ch*.06,1,kx,ky,kw*.55);kg.addColorStop(0,tn('#fff0a0'));kg.addColorStop(1,tn('#e0a020'));g.fillStyle=kg;rr(g,kx-kw*.42,ky-ch*.12,kw*.84,ch*.24,kw*.25);g.fill();}}
        // миска пустая стоит в банке-«jar» (рисуется отдельно)
      }}
    else{}
    surf=c;}
  /* ---------- предмет (летит/лежит): мотыль, зерно, шарик теста, малёк ---------- */
  function worm(g,x,y,L,t,k,a){g.save();g.translate(x,y);g.globalAlpha=a==null?1:a;g.lineCap='round';const n=8,pts=[];for(let i=0;i<=n;i++){const s=i/n;pts.push([0+Math.sin(t*9+s*5)*L*.18*k,-s*L*k]);}
    g.strokeStyle='#7a1018';g.lineWidth=L*.16;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();
    g.strokeStyle='#d8323a';g.lineWidth=L*.11;g.stroke();g.strokeStyle='rgba(120,10,20,.6)';g.lineWidth=L*.11;g.setLineDash([L*.025,L*.06]);g.stroke();g.setLineDash([]);g.strokeStyle='rgba(255,190,190,.7)';g.lineWidth=L*.03;g.beginPath();g.moveTo(pts[0][0]-L*.02,pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0]-L*.02,pts[i][1]);g.stroke();
    g.fillStyle='#5a0a10';const h=pts[n];g.beginPath();g.arc(h[0],h[1],L*.07,0,7);g.fill();g.restore();}
  function drawItem(g,x,y,sc,k,fishLk){const u=LL.u;g.save();g.translate(x,y);g.scale(sc,sc);
    if(kind==='blood'){g.rotate(k*6);worm(g,0,u*3.5,u*8,k*3,1);}
    else if(kind==='corn'){g.rotate(k*8);const kg=g.createRadialGradient(-u*.3,-u*.3,1,0,0,u*1.6);kg.addColorStop(0,'#fff6b0');kg.addColorStop(1,'#e8a820');g.fillStyle=kg;rr(g,-u*1.2,-u*1.4,u*2.4,u*2.8,u*.9);g.fill();}
    else if(kind==='dough'){const bg=g.createRadialGradient(-u*.6,-u*.6,1,0,0,u*2.4);bg.addColorStop(0,'#fffaf0');bg.addColorStop(1,'#e8d4b0');g.fillStyle=bg;g.beginPath();g.arc(0,0,u*2.2,0,7);g.fill();}
    else{g.rotate(Math.sin(k*20)*.5);try{drawFish(g,FISH[fishLk||'ukleyka'].lk,0,0,u*9);}catch(e){}}
    g.restore();}
  /* ---------- ёмкость: банка / миска / жестянка / ведро ---------- */
  function drawJar(g,t){const {x,y,s}=jar,lv=Math.min(1,st.jarN/15),b=st.bump>0?1+.1*Math.sin(st.bump*Math.PI):1;g.save();g.translate(x,y);g.scale(b,b);
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,s*.02,s*.42,s*.08,0,0,7);g.fill();
    if(kind==='blood'){// стеклянная банка
      const w=s*.62,h=s*.8;g.fillStyle='rgba(200,230,240,.25)';rr(g,-w/2,-h,w,h,s*.08);g.fill();
      if(lv>0){g.save();rr(g,-w/2,-h,w,h,s*.08);g.clip();const fy=-h*lv*.9;g.fillStyle='#8a1820';g.fillRect(-w/2,fy,w,h);for(let i=0;i<Math.min(20,st.jarN*2);i++){g.strokeStyle=i%2?'#d8323a':'#a01822';g.lineWidth=s*.035;g.beginPath();const yy=fy+((i*37)%100)/100*(-fy),xx=((i*53)%100)/100*w-w/2;g.moveTo(xx,yy);g.quadraticCurveTo(xx+s*.06,yy-s*.05+Math.sin(t*4+i)*s*.02,xx+s*.12,yy);g.stroke();}g.restore();}
      g.strokeStyle='rgba(255,255,255,.65)';g.lineWidth=s*.025;rr(g,-w/2,-h,w,h,s*.08);g.stroke();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(-w*.36,-h*.86,w*.1,h*.7);
      g.fillStyle='rgba(220,235,240,.6)';rr(g,-w*.55,-h-s*.06,w*1.1,s*.1,s*.04);g.fill();}
    else if(kind==='corn'){// эмалированная миска
      const w=s*.95,h=s*.42;g.fillStyle='#f4f2ea';g.beginPath();g.moveTo(-w/2,-h);g.quadraticCurveTo(-w*.45,0,0,0);g.quadraticCurveTo(w*.45,0,w/2,-h);g.closePath();g.fill();
      g.fillStyle='#2f68b0';g.beginPath();g.ellipse(0,-h,w/2,s*.09,0,0,7);g.fill();g.fillStyle='#d8d4c8';g.beginPath();g.ellipse(0,-h,w*.46,s*.07,0,0,7);g.fill();
      if(lv>0){g.fillStyle='#f0b830';g.beginPath();g.ellipse(0,-h-s*.02*lv,w*.44,s*.06+s*.18*lv,0,Math.PI,0);g.fill();g.fillStyle='#ffe070';for(let i=0;i<Math.min(16,st.jarN);i++){g.beginPath();g.arc((((i*37)%100)/100-.5)*w*.7,-h-s*.04-((i*53)%100)/100*s*.16*lv,s*.035,0,7);g.fill();}}
      g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-w*.25,-h*.45,w*.06,h*.25,.3,0,7);g.fill();}
    else if(kind==='dough'){// жестяная банка
      const w=s*.62,h=s*.6;const cg=g.createLinearGradient(-w/2,0,w/2,0);cg.addColorStop(0,'#8a9aa8');cg.addColorStop(.4,'#e8eef2');cg.addColorStop(1,'#7a8a98');g.fillStyle=cg;g.fillRect(-w/2,-h,w,h);
      g.fillStyle='#c84a3a';g.fillRect(-w/2,-h*.7,w,h*.4);MAK.txt(g,'★',0,-h*.5,s*.16,{col:'#ffe08a',ol:false});
      g.fillStyle='#5a6a78';g.beginPath();g.ellipse(0,-h,w/2,s*.07,0,0,7);g.fill();
      if(lv>0)for(let i=0;i<Math.min(9,Math.ceil(st.jarN/1.6));i++){const bx=((i%3)-1)*w*.28,by=-h-s*.03-Math.floor(i/3)*s*.09;g.fillStyle='#f4e6c8';g.beginPath();g.arc(bx,by,s*.075,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(bx-s*.02,by-s*.02,s*.025,0,7);g.fill();}}
    else{// ведро с водой
      const w=s*.8,h=s*.7,bg=g.createLinearGradient(-w/2,0,w/2,0);bg.addColorStop(0,'#7a838a');bg.addColorStop(.5,'#cfd6da');bg.addColorStop(1,'#6a7378');g.fillStyle=bg;
      g.beginPath();g.moveTo(-w/2,-h);g.lineTo(w/2,-h);g.lineTo(w*.38,0);g.lineTo(-w*.38,0);g.closePath();g.fill();
      g.fillStyle='#3a6a78';g.beginPath();g.ellipse(0,-h,w/2,s*.1,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(-w*.1,-h,w*.25,s*.03,0,0,7);g.fill();
      for(let i=0;i<Math.min(6,Math.ceil(st.jarN/2.5));i++){g.save();g.translate(((i%3)-1)*w*.25,-h-s*.01);g.rotate(Math.sin(t*3+i)*.3);g.fillStyle='#cfd8dc';g.beginPath();g.moveTo(0,0);g.lineTo(-s*.04,-s*.08);g.lineTo(s*.04,-s*.08);g.fill();g.restore();}
      g.strokeStyle='#8a9298';g.lineWidth=s*.03;g.beginPath();g.arc(0,-h,w*.5,Math.PI*1.05,Math.PI*1.95);g.stroke();}
    g.restore();}
  /* ---------- цели ---------- */
  function drawAct(g,t){const u=LL.u;for(const it of st.act){if(it.done)continue;const a=it.t,life=it.life,act=a>=HINT,k=act?Math.min(1,(a-HINT)/.22):0,end=Math.max(0,Math.min(1,(it.t-HINT-life+.25)/.25)),p=posNow(it);
    if(kind==='blood'){// пузырьки, потом мотыль
      for(let i=0;i<3;i++){const bt=(a*1.6+i*.33)%1;g.strokeStyle='rgba(220,240,250,'+(.8*(1-bt))+')';g.lineWidth=1.4;g.beginPath();g.arc(p.x+(i-1)*u*1.6+Math.sin(a*6+i)*u*.5,p.y-bt*u*4,u*(.5+bt*.6),0,7);g.stroke();}
      g.strokeStyle='rgba(40,30,15,.5)';g.lineWidth=u*.5;g.beginPath();g.ellipse(p.x,p.y,u*(2.2+Math.sin(a*8)*.3),u*1,0,0,7);g.stroke();
      if(act){g.fillStyle='rgba(30,20,10,.35)';g.beginPath();g.ellipse(p.x,p.y,u*2.2,u*.9,0,0,7);g.fill();worm(g,p.x,p.y,u*11,a,(1-end)*MAK.ease.back(k));}}
    else if(kind==='corn'){const pulse=.5+.5*Math.sin(a*9);
      if(LOW)glowSp(g,p.x,p.y,u*(act?6:3),'255,240,150',act?.6:.3);else{const gl=g.createRadialGradient(p.x,p.y,1,p.x,p.y,u*(act?6:3));gl.addColorStop(0,'rgba(255,245,170,'+(act?.75:.35)*(1-end)+')');gl.addColorStop(1,'rgba(255,245,170,0)');g.fillStyle=gl;g.fillRect(p.x-u*7,p.y-u*7,u*14,u*14);}
      if(act){g.save();g.translate(p.x,p.y);g.rotate(a*1.5);g.fillStyle='rgba(255,255,255,'+(1-end)+')';const r=u*(2.6+pulse*1.2)*k;g.beginPath();for(let j=0;j<8;j++){const rr2=j%2?r*.18:r,an=j*Math.PI/4;g.lineTo(Math.cos(an)*rr2,Math.sin(an)*rr2);}g.fill();g.restore();}}
    else if(kind==='dough'){const rise=act?(1-end)*(.85+.15*Math.sin(a*5)):.35+.4*(a/HINT);const r=u*5*rise;
      g.fillStyle='rgba(120,80,40,.25)';g.beginPath();g.ellipse(p.x+u*.4,p.y+r*.45,r*1.15,r*.4,0,0,7);g.fill();
      const bg=g.createRadialGradient(p.x-r*.35,p.y-r*.5,1,p.x,p.y-r*.2,r*1.2);bg.addColorStop(0,'#fffcf2');bg.addColorStop(1,'#ead6b2');g.fillStyle=bg;g.beginPath();g.ellipse(p.x,p.y-r*.15,r*1.1,r*.8,0,0,7);g.fill();
      if(act){g.strokeStyle='rgba(255,210,122,'+(.8*(1-end))+')';g.lineWidth=u*.6;g.beginPath();g.ellipse(p.x,p.y-r*.15,r*1.1+u*1.5+Math.sin(a*6)*u*.4,r*.8+u*1.2,0,0,7);g.stroke();
        g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(p.x-r*.4,p.y-r*.5,r*.25,r*.12,-.4,0,7);g.fill();}}
    else{// малёк
      const kk=Math.max(0,(a-HINT)/life);if(!act){g.strokeStyle='rgba(255,255,255,'+(.6*(a/HINT))+')';g.lineWidth=1.5;const ex=it.dir>0?A.x+u*3:A.x+A.w-u*3;g.beginPath();g.ellipse(ex,it.y,u*(1+a*4),u*(.4+a*1.4),0,0,7);g.stroke();continue;}
      g.fillStyle='rgba(0,30,40,.25)';g.beginPath();g.ellipse(p.x,p.y+u*2.5,u*4.5,u*1.1,0,0,7);g.fill();
      g.save();g.translate(p.x,p.y);g.scale(-it.dir,1);g.rotate(Math.sin(a*14)*.08);g.globalAlpha=kk>.92?(1-kk)/.08:1;
      try{const lk=FISH[it.e.r<.5?'ukleyka':it.e.r<.8?'plotva':'peskar'].lk;drawFish(g,lk,0,0,u*(it.e.r<.5?13:12));}catch(e){}g.restore();
      if(!o.calm&&Math.sin(a*5)>.97)MAK.burst(st.parts,p.x,p.y-u,{n:1,col:'rgba(255,255,255,.7)',k:'ring',sp:0,g:0,s:u*1.2,d:.5});}}}
  /* RB:MGPC цифры над целями и кольцо под мышью (только ПК) */
  function drawKeys(g,t){const u=LL.u,pc=host.pc;MAK.slots(st.act,okIt);const hv=hovIt();MAK.cur(LL.c,!!hv);
    if(hv){const p=posNow(hv);g.save();g.strokeStyle='rgba(255,236,170,.85)';g.lineWidth=Math.max(2,u*.5);g.beginPath();g.arc(p.x,p.y-(kind==='blood'?u*4:0),tapRad()*.62,0,7);g.stroke();g.restore();}
    if(!pc)return;const px=Math.max(22,Math.min(32,u*4.8)),dy=kind==='blood'?u*15:kind==='dough'?u*9.5:kind==='live'?u*7.5:u*6.5;
    for(const it of st.act){if(!it.kk||!okIt(it))continue;const p=posNow(it);MAK.keycap(g,p.x,Math.max(px,p.y-dy),String(it.kk),px);}}
  /* рука-подсказка новичку */
  function drawHand(g,t){const it=st.act.find(a=>!a.done&&a.t>=HINT);if(!it)return;const p=posNow(it);MAK.hand(g,p.x,p.y,LL.u,t);}
  /* сачок (живец) */
  function drawNet(g){const n=st.net;if(!n)return;const u=LL.u,k=Math.min(1,n.t/.45);if(k>=1){st.net=null;return;}
    const a=-1.2+k*2.2,hx=n.x+Math.cos(a)*u*14,hy=n.y-u*10+Math.sin(a)*u*4;g.save();g.strokeStyle='#6a4a2a';g.lineWidth=u*.9;g.lineCap='round';g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+u*16,hy-u*18);g.stroke();
    g.strokeStyle='#ddd';g.lineWidth=u*.5;g.beginPath();g.ellipse(hx,hy,u*4.5,u*2.4,a*.3,0,7);g.stroke();g.fillStyle='rgba(230,230,220,.35)';g.beginPath();g.ellipse(hx,hy+u*2,u*4,u*3.5,a*.3,0,Math.PI);g.fill();g.restore();}
  /* блики воды (живец) */
  function drawCaus(g,t){if(kind!=='live')return;const u=LL.u;g.save();g.beginPath();g.rect(0,A.hz,LL.W,A.gy-A.hz);g.clip();g.strokeStyle='rgba(255,255,255,.14)';g.lineWidth=1.4;
    for(let i=0;i<(LOW?8:16);i++){const y=A.hz+(A.gy-A.hz)*(.08+((i*.061)%.9)),x=A.x+((i*97)%100)/100*A.w+Math.sin(t*.7+i)*u*4;g.beginPath();g.moveTo(x-u*5,y);g.quadraticCurveTo(x,y-u*1.2,x+u*5,y);g.stroke();}g.restore();}
  /* ---------- кадр ---------- */
  let lastT=0;
  function frame(dt,now){const g=LL.g,L=LL,W=L.W,H=L.H,u=L.u;st.t+=dt;const t=st.t;
    const yc=kind==='live'?MAK.shore(L,P,{hz:A.hz,gy:A.gy,px:A.px,py:A.py}):MAK.yard(L,P,{ground:L.land?H*.62:H*.46,hz:L.land?H*.4:H*.3});g.drawImage(yc,0,0,W,H);if(!surf)paintSurf();
    if(o.calm){}else MAK.leaves(st.leaves,L,dt,g,o.calm);
    if(!o.calm)MAK.birds(g,L,t,3);MAK.wife(g,st.wife,t,tn);
    // Петрович и кот (за столом/тазом)
    st.petr.pt+=dt;if(st.petr.pose!=='idle'&&st.petr.pt>(st.petr.pose==='talk'?st.say.d:1.6))st.petr={pose:'idle',pt:0};
    let tgt=null;for(const it of st.act)if(!it.done&&it.t>=HINT){tgt=posNow(it);break;}
    MAK.petr(g,petr.x,petr.yb,petr.s,{t,tn,pose:st.petr.pose,look:tgt?Math.max(-1,Math.min(1,(tgt.x-petr.x)/(W*.3))):0});
    st.cat.t+=dt;if(st.cat.k==='paw'){st.cat.pt+=dt;if(st.cat.pt>.5)st.cat={k:'sit',t:0};}if(st.cat.k==='happy'&&st.cat.t>1.6)st.cat={k:'sit',t:0};
    MAK.cat(g,cat.x,cat.yb,cat.s,{t,tn,k:st.cat.k,pt:st.cat.pt,dir:st.cat.dir,look:tgt?(tgt.x-cat.x)/(W*.25):Math.sin(t*.4)*.3});
    g.drawImage(surf,0,0,W,H);
    // съеденные зёрна
    if(kind==='corn'){const cb=corn();for(const key in st.eaten){const [ci,col,row]=key.split('_').map(Number),c=cb[ci],kw=(c.x1-c.x0)/(11+1.6),kx=c.x0+kw*(1.3+col),ky=c.cy+(row-1)*c.ch*.28;g.fillStyle=tn('#8a5a18');rr(g,kx-kw*.36,ky-c.ch*.1,kw*.72,c.ch*.2,kw*.2);g.fill();g.fillStyle='rgba(0,0,0,.25)';rr(g,kx-kw*.3,ky-c.ch*.08,kw*.6,c.ch*.08,kw*.15);g.fill();}}
    drawCaus(g,t);
    // ход игры
    if(st.ph==='play'){st.gt+=dt;while(st.next<pl.list.length&&pl.list[st.next].t<=st.gt){spawn(pl.list[st.next]);st.next++;}
      for(let i=st.act.length-1;i>=0;i--){const it=st.act[i];it.t+=dt;if(it.done||it.t>HINT+it.life){if(!it.done)st.streak=0;st.act.splice(i,1);}}
      if(st.gt>=pl.D&&!st.act.length)finish();}
    drawAct(g,t);drawNet(g);if(st.net)st.net.t+=dt;
    if(st.ph==='play')drawKeys(g,t);else MAK.cur(LL.c,false);
    drawJar(g,t);if(st.bump>0)st.bump=Math.max(0,st.bump-dt*4);
    MAK.flies(g,st.flies,dt);MAK.parts(g,st.parts,dt);
    if(st.hand&&st.ph==='play')drawHand(g,t);
    // облачко Петровича
    st.say.t+=dt;if(st.say.tx&&st.say.t<st.say.d){const a=Math.min(1,st.say.t*4,(st.say.d-st.say.t)*3);MAK.bubble(g,petr.x+petr.s*.05,petr.yb-petr.s*1.02,st.say.tx,L,{a,ax:.25,who:T(['Петрович','Petrovich'])});}
    if(st.wife>0){st.wife=Math.min(1,st.wife+dt*1.5);if(MAK._win&&st.fin<1.9)MAK.bubble(g,MAK._win.x,MAK._win.y-MAK._win.h*.5,T(['Ужинать! Остывает!','Dinner! It’s getting cold!']),L,{a:Math.min(1,st.wife*2),ax:.2,who:T(['Жена','Wife'])});}
    // счётчик и мягкая полоска
    MAK.hud(g,L,img,T(K.n)+': '+st.c,{bump:st.bump},st.gt/pl.D,st.ph==='intro'?null:T(['Пока жена не позвала ужинать','Until wife calls for dinner']));
    if(st.ph==='end')drawFin(g,dt);}
  /* ---------- финал ---------- */
  let res=null,finBtn=null;
  function finish(){if(st.ph!=='play')return;st.ph='end';st.fin=0;st.wife=.01;MAK.snd('phone');const r=outcome(st.c);res={score:st.c,tier:r.tier,n:o.train?0:r.n,rec:st.c>best&&st.c>0};
    st.say={tx:st.c>=10?T(['Ну, на неделю хватит! Иду, иду!','That’ll do for a week! Coming!']):st.c?T(['Ничего, завтра ещё намоем. Иду!','Fine, more tomorrow. Coming!']):T(['Эх, не задалось. Завтра снова!','No luck today. Again tomorrow!']),t:0,d:3};st.petr={pose:st.c>=10?'cheer':'talk',pt:0};
    }
  function drawFin(g,dt){if(st.closed)return;st.fin+=dt;const L=LL,W=L.W,H=L.H,u=L.u,k=Math.max(0,(st.fin-1.9)/.5);if(k<=0)return;
    if(!finBtn&&k>=1){finBtn=1;
      const go=()=>{MAK.snd('tap');ui.clear();st.closed=1;st.say.t=99;try{frame(0);}catch(e){}host.done({score:res.score,tier:res.tier,rec:res.rec,extra:o.train||!res.n?{}:{bait:{[kind]:res.n},x2:'bait'}});};ui.next(go); /*MERGE 08.10: наживка — общей добычей оболочки (extra.bait, потолок дня), «Удвоить добычу» — одна кнопка в окне итогов MG0*/
      if(!o.calm)MAK.burst(st.parts,W/2,H*.42,{n:res.tier*12,col:['#ffd27a','#ff8f4f','#6be3b0','#fff'],k:'star',sp:320,g:420,s:6,d:1.2});MAK.snd(res.tier>=2?'catch':'coin');}
    const e=MAK.ease.out(Math.min(1,k));g.save();g.globalAlpha=e*.62;g.fillStyle='#0a1218';g.fillRect(0,0,W,H);g.restore();
    const cw=Math.min(W-32,440),ch=Math.min(H*.5,u*(L.land?60:70)),cx=W/2,cy=H*.44-(1-e)*u*6;g.save();g.globalAlpha=e;
    g.fillStyle='rgba(16,26,36,.86)';rr(g,cx-cw/2,cy-ch/2,cw,ch,24);g.fill();g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1;g.stroke();
    const sr=Math.min(u*6,30);MAK.stars(g,cx,cy-ch/2+sr*1.6,sr,res.tier,Math.min(1,(st.fin-2.2)*1.6),st.fin);
    const iz=Math.min(ch*.36,u*24);if(img&&img.complete)g.drawImage(img,cx-iz/2,cy-ch/2+sr*2.9,iz,iz);
    const px=Math.max(24,Math.min(34,u*7.5));
    MAK.txt(g,o.train?T(['Тренировка','Practice']):(res.n?T(K.n)+' +'+res.n:T(['Сегодня пусто','Nothing today'])),cx,cy+ch*.25,px,{col:'#ffd27a'});
    MAK.txt(g,T(['Поймано: ','Caught: '])+res.score+(res.rec?T([' · рекорд!',' · record!']):best?T([' · рекорд ',' · best ']).concat(best):''),cx,cy+ch*.25+px*1.25,Math.max(18,px*.62),{col:'rgba(255,255,255,.88)',ol:false});
    if(res.rec&&st.fin>2.6){g.save();g.translate(cx+cw/2-u*6,cy-ch/2+u*4);g.rotate(.25);g.fillStyle='#ff8f4f';rr(g,-u*10,-u*2.6,u*20,u*5.2,u*1.5);g.fill();MAK.txt(g,T(['Рекорд!','Record!']),0,0,Math.max(18,u*3.6),{col:'#fff',olc:'rgba(80,30,0,.6)'});g.restore();}
    g.restore();}
  host.el.__t={st,tap,act:()=>st.act.filter(it=>!it.done&&it.t>=HINT).map(posNow),skip(){st.gt=pl.D;}}; // для проверок (cdp)
  /* ---------- старт ---------- */
  st.ph='intro';
  ui.intro({title:T(['Наживка дня','Bait of the Day']),sub:T(K.n)+' · '+T(K.w),art:K.art,train:o.train,lines:[MAK.pcw(host,T(K.rule)),T(['Без спешки: промах ничего не отнимает. Чем больше наловишь — тем больше '+K.gen[0]+' на рыбалку.','No rush: a miss costs nothing. The more you get, the more '+K.gen[1]+' for fishing.'])]
      .concat(host.pc?[T(['<b>Клавиши:</b> цифра над целью ','<b>Keys:</b> the number above a target '])+MAK.kc('1')+MAK.kc('2')+MAK.kc('3')]:[]),btn:T(['Начать','Start'])})
    .then(()=>{st.ph='play';st.gt=0;st.say={tx:T(K.say),t:0,d:4.5};st.petr={pose:'talk',pt:0};
      if(host.kbd)host.kbd(T(['Щёлкай по цели или жми цифру над ней: ','Click a target or press its number: '])+MAK.kc('1')+MAK.kc('2')+MAK.kc('3'),7);});
  MAK.loop(host,frame);
}
MG_REG({id:'nazh',n:{ru:'Наживка дня',en:'Bait of the day'},icon:'<path class="d" d="M7 6h10v13a2 2 0 01-2 2H9a2 2 0 01-2-2z"/><path d="M6 4h12v2H6zM9.5 11c1-1 2 1 3 0s2 1 3 0M9.5 15c1-1 2 1 3 0s2 1 3 0"/>',kind:'daily',run,bot:(lv)=>bot(lv,{seed:1,day:0}),kindOf});
})();
