/* ================= M38 (a45): словарик для игрока 45+ — нажатие на термин → короткое пояснение; список — в «Как играть» =================
   Термины в обычном тексте (не в кнопках) помечаются пунктиром: <abbr class="gl" data-gl="ключ">слово</abbr> (MutationObserver, как значки icons.js;
   textContent не меняется). Нажатие — всплывающая карточка #glPop над всем (не окно modal: открытое окно не теряется), время стоит (GAME.hold 'gl').
   window.GLOSS = {T (словарь), show(key), hide(), listHtml(), mark(root)}. Зона a45; правки — только с пометкой M38. Старые WebView: без inset/gap. */
(function(){
'use strict';
var ru=function(){return typeof LANG==='undefined'||LANG!=='en';};
var tx=function(a,b){return ru()?a:b;};
// ключ → [заголовок ru, en, пояснение ru, en, регэксп ru, регэксп en]
var T={
 hand:['Время (рука)','Hands','Сколько дел вы ведёте одновременно: заказ, работа на складе, точка без управляющего — каждое занимает одно «дело». Свободного времени нет — новое дело не взять, пока не закончится старое или не наймёте управляющего.','How many things you do at once: a job, the warehouse shift, an outlet without a manager each take one hand. No free hand — nothing new until something ends or you hire a manager.',/([Вв]аше(го)? врем(я|ени)|[Сс]вободно(го|е) врем(я|ени)|Время(?= —| ✋|:))/,/\b[Hh]ands?\b/],
 en:['Силы','Energy','Запас сил героя ⚡. Заказы тратят силы, сон возвращает +30 за ночь, выходной — до максимума. Когда сил меньше 30, заказ чаще срывается.','Your energy ⚡. Jobs use it, a night’s sleep gives +30, a day off fills it up. Below 30 jobs fail more often.',/[Сс]ил[ыа]?(?=[\s:·,.!?)]|$)/,/\b[Ee]nergy\b/],
 mile:['Веха','Milestone','Небольшая цель главы (например, «накопить 30 тыс. ₽»). За каждую — несколько 💎. Список — в «Сегодня» → «▼ Ещё» → «Вехи».','A small chapter goal (e.g. “save 30k ₽”). Each gives a few 💎. The list is in Today → More → Milestones.',/[Вв]ех[аиуе]/,/\b[Mm]ilestones?\b/],
 rank:['Звание','Rank','Ваш опыт в игре: ★ в шапке. Растёт за главы, вехи и дела; за новое звание — 💎 и украшения. Подробнее — в Кабинете (нажмите ★).','Your experience: the ★ in the header. Grows with chapters, milestones and deeds; a new rank gives 💎 and decorations. Details — in the Office (tap ★).',/[Зз]вани[еяю]/,/\b[Rr]ank\b/],
 opd:['Опердиректор','Ops director','Операционный директор — нанятый управленец. Ведёт все точки одного вида за вас за 150 тыс. ₽ в месяц; управляющие в этих точках не нужны, у вас занято одно дело на всю сеть. Выгоден от ~4–5 точек.','An operations director — a hired manager who runs all outlets of one kind for you for 150k ₽ a month; no outlet managers needed, one of your hands for the whole chain. Pays off from ~4–5 outlets.',/([Оо]пердиректор[а-я]*|[Оо]перационн[а-я]+ директор[а-я]*)/,/\b[Oo]ps director\b/],
 mgr:['Управляющий','Manager','Нанятый человек в точке: работает вместо вас и берёт 30 % её прибыли (в плохой месяц — оклад 15 000 ₽). Ваше время освобождается для другого дела.','A hired person at an outlet: works instead of you for 30% of its profit (15,000 ₽ in a bad month). Your hand is free for something else.',/[Уу]правляющ(ий|его|ему|им|ие|их)/,/\b[Mm]anagers?\b/],
 opi:['ОПИ','Local minerals','Общераспространённые полезные ископаемые — песок, щебень, глина. Участки продаются на торгах; разумная цена лицензии — до четверти оценки.','Common minerals — sand, gravel, clay. Plots are sold at auctions; a sensible licence price is up to a quarter of the estimate.',/ОПИ/,/\bLocal mineral\b/],
 bdr:['БДР','P&L','Бюджет доходов и расходов — отчёт о прибылях и убытках: выручка минус все расходы = прибыль. Показывает, заработали вы или нет.','Profit and loss statement: revenue minus all costs = profit. Shows whether you earned money.',/БДР/,/\bP&L\b/],
 dds:['ДДС','Cash flow','Движение денежных средств: сколько денег пришло и ушло за месяц. Прибыль и деньги — не одно и то же: товар в долг или покупка точки меняют деньги, а не прибыль.','Cash flow: how much money came in and went out this month. Profit and cash differ: credit sales or buying an outlet change cash, not profit.',/ДДС/,/\b[Cc]ash flow\b/],
 bal:['Баланс','Balance sheet','Что у компании есть (деньги, товар, точки, заводы) и откуда это (ваш капитал и долги). Всегда сходится: имущество = капитал + долги.','What the company owns (cash, stock, outlets, plants) and where it came from (your equity and debts). Always balances: assets = equity + debts.',/[Бб]аланс(?![а-я])/,/\b[Bb]alance sheet\b/],
 ebitda:['EBITDA','EBITDA','Прибыль до процентов, налогов и амортизации — сколько зарабатывает само дело, без учёта кредитов и износа. Банк по ней решает, сколько дать в долг.','Earnings before interest, taxes, depreciation and amortisation — what the business itself earns, ignoring loans and wear. The bank lends based on it.',/EBITDA/,/EBITDA/],
 marg:['Маржинальная прибыль','Gross margin','Выручка минус себестоимость проданного (товар, сырьё). Из неё платятся аренда, зарплаты и всё остальное.','Revenue minus the cost of what was sold (goods, raw materials). Rent, wages and everything else are paid out of it.',/[Мм]аржинальн[а-я]+ прибыл[а-я]+/,/\b[Gg]ross margin\b/],
 amort:['Амортизация','Depreciation','Износ точек и заводов: их цена списывается в расходы понемногу каждый месяц. Деньги при этом не уходят — это только учёт.','Wear of outlets and plants: their cost is written off a little each month. No cash leaves — it is just accounting.',/[Аа]мортизаци[яиюей]/,/\b[Dd]epreciation\b/],
 fact:['Факторинг','Factoring','Продать банку долг покупателей: деньги приходят сразу, а не через 14–30 дней, банк берёт за это ~3 %. Можно включить «автофакторинг».','Selling your customers’ debt to the bank: cash now instead of in 14–30 days, the bank takes ~3%. You can turn on auto-factoring.',/[Фф]акторинг[а-я]*/,/\b[Ff]actoring\b/],
 rec:['Дебиторка','Receivables','Дебиторская задолженность — сколько вам должны покупатели за товар, отданный с отсрочкой. Это ваши деньги, но пока не на счёте.','Accounts receivable — what customers owe you for goods sold on credit. Your money, but not in the account yet.',/([Дд]ебиторк[аиуе]|[Дд]ебиторск[а-я]+ задолженност[а-я]+|[Дд]олг покупателей)/,/\b[Rr]eceivables?\b/],
 od:['Овердрафт','Overdraft','Банк сам доплачивает, когда денег на счёте не хватило, — это дорогой короткий долг. Он портит кредитную историю, лучше не допускать.','The bank covers you automatically when the account runs dry — an expensive short loan. It harms your credit history; better avoid it.',/[Оо]вердрафт[а-я]*/,/\b[Oo]verdraft\b/],
 ch:['Кредитная история','Credit history','Насколько банк вам доверяет: растёт, когда вы вовремя платите по кредитам, падает от овердрафта. Для ООО нужно 50.','How much the bank trusts you: grows when you repay on time, drops with an overdraft. An LLC needs 50.',/[Кк]редитн[а-я]+ истори[а-я]+/,/\b[Cc]redit history\b/],
 eq:['Капитал (стоимость дела)','Equity (business value)','Всё ваше: точки + деньги + товар − долги. Копить всю сумму деньгами не нужно — точки тоже считаются.','Everything you own: outlets + cash + stock − debts. You don’t need to hold it all as cash — outlets count too.',/([Сс]тоимость дела|[Кк]апитал(?![а-я]))/,/\b([Ee]quity|[Bb]usiness value)\b/],
 pay:['Окупаемость','Payback','За сколько месяцев прибыль вернёт вложенные деньги. Чем меньше — тем выгоднее.','How many months of profit it takes to return the money you put in. The fewer, the better.',/[Оо]купа(емост[а-я]+|ется|ится)/,/\b[Pp]ays? back\b/],
 usn:['УСН, НПД, ОСНО','Tax regimes','Режимы налога: НПД — самозанятый, 4–6 %; УСН — упрощённый для ИП и ООО: 6 % с доходов или 15 % с прибыли; ОСНО — общий, с НДС (в «Недрах»).','Tax regimes: NPD — self-employed, 4–6%; USN — simplified for sole traders and LLCs: 6% of revenue or 15% of profit; OSNO — general, with VAT (in Mining).',/(УСН|НПД|ОСНО)/,/\b(USN|NPD|OSNO)\b/],
 key:['Ключевая ставка','Key rate','Ставка Центробанка. От неё зависят проценты по кредитам: выше ставка — дороже долг.','The central bank rate. Loan interest depends on it: higher rate — dearer debt.',/[Кк]лючев[а-я]+ ставк[а-я]+/,/\b[Kk]ey rate\b/],
 plan:['Планёрка','Briefing','Утро у Людмилы Санны: подарок дня (💎), три поручения и бонус за все три. Забирается одной кнопкой «Забрать всё».','The morning meeting with Lyudmila Sanna: a daily gift (💎), three tasks and a bonus for all three. Collect with one tap.',/[Пп]ланёрк[аиуе]/,/\b[Bb]riefing\b/],
 hoz:['Хозяйский глаз','Owner’s eye','Точка, где стоите вы сами, приносит немного больше (+5 %), чем с управляющим: хозяин следит за мелочами.','An outlet you run yourself earns a bit more (+5%) than with a manager: the owner watches the details.',/[Хх]озяйск[а-я]+ глаз[а-я]*/,/\b[Oo]wner’s eye\b/],
 // M39: термины опта
 otsr:['Отсрочка','Credit to buyers','Покупатели опта платят не сразу, а через 7–30 дней. С отсрочкой покупателей больше, но ваши деньги «сидят» у них, а товар вы закупаете сразу.','Wholesale buyers pay 7–30 days later. With credit you get more buyers, but your money sits with them while you pay for stock right away.',/[Оо]тсрочк[аиуеой]/,/\bcredit to buyers\b/],
 nacen:['Наценка','Mark-up','Сколько опт добавляет к цене закупки. Ниже наценка — больше покупателей, но меньше с каждой продажи. Своим точкам опт продаёт без наценки.','How much the wholesale adds to its purchase price. Lower mark-up — more buyers but less per sale. Your own outlets buy at cost.',/[Нн]аценк[аиуеой]/,/\b[Mm]ark-up\b/],
 c1:['1С','1C','Программа учёта: видно, что где лежит и кто что купил. Убирает потери и пересортицу на складе.','Accounting software: you see what is where and who bought what. Removes losses and mix-ups in the warehouse.',/1С/,/\b1C\b/],
 link:['Связь (свой опт)','Link (own wholesale)','Свой опт снабжает свои точки дешевле: они не платят чужую наценку. Скидка точке от всех связей — не больше 6 %, вместе со скидкой сети — не больше 10 %.','Your own wholesale supplies your outlets cheaper: they don’t pay someone else’s mark-up. An outlet gets at most 6% from links, 10% with the chain discount.',/[Сс]вяз(ь|и|ей)(?=[\s:·,.!?)]|$)/,/\b[Ll]inks?\b/],
 hire:['Наёмная машина','Hired vehicle','Чужая газель или самосвал с водителем: платите за каждый рейс, дороже своей (газель 220 тыс. ₽ в месяц против 90 тыс.). Своя машина покупается внутри опта или стройбазы.','Someone else’s van or truck with a driver: you pay per trip, dearer than your own (a van 220k ₽ a month vs 90k). Your own is bought inside the wholesale or yard.',/[Нн]аёмн[а-я]+/,/\bhired\b/],
 wms:['Адресное хранение','Address storage (WMS)','Каждый товар — на своей ячейке, сканеры: склад отгружает больше и быстрее.','Every item in its own cell, scanners: the warehouse ships more, faster.',/[Аа]дресн[а-я]+ хранени[а-я]+/,/\b[Aa]ddress storage\b/],
 tender:['Тендер','Tender','Конкурс крупного покупателя: кто предложит лучшие условия, тот и поставляет.','A big buyer’s contest: whoever offers the best terms gets to supply.',/[Тт]ендер[а-я]*/,/\b[Tt]enders?\b/],
 manip:['Манипулятор','Crane truck','Грузовик с краном: возит штучные стройматериалы (блоки, цемент) и сам их разгружает.','A truck with a crane: carries building supplies (blocks, cement) and unloads them itself.',/[Мм]анипулятор[а-я]*/,/\b[Cc]rane truck\b/],
 tk:['Транспортная компания','Haulage company','Свой парк машин для всех ваших бизнесов и чужих заказов: машины не стоят без дела.','Your own fleet for all your businesses and outside orders: vehicles never stand idle.',/[Тт]ранспортн[а-я]+ компани[а-я]+/,/\b[Hh]aulage company\b/],
 lmile:['Последняя миля','Last mile','Доставка посылки от склада до покупателя или пункта выдачи.','Delivery of a parcel from the warehouse to the buyer or pick-up point.',/[Пп]оследн[а-я]+ мил[а-я]+/,/\b[Ll]ast mile\b/],
 cap:['Потолок склада','Warehouse ceiling','Сколько склад может отгрузить в месяц. Выше — нужна вторая смена или адресное хранение.','How much the warehouse can ship a month. Beyond that you need a second shift or address storage.',/[Пп]отолок склада/,/\b[Ww]arehouse ceiling\b/]
};
var KEYS=Object.keys(T);
/* ---------- CSS ---------- */
function css(){if(document.getElementById('glCss'))return;var s=document.createElement('style');s.id='glCss';s.textContent=
 'abbr.gl{display:inline!important;float:none!important;width:auto!important;margin:0!important;padding:0!important;text-decoration:none;border-bottom:1.5px dotted currentColor;cursor:help;-webkit-tap-highlight-color:rgba(0,0,0,.08)}'+
 '#glPop{position:fixed;left:12px;right:12px;bottom:calc(92px + env(safe-area-inset-bottom));z-index:85;max-width:520px;margin:0 auto;background:var(--card,#fff);color:var(--ink,#101828);border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.35);border:1px solid var(--line2,#d3dae6);padding:14px 16px 12px;display:none;font-size:17px;line-height:1.4}'+
 '#glPop.on{display:block}#glPop h4{margin:0 48px 6px 0;font-size:19px}#glPop p{margin:0 0 6px}'+
 '#glPop .glx{position:absolute;top:6px;right:6px;width:48px;height:48px;border-radius:50%;font-size:26px;color:var(--ink2,#344054);background:none;border:0}'+
 '#glPop .gla{min-height:44px;border:0;background:none;color:var(--accent,#3355ff);font:inherit;font-weight:600;padding:6px 0}'+
 '.gl-list dt{font-weight:700;margin-top:10px}.gl-list dd{margin:2px 0 0;color:var(--ink2,#344054)}';
 document.head.appendChild(s);}
/* ---------- пометка терминов в тексте ---------- */
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,BUTTON:1,A:1,ABBR:1,SELECT:1,OPTION:1,'LK-I':1,'LK-T':1,svg:1,SVG:1,text:1,TITLE:1,H2:1};
var NOSEL='button,a,[data-b],[data-a],[data-ow],[data-mt],[data-cb],[data-x],[data-p],[data-pg],[role=button],.set,#toast,#phPush,#glPop,#nav,#hdr,.pbar,.f-tabs,.fchips,label,select';
function skipNode(t){for(var p=t.parentNode;p&&p.nodeType===1;p=p.parentNode){if(SKIP[p.nodeName]||p.namespaceURI==='http://www.w3.org/2000/svg')return true;if(p.id==='app'||p===document.body)return false;}return false;}
function inCtl(el){try{return !!(el&&el.closest&&el.closest(NOSEL));}catch(e){return true;}}
var busy=false;
function markText(t){var s=t.nodeValue;if(!s||s.length<3||!/[A-Za-zА-Яа-яЁё]/.test(s))return;var par=t.parentNode;if(!par||par.nodeType!==1||skipNode(t)||inCtl(par))return;
 var L=ru()?4:5,best=null;
 for(var i=0;i<KEYS.length;i++){var re=T[KEYS[i]][L];if(!re)continue;var m=re.exec(s);if(m&&(!best||m.index<best.i))best={i:m.index,n:m[0].length,k:KEYS[i]};}
 if(!best)return;
 try{var dsp=getComputedStyle(par).display;if(/flex|grid|box|table/.test(dsp))return;}catch(e){return;}   // в flex/grid отдельный <abbr> стал бы отдельным элементом раскладки
 var blk=par.closest?par.closest('p,li,td,dd,.card,section,#mcard'):null;if(blk&&blk.querySelector('abbr.gl[data-gl="'+best.k+'"]')){var r2=s.slice(best.i+best.n);return;}
 var a=document.createElement('abbr');a.className='gl';a.setAttribute('data-gl',best.k);a.textContent=s.substr(best.i,best.n);
 var fr=document.createDocumentFragment();if(best.i>0)fr.appendChild(document.createTextNode(s.slice(0,best.i)));fr.appendChild(a);
 var rest=s.slice(best.i+best.n);var rn=null;if(rest){rn=document.createTextNode(rest);fr.appendChild(rn);}
 par.replaceChild(fr,t);if(rn)markText(rn);}
function mark(root){if(!root||S0())return;if(root.nodeType===3){markText(root);return;}if(root.nodeType!==1||SKIP[root.nodeName]||inCtl(root))return;
 var w=document.createTreeWalker(root,4,null,false),L=[],x;while((x=w.nextNode()))L.push(x);for(var i=0;i<L.length;i++)markText(L[i]);}
function S0(){try{return typeof S!=='undefined'&&S&&S.glOff===true;}catch(e){return false;}}
function onMut(list){if(busy)return;busy=true;try{for(var i=0;i<list.length;i++){var r=list[i];
   if(r.type==='characterData'){if(r.target.parentNode&&r.target.parentNode.nodeName!=='ABBR')markText(r.target);}
   else for(var j=0;j<r.addedNodes.length;j++)mark(r.addedNodes[j]);}}catch(e){}finally{busy=false;}}
/* ---------- всплывающее пояснение ---------- */
var pop=null,openK=null;
function hold(on){try{if(on)GAME.hold.add('gl');else GAME.hold.delete('gl');}catch(e){}}
function show(k){var t=T[k];if(!t)return;css();if(!pop){pop=document.createElement('div');pop.id='glPop';pop.setAttribute('role','dialog');(document.getElementById('app')||document.body).appendChild(pop);
   pop.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.className==='glx')hide();else if(b.className==='gla'){hide();openList();}});}
 openK=k;pop.innerHTML='<button class="glx" aria-label="'+tx('Закрыть','Close')+'">×</button><h4>📖 '+esc(tx(t[0],t[1]))+'</h4><p>'+esc(tx(t[2],t[3]))+'</p><button class="gla">'+tx('Все слова — словарик','All terms — glossary')+' ›</button>';
 pop.classList.add('on');hold(true);try{if(typeof SND!=='undefined'&&SND.tap)SND.tap();}catch(e){}try{STAT.ev('gl',{k:k});}catch(e){}}
function hide(){if(pop)pop.classList.remove('on');openK=null;hold(false);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function listHtml(open){var h='<details class="gl-wrap"'+(open?' open':'')+'><summary style="min-height:44px;font-weight:700;font-size:18px;cursor:pointer;padding:10px 0">📖 '+tx('Словарик: что значат слова игры','Glossary: what the game’s words mean')+'</summary><dl class="gl-list">';
 for(var i=0;i<KEYS.length;i++){var t=T[KEYS[i]];h+='<dt>'+esc(tx(t[0],t[1]))+'</dt><dd>'+esc(tx(t[2],t[3]))+'</dd>';}
 return h+'</dl><p class="mut" style="font-size:15px">'+tx('Слова с пунктиром в тексте игры можно нажать — появится такое же пояснение.','Dotted words in the game’s text can be tapped for the same explanation.')+'</p></details>';}
function openList(){css();if(typeof modalOn!=='undefined'&&modalOn){var mc=document.getElementById('mcard');if(mc&&!mc.querySelector('.gl-wrap')){var d=document.createElement('div');d.innerHTML=listHtml(true);mc.insertBefore(d.firstChild,mc.querySelector('.row:last-child')||null);}return;}
 if(typeof modal!=='function')return;modal('<h2>📖 '+tx('Словарик','Glossary')+'</h2>'+listHtml(true)+'<div class="row"><button class="btn green" id="glOk">'+tx('Понятно','Got it')+'</button></div>');
 var b=document.getElementById('glOk');if(b)b.onclick=function(){hideModal();};}
/* ---------- нажатия ---------- */
document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('abbr.gl');
 if(a){if(inCtl(a))return;e.preventDefault();e.stopPropagation();var k=a.getAttribute('data-gl');if(openK===k)hide();else show(k);return;}
 if(pop&&openK&&!(e.target.closest&&e.target.closest('#glPop')))hide();},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&openK){hide();e.stopPropagation();}},true);
function start(){css();mark(document.body);try{new MutationObserver(onMut).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.GLOSS={T:T,show:show,hide:hide,listHtml:listHtml,openList:openList,mark:mark,isOpen:function(){return !!openK;}};
})();
