/* b2-cup-ui.js — CUP «Магнат 2.0»: окно лиги «Рост недели» (по требованию, после js/b2-cup-net.js). Вкладки: Группа · Моя глава · Как считаются очки;
   вид «итог недели» (место, ступень, призы, «Забрать»); показ имени и удаление данных. Шрифт ≥ 17 px, кнопки ≥ 48 px, ru/en. В jsc ничего не делает. */
if(typeof window!=='undefined'&&typeof document!=='undefined'){
window.CUPUI=(function(){'use strict';
const X=B2.cup,M=()=>window.CUPM,C=()=>B2.s('c'),Lx=(r,e)=>L(r,e);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const LGC=['#8d5a2b','#7d8790','#b87333','#a0522d','#9aa4ae','#d4a017','#5bc0de'];
const LAD0={n:['Деревянная','Каменная','Медная','Бронзовая','Серебряная','Золотая','Алмазная'],ne:['Wooden','Stone','Copper','Bronze','Silver','Gold','Diamond'],s:4};
const CHN=[['Подработки','Side jobs'],['Своё дело','Own business'],['Сеть','Chain'],['Карьер','Quarry'],['Недра','Mining'],['Холдинг №2 и дальше','Holding #2+']];
const BOTS=['Бобров и Ко','Топтыгин Групп','Рядышком'],BID=['beav','bear','ryad'];   // соседи сервера = фирмы RIVAL
let tab='grp',cssOk=false;
function css(){if(cssOk)return;cssOk=true;const s=document.createElement('style');s.textContent=
  '.b2cup{font-size:17px}.b2cup .tabs{display:flex;flex-wrap:wrap;margin:8px -3px}.b2cup .tabs .btn{flex:1 1 30%;margin:3px;min-height:48px;font-size:16px;padding:6px 4px}'+
  '.b2cup .tabs .btn.on{background:var(--accent,#c8641e);color:#fff;border-color:transparent}.b2cup .tier{display:inline-block;width:.85em;height:.85em;border-radius:50%;vertical-align:-1px;margin-right:5px;box-shadow:0 0 0 1px rgba(0,0,0,.3) inset}'+
  '.b2cup table{width:100%;border-collapse:collapse}.b2cup td{padding:9px 4px;border-bottom:1px solid var(--line,#d5dbe2);font-size:17px;vertical-align:middle}.b2cup td.n{width:2.2em;text-align:right;color:var(--muted,#4f5d72)}'+
  '.b2cup td.v{text-align:right;white-space:nowrap;font-weight:600}.b2cup tr.me td{background:rgba(200,100,30,.12);font-weight:700}.b2cup .bot{color:var(--muted,#4f5d72);font-size:15px}'+
  '.b2cup .up{color:var(--good,#0a7a3a)}.b2cup .dn{color:var(--bad,#c62828)}.b2cup .note{color:var(--muted,#4f5d72);font-size:16px;margin:8px 0}.b2cup .big{font-size:20px;font-weight:700}'+
  '.b2cup .card{border:1px solid var(--line,#d5dbe2);border-radius:12px;padding:10px 12px;margin:8px 0}.b2cup p{margin:6px 0;line-height:1.35}';
  document.head.appendChild(s);}
const lad=()=>{const l=M()&&M().lg();return l&&l.lad||(window.CUP&&CUP.me()&&CUP.me().lad)||LAD0;};
function tierP(i){const d=lad(),s=Math.max(1,d.s||1),n=(LANG==='en'&&d.ne?d.ne:d.n)||[],li=Math.max(0,Math.min(n.length-1,Math.floor((i||0)/s)));return {li,sub:s>1?s-(i||0)%s:0,nm:n[li]||''};}
function tierH(i){const t=tierP(i);return `<span style="white-space:nowrap"><span class="tier" style="background:${LGC[t.li%LGC.length]}"></span>${esc(t.nm+(t.sub?' '+t.sub:''))}</span>`;}
const rivN=i=>{try{const r=typeof B2.rivals==='function'?B2.rivals(GAME.W):null,x=r&&r.firms&&r.firms.find(f=>f.id===BID[i]);if(x)return LANG==='en'?x.en:x.n;}catch(e){}return null;};
function nm(r){if(r.bot){const i=BOTS.indexOf(r.nm);return (i>=0&&rivN(i))||CUP.nameOf(r);}return r.me?Lx('Вы','You')+(r.nm?' ('+r.nm+')':''):CUP.nameOf(r);}
function left(l){const s=l&&l.wend!=null?l.wend-(Date.now()-l._t)/1000:0;if(!(s>0))return '';const h=Math.max(1,Math.ceil(s/3600));
  return h>=24?Math.floor(h/24)+Lx(' дн. ',' d ')+(h%24)+Lx(' ч',' h'):h+Lx(' ч',' h');}
const ord=n=>LANG==='en'?n+(n%10===1&&n!==11?'st':n%10===2&&n!==12?'nd':n%10===3&&n!==13?'rd':'th'):n+'-е';
function rowsH(rows){return '<table>'+rows.map(r=>`<tr class="${r.me?'me':''}"><td class="n">${r.i}</td><td>${esc(nm(r))}${r.bot?' <span class="bot">· '+Lx('сосед','neighbour')+'</span>':''}</td>`+
  `<td class="v">${r.v}${r.z==='up'?' <span class="up">▲</span>':r.z==='down'?' <span class="dn">▼</span>':''}</td></tr>`).join('')+'</table>';}
const PRZ=()=>`<p class="note">🎁 ${Lx('Призы недели: 1-е место — кубок на полку и','Weekly prizes: 1st — a cup for the shelf and')} ${B2.eco&&B2.eco.cr('cup.p1')?'+'+B2.eco.cr('cup.p1')+' 💎':Lx('кристаллы','gems')}, ${Lx('2–3-е — кубок и кристаллы, до 10-го — кристалл. Новая лига (от Бронзовой) — рамка портрета.','2nd–3rd — a cup and gems, up to 10th — a gem. A new league (Bronze and up) — a portrait frame.')}</p>`;
function grp(l){if(!l)return `<p>${Lx('Подключаемся к лиге…','Connecting to the league…')}</p>`;
  if(!l.joined)return `<p>${Lx('В эту неделю вы ещё не в группе — она появится после первой сдачи очков.','You are not in a group this week yet — it appears after your first points.')}</p>`;
  const n=(l.rows||[]).length;
  return `<p>${tierH(l.tr!=null?l.tr:l.tier)} · ${Lx('группа','group')} ${n} · ${Lx('до итогов','results in')} ${left(l)}</p>`+
    `<p>${Lx('Ваше место','Your place')}: <b class="big">${ord(l.i||0)}</b> · ${Lx('очков роста','growth points')}: <b>${X.pts()}</b></p>`+rowsH(l.rows||[])+
    `<p class="note"><span class="up">▲</span> ${Lx('верхние поднимутся на ступень в понедельник','the top move up a step on Monday')}${l.down?', <span class="dn">▼</span> '+Lx('нижние опустятся','the bottom move down'):''}. ${Lx('«Сосед» — фирма-соперник из игры.','“Neighbour” — a rival firm from the game.')}</p>`+PRZ();}
function chap(r){const ch=X.chOf(GAME.W),t=CHN[Math.min(5,ch)];let h=`<p>${Lx('Рост этой недели среди игроков главы','This week’s growth among players of chapter')} «${esc(Lx(t[0],t[1]))}»:</p>`;
  if(!r)return h+`<p>${Lx('Загружаем…','Loading…')}</p>`;if(!r.top||!r.top.length)return h+`<p>${Lx('Пока никого — сдайте очки первым.','Nobody yet — be the first.')}</p>`;
  return h+rowsH(r.top.map(x=>({i:x.i,v:x.v,nm:x.nm,tg:x.tg,me:x.me})))+(r.me&&r.me.i>r.top.length?`<p>${Lx('Вы','You')}: ${r.me.i} · ${r.me.v}</p>`:'');}
function how(){const N=X.NORM.map(g=>String(Math.round(g*1000)/10).replace('.',LANG==='en'?'.':','));return `<div class="card"><p>${Lx('<b>Очки роста</b> — за каждый закрытый игровой месяц: <b>10 очков</b>, если стоимость компании выросла, как обычно растёт в вашей главе; быстрее — больше (до 30 за месяц), в минус — 0.','<b>Growth points</b> — for every closed game month: <b>10 points</b> if your company value grew as usual for your chapter; faster — more (up to 30 a month), a loss — 0.')}</p>`+
  `<p>${Lx('Обычный рост за месяц','Usual growth per month')}: ${Lx('«Своё дело»','Own business')} ${N[1]} %, ${Lx('«Сеть»','Chain')} ${N[2]} %, ${Lx('«Карьер»','Quarry')} ${N[3]} %, ${Lx('«Недра»','Mining')} ${N[4]} %, ${Lx('холдинг №2','holding #2')} ${N[5]} %. ${Lx('Поэтому новичок и хозяин «Недр» соревнуются честно.','So a newcomer and a mining owner compete fairly.')}</p>`+
  `<p>${Lx('Неделя — с понедельника по воскресенье (по Москве). В группе до 30 игроков; пока людей мало, добавляются фирмы-соперники. В понедельник лучшие поднимаются на ступень, отстающие — опускаются.','A week runs Monday to Sunday (Moscow time). Up to 30 players in a group; while there are few people, rival firms fill in. On Monday the best move up a step, the laggards move down.')}</p>`+
  `<p class="note">${Lx('Ваше имя скрыто («Игрок 4821»), пока вы сами не включите его в ⚙.','Your name is hidden (“Player 4821”) until you turn it on in ⚙.')}</p></div>`+PRZ();}
function week(){const p=M().claims();if(!p.length)return grp(M().lg());const x=p[p.length-1],up=x.res==='up'||x.res==='top',dn=x.res==='down';
  const k=x.pl===1?'cup.p1':x.pl===2?'cup.p2':x.pl===3?'cup.p3':x.pl<=10?'cup.top10':'',cr=k&&B2.eco?B2.eco.cr(k):0;
  return `<div class="card"><p class="big">🏆 ${Lx('Итог недели','Week result')}: ${ord(x.pl||0)} ${Lx('место','place')}${x.nh>1?' · '+Lx('живых игроков в группе: ','live players in the group: ')+(x.nh|0):''}</p>`+
    `<p>${up?'<span class="up">▲</span> '+Lx('Вы поднялись','You moved up')+': ':dn?'<span class="dn">▼</span> '+Lx('Ступень ниже','One step down')+': ':Lx('Ступень та же','Same step')+': '}${tierH(x.to!=null?x.to:x.tr)}</p>`+
    (x.pts!=null?`<p>${Lx('Очков роста за неделю','Growth points this week')}: <b>${x.pts}</b></p>`:'')+
    `<p>${Lx('Призы','Prizes')}: ${[cr?'+'+cr+' 💎':'',x.pl>=1&&x.pl<=3?Lx('кубок на полку','a cup for the shelf'):''].filter(Boolean).join(' · ')||Lx('в этот раз без приза — до 10-го места дают кристалл','no prize this time — up to 10th place gets a gem')}</p></div>`+
    `<button class="btn green noenter" data-b2="cup:ui:take" style="width:100%;min-height:52px;font-size:18px">${Lx('Забрать','Collect')}</button>`;}
function body(){const l=M().lg();if(tab==='week')return week();if(tab==='how')return how();if(tab==='ch')return chap(chR);return grp(l);}
let chR=null;
function draw(){if(!document.getElementById('b2cupW')&&cur)return;cur=1;css();
  const tb=[['grp',Lx('Группа','Group')],['ch',Lx('Моя глава','My chapter')],['how',Lx('Как считаются очки','How points work')]];
  const h=`<div class="b2cup" id="b2cupW"><h2>🏆 ${Lx('Лига «Рост недели»','League “Weekly growth”')}</h2>`+
    (tab==='week'?'':`<div class="tabs">${tb.map(t=>`<button class="btn noenter${tab===t[0]?' on':''}" data-b2="cup:ui:tab:${t[0]}">${t[1]}</button>`).join('')}</div>`)+
    `<div>${body()}</div><div class="row"><button class="btn noenter" data-b2="cup:ui:close" style="min-height:48px">${Lx('Закрыть','Close')}</button></div></div>`;
  modal(h);}
let cur=0;
function open(t){tab=t==='week'||t==='ch'||t==='how'?t:'grp';cur=0;if(t==='name')return name();if(t==='forget')return forget();
  draw();try{STAT.screen&&STAT.screen('cup');}catch(e){}
  M().login(()=>{if(tab==='week'&&!M().claims().length)tab='grp';if(document.getElementById('b2cupW'))draw();});if(tab==='ch')loadCh();}
function loadCh(){chR=null;CUP.top('grow','w@l',r=>{chR=r||{top:[]};if(document.getElementById('b2cupW')&&tab==='ch')draw();},{l:X.chOf(GAME.W)});}
function name(){const on=!CUP.shown();CUP.showName(on);if(on){M().login(()=>{},true);}try{toast(on?Lx('В лиге видно ваше имя','Your name is shown in the league'):Lx('В лиге вы — «Игрок» с номером','In the league you are “Player” with a number'));}catch(e){}
  try{if(typeof openSettings==='function'&&document.querySelector('#mcard [data-b2="cup:name"]'))openSettings();}catch(e){}}
function forget(){modal(`<div class="b2cup"><h2>🗑 ${Lx('Удалить мои данные лиги?','Delete my league data?')}</h2><p>${Lx('Сервер сотрёт ваши результаты, ступень и имя во всех играх двора. Игра и сохранение не пострадают. Войти в лигу можно будет заново.','The server will erase your results, step and name in all our games. Your game and save stay. You can join the league again later.')}</p>`+
  `<div class="row"><button class="btn noenter" data-b2="cup:ui:close" style="min-height:48px">${Lx('Отмена','Cancel')}</button> <button class="btn noenter" data-b2="cup:ui:forget" style="min-height:48px;color:var(--bad,#c62828)">${Lx('Удалить','Delete')}</button></div></div>`);}
B2.click('cup',(a,arg)=>{if(a==='open')return open();if(a==='take')return M().login(()=>M().take());if(a==='name'||a==='forget')return open(a);
  if(a!=='ui')return;const p=arg.split(':');
  if(p[0]==='tab'){tab=p[1];if(tab==='ch')loadCh();draw();}else if(p[0]==='close')hideModal();
  else if(p[0]==='take'){M().take();tab='grp';draw();}
  else if(p[0]==='forget'){CUP.forget(r=>{const c=C();if(r){c.on=0;c.jw=0;c.sv=null;M()._set(null);}try{save();}catch(e){}hideModal();try{toast(r?Lx('Данные лиги удалены','League data deleted'):Lx('Сервер не ответил — попробуйте позже','The server did not answer — try later'));}catch(e){}});}});
return {open,draw};
})();
}
