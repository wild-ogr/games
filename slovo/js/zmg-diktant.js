'use strict';
/* zb-MG0 мини-игра №1 «Диктант Валерки» (образец для MGA–MGC). Валерка написал диктант — игрок выбирает верную букву (или слово) из двух больших кнопок.
   10 фраз, ~30 с, ошибка не наказывает: Валерка оправдывается, Зина объясняет правило. В конце — «Садись, пять!» красной ручкой.
   Данные — js/zmg-diktant-data.js (ZMG_DIKTANT, из content/texts/dictation.json — черновик до вычитки владельца). Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const N=10,WORDS_MAX=2;   // фраз в заходе; из них «слово целиком» — не больше двух (они длиннее)
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const DATE=['первое','второе','третье','четвёртое','пятое','шестое','седьмое','восьмое','девятое','десятое','одиннадцатое','двенадцатое','тринадцатое','четырнадцатое','пятнадцатое',
  'шестнадцатое','семнадцатое','восемнадцатое','девятнадцатое','двадцатое','двадцать первое','двадцать второе','двадцать третье','двадцать четвёртое','двадцать пятое',
  'двадцать шестое','двадцать седьмое','двадцать восьмое','двадцать девятое','тридцатое','тридцать первое'];
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dateTxt(day){const d=day%100,m=Math.floor(day/100)%100;const s=(DATE[d-1]||'')+' '+(MON[m-1]||'');return s.charAt(0).toUpperCase()+s.slice(1);}
// выбрать 10 фраз по зерну: слов целиком — не больше WORDS_MAX
function pick(rnd){const D=window.ZMG_DIKTANT,L=D.items.slice();for(let i=L.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=L[i];L[i]=L[j];L[j]=t;}
  const out=[];let w=0;for(const it of L){if(out.length>=N)break;if(it.kind==='word'){if(w>=WORDS_MAX)continue;w++;}out.push(it);}return out;}
const tierOf=n=>n>=10?3:n>=8?2:n>=6?1:0;
ZMG_REG({id:'diktant',finWho:'zina',deps:['js/zmg-diktant-data.js'],
  open:()=>true,
  lines:{good:'Садись, пять! Валерка, бери пример.',ok:'Четвёрка с минусом — Валерка и на тройку не написал!',bad:'Ничего! Валерка вон вообще «карова» пишет. Завтра получится.'},
  sim(o,k){let n=0;for(let i=0;i<N;i++)if(o.rnd()<.55+.45*k)n++;return {sc:n,st:tierOf(n)};},
  run(host,o){const D=window.ZMG_DIKTANT;if(!D||!D.items||!D.items.length){host.quit();return;}
    const L=pick(o.rnd),res=[];let i=0,busy=false,timer=0,okN=0,ooN=0;
    const fest=host.fest&&host.fest.id;
    host.el.innerHTML='<div class="zm0-wrap"><div class="zm0-sheet'+(fest?' zm0-'+esc(fest):'')+'"><div class="zm0-date zmg-red"></div><div class="zm0-ttl">Диктант</div>'+
      '<div class="zm0-line"></div><div class="zm0-fix"></div></div>'+
      '<div class="zmg-dots">'+L.map(()=>'<i></i>').join('')+'</div>'+
      '<div class="zmg-opts zm0-opts"><button class="zmg-opt" data-i="0"></button><button class="zmg-opt" data-i="1"></button></div>'+
      '<div class="zm0-say"></div>'+(host.pc?'<p class="zmg-hint zm0-kh">на компьютере: '+host.kc('1')+' / '+host.kc('2')+' или '+host.kc('←')+' '+host.kc('→')+', дальше — '+host.kc('Enter')+'</p>':'')+'</div>';
    const $=s=>host.el.querySelector(s),line=$('.zm0-line'),fix=$('.zm0-fix'),say=$('.zm0-say'),btns=[].slice.call(host.el.querySelectorAll('.zm0-opts .zmg-opt')),dots=[].slice.call(host.el.querySelectorAll('.zmg-dots i'));
    $('.zm0-date').textContent=dateTxt(o.day);
    let ans=['',''],cur=null;
    function show(){cur=L[i];busy=false;const sw=o.rnd()<.5;ans=sw?[cur.wrong,cur.answer]:[cur.answer,cur.wrong];
      const parts=cur.text.split('_');line.innerHTML=esc(parts[0])+'<span class="zm0-gap'+(cur.kind==='word'?' w':'')+'">?</span>'+esc(parts[1]);
      fix.innerHTML='';say.innerHTML='';btns.forEach((b,k)=>{b.className='zmg-opt'+(cur.kind==='word'?' w':'');b.textContent=ans[k];b.disabled=false;});
      dots.forEach((d,k)=>d.className=k<i?(res[k]?'ok':'no'):k===i?'cur':'');host.top((i+1)+' из '+L.length);}
    function choose(k){if(busy||!cur)return;busy=true;const right=ans[k]===cur.answer,gap=$('.zm0-gap');res[i]=right;
      try{right?host.snd.word&&host.snd.word(3,0):host.snd.bad&&host.snd.bad();}catch(e){}
      btns.forEach((b,j)=>{b.disabled=true;if(ans[j]===cur.answer)b.classList.add('ok');else if(j===k)b.classList.add('no');});
      if(gap){gap.textContent=cur.answer;gap.classList.add(right?'ok':'no');}
      if(right){say.innerHTML=host.say('zina',esc(D.ok[okN++%D.ok.length]),'happy');}
      else{fix.innerHTML='<span class="zmg-red">Верно: «'+esc(cur.answer)+'».</span> '+esc(cur.rule||'');
        say.innerHTML=host.say('valerka',esc(D.oops[ooN++%D.oops.length]),'sad');}
      dots[i].className=right?'ok':'no';
      timer=setTimeout(next,right?(host.calm?1300:950):(host.calm?3200:2600));}
    function next(){clearTimeout(timer);timer=0;if(!busy)return;i++;if(i>=L.length){end();return;}show();}
    function end(){const n=res.filter(Boolean).length;host.finish({sc:n,st:tierOf(n),h:L.length-n,label:n+' из '+L.length+' верно'});}
    btns.forEach((b,k)=>b.onclick=()=>{try{host.snd.tap();}catch(e){}choose(k);});
    // нажатие по листку после ответа — дальше, не дожидаясь паузы
    host.el.querySelector('.zm0-sheet').onclick=()=>{if(busy&&timer)next();};
    host.keys(k=>{if(k==='1'||k==='ArrowLeft'){if(busy){if(timer)next();return true;}choose(0);return true;}
      if(k==='2'||k==='ArrowRight'){if(busy){if(timer)next();return true;}choose(1);return true;}
      if((k==='Enter'||k===' ')&&busy&&timer){next();return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);timer=0;});
    // бот стенда: k — доля верных ответов
    host.bot=k=>{if(!cur)return;if(busy){if(timer)next();return;}const ok=Math.random()<k;choose(ans[0]===cur.answer?(ok?0:1):(ok?1:0));};
    host.intro({who:'valerka',text:window.ZMG_HOSTS?'':'Я диктант написал! Баба Зина проверяет красной ручкой. Поможешь найти, где я ошибся? <b>Выбирай верную букву.</b>',
      btn:'Проверить диктант',hint:'10 предложений · ~30 секунд · ошибки не страшны'}).then(show);}});
// стили игры (свои, с префиксом zm0-)
(function(){if(document.getElementById('zm0-css'))return;const st=document.createElement('style');st.id='zm0-css';st.textContent=
'.zm0-wrap{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;padding:8px 0 10px;overflow-y:auto}'+
'.zm0-sheet{position:relative;margin:0 auto;width:calc(100% - 24px);max-width:460px;box-sizing:border-box;background:#fff;border-radius:6px 18px 18px 6px;padding:12px 14px 14px 40px;'+
'box-shadow:var(--shadow);background-image:linear-gradient(90deg,transparent 30px,var(--margin,#f0b3ad) 30px,var(--margin,#f0b3ad) 32px,transparent 32px),repeating-linear-gradient(transparent 0,transparent 29px,var(--line,#dfe8f2) 29px,var(--line,#dfe8f2) 30px);cursor:default}'+
'.zm0-date{text-align:right;font-size:15px}.zm0-ttl{text-align:center;font-weight:800;font-size:17px;color:var(--ink2,#5d6781);margin:2px 0 6px}'+
'.zm0-line{font-size:22px;line-height:1.5;font-weight:700;min-height:66px;font-family:"Comic Sans MS","Segoe Print","Trebuchet MS",cursive}'+
'.zm0-gap{display:inline-block;min-width:26px;padding:0 4px;margin:0 1px;border-bottom:3px solid var(--blue,#1d4fa3);color:var(--blue,#1d4fa3);text-align:center;border-radius:4px;background:var(--blue3,#dbe7fb)}'+
'.zm0-gap.w{min-width:56px}.zm0-gap.ok{background:#dff3e3;border-color:var(--green,#34a853);color:var(--green2,#237a3b)}'+
'.zm0-gap.no{background:#fde3e1;border-color:var(--red,#e2463b);color:var(--red2,#d0342c)}'+
'.zm0-fix{min-height:22px;font-size:15px;line-height:1.35;margin-top:4px}'+
'.zm0-opts .zmg-opt{font-size:34px;min-height:76px;max-width:180px}.zm0-opts .zmg-opt.w{font-size:24px}'+
'.zm0-say{min-height:70px;margin:2px auto 0;width:calc(100% - 24px);max-width:460px}.zm0-say .zmg-av{width:52px;height:52px}'+
'.zm0-kh{text-align:center;margin:4px 0 0}'+
'.zm0-halloween{background-color:#fff8ef}.zm0-ny{background-color:#f4fbff}'+
'@media (max-height:600px){.zm0-line{font-size:19px;min-height:56px}.zm0-opts .zmg-opt{min-height:60px;font-size:28px}.zm0-say{min-height:58px}}';
document.head.appendChild(st);})();
})();
