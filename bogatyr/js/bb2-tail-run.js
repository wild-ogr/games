/* ===== bb2-tail-run.js — поток TAIL (супер-буст в2): «хвост для быстрых». Догружается набором 'tail' (заглушка и описание сохранения — js/bb2-tail.js).
   1) «Зароки» (флаг vow): 12 усложнений по выбору, каждое даёт черепа; рекорд черепов по главе, дорожка наград (украшения + немного золота, силы нет).
   2) «Лихая неделя» (lih): три пройденные главы с правилом недели, свои звёзды (победа / без падений / быстро), сундуки на 3, 6 и 9 звёзд.
   3) «Гонка со вчерашним собой» (race): полоска в бою «впереди на 34» против своего лучшего похода в этой главе.
   4) «Калинов мост» (most): башня, сезон 4 недели; поход = пролёт из 5 этажей (4 по 90 с с правилом + этаж-босс), привал каждые 5 этажей.
   5) «Подвиги героев» (hq): по 5 заданий на каждого из 9 богатырей, считаются сами в обычных походах этим богатырём.
   Все правила — через готовый G.wk (множители Испытания недели): зарок и этаж моста складывают множители. Числа — BB2.n('tail.*') из договора bb2-eco.js.
   Для других потоков: G.bb2vow (черепа), G.bb2lih, G.bb2most; события шины: 'raceGhost'(ключ,G) → {at(t),total} — честная тень от REPLAY (один вызов), 'raceEnd'({key,kills,win,a}),
     'heroQuest'({hero,n,all}) — подвиг героя выполнен (all:1 — все пять: HERO выдаёт «свой приём»/облик). BB2.tail.hqDone(hero) → сколько из 5.
   STAT: vow {a:run|win|lose|set,n,c} · mod {m:'lih',a:run|star|chest,n} · race {a:new|win|lose,d} · most {a:run|floor|boss|die,n} · hq {a:done,h,n} · tl {a:open,k}.
   Сохранение S.bb2.tail (пара fix+merge — в заглушке js/bb2-tail.js; поля — только когда есть что хранить; нет поля = «как у новичка»):
     v:{слот главы: рекорд черепов} · vc: выдано ступеней дорожки черепов · vl:'acd' — выбранные зароки (буквы)
     l:{w: неделя, c:[3 слота глав], s:[3 набора звёзд битами 1 победа|2 без падений|4 быстро], g: сундуки битами} · ln: недель на 9 звёзд · ls: лихих звёзд всего
     r:[[ключ 'слот+сложность','строка шагов'],…] — «тени» Гонки, не больше 8 глав · rd: день награды Гонки · rn: побед в Гонке
     m:{s: сезон, f: лучший этаж, t: до какого этажа выданы награды} · mb: лучший этаж за все сезоны · h:{богатырь: биты подвигов} · ts
   Старый синтаксис: без ?. ?? .finally */
(function(){
  if(typeof BB2!=='object'||!BB2||BB2.tail)return;
  var T={ok:1},PEND=null,ob=BB2.ob;
  BB2.tail=T;
  function on(f){return BB2.on(f);}
  function sv(){return BB2.s('tail');}
  function N(p,d){return BB2.n('tail.'+p,d);}
  function keep(){sv().ts=Math.floor(nowMs()/1000);try{save();}catch(e){}}
  function stat(n,o){BB2.stat(n,o);}
  function el(id){return document.getElementById(id);}
  function doneList(){var a=[],i;for(i=0;i<ORD.length;i++)if(S.done[ORD[i]])a.push(ORD[i]);return a;}
  function isOpen(){return doneList().length>=N('openCh',3);}
  function band(){var b=BB2.n('base.band',[3,18]),n=doneList().length;return n<=b[0]?0:n<=b[1]?1:2;}
  function rw(k){if(typeof k==='number')return k;var m={s:'small',m:'mid',b:'big'}[k]||'small',d={small:[70,200,650],mid:[350,950,3200],big:[1400,3800,12800]}[m];return BB2.n('base.'+m,d)[band()];}
  function pay(g,src){g=Math.round(g);if(g>0){S.gold+=g;ern(src||'quest',g);}return g;}
  function tro(chi,n){try{if(n>0&&typeof TRO_ADD==='function'&&typeof troOfSlot==='function'&&troOfSlot(chi)){TRO_ADD(troOfSlot(chi),n);return n;}}catch(e){}return 0;}
  function slv(){try{return typeof SL==='function'?SL():null;}catch(e){return null;}}
  function camp(g){return !g.endless&&!g.daily&&!g.weekly;}
  function bits(n){var c=0;while(n){c+=n&1;n>>=1;}return c;}
  function res(g){return g.bb2res||(g.bb2res={});}
  function LL(a){return L(a[0],a[1]);}

  /* облики-награды (только красота): перекраска рисунка богатыря, новых рисунков нет. Рисунок регистрируем сами — как облики меты */
  function skin(id,hero,n,pal,src){try{if(typeof SKINS==='undefined'||typeof HERO_ART==='undefined'||!HERO_ART[hero])return;var k=hero+'@'+id,h=Object.assign({},HERO_ART[hero],pal),o={id:id,hero:hero,pal:pal};
    Object.defineProperty(o,'name',{get:function(){return LL(n);},enumerable:true});Object.defineProperty(o,'src',{get:function(){return LL(src);},enumerable:true});SKINS.push(o);
    art('h_'+k+'_0',80,function(g){drawHero(g,h,0);});art('h_'+k+'_1',80,function(g){drawHero(g,h,1);});art('hp_'+k,66,function(g){g.translate(0,3);drawHero(g,h,0);});}catch(e){console.warn('tail skin',e);}}
  if(on('vow')){skin('vow','dob',['Зарочный витязь','Vowed Knight'],{body:'#3a3340',cloak:'#7a1420',helm:'#d8d2c0',rim:'#f2ead0',beard:'#2a2a2a'},['дорожка зароков: 50 черепов','vow track: 50 skulls']); /* i18n:ru — пары [рус, англ], перевод рядом */
    skin('vow','ily',['Калёный богатырь','Tempered Hero'],{body:'#5a5f6e',cloak:'#1c2030',helm:'#aab4c8',rim:'#e8f0ff',beard:'#c8c8c8'},['дорожка зароков: 200 черепов','vow track: 200 skulls']);} /* i18n:ru — пары [рус, англ], перевод рядом */
  if(on('most'))skin('most','mar',['Страж Калинова моста','Kalinov Bridge Guard'],{body:'#8a1a1a',cloak:'#2a1010',helm:'#ff9a3a',rim:'#ffd84a'},['Калинов мост: 50-й этаж за сезон','Kalinov Bridge: floor 50 in a season']); /* i18n:ru — пары [рус, англ], перевод рядом */
  /* «Подвиги» (EVENT): Боян может дать задание на зарок, лихую звезду, гонку */
  function toMap(){try{openTab('Map');}catch(e){}}
  if(typeof BB2.pdvDef==='function'){
    BB2.pdvDef({id:'tlvow',key:'vow',s:2,n:[1,1,2],t:function(n){return n>1?L('Победи с зароком: '+n+' раза','Win with a vow: '+n+' times'):L('Победи в походе с зароком','Win a run with a vow');},ok:function(){return on('vow')&&isOpen();},go:toMap});
    BB2.pdvDef({id:'tllih',key:'lih',s:2,n:[1,2,3],t:function(n){return L('Добудь лихих звёзд: '+n,'Earn Wild Week stars: '+n);},ok:function(){return on('lih')&&isOpen();},go:function(){toMap();openLih();}});
    BB2.pdvDef({id:'tlrace',key:'race',s:2,n:[1,1,1],t:function(){return L('Обгони вчерашнего себя в Гонке','Beat yesterday’s you in the Race');},ok:function(){return on('race')&&isOpen();},go:toMap});}

  /* ---------- общее: сложение правил, смена сложности, слепок кампании ---------- */
  var MULK={espd:1,ehp:1,esz:1,exp:1,spawn:1,cap:1,hp:1,might:1,cd:1,gold:1};
  function mix(list){var m={},i,k,x;for(i=0;i<list.length;i++){x=list[i];if(!x)continue;for(k in x){if(MULK[k])m[k]=(m[k]||1)*x[k];else if(k==='armor'||k==='amount')m[k]=(m[k]||0)+x[k];else m[k]=x[k];}}return m;}
  function applyWk(g,m,first){g.wk=m;if(m.oneLife){g.revives=0;g.adRevive=false;}
    if(first&&m.only&&WEAPONS[m.only])g.weapons=[{id:m.only,lvl:1,t:.3,a:0}];
    if(first)g.st=null;computeStats();if(first)g.hero.hp=g.st.maxHp;g.hpLock=g.hero.hp;}
  function setDif(g,d){g.dif=d;g.df=difProf(g.chi,d);g.rep=d==='n'&&difWon(g.chi,'n');g.curse=0;g.pity=0;g.nov=0;g.novHeal=0;g.emD=1;g.soft=d!=='n'&&g.chi===1&&typeof CH2_SOFT!=='undefined'?CH2_SOFT:null;}
  /* поход Лихой недели и моста идёт «как глава», но следов в кампании не оставляет: звёзды, «боевой дух», лучшее время, счёт поражений Логова — как были */
  function snap(g){var st={},p=['','s','h'],i,j,k;for(i=0;i<p.length;i++)for(j=0;j<STAR_K.length;j++){k=g.chi+p[i]+STAR_K[j];st[k]=S.stars&&S.stars[k]?1:0;}
    g.bb2snap={st:st,pity:S.pity?JSON.stringify(S.pity):'',best:S.best[g.chi],lair:S.lairL&&typeof S.lairL==='object'?S.lairL[g.chi]:undefined};}
  function unsnap(g){var q=g.bb2snap,k;if(!q)return;g.bb2snap=null;
    for(k in q.st){if(q.st[k])S.stars[k]=1;else delete S.stars[k];}
    try{S.pity=q.pity?JSON.parse(q.pity):null;}catch(e){S.pity=null;}
    if(q.best===undefined)delete S.best[g.chi];else S.best[g.chi]=q.best;
    if(S.lairL&&typeof S.lairL==='object'){if(q.lair===undefined)delete S.lairL[g.chi];else S.lairL[g.chi]=q.lair;}
    g.starNew=0;g.difUp='';}
  /* плашка в бою — готовой картинкой (рисуется заново, только когда меняется текст; на кадр — один drawImage) */
  function pill(txt,col){var d=Math.min(2,window.devicePixelRatio||1),w=112,h=18,c=mkCanvas(w*d,h*d),x=c.getContext('2d');x.scale(d,d);
    x.fillStyle='rgba(20,16,30,.62)';rr(x,.5,.5,w-1,h-1,9);x.fill();x.font='800 12px '+(typeof CVL!=='undefined'&&CVL.font||'sans-serif');x.textAlign='center';x.textBaseline='middle';x.fillStyle=col||'#fff';x.fillText(txt,w/2,h/2+.5,w-8);return c;}
  function pillDraw(c,img){var top=(window.__safeTop||0)+8;c.drawImage(img,VIEW.W/2-56,top+62,112,18);}

  /* =====================================================================================================================
     1. ЗАРОКИ
     ===================================================================================================================== */
  var VOWS=[
    {id:'a',sk:2,e:'🍞',n:['Голодный зарок','Hungry vow'],d:['Ни пирожков, ни живой воды — лечиться нельзя','No pies, no healing water'],mod:{noHeal:1}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'b',sk:2,e:'💔',n:['Одна жизнь','One life'],d:['Без «Подняться» и без знахарки','No revives at all'],mod:{oneLife:1}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'c',sk:2,e:'💨',n:['Нечисть торопится','Monsters in a hurry'],d:['Бегает в 1,4 раза быстрее','They run 1.4× faster'],mod:{espd:1.4}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'d',sk:3,e:'🗿',n:['Великаны','Giants'],d:['Нечисть крупнее и втрое крепче','Bigger and 3× tougher'],mod:{esz:1.4,ehp:3}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'e',sk:3,e:'🌑',n:['Тьма тьмущая','A whole horde'],d:['Нечисти вдвое больше','Twice as many monsters'],mod:function(){return qLow()?{spawn:1.5,cap:1.3}:{spawn:2,cap:1.5};}}, /* слабый телефон: толпа ×1,3, а не ×1,5 (02 §6) */ /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'f',sk:1,e:'🎲',n:['Что дали — то бери','Take what you get'],d:['Без перебора и изгнания карточек','No rerolls, no banishing'],x:'norr'}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'g',sk:1,e:'😠',n:['Злая нечисть','Angry monsters'],d:['Бьёт на треть больнее','Hits a third harder'],x:'dmg'}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'h',sk:3,e:'😡',n:['Ярый босс','Raging boss'],d:['Босс в полтора раза крепче и бьёт больнее','Boss is 1.5× tougher and hits harder'],x:'boss'}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'i',sk:2,e:'🥛',n:['Стеклянный богатырь','Glass hero'],d:['У богатыря половина здоровья','Half health'],mod:{hp:.5}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'j',sk:1,e:'✋',n:['Четыре гнезда','Four slots'],d:['Только 4 оружия вместо 6','Only 4 weapons instead of 6'],x:'w4'}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'k',sk:1,e:'🌫️',n:['Туман','Fog'],d:['Видно только рядом с богатырём','You see only what is near'],x:'fog'}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'l',sk:2,e:'🤐',n:['Без дара','No Power'],d:['Дар богатыря молчит весь поход','The hero’s Power stays silent'],x:'nodar'}],VBY={}; /* i18n:ru — пары [рус, англ], перевод рядом */
  (function(){for(var i=0;i<VOWS.length;i++)VBY[VOWS[i].id]=VOWS[i];})();
  /* дорожка черепов: украшения (силы не дают); золото — каждые tail.trackGoldEvery черепов */
  var TRK=[[25,'🖼️',['рамка «Костяная»','“Bone” frame']],[50,'👕',['облик Добрыни «Зарочный витязь»','Dobrynya outfit “Vowed Knight”'],'dob@vow'],[100,'🏷️',['звание «Несгибаемый»','title “Unbending”']], /* i18n:ru — пары [рус, англ], перевод рядом */
    [200,'👕',['облик Ильи «Калёный богатырь»','Ilya outfit “Tempered Hero”'],'ily@vow'],[400,'👑',['звание «Былинный зарочник»','title “Epic Vow-keeper”']]]; /* i18n:ru — пары [рус, англ], перевод рядом */
  function vowSel(){var s=sv().vl||'',a=[],i;for(i=0;i<s.length;i++)if(VBY[s.charAt(i)]&&a.indexOf(s.charAt(i))<0)a.push(s.charAt(i));return a;}
  function vowSk(a){var n=0,i;for(i=0;i<a.length;i++)n+=VBY[a[i]].sk;return n;}
  function vowK(n){return Math.min(N('goldCap',.6),N('skullGold',.08)*n);}
  function vowTotal(){var v=sv().v,n=0,k;if(v)for(k in v)n+=v[k]|0;return n;}
  function vowTitle(){var t=vowTotal();return t>=400?L('Былинный зарочник','Epic Vow-keeper'):t>=100?L('Несгибаемый','Unbending'):'';}
  function vowNext(t){for(var i=0;i<TRK.length;i++)if(TRK[i][0]>t)return TRK[i];return null;}
  T.vowTotal=vowTotal;T.vowTitle=vowTitle;T.vowFrame=function(){return vowTotal()>=25;};
  function trackPay(){var s=sv(),t=vowTotal(),ev=Math.max(1,N('trackGoldEvery',25)),st=Math.floor(Math.min(t,N('track',400))/ev),g=0,it=[],i,k;
    while((s.vc|0)<st){s.vc=(s.vc|0)+1;g+=pay(rw(N('trackGold','m')),'quest');}
    for(i=0;i<TRK.length;i++){k=TRK[i];if(t<k[0])continue;if(k[3]){if(!S.skins)S.skins={};if(!S.skins[k[3]]){S.skins[k[3]]=1;it.push(k[1]+' '+LL(k[2]));}}}
    return {gold:g,it:it};}
  function vowCan(chi){return on('vow')&&isOpen()&&!!S.done[chi];}
  function runVow(g){if(!on('vow')||!camp(g)||g.first||g.bb2lih||g.bb2most||!S.done[g.chi]||!isOpen())return;
    var ids=vowSel();if(!ids.length)return;var sk=0,ms=[],x={},nm=[],i,v;
    for(i=0;i<ids.length;i++){v=VBY[ids[i]];sk+=v.sk;if(v.mod)ms.push(typeof v.mod==='function'?v.mod():v.mod);if(v.x)x[v.x]=1;if(nm.length<3)nm.push(LL(v.n));}
    g.bb2vow=sk;g.bb2v={ids:ids.join(''),x:x};
    if(x.norr){g.rerolls=0;g.banN=0;g.rrAd=1;}
    if(x.dmg)g.emD=(g.emD||1)*1.33;
    applyWk(g,mix(ms),1);
    banner(L('☠ Зарок: черепов ','☠ Vow: skulls ')+sk,nm.join(' · ')+(ids.length>3?' …':''),4);
    stat('vow',{a:'run',n:sk,v:g.bb2v.ids,c:chPos(g.chi)});}
  function endVow(g,win){var q=g.bb2v;if(!q)return;var sk=g.bb2vow,s=sv(),R={sk:sk,win:win?1:0};
    if(win){var k=vowK(sk),b=Math.round(g.reward*k);if(b>0){g.reward+=b;if(g.rw)g.rw.vow=b;pay(b,'lvl');}R.gold=b;R.pct=Math.round(k*100);
      if(!ob(s.v))s.v={};var old=s.v[g.chi]|0;R.old=old;if(sk>old){s.v[g.chi]=Math.min(N('skullMax',23),sk);R.add=sk-old;}
      R.trk=trackPay();R.tot=vowTotal();BB2.pdv('vow');BB2.pdv('vow.sk',sk,1);}
    res(g).vow=R;stat('vow',{a:win?'win':'lose',n:sk,c:chPos(g.chi),t:Math.floor(g.t)});keep();}
  var FOG=null;
  function fogImg(){if(FOG)return FOG;var c=mkCanvas(256,256),x=c.getContext('2d'),gr=x.createRadialGradient(128,128,26,128,128,92);
    gr.addColorStop(0,'rgba(14,16,26,0)');gr.addColorStop(1,'rgba(14,16,26,.9)');x.fillStyle=gr;x.fillRect(0,0,256,256);return FOG=c;}

  /* окно выбора зароков */
  function openVow(chi){var can=vowCan(chi),sel={},a=vowSel(),i;for(i=0;i<a.length;i++)sel[a[i]]=1;
    stat('tl',{a:'open',k:'vow'});
    function draw(){var ids=[],k,h,v,sk,tot=vowTotal(),nx=vowNext(tot),rec=(sv().v||{})[chi]|0;for(k in sel)if(sel[k])ids.push(k);sk=vowSk(ids);
      h='<h3>'+L('☠ Зароки','☠ Vows')+'</h3><p class="sub" style="margin:0 0 6px">'+(can?L('Победишь с зароком — черепа твои. Рекорд главы: ','Win with a vow and the skulls are yours. Chapter record: ')+'<b>'+rec+'</b> ☠'
        :L('Зарок дают только в уже пройденной главе. Выбери пройденную главу на карте.','Vows work only in a chapter you have already cleared. Pick a cleared chapter on the map.'))+'</p>'+
        '<div id="tlVL" style="max-height:46vh;overflow-y:auto;margin:0 -4px;padding:3px 4px">';
      for(i=0;i<VOWS.length;i++){v=VOWS[i];h+='<button class="upc tlv'+(sel[v.id]?' on':'')+'" data-v="'+v.id+'" style="display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin:0 0 4px;padding:3px 9px;text-align:left;'+(sel[v.id]?'outline:3px solid var(--cBad,#c0392b);':'')+'">'+
        '<span style="font-size:20px;flex:none;width:26px;text-align:center">'+v.e+'</span><span style="flex:1;min-width:0"><b style="display:block;font-size:14px;line-height:1.2">'+LL(v.n)+'</b><span style="display:block;font-size:12.5px;line-height:1.2;opacity:.85">'+LL(v.d)+'</span></span>'+
        '<span style="flex:none;font-weight:900;font-size:14px;white-space:nowrap">'+(sel[v.id]?'✓ ':'')+v.sk+' ☠</span></button>';}
      h+='</div><div class="tutbox" style="margin:6px 0 0;font-size:13.5px"><b>'+L('Зарок: ','Vow: ')+sk+' ☠</b> · '+L('золото за победу +','gold for a win +')+Math.round(vowK(sk)*100)+' %<br>'+
        L('Всего черепов: ','Skulls in total: ')+'<b>'+tot+'</b>'+(nx?' · '+L('на ','at ')+nx[0]+' — '+nx[1]+' '+LL(nx[2]):' · '+L('дорожка пройдена!','track complete!'))+'</div>'+
        '<div class="btns" style="flex-direction:row;margin-top:8px"><button class="btn ghost" id="tlVNo" style="flex:1">'+L('Сброс','Clear')+'</button><button class="btn ghost" id="tlVOk" style="flex:1">'+L('Готово','Done')+'</button>'+
        (can?'<button class="btn" id="tlVGo" style="flex:1.5;white-space:nowrap">'+L('⚔ В поход','⚔ March')+'</button>':'')+'</div>';
      var sc=el('tlVL'),top=sc?sc.scrollTop:0;showModal(h,'tlvow');sc=el('tlVL');if(sc)sc.scrollTop=top;
      var bs=document.querySelectorAll('.tlv');for(i=0;i<bs.length;i++)bs[i].onclick=function(){SND.click();var id=this.getAttribute('data-v');sel[id]=!sel[id];draw();};
      function put(){var o='',k2;for(k2 in sel)if(sel[k2])o+=k2;var s=sv();if(o)s.vl=o;else delete s.vl;stat('vow',{a:'set',n:vowSk(vowSel()),v:o});keep();}
      var b=el('tlVNo');if(b)b.onclick=function(){SND.click();sel={};draw();};
      b=el('tlVOk');if(b)b.onclick=function(){SND.click();put();hideModal();try{renderChInfo();}catch(e){}};
      b=el('tlVGo');if(b)b.onclick=function(){SND.click();put();hideModal();startRun(chi);};}
    draw();}
  T.openVow=openVow;

  /* =====================================================================================================================
     2. ЛИХАЯ НЕДЕЛЯ
     ===================================================================================================================== */
  /* короткие описания правил недели для главы (в Испытании недели у тех же правил свои слова про золото — здесь золото не меняется) */
  var LIHD={bow:['Только лук Алёши, зато стрелы летят чаще','Only Alyosha’s bow, but it shoots faster'],fast:['Вся нечисть бегает в полтора раза быстрее','All monsters run 1.5× faster'], /* i18n:ru — пары [рус, англ], перевод рядом */
    fast2:['Ни пирожков, ни живой воды. Зато брони +3','No pies, no healing water. But +3 armor'],gold:['Жизнь одна: ни знахарки, ни «Подняться»','One life: no revives at all'], /* i18n:ru — пары [рус, англ], перевод рядом */
    giant:['Нечисть крупнее и втрое крепче, опыта с неё вдвое','Monsters are bigger and 3× tougher, double XP'],horde:['Нечисти вдвое больше, зато она хилая','Twice the monsters, but they are frail'], /* i18n:ru — пары [рус, англ], перевод рядом */
    glass:['Половина здоровья, зато урон ×1,7','Half health, but damage ×1.7'],kolo:['Только колобки — зато сразу два','Only kolobok buns — but two at once']}; /* i18n:ru — пары [рус, англ], перевод рядом */
  /* сетка «правило × место в кампании» по прогону бота (TAIL-tools/lih_grid.py): выше этого места правило не ставится — берётся глава пониже */
  var LIH_CAP={kolo:6,bow:11}; /* бот 13.10 (слабая кузница, без воскрешений, по 5 походов): «Колобковая» на местах 12, 18 — 0 побед (на 3-м — 5 из 5); «Стрелецкая» на 12, 18, 30 — 1 из 5 и бой с боссом по 10–15 минут */
  var LIH_TH=[3,6,9];
  function lihRule(id){if(id)for(var i=0;i<WEEKLY.length;i++)if(WEEKLY[i].id===id)return WEEKLY[i];return weekly();}
  function lihPick(w,rule){var D=doneList(),cap=LIH_CAP[rule.id]||99,D2=D.filter(function(s){return chPos(s)<=cap;});if(D2.length<3)D2=D.slice(0,3);
    var n=D2.length,R=mulberry(w*7919+17),t=Math.floor(n/3),i0=Math.floor(R()*Math.max(1,Math.ceil(n/3))),i1=t+Math.floor(R()*Math.max(1,t)),i2=2*t+Math.floor(R()*Math.max(1,n-2*t));
    if(i1<=i0)i1=i0+1;if(i2<=i1)i2=i1+1;if(i2>n-1){i2=n-1;i1=Math.min(i1,n-2);i0=Math.min(i0,n-3);}
    return [D2[i0],D2[i1],D2[i2]];}
  function lihState(){if(!on('lih')||!isOpen())return null;var s=sv(),w=weekNo(),l=s.l;if(ob(l)&&l.w===w&&CH[l.c[0]]&&CH[l.c[1]]&&CH[l.c[2]])return l;
    s.l={w:w,c:lihPick(w,lihRule()),s:[0,0,0],g:0};keep();return s.l;}
  function lihStars(l){return bits(l.s[0])+bits(l.s[1])+bits(l.s[2]);}
  function lihDif(chi){return difWon(chi,'s')?'s':'n';} /* на той сложности, которую игрок в этой главе уже одолел (не выше Сложной) */
  T.lihState=lihState;
  T.lihGo=function(i){var l=lihState();if(!l)return;PEND={k:'lih',i:i,chi:l.c[i],t:Date.now()};hideModal();startRun(l.c[i]);};
  function runLih(g,p){var rule=lihRule(p.rule),m=mix([rule.mod]);delete m.gold;
    g.bb2lih={i:p.i,w:weekNo(),r:rule.id};setDif(g,p.dif||lihDif(g.chi));snap(g);applyWk(g,m,1);
    banner(L('Лихая неделя','Wild Week'),rule.name,4);stat('mod',{m:'lih',a:'run',n:p.i,c:chPos(g.chi)});}
  function endLih(g,win){var q=g.bb2lih;unsnap(g);var l=lihState(),s=sv(),R={i:q.i,win:win?1:0,nw:0,gold:0,ch:[]};res(g).lih=R;
    if(!l||l.w!==q.w||l.c[q.i]!==g.chi){R.old=1;return;}
    var got=(win?1:0)|(win&&!g.falls?2:0)|(win&&g.t<=STAR_T?4:0),nw=got&~l.s[q.i],n=bits(nw),j,tot,sl=slv();l.s[q.i]|=got;R.got=l.s[q.i];R.nw=n;
    if(n){R.gold+=pay(n*rw(N('liha.star','s')),'quest');s.ls=(s.ls|0)+n;BB2.pdv('lih',n);
      try{if(sl&&typeof rwGive==='function')rwGive({fx:N('liha.slava',5/*ECO?*/)*n},'lih');}catch(e){}}
    tot=lihStars(l);R.tot=tot;
    for(j=0;j<3;j++){if(tot<LIH_TH[j]||(l.g&(1<<j)))continue;l.g|=1<<j;
      if(j===0){var a=tro(g.chi,N('liha.c3tro',2/*ECO?*/)),b=0;try{if(sl&&typeof rwGive==='function'){rwGive({it:'rr',n:N('liha.c3rr',1/*ECO?*/)},'lih');b=1;}}catch(e){}
        R.ch.push(L('Сундук за 3 звезды: трофеи ×'+a+(b?', свиток перебора':''),'3-star chest: trophies ×'+a+(b?', a reroll scroll':'')));}
      else if(j===1){var c=tro(g.chi,N('liha.c6tro',4/*ECO?*/)),d=0,sp=N('liha.c6saga',20/*ECO?*/);try{if(sl&&typeof slSaga==='function'){var ss=slSaga();ss.p+=sp;if(typeof sagaUd==='function'&&sagaUd(ss))ss.u+=sp;d=1;}}catch(e){}
        R.ch.push(L('Сундук за 6 звёзд: трофеи ×'+c+(d?', очки Сказа +'+sp:''),'6-star chest: trophies ×'+c+(d?', Saga points +'+sp:'')));}
      else{var gg=pay(rw(N('liha.done','b')),'quest'),e2=tro(g.chi,N('liha.tro',6));R.gold+=gg;s.ln=(s.ln|0)+1;
        R.ch.push(L('Неделя пройдена! Сундук за 9 звёзд: +'+fmtNum(gg)+' золота, трофеи ×'+e2,'Week complete! 9-star chest: +'+fmtNum(gg)+' gold, trophies ×'+e2));
        BB2.ev('kuplet',{c:'lih',src:'lih',t:L('Лихо одноглазое косо поглядело —\nдевять звёзд за неделю, и окосело.','One-eyed Likho gave a crooked glare —\nnine stars in a week, and now it won’t dare.')});}
      stat('mod',{m:'lih',a:'chest',n:LIH_TH[j]});}
    if(n)stat('mod',{m:'lih',a:'star',n:tot});keep();}
  function star3(b){var k=[1,2,4],h='',i;for(i=0;i<3;i++)h+='<span style="'+(b&k[i]?'':'opacity:.28')+'">★</span>';return h;}
  function openLih(){var l=lihState();if(!l){toast(L('Лихая неделя откроется после трёх пройденных глав','Wild Week unlocks after three cleared chapters'));return;}
    stat('tl',{a:'open',k:'lih'});var rule=lihRule(),lh=weekLeftH(),left=lh>=24?Math.floor(lh/24)+L(' дн. ','d ')+(lh%24)+L(' ч','h'):lh+L(' ч','h'),tot=lihStars(l),i,h;
    h='<h3>'+L('Лихая неделя','Wild Week')+'</h3><div class="tutbox" style="margin:0 0 8px"><b>'+rule.name+'</b><br><span style="font-weight:600">'+(LIHD[rule.id]?LL(LIHD[rule.id]):rule.about)+'</span></div>'+
      '<p class="sub" style="margin:0 0 6px">'+L('Три твои главы под лихом. За каждую — до трёх звёзд: победа, без единого падения, быстрее '+fmtTime(STAR_T)+'.','Three of your chapters under the week’s rule. Up to three stars each: win, never fall, faster than '+fmtTime(STAR_T)+'.')+'</p>';
    for(i=0;i<3;i++){var d=lihDif(l.c[i]);h+='<div class="card" style="display:flex;align-items:center;gap:8px;padding:7px 9px;margin-bottom:6px"><span style="flex:1;min-width:0"><b style="display:block;font-size:14px;line-height:1.25">'+chPos(l.c[i])+'. '+CH[l.c[i]].name+(d==='s'?' ⚔':'')+'</b>'+
      '<span style="font-size:19px;letter-spacing:2px;color:var(--cGold,#b8860b)">'+star3(l.s[i])+'</span></span><button class="btn" data-lg="'+i+'" style="flex:none;min-height:44px;padding:0 14px">'+(l.s[i]===7?L('Ещё раз','Again'):L('В поход','March'))+'</button></div>';}
    h+='<p class="sub" style="margin:4px 0 0">'+L('Звёзд: ','Stars: ')+'<b>'+tot+L(' из 9',' of 9')+'</b> · '+L('сундуки: ','chests: ')+LIH_TH.map(function(t,j){return (l.g&(1<<j)?'✓':'')+t+'★';}).join(' · ')+' · '+L('до смены ','resets in ')+left+'</p>'+
      '<div class="btns" style="flex-direction:row;margin-top:8px">'+(typeof endOpen==='function'&&endOpen()?'<button class="btn ghost" id="tlLWk" style="flex:1.6">'+L('🏆 Стоять до конца','🏆 Last stand')+'</button>':'')+'<button class="btn ghost" id="tlLX" style="flex:1">'+L('Закрыть','Close')+'</button></div>';
    showModal(h,'tllih');var bs=document.querySelectorAll('[data-lg]');for(i=0;i<bs.length;i++)bs[i].onclick=function(){SND.click();T.lihGo(+this.getAttribute('data-lg'));};
    var b=el('tlLX');if(b)b.onclick=function(){SND.click();hideModal();};b=el('tlLWk');if(b)b.onclick=function(){SND.click();hideModal();startRun(0,true,true);};}
  T.openLih=openLih;

  /* =====================================================================================================================
     3. ГОНКА СО ВЧЕРАШНИМ СОБОЙ
     ===================================================================================================================== */
  function rEnc(a){var s='',p=0,i,d;for(i=0;i<a.length&&i<40;i++){d=Math.max(0,Math.min(1295,(a[i]|0)-p));p+=d;s+=(d<36?'0':'')+d.toString(36);}return s;}
  function rDec(s){var a=[],p=0,i;for(i=0;i+1<s.length;i+=2){p+=parseInt(s.substr(i,2),36)||0;a.push(p);}return a;}
  function rGet(k){var r=sv().r,i;if(Array.isArray(r))for(i=0;i<r.length;i++)if(r[i][0]===k)return r[i][1];return '';}
  function rPut(k,str){var s=sv(),r=Array.isArray(s.r)?s.r.filter(function(x){return x[0]!==k;}):[];r.unshift([k,str]);if(r.length>8)r.length=8;s.r=r;}
  T.raceEnc=rEnc;T.raceDec=rDec;
  function runRace(g){if(!on('race')||!camp(g)||g.first||g.bb2lih||g.bb2most||g.bb2v||!isOpen())return;
    var key=g.chi+(g.dif||'n'),st=rGet(key),q={key:key,a:[],nx:10,gh:st?rDec(st):null,d:null,lt:0,img:null,ext:null};
    /* честная тень от потока REPLAY (один вызов): подписчик 'raceGhost' вернёт {at:function(t){…сколько одолено к секунде t…},total:итог} — тогда вместо записи по счёту берётся она */
    try{var x=BB2.hk('raceGhost',key,g);if(x&&typeof x.at==='function')q.ext=x;}catch(e){}
    if(q.gh&&!q.gh.length)q.gh=null;g.bb2rc=q;}
  function rAt(q,t){if(q.ext)return +q.ext.at(t)||0;var a=q.gh,n=a.length,x=t/10,i=Math.floor(x);if(i>=n)return a[n-1];var a0=i<=0?0:a[i-1];return a0+(a[i]-a0)*(x-i);}
  function rTotal(q){return q.ext?(+q.ext.total||0):q.gh?q.gh[q.gh.length-1]:0;}
  function frameRace(dt,g){var q=g.bb2rc;if(g.t>=q.nx){q.a.push(g.kills);q.nx+=10;}
    if(!q.gh&&!q.ext)return;q.lt-=dt;if(q.lt>0)return;q.lt=.5;var d=g.kills-Math.round(rAt(q,g.t));if(d!==q.d){q.d=d;q.img=null;}}
  function drawRace(c,g){var q=g.bb2rc;if(q.d===null||g.win)return;
    if(!q.img)q.img=pill(q.d>=0?L('▲ впереди на ','▲ ahead by ')+q.d:L('▼ отстал на ','▼ behind by ')+(-q.d),q.d>=0?'#8af0a0':'#ff9a8a');pillDraw(c,q.img);}
  function endRace(g,win){var q=g.bb2rc,s=sv();if(g.t<60)return;var a=q.a.slice(0,39),had=!!(q.gh||q.ext),tot=rTotal(q),won=had&&g.kills>tot,R={had:had?1:0,won:won?1:0,d:g.kills-tot,gold:0};a.push(g.kills);
    if(!had||g.kills>tot)rPut(q.key,rEnc(a));
    if(won){s.rn=(s.rn|0)+1;BB2.pdv('race');if(s.rd!==dayKey()){s.rd=dayKey();R.gold=pay(rw(N('race.win','s')),'quest');}}
    res(g).race=R;BB2.ev('raceEnd',{key:q.key,kills:g.kills,win:win?1:0,a:a});stat('race',{a:won?'win':had?'lose':'new',d:R.d,c:chPos(g.chi)});keep();}

  /* =====================================================================================================================
     4. КАЛИНОВ МОСТ
     ===================================================================================================================== */
  var MR=[
    {id:'calm',n:['Тихий этаж','Quiet floor'],d:['Нечисть как нечисть — отдышись','Monsters as usual — catch your breath'],mod:{}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'fast',n:['Сквозняк','Draught'],d:['Нечисть бегает на треть быстрее','Monsters run a third faster'],mod:{espd:1.35}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'hung',n:['Голодный этаж','Hungry floor'],d:['Лечиться нельзя','No healing'],mod:{noHeal:1}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'giant',n:['Великаны','Giants'],d:['Нечисть крупнее и вдвое крепче','Bigger and 2× tougher'],mod:{esz:1.35,ehp:2.2,exp:1.5}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'horde',n:['Тьма тьмущая','A whole horde'],d:['Нечисти в полтора раза больше','Half again as many monsters'],mod:{spawn:1.6,cap:1.25}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'glass',n:['Стеклянный этаж','Glass floor'],d:['Здоровья меньше, урон больше','Less health, more damage'],mod:{hp:.6,might:1.35}}, /* i18n:ru — пары [рус, англ], перевод рядом */
    {id:'evil',n:['Злой этаж','Angry floor'],d:['Нечисть бьёт на треть больнее','Monsters hit a third harder'],mod:{},dmg:1.3}]; /* i18n:ru — пары [рус, англ], перевод рядом */
  function mFloors(){return N('most.floors',100);}function mFS(){return N('most.floorSec',90);}function mRest(){return Math.max(2,N('most.rest',5));}
  function mSeason(){return Math.floor(weekNo()/Math.max(1,Math.round(N('most.days',28)/7)));}
  function mOpen(){return on('most')&&doneList().length>=N('most.openCh',6/*ECO?*/);}
  /* bk2410 «Мост без конца» (флаг mostx): прошедшему всю кампанию мост не кончается на 100-м этаже — дальше «за Смородиной» без предела (рекорд s.mb);
     «скорый подъём» — новый сезон с привала в половину рекорда (не дальше 50-го, золото за пропущенных боссов не платится); босс с 26-го этажа платит среднюю награду. */
  function mAll(){return on('mostx')&&!!S.done[campLast()];}
  function mEnd(){return mAll()?9999:mFloors();}
  function mSkip(m){var b=Math.min(sv().mb|0,mFloors());return mAll()&&m.f===0?Math.min(50,Math.floor(b/2/mRest())*mRest()):0;}
  function mState(wr){var s=sv(),se=mSeason();if(ob(s.m)&&s.m.s===se)return s.m;var m={s:se,f:0,t:0};if(wr)s.m=m;return m;} /* запись в сохранение — только когда есть что писать */
  function mBase(m){return Math.floor(m.f/mRest())*mRest();}
  function mPlan(m){var base=mBase(m),D=doneList(),R=mulberry(m.s*1009+base*31+7),n=D.length,i,r,last=-1,rules=[];
    var chi=base>=mFloors()?D[n-1-Math.floor(R()*Math.max(1,Math.round(n/3)))]:D[Math.min(n-1,Math.floor(base/mFloors()*n+R()*3))]; /* за Смородиной — главы последней трети */
    for(i=0;i<mRest();i++){do{r=Math.floor(R()*MR.length);}while(r===last);last=r;rules.push(i===mRest()-1&&MR[r].id==='hung'?0:r);} /* на этаже-боссе без «голодного»: бой с боссом без лечения — слишком зло */
    return {base:base,chi:chi,rules:rules};}
  function mHp(n){return 1+N('most.hpK',.03/*ECO?*/)*n;}function mDmg(n){return 1+N('most.dmgK',.012/*ECO?*/)*n;}
  T.mostState=mState;T.mostPlan=function(){return mPlan(mState());};
  T.mostGo=function(){if(!mOpen())return;var m=mState(),p=mPlan(m);if(p.base>=mEnd())return;PEND={k:'most',chi:p.chi,base:p.base,rules:p.rules,t:Date.now()};hideModal();startRun(p.chi);};
  function mSet(g,fl){var q=g.bb2most,n=q.base+fl+1,r=MR[q.rules[fl]]||MR[0],boss=fl===mRest()-1;q.fl=fl;q.img=null;
    g.em=mHp(n);g.emD=mDmg(n)*(r.dmg||1);applyWk(g,mix([r.mod,{gold:1e-9,cap:.85}]),fl===0);
    banner(L('Этаж ','Floor ')+n+(boss?L(' · босс',' · boss'):''),LL(r.n)+' — '+LL(r.d),4);}
  function runMost(g,p){setDif(g,'n');snap(g);var FS=mFS(),R=mRest(),i,ev=[];
    g.bb2most={base:p.base,fl:-1,rules:p.rules,img:null};
    for(i=0;i<g.ev.length;i++)if(g.ev[i].k!=='boss'&&g.ev[i].t<FS*(R-1)-8)ev.push(g.ev[i]);
    if(FS*(R-1)>300)ev.push({t:FS*(R-1)-40,k:'elite'});ev.push({t:FS*(R-1),k:'boss'});ev.sort(function(a,b){return a.t-b.t;});g.ev=ev;
    mSet(g,0);stat('most',{a:'run',n:p.base+1,c:chPos(g.chi)});}
  function mMark(n){var m=mState(1),s=sv();if(n>m.f){m.f=Math.min(mEnd(),n);if(m.f>(s.mb|0))s.mb=m.f;BB2.pdv('most',m.f,1);return 1;}return 0;}
  function frameMost(dt,g){var q=g.bb2most,fl=Math.min(mRest()-1,Math.floor(g.t/mFS()));if(fl<=q.fl||g.win)return;
    if(mMark(q.base+fl)){keep();stat('most',{a:'floor',n:q.base+fl});}mSet(g,fl);}
  function drawMost(c,g){var q=g.bb2most;if(!q.img){var r=MR[q.rules[q.fl]]||MR[0];q.img=pill(L('Этаж ','Floor ')+(q.base+q.fl+1)+' · '+LL(r.n),'#ffd98a');}pillDraw(c,q.img);}
  function endMost(g,win){var q=g.bb2most,R={from:q.base,win:win?1:0,gold:0,it:[]},m,s=sv(),b,rest=mRest();unsnap(g);
    mMark(win?q.base+rest:q.base+Math.max(0,q.fl));m=mState(1);R.to=m.f;R.fl=win?q.base+rest:q.base+q.fl+1;
    for(b=(Math.floor(m.t/rest)+1)*rest;b<=m.f;b+=rest){m.t=b;R.gold+=pay(rw(b>25&&on('mostx')?'m':N('most.boss','s')),'quest');var t=tro(g.chi,N('most.bossTro',2/*ECO?*/));if(t)R.tro=(R.tro|0)+t;
      if(b===50){if(!S.skins)S.skins={};if(!S.skins['mar@most']){S.skins['mar@most']=1;R.it.push(L('👕 облик Марьи «Страж Калинова моста»','👕 Marya outfit “Kalinov Bridge Guard”'));}}
      if(b===25)R.it.push(L('🏷️ звание «Мостовой страж»','🏷️ title “Bridge Guard”'));if(b===100)R.it.push(L('👑 звание «Хозяин Калинова моста»','👑 title “Master of Kalinov Bridge”'));
      stat('most',{a:'boss',n:b});}
    if(!win)stat('most',{a:'die',n:R.fl,t:Math.floor(g.t)});res(g).most=R;keep();}
  T.mostTitle=function(){var b=sv().mb|0;return b>=150?L('Страж за Смородиной','Guard beyond the Smorodina'):b>=100?L('Хозяин Калинова моста','Master of Kalinov Bridge'):b>=25?L('Мостовой страж','Bridge Guard'):'';};
  function openMost(){if(!mOpen()){toast(L('Калинов мост откроется после шести пройденных глав','Kalinov Bridge unlocks after six cleared chapters'));return;}
    stat('tl',{a:'open',k:'most'});var m=mState(),p=mPlan(m),F=mFloors(),rest=mRest(),per=Math.max(1,Math.round(N('most.days',28)/7)),wl=(per-1-(weekNo()%per))*7*24+weekLeftH(),i,h,done=p.base>=mEnd(),sk=mSkip(m),far=p.base>=F;
    h='<h3>'+L('Калинов мост','Kalinov Bridge')+'</h3><p class="sub" style="margin:0 0 6px">'+L('Мост через Смородину: '+F+' этажей, сезон 4 недели. Поход — '+rest+' этажей: каждые '+mFS()+' с новое правило, в конце босс. Одолел — привал.',
      'A bridge over the Smorodina: '+F+' floors, a 4-week season. A run is '+rest+' floors: a new rule every '+mFS()+' s, a boss at the end. Beat it to rest.')+'</p>'+
      (mAll()?'<p class="sub" style="margin:0 0 6px">'+L('🏆 Кампания пройдена — мост для тебя без конца: после '+F+'-го этажа — «за Смородиной», рекорд за всё время: ','🏆 Campaign complete — the bridge is endless for you: past floor '+F+' lies “beyond the Smorodina”, all-time record: ')+'<b>'+(sv().mb|0)+'</b></p>':'')+
      '<div class="prog" style="margin:0 0 8px"><div class="bar"><i style="width:'+Math.max(2,Math.min(100,Math.round(m.f/F*100)))+'%"></i></div><span>'+L('Этаж ','Floor ')+'<b>'+m.f+'</b>'+(far?'':L(' из ',' of ')+F)+' · '+L('привал на ','rest at ')+p.base+' · '+L('сезон: ещё ','season: ')+Math.ceil(wl/24)+L(' дн.','d')+'</span></div>';
    if(done)h+='<div class="tutbox">'+L('Мост пройден! Нечисть по ту сторону Смородины пишет жалобу. Новый сезон — новый мост.','Bridge cleared! The monsters across the river are filing a complaint. New season — new bridge.')+'</div>';
    else{h+='<div class="card" style="padding:7px 10px;margin-bottom:6px"><b style="font-size:14px">'+L('Впереди: ','Ahead: ')+CH[p.chi].name+'</b>';
      for(i=0;i<rest;i++){var r=MR[p.rules[i]];h+='<span style="display:block;font-size:13px;line-height:1.35'+(m.f>=p.base+i+1?';opacity:.55':'')+'">'+(m.f>=p.base+i+1?'✓ ':'')+(p.base+i+1)+'. <b>'+(i===rest-1?L('Босс · ','Boss · '):'')+LL(r.n)+'</b></span>';}
      h+='</div>';}
    var g1=fmtNum(rw(N('most.boss','s'))),g2=on('mostx')?fmtNum(rw('m')):'';
    h+='<p class="sub" style="margin:4px 0 0">'+L('Золото — только за босса: +'+g1+(g2?' (с 26-го этажа +'+g2+')':'')+' и трофеи, раз за сезон. Этажи 25, 50, 100 — звание, облик Марьи, звание.',
      'Gold only for a boss: +'+g1+(g2?' (from floor 26: +'+g2+')':'')+' and trophies, once per season. Floors 25, 50, 100 — a title, Marya’s outfit, a title.')+'</p>'+
      (sk&&!done?'<button class="btn ghost" id="tlMSk" style="width:100%;margin-top:6px">'+L('⏩ Скорый подъём: начать с этажа '+(sk+1),'⏩ Quick climb: start at floor '+(sk+1))+'</button><p class="sub" style="margin:2px 0 0;font-size:12px">'+L('Половина твоего рекорда. Золото за пропущенных боссов не дают.','Half your record. No gold for skipped bosses.')+'</p>':'')+
      '<div class="btns" style="flex-direction:row;margin-top:8px"><button class="btn ghost" id="tlMX" style="flex:1">'+L('Закрыть','Close')+'</button>'+(done?'':'<button class="btn" id="tlMGo" style="flex:1.6">'+L('⚔ На мост: этаж ','⚔ To the bridge: floor ')+(p.base+1)+'</button>')+'</div>';
    showModal(h,'tlmost');var b=el('tlMX');if(b)b.onclick=function(){SND.click();hideModal();};b=el('tlMGo');if(b)b.onclick=function(){SND.click();T.mostGo();};
    b=el('tlMSk');if(b)b.onclick=function(){SND.click();var q=mState(1),k=mSkip(q);if(k){q.f=q.t=k;keep();stat('most',{a:'skip',n:k});}openMost();};}
  T.openMost=openMost;

  /* =====================================================================================================================
     5. ПОДВИГИ ГЕРОЕВ
     ===================================================================================================================== */
  /* [вид, число, название ru, en]. Виды: kills одолеть за поход · nofall победа без падений · fast победа быстрее N с · nohit первые N с без ран · lvl уровень · left победа, всегда левая карточка
     norr победа без перебора · vow победа с зароком от N черепов · hard победа на Сложной/Адской · evo эволюций за поход · dar даров за поход · chest сундуков за поход */
  var HQ={
    dob:[['kills',400,'Разминка','Warm-up'],['nofall',0,'Щит не для красоты','A shield is not for show'],['evo',1,'Меч-кладенец','The magic sword'],['vow',3,'Слово богатырское','A hero’s word'],['hard',0,'Змею — бой','Fight the Serpent']], /* i18n:ru — пары [рус, англ], перевод рядом */
    ale:[['nohit',60,'Не тронь меня','Can’t touch this'],['lvl',18,'Молодо — не зелено','Young, not green'],['fast',320,'Бей-беги','Hit and run'],['kills',600,'Хвастать — не косить','Easier bragged than done'],['vow',5,'Зарок Поповича','The priest’s son’s vow']], /* i18n:ru — пары [рус, англ], перевод рядом */
    ily:[['lvl',15,'Слез с печи','Got off the stove'],['kills',500,'Сила есть','Got the strength'],['nofall',0,'Не падал отродясь','Never fell in his life'],['evo',2,'Одним махом','In one swing'],['hard',0,'Застава богатырская','The heroes’ outpost']], /* i18n:ru — пары [рус, англ], перевод рядом */
    vas:[['norr',0,'Премудрость','Wisdom'],['dar',20,'Рукавом махнула','A wave of the sleeve'],['lvl',20,'Всё по уму','By the book'],['nofall',0,'Царевна, а не лягушка','A princess, not a frog'],['vow',4,'Задачка со звёздочкой','An extra-credit problem']], /* i18n:ru — пары [рус, англ], перевод рядом */
    sad:[['chest',4,'Сундуки любят счёт','Chests like to be counted'],['kills',500,'Торг уместен','Open to haggling'],['evo',2,'Купеческая смекалка','A merchant’s wit'],['norr',0,'Не продешевил','No bargain lost'],['hard',0,'За семь морей','Beyond seven seas']], /* i18n:ru — пары [рус, англ], перевод рядом */
    mik:[['chest',4,'Урожай','Harvest'],['kills',700,'Борозда','The furrow'],['nofall',0,'Крепкий мужик','A sturdy man'],['lvl',22,'Пахать так пахать','Plough like you mean it'],['vow',5,'Тяга земная','The pull of the earth']], /* i18n:ru — пары [рус, англ], перевод рядом */
    vol:[['fast',320,'Соколом','As a falcon'],['nohit',90,'Серым волком','As a grey wolf'],['dar',25,'Щукой','As a pike'],['evo',2,'Дружина','The warband'],['hard',0,'Оборотень','Shapeshifter']], /* i18n:ru — пары [рус, англ], перевод рядом */
    mar:[['hard',0,'Кощей на цепи','Koschei on a chain'],['kills',800,'Воительница','Warrior queen'],['nohit',75,'Ни царапины','Not a scratch'],['nofall',0,'Королевна','The queen'],['vow',6,'Клятва Моревны','Morevna’s oath']], /* i18n:ru — пары [рус, англ], перевод рядом */
    iva:[['left',0,'Дуракам везёт','Fools’ luck'],['norr',0,'Авось','Maybe it’ll work'],['lvl',18,'На печи доехал','Rode in on the stove'],['chest',5,'Небось','Probably fine'],['vow',3,'Дурак дураком, а слово держит','A fool, but keeps his word']]}; /* i18n:ru — пары [рус, англ], перевод рядом */
  function hqText(q){var k=q[0],n=q[1];
    return k==='kills'?L('Одолей за поход нечисти: '+n,'Defeat monsters in one run: '+n):k==='nofall'?L('Победи, ни разу не упав','Win without falling once'):k==='fast'?L('Победи быстрее '+fmtTime(n),'Win faster than '+fmtTime(n)):
      k==='nohit'?L('Первые '+n+' с похода — ни одной раны','No wounds in the first '+n+' s of a run'):k==='lvl'?L('Дойди в походе до уровня '+n,'Reach level '+n+' in a run'):k==='left'?L('Победи, выбирая всегда левую карточку','Win while always picking the left card'):
      k==='norr'?L('Победи без единого перебора карточек','Win without a single reroll'):k==='vow'?L('Победи с зароком от '+n+' черепов','Win with a vow of '+n+'+ skulls'):k==='hard'?L('Победи на Сложной','Win on Hard'):
      k==='evo'?(n>1?L('Проведи эволюций за поход: '+n,'Evolve weapons in one run: '+n):L('Проведи эволюцию оружия','Evolve a weapon')):k==='dar'?L('Используй дар за поход: '+n+' раз','Use the Power in one run: '+n+' times'):L('Открой сундуков за поход: '+n,'Open chests in one run: '+n);}
  function hqBits(h){return ((sv().h||{})[h]|0)&31;}
  function hqNext(h){var b=hqBits(h),i;if(!HQ[h])return -1;for(i=0;i<5;i++)if(!(b>>i&1))return i;return -1;}
  T.hqDone=function(h){return bits(hqBits(h));};T.hqNext=function(h){var i=hqNext(h);return i<0?null:{i:i,name:L(HQ[h][i][2],HQ[h][i][3]),text:hqText(HQ[h][i])};};
  function hqOn(){return on('hq')&&isOpen();}
  function runHq(g){if(!hqOn()||!camp(g)||g.first||g.bb2lih||g.bb2most)return;var i=hqNext(g.heroId);if(i<0)return;g.bb2hq={h:g.heroId,i:i,bad:0,nh:0,rr:0};}
  function endHq(g,win){var q=g.bb2hq,d=HQ[q.h][q.i],k=d[0],n=d[1],ok=false,s=sv(),Q=g.q||{};
    if(k==='kills')ok=g.kills>=n;else if(k==='nofall')ok=win&&!g.falls;else if(k==='fast')ok=win&&g.t<=n;else if(k==='nohit')ok=q.nh===1;else if(k==='lvl')ok=g.hero.lvl>=n;
    else if(k==='left')ok=win&&!q.bad;else if(k==='norr')ok=win&&!q.rr;else if(k==='vow')ok=win&&(g.bb2vow|0)>=n;else if(k==='hard')ok=win&&(g.dif==='s'||g.dif==='h');
    else if(k==='evo')ok=(Q.evos|0)>=n;else if(k==='dar')ok=(Q.dars|0)>=n;else if(k==='chest')ok=(Q.chests|0)>=n;
    if(!ok)return;if(!ob(s.h))s.h={};s.h[q.h]=hqBits(q.h)|(1<<q.i);var all=hqBits(q.h)===31,gold=pay(rw(N('heroQuest.gold','m')),'quest');
    res(g).hq={h:q.h,i:q.i,name:L(d[2],d[3]),gold:gold,all:all?1:0};BB2.pdv('hq');BB2.ev('heroQuest',{hero:q.h,n:q.i+1,all:all?1:0});stat('hq',{a:'done',h:q.h,n:q.i+1});keep();}
  function openHq(){stat('tl',{a:'open',k:'hq'});var h='<h3>'+L('Подвиги героев','Hero feats')+'</h3><p class="sub" style="margin:0 0 6px">'+L('У каждого богатыря — пять своих подвигов. Считаются сами в обычных походах по главам этим богатырём, по порядку. За подвиг — '+fmtNum(rw(N('heroQuest.gold','m')))+' золота.',
      'Each hero has five feats of their own. They count by themselves in regular chapter runs with that hero, in order. Each feat pays '+fmtNum(rw(N('heroQuest.gold','m')))+' gold.')+'</p><div style="max-height:56vh;overflow-y:auto;margin:0 -4px;padding:0 4px">',i,hr,b,nx;
    for(i=0;i<HEROES.length;i++){hr=HEROES[i];if(!HQ[hr.id])continue;b=bits(hqBits(hr.id));nx=hqNext(hr.id);var open=heroOpen(hr);
      h+='<div class="card" style="display:flex;align-items:center;gap:8px;padding:6px 9px;margin-bottom:5px'+(open?'':';opacity:.55')+'"><img src="'+ic('hp_'+skinKey(hr.id),96)+'" style="width:40px;height:40px;flex:none"><span style="flex:1;min-width:0"><b style="display:block;font-size:14px;line-height:1.2">'+hr.name+' · '+b+'/5'+(S.hero===hr.id?' ✓':'')+'</b>'+
        '<span style="display:block;font-size:13px;line-height:1.25">'+(nx<0?L('Все подвиги свершены!','All feats done!'):!open?L('Богатырь ещё не в дружине','This hero has not joined yet'):'«'+L(HQ[hr.id][nx][2],HQ[hr.id][nx][3])+'»: '+hqText(HQ[hr.id][nx]))+'</span></span></div>';}
    h+='</div><div class="btns" style="flex-direction:row;margin-top:8px"><button class="btn ghost" id="tlHH" style="flex:1">'+L('К богатырям','To heroes')+'</button><button class="btn" id="tlHX" style="flex:1">'+L('Понятно','Got it')+'</button></div>';
    showModal(h,'tlhq');var x=el('tlHX');if(x)x.onclick=function(){SND.click();hideModal();};x=el('tlHH');if(x)x.onclick=function(){SND.click();hideModal();openTab('Heroes');};}
  T.openHq=openHq;

  /* =====================================================================================================================
     Крючки боя
     ===================================================================================================================== */
  function runAll(g){if(!g||g.bb2t)return;g.bb2t=1;var p=PEND;PEND=null;
    if(p&&p.chi===g.chi&&camp(g)&&Date.now()-p.t<600000){if(p.k==='lih'&&on('lih'))runLih(g,p);else if(p.k==='most'&&on('most'))runMost(g,p);}
    runVow(g);runHq(g);runRace(g);
    if(g.bb2hq){var d=HQ[g.bb2hq.h][g.bb2hq.i];banner(L('Подвиг: ','Feat: ')+L(d[2],d[3]),hqText(d),2);}}
  BB2.hook('run',runAll);
  T.late=function(g){if(g&&g.t<3)runAll(g);};
  BB2.hook('frame',function(dt,g){
    if(g.bb2v&&g.bb2v.x.nodar&&g.darT<5)g.darT=5;
    if(g.bb2hq&&!g.bb2hq.nh&&HQ[g.bb2hq.h][g.bb2hq.i][0]==='nohit'&&g.t>=HQ[g.bb2hq.h][g.bb2hq.i][1])g.bb2hq.nh=g.hits?-1:1;
    if(g.bb2most)frameMost(dt,g);
    if(g.bb2rc)frameRace(dt,g);});
  BB2.hook('dar',function(g){if(g&&g.bb2v&&g.bb2v.x.nodar)return true;},10); /* крючок договора UM: дар сам не срабатывает */
  BB2.hook('drawTop',function(c,g){
    if(g.bb2v&&g.bb2v.x.fog){var s=Math.max(VIEW.W,VIEW.H)*1.9;c.drawImage(fogImg(),VIEW.W/2-s/2,VIEW.H/2-s/2,s,s);}
    if(g.bb2most)drawMost(c,g);else if(g.bb2rc)drawRace(c,g);});
  BB2.hook('bossIn',function(e,g){if(g.bb2v&&g.bb2v.x.boss&&e){e.hp*=1.5;e.max=e.hp;e.dmg*=1.25;}});
  BB2.hook('upOffer',function(cards,g,rr){var q=g.bb2v,i;if(rr&&g.bb2hq)g.bb2hq.rr=1;if(!q)return;
    if(q.x.norr){g.rerolls=0;g.banN=0;g.rrAd=1;}
    if(q.x.w4&&g.weapons.length>=4){for(i=cards.length-1;i>=0;i--)if(cards[i]&&cards[i].t==='w'&&cards[i].lvl===1&&!g.weapons.some(function(w){return w.id===cards[i].id;}))cards.splice(i,1);if(!cards.length)cards.push({t:'gold'});}});
  BB2.hook('upPick',function(c,cards,g){if(g.bb2hq&&c!==cards[0])g.bb2hq.bad=1;});
  BB2.hook('end',function(g,win){if(!g.bb2t)return;
    try{if(g.bb2lih)endLih(g,win);}catch(e){console.warn('tail lih',e);}
    try{if(g.bb2most)endMost(g,win);}catch(e){console.warn('tail most',e);}
    try{if(g.bb2v)endVow(g,win);}catch(e){console.warn('tail vow',e);}
    try{if(g.bb2hq)endHq(g,win);}catch(e){console.warn('tail hq',e);}
    try{if(g.bb2rc)endRace(g,win);}catch(e){console.warn('tail race',e);}});

  /* bk2410 (флаг mostx): победа в последней главе кампании (любой уровень) — позвать на «Мост без конца» (после «Забрать» — окно моста) */
  BB2.hook('modal',function(kind,m){try{if(kind!=='result'||!on('mostx')||typeof G==='undefined'||!G||G.endless||G.daily||G.weekly||G.bb2most||G.chi!==campLast()||!BB2.win||!mOpen())return;
    var x=BB2.put(m,'end','<div class="tutbox" style="margin:6px 0 0;padding:6px 10px;font-size:13.5px;line-height:1.35"><b>'+L('🌉 Дальше — без конца','🌉 What next — endless')+'</b><br>'+
      L('Калинов мост для тебя теперь бесконечный: этажи за Смородиной, рекорд и золото за боссов. А ещё Лихая неделя и Зароки — на карте.','Kalinov Bridge is now endless for you: floors beyond the Smorodina, a record and gold for bosses. Plus the Wild Week and Vows on the map.')+
      '<button class="btn ghost" id="tlFinGo" style="width:100%;margin-top:6px">'+L('Забрать и на мост','Collect and go to the bridge')+'</button></div>','tlFin'),b=el('tlFinGo');
    if(b){stat('tl',{a:'fin',k:'most'});b.onclick=function(){var o=el('rOk')||el('rNext')||el('rForge');SND.click();if(o)o.click();setTimeout(function(){if(!$('modal').classList.contains('on'))openMost();},700);};}}catch(e){}});

  /* =====================================================================================================================
     Итоги похода: строки хвоста сразу под заголовком
     ===================================================================================================================== */
  BB2.hook('modal',function(kind,m){if(kind!=='result'||typeof G==='undefined'||!G||!G.bb2res)return;var R=G.bb2res,h='',x,i,b;
    function row(t){h+='<div class="tutbox" style="margin:4px 0;padding:5px 9px;font-size:13.5px;line-height:1.3">'+t+'</div>';}
    if(x=R.most){b=m.querySelector('h3');if(b)b.textContent=x.win?L('Привал на Калиновом мосту!','A rest on Kalinov Bridge!'):L('Мост не сдаётся','The bridge holds');b=m.querySelector('p.sub');if(b)b.textContent=L('Калинов мост: лучший этаж сезона — ','Kalinov Bridge: best floor this season — ')+x.to;
      row('🌉 '+(x.win?L('Этажи '+(x.from+1)+'–'+x.fl+' пройдены, босс повержен.','Floors '+(x.from+1)+'–'+x.fl+' cleared, boss down.'):L('Дошёл до этажа '+x.fl+'. Снова — с привала на '+(Math.floor(x.to/mRest())*mRest())+'-м.','Reached floor '+x.fl+'. Next try starts from the rest at '+(Math.floor(x.to/mRest())*mRest())+'.'))+
        (x.gold?' <b>+'+fmtNum(x.gold)+goldW()+'</b>':'')+(x.tro?L(', трофеи ×',', trophies ×')+x.tro:'')+(x.it.length?'<br>'+x.it.join(' · '):''));
      b=m.querySelector('.rstars');if(b)b.style.display='none';b=m.querySelector('.prog');if(b)b.style.display='none';}
    if(x=R.lih){b=m.querySelector('.rstars');if(b&&!x.old)b.innerHTML='<i class="stars" style="font-style:normal;font-size:24px;letter-spacing:3px;color:var(--cGold,#b8860b)">'+star3(x.got|0)+'</i><small style="display:block">'+L('лихие звёзды главы','Wild Week stars')+'</small>';
      if(x.old)row('🌪 '+L('Неделя сменилась, пока ты бился: звёзды этой главы уже не в счёт.','The week changed while you fought: these stars no longer count.'));
      else row('🌪 '+L('Лихая неделя: ','Wild Week: ')+(x.nw?L('новых звёзд ','new stars ')+'<b>'+x.nw+'</b> · ':'')+L('всего ','total ')+'<b>'+(x.tot|0)+L(' из 9',' of 9')+'</b>'+(x.gold?' · <b>+'+fmtNum(x.gold)+goldW()+'</b>':'')+(x.ch.length?'<br>🎁 '+x.ch.join('<br>🎁 '):''));}
    if(x=R.vow){if(x.win)row('☠ '+L('Зарок сдержан: ','Vow kept: ')+'<b>'+x.sk+'</b>'+(x.add?L(' — новый рекорд главы (было '+x.old+')',' — new chapter record (was '+x.old+')'):L(' (рекорд главы '+x.old+')',' (chapter record '+x.old+')'))+(x.gold?' · '+L('золото +','gold +')+x.pct+' % (<b>+'+fmtNum(x.gold)+'</b>)':'')+
        (x.trk&&x.trk.gold?'<br>'+L('Дорожка черепов: ','Skull track: ')+'<b>+'+fmtNum(x.trk.gold)+goldW()+'</b>':'')+(x.trk&&x.trk.it.length?'<br>'+L('Награда: ','Reward: ')+x.trk.it.join(' · '):''));
      else row('☠ '+L('Зарок на '+x.sk+' не сдержан — нечисть хихикает. Черепа дают только за победу.','The vow of '+x.sk+' is broken — the monsters giggle. Skulls come only with a win.'));}
    if(x=R.hq)row('🏅 '+L('Подвиг «'+x.name+'» свершён: ','Feat “'+x.name+'” done: ')+'<b>+'+fmtNum(x.gold)+goldW()+'</b>'+(x.all?L(' · все пять подвигов богатыря!',' · all five feats of this hero!'):''));
    if((x=R.race)&&x.had)row('🏁 '+(x.won?L('Обогнал вчерашнего себя на ','You beat yesterday’s you by ')+'<b>'+x.d+'</b>'+(x.gold?' · <b>+'+fmtNum(x.gold)+goldW()+'</b>':''):L('Вчерашний ты впереди на ','Yesterday’s you is ahead by ')+'<b>'+(-x.d)+'</b>'+L(' — он тоже старался.',' — he tried hard too.')));
    if(h)BB2.put(m,'top',h,'tlRes');});

  /* =====================================================================================================================
     Карта: кнопка зарока рядом с «Выступить» и карточка «Удаль молодецкая» (Лихая неделя, мост, подвиги, черепа)
     ===================================================================================================================== */
  function chInfo(slot,sel,info){var gb=el('goBtn'),w,vb,a,sk,can,h='',d,i;
    if(on('vow')&&isOpen()&&sel){w=sel.querySelector('.difseg');vb=el('tlVow'); /* кнопка зарока — четвёртой в ряду сложности: высоты не добавляет */
      if(w&&!vb){vb=document.createElement('button');vb.id='tlVow';vb.style.cssText='flex:none;min-width:54px;padding-left:6px;padding-right:6px;font-weight:900;white-space:nowrap';w.appendChild(vb);
        vb.onclick=function(e){if(e&&e.stopPropagation)e.stopPropagation();SND.click();openVow(mapSel);};}
      if(vb){a=vowSel();sk=vowSk(a);can=!!S.done[slot];vb.innerHTML='☠'+(sk?' '+sk:'');vb.setAttribute('aria-label',L('Зароки','Vows'));vb.style.opacity=can?'1':'.5';vb.style.outline=can&&sk?'3px solid var(--cBad,#c0392b)':'';}
}
    if(!info||!isOpen())return;
    function line(id,ic2,t,s){h+='<button class="tlr" id="'+id+'" style="display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin:0;padding:5px 2px;background:none;border:0;border-top:1px solid var(--line,rgba(0,0,0,.15));color:inherit;text-align:left;font:inherit;cursor:pointer"><span style="font-size:20px;flex:none;width:28px;text-align:center">'+ic2+'</span><span style="flex:1;min-width:0"><b style="display:block;font-size:14px;line-height:1.2">'+t+'</b><span style="display:block;font-size:12.5px;line-height:1.25;opacity:.85">'+s+'</span></span><span style="flex:none;font-weight:900">›</span></button>';}
    if(on('lih')){var l=lihState();if(l)line('tlRL','🌪',L('Лихая неделя · ','Wild Week · ')+lihStars(l)+L(' ★ из 9',' ★ of 9'),weekly().name+L(': три твои главы под лихом',': three of your chapters under the rule'));}
    if(on('most')){if(mOpen()){var m=mState();line('tlRM','🌉',L('Калинов мост · этаж ','Kalinov Bridge · floor ')+m.f+(mAll()?'':L(' из ',' of ')+mFloors()),L('Башня сезона: пролёт из '+mRest()+' этажей, на последнем босс','Season tower: a span of '+mRest()+' floors with a boss at the end'));}
      else line('tlRM','🌉',L('Калинов мост','Kalinov Bridge'),L('🔒 Откроется после шести пройденных глав','🔒 Unlocks after six cleared chapters'));}
    if(on('hq')){var nx=T.hqNext(S.hero),hr=HERO_BY[S.hero];line('tlRH','🏅',L('Подвиги героев','Hero feats')+(hr?' · '+hr.name.split(' ')[0]+' '+T.hqDone(S.hero)+'/5':''),nx?'«'+nx.name+'»: '+nx.text:L('Все подвиги этого богатыря свершены — зови другого','All feats of this hero are done — call another'));}
    if(on('vow')){var tot=vowTotal(),n2=vowNext(tot),tt=vowTitle();line('tlRV','☠',L('Зароки · черепов ','Vows · skulls ')+tot+(tt?' · '+tt:''),n2?L('На ','At ')+n2[0]+' — '+n2[1]+' '+LL(n2[2]):L('Дорожка черепов пройдена!','Skull track complete!'));}
    if(!h)return;d=el('tlCard');if(!d){d=document.createElement('div');d.id='tlCard';d.className='card';d.style.cssText='padding:8px 10px 2px';var f=info.querySelector('.card');if(f&&f.nextSibling)info.insertBefore(d,f.nextSibling);else info.appendChild(d);}
    d.innerHTML='<b style="display:block;font-size:14px;margin:0 0 5px">'+L('Удаль молодецкая','For the bold')+'</b>'+h;
    var mp={tlRL:openLih,tlRM:openMost,tlRH:openHq,tlRV:function(){openVow(mapSel);}};for(i in mp)(function(id,fn){var b=el(id);if(b)b.onclick=function(){SND.click();fn();};})(i,mp[i]);}
  BB2.hook('chInfo',function(slot,sel,info){try{chInfo(slot,sel,info);}catch(e){console.warn('tail chInfo',e);}});
  /* «Дела на сегодня» и «Утро богатыря» (EVENT): Лихая неделя — строкой и плиткой */
  BB2.hook('today',function(TL){try{var l=lihState();if(!l||!Array.isArray(TL))return;var n=lihStars(l);
    TL.push({k:'tl_lih',ic:'e_perun',t:L('Лихая неделя','Wild Week'),s:weekly().name+' · '+n+L(' ★ из 9',' ★ of 9'),ready:n===0,b:L('Открыть','Open'),fn:function(){hideModal();openTab('Map');openLih();}});}catch(e){}});
  BB2.hook('utroTile',function(a){try{var l=lihState();if(l&&Array.isArray(a))a.push({ic:'🌪',t:L('Лихая неделя','Wild Week'),s:lihStars(l)+L(' ★ из 9',' ★ of 9'),w:lihStars(l)<9?55:10,fn:function(){openTab('Map');openLih();}});}catch(e){}});
  BB2.hook('utroRow',function(a){try{if(mOpen()&&Array.isArray(a)){var m=mState();if(mBase(m)<mEnd())a.push({ic:'🌉',t:L('Калинов мост','Kalinov Bridge'),s:L('Этаж ','Floor ')+m.f+(mAll()?'':L(' из ',' of ')+mFloors()),fn:function(){openTab('Map');openMost();}});}}catch(e){}});
  BB2.hook('tab',function(){PEND=null;});
  /* для стенда и бота */
  T.test={pend:function(o){PEND=o;if(o)o.t=Date.now();},vows:VOWS,rules:MR,hq:HQ,lihCap:LIH_CAP};
  /* меню уже нарисовано — дорисовать карту */
  try{if(typeof curTab!=='undefined'&&curTab==='Map'&&!document.body.classList.contains('run')&&el('chInfo'))renderChInfo();}catch(e){}
})();
