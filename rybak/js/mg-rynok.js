/* RB:MGD — мини-игра №8 «Рыбный рынок по выходным» (00-plan §5, 09-minigames №8).
   Перекупщик Жора берёт у тебя три ведра рыбы. Он называет цену — ты «Больше!» или «По рукам!».
   У Жоры есть потолок; у потолка он говорит «Последнее слово!» — но иногда хитрит (блефует).
   Подсказка для внимательных: блефуя, он чешет затылок и косится в сторону; всерьёз — скрещивает руки.
   Передавишь всерьёз — уйдёт к соседнему прилавку, ведро заберёт другой покупатель за 90 % цены
   (или по ролику «Позвать второго покупателя» — тётя Валя, 110 %). Спокойный режим: Жора не уходит и не блефует.
   Экономика: монеты не считает сама — ступень 0..3 по наценке (≥1 % / ≥8 % / ≥16 %), награда — до 0,3 Р (RYN_C, поправка к MG_RW.rynok)
   (дневной потолок 1 Р). Цены на прилавке — «показательные», в долях Р (≈ одна рыбалка за три ведра).
   kind 'delo' — по выходным «Делом дня» (таблица DELO оболочки) + тренировка. Сохранение: S.mg.rynok = {n: ярмарок, best: лучшая наценка %}. */
(function(){
'use strict';
var A=window.MGDA,Lx=A.L;
function st(){try{if(!S.mg||typeof S.mg!=='object')S.mg={};var m=S.mg.rynok;if(!m||typeof m!=='object')m=S.mg.rynok={};if(typeof m.n!=='number')m.n=0;if(typeof m.best!=='number')m.best=0;return m;}catch(e){return {n:0,best:0};}}
function lots(o){var R=A.rng((o.seed||1)*17+11),pi=0;try{pi=topPlace();}catch(e){}var ids=[];
  try{for(var i=0;i<=pi;i++)PLACES[i].fish.forEach(function(id){var f=FISH[id];if(f&&!f.leg&&ids.indexOf(id)<0)ids.push(id);});}catch(e){}
  if(!ids.length)ids=['karas','okun','plotva','lesh'];
  var Rv=o.R||30,out=[];for(var k=0;k<3;k++){var n=2+Math.floor(R()*3),fish=[];for(var j=0;j<n;j++)fish.push(ids[Math.floor(R()*ids.length)]);
    var B=Math.max(6,Math.round(Rv*(.28+R()*.1)));var M=B*(1.08+R()*.26),step=Math.max(1,Math.round(B*(.05+R()*.03)));
    out.push({fish:fish,B:B,M:M,step:step,start:Math.round(B*(.82+R()*.06)),bluff:[R()<.45,R()<.45,R()<.45]});}
  return out;}
/* решение 08.10: рынок — до +30 % (0,3 Р) по ступеням [0,.1,.2,.3]; пока MG_RW.rynok в оболочке другой — поправка через extra.c (станет 0, когда MG0 выставит так же) */
var RYN_C=[0,.1,.2,.3];function cFix(t){var tb=window.MG_RW&&MG_RW.rynok&&MG_RW.rynok.c||[0,0,0,0];return Math.round((RYN_C[t]-(tb[t]||0))*1000)/1000;}
function tierOf(pct){return pct>=.16?3:pct>=.08?2:pct>=.01?1:0;}
/* политика торга (для авто-игрока): ask(lot,offer,warned,bluffSign) → true = «Больше!» */
function haggle(lot,calm,ask){var offer=lot.start,warned=0,w=0;for(var g=0;g<40;g++){var bl=!calm&&warned>0&&lot.bluff[Math.min(2,warned-1)];
  if(!ask(lot,offer,warned,bl))return {price:offer,left:false};
  var nx=offer+lot.step;if(nx<=lot.M){offer=nx;continue;}
  if(warned===0||bl&&warned<3){if(warned>0&&bl){offer=nx;lot.M=Math.max(lot.M,nx+lot.step*.5);}warned++;continue;}
  if(calm){warned++;if(warned>4)return {price:offer,left:false};continue;}
  return {price:Math.round(lot.B*.9),left:true};}
  return {price:offer,left:false};}
var SAY={hi:[Lx('Здорово, рыбак! Что привёз? Давай ведро — не обижу… почти.','Hi, fisher! Let’s see the bucket.')],
  offer:[Lx('Даю {p}. Красная цена!','I’ll give {p}. Fair price!'),Lx('{p} — и ни копейкой больше… ну почти.','{p} — not a coin more… almost.'),Lx('Смотри какая рыбка… {p}, по рукам?','{p}, deal?')],
  up:[Lx('Ох, жмёшь… Ладно, {p}!','Tough one… OK, {p}!'),Lx('Себе в убыток! {p}.','At a loss! {p}.'),Lx('Ну ты и торгуешься… {p}.','You drive a hard bargain… {p}.'),Lx('Эх, для тебя — {p}.','For you — {p}.')],
  last:[Lx('Всё! {p} — последнее слово!','That’s it! {p} — final offer!'),Lx('Больше не дам! {p}, и точка.','No more! {p}, period.')],
  bluff:[Lx('Ладно-ладно, раскусил… {p}!','OK, you got me… {p}!'),Lx('Эх, хитёр! Держи {p}.','Clever! {p} then.')],
  gone:[Lx('Ну и торгуйся сам с собой! Пойду к Зинке за капустой.','Haggle with yourself then! I’m off.')],
  deal:[Lx('По рукам! Хорошая рыба.','Deal! Good fish.'),Lx('Уговорились! Заворачивай.','Deal! Wrap it up.')],
  valya:[Lx('Ой, какая рыбка! Беру не торгуясь — {p}!','What fish! I’ll take it — {p}!')],
  other:[Lx('Ведро взял сосед по ряду — за {p}.','A neighbour took the bucket for {p}.')],
  back:[Lx('Ладно, вернулся я… Кто старое помянет! Что там у тебя ещё?','OK, I’m back… What else have you got?')],
  calm:[Lx('Не, больше не могу. Правда! {p}.','Really can’t. {p}.')]};
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function f(s,p){return s.replace('{p}',p+' 💰');}
var CSS='.mgr-chip{position:absolute;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 70px);display:flex;padding:6px 14px;border-radius:16px;background:var(--pn,rgba(16,26,36,.42));-webkit-backdrop-filter:var(--blur,blur(18px));backdrop-filter:var(--blur,blur(18px));border:1px solid var(--pnB,rgba(255,255,255,.2));font-size:18px;font-weight:600;white-space:nowrap;pointer-events:none;text-shadow:var(--txSh)}'+
'.mgr-chip i{display:inline-block;width:12px;height:12px;border-radius:50%;margin:5px 4px 0;background:rgba(255,255,255,.25)}.mgr-chip i.on{background:#ffd27a}.mgr-chip i.ok{background:#6be3b0}.mgr-chip i.bad{background:#ff9a8b}.mgr-chip span{margin-right:8px}'+
'@media (max-width:640px){.mgr-chip{top:calc(env(safe-area-inset-top,0px) + 118px)}}';
function css(){if(document.getElementById('mgr-css'))return;var s=document.createElement('style');s.id='mgr-css';s.textContent=CSS;document.head.appendChild(s);}

function run(host,o){var LT=lots(o),calmM=!!o.calm;
  if(o.bot){var pol={bad:function(){return false;},mid:function(l,of,w){return w===0&&of<l.B*1.08;},good:function(l,of,w,bl){return w===0||bl;}}[o.bot]||function(){return false;};
    var sum=0,base=0;LT.forEach(function(l){var r=haggle(l,calmM,pol);sum+=r.price;base+=l.B;});var pct=sum/base-1,tq=tierOf(pct);host.done({score:Math.max(0,Math.round(pct*100)),tier:tq,extra:{c:cFix(tq)}});return;}
  css();var Sx=A.stage(host,o),g=Sx.g,m=st(),lay={},bg=null;
  var li=0,lot=null,offer=0,warned=0,bluffNow=false,busy=false,sold=[],adUsed=false,ended=false;
  var zh={x:0,mood:'smile',pose:'rest',talk:0,red:.2,away:0,who:'zhora',lx:0},tagK=0,bucketK=0;
  function layout(){var W=Sx.W,H=Sx.H,wide=W>H*1.1;lay.wide=wide;lay.cy=wide?H*.62:H*.6;lay.s=wide?Math.min(H*.38,W*.26):Math.min(H*.27,W*.55);lay.ay=wide?H*.03:H*.04;}
  Sx.resize=function(){bg=null;layout();};layout();
  function bake(){var c=document.createElement('canvas'),d=Sx.d;c.width=Math.round(Sx.W*d);c.height=Math.round(Sx.H*d);var q=c.getContext('2d');q.scale(d,d);var W=Sx.W,H=Sx.H;
    A.market(q,W,H);var cw=Math.min(W*.2,lay.s*.5);A.crate(q,W*.02,lay.cy-cw*.9,cw,cw*.8,'a');A.crate(q,W-cw*1.05,lay.cy-cw*.9,cw,cw*.8,'c');if(lay.wide){A.crate(q,W*.02+cw*1.1,lay.cy-cw*.75,cw*.9,cw*.7,'o');}
    bg=c;}
  var top=Sx.el('div','mgd-top');Sx.el('div','mgd-ttl',Lx('Рыбный рынок','Fish market'),top);
  var chip=Sx.el('div','mgr-chip');function upChip(){var h='<span>'+Lx('Ведро','Bucket')+' '+Math.min(3,li+1)+' '+Lx('из','of')+' 3</span>';for(var i=0;i<3;i++){var s=sold[i];h+='<i class="'+(s?(s.p>=s.B?'ok':'bad'):i===li?'on':'')+'"></i>';}chip.innerHTML=h;}
  var bar=Sx.el('div','mgd-bar'),row=Sx.el('div','mgd-row',null,bar);
  var bMore=Sx.btn('',Lx('Больше!','More!'),function(){more();},row,'1'),bDeal=Sx.btn('ok',Lx('По рукам!','Deal!'),function(){deal();},row,'2');
  // RB:MGPC клавиши: 1/2 — кнопки по порядку (торг или «второй покупатель»/«отдать соседу»), ←/→ и Enter; пробел — тоже нажать выбранную
  Sx.nav(function(){return [bMore,bDeal,bAd,bOther];},{first:true,keep:true});host.amb('market','day');
  Sx.kbd(Lx('Щёлкай по кнопкам. Клавиши: '+Sx.kc('1')+' — «Больше!», '+Sx.kc('2')+' — «По рукам!» (или '+Sx.kc('←')+Sx.kc('→')+' и '+Sx.kc('Enter')+')',
    'Click the buttons. Keys: '+Sx.kc('1')+' — “More!”, '+Sx.kc('2')+' — “Deal!” (or '+Sx.kc('←')+Sx.kc('→')+' and '+Sx.kc('Enter')+')'),8,104);
  var bAd=null;
  function btns(on){bMore.disabled=!on;bDeal.disabled=!on;}
  function speak(t,who){zh.talk=MGDA.talkT(t);var nm=who==='valya'?Lx('Тётя Валя','Aunt Valya'):Lx('Жора','Zhora');Sx.speak(nm,t,Sx.W/2+lay.s*.05,lay.cy-lay.s*1.02);}
  function newLot(){lot=LT[li];offer=lot.start;warned=0;bluffNow=false;zh.mood='smile';zh.pose='rest';zh.red=.2;zh.lx=0;bucketK=0;tagK=0;upChip();
    Sx.later(function(){speak(f(pick(SAY.offer),offer));btns(true);},Sx.calm?50:700);}
  function more(){if(busy)return;var nx=offer+lot.step;tagK=0;
    if(nx<=lot.M){offer=nx;zh.red=Math.min(.9,.2+.7*(offer-lot.start)/Math.max(1,lot.M-lot.start));zh.mood=zh.red>.55?'sad':'think';zh.pose=zh.red>.55?'scratch':'rest';zh.lx=0;speak(f(pick(SAY.up),offer));A.snd('coin');return;}
    if(warned===0){warned=1;bluffNow=!calmM&&lot.bluff[0];tell();speak(f(pick(SAY.last),offer));A.snd('no');return;}
    if(bluffNow&&warned<3){offer=nx;lot.M=Math.max(lot.M,nx+lot.step*.5);warned++;bluffNow=!calmM&&lot.bluff[Math.min(2,warned-1)];zh.mood='laugh';zh.pose='rest';speak(f(pick(SAY.bluff),offer));A.snd('coin');
      Sx.later(function(){if(!busy){tell();}},1400);return;}
    if(calmM){speak(f(pick(SAY.calm),offer));return;}
    leave();}
  /* «выдаёт себя»: блеф — чешет затылок и косится; всерьёз — руки скрещены, смотрит прямо */
  function tell(){zh.mood=bluffNow?'sly':'think';zh.pose=bluffNow?'scratch':'cross';zh.lx=bluffNow?1.6:0;zh.red=bluffNow?.55:.85;}
  function deal(){if(busy)return;busy=true;btns(false);zh.mood='laugh';zh.pose='shake';speak(pick(SAY.deal));A.snd('buy');sellAt(offer,true);}
  function sellAt(p,good){sold[li]={p:p,B:lot.B};upChip();bucketK=0.001;var pct=p/lot.B-1;
    Sx.fx.push({k:'txt',s:'+'+p,coin:1,x:Sx.W*.32,y:lay.cy-lay.s*.4,t:0,life:1.6,px:30,c:pct>=0?'#ffd27a':'#ffb3a3'});A.coins(Sx,Sx.W*.32,lay.cy-lay.s*.2,Sx.W-40,40,good?6:3);
    Sx.later(function(){li++;if(li>=3){end();return;}zh.who='zhora';zh.away=0;busy=false;newLot();},Sx.calm?600:1700);}
  function leave(){busy=true;btns(false);zh.mood='sad';zh.pose='wave';speak(pick(SAY.gone));A.snd('lose');
    Sx.later(function(){zh.away=1;Sx.hush();
      if(!adUsed&&host.adOk&&host.adOk()&&!o.train){row.style.display='none';bAd=Sx.btn('ad',A.icon('ad')+Lx('Позвать второго покупателя','Call another buyer')+Sx.kc('1'),function(b){b.disabled=true;host.ad('buyer').then(function(ok){if(b.parentNode)b.parentNode.removeChild(b);bAd=null;if(bOther&&bOther.parentNode)bOther.parentNode.removeChild(bOther);row.style.display='';
          if(ok){adUsed=true;zh.who='valya';zh.away=-1;zh.mood='smile';zh.pose='rest';var p=Math.round(lot.B*1.1);Sx.later(function(){speak(f(pick(SAY.valya),p),'valya');Sx.later(function(){sellAt(p,true);Sx.later(function(){if(li<3){zh.who='zhora';zh.away=-1;speak(pick(SAY.back));}},Sx.calm?650:1750);},1400);},500);}
          else other();});},bar);
        bOther=Sx.btn('',Lx('Отдать соседу','Sell to neighbour')+Sx.kc('2'),function(){if(bAd&&bAd.parentNode)bAd.parentNode.removeChild(bAd);bAd=null;if(bOther.parentNode)bOther.parentNode.removeChild(bOther);other();},bar);bOther.style.marginTop='10px';bOther.style.maxWidth='560px';bOther.style.width='100%';}
      else other();},Sx.calm?300:1500);}
  var bOther=null;
  function other(){row.style.display='';if(bOther&&bOther.parentNode)bOther.parentNode.removeChild(bOther);var p=Math.round(lot.B*.9);Sx.speak('',f(pick(SAY.other),p),Sx.W/2,lay.cy-lay.s*.6);sellAt(p,false);
    Sx.later(function(){if(li<3){zh.who='zhora';zh.away=-1;zh.mood='smile';speak(pick(SAY.back));}},Sx.calm?650:1750);}
  function end(){if(ended)return;ended=true;var sum=0,base=0;sold.forEach(function(s){sum+=s.p;base+=s.B;});var pct=sum/base-1,tier=tierOf(pct),sc=Math.max(0,Math.round(pct*100));
    if(!o.train){m.n++;m.best=Math.max(m.best,sc);}
    zh.mood=tier>=2?'wow':'smile';zh.pose='wave';speak(tier>=2?Lx('Ну ты купец! Приезжай в субботу ещё.','Quite the merchant! Come again.'):Lx('Приезжай в субботу — ещё поторгуемся!','Come back on Saturday!'));
    Sx.later(function(){Sx.hush();host.done({score:sc,tier:tier,title:[Lx('Продал как есть','Sold as is'),Lx('Неплохо поторговался','Not bad'),Lx('Хороший торг!','Good bargaining!'),Lx('Купец!','A true merchant!')][tier],
      scoreTxt:Lx('Наценка','Markup')+': <b>'+(pct>=0?'+':'')+Math.round(pct*100)+' %</b> · '+sum+' 💰 '+Lx('за три ведра','for three buckets'),
      extra:{c:cFix(tier),line:Lx('Подсказка: блефуя, Жора чешет затылок.','Tip: when bluffing, Zhora scratches his head.')}});},Sx.calm?900:2600);}
  // кадр
  Sx.frame=function(dt,t){var W=Sx.W,H=Sx.H;if(!bg)bake();g.drawImage(bg,0,0,W,H);if(zh.talk>0)zh.talk-=dt;tagK=Math.min(1,tagK+dt*3);
    // уход/приход продавца
    if(zh.away>0&&zh.x<1.4)zh.x+=dt*1.6;if(zh.away<0){if(zh.x>0||zh.x<-.01){zh.x=zh.x>0.5?-1.2:zh.x;}zh.x=Math.min(0,zh.x+dt*1.8);if(zh.x>=0){zh.x=0;zh.away=0;}}
    var px=W/2+zh.x*W*.8;A.stall(g,W,H,lay.cy,lay.ay,'#d9483b','#f6efe2');
    var fn=zh.who==='valya'?A.valya:A.zhora,po={mood:zh.mood,talk:zh.talk>0,pose:zh.pose,lx:zh.lx,red:zh.red,noArms:true};
    if(Math.abs(zh.x)<1.3){fn(g,px,lay.cy,lay.s,t,po);}
    A.counter(g,W,H,lay.cy);
    if(Math.abs(zh.x)<1.3){po.noArms=false;po.armsOnly=true;fn(g,px,lay.cy,lay.s,t,po);}
    // ведро и ценник
    if(lot){var bs=lay.s*.55,bx=W/2-lay.s*.62,by=lay.cy+lay.s*.12;if(bucketK>0){bucketK=Math.min(1,bucketK+dt*1.4);bx+=bucketK*lay.s*.6;by-=Math.sin(bucketK*Math.PI)*lay.s*.2;}
      if(bucketK<1){g.save();g.globalAlpha=1-bucketK*bucketK;A.bucket(g,bx,by,bs,lot.fish,t);g.restore();}
      var tw=Math.max(110,lay.s*.5),th=tw*.5;if(!busy||bucketK===0){var k=A.back(tagK);A.tag(g,W/2+lay.s*.55,lay.cy+lay.s*.02,tw*k,th*k,offer,-.06,warned?'#ffe3d6':'#fff6dc');}
      A.txt(g,Lx('цена на рынке ','market price ')+lot.B,W/2+lay.s*.55,lay.cy+lay.s*.02+tw*.25+16,15,'rgba(255,240,210,.9)','center','rgba(40,20,0,.6)');}
    if(lay.wide)A.scales(g,W*.78,lay.cy+lay.s*.05,lay.s*.35,Math.sin(t*1.5)*.05);
    // меловая доска на прилавке
    var bw=Math.min(W*.7,360),bh=bw*.36,bxx=W/2-bw/2,byy=lay.cy+(H-lay.cy)*(lay.wide?.3:.36);if(byy+bh<H-90){g.fillStyle='#6b4a2a';A.rr(g,bxx-6,byy-6,bw+12,bh+12,10);g.fill();g.fillStyle='#2f3b36';A.rr(g,bxx,byy,bw,bh,6);g.fill();
      A.txt(g,Lx('Свежая рыба','Fresh fish'),W/2,byy+bh*.36,Math.round(bh*.28),'rgba(240,240,230,.92)','center',null,600);g.strokeStyle='rgba(240,240,230,.7)';g.lineWidth=2;var fy=byy+bh*.72;
      var fx0=W/2-bw*.28;g.beginPath();g.ellipse(fx0,fy,bw*.07,bh*.1,0,0,Math.PI*2);g.moveTo(fx0+bw*.07,fy);g.lineTo(fx0+bw*.12,fy-bh*.09);g.lineTo(fx0+bw*.12,fy+bh*.09);g.closePath();g.stroke();
      A.txt(g,Lx('с утра','this morning'),W/2+bw*.1,fy,Math.round(bh*.17),'rgba(255,220,150,.85)','center',null,400);}};
  upChip();Sx.later(function(){speak(pick(SAY.hi));Sx.later(newLot,Sx.calm?300:1600);},Sx.calm?50:400);btns(false);
  run.stopFn=function(){Sx.stop();};}
MG_REG({id:'rynok',n:{ru:'Рыбный рынок',en:'Fish market'},icon:'bag',kind:'delo',run:run,stop:function(){if(run.stopFn)run.stopFn();},_t:{lots:lots,haggle:haggle,tierOf:tierOf}});
})();
