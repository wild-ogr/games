'use strict';
/* zb3-NUM «Номер-лайт» (24.10.2026, ветка num2410; журнал hobby-analytics/release-i/zina-boost3/NUM.md) — старт (шапка перенесена из js/zb3-num.js, BUILD 25.10: диета старта).
   24.10 (решение владельца): новинки — ВСЕМ (со 2-го дня игры); A/B ниже — только по флагу ?numab=1 / window.ZBNUM_AB=true.
   Опыт A/B только VK и ОК: S.z2v.g 'A' (контроль, всё как было) / 'B' (новинки). Буква — случайная при первом запуске,
   лежит в сохранении (облако → одна буква на всех устройствах; при слиянии побеждает более ранняя gt). Яндекс — группы нет, ничего не меняется.
   В STAT: STAT.ab('vech') (буква в cfg каждого сеанса) + событие vch {a:'grp', g, el, ls, fd, lv, sr} раз за сеанс.
   Новинки (группа B и el=1: 2-й день игры и дальше, S.lv ≥ 5): карточка «Вечёрка у Зины» на Доме, 😂/😐 под репликами Зины,
   шутка на найденное слово, «грамотейка» — всё в js/zb3-num-x.js (лениво, ZB.load). Выключить: ?off=num (флаг ZB2).
   Поле S.z2v {g,gt, d,r,b,n, k,s,o,w, p} — g буква, gt время выдачи; d день последнего решения, r серия дней, b рекорд, n решено рубрик;
   il — последний уровень с «газетной переменой» (п.7); k — день записи s/o/w (биты рубрик 1 Связи 2 Шифровка 4 Красная ручка: s решено, o открыто, w награда), p — ход рубрик сегодня (x-файл).
   ZBNUM: {grp() → 'A'|'B'|'', on() → новинки видны, el(), Z(), ev(a,p), x() → Promise ленивой части}. */
/* zb3-NUM «Вечёрка у Зины» + юмор — ленивая часть (js/zb3-num-x.js; старт — js/zb3-num.js, данные — js/zb3-num-data.js, генерирует
   hobby-analytics/release-i/zina-boost3/num-tools/num_build.py из num-tools/content/*.txt). 24.10.2026, ветка num2410.
   НОМЕР: один на всех в день (номер дня от 2026-01-05 = зерно), рубрики: sv «Связи у Зины» (16 слов → 4 группы, 4 ошибки),
     sh «Шифровка» (шутка «Толкового словаря» цифрами, 5 ошибок), rp «Красная ручка» (найди ошибку в объявлении, 3 ошибки).
     Награда: +10 монет за рубрику сегодняшнего номера (ZBECO.give('vch')), архив — +3 (не больше AR_DAY в день). Серия дней — хоть одна рубрика решена.
   ЮМОР: 😂/😐 под репликой Зины в уровне (#zSay), на Доме (#mSay), под карточкой словаря в окне победы и под шутками номера —
     одна оценка на шутку (localStorage zn-rated); шутка Зины на найденное слово (REACT → шутка словаря; не чаще раза в 12 с и через слово);
     «грамотейка» (GRAM + замены о/а, е/и… → настоящее слово). Вид (VIS, класс html.zn3): контраст пустых клеток, буквы крупнее на мелких клетках.
   STAT: vch {a: show|open|solve|fail|quit|rew|arch, r, t, m, ar, sr, n}; jk {a:'r', id, v (1 😂, 0 😐), s (где)} и {a:'n', n показов, r оценок} при сворачивании.
   Старые WebView: без ?. ?? .at :has. */
(function(){
var W=window.ZBNUM;if(!W||W.ui)return;
var ZAP=100000,Z=W.Z,ev=W.ev,tk=W.tk,dd=W.dd,E0=20260105,N0=20261023,REW=10,AR_REW=3,AR_DAY=5;
var BIT={sv:1,sh:2,rp:4},RUB=['sv','sh','rp'],RN={sv:'Связи у Зины',sh:'Шифровка',rp:'Красная ручка'},RI={sv:'🧩',sh:'🔢',rp:'🖍'};
function D(){return window.ZB3NUM_DATA||null;}
/* реакция Зины на слово: 200 своих (данные) + большой список (js/zb3-num-react.js, ~2800 частых слов кроссвордов, лениво) */
function rx(w){var d=D(),x=window.ZB3NUM_REACT;return (d&&d.react&&d.react[w])||(x&&x[w])||'';}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function snd(){try{SND.tap();}catch(e){}}
function sv(){try{save();}catch(e){}}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function day(k){return dd(E0,k||tk());}
function numTxt(dn){return dn>=ZAP?'запас № '+(dn-ZAP):(dn===day()?'№ ':'архив № ')+issueNo(keyOf(dn));}
function issueNo(k){return Math.max(1,dd(N0,k||tk()));}
function keyOf(dn){var d=new Date(Date.UTC(2026,0,5)+dn*864e5);return d.getUTCFullYear()*1e4+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function shuf(L,r){L=L.slice();for(var i=L.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=L[i];L[i]=L[j];L[j]=t;}return L;}
function h32(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
function coinI(){try{return COIN_I;}catch(e){return '💰';}}
var MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],WD=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
function dateTxt(k){var d=new Date(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100,12);return d.getDate()+' '+MON[d.getMonth()]+', '+WD[d.getDay()];}

/* ---------- состояние дня ---------- */
function T(){var z=Z(),t=tk();if(z.k!==t){z.k=t;z.s=0;z.o=0;z.w=0;z.p={};}return z;}
/* ход рубрики: mk — создать запись (иначе для чтения — пустой объект, без записи в сохранение) */
function P(r,dn,mk){var z=T(),k=r+(dn===day()?'':dn),o=dn!==day()?arch().p:z.p;if(o[k])return o[k];if(!mk)return {};return (o[k]={});}
/* архив (прошлые номера) — на устройстве: решённые номера и ход; облако не грузим (поле ≤1,5 КБ) */
var AR=null;function arch(){if(AR)return AR;try{AR=JSON.parse(localStorage.getItem('zn-arch')||'null');}catch(e){}
  if(!AR||typeof AR!=='object')AR={d:0,n:0,s:{},p:{}};if(!AR.s)AR.s={};if(!AR.p)AR.p={};return AR;}
function arSave(){try{var a=arch(),ks=Object.keys(a.p);if(ks.length>30)ks.slice(0,ks.length-30).forEach(function(k){delete a.p[k];});localStorage.setItem('zn-arch',JSON.stringify(a));}catch(e){}}
function streak(){var z=Z(),t=tk();if(!z.d)return 0;var g=dd(z.d,t);return g<=1?z.r:0;}

/* ---------- содержимое номера по дню ---------- */
function svOf(dn){var d=D();if(!d||!d.sv||!d.sv.length)return null;var n=d.sv.length,i=((dn*17)%n+n)%n;return {i:i,g:d.sv[i]};}
function rpOf(dn){var d=D();if(!d||!d.rp||!d.rp.length)return null;var n=d.rp.length,i=((dn*7+3)%n+n)%n;return {i:i,x:d.rp[i]};}
var SHL=null;
function shList(){if(SHL)return SHL;SHL=[];if(typeof DEFS==='undefined')return SHL;
  Object.keys(DEFS).sort().forEach(function(w){var t=String(DEFS[w]||'');if(w.length<3||t.length<24||t.length>84)return;
    var L={};(w+t).toLowerCase().replace(/ё/g,'е').replace(/[^а-я]/g,'').split('').forEach(function(c){L[c]=1;});
    var hw={};w.replace(/ё/g,'е').split('').forEach(function(c){hw[c]=1;});var left=Object.keys(L).filter(function(c){return !hw[c];}).length;
    if(left>=6&&left<=17)SHL.push(w);});
  return SHL;}
function shOf(dn){var L=shList();if(!L.length)return null;
  /* соседние дни — разные шутки: шаг по списку простым числом */
  var i=((dn*104729)%L.length+L.length)%L.length;var w=L[i];var head=(typeof DEFS_YO!=='undefined'&&DEFS_YO[w])||w;
  return {w:w,t:head.charAt(0).toUpperCase()+head.slice(1)+' — '+DEFS[w]};}

/* ---------- 😂/😐 ---------- */
var RATED=null,SHOWN=0,RATEN=0;
function rated(){if(RATED)return RATED;try{RATED=JSON.parse(localStorage.getItem('zn-rated')||'[]');}catch(e){}if(!(RATED instanceof Array))RATED=[];return RATED;}
function rateHtml(id,src){if(!id)return '';var done=rated().indexOf(id)>=0;SHOWN++;
  return '<span class="znr'+(done?' done':'')+'" data-id="'+esc(id)+'" data-s="'+esc(src||'')+'">'+(done?'<i>спасибо!</i>':'<button type="button" data-v="1" aria-label="Смешно">😂</button><button type="button" data-v="0" aria-label="Не смешно">😐</button>')+'</span>';}
function rate(el,v){var id=el.getAttribute('data-id'),s=el.getAttribute('data-s')||'',L=rated();if(!id||L.indexOf(id)>=0)return;
  L.push(id);if(L.length>600)L.splice(0,L.length-600);try{localStorage.setItem('zn-rated',JSON.stringify(L));}catch(e){}RATEN++;
  try{STAT.ev('jk',{a:'r',id:id.slice(0,40),v:v,s:s});}catch(e){}
  el.className='znr done';el.innerHTML='<i>'+(v?'Записала в «смешное»!':'Учту. Перепишу.')+'</i>';snd();}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('.znr button'):null;if(!b)return;
  e.stopPropagation();e.preventDefault();var r=b.closest('.znr');if(r)rate(r,+b.getAttribute('data-v')===1?1:0);},true);
document.addEventListener('visibilitychange',function(){if(document.hidden&&W.on()&&(SHOWN||RATEN)){try{STAT.ev('jk',{a:'n',n:SHOWN,r:RATEN});}catch(e){}SHOWN=0;RATEN=0;}});
function jid(t){return 'z'+h32(String(t));}

/* ---------- юмор в уровне ---------- */
var HM={t:0,w:0,g:0,used:{}};
function inLevel(){try{return typeof G!=='undefined'&&G&&!G.won&&!G.tut;}catch(e){return false;}}
function humorOk(){return W.on()&&inLevel();}
var curId='',curSrc='';
/* zina(t): реплика → 😂/😐 в конце облачка (id — шутка словаря «d:слово», реакция «r:слово», грамотейка «g:…», иначе «z<хэш текста>») */
function wrapZina(){var f=window.zina;if(typeof f!=='function'||f.__zn)return;var w=function(t,mood,sec){var r=f.apply(this,arguments);
    ZB.safe('zn-say',function(){if(!W.on())return;var e=document.getElementById('zSay');if(!e||!t||(typeof G!=='undefined'&&G&&G.tut))return;
      var id=curId||jid(t),s=curSrc||'lv';curId='';curSrc='';e.insertAdjacentHTML('beforeend',' '+rateHtml(id,s));try{gridDodge();}catch(x){}});
    return r;};w.__zn=1;w.__orig=f;window.zina=w;}
function sayJ(t,id,src,mood,sec){curId=id;curSrc=src;try{zina(t,mood||'happy',sec||6);}catch(e){}curId='';curSrc='';}
function wrapFound(){var f=window.foundWord;if(typeof f!=='function'||f.__zn)return;var w=function(wd,byHint){var rid=false;try{rid=G&&G.rid===wd;}catch(e){}
    var r=f.apply(this,arguments);ZB.safe('zn-found',function(){if(byHint||rid||!humorOk()||!wd)return;HM.w++;
      var left=G.words.filter(function(x){return !x.found;}).length;if(!left)return;
      var now=Date.now();if(now-HM.t<12000||HM.w<2)return;var w0=wd.w,d=D(),t='',id='';
      if(rx(w0)&&!HM.used['r'+w0]){t=rx(w0);id='r:'+w0;}
      else if(typeof DEFS!=='undefined'&&DEFS[w0]&&String(DEFS[w0]).length<=110&&!HM.used['d'+w0]&&Math.random()<.7){var hd=(typeof DEFS_YO!=='undefined'&&DEFS_YO[w0])||w0;t=hd.charAt(0).toUpperCase()+hd.slice(1)+' — '+DEFS[w0];id='d:'+w0;}
      else if(d&&d.wl&&d.wl.length&&Math.random()<.35){var i=Math.floor(Math.random()*d.wl.length);t=d.wl[i];id='w:'+i;}
      if(!t)return;HM.used[id.charAt(0)+w0]=1;HM.t=now;HM.w=0;sayJ(t,id,'word','happy',Math.min(9,2.5+t.length*.06));});
    return r;};w.__zn=1;w.__orig=f;window.foundWord=w;}
/* грамотейка: промах, похожий на настоящее слово с ошибкой (сабака → собака) */
var SUB={'о':'а','а':'о','е':'иая','и':'е','я':'еи','з':'с','с':'з','д':'т','т':'д','б':'п','п':'б','в':'ф','ф':'в','г':'к','к':'г','ж':'ш','ш':'ж'};
function gramOf(w){var d=D();if(d&&d.gram&&d.gram[w])return {r:d.gram[w][0],t:d.gram[w][1],id:'g:'+w};
  if(w.length<4||typeof isWord!=='function')return null;
  for(var i=0;i<w.length;i++){var alt=SUB[w.charAt(i)];if(!alt)continue;for(var j=0;j<alt.length;j++){var c=w.slice(0,i)+alt.charAt(j)+w.slice(i+1);
    try{if(isWord(c)&&!G.words.some(function(x){return !x.found&&x.w===c;}))return {r:c,t:'',id:'gt'};}catch(e){return null;}}}
  return null;}
function gramText(w,g){if(g.t)return g.t;var d=D(),L=d&&d.gramT||[];if(!L.length)return '';var t=L[Math.floor(Math.random()*L.length)];
  return t.replace(/\{w\}/g,'«'+w+'»').replace(/\{r\}/g,'«'+g.r+'»');}
function wrapSubmit(){var f=window.submit;if(typeof f!=='function'||f.__zn)return;var w=function(x){var m0=-1,b0=-1;try{m0=G?G.miss:-1;b0=G?G.bonus.size:-1;}catch(e){}
    var r=f.apply(this,arguments);
    /* бонусное слово: шутка словаря или реплика «на бонус» (не чаще раза в 12 с и не каждое) */
    ZB.safe('zn-bonus',function(){if(!humorOk()||b0<0||G.bonus.size<=b0||!x)return;var now=Date.now();if(now-HM.t<12000||Math.random()<.4)return;
      var d=D(),t='',id='',w0=String(x);
      if(rx(w0)&&!HM.used['r'+w0]){t=rx(w0);id='r:'+w0;}
      else if(typeof DEFS!=='undefined'&&DEFS[w0]&&String(DEFS[w0]).length<=110&&!HM.used['d'+w0]){var hd=(typeof DEFS_YO!=='undefined'&&DEFS_YO[w0])||w0;t=hd.charAt(0).toUpperCase()+hd.slice(1)+' — '+DEFS[w0];id='d:'+w0;}
      else if(d&&d.bl&&d.bl.length){var i=Math.floor(Math.random()*d.bl.length);t=d.bl[i];id='b:'+i;}
      if(!t)return;HM.used[id.charAt(0)+w0]=1;HM.t=now;sayJ(t,id,'bonus','happy',Math.min(9,2.5+t.length*.06));});ZB.safe('zn-gram',function(){if(!humorOk()||m0<0||G.miss<=m0||!x)return;var now=Date.now();if(now-HM.g<20000)return;
      if(typeof dictReady==='function'&&!dictReady())return;var g=gramOf(String(x));if(!g)return;var t=gramText(x,g);if(!t)return;HM.g=now;
      sayJ(t,g.id==='gt'?'gt:'+h32(t):g.id,'gram','stern',Math.min(9,2.5+t.length*.06));
      try{STAT.ev('vch',{a:'gram',w:String(x).slice(0,12),k:g.id==='gt'?0:1});}catch(e){}});
    return r;};w.__zn=1;w.__orig=f;window.submit=w;}
/* реплика на Доме и карточка словаря в окне победы */
function decorate(){if(!W.on())return;var m=document.getElementById('mSay');
  if(m&&!m.__zn){m.__zn=1;var mo=new MutationObserver(function(){if(!W.on()||m.querySelector('.znr')||!m.textContent)return;mo.disconnect();
      m.insertAdjacentHTML('beforeend',' '+rateHtml(jid(m.textContent),'home'));mo.observe(m,{childList:true,characterData:true,subtree:true});});
    mo.observe(m,{childList:true,characterData:true,subtree:true});if(m.textContent&&!m.querySelector('.znr'))m.insertAdjacentHTML('beforeend',' '+rateHtml(jid(m.textContent),'home'));}
  var md=document.getElementById('modal');if(md&&!md.__zn){md.__zn=1;new MutationObserver(function(){ZB.safe('zn-dc',defCards);}).observe(md,{childList:true,subtree:true});}}
function defCards(){if(!W.on())return;var L=document.querySelectorAll('#modal .defcard');for(var i=0;i<L.length;i++){var c=L[i];if(c.querySelector('.znr'))continue;
  var wEl=c.querySelector('.word'),w=wEl?String(wEl.firstChild&&wEl.firstChild.nodeType===3?wEl.firstChild.nodeValue:wEl.textContent).trim().toLowerCase().replace(/ё/g,'е'):'';
  var d=c.querySelector('.def');if(d&&w)d.insertAdjacentHTML('beforeend',' '+rateHtml('d:'+w,'win'));}}

/* ---------- вид (VIS): контраст пустых клеток, буквы крупнее на мелких клетках ветеранов ---------- */
function wrapLayout(){var f=window.layoutGrid;if(typeof f!=='function'||f.__zn)return;var w=function(){var r=f.apply(this,arguments);
    ZB.safe('zn-lay',function(){if(!W.on()||typeof G==='undefined'||!G||!G.cells)return;var big=!!S.big;
      G.cells.forEach(function(c){var e=c.el;if(!e)return;var s=parseFloat(e.style.width)||0;if(s>0&&s<36)e.style.fontSize=Math.round(s*(big?.78:.72))+'px';});});
    return r;};w.__zn=1;window.layoutGrid=w;}

/* ---------- награда, серия ---------- */
function give(n,src){var k=0;try{if(window.ZBECO&&ZBECO.give)k=ZBECO.give(src,n,'mg');else if(typeof addCoins==='function'){addCoins(n,'mg');k=n;}}catch(e){}return k;}
function solved(r,dn,t,m){var today=dn===day(),z=T(),out={c:0,sr:0};
  if(today){var b=BIT[r];if(!(z.s&b)){z.s|=b;z.n++;var t0=tk();if(z.d!==t0){z.r=z.d&&dd(z.d,t0)===1?z.r+1:1;z.d=t0;z.b=Math.max(z.b,z.r);}}
    if(!(z.w&b)){z.w|=b;out.c=give(REW,'vch');}out.sr=z.r;sv();}
  else if(dn>=IL0&&dn<ZAP*3){var a2=arch(),k2=r+dn;if(!a2.s[k2]){a2.s[k2]=1;out.c=give(IL_REW,'vchl');}arSave();}
  else{var a=arch(),key=r+dn;if(!a.s[key]){a.s[key]=1;a.n++;if(a.d!==tk()){a.d=tk();a.c=0;}if((a.c||0)<AR_DAY){a.c=(a.c||0)+1;out.c=give(AR_REW,'vcha');}}arSave();}
  ev('solve',{r:r,t:t,m:m,ar:today?0:dn>=IL0?3:dn>=ZAP?2:1,sr:Z().r});if(out.c)ev('rew',{r:r,c:out.c,ar:today?0:1});return out;}
function failed(r,dn,t,m){if(dn===day()){sv();}else arSave();ev('fail',{r:r,t:t,m:m,ar:dn===day()?0:1});}
function isDone(r,dn){if(dn===day())return !!(T().s&BIT[r])||!!P(r,dn).x;var p=P(r,dn);return !!p.x||!!arch().s[r+dn];}
function stOf(r,dn){var p=P(r,dn);if(dn===day()&&T().s&BIT[r])return 1;if(dn!==day()&&arch().s[r+dn])return 1;return p.x===2?2:0;}

/* ---------- экран ---------- */
var CUR={dn:0,r:'',t0:0,open:false};
function zinaAv(m){try{return zinaSVG(m||'happy');}catch(e){return '';}}
var EDIT=['Номер свёрстан. Опечатки — не мои, это Ять по клавиатуре прошёл.','Свежий номер! Галя прочитала ещё вчера. Как — не спрашивай.',
  'Читай с карандашом. Ручку не дам — красная у меня одна.','В номере три задачки. Решишь — Валентине Петровне ни слова, пусть думает, что трудно.',
  'Дед Семён уже звонил: просил ответы. Не дала. Пусть сам.','Номер вышел! Тамара завернула в него рассаду. Читай, пока не завернула и твой.'];
function hdr(title,sub,back){return '<div class="vc-hd"><button type="button" class="btn ghost small vc-back" data-vc="'+back+'">'+(back==='il'?'Пропустить ›':'‹ '+(back==='home'?'Дом':back==='arch'?'Архив':'Номер'))+'</button>'+
  '<div class="vc-mast"><b>'+title+'</b><small>'+sub+'</small></div></div>';}
function issueHtml(dn){var k=keyOf(dn),today=dn===day(),sr=streak(),h='';
  h+=hdr('Вечёрка у Зины',dn>=ZAP?'Запас № '+(dn-ZAP)+' · отложенный номер':'№ '+issueNo(k)+' · '+dateTxt(k),dn===day()?'home':'arch');
  h+='<div class="scroll vc-body"><div class="vc-paper"><div class="vc-ed"><div class="vc-av">'+zinaAv('happy')+'</div><p><b>От редактора.</b> '+esc(EDIT[(dn%EDIT.length+EDIT.length)%EDIT.length])+'</p></div>';
  if(today)h+='<div class="vc-sr">'+(sr?'🔥 Серия: '+sr+' '+pl(sr,'день','дня','дней')+' подряд':'Реши хоть одну рубрику — начнётся серия дней')+(Z().b>1?' · рекорд '+Z().b:'')+'</div>';
  else h+='<div class="vc-sr">Архив · за рубрику +'+AR_REW+' '+coinI()+'</div>';
  RUB.forEach(function(r){var s=stOf(r,dn),sub=r==='sv'?'Разложи 16 слов на 4 кучки':r==='sh'?'Цифры вместо букв — открой шутку':'Найди ошибку и исправь';
    h+='<button type="button" class="vc-rub'+(s===1?' ok':s===2?' bad':'')+'" data-r="'+r+'"><span class="vc-ri">'+RI[r]+'</span><span class="vc-rt"><b>'+RN[r]+'</b><small>'+sub+'</small></span>'+
      '<em>'+(s===1?'✓ решено':s===2?'✗ не вышло':today?'+'+REW+' '+coinI():'+'+AR_REW+' '+coinI())+'</em></button>';});
  var ad=adOf(dn);if(ad)h+='<div class="vc-ads"><h4>Объявления двора</h4><p>'+esc(ad)+'</p></div>';
  h+='</div>';
  if(today&&RUB.every(function(r){return stOf(r,dn);}))h+='<p class="vc-note">Номер прочитан от корки до корки! Новый — завтра. А пока — <b>архив</b>.</p>';
  h+='<button type="button" class="btn ghost vc-arch" data-vc="arch">📚 Архив номеров</button></div>';return h;}
function adOf(dn){var d=D();if(!d||!d.ads||!d.ads.length)return '';return d.ads[((dn*5+1)%d.ads.length+d.ads.length)%d.ads.length];}
function archHtml(){var t=day(),h=hdr('Архив номеров','решай прошлые — без спешки','home')+'<div class="scroll vc-body"><div class="vc-alist">';
  for(var i=1;i<=30;i++){var dn=t-i,k=keyOf(dn);if(k<N0)break;var n=RUB.filter(function(r){return stOf(r,dn)===1;}).length;
    h+='<button type="button" class="vc-ai" data-dn="'+dn+'"><b>№ '+issueNo(k)+'</b><small>'+dateTxt(k)+'</small><em>'+(n?n+' из 3 ✓':'не начат')+'</em></button>';}
  /* «Запас» — отложенные номера (dn = ZAP+j, содержимое — по кругу из тех же наборов): бесконечно, показываем 6 первых нерешённых */
  h+='</div><p class="vc-note">Ещё задачки — в «Запасе»: номера, которые Зина отложила на чёрный день.</p><div class="vc-alist">';
  for(var j=1,c=0;j<=2000&&c<6;j++){var dz=ZAP+j,nz=RUB.filter(function(r){return stOf(r,dz)===1;}).length;if(nz===3)continue;c++;
    h+='<button type="button" class="vc-ai" data-dn="'+dz+'"><b>Запас № '+j+'</b><small>отложенный номер</small><em>'+(nz?nz+' из 3 ✓':'не начат')+'</em></button>';}
  return h+'</div></div>';}
function render(el,op){css();op=op||{};var dn=op.dn!==undefined?op.dn:day();CUR.dn=dn;
  if(op.arch){el.innerHTML='<div class="vc-scr">'+archHtml()+'</div>';ev('arch',{});}
  else if(op.r){CUR.r=op.r;CUR.t0=Date.now();CUR.open=true;CUR.il=!!op.il;el.innerHTML='<div class="vc-scr">'+hdr(RI[op.r]+' '+RN[op.r],op.il?'газетная перемена перед уровнем '+(dn-IL0+1):numTxt(dn),op.il?'il':'issue')+'<div class="scroll vc-body"><div class="vc-game" id="vcGame"></div></div></div>';
    var g=el.querySelector('#vcGame');if(dn===day()){var z=T();if(!(z.o&BIT[op.r])){z.o|=BIT[op.r];sv();}}
    ev('open',{r:op.r,ar:dn===day()?0:dn>=IL0?3:dn>=ZAP?2:1});ZB.safe('vc-'+op.r,function(){GM[op.r](g,dn);});}
  else{CUR.r='';el.innerHTML='<div class="vc-scr">'+issueHtml(dn)+'</div>';}
  [].forEach.call(el.querySelectorAll('[data-vc]'),function(b){b.onclick=function(){snd();var a=b.getAttribute('data-vc');quit();
    if(a==='il'){if(IL)IL.go();return;}
    if(a==='home'){try{openMenu();}catch(e){ZB.go('home');}}else if(a==='arch')ZB.go('vech',{arch:1});else ZB.go('vech',{dn:CUR.dn});};});
  [].forEach.call(el.querySelectorAll('.vc-rub'),function(b){b.onclick=function(){snd();ZB.go('vech',{dn:dn,r:b.getAttribute('data-r')});};});
  [].forEach.call(el.querySelectorAll('.vc-ai'),function(b){b.onclick=function(){snd();ZB.go('vech',{dn:+b.getAttribute('data-dn')});};});
  try{var sc=el.querySelector('.vc-body');if(sc)sc.scrollTop=0;}catch(e){}}
function quit(){if(CUR.open&&CUR.r&&!isDone(CUR.r,CUR.dn))ev('quit',{r:CUR.r,t:Math.round((Date.now()-CUR.t0)/1000),ar:CUR.dn===day()?0:1});CUR.open=false;}
ZB.on('screen',function(id){if(id!=='zb-vech'){ZB.safe('vc-q',quit);if(IL&&id!=='game')IL=null;}});
function secs(){return Math.round((Date.now()-CUR.t0)/1000);}
function fin(g,r,dn,ok,m,text,id){var h='<div class="vc-fin '+(ok?'ok':'bad')+'"><div class="vc-av">'+zinaAv(ok?'happy':'norm')+'</div><div><p>'+esc(text)+' '+rateHtml(id||jid(text),'num')+'</p>';
  if(ok){var o=solved(r,dn,secs(),m);h+=o.c?'<p class="vc-coin">+'+o.c+' '+coinI()+(o.sr>1&&dn===day()?' · серия '+o.sr+' 🔥':'')+'</p>':'';}else failed(r,dn,secs(),m);
  var nx=CUR.il||CUR.cb?'':RUB.filter(function(x){return x!==r&&!stOf(x,dn);})[0];
  if(CUR.cb){var cb=CUR.cb;CUR.cb=null;CUR.open=false;h+='<div class="vc-btns"><button type="button" class="btn green" data-cb="1">Дальше ▶</button></div></div></div>';g.insertAdjacentHTML('beforeend',h);
    var cbb=g.querySelector('[data-cb]');var res={ok:!!ok,m:m|0,s:secs()};if(cbb)cbb.onclick=function(){snd();cb(res);};try{if(ok)SND.coin();}catch(e){}try{var f2=g.querySelector('.vc-fin');if(f2&&f2.scrollIntoView)f2.scrollIntoView({block:'nearest'});}catch(e){}return;}
  if(CUR.il)h+='<div class="vc-btns"><button type="button" class="btn green" data-il="1">К уровню '+(dn-IL0+1)+' ▶</button></div></div></div>';
  else h+='<div class="vc-btns">'+(nx?'<button type="button" class="btn green" data-nx="'+nx+'">'+RI[nx]+' '+RN[nx]+'</button>':'')+'<button type="button" class="btn ghost" data-nx="">‹ К номеру</button></div></div></div>';
  g.insertAdjacentHTML('beforeend',h);var ilb=g.querySelector('[data-il]');if(ilb)ilb.onclick=function(){snd();if(IL)IL.go();};[].forEach.call(g.querySelectorAll('[data-nx]'),function(b){b.onclick=function(){snd();var x=b.getAttribute('data-nx');ZB.go('vech',x?{dn:dn,r:x}:{dn:dn});};});
  try{var f=g.querySelector('.vc-fin');if(f&&f.scrollIntoView)f.scrollIntoView({block:'nearest'});}catch(e){}
  try{if(ok)SND.coin();}catch(e){}ZB.safe('vc-ref',function(){ZB.refresh();});}
function msg(g,t,cls){var e=g.querySelector('.vc-msg');if(!e)return;e.textContent=t;e.className='vc-msg on '+(cls||'');clearTimeout(msg.t);msg.t=setTimeout(function(){e.className='vc-msg';},2200);}
function hearts(n,max){var s='';for(var i=0;i<max;i++)s+='<i class="'+(i<max-n?'':'x')+'"></i>';return '<span class="vc-hp" title="ошибки">'+s+'</span>';}
var GM={};

/* ---------- «Связи у Зины» ---------- */
var COL=['#f5d76e','#9fd38d','#a9c8f0','#cfa7e6'];
GM.sv=function(g,dn){var o=svOf(dn);if(!o){g.innerHTML='<p>Номер ещё печатается…</p>';return;}var G4=o.g,p=P('sv',dn,1),MX=4;
  if(!p.f)p.f=[];if(!p.m)p.m=0;var all=[];G4.forEach(function(x,i){x[2].forEach(function(w){all.push({w:w,i:i});});});
  var order=shuf(all,rng(dn*31+7)),sel=[],done=!!p.x||stOf('sv',dn)===1;
  function left(){return order.filter(function(x){return p.f.indexOf(x.i)<0;});}
  function draw(){var h='<p class="vc-rule">Найди четыре кучки по четыре слова. Выбери 4 и нажми «Проверить». Ошибок можно '+MX+'.</p>';
    p.f.forEach(function(i){h+='<div class="vc-grp" style="background:'+COL[Math.max(0,Math.min(3,(G4[i][0]|0)-1))]+'"><b>'+esc(G4[i][1])+'</b><small>'+esc(G4[i][2].join(', '))+'</small></div>';});
    if(p.x===2)G4.forEach(function(x,i){if(p.f.indexOf(i)<0)h+='<div class="vc-grp miss"><b>'+esc(x[1])+'</b><small>'+esc(x[2].join(', '))+'</small></div>';});
    if(!done&&p.x!==2){h+='<div class="vc-tiles">'+left().map(function(x,k){return '<button type="button" class="vc-t'+(sel.indexOf(x.w)>=0?' on':'')+(x.w.length>7?' long':'')+'" data-w="'+esc(x.w)+'">'+esc(x.w)+'</button>';}).join('')+'</div>'+
      '<div class="vc-msg"></div><div class="vc-row">'+hearts(p.m,MX)+'<button type="button" class="btn ghost small" data-a="mix">🔀</button><button type="button" class="btn ghost small" data-a="clr">Снять</button>'+
      '<button type="button" class="btn green small" data-a="ok"'+(sel.length===4?'':' disabled')+'>Проверить</button></div>';}
    g.innerHTML=h;
    [].forEach.call(g.querySelectorAll('.vc-t'),function(b){b.onclick=function(){var w=b.getAttribute('data-w'),i=sel.indexOf(w);if(i>=0)sel.splice(i,1);else if(sel.length<4)sel.push(w);snd();draw();};});
    var a=g.querySelector('[data-a="mix"]');if(a)a.onclick=function(){snd();order=shuf(order,Math.random);draw();};
    a=g.querySelector('[data-a="clr"]');if(a)a.onclick=function(){snd();sel=[];draw();};
    a=g.querySelector('[data-a="ok"]');if(a)a.onclick=check;}
  function check(){if(sel.length!==4)return;var cnt={};sel.forEach(function(w){var x=all.filter(function(y){return y.w===w;})[0];cnt[x.i]=(cnt[x.i]||0)+1;});
    var hit=-1,near=false;Object.keys(cnt).forEach(function(k){if(cnt[k]===4)hit=+k;if(cnt[k]===3)near=true;});
    if(hit>=0){p.f.push(hit);sel=[];try{SND.word(5,p.f.length);}catch(e){}sv();arSave();
      if(p.f.length===4){p.x=1;done=true;draw();var L=['Все кучки разложены! Сервант в порядке, слоник на месте.','Разгадал! Галя полдня сидела — а ты раз-два.','Пять! Дед Семён просит списать. Не давай.'];
        fin(g,'sv',dn,true,p.m,L[(dn%3+3)%3],'');return;}
      draw();msg(g,'Есть! «'+G4[hit][1]+'»','ok');return;}
    p.m++;try{SND.bad();}catch(e){}sv();arSave();
    if(p.m>=MX){p.x=2;done=true;draw();fin(g,'sv',dn,false,p.m,'Не беда! Я сама в «Связях» путаюсь: всё у меня связано с котом. Завтра новые.','');return;}
    draw();msg(g,near?'Почти! Одно слово лишнее.':'Не то. Перемешай мысли, как буквы.',near?'warn':'bad');}
  if(stOf('sv',dn)===1&&p.f.length<4)p.f=[0,1,2,3];draw();};

/* ---------- «Шифровка» ---------- */
var ABC='абвгдежзийклмнопрстуфхцчшщъыьэюя'.split('');
GM.sh=function(g,dn){var o=shOf(dn);if(!o){g.innerHTML='<p>Номер ещё печатается…</p>';return;}var p=P('sh',dn,1),MX=5;if(!p.m)p.m=0;if(p.o===undefined)p.o='';
  var text=o.t,low=text.toLowerCase().replace(/ё/g,'е'),letters={};low.replace(/[^а-я]/g,'').split('').forEach(function(c){letters[c]=1;});
  var L=Object.keys(letters),nums=shuf(L.map(function(_,i){return i+1;}),rng(dn*977+5)),NUM={};L.forEach(function(c,i){NUM[c]=nums[i];});
  var open={};o.w.replace(/ё/g,'е').split('').forEach(function(c){open[c]=1;});String(p.o).split('').forEach(function(c){open[c]=1;});
  var pick=0,done=stOf('sh',dn)===1||p.x===1;if(done||p.x===2)L.forEach(function(c){open[c]=1;});
  function allOpen(){return L.every(function(c){return open[c];});}
  function draw(){var h='<p class="vc-rule">Одинаковые цифры — одинаковые буквы. Нажми клетку, потом букву. Ошибок можно '+MX+'.</p><div class="vc-cip">';
    var words=text.split(/\s+/);words.forEach(function(wd){h+='<span class="vc-w">';for(var i=0;i<wd.length;i++){var ch=wd.charAt(i),c=ch.toLowerCase().replace('ё','е');
        if(NUM[c]){var n=NUM[c],op=open[c];h+='<span class="vc-c'+(op?' op':'')+(pick===n?' pk':'')+'" data-n="'+n+'"><b>'+(op?esc(ch.toUpperCase()):'&nbsp;')+'</b><small>'+n+'</small></span>';}
        else h+='<span class="vc-p">'+esc(ch)+'</span>';}h+='</span> ';});
    h+='</div>';
    if(!done&&p.x!==2){h+='<div class="vc-msg"></div><div class="vc-row">'+hearts(p.m,MX)+'</div><div class="vc-kb">'+ABC.map(function(c){return '<button type="button" data-k="'+c+'"'+(open[c]?' class="used"':'')+'>'+c.toUpperCase()+'</button>';}).join('')+'</div>';}
    g.innerHTML=h;
    [].forEach.call(g.querySelectorAll('.vc-c:not(.op)'),function(b){b.onclick=function(){pick=+b.getAttribute('data-n');snd();draw();};});
    [].forEach.call(g.querySelectorAll('.vc-kb button'),function(b){b.onclick=function(){key(b.getAttribute('data-k'));};});}
  function key(c){if(!pick){msg(g,'Сначала нажми клетку с цифрой.','warn');return;}
    var want=L.filter(function(x){return NUM[x]===pick;})[0];
    if(c===want){open[c]=1;p.o=String(p.o)+c;pick=0;try{SND.word(3,1);}catch(e){}sv();arSave();
      if(allOpen()){p.x=1;done=true;draw();fin(g,'sh',dn,true,p.m,'Расшифровал! Это из моего «Толкового словаря». Сама писала, сама смеялась.','d:'+o.w);return;}
      /* следующая закрытая клетка — сама */
      var nx=L.filter(function(x){return !open[x];});pick=0;draw();return;}
    p.m++;try{SND.bad();}catch(e){}sv();arSave();
    if(p.m>=MX){p.x=2;L.forEach(function(x){open[x]=1;});draw();fin(g,'sh',dn,false,p.m,'Не вышло — бывает. Шифровки и у разведчиков не с первого раза. Вот что там было.','d:'+o.w);return;}
    draw();msg(g,'Не та буква. Подумай, что за слово выходит.','bad');}
  draw();};

/* ---------- «Красная ручка» ---------- */
function norm(w){return String(w).toLowerCase().replace(/ё/g,'е').replace(/[^а-яa-z-]/g,'');}
GM.rp=function(g,dn){var o=rpOf(dn);if(!o){g.innerHTML='<p>Номер ещё печатается…</p>';return;}var x=o.x,p=P('rp',dn,1),MX=3;if(!p.m)p.m=0;
  var done=stOf('rp',dn)===1||p.x===1,bad=norm(x[1]),words=x[0].split(/\s+/);
  function draw(){var h='<p class="vc-rule">В объявлении одна ошибка. Найди её и нажми — Зина исправит красной ручкой. Ошибок можно '+MX+'.</p><div class="vc-note2">';
    words.forEach(function(w,i){var isBad=norm(w)===bad;
      if((done||p.x===2)&&isBad){var m=/^([^а-яА-ЯёЁ]*)(.*?)([^а-яА-ЯёЁ]*)$/.exec(w);h+=esc(m[1])+'<span class="vc-fix"><s>'+esc(m[2])+'</s><ins>'+esc(x[2])+'</ins></span>'+esc(m[3])+' ';}
      else h+='<span class="vc-wd'+(String(p.t||'').split(',').indexOf(String(i))>=0?' no':'')+'" data-i="'+i+'">'+esc(w)+'</span> ';});
    h+='</div>';if(!done&&p.x!==2)h+='<div class="vc-msg"></div><div class="vc-row">'+hearts(p.m,MX)+'</div>';
    g.innerHTML=h;if(done||p.x===2)return;
    [].forEach.call(g.querySelectorAll('.vc-wd'),function(b){b.onclick=function(){var i=b.getAttribute('data-i');
      if(norm(words[+i])===bad){p.x=1;done=true;sv();arSave();try{SND.word(5,1);}catch(e){}draw();fin(g,'rp',dn,true,p.m,x[3],'p:'+o.i);return;}
      if(String(p.t||'').split(',').indexOf(i)>=0)return;p.t=(p.t?p.t+',':'')+i;p.m++;try{SND.bad();}catch(e){}sv();arSave();
      if(p.m>=MX){p.x=2;draw();fin(g,'rp',dn,false,p.m,'Ошибка вот где. Ничего: Валерка её третий год не видит.','p:'+o.i);return;}
      draw();msg(g,pkOk[(p.m+dn)%pkOk.length],'bad');};});}
  var pkOk=['Тут всё верно. Ручку убери — пусть отдохнёт.','Это правильно. Ищи дальше, ошибка хитрая.','Тут не придерёшься. Даже завуч бы не придралась.'];
  draw();};

/* ---------- карточка на Доме ---------- */
var shown=0;
/* 24.10 (замечание владельца «перегружено»): карточка = заголовок + строка «№ · дата» + три отметки рубрик + одна кнопка «Читать номер». Всё прочее — внутри номера. */
var RS={sv:'Связи',sh:'Шифровка',rp:'Ручка'};
function card(){if(!W.on())return '';var dn=day(),k=keyOf(dn);
  var marks=RUB.map(function(r){var ok=stOf(r,dn)===1;return '<i class="'+(ok?'ok':'')+'">'+(ok?'✓':'○')+' '+RS[r]+'</i>';}).join('');
  return '<div class="vc-card"><div class="vc-cl"><b>Вечёрка у Зины</b><small>№ '+issueNo(k)+' · '+(k%100)+' '+MON[Math.floor(k/100)%100-1]+'</small></div>'+
    '<div class="vc-pips">'+marks+'</div><button class="btn vc-go" type="button">Читать номер</button></div>';}
ZB.add(ZB.homeSlots,{id:'vech',order:1,zone:'today',render:function(){var h=card();if(h)css();return h;},
  mount:function(el){var c=el&&el.querySelector('.vc-card .vc-go');if(!c)return;if(!shown){shown=1;ev('show',{sr:streak(),n:RUB.filter(function(r){return stOf(r,day())===1;}).length});}
    c.onclick=function(){snd();var dn=day(),all=RUB.every(function(r){return stOf(r,dn);});ZB.go('vech',all?{arch:1}:{dn:dn});};
    }});
/* Z3-PAPER (25.10): рубрика NUM в чужом экране (Z3.rubAdd): W.rub(el, r, {dn, done(res)}) — рисует игру r ('sv'|'sh'|'rp') выпуска dn в el,
   награды/серия — как в номере (сегодня +10, архив +3, «перемена» dn≥IL0 +5); по «Дальше» зовёт done({ok,m,s}) ровно раз. W.dn() — номер дня сегодня, W.IL0. */
W.dn=function(){return day();};W.IL0=200000; /* zb3-CORE: IL0 объявлен ниже (var — ещё undefined), «перемена» из газеты получала dn=NaN */W.ZAP=ZAP;
W.rub=function(el,r,o){css();o=o||{};var dn=o.dn!=null?o.dn:day();if(!GM[r])return false;CUR.dn=dn;CUR.r=r;CUR.t0=Date.now();CUR.open=true;CUR.il=false;
  var called=0;CUR.cb=function(res){if(called++)return;if(o.done)o.done(res);};
  el.innerHTML='<div class="vc-game" id="vcGameR"></div>';var g=el.querySelector('#vcGameR');if(dn===day()){var z=T();if(!(z.o&BIT[r])){z.o|=BIT[r];sv();}}
  ev('open',{r:r,ar:dn===day()?0:dn>=IL0?3:dn>=ZAP?2:1,z3:1});ZB.safe('vc-'+r,function(){GM[r](g,dn);});
  if(stOf(r,dn)&&!g.querySelector('.vc-fin')){var cb=CUR.cb;CUR.cb=null;g.insertAdjacentHTML('beforeend','<div class="vc-btns"><button type="button" class="btn green" data-cb="1">Дальше ▶</button></div>');
    g.querySelector('[data-cb]').onclick=function(){snd();cb({ok:stOf(r,dn)===1,m:0,s:0,again:1});};}
  return true;};
W.done=function(r,dn){return stOf(r,dn==null?day():dn);};
ZB.screen('vech',{title:'Вечёрка у Зины',render:function(el,op){ZB.safe('vc-scr',function(){render(el,op);});}});

/* ---------- п.7(в) «Газетная перемена»: у ветеранов (S.lv ≥ IL_FROM) каждый IL_EVERY-й НОВЫЙ уровень начинается с рубрики из газеты
   (Связи → Шифровка → Красная ручка по кругу; своё содержимое на каждый уровень: dn = IL0 + номер уровня). Решил / не вышло / «Пропустить» → сам уровень.
   Уровни, прогресс и награды за уровень не меняются; за рубрику — +IL_REW монет (ZBECO.give('vchl')). Отметка — S.z2v.il (последний уровень с переменой). */
var IL_FROM=800,IL_EVERY=4,IL0=200000,IL_REW=5,ILR=['sv','sh','rp'];
function ilDue(idx,daily){try{if(daily||!W.on()||(window.MD&&MD.pend))return false;if(W.ilOff&&W.ilOff())return false; /* zb3: смешанные уровни CORE (Z3K) заменяют перемену */var lv=+S.lv||0;if(lv<IL_FROM||idx!==lv)return false;
  if((idx+1)%IL_EVERY)return false;return (+Z().il||0)!==idx+1;}catch(e){return false;}}
var IL=null;
/* zb3: CORE (смешанные уровни, js/zb3-kitchen-x.js) ставит рубрику NUM перед уровнем idx; go() — после «Решил/Не вышло/Пропустить» */
W.ilPlay=function(idx,r,go){IL={idx:idx,r:r,go:function(){IL=null;go();}};try{ZB.go('vech',{dn:IL0+idx,r:r,il:1});}catch(e){IL=null;go();}};
function wrapStart(){var f=window.startLevel;if(typeof f!=='function'||f.__zn)return;var w=function(idx,daily){
    if(ilDue(idx,daily)&&!IL){var r=ILR[Math.floor((idx+1)/IL_EVERY)%3];IL={idx:idx,r:r,go:function(){var z=Z();z.il=idx+1;sv();var a=IL;IL=null;try{w(a.idx,false);}catch(e){}}};
      ev('il',{r:r,l:idx+1});try{ZB.go('vech',{dn:IL0+idx,r:r,il:1});return;}catch(e){IL=null;}}
    return f.apply(this,arguments);};w.__zn=1;w.__orig=f;window.startLevel=w;}
/* ---------- п.7(д) сценка соседей в конце главы: после «Дальше» в окне «Глава пройдена!» — экран сценки, потом как было ---------- */
function sceneOf(c){var d=D();if(!d||!d.sc||!d.sc.length)return null;return d.sc[c%d.sc.length];}
function sceneSeen(c){try{return (localStorage.getItem('zn-sc')||'').split(',').indexOf(String(c))>=0;}catch(e){return false;}}
function sceneMark(c){try{var L=(localStorage.getItem('zn-sc')||'').split(',').filter(Boolean);L.push(String(c));localStorage.setItem('zn-sc',L.slice(-200).join(','));}catch(e){}}
ZB.add(ZB.chapSlots,{id:'zn-scene',order:90,render:function(){return W.on()?'<span hidden></span>':'';}, /* пустое гнездо: mount зовётся только для отрисованных */mount:function(el,ctx){ZB.safe('zn-sc',function(){if(!W.on()||!ctx||!ctx.g||ctx.again)return;
  var c=Math.floor(ctx.g.idx/20),sc=sceneOf(c);if(!sc||sceneSeen(c)||!window.ZBP)return;var b=document.getElementById('mGo');if(!b||b.__zn)return;b.__zn=1;
  b.addEventListener('click',function(e){if(sceneSeen(c))return;e.stopImmediatePropagation();e.preventDefault();sceneMark(c);snd();
    try{hideModal();}catch(x){}ZB.go('scene',{c:c,sc:sc,then:function(){b.__zn=2;try{show('game');}catch(x){}try{b.click();}catch(x){}}});},true);});}});
function sceneRender(el,op){css();var sc=op.sc,h='<div class="vc-scr">'+hdr('🎭 '+esc(sc.t),'сценка конца главы · двор и школа №7','x')+'<div class="scroll vc-body vc-scene">';
  sc.l.forEach(function(x,i){h+='<div class="vc-ln" style="animation-delay:'+(i*0.9)+'s">'+(window.ZBP?ZBP.say(x[0],x[2],x[1]):esc(x[2]))+'</div>';});
  var last=sc.l[sc.l.length-1];h+='<p class="vc-scr-r">'+rateHtml('s:'+sc.n,'scene')+'</p><button type="button" class="btn green vc-sgo">Дальше ▶</button></div></div>';el.innerHTML=h;
  var done=0;function go(){if(done)return;done=1;ev('scene',{n:sc.n,t:secs()});if(op.then)op.then();}CUR.t0=Date.now();
  el.querySelector('.vc-sgo').onclick=function(){snd();go();};var bk=el.querySelector('.vc-back');if(bk){bk.textContent='Пропустить ›';bk.onclick=function(){snd();go();};}}
ZB.screen('scene',{title:'Сценка',render:function(el,op){ZB.safe('zn-scr',function(){sceneRender(el,op||{});});}});

/* ---------- стили ---------- */
var cssOn=0;
function css(){if(cssOn)return;cssOn=1;var s=document.createElement('style');s.textContent=
'.vc-card{margin:6px 0;padding:12px 14px;box-sizing:border-box;border-radius:16px;background:#fff;box-shadow:0 2px 8px rgba(40,30,10,.12);text-align:left}'+
'.vc-cl{display:flex;align-items:baseline;justify-content:space-between;gap:8px;line-height:1.25}.vc-cl b{font:700 18px Georgia,"Times New Roman",serif;color:#1f1a14}.vc-cl small{font-size:13.5px;color:#6b5f4c;white-space:nowrap}'+
'.vc-pips{display:flex;gap:14px;margin:6px 0 10px;font-size:14px;color:#7a6e5c}.vc-pips i{font-style:normal;white-space:nowrap}.vc-pips i.ok{color:#237a3b;font-weight:700}'+
'.btn.vc-go{display:block;width:100%;min-height:46px;margin:0;background:#c2410c;color:#fff;font-weight:700;font-size:17px;border:0;border-radius:12px;cursor:pointer}'+
'.vc-scr{display:flex;flex-direction:column;height:100%;min-height:0;background:#f6f1e3}'+
'.vc-back{white-space:nowrap;flex:0 0 auto}.vc-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:3px double #2b2b2b;background:#fffdf6}'+
'.vc-mast{display:flex;flex-direction:column;min-width:0;line-height:1.15}.vc-mast b{font:700 21px Georgia,"Times New Roman",serif;color:#1f1a14}.vc-mast small{font-size:13.5px;color:#5d5140}'+
'.vc-body{padding:10px 12px 28px;max-width:640px;width:100%;margin:0 auto;box-sizing:border-box}'+
'.vc-paper{background:#fffdf6;border:1px solid #d8ccb0;border-radius:6px;padding:10px 12px;box-shadow:0 2px 6px rgba(60,40,10,.1)}'+
'.vc-ed{display:flex;gap:10px;align-items:center}.vc-av{flex:0 0 58px;width:58px;height:58px}.vc-av svg{width:100%;height:100%}.vc-ed p{margin:0;font-size:15px;line-height:1.35;color:#2b2419}'+
'.vc-sr{margin:8px 0 6px;font-size:14.5px;color:#7a4a12;font-weight:600}'+
'.vc-rub{display:flex;align-items:center;gap:10px;width:100%;margin:8px 0 0;padding:10px 12px;min-height:58px;border:1.5px solid #2b2b2b;border-radius:10px;background:#fff;text-align:left;cursor:pointer;font:inherit;color:inherit}'+
'.vc-rub.ok{background:#eef8ea;border-color:#4c9a4b}.vc-rub.bad{background:#f7efe8}'+
'.vc-ri{font-size:26px;flex:0 0 auto}.vc-rt{flex:1;display:flex;flex-direction:column;line-height:1.25}.vc-rt b{font:700 17px Georgia,serif;color:#1f1a14}.vc-rt small{font-size:13.5px;color:#5d5140}'+
'.vc-rub em{font-style:normal;font-weight:700;font-size:14px;color:#237a3b;white-space:nowrap}.vc-rub.bad em{color:#8a5a3a}'+
'.vc-ads{margin-top:12px;border-top:1px dashed #b8a985;padding-top:8px}.vc-ads h4{margin:0 0 4px;font:700 15px Georgia,serif}.vc-ads p{margin:0;font-size:15px;line-height:1.35;font-style:italic;color:#3a3125}'+
'.vc-note{font-size:14.5px;color:#4d4434;text-align:center;margin:12px 4px}.vc-arch{display:block;margin:12px auto 0;min-height:44px}'+
'.vc-alist{display:flex;flex-direction:column;gap:6px}.vc-ai{display:flex;align-items:center;gap:8px;padding:10px 12px;min-height:48px;border:1.5px solid #2b2b2b;border-radius:10px;background:#fffdf6;font:inherit;text-align:left;cursor:pointer}'+
'.vc-ai b{font:700 16px Georgia,serif;flex:0 0 auto}.vc-ai small{flex:1;color:#5d5140;font-size:13.5px}.vc-ai em{font-style:normal;font-size:13.5px;color:#237a3b;font-weight:700}'+
'.vc-rule{font-size:14.5px;line-height:1.35;color:#3a3125;margin:2px 0 10px}'+
'.vc-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}'+
'.vc-t{min-height:54px;padding:4px 2px;border:1.5px solid #b8a985;border-radius:10px;background:#fffdf6;font-weight:700;font-size:14.5px;line-height:1.1;color:#1f1a14;letter-spacing:.2px;word-break:break-word;cursor:pointer}'+
'.vc-t.long{font-size:12.5px}.vc-t.on{background:#3b5bab;border-color:#2a4790;color:#fff}'+
'.vc-grp{border-radius:10px;padding:8px 10px;margin:0 0 6px;text-align:center;display:flex;flex-direction:column;line-height:1.3}.vc-grp b{font-size:15px;color:#1f1a14}.vc-grp small{font-size:13.5px;color:#2b2419}'+
'.vc-grp.miss{background:#eee6d6;opacity:.9}'+
'.vc-row{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}.vc-row .btn{min-height:44px}.vc-row .btn.green{margin-left:auto}'+
'.vc-hp{display:flex;gap:4px;margin-right:4px}.vc-hp i{width:12px;height:12px;border-radius:50%;background:#c2410c}.vc-hp i.x{background:#d8ccb0}'+
'.vc-msg{min-height:20px;margin-top:8px;font-size:14.5px;text-align:center;color:#5d5140;opacity:0;transition:opacity .2s}.vc-msg.on{opacity:1}.vc-msg.bad{color:#b4321a}.vc-msg.ok{color:#237a3b}.vc-msg.warn{color:#8a5a12}'+
'.vc-cip{line-height:1;font-size:0}.vc-w{display:inline-flex;flex-wrap:nowrap;margin:0 8px 8px 0;vertical-align:top}'+
'.vc-c{display:inline-flex;flex-direction:column;align-items:center;width:23px;margin:0 1px;cursor:pointer}.vc-c b{display:block;width:21px;height:24px;border-bottom:2px solid #2b2b2b;font-weight:700;font-size:18px;line-height:24px;color:#1f1a14;text-align:center}'+
'.vc-c small{font-size:11.5px;color:#5d5140;margin-top:2px}.vc-c.op{cursor:default}.vc-c.op b{color:#237a3b}.vc-c.pk b{background:#ffe08a;border-color:#c2410c}.vc-c.pk small{color:#c2410c;font-weight:700}'+
'.vc-p{display:inline-block;font-weight:700;font-size:18px;line-height:24px;padding:0 1px;color:#1f1a14}'+
'.vc-kb{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin-top:10px}.vc-kb button{min-height:42px;border:1.5px solid #b8a985;border-radius:8px;background:#fffdf6;font-weight:700;font-size:17px;color:#1f1a14;padding:0;cursor:pointer}'+
'.vc-kb button.used{opacity:.35}'+
'.vc-note2{font:17px/1.6 Georgia,"Times New Roman",serif;color:#1f1a14;background:#fffdf6;border:1px solid #d8ccb0;border-radius:6px;padding:12px;box-shadow:2px 2px 0 #e4dac2}'+
'.vc-wd{cursor:pointer;border-radius:4px;padding:1px 0}.vc-wd:active{background:#ffe9c2}.vc-wd.no{text-decoration:underline wavy #9aa6b8;text-underline-offset:4px}'+
'.vc-fix s{color:#b4321a;text-decoration-color:#d9311a;text-decoration-thickness:2px}.vc-fix ins{text-decoration:none;color:#d9311a;font-style:italic;font-weight:700;margin-left:4px;font-family:"Comic Sans MS","Segoe Print",cursive}'+
'.vc-fin{display:flex;gap:10px;align-items:flex-start;margin-top:14px;padding:10px 12px;border-radius:12px;background:#eef8ea;border:1.5px solid #4c9a4b}.vc-fin.bad{background:#f7efe8;border-color:#b8a985}'+
'.vc-fin p{margin:0 0 6px;font-size:15px;line-height:1.35}.vc-fin .vc-coin{font-weight:700;color:#237a3b}.vc-btns{display:flex;flex-wrap:wrap;gap:8px}.vc-btns .btn{min-height:44px}'+
'.vc-scene .vc-ln{opacity:0;animation:vcln .4s ease-out forwards}@keyframes vcln{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'+
'.vc-scene .zbp-bub{font-size:16px}.vc-scr-r{text-align:right;margin:6px 0}.vc-sgo{display:block;margin:12px auto 0;min-width:180px;min-height:48px}'+
'@media (prefers-reduced-motion:reduce){.vc-scene .vc-ln{animation:none;opacity:1}}'+
'.znr{display:inline-flex;gap:4px;vertical-align:middle;margin-left:4px;white-space:nowrap}'+
'.znr button{min-width:38px;height:32px;padding:0 6px;border:1px solid rgba(0,0,0,.12);border-radius:16px;background:rgba(255,255,255,.75);font-size:17px;line-height:1;cursor:pointer}'+
'.znr button:active{transform:scale(.92)}.znr i{font-size:12.5px;color:#5d5140;font-style:italic}'+
'.zina .say .znr button{height:30px;min-width:36px;font-size:16px}'+
/* SKIN 25.10: вид MIX под html.z3 (кожа --z3-*, css/zb3-skin.css); при ?off=zb3 — прежний вид num2410 */
'html.z3 .vc-card{border-radius:var(--z3-r);background:var(--z3-card);box-shadow:var(--z3-shadow);padding:12px 16px 14px;font-family:var(--z3-font)}'+
'html.z3 .vc-cl b,html.z3 .vc-mast b{font:400 23px/1.1 var(--z3-font-paper);color:var(--z3-red)}html.z3 .vc-cl small,html.z3 .vc-mast small{color:var(--z3-ink2)}'+
'html.z3 .vc-pips{gap:6px;flex-wrap:wrap;color:var(--z3-ink2)}html.z3 .vc-pips i{padding:2px 9px;border-radius:12px;background:var(--z3-bg)}html.z3 .vc-pips i.ok{color:var(--z3-ok);background:#eaf6e6}'+
'html.z3 .btn.vc-go{background:var(--z3-acc-grad);color:var(--z3-acc-ink);border-radius:var(--z3-rb);box-shadow:var(--z3-shadow-btn);font-family:var(--z3-font);font-weight:800;min-height:48px;margin-bottom:5px}'+
'html.z3 .vc-scr{background:var(--z3-bg);font-family:var(--z3-font)}html.z3 .vc-hd{background:var(--z3-paper);border-bottom-color:var(--z3-ink)}'+
'html.z3 .vc-paper,html.z3 .vc-note2{background:var(--z3-paper);border-color:var(--z3-line);color:var(--z3-ink)}html.z3 .vc-ed p,html.z3 .vc-rt b,html.z3 .vc-p{color:var(--z3-ink)}'+
'html.z3 .vc-rt small,html.z3 .vc-ai small,html.z3 .vc-msg,html.z3 .vc-c small,html.z3 .vc-note{color:var(--z3-ink2)}html.z3 .vc-ads p,html.z3 .vc-rule{color:var(--z3-ink)}'+
'html.z3 .vc-rub,html.z3 .vc-ai{border-color:var(--z3-line);border-radius:14px;box-shadow:0 2px 0 var(--z3-line)}html.z3 .vc-rub{background:var(--z3-card)}html.z3 .vc-ai{background:var(--z3-paper)}'+
'html.z3 .vc-rub em,html.z3 .vc-ai em,html.z3 .vc-fin .vc-coin{color:var(--z3-ok)}html.z3 .vc-t,html.z3 .vc-kb button{border-color:var(--z3-line);background:var(--z3-paper);color:var(--z3-ink)}'+
'html.z3 .vc-t.on{background:var(--z3-blue);border-color:var(--z3-blue-edge);color:#fff}html.z3 .vc-hp i{background:var(--z3-acc)}html.z3 .vc-hp i.x{background:var(--z3-line)}'+
'html.z3 .vc-ads{border-top-color:var(--z3-line)}html.z3 .vc-ads h4,html.z3 .vc-rt b,html.z3 .vc-ai b{font-family:var(--z3-font-news)}'+
'@media (prefers-reduced-motion:reduce){.vc-msg{transition:none}}';
document.head.appendChild(s);}
/* вид VIS — только когда новинки включены (класс html.zn3) */
function visCss(){if(document.getElementById('znVis'))return;var s=document.createElement('style');s.id='znVis';s.textContent=
  'html.zn3:not(.th-x) .cell{border-color:#8fa6c9}html.zn3:not(.th-x) .cell.open{border-color:#7f9fd6}'+
  /* тост в уровне — внизу, а не на сетке (VIS «наложения»); ПК (две колонки) — как было */
  '@media (max-width:859px){html.zn3.zn3g #toast{top:auto;bottom:calc(env(safe-area-inset-bottom) + 8px);transform:translate(-50%,20px)}html.zn3.zn3g #toast.on{transform:translate(-50%,0)}}';document.head.appendChild(s);}

W.boot=function(){if(W._b)return;W._b=1;css();visCss();
  ZB.load('js/zb3-num-data.js').then(function(){ZB.safe('num-ref2',function(){ZB.refresh();});},function(){});
  ZB.safe('zn-wrap',function(){wrapZina();wrapFound();wrapSubmit();wrapLayout();wrapStart();});
  /* большой список реакций (~360 КБ) — только когда игрок пошёл в уровень */
  var rq=0;function rload(){if(rq||!W.on())return;rq=1;ZB.load('js/zb3-num-react.js').then(function(){},function(){rq=0;});}ZB.on('start',rload);try{if(typeof G!=='undefined'&&G)rload();}catch(e){}
  function cls(){try{document.documentElement.classList.toggle('zn3',!!W.on());}catch(e){}}cls();ZB.on('home',function(){cls();ZB.safe('zn-dec',decorate);});ZB.on('start',cls);ZB.on('screen',function(id){try{document.documentElement.classList.toggle('zn3g',id==='game');}catch(e){}});
  ZB.safe('zn-dec',decorate);};
W.ui=1;W.R={HM:HM,day:day,issueNo:issueNo,keyOf:keyOf,svOf:svOf,shOf:shOf,rpOf:rpOf,stOf:stOf,GM:GM,rate:rate,rated:rated,gramOf:gramOf,arch:arch};
})();
