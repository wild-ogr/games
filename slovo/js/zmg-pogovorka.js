'use strict';
/* zb-MGA мини-игра №7 «Собери поговорку» (Нина Аркадьевна из хора). 5 поговорок за заход: Нина начинает — игрок заканчивает.
   Два вида: 1) «вставь слово» — пропуск собирается кругом букв (только если пропущенное слово — существительное словаря Зины, isWord; не больше 2 за заход);
   2) «выбери концовку» из трёх (две — шуточные переделки). После ответа — вся поговорка и что она значит.
   Очки: верно с первого раза = 1 (в круге — без «Скажи сама»). 5 — 3★, 4 — 2★, 3 — 1★. ПК: 1–3 — концовка, буквы/Enter — круг, Tab — «Скажи сама», Enter — дальше.
   Данные — js/zmg-pogovorka-data.js (ZMG_POGOV: own — свои 52 из content/texts/proverbs.json (черновик), vk — поговорки Викторины не повторяющие свои; ../MGA-tools/mkdata.py).
   Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const N=5,KRUG_MAX=2;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const nrm=w=>String(w).toLowerCase().replace(/ё/g,'е');
const tierOf=n=>n>=5?3:n>=4?2:n>=3?1:0;
const okWord=w=>{try{return typeof isWord==='function'&&isWord(nrm(w));}catch(e){return false;}};
const shuf=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;};
// [id, начало, концовка, [2 шуточные], смысл, слова?, номер пропуска?, ОТВЕТ?]
function make(o,mem){const D=window.ZMG_POGOV,own=D.own||[],vk=D.vk||[],last=String(mem.r||'').split(',');
  const fresh=a=>{const f=a.filter(x=>last.indexOf(x[0])<0);return f.length>=N?f:a;};
  const gapOk=x=>x[7]&&x[5]&&x[6]>=0&&okWord(x[7])&&x[7].length>=3&&x[7].length<=8;
  const G=shuf(fresh(own.filter(gapOk)),o.rnd).slice(0,KRUG_MAX),used={};G.forEach(x=>used[x[0]]=1);
  const E=shuf(fresh(own.filter(x=>!used[x[0]])).slice(0,8).concat(fresh(vk).slice(0,0)),o.rnd);
  const V=shuf(fresh(vk),o.rnd),out=[];let ie=0,iv=0,ig=0;
  for(let i=0;i<N;i++){if((i===1||i===3)&&ig<G.length){out.push({x:G[ig++],kind:'krug'});continue;}
    const x=(o.rnd()<.5&&ie<E.length)||iv>=V.length?E[ie++]:V[iv++];if(x)out.push({x,kind:'end'});}
  try{mem.r=last.concat(out.map(q=>q.x[0])).filter(Boolean).slice(-40).join(',');}catch(e){}
  return out;}
ZMG_REG({id:'pogovorka',deps:['krug','js/zmg-pogovorka-data.js'],
  open:()=>true,
  lines:{good:'Все поговорки знаешь — приходи к нам в хор, будешь подсказывать!',ok:'Хорошо поёшь… то есть отвечаешь!',bad:'Ничего, поговорки — дело наживное. Завтра ещё попоём.'},
  sim(o,k){let n=0;for(let i=0;i<N;i++)if(o.rnd()<.45+.5*k)n++;return {sc:n,st:tierOf(n)};},
  run(host,o){const D=window.ZMG_POGOV;if(!D||!D.own){host.quit();return;}
    const Q=make(o,host.mem());if(!Q.length){host.quit();return;}
    let i=0,sc=0,lock=false,fin=false,K=null,open=0,opts=[],hints=0;const res=[];const fest=host.fest&&host.fest.id;
    host.el.innerHTML='<div class="zma-wrap'+(fest?' zma-'+esc(fest):'')+'"><div class="zma-pg-say"></div><div class="zmg-dots">'+Q.map(()=>'<i></i>').join('')+'</div>'+
      '<div class="zma-pg-body"></div><div class="zma-pg-out"></div></div>';
    const $=s=>host.el.querySelector(s),say=$('.zma-pg-say'),body=$('.zma-pg-body'),out=$('.zma-pg-out'),dots=[].slice.call(host.el.querySelectorAll('.zmg-dots i'));
    function full(q){const x=q.x;return x[1]+' '+x[2];}
    function gapHtml(q,shown){const x=q.x,a=x[7];let b='';
      for(let j=0;j<a.length;j++)b+='<b class="'+(shown?'ok':j<open?'h':'')+'">'+(shown||j<open?esc(a[j]):'')+'</b>';
      const box='<span class="zma-pg-gap">'+b+'</span>';let k=-1;
      // слова с пунктуацией из полного текста: k-й «буквенный» кусок = words[k]
      return full(q).split(' ').map(t=>{if(!/[а-яё]/i.test(t))return esc(t);k++;if(k!==x[6])return esc(t);
        const m=t.match(/^([^а-яё]*)([а-яё-]+)(.*)$/i);return m?esc(m[1])+box+esc(m[3]):box;}).join(' ');}
    function show(){const q=Q[i];if(!q){end();return;}lock=false;open=0;host.top((i+1)+' из '+Q.length);dots.forEach((d,k)=>{if(k===i)d.className='cur';});out.innerHTML='';
      if(q.kind==='krug'){say.innerHTML=host.say('nina','<span class="zma-pg-t">'+gapHtml(q)+'</span>','norm');
        body.innerHTML='<div class="zma-kr"></div><div class="zma-row"><button class="btn zma-pg-h">💡 Буква</button><button class="btn sec zma-pg-s">Подскажите'+(host.pc?' '+host.kc('Tab'):'')+'</button></div>';
        K=host.krug(body.querySelector('.zma-kr'),{letters:q.x[7],onWord:w=>{if(lock)return 'bad';if(nrm(w)===nrm(q.x[7])){done(true);return 'ok';}return 'bad';},min:2});
        body.querySelector('.zma-pg-h').onclick=()=>{try{host.snd.tap();}catch(e){}hint();};body.querySelector('.zma-pg-s').onclick=()=>{try{host.snd.tap();}catch(e){}if(!lock)done(false);};}
      else{K=null;say.innerHTML=host.say('nina','<span class="zma-pg-t">'+esc(q.x[1])+' <span class="zma-pg-dots">…</span></span>','norm');
        opts=shuf([q.x[2]].concat(q.x[3].slice(0,2)),o.rnd);
        body.innerHTML='<div class="zma-pg-opts">'+opts.map((t,k)=>'<button class="zma-pg-o" data-k="'+k+'">'+(host.pc?host.kc(k+1):'')+'<span>…'+esc(t)+'</span></button>').join('')+'</div>';
        [].forEach.call(body.querySelectorAll('.zma-pg-o'),b=>b.onclick=()=>choose(+b.dataset.k));}}
    function hint(){const q=Q[i];if(lock||!q||q.kind!=='krug')return;if(open>=q.x[7].length-1){done(false);return;}open++;hints++;
      say.innerHTML=host.say('nina','<span class="zma-pg-t">'+gapHtml(q)+'</span>','norm');}
    function choose(k){const q=Q[i];if(lock||!q)return;const ok=opts[k]===q.x[2];
      [].forEach.call(body.querySelectorAll('.zma-pg-o'),(b,j)=>{b.disabled=true;if(opts[j]===q.x[2])b.classList.add('ok');else if(j===k)b.classList.add('no');});done(ok);}
    function done(ok){const q=Q[i];lock=true;res[i]=ok;if(ok)sc++;dots[i].className=ok?'ok':'no';
      try{ok?host.snd.word&&host.snd.word(5,i):host.snd.old&&host.snd.old();}catch(e){}
      if(q.kind==='krug'){try{K&&K.destroy();}catch(e){}K=null;body.innerHTML='';say.innerHTML=host.say('nina','<span class="zma-pg-t">'+gapHtml(q,true)+'</span>',ok?'happy':'norm');}
      const last=i>=Q.length-1;
      out.innerHTML='<div class="zma-pg-full'+(ok?' ok':'')+'">«'+esc(full(q))+'»</div>'+host.say('zina',esc(q.x[4]),'happy')+
        '<button class="btn green zma-pg-nx">'+(last?'Итоги':'Дальше ▸')+(host.pc?' '+host.kc('Enter'):'')+'</button>';
      out.querySelector('.zma-pg-nx').onclick=next;try{out.querySelector('.zma-pg-nx').scrollIntoView({block:'nearest'});}catch(e){}}
    function next(){if(!lock||fin)return;try{host.snd.tap();}catch(e){}i++;show();}
    function end(){if(fin)return;fin=true;host.finish({sc,st:tierOf(sc),h:hints+Q.length-sc,label:sc+' из '+Q.length+' поговорок'});}
    host.keys(k=>{if(lock&&(k==='Enter'||k===' ')){next();return true;}const q=Q[i];if(!q||lock)return false;
      if(q.kind==='end'){const j={'1':0,'2':1,'3':2}[k];if(j!=null){choose(j);return true;}return false;}
      if(k==='Tab'){done(false);return true;}return false;});
    host.onQuit(()=>{fin=true;});
    host.bot=k=>{const q=Q[i];if(!q)return;if(lock){next();return;}const r=Math.random();
      if(q.kind==='end'){const right=opts.indexOf(q.x[2]);choose(r<k?right:(right+1)%3);return;}
      if(r<k)K.type(nrm(q.x[7]));else if(r<k+.1)hint();else done(false);};
    host.intro({who:'nina',text:'Мы в хоре без поговорок ни шагу! Я начинаю — <b>вы заканчиваете</b>. Где слово выпало — соберите из букв, где концовка — выберите верную.',
      btn:'Запевай!',hint:'5 поговорок · ~45 секунд · ошибки не страшны'}).then(show);}});
(function(){if(document.getElementById('zma-pg-css'))return;const st=document.createElement('style');st.id='zma-pg-css';st.textContent=
'.zma-pg-say,.zma-pg-body,.zma-pg-out{margin:0 auto;width:calc(100% - 24px);max-width:500px}'+
'.zma-pg-body{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}'+
'.zma-pg-t{display:block;font-size:20px;font-weight:700;line-height:1.45}.zma-pg-dots{color:var(--blue,#1d4fa3)}'+
'.zma-pg-gap{display:inline-flex;gap:2px;vertical-align:middle}.zma-pg-gap b{width:22px;height:28px;border-radius:6px;background:var(--blue3,#dbe7fb);display:inline-flex;align-items:center;justify-content:center;font:900 17px/1 var(--font,Arial);color:var(--blue,#1d4fa3)}'+
'.zma-pg-gap b.h{background:var(--gold3,#fff2cc)}.zma-pg-gap b.ok{background:#dff3e3;color:var(--green2,#237a3b)}'+
'.zma-pg-opts{display:flex;flex-direction:column;gap:10px;margin-top:6px}'+
'.zma-pg-o{position:relative;border:0;font:inherit;cursor:pointer;min-height:58px;padding:10px 14px;border-radius:16px;background:#fff;box-shadow:0 4px 0 var(--edge,#d5d9e3);text-align:left;font-size:19px;font-weight:700;color:var(--ink,#27324a);line-height:1.3}'+
'.zma-pg-o .zmg-kc{margin-right:8px}.zma-pg-o:active{transform:translateY(2px)}.zma-pg-o[disabled]{cursor:default}'+
'.zma-pg-o.ok{background:#dff3e3;box-shadow:0 4px 0 var(--green,#34a853)}.zma-pg-o.no{background:#fde3e1;box-shadow:0 4px 0 var(--red,#e2463b)}'+
'.zma-pg-full{font-size:18px;font-weight:800;text-align:center;margin:10px 0 8px;color:var(--ink,#27324a)}.zma-pg-full.ok{color:var(--green2,#237a3b)}'+
'.zma-pg-out .zmg-av{width:50px;height:50px}.zma-pg-nx{width:100%;min-height:52px;font-size:19px;margin:4px 0 0}'+
'@media (max-height:620px){.zma-pg-t{font-size:18px}.zma-pg-o{min-height:52px;font-size:17px;padding:8px 12px}}';
document.head.appendChild(st);})();
// общие стили игр MGA (одинаковые в каждом файле — грузится любая первой)
(function(){if(document.getElementById('zma-css'))return;const st=document.createElement('style');st.id='zma-css';st.textContent=
'.zma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:8px 0 10px;min-height:0;overflow-y:auto}'+
'.zma-kr{flex:1 1 auto;min-height:250px;display:flex;align-items:center;justify-content:center}'+
'.zma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 24px);max-width:480px}.zma-row .btn{flex:1 1 0;min-height:50px;font-size:17px;margin:0}'+
'@media (max-height:620px){.zma-kr{min-height:210px}}';document.head.appendChild(st);})();
})();
