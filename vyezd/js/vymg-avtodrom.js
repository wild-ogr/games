'use strict';
/* vy-park · «Парковка задним» в 4 местах (решение владельца 10.10): js/vymg-avtodrom.js → window.VYPARK. Движок — js/vymg-parkeng.js (VYPE).
   1) Автодром — экран 'avtodrom' (UI.screen): 36 площадок в 6 площадях по 6 (Свой двор, Гаражи, Рынок, Вокзал, Зима, Центр), ★ за площадку:
      встал · без касаний и ровно · не дольше норматива (автопилот×1,35+6 с). Площадь открывается по пройденным дворам (GATE) и когда все площадки прошлой
      поставлены (≥1★); внутри площади — по порядку. Входы: карта (mapSlots 'top'), окно деда Митяя в пятиэтажке (homeSlots 'win', id w-mityai — замена пустого окна UX).
   2) Финал региона — карточка в окне победы босса (winSlots 'extra', впервые пройден): машину региона (VYREG.car) — задом в гараж/к рампе; повтор — на Автодроме.
   3) Парковка дня — одна площадка на всех (зерно от даты), плитка в ленте «Сегодня» (homeSlots 'feed', пока не сыграна) и на Автодроме;
      очки лиги соседей 10+5×★ (раз в день, дальше — только прибавка за лучший результат) через MY.lgAdd (league.js, «vy-park»).
   4) Праздники — VYPARK.fest('hw'|'ny'): «Чёрная Волга» (ночь, тыквы, чёрная Волга) и «Ёлочный базар» (снег, ёлки, гирлянда, Буханка Деда Мороза) — по 3 площадки,
      только в даты праздника (FESTVY.cur()); кнопка в окне праздника (fest-vy.js, «vy-park») и карточка на Автодроме.
   Награды — только оболочка VYMG_OPEN (mode 'avto'|'reg'|'pday'|'fest'; не 'cab' → раз в день за игру №14, потолки 40 💰 / 2 🔩 в день). Своих монет нет — темп не меняется.
   Сохранение S.vymg.park = {s:{№:★}, t:{№:лучшее время ×10}, d:{k:день,s:★,t:время×10,lg:очков лиги выдано}, f:{регион:★}, h:{праздник-№:★}};
     слияние облака — своё UI.onSave (★ — максимум, время — минимум, день — свежий). STAT — событие mg оболочки (m = режим) + {a:'park',…} ниже.
   Стенды: ?vymg=avtodrom — экран; ?vymg=pday — парковка дня; ?vymg=pfin&lv=20 — окно победы босса; ?vymg=pfest&k=hw — праздник. */
(function(){if(typeof VYMG==='undefined'||!window.VYPE||!window.UI)return;
var E=VYMG.esc,L0=function(r,e){return typeof L==='function'?L(r,e):r;},en=function(){return typeof LANG!=='undefined'&&LANG==='en';};
/* ---------- 36 площадок: [вид, машина, трудность, флаги n — ночь, i — лёд] ---------- */
var GR=[
 {id:'dvor',n:'Свой двор',e:'Our yard',ic:'🏠',th:'yard',gate:10,lots:[['bay','moskvich',0],['bay','kopeyka',.15],['par','zapor',0],['gar','niva',.1],['diag','devyatka',.2],['bay','oka',.3,'n']]},
 {id:'gar',n:'Гаражи',e:'Garages',ic:'🔧',th:'gar',gate:25,lots:[['gar','volga',.15],['gar','pobeda',.3],['lane','bobik',.2],['bay','buhanka',.3],['gar','volga21',.4,'n'],['par','niva',.4]]},
 {id:'rynok',n:'Рынок',e:'Market',ic:'🍉',th:'market',gate:45,lots:[['dock','gazel',.15],['diag','kabluk',.3],['par','raf',.3],['bay','buhanka',.45],['dock','hleb',.35],['lane','gazel',.5]]},
 {id:'vokzal',n:'Вокзал',e:'Station',ic:'🚉',th:'station',gate:70,lots:[['bay','taxi',.45],['par','volga',.5],['dock','paz',.3],['lane','skoraya',.5],['diag','raf',.5],['gar','skoraya',.5,'n']]},
 {id:'zima',n:'Стадион зимой',e:'Winter stadium',ic:'❄',th:'stadium',gate:100,lots:[['bay','niva',.45,'i'],['par','kopeyka',.5,'i'],['gar','buhanka',.5,'i'],['diag','gaz66',.5,'i'],['lane','trekol',.6,'i'],['dock','moloko',.5,'in']]},
 {id:'centr',n:'Центр',e:'City centre',ic:'⭐',th:'square',gate:140,lots:[['par','chaika',.6],['bay','zim',.6],['diag','volga21',.7],['lane','zil',.6],['gar','chaika',.7,'n'],['par','zim',.8]]}];
var LOTS=[];GR.forEach(function(g,gi){g.lots.forEach(function(l,j){LOTS.push({i:LOTS.length,g:gi,j:j,kind:l[0],car:l[1],tight:l[2],night:/n/.test(l[3]||''),ice:/i/.test(l[3]||''),th:g.th});});});
var KIND={bay:['задом между машинами','reverse between cars','🅿'],diag:['«ёлочка» — косое место','angled bay','↘'],par:['«карман» вдоль бордюра','parallel park','⇆'],
  gar:['в гараж задом','reverse into a garage','🏚'],dock:['к рампе задом','reverse to the ramp','📦'],lane:['задом в ворота','reverse through a gate','⛩']};
var FST={hw:{n:'Чёрная Волга',e:'The Black Volga',ic:'🌙',lots:[['gar','volga','hw',.3],['bay','volga','hw',.4],['lane','volga','hw',.45]],col:'#1b1e24',th:'gar'},
  ny:{n:'Ёлочный базар',e:'Christmas tree market',ic:'🎄',lots:[['dock','buhanka','ny',.3],['par','buhanka','ny',.4],['diag','buhanka','ny',.45]],col:'#d42f36',th:'market'}};
/* регион → тема и вид финала */
var REGTH={volga:'yard',ural0:'gar',dv:'station',world1:'station',world2:'square',moskva:'yard',arktika:'stadium',karelia:'gar',yug:'market',baikal:'gar',zavod:'market',dacha:'yard',
  volga2:'market',altai:'stadium',europe:'square',asia:'market',trassib:'station',future:'square'};
var REGICE={arktika:1,karelia:1,altai:1,baikal:1},REGNIGHT={dv:1,world1:1,world2:1,arktika:1,future:1};
var MAXSTARS=LOTS.length*3;
/* ---------- сохранение ---------- */
var ob=function(v){return !!v&&typeof v==='object'&&!Array.isArray(v);};
function pNew(){return {s:{},t:{},d:{k:0,s:0,t:0,lg:0},f:{},h:{}};}
function pFix(z){if(!ob(z))z=pNew();['s','t','f','h'].forEach(function(k){if(!ob(z[k]))z[k]={};for(var i in z[k]){var v=Math.max(0,(+z[k][i]|0)||0);if(k!=='t')v=Math.min(3,v);if(!v&&k==='t')delete z[k][i];else z[k][i]=v;}});
  if(!ob(z.d))z.d={k:0,s:0,t:0,lg:0};['k','s','t','lg'].forEach(function(k){z.d[k]=Math.max(0,(+z.d[k]|0)||0);});z.d.s=Math.min(3,z.d.s);return z;}
function pMerge(a,b){a=pFix(a);if(!ob(b))return a;b=pFix(JSON.parse(JSON.stringify(b)));['s','f','h'].forEach(function(k){for(var i in b[k])a[k][i]=Math.max(a[k][i]|0,b[k][i]|0);});
  for(var i in b.t)a.t[i]=a.t[i]?Math.min(a.t[i],b.t[i]):b.t[i];
  if(b.d.k>a.d.k)a.d=b.d;else if(b.d.k===a.d.k){a.d.s=Math.max(a.d.s,b.d.s);a.d.lg=Math.max(a.d.lg,b.d.lg);if(b.d.t&&(!a.d.t||b.d.t<a.d.t))a.d.t=b.d.t;}return a;}
UI.onSave({id:'vypark',fix:function(S){try{if(ob(S.vymg))S.vymg.park=pFix(S.vymg.park);}catch(e){console.warn('vypark fix',e);}},
  merge:function(S,d){try{if(!ob(S.vymg))return;var c=ob(d)&&ob(d.vymg)?d.vymg.park:null;S.vymg.park=pMerge(S.vymg.park,c);}catch(e){console.warn('vypark merge',e);}}});
function P(){var z=VYMG.Z();if(!ob(z.park))z.park=pNew();return z.park;}
function save0(){try{VYMG.touch();}catch(e){}try{save();}catch(e){}}
function day(){try{return dayKey(0);}catch(e){return 0;}}
function yards(){return VYMG.yards();}
function ev(p){try{STAT.ev('mg',Object.assign({a:'park'},p));}catch(e){}}
/* ---------- площадки ---------- */
function specOf(l){return {kind:l.kind,car:l.car,th:l.th,night:l.night,ice:l.ice,tight:l.tight,seed:VYPE.hash('avto'+l.i),calm:calmOn()};}
function calmOn(){try{return typeof calm==='function'&&!!calm();}catch(e){return false;}}
function gStars(gi){var s=0,p=P();GR[gi].lots.forEach(function(x,j){s+=p.s[gi*6+j]|0;});return s;}
function gParked(gi){var p=P();for(var j=0;j<6;j++)if(!(p.s[gi*6+j]>0))return false;return true;}
function gOpen(gi){return yards()>=GR[gi].gate&&(gi===0||gParked(gi-1));}
function lOpen(i){var l=LOTS[i];if(!l||!gOpen(l.g))return false;return l.j===0||P().s[i-1]>0;}
function total(){var s=0,p=P();for(var i in p.s)if(+i<LOTS.length)s+=p.s[i]|0;return s;}
function opened(){return yards()>=GR[0].gate;}
function carN(id){try{if(window.VYCARS&&VYCARS.nm)return VYCARS.nm(id)||id;}catch(e){}return id;}
function lotName(l){return (en()?KIND[l.kind][1]:KIND[l.kind][0]);}
/* парковка дня: одна площадка на всех */
var DKINDS=['bay','diag','par','gar','dock','lane'],DCARS=['moskvich','kopeyka','volga','niva','devyatka','zapor','buhanka','gazel','raf','pobeda','taxi','oka','bobik','kabluk'],DTH=['yard','gar','market','station','stadium','square'];
function daySpec(k){k=k||day();var R=VYPE.rng(VYPE.hash('pday'+k)),m=Math.floor(k/100)%100;var kind=DKINDS[Math.floor(R()*6)],car=DCARS[Math.floor(R()*DCARS.length)],th=DTH[Math.floor(R()*6)];
  return {kind:kind,car:car,th:th,night:R()<.25,ice:m===12||m<=2||R()<.12,tight:.3+.4*R(),seed:VYPE.hash('pd'+k),calm:calmOn()};}
function lgPts(s){return s>0?10+5*s:0;}
function lgOn(){try{return !!(window.MY&&MY.lgOpen&&MY.lgOpen()&&MY.lgAdd);}catch(e){return false;}}
/* финал региона */
function regSpec(reg){var big=VYPE.dims(reg.car).L>5.6,ri=Math.max(0,(VYREG.all||[]).indexOf(reg));
  return {kind:big?'dock':'gar',car:reg.car,th:REGTH[reg.id]||'yard',night:!!REGNIGHT[reg.id],ice:!!REGICE[reg.id],tight:Math.min(.8,.1+ri*.035),seed:VYPE.hash('reg'+reg.id),calm:calmOn()};}
function regsDone(){var y=yards();return (window.VYREG&&VYREG.all||[]).filter(function(r){return r.boss<=y;});}
/* праздник */
function festCur(){try{var c=window.FESTVY&&FESTVY.cur();return c&&FST[c.k]?c:null;}catch(e){return null;}}
function festSpec(k,n){var f=FST[k],l=f.lots[n];return {kind:l[0],car:l[1],fest:l[2],th:f.th,tight:l[3],seed:VYPE.hash('fest'+k+n),col:f.col,calm:calmOn()};}
/* ---------- запуск ---------- */
function launch(o){if(VYMG.busy)return;try{SND.tap();}catch(e){}ev({m:o.src,k:o.key});
  VYMG_OPEN('parkovka',{mode:o.src,ctx:{park:o},back:o.back||function(){openScr();},next:o.next||null});}
function playLot(i,back){var l=LOTS[i];if(!l||!lOpen(i))return;
  launch({src:'avto',key:'a'+i,i:i,spec:specOf(l),title:L0('Площадка №'+(i+1)+' · ','Lot #'+(i+1)+' · ')+(en()?GR[l.g].e:GR[l.g].n),back:back});}
function playDay(back){launch({src:'pday',key:'d'+day(),spec:daySpec(),title:L0('Парковка дня','Parking of the day'),back:back});}
function playReg(reg,back){launch({src:'reg',key:'r'+reg.id,reg:reg.id,spec:regSpec(reg),title:L0('Финал региона «','Region final “')+(en()?reg.en:reg.name)+L0('»','”'),back:back});}
function fest(k,n,back){var c=festCur();if(!c||c.k!==k){try{toast(L0('Праздничные площадки — только в праздник','Holiday lots are open only during the holiday'));}catch(e){}return;}
  if(n==null){var p=P();n=0;for(var j=0;j<3;j++){if(!(p.h[c.id+'-'+j]>0)){n=j;break;}if(j===2){var lo=9;for(var q=0;q<3;q++)if((p.h[c.id+'-'+q]|0)<lo){lo=p.h[c.id+'-'+q]|0;n=q;}}}}
  launch({src:'fest',key:c.id+'-'+n,fest:c.id,spec:festSpec(k,n),title:(en()?FST[k].e:FST[k].n)+' · '+(n+1)+'/3',back:back||function(){openScr();}});}
/* ---------- заход в игру №14 (движок зовёт VYPARK.run, когда ctx.park) ---------- */
function run(host,o){var c=o.ctx.park,spec=Object.assign({},c.spec),sv=VYPE.solve(spec),cm=VYPE.dims(spec.car),nm=carN(cm.id);if(host.top)host.top(c.title||'');
  var txt='<b>'+E(c.title||'')+'</b><br>'+E(nm)+' — '+E(lotName({kind:spec.kind==='par'&&cm.L>6.2?'dock':spec.kind}))+(spec.ice?L0(' · ❄ скользко',' · ❄ slippery'):'')+(spec.night||spec.fest==='hw'?L0(' · 🌙 ночь',' · 🌙 night'):'');
  var rules='<p class="vyp-rules">⭐ '+L0('встал','parked')+' · ⭐ '+L0('без касаний и ровно','clean and straight')+' · ⭐ '+L0('быстрее ','under ')+sv.par+L0(' с',' s')+'</p>';
  return VYPE.play(host,o,{lots:[spec],mode:'stars',who:'mityai',autoFin:1,intro:{text:txt,html:rules,btn:L0('Поехали','Let’s go')},
    onLot:function(i,r){rec(c,r);},
    done:function(res){var r=res[0]||{stars:0,time:0};
      return {score:r.stars*3,tier:r.stars,label:(r.helped?L0('Поставил Митяй','Mityai parked it'):L0('Время ','Time ')+Math.round(r.time)+L0(' с',' s')+' · '+L0('касаний: ','bumps: ')+r.touch)+lgLine(c),extra:{park:c.key,st:r.stars}};}});}
var lastLg=0;
function lgLine(c){return c.src==='pday'&&lastLg?L0(' · лига +',' · league +')+lastLg:'';}
function rec(c,r){var p=P(),s=r.stars|0,t=Math.max(1,Math.round((r.time||0)*10));lastLg=0;
  if(c.src==='avto'){var i=c.i;if(s>(p.s[i]|0))p.s[i]=s;if(s>0&&(!p.t[i]||t<p.t[i]))p.t[i]=t;}
  else if(c.src==='reg'){if(s>(p.f[c.reg]|0))p.f[c.reg]=s;}
  else if(c.src==='fest'){if(s>(p.h[c.key]|0))p.h[c.key]=s;}
  else if(c.src==='pday'){var k=day();if(p.d.k!==k)p.d={k:k,s:0,t:0,lg:0};if(s>p.d.s)p.d.s=s;if(s>0&&(!p.d.t||t<p.d.t))p.d.t=t;
    var want=lgPts(p.d.s),add=want-p.d.lg;if(add>0&&lgOn()){try{MY.lgAdd(add);p.d.lg=want;lastLg=add;}catch(e){}}}
  ev({m:c.src,k:c.key,st:s,s:Math.round(r.time||0),tc:r.touch|0,h:r.helped?1:0});save0();}
/* ---------- вид ---------- */
function css(){if(document.getElementById('vyp-css'))return;var s=document.createElement('style');s.id='vyp-css';s.textContent=[
 '.vyp-scr{background:linear-gradient(180deg,#dfeaf4,#efe6cf);overflow:hidden}',
 '.vyp-rules{font-size:13px;color:#4a473e;margin:6px 0 0;text-align:center}',
 '.vyp-card{display:flex;align-items:center;gap:10px;margin:10px 0;padding:10px;border-radius:16px;background:#fffdf6;box-shadow:0 3px 0 rgba(0,0,0,.08)}',
 '.vyp-card.day{background:#fff4d6;border:2px solid #f2c45a}.vyp-card.fest{background:#2b2342;color:#f8f0ff;border:2px solid #ff922b}.vyp-card.fest.ny{background:#1f4b3a;border-color:#ff6b6b}',
 '.vyp-card>span:nth-child(2){flex:1;display:flex;flex-direction:column;min-width:0}.vyp-card small{font-size:12.5px;opacity:.8}',
 '.vyp-card .btn{width:auto;min-height:48px;padding:0 16px;margin:0;flex:0 0 auto}',
 '.vyp-gi{font-size:26px;flex:0 0 auto}',
 '.vyp-g{margin:14px 0 4px}.vyp-gh{display:flex;align-items:center;gap:8px;font-size:15px;color:#3d3a32;margin:0 2px 8px}.vyp-gh b{flex:1}.vyp-gh em{font-style:normal;font-weight:800;color:#b8860b}',
 '.vyp-lots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
 '@media (min-width:640px){.vyp-lots{grid-template-columns:repeat(6,1fr)}}',
 '.vyp-l{display:flex;flex-direction:column;align-items:center;gap:1px;border:0;border-radius:14px;background:#fff;padding:8px 4px;min-height:92px;box-shadow:0 3px 0 rgba(0,0,0,.1);font:inherit;color:#2b2a26;cursor:pointer;text-align:center}',
 '.vyp-l b{font-size:15px}.vyp-l i{font-style:normal;font-size:20px;line-height:1.1}.vyp-l small{font-size:11.5px;color:#6a675c;line-height:1.2;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
 '.vyp-l .st{font-size:12px;letter-spacing:1px;color:#f2a900}.vyp-l.lock{opacity:.5;cursor:default}.vyp-l.nx{box-shadow:0 0 0 3px #ffc233,0 3px 0 rgba(0,0,0,.1)}',
 '.vyp-lock{font-size:13px;color:#6a675c;background:rgba(255,255,255,.6);border-radius:12px;padding:8px 10px;margin:0}',
 '.vyp-regs{display:flex;flex-wrap:wrap;gap:6px}.vyp-r{border:0;border-radius:12px;background:#fff;padding:6px 10px;min-height:44px;font:inherit;font-size:13px;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.08)}',
 '.vyp-mrow{display:flex;gap:8px}.vyp-mrow .hsT{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:8px;text-align:left;border:0;border-radius:14px;background:#fff;padding:8px 10px;min-height:56px;box-shadow:0 3px 0 rgba(0,0,0,.12);font:inherit;color:#2b2a26;cursor:pointer;position:relative}',
 '.vyp-mrow .hsI{font-size:22px}.vyp-mrow .hsB{display:flex;flex-direction:column;min-width:0;flex:1}.vyp-mrow .hsB b{font-size:14px}.vyp-mrow .hsB small{font-size:12px;color:#6a675c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
 '.vyp-mrow .hsP{display:block;height:6px;border-radius:9px;background:#dfe3ea;margin-top:3px;overflow:hidden}.vyp-mrow .hsP b{display:block;height:100%;background:#f2a900}.vyp-mrow .hsTag{position:absolute;right:6px;top:4px;font-style:normal}',
 '.vyp-fin{display:flex;align-items:center;gap:8px;margin:6px 0;padding:6px 8px;border-radius:14px;background:#eef6ff;text-align:left}.vyp-fin .av{width:48px;height:48px;flex:0 0 auto}.vyp-fin .av svg{width:100%;height:100%}',
 '.vyp-fin>span:nth-child(2){flex:1;display:flex;flex-direction:column;min-width:0;font-size:13px}.vyp-fin b{font-size:14px}.vyp-fin .btn{flex:0 0 auto}',
 '@media (max-height:640px),(max-width:420px){.vyp-fin .av{display:none}}','.vyp-fin .btn{width:auto;padding:0 12px;min-height:44px}','.vyp-fin.sm{padding:3px 8px;margin:3px 0}.vyp-fin.sm .av,.vyp-fin.sm .vyp-ft{display:none}',
 '.vyp-fb{display:block;width:100%;margin:8px 0 0}'].join('\n');document.head.appendChild(s);}
function stH(n){n=n|0;return '<span class="st">'+'★'.repeat(n)+'<span style="opacity:.3">'+'★'.repeat(3-n)+'</span></span>';}
var sec=null;
function scrHtml(){var p=P(),y=yards(),tot=total(),dp=p.d.k===day()?p.d:{s:0},ds=daySpec(),fc=festCur(),nx=-1;
  for(var i=0;i<LOTS.length;i++)if(lOpen(i)&&!(p.s[i]>0)){nx=i;break;}
  var h='<header class="vy0-ch"><button class="vy0-back vyp-back" aria-label="'+L0('Назад','Back')+'">←</button><b>🅿 '+L0('Автодром','Driving ground')+'</b><span class="pill">★ '+tot+'/'+MAXSTARS+'</span></header><div class="vy0-cb">';
  h+=VYMG.say('mityai',nx>=0?L0('Права, говоришь? А ну, покажи площадку №'+(nx+1)+'! Три звезды — встал, без касаний и ровно, и быстро.','Got a licence, you say? Show me lot #'+(nx+1)+'! Three stars — parked, clean and straight, and quick.'):
    L0('Все открытые площадки поставлены! Добирай звёзды — или жди новые дворы.','All open lots are done! Collect more stars — or wait for new yards.'),'happy');
  h+='<div class="vyp-card day"><span class="vyp-gi">📅</span><span><b>'+L0('Парковка дня: ','Parking of the day: ')+E(carN(VYPE.carId(ds.car)))+'</b><small>'+E(lotName(ds))+' · '+(dp.s?stH(dp.s)+' ':'')+
    (lgOn()?L0('лига соседей: +','neighbours’ league: +')+lgPts(Math.max(1,dp.s))+'…'+lgPts(3):L0('одна площадка на всех','the same lot for everyone'))+'</small></span><button class="btn '+(dp.s?'sec':'green')+' vyp-day">'+(dp.s?L0('Ещё раз','Again'):L0('Играть','Play'))+'</button></div>';
  if(fc){var f=FST[fc.k],fs='';for(var j=0;j<3;j++)fs+=stH(p.h[fc.id+'-'+j]);h+='<div class="vyp-card fest '+fc.k+'"><span class="vyp-gi">'+f.ic+'</span><span><b>'+E(en()?f.e:f.n)+L0(': праздничные площадки',': holiday lots')+'</b><small>'+fs+'</small></span><button class="btn green vyp-fest">'+L0('Играть','Play')+'</button></div>';}
  GR.forEach(function(g,gi){var op=gOpen(gi);h+='<div class="vyp-g"><div class="vyp-gh"><span class="vyp-gi">'+g.ic+'</span><b>'+E(en()?g.e:g.n)+'</b><em>★ '+gStars(gi)+'/18</em></div>';
    if(!op){h+='<p class="vyp-lock">🔒 '+(y<g.gate?L0('откроется после '+g.gate+'-го двора','opens after yard '+g.gate):L0('поставь все площадки «'+GR[gi-1].n+'»','park every lot in “'+GR[gi-1].e+'” first'))+'</p></div>';return;}
    h+='<div class="vyp-lots">';g.lots.forEach(function(x,j){var i=gi*6+j,l=LOTS[i],o=lOpen(i),s=p.s[i]|0;
      h+='<button class="vyp-l'+(o?'':' lock')+(i===nx?' nx':'')+'" data-i="'+i+'"'+(o?'':' disabled')+'><b>'+(i+1)+'</b><i>'+(o?KIND[l.kind][2]:'🔒')+(l.night?'🌙':'')+(l.ice?'❄':'')+'</i><small>'+E(carN(VYPE.carId(l.car)))+'</small>'+(o?stH(s):'<small>&nbsp;</small>')+'</button>';});
    h+='</div></div>';});
  var rd=regsDone();if(rd.length){h+='<div class="vyp-g"><div class="vyp-gh"><span class="vyp-gi">🏁</span><b>'+L0('Финалы регионов','Region finals')+'</b></div><div class="vyp-regs">';
    rd.forEach(function(r){h+='<button class="vyp-r" data-r="'+E(r.id)+'">'+E(en()?r.en:r.name)+' '+stH(p.f[r.id])+'</button>';});h+='</div></div>';}
  return h+'</div>';}
function openScr(){css();if(!sec){sec=document.createElement('section');sec.className='screen vyp-scr';sec.id='scr-avtodrom';(document.getElementById('app')||document.body).appendChild(sec);}
  try{if(typeof leaveYard==='function')leaveYard();}catch(e){}
  sec.innerHTML=scrHtml();UI.show('scr-avtodrom');try{STAT.screen('avtodrom');}catch(e){}
  sec.querySelector('.vyp-back').onclick=function(){try{SND.tap();}catch(e){}UI.go('home')||UI.go('map');};
  var d=sec.querySelector('.vyp-day');if(d)d.onclick=function(){playDay();};
  var fb=sec.querySelector('.vyp-fest');if(fb)fb.onclick=function(){var c=festCur();if(c)fest(c.k);};
  sec.querySelectorAll('.vyp-l[data-i]').forEach(function(b){if(!b.disabled)b.onclick=function(){playLot(+b.dataset.i);};});
  sec.querySelectorAll('.vyp-r[data-r]').forEach(function(b){b.onclick=function(){var r=(VYREG.all||[]).find(function(x){return x.id===b.dataset.r;});if(r)playReg(r);};});
  var n=sec.querySelector('.vyp-l.nx');if(n&&n.scrollIntoView)try{n.scrollIntoView({block:'nearest'});}catch(e){}}
UI.screen('avtodrom',openScr);
/* ---------- входы ---------- */
function dayDone(){var p=P();return p.d.k===day()&&p.d.s>0;}
/* окно деда Митяя в пятиэтажке → Автодром (замена пустого окна UX с тем же id) */
homeSlots.push({id:'w-mityai',order:50,zone:'win',render:function(){var o=opened();return {who:'mityai',t:L0('Дед Митяй','Grandpa Mityai'),s:o?L0('Автодром','Driving ground'):'',badge:o&&!dayDone()?'🅿':'',go:o?'avtodrom':undefined};}});
/* лента «Сегодня»: Парковка дня, пока не сыграна */
homeSlots.push({id:'vypark-day',order:42,zone:'feed',render:function(){if(!opened()||dayDone())return null;var ds=daySpec();
  return UI.tile({ic:'🅿',t:L0('Парковка дня','Parking of the day'),s:carN(VYPE.carId(ds.car))+' · '+lotName(ds)+(lgOn()?L0(' · очки лиги',' · league points'):''),tag:'🆕',cls:'hot'});},
  mount:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){playDay(function(){UI.go('home');});};}});
/* карта: плитка Автодрома */
mapSlots.push({id:'vypark-map',order:35,zone:'top',render:function(){if(!opened())return null;css();var t=total(),dd=dayDone(),fc=festCur();
  return '<div class="vyp-mrow">'+UI.tile({ic:'🅿',t:L0('Автодром','Driving ground'),s:(fc?FST[fc.k].ic+' '+L0('праздник · ','holiday · '):'')+(dd?'★ '+t+'/'+MAXSTARS:L0('парковка дня ждёт','parking of the day')),prog:[t,MAXSTARS],tag:dd?'':'🆕'})+'</div>';},
  mount:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){UI.go('avtodrom');};}});
/* окно победы босса: финал региона */
var pend=null;
winSlots.push({id:'vypark-fin',order:6,zone:'extra',fit:0,render:function(ctx){pend=null;try{if(!ctx||!ctx.regionDone||!ctx.first||ctx.daily||!window.VYREG)return null;var reg=VYREG.at(ctx.idx);if(!reg)return null;css();
  var sp=regSpec(reg),nm=carN(VYPE.carId(sp.car));pend={reg:reg,idx:ctx.idx};
  return '<div class="vyp-fin"><span class="av">'+VYMG.face('mityai','happy')+'</span><span><b>🏁 '+L0('Финал региона','Region final')+'</b>'+'<span class="vyp-ft">'+L0('Машину «'+E(nm)+'» — '+(sp.kind==='dock'?'к рампе':'в гараж')+' задом, на три звезды!','Reverse the '+E(nm)+(sp.kind==='dock'?' to the ramp':' into the garage')+' — go for three stars!')+'</span></span><button class="btn sec sm noenter vyp-fgo">🅿 '+L0('Задом','Park')+'</button></div>';}catch(e){console.warn('vypark fin',e);return null;}},
  mount:function(el){var p=pend;if(!p)return;ev({m:'reg',a2:'show',k:p.reg.id});setTimeout(function(){var mo=document.getElementById('modal');if(mo&&mo.scrollHeight>mo.clientHeight+1){var c=el.querySelector('.vyp-fin');if(c)c.classList.add('sm');}},0);var b=el.querySelector('.vyp-fgo');if(b)b.onclick=function(){if(pend!==p)return;pend=null;var k=Math.floor(p.idx/10);try{hideModal();}catch(e){}
    playReg(p.reg,function(){try{openMap();if(typeof regionParty==='function')regionParty(k);}catch(e){UI.go('map');}});};}});
/* кнопка в окне праздника (fest-vy.js зовёт VYPARK.festBtn(k)) */
function festBtn(k){if(!FST[k]||!festCur())return '';var f=FST[k];return '<button class="btn sec vyp-fb noenter" onclick="try{hideModal()}catch(e){};VYPARK.fest(\''+k+'\')">🅿 '+L0('Праздничная парковка: ','Holiday parking: ')+E(en()?f.e:f.n)+'</button>';}
window.VYPARK={run:run,fest:fest,festBtn:festBtn,open:openScr,day:playDay,lot:playLot,reg:playReg,lots:LOTS,groups:GR,daySpec:daySpec,regSpec:regSpec,festSpec:festSpec,specOf:specOf,P:P,fix:pFix,merge:pMerge,
  total:total,gOpen:gOpen,lOpen:lOpen,dayDone:dayDone,dayScore:function(){return lgPts(dayDone()?P().d.s:0);}};
/* стенды */
VYMG.stand.avtodrom=function(q){var y=+(q.get('lv')||0);if(y)S.unlocked=Math.max(S.unlocked||1,y+1);openScr();};
VYMG.stand.pday=function(){playDay(function(){openScr();});};
VYMG.stand.plot=function(q){var i=+(q.get('i')||0);S.unlocked=Math.max(S.unlocked||1,200);var p=P();for(var j=0;j<i;j++)if(!p.s[j])p.s[j]=1;playLot(i);};
VYMG.stand.pfest=function(q){fest(q.get('k')||'hw',q.get('n')!=null?+q.get('n'):null);};
VYMG.stand.pfin=function(q){var n=+(q.get('lv')||20);S.unlocked=Math.max(S.unlocked||1,n);try{VY.start(n-1);}catch(e){return;}setTimeout(function(){try{win();}catch(e){console.warn(e);}},400);};
try{UI.refresh();}catch(e){}
})();
