'use strict';
/* ================= МЕТА «trf»: трофеи глав — вторая валюта (SLAVA, 08.10.2026) =================
   План — hobby-analytics/release-i/oborona-boost/03-meta.md п. 4.1-Д; образец — bogatyr/js/meta-tro.js; журнал — release-i/oborona-boost/logs/SLAVA.md.
   Подключение: META_MODS.push({id:'trf',…}) (розетка META1: data.js META_HK/META_MODS). Грузится ДО meta-slava.js и meta-tour.js.
   Трофей — по виду на главу: id 'f'+номер главы (CH). Главы 0–7 — TRF_DEF; новая глава (CH, номера 8+) — поле главы trf:{n,en,sh,c1,c2}
   (sh — форма рисунка из TRF_SH), без поля — запасное имя «Трофей: <глава>» и мешочек.
   Падают ТОЛЬКО за дело: вожак 1, босс 2, победа +1 (+1 за 3★), осада — 1 за 5 волн (до 8), Босс недели — победа +3, испытание дня — победа +2; ×G.slK (режим).
   Тратятся: заказы жителей (→ Слава, ускорение, немного золота), коробейник (за золото — сток ветерана; обмен 3:1; ускорение за трофеи), дела недели (→ сундук).
   Бестиарий★: звёзды Книги нечисти (bookStars: 10/100/1000, боссы 1/5/20) → трофеи главы вида.
   Новичку (меньше 3 побед) ничего не показываем и не роняем. Math.random не трогаем (свой ГПСЧ).
   Сейв — только S.trf: {g:{id:получено всего}, s:{id:потрачено всего}, sd, ord:[заказ|null ×3], ot:[время пополнения ×3], oc:{житель:сдано}, on,
     pd:{s:окно 8 ч,r:обновлений,b:[куплено ×4]}, pad:{d,n}, wk:{w,c:{…},got}, bs:{вид:звёзд взято}, bp:{глава:1}, ts}
   Облако (trfMerge): g/s — максимум по каждому виду (остаток не теряется и не двоится); заказы/лавка — из более нового (ts); истории, звёзды, неделя — максимум. */
const TRF_ON=!/[?&]notrf/.test(location.search);
function trfErr(w,x){trfErr.n=(trfErr.n||0)+1;if(trfErr.n<=5)console.warn('meta trf.'+w+': '+(x&&x.message||x));}
function trfEv(k,p){try{STAT.ev('trf',Object.assign({a:k},p||{}));}catch(e){}}
function trfRng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

/* ---------- виды трофеев ---------- */
const TRF_DEF=[
  {n:'Перо Соловья',en:'Nightingale’s feather',sh:'feather'},
  {n:'Косточка Яги',en:'Baba Yaga’s bone',sh:'bone'},
  {n:'Чешуя Змея',en:'Zmey’s scale',sh:'scale'},
  {n:'Игла Кощея',en:'Koschei’s needle',sh:'needle'},
  {n:'Сосулька Карачуна',en:'Karachun’s icicle',sh:'ice'},
  {n:'Жемчуг Морского царя',en:'Sea Tsar’s pearl',sh:'pearl'},
  {n:'Уголёк Тугарина',en:'Tugarin’s ember',sh:'ember'},
  {n:'Глаз Лиха',en:'Likho’s eye',sh:'eye'}];
const TRF={drop:{lead:1,boss:2,win:1,st3:1,siegeW:5,endCap:8,wk:3,dch:2,chFirst:8,lairFirst:10},pdH:8,pdAd:3,ordWait:2*3600e3,
  bestR:[2,4,10],pageR:10,wkChest:{top:15,other:5,sl:50,bo:600},ordSl:20,ordBo:300};
// новые главы (CH, номера 8+): поле главы trf:{n,en,sh}; без него — узнаём тему по названию (Медной горы / Лукоморье / Вихрь), иначе мешочек
const TRF_GUESS=[[/Медн|Copper/i,{n:'Малахит',en:'Malachite',sh:'gem'}],[/Лукомор|Lukomor/i,{n:'Золотой жёлудь',en:'Golden acorn',sh:'acorn'}],[/Вихр|Whirl/i,{n:'Облачко',en:'Cloud puff',sh:'cloud'}]];
function trfDef(c){const ch=typeof CH!=='undefined'&&CH[c];let d=TRF_DEF[c]||ch&&ch.trf||null;if(!d&&ch){const nm=String(ch.name0||ch.name||'');for(const [re,x] of TRF_GUESS)if(re.test(nm)){d=x;break;}}return d;}
// порядок глав: CH_ORDER (движок глав CH), иначе по номеру
function trfOrder(){return typeof CH_ORDER!=='undefined'&&Array.isArray(CH_ORDER)?CH_ORDER.filter(c=>CH[c]):CH.map((_,i)=>i);}
// множитель режима: G.slK (может задать DIF/CH), иначе ⚔ Сложный ×1,3 / 🔥 Адский ×1,6 (G.dif из js/dif.js), старая «Богатырская» ×1,3
function metaK(G){return +G.slK||({s:1.3,h:1.6})[G.dif]||(G.diff===2?1.3:1);}
function trfId(c){return 'f'+(c|0);}
function trfCh(id){return +String(id).slice(1)|0;}
function trfName(id){const c=trfCh(id),d=trfDef(c);if(d)return Lg(d.n,d.en||d.n);const ch=typeof CH!=='undefined'&&CH[c];return ch?Lg('Трофей: '+ch.name,'Trophy: '+ch.name):id;}
function trfIc(id){const d=trfDef(trfCh(id)),k='trf_'+(d&&d.sh&&ART['trf_'+d.sh]?d.sh:'bag');return k;}
function trfImg(id,px){px=px||22;return '<img src="'+ic(trfIc(id),96)+'" width="'+px+'" height="'+px+'" style="vertical-align:middle" alt="">';}
// главы, которые игрок уже открыл (есть хоть одна звезда) — их трофеи «видны»
function trfOpenCh(){const a=[];if(typeof CH==='undefined')return [0];for(const c of trfOrder())if(chOpen(c)&&(c===0||S.stars[c+'-0']))a.push(c);return a.length?a:[0];}
function trfOpenIds(){return trfOpenCh().map(trfId);}
function trfTopId(){const a=trfOpenCh();return trfId(a[a.length-1]);}
// для наград Славы/Сказа: i-й по кругу из открытых
function TRF_PICK(i){const a=trfOpenIds();return a[((i|0)%a.length+a.length)%a.length];}

/* ---------- сейв ---------- */
function trfNew(){return {g:{},s:{},sd:(Date.now()%1e6)|0,ord:[null,null,null],ot:[0,0,0],oc:{},on:0,pd:{s:0,r:0,b:[0,0,0,0]},pad:{d:'',n:0},wk:{w:0,c:{},got:0},bs:{},bp:{},ts:0};}
function trfFixO(t){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),n=v=>typeof v==='number'&&isFinite(v)?v:0,nn=v=>Math.max(0,n(+v)|0);
  const d=trfNew();for(const k in d)if(!(k in t))t[k]=d[k];
  for(const k of['g','s','oc','bs','bp'])if(!ob(t[k]))t[k]={};
  for(const k of['g','s','oc','bs'])for(const i in t[k])t[k][i]=nn(t[k][i]);for(const i in t.bp)t.bp[i]=t.bp[i]?1:0;
  t.sd=nn(t.sd);t.on=nn(t.on);t.ts=n(t.ts);
  if(!Array.isArray(t.ord))t.ord=[];t.ord=[0,1,2].map(i=>{const o=t.ord[i];if(!ob(o)||!TRF_RES[o.r]||!ob(o.tr))return null;const tr={};for(const id in o.tr)if(/^f\d+$/.test(id)&&nn(o.tr[id]))tr[id]=nn(o.tr[id]);
    return Object.keys(tr).length?{r:o.r,tr:tr,g:nn(o.g)}:null;});
  if(!Array.isArray(t.ot))t.ot=[];t.ot=[0,1,2].map(i=>n(t.ot[i]));
  if(!ob(t.pd))t.pd=d.pd;t.pd.s=nn(t.pd.s);t.pd.r=nn(t.pd.r);if(!Array.isArray(t.pd.b))t.pd.b=[];t.pd.b=[0,1,2,3].map(i=>nn(t.pd.b[i]));
  if(!ob(t.pad))t.pad={d:'',n:0};if(typeof t.pad.d!=='string')t.pad.d='';t.pad.n=Math.min(TRF.pdAd,nn(t.pad.n));
  if(!ob(t.wk))t.wk={w:0,c:{},got:0};t.wk.w=nn(t.wk.w);t.wk.got=t.wk.got?1:0;if(!ob(t.wk.c))t.wk.c={};for(const k in t.wk.c)t.wk.c[k]=nn(t.wk.c[k]);
  return t;}
function TRF_FIX(s){try{s=s||S;const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(s.trf!=null&&!ob(s.trf))s.trf=null;
  if(!s.trf){if(!TRF_ON)return;s.trf={};}s.trf=trfFixO(s.trf);}catch(e){trfErr('fix',e);}}
// облако: остаток — g/s максимум по видам; основа (заказы, лавка) — более новая копия; постоянное — максимум
function TRF_MERGE(d,o){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),b=ob(d)&&ob(d.trf)?d.trf:null;if(!b)return;const a=ob(o.trf)?o.trf:null;
  if(!a){o.trf=trfFixO(JSON.parse(JSON.stringify(b)));return;}
  const bN=(+b.ts||0)>(+a.ts||0),nw=JSON.parse(JSON.stringify(bN?b:a)),ol=bN?a:b;
  for(const k of['g','s','oc','bs','bp']){nw[k]=ob(nw[k])?nw[k]:{};const x=ob(ol[k])?ol[k]:{};for(const i in x)nw[k][i]=Math.max(+nw[k][i]||0,+x[i]||0);}
  nw.on=Math.max(+nw.on||0,+ol.on||0);
  if(ob(nw.wk)&&ob(ol.wk)&&nw.wk.w===ol.wk.w){nw.wk.got=Math.max(+nw.wk.got||0,+ol.wk.got||0);const c=ob(nw.wk.c)?nw.wk.c:(nw.wk.c={}),x=ob(ol.wk.c)?ol.wk.c:{};for(const i in x)c[i]=Math.max(+c[i]||0,+x[i]||0);}
  else if(ob(ol.wk)&&(+ol.wk.w||0)>(+(nw.wk&&nw.wk.w)||0))nw.wk=JSON.parse(JSON.stringify(ol.wk));
  o.trf=trfFixO(nw);}catch(e){trfErr('merge',e);}}
function TR(){return TRF_ON&&S.trf||null;}
function trTouch(){const t=TR();if(t)t.ts=Date.now();}
function trfVis(){return !!TR()&&(S.wins|0)>=3;}  // новичку — ничего
function TRF_N(id){const t=TR();if(!t)return 0;return Math.max(0,(t.g[id]|0)-(t.s[id]|0));}
function TRF_ADD(id,n){const t=TR();n=Math.round(+n||0);if(!t||n<=0||!/^f\d+$/.test(id))return;t.g[id]=(t.g[id]|0)+n;const w=trfWk(t);w.c.t=(w.c.t||0)+n;trTouch();}
function TRF_SPEND(o){const t=TR();if(!t)return false;for(const id in o)if(TRF_N(id)<(o[id]|0))return false;for(const id in o)t.s[id]=(t.s[id]|0)+(o[id]|0);trTouch();return true;} // всё или ничего
function TRF_BACK(o){const t=TR();if(!t)return;for(const id in o)t.s[id]=Math.max(0,(t.s[id]|0)-(o[id]|0));}
function trfTotal(){let n=0;for(const id of trfOpenIds())n+=TRF_N(id);return n;}

/* ---------- жители: заказы и их истории (5 строк на каждого) ---------- */
const TRF_RES={
  yaga:{ic:'tetka',get n(){return Lg('Тётушка Яга','Auntie Yaga');},st:[
    ['Ох, уважил старую! Из этого добра такое зелье сварю — нечисть чихать будет.','Oh, you’ve pleased an old woman! I’ll brew such a potion the monsters will sneeze.'],
    ['Изба моя на курьих ножках аж приплясывает — довольна!','My hut on chicken legs is practically dancing — it’s happy!'],
    ['В молодости я сама Кощея метлой гоняла. Ну, почти.','When I was young, I chased Koschei with my broom. Well, almost.'],
    ['Пироги в печи — твоя доля всегда на краю стола.','There are pies in the oven — your share is always at the edge of the table.'],
    ['Вся округа знает: у тебя самая крепкая застава.','Everyone around knows: yours is the strongest outpost.']]},
  potap:{ic:'voevoda',get n(){return Lg('Воевода Потап','Commander Potap');},st:[
    ['Добрый трофей! Повешу в гриднице — пусть молодые смотрят и учатся.','A fine trophy! I’ll hang it in the hall — let the young ones look and learn.'],
    ['Ратники теперь спят спокойнее. А я — нет: ты меня скоро обгонишь.','The warriors sleep easier now. Not me — you’ll soon outrank me.'],
    ['Помню, как ты первый частокол ставил. Кривой был! Ну да ладно.','I remember your first palisade. It was crooked! Oh well.'],
    ['Соседние воеводы спрашивают, где ты такие трофеи добываешь.','The neighbouring commanders ask where you find such trophies.'],
    ['Быть тебе богатырём, помяни моё слово.','You’ll be a bogatyr one day, mark my words.']]},
  kuz:{ic:'hp_mik',get n(){return Lg('Кузнец Микула','Mikula the Smith');},st:[
    ['Из этого выкую подкову на счастье — над воротами повешу.','I’ll forge a lucky horseshoe from this — it goes over the gate.'],
    ['Молот мой звенит веселее, когда ты в бою.','My hammer rings merrier while you’re in battle.'],
    ['Подмастерье хочет в пушкари. Я сказал: сперва гвозди ковать научись!','My apprentice wants to be a cannoneer. I said: learn to forge nails first!'],
    ['Говорят, в Медной горе мастера лучше меня. Не верю!','They say the Copper Mountain masters are better than me. I don’t believe it!'],
    ['Твои заставы я узнаю из тысячи — по звону.','I’d know your outposts among a thousand — by their ring.']]},
  alena:{ic:'hp_vas',get n(){return Lg('Алёнушка-рукодельница','Alyonushka the Needlewoman');},st:[
    ['Из жемчуга и чешуи вышью кокошник — краше не сыщешь!','I’ll embroider a kokoshnik with pearls and scales — none prettier!'],
    ['Узор на рушнике — про твои бои. Вот ты, а вот Змей.','The towel pattern tells of your battles. Here’s you, and here’s Zmey.'],
    ['Подружки завидуют: у меня нитки из пера Жар-птицы. Шучу!','My friends are jealous: my thread is Firebird down. Just kidding!'],
    ['Сошью тебе рубаху с оберегом — чтобы домой возвращался.','I’ll sew you a shirt with a charm — so you always come home.'],
    ['Вся деревня теперь нарядная. Это всё ты!','The whole village is festive now. It’s all thanks to you!']]},
  vanya:{ic:'hp_iva',get n(){return Lg('Пастушок Ванятка','Vanyatka the Shepherd');},st:[
    ['Ура! Волки больше коров не пугают!','Hooray! The wolves don’t scare the cows anymore!'],
    ['Я на дудочке песню про тебя сочинил. Послушаешь?','I made up a song about you on my pipe. Want to hear it?'],
    ['Когда вырасту, тоже буду заставу держать. Возьмёшь?','When I grow up, I’ll hold an outpost too. Will you take me?'],
    ['Бурёнка дала столько молока, что хватило на весь двор!','Burenka gave so much milk the whole yard got some!'],
    ['Я теперь не боюсь темноты — ты же рядом.','I’m not afraid of the dark anymore — you’re near.']]}};
const TRF_RK=Object.keys(TRF_RES);
TRF_FIX(S); // первая загрузка: META_HK('FIX') при чтении сохранения ещё не знал модуля — чиним сами (после TRF_RES)
function trfOrdGold(o){let n=0;for(const id in o.tr)n+=o.tr[id];return Math.round((20+8*Math.min(8,chaptersDone()))*n/50)*10;}
function trfMkOrd(t,slot){const R=trfRng((t.sd++)*7919+slot*31+1),open=trfOpenIds(),top=trfTopId();
  const busy={};t.ord.forEach(o=>{if(o)busy[o.r]=1;});const fr=TRF_RK.filter(k=>!busy[k]),r=fr[Math.floor(R()*fr.length)]||TRF_RK[0];
  const n=5+Math.min(5,chaptersDone()),tr={},a=R()<.5?top:open[Math.floor(R()*open.length)];
  if(open.length>1&&R()<.6){const others=open.filter(x=>x!==a),b=others[Math.floor(R()*others.length)],na=Math.ceil(n*.6);tr[a]=na;tr[b]=n-na;}else tr[a]=n;
  const o={r:r,tr:tr,g:0};o.g=trfOrdGold(o);return o;}
function trfOrdFill(t){const now=nowMs();let ch=0;for(let i=0;i<3;i++)if(!t.ord[i]&&now>=t.ot[i]){t.ord[i]=trfMkOrd(t,i);ch=1;}if(ch){trTouch();save();}}
function trfCan(o){for(const id in o.tr)if(TRF_N(id)<o.tr[id])return false;return true;}
function trfOrdReady(t){return t.ord.some(o=>o&&trfCan(o));}
function trfResLine(r){const R=TRF_RES[r],k=TR().oc[r]||0;if(k>=R.st.length)return Lg('Спасибо тебе, воевода! Заходи ещё.','Thank you, commander! Come again.');const s=R.st[k];return Lg(s[0],s[1]);}
function trfOrdDo(i){const t=TR();if(!t)return;const o=t.ord[i];if(!o||!trfCan(o)||!TRF_SPEND(o.tr))return;
  const line=trfResLine(o.r);S.gold+=o.g;ern('quest',o.g);boostAdd(TRF.ordBo);t.oc[o.r]=(t.oc[o.r]||0)+1;t.on++;const w=trfWk(t);w.c.o=(w.c.o||0)+1;
  let sl=0;if(typeof SLAVA_ADD==='function')sl=SLAVA_ADD(TRF.ordSl,'ord');
  t.ord[i]=null;t.ot[i]=nowMs()+TRF.ordWait;trTouch();save();SND.up();setPills();trfEv('ord',{r:o.r,g:o.g,n:t.on});
  showModal('<h3>'+TRF_RES[o.r].n+'</h3><div class="say"><img src="'+ic(TRF_RES[o.r].ic)+'" alt=""><div>«'+line+'»</div></div>'+
    '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(o.g)+' · ⏩ +'+fmtBoost(TRF.ordBo)+(sl?' · ⭐ +'+sl:'')+'</b></div>'+
    '<div class="btns"><button class="btn big" id="trOk">'+Lg('Пожалуйста!','You’re welcome!')+'</button></div>','trf');
  on('trOk',()=>trfHub('ord'));}
function trfOrdSkip(i){const t=TR();if(!t||!t.ord[i])return;t.ord[i]=null;t.ot[i]=nowMs()+TRF.ordWait;trTouch();save();trfEv('skip',{});}

/* ---------- коробейник: товар раз в 8 ч; золото → трофеи (сток ветерана), обмен 3:1, трофеи → ускорение ---------- */
function trfPdSlot(){return Math.floor(nowMs()/(TRF.pdH*3600e3));}
function trfPdLeft(){return (trfPdSlot()+1)*TRF.pdH*3600e3-nowMs();}
function trfPd(t){const s=trfPdSlot();if(t.pd.s!==s){t.pd={s:s,r:0,b:[0,0,0,0]};trTouch();}return t.pd;}
function trfPdGoods(t){const pd=trfPd(t),R=trfRng(pd.s*131+pd.r*17+t.sd%977*3),open=trfOpenIds(),r10=x=>Math.round(x/10)*10,cd=Math.min(8,chaptersDone());
  const need={};t.ord.forEach(o=>{if(o)for(const id in o.tr){const m=o.tr[id]-TRF_N(id);if(m>0)need[id]=(need[id]||0)+m;}});
  const nk=Object.keys(need).sort((a,b)=>need[b]-need[a]),pk=()=>open[Math.floor(R()*open.length)];
  const A=nk[0]||pk();let B=nk[1]||pk();if(B===A&&open.length>1)B=open.filter(x=>x!==A)[Math.floor(R()*(open.length-1))];
  const P=r10(150+90*cd),G=[{k:'pack',id:A,n:5,c:P,m:2},{k:'pack',id:B,n:5,c:P,m:1}];
  let rich='',rn=-1;for(const id of open){const v=TRF_N(id);if(v>rn&&id!==A){rn=v;rich=id;}}
  if(open.length>1&&rich)G.push({k:'ex',from:rich,to:A,n:3,m:5});else G.push({k:'pack',id:B,n:3,c:r10(P*.65),m:1});
  G.push({k:'boost',id:rich||A,n:8,bo:900,m:1});return G;}
function trfPdBuy(i){const t=TR();if(!t)return;const g=trfPdGoods(t)[i],pd=t.pd;if(!g||pd.b[i]>=g.m)return;
  if(g.k==='ex'){if(!TRF_SPEND({[g.from]:g.n}))return;TRF_ADD(g.to,1);}
  else if(g.k==='boost'){if(!TRF_SPEND({[g.id]:g.n}))return;boostAdd(g.bo);}
  else{if(S.gold<g.c)return;S.gold-=g.c;STAT.ev('spend',{k:'trf:'+g.k,c:g.c});TRF_ADD(g.id,g.n);}
  pd.b[i]++;trTouch();save();SND.coin();setPills();trfEv('shop',{k:g.k,c:g.c||0});}
function trfPadLeft(t){return t.pad.d===dayKey()?Math.max(0,TRF.pdAd-t.pad.n):TRF.pdAd;}
function trfPdNew(){const t=TR();if(!t||!trfPadLeft(t))return false;const pd=trfPd(t);pd.r++;pd.b=[0,0,0,0];t.pad={d:dayKey(),n:(t.pad.d===dayKey()?t.pad.n:0)+1};trTouch();save();trfEv('pd_ad',{});return true;}

/* ---------- дела недели: 5 из списка (одинаково у всех по номеру недели) → сундук недели ---------- */
const TRF_WK={
  k:{n:1500,ic:'wolf',get t(){return Lg('Одолей нечисти','Defeat monsters');}},
  b:{n:4,ic:'skull',get t(){return Lg('Победи боссов','Defeat bosses');}},
  t:{n:30,ic:'trf_bag',get t(){return Lg('Добудь трофеев','Collect trophies');}},
  o:{n:3,ic:'tetka',get t(){return Lg('Выполни заказы жителей','Fill villagers’ orders');}},
  r:{n:12,ic:'swords',get t(){return Lg('Проведи бои','Fight battles');}},
  w:{n:8,ic:'star',get t(){return Lg('Одержи побед','Win battles');}},
  s:{n:40,ic:'b_siege',get t(){return Lg('Отбей волн в осаде','Hold siege waves');},on:()=>!!S.stars['0-5']},
  d:{n:3,ic:'b_map',get t(){return Lg('Пройди испытание дня','Play the daily challenge');},on:()=>!!S.stars['0-5']}};
function trfWk(t){const w=weekNo();if(t.wk.w!==w)t.wk={w:w,c:{},got:0};return t.wk;}
function trfWkList(t){const w=trfWk(t),R=trfRng(w.w*977+13),ks=Object.keys(TRF_WK).filter(k=>!TRF_WK[k].on||TRF_WK[k].on());
  for(let i=ks.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[ks[i],ks[j]]=[ks[j],ks[i]];}return ks.slice(0,5);}
function trfWkDone(t){const w=trfWk(t);return trfWkList(t).filter(k=>(w.c[k]||0)>=TRF_WK[k].n).length;}
function trfWkReady(t){return !trfWk(t).got&&trfWkDone(t)>=5;}
function trfWkOpen(){const t=TR();if(!t||!trfWkReady(t))return;const w=trfWk(t),open=trfOpenIds(),top=trfTopId(),R=trfRng(w.w*31+7),got={};
  got[top]=TRF.wkChest.top;const oth=open.filter(x=>x!==top);for(let i=0;i<2&&oth.length;i++){const id=oth.splice(Math.floor(R()*oth.length),1)[0];got[id]=(got[id]||0)+TRF.wkChest.other;}
  if(open.length===1)got[top]+=TRF.wkChest.other;
  w.got=1;for(const id in got)TRF_ADD(id,got[id]);boostAdd(TRF.wkChest.bo);let sl=0;if(typeof SLAVA_ADD==='function')sl=SLAVA_ADD(TRF.wkChest.sl,'wkchest');
  trTouch();save();SND.up();trfEv('wk',{w:w.w});
  showModal('<h3>'+Lg('Сундук недели','Chest of the Week')+'</h3><div style="text-align:center"><img src="'+ic('chest',160)+'" width="96" height="96" alt=""></div>'+
    '<div class="card"><div style="display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;font-size:17px">'+Object.keys(got).map(id=>'<span>'+trfImg(id,28)+' +'+got[id]+'</span>').join('')+
    '<span>⏩ +'+fmtBoost(TRF.wkChest.bo)+'</span>'+(sl?'<span>⭐ +'+sl+'</span>':'')+'</div></div>'+
    '<div class="btns"><button class="btn big" id="trOk">'+Lg('Забрать','Collect')+'</button></div>','trf');on('trOk',()=>trfHub('wk'));}

/* ---------- Бестиарий★: звёзды Книги нечисти → трофеи главы вида ---------- */
let trfSpC=null;
function trfSpecies(){if(trfSpC&&trfSpC.n===CH.length)return trfSpC;const of={},by={};
  for(const c of trfOrder()){const ids=[].concat(CH[c].en||[],[CH[c].boss]);for(const id of ids)if(id&&EN[id]&&of[id]==null){of[id]=c;(by[c]=by[c]||[]).push(id);}}
  return trfSpC={n:CH.length,of:of,by:by};}
function trfStars(id){try{return typeof bookStars==='function'?bookStars(id):0;}catch(e){return 0;}}
function trfBestN(t){const sp=trfSpecies();let n=0;for(const id in sp.of)if(trfStars(id)>(t.bs[id]||0))n++;
  for(const c in sp.by)if(!t.bp[c]&&sp.by[c].every(id=>trfStars(id)>=1))n++;return n;}
function trfBestClaim(t){const sp=trfSpecies(),got={};let n=0;
  for(const id in sp.of){const k=trfStars(id),h=t.bs[id]||0;if(k>h){let r=0;for(let i=h;i<k;i++)r+=TRF.bestR[i]||0;const tr=trfId(sp.of[id]);got[tr]=(got[tr]||0)+r;n+=r;t.bs[id]=k;}}
  for(const c in sp.by){if(t.bp[c])continue;if(sp.by[c].every(id=>trfStars(id)>=1)){t.bp[c]=1;const tr=trfId(+c);got[tr]=(got[tr]||0)+TRF.pageR;n+=TRF.pageR;}}
  if(!n)return null;for(const id in got)TRF_ADD(id,got[id]);trTouch();save();trfEv('best',{n:n});return got;}

/* ---------- выпадение в бою (RUN/KILL/END) ---------- */
function trfRUN(G){try{if(!G)return;G.trfId='';G.trfK=0;if(!TR()||!trfVis())return;
  G.trfId=G.endless&&!G.wk?trfTopId():trfId(G.ci);G.trfNew=!G.endless&&!G.rule&&!S.stars[G.ci+'-'+G.li];}catch(e){trfErr('run',e);}}
function trfWkGot(){const W=S.wk;return !!(G&&G.wk&&W&&W.w===G.wk.w&&W.got);}   // OB:ECO Босс недели уже побеждён на этой неделе
function trfKILL(e){try{if(!e||!G||!G.trfId)return;const t=TR();if(!t)return;const c=trfWk(t).c;c.k=(c.k||0)+1;
  let n=0;if(e.boss){if(G.wk&&trfWkGot())return;n=TRF.drop.boss;c.b=(c.b||0)+1;}else if(e.lead)n=TRF.drop.lead;
  if(!n||G.endless&&!G.wk)return;G.trfK+=n;try{addNum(e.x,e.y-(e.r||12)*1.6,'+'+n+' '+trfName(G.trfId),'#ffd98a');}catch(x){}}catch(x){trfErr('kill',x);}}
function trfEND(G,win){try{const t=TR();if(!t||!G||!G.trfId)return;
  const P=G.trfP||(G.trfP={n:0,runs:0}),c=trfWk(t).c;   // бой может кончиться дважды («ещё попытка») — платим только прирост
  if(!P.runs){c.r=(c.r||0)+1;P.runs=1;}
  let n=G.trfK;
  if(G.wk){if(trfWkGot())n=0;else if(G.wkKill)n+=TRF.drop.wk;}   // OB:ECO повтор недели — без трофеев (END зовётся до weekEnd, W.got ещё прошлый)
  else if(G.endless){const w=Math.max(0,G.wave-1);n=Math.min(TRF.drop.endCap,Math.floor(w/TRF.drop.siegeW));c.s=Math.max(c.s||0,0)+Math.max(0,w-(P.w||0));P.w=w;}
  else if(win){n+=TRF.drop[G.rule?'dch':'win'];if(!G.rule&&typeof starsFor==='function'&&starsFor()===3)n+=TRF.drop.st3;
    if(!G.rule&&G.trfNew){if(G.li===5)n+=TRF.drop.chFirst;else if(G.li===6)n+=TRF.drop.lairFirst;}}   // глава освобождена впервые / первое Логово (CH: уровень 7, индекс 6)
  if(G.li===6&&!G.endless&&!G.rule)n*=2;   // Логово — вдвое
  if(win&&!G.endless&&!P.won){c.w=(c.w||0)+1;P.won=1;}
  if(G.rule&&!P.d){c.d=(c.d||0)+1;P.d=1;}
  n=Math.round(n*metaK(G)*(+G.trfMul||1));const add=n-P.n;
  if(add>0){TRF_ADD(G.trfId,add);P.n=n;trfEv('drop',{k:G.trfId,n:add});
    G.trfHtml='<span class="mline" title="'+trfName(G.trfId)+'">'+trfImg(G.trfId,22)+' <b>+'+n+'</b>'+(trfOrdReady(t)?Lg(' · заказ готов!',' · order ready!'):'')+'</span>';}
  trTouch();}catch(e){trfErr('end',e);}}

/* ---------- окно «Торжок»: заказы · лавка · неделя · трофеи ---------- */
let trfSeg='ord',trfT=0;
function trfFmt(ms){return fmtBoost(Math.max(60,ms/1000));}
function trfNeedHTML(o){let h='';for(const id in o.tr){const have=TRF_N(id),ok=have>=o.tr[id];h+='<span style="white-space:nowrap;'+(ok?'':'opacity:.75')+'">'+trfImg(id,24)+' '+Math.min(have,o.tr[id])+'/'+o.tr[id]+(ok?' ✓':'')+'</span> ';}
  return '<div style="display:flex;flex-wrap:wrap;gap:4px 10px;font-size:16px;margin-top:4px">'+h+'</div>';}
function trfHubHTML(t){const segs=[['ord',Lg('📜 Заказы','📜 Orders'),trfOrdReady(t)],['pd',Lg('🧺 Лавка','🧺 Peddler'),0],['wk',Lg('🗓 Неделя','🗓 Week'),trfWkReady(t)],['tr',Lg('🏺 Трофеи','🏺 Trophies'),trfBestN(t)>0]];
  let h='<h3>'+Lg('Торжок у колодца','Well-side Market')+'</h3><div class="seg">'+segs.map(s=>'<button class="'+(trfSeg===s[0]?'on':'')+'" data-ts="'+s[0]+'">'+s[1]+(s[2]?' <b style="color:#e0452a">●</b>':'')+'</button>').join('')+'</div>';
  if(trfSeg==='ord'){h+='<p class="sub">'+Lg('Жители просят трофеи с нечисти. За заказ — Слава, ускорение, немного золота и история жителя.','Villagers ask for monster trophies. Each order gives Fame, speed-up, a little gold and a villager’s story.')+'</p>';
    t.ord.forEach((o,i)=>{if(!o){h+='<div class="card"><div class="row"><img class="ic" src="'+ic('trf_board',96)+'" style="opacity:.55" alt=""><div class="t"><b>'+Lg('Новый заказ','New order')+'</b><span data-tl="o'+i+'">'+Lg('появится через ','arrives in ')+trfFmt(t.ot[i]-nowMs())+'</span></div></div></div>';return;}
      const R=TRF_RES[o.r],ok=trfCan(o),k=t.oc[o.r]||0;
      h+='<div class="card'+(ok?' next':'')+'"><div class="row"><img class="ic" src="'+ic(R.ic)+'" alt=""><div class="t"><b>'+R.n+'</b><span>'+Lg('История: ','Story: ')+Math.min(k,5)+'/5 · +'+fmtGold(o.g)+' · ⭐ +'+TRF.ordSl+'</span>'+trfNeedHTML(o)+'</div></div>'+
        '<div class="btns h"><button class="btn '+(ok?'gold':'ghost')+'" data-to="'+i+'" '+(ok?'':'disabled')+'>'+Lg('Отдать','Hand over')+'</button><button class="btn ghost" data-tk="'+i+'">'+Lg('Другой','Skip')+'</button></div></div>';});
    h+='<p class="sub">'+Lg('Трофеи падают с вожаков и боссов, за победы, в осаде, в испытании дня и с Босса недели — по главе, где идёт бой.','Trophies drop from leaders and bosses, for victories, in the siege, the daily challenge and the Boss of the Week — from the chapter you fight in.')+'</p>';}
  else if(trfSeg==='pd'){const G0=trfPdGoods(t),pd=t.pd,al=trfPadLeft(t);
    h+='<div class="say"><img src="'+ic('trf_ped')+'" alt=""><div><b class="who">'+Lg('Коробейник','The Peddler')+'</b>'+Lg('«Товар свежий! Новый привезу через ','“Fresh goods! New ones in ')+'<i data-tl="pd" style="font-style:normal">'+trfFmt(trfPdLeft())+'</i>'+Lg('.»','.”')+'</div></div>';
    G0.forEach((g,i)=>{const left=g.m-pd.b[i];let ico,name,sub;
      if(g.k==='pack'){ico=trfIc(g.id);name=trfName(g.id)+' ×'+g.n;sub=Lg('у тебя: ','you have: ')+TRF_N(g.id);}
      else if(g.k==='ex'){ico=trfIc(g.to);name=Lg('Обмен: ','Swap: ')+g.n+'× '+trfName(g.from)+' → 1× '+trfName(g.to);sub=Lg('у тебя: ','you have: ')+TRF_N(g.from)+' · '+Lg('ещё раз: ','times left: ')+left;}
      else{ico='trf_hour';name=Lg('Песочные часы: ⏩ +','Hourglass: ⏩ +')+fmtBoost(g.bo);sub=Lg('за ','for ')+g.n+'× '+trfName(g.id)+' · '+Lg('у тебя: ','you have: ')+TRF_N(g.id);}
      const can=left>0&&(g.k==='pack'?S.gold>=g.c:TRF_N(g.k==='ex'?g.from:g.id)>=g.n);
      const btn=left<=0?'<span class="tag ok">✓</span>':'<button class="btn '+(can?'gold':'ghost')+'" data-tb="'+i+'" '+(can?'':'disabled')+'>'+(g.k==='pack'?'<img src="'+ic('ingot',40)+'" alt="">'+fmtNum(g.c):g.k==='ex'?Lg('Обменять','Swap'):Lg('Взять','Take'))+'</button>';
      h+='<div class="card"><div class="row"><img class="ic" src="'+ic(ico)+'" alt=""><div class="t"><b>'+name+'</b><span>'+sub+'</span></div>'+btn+'</div></div>';});
    if(al>0&&adOk())h+='<div class="btns"><button class="btn ad" id="trPdAd">'+Lg('🎬 Новый товар за рекламу','🎬 New goods for an ad')+' · '+al+'/'+TRF.pdAd+'</button></div>';}
  else if(trfSeg==='wk'){const w=trfWk(t),ks=trfWkList(t),dn=trfWkDone(t);
    h+='<p class="sub">'+Lg('Пять больших дел на неделю. Сделаешь все — сундук недели: трофеи, ускорение и Слава.','Five big deeds for the week. Do them all for the Chest of the Week: trophies, speed-up and Fame.')+'</p>';
    for(const k of ks){const D=TRF_WK[k],v=Math.min(w.c[k]||0,D.n),ok=v>=D.n;
      h+='<div class="card" style="'+(ok?'opacity:.7':'')+'"><div class="row"><img class="ic" src="'+ic(D.ic)+'" alt=""><div class="t"><b>'+(ok?'✓ ':'')+D.t+'</b><div class="bar"><i style="width:'+Math.round(v/D.n*100)+'%"></i></div><span>'+fmtNum(v)+' / '+fmtNum(D.n)+'</span></div></div></div>';}
    h+='<div class="card'+(trfWkReady(t)?' next':'')+'"><div class="row"><img class="ic" src="'+ic('chest')+'"'+(w.got?' style="opacity:.5"':'')+' alt=""><div class="t"><b>'+Lg('Сундук недели','Chest of the Week')+'</b><span>'+(w.got?Lg('Получен — новые дела в понедельник','Collected — new deeds on Monday'):dn+' / 5')+'</span></div>'+
      (trfWkReady(t)?'<button class="btn gold" id="trWk">'+Lg('Открыть','Open')+'</button>':'')+'</div></div>';}
  else{const open=trfOpenCh(),bn=trfBestN(t);
    h+='<p class="sub">'+Lg('По трофею на каждую главу.','One kind of trophy for each chapter.')+'</p><div class="bgrid">';
    for(const c of trfOrder()){const id=trfId(c),ok=open.indexOf(c)>=0||TRF_N(id)>0;
      h+='<div class="bcell'+(ok?'':' lock')+'"><img src="'+ic(trfIc(id),120)+'" alt=""'+(ok?'':' style="filter:brightness(0) opacity(.35)"')+'><b>'+(ok?trfName(id):'???')+'</b><small>'+(ok?fmtNum(TRF_N(id)):CH[c].name)+'</small></div>';}
    h+='</div><h2>'+Lg('📖 Бестиарий★','📖 Bestiary★')+'</h2><p class="sub">'+Lg('Звёзды Книги нечисти (10 / 100 / 1000 одолённых, боссы — 1 / 5 / 20) и полная страница главы дают трофеи.','Stars in the Book of Monsters (defeat 10 / 100 / 1000, bosses 1 / 5 / 20) and a full chapter page give trophies.')+'</p>';
    h+=bn?'<div class="btns"><button class="btn gold big" id="trBc">'+Lg('🏺 Забрать награды бестиария: ','🏺 Collect bestiary rewards: ')+bn+'</button></div>':'<p class="sub" style="text-align:center">'+Lg('Новых звёзд пока нет — одолевай нечисть!','No new stars yet — keep defeating monsters!')+'</p>';}
  h+='<div class="btns"><button class="btn big" id="trBack">'+Lg('Назад','Back')+'</button></div>';return h;}
function trfHub(seg){const t=TR();if(!t||!trfVis())return;if(seg)trfSeg=seg;trfOrdFill(t);trfPd(t);STAT.screen('trf_'+trfSeg);
  const keep=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='trf'&&!seg?$('mBody').scrollTop:0;
  showModal(trfHubHTML(t),'trf');if(keep)$('mBody').scrollTop=keep;const re=()=>trfHub(),B=$('mBody');
  on('trBack',trfClose);on('trWk',trfWkOpen);
  on('trBc',()=>{const g=trfBestClaim(t);if(g){SND.up();toast(Lg('Бестиарий: ','Bestiary: ')+Object.keys(g).map(id=>'+'+g[id]+' '+trfName(id)).join(', '));}re();});
  for(const b of B.querySelectorAll('[data-ts]'))b.onclick=()=>{SND.click();trfSeg=b.dataset.ts;trfHub();$('mBody').scrollTop=0;};
  for(const b of B.querySelectorAll('[data-to]'))b.onclick=()=>{SND.click();trfOrdDo(+b.dataset.to);};
  for(const b of B.querySelectorAll('[data-tk]'))b.onclick=()=>{SND.click();trfOrdSkip(+b.dataset.tk);re();};
  for(const b of B.querySelectorAll('[data-tb]'))b.onclick=()=>{SND.click();trfPdBuy(+b.dataset.tb);re();};
  adOn('trPdAd','peddler',()=>showRewarded(()=>{if(trfPdNew())SND.up();if($('trBack'))re();},null,
    ()=>{if(!trfPdNew())return '';if($('trBack'))re();return Lg('коробейник привёз новый товар','the peddler brought new goods');}));
  clearInterval(trfT);trfT=setInterval(trfTick,1000);}
function trfClose(){clearInterval(trfT);trfT=0;hideModal();metaRe();}
function trfTick(){const t=TR();if(!t||!$('modal').classList.contains('on')||$('mBody').getAttribute('data-w')!=='trf'||!$('trBack')){clearInterval(trfT);trfT=0;return;}
  const now=nowMs();let flip=false;for(let i=0;i<3;i++){const el=$('mBody').querySelector('[data-tl="o'+i+'"]');if(!el)continue;const l=t.ot[i]-now;if(l<=0)flip=true;else el.textContent=Lg('появится через ','arrives in ')+trfFmt(l);}
  const pe=$('mBody').querySelector('[data-tl="pd"]');if(pe){if(t.pd.s!==trfPdSlot())flip=true;else pe.textContent=trfFmt(trfPdLeft());}
  if(flip)trfHub();}
// после закрытия окна меты — перерисовать вкладку, откуда открыли
function metaRe(){try{if(typeof G!=='undefined'&&G)return;if(curTab==='Village')renderVillage();else if(curTab==='Map')renderMap();else if(curTab==='Siege')renderSiege();setPills();}catch(e){}}

/* ---------- карточка в деревне, «Сегодня» ---------- */
function trfStatus(t){const a=[],r=t.ord.filter(o=>o&&trfCan(o)).length;if(r)a.push(Lg('заказ готов: ','orders ready: ')+r);
  if(trfWkReady(t))a.push(Lg('сундук недели!','chest of the week!'));const bn=trfBestN(t);if(bn)a.push(Lg('бестиарий: ','bestiary: ')+bn);
  if(!a.length){a.push(Lg('трофеев: ','trophies: ')+trfTotal());a.push(Lg('дела недели ','weekly deeds ')+trfWkDone(t)+'/5');}return a.join(' · ');}
function trfReady(t){return trfOrdReady(t)||trfWkReady(t)||trfBestN(t)>0;}
function trfGoSeg(t){return trfOrdReady(t)?'ord':trfWkReady(t)?'wk':trfBestN(t)?'tr':null;}
function trfVIL(el){try{const t=TR();if(!t||!el||!trfVis())return;trfOrdFill(t);
  const d=document.createElement('div');d.className='card'+(trfReady(t)?' next':'');d.id='trfCard';
  d.innerHTML='<div class="row"><img class="ic" src="'+ic('trf_board')+'" alt=""><div class="t"><b>'+Lg('📜 Торжок у колодца','📜 Well-side Market')+'</b><span>'+trfStatus(t)+'</span></div><button class="btn gold" id="trfGo">'+Lg('Открыть','Open')+'</button></div>';
  const at=el.querySelector('#bnBox');if(at)el.insertBefore(d,at);else el.appendChild(d);   // после построек, перед знамёнами
  on('trfGo',()=>trfHub(trfGoSeg(t)));}catch(e){trfErr('vil',e);}}
// «Сегодня» на карте: чип, только когда есть что забрать
function trfTODAY(a){try{const t=TR();if(!t||!trfVis())return;trfOrdFill(t);if(!trfReady(t))return;
  a.push({id:'trf',hot:1,t:Lg('📜 Торжок','📜 Market'),fn:()=>trfHub(trfGoSeg(t))});}catch(e){trfErr('today',e);}}

// сундук дня (meta-ret.js META1, крючок CHEST: o={gold,streak,txt:[]}) — ещё трофеи главы: 2 + серия (до +3)
function trfCHEST(o){try{if(!TR()||!trfVis()||!o)return;const id=trfTopId(),n=2+Math.min(3,(o.streak|0));TRF_ADD(id,n);if(Array.isArray(o.txt))o.txt.push(trfImg(id,20)+' +'+n+' '+trfName(id));}catch(e){trfErr('chest',e);}}
if(typeof META_MODS!=='undefined')META_MODS.push({id:'trf',FIX:TRF_FIX,MERGE:TRF_MERGE,RUN:trfRUN,KILL:trfKILL,END:trfEND,VIL:trfVIL,TODAY:trfTODAY,CHEST:trfCHEST});

/* ---------- рисунки (стиль art.js; ключи trf_*) ---------- */
art('trf_feather',40,g=>{g.save();g.rotate(-.6);shp(g,'#5a4a7a',{hl:.5},[-6,-18,6,18],()=>{g.moveTo(0,-18);g.quadraticCurveTo(8,-6,4,10);g.lineTo(0,14);g.lineTo(-4,10);g.quadraticCurveTo(-8,-6,0,-18);});
  ln(g,[0,-14,0,18],'#c8b8e8',1.2);for(let y=-10;y<10;y+=4){ln(g,[0,y,4,y-3],'#7a6aa0',.8);ln(g,[0,y,-4,y-3],'#7a6aa0',.8);}shine(g,-2,-6,1.5,5,.35);g.restore();});
art('trf_bone',40,g=>{g.save();g.rotate(-.7);shp(g,'#f2ead2',{hl:.25},[-17,-7,17,7],()=>{g.moveTo(-11,-3);g.lineTo(11,-3);g.arc(13,-5,4,Math.PI*.9,Math.PI*2.4);g.arc(13,5,4,-Math.PI*.4,Math.PI*1.1);g.lineTo(-11,3);g.arc(-13,5,4,Math.PI*.1,Math.PI*1.6);g.arc(-13,-5,4,Math.PI*.6,Math.PI*2.1);g.closePath();});
  shine(g,-4,-1.5,6,1.2,.5);g.restore();});
art('trf_scale',40,g=>{glow(g,0,0,19,'#4ae08a');shp(g,'#2f9a4a',{hl:.5},[-13,-15,13,15],()=>{g.moveTo(0,-15);g.quadraticCurveTo(14,-12,12,2);g.quadraticCurveTo(9,13,0,15);g.quadraticCurveTo(-9,13,-12,2);g.quadraticCurveTo(-14,-12,0,-15);});
  for(const y of[-6,1,8])ln(g,[-8,y-2,0,y+2,8,y-2],'#8af0aa',1.2);shine(g,-4,-8,3,2,.6);});
art('trf_needle',40,g=>{g.save();g.rotate(.7);glow(g,0,-12,10,'#5cff9a');shp(g,'#c8d0dc',{hl:.6},[-3,-18,3,18],()=>{g.moveTo(0,18);g.lineTo(-2.4,-12);g.quadraticCurveTo(0,-19,2.4,-12);g.closePath();});
  ell(g,0,-12,1,3,'#2a2a3a',{ol:false});ln(g,[0,-16,4,-20,8,-14,6,-6],'#5cff9a',1.2);g.restore();});
art('trf_ice',40,g=>{poly(g,[0,-17,7,-4,4,15,-5,15,-8,-3],'#bfe6ff',{hl:.6});poly(g,[9,-8,14,2,10,12,6,4],'#8ccaf0',{hl:.6});ln(g,[0,-17,-1,15],'rgba(255,255,255,.8)',1);shine(g,-3,-4,1.6,6,.7);});
art('trf_pearl',40,g=>{shp(g,'#f0a8b0',{hl:.3},[-16,-2,16,15],()=>{g.moveTo(-16,4);g.quadraticCurveTo(0,22,16,4);g.quadraticCurveTo(0,10,-16,4);});
  for(let i=-3;i<=3;i++)ln(g,[0,13,i*4.5,6],'#c86a7a',.7);ell(g,0,-2,8,8,'#f4f0ff',{hl:.6});shine(g,-3,-5,2.5,2,.9);});
art('trf_ember',40,g=>{glow(g,0,2,19,'#ff7a2a','#ffd84a');poly(g,[-12,4,-7,-9,4,-12,12,-3,10,10,-4,13],'#3a2a2a',{hl:.25});ln(g,[-7,-3,-1,1,3,-6],'#ff8a2a',1.6);ln(g,[-1,1,2,9],'#ffb03a',1.4);ln(g,[3,-6,8,0],'#ff8a2a',1.2);});
art('trf_eye',40,g=>{glow(g,0,0,18,'#a06aff');shp(g,'#4a3a7a',{hl:.4},[-12,-15,12,16],()=>{g.moveTo(0,-15);g.quadraticCurveTo(13,-13,11,4);g.quadraticCurveTo(10,13,5,10);g.quadraticCurveTo(3,16,0,11);g.quadraticCurveTo(-3,16,-5,10);g.quadraticCurveTo(-10,13,-11,4);g.quadraticCurveTo(-13,-13,0,-15);});
  eye(g,0,-3,4.2,{px:0});});
art('trf_gem',40,g=>{glow(g,0,0,19,'#4ae08a');poly(g,[0,-15,12,-5,8,13,-8,13,-12,-5],'#1fa85a',{hl:.5});ln(g,[-12,-5,-5,-3,5,-3,12,-5],'#7af0aa',1);ln(g,[-5,-3,-8,13],'#0f7a3a',.8);ln(g,[5,-3,8,13],'#0f7a3a',.8);shine(g,-4,-7,2.5,4,.6);});
art('trf_acorn',40,g=>{ell(g,0,4,10,11,'#f0b830',{hl:.55});shp(g,'#8a5a2a',{},[-12,-12,12,-1],()=>{g.moveTo(-11,-1);g.quadraticCurveTo(-12,-11,0,-11);g.quadraticCurveTo(12,-11,11,-1);g.quadraticCurveTo(0,-4,-11,-1);});
  for(let x=-8;x<=8;x+=4)ln(g,[x,-9,x+1,-3],'#6a4018',.8);ln(g,[0,-11,2,-16],'#6a4018',2);shine(g,-4,4,2.5,4,.6);});
art('trf_cloud',40,g=>{for(const [x,y,r] of[[-7,3,8],[6,2,9],[0,-4,9]])ell(g,x,y,r,r*.85,'#eef6ff',{hl:.3});ell(g,0,5,15,4,'#eef6ff',{ol:false});
  g.beginPath();g.arc(0,0,4,Math.PI*.2,Math.PI*1.7);g.lineWidth=1.6;g.strokeStyle='#7aa0d0';g.stroke();g.beginPath();g.arc(1,0,8,Math.PI*1.2,Math.PI*2.1);g.stroke();});
art('trf_bag',40,g=>{shp(g,'#a8733d',{hl:.35},[-14,-8,14,16],()=>{g.moveTo(-6,-8);g.quadraticCurveTo(-16,2,-12,12);g.quadraticCurveTo(0,18,12,12);g.quadraticCurveTo(16,2,6,-8);g.closePath();});
  ln(g,[-7,-8,7,-8],'#e6b53a',2.4);poly(g,[-4,-9,-8,-16,0,-12,8,-16,4,-9],'#8a5a2e',{lw:.7});ell(g,0,4,4,4,'#f2c230',{hl:.6,lw:.6});});
art('trf_board',44,g=>{for(const x of[-15,13]){rrect(g,x,-6,3,26,1);g.fillStyle='#8a5a2e';g.fill();}
  rrect(g,-19,-18,38,22,2.5);g.fillStyle=grad(g,0,-8,20,'#b07a40');g.fill();outline(g,'#b07a40',1.3);
  for(const [x,y,r] of[[-14,-15,-.1],[-2,-16,.08],[9,-14,-.06]]){g.save();g.translate(x,y);g.rotate(r);rrect(g,0,0,9,11,1);g.fillStyle='#f6eed6';g.fill();outline(g,'#c8b88a',.6);for(let i=0;i<3;i++)ln(g,[2,3+i*2.6,7,3+i*2.6],'#8a7a5a',.7);g.restore();
    g.beginPath();g.arc(x+4.5,y+1,1.1,0,TAU);g.fillStyle='#d8382e';g.fill();}});
art('trf_ped',44,g=>{rrect(g,-14,-6,28,22,3);g.fillStyle=grad(g,0,4,16,'#c8904a');g.fill();outline(g,'#c8904a',1.3);for(const y of[0,7])ln(g,[-14,y,14,y],'#9a6a30',1);
  ln(g,[-10,-6,-6,-18,6,-18,10,-6],'#7a4a22',2);ell(g,-6,-9,4,4,'#d83a3a');ell(g,3,-10,5,4,'#f0c040');ell(g,8,-8,3,3,'#4a9ae0');shine(g,-7,-10,1.2,1,.7);});
art('trf_hour',40,g=>{for(const y of[-16,16])rrect(g,-12,y-2,24,4,1.5),g.fillStyle='#8a5a2e',g.fill();
  shp(g,'#e8f4ff',{hl:.4},[-10,-14,10,14],()=>{g.moveTo(-9,-14);g.lineTo(9,-14);g.quadraticCurveTo(9,-3,1.5,0);g.quadraticCurveTo(9,3,9,14);g.lineTo(-9,14);g.quadraticCurveTo(-9,3,-1.5,0);g.quadraticCurveTo(-9,-3,-9,-14);g.closePath();});
  poly(g,[-6,-9,6,-9,0,-1],'#f2c230',{ol:false});poly(g,[-7,13,7,13,0,6],'#f2c230',{ol:false});});

/* ---------- для проверки на своей машине: TRFX.give(n), TRFX.skip(сек) ---------- */
const TRFX={on:TRF_ON,hub:trfHub,give(n){if(!LOCAL)return;for(const id of trfOpenIds())TRF_ADD(id,n||20);save();},
  skip(sec){if(!LOCAL)return;const t=TR();if(!t)return;t.ot=t.ot.map(x=>x-sec*1000);save();}};
