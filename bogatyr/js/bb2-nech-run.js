/* ===== bb2-nech-run.js — поток NECH «Перевёртыш: Ночь нечисти» (супер-буст в2, 14.10.2026). Набор догрузки 'nech' (заглушка — js/bb2-nech.js).
   Игрок — злодей одолённой главы (8 главных боссов); против него — богатыри. Продержись «до первых петухов» (NIGHT секунд) и посрами побольше богатырей:
   они не гибнут, а убегают «к маме». Своя арена в своём холсте поверх меню: бой игры (game.js) не трогается, правила ядра те же не меняются.
   Рисунки — art.js (spr): злодеи solo…liho, богатыри h_<id>_0/1, стрелы, монеты, вороны/скелеты/рыбы; земля и декор — тема главы злодея (groundTile, CH[].decor).
   Управление: палец/мышь — вести (как в походе), бьёт сам; кнопки ① ② (клавиши 1, 2 или Q, E) — приёмы; Esc/⏸ — пауза.
   API: BB2.nech.open(src) — окно выбора злодея · BB2.nech.play(id) — сразу в ночь · BB2.nech.list() — открытые злодеи · BB2.nech.sim(id,сек) — бот (калибровка, стенд).
   Шина: BB2.ev('nech',{b,sc,win,rec,t}) после ночи; «Подвиги»: BB2.pdv('nech'), BB2.pdv('nech.sc',счёт,1). STAT: nech {a:show|tap|open|go|end|quit,…}.
   Сохранение (заглушка js/bb2-nech.js, fix+merge): S.bb2.nech = {b:{злодей:рекорд}, n:ночей, d:день, g:наград за день, w:неделя, wb:рекорд недели, l:последний злодей}; слияние — рекорды максимум, день/неделя — более поздний (в тот же день — больше выданных наград).
   Числа: BB2.n('nech.openCh'|'nech.gold'|'nech.perDay'), золото — base.small по отрезку глав (как ECO). В силу богатыря режим не вмешивается. Без ?. ?? .finally */
(function(){
'use strict';
if(typeof BB2!=='object'||!BB2)return;
var TAU=Math.PI*2,NIGHT=180,N={ok:1};BB2.nech=N;
function cl(v,a,b){return v<a?a:v>b?b:v;}
function rn(a,b){return a+Math.random()*(b-a);}
/* ---------- злодеи: k — вид приёма (ring круг · cone конус · shot выстрел · dash рывок · pool лужа · summon подручные · coins злато · fly взлёт · beam луч) ---------- */
var V={
  solo:{n:['Соловей-разбойник','Nightingale the Robber'],hp:1100,spd:128,sc:.78,r:26,a:{k:'ring',cd:1,r:84,d:12,push:26,col:'#ffe08a'}, // i18n:ru
    s:[{k:'cone',cd:6,r:240,arc:.75,d:28,push:250,stun:1.5,col:'#fff2b0',ic:'🎶',n:['Посвист','Whistle']},{k:'summon',cd:15,e:'voron',m:6,d:10,life:10,ic:'🐦',n:['Разбойнички','Robber crows']}], // i18n:ru
    hi:['Свистну — шапки полетят!','I whistle — hats fly!']}, // i18n:ru
  yaga:{n:['Баба-Яга','Baba Yaga'],hp:1000,spd:118,sc:.7,r:26,a:{k:'shot',cd:.7,d:16,sp:300,m:1,art:'muh'}, // i18n:ru
    s:[{k:"dash",cd:5,dist:290,d:34,ic:'🧹',n:['Ступа','Mortar dash']},{k:'pool',cd:12,r:115,dur:5,dps:16,slow:.5,col:"#6ad04a",ic:'🧪',n:['Котёл зелья','Brew pot']}], // i18n:ru
    hi:['Фу-фу, русским духом пахнет!','Fie, I smell a hero!']}, // i18n:ru
  gory:{n:['Змей Горыныч','Zmey Gorynych'],hp:1500,spd:106,sc:.56,r:32,a:{k:'shot',cd:.85,d:15,sp:280,m:3,spr:.26,col:'#ff8a3a'}, // i18n:ru
    s:[{k:'cone',cd:7,r:265,arc:.5,d:52,col:'#ff7a2a',fire:1,ic:'🔥',n:['Три пламени','Triple flame']},{k:'fly',cd:14,dur:1.6,r:175,d:62,ic:'🪽',n:['Взлёт','Take off']}], // i18n:ru
    hi:['Три головы — три мнения!','Three heads, three opinions!']}, // i18n:ru
  kosh:{n:['Кощей Бессмертный','Koschei the Deathless'],hp:1200,spd:122,sc:.78,r:24,egg:1,a:{k:'shot',cd:.6,d:20,sp:340,m:2,spr:.2,col:'#5cff9a'}, // i18n:ru
    s:[{k:'summon',cd:12,e:"skel",m:6,d:18,life:12,ic:'💀',n:['Костяная рать','Bone host']},{k:'coins',cd:15,m:8,r:300,dur:4,ic:'🪙',n:['Злато','Gold lure']}], // i18n:ru
    hi:['Смерть моя в яйце. Яйцо — в надёжном месте.','My death is in an egg. The egg is safe.']}, // i18n:ru
  karach:{n:['Карачун','Karachun'],hp:1100,spd:112,sc:.74,r:26,a:{k:'ring',cd:1.1,r:88,d:11,slow:.5,col:'#bfe6ff'}, // i18n:ru
    s:[{k:'cone',cd:6,r:235,arc:.8,d:22,stun:2.4,col:'#dff4ff',ic:'❄️',n:['Стужа','Deep frost']},{k:'pool',cd:12,r:125,dur:6,dps:10,slow:.75,col:'#9ad8ff',ic:'🧊',n:['Наледь','Black ice']}], // i18n:ru
    hi:['Кто без шапки — того заморожу!','No hat? I’ll freeze you!']}, // i18n:ru
  morcar:{n:['Морской царь','Sea King'],hp:1500,spd:112,sc:.7,r:28,a:{k:'shot',cd:.75,d:20,sp:300,m:2,spr:.2,col:'#3ac8ff'}, // i18n:ru
    s:[{k:'ring',cd:7,r:195,d:30,push:270,col:'#7ae0ff',ic:'🌊',n:['Девятый вал','Ninth wave']},{k:'summon',cd:13,e:'ryba',m:8,d:9,life:9,ic:'🐟',n:['Зубастики','Toothy fish']}], // i18n:ru
    hi:['Сухопутные! Плавать умеете?','Landlubbers! Can you swim?']}, // i18n:ru
  tugar:{n:['Змей Тугарин','Tugarin the Serpent'],hp:1300,spd:116,sc:.52,r:32,a:{k:'shot',cd:.8,d:15,sp:300,m:3,spr:.22,col:'#ff7a2a'}, // i18n:ru
    s:[{k:'cone',cd:7,r:265,arc:.55,d:52,col:'#ff5a2a',fire:1,ic:'🔥',n:['Пламя','Fire breath']},{k:"dash",cd:7,dist:330,d:30,ic:'💨',n:['Налёт','Swoop']}], // i18n:ru
    hi:['Подать мне богатырей — и побольше!','Bring me heroes — lots of them!']}, // i18n:ru
  liho:{n:['Лихо Одноглазое','One-Eyed Likho'],hp:1900,spd:102,sc:.56,r:30,a:{k:'ring',cd:1.1,r:92,d:17,push:20,col:'#d6a8ff'}, // i18n:ru
    s:[{k:"beam",cd:5,len:430,w:46,d:56,col:'#ff6aa0',ic:'👁️',n:['Лихой глаз','Evil eye']},{k:'ring',cd:13,r:265,d:15,stun:2.2,col:'#b86bff',ic:'🌀',n:['Привязалось','Clingy woe']}], // i18n:ru
    hi:['Не буди лихо… поздно.','Let sleeping woe lie… too late.']} // i18n:ru
};
var SN={solo:["Соловей","Nightingale"],yaga:["Яга","Yaga"],gory:["Горыныч","Gorynych"],kosh:["Кощей","Koschei"],karach:["Карачун","Karachun"],morcar:["Морской царь","Sea King"],tugar:["Тугарин","Tugarin"],liho:["Лихо","Likho"]}; // i18n:ru
var ORDV=['solo','yaga','gory','kosh','karach','morcar','tugar','liho'];
var HIDS=['dob','ale','ily','vas','sad','mik','vol','mar','iva'];
var HN={dob:['Добрыня','Dobrynya'],ale:['Алёша','Alyosha'],ily:['Илья','Ilya'],vas:['Василиса','Vasilisa'],sad:['Садко','Sadko'],mik:['Микула','Mikula'],vol:['Вольга','Volga'],mar:['Марья','Marya'],iva:['Иван','Ivan']}; // i18n:ru
/* крики убегающих — готовыми картинками (один раз), чтобы не готовить буквы каждый кадр */
var CRY=[['Мама!','Mum!'],['Я за подмогой!','Getting help!'],['Не по былине!','Not in the legend!'],['Нечестно!','Unfair!'],['Пойду на печь','Off to the stove'], // i18n:ru
  ['Шапку отдай!','Give my hat back!'],['Это всё конь!','The horse did it!'],['Скажу Илье!','I’m telling Ilya!'],['Я просто мимо шёл','Just passing by'],['Ой-ой-ой!','Oh no no no!']]; // i18n:ru
/* медали по счёту (одинаковы для всех злодеев; калибровка ботом — журнал NECH) */
var MD=[150,400,600],REG=1.5,OB=25,SPD=.8,DK=.55;
/* ---------- сохранение и открытость ---------- */
function sv(){return BB2.s('nech');}
function wk(){return Math.floor((dayMs()/864e5+3)/7);}
function today(){return dayKey();}
function nDone(){var n=0,k;for(k in S.done)if(S.done[k])n++;return n;}
function band(){var b=BB2.n('base.band',[3,18]),n=nDone();return n<=b[0]?0:n<=b[1]?1:2;}
function goldAmt(){var g=BB2.n('nech.gold','s'),t={s:'small',m:'mid',b:'big'}[g]||'small',a=BB2.n('base.'+t,[70,200,650]);return a[band()]|0;}
function left(){var o=sv(),p=BB2.n('nech.perDay',3);return o.d===today()?Math.max(0,p-(o.g|0)):p;}
function chOf(id){var s;for(s=0;s<CH.length;s++)if(CH[s]&&CH[s].boss===id)return s;return 0;}
function isOpen(id){var k;for(k in S.done)if(S.done[k]&&CH[k]&&CH[k].boss===id)return true;return false;}
N.list=function(){var a=ORDV.filter(isOpen);if(!a.length)a=['solo'];return a;};
function featured(){var a=N.list();return a[wk()%a.length];}
function best(id){var b=sv().b;return (b&&b[id])|0;}
function medal(sc){return sc>=MD[2]?3:sc>=MD[1]?2:sc>=MD[0]?1:0;}
var MED=['','🥉','🥈','🥇'];
/* ---------- окно выбора ---------- */
var sel=null;
N.open=function(src){if(!BB2.on('nech'))return;var a=N.list(),f=featured(),o=sv();if(!sel||a.indexOf(sel)<0)sel=o.l&&a.indexOf(o.l)>=0?o.l:f;
  BB2.stat('nech',{a:'open',s:src||''});
  var cards=ORDV.map(function(id){var op=a.indexOf(id)>=0,v=V[id],b=best(id);
    return '<div class="card nchC'+(id===sel?' on':'')+'" data-id="'+id+'" style="min-width:0;overflow-wrap:anywhere;padding:6px 4px;margin:0;cursor:'+(op?'pointer':'default')+';opacity:'+(op?1:.42)+';'+(id===sel?'outline:3px solid #ffd84a;':'')+'text-align:center;font-size:11px;line-height:1.2">'+
      '<img src="'+iconURL(id,72)+'" width="46" height="46" alt="" style="'+(op?'':'filter:grayscale(1)')+'"><br><b style="font-size:12px">'+L(SN[id][0],SN[id][1])+'</b><br>'+
      (op?(b?'🏆 '+b+' '+MED[medal(b)]:L('новенький','new')):'🔒 '+L('глава ','ch. ')+(chOf(id)+1))+(id===f&&op?'<br><span style="color:#ffd84a">⭐ '+L('злодей недели','villain of the week')+'</span>':'')+'</div>';}).join('');
  var g=goldAmt(),lf=left();
  showModal('<h3>'+L('🌙 Ночь нечисти','🌙 Night of the Fiends')+'</h3><p class="sub">'+L('Сегодня ты — злодей! Продержись до первых петухов и посрами побольше богатырей. Никто не пострадает: богатыри просто убегут к маме.',
    'Tonight you are the villain. Last until the roosters crow and shame as many heroes as you can. Don’t worry: nobody gets hurt — they just run home to mum.')+'</p>'+
    '<div id="nchGrid" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:8px 0">'+cards+'</div>'+
    '<div class="card" style="font-size:12px;line-height:1.45;text-align:left">'+L('👆 Веди пальцем — бьёшь сам. ① ② — приёмы злодея.','👆 Drag to move — you attack by yourself. ① ② — villain moves.')+'<br>'+
    (lf>0?L('🎁 За ночь (посрами хоть 10): +'+fmtNum(g)+' золота · осталось '+lf+' из '+BB2.n('nech.perDay',3)+' сегодня','🎁 Per night (shame at least 10): +'+fmtNum(g)+' gold · '+lf+' of '+BB2.n('nech.perDay',3)+' left today'):
      L('🎁 Золото за ночи сегодня уже взято — играй за рекорд, завтра снова','🎁 Today’s gold is taken — play for the record, more tomorrow'))+'<br>'+
    L('Силу богатыря режим не меняет — это потеха.','This mode doesn’t change your hero’s power — it’s just for fun.')+'</div>'+
    '<div class="btns"><button class="btn big" id="nchGo">'+L('🌙 Начать ночь','🌙 Start the night')+'</button><button class="btn ghost" id="nchX">'+L('Назад','Back')+'</button></div>','nech');
  var gr=$('nchGrid');if(gr)gr.onclick=function(e){var c=e.target.closest('.nchC');if(!c)return;var id=c.getAttribute('data-id');
    if(a.indexOf(id)<0){SND.click();toast(L('Сначала одолей его в походе','Beat this one in a campaign first'));return;}SND.click();sel=id;N.open(src);};
  on('nchGo',function(){hideModal();N.play(sel);});on('nchX',hideModal);};

/* ---------- ночь: состояние ---------- */
var Q=null,cv=null,cx=null,box=null,raf=0,last=0,KEYS={},PT={on:0,ox:0,oy:0,px:0,py:0},VW={W:0,H:0,dpr:1,z:1,B:1,ww:0,wh:0},CAM={x:0,y:0},BUB={};
function heroK(){return HIDS[Math.floor(Math.random()*HIDS.length)];}
function newQ(id){var v=V[id];return {b:id,v:v,chi:chOf(id),x:0,y:0,hp:v.hp,hpM:v.hp,t:0,sc:0,zl:0,cd:[0,2,4],en:[],pr:[],fx:[],al:[],coins:[],pools:[],warn:[],pt:[],bub:[],
  inv:0,fly:0,dash:null,egg:v.egg?1:0,face:1,mx:0,my:0,hurt:0,sp:0,named:[45,90,120,150],ob:OB,over:0,paused:0,shamed:{},ily:0,ilyOut:0,step:0,kill:0,banner:null,sim:0};}
/* богатыри-враги: dr — дружинник, lu — лучник, bg — именной богатырь, il — Илья Муромец */
function spawn(k,id,ang,R0){var q=Q,a=ang==null?Math.random()*TAU:ang,R=R0||Math.hypot(VW.ww,VW.wh)+40,m=1+q.t/40,f=1+q.t/240,e={k:k,id:id||heroK(),x:q.x+Math.cos(a)*R,y:q.y+Math.sin(a)*R,ph:Math.random()*9,cd:rn(.2,1),st:0,sl:0,hf:0,vx:0,vy:0,run:0,lure:null};
  if(k==='dr'){e.hp=22*m;e.r=13;e.spd=rn(76,94)*f;e.dmg=8;e.sc=.6;}
  else if(k==='lu'){e.id='ale';e.hp=16*m;e.r=12;e.spd=80*f;e.dmg=8;e.sc=.6;e.cd=rn(1,2.4);}
  else if(k==='bg'){e.hp=260*m;e.r=19;e.spd=64;e.dmg=12;e.sc=.82;}
  else {e.id='ily';e.hp=2600+q.t*6;e.r=27;e.spd=56;e.dmg=20;e.sc=1.2;e.sl0=4;}
  e.hpM=e.hp;q.en.push(e);return e;}
function aimAt(q){var b=null,bd=1e9,i,e,d;for(i=0;i<q.en.length;i++){e=q.en[i];if(e.run)continue;d=(e.x-q.x)*(e.x-q.x)+(e.y-q.y)*(e.y-q.y);if(d<bd){bd=d;b=e;}}
  if(b&&bd<420*420){var l=Math.sqrt(bd)||1;return {x:(b.x-q.x)/l,y:(b.y-q.y)/l,e:b,d:l};}var m=Math.hypot(q.mx,q.my);return m>.1?{x:q.mx/m,y:q.my/m,e:null,d:0}:{x:q.face,y:0,e:null,d:0};}
function dmgK(q){return DK*(1+.12*q.zl);}
function hit(e,d,px,py,stun,slow){var q=Q;if(e.run)return;e.hp-=d*dmgK(q);e.hf=.12;if(px||py){e.vx+=px;e.vy+=py;}if(stun)e.st=Math.max(e.st,stun*(e.k==='il'?.4:1));if(slow)e.sl=Math.max(e.sl,1.5);
  if(e.hp<=0)shame(e);}
function shame(e){var q=Q;e.run=1.3;e.lure=null;var dx=e.x-q.x,dy=e.y-q.y,l=Math.hypot(dx,dy)||1;e.vx=dx/l*240;e.vy=dy/l*240;
  var add=e.k==='il'?15:e.k==='bg'?5:1;q.sc+=add;q.kill++;if(e.k!=='lu')q.shamed[e.id]=(q.shamed[e.id]||0)+1;
  if(e.k==='il'){q.ily=1;ban(L('Илья Муромец ушёл обратно на печь!','Ilya Muromets went back to his stove!'),'+15');}
  else if(e.k==='bg')ban(L(HN[e.id][0]+' убежал'+(e.id==='vas'||e.id==='mar'?'а':'')+' жаловаться!',HN[e.id][1]+' ran off to complain!'),'+5');
  if(q.bub.length<3&&Math.random()<(e.k==='dr'||e.k==='lu'?.22:1))q.bub.push({e:e,i:Math.floor(Math.random()*CRY.length),t:1.3});
  var z=Math.floor(q.sc/25);if(z>q.zl){q.zl=z;q.hp=Math.min(q.hpM,q.hp+q.hpM*.08);ban(L('Злоба растёт!','Spite grows!'),L('сила +12 %, здоровье +8 %','power +12%, health +8%'));if(!q.sim)SND.level();}
  for(var i=0;i<6;i++)part(e.x,e.y-8,'#ffe08a');if(!q.sim&&Math.random()<.5)SND.kill();}
function part(x,y,col){var q=Q;if(q.sim||q.pt.length>160)return;var a=Math.random()*TAU,s=rn(40,140);q.pt.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,t:.5,col:col});}
function ban(t,s){if(Q.sim)return;Q.banner={t:t,s:s||'',l:2.2};}
function hurt(d){var q=Q;if(q.inv>0||q.fly>0||q.over)return;q.hp-=d;q.hurt=.25;if(!q.sim&&Math.random()<.3)SND.hurt();
  if(q.hp<=0){if(q.egg){q.egg=0;q.hp=q.hpM*.5;q.inv=2;ban(L('Смерть Кощея — в яйце! А яйцо цело.','Koschei’s death is in the egg — and the egg is fine.'));
      for(var i=0;i<q.en.length;i++){var e=q.en[i],dx=e.x-q.x,dy=e.y-q.y,l=Math.hypot(dx,dy)||1;if(l<260){e.vx+=dx/l*300;e.vy+=dy/l*300;e.st=1;}}return;}
    q.hp=0;end(0);}}
/* приёмы */
function use(q,s,auto){var a=aimAt(q),i,e,dx,dy,l;
  if(s.k==='ring'){fx(q,{k:'ring',x:q.x,y:q.y,r:s.r,col:s.col,t:.3,T:.3});for(i=0;i<q.en.length;i++){e=q.en[i];dx=e.x-q.x;dy=e.y-q.y;l=Math.hypot(dx,dy)||1;
      if(l<s.r+e.r)hit(e,s.d,dx/l*(s.push||0),dy/l*(s.push||0),s.stun,s.slow);}if(!auto&&!q.sim)SND.boom();}
  else if(s.k==='cone'){var an=Math.atan2(a.y,a.x);fx(q,{k:'cone',x:q.x,y:q.y,r:s.r,a:an,w:s.arc,col:s.col,t:.4,T:.4});
    for(i=0;i<q.en.length;i++){e=q.en[i];dx=e.x-q.x;dy=e.y-q.y;l=Math.hypot(dx,dy)||1;if(l>s.r+e.r)continue;var df=Math.abs(((Math.atan2(dy,dx)-an)%TAU+TAU*1.5)%TAU-Math.PI);
      if(df<s.arc||l<q.v.r+e.r)hit(e,s.d,dx/l*(s.push||0),dy/l*(s.push||0),s.stun,0);}if(!q.sim)(s.fire?SND.boom:SND.whistle)();}
  else if(s.k==='shot'){var b0=Math.atan2(a.y,a.x),m=s.m||1;for(i=0;i<m;i++){var bb=b0+(i-(m-1)/2)*(s.spr||0);q.pr.push({x:q.x,y:q.y-10,vx:Math.cos(bb)*s.sp,vy:Math.sin(bb)*s.sp,t:1.3,d:s.d,mine:1,n:3,col:s.col,art:s.art,r:9});}if(!q.sim&&Math.random()<.35)SND.shoot();}
  else if(s.k==='dash'){q.dash={x:a.x,y:a.y,t:.26,v:s.dist/.26,d:s.d,hit:[]};q.inv=Math.max(q.inv,.35);if(!q.sim)SND.swing();}
  else if(s.k==='pool'){var px=q.x,py=q.y;if(a.e&&a.d<240){px=a.e.x;py=a.e.y;}q.pools.push({x:px,y:py,r:s.r,t:s.dur,T:s.dur,dps:s.dps,slow:s.slow,col:s.col});if(!q.sim)SND.zap();}
  else if(s.k==='summon'){for(i=0;i<s.m;i++){var ag=i/s.m*TAU;q.al.push({e:s.e,x:q.x+Math.cos(ag)*40,y:q.y+Math.sin(ag)*40,t:s.life,d:s.d,cd:0,ph:Math.random()*9,fly:s.e!=='skel'});}if(!q.sim)SND.boss();}
  else if(s.k==='coins'){q.coins.length=0;for(i=0;i<s.m;i++){var ca=Math.random()*TAU,cr=rn(70,150);q.coins.push({x:q.x+Math.cos(ca)*cr,y:q.y+Math.sin(ca)*cr,t:s.dur});}
    for(i=0;i<q.en.length;i++){e=q.en[i];if(e.run||e.k==='il')continue;if(Math.hypot(e.x-q.x,e.y-q.y)<s.r)e.lure=q.coins[i%q.coins.length];}ban(L('Богатыри чахнут над златом!','The heroes pine over the gold!'));if(!q.sim)SND.coin();}
  else if(s.k==='fly'){q.fly=s.dur;q.flyS=s;if(!q.sim)SND.swing();}
  else if(s.k==='beam'){var an2=Math.atan2(a.y,a.x),cs=Math.cos(an2),sn=Math.sin(an2);fx(q,{k:'beam',x:q.x,y:q.y-20,a:an2,r:s.len,w:s.w,col:s.col,t:.35,T:.35});
    for(i=0;i<q.en.length;i++){e=q.en[i];dx=e.x-q.x;dy=e.y-q.y;var along=dx*cs+dy*sn,side=Math.abs(-dx*sn+dy*cs);if(along>0&&along<s.len&&side<s.w/2+e.r)hit(e,s.d,cs*60,sn*60,0,0);}if(!q.sim)SND.zap();}}
function fx(q,o){if(!q.sim)q.fx.push(o);}
function skill(i){var q=Q;if(!q||q.over||q.paused||q.cd[i]>0||q.fly>0)return;var s=q.v.s[i-1];q.cd[i]=s.cd;use(q,s,0);}
/* ---------- шаг ---------- */
function step(dt){var q=Q,i,e,dx,dy,l;q.t+=dt;
  /* движение злодея */
  var mx=0,my=0;if(q.sim){q.ait=(q.ait||0)-dt;if(q.ait<=0){q.ait=.4;q.ai=simAI(q);}mx=q.ai.x;my=q.ai.y;}else{mx=(KEYS.KeyD||KEYS.ArrowRight?1:0)-(KEYS.KeyA||KEYS.ArrowLeft?1:0);my=(KEYS.KeyS||KEYS.ArrowDown?1:0)-(KEYS.KeyW||KEYS.ArrowUp?1:0);
    if(PT.on){dx=PT.px-PT.ox;dy=PT.py-PT.oy;l=Math.hypot(dx,dy);if(l>6){var mm=Math.min(1,l/40);mx=dx/l*mm;my=dy/l*mm;}}}
  l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}q.mx=mx;q.my=my;if(mx)q.face=mx>0?1:-1;
  if(q.dash){var D=q.dash;q.x+=D.x*D.v*dt;q.y+=D.y*D.v*dt;D.t-=dt;for(i=0;i<q.en.length;i++){e=q.en[i];if(e.run||D.hit.indexOf(e)>=0)continue;if(Math.hypot(e.x-q.x,e.y-q.y)<q.v.r+e.r+18){D.hit.push(e);hit(e,D.d,D.x*120,D.y*120,.6,0);}}if(D.t<=0)q.dash=null;}
  else{q.x+=mx*q.v.spd*SPD*dt;q.y+=my*q.v.spd*SPD*dt;}if(l>.1)q.step+=dt*6;
  if(q.inv>0)q.inv-=dt;if(q.hurt>0)q.hurt-=dt;
  if(q.fly>0){q.fly-=dt;if(q.fly<=0){var fs=q.flyS;fx(q,{k:'ring',x:q.x,y:q.y,r:fs.r,col:'#ffb060',t:.4,T:.4});for(i=0;i<q.en.length;i++){e=q.en[i];dx=e.x-q.x;dy=e.y-q.y;l=Math.hypot(dx,dy)||1;if(l<fs.r+e.r)hit(e,fs.d,dx/l*200,dy/l*200,1,0);}if(!q.sim)SND.boom();}}
  q.hp=Math.min(q.hpM,q.hp+REG*dt);
  /* перезарядка и сам бьёт */
  for(i=0;i<3;i++)if(q.cd[i]>0)q.cd[i]-=dt;
  if(q.cd[0]<=0&&q.fly<=0){var aa=q.v.a;if(aa.k!=='shot'||aimAt(q).e){q.cd[0]=aa.cd;use(q,aa,1);}}
  if(q.sim){if(q.cd[1]<=0&&aimAt(q).d<220)skill(1);if(q.cd[2]<=0&&q.en.length>8)skill(2);}
  /* кто выходит */
  if(q.t<NIGHT){var rate=.9+q.t*.028;q.sp+=rate*dt;var alive=0;for(i=0;i<q.en.length;i++)if(!q.en[i].run)alive++;
    while(q.sp>=1){q.sp-=1;if(alive>=140)continue;alive++;spawn(q.t>30&&Math.random()<(q.t>60?.22:.14)?"lu":"dr");}
    if(q.t>=q.ob){q.ob+=OB;var oc=Math.min(28,10+Math.floor(q.t/10)),orr=Math.max(VW.ww,VW.wh)+20;for(var oi=0;oi<oc;oi++)spawn(oi%5===4&&q.t>40?"lu":"dr",null,oi/oc*TAU,orr);ban(L("Облава!","Round-up!"),L("богатыри обходят со всех сторон","heroes close in from all sides"));}
    if(q.named.length&&q.t>=q.named[0]){var nt=q.named.shift();
      if(nt===150){spawn('il');ban(L('Илья Муромец слез с печи!','Ilya Muromets got off the stove!'),L('33 года лежал — и вот…','33 years in bed — and now…'));if(!q.sim)SND.boss();}
      else{var c=nt===120?2:1;for(var j=0;j<c;j++){var bg=spawn('bg',['dob','vol','mar','vas','sad','mik'][(nt/15+j)%6]);if(j===0)ban(L('Идёт '+HN[bg.id][0]+'!',HN[bg.id][1]+' is coming!'),L('именной богатырь: +5 за него','named hero: +5'));}}}}
  else if(!q.over){q.sc+=25;end(1);return;}
  /* богатыри */
  var bx=q.x,by=q.y,fly=q.fly>0;
  for(i=0;i<q.en.length;i++){e=q.en[i];e.ph+=dt;if(e.hf>0)e.hf-=dt;
    if(e.run){e.run-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;continue;}
    var sp=e.spd*(e.sl>0?.45:1);if(e.sl>0)e.sl-=dt;
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=Math.pow(.02,dt);e.vy*=Math.pow(.02,dt);
    if(e.st>0){e.st-=dt;continue;}
    if(e.lure){if(e.lure.t<=0){e.lure=null;}else{dx=e.lure.x-e.x;dy=e.lure.y-e.y;l=Math.hypot(dx,dy);if(l>6){e.x+=dx/l*sp*1.3*dt;e.y+=dy/l*sp*1.3*dt;}continue;}}
    dx=bx-e.x;dy=by-e.y;l=Math.hypot(dx,dy)||1;e.fl=dx>0?1:-1;
    if(e.k==='lu'){var want=170;if(l>want+20){e.x+=dx/l*sp*dt;e.y+=dy/l*sp*dt;}else if(l<want-30){e.x-=dx/l*sp*.7*dt;e.y-=dy/l*sp*.7*dt;}
      e.cd-=dt;if(e.cd<=0&&l<320&&!fly){e.cd=2.3;q.pr.push({x:e.x,y:e.y-8,vx:dx/l*250,vy:dy/l*250,t:1.6,d:e.dmg,art:'arrow',r:6});}continue;}
    if(e.k==='il'){e.cd-=dt;if(e.cd<=0&&l<230&&!fly){e.cd=4.2;q.warn.push({x:bx,y:by,r:88,t:.9,T:.9,d:34});}}
    var reach=q.v.r+e.r;if(l>reach-2){e.x+=dx/l*sp*dt;e.y+=dy/l*sp*dt;}
    else if(!fly){e.cd-=dt;if(e.cd<=0){e.cd=1;hurt(e.dmg);}}}
  /* толкучка: богатыри не налезают друг на друга (сетка 40) */
  sep(q);
  /* снаряды */
  for(i=0;i<q.pr.length;i++){var p=q.pr[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt;if(p.t<=0)continue;
    if(p.mine){for(var k=0;k<q.en.length;k++){e=q.en[k];if(e.run)continue;if(Math.abs(e.x-p.x)<e.r+p.r&&Math.abs(e.y-p.y)<e.r+p.r){if(p.hl===e)continue;hit(e,p.d,p.vx*.12,p.vy*.12,0,0);p.hl=e;part(p.x,p.y,p.col||"#fff");if(--p.n<=0){p.t=0;break;}}}}
    else if(Math.hypot(bx-p.x,by-10-p.y)<q.v.r*.8){hurt(p.d);p.t=0;}}
  /* лужи, удары Ильи, злато, подручные */
  for(i=0;i<q.pools.length;i++){var po=q.pools[i];po.t-=dt;for(var k2=0;k2<q.en.length;k2++){e=q.en[k2];if(e.run)continue;if(Math.hypot(e.x-po.x,(e.y-po.y)*1.3)<po.r){e.hp-=po.dps*dt*dmgK(q);e.sl=Math.max(e.sl,.3);if(e.hp<=0)shame(e);}}}
  for(i=0;i<q.warn.length;i++){var w=q.warn[i];w.t-=dt;if(w.t<=0&&!w.done){w.done=1;fx(q,{k:'ring',x:w.x,y:w.y,r:w.r,col:'#ff5a3a',t:.3,T:.3});if(Math.hypot(q.x-w.x,q.y-w.y)<w.r+q.v.r*.5)hurt(w.d);if(!q.sim)SND.crack();}}
  for(i=0;i<q.coins.length;i++)q.coins[i].t-=dt;
  for(i=0;i<q.al.length;i++){var a=q.al[i];a.t-=dt;a.ph+=dt;var tg=null,td=1e9;for(var k3=0;k3<q.en.length;k3++){e=q.en[k3];if(e.run)continue;var dd=Math.abs(e.x-a.x)+Math.abs(e.y-a.y);if(dd<td){td=dd;tg=e;}}
    if(tg){dx=tg.x-a.x;dy=tg.y-a.y;l=Math.hypot(dx,dy)||1;if(l>tg.r+8){a.x+=dx/l*150*dt;a.y+=dy/l*150*dt;}else{a.cd-=dt;if(a.cd<=0){a.cd=.6;hit(tg,a.d,dx/l*30,dy/l*30,0,0);}}a.fl=dx>0?1:-1;}}
  for(i=0;i<q.fx.length;i++)q.fx[i].t-=dt;for(i=0;i<q.pt.length;i++){var pp=q.pt[i];pp.t-=dt;pp.x+=pp.vx*dt;pp.y+=pp.vy*dt;pp.vy+=300*dt;}
  for(i=0;i<q.bub.length;i++)q.bub[i].t-=dt;if(q.banner){q.banner.l-=dt;if(q.banner.l<=0)q.banner=null;}
  /* уборка на месте */
  cmp(q.en,function(e){return !(e.run&&e.run<=0)&&Math.abs(e.x-q.x)<1600&&Math.abs(e.y-q.y)<1600;});cmp(q.pr,function(p){return p.t>0;});cmp(q.pools,function(p){return p.t>0;});
  cmp(q.warn,function(w){return w.t>-.05;});cmp(q.coins,function(c){return c.t>0;});cmp(q.al,function(a){return a.t>0;});cmp(q.fx,function(f){return f.t>0;});cmp(q.pt,function(p){return p.t>0;});cmp(q.bub,function(b){return b.t>0;});}
function cmp(a,f){var j=0;for(var i=0;i<a.length;i++)if(f(a[i]))a[j++]=a[i];a.length=j;}
var GRID={};
function sep(q){var g=GRID={},k,i,e,c,cx0,cy0;
  for(i=0;i<q.en.length;i++){e=q.en[i];if(e.run)continue;k=Math.floor(e.x/40)+','+Math.floor(e.y/40);(g[k]||(g[k]=[])).push(e);}
  for(i=0;i<q.en.length;i++){e=q.en[i];if(e.run)continue;cx0=Math.floor(e.x/40);cy0=Math.floor(e.y/40);
    for(var ox=-1;ox<=1;ox++)for(var oy=-1;oy<=1;oy++){c=g[(cx0+ox)+','+(cy0+oy)];if(!c)continue;for(var j=0;j<c.length;j++){var o=c[j];if(o===e)continue;
      var dx=e.x-o.x,dy=e.y-o.y,d=dx*dx+dy*dy,r=(e.r+o.r)*.8;if(d<r*r&&d>.01){d=Math.sqrt(d);var p=(r-d)*.25/d;e.x+=dx*p;e.y+=dy*p;}}}}}
/* бот для калибровки: уходит от толпы по кругу, приёмы — когда готовы */
function simAI(q){var fx0=0,fy0=0,i,e,dx,dy,l;for(i=0;i<q.en.length;i++){e=q.en[i];if(e.run)continue;dx=q.x-e.x;dy=q.y-e.y;l=dx*dx+dy*dy;if(l<200*200){l=Math.sqrt(l)||1;fx0+=dx/l/l*60;fy0+=dy/l/l*60;}}
  var ta=q.t*.5;fx0+=Math.cos(ta)*.6;fy0+=Math.sin(ta)*.6;l=Math.hypot(fx0,fy0)||1;return {x:fx0/l,y:fy0/l};}
N.sim=function(id,sec){var keep=Q;Q=newQ(id||'solo');Q.sim=1;VW.ww=VW.ww||200;VW.wh=VW.wh||330;var dt=1/30,n=Math.round((sec||NIGHT+1)/dt);
  for(var i=0;i<n&&!Q.over;i++)step(dt);var r={b:Q.b,sc:Q.sc,win:Q.over===2?1:0,t:Math.round(Q.t),hp:Math.round(Q.hp),zl:Q.zl};Q=keep;return r;};
/* ---------- рисование ---------- */
function wT(){var B=VW.B;cx.setTransform(B,0,0,B,cv.width/2-CAM.x*B,cv.height/2-CAM.y*B);}
function ds(key,x,y,sx,sy,fl,rot,al){var s=SPR[key]||spr(key);if(!s)return;var B=VW.B,tx=(x-CAM.x)*B+cv.width/2,ty=(y-CAM.y)*B+cv.height/2;
  if(rot){var c=Math.cos(rot),n=Math.sin(rot);cx.setTransform(B*sx*c,B*sx*n,-B*sy*n,B*sy*c,tx,ty);}else cx.setTransform(B*sx,0,0,B*sy,tx,ty);
  if(al!=null)cx.globalAlpha=al;cx.drawImage(fl?sprF(s):s.c,-s.s/2,-s.s/2,s.s,s.s);if(al!=null)cx.globalAlpha=1;}
function bubImg(i){if(BUB[i])return BUB[i];var t=L(CRY[i][0],CRY[i][1]),c=mkCanvas(10,10),g=c.getContext('2d'),f='bold 26px sans-serif';g.font=f;var w=Math.ceil(g.measureText(t).width)+28;
  c=mkCanvas(w,48);g=c.getContext('2d');g.fillStyle='#fffbe8';g.strokeStyle='#5a3a1e';g.lineWidth=3;g.beginPath();var r=14;g.moveTo(r,2);g.lineTo(w-r,2);g.quadraticCurveTo(w-2,2,w-2,r);g.lineTo(w-2,40-r);
  g.quadraticCurveTo(w-2,40,w-r,40);g.lineTo(28,40);g.lineTo(16,47);g.lineTo(18,40);g.lineTo(r,40);g.quadraticCurveTo(2,40,2,40-r);g.lineTo(2,r);g.quadraticCurveTo(2,2,r,2);g.fill();g.stroke();
  g.fillStyle='#3a2410';g.font=f;g.textBaseline='middle';g.fillText(t,14,22);return BUB[i]=c;}
function drawMe(q){var c=cx,fy=q.fly>0?-30*Math.sin(Math.min(1,(q.flyS.dur-q.fly)/q.flyS.dur)*Math.PI):0,vs=q.v.sc,bob=Math.sin(q.t*3)*1.2;
  wT();c.fillStyle="rgba(0,0,0,.22)";c.beginPath();c.ellipse(q.x,q.y+q.v.r*.8,q.v.r,q.v.r*.35,0,0,TAU);c.fill();
  ds(q.b,q.x,q.y+fy-bob,-q.face*vs,vs,q.hurt>.17&&Math.floor(q.t*12)%2===0,0,q.inv>0&&q.hurt<=0?.6:null);}
function draw(){var q=Q,c=cx,B=VW.B,i,e;CAM.x+=(q.x-CAM.x)*.2;CAM.y+=(q.y-CAM.y)*.2;c.setTransform(1,0,0,1,0,0);
  var tile=groundTile(q.chi),T=512,x0=Math.floor((CAM.x-VW.ww)/T),x1=Math.floor((CAM.x+VW.ww)/T),y0=Math.floor((CAM.y-VW.wh)/T),y1=Math.floor((CAM.y+VW.wh)/T);
  wT();for(i=x0;i<=x1;i++)for(var j=y0;j<=y1;j++)c.drawImage(tile,i*T,j*T,T+.5,T+.5);
  var dec=CH[q.chi].decor||[],CS=230,a0=Math.floor((CAM.x-VW.ww-60)/CS),a1=Math.floor((CAM.x+VW.ww+60)/CS),b0=Math.floor((CAM.y-VW.wh-60)/CS),b1=Math.floor((CAM.y+VW.wh+60)/CS);
  if(dec.length)for(i=a0;i<=a1;i++)for(j=b0;j<=b1;j++){if(Math.abs(i)+Math.abs(j)<1||hash(i,j,q.chi+77)>.6)continue;var key=dec[Math.floor(hash(i,j,99)*dec.length)];ds(key,(i+.15+hash(i,j,3)*.7)*CS,(j+.15+hash(i,j,7)*.7)*CS,hash(i,j,11)<.5?1:-1,1);}
  /* ночь: синий налёт, к рассвету светлеет (один прямоугольник) */
  var dawn=cl((q.t-NIGHT+40)/40,0,1);c.setTransform(1,0,0,1,0,0);c.fillStyle='rgba(20,24,70,'+(.34*(1-dawn))+')';c.fillRect(0,0,cv.width,cv.height);
  if(dawn>0){c.fillStyle='rgba(255,190,120,'+(.16*dawn)+')';c.fillRect(0,0,cv.width,cv.height);}
  wT();
  for(i=0;i<q.pools.length;i++){var p=q.pools[i],al=Math.min(1,p.t*2,(p.T-p.t)*5);c.globalAlpha=.42*al;c.fillStyle=p.col;c.beginPath();c.ellipse(p.x,p.y,p.r,p.r*.75,0,0,TAU);c.fill();c.globalAlpha=1;}
  for(i=0;i<q.warn.length;i++){var w=q.warn[i];if(w.done)continue;var k=1-w.t/w.T;c.fillStyle='rgba(255,60,30,'+(.12+.2*k)+')';c.beginPath();c.ellipse(w.x,w.y,w.r,w.r*.75,0,0,TAU);c.fill();
    c.strokeStyle='rgba(255,120,60,.8)';c.lineWidth=3;c.beginPath();c.ellipse(w.x,w.y,w.r*k,w.r*.75*k,0,0,TAU);c.stroke();}
  for(i=0;i<q.coins.length;i++)ds('coin',q.coins[i].x,q.coins[i].y,.7*Math.cos(q.t*5+i),.7);
  /* существа по y */
  var L2=[];for(i=0;i<q.en.length;i++){e=q.en[i];if(Math.abs(e.x-CAM.x)<VW.ww+60&&Math.abs(e.y-CAM.y)<VW.wh+80)L2.push(e);}for(i=0;i<q.al.length;i++)L2.push(q.al[i]);L2.sort(function(a,b){return a.y-b.y;});
  for(i=0;i<L2.length;i++){e=L2[i];
    
    if(e.e){ds(e.e,e.x,e.y+(e.fly?Math.sin(e.ph*6)*3-6:0),(e.fl||1)*.8,.8,0,0,Math.min(1,e.t*2));continue;}
    var fr=Math.floor(e.ph*5)%2,s=e.sc;
    if(e.run){var rt=e.run;ds('h_'+e.id+'_'+fr,e.x,e.y-Math.abs(Math.sin(rt*14))*8,(e.vx>0?1:-1)*s,s,0,Math.sin(rt*20)*.25,Math.min(1,rt*1.6));continue;}
    ds('h_'+e.id+'_'+fr,e.x,e.y-(e.st>0?0:Math.abs(Math.sin(e.ph*8))*1.5),(e.fl||1)*s,s,e.hf>0,e.st>0?.3:0,null);
    if(e.lure){ds('coin',e.x+10,e.y-e.r*1.6,.35,.35);}
    if(e.k==='bg'||e.k==='il'){wT();var bw=e.r*2.2,f=Math.max(0,e.hp/e.hpM);c.fillStyle='rgba(0,0,0,.5)';c.fillRect(e.x-bw/2,e.y-e.r*2.4,bw,4);c.fillStyle=e.k==='il'?'#ff5a3a':'#ffb03a';c.fillRect(e.x-bw/2,e.y-e.r*2.4,bw*f,4);}}
  drawMe(q);
  /* снаряды и вспышки */
  c.globalCompositeOperation='lighter';
  for(i=0;i<q.pr.length;i++){var pr=q.pr[i];if(pr.art)continue;wT();c.drawImage(glowSpr(pr.col),pr.x-14,pr.y-14,28,28);}
  c.globalCompositeOperation='source-over';
  for(i=0;i<q.pr.length;i++){pr=q.pr[i];if(pr.art)ds(pr.art,pr.x,pr.y,pr.art==='arrow'?.5:.6,pr.art==='arrow'?.5:.6,0,pr.art==='arrow'?Math.atan2(pr.vy,pr.vx):q.t*8);}
  wT();
  for(i=0;i<q.fx.length;i++){var f2=q.fx[i],kk=1-f2.t/f2.T;c.globalAlpha=Math.max(0,1-kk);
    if(f2.k==='ring'){c.strokeStyle=f2.col;c.lineWidth=6*(1-kk)+2;c.beginPath();c.ellipse(f2.x,f2.y,f2.r*(.3+.7*kk),f2.r*(.3+.7*kk)*.75,0,0,TAU);c.stroke();}
    else if(f2.k==='cone'){c.fillStyle=f2.col;c.globalAlpha*=.45;c.beginPath();c.moveTo(f2.x,f2.y);c.arc(f2.x,f2.y,f2.r*(.4+.6*kk),f2.a-f2.w,f2.a+f2.w);c.closePath();c.fill();}
    else if(f2.k==='beam'){c.strokeStyle=f2.col;c.lineCap='round';c.lineWidth=f2.w*(1-kk*.6);c.globalAlpha*=.6;c.beginPath();c.moveTo(f2.x,f2.y);c.lineTo(f2.x+Math.cos(f2.a)*f2.r,f2.y+Math.sin(f2.a)*f2.r);c.stroke();}
    c.globalAlpha=1;}
  for(i=0;i<q.pt.length;i++){var pt=q.pt[i];c.globalAlpha=pt.t*2;c.fillStyle=pt.col;c.fillRect(pt.x-2,pt.y-2,4,4);}c.globalAlpha=1;
  for(i=0;i<q.bub.length;i++){var bu=q.bub[i],im=bubImg(bu.i);wT();c.globalAlpha=Math.min(1,bu.t*3);c.drawImage(im,bu.e.x-10,bu.e.y-bu.e.r*2.6-24,im.width/2,im.height/2);c.globalAlpha=1;}
  c.setTransform(1,0,0,1,0,0);if(q.hurt>0&&!CALM()){c.strokeStyle='rgba(255,40,40,'+(q.hurt*1.6)+')';c.lineWidth=18*VW.dpr;c.strokeRect(0,0,cv.width,cv.height);}}
/* ---------- экран: холст + HUD (DOM, обновляется 5 раз в секунду) ---------- */
var hudT=0,EL={};
function css(){if($('nchCss'))return;var s=document.createElement('style');s.id='nchCss';s.textContent=
  '#nchScr{position:fixed;left:0;top:0;right:0;bottom:0;z-index:26;background:#141830;touch-action:none;-webkit-user-select:none;user-select:none}#nchScr canvas{position:absolute;left:0;top:0;width:100%;height:100%}'+
  '#nchTop{position:absolute;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);display:flex;gap:8px;align-items:center;color:#fff;font:700 14px/1.2 sans-serif;text-shadow:0 1px 2px #000;pointer-events:none}'+
  '#nchHp{flex:1;height:16px;background:rgba(0,0,0,.55);border:2px solid #f0e2b8;border-radius:9px;overflow:hidden}#nchHp i{display:block;height:100%;background:#d8313d;transform-origin:0 50%}'+
  '#nchP{pointer-events:auto;width:44px;height:44px;border-radius:50%;border:2px solid #f0e2b8;background:rgba(40,24,10,.7);color:#fff;font-size:18px}'+
  '#nchBan{position:absolute;left:0;right:0;top:30%;text-align:center;color:#ffe08a;font:800 22px/1.2 sans-serif;text-shadow:0 2px 4px #000;pointer-events:none;padding:0 16px}#nchBan small{display:block;font-size:14px;color:#fff}'+
  '.nchS{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 30px);width:64px;height:64px;border-radius:50%;border:3px solid #f0e2b8;background:rgba(60,30,10,.78);color:#fff;font-size:28px;overflow:visible;padding:0}'+
  '.nchS i{position:absolute;left:0;right:0;bottom:0;height:100%;border-radius:50%;background:rgba(0,0,0,.6);transform-origin:50% 100%}.nchS b{position:absolute;left:-14px;right:-14px;bottom:-17px;font:700 11px/1.1 sans-serif;text-align:center;white-space:nowrap;text-shadow:0 1px 2px #000,0 0 3px #000}.nchS span{position:relative}';
  document.head.appendChild(s);}
function mount(){css();box=document.createElement('div');box.id='nchScr';
  var s1=Q.v.s[0],s2=Q.v.s[1];
  box.innerHTML='<canvas></canvas><div id="nchTop"><span id="nchT">🌙 3:00</span><div id="nchHp"><i></i></div><span id="nchSc">😱 0</span><button id="nchP" aria-label="pause">⏸</button></div><div id="nchBan"></div>'+
    '<button class="nchS" id="nchS1" style="right:94px"><span>'+s1.ic+'</span><i></i><b>'+L(s1.n[0],s1.n[1])+'</b></button><button class="nchS" id="nchS2" style="right:18px"><span>'+s2.ic+'</span><i></i><b>'+L(s2.n[0],s2.n[1])+'</b></button>';
  document.body.appendChild(box);cv=box.querySelector('canvas');cx=cv.getContext('2d');
  EL={t:$('nchT'),hp:box.querySelector('#nchHp i'),sc:$('nchSc'),ban:$('nchBan'),c1:box.querySelector('#nchS1 i'),c2:box.querySelector('#nchS2 i')};
  $('nchS1').addEventListener('pointerdown',function(e){e.stopPropagation();skill(1);});$('nchS2').addEventListener('pointerdown',function(e){e.stopPropagation();skill(2);});
  $('nchP').addEventListener('pointerdown',function(e){e.stopPropagation();pause();});
  cv.addEventListener('pointerdown',function(e){PT.on=1;PT.ox=PT.px=e.clientX;PT.oy=PT.py=e.clientY;try{cv.setPointerCapture(e.pointerId);}catch(x){}});
  cv.addEventListener('pointermove',function(e){if(PT.on){PT.px=e.clientX;PT.py=e.clientY;}});
  var up=function(){PT.on=0;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  window.addEventListener('keydown',kd,true);window.addEventListener('keyup',ku,true);window.addEventListener('resize',fit);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',vis);
  fit();}
function unmount(){cancelAnimationFrame(raf);raf=0;window.removeEventListener('keydown',kd,true);window.removeEventListener('keyup',ku,true);window.removeEventListener('resize',fit);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',vis);
  if(box&&box.parentNode)box.parentNode.removeChild(box);box=cv=cx=null;KEYS={};PT.on=0;}
function kd(e){if(!box)return;var m=$('modal').classList.contains('on');if(m)return;KEYS[e.code]=true;
  if(e.code==='Digit1'||e.code==='KeyQ')skill(1);else if(e.code==='Digit2'||e.code==='KeyE')skill(2);else if(e.code==='Escape')pause();
  e.stopImmediatePropagation();if(/^(Arrow|Space|Enter|Digit)/.test(e.code))e.preventDefault();}
function ku(e){KEYS[e.code]=false;}
function blur(){KEYS={};PT.on=0;}
function vis(){if(document.hidden&&Q&&!Q.over&&!Q.paused)pause();}
function fit(){if(!cv)return;VW.dpr=Math.min(window.devicePixelRatio||1,2);VW.W=box.clientWidth||innerWidth;VW.H=box.clientHeight||innerHeight;cv.width=Math.round(VW.W*VW.dpr);cv.height=Math.round(VW.H*VW.dpr);
  VW.z=cl(Math.min(VW.W,VW.H)/370,.7,2.4);VW.B=VW.z*VW.dpr;VW.ww=VW.W/VW.z/2;VW.wh=VW.H/VW.z/2;var k=Math.min(VW.B,2.5);if(Math.abs(k-SPR_K)/k>.05){buildSprites(k);try{groundTiles={};}catch(x){}}}
function hud(){var q=Q,l=Math.max(0,Math.ceil(NIGHT-q.t));EL.t.textContent=(l>40?'🌙 ':'🐓 ')+Math.floor(l/60)+':'+String(l%60).padStart(2,'0');EL.hp.style.transform='scaleX('+cl(q.hp/q.hpM,0,1)+')';
  EL.sc.textContent='😱 '+q.sc+(q.zl?' · 😈'+q.zl:'');EL.c1.style.transform='scaleY('+cl(q.cd[1]/q.v.s[0].cd,0,1)+')';EL.c2.style.transform='scaleY('+cl(q.cd[2]/q.v.s[1].cd,0,1)+')';
  EL.ban.innerHTML=q.banner?q.banner.t+(q.banner.s?'<small>'+q.banner.s+'</small>':''):'';}
function loop(t){raf=0;if(!Q||!box)return;var dt=Math.min(.05,(t-last)/1000||0);last=t;if(!Q.paused&&!Q.over){step(dt);}if(!box)return;draw();hudT-=dt;if(hudT<=0||Q.over){hudT=.2;hud();}
  if(!Q.over)raf=requestAnimationFrame(loop);}
/* ---------- начало, пауза, конец ---------- */
N.play=function(id){if(typeof G!=="undefined"&&G)return;if(!V[id]||N.list().indexOf(id)<0)id=N.list()[0];if(Q&&box)unmount();Q=newQ(id);var o=sv();o.l=id;
  mount();CAM.x=CAM.y=0;
  musicPlay('boss');BB2.stat('nech',{a:'go',b:id,n:(o.n|0)+1});ban(L(Q.v.n[0]+': «'+Q.v.hi[0]+'»',Q.v.n[1]+': “'+Q.v.hi[1]+'”'),L('продержись до первых петухов','last until the roosters crow'));
  last=performance.now();raf=requestAnimationFrame(loop);};
function pause(){var q=Q;if(!q||q.over||q.paused)return;q.paused=1;KEYS={};PT.on=0;
  showModal('<h3>'+L('🌙 Привал нечисти','🌙 Fiends’ break')+'</h3><p class="sub">'+L('Богатыри тоже присели — переобуваются.','The heroes sat down too — changing boots.')+'</p>'+
    '<div class="btns"><button class="btn big" id="nchCont">'+L('Дальше пугать','Keep scaring')+'</button><button class="btn ghost" id="nchQuit">'+L('Сдаться до рассвета','Give up before dawn')+'</button></div>','nechPause');
  on('nchCont',function(){hideModal();q.paused=0;last=performance.now();if(!raf)raf=requestAnimationFrame(loop);});
  on('nchQuit',function(){hideModal();q.paused=0;BB2.stat('nech',{a:'quit',b:q.b,t:Math.round(q.t),sc:q.sc});end(0,1);});}
function end(win,quit){var q=Q;if(q.over)return;q.over=win?2:1;if(q.sim)return;
  var o=sv(),id=q.b,rec=q.sc>((o.b&&o.b[id])|0),med=medal(q.sc),g=0,why='';
  if(!o.b)o.b={};if(rec)o.b[id]=q.sc;o.n=(o.n|0)+1;
  var w=wk();if(o.w!==w){o.w=w;delete o.wb;}var wrec=id===featured()&&q.sc>(o.wb|0);if(wrec)o.wb=q.sc;
  if(o.d!==today()){o.d=today();o.g=0;}
  if(q.sc>=10&&(o.g|0)<BB2.n('nech.perDay',3)){g=goldAmt();o.g=(o.g|0)+1;S.gold+=g;try{ern('nech',g);}catch(x){}try{setGold();}catch(x){}}
  else why=q.sc<10?L('Посрами хотя бы 10 — и будет золото.','Shame at least 10 to earn gold.'):L('Золото за ночи сегодня уже взято — завтра снова.','Today’s gold is taken — more tomorrow.');
  save();BB2.stat('nech',{a:'end',b:id,sc:q.sc,w:win?1:0,t:Math.round(q.t),m:med,g:g,r:rec?1:0,zl:q.zl});
  try{BB2.ev('nech',{b:id,sc:q.sc,win:win?1:0,rec:rec?1:0,t:q.t});}catch(x){}
  try{if(typeof BB2.pdv==='function'){BB2.pdv('nech');BB2.pdv('nech.sc',q.sc,1);}}catch(x){}
  if(rec&&win)try{BB2.ev('kuplet',{c:'nech',src:'nech',t:L('Ночью '+L(q.v.n[0],q.v.n[1])+' был — богатырей '+q.sc+' к маме прогнал!','At night I was '+q.v.n[1]+' — and sent '+q.sc+' heroes home to mum!')});}catch(x){}
  musicPlay('menu');if(win)SND.win();else SND.lose();
  /* кого больше всех посрамили — для смешной строки */
  var top=null,tn=0,k;for(k in q.shamed)if(q.shamed[k]>tn){tn=q.shamed[k];top=k;}
  var lines=[];if(top)lines.push(L(HN[top][0]+' убегал'+(top==='vas'||top==='mar'?'а':'')+' '+tn+' '+(tn%10>=2&&tn%10<=4&&(tn%100<10||tn%100>=20)?'раза':'раз')+' — и каждый раз с новой отговоркой.',HN[top][1]+' ran away '+tn+' times — a new excuse every time.'));
  if(q.ily)lines.push(L('Илья Муромец опять лёг на печь. Ещё лет на тридцать.','Ilya Muromets lay back on his stove. For another thirty years.'));
  else if(win)lines.push(L('Пропели петухи — нечисть по домам. До следующей ночи!','The roosters crowed — fiends go home. Until next night!'));
  else lines.push(L('Богатыри одолели… как обычно. Но ночь была весёлая!','The heroes won… as usual. But what a night!'));
  var h='<h3>'+(win?L('🐓 Рассвет!','🐓 Dawn!'):L('🌙 Ночь окончена','🌙 The night is over'))+'</h3>'+
    '<div style="text-align:center;margin:6px 0"><img src="'+iconURL(id,96)+'" width="56" height="56" alt=""><div style="font:800 34px/1.1 sans-serif;color:#ffd84a">'+q.sc+' '+MED[med]+'</div>'+
    '<div class="sub">'+L('посрамлено богатырей','heroes shamed')+(win?L(' (+25 за рассвет)',' (+25 for dawn)'):'')+'</div>'+
    (rec?'<div style="color:#7ae67a;font-weight:800">'+L('Новый рекорд злодея!','New villain record!')+'</div>':'<div class="sub">'+L('рекорд ','best ')+(o.b[id]|0)+'</div>')+
    (wrec?'<div style="color:#ffd84a">⭐ '+L('рекорд недели!','record of the week!')+'</div>':'')+'</div>'+
    '<div class="card" style="font-size:13px;line-height:1.45;text-align:left">'+lines.join('<br>')+'<br>'+(g?'💰 +'+fmtNum(g)+L(' золота',' gold'):'<span style="opacity:.8">'+why+'</span>')+
    (med<3?'<br><span style="opacity:.8">'+L('до медали ','next medal at ')+MD[med]+'</span>':'')+'</div>'+
    '<div class="btns"><button class="btn big" id="nchAg">'+L('↻ Ещё ночь','↻ Another night')+'</button><div style="display:flex;gap:6px"><button class="btn" style="flex:1" id="nchOt">'+L('Другой злодей','Other villain')+'</button><button class="btn ghost" style="flex:1" id="nchEnd">'+L('Хватит','Enough')+'</button></div></div>';
  setTimeout(function(){if(Q!==q)return;showModal(h,'nechRes');
    on('nchAg',function(){hideModal();N.play(id);});on('nchOt',function(){hideModal();unmount();Q=null;N.open('again');});on('nchEnd',function(){hideModal();unmount();Q=null;});},quit?0:700);}
N.st=function(){return Q?{b:Q.b,t:Q.t,sc:Q.sc,hp:Q.hp,n:Q.en.length,zl:Q.zl,over:Q.over}:null;};
N.dbg=function(o){if(Q)for(var k in o)Q[k]=o[k];};
N.close=function(){if(Q&&!Q.over)end(0,1);};
})();
