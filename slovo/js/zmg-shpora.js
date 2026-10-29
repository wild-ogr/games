'use strict';
(function(){
if(typeof ZMG_REG!=='function')return;
const ROWS=5,CLS=11,HP=3,TH=[5,15,25];
const tierOf=n=>n>=TH[2]?3:n>=TH[1]?2:n>=TH[0]?1:0;
function mk(rnd){const s={rnd,cls:1,pos:0,mx:0,desks:0,hp:HP,tch:'write',tt:2.2,val:null,frz:0,done:false,ev:[],t:0};return s;}
function tch(s,st){const r=s.rnd,c=s.cls;s.tch=st;
s.tt=st==='write'?(1.3+r()*2)/(1+c*.12):st==='warn'?Math.max(.3,.72-c*.1):st==='look'?0.9+r()*.9:0;}
function valNew(s){s.val={d:1+Math.floor(s.rnd()*3)+.5,st:'read',tt:1.2+s.rnd()*1.4};}
function valStep(s,dt){const v=s.val;if(!v)return;v.tt-=dt;if(v.tt>0)return;const r=s.rnd;
if(v.st==='read'){v.st='up';v.tt=.4;}else if(v.st==='up'){v.st='peek';v.tt=.8+r()*.6;}else{v.st='read';v.tt=1.3+r()*1.4;}}
const valNear=s=>!!s.val&&Math.abs(s.pos-s.val.d)<.55;
function caught(s,who){s.hp--;s.frz=1;s.ev.push({e:'caught',who});s.pos=Math.max(0,Math.floor(s.pos-.01)-(s.pos%1<.3?1:0));if(s.hp<=0){s.done=true;s.ev.push({e:'over'});}}
function step(s,dt,hold){if(s.done)return;s.t+=dt;
if(s.frz>0){s.frz-=dt;if(s.frz<=0)tch(s,'write');return;}
s.tt-=dt;if(s.tt<=0){if(s.tch==='write'){tch(s,'warn');s.ev.push({e:'warn'});}
else if(s.tch==='warn'){if(s.cls>=4&&s.rnd()<Math.min(.45,.2+s.cls*.03)){tch(s,'write');s.ev.push({e:'fake'});}else{tch(s,'look');s.ev.push({e:'look'});}}
else{tch(s,'write');s.ev.push({e:'back'});}}
valStep(s,dt);
if(!hold)return;
if(s.tch==='look'){caught(s,'vp');return;}
if(s.val&&s.val.st==='peek'&&valNear(s)){caught(s,'val');return;}
const sp=1/(.78-Math.min(s.cls,8)*.04),p0=s.pos;s.pos+=dt*sp;
void p0;if(Math.floor(s.pos)>s.mx&&s.pos<ROWS+1){s.mx=Math.min(ROWS,Math.floor(s.pos));s.desks=(s.cls-1)*ROWS+s.mx;s.ev.push({e:'desk'});}
if(s.pos>=ROWS){s.ev.push({e:'cls',c:s.cls});if(s.cls>=CLS){s.done=true;s.ev.push({e:'win'});return;}
s.cls++;s.pos=0;s.mx=0;s.frz=1.1;s.val=null;if(s.cls>=3)valNew(s);}}
function botHold(s,b,k,dt){
if(s.tch==='warn'){if(!b.w)b.rt=.3+.35*(1-k)+s.rnd()*.25*(1-k);b.w=(b.w||0)+dt;if(b.w>=b.rt)return false;return b.h;}b.w=0;
if(s.tch!=='write'||s.frz>0)return false;
if(s.val&&(s.val.st!=='read')&&s.pos+.35>=s.val.d-.55&&s.pos<s.val.d+.55)return false;
if(s.val&&s.val.st==='read'&&s.val.tt<.3-.2*k&&s.pos+.6>=s.val.d-.55&&s.pos<s.val.d+.55)return false;
return true;}
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const BACK='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M14 100 q4 -36 36 -40 q32 4 36 40z" fill="#2c3f6b"/><ellipse cx="50" cy="42" rx="21" ry="24" fill="#6b5a4e"/><circle cx="50" cy="22" r="12" fill="#5a4a40"/><path d="M76 70 l14 -26" stroke="#f2c9a8" stroke-width="7" stroke-linecap="round"/><circle cx="90" cy="42" r="3" fill="#fff"/></svg>';
const NOTE='<svg viewBox="0 0 40 30" aria-hidden="true"><path d="M3 5 l30 -3 l4 22 l-30 4z" fill="#fffef6" stroke="#9aa3b5" stroke-width="1.5"/><path d="M9 11 h18 M9 16 h20 M10 21 h12" stroke="#5a7bd0" stroke-width="1.6"/></svg>';
const KID=(c,h)=>'<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="15" r="10" fill="#f2c9a8"/><path d="M10 13 q10 -12 20 0 q-3 -8 -10 -8 q-7 0 -10 8z" fill="'+h+'"/><path d="M5 40 q2 -14 15 -14 q13 0 15 14z" fill="'+c+'"/></svg>';
const CSS='.zr-sp{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;background:#efe6d1;user-select:none;-webkit-user-select:none}'+
'.zr-sph{display:flex;justify-content:space-between;align-items:center;padding:5px 12px;font-weight:800;font-size:16px;color:#27324a}.zr-sph .zr-hp{color:#c62f2a;font-size:20px;letter-spacing:2px}'+
'.zr-bd{position:relative;margin:0 10px;height:92px;border-radius:8px;background:#2f5d4a;border:6px solid #8a5a2b;box-sizing:border-box;flex:0 0 auto}'+
'.zr-ch{position:absolute;left:10px;top:8px;color:#e9f0e8;font:700 14px/1.35 Georgia,serif;opacity:.9}'+
'.zr-vp{position:absolute;right:22px;bottom:-34px;width:84px;height:96px}.zr-vp svg{width:100%;height:100%}.zr-vp .f{display:none;border-radius:50%;overflow:hidden;width:84px;height:84px;background:#fff;box-shadow:0 0 0 4px #c62f2a}'+
'.zr-vp.look .b{display:none}.zr-vp.look .f{display:block}'+
'.zr-kh{position:absolute;right:104px;top:20px;background:#fff;color:#c62f2a;font-weight:900;font-size:20px;padding:4px 10px;border-radius:14px;display:none;box-shadow:0 2px 6px rgba(0,0,0,.25)}'+
'.zr-sp.warn .zr-kh{display:block;animation:zrkh .35s ease-in-out infinite alternate}@keyframes zrkh{to{transform:scale(1.15)}}'+
'.zr-sp.warn .zr-room{box-shadow:inset 0 0 0 4px #e8a33b}.zr-sp.look .zr-room{box-shadow:inset 0 0 0 4px #c62f2a}'+
'.zr-room{position:relative;flex:1;margin:40px 10px 0;border-radius:10px;min-height:200px;transition:box-shadow .15s}'+
'.zr-desk{position:absolute;left:8%;right:8%;height:12%;min-height:34px;border-radius:6px;background:#b9864f;box-shadow:0 4px 0 #8a5a2b;display:flex;align-items:center;justify-content:space-between;padding:0 6%;box-sizing:border-box}'+
'.zr-desk .k{width:34px;height:34px;margin-top:-26px}.zr-desk .k svg{width:100%;height:100%}.zr-desk i{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-style:normal;font-size:12px;color:#fff3dd;font-weight:800;white-space:nowrap;opacity:.9}'+
'.zr-val{position:absolute;right:2%;width:46px;text-align:center;font-size:12px;font-weight:800;color:#2f6b2f}.zr-val .k{width:40px;height:40px;margin:0 auto}.zr-val b{display:block;font-size:20px;line-height:1}'+
'.zr-val.up b,.zr-val.peek b{color:#c62f2a}.zr-val.peek{animation:zrkh .3s ease-in-out infinite alternate}'+
'.zr-nt{position:absolute;left:50%;width:46px;height:34px;margin-left:-23px;z-index:2;transition:top .05s linear}.zr-nt svg{width:100%;height:100%;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3))}'+
'.zr-hold{margin:8px 12px 10px;min-height:62px;border:0;border-radius:16px;background:#2563c9;color:#fff;font:inherit;font-weight:900;font-size:19px;box-shadow:0 5px 0 #1a4a91;touch-action:none;cursor:pointer}'+
'.zr-hold.on{background:#237a3b;box-shadow:0 2px 0 #18562a;transform:translateY(3px)}.zr-sp.look .zr-hold.on{background:#c62f2a}'+
'.zr-msg{position:absolute;left:0;right:0;top:38%;text-align:center;font-weight:900;font-size:24px;color:#c62f2a;text-shadow:0 2px 0 #fff;pointer-events:none;animation:zrfl2 1.3s ease-out forwards;z-index:3}'+
'.zr-msg.g{color:#237a3b}@keyframes zrfl2{0%{transform:scale(.6);opacity:0}15%{transform:scale(1.05);opacity:1}80%{opacity:1}100%{opacity:0}}'+
'@media (min-width:700px){.zr-sph,.zr-bd,.zr-room,.zr-hold{width:620px;max-width:calc(100% - 20px);margin-left:auto;margin-right:auto;box-sizing:border-box}.zr-hold{display:block}}'+
'@media (max-height:600px){.zr-bd{height:74px}.zr-vp{width:70px;height:80px;bottom:-30px}.zr-vp .f{width:70px;height:70px}.zr-room{margin-top:32px}}'+
'@media (prefers-reduced-motion:reduce){.zr-kh,.zr-val.peek,.zr-msg{animation:none}}';
const CAUGHT={vp:['Дневник на стол!','Так-так. Что это у нас?','Шпаргалку — мне!'],val:['Валерка настучал!','«Валентина Петровна, а они записки пишут!»']};
const CLSAY=['','Первый класс прошли! Дальше — второй.','Второй класс! Завуч стала шустрее.','Третий класс! Осторожно: Валерка-отличник всё видит.','Четвёртый! Завуч хитрит — может кхмыкнуть и не обернуться.','Пятый класс! Средняя школа, держись.','Шестой! Завуч уже без очков видит.','Седьмой! Записка стала толще — там формулы.','Восьмой! Валерка теперь староста.','Девятый! Скоро экзамены.','Десятый! Последний рывок до выпускного.'];
ZMG_REG({id:'shpora',a:'Держи — записка ползёт по партам. «Кхм» — отпускай!',ns:'Записки на контрольной? У меня? Ну попробуйте…',
open:()=>true,finWho:'vp',
lines:{good:'Так. Шпаргалку — мне. А передавать вы умеете, это я признаю.',ok:'Ловко! Но я вас всё равно видела.',bad:'Дневник на стол! Ничего, на следующей перемене получится.'},
sim(o,k){const s=mk(o.rnd),b={h:false};let n=0;while(!s.done&&n<4000){b.h=botHold(s,b,k,.05);step(s,.05,b.h);s.ev.length=0;n++;}return{sc:s.desks,st:tierOf(s.desks)};},
run(host,o){if(!document.getElementById('zrSpCss')){const st=document.createElement('style');st.id='zrSpCss';st.textContent=CSS;document.head.appendChild(st);}
const s=mk(o.rnd),b={h:false};let hold=false,on=false,fin=false,tm=0;
host.el.innerHTML='<div class="zr-sp"><div class="zr-sph"><span class="zr-cl">1-й класс</span><span>Парт: <b class="zr-dk">0</b></span><span class="zr-hp">♥♥♥</span></div>'+
'<div class="zr-bd"><div class="zr-ch">Контрольная. Вариант 1.<br>Подчеркни подлежащее…</div><div class="zr-kh">Кхм…</div><div class="zr-vp"><span class="b">'+BACK+'</span><span class="f">'+host.face('vp','norm')+'</span></div></div>'+
'<div class="zr-room"></div><button type="button" class="zr-hold">✋ Держи — передаю</button></div>';
const $=q=>host.el.querySelector(q),root=$('.zr-sp'),room=$('.zr-room'),vp=$('.zr-vp'),btn=$('.zr-hold');
const COLS=['#c0392b','#2c6fb8','#8e44ad','#16a085','#d35400','#2c3e50'],HAIR=['#5a3a22','#d9a441','#2b2b2b','#8a5a2b','#b5651d','#3b2a1a'];
let desks='';for(let i=0;i<=ROWS;i++){const top=(100-(i/ROWS)*86-12);
desks+='<div class="zr-desk" style="top:'+top+'%"><span class="k">'+KID(COLS[i],HAIR[i])+'</span><span class="k">'+KID(COLS[(i+3)%6],HAIR[(i+2)%6])+'</span><i>'+(i===0?'задняя парта':i===ROWS?'первая парта':'')+'</i></div>';}
room.innerHTML=desks+'<div class="zr-val" style="display:none"><span class="k">'+KID('#2f6b2f','#c98f3a')+'</span><b>📖</b>Валерка</div><div class="zr-nt">'+NOTE+'</div>';
const nt=$('.zr-nt'),val=$('.zr-val');
const yOf=p=>(100-(p/ROWS)*86-12);
const msg=(t,g)=>{const e=document.createElement('div');e.className='zr-msg'+(g?' g':'');e.textContent=t;room.appendChild(e);setTimeout(()=>e.remove(),1350);};
function draw(){nt.style.top='calc('+yOf(s.pos)+'% - 26px)';$('.zr-dk').textContent=s.desks;$('.zr-cl').textContent=Math.min(s.cls,CLS)+'-й класс';
$('.zr-hp').textContent='♥'.repeat(Math.max(0,s.hp))+'♡'.repeat(HP-Math.max(0,s.hp));
root.classList.toggle('warn',s.tch==='warn'&&s.frz<=0);root.classList.toggle('look',s.tch==='look'&&s.frz<=0);vp.classList.toggle('look',s.tch==='look'||s.frz>0&&s.hp<HP&&s.frz>.2);
if(s.val){val.style.display='';val.style.top='calc('+yOf(s.val.d)+'% - 30px)';val.className='zr-val '+s.val.st;val.querySelector('b').textContent=s.val.st==='read'?'📖':'👀';}else val.style.display='none';
btn.classList.toggle('on',hold);host.top(s.desks+' из '+ROWS*CLS);}
const set=v=>{if(!on||fin)return;if(v&&s.frz>0)return;hold=!!v;btn.classList.toggle('on',hold);};
host.ptr(btn,{down(){set(true);},up(){set(false);}});
host.ptr(room,{down(){set(true);},up(){set(false);}});
host.keys(k=>{if(k===' '||k==='Enter'||k==='ArrowUp'){set(true);return true;}return false;});
const ku=e=>{if(e.key===' '||e.key==='Enter'||e.key==='ArrowUp')set(false);};window.addEventListener('keyup',ku,true);
host.onQuit(()=>{window.removeEventListener('keyup',ku,true);clearTimeout(tm);});
host.loop(dt=>{if(!on||fin)return;if(host.botOn){b.h=botHold(s,b,host.botK,dt);hold=b.h;}
step(s,dt,hold);
for(const e of s.ev){if(e.e==='warn'){try{host.snd.tap();}catch(x){}}
else if(e.e==='caught'){hold=false;try{host.snd.bad();}catch(x){}const L=CAUGHT[e.who];msg(L[Math.floor(o.rnd()*L.length)]);if(e.who==='vp')vp.querySelector('.f').innerHTML=host.face('vp','sad');}
else if(e.e==='desk'){try{host.snd.letter();}catch(x){}}
else if(e.e==='cls'&&e.c<CLS){hold=false;try{host.snd.bonus();}catch(x){}msg(CLSAY[e.c]||'Следующий класс!',true);$('.zr-ch').innerHTML='Контрольная. Вариант '+(e.c+1)+'.<br>'+['Подчеркни подлежащее…','Разбери по составу…','Найди сказуемое…','Расставь запятые…','Сочинение «Как я провёл лето»'][e.c%5];}
else if(e.e==='over'||e.e==='win'){fin=true;hold=false;const win=e.e==='win';if(win)msg('Выпускной! Записка прошла всю школу!',true);
tm=setTimeout(()=>host.finish({sc:s.desks,st:tierOf(s.desks),h:HP-s.hp,label:'Передано через '+s.desks+' '+(s.desks%10===1&&s.desks%100!==11?'парту':s.desks%10>=2&&s.desks%10<=4&&(s.desks%100<12||s.desks%100>14)?'парты':'парт')+' · '+Math.min(s.cls,CLS)+'-й класс'}),host.calm?500:1400);}}
s.ev.length=0;draw();});
host.bot=k=>{host.botOn=true;host.botK=k;};
draw();
host.intro({who:'zina',text:'Передай записку с задней парты на первую! Держи палец — записка ползёт. Завуч кашлянула «Кхм…» — сейчас обернётся, отпускай!',
hint:(host.pc?'На компьютере — держи '+host.kc('Пробел')+'. ':'')+'С 3-го класса Валерка-отличник: поднял глаза 👀 — мимо него не проноси.',btn:'Передаю!'})
.then(()=>{on=true;});}});
})();
