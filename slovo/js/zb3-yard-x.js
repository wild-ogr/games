'use strict';
/* ================= zb3-yard-x — «Двор дома №7» вместо Дома: вся логика (поток YARD, 24.10.2026; журнал hobby-analytics/release-i/zina-boost3/Z3-YARD.md) =================
   Грузится лениво из js/zb3-yard.js (там флаги и поле S.z3y — до облака). Привязка рисунка: бирка предмета — элемент с data-z3y="<id>" в #z3yTags.
   Двор — это тот же #menu / zb-home (#zbHub): сцена #zbScene становится картинкой двора (js/zb3-art-yard.js, лениво), на ней бирки 8 предметов
   (Z3.YARD), Зина в окне кухни, кот на лавочке, реплика #mSay над окном, «Помочь Зине» (= старая #btnPlay) внизу сцены. Колонка zb-home
   (календарь, записки, дневник, Вечёрка, Школа, соседки, гостинец, цель облика, «Завтра…», после — все старые гнёзда ZB.homeSlots) — как была:
   на телефоне под двором, на ПК справа. Таблица «было → где теперь» — журнал Z3-YARD.md.
   Предметы: хозяин зовёт Z3.yardAdd({id,…}) — его предмет заменяет здешний (DEF). Здешние: kitchen (уровни), paper (Вечёрка), mail (письмо и пирожок),
   bench (соседки), school (Школа №7), kiosk (ярмарка), album (Облики — комод), build (заглушка «скоро»).
   «Неделя новосёла» (Z3.OPEN): открыт — бирка; откроется завтра — тихий силуэт «откроется завтра»; позже — не видно. Открылся — церемония раз (Зина
   над окном, предмет светится). Старым игрокам (день 99) — одно «добро пожаловать во двор».
   Флаги (?off=…): z3y — весь двор (старый Дом zb-home), z3y-cer — церемонии, z3y-pie — показ двора после 4-го уровня + письмо + пирожок,
   z3y-demo — 1-й уровень: Зина сама собирает первое слово, z3y-okpc — подсказка «где меня найти» на ПК в ОК.
   Поле S.z3y {c биты церемоний, w привет старым, l биты писем, p когда поспеет пирожок (мс), g пирожок съеден, d демо 1-го уровня, k подсказка ОК-ПК, r двор показан новичку}.
   Z3Y.letter(id, then) — письмо (заменяемо: MAIL кладёт своё). STAT z3y {a: show|go|lock|soon|cer|pie|eat|reveal|demo|okpc, …}. */
(function(){
  var Z=window.Z3,Y0=window.Z3Y0;if(!Z||!Y0)return;var F=Y0.F;
  var DE=document.documentElement,BIT={paper:1,build:2,mail:4,bench:8,school:16,kiosk:32,album:64,kitchen:128};
  function Y(){return S.z3y||(S.z3y={c:0,w:0,l:0,p:0,g:0,d:0,k:0,r:0});}
  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function tap(){try{SND.tap();}catch(e){}}
  function now(){try{return nowMs();}catch(e){return Date.now();}}
  function ev(o){Z.ev('z3y',o);}
  // тексты — TEXT (z3-text/yard.txt → tools/zb3_yard_data.py → js/zb3-yard-data.js, лениво); до загрузки реплика просто не меняется
  function T(k,ctx){return Z.txt('yard-'+k,ctx);}
  function T0(k){var L=window.Z3T&&Z3T['yard-'+k];return L&&L[0]||'';}
  var TXT=ZB.load('js/zb3-yard-data.js').then(function(){if(built)ZB.safe('y:txt',function(){playTxt();sub();});},function(){});
  function sayM(t){var m=$('mSay');if(m&&t)m.textContent=t;}
  var ART=null;function art(){if(!ART)ART=ZB.load('js/zb3-art-yard.js').then(function(){render();},function(){DE.classList.add('z3y-noart');Y0.unwait();});return ART;}
  var OKPC=false;try{OKPC=typeof OK!=='undefined'&&OK&&/desktop/.test(new URLSearchParams(location.search).get('vk_platform')||'');}catch(e){}

  /* ---------- предметы по умолчанию (хозяин заменит Z3.yardAdd с тем же id) ---------- */
  function hasF(n){return typeof window[n]==='function';}
  function chapNote(){if(S.lv>=LEVELS.length)return 'все уроки пройдены';var c=ZB.chapAt(Math.min(S.lv,LEVELS.length-1)),ch=ZB.chap(c);
    return 'глава '+ch.n+' · '+Math.max(0,S.lv-ch.from)+' из '+(ch.to-ch.from+1);}
  function pieLeft(){var p=+Y().p;return p?p-now():0;}
  function hm(ms){var m=Math.max(1,Math.ceil(ms/6e4));return m>=60?Math.floor(m/60)+' ч'+(m%60?' '+m%60+' мин':''):m+' мин';}
  function paperOn(){try{return !!(window.ZBNUM&&ZBNUM.el&&ZBNUM.el());}catch(e){return false;}}
  var DEF={
    kitchen:{id:'kitchen',order:10,t:'Кухня Зины',ic:'🍵',note:chapNote,go:function(){var b=$('btnPlay');if(b)b.click();}},
    paper:{id:'paper',order:20,t:'Вечёрка',ic:'📰',note:function(){return paperOn()?'свежий номер':'скоро';},stub:function(){return !paperOn();},
      go:function(){if(ZB._scr.vech)ZB.go('vech');else ZB.load('js/zb3-num-x.js').then(function(){if(ZB._scr.vech)ZB.go('vech');});}},
    build:{id:'build',order:30,t:'Стройка',ic:'🏗️',note:function(){var b=pk('build');return b&&b.goal?'всем домом: '+Math.min(100,Math.round(100*b.st/b.goal))+'%':'скоро';},
      stub:function(){var b=pk('build');return !(b&&b.goal);},
      go:function(){var b=pk('build');sayM(T('build-say'));}},
    mail:{id:'mail',order:40,t:'Почта',ic:'✉️',note:function(){var y=Y();if(y.p&&!y.g){var l=pieLeft();return l>0?'пирожок через '+hm(l):'пирожок поспел!';}
        return y.l&1?'писем пока нет':'письмо от Зины';},
      badge:function(){var y=Y();return y.p&&!y.g&&pieLeft()<=0?'1':!(y.l&1)&&F.pie?'1':'';},hot:function(){var y=Y();return !!(y.p&&!y.g&&pieLeft()<=0);},
      go:function(){var y=Y();if(y.p&&!y.g&&pieLeft()<=0){eat();return;}if(y.p&&!y.g){sayM(T('pie-wait'));return;}
        if(!(y.l&1)&&F.pie){Z3Y.letter('pie',function(){});return;}sayM(T('mail-empty'));}},
    bench:{id:'bench',order:50,t:'Подъезд',ic:'🏠',note:function(){var h=pk('house');if(h&&h.now>=30)return 'сегодня '+h.now+' жильцов';if(h&&h.pct)return 'заходили '+h.pct+'%';return hasF('openSosedki')?'соседки':'скоро';},
      stub:function(){return !hasF('openSosedki');},go:function(){openSosedki('menu');}},
    school:{id:'school',order:60,t:'Школа №7',ic:'🏫',note:function(){return 'кабинеты';},
      badge:function(){try{return window.ZBCAB&&ZBCAB.dot&&ZBCAB.dot()?'!':'';}catch(e){return '';}},go:function(){ZB.go('school');}},
    kiosk:{id:'kiosk',order:70,t:'Ларёк',ic:'🏪',note:function(){return window.ZB2FAIR?'ярмарка у ворот':'скоро';},stub:function(){return !window.ZB2FAIR;},
      go:function(){ZB2FAIR.open();}},
    album:{id:'album',order:80,t:'Комод',ic:'👗',note:function(){return 'наряды и блюдца';},go:function(){openShop();}}};
  // сервер дома (Z3.srv, договор Z3-SRV-API.md): строки состояния стройки и подъезда — из последнего ответа; свежий — раз за сеанс
  function pk(k){try{return Z.srv&&Z.srv.peek?Z.srv.peek(k):null;}catch(e){return null;}}
  var srvAsked=0;function srvAsk(){if(srvAsked||!Z.srv||!Z.srv.peek)return;srvAsked=1;['house','build'].forEach(function(k){try{Z.srv.get(k).then(function(){},function(){});}catch(e){}});}
  ZB.on('z3srv',function(o){if(o&&(o.kind==='house'||o.kind==='build')&&built)ZB.safe('y:srv',function(){tags();place();});});
  ZB.on('z3late',function(){if(built)ZB.safe('y:late',function(){tags();place();});}); /* BUILD: поздние части модулей догрузились — бирки заново */
  function item(id){var o=Z.yardGet(id);return o||DEF[id];}
  function call(o,k,d){if(!o||typeof o[k]!=='function')return o&&o[k]!=null&&typeof o[k]!=='function'?o[k]:d;var r=ZB.safe('y:'+o.id+':'+k,function(){return o[k]();});return r==null?d:r;}
  // предмет виден? 'open' | 'lock' (откроется завтра — силуэт) | '' (не видно)
  function state(id){if(Z.open(id))return 'open';var d=Z.OPEN[id]||1;return d-Z.day()===1?'lock':'';}

  /* ---------- стили ---------- */
  var css0=0;function css(){if(css0)return;css0=1;var s=document.createElement('style');s.id='z3yCss';s.textContent=
    'html.z3y .zbh-scene{background:var(--z3-y-sky1)}html.z3y #zbSceneBg,html.z3y .zbh-veil,html.z3y .zbh-hero{display:none}'+
    'html.z3y #zbChap,html.z3y #zbPlay{display:none}'+
    '#z3yArt,#z3yTags{position:absolute;left:0;top:0;width:100%;height:100%}#z3yArt>svg{width:100%;height:100%;display:block}#z3yTags{z-index:3;pointer-events:none}'+
    '.z3y-tag{position:absolute;pointer-events:auto;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-height:44px;max-width:132px;padding:5px 10px 5px 10px;'+
      'background:var(--z3-y-tag);color:var(--z3-y-tag-ink);border:0;border-radius:var(--z3-rb);box-shadow:var(--z3-shadow);font:inherit;font-family:var(--z3-font);text-align:left;cursor:pointer}'+
    '.z3y-tag b{font-size:14.5px;line-height:1.15;white-space:nowrap}.z3y-tag b i{font-style:normal;margin-right:4px}'+
    '.z3y-tag small{font-size:13.5px;line-height:1.15;color:var(--z3-y-tag-ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:112px}'+
    '.z3y-tag em{position:absolute;right:-7px;top:-8px;min-width:20px;height:20px;border-radius:10px;background:var(--z3-y-badge);color:#fff;font-style:normal;font-size:13.5px;font-weight:800;line-height:20px;text-align:center;padding:0 5px}'+
    /* SKIN 25.10: узкий экран (<520) — компактные бирки: значок + слово; строка состояния только у «горящих» и «откроется завтра» */
    '#z3yTags.nar .z3y-tag{padding:4px 9px;max-width:126px}#z3yTags.nar .z3y-tag small{display:none}#z3yTags.nar .z3y-tag.hot small,#z3yTags.nar .z3y-tag.lock small{display:block}#z3yTags.xs .z3y-tag{padding:4px 7px}#z3yTags.xs .z3y-tag b i{margin-right:2px}'+
    'html.z3y.zbv body.fest-leaves #menu::before,html.z3y.zbv body.fest-snow #menu::before{display:none}'+
    '.z3y-tag.lock{opacity:.62;background:var(--z3-y-tag);filter:grayscale(1)}.z3y-tag.lock b{font-weight:700}'+
    '.z3y-tag.hot{box-shadow:0 0 0 3px var(--z3-y-lamp),var(--z3-shadow)}.z3y-tag.new{animation:z3yNew 1s ease-in-out 4 alternate}'+
    '@keyframes z3yNew{from{box-shadow:0 0 0 0 var(--z3-y-lamp)}to{box-shadow:0 0 0 7px var(--z3-y-lamp)}}@media (prefers-reduced-motion:reduce){.z3y-tag.new{animation:none;box-shadow:0 0 0 4px var(--z3-y-lamp)}}'+
    '.z3y-cat{position:absolute;z-index:3;background:none;border:0;padding:0;cursor:pointer}'+
    'html.z3y #zbSayBox.zbh-say{left:0;top:0;right:auto;bottom:auto;width:min(64%,300px);justify-content:flex-start}'+
    'html.z3y #zbSayBox .mbubble{font-size:14.5px;max-height:none}html.z3y #zbSayBox .mbubble::after{display:none}'+
    '#z3yPlay{position:absolute;z-index:4;left:14px;right:14px;bottom:12px}#z3yPlay #btnPlay{width:100%;margin:0;display:flex;flex-direction:column;align-items:center;padding:10px 12px!important;font-size:22px!important;line-height:1.1;'+
      'background:var(--z3-acc);color:var(--z3-acc-ink);border-radius:var(--z3-r)}'+
    '#z3yPlay #btnPlay>.ti{position:absolute;left:16px;top:50%;margin-top:-13px;width:26px;height:26px}#z3yPlay #playLv{display:none}#z3yPlay .z3y-sub{display:block;font-size:14px;font-weight:700;opacity:.92;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    'html.z3y .zbh-chip{display:none}html.z3y-noart #z3yTags,html.z3y-noart #z3yCat{display:none}html.z3y-noart .zbh-scene{background:var(--z3-y-sky2)}'+
    '@media (min-width:860px){#z3yPlay{left:50%;right:auto;width:min(440px,80%);transform:translateX(-50%);bottom:16px}html.z3y .zbh-chip{display:block}}'+
    '.z3y-rev{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;overflow:hidden;background:var(--z3-y-sky1)}.z3y-rev .z3y-zoom{position:absolute;left:0;top:0;width:100%;height:100%;transition:transform 1.8s ease-in-out}'+
    '.z3y-rev .z3y-zoom svg{width:100%;height:100%;display:block}'+
    '.z3y-let{position:absolute;left:50%;bottom:24px;width:min(92%,380px);transform:translateX(-50%);background:var(--z3-paper);color:var(--z3-ink);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);padding:16px 18px;opacity:0;transition:opacity .5s}'+
    '.z3y-let.on{opacity:1}.z3y-let p{margin:0 0 10px;font-size:17px;line-height:1.35;font-family:var(--z3-font-hand)}.z3y-let .sig{text-align:right;font-size:15px;color:var(--z3-ink2)}'+
    '.z3y-let button{width:100%;min-height:48px;border:0;border-radius:var(--z3-rb);background:var(--z3-acc);color:var(--z3-acc-ink);font:inherit;font-size:18px;font-weight:800;cursor:pointer}'+
    '.z3y-pie{text-align:center}.z3y-pie .big{font-size:56px;line-height:1.1}';
    document.head.appendChild(s);}

  /* ---------- раскладка ---------- */
  var built=false,lastKey='',lay='tall',fit={s:1,x:0,y:0};
  function build(){var sc=$('zbScene');if(!sc)return false;if(built)return true;built=true;css();DE.classList.add('z3y');
    var a=document.createElement('div');a.id='z3yArt';sc.insertBefore(a,sc.firstChild);
    var t=document.createElement('div');t.id='z3yTags';sc.appendChild(t);
    var p=document.createElement('div');p.id='z3yPlay';sc.appendChild(p);var b=$('btnPlay');
    if(b){p.appendChild(b);playTxt();var sub=document.createElement('small');sub.className='z3y-sub';sub.id='z3ySub';b.appendChild(sub);}
    var c=document.createElement('button');c.type='button';c.className='z3y-cat';c.id='z3yCat';c.setAttribute('aria-label','Кот Ять');
    c.onclick=function(){try{SND.meow();}catch(e){}sayM(typeof say==='function'?say('cat'):'Мяу.');};sc.appendChild(c);
    window.addEventListener('resize',function(){if(built)ZB.safe('y:fit',place);});
    return true;}
  function heightFix(){var sc=$('zbScene');if(!sc)return;if(innerWidth>=860){sc.style.height='';return;}
    var nav=$('zbNav'),top=$('zbHomeTop'),nh=nav&&nav.offsetParent?nav.offsetHeight:0,th=top?top.offsetHeight:0;
    sc.style.height=Math.max(420,innerHeight-nh-th-40)+'px';}
  function place(){heightFix();var sc=$('zbScene'),A=window.Z3ART;if(!sc||!A||!A.yardLay)return;
    var W=sc.clientWidth,H=sc.clientHeight;if(!W||!H)return;var nl=W/H<.85?'tall':'sq',L=A.yardLay[nl];
    var key=nl+'|'+(S.outfit||'')+'|'+hotKey()+'|'+scene().time+scene().season+'|'+(A.yardRev||0);/* SKIN: yardRev — догрузились праздники/постройки */if(key!==lastKey){lastKey=key;lay=nl;
      $('z3yArt').innerHTML=Z.art('yard',{lay:nl,time:scene().time,season:scene().season,hot:hotMap()});}
    var v=L.vb,s=Math.max(W/v[2],H/v[3]);fit={s:s,x:(W-v[2]*s)/2-v[0]*s,y:(H-v[3]*s)/2-v[1]*s};
    function px(p){return [fit.x+p[0]*s,fit.y+p[1]*s];}
    var sr=sc.getBoundingClientRect(),zk=1;try{if(typeof uiZoom==='function')zk=uiZoom()||1;}catch(e){} // ПК ≥1200: html.zk — экранные px ÷ масштаб
    function rel(e){if(!e||!e.offsetParent)return null;var r=e.getBoundingClientRect();if(!r.width)return null;return {l:(r.left-sr.left)/zk,t:(r.top-sr.top)/zk,r:(r.right-sr.left)/zk,b:(r.bottom-sr.top)/zk};}
    // облачко Зины — в небе: телефон слева под кнопками звука, ПК справа сверху
    var obs=[],mt=rel(sc.querySelector('.mtop')),pl=rel($('z3yPlay')),sb=$('zbSayBox'),wide=innerWidth>=860;
    [].forEach.call(sc.querySelectorAll('.mtop .ibtn,.mtop .coins'),function(e){var r=rel(e);if(r)obs.push(r);});
    var ht=$('zbHomeTop');if(wide&&ht)[].forEach.call(ht.children,function(e){var r=rel(e);if(r)obs.push(r);});
    if(sb){var bw=sb.offsetWidth||220,top0=(mt?mt.b:8)+8;if(wide&&ht)[].forEach.call(ht.children,function(e){var r=rel(e);if(r&&r.r>W-bw-24)top0=Math.max(top0,r.b+8);});sb.style.left=Math.round(wide?W-bw-16:10)+'px';sb.style.top=Math.round(wide?Math.max(top0,70):top0)+'px';var br=rel(sb);if(br)obs.push(br);}
    var bot=pl?pl.t-4:H-4;if(pl)obs.push(pl);
    var gp=W<340?2:4; /* SKIN: на совсем узком — зазор между бирками меньше */
    function hit(x,y,w,h){if(x<gp||x+w>W-gp||y<gp||y+h>bot)return true;for(var i=0;i<obs.length;i++){var o=obs[i];if(x<o.r+gp&&x+w>o.l-gp&&y<o.b+gp&&y+h>o.t-gp)return true;}return false;}
    var TB=$('z3yTags');TB.classList.toggle('nar',W<520);TB.classList.toggle('xs',W<340);var T=[].slice.call(TB.children),PR=['kitchen','mail','paper','bench','school','album','build','kiosk'];
    T.sort(function(a,b){return PR.indexOf(a.getAttribute('data-y'))-PR.indexOf(b.getAttribute('data-y'));});
    T.forEach(function(e){var p=L.pts[e.getAttribute('data-y')];if(!p)return;var q=px(p),w=e.offsetWidth,h=e.offsetHeight,x0=q[0]-w/2,y0=q[1]-h,best=null,C=[[0,0],[0,h+16]];
      for(var k=1;k<=7;k++){var d=k*(h/2+4);C.push([0,-d],[0,d+h]);}
      [0,-1,1,-2,2].forEach(function(m){C.forEach(function(c){if(!best){var x=Math.max(4,Math.min(W-w-4,x0+m*(w/2+10))),y=y0+c[1];if(!hit(x,y,w,h))best=[x,y];}});});
      if(!best){var bd=1e9;for(var yy=gp;yy+h<=bot;yy+=3)for(var xx=gp;xx+w<=W-gp;xx+=3){if(hit(xx,yy,w,h))continue;var dd=(xx-x0)*(xx-x0)+(yy-y0)*(yy-y0);if(dd<bd){bd=dd;best=[xx,yy];}}} /* SKIN: свободное место ближе всего к предмету */
      if(!best)best=[Math.max(4,Math.min(W-w-4,x0)),Math.max(4,Math.min(bot-h,y0))];
      e.style.left=Math.round(best[0])+'px';e.style.top=Math.round(best[1])+'px';obs.push({l:best[0],t:best[1],r:best[0]+w,b:best[1]+h});});
    var c=$('z3yCat'),cq=px(L.cat);if(c){c.style.left=Math.round(cq[0])+'px';c.style.top=Math.round(cq[1])+'px';c.style.width=c.style.height=Math.round(L.cat[2]*s)+'px';}}
  // время суток и сезон сцены (art получает opts.time/season); ?yt=day|eve&ys=summer|autumn — для проверки
  var QS={};try{var q=new URLSearchParams(location.search);QS.t=q.get('yt');QS.s=q.get('ys');}catch(e){}
  function scene(){if(Z.scene)return Z.scene(QS);/* SKIN 25.10: день/вечер/ночь и 4 сезона — js/zb3-skin.js */var d=new Date(now()),h=d.getHours(),m=d.getMonth();return {time:QS.t||(h>=18||h<6?'eve':'day'),season:QS.s||(m>=8&&m<=10?'autumn':'summer')};}
  function hotMap(){var h={};Z.YARD.forEach(function(id){var o=item(id);if(state(id)==='open'&&call(o,'hot',false))h[id]=1;});return h;}
  function hotKey(){return Object.keys(hotMap()).join(',');}

  /* ---------- бирки ---------- */
  /* SKIN 25.10: значок MIX вместо эмодзи (js/zb3-art-icons.js лениво; эмодзи — скрытым текстом) */
  var ICL=0;function ICN(id,e){var A=window.Z3ART,em=e&&String(e).length<5?String(e):'';if(ZB2.off('z3ic'))return em?'<i>'+esc(em)+'</i>':'';if(A&&A.icHtml&&A.ic(id))return A.icHtml(id,em);
    if(!ICL&&Z.artLoad){ICL=1;Z.artLoad('icons').then(function(){var s=document.getElementById('z3icCss');if(!s&&Z3ART.icCss){s=document.createElement('style');s.id='z3icCss';s.textContent=Z3ART.icCss;document.head.appendChild(s);}tags();ZB.safe('y:fit',place);},function(){});}
    return em?'<i>'+esc(em)+'</i>':'';}
  var NEWIDS={},SHORT={'Кухня Зины':'Кухня','Школа №7':'Школа'}; /* SKIN: короче на узком экране */
  function tags(){var box=$('z3yTags');if(!box)return;var h='';
    Z.YARD.forEach(function(id){var st=state(id);if(!st)return;var o=item(id);if(!o)return;
      var stub=o===DEF[id]&&call(o,'stub',false),t=(innerWidth<520&&SHORT[o.t])||o.t||id,n=st==='lock'?'откроется завтра':stub?'скоро':call(o,'note',''),b=st==='open'&&!stub?call(o,'badge',''):'',hot=st==='open'&&!stub&&call(o,'hot',false);
      h+='<button type="button" class="z3y-tag'+(st==='lock'?' lock':'')+(hot?' hot':'')+(NEWIDS[id]?' new':'')+'" data-y="'+id+'" data-z3y="'+id+'" data-st="'+(st==='lock'?'lock':stub?'stub':'open')+'">'+
        '<b>'+ICN(id,o.ic)+esc(t)+'</b>'+(n?'<small>'+esc(n)+'</small>':'')+(b?'<em>'+esc(b)+'</em>':'')+'</button>';});
    box.innerHTML=h;
    [].forEach.call(box.children,function(e){e.onclick=function(){var id=e.getAttribute('data-y'),st=e.getAttribute('data-st');tap();
      if(st==='lock'){ev({a:'lock',id:id,d:Math.min(Z.day(),99)});sayM(T(Math.random()<.5?'lock':'lock-say'));return;}
      if(st==='stub'){ev({a:'soon',id:id});sayM(T('soon'));return;}
      if(!Z.yardGet(id))Z.yardAdd(DEF[id]);Z.yardGo(id);};});}
  /* SKIN 25.10: надпись «Помочь Зине» — в текстовый узел с буквами (тема оформления заменяет ▶ значком <i class="ti"> — первый узел уже не текст) */
  function playTxt(){var b=$('btnPlay');if(!b)return;var L=T0('play')||'Помочь Зине',ns=b.childNodes,tx=null,i;
    for(i=0;i<ns.length;i++)if(ns[i].nodeType===3&&/[А-Яа-яЁёA-Za-z]/.test(ns[i].nodeValue)){tx=ns[i];break;}
    if(!tx){tx=document.createTextNode('');b.insertBefore(tx,b.firstChild);}var ic=tx.previousSibling&&tx.previousSibling.nodeType===1;
    var v=(ic?' ':'▶ ')+L+' ';if(tx.nodeValue!==v)tx.nodeValue=v;}
  function sub(){playTxt();var e=$('z3ySub');if(!e)return;e.textContent=S.lv>=LEVELS.length?(T0('play-all')||'все уроки пройдены'):'урок '+(S.lv+1)+' · '+chapNote();}

  /* ---------- церемонии и привет ---------- */
  function ceremony(){var y=Y(),d=Z.day();if(!F.cer)return;
    if(d>=99){if(!y.w){y.w=1;y.c|=127;save();ev({a:'cer',id:'welcome'});sayM(T('welcome'));}return;}
    var L=[];Z.YARD.forEach(function(id){var b=BIT[id];if(id==='kitchen'||id==='mail'||!b||y.c&b)return;if(Z.open(id)){y.c|=b;L.push(id);}});
    if(!L.length)return;save();NEWIDS={};L.forEach(function(id){NEWIDS[id]=1;});ev({a:'cer',id:L.join(','),d:d});
    sayM(T('cer-'+L[L.length-1])); // открылось несколько — говорит про самое новое, светятся все
    setTimeout(function(){NEWIDS={};},6000);}
  function pieSay(){var y=Y();if(y.p&&!y.g&&pieLeft()<=0)sayM(T('pie-ready'));}
  function okpc(){var y=Y();if(!F.okpc||!OKPC||y.k||S.lv<3)return;y.k=1;save();ev({a:'okpc'});
    sayM(T('okpc'));}

  /* ---------- письмо и пирожок ---------- */
  function letterHtml(){var t=T('letter')||'Внучек, заходи после обеда — пирожок испеку.\nТвоя Зина.',L=t.split('\n');
    return L.map(function(l,i){return '<p'+(/^Твоя|^P\.S\./.test(l)?' class="sig"':'')+'>'+esc(l)+'</p>';}).join('');}
  var PIE_MS=2*36e5,PIE_C=30,PIE_H=1;
  window.Z3Y={DEF:DEF,render:function(){render();},
    letter:function(id,then){ // заменяемо: MAIL кладёт Z3Y.letter своё (id 'pie' — первое письмо)
      var y=Y();y.l|=1;if(!y.p)y.p=now()+PIE_MS;save();ev({a:'pie',s:'set'});
      modal('<div class="z3y-let on" style="position:static;transform:none;width:auto;box-shadow:none"><h2>✉️ Письмо от Зины</h2>'+letterHtml()+
        '<p style="font-size:15px">🥧 '+'Пирожок будет готов через 2 часа — он будет ждать в почтовом ящике.'+'</p><button type="button" id="z3yLetOk">'+'Хорошо, бабуль!'+'</button></div>');
      var b=$('z3yLetOk');if(b)b.onclick=function(){tap();hideModal();render();if(then)then();};}};
  function eat(){var y=Y();if(!y.p||y.g)return;y.g=1;
    try{addCoins(PIE_C,'z3pie');}catch(e){S.coins=(+S.coins||0)+PIE_C;}
    try{S.hb=Math.min(typeof HB_MAX!=='undefined'?HB_MAX:9,(+S.hb||0)+PIE_H);}catch(e){}save();ev({a:'eat',c:PIE_C,h:PIE_H});
    modal('<div class="z3y-pie"><h2>🥧 '+'Пирожок поспел!'+'</h2><div class="big">🥧</div><p>'+esc(T('pie-ready')||'Ешь, пока горячий.')+' А это тебе к чаю:'+'</p>'+
      '<p style="font-size:20px;font-weight:800">+'+PIE_C+' <span class="coin"></span> и 💡 +'+PIE_H+'</p><div class="btns"><button class="btn green" id="z3yPieOk">'+'Спасибо, бабуль!'+'</button></div></div>');
    var b=$('z3yPieOk');if(b)b.onclick=function(){tap();hideModal();render();};render();}
  // показ двора новичку: после 4-го уровня по «Дальше» — окно кухни «отъезжает», двор, письмо → сразу следующий уровень (без остановки в Доме)
  function revealDue(i){var y=Y();return F.pie&&!y.r&&!(y.l&1)&&!i.daily&&i.idx>=4&&i.idx<=6&&S.lv===i.idx&&Z.day()<=7&&!!(window.Z3ART&&Z3ART.yard);}
  if(F.pie&&typeof window.startLevel==='function'){var sl0=window.startLevel;window.startLevel=function(idx,daily){var self=this,args=arguments;
    if(!ZB.safe('y:rdue',function(){return revealDue({idx:idx,daily:daily});}))return sl0.apply(self,args);
    Y().r=1;save();reveal(function(){sl0.apply(self,args);});};}
  function reveal(then){var done=false;function fin(){if(done)return;done=true;try{el.remove();}catch(e){}then();}
    ev({a:'reveal',lv:S.lv});var W=innerWidth,H=innerHeight,nl=W/H<.85?'tall':'sq',L=Z3ART.yardLay[nl],v=L.vb,s=Math.max(W/v[2],H/v[3]),ox=(W-v[2]*s)/2-v[0]*s,oy=(H-v[3]*s)/2-v[1]*s,w=L.win;
    var cx=ox+(w[0]+w[2]/2)*s,cy=oy+(w[1]+w[3]/2)*s,k=Math.min(4,W/(w[2]*s)*.9);
    var el=document.createElement('div');el.className='z3y-rev';el.innerHTML='<div class="z3y-zoom" style="transform-origin:'+Math.round(cx)+'px '+Math.round(cy)+'px;transform:scale('+k.toFixed(2)+')">'+
      Z.art('yard',{lay:nl,time:scene().time,season:scene().season,hot:{kitchen:1,mail:1}})+'</div>';
    document.body.appendChild(el);var z=el.firstChild,calm=false;try{calm=typeof CALM==='function'&&CALM();}catch(e){}
    setTimeout(function(){z.style.transform='scale(1)';},calm?0:350);
    setTimeout(function(){Z3Y.letter('pie',fin);},calm?300:2300);}

  /* ---------- 1-й уровень: Зина сама собирает первое слово, «теперь ты» ---------- */
  var touched=0;document.addEventListener('pointerdown',function(e){var w=$('wheel');if(w&&e.target&&w.contains(e.target))touched=Date.now();},true);
  function demo(info){if(!F.demo||!info||info.daily||info.idx!==0||S.lv!==0||Y().d)return;var g=G,t0=Date.now(),tries=0;
    (function wait(){if(G!==g||!g||g.won||touched>t0)return;var X=window.ZB2N&&ZB2N.X;
      var busy=$('modal')&&$('modal').classList.contains('on');if(busy||!X||!X.spell||document.hidden){if(++tries<40)setTimeout(wait,500);return;}
      if(Date.now()-t0<1500){setTimeout(wait,300);return;}
      var a=g.words.filter(function(w){return !w.found;}).sort(function(a,b){return a.w.length-b.w.length;});if(!a.length)return;
      Y().d=1;save();ev({a:'demo',ms:Date.now()-t0});X.spell(a[0],'demo');
      var n=a[0].w.length;setTimeout(function(){if(G===g&&!g.won&&a[0].found)try{var t=T('demo-now');if(t)zina(t,'happy',6);}catch(e){}},n*650+1400);})();}
  ZB.on('start',demo);try{if(typeof G!=='undefined'&&G&&!G.won&&G.idx===0&&!G.daily)demo({idx:0,daily:false});}catch(e){}
  // lv1safe грузит zb2-newb-x лениво — попросим заранее, чтобы демо успело
  ZB.on('start',function(info){if(F.demo&&info&&info.idx===0&&S.lv===0&&window.ZB2N&&ZB2N.x)ZB.safe('y:nbx',function(){ZB2N.x();});});

  /* ---------- отрисовка ---------- */
  var shown=0;
  function render(){if(typeof S==='undefined'||!S||!build())return;if(!window.Z3ART||!Z3ART.yardLay){art();sub();return;}
    var ac=$('z3yArtCss');if(!ac&&Z3ART.yardCss){ac=document.createElement('style');ac.id='z3yArtCss';ac.textContent=Z3ART.yardCss;document.head.appendChild(ac);}
    srvAsk();tags();sub();place();Y0.unwait();setTimeout(function(){ZB.safe('y:fit2',place);},60);
    if(!shown&&$('menu')&&$('menu').classList.contains('on')){shown=1;ev({a:'show',d:Math.min(Z.day(),99),l:lay,lv:S.lv,n:$('z3yTags').children.length});}}
  if(ZB.homeRender){var hr0=ZB.homeRender;ZB.homeRender=function(){var r=hr0.apply(this,arguments);ZB.safe('y:render',render);return r;};}
  function onHome(){var go=function(){setTimeout(function(){ZB.safe('y:home',function(){var m=$('mSay'),t0=m&&m.textContent;ceremony();pieSay();if(!m||m.textContent===t0)okpc();render();ZB.emit('yard');});},30);};TXT.then(go,go);} // реплики — после текстов
  ZB.on('home',onHome);
  // модули выполняются после первого openMenu (zb-view) — первый показ двора догоняем по ready
  // грузимся после первого openMenu и ready — первый показ двора догоняем сами
  art().then(function(){var m=$('menu');if(m&&m.classList.contains('on'))onHome();});
})();
