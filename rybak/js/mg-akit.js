'use strict';
/* RB:MGA — набор рисования мини-игр потока MGA (Наживка дня, Грибы, Чистка с Васькой): js/mg-akit.js.
   Только рисунок и общие мелочи; правила игр — в js/mg-<id>.js. Глобальные функции игры (pal, paintSky, treeLine, birch, drawFish, rr, rng, SND, LOOK)
   берутся во время игры, не при загрузке файла. Всё под именем MAK, чтобы не столкнуться с оболочкой MG0 (MG, MGK…).
   MAK.cv(host,onFit)    — холст во весь host.el (retina, LOW → ≤1,25), onFit(L) при смене размера; L={W,H,u,land,d}
   MAK.loop(host,fn)     — кадры (dt=0 на паузе), стоп при выходе
   MAK.tod()             — время суток по часам игрока (утро/день/вечер/ночь), MAK.P(tod) — палитра сцены (pal('dacha'))
   MAK.yard(g,L,P,o)     — двор Петровича: небо, лес, изба с наличником, забор, яблоня, бочка, трава (рисуется один раз в кэш)
   MAK.petr(g,x,yb,s,st) — Петрович во весь рост (st={pose:'idle'|'point'|'cheer'|'talk',t,look,blink,tn})
   MAK.cat(g,x,yb,s,st)  — кот Васька сидит мордой к нам (st={k:'sit'|'crouch'|'happy'|'sleep'|'alarm',t,look,tn})
   MAK.bubble(g,x,y,txt,L,o) — облачко реплики; MAK.txt(g,s,x,y,px,o) — текст с обводкой
   частицы: MAK.burst(P,x,y,o), MAK.parts(g,P,dt); летящие значки: MAK.fly(F,{x0,y0,x1,y1,d,draw}), MAK.flies(g,F,dt)
   MAK.ui(host)          — слой DOM (стекло «Стекла и света»): intro({...})→Promise, toast(t), hide()
   MAK.art(k)            — рисунок товара из js/look.js (ART: blood/corn/dough/live/…) как Image для холста */
const MAK={
  calmF(o){return o&&o.calm;},
  dp(){try{return typeof lowDp==='function'?lowDp():Math.min(2,window.devicePixelRatio||1);}catch(e){return 1;}},
  cv(host,onFit){const c=document.createElement('canvas');c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;display:block';host.el.appendChild(c);
    const L={c,g:c.getContext('2d')};
    const hv=k=>typeof host[k]==='function'?host[k]():host[k];const fit=()=>{const W=Math.max(200,hv('w')||host.el.clientWidth||390),H=Math.max(200,hv('h')||host.el.clientHeight||700),d=MAK.dp();
      c.width=Math.round(W*d);c.height=Math.round(H*d);L.g.setTransform(d,0,0,d,0,0);Object.assign(L,{W,H,d,u:Math.min(W,H)/100,land:W>H*1.1});if(onFit)onFit(L);};
    fit();host.onResize(fit);return L;},
  loop(host,fn){if(typeof host.loop==='function'){host.loop((dt,t)=>fn(document.hidden?0:dt,t));return ()=>{};}let raf=0,last=performance.now(),dead=false;const step=now=>{if(dead)return;const dt=Math.min(.05,(now-last)/1000);last=now;
      try{fn(host.paused||document.hidden?0:dt,now/1000);}catch(e){console.error(e);dead=true;return;}raf=requestAnimationFrame(step);};
    raf=requestAnimationFrame(step);const stop=()=>{dead=true;cancelAnimationFrame(raf);};if(host.onQuit)host.onQuit(stop);return stop;},
  tod(){const q=/[?&]tod=(morning|day|evening|night)/.exec(location.search);if(q)return q[1];let h=12;try{h=hourNow();}catch(e){h=new Date().getHours();}
    return h>=5&&h<10?'morning':h<17&&h>=10?'day':h>=17&&h<21?'evening':'night';},
  P(tod){try{return pal('dacha',tod,'sun');}catch(e){return {top:'#4d93d9',bot:'#cde9f7',li:1,tint:c=>c,far:c=>c,tod,wx:'sun',look:'dacha'};}},
  R(seed){try{return rng(seed);}catch(e){let s=seed>>>0||1;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};}},
  font(px,w){return (w||600)+' '+Math.round(px)+'px LkGolos,-apple-system,"Segoe UI",Roboto,sans-serif';},
  txt(g,s,x,y,px,o){o=o||{};g.font=MAK.font(px,o.w);g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';g.lineJoin='round';
    if(o.ol!==false){g.lineWidth=o.lw||Math.max(3,px*.2);g.strokeStyle=o.olc||'rgba(18,28,38,.85)';g.strokeText(s,x,y);}g.fillStyle=o.col||'#fff';g.fillText(s,x,y);},
  ease:{out:t=>1-Math.pow(1-t,3),back:t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);},io:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},
  lerp:(a,b,t)=>a+(b-a)*t,
  snd(k,a){try{if(typeof SND!=='undefined'&&SND[k])SND[k](a);}catch(e){}},
  buzz(ms,o){if(o&&o.calm)return;try{if(typeof buzz==='function')buzz(ms);}catch(e){}},
  /* RB:MGPC управление на ПК (договор ядра: host.pc/keys/kbd, MG.kc/MG.keycap) */
  kc(l){try{return MG.kc(l);}catch(e){return '';}},
  keycap(g,x,y,l,px){try{MG.keycap(g,x,y,l,px);}catch(e){}},
  // текст «как играть» для мыши: коснись → щёлкни, tap → click (только на ПК)
  pcw(host,s){if(!host||!host.pc)return s;return String(s).replace(/Коснись/g,'Щёлкни').replace(/коснись/g,'щёлкни').replace(/\bTap\b/g,'Click').replace(/\btap\b/g,'click');},
  // номера-клавиши 1…9 целям, которые можно взять сейчас: it.kk (свободный наименьший); ушедшие цели номер отдают
  slots(arr,ok){const used={};for(const it of arr){if(it.kk&&ok(it))used[it.kk]=1;else it.kk=0;}
    for(const it of arr){if(it.kk||!ok(it))continue;let n=1;while(used[n]&&n<9)n++;if(!used[n]){it.kk=n;used[n]=1;}}},
  // курсор-рука над тем, что можно щёлкнуть (мышь); на телефоне ничего не делает
  cur(c,on){const v=on?'pointer':'';if(c.style.cursor!==v)c.style.cursor=v;},
  /* ---------- рисунки товаров из look.js ---------- */
  IMG:{},
  art(k){if(MAK.IMG[k])return MAK.IMG[k];let s='';try{s=window.LOOK&&LOOK.art?LOOK.art(k):'';}catch(e){}if(!s)return null;
    if(s.indexOf('xmlns')<0)s=s.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);return MAK.IMG[k]=im;},
  artUrl(k){let s='';try{s=window.LOOK&&LOOK.art?LOOK.art(k):'';}catch(e){}if(!s)return '';if(s.indexOf('xmlns')<0)s=s.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);},
  /* ---------- частицы ---------- */
  burst(P,x,y,o){o=o||{};const n=o.n||10;for(let i=0;i<n&&P.length<240;i++){const a=(o.a0!=null?o.a0:0)+Math.random()*(o.arc||Math.PI*2),v=(o.sp||160)*(.4+Math.random()*.8);
    P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,d:(o.d||.6)*(.7+Math.random()*.6),c:Array.isArray(o.col)?o.col[i%o.col.length]:o.col||'#ffe27a',s:(o.s||4)*(.6+Math.random()*.8),g:o.g==null?380:o.g,k:o.k||'dot',r:Math.random()*6});}},
  parts(g,P,dt){for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;if(p.t>=p.d){P.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.vx*=.985;
    const a=1-p.t/p.d;g.globalAlpha=Math.min(1,a*1.4);g.fillStyle=p.c;
    if(p.k==='star'){g.beginPath();for(let j=0;j<10;j++){const r=j%2?p.s*.42:p.s,an=-Math.PI/2+j*Math.PI/5+p.t*3;g.lineTo(p.x+Math.cos(an)*r,p.y+Math.sin(an)*r);}g.closePath();g.fill();}
    else if(p.k==='drop'){g.beginPath();g.ellipse(p.x,p.y,p.s*.55,p.s,Math.atan2(p.vy,p.vx)+Math.PI/2,0,7);g.fill();}
    else if(p.k==='ring'){g.strokeStyle=p.c;g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,p.s*(1+p.t/p.d*3),p.s*.4*(1+p.t/p.d*3),0,0,7);g.stroke();}
    else if(p.k==='leaf'){g.save();g.translate(p.x,p.y);g.rotate(p.r+p.t*4);g.beginPath();g.ellipse(0,0,p.s,p.s*.45,0,0,7);g.fill();g.restore();}
    else if(p.k==='txt'){MAK.txt(g,p.s2,p.x,p.y,p.s,{col:p.c});}
    else{g.beginPath();g.arc(p.x,p.y,p.s*(.5+a*.5),0,7);g.fill();}}g.globalAlpha=1;},
  pop(P,x,y,s,px,col){P.push({x,y,vx:0,vy:-px*2.2,t:0,d:.9,c:col||'#fff4c2',s:px,s2:s,g:px*2.5,k:'txt'});},
  /* летящие предметы по дуге: draw(g,x,y,k) где k — 0..1 */
  fly(F,o){F.push(Object.assign({t:0,d:.55,h:60},o));},
  flies(g,F,dt){for(let i=F.length-1;i>=0;i--){const f=F[i];f.t+=dt;const k=Math.min(1,f.t/f.d),e=MAK.ease.io(k),x=MAK.lerp(f.x0,f.x1,e),y=MAK.lerp(f.y0,f.y1,e)-Math.sin(k*Math.PI)*f.h;
    f.draw(g,x,y,k);if(k>=1){F.splice(i,1);if(f.end)f.end();}}},
  /* ---------- облачко реплики ---------- */
  bubble(g,x,y,txt,L,o){o=o||{};const px=Math.round(Math.max(17,Math.min(22,L.u*4.6))),pad=px*.7,maxW=Math.min(L.W*.7,px*16);g.font=MAK.font(px,600);
    const words=String(txt).split(' '),lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(g.measureText(t).width>maxW&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);
    const tw=Math.max(...lines.map(l=>g.measureText(l).width)),bw=tw+pad*2,lh=px*1.25,bh=lines.length*lh+pad*1.3+(o.who?px*1.1:0);
    let bx=x-bw*(o.ax==null?.5:o.ax),by=y-bh-px*.9;bx=Math.max(8,Math.min(L.W-bw-8,bx));if(by<8)by=8;
    const a=o.a==null?1:o.a;g.save();g.globalAlpha=a;
    g.fillStyle='rgba(16,26,36,.78)';rr(g,bx,by,bw,bh,px*.8);g.fill();g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1.2;g.stroke();
    const tx=Math.max(bx+px,Math.min(bx+bw-px,x));g.fillStyle='rgba(16,26,36,.78)';g.beginPath();g.moveTo(tx-px*.5,by+bh-1);g.lineTo(tx+(o.tail||0)*px,by+bh+px*.8);g.lineTo(tx+px*.5,by+bh-1);g.fill();
    let ty=by+pad*.65+lh/2;if(o.who){MAK.txt(g,o.who,bx+pad,ty,px*.92,{al:'left',col:'#ffd27a',ol:false});ty+=px*1.1;}
    for(const l of lines){MAK.txt(g,l,bx+pad,ty,px,{al:'left',col:'#fff',ol:false});ty+=lh;}g.restore();},
  /* ---------- двор Петровича (кэш) ---------- */
  yard(L,P,o){o=o||{};const key=[L.W,L.H,P.tod,o.ground||0,o.hz||0,o.house==null?1:o.house].join('|');if(MAK._yk===key&&MAK._yc)return MAK._yc;
    const d=L.d,W=L.W,H=L.H,c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);const g=c.getContext('2d');g.scale(d,d);
    const u=L.u,hz=o.hz||H*(L.land?.42:.3),gy=o.ground||H*(L.land?.62:.46),tn=P.tint,R=MAK.R(77),night=P.tod==='night';
    try{paintSky(g,W,H,hz,P,MAK.R(5));}catch(e){const sg=g.createLinearGradient(0,0,0,hz);sg.addColorStop(0,P.top);sg.addColorStop(1,P.bot);g.fillStyle=sg;g.fillRect(0,0,W,hz);}
    // облака (мягкие, как на рыбалке)
    {const CR=MAK.R(19),base=night?'#3a4466':P.tod==='evening'?'#f3c2a4':'#ffffff';for(let i=0;i<(L.land?5:4);i++){const w=u*(16+CR()*18),h=w*.4,x=CR()*W,y=hz*(.12+CR()*.5);
      for(let k=0;k<7;k++){const xx=x+(CR()-.5)*w,yy=y+(CR()-.5)*h*.6,r=h*(.45+CR()*.4);const gr=g.createRadialGradient(xx,yy,1,xx,yy,r);gr.addColorStop(0,rgba(base,night?.5:.85));gr.addColorStop(1,rgba(base,0));g.fillStyle=gr;g.fillRect(xx-r,yy-r,r*2,r*2);}}}
    // дальний лес и берёзы
    try{treeLine(g,W,hz-u*3,u*5,u*6,P.far('#3d6b45'),R);treeLine(g,W,hz,u*2.5,u*4,P.far('#2e5b34'),R);
      for(let i=0;i<4;i++)birch(g,W*(.08+i*.28)+R()*u*4,hz+u*.5,u*(12+R()*6),P.far('#f0ede6'),P.far(i%2?'#c9a03a':'#d8b04a'),R);}catch(e){}
    // земля двора
    const gg=g.createLinearGradient(0,hz,0,H);gg.addColorStop(0,tn('#7ea24a'));gg.addColorStop(.5,tn('#5d8a38'));gg.addColorStop(1,tn('#3d6526'));g.fillStyle=gg;g.fillRect(0,hz-1,W,H-hz+1);
    // тропинка к калитке
    g.fillStyle=tn('#a88a5a');g.beginPath();g.moveTo(W*.42,hz+u*1);g.quadraticCurveTo(W*.5,gy*.92,W*.3,H);g.lineTo(W*.7,H);g.quadraticCurveTo(W*.62,gy*.92,W*.5,hz+u*1);g.fill();
    // забор (штакетник) по горизонту
    const fy=hz+u*1.2,fh=u*(L.land?7:6.2);g.fillStyle=tn('#8a6a44');g.fillRect(0,fy-fh*.75,W,u*.7);g.fillRect(0,fy-fh*.3,W,u*.7);
    for(let x=-u;x<W+u;x+=u*2.2){const sh=fh*(.95+((x/u|0)%3)*.04);g.fillStyle=tn(((x/u/2.2|0)%2)?'#a4825a':'#9a7a52');g.beginPath();g.moveTo(x,fy);g.lineTo(x,fy-sh);g.lineTo(x+u*.7,fy-sh-u*.8);g.lineTo(x+u*1.4,fy-sh);g.lineTo(x+u*1.4,fy);g.fill();}
    g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,fy,W,u*.8);
    // яблоня справа
    const ax=W*(L.land?.86:.84),ay=gy+u*2,ah=Math.min(H*.42,u*(L.land?44:40));
    g.fillStyle=tn('#5a4030');g.beginPath();g.moveTo(ax-u*1.6,ay);g.quadraticCurveTo(ax-u*.6,ay-ah*.4,ax-u*1.2,ay-ah*.62);g.lineTo(ax+u*1.2,ay-ah*.62);g.quadraticCurveTo(ax+u*.4,ay-ah*.4,ax+u*1.8,ay);g.fill();
    g.strokeStyle=tn('#5a4030');g.lineCap='round';g.lineWidth=u*1.1;g.beginPath();g.moveTo(ax,ay-ah*.55);g.quadraticCurveTo(ax-u*6,ay-ah*.7,ax-u*9,ay-ah*.78);g.moveTo(ax,ay-ah*.58);g.quadraticCurveTo(ax+u*5,ay-ah*.72,ax+u*8,ay-ah*.85);g.stroke();
    const cr=[[0,-.84,13],[-8,-.76,10],[8,-.8,10],[-4,-.95,9],[5,-.98,9],[-11,-.66,7],[11,-.68,7],[0,-.7,9]];
    for(const k of [0,1]){for(const [dx,dy,r] of cr){g.fillStyle=k?tn(['#6a9a3e','#7aa848','#5c8c36'][(dx+20)%3]):tn('#3f6a2a');g.beginPath();g.arc(ax+dx*u+(k?-u*.6:0),ay+dy*ah+(k?-u*.6:u*.4),r*u*(k?.92:1),0,7);g.fill();}}
    const AR=MAK.R(31);for(let i=0;i<14;i++){const a=AR()*7,r=AR()*11*u,x=ax+Math.cos(a)*r,y=ay-ah*.82+Math.sin(a)*r*.75;g.fillStyle=tn(AR()<.3?'#e8b030':'#d0402a');g.beginPath();g.arc(x,y,u*1.05,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(x-u*.35,y-u*.35,u*.3,0,7);g.fill();}
    // падалица под яблоней
    for(let i=0;i<4;i++){g.fillStyle=tn('#c8402a');g.beginPath();g.ellipse(ax-u*6+i*u*3.5,ay+u*.5+(i%2)*u,u*1,u*.8,0,0,7);g.fill();}
    // изба слева с наличником
    if(o.house!==0){const hx=L.land?W*.02:-u*6,hw=L.land?W*.22:W*.4,hb=gy+u*3,hh=Math.min(H*.3,u*(L.land?34:30)),ht=hb-hh;
      for(let i=0;i<9;i++){const y=ht+i*hh/9;g.fillStyle=tn(i%2?'#8a5e36':'#7a5230');rr(g,hx,y,hw,hh/9+1,hh/18);g.fill();g.fillStyle='rgba(0,0,0,.15)';g.fillRect(hx,y+hh/9-u*.5,hw,u*.5);
        g.fillStyle=tn('#a87a4a');g.beginPath();g.arc(hx+hw,y+hh/18,hh/18,0,7);g.fill();g.fillStyle=tn('#6a4426');g.beginPath();g.arc(hx+hw,y+hh/18,hh/40,0,7);g.fill();}
      // крыша
      g.fillStyle=tn('#5a6a72');g.beginPath();g.moveTo(hx-u*3,ht+u*.5);g.lineTo(hx+hw+u*4,ht+u*.5);g.lineTo(hx+hw*.5,ht-hh*.5);g.closePath();g.fill();
      g.fillStyle=tn('#6e7e86');g.beginPath();g.moveTo(hx-u*3,ht+u*.5);g.lineTo(hx+hw+u*4,ht+u*.5);g.lineTo(hx+hw+u*3,ht-u*1.2);g.lineTo(hx-u*2,ht-u*1.2);g.fill();
      // окно с наличником
      const wx=hx+hw*.52,wy=ht+hh*.42,ww=Math.min(hw*.36,u*11),wh=ww*1.15;MAK._win={x:wx,y:wy,w:ww,h:wh};
      g.fillStyle=tn('#f2f0ea');g.beginPath();g.moveTo(wx-ww*.75,wy-wh*.62);g.quadraticCurveTo(wx,wy-wh*1.05,wx+ww*.75,wy-wh*.62);g.lineTo(wx+ww*.75,wy-wh*.5);g.lineTo(wx-ww*.75,wy-wh*.5);g.fill();
      g.fillStyle=tn('#3f78b0');g.beginPath();g.arc(wx,wy-wh*.62,ww*.12,0,7);g.fill();
      g.fillStyle=tn('#f2f0ea');g.fillRect(wx-ww*.7,wy-wh*.52,ww*1.4,wh*1.08);g.fillRect(wx-ww*.78,wy+wh*.52,ww*1.56,wh*.12);
      g.fillStyle=tn('#3f78b0');g.fillRect(wx-ww*.6,wy-wh*.44,ww*1.2,wh*.93);
      const lit=night||P.tod==='evening';
      const glass=g.createLinearGradient(0,wy-wh*.4,0,wy+wh*.45);if(lit){glass.addColorStop(0,'#ffe9a8');glass.addColorStop(1,'#ffb84e');}else{glass.addColorStop(0,tn('#bfe0f0'));glass.addColorStop(1,tn('#5a7f98'));}
      g.fillStyle=glass;g.fillRect(wx-ww*.5,wy-wh*.38,ww,wh*.8);g.fillStyle=tn('#f2f0ea');g.fillRect(wx-ww*.04,wy-wh*.38,ww*.08,wh*.8);g.fillRect(wx-ww*.5,wy-wh*.04,ww,ww*.07);
      if(!lit){g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(wx-ww*.45,wy-wh*.3);g.lineTo(wx-ww*.2,wy-wh*.3);g.lineTo(wx-ww*.42,wy-wh*.08);g.fill();}
      // занавески
      g.fillStyle=tn('#e8d0c0');g.beginPath();g.moveTo(wx-ww*.5,wy-wh*.38);g.quadraticCurveTo(wx-ww*.3,wy,wx-ww*.46,wy+wh*.42);g.lineTo(wx-ww*.5,wy+wh*.42);g.fill();
      g.beginPath();g.moveTo(wx+ww*.5,wy-wh*.38);g.quadraticCurveTo(wx+ww*.3,wy,wx+ww*.46,wy+wh*.42);g.lineTo(wx+ww*.5,wy+wh*.42);g.fill();
      // герань на окне
      g.fillStyle=tn('#b0603a');g.fillRect(wx+ww*.12,wy+wh*.3,ww*.22,wh*.12);g.fillStyle=tn('#4f8a3a');g.beginPath();g.arc(wx+ww*.23,wy+wh*.24,ww*.13,0,7);g.fill();g.fillStyle='#e0405a';g.beginPath();g.arc(wx+ww*.2,wy+wh*.17,ww*.06,0,7);g.arc(wx+ww*.3,wy+wh*.22,ww*.05,0,7);g.fill();
      if(lit){const gl=g.createRadialGradient(wx,wy,ww*.3,wx,wy,ww*3);gl.addColorStop(0,'rgba(255,200,110,.35)');gl.addColorStop(1,'rgba(255,200,110,0)');g.fillStyle=gl;g.fillRect(wx-ww*3,wy-ww*3,ww*6,ww*6);}
      // бочка у угла
      const bx=hx+hw+u*(L.land?4:3),bh2=u*(L.land?12:10),bw2=bh2*.78,bb=gy+u*3.5;g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(bx,bb,bw2*.6,u*1.2,0,0,7);g.fill();
      const bgr=g.createLinearGradient(bx-bw2/2,0,bx+bw2/2,0);bgr.addColorStop(0,tn('#6a4426'));bgr.addColorStop(.45,tn('#a8743e'));bgr.addColorStop(1,tn('#5a3a20'));g.fillStyle=bgr;
      g.beginPath();g.moveTo(bx-bw2*.45,bb-bh2);g.quadraticCurveTo(bx-bw2*.58,bb-bh2/2,bx-bw2*.45,bb);g.lineTo(bx+bw2*.45,bb);g.quadraticCurveTo(bx+bw2*.58,bb-bh2/2,bx+bw2*.45,bb-bh2);g.closePath();g.fill();
      g.strokeStyle=tn('#3a3a3a');g.lineWidth=u*.7;for(const k of [.18,.82]){g.beginPath();g.moveTo(bx-bw2*.53,bb-bh2*k);g.quadraticCurveTo(bx,bb-bh2*k+u*.8,bx+bw2*.53,bb-bh2*k);g.stroke();}
      g.fillStyle=tn('#2a4a5a');g.beginPath();g.ellipse(bx,bb-bh2,bw2*.45,u*1.3,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(bx-bw2*.1,bb-bh2,bw2*.25,u*.5,0,0,7);g.fill();}
    // трава кустиками
    g.strokeStyle=tn('#8ab650');g.lineWidth=Math.max(1,u*.3);g.beginPath();for(let i=0;i<160;i++){const x=R()*W,y=hz+u*2+Math.pow(R(),.7)*(H-hz);g.moveTo(x,y);g.lineTo(x+(R()-.5)*u*1.6,y-u*(1+R()*1.6));}g.stroke();
    // одуванчики/ромашки
    for(let i=0;i<14;i++){const x=R()*W,y=gy+R()*(H-gy);g.fillStyle=R()<.5?'#fff':'#ffd84a';g.beginPath();g.arc(x,y,u*.45,0,7);g.fill();}
    // свет и виньетка
    const vg=g.createRadialGradient(W/2,H*.45,Math.min(W,H)*.3,W/2,H*.5,Math.max(W,H)*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,night?'rgba(5,10,30,.55)':'rgba(20,20,10,.28)');g.fillStyle=vg;g.fillRect(0,0,W,H);
    if(night){g.fillStyle='rgba(20,30,70,.25)';g.fillRect(0,0,W,H);}
    MAK._yk=key;MAK._yc=c;return c;},
  /* ---------- берег пруда у дачи (кэш): небо и дальний берег как на рыбалке (paintBg), ближний берег, мостки слева ---------- */
  shore(L,P,o){o=o||{};const key=['sh',L.W,L.H,P.tod,o.hz,o.gy,o.px,o.py].join('|');if(MAK._yk===key&&MAK._yc)return MAK._yc;
    const d=L.d,W=L.W,H=L.H,u=L.u,c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);const g=c.getContext('2d');g.scale(d,d);const tn=P.tint,R=MAK.R(55),hz=o.hz,gy=o.gy;
    try{paintBg(g,W,H,{hz},0,P,true);}catch(e){g.fillStyle=P.top;g.fillRect(0,0,W,H);}
    // мягкое мелководье у ближнего берега: видно дно
    const sb=g.createLinearGradient(0,gy-H*.16,0,gy);sb.addColorStop(0,'rgba(170,150,100,0)');sb.addColorStop(1,rgba(tn('#a89a70'),.55));g.fillStyle=sb;g.fillRect(0,gy-H*.16,W,H*.16);
    for(let i=0;i<40;i++){const x=R()*W,y=gy-R()*H*.1;g.fillStyle=rgba(tn(['#8a8a78','#a49a80','#6a7468'][i%3]),.45);g.beginPath();g.ellipse(x,y,u*(.8+R()*1.6),u*(.4+R()*.8),0,0,7);g.fill();}
    // мостки: настил в перспективе от левого края к воде
    const x0=-u*4,x1=o.px,y1=o.py,wd=u*(L.land?9:12);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(x0,gy+u*2);g.lineTo(x1+wd*.5,y1+u*1.6);g.lineTo(x1+wd*.5,y1+u*3.5);g.lineTo(x0,gy+u*8);g.fill();
    g.fillStyle=tn('#4a3424');for(let k=0;k<=4;k++){const t=k/4,x=MAK.lerp(x0+wd,x1,t),y=MAK.lerp(gy,y1,t);g.fillRect(x-u*.6,y,u*1.2,u*(6-t*3.5));g.fillRect(x+wd*(1-t*.5)*.9-u*.6,y-u*.5,u*1.2,u*(6-t*3.5));}
    const steps=14;for(let k=0;k<steps;k++){const t0=k/steps,t1=(k+1)/steps,ax=MAK.lerp(x0,x1,t0),ay=MAK.lerp(gy,y1,t0),bx=MAK.lerp(x0,x1,t1),by=MAK.lerp(gy,y1,t1),w0=wd*(1.6-t0*.9),w1=wd*(1.6-t1*.9);
      g.fillStyle=tn(k%2?'#a07850':'#8e6842');g.beginPath();g.moveTo(ax,ay);g.lineTo(ax+w0,ay-u*.6*(1-t0));g.lineTo(bx+w1,by-u*.6*(1-t1));g.lineTo(bx,by);g.closePath();g.fill();g.strokeStyle='rgba(50,30,15,.35)';g.lineWidth=1;g.stroke();}
    // кувшинки
    for(let i=0;i<5;i++){const x=W*(.55+R()*.4),y=hz+(gy-hz)*(.15+R()*.3),r=u*(1.6+R()*1.2)*(.6+(y-hz)/(gy-hz));g.fillStyle=tn('#3f7a3a');g.beginPath();g.ellipse(x,y,r,r*.4,0,.3,Math.PI*2-.1);g.lineTo(x,y);g.fill();
      if(i%2===0){g.fillStyle='#fff';g.beginPath();g.ellipse(x+r*.2,y-r*.15,r*.35,r*.2,0,0,7);g.fill();g.fillStyle='#ffd84a';g.beginPath();g.arc(x+r*.2,y-r*.18,r*.1,0,7);g.fill();}}
    // ближний берег
    const gg=g.createLinearGradient(0,gy,0,H);gg.addColorStop(0,tn('#6a9a42'));gg.addColorStop(1,tn('#3c6526'));g.fillStyle=tn('#8a7a4a');g.beginPath();g.moveTo(-5,gy+u);for(let x=0;x<=W+10;x+=W/12)g.lineTo(x,gy-u*.3+Math.sin(x*.05)*u*.8);g.lineTo(W+5,H);g.lineTo(-5,H);g.fill();
    g.fillStyle=gg;g.beginPath();g.moveTo(-5,gy+u*2);for(let x=0;x<=W+10;x+=W/16)g.lineTo(x,gy+u*1.4+Math.sin(x*.07+2)*u);g.lineTo(W+5,H);g.lineTo(-5,H);g.fill();
    g.strokeStyle=tn('#86b050');g.lineWidth=Math.max(1,u*.35);g.beginPath();for(let i=0;i<120;i++){const x=R()*W,y=gy+u*2+R()*(H-gy);g.moveTo(x,y);g.lineTo(x+(R()-.5)*u*2,y-u*(1.2+R()*2));}g.stroke();
    // камыш по краям
    g.lineCap='round';for(let i=0;i<22;i++){const left=i<8,x=left?W*(.0+R()*.06):W*(.9+R()*.12),h=u*(12+R()*14),by=gy+u*(1+R()*2);g.strokeStyle=tn('#4d6a2a');g.lineWidth=Math.max(1,u*.4);g.beginPath();g.moveTo(x,by);g.quadraticCurveTo(x,by-h*.6,x+(R()-.5)*u*3,by-h);g.stroke();
      if(i%3===0){g.fillStyle=tn('#6a4a2a');g.beginPath();g.ellipse(x+(R()-.5)*u,by-h*.9,u*.6,u*2,0,0,7);g.fill();}}
    const vg=g.createRadialGradient(W/2,H*.5,Math.min(W,H)*.35,W/2,H*.5,Math.max(W,H)*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,P.tod==='night'?'rgba(5,10,30,.55)':'rgba(20,20,10,.25)');g.fillStyle=vg;g.fillRect(0,0,W,H);
    MAK._win=null;MAK._yk=key;MAK._yc=c;return c;},
  /* ---------- опушка у пруда (кэш): пруд с дальним берегом, осенняя подстилка, берёзы, пень, мох ---------- */
  forest(L,P,o){o=o||{};const key=['fo',L.W,L.H,P.tod,o.hz,o.gy].join('|');if(MAK._yk===key&&MAK._yc)return MAK._yc;
    const d=L.d,W=L.W,H=L.H,u=L.u,c=document.createElement('canvas');c.width=Math.round(W*d);c.height=Math.round(H*d);const g=c.getContext('2d');g.scale(d,d);const tn=P.tint,R=MAK.R(63),hz=o.hz,gy=o.gy;
    try{paintBg(g,W,H,{hz},1,P,true);}catch(e){g.fillStyle=P.top;g.fillRect(0,0,W,H);}
    // берег-коса
    g.fillStyle=tn('#8a7a4a');g.beginPath();g.moveTo(-5,gy-u*1.5);for(let x=0;x<=W+10;x+=W/10)g.lineTo(x,gy-u*2+Math.sin(x*.03)*u);g.lineTo(W+5,H);g.lineTo(-5,H);g.fill();
    const gg=g.createLinearGradient(0,gy,0,H);gg.addColorStop(0,tn('#7a7a3a'));gg.addColorStop(.4,tn('#6a5a2e'));gg.addColorStop(1,tn('#4a3a1e'));g.fillStyle=gg;g.beginPath();g.moveTo(-5,gy);for(let x=0;x<=W+10;x+=W/14)g.lineTo(x,gy-u*.6+Math.sin(x*.06+1)*u*.8);g.lineTo(W+5,H);g.lineTo(-5,H);g.fill();
    // мох и трава пятнами
    for(let i=0;i<18;i++){const x=R()*W,y=gy+R()*(H-gy),r=u*(4+R()*7);const mg=g.createRadialGradient(x,y,1,x,y,r);mg.addColorStop(0,rgba(tn('#6a8a32'),.7));mg.addColorStop(1,rgba(tn('#6a8a32'),0));g.fillStyle=mg;g.fillRect(x-r,y-r,r*2,r*2);}
    g.strokeStyle=tn('#8aa84a');g.lineWidth=Math.max(1,u*.3);g.beginPath();for(let i=0;i<90;i++){const x=R()*W,y=gy+u+R()*(H-gy);g.moveTo(x,y);g.lineTo(x+(R()-.5)*u*2,y-u*(1+R()*2));}g.stroke();
    // кочки травы
    for(let i=0;i<(L.land?40:30);i++){const y=gy+u*2+Math.pow(R(),.9)*(H-gy),k=.7+(y-gy)/(H-gy)*1.6,x=R()*W;g.strokeStyle=tn(R()<.5?'#7a9a3a':'#9aa848');g.lineWidth=Math.max(1,u*.35*k);g.lineCap='round';
      for(let b=0;b<7;b++){const a=-Math.PI/2+(b-3)*.22+(R()-.5)*.2,h=u*(2.5+R()*2.5)*k;g.beginPath();g.moveTo(x+(b-3)*u*.25*k,y);g.quadraticCurveTo(x+Math.cos(a)*h*.4,y+Math.sin(a)*h*.6,x+Math.cos(a)*h,y+Math.sin(a)*h);g.stroke();}}
    // папоротник по краям
    const fern=(x,y,sc,dir)=>{g.strokeStyle=tn('#4f7a2a');g.fillStyle=tn('#5f8a32');for(let f=0;f<5;f++){const a=-Math.PI/2+dir*(.3+f*.28),len=u*14*sc*(1-f*.1);g.lineWidth=u*.35*sc;g.beginPath();g.moveTo(x,y);const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;g.quadraticCurveTo(x+Math.cos(a-.3*dir)*len*.5,y+Math.sin(a-.3*dir)*len*.5,ex,ey);g.stroke();
      for(let l=1;l<9;l++){const t=l/9,px=x+(ex-x)*t,py=y+(ey-y)*t-Math.sin(t*Math.PI)*len*.08,lw=u*2.2*sc*(1-t*.8);g.beginPath();g.ellipse(px,py,lw,lw*.32,a+1.3,0,7);g.fill();g.beginPath();g.ellipse(px,py,lw,lw*.32,a-1.3,0,7);g.fill();}}};
    fern(W*.02,H*.99,L.land?1.3:1.1,1);fern(W*.99,gy+(H-gy)*.55,L.land?1.1:.9,-1);
    // опавшие листья: ближе — крупнее, кучками
    const LC=['#e0a030','#d06a28','#c8b040','#b84a20','#e8c050','#a86a30','#8a5a20'];
    for(let i=0;i<(L.land?420:330);i++){const cl=i%6===0;const y=gy+u+Math.pow(R(),.75)*(H-gy),k=.7+(y-gy)/(H-gy)*1.7,x=R()*W;g.save();g.translate(x,y);g.rotate(R()*6);g.fillStyle=tn(LC[i%LC.length]);g.globalAlpha=.75+R()*.25;
      g.beginPath();g.moveTo(-u*1.3*k,0);g.quadraticCurveTo(0,-u*.75*k,u*1.3*k,0);g.quadraticCurveTo(0,u*.75*k,-u*1.3*k,0);g.fill();g.strokeStyle='rgba(80,40,10,.45)';g.lineWidth=.8;g.beginPath();g.moveTo(-u*1.3*k,0);g.lineTo(u*1.5*k,0);g.stroke();g.restore();
      if(cl){g.fillStyle='rgba(40,25,5,.18)';g.beginPath();g.ellipse(x,y+u*.6*k,u*2*k,u*.5*k,0,0,7);g.fill();}}g.globalAlpha=1;
    // солнечные лучи сквозь листву
    if(P.tod!=='night'){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=W*(.25+i*.22);const rg=g.createLinearGradient(x,gy,x-W*.2,H);rg.addColorStop(0,'rgba(255,230,160,.05)');rg.addColorStop(1,'rgba(255,230,160,0)');g.fillStyle=rg;g.beginPath();g.moveTo(x,gy);g.lineTo(x+W*.05,gy);g.lineTo(x-W*.1,H);g.lineTo(x-W*.22,H);g.fill();}g.restore();}
    // пень
    const sx=W*(L.land?.12:.16),sy=gy+(H-gy)*.12,sw=u*(L.land?7:9);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(sx+u,sy+u*.5,sw*.8,sw*.22,0,0,7);g.fill();
    g.fillStyle=tn('#6a4a2a');g.beginPath();g.moveTo(sx-sw*.55,sy);g.lineTo(sx-sw*.5,sy-sw*.6);g.lineTo(sx+sw*.5,sy-sw*.6);g.lineTo(sx+sw*.6,sy);g.closePath();g.fill();
    g.fillStyle=tn('#c8a070');g.beginPath();g.ellipse(sx,sy-sw*.6,sw*.5,sw*.16,0,0,7);g.fill();g.strokeStyle=tn('#9a7044');g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();g.ellipse(sx,sy-sw*.6,sw*.5*k/4,sw*.16*k/4,0,0,7);g.stroke();}
    g.fillStyle=tn('#5a8a2a');g.beginPath();g.ellipse(sx-sw*.3,sy-sw*.1,sw*.25,sw*.12,0,0,7);g.fill();
    // берёзы на переднем плане по краям
    const bir=(x,w)=>{const tg=g.createLinearGradient(x-w/2,0,x+w/2,0);tg.addColorStop(0,tn('#d8d4c8'));tg.addColorStop(.5,tn('#f6f4ee'));tg.addColorStop(1,tn('#b8b4a8'));g.fillStyle=tg;g.fillRect(x-w/2,-10,w,H+10);
      g.fillStyle=tn('#2a2a26');for(let y=R()*u*5;y<H;y+=u*(3+R()*5)){g.beginPath();g.ellipse(x+(R()-.5)*w*.4,y,w*(.18+R()*.25),u*(.3+R()*.4),0,0,7);g.fill();}
      g.fillStyle=tn('#e8c050');for(let i=0;i<10;i++){g.beginPath();g.ellipse(x+(R()-.5)*u*20,R()*H*.25,u*1.2,u*.6,R()*3,0,7);g.fill();}};
    bir(W-u*(L.land?1:2),u*(L.land?7:9));
    const vg=g.createRadialGradient(W/2,H*.55,Math.min(W,H)*.3,W/2,H*.55,Math.max(W,H)*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,P.tod==='night'?'rgba(5,10,30,.55)':'rgba(30,20,5,.3)');g.fillStyle=vg;g.fillRect(0,0,W,H);
    MAK._win=null;MAK._yk=key;MAK._yc=c;return c;},
  /* ---------- Петрович во весь рост: (x,yb) — между ступнями, s — рост ---------- */
  petr(g,x,yb,s,st){st=st||{};const t=st.t||0,tn=st.tn||(c=>c),pose=st.pose||'idle',br=Math.sin(t*2)*s*.006,look=st.look||0,blink=(t%4.2)>4.05;
    g.save();g.translate(x,yb);g.lineJoin='round';g.lineCap='round';
    g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(0,0,s*.2,s*.035,0,0,7);g.fill();
    // ноги и сапоги
    g.fillStyle=tn('#2f3a44');rr(g,-s*.1,-s*.46,s*.09,s*.42,s*.03);g.fill();rr(g,s*.015,-s*.46,s*.09,s*.42,s*.03);g.fill();
    g.fillStyle=tn('#1e2226');rr(g,-s*.125,-s*.09,s*.12,s*.09,s*.03);g.fill();rr(g,s*.005,-s*.09,s*.13,s*.09,s*.03);g.fill();
    g.fillStyle=tn('#3a4048');g.fillRect(-s*.12,-s*.1,s*.11,s*.015);g.fillRect(s*.01,-s*.1,s*.11,s*.015);
    // ватник
    const top=-s*.8+br,bot=-s*.4;const jg=g.createLinearGradient(-s*.2,0,s*.2,0);jg.addColorStop(0,tn('#3c4a5c'));jg.addColorStop(.5,tn('#52647a'));jg.addColorStop(1,tn('#3a4656'));
    g.fillStyle=jg;g.beginPath();g.moveTo(-s*.15,top+s*.02);g.quadraticCurveTo(-s*.2,top+s*.05,-s*.19,bot+s*.03);g.lineTo(s*.19,bot+s*.03);g.quadraticCurveTo(s*.2,top+s*.05,s*.15,top+s*.02);g.quadraticCurveTo(0,top-s*.03,-s*.15,top+s*.02);g.fill();
    g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=s*.006;for(let i=1;i<5;i++){g.beginPath();g.moveTo(-s*.18,top+i*(bot-top)/5+s*.02);g.lineTo(s*.18,top+i*(bot-top)/5+s*.02);g.stroke();}
    g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=s*.008;g.beginPath();g.moveTo(0,top+s*.02);g.lineTo(0,bot+s*.03);g.stroke();
    g.fillStyle=tn('#c8b48a');for(let i=0;i<4;i++){g.beginPath();g.arc(s*.02,top+s*.07+i*s*.075,s*.009,0,7);g.fill();}
    // тельняшка в вороте
    g.fillStyle='#f4f4f4';g.beginPath();g.moveTo(-s*.05,top+s*.01);g.lineTo(0,top+s*.08);g.lineTo(s*.05,top+s*.01);g.fill();g.strokeStyle=tn('#2a4a8a');g.lineWidth=s*.008;
    for(let i=0;i<3;i++){g.beginPath();g.moveTo(-s*.035+i*s*.012,top+s*.02+i*s*.018);g.lineTo(s*.035-i*s*.012,top+s*.02+i*s*.018);g.stroke();}
    // руки
    const arm=(side,ang,bend)=>{const sx=side*s*.165,sy=top+s*.05;g.save();g.translate(sx,sy);g.rotate(ang*side);
      g.strokeStyle=tn('#46566a');g.lineWidth=s*.075;g.beginPath();g.moveTo(0,0);const ex=side*s*.02,ey=s*.16;g.lineTo(ex,ey);const hx2=ex+Math.sin(bend*side)*s*.15,hy2=ey+Math.cos(bend)*s*.15;g.lineTo(hx2,hy2);g.stroke();
      g.fillStyle=tn('#e3b48e');g.beginPath();g.arc(hx2,hy2+s*.02,s*.035,0,7);g.fill();g.restore();};
    if(pose==='cheer'){const w=Math.sin(t*9)*.15;arm(-1,2.6+w,.2);arm(1,2.6-w,.2);}
    else if(pose==='point'){arm(-1,.22,-.55);arm(1,1.9,.15+Math.sin(t*4)*.05);}
    else if(pose==='talk'){arm(-1,.22,-.55);arm(1,.5+Math.sin(t*5)*.25,-1.1);}
    else{arm(-1,.22+Math.sin(t*1.3)*.02,-.55);arm(1,.22-Math.sin(t*1.3)*.02,-.55);}
    // голова
    const hy=top-s*.1,hx=look*s*.012;g.save();g.translate(hx,hy+br);if(pose==='cheer')g.rotate(Math.sin(t*6)*.05);
    g.fillStyle=tn('#e3b48e');g.beginPath();g.ellipse(0,0,s*.085,s*.095,0,0,7);g.fill();
    g.beginPath();g.arc(-s*.085,s*.005,s*.022,0,7);g.arc(s*.085,s*.005,s*.022,0,7);g.fill();
    g.fillStyle='rgba(220,110,90,.35)';g.beginPath();g.arc(-s*.045,s*.03,s*.02,0,7);g.arc(s*.045,s*.03,s*.02,0,7);g.fill();
    // глаза и брови
    const ex2=look*s*.006;if(blink||pose==='cheer'){g.strokeStyle='#2a211b';g.lineWidth=s*.008;g.beginPath();g.arc(-s*.032+ex2,-s*.005,s*.014,Math.PI*1.1,Math.PI*1.9);g.stroke();g.beginPath();g.arc(s*.032+ex2,-s*.005,s*.014,Math.PI*1.1,Math.PI*1.9);g.stroke();}
    else{g.fillStyle='#fff';g.beginPath();g.ellipse(-s*.032,-s*.008,s*.014,s*.012,0,0,7);g.ellipse(s*.032,-s*.008,s*.014,s*.012,0,0,7);g.fill();g.fillStyle='#2a211b';g.beginPath();g.arc(-s*.032+ex2,-s*.007,s*.008,0,7);g.arc(s*.032+ex2,-s*.007,s*.008,0,7);g.fill();}
    g.strokeStyle=tn('#8a8a88');g.lineWidth=s*.011;g.beginPath();g.moveTo(-s*.05,-s*.03);g.quadraticCurveTo(-s*.032,-s*.04,-s*.015,-s*.03);g.moveTo(s*.015,-s*.03);g.quadraticCurveTo(s*.032,-s*.04,s*.05,-s*.03);g.stroke();
    // нос и усы
    g.fillStyle=tn('#d89a74');g.beginPath();g.ellipse(0,s*.018,s*.02,s*.026,0,0,7);g.fill();
    g.fillStyle=tn('#9a9a96');g.beginPath();g.moveTo(0,s*.038);g.bezierCurveTo(-s*.03,s*.03,-s*.065,s*.045,-s*.07,s*.07);g.bezierCurveTo(-s*.045,s*.06,-s*.02,s*.058,0,s*.05);g.bezierCurveTo(s*.02,s*.058,s*.045,s*.06,s*.07,s*.07);g.bezierCurveTo(s*.065,s*.045,s*.03,s*.03,0,s*.038);g.fill();
    if(pose==='talk'||pose==='cheer'){g.fillStyle='#6a2a2a';g.beginPath();g.ellipse(0,s*.068,s*.016,s*.012*(pose==='talk'?(.5+Math.abs(Math.sin(t*12))):1.2),0,0,7);g.fill();}
    // кепка
    g.fillStyle=tn('#4a3d33');g.beginPath();g.ellipse(0,-s*.06,s*.095,s*.055,0,Math.PI,0);g.fill();g.fillRect(-s*.095,-s*.065,s*.19,s*.02);
    g.fillStyle=tn('#3a2f27');g.beginPath();g.ellipse(look*s*.02,-s*.048,s*.1,s*.022,0,0,Math.PI);g.fill();g.fillStyle=tn('#5a4a3d');g.beginPath();g.arc(0,-s*.112,s*.012,0,7);g.fill();
    g.restore();g.restore();},
  /* ---------- кот Васька мордой к нам: (x,yb) — низ, s — высота сидя ---------- */
  cat(g,x,yb,s,st){st=st||{};const t=st.t||0,tn=st.tn||(c=>c),k=st.k||'sit',col=tn('#e8913f'),dk=tn('#b8621f'),wh=tn('#fbeee0'),look=Math.max(-1,Math.min(1,st.look||0)),blink=(t%3.7)>3.55||k==='happy';
    g.save();g.translate(x,yb);g.lineCap='round';g.lineJoin='round';
    g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(0,0,s*.42,s*.06,0,0,7);g.fill();
    if(k==='sleep'){g.fillStyle=col;g.beginPath();g.ellipse(0,-s*.2,s*.45,s*.22,0,0,7);g.fill();g.beginPath();g.arc(-s*.3,-s*.24,s*.19,0,7);g.fill();
      g.beginPath();g.moveTo(-s*.44,-s*.34);g.lineTo(-s*.42,-s*.52);g.lineTo(-s*.3,-s*.4);g.fill();g.beginPath();g.moveTo(-s*.22,-s*.38);g.lineTo(-s*.16,-s*.54);g.lineTo(-s*.1,-s*.36);g.fill();
      g.strokeStyle=dk;g.lineWidth=s*.04;for(let i=0;i<3;i++){g.beginPath();g.arc(s*(.02+i*.13),-s*.22,s*.15,Math.PI*1.15,Math.PI*1.6);g.stroke();}
      g.strokeStyle='#3a2a1a';g.lineWidth=s*.02;g.beginPath();g.arc(-s*.36,-s*.24,s*.035,.2,Math.PI-.2);g.arc(-s*.24,-s*.24,s*.035,.2,Math.PI-.2);g.stroke();
      g.strokeStyle=col;g.lineWidth=s*.1;g.beginPath();g.moveTo(s*.4,-s*.12);g.quadraticCurveTo(s*.2,s*.04,-s*.3,-s*.04);g.stroke();
      const z=(t*.45)%1;g.globalAlpha=1-z;MAK.txt(g,'z',-s*.2+z*s*.4,-s*(.6+z*.5),s*.22,{col:'#eaf2ff',olc:'rgba(0,0,0,.4)',lw:3});g.globalAlpha=1;g.restore();return;}
    const cr=k==='crouch'?.82:k==='alarm'?1.08:1,bob=k==='alarm'?Math.abs(Math.sin(t*14))*s*.03:0;g.translate(0,-bob);g.scale(1,cr);
    // хвост
    const tw=Math.sin(t*(k==='alarm'?9:2))*s*.1;g.strokeStyle=col;g.lineWidth=s*.11;g.beginPath();g.moveTo(s*.25,-s*.08);g.quadraticCurveTo(s*.62,-s*.05,s*.55+tw*.4,-s*.45+tw*.3);g.stroke();
    g.strokeStyle=dk;g.lineWidth=s*.11;g.setLineDash([s*.05,s*.07]);g.beginPath();g.moveTo(s*.32,-s*.08);g.quadraticCurveTo(s*.62,-s*.05,s*.55+tw*.4,-s*.45+tw*.3);g.stroke();g.setLineDash([]);
    if(k==='alarm'){g.strokeStyle=col;g.lineWidth=s*.16;g.beginPath();g.moveTo(s*.55+tw*.4,-s*.45);g.lineTo(s*.57+tw*.4,-s*.5);g.stroke();}
    // тело
    const bg=g.createRadialGradient(-s*.08,-s*.45,s*.05,0,-s*.3,s*.45);bg.addColorStop(0,tn('#f4a650'));bg.addColorStop(1,col);g.fillStyle=bg;
    g.beginPath();g.moveTo(-s*.2,-s*.6);g.bezierCurveTo(-s*.38,-s*.4,-s*.36,-s*.04,-s*.22,0);g.lineTo(s*.22,0);g.bezierCurveTo(s*.36,-s*.04,s*.38,-s*.4,s*.2,-s*.6);g.closePath();g.fill();
    g.strokeStyle=dk;g.lineWidth=s*.035;for(const sd of [-1,1])for(let i=0;i<3;i++){g.beginPath();g.moveTo(sd*s*.3,-s*(.4-i*.12));g.quadraticCurveTo(sd*s*.22,-s*(.37-i*.12),sd*s*.2,-s*(.32-i*.12));g.stroke();}
    g.fillStyle=wh;g.beginPath();g.ellipse(0,-s*.3,s*.13,s*.24,0,0,7);g.fill();
    // лапы
    g.fillStyle=wh;g.beginPath();g.ellipse(-s*.1,-s*.03,s*.08,s*.05,0,0,7);g.ellipse(s*.1,-s*.03,s*.08,s*.05,0,0,7);g.fill();
    if(k==='paw'){const a=Math.sin(Math.min(1,(st.pt||0)/.35)*Math.PI);g.fillStyle=col;g.beginPath();g.ellipse(s*.16+a*s*.12*(st.dir||1),-s*.1-a*s*.3,s*.07,s*.13,(st.dir||1)*a*.6,0,7);g.fill();g.fillStyle=wh;g.beginPath();g.arc(s*.17+a*s*.14*(st.dir||1),-s*.2-a*s*.32,s*.06,0,7);g.fill();}
    // голова
    g.save();g.translate(look*s*.05,-s*.72);g.rotate(look*.12+(k==='happy'?Math.sin(t*3)*.08:0));
    g.fillStyle=col;g.beginPath();g.moveTo(-s*.22,-s*.04);g.lineTo(-s*.2,-s*.3);g.lineTo(-s*.06,-s*.17);g.closePath();g.moveTo(s*.22,-s*.04);g.lineTo(s*.2,-s*.3+(Math.sin(t*.9)>.96?s*.04:0));g.lineTo(s*.06,-s*.17);g.closePath();g.fill();
    g.fillStyle=tn('#f2a0a0');g.beginPath();g.moveTo(-s*.18,-s*.08);g.lineTo(-s*.18,-s*.23);g.lineTo(-s*.09,-s*.15);g.closePath();g.moveTo(s*.18,-s*.08);g.lineTo(s*.18,-s*.23);g.lineTo(s*.09,-s*.15);g.closePath();g.fill();
    const hg=g.createRadialGradient(-s*.05,-s*.06,s*.02,0,0,s*.25);hg.addColorStop(0,tn('#f6ad5a'));hg.addColorStop(1,col);g.fillStyle=hg;g.beginPath();g.ellipse(0,0,s*.24,s*.2,0,0,7);g.fill();
    g.strokeStyle=dk;g.lineWidth=s*.03;g.beginPath();g.moveTo(-s*.06,-s*.19);g.lineTo(-s*.04,-s*.12);g.moveTo(0,-s*.2);g.lineTo(0,-s*.12);g.moveTo(s*.06,-s*.19);g.lineTo(s*.04,-s*.12);g.stroke();
    g.fillStyle=wh;g.beginPath();g.ellipse(-s*.06,s*.07,s*.08,s*.065,0,0,7);g.ellipse(s*.06,s*.07,s*.08,s*.065,0,0,7);g.fill();
    // глаза
    const ex=look*s*.025;if(blink){g.strokeStyle='#3a2a1a';g.lineWidth=s*.022;g.beginPath();g.arc(-s*.09,-s*.01,s*.04,k==='happy'?Math.PI*1.15:.2,k==='happy'?Math.PI*1.85:Math.PI-.2);g.stroke();g.beginPath();g.arc(s*.09,-s*.01,s*.04,k==='happy'?Math.PI*1.15:.2,k==='happy'?Math.PI*1.85:Math.PI-.2);g.stroke();}
    else{const big=k==='alarm'||k==='crouch'?1.2:1;g.fillStyle=tn('#b6d84a');g.beginPath();g.ellipse(-s*.09,-s*.01,s*.05*big,s*.055*big,0,0,7);g.ellipse(s*.09,-s*.01,s*.05*big,s*.055*big,0,0,7);g.fill();
      g.fillStyle='#1a1a10';const pw=k==='crouch'||k==='alarm'?s*.03:s*.014;g.beginPath();g.ellipse(-s*.09+ex,-s*.01,pw,s*.045,0,0,7);g.ellipse(s*.09+ex,-s*.01,pw,s*.045,0,0,7);g.fill();
      g.fillStyle='#fff';g.beginPath();g.arc(-s*.1+ex,-s*.035,s*.012,0,7);g.arc(s*.08+ex,-s*.035,s*.012,0,7);g.fill();}
    g.fillStyle='#e07a8a';g.beginPath();g.moveTo(-s*.025,s*.04);g.lineTo(s*.025,s*.04);g.lineTo(0,s*.07);g.fill();
    g.strokeStyle='#5a3a2a';g.lineWidth=s*.012;g.beginPath();g.moveTo(0,s*.07);g.lineTo(0,s*.09);g.moveTo(0,s*.09);g.quadraticCurveTo(-s*.03,s*.11,-s*.05,s*.09);g.moveTo(0,s*.09);g.quadraticCurveTo(s*.03,s*.11,s*.05,s*.09);g.stroke();
    if(k==='alarm'){g.fillStyle='#7a2a2a';g.beginPath();g.ellipse(0,s*.12,s*.03,s*.03,0,0,7);g.fill();}
    g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=s*.008;for(const sd of [-1,1])for(let i=0;i<3;i++){g.beginPath();g.moveTo(sd*s*.1,s*(.06+i*.025));g.lineTo(sd*s*.34,s*(.02+i*.05));g.stroke();}
    g.restore();g.restore();},
  /* ---------- Васька сбоку (крадётся/бежит): (x,yb) — лапы, s — рост, dir 1 — вправо, k — 'sneak'|'run'|'grab', fish — lk рыбы в зубах ---------- */
  catSide(g,x,yb,s,st){const t=st.t||0,tn=st.tn||(c=>c),k=st.k||'sneak',dir=st.dir||1,col=tn('#e8913f'),dk=tn('#b8621f'),wh=tn('#fbeee0'),low=k==='sneak'?.72:1,sp=k==='run'?18:k==='sneak'?6:0;
    g.save();g.translate(x,yb);g.scale(dir,1);g.lineCap='round';g.lineJoin='round';
    g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(0,0,s*.55,s*.07,0,0,7);g.fill();
    const by=-s*.42*low;
    // хвост
    const tw=Math.sin(t*(k==='sneak'?3:8))*s*.08;g.strokeStyle=col;g.lineWidth=s*.11;g.beginPath();g.moveTo(-s*.42,by-s*.02);
    if(k==='sneak'){g.quadraticCurveTo(-s*.75,by+s*.02,-s*.85,by-s*.12+tw);}else{g.quadraticCurveTo(-s*.75,by-s*.2,-s*.68+tw,by-s*.5);}g.stroke();
    // лапы
    g.strokeStyle=col;g.lineWidth=s*.1;for(const [lx,ph] of [[-.3,0],[-.18,Math.PI],[.22,Math.PI],[.34,0]]){const sw=Math.sin(t*sp+ph)*s*.09;g.beginPath();g.moveTo(s*lx,by+s*.08);g.lineTo(s*lx+sw,-s*.02);g.stroke();}
    g.fillStyle=wh;for(const lx of [-.3,-.18,.22,.34]){g.beginPath();g.ellipse(s*lx+Math.sin(t*sp)*s*.02,-s*.02,s*.06,s*.035,0,0,7);g.fill();}
    // тело
    const bg=g.createLinearGradient(0,by-s*.22,0,by+s*.2);bg.addColorStop(0,tn('#f4a650'));bg.addColorStop(1,col);g.fillStyle=bg;g.beginPath();g.ellipse(0,by,s*.48,s*.21,k==='sneak'?.04:-.05,0,7);g.fill();
    g.fillStyle=wh;g.beginPath();g.ellipse(s*.2,by+s*.1,s*.2,s*.09,0,0,7);g.fill();
    g.strokeStyle=dk;g.lineWidth=s*.045;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-s*.28+i*s*.15,by-s*.2);g.quadraticCurveTo(-s*.24+i*s*.15,by-s*.05,-s*.3+i*s*.15,by+s*.06);g.stroke();}
    // голова
    const hx=s*.48,hy=by-(k==='sneak'?s*.02:s*.2);g.fillStyle=col;g.beginPath();g.ellipse(hx,hy,s*.22,s*.19,0,0,7);g.fill();
    g.beginPath();g.moveTo(hx-s*.14,hy-s*.1);g.lineTo(hx-s*.12,hy-s*.34);g.lineTo(hx,hy-s*.16);g.fill();g.beginPath();g.moveTo(hx+s*.02,hy-s*.15);g.lineTo(hx+s*.1,hy-s*.36);g.lineTo(hx+s*.16,hy-s*.1);g.fill();
    g.fillStyle=tn('#f2a0a0');g.beginPath();g.moveTo(hx+s*.05,hy-s*.15);g.lineTo(hx+s*.1,hy-s*.29);g.lineTo(hx+s*.13,hy-s*.12);g.fill();
    g.fillStyle=wh;g.beginPath();g.ellipse(hx+s*.14,hy+s*.06,s*.1,s*.08,0,0,7);g.fill();
    g.fillStyle='#e07a8a';g.beginPath();g.arc(hx+s*.22,hy+s*.01,s*.03,0,7);g.fill();
    const ey=hy-s*.03;g.fillStyle=tn('#b6d84a');g.beginPath();g.ellipse(hx+s*.1,ey,s*.045,s*.05,0,0,7);g.fill();g.fillStyle='#1a1a10';g.beginPath();g.ellipse(hx+s*.115,ey,k==='sneak'?s*.03:s*.014,s*.042,0,0,7);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(hx+s*.1,ey-s*.02,s*.012,0,7);g.fill();
    g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=s*.008;for(let i=0;i<3;i++){g.beginPath();g.moveTo(hx+s*.16,hy+s*.04);g.lineTo(hx+s*.42,hy+s*(-.02+i*.05));g.stroke();}
    if(st.fish){g.save();g.translate(hx+s*.22,hy+s*.12);g.rotate(.25);try{drawFish(g,st.fish,s*.15,0,s*.5);}catch(e){}g.restore();}
    g.restore();},
  /* ---------- жена в окне (зовёт ужинать) ---------- */
  wife(g,a,t,tn){const w=MAK._win;if(!w||a<=0)return;g.save();g.globalAlpha=a;g.beginPath();g.rect(w.x-w.w*.5,w.y-w.h*.38,w.w,w.h*.8);g.clip();
    const y=w.y+w.h*.45-(w.h*.7)*MAK.ease.out(Math.min(1,a*1.2)),s=w.h*.9;tn=tn||(c=>c);
    g.fillStyle=tn('#b04a5a');g.beginPath();g.ellipse(w.x,y+s*.62,s*.32,s*.3,0,0,7);g.fill();
    g.fillStyle=tn('#e8b896');g.beginPath();g.arc(w.x,y+s*.25,s*.16,0,7);g.fill();
    g.fillStyle=tn('#d8443a');g.beginPath();g.moveTo(w.x-s*.2,y+s*.3);g.quadraticCurveTo(w.x-s*.22,y+s*.02,w.x,y+s*.03);g.quadraticCurveTo(w.x+s*.22,y+s*.02,w.x+s*.2,y+s*.3);g.quadraticCurveTo(w.x,y+s*.16,w.x-s*.2,y+s*.3);g.fill();
    g.fillStyle='#fff';for(let i=0;i<5;i++){g.beginPath();g.arc(w.x-s*.14+i*s*.07,y+s*.12+Math.abs(i-2)*s*.02,s*.012,0,7);g.fill();}
    g.fillStyle='#3a2a1a';g.beginPath();g.arc(w.x-s*.05,y+s*.25,s*.016,0,7);g.arc(w.x+s*.05,y+s*.25,s*.016,0,7);g.fill();g.strokeStyle='#8a3a3a';g.lineWidth=s*.02;g.beginPath();g.arc(w.x,y+s*.3,s*.05,.3,Math.PI-.3);g.stroke();
    g.restore();},
  /* ---------- птицы вдали ---------- */
  birds(g,L,t,n){const u=L.u;g.strokeStyle='rgba(40,45,60,.55)';g.lineWidth=Math.max(1.2,u*.35);g.lineCap='round';for(let i=0;i<(n||3);i++){const x=((t*u*2.2+i*L.W*.37)%(L.W+u*20))-u*10,y=L.H*(L.land?.14:.12)+i*u*3+Math.sin(t*.8+i)*u*1.5,f=Math.sin(t*7+i*2)*u*.9;
    g.beginPath();g.moveTo(x-u*1.6,y-f);g.quadraticCurveTo(x-u*.6,y-u*.6,x,y);g.quadraticCurveTo(x+u*.6,y-u*.6,x+u*1.6,y-f);g.stroke();}},
  /* ---------- падающие листья (осень за окном) ---------- */
  leaves(Lv,L,dt,g,calm){if(Lv.length<(calm?3:7)&&Math.random()<dt*1.5)Lv.push({x:Math.random()*L.W,y:-10,v:L.u*(3+Math.random()*3),ph:Math.random()*7,r:Math.random()*6,c:['#e0a030','#d06a28','#c8b040'][Math.random()*3|0],s:L.u*(.9+Math.random()*.7)});
    for(let i=Lv.length-1;i>=0;i--){const l=Lv[i];l.ph+=dt;l.y+=l.v*dt;l.x+=Math.sin(l.ph*1.6)*L.u*4*dt;if(l.y>L.H*.75){Lv.splice(i,1);continue;}
      g.save();g.translate(l.x,l.y);g.rotate(l.r+Math.sin(l.ph*2)*.8);g.fillStyle=l.c;g.beginPath();g.ellipse(0,0,l.s,l.s*.45,0,0,7);g.fill();g.strokeStyle='rgba(90,50,20,.5)';g.lineWidth=1;g.beginPath();g.moveTo(-l.s,0);g.lineTo(l.s,0);g.stroke();g.restore();}},
  /* ---------- мягкая полоска «пока жена не позвала» (без секунд) ---------- */
  soft(g,L,x,y,w,k,label){const h=Math.max(30,L.u*7.4),r=h/2;g.save();g.fillStyle='rgba(16,26,36,.6)';rr(g,x,y,w,h,r);g.fill();g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1;g.stroke();
    const px=Math.max(15,Math.min(18,h*.42)),ix=x+r;
    // тарелка-значок
    g.fillStyle='#f2efe6';g.beginPath();g.ellipse(ix,y+h/2+1,h*.3,h*.13,0,0,7);g.fill();g.fillStyle='#d8d2c0';g.beginPath();g.ellipse(ix,y+h/2,h*.18,h*.07,0,0,7);g.fill();
    for(let i=0;i<3;i++){g.strokeStyle='rgba(255,255,255,'+(.5+.3*Math.sin(performance.now()/300+i))+')';g.lineWidth=1.6;g.beginPath();g.moveTo(ix-h*.1+i*h*.1,y+h*.38);g.quadraticCurveTo(ix-h*.16+i*h*.1,y+h*.26,ix-h*.1+i*h*.1,y+h*.14);g.stroke();}
    const bx=x+h,bw=w-h-r*.6,by=y+h*.62,bh=Math.max(6,h*.18);
    MAK.txt(g,label,bx,y+h*.33,px*.95,{al:'left',col:'rgba(255,255,255,.88)',ol:false});
    g.fillStyle='rgba(255,255,255,.16)';rr(g,bx,by,bw,bh,bh/2);g.fill();const kk=Math.max(0,Math.min(1,k));
    const pg=g.createLinearGradient(bx,0,bx+bw,0);pg.addColorStop(0,'#6be3b0');pg.addColorStop(.7,'#ffd36b');pg.addColorStop(1,'#ff9a6b');g.fillStyle=pg;if(kk>0){rr(g,bx,by,Math.max(bh,bw*kk),bh,bh/2);g.fill();}
    g.restore();},
  /* ---------- счётчик с рисунком (стекло) ---------- */
  pill(g,L,x,y,img,txt,o){o=o||{};const h=Math.max(44,L.u*10),px=Math.max(18,Math.min(26,h*.46));g.font=MAK.font(px,600);const tw=g.measureText(txt).width,w=h*1.05+tw+px*.9;if(x<0)x=L.W-w-12;
    const sc=o.bump?1+.12*Math.sin(Math.min(1,o.bump)*Math.PI):1;g.save();g.translate(x+w/2,y+h/2);g.scale(sc,sc);g.translate(-w/2,-h/2);
    g.fillStyle='rgba(16,26,36,.62)';rr(g,0,0,w,h,h/2);g.fill();g.strokeStyle='rgba(255,255,255,.24)';g.lineWidth=1;g.stroke();
    if(img&&img.complete&&img.naturalWidth)g.drawImage(img,h*.06,-h*.12,h*1.1,h*1.1);else if(o.drawIc)o.drawIc(g,h*.55,h*.5,h*.4);
    MAK.txt(g,txt,h*1.12,h*.52,px,{al:'left',col:'#fff',ol:false});g.restore();return {x,y,w,h,cx:x+h*.55,cy:y+h*.5};},
  /* ---------- слой DOM: вступление и подсказки (стекло) ---------- */
  css(){if(document.getElementById('makCss'))return;const st=document.createElement('style');st.id='makCss';st.textContent=
   '.mak-ui{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;font-family:var(--font,"LkGolos",sans-serif);color:#fff}'+
   '.mak-card{pointer-events:auto;position:absolute;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(440px,calc(100% - 32px));box-sizing:border-box;padding:20px 20px 18px;border-radius:24px;background:rgba(16,26,36,.74);border:1px solid rgba(255,255,255,.22);box-shadow:0 10px 36px rgba(0,0,0,.35);-webkit-backdrop-filter:saturate(160%) blur(18px);backdrop-filter:saturate(160%) blur(18px);animation:makIn .45s cubic-bezier(.2,1.3,.4,1) both}'+
   'body.nb .mak-card,body.low .mak-card{background:rgba(20,32,44,.94);-webkit-backdrop-filter:none;backdrop-filter:none}'+
   'body.calm .mak-card{animation:none}'+
   '@keyframes makIn{from{opacity:0;transform:translate(-50%,24px) scale(.96)}to{opacity:1;transform:translate(-50%,0) scale(1)}}'+
   '.mak-hd{display:flex;align-items:center;margin-bottom:10px}.mak-hd img{width:76px;height:76px;flex:none;margin:-10px 12px -6px -6px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.35))}'+
   '.mak-hd h3{margin:0;font-size:26px;line-height:1.15;font-weight:600}.mak-hd small{display:block;font-size:17px;color:#ffd27a;font-weight:600;margin-top:2px}'+
   '.mak-p{font-size:18px;line-height:1.38;color:rgba(255,255,255,.9);margin:0 0 6px}.mak-p b{color:#ffd27a;font-weight:600}'+
   '.mak-tag{display:inline-block;font-size:17px;padding:3px 12px;border-radius:12px;background:rgba(107,227,176,.16);border:1px solid rgba(107,227,176,.5);color:#6be3b0;margin:2px 0 8px}'+
   '.mak-btn{display:block;width:100%;min-height:64px;margin-top:12px;border:0;border-radius:18px;font:600 22px/1.1 var(--font,"LkGolos",sans-serif);color:var(--accT,#3b1c00);background:linear-gradient(140deg,var(--acc1,#ffcf7a),var(--acc2,#ff8f4f));box-shadow:0 6px 18px rgba(255,140,70,.35),inset 0 1px 0 rgba(255,255,255,.45);cursor:pointer;touch-action:manipulation}'+
   '.mak-btn:active{transform:scale(.97)}'+
   'html.mg-pc .mak-btn:hover{filter:brightness(1.07) saturate(1.05)}'+
   '.mak-hint{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom,0px));padding:10px 18px;border-radius:18px;background:rgba(16,26,36,.66);border:1px solid rgba(255,255,255,.2);font-size:18px;white-space:nowrap;transition:opacity .4s}';
   document.head.appendChild(st);},
  ui(host){MAK.css();const el=document.createElement('div');el.className='mak-ui';host.el.appendChild(el);
    return {el,
      intro(o){return new Promise(res=>{const c=document.createElement('div');c.className='mak-card';const img=o.art?MAK.artUrl(o.art):'';
        c.innerHTML='<div class="mak-hd">'+(img?'<img alt="" src="'+img+'">':'')+'<div><h3>'+o.title+'</h3>'+(o.sub?'<small>'+o.sub+'</small>':'')+'</div></div>'+
          (o.train?'<div class="mak-tag">'+(typeof L==='function'?L('Тренировка — без награды, ради рекорда','Practice — no reward, just the record'):'Тренировка')+'</div>':'')+
          (o.lines||[]).map(l=>'<p class="mak-p">'+l+'</p>').join('')+'<button class="mak-btn noenter" type="button" data-enter>'+(o.btn||(typeof L==='function'?L('Начать','Start'):'Начать'))+MAK.kc('Enter')+'</button>';
        el.appendChild(c);const b=c.querySelector('button');b.onclick=()=>{MAK.snd('tap');c.remove();res();};});},
      // «Дальше» внизу экрана: Enter/пробел жмут его сами (data-enter), значок клавиши — только на ПК
      next(fn){const b=document.createElement('button');b.className='mak-btn noenter';b.type='button';b.setAttribute('data-enter','');b.innerHTML=(typeof L==='function'?L('Дальше','Next'):'Дальше')+MAK.kc('Enter');
        b.style.cssText='pointer-events:auto;position:absolute;left:50%;transform:translateX(-50%);bottom:calc(20px + env(safe-area-inset-bottom,0px));width:min(360px,calc(100% - 32px))';el.appendChild(b);b.onclick=fn;return b;},
      hint(t,ms){const h=document.createElement('div');h.className='mak-hint';h.textContent=t;el.appendChild(h);setTimeout(()=>{h.style.opacity='0';setTimeout(()=>h.remove(),450);},ms||2600);return h;},
      clear(){el.innerHTML='';}};},
  /* ---------- рука-подсказка: палец касается (x,y) ---------- */
  hand(g,x,y,u,t){const k=(t*1.4)%1,press=k<.2?k/.2:k<.35?1-(k-.2)/.15:0,dy=(1-press)*u*2.2;
    if(k<.3){g.strokeStyle='rgba(255,255,255,'+(.9-k*3)+')';g.lineWidth=2.5;g.beginPath();g.arc(x,y,u*(1.5+k*12),0,7);g.stroke();}
    g.save();g.translate(x+u*.6,y+u*.4+dy);g.rotate(-.42);g.lineJoin='round';const f='#ffffff',o='rgba(25,35,45,.85)';g.lineWidth=Math.max(2,u*.45);g.strokeStyle=o;g.fillStyle=f;
    g.beginPath();g.moveTo(-u*1.1,u*6);g.lineTo(-u*1.1,u*.6);g.arc(0,u*.6,u*1.1,Math.PI,0);g.lineTo(u*1.1,u*4.2);
    g.arc(u*2.2,u*4.4,u*1,Math.PI*1.15,Math.PI*1.9);g.arc(u*4.1,u*4.9,u*.95,Math.PI*1.2,Math.PI*1.9);g.arc(u*5.6,u*5.7,u*.85,Math.PI*1.25,0);
    g.lineTo(u*6.45,u*8.5);g.quadraticCurveTo(u*6.2,u*12,u*2.5,u*12.2);g.lineTo(u*.5,u*12.2);g.quadraticCurveTo(-u*2.2,u*11,-u*3.4,u*7.6);g.quadraticCurveTo(-u*3.6,u*6,-u*1.1,u*6.6);g.closePath();g.fill();g.stroke();g.restore();},
  /* ---------- финал: звёзды и итог на холсте ---------- */
  stars(g,cx,cy,r,n,k,t){for(let i=0;i<3;i++){const on=i<n,kk=Math.max(0,Math.min(1,(k-i*.18)/.35)),sc=on?MAK.ease.back(kk):1,x=cx+(i-1)*r*2.3,y=cy-(i===1?r*.35:0);
    g.save();g.translate(x,y);g.scale(sc,sc);g.beginPath();for(let j=0;j<10;j++){const rr2=j%2?r*.45:r,a=-Math.PI/2+j*Math.PI/5;g.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2);}g.closePath();
    if(on&&kk>0){const sg=g.createLinearGradient(0,-r,0,r);sg.addColorStop(0,'#fff0a8');sg.addColorStop(1,'#f0a020');g.fillStyle=sg;g.fill();g.strokeStyle='#8a4a10';g.lineWidth=r*.12;g.stroke();}
    else{g.fillStyle='rgba(255,255,255,.14)';g.fill();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=r*.08;g.stroke();}g.restore();}},
  /* ---------- общий ход «вступление → игра → финал»; день недели из o.day ---------- */
  wd(o){const d=String(o&&o.day||'');if(d.length===8){const dt=new Date(+d.slice(0,4),+d.slice(4,6)-1,+d.slice(6,8));return dt.getDay();}return new Date().getDay();},
  /* рекорд и «первый раз» — из оболочки MG0 (o.rec, S.mg.cnt) */
  best(o){return o&&o.rec|0;},
  first(id){try{return !(S.mg&&S.mg.cnt&&S.mg.cnt[id]);}catch(e){return false;}},
  /* HUD: счётчик справа сверху (слева — ✕ и метка оболочки), мягкая полоска — под ним (телефон) или слева от него (ПК) */
  hud(g,L,img,txt,o,k,label){const top=10,p=MAK.pill(g,L,-1,top,img,txt,o);if(label==null)return p;const u=L.u,sh=Math.max(30,u*7.4);let bx,by,bw;
    if(L.land){bw=Math.min(380,p.x-12-200);bx=p.x-12-bw;by=top+(p.h-sh)/2;}else{bx=12;by=top+Math.max(p.h,58)+8;bw=L.W-24;}if(bw>120)MAK.soft(g,L,bx,by,bw,k,label);return p;}
};
