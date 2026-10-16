/* ===== bb2-glove-run.js — поток GLOVE супер-буста в2 (14.10.2026): «Перчатка», «Спор богатырей», гость из Обороны. Набор 'glove' (заглушка — js/bb2-glove.js).
   Журнал — hobby-analytics/release-i/bogatyr-boost2/logs/GLOVE.md. Старый синтаксис: без ?. ?? .finally.

   1. «Перчатка» (флаг glove). В итогах похода (≥60 с, не первый поход, не неделя) — «🧤 Бросить перчатку»: ссылка https://vk.com/app54791567#g1.… — другу
      в сообщения (VKWebAppShare) или на стену с рекордом (VKWebAppShowWallPostBox). Вне VK — «Скопировать ссылку». В ОК и на Яндексе кнопки нет (ссылки на vk.com там нельзя).
      В ссылке — режим и глава, герой, зерно похода, время, одолено всего, победа, счёт по отрезкам времени, имя. Сервера нет: всё в ссылке.
      Друг открывает ссылку: новичок — сразу первый поход (с поблажками новичка) уже с тенью соперника; игрок — окно «Вася бросил тебе перчатку!» → «Принять» → бой сразу.
      В бою справа под полоской опыта — плашка «🧤 Вася 148 · ты 131» (готовая картинка, перерисовка только при смене чисел).
      В итогах — кто впереди, награда за участие (ECO glove.play, до glove.perDay в день; отправителю — ничего: правила VK) и «Ответная перчатка».
      Глава, которой у друга нет, → его самая дальняя открытая глава (честно подписано «у Васи — глава N»). Герой — Васин, если открыт у друга, иначе свой.
      Тень — ТОЛЬКО ПО СЧЁТУ: зерно G.rng решает лишь карточки уровня и сундуки, враги — Math.random (договора записи REPLAY ещё нет; см. журнал «Для MERGE»).
   2. «Спор богатырей» (флаг chal). В окне итогов забавы со счётом — «🧤 Позвать друга побить N». Ссылка #z1.<id>.<счёт>.<имя> открывает игру сразу в этой забаве
      (ZREC.play src:'link', vs — счёт друга), потом «А теперь — в поход!» (новичку — сразу первый поход).
   3. Гость из Обороны (флаг xworld): Оборона открывает нас с location 'from=54791569' (хвост адреса) — её код не трогаем; запасной признак — память браузера 'oborona-v1' (только читаем).
      Новичку — привет в первом походе и гостинец (ECO glove.guest) после первого сыгранного похода. Тот же гостинец — новичку, пришедшему по перчатке или «Спору» (один на жизнь).
   Сохранение S.bb2.glove: d день наград, n наград в этот день, s отправлено перчаток, p сыграно перчаток, gg гостинец выдан, gs откуда пришёл новичок (g|z|o), w привет показан, u — последние принятые ссылки.
   STAT: glove {a:see|tap|sent|wall|copy|in|go|no|end|gift, m:run|zab|obo, …}. Шина: BB2.ev('glove',{a:'end',me,him,win}) после перчатки; «Подвиги»: BB2.pdv('glove').
   Для других: BB2.glove.link(G) — ссылка-перчатка этого похода; BB2.glove.parse(хвост); BB2.glove.cur() — чужая перчатка текущего похода {n,k,t,at(t)}. */
(function(){
  if(typeof BB2!=='object'||!BB2)return;
  var X=BB2.gl||(BB2.gl={h:'',z:0,o:0}),APP=54791567,A=null,shown={},nmV='',sheet=null;
  function sv(){return BB2.s('glove');}
  function esc(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
  function b36(n){return Math.max(0,Math.round(+n||0)).toString(36);}
  function n36(x){if(!/^[0-9a-z]{1,9}$/.test(x||''))return -1;var v=parseInt(x,36);return isFinite(v)?v:-1;}
  function st(o){try{BB2.stat('glove',o);}catch(e){}}
  function day(){try{return dayIdx();}catch(e){return Math.floor(Date.now()/864e5);}}
  function hs(t){var h=2166136261,i;for(i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36).slice(0,8);}
  function band(){var n=0,k,b=BB2.n('base.band',[3,18]);try{for(k in S.done)if(S.done[k])n++;}catch(e){}return n<=b[0]?0:n<=b[1]?1:2;}
  function gold(k){var t=BB2.n('base.'+(k==='m'?'mid':k==='b'?'big':'small'),k==='m'?[350,950,3200]:[70,200,650]);return k===0||k==='0'?0:+t[band()]||0;}
  function give(v,why){if(!(v>0))return 0;S.gold+=v;try{ern('oth',v);}catch(e){}st({a:'gift',m:why,g:v});return v;}
  function hname(id){var h=HERO_BY[id];return h?String(h.name).split(' ')[0]:'';}
  function chName(slot){try{return CH[slot]?CH[slot].name:'';}catch(e){return '';}}
  function canShare(){return PLAT==='vk'&&!OK;}
  function isVK(){try{return typeof SOC!=='undefined'&&SOC.ok();}catch(e){return false;}}
  function nm2(v){return String(v||'').replace(/[^0-9A-Za-z\u0400-\u04ff -]/g,'').replace(/\s+/g,' ').trim().slice(0,12);}

  /* ---------- ссылка ---------- */
  /* перчатка: g1.<режим c|e|d><слот>.<герой — номер в HEROES>.<зерно>.<время, с>.<одолено>.<1 победа>.<шаг, с>.<прирост по шагам через ->.<имя> — всё в base36, имя — encodeURIComponent */
  function enc(o){var k=o.k||[],stp=10*Math.max(1,Math.ceil(o.t/10/48)),d=[],i,p=0,v,j;
    for(i=1;i*stp<=o.t+.001&&d.length<48;i++){j=Math.min(k.length,i*stp/10)-1;v=j>=0?k[j]:0;d.push(b36(Math.max(0,v-p)));p=Math.max(p,v);}
    return 'g1.'+o.m+b36(o.c)+'.'+b36(o.h)+'.'+b36(o.s)+'.'+b36(o.t)+'.'+b36(o.n)+'.'+(o.w?1:0)+'.'+b36(stp)+'.'+d.join('-')+'.'+encodeURIComponent(nm2(o.nm)||'');}
  function dec(h){var a=String(h||'').split('.'),o,i,q,s=0,nmx='';if(a.length<10||a[0]!=='g1')return null;
    try{nmx=nm2(decodeURIComponent(a[9]||''));}catch(e){nmx='';}
    o={m:a[1].charAt(0),c:n36(a[1].slice(1)),h:n36(a[2]),s:n36(a[3]),t:n36(a[4]),n:n36(a[5]),w:a[6]==='1'?1:0,st:n36(a[7]),k:[],nm:nmx||L('Богатырь','A hero'),id:hs(h)};
    if(!/^[ced]$/.test(o.m)||o.c<0||o.c>999||o.h<0||o.s<0||o.s>2147483647||o.t<30||o.t>14400||o.n<0||o.n>500000||o.st<10||o.st>600)return null;
    q=a[8]?a[8].split('-'):[];if(q.length>60)return null;
    for(i=0;i<q.length;i++){var v=n36(q[i]);if(v<0||v>50000)return null;s+=v;o.k.push(s);}
    if(s>o.n)return null;o.hero=HEROES[o.h]?HEROES[o.h].id:'';
    o.at=function(t){if(t>=o.t)return o.n;var x=t/o.st,i=Math.floor(x),a0=i>0?o.k[i-1]||0:0,a1=i<o.k.length?o.k[i]:o.n;return Math.floor(a0+(a1-a0)*(x-i));};
    return o;}
  /* «Спор богатырей»: z1.<id забавы>.<счёт>.<имя> */
  function zenc(id,sc,n){return 'z1.'+id+'.'+b36(sc)+'.'+encodeURIComponent(nm2(n)||'');}
  function zdec(h){var a=String(h||'').split('.'),n='';if(a.length<4||a[0]!=='z1'||!/^[a-z][a-z0-9]{1,11}$/.test(a[1]))return null;var sc=n36(a[2]);if(sc<1||sc>1e6)return null;
    try{n=nm2(decodeURIComponent(a[3]));}catch(e){}return {id:a[1],sc:sc,nm:n||L('Друг','Friend'),hid:hs(h)};}
  function url(t){return 'https://vk.com/app'+APP+'#'+t;}

  /* ---------- запись своего похода: одолено каждые 10 с; зерно карточек и сундуков ---------- */
  BB2.hook('run',function(g){if(!BB2.on('glove')||g.weekly)return;g.bb2gk=[];g.bb2gt=10;
    var a=A;A=null;
    if(a&&!g.daily){g.bb2gl=a;if(!g.rng){g.rng=mulberry(a.s|0);g.bb2gs=a.s;}a.used=1;sv().p=(sv().p|0)+1;save();
      try{banner(L('🧤 Тебе брошена перчатка!','🧤 You’ve been challenged!'),a.nm+': '+fmtNum(a.n)+L(' за ',' in ')+fmtTime(a.t)+L(' — побей!',' — beat it!'),3);}catch(e){}
      st({a:'go',m:'run',c:g.chi,n:a.n,f:g.first?1:0});}
    else if(a&&g.daily)g.bb2gl=a;
    if(!g.rng&&!g.daily){g.bb2gs=1+Math.floor(Math.random()*2147483646);g.rng=mulberry(g.bb2gs);}
    if(g.first&&sv().gs==='o'&&!(sv().w&1)){sv().w=(sv().w|0)|1;try{banner(L('Гость с заставы!','A guest from the outpost!'),L('Тридевятая оборона шлёт привет богатырям','The Thrice-Nine Defense sends its regards'),3);}catch(e){}}});
  BB2.hook('frame',function(dt,g){var k=g.bb2gk;if(!k)return;while(g.t>=g.bb2gt&&k.length<1440){k.push(g.kills);g.bb2gt+=10;}});

  /* ---------- плашка соперника в бою: готовая картинка, перерисовка только при смене чисел (раз в 0,5 с проверка) ---------- */
  var pc=null,pk='',pT=0;
  function pill(a,me,him){var d=Math.min(2,window.devicePixelRatio||1),w=134,h=22,c=pc&&pc.width===w*d?pc:mkCanvas(w*d,h*d),x=c.getContext('2d'),ahead=me>=him;
    x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);x.fillStyle='rgba(20,16,30,.66)';rr(x,.5,.5,w-1,h-1,11);x.fill();x.lineWidth=1.5;x.strokeStyle=ahead?'#7fd66a':'#ff9a6a';x.stroke();
    x.font='800 12px '+(typeof CVL!=='undefined'&&CVL.font||'sans-serif');x.textBaseline='middle';x.textAlign='left';x.fillStyle='#d8d0ff';
    var t1='🧤 '+a.nm.slice(0,8)+' '+fmtNum(him),t2=L('ты ','you ')+fmtNum(me);x.fillText(t1,7,h/2+.5,w*.58);x.textAlign='right';x.fillStyle=ahead?'#bff5a8':'#fff';x.fillText(t2,w-7,h/2+.5,w*.4);pc=c;return c;}
  function pillXY(g){var top=(window.__safeTop||0)+8;return {x:VIEW.W-12-134,y:top+(g.first?124:g.bb2rc?96:68)};}   /* первый поход: ниже кнопки «Пропустить обучение» */
  BB2.hook('drawTop',function(c,g){var a=g.bb2gl;if(!a||g.over)return;
    if(!pc||g.t-pT>=.5||g.t<pT){pT=g.t;var him=a.at(g.t),k=him+'|'+g.kills;if(k!==pk||!pc){pk=k;pill(a,g.kills,him);}}
    var p=pillXY(g);c.drawImage(pc,p.x,p.y,134,22);});

  /* ---------- конец похода: участие, гостинец ---------- */
  function cap(){var s=sv(),d=day();if((s.d|0)!==d){s.d=d;s.n=0;}return (s.n|0)<(+BB2.n('glove.perDay',3)||0);}
  BB2.hook('end',function(g,win){var s=sv(),a=g.bb2gl;
    if(a&&g.t>=60){g.bb2glR=0;if(cap()){s.n=(s.n|0)+1;g.bb2glR=give(gold(BB2.n('glove.play','s')),'run');}
      try{BB2.ev('glove',{a:'end',me:g.kills,him:a.n,win:g.kills>a.n?1:0});}catch(e){}try{if(BB2.pdv)BB2.pdv('glove');}catch(e){}
      st({a:'end',m:'run',me:g.kills,him:a.n,w:win?1:0,t:Math.round(g.t)});}
    if(s.gs&&!s.gg&&g.t>=60&&(S.runs|0)>=(+BB2.n('glove.guestRuns',1)||1)){s.gg=1;g.bb2glG=give(gold(BB2.n('glove.guest','m')),s.gs==='o'?'obo':'guest');g.bb2glGs=s.gs;}
    if(a||g.bb2glG)save();});

  /* ---------- окно итогов ---------- */
  var CSS='.bb2gl{margin:6px 0;padding:8px 10px;border-radius:12px;background:rgba(122,106,255,.10);border:1.5px solid rgba(122,106,255,.45);text-align:center;font-size:14px;line-height:1.3;color:var(--ink,#3b2412)}'+
    '.bb2gl b{font-weight:900}.bb2gl .gw{color:var(--cGood,#2e7d1e);font-weight:900}.bb2gl .gl{color:var(--cBad,#c0321a);font-weight:900}.bb2gl .gg{color:var(--cGold,#a85c00);font-size:13px;font-weight:700;margin-top:3px}'+
    '.bb2gl .btn{margin:6px auto 0;min-height:44px;padding:6px 14px;font-size:15px;width:auto;display:inline-block}.bb2gl.sm{margin:4px 0 0;padding:0;background:none;border:0}.bb2gl.sm .btn{margin:0;width:100%;min-height:44px;padding:4px 10px;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '#bb2glSh{position:fixed;left:0;right:0;bottom:0;top:0;z-index:60;background:rgba(10,8,20,.55);display:flex;align-items:flex-end;justify-content:center}'+
    '#bb2glSh .panel{width:100%;max-width:430px;border-radius:22px 22px 0 0;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));box-sizing:border-box;text-align:center;border-bottom:0}'+
    '#bb2glSh h3{margin:0 0 4px;font-size:19px;font-weight:900}#bb2glSh p{margin:0 0 10px;font-size:15px}#bb2glSh .btn{display:block;width:100%;margin:6px 0;min-height:46px}'+
    '#bb2glSh input{width:100%;box-sizing:border-box;font-size:12px;padding:8px;border-radius:8px;border:1px solid #b08a5a;margin:4px 0;background:#fff;color:#3b2412}';
  function css(){if(document.getElementById('bb2glCss'))return;var e=document.createElement('style');e.id='bb2glCss';e.textContent=CSS;document.head.appendChild(e);}
  function myGlove(g){var m=g.daily?'d':g.endless?'e':'c',h=0,i;for(i=0;i<HEROES.length;i++)if(HEROES[i].id===g.heroId)h=i;
    return {m:m,c:m==='e'?0:g.chi,h:h,s:m==='d'?day():g.bb2gs|0,t:Math.round(g.t),n:g.kills|0,w:g.win?1:0,k:g.bb2gk||[],nm:nmV||hname(g.heroId)};}
  function canSend(g){return BB2.on('glove')&&canShare()&&g&&g.bb2gk&&!g.weekly&&g.t>=60&&(g.kills|0)>=20&&!g.first&&(g.bb2gs||g.daily);}
  BB2.hook('modal',function(kind,el){if(kind!=='result'||typeof G==='undefined'||!G||!G.over)return;var g=G,a=g.bb2gl,h='';
    if(a){css();var d=g.kills-a.n,dn=Math.abs(d);
      h='<div class="bb2gl">🧤 <b>'+esc(a.nm)+'</b>: '+fmtNum(a.n)+' · <b>'+L('ты','you')+'</b>: '+fmtNum(g.kills)+'<br>'+
        (d>0?'<span class="gw">'+L('Ты впереди на '+fmtNum(dn)+'!','You’re ahead by '+fmtNum(dn)+'!')+'</span>':d===0?'<span class="gw">'+L('Ровно! Ничья.','Exactly even! A draw.')+'</span>':
          '<span class="gl">'+L('Не хватило '+fmtNum(dn)+'. Ещё разок?','Short by '+fmtNum(dn)+'. One more?')+'</span>')+
        (a.alt?'<div class="gg">'+L('У соперника была другая глава — сравнение примерное','Your rival fought a different chapter — rough comparison')+'</div>':'')+
        (g.bb2glR?'<div class="gg">'+L('За вызов: +'+fmtNum(g.bb2glR)+' золота (уже у тебя)','For the challenge: +'+fmtNum(g.bb2glR)+' gold (already yours)')+'</div>':'')+
        (g.bb2glG?'<div class="gg">'+gText(g)+'</div>':'')+
        (d<0&&!g.daily?'<button class="btn gold" data-gl="again">'+L('↻ Ещё раз','↻ Again')+'</button> ':'')+(canSend(g)?'<button class="btn ghost" data-gl="send">'+L('🧤 Ответная перчатка','🧤 Throw one back')+'</button>':'')+'</div>';}
    else if(g.bb2glG){css();h='<div class="bb2gl"><div class="gg" style="font-size:14px">'+gText(g)+'</div></div>';}
    if(!a&&!g.bb2glG&&canSend(g)){css();h+='<div class="bb2gl sm"><button class="btn ghost" data-gl="send">'+L('🧤 Бросить перчатку другу','🧤 Challenge a friend')+'</button></div>';
      if(!shown[g.t]){shown[g.t]=1;st({a:'see',m:'run',n:g.kills});}}
    if(!h)return;var bt=el.querySelector('.btns'),b=a||g.bb2glG||!bt?BB2.put(el,'top',h,'bb2gl'):null,q;
    if(!b){b=el.querySelector('#bb2gl');if(b)b.parentNode.removeChild(b);b=document.createElement('div');b.id='bb2gl';b.className='bb2s';b.innerHTML=h;bt.appendChild(b);}
    var ag=b.querySelector('[data-gl=again]');if(ag)ag.onclick=function(){snd('click');st({a:'again',m:'run',n:a.n});try{hideModal();}catch(e){}a.used=0;goGlove(a);};
    q=b.querySelector('[data-gl=send]');
    if(q)q.onclick=function(){try{snd('click');}catch(e){}st({a:'tap',m:'run',n:g.kills,r:a?1:0});openSheet('run',myGlove(g));};});
  function gText(g){return g.bb2glGs==='o'?L('🏰 Гостинец от заставы Тридевятой обороны: +'+fmtNum(g.bb2glG)+' золота','🏰 A gift from the Thrice-Nine outpost: +'+fmtNum(g.bb2glG)+' gold'):
    L('🎁 Подарок гостю, пришедшему по вызову: +'+fmtNum(g.bb2glG)+' золота','🎁 A gift for coming at a friend’s call: +'+fmtNum(g.bb2glG)+' gold');}
  function snd(k){try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}}

  /* ---------- окно «бросить»: другу / на стену / скопировать ---------- */
  function getName(){if(nmV||!isVK())return Promise.resolve(nmV);
    return vkSend('VKWebAppGetUserInfo',{},4000).then(function(r){nmV=nm2(r&&r.first_name);return nmV;},function(){return '';});}
  function closeSheet(){if(sheet&&sheet.parentNode)sheet.parentNode.removeChild(sheet);sheet=null;}
  function openSheet(m,o){css();closeSheet();getName().then(function(n){if(n)o.nm=n;
    var link=url(m==='zab'?zenc(o.id,o.sc,o.nm):enc(o)),vk=isVK(),
      what=m==='zab'?L('Побьёшь мои '+o.u+'?','Can you beat my '+o.u+'?'):L('Побьёшь мои '+fmtNum(o.n)+' одолённых за '+fmtTime(o.t)+'?','Can you beat my '+fmtNum(o.n)+' monsters in '+fmtTime(o.t)+'?'),
      d=document.createElement('div');d.id='bb2glSh';
    d.innerHTML='<div class="panel"><h3>'+(m==='zab'?L('🧤 Спор богатырей','🧤 A heroes’ wager'):L('🧤 Бросить перчатку','🧤 Throw down the gauntlet'))+'</h3><p>'+esc(what)+'<br>'+L('Друг откроет ссылку — и сразу в бой.','Your friend opens the link and jumps straight in.')+'</p>'+
      (vk?'<button class="btn gold big" data-k="dm">'+L('✉️ Отправить другу','✉️ Send to a friend')+'</button><button class="btn" data-k="wall">'+L('📜 Похвастаться на стене','📜 Post on my wall')+'</button>':
        '<input readonly value="'+esc(link)+'"><button class="btn gold big" data-k="copy">'+L('📋 Скопировать ссылку','📋 Copy link')+'</button>')+
      '<button class="btn ghost" data-k="no">'+L('Не сейчас','Not now')+'</button></div>';
    document.body.appendChild(d);sheet=d;
    var done=function(k){sv().s=(sv().s|0)+1;save();st({a:k,m:m,len:link.length});closeSheet();toast(L('Перчатка брошена!','Gauntlet thrown!'));};
    d.onclick=function(e){if(e.target===d){closeSheet();}};
    d.querySelector('[data-k=no]').onclick=function(){snd('click');st({a:'no',m:m});closeSheet();};
    var b=d.querySelector('[data-k=dm]');if(b)b.onclick=function(){snd('click');vkSend('VKWebAppShare',{link:link},60000).then(function(){done('sent');},function(){st({a:'no',m:m,r:'dm'});});};
    b=d.querySelector('[data-k=wall]');if(b)b.onclick=function(){snd('click');vkSend('VKWebAppShowWallPostBox',{message:wallText(m,o),attachments:link},60000).then(function(){done('wall');},function(){st({a:'no',m:m,r:'wall'});});};
    b=d.querySelector('[data-k=copy]');if(b)b.onclick=function(){snd('click');var i=d.querySelector('input');try{i.select();}catch(e){}
      var ok=function(){done('copy');};try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(link).then(ok,function(){try{document.execCommand('copy');}catch(e){}ok();});return;}}catch(e){}try{document.execCommand('copy');}catch(e){}ok();};});}
  function wallText(m,o){return m==='zab'?'🧤 '+o.u+' в забаве «'+o.zn+'» — побьёшь? «Богатырь против нечисти»': // i18n:ru — стена VK (только русский)
    '🧤 '+fmtNum(o.n)+' нечисти за '+fmtTime(o.t)+(o.m==='e'?' в Бесконечной сече':o.m==='d'?' в Походе дня':' в главе «'+chName(o.c)+'»')+'. Бросаю перчатку — побьёшь? «Богатырь против нечисти»';} // i18n:ru — стена VK (только русский)

  /* ---------- «Спор богатырей»: кнопка в итогах забавы ---------- */
  BB2.hook('zab',function(e){if(!BB2.on('chal')||!canShare()||!e||!(e.sc>0))return;
    setTimeout(function(){var v=document.querySelectorAll('#zabHost .zabVeil'),w=v.length?v[v.length-1]:null,box=w&&w.querySelector('.zrB2');if(!box||w.querySelector('[data-gl]'))return;
      var u='';try{u=ZREC.unit(e.id,e.sc);}catch(x){u=fmtNum(e.sc);}var zn='';try{zn=zabName(ZAB.by[e.id]);}catch(x){}
      var b=document.createElement('button');b.className='btn ghost';b.setAttribute('data-gl','zab');b.textContent=L('🧤 Позвать друга побить ','🧤 Dare a friend to beat ')+u;
      b.style.cssText='width:100%;min-height:44px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';box.parentNode.insertBefore(b,box.nextSibling);var fits=function(){var P=b.closest&&b.closest('.zrP'),r=b.getBoundingClientRect().bottom;return r<=(window.innerHeight||9999)-2&&!(P&&P.scrollHeight>P.clientHeight+2);};if(!fits()){b.parentNode.removeChild(b);return;}setTimeout(function(){if(b.parentNode&&!fits())b.parentNode.removeChild(b);},400); /* MERGE: и окно рамки не должно прокручиваться (строки других потоков приходят позже) */   /* низкий экран — не выталкиваем «Хватит» за край */
      st({a:'see',m:'zab',id:e.id});
      b.onclick=function(){snd('click');st({a:'tap',m:'zab',id:e.id});openSheet('zab',{id:e.id,sc:e.sc,u:u,zn:String(zn).replace(/<[^>]*>/g,''),nm:nmV});};},0);});

  /* ---------- вход по ссылке ---------- */
  function bestCh(slot){var i,last=ORD[0];try{if(CH[slot]&&chOpen(slot))return slot;for(i=0;i<ORD.length;i++)if(CH[ORD[i]]&&chOpen(ORD[i]))last=ORD[i];}catch(e){}return last;}
  function used(id){var u=sv().u||[];return u.indexOf(id)>=0;}
  function markUsed(id){var s=sv(),u=s.u||[];if(u.indexOf(id)<0)u.push(id);s.u=u.slice(-6);save();}
  function arm(a){var ch=a.m==='e'?0:bestCh(a.c);a.alt=a.m==='c'&&ch!==a.c||a.m==='d'&&ch!==a.c?1:0;a.ch=ch;A=a;return a;}
  function goGlove(a){markUsed(a.id);arm(a);var hero0=S.hero,h=HERO_BY[a.hero];if(h&&heroOpen(h))S.hero=a.hero;
    try{if(a.m==='d'&&a.s===day()&&drOpen()){a.alt=0;BB2.go(0,false,false,dailyDef());}else if(a.m==='e'&&endOpen())BB2.go(0,true);else BB2.go(a.ch);}
    finally{if(S.hero!==hero0){var back=hero0;BB2.hook('end',function(){if(back){S.hero=back;back='';}});}}}
  function invite(a){css();var d=document.createElement('div');d.id='bb2glSh';
    var where=a.m==='e'?L('Бесконечная сеча','Endless Battle'):a.m==='d'?L('Поход дня','Daily Run'):L('глава «','chapter “')+chName(a.c)+L('»','”');
    d.innerHTML='<div class="panel"><h3>🧤 '+esc(a.nm)+L(' бросает тебе перчатку!',' throws down the gauntlet!')+'</h3><p>'+L('Счёт: <b>'+fmtNum(a.n)+'</b> одолённых за '+fmtTime(a.t),'Score: <b>'+fmtNum(a.n)+'</b> monsters in '+fmtTime(a.t))+
      '<br><small>'+esc(where)+(hname(a.hero)?' · '+esc(hname(a.hero)):'')+'</small></p><button class="btn gold big" data-k="go">'+L('⚔️ Принять вызов','⚔️ Accept')+'</button><button class="btn ghost" data-k="no">'+L('Потом','Later')+'</button></div>';
    document.body.appendChild(d);sheet=d;st({a:'in',m:'run',c:a.c,n:a.n,f:0});
    d.querySelector('[data-k=go]').onclick=function(){snd('click');closeSheet();try{hideModal();}catch(e){}goGlove(a);};
    d.querySelector('[data-k=no]').onclick=function(){snd('click');markUsed(a.id);st({a:'no',m:'in'});closeSheet();};}
  function zabIn(z){markUsed(z.hid);st({a:'in',m:'zab',id:z.id,f:S.runs?0:1});
    var fin=function(){X.z=0;if(!S.runs&&!G){toast(L('А теперь — в поход!','And now — into battle!'));try{firstGo=true;}catch(e){}BB2.go(0);}};
    try{ZREC.play(z.id,{src:'link',vs:{n:z.nm,sc:z.sc},back:function(){st({a:'end',m:'zab',id:z.id});fin();},onQuit:function(){st({a:'no',m:'zab',id:z.id});fin();}}).then(null,function(){fin();});}catch(e){fin();}}
  function onReady(){if(onReady.d)return;onReady.d=1;var s=sv();
    if(X.h&&X.h.charAt(0)==='z'){var z=zdec(X.h);if(!z||used(z.hid)){X.z=0;if(!S.runs&&!G)BB2.go(0);return;}if(!S.runs&&!s.gs)s.gs='z';zabIn(z);return;}
    if(X.o===1&&S.runs&&!(s.w&2)){s.w=(s.w|0)|2;save();st({a:'in',m:'obo',f:0});setTimeout(function(){toast(L('Воевода Тридевятой обороны — добро пожаловать к богатырям!','Commander of the Thrice-Nine Defense — welcome among the heroes!'));},900);}
    if(X.h&&X.h.charAt(0)==='g'&&S.runs){var a=dec(X.h);if(a&&!used(a.id))setTimeout(function(){if(!G)invite(a);},700);}}
  /* сразу при загрузке: новичок по перчатке — вызов прицепляется к его первому походу; гость из Обороны — запомнить */
  (function(){var s=sv(),a;
    if(X.o&&!S.runs&&!s.gs){s.gs='o';st({a:'in',m:'obo',f:1,k:X.o});}
    if(X.h&&X.h.charAt(0)==='g'&&!S.runs){a=dec(X.h);if(a&&!used(a.id)){if(!s.gs)s.gs='g';markUsed(a.id);arm(a);st({a:'in',m:'run',c:a.c,n:a.n,f:1});
      if(typeof G!=='undefined'&&G&&!G.over&&G.t<30&&!G.bb2gl){A=null;G.bb2gl=a;if(G.rng==null){G.rng=mulberry(a.s|0);G.bb2gs=a.s;}sv().p=(sv().p|0)+1;st({a:'go',m:'run',c:G.chi,n:a.n,f:1});}}}
    if(X.r)onReady();else BB2.hook('ready',onReady);})();

  BB2.glove={ok:1,link:function(g){return url(enc(myGlove(g||G)));},parse:function(h){return h&&h.charAt(0)==='z'?zdec(h):dec(h);},enc:enc,zenc:zenc,
    cur:function(){return typeof G!=='undefined'&&G&&G.bb2gl||null;},sheet:openSheet};
})();
