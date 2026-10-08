'use strict';
/* ================= «🎪 Забавы» №2 «Загадки Кота Учёного» (BG0, 08.10.2026) =================
   Кот на золотой цепи у дуба (Лукоморье) загадывает 3 загадки в день: 1 — народная загадка или пословица, 1 — сказки/былины/Русь/деревня,
   1 — «от бабы Зины» (шутка из её словаря → какое это слово). Банк — js/zb0-zg-data.js (перенос из Обороны; вопросы дня НЕ совпадают с Обороной в тот же день).
   Без таймера; неверно — кот добродушно поправляет и рассказывает ответ. «🐾 Кот мурлычет» убирает один неверный ответ: 1 бесплатно в день, ещё 1 — за ролик.
   Ступень = число верных (0..3) → Слава ZAB_RW[2]; 3 из 3 → Золотой жёлудь (трофей Лукоморья). Неделя: 15 верных → украшение Терема «Дуб с цепью» (один раз), дальше — 2 жёлудя.
   В английской версии забавы нет (решение владельца). store: {hd:день подсказок, hn:взято, wk:неделя, wc:верных за неделю, wg:награда недели взята}.
   ПК: 1/2/3 — ответ, H — подсказка, Enter/пробел — «Начать»/«Дальше». */
(function(){
const DUB='zb_dub';
if(typeof ZAB_DECO==='function')ZAB_DECO(DUB,{get n(){return [L('Дуб с цепью','Oak with a golden chain'),L('Дуб с цепью','Oak with a golden chain')];},art:g=>{if(ART.zb_dub)ART.zb_dub.fn(g);},at:[.06,.78,1.15]});
function dayN(day){const p=String(day||dayKey()).split('-').map(Number);return Math.floor(Date.UTC(p[0],p[1]-1,p[2])/864e5);}
function perm(n,seed){const R=mulberry(seed),a=[];for(let i=0;i<n;i++)a.push(i);for(let i=n-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const B=()=>window.ZB0_ZG_BANK||[],Z=()=>window.ZB0_ZG_ZINA||[];
/* что в этот день спросит воевода Обороны (perm 7331 по 150 вопросам, Зина — perm 4242) — чтобы у нас в этот день было другое */
function obDay(D){const ob={b:{},z:{}},P=perm(150,7331);for(let k=0;k<2;k++)ob.b[P[(D*2+k)%150]]=1;const PZ=perm(41,4242),c=D%3===0?2:1,st=D+Math.floor((D+2)/3);for(let k=0;k<c;k++)ob.z[PZ[(st+k)%41]]=1;return ob;}
function sh(a,R){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function bankQ(b,R){const idx=sh([0,1,2],R);return {t:[b[2],b[5]],ok:idx.indexOf(0),opts:idx.map(i=>[b[3][i],b[6][i]]),x:[b[4],b[7]],head:[b[3][0],b[6][0]],k:b[1]};}
function zinaQ(z,R){const cap=t=>String(t).replace(/^(a|an) /,'').replace(/^./,c=>c.toUpperCase());const o=[[cap(z[0]),cap(z[3])],[cap(z[5][0]),cap(z[6][0])],[cap(z[5][1]),cap(z[6][1])]];
  const idx=sh([0,1,2],R);return {t:()=>L('Баба Зина говорит: «'+z[2]+'» Что это?','Granny Zina says: “'+z[4]+'” What is it?'),ok:idx.indexOf(0),opts:idx.map(i=>o[i]),x:()=>L('Это '+z[0]+' — так в словаре бабы Зины.','It’s '+String(z[3]).toLowerCase()+' — so says Granny Zina’s dictionary.'),head:o[0],k:'zina'};}
/* три загадки дня (у всех одинаковые; тренировка — случайные) */
function make(o){const R=mulberry((o.seed^0x5bd1e995)>>>0),bank=B(),zz=Z();if(!bank.length||!zz.length)return [];
  if(o.train){const r=o.rnd,a=bank.slice(),out=[];sh(a,r);out.push(bankQ(a[0],R),bankQ(a[1],R));out.push(zinaQ(zz[Math.floor(r()*zz.length)],R));return out;}
  const D=dayN(o.day),ob=obDay(D),A=bank.filter(b=>b[1]==='zag'||b[1]==='prov'),C=bank.filter(b=>b[1]!=='zag'&&b[1]!=='prov');
  const pick=(arr,seed,step)=>{const P=perm(arr.length,seed);for(let j=0;j<arr.length;j++){const b=arr[P[(D*step+j)%arr.length]];if(!ob.b[b[8]])return b;}return arr[0];};
  const out=[bankQ(pick(A,5503,1),R),bankQ(pick(C,8807,1),R)];
  const PZ=perm(zz.length,3119);let zi=0;for(let j=0;j<zz.length;j++){zi=PZ[(D+j)%zz.length];if(!ob.z[zi])break;}out.push(zinaQ(zz[zi],R));
  return out;}
const T=a=>typeof a==='function'?a():L(a[0],a[1]);
const PRAISE=[()=>L('Верно! Мур-р-р!','Right! Purr-r-r!'),()=>L('Умница! Так и есть.','Clever! That’s it.'),()=>L('В точку! Хвост трубой!','Spot on! Tail up!')];
const OOPS=[()=>L('Не совсем, дружок…','Not quite, friend…'),()=>L('Мяу… а вот и нет.','Meow… not this time.'),()=>L('Почти! Да не то.','Close! But no.')];

/* ---------- сцена: небо, море Лукоморья, дуб, золотая цепь, Кот Учёный ---------- */
function scene(g,W,H,t,st){const calm=st.calm,land=W>H*1.1,k=land?Math.min(H/520,W/900):Math.min(W/390,H/700);
  const sk=g.createLinearGradient(0,0,0,H*.5);sk.addColorStop(0,'#f4b46a');sk.addColorStop(.55,'#ffe2a8');sk.addColorStop(1,'#fff4d8');g.fillStyle=sk;g.fillRect(0,0,W,H);
  glow(g,W*.78,H*.16,70*k,'#ffd27a','#fff8e0');
  const hz=H*(land?.5:.34);const sea=g.createLinearGradient(0,hz,0,hz+H*.12);sea.addColorStop(0,'#3a8ac8');sea.addColorStop(1,'#6ac0e0');g.fillStyle=sea;g.fillRect(0,hz,W,H*.14);
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;for(let i=0;i<9;i++){const y=hz+8+i*H*.014,x0=((i*97+(calm?0:t*14*(i%2?1:-1)))%(W+60))-30;g.beginPath();g.moveTo(x0,y);g.quadraticCurveTo(x0+10,y-3,x0+20,y);g.stroke();}
  // парус вдали
  const sx=(W*.62+(calm?0:t*4))%(W+40)-20;poly(g,[sx,hz-2,sx+8,hz-22,sx+10,hz-2],'#fff4e8',{lw:.8});g.fillStyle='#7a4a22';g.fillRect(sx-4,hz-2,18,3);
  const gr=g.createLinearGradient(0,hz+H*.1,0,H);gr.addColorStop(0,'#a8d878');gr.addColorStop(1,'#5aa447');g.fillStyle=gr;g.beginPath();g.moveTo(0,hz+H*.12);
  for(let x=0;x<=W;x+=W/6)g.quadraticCurveTo(x+W/12,hz+H*.09,x+W/6,hz+H*.12);g.lineTo(W,H);g.lineTo(0,H);g.fill();
  // дуб: ствол, корни, крона
  const ox=land?W*.22:W*.3,oy=land?H*.86:H*.5,s=(land?1.25:1)*k*1.9;
  g.save();g.translate(ox,oy);g.scale(s,s);ell(g,0,4,62,10,'rgba(0,0,0,.18)',{ol:false,flat:true});
  shp(g,'#7a4a22',{lw:2},[-22,-120,22,6],()=>{g.moveTo(-14,-100);g.lineTo(-16,-20);g.quadraticCurveTo(-26,0,-44,4);g.lineTo(44,4);g.quadraticCurveTo(26,0,16,-20);g.lineTo(14,-100);g.closePath();});
  g.strokeStyle='rgba(60,30,10,.35)';g.lineWidth=2;for(const x of[-8,0,8]){g.beginPath();g.moveTo(x,-95);g.quadraticCurveTo(x+4,-50,x-2,-8);g.stroke();}
  ln(g,[10,-80,44,-104],'#7a4a22',7);ln(g,[-10,-74,-40,-96],'#7a4a22',6);
  for(const [x,y,r,c] of[[-50,-112,34,'#3f8a2e'],[50,-110,34,'#3f8a2e'],[0,-140,40,'#4a9a36'],[-26,-92,26,'#56a83e'],[28,-90,26,'#56a83e'],[0,-112,28,'#62b444']])ell(g,x,y,r,r*.82,c,{lw:1.6});
  for(const [x,y] of[[-40,-100],[30,-120],[8,-96],[-12,-130],[46,-96]])ell(g,x,y,2.6,3.2,'#c88a2a',{lw:.6});
  // золотая цепь вокруг ствола
  g.lineWidth=2.4;for(let i=0;i<15;i++){const a=Math.PI*.04+i*Math.PI*.066,x=Math.cos(a)*24,y=-34+Math.sin(a)*8;g.strokeStyle=i%2?'#e0b02e':'#f8d860';g.beginPath();g.ellipse(x,y,3.4,2.2,a+(i%2?1.2:0),0,TAU);g.stroke();}
  g.restore();
  // кот — на цепи справа от ствола
  const cx=ox+(land?62:48)*s/1.9*1.4,cy=oy-(land?20:24)*s/1.9*1.4,ks=(land?2.1:1.8)*k*(st.cs||1),bob=calm?0:Math.max(0,st.jump||0)*-14*k;
  const blink=((t*1000)%3800)<140&&!calm;
  metaArt(g,blink?'zb_kot_b':'zb_kot',cx,cy+bob,ks);st.cat={x:cx,y:cy-40*ks,s:ks};}

function run(host,o){const c=ZABK.canvas(host),g=c.getContext('2d'),Q=make(o),pc=zabPC();if(Q.length<3){host.quit();toast(L('Загадки не загрузились','Riddles failed to load'));return;}
  const S0=host.store(),dk=dayKey();if(S0.hd!==dk){S0.hd=dk;S0.hn=0;}const wk=o.week;if(S0.wk!==wk){S0.wk=wk;S0.wc=0;S0.wg=0;}
  const st={calm:o.calm,i:0,ok:0,ans:-1,hint:{},jump:0,P:[],t:0,phase:'intro'};
  const ui=document.createElement('div');ui.className='zb0Z';host.el.appendChild(ui);css();
  const loop=ZABK.loop(host,(dt,now)=>{st.t+=dt;if(st.jump>0)st.jump=Math.max(0,st.jump-dt*3);const W=c.W,H=c.H,d=c.D;g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';scene(g,W,H,st.t,st);ZABK.parts(g,st.P,dt);});
  const freeHint=()=>(S0.hn|0)<1,adHint=()=>(S0.hn|0)<2&&!(ZAB.cur&&ZAB.cur.ad)&&host.adOk()&&!o.train;
  function intro(){ui.innerHTML='<div class="zb0Card zb0Intro"><b>'+L('Кот Учёный','The Learned Cat')+'</b><p>'+
    L('«Мур! Загадаю тебе три загадки. Не спеши — таймера нет. Ошибёшься — расскажу ответ.»','“Purr! I’ll ask you three riddles. Take your time — there’s no timer. If you’re wrong, I’ll tell you the answer.”')+'</p><p class="zb0How">'+
    (pc?L('Ответ — мышкой или клавишами ','Answer with the mouse or keys ')+'<i class="zb0K">1</i> <i class="zb0K">2</i> <i class="zb0K">3</i>. '+L('Подсказка — ','Hint — ')+'<i class="zb0K">H</i>.':L('Нажми на ответ. Трудно — «Кот мурлычет» уберёт один неверный.','Tap an answer. Stuck? “The cat purrs” removes a wrong one.'))+
    (o.train?'<br><b>'+L('Тренировка — без наград.','Practice — no rewards.')+'</b>':'')+'</p><button class="btn big" data-k="go">'+L('Начать','Start')+(pc?' <i class="zb0K">Enter</i>':'')+'</button></div>';
    ui.querySelector('[data-k=go]').onclick=()=>{try{SND.click();}catch(e){}ask();};}
  function ask(){st.phase='q';st.ans=-1;const q=Q[st.i],hd=st.hint[st.i]||-1;
    ui.innerHTML='<div class="zb0Top"><span class="zb0Pr">'+[0,1,2].map(i=>'<i class="'+(i<st.i?(st.res&&st.res[i]?'ok':'no'):i===st.i?'cur':'')+'"></i>').join('')+'</span><b>'+L('Загадка '+(st.i+1)+' из 3','Riddle '+(st.i+1)+' of 3')+'</b></div>'+
      '<div class="zb0Bub"><span>'+T(q.t)+'</span></div><div class="zb0Ans">'+q.opts.map((a,i)=>'<button class="zb0A'+(hd===i?' gone':'')+'" data-a="'+i+'"'+(hd===i?' disabled':'')+'>'+(pc?'<i class="zb0K">'+(i+1)+'</i>':'<i class="zb0N">'+(i+1)+'</i>')+'<span>'+T(a)+'</span></button>').join('')+'</div>'+
      '<div class="zb0Bot">'+(hd<0&&(freeHint()||adHint())?'<button class="btn '+(freeHint()?'ghost':'ad')+'" data-k="hint">'+(freeHint()?L('🐾 Кот мурлычет (подсказка)','🐾 The cat purrs (hint)'):L('🎬 Кот мурлычет за рекламу','🎬 The cat purrs for an ad'))+(pc?' <i class="zb0K">H</i>':'')+'</button>':'')+'</div>';
    ui.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>pick(+b.dataset.a));const hb=ui.querySelector('[data-k=hint]');if(hb){hb.onclick=hint;if(hb.classList.contains('ad'))host.offer();}place();}
  function hint(){if(st.phase!=='q'||st.hint[st.i]!=null)return;const q=Q[st.i],give=()=>{const wr=[0,1,2].filter(i=>i!==q.ok);st.hint[st.i]=wr[Math.floor(o.rnd()*wr.length)];if(!o.train){S0.hn=(S0.hn|0)+1;host.touch();}
      try{SND.click();}catch(e){}ZABK.burst(st.P,st.cat.x,st.cat.y,{n:8,col:'#ffb8d0',k:'star',sp:90,g:-60,d:.9});ask();};
    if(freeHint()||o.train){give();return;}if(!adHint())return;const hb=ui.querySelector('[data-k=hint]');if(hb)hb.disabled=true;host.ad('hint').then(ok=>{if(ok&&st.phase==='q')give();else if(hb)hb.disabled=false;});}
  function pick(i){if(st.phase!=='q')return;const q=Q[st.i],ok=i===q.ok;st.phase='a';st.res=st.res||[];st.res[st.i]=ok;if(ok)st.ok++;
    ui.querySelectorAll('[data-a]').forEach(b=>{const j=+b.dataset.a;b.disabled=true;if(j===q.ok)b.classList.add('ok');else if(j===i)b.classList.add('no');});
    if(ok){st.jump=1;try{SND.coin();}catch(e){}ZABK.burst(st.P,st.cat.x,st.cat.y,{n:o.calm?6:16,col:'#ffd84a',k:'star',sp:160,g:200,d:.9});}else{try{SND.click();}catch(e){}}
    const bub=ui.querySelector('.zb0Bub');const pr=(ok?PRAISE:OOPS)[(st.i+(ok?0:1))%3];
    bub.innerHTML='<span><b class="'+(ok?'zb0Ok':'zb0No')+'">'+T(pr)+'</b>'+(ok?'':' '+L('Ответ: ','Answer: ')+'<b>'+T(q.head)+'</b>.')+'<br><small>'+T(q.x)+'</small></span>';
    const bot=ui.querySelector('.zb0Bot');bot.innerHTML='<button class="btn big" data-k="next">'+(st.i<2?L('Дальше','Next'):L('Итоги','Results'))+(pc?' <i class="zb0K">Enter</i>':'')+'</button>';
    bot.querySelector('[data-k=next]').onclick=next;place();}
  function next(){if(st.phase!=='a')return;try{SND.click();}catch(e){}st.i++;if(st.i<3){ask();return;}finish();}
  function finish(){st.phase='end';const n=st.ok;let msg='';
    if(!o.train){S0.wc=(S0.wc|0)+n;host.touch();msg=L('За неделю верных: '+Math.min(S0.wc,15)+' из 15','Correct this week: '+Math.min(S0.wc,15)+' of 15')+(S0.wg?L(' — награда недели взята',' — weekly reward taken'):'');}
    setTimeout(()=>host.done({score:n,tier:n,extra:{msg}}),o.calm?200:500);}
  /* раскладка: на широком экране — справа от кота; на узком — снизу */
  function place(){const W=host.w,H=host.h,land=W>H*1.1;ui.classList.toggle('land',land);}
  host.onResize(place);
  zabKeys(host,(k,e)=>{if(st.phase==='intro'&&(k==='Enter'||k===' ')){ask();return true;}
    if(st.phase==='q'){if(k>='1'&&k<='3'){const b=ui.querySelector('[data-a="'+(+k-1)+'"]');if(b&&!b.disabled)pick(+k-1);return true;}if(k==='h'||k==='H'||e.code==='KeyH'){hint();return true;}}
    if(st.phase==='a'&&(k==='Enter'||k===' ')){next();return true;}return false;});
  intro();place();}
/* недельная награда (ядро зовёт после начислений, не в тренировке): 15 верных → «Дуб с цепью» один раз, дальше 2 жёлудя */
function after(r,out){const z=ZB(),S0=z.g.zagadki||{};if(S0.wg||(S0.wc|0)<15)return [];S0.wg=1;S0.ts=Date.now();const a=[];
  const d=zabDecoGive(DUB);if(d)a.push(d);else{const q=zabTr('tr_luk',2,true);if(q)a.push({img:ic(q.id,64),t:'+'+q.n+' '+zabTrName(q.id)+L(' — награда недели',' — weekly reward'),big:1});}
  return a;}
function sim(o,k){const p=1/3+2/3*k,R=o.rnd||mulberry(o.seed);let n=0;for(let i=0;i<3;i++)if(R()<p)n++;return {score:n,tier:n};}
let cssOn=0;function css(){if(cssOn)return;cssOn=1;const s=document.createElement('style');s.textContent=
  '.zb0Z{position:absolute;left:0;right:0;bottom:0;top:0;display:flex;flex-direction:column;justify-content:flex-end;padding:12px 12px calc(env(safe-area-inset-bottom,0px) + 12px);pointer-events:none;font-family:inherit}'+
  '.zb0Z>*{pointer-events:auto}.zb0Z.land{left:44%;justify-content:center;padding-top:70px}'+
  '.zb0Top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 14px);left:12px;display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:14px;background:rgba(255,246,220,.94);border:3px solid #6e431f;color:#3b2412;font-size:17px;box-shadow:0 3px 0 rgba(60,30,10,.4)}'+
  '.zb0Z.land .zb0Top{left:12px}.zb0Pr{display:flex;gap:5px}.zb0Pr i{width:14px;height:14px;border-radius:50%;background:#d8c8a0;border:2px solid #8a6a3a}.zb0Pr i.cur{background:#ffd84a}.zb0Pr i.ok{background:#5ab840}.zb0Pr i.no{background:#e06a50}'+
  '.zb0Bub{position:relative;margin:0 0 12px;padding:14px 16px;border-radius:20px;background:#fffaf0;border:3px solid #6e431f;color:#2e1c0c;font-size:20px;font-weight:700;line-height:1.3;box-shadow:0 4px 0 rgba(60,30,10,.35);animation:zabRise .3s ease-out both}'+
  '.zb0Bub:before{content:"";position:absolute;top:-16px;right:26%;border:14px solid transparent;border-bottom:16px solid #6e431f;border-top:0}.zb0Bub:after{content:"";position:absolute;top:-11px;right:calc(26% + 3px);border:11px solid transparent;border-bottom:13px solid #fffaf0;border-top:0}'+
  '.zb0Z.land .zb0Bub:before,.zb0Z.land .zb0Bub:after{display:none}.zb0Bub small{display:block;margin-top:6px;font-size:15.5px;font-weight:600;color:#5a3a1a}'+
  '.zb0Ok{color:#2f7a1c}.zb0No{color:#b0381e}'+
  '.zb0Ans{display:flex;flex-direction:column;gap:9px}.zb0A{display:flex;align-items:center;gap:12px;min-height:66px;padding:8px 14px;border-radius:16px;border:3px solid #6e431f;background:linear-gradient(#fff8e4,#f0dcac);color:#2e1c0c;font:inherit;font-size:19px;font-weight:800;text-align:left;box-shadow:0 4px 0 rgba(60,30,10,.45);cursor:pointer;animation:zabRise .3s ease-out both}'+
  '.zb0A:nth-child(2){animation-delay:.06s}.zb0A:nth-child(3){animation-delay:.12s}.zb0A:active{transform:translateY(2px);box-shadow:0 2px 0 rgba(60,30,10,.45)}'+
  '@media (hover:hover){.zb0A:not(:disabled):hover{background:linear-gradient(#fffdf2,#f8e6bc);border-color:#a8701e}}'+
  '.zb0A.ok{background:linear-gradient(#e6f8d4,#b8e49a);border-color:#3a8a24}.zb0A.no{background:linear-gradient(#ffe2d8,#f4b4a0);border-color:#b0381e}.zb0A.gone{animation:none;opacity:.35;text-decoration:line-through;filter:grayscale(1)}.zb0A:disabled{cursor:default}'+
  '.zb0N{flex:none;width:30px;height:30px;border-radius:50%;background:#6e431f;color:#fff6dc;font-style:normal;display:flex;align-items:center;justify-content:center;font-size:16px}'+
  '.zb0K{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;padding:0 6px;border-radius:6px;background:linear-gradient(#fffaf0,#e6d2a8);border:2px solid #5a3a1a;color:#3a2410;font-style:normal;font-weight:900;font-size:14px;box-shadow:0 2px 0 rgba(40,20,5,.5);vertical-align:middle}'+
  '.zb0Bot{display:flex;flex-direction:column;gap:8px;margin-top:10px;min-height:10px}.zb0Bot .btn{min-height:50px}'+
  '.zb0Card{margin:auto 0;padding:16px;border-radius:20px;background:#fffaf0;border:3px solid #6e431f;color:#2e1c0c;box-shadow:0 4px 0 rgba(60,30,10,.35);text-align:center;animation:zabPop .35s cubic-bezier(.2,1.4,.4,1) both}'+
  '.zb0Card b{font-size:22px}.zb0Card p{font-size:17.5px;line-height:1.35;margin:8px 0}.zb0How{font-size:15.5px!important;color:#5a3a1a}.zb0Card .btn{width:100%;min-height:54px;margin-top:6px}'+
  '.zb0Z:not(.land) .zb0Intro{margin-bottom:6vh}'+
  '@media (max-height:660px){.zb0Bub{font-size:17.5px;padding:10px 12px}.zb0A{min-height:56px;font-size:17px}.zb0Bub small{font-size:14px}}'+
  'body.zabCalm .zb0Bub,body.zabCalm .zb0A,body.zabCalm .zb0Card{animation:none}';document.head.appendChild(s);}
ZAB_REG({id:'zagadki',num:2,n:zabN('Загадки Кота Учёного','The Learned Cat’s Riddles'),icon:'zb_i2',kind:'daily',en:false,noRec:true,run,sim,after});
})();
