'use strict';
/* zb-MGA мини-игра №6 «Что лишнее?» (ведёт Зина). Перенос vmg-lishnee Викторины: 6 наборов по 4 слова — одно не из той компании;
   после ответа — что объединяет остальных и почему лишнее лишнее (с шуткой Зины). Без таймера. 6/6 — 3★, 5 — 2★, 3–4 — 1★.
   ПК: 1–4 — выбрать, Enter/Пробел — дальше. Затея дня ('day') — одни наборы у всех (по зерну дня); иначе — свой круг (host.mem().k), повтор — после всего банка.
   Данные — js/zmg-lishnee-data.js (ZMG_LISHNEE.s = [[тема,[4 слова],лишнее,что объединяет,почему]]; свои наборы Зины + наборы Викторины, где все слова — в словаре Зины;
   генерирует ../MGA-tools/mkdata.py из MGA-tools/lishnee-zina.txt). Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const N=6,TH=[3,5,6];
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const tierOf=n=>n>=TH[2]?3:n>=TH[1]?2:n>=TH[0]?1:0;
const HI=['Какое слово тут лишнее?','Найди, кто не из этой компании.','Одно слово сюда случайно затесалось. Какое?','Тут один чужой. Кто?','Ну-ка, что здесь лишнее?','Последний набор! Какое слово лишнее?'];
const OK=['Верно, милок!','Глаз-алмаз!','Вот это я понимаю!','Точно так!','Умница!','Ай, молодец!'];
const NO=['Ох, нет… Бывает.','Не угадал — не беда.','Мимо, голубчик. Смотри, в чём дело.'];
function perm(n,seed){const a=[];for(let i=0;i<n;i++)a.push(i);let s=seed>>>0;const r=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
function make(o,mem){const B=(window.ZMG_LISHNEE&&ZMG_LISHNEE.s||[]).filter(s=>s&&s[1]&&s[1].length===4),L=B.length;if(!L)return [];
  const P=perm(L,0x5a1e);let st;
  if(o.mode==='day'){const d=String(o.day||0);st=(+d.slice(0,4)*372+(+d.slice(4,6))*31+(+d.slice(6,8)))*N%L;}
  else{st=mem&&mem.k>=0?mem.k|0:Math.floor(o.rnd()*L);if(mem)mem.k=(st+N)%L;}
  const out=[];for(let i=0;out.length<N&&i<L;i++){const s=B[P[(st+i)%L]];const ord=perm(4,(o.seed||1)+i*7919);
    out.push({w:ord.map(k=>s[1][k]),o:ord.indexOf(s[2]),g:s[3],x:s[4]});}
  return out;}
ZMG_REG({id:'lishnee',deps:['js/zmg-lishnee-data.js'],
  open:()=>true,
  lines:{good:'Всё лишнее нашёл! Глаз-алмаз, как у завуча.',ok:'Почти все чужаки пойманы!',bad:'Ничего, компании бывают хитрые. Завтра ещё сыграем.'},
  sim(o,k){let s=0;const p=Math.min(.97,.4+k*.55);for(let i=0;i<N;i++)if(o.rnd()<p)s++;return {sc:s,st:tierOf(s)};},
  run(host,o){const Q=make(o,host.mem());if(!Q.length){host.quit();return;}
    let i=0,sc=0,lock=false,fin=false;const fest=host.fest&&host.fest.id;
    host.el.innerHTML='<div class="zma-wrap'+(fest?' zma-'+esc(fest):'')+'"><div class="zma-ls-say"></div><div class="zmg-dots">'+Q.map(()=>'<i></i>').join('')+'</div>'+
      '<div class="zma-ls-grid"></div><div class="zma-ls-out"></div></div>';
    const $=s=>host.el.querySelector(s),say=$('.zma-ls-say'),grid=$('.zma-ls-grid'),out=$('.zma-ls-out'),dots=[].slice.call(host.el.querySelectorAll('.zmg-dots i'));
    function show(){const q=Q[i];if(!q){end();return;}lock=false;host.top((i+1)+' из '+Q.length);
      dots.forEach((d,k)=>{if(k===i)d.className='cur';});
      say.innerHTML=host.say('zina',esc(HI[i===Q.length-1?5:i%5]),'norm');out.innerHTML='';
      grid.innerHTML=q.w.map((w,k)=>'<button class="zma-ls-w" data-k="'+k+'">'+(host.pc?host.kc(k+1):'')+'<span>'+esc(w)+'</span></button>').join('');
      [].forEach.call(grid.querySelectorAll('.zma-ls-w'),b=>b.onclick=()=>pick(+b.dataset.k));}
    function pick(k){const q=Q[i];if(lock||!q)return;lock=true;const ok=k===q.o;if(ok)sc++;
      const bs=[].slice.call(grid.querySelectorAll('.zma-ls-w'));bs.forEach((b,j)=>{b.disabled=true;if(j===q.o){b.classList.add('odd');b.insertAdjacentHTML('beforeend','<i class="zma-ls-st">ЛИШНЕЕ</i>');}else b.classList.add('same');});
      if(!ok){bs[k].classList.remove('same');bs[k].classList.add('miss');}
      dots[i].className=ok?'ok':'no';try{ok?host.snd.word&&host.snd.word(4,0):host.snd.bad&&host.snd.bad();}catch(e){}
      say.innerHTML=host.say('zina',esc(ok?OK[i%OK.length]:NO[i%NO.length]),ok?'happy':'sad');
      const last=i>=Q.length-1;
      out.innerHTML='<div class="zma-ls-g">Остальные: '+esc(q.g)+'</div><div class="zma-ls-x"><b>Лишнее — «'+esc(q.w[q.o])+'».</b> '+esc(q.x)+'</div>'+
        '<button class="btn green zma-ls-nx">'+(last?'Итоги':'Дальше ▸')+(host.pc?' '+host.kc('Enter'):'')+'</button>';
      out.querySelector('.zma-ls-nx').onclick=next;try{out.querySelector('.zma-ls-nx').scrollIntoView({block:'nearest'});}catch(e){}}
    function next(){if(!lock)return;try{host.snd.tap();}catch(e){}i++;show();}
    function end(){if(fin)return;fin=true;host.finish({sc,st:tierOf(sc),h:Q.length-sc,label:sc+' из '+Q.length+' — верно'});}
    host.keys(k=>{if((k==='Enter'||k===' ')&&lock){next();return true;}const j={'1':0,'2':1,'3':2,'4':3}[k];if(j==null||lock)return false;pick(j);return true;});
    host.onQuit(()=>{fin=true;});
    host.bot=k=>{const q=Q[i];if(!q)return;if(lock){next();return;}pick(Math.random()<k?q.o:(q.o+1)%4);};
    host.intro({who:'zina',text:'Четыре слова — а одно затесалось не в ту компанию, как Валерка на родительское собрание. <b>Найди лишнее!</b>',
      btn:'Найти лишнее',hint:'6 наборов · ~40 секунд · ошибки не страшны'}).then(show);}});
(function(){if(document.getElementById('zma-ls-css'))return;const st=document.createElement('style');st.id='zma-ls-css';st.textContent=
'.zma-ls-say,.zma-ls-grid,.zma-ls-out{margin:0 auto;width:calc(100% - 24px);max-width:480px}'+
'.zma-ls-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px}'+
'.zma-ls-w{position:relative;border:0;font:inherit;cursor:pointer;min-height:84px;padding:12px 10px;border-radius:18px;background:#fff;box-shadow:0 5px 0 var(--edge,#d5d9e3);'+
'display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:21px;line-height:1.15;color:var(--ink,#27324a);word-break:break-word}'+
'.zma-ls-w:active{transform:translateY(3px);box-shadow:0 2px 0 var(--edge,#d5d9e3)}.zma-ls-w .zmg-kc{position:absolute;left:8px;top:8px}'+
'.zma-ls-w[disabled]{cursor:default}.zma-ls-w.same{background:#e3f7e8;color:var(--green2,#237a3b);box-shadow:0 5px 0 var(--green,#34a853)}'+
'.zma-ls-w.odd{background:#fff1d6}.zma-ls-w.miss{background:#fde6e4;box-shadow:0 5px 0 var(--red,#e2463b)}'+
'.zma-ls-st{position:absolute;right:-6px;top:-10px;padding:3px 8px;border:3px solid #c62828;border-radius:8px;color:#c62828;background:rgba(255,255,255,.92);font:900 14px/1 var(--font,Arial);font-style:normal;transform:rotate(9deg)}'+
'.zma-ls-g{font-weight:800;font-size:17px;color:var(--green2,#237a3b);margin:12px 0 4px}'+
'.zma-ls-x{background:#fff;border-radius:14px;padding:10px 12px;font-size:17px;line-height:1.35;box-shadow:var(--shadow)}'+
'.zma-ls-nx{width:100%;min-height:52px;font-size:19px;margin:10px 0 0}'+
'@media (max-width:370px){.zma-ls-grid{gap:9px}.zma-ls-w{font-size:19px;min-height:70px}}'+
'@media (min-width:760px) and (min-height:560px){.zma-ls-w{min-height:100px;font-size:24px}.zma-ls-grid{gap:16px}}';
document.head.appendChild(st);})();
// общие стили игр MGA (одинаковые в каждом файле — грузится любая первой)
(function(){if(document.getElementById('zma-css'))return;const st=document.createElement('style');st.id='zma-css';st.textContent=
'.zma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:8px 0 10px;min-height:0;overflow-y:auto}'+
'.zma-kr{flex:1 1 auto;min-height:250px;display:flex;align-items:center;justify-content:center}'+
'.zma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 24px);max-width:480px}.zma-row .btn{flex:1 1 0;min-height:50px;font-size:17px;margin:0}'+
'@media (max-height:620px){.zma-kr{min-height:210px}}';document.head.appendChild(st);})();
})();
