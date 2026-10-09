'use strict';
/* vy-mgb: мини-игра №10 «Домино с дедом Митяем». 05-minigames.md №10. Правила и ИИ — из «Домино во дворе» Рыбалки (~/Projects/rybak/js/mg-domino.js),
   рисунок свой: стол доминошников во дворе пятиэтажки «Летнего двора», за столом — дед Митяй (облик из Рыбалки, VYB.mit).
   Партия 1 на 1, «дубль-шесть», по 7 костей, остальное — «базар». Ход: касание подходящей кости (подсвечены); подходит к обоим концам — касание нужного конца.
   Нечем ходить — «На базар» (базар пуст — «Пропускаю»). Конец: кто первым выложил все кости, или «Рыба!» (ходов нет ни у кого) — у кого меньше очков в руке.
   Играем «на интерес»: ступени — проиграл 0 (≤ 10 очков в руке — 1), ничья 1, выиграл 2, выиграл и у Митяя ≥ 18 очков — 3. Счёт — очки Митяя + 10 за победу.
   Сила Митяя: «ходит как попало» (как в Козле) — расчётливость 0,4…0,65 от пройденных дворов (o.lvl), спокойный режим — 0,3.
   Своё в сохранении: host.mem() {n: партий, w: побед} — для награды «стол доминошников» за 10 побед (решает оболочка/YARD: extra.w).
   Клавиши ПК: ←/→ (A/D, Ф/В) — выбрать кость (по подходящим), 1…9 — кость по порядку (как касание), Enter/пробел — положить;
   подходит к обоим концам — ←/→ выбрать конец, Enter — положить, ↓ — передумал; нечем ходить — Enter/пробел — на базар/пропуск. */
(function(){if(typeof VYMG_REG!=='function'||!window.VYB)return;
const V=window.VYB,L=V.L,PI=Math.PI,cl=(v,a,b)=>v<a?a:v>b?b:v;
/* ---------- правила (без рисования; ими же играет бот) ---------- */
function deal(seed){const R=V.R(seed*29+3),T=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)T.push([a,b]);V.mix(T,R);
  return {me:T.slice(0,7),pe:T.slice(7,14),bz:T.slice(14),chain:[],L:-1,R:-1,turn:'me',over:null};}
const pips=h=>h.reduce((s,t)=>s+t[0]+t[1],0);
const fitsL=(g,t)=>g.chain.length===0||t[0]===g.L||t[1]===g.L,fitsR=(g,t)=>g.chain.length===0||t[0]===g.R||t[1]===g.R;
function moves(g,h){const out=[];for(let i=0;i<h.length;i++){const t=h[i];if(g.chain.length===0){out.push({i,side:'R'});continue;}
  const l=fitsL(g,t),r=fitsR(g,t);if(l)out.push({i,side:'L'});if(r&&!(l&&g.L===g.R))out.push({i,side:'R'});}return out;}
function place(g,t,side,who){let c;if(g.chain.length===0){c={a:t[0],b:t[1],who};g.chain.push(c);g.L=t[0];g.R=t[1];return c;}
  if(side==='R'){c=t[0]===g.R?{a:t[0],b:t[1]}:{a:t[1],b:t[0]};c.who=who;g.R=c.b;g.chain.push(c);}
  else{c=t[1]===g.L?{a:t[0],b:t[1]}:{a:t[1],b:t[0]};c.who=who;g.L=c.a;g.chain.unshift(c);}return c;}
function opener(g){let best=-1,who='me',idx=-1;[['me',g.me],['pe',g.pe]].forEach(p=>p[1].forEach((t,i)=>{if(t[0]===t[1]&&t[0]>best){best=t[0];who=p[0];idx=i;}}));return {who,i:idx};}
function aiPick(g,h,k,R){const mv=moves(g,h);if(!mv.length)return null;if(R()>k)return mv[Math.floor(R()*mv.length)];
  let best=null,bv=-1e9;mv.forEach(m=>{const t=h[m.i];let v=t[0]+t[1]+(t[0]===t[1]?4:0);
    let ne=t[0]===(m.side==='L'?g.L:g.R)?t[1]:t[0];if(g.chain.length===0)ne=t[1];let keep=0;h.forEach((x,j)=>{if(j!==m.i&&(x[0]===ne||x[1]===ne))keep++;});v+=keep*2*k;
    if(v>bv){bv=v;best=m;}});return best;}
const blocked=g=>!g.bz.length&&!moves(g,g.me).length&&!moves(g,g.pe).length;
function result(g){const mp=pips(g.me),pp=pips(g.pe),win=g.over==='me'||g.over==='fish'&&mp<pp,draw=g.over==='fish'&&mp===pp;
  return {win,draw,tier:win?(pp>=18?3:2):draw?1:(mp<=10?1:0),score:win?pp+10:draw?5:0,mp,pp};}
function simulate(seed,me,k){const g=deal(seed),R=V.R(seed*7+1),op=opener(g);let turn=op.who;
  if(op.i>=0){const h0=turn==='me'?g.me:g.pe,t0=h0.splice(op.i,1)[0];place(g,t0,'R',turn);turn=turn==='me'?'pe':'me';}
  for(let n=0;n<200&&!g.over;n++){const h=turn==='me'?g.me:g.pe;let mv=aiPick(g,h,turn==='me'?me:k,R);
    while(!mv&&g.bz.length){h.push(g.bz.pop());mv=aiPick(g,h,turn==='me'?me:k,R);}
    if(mv){const t=h.splice(mv.i,1)[0];place(g,t,mv.side,turn);if(!h.length){g.over=turn;break;}}
    if(blocked(g)){g.over='fish';break;}turn=turn==='me'?'pe':'me';}
  if(!g.over)g.over='fish';return result(g);}
const aiK=o=>o.calm?.3:cl(.4+.002*(o.lvl||0),.4,.65);
/* ---------- рисунок кости: центр (x,y), короткая сторона w, длинная 2w; rot — поворот (0 — вертикально: a сверху, b снизу) ---------- */
const PIP={0:[],1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
function tile(g,x,y,w,a,b,rot,o){o=o||{};const rr=V.rr,ell=V.ell;g.save();g.translate(x,y);g.rotate(rot||0);const h=w*2,r=w*.16;
  if(!o.flat){g.fillStyle='rgba(0,0,0,.28)';rr(g,-w/2+w*.06,-h/2+w*.12,w,h,r);g.fill();}
  if(o.glow){g.fillStyle='rgba(255,210,80,.75)';rr(g,-w/2-4,-h/2-4,w+8,h+8,r+4);g.fill();}
  if(o.back){g.fillStyle=V.lg(g,-w/2,-h/2,w/2,h/2,[0,'#3f6fb5',1,'#2b4f8a']);rr(g,-w/2,-h/2,w,h,r);g.fill();
    g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1;rr(g,-w/2+w*.12,-h/2+w*.12,w*.76,h-w*.24,r*.6);g.stroke();g.fillStyle='rgba(255,230,170,.6)';ell(g,0,0,w*.12,w*.12);g.fill();g.restore();return;}
  g.fillStyle=V.lg(g,-w/2,-h/2,w/2,h/2,[0,'#fffdf6',1,'#ebe3d1']);rr(g,-w/2,-h/2,w,h,r);g.fill();
  g.strokeStyle='rgba(120,100,70,.35)';g.lineWidth=1;rr(g,-w/2+.5,-h/2+.5,w-1,h-1,r);g.stroke();
  g.strokeStyle='rgba(70,55,35,.5)';g.lineWidth=Math.max(1,w*.05);g.beginPath();g.moveTo(-w*.36,0);g.lineTo(w*.36,0);g.stroke();
  g.fillStyle='#b88a3a';ell(g,0,0,w*.07,w*.07);g.fill();
  const pr=w*.088,sp=w*.25;[[a,-w/2],[b,w/2]].forEach(([n,cy])=>{(PIP[n]||[]).forEach(q=>{const px=q[0]*sp,py=cy+q[1]*sp;g.fillStyle=n===1||n===5?'#c0392b':'#1e1a16';ell(g,px,py,pr,pr);g.fill();});});
  if(o.dim){g.fillStyle='rgba(40,30,20,.3)';rr(g,-w/2,-h/2,w,h,r);g.fill();}
  g.restore();}
const SAY={hi:[['Садись, сыграем! Забьём «козла» на интерес — кто проиграл, тот чайник ставит.','Sit down, let’s play — just for fun. The loser puts the kettle on.'],['Эх, давно я никого не «рыбил»! Раздаю.','Haven’t made a “fish” in ages! Dealing.']],
  peFirst:[['У меня дубль — я хожу!','I’ve got a double — my move!']],meFirst:[['Твой ход, начинай!','Your move, go on!']],
  dbl:[['Дубль! Ишь ты!','A double! Look at you!'],['О, дублем бьёшь!','Doubles, eh!']],
  bz:[['Эх, на базар схожу…','Off to the boneyard…'],['Нечем крыть — беру.','Nothing to play — drawing.']],
  peGo:[['А мы вот так!','How about this!'],['Получай!','Take that!'],['Хм… сюда.','Hmm… here.'],['Ну-ка, ну-ка…','Let’s see…'],['Как в молодости!','Like the old days!']],
  low:[['Ой, у меня мало костей осталось!','Only a few tiles left!']],fish:[['Рыба! Считаем очки.','Fish! Counting pips.']],
  win:[['Ну ты мастер! Ставлю чайник, уговор есть уговор.','You’re a master! Kettle’s on — a deal’s a deal.'],['Обыграл старика! Молодец.','You beat the old man! Well done.']],
  lose:[['Моя взяла! Не горюй — завтра реванш.','My win! Don’t be sad — rematch tomorrow.'],['Ха! Учись, пока я жив!','Ha! Learn while I’m still around!']],
  draw:[['Ничья! Бывает же.','A draw! Who’d have thought.']]};
const pick=a=>L(...a[Math.floor(Math.random()*a.length)]);
/* облачко реплики на холсте */
function bubble(g,text,hx,hy,maxW,W){const av=W-6-(hx+30);if(av>=140)maxW=Math.min(av,maxW);g.font='600 15px Rubik,-apple-system,"Segoe UI",Roboto,sans-serif';const words=text.split(' '),lines=[];let cur='';
  for(const w of words){const t=cur?cur+' '+w:w;if(g.measureText(t).width>maxW-24&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);
  // облачко справа от головы Митяя (не влезло — слева), хвостик к голове
  const lw=Math.max(...lines.map(l=>g.measureText(l).width))+24,lh=20,h=lines.length*lh+14,right=hx+30+lw<=W-6,bx=right?Math.max(hx+30,6):cl(hx-30-lw,6,W-lw-6),by=Math.max(6,hy-h/2);
  g.fillStyle='rgba(40,50,70,.18)';V.rr(g,bx+2,by+3,lw,h,12);g.fill();g.fillStyle='#fffdf7';V.rr(g,bx,by,lw,h,12);g.fill();
  const tx=right?bx:bx+lw,ty2=Math.min(by+h-10,Math.max(by+10,hy));g.beginPath();g.moveTo(tx,ty2-8);g.lineTo(right?hx+12:hx-12,hy+4);g.lineTo(tx,ty2+6);g.fill();
  g.fillStyle='#22303f';g.textAlign='left';g.textBaseline='middle';lines.forEach((l,i)=>g.fillText(l,bx+12,by+7+lh/2+i*lh));}
function run(host,o){V.intro(host,'mityai',V.esc(L('Садись за стол, забьём «козла»! Касайся ','Sit down, let’s play dominoes! Tap a '))+'<strong>'+V.esc(L('светлой кости','glowing tile'))+'</strong>'+V.esc(L(' — она ляжет в ряд. Нечем ходить — бери с базара.',' — it goes into the line. Nothing to play — draw from the boneyard.')),L('←/→ или 1…9 — кость, Enter — положить, ←/→ — к какому концу, Пробел — базар','←/→ or 1…9 — tile, Enter — play, ←/→ — which end, Space — draw')).then(()=>play(host,o));}
function play(host,o){const k=aiK(o),m=V.mem(host),seed=o.seed||1,G=deal(seed),R=V.R(seed*5+9),Sx=V.stage(host,{bar:true}),g=Sx.g,FX=[];
  let lay={},bg=null,mit={face:'smile',arm:'rest'},talk={t:'',until:0},busy=true,pick2=null,ended=false,hover=-1,reveal=false;const vis={};
  const key=t=>Math.min(t[0],t[1])+'-'+Math.max(t[0],t[1]);
  function layout(){const W=Sx.W,H=Sx.H,wide=W>H*1.1;lay.wide=wide;
    lay.ps=wide?Math.min(H*.27,200):Math.min(H*.22,W*.44);lay.ty=wide?Math.max(lay.ps*.95,H*.27):Math.max(lay.ps*.95,H*.23);lay.px=W/2;
    const n=Math.max(7,G.me.length),per=wide?Math.min(n,14):Math.min(n,7),rows=Math.ceil(n/per);
    lay.hw=cl(Math.min((W-28)/per-8,wide?60:54),26,60);if(!wide&&rows>1)lay.hw=cl(Math.min((W-28)/per-8,46),26,46);
    lay.per=per;lay.rows=rows;lay.handY=H-lay.hw-14-(rows-1)*(lay.hw*2+10);
    lay.peY=lay.ty+(wide?26:20);lay.ca={x:wide?W*.1:12,y:lay.peY+(wide?34:28),w:wide?W*.8:W-24,h:0};lay.ca.h=lay.handY-lay.hw-22-lay.ca.y;bg=null;}
  Sx.resize=layout;
  function bake(){const c=document.createElement('canvas'),d=Sx.d,W=Sx.W,H=Sx.H;c.width=Math.round(W*d);c.height=Math.round(H*d);const q=c.getContext('2d');q.scale(d,d);const P=V.tod('day');
    // стена пятиэтажки с окнами
    q.fillStyle=V.lg(q,0,0,0,lay.ty,[0,P.wall,1,P.wall2]);q.fillRect(0,0,W,lay.ty+4);const ww=Math.max(34,Math.min(54,W/9)),wh=ww*1.15,gap=ww*.7;
    for(let row=0;row*(wh+gap*.8)<lay.ty;row++)for(let x=gap/2,i=0;x<W;x+=ww+gap,i++){const y=12+row*(wh+gap*.8);if(y+wh>lay.ty-6)continue;
      q.fillStyle=P.frame;V.rr(q,x-3,y-3,ww+6,wh+6,4);q.fill();q.fillStyle=(i*7+row*3)%5===0?P.lit:P.glass;V.rr(q,x,y,ww,wh,3);q.fill();
      q.fillStyle='rgba(255,255,255,.35)';q.fillRect(x+ww*.12,y+wh*.1,ww*.18,wh*.5);q.fillStyle=P.frame;q.fillRect(x+ww/2-1.5,y,3,wh);}
    // куст у стены
    for(let x=-10;x<W+20;x+=46){q.fillStyle=P.bush;V.ell(q,x,lay.ty-2,30,20);q.fill();q.fillStyle=P.bush2;V.ell(q,x-6,lay.ty-10,16,10);q.fill();}
    // стол: доски
    q.fillStyle='#7a5434';q.fillRect(0,lay.ty,W,H-lay.ty);const bw=Math.max(40,W/9);
    for(let x=0,i=0;x<W;x+=bw,i++){q.fillStyle=V.lg(q,x,0,x+bw,0,[0,i%2?'#4f9a6a':'#56a372',1,i%2?'#468c60':'#4d9668']);q.fillRect(x+1.5,lay.ty+3,bw-3,H-lay.ty);
      q.strokeStyle='rgba(0,0,0,.08)';q.lineWidth=1;for(let y=lay.ty+30+i*13%40;y<H;y+=70){q.beginPath();q.moveTo(x+6,y);q.quadraticCurveTo(x+bw/2,y+6,x+bw-6,y);q.stroke();}}
    q.fillStyle='rgba(255,255,255,.18)';q.fillRect(0,lay.ty,W,3);q.fillStyle='rgba(0,0,0,.18)';q.fillRect(0,lay.ty+3,W,4);
    bg=c;}
  const bAct=Sx.btn('accent','',()=>action());bAct.style.display='none';
  function speak(t,ms){talk={t,until:Sx.t+(ms||3)};}
  /* цепочка «змейкой» */
  function chainPos(){const n=G.chain.length,ca=lay.ca,out=[];if(!n)return out;let hc=Math.min(lay.wide?38:30,ca.w/8);
    for(;hc>10;hc-=1){const per=Math.floor((ca.w-hc)/(hc*2)),rowsMax=Math.max(1,Math.floor(ca.h/(hc*2)));if(per*rowsMax-rowsMax>=n+1)break;}
    const per2=Math.max(2,Math.floor((ca.w-hc)/(hc*2))),x0=ca.x+(ca.w-Math.min(n,per2)*hc*2)/2,totalRows=Math.ceil(n/per2),ytop=ca.y+Math.max(0,(ca.h-totalRows*hc*2)/2)+hc;let i=0,r=0;
    while(i<n){const dir=r%2===0?1:-1,y=ytop+r*hc*2;for(let j=0;j<per2&&i<n;j++,i++){const c=G.chain[i],last=j===per2-1&&i<n-1;
        if(last){const cx=dir>0?x0+(per2-1)*hc*2+hc*1.5:x0+hc*.5;out.push({x:cx,y:y+hc*.5,w:hc,rot:0,c});}
        else{const cx2=dir>0?x0+j*hc*2+hc:x0+(per2-1-j)*hc*2+hc;out.push({x:cx2,y,w:hc,rot:dir>0?-PI/2:PI/2,c});}}r++;}
    return out;}
  function handPos(){const out=[],n=G.me.length,w=lay.hw,per=lay.per;for(let i=0;i<n;i++){const r=Math.floor(i/per),inRow=Math.min(per,n-r*per),j=i-r*per,tot=inRow*(w+8)-8;
    out.push({x:Sx.W/2-tot/2+j*(w+8)+w/2,y:lay.handY+r*(w*2+10),w});}return out;}
  function peHandPos(){const out=[],n=G.pe.length,w=Math.min(lay.wide?22:17,(Sx.W*.7)/Math.max(7,n)-4);for(let i=0;i<n;i++)out.push({x:lay.px-(n*(w+4)-4)/2+i*(w+4)+w/2,y:lay.peY,w});return out;}
  let legal=[];
  function updLegal(){legal=busy||G.turn!=='me'?[]:moves(G,G.me);const can=legal.length>0;
    if(G.turn==='me'&&!busy&&!can&&!G.over){bAct.style.display='';bAct.innerHTML=(G.bz.length?'🀫 '+L('На базар','Draw a tile')+' <small>('+G.bz.length+')</small>':L('Пропускаю ход','Pass'))+(host.pc?V.kc(host,L('Пробел','Space')):'');}
    else bAct.style.display='none';}
  function action(){if(busy||G.turn!=='me'||ended)return;if(G.bz.length){const t=G.bz.pop();vis[key(t)]={x:Sx.W-40,y:lay.ca.y+lay.ca.h/2,w:lay.hw*.6,rot:0};G.me.push(t);V.snd(host,'tap');layout();updLegal();if(legal.length&&!legal.some(mv=>mv.i===kc))kc=firstLegal();}
    else{busy=true;updLegal();nextTurn();}}
  function sideOK(t){const l=fitsL(G,t),r=fitsR(G,t);if(G.chain.length===0)return ['R'];if(l&&r&&G.L!==G.R)return ['L','R'];return [l?'L':'R'];}
  function tapHand(i){if(busy||G.turn!=='me')return;const t=G.me[i];if(!moves(G,G.me).some(mv=>mv.i===i)){V.snd(host,'honk2');V.buzz(20);return;}
    const so=sideOK(t);if(so.length>1){pick2={i,side:'R'};V.snd(host,'tap');return;}play('me',i,so[0]);}
  function play(who,i,side){const h=who==='me'?G.me:G.pe,t=h.splice(i,1)[0];pick2=null;const c=place(G,t,side,who);V.snd(host,'tap');V.buzz(10);
    if(t[0]===t[1]&&who==='me'&&Math.random()<.6)speak(pick(SAY.dbl));
    const cp=chainPos(),idx=G.chain.indexOf(c);if(cp[idx]&&!Sx.calm)V.burst(FX,cp[idx].x,cp[idx].y,8,['#fff6dc','#ffd27a']);
    layout();if(!h.length){G.over=who;return finishGame();}
    if(blocked(G)){G.over='fish';speak(pick(SAY.fish));return Sx.later(finishGame,900);}
    if(who==='pe'&&h.length===2)speak(pick(SAY.low));
    busy=true;updLegal();Sx.later(nextTurn,who==='me'?650:300);}
  function nextTurn(){if(G.over)return;G.turn=G.turn==='me'?'pe':'me';
    if(G.turn==='pe'){mit.face='think';mit.arm='rest';busy=true;updLegal();Sx.later(peMove,1000);}
    else{busy=false;mit.face='smile';mit.arm='rest';updLegal();if(!legal.some(mv=>mv.i===kc))kc=firstLegal();}}
  function peMove(){if(G.over)return;let mv=aiPick(G,G.pe,k,R),drew=0;
    function step(){if(mv){mit.face='smile';mit.arm='tile';if(Math.random()<.35)speak(pick(SAY.peGo));const src=peHandPos()[mv.i],t=G.pe[mv.i];if(src)vis[key(t)]={x:src.x,y:src.y,w:src.w,rot:0};play('pe',mv.i,mv.side);return;}
      if(G.bz.length){if(!drew)speak(pick(SAY.bz));drew++;G.pe.push(G.bz.pop());V.snd(host,'tap');mv=aiPick(G,G.pe,k,R);Sx.later(step,380);return;}
      speak(L('Пропускаю…','I pass…'));if(blocked(G)){G.over='fish';speak(pick(SAY.fish));Sx.later(finishGame,900);return;}Sx.later(nextTurn,800);}
    step();}
  function finishGame(){if(ended)return;ended=true;busy=true;updLegal();const r=result(G);reveal=true;
    if(!o.train){m.n=(m.n|0)+1;if(r.win)m.w=(m.w|0)+1;}
    mit.face=r.win?'think':r.draw?'wow':'laugh';mit.arm=r.win?'scratch':'rest';
    Sx.later(()=>{speak(pick(r.win?SAY.win:r.draw?SAY.draw:SAY.lose),4);if(r.win){V.snd(host,'win');if(!Sx.calm)V.burst(FX,Sx.W/2,lay.ca.y+lay.ca.h/2,30,['#ffd27a','#fff','#6be3b0']);}},500);
    Sx.later(()=>{Sx.stop();host.done({score:r.score,tier:r.tier,
      title:r.win?(G.over==='fish'?L('Рыба — твоя!','Fish — you win!'):L('Победа!','You win!')):r.draw?L('Ничья','Draw'):L('Митяй выиграл','Mityai won'),
      label:L('Очки в руке: ты ','Pips in hand: you ')+r.mp+L(' · Митяй ',' · Mityai ')+r.pp,extra:{w:m.w|0,n:m.n|0}});},3000);}
  function hitHand(p){const hp=handPos();for(let i=hp.length-1;i>=0;i--){const q=hp[i];if(Math.abs(p.x-q.x)<q.w/2+4&&Math.abs(p.y-q.y)<q.w+8)return i;}return -1;}
  function endPts(){const cp=chainPos();if(!cp.length)return null;const a=cp[0],b=cp[cp.length-1];return {L:{x:a.x,y:a.y,w:a.w},R:{x:b.x,y:b.y,w:b.w}};}
  function nearEnd(p){if(!pick2)return false;const e=endPts();if(!e)return false;const lim=Math.max(44,e.L.w*1.6);return Math.min(Math.hypot(p.x-e.L.x,p.y-e.L.y),Math.hypot(p.x-e.R.x,p.y-e.R.y))<lim;}
  Sx.hover=p=>{hover=-1;const my=G.turn==='me'&&!busy&&!G.over;if(!p||!my){Sx.cursor('');return;}hover=hitHand(p);Sx.cursor(hover>=0&&legal.some(mv=>mv.i===hover)||nearEnd(p)?'pointer':'');};
  /* KEYS: рамка выбора — только по подходящим костям; цифра — как касание кости; конец — ←/→ + Enter */
  let kc=-1,kOn=!!host.pc;const firstLegal=()=>legal.length?legal[0].i:0;
  const LR={ArrowLeft:-1,ArrowRight:1,a:-1,d:1,A:-1,D:1,'ф':-1,'в':1,'Ф':-1,'В':1};
  V.keys(host,k2=>{if(ended)return false;const my=G.turn==='me'&&!busy&&!G.over;
    if(pick2&&my){if(LR[k2]){pick2.side=LR[k2]<0?'L':'R';V.snd(host,'tap');return true;}
      if(k2==='Enter'||k2===' '){play('me',pick2.i,pick2.side||'R');return true;}
      if(k2==='ArrowDown'||k2==='s'||k2==='ы'||k2==='ArrowUp'||k2==='w'||k2==='ц'){pick2=null;return true;}}
    if(/^[1-9]$/.test(k2)){const i=+k2-1;if(i<G.me.length){kc=i;kOn=true;pick2=null;if(my)tapHand(i);}return true;}
    if(LR[k2]){const n=G.me.length;if(!n)return true;pick2=null;const L2=legal.map(mv=>mv.i).filter((x,j,a)=>a.indexOf(x)===j).sort((a,b)=>a-b);
      if(!kOn||kc<0||kc>=n)kc=firstLegal();else if(L2.length&&my){const j=L2.indexOf(kc);kc=j<0?L2[0]:L2[(j+LR[k2]+L2.length)%L2.length];}else kc=(kc+LR[k2]+n)%n;kOn=true;return true;}
    if(k2==='Enter'||k2===' '){if(!my)return true;if(!legal.length){action();return true;}
      if(!kOn||kc<0||kc>=G.me.length||!legal.some(mv=>mv.i===kc)){kc=firstLegal();kOn=true;}tapHand(kc);return true;}
    return false;});
  Sx.down=p=>{kOn=false;if(busy||G.turn!=='me')return;if(pick2){const e=endPts();if(e){const dl=Math.hypot(p.x-e.L.x,p.y-e.L.y),dr=Math.hypot(p.x-e.R.x,p.y-e.R.y),lim=Math.max(44,e.L.w*1.6);
        if(Math.min(dl,dr)<lim){play('me',pick2.i,dl<dr?'L':'R');return;}}}
    const i=hitHand(p);if(i>=0)tapHand(i);else pick2=null;};
  function lerp(v,tg,dt){if(!v)return {x:tg.x,y:tg.y,w:tg.w,rot:tg.rot||0};const q=Math.min(1,dt*(Sx.calm?20:9));v.x+=(tg.x-v.x)*q;v.y+=(tg.y-v.y)*q;v.w+=(tg.w-v.w)*q;v.rot+=((tg.rot||0)-v.rot)*q;return v;}
  Sx.frame=(dt,t)=>{const W=Sx.W,H=Sx.H;if(!lay.ca)layout();if(!bg)bake();g.drawImage(bg,0,0,W,H);
    // Митяй за столом (по грудь), стол перекрывает низ
    V.mit(g,lay.px,lay.ty+lay.ps*.42,lay.ps,Sx.calm?0:t,{bust:true,face:mit.face,arm:mit.arm});
    g.drawImage(bg,0,lay.ty*Sx.d,W*Sx.d,(H-lay.ty)*Sx.d,0,lay.ty,W,H-lay.ty);
    // базар
    const bzx=W-(lay.wide?60:34),bzy=lay.peY+(lay.wide?6:4);for(let b=0;b<Math.min(G.bz.length,7);b++)tile(g,bzx-(b%2)*5,bzy+b*3,lay.wide?16:12,0,0,PI/2+.1*(b%3-1),{back:true});
    if(G.bz.length)V.txt(g,L('базар ','boneyard ')+G.bz.length,bzx,bzy+(lay.wide?40:32),13,'#fff','center','rgba(20,50,30,.6)',700);
    // кости Митяя
    const pp=peHandPos();for(let i=0;i<G.pe.length;i++){const q=pp[i];if(reveal)tile(g,q.x,q.y+q.w*.4,q.w,G.pe[i][0],G.pe[i][1],0,{});else tile(g,q.x,q.y,q.w,0,0,0,{back:true});}
    // цепочка
    const cp=chainPos();for(const c of cp){const kv=key([c.c.a,c.c.b]);vis[kv]=lerp(vis[kv],c,dt);const v=vis[kv];tile(g,v.x,v.y,v.w,c.c.a,c.c.b,v.rot,{});}
    if(pick2&&cp.length){const e=endPts();[['L',e.L],['R',e.R]].forEach(([sd,q2])=>{const pul=Sx.calm?1:1+.08*Math.sin(t*6),on=kOn&&pick2.side===sd;g.strokeStyle='rgba(255,210,80,.95)';g.lineWidth=4;V.ell(g,q2.x,q2.y,q2.w*1.25*pul,q2.w*1.25*pul);g.stroke();g.fillStyle='rgba(255,210,80,.25)';g.fill();
        if(on){g.save();g.setLineDash([7,5]);g.strokeStyle='#fff';g.lineWidth=3;V.ell(g,q2.x,q2.y,q2.w*1.25*pul+7,q2.w*1.25*pul+7);g.stroke();g.restore();}});
      if(host.pc){V.txt(g,'←',e.L.x,e.L.y-e.L.w*1.25-14,18,'#fff','center','rgba(0,0,0,.5)');V.txt(g,'→',e.R.x,e.R.y-e.R.w*1.25-14,18,'#fff','center','rgba(0,0,0,.5)');}
      V.txt(g,L('К какому концу?','Which end?')+(host.pc?L(' ←/→, Enter',' ←/→, Enter'):''),W/2,lay.ca.y+4,17,'#fff','center','rgba(0,0,0,.5)');}
    // рука игрока
    const hp=handPos(),lg={};legal.forEach(mv=>{lg[mv.i]=1;});
    for(let i=0;i<G.me.length;i++){const tg=hp[i],kv2=key(G.me[i]),on=!!lg[i],sel=pick2&&pick2.i===i;vis[kv2]=lerp(vis[kv2],{x:tg.x,y:tg.y-(on?8:0)-(sel?10:0),w:tg.w,rot:0},dt);const v2=vis[kv2];
      if(i===hover&&on&&!busy&&!sel)v2.y-=4;
      tile(g,v2.x,v2.y,v2.w,G.me[i][0],G.me[i][1],0,{glow:on&&!busy,dim:!on&&G.turn==='me'&&!busy&&legal.length>0});
      if(G.turn==='me'&&!busy&&!G.over){if(kOn&&i===kc){g.save();g.setLineDash([7,5]);g.strokeStyle='#fff';g.lineWidth=3;V.rr(g,v2.x-v2.w/2-7,v2.y-v2.w-7,v2.w+14,v2.w*2+14,v2.w*.25);g.stroke();g.restore();}
        if(host.pc&&legal.length&&i<9)V.txt(g,String(i+1),v2.x,v2.y+v2.w+10,12,'#fff','center','rgba(0,0,0,.45)',700);}}
    if(G.turn==='me'&&!busy&&!G.over&&legal.length&&!pick2)V.txt(g,L('Твой ход — тронь светлую кость','Your move — tap a glowing tile'),W/2,lay.handY-lay.hw-18,16,'#fff','center','rgba(0,0,0,.5)',700);
    if(talk.t&&Sx.t<talk.until)bubble(g,talk.t,lay.px+lay.ps*.1,lay.ty-lay.ps*.45,320,W);
    V.parts(g,FX,dt);};
  layout();Sx.start();host.top(L('Партия 1 на 1','One-on-one'));
  Sx.later(()=>{speak(pick(SAY.hi));const op=opener(G);
    Sx.later(()=>{if(op.who==='pe'&&op.i>=0){speak(pick(SAY.peFirst));const src=peHandPos()[op.i];vis[key(G.pe[op.i])]={x:src.x,y:src.y,w:src.w,rot:0};G.turn='pe';play('pe',op.i,'R');}
      else{G.turn='me';busy=false;speak(pick(SAY.meFirst));updLegal();kc=firstLegal();}},1800);},300);
  (window.__vyb||(window.__vyb={})).domino={G,tap:i=>tapHand(i),end:s=>{if(pick2)play('me',pick2.i,s);},kc:()=>({kc,kOn}),act:action,legal:()=>legal,busy:()=>busy,pick2:()=>pick2,hp:handPos,ends:endPts};}
VYMG_REG({id:'domino',run,sim(o,kk){const r=simulate(o.seed||1,kk,aiK(o));return {score:r.score,tier:r.tier};}});
})();
