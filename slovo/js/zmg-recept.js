'use strict';
/* zb-MGC мини-игра №11 «Рецепт тёти Вали» (ведущая — тётя Валя из Гастронома).
   Валя диктует рецепт, одно слово выпало — продукт собирается из круга букв. 3 рецепта за заход (~60 с), без таймера, ошибка не наказывает.
   Подсказка Вали: 1-я — толкование, 2-я — первая буква (минус балл за рецепт). Готовый рецепт — в «Кулинарную тетрадь» (коллекция, без силы).
   Выбор рецептов: Затея дня — одна раскладка на всех (зерно дня); иначе — сперва новые для тетради; глава/праздник подмешивают свои (Рынок, Соленья, Юбилей, Новый год, 8 Марта).
   Данные — js/zmg-recept-data.js (ZMG_RECEPT, из content/texts/recipes.json — черновик до вычитки). Склад host.mem(): c — собранные рецепты (строка номеров через «,»).
   Выключение — ZMG_OFF в zmg-core.js или здесь RC_ON=false. Договор — шапка js/zmg-core.js. */
(function(){
if(typeof ZMG_REG!=='function')return;
const RC_ON=true;
if(!RC_ON)return;
const N=3;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const norm=w=>String(w).toLowerCase().replace(/ё/g,'е');
const D=()=>window.ZMG_RECEPT&&window.ZMG_RECEPT.items||[];
const numOf=it=>parseInt(String(it.id).replace(/\D/g,''),10)||0;
function book(host){const m=host.mem();const s=typeof m.c==='string'?m.c:'';return s?s.split(',').map(Number).filter(Boolean):[];}
function bookAdd(host,n){const m=host.mem(),b=book(host);if(b.indexOf(n)>=0)return false;b.push(n);b.sort((a,c)=>a-c);m.c=b.join(',');return true;}
function shuf(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
// какие разделы тетради подходят сейчас: праздник, глава
function wantCats(host){const c=[];const f=host.fest&&String(host.fest.id||'');
  if(f){if(/ny|new|novy|elk/i.test(f))c.push('новый год','праздник');else if(/mar|8m|women/i.test(f))c.push('8 марта','праздник');}
  try{const ch=typeof chapOf==='function'?chapOf(Math.max(0,+S.lv||0)):null,n=ch&&ch.n||'';
    if(/Рынок/.test(n))c.push('рынок','кухня');else if(/Соленья|Дача/.test(n))c.push('соленья');else if(/Юбилей|Свадьба|Новый год/.test(n))c.push('праздник','новый год');}catch(e){}
  return c;}
function pick(host,o){const L=D();if(!L.length)return [];let A=shuf(L,o.rnd);
  if(o.mode==='day'||o.mode==='paper')return A.slice(0,N);   // одна раскладка на всех
  const have=book(host),cats=wantCats(host);
  const sc=it=>(have.indexOf(numOf(it))<0?2:0)+(cats.indexOf(it.cat)>=0?1:0);
  A=A.map((it,i)=>[it,sc(it),i]).sort((a,b)=>b[1]-a[1]||a[2]-b[2]).map(x=>x[0]);
  // не три подряд из одного раздела «праздник»: просто берём первые N
  return A.slice(0,N);}
const tierOf=p=>p>=9?3:p>=7?2:p>=4?1:0;
// буквы круга: ответ + для коротких (≤4) одна лишняя буква, чтобы было что поискать
const EXTRA='оаеинтсрлк';
function letters(a,rnd){const L=a.split('');if(a.length<=4){let x='';for(let t=0;t<10&&!x;t++){const c=EXTRA[Math.floor(rnd()*EXTRA.length)];if(a.indexOf(c)<0)x=c;}if(x)L.push(x);}return L;}
const OK=['Вот! Теперь как у людей.','Записала? Не потеряй — второй раз диктовать не буду.','Умница! Хоть сейчас в Гастроном, на раздачу.','Правильно! Я сразу вижу — человек из хорошей очереди.'];
const BAD=['Это не в этот рецепт, золотко.','Нет-нет, такого у нас и по блату не было.','Ты мне продукт назови, а не что попало.','Хм. Попробуй ещё — не на скорость.'];
ZMG_REG({id:'recept',finWho:'valya',deps:['krug','js/zmg-recept-data.js'],
  open:()=>true,
  lines:{good:'Всё записал — хоть сейчас к плите! Тетрадку береги, она дороже сберкнижки.',ok:'Неплохо! Подсказывала я, конечно, но кто ж без подсказки готовит.',
    bad:'Ничего, рецепты не убегут. Завтра ещё продиктую.'},
  sim(o,k){let p=0;for(let i=0;i<N;i++){const r=o.rnd();p+=r<.35+.6*k?3:r<.75+.2*k?2:1;}return {sc:p,st:tierOf(p)};},
  run(host,o){const L=pick(host,o);if(!L.length){host.quit();return;}
    let i=0,pts=0,hTot=0,cur=null,h=0,solved=false,kg=null,okN=0,bdN=0,timer=0,news=0;
    const fest=host.fest&&host.fest.id;
    host.el.innerHTML='<div class="zmc-rc'+(fest?' zmc-f-'+esc(fest):'')+'"><div class="zmc-rc-card"><div class="zmc-rc-tt"></div><div class="zmc-rc-x"></div><div class="zmc-rc-j"></div><div class="zmc-rc-sm"></div><button class="zmc-rc-h" aria-label="Подсказка Вали">💡<span> Подсказка Вали</span></button></div>'+
      '<div class="zmc-rc-say"></div><div class="zmc-rc-k"></div><div class="zmc-rc-bt"><button class="btn green zmc-rc-n" hidden>Дальше ▶</button></div></div>';
    const $=s=>host.el.querySelector(s),tt=$('.zmc-rc-tt'),tx=$('.zmc-rc-x'),jk=$('.zmc-rc-j'),say=$('.zmc-rc-say'),kc=$('.zmc-rc-k'),hb=$('.zmc-rc-h'),nb=$('.zmc-rc-n'),card=$('.zmc-rc-card'),sm=$('.zmc-rc-sm');
    const talk=(t,m)=>{say.innerHTML=host.say('valya',t,m);sm.innerHTML='<b>Валя:</b> '+t;};
    function gapHtml(){const a=cur.a;if(solved)return '<span class="zmc-rc-gap ok">'+esc(a.toUpperCase())+'</span>';
      let s='';for(let k=0;k<a.length;k++)s+=(h>=2&&k===0)?a.charAt(0).toUpperCase():'_';return '<span class="zmc-rc-gap">'+s.split('').join(' ')+'</span>';}
    function txt(){const p=cur.x.split('___');tx.innerHTML=esc(p[0])+gapHtml()+esc(p[1]||'');}
    function show(){cur=L[i];h=0;solved=false;tt.textContent='Рецепт '+(i+1)+' из '+L.length+': «'+cur.t+'»';jk.innerHTML='';jk.hidden=true;card.classList.remove('done');txt();
      talk(i===0?'Пиши, пока помню. Одно слово я пропустила — собери его из букв.':i===1?'Следующий! Карандаш не грызи.':'И последний — мой коронный.','norm');
      hb.style.display='';hb.disabled=false;nb.style.display='none';kc.style.display='';host.top((i+1)+' из '+L.length);
      if(kg)kg.set(letters(cur.a,o.rnd));else kg=host.krug(kc,{letters:letters(cur.a,o.rnd),onWord:word});if(kg)kg.lock(false);}
    function word(w){if(solved)return 'dup';if(norm(w)===cur.a){win();return 'ok';}
      talk(esc(BAD[bdN++%BAD.length]),'sad');return 'bad';}
    function win(){solved=true;const p=Math.max(1,3-h);pts+=p;hTot+=h;txt();card.classList.add('done');
      const nw=bookAdd(host,numOf(cur));if(nw)news++;
      jk.innerHTML='<b>Валя:</b> '+esc(cur.j)+(nw?'<span class="zmc-rc-new">📖 в тетрадь!</span>':'');jk.hidden=false;
      talk(esc(OK[okN++%OK.length]),'happy');try{host.snd.word&&host.snd.word(cur.a.length,0);}catch(e){}
      hb.style.display='none';nb.style.display='';kc.style.display='none';if(kg)kg.lock(true);
      timer=setTimeout(()=>{timer=0;},300);}
    function next(){if(!solved)return;i++;if(i>=L.length){end();return;}show();}
    function end(){const b=book(host).length,tot=D().length;
      host.finish({sc:pts,st:tierOf(pts),h:hTot,label:'Рецептов: '+L.length+' · тетрадь '+b+' из '+tot+(news?' (+'+news+')':'')});}
    function hint(){if(solved||h>=2)return;h++;try{host.snd.tap();}catch(e){}
      if(h===1)talk('Подскажу: '+esc(cur.h),'norm');
      else{txt();talk('Ну совсем просто: начинается на «'+esc(cur.a.charAt(0).toUpperCase())+'». '+esc(cur.h),'norm');hb.disabled=true;}}
    hb.onclick=hint;nb.onclick=()=>{try{host.snd.tap();}catch(e){}next();};
    host.keys(k=>{if(solved&&(k==='Enter'||k===' ')){next();return true;}if(!solved&&(k==='?'||k==='/'||k==='F1'||k===',')){hint();return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);});
    // бот стенда: k — доля «без подсказки»; иногда сначала ошибается словом
    host.bot=k=>{if(!cur||!kg)return;if(solved){next();return;}if(Math.random()>k&&h<2){hint();return;}
      if(Math.random()>k+.1){kg.type(cur.a.split('').reverse().join(''));return;}kg.type(cur.a);};
    const b=book(host).length,tot=D().length;
    host.intro({who:'valya',text:'Записывай рецепт, пока не убежало! Одно слово я пропущу — <b>собери продукт из букв</b>. Готовое — в твою кулинарную тетрадь.',
      btn:'Записываю!',hint:N+' рецепта · ~1 минута · ошибки не страшны',
      html:'<p class="zmc-rc-bk">📖 Кулинарная тетрадь: <b>'+b+' из '+tot+'</b> '+(b?'<a href="#" class="zmc-rc-bkb" role="button">открыть</a>':'')+'</p>'}).then(show);
    // тетрадь (с карточки вступления)
    setTimeout(()=>{const bb=host.el.querySelector('.zmc-rc-bkb');if(bb)bb.onclick=e=>{e.preventDefault();e.stopPropagation();openBook(host);};},0);}});
function openBook(host){const have=book(host),L=D();const d=document.createElement('div');d.className='zmg-veil zmc-rc-book';
  const cards=L.filter(it=>have.indexOf(numOf(it))>=0).map(it=>'<div class="zmc-rc-bc"><b>'+esc(it.t)+'</b><p>'+esc(it.x.replace('___',it.a.toUpperCase()))+'</p><i>'+esc(it.j)+'</i></div>').join('');
  d.innerHTML='<div class="zmg-panel"><h2>📖 Кулинарная тетрадь</h2><p>'+have.length+' из '+L.length+' рецептов тёти Вали</p><div class="zmc-rc-bl">'+cards+'</div><div class="zmg-btns"><button class="btn green" data-esc="1">Закрыть</button></div></div>';
  host.root.appendChild(d);d.querySelector('button').onclick=()=>{try{host.snd.tap();}catch(e){}d.remove();};}
(function(){if(document.getElementById('zmc-rc-css'))return;const st=document.createElement('style');st.id='zmc-rc-css';st.textContent=
'.zmc-rc{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;padding:8px 12px 10px;gap:6px;overflow-y:auto}'+
'.zmc-rc-card{width:100%;max-width:480px;box-sizing:border-box;background:#fffaf0;border:1px solid #ecd9b8;border-radius:10px 10px 16px 16px;padding:10px 14px 12px;box-shadow:var(--shadow);'+
'background-image:repeating-linear-gradient(transparent 0,transparent 25px,#efe2c9 25px,#efe2c9 26px);position:relative}'+
'.zmc-rc-card:before{content:"";position:absolute;left:-1px;right:-1px;top:-1px;height:6px;border-radius:10px 10px 0 0;background:repeating-linear-gradient(90deg,#e2463b 0 12px,#fff 12px 24px)}'+
'.zmc-rc-tt{font-weight:900;font-size:17px;color:#9a4a24;margin:2px 0 4px}'+
'.zmc-rc-x{font-size:18px;line-height:1.45;font-family:"Comic Sans MS","Segoe Print","Trebuchet MS",cursive;color:#3a2f25}'+
'.zmc-rc-gap{display:inline-block;padding:0 6px;margin:0 2px;border-radius:6px;background:#fde9c8;color:#9a4a24;font-weight:900;letter-spacing:1px;font-family:var(--font,Arial)}'+
'.zmc-rc-gap.ok{background:#dff3e3;color:var(--green2,#237a3b);animation:zmcPop .35s}'+
'.zmc-rc-j{margin-top:6px;font-size:16px;line-height:1.35;color:#5d4a3a;background:#fff;border-radius:10px;padding:6px 10px;border:1px dashed #e0c9a4}'+
'.zmc-rc-new{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:10px;background:#9a4a24;color:#fff;font-size:14px;font-weight:800;transform:rotate(-3deg)}'+
'.zmc-rc-say{width:100%;max-width:480px;min-height:54px}.zmc-rc-say .zmg-av{width:48px;height:48px}'+
'.zmc-rc-k{flex:1 1 auto;min-height:250px;width:100%;display:flex;justify-content:center}'+
'.zmc-rc-bt{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.zmc-rc-bt .btn{min-height:48px;font-size:17px}'+
'.zmc-rc-bk{text-align:center;font-size:16px}.zmc-rc-bkb{margin-left:8px;color:var(--blue,#1d4fa3);font-weight:800}'+
'.zmc-rc-book .zmg-panel{max-height:88vh;display:flex;flex-direction:column}.zmc-rc-bl{overflow-y:auto;flex:1 1 auto;display:flex;flex-direction:column;gap:8px;text-align:left;margin:6px 0}'+
'.zmc-rc-bc{background:#fffaf0;border:1px solid #ecd9b8;border-radius:10px;padding:8px 10px;font-size:15px;line-height:1.35}.zmc-rc-bc p{margin:4px 0}.zmc-rc-bc i{color:#7a5a3a}'+
'@keyframes zmcPop{0%{transform:scale(.6)}70%{transform:scale(1.15)}100%{transform:none}}'+
'.zmc-rc-h{display:block;margin:8px 0 0 auto;border:0;border-radius:12px;background:#fde9c8;color:#7a3d1c;font:800 16px/1 var(--font,Arial);padding:0 14px;min-height:44px;cursor:pointer;box-shadow:0 2px 0 #e9c99a}'+
'.zmc-rc-h:disabled{opacity:.5;cursor:default}'+
'.zmc-rc-sm{display:none;margin-top:6px;font-size:15px;line-height:1.3;color:#5d4a3a}'+
'@media (max-height:700px){.zmc-rc-x{font-size:16px;line-height:1.35}.zmc-rc-say{display:none}.zmc-rc-sm{display:block}.zmc-rc-card.done .zmc-rc-sm{display:none}.zmc-rc-tt{padding-right:50px}.zmc-rc-h{position:absolute;right:8px;top:10px;margin:0;width:44px;padding:0;font-size:20px}.zmc-rc-h span{display:none}.zmc-rc-k{min-height:262px}.zmc-rc-j{font-size:15px}}';
document.head.appendChild(st);})();
})();
