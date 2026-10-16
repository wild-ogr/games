/* ===== bb2-byl-run.js — «БЫЛИНА О ПОХОДЕ» (поток BYL, супер-буст в2): сборка былины, окна, «Книга былин», картинка, «Похвастаться». =====
   Догружается набором 'byl' (в меню в фоне у всех — BB2.late; новичку — после первого похода) вместе со стихами js/bb2-byl-ru.js | -en.js. На старте — только js/bb2-byl.js.
   Флаг: byl (выключен → в итогах ничего нового, Книги нет).

   ---------------- КАК ПОЛЬЗОВАТЬСЯ (другим потокам; всё это есть сразу на старте) ----------------
   BB2.byl.fact('ключ',значение) — необязательный факт текущего (или только что конченного) похода; былина пересложится сама. Понимает:
        'sud' → 'mercy' (пощадил) | 'exile' (прогнал) — приговор «Суда» (или событие SUD BB2.ev('sud',{v:'m'|'x',src}) — берётся само, src 'book' не считается);
        'udar' → 1 — босс добит «Богатырским ударом» (HERO). Незнакомые ключи просто хранятся.
   BB2.byl.open()   — былина последнего похода (то же, что строка в итогах) · BB2.byl.book() — «Книга былин» (для Терема / «Живого двора»).
   BB2.byl.svitok() — свиток «Былина о тебе»: куплеты «Подвигов» (S.bb2.ev.p.ku + BB2EV.kuText) и чужие куплеты одной картинкой, с «Сохранить» и «Похвастаться».
                      EVENT ничего делать не обязан: в его окно всех куплетов (вид 'evku') кнопка «Свитком» добавляется сама.
   BB2.byl.name()   — имя игрока из VK ('' — пока не спрошено или не VK) · BB2.byl.nameAsk() → Promise(имя) (VKWebAppGetUserInfo; разрешений не просит).
   После догрузки: BB2.byl.eng.last() → {title,lines:[[строка,строка],…],moral} последней былины · BB2.byl.eng.count().
   Событие шины 'byl'({a:'new',n,win,h,b}) — сложена новая былина; подвиг — BB2.pdv('byl'). Чужие куплеты (событие 'kuplet', src не 'pdv') — 2 последних хранятся и идут в свиток.
   Сами берём: чудеса (событие 'chudo'), умения ('um'), подвиги в походе ('pdvDone'), зарок (G.bb2vow), камень на распутье (G.stoneK), «Наскок»/«Реванш» NOVICE (окно 'nv', G.nvm).
   НИЧЕГО само в VK не публикуется: история и стена — только по нажатию игрока, окно подтверждения показывает сам VK. Награды за «Похвастаться» нет (ECO byl.shareGold 0).
   STAT: mod {m:'byl', a: show (строка в итогах) | new (сложена) | open | book | svitok | save | story | wall | gift | tro, r:'try'|'ok'|'no', w, src}. */
(function(){
  var Y=BB2.byl,T=BB2BYL_T,ov=null,cur=null,curG=null,made=null,shown=0,nvW=-1,cssOn=0,view=null;
  function sv(){return BB2.s('byl');}
  function st(a,x){x=x||{};x.m='byl';x.a=a;BB2.stat('mod',x);}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function i36(n){return Math.max(0,Math.floor(+n||0)).toString(36);}
  function p36(s){var n=parseInt(s,36);return n>0?n:0;}
  function snd(){try{SND.click();}catch(e){}}
  function $id(i){return document.getElementById(i);}
  function tap(i,fn){var b=$id(i);if(b)b.onclick=function(){snd();fn();};}

  /* ================= 1. ФАКТЫ ================= */
  function snap(G,win,m){var r=Y.run||{ch:[],um:{},pd:0,x:{}},a=G.weapons||[],w=null,e=null,i,u='',un=0,k,q=G.q||{},sg=G.starGot;
    for(i=0;i<a.length;i++){if(!w||a[i].lvl>w.lvl)w=a[i];if(!e&&a[i].lvl>=6)e=a[i];}
    for(k in r.um)if(r.um[k]>un){un=r.um[k];u=k;}
    return {h:G.heroId||'',s:G.chi|0,b:G.ch&&G.ch.boss||'',win:win?1:0,m:m||(G.daily?'d':G.weekly?'w':G.endless?'e':''),dif:G.dif||'',
      t:Math.floor(G.t||0),k:G.kills|0,lv:G.hero?G.hero.lvl|0:1,f:G.falls|0,hits:G.hits|0,c:q.chests|0,ev:q.evos|0,g:G.reward|0,
      w:w?w.id:'',e:e?e.id:'',nw:a.length,kl:!win&&typeof G.lastBy==='string'?G.lastBy:'',bl:G.bossLeft==null?-1:Math.round(G.bossLeft*100),
      fw:G.fw?1:0,s3:sg&&sg.w&&sg.d&&sg.t?1:0,rec:G.newRec?1:0,cur:G.curse|0,q:G.quit?1:0,st:typeof G.stoneK==='string'?G.stoneK:'',vow:win&&G.bb2vow>0?1:0,
      x:typeof r.ch[0]==='string'?r.ch[0]:'',xn:r.ch.length,u:u,un:un,pd:r.pd|0,sud:r.x.sud==='mercy'||r.x.sud==='exile'?r.x.sud:'',udar:r.x.udar?1:0,runs:S.runs|0};}
  /* запись Книги (строка, ~55–65 знаков): «номер|богатырь|глава[.режим]|признаки|сек|одолено|золото|уровень(2)+падений+сундуков+нажатий+подвигов+эволюций+оружий+чудес+проклятие|оружие|эволюция|кто одолел[.босс%+1]|камень|чудо|умение|шаблоны(6)» */
  var MC={d:'d',w:'w',e:'e',nk:'n',rv:'r'},MD={d:'d',w:'w',e:'e',n:'nk',r:'rv'},HL=['dob','ale','ily','vas','sad','mik','vol','mar','iva'],CAT='nzddrm';
  function c1(n){return Math.max(0,Math.min(35,n|0)).toString(36);}
  function cl(s,n){return String(s||'').replace(/[|."\\]/g,'').slice(0,n||10);}
  function enc(f,ids,seq){var fl=(f.win?1:0)|(f.fw?2:0)|(f.s3?4:0)|(f.rec?8:0)|(f.q?16:0)|(f.vow?32:0)|(f.udar?64:0)|(f.sud==='mercy'?128:0)|(f.sud==='exile'?256:0)|
      (f.dif==='s'?512:0)|(f.dif==='h'?1024:0)|(f.dif==='n'?2048:0)|(f.hits<=5?4096:0)|(f.runs<=2?8192:0),hi=HL.indexOf(f.h),lv=Math.max(0,Math.min(1295,f.lv|0));
    return [i36(seq),hi>=0?String(hi):cl(f.h,4),i36(f.s)+(MC[f.m]?'.'+MC[f.m]:''),i36(fl),i36(f.t),i36(f.k),i36(f.g),c1(lv/36)+c1(lv%36)+c1(f.f)+c1(f.c)+c1(f.un)+c1(f.pd)+c1(f.ev)+c1(f.nw)+c1(f.xn)+c1(f.cur),
      cl(f.w),f.e&&f.e===f.w?'=':cl(f.e),f.kl||f.bl>=0?cl(f.kl,12)+'.'+i36(f.bl+1):'',cl(f.st,1),cl(f.x),f.u==='h:'+f.h?'*':String(f.u||'').replace(/[|"\\]/g,'').slice(0,8),ids.map(function(x){return x.charAt(1);}).join('')].join('|');}
  function dec(s){try{var a=String(s).split('|'),sm,fl,q,ids=[],i,kb,h;if(a.length<15||a[7].length<10)return null;sm=a[2].split('.');fl=p36(a[3]);q=a[7];kb=a[10].split('.');h=a[1].length===1?HL[+a[1]]:a[1];
    for(i=0;i<6;i++)ids.push(a[14].charAt(i)&&a[14].charAt(i)!=='-'?CAT.charAt(i)+a[14].charAt(i):'--');
    function n(i){return parseInt(q.charAt(i),36)||0;}
    return {seq:p36(a[0]),ids:ids,f:{h:h,s:p36(sm[0]),m:MD[sm[1]]||'',win:fl&1,fw:fl&2?1:0,s3:fl&4?1:0,rec:fl&8?1:0,q:fl&16?1:0,vow:fl&32?1:0,udar:fl&64?1:0,sud:fl&128?'mercy':fl&256?'exile':'',
      dif:fl&512?'s':fl&1024?'h':fl&2048?'n':'',hits:fl&4096?0:99,runs:fl&8192?1:99,t:p36(a[4]),k:p36(a[5]),g:p36(a[6]),lv:n(0)*36+n(1),f:n(2),c:n(3),un:n(4),pd:n(5),ev:n(6),nw:n(7),xn:n(8),cur:n(9),
      w:a[8],e:a[9]==='='?a[8]:a[9],kl:kb[0]||'',bl:kb.length>1?p36(kb[1])-1:-1,st:a[11]==='h'?'horse':a[11]==='s'?'self':a[11]==='r'?'rich':'',x:a[12],u:a[13]==='*'?'h:'+h:a[13],b:bossOf(p36(sm[0]))}};}catch(e){return null;}}
  function bossOf(slot){try{var d=chDef(slot);return d&&d.boss||'';}catch(e){return '';}}

  /* ================= 2. СБОРКА БЫЛИНЫ ================= */
  function rng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
  function vars(f){var v={},hd=HERO_BY[f.h],h=T.hero(f.h,hd&&hd.name),e=EN[f.b],b=T.boss(f.b,e&&e.n,e&&e.g),cd=null,p,w,k,d;
    try{cd=chDef(f.s);}catch(x){}
    v.H=h[0];v.Hg=h[1];v.Hd=h[2];v.Ha=h[3];v.Hi=h[4];v._hf=h[5];
    v.B=b[0];v.Bg=b[1];v.Bd=b[2];v.Ba=b[3];v.Bi=b[4];v._bg=b[5];
    p=T.place(f,cd?cd.id:'',cd?cd.name:'');v.P=p[0];v.Pw=p[1];
    w=WEAPONS[f.w];v.W=w?w.name:'';w=WEAPONS[f.e];v.E=w&&w.evo?w.evo.name:'';
    k=f.kl&&EN[f.kl];v.Kn=k&&k.n&&!k.prop?k.n:'';
    v.K=fmtNum(f.k);v.L=String(f.lv);v.C=String(f.c);v.G=fmtNum(f.g);v.T=fmtTime(f.t);v.BL=f.bl>0?String(f.bl):'';
    v.X='';try{if(f.x&&BB2.chudo&&BB2.chudo.name)v.X=BB2.chudo.name(f.x)||'';}catch(x){}
    v.U='';try{if(f.u==='over')v.U=L('Богатырский удар','Heroic Strike');
      else if(f.u){d=BB2.um&&BB2.um.def&&BB2.um.def(f.u);v.U=d&&d.name?(typeof d.name==='function'?d.name():d.name):'';if(!v.U&&f.u.indexOf('h:')===0&&hd&&hd.dar)v.U=hd.dar.name;}}catch(x){}
    T.prep(f,v);return v;}
  function cap(s){return s.replace(/^([«“"(\s]*)([a-zа-яё])/,function(_,a,b){return a+b.toUpperCase();});}
  function fill(s,v){return s.replace(/\[([^\]|]*)\|([^\]]*)\]/g,function(_,a,b){return v._hf?b:a;})
    .replace(/<([^<>|]*)\|([^<>|]*)\|([^<>]*)>/g,function(_,a,b,c){return v._bg==='f'?b:v._bg==='n'?c:a;})
    .replace(/\{(\^?)(\w+)\}/g,function(_,c,k){var x=String(v[k]==null?'':v[k]);return c?cap(x):x;});}
  function full(t,v){var i,m,re=/\{\^?(\w+)\}/g;for(i=0;i<t.t.length;i++){re.lastIndex=0;while((m=re.exec(t.t[i])))if(!v[m[1]])return false;}return true;}
  function cand(list,f,v,flt){var a=[],i,t;for(i=0;i<list.length;i++){t=list[i];try{if(t.c&&!t.c(f,v))continue;}catch(e){continue;}if(flt&&!flt(t))continue;if(full(t,v))a.push(t);}return a;}
  function choose(a,R,rec){var b=[],i,s=0,x,top=a.filter(function(t){return t.w>=12;});if(top.length)a=top; /* вес 12 — обязательный факт (приговор) */
    for(i=0;i<a.length;i++)if(rec.indexOf(a[i].i)<0)b.push(a[i]);if(!b.length)b=a;
    for(i=0;i<b.length;i++)s+=b[i].w*b[i].w;x=R()*s;for(i=0;i<b.length;i++){x-=b[i].w*b[i].w;if(x<=0)return b[i];}return b[b.length-1];}
  /* ids: [заглавие, зачин, дело1, дело2, развязка, мораль]; '--' — нет; undefined — подобрать */
  function build(f,ids,seed,rec){var v=vars(f),R=rng(seed),o={f:f,v:v,lines:[]},n,z,d,e,r,m,t,KO='wsn';ids=ids||[];rec=rec||[];
    function one(list,want,flt){var c=cand(list,f,v,flt),i;if(want==='--')return null;if(want)for(i=0;i<c.length;i++)if(c[i].i===want)return c[i];return c.length?choose(c,R,rec):null;}
    n=one(T.N,ids[0]);z=one(T.Z,ids[1]);d=one(T.D,ids[2]);
    e=d&&!(!f.win&&f.t<60)?one(T.D,ids[3],function(x){return x.k!==d.k;}):null;
    if(d&&e&&KO.indexOf(e.k)<KO.indexOf(d.k)){t=d;d=e;e=t;}
    r=one(T.R,ids[4]);m=one(T.M,ids[5]);
    o.title=n?cap(fill(n.t[0],v)):L('Былина о походе','The Ballad of the Run');
    [z,d,e,r].forEach(function(x){if(!x)return;var a=cap(fill(x.t[0],v)),b=fill(x.t[1],v);if(/[.!?…»”)]$/.test(a)||/^[«“(]/.test(b))b=cap(b);o.lines.push([a,b]);});
    o.moral=m?cap(fill(m.t[0],v)):'';
    o.ids=[n?n.i:'--',z?z.i:'--',d?d.i:'--',e?e.i:'--',r?r.i:'--',m?m.i:'--'];return o;}
  function recent(){var s=sv().r||'',a=[],i;for(i=0;i+1<s.length;i+=2)a.push(s.substr(i,2));return a;}
  function seedOf(f,seq){return (seq*7919+f.t*131+f.k*17+f.lv)>>>0;}
  function put(s){try{S.bb2.byl=Y.fix(s);}catch(e){}try{save();}catch(e){}}
  function band(){var n=0,k,b=BB2.n('base.band',[3,18]);try{for(k in S.done)if(S.done[k])n++;}catch(e){}return n<=b[0]?0:n<=b[1]?1:2;}
  function make(f){var s=sv(),seq=(s.n|0)+1,m=build(f,null,seedOf(f,seq),recent()),every=BB2.n('byl.book',8),nt,th;
    m.seq=seq;m.e=enc(f,m.ids,seq);s.n=seq;(s.l||(s.l=[])).push(m.e);
    if(f.win&&f.b&&(f.m===''||f.m==='d')){if(!s.b)s.b=[];if(!s.b.some(function(e){var d=dec(e);return d&&d.f.b===f.b;}))s.b.push(m.e);}
    s.r=((s.r||'')+m.ids.join('').replace(/-/g,'')).slice(-48);
    if(every>0&&Math.floor(seq/every)>(s.bk|0)){s.bk=Math.floor(seq/every); /* каждые 8 былин в Книге — трофеи земли (не золото) */
      try{nt=BB2.n('byl.bookTro',3);/*ECO?*/th=CAMP_S[f.s]&&CAMP_S[f.s].th;if(nt>0&&th&&typeof TRO_ADD==='function'&&typeof metaOn==='function'&&metaOn('tro')){TRO_ADD('tr_'+th,nt);st('tro',{n:seq});
        setTimeout(function(){try{toast(L('Книга былин: '+seq+' былин! Боян дарит трофеи: '+nt,'Book of Ballads: '+seq+' ballads! Boyan gives trophies: '+nt));}catch(e){}},1600);}}catch(e){}}
    put(s);st('new',{w:f.win,n:seq});try{BB2.ev('byl',{a:'new',n:seq,win:f.win,h:f.h,b:f.b});if(BB2.pdv)BB2.pdv('byl');}catch(e){}
    return m;}
  /* факт пришёл после итогов (приговор «Суда»): развязка и мораль подбираются заново, запись в Книге заменяется */
  function redo(f,old){var s=sv(),m=build(f,[old.ids[0],old.ids[1],old.ids[2],old.ids[3]],seedOf(f,old.seq)+1,[]),i,k;
    m.seq=old.seq;m.e=enc(f,m.ids,old.seq);if(s.l){i=s.l.indexOf(old.e);if(i>=0)s.l[i]=m.e;}
    if(s.b){k=s.b.indexOf(old.e);if(k>=0)s.b[k]=m.e;}put(s);return m;}
  function compose(){if(cur&&!made)try{made=make(cur);}catch(e){try{console.warn('bb2 byl',e);}catch(x){}}return made;}
  function lastMade(){var l,d;if(made)return made;l=sv().l;d=l&&l.length?dec(l[l.length-1]):null;return d?build(d.f,d.ids,d.seq,[]):null;}

  /* ================= 3. СТРОКА В ИТОГАХ ================= */
  function css(){if(cssOn)return;cssOn=1;var s=document.createElement('style');s.textContent=
    '.bylT,.bylI{display:flex;align-items:center;gap:8px;width:100%;padding:6px 10px;min-height:52px;border:2px solid #b98a3a;border-radius:10px;background:#f6e7c1;color:#3a2413;font:inherit;text-align:left;cursor:pointer;box-shadow:none}'+
    '.bylT{margin:2px 0}.bylI{margin:0 0 6px}.bylT i{font-style:normal;font-size:24px;line-height:1}.bylI img{width:40px;height:40px;flex:none}'+
    '.bylT span,.bylI span{flex:1;min-width:0;display:block}.bylT b,.bylT em,.bylI b,.bylI em{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.bylT b,.bylI b{font-size:14px;color:#8a1f12}.bylT em,.bylI em{font-size:12.5px;color:#5a4326}.bylT u{text-decoration:none;font-size:22px;color:#8a1f12}'+
    '#bylOv{position:fixed;top:0;right:0;bottom:0;left:0;z-index:70;display:none;align-items:center;justify-content:center;background:rgba(10,6,4,.74);padding:8px}#bylOv.on{display:flex}'+
    '.bylP{width:100%;max-width:404px;max-height:100%;overflow:auto;-webkit-overflow-scrolling:touch;background:#3b2415;border:3px solid #6b4423;border-radius:16px;padding:8px}'+
    '.bylC{background:#f6e9c6;border:3px double #8a1f12;border-radius:8px;color:#3a2413;padding:10px 12px 8px;font-family:Georgia,"Times New Roman",serif;text-align:center}'+
    '.bylTi{font-size:18px;font-weight:700;color:#8a1f12;line-height:1.2;margin:2px 0 6px}'+
    '.bylPi{display:flex;align-items:center;justify-content:center;margin:0 0 2px}.bylPi img{width:54px;height:54px;margin:0 6px}.bylPi img.big{width:66px;height:66px}.bylPi span{font-style:italic;font-size:13px;color:#7b6a4d}'+
    '.bylC p{margin:6px 0;font-size:14.5px;line-height:1.33;font-style:italic}.bylC p.ku{text-align:left;font-size:13.5px}'+
    '.bylMo{margin:8px 0 4px;padding-top:7px;border-top:1px dashed #b98a3a;font-size:13.5px;line-height:1.3;color:#7a2b1c;font-weight:700}'+
    '.bylSt,.bylSg{font-size:11.5px;color:#7b6a4d}.bylSg{font-style:italic;margin-top:2px}'+
    '.bylB{display:flex;margin:8px -4px 0}.bylB .btn{flex:1;margin:0 4px;min-height:44px;padding:8px 6px;font-size:14px;white-space:normal;line-height:1.15}'+
    '.bylH{color:#f6e3b0;font-size:19px;font-weight:800;text-align:center;margin:4px 0 8px}'+
    '.bylTabs{display:flex;margin:0 -3px 8px}.bylTabs button{flex:1;margin:0 3px;min-height:44px;border-radius:9px;border:2px solid #6b4423;background:#2a180d;color:#e8d3a0;font:inherit;font-size:13px;cursor:pointer}.bylTabs button.on{background:#f6e7c1;color:#3a2413;font-weight:800}'+
    '.bylE,.bylHint{color:#e8d3a0;text-align:center;font-size:13.5px;line-height:1.35;margin:10px 6px}'+
    '.bylImg{display:block;width:100%;height:auto;border-radius:8px;-webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto}';
    document.head.appendChild(s);}
  function rowHTML(){var m=made;return '<button class="bylT" id="bylGo"><i>📜</i><span><b>'+(m?esc(m.title):L('Былина о походе','The Ballad of the Run'))+'</b><em>'+
    (m&&m.lines[0]?esc(m.lines[0][0]+' '+m.lines[0][1]):L('Боян складывает стихи…','Boyan is writing the verses…'))+'</em></span><u>›</u></button>';}
  function paint(){var el=$id('bylRow');if(!el||!cur)return;css();el.innerHTML=rowHTML();tap('bylGo',function(){open('res');});if(!shown){shown=1;st('show',{w:cur.win});}}
  var E={};
  E.end=function(G,win){if(G&&G===curG)return;cur=null;made=null;curG=G;shown=0;if(!G||(!win&&(G.t||0)<30))return;try{cur=snap(G,win);compose();}catch(e){}};
  E.modal=function(kind,el){try{var G0=typeof G!=='undefined'?G:null,b;
    if(kind==='result'){if(cur&&G0===curG)paint();else{b=$id('bylRow');if(b){b.style.minHeight='';b.innerHTML='';}}}
    else if(kind==='nv'){if(G0&&G0.nvm&&G0.over){if(curG!==G0||!cur){curG=G0;made=null;shown=0;b=G0.nvm.k==='rv';cur=snap(G0,b?(nvW>=0?nvW:G0.boss&&G0.boss.dead?1:0):0,b?'rv':'nk');nvW=-1;compose();}paint();}}
    else if(kind==='evku'&&el.querySelector('#evKuX')){BB2.put(el,'btns','<button class="btn" id="bylSv" style="width:100%;margin:8px 0 0;white-space:normal">'+L('📜 Свитком — сохранить или похвастаться','📜 As a scroll — save or share')+'</button>','bylSvRow');tap('bylSv',svitok);}
  }catch(e){}};
  E.fact=function(){if(!cur||!Y.run)return;var x=Y.run.x,s=x.sud==='mercy'||x.sud==='exile'?x.sud:'',u=x.udar?1:0;if(s===cur.sud&&u===cur.udar)return;cur.sud=s;cur.udar=u;
    try{if(made){made=redo(cur,made);paint();if(view&&view.seq===made.seq)show(made);}}catch(e){}};
  E.vil=function(el){try{var s=sv();if(!s.n||!el)return;css();
    BB2.put(el,'end','<button class="bylT" id="bylBk" style="margin:10px 0 0"><i>📖</i><span><b>'+L('Книга былин','Book of Ballads')+'</b><em>'+L('Былин сложено: ','Ballads written: ')+s.n+'</em></span><u>›</u></button>','bylVil');tap('bylBk',function(){book();});}catch(e){}};
  try{if(typeof STAT!=='undefined'&&typeof STAT.ev==='function'){var f0=STAT.ev;STAT.ev=function(n,o){try{if(n==='rv_end')nvW=o&&o.w?1:0;}catch(e){}return f0.apply(STAT,arguments);};}}catch(e){}
  BB2.hook('kuplet',function(k){try{if(!BB2.on('byl')||!k||k.src==='pdv'||typeof k.t!=='string'||!k.t)return;var s=sv(),a=s.k||(s.k=[]),t=k.t.slice(0,180);if(a.indexOf(t)<0){a.push(t);if(a.length>2)a.shift();put(s);}}catch(e){}});

  /* ================= 4. СВОЙ СЛОЙ (поверх окна итогов: его перерисовывать нельзя) ================= */
  function ovOpen(html){css();if(!ov){ov=document.createElement('div');ov.id='bylOv';document.body.appendChild(ov);
      ov.addEventListener('click',function(e){if(e.target===ov)close();});
      window.addEventListener('keydown',function(e){if(!ov||ov.className!=='on')return;e.stopPropagation();if(e.key==='Escape'||e.keyCode===27){e.preventDefault();close();}},true);}
    ov.innerHTML='<div class="bylP">'+html+'</div>';ov.className='on';}
  function close(){if(ov){ov.className='';ov.innerHTML='';}view=null;}
  function canVK(){try{return PLAT==='vk'&&!!VK&&!(typeof OK!=='undefined'&&OK);}catch(e){return false;}}
  function img(k,px,c){var u='';try{u=k&&ART[k]?ic(k,px):'';}catch(e){}return u?'<img src="'+u+'" alt=""'+(c?' class="'+c+'"':'')+'>':'';}
  function hasBoss(f){return !!f.b&&f.m!=='e'&&f.m!=='w'&&f.m!=='nk';}
  function sign(v){return Y.nm?v.signN+Y.nm:v.sign;}
  function cardHTML(m){var f=m.f,v=m.v,h='<div class="bylC"><div class="bylTi">'+esc(m.title)+'</div><div class="bylPi">'+img('hp_'+f.h,120)+(hasBoss(f)?'<span>'+esc(v.vs)+'</span>'+img(f.b,120,f.win?'':'big'):'')+'</div>',i;
    for(i=0;i<m.lines.length;i++)h+='<p>'+esc(m.lines[i][0])+'<br>'+esc(m.lines[i][1])+'</p>';
    return h+(m.moral?'<div class="bylMo">'+esc(m.moral)+'</div>':'')+'<div class="bylSt">'+v.st[0]+' '+fmtTime(f.t)+' · '+v.st[1]+' '+fmtNum(f.k)+' · '+v.st[2]+' '+f.lv+'</div><div class="bylSg" id="bylSg">'+esc(sign(v))+'</div></div>';}
  function btns(back){return '<div class="bylB"><button class="btn" id="bylSave">'+L('💾 Сохранить картинку','💾 Save picture')+'</button>'+(canVK()?'<button class="btn" id="bylShare">'+L('📣 Похвастаться','📣 Show off')+'</button>':'')+'</div>'+
    '<div class="bylB"><button class="btn ghost" id="bylBook">'+(back?L('‹ К Книге','‹ Back to the Book'):L('📖 Книга былин','📖 Book of Ballads'))+'</button><button class="btn ghost" id="bylX">'+L('Закрыть','Close')+'</button></div>';}
  function gift(){var s=sv(),n;if(s.g)return;s.g=1;n=BB2.n('byl.first','s');if(n==='s'||n==='m'||n==='b')n=BB2.n('base.'+(n==='s'?'small':n==='m'?'mid':'big'),[70,200,650])[band()];n=Math.round(+n||0);
    if(n>0){try{S.gold+=n;ern('gift',n);setGold();}catch(e){}st('gift',{n:n});setTimeout(function(){try{toast(L('Первая былина! Боян дарит '+fmtNum(n)+' золота','Your first ballad! Boyan gives you '+fmtNum(n)+' gold'));}catch(e){}},500);}put(s);}
  function show(m,back){view=m;ovOpen(cardHTML(m)+btns(back));
    tap('bylSave',function(){savePic(cardCanvas(m),function(){show(m,back);});});tap('bylShare',function(){shareAsk(m,function(){show(m,back);});});
    tap('bylBook',function(){book(back==='b'?'b':'');});tap('bylX',close);
    if(canVK()&&!Y.nm)nameAsk().then(function(n){var e=$id('bylSg');if(n&&e&&view===m)e.textContent=sign(m.v);});}
  function open(src){var m=compose()||lastMade();if(!m){try{toast(L('Сходи в поход — Боян сложит былину','Go on a run — Boyan will write a ballad'));}catch(e){}return;}show(m);gift();st('open',{src:src||'api'});}
  function book(tab){var s=sv(),a,i,d,m,h,nb=s.b?s.b.length:0;
    a=tab==='b'?(s.b||[]).slice():(s.l||[]).slice().reverse();
    h='<div class="bylH">'+L('📖 Книга былин','📖 Book of Ballads')+'</div><div class="bylTabs"><button id="bylT1"'+(tab==='b'?'':' class="on"')+'>'+L('Последние','Latest')+' · '+(s.l?s.l.length:0)+'</button><button id="bylT2"'+(tab==='b'?' class="on"':'')+'>'+L('Первые победы','First victories')+' · '+nb+'</button></div>';
    view=null;var ms=[];
    for(i=0;i<a.length;i++){d=dec(a[i]);if(!d)continue;try{m=build(d.f,d.ids,d.seq,[]);}catch(e){continue;}m.seq=d.seq;m.e=a[i];
      h+='<button class="bylI" data-i="'+ms.length+'">'+img('hp_'+d.f.h,80)+'<span><b>'+esc(m.title)+'</b><em>'+(m.lines[0]?esc(m.lines[0][0]+' '+m.lines[0][1]):'')+'</em></span>'+(tab==='b'?img(d.f.b,80):'')+'</button>';ms.push(m);}
    if(!ms.length)h+='<p class="bylE">'+(tab==='b'?L('Здесь будут былины о первой победе над каждым боссом.','Ballads of your first victory over each boss will be kept here.'):L('Пока пусто. Сходи в поход — Боян сложит былину.','Nothing yet. Go on a run — Boyan will write a ballad.'))+'</p>';
    h+='<div class="bylB">'+(kuList().length?'<button class="btn ghost" id="bylKu">'+L('📜 Былина о тебе','📜 The Ballad of You')+'</button>':'')+'<button class="btn ghost" id="bylX">'+L('Закрыть','Close')+'</button></div>';
    ovOpen(h);tap('bylT1',function(){book('');});tap('bylT2',function(){book('b');});tap('bylKu',svitok);tap('bylX',close);
    [].forEach.call(ov.querySelectorAll('.bylI'),function(e){e.onclick=function(){snd();show(ms[+e.getAttribute('data-i')],tab==='b'?'b':'l');};});st('book',{n:ms.length,t:tab==='b'?1:0});}

  /* ================= 5. СВИТОК «БЫЛИНА О ТЕБЕ» (куплеты Подвигов) ================= */
  function evP(){var b=S.bb2,e=b&&b['ev'];return e&&e.p;} /* узел EVENT только читаем */
  function kuList(){var a=[],p,i,t;try{p=evP();if(p&&Array.isArray(p.ku)&&typeof BB2EV!=='undefined'&&BB2EV.kuText)for(i=0;i<p.ku.length;i++){t=BB2EV.kuText(p.ku[i]);if(t)a.push(t);}}catch(e){}
    try{p=sv().k||[];for(i=0;i<p.length;i++)if(a.indexOf(p[i])<0)a.push(p[i]);}catch(e){}return a;}
  function svitok(){var w=typeof BB2EV==='undefined'&&evP()&&evP().ku&&evP().ku.length?BB2.need('ev').then(null,function(){}):Promise.resolve();
    return w.then(function(){var a=kuList(),v={},m,h,i;if(!a.length){try{toast(L('Куплетов пока нет: закрой связку из пяти подвигов','No verses yet: finish a chain of five deeds'));}catch(e){}return;}
      T.prep({t:0,f:0,un:0,xn:0,pd:0,ev:0,nw:0,dif:''},v);m={ku:a,v:v,title:L('Былина о тебе','The Ballad of You'),f:{h:S.hero||'dob'}};
      h='<div class="bylC"><div class="bylTi">'+esc(m.title)+'</div><div class="bylPi">'+img('hp_'+m.f.h,120)+'</div>';
      for(i=0;i<a.length;i++)h+='<p class="ku">'+(i+1)+'. '+esc(a[i])+'</p>';
      h+='<div class="bylSg" id="bylSg">'+esc(sign(v))+'</div></div>'+btns();view=m;ovOpen(h);
      tap('bylSave',function(){savePic(cardCanvas(m),svitok);});tap('bylShare',function(){shareAsk(m,svitok);});tap('bylBook',function(){book();});tap('bylX',close);
      if(canVK()&&!Y.nm)nameAsk().then(function(n){var e=$id('bylSg');if(n&&e&&view===m)e.textContent=sign(v);});st('svitok',{n:a.length});});}

  /* ================= 6. КАРТИНКА (рисуется только по нажатию) ================= */
  var FS='Georgia,"Times New Roman",serif';
  function wrap(g,t,w){var a=String(t).split(' '),r=[],l='',i,x;for(i=0;i<a.length;i++){x=l?l+' '+a[i]:a[i];if(l&&g.measureText(x).width>w){r.push(l);l=a[i];}else l=x;}if(l)r.push(l);return r;}
  function art(g,k,x,y,px){try{if(k&&ART[k])g.drawImage(drawArt(k,px),x,y,px,px);}catch(e){}}
  function cardCanvas(m){var W=1080,H=1350,c=document.createElement('canvas'),g,gr,y,i,j,fs,tf,ta,a,lines,tot,f=m.f,v=m.v,top,P=84,tw=W-2*P,mo,ku=m.ku,hb=!ku&&hasBoss(f),px=200,FOOT=186;
    c.width=W;c.height=8;g=c.getContext('2d'); /* сначала мерим: высота картинки растёт под текст (1350…1720), шрифт не мельчает */
    for(tf=58;tf>=38;tf-=4){g.font='bold '+tf+'px '+FS;ta=wrap(g,m.title,tw);if(ta.length<=2)break;}
    top=118+tf*.5+Math.min(3,ta.length)*tf*1.14+2+px+26;
    for(fs=ku?34:38;fs>=22;fs-=2){g.font='italic '+fs+'px '+FS;lines=[];tot=0;
      if(ku){for(i=Math.max(0,ku.length-8);i<ku.length;i++){a=wrap(g,(i+1)+'. '+ku[i],tw);lines.push(a);tot+=a.length*fs*1.3+fs*.6;}}
      else for(i=0;i<m.lines.length;i++){a=wrap(g,m.lines[i][0],tw).concat(wrap(g,m.lines[i][1],tw));lines.push(a);tot+=a.length*fs*1.3+fs*.62;}
      g.font='bold '+Math.round(fs*.86)+'px '+FS;mo=m.moral?wrap(g,m.moral,tw-40):[];tot+=mo.length?mo.length*fs*1.1+fs*1.1:0;
      if(top+tot+FOOT<=1720)break;}
    H=Math.round(Math.max(1350,Math.min(1720,top+tot+FOOT)));c.height=H;g=c.getContext('2d');
    gr=g.createRadialGradient(W/2,H/2,150,W/2,H/2,H*.72);gr.addColorStop(0,'#fbf0cf');gr.addColorStop(1,'#e3c98f');g.fillStyle=gr;g.fillRect(0,0,W,H);
    g.strokeStyle='#8a1f12';g.lineWidth=12;g.strokeRect(30,30,W-60,H-60);g.lineWidth=3;g.strokeRect(52,52,W-104,H-104);
    g.fillStyle='#8a1f12';[[52,52],[W-52,52],[52,H-52],[W-52,H-52]].forEach(function(p){g.save();g.translate(p[0],p[1]);g.rotate(Math.PI/4);g.fillRect(-15,-15,30,30);g.restore();});
    g.textAlign='center';g.textBaseline='alphabetic';g.font='bold '+tf+'px '+FS;
    y=118+tf*.5;for(i=0;i<ta.length&&i<3;i++){g.fillText(ta[i],W/2,y);y+=tf*1.14;}
    g.fillRect(W/2-170,y-tf*.55,340,3);g.beginPath();g.arc(W/2,y-tf*.55+1,9,0,7);g.fill();
    y+=2;if(hb){art(g,'hp_'+f.h,W/2-px-70,y,px);art(g,f.b,W/2+70,y,px);g.font='italic 34px '+FS;g.fillStyle='#7b6a4d';g.fillText(v.vs,W/2,y+px/2+10);}else art(g,'hp_'+f.h,W/2-px/2,y,px);
    y=top+Math.max(0,(H-FOOT-top-tot)/2)+fs;g.fillStyle='#3a2413';g.font='italic '+fs+'px '+FS;
    for(i=0;i<lines.length;i++){for(j=0;j<lines[i].length;j++){g.fillText(lines[i][j],W/2,y);y+=fs*1.3;}y+=fs*.62;}
    if(mo.length){g.fillStyle='#b98a3a';g.fillRect(W/2-220,y-fs*1.05,440,2);g.fillStyle='#7a2b1c';g.font='bold '+Math.round(fs*.86)+'px '+FS;y+=fs*.2;for(i=0;i<mo.length;i++){g.fillText(mo[i],W/2,y);y+=fs*1.1;}}
    g.fillStyle='#7b6a4d';g.font='26px '+FS;if(!ku)g.fillText(v.st[0]+' '+fmtTime(f.t)+'  ·  '+v.st[1]+' '+fmtNum(f.k)+'  ·  '+v.st[2]+' '+f.lv,W/2,H-150);
    g.font='italic 26px '+FS;g.fillText(sign(v),W/2,H-112);g.fillStyle='#8a1f12';g.font='bold 32px '+FS;g.fillText(v.game,W/2,H-70);return c;}
  function storyCanvas(m){var W=1080,H=1920,c=document.createElement('canvas'),g,gr,k=cardCanvas(m),w,h,y;c.width=W;c.height=H;g=c.getContext('2d');
    h=Math.min(1420,Math.round(980*k.height/1080));w=Math.round(h*1080/k.height);y=250+Math.round((1420-h)/2);
    gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#6a1a12');gr.addColorStop(1,'#2a0b08');g.fillStyle=gr;g.fillRect(0,0,W,H);
    g.drawImage(k,(W-w)/2,y,w,h);g.textAlign='center';g.fillStyle='#f6dc9a';g.font='bold 50px '+FS;g.fillText(L('А про тебя Боян что споёт?','What will Boyan sing about you?'),W/2,1765);return c;}
  function savePic(c,back){var url='',done=function(u){url=u;try{var a=document.createElement('a');a.href=u;a.download='bylina.png';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(function(){try{document.body.removeChild(a);}catch(e){}},500);}catch(e){}
      ovOpen('<img class="bylImg" id="bylImg" src="'+u+'" alt=""><p class="bylHint">'+L('Картинка сохраняется в «Загрузки». На телефоне, если не сохранилась, — нажми на неё и держи: «Сохранить».','The picture goes to Downloads. On a phone, if it didn’t save, press and hold it: “Save image”.')+'</p><div class="bylB"><button class="btn ghost" id="bylBack">'+L('‹ Назад','‹ Back')+'</button></div>');
      var im=$id('bylImg');if(im)im.addEventListener('contextmenu',function(e){e.stopPropagation();});tap('bylBack',back);};
    st('save',{});try{if(c.toBlob&&window.URL&&URL.createObjectURL){c.toBlob(function(b){try{done(b?URL.createObjectURL(b):c.toDataURL('image/png'));}catch(e){}},'image/png');return;}}catch(e){}
    try{done(c.toDataURL('image/png'));}catch(e){}}

  /* ================= 7. «ПОХВАСТАТЬСЯ» В VK — только по нажатию; публикацию подтверждает сам VK ================= */
  function appLink(){var m=/[?&]vk_app_id=(\d+)/.exec(location.search);return m?'https://vk.com/app'+m[1]:'';}
  function plain(m){var a=[m.title,''],i;if(m.ku)for(i=Math.max(0,m.ku.length-8);i<m.ku.length;i++)a.push((i+1)+'. '+m.ku[i]);else for(i=0;i<m.lines.length;i++){a.push(m.lines[i][0]);a.push(m.lines[i][1]);}
    if(m.moral){a.push('');a.push(m.moral);}a.push('');a.push(m.v.game+(appLink()?' — '+appLink():''));return a.join('\n');}
  function vkDo(kind,m,back){var p,link=appLink();if(!canVK())return;st(kind,{r:'try'});
    try{if(kind==='story'){p={background_type:'image',blob:storyCanvas(m).toDataURL('image/jpeg',.9),locked:true};if(link)p.attachment={text:'go_to',type:'url',url:link};p=vkSend('VKWebAppShowStoryBox',p,180000);}
      else{p={message:plain(m)};if(link)p.attachments=link;p=vkSend('VKWebAppShowWallPostBox',p,180000);}
      p.then(function(r){st(kind,{r:r&&(r.result||r.post_id)?'ok':'no'});},function(){st(kind,{r:'no'});});}catch(e){st(kind,{r:'no'});}
    back();}
  function shareAsk(m,back){ovOpen('<div class="bylH">'+L('Куда похвастаться?','Where to show off?')+'</div><p class="bylHint">'+L('VK покажет окно с картинкой — отправится только после твоего «Опубликовать».','VK will show a preview — nothing is posted until you confirm.')+'</p>'+
      '<div class="bylB"><button class="btn" id="bylS1">'+L('📣 В историю VK','📣 VK story')+'</button><button class="btn" id="bylS2">'+L('📝 На стену VK','📝 VK wall')+'</button></div><div class="bylB"><button class="btn ghost" id="bylBack">'+L('‹ Назад','‹ Back')+'</button></div>');
    tap('bylS1',function(){vkDo('story',m,back);});tap('bylS2',function(){vkDo('wall',m,back);});tap('bylBack',back);}
  function nameAsk(){if(Y.nm)return Promise.resolve(Y.nm);if(!canVK())return Promise.resolve('');
    try{return vkSend('VKWebAppGetUserInfo',{},4000).then(function(r){var n=r&&typeof r.first_name==='string'?r.first_name.replace(/[<>&"'|]/g,'').slice(0,20):'';Y.nm=n;return n;},function(){return '';});}catch(e){return Promise.resolve('');}}

  E.open=function(){open('api');};E.book=function(){book();};E.svitok=svitok;E.nameAsk=nameAsk;
  E.last=function(){var m=lastMade();return m?{title:m.title,lines:m.lines,moral:m.moral}:null;};E.count=function(){return sv().n|0;};
  E.build=build;E.enc=enc;E.dec=dec;E.card=cardCanvas;E.story=storyCanvas;E.html=cardHTML;E.plain=plain;E.close=close; /* для проверок и превью */
  Y.eng=E;
  if(Y.end)try{E.end(Y.end[0],Y.end[1]);}catch(e){} /* набор приехал уже после конца похода */
})();
