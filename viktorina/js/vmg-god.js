'use strict';
/* MGA затея №5 «Угадай год» (отрывной календарь Михалыча). 5 событий из базы (VMA.years: «В каком году …?» и пояснения с одним годом), год — барабаном из 4 цифр.
   Барабан: ▲/▼ над/под каждой цифрой (тысячи, сотни, десятки, единицы); ПК — ← → ±1, ↑ ↓ ±10, PageUp/PageDown ±100, можно напечатать цифры, Enter — «Отвечаю».
   Очки (мягко, решение владельца 09.10): ±2 года — 3, ±10 — 2, ±25 — 1, дальше — 0; всего до 15; ступени 4/8/11. Без таймера. События — через o.take оболочки (свой круг затей). */
(function(){if(typeof VMG_REG!=='function')return;
var V=window.VMA,ID='god',N=5,CUT=[4,8,11],START=1950;
function pts(d){d=Math.abs(d);return d<=2?3:d<=10?2:d<=25?1:0;}
function pickEv(o){var c=V.take(o,N*3,{},V.yearOf),out=[],old=0,tp={};
  for(var pass=0;pass<2;pass++)c.forEach(function(x){if(out.length>=N||out.indexOf(x)>=0)return;if(out.some(function(e){return e.y===x.y;}))return;
    if(!pass&&((x.y<1700&&old>=1)||(tp[x.t]||0)>=2))return;if(x.y<1700)old++;tp[x.t]=(tp[x.t]||0)+1;out.push(x);});
  return out;}
var SAY={start:'Год на листке стёрся! Крути цифры — когда это было?',
  p3:['В точку! Как по календарю.','Ну ты голова! Точно.'],p3n:['Почти в точку! Засчитываю.','Год-другой — не беда, молодец!'],p2:['Почти! Совсем рядом.','Близко, близко!'],p1:['Где-то рядом ходишь.','Около того!'],p0:['Нет, это было в другое время.','Эх, промахнулся.']};
function say1(a,R){return a[Math.floor((R||Math.random)()*a.length)];}
function run(host,o){var R=o.rnd||Math.random,evs=pickEv(o),st={i:0,res:[],score:0,y:START,sel:3,done:false,evs:evs};V._st[ID]=st;
  var f=V.frame(host,o,{id:ID,who:'mihalych',title:'Угадай год'});V.autofit(host,f);
  function digits(){return String(st.y).padStart(4,'0').split('');}
  function draw(){var e=st.evs[st.i];
    f.main.innerHTML='<div class="vma-cal"><div class="vma-calh">Календарь · листок '+(st.i+1)+' из '+N+'</div><div class="vma-ev">'+V.esc(e.ev)+'</div>'+(e.ctx?'<div class="vma-ctx">'+V.esc(e.ctx)+'</div>':'')+'</div>'+
      '<div class="vma-drum" role="group" aria-label="Год">'+[0,1,2,3].map(function(k){var st10=Math.pow(10,3-k);
        return '<div class="vma-dc'+(k===st.sel?' sel':'')+'" data-k="'+k+'"><button type="button" data-d="'+st10+'" aria-label="плюс '+st10+'">▲</button><div class="vma-dg"><span></span></div><button type="button" data-d="-'+st10+'" aria-label="минус '+st10+'">▼</button></div>';}).join('')+'</div>'+
      '<div class="vma-yr">'+(V.pc()?'← → ±1 · ↑ ↓ ±10 · или напечатай год':'')+'</div><div class="vma-slot"></div>';
    f.main.querySelectorAll('.vma-dc button').forEach(function(b){b.onclick=function(){if(st.done)return;var dc=b.parentNode;st.sel=+dc.getAttribute('data-k');add(+b.getAttribute('data-d'));};});
    f.main.querySelectorAll('.vma-dg').forEach(function(g,k){g.onclick=function(){if(st.done)return;st.sel=k;showY(0);};});
    showY(0);}
  function showY(dir){var d=digits();f.main.querySelectorAll('.vma-dc').forEach(function(c,k){c.classList.toggle('sel',k===st.sel&&V.pc());var g=c.querySelector('.vma-dg'),s=g.firstChild;
      if(s.textContent!==d[k]){s.textContent=d[k];if(dir){g.classList.remove('up','dn');void g.offsetWidth;g.classList.add(dir>0?'up':'dn');}}});
    f.main.querySelector('.vma-drum').setAttribute('aria-label','Год '+st.y);}
  function add(d){var y=Math.max(800,Math.min(2029,st.y+d));if(y===st.y){V.snd(host,'no');return;}st.y=y;typed='';V.snd(host,'tap');showY(d);}
  function foot(){f.foot.innerHTML='<button type="button" class="vma-btn vma-go">Отвечаю'+V.kc('Enter')+'</button>';f.foot.firstChild.onclick=answer;}
  function startEv(){st.done=false;st.y=START;st.sel=3;typed='';f.prog(N,st.i,st.res);draw();foot();f.say(st.i===0?SAY.start:'Листок '+(st.i+1)+' из '+N+'. Когда это было?','norm');f.fit();}
  function answer(){if(st.done||host.paused)return;st.done=true;var e=st.evs[st.i],d=st.y-e.y,p=pts(d);st.res.push(p);st.score+=p;f.prog(N,-1,st.res);
    f.main.querySelectorAll('.vma-dc button').forEach(function(b){b.disabled=true;});
    V.snd(host,p>=2?'right':p?'pick':'wrong');if(!d)V.buzz(20);
    f.say(say1(SAY[p===3&&d?'p3n':'p'+p],R),p>=2?'happy':p?'norm':'sad');
    f.main.querySelector('.vma-yr').innerHTML='';f.main.querySelector('.vma-drum').style.display='none';
    f.main.querySelector('.vma-slot').innerHTML='<div class="vma-res">'+(d?'<span class="vma-was">ты: '+st.y+'</span>':'')+'<span class="vma-big">'+e.y+'</span><span class="vma-tag '+(p>=2?'ok':p?'':'no')+'">'+(p?'+'+p:'0')+'</span></div>'+
      '<div class="vma-note">'+V.esc(e.full)+'</div>';f.fit();V.reveal(f);
    var last=st.i>=N-1;setTimeout(function(){if(!host.el.isConnected)return;V.nextBtn(f,last?'Итоги':'Следующий листок',function(){if(last)finish();else{st.i++;startEv();}});},V.calm(o)?0:400);}
  function finish(){st.fin=true;host.done({score:st.score,tier:V.tier(st.score,CUT),label:st.score+' очк. из '+N*3+' · в точку (±2 года): '+st.res.filter(function(p){return p===3;}).length+' из '+N,extra:{max:N*3}});}
  var typed='';
  V.keys(host,function(k,e){if(st.fin)return false;
    if(st.done){if(k==='Enter'||k===' '){var b=f.foot.querySelector('.vma-go');if(b){b.click();return true;}}return false;}
    if(k==='ArrowLeft'){add(-1);return true;}if(k==='ArrowRight'){add(1);return true;}if(k==='ArrowUp'){add(10);return true;}if(k==='ArrowDown'){add(-10);return true;}
    if(k==='PageUp'){add(100);return true;}if(k==='PageDown'){add(-100);return true;}
    if(/^[0-9]$/.test(k)){typed=(typed+k).slice(-4);if(typed.length===4||(+typed>=800&&typed.length===3)){var y=+typed;if(y>=800&&y<=2029){st.y=y;showY(1);}}V.snd(host,'tap');return true;}
    if(k==='Enter'){answer();return true;}return false;});
  if(!st.evs.length){host.done({score:0,tier:0});return;}
  startEv();V.pcHint(f,'на компьютере: стрелки или цифры, Enter');}
function sim(o,k){o=o||{};var R=o.rnd||Math.random,sc=0;k=k!=null?k:.5;pickEv(o).forEach(function(){var r=R(),d=r<k*.35?0:r<k*.8?2:r<k*1.2?8:25;sc+=pts(d);});return {score:sc,tier:V.tier(sc,CUT)};}
VMG_REG({id:ID,run:run,sim:sim});
})();
