'use strict';
let G=null;
const PRICE={letter:35,word:90};
const JAR_SIZE=15,JAR_PRIZE=10;
const ECO={replay:1,x2min:10,adCoins:20,adCoinsDay:3,test:2,
chap:20,
freeLetter:1,gift:25,
lvl:i=>2+Math.min(6,Math.floor((i+20)/40)),
daily:s=>10+Math.min(Math.max(s-1,0),5)*2};
const BOX={every:5,coins:10},HB_MAX=9;
const hbN=()=>Math.max(0,Math.min(HB_MAX,+S.hb||0));
function hbAdd(n,src){S.hb=Math.min(HB_MAX,hbN()+n);STAT.ev('hb',{s:src||'?',n:S.hb});save();if(G&&!G.won)updPrices();}
const WEEK={need:5,gift:20};
const LOGIN=[5,10,10,15,15,20,40],LOGIN_FROM=3;
const lgN=()=>S.lg&&+S.lg.n||0;
const LOGIN_NB=5,lgEarly=()=>!S.lg&&S.lv<LOGIN_NB&&!!S.z2n&&+S.z2n.d1===todayKey();
const lgDue=()=>!SHOT&&S.lv>=LOGIN_FROM&&!(S.lg&&+S.lg.d>=todayKey())&&!lgEarly();
const lgTaken=()=>!!(S.lg&&+S.lg.d===todayKey());
const lgAmt=n=>LOGIN[n%LOGIN.length];
const lgItem=n=>n===LOGIN.length-1;
const cellKey=(x,y)=>x+','+y;
function applyFlags(f){if(!f||typeof f!=='object')return;const num=(k,a,b)=>{const n=parseInt(f[k],10);return isFinite(n)&&n>=a&&n<=b?n:null;};let n;
if((n=num('ad_gap',90,600))!==null)AD.gap=n;
if((n=num('ad_after_rew',30,300))!==null)AD.afterRew=n;
if((n=num('ad_min_lv',8,40))!==null)AD.minLv=n;
if((n=num('ad_sess',60,600))!==null)AD.sess=n;
if((n=num('price_letter',20,50))!==null)PRICE.letter=n;
if((n=num('price_word',60,150))!==null)PRICE.word=n;
if((n=num('ad_coins',10,40))!==null)ECO.adCoins=n;
if((n=num('x2_min',5,30))!==null)ECO.x2min=n;
if((n=num('gift',10,50))!==null)ECO.gift=n;
if((n=num('free_letter',0,2))!==null)ECO.freeLetter=n;
if(G&&!G.won)updPrices();if(typeof updGift==='function')updGift();}
function freeLeft(){const d=todayKey();return Math.max(0,ECO.freeLetter-(S.fl&&S.fl.d===d?+S.fl.n||0:0));}
function useFree(){const d=todayKey();if(!S.fl||S.fl.d!==d)S.fl={d,n:0};S.fl.n++;save();}
function lvIdx(i){return S.lvo===0&&typeof LV_OLD!=='undefined'&&i<LV_OLD.length?LV_OLD[i]:i;}
function levelData(idx,daily){if(daily)return DAILY[idx%DAILY.length];const j=idx%LEVELS.length,lv=LEVELS[lvIdx(j)];
return S.lvo===0&&typeof LV_OLD_O!=='undefined'&&LV_OLD_O[j]?Object.assign({},lv,{o:LV_OLD_O[j]}):lv;}
function r4Moved(idx,daily){try{return daily?DAILY_R4.includes(idx%DAILY.length):LV_R4.includes(lvIdx(idx%LEVELS.length));}catch(e){return false;}}
function levelKey(idx,daily){return daily?'D'+todayKey():'L'+idx;}
const isTest=(idx,daily)=>!daily&&idx>=29&&idx%10===9;
const isRest=(idx,daily)=>!daily&&idx%10===4;
function todayKey(){const d=new Date(nowMs());return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function dayNum(){const t=nowMs();return Math.floor((t-new Date(t).getTimezoneOffset()*60000)/86400000);}
function startLevel(idx,daily){
if(!daily&&idx>=LEVELS.length&&typeof ZBCH!=='undefined'&&idx<ZBCH.total()){ZBCH.load().then(()=>startLevel(idx,daily),()=>{toast('Не удалось загрузить уровень — проверь интернет');openMenu();});return;}
const lv=levelData(idx,daily),key=levelKey(idx,daily);
G={idx,daily:!!daily,lv,key,words:lv.w.map(([w,x,y,d])=>({w,x,y,d,found:false})),cells:new Map(),bonus:new Set(),
letters:lv.l.split(''),sel:[],newDefs:[],combo:0,miss:0,won:false,idleT:0,idleN:0,hintMode:false,hinted:false,tut:!daily&&idx===0&&!S.tip.tut,t0:Date.now(),mode:(typeof MD!=='undefined'&&MD.pend)||'',
rank0:typeof rankName==='function'?rankName(wordsTotal()):''};
for(const wd of G.words)for(let i=0;i<wd.w.length;i++){const x=wd.x+(wd.d?0:i),y=wd.y+(wd.d?i:0),k=cellKey(x,y);
if(!G.cells.has(k))G.cells.set(k,{x,y,ch:wd.w[i],open:false,el:null});}
const cur0=S.curs[key],srt=t=>(t||'').split('').sort().join(''),cur=cur0&&(daily||srt(cur0.order)===srt(lv.l))&&!(cur0&&!cur0.r4&&r4Moved(idx,daily))?cur0:null;
if(cur){
(cur.open||[]).forEach(k=>{const c=G.cells.get(k);if(c)c.open=true;});
(cur.bonus||[]).forEach(w=>G.bonus.add(w));
if(cur.order&&cur.order.length===G.letters.length)G.letters=cur.order.split('');
G.words.forEach(wd=>{if(wordCells(wd).every(c=>c.open))wd.found=true;});
G.hinted=!!cur.hinted;cur.t=Date.now();
}else{
(lv.o||[]).forEach(k=>{const c=G.cells.get(k);if(c){c.open=true;c.gift=true;}});
G.words.forEach(wd=>{if(wordCells(wd).every(c=>c.open))wd.found=true;});G.giftN=(lv.o||[]).length;
S.curs[key]={open:[...G.cells].filter(([k,c])=>c.open).map(([k])=>k),bonus:[],r4:1,t:Date.now()};trimCurs();save();}
show('game');STAT.once('ready',{ms:Math.round(performance.now())});STAT.lvl(idx+1,daily?'daily':'');
if(G.tut)STAT.ev('tut',{s:2});
const ch=chapOf(idx);
$('gTitle').textContent=daily?'Задание дня':'Уровень '+(idx+1);
ribbon(idx,daily);
G.half=G.words.filter(w=>w.found).length*2>=G.words.length;updCount();
G.rid=riddleOf(G);
zinaFace('norm');
drawLine();stopTutorial();
buildGrid();buildWheel();updJar();updPrices();updCoins();
if(G.rid)wordCells(G.rid).forEach(c=>c.el.classList.add('rid'));
const first=!daily&&idx%CH_LEN===0&&!S.curs[key].greeted;
if(G.tut)zina((TOUCH?'Проведи пальцем по буквам':'Нажми на букву и веди мышкой по буквам')+', чтобы составить слово. Попробуй: «'+shortestWord().toUpperCase()+'»!','happy',99);
else if(daily)zina(say('daily'),'happy');
else if(first){zina('Глава «'+ch.n+'». '+ch.s,'happy',6);S.curs[key].greeted=1;save();}
else if(!daily&&idx===1&&!S.tip.btns)explainButtons();
else if(isTest(idx,daily)&&!cur)zina('Испытание! Уровень потруднее, зато монет — вдвое больше.','wow',5);
else if(isRest(idx,daily)&&!cur&&G.giftN)zina('Передышка! Одно слово я уже открыла — отдохни немножко.','happy',5);
else if(G.giftN&&!cur)zina('Слово тут хитрое — одну букву я открыла. Не благодари.','happy',4.5);
else if(G.rid)riddleSay(8);
else if(!daily&&idx>=2&&!S.tip.fl&&freeLeft()&&!(typeof hfFree==='function'&&hfFree())){S.tip.fl=1;save();glowHint();zina('Ять опять под диваном букву нашёл! Одна подсказка 💡 в день — даром.','happy',6);}
else if(!daily&&idx>=3&&!S.tip.def){S.tip.def=1;save();zina('Незнакомое слово? Разгадаешь — нажми на него в кроссворде, расскажу, что это такое.','happy',7);}
else zina(say('start'),'norm',3);
if(G.tut)startTutorial();
YG.start();
if(typeof ZB!=='undefined')ZB.start({l:idx+1,idx,daily:!!daily,mode:G.mode||'',key});
}
function zbInfo(g,end,res){g.zbd=1;return{l:g.idx+1,idx:g.idx,ok:end==='win',end,daily:g.daily,first:!!(res&&res.first),mode:g.mode||'',key:g.key,
s:Math.round((Date.now()-(g.t0||Date.now()))/1000),words:g.words.filter(w=>w.found).length,of:g.words.length,bonus:g.bonus.size,hinted:!!g.hinted,miss:g.miss||0,reward:res?res.reward:0};}
function shortestWord(){return G.words.slice().sort((a,b)=>a.w.length-b.w.length)[0].w;}
function wordCells(wd){const r=[];for(let i=0;i<wd.w.length;i++)r.push(G.cells.get(cellKey(wd.x+(wd.d?0:i),wd.y+(wd.d?i:0))));return r;}
function saveCur(){if(!G||G.won||SHOT)return;const o=S.curs[G.key]||{};
S.curs[G.key]={open:[...G.cells].filter(([k,c])=>c.open).map(([k])=>k),bonus:[...G.bonus],order:G.letters.join(''),greeted:o.greeted,hinted:G.hinted?1:0,r4:1,t:Date.now(),z:G.zc||undefined};trimCurs();save();}
function trimCurs(){const tk='D'+todayKey(),ks=Object.keys(S.curs);
ks.forEach(k=>{if(k[0]==='D'&&k!==tk&&!(G&&G.key===k))delete S.curs[k];});
ks.filter(k=>k[0]==='L'&&S.curs[k]).sort((a,b)=>(S.curs[b].t||0)-(S.curs[a].t||0)).slice(5).forEach(k=>delete S.curs[k]);}
const RIB_DAILY='#ffe2c6';
function shade(hex,k){const n=parseInt(String(hex).slice(1),16);if(isNaN(n))return hex;
const f=v=>Math.round(clamp(v*(1-k),0,255)).toString(16).padStart(2,'0');return'#'+f(n>>16)+f(n>>8&255)+f(n&255);}
function ribbon(idx,daily){const ch=chapOf(idx),r=$('gRib'),gs=$('gSub'),c=daily?RIB_DAILY:ch.c||'#dbe7fb';
r.style.setProperty('--rc',c);r.style.setProperty('--rb',shade(c,.28));
gs.dataset.full=daily?(S.streak?'🔥 Серия: '+S.streak+' '+plural(S.streak,'день','дня','дней'):'📅 Задание дня'):ch.e+' '+ch.n+(isTest(idx)?' ⚡×2':'');
gs.dataset.short=daily?(S.streak?'🔥 '+S.streak:'📅'):ch.e+(isTest(idx)?' ⚡×2':'');gs.title=daily?'':'Глава '+(Math.floor(idx/CH_LEN)+1)+': '+ch.n;fitSub();}
function fitSub(){const r=$('gRib'),e=$('gSub'),c=$('gCnt');if(!r||!e||!e.dataset.full)return;
e.textContent=e.dataset.full;c.textContent=c.dataset.full||c.textContent;
const max=r.parentNode.clientWidth-20,over=()=>r.scrollWidth>max+1;let fs=14;r.style.fontSize='';
while(over()&&fs>11){fs-=.5;r.style.fontSize=fs+'px';}
if(over()&&c.dataset.short)c.textContent=c.dataset.short;
if(over())e.textContent=e.dataset.short;}
function updCount(){if(!G)return;const n=G.words.filter(w=>w.found).length,c=$('gCnt');c.dataset.full='Слов: '+n+' из '+G.words.length;c.dataset.short=n+' из '+G.words.length;c.textContent=c.dataset.full;fitSub();}
function buildGrid(){
const grid=$('grid');grid.innerHTML='';
for(const c of G.cells.values()){const e=document.createElement('div');e.className='cell'+(c.open?' open':'')+(c.gift?' gift':'');e.textContent=c.open?c.ch:'';c.el=e;grid.appendChild(e);}
layoutGrid();
}
function layoutGrid(){
if(!G)return;const b=$('board'),[gw,gh]=G.lv.g;
const bw=b.clientWidth-20,bh=b.clientHeight-12-(G.zcH||0),big=!!S.big;
const csOf=h=>Math.max(Math.min(26,Math.floor(bw/gw)),Math.min(Math.floor(bw/gw),Math.floor(h/gh),($('app').clientHeight>=780?74:62)*(big?1.15:1)|0));
let cs=csOf(bh),pad=0;
if(isSmallH()){const R=clamp(Math.round($('zSay').getBoundingClientRect().top+52-b.getBoundingClientRect().top),0,90);
const c2=csOf(bh-R);if(c2>=Math.min(cs,30))cs=c2;pad=clamp(bh-gh*cs,0,R);}
b.style.paddingTop=6+pad+'px';b.style.paddingBottom=G.zcH?6+G.zcH+'px':'';
const gap=Math.max(2,Math.round(cs*.08));
const grid=$('grid');grid.style.width=gw*cs+'px';grid.style.height=gh*cs+'px';
for(const c of G.cells.values()){const s=c.el.style;s.left=c.x*cs+'px';s.top=c.y*cs+'px';s.width=s.height=(cs-gap)+'px';s.fontSize=Math.round(cs*(big?.64:.56))+'px';s.borderRadius=Math.round(cs*.2)+'px';}
gridDodge();
}
function gridDodge(){const g=$('grid'),e=$('zSay');if(!g||!e)return;let tf='';
if(G&&isSmallH()&&e.classList.contains('on')&&e.textContent){const b=$('board'),br=b.getBoundingClientRect(),sb=(e.offsetParent?e.offsetParent.getBoundingClientRect().top:0)+e.offsetTop+e.offsetHeight+6,
top=br.top+g.offsetTop,h=g.offsetHeight,bot=br.bottom-4-(G.zcH||0),ov=sb-top;
if(ov>0&&h>0){if(top+h+ov<=bot)tf='translateY('+ov+'px)';else{const k=Math.max(.55,(bot-sb)/h);tf='translateY('+ov+'px) scale('+k.toFixed(3)+')';}}}
if(g.style.transform!==tf)g.style.transform=tf;}
function openCell(c,delay,cls){
if(c.open)return;c.open=true;
if(c.zk&&typeof ZBCELL!=='undefined')ZBCELL.open(c,cls);
setTimeout(()=>{c.el.textContent=c.ch;c.el.classList.add('open','pop');if(cls)c.el.classList.add(cls);setTimeout(()=>c.el.classList.remove('pop'),400);},delay||0);
}
let WH={D:260,R:90,ls:60,pts:[]};
function buildWheel(){
const wh=$('wheel');wh.querySelectorAll('.let').forEach(e=>e.remove());
applySkin(wh,S.skin);
G.letters.forEach((ch,i)=>{const e=document.createElement('div');e.className='let';e.textContent=ch;e.dataset.i=i;wh.appendChild(e);});
layoutWheel();
}
function layoutWheel(){
if(!G)return;const wide=WIDE(),W=Math.min($('board').clientWidth||$('app').clientWidth,wide?640:9999),H=$('app').clientHeight,[gw,gh]=G.lv.g;
const small=H<=700||wide,fixed=(small?52:120)+Math.round(clamp(H*.06,38,50))+34,cell=Math.min(36,Math.floor((W-20)/gw));
const room=H-fixed-gh*cell-18;
const n=G.letters.length,dmin0=n>=7&&H>=680?190:small?172:180;
const D0=WIDE3()?Math.round(clamp(H-330,220,310)):Math.round(clamp(Math.min(W-150,H*.33,room),dmin0,wide&&H>=900?350:300));
const big=!!S.big&&(H-fixed-60-D0)/gh<(W-20)/gw;
const D=big?Math.round(clamp(D0*.92,dmin0-10,280)):D0;
const bigL=!!S.big&&(n<=6||D>=210),ls=Math.round(D*(n<=5?.27:n<=6?.25:n<=7?.225:.205)*(bigL?1.08:1)),R=D/2-ls*.62-8;
const wh=$('wheel');wh.style.width=wh.style.height=D+'px';
WH={D,R,ls,pts:[],els:[...wh.querySelectorAll('.let')],rect:null};
wh.querySelectorAll('.let').forEach((e,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;const x=D/2+Math.cos(a)*R,y=D/2+Math.sin(a)*R;WH.pts[i]=[x,y];
e.style.width=e.style.height=ls+'px';e.style.left=(x-ls/2)+'px';e.style.top=(y-ls/2)+'px';e.style.fontSize=Math.round(ls*(S.big?.68:.62))+'px';});
$('wline').setAttribute('viewBox','0 0 '+D+' '+D);
$('preview').style.height=Math.round(clamp(H*.06,38,50))+'px';
layoutGrid();
}
function wheelRect(){return WH.rect||(WH.rect=$('wheel').getBoundingClientRect());}
function letterAt(px,py){const r=wheelRect(),k=uiZoom(),x=(px-r.left)/k,y=(py-r.top)/k;
for(let i=0;i<WH.pts.length;i++){const[lx,ly]=WH.pts[i];if(Math.hypot(lx-x,ly-y)<WH.ls*.62)return i;}return-1;}
let wPoly=null;
function drawLine(px,py){
const sv=$('wline');if(!wPoly||wPoly.parentNode!==sv){sv.textContent='';wPoly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
wPoly.setAttribute('fill','none');wPoly.setAttribute('stroke-linecap','round');wPoly.setAttribute('stroke-linejoin','round');wPoly.setAttribute('opacity','.85');sv.appendChild(wPoly);}
const pts=G?G.sel.map(i=>WH.pts[i]):[];
if(px!=null&&pts.length){const r=wheelRect(),k=uiZoom();pts.push([(px-r.left)/k,(py-r.top)/k]);}
if(pts.length>1){wPoly.setAttribute('points',pts.map(p=>p.join(',')).join(' '));wPoly.setAttribute('stroke',skinOf(S.skin).line);wPoly.setAttribute('stroke-width',Math.round(WH.ls*.22));wPoly.style.display='';}
else wPoly.style.display='none';
}
function updSel(){
(WH.els||[]).forEach((e,i)=>e.classList.toggle('on',G.sel.includes(i)));
const w=$('preview').firstElementChild;w.className='w';w.textContent=G.sel.map(i=>G.letters[i]).join('');
if(!G.sel.length)G.tap=false;
$('preview').classList.toggle('tap',!!G.tap&&G.sel.length>0);
}
function selAdd(i){
if(i<0)return;const s=G.sel;
if(s.length>1&&s[s.length-2]===i){s.pop();SND.letter(s.length-1);updSel();return;}
if(s.includes(i))return;s.push(i);SND.letter(s.length-1);updSel();
}
let dragging=false;
function wheelDown(e){if(!G||G.won||G.hintMode)return;const i=letterAt(e.clientX,e.clientY);if(i<0)return;
ac();WH.rect=null;poke();e.preventDefault();
if(G.tap&&G.sel.length){const s=G.sel;
if(s[s.length-1]===i){s.pop();SND.letter(Math.max(0,s.length-1));}else if(!s.includes(i)){s.push(i);SND.letter(s.length-1);}
updSel();drawLine();return;}
if(isSmallH())zinaHide(true);
dragging=true;G.sel=[];selAdd(i);drawLine(e.clientX,e.clientY);try{$('wheel').setPointerCapture(e.pointerId);}catch(_){}}
let wmE=null,wmRaf=0;
function wheelMove(e){if(!dragging)return;wmE={x:e.clientX,y:e.clientY};if(!wmRaf)wmRaf=requestAnimationFrame(wheelMoveNow);}
function wheelMoveNow(){wmRaf=0;if(!dragging||!wmE)return;selAdd(letterAt(wmE.x,wmE.y));drawLine(wmE.x,wmE.y);}
function wheelUp(e){if(!dragging)return;if(e&&e.clientX!=null){wmE={x:e.clientX,y:e.clientY};wheelMoveNow();}dragging=false;
if(G.sel.length===1){G.tap=true;updSel();drawLine();tapTip();return;}
const w=G.sel.map(i=>G.letters[i]).join('');G.sel=[];G.tap=false;drawLine();
(WH.els||[]).forEach(e=>e.classList.remove('on'));updSel();$('preview').firstElementChild.textContent=w;submit(w);}
function tapSubmit(){if(!G||G.won||!G.sel.length)return;poke();const w=G.sel.map(i=>G.letters[i]).join('');G.sel=[];G.tap=false;drawLine();updSel();
$('preview').firstElementChild.textContent=w;submit(w);}
function tapClear(){if(!G)return;SND.tap();G.sel=[];G.tap=false;drawLine();updSel();}
function tapTip(){if(S.tip.tap)return;S.tip.tap=1;save();
zina('Можно и нажимать: буквы по очереди, потом ✔. А можно вести пальцем по буквам, как ручкой по тетради, — так быстрее!','happy',7);}
const WIDE=()=>$('app').clientWidth>=860;
const isSmallH=()=>$('app').clientHeight<=700&&!WIDE();
const WIDE3=()=>document.documentElement.classList.contains('zk')&&WIDE();
const uiZoom=()=>parseFloat(document.documentElement.style.getPropertyValue('--zk'))||1;
function flashPreview(w,cls){const el=$('preview').firstElementChild;el.textContent=w;el.className='w '+cls;
clearTimeout(flashPreview._t);flashPreview._t=setTimeout(()=>{el.className='w';el.textContent='';},cls==='bad'||cls==='old'?1200:900);}
function submit(w){
if(!w)return;if(w.length<2){$('preview').firstElementChild.textContent='';return;}
if(w.length<3){flashPreview(w,'bad');SND.bad();zina(say('short'),'stern');return;}
const wd=G.words.find(x=>x.w===w);
if(wd){
if(wd.found){flashPreview(w,'old');SND.old();zina(say('old'),'stern');highlightWord(wd);return;}
if(typeof ZBCELL!=='undefined'&&ZBCELL.block(wd))return;
foundWord(wd,false);return;
}
if(!dictReady()){DWAIT.w=w;DWAIT.g=G;DWAIT.t=Date.now();ensureDict();flashPreview(w,'old');zina('Погоди, тетрадку со словами ищу… Найду — проверю это слово.','norm');return;}
if(isWord(w)){
if(G.bonus.has(w)){flashPreview(w,'old');SND.old();zina(say('old'),'stern');return;}
G.bonus.add(w);STAT.move();const nd=collectDef(w);S.bonusAll=(S.bonusAll||0)+1;S.jar=(S.jar||0)+1;flashPreview(w+(nd?' 📖':''),'bonus');SND.bonus();buzz('word');
flyTo(w,$('hJar'));
if(S.jar>=JAR_SIZE){S.jar=0;setTimeout(()=>{addCoins(JAR_PRIZE,'chest');SND.coin();zina(say('jar')+' +'+JAR_PRIZE,'happy');const hj=$('hJar');hj.classList.remove('glow');void hj.offsetWidth;hj.classList.add('glow');
if(adsOk()&&G&&!G.won&&!$('modal').classList.contains('on'))jarFull(hj);},500);}
else zina(say('bonus')+defNote(nd),'happy',nd?4.5:3.2);
if(typeof ZBCELL!=='undefined')ZBCELL.bonus(w);
updJar();saveCur();return;
}
flashPreview(w,'bad');SND.bad();buzz('bad');G.combo=0;G.miss++;
const nr=nearWord(w);
if(nr){if(novice()&&G.miss>=3&&catHelp(true))return;
zina(nr.an?pick(['Буквы те самые, внучок! Только переставь их по-другому.','Почти! Из этих же букв — другое слово. Переставь!','Тепло! Те же буквы, но в другом порядке.'])
:novice()?pick(['Почти! Не «'+w+'», а «'+nr.w+'» — попробуй!','Тепло-тепло! Мне нужна начальная форма: не «'+w+'», а «'+nr.w+'».'])
:pick(['Почти! Это то же слово, только в другой форме. Нужна начальная: «кто? что?» — одно.','Тепло! Слово верное, форма не та. Одну штуку, пожалуйста!']),'happy',novice()?99:5);return;}
if(novice()&&G.miss>=3&&catHelp(true))return;
let why=whyNot(w)||(looksPlural(w)?'plural':looksVerb(w)?'verb':'bad');
if(why==='bad'&&gibberish(w))why='gib';
if(G.miss===3){glowHint();if(why==='bad'||why==='gib'){zina(say('badx3'),'norm',4);return;}}
zina(say(why),why==='gib'||why==='verb'||why==='rude'?'stern':'norm',why!=='bad'&&why!=='gib'&&!G.daily&&G.idx<5?99:0);
}
function nearWord(w){const sorted=s=>s.split('').sort().join(''),sw=sorted(w);let an=null;
for(const g of G.words){if(g.found||g.w===w)continue;const a=g.w,st=a.length>4?a.slice(0,-1):a.length>3&&/[аяоеьй]$/.test(a)?a.slice(0,-1):a;
if(Math.abs(a.length-w.length)<=2&&w.length>=3&&st.length>=3&&w.startsWith(st)&&w!==a)return{w:a};
if(!an&&a.length===w.length&&sorted(a)===sw)an={w:a,an:1};}
return an;}
function looksPlural(w){
const ends=['ами','ями','ов','ев','ей','ой','ей','ом','ем','ам','ям','ах','ях','ую','ы','и','а','я','у','ю','е'];
const tails=['','а','я','о','е','ь','й','ия','ие'];
for(const e of ends)if(w.endsWith(e)){const st=w.slice(0,-e.length);
if(st.length>=3&&(tails.some(t=>isWord(st+t))||isWord(st.slice(0,-1)+'ок')||isWord(st.slice(0,-1)+'ец')))return true;}
return w.length>=3&&['а','я'].some(t=>isWord(w+t));}
function gibberish(w){return!/[аеёиоуыэюя]/.test(w)||/[бвгджзйклмнпрстфхцчшщ]{4}/.test(w)||/(.)\1\1/.test(w)||/^[ьъы]/.test(w)||/[ьъ]{2}/.test(w);}
function looksVerb(w){return/(ть|ти|ться|тся|чь|ешь|ишь|ет|ит|ут|ют|ат|ят|ал|ил|ел|ул|ла|ли)$/.test(w)&&w.length>=4;}
function collectDef(w){if(DEFS[w]&&!S.dict[w]){S.dict[w]=1;G.newDefs.push(w);return true;}return false;}
const DEF_NOTE=' 📖 Про это слово у меня есть запись в словаре!';
function defNote(nd){if(!nd||G.defNoted)return'';G.defNoted=true;return DEF_NOTE;}
const SOFTW={'старуха':'Старуха — это я, что ли? Не обижаюсь: зато опыта у меня — целый сундук!','косяк':'Косяк — это у двери, внучок! И рыба в море косяком ходит.',
'черт':'Чёрт — из сказки: его кузнец Вакула перехитрил!','баба':'Баба — это я! Баба Зина, прошу любить и жаловать.'};
function foundWord(wd,byHint){
wd.found=true;const nd=collectDef(wd.w);const cs=wordCells(wd);
if(!byHint)flashPreview(wd.w+(nd?' 📖':''),'ok');
const land=!byHint&&flyLetters(cs,nd?1.6:0);
cs.forEach((c,i)=>{const t=land?land[i]:i*70;if(!c.open)openCell(c,t,byHint?'hint':null);else{setTimeout(()=>{c.el.classList.add('flash');setTimeout(()=>c.el.classList.remove('flash'),600);},t);}});
const left=G.words.filter(w=>!w.found).length,half=!G.half&&(G.words.length-left)*2>=G.words.length&&left>1;if(half)G.half=true;
if(!byHint){STAT.move();SND.word(wd.w.length,G.combo);S.found=(S.found||0)+1;G.combo++;G.miss=0;
const long=wd.w.length>=7;buzz(long?'long':'word');if(long)boardStamp(pick(['Молодец!','Пять с плюсом!','Вот это слово!']));
const note=defNote(nd);
if(G.tut){STAT.ev('tut',{s:3});
zina('Молодец! Засчитываю только предметы — «кто? что?», и по одной штуке: «нос», а не «носы».','happy',7);
const g=G;setTimeout(()=>{if(G===g&&!g.won)zina('Ищи остальные слова! Сколько осталось — написано сверху.','happy',6);},7000);}
else if(!left)zina(pick(['Всё! Все слова на месте!','Готово! Кроссворд сдан!','Последнее! Ура!']),'happy',6);
else if(G.rid===wd)zina(pick(['Загадку отгадал! Ну голова!','Отгадал! Я эту загадку на соседке Гале проверяла — она не смогла.','Правильно! Вот что значит начитанный.']),'wow',4.5);
else if(SOFTW[wd.w]&&left)zina(SOFTW[wd.w],'happy',5);
else if(note)zina(say(wd.w.length>=6?'wordLong':'word')+note,'happy',4.5);
else if(left===1)zina(say('oneLeft'),'wow',3.5);
else if(half)zina(say('half'),'happy',3.5);
else if(G.combo===3)zina(say('streak'),'wow');
else zina(say(wd.w.length>=6?'wordLong':'word'),'happy',3.2);}
updCount();
if(G.rid===wd){wordCells(wd).forEach(c=>c.el.classList.remove('rid'));G.rid=null;}
if(G.tut){G.tut=false;S.tip.tut=1;stopTutorial();}
if(typeof ZBCELL!=='undefined')ZBCELL.found(wd,byHint);
saveCur();checkWin();
}
function highlightWord(wd){wordCells(wd).forEach((c,i)=>setTimeout(()=>{c.el.classList.add('flash');setTimeout(()=>c.el.classList.remove('flash'),600);},i*50));}
function checkAutoFound(){for(const wd of G.words)if(!wd.found&&wordCells(wd).every(c=>c.open)){wd.found=true;if(typeof ZBCELL!=='undefined')ZBCELL.found(wd,true);}updCount();}
function checkWin(){
checkAutoFound();
if(G.won||!G.words.every(w=>w.found))return;
G.won=true;YG.stop();const g=G,res=finishLevel(g);lbSubmit();
STAT.end('win',{f:res.first?1:0,ex:g.hinted?0:1,bw:g.bonus.size});
if(typeof ZB!=='undefined'&&!g.zbd)ZB.level(zbInfo(g,'win',res));
if(res.first&&!g.daily&&(g.idx===0||g.idx===2||g.idx===9))STAT.ev('tut',{s:g.idx===0?4:g.idx===2?5:6});
setTimeout(()=>{if(G!==g)return;SND.win();buzz('win');confetti();zinaFace('happy');},450);
setTimeout(()=>{if(G===g)winModal(g,res);},1300);
}
function wordInfo(w){const W=((typeof DEFS_YO!=='undefined'&&DEFS_YO[w])||(typeof GLOSS_YO!=='undefined'&&GLOSS_YO[w])||w);
const nm=W[0].toUpperCase()+W.slice(1);
if(typeof DEFS!=='undefined'&&DEFS[w])return'📖 '+nm+'. '+DEFS[w];
if(typeof GLOSS!=='undefined'&&GLOSS[w])return nm+' — '+GLOSS[w]+'.';
return'';}
function cellTap(e){if(!G||G.hintMode)return;const el=e.target&&e.target.closest?e.target.closest('.cell'):null;if(!el)return;
let cell=null;for(const c of G.cells.values())if(c.el===el){cell=c;break;}if(!cell||!cell.open)return;
const ws=G.words.filter(w=>w.found&&wordCells(w).includes(cell));if(!ws.length)return;
poke();G.defI=G.defC===cell?(G.defI||0)+1:0;G.defC=cell;const wd=ws[G.defI%ws.length],t=wordInfo(wd.w);
SND.tap();highlightWord(wd);
zina(t||'«'+wd.w+'» — слово настоящее, а записи про него у меня пока нет.','happy',Math.max(5,2+(t.length||30)*.07));$('zSay').classList.add('pin');clearTimeout(zina._t);
zina._t=setTimeout(zinaHide,Math.max(6,2+(t.length||30)*.08)*1000);
if(!S.tip.def){S.tip.def=1;save();}}
const learnFree=()=>!!G&&!G.daily&&G.idx<2;
const NOVICE=10,novice=()=>!!G&&!G.daily&&G.idx<NOVICE&&S.lv<NOVICE;
function updPrices(){const f=learnFree()||freeLeft()||typeof hfFree==='function'&&hfFree(),h=!f&&hbN();$('prLet').textContent=f?'даром':h?'есть '+h:PRICE.letter;$('hLet').title=f?'Открыть букву — сегодня даром':h?'Открыть букву — в запасе '+h:'Открыть букву';$('prWord').textContent=PRICE.word;}
function pay(kind,then){
const pr=PRICE[kind],g=G,ad=adsOk(),enough=S.coins>=pr,ic=kind==='letter'?'💡':'📜',fr=ad&&!enough&&adfOk();
const doPay=()=>{addCoins(-pr);STAT.ev('spend',{k:kind,c:pr});S.hintsUsed=(S.hintsUsed||0)+1;updPrices();then();};
if(enough&&S.tip.noAsk){doPay();return;}
modal(`<h2>${kind==='letter'?'💡 Открыть букву?':'📜 Открыть слово?'}</h2><div style="width:96px;height:96px;margin:4px auto">${zinaSVG('norm')}</div>
    <p>${kind==='letter'?'Одну букву':'Самое длинное слово'} — за <b>${pr}</b> ${COIN_I}${ad?'<span class="adtx"> или за рекламу</span>':''}. У тебя ${S.coins}.</p>
    ${enough?'':`<p style="font-size:14.5px">Монеток пока маловато${ad?'<span class="adtx"> — посмотри рекламу, и подсказка бесплатно!</span><span class="adno-only">'+(fr?' — эту дарю: раз в день можно даром.':'. Проходи уровни — накопим!')+'</span>':'. Проходи уровни — накопим!'}</p>`}
    ${enough?'<label class="chk"><input type="checkbox" id="mNoAsk"> за монеты — больше не спрашивать</label>':''}
    <div class="btns"><button class="btn ${enough?'green':'ghost'}" id="mYes"${enough?'':' disabled'}>${ic} за ${pr} ${COIN_I}</button>
      ${ad?`<button class="btn ${enough?'blue':'green'}" id="mAd">🎬 ${kind==='letter'?'Буква':'Слово'} за рекламу</button>`:''}${fr?`<button class="btn green adno-only" id="mFree">🎁 ${kind==='letter'?'Буква':'Слово'} даром</button>`:''}
      <button class="btn ghost" id="mNo">Сам справлюсь</button></div>`);
$('mYes').onclick=()=>{if(S.coins<pr)return;const na=$('mNoAsk');if(na&&na.checked){S.tip.noAsk=1;save();}hideModal();doPay();};
$('mNo').onclick=()=>{hideModal();SND.tap();};
const fb=$('mFree');if(fb)fb.onclick=()=>{if(fb.disabled||!adfOk()||G!==g||g.won)return;fb.disabled=true;adFailWhy='none';adKind(kind,pr,g,then,'hide');};
const b=$('mAd');if(b)STAT.offer(kind);if(b)b.onclick=()=>{if(b.disabled)return;b.disabled=true;STAT.place(kind);
showRewarded(()=>{hideModal();if(G===g&&!g.won){S.hintsUsed=(S.hintsUsed||0)+1;then();}},()=>{b.disabled=false;adKind(kind,pr,g,then);},
()=>{const mo=$('modal').classList.contains('on'),mine=mo&&document.body.contains(b);if(G!==g||g.won||!$('game').classList.contains('on')||(mo&&!mine))return adLateCoins(pr);
if(mine)hideModal();S.hintsUsed=(S.hintsUsed||0)+1;then();return kind==='letter'?'открываю букву':'открываю слово';});};
}
const adfOk=()=>!(S.adf&&+S.adf.d===todayKey());
function adKind(kind,pr,g,then,c){if(!/^(none|err|fail|hold)$/.test(adFailWhy)||!adfOk()||S.coins>=pr||G!==g||g.won||!$('game').classList.contains('on'))return false;
S.adf={d:todayKey()};save();STAT.ev('adf',{p:kind,c:c||adFailWhy});hideModal();S.hintsUsed=(S.hintsUsed||0)+1;then();
toast(c?'Держи подсказку даром. Такое — раз в день':'Ролик не пришёл — ну и ладно, держи подсказку даром. Такое — раз в день',4500);return true;}
function hintLetter(){
if(!G||G.won)return;poke();
const closed=[...G.cells.values()].filter(c=>!c.open);if(!closed.length)return;
const open=(msg,keep)=>{
const ok=c=>!c.open&&!c.lock,ws=G.words.filter(w=>!w.found&&wordCells(w).some(ok)).sort((a,b)=>wordCells(a).filter(c=>c.open).length/a.w.length-wordCells(b).filter(c=>c.open).length/b.w.length);
const c=ws.length&&wordCells(ws[0]).find(ok)||closed.find(ok)||closed[0];
if(!keep)G.hinted=true;STAT.use('hint');openCell(c,0,'hint');SND.open();zina(msg||say('hint'),'norm',msg?4.5:0);checkAutoFoundAndWin();saveCur();
};
if(learnFree()){S.hintsUsed=(S.hintsUsed||0)+1;open('На первых уровнях подсказываю даром — учись! Дальше — за монетки, но раз в день кот букву принесёт.',1);return;}
if(typeof hfTake==='function'&&hfTake(open))return;
if(freeLeft()){useFree();S.hintsUsed=(S.hintsUsed||0)+1;updPrices();
open(pick(['Ять под диваном букву нашёл — держи, даром! Завтра ещё поищет.','Кот принёс букву. Бесплатно — раз в день. Завтра ещё принесёт.']));return;}
if(hbN()){S.hb=hbN()-1;S.hintsUsed=(S.hintsUsed||0)+1;save();updPrices();const n=hbN();
open((n?'Из корзинки — держи! Там ещё '+n+' '+plural(n,'подсказка','подсказки','подсказок')+'.':'Последняя подсказка из корзинки — держи!'));return;}
pay('letter',()=>open());
}
function hintWord(){
if(!G||G.won)return;poke();
const ws=G.words.filter(w=>!w.found);if(!ws.length)return;
pay('word',()=>{const wd=G.words.filter(w=>!w.found).sort((a,b)=>b.w.length-a.w.length)[0];if(!wd)return;G.hinted=true;STAT.use('hint');SND.open();const t=wordInfo(wd.w);
zina(t&&!DEFS[wd.w]?'Держи слово! '+t:say('hintWord'),'happy',t&&!DEFS[wd.w]?7:0);foundWord(wd,true);});
}
function checkAutoFoundAndWin(){checkAutoFound();checkWin();}
function shuffleLetters(){
if(!G||G.won)return;poke();const old=G.letters.join('');G.sel=[];G.tap=false;updSel();drawLine();
for(let k=0;k<10;k++){shuffle(G.letters);if(G.letters.join('')!==old)break;}
const wh=$('wheel');wh.querySelectorAll('.let').forEach((e,i)=>{e.textContent=G.letters[i];e.animate([{transform:'scale(.3) rotate(-90deg)'},{transform:'scale(1)'}],{duration:280,easing:'ease-out'});});
SND.shuffle();zina(say('shuffle'),'norm',2.5);saveCur();
}
function jarFull(hj){let got=0;if(typeof adLikely==='function'&&!adLikely())return;
modal(`<h2>🍯 Банка полна!</h2><div class="reward big">+${JAR_PRIZE} <span class="coin"></span></div><p class="money">${JAR_SIZE} лишних слов (не из кроссворда) — это +${JAR_PRIZE} ${COIN_I}. Банка снова пустая — собирай!</p>
    <div class="btns"><button class="btn green" id="jfOk">Продолжить</button>
    <button class="btn gold" id="jfX2">🎬 За рекламу: <span class="nw">💡 подсказка в запас</span></button></div>`);
coinBurst($('mcard').querySelector('.reward'),JAR_PRIZE);
$('jfOk').onclick=()=>{hideModal();SND.tap();};
const x=$('jfX2');STAT.offer('jar');x.onclick=()=>{if(got||x.disabled)return;x.disabled=true;STAT.place('jar');
showRewarded(()=>{if(got)return;got=1;hbAdd(1,'jar');SND.coin();x.textContent='✅ 💡 в запасе: '+hbN();},()=>{if(!got)x.disabled=false;},
()=>{if(got)return'';got=1;hbAdd(1,'jar');SND.coin();if(document.body.contains(x)){x.disabled=true;x.textContent='✅ 💡 в запасе: '+hbN();}return'подсказка в запасе: 💡 '+hbN();});};}
function updJar(){const n=Math.max(0,Math.min(JAR_SIZE,S.jar||0)),c=$('jarCnt'),p=$('jarPg');c.textContent=n;c.classList.toggle('z',!n);
if(p)p.setAttribute('stroke-dasharray',(n/JAR_SIZE*113.1).toFixed(1)+' 200');$('hJar').title='Банка бонусных слов: '+n+' из '+JAR_SIZE;}
function showJar(){
poke();const n=S.jar||0;
modal(`<h2>🍯 Банка бонусов</h2><p>Слова, которых нет в кроссворде, но они настоящие. Собери ${JAR_SIZE} — получишь <b>${coinsTxt(JAR_PRIZE)}</b>.</p>
   <div class="bar" style="height:14px;margin:12px 0"><i style="width:${n/JAR_SIZE*100}%"></i></div><p><b>${n} из ${JAR_SIZE}</b></p>
   <div class="words">${G.bonus.size?[...G.bonus].map(w=>'<span>'+w+'</span>').join(''):'<p>На этом уровне пока ни одного. Ищи слова покороче!</p>'}</div>
   <div class="btns"><button class="btn blue" id="mOk">Понятно</button></div>`);
$('mOk').onclick=hideModal;
}
function zina(t,mood,sec){const e=$('zSay');e.textContent=t;(zina.h=zina.h||[]).push(t);if(zina.h.length>3)zina.h.shift();e.classList.add('on');e.classList.remove('pin');if(mood)zinaFace(mood);
clearTimeout(zina._t);if(sec!==99)zina._t=setTimeout(zinaHide,Math.max(sec||3.2,1.5+t.length*.06)*1000);gridDodge();}
function zinaHide(soft){const e=$('zSay');if(soft&&(e.classList.contains('pin')||!e.classList.contains('on')||G&&G.tut))return;clearTimeout(zina._t);e.classList.remove('on','pin');zinaFace('norm');gridDodge();}
$('zSay').addEventListener('click',()=>{const e=$('zSay');if(!e.classList.contains('on'))return;clearTimeout(zina._t);
if(e.classList.contains('pin'))zinaHide();else e.classList.add('pin');});
const MOODS=['norm','happy','wow','stern'];
function zinaFace(m){const av=$('zAv');if(av.dataset.o!==S.outfit){av.dataset.o=S.outfit;av.innerHTML=MOODS.map(x=>`<i class="face" data-m="${x}">${zinaSVG(x)}</i>`).join('');}
av.querySelectorAll('.face').forEach(f=>f.classList.toggle('on',f.dataset.m===m));}
function glowHint(){const e=$('hLet');e.classList.remove('glow');void e.offsetWidth;e.classList.add('glow');}
function poke(){if(G){G.idleT=0;}}
setInterval(()=>{if(!G||G.won||paused||!$('game').classList.contains('on')||$('modal').classList.contains('on')||document.hidden)return;G.idleT++;
if(G.idleT===30&&G.idleN<2){G.idleN++;G.idleT=0;
if((G.idleN===2||novice())&&catHelp())return;
zina(say('idle'),'norm',5);glowHint();}},1000);
function riddleOf(g){if(g.daily||g.tut)return null;const i=g.idx,on=i>=10&&i<20?i%2===1:i>=20&&i%10===2;if(!on)return null;
const c=g.words.filter(w=>!w.found&&DEFS[w.w]);if(!c.length)return null;
return c.find(w=>w.w===g.lv.d)||c.sort((a,b)=>b.w.length-a.w.length)[0];}
function riddleSay(sec){if(!G||!G.rid)return;zina('Загадка! '+DEFS[G.rid.w]+' Что это? Слово я обвела пунктиром.','wow',sec||6);}
function catHelp(force,nb){if(!G||G.won||G.tut||G.catD||(!G.daily&&G.idx<1))return false;
const w=S.wins||0;if(!novice()&&!nb&&S.catW!=null&&w-S.catW<7)return false;
const ws=G.words.filter(x=>!x.found&&wordCells(x).some(c=>!c.open&&!c.lock)).sort((a,b)=>wordCells(a).filter(c=>c.open).length/a.w.length-wordCells(b).filter(c=>c.open).length/b.w.length);
const c=ws.length&&wordCells(ws[0]).find(c=>!c.open&&!c.lock);if(!c)return false;
if(!novice()&&!nb)S.catW=w;G.catD=1;G.miss=0;save();SND.meow();buzz('word');const g=G;
const put=()=>{if(G!==g||g.won||c.open)return;openCell(c,0,'cat');SND.open();checkAutoFoundAndWin();saveCur();};
const from=$('zAv').getBoundingClientRect(),to=c.el.getBoundingClientRect();
if(CALM()||!document.body.animate)put();
else{const e=document.createElement('div');e.className='catfly';e.textContent='🐈';e.style.left=(from.left+from.width/2-20)+'px';e.style.top=(from.top+from.height/2-20)+'px';
document.body.appendChild(e);const dx=to.left+to.width/2-(from.left+from.width/2),dy=to.top+to.height/2-(from.top+from.height/2);
e.animate([{transform:'translate(0,0) scale(.6)'},{transform:`translate(${dx*.5}px,${dy*.5-60}px) scale(1.2)`,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(.8)`}],{duration:900,easing:'ease-in-out',fill:'both'});
setTimeout(()=>{e.remove();put();},880);}
zina(force?pick(['Три раза мимо — кот Ять не выдержал и сам букву принёс. Даром!','Ять посмотрел-посмотрел — и поставил букву. Мяу, говорит, не мучайся.'])
:pick(['Кот Ять не выдержал — сам букву принёс! Мяу.','Ять заскучал и поставил букву. Даром, он у нас добрый.','Мяу! Это Ять подсказал. Я его не учила, честно.']),'wow',5);
return true;}
function explainButtons(){S.tip.btns=1;save();
zina('Застрянешь — жми 💡, открою букву.','happy',6);
['hLet'].forEach((id,i)=>setTimeout(()=>{const e=$(id);e.classList.remove('glow');void e.offsetWidth;e.classList.add('glow');},i*300));}
let tutAnim=null;
function startTutorial(){
stopTutorial();const w=shortestWord();const idx=[],used=new Set();
for(const ch of w){const i=G.letters.findIndex((c,j)=>c===ch&&!used.has(j));used.add(i);idx.push(i);}
const n=idx.length,dot=document.createElement('div');dot.id='tutDot';
dot.style.cssText='position:absolute;width:44px;height:62px;z-index:6;pointer-events:none;transition:left .5s ease-in-out,top .5s ease-in-out,opacity .3s';
dot.innerHTML='<i style="position:absolute;left:11px;top:0;width:22px;height:22px;border-radius:50%;background:rgba(255,138,61,.8);border:2px solid #fff;box-sizing:border-box"></i>'+
'<b style="position:absolute;left:0;top:5px;width:44px;text-align:center;font-size:36px;line-height:1;font-weight:400;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))">👆</b>';
const sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.id='tutLine';sv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:5';
const pl=document.createElementNS('http://www.w3.org/2000/svg','polyline');pl.setAttribute('fill','none');pl.setAttribute('stroke-linecap','round');pl.setAttribute('stroke-linejoin','round');pl.setAttribute('opacity','.6');
pl.setAttribute('stroke',skinOf(S.skin).line);pl.setAttribute('stroke-width',Math.round(WH.ls*.22));sv.appendChild(pl);
$('wheel').appendChild(sv);$('wheel').appendChild(dot);
let k=0,done=[],draw=false;
const place=(i,anim)=>{const p=WH.pts[i];if(!anim){dot.style.transition='opacity .3s';}dot.style.left=(p[0]-22)+'px';dot.style.top=(p[1]-11)+'px';
if(!anim){void dot.offsetWidth;dot.style.transition='left .5s ease-in-out,top .5s ease-in-out,opacity .3s';}};
const frame=()=>{if(!document.getElementById('tutDot'))return;
if(draw){const cs=getComputedStyle(dot),x=parseFloat(cs.left)+22,y=parseFloat(cs.top)+11,pts=done.map(i=>WH.pts[i]).concat([[x,y]]);
pl.setAttribute('points',pts.map(q=>q.join(',')).join(' '));pl.style.display=pts.length>1?'':'none';}else pl.style.display='none';
tutRaf=requestAnimationFrame(frame);};
const step=()=>{if(!document.getElementById('tutDot'))return;const ph=k%(n+2);k++;
if(ph===0){done=[];draw=false;place(idx[0],false);dot.style.opacity=1;tutAnim=setTimeout(()=>{done=[idx[0]];draw=true;step();},450);return;}
if(ph<n){place(idx[ph],true);tutAnim=setTimeout(()=>{done.push(idx[ph]);step();},600);return;}
if(ph===n){tutAnim=setTimeout(step,500);return;}
draw=false;dot.style.opacity=0;tutAnim=setTimeout(step,450);};
k=0;step();frame();
}
let tutRaf=0;
function stopTutorial(){clearTimeout(tutAnim);cancelAnimationFrame(tutRaf);for(const id of['tutDot','tutLine']){const d=document.getElementById(id);if(d)d.remove();}}
function flyTo(text,target){
const from=$('preview').getBoundingClientRect(),to=target.getBoundingClientRect();
const e=document.createElement('div');e.className='fly';e.textContent=text.toUpperCase();e.style.fontSize='22px';
const x0=from.left+from.width/2-30,y0=from.top;e.style.left=x0+'px';e.style.top=y0+'px';document.body.appendChild(e);
requestAnimationFrame(()=>{e.style.transform=`translate(${to.left+4-x0}px,${to.top+10-y0}px) scale(.36)`;e.style.opacity='.2';});
setTimeout(()=>e.remove(),560);
}
function coinBurst(from,amount){
const cs=[].filter.call(document.querySelectorAll('.coins'),e=>e.offsetParent!==null),tg=cs[0];
const cc=[].slice.call(document.querySelectorAll('.cc')),fin=S.coins;
if(!from||!tg||CALM()||amount<1||typeof from.getBoundingClientRect!=='function'){updCoins();return false;}
const a=from.getBoundingClientRect(),b=tg.getBoundingClientRect(),n=Math.min(8,Math.max(5,Math.round(amount/2))),base=fin-amount;
let got=0;const show=v=>cc.forEach(e=>{e.textContent=v;});show(base);
for(let i=0;i<n;i++)setTimeout(()=>{
const e=document.createElement('div');e.className='fly coinfly';const x0=a.left+a.width/2-11+(i%3-1)*14,y0=a.top+a.height/2-11;
e.style.left=x0+'px';e.style.top=y0+'px';document.body.appendChild(e);
requestAnimationFrame(()=>requestAnimationFrame(()=>{e.style.transform='translate('+(b.left+b.width/2-11-x0)+'px,'+(b.top+b.height/2-11-y0)+'px) scale(.7)';}));
setTimeout(()=>{e.remove();got++;show(got>=n?fin:base+Math.round(amount*got/n));},560);
},400+i*90);
setTimeout(()=>updCoins(),400+n*90+900);
return true;
}
function flyLetters(cs,extra){
const pv=$('preview').firstElementChild;if(CALM()||!pv||typeof pv.animate!=='function')return null;
const r=pv.getBoundingClientRect();if(!r.width||!cs.length||!cs[0].el)return null;
const n=cs.length,step=(r.width-24)/(n+(extra||0)),y0=r.top+r.height/2,fs=parseFloat(getComputedStyle(pv).fontSize)||24,out=[];
cs.forEach((c,i)=>{const t=c.el.getBoundingClientRect(),x0=r.left+12+step*(i+.5),dx=t.left+t.width/2-x0,dy=t.top+t.height/2-y0,delay=i*55;
const e=document.createElement('div');e.className='flyl';e.textContent=c.ch;e.style.fontSize=fs+'px';e.style.left=(x0-20)+'px';e.style.top=(y0-20)+'px';
document.body.appendChild(e);const k=Math.max(.5,Math.min(1.6,t.height*.56/fs));
e.animate([{transform:'translate(0,0) scale(1)',opacity:.95},{transform:`translate(${dx*.45}px,${dy*.45-46}px) scale(1.2)`,opacity:1,offset:.45},
{transform:`translate(${dx}px,${dy}px) scale(${k})`,opacity:.9}],{duration:380,delay,easing:'cubic-bezier(.35,.1,.45,1)',fill:'both'});
setTimeout(()=>e.remove(),delay+400);out.push(delay+360);});
return out;
}
function boardStamp(t){const b=$('board'),e=document.createElement('div');e.className='bstamp'+(CALM()?' still':'');e.textContent=t;b.appendChild(e);setTimeout(()=>e.remove(),1700);}
function confetti(){
const cols=['#ff8a3d','#f5b72d','#2f6fd6','#34a853','#e2463b','#9a64b8'];
for(let i=0;i<60;i++){const e=document.createElement('div');e.className='confetti';e.style.background=pick(cols);
const x=Math.random()*innerWidth;e.style.left=x+'px';e.style.top='-20px';document.body.appendChild(e);
const dx=(Math.random()-.5)*200,rot=Math.random()*720;
e.animate([{transform:'translate(0,0) rotate(0)'},{transform:`translate(${dx}px,${innerHeight+40}px) rotate(${rot}deg)`}],{duration:1500+Math.random()*1300,easing:'cubic-bezier(.3,.6,.6,1)',delay:Math.random()*300}).onfinish=()=>e.remove();}
}
document.addEventListener('keydown',e=>{
if($('modal').classList.contains('on')){if(e.key==='Escape'&&!(G&&G.won&&$('game').classList.contains('on')))hideModal();
else if(e.key==='Enter'&&!e.repeat){const b=$('mNext')||$('mGo');if(b&&!b.disabled&&b.offsetParent!==null&&!(typeof adBusy!=='undefined'&&adBusy)){e.preventDefault();b.click();}}
return;}
if(!G||G.won||!$('game').classList.contains('on'))return;
const k=e.key.toLowerCase().replace('ё','е');
if(k==='1'){hintLetter();return;}if(k==='2'){hintWord();return;}
if(k==='enter'){const w=G.sel.map(i=>G.letters[i]).join('');G.sel=[];G.tap=false;updSel();submit(w);return;}
if(k==='backspace'){G.sel.pop();updSel();return;}
if(k==='escape'){G.sel=[];updSel();return;}
if(k===' '){shuffleLetters();e.preventDefault();return;}
if(/^[а-я]$/.test(k)){const i=G.letters.findIndex((c,j)=>c===k&&!G.sel.includes(j));if(i>=0){ac();poke();G.sel.push(i);SND.letter(G.sel.length-1);updSel();}}
});
