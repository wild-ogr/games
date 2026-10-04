/* ================= «Из ларька в магнаты: бизнес» — окно «Друзья»: отношения, польза, журнал (M18, window.FRUI) =================
   Модель — js/story.js (STORY.friend, callOpts, PK; действия friendChat, friendVisit, friendCall, friendAnswer), тексты писем и просьб — js/story-ui.js (STORYUI), портреты — js/friends.js.
   FRUI.open(from) — список четырёх друзей из 11 «Б» (уровень, шкала −100…+100, что может сейчас) и «Кто из нас дальше»; FRUI.card(id) — карточка друга:
   портрет, уровень и шкала, «📞 Позвонить» / «🏠 Сходить в гости» / «🙏 Попросить помощь» с понятным откатом, «Что даёт дружба» (в числах, по уровням),
   счёт «Вы для него / он для вас», журнал последних событий (±), совместные дела. FRUI.help(id) — список помощи.
   Входы: телефон (приложение «Друзья», карточка контакта), Кабинет (кнопка «👥 Друзья»), письмо Людмилы. STORYUI.openFriends/openFriend ведут сюда же.
   «Сходить в гости» из «Дел хозяина» (biz.js, другая ветка): если есть GAME.visitFriend(id) — зовём его; событие GAME.emit('friendVisit', id) — считаем визит «оплаченным» (ECON.friendVisit(W,id,'econ')).
   Для 45+: шрифт 17–18 px, кнопки ≥ 52 px, без inset и flex-gap. Тексты — L('рус','eng'), числа — pl(). */
(function(){
'use strict';
if(typeof ECON==='undefined'||!window.STORY||!window.GAME)return;
const E=ECON,SY=window.STORY;
const W=()=>GAME.W;
const T=(r,e)=>typeof L==='function'?L(r,e):r;
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
const SU=()=>window.STORYUI||{};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=x=>window.FMT?FMT.money(x):Math.round(x)+' ₽';
const pln=(n,a,b,c,d,e)=>n+' '+(typeof pl==='function'?pl(n,a,b,c,d,e):c);
const mon=n=>pln(n,'месяц','месяца','месяцев','month','months');
const snd=k=>{try{if(window.SND&&SND[k])SND[k]();}catch(e){}};
const tst=t=>{try{if(t)toast(t);}catch(e){}};
const pc=x=>(Math.round(x*1000)/10).toLocaleString(en()?'en':'ru')+(en()?'%':' %');
const FRS=SY.FR;
const LVN=[['в ссоре','on the outs'],['прохладно','cool'],['приятели','pals'],['друзья','friends'],['не разлей вода','inseparable']];
const LVC=['#c62828','#c8641e','#5a6675','#2e7d32','#b8860b'];
const lvName=i=>{const x=LVN[Math.max(0,Math.min(4,i|0))];return T(x[0],x[1]);};
const ROLE={owl:['банкир · «Сибирский кредит»','banker · Siberian Credit'],beav:['друг-соперник · свой бизнес','friendly rival · own business'],bars:['инженер · карьер «Сосновый лог»','engineer · Pine Hollow quarry'],vit:['логист · машины и грузы','logistics · trucks and freight']};
const NAME={owl:['Соня Совина','Sonya Sovina'],beav:['Борис Бобров','Boris Bobrov'],bars:['Пётр Барсуков','Pyotr Barsukov'],vit:['Витя Козлов','Vitya Kozlov']};
const nm=id=>{const x=NAME[id];return x?T(x[0],x[1]):id;};
const sub=id=>{try{const s=SU().who&&SU().who(id);if(s&&s.sub)return s.sub;}catch(e){}const x=ROLE[id];return x?T(x[0],x[1]):'';};
const COL=window.FRIEND_COL||{owl:'#5b4b8a',beav:'#2e7d5b',bars:'#8e6b3a',vit:'#e07b39'};
function pic(id,mood,px){px=px||64;let svg='';try{svg=window.friendSvg?friendSvg(id,mood||'calm'):'';}catch(e){svg='';}
  return `<span class="fu-av" style="width:${px}px;height:${px}px;border-color:${COL[id]||'#98a2b3'}">${svg}</span>`;}
function moodOf(f){return f.lv<=0?'strict':f.lv===1?'worry':f.lv>=4?'happy':f.q&&f.q.length?'wow':'calm';}
function sign(d){return (d>0?'+':d<0?'−':'')+Math.abs(Math.round(d));}
function stage(){const w=W();try{return SY.si(w);}catch(e){return 1;}}

/* ---------------- CSS ---------------- */
function css(){if(document.getElementById('fu-css'))return;const s=document.createElement('style');s.id='fu-css';s.textContent=`
.fu-td .fu-tdp{display:flex;flex-shrink:0;margin-right:12px}.fu-td .fu-tdp>*{margin-left:-10px}.fu-td .fu-tdp>*:first-child{margin-left:0}
.fu-td .f1{flex:1;min-width:0}.fu-td small{display:block;font-size:16px;color:var(--muted);margin-top:2px;line-height:1.3}.fu-td.on{border-left:4px solid var(--accent)}
#mcard .fu{font-size:17px;line-height:1.4}
.fu h2{font-size:21px;margin:0 0 6px}.fu h3{font-size:18px;margin:16px 0 8px}
.fu-sub{color:var(--muted,#5a6675);font-size:16px;margin:0 0 12px}
.fu-av{display:inline-block;border-radius:50%;border:3px solid;overflow:hidden;flex:none;vertical-align:middle;background:var(--soft,#f2f4f7)}.fu-av svg{display:block;width:100%;height:100%}
.fu-row{display:flex;align-items:center;width:100%;text-align:left;background:var(--card,#fff);border:2px solid var(--line,#d5dbe2);border-radius:16px;padding:12px;margin:0 0 10px;font:inherit;color:inherit;cursor:pointer;min-height:96px}
.fu-row:active{border-color:var(--accent,#c8641e)}.fu-row>.fu-av{margin-right:14px}
.fu-f{flex:1 1 auto;min-width:0}.fu-f b{font-size:18px}.fu-f small{display:block;color:var(--muted,#5a6675);font-size:15px}
.fu-lv{display:block;font-weight:700;font-size:17px;margin-top:2px}
.fu-bar{position:relative;height:14px;border-radius:7px;background:var(--soft,#eef1f4);margin:6px 0 2px;overflow:hidden}
.fu-bar i{position:absolute;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--muted,#5a6675);opacity:.5}
.fu-bar b{position:absolute;top:0;bottom:0;border-radius:7px}
.fu-sc{display:flex;justify-content:space-between;font-size:14px;color:var(--muted,#5a6675)}
.fu-can{display:block;font-size:15px;color:var(--ink,#1d2733);margin-top:4px}
.fu-q{display:inline-block;margin-top:4px;background:#fff3e0;color:#8a4b00;border-radius:10px;padding:2px 8px;font-size:15px;font-weight:700}
.fu-hd{display:flex;align-items:center;margin-bottom:10px}.fu-hd>.fu-av{margin-right:14px}.fu-hd b{font-size:20px;display:block}.fu-hd small{display:block;color:var(--muted,#5a6675);font-size:15px}
.fu-big{font-size:20px;font-weight:800;margin:4px 0 0}
.fu-say{background:var(--soft,#f2f4f7);border-radius:14px;padding:10px 14px;margin:8px 0 12px;font-size:17px}
.fu-say.me{background:#e8f4ea}
.fu-btns .btn{display:block;width:100%;min-height:56px;margin:0 0 8px;font-size:18px;text-align:left;padding-left:16px}
.fu-btns .btn small{display:block;font-size:14px;font-weight:400;opacity:.85}
.fu-pk{list-style:none;padding:0;margin:0}.fu-pk li{padding:8px 0 8px 32px;position:relative;border-bottom:1px solid var(--line,#e3e7ee);font-size:16px}
.fu-pk li:before{position:absolute;left:4px;top:8px;font-size:17px}.fu-pk li.on:before{content:'✓';color:#2e7d32;font-weight:800}.fu-pk li.off{color:var(--muted,#5a6675)}.fu-pk li.off:before{content:'🔒';font-size:14px}
.fu-pk li.nego:before{content:'•';font-size:17px}.fu-pk li.neg:before{content:'!';color:#c62828;font-weight:800;left:10px}.fu-pk li.act{background:#f1f8f2}.fu-pk small{display:block;font-size:14px;color:var(--muted,#5a6675)}
.fu-two{display:flex;flex-wrap:wrap;margin:0 -5px}.fu-two>div{flex:1 1 44%;min-width:150px;margin:0 5px 10px;background:var(--soft,#f2f4f7);border-radius:14px;padding:10px 12px;font-size:16px}
.fu-two b{display:block;font-size:16px;margin-bottom:4px}
.fu-log{list-style:none;padding:0;margin:0}.fu-log li{display:flex;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line,#e3e7ee);font-size:16px}
.fu-log li span{flex:1 1 auto}.fu-log li small{flex:none;color:var(--muted,#5a6675);font-size:14px;margin-right:8px;width:66px}
.fu-log li em{flex:none;font-style:normal;font-weight:800;margin-left:8px}.fu-log .up{color:#2e7d32}.fu-log .dn{color:#c62828}
.fu-help .btn{display:block;width:100%;min-height:56px;margin:0 0 4px;font-size:17px;text-align:left;padding-left:16px}
.fu-help .fu-why{display:block;font-size:14px;color:var(--muted,#5a6675);margin:0 0 12px 4px}
.fu-tb{width:100%;border-collapse:collapse;font-size:16px}.fu-tb td{padding:6px 4px;border-bottom:1px solid var(--line,#e3e7ee)}.fu-tb tr.me td{font-weight:800}.fu-tb .v{text-align:right;white-space:nowrap}
.fu .row .btn{min-height:52px}
body.th-office .fu-row{background:var(--card)}body.th-office .fu-q{background:#4a3a20;color:#ffd98a}body.th-office .fu-say.me{background:#26402c}body.th-office .fu-pk li.act{background:#26402c}
`;document.head.appendChild(s);}

/* ---------------- шкала и польза ---------------- */
function bar(rel,lv){const c=LVC[lv]||LVC[2],r=Math.max(-100,Math.min(100,rel));const l=r>=0?50:50+r/2,wd=Math.abs(r)/2;
  return `<div class="fu-bar" role="img" aria-label="${T('отношения','relations')} ${sign(r)}"><i></i><b style="left:${l}%;width:${Math.max(wd,1)}%;background:${c}"></b></div><div class="fu-sc"><span>−100</span><span>0</span><span>+100</span></div>`;}
function lvLine(f){return `<span class="fu-lv" style="color:${LVC[f.lv]}">${esc(lvName(f.lv))} · ${sign(f.rel)}</span>`;}
function nextTx(f){if(f.lv>=4)return T('Выше некуда — берегите дружбу.','It doesn’t get better — look after this friendship.');
  const need=SY.LV_MIN[f.lv+1]-f.rel;return T(`До уровня «${lvName(f.lv+1)}» — ещё ${need}.`,`To “${lvName(f.lv+1)}” — ${need} more.`);}
// что даёт дружба: [текст, с какого уровня, действует ли сейчас (мес. до), минус?]
function perks(w,id){const P=SY.PK,F=w.fr,f=SY.friend(w,id),L=f.lv,s=stage(),a=[];const add=(t,need,act,neg)=>a.push({t,need,act,neg});
  if(id==='owl'){
    add(T('Проверит финансы и подскажет, какой налог дешевле (УСН 6 % или 15 %)','Checks your finances and tells you which tax is cheaper (6% or 15%)'),1);
    add(T(`Поручительство: кредит в банке на ${Math.round(-P.guarDr[3]*100)} п. п. дешевле (не разлей вода — на ${Math.round(-P.guarDr[4]*100)}), лимит +15 %`,`Guarantee: a bank loan ${Math.round(-P.guarDr[3]*100)} p.p. cheaper (inseparable — ${Math.round(-P.guarDr[4]*100)}), limit +15%`),3,f.on.guar);
    add(T(`«Перекрою платёж»: ${P.bridgeK} платежа банку без процентов на 3 месяца`,`“I’ll cover it”: ${P.bridgeK} bank payments interest-free for 3 months`),3);
    if(w.hold===1&&w.fr&&w.fr.dn&&w.fr.dn.owl4!==undefined)add(T('Позовёт в свой фонд «Сова Инвест»: около 1,3 % в месяц, ровно, ваше время свободно','Will invite you into her Owl Invest fund: about 1.3% a month, steady, hands free'),3);
    add(T('Прохладно: ставка в банке +0,5 п. п., в ссоре +1 п. п.','Cool: bank rate +0.5 p.p., on the outs +1 p.p.'),-1,L<=1,1);}
  if(id==='beav'){
    if(!w.ned)add(T(`Пари: ставка ${pc(P.pari)} капитала или ${SY.PARI_CR||5} 💎 — выручка +10 % за месяц, выиграл — забираешь`,`Bets: ${pc(P.pari)} of net worth or ${SY.PARI_CR||5} 💎 — revenue +10% in a month, win and you take it`),1,f.on.pari);
    add(T('Займ без процентов — до 10 % его капитала','Interest-free loan — up to 10% of his net worth'),2);
    if(!w.ned)add(T(`Общая закупка: товар на ${pc(P.buyD)} дешевле, ${mon(P.buyM[3])} (не разлей вода — ${mon(P.buyM[4])})`,`Joint purchasing: goods ${pc(P.buyD)} cheaper for ${mon(P.buyM[3])} (inseparable — ${mon(P.buyM[4])})`),3,f.on.buy);
    if(!w.ned&&s>=1)add(T('Предложит точку на двоих: доля 50 %, около 3 % в месяц к вкладу, ваше время свободно','Will offer a joint place: 50% share, about 3% a month on your stake, hands free'),3);
    add(T(`Прохладно: может открыть точку рядом с вашей — −${Math.round((1-P.rival[1])*100)} % покупателей на 3 месяца (в ссоре −${Math.round((1-P.rival[0])*100)} %)`,`Cool: may open a place next to yours — −${Math.round((1-P.rival[1])*100)}% customers for 3 months (on the outs −${Math.round((1-P.rival[0])*100)}%)`),-1,L<=1,1);}
  if(id==='bars'){
    if(s===0)add(T('Подкинет выгодную шабашку: оплата ×1,5','Passes you a well-paid side job: pay ×1.5'),2);
    add(T(`Ускорит стройку: −${pc(P.build[2])} оставшихся дней (друзья −${pc(P.build[3])}, не разлей вода −${pc(P.build[4])})`,`Speeds up construction: −${pc(P.build[2])} of days left (friends −${pc(P.build[3])}, inseparable −${pc(P.build[4])})`),2);
    add(T(`Профилактика точек: ${mon(P.fixM)} ремонт поломок бесплатно`,`Preventive checks: ${mon(P.fixM)} of free repairs`),2,f.on.fix);
    add(T(`Ремонт после поломок дешевле на ${pc(P.rep[3])} (не разлей вода — ${pc(P.rep[4])}), простой короче`,`Repairs ${pc(P.rep[3])} cheaper (inseparable — ${pc(P.rep[4])}), less downtime`),3);
    add(T(`Монтаж новой точки дешевле на ${pc(P.cap[3])} (не разлей вода — ${pc(P.cap[4])})`,`New places fitted ${pc(P.cap[3])} cheaper (inseparable — ${pc(P.cap[4])})`),3);
    if(w.ned||w.st==='quarry')add(T('Техаудит: запас и себестоимость участков на торгах','Tech audit: reserves and costs of plots at auction'),2);}
  if(id==='vit'){
    if(s===0)add(T('Подкинет выгодный заказ: оплата ×1,5, раз в месяц','Passes you a well-paid job: pay ×1.5, once a month'),1);
    add(T('Займ без процентов — до 10 % его капитала','Interest-free loan — up to 10% of his net worth'),2);
    if(!w.ned)add(T(`Всегда: закупка −${pc(P.sup[3])} и доставка −${pc(P.logd[3])} (не разлей вода: −${pc(P.sup[4])} и −${pc(P.logd[4])})`,`Always: supplies −${pc(P.sup[3])} and delivery −${pc(P.logd[3])} (inseparable: −${pc(P.sup[4])} and −${pc(P.logd[4])})`),3,f.on.ship);
    add(T('Машины на месяц: доставка −25 %','Trucks for a month: delivery −25%'),3,f.on.truck);
    if(!w.ned)add(T(`Переезд точки за его счёт: −${pc(P.move[3])} (не разлей вода −${pc(P.move[4])})`,`Moving a place on his trucks: −${pc(P.move[3])} (inseparable −${pc(P.move[4])})`),3);
    if(!w.ned&&s>=1&&s<=2)add(T('Предложит «Газель на двоих»: доля 50 %, около 2 % в месяц к вкладу, ваше время свободно','Will offer a shared van: 50% share, about 2% a month on your stake, hands free'),3);
    add(T('В ссоре: доставка +10 %','On the outs: delivery +10%'),-1,L<=0,1);}
  return a.map(x=>Object.assign(x,{on:x.neg?!!x.act:L>=x.need}));}
// короткая строка «сейчас может» для списка
function canLine(w,id){let ops=[];try{ops=SY.callOpts(w,id).filter(o=>o.ok===true&&o.k!=='check');}catch(e){ops=[];}
  const lb=o=>{try{return SU().callLabel?SU().callLabel(o.k,o):o.k;}catch(e){return o.k;}};
  if(!ops.length)return T('Сейчас просить не о чем — позвоните или зайдите в гости','Nothing to ask for now — call or drop by');
  return T('Может сейчас: ','Can help now: ')+ops.slice(0,2).map(lb).join('; ');}

/* ---------------- журнал ---------------- */
const JK={chat:['📞 Поболтали','📞 A friendly chat'],visit:['🏠 Вы заходили в гости','🏠 You came round'],peace:['🤝 Помирились в гостях','🤝 Made up over a visit'],ign:['Просьба осталась без ответа','A request went unanswered'],
  rep:['🔧 Починил вашу точку дешевле','🔧 Fixed your place cheaper'],cap:['🔧 Смонтировал новую точку дешевле','🔧 Fitted your new place cheaper'],move:['🚚 Перевёз точку за полцены','🚚 Moved your place at half price'],
  lendback:['Вернул вам долг','Paid you back'],lendlate:['Задержал возврат долга на 2 месяца','Was 2 months late paying you back'],repaid:['Вы вернули ему долг','You paid him back'],
  pwin:['🎲 Вы выиграли пари','🎲 You won the bet'],plose:['🎲 Пари за ним','🎲 He won the bet'],ovt:['Вы обогнали его по капиталу','You overtook him in net worth'],rival:['Открыл точку рядом с вашей','Opened a place next to yours'],
  congr:['🎉 Вы поздравили','🎉 You congratulated him'],gulate:['Просрочка по кредиту под её поручительство','Overdue loan under her guarantee'],guse:['Кредит под её поручительство','A loan under her guarantee'],
  reu:['🥂 Встреча выпускников','🥂 Class reunion'],jv:['🤝 Совместное дело','🤝 Joint venture'],jvyear:['🤝 Год совместному делу','🤝 A year of the joint venture'],jvsell:['Вы продали долю в общем деле','You sold your share of the venture'],
  jvbuy:['Вы выкупили его долю','You bought out his share'],jvdiv:['Решили про дивиденды','Agreed on dividends']};
const RQK={loan:['просил в долг','asked for a loan'],gift:['звал на праздник','invited you to a party'],watch:['просил присмотреть за точкой','asked you to mind his place'],advice:['спрашивал совета','asked for advice'],
  visit:['звал сходить вместе','asked you along'],offer:['предлагал помощь','offered help'],pari:['предлагал пари','offered a bet']};
function logLine(x){const a=x.a||{};let t='';
  if(x.k.indexOf('rq_')===0){const r=x.k.slice(3),q=RQK[r]||RQK.advice;t=T(q[0],q[1])+' — '+(x.o==='a'?(r==='offer'||r==='pari'?T('вы согласились','you agreed'):T('вы помогли','you helped')):T('вы отказались','you declined'));
    if(r==='loan'&&a.a)t+=` (${money(a.a)})`;}
  else if(x.k.indexOf('call_')===0){const k=x.k.slice(5);let lb=k;try{lb=SU().callLabel?SU().callLabel(k,{a:a.a}):k;}catch(e){}t='🙏 '+(k==='loan'&&a.a?T(`Вы заняли у него ${money(a.a)}`,`You borrowed ${money(a.a)}`):lb);}
  else if(x.k==='perk'){let n=x.o;try{n=SU().perkName?SU().perkName(x.o):x.o;}catch(e){}t='🤝 '+T('Помог: ','Helped: ')+n;}
  else if(JK[x.k])t=T(JK[x.k][0],JK[x.k][1]);
  else{try{const m=SU().log&&SU().log(x);t=m?(m.tx||(m.ans?T('Вы ответили: «','You replied: “')+m.ans+T('»','”')+(m.q?' — '+m.q:''):m.q)||''):'';}catch(e){t='';}if(!t)t=T('Сюжет: ваше решение','Story: your decision');}
  if(a.a&&['rep','cap','move','lendback','pwin','plose','perk','guse'].indexOf(x.k)>=0&&t.indexOf('₽')<0)t+=` · ${money(a.a)}`;
  if(a.cr&&(x.k==='pwin'||x.k==='plose'))t+=` · ${a.cr} 💎`;
  if(t.length>110)t=t.slice(0,108)+'…';return t;}
function logHtml(f){const L2=f.log||[];if(!L2.length)return `<p class="fu-sub">${T('Пока ничего не было — начните со звонка.','Nothing yet — start with a call.')}</p>`;
  return '<ul class="fu-log">'+L2.slice(0,8).map(x=>`<li><small>${window.FMT?esc(FMT.mon(x.m)):''}</small><span>${esc(logLine(x))}</span>${x.d?`<em class="${x.d>0?'up':'dn'}">${sign(x.d)}</em>`:''}</li>`).join('')+'</ul>';}

/* ---------------- окна ---------------- */
let last=null;   // ответ друга для карточки {id, tx, me, mood}
function show(h,re){css();modal(`<div class="fu">${h}</div>`);try{modalRe=re||null;}catch(e){}bindAll();}
function bindAll(){const c=document.getElementById('mcard');if(!c)return;c.querySelectorAll('[data-fu]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.fu,b)));}
function open(from){const w=W();if(!w)return;SY.init(w);last=null;try{if(typeof STAT!=='undefined')STAT.ev('frw',{f:String(from||'x')});}catch(e){}
  let h=`<h2>👥 ${T('Друзья из 11 «Б»','Friends from Class 11B')}</h2><p class="fu-sub">${T('Отношения идут в плюс и в минус. Помогайте, звоните, заходите в гости — и друзья помогут в ответ: скидки, займы, ремонт, поручительство в банке.','Relations go up and down. Help out, call, drop by — and your friends help back: discounts, loans, repairs, a bank guarantee.')}</p>`;
  for(const id of FRS){const f=SY.friend(w,id);
    h+=`<button class="fu-row noenter" data-fu="card:${id}">${pic(id,moodOf(f),64)}<span class="fu-f"><b>${esc(nm(id))}</b><small>${esc(T(ROLE[id][0],ROLE[id][1]))}</small>${lvLine(f)}${bar(f.rel,f.lv)}<span class="fu-can">${esc(canLine(w,id))}</span>${f.q.length?`<span class="fu-q">✉️ ${T('ждёт ответа','waiting for your reply')}</span>`:''}</span></button>`;}
  // «Кто из нас дальше» — капитал сейчас
  let st=[];try{st=SY.standings(w);}catch(e){st=[];}
  if(st.length){h+=`<h3>🏆 ${T('Кто из нас дальше — капитал сейчас','Who’s ahead — net worth today')}</h3><table class="fu-tb">`;
    st.forEach((x,i)=>{h+=`<tr${x.id==='you'?' class="me"':''}><td>${i+1}</td><td>${x.id==='you'?T('Вы','You'):x.id==='bear'?T('Топтыгин','Toptygin'):esc(nm(x.id))}</td><td class="v">${money(x.v)}</td></tr>`;});h+='</table>';}
  const all=(w.fr.q||[]).filter(q=>q.w==='all'||q.w==='lud'||q.w==='bear');
  for(const q of all){let tt='';try{tt=SU().title?SU().title(q.k):'';}catch(e){}h+=`<div class="row"><button class="btn w accent noenter" data-fu="big:${esc(q.id)}">${q.k==='reu'||q.k==='pro'?'🥂 '+T('Встреча выпускников','Class reunion'):tt||T('Открыть событие','Open the event')}</button></div>`;}
  h+=`<div class="row"><button class="btn w noenter" data-fu="x" data-esc="1">${T('Закрыть','Close')}</button></div>`;
  show(h,()=>open(from));}
function card(id){const w=W();if(!w||FRS.indexOf(id)<0)return;SY.init(w);const f=SY.friend(w,id);
  let h=`<div class="fu-hd">${pic(id,last&&last.id===id&&last.mood?last.mood:moodOf(f),96)}<div><b>${esc(nm(id))}</b><small>${esc(sub(id))}</small></div></div>`;
  h+=`<p class="fu-big" style="color:${LVC[f.lv]}">${esc(lvName(f.lv))} · ${sign(f.rel)}</p>${bar(f.rel,f.lv)}<p class="fu-sub">${esc(nextTx(f))}${f.idle>=4?' '+T(`Не общались ${mon(f.idle)} — отношения понемногу остывают к «приятелям».`,`You haven’t talked for ${mon(f.idle)} — things slowly cool back to “pals”.`):''}</p>`;
  if(last&&last.id===id&&last.tx)h+=`<div class="fu-say${last.me?' me':''}">${esc(last.tx)}</div>`;
  // ждёт ответа
  for(const q of f.q){let tx='';try{const m=SU().msg?SU().msg(w,{type:'ask',x:q}):null;tx=m&&m.tx||'';}catch(e){}
    h+=`<div class="fu-say">✉️ ${esc(tx||T('Есть просьба — нужно ваше решение.','There’s a request — your decision is needed.'))}</div><div class="row"><button class="btn w accent noenter" data-fu="ask:${esc(q.id)}">${T('Ответить','Reply')}</button></div>`;}
  // три кнопки
  const ned=!!w.ned,en0=w.me&&!ned?(w.me.en||0):99,vE=SY.PK.visitE;
  h+=`<div class="fu-btns">`
    +`<button class="btn${f.chat?' blue':''} noenter" data-fu="chat:${id}">📞 ${T('Позвонить','Call')}<small>${f.chat?T('поболтать: ❤ +1, раз в месяц','a chat: ❤ +1, once a month'):T('уже звонили в этом месяце','already called this month')}</small></button>`
    +`<button class="btn noenter" data-fu="visit:${id}"${f.visit&&en0>=vE?'':' disabled'}>🏠 ${T('Сходить в гости','Drop by')}<small>${!f.visit?T('уже были в этом месяце','already visited this month'):en0<vE?T(`не хватает сил: нужно ⚡ ${vE}`,`not enough energy: needs ⚡ ${vE}`):(f.lv<=1?T('помириться: ❤ +15','make up: ❤ +15'):T(`❤ +${f.rel>=50?SY.PK.visit/2:SY.PK.visit}`,`❤ +${f.rel>=50?SY.PK.visit/2:SY.PK.visit}`))+(w.me&&!ned?T(` · ⚡ −${vE}`,` · ⚡ −${vE}`):'')+T(', раз в месяц',', once a month')}</small></button>`
    +`<button class="btn accent noenter" data-fu="help:${id}">🙏 ${T('Попросить помощь','Ask for help')}<small>${esc(canLine(w,id))}</small></button></div>`;
  // что даёт дружба
  h+=`<h3>${T('Что даёт дружба','What the friendship gives')}</h3><ul class="fu-pk">`+perks(w,id).map(p=>`<li class="${p.neg?(p.on?'neg act':'off nego'):p.on?'on'+(p.act?' act':''):'off'}">${esc(p.t)}${p.neg?'':p.on?(p.act?`<small>${T('действует сейчас','on right now')}</small>`:''):`<small>${T('с уровня','from level')} «${esc(lvName(p.need))}»</small>`}</li>`).join('')+'</ul>';
  // счёт дружбы
  const s=f.st;h+=`<h3>${T('Счёт дружбы','Friendship tally')}</h3><div class="fu-two"><div><b>${T('Вы для него','You for him')}</b>${T('помогли','helped')}: ${pln(s.g,'раз','раза','раз','time','times')}<br>${T('одолжили','lent')}: ${money(s.ln)}<br>${T('отказов','refusals')}: ${s.n}</div>`
    +`<div><b>${T('Он для вас','Him for you')}</b>${T('помог','helped')}: ${pln(s.h,'раз','раза','раз','time','times')}<br>${T('сэкономил вам','saved you')}: <b style="display:inline">${money(s.sv)}</b><br>${T('вернул долгов','paid back')}: ${money(s.bk)}${s.lt?`<br>${T('задержек','late')}: ${s.lt}`:''}</div></div>`;
  if(f.owe||f.lent)h+=`<p class="fu-sub">${f.owe?T(`Вы должны: ${money(f.owe)}. `,`You owe: ${money(f.owe)}. `):''}${f.lent?T(`Он должен вам: ${money(f.lent)}.`,`He owes you: ${money(f.lent)}.`):''}</p>`;
  // совместные дела
  for(const j of f.jv)h+=jvHtml(w,j);
  // журнал
  h+=`<h3>${T('Последние события','Recent events')}</h3>${logHtml(f)}`;
  // новости друга с «Поздравить»
  const fd=(w.fr.fd||[]).map((x,i)=>({x,i})).filter(o=>o.x.w===id).slice(-2).reverse();
  for(const o of fd){let tx='';try{tx=SU().feedTx?SU().feedTx(o.x):'';}catch(e){}if(!tx)continue;
    h+=`<div class="fu-say"><small class="fu-sub">${window.FMT?esc(FMT.date(o.x.m)):''}</small><br>${esc(tx)}</div>${o.x.c&&!o.x.g?`<div class="row"><button class="btn w noenter" data-fu="cg:${o.i}:${id}">🎉 ${T('Поздравить: ❤ +2','Congratulate: ❤ +2')}</button></div>`:''}`;}
  h+=`<div class="row"><button class="btn w noenter" data-fu="list">← ${T('Ко всем друзьям','All friends')}</button><button class="btn w noenter" data-fu="x" data-esc="1">${T('Закрыть','Close')}</button></div>`;
  show(h,()=>card(id));}
function jvHtml(w,j){const P=SU(),nmJ=P.jvName?P.jvName(j.t):j.t,pct=x=>P.pct?P.pct(x):Math.round(x*100)+' %';const y=j.p.reduce((a,x)=>a+x,0),dOk=j.dm<0||w.m-j.dm>=12;
  const jn=j.t==='pnt'?T('точка на двоих','the joint place'):j.t==='gaz'?T('Газель на двоих','the shared van'):nmJ;
  return `<h3>🤝 ${esc(jn)}</h3><div class="fu-two"><div>${T('Ваша доля','Your share')}: <b style="display:inline">${pct(j.sh)}</b><br>${T('Вложение','Investment')}: ${money(j.inv)}</div><div>${T('Прибыль дела за год','Venture profit, 12 mo.')}: ${money(y)}<br>${T('Дивиденды','Dividends')}: ${pct(j.d)}</div></div>
    <p class="fu-sub">${T('Прибыль есть, а денег нет — пока партнёры не решили платить дивиденды.','Profit isn’t cash — until the partners agree to pay dividends.')}${dOk?'':' '+T('Про дивиденды решали меньше года назад.','Dividends were agreed less than a year ago.')}</p>
    <div class="row">${[0,.5,1].map(v=>`<button class="btn noenter${j.d===v?' accent':''}" data-fu="jd:${j.id}:${v}"${dOk?'':' disabled'}>${pct(v)}</button>`).join('')}</div>
    <div class="row">${j.sh<1?`<button class="btn w noenter" data-fu="jb:${j.id}">${T(`Выкупить долю друга: ${money(SY.jvPrice(j,'buy'))}`,`Buy out your friend: ${money(SY.jvPrice(j,'buy'))}`)}</button>`:''}<button class="btn w noenter" data-fu="js:${j.id}">${T(`Продать свою долю: ${money(SY.jvPrice(j,'sell'))}`,`Sell your share: ${money(SY.jvPrice(j,'sell'))}`)}</button></div>
    ${w.m-j.m0<12?`<p class="fu-sub">${T('Выход раньше года огорчит друга (❤ −15).','Leaving before a year upsets your friend (❤ −15).')}</p>`:''}`;}
function help(id){const w=W();if(!w)return;const f=SY.friend(w,id);let ops=[];try{ops=SY.callOpts(w,id);}catch(e){ops=[];}
  let h=`<div class="fu-hd">${pic(id,moodOf(f),72)}<div><b>🙏 ${esc(nm(id))}</b><small>${esc(lvName(f.lv))} · ${sign(f.rel)}</small></div></div><p class="fu-sub">${T('Чем ближе дружба, тем больше помощи. После просьбы нужно подождать — друг тоже занят.','The closer the friendship, the more help. After a request, wait a while — your friend is busy too.')}</p><div class="fu-help">`;
  if(!ops.length)h+=`<p class="fu-sub">${T('Сейчас просить не о чем.','Nothing to ask for right now.')}</p>`;
  for(const o of ops){let lb=o.k;try{lb=SU().callLabel?SU().callLabel(o.k,o):o.k;}catch(e){}const ok=o.ok===true;
    const why=ok?T('можно прямо сейчас','available now'):o.ok==='trust'?T(`откроется на уровне «${lvName(o.need)}»`,`opens at “${lvName(o.need)}”`):o.ok==='cd'?T(`можно снова через ${mon(o.cd)}`,`available again in ${mon(o.cd)}`):(SU().why?SU().why(o.ok):String(o.ok));
    h+=`<button class="btn${ok?' blue':''} noenter" data-fu="ask2:${id}:${o.k}"${ok?'':' disabled'}>${esc(lb)}</button><span class="fu-why">${ok?'✓ ':o.ok==='trust'?'🔒 ':'⏳ '}${esc(why)}</span>`;}
  h+=`</div><div class="row"><button class="btn w noenter" data-fu="card:${id}">← ${T('Назад','Back')}</button></div>`;
  show(h,()=>help(id));}

/* ---------------- действия ---------------- */
function act(a,b){const p=a.split(':'),k=p[0],id=p[1];
  if(k==='x'){snd('tap');last=null;try{hideModal();}catch(e){}return;}
  if(k==='list'){snd('tap');open('back');return;}
  if(k==='card'){snd('tap');if(!last||last.id!==id)last=null;card(id);return;}
  if(k==='help'){snd('tap');help(id);return;}
  if(k==='big'){snd('tap');try{hideModal();SU().big(p.slice(1).join(':'));}catch(e){}return;}
  if(k==='ask'){snd('tap');try{if(SU().openAsk)SU().openAsk(p.slice(1).join(':'));}catch(e){console.error(e);}return;}
  if(k==='chat'){const r=GAME.act('friendChat',id);if(!r||r.res!=='ok'){snd('no');if(r&&r.res==='month'){last={id,tx:helloTx(id,true)};card(id);}return;}
    snd('tap');last={id,tx:helloTx(id)};tst('❤ +'+r.d);card(id);return;}
  if(k==='visit'){doVisit(id);return;}
  if(k==='ask2'){askHelp(id,p[2]);return;}
  if(k==='cg'){const r=GAME.act('congrats',+p[1]);if(r==='ok'){snd('coin');tst(T('Поздравили! ❤ +2','Congratulated! ❤ +2'));}else if(r==='quarter')tst(T('Уже поздравляли в этом квартале','Already congratulated this quarter'));card(p[2]);return;}
  if(k==='jd'||k==='jb'||k==='js'){const w=W(),j=w.fr.jv.find(x=>x.id===p[1]);const who=j?j.w:'beav';let r;
    if(k==='jd')r=GAME.act('jvDiv',p[1],+p[2]);else r=GAME.act('jvExit',p[1],k==='jb'?'buy':'sell');
    if(r!=='ok'){snd('no');tst(SU().why?SU().why(r):r);}else snd(k==='jd'?'tap':'coin');card(who);return;}}
function helloTx(id,again){const w=W();const f=SY.friend(w,id);
  if(again)return T('Мы же уже говорили в этом месяце 🙂 Звони, если что-то срочное — через «Попросить помощь».','We already talked this month 🙂 Call if it’s urgent — via “Ask for help”.');
  let hi='';try{const h=SU().hello&&SU().hello(w,id);hi=h&&h.tx||'';}catch(e){}
  const tips={owl:T('Если соберёшься в банк — скажи, поручусь.','If you’re heading to the bank — tell me, I’ll vouch for you.'),beav:T('Как дела? У меня всё растёт. Может, поспорим, кто быстрее? 😄','How’s it going? Mine’s growing. Fancy a bet on who’s faster? 😄'),
    bars:T('Если что сломается — звони, починю.','If anything breaks — call me, I’ll fix it.'),vit:T('Если надо что-то привезти — я на колёсах!','If you need anything delivered — I’m on wheels!')};
  return (hi?hi+' ':'')+(f.lv>=2?tips[id]:T('Ну… звони, если что.','Well… call if you need something.'));}
function doVisit(id){if(typeof GAME.visitFriend==='function'){try{const r=GAME.visitFriend(id);if(r===true||r==='ok'){snd('tap');try{hideModal();}catch(e){}return;}}catch(e){console.error(e);}}   // «Дела хозяина»: визит занимает руку (другая ветка)
  const r=GAME.act('friendVisit',id);if(!r||r.res!=='ok'){snd('no');tst(r&&SU().why?SU().why(r.res):T('Не получилось','Didn’t work'));card(id);return;}
  snd('coin');last={id,tx:visitTx(id,r),me:true,mood:'happy'};tst('❤ +'+r.d);card(id);}
function visitTx(id,r){if(r.peace){try{const t=SU().feedTx&&SU().feedTx({k:'peace',w:id,a:{}});if(t)return '🤝 '+t;}catch(e){}return T('🤝 Помирились!','🤝 Made up!');}
  const V={owl:T('Чай с пирогами у Людмилы Санны, разговоры до ночи. Соня: «Приходи чаще».','Tea and pies at Lyudmila Sanna’s, talking till late. Sonya: “Come more often.”'),
    beav:T('Баня и шашлык у Бориса. Проиграли ему в бильярд — но вечер удался.','Sauna and barbecue at Boris’s. Lost to him at pool — but a great evening.'),
    bars:T('Помогли Петру собрать сыновьям шкаф. Молча, по-мужски, по инструкции.','Helped Pyotr assemble a wardrobe for his sons. Quietly, by the book.'),
    vit:T('Марина напекла пирогов, Витя показывал новый маршрут на карте. Весело!','Marina baked pies, Vitya showed his new route on the map. Fun!')};
  return '🏠 '+(V[id]||'')+` ❤ +${r.d}`;}
function askHelp(id,k){const w=W();
  if(k==='loan'||k==='pari'){try{if(SU().call&&SU().call(id,k))return;}catch(e){console.error(e);}}   // выбор суммы и срока (займ), ставки — деньги или 💎 (пари, M20) — окно story-ui
  let r;try{r=GAME.act('friendCall',id,k);}catch(e){console.error(e);r={res:'no'};}
  if(!r||r.res!=='ok'){snd('no');tst(SU().why?SU().why(r&&r.res||'no'):'');help(id);return;}
  snd(k==='bridge'||k==='gig'?'coin':'tap');let af=null;try{af=SU().after?SU().after(W(),r):null;}catch(e){af=null;}
  last={id,tx:af&&af.tx||T('Договорились!','Deal!'),mood:af&&af.mood};if(af&&af.toast)tst(af.toast);
  try{if(window.PHONE&&PHONE.say&&last.tx)PHONE.say(id,last.tx,last.tx,null,{push:false});}catch(e){}
  card(id);}

// визит из «Дел хозяина» (ветка экономики): GAME.emit('friendVisit', id) — рука и силы уже потрачены, здесь только отношения
function onVisit(id){const w=W();if(!w||FRS.indexOf(id)<0)return;let r;try{r=E.friendVisit(w,id,'econ');}catch(e){r=null;}
  if(r&&r.res==='ok'){tst(`🏠 ${nm(id)}: ❤ +${r.d}`);try{if(window.PHONE&&PHONE.say)PHONE.say(id,visitTx(id,r),visitTx(id,r),null,{push:false});}catch(e){}try{if(typeof save==='function')save();}catch(e){}}}
if(GAME.on)GAME.on('friendVisit',onVisit);
// «Сходить в гости» из «Дел хозяина» (js/owner.js): отношения уже посчитаны там, здесь — только тост и сообщение в телефоне
if(GAME.on)GAME.on('ownVisit',o=>{const r=o&&o.r;if(!r||o.off||FRS.indexOf(o.fr)<0)return;tst(`🏠 ${nm(o.fr)}: ❤ +${r.d}`);
  try{if(window.PHONE&&PHONE.say)PHONE.say(o.fr,visitTx(o.fr,r),visitTx(o.fr,r),null,{push:false});}catch(e){}});

// M20: пари на 💎 — модель копит W.fr.crp (+ выигрыш / − ставка), здесь переводим в S.cr (GAME.addCr / GAME.spend)
SY.crHave=()=>GAME.cr?GAME.cr():0;
let crBusy=0;function crSync(){if(crBusy)return;const w=W(),F=w&&w.fr;if(!F||!F.crp)return;crBusy=1;try{const n=F.crp;F.crp=0;
  if(n>0){GAME.addCr(n,'pari');tst(`🎲 +${n} 💎`);}else{const c=Math.min(-n,GAME.cr?GAME.cr():0);if(c>0)GAME.spend(c,'pari');}}catch(e){console.error(e);}crBusy=0;}
if(GAME.on){GAME.on('change',crSync);GAME.on('day',crSync);GAME.on('close',crSync);}
// M20: карточка «Друзья» на экране «Сегодня» (biz-ui.js rToday): кто ждёт ответа → окно «Друзья»; нажатие ловим здесь (data-frt), biz-ui не трогаем
const QK={loan:['просит в долг','asks for a loan'],gift:['зовёт на праздник','invites you to a party'],watch:['просит присмотреть','asks a favour'],advice:['просит совета','wants advice'],
  visit:['зовёт с собой','asks you along'],offer:['предлагает помощь','offers help'],pari:['предлагает пари','offers a bet']};
function todayCard(w){w=w||W();if(!w||!w.fr||!w.fr.v)return '';css();const wait=[];
  for(const id of FRS){const q=(w.fr.q||[]).find(x=>x.w===id);if(q)wait.push({id,q});}
  if(!wait.length){let p=0;try{p=SY.place(w);}catch(e){}
    return `<button class="card tap bz-li fu-td noenter" data-frt="1" style="padding:12px 18px"><span class="fu-tdp">${FRS.map(id=>pic(id,'calm',36)).join('')}</span><span class="f1"><b>👥 ${T('Друзья','Friends')}</b><small>${p?T(`Кто из нас дальше: вы ${p}-е место`,`Who’s ahead: you’re number ${p}`)+' · ':''}${T('позвонить, в гости, попросить помощь','call, visit, ask for help')}</small></span><span class="chev">›</span></button>`;}
  const ln=wait.map(x=>{const r=x.q.k==='rq'?QK[x.q.r]:null,dl=x.q.x!=null&&w.t!=null?Math.max(0,Math.ceil(x.q.x-w.t)):null;return nm(x.id).split(' ')[0]+' — '+(r?T(r[0],r[1]):T('ждёт ответа','waiting for your reply'))+(dl!=null&&dl<=7?' ('+(dl?T('ещё ','')+dl+' '+pl(dl,'день','дня','дней','day','days')+T('',' left'):T('сегодня','today'))+')':'');});   // M34: просьбы сгорают — видно, сколько осталось
  return `<button class="card tap bz-li fu-td on noenter" data-frt="1" style="padding:12px 18px"><span class="fu-tdp">${wait.map(x=>pic(x.id,'wow',40)).join('')}</span><span class="f1"><b>✉️ ${T('Друзья ждут ответа','Friends are waiting for your reply')}</b><small>${esc(ln.join(' · '))}</small></span><span class="chev">›</span></button>`;}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-frt]');if(!b)return;snd('tap');open('today');});
window.FRUI={open,card,help,lvName,perks,bar,crSync,todayCard};
})();
