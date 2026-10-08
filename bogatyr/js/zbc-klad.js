'use strict';
/* BGC: забава №3 «Карта старого клада» ⭐ (постоянная). Пергаментная карта пройденной земли 6×6: спрятан клад и 3 находки (свой ГПСЧ от недели и номера карты).
   Копка тратит лопату и показывает, сколько шагов (по Чебышеву) до клада: 1 — горячо, 5 — холодно. Опытный найдёт за 4–6 копок, наугад — за 8–12.
   Лопаты: 3 в день, копятся до 6 (пропустил день — не потерял); «+2 лопаты за рекламу» — раз в день, только когда лопаты кончились.
   Волчонок (питомец Леса) раз в день нюхает квадрат 2×2: честно — может «не учуять» (тогда там клада нет).
   Карты по порядку пройденных земель; новая — в понедельник или сразу после найденного клада (не больше 2 карт в неделю).
   Награда: находка — 1 трофей земли карты; клад — 5 трофеев + 30 Славы; каждая 4-я выкопанная карта — украшение Терема.
   Награды копятся в store().p и выдаются по «Готово» (вышел крестиком — заберёшь в следующий раз).
   Сейв — только host.store(): {sh:лопаты, dk:день начисления, n:кладов найдено, wk:неделя, wc:карт за неделю, m:{th,sd,d:'36 знаков',k}, p:{tr,sl,deco}, wf:день волчонка, ad:день ролика, seen}.
   ПК: мышь; стрелки — рамка по клеткам, Enter/пробел — копать; Enter на пустых лопатах — «Готово». */
(function(){
const N=6,FINDS=3,SH_DAY=3,SH_MAX=6,SH_AD=2,MAPS_WK=2,KL_TR=5,KL_SL=30;
const DIST_C=['#ffd84a','#e8433a','#f0802a','#e8c03a','#6ab8e0','#4a6ad0'];
art('zbc_lopata',40,g=>{g.save();g.rotate(-.5);ln(g,[0,-18,0,6],'#8a5a2e',3.2);rrect(g,-5,-21,10,4,2);g.fillStyle='#6a4222';g.fill();
  shp(g,'#b8c4d0',{hl:.6},[-7,5,7,20],()=>{g.moveTo(-7,6);g.lineTo(7,6);g.lineTo(6,15);g.quadraticCurveTo(0,21,-6,15);g.closePath();});g.restore();});
art('zbc_i3',40,g=>{// значок: свиток-карта с крестиком
  rrect(g,-15,-12,30,24,3);g.fillStyle=grad(g,0,0,18,'#f0dca8',.3,-.25);g.fill();outline(g,'#c8a060',1.2);
  for(const x of[-15,15]){ell(g,x,0,3,13,'#d8b878',{lw:.8});}
  g.setLineDash([2,2]);ln(g,[-10,6,-4,0,2,4,7,-4],'#a8402a',1.2);g.setLineDash([]);ln(g,[5,-7,10,-2],'#c8302a',2);ln(g,[10,-7,5,-2],'#c8302a',2);
  g.save();g.translate(9,9);g.scale(.5,.5);ART.zbc_lopata.fn(g);g.restore();});
// украшения Терема за каждую 4-ю карту
const DECO=[['zbc_sunduk',['Старый сундук на крыльце','Old chest on the porch'],g=>{ell(g,0,16,22,5,'rgba(0,0,0,.2)',{ol:false,flat:true});rrect(g,-20,-2,40,18,3);g.fillStyle=grad(g,0,6,22,'#7a4a22',.35,-.4);g.fill();outline(g,'#7a4a22',1.3); // i18n:ru — пара ru/en по договору ядра
    for(const x of[-13,13]){rrect(g,x-2.5,-2,5,18,1);g.fillStyle='#8a8a90';g.fill();}shp(g,'#8a5a2a',{hl:.4},[-21,-13,21,-1],()=>{g.moveTo(-21,-1);g.quadraticCurveTo(-21,-14,0,-14);g.quadraticCurveTo(21,-14,21,-1);g.closePath();});
    rrect(g,-3.5,-5,7,8,1.5);g.fillStyle='#e8c040';g.fill();ell(g,-6,-16,5,3,'#f2c84a',{lw:.6});ell(g,4,-15,4,2.5,'#f2c84a',{lw:.6});},[.16,.9,1]],
  ['zbc_fonar',['Кованый фонарь','Wrought-iron lantern'],g=>{ln(g,[0,26,0,-14],'#3a3a44',3);ln(g,[0,-14,10,-18,10,-12],'#3a3a44',2);glow(g,10,-2,14,'#ffc45a'); // i18n:ru — пара ru/en по договору ядра
    rrect(g,4,-12,12,16,2);g.fillStyle='#ffe08a';g.fill();g.strokeStyle='#2a2a30';g.lineWidth=1.6;g.stroke();ln(g,[10,-12,10,4],'#2a2a30',1);poly(g,[3,-12,10,-17,17,-12],'#3a3a44',{lw:.8});ell(g,0,26,7,2.5,'#3a3a44',{lw:.6});},[.62,.78,1]],
  ['zbc_kartar',['Карта клада в рамке','Framed treasure map'],g=>{rrect(g,-18,-14,36,28,2);g.fillStyle=grad(g,0,0,20,'#8a5a2e',.3,-.3);g.fill();outline(g,'#8a5a2e',1.2);rrect(g,-14,-10,28,20,1);g.fillStyle='#f0dca8';g.fill(); // i18n:ru — пара ru/en по договору ядра
    g.setLineDash([2,2]);ln(g,[-10,6,-3,0,3,3,8,-5],'#a8402a',1.1);g.setLineDash([]);ln(g,[6,-7,10,-3],'#c8302a',1.6);ln(g,[10,-7,6,-3],'#c8302a',1.6);},[.38,.7,.9]]];
if(typeof ZAB_DECO==='function')for(const [id,n,a,at] of DECO)ZAB_DECO(id,{n,art:a,at});

function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function cheb(a,b){return Math.max(Math.abs(a%N-b%N),Math.abs((a/N|0)-(b/N|0)));}
function layoutMap(sd){const r=mulberry(sd),k=Math.floor(r()*N*N),f=[];while(f.length<FINDS){const i=Math.floor(r()*N*N);if(i!==k&&f.indexOf(i)<0)f.push(i);}return {k,f};}
function dayNum(k){const p=String(k||'').split('-').map(Number);return p.length===3?Math.round(Date.UTC(p[0],p[1]-1,p[2])/864e5):0;}
function lands(){const out=[];try{for(const th of TH_IDS){const r=CAMP.find(x=>x.th===th&&x.n===1);if(r&&ORD.indexOf(r.slot)>=0&&S.done&&S.done[r.slot])out.push(th);}}catch(e){}return out.length?out:['les'];}
function thName(th){try{return TH[th]&&TH[th].name||th;}catch(e){return th;}}
function wolfOwn(){try{return /[?&]zbcwolf=1/.test(location.search)||!!(S.pet&&S.pet.own&&S.pet.own.indexOf('les')>=0);}catch(e){return false;}}
function klTier(p){return p.k?3:p.tr>=2?2:p.tr>=1?1:0;}

function run(host,o){const cv=ZABK.canvas(host),g=cv.getContext('2d'),T=ZABK.text,pc=zabPC(),calm=o.calm,today=o.day||dayKey(),wk=o.week||weekNo();
  // ---------- состояние (тренировка — своя временная карта) ----------
  const s=o.train?{sh:SH_MAX,dk:today,n:0,wk,wc:1,m:{th:lands()[0],sd:o.seed>>>0,d:'.'.repeat(N*N),k:0},p:{tr:0,sl:0,deco:''},wf:'',ad:today,seen:1}:host.store();
  const save=()=>{if(!o.train)host.touch();};
  function fix(){if(!(s.sh>=0))s.sh=SH_DAY;if(!s.dk)s.dk=today;s.n=s.n|0;s.wc=s.wc|0;if(!s.p||typeof s.p!=='object')s.p={tr:0,sl:0,deco:''};
    const dd=dayNum(today)-dayNum(s.dk);if(dd>0){s.sh=Math.min(SH_MAX,Math.max(s.sh,0)+SH_DAY*dd);s.dk=today;}else if(dd<0)s.dk=today;
    if(s.wk!==wk){s.wk=wk;s.wc=0;}
    const m=s.m;if(!m||typeof m.d!=='string'||m.d.length!==N*N||!m.th)s.m=null;}
  function newMap(){const LS=lands(),th=LS[s.n%LS.length];s.m={th,sd:hashS('klad|'+wk+'|'+s.n+'|'+th),d:'.'.repeat(N*N),k:0};s.wc++;}
  if(!o.train){fix();if(!s.m||(s.m.k&&!(s.p.tr||s.p.sl)&&s.wc<MAPS_WK))newMap();save();}
  let M=s.m,lay=layoutMap(M.sd);const sess={tr:0,f:0,dug:0};
  const st={ph:s.seen?'play':'intro',t:0,dig:null,cel:0,cur:-1,hov:-1,said:'',sayT:0,sent:0,wolfT:0};
  const P=[],pops=[];
  // ---------- раскладка ----------
  let W=0,H=0,D=1,land=false,mx=0,my=0,ms=0,cell=0,gx=0,gy=0,px0=0,py0=0,pw=0,ph=0,bg=null;const btns=[];
  function layout(){W=cv.W;H=cv.H;D=cv.D;land=W>H*1.08;
    if(land){ms=Math.min(H-28,W*.56);mx=Math.max(14,W*.04);my=(H-ms)/2;px0=mx+ms+20;py0=70;pw=W-px0-16;ph=H-py0-14;}
    else{ms=Math.min(W-16,H-74-232);mx=(W-ms)/2;my=66;px0=12;py0=my+ms+10;pw=W-24;ph=H-py0-10;}
    const m=ms*.075;cell=(ms-2*m)/N;gx=mx+m;gy=my+m;bg=null;}
  layout();host.onResize(layout);
  // ---------- карта-пергамент (кэш) ----------
  function mkBg(){const c=mkCanvas(W*D,H*D),b=c.getContext('2d');b.setTransform(D,0,0,D,0,0);b.lineJoin='round';b.lineCap='round';const r=mulberry(M.sd^0x5a5a);
    // стол под картой
    let q=b.createLinearGradient(0,0,0,H);q.addColorStop(0,'#5a3a20');q.addColorStop(1,'#2e1c0e');b.fillStyle=q;b.fillRect(0,0,W,H);
    for(let y=0;y<H;y+=Math.max(26,H/18)){b.fillStyle='rgba(0,0,0,.18)';b.fillRect(0,y,W,2);b.strokeStyle='rgba(255,220,160,.05)';b.lineWidth=1;for(let i=0;i<3;i++){b.beginPath();b.moveTo(0,y+6+i*6);b.bezierCurveTo(W*.3,y+2+i*7,W*.6,y+10+i*5,W,y+5+i*6);b.stroke();}}
    // пергамент с рваным краем
    const edge=[];const E=40;for(let i=0;i<E;i++){const t=i/E;edge.push([mx+ms*t,my+r()*ms*.018]);}for(let i=0;i<E;i++){const t=i/E;edge.push([mx+ms-r()*ms*.018,my+ms*t]);}
    for(let i=0;i<E;i++){const t=i/E;edge.push([mx+ms*(1-t),my+ms-r()*ms*.018]);}for(let i=0;i<E;i++){const t=i/E;edge.push([mx+r()*ms*.018,my+ms*(1-t)]);}
    const path=()=>{b.beginPath();edge.forEach(([x,y],i)=>i?b.lineTo(x,y):b.moveTo(x,y));b.closePath();};
    b.save();b.shadowColor='rgba(0,0,0,.5)';b.shadowBlur=18;b.shadowOffsetY=6;path();b.fillStyle='#ecd6a0';b.fill();b.restore();
    b.save();path();b.clip();
    q=b.createRadialGradient(mx+ms/2,my+ms/2,ms*.2,mx+ms/2,my+ms/2,ms*.75);q.addColorStop(0,'#f6e6bc');q.addColorStop(.7,'#ead09a');q.addColorStop(1,'#b8874a');b.fillStyle=q;b.fillRect(mx-4,my-4,ms+8,ms+8);
    const gr=TH[M.th]&&TH[M.th].ground;if(gr){b.globalAlpha=.2;b.fillStyle=gr.base;b.fillRect(mx,my,ms,ms);b.globalAlpha=1;}
    for(let i=0;i<9;i++){b.fillStyle='rgba(140,90,40,'+(.04+r()*.06)+')';b.beginPath();b.ellipse(mx+r()*ms,my+r()*ms,ms*(.04+r()*.08),ms*(.03+r()*.06),r()*3,0,TAU);b.fill();}
    // тропа и речка
    b.strokeStyle='rgba(90,140,200,.5)';b.lineWidth=Math.max(4,ms*.018);{let ry=.3+r()*.4;b.beginPath();b.moveTo(mx,my+ms*ry);for(let i=1;i<=4;i++){const ny=Math.max(.12,Math.min(.88,ry+(r()-.5)*.3));b.quadraticCurveTo(mx+ms*(i-.5)/4,my+ms*(ry+(r()-.5)*.2),mx+ms*i/4,my+ms*ny);ry=ny;}b.stroke();}
    b.setLineDash([ms*.02,ms*.016]);b.strokeStyle='rgba(150,60,30,.55)';b.lineWidth=Math.max(2,ms*.008);b.beginPath();b.moveTo(mx+ms*(.1+r()*.2),my+ms*.98);for(let i=1;i<=4;i++)b.quadraticCurveTo(mx+ms*r(),my+ms*(1-i/4+.1),mx+ms*(.15+r()*.7),my+ms*(1-i/4));b.stroke();b.setLineDash([]);
    // рисунки земли (как на старой карте — блёклые)
    const dec=TH[M.th]&&TH[M.th].decor||['d_pine'];for(let i=0;i<16;i++){const k=dec[i%dec.length];if(!ART[k])continue;const x=mx+ms*(.06+r()*.88),y=my+ms*(.08+r()*.86),sz=cell*(.7+r()*.5);
      b.globalAlpha=.5;const sp=ZABK.spr(k,sz,D);if(sp)b.drawImage(sp,x-sz/2,y-sz/2,sz,sz);}b.globalAlpha=1;
    // роза ветров
    const cx=mx+ms*.88,cy=my+ms*.12,cr=ms*.07;b.strokeStyle='rgba(90,50,20,.7)';b.lineWidth=1.4;b.beginPath();b.arc(cx,cy,cr*.7,0,TAU);b.stroke();
    for(let i=0;i<8;i++){const a=i*TAU/8-Math.PI/2,l=i%2?cr*.6:cr;b.fillStyle=i===0?'#b8322a':'rgba(90,50,20,.75)';b.beginPath();b.moveTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l);b.lineTo(cx+Math.cos(a+.25)*cr*.18,cy+Math.sin(a+.25)*cr*.18);b.lineTo(cx+Math.cos(a-.25)*cr*.18,cy+Math.sin(a-.25)*cr*.18);b.closePath();b.fill();}
    b.font=ZABK.font(cr*.5,900);b.fillStyle='#5a2a14';b.textAlign='center';b.textBaseline='middle';b.fillText(L('С','N'),cx,cy-cr*1.2);
    // сетка чернилами
    b.strokeStyle='rgba(80,46,20,.42)';b.lineWidth=1.3;for(let i=0;i<=N;i++){b.beginPath();b.moveTo(gx+i*cell,gy);b.lineTo(gx+i*cell,gy+N*cell);b.stroke();b.beginPath();b.moveTo(gx,gy+i*cell);b.lineTo(gx+N*cell,gy+i*cell);b.stroke();}
    b.font=ZABK.font(Math.max(10,cell*.2),800);b.fillStyle='rgba(80,46,20,.6)';for(let i=0;i<N;i++){b.fillText(L('АБВГДЕ','ABCDEF')[i],gx+(i+.5)*cell,gy-cell*.17);b.fillText(String(i+1),gx-cell*.2,gy+(i+.5)*cell);}
    // обожжённый край
    q=b.createRadialGradient(mx+ms/2,my+ms/2,ms*.45,mx+ms/2,my+ms/2,ms*.75);q.addColorStop(0,'rgba(90,50,10,0)');q.addColorStop(1,'rgba(90,50,10,.55)');b.fillStyle=q;b.fillRect(mx,my,ms,ms);
    b.restore();path();b.strokeStyle='rgba(90,50,20,.8)';b.lineWidth=2;b.stroke();
    bg=c;}
  // ---------- копка ----------
  const isDug=i=>M.d[i]!=='.';
  function setDug(i){M.d=M.d.slice(0,i)+'#'+M.d.slice(i+1);}
  function dig(i){if(st.ph!=='play'||st.dig||M.k||i<0||i>=N*N||isDug(i))return;if(s.sh<=0){say(L('Лопаты кончились!','Out of shovels!'));try{host.snd.click();}catch(_){}return;}
    s.sh--;st.dig={i,t:0};try{host.snd.swing();}catch(_){}}
  function reveal(i){setDug(i);sess.dug++;const x=gx+(i%N+.5)*cell,y=gy+((i/N|0)+.5)*cell;ZABK.burst(P,x,y,{n:calm?5:14,col:'#8a5a30',sp:200,a0:-Math.PI,arc:Math.PI,s:4});
    if(i===lay.k){M.k=1;s.p.tr=(s.p.tr|0)+KL_TR;s.p.sl=(s.p.sl|0)+KL_SL;sess.tr+=KL_TR;sess.k=1;s.n=(s.n|0)+1;
      if(!o.train&&s.n%4===0){const z=typeof ZB==='function'?ZB():null;const id=DECO.map(d=>d[0]).find(id=>!(z&&z.u&&z.u[id]));if(id)s.p.deco=id;}
      st.cel=.001;ZABK.burst(P,x,y,{n:calm?12:40,col:'#ffd84a',sp:340,k:'star',s:7,g:300});try{host.snd.chest();setTimeout(()=>{try{host.snd.win();}catch(_){}},350);}catch(_){}
      say(L('Клад! Сундук старого богатыря!','Treasure! An old hero’s chest!'),3);}
    else if(lay.f.indexOf(i)>=0){s.p.tr=(s.p.tr|0)+1;sess.tr++;sess.f++;pops.push({x,y:y-cell*.4,s:'+1',c:'#ffe27a',t:0,ic:'tr_'+M.th});ZABK.burst(P,x,y,{n:calm?5:16,col:'#ffe27a',sp:220,k:'star',s:5});try{host.snd.gem();}catch(_){}
      say(L('Находка! ','A find! ')+(typeof troName==='function'?troName('tr_'+M.th):''));}
    else{const d=cheb(i,lay.k);try{d<=1?host.snd.coin():host.snd.hit();}catch(_){}say([,L('Горячо! Клад совсем рядом!','Hot! The treasure is right next to it!'),L('Тепло!','Warm!'),L('Теплее…','Getting warmer…'),L('Прохладно.','Cool.'),L('Холодно!','Cold!')][d]);}
    if(s.sh<=0&&!M.k)setTimeout(()=>say(L('Лопаты кончились — завтра ещё 3!','Out of shovels — 3 more tomorrow!'),3),900);
    save();}
  function say(t,d){st.said=t;st.sayT=d||2.2;}
  // ---------- волчонок ----------
  function wolfOk(){return !o.train&&wolfOwn()&&s.wf!==today&&!M.k&&st.ph==='play';}
  function wolf(){if(!wolfOk())return;s.wf=today;const r=mulberry(hashS(today+'|'+M.sd)),kx=lay.k%N,ky=lay.k/N|0,good=r()<.5;let x,y;
    if(good){x=Math.max(0,Math.min(N-2,kx-Math.floor(r()*2)));y=Math.max(0,Math.min(N-2,ky-Math.floor(r()*2)));}
    else{let t=0;do{x=Math.floor(r()*(N-1));y=Math.floor(r()*(N-1));t++;}while(t<40&&kx>=x&&kx<=x+1&&ky>=y&&ky<=y+1);}
    const ok=kx>=x&&kx<=x+1&&ky>=y&&ky<=y+1;M.w=[x,y,ok?1:0];st.wolfT=2.4;try{host.snd.combo();}catch(_){}
    say(ok?L('Волчонок: «Р-р-р… тут пахнет кладом!»','Wolf cub: “Grr… treasure smells here!”'):L('Волчонок принюхался: тут клада нет.','The wolf cub sniffed: no treasure here.'),3);save();}
  // ---------- реклама «+2 лопаты» (DOM-кнопка, раз в день, только когда пусто) ----------
  let ab=null;function adBtn(){const want=st.ph==='play'&&!o.train&&!M.k&&s.sh<=0&&s.ad!==today&&!st.dig&&host.adOk();
    if(want&&!ab){ab=document.createElement('button');ab.className='btn ad';ab.textContent=L('🎬 +2 лопаты за рекламу','🎬 +2 shovels for an ad');host.el.appendChild(ab);try{host.offer&&host.offer();}catch(_){}
      ab.onclick=()=>{ab.disabled=true;host.hold=true;host.ad('shovel').then(ok=>{host.hold=false;if(ab)ab.disabled=false;if(ok){s.ad=today;s.sh=Math.min(SH_MAX,s.sh+SH_AD);save();say(L('Ещё две лопаты!','Two more shovels!'));try{host.snd.coin();}catch(_){}}});};}
    if(ab){if(!want&&!ab.disabled){ab.remove();ab=null;return;}const b=btns.reduce((m,x)=>!m||x.y<m.y?x:m,null);ab.style.cssText='position:absolute;z-index:3;left:'+(b?b.x:px0)+'px;top:'+((b?b.y:py0)-62)+'px;width:'+(b?b.w:pw)+'px;min-height:50px;margin:0';}}
  // ---------- завершение ----------
  function finish(){if(st.sent)return;st.sent=1;const p=s.p,tier=klTier({k:sess.k||(p.sl>0),tr:p.tr|0}),th=M.th;
    const ex={tro:'tr_'+th,trN:p.tr|0,sl:p.sl|0,msg:''};if(p.deco)ex.deco=p.deco;
    const left=N*N-M.d.split('').filter(c=>c==='.').length;
    ex.msg=M.k?L('Клад найден! ','Treasure found! ')+(s.wc<MAPS_WK?L('Новая карта уже ждёт.','A new map is waiting.'):L('Новая карта — в понедельник.','New map on Monday.'))
      :L('Лопат: '+s.sh+' из '+SH_MAX+' · завтра ещё '+SH_DAY,'Shovels: '+s.sh+' of '+SH_MAX+' · '+SH_DAY+' more tomorrow');
    if(!o.train){s.p={tr:0,sl:0,deco:''};save();}
    host.done({score:ex.trN,tier,extra:ex});}
  // ---------- ввод ----------
  function cellAt(x,y){const cx=Math.floor((x-gx)/cell),cy=Math.floor((y-gy)/cell);return cx>=0&&cy>=0&&cx<N&&cy<N?cy*N+cx:-1;}
  ZABK.tap(cv,host,(x,y,e)=>{e.preventDefault();if(st.ph==='intro'){if(ZABK.hit(btnGo,x,y)||!pc)start();return;}
    for(const b of btns)if(ZABK.hit(b,x,y)){try{host.snd.click();}catch(_){}b.fn();return;}
    const i=cellAt(x,y);if(i>=0)dig(i);});
  cv.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=cv.getBoundingClientRect(),i=cellAt(e.clientX-r.left,e.clientY-r.top);st.hov=i;cv.style.cursor=i>=0&&!isDug(i)&&!M.k||btns.some(b=>ZABK.hit(b,e.clientX-r.left,e.clientY-r.top))?'pointer':'default';});
  zabKeys(host,(k)=>{if(st.ph==='intro'){if(k==='Enter'||k===' '){start();return true;}return false;}
    const mv={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[k];
    if(mv){if(st.cur<0)st.cur=2*N+2;else{const x=Math.max(0,Math.min(N-1,st.cur%N+mv[0])),y=Math.max(0,Math.min(N-1,(st.cur/N|0)+mv[1]));st.cur=y*N+x;}st.hov=-1;return true;}
    if(k==='Enter'||k===' '){if(M.k||s.sh<=0){finish();return true;}if(st.cur<0){st.cur=2*N+2;return true;}dig(st.cur);return true;}
    if(k==='w'||k==='W'||k==='в'||k==='В'){wolf();return true;}return false;}); // i18n:ru — пара ru/en по договору ядра
  function start(){if(st.ph!=='intro')return;st.ph='play';s.seen=1;save();try{host.snd.click();}catch(_){}}
  const btnGo={x:0,y:0,w:0,h:0,t:L('Начать','Start')};
  // ---------- шаг ----------
  let lastDt=0;function step(dt){st.t+=dt;if(st.sayT>0)st.sayT-=dt;if(st.wolfT>0)st.wolfT-=dt;if(st.cel>0)st.cel+=dt;
    for(const q of pops)q.t+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t>1.2)pops.splice(i,1);
    if(st.dig){st.dig.t+=dt;if(!calm&&Math.random()<.4){const i=st.dig.i;ZABK.burst(P,gx+(i%N+.5)*cell,gy+((i/N|0)+.6)*cell,{n:1,col:'#7a4a24',sp:120,a0:-Math.PI*.9,arc:Math.PI*.8,s:3,d:.4});}
      if(st.dig.t>=(calm?.5:.45)){const i=st.dig.i;st.dig=null;reveal(i);}}}
  // ---------- рисование ----------
  function drawCell(i){const x=gx+(i%N)*cell,y=gy+(i/N|0)*cell,cx=x+cell/2,cy=y+cell/2;
    if(!isDug(i))return;
    g.fillStyle='rgba(70,40,16,.35)';g.beginPath();g.ellipse(cx,cy+cell*.06,cell*.42,cell*.34,0,0,TAU);g.fill();
    const q=g.createRadialGradient(cx,cy,cell*.05,cx,cy+cell*.05,cell*.38);q.addColorStop(0,'#2a180a');q.addColorStop(1,'#6a4424');g.fillStyle=q;g.beginPath();g.ellipse(cx,cy+cell*.05,cell*.36,cell*.27,0,0,TAU);g.fill();
    for(let j=0;j<7;j++){const a=j/7*TAU+i;g.fillStyle=j%2?'#8a6034':'#6a4626';g.beginPath();g.ellipse(cx+Math.cos(a)*cell*.38,cy+cell*.05+Math.sin(a)*cell*.29,cell*.06,cell*.045,0,0,TAU);g.fill();}
    if(i===lay.k){const k=st.cel>0?Math.min(1,st.cel/.6):1,b=ZABK.ease.back(k);g.globalAlpha=.8;g.drawImage(glowSpr('#ffd84a'),cx-cell,cy-cell,cell*2,cell*2);g.globalAlpha=1;ZABK.put(g,'chest',cx,cy-cell*.12*b,cell*(.62+.3*b),D,{});return;}
    if(lay.f.indexOf(i)>=0){ZABK.put(g,'tr_'+M.th,cx,cy-cell*.04,cell*.62,D,{});return;}
    const d=cheb(i,lay.k),r=cell*.27;g.fillStyle=DIST_C[d];g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();g.strokeStyle='rgba(40,20,8,.85)';g.lineWidth=2;g.stroke();
    g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(cx-r*.3,cy-r*.4,r*.4,r*.2,-.4,0,TAU);g.fill();
    T(g,String(d),cx,cy+1,cell*.34,{col:'#fff',lw:Math.max(3,cell*.07),olc:'rgba(40,20,8,.9)'});}
  function draw(){g.setTransform(D,0,0,D,0,0);g.lineJoin='round';g.lineCap='round';if(!bg)mkBg();g.drawImage(bg,0,0,W,H);
    for(let i=0;i<N*N;i++)drawCell(i);
    // волчонок: рамка 2×2
    if(M.w){const [x,y,ok]=M.w,X=gx+x*cell,Y=gy+y*cell;g.save();g.setLineDash([8,6]);g.lineDashOffset=-st.t*20;g.strokeStyle=ok?'#2f9a3a':'rgba(90,70,60,.7)';g.lineWidth=4;rrect(g,X+3,Y+3,cell*2-6,cell*2-6,10);g.stroke();g.restore();
      if(ok){g.fillStyle='rgba(80,200,90,.12)';rrect(g,X+3,Y+3,cell*2-6,cell*2-6,10);g.fill();}ZABK.put(g,ok?'pt_wolf':'pt_paw',X+cell*2-cell*.18,Y+cell*.2,cell*(ok?.6:.42),D,{a:ok?1:.6});}
    // рамка выбора (ПК)
    const sel=st.hov>=0?st.hov:st.cur;if(sel>=0&&!isDug(sel)&&!M.k&&st.ph==='play'){const X=gx+(sel%N)*cell,Y=gy+(sel/N|0)*cell;g.strokeStyle='#b8322a';g.lineWidth=3;rrect(g,X+3,Y+3,cell-6,cell-6,8);g.stroke();
      g.globalAlpha=.55;ZABK.put(g,'zbc_lopata',X+cell*.5,Y+cell*.45,cell*.6,D,{});g.globalAlpha=1;}
    // копает
    if(st.dig){const i=st.dig.i,k=st.dig.t/.45,X=gx+(i%N+.5)*cell,Y=gy+((i/N|0)+.5)*cell;ZABK.put(g,'zbc_lopata',X+cell*.1,Y-cell*.25+Math.abs(Math.sin(k*Math.PI*2))*cell*.18,cell*.9,D,{rot:Math.sin(k*Math.PI*2)*.3});}
    if(st.wolfT>0&&M.w){const [x,y]=M.w,k=1-st.wolfT/2.4,X=gx+(x+1)*cell,Y=gy+(y+1)*cell;ZABK.put(g,'pt_wolf',X+(1-k)*cell*2,Y+cell*1.2,cell*.9,D,{sx:-1});}
    ZABK.parts(g,P,lastDt);
    for(const q of pops){const k=q.t/1.2;g.globalAlpha=1-Math.max(0,k-.6)*2.5;if(q.ic)ZABK.put(g,q.ic,q.x-cell*.25,q.y-k*36,cell*.4,D,{});T(g,q.s,q.x+cell*.12,q.y-k*36,Math.max(18,cell*.34),{col:q.c});}g.globalAlpha=1;
    // клад: праздник поверх
    if(st.cel>0&&st.cel<2.6){const k=Math.min(1,st.cel/.4),a=st.cel>2.1?(2.6-st.cel)/.5:1;g.globalAlpha=a;T(g,L('КЛАД!','TREASURE!'),mx+ms/2,my+ms*.42,Math.min(64,ms*.16)*ZABK.ease.back(k),{col:'#ffe27a',lw:8});g.globalAlpha=1;}
    panel();adBtn();if(st.ph==='intro')intro();}
  function panel(){btns.length=0;const th=M.th,fd=lay.f.filter(i=>isDug(i)).length,fs=land?Math.min(22,H*.032,pw*.05):Math.min(18,W*.045);
    // заголовок — лента
    const rw=land?Math.min(pw,W-px0-80):W-84,rx=land?px0:12,ry=land?14:10;rrect(g,rx,ry,rw,46,12);g.fillStyle='#b8322a';g.fill();g.strokeStyle='#5a1410';g.lineWidth=3;g.stroke();
    ZABK.put(g,'tr_'+th,rx+26,ry+23,34,D,{});T(g,L('Карта: ','Map: ')+thName(th),rx+rw/2+14,ry+24,Math.min(22,W*.052),{mw:rw-70});
    // пергаментная панель
    rrect(g,px0,py0,pw,ph,16);const q=g.createLinearGradient(0,py0,0,py0+ph);q.addColorStop(0,'#fdf0cf');q.addColorStop(1,'#ecd39c');g.fillStyle=q;g.fill();g.strokeStyle='#6e431f';g.lineWidth=3;g.stroke();
    let y=py0+14;const cxp=px0+pw/2;
    // лопаты
    const ls=Math.min(40,(pw-90)/SH_MAX);for(let i=0;i<SH_MAX;i++){const x=px0+16+ls*.5+i*ls;ZABK.put(g,'zbc_lopata',x,y+ls*.45,ls*.95,D,{a:i<s.sh?1:.22});}
    T(g,s.sh+'/'+SH_MAX,px0+16+ls*SH_MAX+34,y+ls*.45,Math.min(24,fs*1.3),{col:s.sh?'#fff6dc':'#ffb0a0'});y+=ls+6;
    // строка состояния
    const line=M.k?L('Клад найден! Находок: ','Treasure found! Finds: ')+fd+'/'+FINDS:L('Находок: ','Finds: ')+fd+'/'+FINDS+L(' · клад не найден',' · treasure not found');
    T(g,line,cxp,y+fs*.6,fs,{ol:false,col:'#3b2412',w:800,mw:pw-20});y+=fs*1.5;
    // шкала тепла
    const lw2=Math.min(pw-40,300),lx=cxp-lw2/2;for(let d=1;d<=5;d++){const x=lx+(d-.5)*lw2/5;g.fillStyle=DIST_C[d];g.beginPath();g.arc(x,y+12,11,0,TAU);g.fill();g.strokeStyle='rgba(40,20,8,.8)';g.lineWidth=1.5;g.stroke();T(g,String(d),x,y+13,13,{lw:3});}
    T(g,L('горячо','hot'),lx+4,y+34,12,{ol:false,col:'#b8322a',w:800,al:'left'});T(g,L('холодно','cold'),lx+lw2-4,y+34,12,{ol:false,col:'#3a5ab0',w:800,al:'right'});y+=46;
    // подсказка / реплика
    const tip=st.sayT>0?st.said:M.k?L('Сундук выкопан — забирай награду!','The chest is dug up — collect your reward!'):s.sh<=0?L('Лопаты кончились — завтра ещё '+SH_DAY+'.','Out of shovels — '+SH_DAY+' more tomorrow.'):pc?L('Щёлкни клетку или стрелки + Enter. Цифра — шагов до клада.','Click a cell or arrows + Enter. The number is steps to the treasure.'):L('Тапни клетку — копни. Цифра — шагов до клада.','Tap a cell to dig. The number is steps to the treasure.');
    const tl=ZABK.wrap(g,tip,fs*.92,pw-24,700);tl.slice(0,2).forEach((l,i)=>T(g,l,cxp,y+fs*.55+i*fs*1.15,fs*.92,{ol:false,col:st.sayT>0?'#8a2a10':'#5a3a1a',w:700}));y+=fs*2.5;
    // путь к украшению Терема: каждая 4-я карта
    const bh0=Math.min(54,Math.max(46,ph*.12)),room=py0+ph-12-(bh0+10)*(wolfOk()?2:1)-(s.sh<=0&&!M.k&&!o.train?62:0)-y;
    if(room>=96&&!o.train){const z=typeof ZB==='function'?ZB():null,nid=DECO.map(d=>d[0]).find(id=>!(z&&z.u&&z.u[id])),k=s.n%4,is=Math.min(46,(pw-40)/6);
      const yy=y+Math.min(room-96,20);T(g,L('Найдено кладов: ','Treasures found: ')+s.n,cxp,yy+10,fs*.95,{ol:false,col:'#3b2412',w:800});
      for(let i=0;i<4;i++){const x=cxp-is*2.6+i*is*1.1+is*.5;g.globalAlpha=i<k?1:.28;ZABK.put(g,'zbc_i3',x,yy+30+is*.5,is,D,{});g.globalAlpha=1;}
      if(nid){const x=cxp+is*2.3;g.drawImage(glowSpr('#ffe27a'),x-is,yy+30+is*.5-is,is*2,is*2);ZABK.put(g,'tm_d_'+nid,x,yy+30+is*.5,is*1.25,D,{});
        const d=DECO.find(q=>q[0]===nid);T(g,L('4-я карта — украшение Терема «'+d[1][0]+'»','4th map — Terem decoration “'+d[1][1]+'”'),cxp,yy+40+is+fs*.5,fs*.82,{ol:false,col:'#6a4a2a',w:700,mw:pw-20});}}
    // кнопки
    const bh=Math.min(54,Math.max(46,ph*.12)),bw=pw-24;let by=py0+ph-bh-12;
    const pend=(s.p.tr|0)+(s.p.sl|0);btns.push({k:'done',x:px0+12,y:by,w:bw,h:bh,t:M.k||pend?L('Забрать','Collect'):L('Готово','Done'),fn:finish});
    if(wolfOk()){by-=bh+10;btns.push({k:'wolf',x:px0+12,y:by,w:bw,h:bh,t:L('Волчонок, нюхай!','Sniff, wolf cub!')+(pc?' (W)':''),fn:wolf,col:['#b8e08a','#5a9a3a'],ic:'pt_wolf'});}
    for(const b of btns){ZABK.btn(g,b,Math.min(22,bh*.42));if(b.ic)ZABK.put(g,b.ic,b.x+30,b.y+b.h/2,bh*.8,D,{});}
    if(pc&&(M.k||s.sh<=0))zabKeycap(g,px0+pw-40,btns[0].y+btns[0].h/2,'Enter',20);}
  function intro(){g.fillStyle='rgba(20,12,4,.6)';g.fillRect(0,0,W,H);const w=Math.min(W-28,470);
    const lines=[L('Здесь спрятан клад и 3 находки.','A treasure and 3 finds are hidden here.'),L('Копни клетку: цифра — сколько шагов до клада (1 — горячо, 5 — холодно).','Dig a cell: the number shows steps to the treasure (1 — hot, 5 — cold).'),
      L('Лопат 3 в день, копятся до 6. Не нашёл сегодня — докопаешь завтра!','3 shovels a day, they stack up to 6. Didn’t find it today? Dig on tomorrow!'),pc?L('Мышь — по клетке. Или стрелки и Enter.','Mouse — click a cell. Or arrows and Enter.'):L('Тапни клетку, чтобы копнуть.','Tap a cell to dig.')];
    const fs=Math.min(18,w*.043),wl=lines.map(l=>ZABK.wrap(g,l,fs,w-50,700)),lh=fs*1.3,h=86+wl.reduce((a,b)=>a+b.length,0)*lh+lines.length*8+110,x0=W/2-w/2,y0=Math.max(70,H/2-h/2);
    rrect(g,x0,y0,w,h,20);const q=g.createLinearGradient(0,y0,0,y0+h);q.addColorStop(0,'#fdf0cf');q.addColorStop(1,'#ecd39c');g.fillStyle=q;g.fill();g.strokeStyle='#6e431f';g.lineWidth=4;g.stroke();
    rrect(g,x0+w*.1,y0-18,w*.8,44,12);g.fillStyle='#b8322a';g.fill();g.strokeStyle='#5a1410';g.lineWidth=3;g.stroke();T(g,L('Карта старого клада','The Old Treasure Map'),W/2,y0+4,Math.min(24,w*.056),{mw:w*.74});
    let y=y0+48;ZABK.put(g,'zbc_lopata',x0+w*.25,y+8,44,D,{});ZABK.put(g,'chest',W/2,y+6,52,D,{});ZABK.put(g,'tr_'+M.th,x0+w*.75,y+8,40,D,{});y+=46;
    wl.forEach(ls=>{g.fillStyle='#b8322a';g.beginPath();g.arc(x0+26,y+lh*.5,4,0,TAU);g.fill();ls.forEach(l=>{T(g,l,x0+38,y+lh*.5,fs,{ol:false,col:'#3b2412',w:700,al:'left'});y+=lh;});y+=8;});
    btnGo.w=Math.min(240,w*.62);btnGo.h=58;btnGo.x=W/2-btnGo.w/2;btnGo.y=y0+h-btnGo.h-(pc?42:22);ZABK.btn(g,btnGo,24);
    if(pc){zabKeycap(g,W/2-62,y0+h-22,'Enter',22);T(g,L('или','or'),W/2-12,y0+h-22,14,{ol:false,col:'#6a4a2a',w:700});zabKeycap(g,W/2+44,y0+h-22,L('пробел','space'),22);}}
  ZABK.loop(host,dt=>{lastDt=dt;if(dt>0)step(dt);draw();});
  window.__zbc={st:()=>Object.assign({sh:s.sh,n:s.n,wc:s.wc,th:M.th,dug:M.d,k:M.k,p:JSON.stringify(s.p)},st),start,dig,wolf,finish,lay:()=>lay,
    auto:()=>{if(st.ph!=='play'||st.dig||M.k||s.sh<=0)return;const c=[];for(let i=0;i<N*N;i++)if(!isDug(i))c.push(i);
      const ok=c.filter(i=>{for(let j=0;j<N*N;j++)if(isDug(j)&&lay.f.indexOf(j)<0&&cheb(i,j)!==cheb(j,lay.k))return false;return true;});dig((ok.length?ok:c)[0]);}};
  host.onQuit(()=>{delete window.__zbc;if(ab)ab.remove();});}
/* бот: сколько копок до клада. k — доля «умных» копок (клетка, согласная со всеми цифрами), остальные — наугад. Ступень — по копкам: ≤5 — 3, ≤8 — 2, ≤12 — 1 */
function sim(o,k){const sd=o.seed>>>0,lay=layoutMap(sd),R=mulberry(sd^0x77),dug=[];let n=0;
  while(n<36){n++;const und=[];for(let i=0;i<N*N;i++)if(dug.indexOf(i)<0)und.push(i);
    const fit=und.filter(i=>dug.every(j=>lay.f.indexOf(j)>=0||cheb(i,j)===cheb(j,lay.k)));const pool=R()<k&&fit.length?fit:und,c=pool[Math.floor(R()*pool.length)];
    if(c===lay.k)break;dug.push(c);}
  return {score:n,tier:n<=5?3:n<=8?2:n<=12?1:0};}
ZAB_REG({id:'klad',num:3,n:zabN('Карта старого клада','The Old Treasure Map'),icon:'zbc_i3',kind:'daily',run,sim});
})();
