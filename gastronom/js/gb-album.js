'use strict';
/* ================= gb-album — альбом «Дефицит»: 10 → 60 карточек + золотые + сезонные (поток META) =================
   Карточки 0–9 — старые (RARE), 10–59 — GOODS (window.GBR2.list: {k, id, n, c, dep, rep}; рисунки — GOOD_DRAW[RARE0+k] / GBR2.draw).
   Где лежат: S.album (старое поле) — номера собранных карточек 0–59: старый код сам пишет номер при тройке редкого товара
   (afterMove: S.album.push(t-RARE0)), облако сливает объединением. Карточки 56–59 на полку не ставятся — их дают «Проверки Торга»
   (новый разряд 3, 5, 7, 9) — тоже за уровни. Золотая — за уровень с тройкой дефицита без подсказок и бустеров: S.mtAg ('0/1' по k).
   Сезонные — FEST (FESTGB.cards, FESTGB.has(id), FESTGB.drawCard(canvas,id)) — здесь только показываем.
   GBR2.install() зовём сразу: RARE[k] для k ≥ 10 нужны старому коду (тост «Новое в коллекции», окно победы) — без этого уровень с 210+ упадёт.
   Выключатель GB.flag('album60') — старый экран альбома (RARE всё равно дописан — иначе падение на новых карточках).
   API: GBALB.all() → [{k,n,c,dep,rep,has,gold}], GBALB.count() → {has, all, gold}, GBALB.open(). STAT card {k, g (1 — золотая), n}. */
(function(){
if(typeof GB==='undefined'||!window.GBM)return;
var ON=GB.flag('album60')&&GBM.on;
var M=GBM,num=M.num,R=M.R,esc=M.esc,pl=M.pl,stat=M.stat;
function S_(){return typeof S!=='undefined'?S:null;}
function sv(){try{save();}catch(e){}}
function r2(){return window.GBR2&&Array.isArray(GBR2.list)?GBR2.list:[];}
// RARE[k] для новых карточек — нужен старому коду при первой же тройке 210+
GB.safe('album-install',function(){if(window.GBR2&&typeof GBR2.install==='function')GBR2.install();});

/* ---------- сохранение (золотые) ---------- */
function fix(s){s=s||S_();if(!s)return;if(typeof s.mtAg!=='string'||!/^[01]*$/.test(s.mtAg))s.mtAg='';s.mtAg=s.mtAg.slice(0,60);}
function merge(s,d){fix(s);if(!d||typeof d.mtAg!=='string')return;var a=s.mtAg,b=d.mtAg,o='';for(var i=0;i<Math.max(a.length,b.length)&&i<60;i++)o+=(a.charAt(i)==='1'||b.charAt(i)==='1')?'1':'0';s.mtAg=o.replace(/0+$/,'');}
GB.onSave({id:'album',keys:['mtAg'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function has(k){var s=S_();return Array.isArray(s.album)&&s.album.indexOf(k)>=0;}
function gold(k){var s=S_();return (s.mtAg||'').charAt(k)==='1';}
function setGold(k){var s=S_(),a=s.mtAg||'';while(a.length<=k)a+='0';s.mtAg=a.slice(0,k)+'1'+a.slice(k+1);}

/* ---------- список ---------- */
var DEPN={bakaleya:'🥫 Бакалея',hleb:'🍞 Хлебный',steklo:'🍾 Стеклотара',moloko:'🥛 Молочный',gastro:'🧀 Гастрономия',konditer:'🎂 Кондитерский',ovoshi:'🥕 Овощной',soki:'🧃 Соки-воды',ryba:'🐟 Рыбный',zakaz:'📦 Стол заказов'};
function all(){var L=[];try{RARE.slice(0,10).forEach(function(r,k){L.push({k:k,n:r.n,c:r.c,dep:'',rep:-1});});}catch(e){}
  r2().forEach(function(x){if(x&&x.k>=10&&x.k<60)L.push({k:x.k,n:x.n,c:x.c,dep:x.dep||'',rep:x.rep==null?-1:x.rep,id:x.id});});
  return L.map(function(x){x.has=has(x.k);x.gold=x.has&&gold(x.k);return x;});}
function count(){var L=all(),h=0,g=0;L.forEach(function(x){if(x.has)h++;if(x.gold)g++;});return {has:h,all:L.length,gold:g};}

/* ---------- золотая и карточки за Проверку Торга ---------- */
GB.on('ready',function(){if(typeof window.afterMove!=='function'||window.afterMove.gbAlb)return;var am=window.afterMove;
  window.afterMove=function(ev){GB.safe('alb-clears',function(){var g=G;if(!g||!ev)return;for(var i=0;i<ev.length;i++){var e=ev[i];if(e&&e.k==='clear'&&+e.t>=RARE0)g.gbRk=+e.t-RARE0;}});
    return am.apply(this,arguments);};window.afterMove.gbAlb=1;});
var news=[];
GB.levelHook.push(function(o){if(!o||o.r!=='win')return;var g=null;try{g=G;}catch(e){}if(!g)return;
  if(g.newCard>=0&&!g.gbCardSt){g.gbCardSt=1;stat('card',{k:g.newCard,n:count().has});}
  var k=g.gbRk;if(!ON||k==null||k<0||!has(k)||gold(k))return;
  if(o.mx||o.tb||g.gbHint>0||o.sk)return; // без подсказок, «Смешать», «Столика» и тупиков
  setGold(k);sv();news.push({k:'gold',c:k});stat('card',{k:k,g:1,n:count().gold});});
var TORG={3:56,5:57,7:58,9:59};
GB.on('rank',function(r){var k=TORG[r],s=S_();if(k==null||!s||!Array.isArray(s.album)||has(k))return;
  if(!r2().some(function(x){return x.k===k;}))return;s.album.push(k);sv();news.push({k:'card',c:k});stat('card',{k:k,t:1,n:count().has});});
GB.add(GB.winSlots,{id:'mt-album',order:30,zone:'extra',fit:2,render:function(){if(!ON)return '';var nn=news.splice(0),L=all(),h='';
  nn.forEach(function(x){var c=L.filter(function(y){return y.k===x.c;})[0];if(!c)return;
    if(x.k==='gold'&&R('Золотая карточка'))h+='<p class="mt-wl">🌟 '+esc(R('Золотая карточка «Дефицита»'))+': <b>'+esc(R(c.n))+'</b> — '+esc(R('без единой подсказки!'))+'</p>';
    else if(x.k==='card'&&R('Карточка от Торга'))h+='<p class="mt-wl">⭐ '+esc(R('Карточка от Торга за проверку'))+': <b>'+esc(R(c.n))+'</b></p>';});return h;}});

/* ---------- экран альбома (обёртка старого openAlbum: тот же #scr-album) ---------- */
function repName(r){try{if(window.GBU&&GBU.REPS&&GBU.REPS[r])return GBU.REPS[r].n||GBU.REPS[r].name||'';}catch(e){}return '';}
function cardHtml(x,i){var lock=!x.has,how=x.k<10?R('Ищите в коробках «Дефицит» — с 7-го уровня.'):x.k>=56?R('Торг вручает за «Проверку Торга».'):
    (x.rep>=0&&repName(x.rep)?R('Привезёте из командировки')+': '+repName(x.rep):R('Ищите в коробках «Дефицит».'));
  return '<div class="gcard'+(lock?' lock':'')+(x.gold?' mt-gold':'')+'"><canvas id="alc'+i+'"></canvas><b>'+(lock?'???':esc(R(x.n)))+(x.gold?' 🌟':'')+'</b><p>'+esc(lock?how:R(x.c))+'</p></div>';}
function draw(i,x){var id='alc'+i;if(x.k<56&&typeof cardCanvas==='function'){cardCanvas(id,RARE0+x.k);if(x.gold)goldFrame(id);return;}
  requestAnimationFrame(function(){var c=document.getElementById(id);if(!c||!window.GBR2||!GBR2.draw)return;var r=c.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),w=r.width||200,h=r.height||96;
    c.width=w*d;c.height=h*d;var g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);GB.safe('alb-draw',function(){GBR2.draw(g,x.k,w/2,h*.94,Math.min(h*1.2,w*.62));});if(x.gold)goldFrame(id);});}
function goldFrame(id){requestAnimationFrame(function(){requestAnimationFrame(function(){var c=document.getElementById(id);if(!c||!window.GBR2||!GBR2.gold)return;var g=c.getContext('2d'),d=Math.min(2,window.devicePixelRatio||1);
  g.setTransform(d,0,0,d,0,0);GB.safe('alb-gold',function(){GBR2.gold(g,c.width/d,c.height/d,1);});});});}
function render(){var gd=document.getElementById('albGrid'),sub=document.getElementById('albSub');if(!gd)return false;var L=all(),n=count();gd.innerHTML='';
  if(sub)sub.textContent=n.has+' '+R('из')+' '+n.all+' '+R('собрано')+(n.gold?' · 🌟 '+n.gold:'');
  var groups=[{t:R('⭐ Первые находки'),L:L.filter(function(x){return x.k<10;})}];
  Object.keys(DEPN).forEach(function(d){var a=L.filter(function(x){return x.k>=10&&x.k<56&&x.dep===d;});if(a.length)groups.push({t:R(DEPN[d]),L:a});});
  var rest=L.filter(function(x){return x.k>=10&&(x.k>=56||!DEPN[x.dep]);});if(rest.length)groups.push({t:R('📋 От Торга'),L:rest});
  var i=0,h='',jobs=[];groups.forEach(function(G2){if(!G2.t||!G2.L.length)return;var got=G2.L.filter(function(x){return x.has;}).length;
    h+='<div class="mt-algh">'+esc(G2.t)+' <small>'+got+'/'+G2.L.length+'</small></div>';G2.L.forEach(function(x){h+=cardHtml(x,i);jobs.push([i,x]);i++;});});
  var F=window.FESTGB&&Array.isArray(FESTGB.cards)?FESTGB.cards:[];
  if(F.length&&R('Сезонные')){var got=F.filter(function(c){return GB.safe('alb-fh',function(){return FESTGB.has(c.id);});}).length;
    h+='<div class="mt-algh">'+esc(R('🎄 Сезонные'))+' <small>'+got+'/'+F.length+'</small></div>';
    F.forEach(function(c,j){var hv=!!GB.safe('alb-fh',function(){return FESTGB.has(c.id);});h+='<div class="gcard'+(hv?'':' lock')+'"><canvas id="alf'+j+'"></canvas><b>'+(hv?esc(c.n):'???')+'</b><p>'+esc(hv?c.c:R('Бывает только в праздник.'))+'</p></div>';});}
  gd.innerHTML=h;jobs.forEach(function(j){draw(j[0],j[1]);});
  F.forEach(function(c,j){requestAnimationFrame(function(){var cv=document.getElementById('alf'+j);if(cv&&FESTGB.drawCard)GB.safe('alb-fd',function(){FESTGB.drawCard(cv,c.id);});});});
  return true;}
GB.on('ready',function(){if(typeof window.openAlbum!=='function'||window.openAlbum.gbAlb)return;var oa=window.openAlbum;
  window.openAlbum=function(){var r=oa.apply(this,arguments);if(ON)GB.safe('album60',render);
    else GB.safe('album-cnt',function(){var sub=document.getElementById('albSub'),n=(S.album||[]).length;if(sub&&RARE.length>10)sub.textContent=L(n+' из '+RARE.length+' собрано',n+' of '+RARE.length+' collected');});return r;};
  window.openAlbum.gbAlb=1;});
function open(){try{openAlbum();}catch(e){}}
window.GBALB={on:ON,all:all,count:count,open:open,gold:gold,fix:function(){fix();}};
})();
