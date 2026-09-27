'use strict';
/* ================= «Отличник»: уровень без подсказок ================= */
const EX_BONUS=2;
const exGet=i=>(S.ex||'')[i]==='1';
function exSet(i){let e=S.ex||'';while(e.length<=i)e+='0';S.ex=e.slice(0,i)+'1'+e.slice(i+1);}
const exCount=()=>((S.ex||'').match(/1/g)||[]).length;

/* ================= облики ================= */
let shopTab='zina';
// облик из покупки (it.pay) — только если куплен; обычные — бесплатные или за монеты
const owned=(kind,it)=>it.pay?typeof PAY!=='undefined'&&PAY.own(it.pay):!it.p||!!(S.own||{})[kind+':'+it.id];
const payShow=it=>!it.pay||owned('o',it)||typeof PAY!=='undefined'&&PAY.on&&!!PAY.item(it.pay);
function openShop(){
  show('shopS');updCoins();
  const isZ=shopTab==='zina',list=isZ?OUTFITS:SKINS,cur=isZ?S.outfit:S.skin;
  let h=`<div class="dhead"><div class="av">${zinaSVG('happy')}</div><p>${isZ?'Полвека в одном платье ходила — хватит! Купи бабушке обновку, а я уж тебе слова подберу.':'Буквы на хорошем блюдце и складываются лучше. Это научный факт — я проверяла.'}</p></div>
   <div class="tabs"><button data-t="zina" class="${isZ?'on':''}">👗 Наряды</button><button data-t="plate" class="${isZ?'':'on'}">🍽️ Блюдца</button></div><div class="shopg">`;
  for(const it of list){if(!payShow(it))continue;const own=owned(isZ?'o':'s',it),sel=cur===it.id;
    const pv=isZ?zinaSVG('norm',it.id)
      :`<div class="mini" id="pv_${it.id}" style="width:112px;height:112px;--lc:${it.lc}"><div class="plate"></div></div>`;
    h+=`<div class="item${sel?' sel':''}"><div class="pv">${pv}</div><b>${it.n}</b><small>${it.d}</small>
      ${sel?`<div class="ok">✓ ${isZ?'Надето':'На столе'}</div>`:own?`<button class="btn blue" data-id="${it.id}">Выбрать</button>`
        :it.pay?`<small>В покупке «${PAY_ITEMS[it.pay].name}»</small><button class="btn pbuy" data-pid="${it.pay}">🎁 ${PAY.price(PAY.item(it.pay))}</button>`
        :`<button class="btn${S.coins<it.p?' ghost':''}" data-id="${it.id}" data-p="${it.p}">${it.p} <span class="coin"></span></button>`}</div>`;}
  // покупки за деньги (js/pay.js) — внизу магазина, только если платежи площадки доступны; «чай» — только в «Благодарностях»
  $('shopList').innerHTML=h+'</div>'+(typeof PAY!=='undefined'&&PAY.on?PAY.html(['no_ads','coins_s','coins_l','starter']):'');if(typeof PAY!=='undefined'&&PAY.on)PAY.bind($('shopList'));
  if(!isZ)for(const it of SKINS){const el=$('pv_'+it.id);applySkin(el,it.id);
    'слово'.split('').forEach((ch,i)=>{const a=-Math.PI/2+i*2*Math.PI/5,e=document.createElement('div');e.className='let';e.textContent=ch;
      Object.assign(e.style,{width:'30px',height:'30px',left:(56+Math.cos(a)*34-15)+'px',top:(56+Math.sin(a)*34-15)+'px',fontSize:'19px'});el.appendChild(e);});}
  $('shopList').querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{shopTab=b.dataset.t;SND.tap();openShop();});
  $('shopList').querySelectorAll('.item .btn:not(.pbuy)').forEach(b=>b.onclick=()=>buyItem(isZ,b.dataset.id));
}
// баба Зина отвечает в своём пузыре наверху экрана (тост его перекрывал)
function shopSay(t,mood){const p=document.querySelector('#shopList .dhead p'),av=document.querySelector('#shopList .dhead .av');if(p)p.textContent=t;if(av)av.innerHTML=zinaSVG(mood||'happy');$('shopList').scrollTop=0;}
function buyItem(isZ,id){
  const it=(isZ?outfitOf:skinOf)(id),k=(isZ?'o:':'s:')+id;
  if(!owned(isZ?'o':'s',it)){
    if(S.coins<it.p){SND.bad();shortModal(it,isZ,id);return;}
    SND.tap();
    modal(`<h2>Купить?</h2><div style="width:110px;height:110px;margin:4px auto;position:relative">${isZ?zinaSVG('happy',id):`<div class="mini" id="cfPv" style="width:110px;height:110px"><div class="plate"></div></div>`}</div>
      <p>«${it.n}» за <b>${it.p}</b> <span class="coin" style="width:16px;height:16px;vertical-align:-2px"></span>. У тебя ${S.coins}.</p>
      <div class="btns"><button class="btn green" id="mYes">Да, купить</button><button class="btn ghost" id="mNo">Подумаю</button></div>`);
    if(!isZ)applySkin($('cfPv'),id);
    $('mNo').onclick=()=>{hideModal();SND.tap();};
    $('mYes').onclick=()=>{hideModal();if(S.coins<it.p)return;S.own=S.own||{};S.own[k]=1;addCoins(-it.p);SND.coin();
      if(isZ)S.outfit=id;else S.skin=id;save();openShop();shopSay(say(isZ?'buy':'buyPlate'),'happy');};
    return;
  }
  SND.tap();if(isZ)S.outfit=id;else S.skin=id;
  save();openShop();shopSay(isZ?pick(['Переоделась! Как тебе?','Вот, так-то лучше.','Ну как, похожа на артистку?']):pick(['Поставила новое блюдце.','Сменила блюдце — буквы довольны.']),'happy');
}

// не хватает на облик: предложить монеты за рекламу (ECO.adCoins, не больше ECO.adCoinsDay раз в день)
function adCoinsLeft(){const d=todayKey();if(!S.adc||S.adc.d!==d)return ECO.adCoinsDay;return Math.max(0,ECO.adCoinsDay-S.adc.n);}
function shortModal(it,isZ,id){
  const n=it.p-S.coins,left=adsOk()?adCoinsLeft():0,cn=' <span class="coin" style="width:16px;height:16px;vertical-align:-2px"></span>';
  modal(`<h2>Монеток маловато</h2><div style="width:110px;height:110px;margin:4px auto;position:relative">${isZ?zinaSVG('norm',id):`<div class="mini" id="cfPv" style="width:110px;height:110px"><div class="plate"></div></div>`}</div>
    <p>«${it.n}» — <b>${it.p}</b>${cn}, у тебя ${S.coins}. Не хватает <b>${n}</b>.</p>
    ${left?`<p style="font-size:14.5px">Посмотри рекламу — дам <b>+${ECO.adCoins}</b>${cn}. Сегодня можно ещё ${left} ${plural(left,'раз','раза','раз')}.</p>`:`<p style="font-size:14.5px">${adsOk()?'На сегодня рекламные монетки кончились. ':''}Проходи уровни — накопим!</p>`}
    <div class="btns">${left?`<button class="btn green" id="mAd">🎬 +${ECO.adCoins} за рекламу</button>`:''}<button class="btn ghost" id="mNo">${left?'Потом':'Хорошо'}</button></div>`);
  if(!isZ)applySkin($('cfPv'),id);
  $('mNo').onclick=()=>{hideModal();SND.tap();shopSay('Проходи уровни — накопим! Я пока в старом похожу.','norm');};
  const b=$('mAd');if(b)b.onclick=()=>{if(b.disabled)return;b.disabled=true;
    showRewarded(()=>{const d=todayKey();if(!S.adc||S.adc.d!==d)S.adc={d,n:0};S.adc.n++;hideModal();addCoins(ECO.adCoins);SND.coin();
      if(document.querySelector('.screen.on')===$('shopS')){openShop();const r=it.p-S.coins;shopSay(r>0?`Держи +${ECO.adCoins}! До «${it.n}» осталось ${r}.`:`Держи +${ECO.adCoins}! Теперь хватает на «${it.n}» — бери!`,'happy');}},
      ()=>{b.disabled=false;});};
}

/* ================= рейтинг и статистика ================= */
const LB_NAME='words';
const wordsTotal=()=>(S.found||0)+(S.bonusAll||0);
let lbLast=0,lbObj=null;
async function lbApi(){
  if(!ysdk)return null;if(lbObj)return lbObj;
  if(ysdk.leaderboard&&ysdk.leaderboard.setScore)lbObj={set:v=>ysdk.leaderboard.setScore(LB_NAME,v),get:o=>ysdk.leaderboard.getEntries(LB_NAME,o)};
  else if(ysdk.getLeaderboards){const lb=await ysdk.getLeaderboards();lbObj={set:v=>lb.setLeaderboardScore(LB_NAME,v),get:o=>lb.getLeaderboardEntries(LB_NAME,o)};}
  return lbObj;
}
const ypAuth=()=>{try{return !!YP&&(YP.isAuthorized?YP.isAuthorized():YP.getMode()!=='lite');}catch(e){return false;}};
// Яндекс разрешает запись не чаще раза в секунду — шлём после победы, с запасом
function lbSubmit(force){
  if(!ysdk||!ypAuth()||(!force&&Date.now()-lbLast<5000))return;lbLast=Date.now();
  lbApi().then(a=>a&&a.set(wordsTotal())).catch(()=>{});
}
// звания по числу слов — шуточные, от первоклашки до академика
const RANKS=[[0,'первоклашка с букварём'],[50,'твёрдый троечник'],[200,'хорошист'],[500,'отличник'],[1000,'гордость школы'],[2000,'победитель олимпиады'],[3500,'учитель года'],[5000,'кандидат наук'],[8000,'академик'],[12000,'ходячий словарь Даля']];
const rankName=n=>RANKS.filter(r=>n>=r[0]).pop()[1];
function statsHtml(){
  const days=S.bestStreak||S.streak||0;
  return `<div class="stats">
    <div class="stat big"><b>${wordsTotal()}</b><small>слов найдено всего</small><div style="margin-top:6px;font-weight:800;color:var(--ink)">Звание: ${rankName(wordsTotal())}</div></div>
    <div class="stat"><b>${S.found||0}</b><small>в кроссвордах</small></div>
    <div class="stat"><b>${S.bonusAll||0}</b><small>бонусных (в банку)</small></div>
    <div class="stat"><b>${Math.min(S.lv,LEVELS.length)}</b><small>${plural(S.lv,'уровень пройден','уровня пройдено','уровней пройдено')}</small></div>
    <div class="stat"><b>🏅 ${exCount()}</b><small>без подсказок</small></div>
    <div class="stat"><b>${Object.keys(S.dict).length}</b><small>слов в словаре Зины</small></div>
    <div class="stat"><b>🔥 ${S.streak||0}</b><small>серия дней${days>(S.streak||0)?' (лучшая '+days+')':''}</small></div>
  </div>`;
}
function openRating(){
  show('rateS');
  let h=`<div class="dhead"><div class="av">${zinaSVG('wow')}</div><p>${say('rating')}</p></div>${statsHtml()}`;
  if(ysdk)h+='<div class="lbbox" id="lbBox"><h3>🏆 Лучшие грамотеи</h3><p style="color:var(--ink2);margin:6px 0">Загружаю таблицу… Надеваю очки…</p></div>';
  else if(VK)h+=`<div class="lbbox"><h3>🏆 Рейтинг друзей</h3><p style="color:var(--ink2);margin:6px 0 10px;font-size:15px">Посмотри, кто из друзей нашёл больше слов. Или пригласи их — пусть попотеют!</p>
    <button class="btn blue" id="vkLb" style="width:100%">Таблица друзей</button></div>`;
  else h+=`<p style="text-align:center;color:var(--ink2);font-size:14px">${PLAT==='vk'?'Таблица друзей сейчас недоступна — загляни чуть позже.':'Общая таблица сейчас недоступна.'} А пока соревнуйся с собой — тоже полезно!</p>`;
  $('rateList').innerHTML=h;$('rateList').scrollTop=0;
  const vb=$('vkLb');if(vb)vb.onclick=()=>{SND.tap();vkSend('VKWebAppShowLeaderBoardBox',{user_result:wordsTotal()},60000).catch(()=>toast('Таблица сейчас недоступна — загляни чуть позже'));};
  if(ysdk)loadBoard();
}
async function loadBoard(){
  const box=$('lbBox');
  try{const a=await lbApi();if(!a)throw 0;
    if(ypAuth())await a.set(wordsTotal()).catch(()=>{});
    const r=await a.get({quantityTop:10,includeUser:ypAuth(),quantityAround:3});
    if(!$('rateS').classList.contains('on'))return;
    const me=r.userRank,esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    let h='<h3>🏆 Лучшие грамотеи</h3>';
    const rows=(r.entries||[]);if(!rows.length)h+='<p style="color:var(--ink2)">Пока пусто. Будь первым — место у окошка свободно!</p>';
    let prev=0;for(const e of rows){if(prev&&e.rank>prev+1)h+='<div class="lbrow"><span class="r">…</span></div>';prev=e.rank;
      const p=e.player||{},av=p.getAvatarSrc?p.getAvatarSrc('small'):'';
      h+=`<div class="lbrow${e.rank===me?' me':''}"><span class="r">${e.rank<=3?['🥇','🥈','🥉'][e.rank-1]:e.rank}</span>${av?`<img src="${esc(av)}" alt="">`:''}<span class="n">${esc(p.publicName||'Скромный внучок')}</span><span class="s">${e.score}</span></div>`;}
    if(!ypAuth())h+=`<p style="color:var(--ink2);font-size:14px;margin:10px 0 8px">Чтобы попасть в таблицу, войди в Яндекс. А то запишу как «ученик без фамилии».</p><button class="btn blue" id="lbAuth" style="width:100%">Войти</button>`;
    box.innerHTML=h;
    const ab=$('lbAuth');if(ab)ab.onclick=()=>{SND.tap();ysdk.auth.openAuthDialog().then(async()=>{try{YP=await ysdk.getPlayer({scopes:false});cloudReady=false;cloudTry=0;cloudFails=0;await cloudLoad();}catch(e){}lbSubmit(true);openRating();}).catch(()=>{});};
  }catch(e){if(box)box.innerHTML='<h3>🏆 Лучшие грамотеи</h3><p style="color:var(--ink2)">Таблица сейчас не загрузилась. Интернет, наверное, опять чинят. Загляни попозже.</p>';}
}

/* ================= открытка из словаря ================= */
function wrapText(x,t,maxW){const out=[];let line='';for(const w of t.split(' ')){const tt=line?line+' '+w:w;if(x.measureText(tt).width>maxW&&line){out.push(line);line=w;}else line=tt;}if(line)out.push(line);return out;}
function rrect(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath();}
function svgImg(svg,sz){return new Promise(ok=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>ok(null);
  im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg.replace('<svg',`<svg width="${sz}" height="${sz}"`));setTimeout(()=>ok(null),1500);});}
async function drawCard(w){
  const W=1080,H=1080,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const F='"Trebuchet MS","Segoe UI",Roboto,Arial,sans-serif';
  // тетрадный лист в клетку с полями
  x.fillStyle='#fbf7ec';x.fillRect(0,0,W,H);x.strokeStyle='#dfe8f2';x.lineWidth=2;
  for(let i=0;i<=W;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke();}
  x.fillStyle='#f0b3ad';x.fillRect(96,0,5,H);
  // шапка
  x.textAlign='center';x.fillStyle='#e8661b';x.font=`800 34px ${F}`;x.fillText('📖  ТОЛКОВЫЙ СЛОВАРЬ БАБЫ ЗИНЫ',W/2+30,96);
  // карточка
  // короткое определение — крупнее, длинное — мельче; карточка по центру свободного места
  const cx=140,cw=860;let fs=60,lines;const fit=()=>{x.font=`500 ${fs}px ${F}`;lines=wrapText(x,DEFS[w],cw-100);};fit();
  while(lines.length*fs*1.35>(fs>46?260:400)&&fs>32){fs-=2;fit();}
  const ch=210+lines.length*fs*1.35+70,cy=Math.max(130,Math.round(130+(H-340-130-ch)/2));
  x.save();x.shadowColor='rgba(39,50,74,.18)';x.shadowBlur=30;x.shadowOffsetY=10;x.fillStyle='#fff';rrect(x,cx,cy,cw,ch,32);x.fill();x.restore();
  x.save();rrect(x,cx,cy,cw,ch,32);x.clip();x.fillStyle='#f0b3ad';x.fillRect(cx,cy,14,ch);x.restore();
  let ws=110;x.font=`900 ${ws}px ${F}`;const WU=yo(w).toUpperCase();while(x.measureText(WU).width>cw-220&&ws>56){ws-=6;x.font=`900 ${ws}px ${F}`;}
  x.textAlign='left';x.fillStyle='#1d4fa3';x.fillText(WU,cx+56,cy+60+ws*.8);
  x.fillStyle='#27324a';x.font=`500 ${fs}px ${F}`;lines.forEach((l,i)=>x.fillText(l,cx+56,cy+210+i*fs*1.35+fs*.3));
  x.textAlign='right';x.fillStyle='#5d6781';x.font=`italic 600 40px ${F}`;x.fillText('— баба Зина',cx+cw-44,cy+ch-40);
  // красная пятёрка учительской ручкой
  x.save();x.translate(cx+cw-80,cy+70);x.rotate(.18);x.strokeStyle='#d0342c';x.lineWidth=6;x.beginPath();x.ellipse(0,0,56,46,0,0,Math.PI*2);x.stroke();
  x.fillStyle='#d0342c';x.font=`900 64px ${F}`;x.textAlign='center';x.fillText('5+',0,22);x.restore();
  // баба Зина и название игры
  const zy=Math.max(cy+ch+30,H-330);const im=await svgImg(zinaSVG('happy'),300);
  if(im)x.drawImage(im,120,zy,300,300);
  x.textAlign='left';x.font=`900 84px ${F}`;x.fillStyle='#1d4fa3';const tx=450,ty=zy+160;
  x.fillText('Баба Зина',tx,ty);
  x.fillStyle='#e8661b';x.font=`900 48px ${F}`;x.fillText('слова из букв',tx+4,ty+62);
  return c;
}
// открытка: показать, поделиться (если телефон умеет файлы), на стену VK или сохранить картинку
async function shareDef(w,back){
  SND.tap();let c;try{c=await drawCard(w);}catch(e){toast('Не получилось нарисовать открытку');return;}
  shareImg(c,'slovo-'+w,`«${yo(w).toUpperCase()}» — ${DEFS[w]} — баба Зина. Игра «Баба Зина: слова из букв»`,back,'Толковый словарь бабы Зины','Отправь родным — пусть тоже посмеются!');}
// открытка за главу (аудит 14): «Я прошёл главу «Подъезд» с бабой Зиной»
async function shareChap(c,back){
  SND.tap();let cv;try{cv=await drawChapCard(c);}catch(e){toast('Не получилось нарисовать открытку');return;}
  const ch=CHAPTERS[c%CHAPTERS.length];
  shareImg(cv,'slovo-glava-'+(c+1),`Я прошёл главу «${ch.n}» с бабой Зиной! Игра «Баба Зина: слова из букв»`,back,'Баба Зина: слова из букв','Похвастайся родным — пусть знают, какой ты грамотей!');}
async function drawChapCard(c){
  const ch=CHAPTERS[c%CHAPTERS.length],W=1080,H=1080,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  const F='"Trebuchet MS","Segoe UI",Roboto,Arial,sans-serif';
  x.fillStyle='#fbf7ec';x.fillRect(0,0,W,H);x.strokeStyle='#dfe8f2';x.lineWidth=2;
  for(let i=0;i<=W;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke();}
  x.fillStyle='#f0b3ad';x.fillRect(96,0,5,H);
  x.textAlign='center';x.fillStyle='#e8661b';x.font=`800 38px ${F}`;x.fillText('🎉  ГЛАВА ПРОЙДЕНА!',W/2+30,110);
  const cx=140,cw=860,cy=150,chh=420;
  x.save();x.shadowColor='rgba(39,50,74,.18)';x.shadowBlur=30;x.shadowOffsetY=10;x.fillStyle='#fff';rrect(x,cx,cy,cw,chh,32);x.fill();x.restore();
  x.save();rrect(x,cx,cy,cw,chh,32);x.clip();x.fillStyle=ch.c||'#dbe7fb';x.fillRect(cx,cy,cw,150);x.restore();
  x.font=`110px ${F}`;x.fillText(ch.e,W/2+30,cy+120);
  x.fillStyle='#5d6781';x.font=`600 44px ${F}`;x.fillText('Я прошёл главу',W/2+30,cy+220);
  let fs=96;const nm='«'+ch.n+'»';x.font=`900 ${fs}px ${F}`;while(x.measureText(nm).width>cw-80&&fs>50){fs-=6;x.font=`900 ${fs}px ${F}`;}
  x.fillStyle='#1d4fa3';x.fillText(nm,W/2+30,cy+220+fs*1.05);
  x.fillStyle='#5d6781';x.font=`600 40px ${F}`;x.fillText('с бабой Зиной · уровни '+(c*CH_LEN+1)+'–'+(c+1)*CH_LEN,W/2+30,cy+chh-40);
  x.save();x.translate(cx+cw-70,cy+60);x.rotate(.18);x.strokeStyle='#d0342c';x.lineWidth=6;x.beginPath();x.ellipse(0,0,56,46,0,0,Math.PI*2);x.stroke();
  x.fillStyle='#d0342c';x.font=`900 64px ${F}`;x.textAlign='center';x.fillText('5+',0,22);x.restore();
  const zy=H-330,im=await svgImg(zinaSVG('wow'),300);if(im)x.drawImage(im,120,zy,300,300);
  x.textAlign='left';x.font=`900 84px ${F}`;x.fillStyle='#1d4fa3';x.fillText('Баба Зина',450,zy+160);
  x.fillStyle='#e8661b';x.font=`900 48px ${F}`;x.fillText('слова из букв',454,zy+222);
  return cv;
}
// показать картинку-открытку: поделиться файлом (телефон), на стену VK, сохранить или «нажми и подержи» (клиент VK)
function shareImg(c,name,txt,back,title,sub){
  const url=c.toDataURL('image/png');
  c.toBlob(blob=>shareImg2(c,url,blob,name,txt,back,title,sub),'image/png');}
function shareImg2(c,url,blob,w,txt,back,title,sub){
  let file=null;try{file=new File([blob],w+'.png',{type:'image/png'});}catch(e){}
  const canFiles=!!(file&&navigator.canShare&&navigator.canShare({files:[file]}));
  // в клиенте VK на телефоне скачать файл нельзя — предлагаем сохранить картинку долгим нажатием (только здесь меню разрешено)
  const hold=!canFiles&&(VK_MOBILE||PLAT==='vk'&&TOUCH);
  modal(`<h2>Открытка</h2><p>${sub}</p><img class="cardimg" src="${url}" alt="Открытка">
    ${hold?'<p style="font-size:15px">Чтобы сохранить, нажми на картинку и подержи палец.</p>':''}
    <div class="btns">${hold?'':`<button class="btn green" id="cShare">${canFiles?'📤 Поделиться':'💾 Сохранить картинку'}</button>`}
      ${VK?'<button class="btn blue" id="cWall">На стену ВКонтакте</button>':''}
      <button class="btn ghost small" id="cBack">${back?'← Назад':'Закрыть'}</button></div>`);
  const done=()=>{if(back)back();else hideModal();};
  // скачать: проверить, получилось ли, браузер не даёт — поэтому не обещаем «сохранено», а подсказываем запасной путь
  const download=()=>{const a=document.createElement('a');a.href=url;a.download=w+'.png';document.body.appendChild(a);a.click();a.remove();
    toast(TOUCH?'Если картинка не скачалась — нажми на неё и подержи палец':'Картинка скачивается — ищи её в «Загрузках»');};
  $('cBack').onclick=()=>{SND.tap();done();};
  // сначала системное «Поделиться» с файлом (телефон), не вышло — просто скачиваем
  const cs=$('cShare');if(cs)cs.onclick=()=>{if(!canFiles){download();return;}
    navigator.share({files:[file],title:title,text:txt}).catch(e=>{if(!e||e.name!=='AbortError')download();});};
  const wb=$('cWall');if(wb)wb.onclick=()=>{const id=new URLSearchParams(location.search).get('vk_app_id');
    vkSend('VKWebAppShowWallPostBox',{message:txt+(id?'\nhttps://vk.com/app'+id:'')},60000).catch(()=>{});};
}

/* ================= возвращение: ярлык, оценка, избранное, приглашение ================= */
// После победы — одна скромная кнопка в окне, не чаще одного предложения за сессию и не в первые 2 минуты.
// Каждое предлагаем не больше 3 раз и не чаще раза в 3 дня; согласился — больше не предлагаем (S.ask).
const ASK_CAN={};let askShown=false;
async function askProbe(){
  try{if(ysdk){if(ysdk.shortcut&&ysdk.shortcut.canShowPrompt){const r=await ysdk.shortcut.canShowPrompt();ASK_CAN.shortcut=!!(r&&r.canShow);}
      if(ysdk.feedback&&ysdk.feedback.canReview){const r=await ysdk.feedback.canReview();ASK_CAN.review=!!(r&&r.value);}}
    else if(VK){ASK_CAN.fav=true;ASK_CAN.invite=true;
      const r=await vkSend('VKWebAppAddToHomeScreenInfo',{},4000).catch(()=>null);ASK_CAN.home=!!(r&&r.is_feature_supported&&!r.is_added_to_home_screen);}}catch(e){}}
const ASKS=[
  {k:'shortcut',can:()=>ASK_CAN.shortcut,wins:3,t:'📌 Ярлык игры на рабочий стол',ok:'Ярлык на месте — заходи в гости!',
    run:()=>ysdk.shortcut.showPrompt().then(r=>r&&r.outcome==='accepted')},
  {k:'fav',can:()=>ASK_CAN.fav,wins:3,t:'⭐ Добавить игру в избранное',ok:'Добавила в избранное. Не потеряешь!',
    run:()=>vkSend('VKWebAppAddToFavorites',{},60000).then(r=>!!(r&&r.result))},
  {k:'home',can:()=>ASK_CAN.home,wins:6,t:'📱 Значок игры на экран телефона',ok:'Значок на экране — теперь я всегда под рукой!',
    run:()=>vkSend('VKWebAppAddToHomeScreen',{},60000).then(r=>!!(r&&r.result))},
  {k:'review',can:()=>ASK_CAN.review,wins:10,t:'⭐ Поставить оценку игре',ok:'Спасибо! Баба Зина ставит тебе пять.',
    run:()=>ysdk.feedback.requestReview().then(r=>{ASK_CAN.review=false;return !!(r&&r.feedbackSent);})},
  {k:'invite',can:()=>ASK_CAN.invite,wins:15,t:'👋 Позвать друзей в игру',ok:'Приглашения ушли. Будем соревноваться!',
    run:()=>vkSend('VKWebAppShowInviteBox',{},60000).then(r=>!!(r&&r.success!==false))}
];
function pickAsk(){
  if(askShown||SHOT||Date.now()-T0<120000)return null;
  const now=Date.now(),a=ASKS.find(x=>{const st=S.ask[x.k]||{};return x.can()&&(S.wins||0)>=x.wins&&!st.done&&(st.n||0)<3&&now-(st.t||0)>3*864e5;});
  if(!a)return null;askShown=true;const st=S.ask[a.k]=S.ask[a.k]||{};st.n=(st.n||0)+1;st.t=now;save();
  return {t:a.t,ok:a.ok,run:()=>a.run().then(ok=>{if(ok){S.ask[a.k].done=1;save();}return ok;})};
}
