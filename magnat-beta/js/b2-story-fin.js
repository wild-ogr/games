/* b2-story-fin.js — STORY: финал «Корпорация» — встреча 11 «Б» через N лет, судьбы друзей по выборам игрока, грамота «Магнат».
   Грузится по требованию (после 5-го края: W.hold ≥ 6 или B2.emit('final')). Пересмотреть — Кабинет «🎓 Встреча 11 «Б»».
   Судьбы — из того, что игрок решал за всю игру: уровень дружбы, ночной звонок Бориса, свидетель у Вити, партнёр «Недр», стажёр Петра,
   юбилей Людмилы Санны, ответы в арках краёв (S.b2s.c). Награда — B2.eco.give('story.final') один раз. */
(function(root){'use strict';
const B2=root.B2;if(!B2||!B2.story)return;
const BS=B2.story,esc=BS.esc;
const T=(r,e)=>typeof L==='function'?L(r,e):r;
const fem=()=>{try{return !!(root.HERO&&HERO.fem&&HERO.fem());}catch(e){return false;}};
const G=(m,f)=>fem()?f:m;
const money=x=>root.FMT?FMT.money(x):Math.round(x)+' ₽';
const U=()=>root.STORYUI||{};
const YL=n=>{const a=n%10,b=n%100;return a===1&&b!==11?'год':a>=2&&a<=4&&(b<12||b>14)?'года':'лет';};
function lv(W,id){try{return root.STORY.lv(W,id);}catch(e){return 2;}}
// судьба: [рус, англ]; несколько строк склеиваются
function fates(W){const F=W.fr||{},c=BS.st().c||{},o=[],dn=F.dn||{},b=F.beav||{},p=F.bars||{},v=F.vit||{},tp=F.tp||{},lu=F.lud||{};
  const add=(id,mood,parts)=>o.push({id,mood,tx:parts.filter(Boolean).map(x=>T(x[0],x[1])).join(' ')});
  // Соня
  {const L=lv(W,'owl');add('owl',L>=3?'happy':'calm',[
    L>=3?['Соня возглавляет «Сова Инвест» — крупнейший фонд Сибири. На стене кабинета в рамке — ваша первая кредитка с подписью «Погашена в срок».','Sonya runs Owl Invest — the biggest fund in Siberia. On her office wall, framed: your first credit card, signed “Repaid on time”.']
      :L===2?['Соня управляет фондом и читает лекции студентам. Про вас говорит: «Клиент сложный, но платёжеспособный».','Sonya runs her fund and lectures students. About you she says: “A difficult client, but solvent.”']
      :['Соня давно живёт в другом городе. На встречу приехала — и первой подняла бокал за вас. Обиды, говорит, в отчётность не входят.','Sonya moved to another city long ago. She came anyway — and was the first to raise a glass to you. Grudges, she says, don’t go on the balance sheet.'],
    F.part==='owl'?['Её фонд был вашим партнёром в недрах — и ни разу об этом не пожалел.','Her fund was your mining partner — and never once regretted it.']:null,
    c.sak4==='a'?['Ася стала партнёром аудиторской фирмы. Ваши отчёты проверяет сама — и жалуется, что ошибок больше нет: скучно.','Asya made partner at her audit firm. She checks your reports herself — and complains there are no mistakes left: boring.']
      :c.sak4==='b'?['Ася стала партнёром аудиторской фирмы и до сих пор находит у бабушки примечания «по традиции».','Asya made partner at her audit firm and still finds Grandma’s “traditional” notes.']:null]);}
  // Борис
  {const L=lv(W,'beav');add('beav',L>=2?'happy':'calm',[
    L>=3?['«Бобров и Ко» — на бирже, в лесу и в зарядках для лесовозов. Борис по-прежнему отстаёт от вас на пару процентов и называет их лучшими процентами своей жизни.','Beaver & Co is listed, in timber and in charging stations for log trucks. Boris still trails you by a couple of per cent and calls them the best per cent of his life.']
      :L===2?['Борис построил лесную империю в Карелии. Счёт ваших споров ведёт в отдельной тетради. Тетрадь — третья.','Boris built a timber empire in Karelia. He keeps score of your bets in a separate notebook. The third notebook.']
      :['Борис пришёл с тортом и сказал: «Мир?». На торте было написано «Ничья». Впервые в жизни Бобров согласился на ничью.','Boris came with a cake and said: “Truce?” The cake read “Draw”. For the first time in his life Bobrov agreed to a draw.'],
    b.hlp?['Тот ночной звонок он вспоминает каждый раз: «Если бы не ты — работал бы я у Топтыгина. Охранником».','He mentions that late-night call every time: “If it weren’t for you, I’d be working for Toptygin. As a security guard.”']:null,
    c.alt5==='a'?['Спор про встречу он, кстати, проиграл — торт за его счёт.','He lost the bet about the reunion, by the way — the cake is on him.']:c.alt5==='b'?['Встречу вы собирали вместе — вторая ничья в истории, записана красной ручкой.','You organised the reunion together — the second draw in history, written in red ink.']:null]);}
  // Пётр
  {const L=lv(W,'bars'),gone=p.tpt&&!p.stay;add('bars',L>=2?'happy':'calm',[
    gone?['Пётр много лет был главным инженером у Топтыгина. Теперь вернулся в «Барсуков и сыновья» и говорит, что «Медвежий» разрез был хорошей школой — но домой тянуло.','For years Pyotr was Toptygin’s chief engineer. Now he’s back at Barsukov & Sons and says the Bear pit was a good school — but home kept calling.']
      :L>=3?['«Барсуков и сыновья» — лучшие горные инженеры страны. Пётр уходил на пенсию трижды. Сейчас — четвёртая попытка.','Barsukov & Sons are the best mining engineers in the country. Pyotr has retired three times. This is attempt number four.']
      :['Пётр по-прежнему на разрезе: «Пока руда есть — и я есть». Каску носит ту же, что дал вам на первом взрыве.','Pyotr is still at the pit: “As long as there’s ore, there’s me.” He wears the same hard hat he lent you at the first blast.'],
    p.intern?['Его старший, бывший ваш стажёр, теперь директор вашего рудника. Спуску по-прежнему не даёт — даже вам.','His eldest, once your intern, now runs your mine. Still gives no slack — not even to you.']:null,
    c.alt4==='a'?['На Алтае у Петра пасека. Первый улей подарили вы — он называется «Сосновый лог».','Pyotr keeps bees in the Altai. You gave him the first hive — it’s called Pine Hollow.']:null]);}
  // Витя
  {const L=lv(W,'vit');add('vit','happy',[
    L>=3?['«ВитТранс» возит пол-Сибири: самосвалы, вагоны, автобусы. Витя иногда таксует — «чтобы не зазнаваться».','VitTrans hauls half of Siberia: trucks, rail cars, buses. Vitya still drives a taxi now and then — “to stay humble”.']
      :L===2?['Витя продал «ВитТранс» и купил… такси. Одно. Говорит, счастье — это когда пассажиры сами рассказывают анекдоты.','Vitya sold VitTrans and bought… a taxi. Just one. Says happiness is when passengers tell the jokes themselves.']
      :['Витя открыл автошколу. На первом уроке учит: «Друзей на обочине не бросают». Смотрит при этом в вашу сторону. Но улыбается.','Vitya opened a driving school. Lesson one: “You don’t leave friends by the roadside.” He looks your way when he says it. But he smiles.'],
    v.wed===1?[G('Вы были свидетелем на его свадьбе — Марина до сих пор показывает фото, где вы ловите букет.','Вы были свидетельницей на его свадьбе — Марина до сих пор показывает фото, где вы ловите букет.'),'You were his witness at the wedding — Marina still shows the photo of you catching the bouquet.']
      :v.wed===2?['На свадьбе вас не было, но ваш тост зачитывают на каждой годовщине.','You missed the wedding, but your toast is read out at every anniversary.']:null,
    v.disc>0?['Один вагон «ВитТранса» назван в вашу честь — за то, что когда-то выкупили его у Медведя.','One VitTrans rail car is named after you — for buying it back from the Bear years ago.']:null,
    c.alt3==='a'?['«Пчёлки» возят туристов по всему Алтаю. Водители всё ещё в полосатых жилетах.','The Busy Bees carry tourists all over the Altai. The drivers still wear striped vests.']:null]);}
  // Топтыгин
  add('bear','calm',[c.sak5==='a'?['Топтыгин продал «Медведь Капитал» и каждое лето рыбачит. С вами. Молча — как настоящие рыбаки.','Toptygin sold Bear Capital and goes fishing every summer. With you. In silence — like real anglers.']
      :tp.end===1?['Топтыгин так и не стал вашим партнёром, но на встречу пришёл. Сел за соседний столик и первым поднял тост за 11 «Б».','Toptygin never became your partner, but he came. Sat at the next table and was first to toast Class 11B.']
      :['Топтыгин — не одноклассник, но за соседним столиком. Делает вид, что не слушает. Слушает.','Toptygin isn’t a classmate, but he’s at the next table. Pretending not to listen. Listening.'],
    c.yak5==='a'?['Общий зимник в Якутии до сих пор называют «Медвежьей переправой». Он не возражает.','The shared ice road in Yakutia is still called the Bear Crossing. He doesn’t mind.']:null]);
  // Людмила Санна
  add('lud','happy',[lu.ret?['Людмила Санна — на пенсии, почётный главбух всех ваших холдингов. '+(c.nor4?'Считает внуков: Ася, ещё двое и кот.':'Считает внуков — пока в уме, но с запасом.'),'Lyudmila Sanna is retired — honorary chief accountant of all your holdings. '+(c.nor4?'She counts grandchildren now: Asya, two more and a cat.':'She counts grandchildren now — in her head, with a margin.')]
      :['Людмила Санна так и не ушла на пенсию: «Кто же вам сведёт отчёты?». Сегодня она принесла пироги и папку «Итоги».','Lyudmila Sanna never did retire: “Who else would close your books?” Today she brought pies and a folder marked “Results”.'],
    lu.gift===2?['Торт, который вы испекли ей на юбилей, она вспоминает чаще любой путёвки.','She remembers the cake you baked for her birthday more often than any holiday trip.']:lu.gift===1?['Санаторий, подаренный на юбилей, она называет «лучшей проводкой года».','She calls the spa trip you gave her “the best entry of the year”.']:null,
    c.alt2==='a'?['Меню вашей турбазы она проверяет до сих пор. «Медовый чай» подешевел.','She still checks your lodge’s menu. The honey tea got cheaper.']:null]);
  return o;}
function heroLine(W,Y){const F=W.fr||{};let fame=[];try{fame=Array.isArray(S.fame)?S.fame:[];}catch(e){}let sum=0;for(const r of fame)sum+=r.eq||0;
  const n=fame.length;return T(`${F.rags?`${Y} ${YL(Y)} назад вы клеили листовки у метро.`:`Всё началось с одного участка в Кузбассе.`} Сегодня — ${n} ${typeof pl==='function'?pl(n,'холдинг','холдинга','холдингов','',''):'холдингов'} на бирже, вместе на ${money(sum)}. Кафе «Юность», где вы встречались все эти годы, теперь ваше — вы вернули ему старую вывеску.`,
    `${F.rags?`${Y} years ago you were handing out flyers by the metro.`:`It all began with a single plot in Kuzbass.`} Today — ${n} ${n===1?'holding':'holdings'} listed on the exchange, worth ${money(sum)} in total. Youth Café, where you met all these years, is yours now — you gave it back its old sign.`);}
function open(re){const W=root.GAME&&GAME.W;if(!W||!W.fr||typeof modal!=='function')return;const Y=10+Math.floor(W.m/12),st=BS.st(),first=!st.f;
  const pic=(id,m)=>U().pic?U().pic(id,m,48):'',nm=id=>id==='lud'?T('Людмила Санна','Lyudmila Sanna'):U().nm?U().nm(id):id;
  let art='';try{if(root.ART&&ART.scene)art='<div class="b2f-ph">'+ART.scene('ph_meet_'+Y,{}).replace(' · '+Y+' лет',' · '+Y+' '+YL(Y))+'</div>';}catch(e){}
  let h='<h2>🎓 '+esc(T(`Финал. Встреча 11 «Б» — ${Y} ${YL(Y)} спустя`,`Finale. Class 11B — ${Y} years later`))+'</h2>'+art
    +'<p class="b2f-in">'+esc(T('Все пришли. Даже те, кто обещал «может быть». Борис принёс тетради со счётом споров, Витя — гирлянду из автобуса, Пётр — каску «на память», Соня — калькулятор «на всякий случай».','Everyone came. Even those who said “maybe”. Boris brought his notebooks of bet scores, Vitya a string of lights from a bus, Pyotr a hard hat “for old times’ sake”, Sonya a calculator “just in case”.'))+'</p>';
  for(const f of fates(W))h+='<div class="b2f-row">'+pic(f.id,f.mood)+'<div><b>'+esc(nm(f.id))+'</b><p>'+esc(f.tx)+'</p></div></div>';
  let gr='';try{if(root.ART&&ART.gram)gr=ART.gram('🏆',{});}catch(e){}
  h+='<div class="b2f-me">'+(gr?'<div class="b2f-gr">'+gr+'</div>':'')+'<div><b>'+esc(T('Вы','You'))+' · '+esc(T('грамота «Магнат»','the “Tycoon” certificate'))+'</b><p>'+esc(heroLine(W,Y))+'</p></div></div>'
    +'<p class="b2f-in">'+esc(T('Финал сериала — не конец игры. Дальше — свободная игра: новые края, рекорды в «Зале славы» и, конечно, следующая встреча.','The series finale isn’t the end of the game. What’s next is free play: new regions, records in the Hall of Fame and, of course, the next reunion.'))+'</p>';
  try{if(typeof SOC_BRAG!=='undefined'&&typeof socBragHtml==='function'){SOC_BRAG.b2fin=`Финал! Встреча 11 «Б» через ${Y} ${YL(Y)} — и у меня ${(Array.isArray(S.fame)?S.fame.length:0)} холдингов на бирже. Играю в «Из ларька в магнаты»`;h+=socBragHtml('b2fin');}}catch(e){}
  h+='<div class="row"><button class="btn w accent noenter" id="b2fGo">🥂 '+esc(T('За 11 «Б»!','To Class 11B!'))+'</button></div>';
  css();modal(h,first?{hold:1}:undefined);
  const b=document.getElementById('b2fGo');if(b)b.onclick=()=>{try{if(root.SND&&SND.win)SND.win();}catch(e){}hideModal();
    if(!BS.st().f){BS.st().f=1;BS.st().fm=W.m;let cr=0;try{cr=B2.eco&&B2.eco.give?B2.eco.give('story.final'):0;}catch(e){}try{save();}catch(e){}B2.ev('story','final',{y:Y,h:W.hold});B2.emit('story-final',{y:Y});
      try{toast('🎓 '+T('Финал сериала!','Series finale!')+(cr?' +'+cr+' 💎':'')+' · '+T('дальше — свободная игра','free play from here'),3000);}catch(e){}}};
  if(first)B2.ev('story','finshow',{y:Y});}
function css(){if(document.getElementById('b2f-css'))return;const s=document.createElement('style');s.id='b2f-css';
  s.textContent='.b2f-ph svg{width:100%;height:auto;max-height:220px;display:block;border-radius:10px;margin:4px 0 8px}.b2f-in{font-size:17px;line-height:1.4}'
    +'.b2f-row,.b2f-me{display:flex;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line,#d5dbe2)}.b2f-row>svg,.b2f-row>span,.b2f-row>img,.b2f-row>div:first-child:not(:last-child){flex:0 0 48px;margin-right:10px}'
    +'.b2f-row p,.b2f-me p{margin:2px 0 0;font-size:16px;line-height:1.4}.b2f-me{border-bottom:0;background:var(--lk-hb,#f3f5f9);border-radius:10px;padding:10px;margin-top:8px}'
    +'.b2f-gr{flex:0 0 52px;margin-right:10px}.b2f-gr svg{width:52px;height:auto}';document.head.appendChild(s);}
B2.storyFin={open,fates};
})(typeof window!=='undefined'?window:globalThis);
