'use strict';
(function(){
if(typeof ZMG_REG!=='function')return;
const ID='minutka',SEC=60,PTS=[0,0,0,1,2,3,5,8],TH=[.3,.55,.85];
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const nrm=w=>String(w).toLowerCase().replace(/ё/g,'е');
const E0=Date.UTC(2026,0,5);
const tk=()=>typeof todayKey==='function'?+todayKey():20261012;
const dn=k=>Math.round((Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)-E0)/864e5);
const okWord=w=>{try{return typeof isWord==='function'?isWord(w):false;}catch(e){return false;}};
const pl=(n,a,b,c)=>typeof plural==='function'?plural(n,a,b,c):c;
function board(d){const B=window.ZMG_MINUTKA.b.split(' '),x=B[((d%B.length)+B.length)%B.length].split('.');return{w:x[0],n:+x[1],p:+x[2]};}
function fits(w,b){const c={};for(const x of b)c[x]=(c[x]||0)+1;for(const x of w){if(!c[x])return false;c[x]--;}return true;}
function mix(w,seed){let a=seed>>>0;const r=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const L=w.split('');for(let i=L.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const t=L[i];L[i]=L[j];L[j]=t;}return L.join('')===w?L.reverse().join(''):L.join('');}
function subs(w){const out=[];try{if(typeof DICT_MAIN==='string')DICT_MAIN.split(' ').forEach(v=>{if(v.length>=3&&v.length<=7&&fits(v,w)&&okWord(v))out.push(v);});}catch(e){}return out;}
const tierOf=(sc,P)=>sc>=P*TH[2]?3:sc>=P*TH[1]?2:sc>=P*TH[0]?1:0;
try{if(window.ZMGREC&&ZMGREC.cfg)ZMGREC.cfg(ID,{u:['очко','очка','очков'],mid:30,md:[20,35,55],nm:'Минутке'});}catch(e){}
ZMG_REG({a:'60 секунд у доски: составь как можно больше слов из 7 букв',ns:'К доске! Минута, семь букв и мел. Скрипеть можно, списывать — нет.',id:ID,finWho:'vp',deps:['krug','js/zmg-minutka-data.js','js/zmg-rec-ui.js'],
open:()=>true,
lines:{good:'Отлично! Мел аж дымится. Садись, пять.',ok:'Хорошо поработал у доски. Ещё бы минутку — и пятёрка.',bad:'Ничего, к доске ещё вызову. Повторим буквы!'},
sim(o,k){const b=board(Math.floor(o.rnd()*365));let sc=0,run=0,n=0;const tries=Math.round(5+8*k+o.rnd()*3);
for(let i=0;i<tries&&n<b.n;i++){if(o.rnd()<.35+.55*k){n++;run++;const len=3+Math.floor(o.rnd()*(1+2.5*k));sc+=PTS[Math.min(7,len)]*(run>=3?2:1);}else run=0;}
return{sc,st:tierOf(sc,b.p)};},
run(host,o){const D=window.ZMG_MINUTKA;if(!D){host.quit();return;}
const mem=host.mem(),today=tk(),dT=dn(today);if(+mem.k!==today){mem.k=today;mem.n=0;}
const first=!(+mem.n)&&!o.ctx.arch;
const day=first?dT:dT-1-Math.floor(o.rnd()*Math.min(200,Math.max(1,dT)));
const B=board(day),letters=mix(B.w,first?(today*7+13):o.seed),ALL=subs(B.w);
const found=[];let sc=0,run=0,left=SEC,fin=false,K=null,toast=0,started=false;
host.el.innerHTML='<div class="zmn"><div class="zmn-board"><div class="zmn-top"><span class="zmn-t">60</span><span class="zmn-sc">0</span></div>'+
'<div class="zmn-bar"><i></i></div><div class="zmn-list"></div><div class="zmn-msg"></div></div><div class="zmn-kr"></div>'+
'<div class="zmn-row"><button class="btn sec zmn-end">Хватит'+(host.pc?' '+host.kc('Tab'):'')+'</button></div></div>';
const $=s=>host.el.querySelector(s),tEl=$('.zmn-t'),sEl=$('.zmn-sc'),bar=$('.zmn-bar i'),list=$('.zmn-list'),msg=$('.zmn-msg'),bE=$('.zmn-end');
function say(t,cls){msg.className='zmn-msg '+(cls||'');msg.textContent=t;clearTimeout(toast);toast=setTimeout(()=>{msg.textContent='';},1800);}
function upd(){sEl.textContent=sc+' '+pl(sc,'очко','очка','очков');tEl.textContent=Math.ceil(left);bar.style.width=Math.max(0,left/SEC*100)+'%';
tEl.classList.toggle('low',left<=10);sEl.classList.toggle('chalk',run>=3);host.top(found.length+' '+pl(found.length,'слово','слова','слов'));}
function word(w){if(fin)return'bad';w=nrm(w);if(w.length<3){say('Хотя бы три буквы!','no');return'bad';}
if(found.indexOf(w)>=0){say('Уже на доске.','no');return'dup';}
if(!fits(w,letters)||!okWord(w)){run=0;say('Такого слова нет — мел сломался!','no');upd();return'bad';}
run++;const pts=PTS[Math.min(7,w.length)]*(run>=3?2:1);sc+=pts;found.push(w);
const s=document.createElement('span');s.className='zmn-w'+(run>=3?' x2':'');s.textContent=w+' +'+pts;list.appendChild(s);list.scrollTop=list.scrollHeight;
say(run===3?'🖍 Мел скрипит! Очки ×2':run>3?'🖍 Скрипит! ×2':['Верно!','Пишу!','Молодец!'][found.length%3],'ok');
try{host.snd.word&&host.snd.word(w.length,Math.min(3,run));}catch(e){}upd();return'ok';}
function end(){if(fin)return;fin=true;clearTimeout(toast);try{K&&K.lock(true);}catch(e){}
if(first){mem.n=1;try{if(typeof save==='function')save();}catch(e){}}
const st=tierOf(sc,B.p),lab=sc+' '+pl(sc,'очко','очка','очков')+' · '+found.length+' '+pl(found.length,'слово','слова','слов')+' из «'+letters.toUpperCase()+'»'+(first?' (доска дня)':'');
const R=window.ZMGREC;if(R&&R.finish)R.finish(host,{sc,st,label:lab});else host.finish({sc,st,label:lab});}
bE.onclick=()=>{try{host.snd.tap();}catch(e){}end();};
host.keys(k=>{if(k==='Tab'){end();return true;}return false;});
host.onQuit(()=>clearTimeout(toast));
host.loop(dt=>{if(!started||fin)return;left-=dt;if(left<=0){left=0;upd();end();return;}upd();});
host.bot=k=>{if(fin||!K)return;if(Math.random()<k){const w=ALL.find(x=>found.indexOf(x)<0);if(w){K.type(w);return;}end();return;}K.type(letters.slice(0,3).split('').reverse().join(''));};
const intro=(first?'К доске! Доска дня — <b>одна на весь подъезд</b>: Галя и Петровна уже отвечали. ':'Ещё минутка — доска из архива. ')+
'Из <b>7 букв</b> — как можно больше слов за <b>60 секунд</b>. Три верных подряд — мел скрипит, очки ×2!';
host.intro({who:'vp',text:intro,btn:'К доске!',hint:'слова от трёх букв · длинные дороже · пауза останавливает время'}).then(()=>{K=host.krug($('.zmn-kr'),{letters,onWord:word,min:2});started=true;upd();});}});
(function(){if(document.getElementById('zmn-css'))return;const st=document.createElement('style');st.id='zmn-css';st.textContent=
'.zmn{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;padding:6px 0 10px;min-height:0;box-sizing:border-box;gap:6px}.zmn .zmn-board{width:calc(100% - 16px);max-width:520px;box-sizing:border-box;background:#2f5b45;border:6px solid #a4794a;border-radius:10px;padding:6px 10px;color:#f4f4ee;'+
'font-family:"Comic Sans MS","Segoe Print","Trebuchet MS",cursive;box-shadow:0 2px 8px rgba(0,0,0,.2)}'+
'.zmn-top{display:flex;justify-content:space-between;align-items:baseline;font-weight:800}.zmn-t{font-size:26px}.zmn-t.low{color:#ffb4a8}.zmn-sc{font-size:20px}.zmn-sc.chalk{color:#f5d76e}'+
'.zmn-bar{height:8px;border-radius:4px;background:rgba(255,255,255,.18);margin:4px 0 6px;overflow:hidden}.zmn-bar i{display:block;height:100%;width:100%;background:#f5d76e;transition:width .25s linear}'+
'.zmn-list{display:flex;flex-wrap:wrap;gap:3px 10px;min-height:26px;max-height:76px;overflow-y:auto;font-size:17px;justify-content:center}.zmn-w{white-space:nowrap}.zmn-w.x2{color:#f5d76e}'+
'.zmn-msg{min-height:20px;text-align:center;font:600 15px/1.3 var(--font,Arial);color:#fff}.zmn-msg.no{color:#ffd0c8}.zmn-msg.ok{color:#c9f2c4}'+
'.zmn-kr{flex:1 1 auto;min-height:230px;width:100%;display:flex;align-items:center;justify-content:center}'+
'.zmn-row{display:flex;justify-content:center;width:calc(100% - 24px);max-width:480px}.zmn-row .btn{flex:1 1 0;min-height:48px;font-size:17px;margin:0}'+
'@media (max-height:600px){.zmn-kr{min-height:200px}.zmn-list{max-height:50px}}';
document.head.appendChild(st);})();
})();
