'use strict';
/* vy-mga: мини-игра «Дорожные работы» (id 'doroga', ведущий — Михалыч). 05-minigames.md №4.
   Дорогу к новому городу разобрали: поворачивай куски дороги (нажатие — по часовой, правая кнопка — против), чтобы асфальт шёл
   от двора (внизу) до знака города (вверху). Без таймера. Готово — «Москвич» проезжает по новой дороге.
   Раскладка от зерна: путь двор→город (только прямые и повороты) + обманки (прямые, повороты, тройники) + неподвижные деревья/гаражи.
   Клавиатура (ПК, KEYS): стрелки/WASD — рамка по кускам, Пробел/Enter/E — повернуть по часовой, Q — против, H — подсказка.
   Звёзды: по числу нажатий относительно наименьшего (par): ≤ par+2 → 3★, ≤ 2·par+3 → 2★, иначе 1★; подсказка Михалыча — не больше 2★.
   Вход с карты (05 §4.3): гнездо UX mapSlots (zone 'region') — см. низ файла. */
(function(){
if(typeof VYMG_REG!=='function'||!window.VYA)return;
const A=window.VYA,L=A.L,ID='doroga';
const DX=[0,1,0,-1],DY=[-1,0,1,0];   // 0 С, 1 В, 2 Ю, 3 З; маска — биты 1<<d
const rotM=(m,r)=>{r=((r%4)+4)%4;return ((m<<r)|(m>>(4-r)))&15;};
const deg=m=>(m&1)+(m>>1&1)+(m>>2&1)+(m>>3&1);
function size(o){const lv=(o&&o.lvl)|0;let t=o&&o.mode==='day'?1:lv<12?0:lv<40?1:2;if(o&&o.calm)t=Math.max(0,t-1);return [[4,5],[5,6],[5,7]][t];}
/* путь снизу (sc,R-1) вверх (ec,0) — случайный обход в глубину с возвратом */
function path(rnd,C,R){const minLen=Math.ceil(C*R*.42),maxLen=Math.ceil(C*R*.7);
  for(let tries=0;tries<200;tries++){const sc=Math.floor(rnd()*C),ec=Math.floor(rnd()*C);const seen=new Array(C*R).fill(0);const P=[[sc,R-1]];seen[(R-1)*C+sc]=1;let steps=0,found=null;
    (function dfs(){if(found||steps++>6000)return;const [x,y]=P[P.length-1];
      if(y===0&&x===ec&&P.length>=minLen){found=P.slice();return;}
      if(P.length>=maxLen)return;
      const ds=A.shuffle(rnd,[0,1,2,3]);for(const d of ds){const nx=x+DX[d],ny=y+DY[d];if(nx<0||ny<0||nx>=C||ny>=R||seen[ny*C+nx])continue;
        seen[ny*C+nx]=1;P.push([nx,ny]);dfs();if(found)return;P.pop();seen[ny*C+nx]=0;}})();
    if(found)return {P:found,sc,ec};}
  // запасной: змейка
  const P=[];for(let y=R-1;y>=0;y--){const row=[];for(let x=0;x<C;x++)row.push([x,y]);if((R-1-y)%2)row.reverse();P.push(...row);}return {P,sc:0,ec:P[P.length-1][0]};}
function gen(seed,o){const rnd=A.rng(seed*17+11),[C,R]=size(o),pp=path(rnd,C,R),T=[];
  for(let i=0;i<C*R;i++)T.push({x:i%C,y:(i/C)|0,m:0,r:0,ra:0,fix:0,on:0});
  const at=(x,y)=>T[y*C+x];
  pp.P.forEach(([x,y],k)=>{let m=0;const prev=k?pp.P[k-1]:[x,y+1],next=k<pp.P.length-1?pp.P[k+1]:[x,y-1];
    for(const q of [prev,next]){for(let d=0;d<4;d++)if(q[0]===x+DX[d]&&q[1]===y+DY[d])m|=1<<d;}const t=at(x,y);t.m=m;t.on=1;});
  // обманки: прямые и повороты, изредка тройник; часть — деревья/гаражи (не крутятся)
  for(const t of T){if(t.on)continue;const v=rnd();if(v<.22){t.fix=1+Math.floor(rnd()*3);continue;}t.m=v<.55?5:v<.92?3:7;}
  // перемешать: каждая крутящаяся — случайный поворот; путь — не меньше 70 % «не так»
  for(const t of T){if(t.fix)continue;t.r=Math.floor(rnd()*4);}
  const pathT=T.filter(t=>t.on),need=Math.ceil(pathT.length*.7);let wrong=pathT.filter(t=>rotM(base(t),t.r)!==t.m).length;
  for(const t of pathT){if(wrong>=need)break;if(rotM(base(t),t.r)===t.m){t.r=(t.r+1)%4;wrong++;}}
  for(const t of T)t.ra=t.r;
  const G={C,R,T,sc:pp.sc,ec:pp.ec,len:pp.P.length};G.par=pathT.reduce((s,t)=>s+taps(t),0);
  if(flow(G).ok){const t=pathT[0];t.r=(t.r+1)%4;t.ra=t.r;G.par=pathT.reduce((s,t)=>s+taps(t),0);}
  return G;}
/* «основа» плитки (r=0): I=5 (С-Ю), L=3 (С-В), T=7 (С-В-Ю); для пути — тип по маске */
function base(t){if(!t.m)return 0;const n=deg(t.m);return n===3?7:n===4?15:(t.m===5||t.m===10)?5:3;}
function mask(t){return t.fix||!t.m?0:rotM(base(t),t.r);}
function taps(t){const b=base(t);for(let n=0;n<4;n++)if(rotM(b,t.r+n)===t.m)return n;return 0;}
/* течение от двора: вход с юга в (sc,R-1) */
function flow(G){const {C,R,T}=G,lit=new Set(),par={};const s=(R-1)*G.C+G.sc;if(!(mask(T[s])&4))return {lit,ok:false,par};
  const q=[s];lit.add(s);par[s]=-1;while(q.length){const i=q.shift(),x=i%C,y=(i/C)|0,m=mask(T[i]);
    for(let d=0;d<4;d++){if(!(m>>d&1))continue;const nx=x+DX[d],ny=y+DY[d];if(nx<0||ny<0||nx>=C||ny>=R)continue;const j=ny*C+nx;if(lit.has(j))continue;if(mask(T[j])>>((d+2)%4)&1){lit.add(j);par[j]=i;q.push(j);}}}
  const e=G.ec;return {lit,ok:lit.has(e)&&!!(mask(T[e])&1),par};}
function tierOf(n,par,hints){let t=n<=par+2?3:n<=par*2+3?2:1;if(hints)t=Math.min(t,2);return t;}

function run(host,o){
  const seed=(o.seed|0)||20261009,G=gen(seed,o),{C,R,T}=G;
  const city=(o.ctx&&o.ctx.city)||L('Новый район','New district');
  let started=false,n=0,hints=0,fin=false,winT=0,carPath=null,cur=-1,F=flow(G),stuck=false;
  const root=A.root(host),say=A.sayBox(host,root),cv=A.canvas(host,root),c=cv.cx;
  const row=document.createElement('div');row.className='vya-row';const pc=A.pc(host);row.innerHTML='<button class="btn vya-hint">💡 '+L('Михалыч, подскажи','Hint')+(pc?' '+A.kc(host,'H'):'')+'</button>';root.appendChild(row);
  const note=document.createElement('div');note.className='vya-note';root.appendChild(note);
  note.innerHTML=pc?A.kc(host,L('стрелки','arrows'))+L(' — кусок · ',' — piece · ')+A.kc(host,L('Пробел','Space'))+L(' — по часовой · ',' — clockwise · ')+A.kc(host,'Q')+L(' — против · ',' — back · ')+A.kc(host,'H')+L(' — подсказка · или мышью',' — hint · or mouse'):L('Нажмите на кусок дороги — он повернётся','Tap a road piece to turn it');
  say.set('mihalych',L('Дорогу на «'+city+'» разобрали — ремонт! Поверни куски, чтобы асфальт шёл от двора до знака.','The road to “'+city+'” is torn up! Turn the pieces so it runs from the yard to the sign.'));
  let Lay=null;
  function layout(){const W=cv.W,H=cv.H,top=Math.max(44,H*.1),bot=Math.max(54,H*.12);const s=Math.floor(Math.min((W-16)/C,(H-top-bot)/R,96));
    Lay={s,gx:Math.round((W-C*s)/2),gy:Math.round(top+(H-top-bot-R*s)/2),top,bot};}
  cv.onFit(()=>{layout();draw();});
  function turn(i,dir){const t=T[i];if(fin||t.fix||!t.m)return;t.r=(t.r+(dir||1)+4)%4;n++;A.snd(host,'tap');F=flow(G);VYA_top();
    if(F.ok){win();return;}
    if(!stuck&&n>G.par*2+6&&!hints){stuck=true;say.set('mihalych',L('Начни от двора: смотри, куда ведёт свежий асфальт, и тяни его дальше.','Start from the yard: follow the fresh asphalt and extend it.'));}}
  function win(){fin=true;winT=0;A.snd(host,'win');
    // путь машины: от двора по родителям течения до города
    const ids=[];let i=G.ec;while(i!=null&&i>=0){ids.unshift(i);i=F.par[i];}carPath=ids;
    const t=tierOf(n,G.par,hints);say.set('mihalych',t===3?L('Вот это работа! Дорога как новая — поехали.','Great job! The road is like new — let’s go.'):L('Готово! Дорога есть — поехали в «'+city+'».','Done! The road is open — off to “'+city+'”.'));}
  function finish(){const t=tierOf(n,G.par,hints);
    if(o.mode==='map'&&o.ctx&&o.ctx.k!=null&&!o.train)try{const m=host.mem();m.rb=(+m.rb||0)|(1<<(o.ctx.k|0));}catch(e){}
    host.done({score:Math.max(10,100-Math.max(0,n-G.par)*3-hints*15),tier:t,
      label:L('Дорога готова · поворотов: ','Road fixed · turns: ')+n+(hints?L(' · подсказок: ',' · hints: ')+hints:'')});}
  function VYA_top(){A.top(host,L('поворотов: ','turns: ')+n);}
  /* подсказка: одна плитка пути — на место (начиная от двора) */
  function hint(){if(fin)return;let i=-1;
    // по пути от двора: первая плитка пути, стоящая не так
    const order=[];{let x=G.sc,y=R-1,from=2,guard=0;while(guard++<C*R){const t=T[y*C+x];order.push(y*C+x);let nd=-1;for(let d=0;d<4;d++)if(d!==from&&(t.m>>d&1))nd=d;if(nd<0||(y===0&&x===G.ec&&nd===0))break;x+=DX[nd];y+=DY[nd];from=(nd+2)%4;}}
    for(const k of order)if(T[k].on&&mask(T[k])!==T[k].m){i=k;break;}
    if(i<0)return;hints++;const t=T[i];t.r=(t.r+taps(t))%4;t.glow=1.2;A.snd(host,'tap');F=flow(G);VYA_top();
    say.set('mihalych',L('Вот этот кусок — так. Дальше сам!','This piece goes like this. Your turn!'));if(F.ok)win();}
  row.querySelector('.vya-hint').onclick=hint;
  /* ввод */
  const cellAt=pt=>{const x=Math.floor((pt.x-Lay.gx)/Lay.s),y=Math.floor((pt.y-Lay.gy)/Lay.s);return x>=0&&y>=0&&x<C&&y<R?y*C+x:-1;};
  cv.cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.cv.addEventListener('pointerdown',e=>{if(!started||host.paused||fin)return;const i=cellAt(cv.pt(e));if(i<0)return;if(cur>=0)lastCur=cur;cur=-1;turn(i,e.button===2?-1:1);draw();});
  /* KEYS: рамка-курсор (на ПК видна сразу от двора); мышь её прячет, клавиша — возвращает на прежнее место */
  let lastCur=-1;
  const unk=A.keys(host,(k,e)=>{if(!started||fin)return false;const mv=A.dir(k);
    if(cur<0&&(mv||A.isGo(k)||A.is(k,['q','й','e','у']))){cur=lastCur>=0?lastCur:(R-1)*C+G.sc;if(!mv){draw();return true;}}
    if(mv){const x=A.clamp(cur%C+mv[0],0,C-1),y=A.clamp(((cur/C)|0)+mv[1],0,R-1);cur=lastCur=y*C+x;draw();return true;}
    if(A.isGo(k)||A.is(k,['e','у'])){turn(cur,e&&e.shiftKey?-1:1);lastCur=cur;draw();return true;}
    if(A.is(k,['q','й'])){turn(cur,-1);lastCur=cur;draw();return true;}
    if(A.is(k,['h','р'])){hint();return true;}return false;});
  /* рисование */
  function road(cx,cy,s,m,fresh,ang){c.save();c.translate(cx,cy);c.rotate(ang||0);const w=s*.5;
    c.fillStyle=fresh?'#3d4148':'#a39782';for(let d=0;d<4;d++){if(!(m>>d&1))continue;c.save();c.rotate(d*Math.PI/2);c.fillRect(-w/2,-s/2-1,w,s/2+w/2+1);c.restore();}
    c.beginPath();c.arc(0,0,w/2,0,7);c.fill();
    if(fresh){c.strokeStyle='#f4f6f6';c.lineWidth=Math.max(1.5,s*.035);c.setLineDash([s*.08,s*.07]);for(let d=0;d<4;d++){if(!(m>>d&1))continue;c.save();c.rotate(d*Math.PI/2);c.beginPath();c.moveTo(0,0);c.lineTo(0,-s/2);c.stroke();c.restore();}c.setLineDash([]);}
    else{c.fillStyle='rgba(90,80,60,.45)';for(let k=0;k<6;k++){const a=k*1.7,r=w*.28;c.beginPath();c.arc(Math.cos(a)*r,Math.sin(a)*r,s*.025,0,7);c.fill();}}
    c.restore();}
  function scenery(cx,cy,s,f){if(f===1){c.fillStyle='#2e7d32';c.beginPath();c.arc(cx-s*.12,cy+s*.04,s*.22,0,7);c.arc(cx+s*.14,cy-s*.08,s*.2,0,7);c.fill();c.fillStyle='#43a047';c.beginPath();c.arc(cx-s*.05,cy-s*.12,s*.14,0,7);c.fill();}
    else if(f===2){c.fillStyle='#8d99a6';c.fillRect(cx-s*.36,cy-s*.22,s*.72,s*.44);c.fillStyle='#6c7a89';c.fillRect(cx-s*.36,cy-s*.22,s*.72,s*.08);c.fillStyle='#a6b2bd';for(let k=0;k<3;k++)c.fillRect(cx-s*.32+k*s*.23,cy-s*.08,s*.2,s*.28);}
    else{c.fillStyle='#e67e22';for(const [dx,dy] of [[-.2,.1],[.15,-.1],[.2,.2]]){c.beginPath();c.moveTo(cx+dx*s,cy+dy*s-s*.14);c.lineTo(cx+dx*s+s*.08,cy+dy*s+s*.06);c.lineTo(cx+dx*s-s*.08,cy+dy*s+s*.06);c.closePath();c.fill();}}}
  function draw(){if(!Lay)return;const W=cv.W,H=cv.H,s=Lay.s,gx=Lay.gx,gy=Lay.gy;c.clearRect(0,0,W,H);
    // трава
    c.fillStyle='#9ccc65';A.rr(c,gx-8,gy-8,C*s+16,R*s+16,14);c.fill();
    // город сверху
    const ex=gx+(G.ec+.5)*s,sx=gx+(G.sc+.5)*s;
    road(ex,gy-s*.25,s,5,true);c.fillStyle='#9ccc65';
    c.font='800 '+Math.round(Math.min(18,s*.26))+'px Rubik,sans-serif';const tw=c.measureText(city).width+24;
    const bx=A.clamp(ex-tw/2,6,W-tw-6),by=Math.max(4,gy-Lay.top+4);c.fillStyle='#7f8c8d';c.fillRect(ex-2,by+20,4,gy-by-20);
    c.fillStyle='#fdfefe';A.rr(c,bx,by,tw,Math.min(30,s*.42),5);c.fill();c.strokeStyle='#1f3b57';c.lineWidth=2.5;c.stroke();c.fillStyle='#1f3b57';c.textAlign='center';c.textBaseline='middle';c.fillText(city,bx+tw/2,by+Math.min(30,s*.42)/2+1);
    // двор снизу: дорога и пятиэтажка
    road(sx,gy+R*s+s*.25,s,5,true);
    const hy=gy+R*s+s*.55,hh=Math.min(Lay.bot-s*.3,H-hy-4);if(hh>14){c.fillStyle='#e8d7b9';c.fillRect(gx-8,hy,C*s+16,hh);c.fillStyle='#b9a27a';c.fillRect(gx-8,hy,C*s+16,4);
      c.fillStyle='#7fb3d5';for(let x=gx;x<gx+C*s-8;x+=s*.45)for(let y=hy+8;y<hy+hh-8;y+=Math.max(12,hh/2))c.fillRect(x+4,y,s*.22,Math.min(10,hh*.25));
      c.fillStyle='#fff';c.font='800 '+Math.round(Math.min(14,s*.2))+'px Rubik,sans-serif';const lab=L('Наш двор','Our yard');const lw=c.measureText(lab).width+12,lx=sx<W/2?sx+s*.45:sx-s*.45-lw;c.fillStyle='rgba(255,255,255,.9)';A.rr(c,lx,hy+hh/2-9,lw,18,6);c.fill();c.fillStyle='#5d4037';c.fillText(lab,lx+lw/2,hy+hh/2+1);}
    // плитки
    for(let i=0;i<T.length;i++){const t=T[i],cx=gx+(t.x+.5)*s,cy=gy+(t.y+.5)*s;
      c.fillStyle=(t.x+t.y)%2?'#a5d36f':'#9ccc65';c.fillRect(gx+t.x*s,gy+t.y*s,s,s);
      if(t.fix){scenery(cx,cy,s,t.fix);continue;}if(!t.m)continue;
      const lit=F.lit.has(i);if(t.glow>0){c.fillStyle='rgba(255,235,59,'+(t.glow*.5)+')';c.fillRect(gx+t.x*s,gy+t.y*s,s,s);}
      road(cx,cy,s,base(t),lit,t.ra*Math.PI/2);}
    // сетка-подсказка и курсор клавиатуры
    c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=1;for(let x=1;x<C;x++){c.beginPath();c.moveTo(gx+x*s,gy);c.lineTo(gx+x*s,gy+R*s);c.stroke();}for(let y=1;y<R;y++){c.beginPath();c.moveTo(gx,gy+y*s);c.lineTo(gx+C*s,gy+y*s);c.stroke();}
    if(cur>=0&&!fin){c.strokeStyle='#ffeb3b';c.lineWidth=3;c.strokeRect(gx+(cur%C)*s+2,gy+((cur/C)|0)*s+2,s-4,s-4);}
    // машина
    let car=null;if(fin&&carPath){const pts=[[sx,gy+R*s+s*.6]].concat(carPath.map(i=>[gx+(i%C+.5)*s,gy+(((i/C)|0)+.5)*s])).concat([[ex,gy-s*.6]]);
      const k=Math.min(pts.length-1.001,Math.max(0,winT*carV()));const a=Math.floor(k),f=k-a,p0=pts[a],p1=pts[a+1];car={x:p0[0]+(p1[0]-p0[0])*f,y:p0[1]+(p1[1]-p0[1])*f,ang:Math.atan2(p1[0]-p0[0],-(p1[1]-p0[1]))};}
    else car={x:sx,y:gy+R*s+s*.6,ang:0};
    A.carTop(c,car.x,car.y,s*.32,s*.55,'#c0392b','car',car.ang);}
  const carV=()=>Math.max(o.calm?2.5:3.5,(carPath.length+2)/(o.calm?3:2.2));
  let doneT=0;
  const stop=A.loop(host,dt=>{let any=false;for(const t of T){if(t.ra!==t.r){let d=t.r-t.ra;if(d>2)d-=4;if(d<-2)d+=4;if(Math.abs(d)<.01){t.ra=t.r;}else t.ra+=d*Math.min(1,dt*(o.calm?10:16));if(t.ra<0)t.ra+=4;if(t.ra>=4)t.ra-=4;any=true;}
      if(t.glow>0){t.glow=Math.max(0,t.glow-dt);any=true;}}
    if(fin){winT+=dt;any=true;const need=(carPath.length+2)/carV()+.7;if(winT>need&&!doneT){doneT=1;finish();}}
    if(any)draw();});
  host.onQuit&&host.onQuit(()=>{stop();unk();cv.kill();});
  VYA_top();cv.fit();layout();draw();
  A.intro(host,{who:'mihalych',text:L('Дорогу на «'+city+'» разобрали — ремонт! Поворачивай куски, чтобы <strong>асфальт шёл от двора до знака города</strong>.','The road to “'+city+'” is torn up! Turn the pieces so <strong>the asphalt runs from the yard to the city sign</strong>.'),
    hint:pc?L('Стрелки — выбрать кусок, Пробел — повернуть по часовой, Q — против. Мышью: щелчок / правая кнопка. Таймера нет.','Arrows — pick a piece, Space — clockwise, Q — counter-clockwise. Mouse: click / right click. No timer.'):L('Нажмите на кусок — он повернётся. Таймера нет.','Tap a piece to turn it. No timer.'),
    btn:L('За работу','Get to work')}).then(()=>{started=true;if(pc){cur=lastCur=(R-1)*C+G.sc;draw();}say.set('mihalych',L('Начинай от двора: где асфальт тёмный — дорога уже готова.','Start from the yard: dark asphalt means that part is done.'));});
  host.el._mga={G,T,fin:()=>fin,started:()=>started,taps:i=>taps(T[i]),n:()=>n,cur:()=>cur,
    cellXY:i=>{const r=cv.cv.getBoundingClientRect();return [r.left+Lay.gx+(i%C+.5)*Lay.s,r.top+Lay.gy+(((i/C)|0)+.5)*Lay.s];}};}

function sim(o,k){const G=gen(((o&&o.seed)|0)||1,o),r=A.rng(((o&&o.seed)|0)*5+1);k=k==null?.6:k;let extra=0;for(const t of G.T)if(t.on&&r()>k)extra+=1+Math.floor(r()*3);
  const h=r()>k+.35?1:0,n=G.par+extra;return {score:Math.max(10,100-extra*3-h*15),tier:tierOf(n,G.par,h)};}

VYMG_REG({id:ID,run,sim,gen});

/* ---------- вход с карты (гнездо UX mapSlots, zone 'region') ----------
   05 §4.3: открылся новый регион (после босса) — под его заголовком на карте строка «🚧 Дорогу на «город» разобрали — помоги Михалычу».
   Одно нажатие — игра (mode 'map', своё зерно на регион). Только у самого нового открытого региона и только когда игра открыта оболочкой
   (S.vymg.o[4]); можно не играть — регион открыт и так. Починенные дороги — S.vymg.m.doroga.rb (битовая маска регионов, host.mem()). */
const seen={};
function mapCity(ctx){const k=ctx.region|0,R0=typeof REGIONS!=='undefined'?REGIONS[k]:null,from=R0?R0.from:k*10;
  if(from<50&&typeof levelName==='function')return levelName(from);return (ctx.reg&&ctx.reg.name)||(R0&&R0.name)||'';}
function mapNeed(ctx){try{const S0=ctx.S||window.S;const z=S0&&S0.vymg;if(!z||!z.o||!z.o[4]||!window.VYMG||!VYMG.REG||!VYMG.REG.by[ID])return false;
  const k=ctx.region|0;if(k<1||typeof REGIONS==='undefined')return false;const R0=REGIONS[k];if(!R0||!(S0.unlocked>R0.from))return false;
  const nx=REGIONS[k+1];if(nx&&S0.unlocked>nx.from)return false;   // только самый новый открытый регион
  const m=z.m&&z.m[ID];return !(m&&((+m.rb||0)>>k&1));}catch(e){return false;}}
if(Array.isArray(window.mapSlots))mapSlots.push({id:'vya-doroga',order:10,zone:'region',
  render(ctx){if(!mapNeed(ctx))return null;const city=mapCity(ctx);
    if(!seen[ctx.region]){seen[ctx.region]=1;try{VYMG.ev({a:'show',id:ID,m:'map',l:ctx.region});}catch(e){}}
    return '<button class="btn vya-mapcard noenter" type="button" style="display:flex;align-items:center;gap:10px;width:100%;min-height:56px;text-align:left;margin:4px 0 8px">'+
      '<span style="font-size:24px;flex:none">🚧</span><span style="line-height:1.2"><b>'+L('Дорожные работы','Road works')+'</b><br><small>'+
      L('Дорогу на «'+city+'» разобрали — помоги Михалычу','The road to “'+city+'” is torn up — help Mikhalych')+'</small></span></button>';},
  mount(el,ctx){const b=el.querySelector('.vya-mapcard');if(!b)return;const k=ctx.region|0,city=mapCity(ctx);
    b.onclick=()=>{try{SND.tap();}catch(e){}if(typeof VYMG_OPEN==='function')VYMG_OPEN(ID,{mode:'map',seed:k*7919+3,ctx:{city,k},
      back:()=>{try{if(typeof openMap==='function'&&document.getElementById('scr-map')&&document.getElementById('scr-map').classList.contains('on'))openMap();else if(window.UI&&UI.refresh)UI.refresh();}catch(e){}}});};}});
})();
