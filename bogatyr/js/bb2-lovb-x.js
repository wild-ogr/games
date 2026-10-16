/* bb2-lovb-x.js — поток LOVB, набор 'lovb' (догружается в меню у всех, BB2.late). Наружу — только LOVBX.
   1) «Встреча на дороге» (флаг meet): раз за поход главы, на 70–130-й секунде, когда рядом спокойно, — бой на паузе, у дороги кто-то из троих
      (кузнец — три удара в такт; знахарка — поймай три травы; Кот Учёный — одна загадка). 5–8 секунд, пропуск — одна кнопка.
      Удалось — мелкое золото (договор ECO lov.vstrecha {perRun:1, gold:'s'}); силы в бою не даёт (бой не легче). Не бывает: первый поход, сеча,
      Поход дня, Испытание недели, Ристалище, под ?bot.
   2) «Богатырское троеборье» (флаг troe): раз в неделю три ловкостные подряд (у всех одни и те же три на неделю), одно зерно; счёт — сумма мест
      среди 9 (ты и 8 богатырей «Спора»), меньше — лучше. Первое троеборье недели — награда lov.troe {week:'m', tro:4}. Вход: экран Забав (карточка над
      «На рекорд») и «Утро богатыря» EVENT (плитка). Своё — только ZREC.x('troe') = {w неделя, b лучшая сумма недели, n сыграно за неделю}.
   STAT: lov_meet {a:see|ok|no|skip, k}, troe {a:go|end|quit, s сумма, pl место, w}. Подвиги EVENT: BB2.pdv('lov.meet'), BB2.pdv('lov.troe'). */
var LOVBX=(function(){
var X={},TAU=Math.PI*2;
function n(p,d){return BB2.n(p,d);}
function rw(v){try{if(BB2.eco&&BB2.eco.rw)return BB2.eco.rw(v);}catch(e){}var b=BB2.n('base.band',[3,18]),c=0,k;try{for(k in S.done)if(S.done[k])c++;}catch(e){}
  var i=c<=b[0]?0:c<=b[1]?1:2;return (BB2.n('base.'+(v==='s'?'small':v==='m'?'mid':'big'),[70,350,1400]) /*ECO?*/)[i]||0;}
function gold(a,src){a=Math.round(a);if(!(a>0))return 0;S.gold+=a;try{ern(src,a);}catch(e){}try{setGold();}catch(e){}return a;}
function bot(){return /[?&]bot/.test(location.search)&&!window.__lovbBot;}
function css(){if(document.getElementById('lovbCss'))return;var s=document.createElement('style');s.id='lovbCss';s.textContent=
  '#lovMeet{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(14,10,6,.55);padding:12px}'+
  '#lovMeet .panel{width:min(360px,100%);max-height:100%;overflow:auto;text-align:center}#lovMeet h3{margin:0 0 4px}#lovMeet .sub{margin:2px 0 6px;font-size:15px}'+
  '#lovMeet canvas{display:block;width:100%;height:auto;border-radius:12px;border:3px solid #6e431f;touch-action:none;background:#f3e2b8}'+
  '#lovMeet .ans{display:flex;flex-direction:column;gap:6px;margin-top:6px}#lovMeet .ans .btn{width:100%}'+
  '.lovTroe .zabSt b{color:#7a2a10}.lovTroeT{width:100%;border-collapse:collapse;margin:6px 0;font-size:15px}.lovTroeT td{padding:3px 4px;border-bottom:1px solid rgba(110,67,31,.2)}.lovTroeT tr.me td{font-weight:800;background:rgba(255,210,90,.35)}.lovTroeT td.r{text-align:right}';
  document.head.appendChild(s);}
function sp(key,px){var a=[].concat(key),i;for(i=0;i<a.length;i++)if(ART[a[i]])try{return drawArt(a[i],Math.round(px));}catch(e){}return null;}

/* ================= 1. «Встреча на дороге» ================= */
var MEET=['kuz','zna','kot'];
var RID=[[['Без рук, без ног, а ворота отворяет','No hands, no feet, yet it opens the gate'],['Ветер','The wind'],['Ключ','A key'],['Кот','A cat']], // i18n:ru
  [['Зимой и летом одним цветом','Same colour winter and summer'],['Ёлка','A fir tree'],['Снег','Snow'],['Трава','Grass']], // i18n:ru
  [['Сидит дед, во сто шуб одет','An old man in a hundred coats'],['Лук','An onion'],['Кощей','Koschei'],['Капуста','A cabbage']], // i18n:ru
  [['Не огонь, а жжётся','Not fire, yet it burns'],['Крапива','A nettle'],['Печь','A stove'],['Солнце','The sun']], // i18n:ru
  [['Маленький, удаленький, сквозь землю прошёл — красну шапочку нашёл','Small and bold, went through the ground, found a red cap'],['Гриб','A mushroom'],['Крот','A mole'],['Морковь','A carrot']], // i18n:ru
  [['Два брата через дорогу живут, а друг друга не видят','Two brothers live across the road but never see each other'],['Глаза','Eyes'],['Уши','Ears'],['Колёса','Wheels']], // i18n:ru
  [['Что легче пуха, а не удержишь?','Lighter than down, yet you can’t hold it?'],['Дыхание','Breath'],['Перо','A feather'],['Облако','A cloud']], // i18n:ru
  [['Висит груша — нельзя скушать','A pear hangs that you can’t eat'],['Лампочка','A light bulb'],['Луна','The moon'],['Кошель','A purse']]]; // i18n:ru
function meetOk(g){return BB2.on('meet')&&!!g&&!g.endless&&!g.daily&&!g.weekly&&!g.first&&!g.lovRist&&!g.tut&&!bot()&&(S.runs|0)>=2;}
BB2.hook('run',function(g){if(!meetOk(g))return;var bt=typeof bossT==='function'?bossT():300,t=70+Math.random()*60;if(t>bt-30)t=bt*.45;if(t<40)return;g.lovMeet={t:t,k:MEET[(S.runs|0)%3],d:0};});
BB2.hook('frame',function(dt,g){var m=g&&g.lovMeet;if(!m||m.d||g.t<m.t||g.boss||g.win||g.over||g.paused||g.bossIn>0||g.lvlQ>0||g.en.length>140)return;
  if(typeof G!=='undefined'&&G!==g)return;if(document.getElementById('lovMeet')||$('modal').classList.contains('on'))return;m.d=1;setTimeout(function(){X.meet(g,m.k);},0);});
X.meet=function(g,k){if(!g||g.over)return;css();g.paused=true;IN.on=false;var W=300,Hc=180,D=Math.min(2.5,window.devicePixelRatio||1),done=0,res=-1,raf=0,t0=performance.now(),T=0;
  var info={kuz:[L('Кузнец у дороги','The roadside smith'),L('Три удара в такт — жми, когда молот над наковальней','Three strikes in time — tap when the hammer is over the anvil'),['zba_smith','h_mik_0']],
    zna:[L('Знахарка у дороги','The roadside herbwife'),L('Поймай три травы — жми по ним','Catch three herbs — tap them'),['m_babka','h_vas_0']],
    kot:[L('Кот Учёный','The Learned Cat'),L('Отгадай загадку — и сундучок твой','Solve the riddle — and the little chest is yours'),['zb_kot','kot']]}[k];
  var el=document.createElement('div');el.id='lovMeet';
  el.innerHTML='<div class="panel"><h3>'+info[0]+'</h3><p class="sub">'+info[1]+'</p>'+(k==='kot'?'':'<canvas width="'+W*D+'" height="'+Hc*D+'"></canvas>')+'<div class="ans"></div><div class="btns"><button class="btn ghost" data-k="skip">'+L('Пройти мимо','Walk on by')+'</button></div></div>';
  document.body.appendChild(el);var cv=el.querySelector('canvas'),cx=cv&&cv.getContext('2d'),ans=el.querySelector('.ans'),A=sp(info[2],120),st={hits:0,taps:0,hs:[],ph:0,fx:[]};
  BB2.stat('lov_meet',{a:'see',k:k});
  function close(how){if(done)return;done=1;cancelAnimationFrame(raf);var got=0;
    if(how==='ok'){got=gold(rw(n('lov.vstrecha.gold','s')),'meet');try{if(BB2.pdv)BB2.pdv('lov.meet');}catch(e){}}
    BB2.stat('lov_meet',{a:how,k:k,g:got});
    ans.innerHTML='';el.querySelector('.btns').innerHTML='<button class="btn gold big" data-k="go">'+L('В путь!','Onward!')+'</button>';
    el.querySelector('.sub').innerHTML=how==='ok'?L('Спасибо, богатырь! ','Thank you, hero! ')+'<b>+'+fmtNum(got)+L(' золота','gold')+'</b>':how==='no'?L('Не беда — в другой раз выйдет','No matter — next time it will work'):L('Ну, бывай!','Well, farewell!');
    var gone=0,go=function(){if(gone)return;gone=1;el.remove();if(G===g&&!g.over){g.paused=false;g.hero.inv=Math.max(g.hero.inv,1.5);}};el.querySelector('[data-k=go]').onclick=function(){try{SND.click();}catch(e){}go();};
    if(how==='skip')go();else setTimeout(go,2600);}
  el.querySelector('[data-k=skip]').onclick=function(){close('skip');};
  if(k==='kot'){var q=RID[Math.floor(Math.random()*RID.length)],o=[1,2,3].sort(function(){return Math.random()-.5;});
    ans.innerHTML='<p class="sub" style="font-weight:800;font-size:17px">«'+L(q[0][0],q[0][1])+'»</p>'+o.map(function(i){return '<button class="btn" data-a="'+i+'">'+L(q[i][0],q[i][1])+'</button>';}).join('');
    var bs=ans.querySelectorAll('[data-a]'),j;for(j=0;j<bs.length;j++)bs[j].onclick=function(){try{SND.click();}catch(e){}close(this.getAttribute('data-a')==='1'?'ok':'no');};
    X.dbgMeet={k:k,ok:function(){close('ok');}};return;}
  /* кузнец: молот ходит над наковальней туда-сюда, 3 нажатия, нужно 2 из 3 точно (по центру) */
  var hs=[sp(['zba_h_myata','m_sprout'],60),sp(['zba_h_rom','m_kap'],60),sp(['zba_h_zver','m_sprout'],60),sp(['zba_h_vas','m_kap'],60)],anv=sp(['zba_anvil_i','d_stone'],90),ham=sp(['zba_hammer','i_mace'],70);
  function tap(e){if(done)return;var r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*Hc/r.height;st.taps++;
    if(k==='kuz'){var hx=W/2+Math.sin(st.ph)*W*.38,okk=Math.abs(hx-W/2)<W*.085;if(okk){st.hits++;st.fx.push({x:W/2,y:Hc*.62,t:0,c:'#ffd25a'});try{SND.hit();}catch(x2){}}else{st.fx.push({x:hx,y:Hc*.62,t:0,c:'#a0a0a0'});try{SND.click();}catch(x2){}}
      if(st.taps>=3)setTimeout(function(){close(st.hits>=2?'ok':'no');},350);}
    else{var i,h;for(i=0;i<st.hs.length;i++){h=st.hs[i];if(!h.got&&Math.hypot(h.x-x,h.y-y)<30){h.got=1;st.hits++;st.fx.push({x:h.x,y:h.y,t:0,c:'#9ad86a'});try{SND.gem();}catch(x2){}break;}}
      if(st.hits>=3)setTimeout(function(){close('ok');},300);}}
  cv.addEventListener('pointerdown',function(e){e.preventDefault();tap(e);});
  X.dbgMeet={k:k,st:st,ok:function(){close('ok');}};
  var nextH=.3;
  function fr(now){if(done)return;var dt=Math.min(.05,(now-t0)/1000);t0=now;T+=dt;cx.setTransform(D,0,0,D,0,0);cx.clearRect(0,0,W,Hc);
    var gr=cx.createLinearGradient(0,0,0,Hc);gr.addColorStop(0,'#bfe0f0');gr.addColorStop(.62,'#e8f0d0');gr.addColorStop(.63,'#b89a62');gr.addColorStop(1,'#8a6a3a');cx.fillStyle=gr;cx.fillRect(0,0,W,Hc);
    if(A)cx.drawImage(A,W-92,Hc*.62-88,84,84);
    if(k==='kuz'){st.ph+=dt*(3.2+st.taps*.5);if(anv)cx.drawImage(anv,W/2-40,Hc*.62-34,80,80);cx.fillStyle='rgba(255,210,90,.35)';cx.fillRect(W/2-W*.085,Hc*.2,W*.17,Hc*.42);
      var hx=W/2+Math.sin(st.ph)*W*.38;if(ham){cx.save();cx.translate(hx,Hc*.34);cx.rotate(Math.sin(st.ph*2)*.2);cx.drawImage(ham,-30,-30,60,60);cx.restore();}
      cx.fillStyle='#3a2410';cx.font='800 18px Rubik,system-ui,sans-serif';cx.textAlign='left';cx.fillText(st.hits+' / 3',10,24);if(T>8)close(st.hits>=2?'ok':'no');}
    else{nextH-=dt;if(nextH<=0&&st.hs.length<6){nextH=.85;var sx=40+Math.random()*(W-160);st.hs.push({x:sx,y:Hc+20,vx:(Math.random()-.5)*50,vy:-(Hc*1.15+Math.random()*40),s:hs[st.hs.length%4],got:0});}
      var i,h;for(i=0;i<st.hs.length;i++){h=st.hs[i];h.vy+=Hc*1.6*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;if(!h.got&&h.s&&h.y<Hc+30)cx.drawImage(h.s,h.x-24,h.y-24,48,48);}
      cx.fillStyle='#3a2410';cx.font='800 18px Rubik,system-ui,sans-serif';cx.textAlign='left';cx.fillText(st.hits+' / 3',10,24);if(T>7.5)close(st.hits>=3?'ok':'no');}
    for(var j=st.fx.length-1;j>=0;j--){var f=st.fx[j];f.t+=dt;if(f.t>.4){st.fx.splice(j,1);continue;}cx.globalAlpha=1-f.t/.4;cx.strokeStyle=f.c;cx.lineWidth=4;cx.beginPath();cx.arc(f.x,f.y,10+f.t*60,0,TAU);cx.stroke();cx.globalAlpha=1;}
    raf=requestAnimationFrame(fr);}
  raf=requestAnimationFrame(fr);};

/* ================= 2. «Богатырское троеборье» ================= */
function wk(){try{return weekNo();}catch(e){return 0;}}
function tx(){var x=ZREC.x('troe');if(x.w!==wk()){x.w=wk();x.b=0;x.n=0;}return x;}
function rn(s){var h=2166136261,i;s=String(s);for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
X.games=function(){var a=ZREC.ids().filter(function(id){var c=ZREC.info(id);return c&&c.lov&&ZREC.isOpen(id);}),w=wk();
  a.sort(function(p,q){return rn(w+'|'+p)-rn(w+'|'+q);});return a.length>=3?a.slice(0,3):[];};
X.troeOn=function(){return BB2.on('troe')&&ZREC.on()&&X.games().length===3;};
X.troeDone=function(){var x=ZREC.x('troe');return x.w===wk()&&(x.n|0)>0;};
function placeOf(id,sc){var t=ZREC.table(id,sc),c=ZREC.info(id),i,p=1,rows=[];for(i=0;i<t.length;i++)if(!t[i].me){rows.push(t[i]);if(sc<=0||(c.less?t[i].sc<sc:t[i].sc>sc))p++;}return {pl:p,rows:rows};}
X.troe=function(){if(!X.troeOn()||X.busy)return;var ids=X.games(),res=[],i=0,seed=(wk()*7919)>>>0;X.busy=1;BB2.stat('troe',{a:'go',w:wk()});
  function next(){if(i>=ids.length){X.busy=0;fin(ids,res);return;}var id=ids[i];
    ZREC.play(id,{src:'troe',quiet:1,seed:seed+i,train:1,back:function(out){if(!out||out.score==null){X.busy=0;BB2.stat('troe',{a:'quit',w:wk(),n:i});try{zabScreen();}catch(e){}return;}res.push(out);i++;setTimeout(next,60);}}).then(null,function(){X.busy=0;});}
  next();};
function fin(ids,res){css();var tot={},me=0,rows='',i,j,c,first=!X.troeDone(),x=tx(),gw=0,tro=0,tid='';
  for(i=0;i<ids.length;i++){var sc=Math.max(0,Math.round(+res[i].score||0)),f=res[i].fail,P=placeOf(ids[i],f?0:sc);me+=P.pl;
    var srt=P.rows.slice();srt.push({id:'me',sc:f?0:sc,me:1});c=ZREC.info(ids[i]);srt.sort(function(a,b){if(!a.sc!==!b.sc)return a.sc?-1:1;if(a.sc!==b.sc)return c.less?a.sc-b.sc:b.sc-a.sc;return a.me?-1:b.me?1:0;});
    for(j=0;j<srt.length;j++)if(!srt[j].me){tot[srt[j].id]=(tot[srt[j].id]||{nm:srt[j].nm,s:0});tot[srt[j].id].s+=j+1;}
    rows+='<tr><td>'+ZREC.name(ids[i])+'</td><td class="r">'+(f?'—':ZREC.unit(ids[i],sc))+'</td><td class="r">'+L(P.pl+'-е','#'+P.pl)+'</td></tr>';}
  var tb=[{nm:L('Ты','You'),s:me,me:1}],k;for(k in tot)tb.push(tot[k]);tb.sort(function(a,b){return a.s!==b.s?a.s-b.s:a.me?-1:b.me?1:0;});var pl=1;for(i=0;i<tb.length;i++)if(tb[i].me)pl=i+1;
  if(first){gw=gold(rw(n('lov.troe.week','m')),'troe');tro=n('lov.troe.tro',4);try{tid=(typeof troTopId==='function'&&troTopId())||'tr_les';if(typeof TRO_ADD==='function')TRO_ADD(tid,tro);else tro=0;}catch(e){tro=0;}}
  x.n=(x.n|0)+1;if(!x.b||me<x.b)x.b=me;ZREC.touch();try{if(BB2.pdv){BB2.pdv('lov.troe');}}catch(e){}
  BB2.stat('troe',{a:'end',s:me,pl:pl,w:wk(),g:gw});
  var top='';for(i=0;i<Math.min(5,tb.length);i++)top+='<tr'+(tb[i].me?' class="me"':'')+'><td>'+(i+1)+'</td><td>'+tb[i].nm+'</td><td class="r">'+tb[i].s+'</td></tr>';
  if(pl>5)top+='<tr class="me"><td>'+pl+'</td><td>'+L('Ты','You')+'</td><td class="r">'+me+'</td></tr>';
  var h='<h3>'+L('Богатырское троеборье','The Heroes’ Triathlon')+'</h3><p class="sub" style="text-align:center">'+L('Сумма мест: ','Sum of places: ')+'<b>'+me+'</b> · '+L('ты '+pl+'-й из '+tb.length,'you’re #'+pl+' of '+tb.length)+(x.b&&x.b<me?L(' · лучшая за неделю: '+x.b,' · week best: '+x.b):'')+'</p>'+
    '<table class="lovTroeT">'+rows+'</table><table class="lovTroeT">'+top+'</table>'+
    (first&&(gw||tro)?'<p class="sub" style="text-align:center">'+L('Награда недели: ','Weekly reward: ')+(gw?'<b>+'+fmtNum(gw)+L(' золота','gold')+'</b>':'')+(tro?' · <b>+'+tro+' '+(typeof troName==='function'?troName(tid):'')+'</b>':'')+'</p>':
      '<p class="sub" style="text-align:center">'+L('Награда — за первое троеборье недели. Теперь — на лучшую сумму','The reward is for the week’s first triathlon. Now go for a better sum')+'</p>')+
    '<div class="btns"><button class="btn gold big" data-k="again">'+L('↻ Ещё раз','↻ Again')+'</button><button class="btn ghost" data-k="back">'+L('Хватит','Enough')+'</button></div>';
  showModal(h,'troe');var m=$('mBody');m.querySelector('[data-k=again]').onclick=function(){try{SND.click();}catch(e){}hideModal();X.troe();};
  m.querySelector('[data-k=back]').onclick=function(){try{SND.click();}catch(e){}hideModal();try{zabScreen();}catch(e){}};
  X.last={ids:ids,me:me,pl:pl,gw:gw,tro:tro};}
function card(){var ids=X.games(),d=X.troeDone(),x=ZREC.x('troe');
  return '<div class="card zabRow lovTroe'+(d?'':' next')+'"><div class="row"><img class="ic" src="'+ic('sl_udal',96)+'"><div class="t"><b>'+L('Богатырское троеборье','The Heroes’ Triathlon')+'</b><span>'+
    ids.map(function(id){return ZREC.name(id);}).join(' · ')+'</span><span class="zabSt">'+(d?L('лучшая сумма мест недели: ','week’s best sum of places: ')+'<b>'+(x.b|0)+'</b>':L('три забавы подряд, сумма мест · награда недели ждёт','three games in a row, sum of places · weekly reward awaits'))+'</span></div></div>'+
    '<div class="btns zabBt"><button class="btn gold" data-lovt="1">'+(d?L('↻ На лучшую сумму','↻ Beat your sum'):L('Начать','Start'))+'</button></div></div>';}
BB2.hook('modal',function(kind,m){if(kind!=='zab'||!m||!X.troeOn()||!ZREC.ui)return;var b=m.querySelector('.zabRow [data-zl]'),r=b;while(r&&!(r.classList&&r.classList.contains('zabRow')))r=r.parentNode;if(!r)return;
  css();var bd=r.previousElementSibling;(bd&&bd.classList.contains('zabTip')?bd:r).insertAdjacentHTML('beforebegin',card());var t=m.querySelector('[data-lovt]');if(t)t.onclick=function(){try{SND.click();}catch(e){}X.troe();};});
BB2.hook('utroTile',function(a){try{if(!X.troeOn()||X.troeDone())return;var g=X.games();a.push({k:'troe',w:45,ic:'sl_udal',t:L('Троеборье','Triathlon'),s:L('награда недели','weekly reward'),hot:1,fn:function(){hideModal();X.troe();}});}catch(e){}});
return X;})();
