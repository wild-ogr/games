'use strict';
/* MGA затея №7 «Пары» (мемори на лавочке, ведёт тётя Валя). 12 карточек рубашкой вверх = 6 пар одного вида из базы (VMA.pairs: фильм — режиссёр, книга — автор,
   картина — художник, опера/балет — композитор, республика/страна — столица). Открыл две: пара — остаются открытыми; не пара — закроются при следующем нажатии (без таймера).
   Ходы не ограничены; очки = 30 − ходы (не меньше 0); ступени по ходам: ≤ 10 — 3, ≤ 14 — 2, ≤ 20 — 1. ПК: стрелки + Enter (рамка), или 1–9, 0, -, = по номеру карточки.
   Пары — через o.take оболочки (свой круг затей). */
(function(){if(typeof VMG_REG!=='function')return;
var V=window.VMA,ID='pary',P=6,KEYS='1234567890-=';
function tierM(m){return m<=10?3:m<=14?2:m<=20?1:0;}
function pickBoard(o){var R=o&&o.rnd||Math.random,cnt={};V.pairs().forEach(function(x){cnt[x.k]=(cnt[x.k]||0)+1;});
  var kinds=V.shuf(Object.keys(V.KIND).filter(function(k){return (cnt[k]||0)>=P+2;}),R);
  for(var t=0;t<kinds.length;t++){var k=kinds[t],p=V.take(o,P+4,{},function(q){return V.pairOf(q,k);}),out=[],L={},Rr={};
    for(var i=0;i<p.length&&out.length<P;i++){var x=p[i],lk=V.norm(x.l.replace(/^\S+ /,'')).toLowerCase(),rk=V.norm(x.r).toLowerCase();if(L[lk]||Rr[rk])continue;L[lk]=Rr[rk]=1;out.push(x);}
    if(out.length===P)return {k:k,n:V.KIND[k].n,pairs:out};}
  return null;}
var SAY={start:'Открывай по две карточки — ищи пары!',got:['Пара! Так и держать.','Нашёл! Тётя Валя довольна.','Верно, это пара.'],miss:['Не пара. Запоминай, где что лежит.','Нет, не они. Нажми — перевернём.'],
  win3:'Глаз-алмаз! Все пары за {m} ходов.',win:'Все пары собраны! Ходов: {m}.'};
function say1(a,R){return a[Math.floor((R||Math.random)()*a.length)];}
function run(host,o){var R=o.rnd||Math.random,b=pickBoard(o),st={moves:0,open:[],got:0,cards:[],foc:0,fin:false,board:b};V._st[ID]=st;
  var f=V.frame(host,o,{id:ID,who:'valya',title:'Пары'});
  if(!b){host.done({score:0,tier:0});return;}
  b.pairs.forEach(function(x,i){st.cards.push({p:i,s:'l',t:x.l});st.cards.push({p:i,s:'r',t:x.r});});V.shuf(st.cards,R);
  function draw(){var h='<div class="vma-kind"><span>'+V.esc(b.n)+'</span></div><div class="vma-grid">';
    st.cards.forEach(function(c,i){h+='<button type="button" class="vma-cd" data-i="'+i+'" aria-label="Карточка '+(i+1)+'"><i class="bk"><b>?</b></i><i class="fc'+(c.s==='r'?' r':'')+'">'+V.esc(c.t)+'</i><span class="num">'+KEYS[i]+'</span></button>';});
    f.main.innerHTML=h+'</div><div class="vma-moves"></div>';f.foot.innerHTML='';
    f.main.querySelectorAll('.vma-cd').forEach(function(el){el.onclick=function(){flip(+el.getAttribute('data-i'));};});moves();}
  function el(i){return f.main.querySelector('.vma-cd[data-i="'+i+'"]');}
  function moves(){f.main.querySelector('.vma-moves').textContent='Ходов: '+st.moves+' · пар: '+st.got+' из '+P;}
  function shut(){if(st.open.length===2){st.open.forEach(function(i){var e=el(i);e.classList.remove('up','miss');e.setAttribute('aria-label','Карточка '+(i+1));});st.open=[];}}
  function flip(i){if(st.fin||host.paused)return;var c=st.cards[i];if(c.got)return;
    if(st.open.length===2)shut();if(st.open.indexOf(i)>=0)return;
    st.open.push(i);var e=el(i);e.classList.add('up');e.setAttribute('aria-label',c.t);V.snd(host,'tap');
    if(st.open.length<2)return;
    st.moves++;var a=st.cards[st.open[0]],z=st.cards[st.open[1]];
    if(a.p===z.p&&a.s!==z.s){a.got=z.got=1;st.got++;st.open.forEach(function(j){el(j).classList.add('got');});st.open=[];V.snd(host,'right');V.buzz(15);
      if(st.got===P){moves();return win();}f.say(say1(SAY.got,R),'happy');}
    else{st.open.forEach(function(j){el(j).classList.add('miss');});V.snd(host,'no');f.say(say1(SAY.miss,R),'norm');}
    moves();}
  function win(){st.fin=true;var t=tierM(st.moves);f.say((t===3?SAY.win3:SAY.win).replace('{m}',st.moves),'happy');V.snd(host,'win');
    var h='<div class="vma-list">';b.pairs.forEach(function(x){h+='<div><b>'+V.esc(x.l)+'</b> — '+V.esc(x.r)+'</div>';});
    setTimeout(function(){if(!host.el.isConnected)return;f.main.innerHTML='<div class="vma-kind"><span>'+V.esc(b.n)+'</span></div>'+h+'</div><div class="vma-moves">Ходов: '+st.moves+'</div>';
      V.nextBtn(f,'Итоги',function(){host.done({score:Math.max(0,30-st.moves),tier:t,label:'Все 6 пар за '+st.moves+' ход'+(/1[1-4]$/.test(st.moves)?'ов':st.moves%10===1?'':st.moves%10>=2&&st.moves%10<=4?'а':'ов'),extra:{moves:st.moves}});});},V.calm(o)?0:900);}
  function focus(i){st.foc=(i+12)%12;f.main.querySelectorAll('.vma-cd').forEach(function(e,j){e.classList.toggle('foc',j===st.foc);});}
  V.keys(host,function(k){if(st.fin){if(k==='Enter'||k===' '){var bb=f.foot.querySelector('.vma-go');if(bb){bb.click();return true;}}return false;}
    var n=KEYS.indexOf(k);if(n>=0&&k.length===1){focus(n);flip(n);return true;}
    var cols=f.main.querySelector('.vma-grid').offsetWidth>=560?4:3;
    if(k==='ArrowRight'){focus(st.foc+1);return true;}if(k==='ArrowLeft'){focus(st.foc-1);return true;}
    if(k==='ArrowDown'){focus(st.foc+cols);return true;}if(k==='ArrowUp'){focus(st.foc-cols);return true;}
    if(k==='Enter'||k===' '){if(!f.main.querySelector('.vma-cd.foc'))focus(st.foc);else flip(st.foc);return true;}return false;});
  draw();f.say(SAY.start,'norm');fit();host.onResize(fit);setTimeout(fit,250);try{if(window.ResizeObserver){var ro=new ResizeObserver(function(){fit();});ro.observe(f.main);host.onQuit(function(){ro.disconnect();});}}catch(e){}V.pcHint(f,'на компьютере: 1–9, 0, -, = или стрелки и Enter');
  /* карточки — по высоте поля: 4 ряда (3 колонки) или 3 ряда (4 колонки) */
  function fit(){var g=f.main.querySelector('.vma-grid');if(!g)return;var rows=g.offsetWidth>=560?3:4,mh=f.main.clientHeight-f.main.querySelector('.vma-kind').offsetHeight-f.main.querySelector('.vma-moves').offsetHeight-16,
      h=Math.max(62,Math.min(rows===3?150:120,Math.floor((mh-(rows-1)*7)/rows)));g.querySelectorAll('.vma-cd').forEach(function(c){c.style.height=h+'px';});}}
function sim(o,k){o=o||{};var R=o.rnd||Math.random;k=k!=null?k:.7;var mv=0,known={},left=12,ids=[];for(var i=0;i<12;i++)ids.push(i>>1);V.shuf(ids,R);
  var got={},seenAt={};while(left>0&&mv<60){mv++;var c=ids.map(function(x,i){return i;}).filter(function(i){return !got[i];}),a=c[Math.floor(R()*c.length)],m=-1;
    for(var j in seenAt)if(+j!==a&&!got[j]&&ids[j]===ids[a]&&R()<k)m=+j;var b=m>=0?m:c.filter(function(i){return i!==a;})[Math.floor(R()*(c.length-1))];seenAt[a]=seenAt[b]=1;
    if(ids[a]===ids[b]){got[a]=got[b]=1;left-=2;}}
  return {score:Math.max(0,30-mv),tier:tierM(mv)};}
VMG_REG({id:ID,run:run,sim:sim});
})();
