/* ===== bb2-dvor-run.js — «Живой двор» (поток DVOR супер-буста в2, 14.10.2026). Набор 'dvor' (догружается в меню, BB2.late). Без ?. ?? .finally
   Что делает: картинка деревни (#village) становится живой сценой вместо карточки-плиток «Двор» (meta-dvor.js):
   - входы: Терем → дом, Оружие → кузница, Торжок → ярмарка, Подворье → амбар, Слава → капище, Забавы → трактир, Питомцы → питомец у дома.
     Нажатие = кнопка исходной карточки (она спрятана, не удалена) — то же окно, что раньше. Над тем, где ждёт дело (карточка .next), — «!».
     Постройка, на которую хватает золота, — «⬆», нажатие листает к её карточке; остальные постройки — подсказка, как раньше;
   - жители: открытые богатыри ходят по дорогам (до 5), питомец сидит у дома, пощажённая нечисть из SUD (BB2.sud.yard(), до 5) стоит на своих местах,
     нажатие — кто это и чем служит; Соловей свистит; кузница дымит (если построена);
   - следы подвигов: флажок «★ N» на тереме (пройдено глав); свиток «Книга былин», если есть BYL (BB2.byl.book).
   Рисование: фон = обычная drawVillage() (со всеми обёртками — зимняя ёлка WINTER встаёт сама) + таблички, один раз в холст-подложку;
   в кадре — только подложка и ≤12 фигурок готовыми картинками; 20 кадров/с; 15 с без касаний — стоп (картинка остаётся), касание — снова.
   Слабое устройство (qLow / body.lite) — сразу «списком» (старый вид); кадр дольше 25 мс в среднем — анимация выключается сама.
   Кнопка на картинке: «☰ Списком» ↔ «🏡 Живой двор», выбор — S.bb2.dvor.v ('l'|'s').
   STAT: dvor {a:'show',m:'s'|'l'} · {a:'tap',k} · {a:'mode',m} · {a:'slow',ms}. Ни золота, ни силы двор не даёт (bb2-eco: dvor.gold=0, power=0). */
var DVORX=(function(){
  var B=BB2,ST={c:null,bg:null,raf:0,last:0,idle:0,fig:[],sp:[],slow:0,ft:0,fn:0,sh:{},W:0,H:0,d:1,k:1},CV={},rz=0;
  var CARD={tmCard:'home',wpnCard:'forge',troCard:'fair',yardCard:'barn',slCard:'altar',zabCard:'tavern',petCard:'pet'};
  var EMO={tmCard:'🏡',wpnCard:'⚔',troCard:'🧺',yardCard:'🌱',slCard:'⭐',zabCard:'🎪',petCard:'🐾'};
  var PET=[.62,.7],ROAD=[[.12,.64],[.3,.66],[.5,.69],[.7,.67],[.88,.64],[.4,.77],[.6,.79],[.48,.9],[.54,.97],[.22,.67],[.78,.66]];
  var POST=[[.09,.88],[.91,.9],[.64,.91],[.36,.91],[.27,.65]];
  function stat(a,o){try{o=o||{};o.a=a;B.stat('dvor',o);}catch(e){}}
  function on(){return B.on('dvor')&&typeof S!=='undefined'&&(S.runs||0)>=1;}
  function low(){try{return (typeof qLow==='function'&&qLow())||document.body.classList.contains('lite');}catch(e){return false;}}
  function mode(){var o=B.s('dvor')||{};return o.v||(low()?'l':'s');}
  function css(){if(document.getElementById('dvCss'))return;var s=document.createElement('style');s.id='dvCss';
    s.textContent='.dvW{position:relative}.dvSw{position:absolute;right:10px;top:14px;z-index:2;border:0;border-radius:14px;padding:6px 11px;min-height:32px;font:600 12.5px system-ui,sans-serif;color:#fff;background:rgba(40,26,12,.62);cursor:pointer}'+
      '.dvW .dvSw:active{transform:scale(.96)}#village.dvLive{cursor:pointer;touch-action:manipulation}';document.head.appendChild(s);}
  function cv(key,px){var id=key+'@'+px,c=CV[id];if(c)return c;if(typeof ART==='undefined'||!ART[key])return null;try{c=drawArt(key,px);}catch(e){return null;}return CV[id]=c;}
  function alive(){var c=ST.c;return !!(c&&c.isConnected&&typeof curTab!=='undefined'&&curTab==='Village'&&!(typeof G!=='undefined'&&G)&&!document.hidden);}
  function stop(){if(ST.raf)cancelAnimationFrame(ST.raf);ST.raf=0;}
  function wake(){ST.idle=performance.now()+15000;if(!ST.raf&&!ST.slow&&alive()){ST.last=0;ST.raf=requestAnimationFrame(loop);}}
  function hgt(W){return W>=520?340:Math.round(Math.max(260,Math.min(330,W*.86)));}
  function pos(id){return id==='pet'?PET:VPOS[id];}
  /* ---------- таблички (рисуются в подложку один раз) ---------- */
  function plate(g,x,y,txt,hot,put){g.font='700 11.5px system-ui,sans-serif';var w=g.measureText(txt).width+12,h=19,j,o,yy,ok,q,OF=[0,-21,21,-42,42];x=Math.max(w/2+3,Math.min(ST.W-w/2-3,x));
    for(j=0;j<OF.length;j++){yy=Math.max(12,Math.min(ST.H-12,y+OF[j]));ok=1;for(o=0;o<put.length;o++){q=put[o];if(Math.abs(q[0]-x)<(q[2]+w)/2+3&&Math.abs(q[1]-yy)<h+1){ok=0;break;}}if(ok)break;}
    y=yy;put.push([x,y,w]);
    g.fillStyle=hot?'rgba(120,62,10,.9)':'rgba(52,34,16,.8)';rrect(g,x-w/2,y-h/2,w,h,9);g.fill();if(hot){g.lineWidth=1.5;g.strokeStyle='#ffd25a';g.stroke();}
    g.fillStyle='#fff6df';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,x,y+.5);return [x,w,y];}
  function snap(){var c=ST.c;if(!c)return;try{drawVillage();}catch(e){} /* глобальная: с обёртками других потоков (зимняя ёлка) */
    var r=c.getBoundingClientRect();ST.W=r.width||360;ST.H=r.height||260;ST.d=c.width/ST.W||1;ST.k=Math.min(1.25,ST.H/230);
    var bg=ST.bg||(ST.bg=document.createElement('canvas'));bg.width=c.width;bg.height=c.height;var g=bg.getContext('2d');g.setTransform(1,0,0,1,0,0);g.drawImage(c,0,0);
    g.setTransform(ST.d,0,0,ST.d,0,0);var k=ST.k,i,s,p,y;
    var dn=0;try{for(i in S.done)if(S.done[i])dn++;}catch(e){}
    p=VPOS.home;if(dn){var hx=ST.W*p[0]+26*k,hy=ST.H*p[1]-58*k;g.strokeStyle='#5a3a1a';g.lineWidth=2;g.beginPath();g.moveTo(hx,hy+26*k);g.lineTo(hx,hy-6);g.stroke();
      g.fillStyle='#c8392f';g.beginPath();g.moveTo(hx,hy-6);g.lineTo(hx+30,hy+1);g.lineTo(hx,hy+8);g.fill();g.fillStyle='#ffe9a8';g.font='800 9px system-ui,sans-serif';g.textAlign='left';g.textBaseline='middle';g.fillText('★'+dn,hx+3,hy+1);}
    var tp=ST.tp||(ST.tp=document.createElement('canvas'));tp.width=c.width;tp.height=c.height;g=tp.getContext('2d');g.setTransform(ST.d,0,0,ST.d,0,0); /* таблички — свой слой поверх фигурок */
    var put=[],a=ST.sp.filter(function(x){return x.lb;});a.sort(function(u,v){return (v.k==='card')-(u.k==='card')||pos(u.at)[1]-pos(v.at)[1];});
    for(i=0;i<a.length;i++){s=a[i];p=pos(s.at);y=ST.H*p[1]-(s.at==="pet"?34:44)*k*(p[2]||1);var q=plate(g,ST.W*p[0],y,s.lb,s.hot,put);s.px=q[0];s.pw=q[1];s.py=q[2];}}
  /* ---------- входы и жители ---------- */
  function build(el){var sp=[],fig=[],id,c,i,a,lb,used={};
    var names={};if(typeof DVOR_CARDS!=='undefined')for(i=0;i<DVOR_CARDS.length;i++)names[DVOR_CARDS[i][0]]=L(DVOR_CARDS[i][1],DVOR_CARDS[i][2]);
    for(id in CARD){c=el.querySelector('#'+id);if(!c)continue;a=CARD[id];used[a]=1;lb=(EMO[id]||'')+' '+(names[id]||L('Забавы','Fun'));
      sp.push({k:'card',id:id,el:c,at:a,lb:lb,hot:c.classList.contains('next')});}
    var ub=null,uc=1e12;for(i=0;i<BLD.length;i++){var b=BLD[i],l=S.village[b.id]||0,cost=b.cost[l]; /* «⬆» — только над самой дешёвой постройкой, на которую хватает золота */
      if(cost!=null&&S.gold>=cost&&(S.village.forge||b.id==='forge')&&cost<uc){uc=cost;ub=b.id;}}
    for(i=0;i<BLD.length;i++){id=BLD[i].id;if(id===ub){if(!used[id])sp.push({k:'up',id:id,at:id,lb:'⬆ '+BLD[i].name,hot:1});else for(a=0;a<sp.length;a++)if(sp[a].at===id)sp[a].up=1;}
      else if(!used[id])sp.push({k:'bld',id:id,at:id});used[id]=1;}
    try{if(B.byl&&typeof B.byl.book==='function')sp.push({k:'byl',id:'byl',at:'well',lb:L('📜 Былины','📜 Ballads')});}catch(e){}
    /* богатыри: выбранный первым, всего до 5 */
    var hs=[];for(i=0;i<HEROES.length;i++)if(heroOpen(HEROES[i]))hs.push(HEROES[i].id);
    hs.sort(function(x,y){return (y===S.hero)-(x===S.hero);});hs.length=Math.min(hs.length,5);
    for(i=0;i<hs.length;i++){var r=ROAD[(i*3)%ROAD.length],sk=typeof skinKey==='function'?skinKey(hs[i]):hs[i];if(!ART['h_'+sk+'_0'])sk=hs[i];
      fig.push({t:'h',k:'h_'+sk+'_',x:r[0],y:r[1],tx:r[0],ty:r[1],w:1+i*.7,fl:i%2,sz:46});}
    try{var pt=S.pet&&S.pet.cur&&typeof PETS!=='undefined'&&PETS[S.pet.cur];if(pt&&ART[pt.k])fig.push({t:'p',k:pt.k,x:PET[0],y:PET[1],sz:30,fl:0,id:'pet'});}catch(e){}
    var PS=POST.slice();try{if(typeof BB2W!=='undefined'&&BB2W.on('kar'))PS[0]=[.24,.93];}catch(e){} /* зимой в левом углу ёлка WINTER — Соловей отходит */
    try{var y=B.sud&&typeof B.sud.yard==='function'?B.sud.yard():[];for(i=0;i<y.length&&i<PS.length;i++)if(ART[y[i].boss])
      fig.push({t:'b',k:y[i].boss,slot:y[i].slot,x:PS[i][0],y:PS[i][1],sz:40,fl:i%2,ph:i*1.7});}catch(e){}
    ST.sp=sp;ST.fig=fig;}
  function petHit(){for(var i=0;i<ST.sp.length;i++)if(ST.sp[i].at==='pet')return ST.sp[i];return null;}
  /* ---------- кадр ---------- */
  function step(dt){var f,i,dx,dy,L2,v;for(i=0;i<ST.fig.length;i++){f=ST.fig[i];if(f.t!=='h')continue;
    if(f.w>0){f.w-=dt;f.mv=0;if(f.w<=0){var r=ROAD[Math.random()*ROAD.length|0];f.tx=r[0]+(Math.random()-.5)*.05;f.ty=r[1]+(Math.random()-.5)*.03;}continue;}
    dx=(f.tx-f.x)*ST.W;dy=(f.ty-f.y)*ST.H;L2=Math.sqrt(dx*dx+dy*dy);v=24*ST.k*dt;
    if(L2<=v){f.x=f.tx;f.y=f.ty;f.w=1+Math.random()*3;f.mv=0;}else{f.x+=dx/L2*v/ST.W;f.y+=dy/L2*v/ST.H;f.mv=1;if(Math.abs(dx)>2)f.fl=dx<0?1:0;}}}
  function draw(t){var c=ST.c,g=c.getContext('2d'),d=ST.d,k=ST.k,i,f,im,px,x,y,s;g.setTransform(1,0,0,1,0,0);g.drawImage(ST.bg,0,0);g.setTransform(d,0,0,d,0,0);
    if(S.village.forge){p=VPOS.forge;x=ST.W*p[0]+8*k;y=ST.H*p[1]-34*k;for(i=0;i<3;i++){var q=((t*.45+i/3)%1);g.globalAlpha=.55*(1-q);g.fillStyle='#d9d4cc';g.beginPath();g.arc(x+Math.sin(t+i*2)*4*q,y-q*30*k,(3+q*6)*k,0,TAU);g.fill();}g.globalAlpha=1;}
    var a=ST.fig.slice().sort(function(u,v){return u.y-v.y;});
    for(i=0;i<a.length;i++){f=a[i];px=Math.round(f.sz*k*d);s=px/d;
      im=cv(f.t==='h'?f.k+(f.mv?((t*5|0)%2):0):f.k,px);if(!im)continue;
      x=ST.W*f.x;y=ST.H*f.y+(f.t==='b'?Math.sin(t*1.6+f.ph)*1.5:f.t==='p'?-Math.abs(Math.sin(t*2.2))*2:0);
      g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x,ST.H*f.y+s*.27,s*.26,s*.08,0,0,TAU);g.fill();
      if(f.fl){g.save();g.translate(x,0);g.scale(-1,1);g.drawImage(im,-s/2,y-s/2,s,s);g.restore();}else g.drawImage(im,x-s/2,y-s/2,s,s);
      if(f.k==='solo'){var n=(t*.6+f.ph)%2;if(n<1){g.globalAlpha=1-n;g.fillStyle='#3a2a6a';g.font='700 '+Math.round(13*k)+'px system-ui,sans-serif';g.textAlign='center';g.fillText(n<.5?'♪':'♫',x+s*.3+n*8,y-s*.35-n*14*k);g.globalAlpha=1;}}}
    g.setTransform(1,0,0,1,0,0);if(ST.tp)g.drawImage(ST.tp,0,0);g.setTransform(d,0,0,d,0,0);
    for(i=0;i<ST.sp.length;i++){s=ST.sp[i];if(!(s.hot||s.up)||s.px==null)continue;x=s.px+s.pw/2-2;y=s.py-11+Math.sin(t*4+i)*2;
      g.fillStyle=s.k==='up'||!s.hot?'#4caf50':'#e8a020';g.beginPath();g.arc(x,y,7,0,TAU);g.fill();g.fillStyle='#fff';g.font='900 10px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(s.k==='up'||!s.hot?'⬆':'!',x,y+.5);}}
  var p;
  function loop(t){ST.raf=0;if(!alive()){stop();return;}
    if(!ST.last||t-ST.last>=48){var dt=ST.last?Math.min(.2,(t-ST.last)/1000):0,t0=performance.now();ST.last=t;step(dt);draw(t/1000);
      ST.ft+=performance.now()-t0;ST.fn++;ST.nf=(ST.nf||0)+1;if(ST.fn>=40){if(ST.ft/ST.fn>25&&!ST.slow){ST.slow=1;stat('slow',{ms:Math.round(ST.ft/ST.fn)});}ST.fn=0;ST.ft=0;}}
    if(ST.slow||t>ST.idle)return;ST.raf=requestAnimationFrame(loop);}
  /* ---------- нажатия ---------- */
  function tap(e){if(!ST.c)return;var r=ST.c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,best=null,bd=1e9,i,s,p2,dx,dy,dd,k=ST.k;wake();
    for(i=0;i<ST.sp.length;i++){s=ST.sp[i];p2=pos(s.at);if(!p2)continue;
      dx=x-ST.W*p2[0];dy=(y-(ST.H*p2[1]-14*k))*.8;dd=dx*dx+dy*dy;if(dd<bd&&dd<Math.pow(34*k,2)){bd=dd;best=s;}
      if(s.px!=null&&Math.abs(x-s.px)<s.pw/2+4&&Math.abs(y-s.py)<14){best=s;bd=-1;}}
    for(i=0;i<ST.fig.length;i++){var f=ST.fig[i];if(f.t!=='b')continue;dx=x-ST.W*f.x;dy=y-ST.H*f.y;dd=dx*dx+dy*dy;if(bd>=0&&dd<Math.pow(24*k,2)&&dd<bd){bd=dd;best={k:'boss',f:f};}}
    if(!best)return;e.stopImmediatePropagation();try{SND.click();}catch(x2){}
    stat('tap',{k:best.k==='boss'?'boss:'+best.f.k:best.k==='card'?best.id:best.k+':'+best.id});
    if(best.k==='card'){var bt=best.el.querySelector('button');if(bt)bt.click();return;}
    if(best.k==='byl'){try{B.byl.book();}catch(x3){}return;}
    if(best.k==='boss'){var nm=best.f.k,jb='';try{nm=B.sud.name(best.f.slot);jb=SUDX.info(best.f.slot).job;}catch(x4){}toast(nm+(jb?': '+jb:''));return;}
    var b=null;for(i=0;i<BLD.length;i++)if(BLD[i].id===best.id)b=BLD[i];if(!b)return;
    if(best.k==='up'){var c=document.querySelector('[data-b="'+b.id+'"]');c=c&&c.closest('.card');if(c){c.scrollIntoView({block:'center',behavior:'smooth'});c.style.transition='box-shadow .3s';c.style.boxShadow='0 0 0 3px #ffd25a';setTimeout(function(){c.style.boxShadow='';},1600);}return;}
    var l=S.village[b.id]||0;toast(b.name+(l?L(' (ур. ',' (lv ')+l+')':L(' — ещё не построена',' — not built yet'))+': '+b.about);}
  /* ---------- вкладка «Деревня» ---------- */
  function vil(el){stop();ST.c=null;if(!on()||!el)return;var c=el.querySelector('#village');if(!c)return;css();var m=mode();
    var w=document.createElement('div');w.className='dvW';c.parentNode.insertBefore(w,c);w.appendChild(c);
    var bt=document.createElement('button');bt.className='dvSw';bt.id='dvSw';bt.textContent=m==='s'?L('☰ Списком','☰ List'):L('🏡 Живой двор','🏡 Live yard');w.appendChild(bt);
    bt.onclick=function(){var o=B.s('dvor');o.v=m==='s'?'l':'s';try{save();SND.click();}catch(e){}stat('mode',{m:o.v});stop();renderVillage();};
    if(!ST.sh[m]){ST.sh[m]=1;stat('show',{m:m});}
    if(m!=='s')return;
    var dc=el.querySelector('#dvorCard');if(dc)dc.style.display='none';
    c.classList.add('dvLive');c.style.height=hgt(c.getBoundingClientRect().width||340)+'px';ST.c=c;ST.slow=0;
    build(el);snap();draw(performance.now()/1000);
    c.addEventListener('click',tap,false);c.addEventListener('pointerdown',wake,{passive:true});wake();
    if(!rz){rz=1;window.addEventListener('resize',function(){setTimeout(function(){if(ST.c&&ST.c.isConnected){var c2=ST.c;c2.style.height=hgt(c2.getBoundingClientRect().width||340)+'px';snap();draw(performance.now()/1000);}},150);});}}
  if(typeof META_MODS!=='undefined')META_MODS.push({id:'dvorL',VIL:function(el){try{vil(el);}catch(e){console.warn('dvor',e);}}});
  return {ok:1,vil:vil,st:ST,mode:mode,wake:wake};
})();
