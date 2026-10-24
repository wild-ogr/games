/* b2-beta.js — тест-меню беты «🧪 Начать с главы…» (CORE, просьба владельца 18.10: тестировать, не проходя игру с нуля).
   Только бета (/magnat-beta/ или ?beta=1): каркас грузит файл через B2.need, в архивы VK/Яндекса не идёт (pack.sh). Сохранения — js/b2-beta-fx.js (tools/b2-beta-fx.py).
   Своя игра перед первой подменой кладётся в запас localStorage 'magnat-b2bk' (+ снимки отката), вернуть — в том же меню. Пока идёт тестовое сохранение — метка 'magnat-b2fx'. */
(function(){'use strict';
if(!B2.beta)return;
const T=(r,e)=>typeof L==='function'?L(r,e):r;
const ls={get:k=>{try{return localStorage.getItem(k);}catch(e){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);return true;}catch(e){return false;}},del:k=>{try{localStorage.removeItem(k);}catch(e){}}};
const BK='magnat-b2bk',CUR='magnat-b2fx';
const bk=()=>{try{return JSON.parse(ls.get(BK)||'null');}catch(e){return null;}};
const when=t=>{const d=new Date(t),p=n=>String(n).padStart(2,'0');return p(d.getDate())+'.'+p(d.getMonth()+1)+' '+p(d.getHours())+':'+p(d.getMinutes());};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
B2.slot('settings','beta',()=>`<button class="set noenter" data-b2="beta:menu"><span>🧪 ${T('Тест: начать с главы…','Test: start from a chapter…')}<br><small>${T('только в тестовой версии — готовые сохранения','test version only — ready-made saves')}</small></span><i class="go">›</i></button>`,99);
B2.click('beta',(a,arg)=>{try{SND.tap();}catch(e){}if(a==='menu')open();else if(a==='go')go(arg);else if(a==='back')restore();});
function row(k,ico,t,d){return `<button class="set noenter" data-b2="beta:go:${k}"><span>${ico} <b>${esc(t)}</b><br><small>${esc(d)}</small></span><i class="go">›</i></button>`;}
function open(){B2.need('b2-beta-fx.js').then(()=>{const cur=ls.get(CUR),b=bk(),en=typeof LANG!=='undefined'&&LANG==='en';
  let h=`<h2>🧪 ${T('Начать с главы…','Start from a chapter…')}</h2>
  <p class="about">${T('Для проверки: игра откроется с готового сохранения нужной главы. Ваша собственная игра не пропадёт — она отложится в запас, и её можно вернуть здесь же кнопкой «Вернуть мою игру».','For testing: the game opens from a ready save of the chosen chapter. Your own game is not lost — it is put aside, and you can bring it back here with “Bring back my game”.')}</p>`;
  if(cur)h+=`<p class="about">▶ ${T('Сейчас открыто тестовое сохранение','A test save is open now')}: <b>${esc(((B2.FX.find(x=>x.k===cur)||{})[en?'en':'ru'])||T('Глава 1','Chapter 1'))}</b></p>`;
  if(b&&cur)h+=`<button class="set noenter" data-b2="beta:back"><span>↩ <b>${T('Вернуть мою игру','Bring back my game')}</b><br><small>${T('как было ','as it was on ')}${when(b.t)}</small></span><i class="go">›</i></button>`;
  h+=row('ch1','🚲',T('Глава 1 «Карьера» — с самого начала','Chapter 1 “Career” — from the very start'),T('новая игра: пролог, работа, первые подработки','a new game: prologue, job, first side jobs'));
  for(const x of B2.FX)h+=row(x.k,{ch2:'🏪',ch3:'🏬',ch4:'⛏',ch5:'🏭',ipo:'🔔',h2:'🏛'}[x.k]||'📁',en?x.en:x.ru,en?x.de:x.dr);
  h+=`<p class="mut" style="font-size:15px">${T('После выбора игра перезапустится (2–3 секунды).','After you choose, the game restarts (2–3 seconds).')}</p><div class="row"><button class="btn" data-esc="1" onclick="hideModal()">${T('Закрыть','Close')}</button></div>`;
  modal(h);try{modalRe=open;}catch(e){}
}).catch(()=>{try{toast(T('Не удалось загрузить сохранения — проверьте интернет','Could not load the saves — check the connection'));}catch(e){}});}
// запись нового сохранения и перезапуск: старую игру больше не пишем (save заглушён), иначе при уходе со страницы она бы затёрла новую
function swap(raw){window.save=function(){};window.cloudFlush=function(){};try{GAME.hold.add('b2fx');}catch(e){}
  if(raw==null)ls.del('magnat-v1');else ls.set('magnat-v1',raw);setTimeout(()=>location.reload(),150);}
function go(k){const fx=k==='ch1'?{k:'ch1',s:{w:null,cr:20,crE:{},tut:{},fame:[]}}:(B2.FX||[]).find(x=>x.k===k);if(!fx)return;
  if(!ls.get(CUR)){try{save();}catch(e){}ls.set(BK,JSON.stringify({t:Date.now(),s:ls.get('magnat-v1'),rb:ls.get('magnat-rb')}));}
  const now=Date.now(),o=JSON.parse(JSON.stringify(fx.s));o.ts=now;o.lastT=now;o.maxT=now;o.spd=1;   // без офлайна «за годы» и без старой паузы
  for(const f of ['sound','music','vib','calm','bigF','noIco','lang','th','readP'])if(typeof S!=='undefined'&&S[f]!==undefined)o[f]=S[f];   // настройки владельца — свои
  ls.del('magnat-rb');ls.set(CUR,k);try{B2.ev('beta','fx',{k});}catch(e){}B2.emit('fx',k);
  try{toast(T('Открываю сохранение…','Opening the save…'));}catch(e){}swap(JSON.stringify(o));}
function restore(){let b=null;try{b=JSON.parse(ls.get(BK)||'null');}catch(e){}if(!b)return;ls.del(CUR);ls.del(BK);if(b.rb)ls.set('magnat-rb',b.rb);else ls.del('magnat-rb');
  try{B2.ev('beta','back',{});}catch(e){}swap(b.s);}
B2.beta_=open;   // для проверок: B2.beta_() открывает меню
})();
