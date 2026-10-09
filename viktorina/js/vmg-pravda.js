'use strict';
/* Затея №1 «Правда или байка» (MG0). Дядя Коля рассказывает 7 «фактов» из базы: вопрос + верный ответ = правда, + неверный вариант того же вопроса = байка.
   После каждого — верный ответ и пояснение. Без таймера, ошибка — просто без очка. Клавиши: ← / 1 — правда, → / 2 — байка, Enter — дальше. */
(function(){
if(typeof VMG_REG!=='function')return;   // оболочка не загрузилась (предохранитель перезагрузит страницу)
const N=7;
const BAD=/(\bНЕ\b|\bне\b[^.]*\?$|перечисл|все вариант|ни один|из этих|из них|какое из|какой из|какая из|что из)/i;
const okQ=q=>!BAD.test(q.q)&&q.q.length<=150&&q.a.every(a=>a.length<=40&&!/^(да|нет)$/i.test(a));
function deck(o){const qs=o.take(N,{d:o.lvl<3?[1]:[1,2],test:okQ});
  return qs.map(q=>{const t=o.rnd()<.5,wa=q.a[1+Math.floor(o.rnd()*3)];return {q,t,say:t?q.a[0]:wa};});}
const tierOf=s=>s>=7?3:s>=5?2:s>=3?1:0;
const OPEN=['Слышал? ','А вот скажу тебе: ','Мне в гараже рассказали: ','Точно знаю: ','Вот послушай: ','Говорят, ','Было дело: '];
const RIGHT=['В точку!','Не проведёшь тебя!','Верно говоришь!','Глаз-алмаз!'],WRONG=['Эх, провёл я тебя!','А вот и нет!','Попался!'];

VMG_REG({id:'pravda',
  run(host,o){const D=deck(o);if(D.length<3){host.el.innerHTML='<div class="vmg-card"><p class="vmg-q">Байки кончились — загляни завтра!</p></div>';setTimeout(()=>host.done({score:0,tier:0}),1500);return;}
    let i=0,sc=0,st='ask';const res=[];
    function dots(){let h='';for(let k=0;k<D.length;k++)h+='<i class="'+(res[k]===1?'ok':res[k]===0?'no':k===i?'cur':'')+'"></i>';return '<div class="vmg-dots">'+h+'</div>';}
    function draw(){const d=D[i];st='ask';host.top((i+1)+' из '+D.length);
      host.el.innerHTML=dots()+'<div class="vmg-card vmg-in">'+host.say('kolya',esc(OPEN[i%OPEN.length])+'<b>правда или байка?</b>')+
        '<p class="vmg-q">'+esc(d.q.q.replace(/\?\s*$/,''))+'?</p><p class="vm0-ans vmg-q">— '+esc(d.say)+'</p></div>'+
        '<div class="vmg-opts two"><button class="vmg-opt" data-v="1">✅ Правда'+(host.pc?' '+host.kc('1'):'')+'</button><button class="vmg-opt" data-v="0">🎣 Байка'+(host.pc?' '+host.kc('2'):'')+'</button></div>'+
        (i===0&&!o.train?'<p class="vmg-hint">Правило одно: верь или не верь. '+(o.rw[3]?'7 из 7 — +'+o.rw[3]+' 💰':'')+'</p>':'');
      host.el.querySelectorAll('.vmg-opt').forEach(b=>b.onclick=()=>pick(b.dataset.v==='1'));}
    function pick(v){if(st!=='ask')return;st='done';const d=D[i],ok=v===d.t;res[i]=ok?1:0;if(ok)sc++;
      try{ok?host.snd.right():host.snd.wrong();}catch(e){}
      host.el.querySelectorAll('.vmg-opt').forEach(b=>{b.disabled=true;const bv=b.dataset.v==='1';if(bv===v)b.classList.add(ok?'ok':'no');else if(!ok)b.classList.add('ok');else b.classList.add('dim');});
      const card=host.el.querySelector('.vmg-card');
      card.querySelector('.vmg-sb').innerHTML=esc((ok?RIGHT:WRONG)[i%(ok?4:3)])+' '+(d.t?'Это правда.':'Это байка.');
      const x=document.createElement('div');x.className='vmg-in';x.innerHTML='<p class="vmg-x"><b>Ответ: '+esc(d.q.a[0])+'.</b> '+esc(d.q.x||'')+'</p>';card.appendChild(x);
      host.el.querySelector('.vmg-dots').outerHTML=dots();
      const nb=document.createElement('button');nb.className='btn accent vm0-next';nb.style.marginTop='12px';nb.innerHTML=(i+1<D.length?'Дальше ▶':'Итог ▶')+(host.pc?' '+host.kc('Enter'):'');
      nb.onclick=next;host.el.appendChild(nb);nb.scrollIntoView&&nb.scrollIntoView({block:'nearest'});}
    function next(){if(st!=='done')return;i++;if(i>=D.length){st='end';host.done({score:sc,tier:tierOf(sc),label:sc+' из '+D.length+' — верно'});return;}draw();}
    host.keys(k=>{if(st==='ask'){if(k==='1'||k==='ArrowLeft'){pick(true);return true;}if(k==='2'||k==='ArrowRight'){pick(false);return true;}}
      else if(st==='done'&&(k==='Enter'||k===' ')){next();return true;}return false;});
    draw();},
  sim(o,k){const D=deck(o);let s=0;for(const d of D)if(o.rnd()<k+(1-k)*.5)s++;s=Math.round(s*7/Math.max(1,D.length));return {score:s,tier:tierOf(s)};}});
})();
