/* МЕТА: КОТ ВАСЬКА РАСТЁТ (поток META, 08.10.2026). Журнал: rybak-boost/logs/META.md
   - Васька толстеет: от мелочи, что ему отдают после рыбалок (старый счётчик S.cat), и от угощений в его окне (до 3 в день, за мелочь из улова — монеты).
     Стадии: Худенький → Справный → Упитанный → Толстячок → Барин (видно и в сцене рыбалки: бока шире).
   - Вещи за монеты: ошейник, колокольчик, лежанка (лежанка и ошейник видны на берегу).
   - Костюмы — коллекция (12): за монеты, за угощения, за стадию, по сезону, за золотую лигу, и «подарки Васьки» по порядку (не наугад; лутбоксов нет).
   - Раз в день Васька может принести находку (шанс растёт с навыком Науки «Удача на находки»): наживка или монеты, каждая 3-я — костюм из списка подарков.
   - После своей рыбалки (не турнир) — иногда «Васька нашёл у воды» (плашка в итогах, забрать кнопкой — вне рыбалки; не чаще раза в день).
   Рисунок — свой, на холсте: Васька анфас в полном качестве (окно), со спины — поверх сцены рыбалки (обёртка a1Cat: бока, лежанка, ошейник, костюм). META.cat.draw(g,x,y,s,o) — для других потоков.
   Сохранение: S.catN (угощений всего), S.catT {день: угощений}, S.catK {вещь|костюм: 1}, S.catC (надето), S.catG {n: подарков всего, d: день подарка, s: день находки у воды}, S.catD (день, когда подарок уже решён/забран). */
(function(){
'use strict';
var M=META;
var STAGES=[[0,'Худенький','Skinny'],[4.8,'Справный','Fit'],[6,'Упитанный','Well-fed'],[7.5,'Толстячок','Chubby'],[9.5,'Барин','Lord of the porch']];
var TREAT_DAY=3;
// вещи: k — 'item' (ошейник и т. п.) | 'cos' (костюм); how: buy (p), treats (n), stage (n), season ([ММ-ДД, ММ-ДД]), gift (порядок), league
var ITEMS=[
 {id:'collar',k:'item',n:'Ошейник',en:'Collar',how:'buy',p:300},
 {id:'bell',k:'item',n:'Колокольчик на ошейник',en:'Collar bell',how:'buy',p:700,need:'collar'},
 {id:'bed',k:'item',n:'Лежанка',en:'Cat bed',how:'buy',p:1500},
 {id:'bant',k:'cos',n:'Бантик',en:'Bow',how:'treats',v:3},
 {id:'sharf',k:'cos',n:'Вязаный шарф',en:'Knitted scarf',how:'treats',v:15,d:'Баба Нюра связала — за то, что Васька такой справный',de:'Granny Nyura knitted it'},
 {id:'tel',k:'cos',n:'Тельняшка',en:'Sailor shirt',how:'gift',v:1},
 {id:'panama',k:'cos',n:'Рыбацкая панама',en:'Fishing hat',how:'buy',p:600},
 {id:'venok',k:'cos',n:'Венок из одуванчиков',en:'Dandelion wreath',how:'gift',v:2},
 {id:'kepka',k:'cos',n:'Кепка как у Петровича',en:'Cap like Petrovich\'s',how:'stage',v:2},
 {id:'ushanka',k:'cos',n:'Ушанка',en:'Fur hat',how:'buy',p:1200},
 {id:'tykva',k:'cos',n:'Шапка-тыква',en:'Pumpkin hat',how:'season',v:['10-15','11-15']},
 {id:'kolpak',k:'cos',n:'Новогодний колпак',en:'New Year hat',how:'season',v:['12-15','01-15']},
 {id:'zhilet',k:'cos',n:'Рыбацкий жилет',en:'Fishing vest',how:'buy',p:2500},
 {id:'kapitan',k:'cos',n:'Капитанская фуражка',en:'Captain\'s cap',how:'league'},
 {id:'korona',k:'cos',n:'Корона',en:'Crown',how:'stage',v:4,d:'для настоящего Барина',de:'for a true Lord'}];
var BY={};ITEMS.forEach(function(x){BY[x.id]=x;});
var GIFT_COS=ITEMS.filter(function(x){return x.how==='gift';}).sort(function(a,b){return a.v-b.v;});

/* ---------- сохранение ---------- */
M.fix(function(){M.fNum('catN');M.fObj('catT');M.fObj('catK');M.fObj('catG');M.fNum('catD');
  for(var k in S.catK)if(!BY[k])delete S.catK[k];if(S.catC!=null&&!(typeof S.catC==='string'&&S.catK[S.catC]&&BY[S.catC].k==='cos'))delete S.catC;
  var d=M.dn();for(var t in S.catT)if(+t<d-3)delete S.catT[t];});
M.merge(function(loc,d){M.mMax(loc,d,'catN');M.mObj(loc,d,'catT');M.mObj(loc,d,'catK');M.mObj(loc,d,'catG');M.mMax(loc,d,'catD');
  var c=typeof loc.catC==='string'?loc.catC:typeof d.catC==='string'?d.catC:null;if(c&&S.catK[c])S.catC=c;});

/* ---------- состояние ---------- */
function kg(){var r=.03*Math.min(400,S.cat||0)+.15*(S.catN||0);return 4.2+7.8*(1-Math.exp(-r/6));} // до ~12 кг
function stage(){var w=kg(),i=0;for(var k=0;k<STAGES.length;k++)if(w>=STAGES[k][0])i=k;return i;}
function fat(){return Math.max(0,Math.min(1,(kg()-4.2)/7));}
function treatC(){return Math.max(5,M.r5(M.tripC()*.06));}
function treatsToday(){return S.catT[M.dn()]||0;}
function luck(){try{return M.sci?M.sci.luck():0;}catch(e){return 0;}}
function mmdd(){var d=new Date(nowMs()),m=d.getMonth()+1,x=d.getDate();return (m<10?'0':'')+m+'-'+(x<10?'0':'')+x;}
function inSeason(v){var t=mmdd();return v[0]<=v[1]?t>=v[0]&&t<=v[1]:t>=v[0]||t<=v[1];}
// можно ли получить сейчас бесплатно (не покупка)
function earned(x){if(x.how==='treats')return (S.catN||0)>=x.v;if(x.how==='stage')return stage()>=x.v;if(x.how==='season')return inSeason(x.v);if(x.how==='league')return (S.lgL||0)>=2||(S.lgG||0)>0;return false;}
function howTxt(x){if(x.how==='buy')return coinsTxt(x.p);if(x.how==='treats')return L('угостить '+x.v+' '+pl(x.v,'раз','раза','раз','',''),'treat him '+x.v+' times')+' ('+Math.min(x.v,S.catN||0)+'/'+x.v+')';
  if(x.how==='stage')return L('когда Васька станет «'+STAGES[x.v][1]+'»','when Vaska is «'+STAGES[x.v][2]+'»');if(x.how==='season')return L('бесплатно с '+x.v[0].split('-').reverse().join('.')+' по '+x.v[1].split('-').reverse().join('.'),'free during its season');
  if(x.how==='gift')return L('Васька сам принесёт','Vaska will bring it');if(x.how==='league')return L('в честь Золотой лиги','for reaching the Gold league');return '';}
// подарок дня: решён ли и что (детерминированно по дню и числу подарков)
function giftToday(){var d=M.dn();if(S.catD>=d)return null;var R=rng(d*2654435+(S.catG.n||0)*97+11);if(R()>=.35+.05*luck())return null;
  var n=(S.catG.n||0)+1,cos=null;if(n%3===0)for(var i=0;i<GIFT_COS.length;i++)if(!S.catK[GIFT_COS[i].id]){cos=GIFT_COS[i];break;}
  if(cos)return {cos:cos};var bs=['maggot','dough','blood','corn','live'],b=bs[Math.floor(R()*bs.length)];return R()<.5?{bait:b,q:5}:{c:M.r5(M.tripC()*.15)};}
function giftTxt(g){return g.cos?L('принёс костюм: ','brought a costume: ')+L(g.cos.n,g.cos.en):g.bait?L('притащил '+g.q+' шт. наживки: ','dragged in '+g.q+' bait: ')+L(BAIT[g.bait].n,BAIT[g.bait].en).toLowerCase():L('нашёл ','found ')+coinsTxt(g.c);}
function giftTake(){var g=giftToday();if(!g)return null;var d=M.dn();S.catD=d;S.catG.n=(S.catG.n||0)+1;S.catG.d=d;
  if(g.cos)S.catK[g.cos.id]=1;else if(g.bait)S.bait[g.bait]=(S.bait[g.bait]||0)+g.q;else S.coins+=ern('quest',g.c);save();updCoins();M.stat('cat','gift',{k:g.cos?'cos':g.bait?'bait':'c'});return g;}

/* ---------- РИСУНОК: Васька анфас ---------- */
// o: {fat 0..1, cos — костюм, collar, bell, bed, t — время, blink}
function drawFront(g,x,y,s,o){o=o||{};var f=o.fat||0,t=o.t||0,col='#e08a3a',dk='#b8621f',lt='#f6d9b0',bw=1+.5*f;
  g.save();g.lineCap='round';g.lineJoin='round';
  // тень и лежанка
  if(o.bed){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y+.02*s,.52*s,.12*s,0,0,7);g.fill();
    var bg=g.createLinearGradient(0,y-.1*s,0,y+.08*s);bg.addColorStop(0,'#c0392b');bg.addColorStop(1,'#7b241c');g.fillStyle=bg;g.beginPath();g.ellipse(x,y-.01*s,.5*s,.11*s,0,0,7);g.fill();
    g.strokeStyle='rgba(255,230,160,.6)';g.lineWidth=.012*s;for(var i=-3;i<=3;i++){g.beginPath();g.moveTo(x+i*.12*s,y-.11*s);g.lineTo(x+i*.12*s+.04*s,y+.09*s);g.stroke();}
    g.fillStyle='#a93226';g.beginPath();g.ellipse(x,y-.05*s,.42*s,.07*s,0,0,7);g.fill();}
  else{g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x,y,.38*s*bw,.07*s,0,0,7);g.fill();}
  // хвост
  var tw=Math.sin(t*1.6)*.05*s;g.strokeStyle=col;g.lineWidth=.1*s;g.beginPath();g.moveTo(x+.22*s*bw,y-.08*s);g.bezierCurveTo(x+.5*s*bw,y-.02*s,x+.42*s,y+.04*s+tw,x+.12*s,y+.03*s);g.stroke();
  g.strokeStyle=dk;g.lineWidth=.03*s;for(var k=0;k<3;k++){var px=x+(.38-k*.09)*s*bw,py=y-.03*s+k*.015*s;g.beginPath();g.moveTo(px,py-.05*s);g.lineTo(px+.01*s,py+.05*s);g.stroke();}
  // тело
  var by=y-.3*s,sh=g.createRadialGradient(x-.1*s,by-.15*s,.02*s,x,by,.4*s*bw);sh.addColorStop(0,'#f4a95a');sh.addColorStop(.6,col);sh.addColorStop(1,'#c26a24');g.fillStyle=sh;g.beginPath();g.ellipse(x,by,.27*s*bw,.31*s,0,0,7);g.fill();
  if(o.cos==='tel'){g.save();g.beginPath();g.ellipse(x,by,.27*s*bw,.31*s,0,0,7);g.clip();g.fillStyle='#f4f6fa';g.fillRect(x-.3*s*bw,by-.2*s,.6*s*bw,.5*s);g.fillStyle='#1f3f8a';for(var q=0;q<7;q++)g.fillRect(x-.3*s*bw,by-.18*s+q*.07*s,.6*s*bw,.03*s);g.restore();}
  else{g.fillStyle=lt;g.beginPath();g.ellipse(x,by+.05*s,.15*s*(1+.45*f),.22*s,0,0,7);g.fill();
    g.strokeStyle=dk;g.lineWidth=.028*s;for(var j=0;j<3;j++){g.beginPath();g.arc(x-.2*s*bw,by-.08*s+j*.09*s,.07*s,-.6,.6);g.stroke();g.beginPath();g.arc(x+.2*s*bw,by-.08*s+j*.09*s,.07*s,Math.PI-.6,Math.PI+.6);g.stroke();}}
  if(o.cos==='zhilet'){g.fillStyle='#4a6a3a';g.beginPath();g.ellipse(x-.15*s*bw,by,.12*s*bw,.27*s,0,0,7);g.ellipse(x+.15*s*bw,by,.12*s*bw,.27*s,0,0,7);g.fill();
    g.fillStyle='#3a5a2c';g.fillRect(x-.22*s*bw,by+.02*s,.09*s,.07*s);g.fillRect(x+.13*s*bw,by+.02*s,.09*s,.07*s);g.strokeStyle='#c9b48a';g.lineWidth=.012*s;g.strokeRect(x-.22*s*bw,by+.02*s,.09*s,.07*s);g.strokeRect(x+.13*s*bw,by+.02*s,.09*s,.07*s);}
  // лапки
  g.fillStyle=lt;g.beginPath();g.ellipse(x-.09*s,y-.03*s,.065*s,.05*s,0,0,7);g.ellipse(x+.09*s,y-.03*s,.065*s,.05*s,0,0,7);g.fill();
  g.strokeStyle='rgba(150,90,40,.5)';g.lineWidth=.01*s;for(var p=-1;p<=1;p+=2)for(var z=-1;z<=1;z++){g.beginPath();g.moveTo(x+p*.09*s+z*.022*s,y-.06*s);g.lineTo(x+p*.09*s+z*.022*s,y-.02*s);g.stroke();}
  // голова
  var hy=y-.7*s,hr=.2*s,hs=g.createRadialGradient(x-.07*s,hy-.1*s,.02*s,x,hy,.28*s);hs.addColorStop(0,'#f6b066');hs.addColorStop(.65,col);hs.addColorStop(1,'#c26a24');g.fillStyle=hs;g.beginPath();g.ellipse(x,hy+.02*s,.24*s*(1+.18*f),.18*s,0,0,7);g.fill();g.beginPath();g.arc(x,hy-.02*s,hr,0,7);g.fill();
  // уши
  [-1,1].forEach(function(sg){g.fillStyle=col;g.beginPath();g.moveTo(x+sg*.07*s,hy-.16*s);g.lineTo(x+sg*.19*s,hy-.31*s);g.lineTo(x+sg*.2*s,hy-.08*s);g.closePath();g.fill();
    g.fillStyle='#f2a0a0';g.beginPath();g.moveTo(x+sg*.1*s,hy-.15*s);g.lineTo(x+sg*.18*s,hy-.26*s);g.lineTo(x+sg*.18*s,hy-.11*s);g.closePath();g.fill();});
  // «М» на лбу
  g.strokeStyle=dk;g.lineWidth=.022*s;g.beginPath();g.moveTo(x-.06*s,hy-.11*s);g.lineTo(x-.03*s,hy-.17*s);g.moveTo(x,hy-.1*s);g.lineTo(x,hy-.19*s);g.moveTo(x+.06*s,hy-.11*s);g.lineTo(x+.03*s,hy-.17*s);g.stroke();
  // морда
  g.fillStyle=lt;g.beginPath();g.ellipse(x-.06*s,hy+.06*s,.07*s,.055*s,0,0,7);g.ellipse(x+.06*s,hy+.06*s,.07*s,.055*s,0,0,7);g.fill();
  var bl=o.blink;[-1,1].forEach(function(sg){var ex=x+sg*.08*s,ey=hy-.02*s;if(bl){g.strokeStyle='#3a2a1a';g.lineWidth=.016*s;g.beginPath();g.arc(ex,ey-.01*s,.04*s,.3,Math.PI-.3);g.stroke();return;}
    g.fillStyle='#8fc24a';g.beginPath();g.ellipse(ex,ey,.045*s,.052*s,0,0,7);g.fill();g.fillStyle='#1f2a12';g.beginPath();g.ellipse(ex,ey,.014*s,.043*s,0,0,7);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(ex+.015*s,ey-.02*s,.011*s,0,7);g.fill();});
  g.fillStyle='#e87a8a';g.beginPath();g.moveTo(x-.025*s,hy+.03*s);g.lineTo(x+.025*s,hy+.03*s);g.lineTo(x,hy+.06*s);g.closePath();g.fill();
  g.strokeStyle='#6a3a2a';g.lineWidth=.012*s;g.beginPath();g.moveTo(x,hy+.06*s);g.quadraticCurveTo(x-.02*s,hy+.09*s,x-.045*s,hy+.08*s);g.moveTo(x,hy+.06*s);g.quadraticCurveTo(x+.02*s,hy+.09*s,x+.045*s,hy+.08*s);g.stroke();
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.008*s;[-1,1].forEach(function(sg){for(var w=0;w<3;w++){g.beginPath();g.moveTo(x+sg*.1*s,hy+.06*s+w*.015*s);g.lineTo(x+sg*.3*s,hy+.03*s+w*.035*s);g.stroke();}});
  // ошейник, колокольчик, шарф
  var ny=y-.53*s;
  if(o.cos==='sharf'){g.fillStyle='#c0392b';g.beginPath();g.ellipse(x,ny,.2*s*(1+.3*f),.05*s,0,0,7);g.fill();g.fillStyle='#f1c40f';for(var a=-3;a<=3;a++)g.fillRect(x+a*.05*s-.01*s,ny-.04*s,.02*s,.08*s);
    g.fillStyle='#c0392b';g.beginPath();g.moveTo(x+.08*s,ny);g.lineTo(x+.16*s,ny+.2*s);g.lineTo(x+.06*s,ny+.2*s);g.lineTo(x+.02*s,ny);g.fill();g.fillStyle='#f1c40f';g.fillRect(x+.07*s,ny+.12*s,.08*s,.02*s);}
  else if(o.collar){g.strokeStyle='#d23a32';g.lineWidth=.035*s;g.beginPath();g.ellipse(x,ny,.17*s*(1+.3*f),.045*s,0,.15,Math.PI-.15);g.stroke();
    if(o.bell){var sw=Math.sin(t*3)*.01*s;g.fillStyle='#f2c94c';g.beginPath();g.arc(x+sw,ny+.07*s,.035*s,0,7);g.fill();g.strokeStyle='#9a6a0a';g.lineWidth=.008*s;g.beginPath();g.moveTo(x+sw-.025*s,ny+.075*s);g.lineTo(x+sw+.025*s,ny+.075*s);g.stroke();g.fillStyle='#fff8d0';g.beginPath();g.arc(x+sw-.012*s,ny+.058*s,.008*s,0,7);g.fill();}}
  hat(g,x,hy,s,o.cos,true);
  g.restore();}
// головные уборы (front — анфас; иначе — со спины, та же форма)
function hat(g,x,hy,s,c,front){if(!c)return;var top=hy-.2*s;
  if(c==='bant'){g.fillStyle='#e0245e';g.beginPath();g.moveTo(x+.13*s,top+.02*s);g.lineTo(x+.06*s,top-.05*s);g.lineTo(x+.06*s,top+.07*s);g.closePath();g.moveTo(x+.13*s,top+.02*s);g.lineTo(x+.2*s,top-.05*s);g.lineTo(x+.2*s,top+.07*s);g.closePath();g.fill();g.fillStyle='#ff6f91';g.beginPath();g.arc(x+.13*s,top+.02*s,.025*s,0,7);g.fill();}
  else if(c==='panama'){g.fillStyle='#e8dcb8';g.beginPath();g.ellipse(x,top+.03*s,.3*s,.06*s,0,0,7);g.fill();g.beginPath();g.ellipse(x,top-.04*s,.17*s,.1*s,0,Math.PI,0);g.fill();g.fillStyle='#8a7a5a';g.fillRect(x-.17*s,top,.34*s,.025*s);}
  else if(c==='ushanka'){g.fillStyle='#6b4a2e';g.beginPath();g.ellipse(x,top-.02*s,.23*s,.13*s,0,Math.PI,0);g.fill();g.fillStyle='#8a6a48';g.fillRect(x-.24*s,top-.03*s,.48*s,.07*s);
    g.fillStyle='#6b4a2e';g.beginPath();g.ellipse(x-.22*s,top+.1*s,.05*s,.1*s,0,0,7);g.ellipse(x+.22*s,top+.1*s,.05*s,.1*s,0,0,7);g.fill();g.fillStyle='#d23a32';if(front){g.beginPath();g.arc(x,top-.06*s,.03*s,0,7);g.fill();}}
  else if(c==='kepka'||c==='kapitan'){var cap=c==='kapitan';g.fillStyle=cap?'#f4f4f4':'#4a4d55';g.beginPath();g.ellipse(x,top,.2*s,.1*s,0,Math.PI,0);g.fill();
    g.fillStyle=cap?'#1f2f4a':'#3a3d44';g.fillRect(x-.2*s,top-.02*s,.4*s,.04*s);if(front){g.fillStyle='#1a1a1a';g.beginPath();g.ellipse(x,top+.03*s,.16*s,.035*s,0,0,Math.PI);g.fill();}
    if(cap&&front){g.fillStyle='#f2c94c';g.beginPath();g.arc(x,top-.04*s,.025*s,0,7);g.fill();}}
  else if(c==='venok'){var cl=['#f7d23e','#fff','#f7d23e','#9ad04a','#f7d23e','#fff','#f7d23e'];for(var i=0;i<7;i++){var a=Math.PI*(1.05+i*.15);g.fillStyle=cl[i];g.beginPath();g.arc(x+Math.cos(a)*.2*s,top+.06*s+Math.sin(a)*.09*s,.035*s,0,7);g.fill();}}
  else if(c==='tykva'){var tg=g.createLinearGradient(0,top-.15*s,0,top+.04*s);tg.addColorStop(0,'#ffa53a');tg.addColorStop(1,'#d9621e');g.fillStyle=tg;g.beginPath();g.ellipse(x,top-.04*s,.2*s,.11*s,0,0,7);g.fill();
    g.strokeStyle='rgba(140,60,10,.5)';g.lineWidth=.012*s;for(var r=-1;r<=1;r++){g.beginPath();g.ellipse(x+r*.07*s,top-.04*s,.06*s,.1*s,0,0,7);g.stroke();}g.fillStyle='#4a7a2a';g.fillRect(x-.012*s,top-.2*s,.024*s,.07*s);}
  else if(c==='kolpak'){g.fillStyle='#d23a32';g.beginPath();g.moveTo(x-.18*s,top+.02*s);g.quadraticCurveTo(x,top-.35*s,x+.24*s,top-.22*s);g.lineTo(x+.18*s,top+.02*s);g.closePath();g.fill();
    g.fillStyle='#fff';g.fillRect(x-.2*s,top-.01*s,.4*s,.05*s);g.beginPath();g.arc(x+.25*s,top-.22*s,.04*s,0,7);g.fill();}
  else if(c==='korona'){var cg=g.createLinearGradient(0,top-.15*s,0,top+.03*s);cg.addColorStop(0,'#fff2b0');cg.addColorStop(1,'#d4a017');g.fillStyle=cg;g.beginPath();g.moveTo(x-.15*s,top+.03*s);g.lineTo(x-.16*s,top-.1*s);g.lineTo(x-.08*s,top-.03*s);g.lineTo(x,top-.14*s);g.lineTo(x+.08*s,top-.03*s);g.lineTo(x+.16*s,top-.1*s);g.lineTo(x+.15*s,top+.03*s);g.closePath();g.fill();
    g.fillStyle='#d23a32';g.beginPath();g.arc(x,top-.01*s,.02*s,0,7);g.fill();g.fillStyle='#2f7de1';g.beginPath();g.arc(x-.09*s,top,.015*s,0,7);g.arc(x+.09*s,top,.015*s,0,7);g.fill();}}

/* ---------- сцена рыбалки: Васька со спины (обёртка a1Cat) ---------- */
var ac0=a1Cat;
a1Cat=function(g,t,cxp,cy,cs,tn,night,turn){var c=G&&G.a1?G.a1.cat:{k:'sit'},sit=!c||c.k==='sit'||c.k==='paw',f=fat(),col=tn('#e08a3a');
  try{if(S.catK.bed&&(sit||c.k==='sleep')){g.fillStyle=tn('#a93226');g.beginPath();g.ellipse(cxp+(c.k==='sleep'?-cs*.1:0),cy-cs*.02,cs*.85,cs*.2,0,0,7);g.fill();g.fillStyle=tn('#c0392b');g.beginPath();g.ellipse(cxp+(c.k==='sleep'?-cs*.1:0),cy-cs*.08,cs*.72,cs*.13,0,0,7);g.fill();}
    if(sit&&f>.05){g.fillStyle=col;g.beginPath();g.ellipse(cxp,cy-cs*.5,cs*.5*(1+.45*f),cs*.56,0,0,7);g.fill();}}catch(e){}
  ac0.apply(this,arguments);
  try{if(!sit)return;var cos=S.catC,ny=cy-cs*.93;
    if(cos==='tel'){g.save();g.beginPath();g.ellipse(cxp,cy-cs*.55,cs*.5*(1+.45*f),cs*.6,0,0,7);g.clip();g.fillStyle=tn('#f4f6fa');g.globalAlpha=.9;g.fillRect(cxp-cs,cy-cs*1.1,cs*2,cs*1.1);g.fillStyle=tn('#1f3f8a');for(var q=0;q<7;q++)g.fillRect(cxp-cs,cy-cs*1.05+q*cs*.16,cs*2,cs*.07);g.restore();}
    if(cos==='zhilet'){g.fillStyle=tn('#4a6a3a');g.beginPath();g.ellipse(cxp,cy-cs*.6,cs*.48*(1+.45*f),cs*.42,0,0,7);g.fill();g.strokeStyle=tn('#c9b48a');g.lineWidth=cs*.04;g.beginPath();g.moveTo(cxp,cy-cs*.95);g.lineTo(cxp,cy-cs*.2);g.stroke();}
    if(cos==='sharf'){g.fillStyle=tn('#c0392b');g.beginPath();g.ellipse(cxp,ny,cs*.36,cs*.09,0,0,7);g.fill();g.fillRect(cxp+cs*.1,ny,cs*.12,cs*.4);}
    else if(S.catK.collar){g.strokeStyle=tn('#d23a32');g.lineWidth=cs*.07;g.beginPath();g.ellipse(cxp,ny,cs*.3,cs*.08,0,Math.PI+.2,-.2);g.stroke();}
    hat(g,cxp,cy-cs*1.25,cs*1.8,cos==='tel'||cos==='zhilet'||cos==='sharf'?null:cos,false);}catch(e){}};

/* ---------- окно Васьки ---------- */
var RAF=0;
function openCat(back){var st=stage(),w=kg(),nx=STAGES[st+1],tt=treatsToday(),tc=treatC(),g0=giftToday();M.stat('cat','open',{s:st});
  var items=ITEMS.filter(function(x){return x.k==='item';}).map(function(x){var own=!!S.catK[x.id],can=!own&&(!x.need||S.catK[x.need]);
    return '<div class="catit'+(own?' own':'')+'"><span class="catx"><b>'+L(x.n,x.en)+'</b><small>'+(own?L('есть','owned'):x.need&&!S.catK[x.need]?L('сначала ошейник','collar first'):coinsTxt(x.p))+'</small></span>'+
      (can?'<button class="btn '+(S.coins>=x.p?'green':'')+' buy noenter" data-buy="'+x.id+'">'+coinsTxt(x.p)+'</button>':own?'<span class="scmax">✓</span>':'')+'</div>';}).join('');
  var cos=ITEMS.filter(function(x){return x.k==='cos';}),nOwn=cos.filter(function(x){return S.catK[x.id];}).length;
  var tiles=cos.map(function(x){var own=!!S.catK[x.id],free=!own&&earned(x),on=S.catC===x.id;
    return '<button class="cattl'+(own?' own':'')+(on?' on':'')+(free?' free':'')+' noenter" data-c="'+x.id+'"><canvas width="160" height="140" data-cv="'+x.id+'"></canvas><b>'+L(x.n,x.en)+'</b><small>'+
      (on?L('надет','wearing'):own?L('надеть','wear'):free?L('забрать!','take!'):esc(howTxt(x)))+'</small></button>';}).join('');
  M.win('<div class="catscene" id="catScene"></div>'+M.head('cat',L('Кот Васька','Vaska the cat'),w.toFixed(1).replace('.',',')+' '+L('кг','kg')+' · '+L(STAGES[st][1],STAGES[st][2]))+
    (nx?'<div class="scrank"><small>'+L('До «'+nx[1]+'»','To «'+nx[2]+'»')+'</small><span class="gbar g"><i style="width:'+Math.round((w-STAGES[st][0])/(nx[0]-STAGES[st][0])*100)+'%"></i></span></div>':'')+
    (g0?'<button class="btn accent noenter catgift" id="catGift">'+M.MI('paw')+' '+L('Васька что-то принёс! Посмотреть','Vaska brought something! Look')+'</button>':'')+
    '<div class="row"><button class="btn green noenter" id="catTreat"'+(tt>=TREAT_DAY?' disabled':'')+'>🐟 '+(tt>=TREAT_DAY?L('Сыт на сегодня','Full for today'):L('Угостить мелочью','Treat him')+' −'+coinsTxt(tc)+' ('+tt+'/'+TREAT_DAY+')')+'</button></div>'+
    '<p class="about">'+L('Мелкую рыбёшку Васька получает и после каждой рыбалки — поэтому и толстеет. Ещё он иногда приносит находки.','Vaska also gets small fish after every trip. Sometimes he brings finds.')+'</p>'+
    '<h3 class="scsec">'+L('Вещи','Things')+'</h3>'+items+'<h3 class="scsec">'+L('Костюмы','Costumes')+' · '+nOwn+'/'+cos.length+'</h3><div class="catgrid">'+tiles+'</div>'+
    '<div class="row"><button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div>');
  var mc=$('mcard');scene($('catScene'));
  mc.querySelectorAll('canvas[data-cv]').forEach(function(c){var g=c.getContext('2d'),id=c.dataset.cv,own=!!S.catK[id];g.clearRect(0,0,160,140);g.save();if(!own&&!earned(BY[id]))g.globalAlpha=.4;
    drawFront(g,80,186,136,{cos:id,fat:.25,collar:id==="tel"||id==="zhilet"?0:0});g.restore();});
  $('catTreat').onclick=function(){if(treatsToday()>=TREAT_DAY)return;var c=treatC();if(S.coins<c){try{notEnough(c);}catch(e){toast(L('Не хватает монет','Not enough coins'));}return;}
    var d=M.dn();S.catT[d]=treatsToday()+1;S.catN=(S.catN||0)+1;S.coins-=c;save();updCoins();M.stat('cat','treat',{n:S.catN});try{SND.coin();}catch(e){}
    var s1=stage();toast(L('Мур-р! Васька доволен','Purr! Vaska is happy')+(s1>st?' · '+L('теперь он «'+STAGES[s1][1]+'»!','now he is «'+STAGES[s1][2]+'»!'):''));openCat(back);};
  if($('catGift'))$('catGift').onclick=function(){var g=giftTake();if(!g)return;try{SND.trophy();FX.burst(.5,.3,20,'coin');}catch(e){}toast(L('Васька ','Vaska ')+giftTxt(g),3200);openCat(back);};
  mc.querySelectorAll('[data-buy]').forEach(function(b){b.onclick=function(){var x=BY[b.dataset.buy];if(S.catK[x.id])return;if(S.coins<x.p){try{notEnough(x.p);}catch(e){}return;}
    S.coins-=x.p;S.catK[x.id]=1;save();updCoins();M.stat('cat','buy',{i:x.id});try{SND.buy();}catch(e){}openCat(back);};});
  mc.querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){var x=BY[b.dataset.c];
    if(S.catK[x.id]){S.catC=S.catC===x.id?null:x.id;if(!S.catC)delete S.catC;save();try{SND.tap();}catch(e){}openCat(back);return;}
    if(earned(x)){S.catK[x.id]=1;S.catC=x.id;save();M.stat('cat','cos',{i:x.id});try{SND.trophy();}catch(e){}openCat(back);return;}
    if(x.how==='buy'){if(S.coins<x.p){try{notEnough(x.p);}catch(e){}return;}S.coins-=x.p;S.catK[x.id]=1;S.catC=x.id;save();updCoins();M.stat('cat','buy',{i:x.id});try{SND.buy();}catch(e){}openCat(back);return;}
    toast(L(x.n,x.en)+': '+howTxt(x),2600);};});
  $('mCancel').onclick=back||hideModal;}
// сцена: крыльцо дачи вечером, окно светится, миска, Васька (анимация: хвост, моргает)
function scene(el){if(!el)return;var o=M.canv(el,230),g=o.g,W=o.W,H=o.H,t0=performance.now();cancelAnimationFrame(RAF);
  var bgc=document.createElement('canvas');bgc.width=Math.round(W*2);bgc.height=Math.round(H*2);var b=bgc.getContext('2d');b.scale(2,2);
  var sk=b.createLinearGradient(0,0,0,H*.6);sk.addColorStop(0,'#f29e6b');sk.addColorStop(1,'#ffd9a0');b.fillStyle=sk;b.fillRect(0,0,W,H);
  // бревенчатая стена
  var wx=W*.1,ww=W*.8;for(var i=0;i<9;i++){var yy=8+i*17,lg=b.createLinearGradient(0,yy,0,yy+16);lg.addColorStop(0,'#a8743f');lg.addColorStop(.5,'#8a5a2e');lg.addColorStop(1,'#6a4220');b.fillStyle=lg;b.beginPath();b.moveTo(wx,yy);b.lineTo(wx+ww,yy);b.quadraticCurveTo(wx+ww+6,yy+8,wx+ww,yy+16);b.lineTo(wx,yy+16);b.quadraticCurveTo(wx-6,yy+8,wx,yy);b.fill();
    b.fillStyle='#c9965a';b.beginPath();b.ellipse(wx,yy+8,6,8,0,0,7);b.ellipse(wx+ww,yy+8,6,8,0,0,7);b.fill();b.strokeStyle='#8a5a2e';b.lineWidth=1;b.beginPath();b.ellipse(wx,yy+8,3,4,0,0,7);b.ellipse(wx+ww,yy+8,3,4,0,0,7);b.stroke();}
  // окно с наличником и тёплым светом
  var ox=W*.68,oy=24,ow=58,oh=64;b.fillStyle='#f6f0e0';b.fillRect(ox-8,oy-8,ow+16,oh+16);b.fillStyle='#3f7fbf';b.beginPath();b.moveTo(ox-12,oy-8);b.lineTo(ox+ow/2,oy-26);b.lineTo(ox+ow+12,oy-8);b.fill();
  var wl=b.createRadialGradient(ox+ow/2,oy+oh/2,4,ox+ow/2,oy+oh/2,ow);wl.addColorStop(0,'#fff3c0');wl.addColorStop(1,'#f2b34a');b.fillStyle=wl;b.fillRect(ox,oy,ow,oh);
  b.strokeStyle='#f6f0e0';b.lineWidth=4;b.beginPath();b.moveTo(ox+ow/2,oy);b.lineTo(ox+ow/2,oy+oh);b.moveTo(ox,oy+oh*.4);b.lineTo(ox+ow,oy+oh*.4);b.stroke();
  b.fillStyle='#4a8a3a';b.beginPath();b.ellipse(ox+12,oy+oh+2,8,6,0,0,7);b.ellipse(ox+ow-12,oy+oh+2,8,6,0,0,7);b.fill();b.fillStyle='#e0245e';b.beginPath();b.arc(ox+12,oy+oh-4,4,0,7);b.arc(ox+ow-12,oy+oh-4,4,0,7);b.fill();
  // доски крыльца
  var py=H*.7;for(var k=0;k<5;k++){var y1=py+k*(H-py)/5,dg=b.createLinearGradient(0,y1,0,y1+(H-py)/5);dg.addColorStop(0,'#d4a066');dg.addColorStop(1,'#a8743f');b.fillStyle=dg;b.fillRect(0,y1,W,(H-py)/5-1);}
  b.fillStyle='rgba(0,0,0,.18)';b.fillRect(0,py,W,4);
  // миска с рыбкой, валенки Петровича
  var mx=W*.22,my=H*.9;b.fillStyle='#2f7de1';b.beginPath();b.ellipse(mx,my,26,9,0,0,7);b.fill();b.fillStyle='#5a9af0';b.beginPath();b.ellipse(mx,my-4,24,6,0,0,7);b.fill();
  try{b.save();b.translate(mx,my-8);b.rotate(-.15);drawFish(b,FISH.plotva.lk,0,0,30);b.restore();}catch(e){}
  b.fillStyle='#5a4a3a';b.beginPath();b.ellipse(W*.86,H*.88,16,8,0,0,7);b.fill();b.fillRect(W*.86-12,H*.62,22,H*.26);b.fillStyle='#6a5a4a';b.beginPath();b.ellipse(W*.93,H*.9,16,8,0,0,7);b.fill();b.fillRect(W*.93-12,H*.64,22,H*.26);
  var f=fat(),bed=!!S.catK.bed,col=!!S.catK.collar,bell=!!S.catK.bell;
  function fr(now){if(!el.isConnected){cancelAnimationFrame(RAF);return;}var t=(now-t0)/1000;g.clearRect(0,0,W,H);g.drawImage(bgc,0,0,W,H);
    drawFront(g,W*.5,H*.97,Math.min(H*.86,W*.46),{fat:f,cos:S.catC,collar:col,bell:bell,bed:bed,t:t,blink:(t%4.2)<.14});
    if(window.__lowFx||(typeof LOW!=='undefined'&&LOW)){return;}RAF=requestAnimationFrame(fr);}
  RAF=requestAnimationFrame(fr);fr(t0);}

/* ---------- гнёзда ---------- */
M.tile({id:'cat',pri:10,when:function(){return (S.sessions||0)>=2;},ic:function(){return '<canvas class="catico" width="96" height="96"></canvas>';},t:function(){return L('Васька','Vaska');},
  sub:function(){return giftToday()?L('что-то принёс!','brought something!'):kg().toFixed(1).replace('.',',')+' '+L('кг','kg');},
  hot:function(){return !!giftToday();},go:function(){openCat();},
  draw:function(el){var c=el&&el.querySelector('canvas');if(c)drawFront(c.getContext('2d'),48,114,96,{fat:fat(),cos:S.catC,collar:S.catK.collar,bell:S.catK.bell});}});
// находка у воды после своей рыбалки
function shoreFind(g){if(!g||g.tourn||g.guest)return null;var d=M.dn();if(S.catG.s>=d)return null;var R=rng(d*7349+(S.sessions||0)*31+5);if(R()>=.12+.04*luck())return null;
  var bs=['maggot','dough','blood','corn','live'];return R()<.5?{bait:bs[Math.floor(R()*bs.length)],q:3+Math.floor(R()*3)}:{c:M.r5(M.tripC()*.1)};}
slotAdd(resultSlots,{id:'meta-cat',pri:15,when:function(c){return !!(c&&c.g&&!c.g._mcatTook&&(c.g._mcat=c.g._mcat||shoreFind(c.g)||0));},
  html:function(c){var f=c.g._mcat;return '<button class="mtslot catslot noenter" data-a="find"><canvas class="catico" width="88" height="88"></canvas><span class="mtst"><b>'+L('Васька нашёл у воды!','Vaska found something by the water!')+'</b><small>'+
    (f.bait?f.q+' '+L('шт.: ','× ')+L(BAIT[f.bait].n,BAIT[f.bait].en).toLowerCase():coinsTxt(f.c))+' — '+L('забрать','take')+'</small></span></button>';},
  bind:function(el,c){var cv=el.querySelector('canvas');if(cv)try{drawFront(cv.getContext('2d'),44,104,88,{fat:fat(),cos:S.catC,collar:S.catK.collar});}catch(e){}
    el.querySelector('[data-a=find]').onclick=function(){var f=c.g._mcat;if(!f||c.g._mcatTook)return;c.g._mcatTook=1;S.catG.s=M.dn();
      if(f.bait)S.bait[f.bait]=(S.bait[f.bait]||0)+f.q;else S.coins+=ern('quest',f.c);save();updCoins();M.stat('cat','find',{k:f.bait?'bait':'c'});try{SND.coin();}catch(e){}
      el.innerHTML='<p class="goal">'+L('Забрал ✓ Мур-р!','Taken ✓ Purr!')+'</p>';};}});

M.cat={open:openCat,draw:drawFront,kg:kg,stage:stage,ITEMS:ITEMS};
M.mapRefresh();
})();
