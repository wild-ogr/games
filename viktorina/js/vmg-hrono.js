'use strict';
/* MGA затея №6 «Хронология» (стенгазета Валерки). 3 раунда по 4 события из общего банка годов (VMA.years); расставь от раннего к позднему:
   нажимай карточки по порядку (1, 2, 3 — четвёртая встаёт сама), нажатие на отмеченную — снять её и следующие; ПК — 1–4 выбрать, Backspace — отменить, Enter — проверить/дальше.
   После проверки карточки встают по порядку и показывают годы. Очки — пары в верном порядке (из 6) за раунд, всего до 18; ступени 8/12/16. События — через o.take оболочки. */
(function(){if(typeof VMG_REG!=='function')return;
var V=window.VMA,ID='hrono',ROUNDS=3,K=4,CUT=[8,12,16],GAP=4;
function pairsOk(order,evs){var n=0;for(var a=0;a<order.length;a++)for(var b=a+1;b<order.length;b++)if(evs[order[a]].y<evs[order[b]].y)n++;return n;}
/* 3 раунда по нарастающей: 1-й — события из разных эпох, 2-й — в пределах ~150 лет, 3-й — в пределах ~60 лет (не угадаешь «по эпохе») */
var WIN=[0,150,60];
function pickSets(o){var p=V.take(o,ROUNDS*K*3,{},V.yearOf),own=p.filter(function(x){return x.own;}),rest=p.filter(function(x){return !x.own;}),q=own.concat(rest),sets=[],used={};
  function fill(s,ok,tp){for(var i=0;i<q.length&&s.length<K;i++){var x=q[i];if(used[x.i]||s.indexOf(x)>=0)continue;if(tp&&tp[x.t])continue;
      if(s.some(function(e){return Math.abs(e.y-x.y)<GAP;}))continue;if(!ok(s.concat([x])))continue;s.push(x);if(tp)tp[x.t]=1;}}
  for(var r=0;r<ROUNDS;r++){var w=WIN[r],fit=function(a){if(!w)return true;var ys=a.map(function(e){return e.y;});return Math.max.apply(0,ys)-Math.min.apply(0,ys)<=w;},s=[];
    for(var a=0;a<q.length&&s.length<K;a++){if(used[q[a].i])continue;s=[q[a]];var tp={};tp[q[a].t]=1;fill(s,fit,tp);if(s.length<K)fill(s,fit,null);}
    if(s.length<K){s=[];fill(s,function(){return true;},{});fill(s,function(){return true;},null);}
    if(s.length===K){s.forEach(function(x){used[x.i]=1;});sets.push(V.shuf(s,o&&o.rnd));}}
  V.mark(o,[].concat.apply([],sets));return sets;}
var SAY={start:'Валерка вешает стенгазету, а даты перепутал! Нажимай события <b>от самого раннего</b> к позднему.',
  r6:['Всё по порядку! Хоть в учебник.','Идеально — Валерка в восторге!'],r4:['Почти всё верно!','Неплохо, пара мест поменялась.'],r0:['Перепуталось… Смотри годы.','Ничего, история — дело хитрое.']};
function say1(a,R){return a[Math.floor((R||Math.random)()*a.length)];}
function run(host,o){var R=o.rnd||Math.random,sets=pickSets(o),st={r:0,res:[],score:0,order:[],chk:false,sets:sets};V._st[ID]=st;
  var f=V.frame(host,o,{id:ID,who:'valerka',title:'Хронология'});V.autofit(host,f);
  function evs(){return st.sets[st.r];}
  function draw(){var h='<div class="vma-paper">';evs().forEach(function(e,i){h+='<button type="button" class="vma-ev4" data-i="'+i+'"><span class="n">'+(V.pc()?'<small style="font-size:13px">'+(i+1)+'</small>':'')+'</span>'+
      '<span class="t">'+V.esc(e.ev.replace(/\s*(в|около)?\s*…\s*(году|года|г\.)?/,function(m){return /^\s*$/.test(m)?m:' ';}).replace(/\s+([.,!?])/g,'$1').replace(/\s{2,}/g,' '))+(e.own?'':'<span class="c">'+V.esc(e.ctx)+'</span>')+'</span></button>';});
    f.main.innerHTML=h+'</div><div class="vma-slot"></div>';
    f.main.querySelectorAll('.vma-ev4').forEach(function(b){b.onclick=function(){tap(+b.getAttribute('data-i'));};});}
  function marks(){var bs=f.main.querySelectorAll('.vma-ev4');bs.forEach(function(b,i){var k=st.order.indexOf(i),n=b.querySelector('.n');
      if(k>=0){b.classList.add('on');n.textContent=k+1;}else{b.classList.remove('on');n.innerHTML=V.pc()?'<small style="font-size:13px">'+(i+1)+'</small>':'';}});
    foot();}
  function foot(){if(st.chk)return;var full=st.order.length===K;
    f.foot.innerHTML='<div class="vma-row"><button type="button" class="vma-btn vma-undo"'+(st.order.length?'':' disabled')+'>Отменить'+V.kc('⌫')+'</button>'+
      '<button type="button" class="vma-btn vma-go vma-chkb"'+(full?'':' disabled')+'>Проверить'+V.kc('Enter')+'</button></div>';
    f.foot.querySelector('.vma-undo').onclick=undo;f.foot.querySelector('.vma-chkb').onclick=check;}
  function tap(i){if(st.chk||host.paused)return;var k=st.order.indexOf(i);
    if(k>=0){st.order=st.order.slice(0,k);V.snd(host,'tap');}
    else{st.order.push(i);V.snd(host,'pick');V.buzz(8);if(st.order.length===K-1)for(var j=0;j<K;j++)if(st.order.indexOf(j)<0){st.order.push(j);break;}}
    marks();if(st.order.length===K)f.say('Всё расставил? Жми <b>«Проверить»</b>.');else if(k>=0)f.say('Сняли с листа. Дальше — событие №'+(st.order.length+1)+' по порядку.');}
  function undo(){if(st.chk||!st.order.length)return;st.order.pop();if(st.order.length===K-1)st.order.pop();V.snd(host,'tap');marks();}
  function startRound(){st.order=[];st.chk=false;f.prog(ROUNDS,st.r,st.res);draw();foot();
    f.say(st.r===0?SAY.start:'Раунд '+(st.r+1)+' из '+ROUNDS+'. Снова от раннего к позднему.','norm');f.fit();}
  function check(){if(st.chk||st.order.length!==K)return;st.chk=true;var e=evs(),p=pairsOk(st.order,e);st.res.push(p>=6?3:p>=4?2:p>=3?1:0);st.score+=p;f.prog(ROUNDS,-1,st.res);
    var right=e.map(function(x,i){return i;}).sort(function(a,b){return e[a].y-e[b].y;}),paper=f.main.querySelector('.vma-paper'),bs=paper.querySelectorAll('.vma-ev4'),
      tops=[].map.call(bs,function(b){return b.offsetTop;});
    paper.classList.add('vma-chk');
    right.forEach(function(i,pos){var b=bs[i];b.disabled=true;b.classList.add(st.order[pos]===i?'good':'bad');b.querySelector('.n').textContent=e[i].y;});
    /* переставить по годам с плавным переездом */
    right.forEach(function(i){paper.appendChild(bs[i]);});
    if(!V.calm(o))right.forEach(function(i,pos){var b=bs[i],d=tops[i]-b.offsetTop;if(d){b.style.transition='none';b.style.transform='translateY('+d+'px)';void b.offsetWidth;b.style.transition='';b.style.transform='';}});
    V.snd(host,p>=6?'right':p>=4?'pick':'wrong');
    f.say(say1(p>=6?SAY.r6:p>=4?SAY.r4:SAY.r0,R)+' Верных пар: <b>'+p+' из 6</b>.',p>=4?'happy':'sad');
    var last=st.r>=ROUNDS-1;setTimeout(function(){if(!host.el.isConnected)return;V.nextBtn(f,last?'Итоги':'Следующий раунд',function(){if(last)finish();else{st.r++;startRound();}});},V.calm(o)?0:450);}
  function finish(){st.fin=true;host.done({score:st.score,tier:V.tier(st.score,CUT),label:'Верных пар: '+st.score+' из '+ROUNDS*6,extra:{max:ROUNDS*6}});}
  V.keys(host,function(k){if(st.fin)return false;
    if(st.chk){if(k==='Enter'||k===' '){var b=f.foot.querySelector('.vma-go');if(b){b.click();return true;}}return false;}
    if(/^[1-4]$/.test(k)){tap(+k-1);return true;}if(k==='Backspace'||k==='Delete'){undo();return true;}if(k==='Enter'){check();return true;}return false;});
  if(!st.sets.length){host.done({score:0,tier:0});return;}
  startRound();V.pcHint(f,'на компьютере: 1–4 по порядку, Enter');}
/* бот: игрок «помнит» год с ошибкой σ лет (плохой ~70, средний ~35, хороший ~12) */
function sim(o,k){o=o||{};var R=o.rnd||Math.random,sc=0;k=k!=null?k:.6;var sg=Math.max(5,110*(1-k));
  function gs(){var u=R()||1e-9,v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  pickSets(o).forEach(function(s){var g=s.map(function(e){return e.y+gs()*sg;}),ord=s.map(function(x,i){return i;}).sort(function(a,b){return g[a]-g[b];});sc+=pairsOk(ord,s);});
  return {score:sc,tier:V.tier(sc,CUT)};}
VMG_REG({id:ID,run:run,sim:sim});
})();
