'use strict';
/* vy-mga: мини-игра «Номера» (id 'nomera', ведущий — Валерка). 05-minigames.md №7.
   Старая игра в дорогу: машины едут мимо двора, над каждой — её номер (советский, «а 12-34 КЕ»). Валерка загадывает правило —
   нажимай машины с подходящим номером. Три круга по 9 машин (≈50 с): «счастливый» всегда первый, дальше два из
   «зеркальный», «как у соседа», «наш регион». Ошибка не наказывает очками — Валерка объясняет, почему номер не тот.
   Упущенную машину не ругают. Звёзды: поймано ≥85 % и ошибок ≤1 → 3★; ≥60 % и ошибок ≤3 → 2★; ≥30 % → 1★.
   Клавиатура (ПК, KEYS): Пробел/Enter — поймать машину у столба «Пост» (её номер на ПК обведён жёлтым).
   Машины — VYCARS (ART), если есть; иначе — VYMG.art.car оболочки. */
(function(){
if(typeof VYMG_REG!=='function'||!window.VYA)return;
const A=window.VYA,L=A.L,ID='nomera';
const LET='абвгдежзиклмнопрстуфхцчшэюя',REG2=['КЕ','МО','ЛД','НС','ТО','АЛ','ОМ','КР','СВ','ЧБ'];
const OUR='КЕ';
/* правила: test(p) — подходит ли; make(r) — подходящий; why(p) — пояснение ошибки */
const sum2=(a,b)=>a+b;
const RULES={
  lucky:{n:['Счастливый номер','Lucky number'],
    a:['Сумма первых двух цифр равна сумме последних двух. Например, 12-30: 1+2 = 3+0.','The first two digits add up to the last two. E.g. 12-30: 1+2 = 3+0.'],
    test:p=>p.d[0]+p.d[1]===p.d[2]+p.d[3],
    make:r=>{for(;;){const a=Math.floor(r()*10),b=Math.floor(r()*10),s=a+b,c=Math.floor(r()*10),d=s-c;if(d>=0&&d<=9&&!(a===c&&b===d))return [a,b,c,d];}},
    why:p=>L(p.d[0]+'+'+p.d[1]+' = '+(p.d[0]+p.d[1])+', а '+p.d[2]+'+'+p.d[3]+' = '+(p.d[2]+p.d[3])+' — не сходится.',p.d[0]+'+'+p.d[1]+' = '+(p.d[0]+p.d[1])+', but '+p.d[2]+'+'+p.d[3]+' = '+(p.d[2]+p.d[3])+'.')},
  mirror:{n:['Зеркальный номер','Mirror number'],
    a:['Цифры читаются одинаково слева и справа: 12-21, 70-07, 55-55.','Digits read the same both ways: 12-21, 70-07, 55-55.'],
    test:p=>p.d[0]===p.d[3]&&p.d[1]===p.d[2],
    make:r=>{const a=Math.floor(r()*10),b=Math.floor(r()*10);return [a,b,b,a];},
    why:p=>L('Наоборот было бы '+p.d[3]+p.d[2]+'-'+p.d[1]+p.d[0]+' — не то же самое.','Backwards it’s '+p.d[3]+p.d[2]+'-'+p.d[1]+p.d[0]+' — not the same.')},
  same:{n:['Как у соседа','Like the neighbour’s'],
    a:['У «Москвича» соседа номер {N}. Лови машину с теми же цифрами — буквы могут быть другими.','The neighbour’s car is {N}. Catch a car with the same digits — letters may differ.'],
    test:(p,R)=>p.d.join('')===R.nb.join(''),
    make:(r,R)=>R.nb.slice(),
    why:(p,R)=>L('Цифры '+fmtD(p.d)+', а у соседа '+fmtD(R.nb)+'.','Digits '+fmtD(p.d)+', the neighbour’s are '+fmtD(R.nb)+'.')},
  region:{n:['Наш регион','Our region'],
    a:['Буквы в конце — «'+OUR+'», как у машин нашего двора.','Letters at the end — “'+OUR+'”, like the cars in our yard.'],
    test:p=>p.r===OUR,make:null,
    why:p=>L('Это «'+p.r+'» — машина издалека, не наша.','That’s “'+p.r+'” — from far away, not ours.')}};
const fmtD=d=>''+d[0]+d[1]+'-'+d[2]+d[3];
const fmt=p=>p.l+' '+fmtD(p.d)+' '+p.r;
function cfg(o){const calm=!!(o&&o.calm),lv=(o&&o.lvl)|0;return {per:9,match:3,cross:(calm?6.6:lv<30?5.2:4.6),gap:(calm?1.9:lv<30?1.65:1.45)};}
/* план: 3 круга × 9 машин; в каждом 3 подходящих (не подряд в начале) + «почти» для интереса */
function plan(seed,o){const r=A.rng(seed*41+9),rc=A.rng(seed*5+1),c=cfg(o),others=A.shuffle(r,['mirror','same','region']).slice(0,2),rounds=['lucky'].concat(others).map(id=>({id}));
  const ids=(window.VYCARS&&VYCARS.list)?VYCARS.list.filter(x=>x.len<=3).map(x=>x.id):[];
  for(const R of rounds){const rule=RULES[R.id];if(R.id==='same'){R.nb=[Math.floor(r()*10),Math.floor(r()*10),Math.floor(r()*10),Math.floor(r()*10)];}
    const slots=A.shuffle(r,[1,2,3,4,5,6,7,8]).slice(0,c.match);R.cars=[];
    for(let i=0;i<c.per;i++){const m=slots.includes(i);let p;
      for(let k=0;k<200;k++){p={l:LET[Math.floor(r()*LET.length)],d:[0,0,0,0].map(()=>Math.floor(r()*10)),r:r()<.45?OUR:A.pick(r,REG2)};
        if(m){if(rule.make)p.d=rule.make(r,R);else p.r=OUR;}
        else if(R.id!=='region'&&r()<.35){// «почти»: для счастливого — сумма на 1 мимо; для соседа — одна цифра другая
          if(R.id==='lucky'){const s=p.d[0]+p.d[1];p.d[2]=Math.min(9,Math.max(0,s-p.d[3]+(r()<.5?1:-1)));}
          if(R.id==='same'){p.d=R.nb.slice();const j=Math.floor(r()*4);p.d[j]=(p.d[j]+1+Math.floor(r()*8))%10;}
          if(R.id==='mirror'){p.d=[p.d[0],p.d[1],p.d[0],p.d[1]];}}
        if(R.id==='region'&&!m&&p.r===OUR)p.r=A.pick(r,REG2.slice(1));
        if(!!rule.test(p,R)===m)break;}
      p.match=m;const cr=rc();p.car=ids.length?ids[Math.floor(cr*ids.length)]:null;p.col=A.pick(rc,A.COL);const kr=rc();p.kind=kr<.12?'bus':kr<.25?'van':kr<.45?'old':'sedan';R.cars.push(p);}}
  return {c,rounds,total:rounds.reduce((s,R)=>s+R.cars.filter(p=>p.match).length,0)};}
function tierOf(got,total,wrong){const f=total?got/total:0;return f>=.85&&wrong<=1?3:f>=.6&&wrong<=3?2:f>=.3?1:0;}
function scoreOf(got,total,wrong){return Math.max(0,Math.round(100*got/Math.max(1,total))-wrong*8);}
function sim(o,k){k=k==null?.6:k;const P=plan(((o&&o.seed)|0)||1,o),r=A.rng(((o&&o.seed)|0)*3+7);let got=0,wrong=0;
  for(const R of P.rounds)for(const p of R.cars){if(p.match){if(r()<.35+k*.62)got++;}else if(r()<(1-k)*.12)wrong++;}
  return {score:scoreOf(got,P.total,wrong),tier:tierOf(got,P.total,wrong)};}

function run(host,o){
  // машины ART: если js/art-cars.js ещё не подключён — подгрузить (тот же файл, что у альбома)
  if(!window.VYCARS&&!document.querySelector('script[src*="art-cars"]')){const s=document.createElement('script');s.src='js/art-cars.js';document.head.appendChild(s);}
  const seed=(o.seed|0)||20261009,PL=plan(seed,o),C=PL.c;
  let started=false,fin=false,ri=-1,R=null,t=0,cars=[],spawned=0,got=0,wrong=0,missed=0,between=0,fx=[],finT=0;
  const root=A.root(host),say=A.sayBox(host,root);const rule=document.createElement('div');rule.className='vya-rule';root.appendChild(rule);
  const cv=A.canvas(host,root),c=cv.cx,pc=A.pc(host);
  const note=document.createElement('div');note.className='vya-note';root.appendChild(note);
  note.innerHTML=pc?A.kc(host,L('Пробел','Space'))+L(' или ',' or ')+A.kc(host,'Enter')+L(' — поймать машину у столба «Пост» (номер в жёлтой рамке) · или щелчок по машине',' — catch the car at the post (yellow frame) · or click a car'):L('Нажимайте машину с нужным номером. Ошибиться не страшно','Tap the car with the right number. Mistakes are fine');
  if(!document.getElementById('vya-css-nm')){const st=document.createElement('style');st.id='vya-css-nm';st.textContent='.vya-rule{flex:none;background:#fff8e1;border:2px dashed #e0b84c;border-radius:12px;padding:6px 10px;font-size:14px;line-height:1.25;text-align:center}.vya-rule b{color:#8a5a00}.vya-rule .vya-pl{display:inline-block;background:#fff;border:2px solid #222;border-radius:5px;padding:0 6px;font-weight:800;letter-spacing:.5px;margin:0 2px}body.big .vya-rule{font-size:17px}';document.head.appendChild(st);}
  const ruleTxt=R=>{let a=L(RULES[R.id].a[0],RULES[R.id].a[1]);if(R.nb)a=a.replace('{N}','<span class="vya-pl">'+fmtD(R.nb)+'</span>');return '<b>'+L('Круг ','Round ')+(ri+1)+'/3 · '+L(RULES[R.id].n[0],RULES[R.id].n[1])+'</b><br>'+a;};
  function nextRound(){ri++;if(ri>=PL.rounds.length){end();return;}R=PL.rounds[ri];spawned=0;t=0;rule.innerHTML=ruleTxt(R);
    say.set('valerka',ri===0?L('Ловим счастливые номера! Кто поймает больше — тому и везёт.','Let’s catch lucky numbers! Whoever catches more is the lucky one.'):L('Новое правило — смотри на жёлтую табличку.','New rule — check the yellow card.'),'happy');top();}
  function end(){fin=true;A.snd(host,'win');const tr=tierOf(got,PL.total,wrong);
    say.set('valerka',tr===3?L('Глаз-алмаз! Ни одного номера не упустил.','Eagle eye! You didn’t miss a thing.'):tr>=2?L('Хорошо ловишь! Почти все наши.','Nice catching! Got almost all of them.'):L('Номера — дело практики. Завтра ещё сыграем!','Plates take practice. Let’s play again tomorrow!'),'happy');}
  function finish(){host.done({score:scoreOf(got,PL.total,wrong),tier:tierOf(got,PL.total,wrong),label:L('Поймано ','Caught ')+got+L(' из ',' of ')+PL.total+(wrong?L(' · ошибок: ',' · mistakes: ')+wrong:'')});}
  function top(){A.top(host,'✔ '+got+'/'+PL.total);}
  /* раскладка: небо, дом, тротуар, дорога; машина едет слева направо */
  let G=null;cv.onFit((W,H)=>{const road=H*.74,cw=Math.min(W*.38,230);G={W,H,road,cw,post:W*.5};draw();});
  function carBox(k){const ch=G.cw*.43;return {x:k.x-G.cw/2,y:G.road-ch-G.cw*.04,w:G.cw,h:ch};}
  function plateBox(k){const pw=Math.max(118,G.cw*.82),ph=Math.max(30,pw*.25),b=carBox(k);return {x:k.x-pw/2,y:b.y-ph-12,w:pw,h:ph};}
  function spawn(){const p=R.cars[spawned++];if(!p.car&&window.VYCARS&&VYCARS.list){const ids=VYCARS.list.filter(x=>x.len<=3).map(x=>x.id);if(ids.length)p.car=ids[(seed+ri*9+spawned*7)%ids.length];}cars.push({p,x:-G.cw*.6,v:(G.W+G.cw*1.2)/C.cross,hit:0,ok:0,bad:0,rot:0});}
  function tap(k){if(k.hit)return;k.hit=1;if(k.p.match){got++;k.ok=1;A.snd(host,'coin');fx.push({x:k.x,y:plateBox(k).y,t:0,ok:1});
      if(got===1||Math.random()<.35)say.set('valerka',A.pick(Math.random,[L('Есть! '+fmt(k.p)+' — наш!','Got it! '+fmt(k.p)+'!'),L('Точно! Глаз-алмаз.','Right! Sharp eye.'),L('Ага, подходит!','Yep, that one!')]),'happy');}
    else{wrong++;k.bad=1;A.snd(host,'honk2');fx.push({x:k.x,y:plateBox(k).y,t:0,ok:0});say.set('valerka',L('Не-а: ','Nope: ')+RULES[R.id].why(k.p,R),'sad');}
    top();}
  function hitAt(x,y){let best=null;for(const k of cars){if(k.hit)continue;const a=carBox(k),b=plateBox(k);const pad=10;
      if((x>=a.x-pad&&x<=a.x+a.w+pad&&y>=a.y-pad&&y<=a.y+a.h+pad)||(x>=b.x-pad&&x<=b.x+b.w+pad&&y>=b.y-pad&&y<=b.y+b.h+pad)){if(!best||Math.abs(k.x-x)<Math.abs(best.x-x))best=k;}}return best;}
  cv.cv.addEventListener('pointerdown',e=>{if(!started||fin||host.paused||between>0)return;const p=cv.pt(e),k=hitAt(p.x,p.y);if(k)tap(k);});
  /* KEYS: машина «у поста» — ближайшая к столбу, не дальше 0,8 корпуса; её ловит Пробел/Enter, на ПК её номер обведён */
  function postCar(){if(!G)return null;let best=null;for(const q of cars){if(q.hit)continue;if(!best||Math.abs(q.x-G.post)<Math.abs(best.x-G.post))best=q;}
    return best&&Math.abs(best.x-G.post)<G.cw*.8?best:null;}
  const unk=A.keys(host,k=>{if(!started||fin)return false;if(A.isGo(k)){if(between>0)return true;const b=postCar();if(b)tap(b);return true;}return false;});
  /* рисование */
  const AR=()=>window.VYMG&&VYMG.art;
  function drawCar(k){const b=carBox(k),cx=k.x;let ok=false;
    if(k.p.car&&window.VYCARS&&VYCARS.draw)try{ok=VYCARS.draw(c,k.p.car,b.x,G.road-G.cw*130/300,G.cw,G.cw*130/300,{view:'side'});}catch(e){ok=false;}
    if(!ok){if(AR()&&AR().car)AR().car(c,{cx,by:G.road,w:G.cw,col:k.p.col,kind:k.p.kind,rot:k.rot});else A.carSide(c,b.x,G.road-G.cw*.05,G.cw,k.p.col,1,k.p.kind==='bus'?'bus':'');}}
  function drawPlate(k,at){const b=plateBox(k);c.save();
    if(at){c.fillStyle='rgba(255,213,79,.9)';A.rr(c,b.x-6,b.y-6,b.w+12,b.h+12,10);c.fill();}
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=2;c.beginPath();c.moveTo(k.x,b.y+b.h);c.lineTo(k.x,carBox(k).y+4);c.stroke();
    c.fillStyle=k.ok?'#c8f7c5':k.bad?'#ffd6d6':'#fdfefe';A.rr(c,b.x,b.y,b.w,b.h,6);c.fill();c.lineWidth=3;c.strokeStyle='#1d1d1d';c.stroke();
    c.lineWidth=1;A.rr(c,b.x+4,b.y+4,b.w-8,b.h-8,3);c.stroke();
    const fs=Math.round(b.h*.58);c.fillStyle='#111';c.textBaseline='middle';c.textAlign='center';
    c.font='700 '+Math.round(fs*.8)+'px Rubik,sans-serif';const lw=c.measureText(k.p.l+' ').width;c.font='800 '+fs+'px Rubik,sans-serif';const dw=c.measureText(fmtD(k.p.d)).width;
    c.font='700 '+Math.round(fs*.75)+'px Rubik,sans-serif';const rw=c.measureText(' '+k.p.r).width;let x=k.x-(lw+dw+rw)/2,y=b.y+b.h/2+1;
    c.textAlign='left';c.font='700 '+Math.round(fs*.8)+'px Rubik,sans-serif';c.fillText(k.p.l,x,y);x+=lw;c.font='800 '+fs+'px Rubik,sans-serif';c.fillText(fmtD(k.p.d),x,y);x+=dw;
    c.font='700 '+Math.round(fs*.75)+'px Rubik,sans-serif';c.fillText(' '+k.p.r,x,y);
    if(k.ok||k.bad){c.font='800 '+Math.round(b.h*.7)+'px Rubik,sans-serif';c.textAlign='center';c.fillStyle=k.ok?'#2e7d32':'#c62828';c.fillText(k.ok?'✔':'✖',b.x+b.w-2,b.y-4);}
    c.restore();}
  function draw(){if(!G)return;const {W,H,road}=G;c.clearRect(0,0,W,H);
    if(AR()&&AR().sky)AR().sky(c,W,H);else{c.fillStyle='#bfe3f5';c.fillRect(0,0,W,H);}
    const hb=road-H*.14;if(AR()&&AR().house){AR().house(c,W*.05,hb,W*.55,Math.min(H*.42,hb-10),{fl:5,seed:5});AR().house(c,W*.66,hb,W*.4,Math.min(H*.34,hb-10),{fl:4,seed:9,col:'#dfe7ec'});}
    else{c.fillStyle='#e9dcc0';c.fillRect(W*.05,hb-H*.4,W*.55,H*.4);}
    c.fillStyle='#cfd2c9';c.fillRect(0,hb,W,road-hb-G.cw*.02);c.fillStyle='#6b7077';c.fillRect(0,road-G.cw*.06,W,H-road+G.cw*.06);
    c.strokeStyle='#f4f6f6';c.lineWidth=3;c.setLineDash([22,18]);c.beginPath();c.moveTo(0,road+(H-road)*.55);c.lineTo(W,road+(H-road)*.55);c.stroke();c.setLineDash([]);
    // столб «пост» — для клавиши Пробел
    c.fillStyle='#7f8c8d';c.fillRect(G.post-2,hb-H*.2,4,H*.2+4);c.fillStyle='#fdfefe';A.rr(c,G.post-24,hb-H*.2-18,48,20,5);c.fill();c.strokeStyle='#2c5aa0';c.lineWidth=2;c.stroke();
    c.fillStyle='#2c5aa0';c.font='800 11px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('ПОСТ','POST'),G.post,hb-H*.2-8);
    if(pc){c.font='700 11px Rubik,sans-serif';c.fillStyle='#fff';const t=L('Пробел','Space'),tw=c.measureText(t).width+10;c.fillStyle='rgba(31,59,87,.85)';A.rr(c,G.post-tw/2,hb-H*.2+5,tw,16,4);c.fill();c.fillStyle='#fff';c.fillText(t,G.post,hb-H*.2+13.5);}
    for(const k of cars)drawCar(k);const pk=pc&&started&&!fin&&between<=0?postCar():null;for(const k of cars)drawPlate(k,k===pk);
    for(const f of fx){c.globalAlpha=Math.max(0,1-f.t);c.fillStyle=f.ok?'#2e7d32':'#c62828';c.font='800 22px Rubik,sans-serif';c.textAlign='center';c.fillText(f.ok?'+1':'✖',f.x,f.y-14-f.t*30);c.globalAlpha=1;}
    if(between>0&&ri<PL.rounds.length){c.fillStyle='rgba(255,255,255,.82)';A.rr(c,W*.12,H*.3,W*.76,56,14);c.fill();c.fillStyle='#1f3b57';c.font='800 20px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('Круг ','Round ')+(ri+1)+': '+L(RULES[R.id].n[0],RULES[R.id].n[1]),W/2,H*.3+28);}}
  const stop=A.loop(host,dt=>{if(!started||!G){draw();return;}
    if(fin){finT+=dt;if(finT>1.2&&finT<99){finT=99;finish();}draw();return;}
    if(between>0){between-=dt;draw();return;}
    t+=dt;if(spawned<R.cars.length&&t>=spawned*C.gap)spawn();
    for(const k of cars){k.x+=k.v*dt;k.rot+=dt*8;}
    for(let i=0;i<cars.length;i++){const k=cars[i];if(k.x-G.cw*.6>G.W){if(k.p.match&&!k.hit){missed++;if(missed===1)say.set('valerka',L('Упустили '+fmt(k.p)+' — ничего, будут ещё!','Missed '+fmt(k.p)+' — no worries, more are coming!'));}cars.splice(i,1);i--;}}
    for(const f of fx)f.t+=dt*1.4;fx=fx.filter(f=>f.t<1);
    if(spawned>=R.cars.length&&!cars.length){nextRound();if(!fin)between=1.4;}
    draw();});
  host.onQuit&&host.onQuit(()=>{stop();unk();cv.kill();});
  cv.fit();ri=-1;R=PL.rounds[0];rule.innerHTML='<b>'+L('Три круга по 9 машин','Three rounds of 9 cars')+'</b>';top();draw();
  A.intro(host,{who:'valerka',text:L('Сыграем в номера, как в дороге! Машины едут мимо — <strong>нажимай ту, у которой номер подходит</strong> под правило. Первое — <strong>счастливый номер</strong>: 12-30, ведь 1+2 = 3+0.','Let’s play the plate game! Cars drive past — <strong>tap the one whose number fits the rule</strong>. First up — <strong>lucky numbers</strong>: 12-30, because 1+2 = 3+0.'),
    hint:pc?L('Пробел или Enter — поймать машину, которая сейчас у столба «Пост» (её номер в жёлтой рамке). Можно и щелчком. Ошибиться не страшно.','Space or Enter — catch the car at the post (yellow frame). Clicking works too. Mistakes are fine.'):L('Ошибиться не страшно — Валерка подскажет.','Mistakes are fine — Valerka will explain.'),
    btn:L('Поехали','Let’s go')}).then(()=>{started=true;nextRound();between=.9;});
  host.el._mga={PL,cars:()=>cars,started:()=>started,fin:()=>fin,stat:()=>({got,wrong,missed,ri}),post:()=>{const b=postCar();return b?{match:!!b.p.match,hit:!!b.hit}:null;},between:()=>between,
    carXY:i=>{const k=cars[i],r=cv.cv.getBoundingClientRect(),b=plateBox(k);return [r.left+b.x+b.w/2,r.top+b.y+b.h/2];}};}

VYMG_REG({id:ID,run,sim,plan,rules:RULES});
})();
