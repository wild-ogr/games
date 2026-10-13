'use strict';
/* ob2-TIHO №26 «Подменыш» (логи — hobby-analytics/release-i/oborona-boost2/logs/TIHO-podm.md). Грузится по требованию из js/tiho.js.
   Две картинки заставы (телефон — одна над другой, широкий экран — рядом). Кикимора подменила 5 вещей во второй: пропала, другая вещь,
   другой цвет, зеркально, сдвинута. Без таймера. Касание отличия на любой картинке — кружок на обеих; промах — −10 очков и смешная реплика.
   Подсказка Кота Баюна: одна бесплатная, вторая — за рекламу (host.ad). Сцена — по зерну дня (у всех одинаковая), в тренировке — случайная.
   Счёт: 100 × найдено − 10 × промахов (≥0) + 50 без подсказок. Ступень: 3 — без подсказок, 2 — одна, 1 — две. ПК: мышь, H — подсказка. */
(function(){
if(typeof TIHO==='undefined')return;
const T=TIHO,L=T.L,BW=400,BH=300;
// предметы: k — рисунок, s — размер (в единицах картинки 400×300), f — заметно ли зеркало, z — g земля / s небо
const POOL=[
  {k:'chest',s:44,f:0},{k:'pie',s:34,f:0},{k:'yarn',s:32,f:1},{k:'flask',s:34,f:1},{k:'axe',s:42,f:1},{k:'mace',s:42,f:1},
  {k:'d_bush',s:50,f:1},{k:'d_stump',s:44,f:1},{k:'d_shroom',s:34,f:1},{k:'kot',s:46,f:1},{k:'frog',s:32,f:1},{k:'mg_bell',s:34,f:0},
  {k:'mg_lantern',s:34,f:1},{k:'mg_scroll',s:34,f:1},{k:'ball',s:28,f:0},{k:'coin',s:26,f:0},{k:'gem1',s:28,f:0},{k:'ingot',s:32,f:1},
  {k:'mg_shovel',s:40,f:1},{k:'mg_ezh',s:36,f:1},{k:'egg',s:28,f:0},{k:'heart',s:28,f:0}];
const SKY=[{k:'bird',s:34,f:1,z:'s'}];
const SAY={
  intro:['Это не подмена, это <b>перестановка для уюта</b>! Я только чуть-чуть похозяйничала на второй картинке. Найдёшь пять моих «улучшений»? Спешить некуда — болото подождёт.',
    'It’s not swapping, it’s <b>rearranging for coziness</b>! I just tidied up the second picture a little. Can you find my five “improvements”? No rush — the swamp can wait.'],
  hit:[['Ой, заметил… Я просто пыль протирала!','Oh, you noticed… I was just dusting!'],['Ну и глаз у тебя — как у филина!','What an eye — like an owl’s!'],
    ['Это не я, это домовой!','That wasn’t me, that was the house spirit!'],['Подумаешь, одну вещичку…','So what, just one little thing…'],
    ['Ладно-ладно, верну на место. Наверное.','Fine, fine, I’ll put it back. Probably.'],['Эх, а мне так больше нравилось!','Oh, I liked it better my way!']],
  miss:[['Тут всё как было, честное болотное!','Everything’s as it was here, swamp’s honour!'],['Мимо! Ква-ха-ха!','Missed! Ribbit-ha-ha!'],
    ['Это место я не трогала. Почти.','I didn’t touch that spot. Almost.'],['Смотри внимательней, дозорный!','Look closer, watchman!']],
  hint:[['Мур… Глянь-ка вон туда, — зевнул Кот Баюн.','Purr… Look over there, yawned Bayun the Cat.'],['Кот Баюн лениво показал лапой.','Bayun the Cat lazily pointed a paw.']],
  end:[['Всё нашёл! Ладно, в другой раз подменю половчее.','You found them all! Fine, next time I’ll be sneakier.']]};
const pick=(a,R)=>a[Math.floor((R?R():Math.random())*a.length)];
/* ---------- сцена: предметы и 5 подмен по зерну ---------- */
function make(seed){const R=T.rnd(seed),items=[],ok=k=>{try{return !!artGet(k);}catch(e){return false;}};
  const pool=T.shuf(POOL.filter(p=>ok(p.k)).slice(),R);
  // небо: 1–2 птицы
  const nb=1+Math.floor(R()*2);for(let i=0;i<nb&&ok('bird');i++)items.push({k:'bird',s:36,f:1,z:'s',x:i?340+R()*30:180+R()*60,y:34+R()*26,fl:R()<.5});
  // земля: до 12 предметов без наложений
  for(const p0 of pool){const p={k:p0.k,f:p0.f,s:Math.round(p0.s*1.15)};if(items.length>=nb+11)break;for(let t=0;t<40;t++){const x=p.s*.6+R()*(BW-p.s*1.2),y=176+R()*(BH-176-p.s*.55);
      if(items.some(q=>q.z!=='s'&&Math.hypot(q.x-x,(q.y-y)*1.3)<(q.s+p.s)*.55))continue;items.push({k:p.k,s:p.s,f:p.f,z:'g',x,y,fl:R()<.5});break;}}
  const unused=pool.filter(p=>!items.some(q=>q.k===p.k));
  // подмены
  const cand=T.shuf(items.slice(),R),kinds=T.shuf(['gone','swap','hue','flip','move'],R),diffs=[];
  for(const it of cand){if(diffs.length>=5)break;let kd=kinds[diffs.length];
    if(kd==='flip'&&!it.f)kd='hue';if(kd==='swap'&&(it.z==='s'||!unused.length))kd='size';
    if(kd==='move'){const dx=(R()<.5?-1:1)*(34+R()*14);if(it.x+dx<it.s*.6||it.x+dx>BW-it.s*.6)kd='hue';else it.mx=dx;}
    // подмены не рядом друг с другом — чтобы касание было однозначным
    if(diffs.some(d=>Math.hypot(d.it.x-it.x,d.it.y-it.y)<46))continue;
    const d={it,kd,found:0,t:0};if(kd==='swap'){const s=unused.shift();d.k2=s.k;d.s2=Math.round(s.s*1.15);}if(kd==='hue')d.h=120+Math.floor(R()*120);diffs.push(d);it.d=d;}
  items.sort((a,b)=>(a.z==='s'?-1:0)-(b.z==='s'?-1:0)||a.y-b.y);return {items,diffs};}
/* ---------- рисунок одной картинки (alt — вторая, с подменами) ---------- */
function bake(sc,pw,ph,D,alt){const c=document.createElement('canvas');c.width=Math.round(pw*D);c.height=Math.round(ph*D);const g=c.getContext('2d'),k=pw/BW;
  g.setTransform(D*k,0,0,D*k,0,0);g.lineJoin='round';g.lineCap='round';
  const sk=g.createLinearGradient(0,0,0,170);sk.addColorStop(0,'#8ec8ee');sk.addColorStop(1,'#e6f4ea');g.fillStyle=sk;g.fillRect(0,0,BW,BH);
  g.fillStyle='rgba(255,255,255,.85)';for(const [x,y,r] of[[70,40,16],[92,34,20],[114,42,14],[300,26,14],[318,20,18],[338,28,12]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
  g.fillStyle='#ffe066';g.beginPath();g.arc(372,30,14,0,TAU);g.fill();
  g.fillStyle='#86b86a';g.beginPath();g.moveTo(0,140);g.quadraticCurveTo(100,100,200,132);g.quadraticCurveTo(300,96,400,130);g.lineTo(400,170);g.lineTo(0,170);g.fill();
  // частокол
  for(let x=-4;x<BW+8;x+=13){if(x>234&&x<330)continue;const h=44+((x*7)%9);g.fillStyle='#a8743e';g.beginPath();g.moveTo(x,166);g.lineTo(x,166-h+8);g.lineTo(x+5.5,166-h);g.lineTo(x+11,166-h+8);g.lineTo(x+11,166);g.fill();
    g.strokeStyle='#6a4222';g.lineWidth=1.2;g.stroke();}
  g.fillStyle='#7a4a22';g.fillRect(0,136,234,4);g.fillRect(330,136,70,4);
  // земля
  const gr=g.createLinearGradient(0,160,0,BH);gr.addColorStop(0,'#7cc05a');gr.addColorStop(1,'#5aa03e');g.fillStyle=gr;g.fillRect(0,162,BW,BH-162);
  g.fillStyle='rgba(200,170,110,.55)';g.beginPath();g.moveTo(250,BH);g.quadraticCurveTo(270,210,282,164);g.lineTo(300,164);g.quadraticCurveTo(310,220,350,BH);g.fill();
  for(let i=0;i<30;i++){const x=(i*61)%BW,y=178+(i*37)%110;g.strokeStyle='#4a8a2e';g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x-2,y-6);g.moveTo(x,y);g.lineTo(x+2,y-7);g.stroke();}
  g.setTransform(D,0,0,D,0,0);
  MGK.put(g,'mg_izba',100*k,118*k,120*k,D);MGK.put(g,'gate',282*k,128*k,96*k,D);
  for(const it of sc.items){const d=it.d;let key=it.k,s=it.s,x=it.x,fl=it.fl;
    if(alt&&d){if(d.kd==='gone')continue;if(d.kd==='swap'){key=d.k2;s=d.s2;}if(d.kd==='flip')fl=!fl;if(d.kd==='move')x+=it.mx;if(d.kd==='size')s*=1.45;if(d.kd==='hue')g.filter='hue-rotate('+d.h+'deg) saturate(1.4)';}
    MGK.put(g,key,x*k,it.y*k,s*k,D,{sx:fl?-1:1});g.filter='none';}
  return c;}
function hitR(d){return Math.max(26,d.it.s*.7);}
/* ---------- игра ---------- */
function run(host,o){T.css();const cv=MGK.canvas(host),g=cv.getContext('2d'),pc=mgPC(),calm=o.calm;
  const seed=o.train?(o.seed^(Date.now()&0xffffff))>>>0:o.seed>>>0,sc=make(seed),R=T.rnd(seed*7+3);
  const st={miss:0,hints:0,adHint:0,P:[],X:[],t:0,ended:false,hl:null,say:L(SAY.intro).replace(/<[^>]+>/g,'').split('!')[0]+'!'};
  let lay=null,picA=null,picB=null;
  function layout(){const W=cv.W,H=cv.H,wide=W>H*1.05,top=(wide?64:76),bot=78;let pw,ph,a,b;
    if(wide){pw=Math.min((W-36)/2,(H-top-bot)*BW/BH);ph=pw*BH/BW;const y=top+Math.max(0,(H-top-bot-ph)/2),x0=(W-pw*2-16)/2;a={x:x0,y};b={x:x0+pw+16,y};}
    else{ph=Math.min((H-top-bot-10)/2,(W-16)*BH/BW);pw=ph*BW/BH;const x=(W-pw)/2,y0=top+Math.max(0,(H-top-bot-ph*2-10)/2);a={x,y:y0};b={x,y:y0+ph+10};}
    lay={W,H,pw,ph,k:pw/BW,a,b,wide};picA=bake(sc,pw,ph,cv.D,false);picB=bake(sc,pw,ph,cv.D,true);}
  layout();host.onResize(()=>{layout();});
  const found=()=>sc.diffs.filter(d=>d.found).length;
  function topUI(){T.top(host,'<b>'+Lg('Найдено ','Found ')+found()+Lg(' из 5',' of 5')+'</b>'+st.say);}
  function barUI(){const bar=T.bar(host);if(st.ended){bar.innerHTML='';return;}let h='';
    if(st.hints<1)h='<button class="btn" id="tqHint">🐈 '+Lg('Подсказка Баюна','Bayun’s hint')+(pc?' <small>(H)</small>':'')+'</button>';
    else if(!st.adHint&&host.adOk()&&!o.train)h='<button class="btn ad" id="tqHint">🎬 '+Lg('Подсказка за рекламу','Hint for an ad')+'</button>';
    bar.innerHTML=h;const b=$('tqHint');if(b)b.onclick=()=>{try{SND.click();}catch(e){}hint();};}
  function mark(d,how){d.found=1;d.t=0;d.how=how;const p=[lay.a,lay.b];
    for(let i=0;i<2;i++){const q=p[i],x=q.x+(d.it.x+(i&&d.kd==='move'?d.it.mx:0))*lay.k,y=q.y+d.it.y*lay.k;if(!calm)MGK.burst(st.P,x,y,{n:10,col:'#ffe27a',sp:140,k:'star',s:5,g:120});}
    try{SND.up();}catch(e){}
    if(found()>=5){st.say=L(SAY.end[0]);topUI();st.ended=true;barUI();setTimeout(finish,calm?500:1300);return;}
    st.say=how==='hint'?L(pick(SAY.hint)):L(pick(SAY.hit));topUI();barUI();}
  function hint(){if(st.ended)return;const left=sc.diffs.filter(d=>!d.found);if(!left.length)return;const d=pick(left,R);
    if(st.hints<1){st.hints++;mark(d,'hint');return;}
    if(st.adHint||!host.adOk())return;const b=$('tqHint');if(b)b.disabled=true;
    host.ad('hint').then(ok=>{if(!ok){barUI();return;}st.adHint=1;st.hints++;const l2=sc.diffs.filter(x=>!x.found);if(l2.length)mark(pick(l2,R),'hint');});}
  function finish(){const f=found(),score=Math.max(0,f*100-st.miss*10)+(st.hints?0:50),tier=f<5?0:st.hints===0?3:st.hints===1?2:1;
    host.done({score,tier,extra:{lbl:Lg('очков','points')+' · '+Lg('промахов: ','misses: ')+st.miss+(st.hints?Lg(' · подсказок: ',' · hints: ')+st.hints:'')}});}
  function tap(px,py){if(st.ended||host.paused)return;let pic=null,which=0;for(const [q,i] of[[lay.a,0],[lay.b,1]])if(px>=q.x&&px<=q.x+lay.pw&&py>=q.y&&py<=q.y+lay.ph){pic=q;which=i;}
    if(!pic)return;const bx=(px-pic.x)/lay.k,by=(py-pic.y)/lay.k;let best=null,bd=1e9;
    for(const d of sc.diffs){if(d.found)continue;const pts=[[d.it.x,d.it.y]];if(d.kd==='move')pts.push([d.it.x+d.it.mx,d.it.y]);
      for(const [x,y] of pts){const dist=Math.hypot(bx-x,by-y);if(dist<hitR(d)*1.15&&dist<bd){bd=dist;best=d;}}}
    // уже найденное — не промах
    if(!best&&sc.diffs.some(d=>d.found&&Math.hypot(bx-d.it.x-(which&&d.kd==='move'?d.it.mx:0),by-d.it.y)<hitR(d)))return;
    if(best){mark(best,'tap');return;}
    st.miss++;st.X.push({x:px,y:py,t:0});st.say=L(pick(SAY.miss));topUI();try{SND.click();}catch(e){}if(navigator.vibrate)try{navigator.vibrate(15);}catch(e){}}
  host._tq={sc,tap,lay:()=>lay};   // для стенда
  cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();tap(e.clientX-r.left,e.clientY-r.top);});
  T.keys(host,k=>{if(k==='h'||k==='H'||k==='р'||k==='Р'){const b=$('tqHint');if(b&&!b.disabled){b.click();return true;}}return false;});
  function frame(q,img,lbl,alt){const r=10;g.save();g.fillStyle='rgba(30,18,8,.45)';rrect(g,q.x-3,q.y+1,lay.pw+6,lay.ph+6,r);g.fill();
    g.save();rrect(g,q.x,q.y,lay.pw,lay.ph,r);g.clip();g.drawImage(img,q.x,q.y,lay.pw,lay.ph);g.restore();
    g.strokeStyle='#6e431f';g.lineWidth=4;rrect(g,q.x,q.y,lay.pw,lay.ph,r);g.stroke();g.strokeStyle='#e6b53a';g.lineWidth=1.5;rrect(g,q.x+3,q.y+3,lay.pw-6,lay.ph-6,r-3);g.stroke();
    const fs=Math.max(11,Math.min(14,lay.pw/26));g.font=MGK.font(fs,800);const tw=g.measureText(lbl).width+14;g.fillStyle=alt?'rgba(90,40,90,.82)':'rgba(40,60,30,.78)';rrect(g,q.x+8,q.y+8,tw,fs+8,7);g.fill();
    g.fillStyle='#fff6dc';g.textAlign='left';g.textBaseline='middle';g.fillText(lbl,q.x+15,q.y+12+fs/2);g.restore();}
  function draw(dt){const W=cv.W,H=cv.H;g.setTransform(cv.D,0,0,cv.D,0,0);
    const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#4a3a5a');bg.addColorStop(1,'#2a3a2a');g.fillStyle=bg;g.fillRect(0,0,W,H);
    frame(lay.a,picA,Lg('Как было','Before'),0);frame(lay.b,picB,Lg('После Кикиморы','After Kikimora'),1);
    for(const d of sc.diffs){if(!d.found)continue;d.t+=dt;const k=calm?1:Math.min(1,d.t/.35),rr=hitR(d)*lay.k*(1.5-.5*MGK.ease.back(k));
      for(const [q,i] of[[lay.a,0],[lay.b,1]]){const x=q.x+(d.it.x+(i&&d.kd==='move'?d.it.mx:0))*lay.k,y=q.y+d.it.y*lay.k;
        g.lineWidth=4;g.strokeStyle='rgba(30,20,10,.55)';g.beginPath();g.arc(x,y,rr,0,TAU);g.stroke();g.lineWidth=2.6;g.strokeStyle=d.how==='hint'?'#7ad0ff':'#7cff5a';g.beginPath();g.arc(x,y,rr,0,TAU);g.stroke();
        if(i&&d.kd==='move'){const x0=q.x+d.it.x*lay.k;g.setLineDash([4,4]);g.lineWidth=2;g.beginPath();g.arc(x0,y,rr*.8,0,TAU);g.stroke();g.setLineDash([]);}}}
    for(let i=st.X.length-1;i>=0;i--){const m=st.X[i];m.t+=dt;if(m.t>.9||calm&&m.t>.5){st.X.splice(i,1);continue;}const a=1-m.t/.9,s=10;
      g.globalAlpha=a;g.strokeStyle='#ff5a3a';g.lineWidth=4;g.beginPath();g.moveTo(m.x-s,m.y-s);g.lineTo(m.x+s,m.y+s);g.moveTo(m.x+s,m.y-s);g.lineTo(m.x-s,m.y+s);g.stroke();g.globalAlpha=1;}
    if(st.P.length)MGK.parts(g,st.P,dt);}
  MGK.loop(host,dt=>{if(cv.W!==lay.W||cv.H!==lay.H)layout();draw(dt);});
  T.intro(host,{who:'kik',t:L(SAY.intro),btn:Lg('Искать!','Start looking!'),key:Lg('Мышь — отметить отличие, H — подсказка Баюна','Mouse — mark a difference, H — Bayun’s hint')}).then(()=>{topUI();barUI();});}
T.def('podm',{run,sim(o,k){const R=T.rnd((o.seed||1)*13+5),miss=Math.round((1-k)*6*R()+(1-k)*2),hints=k>.8?0:k>.5?1:2;
  return {score:Math.max(0,500-miss*10)+(hints?0:50),tier:hints===0?3:hints===1?2:1};}});
})();
