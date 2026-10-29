/* ===== bb2-rp-run.js — REPLAY «Запись похода» и «Тень» (супер-буст в2, 14.10.2026). Набор догрузки 'rp' (BB2.need в начале каждого похода; в меню — BB2.after('rp',fn) догрузит сам).
   ДОГОВОР ЗАПИСИ (для TAIL, GLOVE, NOVICE, VKT). Флаги: 'rec' — запись идёт (заглушка js/bb2-rp.js); 'ghost' — тень видна в бою.
   ЧТО ТАКОЕ ЗАПИСЬ. Не пересчёт боя: бой зависит от шага кадра (dt = время кадра) и Math.random в десятках мест — на телефоне и ПК один и тот же ввод даёт
   разный бой. Поэтому пишем то, что было: путь богатыря и счёт каждые 0,5 с ВРЕМЕНИ ПОХОДА (G.t, пауза не идёт) → тень проигрывается одинаково на любом устройстве.
   Тень — «бегущий рядом», нечисть она не бьёт и на бой не влияет.
   ХРАНЕНИЕ: localStorage 'bb2rp' (не в S и не в облаке): по каждому ключу похода — последняя (l) и лучшая по счёту (b), не больше 10 ключей (~1 КБ на 3 мин похода);
   поход короче 20 с не пишется, длиннее 15 мин — обрезается. S.bb2.rp — только счётчик {n}.
   Запись rec = {k:ключ, h:герой, d:день, t:секунд, n:одолел, w:1 победа, v:уровень, s:строка пути} (s: 3 знака на 0,5 с — dx,dy шагом 6 px и прирост счёта).
   ВЫЗОВЫ (после догрузки: BB2.after('rp',function(){…}); BB2.rp.key/cur есть сразу):
     BB2.rp.key(G)            → ключ похода: место+сложность ('12n') — как у TAIL; «Поход дня» — 'D'+глава; бесконечный/неделя — 'E'.
     BB2.rp.last(ключ) / BB2.rp.best(ключ) → запись или null.   BB2.rp.cur() → запись идущего похода (то, что уже записано, без t/n).
     BB2.rp.at(rec,t)         → {x,y,n} — где была тень и сколько одолела к секунде t (между точками — плавно).
     BB2.rp.pack(rec[,1])     → строка для ссылки/Челобитной (латиница, цифры, '-', '_', '.'); с 1 — короткая: только счёт по 10 с (2 знака на 10 с, ~80 знаков за 5 минут, без пути).
     BB2.rp.unpack(строка)    → запись или null (из короткой — без пути: тень только по счёту, рисуется стоящей рядом не будет).
     BB2.rp.ghost(rec,{nm:'Имя',c:'#цвет',src:'glove'}) → показать тень в ИДУЩЕМ походе (звать в крючке 'run' с очередью > 0 или позже); null — убрать.
   САМ: на крючок TAIL 'raceGhost'(ключ,G) отвечает {at(t)→счёт, total, rec} по лучшей записи ключа и показывает тень «Вчерашний ты».
        В первом походе новичка (G.first) — «Тень-наставник»: Илья Муромец (запись бота, MENTOR ниже) первые 2 минуты; его движение показывается РЯДОМ с игроком
        (путь минус среднее за ±3 с), чтобы был виден приём «обходи кругом». Любая тень, убежавшая за край, стоит у края экрана бледнее.
   Событие шины после записи: BB2.hook('rpEnd',function(rec,G){}). Статистика: 'rp' {c,t,n,w,v,f,sd} — сводка каждого похода (sd — семя «Похода дня»); 'ghost' {a:'show',src}. */
(function(){
  var R=BB2.rp,A=R.A,Q=R.Q,LS='bb2rp',gh=null,img=null;
  function ld(){try{var a=JSON.parse(localStorage.getItem(LS)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
  function sv(a){try{localStorage.setItem(LS,JSON.stringify(a));}catch(e){}}
  function get(k,w){var a=ld(),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].r&&a[i].k===k&&a[i].q===w)return a[i].r;return null;}
  R.last=function(k){return get(k,'l');};R.best=function(k){return get(k,'b');};
  function dec(r){if(r._a)return r._a;var s=r.s||'',X=[0],Y=[0],K=[0],i,x=0,y=0,n=0,o;
    for(i=0;i+2<s.length;i+=3){x+=(A.indexOf(s[i])-32)*Q;y+=(A.indexOf(s[i+1])-32)*Q;n+=Math.max(0,A.indexOf(s[i+2]));X.push(x);Y.push(y);K.push(n);}
    if(r.c){K=[0];n=0;for(i=0;i<r.c.length;i++)K.push(n+=r.c[i]);}
    o={X:X,Y:Y,K:K,st:r.c?10:.5};try{Object.defineProperty(r,'_a',{value:o,enumerable:false});}catch(e){}return o;}
  R.at=function(r,t){var a=dec(r),f=Math.max(0,t)/a.st,i=Math.floor(f),u=f-i;
    function ip(v){var m=v.length-1;if(i>=m)return v[m]||0;return v[i]+(v[i+1]-v[i])*u;}
    return {x:ip(a.X),y:ip(a.Y),n:ip(a.K)};};
  R.pack=function(r,sh){var b=[r.k,r.h,r.t|0,r.n|0,r.w?1:0,r.v|0].join('.');if(!sh)return b+'.'+(r.s||'');
    var c='',p=0,t,z;for(t=10;t<r.t+10&&t<1300;t+=10){z=Math.max(0,Math.min(4095,Math.round(R.at(r,t).n)-p));c+=A[z>>6]+A[z&63];p+=z;}return b+'..'+c;};
  R.unpack=function(s){var a=String(s||'').split('.'),r,i;if(a.length<7||a.length>8||!/^[\w-]*$/.test(a[6]+(a[7]||'')))return null;
    r={k:a[0],h:a[1],t:+a[2]||0,n:+a[3]||0,w:+a[4]?1:0,v:+a[5]||0,s:a[6]};
    if(a.length===8){r.s='';r.c=[];for(i=0;i+1<a[7].length;i+=2)r.c.push(Math.max(0,A.indexOf(a[7][i])*64+A.indexOf(a[7][i+1])));}return r;};
  R.ghost=function(r,o){gh=r?{r:r,o:o||{}}:null;img=null;if(gh)BB2.stat('ghost',{a:'show',src:gh.o.src||'?'});};
  R.gh=function(){return gh;};R.gh0=function(){gh=null;img=null;};
  R.fin=function(r,g){var a,b,s;r.d=typeof dayKey==='function'?dayKey():'';
    a=ld().filter(function(x){return x&&x.r&&!(x.k===r.k&&x.q==='l');});b=get(r.k,'b');
    if(!b||r.n>b.n){a=a.filter(function(x){return !(x.k===r.k&&x.q==='b');});a.unshift({k:r.k,q:'b',r:r});}
    a.unshift({k:r.k,q:'l',r:r});s={};a=a.filter(function(x){s[x.k]=1;return Object.keys(s).length<=10;});sv(a);
    var o=BB2.s('rp');o.n=(o.n|0)+1;
    BB2.stat('rp',{c:g.chi,t:r.t,n:r.n,w:r.w,v:r.v,f:g.first?1:0,sd:g.daily&&g.daily.seed!=null?String(g.daily.seed):''});BB2.ev('rpEnd',r,g);};

  /* «Вчерашний ты» для Гонки TAIL: тень = лучшая запись этого места */
  BB2.hook('raceGhost',function(k,g){var r=R.best(k);if(!r)return;if(BB2.on('ghost'))R.ghost(r,{nm:L('Вчерашний ты','Yesterday you'),src:'race'});
    return {at:function(t){return R.at(r,t).n;},total:r.n,rec:r};});

  /* «Тень-наставник»: первый поход новичка. Запись бота (REPLAY-tools/mentor.py), Илья обходит толпу кругом. */
  var MENTOR='0n.ily.112.284.1.14.ggAggAggAgWAgeAhqApcApdAjcBoaAnaAliAnlAliAkiAjiAjiAneAobAkfAiiAojAplAloAgpAcoAaoAYmAbnAgkAhjAgkAZlAelBgnAXlAXkAaiAdiAdhAchAdhAdhAgoAbbAagBefAdhAdhAflAhnAdhAbfBciAZkCYcAWhAhnDgpAioAloAomAgmAcjAllAmlDXiBaoCgkBpkAcgBanAXiBXiAWhAWgAXeAYjAboAdpAhqAhqAgoAnmAloChmDpjBnnAomAolAnfAoeAobApcAoeBlYAlYAkXAjXAeXAncApdAiXBdXAiYCjWAdaAiZAcYBXbBkXAcYAXcAXdAWfAXgAXgBXkAalCZmAXiCboAcpAXhBamAbnBYiAXcCXcAXeAagAanAYkCWhAanAeqBbnAgqBipAkoAomAloDloCdpAdoDZnAgpAbmCamAdmEZiAcnHWfDYjBXeIYlBbnVagObpCepEXhBXfEXjPZZCYaCaaMcYFbYEbZAfXGgXAYiElfCckAYlFfmCimHbjGYcAemDiiBmeElYFidBecDflBZgFgoEZaCUkBkjAipIjoAhgEehAhnFmmGplAokHoiCgmAgjEhuFfcApcAohBkbEghEofDjdBlaAjaAkXBkfCgfAnWCleAifAbiAZfAYbAXbAYbA'; /*MENTOR: первый поход ботом героем ily, лучший из 6 (REPLAY-tools/t_live.py mentor)*/
  var MT=120; /* сколько секунд наставник идёт рядом */
  function mentor(g){if(!g||!g.first||gh||!MENTOR||!BB2.on('ghost')||g.over)return;R.ghost(R.unpack(MENTOR),{nm:L('Илья Муромец','Ilya Muromets'),src:'mentor',end:MT,near:1});}
  BB2.hook('run',mentor,60);
  if(typeof G!=='undefined'&&G&&!G.over)mentor(G); /* догрузились посреди первого похода */

  /* рисование: заранее нарисованное имя + готовый спрайт героя полупрозрачно; ни текста на кадр, ни градиентов */
  function label(t,col){var d=Math.min(2,window.devicePixelRatio||1),w=96,h=16,c=mkCanvas(w*d,h*d),x=c.getContext('2d');x.scale(d,d);
    x.fillStyle='rgba(20,16,30,.55)';x.beginPath();if(x.roundRect)x.roundRect(0,0,w,h,8);else x.rect(0,0,w,h);x.fill();
    x.font='600 11px '+(typeof FONT==='string'?FONT:'system-ui,sans-serif');x.textAlign='center';x.textBaseline='middle';x.fillStyle=col||'#cfe6ff';x.fillText(t,w/2,h/2+.5);return c;}
  BB2.hook('draw',function(c,g){if(!gh||!BB2.on('ghost')||g.over||g.win)return;var r=gh.r,o=gh.o,end=o.end||r.t+3,t0=0;if(!r.s||g.t>end)return;
    if(o.src==='mentor'&&BB2.on('fstg')){t0=Math.min(g.nvMv!=null?g.nvMv+1:6,6);if(g.t<t0)return;} /* BG-FIRST 29.10: наставник не загораживает богатыря в первые секунды — выходит после первого шага игрока или с 6 с; ?bb2=-fstg */
    var p=R.at(r,g.t),q=R.at(r,g.t+.25),al=.42*Math.min(1,(end-g.t)/3,(g.t-t0)/1.5),Hh=g.hero,i,m,mx=0,my=0;if(al<=.02)return;
    if(o.near){for(i=-3;i<=3;i++){m=R.at(r,g.t+i);mx+=m.x/7;my+=m.y/7;}p={x:Hh.x+64+p.x-mx,y:Hh.y+8+p.y-my};q={x:Hh.x+64+q.x-mx,y:Hh.y+8+q.y-my};} /* наставник: его движение рядом с игроком */
    var ex=VIEW.ww-28,ey=VIEW.wh-48,cx=Math.max(VIEW.cx-ex,Math.min(VIEW.cx+ex,p.x)),cy=Math.max(VIEW.cy-ey,Math.min(VIEW.cy+ey,p.y));
    if(cx!==p.x||cy!==p.y){q={x:q.x-p.x+cx,y:q.y-p.y+cy};p={x:cx,y:cy};al*=.7;} /* убежала за край — держим у края экрана */
    var mv=Math.abs(q.x-p.x)+Math.abs(q.y-p.y)>2,fr=mv?Math.floor(g.t*6)&1:0,fl=q.x<p.x-1?-1:1;
    drawSpr('h_'+(HERO_BY&&HERO_BY[r.h]?r.h:'ily')+'_'+fr,p.x,p.y,fl,1,false,0,al);
    if(!img)img=label(o.nm||L('Тень','Ghost'),o.c);var B=VIEW.B;
    c.setTransform(1,0,0,1,0,0);c.globalAlpha=Math.min(1,al*2);c.drawImage(img,(p.x-VIEW.cx)*B+cv.width/2-48*VIEW.dpr,(p.y-VIEW.cy)*B+cv.height/2-44*B-16*VIEW.dpr,96*VIEW.dpr,16*VIEW.dpr);c.globalAlpha=1;});
})();
