/* bb2-lovb-chuchela.js — «Сто чучел» (ловкостная на рекорд, поток LOVB). «Ристалище» на движке боя (js/bb2-lov-rist.js, LOVRIST потока LOVA):
   соломенные чучела нечисти в шапках боссов стоят по кругу, у богатыря — оружие дня (у всех одно и то же, каждый день другое, уровень 4).
   Разнеси 100 как можно быстрее; последнее чучело убегает. Счёт — секунды, меньше — лучше (less:1). Не уложился в 3 минуты — партия не в зачёт.
   Чучела не бьют: поражения нет, есть только время. Ни золота, ни похода, ни опыта — песочница LOVRIST. */
(function(){
var K=LOVK,TAU=Math.PI*2,R=LOVRIST;
/* числа игры (не экономика) */
/* hk — запас чучела в ударах оружия дня (подобран ботом LOVB-tools/cal_chu.py: время 100 чучел ~45–60 с у любого оружия) */
var N={n:100,live:14,lvl:4,hk:{sword:.9,bow:1.8,mace:1.4,fire:1.1,gusli:.95,perun:.75,kolo:.45,axe:.9,water:.7},max:180,run:62,ids:['sword','bow','mace','fire','gusli','perun','kolo','axe','water']};
var HATS=['kosh','yaga','solo','gory','none'];
var SAY=[['Ой, солома!','Ow, my straw!'],['Я ж понарошку!','I’m just pretend!'],['Набит, но не сдаюсь','Stuffed but unbowed'],['Где моя шапка?','Where’s my hat?']]; // i18n:ru
/* чучело: свой вид (r 17 — «Увернись!» его не берёт) и рисунок */
if(typeof EN!=='undefined'&&!EN.lov_chu)EN.lov_chu={n:L('Чучело','Dummy'),r:17,hp:10,spd:0,dmg:0,xp:0,col:'#d8b46a'};
if(typeof art==='function'&&!ART.lov_chu)art('lov_chu',44,function(g){g.strokeStyle='#6b4320';g.lineWidth=3;g.beginPath();g.moveTo(0,20);g.lineTo(0,-6);g.moveTo(-16,-2);g.lineTo(16,-2);g.stroke();
  g.fillStyle='#e0bf6a';g.strokeStyle='#8a6a28';g.lineWidth=1.6;g.beginPath();g.moveTo(-9,-4);g.lineTo(9,-4);g.lineTo(11,14);g.lineTo(-11,14);g.closePath();g.fill();g.stroke();
  g.strokeStyle='#b89040';g.beginPath();for(var i=-8;i<=8;i+=4){g.moveTo(i,14);g.lineTo(i+1,19);}g.moveTo(-16,-2);g.lineTo(-19,2);g.moveTo(16,-2);g.lineTo(19,2);g.stroke();
  g.fillStyle='#f0d88a';g.beginPath();g.arc(0,-11,8,0,TAU);g.fill();g.strokeStyle='#8a6a28';g.stroke();g.fillStyle='#3a2410';g.fillRect(-4,-13,2,2);g.fillRect(2,-13,2,2);g.fillRect(-3,-8,6,1.5);
  g.fillStyle='#c8392f';g.fillRect(-9,2,18,3);});
function run(host,o){
  var A=null,g=null,H=null,t=0,live=false,over=false,demo=0,demoT=0,killed=0,spawned=0,mine=[],hats={},wid='sword',msg=null,quip=3,fin=0;
  wid=N.ids[Math.abs((o.seed|0)+(o.day?0:0))%N.ids.length];if(window.__lovW)wid=window.__lovW;if(!WEAPONS[wid])wid='sword';
  function chi(){try{var a=[],i;for(i=0;i<ORD.length;i++){if(i&&!S.done[ORD[i-1]])break;if(CH[ORD[i]]&&CH[ORD[i]].en)a.push(ORD[i]);}return a.length?a[(Math.floor(o.seed||0))%a.length]:0;}catch(e){return 0;}}
  function hp(){var w=WEAPONS[wid];return (w.dmg[N.lvl-1]||w.dmg[0])*(N.hk[wid]||1);}
  function place(){var i,x,y,ok,n=0,Hh=g.hero;do{var a=Math.random()*TAU,d=Math.sqrt(Math.random())*(R.R-26);x=Math.cos(a)*d;y=Math.sin(a)*d;ok=Math.hypot(x-Hh.x,y-Hh.y)>70;
      for(i=0;ok&&i<mine.length;i++)if(!mine[i].dead&&Math.hypot(mine[i].x-x,mine[i].y-y)<40)ok=false;}while(!ok&&++n<30);return [x,y];}
  function put(){var p=place(),e=R.spawn('lov_chu',p[0],p[1],{spd:1});e.spd=0;e.dmg=0;e.hp=e.max=hp();e.xp=0;e.hat=HATS[spawned%HATS.length];e.pop=0;spawned++;mine.push(e);return e;}
  function note(t2){msg={t:L(t2[0],t2[1]),a:2.2};}
  function frame(dt){var Hh=g.hero,d=Math.hypot(Hh.x,Hh.y),i,e;if(d>R.R-14){Hh.x*=(R.R-14)/d;Hh.y*=(R.R-14)/d;}
    if(demo){demoT+=dt;var best=null,bd=1e9;for(i=0;i<mine.length;i++){e=mine[i];if(e.dead)continue;var q=(e.x-Hh.x)*(e.x-Hh.x)+(e.y-Hh.y)*(e.y-Hh.y);if(q<bd){bd=q;best=e;}}
      IN.on=!!best&&bd>50*50;IN.id=-7;IN.ox=VIEW.W/2;IN.oy=VIEW.H*.74;if(best){var an=Math.atan2(best.y-Hh.y,best.x-Hh.x);IN.px=IN.ox+Math.cos(an)*42;IN.py=IN.oy+Math.sin(an)*42;}A.fake=1;
      if(demoT>4.5){demo=0;A.fake=0;IN.on=false;begin(1);return;}}
    else if(live)t+=dt;
    for(i=mine.length-1;i>=0;i--){e=mine[i];if(e.pop<1)e.pop=Math.min(1,e.pop+dt*4);if(e.dead){mine.splice(i,1);if(!demo){killed++;if(Math.random()<.12)try{g.bub.push({e:{x:e.x,y:e.y,r:16,sc:1,dead:false},s:L.apply(null,K.pick(SAY)),t:0,dur:1.6});}catch(x){}}
        if(spawned<N.n||demo)put();}}
    if(!demo&&live){if(killed>=N.n-1&&mine.length===1&&!mine[0].beh){mine[0].beh='lov_run';mine[0].spd=N.run;mine[0].hp=Math.min(mine[0].hp,hp()*.6);note(['Последнее убегает! Догони!','The last one is running! Catch it!']);try{g.bub.push({e:mine[0],s:L('Не догонишь!','Can’t catch me!'),t:0,dur:2.4});}catch(x){}} // i18n:ru
      if(killed>=N.n||t>=N.max){var f=killed>=N.n?0:1;live=false;setTimeout(function(){finish(f);},0);return;}
      quip-=dt;if(quip<=0){quip=6+Math.random()*4;var left=N.n-killed;if(left<=50&&!fin){fin=1;note(['Половина! Жми дальше','Halfway! Keep going']);}}} // i18n:ru
    if(msg){msg.a-=dt;if(msg.a<=0)msg=null;}
    if(H&&!demo)H.set(Math.floor(t));}
  function draw(c){worldT();var i,e;for(i=0;i<mine.length;i++){e=mine[i];if(e.dead||e.hat==='none')continue;var hk=hats[e.hat]||(hats[e.hat]=mkHat(e.hat));c.drawImage(hk,e.x-11,e.y-33-(1-e.pop)*10,22,16);}}
  function mkHat(k){var s=Math.min(VIEW.B,2.5),q=mkCanvas(22*s,16*s),x=q.getContext('2d');x.setTransform(s,0,0,s,0,0);x.lineWidth=1.4;x.strokeStyle='#2a1a0a';
    if(k==='kosh'){x.fillStyle='#e6b53a';x.beginPath();x.moveTo(3,15);x.lineTo(3,5);x.lineTo(7,10);x.lineTo(11,2);x.lineTo(15,10);x.lineTo(19,5);x.lineTo(19,15);x.closePath();x.fill();x.stroke();x.fillStyle='#c8392f';x.fillRect(10,11,2,2);}
    else if(k==='yaga'){x.fillStyle='#7a3a8a';x.beginPath();x.moveTo(2,15);x.quadraticCurveTo(11,-2,20,15);x.closePath();x.fill();x.stroke();x.fillStyle='#ffd25a';x.beginPath();x.arc(8,10,1.4,0,TAU);x.arc(14,8,1.4,0,TAU);x.fill();}
    else if(k==='solo'){x.fillStyle='#3a3a6a';x.beginPath();x.ellipse(11,12,9,4,0,0,TAU);x.fill();x.stroke();x.strokeStyle='#d8483a';x.lineWidth=2;x.beginPath();x.moveTo(13,10);x.quadraticCurveTo(18,2,21,1);x.stroke();}
    else{x.fillStyle='#3d8a35';for(var i=0;i<3;i++){x.beginPath();x.arc(5+i*6,9-(i===1?3:0),3.4,0,TAU);x.fill();x.stroke();}x.fillStyle='#fff';x.fillRect(4,8,1.5,1.5);x.fillRect(10,5,1.5,1.5);x.fillRect(16,8,1.5,1.5);}
    return q;}
  function hud(c,G0,W,Hh){if(demo){K.tag(c,W,K.top()+116,L('Смотри: подходи ближе — оружие бьёт само','Watch: get close — the weapon strikes by itself'));if(IN.on)K.finger(c,IN.px,IN.py,1);return;}
    var left=Math.max(0,N.n-killed);K.tag(c,W,K.top()+116,L('Осталось: ','Left: ')+left+' · '+WEAPONS[wid].name);
    if(msg){c.globalAlpha=Math.min(1,msg.a*2);K.tag(c,W,K.top()+152,msg.t,'rgba(150,40,20,.86)');c.globalAlpha=1;}
    if(live&&t<3&&!msg)K.tag(c,W,Hh-30,zabPC()?L('Стрелки или мышь — веди богатыря','Arrows or mouse — lead the hero'):L('Води пальцем — веди богатыря','Drag to lead the hero'));}
  function finish(fail){if(over)return;over=true;live=false;var sc=Math.max(1,Math.round(t));if(H)H.end();A.close();
    if(fail){host.done({score:0,fail:1,extra:{msg:L('Не успел за 3 минуты: разнесено '+killed+'. Иди к кучке чучел, а не к одному','Not done in 3 minutes: '+killed+' smashed. Head for clusters, not single dummies')}});return;}
    host.done({score:sc,extra:{msg:L('Оружие дня — '+WEAPONS[wid].name+'. Завтра — другое','Weapon of the day: '+WEAPONS[wid].name+'. Tomorrow — another')}});}
  function begin(fresh){var i;g.en.length=0;mine.length=0;g.bub.length=0;g.hero.x=0;g.hero.y=0;g.cam.x=0;g.cam.y=0;t=0;killed=0;spawned=0;live=true;msg=null;fin=0;
    g.weapons=[{id:wid,lvl:N.lvl,t:.3,a:0}];for(i=0;i<N.live;i++)put();if(fresh)note(['Теперь ты!','Your turn!']);A.pause(false);} // i18n:ru
  if(typeof BEH!=='undefined'&&!BEH.lov_run)BEH.lov_run={step:function(e,dt,G0){var Hh=G0.hero,dx=e.x-Hh.x,dy=e.y-Hh.y,d=Math.hypot(dx,dy)||1;if(d>140)return true;
    var a=Math.atan2(dy,dx)+Math.sin(G0.t*1.7)*.5,sp=e.spd*(e.slow>0?.45:1),nx=e.x+Math.cos(a)*sp*dt,ny=e.y+Math.sin(a)*sp*dt;
    if(Math.hypot(nx,ny)>R.R-24){var tg=Math.atan2(e.y,e.x)+(Math.sin(a-Math.atan2(e.y,e.x))>0?1:-1)*Math.PI/2;nx=e.x+Math.cos(tg)*sp*dt;ny=e.y+Math.sin(tg)*sp*dt;}
    e.x=nx;e.y=ny;e.face=dx<0?-1:1;return true;}};
  A=R.open(host,{chi:chi(),frame:frame,hit:function(){},draw:draw,hud:hud});g=A.G;
  ZABK.loop(host,function(){if(G===g&&live)g.paused=host.paused;});
  host.dbg={t:function(){return t;},G:function(){return g;},live:function(){return live;},demo:function(){return demo;},left:function(){return N.n-killed;},wid:function(){return wid;}};
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);if(o.first&&!o.again){demo=1;demoT=0;g.weapons=[{id:wid,lvl:N.lvl,t:.3,a:0}];for(var i=0;i<6;i++)put();live=true;A.pause(false);}else begin(0);});
}
ZAB_REG({id:'chuchela',kind:'lov',n:zabN('Сто чучел','A Hundred Dummies'),run:run});
})();
