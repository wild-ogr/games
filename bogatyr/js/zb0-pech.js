'use strict';
/* ================= «🎪 Забавы» №13 «Печь: вынь пирог вовремя» (BG0, 08.10.2026) =================
   Когда в печи подворья блюдо готово и игрок жмёт «Достать» — блюдо уже в узелке (ничего не теряется), а следом 10-секундная забава:
   пирог в устье румянится (бледный → золотой → тёмный → сгорел), тапни/пробел, когда он золотой. Раз в день с наградой (дальше «Достать» — как раньше);
   тренировка — с экрана «Забавы». Награда — ZAB_RW[13]: Слава по ступени, «золотой пирог» (ступень 3) → +2 % к блюду узелка на следующий поход главы.
   Ступени по отклонению от «золота»: ≤6 % — 3, ≤13 % — 2, ≤24 % — 1, иначе 0. Спокойный режим — медленнее (окно то же по доле, но больше секунд). */
(function(){
const PK=.62;   // где «золото» на шкале 0..1
function tierOf(p){const d=Math.abs(p-PK);return d<=.06?3:d<=.13?2:d<=.24?1:0;}
function scoreOf(p){return Math.max(0,Math.round(100*(1-Math.abs(p-PK)/.4)));}
function pieCol(p){const st=[[0,[240,222,170]],[.45,[236,190,110]],[PK,[226,150,52]],[.8,[150,84,30]],[1,[52,30,14]]];
  for(let i=1;i<st.length;i++)if(p<=st[i][0]){const a=st[i-1],b=st[i],u=(p-a[0])/(b[0]-a[0]);return 'rgb('+a[1].map((v,j)=>Math.round(v+(b[1][j]-v)*u)).join(',')+')';}return 'rgb(52,30,14)';}
function stove(g,cx,cy,s,p,t,calm,pull){g.save();g.translate(cx,cy);g.scale(s,s);
  ell(g,0,98,118,14,'rgba(0,0,0,.22)',{ol:false,flat:true});
  // тело печи
  rrect(g,-110,-40,220,138,10);g.fillStyle=grad(g,-20,20,140,'#f6f1e4',.15,-.14);g.fill();outline(g,'#cfc6b4',2.4);
  rrect(g,-118,-58,236,22,6);g.fillStyle=grad(g,0,-48,120,'#ece4d0',.18,-.18);g.fill();outline(g,'#cfc6b4',2);
  rrect(g,40,-150,46,94,5);g.fillStyle=grad(g,62,-100,50,'#f2ecde',.18,-.18);g.fill();outline(g,'#cfc6b4',2);rrect(g,34,-160,58,14,4);g.fillStyle='#ddd4be';g.fill();outline(g,'#cfc6b4',1.6);
  // роспись
  g.strokeStyle='rgba(40,110,190,.6)';g.lineWidth=2.2;for(const x of[-84,84]){g.beginPath();g.arc(x,10,11,0,TAU);g.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3;g.beginPath();g.moveTo(x,10);g.lineTo(x+Math.cos(a)*11,10+Math.sin(a)*11);g.stroke();}}
  g.beginPath();for(let x=-100;x<=100;x+=10){g.moveTo(x,78);g.quadraticCurveTo(x+5,70,x+10,78);}g.stroke();
  // устье
  shp(g,'#2a160c',{ol:false},[-54,-26,54,60],()=>{g.moveTo(-54,60);g.lineTo(-54,12);g.quadraticCurveTo(-54,-26,0,-26);g.quadraticCurveTo(54,-26,54,12);g.lineTo(54,60);g.closePath();});
  const fl=calm?0:Math.sin(t*9)*.08;glow(g,0,34,62*(1+fl),'#ff7a1a','#ffd27a');
  for(const [x,h,ph] of[[-30,26,0],[-12,36,1.3],[8,30,2.1],[28,24,.7]]){const hh=h*(1+(calm?0:Math.sin(t*7+ph)*.15));shp(g,'#ffb03a',{ol:false},[x-9,56-hh,x+9,56],()=>{g.moveTo(x-9,56);g.quadraticCurveTo(x-7,56-hh*.5,x,56-hh);g.quadraticCurveTo(x+7,56-hh*.5,x+9,56);g.closePath();});}
  rrect(g,-62,56,124,8,3);g.fillStyle='#6a4a32';g.fill();
  // пирог на лопате (pull 0..1 — вынимаем)
  const py=30-pull*6,pz=1+pull*.35;g.save();g.translate(0,py+pull*34);g.scale(pz,pz);
  ln(g,[0,12,0,60+pull*40],'#8a5a2e',6);ell(g,0,10,34,9,'#c8904a',{lw:1.4});
  const pc=pieCol(p);shp(g,pc,{hl:.35,dk:-.3,lw:1.6,olc:'#3a1a08'},[-26,-12,26,10],()=>{g.moveTo(-26,8);g.quadraticCurveTo(-26,-14,0,-14);g.quadraticCurveTo(26,-14,26,8);g.closePath();});
  g.strokeStyle='rgba(60,30,8,.45)';g.lineWidth=1.6;for(const x of[-10,0,10]){g.beginPath();g.moveTo(x-4,-6);g.lineTo(x+4,0);g.stroke();}shine(g,-10,-7,8,2.6,.35+.2*(p<.7?1:0));
  if(p>.85){g.fillStyle='rgba(40,40,40,'+Math.min(.5,(p-.85)*3)+')';for(let i=0;i<4;i++){g.beginPath();g.arc(-12+i*8+(calm?0:Math.sin(t*3+i)*3),-24-((t*20+i*9)%30),5+i,0,TAU);g.fill();}}
  else if(p>.45){g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;for(let i=0;i<3;i++){const x=-10+i*10,y=-20-((t*16+i*7)%14);g.beginPath();g.moveTo(x,y+8);g.quadraticCurveTo(x-3,y+4,x,y);g.quadraticCurveTo(x+3,y-4,x,y-8);g.stroke();}}
  g.restore();
  g.restore();}
function bg(g,W,H){const wl=g.createLinearGradient(0,0,0,H);wl.addColorStop(0,'#a8743e');wl.addColorStop(1,'#7a4e26');g.fillStyle=wl;g.fillRect(0,0,W,H);
  for(let y=10;y<H*.8;y+=34){g.fillStyle='rgba(255,220,160,.12)';g.fillRect(0,y,W,14);g.strokeStyle='rgba(60,30,10,.35)';g.lineWidth=2;g.beginPath();g.moveTo(0,y+30);g.lineTo(W,y+30);g.stroke();}
  const fl=g.createLinearGradient(0,H*.8,0,H);fl.addColorStop(0,'#8a5a30');fl.addColorStop(1,'#5a3a1e');g.fillStyle=fl;g.fillRect(0,H*.8,W,H*.2);
  g.strokeStyle='rgba(40,20,5,.4)';g.lineWidth=1.5;for(let x=0;x<W;x+=48){g.beginPath();g.moveTo(x,H*.8);g.lineTo(x-30,H);g.stroke();}
  // окошко
  rrect(g,W*.06,H*.08,W*.2,H*.14,6);g.fillStyle='#bfe4ff';g.fill();g.lineWidth=4;g.strokeStyle='#6a4022';g.stroke();g.beginPath();g.moveTo(W*.16,H*.08);g.lineTo(W*.16,H*.22);g.moveTo(W*.06,H*.15);g.lineTo(W*.26,H*.15);g.stroke();}
function run(host,o){const c=ZABK.canvas(host),g=c.getContext('2d'),pc=zabPC(),P=[];const dur=o.calm?9.5:7;
  const st={phase:'intro',t:0,p:0,pull:0,res:null,shake:0};
  const ui=document.createElement('div');ui.className='zb0P';host.el.appendChild(ui);css();
  function intro(){ui.innerHTML='<div class="zb0Pc"><b>'+L('Печь подворья','The homestead oven')+'</b><p>'+L('«Пирог румянится! Вынимай, когда станет золотым — не раньше и не позже.»','“The pie is browning! Take it out when it turns golden — not too early, not too late.”')+'</p><p class="zb0How">'+
    (pc?L('Вынуть — щелчок мышью или ','Take out — click or ')+'<i class="zb0K">'+L('Пробел','Space')+'</i>':L('Вынуть — тап в любом месте.','Take out — tap anywhere.'))+(o.train?'<br><b>'+L('Тренировка — без наград.','Practice — no rewards.')+'</b>':'')+'</p><button class="btn big" data-k="go">'+L('Начать','Start')+(pc?' <i class="zb0K">Enter</i>':'')+'</button></div>';
    ui.querySelector('[data-k=go]').onclick=e=>{e.stopPropagation();try{SND.click();}catch(x){}start();};}
  function start(){st.phase='bake';st.t=0;ui.innerHTML='<div class="zb0Ph">'+L('Вынимай, когда пирог золотой!','Take it out when it’s golden!')+'</div>';}
  function take(){if(st.phase!=='bake')return;st.phase='pull';st.res={p:st.p,tier:tierOf(st.p),score:scoreOf(st.p)};try{SND.chest();}catch(e){}
    const W=c.W,H=c.H;if(st.res.tier>=2)ZABK.burst(P,W/2,H*.45,{n:o.calm?8:26,col:'#ffd84a',k:'star',sp:240,g:200,d:1});
    const nm=[L('Сгорел… или сырой. Ничего, бывает!','Burnt… or raw. It happens!'),L('Съедобно!','Edible!'),L('Румяный!','Nicely browned!'),L('Золотой пирог!','A golden pie!')][st.res.tier];
    ui.innerHTML='<div class="zb0Ph big t'+st.res.tier+'">'+nm+'</div>';setTimeout(()=>{const msg=st.res.tier===3&&!o.train?L('Золотой пирог: +2 % к блюду узелка в следующем походе по главе.','Golden pie: +2% to your bundle dish on the next chapter run.'):'';host.done({score:st.res.score,tier:st.res.tier,extra:{msg}});},o.calm?900:1300);}
  ZABK.tap(c,host,()=>{if(st.phase==='bake')take();});
  ui.addEventListener('pointerdown',e=>{if(st.phase==='bake'&&!e.target.closest('button'))take();});
  zabKeys(host,k=>{if(st.phase==='intro'&&(k==='Enter'||k===' ')){start();return true;}if(st.phase==='bake'&&(k===' '||k==='Enter')){take();return true;}return false;});
  ZABK.loop(host,(dt)=>{const W=c.W,H=c.H,d=c.D,land=W>H*1.1;g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';st.t+=dt;
    if(st.phase==='bake'){st.p=Math.min(1,st.t/dur);if(st.p>=1){take();}}if(st.phase==='pull')st.pull=Math.min(1,st.pull+dt*2.2);
    bg(g,W,H);const s=land?Math.min(H/330,W/560):Math.min(W/290,H/560);const cx=W/2,cy=land?H*.5:H*.5;
    if(land)metaArt(g,'m_babka',cx-170*s,cy+70*s,s*1.25);else metaArt(g,'m_babka',W*.2,Math.min(H-50*s,cy+215*s),s*1.5);metaArt(g,'pt_bayun',cx-40*s,cy-70*s,s*1.4);metaArt(g,'pot',cx+-80*s,cy-66*s,s*1);
    stove(g,cx,cy,s,st.p,st.t,o.calm,st.pull);
    // шкала румянца
    const bw=Math.min(W*.8,420),bx=(W-bw)/2,by=cy+122*s,bh=22;const gr=g.createLinearGradient(bx,0,bx+bw,0);for(const q of[0,.45,PK,.8,1])gr.addColorStop(q,pieCol(q));
    g.fillStyle='rgba(40,20,5,.5)';rrect(g,bx-4,by-4+3,bw+8,bh+8,12);g.fill();g.fillStyle=gr;rrect(g,bx,by,bw,bh,10);g.fill();g.lineWidth=3;g.strokeStyle='#3a2410';g.stroke();
    g.strokeStyle='#ffe066';g.lineWidth=3;rrect(g,bx+bw*(PK-.06),by-3,bw*.12,bh+6,6);g.stroke();ZABK.text(g,'★',bx+bw*PK,by-14,22,{col:'#ffd84a'});
    const mx=bx+bw*st.p;g.fillStyle='#fff6dc';g.beginPath();g.moveTo(mx,by+bh+2);g.lineTo(mx-9,by+bh+16);g.lineTo(mx+9,by+bh+16);g.closePath();g.fill();g.strokeStyle='#3a2410';g.lineWidth=2;g.stroke();
    ZABK.text(g,L('бледный','pale'),bx,by+bh+30,14,{al:'left'});ZABK.text(g,L('сгорел','burnt'),bx+bw,by+bh+30,14,{al:'right'});
    if(st.phase==='bake'&&pc&&st.t<2.5)zabKeycap(g,W/2,by+bh+58,L('Пробел','Space'),30);
    ZABK.parts(g,P,dt);});
  intro();}
function sim(o,k){const R=o.rnd||mulberry(o.seed);const err=(1-k)*.32*(R()*2-1)+(R()-.5)*.08;const p=Math.max(0,Math.min(1,PK+err));return {score:scoreOf(p),tier:tierOf(p)};}
let cssOn=0;function css(){if(cssOn)return;cssOn=1;const s=document.createElement('style');s.textContent=
  '.zb0P{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:calc(env(safe-area-inset-top,0px) + 74px) 14px 14px;pointer-events:none}'+
  '.zb0P>*{pointer-events:auto}.zb0Pc{margin:auto 0;max-width:440px;padding:16px;border-radius:20px;background:#fffaf0;border:3px solid #6e431f;color:#2e1c0c;box-shadow:0 4px 0 rgba(60,30,10,.35);text-align:center;animation:zabPop .35s cubic-bezier(.2,1.4,.4,1) both}'+
  '.zb0Pc b{font-size:22px}.zb0Pc p{font-size:17.5px;line-height:1.35;margin:8px 0}.zb0Pc .zb0How{font-size:15.5px;color:#5a3a1a}.zb0Pc .btn{width:100%;min-height:54px}'+
  '.zb0Ph{align-self:center;max-width:92%;text-align:center;padding:10px 18px;border-radius:16px;background:rgba(255,246,220,.95);border:3px solid #6e431f;color:#3b2412;font-weight:900;font-size:19px;box-shadow:0 3px 0 rgba(60,30,10,.4);pointer-events:none}'+
  '.zb0Ph.big{font-size:26px;animation:zabPop .35s cubic-bezier(.2,1.4,.4,1) both}.zb0Ph.t3{background:linear-gradient(#ffe066,#f5b21a);border-color:#b0760a}.zb0Ph.t0{background:#f0d8c8}'+
  '.zb0K{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;padding:0 6px;border-radius:6px;background:linear-gradient(#fffaf0,#e6d2a8);border:2px solid #5a3a1a;color:#3a2410;font-style:normal;font-weight:900;font-size:14px;box-shadow:0 2px 0 rgba(40,20,5,.5);vertical-align:middle}'+
  'body.zabCalm .zb0Pc,body.zabCalm .zb0Ph.big{animation:none}';document.head.appendChild(s);}
ZAB_REG({id:'pech',num:13,n:zabN('Печь: вынь пирог вовремя','Oven: Take the Pie in Time'),icon:'zb_i13',kind:'kiln',run,sim,open:()=>typeof Y==='function'&&!!Y()&&!!Y().in});
/* подворье: «Достать» → блюдо в узелок (как было), следом забава — раз в день с наградой */
if(typeof yTake==='function'){const yt0=yTake;yTake=function(){const y=typeof Y==='function'?Y():null,ready=!!(y&&y.ov&&ovLeft(y)<=0);yt0.apply(this,arguments);
  try{if(!ready||typeof G!=='undefined'&&G||!zabOpen()||ZAB.cur||/[?&]bot\b/.test(location.search)&&!window.__zabBot)return;const z=ZB();if(z.d.p.pech)return;
    setTimeout(()=>{if(ZAB.cur)return;ZAB_OPEN('pech',{mode:'kiln',back:()=>{try{if(typeof openYard==='function')openYard();}catch(e){}}});},250);}catch(e){zabErr('kiln',e);}};}
})();
