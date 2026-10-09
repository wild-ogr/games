'use strict';
/* vy-mgb: мини-игра №15 «Снегоуборка» (ведущий — Михалыч). 05-minigames.md №15 (зимой, перед дворами «Гололёда»).
   Ночью двор занесло. Проведи пальцем (мышкой) лопатой дорожки от машин к арке выезда — машина, до которой расчищен путь, сама уезжает.
   Клетки: снег (1 мах лопатой), сугроб (2 маха), лёд (посыпать песком — 1 мах, лопата сама меняется на ведро), деревья/лавки/снеговик/гараж — не пройти.
   Копать можно только рядом с уже расчищенным (от арки, от машины или от своей дорожки). Без таймера; «↶ Назад» — вернуть последний мах.
   Цель — вывести все машины за меньшее число махов. «Норма Михалыча» (par) — жадный расчёт по всем порядкам машин.
   Ступени: махов ≤ нормы — 3★, ≤ нормы × 1,3 + 1 — 2★, иначе 1★. Счёт = max(10, 100 − 5×(махи − норма)).
   Клавиши ПК: стрелки / WASD (ЦФЫВ) — вести лопату от арки (по расчищенному и копая новое; сугроб — два нажатия), Z / Backspace — назад, R — заново. В 'day' раскладка одна на всех.
   Своё в сохранении: host.mem() {n: заходов, b: лучший счёт}. */
(function(){if(typeof VYMG_REG!=='function'||!window.VYB)return;
const V=window.VYB,L=V.L,PI=Math.PI,CW=7,CH=9;
// клетки: 0 снег, 1 сугроб, 2 лёд, 3 препятствие, 4 расчищено, 5 посыпано, 6 арка (выезд), 7 полусугроб (один мах сделан)
const SNOW=0,DRIFT=1,ICE=2,OBS=3,CLR=4,SAND=5,GATE=6,HALF=7;
const cost=c=>c===DRIFT?2:c===SNOW||c===ICE||c===HALF?1:c===OBS?Infinity:0;
const pass=c=>c===CLR||c===SAND||c===GATE;
const nb=i=>{const x=i%CW,y=(i/CW)|0,o=[];if(x>0)o.push(i-1);if(x<CW-1)o.push(i+1);if(y>0)o.push(i-CW);if(y<CH-1)o.push(i+CW);return o;};
function gen(seed){for(let tr=0;tr<60;tr++){const r=V.R(seed*41+tr*977+5),g=new Array(CW*CH).fill(SNOW),gate=(CH-1)*CW+1+Math.floor(r()*(CW-2));g[gate]=GATE;
    const free=()=>{let i;do i=Math.floor(r()*CW*CH);while(g[i]!==SNOW);return i;};
    const nc=3+(r()<.45?1:0),cars=[];
    for(let k=0;k<nc;k++){let i,ok=false;for(let t=0;t<40&&!ok;t++){i=free();const y=(i/CW)|0;ok=y<=CH-4&&cars.every(c=>Math.abs(c%CW-i%CW)+Math.abs(((c/CW)|0)-y)>=3);}if(!ok)break;g[i]=CLR;cars.push(i);}
    if(cars.length<3)continue;
    const obs=['tree','tree','tree','bench','snowman','garage','tree','bench'];const ob={};
    for(let k=0;k<6+Math.floor(r()*3);k++){const i=free();if(nb(i).includes(gate)||cars.some(c=>nb(c).includes(i)&&nb(c).filter(j=>g[j]!==OBS).length<=2))continue;g[i]=OBS;ob[i]=obs[k%obs.length];}
    for(let k=0;k<9;k++){const i=free();g[i]=DRIFT;}for(let k=0;k<5;k++){const i=free();g[i]=ICE;}
    cars.forEach(c=>g[c]=SNOW);   // под машиной — снег не считаем: клетка машины особая
    const lv={g,gate,cars:cars.map((c,j)=>({i:c,col:j,gone:false})),ob,seed};
    lv.par=par(lv);if(lv.par<Infinity&&lv.par>=6)return lv;}
  return null;}
/* норма: по всем порядкам машин — Дейкстра от сети (арка + расчищенное + клетки уехавших машин) до очередной машины, чужие машины — стена */
function dij(g,src,carSet,target){const n=CW*CH,d=new Array(n).fill(Infinity),pv=new Array(n).fill(-1),q=[];src.forEach(i=>{d[i]=0;q.push(i);});
  while(q.length){let bi=0;for(let k=1;k<q.length;k++)if(d[q[k]]<d[q[bi]])bi=k;const u=q.splice(bi,1)[0];if(u===target)break;
    for(const v of nb(u)){if(carSet.has(v)&&v!==target)continue;const w=v===target?0:cost(g[v]);if(w===Infinity)continue;if(d[u]+w<d[v]){d[v]=d[u]+w;pv[v]=u;q.push(v);}}}
  return {d:d[target],pv};}
function perms(a){if(a.length<=1)return [a];const o=[];a.forEach((x,i)=>perms(a.slice(0,i).concat(a.slice(i+1))).forEach(p=>o.push([x].concat(p))));return o;}
function par(lv){let best=Infinity;for(const ord of perms(lv.cars.map(c=>c.i))){const g=lv.g.slice();let tot=0;const left=new Set(ord);
    for(const c of ord){const net=[];g.forEach((v,i)=>{if(pass(v)&&!left.has(i))net.push(i);});const r=dij(g,net,left,c);if(r.d===Infinity){tot=Infinity;break;}tot+=r.d;
      let u=r.pv[c];while(u>=0&&!pass(g[u])){g[u]=g[u]===ICE?SAND:CLR;u=r.pv[u];}left.delete(c);g[c]=CLR;}
    if(tot<best)best=tot;}return best;}
const tierOf=(n,p)=>n<=p?3:n<=Math.round(p*1.3)+1?2:1;
const scoreOf=(n,p)=>Math.max(10,100-5*Math.max(0,n-p));
const SAY={hi:[['Ночью намело — машины не выедут! Расчисти дорожки от машин к арке.','It snowed all night — the cars can’t get out! Dig paths from the cars to the arch.']],
  first:[['Веди пальцем от арки или от машины — лопата копает рядом с расчищенным.','Drag from the arch or a car — the shovel digs next to cleared ground.']],
  drift:[['Сугроб! Тут два маха.','A snowdrift! Two swings here.']],ice:[['Лёд — посыпаю песочком.','Ice — sprinkling some sand.']],
  go:[['Поехал! Счастливого пути!','Off it goes! Safe trip!'],['Вот и выехал. Молодец!','Out it goes. Well done!'],['Ещё одна свободна!','Another one free!']],
  far:[['Копай рядом с расчищенным — от дорожки.','Dig next to cleared ground — from the path.']],
  win:[['Все выехали! Чистая работа, как по линеечке.','Everyone’s out! Neat work, straight as a ruler.']],
  winEco:[['Все выехали! Да ты экономнее меня копаешь!','Everyone’s out! You dig more thriftily than me!']]};
const pk=a=>L(...a[Math.floor(Math.random()*a.length)]);
/* ---------- рисование ---------- */
const CARC=['#ff5a6e','#3f86ff','#4fc24a','#ffc233','#9a6bff','#ff9340'];
function drawCell(g,x,y,s,c,i,t){const ell=V.ell,rr=V.rr;
  if(c===ICE){g.fillStyle='#f4f8fc';g.fillRect(x,y,s,s);}
  if(c===CLR||c===GATE||c===SAND){g.fillStyle='#b7c3d0';g.fillRect(x,y,s,s);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+s*.1,y+s*.45,s*.8,s*.08);}
  if(c===ICE||c===SAND){g.fillStyle='#bfe3f6';rr(g,x+s*.06,y+s*.06,s*.88,s*.88,s*.2);g.fill();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(x+s*.2,y+s*.3);g.lineTo(x+s*.45,y+s*.5);g.lineTo(x+s*.4,y+s*.75);g.moveTo(x+s*.45,y+s*.5);g.lineTo(x+s*.75,y+s*.42);g.stroke();
    g.fillStyle='rgba(255,255,255,.55)';ell(g,x+s*.3,y+s*.25,s*.12,s*.05,-.5);g.fill();
    if(c===SAND){const R=V.R(i*7+3);g.fillStyle='#b07a42';for(let k=0;k<22;k++){ell(g,x+s*(.12+R()*.76),y+s*(.12+R()*.76),s*.025,s*.025);g.fill();}}}
  if(c===SNOW||c===DRIFT||c===HALF){const R=V.R(i*13+1);g.fillStyle='#f4f8fc';g.fillRect(x,y,s,s);g.fillStyle='#e4edf6';for(let k=0;k<3;k++){ell(g,x+s*(.2+R()*.6),y+s*(.2+R()*.6),s*.18,s*.1);g.fill();}
    if(c===DRIFT||c===HALF){const hgt=c===DRIFT?1:.55;g.fillStyle='rgba(120,150,190,.28)';ell(g,x+s*.55,y+s*.62,s*.42*hgt+s*.05,s*.3*hgt+s*.04);g.fill();g.fillStyle='#ffffff';ell(g,x+s*.48,y+s*.5,s*.42*hgt+s*.04,s*.32*hgt+s*.04);g.fill();
      g.fillStyle='#eef4fa';ell(g,x+s*.6,y+s*.58,s*.2*hgt,s*.12*hgt);g.fill();}}
  if(c===GATE){g.fillStyle='#7d6a5a';g.fillRect(x,y+s*.72,s,s*.28);g.fillStyle='#a33b2e';rr(g,x-s*.08,y+s*.62,s*.22,s*.38,s*.05);g.fill();rr(g,x+s*.86,y+s*.62,s*.22,s*.38,s*.05);g.fill();
    g.fillStyle='#ffd54a';V.txt(g,'⇣',x+s/2,y+s*.42,s*.42,'#ffc233','center','rgba(40,60,90,.5)');}}
function drawObs(g,x,y,s,k,P){const ell=V.ell,rr=V.rr,cx=x+s/2,cy=y+s/2;
  if(k==='tree'){V.tree(g,cx,cy,s*.42,P,{col:'#4f9a6a',col2:'#69b080'});g.fillStyle='#fff';ell(g,cx-s*.1,cy-s*.12,s*.22,s*.15);g.fill();ell(g,cx+s*.16,cy+s*.08,s*.14,s*.1);g.fill();}
  else if(k==='bench'){g.fillStyle='rgba(60,80,110,.2)';rr(g,x+s*.1,y+s*.36,s*.84,s*.34,s*.05);g.fill();g.fillStyle='#3f86ff';for(let j=0;j<3;j++){rr(g,x+s*.08,y+s*.3+j*s*.11,s*.84,s*.08,s*.03);g.fill();}g.fillStyle='#fff';rr(g,x+s*.1,y+s*.27,s*.8,s*.12,s*.06);g.fill();}
  else if(k==='snowman'){g.fillStyle='rgba(60,80,110,.2)';ell(g,cx+s*.05,cy+s*.08,s*.36,s*.3);g.fill();g.fillStyle='#fff';ell(g,cx,cy+s*.08,s*.32,s*.3);g.fill();ell(g,cx,cy-s*.18,s*.2,s*.19);g.fill();
    g.fillStyle='#2a3340';ell(g,cx-s*.07,cy-s*.22,s*.03,s*.03);g.fill();ell(g,cx+s*.07,cy-s*.22,s*.03,s*.03);g.fill();g.fillStyle='#ff9340';g.beginPath();g.moveTo(cx,cy-s*.17);g.lineTo(cx+s*.16,cy-s*.13);g.lineTo(cx,cy-s*.12);g.fill();
    g.fillStyle='#e5484d';rr(g,cx-s*.17,cy-s*.06,s*.34,s*.07,s*.03);g.fill();}
  else if(k==='garage'){g.fillStyle='rgba(60,80,110,.2)';rr(g,x+s*.1,y+s*.12,s*.86,s*.86,s*.06);g.fill();g.fillStyle='#8b96a6';rr(g,x+s*.05,y+s*.05,s*.9,s*.9,s*.06);g.fill();
    g.fillStyle='#6f7a8a';for(let j=0;j<5;j++)g.fillRect(x+s*.12,y+s*.18+j*s*.14,s*.76,s*.05);g.fillStyle='#fff';rr(g,x+s*.02,y+s*.02,s*.96,s*.2,s*.08);g.fill();}}
function run(host,o){V.intro(host,'mihalych',V.esc(L('Ночью намело! Веди пальцем от ','It snowed all night! Drag from the '))+'<strong>'+V.esc(L('арки','arch'))+'</strong>'+V.esc(L(' — лопата расчистит дорожку. Машина с чистой дорогой уедет сама. Чем меньше махов, тем лучше.',' — the shovel clears a path. A car with a clear way drives off by itself. Fewer swings is better.')),L('Стрелки или WASD — лопата от арки (шаг = мах), Z — назад, R — заново; можно и мышкой','Arrows or WASD — shovel from the arch (step = swing), Z — undo, R — restart; or drag with the mouse')).then(()=>play(host,o));}
function play(host,o){const seed=o.seed||1,lv=gen(seed),m=V.mem(host),P=V.tod('day');
  if(!lv){host.done({score:0,tier:0});return;}
  const g0=lv.g.slice(),sayBox=document.createElement('div');host.el.appendChild(sayBox);
  function say(t){sayBox.innerHTML=V.say(host,'mihalych',V.esc(t));}
  const Sx=V.stage(host,{bar:true}),g=Sx.g,FX=[];
  let G=lv.g,swings=0,undo=[],last=-1,over=false,lay=null,bg=null,moving=[],hint0=true,cur=lv.gate,curOn=!!host.pc,saidD=false,saidI=false;
  const bU=Sx.btn('','↶ '+L('Назад','Undo')+(host.pc?V.kc(host,'Z'):''),undoOne),bR=Sx.btn('','⟳ '+L('Заново','Restart')+(host.pc?V.kc(host,'R'):''),reset);
  function upd(){host.top(L('Махов: ','Swings: ')+swings+L(' · норма ',' · par ')+lv.par);bU.disabled=!undo.length||over;}
  say(pk(SAY.hi));upd();
  function layout(){const W=Sx.W,H=Sx.H,top=Math.min(70,H*.12),s=Math.floor(Math.min((W-16)/CW,(H-top-14)/CH));lay={s,x:Math.round((W-s*CW)/2),y:Math.round(top+(H-top-14-s*CH)/2),top};bg=null;}
  Sx.resize=layout;
  function bake(){const c=document.createElement('canvas'),d=Sx.d,W=Sx.W,H=Sx.H;c.width=Math.round(W*d);c.height=Math.round(H*d);const q=c.getContext('2d');q.scale(d,d);
    q.fillStyle=V.lg(q,0,0,0,H,[0,'#dfe9f3',1,'#f3f7fb']);q.fillRect(0,0,W,H);
    // дом сверху: стена, окна со светом, снег на карнизе
    const hy=lay.y-6,hh=Math.min(hy,Math.max(56,lay.s*1.3));q.fillStyle='#e9d4b4';q.fillRect(0,hy-hh,W,hh);q.fillStyle='#ffffff';q.fillRect(0,hy-hh-4,W,6);const ww=Math.max(24,lay.s*.55);for(let x=10,i=0;x<W;x+=ww*1.9,i++){if(hy-ww*1.2-8<2)break;const y=hy-ww*1.2-8;q.fillStyle='#fff';V.rr(q,x-2,y-2,ww+4,ww*1.1+4,3);q.fill();q.fillStyle=i%3?'#9ccbe8':'#ffe39a';V.rr(q,x,y,ww,ww*1.1,2);q.fill();q.fillStyle='#fff';V.rr(q,x-3,y-5,ww+6,5,2.5);q.fill();}
    q.fillStyle='#ffffff';q.fillRect(0,hy-3,W,5);q.fillStyle='#cfd8e2';q.fillRect(0,hy+2,W,4);
    // бордюр двора
    q.fillStyle='rgba(60,80,110,.18)';V.rr(q,lay.x-5,lay.y-1,lay.s*CW+10,lay.s*CH+10,10);q.fill();bg=c;}
  const cellAt=p=>{if(!lay)return -1;const cx=Math.floor((p.x-lay.x)/lay.s),cy=Math.floor((p.y-lay.y)/lay.s);return cx<0||cy<0||cx>=CW||cy>=CH?-1:cy*CW+cx;};
  const carAt=i=>lv.cars.find(c=>!c.gone&&c.i===i);
  const near=i=>nb(i).some(j=>pass(G[j])&&!carAt(j)||carAt(j)||G[j]===GATE);
  function dig(i,quiet){if(over||i<0)return false;const c=G[i];if(carAt(i)||c===OBS||c===CLR||c===SAND||c===GATE)return false;
    if(!near(i)){if(!quiet&&hint0){say(pk(SAY.far));}return false;}
    undo.push([i,c]);swings++;hint0=false;
    if(c===DRIFT){G[i]=HALF;if(!saidD){saidD=true;say(pk(SAY.drift));}}else if(c===ICE){G[i]=SAND;if(!saidI){saidI=true;say(pk(SAY.ice));}}else G[i]=CLR;
    V.snd(host,'tap');V.buzz(8);const x=lay.x+(i%CW+.5)*lay.s,y=lay.y+(((i/CW)|0)+.5)*lay.s;if(!Sx.calm)V.burst(FX,x,y,c===ICE?5:7,c===ICE?['#b07a42','#d9a066']:['#ffffff','#e4edf6']);
    upd();Sx.later(check,120);return true;}
  function check(){if(over)return;for(const c of lv.cars){if(c.gone||c.go)continue;const left=new Set(lv.cars.filter(x=>!x.gone&&x!==c).map(x=>x.i));
      // путь только по проходимым клеткам
      const prev=new Array(CW*CH).fill(-2),q=[c.i];prev[c.i]=-1;while(q.length){const u=q.shift();if(u===lv.gate)break;for(const v of nb(u))if(prev[v]===-2&&!left.has(v)&&pass(G[v])){prev[v]=u;q.push(v);}}
      if(prev[lv.gate]===-2)continue;const path=[];let u=lv.gate;while(u!==-1){path.unshift(u);u=prev[u];}
      c.go={path,t:0};undo=[];V.snd(host,'horn');say(pk(SAY.go));upd();return;}}
  function undoOne(){if(over||!undo.length)return;const [i,c]=undo.pop();G[i]=c;swings--;V.snd(host,'tap');upd();}
  function reset(){if(over)return;G=lv.g=g0.slice();swings=0;undo=[];lv.cars.forEach(c=>{c.gone=false;c.go=null;});cur=lv.gate;curOn=!!host.pc;upd();say(pk(SAY.hi));}
  function finish(){over=true;upd();bU.disabled=bR.disabled=true;const sc=scoreOf(swings,lv.par),tr=tierOf(swings,lv.par);say(pk(swings<lv.par?SAY.winEco:SAY.win));V.snd(host,'win');
    if(!o.train){m.n=(m.n|0)+1;m.b=Math.max(m.b|0,sc);}
    Sx.later(()=>{Sx.stop();host.done({score:sc,tier:tr,label:L('Махов: ','Swings: ')+swings+L(' · норма Михалыча: ',' · Mikhalych’s par: ')+lv.par});},1600);}
  let dragLast=null;
  function stroke(p){const i=cellAt(p);if(i<0||i===last)return;last=i;dig(i);}
  Sx.down=p=>{if(over)return;curOn=false;last=-1;dragLast=p;stroke(p);};
  Sx.move=p=>{if(over||!dragLast)return;const dx=p.x-dragLast.x,dy=p.y-dragLast.y,n=Math.ceil(Math.hypot(dx,dy)/(lay.s/3));for(let k=1;k<=n;k++)stroke({x:dragLast.x+dx*k/n,y:dragLast.y+dy*k/n});dragLast=p;};
  Sx.up=()=>{dragLast=null;last=-1;};
  Sx.hover=p=>{const i=p?cellAt(p):-1;Sx.cursor(i>=0&&!over&&near(i)&&[SNOW,DRIFT,ICE,HALF].includes(G[i])&&!carAt(i)?'pointer':'');};
  V.keys(host,k=>{if(over)return false;if(k==='z'||k==='Z'||k==='я'||k==='Я'||k==='Backspace'){undoOne();return true;}if(k==='r'||k==='R'||k==='к'||k==='К'){reset();return true;}
    const kl=String(k).toLowerCase(),A={w:'ArrowUp','ц':'ArrowUp',s:'ArrowDown','ы':'ArrowDown',a:'ArrowLeft','ф':'ArrowLeft',d:'ArrowRight','в':'ArrowRight'}[kl];if(A)k=A;
    const D={ArrowUp:-CW,ArrowDown:CW,ArrowLeft:-1,ArrowRight:1}[k];if(D==null)return false;curOn=true;
    const x=cur%CW;if((k==='ArrowLeft'&&x===0)||(k==='ArrowRight'&&x===CW-1))return true;const j=cur+D;if(j<0||j>=CW*CH)return true;
    if(pass(G[j])||carAt(j)){cur=j;return true;}if(G[j]===HALF||G[j]===DRIFT){dig(j,true);if(pass(G[j]))cur=j;return true;}if(dig(j,true))cur=j;return true;});
  Sx.frame=(dt,t)=>{const W=Sx.W,H=Sx.H;if(!lay)layout();if(!bg)bake();g.drawImage(bg,0,0,W,H);const s=lay.s;
    for(let i=0;i<CW*CH;i++){const x=lay.x+(i%CW)*s,y=lay.y+((i/CW)|0)*s;const c=G[i];drawCell(g,x,y,s,c===OBS?SNOW:c,i,t);}
    // края дорожек: снежный бортик между расчищенным и снегом
    g.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<CW*CH;i++){if(!pass(G[i]))continue;const x=lay.x+(i%CW)*s,y=lay.y+((i/CW)|0)*s;
      for(const j of nb(i)){if(pass(G[j])||carAt(j))continue;const d=j-i;if(d===1)g.fillRect(x+s-3,y,3,s);else if(d===-1)g.fillRect(x,y,3,s);else if(d===CW)g.fillRect(x,y+s-3,s,3);else g.fillRect(x,y,s,3);}}
    for(const k in lv.ob){const i=+k,x=lay.x+(i%CW)*s,y=lay.y+((i/CW)|0)*s;drawObs(g,x,y,s,lv.ob[k],P);}
    // курсор клавиатуры
    if(curOn&&!over){const x=lay.x+(cur%CW)*s,y=lay.y+((cur/CW)|0)*s;g.save();g.setLineDash([6,4]);g.strokeStyle='#2a6fdb';g.lineWidth=3;V.rr(g,x+2,y+2,s-4,s-4,6);g.stroke();g.restore();}
    // машины: стоят в снегу (шапка снега), уезжают по дорожке к арке и дальше вниз
    let all=true;
    lv.cars.forEach((c,j)=>{if(c.gone)return;all=false;let cx=lay.x+(c.i%CW+.5)*s,cy=lay.y+(((c.i/CW)|0)+.5)*s,ang=PI;
      if(c.go){c.go.t+=dt*(Sx.calm?6:4.2);const P2=c.go.path,f=Math.min(c.go.t,P2.length-1),a=Math.floor(f),b=Math.min(a+1,P2.length-1),fr=f-a;
        const ax=P2[a]%CW,ay=(P2[a]/CW)|0,bx=P2[b]%CW,by=(P2[b]/CW)|0;cx=lay.x+(ax+(bx-ax)*fr+.5)*s;cy=lay.y+(ay+(by-ay)*fr+.5)*s;
        if(b!==a)ang=Math.atan2(bx-ax,-(by-ay));else ang=PI;
        if(c.go.t>=P2.length-1){const ex=c.go.t-(P2.length-1);cy+=ex*s;ang=PI;if(ex>2.2){c.gone=true;G[c.i]=CLR;c.go=null;Sx.later(check,60);}}}
      else if(!Sx.calm){cx+=Math.sin(t*2+j)*.3;}
      V.car(g,cx,cy,s*.86,s*.5,CARC[c.col%CARC.length],ang,{snow:c.go?.35:1});});
    if(all&&!over)finish();
    // подсказка в начале: мигающая обводка арки
    if(hint0&&!over){const x=lay.x+(lv.gate%CW)*s,y=lay.y+((lv.gate/CW)|0)*s,a=Sx.calm?1:.6+.4*Math.sin(t*4);g.strokeStyle='rgba(255,176,32,'+a+')';g.lineWidth=4;V.rr(g,x+2,y+2,s-4,s-4,8);g.stroke();
      V.txt(g,L('Копай от арки ↑','Dig from the arch ↑'),Math.min(Math.max(x+s/2,90),W-90),y+s+12>H-4?y-12:y+s+12,14,'#22303f','center','#fff',700);}
    V.parts(g,FX,dt);};
  layout();Sx.start();Sx.later(()=>{if(hint0)say(pk(SAY.first));},3500);
  (window.__vyb||(window.__vyb={})).sneg={lv,dig:i=>dig(i),lay:()=>lay,st:()=>({swings,par:lv.par,over,cur,curOn,G:G.slice(),cars:lv.cars.map(c=>({i:c.i,gone:c.gone,go:!!c.go}))}),undo:undoOne,reset,
    solve:()=>{/* путь нормы: по лучшему порядку — для теста */const r=[];const best={t:Infinity,cells:null};for(const ord of perms(lv.cars.map(c=>c.i))){const g2=G.slice();let tot=0;const left=new Set(ord),cells=[];
      for(const c of ord){const net=[];g2.forEach((v,i)=>{if(pass(v)&&!left.has(i))net.push(i);});const rr=dij(g2,net,left,c);if(rr.d===Infinity){tot=Infinity;break;}tot+=rr.d;const seg=[];let u=rr.pv[c];while(u>=0&&!pass(g2[u])){seg.unshift(u);g2[u]=g2[u]===ICE?SAND:CLR;u=rr.pv[u];}cells.push(...seg);left.delete(c);g2[c]=CLR;}
      if(tot<best.t){best.t=tot;best.cells=cells;}}return best;}};}
/* зима: с 15 ноября по 15 марта (решение владельца 09.10: зима с 15.11); на стенде ?vymg=sneg — всегда */
function winter(){try{const d=typeof dayKey==='function'?dayKey(0):0,md=d%10000;return md>=1115||md<=315||/[?&]vymg=sneg/.test(location.search);}catch(e){return true;}}
VYMG_REG({id:'sneg',run,open:winter,sim(o,k){const lv=gen(o.seed||1);if(!lv)return {score:0,tier:0};const r=o.rnd||V.R(o.seed||1);const n=lv.par+Math.round((1-k)*lv.par*.7*r()+(r()<(1-k)*.5?2:0));return {score:scoreOf(n,lv.par),tier:tierOf(n,lv.par)};}});
})();
