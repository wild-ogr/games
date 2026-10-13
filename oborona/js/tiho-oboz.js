'use strict';
/* ob2-TIHO №28 «Обоз» (id oboz): уложи припасы в телегу — головоломка без таймера (по мотивам «Авоськи» Гастронома / «Багажника» Выезда, код и рисунок свои).
   Кузов — сетка C×R (5×4 … 6×5: по пройденным землям o.lvl и зерну дня). Набор припасов — разбиение кузова по зерну дня (o.rnd, у всех одинаково),
   значит, решение есть всегда (оно и подсказывается). Перетаскивание пальцем/мышью с привязкой к клеткам (ляжет — зелёным, нет — красным),
   касание припаса на земле — поворот, касание уложенного — снять обратно. Подсказка «Пахом подскажет»: 1 бесплатно, дальше — за рекламу (раз).
   Счёт: 100 + бонус за малое число ходов − 15 за подсказку; ступень 3 — без подсказок, 2 — с одной, 1 — больше.
   ПК: ←/→ — выбрать припас, R или ↑ — повернуть, Enter — взять в телегу, стрелки — двигать, Enter — положить, Esc — отмена, Backspace — снять последний. */
(function(){
if(typeof TIHO==='undefined')return;
const TQ=TIHO,TAU2=Math.PI*2;
const snd=k=>{try{if(SND[k])SND[k]();}catch(e){}};
/* ---------- фигуры ---------- */
const SH={chest:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],barrel:[[0,0],[1,0],[0,1],[1,1]],box3:[[0,0],[1,0],[2,0]],logs:[[0,0],[0,1],[1,1]],sack:[[0,0],[1,0]],ball:[[0,0]],pie:[[0,0]]};
const W8={chest:2,barrel:2,box3:3,logs:3,sack:3,ball:1,pie:1};
const NM={chest:['сундук','chest'],barrel:['бочка','barrel'],box3:['ящик стрел','arrow crate'],logs:['дрова','firewood'],sack:['мешок','sack'],ball:['ядра','cannonballs'],pie:['пирог','pie']};
function norm(c){let mx=1e9,my=1e9;for(const p of c){mx=Math.min(mx,p[0]);my=Math.min(my,p[1]);}return c.map(p=>[p[0]-mx,p[1]-my]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);}
function rotN(c,n){let r=norm(c);for(let i=0;i<(n&3);i++)r=norm(r.map(p=>[-p[1],p[0]]));return r;}
function dims(c){let w=0,h=0;for(const p of c){w=Math.max(w,p[0]+1);h=Math.max(h,p[1]+1);}return {w,h};}
function sizeFor(o,R){const lv=o.lvl|0,b=lv<2?0:lv<5?1:2,j=Math.min(3,b+(R()<.4?1:0));return [[5,4],[6,4],[5,5],[6,5]][j];}
/* разбиение кузова: первая пустая клетка (по строкам) — фигура, накрывающая её; одиночек не больше двух, сундук — один */
function gen(C,Rw,R){for(let tr=0;tr<80;tr++){const occ=[];for(let i=0;i<C*Rw;i++)occ.push(-1);const P=[];let ones=0,ch=0,ok=true;
  for(let e=0;e<C*Rw&&ok;e++){if(occ[e]>=0)continue;const ex=e%C,ey=Math.floor(e/C),cand=[];
    for(const k in SH){if(k==='chest'&&ch)continue;if(SH[k].length===1&&ones>=2&&tr<60)continue;for(let r=0;r<4;r++){const c=rotN(SH[k],r),dx=ex-c[0][0],dy=ey-c[0][1];
      if(c.every(p=>{const x=p[0]+dx,y=p[1]+dy;return x>=0&&y>=0&&x<C&&y<Rw&&occ[y*C+x]<0;}))cand.push({k,r,dx,dy,w:W8[k]});}}
    if(!cand.length){ok=false;break;}let sum=0;for(const c of cand)sum+=c.w;let q=R()*sum,pick=cand[0];for(const c of cand){q-=c.w;if(q<=0){pick=c;break;}}
    const id=P.length;for(const p of rotN(SH[pick.k],pick.r))occ[(p[1]+pick.dy)*C+p[0]+pick.dx]=id;if(SH[pick.k].length===1)ones++;if(pick.k==='chest')ch++;
    P.push({k:pick.k,sol:{r:pick.r,x:pick.dx,y:pick.dy}});}
  if(ok&&P.length>=5)return P;}
  const P=[];for(let y=0;y<Rw;y++)for(let x=0;x<C;x+=2)P.push({k:'sack',sol:{r:0,x,y}});return P;}
/* ---------- рисунок припасов: x,y — левый верх рамки, cs — клетка ---------- */
function rr(g,x,y,w,h,r,col,o){rrect(g,x,y,w,h,r);g.fillStyle=o&&o.flat?col:grad(g,x+w/2,y+h/2,Math.max(w,h)/2,col,.3,-.3);g.fill();g.lineWidth=Math.max(1.2,(o&&o.lw)||2);g.strokeStyle=shade(col,-.6);g.stroke();}
function drawObj(g,p,x,y,cs){const c=p.cells,d=dims(c),w=d.w*cs,h=d.h*cs,m=Math.max(2,cs*.07),k=p.k,L=Math.max(w,h),hor=w>=h;
  g.save();g.lineJoin='round';g.lineCap='round';
  if(k==='chest'){rr(g,x+m,y+m,w-2*m,h-2*m,cs*.18,'#9a5a2a');const lid=hor?h*.36:w*.36;
    if(hor)ln(g,[x+m,y+lid,x+w-m,y+lid],'#5a3010',cs*.07);else ln(g,[x+lid,y+m,x+lid,y+h-m],'#5a3010',cs*.07);
    for(const f of[.18,.82]){if(hor){g.fillStyle='#e6b53a';g.fillRect(x+w*f-cs*.08,y+m,cs*.16,h-2*m);}else{g.fillStyle='#e6b53a';g.fillRect(x+m,y+h*f-cs*.08,w-2*m,cs*.16);}}
    const lx=hor?x+w/2:x+lid,ly=hor?y+lid:y+h/2;rr(g,lx-cs*.16,ly-cs*.14,cs*.32,cs*.34,cs*.06,'#e6b53a',{lw:1.4});ell(g,lx,ly+cs*.04,cs*.04,cs*.06,'#3a2010',{ol:false,flat:true});shine(g,x+w*.3,y+h*.25,w*.12,h*.08,.3);}
  else if(k==='barrel'){const cx=x+w/2,cy=y+h/2,rx=w/2-m,ry=h/2-m;shp(g,'#b07a40',{hl:.35,lw:2},[x,y,x+w,y+h],()=>{g.moveTo(cx-rx*.8,cy-ry);g.quadraticCurveTo(cx-rx*1.15,cy,cx-rx*.8,cy+ry);g.lineTo(cx+rx*.8,cy+ry);g.quadraticCurveTo(cx+rx*1.15,cy,cx+rx*.8,cy-ry);g.closePath();});
    for(const f of[-.62,.62])ln(g,[cx-rx*.92,cy+ry*f,cx+rx*.92,cy+ry*f],'#4a4a54',cs*.09);for(const f of[-.35,0,.35])ln(g,[cx+rx*f,cy-ry*.95,cx+rx*f*1.08,cy+ry*.95],'rgba(80,45,15,.45)',1.3);
    ell(g,cx,cy-ry*.88,rx*.62,ry*.1,'#8a5a2a',{lw:1.2});shine(g,cx-rx*.45,cy-ry*.2,rx*.1,ry*.35,.35);}
  else if(k==='box3'){rr(g,x+m,y+m,w-2*m,h-2*m,cs*.08,'#c8955a');const n=3;for(let i=1;i<n;i++){if(hor)ln(g,[x+m,y+h*i/n,x+w-m,y+h*i/n],'rgba(90,50,20,.5)',1.4);else ln(g,[x+w*i/n,y+m,x+w*i/n,y+h-m],'rgba(90,50,20,.5)',1.4);}
    if(hor)ln(g,[x+m*2,y+m*2,x+w-m*2,y+h-m*2],'#8a5a2a',cs*.1);else ln(g,[x+m*2,y+h-m*2,x+w-m*2,y+m*2],'#8a5a2a',cs*.1);
    for(let i=0;i<4;i++){const f=.2+i*.2;const ax=hor?x+w*f:x+w/2+(i-1.5)*cs*.14,ay=hor?y+h/2+(i-1.5)*cs*.1:y+h*f;
      g.save();g.translate(hor?x+w-m*.5:ax,hor?ay:y+m*.5);g.rotate(hor?0:-Math.PI/2);poly(g,[0,0,cs*.22,-cs*.09,cs*.18,0,cs*.22,cs*.09],'#e8433a',{lw:1});g.restore();}}
  else if(k==='sack'){const cx=x+w/2,cy=y+h/2,rx=w/2-m,ry=h/2-m;ell(g,cx+(hor?-rx*.08:0),cy+(hor?0:ry*.08),rx*.95,ry*.92,'#d8be86',{lw:2,hl:.35});
    const tx=hor?x+w-m*2.2:cx,ty=hor?cy:y+m*2.2;ell(g,tx,ty,cs*.14,cs*.14,'#c8ae76',{lw:1.4});ln(g,hor?[tx-cs*.05,ty-cs*.17,tx-cs*.05,ty+cs*.17]:[tx-cs*.17,ty+cs*.05,tx+cs*.17,ty+cs*.05],'#8a5a2a',cs*.06);
    g.save();g.translate(cx-(hor?rx*.1:0),cy+(hor?0:ry*.08));if(!hor)g.rotate(-Math.PI/2);g.fillStyle='rgba(120,80,30,.55)';g.font='900 '+Math.round(cs*.3)+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(Lg('МУКА','FLOUR'),0,0);g.restore();}
  else if(k==='logs'){for(const q of c){const bx=x+q[0]*cs,by=y+q[1]*cs;for(const[ox,oy,r]of[[.3,.32,.22],[.7,.32,.22],[.5,.7,.24],[.2,.72,.16],[.8,.72,.16]]){ell(g,bx+cs*ox,by+cs*oy,cs*r,cs*r,'#c89a5a',{lw:1.4,hl:.2});
      g.strokeStyle='rgba(120,70,30,.6)';g.lineWidth=1;g.beginPath();g.arc(bx+cs*ox,by+cs*oy,cs*r*.5,0,TAU2);g.stroke();}}
    for(let i=0;i<c.length-1;i++){const a=c[i],b=c[i+1];ln(g,[x+(a[0]+.5)*cs,y+(a[1]+.5)*cs,x+(b[0]+.5)*cs,y+(b[1]+.5)*cs],'rgba(200,40,30,.85)',cs*.08);}}
  else if(k==='ball'){rr(g,x+m,y+cs*.45,w-2*m,h-cs*.45-m,cs*.06,'#9a6a3a');for(const[ox,oy]of[[.32,.52],[.68,.52],[.5,.3]])ell(g,x+cs*ox,y+cs*oy,cs*.18,cs*.18,'#3a3a46',{hl:.6,lw:1.2});}
  else if(k==='pie'){const cx=x+w/2,cy=y+h*.58;ell(g,cx,cy+cs*.06,cs*.4,cs*.2,'#e8e0d0',{lw:1.2});shp(g,'#e8a84a',{hl:.45,lw:1.6},[cx-cs*.36,cy-cs*.28,cx+cs*.36,cy+cs*.1],()=>{g.moveTo(cx-cs*.36,cy+cs*.04);g.quadraticCurveTo(cx-cs*.3,cy-cs*.3,cx,cy-cs*.3);g.quadraticCurveTo(cx+cs*.3,cy-cs*.3,cx+cs*.36,cy+cs*.04);g.closePath();});
    for(const f of[-.15,0,.15])ln(g,[cx+cs*f-cs*.04,cy-cs*.18,cx+cs*f+cs*.04,cy-cs*.08],'#a8641a',1.4);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.4;g.beginPath();g.moveTo(cx-cs*.08,y+cs*.18);g.quadraticCurveTo(cx,y+cs*.08,cx-cs*.04,y+cs*.02);g.stroke();}
  g.restore();}
/* ---------- игра ---------- */
const SAY={hi:['Обоз к заставе собираем! Уложи припасы в телегу — всё до последнего мешка. <b>Ядра — вниз, пироги — сверху</b>, а то воевода опять будет есть блин с ядром.','We’re packing the supply cart for the outpost! Fit everything in, down to the last sack. <b>Cannonballs at the bottom, pies on top</b> — or the commander gets a pancake with a cannonball again.'],
  put:[['Ладно легло!','Fits nicely!'],['Как влитое.','Like it was made for it.'],['Вот это по-хозяйски!','Now that’s proper packing!'],['Лошадка одобряет.','The horse approves.']],
  rot:[['Повернул — уже другое дело.','Turned it — that’s better.'],['А ну-ка, боком!','Let’s try it sideways!']],
  bad:[['Не лезет. Телега не резиновая!','Won’t fit. The cart isn’t made of rubber!'],['Сюда не встанет — тут уже занято.','Can’t go there — it’s taken.']],
  pieTop:[['Пирог на дне? К вечеру будет лепёшка…','A pie at the bottom? By evening it’ll be a pancake…']],
  ballUp:[['Ядра наверху? На кочке — прямо воеводе в кашу!','Cannonballs on top? One bump — straight into the commander’s porridge!']],
  hint:[['Дай-ка я… Вот так оно ложится.','Let me… This is where it goes.']],
  out:[['Снял — переложим.','Took it out — let’s repack.']],
  win:[['Ровнёхонько! Н-но, родимая! Обоз пошёл.','Perfect! Giddy-up! The cart is rolling.']]};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function run(host,o){TQ.css();const cv=MGK.canvas(host),g=cv.getContext('2d'),R=o.rnd||TQ.rnd(o.seed||1),pc=mgPC(),calm=o.calm;
  const sz=sizeFor(o,R),C=sz[0],RW=sz[1],P=gen(C,RW,R);
  P.forEach((p,i)=>{p.i=i;p.r=Math.floor(R()*4);if(p.k==='barrel'||p.k==='ball'||p.k==='pie')p.r=0;p.cells=rotN(SH[p.k],p.r);p.at=null;});
  TQ.shuf(P,R);P.forEach((p,i)=>p.i=i);
  const st={moves:0,hints:0,adHint:0,drag:null,sel:0,kb:null,end:false,go:0,t:0,say:L(SAY.hi).replace(/<\/?b>/g,'').split('.')[0]+'.',sayT:0,fx:[]};
  function L(a){return Lg(a[0],a[1]);}
  function occ(){const a=[];for(let i=0;i<C*RW;i++)a.push(-1);for(const p of P)if(p.at)for(const q of p.cells)a[(q[1]+p.at.y)*C+q[0]+p.at.x]=p.i;return a;}
  function fits(p,cells,x,y,O){O=O||occ();return cells.every(q=>{const cx=q[0]+x,cy=q[1]+y;return cx>=0&&cy>=0&&cx<C&&cy<RW&&(O[cy*C+cx]<0||O[cy*C+cx]===p.i);});}
  /* раскладка */
  function lay(){const W=cv.W,H=cv.H,wide=W>H*1.05,topH=wide?70:84,barH=76;let cs,gx,gy,tr;
    if(wide){cs=Math.floor(Math.min((W*.52-90)/C,(H-topH-barH-70)/RW,74));gx=Math.round(Math.max(W*.29-C*cs/2+40,cs*2.1+10));gy=Math.round(topH+(H-topH-barH-RW*cs-cs)/2);tr={x:W*.55,y:topH+6,w:W*.45-14,h:H-topH-barH-12};}
    else{cs=Math.floor(Math.min((W-96)/C,(H-topH-barH)*.46/RW,62));gx=Math.round(W-C*cs-14);gy=topH+8;const yb=gy+RW*cs+cs*.85;tr={x:8,y:yb,w:W-16,h:H-barH-yb-4};}
    return {W,H,wide,cs,gx,gy,tr};}
  function trayPack(Y){const L0=P.filter(p=>!p.at&&!(st.drag&&st.drag.p===p));let ts=Math.min(Y.cs*.85,Y.wide?62:48);
    for(let it=0;it<14;it++){let x=0,y=0,rowH=0,ok=true;const pos=[];for(const p of L0){const d=dims(p.cells),w=d.w*ts,h=d.h*ts;if(x+w>Y.tr.w&&x>0){x=0;y+=rowH+10;rowH=0;}pos.push({p,x:Y.tr.x+x,y:Y.tr.y+y,ts});x+=w+12;rowH=Math.max(rowH,h);}
      if(y+rowH<=Y.tr.h){const used=y+rowH,oy=Math.max(0,(Y.tr.h-used)/2);for(const q of pos){q.y+=oy;q.p.tp=q;}
        // строки по центру
        const rows={};for(const q of pos){(rows[q.y]=rows[q.y]||[]).push(q);}for(const k in rows){const a=rows[k],l=a[a.length-1],wR=l.x+dims(l.p.cells).w*ts-Y.tr.x,dx=(Y.tr.w-wR)/2;for(const q of a)q.x+=dx;}
        return;}ts*=.9;}
    for(const p of L0)p.tp={p,x:Y.tr.x,y:Y.tr.y,ts:ts};}
  /* речь Пахома и счёт сверху */
  function top(){const n=P.filter(p=>p.at).length;TQ.top(host,'<b>'+Lg('Обоз','The Supply Cart')+' · '+n+' / '+P.length+'</b>'+st.say+'<br><small style="font-size:13px">'+Lg('Ходов: ','Moves: ')+st.moves+(st.hints?Lg(' · подсказок: ',' · hints: ')+st.hints:'')+'</small>');}
  function say(a){st.say=L(a);top();}
  const bar=TQ.bar(host);
  function barUI(){if(st.end){bar.innerHTML='';return;}let h='';
    if(st.hints<1)h+='<button class="btn" id="tqHint">'+Lg('💡 Пахом подскажет','💡 Ask Pakhom')+'</button>';
    else if(!st.adHint&&host.adOk()&&!o.train)h+='<button class="btn ad" id="tqHint">'+Lg('🎬 Подсказка за рекламу','🎬 Hint for an ad')+'</button>';
    else if(!st.adHint&&o.train)h+='<button class="btn" id="tqHint">'+Lg('💡 Ещё подсказка','💡 Another hint')+'</button>';
    bar.innerHTML=h;const b=$('tqHint');if(b)b.onclick=()=>{snd('click');if(st.hints<1||o.train){hint();return;}b.disabled=true;host.ad('hint').then(ok=>{b.disabled=false;if(ok){st.adHint=1;hint();}});};
    if(pc&&!host.el.querySelector('.tqKeysOb')){const k=document.createElement('div');k.className='tqKey tqKeysOb';k.style.cssText='position:absolute;left:0;right:0;bottom:calc(var(--sb,0px) + 64px);z-index:5;color:#fff6dc;text-shadow:0 1px 2px #000;pointer-events:none';
      k.textContent=Lg('←/→ — припас · R — повернуть · Enter — в телегу, стрелки, Enter — положить · Backspace — снять','←/→ — item · R — rotate · Enter — to the cart, arrows, Enter — drop · Backspace — take out');host.el.appendChild(k);}}
  function place(p,x,y){p.at={x,y};st.moves++;snd('build');const Y=lay();
    if(!calm)MGK.burst(st.fx,Y.gx+(x+dims(p.cells).w/2)*Y.cs,Y.gy+(y+dims(p.cells).h/2)*Y.cs,{n:8,col:'#ffe27a',sp:110,g:0,d:.45});
    const bot=y+dims(p.cells).h>=RW,topRow=y===0;if(p.k==='pie'&&bot&&RW>3)say(pick(SAY.pieTop));else if((p.k==='ball')&&topRow)say(pick(SAY.ballUp));else say(pick(SAY.put));
    check();barUI();}
  function unplace(p){p.at=null;snd('click');}
  function rotate(p){if(p.k==='barrel'||p.k==='ball'||p.k==='pie'){say([['Её хоть верти, хоть нет — круглая!','Turn it or not — it’s round!']][0]);return;}p.r=(p.r+1)&3;p.cells=rotN(SH[p.k],p.r);snd('click');say(pick(SAY.rot));}
  function hint(){const O=occ();let p=P.find(q=>!q.at&&rotN(SH[q.k],q.sol.r).every(c=>O[(c[1]+q.sol.y)*C+c[0]+q.sol.x]<0));
    if(!p){p=P.find(q=>!q.at||q.at.x!==q.sol.x||q.at.y!==q.sol.y||q.r!==q.sol.r);if(!p)return;const sc=rotN(SH[p.k],p.sol.r);for(const c of sc){const id=O[(c[1]+p.sol.y)*C+c[0]+p.sol.x];if(id>=0&&id!==p.i)P[id].at=null;}}
    st.hints++;p.r=p.sol.r;p.cells=rotN(SH[p.k],p.r);p.at={x:p.sol.x,y:p.sol.y};if(st.kb&&st.kb.p===p)st.kb=null;snd('up');say(pick(SAY.hint));
    const Y=lay();if(!calm)MGK.burst(st.fx,Y.gx+(p.at.x+.5)*Y.cs,Y.gy+(p.at.y+.5)*Y.cs,{n:12,col:'#9ae06a',sp:120,g:0,d:.5});check();barUI();}
  function check(){if(st.end||P.some(p=>!p.at))return;st.end=true;st.drag=null;st.kb=null;say(pick(SAY.win));barUI();snd('win');
    const kb=host.el.querySelector('.tqKeysOb');if(kb)kb.remove();
    setTimeout(()=>{if(MG.cur&&MG.cur.host===host)finish();},calm?500:1900);}
  function finish(){const n=P.length,extra=Math.max(0,st.moves-n),score=Math.max(10,100+Math.max(0,40-4*extra)-15*st.hints),tier=st.hints===0?3:st.hints===1?2:1;
    host.done({score,tier,extra:{lbl:Lg('очков · припасов ','points · supplies ')+n+Lg(', ходов ',', moves ')+st.moves}});}
  /* ввод: касание/мышь */
  function hitTray(x,y){for(const p of P){if(p.at||!p.tp)continue;const t=p.tp;for(const c of p.cells)if(x>=t.x+c[0]*t.ts-4&&x<=t.x+(c[0]+1)*t.ts+4&&y>=t.y+c[1]*t.ts-4&&y<=t.y+(c[1]+1)*t.ts+4)return p;}return null;}
  function hitGrid(x,y,Y){const cx=Math.floor((x-Y.gx)/Y.cs),cy=Math.floor((y-Y.gy)/Y.cs);if(cx<0||cy<0||cx>=C||cy>=RW)return null;const id=occ()[cy*C+cx];return id>=0?P[id]:null;}
  function snap(d,Y){const x=Math.round((d.x-d.ox*Y.cs-Y.gx)/Y.cs),y=Math.round((d.y-d.lift-d.oy*Y.cs-Y.gy)/Y.cs);return {x,y,ok:fits(d.p,d.p.cells,x,y)};}
  function pos(e){const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  cv.addEventListener('pointerdown',e=>{if(host.paused||st.end||st.drag)return;const q=pos(e),Y=lay();let p=hitGrid(q.x,q.y,Y),from='grid',ox,oy;
    if(p){ox=(q.x-Y.gx)/Y.cs-p.at.x;oy=(q.y-Y.gy)/Y.cs-p.at.y;}else{p=hitTray(q.x,q.y);from='tray';if(!p)return;ox=(q.x-p.tp.x)/p.tp.ts;oy=(q.y-p.tp.y)/p.tp.ts;}
    st.drag={p,from,ox,oy,x:q.x,y:q.y,x0:q.x,y0:q.y,t0:performance.now(),moved:false,lift:0,touch:e.pointerType!=='mouse',was:p.at};st.kb=null;st.sel=Math.max(0,P.indexOf(p));
    try{cv.setPointerCapture(e.pointerId);}catch(x){}});
  cv.addEventListener('pointermove',e=>{const d=st.drag;if(!d)return;const q=pos(e);d.x=q.x;d.y=q.y;if(!d.moved&&Math.hypot(q.x-d.x0,q.y-d.y0)>8){d.moved=true;if(d.from==='grid')d.p.at=null;d.lift=d.touch?Math.min(40,lay().cs*.7):0;}});
  function up(e){const d=st.drag;if(!d)return;st.drag=null;const Y=lay();
    if(!d.moved){if(d.from==='tray')rotate(d.p);else{unplace(d.p);say(pick(SAY.out));}top();return;}
    const s=snap(d,Y);if(s.ok){if(d.was&&d.was.x===s.x&&d.was.y===s.y){d.p.at=d.was;top();return;}place(d.p,s.x,s.y);}else{d.p.at=null;snd('lose');say(pick(SAY.bad));}top();}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  /* клавиши */
  TQ.keys(host,k=>{if(st.end)return false;const free=P.filter(p=>!p.at);
    if(st.kb){const b=st.kb;if(k==='ArrowLeft'){b.x--;return true;}if(k==='ArrowRight'){b.x++;return true;}if(k==='ArrowUp'){b.y--;return true;}if(k==='ArrowDown'){b.y++;return true;}
      if(k==='r'||k==='R'||k==='к'||k==='К'){rotate(b.p);return true;}
      if(k==='Enter'||k===' '){if(fits(b.p,b.p.cells,b.x,b.y)){st.kb=null;place(b.p,b.x,b.y);}else{snd('lose');say(pick(SAY.bad));}top();return true;}
      if(k==='Escape'||k==='Backspace'){st.kb=null;return true;}return false;}
    if(k==='Backspace'){const pl=P.filter(p=>p.at);if(pl.length){unplace(pl[pl.length-1]);say(pick(SAY.out));}return true;}
    if(!free.length)return false;let i=Math.max(0,free.indexOf(P[st.sel]));
    if(k==='ArrowRight'||k==='ArrowLeft'){i=(i+(k==='ArrowRight'?1:free.length-1))%free.length;st.sel=P.indexOf(free[i]);return true;}
    const p=free[i];if(k==='r'||k==='R'||k==='к'||k==='К'||k==='ArrowUp'){rotate(p);top();return true;}
    if(k==='Enter'||k===' '){const O=occ();let bx=0,by=0,f=false;for(let y=0;y<RW&&!f;y++)for(let x=0;x<C&&!f;x++)if(fits(p,p.cells,x,y,O)){bx=x;by=y;f=true;}st.kb={p,x:bx,y:by};return true;}return false;});
  /* рисование */
  function scene(Y){const W=Y.W,H=Y.H,sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#8ec8ee');sk.addColorStop(.55,'#e4f2dc');g.fillStyle=sk;g.fillRect(0,0,W,H);
    const hz=Y.wide?Y.gy+RW*Y.cs*.5:Y.gy+RW*Y.cs*.6;for(let i=0;i<7;i++){const x=(i+.3)*W/6;ell(g,x,hz,W*.16,H*.08,'#7ab45a',{ol:false,flat:true});}
    g.fillStyle='#8ac05a';g.fillRect(0,hz,W,H-hz);g.fillStyle='#c8a46a';g.fillRect(0,Y.gy+RW*Y.cs+Y.cs*.55,W,Y.cs*.5);
    if(Y.wide){g.fillStyle='rgba(90,60,30,.18)';rrect(g,Y.tr.x-6,Y.tr.y-2,Y.tr.w+8,Y.tr.h+4,18);g.fill();}
    else{g.fillStyle='rgba(90,60,30,.16)';rrect(g,Y.tr.x,Y.tr.y-4,Y.tr.w,Y.tr.h+4,16);g.fill();}}
  function horse(x,y,s,ph){g.save();g.translate(x,y);const b=Math.sin(ph*9)*s*.04;
    for(const[lx,a]of[[-.55,1],[-.35,-1],[.35,1],[.55,-1]])ln(g,[lx*s,.1*s,lx*s+Math.sin(ph*9+a)*s*.08,.55*s],'#6a4026',s*.11);
    ell(g,0,-.05*s+b,.7*s,.32*s,'#9a6236',{lw:1.6});shp(g,'#9a6236',{lw:1.6},[-1.2*s,-.9*s,-.4*s,.1*s],()=>{g.moveTo(-.5*s,-.2*s+b);g.lineTo(-.85*s,-.75*s+b);g.quadraticCurveTo(-1.1*s,-.85*s+b,-1.2*s,-.6*s+b);g.lineTo(-.95*s,-.45*s+b);g.lineTo(-.65*s,.05*s+b);g.closePath();});
    for(let i=0;i<4;i++)ln(g,[-.6*s-i*.08*s,-.25*s-i*.14*s+b,-.5*s-i*.08*s,-.3*s-i*.14*s+b],'#3a2010',s*.08);ell(g,-.95*s,-.66*s+b,.05*s,.05*s,'#1a1010',{ol:false,flat:true});ln(g,[.7*s,-.1*s+b,.95*s,.3*s],'#3a2010',s*.1);
    shp(g,'#c0392b',{lw:1},[-.6*s,-.5*s,-.3*s,.1*s],()=>{g.arc(-.5*s,-.25*s+b,.22*s,-1.4,1.4);});g.restore();}
  function cart(Y,dx){const cs=Y.cs,x=Y.gx+dx,y=Y.gy,w=C*cs,h=RW*cs;
    ln(g,[x-cs*.2,y+h*.75,x-cs*.9,y+h*.6],'#6a4222',cs*.12);
    rr(g,x-cs*.18,y-cs*.12,w+cs*.36,h+cs*.3,cs*.12,'#8a5a2e');g.fillStyle='#5a3a1e';g.fillRect(x,y,w,h);
    for(let i=0;i<RW;i++){g.fillStyle=i%2?'#6a4626':'#704a28';g.fillRect(x,y+i*cs,w,cs);}
    g.strokeStyle='rgba(255,230,170,.18)';g.lineWidth=1;for(let i=1;i<C;i++){g.beginPath();g.moveTo(x+i*cs,y);g.lineTo(x+i*cs,y+h);g.stroke();}for(let i=1;i<RW;i++){g.beginPath();g.moveTo(x,y+i*cs);g.lineTo(x+w,y+i*cs);g.stroke();}
    for(const wx of[x+cs*.9,x+w-cs*.9]){const r=cs*.55,cy=y+h+cs*.25,a=st.go*3;ell(g,wx,cy,r,r,'#7a4a22',{lw:2});for(let i=0;i<6;i++)ln(g,[wx,cy,wx+Math.cos(a+i*1.047)*r*.85,cy+Math.sin(a+i*1.047)*r*.85],'#5a3014',cs*.07);ell(g,wx,cy,r*.2,r*.2,'#4a4a54',{lw:1});}}
  MGK.loop(host,dt=>{st.t+=dt;if(st.end)st.go+=dt*(calm?0:1);const Y=lay(),cs=Y.cs;trayPack(Y);g.setTransform(cv.D,0,0,cv.D,0,0);scene(Y);
    const dx=st.end?-Math.pow(Math.max(0,st.go-.5),2)*Y.W*.5:0;const hs=Math.max(14,Math.min(cs*.95,(Y.gx-6)/2.15));horse(Y.gx+dx-4-hs*.95,Y.gy+RW*cs*.62,hs,st.end?st.go:st.t*.15);cart(Y,dx);
    for(const p of P)if(p.at&&!(st.drag&&st.drag.p===p&&st.drag.moved))drawObj(g,p,Y.gx+dx+p.at.x*cs,Y.gy+p.at.y*cs,cs);
    const O=occ();// подсветка
    if(st.drag&&st.drag.moved){const s=snap(st.drag,Y);for(const c of st.drag.p.cells){const x=s.x+c[0],y=s.y+c[1];if(x<0||y<0||x>=C||y>=RW)continue;g.fillStyle=s.ok?'rgba(120,230,90,.45)':'rgba(240,70,50,.45)';g.fillRect(Y.gx+x*cs+2,Y.gy+y*cs+2,cs-4,cs-4);}}
    if(st.kb){const b=st.kb,ok=fits(b.p,b.p.cells,b.x,b.y,O);b.x=Math.max(-2,Math.min(C,b.x));b.y=Math.max(-2,Math.min(RW,b.y));g.globalAlpha=.75;drawObj(g,b.p,Y.gx+b.x*cs,Y.gy+b.y*cs,cs);g.globalAlpha=1;
      for(const c of b.p.cells){g.strokeStyle=ok?'#7cf05a':'#ff5040';g.lineWidth=3;g.strokeRect(Y.gx+(b.x+c[0])*cs+2,Y.gy+(b.y+c[1])*cs+2,cs-4,cs-4);}}
    const free=P.filter(p=>!p.at),selP=free.indexOf(P[st.sel])>=0?P[st.sel]:free[0];
    for(const p of free){if(st.drag&&st.drag.p===p&&st.drag.moved)continue;const t=p.tp;if(!t)continue;if(st.kb&&st.kb.p===p)g.globalAlpha=.35;
      if(pc&&selP===p&&!st.kb){const d=dims(p.cells);g.strokeStyle='#ffd84a';g.lineWidth=3;rrect(g,t.x-5,t.y-5,d.w*t.ts+10,d.h*t.ts+10,8);g.stroke();}
      g.fillStyle='rgba(40,25,10,.13)';for(const c of p.cells){rrect(g,t.x+c[0]*t.ts+2,t.y+c[1]*t.ts+4,t.ts-1,t.ts-1,4);g.fill();}drawObj(g,p,t.x,t.y,t.ts);g.globalAlpha=1;}
    if(st.drag&&st.drag.moved){const d=st.drag,x=d.x-d.ox*cs,y=d.y-d.lift-d.oy*cs;g.fillStyle='rgba(0,0,0,.2)';for(const c of d.p.cells)g.fillRect(x+c[0]*cs+6,y+c[1]*cs+10,cs,cs);drawObj(g,d.p,x,y,cs);}
    MGK.parts(g,st.fx,dt);});
  if(/[?&](bot|tqtest)\b/.test(location.search))TQ._oboz={st,P,C,RW,lay,solve(){for(const p of P){p.r=p.sol.r;p.cells=rotN(SH[p.k],p.r);p.at={x:p.sol.x,y:p.sol.y};}st.moves=P.length;check();}};
  top();TQ.intro(host,{who:'pakhom',t:Lg(SAY.hi[0],SAY.hi[1])+' '+Lg('Тащи припас в телегу, коснись — повернётся.','Drag an item into the cart; tap it to turn it.'),btn:Lg('Грузим!','Let’s load!'),key:Lg('Мышью — перетаскивать, щелчок — повернуть. Клавиши: ←/→, R, Enter, стрелки.','Mouse — drag, click — rotate. Keys: ←/→, R, Enter, arrows.')}).then(()=>{st.say=Lg('Тащи припас в телегу. Коснись — повернётся.','Drag items into the cart. Tap to rotate.');top();barUI();});}
TQ.def('oboz',{run,sim(o,k){const R=TQ.rnd((o.seed||1)>>>0),sz=sizeFor(o,R),n=gen(sz[0],sz[1],R).length,moves=n+Math.round((1-k)*n*1.2*R()),hints=R()>k?(R()<.5?1:2):0;
  return {score:Math.max(10,100+Math.max(0,40-4*(moves-n))-15*hints),tier:hints===0?3:hints===1?2:1};}});
})();
