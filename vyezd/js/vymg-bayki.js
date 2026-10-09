'use strict';
/* vy-mgb: мини-игра №9 «Байки гаража» (ведущий — Толик «Карбюратор»). 05-minigames.md №9, образец — «Правда или байка» Викторины (vmg-pravda).
   Толик рассказывает 7 историй про советские машины, правила дороги, двор и зиму — правда это или байка? После ответа — как на самом деле, с шуткой.
   Тексты — js/vymg-bayki-data.js (VYB_BAYKI, 98 штук, RU+EN). Без таймера; ошибка — просто без очка.
   Ступени: 7 из 7 — 3★, 5–6 — 2★, 3–4 — 1★, меньше — 0. Счёт — число верных.
   Круг: в обычном заходе сначала те, что ещё не попадались (host.mem().s — строка «уже слышал», по знаку на байку); в 'day' — одна семёрка на всех по зерну дня.
   Клавиши ПК: 1 / ← / A / Ф — правда, 2 / → / D / В — байка, Enter / пробел — дальше. */
(function(){if(typeof VYMG_REG!=='function'||!window.VYB)return;
const V=window.VYB,L=V.L,esc=V.esc,N=7;
const B=()=>Array.isArray(window.VYB_BAYKI)?window.VYB_BAYKI:[];
const tierOf=s=>s>=7?3:s>=5?2:s>=3?1:0;
const OPEN=[['Слышал? ','Heard this one? '],['А вот скажу тебе: ','Let me tell you: '],['Мужики в гараже говорят: ','The lads in the garage say: '],['Точно знаю: ','I know for sure: '],['Вот послушай: ','Listen to this: '],['Говорят, ','They say '],['Было дело: ','True story: ']];
const RIGHT=[['В точку!','Spot on!'],['Не проведёшь тебя!','Can’t fool you!'],['Верно говоришь!','Right you are!'],['Голова!','Smart!']],WRONG=[['Эх, провёл я тебя!','Ha, got you!'],['А вот и нет!','Nope!'],['Попался!','Caught you!']];
/* колода: 7 штук, правды и байки примерно поровну (3–4), в 'day' — одна на всех по зерну */
function deck(o,m){const all=B(),r=o.rnd||V.R(o.seed||1),idx=all.map((x,i)=>i);let pool=idx;
  if(o.mode!=='day'&&m){let s=String(m.s||'');if(s.length!==all.length)s=s.padEnd(all.length,'0').slice(0,all.length);const fresh=idx.filter(i=>s[i]!=='1');
    if(fresh.length<N*2){s='0'.repeat(all.length);pool=idx;}else pool=fresh;m.s=s;}
  const tr=V.mix(pool.filter(i=>all[i][0]),r),fl=V.mix(pool.filter(i=>!all[i][0]),r),nt=r()<.5?3:4,out=tr.slice(0,nt).concat(fl.slice(0,N-nt));
  while(out.length<N&&out.length<pool.length){const x=pool[Math.floor(r()*pool.length)];if(!out.includes(x))out.push(x);}
  return V.mix(out,r);}
function mark(m,i){try{const n=B().length;let s=String(m.s||'').padEnd(n,'0').slice(0,n);m.s=s.slice(0,i)+'1'+s.slice(i+1);}catch(e){}}
const CSS='.vyb-bk{display:flex;flex-direction:column;gap:12px;padding:10px 12px 16px;max-width:640px;width:100%;margin:auto;box-sizing:border-box}'+
 '.vyb-bk .vyb-say{margin:0}.vyb-bk .vyb-sayw{padding:0}'+
 '.vyb-bkc{position:relative;background:#fffdf7;border-radius:20px;padding:18px 18px 16px;box-shadow:0 4px 0 #ddd2b8,0 8px 18px rgba(40,50,70,.12);border:2px solid #f0e6cf}'+
 '.vyb-bkc:before{content:"";position:absolute;left:18px;right:18px;top:-7px;height:10px;border-radius:6px;background:repeating-linear-gradient(90deg,#3f86ff 0 14px,#ffc233 14px 28px);opacity:.9}'+
 '.vyb-bkq{font-size:clamp(19px,5.2vw,24px);line-height:1.3;font-weight:700;margin:4px 0 0;color:#22303f}'+
 '.vyb-bko{display:grid;grid-template-columns:1fr 1fr;gap:12px}'+
 '.vyb-bko .btn{min-height:64px;font-size:19px;display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;padding-left:8px;padding-right:8px}'+
 '.vyb-bko .btn.ok{background:#2fa84f;color:#fff;box-shadow:0 4px 0 #1d7a36}.vyb-bko .btn.no{background:#e5484d;color:#fff;box-shadow:0 4px 0 #a82a2f}.vyb-bko .btn.dim{opacity:.45}'+
 '.vyb-bkx{margin:12px 0 0;padding:12px 14px;border-radius:14px;background:#eef6ff;font-size:16.5px;line-height:1.4;color:#24364a}.vyb-bkx b{display:block;margin-bottom:2px}'+
 '.vyb-bkx.t{background:#e9f8ec}.vyb-bkx.f{background:#fff1e6}'+
 '.vyb-dots{display:flex;gap:7px;justify-content:center}.vyb-dots i{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.8);box-shadow:inset 0 0 0 2px rgba(60,80,100,.18)}'+
 '.vyb-dots i.ok{background:#2fa84f;box-shadow:none}.vyb-dots i.no{background:#e5484d;box-shadow:none}.vyb-dots i.cur{background:#ffc233;box-shadow:none;transform:scale(1.2)}'+
 '.vyb-bkn{align-self:center;min-width:200px;min-height:52px;font-size:18px}'+
 '.vyb-bkh{font-size:13.5px;color:#56657a;text-align:center;margin:0}'+
 '@media (min-width:900px) and (min-height:600px){.vyb-bk{max-width:720px;gap:16px}.vyb-bkq{font-size:28px}.vyb-bkx{font-size:19px}.vyb-bko .btn{min-height:76px;font-size:22px}.vyb-bk .vyb-say p{font-size:18px}}';
function css(){try{if(!document.getElementById('vybbkcss')){const s=document.createElement('style');s.id='vybbkcss';s.textContent=CSS;document.head.appendChild(s);}}catch(e){}}
const GAME={id:'bayki',
  run(host,o){V.intro(host,'tolik',V.esc(L('Расскажу тебе 7 историй про машины и дорогу. Где правда, а где ','I’ll tell you 7 stories about cars and roads. What’s true and what’s a '))+'<strong>'+V.esc(L('байка','tall tale'))+'</strong>'+V.esc(L(' — решай сам!',' — you decide!')),L('1 — правда, 2 — байка, Enter — дальше','1 — true, 2 — tall tale, Enter — next')).then(()=>GAME.play(host,o));},
  play(host,o){css();const m=V.mem(host),D=deck(o,m),all=B();host.el.classList.add('vyb-host');
    if(D.length<3){host.el.innerHTML=V.say(host,'tolik',esc(L('Байки кончились — заходи завтра!','Out of stories — come back tomorrow!')));setTimeout(()=>host.done({score:0,tier:0}),1500);return;}
    const box=document.createElement('div');box.className='vyb-bk';host.el.appendChild(box);
    let i=0,sc=0,st='ask';const res=[];
    function dots(){let h='';for(let k=0;k<D.length;k++)h+='<i class="'+(res[k]===1?'ok':res[k]===0?'no':k===i?'cur':'')+'"></i>';return '<div class="vyb-dots">'+h+'</div>';}
    function draw(){const f=all[D[i]];st='ask';host.top((i+1)+' / '+D.length);
      box.innerHTML=dots()+V.say(host,'tolik',esc(L(...OPEN[i%OPEN.length]))+'<strong>'+esc(L('правда или байка?','true or tall tale?'))+'</strong>')+
        '<div class="vyb-bkc vyb-pick"><p class="vyb-bkq">'+esc(L(f[1],f[2]))+'</p><div class="vyb-bkr"></div></div>'+
        '<div class="vyb-bko"><button class="btn" data-v="1">✅ '+esc(L('Правда','True'))+(host.pc?V.kc(host,'1'):'')+'</button><button class="btn" data-v="0">🙃 '+esc(L('Байка','Tall tale'))+(host.pc?V.kc(host,'2'):'')+'</button></div>'+
        (i===0?'<p class="vyb-bkh">'+esc(L('Толик то правду скажет, то приврёт. Верь или не верь!','Tolik sometimes tells the truth, sometimes fibs. Believe it or not!'))+'</p>':'');
      box.querySelectorAll('.vyb-bko .btn').forEach(b=>b.onclick=()=>pick(b.dataset.v==='1'));}
    function pick(v){if(st!=='ask'||host.paused)return;st='done';const f=all[D[i]],t=!!f[0],ok=v===t;res[i]=ok?1:0;if(ok)sc++;if(o.mode!=='day'&&!o.train)mark(m,D[i]);
      V.snd(host,ok?'coin':'honk2');V.buzz(ok?12:30);
      box.querySelectorAll('.vyb-bko .btn').forEach(b=>{b.disabled=true;const bv=b.dataset.v==='1';if(bv===v)b.classList.add(ok?'ok':'no');else if(!ok)b.classList.add('ok');else b.classList.add('dim');});
      const sb=box.querySelector('.vyb-sayw,.vyb-say');if(sb)sb.outerHTML=V.say(host,'tolik','<strong>'+esc(L(...(ok?RIGHT:WRONG)[i%(ok?4:3)]))+'</strong> '+esc(t?L('Это правда.','It’s true.'):L('Это байка.','It’s a tall tale.')),ok?'sad':'happy');
      box.querySelector('.vyb-bkr').innerHTML='<div class="vyb-bkx '+(t?'t':'f')+' vyb-pick"><b>'+(t?'✅ '+esc(L('Правда','True')):'🙃 '+esc(L('Байка','Tall tale')))+'</b>'+esc(L(f[3],f[4]))+'</div>';
      box.querySelector('.vyb-dots').outerHTML=dots();
      const nb=document.createElement('button');nb.className='btn accent vyb-bkn';nb.innerHTML=esc(i+1<D.length?L('Дальше ▶','Next ▶'):L('Итог ▶','Result ▶'))+(host.pc?V.kc(host,'Enter'):'');
      nb.onclick=next;box.appendChild(nb);try{nb.scrollIntoView({block:'nearest'});}catch(e){}}
    function next(){if(st!=='done'||host.paused)return;i++;if(i>=D.length){st='end';if(!o.train){m.n=(m.n|0)+1;m.b=Math.max(m.b|0,sc);}
        if(sc===7)V.snd(host,'win');host.done({score:sc,tier:tierOf(sc),label:sc+L(' из ',' of ')+D.length+L(' — верно',' correct')});return;}
      draw();host.el.scrollTop=0;}
    const KT={'1':1,ArrowLeft:1,a:1,A:1,'ф':1,'Ф':1,'2':0,ArrowRight:0,d:0,D:0,'в':0,'В':0}; /* KEYS: A/Ф — правда, D/В — байка, как ←/→ */
    V.keys(host,k=>{if(st==='ask'){if(k in KT){pick(KT[k]===1);return true;}}
      else if(st==='done'&&(k==='Enter'||k===' ')){next();return true;}return false;});
    draw();
    (window.__vyb||(window.__vyb={})).bayki={D,ans:()=>all[D[i]][0],pick,next,st:()=>({i,sc,st})};},
  sim(o,k){const D=deck(o,null);const r=o.rnd||V.R(o.seed||1);let s=0;for(let j=0;j<D.length;j++)if(r()<k+(1-k)*.5)s++;return {score:s,tier:tierOf(s)};}};
VYMG_REG(GAME);
})();
