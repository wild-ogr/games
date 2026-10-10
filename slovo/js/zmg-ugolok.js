'use strict';
/* zb-MG0 «Красный уголок» — кабинет русского языка, вкладка «Перемена» (экран ZB.screen('mg'), грузится лениво из zmg-core.js).
   Внутри: Затея дня (с наградой), стенгазета текущего выпуска (10 заметок, следующая видна заранее, приз за выпуск), полка всех игр —
   тренировка без наград с рекордами, подшивка собранных выпусков с открыткой. Тексты заметок — js/zmg-ugolok-data.js (ZMG_NOTES).
   Наружу — window.ZMGU {render(el,opts), card(iss)}. Комнату «Кабинет русского языка» рисует CAB — сюда ведёт ZMG.ugolok(). */
(function(){
if(!window.ZMG)return;
const esc=ZMG.esc,$=(r,s)=>r.querySelector(s);
const pl=(n,a,b,c)=>typeof plural==='function'?plural(n,a,b,c):c;
function notes(){return window.ZMG_NOTES||[];}
function issueHtml(iss,np,full){const N=notes()[iss-1]||{t:ZMG.ISSUES[iss-1]||'',e:'📰',n:[]},have=full?ZMG.PER_ISS:Math.max(0,Math.min(ZMG.PER_ISS,np-(iss-1)*ZMG.PER_ISS));
  let h='';for(let k=0;k<ZMG.PER_ISS;k++){const nt=N.n[k]||['Заметка '+(k+1),''];
    if(k<have)h+='<div class="zmg-gn on"><b>'+esc(nt[0])+'</b><p>'+esc(nt[1])+'</p></div>';
    else if(k===have&&!full)h+='<div class="zmg-gn nx"><b>Следующая: «'+esc(nt[0])+'»</b><p>Сыграй Затею дня или Перемену на две звезды.</p></div>';
    else h+='<div class="zmg-gn"><b>№'+(k+1)+'</b><p>…</p></div>';}
  return '<div class="zmg-gz"><div class="zmg-gzh"><span class="zmg-gze">'+(N.e||'📰')+'</span><div><small>СТЕНГАЗЕТА · выпуск №'+iss+'</small><b>«'+esc(N.t)+'»</b></div><span class="zmg-gzc">'+have+'/'+ZMG.PER_ISS+'</span></div>'+
    '<div class="zmg-gns">'+h+'</div></div>';}
function prizeTxt(){const p=(ZMG.RW().issue)||{};const a=[];if(p.hb)a.push('💡 +'+p.hb);if(p.c)a.push('+'+p.c+' монет');a.push('открытка');return a.join(' · ');}
function render(el,opts){opts=opts||{};const z=ZMG.Z(),np=z.np,a=ZMG.noteAt(np),day=ZMG.dayId(),di=day?ZMG.info(day):null,list=Object.keys(ZMG.INFO).map(n=>ZMG.INFO[n]);
  const dayH=di?'<div class="zmg-ud'+(z.d.z?' done':'')+'"><span class="zmg-pav">'+ZMG.face(di.who,'happy')+'</span><span class="zmg-pt"><b>🎲 Затея дня: '+esc(di.t)+'</b><span>'+
      (z.d.z?'Сыграно сегодня — завтра новая.':(ZMG.zateyaSay&&ZMG.zateyaSay(day)?esc(ZMG.zateyaSay(day))+' ':'')+'Заметка в стенгазету и монеты.')+'</span></span><button class="btn '+(z.d.z?'ghost':'green')+' small" data-g="'+day+'" data-m="'+(z.d.z?'cab':'day')+'">'+(z.d.z?'Ещё раз':'Играть')+'</button></div>'
    :'<div class="zmg-ud done"><span class="zmg-pt"><b>🔔 Перемена откроется '+((+S.lv||0)>=5?'после следующей победы':'на 5-м уровне')+'</b><span>Первым придёт Валерка со своим диктантом.</span></span></div>';
  const shelf=list.map(i=>{const op=ZMG.isOpen(i.id),best=z.b[i.num]|0;
    return op?'<button type="button" class="zmg-sg" data-g="'+i.id+'" data-m="cab"><span class="zmg-sgi">'+i.ic+'</span><b>'+esc(i.t)+'</b><small>'+esc(ZMG.whoName(i.who))+(best?' · рекорд '+best:'')+'</small></button>'
      :'<div class="zmg-sg lock"><span class="zmg-sgi">🔒</span><b>'+esc(i.t)+'</b><small>'+esc(ZMG.lockTxt(i.id))+'</small></div>';}).join('');
  const got=Object.keys(z.iss).filter(k=>z.iss[k]).map(Number).sort((x,y)=>x-y);
  const sub=got.length?got.map(k=>'<button type="button" class="zmg-ip" data-iss="'+k+'">'+((notes()[k-1]||{}).e||'📰')+' №'+k+' «'+esc(ZMG.ISSUES[k-1])+'»</button>').join(''):'<p class="zmg-hint">Собери первый выпуск — он ляжет сюда, а открытку можно будет отправить родным.</p>';
  const nOpen=list.filter(i=>ZMG.isOpen(i.id)).length;
  el.innerHTML='<div class="zmg-u"><div class="zmg-uh"><button type="button" class="zmg-ub" aria-label="Назад">←</button><div class="zmg-uht"><b>Красный уголок</b><small>кабинет русского языка · Перемена</small></div></div>'+
    '<div class="zmg-ub2">'+dayH+
    (a.done?'<div class="zmg-gz done"><b>🎉 Все 12 выпусков стенгазеты собраны!</b><p>Баба Зина повесила их в рамочки.</p></div>':issueHtml(a.iss,np)+'<p class="zmg-prz">Собери 10 заметок — приз: '+esc(prizeTxt())+'. Заметок в день — до '+ZMG.RW().nt+'.</p>')+
    '<h3 class="zmg-uh3">🎲 Игры <small>'+nOpen+' из 15 · тренировка без наград</small></h3><div class="zmg-shelf">'+shelf+'</div>'+
    '<h3 class="zmg-uh3">🗞 Подшивка</h3><div class="zmg-sub">'+sub+'</div></div></div>';
  $(el,'.zmg-ub').onclick=()=>{try{SND.tap();}catch(e){}if(typeof openMenu==='function')openMenu();};
  el.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{try{SND.tap();}catch(e){}const id=b.dataset.g,m=b.dataset.m;
    if(m==='day')ZMG.ev({a:'show',id,m:'day',l:+S.lv||0});else ZMG.ev({a:'show',id,m:'cab',l:+S.lv||0});
    ZMG.open(id,{mode:m,back:()=>{if(ZB.cur==='mg')render(el,opts);}});});
  el.querySelectorAll('[data-iss]').forEach(b=>b.onclick=()=>{try{SND.tap();}catch(e){}showIssue(+b.dataset.iss);});
  if(opts.iss)showIssue(opts.iss);}
function showIssue(k){const N=notes()[k-1]||{};
  modal('<div class="zmg-im">'+issueHtml(k,ZMG.Z().np,true)+'<div class="btns"><button class="btn blue" id="zmgCard">📤 Открытка</button><button class="btn ghost small" id="mCancel">Закрыть</button></div></div>');
  const c=document.getElementById('mCancel');if(c)c.onclick=()=>{try{SND.tap();}catch(e){}hideModal();};
  const s=document.getElementById('zmgCard');if(s)s.onclick=()=>{try{SND.tap();}catch(e){}share(k,()=>showIssue(k));};void N;}
/* открытка-стенгазета 1080×1080 */
async function card(k){const N=notes()[k-1]||{t:ZMG.ISSUES[k-1],e:'📰',n:[]},W=1080,H=1080,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  const F='"Trebuchet MS","Segoe UI",Roboto,Arial,sans-serif';x.fillStyle='#fbf7ec';x.fillRect(0,0,W,H);x.strokeStyle='#dfe8f2';x.lineWidth=2;
  for(let i=0;i<W;i+=36){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke();}
  x.fillStyle='#fff';x.shadowColor='rgba(0,0,0,.15)';x.shadowBlur=24;x.fillRect(90,90,W-180,H-180);x.shadowBlur=0;
  x.fillStyle='#d0342c';x.fillRect(90,90,W-180,150);x.fillStyle='#fff';x.textAlign='center';x.font='900 46px '+F;x.fillText('СТЕНГАЗЕТА · ВЫПУСК №'+k,W/2,160);
  x.font='900 54px '+F;x.fillText('«'+N.t+'»',W/2,222);x.font='120px '+F;x.fillText(N.e||'📰',W/2,400);
  x.fillStyle='#27324a';x.font='800 34px '+F;x.textAlign='left';const L=(N.n||[]).slice(0,6);let y=470;
  for(const nt of L){x.fillStyle='#1d4fa3';x.fillText('• '+nt[0],150,y);y+=56;}
  x.textAlign='center';x.fillStyle='#e8661b';x.font='900 44px '+F;x.fillText('Выпуск собран — с бабой Зиной!',W/2,H-210);
  x.fillStyle='#1d4fa3';x.font='800 34px '+F;x.fillText('«Баба Зина: слова из букв»',W/2,H-150);return cv;}
async function share(k,back){try{ZMG.ev({a:'card',id:'paper',iss:k});}catch(e){}let c;try{c=await card(k);}catch(e){if(typeof toast==='function')toast('Не получилось нарисовать открытку');return;}
  if(typeof shareImg==='function')shareImg(c,'slovo-gazeta-'+k,'Собрал(а) выпуск стенгазеты «'+ZMG.ISSUES[k-1]+'» вместе с бабой Зиной! Игра «Баба Зина: слова из букв»',back,'Стенгазета бабы Зины','Отправь родным — пусть почитают!');}
function paperHtml(){const z=ZMG.Z(),a=ZMG.noteAt(z.np);return a.done?'<div class="zmg-gz done"><b>🎉 Все 12 выпусков стенгазеты собраны!</b></div>':issueHtml(a.iss,z.np);}
window.ZMGU={render,card,share,showIssue,paperHtml};
(function(){if(document.getElementById('zmgu-css'))return;const st=document.createElement('style');st.id='zmgu-css';st.textContent=
'.zmg-u{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 0 calc(80px + env(safe-area-inset-bottom));box-sizing:border-box}'+
'.zmg-uh{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top) + 8px) 12px 8px;background:#c62f2a;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.15)}'+
'.zmg-ub{width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;font-size:22px;font-weight:900;cursor:pointer}'+
'.zmg-uht{display:flex;flex-direction:column}.zmg-uht b{font-size:20px}.zmg-uht small{font-size:13px;opacity:.9}'+
'.zmg-ub2{max-width:720px;margin:0 auto;padding:10px 12px}'+
'.zmg-ud{display:flex;align-items:center;gap:10px;padding:10px;border-radius:16px;background:#fff7d6;box-shadow:0 0 0 2px var(--gold,#f5b72d) inset;margin:4px 0 12px;flex-wrap:wrap}'+
'.zmg-ud.done{background:var(--soft,#f3f6fc);box-shadow:none}.zmg-ud .btn{flex:0 0 auto}'+
'.zmg-gz{background:#fff;border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.zmg-gz.done{padding:16px;text-align:center}'+
'.zmg-gzh{display:flex;align-items:center;gap:10px;background:#d0342c;color:#fff;padding:8px 12px}.zmg-gzh div{flex:1;display:flex;flex-direction:column}.zmg-gzh small{font-size:11px;letter-spacing:1px;opacity:.9}'+
'.zmg-gzh b{font-size:18px}.zmg-gze{font-size:28px}.zmg-gzc{font-weight:900;font-size:18px;background:rgba(255,255,255,.2);border-radius:10px;padding:2px 8px}'+
'.zmg-gns{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px}'+
'.zmg-gn{border:2px dashed var(--edge,#d5d9e3);border-radius:10px;padding:6px 8px;min-height:54px;color:var(--ink2,#5d6781);font-size:12.5px}'+
'.zmg-gn b{display:block;font-size:13.5px;margin-bottom:2px}.zmg-gn p{margin:0;line-height:1.3}'+
'.zmg-gn.on{border:0;background:#fffdf3;box-shadow:0 1px 0 var(--edge,#d5d9e3),0 0 0 1px #f1e7c8 inset;color:var(--ink,#27324a);transform:rotate(-.6deg)}.zmg-gn.on:nth-child(even){transform:rotate(.6deg)}'+
'.zmg-gn.on b{color:#c62f2a}.zmg-gn.nx{border-color:var(--gold,#f5b72d);background:#fff9e3}'+
'.zmg-prz{font-size:13.5px;color:var(--ink2,#5d6781);margin:6px 2px 4px;text-align:center}'+
'.zmg-uh3{font-size:18px;margin:16px 2px 8px}.zmg-uh3 small{font-size:13px;font-weight:600;color:var(--ink2,#5d6781)}'+
'.zmg-shelf{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}'+
'.zmg-sg{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:76px;border:0;border-radius:14px;background:#fff;box-shadow:0 3px 0 var(--edge,#d5d9e3);padding:8px 10px;text-align:left;font-family:inherit;color:var(--ink,#27324a);cursor:pointer}'+
'.zmg-sg b{font-size:14.5px;line-height:1.2}.zmg-sg small{font-size:12px;color:var(--ink2,#5d6781)}.zmg-sgi{font-size:22px}'+
'.zmg-sg.lock{background:var(--soft,#f3f6fc);box-shadow:none;cursor:default;opacity:.8}'+
'.zmg-sub{display:flex;flex-wrap:wrap;gap:8px}.zmg-ip{border:0;border-radius:12px;background:#fff;box-shadow:0 3px 0 var(--edge,#d5d9e3);padding:8px 10px;font:700 14px var(--font,Arial);color:var(--ink,#27324a);cursor:pointer}'+
'.zmg-im .zmg-gns{max-height:52vh;overflow-y:auto}.zmg-im .btns{display:flex;flex-direction:column;gap:8px;margin-top:10px}'+
'@media (min-width:860px){.zmg-gns{grid-template-columns:repeat(5,1fr)}.zmg-im .zmg-gns{grid-template-columns:1fr 1fr}}';document.head.appendChild(st);})();
})();
