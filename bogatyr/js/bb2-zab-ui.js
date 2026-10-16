/* ===== bb2-zab-ui.js — ленивая часть договора рекордов «Спор богатырей» (набор 'zrec', грузит ZREC.load()). Поток ZAB, 13.10.2026. =====
   Договор и API — шапка js/bb2-zab.js. Здесь: старые Забавы со счётом (единицы, «средняя рука»), соседи-богатыри, окно итогов с «Ещё разок»,
   старт-карточка ZREC.start, счёт на экране ZREC.hud, «Доска почёта», список ловкостных для экрана Забав. Без ?. ?? .finally. */
/* ================= ДОГОВОР РЕКОРДОВ (заглушка на старте — js/bb2-zab.js, объект ZREC) =================
   ДОГОВОР ДЛЯ ЛОВКОСТНЫХ (LOVA, LOVB, праздничные):
   1) Объявить игру — одна строка на старте в СВОЁМ файле-заглушке (после этого файла); файл игры при этом НЕ грузится:
        ZREC.add('dub',{f:'js/bb2-lov-dub.js', n:['Дуб Соловья','Nightingale’s Oak'], a:['Руби дуб — береги голову','Chop the oak — mind your head'],
                        icon:'ключ ART', u:['полено','полена','поленьев'], ue:['log','logs'], mid:30, md:[20,40,70]});
      f — файл игры или массив файлов (грузятся по порядку перед первой партией через BB2.need; общий набор Забав догрузит рамка);
      n — имя [рус, англ]; a — одна строка «как играть» (старт-карточка и список); icon — ключ ART (значок 96 px);
      u — единица счёта (1, 2, 5), ue — [one, many]; mid — счёт «средней руки» (от него соседи, пока игрок не играл);
      md — пороги медалей [бронза, серебро, золото]; less:1 — «меньше — лучше» (секунды «Ста чучел»: md по убыванию, напр. [90,60,40]);
      max — потолок счёта (необязательно); from — с какого похода открыта в списке (по умолчанию 3, как все Забавы).
      Флаг игры — `lov-<id>` (выключен → игры нет нигде). Id: 2–12 латинских букв/цифр, с буквы.
      Проверка перевода (tools/i18n-scan.py) видит русские слова в n/a/u вне L(…): строку с ZREC.add заканчивать пометкой `// i18n:ru` (английский — вторыми элементами и ue).
   2) Файл игры: ZAB_REG({id:'dub', kind:'lov', n:zabN('Дуб Соловья','Nightingale’s Oak'), run(host,o), sim?(o,k)}) — договор host/o из js/zab-core.js
      (ZABK, zabKeys, zabPC, host.onQuit …). Рисовать только в host.el. Конец партии — host.done({score, extra:{msg:'почему сбился'}}).
      tier можно не давать: ступень = медаль по md. Не дошёл до конца в игре «меньше — лучше» — host.done({score:0, fail:1}).
      Добавки к o: o.again — номер повтора подряд (0 — первая партия; при >0 без заставок), o.first=1 — игрок играет в эту игру впервые
      (покажи 3–4 с «игра играет сама»), o.best — рекорд, o.vs — {n:имя, sc:счёт} вызов друга (или null), o.unit(n) → '12 поленьев'.
      Общая рамка (после ZREC.load, в run она уже есть): ZREC.start(host,o,fn) — старт-карточка (имя, «как играть», рекорд, ближайший сосед;
      Enter/тап → fn(); при o.again>0 зовёт fn сразу); ZREC.hud(host,o) → {set(n), end()} — счёт крупно + «рекорд 19» / «Алёша 23» / «Новый рекорд!».
      Всё остальное делает рамка: рекорд, медаль, соседи-богатыри, окно итогов с «Ещё разок» (Enter) и «Хватит» (Esc), награда первой партии дня,
      STAT и событие шины. Игре свои ключи S.* заводить НЕЛЬЗЯ: своё — ZREC.x(id) (объект ≤60 знаков JSON; после правки ZREC.touch()).
   3) Запуск откуда угодно: ZREC.play(id,{src:'menu'|'map'|'lose'|'link'|'boss'|…, back:function(out){}, vs:{n,sc}, quiet:1, seed, train:1}) → Promise.
      Сам догружает Забавы, рамку и файл игры. quiet:1 — без окна итогов (сразу back(out), для «Троеборья»). Первая партия дня — с наградой, дальше — на рекорд.
      out = {score,tier,rec,best,train,items,…, zr:{rec,prev,best,first,medal,up,place,of,gap:{id,nm,n}|null}}.
   API: ZREC.on() · ZREC.add · ZREC.ids() · ZREC.info(id) → {id,n,a,icon,lov,…} · ZREC.has(id) · ZREC.isOpen(id) · ZREC.best(id) · ZREC.medal(id) 0..3 ·
        ZREC.tier(id,sc) · ZREC.unit(id,n) · ZREC.name(id) · ZREC.x(id) · ZREC.touch() · ZREC.load() → Promise · ZREC.play ·
        после load: ZREC.table(id[,sc]) → [{id,nm,sc,me,pl}] (все 9: ты и 8 богатырей, по местам) · ZREC.gap(id) · ZREC.start · ZREC.hud · ZREC.board() (Доска почёта).
   Событие шины после КАЖДОЙ партии (и старых Забав): BB2.hook('zab',function(e){…}), e = {id,sc,tier,rec,medal,up,train,src,t секунд,lov,n партий всего}.
   Флаги: zrec (рамка и «Ещё разок»), lov-<id>, prival («Привал» на карте вместо приглашения в окне победы), warm (разминка после поражения),
          zabsoft (мягче Скачки/Травы/Городки), zabtop (экран и плитка Забав выше края). Сохранение: S.bb2.zab (ниже).
   STAT: zab {a:'again',id,n} · {a:'rec',id,sc,pl} · {a:'medal',id,m} · end получает t (секунды партии). */
(function(){
var Z=ZREC;if(Z.ui)return;
var PE=['point','points'];
var PT=['очко','очка','очков']; // i18n:ru
/* старые Забавы со счётом: mid — «средняя рука» (между ботом bad и mid, ZAB-tools/botold.py: живые игроки слабее бота mid), max — потолок счёта.
   Ступень/медаль даёт сама игра (tier). Без рамки: Загадки (noRec), Три сундука (выбор), Клад (копают по клетке в день). */
var SOFT=BB2.on('zabsoft');   /* мягкие Травы (35 с) и Городки (3 фигуры) — счёт ниже */
var OLD={nakoval:[16],travy:[SOFT?330:430],gorodki:[12,SOFT?24:0,'r'],luk:[26],kanat:[80,125],chastokol:[24],igla:[3,5],skachki:[35,0,'p'],kulak:[6],gadanie:[100],pech:[78,100]};
var UN={r:[['рюха','рюхи','рюх'],['pin','pins']],p:[['подкова','подковы','подков'],['horseshoe','horseshoes']]}; // i18n:ru
for(var k0 in OLD){var u0=UN[OLD[k0][2]];Z.old(k0,{u:u0?u0[0]:PT,ue:u0?u0[1]:PE,mid:OLD[k0][0],max:OLD[k0][1]||0});}

/* ---------- соседи: богатыри, которыми игрок сейчас не играет. Счёт честный и постоянный на неделю (зерно: игра|богатырь|неделя):
   шестеро «ровных» — от опоры ×(0,6…1,3), у каждой игры свой порядок; Алёша хвастает — на 5–12 % выше рекорда игрока, обошли — отвечает на другой день;
   Илья растёт: +4 % в неделю с первой партии игрока (от ×0,7 до ×1,16); Иван-дурак — то последний, то (3 дня из 10) первый.
   Опора — «средняя рука» игры, а у игравшего — среднее геометрическое её и рекорда игрока (сильному — сильные соседи). ---------- */
var KS=[.6,.75,.88,1,1.12,1.3];
var GEN={dob:'Добрыни',ale:'Алёши',ily:'Ильи',vas:'Василисы',sad:'Садко',mik:'Микулы',vol:'Вольги',mar:'Марьи',iva:'Ивана-дурака'}; // i18n:ru
function rn(s){s=String(s);var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h=Math.imul(h^h>>>15,1|h);h^=h+Math.imul(h^h>>>7,61|h);return ((h^h>>>14)>>>0)/4294967296;}
function dn(){var d=new Date(dayMs());return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);}
function wk(){try{return weekNo();}catch(e){return 0;}}
function short(h){return String(h.name).split(' ')[0];}
function esc(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
function capS(c,v){v=Math.max(1,Math.round(v));if(c.max&&!c.less)v=Math.min(c.max,v);return v;}
function ale(id,c,best,ref){if(!best)return capS(c,c.less?ref/1.1:ref*1.1);   /* пока игрок не играл — чуть выше «средней руки», в сохранение не пишем */
  var q=Z.rec(id),d=dn(),beat=q.a&&(c.less?best<=q.a:best>=q.a);
  if(!q.a||beat&&(q.ad|0)<d){var f=1.05+.07*rn(id+'|a|'+d);q.a=c.less?Math.max(1,Math.min(best-1,Math.floor(best/f))):capS(c,Math.max(best+1,Math.ceil(best*f)));q.ad=d;}
  return q.a;}
Z.table=function(id,cur){var c=Z.info(id);if(!c)return [];var best=Z.best(id),me=best||Math.max(0,Math.round(+cur||0)),mid=c.mid||10,w=wk(),d=dn(),q=Z.rec(id);
  var ref=best?Math.max(mid*.6,Math.min(mid*3,Math.sqrt(mid*best))):mid,hs=[],i,h,k,reg=[];
  for(i=0;i<HEROES.length;i++)if(HEROES[i].id!==S.hero)hs.push(HEROES[i]);
  for(i=0;i<hs.length;i++)if(hs[i].id!=='ale'&&hs[i].id!=='ily'&&hs[i].id!=='iva')reg.push(hs[i].id);
  reg.sort(function(a,b){return rn(id+'|'+a)-rn(id+'|'+b);});
  var rows=[];for(i=0;i<hs.length;i++){h=hs[i];var sc;
    if(h.id==='ale')sc=ale(id,c,best,ref);
    else{if(h.id==='ily')k=.7+.04*Math.min(10,Math.max(0,w-(q.w0||w)))+.01*((d+3)%7);
      else if(h.id==='iva')k=rn(id+'|iva|'+d)<.3?1.45:.35+.2*rn(id+'|iv2|'+d);
      else k=KS[reg.indexOf(h.id)%KS.length]*(.93+.14*rn(id+'|'+h.id+'|'+w));
      sc=capS(c,c.less?ref/k:ref*k);}
    rows.push({id:h.id,nm:short(h),sc:sc});}
  rows.push({id:'me',nm:L('Ты','You'),sc:me,me:1});
  rows.sort(function(a,b){if(!a.sc!==!b.sc)return a.sc?-1:1;if(a.sc!==b.sc)return c.less?a.sc-b.sc:b.sc-a.sc;return a.me?-1:b.me?1:0;});
  for(i=0;i<rows.length;i++)rows[i].pl=i+1;return rows;};
function gapOf(id,t){var c=Z.info(id),i,m=-1;for(i=0;i<t.length;i++)if(t[i].me)m=i;if(m<=0)return null;var a=t[m-1];
  return {id:a.id,nm:a.nm,gen:L(GEN[a.id]||a.nm,a.nm),n:t[m].sc?Math.max(1,Math.abs(a.sc-t[m].sc)):0,sc:a.sc};}
Z.gap=function(id,cur){return gapOf(id,Z.table(id,cur));};
Z.place=function(id,zr,sc){var t=Z.table(id,sc),i;zr.tab=t;zr.of=t.length;for(i=0;i<t.length;i++)if(t[i].me)zr.place=i+1;zr.gap=gapOf(id,t);return zr;};

/* ---------- стиль ---------- */
function css(){if(document.getElementById('zrCss'))return;var s=document.createElement('style');s.id='zrCss';s.textContent=
 '.zrP .zabScore{font-size:46px}.zrP .zabScore small{font-size:19px;font-weight:800;margin-left:6px;text-shadow:none}'+
 '.zrP .zabStars{margin:0 0 2px}.zrP .zabStars i{font-size:32px}.zrP>h3{margin-bottom:6px}'+
 '.zrLn{text-align:center;font-weight:800;font-size:15px;margin:2px 0 5px}.zrLn b{font-weight:900}'+
 '.zrT{margin:4px 0 6px}.zrT div{display:flex;align-items:center;gap:8px;padding:2px 10px 2px 6px;border-radius:10px;font-weight:800;font-size:15px;min-height:30px}'+
 '.zrT div+div{margin-top:2px}.zrT div i{font-style:normal;width:20px;text-align:center;opacity:.75}.zrT div img{width:26px;height:26px;border-radius:50%}'+
 '.zrT div span{flex:1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zrT div b{font-weight:900}'+
 '.zrT div.me{background:#fff0bf;border:2px solid #e0a92e;color:#7a4200;font-weight:900}.zrT div.vs{background:#eaf7d8;border:2px solid #7fb84f;color:#2f6a1c}'+
 '.zrGap{text-align:center;font-weight:900;font-size:16px;margin:4px 0 6px}'+
 '.zrP .zabRw{margin:4px 0}.zrP .zabRw>div{font-size:15px;padding:4px 10px 4px 5px}.zrP .zabRw>div img{width:28px;height:28px}'+
 'html .zrP>h3.zrH{font-size:17px;white-space:nowrap;padding-left:6px;padding-right:6px}'+
 '.zrB2{display:flex;margin-top:8px}html .zrP .zrB2 .btn{flex:1 1 50%;min-height:46px;font-size:13.5px;line-height:1.15;padding:4px 6px;margin:0}.zrB2 .btn+.btn{margin-left:8px}'+
 '.zrHud{position:absolute;z-index:5;left:50%;top:calc(env(safe-area-inset-top,0px) + 8px);transform:translateX(-50%);text-align:center;pointer-events:none;color:#fff6dc;font-weight:900;text-shadow:0 2px 0 #2e1c0e,0 0 6px rgba(46,28,14,.9);white-space:nowrap}'+
 '.zrHud b{display:block;font-size:40px;line-height:1}.zrHud small{display:block;font-size:14px;font-weight:800;margin-top:2px}.zrHud.rec small{color:#ffe066}'+
 '.zrSt{text-align:center}.zrSt img{width:84px;height:84px}.zrSt p{margin:4px 0;font-weight:700;font-size:16px;line-height:1.3}'+
 '.zrMed{display:inline-block;width:14px;height:14px;border-radius:50%;border:2px solid rgba(60,30,10,.55);vertical-align:-2px;margin-right:3px;background:rgba(110,67,31,.15)}'+
 '.zrMed.m1{background:#c98a4a}.zrMed.m2{background:#cfd6dc}.zrMed.m3{background:#f5b21a}'+
 '@media (max-height:699px){.zrP .zabScore{font-size:38px}.zrP .zabStars i{font-size:26px}.zrT div{min-height:26px;font-size:14px}.zrT div img{width:22px;height:22px}}';
 document.head.appendChild(s);}
function snd(k){try{SND[k]();}catch(e){}}
function tabHTML(t,n,vs){var m=0,i,a,h='<div class="zrT">';for(i=0;i<t.length;i++)if(t[i].me)m=i;a=Math.max(0,Math.min(t.length-n,m-Math.floor(n/2)));
  for(i=a;i<a+n&&i<t.length;i++){var r=t[i];h+='<div class="'+(r.me?'me':'')+'"><i>'+r.pl+'</i>'+(r.me?'<img src="'+ic('hp_'+S.hero,64)+'" alt="">':'<img src="'+ic('hp_'+r.id,64)+'" alt="">')+'<span>'+esc(r.nm)+'</span><b>'+(r.sc?fmtNum(r.sc):'—')+'</b></div>';}
  if(vs)h+='<div class="vs"><i>⚔</i><span>'+esc(String(vs.n||L('Друг','Friend')).slice(0,18))+'</span><b>'+fmtNum(vs.sc|0)+'</b></div>';
  return h+'</div>';}

/* ---------- окно итогов (вместо zabFinUI): счёт с единицей, рекорд и «сколько не хватило», 5 соседей, «Ещё разок» (Enter) / «Хватит» (Esc) ---------- */
Z.ui=function(g,o,out,opt){var c=ZAB.cur,zr=out.zr,id=g.id,cf=Z.info(id);if(!c||!zr||!cf)return false;css();var host=c.host,z=ZB();
  if(!zr.tab)Z.place(id,zr,out.score);
  var u=Z.unit(id,out.score),sp=u.indexOf(' '),num=sp>0?u.slice(0,sp):u,un=sp>0?u.slice(sp+1):'',gp=zr.gap,less=!!cf.less;
  var canAd=!out.train&&ZAB_RW.ad&&o.mode!=='day2'&&out.tier<3&&!c.ad&&!c.asked&&!g.noRetry&&!z.d.a[id]&&g.kind!=='after'&&g.kind!=='kiln'&&g.kind!=='lov'&&host.adOk();
  var ln;if(zr.rec)ln='<span class="zabRec">'+L('Новый рекорд!','New record!')+(zr.prev?' <small>'+L('было ','was ')+fmtNum(zr.prev)+'</small>':'')+'</span>';
  else if(zr.best){var d=Math.abs(zr.best-out.score);ln='<div class="zrLn">'+L('Рекорд ','Best ')+'<b>'+fmtNum(zr.best)+'</b>'+(d&&out.score?' · '+L('до рекорда ','to beat it: ')+'<b>'+fmtNum(d)+'</b>':'')+'</div>';}
  else ln='';
  var nm=zabName(g),h='<div class="panel zabRes zrP"><h3'+(nm.length>16?' class="zrH"':'')+'>'+nm+'</h3>'+
    '<div class="zabScore">'+num+(un?'<small>'+un+'</small>':'')+'</div>'+
    '<div class="zabStars">'+[1,2,3].map(function(i){return '<i class="'+(out.tier>=i?'on':'off')+'" style="animation-delay:'+(i*.14)+'s">★</i>';}).join('')+'</div>'+ln+
    (out.msg?'<p class="sub" style="text-align:center;margin:0 0 4px">'+out.msg+'</p>':'');
  if(o.vs){var vs=o.vs.sc|0,w=less?out.score>0&&out.score<vs:out.score>vs;h+='<div class="zrLn">'+(w?L('Вызов принят и побит!','Challenge beaten!'):L('Не хватило: ','Short by ')+'<b>'+Z.unit(id,Math.abs(vs-out.score)+(less?0:1))+'</b>')+'</div>';}
  h+=tabHTML(zr.tab,host.h<620||host.h<700&&canAd?3:5,o.vs);
  h+='<div class="zrGap">'+(gp&&gp.n?L('До '+gp.gen+' — '+Z.unit(id,gp.n)+'. Ещё разок?',Z.unit(id,gp.n)+' to catch '+gp.nm+'. One more?'):gp?L('Догони '+gp.gen+' — ещё разок?','Catch '+gp.nm+' — one more?'):L('Ты первый на заставе! Удержишь?','You’re first at the outpost! Can you hold it?'))+'</div>';
  if(!out.train&&out.items.length)h+='<div class="zabRw">'+out.items.map(function(x,i){return '<div class="'+(x.big?'big ':'')+(x.cls||'')+'" style="animation-delay:'+(.3+i*.12)+'s">'+(x.img?'<img src="'+x.img+'" alt="">':'')+x.t+'</div>';}).join('')+'</div>';
  h+='<div class="btns"><button class="btn big" data-k="again">'+L('↻ Ещё разок','↻ One more')+'</button><div class="zrB2">'+
    (canAd?'<button class="btn ad" data-k="ad">'+L('🎬 Ещё попытка за рекламу','🎬 One more try for an ad')+'</button>':'')+
    '<button class="btn ghost zrNo" data-k="ok">'+(out.train||!out.items.length?L('Хватит','Enough'):L('Забрать и хватит','Collect & finish'))+'</button></div></div></div>';
  var v=document.createElement('div');v.className='zabVeil';v.innerHTML=h;host.root.appendChild(v);snd(zr.rec?'win':'chest');if(canAd)host.offer();
  var out0=opt.out0||(!out.train?out:null),gone=0;
  function kill(){gone=1;window.removeEventListener('keydown',kh);}
  function back(){if(gone)return;kill();ZAB_CLOSE();var r=out0||out;if(opt.back)try{opt.back(r);}catch(e){zabErr('back',e);}else if(typeof zabScreenRe==='function')zabScreenRe();}
  function again(){if(gone)return;kill();var n=(opt.again|0)+1,q={},k;for(k in opt)q[k]=opt[k];q.train=true;q.mode=null;q.again=n;q.out0=out0;q.vs=o.vs;
    BB2.stat('zab',{a:'again',id:id,n:n});ZAB_CLOSE();ZAB_OPEN(id,q);}
  v.querySelector('[data-k=ok]').onclick=function(){snd('click');back();};
  v.querySelector('[data-k=again]').onclick=function(){snd('click');again();};
  var ab=v.querySelector('[data-k=ad]');if(ab)ab.onclick=function(){snd('click');ab.disabled=true;
    host.ad('retry').then(function(ok){if(!ok){ab.disabled=false;return;}z.d.a[id]=1;zabTouch();save();var pt=out.tier;kill();ZAB_CLOSE();
      var q={},k;for(k in opt)q[k]=opt[k];q.mode='day2';q.train=false;var h2=ZAB_OPEN(id,q);if(h2&&ZAB.cur)ZAB.cur.prevTier=pt;});};
  function kh(e){if(!v.isConnected){kill();return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();again();}else if(e.key==='Escape'){e.preventDefault();back();}}
  setTimeout(function(){if(!gone)window.addEventListener('keydown',kh);},400);return true;};

/* ---------- старт-карточка: ZREC.start(host,o,fn) ---------- */
Z.start=function(host,o,fn){var id=host.id,c=Z.info(id);if(!c||o.again>0){setTimeout(fn,0);return;}css();
  var b=Z.best(id),gp=Z.gap(id),v=document.createElement('div'),gone=0;v.className='zabVeil';
  v.innerHTML='<div class="panel zrSt"><h3>'+Z.name(id)+'</h3>'+(c.icon&&ART[c.icon]?'<img src="'+ic(c.icon,168)+'" alt="">':'')+
    (c.a?'<p>'+L(c.a[0],c.a[1]||c.a[0])+'</p>':'')+
    '<div class="zrLn">'+(b?L('Твой рекорд: ','Your best: ')+'<b>'+Z.unit(id,b)+'</b>':L('Рекорда пока нет — поставь первый!','No record yet — set the first one!'))+'</div>'+
    (o.vs?'<div class="zrLn">'+esc(String(o.vs.n||L('Друг','Friend')).slice(0,18))+L(' вызывает: ',' challenges you: ')+'<b>'+Z.unit(id,o.vs.sc|0)+'</b></div>':
      gp&&gp.sc?'<div class="zrLn">'+L('Впереди ','Ahead: ')+esc(gp.nm)+': <b>'+Z.unit(id,gp.sc)+'</b></div>':'')+
    '<div class="btns"><button class="btn big" data-k="go">'+L('Начать','Start')+'</button></div></div>';
  host.root.appendChild(v);
  function go(){if(gone)return;gone=1;window.removeEventListener('keydown',kh);snd('click');v.remove();fn();}
  function kh(e){if(!v.isConnected){window.removeEventListener('keydown',kh);return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}}
  v.querySelector('[data-k=go]').onclick=go;window.addEventListener('keydown',kh);host.onQuit(function(){window.removeEventListener('keydown',kh);});};

/* ---------- счёт на экране: var H=ZREC.hud(host,o); H.set(n) на каждое изменение; H.end() в конце (или само при выходе) ---------- */
Z.hud=function(host,o){css();var id=host.id,c=Z.info(id)||{},best=Z.best(id),t=[],el=document.createElement('div'),was=-1,rec=0;
  try{t=Z.table(id).filter(function(r){return !r.me&&r.sc>0;});}catch(e){}
  el.className='zrHud';el.innerHTML='<b>0</b><small></small>';host.el.appendChild(el);var B=el.firstChild,Sm=el.lastChild;
  function sub(n){if(o.vs&&(c.less?true:n<=(o.vs.sc|0)))return esc(String(o.vs.n||L('Друг','Friend')).slice(0,14))+' '+fmtNum(o.vs.sc|0);
    if(c.less)return best?L('рекорд ','best ')+fmtNum(best):'';
    if(best&&n>best){if(!rec){rec=1;el.className='zrHud rec';snd('level');}return L('Новый рекорд!','New record!');}
    var r=null,i;for(i=0;i<t.length;i++)if(t[i].sc>n&&(!r||t[i].sc<r.sc))r=t[i];
    if(best&&(!r||best<=r.sc))return L('рекорд ','best ')+fmtNum(best);return r?esc(r.nm)+' '+fmtNum(r.sc):'';}
  var H={el:el,set:function(n){n=Math.max(0,Math.round(+n||0));if(n===was)return;was=n;B.textContent=fmtNum(n);var s=sub(n);if(Sm.innerHTML!==s)Sm.innerHTML=s;},
    end:function(){if(el.parentNode)el.parentNode.removeChild(el);}};
  H.set(0);host.onQuit(H.end);return H;};

/* ---------- «Доска почёта» и список ловкостных для экрана Забав ---------- */
function med(m){return '<i class="zrMed m'+(m|0)+'"></i>';}
Z.medHTML=med;
Z.board=function(){css();var ids=Z.ids(),i,g=0,n=0,h='';for(i=0;i<ids.length;i++){if(!Z.isOpen(ids[i]))continue;n++;var m=Z.medal(ids[i]);if(m>=3)g++;h+=med(m);}
  if(!n)return '';return '<div class="card zabTip"><div class="row"><div class="t"><b>'+L('Доска почёта заставы','Outpost Hall of Fame')+'</b><span>'+h+' '+
    (g>=n&&n>=10?L('Все на золото — ты Удалой молодец!','All gold — a true Daring Fellow!'):L('золотых медалей: '+g+' из '+n,'gold medals: '+g+' of '+n))+'</span></div></div></div>';};
Z.rows=function(){css();var ids=Z.ids(),i,h='',z=ZB();for(i=0;i<ids.length;i++){var id=ids[i],c=Z.info(id);if(!Z.isOpen(id))continue;var b=Z.best(id),gp=Z.gap(id),paid=z.d.p[id]|0;
    h+='<div class="card zabRow'+(paid?'':' next')+'"><div class="row"><img class="ic" src="'+ic(c.icon&&ART[c.icon]?c.icon:'zb_tent',96)+'"><div class="t"><b>'+Z.name(id)+'</b>'+(c.a?'<span>'+L(c.a[0],c.a[1]||c.a[0])+'</span>':'')+
      '<span class="zabSt">'+med(Z.medal(id))+(b?L('рекорд ','best ')+Z.unit(id,b)+(gp&&gp.n?L(' · до '+gp.gen+' '+fmtNum(gp.n),' · '+fmtNum(gp.n)+' to '+gp.nm):L(' · ты первый!',' · you’re first!')):L('рекорда пока нет','no record yet'))+(paid?'':L(' · награда ждёт',' · reward awaits'))+'</span></div></div>'+
      '<div class="btns zabBt"><button class="btn gold" data-zl="'+id+'">'+(b?L('↻ На рекорд','↻ Beat it'):L('Играть','Play'))+'</button></div></div>';}
  return h;};
/* ---------- игра для привала/разминки: сначала ловкостная (по кругу, первой — с невзятой наградой), иначе забава дня, иначе забава недели на рекорд ---------- */
function pickGame(n){var ids=Z.ids().filter(function(id){return Z.isOpen(id);}),z=ZB(),i,a=[];
  for(i=0;i<ids.length;i++)if(!z.d.p[ids[i]])a.push(ids[i]);if(!a.length)a=ids;if(a.length)return a[n%a.length];
  try{var d=typeof zabDayPick==='function'?zabDayPick():0;if(d&&zabG(d)&&Z.info(zabG(d).id))return zabG(d).id;var w=zabG(zabWeekN());if(w&&Z.info(w.id))return w.id;}catch(e){}return '';}
function fireHTML(){return '<div class="zpvS"><i class="st" style="left:12%;top:14%"></i><i class="st" style="left:38%;top:8%"></i><i class="st" style="left:71%;top:18%"></i><i class="st" style="left:88%;top:9%"></i>'+
  '<img class="tn" src="'+ic('zb_tent',192)+'" alt=""><img class="hr" src="'+ic('hp_'+S.hero,160)+'" alt=""><div class="fr"><b></b><b></b><b></b><u></u><u></u></div></div>';}
function pvCss(){css();if(document.getElementById('zpvCss'))return;var s=document.createElement('style');s.id='zpvCss';s.textContent=
 '.zpvS{position:relative;height:150px;border-radius:12px;border:3px solid #6e431f;overflow:hidden;margin-bottom:8px;background:linear-gradient(#23305e 0%,#4a4a86 46%,#c9785a 62%,#3f6a3a 63%,#2c4a2a 100%)}'+
 '.zpvS .st{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff6c8}'+
 '.zpvS .tn{position:absolute;left:6%;bottom:14%;width:104px;height:104px}.zpvS .hr{position:absolute;right:10%;bottom:8%;width:84px;height:84px}'+
 '.zpvS .fr{position:absolute;left:50%;bottom:12%;width:60px;height:70px;margin-left:-30px}'+
 '.zpvS .fr:before{content:"";position:absolute;left:-40px;right:-40px;bottom:-14px;height:90px;border-radius:50%;background:radial-gradient(rgba(255,190,80,.55),rgba(255,160,60,0) 68%)}'+
 '.zpvS .fr b{position:absolute;bottom:8px;left:50%;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;transform-origin:50% 100%;animation:zpvF .5s ease-in-out infinite alternate}'+
 '.zpvS .fr b:nth-child(1){width:38px;height:54px;margin-left:-19px;background:#ff7a1a}.zpvS .fr b:nth-child(2){width:26px;height:40px;margin-left:-13px;background:#ffb52e;animation-duration:.37s}'+
 '.zpvS .fr b:nth-child(3){width:14px;height:24px;margin-left:-7px;background:#fff0a0;animation-duration:.29s}'+
 '.zpvS .fr u{position:absolute;bottom:2px;left:4px;width:52px;height:10px;border-radius:5px;background:#6a3f1c;border:2px solid #3a2410;transform:rotate(14deg)}.zpvS .fr u+u{transform:rotate(-14deg)}'+
 '@keyframes zpvF{from{transform:scale(1,1) rotate(-3deg)}to{transform:scale(.88,1.16) rotate(3deg)}}body.zabCalm .zpvS .fr b{animation:none}'+
 '.zpvQ{text-align:center;font-weight:700;font-size:15.5px;line-height:1.3;margin:0 2px 8px}'+
 '@media (max-height:619px){.zpvS{height:112px}.zpvS .tn{width:82px;height:82px}.zpvS .hr{width:68px;height:68px}}';
 document.head.appendChild(s);}
/* «Привал»: один экран — костёр, шатёр, богатырь; большая «Размяться: …» и маленькая «Дальше в путь». После забавы — сразу в поход. */
Z.prival=function(chi,o){var id=pickGame(Z.s().pn|0),c=id&&Z.info(id);if(!c)return false;pvCss();document.body.classList.toggle('zabCalm',!!S.calm);
  var b=Z.best(id),gp=b?Z.gap(id):null,q;
  if(gp&&gp.n)q=L('Воевода у костра: «'+gp.nm+' хвастает — '+Z.unit(id,gp.sc)+'. Утрёшь нос, пока каша греется?»','The voivode by the fire: “'+gp.nm+' brags of '+Z.unit(id,gp.sc)+'. Show them while the porridge warms?”');
  else if(b)q=L('Воевода у костра: «Первый на заставе — и сидит! Покажи молодым, как надо».','The voivode by the fire: “First at the outpost and just sitting? Show the young ones how it’s done.”');
  else q=L('Воевода у костра: «Три победы — и ни одной забавы? Каша подождёт, разомнись!»','The voivode by the fire: “Three victories and no fun at all? The porridge can wait — stretch your arms!”');
  var done=0;function go(){if(done)return;done=1;hideModal();startRun(chi,o.endless,o.wk,o.dr);}
  showModal('<h3>'+L('Привал у костра','Campfire rest')+'</h3>'+fireHTML()+'<p class="zpvQ">'+q+'</p><div class="btns"><button class="btn big" id="zpvGo">'+L('Размяться: ','Warm up: ')+Z.name(id)+'</button>'+
    '<button class="btn ghost" id="zpvNo">'+L('Дальше в путь ➜','On we go ➜')+'</button></div>','prival');
  BB2.stat('zab',{a:'see',id:id,src:'map'});
  document.getElementById('zpvNo').onclick=function(){snd('click');BB2.stat('zab',{a:'no',id:id,src:'map'});go();};
  document.getElementById('zpvGo').onclick=function(){snd('click');this.disabled=true;Z.play(id,{src:'map',back:go,onQuit:go}).then(null,go);};
  return true;};
/* разминка после поражения: кнопка в окне итогов (в блоке кнопок), одна игра — «Увернись!» (id 'uvern', поток LOVA), пока её нет — Частокол.
   Забава идёт поверх окна итогов; после неё — «+5 % здоровья на следующую попытку» (обычная сила забав: один поход главы, потолки ядра). */
Z.warmIds=['uvern','chastokol'];
Z.warm=function(m,used,st){var bx=m.querySelector('.btns'),id='',i;if(!bx||m.querySelector('#zabWarmB')||m.querySelector('#zabWarmT'))return;
  for(i=0;i<Z.warmIds.length&&!id;i++)if(Z.info(Z.warmIds[i])&&(Z.ids().indexOf(Z.warmIds[i])>=0||typeof ZAB!=='undefined'&&ZAB.by[Z.warmIds[i]]))id=Z.warmIds[i];
  if(!id)return;var hp=BB2.n('zab.warmHp',.05) /*ECO?*/,pc=Math.round(hp*100);
  function doneT(){var t=document.createElement('p');t.id='zabWarmT';t.className='sub';t.style.cssText='text-align:center;margin:0 0 6px';
    t.innerHTML=L('Размялся! Вот так и в бою: +'+pc+' % здоровья на следующую попытку.','Warmed up! Do the same in battle: +'+pc+'% health for your next try.');bx.parentNode.insertBefore(t,bx);}
  if(st===2){doneT();return;}
  var b=document.createElement('button');b.className='btn ghost';b.id='zabWarmB';b.innerHTML=L('Размяться на Ристалище','Warm up at the Lists');bx.appendChild(b);
  BB2.stat('zab',{a:'see',id:id,src:'lose'});
  b.onclick=function(){snd('click');b.disabled=true;var fin=0;
    function back(){if(fin)return;fin=1;Z.inc('wn');try{zabBufAdd({hp:hp},'warm');}catch(e){}Z.touch();used();BB2.stat('zab',{a:'warm',id:id});if(b.parentNode)b.parentNode.removeChild(b);doneT();}
    Z.play(id,{src:'lose',keep:1,train:Z.ids().indexOf(id)<0?1:null,back:back,onQuit:function(){b.disabled=false;}}).then(null,function(){b.disabled=false;});};};
})();
