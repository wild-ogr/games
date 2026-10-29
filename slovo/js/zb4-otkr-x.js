'use strict';
(function(){
var Z=window.Z4,X=Z&&Z.OTKR;if(!X||window.Z4OX)return;
var esc=X.esc;
function cv(n,d){try{var v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||d;}catch(e){return d;}}
function qp(k){try{return new URLSearchParams(location.search).get(k)||'';}catch(e){return'';}}
function br(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&!!window.vkBridge&&typeof vkSend==='function';}
function snd(){try{SND.tap();}catch(e){}}
function T(k,c){return Z.txt(k,c)||'';}
function plain(s){return String(s||'').replace(/\{([^{}>]*)>([^{}]*)\}/g,'$2');}
function fonts(){var f=document.fonts;if(!f||!f.load)return Promise.resolve();
return Promise.race([Promise.all(['44px ZLobster','40px ZCaveat','700 40px ZRubik'].map(function(x){return f.load(x,'АБВ').catch(function(){});})),
new Promise(function(r){setTimeout(r,1500);})]);}
function img(svg,w,h){return new Promise(function(ok){if(!svg)return ok(null);
if(svg.indexOf('xmlns=')<0)svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
svg=svg.replace(/<svg([^>]*?)\s(width|height)="[^"]*"/g,'<svg$1').replace(/<svg([^>]*?)\s(width|height)="[^"]*"/g,'<svg$1').replace('<svg','<svg width="'+w+'" height="'+h+'"');
var i=new Image(),done=0,t=setTimeout(function(){if(!done){done=1;ok(null);}},4000);
i.onload=function(){if(!done){done=1;clearTimeout(t);ok(i);}};i.onerror=function(){if(!done){done=1;clearTimeout(t);ok(null);}};
i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function wrap(c,t,maxW){var w=String(t).split(/\s+/),L=[],s='';
w.forEach(function(x){var tt=s?s+' '+x:x;if(c.measureText(tt).width>maxW&&s){L.push(s);s=x;}else s=tt;});if(s)L.push(s);return L;}
function lines(c,t,x,y,maxW,lh,maxL){var L=wrap(c,t,maxW).slice(0,maxL||4);L.forEach(function(l,i){c.fillText(l,x,y+i*lh);});return L.length;}
function marked(c,t,cx,y,maxW,lh,K){c.textAlign='left';var ch=String(t).replace(/\{([^{}>]*)>([^{}]*)\}/g,function(m,a,b){return'\u0001'+a.replace(/ /g,'\u00a0')+'\u0002'+b.replace(/ /g,'\u00a0')+'\u0003';}).split(/\s+/).filter(Boolean);
var sp=c.measureText(' ').width,L=[[]],lw=[0];
ch.forEach(function(x){var P=[],re=/\u0001([^\u0002]*)\u0002([^\u0003]*)\u0003|([^\u0001]+)/g,m,cw=0;
while((m=re.exec(x))){var o=m[3]!=null?{w:m[3]}:{w:m[1],f:m[2]};o.cw=c.measureText(o.w).width;cw+=o.cw;P.push(o);}
var i=L.length-1,add=(L[i].length?sp:0)+cw;if(lw[i]+add>maxW&&L[i].length){L.push([{P:P,cw:cw}]);lw.push(cw);}else{L[i].push({P:P,cw:cw});lw[i]+=add;}});
L.forEach(function(l,i){var x=cx-lw[i]/2,yy=y+i*lh;l.forEach(function(wd){wd.P.forEach(function(o){c.fillStyle=K.ink;c.fillText(o.w,x,yy);
if(o.f!=null){c.save();c.strokeStyle=K.red;c.lineWidth=4;c.beginPath();c.moveTo(x-3,yy-14);c.lineTo(x+o.cw+3,yy-20);c.stroke();
c.fillStyle=K.red;c.font='700 36px '+K.hand;c.textAlign='center';c.fillText(o.f||'∨',x+o.cw/2,yy-46);c.restore();}
x+=o.cw;});x+=sp;});});
c.textAlign='center';return L.length;}
function K0(){return{bg:cv('--z3-bg','#f6efe3'),pap:cv('--z3-paper','#fbf7ec'),ink:cv('--z3-ink','#27324a'),ink2:cv('--z3-ink2','#5d6781'),
red:cv('--z3-red','#d0342c'),gold:cv('--z3-gold','#f5b72d'),ok:cv('--z3-ok','#237a3b'),sky:cv('--z3-sky','#cfe9f4'),line:cv('--z3-line','#e6dcc8'),
blue:cv('--z3-blue','#2563c9'),head:cv('--z3-font-head','sans-serif'),font:cv('--z3-font','sans-serif'),paper:cv('--z3-font-paper','Georgia, serif'),hand:cv('--z3-font-hand','cursive')};}
var W=720,H=1280;
function zinaNote(c,K,zi,note,y0){if(zi)c.drawImage(zi,4,H-300,280,280);if(!note)return;
c.font='700 38px '+K.hand;var L=wrap(c,note,W-340).slice(0,4),bh=L.length*46+40,y=Math.min(y0||H-110-bh,H-110-bh);
c.save();c.fillStyle='#fff';c.globalAlpha=.92;rr(c,280,y,W-310,bh,24);c.fill();c.restore();c.lineWidth=3;c.strokeStyle=K.red;rr(c,280,y,W-310,bh,24);c.stroke();
c.fillStyle=K.red;c.textAlign='left';c.textBaseline='top';L.forEach(function(l,i){c.fillText(l,302,y+20+i*46);});c.textBaseline='alphabetic';}
function foot(c,K){c.textAlign='right';c.fillStyle=K.ink2;c.font='600 24px '+K.font;c.fillText('Баба Зина · Дом №7 на Садовой',W-30,H-34);}
function lined(c,K){c.fillStyle=K.pap;c.fillRect(0,0,W,H);c.strokeStyle='rgba(37,99,201,.16)';c.lineWidth=2;
for(var y=180;y<H;y+=48){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}c.strokeStyle='rgba(208,52,44,.45)';c.beginPath();c.moveTo(96,0);c.lineTo(96,H);c.stroke();}
var DRAW={
utro:function(c,K,o,zi){var a=String(o.s||'').split('|');var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,K.sky);g.addColorStop(.55,K.pap);g.addColorStop(1,K.bg);
c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle=K.gold;c.beginPath();c.arc(W-130,150,80,0,7);c.fill();c.strokeStyle=K.gold;c.lineWidth=8;
for(var i=0;i<12;i++){var r=i*Math.PI/6;c.beginPath();c.moveTo(W-130+Math.cos(r)*100,150+Math.sin(r)*100);c.lineTo(W-130+Math.cos(r)*130,150+Math.sin(r)*130);c.stroke();}
c.textAlign='center';c.fillStyle=K.red;c.font='76px '+K.paper;c.fillText(o.head||'С добрым утром!',W/2,330);
c.font='600 44px '+K.font;var n=marked(c,a[0]||'',W/2,500,W-100,110,K);zinaNote(c,K,zi,a[1]||'',500+n*110);foot(c,K);},
hol:function(c,K,o,zi){var h=o.h||{};var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,K.pap);g.addColorStop(1,K.bg);c.fillStyle=g;c.fillRect(0,0,W,H);
c.lineWidth=8;c.strokeStyle=K.gold;rr(c,28,28,W-56,H-56,34);c.stroke();c.textAlign='center';c.font='90px '+K.font;c.fillText('🎉',W/2,200);
c.fillStyle=K.red;c.font='68px '+K.paper;var n=lines(c,h.t||'С праздником!',W/2,330,W-120,84,3);
c.fillStyle=K.ink2;c.font='600 34px '+K.font;c.fillText('от бабы Зины и кота Ятя',W/2,330+n*84+20);zinaNote(c,K,zi,h.m||'',560);foot(c,K);},
perl:function(c,K,o,zi){var a=String(o.p||'').split('|');lined(c,K);c.textAlign='left';c.fillStyle=K.ink;c.font='700 46px '+K.head;c.fillText('Перлы моих учеников',120,110);
c.fillStyle=K.blue;c.font='44px '+K.hand;var n=lines(c,'«'+(a[0]||'')+'»',120,260,W-170,48*2,6);zinaNote(c,K,zi,a[1]||'',290+n*96);foot(c,K);},
dnev:function(c,K,o,zi){lined(c,K);var R=o.rows||[];c.textAlign='left';c.fillStyle=K.ink;c.font='700 50px '+K.head;c.fillText('ДНЕВНИК',120,110);
c.font='600 28px '+K.font;c.fillStyle=K.ink2;c.fillText(o.wk||'',120,160);
R.forEach(function(r,i){var y=276+i*96;c.fillStyle=K.ink;c.font='600 36px '+K.font;c.fillText(r[0],120,y);c.fillStyle=K.ink2;c.font='26px '+K.font;c.fillText(r[2]||'',120,y+34);
c.fillStyle=K.red;c.font='700 64px '+K.hand;c.textAlign='center';c.fillText(String(r[1]),W-90,y+14);c.textAlign='left';});
var y2=276+R.length*96+10;c.fillStyle=K.red;c.font='700 38px '+K.hand;var n=lines(c,o.note||'',120,y2,W-170,46,3);
c.fillStyle=K.ink2;c.font='600 30px '+K.font;c.fillText('Подпись родителей:',300,H-150);c.fillStyle=K.blue;c.font='40px '+K.hand;c.fillText(o.sign||'',300,H-100);
if(zi)c.drawImage(zi,4,H-300,280,280);foot(c,K);void n;},
den:function(c,K,o,zi){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,K.sky);g.addColorStop(1,K.pap);c.fillStyle=g;c.fillRect(0,0,W,H);
c.textAlign='center';c.fillStyle=K.ink;c.font='70px '+K.paper;c.fillText('Мой день у бабы Зины',W/2,170);
[['уровней',o.n],['слов',o.w]].forEach(function(x,i){var cx=i?W*0.72:W*0.28;c.save();c.fillStyle='#fff';rr(c,cx-150,250,300,240,30);c.fill();c.restore();
c.fillStyle=K.red;c.font='900 110px '+K.head;c.fillText(String(x[1]),cx,400);c.fillStyle=K.ink2;c.font='600 36px '+K.font;c.fillText(x[0],cx,460);});
zinaNote(c,K,zi,o.joke||'',600);foot(c,K);},
txt:function(c,K,o,zi){lined(c,K);c.textAlign='left';c.fillStyle=K.ink;c.font='700 46px '+K.head;lines(c,o.head||'',120,110,W-170,52,2);
c.fillStyle=K.blue;c.font='42px '+K.hand;var n=lines(c,o.body||'',120,260,W-170,96,8);zinaNote(c,K,zi,o.note||'',290+n*96);foot(c,K);},
tab:function(c,K,o,zi){c.fillStyle=K.pap;c.fillRect(0,0,W,H);var s=o.seq||[],per=5,sz=96,gap=18,rows=Math.ceil(s.length/per)||1;
c.textAlign='center';c.fillStyle=K.ink;c.font='700 54px '+K.head;c.fillText('Табель уровня'+(o.lv?' '+o.lv:''),W/2,150);
c.fillStyle=K.ink2;c.font='600 28px '+K.font;c.fillText('по порядку: сам · с подсказкой · ⭐ бонусное',W/2,200);
var gw=Math.min(per,s.length)*(sz+gap)-gap,x0=(W-gw)/2,y0=250;
s.slice(0,30).forEach(function(x,i){var cx=x0+(i%per)*(sz+gap),cy=y0+Math.floor(i/per)*(sz+gap);
c.fillStyle=x==='g'?'#5aa845':x==='y'?'#e3b52b':'#fff3c4';rr(c,cx,cy,sz,sz,14);c.fill();
if(x==='s'){c.fillStyle=K.gold;c.font='64px '+K.font;c.fillText('★',cx+sz/2,cy+sz/2+22);}});
zinaNote(c,K,zi,o.cap||'',y0+Math.min(rows,6)*(sz+gap)+30);foot(c,K);}};
function draw(k,o){return fonts().then(function(){return img(ZB.safe('z4o-zina',function(){return zinaSVG(k==='dnev'?'stern':'happy');})||'',280,280);}).then(function(zi){
var c0=document.createElement('canvas');c0.width=W;c0.height=H;var c=c0.getContext('2d'),K=K0();c.textBaseline='alphabetic';DRAW[k](c,K,o,zi);return c0;});}
function prep(k,o){o=o||{};var r={k:k,o:o,title:'Открытка',msg:''};
if(k==='utro'){o.s=X.pick('z4o.utro');var a=o.s.split('|');r.title='Открытка «С добрым утром»';r.msg='С добрым утром! '+plain(a[0])+(a[1]?'\n✎ Баба Зина: '+a[1]:'');}
else if(k==='hol'){o.h=o.h||(o.t?o:X.hol())||{t:'С праздником!',m:''};r.o={h:o.h};r.title='Праздничная открытка';r.msg=o.h.t+(o.h.m?'\n✎ Баба Зина: '+o.h.m:'');}
else if(k==='perl'){o.p=o.p||X.perl();var b=String(o.p).split('|');r.title='Перл дня';r.msg='Перл дня у бабы Зины: «'+b[0]+'»'+(b[1]?'\n✎ На полях: '+b[1]:'');}
else if(k==='dnev'){var z=X.zz(),rw=grades(z),sum=0,nn=0;rw.forEach(function(x){if(typeof x[1]==='number'){sum+=x[1];nn++;}});var av=nn?sum/nn:3;
o.rows=rw;o.note=T(av>=4.5?'z4o.dn5':av>=3.8?'z4o.dn4':'z4o.dn3');o.sign=T('z4o.dnp');var m=String(z.k||X.tk());o.wk='неделя с '+m.slice(6)+'.'+m.slice(4,6);
r.title='Дневник за неделю';r.msg='Мой дневник за неделю у бабы Зины:\n'+rw.map(function(x){return x[0]+' — '+x[1];}).join('\n')+(o.note?'\n✎ '+o.note:'');}
else if(k==='den'){var z2=X.zz();o.n=+z2.tn||0;o.w=+z2.tw||0;o.joke=T('z4o.den',{n:o.n});r.title='История дня';r.msg='Сегодня у бабы Зины: уровней '+o.n+', слов '+o.w+'.'+(o.joke?'\n'+o.joke:'');}
else if(k==='txt'){r.title=o.title||'Открытка';r.msg=o.msg||((o.head?o.head+'\n':'')+(o.body||'')+(o.note?'\n✎ '+o.note:''));}
else if(k==='tab'){o.cap=T('z4o.tab');var s=o.seq||[],rows=[];for(var i=0;i<s.length&&i<30;i+=5)rows.push(X.grid(s.slice(i,i+5),5));
r.title='Табель уровня';r.msg='Табель уровня '+(o.lv||'')+' у бабы Зины:\n'+rows.join('\n')+(o.cap?'\n'+o.cap:'');}
return r;}
function grades(z){var n=+z.n||0,w=+z.w||0,b=+z.b||0,c=+z.c||0,d=0;for(var i=0;i<7;i++)if(z.d&(1<<i))d++;
function g(v,a5,a4){return v>=a5?5:v>=a4?4:3;}
return[['Русский язык',w?g(w,150,60):'—','слов найдено: '+w],
['Чистописание',n?g(c/n,.7,.4):'—','уровней без подсказок: '+c+' из '+n],
['Внеклассное чтение',b?g(b,20,5):'—','бонусных слов: '+b],
['Посещаемость',g(d,6,4),'дней за партой: '+d+' из 7'],
['Физкультура',n?g(n,35,15):'—','уровней пройдено: '+n],
['Поведение',5,'кот Ять свидетель']];}
var css0=0;function css(){if(css0)return;css0=1;var s=document.createElement('style');s.textContent=
'.z4o-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;background:rgba(40,28,20,.55);display:flex;align-items:center;justify-content:center;padding:12px}'+
'.z4o-w{background:var(--z3-paper);color:var(--z3-ink);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);width:100%;max-width:420px;max-height:100%;overflow-y:auto;padding:14px;font-family:var(--z3-font);text-align:center;box-sizing:border-box}'+
'.z4o-w h3{margin:0 0 8px;font:900 20px/1.2 var(--z3-font-head)}.z4o-im{display:block;margin:0 auto 10px;width:auto;max-width:100%;height:46vh;max-height:520px;border-radius:12px;background:var(--z3-line)}'+
'.z4o-w p{margin:0 0 10px;font-size:15px;line-height:1.35}.z4o-w .btn{display:block;width:100%;min-height:48px;margin:8px 0 0}';document.head.appendChild(s);}
function close(ov){try{ov.remove();}catch(e){}}
function open(k,o){if(!DRAW[k])return;css();var r=prep(k,o),ov=document.createElement('div');ov.className='z4o-ov';
ov.innerHTML='<div class="z4o-w" role="dialog" aria-label="'+esc(r.title)+'"><h3>'+esc(r.title)+'</h3><div class="z4o-im" style="display:flex;align-items:center;justify-content:center">рисую…</div></div>';
document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)close(ov);});
var say=T('z4o.say');
draw(k,r.o).then(function(c0){if(!ov.isConnected)return;var vk=br()&&X.isVK(),ok=br()&&X.isOK(),jpg='',png='';try{jpg=c0.toDataURL('image/jpeg',.88);}catch(e){}
var b=vk?'<button type="button" class="btn green z4o-go" data-e="vks">📸 В историю ВКонтакте</button>'+(k==='den'?'':'<button type="button" class="btn ghost z4o-go" data-e="vkw">📨 Отправить ВКонтакте</button>'):
ok?'<button type="button" class="btn green z4o-go" data-e="okinv">📮 Отправить друзьям</button>':
'<button type="button" class="btn green z4o-go" data-e="save">💾 Сохранить картинку</button><button type="button" class="btn ghost z4o-go" data-e="copy">📋 Скопировать текст</button>';
ov.firstChild.innerHTML='<h3>'+esc(r.title)+'</h3><img class="z4o-im" alt="'+esc(r.title)+'" src="'+jpg+'">'+(say?'<p>'+esc(say)+'</p>':'')+b+
'<button type="button" class="btn ghost small z4o-x">Закрыть</button>';
ov.querySelector('.z4o-x').onclick=function(){snd();close(ov);};
[].forEach.call(ov.querySelectorAll('.z4o-go'),function(x){x.onclick=function(){snd();var e=x.getAttribute('data-e'),a=qp('vk_app_id');
var fin=function(h){X.ev('send',{k:k,e:h});};
if(e==='vks'){var p={background_type:'image',blob:jpg};if(a)p.attachment={text:'go_to',type:'url',url:'https://vk.com/app'+a};
vkSend('VKWebAppShowStoryBox',p,60000).then(function(rr0){fin(rr0&&rr0.result===false?'no':'vks');},function(er){fin(SHR.isCancel(er)?'cancel':'no');if(!SHR.isCancel(er))SHR.post(r.msg,{k:'z4o'});});return;}
if(e==='vkw'||e==='copy'){SHR.post(r.msg,{k:'z4o',cb:function(h){fin(h==='vk'?'vkw':h);}});return;}
if(e==='okinv'){vkSend('VKWebAppShowInviteBox',{message:r.msg.slice(0,250)},60000).then(function(){fin('okinv');},function(er){fin(SHR.isCancel(er)?'cancel':'no');
if(!SHR.isCancel(er))SHR.fallback(r.msg+(SHR.link('')?'\n'+SHR.link(''):''),'Окно не открылось — текст скопирован, вставь его другу');});return;}
if(e==='save'){try{png=png||c0.toDataURL('image/png');var l=document.createElement('a');l.href=png;l.download='zina-'+k+'.png';document.body.appendChild(l);l.click();l.remove();fin('save');
try{toast('Картинка сохранена — покажи соседям',3000);}catch(e2){}}catch(e3){fin('no');}}};});
},function(){if(ov.isConnected){ov.firstChild.innerHTML='<h3>'+esc(r.title)+'</h3><p>Открытка не нарисовалась. Ручка красная кончилась — мой ищет запасную.</p><button type="button" class="btn ghost z4o-x">Закрыть</button>';
ov.querySelector('.z4o-x').onclick=function(){close(ov);};}X.ev('send',{k:k,e:'no'});});}
window.Z4OX={open:open,prep:prep,draw:draw,grades:grades};
})();
