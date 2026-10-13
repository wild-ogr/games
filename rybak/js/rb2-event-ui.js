'use strict';
/* rb2-event-ui — окна потока EVENT (лениво, R2E.ui): «Записки на мостках», кепка Петровича со значками, «Зорька выходного дня».
   Логика и данные — js/rb2-event.js (window.R2E). Стиль — css/rb2-event.css. */
(function(){
var W=window,R=W.R2E;if(!R)return;
var $=function(id){return document.getElementById(id);};
/* тексты записок, реплики героев, названия значков — здесь (лениво); на старте — только короткие подписи */
var BADGE=[[['Не верю!','I don\'t believe it!'],['Рыба с ладонь','Palm-sized'],['Байка правдой','Tall tale, true'],['Спорщик','The arguer'],['Честь Митяя','Mityai\'s honour']],
  [['Кошачий друг','Cat\'s friend'],['Ёрш-шутник','Joker ruffe'],['Мур-мур','Purr-purr'],['Кото-кормилец','Cat feeder'],['Герой Васьки','Vaska\'s hero']],
  [['Свежак','Fresh catch'],['Рыбный ряд','Fish row'],['Оптовик','Wholesaler'],['Партнёр Жоры','Zhora\'s partner'],['Король базара','Market king']],
  [['Вобла к чаю','Roach for tea'],['Чехонь в дорогу','Sabre for the road'],['Скорый поезд','Express train'],['Проводница рада','Happy conductor'],['Почётный пассажир','Honoured passenger']],
  [['Уха к ужину','Soup for dinner'],['Наваристая','Rich broth'],['Тройная уха','Triple soup'],['Пирог с рыбой','Fish pie'],['Хозяйка довольна','The wife is pleased']],
  [['Конопатчик','Caulker'],['Смола и пакля','Tar and oakum'],['Новые вёсла','New oars'],['Лодка на плаву','Afloat'],['Капитан плёса','Captain of the reach']],
  [['Подсечка','The strike'],['Дальний заброс','Long cast'],['Книга места','Place book'],['Зорька','Dawn bite'],['Ученик Петровича','Petrovich\'s pupil']]];
function nText(n){var t='',w='';
  switch(n.t){
  case 'sp':t=L('Поймай: '+R.fN(n.f)+(n.n>1?' × '+n.n:''),'Catch: '+R.fN(n.f)+(n.n>1?' × '+n.n:''));w=n.p>=0?'📍 '+R.plN(n.p):'';break;
  case 'kg':t=L('Наловить '+kgTxt(n.n/1000),'Catch '+kgTxt(n.n/1000)+' in total');w='📍 '+R.plN(n.p);break;
  case 'one':t=L(n.n+' '+pl(n.n,'рыба','рыбы','рыб','','')+' за одну рыбалку без схода',n.n+' fish in one trip, none lost');break;
  case 'big':t=L((n.f?R.fN(n.f).charAt(0).toUpperCase()+R.fN(n.f).slice(1):'Рыба')+' тяжелее '+kgTxt(n.n/1000),(n.f?nm(fishOf(n.f)):'A fish')+' over '+kgTxt(n.n/1000));break;
  case 'junk':t=L('Вытащи находку со дна','Pull a find from the bottom');break;
  case 'tod':t=L('Поймай рыбу утром и вечером','Catch a fish in the morning and in the evening');w=(n.g&1?'✓ ':'')+L('утро','morning')+' · '+(n.g&2?'✓ ':'')+L('вечер','evening');break;
  case 'night':t=L('Вечером или ночью: '+n.n+' '+pl(n.n,'рыба','рыбы','рыб','',''),'Evening or night: '+n.n+' fish');break;
  case 'vid':t=L(n.n+' '+pl(n.n,'разный вид','разных вида','разных видов','','')+' за одну рыбалку',n.n+' different species in one trip');break;
  case 'nw':t=L('Новый вид в альбом','A new species for the album');break;
  case 'trip':t=L('Съезди на рыбалку '+n.n+' '+pl(n.n,'раз','раза','раз','',''),'Go fishing '+n.n+' times');w='📍 '+R.plN(n.p);break;
  case 'tn':t=L('Сходи на турнир недели','Enter the weekly contest');break;
  case 'mg':t=L('Сыграй во Дворе: '+n.n+' '+pl(n.n,'партия','партии','партий','',''),'Play in the yard: '+n.n+' games');break;
  case 'uha':t=L('Свари уху во Дворе','Cook fish soup in the yard');break;
  case 'small':t=L('Мелочь для Васьки: '+n.n+' '+pl(n.n,'рыбка','рыбки','рыбок','','')+' до 250 г','Small fry for Vaska: '+n.n+' under 250 g');break;}
  return [t,w];}
// реплики героев (по одной на записку, выбор — по номеру)
var SAY={mit:[['Спорим, не поймаешь больше, чем я в молодости?','Bet you can\'t beat my catch from back in the day?'],['Я такую в пятьдесят седьмом ловил. Ну, почти такую.','I caught one like that in \'57. Well, almost.'],['Кто не верит — пусть проверит!','Don\'t believe me? Check it yourself!']],
  vas:[['Мяу. (Перевод Петровича: «Где рыба?»)','Meow. (Petrovich translates: “Where\'s the fish?”)'],['Мр-р-р… Мелкую не продавай, мне отдай.','Purr… don\'t sell the small ones, give them to me.'],['Васька трётся о сапог. Намёк понят.','Vaska rubs your boot. Hint taken.']],
  zho:[['Возьму всё, что свежее. Цену дам честную… почти.','I\'ll take anything fresh. Fair price… almost.'],['Клиент ждёт, рынок не ждёт!','The customer waits, the market doesn\'t!'],['Только без чешуи на моём прилавке.','No scales on my counter, please.']],
  val:[['Мне бы к поезду рыбки — пассажиры любят.','Fish for my train — passengers love it.'],['Скорый в шесть, успеешь?','The express leaves at six — can you make it?'],['Чай в подстаканниках, а к чаю — вобла.','Tea in glass holders, and roach to go with it.']],
  wif:[['Ужин сам себя не сварит. Неси рыбу!','Dinner won\'t cook itself. Bring fish!'],['На уху надо разной — для навара.','Soup needs different fish — for the flavour.'],['И чтоб к семи дома был!','And be home by seven!']],
  mih:[['Лодка течёт, как решето. Подсобишь?','The boat leaks like a sieve. Give me a hand?'],['Без смолы не поплывём.','No tar — no sailing.'],['Вёсла — дело святое.','Oars are sacred.']],
  pet:[['Рыбалка — это наука. Сегодня урок такой.','Fishing is a science. Today\'s lesson.'],['Не торопись с подсечкой — рыба не любит суеты.','Don\'t rush the strike — fish hate a fuss.'],['Кто рано встаёт — тому рыба клюёт.','The early bird gets the fish.']]};
function nSay(n){if(n.x)return L('Праздник! Особая рыба клюёт только сейчас.','Holiday! A special fish bites only now.');var h=n.h>=0?R.HER[n.h][0]:'pet',a=SAY[h];var x=a[(n.k+n.n)%a.length];return L(x[0],x[1]);}
function svgCat(sz){sz=sz||44;return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#9cc7a4"/>'
  +'<path d="M14 26l4-16 12 10zM50 26l-4-16-12 10z" fill="#ec9440"/><path d="M17 23l2-8 7 6zM47 23l-2-8-7 6z" fill="#f29a9a"/>'
  +'<ellipse cx="32" cy="36" rx="20" ry="17" fill="#ec9440"/><path d="M22 24c3 3 7 4 10 4s7-1 10-4M20 31h6M38 31h6" stroke="#c26a24" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  +'<ellipse cx="32" cy="44" rx="10" ry="7" fill="#fff6ea"/><ellipse cx="25" cy="35" rx="3.2" ry="3.8" fill="#7cc04a"/><ellipse cx="39" cy="35" rx="3.2" ry="3.8" fill="#7cc04a"/>'
  +'<ellipse cx="25" cy="35.5" rx="1.2" ry="3" fill="#222"/><ellipse cx="39" cy="35.5" rx="1.2" ry="3" fill="#222"/><path d="M30 41h4l-2 2.4z" fill="#e07a7a"/>'
  +'<path d="M32 43.4c-1 2-3 2.4-4.4 1.6M32 43.4c1 2 3 2.4 4.4 1.6M18 42l-9-2M18 45l-8 1M46 42l9-2M46 45l8 1" stroke="#7a4a2a" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>';}
function botAv(name){try{var bs=META.league.bots;for(var l=0;l<bs.length;l++)for(var j=0;j<bs[l].length;j++)if(bs[l][j].n===name)return bs[l][j].av;}catch(e){}return null;}
function face(av,sz){try{return META.league.face(av,sz);}catch(e){return '<span style="font-size:'+(sz*.6)+'px">🙂</span>';}}
function av(h,sz){sz=sz||44;var id=h>=0?R.HER[h][0]:'fest',s='';
  try{if(id==='pet'||id==='fest')s=LOOK.av('petr');else if(id==='mit')s=LOOK.av('mit');}catch(e){}
  if(s)return '<span class="r2e-av" style="width:'+sz+'px;height:'+sz+'px">'+s+'</span>';
  if(id==='vas')return '<span class="r2e-av">'+svgCat(sz)+'</span>';
  if(id==='val')return '<span class="r2e-av">'+face(botAv('Тётя Валя-проводница')||['#b9a6d6','#eab894','scarf','#c23b5a',0,0,'#4a2e1e'],sz)+'</span>';
  if(id==='mih')return '<span class="r2e-av">'+face(botAv('Михалыч с лодкой')||['#8ab0a0','#dca47e','ushanka','#5a4a3a',1,0,'#6a6a6a'],sz)+'</span>';
  if(id==='zho')return '<span class="r2e-av">'+face(['#c9b48a','#e0a880','cap','#3a3a3a',0,0,'#2a1a10'],sz)+'</span>';
  return '<span class="r2e-av">'+face(['#f0c0b8','#f2c7a5','scarf','#7a3fa0',0,0,'#7a4a2a'],sz)+'</span>';}
function day(){return dayNum();}
function per(){return R.num('zap.perDay',5);}
function noteC(n){var o=R.X();if(o.zk===day()&&o.zc>=per())return '';var c=n.c||R.cR(R.num('zap.note',[.15,20]));if(R.frost())c*=2;return '+'+coinsTxt(c);}
function dots(k){var h='<span class="r2e-dots">';for(var i=0;i<5;i++)h+='<i class="'+(i<k?'on':i===k?'cur':'')+'"></i>';return h+'</span>';}
function card(n,i){var tx=nText(n),p=R.prog(n),q=R.need(n),o=R.X(),ch=n.s===2,lbl=ch?L('Связка','Set')+': '+esc(L(R.HER[n.h][3],R.HER[n.h][4])):n.s===0?L('Короткая','Quick'):L('Средняя','Longer');
  var pr=n.t==='kg'?kgTxt(Math.min(n.g,n.n)/1000)+' / '+kgTxt(n.n/1000):n.t==='tod'?'':p+' / '+q;
  return '<div class="r2e-card s'+n.s+'"><div class="r2e-ch">'+av(n.h,44)+'<div><small>'+lbl+(ch?' '+dots(o.ch[1]):'')+'</small><b>'+esc(R.heroN(n.h))+'</b></div>'
    +'<button class="r2e-sw noenter" data-sw="'+i+'" aria-label="'+L('Заменить записку','Swap note')+'">🔄</button></div>'
    +'<p class="r2e-q">«'+esc(nSay(n))+'»</p><p class="r2e-task"><b>'+esc(tx[0])+'</b>'+(tx[1]?'<small>'+esc(tx[1])+'</small>':'')+'</p>'
    +'<div class="r2e-pg"><span class="r2e-bar"><i style="width:'+Math.max(3,Math.round(p/q*100))+'%"></i></span><em>'+pr+'</em><b class="r2e-c">'+(noteC(n)||L('в связку','to the set'))+'</b></div>'
    +(ch&&o.ch[1]===4?'<p class="r2e-big">🎁 '+L('Последняя записка связки: значок на кепку','Last note of the set: a badge for the cap')+' + '+coinsTxt(R.cR(R.num('zap.pack',[.6,60])))+'</p>':'')+'</div>';}
function capSvg(sz,n){var cs=R.badgeCols(),gold=n>=40,h='<svg width="'+sz+'" height="'+Math.round(sz*.62)+'" viewBox="0 0 100 62" aria-hidden="true">'
  +'<path d="M14 46C14 18 30 6 50 6s36 12 36 40z" fill="'+(gold?'#e7b93c':'#5a4a3a')+'"/><path d="M50 6c-4 10-5 26-4 40" stroke="'+(gold?'#c99a1e':'#3e3228')+'" stroke-width="2" fill="none"/>'
  +'<path d="M8 46h84c4 0 6 3 4 6-14 6-78 6-92 0-2-3 0-6 4-6z" fill="'+(gold?'#d8a82a':'#3e3228')+'"/><circle cx="50" cy="7" r="3" fill="'+(gold?'#fff2b0':'#7a6a5a')+'"/>';
  var m=Math.min(14,cs.length);for(var i=0;i<m;i++){var row=i<7?0:1,k=row?i-7:i,cnt=row?m-7:Math.min(7,m),a=Math.PI*(1.1+.8*(k+.5)/cnt),rx=row?24:32,ry=row?18:28;
    var x=50+Math.cos(a)*rx,y=48+Math.sin(a)*ry;h+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="4.2" fill="'+cs[i]+'" stroke="#fff" stroke-width="1"/>';}
  return h+'</svg>';}
function zap(){var o=R.ensure(),k=R.klevOf(),n=R.badgeN(),dz=o.zk===day()?o.zc:0;R.evalMg();
  var kh='';if(k){var kn=o.kl.w===weekNum()?o.kl.n:0;kh='<div class="r2e-klev">🐟 <span><b>'+L('Клёв недели','Bite of the week')+': '+esc(R.fN(k.f))+'</b><small>📍 '+esc(R.plN(k.pi))+' · '+L('клюёт чаще обычного','bites more often')+' · '+L('поймано','caught')+' '+Math.min(3,kn)+'/3'+(o.kl.d&&o.kl.w===weekNum()?' ✓':'')+'</small></span></div>';}
  modal('<div class="r2e-w"><div class="r2e-hd"><h2>📌 '+L('Записки на мостках','Pier notes')+'</h2><p class="uw-sub">'+L('Выполнил — монеты сразу, а на столбе уже новая записка. Сроков нет.','Done — coins at once, and a new note is already pinned. No deadlines.')+'</p></div>'
    +o.z.map(card).join('')
    +'<p class="r2e-day">'+L('Записок с монетами сегодня','Paid notes today')+': '+Math.min(dz,per())+' / '+per()+(dz>=per()?' · '+L('дальше — в связку и значки','now they count for sets and badges'):'')+(R.frost()?' · ❄ '+L('Трескучие морозы: награды ×2','Hard frost: rewards ×2'):'')+'</p>'
    +kh+'<button class="r2e-capb noenter" id="r2eCap">'+capSvg(64,n)+'<span><b>'+L('Кепка Петровича','Petrovich\'s cap')+'</b><small>'+n+' / 40 '+L('значков','badges')+(n>=40?' · '+L('Золотая кепка!','Golden cap!'):'')+'</small></span><i>›</i></button>'
    +'<div class="row"><button class="btn green" id="r2eGo">🎣 '+L('На рыбалку','Go fishing')+'</button><button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div></div>');
  $('mcard').querySelectorAll('[data-sw]').forEach(function(b){b.onclick=function(){swap(+b.dataset.sw);};});
  $('r2eCap').onclick=function(){SND.tap();cap();};
  $('r2eGo').onclick=function(){SND.tap();hideModal();try{var pi=topPlace();startFish(pi);}catch(e){}};
  $('mCancel').onclick=function(){hideModal();try{if($('scr-map').classList.contains('on'))openMap();}catch(e){}};
  if(W.LOOK&&LOOK.walk)try{LOOK.walk($('mcard'));}catch(e){}}
// замена записки: раз в день бесплатно («Васька стащил»), дальше — ролик или монеты
function swapDo(i,how){var o=R.X(),n=o.z[i];if(!n)return;var slot=n.s,nn=R.gen(o,slot);o.z[i]=nn;if(how==='free')o.zs=day();save();
  R.st('zap',{a:'swap',t:n.t,s:slot+1,c:how});}
function swap(i){var o=R.X(),free=o.zs!==day(),price=R.cR([.1,15]),ad=false;try{ad=adOk()&&adLikely();}catch(e){}
  if(free){swapDo(i,'free');toast('🐈 '+L('Васька стащил записку — вот новая!','Vaska stole the note — here is a new one!'),2600);zap();return;}
  modal('<h2>🔄 '+L('Заменить записку?','Swap the note?')+'</h2><p>'+L('Бесплатная замена сегодня уже была. Завтра — снова бесплатно.','Free swap already used today. Free again tomorrow.')+'</p>'
    +'<div class="row">'+(ad?'<button class="btn accent noenter" id="r2eSwAd">📺 '+L('За рекламу','For an ad')+'</button>':'')+'<button class="btn" id="r2eSwC"'+(S.coins<price?' disabled':'')+'>'+L('За ','For ')+coinsTxt(price)+'</button></div><div class="row"><button class="btn" id="mCancel">'+L('Назад','Back')+'</button></div>');
  if($('r2eSwAd')){try{STAT.offer('zapswap');}catch(e){}$('r2eSwAd').onclick=function(){if(adHold('zapswap'))return;hideModal();try{STAT.place('zapswap');}catch(e){}
    var done=false;showRewarded(function(){if(!done){done=true;swapDo(i,'ad');}zap();},function(){zap();},function(){if(done)return '';done=true;swapDo(i,'ad');return L('записка заменена','note swapped');});};}
  $('r2eSwC').onclick=function(){if(S.coins<price)return;S.coins-=price;try{updCoins();}catch(e){}swapDo(i,'coins');SND.tap();zap();};
  $('mCancel').onclick=zap;}
// кепка: 40 значков (7 героев × 5 + 5 особых)
function cap(){var o=R.X(),n=R.badgeN(),h='';
  R.HER.forEach(function(x,j){var got=Math.min(5,o.hc[j]||0);h+='<div class="r2e-brow"><span class="r2e-bh">'+av(j,36)+'<small>'+esc(L(x[3],x[4]))+'</small></span><span class="r2e-bs">';
    for(var k=0;k<5;k++){var bn=L(BADGE[j][k][0],BADGE[j][k][1]);h+='<button class="r2e-b noenter'+(k<got?' on':'')+'" data-bn="'+esc(k<got?bn:L('Ещё не получен','Not yet earned'))+'"><i style="background:'+(k<got?x[5]:'#9a9a9a')+'">'+(k<got?k+1:'?')+'</i></button>';}
    h+='</span></div>';});
  h+='<div class="r2e-brow"><span class="r2e-bh"><span class="r2e-av" style="font-size:28px">🎖</span><small>'+L('Особые','Special')+'</small></span><span class="r2e-bs">';
  R.SPB.forEach(function(x,k){var on=!!(o.sp&(1<<k));h+='<button class="r2e-b noenter'+(on?' on':'')+'" data-bn="'+esc(L(x[0],x[1])+(on?'':' — '+L('ещё не получен','not yet earned')))+'"><i style="background:'+(on?x[2]:'#9a9a9a')+'">'+(on?'★':'?')+'</i></button>';});
  h+='</span></div>';
  modal('<div class="r2e-w"><h2>🧢 '+L('Кепка Петровича','Petrovich\'s cap')+'</h2><div class="r2e-capbig">'+capSvg(150,n)+'</div><p class="uw-sub">'+n+' / 40 · '+(n>=40?L('Золотая кепка! Дальше каждая связка — сундук с монетами.','Golden cap! Every set from now on is a chest of coins.'):L('Собери связку из 5 записок героя — Петрович приколет значок. Все 40 — «Золотая кепка».','Finish a hero\'s set of 5 notes — Petrovich pins a badge. All 40 — the Golden cap.'))+'</p>'
    +h+'<p class="r2e-day">'+L('Нажми на значок — Петрович скажет, за что он.','Tap a badge to see what it is for.')+'</p><div class="row"><button class="btn" id="mCancel">'+L('Назад','Back')+'</button></div></div>');
  $('mcard').querySelectorAll('[data-bn]').forEach(function(b){b.onclick=function(){SND.tap();toast('🎖 '+b.dataset.bn,2400);};});
  $('mCancel').onclick=zap;R.st('zap',{a:'capw',n:n});}
// «Зорька выходного дня»
function zor(){var o=R.X(),d=day(),my=o.zr.d===d?o.zr.b:0,t=R.zorTable(d,my),now=R.zorNow(),lg=0;try{lg=S.lgL||0;}catch(e){}
  var rows=t.map(function(r,i){return '<div class="lgr'+(r.me?' me':'')+'"><b class="lgp">'+(i+1)+'</b>'+(r.me?face(['#ffcf7a','#e8b48e','cap','#e07a3a',0,0,'#5a3a22'],36):face(r.b.av,36))+'<span class="lgn"><b>'+(r.me?L('Ты','You'):esc(L(r.b.n,r.b.en)))+'</b></span><i class="lgg">'+(r.g?kgTxt(r.g/1000):'—')+'</i></div>';}).join('');
  var pay=R.num('zor.pay',[.5,.3,.2]),tr=0;try{tr=TRIP_C[topPlace()]||30;}catch(e){}
  modal('<div class="r2e-w"><h2>🌅 '+L('Зорька выходного дня','Weekend dawn contest')+'</h2><p class="uw-sub">📍 '+esc(R.plN(weekPlace()))+' · '+L('с 5 до 11 утра','5 to 11 am')+'</p>'
    +'<p>'+L('Соседи по лиге вышли на утреннюю зорьку. Снасть казённая, червь, 5 забросов, в зачёт — вес улова. Пробовать можно сколько угодно до 11:00.','The league neighbours are out at dawn. Same tackle, worms, 5 casts, total weight counts. Try as often as you like until 11:00.')+'</p>'
    +'<div class="lgt">'+rows+'</div><p class="about">'+L('Итог — в 11:00: ','Results at 11:00: ')+[1,2,3].map(function(p){return p+' '+L('место','place')+' +'+coinsTxt(Math.max(10,Math.round(tr*pay[p-1]/5)*5));}).join(' · ')+'. '+L('Первая победа — значок на кепку Петровича.','First win — a badge for Petrovich\'s cap.')+'</p>'
    +'<div class="row">'+(now?'<button class="btn green" id="r2eZGo">🎣 '+(my?L('Ещё попытка','Try again'):L('Ловить','Go fishing'))+'</button>':'<p>'+L('Зорька закончилась — до следующих выходных!','The dawn contest is over — see you next weekend!')+'</p>')+'<button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div></div>');
  if($('r2eZGo'))$('r2eZGo').onclick=function(){SND.tap();R.zorGo();};$('mCancel').onclick=function(){hideModal();try{if($('scr-map').classList.contains('on'))openMap();}catch(e){}};R.st('zor',{a:'open',p:R.zorPlace(d,my)});}
W.R2E_UI={zap:zap,cap:cap,zor:zor,swap:swap,capSvg:capSvg,av:av};
})();
