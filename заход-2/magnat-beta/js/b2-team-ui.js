/* b2-team-ui.js — TEAM: окна «Команды» (грузится по требованию из b2-team.js через B2.need). Модель — B2.team (b2-team.js).
   B2.teamUI: hire(id, fired) — выбор из 3 кандидатов после найма/смены; dir(t) — выбор опердиректора (повысить своего / со стороны);
   open() — окно «👥 Команда»; act(a, arg) — нажатия data-b2="team:<a>:<arg>"; name(v), trait(v) — для других потоков (RIVAL «переманил», KRAI). */
(function(){'use strict';
if(typeof document==='undefined'||!window.B2||!B2.team)return;
const T=B2.team,E=window.ECON;
// запасной вид (пока классы POLISH .b2c не сведены — и под ними не мешает): всё внутри .b2t
(function(){if(document.getElementById('b2tCss'))return;const st=document.createElement('style');st.id='b2tCss';st.textContent=
'.b2t .b2c-who{display:flex;align-items:center;margin-bottom:6px}.b2t .b2c-who b{margin-right:6px}.b2t .b2c-who small{color:var(--muted)}'+
'.b2t .b2c-ava{width:44px!important;height:44px!important;flex:0 0 44px;overflow:hidden;border-radius:50%;background:var(--soft);margin-right:10px}.b2t .b2c-ava svg{width:100%;height:100%}'+
'.b2t .b2o{display:flex;align-items:center;width:100%;text-align:left;min-height:48px;border:1px solid var(--line);border-radius:18px;padding:8px 10px;margin:6px 0;background:var(--card);color:var(--ink);font:inherit;cursor:pointer}'+
'.b2t .b2o.on{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset}.b2t .b2o>span{flex:1;margin-right:8px}.b2t .b2o em{font-style:normal;white-space:nowrap;text-align:right}'+
'.b2t .b2-pos{color:var(--good)}.b2t .b2-neg{color:var(--bad)}.b2t h4{margin:8px 0 4px}.b2t small{font-size:14px}.b2t .b2-row{display:flex;align-items:center;padding:6px 0}.b2t .b2-row>span{flex:1}';
document.head.appendChild(st);})();
// имена: 12 мужских, 12 женских × 24 фамилии (мужская форма; женская — +«а»). Юмор — в фамилиях-предметах и чертах, без намёков на народ, возраст, внешность.
const FN=['Геннадий','Аркадий','Вадим','Станислав','Тимофей','Эдуард','Семён','Филипп','Лев','Олег','Роман','Пётр',
  'Зинаида','Алла','Тамара','Вера','Инна','Лариса','Полина','Ксения','Нина','Жанна','Ольга','Дарья'];
const FE=['Gennady','Arkady','Vadim','Stanislav','Timofey','Eduard','Semyon','Philip','Lev','Oleg','Roman','Pyotr',
  'Zinaida','Alla','Tamara','Vera','Inna','Larisa','Polina','Ksenia','Nina','Zhanna','Olga','Daria'];
const SN=['Пряников','Сухарев','Кукушкин','Самоваров','Ватрушкин','Пончиков','Скрепкин','Калачёв','Утюгов','Кнопкин','Блинов','Чайников',
  'Пуговкин','Огурцов','Синицын','Грибов','Вареников','Звонарёв','Копейкин','Ключиков','Ложкин','Пирожков','Баранкин','Карандашов'];
const SE=['Pryanikov','Sukharev','Kukushkin','Samovarov','Vatrushkin','Ponchikov','Skrepkin','Kalachyov','Utyugov','Knopkin','Blinov','Chaynikov',
  'Pugovkin','Ogurtsov','Sinitsyn','Gribov','Varenikov','Zvonaryov','Kopeykin','Klyuchikov','Lozhkin','Pirozhkov','Barankin','Karandashov'];
const fem=v=>T.nm(v)%24>=12;
function name(v){const q=T.nm(v),f=q%24,s=Math.floor(q/24)%24,w=f>=12;return L(FN[f]+' '+SN[s]+(w?'а':''),FE[f]+' '+SE[s]+(w?'a':''));}
// черты: [м, ж, en, шутка ru, шутка en]
const TX={fast:['Шустрый','Шустрая','Quick','Всё делает бегом: и обслуживает, и роняет.','Does everything at a run — serving and dropping things.'],
  thrift:['Бережливый','Бережливая','Thrifty','Выключает свет даже днём. Торгуется за салфетки.','Switches off lights at noon. Haggles over napkins.'],
  bonus:['Любит премии','Любит премии','Loves bonuses','За премию свернёт горы, без неё — только холмы.','Moves mountains for a bonus, hills without.'],
  honest:['Честный как часы','Честная как часы','Honest as a clock','Сдачу пересчитывает трижды. Вашу тоже.','Counts change three times. Yours too.'],
  care:['Педант','Педант','Stickler','Пять раз проверит, один раз откроет.','Checks five times, opens once.'],
  rookie:['Новичок с огоньком','Новичок с огоньком','Eager rookie','Полгода учится, потом не догнать.','Learns for six months, then can’t be caught.'],
  soul:['Душа компании','Душа компании','Life of the party','Знает всех гостей по именам. И их котов.','Knows every regular by name. And their cats.']};
function trait(v){const k=T.TR[T.tr(v)],x=TX[k];return L(fem(v)?x[1]:x[0],x[2]);}
function quip(v){const x=TX[T.TR[T.tr(v)]];return L(x[3],x[4]);}
const pc=x=>{const p=Math.round((x-1)*100);return (p>0?'+':'−')+Math.abs(p)+L(' %','%');};
// плюс и минус черты словами (числа — из договора)
function pm(v,dirm){const k=T.TR[T.tr(v)],K=T.K;if(dirm&&k==='honest')return [L('товар ','stock cost ')+pc(K('honestD_v')),L('покупателей ','customers ')+pc(K('honestD_d'))];
  switch(k){case 'fast':return [L('покупателей ','customers ')+pc(K('fast_d')),L('неприятностей ×','mishaps ×')+num(K('fast_rk'))];
    case 'thrift':return [L('товар ','stock cost ')+pc(K('thrift_v')),L('покупателей ','customers ')+pc(K('thrift_d'))];
    case 'bonus':return [L(`выручка ${pc(K('bonus_hi'))} при ★ ${num(K('bonus_rt'))}+`,`revenue ${pc(K('bonus_hi'))} at ★ ${num(K('bonus_rt'))}+`),L(`ниже: ${pc(K('bonus_lo'))}`,`below: ${pc(K('bonus_lo'))}`)];
    case 'honest':return [L('недостачи не будет','no shortfalls'),L('покупателей ','customers ')+pc(K('honest_d'))];
    case 'care':return [L('неприятностей ×','mishaps ×')+num(K('care_rk')),L('покупателей ','customers ')+pc(K('care_d'))];
    case 'rookie':return [L(`через ${K('rookie_m')} мес. покупателей ${pc(K('rookie_hi'))}`,`after ${K('rookie_m')} mo. customers ${pc(K('rookie_hi'))}`),L('пока учится ','while learning ')+pc(K('rookie_lo'))];
    case 'soul':return [L('покупателей ','customers ')+pc(K('soul_d')),L('товар ','stock cost ')+pc(K('soul_v'))];}return ['',''];}
const num=x=>String(Math.round(x*100)/100).replace('.',L(',','.'));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const M=x=>FMT.money(x),dM=x=>window.POL&&POL.d?POL.d(x):(x>0?'+':x<0?'−':'')+FMT.money(Math.abs(x));
const snd=k=>{try{if(window.POL&&POL.snd)POL.snd(k);else if(window.SND&&SND[k])SND[k]();}catch(e){}};
const W=()=>GAME.W,bn=t=>E.BIZ[t]?L(E.BIZ[t].n,E.BIZ[t].en):t;
const ptN=(w,b)=>{const a=w.biz.filter(x=>x.t===b.t),n=a.length>1?a.indexOf(b)+1:0;return bn(b.t)+(n?' №'+n:'');};
const ava=v=>`<i class="b2c-ava" style="display:inline-block;line-height:44px;text-align:center;color:var(--ink);font-weight:700;font-style:normal">${esc(name(v).split(' ').map(s=>s[0]).join(''))}</i>`;
const mos=m=>m+' '+pl(m,'месяц','месяца','месяцев','month','months');
function keep(){try{if(typeof save==='function')save();}catch(e){}try{GAME.emit&&GAME.emit('change');}catch(e){}}
// прибыль точки «вам» в месяц с этим человеком (прогноз игры: доля управляющего 30 % уже вычтена)
function fore(w,b,v,dir){const o=T.T(w),k=dir?'d':'p',key=dir?b.t:b.id,sv=o[k]&&o[k][key];(o[k]||(o[k]={}))[key]=v;let p=0;try{p=E.bizForecast(w,b,b.k).prof;}finally{if(sv==null)delete o[k][key];else o[k][key]=sv;}return p;}
function none(w,b,dir){const o=T.T(w),k=dir?'d':'p',key=dir?b.t:b.id,sv=o[k]&&o[k][key];if(o[k])delete o[k][key];let p=0;try{p=E.bizForecast(w,b,b.k).prof;}finally{if(sv!=null)o[k][key]=sv;}return p;}
function gain(w,pts,v,dir){let g=0;for(const b of pts)g+=fore(w,b,v,dir)-none(w,b,dir);return Math.round(g/100)*100;}
function opt(v,act,cur,g,extra,dirm){const [p,m]=pm(v,dirm);
  return `<button class="b2o noenter${cur?' on':''}" data-b2="team:${act}"><span><b>${esc(name(v))}</b>${cur?' <small class="b2-chip">'+L('на смене','on duty')+'</small>':''}${extra||''}<br><small><b>«${esc(trait(v))}»</b> ${esc(quip(v))}</small><br><small><span class="b2-pos">${esc(p)}</span> · <span class="b2-neg">${esc(m)}</span></small></span><em class="${g>=0?'b2-pos':'b2-neg'}"><b class="b2-num">${dM(g)}</b><br><small>${L('в мес.','a mo.')}</small></em></button>`;}
function dec(h4,p,opts,note){return `<div class="b2t"><div class="b2c b2c-dec" style="--who:var(--accent)"><div class="b2c-who">${window.advisorSvg?'<i class="b2c-ava">'+advisorSvg('calm')+'</i>':''}<b>${L('Людмила','Lyudmila')}</b><small>${L('кадры','HR')}</small></div><h4>${esc(h4)}</h4><p>${esc(p)}</p><div class="b2c-opts">${opts}</div>${note?`<small>${esc(note)}</small>`:''}</div></div><div class="row"><button class="btn" data-esc data-b2="team:x">${L('Оставить как есть','Keep as is')}</button></div>`;}
// выбор управляющего (после найма или «сменить»): первый уже работает, можно поменять сразу
function hire(id,fired){const w=W(),b=w&&w.biz.find(x=>x.id===id);if(!b||!b.mgr||w.opd[b.t])return;const o=T.T(w),cur=o.p&&o.p[id];if(cur==null)return;
  const cs=T.cands(w,fired?id+'f':id);if(cs.indexOf(cur)<0)cs[0]=cur;
  const opts=cs.map(v=>opt(v,'pick:'+id+':'+v,v===cur,gain(w,[b],v))).join('');
  modal(`<h2>👥 ${esc(ptN(w,b))}</h2>`+dec(L('Кого ставим управляющим?','Who will run it?'),L('Пришли трое. Первый уже вышел — можно поменять.','Three came in. The first has started — you can swap.'),opts,L('Управляющий берёт 30 % прибыли, как и раньше. Число справа — сколько черта даст вам в месяц.','A manager takes 30% of the profit, as before. The number is what the trait gives you a month.')));
  B2.ev('team','hire',{n:cs.length});}
// опердиректор сети вида t: свои (стаж) + со стороны
function dir(t){const w=W();if(!w||!w.opd[t])return;const o=T.T(w),cur=o.d&&o.d[t];if(cur==null)return;const pts=w.biz.filter(b=>b.t===t&&b.st==='w');
  const ins=T.inside(w,t).map(x=>x.v);let cs=[cur].concat(ins.filter(v=>v!==cur).slice(0,1));for(const v of T.cands(w,'d'+t))if(cs.length<3&&cs.indexOf(v)<0)cs.push(v);
  const own=v=>ins.indexOf(v)>=0||T.m0(v)<w.m?' <small class="b2-chip">'+L('свой','own')+'</small>':'';
  modal(`<h2>👥 ${esc(bn(t))}</h2>`+dec(L('Кто будет директором сети?','Who will direct the chain?'),L(`Черта директора — на все ${pts.length} точек сети.`,`The director’s trait applies to all ${pts.length} outlets.`),cs.map(v=>opt(v,'dpick:'+t+':'+v,v===cur,gain(w,pts,v,1),own(v),1)).join('')));}
// окно «Команда»
function open(){const w=W();if(!w)return;const o=T.T(w),s=B2.s('t');let h='';
  const ds=Object.keys(o.d||{}).filter(t=>w.opd[t]),ps=Object.keys(o.p||{}).map(id=>w.biz.find(b=>b.id===id)).filter(Boolean).sort((a,c)=>T.m0(o.p[a.id])-T.m0(o.p[c.id]));
  const row=(v,where,extra)=>`<div class="b2-row">${ava(v)}<span style="flex:1"><b>${esc(name(v))}</b> · ${esc(trait(v))}<br><small>${esc(where)}</small></span>${extra||''}</div>`;
  if(ds.length)h+=`<h4>${L('Директора сетей','Chain directors')}</h4>`+ds.map(t=>row(o.d[t],bn(t)+' · '+L('с ','since ')+FMT.date(T.m0(o.d[t])),`<button class="btn sm noenter" data-b2="team:dsee:${t}">${L('Сменить','Change')}</button>`)).join('');
  if(ps.length){h+=`<h4>${L('Управляющие','Managers')}</h4>`;const prom={};
    h+=ps.slice(0,12).map(b=>{const v=o.p[b.id],mo=w.m-T.m0(v);let x='';
      if(!prom[b.t]&&w.ooo&&!w.opd[b.t]&&mo>=T.K('dir_m')&&w.biz.filter(y=>y.t===b.t&&y.st==='w').length>=3){prom[b.t]=1;x=`<button class="btn sm noenter" data-b2="team:prom:${b.id}">⬆ ${L('В директора','Promote')}</button>`;}
      return row(v,ptN(w,b)+' · '+(mo>0?mos(mo):L('новенький','new')),x);}).join('');
    if(ps.length>12)h+=`<small>${L('и ещё ','and ')+(ps.length-12)+L('',' more')}</small>`;}
  const vs=Array.isArray(s.v)?s.v:[],cs=Array.isArray(s.c)?s.c:[];
  if(!w.ned&&cs.length)h+=`<h4>⭐ ${L('Перейдут с вами в новый край','Will follow you to the next region')}</h4><small>${L('После IPO лучшие (директора и управляющие со стажем от года) идут за вами.','After the IPO the best (directors and managers with a year’s service) follow you.')}</small>`+cs.map(c=>row(c[0],(c[1]===2?L('директор','director'):L('управляющий','manager'))+' · '+mos(c[2]))).join('');
  if(vs.length)h+=`<h4>⭐ ${L('Ветераны с прошлых холдингов','Veterans from past holdings')}</h4>`+vs.map(c=>{const q=T.VK[T.TR[T.tr(c[0])]];return row(c[0],(c[1]===2?L('директор','director'):L('управляющий','manager'))+(q&&T.used?' · '+vkTxt(q):''));}).join('');
  if(!h)h=`<p>${L('Пока никого: наймите управляющего в точку — придут трое на выбор.','Nobody yet: hire a manager for an outlet — three candidates will come.')}</p>`;
  modal(`<h2>👥 ${L('Команда','Team')}</h2><div class="b2t"><p>${L('У каждого — своя черта: ±2–5 % к делу. Доля управляющего — всё те же 30 %.','Everyone has a trait: ±2–5% to the business. A manager’s share is still 30%.')}</p>${h}</div><div class="row"><button class="btn" data-esc data-b2="team:x">${L('Закрыть','Close')}</button></div>`);
  B2.ev('team','open',{p:ps.length,d:ds.length,v:vs.length});}
function vkTxt(q){const n={build:L('стройка ','construction '),cost:L('постоянные ','fixed costs '),prod:L('добыча ','output '),risk:L('аварии ×','accidents ×')}[q[0]];return n+(q[0]==='risk'?num(q[1]):pc(q[1]));}
function promote(id){const w=W(),b=w&&w.biz.find(x=>x.id===id),o=T.T(w);if(!b||!o.p||o.p[id]==null)return;const v=o.p[id],t=b.t,pts=w.biz.filter(x=>x.t===t&&x.st==='w');
  let cut=0;for(const x of pts)if(x.mgr){try{cut+=E.bizForecast(w,x,x.k).mg||0;}catch(e){}}
  modal(`<h2>⬆ ${esc(name(v))}</h2><p>${esc(L(`Директор сети «${bn(t)}»: оклад ${M(150e3)} в месяц вместо 30 % управляющих (сейчас ≈ ${M(Math.round(cut/1000)*1000)}). Черта «${trait(v)}» — на все ${pts.length} точек.`,`Director of the ${bn(t)} chain: ${M(150e3)} a month instead of the managers’ 30% (now ≈ ${M(Math.round(cut/1000)*1000)}). The “${trait(v)}” trait covers all ${pts.length} outlets.`))}</p><div class="row"><button class="btn" data-esc data-b2="team:x">${L('Не сейчас','Not now')}</button><button class="btn green noenter" data-b2="team:promgo:${id}">${L('Повысить','Promote')}</button></div>`);}
const MSG={hand:()=>L('Нужна свободная рука','A free hand is needed'),ooo:()=>L('Нужно ООО','An LLC is needed'),req:()=>L('Нужно 3 точки вида','3 outlets of this kind needed')};
function act(a,arg){const w=W();if(!w)return;const o=T.T(w);
  if(a==='x'){snd('tap');hideModal();return;}
  if(a==='pick'){const i=arg.lastIndexOf(':'),id=arg.slice(0,i),v=+arg.slice(i+1),b=w.biz.find(x=>x.id===id);if(!b||!b.mgr)return hideModal();
    const was=o.p&&o.p[id];(o.p||(o.p={}))[id]=v;if(T.TR[T.tr(v)]==='honest'){b.hon=5;b.th=0;}else if(was!=null&&T.TR[T.tr(was)]==='honest'){b.hon=1+(T.nm(v)*7+id.length)%5;b.th=0;}
    snd('coin');hideModal();keep();toast(L('На смене: ','On duty: ')+name(v));B2.ev('team','pick',{t:T.tr(v)});return;}
  if(a==='dpick'){const i=arg.lastIndexOf(':'),t=arg.slice(0,i),v=+arg.slice(i+1);if(!w.opd[t])return hideModal();(o.d||(o.d={}))[t]=v;if(o.p)for(const b of w.biz)if(b.t===t)delete o.p[b.id];snd('coin');hideModal();keep();toast(L('Директор: ','Director: ')+name(v));return;}
  if(a==='dsee'){snd('tap');dir(arg);return;}
  if(a==='prom'){snd('tap');promote(arg);return;}
  if(a==='promgo'){const b=w.biz.find(x=>x.id===arg);if(!b||!o.p||o.p[arg]==null)return hideModal();T.setPick({t:b.t,v:o.p[arg]});hideModal();const r=GAME.act('opdHire',b.t,true);T.setPick(null);
    if(r==='ok'){snd('coin');toast(L('Новый директор сети','New chain director'));B2.ev('team','prom',{});}else{snd('no');toast((MSG[r]||(()=>L('Нельзя','Not possible')))());}return;}}
B2.teamUI={hire,dir,open,act,name,trait,quip,pm};
})();
