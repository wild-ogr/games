'use strict';
/* Затея №3 «Анаграммы» (MG0). Митяй читает вопрос, а ответ у него рассыпался буквами — собери слово нажатиями по буквам.
   5 слов (ответы базы одним словом, 5–8 букв). За слово 2 очка, с подсказкой буквы — 1, «Сдаюсь» — 0. «Подсказать букву» — бесплатно 1 раз за заход.
   Ошибка не наказывает: собрал неверно — буквы возвращаются. ПК: печатай буквы, Backspace — убрать, Enter — дальше. Ё = Е. */
(function(){
if(typeof VMG_REG!=='function')return;   // оболочка не загрузилась (предохранитель перезагрузит страницу)
const N=5;
const stem=w=>w.slice(0,Math.max(4,w.length-2));
const okQ=q=>{const w=VMG.word(q);if(!w)return false;const t=q.q.toUpperCase().replace(/Ё/g,'Е');return t.indexOf(stem(w))<0&&q.q.length<=170;};
function deck(o){const len=o.lvl<3?[5,6]:[5,8];return o.take(N,{d:[1,2],one:1,len,test:okQ}).map(q=>{const w=o.word(q);let m;
  for(let t=0;t<20;t++){m=shuffle(w.split(''),o.rnd);if(m.join('')!==w)break;}return {q,w,mix:m};});}
const tierOf=s=>s>=9?3:s>=6?2:s>=3?1:0;

VMG_REG({id:'anagram',
  run(host,o){const D=deck(o);if(D.length<3){host.done({score:0,tier:0});return;}
    let i=0,sc=0,st='',hint=1,fill=[],used=[],hinted=0;
    function dots(){let h='';for(let k=0;k<D.length;k++)h+='<i class="'+(D[k].r===2||D[k].r===1?'ok':D[k].r===0?'no':k===i?'cur':'')+'"></i>';return '<div class="vmg-dots">'+h+'</div>';}
    function draw(){const d=D[i];st='play';fill=[];used=[];hinted=0;host.top('слово '+(i+1)+' из '+D.length);
      host.el.innerHTML=dots()+'<div class="vmg-card vmg-in">'+(i===0?host.say('mityai','Ох, рассыпал я ответ по буквам… Собери слово, сосед!'):'')+
        '<p class="vmg-q vm0-aq">'+esc(d.q.q)+'</p></div>'+
        '<div class="vmg-tiles vm0-slots" style="--n:'+d.w.length+'">'+d.w.split('').map((c,k)=>'<button class="vmg-tile slot" data-s="'+k+'"></button>').join('')+'</div>'+
        '<div class="vmg-tiles vm0-mix" style="--n:'+d.w.length+'">'+d.mix.map((c,k)=>'<button class="vmg-tile" data-m="'+k+'">'+c+'</button>').join('')+'</div>'+
        '<div class="vmg-row vm0-act"><button class="btn vm0-h"'+(hint?'':' disabled')+'>💡 Подсказать букву'+(hint?'':' <small>уже было</small>')+'</button><button class="btn vm0-g">Сдаюсь</button></div>'+
        (host.pc&&i===0?'<p class="vmg-hint">На компьютере — печатай буквы, '+host.kc('Backspace')+' — убрать</p>':'');
      host.el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>put(+b.dataset.m));
      host.el.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>takeBack(+b.dataset.s));
      host.el.querySelector('.vm0-h').onclick=useHint;host.el.querySelector('.vm0-g').onclick=give;}
    function paint(){const d=D[i];host.el.querySelectorAll('[data-s]').forEach((b,k)=>{const m=fill[k];b.textContent=m!=null?d.mix[m]:'';b.classList.toggle('f',m!=null);b.classList.toggle('vm0-fx',k<hinted);});
      host.el.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('used',used.indexOf(+b.dataset.m)>=0));}
    function put(m){if(st!=='play'||used.indexOf(m)>=0)return;const k=fill.findIndex(x=>x==null),pos=k<0?fill.length:k;if(pos>=D[i].w.length)return;
      fill[pos]=m;used.push(m);try{host.snd.pick();}catch(e){}paint();check();}
    function takeBack(k){if(st!=='play'||k<hinted||fill[k]==null)return;used.splice(used.indexOf(fill[k]),1);fill[k]=null;try{host.snd.tap();}catch(e){}paint();}
    function back(){for(let k=fill.length-1;k>=hinted;k--)if(fill[k]!=null){takeBack(k);return;}}
    function typed(ch){const d=D[i];ch=ch.toUpperCase().replace('Ё','Е');const m=d.mix.findIndex((c,k)=>c===ch&&used.indexOf(k)<0);if(m>=0)put(m);else try{host.snd.no();}catch(e){}}
    function useHint(){if(st!=='play'||!hint)return;hint=0;const d=D[i];
      // убрать всё, кроме уже подсказанного, и поставить следующую верную букву
      for(let k=hinted;k<fill.length;k++)if(fill[k]!=null){used.splice(used.indexOf(fill[k]),1);fill[k]=null;}
      const ch=d.w[hinted],m=d.mix.findIndex((c,k)=>c===ch&&used.indexOf(k)<0);fill[hinted]=m;used.push(m);hinted++;d.h=1;
      try{host.snd.hint();}catch(e){}const hb=host.el.querySelector('.vm0-h');hb.disabled=true;hb.innerHTML='💡 Подсказано';paint();check();}
    function check(){const d=D[i];if(fill.filter(x=>x!=null).length<d.w.length)return;const s=fill.map(m=>d.mix[m]).join('');
      if(s===d.w){win(d.h?1:2);return;}
      try{host.snd.wrong();}catch(e){}const sl=host.el.querySelector('.vm0-slots');sl.querySelectorAll('.vmg-tile').forEach(b=>b.classList.add('no'));st='wait';
      setTimeout(()=>{if(st!=='wait')return;st='play';for(let k=hinted;k<fill.length;k++)if(fill[k]!=null){used.splice(used.indexOf(fill[k]),1);fill[k]=null;}
        sl.querySelectorAll('.vmg-tile').forEach(b=>b.classList.remove('no'));paint();},o.calm?500:800);}
    function win(p){const d=D[i];d.r=p;sc+=p;st='done';try{host.snd.right();}catch(e){}finish(p?'Верно! '+(p===2?'+2 очка':'+1 очко (с подсказкой)'):'');}
    function give(){if(st!=='play')return;const d=D[i];d.r=0;st='done';fill=d.w.split('').map(()=>null);
      host.el.querySelectorAll('[data-s]').forEach((b,k)=>{b.textContent=d.w[k];b.classList.add('f');});try{host.snd.no();}catch(e){}finish('Слово было такое. Ничего — следующее!');}
    function finish(t){const d=D[i];if(d.r)host.el.querySelectorAll('[data-s]').forEach(b=>b.classList.add('ok'));
      host.el.querySelector('.vm0-act').outerHTML='<p class="vmg-x vmg-in"><b>'+esc(t)+'</b>'+(d.q.x?' '+esc(d.q.x):'')+'</p><button class="btn accent vm0-n" style="margin-top:10px">'+(i+1<D.length?'Следующее слово ▶':'Итог ▶')+(host.pc?' '+host.kc('Enter'):'')+'</button>';
      host.el.querySelector('.vmg-dots').outerHTML=dots();host.el.querySelector('.vm0-n').onclick=next;}
    function next(){if(st!=='done')return;i++;if(i>=D.length){st='end';const max=D.length*2,s10=Math.round(sc*10/max);host.done({score:sc,tier:tierOf(s10),label:D.filter(d=>d.r).length+' из '+D.length+' слов собрано'});return;}draw();}
    host.keys((k,e)=>{if(st==='play'){if(k==='Backspace'){back();return true;}if(/^[А-Яа-яЁё]$/.test(k)){typed(k);return true;}return false;}
      if(st==='done'&&(k==='Enter'||k===' ')){next();return true;}return false;});
    draw();},
  sim(o,k){let s=0;for(let j=0;j<N;j++){const r=o.rnd();s+=r<k?2:r<k+(1-k)*.5?1:0;}return {score:s,tier:tierOf(s)};}});
})();
