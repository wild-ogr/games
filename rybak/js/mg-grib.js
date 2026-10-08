'use strict';
/* RB:MGA №12 «Грибы у берега» (js/mg-grib.js), сезон 1.09–31.10. План — 09-minigames.md (таблица, №12), 00-plan.md §5.
   Пока клёва нет, на опушке из-под листьев выглядывают грибы: белый, подберёзовик, подосиновик, лисички — коснись, гриб в корзину.
   Мухомор (и в обычном режиме изредка бледная поганка) — не трогать: тронул — Петрович ворчит, гриб не считается, −1 к счёту.
   Мягкая полоска — поплавок Петровича: «пока не клюнуло» (35 с, спокойный 46 с). Никаких секунд, промах ничего не отнимает.
   Итог: host.done({score: хорошие − ошибки, tier, rec, extra:{grib:{n, k:{вид:шт}}, txt}}). Монет игра не даёт — награды (пирог бабы Зины,
   «Золотая осень», поплавок «Грибок») решает оболочка MG0 по MG_RW. Коллекция видов — S.mg.grib.k (MAK.keep + здесь). */
(function(){
const N=22,HINT=.4;
const KINDS={
  bel:{n:['Белый','Porcini'],ok:1,cap:'#8a5a2a',cap2:'#5e3a18',stem:'#f2ead6',w:1.15},
  bereza:{n:['Подберёзовик','Birch bolete'],ok:1,cap:'#6a4a30',cap2:'#4a3220',stem:'#ece6da',sp:1,w:1},
  osina:{n:['Подосиновик','Red-cap bolete'],ok:1,cap:'#d8582a',cap2:'#a83a18',stem:'#e8e2d6',sp:1,w:1.05},
  lis:{n:['Лисички','Chanterelles'],ok:1,cap:'#f0a828',cap2:'#d88a10',stem:'#f4b840',lis:1,w:.95},
  muh:{n:['Мухомор','Fly agaric'],ok:0,cap:'#e02a1a',cap2:'#a81a10',stem:'#f8f4ea',dots:1,w:1.1},
  pog:{n:['Бледная поганка','Death cap'],ok:0,cap:'#c8ccaa',cap2:'#a0a888',stem:'#f2f2e6',ring:1,w:.95}};
const GOOD=['bel','bereza','osina','lis','bereza','lis'];
const T=a=>typeof LANG!=='undefined'&&LANG==='en'?a[1]:a[0];
function season(){try{const d=new Date(nowMs()),m=d.getMonth()+1;return m===9||m===10;}catch(e){return true;}}
function plan(o){const R=MAK.R((o.seed^0x51ed27)>>>0),D=o.calm?46:35,life=o.calm?2.3:1.6,list=[];
  for(let i=0;i<N;i++){const bad=R()<.3,k=bad?(!o.calm&&R()<.3?'pog':'muh'):GOOD[R()*GOOD.length|0];list.push({t:1.5+(D-4)*(i+.15+R()*.7)/N,x:R(),y:R(),k,r:R()});}
  return {D,life,list};}
function outcome(good,bad){const sc=Math.max(0,good-bad),tier=sc>=12?3:sc>=7?2:sc>=2?1:0;return {sc,tier};}
function bot(sk,o){const p=plan(o),Rb=MAK.R((o.seed*11+5)>>>0),A={bad:[.3,1.4,.3],mid:[.6,.95,.12],good:[.95,.6,.02]}[sk]||[.6,.95,.12];let free=0,g=0,b=0;const kk={};
  for(const e of p.list){const win=HINT+p.life;if(Rb()>A[0])continue;const react=Math.max(.2,A[1]+(Rb()-.5)*.6),at=Math.max(e.t+react,free);if(at>=e.t+win)continue;
    if(KINDS[e.k].ok){g++;kk[e.k]=(kk[e.k]|0)+1;free=at+.25;}else if(Rb()<A[2]*3){b++;free=at+.25;}}
  const r=outcome(g,b);return {score:r.sc,tier:r.tier,extra:{grib:{n:g,k:kk}}};}

/* ---------- гриб: (x,y) — низ ножки, s — высота, k — вид, grow 0..1 ---------- */
function mush(g,x,y,s,k,grow,t,tn){const K=KINDS[k];tn=tn||(c=>c);if(grow<=0)return;g.save();g.translate(x,y);const sc=Math.min(1,grow);g.scale(sc*(K.w||1),sc);
  g.fillStyle='rgba(30,20,5,.3)';g.beginPath();g.ellipse(0,0,s*.42,s*.1,0,0,7);g.fill();
  if(K.lis){// лисички — кучка воронок
    for(const [dx,ds] of [[-.22,.75],[.2,.85],[0,1]]){g.save();g.translate(dx*s,0);g.scale(ds,ds);const sg=g.createLinearGradient(0,-s*.7,0,0);sg.addColorStop(0,tn(K.cap));sg.addColorStop(1,tn(K.cap2));g.fillStyle=sg;
      g.beginPath();g.moveTo(-s*.07,0);g.quadraticCurveTo(-s*.08,-s*.4,-s*.3,-s*.62);g.quadraticCurveTo(0,-s*.74,s*.3,-s*.62);g.quadraticCurveTo(s*.08,-s*.4,s*.07,0);g.closePath();g.fill();
      g.strokeStyle='rgba(150,80,0,.4)';g.lineWidth=s*.015;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*s*.02,-s*.1);g.lineTo(i*s*.1,-s*.6);g.stroke();}
      g.fillStyle=tn('#ffd060');g.beginPath();g.ellipse(0,-s*.64,s*.29,s*.06,0,0,7);g.fill();g.restore();}
    g.restore();return;}
  // ножка
  const sw=K===KINDS.bel?s*.22:s*.15,sh=s*(K===KINDS.bel?.55:.62);const stg=g.createLinearGradient(-sw,0,sw,0);stg.addColorStop(0,tn(shadeH(K.stem,.82)));stg.addColorStop(.5,tn(K.stem));stg.addColorStop(1,tn(shadeH(K.stem,.78)));g.fillStyle=stg;
  g.beginPath();g.moveTo(-sw*.8,0);g.quadraticCurveTo(-sw*1.15,-sh*.4,-sw*.7,-sh);g.lineTo(sw*.7,-sh);g.quadraticCurveTo(sw*1.15,-sh*.4,sw*.8,0);g.closePath();g.fill();
  if(K.sp){g.fillStyle='rgba(30,25,20,.7)';const R=MAK.R(k.length*7);for(let i=0;i<14;i++){g.beginPath();g.ellipse((R()-.5)*sw*1.3,-R()*sh*.9,s*.012,s*.02,0,0,7);g.fill();}}
  if(K.ring){g.fillStyle=tn('#ffffff');g.beginPath();g.ellipse(0,-sh*.7,sw*1.1,s*.04,0,0,7);g.fill();}
  if(K.dots){g.fillStyle=tn('#ffffff');g.beginPath();g.ellipse(0,-sh*.68,sw*1.25,s*.05,0,0,7);g.fill();}
  // шляпка
  const cw=s*(K===KINDS.bel?.46:K.dots?.44:.4),ch=s*(K.dots?.3:.32),cy=-sh+s*.04;const cg=g.createRadialGradient(-cw*.3,cy-ch*.6,1,0,cy-ch*.3,cw*1.1);cg.addColorStop(0,tn(shadeH(K.cap,1.25)));cg.addColorStop(.6,tn(K.cap));cg.addColorStop(1,tn(K.cap2));
  g.fillStyle=tn(shadeH(K.cap2,.8));g.beginPath();g.ellipse(0,cy,cw,ch*.28,0,0,Math.PI);g.fill();
  g.fillStyle=cg;g.beginPath();g.moveTo(-cw,cy);g.bezierCurveTo(-cw,cy-ch*1.2,cw,cy-ch*1.2,cw,cy);g.quadraticCurveTo(0,cy+ch*.25,-cw,cy);g.fill();
  if(K.dots){g.fillStyle='#fffbe8';for(const [dx,dy,r] of [[-.5,-.45,.09],[.1,-.75,.1],[.55,-.4,.08],[-.15,-.3,.07],[.35,-.75,.06],[-.6,-.15,.06],[.7,-.12,.05]]){g.beginPath();g.ellipse(dx*cw,cy+dy*ch,r*s,r*s*.75,0,0,7);g.fill();}}
  g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(-cw*.35,cy-ch*.62,cw*.28,ch*.12,-.3,0,7);g.fill();
  if(k==='bel'){g.fillStyle='rgba(255,230,180,.35)';g.beginPath();g.ellipse(0,cy-ch*.05,cw*.9,ch*.12,0,0,Math.PI);g.fill();}
  // листик на шляпке
  if(k==='bereza'||k==='bel'){g.save();g.translate(cw*.2,cy-ch*.78);g.rotate(.6);g.fillStyle=tn('#e8c050');g.beginPath();g.ellipse(0,0,s*.07,s*.035,0,0,7);g.fill();g.restore();}
  g.restore();}

function run(host,o){
  if(o.bot){const r=bot(o.bot,o);host.done({score:r.score,tier:r.tier});return;} // авто-игрок оболочки (mgBot): та же модель, без рисования
  const P=MAK.P(MAK.tod()),tn=P.tint,pl=plan(o),best=MAK.best(o),first=MAK.first('griby');
  let A=null,bask=null,petr=null,cat=null,flt=null;
  const st={ph:'intro',t:0,gt:0,good:0,bad:0,next:0,act:[],parts:[],flies:[],leaves:[],say:{tx:T(['Клёва пока нет — пойдём по грибы! Только мухоморы не бери, они для красоты.','No bites yet — let’s pick mushrooms! Just don’t take the fly agarics.']),t:0,d:6},
    bump:0,hand:first?1:0,cat:{k:'sit',t:0},petr:{pose:'talk',pt:0},fin:0,kk:{},inB:[],streak:0,bite:0};
  const LL=MAK.cv(host,L=>layout(L));
  function layout(L){const W=L.W,H=L.H,u=L.u,hz=H*(L.land?.34:.28),gy=H*(L.land?.5:.44);
    A={x:W*(L.land?.2:.05),y:gy+(H-gy)*.12,w:W*(L.land?.56:.9),h:(H-gy)*.8,hz,gy};
    bask={x:L.land?W*.83:W*.8,y:H*(L.land?.93:.95),s:Math.min(u*(L.land?20:24),W*.22)};
    petr={x:L.land?W*.62:W*.66,yb:gy+u*2,s:H*(L.land?.24:.15)};cat={x:L.land?W*.12:W*.2,yb:gy+(H-gy)*.1,s:H*(L.land?.12:.08)};
    flt={x:L.land?W*.42:W*.4,y:hz+(gy-hz)*.45};}
  layout(LL);const ui=MAK.ui(host);
  if(host.amb)host.amb('forest',MAK.tod()); // RB:MGPC звуки природы: опушка, время суток как на рисунке
  function posOf(e){let x=A.x+A.w*(.06+e.x*.88),y=A.y+A.h*(.12+e.y*.82);if(x>bask.x-bask.s*.7&&y>bask.y-bask.s*1.1)x=A.x+A.w*(.06+e.x*.55);
    if(Math.hypot(x-cat.x,y-cat.yb)<cat.s*1.2)y+=cat.s*1.3;
    for(const a of st.act)if(Math.hypot(a.x-x,a.y-y)<LL.u*12)x+=(x<LL.W/2?1:-1)*LL.u*13;return {x:Math.max(A.x+LL.u*4,Math.min(A.x+A.w-LL.u*4,x)),y:Math.min(LL.H-LL.u*6,y)};}
  function spawn(e){const p=posOf(e);st.act.push({e,x:p.x,y:p.y,t:0,life:pl.life,done:0});}
  function sz(y){return LL.u*(11+10*(y-A.y)/A.h)*(LL.land?1.1:1);}
  function tap(px,py){if(st.ph!=='play')return;let bi=-1,bd=1e9;for(let i=0;i<st.act.length;i++){const it=st.act[i];if(it.done||it.t<HINT*.5)continue;const s=sz(it.y),d=Math.hypot(it.x-px,it.y-s*.45-py);if(d<Math.max(40,s*.9)*(o.calm?1.15:1)&&d<bd){bd=d;bi=i;}}
    if(bi<0){if(py>A.y)MAK.burst(st.parts,px,py,{n:4,col:['#e0a030','#d06a28','#c8b040'],k:'leaf',sp:110,g:260,s:LL.u*.9,d:.7});return;}
    const it=st.act[bi],K=KINDS[it.e.k],s=sz(it.y);it.done=1;st.hand=0;
    if(!K.ok){st.bad++;st.streak=0;MAK.snd('no');MAK.buzz(30,o);it.shake=1;st.say={tx:T(it.e.k==='pog'?['Стой! Это поганка — бледная, с юбочкой. Не бери!','Stop! That’s a death cap — pale with a skirt. Leave it!']:['Эй-эй! Мухомор не бери — пусть лоси лечатся.','Hey! Leave the fly agaric — it’s for the elk.']),t:0,d:2.8};st.petr={pose:'point',pt:0};st.cat={k:'alarm',t:0};
      MAK.pop(st.parts,it.x,it.y-s*1.1,'✕',Math.max(22,LL.u*6),'#ff9a8b');st.act.push({e:it.e,x:it.x,y:it.y,t:HINT+.01,life:.6,done:2,bad:1});return;}
    st.good++;st.streak++;st.kk[it.e.k]=(st.kk[it.e.k]|0)+1;MAK.snd('tap');MAK.buzz(12,o);
    MAK.burst(st.parts,it.x,it.y-s*.3,{n:o.calm?3:8,col:['#e0a030','#d06a28','#c8b040','#a86a30'],k:'leaf',sp:150,g:300,s:LL.u*.9,d:.8});
    MAK.pop(st.parts,it.x,it.y-s*1.2,'+1',Math.max(20,LL.u*5.5),'#fff4c2');
    const k=it.e.k;MAK.fly(st.flies,{x0:it.x,y0:it.y,x1:bask.x+(Math.random()-.5)*bask.s*.4,y1:bask.y-bask.s*.42,d:o.calm?.75:.6,h:LL.u*18,draw:(g,x,y,kk)=>mush(g,x,y,s*(1-kk*.45),k,1,0,null),end:()=>{st.inB.push(k);st.bump=1;MAK.snd('click');}});
    if(st.good===1||st.good%4===0){st.say={tx:T([['Вот это белый — красавец!','A proper porcini!'],['Ай да грибник!','What a mushroom hunter!'],['Будет бабе Зине на пирог!','Enough for Granny Zina’s pie!'],['Ещё парочку — и на жарёху хватит.','A couple more and we’ll have a fry-up.']][(st.good/4|0)%4]),t:0,d:2.4};st.petr={pose:st.good%8===0?'cheer':'point',pt:0};}
    if(st.streak>=4&&st.cat.k==='sit'){st.cat={k:'happy',t:0};if(!o.calm)MAK.snd('meow');}}
  LL.c.addEventListener('pointerdown',ev=>{if(ev.pointerType==='mouse'&&ev.button>0)return;const r=LL.c.getBoundingClientRect();tap(ev.clientX-r.left,ev.clientY-r.top);ev.preventDefault();});
  /* RB:MGPC мышь: наведение (рука-курсор и кольцо над грибом); движение без кнопки игру не трогает */
  const ms={x:-1e4,y:-1e4,in:0};
  LL.c.addEventListener('pointermove',ev=>{if(ev.pointerType!=='mouse')return;const r=LL.c.getBoundingClientRect();ms.x=ev.clientX-r.left;ms.y=ev.clientY-r.top;ms.in=1;});
  LL.c.addEventListener('pointerleave',()=>{ms.in=0;MAK.cur(LL.c,false);});
  function okIt(it){return !it.done&&it.t>=HINT&&it.t<=HINT+it.life;}
  function hovIt(){if(!ms.in||st.ph!=='play')return null;let b=null,bd=1e9;for(const it of st.act){if(!okIt(it))continue;const s=sz(it.y),d=Math.hypot(it.x-ms.x,it.y-s*.45-ms.y);if(d<Math.max(40,s*.9)*(o.calm?1.15:1)&&d<bd){bd=d;b=it;}}return b;}
  /* RB:MGPC клавиши: цифра над каждым грибом (и над мухомором — его не жми!); пустое нажатие — короткая заминка */
  let klock=0;
  if(host.keys)host.keys(k=>{if(st.ph!=='play'||!/^[1-9]$/.test(k))return false;if(st.t<klock)return true;const it=st.act.find(a=>a.kk===+k&&okIt(a));
    if(it)tap(it.x,it.y-sz(it.y)*.45);else{klock=st.t+(o.calm?.2:.35);MAK.snd('tap',.25);}return true;});
  function drawKeys(g){const u=LL.u;MAK.slots(st.act,okIt);const hv=hovIt();MAK.cur(LL.c,!!hv);
    if(hv){const s=sz(hv.y);g.save();g.strokeStyle='rgba(255,236,170,.85)';g.lineWidth=Math.max(2,u*.5);g.beginPath();g.ellipse(hv.x,hv.y-s*.42,s*.62,s*.66,0,0,7);g.stroke();g.restore();}
    if(!host.pc)return;const px=Math.max(22,Math.min(32,u*4.8));
    for(const it of st.act){if(!it.kk||!okIt(it))continue;const s=sz(it.y);MAK.keycap(g,it.x,Math.max(px,it.y-s*1.05-px*.7),String(it.kk),px);}}
  /* корзинка */
  function drawBasket(g,t){const {x,y,s}=bask,b=st.bump>0?1+.08*Math.sin(st.bump*Math.PI):1,w=s*.95,h=s*.5;g.save();g.translate(x,y);g.scale(b,b);
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,s*.02,w*.55,s*.08,0,0,7);g.fill();
    g.strokeStyle=tn('#7a5428');g.lineWidth=s*.05;g.beginPath();g.ellipse(0,-h,w*.36,s*.42,0,Math.PI,0);g.stroke();
    g.fillStyle=tn('#5a3a18');g.beginPath();g.ellipse(0,-h,w/2,s*.1,0,0,7);g.fill();
    const n=st.inB.length;for(let i=0;i<Math.min(14,n);i++){const k=st.inB[i],xx=(((i*37)%100)/100-.5)*w*.75,yy=-h+s*.04-Math.floor(i/5)*s*.07;mush(g,xx,yy,s*.32,k,1,0,null);}
    const bg=g.createLinearGradient(0,-h,0,0);bg.addColorStop(0,tn('#c8944a'));bg.addColorStop(1,tn('#8a5a28'));g.fillStyle=bg;g.beginPath();g.moveTo(-w/2,-h);g.quadraticCurveTo(-w*.48,-h*.1,-w*.32,0);g.lineTo(w*.32,0);g.quadraticCurveTo(w*.48,-h*.1,w/2,-h);g.quadraticCurveTo(0,-h+s*.1,-w/2,-h);g.fill();
    g.strokeStyle='rgba(80,45,15,.45)';g.lineWidth=s*.018;for(let i=1;i<4;i++){g.beginPath();g.moveTo(-w/2+w*.03*i,-h+h*i/4);g.quadraticCurveTo(0,-h+h*i/4+s*.06,w/2-w*.03*i,-h+h*i/4);g.stroke();}
    for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(i*w*.1,-h+s*.08);g.lineTo(i*w*.075,0);g.stroke();}
    g.strokeStyle=tn('#a87438');g.lineWidth=s*.04;g.beginPath();g.moveTo(-w/2,-h);g.quadraticCurveTo(0,-h+s*.1,w/2,-h);g.stroke();g.restore();}
  /* поплавок Петровича — мягкая «полоска»: к концу пляшет, в конце — клюёт */
  function drawRod(g,t){const u=LL.u,k=st.gt/pl.D,bob=st.ph==='end'?Math.sin(t*14)*u*.8+u*1.2:Math.sin(t*2.2)*u*.25+(k>.8&&st.ph==='play'?Math.sin(t*9)*u*.3*(k-.8)*5:0);
    const hx=petr.x-petr.s*.14,hy=petr.yb-petr.s*.5,tx=hx-petr.s*.6,ty=hy-petr.s*.5;g.strokeStyle=tn('#4a3a2a');g.lineWidth=Math.max(1.5,u*.45);g.beginPath();g.moveTo(hx,hy);g.lineTo(tx,ty);g.stroke();
    g.strokeStyle='rgba(240,240,235,.55)';g.lineWidth=1;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo((tx+flt.x)/2,(ty+flt.y)/2+u*3,flt.x,flt.y+bob);g.stroke();
    g.fillStyle='#e03131';g.fillRect(flt.x-u*.35,flt.y+bob-u*1.4,u*.7,u*1.4);g.fillStyle='#fff';g.fillRect(flt.x-u*.35,flt.y+bob-u*.5,u*.7,u*.5);
    g.strokeStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(flt.x,flt.y+u*.2,u*(1.5+Math.sin(t*2)*.3),u*.4,0,0,7);g.stroke();}
  let res=null,finBtn=null;
  function finish(){if(st.ph!=='play')return;st.ph='end';st.fin=0;MAK.snd('bell');const r=outcome(st.good,st.bad);res={score:r.sc,tier:r.tier,good:st.good,bad:st.bad,rec:r.sc>best&&r.sc>0};
    st.say={tx:T(['Клюёт! Всё, грибы — в корзину, я к удочке!','A bite! Mushrooms in the basket — I’m off to the rod!']),t:0,d:3};st.petr={pose:'cheer',pt:0};
}
  function drawFin(g,dt){if(st.closed)return;st.fin+=dt;const L=LL,W=L.W,H=L.H,u=L.u,k=Math.max(0,(st.fin-1.6)/.5);if(k<=0)return;
    if(!finBtn&&k>=1){finBtn=1;const b=ui.next(()=>{MAK.snd('tap');b.remove();ui.clear();st.closed=1;st.say.t=99;try{frame(0);}catch(e){}host.done({score:res.score,tier:res.tier,rec:res.rec,extra:o.train?{}:{line:T(['В корзинке: ','In the basket: '])+Object.keys(st.kk).map(k=>T(KINDS[k].n)+' '+st.kk[k]).join(', ')+(res.bad?T([' · мухоморов тронуто: ',' · bad ones touched: '])+res.bad:''),
        give:()=>{try{if(!S.mg.griby||typeof S.mg.griby!=='object')S.mg.griby={};const z=S.mg.griby;z.k=z.k&&typeof z.k==='object'?z.k:{};for(const k in st.kk)z.k[k]=(z.k[k]|0)+st.kk[k];z.t=Date.now();}catch(e){}}}});});
      if(!o.calm)MAK.burst(st.parts,W/2,H*.42,{n:res.tier*12,col:['#ffd27a','#ff8f4f','#6be3b0','#fff'],k:'star',sp:320,g:420,s:6,d:1.2});MAK.snd(res.tier>=2?'catch':'coin');}
    const e=MAK.ease.out(Math.min(1,k));g.save();g.globalAlpha=e*.62;g.fillStyle='#0a1218';g.fillRect(0,0,W,H);g.restore();
    const cw=Math.min(W-32,440),ch=Math.min(H*.52,u*(L.land?62:74)),cx=W/2,cy=H*.44-(1-e)*u*6;g.save();g.globalAlpha=e;
    g.fillStyle='rgba(16,26,36,.86)';rr(g,cx-cw/2,cy-ch/2,cw,ch,24);g.fill();g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1;g.stroke();
    const sr=Math.min(u*6,30);MAK.stars(g,cx,cy-ch/2+sr*1.6,sr,res.tier,Math.min(1,(st.fin-1.9)*1.6),st.fin);
    // грибы рядком по видам
    const ks=Object.keys(st.kk),gs=Math.min(u*13,cw/(ks.length+1)/0.9);ks.forEach((kk,i)=>{const x=cx+(i-(ks.length-1)/2)*gs*1.05,y=cy-ch/2+sr*3+gs*1.05;mush(g,x,y,gs,kk,1,0,null);MAK.txt(g,'×'+st.kk[kk],x+gs*.32,y-gs*.05,Math.max(17,gs*.3),{col:'#fff'});});
    if(!ks.length)MAK.txt(g,T(['Корзинка пустая','The basket is empty']),cx,cy-u*2,Math.max(18,u*4.5),{col:'rgba(255,255,255,.8)',ol:false});
    const px=Math.max(24,Math.min(34,u*7.5));MAK.txt(g,o.train?T(['Тренировка','Practice']):T(['Грибы +','Mushrooms +'])+res.good,cx,cy+ch*.22,px,{col:'#ffd27a'});
    MAK.txt(g,T(['Счёт: ','Score: '])+res.score+(res.bad?T([' · мухоморов: ',' · bad: '])+res.bad:'')+(res.rec?T([' · рекорд!',' · record!']):''),cx,cy+ch*.22+px*1.25,Math.max(18,px*.62),{col:'rgba(255,255,255,.88)',ol:false});
    g.restore();}
  function frame(dt){const g=LL.g,L=LL,W=L.W,H=L.H,u=L.u;st.t+=dt;const t=st.t;
    g.drawImage(MAK.forest(L,P,{hz:A.hz,gy:A.gy}),0,0,W,H);
    if(!o.calm){MAK.birds(g,L,t,2);MAK.leaves(st.leaves,L,dt,g,false);}
    st.petr.pt+=dt;if(st.petr.pose!=='idle'&&st.petr.pt>(st.petr.pose==='talk'?st.say.d:1.6))st.petr={pose:'idle',pt:0};
    let tgt=null;for(const it of st.act)if(!it.done&&it.t>=HINT){tgt=it;break;}
    drawRod(g,t);MAK.petr(g,petr.x,petr.yb,petr.s,{t,tn,pose:st.petr.pose,look:tgt?Math.max(-1,Math.min(1,(tgt.x-petr.x)/(W*.3))):-.6});
    if(st.ph==='play'){st.gt+=dt;while(st.next<pl.list.length&&pl.list[st.next].t<=st.gt){spawn(pl.list[st.next]);st.next++;}
      for(let i=st.act.length-1;i>=0;i--){const it=st.act[i];it.t+=dt;if((it.done===1)||it.t>HINT+it.life){if(!it.done&&KINDS[it.e.k].ok)st.streak=0;st.act.splice(i,1);}}
      if(st.gt>=pl.D&&!st.act.some(a=>!a.done))finish();}
    // грибы (по глубине)
    const vis=st.act.filter(a=>a.done!==1).sort((a,b)=>a.y-b.y);
    for(const it of vis){const s=sz(it.y),a=it.t,act=a>=HINT,end=Math.max(0,Math.min(1,(a-HINT-it.life+.3)/.3)),grow=act?MAK.ease.back(Math.min(1,(a-HINT)/.3))*(1-end):a/HINT*.35;
      const sx=it.bad&&!o.calm?Math.sin(a*40)*u*.6:0,dark=P.tod==='night'||P.tod==='evening';if(dark&&grow>.2){if(LOW)glowSp(g,it.x,it.y-s*.4,s*1.3,'255,220,150',.45);else{const gl=g.createRadialGradient(it.x,it.y-s*.4,1,it.x,it.y-s*.4,s*1.3);gl.addColorStop(0,'rgba(255,220,150,.45)');gl.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=gl;g.fillRect(it.x-s*1.3,it.y-s*1.7,s*2.6,s*2.6);}}
      mush(g,it.x+sx,it.y,s,it.e.k,grow,a,dark?(c=>mixH(c,tn(c),.4)):tn);
      // листья прикрывают ножку
      g.fillStyle=tn('#c8862a');g.beginPath();g.ellipse(it.x-s*.25,it.y,s*.22,s*.07,.3,0,7);g.fill();g.fillStyle=tn('#d8a030');g.beginPath();g.ellipse(it.x+s*.2,it.y+s*.02,s*.2,s*.06,-.4,0,7);g.fill();
      if(!act&&!o.calm){g.strokeStyle='rgba(255,240,200,'+(.5*(1-a/HINT))+')';g.lineWidth=1.5;g.beginPath();g.arc(it.x,it.y-s*.1,s*(.3+a/HINT*.4),Math.PI,0);g.stroke();}}
    st.cat.t+=dt;if((st.cat.k==='happy'&&st.cat.t>1.6)||(st.cat.k==='alarm'&&st.cat.t>1.2))st.cat={k:'sit',t:0};
    MAK.cat(g,cat.x,cat.yb,cat.s,{t,tn,k:st.cat.k,look:tgt?(tgt.x-cat.x)/(W*.25):Math.sin(t*.4)*.3});
    if(st.ph==='play')drawKeys(g);else MAK.cur(LL.c,false);
    drawBasket(g,t);if(st.bump>0)st.bump=Math.max(0,st.bump-dt*4);
    MAK.flies(g,st.flies,dt);MAK.parts(g,st.parts,dt);
    if(st.hand&&st.ph==='play'&&tgt&&KINDS[tgt.e.k].ok){const s=sz(tgt.y);MAK.hand(g,tgt.x,tgt.y-s*.5,u,t);}
    st.say.t+=dt;if(st.say.tx&&st.say.t<st.say.d){const a=Math.min(1,st.say.t*4,(st.say.d-st.say.t)*3);MAK.bubble(g,petr.x,petr.yb-petr.s*1.02,st.say.tx,L,{a,ax:.6,who:T(['Петрович','Petrovich'])});}
    MAK.hud(g,L,null,T(['Грибы: ','Mushrooms: '])+st.good,{bump:st.bump,drawIc:(gg,x,y,r)=>mush(gg,x,y+r*.7,r*1.6,'bel',1,0,null)},st.gt/pl.D,st.ph==='intro'?null:T(['Пока у Петровича не клюнуло','Until Petrovich gets a bite']));
    if(st.ph==='end')drawFin(g,dt);}
  host.el.__t={st,tap,act:()=>st.act.filter(it=>!it.done&&it.t>=HINT&&KINDS[it.e.k].ok).map(it=>({x:it.x,y:it.y-sz(it.y)*.45})),skip(){st.gt=pl.D;}};
  ui.intro({title:T(['Грибы у берега','Mushrooms by the Shore']),sub:T(['Сезон до 31 октября','Season until October 31']),art:null,train:o.train,
    lines:[MAK.pcw(host,T(['Из-под листьев выглядывают грибы. <b>Белый, подберёзовик, подосиновик, лисички</b> — коснись, гриб прыгнет в корзинку.','Mushrooms peek out from the leaves. <b>Porcini, boletes, chanterelles</b> — tap to put them in the basket.'])),
      T(['<b>Мухомор</b>'+(o.calm?'':' и бледную поганку (белая юбочка на ножке)')+' — не трогать! Спешить некуда — пока у Петровича не клюнуло.','Leave the <b>fly agaric</b>'+(o.calm?'':' and the pale death cap')+' alone! No rush — until Petrovich gets a bite.'])]
      .concat(host.pc?[T(['<b>Клавиши:</b> цифра над грибом ','<b>Keys:</b> the number above a mushroom '])+MAK.kc('1')+MAK.kc('2')+MAK.kc('3')]:[]),btn:T(['Пойти по грибы','Go picking'])})
    .then(()=>{st.ph='play';st.gt=0;st.petr={pose:'point',pt:0};
      if(host.kbd)host.kbd(T(['Щёлкай по грибу или жми цифру над ним: ','Click a mushroom or press the number above it: '])+MAK.kc('1')+MAK.kc('2')+MAK.kc('3'),7);});
  // картинка-гриб во вступлении
  {const im=ui.el.querySelector('.mak-hd');if(im){const c=document.createElement('canvas');c.width=c.height=152;c.style.cssText='width:76px;height:76px;flex:none;margin:-10px 12px -6px -6px';const gg=c.getContext('2d');gg.scale(2,2);mush(gg,30,70,40,'bel',1,0,null);mush(gg,54,72,30,'osina',1,0,null);im.insertBefore(c,im.firstChild);}}
  MAK.loop(host,frame);
}
MG_REG({id:'griby',n:{ru:'Грибы у берега',en:'Mushrooms by the shore'},icon:'<path class="d" d="M4 12a8 7 0 0116 0z"/><path d="M10 12v6a2 2 0 004 0v-6M8 9h.01M15 8h.01"/>',kind:'daily',open:season,run,bot:(lv)=>bot(lv,{seed:1,day:0}),season,
  // коллекция видов S.mg.griby.k — счётчики, при слиянии облака максимум по виду
  merge:(a,b)=>{a=a&&typeof a==='object'?a:{};b=b&&typeof b==='object'?b:{};const k=Object.assign({},a.k||{});for(const x in b.k||{})k[x]=Math.max(k[x]|0,b.k[x]|0);return {k,t:Math.max(a.t|0,b.t|0)};},
  fix:z=>{if(!z||typeof z!=='object')return {k:{}};if(!z.k||typeof z.k!=='object')z.k={};for(const x in z.k)if(!(z.k[x]>=0))delete z.k[x];return z;}});
})();
