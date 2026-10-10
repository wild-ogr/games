'use strict';
/* zb-MGA мини-игра №14 «Пары: слово и толкование» (Валентина Петровна, бывший завуч). 6 слов из пройденных уровней (host.words({def:true})) и 6 толкований (gloss):
   нажми слово, потом его толкование (или наоборот). Пара — карточки гаснут зелёным; не пара — встряхнутся, ошибка считается, но не наказывает. Ходы без ограничения.
   Звёзды по ошибкам: 0–1 — 3★, 2–3 — 2★, 4–6 — 1★. ПК: 1–6 — слово, затем 1–6 — толкование; Esc — оболочка.
   Карточки открыты (не «мемори»): толкования длинные — читать их на рубашках было бы мукой. Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const P=6;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const tierOf=m=>m<=1?3:m<=3?2:m<=6?1:0;
const glossOf=w=>{try{return typeof GLOSS!=='undefined'&&GLOSS[w]?GLOSS[w]:'';}catch(e){return '';}};
const cap=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t;
function pick(host,o){const mem=host.mem(),last=String(mem.r||'').split(',');
  let L=host.words({min:3,max:8}).filter(w=>{const g=glossOf(w);return g&&g.length<=86&&g.toLowerCase().indexOf(w.slice(0,Math.max(3,w.length-2)))<0;});
  const fresh=L.filter(w=>last.indexOf(w)<0);if(fresh.length>=P)L=fresh;
  const out=[],gs={};for(const w of L){const g=glossOf(w);if(gs[g])continue;gs[g]=1;out.push(w);if(out.length>=P)break;}
  try{mem.r=last.concat(out).filter(Boolean).slice(-36).join(',');}catch(e){}
  return out;}
const SAY={got:['Верно! Садись, пять.','Правильно, голубчик.','Так и запишем.','Точно!','Вот это по-нашему.'],miss:['Не то. Подумай ещё — время есть.','Неверно, но не беда.','Ну-ну… перечитай толкование.']};
ZMG_REG({id:'pary',finWho:'vp',
  open:()=>typeof GLOSS!=='undefined',
  lines:{good:'Все пары без ошибок — вот это память! Пятёрка в журнал.',ok:'Хорошо! Пару раз ошиблись — с кем не бывает.',bad:'Толкования хитрые. Ничего, повторение — мать учения.'},
  sim(o,k){let m=0;for(let i=0;i<P;i++){while(o.rnd()>.45+.5*k&&m<20)m++;}return {sc:Math.max(0,P*2-m),st:tierOf(m)};},
  run(host,o){const W=pick(host,o);if(W.length<P){host.quit();return;}
    const G=W.map((w,i)=>i);for(let i=G.length-1;i>0;i--){const j=Math.floor(o.rnd()*(i+1));const t=G[i];G[i]=G[j];G[j]=t;}
    let selW=-1,selG=-1,miss=0,got=0,fin=false,t0=0;const done={};const fest=host.fest&&host.fest.id;
    host.el.innerHTML='<div class="zma-wrap'+(fest?' zma-'+esc(fest):'')+'"><div class="zma-pr-say"></div><div class="zma-pr-ws">'+
      W.map((w,i)=>'<button class="zma-pr-w" data-i="'+i+'">'+(host.pc?host.kc(i+1):'')+'<span>'+esc(w.toUpperCase())+'</span></button>').join('')+'</div>'+
      '<div class="zma-pr-gs">'+G.map((wi,k)=>'<button class="zma-pr-g" data-w="'+wi+'" data-k="'+k+'">'+(host.pc?host.kc(k+1):'')+'<span>'+esc(cap(glossOf(W[wi])))+'</span></button>').join('')+'</div></div>';
    const $$=s=>[].slice.call(host.el.querySelectorAll(s)),ws=$$('.zma-pr-w'),gs=$$('.zma-pr-g'),say=host.el.querySelector('.zma-pr-say');
    function line(t,m){say.innerHTML=host.say('vp',t,m||'norm');}
    function top(){host.top(got+' из '+P+' пар');}
    function mark(){ws.forEach((b,i)=>b.classList.toggle('sel',i===selW));gs.forEach((b,k)=>b.classList.toggle('sel',k===selG));}
    function tryPair(){if(selW<0||selG<0)return;const wi=selW,gk=selG,ok=G[gk]===wi;selW=selG=-1;
      if(ok){done[wi]=1;got++;ws[wi].classList.add('got');gs[gk].classList.add('got');ws[wi].disabled=gs[gk].disabled=true;const gb=gs[gk];setTimeout(()=>{gb.classList.add('gone');},700);
        try{host.snd.word&&host.snd.word(W[wi].length,got);}catch(e){}line(esc(SAY.got[got%SAY.got.length]),'happy');
        if(got>=P){top();mark();setTimeout(end,600);return;}}
      else{miss++;[ws[wi],gs[gk]].forEach(b=>{b.classList.remove('shk');void b.offsetWidth;b.classList.add('shk');});
        try{host.snd.bad&&host.snd.bad();}catch(e){}line(esc(SAY.miss[miss%SAY.miss.length]),'sad');}
      mark();top();}
    function tapW(i){if(fin||done[i])return;try{host.snd.tap();}catch(e){}selW=selW===i?-1:i;mark();tryPair();}
    function tapG(k){if(fin||done[G[k]])return;try{host.snd.tap();}catch(e){}selG=selG===k?-1:k;mark();tryPair();}
    ws.forEach((b,i)=>b.onclick=()=>tapW(i));gs.forEach((b,k)=>b.onclick=()=>tapG(k));
    function end(){if(fin)return;fin=true;host.finish({sc:Math.max(0,P*2-miss),st:tierOf(miss),h:miss,label:miss?miss+' '+(typeof plural==='function'?plural(miss,'ошибка','ошибки','ошибок'):'ошибок'):'без ошибок!'});}
    host.keys(k=>{const n=+k;if(!(n>=1&&n<=P))return false;if(selW<0&&selG<0){if(!done[n-1]){tapW(n-1);return true;}return true;}
      if(selW>=0){tapG(n-1);return true;}tapW(n-1);return true;});
    host.bot=k=>{if(fin)return;const left=W.map((w,i)=>i).filter(i=>!done[i]);if(!left.length)return;const wi=left[0];
      if(selW<0){tapW(wi);return;}const right=G.indexOf(selW);let gk=right;if(Math.random()>k){const o2=G.map((x,j)=>j).filter(j=>j!==right&&!done[G[j]]);if(o2.length)gk=o2[0];}tapG(gk);};
    top();line('Слово — к его толкованию. <b>Нажми слово, потом толкование.</b>'+(host.pc?' На компьютере — цифрами.':''));
    host.intro({who:'vp',text:'Я тридцать лет завучем — и всё помню! А вы? <b>Соедините каждое слово с его толкованием.</b>',
      btn:'К доске',hint:'6 пар · ~45 секунд · ходы без ограничения'}).then(()=>{t0=Date.now();});}});
(function(){if(document.getElementById('zma-pr-css'))return;const st=document.createElement('style');st.id='zma-pr-css';st.textContent=
'.zma-pr-say,.zma-pr-ws,.zma-pr-gs{margin:0 auto;width:calc(100% - 24px);max-width:560px}'+
'.zma-pr-say .zmg-sb{font-size:16.5px}.zma-pr-say .zmg-av{width:50px;height:50px}'+
'.zma-pr-ws{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px}'+
'.zma-pr-w,.zma-pr-g{position:relative;border:0;font:inherit;cursor:pointer;background:#fff;color:var(--ink,#27324a);box-shadow:0 4px 0 var(--edge,#d5d9e3);border-radius:14px;transition:background .15s,opacity .3s}'+
'.zma-pr-w{min-height:52px;padding:6px 4px;font-weight:900;font-size:17px;letter-spacing:.5px;word-break:break-word}'+
'.zma-pr-gs{display:flex;flex-direction:column;gap:8px}'+
'.zma-pr-g{min-height:52px;padding:8px 12px 8px 14px;text-align:left;font-size:17px;line-height:1.28}'+
'.zma-pr-w .zmg-kc,.zma-pr-g .zmg-kc{position:absolute;left:4px;top:4px}.zma-pr-g .zmg-kc{position:static;margin-right:6px}'+
'.zma-pr-w.sel,.zma-pr-g.sel{background:var(--blue3,#dbe7fb);box-shadow:0 4px 0 var(--blue,#1d4fa3)}'+
'.zma-pr-w.got,.zma-pr-g.got{background:#e3f7e8;color:var(--green2,#237a3b);box-shadow:0 2px 0 var(--green,#34a853);opacity:.55;cursor:default}'+
'.zma-pr-w.shk,.zma-pr-g.shk{animation:zmaShk .35s;background:#fde6e4}'+
'@keyframes zmaShk{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'+
'@media (prefers-reduced-motion:reduce){.zma-pr-w.shk,.zma-pr-g.shk{animation:none}}'+
'@media (max-width:370px){.zma-pr-w{font-size:15px}.zma-pr-g{font-size:16px;padding:6px 10px}}'+
'.zma-pr-g.gone{display:none}'+
'@media (max-height:700px){.zma-pr-g{min-height:48px;font-size:16px;padding:5px 10px}.zma-pr-say{display:none}}';
document.head.appendChild(st);})();
// общие стили игр MGA (одинаковые в каждом файле — грузится любая первой)
(function(){if(document.getElementById('zma-css'))return;const st=document.createElement('style');st.id='zma-css';st.textContent=
'.zma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:8px 0 10px;min-height:0;overflow-y:auto}'+
'.zma-kr{flex:1 1 auto;min-height:250px;display:flex;align-items:center;justify-content:center}'+
'.zma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 24px);max-width:480px}.zma-row .btn{flex:1 1 0;min-height:50px;font-size:17px;margin:0}'+
'@media (max-height:620px){.zma-kr{min-height:210px}}';document.head.appendChild(st);})();
})();
