'use strict';
/* zb-MGB мини-игра №5 «Барабан у бабы Зины» (Затея дня — пятница). Своё шоу Зины: без чужих передач, ведущих и заставок.
   Табло со словом (6–9 букв, только из пройденных уровней) и вопрос-толкование. Крутишь барабан → сектор:
     50…500 — называешь букву: есть в слове — очки × сколько раз встречается; нет — ошибка;
     «×2» — угадаешь букву — очки удваиваются; «Приз» — пирожок от Зины (+250) и крутишь снова;
     «Ять — буква даром» — кот открывает букву; «Банкрот» — очки сгорают (только очки, ошибкой не считается).
   «Слово целиком» — вписываешь недостающие буквы; неверно — одна ошибка (не конец). 5 ошибок — конец; ролик «ещё попытка» — только на 5-й ошибке (host.adNeed, 1 за заход).
   Звёзды: угадал с 0–1 ошибкой — 3★, 2–3 — 2★, 4+ — 1★; не угадал — 1★, если открыта половина букв, иначе 0. Очки — рекорд.
   Телефон: барабан и буквы сменяют друг друга (крутишь → называешь букву); ПК (широкий экран) — рядом.
   ПК: Пробел/Enter — крутить; буквы — назвать; Enter (в выборе буквы) — слово целиком, потом буквы, Backspace, 0 — отмена. Договор — шапка js/zmg-core.js. Классы — zmb-b*. */
(function(){
if(typeof ZMG_REG!=='function')return;
const MAXE=5;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const nrm=c=>String(c).toLowerCase().replace(/ё/g,'е');
const cap=t=>{t=String(t||'').trim();return t.charAt(0).toUpperCase()+t.slice(1);};
const ABC='абвгдежзийклмнопрстуфхцчшщъыьэюя'.split('');
/* сектора по часовой стрелке от верха */
const SEC=[{v:100},{y:1,t:'Ять',c:'#9bd0ff'},{v:300},{v:50},{p:1,t:'ПРИЗ',c:'#e2463b',f:'#fff'},{v:200},{x:1,t:'×2',c:'#c8b6ff'},{v:150},{v:500,c:'#ff8a3d'},{b:1,t:'Банкрот',c:'#5d6781',f:'#fff'},{v:250},{v:400}];
const COL=['#ffd166','#fff1b8','#b5e48c','#ffe0c2'];
SEC.forEach((s,i)=>{if(!s.c)s.c=COL[i%COL.length];if(!s.t)s.t=String(s.v);});
const FALLBACK=[['самовар','Пузатый, с краником. Чай без него — не чай, а так, водичка.'],['варенье','Его варят тазами, а едят ложечкой — и всё равно мало.'],
  ['валенки','Зимой на ногах, летом на антресолях. Без калош — не обувь.'],['пирожок','Его Зина печёт противнями, а соседки уносят «на пробу».']];
const ZS={spin:['Крути барабан! Не бойся — он не кусается.','Ну-ка, крутани посильнее!','Крути, крути — буквы сами не угадаются.'],
  num:['Выпало «%»! Называй букву.','«%» очков на кону! Какая буква?','«%» — неплохо. Ну, какую букву?'],
  ok:['Угадал! Открываю клеточку.','Есть! Ишь, какой грамотный.','Верно! Записываю очки.'],
  no:['Нет такой буквы. Ничего, крути дальше.','Мимо! Бывает и у отличников.','Нет её тут. Не расстраивайся — пирожок с меня.'],
  x2:['Выпало «×2»! Угадаешь букву — очки удвою.'],
  prize:['Выпал «ПРИЗ»! Держи пирожок с капустой — и ещё 250 очков сверху.','«ПРИЗ»! Тебе — горячий пирожок и 250 очков. Крути дальше.'],
  yat:['«Ять — буква даром»! Кот сам открыл букву. Мяу.','Ять прошёлся по табло и лапой открыл букву!'],
  bank:['Ой! «Банкрот» — очки сгорели. Ошибкой не считаю, крути снова.','«Банкрот»… Очки как ветром сдуло. Ничего, буквы-то остались!'],
  win:['Угадал! Слово «%». Молодец, весь в бабушку.','«%»! Вот это голова. Пирожок заслужил.'],
  wordNo:['Не то слово. Это одна ошибка — не конец, крути дальше.']};
let zsN={};const zs=(k,v)=>{const a=ZS[k];const i=(zsN[k]=(zsN[k]|0)+1)-1;return a[i%a.length].replace('%',v==null?'':v);};
function pickWord(host,o){const W=host.words({min:6,max:9,def:true})||[];
  for(const w of W){const d=host.def(w);if(d&&!/[^а-яё]/i.test(w))return {w:nrm(w)===w?w:w.toLowerCase(),q:cap(d)};}
  const W2=host.words({min:5,max:10,def:true})||[];for(const w of W2){const d=host.def(w);if(d&&!/[^а-яё]/i.test(w))return {w:w.toLowerCase(),q:cap(d)};}
  const f=FALLBACK[Math.floor(o.rnd()*FALLBACK.length)];return {w:f[0],q:f[1]};}
function wheelSvg(){const n=SEC.length,a=360/n,R=96;let h='<svg viewBox="0 0 200 200" class="zmb-bws" aria-hidden="true">';
  const pt=(deg,r)=>{const t=deg*Math.PI/180;return [(100+r*Math.sin(t)).toFixed(1),(100-r*Math.cos(t)).toFixed(1)];};
  SEC.forEach((s,i)=>{const p0=pt(i*a,R),p1=pt((i+1)*a,R),m=(i+.5)*a,tp=pt(m,s.t.length>4?58:64),long=s.t.length>4;
    h+='<path d="M100,100 L'+p0[0]+','+p0[1]+' A'+R+','+R+' 0 0 1 '+p1[0]+','+p1[1]+' Z" fill="'+s.c+'" stroke="#fff" stroke-width="2"/>';
    h+='<text x="'+tp[0]+'" y="'+tp[1]+'" transform="rotate('+(m-90)+' '+tp[0]+' '+tp[1]+')" text-anchor="middle" dominant-baseline="middle" font-size="'+(long?13:17)+'" font-weight="800" fill="'+(s.f||'#27324a')+'">'+esc(s.t)+'</text>';});
  return h+'<circle cx="100" cy="100" r="17" fill="#fff" stroke="#1d4fa3" stroke-width="3"/></svg>';}
ZMG_REG({id:'baraban',finWho:'zina',
  open:()=>true,
  lines:{good:'Вот это голова! Пирожки заслужил — бери с полки.',ok:'Неплохо покрутил! Приходи ещё — отыграешься.',
    bad:'Слово хитрое попалось. Ничего, барабан никуда не денется — приходи ещё.'},
  sim(o,k){let e=0,open=0;const n=7;while(e<MAXE&&open<n){if(o.rnd()<.35+.5*k)open+=1+(o.rnd()<.3?1:0);else e++;if(open>=n-2&&o.rnd()<k)open=n;}
    const win=open>=n;return {sc:win?Math.round(600+1400*k*o.rnd()):Math.round(300*o.rnd()),st:win?(e<=1?3:e<=3?2:1):(open>=n/2?1:0)};},
  run(host,o){const P=pickWord(host,o),W=P.w.split(''),N=W.length;
    const open=W.map(()=>false);let pts=0,err=0,ph='spin',sec=null,rot=0,spinning=false,used={},typed=[],fast=false,adAsked=false,done=false,timer=0,wPrev='spin';
    host.el.innerHTML='<div class="zmb-b ph-spin"><div class="zmb-bt">'+W.map((_,i)=>'<i data-i="'+i+'"></i>').join('')+'</div>'+
      '<div class="zmb-bq">❓ '+esc(P.q)+'</div><div class="zmb-bs"></div>'+
      '<div class="zmb-bst"><span>Очки <b class="zmb-bp">0</b></span><span class="zmb-be">Ошибки <i></i><i></i><i></i><i></i><i></i></span><span class="zmb-bsec"></span></div>'+
      '<div class="zmb-bm"><div class="zmb-bw"><div class="zmb-bwh"><i class="zmb-bptr"></i><div class="zmb-bwr">'+wheelSvg()+'</div></div>'+
      '<button type="button" class="zmb-bspin">Крутить барабан ↻'+(host.pc?' '+host.kc('Пробел'):'')+'</button></div>'+
      '<div class="zmb-bk"><div class="zmb-bkb">'+ABC.map(c=>'<button type="button" data-c="'+c+'">'+c.toUpperCase()+'</button>').join('')+'</div>'+
      '<div class="zmb-bkr"><button type="button" class="zmb-bwd">Слово целиком'+(host.pc?' '+host.kc('Enter'):'')+'</button><button type="button" class="zmb-bcx">Отмена'+(host.pc?' '+host.kc('0'):'')+'</button></div></div></div></div>';
    const $=s=>host.el.querySelector(s),root=$('.zmb-b'),tab=[].slice.call(host.el.querySelectorAll('.zmb-bt i')),say=$('.zmb-bs'),pv=$('.zmb-bp'),
      eds=[].slice.call(host.el.querySelectorAll('.zmb-be i')),secb=$('.zmb-bsec'),wr=$('.zmb-bwr'),sb=$('.zmb-bspin'),
      keys=[].slice.call(host.el.querySelectorAll('.zmb-bkb button')),wdb=$('.zmb-bwd'),cxb=$('.zmb-bcx');
    const S1=(t,m)=>{say.innerHTML=host.say('zina',t,m||'norm');};
    function setPh(p){ph=p;root.classList.remove('ph-spin','ph-let','ph-word','ph-end');root.classList.add('ph-'+p);
      sb.disabled=p!=='spin'||spinning;keys.forEach(b=>b.disabled=p==='spin'||p==='end'||(p==='let'&&!!used[b.getAttribute('data-c')]));
      host.top(p==='word'?'Впиши слово':p==='let'?'Назови букву':p==='spin'?'Крути барабан':'');}
    function drawTab(hl){tab.forEach((t,i)=>{const c=open[i]?W[i]:(ph==='word'&&typed[slotIdx().indexOf(i)])||'';t.textContent=c?c.toUpperCase():'';
      t.className=open[i]?'o'+(hl&&hl.indexOf(i)>=0?' new':''):(ph==='word'?'w'+(c?' f':''):'');});}
    function drawSt(){pv.textContent=pts;eds.forEach((d,i)=>d.className=i<err?'on':'');}
    const slotIdx=()=>W.map((_,i)=>i).filter(i=>!open[i]);
    const left=()=>open.filter(x=>!x).length;
    function openLetter(c){const hit=[];W.forEach((w,i)=>{if(!open[i]&&nrm(w)===c){open[i]=true;hit.push(i);}});return hit;}
    /* барабан */
    function spin(){if(ph!=='spin'||spinning||done)return;spinning=true;sb.disabled=true;try{host.snd.tap();}catch(e){}
      const n=SEC.length,a=360/n,k=Math.floor(o.rnd()*n),jit=(o.rnd()-.5)*a*.6;
      const want=((360-(k*a+a/2+jit))%360+360)%360;rot=rot-(rot%360)+360*(fast?1:4)+want;
      const dur=fast?.12:host.calm?.6:2.1;wr.style.transition='transform '+dur+'s cubic-bezier(.15,.75,.2,1)';wr.style.transform='rotate('+rot+'deg)';
      secb.textContent='';S1('Крутится-вертится…');timer=setTimeout(()=>{spinning=false;land(SEC[k]);},dur*1000+60);}
    function land(s){if(done)return;sec=s;secb.innerHTML='Выпало: <b>'+esc(s.y?'Ять — буква даром':s.t)+'</b>';
      if(s.b){pts=0;drawSt();try{host.snd.bad&&host.snd.bad();}catch(e){}S1(esc(zs('bank')),'sad');setPh('spin');return;}
      if(s.p){pts+=250;drawSt();try{host.snd.coin&&host.snd.coin();}catch(e){}S1(esc(zs('prize')),'happy');setPh('spin');return;}
      if(s.y){const cl=W.map((w,i)=>i).filter(i=>!open[i]);const c=nrm(W[cl[Math.floor(o.rnd()*cl.length)]]);used[c]=1;const hit=openLetter(c);
        keys.forEach(b=>{if(b.getAttribute('data-c')===c)b.classList.add('ok');});try{host.snd.meow?host.snd.meow():host.snd.open&&host.snd.open();}catch(e){}
        drawTab(hit);S1(esc(zs('yat')),'wow');if(!left()){win();return;}setPh('spin');return;}
      S1(s.x?esc(zs('x2')):esc(zs('num',s.v)).replace('«'+s.v+'»','<b>«'+s.v+'»</b>'));setPh('let');}
    /* буква */
    function letter(c){if(ph!=='let'||done)return;c=nrm(c);if(used[c]){S1('Букву «'+c.toUpperCase()+'» уже называли. Другую!');return;}used[c]=1;
      const b=keys.filter(x=>x.getAttribute('data-c')===c)[0];const hit=openLetter(c);
      if(hit.length){if(b)b.classList.add('ok');pts=sec&&sec.x?Math.max(100,pts*2):pts+(sec&&sec.v||0)*hit.length;drawSt();drawTab(hit);
        try{host.snd.word?host.snd.word(3+hit.length,0):host.snd.coin();}catch(e){}
        if(!left()){win();return;}S1(esc(zs('ok'))+(hit.length>1?' Целых '+hit.length+'!':''),'happy');setPh('spin');return;}
      if(b)b.classList.add('no');miss(esc(zs('no')));}
    function miss(t){err++;drawSt();try{host.snd.bad&&host.snd.bad();}catch(e){}
      if(err>=MAXE){lastChance();return;}S1(t+' Ошибок: '+err+' из '+MAXE+'.','sad');setPh('spin');}
    /* 5-я ошибка: ролик «ещё попытка» — один раз и только если реклама есть */
    function lastChance(){setPh('end');if(adAsked||!host.adOk||!host.adOk()){lose();return;}adAsked=true;
      say.innerHTML=host.say('zina','Ошибок — пять из пяти. Ещё попытку дам — за рекламу. Или открываю слово?','sad')+
        '<div class="zmb-bad"><button type="button" class="btn green zbad zmg-ad zmb-bado">🎬 Ещё попытка за рекламу</button><button type="button" class="btn zmb-badn">Открыть слово</button></div>';
      say.querySelector('.zmb-bado').onclick=()=>{try{host.snd.tap();}catch(e){}host.adNeed('retry').then(ok=>{if(done)return;if(ok){err=MAXE-1;drawSt();S1('Ладно, ещё одна попытка! Крути.','happy');setPh('spin');}else lose();});};
      say.querySelector('.zmb-badn').onclick=()=>{try{host.snd.tap();}catch(e){}lose();};}
    /* слово целиком */
    function wordMode(){if(ph!=='let'&&ph!=='spin'||done||spinning)return;wPrev=ph;typed=[];setPh('word');drawTab();S1('Впиши недостающие буквы. Ошибёшься — одна ошибка, не конец.');}
    function wordType(c){if(ph!=='word')return;const sl=slotIdx();if(typed.length>=sl.length)return;typed.push(nrm(c));try{host.snd.letter&&host.snd.letter(typed.length);}catch(e){}drawTab();
      if(typed.length===sl.length)setTimeout(wordCheck,250);}
    function wordBack(){if(ph!=='word'||!typed.length)return;typed.pop();drawTab();}
    function wordCheck(){if(ph!=='word'||done)return;const sl=slotIdx();if(typed.length<sl.length)return;
      if(sl.every((i,j)=>nrm(W[i])===typed[j])){pts+=100*sl.length;sl.forEach(i=>open[i]=true);drawSt();drawTab(sl);win();return;}
      typed=[];setPh('spin');drawTab();tab.forEach(t=>{t.classList.remove('shk');void t.offsetWidth;t.classList.add('shk');});miss(esc(zs('wordNo')));}
    function wordCancel(){if(ph!=='word')return;typed=[];setPh(wPrev);drawTab();S1(wPrev==='let'?'Ладно, называй букву.':esc(zs('spin')));}
    /* конец */
    function win(){done=true;setPh('end');drawTab(W.map((_,i)=>i));S1(esc(zs('win',P.w.toUpperCase())),'happy');try{host.snd.win&&host.snd.win();}catch(e){}
      const st=err<=1?3:err<=3?2:1;timer=setTimeout(()=>host.finish({sc:pts,st,h:err,label:'Слово «'+P.w.toUpperCase()+'» · очков: '+pts}),host.calm?2200:1700);}
    function lose(){if(done)return;done=true;const half=open.filter(Boolean).length*2>=N;W.forEach((_,i)=>open[i]=true);setPh('end');drawTab();
      S1('Было слово <b>«'+esc(P.w.toUpperCase())+'»</b>. Хитрое! В следующий раз угадаешь.','sad');
      timer=setTimeout(()=>host.finish({sc:pts,st:half?1:0,h:err,label:'Слово «'+P.w.toUpperCase()+'» не угадано · очков: '+pts}),host.calm?2600:2100);}
    sb.onclick=spin;wdb.onclick=()=>{try{host.snd.tap();}catch(e){}wordMode();};cxb.onclick=()=>{try{host.snd.tap();}catch(e){}wordCancel();};
    $('.zmb-bwh').onclick=spin;
    keys.forEach(b=>b.onclick=()=>{const c=b.getAttribute('data-c');if(ph==='word'){wordType(c);return;}try{host.snd.tap();}catch(e){}letter(c);});
    host.keys(k=>{if(done)return false;
      if(ph==='spin'){if(k===' '||k==='Enter'){spin();return true;}if(k&&k.length===1&&/[а-яё]/i.test(k)){S1('Сперва крути барабан! '+(host.pc?host.kc('Пробел'):''));return true;}return false;}
      if(ph==='let'){if(k==='Enter'){wordMode();return true;}if(k&&k.length===1&&/[а-яё]/i.test(k)){letter(k);return true;}return false;}
      if(ph==='word'){if(k==='Backspace'){wordBack();return true;}if(k==='0'){wordCancel();return true;}if(k==='Enter'){wordCheck();return true;}if(k&&k.length===1&&/[а-яё]/i.test(k)){wordType(k);return true;}return false;}
      return false;});
    host.onQuit(()=>{clearTimeout(timer);timer=0;});
    // бот: быстрый барабан; буква из слова с вероятностью ~k, иначе частая мимо; когда закрыто ≤2 — слово целиком
    host.bot=k=>{if(done||spinning)return;fast=true;
      if(ph==='end'){const n=say.querySelector('.zmb-badn');if(n)n.click();return;}
      if(ph==='spin'){if(left()<=2&&Math.random()<k){wordMode();return;}spin();return;}
      if(ph==='word'){const sl=slotIdx();if(typed.length<sl.length){const good=Math.random()<.5+.5*k;wordType(good?nrm(W[sl[typed.length]]):'ъ');}return;}
      if(ph==='let'){const inW=ABC.filter(c=>!used[c]&&W.some((w,i)=>!open[i]&&nrm(w)===c)),outW='оеаинтсрвлкмдпу'.split('').filter(c=>!used[c]&&!inW.includes(c));
        const c=(Math.random()<.35+.55*k||!outW.length)&&inW.length?inW[Math.floor(Math.random()*inW.length)]:outW[0]||inW[0];if(c)letter(c);}};
    drawTab();drawSt();setPh('spin');
    host.intro({who:'zina',text:'<b>Барабан у бабы Зины!</b> Ведущая — я, призы — пирожки. Крути барабан, называй буквы и угадай слово. <b>Пять ошибок</b> — и игра окончена.',
      btn:'Крутить!',hint:'Одно слово · ~1 минута · «Банкрот» забирает только очки'}).then(()=>S1(esc(zs('spin'))));}});
(function(){if(document.getElementById('zmb-b-css'))return;const st=document.createElement('style');st.id='zmb-b-css';st.textContent=
'.zmb-b{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;padding:8px 10px 10px;min-height:0;overflow-y:auto;background:radial-gradient(ellipse at 50% 30%,#fff 0,transparent 70%)}'+
'.zmb-bt{display:flex;gap:4px;justify-content:center;flex:none}'+
'.zmb-bt i{width:38px;height:48px;background:#1d4fa3;border-radius:6px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25);font:900 27px/48px var(--font,Arial);font-style:normal;color:#1d4fa3;text-align:center;transition:background .3s,transform .3s}'+
'.zmb-bt i.o{background:#fff;box-shadow:inset 0 0 0 2px #1d4fa3}.zmb-bt i.new{animation:zmbFlip .5s ease-out}@keyframes zmbFlip{0%{transform:rotateY(90deg)}100%{transform:none}}'+
'.zmb-bt i.w{background:#eaf3ff;box-shadow:inset 0 0 0 2px #2f6fd6;color:#2f6fd6}.zmb-bt i.w.f{background:#fff7d6}'+
'.zmb-bt i.shk{animation:zmbShk .35s}@keyframes zmbShk{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}'+
'.zmb-bq{margin-top:8px;font-size:17px;line-height:1.3;text-align:center;background:#fff;border-radius:12px;padding:8px 12px;box-shadow:0 2px 8px rgba(39,50,74,.10);max-width:440px;flex:none}'+
'.zmb-bs{margin-top:8px;width:100%;max-width:440px;min-height:62px;flex:none}.zmb-bs .zmg-say{margin:0}.zmb-bs .zmg-av{width:48px;height:48px}'+
'.zmb-bst{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:6px;font-weight:700;font-size:16px;color:var(--ink2,#5d6781);flex:none}'+
'.zmb-bst b{color:var(--ink,#27324a);font-size:19px}.zmb-be i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-left:3px;background:#e3e7ee}.zmb-be i.on{background:#d0342c}'+
'.zmb-bsec{background:#fff4c9;border-radius:12px;padding:2px 10px}.zmb-bsec:empty{display:none}'+
'.zmb-bm{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;min-height:0;margin-top:6px}'+
'.zmb-bw{display:flex;flex-direction:column;align-items:center;gap:10px}'+
'.zmb-bwh{position:relative;width:min(62vw,40vh,260px);height:min(62vw,40vh,260px);min-width:170px;min-height:170px;cursor:pointer}'+
'.zmb-bwr{width:100%;height:100%;will-change:transform}.zmb-bws{width:100%;height:100%;display:block;filter:drop-shadow(0 4px 8px rgba(29,79,163,.2))}'+
'.zmb-bptr{position:absolute;top:-8px;left:50%;margin-left:-13px;width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-top:24px solid #d0342c;z-index:2;filter:drop-shadow(0 2px 1px rgba(0,0,0,.3))}'+
'.zmb-bspin{min-height:54px;padding:0 24px;border-radius:16px;border:0;background:#ff8a3d;color:#fff;font:800 19px/1.1 var(--font,Arial);box-shadow:0 4px 0 #c2410c;cursor:pointer}.zmb-bspin:disabled{opacity:.55;cursor:default}'+
'.zmb-bk{width:100%;max-width:520px}.zmb-bkb{display:grid;grid-template-columns:repeat(8,1fr);gap:5px}'+
'.zmb-bkb button{height:48px;border-radius:10px;border:2px solid #c9d6ea;background:#fff;font:800 20px var(--font,Arial);color:#1d4fa3;cursor:pointer;padding:0}'+
'.zmb-bkb button.ok{background:#d6f0dc;border-color:#34a853;color:#237a3b}.zmb-bkb button.no{background:#eef1f6;border-color:#e3e7ee;color:#b5bccb;text-decoration:line-through}'+
'.zmb-bkb button:disabled{cursor:default}.zmb-b.ph-let .zmb-bkb button:not(:disabled):not(.ok):not(.no),.zmb-b.ph-word .zmb-bkb button{border-color:#2f6fd6}'+
'.zmb-bkr{display:flex;gap:8px;justify-content:center;margin-top:8px}.zmb-bkr button{min-height:50px;padding:0 16px;border-radius:14px;border:2px dashed #2f6fb5;background:#eaf3ff;color:#2f6fb5;font:800 17px var(--font,Arial);cursor:pointer}'+
'.zmb-bcx{display:none}.zmb-b.ph-word .zmb-bcx{display:block}.zmb-b.ph-word .zmb-bwd,.zmb-b.ph-spin .zmb-bwd,.zmb-b.ph-end .zmb-bwd{display:none}'+
'.zmb-bad{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px}.zmb-bad .btn{min-height:52px}'+
/* телефон: барабан и буквы сменяют друг друга */
'.zmb-b.ph-let .zmb-bw,.zmb-b.ph-word .zmb-bw{display:none}.zmb-b.ph-spin .zmb-bk,.zmb-b.ph-end .zmb-bk{display:none}.zmb-b.ph-end .zmb-bspin,.zmb-b.ph-end .zmb-bw{display:none}'+
/* ПК, широкий экран: рядом */
'@media (min-width:760px) and (min-aspect-ratio:1/1){.zmb-bm{flex-direction:row;gap:28px;align-items:center}.zmb-b .zmb-bw{display:flex!important}.zmb-b .zmb-bk{display:block!important;max-width:440px}'+
'.zmb-bwh{width:min(36vh,280px);height:min(36vh,280px)}.zmb-b.ph-spin .zmb-bk,.zmb-b.ph-end .zmb-bk{opacity:.55}.zmb-b.ph-let .zmb-bw,.zmb-b.ph-word .zmb-bw{opacity:.7}}'+
'@media (max-width:420px){.zmb-bsec{display:none}}'+
'@media (max-height:640px){.zmb-bs .zmg-av{width:40px;height:40px}.zmb-bs .zmg-sb{padding:6px 10px;font-size:16px}.zmb-bst{margin-top:4px}.zmb-bkr{margin-top:6px}.zmb-bkr button{min-height:48px}.zmb-bt i{height:42px;line-height:42px;font-size:24px}.zmb-bq{font-size:16px;padding:6px 10px;margin-top:6px}.zmb-bs{min-height:54px;margin-top:6px}.zmb-bkb button{height:46px}.zmb-bkb{gap:4px}}'+
'@media (max-width:360px){.zmb-bt{gap:3px}.zmb-bt i{width:32px}.zmb-bkb button{font-size:18px}}'+
'@media (prefers-reduced-motion:reduce){.zmb-bt i.new,.zmb-bt i.shk{animation:none}}';
document.head.appendChild(st);})();
})();
