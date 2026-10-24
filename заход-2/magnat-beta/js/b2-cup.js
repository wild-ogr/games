/* b2-cup.js — CUP: живая лига hobby-cup «Рост недели» (журнал hobby-analytics/release-b/M50-boost/logs/CUP.md). Стартовый: счёт очков роста (всегда, без сети),
   строки «Сегодня»/утро/⚙, окно итога. Сеть — js/b2-cup-net.js (копия online/cup.js + вход/призы), окно — js/b2-cup-ui.js; оба по требованию.
   Очки роста: закрытый игровой месяц = 10 × рост стоимости ÷ обычный рост главы (0…30). Сервер — только пределы (online/games/magnat.py).
   S.b2c: w неделя МСК, p очки, pw прошлой, m/v/h/ch замер, on в лиге, sv сдано, st когда, lgw забрано, tr/pl/n ступень/место/группа, jw, fr рамки. */
(function(){'use strict';
B2.off.cup=0;          // 1 — выключено по умолчанию
if(B2.off('cup'))return;
const NORM=[.30,.095,.052,.029,.028,.012],FL=5000;   // обычный рост за месяц: подработки, своё дело, сеть, карьер, недра, холдинг №2+ (CUP-tools/growth.sh)
const HAS=typeof document!=='undefined';
const C=()=>B2.s('c');
const now=()=>{try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}};
const mskD=()=>Math.floor((now()+3*3600e3)/864e5);
const week=()=>Math.floor((mskD()+3)/7);   // неделя МСК с понедельника (как wkOf у Обороны)
const Lx=(r,e)=>typeof L==='function'?L(r,e):r;
// глава для нормы и доски «моя глава»: 0 подработки … 4 «Недра», 5 — холдинг №2 и дальше (край — KRAI/MERGE может подменить B2.cup.chOf)
function chOf(W){if(!W)return 0;if(X.chOf!==chOf){const r=X.chOf(W);if(r>=0)return Math.min(15,r|0);}if((W.hold|0)>=2)return 5;
  try{return Math.max(0,Math.min(4,ECON.stI(W)));}catch(e){return 0;}}
function roll(c){const w=week();if(c.w!==w){c.pw=c.w===w-1?Math.floor(c.p||0):0;c.w=w;c.p=0;}}
// замер: месяцы с прошлого замера → очки. Смена холдинга (IPO), откат, первый замер — только новая точка отсчёта
function sample(){const W=typeof GAME!=='undefined'&&GAME.W;if(!W)return;const c=C();roll(c);
  let v=FL;try{v=Math.max(FL,ECON.equity(W));}catch(e){}
  if(c.h!==(W.hold|0)||typeof c.m!=='number'||W.m<c.m||!(c.v>0)){c.m=W.m;c.v=v;c.h=W.hold|0;c.ch=chOf(W);return;}
  const n=W.m-c.m;if(n<1)return;const g=NORM[c.ch]||NORM[5];
  const x=Math.max(0,Math.min(3*n,Math.log(v/c.v)/Math.log(1+g)));
  c.p=Math.round(((c.p||0)+10*x)*10)/10;c.m=W.m;c.v=v;c.ch=chOf(W);
  if(c.on&&X.can()&&Math.floor(c.p)>(c.sv&&c.sv.w===c.w?c.sv.v:0)&&now()-(c.st||0)>20*60e3)net(N=>N.sub());}
// можно ли в сеть: VK с мостом или Яндекс с SDK, не мак/не автомат; ?cup=dev / ?cup=sink:порт — стенд
function can(){if(!HAS)return false;const q=/[?&]cup=(dev|sink:\d+)/.test(location.search);if(q)return true;
  if(!X.URL)return false;try{if(LOCAL||navigator.webdriver||/HeadlessChrome/.test(navigator.userAgent))return false;}catch(e){}
  try{if(PLAT==='vk')return !!window.vkBridge;if(PLAT==='yandex')return !!ysdk;}catch(e){}return false;}
function net(f){if(!X.can())return;B2.need('b2-cup-net.js').then(()=>{if(window.CUPM)f(CUPM);}).catch(()=>{});}
function open(tab){if(!X.can())return;B2.need('b2-cup-net.js').then(()=>B2.need('b2-cup-ui.js')).then(()=>{if(window.CUPM&&CUPM.open)CUPM.open(tab);}).catch(()=>{});}
// итоги прошлых недель, которые ещё не забраны (знает сеть после входа)
function pend(){const M=window.CUPM;return M&&M.claims?M.claims():[];}
const X=B2.cup={NORM,URL:'https://functions.yandexcloud.net/d4e5nfg9u466prmmiooj',chOf,sample,can,net,open,pend,week,pts:()=>{const c=C();roll(c);return Math.floor(c.p||0);}};
B2.sMerge('c',(a,b)=>{a=B2.isObj(a)?a:{};b=B2.isObj(b)?b:{};const A=(a.w|0)>(b.w|0)||((a.w|0)===(b.w|0)&&(a.p||0)>=(b.p||0)),o=Object.assign({},A?b:a,A?a:b);
  o.on=Math.max(a.on|0,b.on|0);o.lgw=Math.max(a.lgw|0,b.lgw|0);o.up=Math.max(a.up|0,b.up|0);o.win=Math.max(a.win|0,b.win|0);o.jw=Math.max(a.jw|0,b.jw|0);o.fr=Object.assign({},b.fr||{},a.fr||{});return o;});
if(typeof GAME!=='undefined'&&GAME.on){GAME.on('close',sample);GAME.on('offline',sample);GAME.on('ipo',sample);}
B2.on('enter',()=>{sample();const c=C();if(c.on&&X.can())setTimeout(()=>net(N=>N.login()),12000);});
// строки: «Сегодня» — лига недели; утро — итог недели; ⚙ — имя и удаление данных
const ord=n=>Lx(n+'-е',n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th'));
B2.slot('today','cup',()=>{if(!X.can())return '';const c=C(),p=X.pts(),M=window.CUPM,lg=M&&M.lg&&M.lg();
  const s=lg&&lg.joined?ord(lg.i||0)+' '+Lx('место из ','place of ')+((lg.rows||[]).length)+' · ':'';
  return `<button class="btn noenter b2cup-row" data-b2="cup:open" style="width:100%;min-height:52px;font-size:17px;text-align:left">🏆 ${Lx('Лига «Рост недели»','League “Weekly growth”')}<br><small style="font-size:15px">${c.on?s+p+' '+Lx('очк. роста','growth pts'):Lx('Соревнуйтесь с другими магнатами — войти','Compete with other tycoons — join')}</small></button>`;},30);
B2.slot('morning','cup',()=>{const p=pend()[0];if(!p)return '';return `<div>🏆 ${Lx('Итог лиги','League result')}: ${ord(p.pl||0)} ${Lx('место','place')}${p.res==='up'?' ▲':p.res==='down'?' ▼':''} <button class="btn noenter" data-b2="cup:take" style="min-height:48px">${Lx('Забрать','Collect')}</button></div>`;},40);
B2.slot('settings','cup',()=>{if(!X.can()||!C().on)return '';const sh=window.CUP&&CUP.shown&&CUP.shown();
  return `<button class="set noenter" data-b2="cup:name"><span>🏆 ${Lx('Лига: показывать моё имя','League: show my name')}</span>${sh?'<i>'+Lx('вкл','on')+'</i>':'<i class="off">'+Lx('выкл','off')+'</i>'}</button>`+
    `<button class="set noenter" data-b2="cup:forget"><span>🗑 ${Lx('Удалить мои данные лиги','Delete my league data')}</span><i>›</i></button>`;});
B2.click('cup',(a)=>{if(a==='open')open();else if(a==='take')net(N=>N.login(()=>N.take()));else if(a==='name'||a==='forget')open(a);});
// призы лиги на виду: рамки портрета Людмилы за первый выход в лигу (Бронзовая и выше) и кубок места 1–3 на полке (S.wall 'cup_lg_<ГГГГ-Wнн>')
const FRS=[[3,'#a0522d','Бронзовая рамка лиги','Bronze league frame'],[4,'#9aa4ae','Серебряная рамка лиги','Silver league frame'],[5,'#d4a017','Золотая рамка лиги','Gold league frame'],[6,'#5bc0de','Алмазная рамка лиги','Diamond league frame']]
  .map(f=>({id:'fr_lg'+f[0],li:f[0],k:'fr',c:f[1],ru:f[2],en:f[3],cr:0}));
X.FRS=FRS;try{if(typeof GAME!=='undefined'&&Array.isArray(GAME.COS))for(const f of FRS)if(!GAME.COS.some(x=>x.id===f.id))GAME.COS.push(f);}catch(e){}
X.info=(k,w)=>{const pl=(w&&w.pl)|0;return {ico:['🏆','🥇','🥈','🥉'][pl]||'🏆',t:Lx('Лига «Рост недели»: '+(pl?ord(pl)+' место':'призёр'),'League “Weekly growth”: '+(pl?ord(pl)+' place':'winner')),
  j:Lx('Росли быстрее соседей по группе — живых магнатов и фирм-соперников.','You grew faster than your group — live tycoons and rival firms.')};};
// окно итога недели — одно за вход (лига — prio 40), только если сеть уже принесла итог
B2.win({id:'cup-week',o:'cup',prio:40,ok:()=>pend().length>0,show:()=>open('week')});
})();
