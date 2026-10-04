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
GAME.on('change',(n,r,a)=>{if(!n||r!=='ok'||!Array.isArray(a))return;const w=W();const s=GAME.stage();try{
  if(n==='bizOpen'){const o=a[1]||{};STAT.ev('bopen',{t:String(a[0]||''),s,k:o.k&&o.k.def?String(o.k.def):''});if(a[0]==='whs')STAT.ev('opt_open',{kd:String(o.kd||'food').slice(0,6),s});}
  else if(n==='vehAdd'){const o=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('veh_add',{t:o&&o.t==='base'?'truck':'van',kd:o&&o.kd?o.kd:'',n:o?w.biz.filter(x=>x.at===o.id).length:0,s});}   // M39
  else if(n==='vehDel')STAT.ev('veh_del',{h:String(a[1]||'sell').slice(0,4),s});
  else if(n==='optUp'){const o=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('opt_up',{kd:o&&o.kd||'',lv:o?o.up|0:0,s});}
  else if(n==='bizKnob'){const b=w&&w.biz.find(x=>x.id===a[0]);STAT.ev('knob',{t:b?b.t:'',k:String(a[1]||'').slice(0,8),v:String(a[2]).slice(0,10),s});}
  else if(n==='factor')STAT.ev('factor',{p:String(a[0]||'all').slice(0,6),s});
  else if(n==='takeLoan')STAT.ev('loan',{a:mln(a[0]),n:a[1]|0,k:String(a[2]||'').slice(0,6),s});
  else if(n==='pcTake'||n==='pcNo')STAT.ev('pc',{r:n==='pcTake'?'take':'no',s});
  else if(n==='fsTake'||n==='fsNo')STAT.ev('fs',{r:n==='fsTake'?'take':'no',s});}catch(e){}});
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
})();
