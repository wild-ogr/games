'use strict';
/* gb-MGA мини-игра №6 «Выбросили!» (покупательница кричит очереди; id 'vybrosili'). Договор — шапка js/gmg-core.js (MG0). Основа — «Номера» Выезда (vymg-nomera).
   Из окошка «выбросили» дефицит: товары едут по прилавку слева направо мимо авоськи. Хватайте то, что в списке (3 вида по 2 штуки),
   «нагрузку» (кильку в томате) и чужое не берите. Не успели — не беда (ушло очереди). Ошибка не наказывает — покупательница ворчит,
   в итоге «лишнего: N». ~28 с, без часов; спокойный режим — товары медленнее и их меньше.
   Чт — «Рыбный день»: в списке рыбное, нагрузка — кабачковая икра («икра, да не та»). Праздники (host.fest): 'halloween' — тыквы и конфеты,
   'ny' — мандарины. Звёзды: поймано ≥80 % и лишнего ≤1 → 3★; ≥50 % и ≤3 → 2★; ≥30 % → 1★.
   ПК: Пробел / Enter / ↓ — взять товар у авоськи (в жёлтой рамке); можно щелчком. Телефон — нажать товар или большую кнопку «Хватай!».
   Тексты и наборы — js/gmg-vybrosili-data.js (GMG.data.vybrosili). */
(function(){
if(typeof GMG_REG!=='function')return;
const ID='vybrosili';
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const fill=(t,c)=>String(t||'').replace(/\{(\w+)\}/g,(m,k)=>c&&c[k]!=null?c[k]:'');
const T=()=>window.GMG&&GMG.data&&GMG.data.vybrosili||{};
const pick=(a,r)=>a&&a.length?a[Math.floor(r()*a.length)%a.length]:'';
function shuffle(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const x=a[i];a[i]=a[j];a[j]=x;}return a;}
function wday(o){const d=String(o.day||0);if(d.length<8)return -1;return new Date(+d.slice(0,4),+d.slice(4,6)-1,+d.slice(6,8)).getDay();}
const DEF={usual:{list:[202,201,203,206,209,207,9,1],load:3,other:[4,5,6,8,13,14,15,17,21,22,16,19]},
  fish:{list:[2,207,200],load:22,other:[1,4,5,8,13,14,15,17,21,16,19,10]},halloween:{list:['pump',12,205],load:3,other:[4,5,8,13,14,15,17,21,22,19]},
  ny:{list:[204,205,209],load:3,other:[4,5,6,8,13,14,15,17,21,22,19]}};
function kindOf(o){const f=o.fest&&o.fest.id;if(f==='halloween'||f==='ny')return f;return wday(o)===4?'fish':'usual';}
function cfg(o){const calm=!!o.calm;return calm?{per:2,load:2,other:3,gap:2.3,cross:6.4}:{per:2,load:3,other:5,gap:1.75,cross:5};}
function nameOf(t){const D=T();if(t==='pump')return D.pump||'Тыква';try{if(window.GMG&&GMG.art&&GMG.art.name){const n=GMG.art.name(t);if(n)return n;}}catch(e){}
  try{if(typeof t==='number'&&t>=200&&typeof RARE!=='undefined'&&RARE[t-200])return RARE[t-200].n;if(typeof GOODS!=='undefined'&&GOODS[t])return GOODS[t].n;}catch(e){}return String(t);}
/* план: kind, list (3 вида), load (нагрузка), items [{t, m:1 в списке | l:1 нагрузка}] — первые два — не нагрузка, нагрузка не подряд */
function plan(o){const r=o.rnd,kind=kindOf(o),S0=(T().sets||{})[kind]||DEF[kind],c=cfg(o);
  const list=kind==='usual'?shuffle(r,S0.list).slice(0,3):S0.list.slice(0,3),load=S0.load;
  const oth=shuffle(r,S0.other.filter(t=>list.indexOf(t)<0&&t!==load));
  let it=[];list.forEach(t=>{for(let k=0;k<c.per;k++)it.push({t,m:1});});for(let k=0;k<c.load;k++)it.push({t:load,l:1});for(let k=0;k<c.other;k++)it.push({t:oth[k%oth.length]});
  for(let tr=0;tr<80;tr++){const s=shuffle(r,it);let ok=s[0].m||!s[0].l;ok=ok&&!s[0].l&&!s[1].l;
    for(let i=1;i<s.length&&ok;i++)if(s[i].l&&s[i-1].l)ok=false;
    if(ok){it=s;break;}if(tr===79)it=s;}
  return {kind,list,load,items:it,total:it.filter(x=>x.m).length,c};}
const tierOf=(got,total,w)=>{const f=total?got/total:0;return f>=.8&&w<=1?3:f>=.5&&w<=3?2:f>=.3?1:0;};
const scoreOf=(got,total,w)=>Math.max(0,Math.round(100*got/Math.max(1,total))-w*8);
function sim(o,k){k=k==null?.6:k;const P=plan(o),r=o.rnd;let got=0,w=0;
  for(const x of P.items){if(x.m){if(r()<.35+k*.62)got++;}else if(r()<(1-k)*.12)w++;}
  return {sc:scoreOf(got,P.total,w),st:tierOf(got,P.total,w)};}

/* ---------- рисунки: тыква (своя), товар через drawGood игры ---------- */
function drawPump(g,cx,by,s){const u=s/100,w=78*u,h=58*u,cy=by-h/2-2*u;g.save();
  g.fillStyle='rgba(60,40,20,.18)';g.beginPath();g.ellipse(cx,by,w*.5,5*u,0,0,Math.PI*2);g.fill();
  const seg=[[-.32,.3],[.32,.3],[-.14,.36],[.14,.36],[0,.38]];
  for(const p of seg){g.fillStyle=p[0]===0?'#f08a1c':'#e0761a';g.beginPath();g.ellipse(cx+p[0]*w,cy,p[1]*w,h/2,0,0,Math.PI*2);g.fill();g.strokeStyle='#b85a10';g.lineWidth=Math.max(1.2,1.6*u);g.stroke();}
  g.fillStyle='rgba(255,220,150,.45)';g.beginPath();g.ellipse(cx-.12*w,cy-h*.22,w*.07,h*.12,-.3,0,Math.PI*2);g.fill();
  g.fillStyle='#5d7a2a';g.beginPath();g.moveTo(cx-4*u,cy-h/2+3*u);g.lineTo(cx-2*u,cy-h/2-12*u);g.lineTo(cx+5*u,cy-h/2-13*u);g.lineTo(cx+4*u,cy-h/2+3*u);g.closePath();g.fill();
  g.restore();}
function drawItem(g,t,cx,by,s){if(t==='pump'){drawPump(g,cx,by,s);return;}try{if(window.GMG&&GMG.art&&GMG.art.good)GMG.art.good(g,t,cx,by,s);else if(typeof drawGood==='function')drawGood(g,t,cx,by,s);}catch(e){}}
function rr(g,x,y,w,h,r){g.beginPath();if(g.roundRect){g.roundRect(x,y,w,h,r);return;}g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function icon(t,px,dpr){const c=document.createElement('canvas');c.width=Math.round(px*dpr);c.height=Math.round(px*dpr);c.style.width=c.style.height=px+'px';
  const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);drawItem(g,t,px/2,px-3,px*.82);return c;}

function run(host,o){const D=T(),P=plan(o),C=P.c,fest=host.fest&&host.fest.id,kind=P.kind;
  let started=false,fin=false,t=0,spawned=0,got=0,wrong=0,missed=0,items=[],fx=[],finT=0,G=null;const have={};P.list.forEach(x=>have[x]=0);
  const intro=kind==='fish'?D.introFish:kind==='halloween'?D.introHw:kind==='ny'?D.introNy:D.intro;
  const sign=kind==='fish'?D.signFish:kind==='halloween'?D.signHw:kind==='ny'?D.signNy:D.sign;
  host.el.innerHTML='<div class="gma-wrap gma-vb'+(fest?' gma-f-'+esc(fest):'')+'"><div class="gma-say"></div>'+
    '<div class="gma-vb-list"><span class="gma-vb-lt">'+esc(D.listT||'Список:')+'</span>'+
    P.list.map((x,i)=>'<span class="gma-vb-it" data-i="'+i+'"><i></i><b>'+esc(nameOf(x))+'</b><em>0/'+C.per+'</em></span>').join('')+
    '<span class="gma-vb-it gma-vb-no"><i></i><b>'+esc((D.loadT||'Не брать:')+' '+nameOf(P.load))+'</b></span></div>'+
    '<div class="gma-vb-sc"><canvas></canvas></div>'+
    '<div class="gma-row"><button class="btn green gma-vb-go">🛍 '+esc(D.grab||'Хватай!')+(host.pc?' '+host.kc('Пробел'):'')+'</button></div></div>';
  const $=s=>host.el.querySelector(s),say=$('.gma-say'),box=$('.gma-vb-sc'),cvs=$('.gma-vb-sc canvas'),goB=$('.gma-vb-go');
  const lis=host.el.querySelectorAll('.gma-vb-it');P.list.forEach((x,i)=>{const s=lis[i].querySelector('i');s.appendChild(icon(x,40,host.dpr));});
  {const s=lis[lis.length-1].querySelector('i');s.appendChild(icon(P.load,40,host.dpr));}
  const sayB=(txt,mood)=>{say.innerHTML=host.say('babka',esc(txt),mood||'norm');};
  sayB(D.sayStart||'','norm');
  function top(){host.top('✔ '+got+' из '+P.total);}
  function upList(){P.list.forEach((x,i)=>{const e=lis[i];e.querySelector('em').textContent=have[x]+'/'+C.per;e.classList.toggle('ok',have[x]>=C.per);});}
  let W=0,H=0;
  function fit(){const w=box.clientWidth,h=box.clientHeight,d=host.dpr;if(!w||!h)return false;
    if(w!==W||h!==H||cvs.width!==Math.round(w*d)){W=w;H=h;cvs.width=Math.round(w*d);cvs.height=Math.round(h*d);cvs.style.width=w+'px';cvs.style.height=h+'px';}
    const cy=H*.8,s=Math.max(44,Math.min(H*.36,W*.17,112));G={W,H,cy,s,bag:W*.56,win:Math.min(W*.2,130)};return true;}
  function hitBox(k){return {x:k.x-G.s*.55,y:G.cy-G.s*1.05+k.y,w:G.s*1.1,h:G.s*1.1};}
  function spawn(){const p=P.items[spawned++];items.push({p,x:G.win*.55,v:(G.W-G.win*.55+G.s)/C.cross,y:0,hit:0,ok:0,bad:0,gone:0});}
  function atBag(){if(!G)return null;let b=null;for(const k of items){if(k.hit)continue;if(!b||Math.abs(k.x-G.bag)<Math.abs(b.x-G.bag))b=k;}
    return b&&Math.abs(b.x-G.bag)<G.s*.75?b:null;}
  function take(k){if(!k||k.hit||fin||!started)return;k.hit=1;const p=k.p,n=nameOf(p.t);
    if(p.m){got++;have[p.t]=(have[p.t]|0)+1;k.ok=1;try{host.snd.coin();}catch(e){}fx.push({x:k.x,y:G.cy-G.s*1.2,t:0,ok:1});
      if(got===1||Math.random()<.4)sayB(pick(D.sayOk,o.rnd),'happy');upList();}
    else{wrong++;k.bad=1;try{host.snd.bad();}catch(e){}fx.push({x:k.x,y:G.cy-G.s*1.2,t:0,ok:0});
      sayB(p.l?pick(kind==='fish'?D.sayLoadFish:D.sayLoad,o.rnd):fill(pick(D.sayWrong,o.rnd),{n}),'sad');}
    top();}
  function grab(){if(!started||fin||host.paused)return;const k=atBag();if(k)take(k);}
  host.ptr(cvs,{down:(x,y)=>{if(!started||fin||!G)return;let b=null;
    for(const k of items){if(k.hit)continue;const h=hitBox(k),pad=10;if(x>=h.x-pad&&x<=h.x+h.w+pad&&y>=h.y-pad&&y<=h.y+h.h+pad){if(!b||Math.abs(k.x-x)<Math.abs(b.x-x))b=k;}}
    if(b)take(b);}});
  goB.onclick=grab;
  host.keys(k=>{if(!started||fin)return false;if(k===' '||k==='Enter'||k==='ArrowDown'||k==='Spacebar'){grab();return true;}return false;});
  /* ---------- рисование ---------- */
  function draw(){if(!fit())return;const g=cvs.getContext('2d');g.setTransform(host.dpr,0,0,host.dpr,0,0);const {cy,s}=G;g.clearRect(0,0,W,H);
    // стена
    g.fillStyle=fest==='halloween'?'#3a3150':'#efe3cc';g.fillRect(0,0,W,H);
    g.fillStyle=fest==='halloween'?'#463c5e':'#e2d2b2';for(let y=20;y<cy;y+=24)g.fillRect(0,y,W,1);
    // гирлянда / флажки
    if(fest==='ny'){const cl=['#e53935','#fdd835','#43a047','#1e88e5'];g.strokeStyle='#2e5d32';g.lineWidth=2;g.beginPath();g.moveTo(0,10);
      for(let x=0;x<=W;x+=W/8)g.quadraticCurveTo(x+W/16,26,x+W/8,10);g.stroke();for(let i=0;i<16;i++){const x=i*W/16+W/32;g.fillStyle=cl[i%4];g.beginPath();g.arc(x,18,4.5,0,Math.PI*2);g.fill();}}
    if(fest==='halloween'){g.fillStyle='#f08a1c';for(let i=0;i<10;i++){const x=i*W/10;g.beginPath();g.moveTo(x+4,4);g.lineTo(x+W/10-4,4);g.lineTo(x+W/20,22);g.closePath();g.fill();g.fillStyle=i%2?'#f08a1c':'#7e57c2';}}
    // окошко «выбросили»
    const wx=6,ww=G.win,wy=Math.max(28,cy-s*1.9),wh=cy-wy-4;g.fillStyle='#6d4c2f';rr(g,wx-4,wy-4,ww+8,wh+8,8);g.fill();g.fillStyle='#2f2a26';g.fillRect(wx,wy,ww,wh);
    g.fillStyle='rgba(255,236,170,.25)';g.fillRect(wx,wy,ww,wh*.5);
    const fs=Math.round(Math.max(13,Math.min(18,W/26)));g.font='900 '+fs+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
    const sw=Math.min(W*.44,g.measureText(sign||'').width+24);g.save();g.translate(wx+ww*.5+sw*.22,wy-6);g.rotate(-.05);
    g.fillStyle='#fffbe8';rr(g,-sw/2,-fs*.8,sw,fs*1.6,4);g.fill();g.strokeStyle='#c62828';g.lineWidth=2;g.stroke();g.fillStyle='#c62828';g.fillText(sign||'',0,1,sw-8);g.restore();
    // прилавок-лента
    g.fillStyle='#9a6234';g.fillRect(0,cy,W,H-cy);g.fillStyle='#c48a55';g.fillRect(0,cy-6,W,8);
    g.strokeStyle='rgba(90,50,20,.35)';g.lineWidth=2;const off=host.calm?0:(t*40)%30;for(let x=-30+off;x<W;x+=30){g.beginPath();g.moveTo(x,cy+6);g.lineTo(x+12,H);g.stroke();}
    // очередь справа (руки тянутся)
    const ph=Math.min(H*.55,s*1.6);try{if(host.art&&host.art.person){host.art.person(g,'intel',W-ph*.25,cy+ph*.42,ph,0,host.calm?0:t,0);host.art.person(g,'worker',W-ph*.62,cy+ph*.5,ph*.92,0,host.calm?0:t+1,0);}}catch(e){}
    // авоська — место, где хватаем
    const pk=started&&!fin?atBag():null,bx=G.bag,bw=s*1.25;
    g.save();g.setLineDash([7,6]);g.strokeStyle=pk?'#f9a825':'rgba(90,60,30,.5)';g.lineWidth=pk?4:2.5;rr(g,bx-bw/2,cy-s*1.2,bw,s*1.25,12);g.stroke();g.restore();
    if(pk){g.fillStyle='rgba(255,213,79,.28)';rr(g,bx-bw/2,cy-s*1.2,bw,s*1.25,12);g.fill();}
    g.fillStyle='#5a3d22';g.font='800 '+Math.round(Math.max(12,Math.min(15,W/32)))+'px sans-serif';g.fillText(D.bag||'АВОСЬКА',bx,cy+Math.min(18,(H-cy)/2));
    // товары
    for(const k of items){const y=cy-3+k.y;g.save();if(k.bad){g.globalAlpha=.55;}drawItem(g,k.p.t,k.x,y,s);g.restore();
      if(k.bad){g.font='900 '+Math.round(s*.4)+'px sans-serif';g.fillStyle='#c62828';g.fillText('✖',k.x,y-s*.5);}}
    for(const f of fx){g.globalAlpha=Math.max(0,1-f.t);g.fillStyle=f.ok?'#2e7d32':'#c62828';g.font='900 '+Math.round(Math.min(26,s*.3))+'px sans-serif';g.fillText(f.ok?'+1':'✖',f.x,f.y-f.t*26);g.globalAlpha=1;}
    g.textAlign='left';}
  host.loop(dt=>{if(!G)fit();if(!started||!G){draw();return;}
    if(fin){finT+=dt;if(finT>.9&&finT<99){finT=99;finish();}draw();return;}
    t+=dt;if(spawned<P.items.length&&t>=spawned*C.gap+.3)spawn();
    for(let i=0;i<items.length;i++){const k=items[i];
      if(k.ok){if(host.calm){items.splice(i,1);i--;continue;}k.y+=dt*G.s*4;if(k.y>G.H){items.splice(i,1);i--;}continue;}
      k.x+=k.v*dt;if(k.x-G.s*.6>G.W){if(k.p.m&&!k.hit){missed++;if(missed===1)sayB(pick(D.sayMiss,o.rnd),'sad');}items.splice(i,1);i--;}}
    for(const f of fx)f.t+=dt*(host.calm?3:1.4);fx=fx.filter(f=>f.t<1);
    if(spawned>=P.items.length&&!items.length){fin=true;host.top('');}
    draw();});
  host.onResize(()=>{W=0;draw();});
  host.onQuit(()=>{fin=true;});
  function finish(){const st=tierOf(got,P.total,wrong);host.finish({sc:scoreOf(got,P.total,wrong),st,h:wrong,
    label:fill(D.label,{n:got,m:P.total})+(wrong?fill(D.labelW,{w:wrong}):'')});}
  /* бот стенда: у авоськи — решает один раз на товар */
  host.bot=k=>{if(!started||fin)return;const b=atBag();if(!b||b.bd)return;b.bd=1;if(Math.random()<(b.p.m?.35+k*.62:(1-k)*.12))take(b);};
  host.el._mga={P,started:()=>started,fin:()=>fin,stat:()=>({got,wrong,missed}),zone:()=>{const b=atBag();return b?{match:!!b.p.m,hit:!!b.hit}:null;}};
  top();upList();draw();
  host.intro({who:'babka',text:intro,hint:esc(host.pc?D.hintPC||D.hint:D.hint),btn:D.btn||'Начать'}).then(()=>{fit();started=true;sayB(D.sayGo||'','wow');});}

GMG_REG({id:ID,deps:['js/gmg-vybrosili-data.js'],run,sim,plan,draw:drawItem,
  get lines(){return T().lines||{};}});

(function(){if(document.getElementById('gma-vb-css'))return;const st=document.createElement('style');st.id='gma-vb-css';st.textContent=
'.gma-vb-list{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin:4px auto;width:calc(100% - 16px);max-width:640px;font-size:16px;line-height:1.15}'+
'.gma-vb-lt{font-weight:800;color:#5a3d22}'+
'.gma-vb-it{display:inline-flex;align-items:center;gap:4px;background:#fff8e1;border:2px solid #e0b84c;border-radius:10px;padding:2px 8px 2px 2px;min-height:44px}'+
'.gma-vb-it i{display:block;width:40px;height:40px;flex:none}.gma-vb-it canvas{display:block}.gma-vb-it b{font-weight:700;color:#3d2a14}'+
'.gma-vb-it em{font-style:normal;font-weight:800;color:#7a4a00;margin-left:2px}.gma-vb-it.ok{background:#e3f7e8;border-color:#2b8a3e}.gma-vb-it.ok em{color:#1e6b31}'+
'.gma-vb-it.gma-vb-no{background:#fdecea;border-color:#d9534f}.gma-vb-it.gma-vb-no i{position:relative}'+
'.gma-vb-it.gma-vb-no i:after{content:"";position:absolute;left:4px;right:4px;top:19px;height:3px;background:#c62828;transform:rotate(-35deg)}'+
'.gma-vb-sc{flex:1 1 auto;min-height:190px;max-height:420px;margin:4px auto;width:calc(100% - 20px);max-width:720px;border-radius:14px;overflow:hidden;position:relative;touch-action:manipulation}'+
'.gma-vb-sc canvas{display:block;position:absolute;left:0;top:0}'+
'.gma-vb .gma-row .btn{min-height:62px;font-size:20px}'+
'@media (max-height:640px){.gma-vb-sc{min-height:150px}.gma-vb-list{gap:4px;margin:2px auto}.gma-vb-it{min-height:36px;padding:1px 6px 1px 1px}.gma-vb-it i{width:32px;height:32px;overflow:hidden}.gma-vb-it canvas{transform:scale(.8);transform-origin:0 0}.gma-vb .gma-row .btn{min-height:56px}}'+
'@media (max-width:360px){.gma-vb-list{font-size:15px}.gma-vb-it i{width:32px;height:32px;overflow:hidden}.gma-vb-it canvas{transform:scale(.8);transform-origin:0 0}}';
document.head.appendChild(st);})();
(function(){if(document.getElementById('gma-css'))return;const st=document.createElement('style');st.id='gma-css';st.textContent=
'.gma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:4px 0 10px;min-height:0;overflow-y:auto;overflow-x:hidden;font-size:17px}'+
'.gma-say{margin:0 auto;width:calc(100% - 20px);max-width:560px;min-height:58px}'+
'.gma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 20px);max-width:560px}.gma-row .btn{flex:1 1 0;min-height:56px;font-size:18px;margin:0}'+
'.gma-row .btn[disabled]{opacity:.45}';document.head.appendChild(st);})();
})();
