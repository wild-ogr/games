/* vy-mg0 — экран «Гаражи» (js/vymg-garazhi.js): место, где можно просто поиграть во все мини-игры (задание владельца 10.10; образец — «Двор» Рыбалки, «Изба» Обороны).
   Вход на виду: кнопка нижней панели (navSlots 'garazhi', точка «новое»), плитка на главном (homeSlots feed), на карте — кнопка в нижней панели, если UX-панели ещё нет.
   Сетка всех 15 игр: открытые — карточка-гараж с ведущим, лучшим результатом и звёздами, «Играть» (тренировка без наград); Затея дня — отметка и своя кнопка (с наградой);
   закрытые — силуэт и условие открытия. Клавиатура: стрелки — выбор, Enter/Пробел — играть, цифры 1–9 — игра по номеру карточки, Д — Затея дня, Esc — назад.
   Своё хранится в S.vymg.m._g = {st:{num:лучшие звёзды}, sn:{num:1 — видел в Гаражах}} (склад оболочки, облако — «из более нового»). */
(function(){if(typeof VYMG==='undefined'||!window.UI)return;
const L0=(r,e)=>typeof L==='function'?L(r,e):r,E=VYMG.esc,isEn=()=>typeof LANG!=='undefined'&&LANG==='en';
function mem(){const m=VYMG.Z().m;if(!m._g||typeof m._g!=='object')m._g={};const g=m._g;if(!g.st||typeof g.st!=='object')g.st={};if(!g.sn||typeof g.sn!=='object')g.sn={};return g;}
// лучшие звёзды — после каждого итога (в т. ч. тренировки)
const onEnd0=VYMG.onEnd;VYMG.onEnd=function(g,o,r,out){try{const m=mem();if((r.tier|0)>(m.st[g.num]|0))m.st[g.num]=r.tier|0;}catch(e){}if(typeof onEnd0==='function')return onEnd0.apply(this,arguments);};
const nm=i=>isEn()&&i.en?i.en:i.n,ru=i=>isEn()&&i.ae?i.ae:i.a;
function lockTxt(n){const i=VYMG.INFO[n],z=VYMG.Z(),y=VYMG.yards(),g=VYMG.REG.by[i.id];
  if(g&&g.open)try{if(g.open()===false)return L0('откроется в свой сезон','opens in its season');}catch(e){}
  const a=Math.max(0,i.yd-y),b=i.dp?Math.max(0,i.dp-z.dp):999;
  if(a<=0||b<=0)return L0('откроется после следующей победы','opens after your next win');
  if(b<a&&b<999)return L0('откроется через '+b+' '+plural(b,'день','дня','дней')+' игры или после '+i.yd+'-го двора','opens in '+b+' days or after yard '+i.yd);
  return L0('откроется после '+i.yd+'-го двора','opens after yard '+i.yd);}
function isNew(){const m=mem();return VYMG.openList().some(g=>!m.sn[g.num]);}
function dayLeft(){const t=VYMG.today&&VYMG.today();return !!(t&&!t.done);}
/* ---------- входы ---------- */
navSlots.push({id:'garazhi',order:25,ic:'🏚',t:L0('Гаражи','Garages'),go:'garazhi',dot:()=>isNew()||dayLeft()});
homeSlots.push({id:'vymg-garazhi',order:35,zone:'feed',render(){const l=VYMG.openList().length;
  return UI.tile({ic:'🏚',t:L0('Гаражи — мини-игры','Garages — mini-games'),s:l?L0('открыто '+l+' из 15 · играй сколько хочешь','unlocked '+l+' of 15 · play any time'):L0('первая игра — после 4-го двора','first game after yard 4'),tag:isNew()?'🆕':'',cls:'vy0-gzt',go:'garazhi'});}});
// запасной вход на карте, пока у UX нет своей нижней панели с navSlots
function mapBtn(){const nav=document.querySelector('#scr-map .mnav');if(!nav||document.querySelector('[data-nav="garazhi"],.nav [data-slot="garazhi"]'))return;
  let b=document.getElementById('vy0-navG');if(!b){b=document.createElement('button');b.id='vy0-navG';b.className='btn sq noenter';b.onclick=()=>{try{SND.tap();}catch(e){}UI.go('garazhi');};nav.appendChild(b);}
  b.innerHTML='🏚<small>'+L0('Гаражи','Garages')+'</small>'+(isNew()||dayLeft()?'<em class="vy0-dot"></em>':'');}
UI.on('map',mapBtn);UI.on('screen',n=>{if(n==='map')setTimeout(mapBtn,0);});setTimeout(mapBtn,300);
/* ---------- экран ---------- */
let sec=null,sel=0,cards=[];
function cardH(n,k){const i=VYMG.INFO[n],op=VYMG.isOpen(n),z=VYMG.Z(),m=mem(),st=m.st[n]|0,best=z.b[n]|0,dayId=VYMG.today&&VYMG.today()?VYMG.today().id:'',isDay=op&&i.id===dayId,nw=op&&!m.sn[n];
  let stars='';for(let s=1;s<=3;s++)stars+='<span class="'+(s<=st?'on':'')+'">⭐</span>';
  return '<div class="vy0-gz'+(op?'':' lock')+(isDay?' day':'')+'" data-n="'+n+'" data-k="'+k+'" tabindex="-1">'+
    '<div class="vy0-gzd">'+(k<9?'<span class="vy0-gzk">'+(k+1)+'</span>':'')+(nw?'<em class="vy0-gznew">'+L0('новое','new')+'</em>':'')+(isDay?'<em class="vy0-gzday">☀ '+L0('Затея дня','Today')+'</em>':'')+
      '<span class="vy0-gzi">'+i.ic+'</span><span class="vy0-gzf">'+VYMG.face(i.who,op?'happy':'norm')+'</span></div>'+
    '<div class="vy0-gzb"><b>'+E(op?nm(i):nm(i))+'</b>'+(op?'<small>'+E(ru(i))+'</small><div class="vy0-gzs">'+stars+(best?'<i>'+L0('рекорд ','best ')+best+'</i>':'<i>'+L0('ещё не играл','not played yet')+'</i>')+'</div>'+
      '<div class="vy0-gzbtn">'+(isDay?'<button class="btn green" data-a="day">'+(VYMG.today().done?L0('↻ Ещё раз','↻ Again'):L0('☀ Затея дня · 🔩','☀ Today · 🔩'))+'</button>':'')+'<button class="btn'+(isDay?' sec':' green')+'" data-a="play">▶ '+L0('Играть','Play')+'</button></div>'
      :'<small class="vy0-gzl">🔒 '+E(lockTxt(n))+'</small>')+'</div></div>';}
function render(){const ns=Object.keys(VYMG.INFO).map(Number).sort((a,b)=>a-b);
  const op=ns.filter(n=>VYMG.isOpen(n)),cl=ns.filter(n=>!VYMG.isOpen(n)),order=op.concat(cl),t=VYMG.today&&VYMG.today();
  sec.innerHTML='<header class="vy0-ch"><button class="vy0-back" aria-label="'+L0('Назад','Back')+'">←</button><b>🏚 '+L0('Гаражи','Garages')+'</b><span class="pill">💰 '+(+S.coins||0)+'</span></header>'+
    '<div class="vy0-cb vy0-gzw">'+VYMG.say('tolik',op.length?L0('Заходи в гаражи — тут можно просто поиграть, сколько хочешь. Награды — в Затее дня'+(t?' («'+E(nm(VYMG.INFO[VYMG.IDS[t.id]]))+'»)':'')+' и на Перекуре после двора.','Come to the garages — play as much as you like. Rewards come from Today’s game and the break after a yard.'):
      L0('Гаражи пока закрыты. Пройди 4 двора — открою первую игру!','The garages are still closed. Clear 4 yards and I’ll open the first game!'),'happy')+
    '<div class="vy0-gzg">'+order.map((n,k)=>cardH(n,k)).join('')+'</div>'+
    '<p class="vy0-gzh">'+(UI.pc&&UI.pc()?L0('Клавиши: стрелки — выбор, Enter — играть, 1–9 — игра по номеру, Д — Затея дня, Esc — назад','Keys: arrows — choose, Enter — play, 1–9 — game by number, D — today’s game, Esc — back'):'')+'</p>'+
    '<p class="vy0-gzh"><button class="btn sec sm vy0-gzws">🔧 '+L0('Мастерская Толика','Tolik’s workshop')+' · '+E(VYMG.carInfo().done?L0('всё собрано','all built'):VYMG.carInfo().n+' '+VYMG.carInfo().have+'/'+VYMG.carInfo().need)+'</button></p></div>';
  cards=[...sec.querySelectorAll('.vy0-gz')];
  sec.querySelector('.vy0-back').onclick=back;sec.querySelector('.vy0-gzws').onclick=()=>UI.go('tolik');
  cards.forEach((c,k)=>{c.onclick=e=>{const a=e.target.closest('[data-a]');sel=k;mark();if(a)act(a.dataset.a);else if(!c.classList.contains('lock')&&!e.target.closest('button'))act('play');};});
  sel=Math.min(sel,cards.length-1);mark(false);}
function mark(scroll){cards.forEach((c,k)=>c.classList.toggle('sel',k===sel));const c=cards[sel];if(c&&scroll!==false)try{c.scrollIntoView({block:'nearest'});}catch(e){}}
function act(a){const c=cards[sel];if(!c||c.classList.contains('lock'))return;const n=+c.dataset.n,i=VYMG.INFO[n];try{SND.tap();}catch(e){}
  const m=mem();m.sn[n]=1;VYMG.touch();try{save();}catch(e){}
  if(a==='day'){VYMG.openDay(()=>openG());return;}
  VYMG.ev({a:'show',id:i.id,m:'cab'});VYMG_OPEN(i.id,{mode:'cab',back:()=>openG()});}
function back(){try{SND.tap();}catch(e){}if(!UI.go('home'))UI.go('map');}
function openG(){if(!sec){sec=document.createElement('section');sec.className='screen vy0-cab vy0-gzs-scr';sec.id='scr-garazhi';(document.getElementById('app')||document.body).appendChild(sec);}
  try{if(typeof leaveYard==='function')leaveYard();}catch(e){}try{if(typeof hideModal==='function'&&typeof modalOn!=='undefined'&&modalOn)hideModal();}catch(e){}
  render();UI.show('scr-garazhi');try{STAT.screen('garazhi');}catch(e){}}
UI.screen('garazhi',openG);VYMG.openGarazhi=openG;VYMG.stand.garazhi=()=>openG();
/* ---------- клавиатура экрана ---------- */
window.addEventListener('keydown',e=>{if(e.defaultPrevented||!sec||!sec.classList.contains('on')||VYMG.busy||e.ctrlKey||e.metaKey||e.altKey)return;
  const mo=document.getElementById('modal');if(mo&&mo.classList.contains('on'))return;
  const k=e.key,cols=Math.max(1,Math.round((sec.querySelector('.vy0-gzg').clientWidth||1)/((cards[0]&&cards[0].offsetWidth)||1)));let used=true;
  if(k==='Escape'||k==='Backspace')back();
  else if(k==='ArrowRight')sel=Math.min(cards.length-1,sel+1);else if(k==='ArrowLeft')sel=Math.max(0,sel-1);
  else if(k==='ArrowDown')sel=Math.min(cards.length-1,sel+cols);else if(k==='ArrowUp')sel=Math.max(0,sel-cols);
  else if(k==='Enter'||k===' ')act('play');
  else if(/^[1-9]$/.test(k)){const j=+k-1;if(cards[j]&&!cards[j].classList.contains('lock')){sel=j;act('play');}}
  else if(k==='d'||k==='D'||k==='в'||k==='В'){const j=cards.findIndex(c=>c.classList.contains('day'));if(j>=0){sel=j;act('day');}}
  else used=false;
  if(used){e.preventDefault();e.stopPropagation();if(/^Arrow/.test(k))mark();}},true);
})();
