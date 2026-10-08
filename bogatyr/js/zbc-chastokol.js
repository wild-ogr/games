'use strict';
/* BGC: забава №12 «Оборона частокола» (Забава недели). Основа — «Подкоп!» Тридевятой обороны (mg-podkop.js), переделано под Богатыря.
   Ночь во дворе Богатыря: из-за частокола лезет нечисть (5 щелей). Видны лапы на кольях — бей: 2 очка («сбил на подъёме»),
   высунулась голова — 1 очко. Не успел — перемахнула во двор и утащила курицу (5 кур). Волчонка и курочку на заборе не бить (−1).
   Раз за ночь — Колдун (3 удара, +5). 45 с до петухов, небо светлеет. Ступени: 1–21 — 1, 22–43 — 2, 44+ — 3 (по боту: средний ≈ 2).
   ПК: мышь или клавиши 1–5 (щели слева направо), Enter/пробел — «Начать». Спокойный режим: окна ×1,3, реже, без тряски. */
(function(){
const DUR=45,LIVES=5,NS=5;
art('zbc_petuh',40,g=>{// петух — встречает рассвет
  for(const [a,c] of[[-.9,'#2a6a3a'],[-.55,'#1a3a5a'],[-.2,'#2a6a3a']]){g.save();g.translate(-6,0);g.rotate(a);shp(g,c,{hl:.5},[-14,-3,0,3],()=>{g.moveTo(0,0);g.quadraticCurveTo(-10,-6,-15,-1);g.quadraticCurveTo(-9,1,0,3);g.closePath();});g.restore();}
  ell(g,0,2,9,8,'#d8602a',{hl:.45});ell(g,-2,4,5,4,'#a8401a',{lw:.6});
  for(const x of[-2,2])ln(g,[x,9,x,15],'#e8b43a',1.4);
  ell(g,7,-6,5,5.4,'#e8762a',{hl:.5});shp(g,'#e8302a',{hl:.5},[3,-15,11,-9],()=>{g.moveTo(3,-10);g.quadraticCurveTo(4,-15,6,-11);g.quadraticCurveTo(7,-16,9,-11);g.quadraticCurveTo(11,-14,11,-9);g.closePath();});
  poly(g,[11.5,-6.5,16,-5,11.5,-3.8],'#f2c23a',{lw:.5});ell(g,10,-2,1.6,2.4,'#e8302a',{lw:.4});eye(g,8.6,-7,1.5,{px:.4});});
art('zbc_kura',36,g=>{// курочка-рябушка
  shp(g,'#e8dcc8',{hl:.4},[-15,-6,-4,6],()=>{g.moveTo(-5,0);g.quadraticCurveTo(-14,-8,-15,2);g.quadraticCurveTo(-10,6,-5,4);g.closePath();});
  ell(g,0,3,10,8.5,'#f2e8d4',{hl:.45});for(const [x,y] of[[-3,1],[2,5],[-5,6],[4,0],[0,8]])ell(g,x,y,1.3,1,'#b89a7a',{ol:false,flat:true});
  shp(g,'#e8dcc8',{},[-6,0,6,8],()=>{g.moveTo(-5,2);g.quadraticCurveTo(0,0,5,4);g.quadraticCurveTo(0,8,-5,5);g.closePath();});
  for(const x of[-2,3])ln(g,[x,11,x,15],'#e8a83a',1.3);
  ell(g,8,-6,5,5,'#f2e8d4',{hl:.5});shp(g,'#e8302a',{hl:.5},[5,-14,11,-9],()=>{g.moveTo(5,-10);g.quadraticCurveTo(6,-14,8,-11);g.quadraticCurveTo(9,-15,11,-10);g.closePath();});
  poly(g,[12,-6.5,16,-5,12,-3.6],'#f2b23a',{lw:.5});ell(g,10.6,-2.4,1.3,2,'#e8302a',{lw:.4});eye(g,9,-7,1.5,{px:.4});});
art('zbc_i12',40,g=>{// значок: кол частокола и упырь
  for(const x of[-12,0,12]){rrect(g,x-5,-4,10,22,2);g.fillStyle=grad(g,x,6,10,'#a8743e',.3,-.35);g.fill();outline(g,'#a8743e',1);poly(g,[x-5,-4,x,-12,x+5,-4],'#c8925a',{lw:1});}
  ell(g,6,-10,7,7,'#b9cbb4',{lw:1});glow(g,3.5,-11,3,'#ff3a4a');glow(g,8.5,-11,3,'#ff3a4a');ell(g,3.5,-11,1.2,1.2,'#b01020',{ol:false,flat:true});ell(g,8.5,-11,1.2,1.2,'#b01020',{ol:false,flat:true});
  for(const x of[-1,13])ell(g,x,-5,2.6,2,'#b9cbb4',{lw:.6});ln(g,[2,-6,10,-6],'#4a1020',.9);});

// кто лезет: ключ рисунка, цвет лап, размер (доля щели)
const WHO={upyr:{k:'upyr',h:'#b9cbb4',s:1},skel:{k:'skel',h:'#e8e0cc',s:1},kik:{k:'kik',h:'#6a9a4a',s:1.02},prizr:{k:'prizr',h:'#dfe9ff',s:1},
  lead:{k:'koldun',h:'#a08aa8',s:1.12},wolf:{k:'pt_wolf',h:'#7d8594',s:.86,fr:1},kura:{k:'zbc_kura',h:'#e8a83a',s:.8,fr:1}};
const FOES=['upyr','skel','kik','prizr'];
function chPar(o){const LV=Math.min(1,(o.lvl||0)/15),cm=o.calm?1.3:1;
  return {LV,cm,gap:t=>(1.1-.4*LV)*(o.calm?1.25:1)*(1-.3*t),max:t=>1+Math.round(LV*.8)+(t>.35?1:0),
    rise:.7*cm,win:t=>Math.max(.75,(1.2-.3*t-.1*LV))*cm,friend:.13,leadAt:.45+.15*((o.seed>>>3)%7)/7};}
function chTier(s){return s>=44?3:s>=22?2:s>0?1:0;}

function run(host,o){const cv=ZABK.canvas(host),g=cv.getContext('2d'),R=o.rnd,P=chPar(o),calm=o.calm,pc=zabPC(),T=ZABK.text;
  let W=0,H=0,D=1,land=false,palT=0,palB=0,sw=0,slotW=0,px=60,front=null,forest=null,heroK='h_dob_0',heroX=0,heroY=0,heroS=0;
  const slots=[];for(let i=0;i<NS;i++)slots.push({i,x:0,st:'idle',t:0,cd:0,who:'',hp:0,shk:0,win:1});
  const st={ph:'intro',t:-1.4,score:0,lives:LIVES,over:false,endT:0,next:.5,leadDone:false,hits:0,streak:0,bestStreak:0,miss:0,shake:0,swing:0,started:0};
  const pts=[],pops=[],swings=[],fly=[];
  try{if(S&&S.hero&&ART['h_'+S.hero+'_0'])heroK='h_'+S.hero+'_0';}catch(e){}
  function layout(){W=cv.W;H=cv.H;D=cv.D;land=W>H*1.08;
    palT=H*(land?.36:.4);palB=H*(land?.62:.58);
    const pw=land?Math.min(W*.66,H*1.35):W*.98;slotW=pw/NS;px=Math.min(slotW*1.02,(palB-palT)*1.05,land?H*.21:999);
    const x0=(land?W*.47:W/2)-pw/2;for(const s of slots)s.x=x0+slotW*(s.i+.5);
    sw=Math.max(16,Math.min(slotW/3,H*.05));heroS=land?H*.3:Math.min(W*.36,H*.19);heroX=land?W*.86:W*.74;heroY=H-(land?H*.2:H*.2);
    front=forest=null;}
  layout();host.onResize(layout);
  // ---------- поток нечисти ----------
  const free=()=>slots.filter(s=>s.st==='idle'&&s.cd<=0);
  const act=()=>slots.filter(s=>s.st!=='idle'&&s.st!=='hit'&&s.st!=='over').length;
  function spawn(p){const f=free();if(!f.length)return;const s=f[Math.floor(R()*f.length)];s.t=0;s.hp=1;s.shk=0;
    if(!st.leadDone&&p>=P.leadAt){st.leadDone=true;s.who='lead';s.hp=3;s.st='climb';say(L('Колдун лезет! Бей трижды!','The sorcerer! Hit him three times!'));return;}
    if(p>.08&&R()<P.friend){s.who=R()<.5?'wolf':'kura';s.st='friend';s.dur=1.6*P.cm;return;}
    s.who=FOES[Math.floor(R()*FOES.length)];s.st='climb';try{if(!calm)host.snd.tick();}catch(_){}}
  let sayT=0,sayS='';function say(s,t){sayS=s;sayT=t||2.2;}
  // ---------- ввод ----------
  function start(){if(st.ph!=='intro')return;st.ph='play';st.t=-1.3;try{host.snd.whistle();}catch(_){}}
  const btnGo={x:0,y:0,w:0,h:0,t:L('Начать','Start')};
  ZABK.tap(cv,host,(x,y,e)=>{e.preventDefault();if(st.ph==='intro'){start();return;}if(st.over||st.t<0)return;
    let best=null,bd=1e9;for(const s of slots){if(s.st==='idle'||s.st==='hit'||s.st==='over')continue;const cy=slotY(s),dx=x-s.x,dy=y-cy;const d=Math.hypot(dx,dy*.9);if(d<Math.max(slotW*.62,40)&&d<bd){bd=d;best=s;}}
    swings.push({x,y,t:0});st.swing=.25;if(!best){try{host.snd.swing();}catch(_){}return;}hit(best);});
  if(pc)cv.style.cursor='pointer';
  zabKeys(host,k=>{if(st.ph==='intro'){if(k==='Enter'||k===' '){start();return true;}return false;}
    const n=+k;if(n>=1&&n<=NS&&!st.over&&st.t>=0){const s=slots[n-1];swings.push({x:s.x+slotW*.15,y:slotY(s),t:0});st.swing=.25;
      if(s.st==='idle'||s.st==='hit'||s.st==='over'){try{host.snd.swing();}catch(_){}}else hit(s);return true;}return false;});
  // где центр того, кто в щели (для попадания и рисунка)
  function slotY(s){const k=WHO[s.who]||WHO.upyr,p=px*k.s;if(s.st==='climb')return palT-p*.05;return palT-p*.38;}
  function hit(s){const wasC=s.st==='climb',k=WHO[s.who];
    if(s.st==='friend'){st.score=Math.max(0,st.score-1);pop(s.x,palT-px*.7,'−1','#ff8a7a');say(s.who==='wolf'?L('Ай! Волчонок-то свой!','Ouch! The wolf cub is ours!'):L('Курочку не бей!','Don’t hit the hen!'));
      s.st='hit';s.t=0;s.ok=0;st.streak=0;try{host.snd.hurt();}catch(_){}return;}
    if(s.who==='lead'&&s.hp>1){s.hp--;s.shk=.3;ZABK.burst(pts,s.x,slotY(s),{n:calm?3:9,col:'#ffe27a',sp:220,k:'star',s:5});st.shake=calm?0:6;try{host.snd.crit();}catch(_){}
      pop(s.x,palT-px*.85,L('ещё!','again!'),'#ffe27a');if(s.st==='climb'){s.st='up';s.t=0;s.win=P.win(st.t/DUR)*1.9;}return;}
    const v=s.who==='lead'?5:wasC?2:1;st.score+=v;st.hits++;st.streak++;st.bestStreak=Math.max(st.bestStreak,st.streak);
    pop(s.x,slotY(s)-px*.45,'+'+v,wasC?'#ffe27a':'#fff6dc');if(wasC&&R()<.5)pop(s.x+slotW*.3,slotY(s)-px*.1,L('Бац!','Bonk!'),'#9adcff');
    s.st='hit';s.t=0;s.ok=1;s.cl=wasC;ZABK.burst(pts,s.x,slotY(s),{n:calm?4:12,col:'#ffe27a',sp:240,k:'star',s:5});if(!calm)ZABK.burst(pts,s.x,palT,{n:6,col:'#c8925a',sp:160,a0:-Math.PI,arc:Math.PI,s:3});
    st.shake=calm?0:(s.who==='lead'?10:3);try{host.snd.hit();host.snd.kill();if(s.who==='lead')host.snd.level();}catch(_){}
    if(st.streak===10)say(L('Десять подряд! Богатырская рука!','Ten in a row! A hero’s hand!'));}
  function pop(x,y,s,c){pops.push({x,y,s,c,t:0});}
  function miss(s){st.lives--;st.miss++;st.streak=0;fly.push({x:s.x,t:0,who:s.who});try{host.snd.hurt();}catch(_){}st.shake=calm?0:6;
    if(st.lives<=0){st.over=true;st.endT=0;st.why='lives';say(L('Курятник опустел! Что отбил — то твоё.','The coop is empty! You keep what you beat back.'),3);}
    else say(st.lives===1?L('Последняя курочка! Держись!','The last hen! Hold on!'):L('Ой! Курицу утащили!','Oh no! They grabbed a hen!'));}
  // ---------- шаг ----------
  let lastDt=0;function step(dt){lastDt=dt;if(dt<=0)return;if(st.ph==='intro'){st.t0=(st.t0||0)+dt;return;}
    st.t+=dt;if(sayT>0)sayT-=dt;if(st.shake>0)st.shake=Math.max(0,st.shake-dt*30);if(st.swing>0)st.swing-=dt;
    if(st.over){st.endT+=dt;if(st.endT>2.4&&!st.sent){st.sent=1;host.done({score:st.score,tier:chTier(st.score),extra:{msg:L('Отбито нечисти: ','Monsters beaten back: ')+st.score+(st.bestStreak>=5?L(' · лучшая серия ',' · best streak ')+st.bestStreak:'')}});}}
    const p=Math.max(0,Math.min(1,st.t/DUR));
    if(st.t>=0&&!st.over){if(st.t>=DUR){st.over=true;st.endT=0;st.why='time';say(L('Ку-ка-ре-ку! Рассвет — двор отстоял!','Cock-a-doodle-doo! Dawn — the yard is safe!'),3);try{host.snd.win();}catch(_){}
        for(const s of slots)if(s.st!=='idle'&&s.st!=='hit'){s.st='hit';s.t=0;s.ok=0;}}
      else{st.next-=dt;if(st.next<=0){if(act()<P.max(p))spawn(p);st.next=P.gap(p)*(.75+R()*.5);}}}
    for(const s of slots){s.t+=dt;if(s.cd>0)s.cd-=dt;if(s.shk>0)s.shk-=dt;
      if(s.st==='climb'&&s.t>=P.rise){s.st='up';s.t=0;s.win=P.win(p)*(s.who==='lead'?1.9:1);}
      else if(s.st==='up'&&s.t>=s.win){s.st='over';s.t=0;miss(s);}
      else if(s.st==='over'&&s.t>=.4){s.st='idle';s.cd=.4;}
      else if(s.st==='friend'&&s.t>=s.dur){s.st='idle';s.cd=.35;}
      else if(s.st==='hit'&&s.t>=.5){s.st='idle';s.cd=.35;}}
    for(const q of pops)q.t+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t>.9)pops.splice(i,1);
    for(const q of swings)q.t+=dt;for(let i=swings.length-1;i>=0;i--)if(swings[i].t>.26)swings.splice(i,1);
    for(const q of fly)q.t+=dt;for(let i=fly.length-1;i>=0;i--)if(fly[i].t>.9)fly.splice(i,1);}
  // ---------- рисование ----------
  const mixC=(a,b,n)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);return 'rgb('+[16,8,0].map(s=>Math.round(((A>>s)&255)*(1-n)+((B>>s)&255)*n)).join(',')+')';};
  function sky(n){const q=g.createLinearGradient(0,0,0,palB);q.addColorStop(0,mixC('#070b26','#5a78c8',n));q.addColorStop(.55,mixC('#16205a','#e8a0a0',n));q.addColorStop(1,mixC('#2c2e66','#ffd49a',n));g.fillStyle=q;g.fillRect(0,0,W,palB);
    if(n<.95){const r=mulberry(9);for(let i=0;i<70;i++){const x=r()*W,y=r()*palT*.95,s=r()*1.5+.4;g.globalAlpha=(1-n)*(.45+.55*Math.abs(Math.sin(st.t*1.6+i*1.7)));g.fillStyle=i%9?'#fff':'#ffe9a8';g.beginPath();g.arc(x,y,s,0,TAU);g.fill();}g.globalAlpha=1;}
    // луна садится
    const mr=Math.max(16,Math.min(W,H)*.06),mx=W*(land?.9:.8),my=palT*(.3+n*.75);g.globalAlpha=1-n*.75;
    g.drawImage(glowSpr('#cfe0ff'),mx-mr*4,my-mr*4,mr*8,mr*8);g.fillStyle='#fff6d8';g.beginPath();g.arc(mx,my,mr,0,TAU);g.fill();g.fillStyle='rgba(200,190,160,.45)';
    for(const [dx,dy,r] of[[-.3,-.2,.22],[.25,.25,.16],[.1,-.45,.1]]){g.beginPath();g.arc(mx+dx*mr,my+dy*mr,r*mr,0,TAU);g.fill();}g.globalAlpha=1;
    // облака
    for(let i=0;i<3;i++){const cx=((st.t*6+i*W*.45)%(W+300))-150,cy=palT*(.25+i*.2),cw=Math.min(W,H)*(.22+i*.05);g.globalAlpha=.35+.25*n;g.fillStyle=mixC('#3a4680','#ffe0d0',n);
      for(const [dx,dy,r] of[[0,0,.3],[.25,.05,.24],[-.25,.06,.22],[.1,-.12,.2]]){g.beginPath();g.ellipse(cx+dx*cw,cy+dy*cw,r*cw,r*cw*.55,0,0,TAU);g.fill();}}g.globalAlpha=1;
    // солнце встаёт
    if(n>.4){const sy=palT-(n-.4)*palT*.5,sx=W*(land?.2:.26);g.globalAlpha=Math.min(1,(n-.4)*2.2);g.drawImage(glowSpr('#ffd27a'),sx-palT*.5,sy-palT*.5,palT,palT);g.fillStyle='#fff0b8';g.beginPath();g.arc(sx,sy,Math.min(W,H)*.06,0,TAU);g.fill();g.globalAlpha=1;}}
  function mkForest(){const c=mkCanvas(W*D,palB*D),b=c.getContext('2d');b.setTransform(D,0,0,D,0,0);const r=mulberry(31);
    // дальние холмы
    b.fillStyle='#1a2350';b.beginPath();b.moveTo(0,palT);for(let x=0;x<=W;x+=W/12)b.lineTo(x,palT-H*.05-Math.abs(Math.sin(x*.011))*H*.05);b.lineTo(W,palB);b.lineTo(0,palB);b.fill();
    // ели
    for(const [col,hk,dy] of[['#141c40',.13,-.01],['#0e1430',.1,.01]]){for(let x=-20;x<W+30;x+=14+r()*22){const h=H*hk*(.6+r()*.6),y=palT+H*dy+8,w=h*.36;
      b.fillStyle=col;b.beginPath();b.moveTo(x,y-h);for(let i=0;i<4;i++){const k=(i+1)/4;b.lineTo(x+w*k,y-h+h*k*.95);b.lineTo(x+w*k*.45,y-h+h*k*.95);}b.lineTo(x+w*.45,y+10);b.lineTo(x-w*.45,y+10);
      for(let i=3;i>=0;i--){const k=(i+1)/4;b.lineTo(x-w*k*.45,y-h+h*k*.95);b.lineTo(x-w*k,y-h+h*k*.95);}b.closePath();b.fill();}}
    forest=c;}
  function mkFront(){const c=mkCanvas(W*D,H*D),b=c.getContext('2d');b.setTransform(D,0,0,D,0,0);b.lineJoin='round';b.lineCap='round';const r=mulberry(57);
    // двор: утоптанная земля и трава
    let q=b.createLinearGradient(0,palB-10,0,H);q.addColorStop(0,'#1f2e26');q.addColorStop(.4,'#26382a');q.addColorStop(1,'#1a281e');b.fillStyle=q;b.fillRect(0,palB-10,W,H-palB+10);
    b.fillStyle='rgba(90,70,50,.55)';b.beginPath();b.moveTo(W*.42,palB);b.quadraticCurveTo(W*.3,H*.8,W*.5,H);b.lineTo(W*.86,H);b.quadraticCurveTo(W*.62,H*.8,W*.58,palB);b.closePath();b.fill();
    for(let i=0;i<W*(H-palB)/900;i++){const x=r()*W,y=palB+8+r()*(H-palB);b.strokeStyle=r()<.5?'rgba(90,140,80,.55)':'rgba(30,60,36,.6)';b.lineWidth=1.3;for(const d of[-3,0,3]){b.beginPath();b.moveTo(x,y);b.lineTo(x+d,y-4-r()*6);b.stroke();}}
    for(let i=0;i<W*(H-palB)/7000;i++){const x=r()*W,y=palB+14+r()*(H-palB-14),s=1.6+r()*2.6;b.fillStyle='rgba(120,120,130,.7)';b.beginPath();b.ellipse(x,y,s*1.3,s,0,0,TAU);b.fill();}
    // частокол: колья с острыми верхами, лунный свет справа
    const th=sw*.9;for(let x=-sw*.6,i=0;x<W+sw;x+=sw*.97,i++){const hv=(palB-palT)*(.04*Math.sin(i*2.3)),top=palT+th+hv;
      q=b.createLinearGradient(x,0,x+sw,0);q.addColorStop(0,'#4a3424');q.addColorStop(.35,'#7a5a40');q.addColorStop(.7,'#9a7a5a');q.addColorStop(1,'#3a281a');b.fillStyle=q;
      b.beginPath();b.moveTo(x+1,palB+6);b.lineTo(x+1,top);b.lineTo(x+sw*.5,top-th);b.lineTo(x+sw-1,top);b.lineTo(x+sw-1,palB+6);b.closePath();b.fill();b.strokeStyle='rgba(20,12,6,.85)';b.lineWidth=1.4;b.stroke();
      b.strokeStyle='rgba(30,18,10,.35)';b.lineWidth=1;b.beginPath();b.moveTo(x+sw*.3,top+(palB-top)*.15);b.lineTo(x+sw*.34,top+(palB-top)*.6);b.moveTo(x+sw*.66,top+(palB-top)*.4);b.lineTo(x+sw*.62,palB);b.stroke();
      b.fillStyle='rgba(200,220,255,.12)';b.beginPath();b.moveTo(x+sw*.5,top-th);b.lineTo(x+sw-1,top);b.lineTo(x+sw-1,palB);b.lineTo(x+sw*.7,palB);b.lineTo(x+sw*.7,top);b.closePath();b.fill();}
    // поперечины с верёвкой
    for(const f of[.38,.78]){const y=palT+(palB-palT)*f,hh=Math.max(5,sw*.32);q=b.createLinearGradient(0,y-hh/2,0,y+hh/2);q.addColorStop(0,'#8a6a4a');q.addColorStop(1,'#3a2818');b.fillStyle=q;b.fillRect(0,y-hh/2,W,hh);
      b.strokeStyle='rgba(20,12,6,.8)';b.lineWidth=1.2;b.strokeRect(-2,y-hh/2,W+4,hh);
      for(let x=sw*.5;x<W;x+=sw*.97){b.strokeStyle='#c8b080';b.lineWidth=1.6;b.beginPath();b.moveTo(x-3,y-hh/2-1);b.lineTo(x+3,y+hh/2+1);b.moveTo(x+3,y-hh/2-1);b.lineTo(x-3,y+hh/2+1);b.stroke();}}
    b.fillStyle='rgba(0,0,0,.35)';b.fillRect(0,palB+6,W,Math.max(6,H*.012));
    // тёплый свет из окна терема на земле
    const tx=land?W*.1:W*.14;q=b.createRadialGradient(tx+W*.08,H*.86,10,tx+W*.08,H*.86,Math.max(W,H)*.35);q.addColorStop(0,'rgba(255,190,90,.32)');q.addColorStop(1,'rgba(255,190,90,0)');b.fillStyle=q;b.fillRect(0,palB,W,H-palB);
    // угол терема слева: брёвна, резное окно
    const tw=land?W*.17:W*.26,ty0=land?H*.5:H*.62;
    for(let y=ty0,i=0;y<H+10;y+=Math.max(14,tw*.13),i++){const lh=Math.max(14,tw*.13);q=b.createLinearGradient(0,y,0,y+lh);q.addColorStop(0,'#7a5232');q.addColorStop(.5,'#5a3a22');q.addColorStop(1,'#2e1c10');b.fillStyle=q;
      rrect(b,-10,y,tw+10+(i%2?6:0),lh-1,lh*.45);b.fill();b.strokeStyle='rgba(15,8,4,.8)';b.lineWidth=1.2;b.stroke();
      b.fillStyle='#8a6240';b.beginPath();b.ellipse(tw+(i%2?6:0),y+lh/2,lh*.32,lh*.46,0,0,TAU);b.fill();b.strokeStyle='rgba(15,8,4,.8)';b.stroke();
      b.strokeStyle='rgba(60,36,20,.7)';b.beginPath();b.ellipse(tw+(i%2?6:0),y+lh/2,lh*.16,lh*.24,0,0,TAU);b.stroke();}
    // скат крыши (тёс) уходит влево-вверх
    q=b.createLinearGradient(0,ty0-tw*.6,0,ty0+tw*.1);q.addColorStop(0,'#2a1a10');q.addColorStop(1,'#4a2e18');b.fillStyle=q;b.beginPath();b.moveTo(-10,ty0-tw*.75);b.lineTo(tw*1.22,ty0+tw*.12);b.lineTo(-10,ty0+tw*.12);b.closePath();b.fill();
    b.strokeStyle='rgba(10,6,2,.6)';b.lineWidth=1;for(let i=1;i<6;i++){const x=i/6*tw*1.2;b.beginPath();b.moveTo(x,ty0+tw*.12);b.lineTo(x-tw*.25,ty0+tw*.12-(tw*.87)*(1-x/(tw*1.22))*.8);b.stroke();}
    b.fillStyle='rgba(200,220,255,.10)';b.beginPath();b.moveTo(-10,ty0-tw*.75);b.lineTo(tw*1.22,ty0+tw*.12);b.lineTo(tw*1.0,ty0+tw*.1);b.lineTo(-10,ty0-tw*.62);b.closePath();b.fill();
    // причелина — резная доска по краю ската
    {const x0=-10,y0=ty0-tw*.75,x1=tw*1.22,y1=ty0+tw*.12,bw=Math.max(6,tw*.07),dx=x1-x0,dy=y1-y0,ln2=Math.hypot(dx,dy),nx=-dy/ln2,ny=dx/ln2;
      b.fillStyle='#d8b878';b.beginPath();b.moveTo(x0,y0);b.lineTo(x1,y1);b.lineTo(x1+nx*bw,y1+ny*bw);b.lineTo(x0+nx*bw,y0+ny*bw);b.closePath();b.fill();b.strokeStyle='#4a2a10';b.lineWidth=1.5;b.stroke();
      b.fillStyle='#d8b878';for(let k=.06;k<1;k+=.1){const x=x0+dx*k+nx*bw,y=y0+dy*k+ny*bw;b.beginPath();b.arc(x,y,bw*.55,0,TAU);b.fill();b.stroke();b.fillStyle='#b8322a';b.beginPath();b.arc(x,y,bw*.2,0,TAU);b.fill();b.fillStyle='#d8b878';}}
    // окно с наличником
    const wx=tw*.5,wy=ty0+tw*.42,ww=tw*.46,wh=tw*.5;
    b.drawImage(glowSpr('#ffb44a'),wx-ww*1.6,wy-wh*1.2,ww*3.2,wh*3);
    q=b.createLinearGradient(0,wy-wh/2,0,wy+wh/2);q.addColorStop(0,'#ffe9a0');q.addColorStop(1,'#ffa83a');b.fillStyle=q;b.fillRect(wx-ww/2,wy-wh/2,ww,wh);
    b.strokeStyle='#3a2210';b.lineWidth=Math.max(2,ww*.06);b.beginPath();b.moveTo(wx,wy-wh/2);b.lineTo(wx,wy+wh/2);b.moveTo(wx-ww/2,wy);b.lineTo(wx+ww/2,wy);b.stroke();
    b.fillStyle='#e8d8b0';b.strokeStyle='#5a3a1a';b.lineWidth=1.5;
    b.beginPath();b.moveTo(wx-ww*.68,wy-wh*.55);b.quadraticCurveTo(wx,wy-wh*1.15,wx+ww*.68,wy-wh*.55);b.lineTo(wx+ww*.6,wy-wh*.5);b.lineTo(wx-ww*.6,wy-wh*.5);b.closePath();b.fill();b.stroke();
    rrect(b,wx-ww*.7,wy+wh*.5,ww*1.4,wh*.14,3);b.fill();b.stroke();for(const s of[-1,1]){rrect(b,wx+s*ww*.56-ww*.07,wy-wh*.5,ww*.14,wh,3);b.fill();b.stroke();}
    b.fillStyle='#c83a2a';b.beginPath();b.arc(wx,wy-wh*.78,ww*.07,0,TAU);b.fill();
    // справа: фонарь на столбе и поленница
    const lx=land?W*.72:W*.93,ly=palB+(H-palB)*.12;b.fillStyle='#4a2e1a';b.fillRect(lx-3,ly-H*.02,6,H*.11);b.drawImage(glowSpr('#ffc45a'),lx-60,ly-H*.02-60,120,120);
    rrect(b,lx-8,ly-H*.045,16,20,4);b.fillStyle='#ffd27a';b.fill();b.strokeStyle='#2a1a0c';b.lineWidth=2;b.stroke();
    for(let i=0;i<3;i++)for(let j=0;j<4-i;j++){const x=(land?W*.6:W*.64)+j*14+i*7,y=palB+(H-palB)*.16-i*11;b.fillStyle='#8a6240';b.beginPath();b.arc(x,y,7,0,TAU);b.fill();b.strokeStyle='#2a1a0c';b.lineWidth=1.2;b.stroke();b.fillStyle='#c8a070';b.beginPath();b.arc(x,y,3.5,0,TAU);b.fill();}
    front=c;}
  // лапы на кольях
  function paws(s,col,k){const sx=slotW*.32,y=palT+px*.08-k*px*.12;for(const d of[-1,1]){const x=s.x+d*sx+(s.shk>0?Math.sin(s.t*60)*3:0);
    g.fillStyle=col;g.strokeStyle='rgba(25,15,25,.9)';g.lineWidth=1.6;g.beginPath();g.ellipse(x,y,px*.1,px*.075,d*.3,0,TAU);g.fill();g.stroke();
    g.fillStyle='#f4ecd8';for(let j=-1;j<=1;j++){g.beginPath();g.moveTo(x+j*px*.05-2,y+px*.05);g.lineTo(x+j*px*.05,y+px*.12);g.lineTo(x+j*px*.05+2,y+px*.05);g.closePath();g.fill();}}}
  function body(s,lift,o2){const k=WHO[s.who]||WHO.upyr,p=px*k.s,y=palT+p*.55-lift*p*.85,jx=s.shk>0?Math.sin(s.t*60)*p*.05:0;
    g.drawImage(glowSpr(k.fr?'#ffe0a0':'#9ab0ff'),s.x-p*.7,y-p*.75,p*1.4,p*1.3);ZABK.put(g,k.k,s.x+jx,y,p,D,o2||{});}
  function drawSlots(){for(const s of slots){const k=WHO[s.who]||WHO.upyr;
    if(s.st==='climb'){const e=ZABK.ease.out(Math.min(1,s.t/P.rise));body(s,.2+e*.3);s._paw=e;}
    else if(s.st==='up'){const e=ZABK.ease.back(Math.min(1,s.t/.18));body(s,.5+e*.65);}
    else if(s.st==='friend'){const e=ZABK.ease.back(Math.min(1,s.t/.22)),out=s.t>s.dur-.25?Math.max(0,(s.dur-s.t)/.25):1;body(s,(.3+e*.6)*out);}
    else if(s.st==='hit'){const q=s.t/.5;if(s.ok)body(s,Math.max(0,(s.cl?.3:1)-q*2),{rot:q*2.5*(s.i%2?1:-1),sx:1-q*.3,sy:1-q*.3});else if(k.fr)body(s,Math.max(0,.8-q*2));else body(s,Math.max(0,1-q*2.2));}}}
  function drawOver(){for(const s of slots){const k=WHO[s.who]||WHO.upyr;
    if(s.st==='climb')paws(s,k.h,s._paw||0);
    else if(s.st==='up'){paws(s,k.h,1);const left=1-s.t/s.win;if(left<.5&&!calm){g.globalAlpha=.9;g.strokeStyle=left<.22?'#ff5a3a':'#ffd84a';g.lineWidth=4;g.beginPath();g.arc(s.x,palT-px*1.05,px*.14,-Math.PI/2,-Math.PI/2+left*TAU);g.stroke();g.globalAlpha=1;}
      if(s.who==='lead')for(let i=0;i<3;i++){g.globalAlpha=i<s.hp?1:.3;g.fillStyle='#ff5a6a';g.beginPath();g.arc(s.x-px*.22+i*px*.22,palT-px*1.2,px*.07,0,TAU);g.fill();g.strokeStyle='#3a1010';g.lineWidth=1.5;g.stroke();g.globalAlpha=1;}}
    else if(s.st==='friend'&&s.t>.15&&s.t<s.dur-.3)T(g,L('не бей!','don’t hit!'),s.x,palT-px*1.05,Math.max(14,px*.2),{col:'#c8ffb0'});
    else if(s.st==='over'){}}}
  function hud(p){const top=8,ph=46,fs=Math.min(26,W*.062),bw=Math.min(150,W*.29);
    const plank=(x,y,w,h)=>{rrect(g,x,y,w,h,h*.35);const q=g.createLinearGradient(0,y,0,y+h);q.addColorStop(0,'#c8925a');q.addColorStop(1,'#8a5a30');g.fillStyle=q;g.fill();g.strokeStyle='#3a2410';g.lineWidth=2.5;g.stroke();
      g.strokeStyle='rgba(255,230,180,.35)';g.lineWidth=1.5;g.beginPath();g.moveTo(x+h*.3,y+3);g.lineTo(x+w-h*.3,y+3);g.stroke();};
    plank(8,top,bw,ph);g.fillStyle='#fff6d8';g.beginPath();g.arc(8+24,top+ph/2,11,0,TAU);g.fill();g.fillStyle='#c8925a';g.beginPath();g.arc(8+28,top+ph/2-3,9,0,TAU);g.fill();
    const left=Math.max(0,Math.ceil(DUR-Math.max(0,st.t)));T(g,'0:'+String(left).padStart(2,'0'),8+bw/2+14,top+ph/2+1,fs,{col:left<=10?'#ffe27a':'#fff6dc'});
    const sx=Math.max(W/2-bw/2,8+bw+8);plank(sx,top,bw,ph);T(g,String(st.score),sx+bw/2,top+ph/2-5,fs*1.1);T(g,L('отбито','beaten'),sx+bw/2,top+ph-8,11,{lw:3});
    // куры (жизни)
    const ks=Math.min(30,W*.075);for(let i=0;i<LIVES;i++){const x=W/2+(i-(LIVES-1)/2)*ks*1.05,y=top+ph+ks*.62;ZABK.put(g,'zbc_kura',x,y,ks,D,{a:i<st.lives?1:.25});}
    // подсказка и реплики
    const by=H-Math.max(30,H*.045);if((st.t<3.5&&st.t>-0.2)||sayT>0){const s=sayT>0?sayS:pc?L('Щёлкай по нечисти или жми 1–5. Лапы на кольях — бей!','Click the monsters or press 1–5. Paws on the stakes — strike!'):L('Тапай по нечисти! Лапы на кольях — бей сразу!','Tap the monsters! Paws on the stakes — strike now!');
      const fs2=Math.min(18,W*.042),ls=ZABK.wrap(g,s,fs2,W-56,800),bh=ls.length*fs2*1.25+20,tw=Math.min(W-20,Math.max(...ls.map(l=>g.measureText(l).width))+36);
      rrect(g,W/2-tw/2,by-bh/2,tw,bh,16);g.fillStyle='rgba(253,240,207,.95)';g.fill();g.strokeStyle='#3b2412';g.lineWidth=2.5;g.stroke();
      ls.forEach((l,i)=>T(g,l,W/2,by-bh/2+10+fs2*.62+i*fs2*1.25,fs2,{ol:false,col:'#3b2412',w:800}));}
    if(st.t<0&&st.ph==='play')T(g,st.t<-.55?L('Ночь! Нечисть у частокола!','Night! Monsters at the palisade!'):L('Бей!','Strike!'),W/2,H*.5,Math.min(40,W*.085),{col:'#ffe27a',mw:W-30});}
  function intro(){g.fillStyle='rgba(10,8,20,.55)';g.fillRect(0,0,W,H);const pw=Math.min(W-28,460),lines=pc?[
      [L('Нечисть лезет через частокол во двор.','Monsters are climbing the palisade.'),''],[L('Щёлкай мышкой по ней или жми клавиши','Click them or press the keys'),'1–5'],
      [L('Видны лапы на кольях — бей: 2 очка','Paws on the stakes — hit: 2 points'),''],[L('Волчонка и курочку не трогай!','Leave the wolf cub and the hen alone!'),'']]:[
      [L('Нечисть лезет через частокол во двор.','Monsters are climbing the palisade.'),''],[L('Тапай по ней — пусть летит обратно!','Tap them — send them flying back!'),''],
      [L('Видны лапы на кольях — бей: 2 очка','Paws on the stakes — hit: 2 points'),''],[L('Волчонка и курочку не трогай!','Leave the wolf cub and the hen alone!'),'']];
    const fs=Math.min(19,pw*.045),wl=lines.map(l=>ZABK.wrap(g,l[0],fs,pw-(l[1]?140:50),700)),lh=fs*1.3,ph=86+wl.reduce((a,b)=>a+b.length,0)*lh+lines.length*8+110,px0=W/2-pw/2,py0=Math.max(70,H/2-ph/2);
    rrect(g,px0,py0,pw,ph,20);const q=g.createLinearGradient(0,py0,0,py0+ph);q.addColorStop(0,'#fdf0cf');q.addColorStop(1,'#ecd39c');g.fillStyle=q;g.fill();g.strokeStyle='#6e431f';g.lineWidth=4;g.stroke();
    rrect(g,px0+pw*.12,py0-18,pw*.76,44,12);g.fillStyle='#b8322a';g.fill();g.strokeStyle='#5a1410';g.lineWidth=3;g.stroke();T(g,L('Оборона частокола','Defend the Palisade'),W/2,py0+4,Math.min(24,pw*.058),{mw:pw*.7});
    let y=py0+48;ZABK.put(g,'upyr',px0+pw*.2,y+8,48,D,{});ZABK.put(g,'zbc_i12',W/2,y+6,52,D,{});ZABK.put(g,'zbc_kura',px0+pw*.8,y+10,42,D,{});y+=46;
    wl.forEach((ls,i)=>{g.fillStyle='#b8322a';g.beginPath();g.arc(px0+26,y+lh*.5,4,0,TAU);g.fill();ls.forEach(l=>{T(g,l,px0+38,y+lh*.5,fs,{ol:false,col:'#3b2412',w:700,al:'left'});y+=lh;});
      if(lines[i][1]){zabKeycap(g,px0+pw-60,y-lh*.5,'1',fs*1.3);zabKeycap(g,px0+pw-30,y-lh*.5,'5',fs*1.3);}y+=8;});
    btnGo.w=Math.min(240,pw*.62);btnGo.h=58;btnGo.x=W/2-btnGo.w/2;btnGo.y=py0+ph-btnGo.h-(pc?42:22);ZABK.btn(g,btnGo,24);
    if(pc){zabKeycap(g,W/2-62,py0+ph-22,'Enter',22);T(g,L('или','or'),W/2-12,py0+ph-22,14,{ol:false,col:'#6a4a2a',w:700});zabKeycap(g,W/2+44,py0+ph-22,L('пробел','space'),22);}}
  function draw(){g.setTransform(D,0,0,D,0,0);g.lineJoin='round';g.lineCap='round';const p=Math.max(0,Math.min(1,st.t/DUR)),n=st.ph==='intro'?0:Math.min(1,p*1.1);
    const sh=st.shake?(Math.random()-.5)*st.shake:0;g.save();g.translate(sh,sh*.5);
    sky(n);if(!forest)mkForest();g.drawImage(forest,0,0,W,palB);
    // глаза в лесу
    if(n<.8){const r=mulberry(77);for(let i=0;i<6;i++){const x=r()*W,y=palT-r()*H*.05,bl=Math.sin(st.t*.9+i*2.1+(st.t0||0));if(bl<.2)continue;g.globalAlpha=(1-n)*Math.min(1,(bl-.2)*3);g.fillStyle=i%2?'#ffd84a':'#ff5a4a';for(const d of[-3,3]){g.beginPath();g.ellipse(x+d,y,1.8,1.3,0,0,TAU);g.fill();}}g.globalAlpha=1;}
    drawSlots();
    if(!front)mkFront();g.drawImage(front,0,0,W,H);
    if(n>.3){g.globalAlpha=(n-.3)*.35;g.fillStyle='#ffd8a0';g.fillRect(0,palT,W,H-palT);g.globalAlpha=1;}
    drawOver();
    // перемахнула во двор с курицей
    for(const f of fly){const k=f.t/.9,x=f.x+(f.x<W/2?-1:1)*k*W*.25,y=palT-px*.3-Math.sin(k*Math.PI)*px*.6+k*(H-palT)*.35;g.globalAlpha=1-k*.8;ZABK.put(g,(WHO[f.who]||WHO.upyr).k,x,y,px*.8,D,{rot:k*3});ZABK.put(g,'zbc_kura',x+px*.25,y+px*.1,px*.45,D,{rot:-k*2});g.globalAlpha=1;}
    // богатырь во дворе
    const hb=calm?0:Math.sin(st.t*3)*heroS*.012,sw2=st.swing>0?st.swing/.25:0;ZABK.put(g,heroK,heroX,heroY+hb-sw2*heroS*.06,heroS,D,{sx:1+sw2*.06,sy:1-sw2*.04});
    if(st.over&&st.why==='time'){const k=Math.min(1,st.endT/.5);ZABK.put(g,'zbc_petuh',slots[2].x,palT-k*px*.55,px*1.1,D,{sy:1+(calm?0:Math.sin(st.endT*12)*.05)});}
    if(pc&&st.ph==='play'&&!st.over)for(const s of slots)zabKeycap(g,s.x,palB-Math.max(16,(palB-palT)*.12),String(s.i+1),Math.max(22,Math.min(30,slotW*.32)));
    ZABK.parts(g,pts,lastDt);
    for(const q of pops){const k=q.t/.9;g.globalAlpha=1-Math.max(0,k-.5)*2;T(g,q.s,q.x,q.y-k*40,26+(1-k)*8,{col:q.c});}g.globalAlpha=1;
    for(const q of swings){const k=q.t/.26;ZABK.put(g,'i_mace',q.x+20,q.y-22,70,D,{rot:-1.1+k*1.6,a:1-k*.5});}
    g.restore();if(st.ph==='intro')intro();else hud(p);}
  window.__zbc={st:()=>st,start,auto:()=>{const s=slots.find(s=>(s.st==='climb'&&s.t>.2)||s.st==='up');if(s){swings.push({x:s.x,y:slotY(s),t:0});hit(s);}}};
  host.onQuit(()=>{delete window.__zbc;});
  ZABK.loop(host,dt=>{step(dt);draw();});}
/* бот: тот же поток событий, игрок с умением k (0..1) — вероятность успеть по лапам и по голове, ошибка по своим */
function sim(o,k){const P=chPar(o),R=mulberry(o.seed^0x9e37);let t=0,score=0,lives=LIVES,next=.5,lead=false;const busy=[];
  while(t<DUR&&lives>0){t+=.05;next-=.05;const p=t/DUR;for(let i=busy.length-1;i>=0;i--)if(busy[i]<t)busy.splice(i,1);
    if(next<=0){if(busy.length<P.max(p)){const fr=p>.08&&R()<P.friend,ld=!lead&&p>=P.leadAt;
      if(ld){lead=true;if(R()<k*1.1)score+=5;else lives--;busy.push(t+2);}
      else if(fr){if(R()<(1-k)*.25)score=Math.max(0,score-1);busy.push(t+1.6);}
      else{const w=P.win(p);if(R()<k*.55)score+=2;else if(R()<Math.min(.98,k*1.25*(w/.9)))score+=1;else lives--;busy.push(t+P.rise+w);}}
      next=P.gap(p)*(.75+R()*.5);}}
  return {score,tier:chTier(score)};}
ZAB_REG({id:'chastokol',num:12,n:zabN('Оборона частокола','Defend the Palisade'),icon:'zbc_i12',kind:'week',run,sim});
})();
