/* ===== bb2-um-run.js — УМЕНИЯ В БОЮ (поток UM; догружается набором 'um', договор — js/bb2-um.js) =====
   Кнопки (именное внизу слева, два общих внизу справа, гостинец над именным), только короткий тап; ПК: пробел, 1/Q, 2/E, гостинец 3/F.
   Заряд: время + каждая побеждённая нечисть (не быстрее чем вдвое), при выходе босса всё заряжено. «Сами» слабее на 20 %.
   Всё рисуется готовыми картинками (кнопки, цифры, подсказка — заранее на своих холстах); на кадр — 3–4 drawImage и одна дуга на кнопку. */
(function(){
  'use strict';
  var U=BB2.um;if(!U||U.rt)return;
  var PI2=Math.PI*2;
  /* числа — в договоре bb2-eco.js (um.*); здесь запасные: все числа умений в одном месте: BB2.n('um.<имя>',запасное). Меняет победу → только с прогоном UM-tools/umbot.py */
  var NUM={autoK:.8,   /* «Сами»: сила ×0,8 */
    kill:.1,elite:2,   /* побеждённая нечисть: −0,1 с отката, вожак −2 с */
    bossPct:.02,       /* каждые 2 % здоровья босса = −1 с */
    start:.5,          /* заряд на старте похода (доля) — как у дара в v24.1 */
    autoWait:1.2,      /* «Сами»: ждёт столько после готовности (успеть нажать самому) */
    idle:20,           /* «Руками» по привычке (не выбрано в настройках): не нажал столько секунд — сработает само */
    tapMs:400,lvPow:.15,lvCd:.04,
    cdK:1.25,          /* общий множитель откатов: заряд от побеждённых ускоряет до ×2, без него дар бил бы чаще, чем в v24.1 (замер — logs/UM.md) */
    hintT:20,hintWait:4,xpK:1.5,morozK:2,palecMs:900};
  function num(k){return BB2.n('um.'+k,NUM[k]);}
  /* числа — в договоре bb2-eco.js (um.*); здесь запасные: числа самих умений: BB2.n('um.sk.<id>.<имя>') */
  var SK={kon:{cd:16,dur:2,dmg:30},shit:{cd:26,dur:3,refl:15},son:{cd:34,dur:4,boss:2},klubok:{cd:30,dur:5},
    dvoe:{cd:40,dur:10,dmg:16},gusi:{cd:22,dmg:70},izba:{cd:38,dur:6,dmg:80},moroz:{cd:28,dur:3},
    zamah:{dmg:50},gshit:{dur:2},ryvok:{dur:1.5}};
  function sk(id,k){return BB2.n('um.sk.'+id+'.'+k,SK[id][k]);}
  function now(){return performance.now();}
  function ev(n,o){BB2.stat(n,o);}

  /* ---------- рисунки (готовые картинки, как все спрайты игры) ---------- */
  art('um_shit',40,function(g){ell(g,0,0,15,16,'#c0392b');ell(g,0,0,10.5,11.5,'#e6b53a',{ol:false});ell(g,0,0,4.2,4.2,'#dce4ee');shine(g,-5,-7,4,2,.45);});
  art('um_ring',80,function(g){g.lineWidth=5;g.strokeStyle='rgba(255,216,74,.8)';g.beginPath();g.arc(0,0,34,0,PI2);g.stroke();g.lineWidth=1.6;g.strokeStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(0,0,34,0,PI2);g.stroke();
    g.fillStyle='rgba(255,243,176,.9)';for(var i=0;i<8;i++){g.beginPath();g.arc(Math.cos(i/8*PI2)*34,Math.sin(i/8*PI2)*34,2.6,0,PI2);g.fill();}});
  art('um_mol',34,function(g){ell(g,-4,13,3,2.2,'#4a2c1c');ell(g,4,13,3,2.2,'#4a2c1c');ell(g,0,5,8,8.5,'#d83a2a');ln(g,[-7,6,7,6],'#e6b53a',1.6);
    ell(g,0,-6,6.2,6,'#f6cfaa');poly(g,[-6.5,-9,0,-16,6.5,-9],'#2f7d5e');eye(g,-2.2,-6,1.3);eye(g,2.6,-6,1.3);mouth(g,.2,-2.6,2,'#7a2a1a',1);ln(g,[8,3,13,-3],'#8a5a2e',2.4);});
  art('um_lar',40,function(g){rrect(g,-14,-2,28,15,2.5);g.fillStyle=grad(g,0,5,15,'#8a5a2e');g.fill();outline(g,'#8a5a2e',1.4);poly(g,[-14,-2,-11,-12,11,-12,14,-2],'#a8703a');
    ln(g,[-14,4,14,4],'#e6b53a',1.6);ell(g,0,4,2.4,2.8,'#e6b53a');ell(g,-6,-14,4,4,'#f6cfaa');ell(g,6,-14,4,4,'#f6cfaa');poly(g,[-10,-16,-6,-21,-2,-16],'#d83a2a');poly(g,[2,-16,6,-21,10,-16],'#d83a2a');});
  art('um_sneg',40,function(g){glow(g,0,0,18,'#7ac8ff');for(var i=0;i<3;i++){var a=i/3*Math.PI,x=Math.cos(a)*14,y=Math.sin(a)*14;ln(g,[-x,-y,x,y],'#ffffff',2.4);
      for(var s=-1;s<=1;s+=2){var bx=x*.6*s,by=y*.6*s,nx=-y/14*4,ny=x/14*4;ln(g,[bx+nx,by+ny,bx+x*.18*s,by+y*.18*s,bx-nx,by-ny],'#eaf6ff',1.5);}}});
  art('um_led',120,function(g){g.beginPath();g.arc(0,0,56,0,PI2);g.fillStyle='rgba(150,210,255,.26)';g.fill();g.lineWidth=2.5;g.strokeStyle='rgba(235,248,255,.8)';g.stroke();
    g.lineWidth=1.2;g.strokeStyle='rgba(255,255,255,.5)';for(var i=0;i<6;i++){var a=i/6*PI2+.3;g.beginPath();g.moveTo(Math.cos(a)*12,Math.sin(a)*12);g.lineTo(Math.cos(a+.2)*34,Math.sin(a+.2)*34);g.lineTo(Math.cos(a-.1)*52,Math.sin(a-.1)*52);g.stroke();}});
  art('um_palec',44,function(g){g.rotate(-2.3);rrect(g,-4,-18,8,20,4);g.fillStyle='#f6cfaa';g.fill();outline(g,'#f6cfaa',1.2);ell(g,0,7,10,9,'#f6cfaa');ell(g,-9,4,3.4,5,'#f6cfaa');});
  art('um_gus3',44,function(g){var k=ART.gus;if(!k)return;for(var i=0;i<3;i++){g.save();g.translate([-8,6,-2][i],[-8,-2,9][i]);g.scale(.62,.62);k.fn(g);g.restore();}});
  function icon(k,alt){return ART[k]?k:alt;}

  /* ---------- 8 общих умений ---------- */
  function near(x,y,r,fn){forNear(x,y,r,function(e){if(e.dead||e.prop)return;var dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy)||1;if(d<r+e.r)fn(e,dx/d,dy/d,d);});}
  function threat(g,n,r){var H=g.hero,c=0;if(g.boss&&!g.boss.dead&&onScreen(g.boss,0))return true;near(H.x,H.y,r||200,function(){c++;});return c>=(n||1);}
  U.reg('kon',{name:function(){return L('Конь богатырский','Bogatyr’s Steed');},desc:function(){return L('2 секунды скачешь сквозь толпу и топчешь нечисть — тебя не задеть','Ride through the horde for 2 seconds, trampling monsters — nothing can touch you');},
    icon:icon('pt_konek','i_sword'),cd:sk('kon','cd'),dur:sk('kon','dur'),say:function(){return L('Сивка-Бурка, встань передо мной!','Sivka-Burka, stand before me!');},
    from:function(){return L('после главы '+BB2.n('um.slot2',3),'after Chapter '+BB2.n('um.slot2',3));},open:function(){return U.place(BB2.n('um.slot2',3));},
    use:function(g,P,x){var H=g.hero,d=sk('kon','dur');H.inv=Math.max(H.inv,d);g.dashT=Math.max(g.dashT,d);x.st.on=d;x.st.P=P;g.fx.push({k:'wave',own:1,t:0,dur:.35,r1:70,col:'#ffe9b0'});SND.swing();},
    tick:function(g,dt,st){var H=g.hero;near(H.x,H.y,30,function(e,ux,uy){if((e.hk.uk||0)>g.t)return;e.hk.uk=g.t+.3;U.hit(e,sk('kon','dmg')*st.P,ux*420,uy*420);});
      if(H.moving&&Math.random()<.5&&g.pt.length<300)g.pt.push({x:H.x-H.fx*14,y:H.y+12,vx:rand(-30,30),vy:rand(-40,-5),t:0,dur:rand(.25,.5),col:'#c8a878',s:rand(2,4)});},
    draw:function(c,g,st){var H=g.hero;drawSpr('pt_konek',H.x,H.y+17+Math.abs(Math.sin(g.t*16))*-3,H.flip*1.9,1.9);}});
  U.reg('shit',{name:function(){return L('Заговорённый щит','Charmed Shield');},desc:function(){return L('3 секунды ни один удар не проходит, снаряды отлетают назад','For 3 seconds no blow lands, and shots bounce back');},
    icon:'um_shit',cd:sk('shit','cd'),dur:sk('shit','dur'),from:function(){return L('после главы 6','after Chapter 6');},open:function(){return U.place(6);},
    use:function(g,P,x){var H=g.hero,d=sk('shit','dur');H.inv=Math.max(H.inv,d);x.st.on=d;x.st.P=P;g.fx.push({k:'pulse',own:1,t:0,dur:.5,r1:60});SND.level();},
    tick:function(g,dt,st){var H=g.hero,i,p,e;H.inv=Math.max(H.inv,Math.min(st.on,.2));
      for(i=0;i<g.eproj.length;i++){p=g.eproj[i];if(p.dead||(p.x-H.x)*(p.x-H.x)+(p.y-H.y)*(p.y-H.y)>58*58)continue;p.dead=true;p.life=0;spark(p.x,p.y,'#ffe14a',4);
        e=nearest(H.x,H.y,420);if(e)U.hit(e,sk('shit','refl')*st.P,0,0);}},
    draw:function(c,g,st){var H=g.hero;drawSpr('um_ring',H.x,H.y-6,1,1,0,g.t*1.5,Math.min(1,st.on*2));}});
  U.reg('son',{name:function(){return L('Сон-трава','Sleep-grass');},desc:function(){return L('Вся нечисть на экране спит 4 секунды (босс — 2)','Every monster on screen sleeps for 4 seconds (bosses — 2)');},
    icon:'f_str',cd:sk('son','cd'),dur:sk('son','dur'),from:function(){return L('после главы 9','after Chapter 9');},open:function(){return U.place(9);},
    use:function(g,P,x){var d=sk('son','dur'),b=sk('son','boss'),k=x.auto?num('autoK'):1,i,e;g.sleepT=Math.max(g.sleepT,d*k);
      for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||e.prop||!onScreen(e,30))continue;e.stun=Math.max(e.stun||0,(e.boss?b:d)*k);}
      g.eproj.length=0;g.fx.push({k:'pulse',own:1,t:0,dur:.9,r1:VIEW.R,evo:1});SND.heal();x.st.on=d*k;}});
  U.reg('klubok',{name:function(){return L('Клубок, катись!','Roll, Yarn Ball!');},desc:function(){return L('Все самоцветы и монеты летят к богатырю, 5 секунд опыт ×1,5','All gems and coins fly to you; XP ×1.5 for 5 seconds');},
    icon:'yarn',cd:sk('klubok','cd'),dur:sk('klubok','dur'),from:function(){return L('после главы 12','after Chapter 12');},open:function(){return U.place(12);},
    auto:function(g){return g.gems.length>=15;},
    use:function(g,P,x){var i;for(i=0;i<g.gems.length;i++)g.gems[i].mag=true;for(i=0;i<g.picks.length;i++)if(g.picks[i].k==='coin')g.picks[i].mag=true;
      x.st.on=sk('klubok','dur');g.um.xpT=1;computeStats();g.fx.push({k:'pulse',own:1,t:0,dur:.8,r1:200});SND.gem();},
    off:function(g){g.um.xpT=0;computeStats();}});
  U.reg('dvoe',{name:function(){return L('Двое из ларца','Two from the Chest');},desc:function(){return L('Два молодца дерутся рядом 10 секунд','Two lads fight by your side for 10 seconds');},
    icon:'um_lar',cd:sk('dvoe','cd'),dur:sk('dvoe','dur'),say:function(){return L('Что, новый хозяин, надо?','What do you need, new master?');},
    from:function(){return L('Слава, уровень 5','Fame level 5');},open:function(){try{if(typeof SL==='function'&&SL())return slLv(SL().x).l>=5;}catch(e){}return U.place(15);},
    use:function(g,P,x){var H=g.hero;x.st.on=sk('dvoe','dur');x.st.P=P;x.st.m=[{x:H.x-34,y:H.y,t:0,f:1},{x:H.x+34,y:H.y,t:.2,f:-1}];burst(H.x,H.y,'#e6b53a',14,160);SND.chest();},
    tick:function(g,dt,st){var H=g.hero,i,m,e,tx,ty,dx,dy,d;for(i=0;i<st.m.length;i++){m=st.m[i];e=nearest(i?m.x:H.x,i?m.y:H.y,240);
        if(e&&(e.x-H.x)*(e.x-H.x)+(e.y-H.y)*(e.y-H.y)>300*300)e=null;tx=e?e.x:H.x+(i?40:-40);ty=e?e.y:H.y+10;dx=tx-m.x;dy=ty-m.y;d=Math.hypot(dx,dy)||1;
        if(d>(e?e.r+16:8)){m.x+=dx/d*Math.min(d,270*dt);m.y+=dy/d*Math.min(d,270*dt);}if(Math.abs(dx)>2)m.f=dx<0?-1:1;
        m.t-=dt;if(m.t<=0&&e){m.t=.45;m.sw=.15;near(m.x,m.y,34,function(q,ux,uy){U.hit(q,sk('dvoe','dmg')*st.P,ux*160,uy*160);});}if(m.sw>0)m.sw-=dt;}},
    draw:function(c,g,st){for(var i=0;i<st.m.length;i++){var m=st.m[i];drawSpr('um_mol',m.x,m.y-Math.abs(Math.sin(g.t*10+i))*3,m.f*(m.sw>0?1.15:1),1,0,0,Math.min(1,st.on*3));}}});
  U.reg('gusi',{name:function(){return L('Гуси-лебеди','Geese-Swans');},desc:function(){return L('Стая проносится полосой по ходу богатыря и уносит мелкую нечисть','A flock sweeps ahead along your path and carries small monsters away');},
    icon:'um_gus3',cd:sk('gusi','cd'),dur:.8,from:function(){return L('Логово Болота','the Swamp Lair');},open:function(){return lair('bol');},
    use:function(g,P,x){var H=g.hero,l=Math.hypot(H.fx,H.fy)||1,st=x.st;st.on=.8;st.P=P;st.ux=H.fx/l;st.uy=H.fy/l;st.x=H.x-st.ux*60;st.y=H.y-st.uy*60;st.id=g.t+1;SND.shoot();},
    tick:function(g,dt,st){st.x+=st.ux*780*dt;st.y+=st.uy*780*dt;near(st.x,st.y,74,function(e){if(e.hk.ug===st.id)return;e.hk.ug=st.id;U.hit(e,sk('gusi','dmg')*st.P*(e.boss||e.elite?.5:1),st.ux*520,st.uy*520);});},
    draw:function(c,g,st){var nx=-st.uy,ny=st.ux,i,o,f=st.ux<0?-1:1;for(i=0;i<5;i++){o=[[0,0],[-26,-28],[-26,28],[-52,-56],[-52,56]][i];
        drawSpr('gus',st.x+st.ux*o[0]+nx*o[1],st.y+st.uy*o[0]+ny*o[1]+Math.sin(g.t*18+i)*3,f*1.25,1.25);}}});
  U.reg('izba',{name:function(){return L('Избушка, повернись!','Turn Around, Little Hut!');},desc:function(){return L('Ставит избушку: 6 секунд нечисть бежит к ней, потом избушка топает','Drops a hut: monsters run to it for 6 seconds, then it stomps');},
    icon:icon('bol_izba','chest'),cd:sk('izba','cd'),dur:sk('izba','dur'),from:function(){return L('победа над Бабой-ягой','defeat Baba Yaga');},
    open:function(){var b=S.bossKill||{};return !!(b.yaga||b.yaga_r);},auto:function(g){return threat(g,6,220);},
    use:function(g,P,x){var H=g.hero,st=x.st;st.on=sk('izba','dur');st.P=P;st.x=H.x;st.y=H.y;st.A=g.st.area;burst(H.x,H.y,'#c8a878',12,140);SND.crack();},
    tick:function(g,dt,st){var H=g.hero;forNear(st.x,st.y,340,function(e){if(e.dead||e.boss||e.prop||e.stun>0)return;var dx=st.x-e.x,dy=st.y-e.y,d=Math.hypot(dx,dy)||1;if(d>340)return;
        var hx=H.x-e.x,hy=H.y-e.y,hd=Math.hypot(hx,hy)||1,sp=e.spd*(e.slow>0?.55:1)*dt,k=d>e.r+26?1.15:0;e.x+=(dx/d*k-hx/hd)*sp;e.y+=(dy/d*k-hy/hd)*sp;});},
    off:function(g,st){var R=170*(st.A||1);g.fx.push({k:'wave',x:st.x,y:st.y,t:0,dur:.5,r1:R,col:'#e0a43a'});g.shake=Math.max(g.shake,9);SND.boom();
      near(st.x,st.y,R,function(e,ux,uy){e.stun=Math.max(e.stun||0,e.boss?.5:1);U.hit(e,sk('izba','dmg')*st.P,ux*300,uy*300);});},
    draw:function(c,g,st){var hop=st.on<.5?-Math.sin((.5-st.on)/.5*Math.PI)*22:Math.abs(Math.sin(g.t*3))*-3;if(ART.bol_izba)drawSpr('bol_izba',st.x,st.y-14+hop,1.15,1.15);}});
  U.reg('moroz',{name:function(){return L('Мороз-воевода','Frost the Commander');},desc:function(){return L('Круг льда на 3 секунды: застывшая нечисть получает двойной урон','A ring of ice for 3 seconds: frozen monsters take double damage');},
    icon:'um_sneg',cd:sk('moroz','cd'),dur:sk('moroz','dur'),from:function(){return L('Логово Студёных гор','the Frozen Mountains Lair');},open:function(){return lair('gory');},
    auto:function(g){return threat(g,5,200);},
    use:function(g,P,x){var H=g.hero,st=x.st,d=sk('moroz','dur')*(x.auto?num('autoK'):1),R=210*g.st.area;st.on=d;st.d=d;st.x=H.x;st.y=H.y;st.R=R;
      near(H.x,H.y,R,function(e){var t=e.boss?d/2:d;e.stun=Math.max(e.stun||0,t);e.umF=g.t+t;e.umK=num('morozK');});
      g.fx.push({k:'wave',own:1,t:0,dur:.45,r1:R,col:'#9ad8ff'});SND.crack();},
    draw:function(c,g,st){drawSpr('um_led',st.x,st.y,st.R/56,st.R/56,0,0,Math.min(1,st.on/st.d*2)*.9);}});
  function lair(th){try{var s=lairSlot(th);return s>=0&&!!S.done[s];}catch(e){return false;}}
  /* гостинцы (одноразовая 4-я кнопка) */
  U.giftReg('zamah',{name:function(){return L('Замах','Mighty Swing');},icon:'i_mace',use:function(g,P){var H=g.hero,R=150*g.st.area;g.fx.push({k:'wave',own:1,t:0,dur:.4,r1:R,col:'#ffd84a'});g.shake=Math.max(g.shake,6);SND.boom();
    near(H.x,H.y,R,function(e,ux,uy){U.hit(e,sk('zamah','dmg')*P,ux*480,uy*480);});}});
  U.giftReg('shit',{name:function(){return L('Щит','Shield');},icon:'um_shit',use:function(g){var H=g.hero;H.inv=Math.max(H.inv,sk('gshit','dur'));g.fx.push({k:'pulse',own:1,t:0,dur:.5,r1:60});SND.level();}});
  U.giftReg('ryvok',{name:function(){return L('Рывок','Dash');},icon:icon('pt_konek','p_boots'),use:function(g){var H=g.hero,d=sk('ryvok','dur');H.inv=Math.max(H.inv,d);g.dashT=Math.max(g.dashT,d);SND.swing();}});

  /* ---------- поход ---------- */
  function cdOf(g,d){var k=num('cdK');if(d.builtin)return darCd()*k;if(d.hero)return d.cd*(1-.07*darRank())*k;return d.cd*(1-num('lvCd')*U.lv(d.id))*k;}
  function powOf(g,d,auto){return g.st.might*(d.hero?1+.3*darRank():d.gift?1:1+num('lvPow')*U.lv(d.id))*(auto?num('autoK'):1);}
  function mkSlot(g,d,i){if(!d)return null;var cd=d.gift?1:cdOf(g,d);return {i:i,d:d,cd:cd,t:d.gift?cd:cd*num('start'),b:0,rdy:d.gift?1:0,rT:0,act:0,sh:0,pop:0,st:{on:0}};}
  function mainDef(g){var h=g.heroId,a=U.hs[h],d=a&&a.main;if(d)return d;d=heroDef(h).dar;return {id:'h:'+h,hero:h,builtin:1,name:d.name,icon:'hp_'+g.hkey,cd:d.cd};}
  function dailyIds(g){var a=U.ids.slice(),r=[null,null,null],s=(g.daily&&g.daily.seed)|0,i;for(i=1;i<3&&a.length;i++){s=(s*1103515245+12345)&0x7fffffff;r[i]=a.splice(s%a.length,1)[0];}return r;}
  var R={};
  R.run=function(g){if(g.um||!U.on())return;var o=U.sv(),ids=g.daily?dailyIds(g):U.slots(g.heroId),gf=o.g&&U.gf[o.g]?o.g:'',gd=null;
    if(gf&&!g.first&&!g.daily){gd=Object.create(U.gf[gf]);gd.gift=1;U.w('g','');}
    var u=g.um={sl:[mkSlot(g,mainDef(g),0),mkSlot(g,ids[1]&&U.by[ids[1]],1),mkSlot(g,ids[2]&&U.by[ids[2]],2),mkSlot(g,gd,3)],
      auto:U.mode()===1,fix:o.m|0,dmg:0,nh:0,na:0,ng:0,t:0,mv:0,cast:0,tap:null,pp:null,hint:null,hd:(o.h||!g.first)?1:0,xpT:0,bh:null,W:0,H:0,dpr:0,left:o.l?1:0,pal:(o.p&&BB2.on('UM_PALEC'))?1:0,
      pc:PC.on};
    g.umK=1;tipUp(u.sl[1]||u.sl[2]||u.sl[3]);};
  function tipUp(y){try{if(y&&!document.getElementById('umCssR')){var s=document.createElement('style');s.id='umCssR';s.textContent='body.um2 #tip{bottom:calc(var(--sb) + 136px)}';document.head.appendChild(s);}
    document.body.classList[y?'add':'remove']('um2');}catch(e){}}
  BB2.hook('menu',function(){tipUp(0);});
  R.dar=function(g){var u=g.um;if(u.go){u.go=0;return;}return true;};
  function fire(i,auto){if(typeof G==='undefined'||!G)return false;var g=G,u=g.um,s=u&&u.sl[i];if(!s||g.win||g.over||g.paused)return false;
    if(i===0&&g.bb2v&&g.bb2v.x&&g.bb2v.x.nodar){s.sh=.3;return false;} /* MERGE: зарок TAIL «Без дара» — именное гнездо молчит */
    if(s.ov){var oid=s.ov.id;try{s.ov.use(g,{slot:i,auto:auto|0});}catch(x){}s.pop=.25;BB2.hk('um',oid||'over',{slot:i,auto:auto|0,hero:g.heroId,t:Math.round(g.t),over:1},g);return true;}
    if(!s.rdy){s.sh=.3;return false;}
    var d=s.d,k=auto?num('autoK'):1;
    if(d.builtin){u.go=1;g.umK=k;g.darT=0;} /* updDar выполнит нынешний дар героя в ближайшем кадре */
    else{s.st={on:0};var r;try{r=d.use(g,powOf(g,d,auto),{slot:i,auto:auto|0,st:s.st});}catch(x){r=false;try{console.warn('um '+d.id+': '+x.message);}catch(e){}}
      if(r===false){s.sh=.3;return false;}
      heroSay(U.tx(d.say)||(U.tx(d.name)+'!').replace('!!','!'));if(!d.gift)g.q.dars++;}
    s.rdy=0;s.t=0;s.b=0;s.rT=0;s.pop=.25;s.act=d.dur||0;if(d.gift){s.used=1;u.ng++;}else{s.cd=cdOf(g,d);if(auto)u.na++;else u.nh++;}
    if(!auto){vib(18);var o=U.sv();if((o.n|0)<99)o.n=(o.n|0)+1;if(!u.t1){u.t1=1;ev('um_tap',{u:d.id,s:i,t:Math.round(g.t)});}
      if(u.auto&&!u.fix&&(o.n|0)>=2){u.auto=false;if(!o.told){toast(L('Умения теперь нажимаешь сам. Вернуть «Сами» — в Настройках','You now trigger skills yourself. Switch back to “Auto” in Settings'));o.told=1;}}}
    BB2.hk('um',d.id,{slot:i,auto:auto|0,hero:g.heroId,t:Math.round(g.t),gift:d.gift?1:0},g);return true;}
  R.fire=fire;
  R.charge=function(i,sec){if(typeof G==='undefined'||!G||!G.um)return;var a=G.um.sl,j,s;for(j=0;j<3;j++){s=a[j];if(!s||s.rdy||(i>=0&&i!==j))continue;
      if(sec===true||sec==null)s.t=s.cd;else s.t+=sec;}};
  R.st=function(){if(typeof G==='undefined'||!G||!G.um)return [];return G.um.sl.map(function(s){return s?{id:s.d.id,q:s.rdy?1:Math.min(1,(s.t+s.b)/s.cd),ready:!!(s.rdy||s.ov),on:s.act>0}:null;});};
  R.over=function(i,d){if(typeof G==='undefined'||!G||!G.um)return false;var s=G.um.sl[i];if(!s)return false;s.ov=d||null;s.im=null;return true;};
  function bonus(u,sec){for(var j=0;j<3;j++){var s=u.sl[j];if(s&&!s.rdy)s.b=Math.min(s.b+sec,s.t);}} /* не быстрее чем вдвое: довесок не больше прошедшего времени */

  BB2.hook('kill',function(e){if(typeof G==='undefined'||!G||!G.um||e.prop)return;bonus(G.um,e.elite||e.mini?num('elite'):e.boss?0:num('kill'));});
  BB2.hook('bossIn',function(e,g){if(g&&g.um){R.charge(-1,true);g.um.bh=null;}});
  BB2.hook('st',function(st){if(typeof G!=='undefined'&&G&&G.um&&G.um.xpT>0)st.xp*=num('xpK');});
  BB2.hook('frame',function(dt,g){var u=g.um;if(!u||g.win||g.over)return;var i,s,H=g.hero,o;
    u.t+=dt;u.mv=IN.on?u.mv+dt:0;
    if(g.boss&&!g.boss.dead){if(u.bh!=null&&g.boss.hp<u.bh&&g.boss.max>0)bonus(u,(u.bh-g.boss.hp)/g.boss.max/num('bossPct'));u.bh=g.boss.hp;}else u.bh=null;
    for(i=0;i<4;i++){s=u.sl[i];if(!s)continue;
      if(s.sh>0)s.sh-=dt;if(s.pop>0)s.pop-=dt;
      if(s.act>0)s.act-=dt;
      if(s.st.on>0){s.st.on-=dt;try{if(s.st.on>0){if(s.d.tick)s.d.tick(g,dt,s.st);}else if(s.d.off)s.d.off(g,s.st);}catch(x){s.st.on=0;}}
      if(s.d.gift){if(s.used&&s.st.on<=0&&s.pop<=0)u.sl[i]=null;continue;}
      if(!s.rdy){s.t+=dt;if(s.t+s.b>=s.cd){s.rdy=1;s.rT=0;s.pop=.3;if(i===0||u.nh)SND.gem();BB2.hk('umReady',i,s.d.id,g);}}
      else{s.rT+=dt;if(s.ov||(i===0&&!u.hd))continue;
        if((u.auto?s.rT>=num('autoWait'):!u.fix&&s.rT>=num('idle'))&&(s.d.auto?s.d.auto(g):s.d.builtin&&(g.heroId==='vas'||g.heroId==='iva')||threat(g,1,230)))fire(i,1);}}
    /* подсказка первого похода: окружили → время замедляется, палец показывает на кнопку; не нажал за 4 с — сработает само */
    if(!u.hd){s=u.sl[0];if(u.hint){if(now()-u.hint>num('hintWait')*1000)hintEnd(g,2);}
      else if(s&&g.t>=8&&!(g.tut&&g.tut.q)&&(g.t>=num('hintT')+6||g.t>=num('hintT')-8&&threat(g,7,170))){if(!s.rdy){s.t=s.cd;s.rdy=1;s.rT=0;}u.hint=now();u.hy=tipTop();g.slowT=Math.max(g.slowT||0,num('hintWait'));ev('um_hint',{a:'see',t:Math.round(g.t)});}}
    if(u.ad){o=u.ad;if(g.t-o.t>.2){if(adGot(g,o)){u.adN=(u.adN|0)+1;R.charge(-1,true);toast(L('Жар‑птица: все умения заряжены!','Firebird: all skills charged!'));ev('um_ad',{k:o.k});}u.ad=null;}}
  });
  function tipTop(){try{var t=document.getElementById('tip');if(t&&t.classList.contains('on')){var r=t.getBoundingClientRect(),c=cv.getBoundingClientRect();if(r.height>0)return r.top-c.top-46;}}catch(e){}return null;} /* подсказка обучения закрывает низ — свою плашку ставим над ней */
  function hintEnd(g,how){var u=g.um;if(u.hd)return;u.hd=1;u.hint=null;g.slowT=0;U.sv().h=1;ev('um_hint',{a:how===2?'auto':how===1?'tap':'early',t:Math.round(g.t)});if(how===2)fire(0,2);}
  BB2.hook('end',function(g,win){var u=g.um;if(!u)return;var a=[],i;for(i=1;i<3;i++)if(u.sl[i])a.push(u.sl[i].d.id);
    ev('um_end',{m:u.auto?1:2,h:u.nh,a:u.na,g:u.ng,s:a.join(','),w:win?1:0});});

  /* ---------- Жар-птица: любой дар за рекламу — и все умения заряжены (флаг UM_AD) ---------- */
  function lvSum(g){var n=g.weapons.length,i,k;for(i=0;i<g.weapons.length;i++)n+=g.weapons[i].lvl;for(k in g.pas)n+=g.pas[k]|0;return n;}
  function adGot(g,o){return o.k==='gold'?g.goldMul>=2&&o.gm<2:o.k==='heal'?g.hero.inv>3.6:lvSum(g)>o.lv;}
  BB2.hook('modal',function(kind,m){if(kind!=='gift'||typeof G==='undefined'||!G||!G.um||!BB2.on('UM_AD')||!m.querySelector('[data-g]')||(G.um.adN|0)>=BB2.n('um.adCharge',1))return;var g=G;
    BB2.put(m,'end','<p class="sub" style="margin:8px 0 0;text-align:center">'+L('…и все умения сразу заряжены','…and all your skills are charged at once')+'</p>','umAd');
    var b=m.querySelectorAll('[data-g]'),i;for(i=0;i<b.length;i++)b[i].addEventListener('click',function(){g.um.ad={k:this.getAttribute('data-g'),t:g.t,gm:g.goldMul,lv:lvSum(g)};});
    var no=m.querySelector('#gNo');if(no)no.addEventListener('click',function(){g.um.ad=null;});});

  /* ---------- кнопки: место, картинки, нажатие ---------- */
  var PC={on:false};try{PC.on=!('ontouchstart' in window)&&window.matchMedia&&window.matchMedia('(pointer:fine)').matches;}catch(e){}
  var KEY=[L('ПРОБЕЛ','SPACE'),'1','2','3'];
  function lay(u){var W=VIEW.W,H=VIEW.H,sb=window.__safeBot||0,m=10,i,s,P=[[m+30,H-m-30-sb,30],[W-m-26,H-m-26-sb,26],[W-m-26-46,H-m-26-sb-50,26],[m+22,H-m-60-sb-12-22,22]];
    u.W=W;u.H=H;for(i=0;i<4;i++){s=u.sl[i];if(!s)continue;s.x=u.left?W-P[i][0]:P[i][0];s.y=P[i][1];s.R=P[i][2];}}
  function btnImg(s,rdy,pc){var R=s.R,k=Math.min(3,VIEW.dpr||1),sz=(R*2+10),c=mkCanvas(sz*k,sz*k),g=c.getContext('2d'),d=s.ov||s.d,ic=d.icon,a;g.setTransform(k,0,0,k,sz*k/2,sz*k/2);
    g.beginPath();g.arc(0,0,R,0,PI2);g.fillStyle=rdy?'rgba(52,34,20,.92)':'rgba(22,16,30,.8)';g.fill();
    if(ic&&ART[ic]){a=drawArt(ic,Math.ceil(R*1.62*k));g.save();g.beginPath();g.arc(0,0,R-2,0,PI2);g.clip();g.drawImage(a,-R*.81,-R*.81,R*1.62,R*1.62);g.restore();}
    g.lineWidth=rdy?3.5:2.5;g.strokeStyle=rdy||s.ov?'#ffd84a':'rgba(230,214,180,.75)';g.beginPath();g.arc(0,0,R,0,PI2);g.stroke();
    if(rdy){g.lineWidth=1.2;g.strokeStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(0,0,R-3,0,PI2);g.stroke();}
    if(pc){var t=KEY[s.i],w;g.font='800 10px '+((typeof CVL!=='undefined'&&CVL.font)||'sans-serif');g.textAlign='center';g.textBaseline='middle';w=Math.max(16,g.measureText(t).width+8);
      rrect(g,-w/2,R-9,w,14,4);g.fillStyle='rgba(12,8,18,.88)';g.fill();g.fillStyle='#fff3c8';g.fillText(t,0,R-1.5);}
    return c;}
  var DG={};
  function digit(n){var k=Math.min(3,VIEW.dpr||1),id=n+'@'+k,c=DG[id],g;if(c)return c;c=DG[id]=mkCanvas(28*k,28*k);g=c.getContext('2d');g.setTransform(k,0,0,k,14*k,14*k);
    g.font='900 20px '+((typeof CVL!=='undefined'&&CVL.font)||'sans-serif');g.textAlign='center';g.textBaseline='middle';g.lineWidth=4;g.strokeStyle='rgba(12,8,18,.9)';g.strokeText(n,0,1);g.fillStyle='#fff';g.fillText(n,0,1);return c;}
  function hintImg(u,g){var k=Math.min(3,VIEW.dpr||1),t=PC.on?L('Жми ПРОБЕЛ — '+U.tx(u.sl[0].d.name)+'!','Press SPACE — '+U.tx(u.sl[0].d.name)+'!'):L('Нажми — '+U.tx(u.sl[0].d.name)+'!','Tap — '+U.tx(u.sl[0].d.name)+'!'),
      c=mkCanvas(10,10),x=c.getContext('2d'),f='800 17px '+((typeof CVL!=='undefined'&&CVL.font)||'sans-serif'),w;x.font=f;w=Math.ceil(x.measureText(t).width)+28;c=mkCanvas(w*k,38*k);x=c.getContext('2d');x.setTransform(k,0,0,k,0,0);
    rrect(x,1,1,w-2,36,12);x.fillStyle='rgba(60,20,12,.93)';x.fill();x.lineWidth=2;x.strokeStyle='#ffd84a';x.stroke();x.font=f;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff3c8';x.fillText(t,w/2,20);c.w=w;return c;}
  function drawBtn(c,s,x,y,u){var R=s.R,rdy=s.rdy||s.ov,sz=R*2+10,key=(VIEW.dpr||1)+'|'+(u.pc?1:0),w,q,left;
    if(!s.im||s.imK!==key){s.im=[btnImg(s,0,u.pc),btnImg(s,1,u.pc)];s.imK=key;}
    w=sz*(1+(s.pop>0?s.pop*.7:0));if(s.sh>0)x+=Math.sin(s.sh*60)*3;
    if(!rdy)c.globalAlpha=.72;c.drawImage(s.im[rdy?1:0],x-w/2,y-w/2,w,w);c.globalAlpha=1;
    if(!rdy){q=Math.min(1,(s.t+s.b)/s.cd);c.fillStyle='rgba(8,6,14,.5)';c.beginPath();c.moveTo(x,y);c.arc(x,y,R-2,-Math.PI/2+PI2*q,Math.PI*1.5);c.closePath();c.fill();
      left=s.cd-s.t-s.b;if(left<=5&&left>0)c.drawImage(digit(Math.ceil(left)),x-14,y-14,28,28);}
    if(s.act>0){c.lineWidth=3;c.strokeStyle='#ff9a3a';c.beginPath();c.arc(x,y,R+4,0,PI2);c.stroke();}}
  function ppPos(u,i){var p=u.pp,o=[[-60,-34],[0,-76],[60,-34]][i],R=u.sl[i].R;return [Math.max(R+6,Math.min(u.W-R-6,p.x+o[0])),Math.max(R+60,Math.min(u.H-R-6,p.y+o[1]))];}
  BB2.hook('drawTop',function(c,g){var u=g.um;if(!u||g.over||g.win)return;var i,s,p;if(u.W!==VIEW.W||u.H!==VIEW.H||u.lf!==u.left){lay(u);u.lf=u.left;}
    for(i=0;i<4;i++){s=u.sl[i];if(s)drawBtn(c,s,s.x,s.y,u);}
    if(u.pp){if(now()-u.pp.t>num('palecMs'))u.pp=null;else for(i=0;i<3;i++){s=u.sl[i];if(s&&(s.rdy||s.ov)){p=ppPos(u,i);drawBtn(c,s,p[0],p[1],u);}}}
    if(u.hint){s=u.sl[0];if(!u.hi)u.hi=hintImg(u,g);var w=u.hi.w,x=Math.max(6,Math.min(u.W-w-6,s.x-30)),y=u.hy!=null?u.hy:s.y-s.R-50,b=Math.sin(now()/160)*5,ps=spr('um_palec');
      c.drawImage(u.hi,x,y,w,38);if(ps){c.save();c.translate(s.x+(u.left?-30:30),s.y-s.R-2-b);if(u.left)c.scale(-1,1);c.drawImage(ps.c,-20,-20,40,40);c.restore();}
      c.lineWidth=3;c.strokeStyle='#ffd84a';c.beginPath();c.arc(s.x,s.y,s.R+7+b*.4,0,PI2);c.stroke();}});

  /* эффекты умений на поле (мировые координаты, готовые картинки) */
  BB2.hook('draw',function(c,g){var u=g.um,i,s;if(!u)return;for(i=0;i<4;i++){s=u.sl[i];if(s&&s.st.on>0&&s.d.draw)try{s.d.draw(c,g,s.st);}catch(x){}}});
  function pt(e){var r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
  function hitSlot(u,x,y,pad){var i,s,p,r;pad=pad||8;if(u.W!==VIEW.W||u.H!==VIEW.H)lay(u);
    if(u.pp)for(i=0;i<3;i++){s=u.sl[i];if(!s||!(s.rdy||s.ov))continue;p=ppPos(u,i);r=s.R+pad+6;if((x-p[0])*(x-p[0])+(y-p[1])*(y-p[1])<=r*r)return i;}
    for(i=0;i<4;i++){s=u.sl[i];if(!s)continue;r=s.R+pad;if((x-s.x)*(x-s.x)+(y-s.y)*(y-s.y)<=r*r)return i;}return -1;}
  function press(i){var g=G,u=g.um;if(u.hint&&i===0){hintEnd(g,1);}else if(!u.hd&&i===0&&u.sl[0]&&u.sl[0].rdy){u.hd=1;U.sv().h=1;ev('um_hint',{a:'early',t:Math.round(g.t)});}
    if(u.pp){u.pp=null;g.slowT=0;}return fire(i,0);}
  BB2.hook('tap',function(e,g){var u=g.um;if(!u)return;var p=pt(e),i=hitSlot(u,p[0],p[1]);if(i<0)return;u.tap={id:e.pointerId,i:i,t:now()};return true;},true);
  window.addEventListener('pointerup',function(e){if(typeof G==='undefined'||!G||!G.um)return;var u=G.um,t=u.tap,p;
    if(t&&t.id===e.pointerId){u.tap=null;if(G.paused||G.over)return;p=pt(e);if(now()-t.t<=num('tapMs')&&hitSlot(u,p[0],p[1],16)===t.i)press(t.i);return;}
    /* «Под палец»: отпустил палец, которым вёл, — время замедляется, готовые кнопки всплывают у пальца */
    if(u.pal&&!G.paused&&!G.over&&e.pointerId===IN.id&&u.mv>.25&&e.pointerType!=='mouse'){var a=u.sl,any=0,i;for(i=0;i<3;i++)if(a[i]&&(a[i].rdy||a[i].ov))any=1;
      if(any){p=pt(e);u.pp={x:p[0],y:p[1],t:now()};G.slowT=Math.max(G.slowT||0,.5);}}});
  window.addEventListener('pointercancel',function(e){if(typeof G!=='undefined'&&G&&G.um&&G.um.tap&&G.um.tap.id===e.pointerId)G.um.tap=null;});
  var KM={Space:0,Digit1:1,KeyQ:1,Digit2:2,KeyE:2,Digit3:3,KeyF:3};
  window.addEventListener('keydown',function(e){if(typeof G==='undefined'||!G||!G.um||G.paused||G.over||e.repeat)return;var i=KM[e.code];if(i===undefined)return;
    if(e.code==='Space'){e.preventDefault();var a=document.activeElement;if(a&&a.blur&&a.tagName==='BUTTON')a.blur();}
    if(!G.um.pc){G.um.pc=true;PC.on=true;}if(G.um.sl[i])press(i);});
  U.rt=R;
  /* поход уже идёт (файл догрузился посреди него) — подхватываем */
  try{if(typeof G!=='undefined'&&G&&!G.over&&!G.um&&U.on())R.run(G);}catch(e){}
})();
