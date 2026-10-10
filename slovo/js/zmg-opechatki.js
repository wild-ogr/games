'use strict';
/* zb-MGB мини-игра №9 «Кот Ять наследил». Объявление у подъезда («Завтра отключат ВАДУ») — Ять прошёлся по нему лапами: в каждом 3 опечатки.
   Нажми на неверную букву — красная ручка исправит. Нажал другую букву того же слова — «близко» (не промах): слово открывается крупно (лупа).
   Нажал букву верного слова — промах; промахи влияют только на звёзды: 0–1 — 3★, 2–4 — 2★, больше — 1★. После 3 промахов на объявлении Ять подсвечивает слово.
   2 объявления за заход. Данные — js/zmg-opechatki-data.js (ZMG_OPECHATKI.items {id,h,t,s,x:[[поз в верном тексте, длина, номер буквы, неверное, верное]×3]}).
   Затея дня/праздник — раскладка по зерну дня; иначе — свой круг (host.mem().k). ПК: ←/→ — буква, ↑/↓ — слово, Enter — нажать. Классы — zmb-o*. */
(function(){
if(typeof ZMG_REG!=='function')return;
const N=2;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const isL=c=>/[А-Яа-яЁёA-Za-z]/.test(c);
const tierOf=m=>m<=1?3:m<=4?2:1;
function mix(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const YAT_OK=['Мяу! Нашёл. Это я хвостом махнул.','Мур… Это была лапа. Левая.','Фыр! Нашёл всё-таки.','Мяу. Это я спросонья.','Мрр, глазастый какой!'];
const YAT_NEAR=['Мяу? Тепло-тепло! В этом слове. Какая буква?','Мур! Слово то, а буква другая. Гляди крупно.','Фыр… Почти! Ищи в этом слове.'];
const YAT_MISS=['Мяу! Тут всё чисто, сюда я не ступал.','Мрр. Это слово Михалыч писал — без ошибок.','Фыр, мимо! Тут я только понюхал.','Мяу… Не-а. Ищи дальше.'];
const YAT_HELP=['Ладно, подскажу: вот это слово. Я тут топтался.','Мяу, смотри сюда — моя лапа.'];
const YAT_DONE=['Мур-р! Всё исправил. Михалыч не узнает.','Мяу! Объявление как новенькое. Почти.','Фыр! Чисто. Можно опять гулять по бумажкам.'];
function pick(host,o){const D=window.ZMG_OPECHATKI,I=D&&D.items||[];if(!I.length)return [];const m=host.mem(),day=o.mode==='day'||o.mode==='fest';
  const P=mix(I.map((_,i)=>i),(()=>{let s=0x0be7;return ()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x80000000;};})());
  const st=day?Math.floor(o.rnd()*I.length):(m.k|0)%I.length;if(!day)m.k=(st+N)%I.length;
  const out=[];for(let i=0;i<N&&i<I.length;i++)out.push(I[P[(st+i)%I.length]]);return out;}
/* объявление → слова и буквы. Текст показа = верный текст с подменами. */
function parse(it){const t=it.t.split(''),bad=[];
  it.x.forEach((x,k)=>{const p=x[0],w=x[3];for(let j=0;j<w.length;j++)t[p+j]=w[j];bad.push({k,p,len:x[1],i:x[2],at:p+x[2],w:x[3],r:x[4],c:x[4].charAt(x[2]),found:false});});
  const words=[];let cur=null;
  t.forEach((c,i)=>{if(isL(c)||(c==='-'&&cur&&isL(t[i+1]||''))){if(!cur){cur={a:i,b:i,ch:[]};words.push(cur);}cur.b=i;cur.ch.push(i);}else cur=null;});
  words.forEach(w=>{w.bad=bad.filter(b=>b.at>=w.a&&b.at<=w.b)[0]||null;});
  return {t,bad,words};}
ZMG_REG({id:'opechatki',finWho:'yat',deps:['js/zmg-opechatki-data.js'],
  open:()=>true,
  lines:{good:'Мур-р! С таким глазом — в корректоры «Вечерки». А я — в помощники.',ok:'Мяу! Почти всё чисто. Пару раз ты ткнул туда, где я не ходил.',
    bad:'Фыр… Ничего, я и сам эти буквы не все знаю. Завтра натопчу новых.'},
  sim(o,k){let m=0;for(let i=0;i<N*3;i++){while(o.rnd()>.35+.6*k)m+=o.rnd()<.6?0:1;}const st=tierOf(m);return {sc:Math.max(5,60-6*m),st};},
  run(host,o){const L=pick(host,o);if(!L.length){host.quit();return;}
    let ni=0,A=null,miss=0,missN=0,found=0,busy=false,timer=0,cur=-1,okN=0,nrN=0,msN=0,hpN=0,dnN=0,lupa=null;
    host.el.innerHTML='<div class="zmb-o"><div class="zmb-op"><span class="zmb-opt">Найдено: <b>0</b> из '+(L.length*3)+'</span><span class="zmb-opm"></span></div>'+
      '<div class="zmb-ob"></div><div class="zmb-ol"></div><div class="zmb-os"></div>'+
      (host.pc?'<p class="zmg-hint zmb-ok">на компьютере: '+host.kc('←')+host.kc('→')+' — буква, '+host.kc('↑')+host.kc('↓')+' — слово, '+host.kc('Enter')+' — нажать</p>':'')+'</div>';
    const $=s=>host.el.querySelector(s),board=$('.zmb-ob'),lp=$('.zmb-ol'),say=$('.zmb-os'),fv=$('.zmb-opt b'),mv=$('.zmb-opm');
    const S1=(who,t,md)=>{say.innerHTML=host.say(who,t,md);};
    function show(){const it=L[ni];A=parse(it);missN=0;busy=false;cur=-1;lupa=null;lp.innerHTML='';
      let h='<div class="zmb-on"><i class="zmb-otp"></i><div class="zmb-oh">'+esc(it.h)+'</div><div class="zmb-ot">';
      let i=0;const t=A.t;
      while(i<t.length){const w=A.words.filter(x=>x.a===i)[0];
        if(w){h+='<span class="zmb-ow" data-w="'+A.words.indexOf(w)+'">';for(let j=w.a;j<=w.b;j++)h+='<span class="zmb-oL" data-i="'+j+'">'+esc(t[j])+'</span>';h+='</span>';i=w.b+1;}
        else{h+=t[i]===' '?' ':'<span class="zmb-oP">'+esc(t[i])+'</span>';i++;}}
      h+='</div><div class="zmb-os2">'+esc(it.s||'')+'</div><div class="zmb-opaw"></div></div>';
      board.innerHTML=h;host.top('Объявление '+(ni+1)+' из '+L.length);
      S1('yat',ni?'Мяу! А вот ещё одно. Тут я тоже немножко погулял.':'Мур… Я тут прошёлся по объявлению. Совсем чуть-чуть. <b>Найди 3 буквы</b>, где я наследил — нажми на неверную букву.','norm');
      mv.textContent=miss?'промахов: '+miss:'';}
    const span=i=>board.querySelector('.zmb-oL[data-i="'+i+'"]');
    function wordOf(i){return A.words.filter(w=>i>=w.a&&i<=w.b)[0]||null;}
    function fix(b){b.found=true;found++;fv.textContent=found;const s=span(b.at);
      if(s){s.classList.add('fix');s.innerHTML='<s>'+esc(A.t[b.at])+'</s><b class="zmg-red">'+esc(b.c)+'</b>';s.parentNode.classList.add('fixed');s.parentNode.classList.remove('help','near');}
      A.t[b.at]=b.c;try{host.snd.word?host.snd.word(3,0):host.snd.coin();}catch(e){}closeLupa();
      if(A.bad.every(x=>x.found)){busy=true;S1('yat',esc(YAT_DONE[dnN++%YAT_DONE.length]),'happy');board.classList.add('done');
        timer=setTimeout(next,host.calm?2800:1900);}else S1('yat',esc(YAT_OK[okN++%YAT_OK.length]),'happy');}
    function tap(i){if(busy||!A)return;const w=wordOf(i);if(!w)return;
      const b=w.bad;if(b&&b.found&&i===b.at)return;
      if(b&&!b.found&&i===b.at){fix(b);return;}
      if(b&&!b.found){w.near=1;const ws=board.querySelector('.zmb-ow[data-w="'+A.words.indexOf(w)+'"]');if(ws)ws.classList.add('near');
        try{host.snd.tap();}catch(e){}S1('yat',esc(YAT_NEAR[nrN++%YAT_NEAR.length]),'wow');openLupa(w);return;}
      miss++;missN++;mv.textContent='промахов: '+miss;try{host.snd.bad&&host.snd.bad();}catch(e){}
      const s=span(i);if(s){s.classList.remove('miss');void s.offsetWidth;s.classList.add('miss');}
      if(missN>=3&&missN%3===0){const left=A.bad.filter(x=>!x.found)[0];const lw=left&&wordOf(left.at);
        if(lw){const ws=board.querySelector('.zmb-ow[data-w="'+A.words.indexOf(lw)+'"]');if(ws)ws.classList.add('help');}
        S1('yat',esc(YAT_HELP[hpN++%YAT_HELP.length]),'norm');return;}
      S1('yat',esc(YAT_MISS[msN++%YAT_MISS.length]),'norm');}
    /* лупа: слово крупно, буквы — кнопки ≥ 48 px */
    function openLupa(w){lupa=w;let h='<div class="zmb-olw">';for(let j=w.a;j<=w.b;j++)h+='<button type="button" class="zmb-olb" data-i="'+j+'">'+esc(A.t[j].toUpperCase())+'</button>';
      lp.innerHTML=h+'</div>';lp.classList.add('on');
      [].slice.call(lp.querySelectorAll('.zmb-olb')).forEach(b=>b.onclick=()=>{const j=+b.getAttribute('data-i');const bb=w.bad;
        if(bb&&!bb.found&&j===bb.at){fix(bb);return;}try{host.snd.tap();}catch(e){}b.classList.add('no');b.disabled=true;S1('yat','Мяу, не эта. Ещё разок!','norm');});
      if(cur>=0)hl(-1);}
    function closeLupa(){lupa=null;lp.innerHTML='';lp.classList.remove('on');}
    function next(){clearTimeout(timer);timer=0;if(!busy)return;ni++;board.classList.remove('done');if(ni>=L.length){fin();return;}show();}
    function fin(){const st=tierOf(miss);host.finish({sc:Math.max(5,60-6*miss),st,h:miss,label:'Опечаток: '+found+' из '+(L.length*3)+(miss?' · промахов: '+miss:' · без промахов!')});}
    board.addEventListener('click',e=>{if(busy){if(timer)next();return;}const s=e.target.closest('.zmb-oL');if(s){tap(+s.getAttribute('data-i'));return;}
      // нажатие между буквами слова — ближайшая буква
      const w=e.target.closest('.zmb-ow');if(w){let best=-1,bd=1e9;[].slice.call(w.querySelectorAll('.zmb-oL')).forEach(x=>{const r=x.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-e.clientX);if(d<bd){bd=d;best=+x.getAttribute('data-i');}});if(best>=0)tap(best);}});
    say.onclick=()=>{if(busy&&timer)next();};
    // клавиатура ПК: курсор по буквам
    const all=()=>A?A.words.reduce((a,w)=>a.concat(w.ch),[]):[];
    function hl(i){const p=board.querySelector('.zmb-oL.kf');if(p)p.classList.remove('kf');cur=i;const s=i>=0&&span(i);if(s)s.classList.add('kf');}
    host.keys(k=>{if(busy){if(k==='Enter'||k===' '){if(timer)next();return true;}return false;}
      if(lupa){const bs=[].slice.call(lp.querySelectorAll('.zmb-olb:not(:disabled)'));let f=bs.findIndex(b=>b.classList.contains('kf'));
        if(k==='ArrowLeft'||k==='ArrowRight'){if(!bs.length)return true;bs.forEach(b=>b.classList.remove('kf'));f=f<0?0:(f+(k==='ArrowLeft'?bs.length-1:1))%bs.length;bs[f].classList.add('kf');return true;}
        if(k==='Enter'||k===' '){if(f>=0)bs[f].click();else if(bs[0])bs[0].classList.add('kf');return true;}
        if(k==='ArrowUp'||k==='ArrowDown'){closeLupa();}else return false;}
      const a=all();if(!a.length)return false;let p=a.indexOf(cur);
      if(k==='ArrowRight'||k==='ArrowLeft'){p=p<0?0:(p+(k==='ArrowLeft'?a.length-1:1))%a.length;hl(a[p]);return true;}
      if(k==='ArrowDown'||k==='ArrowUp'){const wi=cur>=0?A.words.indexOf(wordOf(cur)):-1;let n=wi<0?0:(wi+(k==='ArrowUp'?A.words.length-1:1))%A.words.length;hl(A.words[n].a);return true;}
      if(k==='Enter'||k===' '){if(cur<0){hl(a[0]);return true;}tap(cur);return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);timer=0;});
    // бот: с вероятностью ~k — верная буква; иначе — буква соседнего верного слова (промах) или другая буква нужного слова (лупа)
    host.bot=k=>{if(!A)return;if(busy){if(timer)next();return;}const left=A.bad.filter(x=>!x.found);if(!left.length)return;const b=left[0];
      if(lupa){const bs=[].slice.call(lp.querySelectorAll('.zmb-olb:not(:disabled)'));const r=bs.filter(x=>+x.getAttribute('data-i')===lupa.bad.at)[0];
        if(Math.random()<k||bs.length<2)r.click();else bs.filter(x=>x!==r)[0].click();return;}
      if(Math.random()<.35+.6*k){tap(b.at);return;}
      if(Math.random()<.5){const w=wordOf(b.at);const o2=w.ch.filter(i=>i!==b.at);if(o2.length){tap(o2[0]);return;}}
      const ok=A.words.filter(w=>!w.bad);if(ok.length){const w=ok[Math.floor(Math.random()*ok.length)];tap(w.a);}else tap(b.at);};
    host.intro({who:'yat',text:'Мяу! Я ночью прошёлся по объявлениям у подъезда. Лапами. <b>В каждом — 3 буквы не те.</b> Найди и нажми на неверную букву — Зина исправит красной ручкой.',
      btn:'Искать!',hint:'2 объявления · ~45 секунд · промах не страшен — только звёзды'}).then(show);}});
(function(){if(document.getElementById('zmb-o-css'))return;const st=document.createElement('style');st.id='zmb-o-css';st.textContent=
'.zmb-o{flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-start;padding:8px 0 10px;overflow-y:auto}'+
'.zmb-op{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 auto;width:calc(100% - 24px);max-width:520px;font-weight:800;font-size:16px;color:var(--ink2,#5d6781)}'+
'.zmb-opt b{color:var(--ink,#27324a);font-size:19px}.zmb-opm{font-size:15px}'+
'.zmb-ob{margin:12px auto 0;width:calc(100% - 24px);max-width:520px;cursor:pointer}'+
'.zmb-on{position:relative;background:#fffef4;background-image:repeating-linear-gradient(0deg,transparent 0 33px,rgba(70,110,170,.10) 33px 34px);border-radius:4px;padding:22px 14px 14px;box-shadow:0 3px 10px rgba(40,40,60,.18);transform:rotate(-.6deg);color:#27324a}'+
'.zmb-otp{position:absolute;left:50%;top:-9px;width:86px;height:22px;margin-left:-43px;background:rgba(240,214,140,.85);transform:rotate(2deg);box-shadow:0 1px 2px rgba(0,0,0,.1)}'+
'.zmb-oh{font:800 21px/1.25 var(--font,Arial);text-align:center;letter-spacing:1px;margin-bottom:8px;color:#20335a}'+
'.zmb-ot{font:600 21px/1.62 var(--font,Arial);text-align:left;word-spacing:3px;user-select:none;-webkit-user-select:none}'+
'.zmb-ow{display:inline-block;white-space:nowrap;border-radius:6px;transition:background .2s}'+
'.zmb-oL{display:inline-block;padding:0 .5px;border-radius:4px;position:relative}.zmb-oL:hover{background:rgba(47,111,181,.12)}'+
'.zmb-oL.kf{outline:3px solid var(--gold,#f5b72d)}'+
'.zmb-oL.fix s{color:#9aa2b4;text-decoration-color:#e2463b;text-decoration-thickness:2px}.zmb-oL.fix b{position:absolute;left:50%;top:-.95em;transform:translateX(-50%) rotate(-8deg);font:800 19px/1 "Comic Sans MS","Segoe Print",cursive;color:#e2463b}'+
'.zmb-ow.near{background:rgba(245,183,45,.25)}.zmb-ow.help{background:rgba(245,183,45,.45);box-shadow:0 0 0 2px rgba(245,183,45,.8)}.zmb-ow.fixed{background:rgba(52,168,83,.12)}'+
'.zmb-oL.miss{animation:zmbMiss .45s}@keyframes zmbMiss{0%,100%{transform:none}25%{transform:translateX(-3px);color:#e2463b}75%{transform:translateX(3px);color:#e2463b}}'+
'.zmb-oP{color:#27324a}.zmb-os2{text-align:right;font:italic 600 18px/1.3 var(--font,Arial);color:#4a5570;margin-top:6px}'+
'.zmb-opaw{position:absolute;right:10px;bottom:30px;width:34px;height:30px;opacity:.13;background:radial-gradient(circle at 50% 70%,#333 0 9px,transparent 10px),radial-gradient(circle at 20% 30%,#333 0 4px,transparent 5px),radial-gradient(circle at 45% 12%,#333 0 4px,transparent 5px),radial-gradient(circle at 72% 14%,#333 0 4px,transparent 5px),radial-gradient(circle at 92% 34%,#333 0 4px,transparent 5px);pointer-events:none}'+
'.zmb-on.done,.zmb-ob.done .zmb-on{box-shadow:0 0 0 3px rgba(52,168,83,.6),0 3px 10px rgba(40,40,60,.18)}'+
'.zmb-ol{margin:0 auto;width:calc(100% - 24px);max-width:520px}.zmb-ol.on{margin-top:10px}'+
'.zmb-olw{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;background:#eaf3ff;border-radius:16px;padding:8px;animation:zmbIn2 .25s ease-out both}@keyframes zmbIn2{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}'+
'.zmb-olb{min-width:48px;min-height:52px;border:0;border-radius:12px;background:#fff;color:#27324a;font:800 24px/1 var(--font,Arial);box-shadow:0 3px 0 var(--edge,#d5d9e3);cursor:pointer;padding:0 6px}'+
'.zmb-olb.no{opacity:.4}.zmb-olb.kf{outline:3px solid var(--gold,#f5b72d)}'+
'.zmb-os{min-height:70px;margin:10px auto 0;width:calc(100% - 24px);max-width:520px;cursor:pointer}.zmb-os .zmg-av{width:52px;height:52px}.zmb-ok{text-align:center;margin:4px 0 0}'+
'@media (max-width:360px){.zmb-ot{font-size:19px}.zmb-oh{font-size:19px}}@media (max-height:620px){.zmb-ot{line-height:1.5}.zmb-os{min-height:58px}}';
document.head.appendChild(st);})();
})();
