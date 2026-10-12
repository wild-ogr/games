'use strict';
/* gb-MGB мини-игра №9 «Накладная» (ведёт Ревизор — родной босс Гастронома, drawPerson 'revizor'). 05-minigames.md §3 №9, основа — zmg-opechatki Зины (нажми на неверное).
   Завоз: накладная из 6 строк («Сгущёнка — 8 шт.»), рядом с каждой — ящик, в нём товар нарисован рядами по 5 (drawGood). В 3 строках не сходится:
   в ящике меньше на 1–3 (недостача) или лежит другой товар (пересортица). Нажми на строку — «не сходится». Верная строка — промах: Ревизор
   отмечает «сходится» (больше не нажимается). Без таймера. Ступени: промахов 0 — 3★, 1–2 — 2★, больше — 1★. Счёт = 60 − 8×промах (не меньше 10).
   Где встаёт (решает оболочка MG0): «Перерыв» после Ревизии города (11, 21, …) — раз в город, по желанию; тренировка в «Подсобке».
   ПК: 1–6 — строка. Тексты — js/gmg-nakladnaya-data.js. Классы — gmb-n*. Договор — шапка js/gmg-core.js. Выключение — GB.flag('mg_nakladnaya'). */
(function(){
if(typeof GMG_REG!=='function')return;
const ROWS=6,BAD=3;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const D=()=>window.GMG_NAKLADNAYA||{};
const fm=(s,m)=>String(s||'').replace(/\{(\w+)\}/g,(x,k)=>m[k]!=null?m[k]:x);
const pk=(a,i)=>a&&a.length?a[i%a.length]:'';
function mix(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
// пары для пересортицы — похожие на вид
const SWAP={1:[18,22],2:[3],3:[2],4:[22,1],5:[6],6:[5],7:[18],8:[17],17:[8],9:[19],10:[19],11:[6],13:[14],14:[13,21],15:[13],18:[7],19:[10],21:[14],22:[4]};   // без ирисок, яиц, пряников — их рисунок из нескольких штук, считать путано
const gnm=t=>{try{return GOODS[t].n;}catch(e){return '';}};
function make(rnd){const types=mix(Object.keys(SWAP).map(Number),rnd).slice(0,ROWS),bad=mix([0,1,2,3,4,5],rnd).slice(0,BAD);let sw=rnd()<.6?1:0;
  return types.map((t,i)=>{const n=3+Math.floor(rnd()*8);const r={t,n,ct:t,cn:n,bad:false};
    if(bad.indexOf(i)>=0){r.bad=true;if(sw&&SWAP[t]){sw=0;const s=SWAP[t];r.ct=s[Math.floor(rnd()*s.length)];}else r.cn=Math.max(1,n-1-Math.floor(rnd()*Math.min(3,n-1)));}
    return r;});}
const unitOf=(d,t,n)=>{const u=(d.units||{})[t];if(!u)return d.unit||'';const a=n%10,b=n%100;return a===1&&b!==11?u[0]:a>=2&&a<=4&&(b<12||b>14)?u[1]:u[2];};
const tierOf=m=>m<=0?3:m<=2?2:1;
GMG_REG({id:'nakladnaya',who:'revizor',finWho:'revizor',deps:['js/gmg-nakladnaya-data.js'],make,
  open:()=>typeof drawGood==='function',
  lines:{good:()=>(D().lines||{}).good,ok:()=>(D().lines||{}).ok,bad:()=>(D().lines||{}).bad},
  sim(o,k){let m=0;for(let i=0;i<BAD;i++){while(o.rnd()>.5+.48*k)m++;}return {sc:Math.max(10,60-8*m),st:tierOf(m)};},
  run(host,o){const d=D(),L=make(o.rnd);let miss=0,found=0,over=false,started=false,okN=0,msN=0;
    host.el.innerHTML='<div class="gmb-n"><div class="gmb-ns"></div><div class="gmb-np"><div class="gmb-nh"><b>'+esc(fm(d.head,{n:100+Math.floor(o.rnd()*900)}))+'</b><small>'+esc(fm(d.from,{b:1+Math.floor(o.rnd()*40)}))+'</small></div>'+
      L.map((r,i)=>'<button type="button" class="gmb-nr" data-i="'+i+'"><canvas></canvas><span class="gmb-nt">'+(host.pc?'<kbd class="gmg-kc">'+(i+1)+'</kbd> ':'')+esc(fm(d.row,{g:gnm(r.t),n:r.n,u:unitOf(d,r.t,r.n)}))+'</span><span class="gmb-nm"></span></button>').join('')+
      '<div class="gmb-nsig">'+esc(pk(d.foot,o.seed|0)||'Принял: ____________')+'</div></div></div>';
    const $=s=>host.el.querySelector(s),say=$('.gmb-ns'),rows=[].slice.call(host.el.querySelectorAll('.gmb-nr'));
    const S1=(t,m)=>{say.innerHTML=host.say('revizor',t,m||'norm');};
    function crate(i){const r=L[i],c=rows[i].querySelector('canvas'),sm=host.h<=520||host.w<=360,w=sm?100:118,h=sm?44:50,q=sm?.85:1,dp=host.dpr;c.width=w*dp;c.height=h*dp;c.style.width=w+'px';c.style.height=h+'px';
      const g=c.getContext('2d');g.setTransform(dp,0,0,dp,0,0);g.fillStyle='#c79a5e';g.fillRect(0,0,w,h);g.fillStyle='#a77b44';g.fillRect(0,0,w,3);g.fillRect(0,h-3,w,3);g.fillRect(0,0,3,h);g.fillRect(w-3,0,3,h);
      g.fillStyle='rgba(0,0,0,.08)';g.fillRect(3,h/2-1,w-6,2);
      for(let k=0;k<r.cn;k++){const col=k%5,row=Math.floor(k/5);try{drawGood(g,r.ct,(13+col*23)*q,(22+row*23)*q,32*q);}catch(e){}}}
    rows.forEach((b,i)=>{crate(i);b.onclick=()=>tap(i);});
    function tap(i){if(over||!started)return;const r=L[i],b=rows[i];if(b.classList.contains('ok')||b.classList.contains('bad'))return;
      if(r.bad){b.classList.add('bad');b.querySelector('.gmb-nm').textContent='✗ '+(d.badMark||'');found++;host.top(fm(d.top,{n:found}));try{host.snd.coin&&host.snd.coin();}catch(e){}
        if(found>=BAD){over=true;S1('<b>'+esc(d.done||'')+'</b>','happy');try{host.snd.happy&&host.snd.happy();}catch(e){}
          rows.forEach(x=>{if(!x.classList.contains('bad'))x.classList.add('ok');});
          setTimeout(()=>host.finish({sc:Math.max(10,60-8*miss),st:tierOf(miss),h:miss,label:fm(d.label,{m:miss})}),host.calm?1800:1300);}
        else S1(esc(pk(d.ok,okN++)),'happy');return;}
      miss++;b.classList.add('ok','shake');b.querySelector('.gmb-nm').textContent='✓ '+(d.okMark||'');setTimeout(()=>b.classList.remove('shake'),500);
      try{host.snd.back&&host.snd.back();}catch(e){}S1(esc(pk(d.miss,msN++)),'sad');}
    host.keys(k=>{if(/^[1-6]$/.test(k)){tap(+k-1);return true;}return false;});
    host.bot=k=>{if(over||!started)return;const left=L.map((r,i)=>i).filter(i=>!rows[i].classList.contains('ok')&&!rows[i].classList.contains('bad'));
      const bad=left.filter(i=>L[i].bad),good=left.filter(i=>!L[i].bad);if(!bad.length)return;
      tap(Math.random()<.5+.48*k||!good.length?bad[0]:good[Math.floor(Math.random()*good.length)]);};
    host.top(fm(d.top,{n:0}));
    host.intro({who:'revizor',text:esc(d.intro||'').replace(/&lt;(\/?b)&gt;/g,'<$1>'),btn:'Сверить!',hint:esc(d.hint||'')}).then(()=>{started=true;S1(esc(pk(d.start,o.seed|0)));});}});
(function(){if(document.getElementById('gmb-n-css'))return;const st=document.createElement('style');st.id='gmb-n-css';st.textContent=
'.gmb-n{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;overflow-y:auto;padding-bottom:8px}'+
'.gmb-ns{flex:0 0 auto;margin:8px auto 0;width:calc(100% - 20px);max-width:560px;min-height:56px}.gmb-ns .gmg-say{margin:0}.gmb-ns .gmg-av{width:46px;height:46px}.gmb-ns .gmg-sb{font-size:16px;padding:7px 11px}'+
'.gmb-np{margin:8px auto 0;width:calc(100% - 20px);max-width:560px;background:#fffef6;border-radius:4px;box-shadow:0 3px 10px rgba(60,40,20,.18);padding:8px 8px 6px;box-sizing:border-box;'+
'}'+
'.gmb-nh{display:flex;justify-content:space-between;align-items:baseline;gap:6px;flex-wrap:wrap;border-bottom:2px solid #3b2a1a;padding:0 2px 4px;margin-bottom:4px}.gmb-nh b{font-size:17px;letter-spacing:1px}.gmb-nh small{font-size:13px;color:#6b5a48}'+
'.gmb-nr{display:flex;align-items:center;gap:8px;width:100%;min-height:58px;border:0;border-bottom:1px dashed #d9c8a8;background:transparent;padding:3px 2px;text-align:left;cursor:pointer;color:var(--ink,#3b2a1a);font:inherit}'+
'.gmb-nr canvas{flex:0 0 auto;border-radius:3px}.gmb-nt{flex:1 1 auto;min-width:0;font:700 17px/1.2 "Courier New",monospace}.gmb-nm{flex:0 0 auto;font-size:13px;font-weight:800;max-width:90px;text-align:right}'+
'.gmb-nr:hover{background:rgba(160,103,58,.07)}.gmb-nr.bad{background:rgba(226,70,59,.10)}.gmb-nr.bad .gmb-nt{color:#c62828;text-decoration:line-through;text-decoration-color:#e2463b}.gmb-nr.bad .gmb-nm{color:#c62828}'+
'.gmb-nr.ok{opacity:.7}.gmb-nr.ok .gmb-nm{color:#2f8f4e}.gmb-nr.shake{animation:gmbArg .45s}@keyframes gmbArg{0%,100%{transform:none}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'+
'.gmb-nsig{text-align:right;font:italic 15px/1.6 "Courier New",monospace;color:#6b5a48;margin-top:4px}'+
'body.calm .gmb-nr.shake{animation:none}'+
'@media (max-width:360px){.gmb-nt{font-size:15px}.gmb-nm{max-width:64px;font-size:12px}}@media (max-height:620px){.gmb-ns{min-height:48px;margin-top:4px}.gmb-ns .gmg-sb{font-size:15px}.gmb-nr{min-height:56px;padding:1px 2px}.gmb-nh{margin-bottom:0}.gmb-nsig{display:none}}';
document.head.appendChild(st);})();
})();
