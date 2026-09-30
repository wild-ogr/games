/* ================= «Из ларька в магнаты: бизнес» — события статистики STAT (js/stat-hooks.js) =================
   Модуль STAT (общий, в js/shell.js) сам шлёт start/day/pause/err. Здесь — события самой игры через GAME.on, без правок модели.
   Глава = «уровень» STAT: пока игрок в главе, pause несёт её номер → видно, в какой главе бросают; переход — end('win') + событие ch.
   Главы (ECON.STAGES): 1 gig «Карьера» (подработки), 2 small «Своё дело», 3 mid (сеть), 4 quarry «Карьер», 5 nedra «Недра».
   События: ch (новая глава: s, n, t — игровых дней, h — номер холдинга), ach (💎 за достижение: k — ключ, c — сколько; z_gig1 — первый заказ,
   z_biz1 — первое дело, z_quarry — карьер, z_nedra — недра, expl/lic/b_<объект> — недра), mile (веха главы), mc (закрытие месяца: m, s, p — знак прибыли, san),
   gig (итог заказа — первые 30 за сеанс: t, ok, w — почему неудача), nedra, ipo (h, m, eq — млн ₽), off (автопилот: d — дней, mo — месяцев, x — продление),
   found/built/auc (недра), reset. Экраны — STAT.screen в UI.go, пролог — pro (open/done/skip) в biz-ui/story-ui, 💎 — spend в GAME.spend,
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
GAME.on('close',rep=>{if(!rep)return;let p=0;try{const n=ECON.netOf(rep.pl);p=n>0?1:n<0?-1:0;}catch(e){}
  STAT.ev('mc',{m:rep.m,s:GAME.stage(),p,san:rep.san?1:0});});
GAME.on('gig',e=>{if(!e||gigN>=30)return;gigN++;const o={t:String(e.t||''),ok:e.ok?1:0};if(!e.ok&&e.why)o.w=String(e.why);STAT.ev('gig',o);});
GAME.on('nedra',()=>{const w=W();STAT.ev('nedra',{t:w?w.t|0:0});});
GAME.on('ipo',rec=>{if(!rec)return;STAT.ev('ipo',{h:rec.hold||1,m:rec.m|0,eq:Math.round((rec.eq||0)/1e6)});STAT.end('win',{m:'ipo'});STAT.lvl(stI('nedra'),'nedra');});
GAME.on('offline',sum=>{if(sum)STAT.ev('off',{d:sum.days|0,mo:sum.months|0,x:sum.ext?1:0});});
GAME.on('found',pid=>{try{const p=ECON.plotById(W(),pid);STAT.ev('found',{g:p&&p.dep?p.dep.g:'',st:p?p.st:''});}catch(e){}});
GAME.on('built',oid=>{try{const o=W().obj.find(x=>x.id===oid);STAT.ev('built',{t:o?o.t:''});}catch(e){}});
GAME.on('auc',(a,res)=>{STAT.ev('auc',{r:String(res||'')});});
chap(); // мир уже создан (ui.js запускает GAME.start раньше этого файла)
})();
