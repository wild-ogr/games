'use strict';
/* Затея №2 «Разминка» (MG0). Перед лестницей: Михалыч показывает 3 карточки «Знаешь ли ты…» по выбранной теме (вопрос, ответ, пояснение),
   потом 2 вопроса по ним (4 варианта). Оба верно — жетон Михалыча (extra.tk; ≤ 1 в день, запас ≤ 3 — оболочка).
   Тема — o.ctx.topic (нет / 'all' / новая тема без вопросов — любые). Клавиши: Enter/Пробел — дальше, 1–4 — ответ. */
(function(){
if(typeof VMG_REG!=='function')return;   // оболочка не загрузилась (предохранитель перезагрузит страницу)
const BAD=/(\bНЕ\b|перечисл|все вариант|ни один)/;
const okQ=q=>!BAD.test(q.q)&&q.x&&q.x.length>=20&&q.x.length<=220&&q.q.length<=160;
function deck(o){const tp=o.ctx&&o.ctx.topic,f={d:[1,2],x:1,test:okQ};
  let qs=tp&&tp!=='all'&&typeof BYT!=='undefined'&&BYT[tp]&&BYT[tp].length?o.take(3,Object.assign({t:tp},f)):[];
  if(qs.length<3)qs=o.take(3,f);
  const ask=qs.slice();for(let k=ask.length-1;k>0;k--){const j=Math.floor(o.rnd()*(k+1));[ask[k],ask[j]]=[ask[j],ask[k]];}
  return {qs,ask:ask.slice(0,2).map(q=>({q,perm:shuffle([0,1,2,3],o.rnd)}))};}
const tierOf=s=>s>=2?3:s===1?1:0;

VMG_REG({id:'razminka',
  run(host,o){const D=deck(o);if(D.qs.length<3){host.done({score:0,tier:0});return;}
    let ph='card',i=0,sc=0,st='';const tn=o.ctx&&o.ctx.topic&&typeof TN!=='undefined'&&TN[o.ctx.topic]?TN[o.ctx.topic]:null;
    function dots(){let h='';for(let k=0;k<5;k++){const c=k<3?(ph==='card'&&k===i?'cur':ph==='card'&&k>i?'':'ok'):(ph==='ask'&&k-3===i?'cur':ph==='ask'&&k-3<i?(D.ask[k-3].ok?'ok':'no'):'');h+='<i class="'+c+'"></i>';}return '<div class="vmg-dots">'+h+'</div>';}
    function card(){st='card';const q=D.qs[i];host.top('карточка '+(i+1)+' из 3');
      host.el.innerHTML=dots()+'<div class="vmg-card vm0-know vmg-in">'+(i===0?host.say('mihalych',tn?'Разомнёмся перед темой «'+esc(tn.n)+'». Запоминай — потом спрошу!':'Разомнёмся! Запоминай — потом спрошу два вопроса.','happy'):'')+
        '<p class="vm0-kn">💡 Знаешь ли ты…</p><p class="vmg-q">'+esc(q.q)+'</p><p class="vm0-a">'+esc(q.a[0])+'</p><p class="vmg-x">'+esc(q.x)+'</p></div>'+
        '<button class="btn accent" style="margin-top:12px">'+(i<2?'Запомнил ▶':'К вопросам ▶')+(host.pc?' '+host.kc('Enter'):'')+'</button>';
      host.el.querySelector('.btn').onclick=nextCard;}
    function nextCard(){if(st!=='card')return;i++;if(i<3){card();return;}ph='ask';i=0;ask();}
    function ask(){st='ask';const a=D.ask[i];host.top('вопрос '+(i+1)+' из 2');
      host.el.innerHTML=dots()+'<div class="vmg-card vmg-in"><p class="vmg-q">'+esc(a.q.q)+'</p></div><div class="vmg-opts">'+
        a.perm.map((p,k)=>'<button class="vmg-opt" data-k="'+k+'">'+(host.pc?host.kc(k+1)+' ':'')+esc(a.q.a[p])+'</button>').join('')+'</div>';
      host.el.querySelectorAll('.vmg-opt').forEach(b=>b.onclick=()=>answer(+b.dataset.k));}
    function answer(k){if(st!=='ask')return;st='done';const a=D.ask[i],ok=a.perm[k]===0;a.ok=ok;if(ok)sc++;
      try{ok?host.snd.right():host.snd.wrong();}catch(e){}
      host.el.querySelectorAll('.vmg-opt').forEach(b=>{b.disabled=true;const kk=+b.dataset.k;if(a.perm[kk]===0)b.classList.add('ok');else if(kk===k)b.classList.add('no');else b.classList.add('dim');});
      host.el.querySelector('.vmg-dots').outerHTML=dots();
      const nb=document.createElement('button');nb.className='btn accent';nb.style.marginTop='12px';nb.innerHTML=(i<1?'Дальше ▶':'Итог ▶')+(host.pc?' '+host.kc('Enter'):'');nb.onclick=next;host.el.appendChild(nb);}
    function next(){if(st!=='done')return;i++;if(i<2){ask();return;}st='end';
      host.done({score:sc,tier:tierOf(sc),label:sc+' из 2 — верно',extra:{tk:sc>=2?1:0}});}
    host.keys(k=>{if(st==='card'&&(k==='Enter'||k===' ')){nextCard();return true;}
      if(st==='ask'&&/^[1-4]$/.test(k)){answer(+k-1);return true;}if(st==='done'&&(k==='Enter'||k===' ')){next();return true;}return false;});
    card();},
  sim(o,k){let s=0;for(let j=0;j<2;j++)if(o.rnd()<Math.min(.97,k+.25))s++;return {score:s,tier:tierOf(s)};}});
})();
