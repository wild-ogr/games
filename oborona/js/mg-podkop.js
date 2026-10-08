'use strict';
/* OB:MG0 мини-игра №1 «Подкоп!» — дозор у частокола до петухов (45 с).
   Из-под земли вспучиваются бугорки: тап по бугорку — 2 очка («на подлёте»), по вылезшему упырю/кроту — 1. Не успел — нечисть уходит под частокол (−1 бревно из 5).
   Ёжика-помощника и мухоморчика не бить (−1 очко). Раз за игру — вожак-крот в шлеме (3 удара, +5). Ступени: 1–24 — 1, 25–49 — 2, 50+ — 3 (по боту: средний ≈ 2 трофея).
   Сложность — по пройденным землям (o.lvl), окно удара не короче 0,7 с; спокойный режим — окна ×1,3 и реже. Небо светлеет к рассвету. */
art('mg_petuh',40,g=>{// петух на частоколе
  for(const [a,c] of[[-.9,'#2a6a3a'],[-.55,'#1a3a5a'],[-.2,'#2a6a3a']]){g.save();g.translate(-6,0);g.rotate(a);shp(g,c,{hl:.5},[-14,-3,0,3],()=>{g.moveTo(0,0);g.quadraticCurveTo(-10,-6,-15,-1);g.quadraticCurveTo(-9,1,0,3);g.closePath();});g.restore();}
  ell(g,0,2,9,8,'#d8602a',{hl:.45});ell(g,-2,4,5,4,'#a8401a',{lw:.6});
  for(const x of[-2,2])ln(g,[x,9,x,15],'#e8b43a',1.4);
  ell(g,7,-6,5,5.4,'#e8762a',{hl:.5});shp(g,'#e8302a',{hl:.5},[3,-15,11,-9],()=>{g.moveTo(3,-10);g.quadraticCurveTo(4,-15,6,-11);g.quadraticCurveTo(7,-16,9,-11);g.quadraticCurveTo(11,-14,11,-9);g.closePath();});
  poly(g,[11.5,-6.5,16,-5,11.5,-3.8],'#f2c23a',{lw:.5});ell(g,10,-2,1.6,2.4,'#e8302a',{lw:.4});eye(g,8.6,-7,1.5,{px:.4});});

(function(){
const DUR=45,LIVES=5;
function podPar(o){const L=Math.min(1,(o.lvl||0)/10),cm=o.calm?1.3:1;
  return {L,cm,gap:t=>(1.05-.45*L)*(o.calm?1.25:1)*(1-.28*t),max:t=>2+Math.round(L*1.6)+(t>.55?1:0),
    rise:.6*cm,win:t=>Math.max(.7,(1.12-.28*t-.1*L))*cm,friend:.12,leadAt:.45+.15*((o.seed>>>3)%7)/7};}
function podTier(s){return s>=50?3:s>=25?2:s>0?1:0;}

function run(host,o){const cv=MGK.canvas(host),g=cv.getContext('2d'),R=o.rnd,P=podPar(o),calm=o.calm;
  let W=0,H=0,D=1,cols=3,rows=4,holes=[],cell=80,bg=null,fieldY=0,palY=0,palH=0,skyH=0;
  const st={t:-1.6,score:0,lives:LIVES,over:false,endT:0,next:.6,lead:false,leadDone:false,hits:0,streak:0,bestStreak:0,miss:0,shake:0,hint:1};
  const pts=[],pops=[],swings=[],fly=[];
  function layout(){W=cv.W;H=cv.H;D=cv.D;const land=W>H*1.08;cols=land?4:3;rows=land?3:4;
    skyH=H*(land?.2:.17);palY=skyH;palH=H*(land?.13:.1);fieldY=palY+palH*.92;
    const top=fieldY+H*.03,bot=H-Math.max(56,H*.09),fw=Math.min(W*.96,(bot-top)*(land?1.75:1.05)),cw=fw/cols,ch=(bot-top)/rows;cell=Math.min(cw,ch*1.25);
    const x0=W/2-cw*cols/2;holes=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const k=r/(rows-1||1);holes.push({x:x0+cw*(c+.5)+(r%2?cw*.06:-cw*.06),y:top+ch*(r+.55),s:cell*(.82+.18*k),st:'idle',t:0,cd:0,who:'',hp:0});}
    bg=null;}
  layout();host.onResize(layout);
  const free=()=>holes.filter(h=>h.st==='idle'&&h.cd<=0);
  const act=()=>holes.filter(h=>h.st!=='idle'&&h.st!=='hit').length;
  function spawn(p){const f=free();if(!f.length)return;const h=f[Math.floor(R()*f.length)];h.t=0;h.hp=1;
    if(!st.leadDone&&p>=P.leadAt){st.leadDone=true;h.who='lead';h.hp=3;h.st='mound';say(Lg('Вожак полез! Бей трижды!','The leader! Hit him three times!'));return;}
    if(p>.08&&R()<P.friend){h.who=R()<.6?'ezh':'muh';h.st='friend';h.dur=1.5*P.cm;return;}
    h.who=R()<.5?'upyr':'krot';h.st='mound';}
  let sayT=0,sayS='';function say(s){sayS=s;sayT=2.2;}
  if(mgPC()){cv.style.cursor='pointer';say(Lg('Щёлкай мышкой по бугоркам!','Click the mounds with your mouse!'));sayT=3.2;}   // OB:FINAL ПК: мышь, подсказка в первые секунды
  // касание
  cv.addEventListener('pointerdown',e=>{e.preventDefault();if(host.paused||st.over||st.t<0)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    let best=null,bd=1e9;for(const h of holes){if(h.st==='idle'||h.st==='hit')continue;const up=h.st==='up'||h.st==='friend'?h.s*.35:0,dx=x-h.x,dy=y-(h.y-up);const d=Math.hypot(dx,dy*1.15);if(d<h.s*.58&&d<bd){bd=d;best=h;}}
    swings.push({x,y,t:0});if(!best){try{host.snd.click();}catch(_){}return;}hit(best);});
  function hit(h){const wasM=h.st==='mound';
    if(h.st==='friend'){st.score=Math.max(0,st.score-1);pop(h.x,h.y-h.s*.5,'−1','#ff8a7a');say(h.who==='ezh'?Lg('Ой! Ёжик-то свой!','Oops! The hedgehog is a friend!'):Lg('Мухомор не трогай!','Leave the toadstool alone!'));h.st='hit';h.t=0;h.ok=0;st.streak=0;try{host.snd.frog();}catch(_){}return;}
    if(h.who==='lead'&&h.hp>1){h.hp--;h.shk=.25;MGK.burst(pts,h.x,h.y-h.s*.3,{n:calm?3:8,col:'#ffe27a',sp:200,k:'star',s:5});st.shake=calm?0:5;try{host.snd.cannon();}catch(_){}pop(h.x,h.y-h.s*.7,Lg('ещё!','again!'),'#ffe27a');if(h.st==='mound'){h.st='up';h.t=0;h.win=P.win(st.t/DUR)*1.8;}return;}
    const v=h.who==='lead'?5:wasM?2:1;st.score+=v;st.hits++;st.streak++;st.bestStreak=Math.max(st.bestStreak,st.streak);
    pop(h.x,h.y-h.s*.55,'+'+v,wasM?'#ffe27a':'#fff');h.st='hit';h.t=0;h.ok=1;h.mnd=wasM;
    MGK.burst(pts,h.x,h.y,{n:calm?4:12,col:'#8a5a30',sp:240,a0:-Math.PI,arc:Math.PI,k:'dirt',s:5});if(!calm)MGK.burst(pts,h.x,h.y-h.s*.3,{n:5,col:'#fff2a8',sp:160,k:'star',s:4});
    st.shake=calm?0:(h.who==='lead'?9:3);try{wasM?host.snd.boom():host.snd.kill();if(h.who==='lead')host.snd.up();}catch(_){}
    if(st.streak===10)say(Lg('Десять подряд! Так держать!','Ten in a row! Keep it up!'));}
  function pop(x,y,s,c){pops.push({x,y,s,c,t:0});}
  function miss(h){st.lives--;st.miss++;st.streak=0;fly.push({x:h.x,y:h.y,t:0,who:h.who});try{host.snd.leak();}catch(_){}st.shake=calm?0:6;
    if(st.lives<=0){st.over=true;st.endT=0;st.why='lives';say(Lg('Частокол пал! Что успел — то твоё.','The palisade fell! You keep what you got.'));}
    else if(st.lives===2)say(Lg('Держись! Брёвен всего два!','Hold on! Only two logs left!'));}
  // шаг
  let lastDt=0;function step(dt){lastDt=dt;if(dt<=0)return;st.t+=dt;if(sayT>0)sayT-=dt;if(st.shake>0)st.shake=Math.max(0,st.shake-dt*30);
    if(st.over){st.endT+=dt;if(st.endT>2.2&&!st.sent){st.sent=1;host.done({score:st.score,tier:podTier(st.score),extra:{lbl:Lg('отбито нечисти','monsters beaten back'),hits:st.hits,miss:st.miss,streak:st.bestStreak}});}}
    const p=Math.max(0,Math.min(1,st.t/DUR));
    if(st.t>=0&&!st.over){if(st.t>=DUR){st.over=true;st.endT=0;st.why='time';say(Lg('Ку-ка-ре-ку! Рассвет — дозор отстоял!','Cock-a-doodle-doo! Dawn — the watch held!'));try{host.snd.whistle();}catch(_){}
        for(const h of holes)if(h.st!=='idle'&&h.st!=='hit'){h.st='hit';h.t=0;h.ok=0;}}
      else{st.next-=dt;if(st.next<=0){if(act()<P.max(p))spawn(p);st.next=P.gap(p)*(.75+R()*.5);}}}
    for(const h of holes){h.t+=dt;if(h.cd>0)h.cd-=dt;if(h.shk>0)h.shk-=dt;
      if(h.st==='mound'&&h.t>=P.rise){h.st='up';h.t=0;h.win=P.win(p)*(h.who==='lead'?1.8:1);try{if(!calm)host.snd.roots();}catch(_){}}
      else if(h.st==='up'&&h.t>=h.win){h.st='dive';h.t=0;miss(h);}
      else if(h.st==='dive'&&h.t>=.35){h.st='idle';h.cd=.35;}
      else if(h.st==='friend'&&h.t>=h.dur){h.st='idle';h.cd=.3;}
      else if(h.st==='hit'&&h.t>=.42){h.st='idle';h.cd=.3;}}
    for(const q of pops)q.t+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t>.9)pops.splice(i,1);
    for(const q of swings)q.t+=dt;for(let i=swings.length-1;i>=0;i--)if(swings[i].t>.24)swings.splice(i,1);
    for(const q of fly)q.t+=dt;for(let i=fly.length-1;i>=0;i--)if(fly[i].t>.7)fly.splice(i,1);}
  // ---------- рисование ----------
  function sky(p){const n=Math.min(1,p*1.15);const mix=(a,b)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const c=[16,8,0].map(s=>Math.round(((A>>s)&255)*(1-n)+((B>>s)&255)*n));return 'rgb('+c.join(',')+')';};
    const q=g.createLinearGradient(0,0,0,skyH+palH);q.addColorStop(0,mix('#141c48','#6a86d8'));q.addColorStop(.6,mix('#2a3570','#f0a8a0'));q.addColorStop(1,mix('#3a3a72','#ffd49a'));g.fillStyle=q;g.fillRect(0,0,W,skyH+palH);
    if(n<.9){g.globalAlpha=1-n;g.fillStyle='#fff';const r=mulberry(9);for(let i=0;i<40;i++){const x=r()*W,y=r()*skyH*.95,s=r()*1.4+.4;g.globalAlpha=(1-n)*(.5+.5*Math.sin(st.t*2+i));g.beginPath();g.arc(x,y,s,0,TAU);g.fill();}g.globalAlpha=1;}
    // луна садится, солнце встаёт
    const mx=W*.82,my=skyH*(.35+n*.9);g.globalAlpha=1-n*.8;const sp=typeof glowSpr==='function'?glowSpr('#dfe8ff'):null;if(sp)g.drawImage(sp,mx-40,my-40,80,80);g.fillStyle='#fff6d8';g.beginPath();g.arc(mx,my,Math.max(10,skyH*.13),0,TAU);g.fill();g.globalAlpha=1;
    if(n>.35){const sy=skyH+palH*.3-(n-.35)*skyH*1.1,sx=W*.22;const s2=typeof glowSpr==='function'?glowSpr('#ffd27a'):null;g.globalAlpha=Math.min(1,(n-.35)*2);if(s2)g.drawImage(s2,sx-90,sy-90,180,180);g.fillStyle='#fff0b8';g.beginPath();g.arc(sx,sy,skyH*.16,0,TAU);g.fill();g.globalAlpha=1;}}
  function mkBg(){const c=mkCanvas(W*D,H*D),b=c.getContext('2d');b.setTransform(D,0,0,D,0,0);b.lineJoin='round';b.lineCap='round';
    // лес за частоколом
    for(let x=-10;x<W+20;x+=palH*.32){const h=palH*(.7+.4*Math.abs(Math.sin(x*1.3)));b.fillStyle='#1e3a2c';b.beginPath();b.moveTo(x-h*.3,palY+palH*.5);b.lineTo(x,palY-h*.55);b.lineTo(x+h*.3,palY+palH*.5);b.closePath();b.fill();}
    // земля
    let q=b.createLinearGradient(0,fieldY,0,H);q.addColorStop(0,'#3e6a34');q.addColorStop(.3,'#4f7f3a');q.addColorStop(1,'#3a6a2c');b.fillStyle=q;b.fillRect(0,palY+palH*.6,W,H);
    const r=mulberry(21);
    // пятна вскопанной земли вокруг лунок (подкопщики роют)
    for(const h of holes){const s=h.s;q=b.createRadialGradient(h.x,h.y,s*.1,h.x,h.y,s*.62);q.addColorStop(0,'#6a4a28');q.addColorStop(.75,'rgba(106,74,40,.85)');q.addColorStop(1,'rgba(106,74,40,0)');b.fillStyle=q;b.beginPath();b.ellipse(h.x,h.y+s*.02,s*.62,s*.3,0,0,TAU);b.fill();}
    // травинки, цветы и камешки
    for(let i=0;i<W*H/1400;i++){const x=r()*W,y=fieldY+r()*(H-fieldY);b.strokeStyle=r()<.5?'rgba(120,180,70,.6)':'rgba(40,90,30,.45)';b.lineWidth=1.3;for(const d of[-3,0,3]){b.beginPath();b.moveTo(x,y);b.lineTo(x+d,y-5-r()*5);b.stroke();}}
    for(let i=0;i<W*H/9000;i++){const x=r()*W,y=fieldY+12+r()*(H-fieldY-12),c=['#fff6f0','#ffd84a','#c8a0ff','#ff9ab0'][i%4];b.fillStyle=c;for(let j=0;j<5;j++){const a=j/5*TAU;b.beginPath();b.arc(x+Math.cos(a)*2.4,y+Math.sin(a)*2.4,1.8,0,TAU);b.fill();}b.fillStyle='#e8a030';b.beginPath();b.arc(x,y,1.4,0,TAU);b.fill();}
    for(let i=0;i<W*H/6000;i++){const x=r()*W,y=fieldY+r()*(H-fieldY),s=1.5+r()*2.5;b.fillStyle='rgba(170,165,150,.8)';b.beginPath();b.ellipse(x,y,s*1.3,s,0,0,TAU);b.fill();b.fillStyle='rgba(255,255,255,.3)';b.beginPath();b.ellipse(x-s*.3,y-s*.3,s*.5,s*.3,0,0,TAU);b.fill();}
    // частокол — крепкие брёвна с заострёнными верхами
    const lw=palH*.3;for(let x=-lw*.5;x<W+lw;x+=lw*.96){const hh=palH*(1+.08*Math.sin(x*.7)),y0=palY+palH;
      q=b.createLinearGradient(x,0,x+lw,0);q.addColorStop(0,'#c8925a');q.addColorStop(.45,'#a8743e');q.addColorStop(1,'#6a4422');b.fillStyle=q;
      b.beginPath();b.moveTo(x,y0);b.lineTo(x,y0-hh);b.lineTo(x+lw*.5,y0-hh-lw*.7);b.lineTo(x+lw,y0-hh);b.lineTo(x+lw,y0);b.closePath();b.fill();b.strokeStyle='rgba(50,28,12,.75)';b.lineWidth=1.2;b.stroke();
      b.strokeStyle='rgba(60,36,16,.3)';b.lineWidth=1;b.beginPath();b.moveTo(x+lw*.3,y0-hh*.8);b.lineTo(x+lw*.32,y0-hh*.2);b.stroke();}
    b.fillStyle='#5a3a1e';for(const f of[.3,.72]){b.fillRect(0,palY+palH*f,W,Math.max(3,palH*.07));}
    b.fillStyle='rgba(0,0,0,.25)';b.fillRect(0,palY+palH,W,Math.max(4,palH*.12));
    // лунки
    for(const h of holes){const s=h.s;b.fillStyle='rgba(0,0,0,.22)';b.beginPath();b.ellipse(h.x,h.y+s*.05,s*.46,s*.17,0,0,TAU);b.fill();
      q=b.createRadialGradient(h.x,h.y-s*.03,s*.05,h.x,h.y,s*.4);q.addColorStop(0,'#120a04');q.addColorStop(.7,'#2a1a0c');q.addColorStop(1,'#4a3018');b.fillStyle=q;b.beginPath();b.ellipse(h.x,h.y,s*.38,s*.14,0,0,TAU);b.fill();
      // кольцо земляных комьев
      const rr=mulberry(Math.round(h.x*7+h.y));for(let i=0;i<14;i++){const a=i/14*TAU,cx=h.x+Math.cos(a)*s*.42,cy=h.y+Math.sin(a)*s*.16,cs=s*(.05+rr()*.04);
        b.fillStyle=Math.sin(a)>0?'#8a6034':'#6a4626';b.beginPath();b.ellipse(cx,cy,cs*1.3,cs,0,0,TAU);b.fill();b.fillStyle='rgba(255,230,180,.18)';b.beginPath();b.ellipse(cx-cs*.3,cy-cs*.3,cs*.5,cs*.3,0,0,TAU);b.fill();}}
    bg=c;}
  function frontLip(h){const s=h.s;g.save();g.beginPath();g.ellipse(h.x,h.y,s*.42,s*.18,0,0,Math.PI);g.lineTo(h.x-s*.42,h.y+s*.22);g.lineTo(h.x+s*.42,h.y+s*.22);g.closePath();g.clip();
    g.fillStyle='#6a4626';g.beginPath();g.ellipse(h.x,h.y+s*.04,s*.43,s*.17,0,0,Math.PI);g.fill();
    const rr=mulberry(Math.round(h.x*7+h.y));for(let i=0;i<14;i++){const a=i/14*TAU;if(Math.sin(a)<=0){rr();continue;}const cx=h.x+Math.cos(a)*s*.42,cy=h.y+Math.sin(a)*s*.16,cs=s*(.05+rr()*.04);g.fillStyle='#8a6034';g.beginPath();g.ellipse(cx,cy,cs*1.3,cs,0,0,TAU);g.fill();}
    g.restore();}
  function mound(h){const s=h.s,k=Math.min(1,h.t/P.rise),e=MGK.ease.out(k),wob=calm?0:Math.sin(h.t*40)*s*.012*(1-k*.5);
    const hh=s*(.08+.22*e),rw=s*(.24+.12*e);g.save();g.translate(h.x+wob,h.y);
    const q=g.createRadialGradient(-rw*.3,-hh*.8,2,0,0,rw*1.2);q.addColorStop(0,'#b8865a');q.addColorStop(.6,'#8a5a30');q.addColorStop(1,'#5a3a1a');g.fillStyle=q;
    g.beginPath();g.moveTo(-rw,0);g.quadraticCurveTo(-rw*.8,-hh*1.25,0,-hh*1.3);g.quadraticCurveTo(rw*.8,-hh*1.25,rw,0);g.closePath();g.fill();g.strokeStyle='rgba(40,24,10,.6)';g.lineWidth=1.4;g.stroke();
    g.strokeStyle='rgba(40,24,10,.55)';g.lineWidth=1.2;g.beginPath();g.moveTo(-rw*.2,-hh*1.25);g.lineTo(-rw*.05,-hh*.7);g.lineTo(-rw*.25,-hh*.35);g.moveTo(rw*.15,-hh*1.2);g.lineTo(rw*.3,-hh*.6);g.stroke();
    if(h.who==='lead'){g.fillStyle='#c8d0dc';g.beginPath();g.ellipse(0,-hh*1.25,rw*.22,hh*.22,0,0,TAU);g.fill();}
    g.restore();if(!calm&&Math.random()<.25)MGK.burst(pts,h.x+(Math.random()-.5)*rw,h.y-hh,{n:1,col:'#9a6a3a',sp:70,a0:-Math.PI*.8,arc:Math.PI*.6,k:'dirt',s:2.5,d:.4});}
  function body(h,lift,o2){const s=h.s,key=h.who==='lead'?'mg_krotL':h.who==='krot'?'mg_krot':h.who==='upyr'?'upyr':h.who==='ezh'?'mg_ezh':'muh';
    const px=s*(h.who==='upyr'?.78:h.who==='lead'?.86:.72);
    g.save();g.beginPath();g.rect(h.x-s,h.y-s*2.2,s*2,s*2.2);g.ellipse(h.x,h.y,s*.42,s*.17,0,0,Math.PI);g.clip();
    const y=h.y+px*.62-lift*px*.95;MGK.put(g,key,h.x+(h.shk>0?Math.sin(h.t*60)*s*.05:0),y,px,D,o2||{});g.restore();}
  function draw(){g.setTransform(D,0,0,D,0,0);g.lineJoin='round';g.lineCap='round';const p=Math.max(0,Math.min(1,st.t/DUR));
    const sh=st.shake?(Math.random()-.5)*st.shake:0;g.save();g.translate(sh,sh*.5);
    sky(p);if(!bg)mkBg();g.drawImage(bg,0,0,W,H);
    // петух на рассвете
    if(st.over&&st.why==='time'){const k=Math.min(1,st.endT/.5);MGK.put(g,'mg_petuh',W*.5,palY+palH*.05-k*palH*.25,palH*1.1,D,{sy:1+(calm?0:Math.sin(st.endT*12)*.04)});}
    for(const h of holes){const s=h.s;
      if(h.st==='mound')mound(h);
      else if(h.st==='up'){const k=Math.min(1,h.t/.16),lift=MGK.ease.back(k);body(h,lift);frontLip(h);
        // полоска «сейчас уйдёт» — мягкая
        const left=1-h.t/h.win;if(left<.45&&!calm){g.globalAlpha=.85;g.strokeStyle=left<.2?'#ff5a3a':'#ffd84a';g.lineWidth=4;g.beginPath();g.arc(h.x,h.y-s*.62,s*.22,-Math.PI/2,-Math.PI/2+left*TAU);g.stroke();g.globalAlpha=1;}
        if(h.who==='lead'){for(let i=0;i<3;i++){MGK.put(g,i<h.hp?'heart':'star0',h.x-s*.2+i*s*.2,h.y-s*1.05,s*.17,D,{});}}}
      else if(h.st==='friend'){const k=Math.min(1,h.t/.2),out=h.t>h.dur-.25?Math.max(0,(h.dur-h.t)/.25):1;body(h,MGK.ease.back(k)*out);frontLip(h);
        if(h.t>.15&&h.t<h.dur-.3)MGK.text(g,Lg('не бей!','don’t hit!'),h.x,h.y-s*.98,Math.max(13,s*.17),{col:'#c8ffb0'});}
      else if(h.st==='hit'){const k=h.t/.42;if(h.ok){body(h,Math.max(0,.9-k*1.6),{sy:1-k*.5,sx:1+k*.2,rot:(h.mnd?0:.6)*k});}else if(h.who==='ezh'||h.who==='muh'){body(h,Math.max(0,.8-k*2));}frontLip(h);}
      else if(h.st==='dive'){const k=h.t/.35;body(h,Math.max(0,1-k*1.6));frontLip(h);}}
    // нечисть «ушла под частокол»: земляной след к брёвнам
    for(const f of fly){const k=f.t/.7,x=f.x,y=f.y-(f.y-(palY+palH))*k;g.globalAlpha=1-k;g.fillStyle='#5a3a1a';for(let i=0;i<5;i++){g.beginPath();g.arc(x+Math.sin(i*2+f.t*20)*6,y+i*8,4-i*.5,0,TAU);g.fill();}g.globalAlpha=1;}
    MGK.parts(g,pts,lastDt);
    for(const q of pops){const k=q.t/.9;g.globalAlpha=1-Math.max(0,k-.5)*2;MGK.text(g,q.s,q.x,q.y-k*40,26+(1-k)*8,{col:q.c});}g.globalAlpha=1;
    for(const q of swings){const k=q.t/.24;MGK.put(g,'mg_shovel',q.x+18,q.y-24,64,D,{rot:-1+k*1.4,a:1-k*.6});}
    g.restore();hud(p);}
  function plank(x,y,w,h){rrect(g,x,y,w,h,h*.35);const q=g.createLinearGradient(0,y,0,y+h);q.addColorStop(0,'#c8925a');q.addColorStop(1,'#8a5a30');g.fillStyle=q;g.fill();g.strokeStyle='#3a2410';g.lineWidth=2.5;g.stroke();
    g.strokeStyle='rgba(255,230,180,.35)';g.lineWidth=1.5;g.beginPath();g.moveTo(x+h*.3,y+3);g.lineTo(x+w-h*.3,y+3);g.stroke();}
  function hud(p){const st0=typeof getComputedStyle==='function'?0:0,top=8+st0,ph=46,fs=Math.min(26,W*.062);
    // время до петухов
    plank(8,top,Math.min(150,W*.36),ph);MGK.put(g,'mg_petuh',8+24,top+ph/2,34,D,{});const left=Math.max(0,Math.ceil(DUR-Math.max(0,st.t)));
    MGK.text(g,'0:'+String(left).padStart(2,'0'),8+Math.min(150,W*.36)/2+16,top+ph/2+1,fs,{col:left<=10?'#ffe27a':'#fff6dc'});
    // счёт
    const sw=Math.min(150,W*.34),sx=W/2-sw/2+(W<420?14:0);plank(sx,top,sw,ph);MGK.text(g,String(st.score),sx+sw/2,top+ph/2-5,fs*1.1);MGK.text(g,Lg('отбито','beaten'),sx+sw/2,top+ph-8,11,{lw:3});
    // брёвна частокола (жизни)
    const lw=Math.min(22,W*.05);for(let i=0;i<LIVES;i++){const x=W/2-LIVES*lw*.6+i*lw*1.2+lw*.6,y=top+ph+14;const on=i<st.lives;g.globalAlpha=on?1:.3;
      rrect(g,x-lw*.32,y-lw*.5,lw*.64,lw*1.1,3);g.fillStyle=on?'#b07a44':'#6a5a4a';g.fill();g.strokeStyle='#3a2410';g.lineWidth=1.5;g.stroke();g.beginPath();g.moveTo(x-lw*.32,y-lw*.5);g.lineTo(x,y-lw*.85);g.lineTo(x+lw*.32,y-lw*.5);g.closePath();g.fillStyle=on?'#c8945a':'#6a5a4a';g.fill();g.stroke();}g.globalAlpha=1;
    // подсказка и реплики
    const by=H-Math.max(28,H*.045);if(st.t<4||sayT>0){const s=sayT>0?sayS:Lg('Бей бугорок, пока не вылез. Ёжика не трогай!','Hit the mound before it pops. Spare the hedgehog!');const fs2=Math.min(18,W*.042);
      g.font=MGK.font(fs2,800);const tw=Math.min(W-24,g.measureText(s).width+36);rrect(g,W/2-tw/2,by-22,tw,44,16);g.fillStyle='rgba(253,240,207,.95)';g.fill();g.strokeStyle='#3b2412';g.lineWidth=2.5;g.stroke();
      MGK.text(g,s,W/2,by,fs2,{ol:false,col:'#3b2412'});}
    if(st.t<0){const k=-st.t;MGK.text(g,k>.6?Lg('Дозор, к частоколу!','Watch, to the palisade!'):Lg('Бей!','Hit!'),W/2,H*.5,Math.min(44,W*.1),{col:'#ffe27a'});}}
  if(/[?&]mg=/.test(location.search))window.__auto=()=>{const h=holes.find(h=>(h.st==='mound'&&h.t>.2)||h.st==='up');if(h){swings.push({x:h.x,y:h.y,t:0});hit(h);}};
  MGK.loop(host,(dt)=>{step(dt);draw();});
  try{host.snd.whistle();}catch(_){}}
/* бот: тот же поток событий, игрок с умением k (0..1) — вероятность успеть по бугорку и по голове, ошибка по ёжику */
function sim(o,k){const P=podPar(o),R=mulberry(o.seed^0x9e37);let t=0,score=0,lives=LIVES,next=.6,lead=false;const busy=[];
  while(t<DUR&&lives>0){t+=.05;next-=.05;const p=t/DUR;for(let i=busy.length-1;i>=0;i--)if(busy[i]<t)busy.splice(i,1);
    if(next<=0){if(busy.length<P.max(p)){const fr=p>.08&&R()<P.friend,ld=!lead&&p>=P.leadAt;
      if(ld){lead=true;if(R()<k*1.1)score+=5;else lives--;busy.push(t+2);}
      else if(fr){if(R()<(1-k)*.25)score=Math.max(0,score-1);busy.push(t+1.5);}
      else{const w=P.win(p);if(R()<k*.55)score+=2;else if(R()<Math.min(.98,k*1.25*(w/.9)))score+=1;else lives--;busy.push(t+P.rise+w);}}
      next=P.gap(p)*(.75+R()*.5);}}
  return {score,tier:podTier(score)};}
MG_REG({id:'podkop',num:1,n:{ru:'Подкоп!',en:'Dig Out!'},icon:'mg_i1',kind:'score',unit:{ru:'отбито нечисти',en:'monsters beaten back'},run,sim});
})();
