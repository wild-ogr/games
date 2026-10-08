'use strict';
/* OB:MG0 мини-игра №10 «Загадки воеводы». День = 5 загадок, без таймера, три ответа, после ответа — пояснение:
   2 «настоящие» из банка ZG_BANK (js/mg-zg-data.js: сказки, былины, Древняя Русь, пословицы, народные загадки, про игру; часть — из «Дворовой викторины»),
   1–2 «от бабы Зины» (шутка из её «Толкового словаря» → какое это слово), остальное — повадки нечисти (по Книге нечисти, из встреченной нечисти).
   Вопросы — по номеру дня (у всех одинаковые), банк по кругу: повтор не раньше ~2,5 месяца, Зина — ~4,5 недели (1–2 в день, в среднем 4 за 3 дня). Ступени: 3/5 — 1, 4/5 — 2, 5/5 — 3.
   «Спросить Ягу» (ролик, раз за игру) — убирает один неверный ответ. */
(function(){
const QT=[   // только повадки, которые не угадать по картинке (решение проверки 08.10: броня/скорость/здоровье/жизни/летает/стрелы/рассыпается/звереет/колдовство/лечит — видно по рисунку; остались «заживает» и «прыгает»)
  {k:'regen',t:['Кто заживает прямо на ходу?','Who heals while on the move?'],f:e=>(e.regen||0)>0},
  {k:'hop',t:['Кто прыгает вперёд, срезая дорогу?','Who hops forward, cutting the road short?'],f:e=>e.ab==='hop'},];
const BASE=['muh','wolf','bat','lesh','piy','kik','ogon','vod','voron','skel','upyr','prizr','koldun','idol'];
function zgTier(s){return s>=5?3:s>=4?2:s>=3?1:0;}
function zgPool(){const ok=t=>EN[t]&&!EN[t].boss&&!EN[t].egg&&ART[EN[t].art||t]&&t!=='egg';let a=Object.keys(S.seen||{}).filter(ok);if(a.length<8)a=BASE.filter(ok).concat(a.filter(t=>!BASE.includes(t)));return a;}
function zgBeh(R,need){const pool=zgPool(),out=[],used={},pick=a=>a[Math.floor(R()*a.length)],sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const types=sh(QT.slice());for(let tries=0;out.length<need&&tries<60;tries++){const q=types[tries%types.length];if(used[q.k]&&tries<types.length*2)continue;let r=null;
    if(q.f){const yes=pool.filter(t=>q.f(EN[t])),no=pool.filter(t=>!q.f(EN[t]));if(yes.length&&no.length>=2){const ok=pick(yes),n=sh(no.slice()).slice(0,2);r={ok,opts:sh([ok].concat(n))};}}
    else{for(let k=0;k<12&&!r;k++){const c=sh(pool.slice()).slice(0,3).sort((a,b)=>q.mx(EN[b])-q.mx(EN[a]));if(c.length<3)break;const v0=q.mx(EN[c[0]]),v1=q.mx(EN[c[1]]);if(v0-v1>=Math.max(1,q.gap)&&(!q.rat||v0>=v1*q.rat))r={ok:c[0],opts:sh(c.slice())};}}
    if(r&&!out.some(x=>x.ok===r.ok&&x.k===q.k)){used[q.k]=1;out.push({kind:'beh',t:q.t,ok:r.ok,opts:r.opts.map(t=>({k:t,img:EN[t].art||t,get ru(){return EN[t].n;},get en(){return EN[t].n;}})),head:()=>EN[r.ok].n,x:()=>EN[r.ok].about});}}
  return out;}
/* день = 5 загадок: 2 «настоящих» из банка (сказки, былины, Русь, пословицы, народные загадки, про игру), 1–2 «от бабы Зины», остальное — повадки нечисти.
   Банк и словарь идут по кругу в своём порядке (перестановка по постоянному зерну): повтор вопроса — не раньше чем через ~2,5 месяца (банк) и ~5 недель (Зина); у всех одинаково. */
function zgDayN(day){const p=String(day||dayKey()).split('-').map(Number);return Math.floor(Date.UTC(p[0],p[1]-1,p[2])/864e5);}
function zgPerm(n,seed){const R=mulberry(seed),a=[];for(let i=0;i<n;i++)a.push(i);for(let i=n-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function zgMake(R,o){o=o||{};const D=o.train?Math.floor(R()*1e5):zgDayN(o.day),out=[],sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const B=typeof ZG_BANK!=='undefined'?ZG_BANK:[],Z=typeof ZG_ZINA!=='undefined'?ZG_ZINA:[];
  if(B.length){const P=zgPerm(B.length,7331);for(let k=0;k<2;k++){const b=B[P[(D*2+k)%B.length]];const idx=sh([0,1,2]);
    out.push({kind:'bank',id:b[0],t:[b[2],b[5]],ok:'0',opts:idx.map(i=>({k:String(i),ru:b[3][i],en:b[6][i]})),head:()=>Lg(b[3][0],b[6][0]),x:()=>Lg(b[4],b[7])});}}
  if(Z.length){const P=zgPerm(Z.length,4242),c=D%3===0?2:1,st=D+Math.floor((D+2)/3);
    for(let k=0;k<c;k++){const z=Z[P[(st+k)%Z.length]],cap=t=>String(t).replace(/^(a|an) /,'').replace(/^./,c=>c.toUpperCase());
      const opts=sh([{k:'0',ru:cap(z[0]),en:cap(z[3])},{k:'1',ru:cap(z[5][0]),en:cap(z[6][0])},{k:'2',ru:cap(z[5][1]),en:cap(z[6][1])}]);
      out.push({kind:'zina',t:['«'+z[2]+'» Что это?','“'+z[4]+'” What is it?'],ok:'0',opts,head:()=>cap(Lg(z[0],z[3])),
        x:()=>Lg('Так про это слово сказано в «Толковом словаре бабы Зины».','That’s how Granny Zina’s Joke Dictionary describes it.')});}}
  const beh=zgBeh(R,5-out.length);for(const q of beh)out.push(q);
  // перемешать порядок, но первая загадка дня — «настоящая»
  const f=out.shift();sh(out);out.unshift(f);return out.slice(0,5);}
function css(){if($('zgCss'))return;const s=document.createElement('style');s.id='zgCss';s.textContent=
  '.zg{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;flex-direction:column;background:var(--menuBg,#ecd9a8);overflow:hidden}'+
  '.zg .zgSc{position:relative;flex:none;border-bottom:4px solid var(--wood,#9a6332);box-shadow:0 4px 0 var(--lip)}.zg .zgSc canvas{display:block}'+
  '.zg .zgMain{flex:1;overflow-y:auto;padding:10px 12px calc(var(--sb,0px) + 12px);display:flex;flex-direction:column;gap:10px}'+
  '.zg .zgPr{display:flex;justify-content:center;gap:8px}.zg .zgPr i{width:30px;height:30px;border-radius:50%;border:2.5px solid var(--wood);background:var(--paper);display:flex;align-items:center;justify-content:center;font:900 15px var(--f);color:var(--ink2);font-style:normal}'+
  '.zg .zgPr i.ok{background:#7cc94e;color:#fff;border-color:#2c6a16}.zg .zgPr i.no{background:#e58b72;color:#fff;border-color:#a0321a}.zg .zgPr i.cur{box-shadow:0 0 0 3px #ffc93a}'+
  '.zg .zgQ{display:flex;align-items:flex-end;gap:8px}.zg .zgQ img{width:78px;height:78px;flex:none;filter:drop-shadow(0 3px 5px rgba(0,0,0,.3))}'+
  '.zg .zgB{position:relative;flex:1;background:var(--paper,#fffaf0);border:2.5px solid var(--wood);border-radius:18px;padding:12px 14px;font:800 20px/1.25 var(--f);color:var(--ink);box-shadow:0 4px 0 var(--lip);animation:mgRise .35s ease-out both}'+
  '.zg .zgB:before{content:"";position:absolute;left:-12px;bottom:16px;border:8px solid transparent;border-right:12px solid var(--wood)}'+
  '.zg .zgB small{display:block;font:700 13px var(--f);color:var(--ink2);margin-bottom:3px}'+
  '.zg .zgA{display:flex;gap:8px}.zg .zgA button{flex:1;min-width:0;min-height:150px;padding:8px 4px;border-radius:18px;background:var(--pnBg,#fdf0cf);border:3px solid var(--wood);box-shadow:inset 0 0 0 2px #fff7e0,0 5px 0 var(--lip);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font:800 15px/1.15 var(--f);color:var(--ink);transition:transform .12s}'+
  '.zg .zgA.tx{flex-direction:column}.zg .zgA.tx button{min-height:64px;font-size:19px;padding:10px 14px;flex-direction:row}.zg .zgB.zn{background:#fff3f6}.zg .zgA button img{width:86px;height:86px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))}.zg .zgA button:active{transform:translateY(3px)}'+
  '.zg .zgA button.ok{background:#eaf7d8;border-color:#4a9a2c;box-shadow:0 0 0 4px #9ae06a,0 5px 0 var(--lip);animation:zgOk .5s ease-out}'+
  '.zg .zgA button.no{background:#ffe6dc;border-color:#c0321a;animation:zgNo .45s}.zg .zgA button.off{opacity:.35;pointer-events:none}'+
  '@keyframes zgOk{0%{transform:scale(1)}40%{transform:scale(1.1)}100%{transform:none}}@keyframes zgNo{0%,100%{transform:none}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}'+
  '.zg .zgE{background:var(--paper);border:2.5px solid var(--wood);border-radius:16px;padding:10px 12px;font:700 15px/1.35 var(--f);color:var(--ink);animation:mgRise .3s ease-out both}.zg .zgE b{font-size:18px;display:block;margin-bottom:2px}'+
  '.zg .zgE b.ok{color:var(--cOk,#2f7a1c)}.zg .zgE b.no{color:var(--cBad,#c0321a)}'+
  '.zg .btn{width:100%;white-space:normal}'+
  '@media (min-aspect-ratio:5/4) and (min-height:420px){.zg{flex-direction:row}.zg .zgSc{width:42%;border-bottom:0;border-right:4px solid var(--wood)}.zg .zgMain{padding-top:calc(var(--st,0px) + 16px);justify-content:center;max-width:720px}}'+
  '.zg .zgK{display:inline-block;min-width:22px;padding:1px 5px;margin-right:6px;border-radius:6px;border:2px solid #5a3a1a;background:linear-gradient(#fffaf0,#e6d2a8);color:#3a2410;font:900 14px/1.2 var(--f);box-shadow:0 2px 0 rgba(30,18,8,.45);vertical-align:middle}.zg .zgPc{text-align:center;font:700 13px/1.3 var(--f);color:var(--ink2,#6a4a2a);margin:6px 0 0}'+
  'body.mgCalm .zg *{animation:none!important}';
  document.head.appendChild(s);}
function run(host,o){css();const R=o.rnd,Q=zgMake(R,o),calm=o.calm;
  const el=document.createElement('div');el.className='zg';el.innerHTML='<div class="zgSc"><canvas></canvas></div><div class="zgMain"></div>';host.el.appendChild(el);
  const cv=el.querySelector('canvas'),main=el.querySelector('.zgMain'),sc=el.querySelector('.zgSc');
  const st={i:0,score:0,res:[],hint:0,done:0};let raf=0,t0=performance.now();
  function fitSc(){const wide=host.w>host.h*1.25&&host.h>=420,W=wide?Math.round(host.w*.42):host.w,H=wide?host.h:Math.round(Math.max(150,Math.min(260,host.h*.27)));dzCv(cv,W,H);}
  fitSc();host.onResize(()=>{fitSc();});
  const frame=now=>{if(st.dead)return;dzScene(cv,{t:(now-t0)/1000,sign:10,still:calm});if(!calm)raf=requestAnimationFrame(frame);};frame(t0);host.onQuit(()=>{st.dead=1;cancelAnimationFrame(raf);});
  const oname=x=>Lg(x.ru,x.en);
  function show(){const q=Q[st.i];if(!q){finish();return;}
    let h='<div class="zgPr">'+Q.map((_,i)=>'<i class="'+(st.res[i]===1?'ok':st.res[i]===0?'no':i===st.i?'cur':'')+'">'+(st.res[i]===1?'✓':st.res[i]===0?'✗':i+1)+'</i>').join('')+'</div>';
    const zn=q.kind==='zina';h+='<div class="zgQ"><img src="'+ic(zn?'tetka':'voevoda',160)+'" alt=""><div class="zgB'+(zn?' zn':'')+'"><small>'+Lg('Загадка ','Riddle ')+(st.i+1)+Lg(' из ',' of ')+Q.length+' · '+(zn?Lg('от бабы Зины','from Granny Zina'):VOEV())+'</small>'+Lg(q.t[0],q.t[1])+'</div></div>';
    const pic=q.opts.every(x=>x.img);
    h+='<div class="zgA'+(pic?'':' tx')+'">'+q.opts.map((x,i)=>'<button data-t="'+x.k+'">'+(pc?'<kbd class="zgK">'+(i+1)+'</kbd>':'')+(x.img?'<img src="'+ic(x.img,172)+'" alt="">':'')+oname(x)+'</button>').join('')+'</div><div class="zgX"></div>';
    if(!st.hint&&!o.train&&host.adOk())h+='<button class="btn ad" id="zgH">'+Lg('🎬 Спросить Ягу за рекламу — убрать неверный','🎬 Ask Yaga for an ad — remove a wrong one')+'</button>';
    if(pc&&st.i===0)h+='<p class="zgPc">'+Lg('На компьютере: клавиши 1 2 3 — ответ, Enter или пробел — дальше.','On a computer: keys 1 2 3 — answer, Enter or Space — next.')+'</p>';
    main.innerHTML=h;main.scrollTop=0;
    for(const b of main.querySelectorAll('[data-t]'))b.onclick=()=>answer(b.dataset.t);
    const hb=$('zgH');if(hb)hb.onclick=()=>{hb.disabled=true;host.ad('hint').then(ok=>{hb.disabled=false;if(!ok)return;st.hint=1;hb.remove();const w=q.opts.find(x=>x.k!==q.ok).k,b=main.querySelector('[data-t="'+w+'"]');if(b)b.classList.add('off');});};}
  const pc=mgPC();   // OB:FINAL ПК: 1 2 3 — ответ, Enter/пробел — «Дальше»
  mgKeys(host,k=>{const n=$('zgN');if(n&&(k==='Enter'||k===' ')){n.click();return true;}const i={'1':0,'2':1,'3':2}[k];if(i==null||st.lock)return false;const b=main.querySelectorAll('[data-t]')[i];if(b&&!b.classList.contains('off')){b.click();return true;}return false;});
  function answer(t){const q=Q[st.i];if(st.lock)return;st.lock=1;const ok=t===q.ok;st.res[st.i]=ok?1:0;if(ok)st.score++;
    for(const b of main.querySelectorAll('[data-t]')){b.onclick=null;if(b.dataset.t===q.ok)b.classList.add('ok');else if(b.dataset.t===t)b.classList.add('no');else b.classList.add('off');}
    try{ok?host.snd.star(Math.min(2,st.score-1)):host.snd.lose();}catch(_){}const hb=$('zgH');if(hb)hb.remove();
    const praise=ok?[Lg('Верно!','Right!'),Lg('Так точно!','Exactly!'),Lg('Молодец, дозорный!','Well done, watchman!')][st.i%3]:Lg('Не так…','Not quite…');
    main.querySelector('.zgX').innerHTML='<div class="zgE"><b class="'+(ok?'ok':'no')+'">'+praise+'</b><b style="font-size:16px;color:var(--ink)">'+q.head()+'</b>'+q.x()+'</div>'+
      '<button class="btn big" id="zgN" style="margin-top:10px">'+(st.i<Q.length-1?Lg('Дальше ▸','Next ▸'):Lg('Итоги','Results'))+'</button>';
    const n=$('zgN');n.scrollIntoView&&n.scrollIntoView({block:'nearest',behavior:calm?'auto':'smooth'});n.onclick=()=>{try{host.snd.click();}catch(_){}st.lock=0;st.i++;show();};}
  function finish(){if(st.done)return;st.done=1;host.done({score:st.score,tier:zgTier(st.score),extra:{lbl:Lg('верных ответов из 5','correct answers of 5')}});}
  if(Q.length<5)while(Q.length<5&&Q.length)Q.push(Q[Q.length%Q.length]);
  show();
  if(/[?&]mg=/.test(location.search))window.__auto=()=>{const n=$('zgN');if(n){n.click();return;}const q=Q[st.i];if(q&&!st.lock)answer(R()<.8?q.ok:q.opts.find(x=>x.k!==q.ok).k);};}
function sim(o,k){const R=mulberry(o.seed^0x2a2a);let s=0;for(let i=0;i<5;i++)if(R()<Math.min(.97,.33+k*.62))s++;return {score:s,tier:zgTier(s)};}
MG_REG({id:'zagadki',num:10,n:{ru:'Загадки воеводы',en:'Commander’s Riddles'},icon:'mg_i10',kind:'score',unit:{ru:'верных ответов из 5',en:'correct answers of 5'},run,sim,make:zgMake});
})();
