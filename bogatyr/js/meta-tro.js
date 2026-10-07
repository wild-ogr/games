'use strict';
/* ================= МЕТА «tro»: трофеи по темам, Бестиарий★, Заказы старосты, Коробейник, Дела недели (07.10) =================
   План — release-i/bogatyr-meta/plan.md пп. 6, 7, 11, 22; договор модулей — release-h/bogatyr-chapters/ENGINE-API.md §15; журнал — logs/M-tro.md.
   Включение: metaOn('tro') (?meta=all или ?meta=tro на своей машине; при выпуске — 'tro' в META_ON). Выключено — хуки молчат, S.tro не создаётся.
   Правила: новичку (первые 3 похода) ничего не показываем и трофеи не роняем; золото — только сток (коробейник) и малая плата заказов (≈ 4–6 % дохода казуального);
   трофеи падают ТОЛЬКО за дело (вожак 1, мини-босс 2, босс 2, победа +1; Сложная ×1,3, Адская ×1,6), без «первая победа ×2»; Math.random не трогаем (свой ГПСЧ).
   Сейв — только S.tro (+ общие трофеи S.trG/S.trS через TRO_ADD/TRO_SPEND из data.js):
     {v, sd, ord:[заказ|null ×3], ot:[время пополнения ×3], oc:{житель:N}, on, pd:{s,r,b:[…]}, pad:{d,n}, wk:{w,c:{…},got}, bs:{вид:звёзд взято}, bp:{тема:1}, ob, rr, ts}
     заказ = {r:житель, tr:{tr_les:6,…}, sp:{repa:2}|null, g:золото} */

/* ---------- трофеи (ОКОНЧАТЕЛЬНЫЙ список — ENGINE-API §15): id = 'tr_'+тема из TH_IDS ---------- */
const TRO_IDS=['tr_les','tr_bol','tr_pole','tr_kosh','tr_med','tr_gory','tr_more','tr_luk','tr_ogon','tr_vihr','tr_lih'];
const TRO_DEF={
  tr_les:{th:'les',n:'Клык',en:'Fang'},tr_bol:{th:'bol',n:'Тина',en:'Swamp weed'},tr_pole:{th:'pole',n:'Воронье перо',en:'Raven feather'},
  tr_kosh:{th:'kosh',n:'Косточка',en:'Bone'},tr_med:{th:'med',n:'Самоцвет',en:'Gem'},tr_gory:{th:'gory',n:'Льдинка',en:'Ice shard'},
  tr_more:{th:'more',n:'Жемчуг',en:'Pearl'},tr_luk:{th:'luk',n:'Золотой жёлудь',en:'Golden acorn'},tr_ogon:{th:'ogon',n:'Уголёк',en:'Ember'},
  tr_vihr:{th:'vihr',n:'Облачко',en:'Cloud puff'},tr_lih:{th:'lih',n:'Тень',en:'Shadow'}};
for(const id in TRO_DEF){const d=TRO_DEF[id];d.art=d.ic=id;Object.defineProperty(d,'name',{get(){return L(d.n,d.en);}});} /* th — тема, ic/art — ключ ART, name — имя на языке игры (просьба terem) */
function troName(id){const d=TRO_DEF[id];return d?L(d.n,d.en):id;}
function TRO_ICO(id,px){return '<img src="'+ic(id,96)+'" width="'+(px||22)+'" height="'+(px||22)+'" style="vertical-align:middle">';}
function troOfSlot(s){const r=typeof CAMP_S!=='undefined'&&CAMP_S[s];return r?'tr_'+r.th:'';}

const TRO_ON=typeof metaOn==='function'&&metaOn('tro');
const TRO={drop:{elite:1,mini:2,boss:2,win:1,endCap:8},dif:{s:1.3,h:1.6},pdH:8,pdAd:3,ordWait:2*3600e3,
  starN:[50,500,3000],starB:[5,25,100],starR:[2,4,10],pageR:10,wkChest:{top:15,other:5,ob:3}};
function troErr(w,x){troErr.n=(troErr.n||0)+1;if(troErr.n<=5)console.warn('meta tro.'+w+': '+(x&&x.message||x));}
function troRng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function troEv(k,p){try{STAT.ev('tro_'+k,p||{});}catch(e){}}

/* ---------- сейв ---------- */
function troNew(){return {v:1,sd:(Date.now()%1e6)|0,ord:[null,null,null],ot:[0,0,0],oc:{},on:0,pd:{s:0,r:0,b:[0,0,0,0]},pad:{d:'',n:0},wk:{w:0,c:{},got:0},bs:{},bp:{},ob:0,rr:0,ts:0};}
function troFix(t){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),n=v=>typeof v==='number'&&isFinite(v)?v:0,nn=v=>Math.max(0,n(v)|0);
  const d=troNew();for(const k in d)if(!(k in t))t[k]=d[k];
  t.sd=nn(t.sd);t.on=nn(t.on);t.ob=Math.min(9,nn(t.ob));t.rr=Math.min(3,nn(t.rr));t.ts=n(t.ts);
  if(!Array.isArray(t.ord))t.ord=[];t.ord.length=3;
  t.ord=Array.from(t.ord,o=>{if(!ob(o)||!TRO_RES[o.r]||!ob(o.tr))return null;const tr={};for(const id in o.tr)if(TRO_DEF[id]&&nn(o.tr[id]))tr[id]=nn(o.tr[id]);if(!Object.keys(tr).length)return null;
    let sp=null;if(ob(o.sp)){sp={};for(const k in o.sp)if(['repa','kap','gor','med'].indexOf(k)>=0&&nn(o.sp[k]))sp[k]=nn(o.sp[k]);if(!Object.keys(sp).length)sp=null;}return {r:o.r,tr:tr,sp:sp,g:nn(o.g)};});
  if(!Array.isArray(t.ot))t.ot=[];t.ot=[0,1,2].map(i=>n(t.ot[i]));
  for(const k of['oc','bs','bp'])if(!ob(t[k]))t[k]={};for(const k in t.oc)t.oc[k]=nn(t.oc[k]);for(const k in t.bs)t.bs[k]=Math.min(3,nn(t.bs[k]));for(const k in t.bp)t.bp[k]=t.bp[k]?1:0;
  if(!ob(t.pd))t.pd=d.pd;t.pd.s=nn(t.pd.s);t.pd.r=nn(t.pd.r);if(!Array.isArray(t.pd.b))t.pd.b=[];t.pd.b=[0,1,2,3].map(i=>nn(t.pd.b[i]));
  if(!ob(t.pad))t.pad={d:'',n:0};if(typeof t.pad.d!=='string')t.pad.d='';t.pad.n=Math.min(TRO.pdAd,nn(t.pad.n));
  if(!ob(t.wk))t.wk={w:0,c:{},got:0};t.wk.w=nn(t.wk.w);t.wk.got=t.wk.got?1:0;if(!ob(t.wk.c))t.wk.c={};for(const k in t.wk.c)t.wk.c[k]=nn(t.wk.c[k]);
  t.v=1;return t;}
function troFixS(s){try{s=s||S;const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(s.tro!=null&&!ob(s.tro))s.tro=null;
  if(!s.tro){if(!TRO_ON)return;s.tro={};}s.tro=troFix(s.tro);}catch(e){troErr('fix',e);}}
// облако: основа — более новая копия (ts); постоянное (истории жителей, звёзды бестиария, страницы, счёт заказов) — максимум
function troMerge(d,o){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),b=ob(d)&&ob(d.tro)?d.tro:null;if(!b)return;const a=ob(o.tro)?o.tro:null;
  if(!a){o.tro=troFix(JSON.parse(JSON.stringify(b)));return;}
  const bN=(+b.ts||0)>(+a.ts||0),nw=JSON.parse(JSON.stringify(bN?b:a)),ol=bN?a:b;
  for(const k of['oc','bs','bp']){nw[k]=ob(nw[k])?nw[k]:{};const x=ob(ol[k])?ol[k]:{};for(const i in x)nw[k][i]=Math.max(+nw[k][i]||0,+x[i]||0);}
  nw.on=Math.max(+nw.on||0,+ol.on||0);
  if(ob(nw.wk)&&ob(ol.wk)&&nw.wk.w===ol.wk.w){nw.wk.got=Math.max(+nw.wk.got||0,+ol.wk.got||0);const c=ob(nw.wk.c)?nw.wk.c:(nw.wk.c={}),x=ob(ol.wk.c)?ol.wk.c:{};for(const i in x)c[i]=Math.max(+c[i]||0,+x[i]||0);}
  o.tro=troFix(nw);}catch(e){troErr('merge',e);}}
function TR(){return TRO_ON&&S.tro||null;}
function trTouch(){const t=TR();if(t)t.ts=Date.now();}
function troOpen(){return !!TR()&&(S.runs||0)>=3;}  // новичку (первые 3 похода) — ничего

/* ---------- темы, виды ---------- */
function troDone(){const a=[];for(const s in S.done)if(chPos(+s)>0)a.push(+s);return a;}
function troOpenIds(){const set={};for(const s of troDone()){const id=troOfSlot(s);if(id)set[id]=1;}const a=TRO_IDS.filter(id=>set[id]);return a.length?a:['tr_les'];}
function troTopId(){let b=-1,id='tr_les';for(const s of troDone()){const p=chPos(s);if(p>b&&troOfSlot(s)){b=p;id=troOfSlot(s);}}return id;}
function troThName(th){for(const s of ORD){const r=CAMP_S[s];if(r&&r.th===th&&CH[s])return CH[s].name;}return th;}
let troSpC=null; // вид → тема (первая по кампании, как bestWhere); тема → [виды]
function troSpecies(){if(troSpC&&troSpC.n===ORD.length)return troSpC;const of={},by={};
  for(const s of ORD){const c=CH[s],r=CAMP_S[s];if(!c||!r)continue;const ids=[].concat(c.en||[],(c.w||[]).map(x=>x&&x.id),c.mb?[c.mb.id]:[],c.boss?[c.boss]:[]);
    for(const id of ids)if(id&&EN[id]&&!of[id]&&BEST_ORDER.indexOf(id)>=0&&!EN[id].prop){of[id]=r.th;(by[r.th]=by[r.th]||[]).push(id);}}
  return troSpC={n:ORD.length,of:of,by:by};}
function troIsBoss(id){return !!(EN[id]&&EN[id].boss);}
function troStars(id){const n=S.bk[id]||0,t=troIsBoss(id)?TRO.starB:TRO.starN;return t.filter(x=>n>=x).length;}

/* ---------- жители (заказы и их истории) ---------- */
const TRO_RES={
  agafya:{ic:'m_babka',get n(){return L('Бабушка Агафья','Granny Agafya');},st:[
    ['Спасибо, внучек! Из клыков я бусы для внучки нанижу.','Thank you, dear! I’ll string the fangs into beads for my granddaughter.'],
    ['Нечисть от деревни отступает — даже куры стали нестись лучше.','The monsters are backing off — even the hens lay better now.'],
    ['Я тебе скажу по секрету: в молодости я сама гусей-лебедей гоняла!','A secret: when I was young, I chased the swan-geese myself!'],
    ['Пирог в печи — твоя доля всегда на краю стола.','There’s a pie in the oven — your share is always at the edge of the table.'],
    ['Слава о тебе дошла до соседних деревень. Горжусь!','Your fame has reached the next villages. I’m proud!']]},
  kuzma:{ic:'tr_r_kuz',get n(){return L('Кузнец Кузьма','Kuzma the Smith')},st:[
    ['Из этого добра выкую подкову на счастье — повешу над дверью.','I’ll forge a lucky horseshoe from this — it goes over the door.'],
    ['Молот мой звенит веселее, когда ты в походе.','My hammer rings merrier while you’re out on a run.'],
    ['Подмастерье мой хочет быть богатырём. Я сказал: сперва гвозди ковать научись!','My apprentice wants to be a hero. I said: learn to forge nails first!'],
    ['Твой меч я бы узнал из тысячи — по звону.','I’d know your sword among a thousand — by its ring.'],
    ['Говорят, в Медной горе мастера лучше меня. Не верю!','They say the Copper Mountain masters are better than me. I don’t believe it!']]},
  frol:{ic:'tr_r_frol',get n(){return L('Мельник Фрол','Frol the Miller')},st:[
    ['Жернова крутятся, мука белая — живём!','The millstones turn, the flour is white — life is good!'],
    ['Ветер нынче добрый: это ты, видать, Вихрю бока намял.','A kind wind today — you must have taught the Whirlwind a lesson.'],
    ['Мыши в амбаре говорят, что тебя боятся больше кота.','The barn mice say they fear you more than the cat.'],
    ['Испеку калачи на всю деревню — в твою честь.','I’ll bake kalach buns for the whole village — in your honor.'],
    ['Мельница — сердце деревни, а ты — её щит.','The mill is the heart of the village, and you are its shield.']]},
  vanya:{ic:'tr_r_van',get n(){return L('Пастушок Ванятка','Vanyatka the Shepherd')},st:[
    ['Ура! Волки больше коров не пугают!','Hooray! The wolves don’t scare the cows anymore!'],
    ['Я на дудочке песню про тебя сочинил. Послушаешь?','I made up a song about you on my pipe. Want to hear it?'],
    ['Когда вырасту, тоже пойду в поход. Возьмёшь?','When I grow up, I’ll go on runs too. Will you take me?'],
    ['Бурёнка дала столько молока, что хватило на весь двор!','Burenka gave so much milk the whole yard got some!'],
    ['Я теперь не боюсь темноты — ты же рядом.','I’m not afraid of the dark anymore — you’re near.']]},
  alena:{ic:'tr_r_ale',get n(){return L('Алёнушка-рукодельница','Alyonushka the Needlewoman')},st:[
    ['Из жемчуга и самоцветов вышью кокошник — краше не сыщешь!','I’ll embroider a kokoshnik with pearls and gems — none prettier!'],
    ['Узор на рушнике — про твои походы. Видишь, вот ты, а вот Змей.','The towel pattern tells of your runs. See, here’s you, and here’s the Serpent.'],
    ['Подружки завидуют: у меня нитки из пуха Жар-птицы. Шучу!','My friends are jealous: my thread is Firebird down. Just kidding!'],
    ['Сошью тебе рубаху с оберегом — чтобы домой возвращался.','I’ll sew you a shirt with a charm — so you always come home.'],
    ['Вся деревня теперь нарядная. Это всё ты!','The whole village is festive now. It’s all thanks to you!']]}};
const TRO_RK=Object.keys(TRO_RES);
troFixS(S); // при самой первой загрузке META_HK ещё не зовёт FIX — чиним сами

/* ---------- выпадение в походе (KILL/END) ---------- */
function troRunOk(G){return !!G&&G.troId!==undefined&&!!G.troId;}
function troRUN(G){try{const t=TR();if(!t||!G)return;G.troId='';G.troK=0;G.troLog=[];
  if(!troOpen()||G.first)return;const id=troOfSlot(G.chi);if(!id)return;G.troId=id;
  if(!G.endless&&!G.daily&&!G.weekly){let a=0;if(t.rr>0){t.rr--;a++;}if(t.ob>0){t.ob--;a++;}
    if(a){G.rerolls=(G.rerolls||0)+a;trTouch();save();try{banner('📜 '+L('Свиток перебора','Reroll scroll'),'+'+a+L(' перебор',' reroll'),2);}catch(e){}}}}catch(e){troErr('run',e);}}
function troKILL(e){try{if(!e||!G||!troRunOk(G)||e.prop||e.type==='egg')return;const t=TR();if(!t)return;
  const c=troWk(t).c;c.k=(c.k||0)+1;
  let n=0;if(e.mini)n=TRO.drop.mini;else if(e.boss){n=TRO.drop.boss;c.b=(c.b||0)+1;}else if(e.elite){n=TRO.drop.elite;c.e=(c.e||0)+1;}
  if(!n)return;if(G.endless&&G.troK>=TRO.drop.endCap)return;G.troK+=n;
  if(typeof addNum==='function')try{addNum(e.x,e.y-(e.r||12)*1.6,'+'+n+' '+troName(G.troId),'#ffd98a');}catch(x){}}catch(x){troErr('kill',x);}}
function troEND(G,win){try{const t=TR();if(!t||!G||!troRunOk(G))return;const c=troWk(t).c;c.r=(c.r||0)+1;if(win)c.w=(c.w||0)+1;if(G.daily)c.d=(c.d||0)+1;
  let n=G.troK+(win?TRO.drop.win:0);if(G.endless)n=Math.min(n,TRO.drop.endCap);n=Math.round(n*(TRO.dif[G.dif]||1));
  if(n>0){TRO_ADD(G.troId,n);c.t=(c.t||0)+n;troEv('drop',{k:G.troId,n:n,src:'run',w:win?1:0});
    G.metaHtml=(G.metaHtml||'')+'<p class="sub">'+TRO_ICO(G.troId,24)+' '+L('Трофеи: ','Trophies: ')+'<b>+'+n+' '+troName(G.troId)+'</b>'+(troOrdReady(t)?L(' · заказ можно сдать!',' · an order is ready!'):'')+'</p>';}
  trTouch();}catch(e){troErr('end',e);}}

/* ---------- заказы старосты ---------- */
function troOrdGold(o){const Q=typeof questReward==='function'?questReward():90;let n=0;for(const id in o.tr)n+=o.tr[id];return Math.round(Q*(.08*n+(o.sp?.15:0))/10)*10;}
function troYard(){try{const y=typeof Y==='function'?Y():null;return y&&y.in&&(y.c.h||0)>0?y:null;}catch(e){return null;}}
function troMkOrd(t,slot){const R=troRng((t.sd++)*7919+slot*31+1),open=troOpenIds(),top=troTopId();
  const busy={};t.ord.forEach(o=>{if(o)busy[o.r]=1;});const fr=TRO_RK.filter(k=>!busy[k]),r=fr[Math.floor(R()*fr.length)]||TRO_RK[0];
  const n=5+Math.min(5,landsU()),tr={};
  const a=R()<.5?top:open[Math.floor(R()*open.length)];
  if(open.length>1&&R()<.6){const b=open.filter(x=>x!==a)[Math.floor(R()*(open.length-1))];const na=Math.ceil(n*.6);tr[a]=na;tr[b]=n-na;}else tr[a]=n;
  let sp=null;const y=troYard();if(y&&R()<.5){const ks=['repa','kap','gor'].concat(y.hv?['med']:[]),k=ks[Math.floor(R()*ks.length)];sp={};sp[k]=k==='med'?1:2+Math.floor(R()*2);}
  const o={r:r,tr:tr,sp:sp,g:0};o.g=troOrdGold(o);return o;}
function troOrdFill(t){const now=nowMs();let ch=0;for(let i=0;i<3;i++)if(!t.ord[i]&&now>=t.ot[i]){t.ord[i]=troMkOrd(t,i);ch=1;}if(ch){trTouch();save();}}
/* овощи Подворья (S.meta.y.st; согласовано с главным 07.10): только через эти две функции; число — целое ≥ 0, не больше склада YARD.store */
const TRO_SP=['repa','kap','gor','med'];
function troYardTot(y){let n=0;for(const k in y.st)n+=Math.max(0,y.st[k]|0);return n;}
function troYardTake(o){const y=troYard();if(!y||!o)return false;for(const k in o)if(TRO_SP.indexOf(k)<0||(y.st[k]|0)<(o[k]|0))return false;
  for(const k in o)y.st[k]=Math.max(0,(y.st[k]|0)-(o[k]|0));if(typeof yTouch==='function')yTouch();return true;}
function troYardGive(k,n){const y=troYard();n=n|0;if(!y||TRO_SP.indexOf(k)<0||n<=0)return false;const cap=typeof YARD!=='undefined'?YARD.store:20;if(troYardTot(y)+n>cap)return false;
  y.st[k]=Math.max(0,y.st[k]|0)+n;if(typeof yTouch==='function')yTouch();return true;}
function troSpName(k){try{return typeof ingName==='function'?ingName(k):k;}catch(e){return k;}}
function troSpIc(k){try{return typeof ingIc==='function'?ingIc(k):'';}catch(e){return '';}}
function troCan(o){for(const id in o.tr)if(TRO_N(id)<o.tr[id])return false;if(o.sp){const y=troYard();if(!y)return false;for(const k in o.sp)if((y.st[k]||0)<o.sp[k])return false;}return true;}
function troOrdReady(t){return t.ord.some(o=>o&&troCan(o));}
function TRO_ADD_BACK(tr){const s=S.trS||{};for(const id in tr)s[id]=Math.max(0,(s[id]|0)-(tr[id]|0));} // откат TRO_SPEND, если припасов не хватило
function troOrdDo(i){const t=TR();if(!t)return;const o=t.ord[i];if(!o||!troCan(o))return;
  if(!TRO_SPEND(o.tr))return;if(o.sp&&!troYardTake(o.sp)){TRO_ADD_BACK(o.tr);return;}
  S.gold+=o.g;ern('ord',o.g);const line=troResLine(o.r);t.oc[o.r]=(t.oc[o.r]||0)+1;t.on++;troWk(t).c.o=(troWk(t).c.o||0)+1;
  t.ord[i]=null;t.ot[i]=nowMs()+TRO.ordWait;trTouch();save();SND.chest();setGold();
  troEv('ord',{r:o.r,g:o.g,n:t.on,l:typeof chPos==='function'?landsU():0});
  showModal('<h3>'+TRO_RES[o.r].n+'</h3><div class="card"><div class="row"><img class="ic" src="'+ic(TRO_RES[o.r].ic,96)+'" style="width:64px;height:64px"><div class="t"><b>«'+line+'»</b></div></div></div>'+
    '<p class="sub" style="text-align:center;font-size:17px">'+L('Награда: ','Reward: ')+'<b style="color:#ffd98a">+'+fmtNum(o.g)+goldW()+'</b></p><div class="btns"><button class="btn big" id="trOk">'+L('Пожалуйста!','You’re welcome!')+'</button></div>','tro');
  on('trOk',()=>troHub('ord'));}
function troResLine(r){const R=TRO_RES[r],k=(S.tro.oc[r]||0);const s=R.st[Math.min(k,R.st.length-1)];return k>=R.st.length?L('Спасибо тебе, богатырь! Заходи ещё.','Thank you, hero! Come again.'):L(s[0],s[1]);}
function troOrdSkip(i){const t=TR();if(!t||!t.ord[i])return;t.ord[i]=null;t.ot[i]=nowMs()+TRO.ordWait;trTouch();save();troEv('ord_skip',{});}

/* ---------- коробейник (раз в 8 ч новый товар; сток золота и обмен 3:1) ---------- */
function troPdSlot(){return Math.floor(nowMs()/(TRO.pdH*3600e3));}
function troPdLeft(){return (troPdSlot()+1)*TRO.pdH*3600e3-nowMs();}
function troPd(t){const s=troPdSlot();if(t.pd.s!==s){t.pd={s:s,r:0,b:[0,0,0,0]};trTouch();}return t.pd;}
function troPdGoods(t){const pd=troPd(t),R=troRng(pd.s*131+pd.r*17+t.sd%977*3),open=troOpenIds(),Q=typeof questReward==='function'?questReward():90,r10=x=>Math.round(x/10)*10;
  const need={};t.ord.forEach(o=>{if(o)for(const id in o.tr){const m=o.tr[id]-TRO_N(id);if(m>0)need[id]=(need[id]||0)+m;}});
  const nk=Object.keys(need).sort((a,b)=>need[b]-need[a]),pick=()=>open[Math.floor(R()*open.length)];
  const A=nk[0]||pick();let B=nk[1]||pick();if(B===A&&open.length>1)B=open.filter(x=>x!==A)[Math.floor(R()*(open.length-1))];
  const G=[{k:'pack',id:A,n:5,c:r10(Q*1.6),m:2}];
  const y=troYard();if(y){const ks=['repa','kap','gor'],c=ks[Math.floor(R()*3)];G.push({k:'sup',sp:c,n:3,c:r10(Q*.8),m:1});}else G.push({k:'pack',id:B,n:5,c:r10(Q*1.6),m:1});
  let rich='',rn=-1;for(const id of open){const v=TRO_N(id);if(v>rn&&id!==A){rn=v;rich=id;}}
  if(open.length>1&&rich)G.push({k:'ex',from:rich,to:A,n:3,m:5});else G.push({k:'pack',id:B,n:3,c:r10(Q),m:1});
  G.push({k:'scroll',c:r10(Q*1.2),m:1});return G;}
function troPdBuy(i){const t=TR();if(!t)return;const g=troPdGoods(t)[i],pd=t.pd;if(!g||pd.b[i]>=g.m)return;
  if(g.k==='ex'){if(!TRO_SPEND({[g.from]:g.n}))return;TRO_ADD(g.to,1);troEv('shop',{k:'ex',f:g.from,t:g.to});}
  else{if(S.gold<g.c)return;
    if(g.k==='sup'){if(!troYardGive(g.sp,g.n)){toast(L('Амбар полон — освободи место','The barn is full — make some room'));return;}}
    else if(g.k==='scroll'){if(t.rr>=3){toast(L('Свитков и так 3 — сходи в поход','You already have 3 scrolls — go on a run'));return;}t.rr++;}
    else{TRO_ADD(g.id,g.n);troEv('drop',{k:g.id,n:g.n,src:'shop'});}
    S.gold-=g.c;STAT.ev('spend',{k:'tro:'+g.k,c:g.c});setGold();}
  pd.b[i]++;trTouch();save();SND.coin();troEv('shop',{k:g.k,c:g.c||0});}
function troPadLeft(t){return t.pad.d===dayKey()?Math.max(0,TRO.pdAd-t.pad.n):TRO.pdAd;}
function troPdNew(){const t=TR();if(!t||!troPadLeft(t))return false;const pd=troPd(t);pd.r++;pd.b=[0,0,0,0];t.pad={d:dayKey(),n:(t.pad.d===dayKey()?t.pad.n:0)+1};trTouch();save();troEv('pd_ad',{});return true;}

/* ---------- дела недели (5 больших дел → сундук недели с оберегом) ---------- */
const TRO_WK={
  k:{n:2000,ic:'wolf',get t(){return L('Одолей нечисти','Defeat monsters');}},
  e:{n:15,ic:'chest',get t(){return L('Одолей вожаков','Defeat elite monsters');}},
  b:{n:5,ic:'e_perun',get t(){return L('Победи боссов','Defeat bosses');}},
  t:{n:35,ic:'tr_les',get t(){return L('Добудь трофеев','Collect trophies');}},
  o:{n:3,ic:'tr_board',get t(){return L('Выполни заказы старосты','Fill the elder’s orders');}},
  r:{n:8,ic:'i_sword',get t(){return L('Сходи в походы','Go on runs');}},
  w:{n:5,ic:'i_sword',get t(){return L('Одержи побед','Win runs');}},
  d:{n:2,ic:'bird',get t(){return L('Пройди поход дня','Play the Daily Run');},on:()=>typeof drOpen==='function'&&drOpen()}};
function troWk(t){const w=typeof weekNo==='function'?weekNo():0;if(t.wk.w!==w)t.wk={w:w,c:{},got:0};return t.wk;}
function troWkList(t){const w=troWk(t),R=troRng(w.w*977+13),ks=Object.keys(TRO_WK).filter(k=>!TRO_WK[k].on||TRO_WK[k].on());
  for(let i=ks.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[ks[i],ks[j]]=[ks[j],ks[i]];}return ks.slice(0,5);}
function troWkDone(t){const w=troWk(t);return troWkList(t).filter(k=>(w.c[k]||0)>=TRO_WK[k].n).length;}
function troWkReady(t){return !troWk(t).got&&troWkDone(t)>=5;}
function troWkOpen(){const t=TR();if(!t||!troWkReady(t))return;const w=troWk(t),open=troOpenIds(),top=troTopId(),R=troRng(w.w*31+7),got={};
  got[top]=TRO.wkChest.top;const oth=open.filter(x=>x!==top);for(let i=0;i<2&&oth.length;i++){const id=oth.splice(Math.floor(R()*oth.length),1)[0];got[id]=(got[id]||0)+TRO.wkChest.other;}
  if(open.length===1)got[top]+=TRO.wkChest.other;
  for(const id in got){TRO_ADD(id,got[id]);troEv('drop',{k:id,n:got[id],src:'week'});}
  t.ob=Math.min(9,t.ob+TRO.wkChest.ob);w.got=1;trTouch();save();SND.chest();troEv('wk',{w:w.w});
  showModal('<h3>'+L('Сундук недели','Chest of the Week')+'</h3><div style="text-align:center"><img src="'+ic('chest',160)+'" width="96" height="96"></div>'+
    '<div class="card"><div style="display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;font-size:17px">'+Object.keys(got).map(id=>'<span>'+TRO_ICO(id,28)+' +'+got[id]+'</span>').join('')+'</div>'+
    '<p class="sub" style="margin:8px 0 0">'+L('🧿 Оберег недели: +1 перебор в следующих '+TRO.wkChest.ob+' походах по главам.','🧿 Charm of the Week: +1 reroll in your next '+TRO.wkChest.ob+' chapter runs.')+'</p></div>'+
    '<div class="btns"><button class="btn big" id="trOk">'+L('Забрать','Collect')+'</button></div>','tro');on('trOk',()=>troHub('wk'));}

/* ---------- Бестиарий★ (звёзды видов 50/500/3000, у боссов 5/25/100; награда — трофеи темы вида) ---------- */
function troBestClaim(t){const sp=troSpecies();let n=0;const got={};
  for(const id in sp.of){if(!S.meet[id])continue;const k=troStars(id),h=t.bs[id]||0;if(k>h){let r=0;for(let i=h;i<k;i++)r+=TRO.starR[i];const tr='tr_'+sp.of[id];if(TRO_DEF[tr]){got[tr]=(got[tr]||0)+r;n+=r;}t.bs[id]=k;}}
  for(const th in sp.by){if(t.bp[th])continue;const tr='tr_'+th;if(!TRO_DEF[tr])continue;if(sp.by[th].every(id=>S.meet[id]&&troStars(id)>=1)){t.bp[th]=1;got[tr]=(got[tr]||0)+TRO.pageR;n+=TRO.pageR;}}
  if(!n)return null;for(const id in got){TRO_ADD(id,got[id]);troEv('drop',{k:id,n:got[id],src:'best'});}trTouch();save();return got;}
function troBestN(t){const sp=troSpecies();let n=0;for(const id in sp.of)if(S.meet[id]&&troStars(id)>(t.bs[id]||0))n++;
  for(const th in sp.by)if(!t.bp[th]&&TRO_DEF['tr_'+th]&&sp.by[th].every(id=>S.meet[id]&&troStars(id)>=1))n++;return n;}

/* ---------- окно «Торжок»: заказы · коробейник · неделя · трофеи ---------- */
let troSeg='ord',troBth='',troT=0;
const trSec=t=>'<div style="font-weight:900;font-size:18px;margin:14px 4px 6px">'+t+'</div>';
function troFmt(ms){return typeof fmtLeft==='function'?fmtLeft(ms):Math.ceil(ms/60000)+L(' мин',' min');}
function troNeedHTML(o){let h='';for(const id in o.tr){const have=TRO_N(id),ok=have>=o.tr[id];h+='<span style="white-space:nowrap;'+(ok?'':'opacity:.75')+'">'+TRO_ICO(id,24)+' '+Math.min(have,o.tr[id])+'/'+o.tr[id]+(ok?' ✓':'')+'</span> ';}
  if(o.sp){const y=troYard();for(const k in o.sp){const have=y?(y.st[k]||0):0,ok=have>=o.sp[k];h+='<span style="white-space:nowrap;'+(ok?'':'opacity:.75')+'">'+(troSpIc(k)?'<img src="'+ic(troSpIc(k),40)+'" width="24" height="24" style="vertical-align:middle"> ':'')+Math.min(have,o.sp[k])+'/'+o.sp[k]+(ok?' ✓':'')+'</span> ';}}
  return '<div style="display:flex;flex-wrap:wrap;gap:4px 10px;font-size:16px;margin-top:4px">'+h+'</div>';}
function troHubHTML(t){const segs=[['ord',L('📜 Заказы','📜 Orders'),troOrdReady(t)],['pd',L('🧺 Лавка','🧺 Peddler'),0],['wk',L('🗓 Неделя','🗓 Week'),troWkReady(t)],['tr',L('🏺 Трофеи','🏺 Trophies'),troBestN(t)>0]];
  let h='<h3>'+L('Торжок у колодца','Well-side Market')+'</h3><div class="seg" style="display:flex;flex-wrap:wrap">'+segs.map(s=>'<button style="flex:1;min-width:64px;padding:0 4px;font-size:14px" class="'+(troSeg===s[0]?'on':'')+'" data-ts="'+s[0]+'">'+s[1]+(s[2]?' <b style="color:#ff6a4a">●</b>':'')+'</button>').join('')+'</div>';
  if(troSeg==='ord'){h+='<p class="sub">'+L('Жители просят трофеи с нечисти и припасы с подворья. За заказ — золото и история жителя.','Villagers ask for monster trophies and homestead produce. Each order pays gold and tells a villager’s story.')+'</p>';
    t.ord.forEach((o,i)=>{if(!o){h+='<div class="card"><div class="row"><img class="ic" src="'+ic('tr_board',96)+'" style="opacity:.55"><div class="t"><b>'+L('Новый заказ','New order')+'</b><span data-tl="o'+i+'">'+L('появится через ','arrives in ')+troFmt(t.ot[i]-nowMs())+'</span></div></div></div>';return;}
      const R=TRO_RES[o.r],ok=troCan(o),k=t.oc[o.r]||0;
      h+='<div class="card'+(ok?' next':'')+'"><div class="row"><img class="ic" src="'+ic(R.ic,96)+'"><div class="t"><b>'+R.n+'</b><span>'+L('История: ','Story: ')+Math.min(k,5)+'/5 · <img src="'+ic('coin',36)+'" width="18" height="18" style="vertical-align:middle"> <b>'+fmtNum(o.g)+'</b></span>'+troNeedHTML(o)+'</div></div>'+
        '<div class="btns" style="flex-direction:row"><button class="btn '+(ok?'gold':'ghost')+'" style="flex:2" data-to="'+i+'" '+(ok?'':'disabled')+'>'+L('Отдать','Hand over')+'</button><button class="btn ghost" style="flex:1" data-tk="'+i+'">'+L('Другой','Skip')+'</button></div></div>';});
    h+='<p class="sub">'+L('Трофеи падают с вожаков, мини-боссов и боссов той земли, где идёт поход.','Trophies drop from elites, mini-bosses and bosses of the land you’re fighting in.')+'</p>';}
  else if(troSeg==='pd'){const G=troPdGoods(t),pd=t.pd,al=troPadLeft(t);
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic('tr_ped',96)+'"><div class="t"><b>'+L('Коробейник','The Peddler')+'</b><span>'+L('«Товар свежий! Новый привезу через ','“Fresh goods! New ones in ')+'<i data-tl="pd" style="font-style:normal">'+troFmt(troPdLeft())+'</i>'+L('.»','.”')+'</span></div></div></div>';
    G.forEach((g,i)=>{const left=g.m-pd.b[i];let ico,name,sub,btn;
      if(g.k==='pack'){ico=g.id;name=troName(g.id)+' ×'+g.n;sub=L('у тебя: ','you have: ')+TRO_N(g.id);}
      else if(g.k==='sup'){ico=troSpIc(g.sp)||'m_bed';name=troSpName(g.sp)+' ×'+g.n;sub=L('припасы для узелка и заказов','produce for your bundle and orders');}
      else if(g.k==='ex'){ico=g.to;name=L('Обмен: ','Swap: ')+g.n+'× '+troName(g.from)+' → 1× '+troName(g.to);sub=L('у тебя: ','you have: ')+TRO_N(g.from)+' · '+L('ещё раз: ','times left: ')+left;}
      else{ico='tr_scroll';name=L('Свиток перебора','Reroll scroll');sub=L('+1 перебор в следующем походе по главе · свитков: ','+1 reroll on your next chapter run · scrolls: ')+t.rr+'/3';}
      const can=left>0&&(g.k==='ex'?TRO_N(g.from)>=g.n:S.gold>=g.c);
      btn=left<=0?'<span class="tag ok">✓</span>':'<button class="btn '+(can?'gold':'ghost')+'" data-tb="'+i+'" '+(can?'':'disabled')+'>'+(g.k==='ex'?L('Обменять','Swap'):'<img src="'+ic('coin',36)+'">'+fmtNum(g.c))+'</button>';
      h+='<div class="card"><div class="row"><img class="ic" src="'+ic(ico,96)+'"><div class="t"><b>'+name+'</b><span>'+sub+'</span></div>'+btn+'</div></div>';});
    if(al>0&&adOk())h+='<div class="btns"><button class="btn ad" id="trPdAd">'+L('🎬 Новый товар за рекламу','🎬 New goods for an ad')+' · '+al+'/'+TRO.pdAd+'</button></div>';}
  else if(troSeg==='wk'){const w=troWk(t),ks=troWkList(t),dn=troWkDone(t);
    h+='<p class="sub">'+L('Пять больших дел на неделю. Сделаешь все — сундук недели: трофеи и оберег (+1 перебор на 3 похода).','Five big deeds for the week. Do them all for the Chest of the Week: trophies and a charm (+1 reroll for 3 runs).')+'</p>';
    for(const k of ks){const D=TRO_WK[k],v=Math.min(w.c[k]||0,D.n),ok=v>=D.n;
      h+='<div class="card" style="'+(ok?'opacity:.7':'')+'"><div class="row"><img class="ic" src="'+ic(D.ic,96)+'"><div class="t"><b>'+(ok?'✓ ':'')+D.t+'</b><div class="bar"><i style="width:'+Math.round(v/D.n*100)+'%"></i></div><span>'+fmtNum(v)+' / '+fmtNum(D.n)+'</span></div></div></div>';}
    h+='<div class="card'+(troWkReady(t)?' next':'')+'"><div class="row"><img class="ic" src="'+ic('chest',96)+'"'+(w.got?' style="opacity:.5"':'')+'><div class="t"><b>'+L('Сундук недели','Chest of the Week')+'</b><span>'+(w.got?L('Получен — новые дела в понедельник','Collected — new deeds on Monday'):dn+' / 5')+'</span></div>'+
      (troWkReady(t)?'<button class="btn gold" id="trWk">'+L('Открыть','Open')+'</button>':'')+'</div></div>';
    if(t.ob)h+='<p class="sub">'+L('🧿 Оберег недели: ещё на ','🧿 Charm of the Week: ')+t.ob+L(' походов',' runs left')+'</p>';}
  else{const sp=troSpecies(),open=troOpenIds(),bn=troBestN(t);
    h+='<p class="sub">'+L('Трофеи — по одному виду на каждую землю.','One kind of trophy for each land.')+'</p><div class="bgrid">';
    for(const id of TRO_IDS){const th=TRO_DEF[id].th,ok=open.indexOf(id)>=0||TRO_N(id)>0,rel=ORD.some(s=>CAMP_S[s]&&CAMP_S[s].th===th);if(!rel&&!TRO_N(id))continue;
      h+='<button class="bcell'+(ok?'':' lock')+'" data-tt="'+th+'"><img src="'+ic(id,120)+'"><b>'+(ok?troName(id):'???')+'</b><small class="where">'+(ok?fmtNum(TRO_N(id)):troThName(th))+'</small></button>';}
    h+='</div>'+trSec(L('📖 Бестиарий★','📖 Bestiary★'))+'<p class="sub">'+L('Золотые звёзды: 50 / 500 / 3000 одолённых (боссы — 5 / 25 / 100). За звезду и за полную страницу земли — трофеи.','Gold stars: defeat 50 / 500 / 3000 (bosses 5 / 25 / 100). Each star and each full land page gives trophies.')+'</p>';
    if(bn)h+='<div class="btns"><button class="btn gold big" id="trBc">'+L('🏺 Забрать награды бестиария: ','🏺 Collect bestiary rewards: ')+bn+'</button></div>';
    const ths=Object.keys(sp.by);if(!troBth||ths.indexOf(troBth)<0)troBth=TRO_DEF[troTopId()]?TRO_DEF[troTopId()].th:ths[0];
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0">'+ths.map(th=>'<button class="btn '+(th===troBth?'gold':'ghost')+'" style="flex:1;min-width:44px;padding:4px" data-tp="'+th+'"><img src="'+ic('tr_'+th,40)+'" width="26" height="26"'+(open.indexOf('tr_'+th)<0?' style="filter:brightness(0) opacity(.4)"':'')+'>'+(t.bp[th]?'✓':'')+'</button>').join('')+'</div>';
    const list=sp.by[troBth]||[];h+='<b style="font-size:16px">'+troThName(troBth)+'</b><div class="bgrid">';
    for(const id of list){const k=!!S.meet[id],st=k?troStars(id):0,nb=S.bk[id]||0,goal=(troIsBoss(id)?TRO.starB:TRO.starN).find(x=>nb<x);
      h+='<button class="bcell'+(k?'':' lock')+'" data-tbi="'+id+'"><img src="'+ic(id,120)+'"><b>'+(k?EN[id].n:'???')+'</b>'+(k?'<i class="stars" style="color:#ffc21a">'+'★'.repeat(st)+'<u>'+'★'.repeat(3-st)+'</u></i><small class="where">'+(goal?fmtNum(nb)+' / '+fmtNum(goal):L('все звёзды!','all stars!'))+'</small>':'<small class="where">'+L('водится: ','lives in: ')+troThName(troBth)+'</small>')+'</button>';}
    h+='</div>';}
  h+='<div class="btns"><button class="btn big" id="trBack">'+L('Назад','Back')+'</button></div>';return h;}
function troHub(seg){const t=TR();if(!t||!troOpen())return;if(seg)troSeg=seg;troOrdFill(t);troPd(t);STAT.screen('tro_'+troSeg);
  const keep=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='tro'?$('mBody').scrollTop:0;
  showModal(troHubHTML(t),'tro');if(keep&&!seg)$('mBody').scrollTop=keep;const re=()=>troHub();const B=$('mBody');
  on('trBack',troClose);on('trWk',troWkOpen);
  on('trBc',()=>{const g=troBestClaim(t);if(g){SND.chest();toast(L('Бестиарий: ','Bestiary: ')+Object.keys(g).map(id=>'+'+g[id]+' '+troName(id)).join(', '));}re();});
  for(const b of B.querySelectorAll('[data-ts]'))b.onclick=()=>{SND.click();troSeg=b.dataset.ts;troHub();$('mBody').scrollTop=0;};
  for(const b of B.querySelectorAll('[data-to]'))b.onclick=()=>{SND.click();troOrdDo(+b.dataset.to);};
  for(const b of B.querySelectorAll('[data-tk]'))b.onclick=()=>{SND.click();troOrdSkip(+b.dataset.tk);re();};
  for(const b of B.querySelectorAll('[data-tb]'))b.onclick=()=>{SND.click();troPdBuy(+b.dataset.tb);re();};
  for(const b of B.querySelectorAll('[data-tp]'))b.onclick=()=>{SND.click();troBth=b.dataset.tp;re();};
  for(const b of B.querySelectorAll('[data-tt]'))b.onclick=()=>{SND.click();troBth=b.dataset.tt;re();};
  for(const b of B.querySelectorAll('[data-tbi]'))b.onclick=()=>{SND.click();if(typeof openBeast==='function'){openBeast(b.dataset.tbi);const ok=$('bOk');if(ok)ok.onclick=()=>{SND.click();troHub();};}};
  onAd('trPdAd','peddler',()=>showRewarded(()=>{if(troPdNew())SND.chest();if(modalHas($('trBack')))re();},null,
    ()=>{if(!troPdNew())return '';if(modalHas($('trBack')))re();else lateRe();return L('коробейник привёз новый товар','the peddler brought new goods');}));
  clearInterval(troT);troT=setInterval(troTick,1000);}
function troClose(){clearInterval(troT);troT=0;hideModal();if(typeof curTab!=='undefined'&&curTab==='Village'&&!G)try{renderVillage();}catch(e){}}
function troTick(){const t=TR();if(!t||!$('modal').classList.contains('on')||$('mBody').getAttribute('data-w')!=='tro'||!$('trBack')){clearInterval(troT);troT=0;return;}
  const now=nowMs();let flip=false;for(let i=0;i<3;i++){const el=$('mBody').querySelector('[data-tl="o'+i+'"]');if(!el)continue;const l=t.ot[i]-now;if(l<=0)flip=true;else el.textContent=L('появится через ','arrives in ')+troFmt(l);}
  const pe=$('mBody').querySelector('[data-tl="pd"]');if(pe){if(t.pd.s!==troPdSlot())flip=true;else pe.textContent=troFmt(troPdLeft());}
  if(flip)troHub();}

/* ---------- деревня, «Дела на сегодня», значки ---------- */
function troStatus(t){const a=[];const r=t.ord.filter(o=>o&&troCan(o)).length;if(r)a.push(L('заказ готов: ','orders ready: ')+r);
  if(troWkReady(t))a.push(L('сундук недели!','chest of the week!'));const bn=troBestN(t);if(bn)a.push(L('награды бестиария: ','bestiary rewards: ')+bn);
  if(!a.length){a.push(L('дела недели ','weekly deeds ')+troWkDone(t)+'/5');a.push(L('коробейник: новый товар через ','peddler: new goods in ')+troFmt(troPdLeft()));}return a.join(' · ');}
function troReady(t){return troOrdReady(t)||troWkReady(t)||troBestN(t)>0;}
function troVIL(el){try{const t=TR();if(!t||!el||!troOpen())return;troOrdFill(t);
  const d=document.createElement('div');d.className='card'+(troReady(t)?' next':'');d.id='troCard';
  d.innerHTML='<div class="row"><img class="ic" src="'+ic('tr_board',96)+'"><div class="t"><b>'+L('📜 Торжок у колодца','📜 Well-side Market')+'</b><span>'+troStatus(t)+'</span></div><button class="btn gold" id="troGo">'+L('Открыть','Open')+'</button></div>';
  const at=el.querySelector('#yardCard')||el.querySelector('#village');if(at&&at.nextSibling)el.insertBefore(d,at.nextSibling);else el.appendChild(d);
  on('troGo',()=>troHub(troOrdReady(t)?'ord':troWkReady(t)?'wk':troBestN(t)?'tr':null));}catch(e){troErr('vil',e);}}
function troTODAY(TL){try{const t=TR();if(!t||!troOpen())return;troOrdFill(t);
  TL.push({k:'tro',ic:'tr_board',t:L('Заказы старосты','Elder’s orders'),s:troStatus(t),ready:troReady(t),b:L('Открыть','Open'),always:1,fn:()=>{hideModal();troHub(troOrdReady(t)?'ord':troWkReady(t)?'wk':troBestN(t)?'tr':'ord');}});}catch(e){troErr('today',e);}}
function troCHIPS(a){try{const t=TR();if(!t||!troOpen())return;const r=t.ord.filter(o=>o&&troCan(o)).length;
  if(r)a.push('<i class="hot">📜 '+L('заказ готов','order ready')+'</i>');else if(troWkReady(t))a.push('<i class="hot">🗓 '+L('сундук недели','weekly chest')+'</i>');}catch(e){troErr('chips',e);}}

if(typeof META_MODS!=='undefined')META_MODS.push({id:'tro',RUN:troRUN,KILL:troKILL,END:troEND,VIL:troVIL,TODAY:troTODAY,CHIPS:troCHIPS,FIX:troFixS,MERGE:troMerge});

/* ---------- рисунки (стиль art.js; только ключи tr_*) ---------- */
art('tr_les',40,g=>{shp(g,'#fbf6e6',{hl:.25},[-9,-16,10,16],()=>{g.moveTo(-8,-12);g.quadraticCurveTo(0,-17,8,-12);g.quadraticCurveTo(9,2,2,15);g.quadraticCurveTo(0,17,-1,13);g.quadraticCurveTo(-3,0,-8,-12);});
  shp(g,'#c98a5a',{},[-9,-16,9,-8],()=>{g.moveTo(-8,-12);g.quadraticCurveTo(0,-18,8,-12);g.lineTo(7,-8);g.quadraticCurveTo(0,-11,-7,-8);g.closePath();});
  ln(g,[-10,-13,-14,-17],'#7a5a3a',1.6);ln(g,[10,-13,14,-17],'#7a5a3a',1.6);shine(g,-2,-2,2,6,.5);});
art('tr_bol',40,g=>{for(const [x,c] of[[-7,'#4f8a3a'],[0,'#6aa84a'],[7,'#3f7a32']])shp(g,c,{},[x-5,-16,x+5,16],()=>{g.moveTo(x-2,15);g.quadraticCurveTo(x-7,6,x-1,-2);g.quadraticCurveTo(x+5,-9,x-1,-16);g.quadraticCurveTo(x+9,-9,x+3,-1);g.quadraticCurveTo(x-2,6,x+3,15);g.closePath();});
  ell(g,0,14,11,3.5,'#5a7a8a');for(const [x,y] of[[-4,-6],[5,2],[-1,8]]){g.beginPath();g.arc(x,y,1.4,0,TAU);g.fillStyle='rgba(220,255,200,.8)';g.fill();}});
art('tr_pole',40,g=>{g.save();g.rotate(-.6);shp(g,'#3a3448',{hl:.5},[-6,-18,6,18],()=>{g.moveTo(0,-18);g.quadraticCurveTo(8,-6,4,10);g.lineTo(0,14);g.lineTo(-4,10);g.quadraticCurveTo(-8,-6,0,-18);});
  ln(g,[0,-14,0,18],'#9a8aa8',1.2);for(let y=-10;y<10;y+=4){ln(g,[0,y,4,y-3],'#5a5070',.8);ln(g,[0,y,-4,y-3],'#5a5070',.8);}shine(g,-2,-6,1.5,5,.35);g.restore();});
art('tr_kosh',40,g=>{g.save();g.rotate(-.7);shp(g,'#f2ead2',{hl:.25},[-17,-7,17,7],()=>{g.moveTo(-11,-3);g.lineTo(11,-3);g.arc(13,-5,4,Math.PI*.9,Math.PI*2.4);g.arc(13,5,4,-Math.PI*.4,Math.PI*1.1);g.lineTo(-11,3);g.arc(-13,5,4,Math.PI*.1,Math.PI*1.6);g.arc(-13,-5,4,Math.PI*.6,Math.PI*2.1);g.closePath();});
  shine(g,-4,-1.5,6,1.2,.5);g.restore();});
art('tr_med',40,g=>{glow(g,0,0,19,'#4ae08a');poly(g,[0,-15,12,-5,8,13,-8,13,-12,-5],'#1fa85a',{hl:.5});ln(g,[-12,-5,-5,-3,5,-3,12,-5],'#7af0aa',1);ln(g,[-5,-3,-8,13],'#0f7a3a',.8);ln(g,[5,-3,8,13],'#0f7a3a',.8);ln(g,[0,-15,-5,-3],'#7af0aa',.8);ln(g,[0,-15,5,-3],'#7af0aa',.8);shine(g,-4,-7,2.5,4,.6);});
art('tr_gory',40,g=>{poly(g,[0,-17,7,-4,4,15,-5,15,-8,-3],'#bfe6ff',{hl:.6});poly(g,[9,-8,14,2,10,12,6,4],'#8ccaf0',{hl:.6});ln(g,[0,-17,-1,15],'rgba(255,255,255,.8)',1);shine(g,-3,-4,1.6,6,.7);});
art('tr_more',40,g=>{shp(g,'#f0a8b0',{hl:.3},[-16,-2,16,15],()=>{g.moveTo(-16,4);g.quadraticCurveTo(0,22,16,4);g.quadraticCurveTo(0,10,-16,4);});
  for(let i=-3;i<=3;i++)ln(g,[0,13,i*4.5,6],'#c86a7a',.7);ell(g,0,-2,8,8,'#f4f0ff',{hl:.6});shine(g,-3,-5,2.5,2,.9);});
art('tr_luk',40,g=>{ell(g,0,4,10,11,'#f0b830',{hl:.55});shp(g,'#8a5a2a',{},[-12,-12,12,-1],()=>{g.moveTo(-11,-1);g.quadraticCurveTo(-12,-11,0,-11);g.quadraticCurveTo(12,-11,11,-1);g.quadraticCurveTo(0,-4,-11,-1);});
  for(let x=-8;x<=8;x+=4)ln(g,[x,-9,x+1,-3],'#6a4018',.8);ln(g,[0,-11,2,-16],'#6a4018',2);shine(g,-4,4,2.5,4,.6);});
art('tr_ogon',40,g=>{glow(g,0,2,19,'#ff7a2a','#ffd84a');poly(g,[-12,4,-7,-9,4,-12,12,-3,10,10,-4,13],'#3a2a2a',{hl:.25});ln(g,[-7,-3,-1,1,3,-6],'#ff8a2a',1.6);ln(g,[-1,1,2,9],'#ffb03a',1.4);ln(g,[3,-6,8,0],'#ff8a2a',1.2);});
art('tr_vihr',40,g=>{for(const [x,y,r] of[[-7,3,8],[6,2,9],[0,-4,9]])ell(g,x,y,r,r*.85,'#eef6ff',{hl:.3,olc:'#9ab8d8'});ell(g,0,5,15,4,'#eef6ff',{ol:false});
  g.beginPath();g.arc(0,0,4,Math.PI*.2,Math.PI*1.7);g.lineWidth=1.6;g.strokeStyle='#7aa0d0';g.stroke();g.beginPath();g.arc(1,0,8,Math.PI*1.2,Math.PI*2.1);g.stroke();});
art('tr_lih',40,g=>{glow(g,0,0,18,'#a06aff');shp(g,'#4a3a7a',{hl:.4},[-12,-15,12,16],()=>{g.moveTo(0,-15);g.quadraticCurveTo(13,-13,11,4);g.quadraticCurveTo(10,13,5,10);g.quadraticCurveTo(3,16,0,11);g.quadraticCurveTo(-3,16,-5,10);g.quadraticCurveTo(-10,13,-11,4);g.quadraticCurveTo(-13,-13,0,-15);});
  eye(g,0,-3,4.2,{px:0,col:'#3a1a5a'});});
art('tr_board',44,g=>{for(const x of[-15,13]){rrect(g,x,-6,3,26,1);g.fillStyle='#8a5a2e';g.fill();outline(g,'#8a5a2e',.8);}
  rrect(g,-19,-18,38,22,2.5);g.fillStyle=grad(g,0,-8,20,'#b07a40');g.fill();outline(g,'#b07a40',1.3);
  for(const [x,y,r] of[[-14,-15,-.1],[-2,-16,.08],[9,-14,-.06]]){g.save();g.translate(x,y);g.rotate(r);rrect(g,0,0,9,11,1);g.fillStyle='#f6eed6';g.fill();outline(g,'#c8b88a',.6);for(let i=0;i<3;i++)ln(g,[2,3+i*2.6,7,3+i*2.6],'#8a7a5a',.7);g.restore();
    g.beginPath();g.arc(x+4.5,y+1,1.1,0,TAU);g.fillStyle='#d8382e';g.fill();}});
art('tr_ped',44,g=>{rrect(g,-14,-6,28,22,3);g.fillStyle=grad(g,0,4,16,'#c8904a');g.fill();outline(g,'#c8904a',1.3);for(const y of[0,7])ln(g,[-14,y,14,y],'#9a6a30',1);
  ln(g,[-10,-6,-6,-18,6,-18,10,-6],'#7a4a22',2);ell(g,-6,-9,4,4,'#d83a3a');ell(g,3,-10,5,4,'#f0c040');ell(g,8,-8,3,3,'#4a9ae0');shine(g,-7,-10,1.2,1,.7);});
art('tr_scroll',40,g=>{rrect(g,-11,-13,22,26,2);g.fillStyle='#f4e6c0';g.fill();outline(g,'#c8a870',1);for(const y of[-13,13])ell(g,0,y,13,3,'#c8904a');for(let i=0;i<4;i++)ln(g,[-7,-7+i*4.5,7,-7+i*4.5],'#a08860',.9);
  g.beginPath();g.arc(0,0,3.5,0,TAU);g.lineWidth=1.4;g.strokeStyle='#4a7ad8';g.stroke();});
// жители: круглое лицо + шапка/платок; o — {skin,hat,hatT:'cap'|'scarf'|'kokosh',beard,hair}
function troResArt(key,o){art(key,56,g=>{ell(g,0,16,15,11,o.body);ell(g,0,-4,12.5,12,o.skin);
  if(o.hair)shp(g,o.hair,{},[-13,-16,13,4],()=>{g.moveTo(-12,2);g.quadraticCurveTo(-14,-14,0,-14);g.quadraticCurveTo(14,-14,12,2);g.quadraticCurveTo(10,-8,0,-9);g.quadraticCurveTo(-10,-8,-12,2);});
  if(o.beard)shp(g,o.beard,{},[-11,0,11,16],()=>{g.moveTo(-10,0);g.quadraticCurveTo(-9,15,0,16);g.quadraticCurveTo(9,15,10,0);g.quadraticCurveTo(0,8,-10,0);});
  if(o.hatT==='cap')shp(g,o.hat,{hl:.35},[-14,-22,14,-8],()=>{g.moveTo(-13,-8);g.quadraticCurveTo(-12,-22,0,-22);g.quadraticCurveTo(12,-22,13,-8);g.closePath();});
  if(o.hatT==='cap')ell(g,0,-8,14,3,o.fur||'#8a5a33');
  if(o.hatT==='kokosh')shp(g,o.hat,{hl:.35},[-13,-26,13,-8],()=>{g.moveTo(-12,-9);g.quadraticCurveTo(-12,-26,0,-26);g.quadraticCurveTo(12,-26,12,-9);g.quadraticCurveTo(0,-13,-12,-9);});
  if(o.hatT==='kokosh')for(const [x,y] of[[-6,-17],[0,-21],[6,-17]]){g.beginPath();g.arc(x,y,1.6,0,TAU);g.fillStyle='#fff6d8';g.fill();}
  eye(g,-4,-4,2.2,{px:0});eye(g,4,-4,2.2,{px:0});mouth(g,0,o.beard?5:3.5,3,'#9a3a2a',1);
  g.beginPath();g.ellipse(-7.5,1,2.2,1.4,0,0,TAU);g.ellipse(7.5,1,2.2,1.4,0,0,TAU);g.fillStyle='rgba(240,110,110,.45)';g.fill();});}
troResArt('tr_r_kuz',{body:'#5a4a3a',skin:'#eec39c',hatT:'cap',hat:'#3a3a44',fur:'#2a2a2a',beard:'#3b2819'});
troResArt('tr_r_frol',{body:'#f0ece0',skin:'#f4c9a3',hatT:'cap',hat:'#e8e0c8',fur:'#c8b890',beard:'#c8b8a0'});
troResArt('tr_r_van',{body:'#3a8ad8',skin:'#f8d4b4',hair:'#e8b64a',hatT:''});
troResArt('tr_r_ale',{body:'#d8313d',skin:'#f8d4b4',hair:'#8a4a22',hatT:'kokosh',hat:'#d8313d'});

/* ---------- для проверки на своей машине ---------- */
const TROX={on:TRO_ON,hub:troHub,give(n){if(!LOCAL)return;for(const id of troOpenIds())TRO_ADD(id,n||20);save();},
  skip(sec){if(!LOCAL)return;const t=TR();if(!t)return;t.ot=t.ot.map(x=>x-sec*1000);save();}};
