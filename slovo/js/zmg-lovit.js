'use strict';
/* zb-MGC мини-игра №15 «Ять ловит буквы» (ведущий — кот Ять). Единственная ловкостная. Затея дня по четвергам.
   Зина развесила бельё-буквы, ветер их срывает — Ять ловит лапой буквы слова ПО ПОРЯДКУ (слово видно сверху). 30 с, без проигрыша:
   чужая буква не наказывает (просто «не та»), упавшая — прилетит снова. «Спокойный режим» (host.calm) — бельё летит медленнее и чаще нужное.
   Холст оболочки (host.cv/loop/ptr). Управление: палец/мышь — кот идёт к точке; ПК — ←/→ (или A/D). Очки: буква +1, слово целиком +2.
   Праздник (host.fest.id==='halloween'): «Ять ловит тыквы» — ночь, луна, буквы на тыквах. Быстро на слабом Android: фон и спрайты букв/кота
   рисуются один раз в запасные холсты (замер кадров — журнал MGC.md).
   Выключение — ZMG_OFF в zmg-core.js или здесь LV_ON=false. Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const LV_ON=true;
if(!LV_ON)return;
const TIME=30;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const AL='АБВГДЕЖЗИКЛМНОПРСТУФХЧШЯ';
const SPARE=['кошка','варенье','блюдце','сметана','клубок','подушка','рыбка','молоко','тапок','бельё','ветер','прищепка','верёвка','простыня','наволочка'];
const tierOf=(s,calm)=>calm?(s>=15?3:s>=9?2:s>=4?1:0):(s>=20?3:s>=12?2:s>=5?1:0);   // спокойный режим — пороги ниже
// реплики итога — hosts.json (TEXT), раздел lovit
const H={st3:['Все буквы пойманы! Ять — чемпион двора.','Ловко! Ни одна прищепка не пропала.'],st2:['Хорошо поймал! Пара букв улетела к соседям.','Ять доволен. Почти всё бельё на месте.'],
  st1:['Кое-что поймал. Остальное — на соседском балконе.','Неплохо! Ветер сегодня сильный.'],st0:['Ветер победил. Ять ушёл спать от обиды.','Буквы улетели. Ничего, завтра постираем новые.']};
const hl=k=>H[k][Math.floor(Math.random()*H[k].length)];
const up=w=>String(w).toUpperCase().replace(/Ё/g,'Е');
function wordsFor(host,o){let L=[];try{L=host.words({min:4,max:7})||[];}catch(e){}
  L=L.filter(w=>/^[а-яё]+$/.test(w)&&!/[ъыь]/.test(w.charAt(0)));
  if(L.length<6){const S2=SPARE.slice();for(let i=S2.length-1;i>0;i--){const j=Math.floor(o.rnd()*(i+1));const t=S2[i];S2[i]=S2[j];S2[j]=t;}L=L.concat(S2);}
  return L.slice(0,30).map(up);}
let catImg=null;   // кот — SVG из text.js (облик Ятя), растр один раз
function catSrc(){try{if(typeof catSVG==='function')return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(catSVG());}catch(e){}return '';}
ZMG_REG({id:'lovit',finWho:'yat',
  open:()=>true,
  lines:{get good(){return hl('st3');},get ok(){return hl(Math.random()<.5?'st2':'st1');},get bad(){return hl('st0');}},
  sim(o,k){const sc=Math.max(0,Math.round(4+20*k+(o.rnd()-.5)*8));return {sc,st:tierOf(sc)};},
  run(host,o){
    const night=!!(host.fest&&host.fest.id==='halloween');
    const calm=!!host.calm,WL=wordsFor(host,o);
    if(night)try{const nm=host.el.parentNode.querySelector('.zmg-nm');if(nm)nm.textContent='Ять ловит тыквы';}catch(e){}
    host.el.innerHTML='<div class="zmc-lv'+(night?' night':'')+'"><div class="zmc-lv-w" aria-live="polite"></div><div class="zmc-lv-msg"></div></div>';
    const box=host.el.querySelector('.zmc-lv'),wEl=box.querySelector('.zmc-lv-w'),msg=box.querySelector('.zmc-lv-msg');
    const C=host.cv();C.cv.classList.add('zmc-lv-cv');host.el.insertBefore(C.cv,box);
    const x=C.x,dpr=host.dpr||1;
    // состояние
    let wi=0,W=WL[0],k=0,sc=0,words=0,wrong=0,t=0,left=TIME,acc=0,fl=[],started=false,over=false,flash=0,shake=0,lastTop=-1;
    let cat={x:0,tx:0,face:1},held={L:0,R:0},sizes=null,bg=null,catC=null,spr={},needSince=0;
    function lay(){const w=C.w,h=C.h,s=Math.max(.75,Math.min(1.35,Math.min(w/390,h/600)));
      const catW=Math.round(84*s),top=Math.round(wEl.offsetHeight+wEl.offsetTop+6);
      sizes={w,h,s,catW,catH:catW,lineY:top+Math.round(18*s),ground:h-Math.round(22*s),card:Math.round(40*s),spd:h*(calm?.17:.25)};
      if(!cat.x){cat.x=cat.tx=w/2;}cat.x=Math.min(w-catW/2,Math.max(catW/2,cat.x));cat.tx=cat.x;bg=null;spr={};}
    // ---- запасные холсты: фон, кот, буквы ----
    function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*dpr));c.height=Math.max(1,Math.round(h*dpr));const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return [c,g];}
    function drawBg(){const z=sizes,[c,g]=mk(z.w,z.h);const sk=g.createLinearGradient(0,0,0,z.h);
      if(night){sk.addColorStop(0,'#1d1838');sk.addColorStop(.7,'#3b2b5c');sk.addColorStop(1,'#56406e');}else{sk.addColorStop(0,'#bfe0ff');sk.addColorStop(.75,'#fff4dc');sk.addColorStop(1,'#fff4dc');}
      g.fillStyle=sk;g.fillRect(0,0,z.w,z.h);
      if(night){g.fillStyle='#fff7d6';g.beginPath();g.arc(z.w*.82,z.lineY+60*z.s,26*z.s,0,7);g.fill();g.fillStyle='#3b2b5c';g.beginPath();g.arc(z.w*.82+12*z.s,z.lineY+54*z.s,24*z.s,0,7);g.fill();
        g.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<24;i++){const a=(i*97)%z.w,b=z.lineY+((i*53)%Math.max(40,z.h*.5));g.fillRect(a,b,2,2);}}
      else{g.fillStyle='rgba(255,255,255,.85)';for(const [cx,cy,r] of[[.18,.32,22],[.26,.3,28],[.7,.42,20],[.78,.4,26]]){g.beginPath();g.arc(z.w*cx,z.lineY+z.h*cy*.5,r*z.s,0,7);g.fill();}}
      // дом слева и столбы с верёвкой
      g.fillStyle=night?'#2a2340':'#e9d3b0';g.fillRect(0,z.lineY-8*z.s,14*z.s,z.h);g.fillRect(z.w-14*z.s,z.lineY-8*z.s,14*z.s,z.h);
      g.strokeStyle=night?'#a99ac8':'#8a6b4a';g.lineWidth=2;g.beginPath();g.moveTo(10*z.s,z.lineY);g.quadraticCurveTo(z.w/2,z.lineY+22*z.s,z.w-10*z.s,z.lineY);g.stroke();
      // трава / двор
      g.fillStyle=night?'#2f3b2a':'#9bc27a';g.fillRect(0,z.ground,z.w,z.h-z.ground);g.fillStyle=night?'#3c4b35':'#8ab36a';
      for(let i=0;i<z.w;i+=14){g.beginPath();g.moveTo(i,z.ground);g.lineTo(i+5,z.ground-7*z.s);g.lineTo(i+10,z.ground);g.fill();}
      bg=c;}
    function drawCat(){if(!catImg||!catImg.complete||!catImg.naturalWidth)return null;const z=sizes,[c,g]=mk(z.catW,z.catH);g.drawImage(catImg,0,0,z.catW,z.catH);return c;}
    const COL=['#ffffff','#f7c6d0','#cde7c8','#d6e4ff','#fff1b8'];
    function sprite(ch,kind){const key=ch+kind;if(spr[key])return spr[key];const z=sizes,d=z.card,pad=6,[c,g]=mk(d+pad*2,d*1.25+pad*2);g.translate(pad+d/2,pad+d*.62);
      if(night){g.fillStyle='#f08a24';g.beginPath();g.ellipse(-d*.18,0,d*.34,d*.44,0,0,7);g.ellipse(d*.18,0,d*.34,d*.44,0,0,7);g.fill();g.fillStyle='#e07a1f';g.beginPath();g.ellipse(0,0,d*.3,d*.46,0,0,7);g.fill();
        g.fillStyle='#4f7a2c';g.fillRect(-3,-d*.58,6,d*.16);g.fillStyle='#3a1d08';}
      else{g.fillStyle=COL[kind%COL.length];g.strokeStyle='#c8b98f';g.lineWidth=1.5;const bw=d*.86,bh=d*1.04;g.beginPath();
        if(kind%2){g.moveTo(-bw/2,-bh/2);g.lineTo(-bw/2-6,-bh/2+10);g.lineTo(-bw/2,-bh/2+14);g.lineTo(-bw/2,bh/2);g.lineTo(bw/2,bh/2);g.lineTo(bw/2,-bh/2+14);g.lineTo(bw/2+6,-bh/2+10);g.lineTo(bw/2,-bh/2);g.closePath();}
        else g.rect(-bw/2,-bh/2,bw,bh);g.fill();g.stroke();g.fillStyle='#c9473f';g.fillRect(-bw/2+4,-bh/2-5,6,8);g.fillRect(bw/2-10,-bh/2-5,6,8);g.fillStyle='#1f3350';}
      g.font='900 '+Math.round(d*.62)+'px '+(getComputedStyle(document.body).fontFamily||'sans-serif');g.textAlign='center';g.textBaseline='middle';g.fillText(ch,0,night?d*.04:2);
      return spr[key]=c;}
    // ---- слово сверху ----
    function wHtml(){let s='';for(let i=0;i<W.length;i++)s+='<b class="'+(i<k?'on':i===k?'cur':'')+'">'+esc(W.charAt(i))+'</b>';wEl.innerHTML=s;}
    function say(t,cls){msg.textContent=t;msg.className='zmc-lv-msg on'+(cls?' '+cls:'');clearTimeout(say.t);say.t=setTimeout(()=>{msg.className='zmc-lv-msg';},1100);}
    // ---- бельё ----
    function onScreen(ch){for(const f of fl)if(f.c===ch&&!f.got)return true;return false;}
    function spawn(){if(!sizes)lay();const z=sizes,need=W.charAt(k);let ch;
      const p=calm?.7:.55;const n2=W.charAt(k+1),n3=W.charAt(k+2);
      if(!onScreen(need)&&(needSince>.7||o.rnd()<.85))ch=need;else if(n2&&!onScreen(n2)&&o.rnd()<.7)ch=n2;else if(n3&&!onScreen(n3)&&o.rnd()<.4)ch=n3;else if(o.rnd()<p*.4)ch=need;else{do ch=AL.charAt(Math.floor(o.rnd()*AL.length));while(ch===need);}
      if(ch===need){needSince=0;FPS.nd=(FPS.nd|0)+1;}
      const m=z.card*.7,xx=m+o.rnd()*(z.w-2*m);fl.push({c:ch,x:xx,y:z.lineY+6,v:z.spd*(.85+o.rnd()*.4),ph:o.rnd()*6,kind:Math.floor(o.rnd()*5),got:0,a:0});}
    function catch1(f){f.got=1;const need=W.charAt(k);
      if(f.c===need){k++;sc++;try{host.snd.letter&&host.snd.letter(k);}catch(e){}flash=.25;
        if(k>=W.length){sc+=2;words++;try{host.snd.word&&host.snd.word(W.length,words);}catch(e){}say(W+'! +2','ok');
          wi++;W=WL[wi%WL.length];k=0;fl=fl.filter(q=>q.y>sizes.lineY+sizes.h*.3);}
        wHtml();}
      else{wrong++;shake=.3;try{host.snd.bad&&host.snd.bad();}catch(e){}if(wrong<=2||wrong%3===0)say('Не та! Нужна «'+need+'»');}}
    // ---- кадр ----
    const FPS={n:0,t:0};host.el._zmcFps=FPS;
    function frame(dt){if(started&&!over){FPS.n++;FPS.t+=dt;}if(!sizes)lay();const z=sizes;if(!bg)drawBg();if(!catC)catC=drawCat();
      if(started&&!over){t+=dt;left=Math.max(0,TIME-t);acc+=dt;needSince+=dt;
        const tp=Math.ceil(left);if(tp!==lastTop){lastTop=tp;host.top('⏱ '+tp+' с · '+sc);}
        if(acc>(calm?1.0:.72)){acc=0;spawn();}
        if(left<=0)end();}
      // кот
      const sp=z.w*1.6;if(held.L)cat.tx=cat.x-sp*.12;if(held.R)cat.tx=cat.x+sp*.12;
      cat.tx=Math.min(z.w-z.catW/2,Math.max(z.catW/2,cat.tx));const dx=cat.tx-cat.x,mv=Math.sign(dx)*Math.min(Math.abs(dx),sp*dt);cat.x+=mv;if(Math.abs(mv)>.5)cat.face=mv>0?1:-1;
      // бельё
      const cy=z.ground-z.catH*.72,hit=z.catW*.48;
      for(const f of fl){if(f.got){f.a+=dt;continue;}f.y+=f.v*dt;f.x+=Math.sin(t*1.7+f.ph)*z.s*28*dt;
        if(f.y>cy-z.card*.4&&f.y<cy+z.card*.5&&Math.abs(f.x-cat.x)<hit)catch1(f);}
      fl=fl.filter(f=>f.got?f.a<.25:f.y<z.h+z.card);
      // рисуем
      x.setTransform(dpr,0,0,dpr,0,0);x.drawImage(bg,0,0,z.w,z.h);
      for(const f of fl){const s=sprite(f.c,f.kind),sw=s.width/dpr,sh=s.height/dpr,r=Math.sin(t*3+f.ph)*.28;
        if(f.got){x.globalAlpha=Math.max(0,1-f.a*4);}const c=Math.cos(r),sn=Math.sin(r),sc2=f.got?1+f.a*2:1;
        x.setTransform(dpr*c*sc2,dpr*sn*sc2,-dpr*sn*sc2,dpr*c*sc2,dpr*f.x,dpr*f.y);x.drawImage(s,-sw/2,-sh/2,sw,sh);x.globalAlpha=1;}
      const jx=shake>0?Math.sin(t*60)*4*z.s:0,jy=flash>0?-6*z.s*Math.sin(flash/.25*Math.PI):0;shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt);
      x.setTransform(dpr*cat.face,0,0,dpr,dpr*(cat.x+jx),dpr*(z.ground-z.catH+4*z.s+jy));
      if(catC)x.drawImage(catC,-z.catW/2,0,z.catW,z.catH);else{x.fillStyle='#f0a24c';x.beginPath();x.arc(0,z.catH*.6,z.catW*.35,0,7);x.fill();}
      x.setTransform(dpr,0,0,dpr,0,0);}
    function end(){if(over)return;over=true;say('Время!','ok');try{host.snd.win&&host.snd.win();}catch(e){}
      setTimeout(()=>host.finish({sc,st:tierOf(sc,calm),h:0,label:'Букв: '+(sc-2*words)+' · слов: '+words+(wrong?' · чужих: '+wrong:'')}),900);}
    // ---- ввод ----
    const toX=px=>{cat.tx=px;};
    host.ptr(C.cv,{down:(px)=>toX(px),move:(px,py,ev)=>{if(ev.pointerType==='mouse'||ev.buttons||ev.pressure>0)toX(px);}});
    const kd=k2=>k2==='ArrowLeft'||k2==='a'||k2==='A'||k2==='ф'||k2==='Ф'?'L':k2==='ArrowRight'||k2==='d'||k2==='D'||k2==='в'||k2==='В'?'R':'';
    host.keys(k2=>{const d=kd(k2);if(!d)return false;held[d]=1;return true;});
    const ku=e=>{const d=kd(e.key);if(d)held[d]=0;};window.addEventListener('keyup',ku,true);
    const bl=()=>{held.L=held.R=0;};window.addEventListener('blur',bl);
    host.onQuit(()=>{window.removeEventListener('keyup',ku,true);window.removeEventListener('blur',bl);clearTimeout(say.t);});
    host.onResize(()=>{sizes=null;catC=null;});
    // бот стенда: k — доля «идёт к нужной букве»; иначе — бредёт куда попало
    host.bot=k2=>{if(!started||over||!sizes)return;const need=W.charAt(k),z=sizes;let best=null;
      for(const f of fl)if(!f.got&&f.c===need&&f.y<z.ground&&(!best||f.y>best.y))best=f;
      if(best&&Math.random()<k2)cat.tx=best.x;else if(!best||Math.random()<.3)cat.tx=Math.random()*z.w;};
    catImg=catImg||(()=>{const im=new Image();im.src=catSrc();return im;})();if(!catImg.complete)catImg.onload=()=>{catC=null;};
    wHtml();host.top('⏱ '+TIME+' с');
    host.loop(frame);
    host.intro({who:'yat',text:night?'Мяу! В пионерлагере ветер сорвал <b>тыквы-буквы</b>! Лови их лапой <b>по порядку</b> — слово видно сверху. Чужие пусть катятся.':
      'Мр-р! Ветер срывает бельё-буквы! Лови их лапой <b>по порядку</b> — слово видно сверху. Чужие — пусть летят к соседям.',
      btn:'Хвост трубой!',hint:(host.pc?'мышь или '+host.kc('←')+' '+host.kc('→'):'води котом пальцем')+' · 30 секунд · проиграть нельзя'+(calm?' · спокойный режим':'')})
      .then(()=>{started=true;sizes=null;spawn();});}});
(function(){if(document.getElementById('zmc-lv-css'))return;const st=document.createElement('style');st.id='zmc-lv-css';st.textContent=
'.zmg-lovit .zmg-el{position:relative;overflow:hidden}.zmc-lv-cv{z-index:0}'+
'.zmc-lv{position:absolute;left:0;right:0;top:0;z-index:1;display:flex;flex-direction:column;align-items:center;pointer-events:none;padding-top:8px}'+
'.zmc-lv-w{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;padding:6px 10px;border-radius:14px;background:rgba(255,255,255,.88);box-shadow:0 2px 6px rgba(0,0,0,.12)}'+
'.zmc-lv-w b{display:flex;align-items:center;justify-content:center;width:34px;height:40px;border-radius:8px;background:#f3ead8;border:2px dashed #c8b98f;color:#a99a7a;font:900 24px/1 var(--font,Arial)}.zmc-lv-w b.cur{color:#1f3350}.zmc-lv-w b.on{color:#237a3b}'+
'.zmc-lv-w b.cur{border:2px solid #e07a1f;background:#fff7e8;animation:zmcCur 1s infinite}.zmc-lv-w b.on{border:2px solid #4c9a52;background:#e3f4e1;animation:zmcPop .3s}'+
'.zmc-lv-msg{margin-top:6px;padding:4px 12px;border-radius:12px;background:rgba(31,51,80,.85);color:#fff;font:800 16px/1.3 var(--font,Arial);opacity:0;transition:opacity .2s}'+
'.zmc-lv-msg.on{opacity:1}.zmc-lv-msg.ok{background:rgba(35,122,59,.9)}'+
'.zmc-lv.night .zmc-lv-w{background:rgba(40,30,70,.85)}.zmc-lv.night .zmc-lv-w b{background:#3b2b5c;color:#ffd7a0;border-color:#8a74b8}.zmc-lv.night .zmc-lv-w b.on{background:#5a3d1a;border-color:#f08a24}'+
'@keyframes zmcCur{50%{transform:translateY(-3px)}}@keyframes zmcPop{0%{transform:scale(.6)}70%{transform:scale(1.15)}100%{transform:none}}'+
'@media (max-height:600px){.zmc-lv-w b{width:30px;height:34px;font-size:20px}}'+
'@media (prefers-reduced-motion:reduce){.zmc-lv-w b.cur,.zmc-lv-w b.on{animation:none}}';
document.head.appendChild(st);})();
})();
