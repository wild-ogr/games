/* ===== bb2-um-core.js — УМЕНИЯ: ДОГОВОР BB2.um.* (поток UM, супер-буст в2). Первый файл догружаемого набора 'um' (на старте — только заглушка js/bb2-um.js);
   за ним js/bb2-um-run.js (кнопки, заряд, 8 общих умений) и js/bb2-um-ui.js (выбор перед походом, настройки).
   ДРУГИМ ПОТОКАМ: звать всё ниже внутри BB2.after('um',function(){ … }) — выполнится сразу, если набор уже загружен, иначе после догрузки.
   Флаги: UM_ON (выключен → дар срабатывает сам, кнопок нет, как v24.1) · UM_PALEC (вариант «Под палец») · UM_AD («все умения заряжены» в окне Жар-птицы).
   Сохранение: S.bb2.um = {sl:[общее1,общее2] ('' — подобрать само), op:{id:1} выданные, lv:{id:0..5}, m:0 само решит|1 «Сами»|2 «Руками», n ручных нажатий,
                           l левая рука, p «Под палец», g гостинец на следующий поход, h подсказка первого похода показана}

   ---------------- КАК ПОЛЬЗОВАТЬСЯ (другим потокам) ----------------
   1. ОБЩЕЕ УМЕНИЕ (2-е и 3-е гнездо):
      BB2.um.reg('id',{name:function(){return L('Конь','Steed');}, desc:function(){…одна строка…}, icon:'ключ ART', cd:16, dur:2 (сколько секунд «горит»),
        from:function(){return L('после главы 3','after Chapter 3');}, open:function(){return …уже открыто? (по S)…;},  // нет open → открывает только BB2.um.unlock('id')
        use:function(G,P,x){…эффект; P — сила (звание/ступень/мощь, «Сами» уже −20 %); x={slot,auto,st — свой объект на поход}; вернуть false = не сработало, заряд цел},
        tick:function(G,dt,st){…каждый кадр, пока st.on>0…}, draw:function(c,G,st){…мировые координаты, только готовые картинки…},
        auto:function(G){return можно ли включать самому сейчас;}});
      Урон — ТОЛЬКО через BB2.um.hit(e,урон,kx,ky): он считается в G.um.dmg (правило «урон умений ≤ ~15 % урона за поход»).
   2. ИМЕННОЕ УМЕНИЕ ГЕРОЯ (поток HERO):
      первое гнездо по умолчанию = нынешний дар героя (updDar в game.js), его сила уже в балансе. Заменить: BB2.um.hero('dob',{main:1,name,desc,icon,cd,use,…}).
      Второе именное («свой приём», ставится в общее гнездо только этому герою, со звания rank): BB2.um.hero('ily',{id:'ily2',rank:3,name,desc,icon,cd,use,…}).
   3. УЗНАТЬ О НАЖАТИИ: BB2.hook('um',function(id,x,G){ x={slot:0..3, auto:0 рукой|1 само|2 само после подсказки, hero, t сек похода, gift} });
      заряд готов: BB2.hook('umReady',function(slot,id,G){}).
   4. В БОЮ: BB2.um.fire(slot[,auto]) нажать · BB2.um.charge(slot|-1,сек|true) подзарядить (true — полностью; -1 — все) ·
      BB2.um.st() → [{id,q:0..1,ready,on}] · BB2.um.over(slot,{name,icon,use:function(G){}}|null) — временно подменить кнопку («Богатырский удар»: кнопка золотая и всегда готова).
   5. ГОСТИНЕЦ (одноразовая 4-я кнопка, «Дар в поход» из Забав): BB2.um.gift('zamah'|'shit'|'ryvok') — выдать на СЛЕДУЮЩИЙ поход (вернёт true; старый гостинец заменяется);
      BB2.um.gift() → что лежит ('' — пусто); свой гостинец: BB2.um.giftReg('id',{name,icon,use:function(G,P){}}). В походе нажимается один раз.
   6. МЕТА: BB2.um.slots([герой]) → [id именного, id|null, id|null] · BB2.um.nSlots() 1..3 · BB2.um.set(1|2,id) · BB2.um.isOpen(id) · BB2.um.unlock(id) · BB2.um.lv(id) ·
      BB2.um.list([герой]) → все id, которые можно поставить · BB2.um.mode() → 1 «Сами» | 2 «Руками». */
(function(){
  var U=BB2.um;if(!U||U.reg)return;U.v=1;U.ids=[];U.by={};U.hs={};U.gf={};
  function tx(v){return typeof v==='function'?v():v||'';}
  U.tx=tx;
  U.reg=function(id,d){d=d||{};d.id=id;if(!U.by[id])U.ids.push(id);U.by[id]=d;return d;};
  U.hero=function(h,d){d=d||{};d.hero=h;var a=U.hs[h]||(U.hs[h]=[]);if(d.main){d.id='h:'+h;a.main=d;}else{d.id=d.id||h+(a.length+2);a.push(d);}U.by[d.id]=d;return d;};
  U.giftReg=function(id,d){d=d||{};d.id=id;U.gf[id]=d;return d;};
  U.def=function(id){return U.by[id]||U.gf[id]||null;};

  function sv(){return BB2.s('um');}
  U.sv=sv;
  function w(k,v){var o=sv();if(v)o[k]=v;else delete o[k];if(typeof save==='function')save();}
  U.w=w;
  /* ---------- гнёзда и открытие ---------- */
  function place(n){try{return !!(S.done&&ORD[n-1]!=null&&S.done[ORD[n-1]]);}catch(e){return false;}}
  U.place=place;
  U.nSlots=function(){return place(BB2.n('um.slot3',9))?3:place(BB2.n('um.slot2',3))?2:1;}; /* числа — в договоре bb2-eco.js (um.*); здесь запасные: после каких мест открываются 2-е и 3-е гнездо*/
  U.isOpen=function(id){var d=U.by[id];if(!d)return false;if((sv().op||{})[id])return true;
    if(d.hero&&!d.main)return ((S.rank||{})[d.hero]||0)>=(d.rank||0);try{return !!(d.open&&d.open());}catch(e){return false;}};
  U.unlock=function(id){var o=sv();if(!U.by[id]||(o.op||{})[id])return false;(o.op||(o.op={}))[id]=1;if(typeof save==='function')save();BB2.stat('um_open',{u:id});return true;};
  U.lv=function(id){return (sv().lv||{})[id]|0;};
  U.list=function(h){h=h||S.hero;var r=[],i,d;for(i=0;i<U.ids.length;i++)if(U.isOpen(U.ids[i]))r.push(U.ids[i]);
    d=U.hs[h]||[];for(i=0;i<d.length;i++)if(U.isOpen(d[i].id))r.push(d[i].id);return r;};
  U.slots=function(h){h=h||S.hero;var n=U.nSlots(),av=U.list(h),s=sv().sl||['',''],r=['h:'+h,null,null],i,j,id;
    for(i=0;i<2;i++){if(i+2>n)break;id=s[i];if(av.indexOf(id)<0||id===r[1])id='';
      if(!id)for(j=0;j<av.length;j++)if(av[j]!==r[1]&&av[j]!==s[1-i]){id=av[j];break;}
      r[i+1]=id||null;}return r;};
  U.set=function(i,id){if(i!==1&&i!==2||!U.isOpen(id))return false;var o=sv(),s=o.sl||(o.sl=['','']);if(s[2-i]===id)s[2-i]=s[i-1];s[i-1]=id;if(typeof save==='function')save();BB2.stat('um_set',{u:id,s:i});return true;};
  U.mode=function(){var o=sv();return o.m||((o.n|0)>=2?2:1);}; /* пока игрок сам не нажал кнопку дважды — «Сами» */
  U.gift=function(id){var o=sv();if(id===undefined)return o.g||'';if(id&&!U.gf[id])return false;w('g',id||'');if(id)BB2.stat('um_gift',{u:id});return true;};

  /* ---------- бой: вызовы уходят в догруженную часть (нет её — молчим, дар работает сам) ---------- */
  function rt(f,a,b){var r=U.rt;return r&&r[f]?r[f](a,b):undefined;}
  U.fire=function(i,auto){return rt('fire',i,auto)||false;};
  U.charge=function(i,s){return rt('charge',i,s);};
  U.st=function(){return rt('st')||[];};
  U.over=function(i,d){return rt('over',i,d);};
  U.hit=function(e,d,kx,ky){var u=typeof G!=='undefined'&&G&&G.um,h=e.hp;hitEnemy(e,d,kx,ky);if(u&&h>0)u.dmg+=Math.min(h,Math.max(0,h-e.hp));};

})();
