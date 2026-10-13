'use strict';
/* ob2-TIHO №29 «Кости у костра» (журнал hobby-analytics/release-i/oborona-boost2/logs/TIHO-kosti.md). Грузится по требованию из js/tiho.js.
   Домино 1 на 1 с Дедом Пахомом у ночного костра на привале стрельцов. Правила и ИИ — из «Домино с дедом Митяем» Выезда (vymg-domino.js):
   «дубль-шесть», по 7 костей, остальное — «базар». Ход: касание светлой кости; подходит к обоим концам — касание нужного конца.
   Нечем ходить — «На базар» (пуст — «Пропускаю»). Конец: кто первым выложил все кости, или «Рыба!» — у кого меньше очков в руке.
   Ступени: проиграл 0 (≤ 10 очков в руке — 1), ничья 1, выиграл 2, выиграл и у Пахома ≥ 18 очков — 3. Счёт — очки Пахома + 10 за победу.
   Сила Пахома 0,4…0,65 от пройденных глав (o.lvl), спокойный режим — 0,3. Клавиши ПК: ←/→ (A/D) — выбор кости, 1…9 — кость, Enter/пробел — положить;
   к обоим концам — ←/→ конец, Enter — положить, ↓ — передумал; нечем ходить — Enter/пробел — базар/пропуск. Для проверок — TIHO._k. */
(function(){if(typeof TIHO==='undefined')return;
const PI=Math.PI,cl=(v,a,b)=>v<a?a:v>b?b:v;
/* ---------- правила (без рисования; ими же играет бот) ---------- */
function deal(seed){const R=mulberry((seed*29+3)>>>0),T=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)T.push([a,b]);TIHO.shuf(T,R);
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
function simulate(seed,me,k){const g=deal(seed),R=mulberry((seed*7+1)>>>0),op=opener(g);let turn=op.who;
  if(op.i>=0){const h0=turn==='me'?g.me:g.pe,t0=h0.splice(op.i,1)[0];place(g,t0,'R',turn);turn=turn==='me'?'pe':'me';}
  for(let n=0;n<200&&!g.over;n++){const h=turn==='me'?g.me:g.pe;let mv=aiPick(g,h,turn==='me'?me:k,R);
    while(!mv&&g.bz.length){h.push(g.bz.pop());mv=aiPick(g,h,turn==='me'?me:k,R);}
    if(mv){const t=h.splice(mv.i,1)[0];place(g,t,mv.side,turn);if(!h.length){g.over=turn;break;}}
    if(blocked(g)){g.over='fish';break;}turn=turn==='me'?'pe':'me';}
  if(!g.over)g.over='fish';return result(g);}
const aiK=o=>o.calm?0.3:cl(.4+.02*(o.lvl||0),.4,.65);

/* ---------- кость: центр (x,y), короткая сторона w, длинная 2w; rot 0 — вертикально (a сверху) ---------- */
const PIP={0:[],1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
function tile(g,x,y,w,a,b,rot,o){o=o||{};g.save();g.translate(x,y);g.rotate(rot||0);const h=w*2,r=w*.18;
  g.fillStyle='rgba(0,0,0,.35)';rrect(g,-w/2+w*.07,-h/2+w*.13,w,h,r);g.fill();
  if(o.glow){g.fillStyle='rgba(255,196,70,.8)';rrect(g,-w/2-4,-h/2-4,w+8,h+8,r+4);g.fill();}
  if(o.back){const gr=g.createLinearGradient(-w/2,-h/2,w/2,h/2);gr.addColorStop(0,'#8a5a30');gr.addColorStop(1,'#5a3618');g.fillStyle=gr;rrect(g,-w/2,-h/2,w,h,r);g.fill();
    g.strokeStyle='rgba(255,220,150,.35)';g.lineWidth=1;rrect(g,-w/2+w*.14,-h/2+w*.14,w*.72,h-w*.28,r*.6);g.stroke();
    g.fillStyle='rgba(255,220,150,.55)';g.beginPath();g.moveTo(0,-w*.3);g.lineTo(w*.18,0);g.lineTo(0,w*.3);g.lineTo(-w*.18,0);g.closePath();g.fill();g.restore();return;}
  const gr=g.createLinearGradient(-w/2,-h/2,w/2,h/2);gr.addColorStop(0,'#fbf1da');gr.addColorStop(1,'#e2cda2');g.fillStyle=gr;rrect(g,-w/2,-h/2,w,h,r);g.fill();
  g.strokeStyle='rgba(110,80,40,.55)';g.lineWidth=Math.max(1,w*.04);rrect(g,-w/2+.5,-h/2+.5,w-1,h-1,r);g.stroke();
  g.strokeStyle='rgba(90,60,30,.55)';g.lineWidth=Math.max(1,w*.05);g.beginPath();g.moveTo(-w*.36,0);g.lineTo(w*.36,0);g.stroke();
  g.fillStyle='#b8862e';g.beginPath();g.arc(0,0,w*.07,0,TAU);g.fill();
  const pr=w*.09,sp=w*.25;[[a,-w/2],[b,w/2]].forEach(q=>{const n=q[0],cy=q[1];(PIP[n]||[]).forEach(p=>{g.fillStyle=n===1||n===5?'#a8321e':'#2a1a10';g.beginPath();g.arc(p[0]*sp,cy+p[1]*sp,pr,0,TAU);g.fill();});});
  if(o.dim){g.fillStyle='rgba(30,18,10,.38)';rrect(g,-w/2,-h/2,w,h,r);g.fill();}
  g.restore();}

const SAY={hi:[['Присаживайся к огоньку! Сыграем в кости на интерес — кто проиграл, тот дров подкидывает.','Sit by the fire! Let’s play bones for fun — the loser fetches firewood.'],['Эх, ещё при царе Горохе я тут всю дружину обыгрывал. Раздаю!','Back in Tsar Pea’s day I beat the whole troop here. Dealing!']],
  peFirst:[['У меня дубль — мой почин!','I’ve got a double — I start!']],meFirst:[['Твой ход, служивый, начинай!','Your move, soldier, go on!']],
  dbl:[['Дубль! Ишь ты, востроглазый!','A double! Sharp eyes!'],['О, дублем бьёшь — по-богатырски!','Doubles — a hero’s move!']],
  bz:[['Эх, в мешок слазаю…','Into the bag I go…'],['Нечем крыть — тяну из мешка.','Nothing to play — drawing from the bag.']],
  peGo:[['А мы вот так!','How about this!'],['Получай, как Змей от Добрыни!','Take that, like Zmey from Dobrynya!'],['Хм… сюда.','Hmm… here.'],['Ну-ка, ну-ка…','Let’s see…'],['В походе и не так ходили!','We’ve made bolder moves on campaign!'],['Костёр трещит — к удаче!','The fire crackles — good luck!']],
  low:[['Ой, костей-то у меня всего ничего!','Oh, I’ve hardly any bones left!']],fish:[['Рыба! Считаем точки.','Fish! Counting pips.']],
  win:[['Ну ты мастер! Пошёл я за дровами — уговор дороже денег.','You’re a master! Off I go for firewood — a deal’s a deal.'],['Обыграл старика! Стрельцы, слыхали?','You beat the old man! Hear that, lads?']],
  lose:[['Моя взяла! Неси дровишки, а завтра — реванш.','My win! Fetch the firewood — rematch tomorrow.'],['Ха! Учись, пока я жив да костёр горит!','Ha! Learn while I’m alive and the fire’s burning!']],
  draw:[['Ничья! Обоим за дровами идти.','A draw! We both fetch firewood.']],
  idle:[['Помню, в походе на Кощея мы так до рассвета играли.','I remember, on the march against Koschei we played till dawn.'],['Стрельцы вон уснули, а мы с тобой — в кости.','The archers dozed off, but we’re at the bones.'],['Ты думай, думай. Ночь длинная.','Think, think. The night is long.']]};
const pick=a=>{const x=a[Math.floor(Math.random()*a.length)];return Lg(x[0],x[1]);};

function run(host,o){TIHO.intro(host,{who:'pakhom',
  t:Lg('Садись к костру, сыграем в кости! Касайся ','Sit by the fire, let’s play bones! Tap a ')+'<b>'+Lg('светлой кости','glowing tile')+'</b>'+Lg(' — она ляжет в ряд. Нечем ходить — тяни из мешка. Кто первым выложит все — тот и молодец.',' — it joins the line. Nothing to play — draw from the bag. Whoever lays out all first wins.'),
  btn:Lg('Сесть за игру','Sit down and play'),key:Lg('←/→ или 1…9 — кость, Enter — положить, ←/→ — к какому концу, Пробел — мешок','←/→ or 1…9 — tile, Enter — play, ←/→ — which end, Space — draw')}).then(()=>play(host,o));}

function play(host,o){const k=aiK(o),seed=o.seed||1,G=deal(seed),R=mulberry((seed*5+9)>>>0),cv=MGK.canvas(host),g=cv.getContext('2d'),calm=!!o.calm,pc=mgPC(),FX=[];
  let lay={},bg=null,talk={t:'',until:0},busy=true,pick2=null,ended=false,hover=-1,reveal=false,T=0,legal=[],idleT=0,fire=0;const vis={},Q=[];
  const later=(fn,ms)=>{Q.push({at:T+ms/1000,fn});};
  const key=t=>Math.min(t[0],t[1])+'-'+Math.max(t[0],t[1]);
  const snd=n=>{try{const f=host.snd&&host.snd[n];if(f)f();}catch(e){}};
  const bar=TIHO.bar(host);const bAct=document.createElement('button');bAct.className='btn gold';bAct.style.display='none';bar.appendChild(bAct);bAct.onclick=()=>{snd('click');action();};
  function layout(){const W=cv.W,H=cv.H,wide=W>H*1.1;lay.wide=wide;
    lay.ty=Math.round(wide?Math.max(H*.3,190):Math.max(H*.29,160));lay.ps=wide?Math.min(lay.ty*1.15,200):Math.min(lay.ty*1.05,W*.42);lay.px=wide?W*.5:W*.56;
    const n=Math.max(7,G.me.length),bot=74;let per=wide?Math.min(n,14):7,rows=Math.ceil(n/per);if(!wide&&rows>2){per=Math.ceil(n/2);rows=2;}
    lay.hw=cl(Math.min((W-28)/per-8,wide?56:50),26,wide?56:50);if(!wide&&rows>1)lay.hw=cl(Math.min((W-24)/per-6,44),26,44);
    lay.per=per;lay.rows=rows;lay.handY=H-bot-lay.hw-(rows-1)*(lay.hw*2+10);
    lay.peY=lay.ty+(wide?26:20);lay.ca={x:wide?W*.1:10,y:lay.peY+(wide?34:28),w:wide?W*.8:W-20,h:0};lay.ca.h=Math.max(60,lay.handY-lay.hw-24-lay.ca.y);
    lay.fx=wide?W*.24:W*.2;lay.fy=lay.ty-6;bg=null;}
  host.onResize(()=>{layout();});
  function bake(){const W=cv.W,H=cv.H,d=cv.D,c=mkCanvas(W*d,H*d),q=c.getContext('2d');q.setTransform(d,0,0,d,0,0);q.lineJoin='round';q.lineCap='round';
    const sk=q.createLinearGradient(0,0,0,lay.ty);sk.addColorStop(0,'#0e1430');sk.addColorStop(1,'#2a2a52');q.fillStyle=sk;q.fillRect(0,0,W,lay.ty+4);
    const r=mulberry(77);for(let i=0;i<70;i++){q.fillStyle='rgba(255,250,220,'+(.3+r()*.6).toFixed(2)+')';q.beginPath();q.arc(r()*W,r()*lay.ty*.8,.6+r()*1.3,0,TAU);q.fill();}
    q.fillStyle='#fff6c8';q.beginPath();q.arc(W*.86,lay.ty*.24,Math.min(22,lay.ty*.12),0,TAU);q.fill();q.fillStyle='#1a1e40';q.beginPath();q.arc(W*.86+8,lay.ty*.24-5,Math.min(20,lay.ty*.11),0,TAU);q.fill();
    // лес и шатры
    q.fillStyle='#141a2c';for(let x=-10;x<W+30;x+=26){const h=lay.ty*(.3+.12*Math.sin(x*.07));q.beginPath();q.moveTo(x-16,lay.ty);q.lineTo(x,lay.ty-h);q.lineTo(x+16,lay.ty);q.fill();}
    q.fillStyle='#22243c';for(const tx of[W*.08,W*.92]){const s=lay.ty*.32;q.beginPath();q.moveTo(tx-s,lay.ty);q.lineTo(tx,lay.ty-s*1.2);q.lineTo(tx+s,lay.ty);q.fill();q.strokeStyle='#33355a';q.lineWidth=2;q.beginPath();q.moveTo(tx,lay.ty-s*1.2);q.lineTo(tx,lay.ty-s*1.5);q.stroke();}
    // стрельцы-силуэты у шатров (сидят, бердыши)
    q.fillStyle='#0c0f1e';for(const sx of[W*.3,W*.78,W*.88]){if(sx>lay.px-lay.ps*.4&&sx<lay.px+lay.ps*.4)continue;const s=lay.ty*.13;
      q.beginPath();q.ellipse(sx,lay.ty-s*1.3,s*.42,s*.42,0,0,TAU);q.fill();q.beginPath();q.moveTo(sx-s*.7,lay.ty);q.quadraticCurveTo(sx-s*.7,lay.ty-s*1.1,sx,lay.ty-s*1.05);q.quadraticCurveTo(sx+s*.7,lay.ty-s*1.1,sx+s*.7,lay.ty);q.fill();
      q.beginPath();q.moveTo(sx-s*.5,lay.ty-s*1.6);q.lineTo(sx,lay.ty-s*1.95);q.lineTo(sx+s*.5,lay.ty-s*1.6);q.fill();
      q.strokeStyle='#0c0f1e';q.lineWidth=2;q.beginPath();q.moveTo(sx+s*.8,lay.ty);q.lineTo(sx+s*.95,lay.ty-s*2.6);q.stroke();q.beginPath();q.moveTo(sx+s*.95,lay.ty-s*2.6);q.quadraticCurveTo(sx+s*1.4,lay.ty-s*2.2,sx+s*.92,lay.ty-s*1.9);q.fill();}
    // земля и войлок-подстилка
    q.fillStyle='#2e2416';q.fillRect(0,lay.ty,W,H-lay.ty);
    const mx=8,my=lay.ty+6,mw=W-16,mh=H-lay.ty-12;q.fillStyle='#6a2a1e';rrect(q,mx,my,mw,mh,16);q.fill();
    q.strokeStyle='#c8963a';q.lineWidth=3;rrect(q,mx+7,my+7,mw-14,mh-14,11);q.stroke();q.setLineDash([6,6]);q.strokeStyle='rgba(232,190,110,.5)';q.lineWidth=2;rrect(q,mx+14,my+14,mw-28,mh-28,8);q.stroke();q.setLineDash([]);
    for(let x=mx+24;x<mx+mw-20;x+=28){q.fillStyle='rgba(232,190,110,.35)';q.beginPath();q.moveTo(x,my+3);q.lineTo(x+6,my+9);q.lineTo(x,my+15);q.lineTo(x-6,my+9);q.fill();}
    // бревно, на котором сидит Пахом
    const lw=lay.ps*1.1,lx=lay.px,ly=lay.ty-lay.ps*.05;rrect(q,lx-lw/2,ly-lay.ps*.12,lw,lay.ps*.22,lay.ps*.1);q.fillStyle=grad(q,lx,ly,lw*.5,'#7a5030');q.fill();outline(q,'#7a5030',1.5);
    ell(q,lx+lw/2-lay.ps*.05,ly-lay.ps*.01,lay.ps*.07,lay.ps*.1,'#c89a60',{lw:1});
    bg=c;}
  function speak(t,s){talk={t,until:T+(s||3.2)};}
  function chainPos(){const n=G.chain.length,ca=lay.ca,out=[];if(!n)return out;let hc=Math.min(lay.wide?44:34,ca.w/8);
    for(;hc>10;hc-=1){const per=Math.floor((ca.w-hc)/(hc*2)),rowsMax=Math.max(1,Math.floor(ca.h/(hc*2)));if(per*rowsMax-rowsMax>=n+1)break;}
    const per2=Math.max(2,Math.floor((ca.w-hc)/(hc*2))),x0=ca.x+(ca.w-Math.min(n,per2)*hc*2)/2,totalRows=Math.ceil(n/per2),ytop=ca.y+Math.max(0,(ca.h-totalRows*hc*2)/2)+hc;let i=0,r=0;
    while(i<n){const dir=r%2===0?1:-1,y=ytop+r*hc*2;for(let j=0;j<per2&&i<n;j++,i++){const c=G.chain[i],last=j===per2-1&&i<n-1;
        if(last){const cx=dir>0?x0+(per2-1)*hc*2+hc*1.5:x0+hc*.5;out.push({x:cx,y:y+hc*.5,w:hc,rot:0,c});}
        else{const cx2=dir>0?x0+j*hc*2+hc:x0+(per2-1-j)*hc*2+hc;out.push({x:cx2,y,w:hc,rot:dir>0?-PI/2:PI/2,c});}}r++;}
    return out;}
  function handPos(){const out=[],n=G.me.length,w=lay.hw,per=lay.per;for(let i=0;i<n;i++){const r=Math.floor(i/per),inRow=Math.min(per,n-r*per),j=i-r*per,tot=inRow*(w+8)-8;
    out.push({x:cv.W/2-tot/2+j*(w+8)+w/2,y:lay.handY+r*(w*2+10),w});}return out;}
  function peHandPos(){const out=[],n=G.pe.length,w=Math.min(lay.wide?22:16,(cv.W*.7)/Math.max(7,n)-4);for(let i=0;i<n;i++)out.push({x:lay.px-(n*(w+4)-4)/2+i*(w+4)+w/2,y:lay.peY,w});return out;}
  function updLegal(){legal=busy||G.turn!=='me'?[]:moves(G,G.me);const can=legal.length>0;
    if(G.turn==='me'&&!busy&&!can&&!G.over){bAct.style.display='';bAct.innerHTML=(G.bz.length?Lg('Тянуть из мешка','Draw from the bag')+' <small>('+G.bz.length+')</small>':Lg('Пропускаю ход','Pass'))+(pc?' <kbd class="zgK" style="margin-left:6px">'+Lg('Пробел','Space')+'</kbd>':'');}
    else bAct.style.display='none';}
  function action(){if(busy||G.turn!=='me'||ended||legal.length)return;if(G.bz.length){const t=G.bz.pop();vis[key(t)]={x:cv.W-40,y:lay.peY,w:lay.hw*.6,rot:0};G.me.push(t);snd('click');layout();updLegal();if(legal.length&&!legal.some(mv=>mv.i===kc))kc=firstLegal();}
    else{busy=true;updLegal();nextTurn();}}
  function sideOK(t){const l=fitsL(G,t),r=fitsR(G,t);if(G.chain.length===0)return ['R'];if(l&&r&&G.L!==G.R)return ['L','R'];return [l?'L':'R'];}
  function tapHand(i){if(busy||G.turn!=='me')return;const t=G.me[i];if(!moves(G,G.me).some(mv=>mv.i===i)){snd('bad');return;}
    const so=sideOK(t);if(so.length>1){pick2={i,side:'R'};snd('click');return;}put('me',i,so[0]);}
  function put(who,i,side){const h=who==='me'?G.me:G.pe,t=h.splice(i,1)[0];pick2=null;const c=place(G,t,side,who);snd('click');idleT=0;
    if(t[0]===t[1]&&who==='me'&&Math.random()<.6)speak(pick(SAY.dbl));
    const cp=chainPos(),idx=G.chain.indexOf(c);if(cp[idx]&&!calm)MGK.burst(FX,cp[idx].x,cp[idx].y,{n:8,col:'#ffd27a',sp:110,d:.45});
    layout();if(!h.length){G.over=who;return finishGame();}
    if(blocked(G)){G.over='fish';speak(pick(SAY.fish));later(finishGame,900);return;}
    if(who==='pe'&&h.length===2)speak(pick(SAY.low));
    busy=true;updLegal();later(nextTurn,who==='me'?650:300);}
  function nextTurn(){if(G.over)return;G.turn=G.turn==='me'?'pe':'me';
    if(G.turn==='pe'){busy=true;updLegal();later(peMove,calm?600:1000);}
    else{busy=false;updLegal();if(!legal.some(mv=>mv.i===kc))kc=firstLegal();}}
  function peMove(){if(G.over)return;let mv=aiPick(G,G.pe,k,R),drew=0;
    function step(){if(mv){if(Math.random()<.35)speak(pick(SAY.peGo));const src=peHandPos()[mv.i],t=G.pe[mv.i];if(src)vis[key(t)]={x:src.x,y:src.y,w:src.w,rot:0};put('pe',mv.i,mv.side);return;}
      if(G.bz.length){if(!drew)speak(pick(SAY.bz));drew++;G.pe.push(G.bz.pop());snd('click');mv=aiPick(G,G.pe,k,R);later(step,380);return;}
      speak(Lg('Пропускаю…','I pass…'));if(blocked(G)){G.over='fish';speak(pick(SAY.fish));later(finishGame,900);return;}later(nextTurn,800);}
    step();}
  function finishGame(){if(ended)return;ended=true;busy=true;updLegal();const r=result(G);reveal=true;
    later(()=>{speak(pick(r.win?SAY.win:r.draw?SAY.draw:SAY.lose),4);if(r.win){snd('win');if(!calm)MGK.burst(FX,cv.W/2,lay.ca.y+lay.ca.h/2,{n:30,col:'#ffd27a',sp:220});}},500);
    later(()=>{host.done({score:r.score,tier:r.tier,extra:{lbl:(r.win?(G.over==='fish'?Lg('рыба — твоя','fish — yours'):Lg('победа','win')):r.draw?Lg('ничья','draw'):Lg('Пахом выиграл','Pakhom won'))+
      Lg(' · точки в руке: ты ',' · pips in hand: you ')+r.mp+Lg(', Пахом ',', Pakhom ')+r.pp}});},3000);}
  function hitHand(p){const hp=handPos();for(let i=hp.length-1;i>=0;i--){const q=hp[i];if(Math.abs(p.x-q.x)<q.w/2+4&&Math.abs(p.y-q.y)<q.w+8)return i;}return -1;}
  function endPts(){const cp=chainPos();if(!cp.length)return null;const a=cp[0],b=cp[cp.length-1];return {L:{x:a.x,y:a.y,w:a.w},R:{x:b.x,y:b.y,w:b.w}};}
  let kc=-1,kOn=pc;const firstLegal=()=>legal.length?legal[0].i:0;
  const LR={ArrowLeft:-1,ArrowRight:1,a:-1,d:1,A:-1,D:1,'ф':-1,'в':1,'Ф':-1,'В':1};
  TIHO.keys(host,k2=>{if(ended)return false;const my=G.turn==='me'&&!busy&&!G.over;
    if(pick2&&my){if(LR[k2]){pick2.side=LR[k2]<0?'L':'R';snd('click');return true;}
      if(k2==='Enter'||k2===' '){put('me',pick2.i,pick2.side||'R');return true;}
      if(k2==='ArrowDown'||k2==='s'||k2==='ы'||k2==='ArrowUp'||k2==='w'||k2==='ц'){pick2=null;return true;}}
    if(/^[1-9]$/.test(k2)){const i=+k2-1;if(i<G.me.length){kc=i;kOn=true;pick2=null;if(my)tapHand(i);}return true;}
    if(LR[k2]){const n=G.me.length;if(!n)return true;pick2=null;const L2=legal.map(mv=>mv.i).filter((x,j,a)=>a.indexOf(x)===j).sort((a,b)=>a-b);
      if(!kOn||kc<0||kc>=n)kc=firstLegal();else if(L2.length&&my){const j=L2.indexOf(kc);kc=j<0?L2[0]:L2[(j+LR[k2]+L2.length)%L2.length];}else kc=(kc+LR[k2]+n)%n;kOn=true;return true;}
    if(k2==='Enter'||k2===' '){if(!my)return true;if(!legal.length){action();return true;}
      if(!kOn||kc<0||kc>=G.me.length||!legal.some(mv=>mv.i===kc)){kc=firstLegal();kOn=true;}tapHand(kc);return true;}
    return false;});
  const pt=e=>{const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  cv.addEventListener('pointerdown',e=>{if(host.paused)return;const p=pt(e);kOn=false;if(busy||G.turn!=='me')return;
    if(pick2){const ep=endPts();if(ep){const dl=Math.hypot(p.x-ep.L.x,p.y-ep.L.y),dr=Math.hypot(p.x-ep.R.x,p.y-ep.R.y),lim=Math.max(44,ep.L.w*1.6);
        if(Math.min(dl,dr)<lim){put('me',pick2.i,dl<dr?'L':'R');return;}}}
    const i=hitHand(p);if(i>=0)tapHand(i);else pick2=null;});
  cv.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const p=pt(e);hover=hitHand(p);cv.style.cursor=hover>=0&&legal.some(mv=>mv.i===hover)?'pointer':'';});
  function lerp(v,tg,dt){if(!v)return {x:tg.x,y:tg.y,w:tg.w,rot:tg.rot||0};const q=Math.min(1,dt*(calm?20:9));v.x+=(tg.x-v.x)*q;v.y+=(tg.y-v.y)*q;v.w+=(tg.w-v.w)*q;v.rot+=((tg.rot||0)-v.rot)*q;return v;}
  function drawFire(x,y,s,t){glow(g,x,y-s*.3,s*2.2,'rgba(255,150,50,.35)','rgba(255,220,140,.5)');
    for(const [dx,a] of[[-.5,.5],[.5,-.5],[0,.1]]){g.save();g.translate(x+dx*s*.6,y);g.rotate(a);rrect(g,-s*.9,-s*.13,s*1.8,s*.26,s*.12);g.fillStyle='#5a3418';g.fill();g.restore();}
    const fl=[['#ff6a2a',1],['#ffa23a',.72],['#ffe07a',.42]];for(let i=0;i<3;i++){const f=fl[i],w=s*f[1],h=s*1.6*f[1]*(1+(calm?0:.12*Math.sin(t*9+i*2)));
      g.fillStyle=f[0];g.beginPath();g.moveTo(x-w*.6,y);g.quadraticCurveTo(x-w*.7,y-h*.5,x+(calm?0:Math.sin(t*6+i)*w*.15),y-h);g.quadraticCurveTo(x+w*.7,y-h*.5,x+w*.6,y);g.closePath();g.fill();}}
  function bubble(text,hx,hy){const W=cv.W;g.font=MGK.font(15,700);const maxW=Math.min(300,W-24),words=text.split(' '),lines=[];let cur='';
    for(const w of words){const t=cur?cur+' '+w:w;if(g.measureText(t).width>maxW-24&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);
    let lw=24;for(const l of lines)lw=Math.max(lw,g.measureText(l).width+24);const lh=19,h=lines.length*lh+14,right=hx+24+lw<=W-6,bx=right?hx+24:cl(hx-24-lw,6,W-lw-6),by=cl(hy-h/2,58,Math.max(58,lay.ty+40));
    g.fillStyle='rgba(0,0,0,.3)';rrect(g,bx+2,by+3,lw,h,12);g.fill();g.fillStyle='#fffaf0';rrect(g,bx,by,lw,h,12);g.fill();g.strokeStyle='#9a6332';g.lineWidth=2;g.stroke();
    const tx=right?bx:bx+lw,ty2=cl(hy,by+10,by+h-10);g.fillStyle='#fffaf0';g.beginPath();g.moveTo(tx,ty2-8);g.lineTo(right?hx+8:hx-8,hy+6);g.lineTo(tx,ty2+6);g.fill();
    g.fillStyle='#3b2412';g.textAlign='left';g.textBaseline='middle';lines.forEach((l,i)=>g.fillText(l,bx+12,by+7+lh/2+i*lh));}
  function frame(dt){T+=dt;for(let i=0;i<Q.length;i++)if(Q[i].at<=T){const f=Q.splice(i,1)[0].fn;i--;try{f();}catch(e){console.error(e);}}
    if(!ended&&G.turn==='me'&&!busy){idleT+=dt;if(idleT>14){idleT=-20;speak(pick(SAY.idle),4);}}
    const W=cv.W,H=cv.H,d=cv.D;if(!lay.ca)layout();if(!bg)bake();g.setTransform(1,0,0,1,0,0);g.drawImage(bg,0,0);g.setTransform(d,0,0,d,0,0);g.lineJoin='round';g.lineCap='round';
    // Пахом на бревне, костёр сбоку
    const bob=calm?0:Math.sin(T*1.6)*1.2+(talk.t&&T<talk.until?Math.sin(T*14)*.8:0);
    MGK.put(g,'tour_nb2',lay.px,lay.ty-lay.ps*.4+bob,lay.ps*.85,d);
    drawFire(lay.fx,lay.fy,Math.min(lay.wide?40:26,lay.ty*.15),T);
    if(!calm){fire+=dt;if(fire>.08){fire=0;FX.push({x:lay.fx+(Math.random()-.5)*14,y:lay.fy-20,vx:(Math.random()-.5)*20,vy:-40-Math.random()*50,t:0,d:1+Math.random(),c:Math.random()<.5?'#ffd27a':'#ff8a3a',s:1.6+Math.random()*1.4,g:-10,k:'dot'});}}
    // мешок («базар»)
    if(G.bz.length){const bx=W-(lay.wide?70:40),by=lay.peY+6,s=lay.wide?24:18;ell(g,bx,by+s*.3,s*.95,s*.85,'#a8865a',{lw:1.4});ell(g,bx,by-s*.45,s*.35,s*.18,'#8a6a40',{lw:1});ln(g,[bx-s*.3,by-s*.35,bx+s*.3,by-s*.35],'#5a3a1a',2);
      MGK.text(g,String(G.bz.length),bx,by+s*.35,s*.75,{col:'#fff6dc'});}
    // кости Пахома
    const pp=peHandPos();for(let i=0;i<G.pe.length;i++){const q=pp[i];if(reveal)tile(g,q.x,q.y+q.w*.4,q.w,G.pe[i][0],G.pe[i][1],0,{});else tile(g,q.x,q.y,q.w,0,0,0,{back:true});}
    // цепочка
    const cp=chainPos();for(const c of cp){const kv=key([c.c.a,c.c.b]);vis[kv]=lerp(vis[kv],c,dt);const v=vis[kv];tile(g,v.x,v.y,v.w,c.c.a,c.c.b,v.rot,{});}
    if(pick2&&cp.length){const e=endPts();[['L',e.L],['R',e.R]].forEach(z=>{const sd=z[0],q2=z[1],pul=calm?1:1+.08*Math.sin(T*6),on=kOn&&pick2.side===sd,rr2=q2.w*1.25*pul;
        g.strokeStyle='rgba(255,210,80,.95)';g.lineWidth=4;g.beginPath();g.arc(q2.x,q2.y,rr2,0,TAU);g.stroke();g.fillStyle='rgba(255,210,80,.25)';g.fill();
        if(on){g.save();g.setLineDash([7,5]);g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(q2.x,q2.y,rr2+7,0,TAU);g.stroke();g.restore();}});
      if(pc){MGK.text(g,'←',e.L.x,e.L.y-e.L.w*1.25-14,18);MGK.text(g,'→',e.R.x,e.R.y-e.R.w*1.25-14,18);}
      MGK.text(g,Lg('К какому концу?','Which end?')+(pc?' ←/→, Enter':''),W/2,lay.ca.y+2,17,{mw:W-20});}
    // рука игрока
    const hp=handPos(),lg={};legal.forEach(mv=>{lg[mv.i]=1;});
    for(let i=0;i<G.me.length;i++){const tg=hp[i],kv2=key(G.me[i]),on=!!lg[i],sel=pick2&&pick2.i===i;vis[kv2]=lerp(vis[kv2],{x:tg.x,y:tg.y-(on?8:0)-(sel?10:0),w:tg.w,rot:0},dt);const v2=vis[kv2];
      tile(g,v2.x,v2.y-(i===hover&&on&&!busy&&!sel?4:0),v2.w,G.me[i][0],G.me[i][1],0,{glow:on&&!busy,dim:!on&&G.turn==='me'&&!busy&&legal.length>0});
      if(G.turn==='me'&&!busy&&!G.over){if(kOn&&i===kc){g.save();g.setLineDash([7,5]);g.strokeStyle='#fff';g.lineWidth=3;rrect(g,v2.x-v2.w/2-7,v2.y-v2.w-7,v2.w+14,v2.w*2+14,v2.w*.25);g.stroke();g.restore();}
        if(pc&&legal.length&&i<9)MGK.text(g,String(i+1),v2.x,v2.y+v2.w+10,12);}}
    if(G.turn==='me'&&!busy&&!G.over&&legal.length&&!pick2)MGK.text(g,Lg('Твой ход — тронь светлую кость','Your move — tap a glowing tile'),W/2,lay.handY-lay.hw-18,16,{mw:W-20});
    if(G.turn==='pe'&&!G.over&&!(talk.t&&T<talk.until))MGK.text(g,Lg('Пахом думает…','Pakhom is thinking…'),W/2,lay.handY-lay.hw-18,15,{col:'#ffe7b0',mw:W-20});
    if(talk.t&&T<talk.until)bubble(talk.t,lay.px+lay.ps*.12,lay.ty-lay.ps*.62);
    MGK.parts(g,FX,dt);}
  layout();TIHO.top(host,'<b>'+Lg('Кости у костра','Bones by the Fire')+'</b>'+Lg('Партия с Дедом Пахомом','A game with Grandpa Pakhom'));
  MGK.loop(host,dt=>frame(dt));
  later(()=>{speak(pick(SAY.hi));const op=opener(G);
    later(()=>{if(op.who==='pe'&&op.i>=0){speak(pick(SAY.peFirst));const src=peHandPos()[op.i];vis[key(G.pe[op.i])]={x:src.x,y:src.y,w:src.w,rot:0};G.turn='pe';put('pe',op.i,'R');}
      else{G.turn='me';busy=false;speak(pick(SAY.meFirst));updLegal();kc=firstLegal();}},calm?900:1800);},300);
  TIHO._k={G,tap:i=>tapHand(i),end:s=>{if(pick2)put('me',pick2.i,s);},act:action,legal:()=>legal,busy:()=>busy,pick2:()=>pick2,hp:handPos,ends:endPts,ended:()=>ended};}

TIHO.def('kosti',{run,sim(o,kk){const r=simulate(o.seed||1,kk,aiK(o));return {score:r.score,tier:r.tier};}});
})();
