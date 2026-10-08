'use strict';
/* ================= «🎪 Забавы» №11 «Три сундука старосты» (BG0, 08.10.2026) =================
   После каждой победы в «Логове» земли (глава 3 темы; ядро копит S.zab.lr в END) староста выставляет 3 ОТКРЫТЫХ сундука — награды видны заранее,
   берёшь один (выбор, не случай — правило «без лутбоксов»). «🎬 Взять и второй за рекламу» — одна просьба на окно.
   Сундуки: красный — трофеи этой земли, синий — припасы подворья (нет подворья/амбар полон — Слава), зелёный — Слава. Награда вне дневных потолков (праздник Логова).
   Тренировки нет (это не игра на ловкость). ПК: 1/2/3 — выбрать, Enter — «Забрать». */
(function(){
const RW={tro:5,sl:25,slAlt:20,sp:{repa:3,kap:2,med:1},mixT:2,mixS:12};   // mix — вместо припасов, если подворья нет
function landOf(slot){const r=typeof CAMP_S!=='undefined'&&CAMP_S[slot];return r?r.th:'les';}
function landNm(th){try{return TH[th]&&TH[th].name||th;}catch(e){return th;}}
function yardOk(){try{return typeof troYard==='function'&&!!troYard();}catch(e){return false;}}
function spName(k){try{return typeof ingName==='function'?ingName(k):k;}catch(e){return k;}}
function spIc(k){try{return typeof ingIc==='function'?ingIc(k):'m_repa';}catch(e){return 'm_repa';}}
/* что лежит в сундуках (одно и то же при показе и при выдаче) */
function chests(slot){const th=landOf(slot),tid='tr_'+th,yo=yardOk();
  return [{k:'tro',art:'zb_chest_ro',col:'#a8302a',items:[{ic:tid,n:RW.tro,t:zabTrName(tid)}],t:L('Трофеи земли','Land trophies')},
    yo?{k:'sp',art:'zb_chest_bo',col:'#2a5a8a',items:Object.keys(RW.sp).map(k=>({ic:spIc(k),n:RW.sp[k],t:spName(k)})),t:L('Припасы подворья','Homestead supplies')}
      :{k:'mix',art:'zb_chest_bo',col:'#2a5a8a',items:[{ic:tid,n:RW.mixT},{ic:'sl_fame',n:RW.mixS}],t:L('Всего понемногу','A bit of everything')},
    {k:'sl',art:'zb_chest_go',col:'#3a7a3a',items:[{ic:'sl_fame',n:RW.sl,t:L('Слава','Fame')}],t:L('Слава богатыря','Hero’s fame')}];}
function give(c,slot){const out=[];const th=landOf(slot);
  if(c.k==='tro'){const q=zabTr('tr_'+th,RW.tro,true);if(q)out.push({img:ic(q.id,64),t:'+'+q.n+' '+zabTrName(q.id)});}
  else if(c.k==='sp'){let ok=0;for(const k in RW.sp){try{if(troYardGive(k,RW.sp[k])){ok=1;out.push({img:ic(spIc(k),64),t:'+'+RW.sp[k]+' '+spName(k)});}}catch(e){}}
    if(!ok){const n=zabSl(RW.slAlt,true);if(n)out.push({img:ic('sl_fame',64),t:'+'+n+' '+L('Славы','Fame')+L(' (амбар полон)',' (barn is full)')});}else try{save();}catch(e){}}
  else if(c.k==='mix'){const q=zabTr('tr_'+th,RW.mixT,true);if(q)out.push({img:ic(q.id,64),t:'+'+q.n+' '+zabTrName(q.id)});const n=zabSl(RW.mixS,true);if(n)out.push({img:ic('sl_fame',64),t:'+'+n+' '+L('Славы','Fame')});}
  else{const n=zabSl(RW.sl,true);if(n)out.push({img:ic('sl_fame',64),t:'+'+n+' '+L('Славы','Fame')});}
  return out;}
function scene(g,W,H,t,calm,land){const hz=land?.5:.36,sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#f6a85a');sk.addColorStop(hz-.01,'#ffd89a');sk.addColorStop(hz,'#8ac060');sk.addColorStop(1,'#4a8a3a');g.fillStyle=sk;g.fillRect(0,0,W,H);
  glow(g,W*.8,H*.1,60,'#ffe08a','#fff6d8');const k=land?Math.min(H/480,1.8):Math.min(W/390,H/700,1.6);H=H*hz/.36;
  g.fillStyle='#3f7a3a';g.beginPath();g.moveTo(0,H*.36);for(let x=0;x<=W;x+=24)g.lineTo(x,H*.36-12-10*Math.abs(Math.sin(x*.07)));g.lineTo(W,H*.36);g.fill();
  for(let i=0;i<5;i++)metaArt(g,'d_pine',W*(.08+i*.22),H*.35,k*.7);
  // изба старосты справа, плетень
  g.save();g.translate(W*(land?.86:.82),H*.36);g.scale(k*1.3,k*1.3);shp(g,'#b8743a',{lw:1.4},[-34,-40,34,0],()=>{g.rect(-30,-34,60,34);});
  for(let y=-30;y<0;y+=7){g.strokeStyle='rgba(70,35,10,.45)';g.lineWidth=1.2;g.beginPath();g.moveTo(-30,y);g.lineTo(30,y);g.stroke();}
  poly(g,[-38,-32,0,-58,38,-32],'#a8302a',{lw:1.4});rrect(g,-9,-24,18,14,2);g.fillStyle=grad(g,0,-17,10,'#ffe08a');g.fill();outline(g,'#7a4a22',1);g.restore();
  for(let x=4;x<W;x+=12){rrect(g,x-3,H*.38,6,H*.06,2);g.fillStyle='#a8733d';g.fill();}g.strokeStyle='#8a5a2e';g.lineWidth=2;g.beginPath();g.moveTo(0,H*.4);g.lineTo(W,H*.4);g.stroke();
  // флажки — праздник
  const fl=['#e8433a','#ffd23a','#3a8ad8','#4aa84a'];g.strokeStyle='#6a4022';g.lineWidth=1.2;g.beginPath();g.moveTo(0,H*.07);g.quadraticCurveTo(W/2,H*.16,W,H*.07);g.stroke();
  for(let i=1;i<14;i++){const u=i/14,x=u*W,y=(1-u)*(1-u)*H*.07+2*(1-u)*u*H*.16+u*u*H*.07,sw=calm?0:Math.sin(t*2+i)*1.5;g.beginPath();g.moveTo(x-6,y);g.lineTo(x+6,y);g.lineTo(x+sw,y+13);g.closePath();g.fillStyle=fl[i%4];g.fill();}
  // староста
  const sx=land?W*.12:W*.16,sy=land?H*.36:H*.3;metaArt(g,'zb_starosta',sx,sy+(calm?0:Math.sin(t*2)*1.2),k*(land?1.9:1.5));return {x:sx,y:sy};}
function run(host,o){const c=ZABK.canvas(host),g=c.getContext('2d'),pc=zabPC(),slot=o.ctx&&o.ctx.slot!=null?o.ctx.slot:(ZB().lr[0]!=null?ZB().lr[0]:0),th=landOf(slot),CH3=chests(slot),P=[];
  const st={t:0,picked:[],phase:'pick'};const ui=document.createElement('div');ui.className='zb0S';host.el.appendChild(ui);css();
  ZABK.loop(host,(dt)=>{st.t+=dt;const W=c.W,H=c.H,d=c.D,land=W>H*1.1;g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';scene(g,W,H,st.t,o.calm,land);ZABK.parts(g,P,dt);});
  function draw(){const canAd=st.phase==='more'&&st.picked.length===1&&host.adOk()&&!o.train;
    ui.innerHTML='<div class="zb0Sb"><b>'+L('Староста','The Elder')+'</b><span>'+(st.phase==='pick'?L('«Логово «'+landNm(th)+'» взято! Спасибо, богатырь. Выбирай любой сундук — всё как на ладони.»','“The Lair of '+landNm(th)+' is taken! Thank you, hero. Pick any chest — everything is in plain sight.”')
      :L('«Носи на здоровье!»','“Wear it with pride!”'))+'</span></div><div class="zb0Sr">'+CH3.map((x,i)=>{const p=st.picked.indexOf(i)>=0;
      return '<button class="zb0Sc'+(p?' got':'')+(st.phase!=='pick'&&!p?' dim':'')+'" data-c="'+i+'" style="--cc:'+x.col+'"'+(st.phase==='pick'||st.phase==='second'&&!p?'':' disabled')+'><img class="zb0Ch" src="'+ic(x.art,160)+'" alt=""><span class="zb0It">'+
        x.items.map(it=>'<i><img src="'+ic(it.ic,64)+'" alt="">'+(it.n?'×'+it.n:'')+'</i>').join('')+'</span><b>'+x.t+'</b>'+(pc&&st.phase==='pick'?'<i class="zb0K">'+(i+1)+'</i>':'')+(p?'<em>✓</em>':'')+'</button>';}).join('')+'</div>'+
      (st.phase==='more'?'<div class="zb0Sbt">'+(canAd?'<button class="btn ad" data-k="ad">'+L('🎬 Взять и второй за рекламу','🎬 Take a second one for an ad')+'</button>':'')+'<button class="btn big" data-k="ok">'+L('Забрать','Collect')+(pc?' <i class="zb0K">Enter</i>':'')+'</button></div>':'');
    ui.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>pick(+b.dataset.c));const ok=ui.querySelector('[data-k=ok]');if(ok)ok.onclick=fin;
    const ad=ui.querySelector('[data-k=ad]');if(ad)host.offer();if(ad)ad.onclick=()=>{ad.disabled=true;host.ad('second').then(r=>{if(r){st.phase='second';draw2();}else ad.disabled=false;});};
    ui.classList.toggle('land',host.w>host.h*1.1);}
  function draw2(){draw();ui.querySelectorAll('[data-c]').forEach(b=>{const i=+b.dataset.c;if(st.picked.indexOf(i)<0){b.disabled=false;b.classList.remove('dim');}});
    const s=ui.querySelector('.zb0Sb span');if(s)s.textContent=L('«Бери и второй — заслужил!»','“Take another — you’ve earned it!”');}
  function pick(i){if(st.picked.indexOf(i)>=0)return;if(st.phase==='pick'||st.phase==='second'){st.picked.push(i);try{SND.chest();}catch(e){}
      const b=ui.querySelector('[data-c="'+i+'"]');if(b){const r=b.getBoundingClientRect(),rr=c.getBoundingClientRect();ZABK.burst(P,r.left-rr.left+r.width/2,r.top-rr.top+r.height*.35,{n:o.calm?8:24,col:'#ffd84a',k:'star',sp:220,g:260,d:1});}
      if(st.phase==='second'){st.phase='done';draw();setTimeout(fin,o.calm?300:700);return;}st.phase='more';draw();}}
  function fin(){if(st.phase==='end')return;st.phase='end';host.done({score:st.picked.length,tier:3,extra:{pick:st.picked.map(i=>CH3[i].k),slot}});}
  zabKeys(host,(k)=>{if((st.phase==='pick'||st.phase==='second')&&k>='1'&&k<='3'){pick(+k-1);return true;}if(st.phase==='more'&&(k==='Enter'||k===' ')){fin();return true;}return false;});
  host.onResize(draw);draw();}
/* выдача (ядро зовёт после своих начислений): выбранные сундуки, Логово отмечено */
function after(r,out,o){const z=ZB(),ex=r.extra||{},slot=ex.slot!=null?ex.slot:o.ctx&&o.ctx.slot;let a=[];if(slot==null)return a;
  if(z.lc[slot])return a;z.lc[slot]=1;z.lr=z.lr.filter(x=>x!==slot);const CH3=chests(slot);
  for(const k of ex.pick||[]){const c=CH3.find(x=>x.k===k);if(c)a=a.concat(give(c,slot));}
  zabEv('chest',{c:slot,p:(ex.pick||[]).join(',')});return a;}
let cssOn=0;function css(){if(cssOn)return;cssOn=1;const s=document.createElement('style');s.textContent=
  '.zb0S{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;justify-content:flex-end;gap:12px;padding:12px 10px calc(env(safe-area-inset-bottom,0px) + 14px)}'+
  '.zb0S.land{left:24%;justify-content:center}'+
  '.zb0Sb{margin-left:22%;padding:12px 14px;border-radius:18px;background:#fffaf0;border:3px solid #6e431f;color:#2e1c0c;box-shadow:0 4px 0 rgba(60,30,10,.35);animation:zabRise .3s ease-out both}'+
  '.zb0S:not(.land) .zb0Sb{position:absolute;top:calc(env(safe-area-inset-top,0px) + 74px);left:10px;right:10px;margin-left:34%}.zb0Sb b{display:block;font-size:15px;color:#a8302a}.zb0Sb span{font-size:17px;font-weight:700;line-height:1.3}'+
  '.zb0S.land .zb0Sb{margin-left:0}'+
  '.zb0Sr{display:flex;gap:8px}.zb0Sc{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px 10px;border-radius:18px;border:3px solid #6e431f;background:linear-gradient(#fff8e4,#f0dcac);color:#2e1c0c;font:inherit;box-shadow:0 4px 0 rgba(60,30,10,.45),inset 0 -6px 0 var(--cc);cursor:pointer;animation:zabPop .4s cubic-bezier(.2,1.4,.4,1) both}'+
  '.zb0Sc:nth-child(2){animation-delay:.08s}.zb0Sc:nth-child(3){animation-delay:.16s}.zb0Sc:disabled{cursor:default}.zb0Sc.dim{opacity:.5;filter:grayscale(.6)}'+
  '.zb0Sc.got{background:linear-gradient(#fff4c0,#ffd860);border-color:#b0760a;box-shadow:0 0 0 3px #ffd84a,0 4px 0 rgba(60,30,10,.45)}'+
  '@media (hover:hover){.zb0Sc:not(:disabled):hover{transform:translateY(-3px)}}'+
  '.zb0Ch{width:96%;max-width:120px;height:auto}.zb0It{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 6px;min-height:34px}.zb0It i{display:flex;align-items:center;gap:1px;font-style:normal;font-weight:900;font-size:17px}.zb0It img{width:32px;height:32px}'+
  '.zb0Sc b{font-size:14px;line-height:1.15;text-align:center}.zb0Sc em{position:absolute;top:6px;right:8px;font-style:normal;font-weight:900;font-size:24px;color:#2f7a1c}'+
  '.zb0Sc .zb0K{position:absolute;top:6px;left:6px}'+
  '.zb0Sbt{display:flex;flex-direction:column;gap:8px}.zb0Sbt .btn{min-height:50px}'+
  '.zb0K{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;padding:0 6px;border-radius:6px;background:linear-gradient(#fffaf0,#e6d2a8);border:2px solid #5a3a1a;color:#3a2410;font-style:normal;font-weight:900;font-size:14px;box-shadow:0 2px 0 rgba(40,20,5,.5);vertical-align:middle}'+
  'body.zabCalm .zb0Sc,body.zabCalm .zb0Sb{animation:none}';document.head.appendChild(s);}
function sim(){return {score:1,tier:3};}
ZAB_REG({id:'sunduki',num:11,n:zabN('Три сундука старосты','The Elder’s Three Chests'),icon:'zb_i11',kind:'after',noRec:true,noScore:true,run,sim,after});
})();
