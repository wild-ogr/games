/* b2-mg-zimnik.js — MG2: «🚛 Фура по зимнику» — игра края Якутия (yak; формат KRAI). Договор — шапка js/b2-mg-core.js; опись — js/b2-mg2.js, id 'zimnik'.
   40 с: фура идёт по зимнику сама, всё быстрее. ◀ ▶ (или нажать слева/справа) — сменить полосу. Объезжайте сугробы, полыньи, встречные фуры и оленя
   (олень переходит дорогу!). Удар — минус 3 с и фура тормозит. Термос с чаем — +2 км. Рекорд — километры. */
(function(root){'use strict';
if(!root.MG)return;
const LX=[100,180,260],TY=410;
const KIND={drift:[46,26,'#fff'],hole:[50,34,'#1d4f7a'],truck:[40,90,'#b03a2e'],deer:[34,30,'#8a5a2b'],tea:[26,26,'#e0a83a']};
const HIT={drift:[['«Сугроб! Лопата в кабине»','“Snowdrift! The shovel’s in the cab”']],hole:[['«Полынья! Хорошо, что колесо, а не вся фура»','“Ice hole! Lucky it was a wheel, not the whole truck”']],
  truck:[['«Встречный! Помахали друг другу бампером»','“Oncoming truck! Waved at each other with bumpers”']],deer:[['«Олень! Он тут главный, уступаем»','“Reindeer! He’s the boss here, give way”']]};
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
  function spawn(){const r=Math.random(),k=r<.34?'drift':r<.56?'hole':r<.76?'truck':r<.88?'deer':'tea',ln=Math.floor(Math.random()*3);
    const used=s.o.filter(o=>o.y<-20).map(o=>o.ln);if(used.length>=2)return;
    s.o.push({k,ln,x:LX[ln],y:-60,vx:k==='deer'?(ln===2?-1:ln===0?1:pick([-1,1]))*R(30,45):0,hit:0});}
  function lane(d){const n=Math.max(0,Math.min(2,s.ln+d));if(n!==s.ln){s.ln=n;sh.snd('tap');}}
  function free(ln,dist){return !s.o.some(o=>!o.hit&&o.k!=='tea'&&Math.abs(o.x-LX[ln])<44&&o.y>TY-dist&&o.y<TY+50);}
  return {
    reset(demo){s={o:[],ln:1,x:180,v:230,km:0,sp:.4,slow:0,inv:0,msg:null,fg:{x:180,down:0},sc:0};},
    step(dt){if(s.msg){s.msg.t-=dt;if(s.msg.t<=0)s.msg=null;}s.inv=Math.max(0,s.inv-dt);s.fg.down=Math.max(0,s.fg.down-dt);
      const vt=230+Math.min(200,S.t*5.5);s.slow=Math.max(0,s.slow-dt);s.v=s.slow>0?vt*.35:s.v+(vt-s.v)*Math.min(1,dt*1.5);
      s.x+=(LX[s.ln]-s.x)*Math.min(1,dt*12);s.sc+=s.v*dt;
      s.km+=s.v*dt/170;while(s.km>=1){s.km-=1;sh.add(1);}
      s.sp-=dt;if(s.sp<=0){s.sp=R(.5,.85)*Math.max(.55,1-S.t/60);spawn();}
      for(const o of s.o){o.y+=(s.v+(o.k==='truck'?120:0))*dt;if(o.vx){o.x+=o.vx*dt;if(o.x<70||o.x>290)o.vx*=-1;o.ln=o.x<140?0:o.x<220?1:2;}
        const k=KIND[o.k];if(!o.hit&&Math.abs(o.x-s.x)<(k[0]/2+16)&&Math.abs(o.y-TY)<(k[1]/2+40)){o.hit=1;
          if(o.k==='tea'){sh.add(2);sh.snd('coin');sh.fx(o.x,o.y-30,L('Чай с поста! +2 км','Tea from the post! +2 km'),'#0a7a3a');}
          else if(!s.inv){s.inv=1.2;s.slow=1;sh.pen(3);sh.snd('no');s.msg={t:1,a:(o.k==='deer'?L('Олень!','Reindeer!'):L('Бум!','Bang!'))+(S.warm||S.demo?'':L(' −3 с',' −3 s')),c:'#c62828'};if(!S.demo)sh.say(T(pick(HIT[o.k])));}}}
      s.o=s.o.filter(o=>o.y<580);
      if(S.demo){this.ai();s.fg.x+=((s.ln-1)*120+180-s.fg.x)*Math.min(1,dt*6);}},
    draw(c){c.fillStyle='#eef3f8';c.fillRect(0,0,360,520);c.fillStyle='#cfe0ee';c.fillRect(56,0,248,520);
      c.fillStyle='#b8d0e4';const o2=s.sc%80;for(let y=-80+o2;y<520;y+=80){c.fillRect(138,y,4,40);c.fillRect(218,y,4,40);}
      c.fillStyle='#2e5d3a';for(let y=-120+(s.sc*.9)%120;y<520;y+=120){for(const x of [22,334]){c.beginPath();c.moveTo(x,y);c.lineTo(x-16,y+40);c.lineTo(x+16,y+40);c.fill();c.fillStyle='#fff';c.fillRect(x-8,y+8,16,4);c.fillStyle='#2e5d3a';}}
      for(const o of s.o){if(o.hit&&o.k==='tea')continue;const k=KIND[o.k],x=o.x,y=o.y;c.fillStyle=k[2];
        if(o.k==='drift'){c.beginPath();c.ellipse(x,y,k[0]/2,k[1]/2,0,0,7);c.fill();c.strokeStyle='#b8d0e4';c.lineWidth=2;c.stroke();}
        else if(o.k==='hole'){c.beginPath();c.ellipse(x,y,k[0]/2,k[1]/2,0,0,7);c.fill();c.fillStyle='#4f86b3';c.fillRect(x-12,y-3,14,3);}
        else if(o.k==='truck'){sh.rr(c,x-20,y-45,40,90,6);c.fill();c.fillStyle='#e9edf2';c.fillRect(x-17,y-42,34,56);c.fillStyle='#bfe3ff';c.fillRect(x-15,y+24,30,10);}
        else if(o.k==='deer'){c.beginPath();c.ellipse(x,y,17,10,0,0,7);c.fill();c.beginPath();c.arc(x+(o.vx>0?16:-16),y-8,7,0,7);c.fill();
          c.strokeStyle='#5a3a1a';c.lineWidth=2;const hx=x+(o.vx>0?16:-16);c.beginPath();c.moveTo(hx-4,y-14);c.lineTo(hx-9,y-26);c.moveTo(hx+4,y-14);c.lineTo(hx+9,y-26);c.stroke();}
        else{sh.rr(c,x-9,y-15,18,30,5);c.fill();c.fillStyle='#fff';c.font='bold 11px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('+2',x,y);}}
      // фура игрока
      const x=s.x;if(!(s.inv>0&&Math.floor(s.inv*10)%2)){c.fillStyle='#1d2733';for(const dy of [-24,6,30])c.fillRect(x-22,TY+dy,44,10);
        c.fillStyle='#2f6fb5';sh.rr(c,x-19,TY-48,38,26,6);c.fill();c.fillStyle='#bfe3ff';c.fillRect(x-14,TY-46,28,8);c.fillStyle='#f4f6f8';sh.rr(c,x-20,TY-20,40,68,4);c.fill();
        c.fillStyle='#4f5d72';c.font='bold 8px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('ЯКУТИЯ','YAKUTIA'),x,TY+14);}
      c.fillStyle='#1d2733';c.font='bold 15px sans-serif';c.textAlign='center';c.fillText(L('ЗИМНИК · ','ICE ROAD · ')+Math.round(s.v/4.3)+L(' км/ч',' km/h'),180,506);
      c.globalAlpha=.35;c.fillStyle='#1d2733';c.beginPath();c.moveTo(12,470);c.lineTo(40,452);c.lineTo(40,488);c.fill();c.beginPath();c.moveTo(348,470);c.lineTo(320,452);c.lineTo(320,488);c.fill();c.globalAlpha=1;
      if(s.msg){c.globalAlpha=Math.min(1,s.msg.t*2);c.fillStyle='#fff';sh.rr(c,40,200,280,42,12);c.fill();c.fillStyle=s.msg.c;c.font='bold 18px sans-serif';c.fillText(s.msg.a,180,221);c.globalAlpha=1;}},
    down(x){lane(x<180?-1:1);},
    key(k,up){if(up)return;if(k==='ArrowLeft')lane(-1);else if(k==='ArrowRight')lane(1);},
    peek(){return s;},
    ai(){const D=300;if(free(s.ln,D)){const t=s.o.find(o=>o.k==='tea'&&!o.hit&&o.y>TY-260&&o.y<TY-40);if(t&&Math.abs(t.ln-s.ln)===1&&free(t.ln,D))lane(t.ln-s.ln);return;}
      const c=[s.ln-1,s.ln+1].filter(l=>l>=0&&l<=2&&free(l,D));if(c.length){lane(c[0]-s.ln);s.fg.down=.25;}},
    finger(){return s?{x:s.fg.x,y:470,down:s.fg.down>0}:null;}};}
MG.game('zimnik',{hero:{n:['Дальнобойщик Афанасий','Trucker Afanasy'],a:'🚛',c:'#2f6fb5',l:['','']},
  how:['Фура едет сама. <b>◀ ▶ — сменить полосу</b>. Объезжайте сугробы, полыньи, встречных и оленя. Термос — +2 км.','The truck drives itself. <b>◀ ▶ — change lane</b>. Dodge snowdrifts, ice holes, oncoming trucks and the reindeer. Thermos — +2 km.'],
  go:['«Зимник открыт, пока мороз держит. Поехали!»','“The ice road is open while the frost holds. Let’s go!”'],
  hand:'tap',dur:40,demoT:8,make,btns:[['◀ '+(typeof L==='function'?L('Влево','Left'):'Влево'),'ArrowLeft'],[(typeof L==='function'?L('Вправо','Right'):'Вправо')+' ▶','ArrowRight']]});
})(typeof window!=='undefined'?window:globalThis);
