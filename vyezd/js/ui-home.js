/* ui-home.js — главный экран «Наш двор» (поток UX, буст 10.10.2026; вариант А + права из Б + «свет в окнах» из В).
   Экран: пятиэтажка с жильцами в окнах (у кого значок — поручение, нажал на окно — открылось), под домом «свет в окнах» —
   сколько дворов региона пройдено, «мой двор» (гнездо YARD), лента «Сегодня во дворе» (гнёзда CAR), одна большая кнопка
   «Выехать · двор N», нижняя панель Двор · Маршрут · Гараж · Лавка (navSlots). ПК (окно VK 920×800, 1280): две колонки.
   Всё содержимое мест — через гнёзда (js/ui-core.js). Здесь — рамка и ЗАГЛУШКИ с теми же id, которые потоки заменяют своими:
     homeSlots: 'prava' (top), 'myyard' (yard), 'gift' 'daily' 'chest' 'car' 'sets' (feed), жильцы 'w-shura' 'w-valerka' 'w-tolik' 'w-mihalych' 'w-mityai' (win).
   Глобальные имена игры (S, L, levelName, REGIONS, MODELS, streakState, …) читаются только во время отрисовки. */
(function(){'use strict';
  if(!window.UI)return;
  var W=window,D=document,L=function(a,b){return VY.L(a,b);};
  function $(id){return D.getElementById(id);}
  function esc(s){return UI.esc(s);}
  function ok(f,d){try{return f();}catch(e){return d;}}
  var DONE=function(){return Math.max(0,((VY.S.unlocked||1)-1));};

  /* ---------- данные-помощники ---------- */
  function regOf(idx){var r=ok(function(){return W.VYREG&&VYREG.at?VYREG.at(idx):null;},null);
    if(r)return {name:(VY.L(r.name,r.en||r.name)),from:r.from-1,to:r.to-1};
    var R=ok(function(){return REGIONS;},[]),o=null;for(var i=0;i<R.length;i++)if(R[i].from<=idx)o=R[i];
    if(o){var nx=R[R.indexOf(o)+1];return {name:o.name,from:o.from,to:(nx?nx.from:o.from+10)-1};}
    var k=Math.floor(idx/10)*10;return {name:L('Двор №','Yard #')+(k+1)+'–'+(k+10),from:k,to:k+9};}
  function totStars(){var n=0,s=VY.S.stars||{};for(var k in s)n+=s[k]||0;return n;}
  // класс водителя (заглушка UX: CAR кладёт своё в homeSlots с тем же id 'prava')
  var CLS=[[0,'3-го класса','3rd class'],[20,'2-го класса','2nd class'],[60,'1-го класса','1st class'],[120,'— ас района','district ace'],[200,'— ас города','city ace'],[300,'— ас области','region ace']];
  function cls(){var d=DONE(),k=0;for(var i=0;i<CLS.length;i++)if(d>=CLS[i][0])k=i;return {k:k,name:L(CLS[k][1],CLS[k][2]),next:CLS[k+1]||null,d:d};}

  /* ---------- заглушки гнёзд (потоки заменяют тем же id) ---------- */
  homeSlots.push({id:'prava',order:10,zone:'top',render:function(){var c=cls(),nx=c.next,left=nx?nx[0]-c.d:0,from=CLS[c.k][0];
    return '<div class="hPrava" data-go="map"><span class="hpPh">'+UI.who('shura','norm').replace('<svg','<svg class="hpSv"')+'</span><span class="hpB"><small>'+L('ВОДИТЕЛЬСКОЕ УДОСТОВЕРЕНИЕ','DRIVER’S LICENCE')+'</small><b>'+L('Водитель ','Driver · ')+esc(c.name)+'</b>'
      +(nx?'<i class="hsP"><b style="width:'+Math.round(100*(c.d-from)/(nx[0]-from))+'%"></b></i><em>'+L('до '+nx[1].replace('— ','')+' — ещё '+left+' '+plural(left,'двор','двора','дворов'),'to “'+nx[2]+'”: '+left+' more yards')+'</em>':'')+'</span><span class="hpSt">'+L('Стаж','Yards')+'<b>'+c.d+'</b></span></div>';}});
  function plural(n,a,b,c){return typeof W.plural==='function'?W.plural(n,a,b,c):c;}
  homeSlots.push({id:'myyard',order:10,zone:'yard',render:function(){var S=VY.S,dec=ok(function(){return DECOR.filter(function(d){return S.dec&&S.dec[d.id];}).length;},0),all=ok(function(){return DECOR.length;},6);
    var n=(S.garage||[]).length,first=ok(function(){return CAR_AT[0];},3);
    return '<div class="hMy" data-go="garage-yard">'+(n?'<canvas class="hMyCar"></canvas>':'<span class="hMyCar hMyNo">?</span>')+'<span class="hMyT"><b>'+L('Мой двор','My yard')+'</b><small>'+(n?L('уют','decor')+' '+dec+'/'+all+' · '+L('машин','cars')+' '+n:L('место свободно — первая машина за двор '+first,'empty spot — first car after yard '+first))+'</small></span></div>';},
    mount:function(el){var c=el.querySelector('canvas');if(!c)return;var S=VY.S,g=S.garage||[];if(!g.length)return;var yc=ok(function(){return yardCars();},[]),mi=yc.length?yc[0]:g[g.length-1];
      requestAnimationFrame(function(){ok(function(){drawModel(c,MODELS[mi],carColor(mi));});});}});
  homeSlots.push({id:'gift',order:10,render:function(){var st=ok(function(){return streakState();},null);if(!st||!(VY.S.levelsDone>0))return null;
    return UI.tile({ic:'🎁',t:st.claimed?L('Гостинец взят','Gift collected'):L('Гостинец · день '+st.day+' из 7','Gift · day '+st.day+' of 7'),s:st.claimed?L('завтра — новый','new one tomorrow'):ok(function(){return giftTxt(streakReward(st.day));},''),cls:st.claimed?'':'hot',go:'gift',prog:[st.day-(st.claimed?0:1),7]});}});
  homeSlots.push({id:'daily',order:20,render:function(){if(ok(function(){return dailyLocked();},true))return null;var S=VY.S,d=(S.daily||{})[todayKey()]||0,w=ok(function(){return dailyWeek().n;},0);
    return UI.tile({ic:'📅',t:d?L('Задание дня выполнено','Daily done'):L('Задание дня','Daily challenge'),s:d?L('на неделе '+w+'/7','this week '+w+'/7'):'+'+DAILY_REWARD+' 💰 · '+L('на неделе ','this week ')+w+'/7',cls:d?'':'hot',go:'daily',prog:[w,7]});}});
  homeSlots.push({id:'car',order:30,render:function(){var S=VY.S,done=DONE(),k=ok(function(){return MODELS.findIndex(function(m,i){return !m.streak&&S.garage.indexOf(i)<0&&CAR_AT[i]>done;});},-1);if(k<0)return null;
    var prev=k>0?CAR_AT[k-1]:0,left=CAR_AT[k]-done;return UI.tile({ic:'🚗',t:L('Новая машина: ','New car: ')+MODELS[k].name,s:L('ещё ','in ')+left+' '+(VY.L(plural(left,'двор','двора','дворов'),left===1?'yard':'yards')),go:'garage',prog:[done-prev,CAR_AT[k]-prev]});}});
  homeSlots.push({id:'chest',order:40,render:function(){var S=VY.S;for(var k=0;k*10<S.unlocked-1;k++){var nx=ok(function(){return CHEST[S.chest[k]||0];},null);if(nx&&ok(function(){return chestStars(k);},0)>=nx[0])return UI.tile({ic:'🧰',t:L('Сундук за звёзды готов','Star chest ready'),s:L('забери на маршруте','collect it on the route'),cls:'hot',go:'map'});}return null;}});
  homeSlots.push({id:'sets',order:50,render:function(){if(!ok(function(){return setsReady();},false))return null;return UI.tile({ic:'🏆',t:L('Набор собран','Set complete'),s:L('награда ждёт в гараже','reward in the garage'),cls:'hot',go:'garage'});}});
  // жильцы в окнах (заглушки: CAR/YARD кладут поручения своими id или заменяют эти)
  homeSlots.push({id:'w-shura',order:10,zone:'win',render:function(){var st=ok(function(){return streakState();},{claimed:true});return {who:'shura',t:L('Баба Шура','Granny Shura'),s:st.claimed?L('Гостинец завтра','Gift tomorrow'):L('Гостинец ждёт!','Your gift is waiting!'),badge:st.claimed?'':'🎁',go:st.claimed?null:'gift'};}});
  homeSlots.push({id:'w-valerka',order:20,zone:'win',render:function(){var lk=ok(function(){return dailyLocked();},true),d=!lk&&((VY.S.daily||{})[todayKey()]||0);return {who:'valerka',t:L('Валерка','Valerka'),s:lk?L('Задание дня — с 7-го двора','Daily from yard 7'):d?L('Задание сделано!','Daily done!'):L('Задание дня','Daily challenge'),badge:!lk&&!d?'!':'',go:lk?null:'daily'};}});
  homeSlots.push({id:'w-tolik',order:30,zone:'win',render:function(){var hot=ok(function(){return setsReady();},false);return {who:'tolik',t:L('Толик «Карбюратор»','Tolik'),s:L('Гараж','Garage'),badge:hot?'🔧':'',go:'garage'};}});
  homeSlots.push({id:'w-mihalych',order:40,zone:'win',render:function(){return {who:'mihalych',t:L('Михалыч','Mikhalych'),s:L('Уют двора','Yard decor'),badge:'',go:'garage-yard'};}});
  homeSlots.push({id:'w-mityai',order:50,zone:'win',render:function(){return {who:'mityai',t:L('Дед Митяй','Grandpa Mityai'),s:''};}});
  // нижняя панель
  navSlots.push({id:'home',order:10,ic:'🏠',t:function(){return L('Двор','Yard');},go:'home'});
  navSlots.push({id:'map',order:20,ic:'🗺',t:function(){return L('Маршрут','Route');},go:'map'});
  navSlots.push({id:'garage',order:30,ic:'🅿️',t:function(){return L('Гараж','Garage');},go:'garage',dot:function(){return ok(function(){return setsReady();},false);}});
  navSlots.push({id:'shop',order:40,ic:'🛒',t:function(){return L('Лавка','Shop');},go:'shop'});

  /* ---------- реплики жильцов по нажатию на окно без поручения ---------- */
  var SAY={
    shura:[['Ты у нас самый аккуратный водитель во дворе!','You’re the tidiest driver in the yard!'],['Машины ставь ровно — я всё вижу из окна.','Park neatly — I can see it all from my window.'],['Пирожки будут к вечеру, заходи.','Pies will be ready by evening, drop by.']],
    tolik:[['Карбюратор — дело тонкое. Как и выезд со двора.','A carburettor is a delicate thing. So is getting out of a yard.'],['Заезжай в гараж — подкрашу, будет как новая.','Come by the garage — a lick of paint and she’s like new.'],['Главное — не газуй, когда сзади «Волга».','Rule one: don’t floor it with a Volga behind you.']],
    mihalych:[['Подмёл — теперь хоть парад устраивай.','Swept it all — fit for a parade now.'],['Клумбы не трогать! Объезжай.','Hands off the flower beds! Drive around.'],['Снег пойдёт — не жалуйтесь.','Snow is coming — no complaining.']],
    valerka:[['Я посчитал: за двор нужно меньше ходов, чем кажется!','I counted: you need fewer moves than it seems!'],['Задание дня — как контрольная, только интереснее.','The daily is like a test, only more fun.']],
    mityai:[['Я в восемьдесят седьмом из такого двора задом выезжал — на «Запорожце»!','Back in ’87 I reversed out of a yard like this — in a Zaporozhets!'],['Сейчас машин много, а терпения мало.','Lots of cars nowadays, not much patience.'],['Внучок, ты главное — по стрелке.','Just follow the arrow, sonny.']]};
  var lastSay={};
  function sayOf(who){var a=SAY[who]||SAY.mityai,i=Math.floor(Math.random()*a.length);if(a.length>1&&i===lastSay[who])i=(i+1)%a.length;lastSay[who]=i;return L(a[i][0],a[i][1]);}

  /* ---------- пятиэтажка (SVG) ---------- */
  var HW=340,F=5,C=6,WX=[22,72,122,184,234,284],WY=function(f){return 34+f*38;};
  var RES_POS=[[3,0],[1,4],[2,2],[0,1],[1,5],[3,3],[0,4]];
  function isDoor(f,c){return f===4&&(c===2||c===3);}
  function litOrder(){var o=[];for(var f=0;f<F;f++)for(var c=0;c<C;c++)if(!isDoor(f,c))o.push([f,c]);var s=7;for(var i=o.length-1;i>0;i--){s=(s*48271)%2147483647;var j=s%(i+1),t=o[i];o[i]=o[j];o[j]=t;}return o;}
  var LIT=litOrder();
  function house(res,lit,night){var h='',K=night?{wall:'#5a4a66',brick:'#4b3d57',roof:'#33283d',frame:'#8c7fa0',glass:'#2b3655',glass2:'#3a4770',on:'#ffd36b',on2:'#ffbf3a',sill:'#7d7090',cur:'#c0606a'}:{wall:'#d9825d',brick:'#c96f4a',roof:'#7a4a35',frame:'#fff6e6',glass:'#8fc2e3',glass2:'#b5daf0',on:'#ffe18a',on2:'#ffcf57',sill:'#efe2cc',cur:'#e57373'};
    h+='<svg class="hHouse" viewBox="0 0 '+HW+' 232" aria-hidden="false" role="img">';
    if(night)h+='<circle cx="300" cy="-6" r="10" fill="#fff4c2"/>';h+='<rect x="6" y="18" width="328" height="206" rx="3" fill="'+K.wall+'"/>';
    // кирпич: тонкие ряды
    for(var y=26;y<222;y+=9)h+='<path d="M8 '+y+'h324" stroke="'+K.brick+'" stroke-width="1" opacity=".45"/>';
    h+='<rect x="2" y="12" width="336" height="9" rx="2" fill="'+K.roof+'"/><rect x="40" y="4" width="20" height="10" fill="#8d5a43"/><rect x="270" y="2" width="18" height="12" fill="#8d5a43"/>';
    h+='<path d="M120 4v-2M126 4v-6M132 4v-3" stroke="#555" stroke-width="1.5"/>'; // антенны
    var litSet={};for(var i=0;i<lit&&i<LIT.length;i++)litSet[LIT[i][0]+'_'+LIT[i][1]]=1;
    var resAt={};res.forEach(function(r,k){var p=RES_POS[k];if(p)resAt[p[0]+'_'+p[1]]={r:r,k:k};});
    for(var f=0;f<F;f++)for(var c=0;c<C;c++){if(isDoor(f,c))continue;var x=WX[c],y=WY(f),key=f+'_'+c,on=!!litSet[key],R=resAt[key];
      var glass=on||(night&&R)?K.on:K.glass,glass2=on?K.on2:K.glass2;
      h+='<g class="hWin'+(R?' hRes':'')+(on?' lit':'')+'"'+(R?' data-res="'+R.k+'" tabindex="0" role="button" aria-label="'+esc(R.r.t||'')+'"':'')+'>';
      h+='<rect x="'+(x-2)+'" y="'+(y-2)+'" width="38" height="30" rx="2" fill="'+K.frame+'"/><rect x="'+x+'" y="'+y+'" width="34" height="26" fill="'+glass+'"/>'+(night&&on?'<rect x="'+(x-6)+'" y="'+(y-6)+'" width="46" height="38" rx="10" fill="#ffd36b" opacity=".18"/>':'');
      if(!R)h+='<path d="M'+(x+4)+' '+(y+20)+'l10-14M'+(x+12)+' '+(y+22)+'l8-11" stroke="'+glass2+'" stroke-width="3" opacity=".8"/>';
      if(on&&!R)h+='<path d="M'+x+' '+y+'h9q-3 13 0 26h-9zM'+(x+34)+' '+y+'h-9q3 13 0 26h9z" fill="'+K.cur+'" opacity=".85"/>';
      if(R)h+=UI.who(R.r.who,R.r.mood||'norm').replace('<svg','<svg x="'+(x+3)+'" y="'+(y+1)+'" width="28" height="28" class="hPpl"');
      h+='<path d="M'+(x+17)+' '+y+'v26" stroke="'+K.frame+'" stroke-width="2"/>';
      h+='<rect x="'+(x-4)+'" y="'+(y+26)+'" width="42" height="4" rx="1.5" fill="'+K.sill+'"/>';
      if((f+c)%4===1&&!R)h+='<circle cx="'+(x+8)+'" cy="'+(y+24)+'" r="3" fill="#e74c3c"/><circle cx="'+(x+14)+'" cy="'+(y+24)+'" r="3" fill="#f1c40f"/><circle cx="'+(x+20)+'" cy="'+(y+24)+'" r="3" fill="#fd79a8"/>';
      if(R&&R.r.badge)h+='<g class="hBadge"><circle cx="'+(x+33)+'" cy="'+(y+1)+'" r="9" fill="#ffc233" stroke="#7a4a00" stroke-width="1.5"/><text x="'+(x+33)+'" y="'+(y+5.5)+'" text-anchor="middle" font-size="'+(R.r.badge.length>1?11:13)+'" font-weight="900" fill="#5a3500">'+esc(R.r.badge)+'</text></g>';
      h+='</g>';}
    // подъезд
    h+='<rect x="160" y="178" width="46" height="46" fill="#6d4c41"/><rect x="164" y="182" width="38" height="42" fill="#5d4037"/><path d="M183 182v42" stroke="#4e342e" stroke-width="2"/><rect x="150" y="170" width="66" height="8" rx="2" fill="#8d6e63"/><rect x="170" y="160" width="26" height="9" rx="2" fill="#fff6e6"/><text x="183" y="167" text-anchor="middle" font-size="7" font-weight="800" fill="#5d4037">'+L('ПОДЪЕЗД 1','ENTRANCE 1')+'</text>';
    h+='</svg>';return h;}

  /* ---------- экран ---------- */
  var sec=null;
  function build(){if(sec)return sec;sec=D.createElement('section');sec.id='scr-home';sec.className='screen uxhome';
    sec.innerHTML='<header class="mh hHead"><div class="logo"><span class="lc">🚗 </span><span>'+L('Выезд со двора','Yard Escape')+'</span></div><div class="hdr-r"><button class="icon" id="hMore" style="display:none" aria-label="'+L('Ещё игры','More games')+'">🎲</button><button class="icon snd" id="hSet" aria-label="'+L('Настройки','Settings')+'">⚙️</button><div class="pill">⭐ <span id="hStars">0</span></div><button class="pill" id="hCoins">💰 <span id="hCoinN">0</span></button></div></header>'
      +'<div class="hBody"><div class="hColA"><div class="hTop" id="hTop"></div><div class="hHouseW" id="hHouse"></div><div class="hLight" id="hLight"></div><div class="hYard" id="hYard"></div></div>'
      +'<div class="hColB"><div class="hTop hTopB" id="hTopB"></div><h3 class="hFeedH">'+L('Сегодня во дворе','Today in the yard')+' <small id="hDate"></small></h3><div class="hFeed" id="hFeed"></div><div class="hSide" id="hSide"></div>'
      +'<button class="btn green hGo" id="hGo"></button></div></div><nav class="unav" id="hNav"></nav>';
    $('app').insertBefore(sec,$('modal'));
    $('hSet').onclick=function(){UI.go('settings');};$('hCoins').onclick=function(){UI.go('shop');};
    $('hMore').onclick=function(){ok(function(){STAT.ev('mod',{m:'soc',a:'more'});SOC.showMore();});};
    $('hGo').onclick=function(){go();};
    return sec;}
  // «выезд»: машинка проезжает по кнопке и звук мотора, потом двор (в спокойном режиме — сразу)
  function go(){var S=VY.S,i=Math.max(0,(S.unlocked||1)-1),b=$('hGo');if(!b||b.classList.contains('drive'))return;
    var calmOn=ok(function(){return calm();},false);if(calmOn){UI.go('game',{idx:i});return;}
    b.classList.add('drive');ok(function(){SND.go();});setTimeout(function(){b.classList.remove('drive');UI.go('game',{idx:i});},380);}
  function wide(){return W.matchMedia&&matchMedia('(min-width:860px) and (min-height:600px) and (min-aspect-ratio:1/1)').matches;}
  function navHtml(cur){var it=UI.list(navSlots).slice(0,6),h='';
    for(var i=0;i<it.length;i++){var x=it[i],dot=false;try{dot=x.dot&&x.dot();}catch(e){}
      h+='<button class="unB'+(x.id===cur?' on':'')+'" data-nav="'+esc(x.id)+'"><span class="unI">'+(x.ic||'')+'</span><span class="unT">'+esc(typeof x.t==='function'?x.t():x.t||'')+'</span>'+(dot?'<i class="unDot"></i>':'')+'</button>';}
    return h;}
  function navFill(el,cur){if(!el)return;el.innerHTML=navHtml(cur);var it=UI.list(navSlots);
    el.querySelectorAll('[data-nav]').forEach(function(b){b.onclick=function(){var id=b.getAttribute('data-nav'),x=it.filter(function(y){return y.id===id;})[0];if(!x)return;
      if(typeof x.go==='function')x.go();else UI.go(x.go||id);};});}
  UI.navFill=navFill;
  function render(){build();var S=VY.S,ctx={S:S,lv:(S.unlocked||1),pc:UI.pc(),wide:wide()},idx=Math.max(0,(S.unlocked||1)-1);
    $('hStars').textContent=totStars();$('hCoinN').textContent=S.coins||0;
    ok(function(){var m=$('hMore');m.style.display=SOC.can('more')?'':'none';});
    // права/верх: на ПК — в правой колонке
    var topEl=ctx.wide?$('hTopB'):$('hTop');$('hTop').innerHTML='';$('hTopB').innerHTML='';UI.fill(topEl,homeSlots,ctx,'hslot','top');
    // жильцы и свет в окнах
    var res=UI.objs(homeSlots,ctx,'win').slice(0,RES_POS.length),rg=regOf(idx),inReg=Math.max(0,Math.min(10,DONE()-rg.from)),span=Math.max(1,Math.min(10,rg.to-rg.from+1)),lit=Math.round(LIT.length*inReg/span);
    var night=!!(UI.night&&UI.night.on());sec.classList.toggle('night',night);
    $('hHouse').innerHTML=house(res,lit,night);
    $('hHouse').querySelectorAll('[data-res]').forEach(function(g){var r=res[+g.getAttribute('data-res')];var act=function(){if(r.go){if(typeof r.go==='function')r.go();else UI.go(r.go);}else bubble(g,r);};g.onclick=act;g.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();act();}};
      if(r.mount)ok(function(){r.mount(g,ctx);});});
    $('hLight').innerHTML='<span class="hlI">💡</span><span class="hlT"><b>'+L('Свет в окнах','Lights on')+' '+inReg+'/'+span+'</b> · '+esc(rg.name)+'</span><i class="hsP"><b style="width:'+Math.round(100*inReg/span)+'%"></b></i>';
    var y=UI.fill($('hYard'),homeSlots,ctx,'hslot','yard');$('hYard').style.display=y?'':'none';
    var n=UI.fill($('hFeed'),homeSlots,ctx,'hs','feed','feed');$('hFeed').style.display=n?'':'none';
    UI.fill($('hSide'),homeSlots,ctx,'hslot','side');
    $('hDate').textContent=ok(function(){return new Date(nowMs()).toLocaleDateString(L('ru-RU','en-US'),{day:'numeric',month:'long'});},'');
    $('hGo').innerHTML='<i class="hGoCar">🚗</i><b>'+L('Выехать · двор ','Drive · yard ')+(idx+1)+'</b><small>'+esc(ok(function(){return yardName(idx);},''))+(UI.pc()?' · Enter':'')+'</small>';
    navFill($('hNav'),'home');
    sec.classList.toggle('wide',ctx.wide);}
  UI.homeRender=render;
  // пузырь реплики над окном
  function bubble(g,r){var b=$('hBub');if(!b){b=D.createElement('div');b.id='hBub';b.className='hBub';$('hHouse').appendChild(b);}
    var hr=$('hHouse').getBoundingClientRect(),gr=g.getBoundingClientRect();b.innerHTML='<b>'+esc(UI.whoName(r.who))+'</b>'+esc(r.say||sayOf(r.who));
    b.style.left=Math.max(4,Math.min(hr.width-214,gr.left-hr.left+gr.width/2-105))+'px';b.style.top=Math.max(0,gr.top-hr.top-8)+'px';b.classList.remove('on');void b.offsetWidth;b.classList.add('on');
    clearTimeout(bubble.t);bubble.t=setTimeout(function(){b.classList.remove('on');},3200);ok(function(){tone('triangle',660,880,.08,.03);});}
  function open(){VY.leave();ok(function(){if(VY.modalOn)hideModal();});ok(function(){STAT.once('menu');STAT.once('ready',{ms:Math.round(performance.now())});STAT.screen('home');});
    D.body.style.background='';render();show('scr-home');UI.emit('home');
    ok(function(){if(W.__sdkDone&&!W.__demo)setTimeout(maybeStreak,400);});}
  UI.screen('home',open);
  UI.screen('garage-yard',function(){UI.go('garage',{tab:'yard'});});
  // монеты/звёзды на главном
  UI.on('coins',function(n){var e=$('hCoinN');if(e)e.textContent=n;});
  D.addEventListener('keydown',function(e){if(UI.cur!=='home'||e.repeat||VY.modalOn)return;if(e.key==='Enter'){e.preventDefault();go();}});
  W.addEventListener('resize',function(){if(UI.cur==='home'){clearTimeout(render.t);render.t=setTimeout(render,150);}});
  // карта («Маршрут»): та же нижняя панель, старая полоса кнопок прячется (CSS html.uxh)
  D.documentElement.classList.add('uxh');
  function mapNav(){var m=$('scr-map');if(!m)return;var n=$('mNav2');if(!n){n=D.createElement('nav');n.id='mNav2';n.className='unav';m.appendChild(n);}navFill(n,'map');}
  UI.on('map',mapNav);
  UI.mapRender=function(){ok(function(){openMap();});};
  // старт: игра уже показала карту (модуль грузится после основного скрипта) — переходим на главный, если игрок не во дворе
  if(UI.cur==='map'&&!VY.G&&!VY.modalOn&&!/[?&]demo=/.test(location.search))UI.go('home');else if(UI.cur==='map')mapNav();
})();
