'use strict';
/* gb-MGA мини-игра №4 «Приём стеклотары» (сдаёт дворник Михалыч; id 'steklo'). Договор — шапка js/gmg-core.js (MG0).
   Лента: Михалыч ставит на прилавок пустую посуду (молочные, кефирные, лимонадные, минералка, банки 0,5 и 3 л — без алкоголя). Кнопки «Принять» / «Не принять».
   Всегда не принимаем: скол, трещина, чужая форма (пузырёк из-под чернил, фигурная бутылка). Правило дня (табличка) — одно из 14 правил TEXT
   (какие виды берём; немытые / с этикеткой / с крышкой — не берём). Затея дня — правило по дню, иначе по зерну.
   10 бутылок, без таймера. Ошибка не наказывает — Михалыч объясняет. Звёзды: 10 верно — 3★, 8–9 — 2★, 5–7 — 1★.
   ПК: → / 1 — принять, ← / 2 — не принять. Бутылки рисует сам файл (пустая посуда — не товар, drawGood не нужен).
   Тексты и правила — js/gmg-steklo-data.js (GMG.data.steklo). */
(function(){
if(typeof GMG_REG!=='function')return;
const ID='steklo',N=10,KINDS=['milk','kefir','lim','mineral','jar','jar3'];
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const fill=(t,c)=>String(t||'').replace(/\{(\w+)\}/g,(m,k)=>c&&c[k]!=null?c[k]:'');
const T=()=>window.GMG&&GMG.data&&GMG.data.steklo||{};
const pick=(a,r)=>a&&a.length?a[Math.floor(r()*a.length)%a.length]:'';
const tierOf=n=>n>=10?3:n>=8?2:n>=5?1:0;
function dayN(o){const d=String(o.day||0);return +d.slice(0,4)*372+(+d.slice(4,6))*31+(+d.slice(6,8));}
/* правила дня — массив GMG.data.steklo.rules [{say, short, acc:[виды; пусто — все], rej:[изъяны, с которыми не берём]}];
   скол, трещина и чужая форма (ink, odd) — не берём всегда */
const RULE0={say:'Принимаем всё целое и наше!',short:'',acc:[],rej:[]};
function rulesOf(){const R=T().rules;return Array.isArray(R)&&R.length?R:[RULE0];}
function why(b,R){const D=T(),d=D.d||{};
  if(b.t==='ink'||b.t==='odd')return (d.foreign||'чужая форма');if(b.d==='chip')return d.chip||'скол';if(b.d==='crack')return d.crack||'трещина';
  if(R.acc&&R.acc.length&&R.acc.indexOf(b.t)<0)return D.notToday||'не по правилу дня';
  if(b.d&&R.rej&&R.rej.indexOf(b.d)>=0)return d[b.d]||b.d;return '';}
function plan(o){const r=o.rnd,RS=rulesOf(),ri=(o.mode==='plan'||o.mode==='day')?dayN(o)%RS.length:Math.floor(r()*RS.length),R=RS[ri];
  const soft=['dirty','label','cap'],ruled=soft.filter(f=>(R.rej||[]).indexOf(f)>=0);
  let L=[];for(let tr=0;tr<80;tr++){L=[];
    for(let i=0;i<N;i++){const x=r();let t=x<.92?KINDS[Math.floor(r()*KINDS.length)]:x<.96?'ink':'odd';
      let d='';const y=r();if(y<.12)d='chip';else if(y<.2)d='crack';else if(ruled.length&&y<.45)d=ruled[Math.floor(r()*ruled.length)];
      else if(y<.55)d=soft[Math.floor(r()*soft.length)];
      if(d==='cap'&&!(t==='milk'||t==='kefir'||t==='mineral'||t==='lim'))d='';
      if(t==='ink'||t==='odd')d='';L.push({t,d});}
    const acc=L.filter(b=>!why(b,R)).length,byRule=L.some(b=>{const w=why(b,R);return w&&b.t!=='ink'&&b.t!=='odd'&&b.d!=='chip'&&b.d!=='crack';});
    if(acc>=4&&acc<=6&&byRule)break;}
  L.forEach(b=>{b.why=why(b,R);b.ok=!b.why;});return {rule:ri,R,L};}
function sim(o,k){const P=plan(o);let s=0;const p=Math.min(.98,.5+k*.48);for(const b of P.L)if(o.rnd()<p)s++;return {sc:s,st:tierOf(s)};}

/* ---------- посуда (пустая) ---------- */
const SH={milk:{bw:.44,bh:.55,sh:.17,nw:.3,nh:.18,c:'rgba(226,240,250,.9)',s:'#8fa9ba'},lim:{bw:.36,bh:.5,sh:.25,nw:.13,nh:.2,c:'rgba(178,220,176,.9)',s:'#5f925f'},
  jar:{bw:.4,bh:.42,sh:.04,nw:.34,nh:.06,c:'rgba(220,238,244,.85)',s:'#8aa6b0'},ink:{bw:.36,bh:.28,sh:.06,nw:.12,nh:.08,c:'rgba(150,168,225,.9)',s:'#3d4f9a'},
  odd:{bw:.24,bh:.34,sh:.32,nw:.07,nh:.32,c:'rgba(196,146,92,.9)',s:'#7d5228'},
  kefir:{bw:.4,bh:.46,sh:.14,nw:.32,nh:.12,c:'rgba(232,242,236,.9)',s:'#8aa898'},mineral:{bw:.32,bh:.52,sh:.24,nw:.12,nh:.2,c:'rgba(160,200,214,.9)',s:'#4f8296'},
  jar3:{bw:.7,bh:.7,sh:.06,nw:.5,nh:.07,c:'rgba(214,236,242,.82)',s:'#7f9ea8'}};
function bottleH(t,H){const s=SH[t];return (s.bh+s.sh+s.nh)*H*(t==='ink'?1:1);}
function bottlePath(g,s,cx,by,H){const bw=s.bw*H,bh=s.bh*H,sh=s.sh*H,nw=s.nw*H,nh=s.nh*H,r=Math.min(bw*.18,10);
  g.beginPath();g.moveTo(cx-bw/2+r,by);g.lineTo(cx+bw/2-r,by);g.quadraticCurveTo(cx+bw/2,by,cx+bw/2,by-r);g.lineTo(cx+bw/2,by-bh);
  g.quadraticCurveTo(cx+bw/2,by-bh-sh*.8,cx+nw/2,by-bh-sh);g.lineTo(cx+nw/2,by-bh-sh-nh);g.lineTo(cx-nw/2,by-bh-sh-nh);g.lineTo(cx-nw/2,by-bh-sh);
  g.quadraticCurveTo(cx-bw/2,by-bh-sh*.8,cx-bw/2,by-bh);g.lineTo(cx-bw/2,by-r);g.quadraticCurveTo(cx-bw/2,by,cx-bw/2+r,by);g.closePath();}
function drawBottle(g,b,cx,by,H,show){const s=SH[b.t];if(!s)return;g.save();g.lineJoin='round';g.lineCap='round';
  const bw=s.bw*H,bh=s.bh*H,sh=s.sh*H,nw=s.nw*H,nh=s.nh*H,top=by-bh-sh-nh;
  // тень
  g.fillStyle='rgba(60,40,20,.18)';g.beginPath();g.ellipse(cx,by+2,bw*.6,Math.max(3,bw*.08),0,0,Math.PI*2);g.fill();
  bottlePath(g,s,cx,by,H);g.fillStyle=s.c;g.fill();g.lineWidth=Math.max(2,H*.012);g.strokeStyle=s.s;g.stroke();
  // венчик горлышка
  const rh=Math.max(4,H*.03);g.fillStyle=s.c;g.fillRect(cx-nw/2-rh*.4,top-rh*.2,nw+rh*.8,rh);g.strokeRect(cx-nw/2-rh*.4,top-rh*.2,nw+rh*.8,rh);
  if(b.d==='cap'){const cw=nw+rh*1.2,chh=Math.max(6,H*.05);g.fillStyle=b.t==='kefir'?'#3f9a4a':b.t==='milk'?'#c9ced3':'#d4a53a';g.beginPath();
    g.moveTo(cx-cw/2,top+chh*.7);g.lineTo(cx-cw/2,top-chh*.3);g.quadraticCurveTo(cx,top-chh*1.1,cx+cw/2,top-chh*.3);g.lineTo(cx+cw/2,top+chh*.7);g.closePath();g.fill();
    g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.2;g.stroke();g.strokeStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(cx-cw*.3,top);g.lineTo(cx+cw*.1,top-chh*.3);g.stroke();}
  if(b.t==='jar'||b.t==='jar3'){g.strokeStyle=s.s;g.lineWidth=1.5;for(let k=1;k<3;k++){g.beginPath();g.moveTo(cx-nw/2,top+rh+k*3);g.lineTo(cx+nw/2,top+rh+k*3-2);g.stroke();}}
  if(b.t==='ink'){g.fillStyle='rgba(30,40,120,.55)';g.fillRect(cx-bw/2+3,by-bh*.35,bw-6,bh*.35-3);}
  if(b.t==='odd'){g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;for(let k=0;k<3;k++){g.beginPath();g.moveTo(cx-bw/2+bw*(k+1)/4,by-3);g.lineTo(cx-bw/2+bw*(k+1)/4,by-bh+3);g.stroke();}}
  // блик
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=Math.max(3,bw*.08);g.beginPath();g.moveTo(cx-bw*.28,by-bh*.12);g.lineTo(cx-bw*.28,by-bh*.85);g.stroke();
  // изъяны
  if(b.d==='chip'){const x=cx+nw/2,y=top-rh*.2;g.fillStyle='#f1e6d0';g.beginPath();g.moveTo(x-nw*.45,y-1);g.lineTo(x-nw*.18,y+rh*1.9);g.lineTo(x+rh*.6,y+rh*.7);g.lineTo(x+rh*.6,y-1);g.closePath();g.fill();
    g.strokeStyle='#4a5a64';g.lineWidth=1.6;g.beginPath();g.moveTo(x-nw*.45,y);g.lineTo(x-nw*.3,y+rh*.9);g.lineTo(x-nw*.18,y+rh*1.9);g.lineTo(x,y+rh*1.2);g.lineTo(x+rh*.4,y+rh*.7);g.stroke();
    g.beginPath();g.moveTo(x-nw*.18,y+rh*1.9);g.lineTo(x-nw*.1,y+rh*3);g.stroke();}
  if(b.d==='crack'){g.strokeStyle='#3f4f58';g.lineWidth=Math.max(1.6,H*.008);g.beginPath();const y0=by-bh*.8,x0=cx+bw*.05;g.moveTo(x0,y0);
    const st=[[.08,.1],[-.06,.22],[.1,.36],[-.02,.5],[.12,.62]];for(const p of st)g.lineTo(x0+p[0]*bw,y0+p[1]*bh);g.stroke();
    g.beginPath();g.moveTo(x0-.06*bw,y0+.22*bh);g.lineTo(x0-.2*bw,y0+.28*bh);g.stroke();}
  if(b.d==='dirty'){g.save();bottlePath(g,s,cx,by,H);g.clip();g.fillStyle='rgba(150,110,50,.55)';g.fillRect(cx-bw,by-bh*.22,bw*2,bh*.22);
    g.fillStyle='rgba(140,100,40,.35)';for(const p of [[-.2,.5,.12],[.15,.35,.09],[.05,.62,.07],[-.1,.28,.06]]){g.beginPath();g.ellipse(cx+p[0]*bw,by-p[1]*bh,p[2]*bw,p[2]*bw*.7,0,0,Math.PI*2);g.fill();}g.restore();}
  if(b.d==='label'){const lw=bw*.8,lh=bh*.38,lx=cx-lw/2,ly=by-bh*.72;g.fillStyle='#efe2b8';g.beginPath();g.moveTo(lx,ly);g.lineTo(lx+lw*.7,ly+3);g.lineTo(lx+lw,ly);g.lineTo(lx+lw*.95,ly+lh*.6);
    g.lineTo(lx+lw,ly+lh);g.lineTo(lx+lw*.3,ly+lh-4);g.lineTo(lx,ly+lh);g.lineTo(lx+lw*.06,ly+lh*.5);g.closePath();g.fill();g.strokeStyle='#c8a85a';g.lineWidth=1.2;g.stroke();
    g.fillStyle='#d9534f';g.fillRect(lx+lw*.12,ly+lh*.3,lw*.6,Math.max(2,lh*.12));g.fillStyle='#6b8e3d';g.fillRect(lx+lw*.12,ly+lh*.6,lw*.45,Math.max(2,lh*.1));}
  if(show){g.lineWidth=3;g.strokeStyle=b.ok?'#2b8a3e':'#c8401c';g.setLineDash([6,5]);g.strokeRect(cx-bw/2-8,top-12,bw+16,by-top+18);g.setLineDash([]);}
  g.restore();}

function run(host,o){const D=T(),P=plan(o),RL=[P.R.say||'',P.R.short||''];
  let i=-1,sc=0,money=0,fin=false,state='idle',anim=null,mark=null;const L=P.L;
  const fest=host.fest&&host.fest.id;
  host.el.innerHTML='<div class="gma-wrap gma-st'+(fest?' gma-f-'+esc(fest):'')+'"><div class="gma-say"></div>'+
    '<div class="gma-st-rule"><b>📋 '+esc(RL[0])+'</b><small>'+esc(D.always||'')+'</small></div>'+
    '<div class="gma-st-sc"><canvas></canvas></div>'+
    '<div class="gma-row gma-st-btns"><button class="btn gma-st-no">✖ '+esc(D.no||'Не принять')+(host.pc?' '+host.kc('←'):'')+'</button>'+
    '<button class="btn green gma-st-yes">✔ '+esc(D.yes||'Принять')+(host.pc?' '+host.kc('→'):'')+'</button></div></div>';
  const $=s=>host.el.querySelector(s),say=$('.gma-say'),box=$('.gma-st-sc'),cvs=$('.gma-st-sc canvas'),yB=$('.gma-st-yes'),nB=$('.gma-st-no');
  say.innerHTML=host.say('mihalych',esc(RL[0]?'Табличку видели? '+RL[0]:''),'norm');
  let W=0,H=0;
  function fit(){const w=box.clientWidth,h=box.clientHeight,d=host.dpr;if(!w||!h)return;if(w!==W||h!==H||cvs.width!==Math.round(w*d)){W=w;H=h;cvs.width=Math.round(w*d);cvs.height=Math.round(h*d);cvs.style.width=w+'px';cvs.style.height=h+'px';}}
  function draw(){fit();if(!W)return;const g=cvs.getContext('2d');g.setTransform(host.dpr,0,0,host.dpr,0,0);g.clearRect(0,0,W,H);
    // стена, окошко приёма, прилавок, ящик
    g.fillStyle='#efe3cc';g.fillRect(0,0,W,H);g.fillStyle='#d9c7a5';for(let y=18;y<H*.8;y+=22)g.fillRect(0,y,W,1);
    const cy=H*.84;g.fillStyle='#9a6234';g.fillRect(0,cy,W,H-cy);g.fillStyle='#c48a55';g.fillRect(0,cy-6,W,8);
    // вывеска
    const sw=Math.min(W*.5,220),fs=Math.round(Math.min(16,W/26));g.fillStyle='#2f5d8a';g.fillRect(W/2-sw/2,6,sw,fs+12);g.fillStyle='#fff';g.font='800 '+fs+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.fillText(D.board||'Приём стеклотары',W/2,6+(fs+12)/2+1,sw-10);
    // «наша тара» — образцы
    const ph=Math.min(H*.3,70),px=W*.06;g.fillStyle='#fffbe8';g.fillRect(px-6,H*.16,ph*1.6+12,ph+22);g.strokeStyle='#b49a64';g.strokeRect(px-6,H*.16,ph*1.6+12,ph+22);
    g.fillStyle='#5a3d22';g.font='700 '+Math.round(Math.min(11,W/40))+'px sans-serif';g.fillText('НАША ТАРА',px+ph*.8,H*.16+9);
    drawBottle(g,{t:'milk'},px+ph*.22,H*.16+ph+18,ph*.62);drawBottle(g,{t:'lim'},px+ph*.8,H*.16+ph+18,ph*.62);drawBottle(g,{t:'jar'},px+ph*1.38,H*.16+ph+18,ph*.5);
    // ящик справа
    const cw=Math.min(W*.24,150),chh=cw*.5,cx0=W-cw-W*.04;g.fillStyle='#b98549';g.fillRect(cx0,cy-chh,cw,chh);g.strokeStyle='#7a5226';g.lineWidth=2;g.strokeRect(cx0,cy-chh,cw,chh);
    for(let k=1;k<4;k++){g.beginPath();g.moveTo(cx0+cw*k/4,cy-chh);g.lineTo(cx0+cw*k/4,cy);g.stroke();}
    g.fillStyle='#5a3d22';g.font='800 '+Math.round(Math.min(15,W/28))+'px sans-serif';g.fillText(fill(D.money,{s:money}),cx0+cw/2,cy-chh-12,cw+30);
    // бутылка
    const BH=Math.min(H*.62,W*.5),b=L[i];
    if(b){let x=W/2;if(anim){const k=Math.min(1,anim.t/anim.d),e=k*k*(3-2*k);x=anim.x0+(anim.x1-anim.x0)*e;}
      drawBottle(g,b,x,cy-2,BH,mark&&mark.i===i);
      if(mark&&mark.i===i&&mark.txt){g.font='800 '+Math.round(Math.min(17,W/22))+'px sans-serif';const tw=g.measureText(mark.txt).width+18,ty=cy-bottleH(b.t,BH)-34;
        g.fillStyle=b.ok?'rgba(227,247,232,.96)':'rgba(253,230,228,.96)';g.fillRect(x-tw/2,Math.max(30,ty),tw,26);g.fillStyle=b.ok?'#1e6b31':'#a12a14';g.fillText(mark.txt,x,Math.max(30,ty)+14,W-10);}}
    g.textAlign='left';}
  host.loop(dt=>{if(anim){anim.t+=dt;if(anim.t>=anim.d){const f=anim.f;anim=null;if(f)f();}}draw();});
  host.onResize(()=>{W=0;draw();});
  const dur=()=>host.calm?0:.35;
  function slide(x0,x1,f){const d=dur();if(!d){anim=null;f&&f();return;}anim={x0,x1,t:0,d,f};}
  function next(){i++;mark=null;if(i>=L.length){end();return;}host.top((i+1)+' из '+L.length);state='in';
    if(i>0&&i%3===0&&D.chat)say.innerHTML=host.say('mihalych',esc(pick(D.chat,o.rnd)),'norm');
    slide(-W*.3,W/2,()=>{state='wait';yB.disabled=nB.disabled=false;});}
  function decide(yes){if(state!=='wait'||fin)return;state='out';yB.disabled=nB.disabled=true;const b=L[i],right=yes===b.ok;if(right)sc++;
    const tn=((D.t||{})[b.t]||[''])[0];mark={i,txt:tn+(b.why?' · '+b.why:'')};
    if(yes&&b.ok)money+=((D.t||{})[b.t]||[0,0])[1]|0;
    try{right?(yes?host.snd.drop():host.snd.back()):host.snd.bad();}catch(e){}
    const line=right?(yes?pick(D.sayOk,o.rnd):pick(D.sayBack,o.rnd)):(yes?fill(pick(D.sayWrongYes,o.rnd),{why:b.why})+(b.why?' ('+b.why+')':''):pick(D.sayWrongNo,o.rnd));
    say.innerHTML=host.say('mihalych',esc(line),right?'happy':'sad');
    const hold=host.calm?.7:(right?.55:1.1);let t=0;anim={x0:W/2,x1:W/2,t:0,d:hold,f:()=>slide(W/2,yes?W*1.25:-W*.3,next)};void t;}
  function end(){if(fin)return;fin=true;host.top('');host.finish({sc,st:tierOf(sc),h:L.length-sc,label:fill(D.label,{n:sc})});}
  yB.onclick=()=>decide(true);nB.onclick=()=>decide(false);yB.disabled=nB.disabled=true;
  host.keys(k=>{if(fin)return false;if(k==='ArrowRight'||k==='1'){decide(true);return true;}if(k==='ArrowLeft'||k==='2'||k==='Backspace'){decide(false);return true;}return false;});
  host.onQuit(()=>{fin=true;});
  host.bot=k=>{if(state!=='wait')return;const b=L[i];decide(Math.random()<k?b.ok:!b.ok);};
  host.el._mga={P,state:()=>state,i:()=>i,sc:()=>sc};
  draw();
  host.intro({who:'mihalych',text:D.intro,hint:esc(host.pc?D.hintPC||D.hint:D.hint),btn:D.btn||'Начать'}).then(()=>{fit();next();});}

GMG_REG({id:ID,deps:['js/gmg-steklo-data.js'],run,sim,plan,draw:drawBottle,
  get lines(){return T().lines||{};}});

(function(){if(document.getElementById('gma-st-css'))return;const st=document.createElement('style');st.id='gma-st-css';st.textContent=
'.gma-st-rule{margin:4px auto;width:calc(100% - 20px);max-width:560px;background:#fff8e1;border:2px dashed #e0b84c;border-radius:12px;padding:6px 10px;text-align:center;line-height:1.25}'+
'.gma-st-rule b{display:block;font-size:18px;color:#7a4a00}.gma-st-rule small{display:block;font-size:15px;color:#6b5a48}'+
'.gma-st-sc{flex:1 1 auto;min-height:200px;max-height:460px;margin:4px auto;width:calc(100% - 20px);max-width:640px;border-radius:14px;overflow:hidden;position:relative}'+
'.gma-st-sc canvas{display:block;position:absolute;left:0;top:0}'+
'.gma-st-btns .btn{min-height:62px;font-size:20px}';
document.head.appendChild(st);})();
(function(){if(document.getElementById('gma-css'))return;const st=document.createElement('style');st.id='gma-css';st.textContent=
'.gma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:4px 0 10px;min-height:0;overflow-y:auto;overflow-x:hidden;font-size:17px}'+
'.gma-say{margin:0 auto;width:calc(100% - 20px);max-width:560px;min-height:58px}'+
'.gma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 20px);max-width:560px}.gma-row .btn{flex:1 1 0;min-height:56px;font-size:18px;margin:0}'+
'.gma-row .btn[disabled]{opacity:.45}';document.head.appendChild(st);})();
})();
