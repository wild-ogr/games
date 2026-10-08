'use strict';
/* BGD: общий набор отрисовки для забав №6 «Кулачный бой» и №8 «Скачки на Сивке-Бурке» (zbd-kulak.js, zbd-skachki.js).
   Один глобальный объект zbdK (префикс BGD — чтобы при слиянии не столкнуться с наборами других помощников).
   Холст во весь host с retina, текст с обводкой, частицы, клавиши ПК, значок клавиши, окно «как играть», мягкое свечение. */
const zbdK=(function(){
  const TAU=Math.PI*2;
  const font=(px,w)=>(w||800)+' '+Math.round(px)+'px BgF,'+(typeof CVL!=='undefined'&&CVL&&CVL.font?CVL.font:'system-ui,-apple-system,sans-serif');
  const tr=(ru,en)=>typeof L==='function'?L(ru,en):ru;
  function canvas(host){const c=document.createElement('canvas');c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;display:block';host.el.appendChild(c);
    const fit=()=>{const d=Math.min(2,host.dpr||window.devicePixelRatio||1),w=Math.max(1,host.w),h=Math.max(1,host.h);c.width=Math.round(w*d);c.height=Math.round(h*d);c.W=w;c.H=h;c.D=d;};
    fit();host.onResize(()=>{fit();if(c.onfit)c.onfit();});return c;}
  function text(g,s,x,y,px,o){o=o||{};g.font=font(px,o.w);if(o.mw){const w=g.measureText(s).width;if(w>o.mw){px=px*o.mw/w;g.font=font(px,o.w);}}
    g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';g.lineJoin='round';
    if(o.ol!==false){g.lineWidth=o.lw||Math.max(3,px*.24);g.strokeStyle=o.olc||'rgba(46,24,10,.94)';g.strokeText(s,x,y);}
    if(o.grad){const gr=g.createLinearGradient(0,y-px*.5,0,y+px*.5);gr.addColorStop(0,o.grad[0]);gr.addColorStop(1,o.grad[1]);g.fillStyle=gr;}else g.fillStyle=o.col||'#fff6dc';g.fillText(s,x,y);}
  // перенос строки по ширине
  function wrap(g,s,px,mw,w){g.font=font(px,w);const out=[];let cur='';for(const word of String(s).split(' ')){const t=cur?cur+' '+word:word;if(g.measureText(t).width>mw&&cur){out.push(cur);cur=word;}else cur=t;}if(cur)out.push(cur);return out;}
  function loop(host,fn){let raf=0,last=performance.now(),dead=false;
    const step=now=>{if(dead)return;const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;try{fn(host.paused?0:dt,now/1000);}catch(e){console.error(e);dead=true;return;}raf=requestAnimationFrame(step);};
    raf=requestAnimationFrame(step);const stop=()=>{dead=true;cancelAnimationFrame(raf);};host.onQuit(stop);return stop;}
  function rnd(seed){let a=(seed>>>0)||1;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function burst(P,x,y,o){o=o||{};const n=o.n||10;for(let i=0;i<n&&P.length<300;i++){const a=(o.a0!=null?o.a0:0)+Math.random()*(o.arc!=null?o.arc:TAU),v=(o.sp||160)*(.4+Math.random()*.8);
    P.push({x,y,vx:Math.cos(a)*v+(o.vx||0),vy:Math.sin(a)*v,t:0,d:(o.d||.6)*(.7+Math.random()*.6),c:Array.isArray(o.col)?o.col[i%o.col.length]:o.col||'#ffe27a',s:(o.s||4)*(.6+Math.random()*.8),g:o.g==null?380:o.g,k:o.k||'dot',r:Math.random()*TAU});}}
  function parts(g,P,dt){for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;if(p.t>=p.d){P.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.vx*=1-1.2*dt;
    const a=1-p.t/p.d;g.globalAlpha=Math.min(1,a*1.4);g.fillStyle=p.c;
    if(p.k==='star'){g.beginPath();for(let j=0;j<10;j++){const r=j%2?p.s*.45:p.s,an=-Math.PI/2+j*Math.PI/5+p.t*4+p.r;g.lineTo(p.x+Math.cos(an)*r,p.y+Math.sin(an)*r);}g.closePath();g.fill();}
    else if(p.k==='puff'){const r=p.s*(1+p.t/p.d*1.6);g.globalAlpha=a*.55;g.beginPath();g.arc(p.x,p.y,r,0,TAU);g.fill();}
    else if(p.k==='chip'){g.save();g.translate(p.x,p.y);g.rotate(p.r+p.t*9);g.fillRect(-p.s,-p.s*.3,p.s*2,p.s*.6);g.restore();}
    else{g.beginPath();g.arc(p.x,p.y,p.s*(.5+a*.5),0,TAU);g.fill();}}g.globalAlpha=1;}
  // мягкое свечение (кэш)
  const GL={};function glow(col){let c=GL[col];if(c)return c;c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d'),gr=g.createRadialGradient(48,48,0,48,48,48);
    gr.addColorStop(0,col);gr.addColorStop(.35,col.replace(/[\d.]+\)$/,m=>(parseFloat(m)*.45)+')'));gr.addColorStop(1,col.replace(/[\d.]+\)$/,'0)'));g.fillStyle=gr;g.fillRect(0,0,96,96);return GL[col]=c;}
  function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
  // спрайт из art.js (богатырь игрока и пр.), кэш по размеру
  const SC={};function spr(key,px,d){if(typeof ART==='undefined'||!ART[key])return null;const id=key+'@'+Math.round(px*d);if(SC[id])return SC[id];return SC[id]=drawArt(key,Math.ceil(px*d));}
  function heroKey(){try{const h=(typeof S!=='undefined'&&S.hero&&HERO_ART[S.hero])?S.hero:'dob';const k=typeof skinKey==='function'?skinKey(h):h;return ART['hp_'+k]?'hp_'+k:'hp_'+h;}catch(e){return 'hp_dob';}}
  function heroPal(){try{const h=(typeof S!=='undefined'&&S.hero&&HERO_ART[S.hero])?S.hero:'dob',k=typeof skinKey==='function'?skinKey(h):h,sk=k.indexOf('@')>0&&typeof SKINS!=='undefined'?SKINS.find(s=>s.hero+'@'+s.id===k):null;return Object.assign({},HERO_ART[h],sk?sk.pal:{});}catch(e){return {body:'#c8392f',belt:'#5b3a1e',boots:'#4a2c1c',skin:'#f4c9a3'};}}
  function pc(){try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
  // клавиши, пока игра на экране и не на паузе; fn(key,e,down) вернёт true — клавиша съедена
  function keys(host,fn){const dn=e=>{if(host.paused||!host.root&&!host.el.isConnected)return;if(host.root&&host.root.querySelector('.mgVeil,.zbVeil,.zabVeil'))return;if(e.repeat)return;try{if(fn(e.key,e,true))e.preventDefault();}catch(x){console.error(x);}},
      up=e=>{try{if(fn(e.key,e,false))e.preventDefault();}catch(x){console.error(x);}};
    window.addEventListener('keydown',dn);window.addEventListener('keyup',up);host.onQuit(()=>{window.removeEventListener('keydown',dn);window.removeEventListener('keyup',up);});}
  // значок клавиши
  function keycap(g,x,y,lbl,px,on){px=px||24;g.save();g.font=font(px*.56,800);const w=Math.max(px,g.measureText(lbl).width+px*.7);
    g.fillStyle='rgba(30,18,8,.6)';rr(g,x-w/2,y-px/2+px*.12,w,px,px*.22);g.fill();
    const gr=g.createLinearGradient(0,y-px/2,0,y+px/2);gr.addColorStop(0,on?'#fff3a0':'#fffaf0');gr.addColorStop(1,on?'#f2c03a':'#e2cc9c');g.fillStyle=gr;rr(g,x-w/2,y-px/2+(on?px*.08:0),w,px,px*.22);g.fill();
    g.strokeStyle='#5a3a1a';g.lineWidth=Math.max(1.5,px*.07);g.stroke();g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a2410';g.fillText(lbl,x,y+px*.04+(on?px*.08:0));g.restore();return w;}
  // свиток-панель
  function scroll(g,x,y,w,h){g.save();g.shadowColor='rgba(20,10,4,.45)';g.shadowBlur=18;g.shadowOffsetY=6;rr(g,x,y,w,h,18);const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#fff6dc');gr.addColorStop(1,'#efd9a6');g.fillStyle=gr;g.fill();g.restore();
    g.strokeStyle='#7a4a1e';g.lineWidth=3;rr(g,x,y,w,h,18);g.stroke();g.strokeStyle='rgba(176,64,40,.55)';g.lineWidth=1.5;rr(g,x+7,y+7,w-14,h-14,13);g.stroke();
    // уголки-узоры
    g.fillStyle='#b8402a';for(const [cx,cy] of[[x+16,y+16],[x+w-16,y+16],[x+16,y+h-16],[x+w-16,y+h-16]]){g.beginPath();g.moveTo(cx,cy-6);g.lineTo(cx+6,cy);g.lineTo(cx,cy+6);g.lineTo(cx-6,cy);g.closePath();g.fill();}}
  // кнопка на холсте
  function button(g,x,y,w,h,lbl,o){o=o||{};g.save();g.fillStyle='rgba(60,20,4,.55)';rr(g,x-w/2,y-h/2+5,w,h,h*.32);g.fill();const gr=g.createLinearGradient(0,y-h/2,0,y+h/2);
    gr.addColorStop(0,o.c1||'#ff8a3a');gr.addColorStop(1,o.c2||'#c2410c');g.fillStyle=gr;rr(g,x-w/2,y-h/2,w,h,h*.32);g.fill();g.strokeStyle='#5a1e06';g.lineWidth=3;g.stroke();
    g.fillStyle='rgba(255,255,255,.22)';rr(g,x-w/2+6,y-h/2+4,w-12,h*.36,h*.2);g.fill();g.restore();text(g,lbl,x,y+1,h*.42,{mw:w-20});}
  // окно «как играть»: rows=[{keys:['←','→'],tap:'…',txt:'…'}], возвращает прямоугольник кнопки
  function howto(g,W,H,title,rows,isPC,t){const w=Math.min(W-28,480),ks=Math.min(30,W*.07),tx=Math.min(19,W*.045),lh=tx*1.22;
    // сначала мерим: строки каждого ряда
    const R=rows.map(r=>{let kw=0;if(isPC&&r.keys){for(const kk of r.keys)kw+=keycap(g,0,-999,kk,ks)+6;}else if(r.icon)kw=ks+6;const lines=wrap(g,isPC?r.txt:(r.tap||r.txt),tx,w-52-kw,700);return {r,kw,lines,h:Math.max(ks,lines.length*lh)+14};});
    const h=100+R.reduce((a,b)=>a+b.h,0)+78,x=(W-w)/2,y=Math.max(10,(H-h)/2-H*.03);
    const k=Math.min(1,t*4),e=1-Math.pow(1-k,3);g.save();g.globalAlpha=k;g.translate(W/2,y+h/2);g.scale(.85+.15*e,.85+.15*e);g.translate(-W/2,-(y+h/2));
    scroll(g,x,y,w,h);text(g,title,W/2,y+38,Math.min(28,W*.066),{grad:['#ffe27a','#f29a2a'],mw:w-40});
    text(g,isPC?L('Как играть (клавиши или мышь)','How to play (keys or mouse)'):L('Как играть','How to play'),W/2,y+70,Math.min(15,W*.038),{ol:false,col:'#8a4a1e',w:700});
    let yy=y+92;for(const q of R){let kx=x+24;const cy=yy+q.h/2-7;if(isPC&&q.r.keys){for(const kk of q.r.keys){const kw=keycap(g,0,-999,kk,ks);keycap(g,kx+kw/2,cy,kk,ks);kx+=kw+6;}}
      else if(q.r.icon){q.r.icon(g,kx+ks/2,cy,ks);kx+=ks+6;}
      q.lines.forEach((s,i)=>text(g,s,kx+8,cy+(i-(q.lines.length-1)/2)*lh,tx,{ol:false,col:'#3a2410',al:'left',w:700}));yy+=q.h;}
    const bw=Math.min(w-60,250),bh=54,by=y+h-46;const pul=1+Math.sin(t*5)*.025;g.save();g.translate(W/2,by);g.scale(pul,pul);button(g,0,0,bw,bh,L('Начать','Start'));g.restore();
    if(isPC)keycap(g,W/2+bw/2-16,by+bh/2+2,'Enter',20);
    g.restore();return {x:W/2-bw/2,y:by-bh/2,w:bw,h:bh,box:{x,y,w,h}};}
  // подсказка-строка внизу: items=[{k:'←'}|{t:'текст'}], по центру
  function hintBar(g,W,y,items,px){const ks=px*1.7;let tw=0;const m=items.map(it=>{const w=it.k?keycap(g,0,-999,it.k,ks):(g.font=font(px,800),g.measureText(it.t).width);tw+=w+8;return w;});tw+=24;
    const sc=Math.min(1,(W-16)/tw);g.save();g.translate(W/2,y);g.scale(sc,sc);rr(g,-tw/2,-ks*.85,tw,ks*1.7,16);g.fillStyle='rgba(30,16,8,.74)';g.fill();
    let x=-tw/2+12;items.forEach((it,i)=>{if(it.k)keycap(g,x+m[i]/2,0,it.k,ks);else text(g,it.t,x,0,px,{al:'left',col:'#fff6dc'});x+=m[i]+8;});g.restore();}
  // баннер посреди экрана
  function banner(g,W,y,s,px,t,col){const k=Math.min(1,t*5),sc=t<.2?.6+2*t:1+Math.max(0,.06-(t-.2)*.3);g.save();g.globalAlpha=k;g.translate(W/2,y);g.scale(sc,sc);
    text(g,s,0,0,px,{grad:col||['#fff3a0','#ffb02a'],mw:W*.92,lw:px*.28});g.restore();}
  function ease(t){t=Math.max(0,Math.min(1,t));return 1-Math.pow(1-t,3);}
  function snd(host,k,a){try{const s=host.snd||(typeof SND!=='undefined'?SND:null);if(s&&typeof s[k]==='function')s[k](a);}catch(e){}}
  return {TAU,ease,font,tr,canvas,text,wrap,loop,rnd,burst,parts,glow,rr,spr,heroKey,heroPal,pc,keys,keycap,scroll,button,howto,hintBar,banner,snd};
})();
