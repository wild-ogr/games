/* RB:SHOP (блок D, 08.10) — «Пока тебя не было»: донка на ночь и подарок вернувшемуся. Ускорения за ролик НЕТ (решение владельца 08.10, п. 7).
   Донка: после рыбалки (итоги — гнездо resultSlots) или на главном (mapSlots) — «Поставить донку на ночь» на последнем месте. Через 8 ч по часам — 1–3 рыбы
     (только виды, что уже есть в альбоме; без легенд и праздничных), держится до 56 ч с постановки, потом «ушла» — без штрафа. Забрать — строкой в «Почте».
   Подарок вернувшемуся: не заходил ≥ 3 / 7 / 14 дней → Петрович в «Почте»: «Где пропадал?» и подарок по ступени (монеты от дальнего места + наживка).
   Сохранение: S.awayD {pi, t: когда поставил (мс), s: зерно} | нет; S.awayL — последний день захода (dayNum); S.awayG {d: день, k: ступень 3|7|14, g: 1 — взят}.
   Облако: awayL — максимум; awayD — более поздняя постановка; awayG — более поздний день (взят — объединение). STAT: mod {m:'away', a:'set'|'take'|'gone'|'ret'|'ret_take', k}. */
(function(){
'use strict';
var D=document,$i=function(id){return D.getElementById(id);};
function T(ru,en){return LANG==='en'?en:ru;}
var H=36e5,READY=8*H,GONE=56*H;
function ev(a,k){try{var p={m:'away',a:a};if(k!=null)p.k=k;STAT.ev('mod',p);}catch(e){}}
function fix(){var d=S.awayD;if(d!=null&&!(isObj(d)&&PLACES[d.pi]&&typeof d.t==='number'&&isFinite(d.t)))delete S.awayD;
  if(typeof S.awayL!=='number'||!isFinite(S.awayL))delete S.awayL;
  var g=S.awayG;if(g!=null&&!(isObj(g)&&typeof g.d==='number'&&[3,7,14].indexOf(g.k)>=0))delete S.awayG;}
fix();

/* ---------- донка ---------- */
function st(){var d=S.awayD;if(!d)return '';var a=nowMs()-d.t;return a<READY?'wait':a<GONE?'ready':'gone';}
function catchOf(d){var R=rng((d.s|0)+d.pi*131+7),out=[],n=1+Math.floor(R()*3),tod='night',i,k,pk,ok;
  for(i=0;i<n;i++)for(k=0;k<12;k++){pk=null;try{pk=pickFish(d.pi,'worm',tod,'clear',.7,R,undefined);}catch(e){}
    ok=pk&&pk.f&&!pk.junk&&!pk.f.leg&&!pk.f.fest&&S.alb[pk.f.id]&&S.alb[pk.f.id].n>0;if(ok){out.push({id:pk.f.id,w:pk.w});break;}}
  return out;}
function coinsOf(d,c){var s=0;c.forEach(function(x){try{s+=price(FISH[x.id],x.w,d.pi);}catch(e){}});return Math.round(s);}
function txt(c){return c.map(function(x){return nm(FISH[x.id]).toLowerCase()+' '+kgTxt(x.w);}).join(', ');}
function canSet(){return !S.awayD&&(S.sessions||0)>=3&&!OK_FREE();}
function OK_FREE(){return false;}   // ОК/Яндекс — одинаково: механика своя, без площадки
function setD(pi){if(S.awayD||!S.open[pi])return;S.awayD={pi:pi,t:nowMs(),s:Math.floor(Math.random()*1e6)};save();ev('set',pi);
  var at=new Date(nowMs()+READY),hh=('0'+at.getHours()).slice(-2)+':'+('0'+at.getMinutes()).slice(-2);
  toast('🔔 '+T('Донка стоит на «'+nm(PLACES[pi])+'». Загляни после '+hh+' — что-нибудь да попадётся.','The night line is set. Check back after '+hh+'.'),3600,true);}
function lastPi(){var p=S.awayP;return typeof p==='number'&&S.open[p]&&p!==7?p:topPlace();}
function take(){var d=S.awayD,s=st();if(!d||s==='wait')return 0;if(s==='gone'){delete S.awayD;save();ev('gone');toast('🔔 '+T('Рыба с донки ушла — бывает. Наживка цела, ставь снова.','The fish got away from the night line. Set it again.'),3200,true);return 0;}
  var c=catchOf(d),m=coinsOf(d,c);delete S.awayD;
  c.forEach(function(x){var a=S.alb[x.id]||(S.alb[x.id]={n:0,mx:0,tr:0});a.n=(a.n||0)+1;a.mx=Math.max(a.mx||0,Math.round(x.w*1000));});
  if(m)S.coins+=ern('gift',m);save();ev('take',c.length);
  toast('🔔 '+T('Донка: ','Night line: ')+(c.length?txt(c)+' · +'+coinsTxt(m):T('пусто — бывает и так','empty this time')),3600,true);return m;}
// строка в «Почте»
if(window.MAILX){
  MAILX.push({id:'donka',ok:function(){var s=st();return s==='ready'||s==='gone';},ic:'🔔',part:T('донка','the night line'),
    c:function(){var d=S.awayD;return st()==='ready'?coinsOf(d,catchOf(d)):0;},
    get t(){return st()==='gone'?T('Донка: рыба ушла','Night line: the fish got away'):T('Донка звенит! «','The night line rings! «')+(S.awayD?nm(PLACES[S.awayD.pi]):'')+'»';},
    get sub(){var d=S.awayD;if(!d||st()!=='ready')return T('без штрафа — поставь снова','no penalty — set it again');var c=catchOf(d);return c.length?txt(c):T('пусто','empty');},
    take:function(){take();}});
  // подарок вернувшемуся
  MAILX.push({id:'ret',ok:function(){var g=S.awayG;return !!(g&&!g.g);},ic:'🎁',part:T('подарок вернувшемуся','a welcome-back gift'),c:retC,
    get t(){var g=S.awayG;return T('Петрович: «Где пропадал? ','Petrovich: “Where have you been? ')+(g&&g.k>=14?T('Без тебя и клёв не тот!»','The bite isn\'t the same without you!”'):T('Мы тут без тебя скучали!»','We missed you!”'));},
    get sub(){var g=S.awayG,b=retB(g);return T('подарок за ','gift for ')+(g?g.k:3)+'+ '+T('дней','days')+(b?' · '+BAIT[b[0]].ic+' +'+b[1]:'');},
    take:function(){var g=S.awayG;if(!g||g.g)return;var c=retC(),b=retB(g);g.g=1;S.coins+=ern('gift',c);if(b)S.bait[b[0]]=(S.bait[b[0]]||0)+b[1];save();ev('ret_take',g.k);toast('🎁 '+T('С возвращением! +','Welcome back! +')+coinsTxt(c),3000,true);}});}
function retC(){var g=S.awayG;if(!g)return 0;var k=g.k>=14?6:g.k>=7?4:2;return Math.min(3000,Math.max(60,Math.round(a3Trip()*k/5)*5));}
function retB(g){if(!g||g.k<7)return null;return [a3BestBait(topPlace()),g.k>=14?30:20];}
// запоминаем место последней рыбалки (для донки)
{var sf=startFish;startFish=function(pi,opt){var r=sf.apply(this,arguments);try{if(G&&!G.tourn&&!G.guest&&!(opt&&opt.tourn)){S.awayP=pi;}}catch(e){}return r;};}
// гнёзда UX: главный экран и итоги
if(typeof slotAdd==='function'){
  if(typeof mapSlots!=='undefined')slotAdd(mapSlots,{id:'donka',pri:30,when:function(){return (S.sessions||0)>=3&&(canSet()||st()==='wait');},
    html:function(){if(st()==='wait'){var d=S.awayD,mn=Math.max(1,Math.ceil((READY-(nowMs()-d.t))/6e4)),h=Math.floor(mn/60),m=mn%60;
        return '<button class="a3m noenter rb-away" disabled>🔔 '+T('Донка на «'+esc(nm(PLACES[d.pi]))+'» — ещё ','Night line — ')+(h?h+' '+T('ч','h'):'')+(m?(h?' ':'')+m+' '+T('мин','min'):'')+'</button>';}
      return '<button class="a3m noenter rb-away">🔔 <b>'+T('Поставить донку на ночь','Set a night line')+'</b> · '+T('утром улов','catch by morning')+' ›</button>';},
    bind:function(el){var b=el.querySelector('button:not([disabled])');if(b)b.onclick=function(){SND.tap();setD(lastPi());openMap();};}});
  if(typeof resultSlots!=='undefined')slotAdd(resultSlots,{id:'donka',pri:20,when:function(c){return canSet()&&c&&c.g&&!c.g.tourn&&!c.g.guest;},
    html:function(c){return '<button class="a3m noenter rb-away">🔔 '+T('Уходишь? Поставь донку на ночь — утром улов','Leaving? Set a night line — catch by morning')+' ›</button>';},
    bind:function(el,c){var b=el.querySelector('button');if(b)b.onclick=function(){SND.tap();setD(c.g.pi);b.disabled=true;b.textContent='🔔 '+T('Донка стоит','Line is set');};}});}

/* ---------- подарок вернувшемуся: проверка один раз за запуск, после облака ---------- */
var checked=false;
function check(){if(checked||window.__demo)return;checked=true;var t=dayNum(),l=S.awayL;
  if(typeof l==='number'&&l>0&&(S.caught||0)>=1){var gap=t-l,k=gap>=14?14:gap>=7?7:gap>=3?3:0;
    if(k&&!(S.awayG&&S.awayG.d===t)){S.awayG={d:t,k:k};ev('ret',gap);}}
  S.awayL=t;save();}
{var ms=maybeStreak;maybeStreak=function(){if(window.__sdkDone)check();return ms.apply(this,arguments);};}
// облако загрузилось (или не пришло: Яндекс без входа, мак — через 25 с) — проверить; окно «Почта» открыто — перерисовать
var t0=Date.now(),pol=setInterval(function(){if(checked){clearInterval(pol);return;}if(window.__sdkDone||Date.now()-t0>25000){check();clearInterval(pol);
  try{if(S.awayG&&!S.awayG.g&&!G){if(modalOn&&$i('mlAll'))openMail();else if(!modalOn&&$i('scr-map').classList.contains('on'))maybeStreak();}}catch(e){}}},500);
// день сменился, пока игра открыта — обновить последний день
setInterval(function(){if(checked&&S.awayL!==dayNum()){S.awayL=dayNum();save();}},6e4);

/* ---------- сохранение ---------- */
{var fx=fixSave;fixSave=function(){fx.apply(this,arguments);fix();};}
{var mg=mergeSave;mergeSave=function(d,ref){var aD=S.awayD,aL=S.awayL,aG=S.awayG,aP=S.awayP;mg.apply(this,arguments);if(!isObj(d))return;
  var bL=typeof d.awayL==='number'?d.awayL:0;S.awayL=Math.max(aL||0,bL)||undefined;if(!S.awayL)delete S.awayL;
  var bD=isObj(d.awayD)?d.awayD:null;S.awayD=aD&&bD?(bD.t>aD.t?bD:aD):aD||bD||undefined;if(!S.awayD)delete S.awayD;
  var bG=isObj(d.awayG)?d.awayG:null;if(aG&&bG){S.awayG=bG.d>aG.d?bG:aG.d>bG.d?aG:{d:aG.d,k:Math.max(aG.k,bG.k),g:aG.g||bG.g?1:undefined};if(!S.awayG.g)delete S.awayG.g;}else{S.awayG=aG||bG||undefined;if(!S.awayG)delete S.awayG;}
  if(aP!=null)S.awayP=aP;fix();};}
window.__away={st:st,catchOf:catchOf,setD:setD,take:take,check:check,retC:retC,READY:READY};
})();
