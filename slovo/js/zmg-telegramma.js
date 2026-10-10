'use strict';
/* zb-MGB мини-игра №10 «Телеграмма от внука» (почтальонша Люся). «ПРИЕЗЖАЮ СУББОТУ ТЧК ВЕЗУ ___ ТЧК» — собери выпавшее слово из букв в круге (круг Зины, deps 'krug').
   3 телеграммы за заход. Неверное слово не наказывает. Подсказка: 1-я — загадка-толкование, 2-я — первая буква, дальше — ещё буква; каждая — минус к звёздам:
   0 подсказок — 3★, 1–2 — 2★, больше — 1★.
   СЕРИАЛ (host.mem() = {e: открыто серий, d: день последнего открытия ГГГГММДД, r: прочитано (по порядку)}): 27 телеграмм — 3 сюжета × 9.
     Первая встреча — сразу 3 («накопились»). Дальше +1 новая, когда все открытые прочитаны и прошло ≥ 2 календарных дня с прошлой (вернулся через неделю — всё равно одна).
     В заходе: непрочитанные (до 3) — последними, перед ними прочитанные «из подшивки»; новых нет — 3 из подшивки, Люся говорит, когда будет новая.
     Наружу (договор MG0 — глобальных имён нет): поля регистрации. const t=window.ZMG&&ZMG.REG.by.telegramma; t&&t.due() — ждёт новая телеграмма
     (для значка в делах дня / Перемены; по S.zmg.m.telegramma, данные не нужны; файл игры оболочка грузит заранее, когда игра открыта), t.state().
   Праздник host.fest.id==='ny' — «Телеграммы Деда Мороза» (ZMG_TELEGRAMMA.ny, 6 шт.), сериал не двигают.
   Данные — js/zmg-telegramma-data.js (../MGB-tools/mkdata.py). ПК: буквы, Enter, Backspace, Пробел — перемешать; 0 / ? — подсказка; Enter после ответа — дальше. Классы — zmb-t*. */
(function(){
const TOTAL=27,PER=3,GAP=2;
function dnum(k){k=+k||0;return Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5;}
function tkey(){try{return +todayKey();}catch(e){const d=new Date();return d.getFullYear()*1e4+(d.getMonth()+1)*100+d.getDate();}}
function memOf(){try{const m=S.zmg&&S.zmg.m&&S.zmg.m.telegramma;return m&&typeof m==='object'?m:null;}catch(e){return null;}}
/* сериал: сколько открыто сейчас (без записи) */
function stepOf(m,day,total){total=total||TOTAL;if(!m||!(m.e>0))return {e:Math.min(PER,total),d:day,first:true,nw:Math.min(PER,total)};
  const e=Math.min(m.e|0,total),r=Math.min(m.r|0,e);
  if(r>=e&&e<total&&dnum(day)-dnum(m.d)>=GAP)return {e:e+1,d:day,first:false,nw:1};
  return {e,d:m.d|0,first:false,nw:0};}
const TG={due(){const m=memOf();if(!m||!(m.e>0))return false;const s=stepOf(m,tkey());return s.nw>0||(m.r|0)<(m.e|0);},
  state(){const m=memOf()||{};return {e:m.e|0,r:m.r|0,d:m.d|0,total:TOTAL,next:m.e>0?dnum(m.d)+GAP:0};}};
if(typeof ZMG_REG!=='function')return;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const nrm=w=>String(w).toLowerCase().replace(/ё/g,'е');
const tierOf=h=>h<=0?3:h<=2?2:1;
function mix(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const FREQ='оеаинтсрвлкмдпуяыгзбчйхжшю';
const LY_BAD=['Не сходится… Телеграфистка так не пишет.','Хм, не то. У них там по буквам считают — каждая копейка.','Не то слово, Зинаида Павловна. Ещё разок!'];
const ZN_OK=['Ну, Стёпа! Весь в деда.','Так и знала!','Вот и прочитали.'];
function plan(host,o){const D=window.ZMG_TELEGRAMMA||{},I=D.items||[],ny=host.fest&&host.fest.id==='ny'&&D.ny&&D.ny.length;
  if(ny)return {L:mix(D.ny,o.rnd).slice(0,PER),ny:true,msg:'Зинаида Павловна, вам телеграммы с Севера! От самого Деда Мороза. Я аж варежки сняла.'};
  if(!I.length)return {L:[]};
  const m=host.mem(),total=Math.min(TOTAL,I.length),s=stepOf(m,o.day,total);m.e=s.e;m.d=s.d;m.r=Math.min(m.r|0,m.e);
  const r=m.r,unread=[];for(let i=r;i<m.e&&unread.length<PER;i++)unread.push(i);
  const arch=[];for(let i=r-1;i>=0&&arch.length+unread.length<PER;i--)arch.unshift(i);
  let idx=arch.concat(unread);
  if(!unread.length){const pool=[];for(let i=0;i<m.e;i++)pool.push(i);idx=mix(pool,o.rnd).slice(0,PER).sort((a,b)=>a-b);}
  let msg;if(s.first)msg='Зинаида Павловна, тут вам телеграммы <b>накопились</b> — от внука, от Стёпы! Целых три. Читайте по порядку.';
  else if(s.nw)msg='Зинаида Павловна, <b>новая телеграмма</b> от Стёпы! Я бегом несла. Но сперва — две старые, чтобы нить не потерять.';
  else if(unread.length)msg='Не дочитали в прошлый раз, Зинаида Павловна. Вот, держите.';
  else if(m.e>=total)msg='Все телеграммы Стёпы прочитаны! Перечитаем из подшивки — Зинаида Павловна любит.';
  else{const left=Math.max(1,Math.round(dnum(m.d)+GAP-dnum(o.day)));msg='Новой пока нет — Стёпа пишет раз в два дня. '+(left<=1?'Загляните <b>завтра</b>!':'Загляните через '+left+' дня!')+' А пока — из подшивки.';}
  return {L:idx.map(i=>Object.assign({_i:i,_new:i>=r},I[i])),ny:false,msg,m};}
function letters(a,rnd){const w=nrm(a).split(''),n=w.length<=4?2:1,out=w.slice();const pool=FREQ.split('').filter(c=>w.indexOf(c)<0);
  for(let i=0;i<n;i++)out.push(pool[Math.floor(rnd()*Math.min(12,pool.length))]);return out;}
ZMG_REG({id:'telegramma',finWho:'lyusya',due:TG.due,state:TG.state,deps:['krug','js/zmg-telegramma-data.js'],
  open:()=>true,
  lines:{good:'Все телеграммы прочитаны без запинки! Я Стёпе так и передам: «бабуля в форме».',ok:'Прочитали! Чуть с подсказками — так и я телеграфистку переспрашиваю.',
    bad:'Ничего, Зинаида Павловна. Почерк у телеграфа и правда так себе.'},
  sim(o,k){let h=0;for(let i=0;i<PER;i++){while(o.rnd()>.45+.5*k&&h<9)h++;}return {sc:Math.max(3,PER*10-3*h),st:tierOf(h)};},
  run(host,o){const P=plan(host,o),L=P.L;if(!L.length){host.quit();return;}
    let i=0,t=null,hints=0,hn=0,solved=false,kr=null,lbN=0,okN=0,ph2='fill';const res=[];
    const compact=()=>(window.innerHeight||800)<700;   // низкий экран: сперва читаем телеграмму целиком, потом — только фраза с пропуском и круг
    host.el.innerHTML='<div class="zmb-t"><div class="zmb-tp"><div class="zmg-dots">'+L.map(()=>'<i></i>').join('')+'</div><span class="zmb-tph"></span><button type="button" class="zmb-thb">💡 Подсказка'+(host.pc?' '+host.kc('0'):'')+'</button></div>'+
      '<div class="zmb-tm"><div class="zmb-tc"></div><div class="zmb-tk"></div></div><div class="zmb-ts"></div></div>';
    const $=s=>host.el.querySelector(s),root=$('.zmb-t'),card=$('.zmb-tc'),kw=$('.zmb-tk'),say=$('.zmb-ts'),ph=$('.zmb-tph'),hb=$('.zmb-thb'),dots=[].slice.call(host.el.querySelectorAll('.zmb-tp .zmg-dots i'));
    function blank(){const a=t.a,shown=hn>=2?Math.min(a.length-1,hn-1):0;let h='';
      for(let j=0;j<a.length;j++)h+='<i'+(solved?' class="ok"':j<shown?' class="op"':'')+'>'+(solved||j<shown?esc(a[j]):'')+'</i>';return '<span class="zmb-tb">'+h+'</span>';}
    function frag(){const w=String(t.t).split(' ').filter(Boolean),b=w.findIndex(x=>x.indexOf('___')>=0);if(b<0)return t.t;
      let a=b;while(a>0&&w[a-1]!=='ТЧК')a--;let z=b;while(z<w.length-1&&w[z]!=='ТЧК')z++;return (a>0?'… ':'')+w.slice(a,z+1).join(' ')+(z<w.length-1?' …':'');}
    function draw(){const short=ph2==='fill'&&!solved&&compact(),parts=String(short?frag():t.t).split('___'),star=P.ny?'❄️ ':'';
      card.innerHTML='<div class="zmb-tf'+(short?' short':'')+'"><div class="zmb-tt"><b>'+star+'ТЕЛЕГРАММА</b>'+
        (t._new&&!P.ny?'<span class="zmb-tnew">НОВАЯ</span>':(!P.ny&&L.some(x=>x._new)?'<span class="zmb-told">из подшивки</span>':''))+'</div>'+
        (short?'':'<div class="zmb-ta">'+(P.ny?esc(t.ti):'«'+esc(t.at)+'» · № '+t.ep+' «'+esc(t.ti)+'»')+'</div>')+
        '<div class="zmb-tx">'+parts.map(p=>p.split(' ').filter(Boolean).map(w=>w==='…'?'<span class="zmb-te">…</span>':'<span class="zmb-tw">'+esc(w)+'</span>').join(' ')).join(' '+blank()+' ')+'</div>'+
        (hn>=1&&!solved?'<div class="zmb-th">💬 '+esc(t.h)+'</div>':'')+(!solved&&ly?'<div class="zmb-tl">'+host.face('lyusya','norm')+'<span><b>Люся:</b> '+esc(ly)+'</span></div>':'')+'</div>';
      hb.style.visibility=solved||ph2==='read'||hn>=hmax()?'hidden':'';}
    const hmax=()=>1+Math.max(1,t.a.length-2);let ly='';
    hb.onclick=()=>{try{host.snd.tap();}catch(e){}hint();};
    function show(){t=L[i];hn=0;solved=false;ly=t.l||'';ph2=compact()?'read':'fill';say.innerHTML='';
      dots.forEach((d,k)=>d.className=k<i?(res[k]?'ok':'no'):k===i?'cur':'');host.top('Телеграмма '+(i+1)+' из '+L.length);ph.textContent=hints?'подсказок: '+hints:'';
      if(ph2==='read'){kw.style.display='none';root.classList.add('nok');draw();say.innerHTML='<div class="zmb-tn"><button type="button" class="btn green zmb-tgo">Вставить слово'+(host.pc?' '+host.kc('Enter'):'')+'</button></div>';
        say.querySelector('.zmb-tgo').onclick=()=>{try{host.snd.tap();}catch(e){}fill();};if(kr)kr.lock(true);return;}
      fill();}
    const auto=()=>setTimeout(()=>{if(!solved&&ph2==='fill'&&kr&&t&&kr.word().length===t.a.length)kr.type(kr.word());},0);
    function fill(){ph2='fill';say.innerHTML='';if(compact())ly='';kw.style.display='';root.classList.remove('nok');draw();
      if(!kr){kr=host.krug(kw,{letters:letters(t.a,o.rnd),min:2,onWord});
        // набрал столько букв, сколько клеточек, — проверяем сам (кнопка ✔ не нужна; на низком экране её и нет)
        kw.addEventListener('pointerup',auto);}
      else{kr.lock(false);kr.set(letters(t.a,o.rnd));}}
    function hint(){if(solved||!t||ph2==='read')return;if(hn>=hmax())return;hn++;hints++;draw();ph.textContent='подсказок: '+hints;}
    function onWord(w){if(solved)return 'dup';if(nrm(w)===nrm(t.a)){solve();return 'ok';}
      ly=LY_BAD[lbN++%LY_BAD.length];draw();return 'bad';}
    function solve(){solved=true;res[i]=hn===0?1:0;try{host.snd.word&&host.snd.word(t.a.length,0);}catch(e){}
      if(!P.ny&&P.m&&t._i+1>(P.m.r|0))P.m.r=t._i+1;
      draw();card.querySelector('.zmb-tf').classList.add('solved');kr.lock(true);kw.style.display='none';root.classList.add('nok');
      const last=i>=L.length-1;
      say.innerHTML=host.say('zina',esc(t.z||ZN_OK[okN++%ZN_OK.length]),'happy')+'<div class="zmb-tn"><button type="button" class="btn green zmb-tnb">'+(last?'Итог':'Следующая телеграмма')+(host.pc?' '+host.kc('Enter'):'')+'</button></div>';
      say.querySelector('.zmb-tnb').onclick=()=>{try{host.snd.tap();}catch(e){}next();};
      dots[i].className=res[i]?'ok':'no';}
    function next(){if(!solved)return;i++;if(i>=L.length){fin();return;}show();}
    function fin(){host.finish({sc:Math.max(3,L.length*10-3*hints),st:tierOf(hints),h:hints,label:'Телеграмм: '+L.length+(hints?' · подсказок: '+hints:' · без подсказок!')});}
    host.keys(k=>{if(k&&k.length===1&&/[а-яё]/i.test(k)&&ph2==='fill'&&!solved)auto();if(ph2==='read'&&!solved){if(k==='Enter'||k===' '){fill();return true;}return false;}if(solved){if(k==='Enter'||k===' '){next();return true;}return false;}if(k==='0'||k==='?'){hint();return true;}return false;});
    host.bot=k=>{if(!t)return;if(solved){next();return;}if(ph2==='read'){fill();return;}const r=Math.random();
      if(r<.4+.55*k){kr.type(nrm(t.a));return;}if(r<.7){hint();return;}kr.type(nrm(t.a).slice(0,2).split('').reverse().join(''));};
    host.intro({who:'lyusya',text:P.msg,btn:P.ny?'Читать!':'Читать телеграммы',
      hint:'На телеграфе платят за каждое слово — одно выпало. Собери его из букв в круге. '+(host.pc?'Печатай буквы, Enter — проверить.':'Проведи по буквам или нажимай по одной.')}).then(show);}});
(function(){if(document.getElementById('zmb-t-css'))return;const st=document.createElement('style');st.id='zmb-t-css';st.textContent=
'.zmb-t{flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-start;padding:6px 0 8px;overflow-y:auto;min-height:0}'+
'.zmb-tp{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 auto;width:calc(100% - 24px);max-width:480px;font-weight:700;font-size:15px;color:var(--ink2,#5d6781)}.zmb-tp .zmg-dots{margin:0}'+
'.zmb-tc{margin:8px auto 0;width:calc(100% - 24px);max-width:480px;flex:none}'+
'.zmb-tf{position:relative;background:#fbf4dc;border:1px solid #d9c99a;border-radius:6px;padding:10px 12px 10px;box-shadow:0 3px 10px rgba(60,50,20,.16)}'+
'.zmb-tf.solved{box-shadow:0 0 0 3px rgba(52,168,83,.55),0 3px 10px rgba(60,50,20,.16)}'+
'.zmb-tt{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#6b5a2a}'+
'.zmb-tt b{font:900 17px/1.2 var(--font,Arial);letter-spacing:3px}.zmb-ta{font-size:14.5px;font-weight:700;color:#6b5a2a;border-bottom:2px solid #c9b47c;padding:2px 0 4px;margin-bottom:4px}'+
'.zmb-tnew,.zmb-told{font:900 13px/1 var(--font,Arial);letter-spacing:1px;padding:4px 7px;border-radius:5px;transform:rotate(4deg);white-space:nowrap}'+
'.zmb-tnew{color:#e2463b;border:2px solid #e2463b;background:rgba(255,255,255,.6)}.zmb-told{color:#8b7a4a;border:1.5px dashed #b7a573}'+
'.zmb-tx{font:700 17.5px/1.75 "Courier New",Courier,monospace;color:#2b2a26;letter-spacing:.3px;padding-top:6px;word-spacing:2px}'+
'.zmb-tw{background:#fff8e2;box-shadow:0 1px 0 #e0d3a8;padding:1px 3px;border-radius:2px;white-space:nowrap}'+
'.zmb-tb{display:inline-flex;gap:3px;vertical-align:middle;white-space:nowrap}.zmb-tb i{display:inline-block;width:22px;height:27px;border:2px dashed #2f6fb5;border-radius:5px;background:#fff;font:900 18px/24px var(--font,Arial);font-style:normal;text-align:center;color:#2f6fb5}'+
'.zmb-tb i.op{border-style:solid}.zmb-tb i.ok{border:2px solid #34a853;background:#dff3e3;color:#237a3b}'+
'.zmb-th{margin-top:8px;font-weight:600;font-size:17px;line-height:1.35;color:#27324a;background:#fff;border-radius:10px;padding:6px 10px}'+
'.zmb-thb{min-height:46px;padding:4px 14px;border:2px dashed #2f6fb5;border-radius:14px;background:#eaf3ff;color:#2f6fb5;font:800 17px/1.2 var(--font,Arial);cursor:pointer;margin-left:auto}'+
'.zmb-tph{font-size:14px}.zmb-tl{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:16px;line-height:1.3;color:#27324a;}'+
'.zmb-tl svg{flex:none;width:38px;height:38px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px #fff}'+
'.zmb-tm{flex:1 1 0;min-height:0;display:flex;flex-direction:column}.zmb-t.nok .zmb-tm{flex:none}.zmb-t.nok .zmb-ts{margin-top:12px}'+
'@media (min-width:760px) and (min-aspect-ratio:1/1){.zmb-tp{max-width:860px}.zmb-tm{flex-direction:row;align-items:stretch;justify-content:center;gap:28px;padding:0 16px}.zmb-tm .zmb-tc{margin:8px 0 0;width:auto;flex:0 1 480px;align-self:flex-start}.zmb-tm .zmb-tk{flex:0 0 340px}}'+
'.zmb-tk{flex:1 1 0;min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:center}.zmb-tk .zmg-kc0,.zmb-tk .zmg-kw,.zmb-tk .zmg-kbt{flex:none}.zmb-tk .zmg-krug{flex:1 1 auto}'+
'.zmb-ts{margin:6px auto 0;width:calc(100% - 24px);max-width:480px}.zmb-ts .zmg-av{width:50px;height:50px}.zmb-ts .zmg-say{margin:0 0 6px}'+
'.zmb-tn{display:flex;justify-content:center}.zmb-tn .btn{min-height:52px;font-size:18px;padding:0 22px}'+
'@media (max-height:600px){.zmb-tk .zmg-kbt{display:none}.zmb-tf.short .zmb-tt{display:none}}'+
'@media (max-height:640px){.zmb-tx{font-size:15.5px;line-height:1.55;padding-top:2px}.zmb-tf{padding:6px 10px}.zmb-tl{margin-top:4px;font-size:15px}.zmb-tl svg{width:30px;height:30px}.zmb-th{font-size:15.5px;margin-top:4px;padding:4px 8px}}'+
'@media (max-width:340px){.zmb-tx{font-size:15.5px}.zmb-tb i{width:19px}}';
document.head.appendChild(st);})();
})();
