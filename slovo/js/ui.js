'use strict';
/* ================= экраны и окна ================= */
function show(id){STAT.screen(id);document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));
  if(id!=='game'){stopTutorial();YG.stop();}
  if(id==='game')requestAnimationFrame(()=>{layoutGrid();layoutWheel();});}
// окно поверх уровня — для Яндекса это пауза геймплея (GameplayAPI.stop); закрыли — hideModal снова start, если идёт игра
function modal(html){if(typeof PAY!=='undefined')PAY.re=null;$('mcard').innerHTML=html;$('modal').classList.add('on');YG.stop();}
function hideModal(){$('modal').classList.remove('on');if(typeof introDone==='function')introDone();if(typeof inPlay==='function'&&inPlay())YG.start();}

/* ---------- меню ---------- */
function openMenu(){
  STAT.end('quit'); // ушли в меню посреди уровня (после победы уровня уже нет — ничего не пишет)
  show('menu');updCoins();STAT.once('menu');STAT.once('ready',{ms:Math.round(performance.now())});
  // баба Зина в текущем наряде (перерисовываем, только если сменился)
  const ha=$('heroArt');if(ha.dataset.o!==S.outfit){ha.dataset.o=S.outfit;ha.innerHTML=heroSVG();$('heroCat').onclick=()=>{SND.meow();$('mSay').textContent=say('cat');};}
  $('playLv').textContent=S.lv>=LEVELS.length?'':'· уровень '+(S.lv+1);
  const h=new Date().getHours();
  $('mSay').textContent=say(h>=23||h<5?'night':h>=5&&h<10&&Math.random()<.5?'morning':'hello');
  $('mRank').textContent=wordsTotal()?'🎓 Звание: '+rankName(wordsTotal()):'';
  // красная точка задания дня — не раньше 10-го уровня (новичка не зовём в трудное)
  $('dailyDot').classList.toggle('on',S.lv>=10&&!S.daily[todayKey()]);
  sndIcon();updGift();updMenuGoal();updDailyBadge();
  // гостинец дня — сам, один раз за сессию (вернувшийся игрок попадает сюда первым делом)
  if(lgDue()&&!lgAuto&&!SHOT){lgAuto=true;setTimeout(()=>{if($('menu').classList.contains('on')&&!$('modal').classList.contains('on')&&lgDue())openLogin();},500);}
}
let lgAuto=false;
// серия дней на кнопке задания дня: «🔥 3», пока серия жива (решено сегодня или вчера)
function updDailyBadge(){const e=$('dailyFire');if(!e)return;const n=S.streak||0,alive=S.lastDaily===String(todayKey())||S.lastDaily===dayKey(1);
  e.textContent=n>=2&&alive?'🔥'+n:'';e.style.display=n>=2&&alive?'':'none';}
/* ---------- «Гостинцы» (boost 02.10): подарок за каждый день захода — см. LOGIN в game.js ---------- */
// что будет в следующий раз (для строки «Завтра»)
function lgNextTxt(){const n=lgN();return lgItem(n)&&!owned('s',skinOf('guest'))?`блюдце «${skinOf('guest').n}» и <b>+${lgAmt(n)}</b> ${COIN_I}`:`<b>+${lgAmt(n)}</b> ${COIN_I}`;}
// строка «Завтра» — окно победы и меню: гостинец, буква дня, задание дня (что из этого игроку уже доступно)
function tmrHtml(){if(S.lv<LOGIN_FROM||!lgTaken())return '';
  return `Завтра: 🎁 гостинец ${lgNextTxt()}${ECO.freeLetter>0?' · 💡 буква даром':''}${S.lv>=10?' · 📅 новое задание':''}`;}
function openLogin(then){
  if(!lgDue()){if(then)then();return;}
  const n=lgN(),amt=lgAmt(n),item=lgItem(n)&&!owned('s',skinOf('guest')),first=!S.lg;
  S.lg={d:todayKey(),n:n+1};if(item){S.own=S.own||{};S.own['s:guest']=1;}addCoins(amt);cloudSoon(); // выдаём сразу: закрыл окно как угодно — подарок уже твой
  const k=n%LOGIN.length,cells=LOGIN.map((a,i)=>`<div class="wc${i===k?' now':''}${i<k?' got':''}"><small>${i+1}-й</small><b>${i<k?'✓':i===LOGIN.length-1&&n<LOGIN.length?'🍽️':'+'+a}</b></div>`).join('');
  modal(`<h2>🎁 Гостинец от бабы Зины</h2><div style="width:100px;height:100px;margin:2px auto">${zinaSVG('happy')}</div>
    <p>${first?'Кто ко мне заходит — без гостинца не уходит. Заходи каждый день: чем дальше, тем гостинец больше!':pick(['Пришёл! А я уж гостинец приготовила.','Опять ты! Ну держи, заслужил.','Каждый день заходишь — вот это внук! Держи.','Я знала, что придёшь. Кот — не верил.'])}</p>
    <div class="week lg"><div class="wd">${cells}</div></div>
    <div class="reward big" id="mRew">+${amt} <span class="coin"></span></div>
    ${item?`<p style="font-weight:800;color:var(--ink)">И блюдце «${skinOf('guest').n}» — оно уже в «Обликах»!</p>`:''}
    <p class="tmr">${tmrHtml()}</p>
    <div class="btns"><button class="btn green" id="mGo">Спасибо, баба Зина!</button></div>`);
  SND.coin();coinBurst($('mRew'),amt);updGift();
  $('mGo').onclick=()=>{hideModal();SND.tap();if(then)then();};
}
// цель в меню: глава и ближайший облик одной полосой под «Играть»
function updMenuGoal(){const e=$('mGoal');if(!e)return;const on=S.lv>=1&&S.lv<LEVELS.length;e.style.display=on?'':'none';
  if(on){const ch=chapOf(S.lv);e.innerHTML=`${ch.e} ${ch.n} <b>${S.lv%CH_LEN}/${CH_LEN}</b> · ${goalHtml()}`;e.classList.toggle('can',goalCan());e.onclick=goalCan()?goShop:null;}}
// подарок дня: +ECO.gift монет за ролик, раз в день, по нажатию (с 3-го уровня; есть реклама — есть кнопка)
const giftTaken=()=>!!(S.gift&&S.gift.d===todayKey());
function updGift(){const b=$('btnGift'),t=$('mTmr');if(!b)return;const lg=lgDue(),on=lg||S.lv>=3&&ECO.gift>0&&adsOk()&&!giftTaken();
  b.style.display=on?'':'none';b.classList.toggle('gold',lg);b.classList.toggle('ghost',!lg);
  if(on&&!lg)STAT.offer('gift');
  if(on&&!b.disabled)b.innerHTML=lg?`🎁 Гостинец дня: <span class="nw">+${lgAmt(lgN())} ${COIN_I}</span> — забрать`:`🎁 Подарок дня: +${ECO.gift} ${COIN_I} за рекламу`;
  // когда всё сегодняшнее забрано — строка «Завтра» (просто текст, не кнопка)
  if(t){const h=on?'':tmrHtml();t.innerHTML=h;t.style.display=h?'':'none';}}
function takeGift(){const b=$('btnGift');if(!b||b.disabled)return;if(lgDue()){SND.tap();openLogin();return;}if(giftTaken())return;SND.tap();b.disabled=true;STAT.place('gift');
  showRewarded(()=>{b.disabled=false;if(giftTaken()){updGift();return;}S.gift={d:todayKey()};addCoins(ECO.gift);SND.coin();updGift();
    $('mSay').textContent=pick(['Держи +'+ECO.gift+'! Из пенсии отложила. Завтра приходи — ещё припасу.','Вот тебе +'+ECO.gift+' на подсказки. Только не на семечки!']);},
    ()=>{b.disabled=false;},
    ()=>{if(giftTaken())return '';S.gift={d:todayKey()};addCoins(ECO.gift);SND.coin();updGift();return 'держи подарок: +'+ECO.gift;});} // поздний зачёт (adt): подарок — всегда, если сегодня ещё не взят
// значок + подпись; выключенное — другим значком и словом, а не прозрачностью
function sndIcon(){$('btnSnd').innerHTML=(S.sound?'🔊':'🔇')+'<small>'+(S.sound?'Звук':'Без звука')+'</small>';
  $('btnMus').innerHTML=(S.music?'🎵':'🔕')+'<small>'+(S.music?'Музыка':'Без музыки')+'</small>';$('btnMus').classList.toggle('off',!S.music);$('btnSnd').classList.toggle('off',!S.sound);}

/* ---------- главы ---------- */
function openChapters(){
  show('chapters');const n=Math.ceil(LEVELS.length/CH_LEN);let h='';
  const doneCh=Math.floor(S.lv/CH_LEN);
  $('chapSub').textContent='Пройдено уровней: '+S.lv+' из '+LEVELS.length;
  for(let c=0;c<n;c++){const ch=CHAPTERS[c%CHAPTERS.length],from=c*CH_LEN,done=clamp(S.lv-from,0,CH_LEN),lock=S.lv<from;
    h+=`<button class="chap${lock?' locked':''}" data-c="${c}"><div class="em" style="background:${ch.c}">${lock?'🔒':ch.e}</div>
      <div class="ct"><b>${c+1}. ${ch.n}</b><small>${lock?'Откроется после главы «'+CHAPTERS[(c-1+CHAPTERS.length)%CHAPTERS.length].n+'»':ch.s}</small>
      <div class="bar"><i style="width:${done/CH_LEN*100}%"></i></div></div>
      <div style="font-weight:800;color:var(--ink2);font-size:14px;text-align:center">${done===CH_LEN?'✅'+(S.chg&&S.chg[c]?'<div style="font-size:12px;margin-top:3px">🎁 получено</div>':''):done+'/'+CH_LEN}${chEx(c)?`<div style="font-size:12px;margin-top:3px">🏅${chEx(c)}</div>`:''}</div></button>`;}
  $('chapList').innerHTML=h;
  $('chapList').querySelectorAll('.chap').forEach(b=>b.onclick=()=>{const c=+b.dataset.c;if(S.lv<c*CH_LEN){toast('Сначала пройди предыдущую главу');return;}SND.tap();openLevels(c);});
  const cur=$('chapList').children[Math.min(doneCh,n-1)];if(cur)setTimeout(()=>cur.scrollIntoView({block:'center'}),0);
}
const chEx=c=>{let n=0;for(let i=c*CH_LEN;i<(c+1)*CH_LEN;i++)if(exGet(i))n++;return n;};
function openLevels(c){
  show('levels');const ch=CHAPTERS[c%CHAPTERS.length];$('lvTitle').textContent=ch.e+' '+ch.n;$('lvSub').textContent=ch.s;
  let h='';for(let i=c*CH_LEN;i<Math.min((c+1)*CH_LEN,LEVELS.length);i++){
    const st=i<S.lv?'done':i===S.lv?'cur':'lock';const d=LEVELS[i].d;
    h+=`<button class="lv ${st}${isTest(i)?' test':''}" data-i="${i}">${i+1}${d&&S.dict[d]?'<span class="bk">📖</span>':''}${exGet(i)?'<span class="ex" title="Без подсказок">🏅</span>':''}${st==='lock'?'<span class="lk">🔒</span>':''}</button>`;}
  $('lvList').innerHTML=h;
  $('lvList').querySelectorAll('.lv').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(i>S.lv){toast('Сначала пройди уровень '+(S.lv+1));return;}SND.tap();maybeInterstitial(()=>startLevel(i));});
}

/* ---------- словарь бабы Зины ---------- */
let dictTab='mine',dictQ='',dictAll=null,dictT=0;
const COLL=typeof Intl!=='undefined'&&Intl.Collator?new Intl.Collator('ru'):{compare:(a,b)=>a<b?-1:a>b?1:0};
const yo=w=>(typeof DEFS_YO!=='undefined'&&DEFS_YO[w])||w; // заголовок статьи — с «ё»: «ковёр», «тёща»
function openDict(){
  show('dictS');const all=dictAll||(dictAll=Object.keys(DEFS).sort((a,b)=>COLL.compare(yo(a),yo(b))));const got=all.filter(w=>S.dict[w]);
  $('dictSub').textContent='Собрано '+got.length+' из '+all.length;
  $('dictList').innerHTML=`<div class="dhead"><div class="av">${zinaSVG('happy')}</div><p>Всю жизнь проверяла чужие тетради и поняла: у каждого слова есть <b>настоящее</b> значение. Проходи уровни — буду открывать тебе свой словарь.</p></div>
   <div class="tabs"><button data-t="mine" class="${dictTab==='mine'?'on':''}">Открытые (${got.length})</button><button data-t="all" class="${dictTab==='all'?'on':''}">Все слова</button></div>
   <input class="search" id="dictQ" type="search" placeholder="Найти слово…" autocomplete="off" enterkeyhint="search" value="${dictQ.replace(/[&"<]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;'}[c]))}"><div id="dictItems"></div>`;
  $('dictList').scrollTop=0;
  $('dictList').querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{dictTab=b.dataset.t;SND.tap();openDict();});
  const q=$('dictQ');q.oninput=()=>{dictQ=q.value;clearTimeout(dictT);dictT=setTimeout(()=>dictItems(all,got),150);};
  $('dictList').onclick=e=>{const b=e.target.closest&&e.target.closest('.sh');if(b&&b.dataset.w)shareDef(b.dataset.w);};
  q.onkeydown=e=>{if(e.key==='Enter')q.blur();};
  dictItems(all,got);
}
// поиск по слову и по тексту определения; закрытые слова в поиске не выдаём — сюрприз не портим
function dictItems(all,got){
  const q=dictQ.trim().toLowerCase().replace(/ё/g,'е');let h='';
  const card=w=>`<div class="dict hs"><b>${yo(w)}</b><button class="sh" data-w="${w}" title="Поделиться открыткой" aria-label="Открытка">📤</button><p>${DEFS[w]}</p></div>`;
  if(q){const norm=t=>t.toLowerCase().replace(/ё/g,'е');
    const byWord=got.filter(w=>w.includes(q)).sort((a,b)=>(b.startsWith(q)-a.startsWith(q))||COLL.compare(yo(a),yo(b)));
    const inText=got.filter(w=>!w.includes(q)&&norm(DEFS[w]).includes(q));
    const hidden=all.filter(w=>!S.dict[w]&&w.startsWith(q)).length;
    for(const w of byWord)h+=card(w);
    if(inText.length)h+=`<p class="dgrp">В тексте шуток</p>`+inText.map(card).join('');
    if(!byWord.length&&!inText.length)h+=`<p style="text-align:center;color:var(--ink2)">${hidden?'Такое слово в словаре есть, но пока закрыто. Проходи уровни — открою!':'Не нашла. Даже в очках смотрела. Может, по-другому пишется?'}</p>`;
    else if(hidden)h+=`<p style="text-align:center;color:var(--ink2);font-size:14px">И ещё ${hidden} ${plural(hidden,'закрытое слово','закрытых слова','закрытых слов')} — откроются за уровни.</p>`;
  }else if(dictTab==='mine'){
    if(!got.length)h+='<p style="text-align:center;color:var(--ink2)">Пока пусто. Пройди первый уровень!</p>';
    for(const w of got)h+=card(w);
  }else{
    for(const w of all)h+=S.dict[w]?card(w):`<div class="dict lock"><b>${w[0]}${'•'.repeat(w.length-1)}</b><p>Откроется за один из уровней</p></div>`;
  }
  $('dictItems').innerHTML=h;
}

/* ---------- победа ---------- */
// следующее ещё не открытое определение (порядок перемешан, но одинаков у всех)
function nextDef(){
  const order=Object.keys(DEFS).map(w=>{let h=7;for(const c of w)h=(h*31+c.charCodeAt(0))%1000003;return [h,w];}).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  const reserved=new Set(LEVELS.map(l=>l.d).filter(Boolean));
  return order.find(w=>!S.dict[w]&&!reserved.has(w))||order.find(w=>!S.dict[w]);
}
function defCardHtml(w,isNew,share){return `<div class="defcard${isNew?' new':''}"><div class="tag">📖 Толковый словарь бабы Зины</div><div class="word">${yo(w)}</div><div class="def">${DEFS[w]}</div><div class="sig">${share?`<button class="sh" id="mShare">📤 Открытка</button>`:''}<span>— баба Зина</span></div></div>`;}
// награда и прогресс записываются сразу, окно — следом (можно уйти в меню, ничего не потеряв)
function finishLevel(g){
  // задание дня начато до полуночи, дорешано после — засчитываем дню задания (из ключа уровня), серию считаем от него же
  const dk=g.daily?+String(g.key).slice(1)||todayKey():todayKey(),prevDay=g.daily?dayKeyOf(dk,1):'';
  const first=g.daily?!S.daily[dk]:g.idx>=S.lv;
  let reward=first?(g.daily?ECO.daily(1):ECO.lvl(g.idx)*(isTest(g.idx,g.daily)?ECO.test:1)):ECO.replay;
  // «Отличник» — без подсказок; монеты — один раз за уровень (за задание дня — в день решения)
  const exc=!g.hinted;let exBonus=0;
  if(exc){if(g.daily){if(first)exBonus=EX_BONUS;}else if(!exGet(g.idx)){exSet(g.idx);exBonus=EX_BONUS;}}
  reward+=exBonus;
  // определение уровня; если его нет — последнее новое слово из словаря, найденное на уровне, или следующее из книги
  let dw=g.lv.d&&DEFS[g.lv.d]?g.lv.d:g.newDefs[g.newDefs.length-1];
  if(!dw&&first)dw=nextDef();
  const isNew=!!dw&&(g.newDefs.includes(dw)||!S.dict[dw]);
  if(dw)S.dict[dw]=1;
  let streak=0,sbonus=0;
  if(g.daily&&first){
    S.streak=S.lastDaily===prevDay?(S.streak||0)+1:S.lastDaily===String(dk)?S.streak||1:1;if(+S.lastDaily<dk)S.lastDaily=String(dk);S.daily[dk]=1;
    S.bestStreak=Math.max(S.bestStreak||0,S.streak);streak=S.streak;sbonus=ECO.daily(S.streak)-ECO.daily(1);reward+=sbonus;}
  // «Тетрадь недели»: 5 заданий дня из 7 за неделю (пн–вс) — подарок, раз в неделю
  let week=0;if(g.daily&&first){const wd=weekDays(dk);if(wd.filter(k=>S.daily[k]).length>=WEEK.need&&!(S.wk&&S.wk.w>=wd[0])){S.wk={w:wd[0]};week=WEEK.gift;reward+=week;}}
  // финал главы: подарок за главу один раз (S.chg), отдельно от награды за уровень (×2 за рекламу на него не действует)
  let chap=0;if(!g.daily&&first&&(g.idx+1)%CH_LEN===0){const c=Math.floor(g.idx/CH_LEN);S.chg=S.chg||{};if(!S.chg[c]){S.chg[c]=1;chap=ECO.chap;}}
  // «Отличник» громко (печать и фраза) — в первый раз и потом каждый 5-й; остальные — значок у монет
  let exLoud=false;if(exc&&first){S.exAll=(S.exAll||0)+1;exLoud=S.exAll%5===1;}
  if(!g.daily&&first)S.lv=Math.max(S.lv,g.idx+1);
  delete S.curs[g.key];addCoins(reward+chap);save();cloudSoon();
  const rank1=rankName(wordsTotal()),rankUp=g.rank0&&rank1!==g.rank0?rank1:'';
  if(first)S.wins=(S.wins||0)+1;
  return {first,reward,base:reward-exBonus-sbonus-week,dw,isNew,streak,sbonus,exc,exBonus,exLoud,week,chap,dk,rankUp,test:first&&isTest(g.idx,g.daily)};
}
// текст золотой кнопки: «×2» — только когда прибавка ровно равна награде, иначе честно «ещё +N (итого +M)»
function x2Txt(a,extra){return extra===a?`×2 за рекламу: <span class="nw">+${a} → +${a*2} ${COIN_I}</span>`:`За рекламу ещё <span class="nw">+${extra} ${COIN_I}</span> (итого +${a+extra})`;}
function winModal(g,r,again){
  const {first,reward,dw,isNew}=r,hasDef=!!dw;
  const streakTxt=r.streak?`<p>🔥 Серия: <b>${r.streak} ${plural(r.streak,'день','дня','дней')}</b></p>`:'';
  const last=!g.daily&&first&&g.idx+1>=LEVELS.length,chapDone=!g.daily&&first&&!last&&(g.idx+1)%CH_LEN===0;
  // заголовок выбираем один раз — после «Открытка → Назад» он не меняется; не повторяем слова последней реплики («Иди поешь» дважды)
  const title=r.title||(r.title=last?'Все уровни пройдены!':chapDone?'Глава пройдена!':sayAvoid('win',(zina.h||[]).join(' ')));
  // «Дальше»: после нового уровня — следующий; после переигрывания старого — к текущему непройденному
  const nextI=g.daily||last?-1:first?g.idx+1:S.lv<LEVELS.length?S.lv:-1;
  const ch=chapOf(g.idx),chDone=clamp(S.lv-Math.floor(g.idx/CH_LEN)*CH_LEN,0,CH_LEN);
  const noX2=!g.daily&&g.idx<3; // решение владельца 02.10: на уровнях 1–3 кнопки «за рекламу» в окне победы нет (как в «Выезде»), с 4-го — есть
  const light=!g.daily&&g.idx<2; // окно первых уровней — полегче: без строк монет, цели и рекламы
  // аудит 14: окно короче — главное крупно (заголовок, словарь, монеты, кнопки), расшифровка — одной мелкой строкой
  const money=[r.base&&`+${r.base} за ${g.daily?'задание':r.test?'испытание (×2)':first?'уровень':'повтор'}`,r.exBonus&&!r.exLoud&&`🏅 +${r.exBonus} без подсказок`,
    r.exBonus&&r.exLoud&&`+${r.exBonus} Отличник`,r.sbonus&&`+${r.sbonus} за серию`,r.week&&`+${r.week} за неделю`,g.bonus.size&&`🍯 +${g.bonus.size} ${plural(g.bonus.size,'слово','слова','слов')} в банку`].filter(Boolean).join(' · ');
  // boost: на 10-м уровне объявляем задание дня (раз за игру); строка «Завтра» — когда сегодняшний гостинец уже взят
  if(!g.daily&&first&&g.idx===9&&!S.tip.dly){S.tip.dly=1;r.dly=1;save();}
  const tmr=light||g.daily?'':tmrHtml();
  const tomorrow=g.daily&&first?`<p style="font-size:14.5px">Завтра: <b>+${ECO.daily(r.streak+1)}</b> ${COIN_I} и серия ${r.streak+1} ${plural(r.streak+1,'день','дня','дней')}.</p>`:'';
  const ask=r.ask!==undefined?r.ask:(r.ask=first?pickAsk():null);
  const nextTxt=r.chap&&!r.chapSeen?'Дальше ▶':nextI<0?'В меню':nextI===g.idx+1?'Дальше ▶':'К уровню '+(nextI+1)+' ▶';
  modal(`<div class="${again?'':'win'}"><h2>${title}</h2>
    ${last?'<p>Все 400! Баба Зина уже сочиняет новые главы. А пока — задание дня каждый день.</p>':''}
    ${hasDef?defCardHtml(dw,isNew,true):`<div style="width:110px;height:110px;margin:4px auto">${zinaSVG('happy')}</div>`}
    ${r.exLoud?`<div class="stamp">🏅 ОТЛИЧНИК<small>без подсказок${r.exBonus?' · +'+coinsTxt(r.exBonus):''}</small></div><p class="exsay" style="font-size:15px">${r.exSay||(r.exSay=say('excellent'))}</p>`:''}
    ${r.rankUp?`<p class="rankup">🎓 Новое звание: <b>${r.rankUp}</b>!</p>`:''}
    ${streakTxt}
    <div class="reward big" id="mRew">+${reward} <span class="coin"></span>${r.exc&&!r.exLoud?'<span class="exb" title="Без подсказок">🏅</span>':''}</div>
    ${money&&!light&&!r.exLoud?`<p class="money">${money}</p>`:''}
    ${g.daily&&first?weekHtml(r.dk):''}
    ${tomorrow}
    ${r.dly?'<p class="dly">📅 Открылось <b>задание дня</b>: каждый день — новый кроссворд с подарком. Оно в меню.</p>':''}
    ${light||chapDone||last||g.daily||r.dly||ask?'':`<div class="goal${goalCan()?' can':''}" id="mGoalW">${ch.e} ${ch.n}: <b>${chDone}/${CH_LEN}</b> · ${goalHtml()}</div>`}
    ${tmr&&!ask?`<p class="tmr">${tmr}</p>`:''}
    <div class="btns">
      <button class="btn green" id="mNext">${nextTxt}</button>
      ${first&&!light&&!noX2&&adsOk()?(r.x2?'<button class="btn gold" disabled>✅ Получено</button>':`<button class="btn gold" id="mX2">🎬 ${x2Txt(reward,Math.max(reward,ECO.x2min))}</button>`):''}
      ${ask?(ask.soc?`<div class="soc-o"><span>${ask.soc}</span><button class="btn ghost small" id="mAsk">${ask.t}</button></div>`:`<button class="btn ghost small" id="mAsk">${ask.t}</button>`):''}
    </div></div>`);
  fitWin();
  if(!again){SND.coin();coinBurst($('mRew'),reward);}
  const sh=$('mShare');if(sh)sh.onclick=()=>shareDef(dw,()=>winModal(g,r,true));
  const gw=$('mGoalW');if(gw&&goalCan()&&!(r.chap&&!r.chapSeen))gw.onclick=goShop; // хватает на облик — прямо из окна победы в магазин (уровень уже засчитан)
  // межэкранная — после любого пройденного уровня (и обычного, и задания дня), в момент перехода (правила — maybeInterstitial, core.js)
  // конец главы — сначала праздник главы (openChapFinale), переход и реклама — из него
  $('mNext').onclick=()=>{hideModal();SND.tap();
    if(r.chap&&!r.chapSeen){openChapFinale(g,r,nextI);return;}
    const go=()=>maybeInterstitial(()=>{if(nextI<0)openMenu();else startLevel(nextI);});
    // первая сессия: после 3-го уровня — первый гостинец и обещание на завтра (вернувшимся он выдаётся в меню)
    if(lgDue()&&!g.daily){lgAuto=true;openLogin(go);return;}
    go();};
  // кнопку блокируем сразу (двойной тап не даёт двойную награду); если реклама не удалась — возвращаем
  const x2=$('mX2');if(x2)STAT.offer('x2');if(x2)x2.onclick=()=>{if(r.x2||x2.disabled)return;x2.disabled=true;STAT.place('x2');
    showRewarded(()=>{if(r.x2)return;r.x2=1;addCoins(Math.max(reward,ECO.x2min));SND.coin();x2.textContent='✅ Получено: +'+(reward+Math.max(reward,ECO.x2min));coinBurst(x2,Math.max(reward,ECO.x2min));},()=>{if(!r.x2)x2.disabled=false;},
      ()=>{if(r.x2)return '';r.x2=1;const n=Math.max(reward,ECO.x2min);addCoins(n);SND.coin();if(document.body.contains(x2)){x2.disabled=true;x2.textContent='✅ Получено: +'+(reward+n);}return 'держи монеты: +'+n;});}; // поздний зачёт (adt)
  const ak=$('mAsk');if(ak&&!again)STAT.ev('mod',{m:ask.soc?'soc':'ask',a:'of_'+ask.k});
  if(ak)ak.onclick=()=>{if(ak.disabled)return;ak.disabled=true;SND.tap();r.ask=null;STAT.ev('mod',{m:ask.soc?'soc':'ask',a:'ok_'+ask.k});
    ask.run().then(ok=>{toast(ok?ask.ok:'Ну и ладно, в другой раз!');}).catch(()=>{toast('Не получилось. Ничего, в другой раз.');});
    ak.textContent='✓ '+ask.t.replace(/^\S+\s/,'');};
}
// окно победы не должно прокручиваться: не влезло — убираем второстепенное по очереди (фраза «Отличника», расшифровка монет, цель, шапка карточки, «Завтра»)
function fitWin(){const m=$('mcard'),w=m.firstElementChild;if(!w)return;const cs=getComputedStyle(m),pad=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0);
  for(const sel of['.exsay','.money','.goal','.defcard .tag','.rankup+p','.tmr']){if(w.offsetHeight+pad<=m.clientHeight+1)break;const e=w.querySelector(sel);if(e)e.style.display='none';}}
// финал главы (аудит 14): отдельное окно — глава позади, подарок ECO.chap (уже начислен в finishLevel), открытка «Я прошёл главу»
function openChapFinale(g,r,nextI,again){r.chapSeen=1;
  const c=Math.floor(g.idx/CH_LEN),ch=CHAPTERS[c%CHAPTERS.length],nx=nextI>=0?chapOf(nextI):null;
  r.chapSay=r.chapSay||pick(['Двадцать уровней! Я тобой горжусь — пойду соседкам расскажу.','Глава позади! Ставлю пятёрку в журнал и пирожок на стол.','Вот это усидчивость! У меня так только отличники занимались.','Молодец! Кот Ять даже встал с дивана — поздравить.']);
  modal(`<h2>🎉 Глава пройдена!</h2>
    <div class="chfin"><div class="em" style="background:${ch.c}">${ch.e}</div><div class="zz">${zinaSVG('wow')}</div>${nx?`<div class="em nx" style="background:${nx.c}">${nx.e}</div>`:''}</div>
    <p style="font-weight:800;color:var(--ink);font-size:17px">«${ch.n}» позади!</p>
    <p>${r.chapSay}</p>
    <div class="reward big" id="mRew">+${r.chap} <span class="coin"></span></div><p class="money">подарок за главу</p>
    ${nx?`<p style="font-size:14.5px">Дальше — «${nx.n}» ${nx.e}. ${nx.s}</p>`:''}
    <div class="btns"><button class="btn green" id="mGo">${nx?'Дальше ▶':'В меню'}</button>
      ${adsOk()?(r.chx2?'<button class="btn gold" disabled>✅ Получено: +'+r.chap*2+'</button>':`<button class="btn gold" id="mChX2">🎬 ×2 за рекламу: <span class="nw">+${r.chap} → +${r.chap*2} ${COIN_I}</span></button>`):''}
      <button class="btn ghost small" id="mCard">📤 Открытка «Я прошёл главу»</button></div>`);
  if(!again){SND.win();SND.coin();confetti();buzz('win');coinBurst($('mRew'),r.chap);}
  const cx=$('mChX2');if(cx)STAT.offer('chap');if(cx)cx.onclick=()=>{if(r.chx2||cx.disabled)return;cx.disabled=true;STAT.place('chap');
    showRewarded(()=>{if(r.chx2)return;r.chx2=1;addCoins(r.chap);SND.coin();cx.textContent='✅ Получено: +'+r.chap*2;coinBurst(cx,r.chap);},()=>{if(!r.chx2)cx.disabled=false;},
      ()=>{if(r.chx2)return '';r.chx2=1;addCoins(r.chap);SND.coin();if(document.body.contains(cx)){cx.disabled=true;cx.textContent='✅ Получено: +'+r.chap*2;}return 'держи монеты: +'+r.chap;});}; // поздний зачёт (adt)
  $('mGo').onclick=()=>{hideModal();SND.tap();maybeInterstitial(()=>{if(nextI<0)openMenu();else startLevel(nextI);});};
  $('mCard').onclick=()=>shareChap(c,()=>openChapFinale(g,r,nextI,true));
}
// «Тетрадь недели»: 7 клеток пн–вс, решённый день — «5» красной ручкой; WEEK.need из 7 — подарок WEEK.gift (раз в неделю)
function weekDays(dk){const d=new Date(Math.floor(dk/10000),Math.floor(dk/100)%100-1,dk%100,12),wd=(d.getDay()+6)%7,out=[];
  for(let i=0;i<7;i++){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-wd+i,12);out.push(x.getFullYear()*10000+(x.getMonth()+1)*100+x.getDate());}return out;}
function weekHtml(dk){const days=weekDays(dk||todayKey()),n=days.filter(k=>S.daily[k]).length,got=!!(S.wk&&S.wk.w>=days[0]),tk=todayKey();
  const cells=['пн','вт','ср','чт','пт','сб','вс'].map((t,i)=>`<div class="wc${days[i]===tk?' now':''}"><small>${t}</small><b>${S.daily[days[i]]?'5':''}</b></div>`).join('');
  return `<div class="week"><div class="wt">📒 Тетрадь недели: <b>${n} из 7</b>${got?' · 🎁 подарок получен':` · за ${WEEK.need} — <b>+${WEEK.gift}</b> ${COIN_I}`}</div><div class="wd">${cells}</div></div>`;}

/* ---------- задание дня ---------- */
function openDaily(){
  SND.tap();STAT.screen('daily');
  if(S.daily[todayKey()]){modal(`<h2>📅 Задание дня</h2><div style="width:110px;height:110px;margin:4px auto">${zinaSVG('happy')}</div>
    <p>Сегодня уже решено! Серия: <b>${S.streak||0} ${plural(S.streak||0,'день','дня','дней')}</b>.</p><p>Приходи завтра — будет новое слово и подарок побольше.</p>${weekHtml()}
    <div class="btns"><button class="btn blue" id="mOk">Хорошо</button></div>`);$('mOk').onclick=hideModal;return;}
  const easy=S.lv<30,yk=dayKey(1);
  // мягкая серия: пропустил ровно один день — баба Зина «прикроет» за рекламу (раз в день)
  // без рекламы (VK без моста) спасать серию нечем — окно не показываем, серия начнётся заново
  if(S.lastDaily===dayKey(2)&&(S.streak||0)>=2&&!(S.fix&&S.fix.d===todayKey())){if(adsOk()){openStreakFix();return;}S.fix={d:todayKey()};save();}
  const ns=S.lastDaily===yk?(S.streak||0)+1:1,sb=ECO.daily(ns)-ECO.daily(1);
  modal(`<h2>📅 Задание дня</h2><div style="width:100px;height:100px;margin:4px auto">${zinaSVG('happy')}</div>
    <p>Награда: <b>${ECO.daily(1)+sb}</b> ${COIN_I}${sb?' (с бонусом за серию)':''} и ещё +${EX_BONUS} ${COIN_I}, если без подсказок.</p>
    <p>Серия: <b>${S.streak&&ns>1?S.streak:0} ${plural(S.streak&&ns>1?S.streak:0,'день','дня','дней')}</b>. ${ns>1?'Не прерывай!':'Начнём новую!'}</p>
    ${weekHtml()}
    ${easy?'<p style="font-size:14px">Задание подобрала полегче, но слов побольше — подсказки брать не стыдно.</p>':''}
    <div class="btns"><button class="btn green" id="mGo">Начать</button><button class="btn ghost small" id="mNo">Потом</button></div>`);
  $('mGo').onclick=()=>{hideModal();SND.tap();ac();maybeInterstitial(()=>startLevel(dailyIdx(),true));};$('mNo').onclick=()=>{hideModal();SND.tap();};
}
// ключ дня n дней назад (20260926)
function dayKey(n){const y=new Date(nowMs()-n*864e5);return String(y.getFullYear()*10000+(y.getMonth()+1)*100+y.getDate());}
// ключ дня за n дней до дня k (20260927 → 20260926)
function dayKeyOf(k,n){const y=new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100-n,12);return String(y.getFullYear()*10000+(y.getMonth()+1)*100+y.getDate());}
function openStreakFix(){const n=S.streak||0;
  modal(`<h2>🔥 Серия под угрозой</h2><div style="width:100px;height:100px;margin:4px auto">${zinaSVG('wow')}</div>
    <p>Вчера ты не заходил, и серия в <b>${n} ${plural(n,'день','дня','дней')}</b> вот-вот сгорит.</p><p>Посмотри рекламу — скажу, что ты болел, и серия продолжится.</p>
    <div class="btns"><button class="btn green" id="mFix">🎬 Спасти серию за рекламу</button><button class="btn ghost small" id="mNo">Начать заново</button></div>`);
  const b=$('mFix');STAT.offer('streak');b.onclick=()=>{if(b.disabled)return;b.disabled=true;STAT.place('streak');
    showRewarded(()=>{S.fix={d:todayKey()};S.lastDaily=dayKey(1);save();hideModal();toast('Серия спасена! Баба Зина прикрыла.');openDaily();},()=>{b.disabled=false;},
      // поздний зачёт (adt): серию спасаем, только пока открыто это же окно; иначе (уже «начал заново») — монеты по цене ролика (у серии цены в монетах нет)
      ()=>{if(!($('modal').classList.contains('on')&&document.body.contains(b)))return adLateCoins();S.fix={d:todayKey()};S.lastDaily=dayKey(1);save();hideModal();openDaily();return 'серия спасена!';});};
  $('mNo').onclick=()=>{S.fix={d:todayKey()};save();hideModal();openDaily();};}
// задание дня одно на весь день; новичкам (до 30-го уровня) — из тех, где 6 букв, а не 7
function dailyIdx(){const d=todayKey();if(S.dailyPick&&S.dailyPick.d===d)return S.dailyPick.i;
  let i=dayNum()%DAILY.length;if(S.lv<30){const easy=DAILY.map((l,j)=>l.l.length<=6?j:-1).filter(j=>j>=0);if(easy.length)i=easy[dayNum()%easy.length];}
  S.dailyPick={d,i};save();return i;}
// ближайший облик, на который копим
function goalItem(){const all=OUTFITS.map(o=>['o',o]).concat(SKINS.map(k=>['s',k])).filter(([t,it])=>!it.pay&&!it.gift&&!owned(t,it)).sort((a,b)=>a[1].p-b[1].p);return all[0]||null;}
const goalCan=()=>{const g=goalItem();return !!g&&S.coins>=g[1].p;};
function goShop(){const g=goalItem();if(g)shopTab=g[0]==='o'?'zina':'plate';SND.tap();hideModal();saveCur();G=null;openShop();}
function goalHtml(){const gi=goalItem();
  if(!gi)return 'Все облики куплены — баба Зина при параде!';const [t,it]=gi,nm=`«${it.n}»`;
  // что это такое — наряд или блюдце (аудит 14: «До «Общепит» осталось» было непонятно)
  return S.coins>=it.p?`Хватает на ${t==='o'?'наряд':'блюдце'} ${nm} — <b class="lnk">посмотреть ›</b>`:`До ${t==='o'?'наряда':'блюдца'} ${nm} осталось <b>${it.p-S.coins}</b> ${COIN_I}`;}
// облако пришло позже меню (VK) — обновить экран
// новичка мы сразу пустили в 1-й уровень — если облако принесло прогресс (другое устройство), возвращаем в меню
function onCloud(){const on=document.querySelector('.screen.on');updCoins();
  if(G&&!G.daily&&G.idx===0&&S.lv>0&&!G.won&&!G.words.some(w=>w.found)){if(introOn)hideModal();G=null;openMenu();}
  else if(on&&on.id==='menu')openMenu();
  if(G&&!G.won)updPrices();toast('Прогресс загружен');}

/* ---------- музыка и звуки прямо в игре (те же S.music/S.sound, что кнопки в меню) ---------- */
function openSettings(){SND.tap();STAT.screen('settings');
  const row=(id,ic,t,on)=>`<button class="setrow${on?'':' off'}" id="${id}"><span>${ic} ${t}</span><b>${on?'● вкл':'○ выкл'}</b></button>`;
  // вибрация — только там, где она бывает (Android, приложение VK); «Крупные буквы» — клетки и круг крупнее (для зрения 45+)
  const vibOk=CAN_VIB&&TOUCH||PLAT==='vk'&&VK_MOBILE;
  const draw=()=>{$('setRows').innerHTML=row('sMus','🎵','Музыка',S.music)+row('sSnd',S.sound?'🔊':'🔇','Звуки',S.sound)+
      (vibOk?row('sVib','📳','Вибрация',S.vib!==0):'')+row('sBig','🔍','Крупные буквы',!!S.big)+
      (STAT.available()?row('sStat','📊','Анонимная статистика',STAT.enabled())+'<p style="font-size:14px;color:var(--ink2);margin:2px 4px 8px;text-align:left">Уровни, ошибки и нажатия кнопок — без имени, ID и IP. Помогает делать игру лучше.</p>':'');
    $('sMus').onclick=()=>{S.music=S.music?0:1;save();sndIcon();ac();SND.tap();draw();};
    $('sSnd').onclick=()=>{S.sound=S.sound?0:1;save();sndIcon();SND.tap();draw();};
    if(vibOk)$('sVib').onclick=()=>{S.vib=S.vib===0?1:0;save();SND.tap();buzz('word');draw();};
    $('sBig').onclick=()=>{S.big=S.big?0:1;save();SND.tap();applyBig();draw();};
    // анонимная статистика (hobby-analytics/stat): строка есть, только если модулю есть куда писать (на маке — ?stat=dev); тексты свои — игра только на русском
    const st=$('sStat');if(st)st.onclick=()=>{STAT.setEnabled(!STAT.enabled());SND.tap();draw();};};
  // покупки — только вне уровня (из меню), ведут в магазин
  const shop=typeof PAY!=='undefined'&&PAY.on&&!$('game').classList.contains('on');
  modal(`<h2>⚙️ Настройки</h2><div id="setRows"></div>${SOC.ok()?'<button class="setrow" id="sSoc"><span>👥 Друзья и игры</span><b>›</b></button>':''}${shop?PAY.html(['no_ads'],false)+'<button class="setrow" id="sShop"><span>🛒 Все покупки</span><b>›</b></button>':''}<div class="btns"><button class="btn green" id="mOk">Продолжить</button></div>`);
  draw();$('mOk').onclick=()=>{hideModal();SND.tap();};if($('sSoc'))$('sSoc').onclick=()=>{SND.tap();openSocial();};
  if(shop){PAY.bind($('mcard'));PAY.re=openSettings;$('sShop').onclick=()=>{hideModal();SND.tap();openShop();const p=document.querySelector('#shopList .pay');if(p)p.scrollIntoView();};}
}

function updMore(){const b=$('btnMore');if(b)b.style.display=SOC.ok()?'':'none';}
// «Друзья и игры» (VK с мостом): позвать, поделиться, избранное, экран, сообщество, плитки других игр
function openSocial(back){if(!SOC.ok()){openSettings();return;}STAT.screen('social');STAT.ev('mod',{m:'soc',a:'open'});
  const bk=typeof back==='function'?back:openSettings;
  modal(`<h2>Друзья и игры</h2>${SOC.settingsHtml()}<div class="btns"><button class="btn ghost" id="socBack">← Назад</button></div>`);
  SOC.bind($('mcard'),()=>openSocial(bk));$('socBack').onclick=()=>{SND.tap();bk();};}
function applyBig(){document.body.classList.toggle('big',!!S.big);if(G)layoutWheel();}

/* ---------- благодарности (музыка — чужая, подпись обязательна по лицензии) ---------- */
// адреса — обычным текстом, без ссылок (ссылки из игры площадки запрещают, а лицензия требует адрес)
function openCredits(){STAT.screen('credits');modal(`<h2>Благодарности</h2><p style="font-weight:800;color:var(--blue)">«Баба Зина: слова из букв»</p><p>Музыка, под которую баба Зина разгадывает кроссворды:</p>
  <div class="cred"><b>«Black Tea Rag»</b><br>автор — decimnet<br>opengameart.org/content/black-tea-rag<br>лицензия CC BY 4.0: creativecommons.org/licenses/by/4.0/<br>перекодировано в AAC (моно)</div>
  <div class="cred"><b>Словарь бонусных слов</b><br>Russian-Nouns, А. Сергиенко (Harrix), лицензия MIT</div>
  <div class="cred"><b>VK Bridge</b><br>VK, лицензия MIT</div>
  <p style="font-size:14px">Спасибо авторам! Шутки, рисунки и баба Зина — свои. Возраст: 0+.</p>
  ${SOC.ok()?'<button class="setrow" id="credSoc"><span>👥 Друзья и игры</span><b>›</b></button>':''}
  ${typeof PAY!=='undefined'&&PAY.on?PAY.html(['tea']):''}
  <div class="btns"><button class="btn" id="credOk">Спасибо!</button>${typeof PAY!=='undefined'&&PAY.on?'<button class="btn ghost" id="credPay">↻ Восстановить покупки</button>':''}</div>`);$('credOk').onclick=()=>{SND.tap();hideModal();};if($('credSoc'))$('credSoc').onclick=()=>{SND.tap();openSocial(openCredits);};
  if(typeof PAY!=='undefined'&&PAY.on){PAY.bind($('mcard'));PAY.re=openCredits;$('credPay').onclick=()=>{SND.tap();PAY.again();};}}

/* ---------- знакомство (boost 02.10): баба Зина и кот Ять представляются до 1-го уровня — одно окно, одна кнопка ---------- */
let introOn=false;
function openIntro(){introOn=true;STAT.ev('tut',{s:1}); // знакомство до 1-го уровня
  modal(`<div class="intro"><div class="iart">${heroSVG()}</div>
    <h2>Здравствуй! Я баба Зина</h2>
    <p>Сорок лет учила детей русскому языку. Теперь на пенсии — учу кота. Кот Ять учёный, но ленивый.</p>
    <p>Составляй слова из букв, а я за каждый кроссворд открою шутку из своего словаря. Пирожки — потом.</p>
    <div class="btns"><button class="btn green" id="mGo" style="font-size:21px">Давай играть! ▶</button></div></div>`);
  $('mGo').onclick=()=>{ac();SND.tap();hideModal();};}
function introDone(){if(!introOn)return;introOn=false;S.tip.intro=1;save();}

/* ---------- старт ---------- */
function bind(){
  applyBig();
  $('btnPlay').onclick=()=>{SND.tap();ac();maybeInterstitial(()=>startLevel(Math.min(S.lv,LEVELS.length-1)));};
  $('btnGift').onclick=takeGift;
  $('btnMore').onclick=()=>{SND.tap();STAT.ev('mod',{m:'soc',a:'more'});SOC.showMore();};updMore();
  $('btnChap').onclick=()=>{SND.tap();openChapters();};
  $('btnDict').onclick=()=>{SND.tap();dictTab='mine';openDict();};
  $('btnDaily').onclick=openDaily;
  $('btnSnd').onclick=()=>{S.sound=S.sound?0:1;save();sndIcon();SND.tap();toast(S.sound?'Звуки включены':'Звуки выключены');};
  $('btnMus').onclick=()=>{S.music=S.music?0:1;save();sndIcon();ac();SND.tap();toast(S.music?'Музыка играет. Тихонько, чтоб соседи не стучали':'Музыка выключена. Тишина, как в библиотеке');};
  $('btnShop').onclick=()=>{SND.tap();openShop();};
  $('btnCred').onclick=()=>{SND.tap();openCredits();};
  $('btnRate').onclick=()=>{SND.tap();openRating();};
  document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{SND.tap();const t=b.dataset.back;t==='menu'?openMenu():t==='chapters'?openChapters():show(t);});
  $('gSet').onclick=openSettings;
  $('gBack').onclick=()=>{SND.tap();saveCur();G=null;openMenu();}; // openMenu сам пишет STAT.end('quit')
  $('hLet').onclick=hintLetter;$('hWord').onclick=hintWord;$('hShuf').onclick=shuffleLetters;$('hJar').onclick=showJar;
  $('grid').addEventListener('click',cellTap);
  $('pvOk').onclick=tapSubmit;$('pvX').onclick=tapClear;$('preview').firstElementChild.onclick=()=>{if(G&&G.tap)tapSubmit();};
  $('zAv').onclick=()=>{if(G&&G.rid&&!G.won){SND.tap();riddleSay(6);return;}if(G&&!G.won){SND.tap();zina(pick(['Не отвлекайся, внучок!','Я тут, я смотрю.','Подсказку? Кнопки справа.','Ой, щекотно!','Очки не трогай!']),'wow',2.5);}};
  const wh=$('wheel');
  wh.addEventListener('pointerdown',wheelDown);
  window.addEventListener('pointermove',wheelMove);
  window.addEventListener('pointerup',wheelUp);window.addEventListener('pointercancel',wheelUp);
  $('modal').addEventListener('click',e=>{if(e.target.id==='modal'&&!(G&&G.won&&$('game').classList.contains('on')))hideModal();});
  // layoutWheel сам вызывает layoutGrid; iOS при повороте иногда отдаёт старые размеры — пересчитываем ещё раз чуть позже
  window.addEventListener('resize',()=>{layoutWheel();fitSub();});
  window.addEventListener('orientationchange',()=>setTimeout(()=>layoutWheel(),300));
}
function onReady(){
  bind();updCoins();
  // покупки (STAT): общий модуль PAY не трогаем — оборачиваем снаружи; «ok» — если payAfter получил id этой покупки
  if(typeof PAY!=='undefined'){const b0=PAY.buy;PAY.buy=function(id){if(PAY.busy||!PAY.on)return b0.call(PAY,id);payOk=null;STAT.ev('buy',{i:id,r:'try'});
    return Promise.resolve(b0.call(PAY,id)).then(()=>STAT.ev('buy',{i:id,r:payOk===id?'ok':'cancel'}));};}
  const q=new URLSearchParams(location.search);
  if(q.has('lv'))startLevel(+q.get('lv')-1);
  else if(S.lv===0&&!S.tip.tut&&!SHOT){startLevel(0);if(!S.tip.intro)openIntro();} // новичок — знакомство и сразу первый уровень (обучение), меню — потом
  else openMenu();
}
window.__test={openLogin,openIntro,openMenu,jarFull,openChapFinale,coinBurst,applyFlags,freeLeft,maybeInterstitial,AD,PRICE,ECO,startLevel,submit,finishLevel,winModal,openShop,openRating,openDict,drawCard,shareDef,get G(){return G;},S:()=>S,LEVELS,DAILY,layoutGrid,layoutWheel};
initSDK();
