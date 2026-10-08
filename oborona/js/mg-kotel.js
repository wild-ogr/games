'use strict';
/* OB:MGA №14 «Котёл тётушки Яги» (kind 'buff'). Яга показывает рецепт зелья — ингредиенты по очереди летят в котёл; повтори порядок нажатиями (как «Саймон»).
   4 зелья: 3, 4, 5, 6 ингредиентов. Одна ошибка прощается (Яга покажет ещё раз), вторая — конец; «Яга подскажет» за рекламу — ещё раз (1 на игру).
   Без таймера и без спешки. Итог: host.done({score: верных нажатий, tier: 0..3 по сваренным зельям, extra:{buf:{k:'kotel', fog:{slow:.15, dur}}}})
   — разовая чара «Туман» в следующем бою кампании: нечисть −15 % скорости на dur с (6/7/8 с по ступени). Применяет оболочка MG0. */
const KOTEL={R:[3,4,5,6],DUR:[0,6,7,8],SLOW:.15};
const KOTEL_ING=[
  {id:'muh',n:{ru:'Мухомор',en:'Toadstool'},col:'#e8433a'},
  {id:'frog',n:{ru:'Лягушка',en:'Frog'},col:'#5ab04a'},
  {id:'pero',n:{ru:'Перо Жар-птицы',en:'Firebird feather'},col:'#ffb02e'},
  {id:'kost',n:{ru:'Косточка',en:'Bone'},col:'#f1ebdc'},
  {id:'trava',n:{ru:'Плакун-трава',en:'Weeping herb'},col:'#b86bff'},
  {id:'gem',n:{ru:'Самоцвет',en:'Gemstone'},col:'#4ab8f0'}];
art('mga_ing_muh',40,g=>{ell(g,0,10,6,9,'#f4ead2',{hl:.3});ell(g,0,15,9,3,'rgba(0,0,0,.15)',{ol:false,flat:true});
  shp(g,'#e8433a',{hl:.55},[-17,-14,17,4],()=>{g.moveTo(-17,3);g.quadraticCurveTo(-17,-15,0,-15);g.quadraticCurveTo(17,-15,17,3);g.quadraticCurveTo(0,-1,-17,3);g.closePath();});
  for(const [x,y,r] of[[-9,-5,2.6],[-1,-10,2.2],[7,-6,2.8],[12,-1,1.6],[-13,0,1.6],[2,-3,1.8]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle='#fff6e8';g.fill();}shine(g,-6,-10,4,2,.35);});
art('mga_ing_frog',40,g=>{g.scale(1.25,1.25);ART.frog.fn(g);});
art('mga_ing_pero',40,g=>{g.save();g.rotate(-.6);glow(g,0,0,18,'#ffb02e');shp(g,'#ff8a1e',{hl:.5},[-7,-18,7,16],()=>{g.moveTo(0,16);g.quadraticCurveTo(-9,4,-6,-8);g.quadraticCurveTo(-3,-17,0,-19);g.quadraticCurveTo(4,-17,7,-8);g.quadraticCurveTo(9,4,0,16);g.closePath();});
  shp(g,'#ffd84a',{},[-4,-14,4,8],()=>{g.moveTo(0,8);g.quadraticCurveTo(-5,0,-3,-8);g.quadraticCurveTo(0,-14,3,-8);g.quadraticCurveTo(5,0,0,8);g.closePath();});
  ell(g,0,-8,2.6,3.4,'#3a7ad8',{lw:.6});ln(g,[0,20,0,-14],'#a0501a',1.2);g.restore();});
art('mga_ing_kost',40,g=>{g.save();g.rotate(-.7);rrect(g,-3.5,-13,7,26,3);g.fillStyle=grad(g,0,0,10,'#f1ebdc',.4,-.25);g.fill();outline(g,'#f1ebdc',1);
  for(const y of[-14,14])for(const x of[-3.5,3.5])ell(g,x,y,4.6,4.6,'#f1ebdc',{hl:.4});rrect(g,-3,-11,6,22,2.5);g.fillStyle='#f1ebdc';g.fill();shine(g,-1,-4,1.2,5,.5);g.restore();});
art('mga_ing_trava',40,g=>{for(const [a,c] of[[-.35,'#3a8a3a'],[0,'#4aa04a'],[.35,'#3a8a3a']]){g.save();g.rotate(a);ln(g,[0,16,0,-12],'#2f6a2f',1.8);for(let i=0;i<4;i++){ell(g,-3.5,-8+i*5,3.4,1.8,c,{lw:.5,rot:-.5});ell(g,3.5,-8+i*5,3.4,1.8,c,{lw:.5,rot:.5});}
    for(let i=0;i<3;i++)ell(g,0,-14-i*3.2,2.3,2,'#b86bff',{lw:.5});g.restore();}rrect(g,-5,9,10,4,1.5);g.fillStyle='#c0392b';g.fill();});
art('mga_ing_gem',40,g=>{glow(g,0,0,19,'#5ac8ff');g.save();g.scale(2.6,2.6);gem(g,4.6,'#3aa8f0');g.restore();});
/* котёл: центр (x,y) — середина пуза, ширина w; col — цвет зелья; t — время; k — сила кипения 0..1 */
function kotelPot(g,x,y,w,col,t,k,dark){const r=w/2;
  // ножки
  for(const s of[-1,1]){g.beginPath();g.moveTo(x+s*r*.55,y+r*.55);g.lineTo(x+s*r*.7,y+r*.95);g.lineTo(x+s*r*.5,y+r*.95);g.closePath();g.fillStyle='#22222c';g.fill();}
  // пузо
  g.save();g.beginPath();g.ellipse(x,y+r*.12,r,r*.82,0,0,TAU);const gr=g.createRadialGradient(x-r*.35,y-r*.2,r*.1,x,y,r*1.1);gr.addColorStop(0,'#5a5a6a');gr.addColorStop(.5,'#2a2a36');gr.addColorStop(1,'#0e0e16');g.fillStyle=gr;g.fill();g.lineWidth=3;g.strokeStyle='#08080e';g.stroke();
  // отсвет зелья на боку
  g.globalCompositeOperation='lighter';const rg=g.createRadialGradient(x,y-r*.5,0,x,y-r*.5,r*1.1);rg.addColorStop(0,rgba(col,.35*k+.1));rg.addColorStop(1,rgba(col,0));g.fillStyle=rg;g.fill();g.globalCompositeOperation='source-over';
  g.beginPath();g.ellipse(x-r*.45,y-r*.05,r*.16,r*.38,-.3,0,TAU);g.fillStyle='rgba(255,255,255,.12)';g.fill();
  // заклёпки и обруч
  g.strokeStyle='#4a4a58';g.lineWidth=r*.07;g.beginPath();g.ellipse(x,y+r*.05,r*.98,r*.3,0,.05,Math.PI-.05);g.stroke();g.restore();
  // горловина
  const ry=y-r*.52;g.beginPath();g.ellipse(x,ry,r*.9,r*.24,0,0,TAU);g.fillStyle='#2a2a36';g.fill();g.lineWidth=3;g.strokeStyle='#08080e';g.stroke();
  g.beginPath();g.ellipse(x,ry,r*.92,r*.25,0,Math.PI,TAU);g.lineWidth=r*.09;g.strokeStyle='#4e4e5e';g.stroke();
  // зелье
  g.save();g.beginPath();g.ellipse(x,ry+r*.03,r*.76,r*.17,0,0,TAU);g.clip();const pg=g.createRadialGradient(x,ry,0,x,ry,r*.8);pg.addColorStop(0,dark?'#3a3a3a':shade(col,.45));pg.addColorStop(1,dark?'#141414':shade(col,-.25));g.fillStyle=pg;g.fillRect(x-r,ry-r*.3,w,r*.6);
  for(let i=0;i<7;i++){const ph=(t*(.8+k)+i*.37)%1,bx=x+Math.sin(i*2.1+t*.5)*r*.55,by=ry+Math.cos(i*1.7)*r*.08,br=r*(.03+.05*ph)*(.5+k);g.beginPath();g.arc(bx,by,br,0,TAU);g.fillStyle=rgba(dark?'#606060':shade(col,.6),1-ph);g.fill();}
  g.restore();g.save();g.globalCompositeOperation='lighter';const sg=g.createRadialGradient(x,ry,0,x,ry,r*1.2);sg.addColorStop(0,rgba(dark?'#404040':col,.45+.3*k));sg.addColorStop(1,rgba(col,0));g.fillStyle=sg;g.fillRect(x-r*1.3,ry-r*1.2,w*1.3,r*1.6);g.restore();}
MG_REG({id:'kotel',n:{ru:'Котёл тётушки Яги',en:'Auntie Yaga’s Cauldron'},icon:'flask',kind:'buff',
  open:()=>{try{return chaptersDone()>=3;}catch(e){return false;}},
  bot(o){o=o||{};const q=mgakSkill(o);let done=0,sc=0,miss=0;for(const n of KOTEL.R){let ok=false;while(miss<2){const p=Math.pow(.5+.48*q,n);if(Math.random()<p){ok=true;sc+=n;break;}miss++;sc+=Math.floor(n/2);}if(!ok)break;done++;}
    const tier=done>=4?3:done>=2?2:done?1:0;return {score:sc,tier,dur:KOTEL.DUR[tier]};},
  run(host,o){
    const st=mgakStage(host,o),r=o.rnd||mulberry(o.seed>>>0),lv=o.lvl||0,step=(lv>=6?.62:lv>=3?.72:.82)*mgakCalmK(o);
    const R=KOTEL.R.map(n=>{const a=[];for(let i=0;i<n;i++){let v;do{v=Math.floor(r()*6);}while(a.length&&v===a[a.length-1]&&r()<.7);a.push(v);}return a;});
    const G2={ph:'intro',ri:0,seq:null,pos:0,show:-1,showT:0,miss:0,sc:0,done:0,col:'#6ad04a',dark:0,flyIng:[],lit:{},say:'',sayT:0,adUsed:false,end:false,boil:.3,wait:0};
    let L={},bg=null;
    st.onFit=function(){const W=st.W,H=st.H,u=st.u,wide=st.wide;
      const cx=W/2,cy=wide?H*.47:H*.46,cw=(wide?210:186)*u,pr=Math.max(34,(wide?44:46)*u);const plates=[];
      if(wide){const sp=Math.min(140*u,(W-80)/6);for(let i=0;i<6;i++)plates.push({x:W/2+(i-2.5)*sp,y:H*.86});}
      else{const sp=Math.min(122*u,W*.31);for(let i=0;i<6;i++)plates.push({x:W/2+(i%3-1)*sp,y:H*(i<3?.71:.86)});}
      L={W,H,u,wide,cx,cy,cw,pr,plates,yx:wide?W/2+cw*1.15:W*.8,yy:wide?H*.4:H*.3,ix:wide?W/2-cw*1.35:W*.2,iy:wide?H*.38:H*.29};
      const dpr=st.dpr;bg=mkCanvas(W*dpr,H*dpr);const g=bg.getContext('2d');g.scale(dpr,dpr);
      mgakSky(g,W,H*.62,['#0e1230','#242a5a','#4a3a6e','#6a4a6a']);mgakStarsSky(g,W,H*.45,5,Math.round(W*H/2600));
      const mx=wide?W*.82:W*.74,my=H*.13,mr=34*u;const mg=g.createRadialGradient(mx,my,0,mx,my,mr*4);mg.addColorStop(0,'rgba(255,250,220,.5)');mg.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=mg;g.fillRect(mx-mr*4,my-mr*4,mr*8,mr*8);
      g.beginPath();g.arc(mx,my,mr,0,TAU);g.fillStyle='#fff6d8';g.fill();g.fillStyle='rgba(220,210,170,.5)';for(const [dx,dy,rr] of[[-10,-6,7],[8,6,5],[-2,12,4]]){g.beginPath();g.arc(mx+dx*u,my+dy*u,rr*u,0,TAU);g.fill();}
      const hor=H*.5;mgakHills(g,W,hor-60*u,40*u,'#2a2a4a',3,'#3a3a5e');mgakForest(g,W,hor-30*u,90*u,'#1a2436',7,'#24304a');mgakForest(g,W,hor+4*u,70*u,'#142030',12,'#1e2c40');
      const gy=hor+8*u,dg=g.createLinearGradient(0,gy,0,H);dg.addColorStop(0,'#2a3a2a');dg.addColorStop(1,'#1a2418');g.fillStyle=dg;g.fillRect(0,gy,W,H-gy);
      g.fillStyle='rgba(120,90,60,.35)';g.beginPath();g.ellipse(cx,cy+cw*.62,cw*1.25,cw*.3,0,0,TAU);g.fill();
      mgakGrassTufts(g,0,W,gy+10*u,H,'rgba(90,130,70,.35)',4,Math.round(W/8));
      mgakPut(g,'t_izba_3',L.ix,L.iy+20*u,(wide?190:150)*u,dpr);
      for(let i=0;i<7;i++){const q=mulberry(50+i);mgakPut(g,'d_shroom',W*(.05+q()*.9),gy+20*u+q()*(H-gy-40*u),24*u,dpr);}
      mgakPut(g,'kot',L.ix-(wide?80:58)*u,L.iy+(wide?70:58)*u,40*u,dpr);};
    st.fit();
    const ING=KOTEL_ING,say=(s,t)=>{G2.say=s;G2.sayT=t||1.6;};
    function fly(i,fromShow){const p=L.plates[i];G2.flyIng.push({i,x0:p.x,y0:p.y,t:0,dur:.5,show:fromShow});G2.lit[i]=.5;try{SND.star(i%4);}catch(e){}}
    function landIng(f){const ing=ING[f.i],u=L.u,x=L.cx,y=L.cy-L.cw*.52;G2.col=mix(G2.col,ing.col,.55);G2.boil=Math.min(1,G2.boil+.25);try{SND.splash();}catch(e){}
      mgakBurst(st,'dot',x,y,10,{col:ing.col,v:200,s:5*u,up:180,gr:500,dur:.7});mgakBurst(st,'spark',x,y-10*u,5,{col:'#fff6c0',v:150,gr:0,s:6*u});}
    function mix(a,b,k){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),c=(s)=>Math.round(((A>>s)&255)*(1-k)+((B>>s)&255)*k);return '#'+((1<<24)|(c(16)<<16)|(c(8)<<8)|c(0)).toString(16).slice(1);}
    function startShow(){G2.ph='show';G2.seq=R[G2.ri];G2.show=-1;G2.showT=.9;G2.pos=0;G2.dark=0;say(G2.miss?Lg('Ладно, смотри ещё раз…','Fine, watch again…'):Lg('Запоминай, касатик!','Watch closely, dearie!'),1.4);}
    function tap(i){if(G2.ph!=='input')return;const want=G2.seq[G2.pos];
      if(i===want){fly(i,false);G2.pos++;G2.sc++;if(G2.pos>=G2.seq.length){G2.ph='brew';G2.wait=1.3;}}
      else{G2.miss++;G2.dark=1;G2.lit[i]=-.6;st.shake=8;try{SND.lose();}catch(e){}const u=L.u;for(let k=0;k<6;k++)st.parts.push({k:'puff',x:L.cx+(Math.random()-.5)*60*u,y:L.cy-L.cw*.6,vx:(Math.random()-.5)*40,vy:-60-Math.random()*40,t:0,dur:1.1,s:70*u,col:1});
        if(G2.miss===1){say(Lg('Ой, не то! Покажу ещё раз.','Oops, not that! I’ll show you again.'),1.6);G2.ph='oops';G2.wait=1.6;}
        else if(!G2.adUsed&&!o.train&&host.adOk&&host.adOk()){say(Lg('Эх… Подсказать?','Oh dear… Want a hint?'),99);G2.ph='ask';}
        else{G2.ph='fail';G2.wait=1.4;say(Lg('Убежало зелье…','The potion boiled over…'),2);}}}
    function finish(){if(G2.end)return;G2.end=true;G2.ph='end';const d=G2.done,tier=d>=4?3:d>=2?2:d?1:0,dur=KOTEL.DUR[tier];
      mgakFinale(st,{good:tier>=2,title:tier>=3?Lg('Знатное зелье!','A splendid brew!'):tier?Lg('Зелье «Туман» готово!','The Mist potion is ready!'):Lg('Зелье не вышло…','No potion this time…'),
        sub:tier?(o.train?Lg('Тренировка: ','Practice: '):'')+Lg('В следующем бою — чара «Туман»: нечисть медленнее на 15 % ('+dur+' с)','Next battle: the Mist spell — monsters 15% slower ('+dur+' s)'):Lg('Яга ждёт тебя завтра!','Yaga will see you tomorrow!'),
        ico:tier?(g,x,y,s,t)=>{g.save();g.globalAlpha=.5;for(let i=0;i<3;i++){const q=(t*.4+i/3)%1;g.drawImage(fxCloud(),x-s*.6+q*s*.4,y-s*.5-q*s*.5,s*.7,s*.7);}g.restore();mgakPut(g,'flaskP',x,y+Math.sin(t*3)*3,s*1.1,st.dpr);}:null,
        dur:3,then:()=>host.done({score:G2.sc,tier,extra:o.train?{}:{buf:{k:'kotel',fog:{slow:KOTEL.SLOW,dur}}}})});}
    st.key=k=>{const i='123456'.indexOf(k);if(i<0||k.length!==1)return false;if(G2.ph==='input'){tap(i);}return true;};
    st.down=p=>{if(G2.ph!=='input')return;for(let i=0;i<6;i++){const q=L.plates[i];if((p.x-q.x)**2+(p.y-q.y)**2<(L.pr+14)**2){tap(i);return;}}};
    st.update=function(dt){G2.boil=Math.max(.25,G2.boil-dt*.15);if(G2.sayT>0&&G2.sayT<90)G2.sayT-=dt;for(const k in G2.lit){const v=G2.lit[k];G2.lit[k]=v>0?Math.max(0,v-dt):Math.min(0,v+dt);if(!G2.lit[k])delete G2.lit[k];}
      for(let i=G2.flyIng.length-1;i>=0;i--){const f=G2.flyIng[i];f.t+=dt;if(f.t>=f.dur){G2.flyIng.splice(i,1);landIng(f);}}
      if(G2.ph==='show'){G2.showT-=dt;if(G2.showT<=0){G2.show++;if(G2.show<G2.seq.length){const i=G2.seq[G2.show];fly(i,true);say(Lg(ING[i].n.ru,ING[i].n.en)+'!',step*.95);G2.showT=step;}else{G2.ph='input';G2.pos=0;say(Lg('Теперь ты!','Your turn!'),1.2);}}}
      if(G2.ph==='brew'){G2.wait-=dt;if(G2.wait<=0){G2.done++;G2.ri++;const u=L.u;mgakBurst(st,'spark',L.cx,L.cy-L.cw*.6,18,{col:'#fff3a0',v:300,gr:0,s:10*u});mgakPop(st,Lg('Сварено!','Brewed!'),L.cx,L.cy-L.cw*.9,30*u,'#ffe066');try{SND.up();}catch(e){}
          if(G2.ri>=R.length)finish();else{G2.ph='pause';G2.wait=1.1;}}}
      else if(G2.ph==='pause'){G2.wait-=dt;if(G2.wait<=0)startShow();}
      else if(G2.ph==='oops'){G2.wait-=dt;if(G2.wait<=0)startShow();}
      else if(G2.ph==='fail'){G2.wait-=dt;if(G2.wait<=0)finish();}};
    /* рисование */
    function drawPlate(g,i){const p=L.plates[i],u=L.u,lit=G2.lit[i]||0,ing=ING[i],act=G2.ph==='input',pr=L.pr*(lit>0?1+lit*.25:1),bob=act?Math.sin(st.t*2+i)*1.5*u:0;
      g.save();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(p.x,p.y+pr*.8,pr*.95,pr*.25,0,0,TAU);g.fill();
      if(lit>0){g.globalCompositeOperation='lighter';const gg=g.createRadialGradient(p.x,p.y,0,p.x,p.y,pr*1.9);gg.addColorStop(0,rgba(ing.col,.8));gg.addColorStop(1,rgba(ing.col,0));g.fillStyle=gg;g.fillRect(p.x-pr*2,p.y-pr*2,pr*4,pr*4);g.globalCompositeOperation='source-over';}
      g.beginPath();g.arc(p.x,p.y+bob,pr,0,TAU);const wg=g.createRadialGradient(p.x-pr*.3,p.y-pr*.4+bob,pr*.1,p.x,p.y+bob,pr);wg.addColorStop(0,lit<0?'#ff8a7a':'#c8945a');wg.addColorStop(1,lit<0?'#a02a1a':'#7a4a22');g.fillStyle=wg;g.fill();g.lineWidth=3;g.strokeStyle='#2a1608';g.stroke();
      g.beginPath();g.arc(p.x,p.y+bob,pr*.8,0,TAU);g.strokeStyle='rgba(255,220,160,.35)';g.lineWidth=2;g.stroke();
      const flying=G2.flyIng.some(f=>f.i===i&&f.t<f.dur*.5);g.globalAlpha=flying?.35:1;mgakPut(g,'mga_ing_'+ing.id,p.x,p.y+bob-2*u,pr*1.45,st.dpr);g.restore();
      if(act||lit>0)mgakTxt(g,Lg(ing.n.ru,ing.n.en),p.x,p.y+pr+13*u,13.5*u,'#fff3d8',{lw:3.5,mw:pr*2.6});
      if(st.pc)mgakKey(g,p.x+pr*.78,p.y-pr*.72+bob,Math.max(22,pr*.5),String(i+1),lit>0);}
    function drawFly(g){for(const f of G2.flyIng){const q=Math.min(1,f.t/f.dur),e=q,x=f.x0+(L.cx-f.x0)*e,y=f.y0+(L.cy-L.cw*.55-f.y0)*e-Math.sin(q*Math.PI)*L.cw*.7,s=L.pr*1.45*(1-q*.45);
      mgakPut(g,'mga_ing_'+ING[f.i].id,x,y,s,st.dpr,{rot:q*5});}}
    function drawYaga(g){const u=L.u,x=L.yx,y=L.yy+Math.sin(st.t*1.6)*6*u,s=(L.wide?170:130)*u;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,L.yy+s*.62,s*.3,s*.07,0,0,TAU);g.fill();
      mgakPut(g,'yaga',x,y,s,st.dpr,{flip:true});
      if(G2.sayT>0&&G2.say){const px=Math.min(17*u,20);g.font='800 '+Math.round(px)+'px '+MGAK.F;const tw=Math.min(L.W-24,g.measureText(G2.say).width+28*u),th=px*1.9,bx=Math.max(10,Math.min(L.W-tw-10,x-tw*.7)),by=y-s*.62-th;
        g.save();g.globalAlpha=Math.min(1,G2.sayT*4);g.fillStyle='#fffaf0';mgakRR(g,bx,by,tw,th,14*u);g.fill();g.strokeStyle='#3a2410';g.lineWidth=2;g.stroke();g.beginPath();g.moveTo(x-12*u,by+th-1);g.lineTo(x-4*u,by+th+14*u);g.lineTo(x+4*u,by+th-1);g.closePath();g.fill();g.stroke();g.fillRect(x-11*u,by+th-3,14*u,4);
        mgakTxt(g,G2.say,bx+tw/2,by+th/2+1,px,'#3a2410',{ol:false,mw:tw-16});g.restore();}}
    function drawHUD(g){const u=Math.min(L.u,1.25),W=L.W,top=st.top,bw=Math.min(W-150,330*u),bx=14,by=top+6;mgakPanel(g,bx-6,by-6,bw+12,90*u,{r:16});
      mgakTxt(g,Lg('Зелье ','Potion ')+Math.min(R.length,G2.ri+1)+'/'+R.length,bx+8,by+16*u,19*u,MGAK.ink,{al:'left',ol:false});
      for(let i=0;i<R.length;i++)mgakPut(g,i<G2.done?'flaskP':'flask',bx+bw-20*u-(R.length-1-i)*30*u,by+16*u,26*u,st.dpr,{a:i<G2.done?1:.3});
      const seq=G2.seq||R[0],n=seq.length,dw=Math.min(28*u,(bw-20)/n);for(let i=0;i<n;i++){const x=bx+10+dw/2+i*dw,y=by+54*u,f=G2.ph==='input'||G2.ph==='brew'?i<G2.pos:G2.ph==='show'&&i<=G2.show;
        g.beginPath();g.arc(x,y,9*u,0,TAU);g.fillStyle=f?'#ffd84a':'rgba(58,36,16,.25)';g.fill();g.lineWidth=2;g.strokeStyle='#3a2410';g.stroke();}
      if(G2.miss)mgakTxt(g,Lg('Ещё одна ошибка — и зелье убежит','One more slip and the potion boils over'),bx,by+100*u,14*u,'#ffb0a0',{al:'left',lw:3.5,mw:bw});}
    st.draw=function(g){if(bg)g.drawImage(bg,0,0,L.W,L.H);const u=L.u,x=L.cx,y=L.cy,t=st.t;
      // светлячки
      for(let i=0;i<10;i++){const fx=(Math.sin(t*.3+i*2.3)*.5+.5)*L.W,fy=L.H*.35+Math.sin(t*.5+i)*L.H*.15,a=.4+.4*Math.sin(t*3+i);g.fillStyle='rgba(210,255,140,'+a+')';g.beginPath();g.arc(fx,fy,2.2*u,0,TAU);g.fill();}
      drawYaga(g);
      // костёр под котлом
      g.save();g.translate(x,y+L.cw*.48);chastLogH(g,-8*u,6*u,L.cw*.62,12*u);g.rotate(-.35);chastLogH(g,10*u,0,L.cw*.55,11*u);g.restore();
      mgakFlame(g,x,y+L.cw*.52,24*u,t);mgakFlame(g,x-L.cw*.22,y+L.cw*.55,15*u,t+1);mgakFlame(g,x+L.cw*.24,y+L.cw*.55,15*u,t+2);
      kotelPot(g,x,y,L.cw,G2.col,t,G2.boil,G2.dark&&G2.ph!=='show'&&G2.ph!=='input');
      // пар
      g.save();g.globalAlpha=.32;for(let i=0;i<4;i++){const q=(t*.22+i/4)%1,s=(40+q*80)*u;g.drawImage(fxCloud(),x-s/2+Math.sin(t*.7+i*2)*20*u,y-L.cw*.6-q*L.cw*1.1-s/2,s,s);}g.restore();
      for(let i=0;i<6;i++)drawPlate(g,i);drawFly(g);drawHUD(g);
      if(G2.ph==='input'&&G2.pos===0&&G2.ri===0&&!G2.miss)mgakTxt(g,(st.pc?Lg('Жми в том же порядке — мышью или 1–6','Same order — click or press 1–6'):Lg('Нажимай в том же порядке','Tap them in the same order')),L.W/2,(L.wide?L.H*.72:L.H*.615),Math.min(19*u,22),'#fff',{lw:5});
      if(G2.ph==='ask'){const bw=Math.min(L.W-40,320),bh=64;st.btn('hint',L.W/2-bw/2,L.cy-bh-10*u,bw,bh,Lg('Яга подскажет — за рекламу','Yaga’s hint — watch an ad'),'#3a7ad8',()=>{G2.ph='wait';host.ad('hint').then(ok=>{if(st.alive&&!G2.end){if(ok){G2.adUsed=true;G2.miss=1;startShow();}else{G2.ph='fail';G2.wait=.2;}}});},{icon:mgakIcoFilm});
        st.btn('stop',L.W/2-bw/2,L.cy+10*u,bw,bh*.86,Lg('Хватит на сегодня','That’s enough for today'),'#a8703c',()=>{G2.ph='fail';G2.wait=.1;});}};
    const intro={t0:0,title:Lg('Котёл тётушки Яги','Auntie Yaga’s Cauldron'),text:Lg('Яга варит зелье «Туман»! Смотри, что она бросает в котёл, и повтори тот же порядок'+(st.pc?' — мышью или клавишами 1–6.':'.')+' Сваришь — в следующем бою нечисть пойдёт медленнее. Не спеши: времени сколько угодно.','Yaga is brewing a Mist potion! Watch what she throws into the cauldron and repeat the same order'+(st.pc?' — with the mouse or keys 1–6.':'.')+' Brew it — and monsters will be slower in your next battle. No rush, take your time.'),
      pic:(g,x,y,s)=>{kotelPot(g,x,y+s*.06,s*.7,'#7ad04a',st.t,.6,0);mgakPut(g,'mga_ing_muh',x-s*.7,y-s*.15,s*.4,st.dpr);mgakPut(g,'mga_ing_frog',x+s*.7,y-s*.2,s*.4,st.dpr);mgakPut(g,'mga_ing_pero',x-s*.55,y+s*.32,s*.36,st.dpr);mgakPut(g,'mga_ing_gem',x+s*.6,y+s*.3,s*.34,st.dpr);},
      onGo:()=>{G2.ph='pause';G2.wait=.4;}};
    if(/[?&]mgdbg/.test(location.search)){window.__mga=G2;window.__mgs=st;window.__mgL=()=>L;}   // стенд: состояние игры для проверок
    st.over=function(g){if(G2.ph==='intro')mgakIntro(g,st,intro);mgakFinDraw(g,st);};
  }});
