'use strict';
/* OB:VIS (08.10) — вид боя. Поле «лёжа» на широком экране: та же карта, x и y меняются местами при старте боя (rotMap).
   Расстояния те же — дальность, скорость, баланс, места застав и сохранения не меняются. Вид выбирается в newBattle и держится до конца боя.
   ?rot=0|1 — принудительно (проверка), window.__rot — для бота. */
function visRot(){if(window.__rot!=null)return !!window.__rot;const q=/[?&]rot=([01])/.exec(location.search);if(q)return q[1]==='1';if(typeof SHOT!=='undefined'&&SHOT)return false;   // картинки каталога (tools/promo.js) — как были; ПК-кадры лёжа: ?shot&rot=1
  
  const W=(cv&&cv.clientWidth)||window.innerWidth,H=(cv&&cv.clientHeight)||window.innerHeight;
  return W>=H*1.25&&H>=480&&W>=760;}   // телефон «стоя» и телефон боком — как было
function rotMap(m){const T=P=>({xs:P.ys,ys:P.xs,len:P.len});
  return {cells:m.cells,spots:m.spots.map(s=>({x:s.y,y:s.x,c:s.c,r:s.r})),paths:m.paths.map(T),river:m.river,gate:{x:m.gate.y-8,y:m.gate.x},seed:m.seed,rot:1};}
// широкий экран + поле лёжа: HUD поверх поля (в крайних рядах мест под заставы нет), поле почти во всю высоту
function visWideRot(){VIEW.top=40;VIEW.bot=14;const s=Math.min(VIEW.W/WW,(VIEW.H-54)/WH,2.6);
  VIEW.hw=Math.min(VIEW.W,Math.round(WW*s+24));document.documentElement.style.setProperty('--hw',VIEW.hw+'px');}
/* OB:FIX1 (08.10) поле целиком в окне: верх самой высокой заставы (колпак мага 4-го уровня, флажок, орёл; с подскоком постройки) над верхним рядом мест
   и ворота, которые на поле «лёжа» выступают за правый край, не уходят за край окна. Зовётся из layout после обычного расчёта VIEW.s/ox/oy.
   Сверху допускаем заход под шапку боя (там лишь кнопки по углам), но не за край окна / вырез экрана. */
const VIS_TWTOP=100;   // от центра места до верха самой высокой заставы, ед. мира (t_mag_4: рисунок −79 от точки −10, подскок и растяжение ≈ +11)
function visFit(aw,ah){if(!G||!G.map||!G.map.spots||!G.map.spots.length)return;const m=G.map,st=VIEW.rot||VIEW.wide?0:(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stp'))||0);
  let my=1e9;for(const p of m.spots)my=Math.min(my,p.y);const T=Math.max(0,VIS_TWTOP-my);
  let R=0;if(m.rot&&m.gate){const g=typeof spr==='function'&&spr('gate');if(g&&g.b)R=Math.max(0,m.gate.x+(g.b.x0+g.b.w)*.8-WW+4);}
  const bot=VIEW.H-VIEW.top-ah,s=Math.min(VIEW.s,(VIEW.H-bot-st)/(WH+T),aw/(WW+R));if(s<=0)return;VIEW.s=s;
  VIEW.oy=Math.max(VIEW.top+(ah-WH*s)/2,st+T*s);VIEW.ox=Math.min((VIEW.W-WW*s)/2,VIEW.W-(WW+R)*s);}
/* кольцо и карточка заставы на маленьком экране (360×640): карточка сжимается (без описания и строки цели), а если всё равно мешает —
   кольцо отъезжает от неё (метка места .rc остаётся на месте) */
function visRingFit(p,cx,cy,R){const inf=$('info'),ring=$('ring');inf.classList.remove('tight');if(!inf.classList.contains('on')||VIEW.wide)return;
  const low=inf.classList.contains('low'),pad=48,over=()=>{const r=inf.getBoundingClientRect();return low?(cy+R+pad)-(r.top-4):(r.bottom+4)-(cy-R-pad);};
  let o=over();if(o>0&&VIEW.H<760){inf.classList.add('tight');o=over();}
  if(o>0){const ny=clamp(low?cy-o:cy+o,VIEW.top+R+30,VIEW.H-VIEW.bot-R-40);if(ny!==cy){cy=ny;ring.style.top=cy+'px';const rc=ring.querySelector('.rc');if(rc)rc.style.top=(p.y-cy)+'px';}}}
/* пёстрый фон (море, огонь, Кощей и т. п.): мелкий декор у дороги реже и приглушён цветом земли — нечисть и заставы ярче фона.
   Решается по рисункам декора главы (новые главы с такими же рисунками — сами), или флагом th.busy в CH */
const VIS_BUSY_KEYS={d_coral:1,d_shell:1,d_weed:1,d_crystal:1,d_lava:1,d_firerock:1};
function visBusy(th){if(!th)return false;if(th.busy!=null)return !!th.busy;const k=th.decor||[];let n=0;for(const x of k)if(VIS_BUSY_KEYS[x])n++;return n>0&&n/k.length>=1/6;}
const VIS_MUTE={};
function visMute(c,key,base){const id=key+'|'+base+'|'+c.width;let m=VIS_MUTE[id];if(m)return m;m=document.createElement('canvas');m.width=c.width;m.height=c.height;const g=m.getContext('2d');
  g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=base;g.globalAlpha=.3;g.fillRect(0,0,m.width,m.height);return VIS_MUTE[id]=m;}
/* деревня: сцена как у «Богатыря» (небо, солнце, облака, дальний лес, тропинки, участки с табличкой «?»), постройки — рисунки «Обороны» (BLD, VIL_POS).
   Зовётся из drawVillage (art.js) первой строкой; anim/украшения/флажки — как было */
function visVillage(cv,W,H,an){const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.height=H+'px';
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.lineJoin='round';g.lineCap='round';const hz=H*.3;
  let q=g.createLinearGradient(0,0,0,hz);q.addColorStop(0,'#6ab8ff');q.addColorStop(1,'#cfeaff');g.fillStyle=q;g.fillRect(0,0,W,hz+2);
  q=g.createRadialGradient(W*.86,H*.1,2,W*.86,H*.1,H*.26);q.addColorStop(0,'rgba(255,248,200,1)');q.addColorStop(.25,'rgba(255,236,150,.9)');q.addColorStop(1,'rgba(255,236,150,0)');g.fillStyle=q;g.fillRect(0,0,W,hz);
  g.fillStyle='#fff6c8';g.beginPath();g.arc(W*.86,H*.1,H*.055,0,TAU);g.fill();
  for(const [x,y,s] of[[.14,.09,1],[.5,.15,.75],[.33,.05,.55],[.7,.06,.5]]){const k=s*H/150;g.fillStyle='rgba(255,255,255,.9)';for(const [dx,dy,r] of[[0,0,14],[14,-4,11],[-13,2,10],[26,3,9]]){g.beginPath();g.arc(W*x+dx*k*1.5,H*y+dy*k,r*k*1.3,0,TAU);g.fill();}}
  // дальние холмы и лес по горизонту
  g.fillStyle='#86c4a4';g.beginPath();g.moveTo(0,hz+6);for(let x=0;x<=W;x+=16)g.lineTo(x,hz-6-Math.sin(x/W*7)*6-Math.sin(x/W*17)*3);g.lineTo(W,hz+6);g.fill();
  for(let x=-8;x<W+16;x+=13){const y=hz+2+Math.sin(x*.7)*2,h=11+Math.sin(x*1.3)*3;g.fillStyle=(x/13|0)%2?'#2f7a4a':'#3a8a55';g.beginPath();g.moveTo(x-7,y+4);g.lineTo(x,y-h);g.lineTo(x+7,y+4);g.fill();}
  q=g.createLinearGradient(0,hz,0,H);q.addColorStop(0,'#94d070');q.addColorStop(1,'#5aa447');g.fillStyle=q;g.fillRect(0,hz+4,W,H-hz);
  // тропинки к постройкам
  g.strokeStyle='rgba(222,192,132,.85)';g.lineWidth=Math.max(8,H*.07);g.beginPath();g.moveTo(-10,H*.78);g.quadraticCurveTo(W*.5,H*.62,W+10,H*.76);g.stroke();
  g.lineWidth=Math.max(6,H*.05);g.beginPath();g.moveTo(W*.47,H*.72);g.quadraticCurveTo(W*.44,H*.9,W*.5,H+8);g.stroke();
  // травинки
  g.strokeStyle='rgba(60,130,50,.32)';g.lineWidth=.9;const R=mulberry(7);for(let i=0;i<W*H/900;i++){const x=R()*W,y=hz+12+R()*(H-hz-12);g.beginPath();g.moveTo(x,y);g.lineTo(x-1.5,y-4);g.moveTo(x,y);g.lineTo(x+1.5,y-4);g.stroke();}
  const put=(key,x,y,sz)=>artPut(g,key,x*W,y*H,sz,dpr);   // OB:FIX1 рисунок целиком
  const plot=(x,y,s)=>{const px=x*W,py=y*H+s*.32;g.fillStyle='rgba(0,0,0,.16)';g.beginPath();g.ellipse(px,py,s*.36,s*.11,0,0,TAU);g.fill();
    for(const [dx,dy] of[[-.26,-.02],[-.1,.05],[.1,.05],[.26,-.02],[-.17,-.08],[.17,-.08]]){g.fillStyle='#a2a2aa';g.beginPath();g.ellipse(px+dx*s,py+dy*s,s*.05,s*.035,0,0,TAU);g.fill();}
    g.strokeStyle='#7a4a22';g.lineWidth=Math.max(1.6,s*.04);g.beginPath();g.moveTo(px,py);g.lineTo(px,py-s*.42);g.stroke();
    const bw=s*.3,bh=s*.17;g.fillStyle='#d8b27a';g.strokeStyle='#6a4222';g.lineWidth=1.2;g.beginPath();g.rect(px-bw/2,py-s*.5-bh/2,bw,bh);g.fill();g.stroke();
    g.fillStyle='#5a3a1a';g.font='900 '+Math.round(bh*.8)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',px,py-s*.5+.5);};
  const items=[];for(const b of BLD){const l=S.village[b.id]||0,p=VIL_POS[b.id]||[.5,.5];
    if(!l){items.push([p[1],null,p[0],.3*H,1]);continue;}
    let sz=(.26+.05*l)*H;if(an&&an.id===b.id){const k=an.q;sz*=k<.5?.4+k*1.5:1.15-.15*Math.min(1,(k-.5)*2);}items.push([p[1],b.ic,p[0],sz]);}
  for(const d of DECO)if(S.deco&&S.deco[d.id]&&d.id!=='flags'){const p=DECO_POS[d.id];items.push([p[1],'dc_'+d.id,p[0],.34*H]);}
  items.sort((a,b)=>a[0]-b[0]);for(const [y,key,x,sz,pl] of items){if(pl)plot(x,y,sz);else put(key,x,y,sz);}
  if(an&&an.id){const p=VIL_POS[an.id]||[.5,.5],cx=p[0]*W,cy=p[1]*H,k=an.q;
    for(let i=0;i<14;i++){const a=i/14*TAU+i,d=(12+k*H*.28)*(.6+(i%3)*.2),al=Math.max(0,1-k*1.1);g.globalAlpha=al;g.fillStyle=i%3?'#ffd84a':'#fff4c0';g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.6-k*10,2.4-k*1.4+(i%2),0,TAU);g.fill();}
    g.globalAlpha=Math.max(0,Math.min(1,(1-k)*2.5));if(an.txt){g.font='900 15px system-ui,sans-serif';g.textAlign='center';g.textBaseline='alphabetic';g.lineWidth=4;g.strokeStyle='rgba(40,25,10,.8)';const ty=Math.max(18,cy-H*.24-k*12),hw=g.measureText(an.txt).width/2+8,tx=Math.min(W-hw,Math.max(hw,cx));g.strokeText(an.txt,tx,ty);g.fillStyle='#ffe7a0';g.fillText(an.txt,tx,ty);}
    g.globalAlpha=1;}
  if(S.deco&&S.deco.flags){const cols=['#e8433a','#ffd84a','#2f6fd6','#3aa04a','#f47ab0'],y0=H*.12,n=Math.round(W/22);g.strokeStyle='#5a3a22';g.lineWidth=1;
    const P=t=>[W*t,y0+H*.12*4*t*(1-t)];g.beginPath();for(let i=0;i<=24;i++){const r=P(i/24);i?g.lineTo(r[0],r[1]):g.moveTo(r[0],r[1]);}g.stroke();
    for(let i=0;i<n;i++){const p0=P((i+.15)/n),p1=P((i+.85)/n),m=P((i+.5)/n);g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.lineTo(m[0],m[1]+9);g.closePath();g.fillStyle=cols[i%5];g.fill();}}
  if(!BLD.some(b=>S.village[b.id])){g.font='700 14px '+(typeof CVL!=='undefined'&&CVL?CVL.font:'sans-serif');g.textAlign='center';g.textBaseline='alphabetic';g.lineWidth=3.5;g.strokeStyle='rgba(255,250,235,.9)';
    const t=Lg('Пока пусто — построй первый дом!','Empty for now — build your first house!');g.strokeText(t,W/2,H*.95);g.fillStyle='rgba(40,30,20,.85)';g.fillText(t,W/2,H*.95);}}
