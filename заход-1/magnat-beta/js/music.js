/* M47e (07.10): фоновая музыка — три трека по кругу с плавной сменой.
   audio/m1.m4a «Easy Lemon» → audio/m2.m4a «Opportunity Walks» → audio/m3.m4a «Local Forecast - Elevator» → снова 1.
   Все три — Kevin MacLeod (incompetech.com), лицензия CC BY 4.0: подпись в «Об игре» (MUSIC.aboutHtml) НЕ удалять.
   Исходники mp3 — ~/Projects/hobby-music/; m4a: afconvert -f m4af -d aac -b 80000 вход.mp3 выход.m4a.
   По умолчанию ВЫКЛЮЧЕНА (S.music===true — включена; ⚙ → «🎵 Музыка»). От S.sound не зависит.
   Потоком: две <audio> (слоты A/B) → createMediaElementSource → GainNode → AC (контекст звуков shell.js). Трек в память не распаковывается.
   Файлы не запрашиваются, пока музыка выключена и пока не было касания; следующий трек ставится в src только за LEAD с до конца текущего.
   iOS: оба элемента запускаются в первом жесте (prime: касание/клик/клавиша и сам выключатель; слот B — тихим wav), потом им можно менять src и play() без жеста.
   Молчит при любой паузе setPause (ad / hide / sdk / pay → muted) и при скрытой вкладке; setPause обёрнут ниже, чтобы замолчать сразу, а не через 250 мс.
   Грузится после js/shell.js (нужны S, save, L, AC, ac, acWake, muted, setPause). */
(function(){
const LIST=[{f:'audio/m1.m4a',n:'Easy Lemon'},{f:'audio/m2.m4a',n:'Opportunity Walks'},{f:'audio/m3.m4a',n:'Local Forecast - Elevator'}];
const VOL=.18,XF=2.5,LEAD=8,FIN=.6;   // громкость, смена треков (с), за сколько секунд до конца ставить следующий, плавный вход после паузы
const M={e:[null,null],g:[null,null],ts:[-1,-1],c:0,i:0,ok:0,xf:null,bad:{},fb:0};
if(S.music!=null&&typeof S.music!=='boolean')S.music=S.music===1||S.music==='1';
// тихий wav (0,1 с) — «разблокировать» второй слот в жесте, не скачивая трек
function silent(){const n=800,b=v=>String.fromCharCode(v&255),u16=v=>b(v)+b(v>>8),u32=v=>u16(v)+u16(v>>>16);
  return 'data:audio/wav;base64,'+btoa('RIFF'+u32(36+n)+'WAVEfmt '+u32(16)+u16(1)+u16(1)+u32(8000)+u32(8000)+u16(1)+u16(8)+'data'+u32(n)+new Array(n+1).join('\x80'));}
function want(){return S.music===true&&!muted&&!document.hidden;}
function mk(k){const a=new Audio();a.preload='auto';a.setAttribute('playsinline','');
  a.addEventListener('error',()=>{if(M.ts[k]>=0)M.bad[M.ts[k]]=1;});
  try{const s=AC.createMediaElementSource(a),g=AC.createGain();g.gain.value=0;s.connect(g);g.connect(AC.destination);M.g[k]=g;}catch(e){M.fb=1;a.volume=VOL;}
  M.e[k]=a;}
function fade(k,to,dur){const g=M.g[k];if(!g||!AC)return;
  try{const t=AC.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(to,t+dur);}catch(e){}}
function set0(k){const g=M.g[k];if(!g||!AC)return;try{const t=AC.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0,t);}catch(e){}}
function setSrc(k,i){M.ts[k]=i;try{M.e[k].src=LIST[i].f;}catch(e){M.bad[i]=1;}}
function play(k,cb){const a=M.e[k];try{const p=a.play();if(p&&p.then)p.then(()=>{cb&&cb();if(!want())a.pause();},()=>{});else cb&&cb();}catch(e){}}
function next(i){for(let j=1;j<=LIST.length;j++){const n=(i+j)%LIST.length;if(!M.bad[n])return n;}return -1;}
function endXf(){const x=M.xf;if(!x)return;M.xf=null;try{M.e[x.old].pause();}catch(e){}set0(x.old);}
// в жесте пользователя: создать элементы (тут начинается загрузка первого трека) и запустить
function prime(){if(!want())return;const A=ac();if(!A)return;acWake();
  if(!M.e[0]){mk(0);mk(1);}
  if(M.ok){tick();return;}
  const c=M.c,o=1-c;if(M.ts[c]<0)setSrc(c,M.i);
  set0(c);play(c,()=>{M.ok=1;});fade(c,VOL,FIN);
  if(M.ts[o]<0){try{M.e[o].src=silent();play(o,()=>{M.e[o].pause();});}catch(e){}}}
function tick(){if(!M.e[0])return;const c=M.c,a=M.e[c];
  if(!want()){endXf();for(const x of M.e)if(x&&!x.paused){try{x.pause();}catch(e){}}return;}
  if(!M.ok)return;   // первый запуск — только из жеста (prime)
  if(AC&&AC.state!=='running'){acWake();return;}
  if(M.xf&&Date.now()>=M.xf.t)endXf();
  if(M.bad[M.ts[c]]&&!M.xf){const n=next(M.i);if(n<0)return;M.i=n;setSrc(c,n);set0(c);play(c);fade(c,VOL,FIN);return;}
  if(a.paused&&!a.ended){set0(c);play(c);fade(c,VOL,FIN);return;}   // после паузы — плавно с того же места
  if(M.xf)return;
  const d=a.duration,t=a.currentTime;if(!isFinite(d)||!(d>0))return;
  const n=next(M.i),o=1-c,b=M.e[o];if(n<0)return;
  if((t>=d-LEAD||a.ended)&&M.ts[o]!==n)setSrc(o,n);   // следующий трек — только когда подошла очередь
  if((t>=d-XF||a.ended)&&M.ts[o]===n&&b.readyState>=3){
    try{if(b.currentTime>0)b.currentTime=0;}catch(e){}
    set0(o);play(o);fade(o,VOL,XF);fade(c,0,XF);
    M.xf={old:c,t:Date.now()+XF*1000+200};M.c=o;M.i=n;}}
// shell.setPause: после своей работы — сразу musTick (AC.suspend глушит выход мгновенно, элемент встаёт тут же)
if(typeof setPause==='function'){const sp0=setPause;setPause=function(why,on){sp0(why,on);try{tick();}catch(e){}};}
['touchend','click','keydown'].forEach(t=>document.addEventListener(t,prime,{capture:true,passive:true}));
setInterval(tick,250);
window.MUSIC={LIST,M,tick,prime,
  setHtml(on){return `<button class="set" id="stMus"><span>🎵 ${L('Музыка','Music')}</span>${on(S.music===true)}</button>`;},
  bind(re){const b=document.getElementById('stMus');if(!b)return;b.onclick=()=>{S.music=S.music!==true;save();if(S.music)prime();else tick();re();};},
  aboutHtml(){return `<p class="about" id="abMus">${L('Музыка — Kevin MacLeod (incompetech.com), лицензия CC BY 4.0: «Easy Lemon», «Opportunity Walks», «Local Forecast - Elevator».','Music by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0: “Easy Lemon”, “Opportunity Walks”, “Local Forecast - Elevator”.')}</p>`;}};
})();
