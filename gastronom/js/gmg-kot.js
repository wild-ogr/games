'use strict';
/* gb-MGC мини-игра №15 «Кот у колбасы» (ведущий — кот Пломбир). 10.10.2026. Договор — шапка js/gmg-core.js (MG0).
   «Бей-крота» 30 с: Пломбир высовывается из-за прилавка к докторской — нажмите на него, пока не откусил («Брысь!»).
   Иногда тянется рука покупателя с рублём — её не трогать (ошибка не наказывает очками, только звёздами).
   Места: 2 ряда × 3 (телефон) или × 4 (ширина ≥ 560). Спокойный режим — кот медленнее и реже.
   Звёзды: доля пойманных ≥ 85 % и ≤1 задетого покупателя — 3★, ≥ 65 % — 2★, ≥ 35 % — 1★. Очки — сколько раз шуганули.
   Рисунок кота — ART PLOMBIR.draw (позы sneak → scared «шуганули» / grab «стащил», шляпа witch), иначе свой запасной в цветах drawCat.
   Шкурка Хэллоуина (host.fest.id==='halloween'): ночь, тыквы на прилавке, кот в шляпе ведьмы и плаще.
   Управление: нажатие/щелчок, ПК — цифры 1–8 по местам. Тексты — js/gmg-kot-data.js. Выключение: GB.flag('mg_kot') или KT_ON=false. */
(function(){
if(typeof GMG_REG!=='function')return;
const KT_ON=true;
if(!KT_ON)return;
const TIME=30;
const tier=(s,b,o)=>{const r=s/Math.max(1,s+b);return r>=.85&&o<=1?3:r>=.65?2:r>=.35?1:0;};
/* расписание захода от зерна: [время, место, 'c' кот | 'h' рука] — одно на всех в Затее дня */
function plan(rnd,n,calm){const L=[];let tt=.6;const gap=calm?1.05:.72;
  while(tt<TIME-.8){const sp=Math.floor(rnd()*n),kind=tt>2&&rnd()<.2?'h':'c';L.push([+tt.toFixed(2),sp,kind]);tt+=gap*(.75+rnd()*.5)*(tt>15?.88:1);}
  return L;}
GMG_REG({id:'kot',n:15,host:'plombir',who:'plombir',deps:['js/gmg-mgc.js','js/gmg-kot-data.js'],
  open:()=>true,
  lines:{get good(){return GMC.line('kot','st3');},get ok(){return GMC.line('kot','st2');},get bad(){return GMC.line('kot','st1');}},
  sim(o,k){const L=plan(o.rnd,6,false);let s=0,b=0,oo=0;
    for(const e of L){if(e[1]<0||e[1]>=6)throw new Error('kot: место');if(e[2]==='c'){if(o.rnd()<.4+.55*k)s++;else b++;}else if(o.rnd()<(1-k)*.3)oo++;}
    return {sc:s,st:tier(s,b,oo)};},
  run(host,o){
    GMC.art=host.art||null;const K=GMC,TX=K.T('kot'),calm=!!host.calm,weak=K.weak(host),hw=!!(host.fest&&host.fest.id==='halloween');
    K.css('gmc-kt-css','.gmg-kot .gmg-el,.gmg-kot .zmg-el{position:relative;overflow:hidden}');
    const C=K.cv(host),x=C.x,say=K.msg(host);
    let Z=null,cols=3;
    function lay(){const w=C.w,h=C.h;cols=w>=560?4:3;const fw=Math.min(w-16,cols*170),cw=fw/cols,rows=2;
      const top=Math.max(54,h*.08),rh=Math.min((h-top-16)/rows,cw*1.6);
      Z={w,h,cw,rh,x0:(w-fw)/2,y0:top+Math.max(0,(h-top-20-rh*rows)/2),n:cols*rows};}
    lay();
    const N0=Z.n;   // число мест фиксируем на заход (раскладка от зерна)
    const PL=plan(o.rnd,N0,calm);
    const spots=[];for(let i=0;i<N0;i++)spots.push({who:null,a:0,up:0,life:0,bite:0,sz:1,fx:0,txt:'',tt:0});
    let started=false,over=false,t=0,el=0,pi=0,sc=0,bit=0,oops=0;
    function spotXY(i){const c=i%cols,r=Math.floor(i/cols);return [Z.x0+Z.cw*(c+.5),Z.y0+Z.rh*(r+1)];}
    // ---- кот: рисунок ART, иначе свой ----
    function catHead(g,cx,by,s,mood){
      if(window.PLOMBIR&&typeof PLOMBIR.draw==='function'){try{PLOMBIR.draw(g,cx,by,s*1.15,mood==='shoo'?'scared':mood==='grab'?'grab':'sneak',t,{dir:1,hat:hw?'witch':undefined});return;}catch(e){}}
      const u=s/100;g.save();g.translate(cx,by);
      if(hw){g.fillStyle='#3b2350';g.beginPath();g.moveTo(-46*u,0);g.quadraticCurveTo(0,-40*u,46*u,0);g.fill();}
      // лапа тянется к колбасе
      g.fillStyle='#e0913f';K.rr(g,18*u,-34*u,16*u,34*u,8*u);g.fill();g.fillStyle='#f3c08a';g.beginPath();g.ellipse(26*u,-34*u,9*u,6*u,0,0,7);g.fill();
      // голова
      g.fillStyle='#e0913f';g.beginPath();g.ellipse(-4*u,-46*u,34*u,30*u,0,0,7);g.fill();
      for(const k2 of[-1,1]){g.beginPath();g.moveTo(-4*u+k2*30*u,-58*u);g.lineTo(-4*u+k2*24*u,-86*u);g.lineTo(-4*u+k2*8*u,-72*u);g.closePath();g.fill();
        g.fillStyle='#f6b9a6';g.beginPath();g.moveTo(-4*u+k2*25*u,-63*u);g.lineTo(-4*u+k2*22*u,-79*u);g.lineTo(-4*u+k2*12*u,-70*u);g.closePath();g.fill();g.fillStyle='#e0913f';}
      g.strokeStyle='rgba(140,60,15,.55)';g.lineWidth=3.5*u;for(const dx of[-14,-4,6]){g.beginPath();g.moveTo(dx*u,-75*u);g.lineTo((dx+1)*u,-62*u);g.stroke();}
      g.fillStyle='#f3c08a';g.beginPath();g.ellipse(-4*u,-34*u,18*u,12*u,0,0,7);g.fill();
      g.fillStyle='#2b2b2b';if(mood==='shoo'){g.lineWidth=3*u;g.strokeStyle='#2b2b2b';for(const k2 of[-1,1]){g.beginPath();g.moveTo(-4*u+k2*8*u,-52*u);g.lineTo(-4*u+k2*18*u,-46*u);g.stroke();}}
      else for(const k2 of[-1,1]){g.beginPath();g.ellipse(-4*u+k2*12*u,-50*u,5*u,7*u,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-4*u+k2*12*u+1.5*u,-52*u,1.8*u,0,7);g.fill();g.fillStyle='#2b2b2b';}
      g.fillStyle='#e07a7a';g.beginPath();g.moveTo(-8*u,-40*u);g.lineTo(0,-40*u);g.lineTo(-4*u,-36*u);g.closePath();g.fill();
      g.strokeStyle='rgba(60,40,20,.6)';g.lineWidth=1.4*u;for(const k2 of[-1,1])for(const dy of[-2,3]){g.beginPath();g.moveTo(-4*u+k2*10*u,-36*u+dy*u);g.lineTo(-4*u+k2*32*u,-38*u+dy*1.6*u);g.stroke();}
      g.restore();if(hw)hat(g,cx-4*s/100,by-s*.8,s);}
    function hat(g,cx,by,s){const u=s/100;g.fillStyle='#2a1838';g.beginPath();g.ellipse(cx,by,34*u,7*u,0,0,7);g.fill();
      g.beginPath();g.moveTo(cx-18*u,by-2*u);g.lineTo(cx+6*u,by-50*u);g.lineTo(cx+18*u,by-2*u);g.closePath();g.fill();g.fillStyle='#f08a24';g.fillRect(cx-16*u,by-9*u,32*u,5*u);}
    function hand(g,cx,by,s){const u=s/100;g.save();g.translate(cx,by);g.fillStyle='#35557a';K.rr(g,-14*u,-30*u,28*u,40*u,8*u);g.fill();
      g.fillStyle='#f5c9a8';g.beginPath();g.ellipse(0,-42*u,16*u,14*u,0,0,7);g.fill();for(let j=0;j<4;j++){K.rr(g,-14*u+j*7.5*u,-66*u,6.5*u,20*u,3*u);g.fill();}
      g.fillStyle='#d7c58f';g.save();g.rotate(-.2);K.rr(g,-24*u,-62*u,40*u,20*u,3*u);g.fill();g.fillStyle='#8a7a40';g.font='700 '+Math.round(12*u)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
      g.fillText(typeof LANG!=='undefined'&&LANG==='en'?'1 rub':'1 руб.',-4*u,-52*u);g.restore();g.restore();}
    function bg(g){const z=Z;if(hw){const gr=g.createLinearGradient(0,0,0,z.h);gr.addColorStop(0,'#241a3a');gr.addColorStop(1,'#4a2d4f');g.fillStyle=gr;}else g.fillStyle='#f3ead6';g.fillRect(0,0,z.w,z.h);
      if(hw&&!weak){g.fillStyle='#fff7d6';g.beginPath();g.arc(z.w*.85,40,18,0,7);g.fill();}
      if(!hw){g.fillStyle='#e6dcc4';for(let yy=0;yy<z.h;yy+=30)for(let xx=(yy/30%2)*15;xx<z.w;xx+=30)g.fillRect(xx,yy,28,28);g.fillStyle='#f3ead6';}
      for(let r=0;r<2;r++){const y=z.y0+z.rh*(r+1);g.fillStyle=hw?'#5b3a29':(r?'#8a5a33':'#b9cfd6');g.fillRect(z.x0-6,y-6,z.cw*cols+12,14);
        g.fillStyle=hw?'#3d271c':(r?'#74482a':'#9fb8c1');g.fillRect(z.x0-6,y+8,z.cw*cols+12,r?z.h-y:z.rh*.12);}}
    function frame(dt){if(!Z)lay();const g=x,z=Z;g.setTransform(C.dpr,0,0,C.dpr,0,0);
      if(started&&!over){el+=dt;const left=Math.max(0,TIME-el);host.top('⏱ '+Math.ceil(left)+' · 🐾 '+sc);
        while(pi<PL.length&&PL[pi][0]<=el){const e=PL[pi++];const s=spots[e[1]];if(!s.who&&s.tt<=0){s.mood='';s.who=e[2];s.a=0;s.up=1;s.life=e[2]==='c'?(calm?1.9:1.35)*(el>15?.88:1):1.6;}}
        if(left<=0)end();}
      t+=dt;bg(g);
      for(let i=0;i<N0;i++){const s=spots[i],[cx,by]=spotXY(i),sz=Math.min(z.cw,z.rh)*.9;
        // кот/рука выезжает из-за прилавка (рисуется ДО колбасы — за ней)
        if(s.who){s.a=Math.min(1,s.a+dt*(s.up>0?6:-6));if(s.up>0){s.life-=dt;if(s.life<=0)timeout(i);}if(s.up<0&&s.a<=0){s.who=null;}
          g.save();g.beginPath();g.rect(cx-z.cw/2,by-z.rh,z.cw,z.rh-4);g.clip();const lift=(1-s.a)*sz*.8+(s.fx?Math.sin(t*40)*3:0);
          if(s.who==='c')catHead(g,cx-sz*.1,by+lift,sz,s.mood);else hand(g,cx,by+lift,sz*.85);g.restore();}
        // докторская на тарелке
        g.fillStyle=hw?'#c7b8d8':'#fff';g.beginPath();g.ellipse(cx+sz*.18,by-4,sz*.38,sz*.08,0,0,7);g.fill();
        if(hw&&!weak&&i%2===0){g.fillStyle='#f08a24';g.beginPath();g.ellipse(cx-sz*.32,by-sz*.1,sz*.12,sz*.1,0,0,7);g.fill();g.fillStyle='#4f7a2c';g.fillRect(cx-sz*.33,by-sz*.24,3,6);}
        s.bite=Math.max(0,s.bite-dt*.25);g.save();g.beginPath();g.rect(cx-sz*.5,by-sz,sz*(1-s.bite*.45),sz+4);g.clip();K.good(g,9,cx+sz*.18,by-2,sz*.95);g.restore();
        if(host.pc){g.fillStyle='rgba(0,0,0,.35)';g.font='700 13px sans-serif';g.textAlign='left';g.textBaseline='top';g.fillText(String(i+1),cx-sz*.48,by-sz*.3);}
        if(s.tt>0){s.tt-=dt;g.globalAlpha=Math.min(1,s.tt*3);g.font='900 '+Math.round(Math.max(17,Math.min(22,sz*.2)))+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
          const ww=g.measureText(s.txt).width+16,tx=Math.max(ww/2+4,Math.min(z.w-ww/2-4,cx)),ty=by-sz*.95;g.fillStyle=s.col||'#237a3b';K.rr(g,tx-ww/2,ty-14,ww,28,10);g.fill();g.fillStyle='#fff';g.fillText(s.txt,tx,ty);g.globalAlpha=1;}}}
    function pop(i,txt,col){const s=spots[i];s.txt=txt;s.tt=.9;s.col=col;}
    function timeout(i){const s=spots[i];s.up=-1;if(s.who==='c'){bit++;s.bite=1;s.mood='grab';pop(i,K.pick(TX.bite,o.rnd)||'Ам!','#c2410c');try{host.snd.grumble&&host.snd.grumble();}catch(e){}}}
    function hit(i){if(!started||over||i<0||i>=N0)return;const s=spots[i];if(!s.who||s.up<0||s.a<.35)return;
      if(s.who==='c'){sc++;s.up=-1;s.mood='shoo';s.fx=0;pop(i,K.pick(TX.shoo,o.rnd)||'Брысь!','#237a3b');try{host.snd.pick&&host.snd.pick();}catch(e){}}
      else{oops++;s.fx=1;setTimeout(()=>{s.fx=0;},300);say(K.pick(TX.oops,o.rnd)||'Ой!','no',1500);try{host.snd.back&&host.snd.back();}catch(e){}}}
    function end(){if(over)return;over=true;const m=host.mem();m.bs=Math.max(+m.bs||0,sc);m.n=(+m.n||0)+1;try{host.snd.till&&host.snd.till(2);}catch(e){}
      const st=tier(sc,bit,oops);const lbl=K.sub(TX.label||'{s}',{s:sc,b:bit,o:oops?K.sub(TX.oopsL||'',{o:oops}):''});
      setTimeout(()=>host.finish({sc,st,h:oops,label:lbl,line:K.line('kot','st'+st,o.rnd)}),700);}
    host.ptr(C.cv,{down:(px,py)=>{if(!Z)return;let best=-1,bd=1e9;for(let i=0;i<N0;i++){const [cx,by]=spotXY(i);if(Math.abs(px-cx)<Z.cw/2&&py<by+14&&py>by-Z.rh){const d=Math.abs(px-cx)+Math.abs(py-by);if(d<bd){bd=d;best=i;}}}if(best>=0)hit(best);}});
    host.keys(k=>{if(/^[1-8]$/.test(k)){hit(+k-1);return true;}return false;});
    host.onResize(()=>{Z=null;});
    host.bot=k=>{if(!started||over)return;for(let i=0;i<N0;i++){const s=spots[i];if(s.who==='c'&&s.up>0&&s.a>.5&&Math.random()<k)hit(i);else if(s.who==='h'&&s.up>0&&Math.random()<(1-k)*.15)hit(i);}};
    host.top("⏱ "+TIME);host.loop(frame);
    host.intro({who:'plombir',text:K.esc(K.pick(hw?(TX.introHw||TX.intro):TX.intro,o.rnd)),btn:TX.btn||'Начать',
      hint:(host.pc?(TX.hint&&TX.hint.pc):(TX.hint&&TX.hint.tel))+' · 30 секунд'+(calm?' · спокойный режим':'')})
      .then(()=>{started=true;});}});
})();
