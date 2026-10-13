'use strict';
/* ob2-vkx (поток VKT, буст_в2.0) — грузится через 1,5 с после старта из js/ob2-vkt.js (флаг stx). Только статистика, игру не меняет:
   sz {sz — тыс. знаков сохранения, o2 — знаков во всех S.o2*, mx/mv — самое большое поле} раз за загрузку;
   cloud {a:'big', n — кусков} — сохранение больше 48 кусков облака VK (80 % предела 60, дальше облако молча перестаёт писаться) — раз за сеанс;
   tut {s:6} — новичок (до 1-й победы) открыл кольцо выбора заставы, {s:7, c — монет} — «не хватает монет» на постройку; по разу за бой (бэклог Б4).
   Ещё: чинит S.o2v (только числа и наборы {id:1}); вход в письмо воеводе (флаг mail): строка в ⚙ и окне победы → окно js/ob2-mail.js (OB2.need). */
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
  if(typeof tb==='function')window.tryBuild=function(i,ty){const r=tb.apply(this,arguments);
    try{if(!r&&G&&!S.wins&&!G.vkM&&!G.tw[i]&&G.coins<buildCost(ty)){G.vkM=1;st('tut',{s:7,c:Math.floor(G.coins)});}}catch(e){}return r;};}
  if(OB2.off('mail'))return;
  const LK='oborona-o2mail',day=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5),
    mem=(k,x)=>{try{const o=JSON.parse(localStorage.getItem(LK)||'{}')||{};if(x!==undefined){o[k]=x;localStorage.setItem(LK,JSON.stringify(o));}return n(o[k]);}catch(e){return 0;}},
    M=window.OB2MAIL={day:day,mem:mem,st:(a,f,x)=>{try{STAT.ev('mail',Object.assign({a:a,f:f,l:n(S.wins)},x||{}));}catch(e){}},
      go:(f,back)=>OB2.need('js/ob2-mail.js').then(()=>M.open(f,back),()=>{try{toast(Lg('Письмо не открылось — проверь интернет','The letter did not open — check your connection'));}catch(e){}})};
  const os=window.openSettings;
  if(typeof os==='function')window.openSettings=function(){const r=os.apply(this,arguments);try{const mb=$('mBody'),bt=mb.querySelector('.btns');if(bt&&!$('o2Mail')){
    const b=document.createElement('button');b.className='btn ghost';b.id='o2Mail';b.style.cssText='width:100%;margin-top:8px;justify-content:center';
    b.innerHTML=Lg('✉️ Написать воеводе Потапу ›','✉️ Write to Commander Potap ›');mb.insertBefore(b,bt);b.onclick=()=>{SND.click();M.go('set',()=>window.openSettings());};fitModal();}}catch(e){}return r;};
  // окно победы кампании: раз в 7 дней, с 15-й победы; низкий prio — уступает строкам других потоков. Нажал — окно победы закрывается (как «В меню»), письмо поверх карты
  OB2.slot('win','mail',(g,win)=>{if(!win||!g||g.endless||g.wk||g.dly||n(S.wins)<15)return null;const d=day();if(d-mem('w')<7||d-mem('d')<7)return null;
    return {h:'<button class="btn ghost" id="o2MailW" style="width:100%;justify-content:center;min-height:44px">'+Lg('✉️ Черкни воеводе пару слов об игре','✉️ Drop the Commander a line about the game')+'</button>',
      bind:el=>{setTimeout(()=>{if(el.offsetParent&&el.style.display!=='none'){mem('w',d);M.st('show','win');}},0);  // fitModal мог спрятать строку на низком экране — тогда не в счёт
        el.querySelector('#o2MailW').onclick=()=>{SND.click();try{toMenu();}catch(e){}M.go('win',null);};}};},1);
})();
