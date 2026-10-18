/* b2-mg-plavka.js — MG2: «🔥 Плавка до черты» — игра края Норильск (nor; формат KRAI). Договор — шапка js/b2-mg-core.js; опись — js/b2-mg2.js, id 'plavka'.
   40 с: формы едут под ковш. ДЕРЖИТЕ — льётся металл, отпустите у черты. В черту — слиток +1; через край — минус 2 с; лить мимо формы — брызги, минус 2 с;
   недолив — слиток не считается. Лента всё быстрее. */
(function(root){'use strict';
if(!root.MG)return;
const SX=180,MW=84,MY=330,MH=90,LINE=.78;
const OK=[['«Слиток как с картинки!»','“A picture-perfect ingot!”'],['«Норильск гордится»','“Norilsk is proud”'],['«Ровненько. Как северное сияние»','“Neat. Like the northern lights”']];
let cur=null;
if(typeof window!=='undefined')['pointerup','pointercancel'].forEach(t=>window.addEventListener(t,()=>{if(cur&&cur.held())cur.up();}));
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  function under(){return s.m.find(m=>!m.done&&Math.abs(m.x-SX)<MW/2-4)||null;}
  function judge(m){if(m.done||m.lv<=0)return;m.done=1;const d=m.lv-LINE;
    if(Math.abs(d)<=s.tol){m.ok=1;sh.add(1);sh.snd('coin');s.msg={t:.8,a:Math.abs(d)<s.tol*.35?L('Идеально!','Perfect!'):L('В черту! +1','On the line! +1'),c:'#0a7a3a'};if(!S.demo&&Math.random()<.35)sh.say(T(pick(OK)));}
    else if(d<0){sh.snd('no');s.msg={t:.8,a:L('Недолив — не слиток','Underfilled — not an ingot'),c:'#c86b3c'};}
    else{sh.pen(2);sh.snd('no');s.msg={t:.9,a:L('Через край!','Overflow!')+(S.warm||S.demo?'':L(' −2 с',' −2 s')),c:'#c62828'};if(!S.demo)sh.say(L('«Горячо! Отпускайте у черты»','“Hot! Let go at the line”'));}}
  function stop(){if(!s.hold)return;s.hold=false;const m=s.cur;if(m)judge(m);s.cur=null;}
  return {
    reset(demo){s={m:[],v:42,hold:false,cur:null,msg:null,sp:0,tol:.07,fg:{down:0}};for(let i=0;i<3;i++)s.m.push({x:300+i*150,lv:0,done:0,ok:0});},
    step(dt){if(s.msg){s.msg.t-=dt;if(s.msg.t<=0)s.msg=null;}s.v=42+Math.min(36,S.t*.9);s.tol=Math.max(.045,.07-S.t*.0006);
      for(const m of s.m){m.x-=s.v*dt;if(!m.done&&m.x<SX-MW/2-2){if(s.cur===m){s.hold=false;s.cur=null;}judge(m);m.done=1;}}
      s.m=s.m.filter(m=>m.x>-60);const last=s.m[s.m.length-1];if(!last||last.x<260)s.m.push({x:(last?last.x:260)+150,lv:0,done:0,ok:0});
      if(s.hold){const m=under();if(!m||(s.cur&&m!==s.cur)){s.hold=false;s.cur=null;sh.pen(2);sh.snd('no');s.msg={t:.9,a:L('Брызги! Мимо формы','Splash! Missed the mould')+(S.warm||S.demo?'':L(' −2 с',' −2 s')),c:'#c62828'};}
        else{s.cur=m;m.lv+=dt*s.v/40;if(m.lv>=1.04){s.hold=false;s.cur=null;judge(m);}}}
      if(S.demo){const m=under();if(!s.hold&&m&&!m.lv&&m.x<SX+16)s.hold=true;if(s.hold&&s.cur&&s.cur.lv>=LINE-.01)stop();s.fg.down=s.hold?1:0;}},
    draw(c){c.fillStyle='#2a1f1c';c.fillRect(0,0,360,520);const g=c.createRadialGradient(180,120,10,180,120,260);g.addColorStop(0,'rgba(255,140,40,.35)');g.addColorStop(1,'rgba(255,140,40,0)');c.fillStyle=g;c.fillRect(0,0,360,520);
      c.fillStyle='#fff';c.font='bold 15px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('НОРИЛЬСК · ПЛАВИЛЬНЫЙ ЦЕХ','NORILSK · SMELTER'),180,16);
      // ковш
      c.save();c.translate(SX+46,92);c.rotate(s.hold?-.55:-.12);c.fillStyle='#5a5f66';sh.rr(c,-46,-34,92,68,12);c.fill();c.fillStyle='#ff9a2e';c.fillRect(-40,-30,80,12);c.beginPath();c.moveTo(-46,-34);c.lineTo(-62,-40);c.lineTo(-46,-18);c.fillStyle='#5a5f66';c.fill();c.restore();
      c.strokeStyle='#8a9099';c.lineWidth=4;c.beginPath();c.moveTo(SX+46,30);c.lineTo(SX+46,58);c.stroke();
      if(s.hold){const m=s.cur||under(),y2=m?MY+MH-MH*Math.min(1,m.lv):MY+MH;c.fillStyle='#ffb347';c.fillRect(SX-5,128,10,y2-128);}
      // лента и формы
      c.fillStyle='#4a4038';c.fillRect(0,MY+MH,360,24);c.fillStyle='#5d5248';for(let x=-(S.t*s.v)%30;x<360;x+=30)c.fillRect(x,MY+MH+4,14,4);
      for(const m of s.m){const x=m.x-MW/2;c.fillStyle='#3a3f46';c.fillRect(x-6,MY-6,MW+12,MH+6);c.fillStyle='#22262b';c.fillRect(x,MY,MW,MH);
        const h=MH*Math.min(1,m.lv);if(h>0){c.fillStyle=m.done?(m.ok?'#c0c6cf':'#8a6a5a'):'#ff8c1a';c.fillRect(x,MY+MH-h,MW,h);}
        const ly=MY+MH-MH*LINE;c.strokeStyle='#ffe14d';c.lineWidth=3;c.setLineDash([7,5]);c.beginPath();c.moveTo(x-8,ly);c.lineTo(x+MW+8,ly);c.stroke();c.setLineDash([]);
        if(m.done&&m.ok){c.fillStyle='#0a7a3a';c.font='bold 22px sans-serif';c.fillText('✓',m.x,MY-22);}}
      c.fillStyle='rgba(255,225,77,.25)';c.fillRect(SX-MW/2+4,MY-30,MW-8,8);
      if(s.msg){c.globalAlpha=Math.min(1,s.msg.t*2);c.fillStyle='#fff';sh.rr(c,30,206,300,42,12);c.fill();c.fillStyle=s.msg.c;c.font='bold 18px sans-serif';c.fillText(s.msg.a,180,227);c.globalAlpha=1;}
      const on=s.hold;c.fillStyle=on?'#ff8c1a':'#fff';sh.rr(c,20,452,320,56,28);c.fill();c.fillStyle='#1d2733';c.font='bold 18px sans-serif';
      c.fillText(on?L('Льётся… отпустите у черты!','Pouring… let go at the line!'):L('Держите — польётся металл','Hold — the metal will pour'),180,480);},
    down(){if(!s)return;const m=under();if(!m||m.done){sh.snd('no');s.msg={t:.6,a:L('Ждите форму под ковшом','Wait for a mould under the ladle'),c:'#c86b3c'};return;}s.hold=true;cur=this;},
    up(){if(s&&!S.demo)stop();},held(){return !!(s&&s.hold&&!S.demo&&S.st==='play');},
    key(k,up){if(k!==' '&&k!=='ArrowDown')return;if(up)this.up();else if(!s.hold)this.down();},
    peek(){return s;},ai(){const m=under();if(!s.hold&&m&&!m.lv&&!m.done&&m.x<SX+20)this.down();else if(s.hold&&s.cur&&s.cur.lv>=LINE-.012)this.up();},
    finger(){return s?{x:180,y:480,down:s.fg.down>0}:null;}};}
MG.game('plavka',{hero:{n:['Мастер плавки Степан','Smelting master Stepan'],a:'🔥',c:'#c8641e',l:['','']},
  how:['Форма под ковшом — <b>держите палец</b>, льётся металл. <b>Отпустите у жёлтой черты</b>. Через край или мимо формы — минус 2 с.','Mould under the ladle — <b>hold</b>, the metal pours. <b>Let go at the yellow line</b>. Overflow or missing the mould costs 2 s.'],
  go:['«Печь горячая, лента пошла. Льём ровно до черты!»','“The furnace is hot, the belt is moving. Pour right to the line!”'],
  hand:'hold',dur:40,demoT:8,make,btns:[[(typeof L==='function'?L('✋ Лить (пробел)','✋ Pour (space)'):'✋ Лить'),' ']]});
})(typeof window!=='undefined'?window:globalThis);
