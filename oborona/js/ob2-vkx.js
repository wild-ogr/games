'use strict';
/* ob2-vkx (поток VKT, буст_в2.0) — грузится через 1,5 с после старта из js/ob2-vkt.js (флаг stx). Только статистика, игру не меняет:
   sz {sz — тыс. знаков сохранения, o2 — знаков во всех S.o2*, mx/mv — самое большое поле} раз за загрузку;
   cloud {a:'big', n — кусков} — сохранение больше 48 кусков облака VK (80 % предела 60, дальше облако молча перестаёт писаться) — раз за сеанс;
   tut {s:6} — новичок (до 1-й победы) открыл кольцо выбора заставы, {s:7, c — монет} — «не хватает монет» на постройку; {s:8, id} — нажал пункт кольца (BK-OB 24.10); по разу за бой (бэклог Б4).
   Ещё: чинит S.o2v (только числа и наборы {id:1}); вход в письмо воеводе (флаг mail, поле S.o2w): строка в ⚙ («Об игре») и окне победы → окно js/ob2-mail.js (OB2.need). */
(function(){if(typeof OB2==='undefined'||window.OB2VKX)return;window.OB2VKX=1;
  const st=(n,p)=>{try{STAT.ev(n,p);}catch(e){}},n=x=>Math.max(0,Math.floor(+x||0));let big=0;
  const v=S.o2v;if(v&&typeof v==='object')for(const k in v){const x=v[k];
    if(x&&typeof x==='object'&&!Array.isArray(x)){for(const i in x)if(!/^[\w-]{1,16}$/.test(i))delete x[i];else x[i]=1;}
    else if(!/^[a-z0-9]{1,3}$/.test(k))delete v[k];else v[k]=Math.max(0,Math.floor(+x||0));}
  function sz(first){try{const j=JSON.stringify(S),z=OB2.size();let o2=0,mx='',mv=0;for(const k in z){o2+=z[k];if(z[k]>mv){mv=z[k];mx=k;}}
    if(first)st('sz',{sz:Math.round(j.length/100)/10,o2:o2,mx:mx,mv:mv});
    const ch=Math.ceil(j.length/1000);if(!big&&ch>48){big=1;st('cloud',{a:'big',n:ch});}}catch(e){}}
  if(!OB2.off('stx')){sz(true);setInterval(()=>{if(!document.hidden)sz(false);},10*60e3);
  const ro=window.openRing,tb=window.tryBuild;
  if(typeof ro==='function')window.openRing=function(){try{if(G&&!S.wins&&!G.vkR){G.vkR=1;st('tut',{s:6});}}catch(e){}return ro.apply(this,arguments);};
  const rt=window.ringTap;   // BK-OB 24.10: tut {s:8, id — пункт кольца} — новичок нажал пункт в кольце (между «открыл кольцо» s:6 и «построил» s:2), раз за бой
  if(typeof rt==='function')window.ringTap=function(id){try{if(G&&!S.wins&&!G.vkP){G.vkP=1;st('tut',{s:8,id:String(id).slice(0,12)});}}catch(e){}return rt.apply(this,arguments);};
  if(typeof tb==='function')window.tryBuild=function(i,ty){const r=tb.apply(this,arguments);
    try{if(!r&&G&&!S.wins&&!G.vkM&&!G.tw[i]&&G.coins<buildCost(ty)){G.vkM=1;st('tut',{s:7,c:Math.floor(G.coins)});}}catch(e){}return r;};}
  if(OB2.off('mail'))return;
  // LTG-OB 24.10: даты письма — в сохранении S.o2w {w — день показа в победе, d — день отправки, n — писем} (облако, слияние — максимум);
  // старое localStorage['oborona-o2mail'] подхватываем (максимум). Старое сохранение без поля чинит FIX → {w:0,d:0,n:0}.
  const LK='oborona-o2mail',WK=['w','d','n'],day=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5),
    fx=v=>{for(const k of WK)v[k]=n(v[k]);for(const k in v)if(WK.indexOf(k)<0)delete v[k];};
  OB2.field('w',{id:'mail',def:()=>({w:0,d:0,n:0}),fix:fx,merge:(a,b)=>{for(const k of WK)a[k]=Math.max(n(a[k]),n(b[k]));}});
  const W=()=>{let v=S.o2w;if(!v||typeof v!=='object'||Array.isArray(v))v=S.o2w={w:0,d:0,n:0};return v;};
  try{const o=JSON.parse(localStorage.getItem(LK)||'{}')||{},v=W();for(const k of WK)if(n(o[k])>n(v[k]))v[k]=n(o[k]);}catch(e){}
  const mem=(k,x)=>{const v=W();if(x!==undefined){v[k]=n(x);try{save();}catch(e){}}return n(v[k]);},
    M=window.OB2MAIL={day:day,mem:mem,st:(a,f,x)=>{try{STAT.ev('mail',Object.assign({a:a,f:f,l:n(S.wins)},x||{}));}catch(e){}},
      need:()=>OB2.need('js/ob2-mail.js').catch(e=>{try{toast(Lg('Письмо не открылось — проверь интернет','The letter did not open — check your connection'));}catch(x){}throw e;}),
      go:(f,back)=>M.need().then(()=>M.open(f,back),()=>{})};
  // «Об игре» — в ⚙ сразу под строкой «Тридевятая оборона…» (раньше — в самом низу под покупками, ниже сгиба). f:'about' — как у Зины
  const os=window.openSettings;
  if(typeof os==='function')window.openSettings=function(){const r=os.apply(this,arguments);try{const mb=$('mBody'),bt=mb.querySelector('.btns');if(bt&&!$('o2Mail')){
    const b=document.createElement('button');b.className='btn ghost';b.id='o2Mail';b.style.cssText='width:100%;margin-top:8px;justify-content:center;min-height:48px;flex-direction:column;line-height:1.2';
    b.innerHTML='<span>'+Lg('✉️ Написать воеводе Потапу ›','✉️ Write to Commander Potap ›')+'</span><small style="font-weight:400;font-size:13.5px;opacity:.85">'+Lg('похвалить, поругать, подсказать — он читает','praise, grumble, suggest — he reads it all')+'</small>';
    const ab=[].slice.call(mb.querySelectorAll('p.sub')).filter(p=>p.style.marginTop==='12px').pop();
    if(ab&&ab.parentNode===mb)mb.insertBefore(b,ab.nextSibling);else mb.insertBefore(b,bt);
    b.onclick=()=>{SND.click();M.go('about',()=>window.openSettings());};fitModal();}}catch(e){}return r;};
  // окно победы кампании: раз в 7 дней, с 15-й победы; низкий prio — уступает строкам других потоков.
  // Показ в счёт, только если строку видно через 1,5 с (окно дополняют позже — соц-строка, кубок, слава; fitModal мог её спрятать) — тогда и неделя не тратится.
  // Нажал — письмо поверх, «Не сейчас»/«Так точно» возвращают ТО ЖЕ окно победы (узлы переносим, как tourWinBind) — «Дальше» и награды не теряются.
  const seen=e=>{try{if(!e||!e.isConnected||!e.offsetParent||!$('modal').classList.contains('on'))return false;
    for(let x=e;x&&x!==document.body;x=x.parentElement)if(x.style&&x.style.display==='none')return false;
    const r=e.getBoundingClientRect(),m=$('mBody').getBoundingClientRect();return r.height>0&&r.top>=m.top-2&&r.bottom<=Math.min(m.bottom,innerHeight)+2;}catch(x){return false;}};
  OB2.slot('win','mail',(g,win)=>{if(!win||!g||g.endless||g.wk||g.dly||n(S.wins)<15)return null;const d=day();if(d-mem('w')<7||d-mem('d')<7)return null;
    return {h:'<button class="btn ghost" id="o2MailW" style="width:100%;justify-content:center;min-height:48px;font-weight:700">'+Lg('✉️ Напиши воеводе Потапу пару слов','✉️ Drop Commander Potap a line')+'</button>',
      bind:el=>{el.setAttribute('data-fit','4');let cnt=0;const b=el.querySelector('#o2MailW');
        setTimeout(()=>{if(!cnt&&seen(b)){cnt=1;mem('w',d);M.st('show','win');}},1500);
        b.onclick=()=>{SND.click();if(!cnt){cnt=1;mem('w',d);M.st('show','win');}
          M.need().then(()=>{const m=$('mBody'),fr=document.createDocumentFragment(),w=m.getAttribute('data-w'),rc=m.classList.contains('rc'),top=m.scrollTop;
            while(m.firstChild)fr.appendChild(m.firstChild);
            M.open('win',()=>{m.innerHTML='';m.appendChild(fr);m.setAttribute('data-w',w||'');m.classList.toggle('rc',rc);$('modal').classList.add('on');
              if(mem('d')===d)b.outerHTML='<div style="text-align:center;font-weight:700">'+Lg('✉️ Письмо у воеводы. Спасибо, прочитаем!','✉️ The Commander has your letter. Thank you, we will read it!')+'</div>';
              m.scrollTop=top;if(typeof fitModal==='function')fitModal();});},()=>{});};}};},1);
})();
