'use strict';
/* gb-MG0 · «Подсобка» — экран вкладки back (GB.screen('back') регистрирует gmg-core, этот файл грузится лениво) → window.GBPOD.render(el, opts).
   Внутри: тётя Валя на табуретке, Затея дня (с наградой), счётчики дня (монеты, благодарности, Столик в запасе), полка всех 15 игр:
   открытые — тренировка без наград и рекорд, закрытые — «когда откроется». Значок на вкладке горит, только когда можно получить награду (GMG.dot). */
(function(){if(typeof GMG==='undefined'||window.GBPOD)return;
const T=GMG.T,esc=GMG.esc;
const SAY=['Тут у нас подсобка: чайник, ящики и табуретка. Посторонним — нельзя, а вам — можно.','Садитесь, передохните. Чайник только вскипел.',
  'Пока зал пустой — сыграем во что-нибудь?','Михалыч опять бутылки принёс… Ладно, после перерыва.','Пломбир спит на ящике с гречкой. Не будите.'];
function css(){if(document.getElementById('gm0-pod-css'))return;const s=document.createElement('style');s.id='gm0-pod-css';s.textContent=[
 '#gb-back{background:#e9d3b0;background-image:linear-gradient(#e8cfa4,#d9b886)}',
 '.gm0-pod{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 calc(10px + env(safe-area-inset-bottom))}',
 '.gm0-pdh{display:flex;align-items:center;gap:8px;padding:10px 12px 6px;padding-top:max(10px,env(safe-area-inset-top))}',
 '.gm0-pdh h1{flex:1 1 auto;margin:0;font-size:22px;color:#5f1b0b}',
 '.gm0-pdh .btn{padding:8px 12px;font-size:16px}',
 '.gm0-door{margin:0 12px 8px;background:#7a4a24;color:#fff3dc;border-radius:12px;padding:6px 10px;text-align:center;font-weight:800;letter-spacing:.08em;font-size:13px;text-transform:uppercase;box-shadow:inset 0 0 0 2px #5a3418}',
 '.gm0-wrap{width:100%;max-width:820px;margin:0 auto;padding:0 12px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}',
 '.gm0-day{background:#fff3cf;border-radius:18px;padding:12px;box-shadow:0 0 0 2px #e0a33a inset,0 4px 0 #cdb892;display:flex;flex-direction:column;gap:8px}',
 '.gm0-day h2{margin:0;font-size:18px;color:#8b2a14}',
 '.gm0-day .btn{width:100%;min-height:52px}',
 '.gm0-cnt{display:flex;flex-wrap:wrap;gap:6px}',
 '.gm0-cnt span{background:rgba(255,255,255,.85);border-radius:999px;padding:5px 10px;font-weight:700;font-size:14px;box-shadow:0 2px 0 rgba(0,0,0,.08)}',
 '.gm0-shelf{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}',
 '.gm0-g{position:relative;display:flex;align-items:center;gap:8px;min-height:60px;border:0;border-radius:14px;background:#fffaf0;padding:8px 10px;text-align:left;box-shadow:0 3px 0 #cdb892;font-family:inherit;color:inherit;cursor:pointer}',
 '.gm0-g b{display:block;font-size:15px;line-height:1.2}',
 '.gm0-g small{display:block;font-size:12.5px;color:#6d5640;margin-top:2px}',
 '.gm0-g .gi{font-size:26px;flex:none}',
 '.gm0-g.lock{background:rgba(255,250,240,.55);box-shadow:none;cursor:default;opacity:.85}.gm0-g.lock .gi{filter:grayscale(1);opacity:.5}',
 '.gm0-g.today{box-shadow:0 0 0 2px #e0a33a inset,0 3px 0 #cdb892}',
 '.gm0-sh{margin:2px 0 -2px;font-size:15px;color:#5f1b0b;font-weight:800}',
 '@media (max-width:360px){.gm0-shelf{grid-template-columns:1fr 1fr}.gm0-g{padding:6px 8px;min-height:54px}.gm0-g .gi{font-size:22px}.gm0-g b{font-size:14px}}',
 '@media (min-width:860px){.gm0-shelf{grid-template-columns:repeat(3,1fr)}}'].join('\n');document.head.appendChild(s);}
function render(el){css();const z=GMG.Z(),rw=GMG.RW(),id=GMG.dayId(),di=id?GMG.info(id):null,done=!!z.d.z;
  const E=window.GBECO,cNow=E&&typeof E.left==='function'?Math.max(0,rw.cap-(E.left('mg')|0)):z.d.c;
  let h='<div class="gm0-pod"><div class="gm0-pdh"><h1>🚪 '+T('Подсобка','Back room')+'</h1><button class="btn" id="gm0Back">← '+T('В зал','Back')+'</button></div>'+
    '<div class="gm0-door">'+T('Посторонним вход воспрещён','Staff only')+'</div><div class="gm0-wrap">'+
    GMG.say('valya',esc((()=>{const P=window.GMG_HOSTS&&GMG_HOSTS.podsobka,A=P&&P.length?P:SAY;return A[(z.dp+z.pc)%A.length];})()),'happy');
  if(di){const hs=GMG.zateyaSay(id)||(GMG.whoName(di.who)+T(' ждёт',' is waiting'));
    h+='<div class="gm0-day"><h2>☕ '+T('Игра дня','Today’s game')+': '+di.ic+' '+esc(di.t)+'</h2><div>'+esc(hs)+'</div>'+
      (done?'<div><b>✓ '+T('Сегодня уже сыграна — завтра новая.','Played today — a new one tomorrow.')+'</b></div><button class="btn" data-g="'+id+'" data-m="cab">↻ '+T('Сыграть ещё (тренировка)','Play again (practice)')+'</button>'
        :'<button class="btn green" data-g="'+id+'" data-m="plan">▶ '+T('Играть','Play')+' · '+T('монеты и благодарность в Книгу','coins and a thank-you')+'</button>')+'</div>';}
  h+='<div class="gm0-cnt"><span>💰 '+T('сегодня','today')+' '+Math.min(cNow,rw.cap)+'/'+rw.cap+'</span>'+(window.GBM&&GBM.thanks?'<span>📖 '+T('благодарностей','thank-yous')+' '+z.d.th+'/'+rw.th+'</span>':'')+
    '<span>➕ '+T('Столик в запасе','Spare tables')+': '+z.tb+'</span><span>☕ '+T('Перерывов с наградой','Rewarded breaks')+' '+Math.min(z.d.pk,rw.pk)+'/'+rw.pk+'</span></div>';
  h+='<div class="gm0-sh">'+T('Все игры Подсобки — тренировка без наград','All games — practice, no rewards')+'</div><div class="gm0-shelf">';
  for(let n=1;n<=15;n++){const i=GMG.INFO[n],ok=GMG.isOpen(i.id),best=z.b[n]|0,today=i.id===id;
    h+=ok?'<button class="gm0-g'+(today?' today':'')+'" data-g="'+i.id+'" data-m="cab"><span class="gi">'+i.ic+'</span><span><b>'+esc(i.t)+'</b><small>'+(best?T('рекорд ','record ')+best:esc(GMG.whoName(i.who)))+'</small></span></button>'
      :'<div class="gm0-g lock"><span class="gi">'+i.ic+'</span><span><b>'+esc(i.t)+'</b><small>🔒 '+esc(GMG.lockTxt(i.id))+'</small></span></div>';}
  h+='</div></div></div>';el.innerHTML=h;
  const b=el.querySelector('#gm0Back');if(b)b.onclick=()=>{try{SND.pick();}catch(e){}GMG.home();};
  el.querySelectorAll('[data-g]').forEach(x=>x.onclick=()=>{try{SND.pick();}catch(e){}const g=x.getAttribute('data-g'),m=x.getAttribute('data-m');
    if(m==='plan')GMG.ev({a:'show',id:g,m:'plan',l:Math.max(0,(+S.unlocked||1)-1)});
    GMG.open(g,{mode:m,back:()=>{if(GB.cur==='back')render(el);}});});
  // Esc — в зал
  if(!el._gm0k){el._gm0k=1;window.addEventListener('keydown',e=>{if(e.key==='Escape'&&GB.cur==='back'&&el.classList.contains('on')&&!GMG.busy){const m=document.getElementById('modal');if(m&&m.classList.contains('on'))return;e.preventDefault();GMG.home();}});}}
window.GBPOD={render};
})();
