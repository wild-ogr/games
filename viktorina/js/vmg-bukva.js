'use strict';
/* MGA затея №4 «Буква за буквой» (тётя Валя развешивает бельё). 4 слова-ответа из базы (одно слово 5–9 букв, лёгкий вопрос — VMA.words), вопрос — подсказка.
   Угадываешь буквы: верная — на верёвке висит буква, неверная — падает прищепка; 6 прищепок упало — слово открывается само (без «виселицы»), без таймера.
   Клавиатура на экране — 15 букв (все буквы слова + случайные лишние, по алфавиту), на ПК — печатать с клавиатуры (любая раскладка), Enter — дальше.
   Очки за слово: 0–1 ошибка — 3, 2–3 — 2, 4–5 — 1, не отгадал — 0; всего 4 слова (до 12); ступени 4/7/10. Слова — через o.take оболочки (свой круг затей). */
(function(){if(typeof VMG_REG!=='function')return;
var V=window.VMA,ID='bukva',N=4,PINS=6,KEYS=15,CUT=[4,7,10];
var ABC='АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',FREQ='ОЕАИНТСРВЛКМДПУЯЫЬГЗБЧЙХЖШЮЦЩЭФ';
function ptsOf(err,ok){return !ok?0:err<=1?3:err<=3?2:1;}
function keysFor(w,R){var u={},a=[];for(var i=0;i<w.length;i++)if(!u[w[i]]){u[w[i]]=1;a.push(w[i]);}
  var dec=FREQ.split('').filter(function(c){return !u[c];}),top=V.shuf(dec.slice(0,18),R),rest=V.shuf(dec.slice(18),R);dec=top.concat(rest);
  while(a.length<KEYS&&dec.length)a.push(dec.shift());return a.sort(function(x,y){return ABC.indexOf(x)-ABC.indexOf(y);});}
function pickWords(o){var out=[],tp={},c=V.take(o,N*3,{d:[1,2]},V.wordOf);
  c.forEach(function(x){if(out.length<N&&!tp[x.t]){tp[x.t]=1;out.push(x);}});c.forEach(function(x){if(out.length<N&&out.indexOf(x)<0)out.push(x);});return out;}
var SAY={start:['Помоги развесить слово! Жми буквы — какие на верёвке?','Угадай слово по буквам — подсказка на листке.'],
  hit:['Висит!','Есть такая!','Ровненько повесили.','Ой, молодец!'],miss:['Ой, прищепка упала…','Нету такой.','Мимо верёвки!'],
  win3:['Без единой лишней прищепки!','Как по линеечке!'],win:['Отгадал!','Всё развесили!'],fail:['Эх, прищепки кончились. Вот оно какое:','Не беда, вот слово:']};
function say1(a,R){return a[Math.floor((R||Math.random)()*a.length)];}

function run(host,o){var R=o.rnd||Math.random,words=pickWords(o),st={i:0,res:[],score:0,w:null,got:{},err:0,done:false,words:words};V._st[ID]=st;
  var f=V.frame(host,o,{id:ID,who:'valya',title:'Буква за буквой'});V.autofit(host,f);
  function letterIn(c){return st.w.w.indexOf(c)>=0;}
  function draw(){var w=st.w.w,cl='',pins='';for(var i=0;i<w.length;i++){var c=w[i],on=st.got[c]||st.done;cl+='<div class="vma-cl'+(st.got[c]?'':st.done?' miss':'')+'" data-i="'+i+'">'+(on?c:'')+'</div>';}
    for(var k=0;k<PINS;k++)pins+='<div class="vma-pin'+(k<st.err?' off':'')+'"></div>';
    f.main.innerHTML='<div class="vma-hint"><small>Подсказка</small>'+V.esc(st.w.q)+'</div><div class="vma-line"><div class="vma-pins">'+pins+'</div><div class="vma-cloth">'+cl+'</div></div><div class="vma-slot"></div>';}
  function kb(){var ks=keysFor(st.w.w,R),h='<div class="vma-kb">';ks.forEach(function(c){h+='<button type="button" class="vma-k" data-c="'+c+'" aria-label="Буква '+c+'">'+c+'</button>';});
    f.foot.innerHTML=h+'</div>';f.foot.querySelectorAll('.vma-k').forEach(function(b){b.onclick=function(){press(b.getAttribute('data-c'));};});}
  function startWord(){st.w=st.words[st.i];st.got={};st.err=0;st.done=false;f.prog(N,st.i,st.res);draw();kb();
    f.say(st.i===0?say1(SAY.start,R):'Слово '+(st.i+1)+' из '+N+'. Букв — <b>'+st.w.w.length+'</b>.','norm');f.fit();}
  function press(c){if(st.done||host.paused)return;c=V.norm(c).toUpperCase();var b=f.foot.querySelector('.vma-k[data-c="'+c+'"]');
    if(!b){var kbd=f.foot.querySelector('.vma-kb');if(kbd){kbd.classList.remove('vma-shake');void kbd.offsetWidth;kbd.classList.add('vma-shake');}f.say('Такой буквы на столе нет — выбери из тех, что внизу.');return;}
    if(b.disabled)return;b.disabled=true;
    if(letterIn(c)){st.got[c]=1;b.classList.add('ok');V.snd(host,'pick');V.buzz(8);
      var cls=f.main.querySelectorAll('.vma-cl');for(var i=0;i<st.w.w.length;i++)if(st.w.w[i]===c){cls[i].textContent=c;cls[i].classList.remove('on');void cls[i].offsetWidth;cls[i].classList.add('on');}
      var all=true;for(var j=0;j<st.w.w.length;j++)if(!st.got[st.w.w[j]])all=false;
      if(all)return endWord(true);f.say(say1(SAY.hit,R),'happy');}
    else{st.err++;b.classList.add('no');V.snd(host,'no');V.buzz(30);var pin=f.main.querySelectorAll('.vma-pin')[st.err-1];if(pin)pin.classList.add('off');
      if(st.err>=PINS)return endWord(false);f.say(say1(SAY.miss,R)+' Осталось прищепок: <b>'+(PINS-st.err)+'</b>.','sad');}}
  function endWord(ok){st.done=true;var p=ptsOf(st.err,ok);st.res.push(p);st.score+=p;
    /* STAT: слово — ответ на вопрос базы с id → ответ в статистику (просьба STAT; без оболочки STATANS — молчим) */
    try{if(!o.train&&window.STATANS&&STATANS.ans)STATANS.ans({id:st.w.i,ok:ok,mode:'vmg-bukva',step:0,price:0,tries:1,sec:0,d:0,hint:''});}catch(e){}f.prog(N,-1,st.res);
    f.foot.querySelectorAll('.vma-k').forEach(function(b){b.disabled=true;});
    if(!ok){var cls=f.main.querySelectorAll('.vma-cl');for(var i=0;i<cls.length;i++)if(!cls[i].textContent){cls[i].textContent=st.w.w[i];cls[i].classList.add('miss');}}
    V.snd(host,ok?'right':'wrong');
    f.say(ok?(p===3?say1(SAY.win3,R):say1(SAY.win,R))+' +'+p+'&nbsp;'+(p===1?'очко':'очка'):say1(SAY.fail,R)+' <b>'+st.w.w+'</b>',ok?'happy':'sad');
    var slot=f.main.querySelector('.vma-slot');if(st.w.x)slot.innerHTML='<div class="vma-note"><b>Тётя Валя:</b> '+V.esc(st.w.x)+'</div>';V.reveal(f);
    var last=st.i>=N-1;
    setTimeout(function(){if(!host.el.isConnected)return;V.nextBtn(f,last?'Итоги':'Следующее слово',function(){if(last)finish();else{st.i++;startWord();}});},calmMs(450));}
  function calmMs(ms){return V.calm(o)?0:ms;}
  function finish(){st.fin=true;var g=st.res.filter(function(p){return p>0;}).length;host.done({score:st.score,tier:V.tier(st.score,CUT),label:'Отгадано слов: '+g+' из '+N+' · '+st.score+' очк. из '+N*3,extra:{words:g,max:N*3}});}
  V.keys(host,function(k,e){if(st.fin)return false;if(st.done){if(k==='Enter'||k===' '){var b=f.foot.querySelector('.vma-go');if(b){b.click();return true;}}return false;}
    var c=V.ruKey(e);if(c){press(c);return true;}return false;});
  if(!st.words.length){f.say('Слов не нашлось…');host.done({score:0,tier:0});return;}
  startWord();V.pcHint(f,'на компьютере: печатай буквы');}
/* быстрый подсчёт для баланса: игрок угадывает букву слова с вероятностью p (знание) — сколько ошибок */
function sim(o,k){o=o||{};var R=o.rnd||Math.random,p=k!=null?k:.6,sc=0,ws=pickWords(o);
  ws.forEach(function(w){var ks=keysFor(w.w,R),need={},n=0,err=0;for(var i=0;i<w.w.length;i++)if(!need[w.w[i]]){need[w.w[i]]=1;n++;}
    var bad=ks.filter(function(c){return !need[c];});while(n>0&&err<PINS){if(R()<p||!bad.length)n--;else{bad.pop();err++;}}sc+=ptsOf(err,n===0);});
  return {score:sc,tier:V.tier(sc,CUT)};}
VMG_REG({id:ID,run:run,sim:sim});
})();
