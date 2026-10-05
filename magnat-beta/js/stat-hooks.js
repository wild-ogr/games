/* ================= «Из ларька в магнаты: бизнес» — события статистики STAT (js/stat-hooks.js) =================
   Модуль STAT (общий, в js/shell.js) сам шлёт start/day/pause/err. Здесь — события самой игры через GAME.on, без правок модели.
   Глава = «уровень» STAT: пока игрок в главе, pause несёт её номер → видно, в какой главе бросают; переход — end('win') + событие ch.
   Главы (ECON.STAGES): 1 gig «Карьера» (подработки), 2 small «Своё дело», 3 mid (сеть), 4 quarry «Карьер», 5 nedra «Недра».
   События: ch (новая глава: s, n, t — игровых дней, h — номер холдинга), ach (💎 за достижение: k — ключ, c — сколько; z_gig1 — первый заказ,
   z_biz1 — первое дело, z_quarry — карьер, z_nedra — недра, expl/lic/b_<объект> — недра), mile (веха главы), mc (закрытие месяца: m, s, p — знак прибыли, san),
   gig (итог заказа — первые 30 за сеанс: t, ok, w — почему неудача), nedra, ipo (h, m, eq — млн ₽), off (автопилот: d — дней, mo — месяцев, x — продление),
   found/built/auc (недра), reset, fr (друзья, M18). Экраны — STAT.screen в UI.go, пролог — pro (open/done/skip) в biz-ui/story-ui, 💎 — spend в GAME.spend,
   реклама — place/ad в shell.js и у кнопок, покупки — buy (обёртка PAY в shell.js), соц-кнопки — mod.
   Числа ≥ 7 цифр модуль не чистит, но строки с ними — да: деньги шлём только округлёнными (млн ₽). */
(function(){'use strict';
if(typeof STAT==='undefined'||!window.GAME)return;
const STG=['gig','small','mid','quarry','nedra'],stI=s=>STG.indexOf(s)+1;
let st0=null,gigN=0;
const W=()=>GAME.W;
function chap(){const w=W();if(!w)return;const s=GAME.stage();if(s===st0)return;const was=st0;st0=s;
  if(was&&stI(s)>stI(was)){STAT.end('win',{m:was});STAT.ev('ch',{s,n:stI(s),t:w.t|0,h:w.hold||1});}
  else if(was)STAT.end('quit'); // глава назад — это «Начать заново»
  STAT.lvl(stI(s),s);}
GAME.on('change',chap);GAME.on('day',chap);
GAME.on('reset',()=>{STAT.ev('reset',{s:GAME.stage()});});
GAME.on('cr',(n,why)=>{if(n>0&&why&&why!=='ad'&&why!=='mile'&&why!=='rew')STAT.ev('ach',{k:String(why),c:n});}); // rew — окна наград (событие rw в js/cab-ui.js)
GAME.on('mile',m=>{if(m)STAT.ev('mile',{k:String(m.k||''),c:m.cr||0});});
// M30: в mc — деньги на конец, долг покупателей, минимум денег за месяц (млн ₽, до 0,1), был ли овердрафт
let mnC=null;const mln=x=>Math.round((x||0)/1e5)/10;
GAME.on('day',()=>{const w=W();if(w&&(mnC==null||w.cash<mnC))mnC=w.cash;});
GAME.on('close',rep=>{if(!rep)return;let p=0;try{const n=ECON.netOf(rep.pl);p=n>0?1:n<0?-1:0;}catch(e){}const w=W();let rc=0;try{for(const x of w.rec||[])rc+=x.a;}catch(e){}
  STAT.ev('mc',{m:rep.m,s:GAME.stage(),p,san:rep.san?1:0,c:mln(w?w.cash:0),rc:mln(rc),mn:mln(mnC==null?(w?w.cash:0):mnC),od:w&&w.odM>0?1:0});mnC=null;});
// M30: действия главы 3 «Сеть» — открытие точки (bopen: t, k — отсрочка склада), ручки (knob: t, k, v), факторинг (factor: a — млн, p — часть), кредит (loan: a — млн, n, k),
// подряды и покупатель сети (pc / fs: r — take|no). Через GAME.act → emit('change', имя, итог, аргументы).
// M44: tkGather отвечает числом машин (не 'ok')
GAME.on('change',(n,r,a)=>{if(!n||r!=='ok'&&!(n==='tkGather'&&r>0)||!Array.isArray(a))return;const w=W();const s=GAME.stage();try{
  if(n==='bizOpen'){const o=a[1]||{};STAT.ev('bopen',{t:String(a[0]||''),s,k:o.k&&o.k.def?String(o.k.def):''});if(a[0]==='whs')STAT.ev('opt_open',{kd:String(o.kd||'food').slice(0,6),s});}
  else if(n==='vehAdd'){const o=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('veh_add',{t:o&&o.t==='base'?'truck':'van',kd:o&&o.kd?o.kd:'',n:o?w.biz.filter(x=>x.at===o.id).length:0,s});}   // M39
  else if(n==='vehDel')STAT.ev('veh_del',{h:String(a[1]||'sell').slice(0,4),s});
  else if(n==='optUp'){const o=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('opt_up',{kd:o&&o.kd||'',lv:o?o.up|0:0,s});}
  else if(n==='bizKnob'){const b=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('knob',{t:b?b.t:'',k:String(a[1]||'').slice(0,8),v:String(a[2]).slice(0,10),s});}
  else if(n==='factor')STAT.ev('factor',{p:String(a[0]||'all').slice(0,6),s});
  else if(n==='takeLoan')STAT.ev('loan',{a:mln(a[0]),n:a[1]|0,k:String(a[2]||'').slice(0,6),s});
  else if(n==='pcTake'||n==='pcNo')STAT.ev('pc',{r:n==='pcTake'?'take':'no',s});
  else if(n==='fsTake'||n==='fsNo')STAT.ev('fs',{r:n==='fsTake'?'take':'no',s});
  // M44 (опт, этап 2): Транспортная компания, направления, ТО, контракт с сетью, закупка к сезону — по образцу M39
  if(n==='bizOpen'&&a[0]==='tk')STAT.ev('tk_open',{s,n:w?w.biz.filter(x=>x.t==='van'||x.t==='truck').length:0});
  else if(n==='tkAuto')STAT.ev('tk_auto',{on:a[0]?1:0,s});
  else if(n==='tkGo')STAT.ev('tk_go',{d:String(a[0]||'').replace(/^z\d+$/,'own').slice(0,5),t:String(a[1]||'').slice(0,5),v:+a[2]>0?1:-1,s});
  else if(n==='tkGather')STAT.ev('tk_gather',{n:r|0,s});
  else if(n==='vehTake')STAT.ev('veh_take',{s});
  else if(n==='gazelToTk')STAT.ev('gz_tk',{s});
  else if(n==='baseSnow')STAT.ev('snow',{s});
  else if(n==='vehTO'){const v=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('veh_to',{t:v?v.t:'',s});}
  else if(n==='optCt'){const o=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('opt_ct',{kd:o&&o.kd||'',r:a[1]?'yes':'no',s});}
  else if(n==='bizKnob'&&(a[1]==='sh'||a[1]==='pre')){const b=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('opt_knob',{kd:b&&b.kd||'',k:a[1],v:String(a[2]).slice(0,4),s});}}catch(e){}});
// M30: событие главы 2/3, которое Людмила решила сама (игрок пропустил): ev2/ev3 с auto:1
let evSeen='';GAME.on('day',()=>{try{const w=W(),e=w&&w.ow&&w.ow.lastEv;if(!e||!e.auto)return;const id=e.k+'_'+e.m+'_'+e.i;if(id===evSeen)return;const first=!evSeen;evSeen=id;if(first&&e.m<w.m-1)return;
  STAT.ev(GAME.stage()==='small'?'ev2':'ev3',{e:String(e.k).slice(0,12),i:e.i|0,r:String(e.res||'').slice(0,10),auto:1});}catch(x){}});
GAME.on('gig',e=>{if(!e||gigN>=30)return;gigN++;const o={t:String(e.t||''),ok:e.ok?1:0};if(!e.ok&&e.why)o.w=String(e.why);STAT.ev('gig',o);});
GAME.on('nedra',()=>{const w=W();STAT.ev('nedra',{t:w?w.t|0:0});});
GAME.on('ipo',rec=>{if(!rec)return;STAT.ev('ipo',{h:rec.hold||1,m:rec.m|0,eq:Math.round((rec.eq||0)/1e6)});STAT.end('win',{m:'ipo'});STAT.lvl(stI('nedra'),'nedra');});
GAME.on('offline',sum=>{if(sum)STAT.ev('off',{d:sum.days|0,mo:sum.months|0,x:sum.ext?1:0});});
GAME.on('found',pid=>{try{const p=ECON.plotById(W(),pid);STAT.ev('found',{g:p&&p.dep?p.dep.g:'',st:p?p.st:''});}catch(e){}});
GAME.on('built',oid=>{try{const o=W().obj.find(x=>x.id===oid);STAT.ev('built',{t:o?o.t:''});}catch(e){}});
GAME.on('auc',(a,res)=>{STAT.ev('auc',{r:String(res||'')});});
// M17 (js/owner-ui.js → GAME.emit('o2')): налог (tax: m — режим, w — ip|set), уровень точки (pup: t, n; до M19 — lvl, совпадал с «уровнем» STAT), маркетинг (mk: m — инструмент, r — итог),
// курс героя (edu: c), обучение персонала (stf: w — sell|mast), дело хозяина (job: j), «Режим дня» (reg: n — ступень), ответ на событие главы 2 (ev2: e, i, r); s — глава
GAME.on('o2',o=>{if(!o||!o.k)return;const s=GAME.stage(),x=Object.assign({},o);const k=x.k;delete x.k;x.s=s;const map={lvl:'pup',mk:'mk',edu:'edu',st:'stf',job:'job',reg:'reg',ev:s==='small'?'ev2':'ev3',tax:'tax',mx:'mx'};   // M30: события «Сети» — ev3
  for(const q in x)if(typeof x[q]==='string')x[q]=x[q].slice(0,16);if(map[k])STAT.ev(map[k],x);});
// M18: друзья — fr {k: rel|help|ask|ans|visit|offer|pari|lend|jv|minus, w — друг, d/l — изменение и уровень, p/r/o/t — что именно}; очередь W.fr.sx (js/story.js), не больше 40 за сеанс, мелкие ±1–2 не шлём
let frN=0;
function frDrain(){const w=W(),F=w&&w.fr;if(!F||!Array.isArray(F.sx)||!F.sx.length)return;const a=F.sx.splice(0);
  for(const e of a){if(frN>=40)break;if(!e||e.k==='rel'&&Math.abs(e.d|0)<3)continue;frN++;const o={k:String(e.k||''),w:String(e.w||'')};
    for(const k of ['d','l','a'])if(typeof e[k]==='number')o[k]=e[k]|0;for(const k of ['p','r','o','t'])if(e[k]!=null)o[k]=String(e[k]);STAT.ev('fr',o);}}
GAME.on('change',frDrain);GAME.on('day',frDrain);
chap(); // мир уже создан (ui.js запускает GAME.start раньше этого файла)
// M39: первая связь опта со своими точками (W.lnk.m — месяц, когда связь впервые дала пользу)
GAME.on('close',()=>{try{const w=W(),l=w&&w.lnk;if(!l||l.m<0||l.st)return;l.st=1;STAT.ev('link_first',{a:Math.round((l.sum||0)/1e3),s:GAME.stage()});}catch(e){}});
/* ===== STAT v1.2 (M44, 05.10): «монеты» статистики — 💎 (S.cr). progress/bal при запуске, buy/adReq/hold/adChk/коды межэкранной — в shell.js =====
   earn — откуда 💎 (сводкой при сворачивании): ad (ролики: «Ролики дня», ×2 подарка/посылки, спонсор; награда звания ×2 и подарок за ролик — по флагу adInCb
   «внутри колбэка досмотра» из shell.js), gift (подарок дня), chest (посылки путёвки), lvl (вехи глав, закрытие года, IPO), oth (пари), остальное — quest
   (достижения, поручения дня, квартальные цели, награды званий, уроки, сюжет); buy — payAdd в shell.js. bal — после каждого изменения 💎.
   move — каждое успешное действие игрока (GAME.act с итогом не no/cash/cr/wait/max) и взятый заказ → idle в pause / end quit.
   ready — первый кадр после построения экрана (act считает модуль). cfg — тема, звук, спокойный режим. frame() не зовём: покадрового цикла нет (тик 250 мс).
   offer — показ кнопок «📺 … за рекламу» по местам (те же имена, что у STAT.place при нажатии), раз в 2 с: появилась на экране — +1 показ (модуль шлёт of_<место> с n не чаще раза в 20 с).
   cfm {k:'opt', a: show|yes|no} — подтверждения опта (M41: покупка машины ≥ 1 млн ₽, лишняя машина, продажа) — обёртка BIZUI.h.modalYes; 💎 — cfm {k:'cr'} в ui.js crAsk. */
const EARN={ad:'ad',giftx2:'ad',passx2:'ad',sponsor:'ad',gift:'gift',pass:'chest',mile:'lvl',yearclose:'lvl',ipo:'lvl',pari:'oth'};
GAME.on('cr',(n,why)=>{try{if(n>0){const w=String(why||''),inAd=typeof adInCb!=='undefined'&&adInCb>0;STAT.earn(inAd&&(w==='rew'||w==='gift')?'ad':EARN[w]||'quest',n);}STAT.bal(GAME.cr()|0);}catch(e){}});
const NOMV={no:1,cash:1,cr:1,wait:1,max:1};
GAME.on('change',(n,r)=>{if(n&&r!=null&&r!==false&&!(typeof r==='string'&&NOMV[r]))STAT.move();});
GAME.on('gig',e=>{if(e)STAT.move();});
try{requestAnimationFrame(()=>STAT.once('ready',{ms:Math.round(performance.now())}));}catch(e){STAT.once('ready',{ms:Math.round(performance.now())});}
try{STAT.cfg({th:window.THEME&&THEME.cur?THEME.cur():String(S.th||'soft'),snd:S.sound===false?0:1,calm:typeof calm==='function'&&calm()?1:0});}catch(e){}
// показы кнопок «за рекламу»: ключ кнопки (data-a / data-b / data-ra / data-mt / id) → место, как в STAT.place при нажатии
const OFP={'b:brAd':'breath','b:urgAd':'urg','b:gx2':'x2','b:gchk':'chk','b:promo':'promo','b:bspdAd':'open','b:auditAd':'audit','a:explAd':'expl','a:spdAd':'build','a:expr':'exp',
  'a:conext':'conext','ra:chkAd':'rechk','ra:boost':'reboost','mt:x2':'planx2','mt:giftx2':'planx2','mt:passgx2':'passx2','mt:passx2':'passx2','mt:boost':'boost','mt:lad':'ladder',
  'id:ladFlat':'ladder','id:crAd':'ladder','id:shAd':'ladder','id:rwX2':'rw','id:oExt':'shift','id:bzOx':'shift'};
function ofKey(b){const d=b.dataset||{};for(const k of ['a','b','ra','mt'])if(d[k])return OFP[k+':'+d[k]]||null;if(b.id&&OFP['id:'+b.id])return OFP['id:'+b.id];
  if(d.thbuy||d.th&&String(d.th).indexOf('buy:')===0)return 'theme';return null;}
let ofSeen={};
setInterval(()=>{if(document.hidden||typeof adBtns!=='function')return;const now={};try{const q=adBtns();for(let i=0;i<q.length;i++){if(!q[i].offsetParent)continue;const p=ofKey(q[i]);if(p)now[p]=1;}}catch(e){}
  for(const p in now)if(!ofSeen[p])STAT.offer(p);ofSeen=now;},2000);
// M41: подтверждения опта — opt-ui зовёт BIZUI.h.modalYes (кнопки bzYY «да» / bzYN «нет»)
try{const H=window.BIZUI&&BIZUI.h;if(H&&typeof H.modalYes==='function'&&!H.__st){const m0=H.modalYes;H.__st=1;
  H.modalYes=function(title,text,yes,fn,no){let dn=0;const mark=a=>{if(dn)return;dn=1;STAT.ev('cfm',{k:'opt',a});};STAT.ev('cfm',{k:'opt',a:'show'});
    const r=m0.call(this,title,text,yes,function(){mark('yes');return fn.apply(this,arguments);},no);
    try{const b=document.getElementById('bzYN');if(b)b.addEventListener('click',()=>mark('no'));}catch(e){}return r;};}}catch(e){}
})();
