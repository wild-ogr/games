'use strict';
/* gb-MGA мини-игра №2 «Сдача» (ведёт тётя Валя; id 'sdacha'). Договор — шапка js/gmg-core.js (MG0).
   Четыре покупателя: покупка N коп., дали рубль или полтинник — набери сдачу монетами 1–20 коп. из лотка и подай на блюдце.
   Сумму сдачи игрок считает сам (на блюдце видна только сумма монет). Не сошлось — «Пересчитаем!»: Валя называет, сколько нужно, монеты остаются — поправь.
   Очки за покупателя: 3 — сдача наименьшим числом монет с первого раза; −1 за лишние монеты; −1 если пересчитывали (не меньше 1). Сумма 4…12.
   Звёзды: ≥11 — 3★, ≥8 — 2★, иначе 1★ (доиграл — уже звезда; ошибка не наказывает сильнее). Ролик по нужде (1 за заход, после ошибки):
   «📺 Валя пересчитает» — раскладывает правильную сдачу (покупатель засчитывается на 2 очка).
   ПК: 1–7 — монета (1, 2, 3, 5, 10, 15, 20), Backspace — убрать последнюю, Enter/Пробел — отдать сдачу (после ответа — следующий).
   Тексты — js/gmg-sdacha-data.js (GMG.data.sdacha). Своих полей сохранения нет. */
(function(){
if(typeof GMG_REG!=='function')return;
const ID='sdacha',N=4,COINS=[1,2,3,5,10,15,20];
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const fill=(t,c)=>String(t||'').replace(/\{(\w+)\}/g,(m,k)=>c&&c[k]!=null?c[k]:'');
const T=()=>window.GMG&&GMG.data&&GMG.data.sdacha||{};
const pick=(a,r)=>a&&a.length?a[Math.floor(r()*a.length)%a.length]:'';
const tierOf=s=>s>=11?3:s>=8?2:s>=1?1:0;
/* наименьшее число монет на сумму c (монеты 1,2,3,5,10,15,20 — жадный не всегда верен: 30 = 15+15, а не 20+5+5) */
const MINC=(function(){const m=[0];for(let c=1;c<=100;c++){let b=99;for(const k of COINS)if(k<=c&&m[c-k]+1<b)b=m[c-k]+1;m.push(b);}return m;})();
function minSet(c){const out=[];while(c>0){for(const k of COINS.slice().reverse())if(k<=c&&MINC[c-k]===MINC[c]-1){out.push(k);c-=k;break;}}return out;}
const KINDS=['babka','school','police','intel','worker','student'];
/* план захода: 4 покупателя, разные товары, сдача 6…60 коп. */
function plan(o){const r=o.rnd,B=(T().buy||[]).filter(b=>b&&b[2]>0&&b[2]<100),used={},out=[];
  for(let i=0;i<N&&B.length;i++){let b=null;for(let k=0;k<40;k++){const x=B[Math.floor(r()*B.length)];if(!used[x[0]]||k>30){b=x;break;}}used[b[0]]=1;
    const p=b[2],m=p>=40?100:50,c=m-p;out.push({g:b[0],what:b[1],p,m,c,min:MINC[c],kind:KINDS[Math.floor(r()*KINDS.length)],ask:pick(T().ask,r),give:pick(T().give,r)});}
  return out;}
function sim(o,k){const P=plan(o),r=o.rnd;let s=0;for(const q of P){let v=3;if(r()>.45+k*.5)v--;if(r()>.4+k*.55)v--;s+=Math.max(1,v);}return {sc:s,st:tierOf(s)};}

function run(host,o){const D=T(),P=plan(o);if(!P.length){host.quit();return;}
  let i=-1,q=null,plate=[],sc=0,good=0,err=0,state='play',fin=false,adShown=false;
  const fest=host.fest&&host.fest.id;
  host.el.innerHTML='<div class="gma-wrap gma-sd'+(fest?' gma-f-'+esc(fest):'')+'">'+
    '<div class="gma-say"></div><div class="gma-sd-sc"><canvas></canvas></div><div class="gma-sd-head"></div>'+
    '<div class="gma-sd-plate" aria-live="polite"></div>'+
    '<div class="gma-sd-tray">'+COINS.map((c,k)=>'<button class="gma-coin c'+c+'" data-c="'+c+'" aria-label="'+c+' коп.">'+(host.pc?'<i class="gma-kn">'+(k+1)+'</i>':'')+'<b>'+c+'</b><small>коп</small></button>').join('')+'</div>'+
    '<div class="gma-row"><button class="btn gma-sd-del">⌫ '+esc(D.del||'Убрать')+(host.pc?' '+host.kc('Backspace'):'')+'</button>'+
    '<button class="btn green gma-sd-go">'+esc(D.give_btn||'Отдать сдачу')+(host.pc?' '+host.kc('Enter'):'')+'</button></div>'+
    '<div class="gma-sd-ad"></div></div>';
  const $=s=>host.el.querySelector(s),say=$('.gma-say'),head=$('.gma-sd-head'),pl=$('.gma-sd-plate'),goB=$('.gma-sd-go'),delB=$('.gma-sd-del'),adB=$('.gma-sd-ad');
  const cvs=$('.gma-sd-sc canvas'),sc0=$('.gma-sd-sc');let tk=0;
  function draw(){const w=sc0.clientWidth,h=sc0.clientHeight;if(!w||!h)return;const d=host.dpr;if(cvs.width!==Math.round(w*d)||cvs.height!==Math.round(h*d)){cvs.width=Math.round(w*d);cvs.height=Math.round(h*d);cvs.style.width=w+'px';cvs.style.height=h+'px';}
    const g=cvs.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
    // стена и прилавок
    g.fillStyle='#e9dcc4';g.fillRect(0,0,w,h);g.fillStyle='#a0673a';g.fillRect(0,h*.78,w,h*.22);g.fillStyle='#c48a55';g.fillRect(0,h*.76,w,h*.05);
    if(!q)return;const ph=Math.min(h*1.05,w*.45);
    try{drawPerson(g,q.kind,w*.3,h*.78+ph*.08,ph,state==='bad'?0:1,host.calm?0:tk,state==='play');}catch(e){}
    try{drawGood(g,q.g,w*.68,h*.8,Math.min(h*.62,w*.22));}catch(e){}
    // ценник
    const t=q.p+' коп.';g.font='800 '+Math.round(Math.min(18,h*.15))+'px sans-serif';const tw=g.measureText(t).width+14,tx=w*.68-tw/2,ty=h*.83;
    g.fillStyle='#fffbe8';g.fillRect(tx,ty,tw,Math.min(24,h*.18));g.strokeStyle='#7a5a2a';g.lineWidth=1.5;g.strokeRect(tx,ty,tw,Math.min(24,h*.18));
    g.fillStyle='#3b2a1a';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w*.68,ty+Math.min(12,h*.09)+1);}
  if(!host.calm)host.loop(dt=>{tk+=dt;draw();});
  host.onResize(()=>draw());
  const sum=()=>plate.reduce((a,b)=>a+b,0);
  function drawPlate(){const s=sum();
    pl.innerHTML=plate.length?'<span class="gma-sd-coins">'+plate.map((c,k)=>'<button class="gma-coin sm c'+c+'" data-k="'+k+'" aria-label="убрать '+c+'"><b>'+c+'</b></button>').join('')+'</span><span class="gma-sd-sum">'+esc(fill(D.plate,{s}))+'</span>'
      :'<span class="gma-sd-sum e">'+esc(D.plate0||'')+'</span>';
    [].forEach.call(pl.querySelectorAll('.gma-coin'),b=>b.onclick=()=>{if(state!=='play'&&state!=='bad')return;plate.splice(+b.dataset.k,1);tap();drawPlate();});}
  function tap(){try{host.snd.pick();}catch(e){}}
  function next(){i++;plate=[];adB.innerHTML='';if(i>=P.length){end();return;}q=P[i];q.err=0;state='play';
    host.top((i+1)+' из '+P.length);
    const pay=D.pay&&D.pay[q.m]||q.m+' коп.',ask=q.ask.replace('{what}',q.what);
    if(i===0||!say.innerHTML)say.innerHTML=host.say('valya',esc(pick(D.next,o.rnd)||'Следующий!'),'norm');
    head.innerHTML='<q class="gma-sd-q">'+esc(ask.charAt(0).toUpperCase()+ask.slice(1))+' '+esc(fill(q.give,{pay}))+'</q><span>'+esc(fill(D.head,{what:q.what,p:q.p,pay}))+'</span>';
    goB.innerHTML=esc(D.give_btn||'Отдать сдачу')+(host.pc?' '+host.kc('Enter'):'');goB.disabled=false;delB.disabled=false;drawPlate();draw();}
  function add(c){if(state!=='play'&&state!=='bad')return;if(plate.length>=12)return;plate.push(c);tap();drawPlate();}
  function del(){if(state!=='play'&&state!=='bad')return;if(plate.length){plate.pop();tap();drawPlate();}}
  function give(){if(state==='done'){next();return;}if(state!=='play'&&state!=='bad')return;const s=sum();
    if(s!==q.c){q.err++;err++;state='bad';try{host.snd.bad();}catch(e){}
      const d=s<q.c?fill(D.more,{d:q.c-s}):fill(D.less,{d:s-q.c});
      say.innerHTML=host.say('valya','<b>'+esc(pick(D.recount,o.rnd))+'</b> '+esc(fill(D.need,{c:q.c,m:q.m,p:q.p}))+' '+esc(d),'sad');
      offerAd();draw();return;}
    const v=Math.max(1,3-(plate.length>q.min?1:0)-(q.err?1:0));sc+=v;if(v===3)good++;state='done';
    try{host.snd.till();}catch(e){try{host.snd.coin();}catch(x){}}
    say.innerHTML=host.say('valya',esc(plate.length>q.min?pick(D.okMore,o.rnd):pick(D.ok,o.rnd))+(plate.length>q.min?' <small>('+esc(minSet(q.c).join(' + '))+')</small>':''),'happy');
    adB.innerHTML='';goB.innerHTML=(i>=P.length-1?'Итоги':'Следующий ▸')+(host.pc?' '+host.kc('Enter'):'');delB.disabled=true;draw();}
  function offerAd(){if(adShown||!host.adOk||!host.adOk())return;adShown=true;
    adB.innerHTML='<button class="btn rw gma-ad">'+esc(D.ad||'📺 Валя пересчитает')+'</button>';
    adB.querySelector('button').onclick=()=>{const b=adB.querySelector('button');if(b)b.disabled=true;
      host.adNeed('count').then(ok=>{if(fin||!q)return;if(!ok){adB.innerHTML='';return;}
        plate=minSet(q.c);drawPlate();q.err=Math.max(q.err,1);adB.innerHTML='<p class="gma-note">'+esc(D.adDone||'')+'</p>';});};}
  function end(){if(fin)return;fin=true;host.top('');host.finish({sc,st:tierOf(sc),h:err,label:fill(D.label,{n:good})});}
  [].forEach.call(host.el.querySelectorAll('.gma-sd-tray .gma-coin'),b=>b.onclick=()=>add(+b.dataset.c));
  delB.onclick=del;goB.onclick=give;
  host.keys((k)=>{if(fin)return false;const j='1234567'.indexOf(k);if(j>=0&&k.length===1){add(COINS[j]);return true;}
    if(k==='Backspace'||k==='Delete'){del();return true;}if(k==='Enter'||k===' '){give();return true;}return false;});
  host.onQuit(()=>{fin=true;});
  // бот стенда: хороший (k→1) кладёт наименьший набор; слабый — то лишнюю монету (ошибка → «Пересчитаем!»), то мелочью
  host.bot=k=>{if(fin||!q)return;if(state==='done'){give();return;}
    if(!q._bw||state==='bad'&&q._bb!==q.err){q._bb=q.err;const m=minSet(q.c),r=Math.random();
      q._bw=state==='bad'||r<k?m:r<(1+k)/2?m.concat([1]):m.slice(0,-1).concat(minSet(m[m.length-1]>1?m[m.length-1]:1).length>1?minSet(m[m.length-1]):[1,1].slice(0,m[m.length-1]));
      plate=[];drawPlate();}
    if(plate.length<q._bw.length){add(q._bw[plate.length]);return;}give();};
  host.el._mga={plan:P,state:()=>state,i:()=>i,sc:()=>sc,min:minSet};
  host.intro({who:'valya',text:D.intro,hint:esc(host.pc?D.hintPC||D.hint:D.hint),btn:D.btn||'Начать'}).then(next);}

GMG_REG({id:ID,deps:['js/gmg-sdacha-data.js'],run,sim,plan,minSet,
  get lines(){return T().lines||{};}});

(function(){if(document.getElementById('gma-sd-css'))return;const st=document.createElement('style');st.id='gma-sd-css';st.textContent=
'.gma-sd-sc{flex:0 0 auto;height:clamp(84px,19vh,170px);margin:0 auto;width:calc(100% - 20px);max-width:560px;border-radius:14px;overflow:hidden;position:relative}'+
'.gma-sd-sc canvas{display:block}'+
'.gma-sd-head{margin:6px auto 0;width:calc(100% - 20px);max-width:560px;text-align:center;font-weight:800;font-size:17px;line-height:1.25}.gma-sd-head span{display:block}'+
'.gma-sd-q{display:block;font-weight:600;font-style:italic;color:#5a3d22;margin-bottom:2px}.gma-sd-q:before{content:"— "}.gma-sd-q:after{content:""}'+
'.gma-sd-plate{margin:6px auto;width:calc(100% - 20px);max-width:560px;min-height:62px;background:radial-gradient(#fff 55%,#e9e2d4);border:2px dashed #c9b08a;border-radius:40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;padding:4px 10px}'+
'.gma-sd-coins{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}.gma-sd-sum{font-weight:800;font-size:17px;margin-left:6px}.gma-sd-sum.e{font-weight:600;color:#7a6650;font-size:16px}'+
'.gma-sd-tray{margin:2px auto 6px;width:calc(100% - 20px);max-width:560px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px}'+
'.gma-coin{position:relative;width:62px;height:62px;border-radius:50%;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;'+
'background:radial-gradient(circle at 35% 30%,#fff7d6,#d9b65a 60%,#a8842e);box-shadow:inset 0 0 0 3px rgba(120,90,20,.45),0 3px 0 #7b5e1e;color:#4a3608;font-family:inherit}'+
'.gma-coin b{font-size:22px;font-weight:900}.gma-coin small{font-size:11px;font-weight:700}'+
'.gma-coin.c1,.gma-coin.c2,.gma-coin.c3,.gma-coin.c5{background:radial-gradient(circle at 35% 30%,#ffe2c4,#c98a4f 60%,#8a5428);color:#3f2210}'+
'.gma-coin:active{transform:translateY(2px);box-shadow:inset 0 0 0 3px rgba(120,90,20,.45),0 1px 0 #7b5e1e}'+
'.gma-coin.sm{width:40px;height:40px}.gma-coin.sm b{font-size:16px}'+
'.gma-kn{position:absolute;left:-2px;top:-4px;font:700 11px/16px monospace;background:#fff;border:1px solid #9a8a78;border-radius:5px;padding:0 4px;color:#3b2a1a;font-style:normal}'+
'.gma-sd-ad{margin:0 auto;width:calc(100% - 20px);max-width:560px}.gma-sd-ad .btn{width:100%;min-height:52px;margin-top:6px}.gma-note{text-align:center;font-size:16px;margin:6px 0}'+
'@media (max-height:620px){.gma-sd-sc{height:78px}.gma-coin{width:56px;height:56px}.gma-sd-plate{min-height:52px}}'+
'@media (min-width:700px) and (min-height:700px){.gma-coin{width:72px;height:72px}.gma-coin b{font-size:26px}}';
document.head.appendChild(st);})();
/* общие стили игр MGA (одинаковые в каждом файле — грузится любая первой) */
(function(){if(document.getElementById('gma-css'))return;const st=document.createElement('style');st.id='gma-css';st.textContent=
'.gma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:4px 0 10px;min-height:0;overflow-y:auto;overflow-x:hidden;font-size:17px}'+
'.gma-say{margin:0 auto;width:calc(100% - 20px);max-width:560px;min-height:58px}'+
'.gma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 20px);max-width:560px}.gma-row .btn{flex:1 1 0;min-height:56px;font-size:18px;margin:0}'+
'.gma-row .btn[disabled]{opacity:.45}';document.head.appendChild(st);})();
})();
