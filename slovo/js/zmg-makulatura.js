'use strict';
/* zb2-MGR мини-игра №19 «Макулатура» (ведёт Зина). Пионерский сбор: летят пачки со словом — смахни в мешок «он» (влево), «она» (вправо),
   «оно» (вниз); можно нажать на мешок; ПК — стрелки ← → ↓ (или 1 2 3). Темп растёт, три ошибки (или «не успел») — конец.
   Пачка — 1 кг, ловушка (кофе, тюль, пони…) — 2 кг; Зина комментирует ловушки. Рекорд — кг (оболочка; ZMGREC от LOV, если есть).
   Звёзды: 8 / 18 / 30 кг. Слова — js/zmg-makulatura-data.js (ZMG_MAKU, генерирует MGR-tools/maku_build.py).
   Договор — шапка js/zmg-core.js. Флаг: ?off=makulatura. */
(function(){
if(typeof ZMG_REG!=='function')return;
const TH=[8,18,30],HP=3;
const tierOf=k=>k>=TH[2]?3:k>=TH[1]?2:k>=TH[0]?1:0;
const LB={m:'ОН',f:'ОНА',n:'ОНО'},PR={m:'он',f:'она',n:'оно'},KEY={ArrowLeft:'m',ArrowRight:'f',ArrowDown:'n','1':'m','2':'f','3':'n'};
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const OK=['Верно!','Так держать!','В мешок!','Грамотно!','Принято!','Пять!'];
const NO=['«{w}» — {g}. Запиши на ладошке.','Нет, голубчик: «{w}» — {g}.','«{w}» — {g}! Валерка и то знает.','Мимо мешка! «{w}» — {g}.'];
const SLOW=['Пачка не ждёт! Шевелись, голубчик.','Уснул? Пионеры уже второй мешок тащат!','Не зевай — пачки сами не сложатся.'];
const KG=['{n} кг! Пионеры аплодируют.','{n} кг! Михалыч на приёмке ахнул.','{n} кг — это уже целый шкаф газет!','{n} кг! Галя побежала за новой пачкой.'];
const lim0=n=>Math.max(1.7,4.6-n*.075);            // секунд на пачку: 4,6 → 1,7 к ~39-й пачке
const trapP=n=>n<4?0:Math.min(.38,.12+n*.008);
function deck(rnd){const D=window.ZMG_MAKU||{},P=[],T=[];
  ['m','f','n'].forEach(g=>String(D[g]||'').split(' ').forEach(w=>{if(w)P.push([w,g,'']);}));
  const t=D.t||{};for(const w in t){const s=String(t[w]),i=s.indexOf('|');T.push([w,s.slice(0,i),s.slice(i+1)]);}
  const mix=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const x=a[i];a[i]=a[j];a[j]=x;}return a;};
  return {P:mix(P),T:mix(T),pi:0,ti:0};}
function nextW(d,n,rnd){if(d.T.length&&rnd()<trapP(n)&&d.ti<d.T.length)return d.T[d.ti++];return d.P[d.pi++%Math.max(1,d.P.length)];}
const SACK=c=>'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 18 q20 -10 40 0 l-4 10 q22 10 24 40 q2 26 -40 28 q-42 -2 -40 -28 q2 -30 24 -40z" fill="#d6b47f" stroke="#a9834e" stroke-width="3"/>'+
  '<path d="M33 28 q17 6 34 0" stroke="#7a5a30" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M22 52 q28 8 56 0 l0 18 q-28 8 -56 0z" fill="'+c+'"/></svg>';
const COL={m:'#2563c9',f:'#c2410c',n:'#237a3b'};
const CSS='.zr-mk{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;background:linear-gradient(#f6efdf,#efe3c8)}'+
  '.zr-hud{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;font-weight:800;font-size:17px;color:#27324a}'+
  '.zr-hp{color:#c62f2a;letter-spacing:2px;font-size:20px}.zr-rec{font-size:14px;color:#5b6475;font-weight:700}'+
  '.zr-say{display:flex;gap:8px;align-items:center;padding:0 10px;min-height:58px}.zr-say .zr-av{flex:0 0 48px;height:48px;border-radius:50%;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}'+
  '.zr-say .zr-av svg{width:100%;height:100%}.zr-bub{flex:1;background:#fff;border-radius:14px;padding:7px 11px;font-size:16px;line-height:1.25;color:#27324a;box-shadow:0 1px 3px rgba(0,0,0,.12)}'+
  '.zr-fd{position:relative;flex:1;min-height:250px;overflow:hidden;touch-action:none}'+
  '.zr-pk{position:absolute;left:50%;top:14%;width:190px;max-width:62%;margin-left:-95px;padding:22px 8px 18px;box-sizing:border-box;text-align:center;border-radius:6px;'+
  'background:repeating-linear-gradient(#f4ecd9 0 9px,#e9dcc0 9px 10px);box-shadow:0 6px 0 #cdb98f,0 8px 14px rgba(0,0,0,.18);transition:transform .22s ease-in,opacity .22s;will-change:transform}'+
  '.zr-pk:before,.zr-pk:after{content:"";position:absolute;background:#8a6a3a;opacity:.75}.zr-pk:before{left:50%;top:0;bottom:-6px;width:4px;margin-left:-2px}.zr-pk:after{top:50%;left:0;right:0;height:4px;margin-top:-2px}'+
  '.zr-pk b{position:relative;z-index:1;display:inline-block;background:#fffaf0;padding:2px 10px;border-radius:6px;font-size:28px;color:#27324a}'+
  '.zr-pk.drag{transition:none}.zr-pk.in{animation:zrin .25s ease-out}@keyframes zrin{from{transform:translateY(-60px) rotate(-6deg);opacity:0}}'+
  '.zr-tm{position:absolute;left:10px;right:10px;bottom:6px;height:5px;border-radius:3px;background:rgba(0,0,0,.12);z-index:1}.zr-tm i{display:block;height:100%;border-radius:3px;background:#e8661b}'+
  '.zr-bag{position:absolute;width:104px;height:112px;border:0;background:none;padding:0;cursor:pointer;font:inherit;transition:transform .15s}.zr-bag svg{width:104px;height:92px;display:block}'+
  '.zr-bag span{position:absolute;left:0;right:0;top:51px;text-align:center;color:#fff;font-weight:900;font-size:19px;letter-spacing:1px}'+
  '.zr-bag small{display:block;text-align:center;font-size:13px;font-weight:800;color:#5b6475}.zr-bag.bump{transform:scale(1.12)}.zr-bag.bad{animation:zrsh .3s}'+
  '@keyframes zrsh{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'+
  '.zr-bm{left:4px;top:46%}.zr-bf{right:4px;top:46%}.zr-bn{left:50%;margin-left:-52px;bottom:2px}'+
  '.zr-fl{position:absolute;left:50%;top:40%;transform:translateX(-50%);font-weight:900;font-size:22px;pointer-events:none;animation:zrfl .9s ease-out forwards;white-space:nowrap}'+
  '@keyframes zrfl{to{transform:translate(-50%,-50px);opacity:0}}.zr-hk{text-align:center;font-size:13.5px;color:#5b6475;padding:2px 0 6px}'+
  '@media (min-width:700px){.zr-pk{width:240px;margin-left:-120px}.zr-bm{left:16%}.zr-bf{right:16%}}'+
  '@media (max-height:600px){.zr-say{min-height:48px}.zr-pk{top:6%;padding:16px 8px 14px}.zr-pk b{font-size:24px}}'+
  '@media (prefers-reduced-motion:reduce){.zr-pk,.zr-pk.in,.zr-fl,.zr-bag{animation:none;transition:none}}';
ZMG_REG({id:'makulatura',a:'Смахни пачку в нужный мешок: «он», «она» или «оно»',ns:'Пионерский сбор макулатуры! Пачки — по мешкам: он, она, оно. Кофе — он, запомни сразу.',deps:['js/zmg-makulatura-data.js'],
  open:()=>!!(window.ZMG_MAKU||true),
  lines:{good:'Вот это сбор! Пионерская дружина в восторге.',ok:'Неплохо сдали! Ещё бы пару пачек.',bad:'Ничего, газеты не убегут. Ещё разок?'},
  sim(o,k){const rnd=o.rnd;let kg=0,er=0,n=0;const rt=Math.max(.8,2.6-1.7*k);
    while(er<HP&&n<300){const trap=rnd()<trapP(n),p=trap?0.3+.6*k:.6+.39*k,t=rt*(.7+rnd()*.6);
      if(t>lim0(n)||rnd()>p)er++;else kg+=trap?2:1;n++;}
    return {sc:kg,st:tierOf(kg)};},
  run(host,o){const rnd=o.rnd,D=deck(rnd);if(!D.P.length){host.quit();return;}
    if(!document.getElementById('zrMkCss')){const s=document.createElement('style');s.id='zrMkCss';s.textContent=CSS;document.head.appendChild(s);}
    const best=(S.zmg&&S.zmg.b&&S.zmg.b[o.num])|0;
    host.el.innerHTML='<div class="zr-mk"><div class="zr-hud"><span>Сдано: <b class="zr-kg">0</b> кг</span><span class="zr-hp">♥♥♥</span><span class="zr-rec">'+(best?'рекорд '+best+' кг':'')+'</span></div>'+
      '<div class="zr-say"><span class="zr-av">'+host.face('zina','happy')+'</span><div class="zr-bub">Смахивай пачку в нужный мешок!</div></div>'+
      '<div class="zr-fd">'+['m','f','n'].map(g=>'<button type="button" class="zr-bag zr-b'+g+'" data-g="'+g+'">'+SACK(COL[g])+'<span>'+LB[g]+'</span><small>'+(host.pc?host.kc(g==='m'?'←':g==='f'?'→':'↓'):'')+'</small></button>').join('')+'</div>'+
      (host.pc?'<div class="zr-hk">Стрелки '+host.kc('←')+' он · '+host.kc('→')+' она · '+host.kc('↓')+' оно</div>':'')+'</div>';
    const $=s=>host.el.querySelector(s),fd=$('.zr-fd'),bub=$('.zr-bub'),av=$('.zr-av');
    let kg=0,er=0,n=0,pk=null,t=0,lim=4,on=false,over=false,hold=0,react=0;
    const say=(tx,m)=>{bub.textContent=tx;av.innerHTML=host.face('zina',m||'norm');};
    const fl=(tx,c)=>{const e=document.createElement('div');e.className='zr-fl';e.style.color=c;e.textContent=tx;fd.appendChild(e);setTimeout(()=>e.remove(),950);};
    const hud=()=>{$('.zr-kg').textContent=kg;$('.zr-hp').textContent='♥'.repeat(Math.max(0,HP-er))+'♡'.repeat(Math.min(HP,er));host.top(n?n+' '+(n%10===1&&n%100!==11?'пачка':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'пачки':'пачек'):'');};
    function spawn(){if(over)return;const w=nextW(D,n,rnd);pk={w:w[0],g:w[1],tx:w[2],el:document.createElement('div')};
      pk.el.className='zr-pk'+(host.calm?'':' in');pk.el.innerHTML='<b>'+esc(w[0])+'</b><div class="zr-tm"><i></i></div>';fd.appendChild(pk.el);
      t=0;lim=lim0(n)*(host.calm?1.35:1);react=0;}
    function bag(g){return fd.querySelector('.zr-b'+g);}
    function answer(g,timeout){if(!pk||over||!on)return;const p=pk;pk=null;const ok=!timeout&&g===p.g;n++;
      const b=g&&bag(g);
      if(b&&!host.calm){const r=b.getBoundingClientRect(),q=p.el.getBoundingClientRect(),z=(typeof uiZoom==='function'&&uiZoom())||1;
        p.el.classList.remove('drag');p.el.style.transform='translate('+((r.left+r.width/2-q.left-q.width/2)/z)+'px,'+((r.top+r.height/2-q.top-q.height/2)/z)+'px) scale(.25)';p.el.style.opacity='0';}
      else p.el.style.opacity='0';
      setTimeout(()=>p.el.remove(),240);
      if(b){b.classList.remove('bump','bad');void b.offsetWidth;b.classList.add(ok?'bump':'bad');setTimeout(()=>b.classList.remove('bump','bad'),300);}
      if(ok){const add=p.tx?2:1;kg+=add;fl('+'+add+' кг','#237a3b');try{host.snd.coin();}catch(e){}
        if(p.tx)say('Молодец! '+p.tx,'happy');else if(Math.floor(kg/10)>Math.floor((kg-add)/10))say(KG[Math.floor(rnd()*KG.length)].replace('{n}',Math.floor(kg/10)*10),'wow');
        else if(rnd()<.3)say(OK[Math.floor(rnd()*OK.length)],'happy');}
      else{er++;fl(timeout?'Не успел!':'Ошибка!','#c62f2a');try{host.snd.bad();}catch(e){}
        say(timeout?SLOW[Math.floor(rnd()*SLOW.length)]+(p.tx?' '+p.tx:' «'+p.w+'» — '+PR[p.g]+'.'):p.tx||NO[Math.floor(rnd()*NO.length)].replace('{w}',p.w).replace('{g}',PR[p.g]),'sad');}
      hud();
      if(er>=HP){over=true;hold=setTimeout(()=>host.finish({sc:kg,st:tierOf(kg),h:er,label:'Сдано '+kg+' кг · '+n+' '+(n%10===1&&n%100!==11?'пачка':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'пачки':'пачек')}),host.calm?600:1300);return;}
      setTimeout(spawn,host.calm?120:230);}
    // смахивание: пачку тащим пальцем; отпустил — направление; нажатие на мешок — ответ
    let dn=null;
    host.ptr(fd,{down(x,y,e){const t=e.target&&e.target.closest?e.target.closest('.zr-bag'):null;if(t){dn={bag:t.getAttribute('data-g')};return;}
        if(!pk)return;dn={x,y,p:pk};pk.el.classList.add('drag');},
      move(x,y){if(!dn||!dn.p||dn.p!==pk)return;const dx=x-dn.x,dy=y-dn.y;pk.el.style.transform='translate('+dx+'px,'+dy+'px) rotate('+(dx/14)+'deg)';},
      up(x,y,e){const d=dn;dn=null;if(!d)return;if(d.bag){const t=e.target&&e.target.closest?e.target.closest('.zr-bag'):null;answer(d.bag);void t;return;}
        if(d.p!==pk)return;const dx=x-d.x,dy=y-d.y;
        if(Math.abs(dx)<36&&Math.abs(dy)<36){pk.el.classList.remove('drag');pk.el.style.transform='';return;}
        const g=Math.abs(dx)>Math.abs(dy)?(dx<0?'m':'f'):(dy>0?'n':'');
        if(!g){pk.el.classList.remove('drag');pk.el.style.transform='';return;}answer(g);}});
    host.keys(k=>{const g=KEY[k];if(!g)return false;answer(g);return true;});
    host.loop(dt=>{if(!pk||over||!on)return;t+=dt;react+=dt;const i=pk.el.querySelector('.zr-tm i');if(i)i.style.width=Math.max(0,100*(1-t/lim))+'%';if(t>=lim)answer('',true);});
    host.onQuit(()=>{over=true;clearTimeout(hold);});
    host.bot=k=>{if(!pk||over||!on)return;if(react<Math.max(.25,1.6-1.3*k))return;const trap=!!pk.tx,p=trap?0.3+.6*k:.6+.39*k;
      answer(rnd()<p?pk.g:['m','f','n'].filter(g=>g!==pk.g)[Math.floor(rnd()*2)]);};
    hud();
    host.intro({text:'Пионерский сбор макулатуры! На пачке — слово. Смахни её в мешок: влево «он», вправо «она», вниз «оно». Три ошибки — и сбор окончен.',
      hint:host.pc?'На компьютере — стрелки '+host.kc('←')+' '+host.kc('→')+' '+host.kc('↓')+' или нажми на мешок.':'Можно и просто нажать на мешок.',btn:'Начать сбор'})
      .then(()=>{on=true;say('Смахивай пачку в нужный мешок!','happy');spawn();});}});
})();
