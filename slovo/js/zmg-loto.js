'use strict';
/* zb-MGC мини-игра №12 «Лото во дворе» (ведущий — дед Митяй). Затея дня по воскресеньям, «как раньше во дворе».
   Карточка 3×3 со словами. Митяй тянет бочонок и «кричит» его загадкой-толкованием: слово есть на карточке — закрой его, нет — «Нет у меня».
   Закрыл ряд — «Квартира!»; закрыл всю карточку — конец. Ошибка не наказывает: бочонок ждёт, Митяй подсказывает. ~1,5–2 мин.
   Вторая карточка — ролик «по нужде» (host.adNeed('card2'), один за заход) — на вступлении.
   Загадки: js/zmg-loto-data.js (ZMG_LOTO из content/texts/loto.json от TEXT), пока его нет — толкования gloss слов пройденных уровней (host.words({def:true})).
   ПК: 1–9 — клетка карточки (вторая — Shift+1–9 или стрелки), 0 / Пробел / Н — «Нет у меня». Выключение — ZMG_OFF или LT_ON=false. Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const LT_ON=true;
if(!LT_ON)return;
const DECOY=5;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const cap=t=>{t=String(t||'');return t.charAt(0).toUpperCase()+t.slice(1);};
// лотошные прозвища бочонков (как во дворе)
const NICK={1:'кол',7:'кочерга',8:'бублик',11:'барабанные палочки',13:'чёртова дюжина',22:'гуси-лебеди',25:'опять двадцать пять',33:'кудри',44:'стульчики',
  48:'половинку просим',50:'полсотни',55:'перчатки',66:'валенки',69:'туда-сюда',77:'топорики',80:'бабушка',88:'крендельки',89:'дедушкин сосед',90:'дедушка'};
const OKS=['Есть такой! Закрывай.','Точно! Глаз — алмаз.','Во! Как я в шестьдесят восьмом.','Верно! Бочонок твой.'];
const NOS=['Не, это не оно. Слушай загадку ещё раз.','Мимо! Читай карточку внимательней — я подожду.','Хе-хе, не то. Бочонок ещё у меня в руке.'];
const HAVE=['А ты глянь получше — есть оно у тебя!','Нет, говоришь? А я вижу… Ищи!'];
const NONE=['Правильно, нету. Дальше!','Нету — и ладно. Следующий!','Не у тебя, так у Семёна.'];
// загадки: из данных TEXT или из толкований; толкование не должно выдавать слово
function stemIn(w,d){const s=w.slice(0,Math.max(3,Math.min(5,w.length-2)));return String(d).toLowerCase().replace(/ё/g,'е').indexOf(s)>=0;}
function pool(host,o){const T=window.ZMG_LOTO&&window.ZMG_LOTO.items;let out=[];
  if(T&&T.length>=14){out=T.map(x=>({w:String(x.a),c:Array.isArray(x.c)?x.c[Math.floor(o.rnd()*x.c.length)]:String(x.c),m:x.m||''})).filter(x=>x.w.length>=3&&x.w.length<=8);
    for(let i=out.length-1;i>0;i--){const j=Math.floor(o.rnd()*(i+1));const t=out[i];out[i]=out[j];out[j]=t;}}
  if(out.length<14){const L=host.words({min:3,max:7,def:true})||[];const have=new Set(out.map(x=>x.w));
    for(const w of L){if(have.has(w))continue;const d=host.def(w);if(!d||stemIn(w,d))continue;out.push({w,c:d,m:''});if(out.length>=40)break;}}
  return out;}
// прозвище бочонка: из данных TEXT (nums), иначе своё
function nick(n){const D=window.ZMG_LOTO&&window.ZMG_LOTO.nums;const t=D&&D[n];return t?String(t).replace(/[!.]+$/,''):NICK[n]||'';}
// реплики итога Митяя — hosts.json (TEXT)
function hl(k,d){const H=window.ZMG_LOTO&&window.ZMG_LOTO.host,a=H&&H[k];return a&&a.length?a[Math.floor(Math.random()*a.length)]:d;}
const tierOf=m=>m<=0?3:m<=2?2:m<=4?1:0;
ZMG_REG({id:'loto',finWho:'mityai',deps:['js/zmg-loto-data.js'],
  open:()=>true,
  lines:{get good(){return hl('st3','Ни одной ошибки! Да ты бы у нас во дворе всех обыграл — даже Семёна.');},
    get ok(){return hl('st1','Хорошо сыграли! Пару раз промахнулся — так и я в шестьдесят восьмом промахивался.');},
    get bad(){return hl('st0','Ничего! В лото главное не выиграть, а посидеть. В воскресенье — снова во двор.');}},
  sim(o,k){let m=0;for(let i=0;i<9+DECOY;i++)if(o.rnd()>.6+.4*k)m++;return {sc:Math.max(0,100-10*m),st:tierOf(m)};},
  run(host,o){
    // данные — после вступления (если вторая карточка — 18 слов)
    function setup(two){const P=pool(host,o);const need=9*(two?2:1)+DECOY;if(P.length<need){host.quit();return null;}
      const cards=[P.slice(0,9)].concat(two?[P.slice(9,18)]:[]),dec=P.slice(9*(two?2:1),need);
      const calls=cards.reduce((a,c)=>a.concat(c),[]).concat(dec);for(let i=calls.length-1;i>0;i--){const j=Math.floor(o.rnd()*(i+1));const t=calls[i];calls[i]=calls[j];calls[j]=t;}
      // номера бочонков 1–90 без повторов
      const nums=[];while(nums.length<calls.length){const n=1+Math.floor(o.rnd()*90);if(nums.indexOf(n)<0)nums.push(n);}
      calls.forEach((c,i)=>c.n=nums[i]);return {cards,calls};}
    let G=null,ci=0,miss=0,cov=0,rows=0,lock=false,okN=0,noN=0,hvN=0,nnN=0,timer=0;
    const fest=host.fest&&host.fest.id;
    function build(){const two=G.cards.length>1;
      host.el.innerHTML='<div class="zmc-lt'+(two?' two':'')+(fest?' zmc-f-'+esc(fest):'')+'"><div class="zmc-lt-call"><span class="zmc-lt-av">'+host.face('mityai','happy')+'</span>'+
        '<div class="zmc-lt-bub"><span class="zmc-lt-bar"><b></b></span><p class="zmc-lt-q"></p><p class="zmc-lt-m"></p></div></div>'+
        '<div class="zmc-lt-cards">'+G.cards.map((c,k)=>'<div class="zmc-lt-card" data-k="'+k+'">'+c.map((x,i)=>'<button class="zmc-lt-c" data-k="'+k+'" data-i="'+i+'"><span>'+esc(x.w.toUpperCase())+'</span>'+
          (host.pc&&k===0?'<kbd class="zmc-lt-kn">'+(i+1)+'</kbd>':'')+'</button>').join('')+'</div>').join('')+'</div>'+
        '<div class="zmc-lt-bt"><button class="btn sec zmc-lt-no">Нет у меня'+(host.pc?' '+host.kc('0'):'')+'</button></div><div class="zmc-lt-kv" aria-live="polite"></div></div>';
      host.el.querySelectorAll('.zmc-lt-c').forEach(b=>b.onclick=()=>tap(+b.dataset.k,+b.dataset.i));
      host.el.querySelector('.zmc-lt-no').onclick=()=>none();}
    const $=s=>host.el.querySelector(s);
    function cur(){return G.calls[ci];}
    function where(c){for(let k=0;k<G.cards.length;k++){const i=G.cards[k].indexOf(c);if(i>=0)return [k,i];}return null;}
    function show(){const c=cur();lock=false;$('.zmc-lt-bar b').textContent=c.n;const nk=nick(c.n);
      $('.zmc-lt-q').innerHTML='<i>'+(nk?esc(nk)+' — '+c.n:'Бочонок '+c.n)+'!</i> '+esc(cap(c.c))+(/[.!?…]$/.test(c.c)?'':'.');
      $('.zmc-lt-m').textContent='';const bub=$('.zmc-lt-bub');bub.classList.remove('roll');void bub.offsetWidth;bub.classList.add('roll');
      host.top((ci+1)+' из '+G.calls.length);try{host.snd.tap();}catch(e){}}
    function mth(t){$('.zmc-lt-m').textContent=t;}
    function tap(k,i){if(lock||!G)return;const c=cur(),x=G.cards[k]&&G.cards[k][i];if(!x)return;const b=host.el.querySelector('.zmc-lt-c[data-k="'+k+'"][data-i="'+i+'"]');
      if(b.classList.contains('on'))return;
      if(x===c){lock=true;b.classList.add('on');b.insertAdjacentHTML('beforeend','<i class="zmc-lt-tok">'+c.n+'</i>');cov++;mth(OKS[okN++%OKS.length]);
        try{host.snd.word&&host.snd.word(4,cov);}catch(e){}
        const r=Math.floor(i/3),row=[0,1,2].every(j=>host.el.querySelector('.zmc-lt-c[data-k="'+k+'"][data-i="'+(r*3+j)+'"]').classList.contains('on'));
        if(row){rows++;kv('Квартира!');}
        timer=setTimeout(next,host.calm?1100:750);}
      else{miss++;b.classList.remove('no');void b.offsetWidth;b.classList.add('no');mth(NOS[noN++%NOS.length]);try{host.snd.bad();}catch(e){}}}
    function none(){if(lock||!G)return;const c=cur();
      if(where(c)){miss++;mth(HAVE[hvN++%HAVE.length]);try{host.snd.bad();}catch(e){}return;}
      lock=true;mth(NONE[nnN++%NONE.length]);timer=setTimeout(next,host.calm?900:550);}
    function kv(t){const e=$('.zmc-lt-kv');e.textContent='🏠 '+t;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');try{host.snd.bonus&&host.snd.bonus();}catch(x){}}
    function next(){timer=0;const total=G.cards.length*9;
      if(cov>=total){lock=true;kv(G.cards.length>1?'Обе карточки закрыты!':'Вся карточка!');setTimeout(end,host.calm?1400:1000);return;}
      ci++;while(ci<G.calls.length&&G.calls[ci].done)ci++;if(ci>=G.calls.length){end();return;}show();}
    function end(){const two=G.cards.length>1;host.finish({sc:Math.max(0,(two?150:100)-10*miss),st:tierOf(miss),h:miss,
      label:(two?'Обе карточки':'Карточка')+' закрыта · бочонков: '+(ci+1)+(miss?' · промахов: '+miss:' · без промахов')});}
    host.keys((k,e)=>{if(!G)return false;if(k==='0'||k===' '||k==='н'||k==='Н'||k==='n'||k==='N'){none();return true;}
      if(/^[1-9]$/.test(k)){tap(e&&e.shiftKey&&G.cards.length>1?1:0,+k-1);return true;}
      const m=e&&e.code&&/^Digit([1-9])$/.exec(e.code);if(m&&e.shiftKey&&G.cards.length>1){tap(1,+m[1]-1);return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);});
    // бот стенда: k — доля верных действий
    host.bot=k=>{if(!G||lock)return;const c=cur(),w=where(c);const ok=Math.random()<k;
      if(w){if(ok)tap(w[0],w[1]);else none();}else{if(ok)none();else{const k2=0,i=Math.floor(Math.random()*9);if(!host.el.querySelector('.zmc-lt-c[data-k="0"][data-i="'+i+'"]').classList.contains('on'))tap(k2,i);else none();}}};
    const adOk=host.adOk&&host.adOk();
    host.intro({who:'mityai',text:'Ну что, во двор, в лото? Я тяну бочонки и <b>кричу загадку</b> — есть такое слово у тебя на карточке, закрывай. Нету — так и говори: «Нет у меня». Закрыл ряд — кричи «Квартира!»',
      btn:'Садимся играть',hint:'карточка 3×3 · ~1,5 минуты · промахи не страшны',
      html:adOk?'<p class="zmc-lt-ad2"><a href="#" class="zbad zmg-ad zmc-lt-adb" role="button">🎬 Две карточки — за рекламу</a></p>':''}).then(()=>{if(!G){G=setup(false);if(!G)return;build();show();}});
    if(adOk)setTimeout(()=>{const a=host.el.querySelector('.zmc-lt-adb');if(!a)return;a.onclick=ev=>{ev.preventDefault();ev.stopPropagation();if(a.dataset.busy)return;a.dataset.busy='1';
      host.adNeed('card2').then(ok=>{if(!ok){a.textContent='Ролик не пришёл — играем одной карточкой';return;}
        G=setup(true);if(!G)return;const it=host.el.querySelector('.zmg-intro .btn.green');if(it)it.click();build();show();});};},0);}});
(function(){if(document.getElementById('zmc-lt-css'))return;const st=document.createElement('style');st.id='zmc-lt-css';st.textContent=
'.zmc-lt{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;padding:8px 10px 10px;gap:8px;overflow-y:auto}'+
'.zmc-lt-call{display:flex;gap:8px;align-items:flex-start;width:100%;max-width:470px}'+
'.zmc-lt-av{flex:0 0 auto;width:58px;height:58px;border-radius:50%;overflow:hidden;background:#e8f0f8;box-shadow:0 2px 0 var(--edge,#d5d9e3)}.zmc-lt-av svg{width:100%;height:100%;display:block}'+
'.zmc-lt-bub{flex:1 1 auto;position:relative;background:#fff;border-radius:16px;padding:10px 12px 8px 62px;min-height:92px;box-shadow:var(--shadow)}'+
'.zmc-lt-bar{position:absolute;left:8px;top:12px;width:46px;height:56px;border-radius:40%/30%;background:linear-gradient(90deg,#b8742f,#e3a35c 45%,#b8742f);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 #8a5522}'+
'.zmc-lt-bar b{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#fff6e5;color:#b0281e;font:900 18px/1 var(--font,Arial)}'+
'.zmc-lt-bub.roll .zmc-lt-bar{animation:zmcRoll .45s}'+
'.zmc-lt-q{margin:0;font-size:18px;line-height:1.35;color:var(--ink,#27324a)}.zmc-lt-q i{font-style:normal;font-weight:800;color:#b0281e}'+
'.zmc-lt-m{margin:4px 0 0;min-height:20px;font-size:15px;color:#2f6b3a;font-weight:700}'+
'.zmc-lt-cards{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;width:100%}'+
'.zmc-lt-card{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;background:#fde3a7;border:3px solid #c98b2c;border-radius:12px;padding:6px;width:100%;max-width:420px;box-sizing:border-box}'+
'.zmc-lt-c{position:relative;min-height:58px;border:0;border-radius:8px;background:#fffaf0;color:#3a2f25;font:800 17px/1.1 var(--font,Arial);padding:4px 2px;cursor:pointer;box-shadow:0 2px 0 #e4c88f;overflow:hidden;word-break:break-word}'+
'.zmc-lt-c.on{background:#f1e2c0;color:#a08a6a}.zmc-lt-c.on span{text-decoration:line-through;text-decoration-color:#c98b2c}.zmc-lt-c.no{animation:zmgShake .35s;background:#fde3e1}'+
'.zmc-lt-tok{position:absolute;right:3px;bottom:3px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffd88a,#d08a2a);color:#7a1f14;font:900 14px/30px var(--font,Arial);font-style:normal;box-shadow:0 2px 3px rgba(0,0,0,.25);animation:zmcPop .3s}'+
'.zmc-lt-kn{position:absolute;right:3px;top:2px;font-size:11px;color:#a08a6a;font-family:inherit}'+
'.zmc-lt-bt .btn{min-height:52px;font-size:18px;padding:0 26px}'+
'.zmc-lt-kv{min-height:30px;font:900 24px/1.2 var(--font,Arial);color:#b0281e;opacity:0}.zmc-lt-kv.on{animation:zmcKv 1.6s}'+
'.zmc-lt-ad2{text-align:center;margin:6px 0 0}.zmc-lt-adb{font-weight:800;color:var(--blue,#1d4fa3)}'+
'.zmc-lt.two .zmc-lt-card{max-width:360px}.zmc-lt.two .zmc-lt-c{min-height:48px;font-size:16px}'+
'@media (min-width:760px){.zmc-lt.two .zmc-lt-cards{flex-wrap:nowrap}.zmc-lt.two .zmc-lt-card{width:48%}}'+
'.zmc-f-halloween .zmc-lt-card{background:#3a2a4f;border-color:#e07a1f}.zmc-f-halloween .zmc-lt-c{background:#fff3e2}'+
'@keyframes zmcRoll{0%{transform:translateY(-30px) rotate(-90deg);opacity:0}100%{transform:none;opacity:1}}'+
'@keyframes zmcKv{0%{opacity:0;transform:scale(.6)}20%{opacity:1;transform:scale(1.15)}80%{opacity:1;transform:none}100%{opacity:0}}'+
'@keyframes zmcPop{0%{transform:scale(.6)}70%{transform:scale(1.15)}100%{transform:none}}'+
'@media (min-height:740px){.zmc-lt-c{min-height:76px;font-size:19px}.zmc-lt{gap:14px;padding-top:14px}}'+
'@media (max-height:640px){.zmc-lt{gap:5px}.zmc-lt-q{font-size:16px}.zmc-lt-bub{min-height:76px}.zmc-lt-c{min-height:50px;font-size:16px}.zmc-lt-av{width:44px;height:44px}}'+
'@media (prefers-reduced-motion:reduce){.zmc-lt-bub.roll .zmc-lt-bar,.zmc-lt-tok{animation:none}}';
document.head.appendChild(st);})();
})();
