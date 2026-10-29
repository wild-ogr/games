'use strict';
(function(){var M=window.ZB2M;if(!M||!M.on('cards20')||M.parts.cards)return;M.parts.cards=1;
var esc=M.esc;
function maxC(){return Math.min(ZB.chapCount(),25);}
function passed(c){var ch=ZB.chap(c);return(+S.lv||0)>ch.to;}
function nPassed(){var n=0;for(var c=0;c<maxC();c++)if(passed(c))n++;return n;}
function artSvg(c,ratio){return ZB.place(c,ratio||'xMidYMid slice');}
function img(svg,w,h){return new Promise(function(ok){var im=new Image();im.onload=function(){ok(im);};im.onerror=function(){ok(null);};
im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg.replace('<svg','<svg width="'+w+'" height="'+h+'"'));setTimeout(function(){ok(null);},2000);});}
var old=window.drawChapCard;
function drawPc(c){var ch=ZB.chap(c);if(!ch.place||typeof old!=='function')return old(c);
return artSvg(c).then(function(svg){if(!svg)return old(c);return img(svg,920,690).then(function(im){if(!im)return old(c);
var W=1080,H=1080,cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=cv.getContext('2d'),F='"Trebuchet MS","Segoe UI",Roboto,Arial,sans-serif';
x.fillStyle='#fbf7ec';x.fillRect(0,0,W,H);
x.fillStyle='#fff';x.save();x.shadowColor='rgba(39,50,74,.18)';x.shadowBlur=26;x.shadowOffsetY=8;rrect(x,40,40,W-80,H-80,24);x.fill();x.restore();
x.textAlign='center';x.fillStyle='#e8661b';x.font='800 50px '+F;x.fillText('Привет с экскурсии!',W/2,118);
x.save();rrect(x,80,150,920,690,20);x.clip();x.drawImage(im,80,150,920,690);x.restore();
x.strokeStyle='#fff';x.lineWidth=10;rrect(x,80,150,920,690,20);x.stroke();
x.save();x.translate(880,250);x.rotate(.2);x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(0,0,92,64,0,0,Math.PI*2);x.fill();
x.strokeStyle='rgba(208,52,44,.9)';x.lineWidth=7;x.stroke();
x.fillStyle='rgba(208,52,44,.95)';x.font='900 32px '+F;x.fillText('ГЛАВА '+ch.n,0,-4);x.font='800 24px '+F;x.fillText('пройдена',0,26);x.restore();
var nm='«'+ch.name+'»',fs=72;x.font='900 '+fs+'px '+F;while(x.measureText(nm).width>W-420&&fs>40){fs-=4;x.font='900 '+fs+'px '+F;}
x.textAlign='left';x.fillStyle='#1d4fa3';x.fillText(nm,330,925);
x.fillStyle='#5d6781';x.font='600 34px '+F;x.fillText('Экскурсия с бабой Зиной · уровни '+(ch.from+1)+'–'+(ch.to+1),330,978);
x.fillStyle='#e8661b';x.font='800 30px '+F;x.fillText('Баба Зина: слова из букв',330,1020);
var z=typeof zinaSVG==='function'?zinaSVG('happy'):'';
return(z?img(z,230,230):Promise.resolve(null)).then(function(zi){if(zi)x.drawImage(zi,84,800,220,220);return cv;});});});}
window.drawChapCard=function(c){return Promise.resolve().then(function(){return drawPc(c);}).catch(function(){return old(c);});};
function pcHtml(c){var ch=ZB.chap(c),ok=passed(c);
return'<div role="button" tabindex="0" class="zm-pc'+(ok?'':' no')+'" data-c="'+c+'"><span class="n">'+ch.n+'</span><div class="a" style="background:'+esc(ch.color)+'">'+
(ok?'':'<span style="position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:40px">'+esc(ch.e)+'</span>')+'</div>'+
'<b>'+(ok?esc(ch.name):'Глава '+ch.n+' — впереди')+'</b></div>';}
function render(el){M.css();var n=maxC(),h='<div class="zm-alb"><div class="zm-hd"><button class="btn ghost small" data-zm="back">‹ Путь</button><h2>📮 Открытки с экскурсий</h2></div>'+
'<p style="margin:0 12px 8px;opacity:.75;font-size:14px">Прошёл главу — получил открытку с видом. Нажми — отправь родным: пусть завидуют. Собрано '+nPassed()+' из '+n+'.</p><div class="zm-grid">';
for(var c=0;c<n;c++)h+=pcHtml(c);el.innerHTML=h+'</div></div>';
el.querySelector('[data-zm="back"]').onclick=function(){M.tap();try{ZB.go('path');}catch(e){ZB.go('home');}};
[].forEach.call(el.querySelectorAll('.zm-pc'),function(b){var c=+b.getAttribute('data-c');if(!passed(c))return;
artSvg(c).then(function(s){var a=b.querySelector('.a');if(s&&a&&a.isConnected)a.innerHTML=s;});
b.onkeydown=function(e){if(e.key==='Enter')b.click();};
b.onclick=function(){M.ev('zcard',{a:'share',c:c+1});try{shareChap(c,function(){ZB.go('zcards');});}catch(e){}};});}
ZB.screen('zcards',{title:'Открытки',render:render});
ZB.add(ZB.pathSlots,{id:'zm-cards',order:80,zone:'bottom',render:function(){var k=nPassed();if(!k)return'';M.css();
return'<button type="button" class="zm-path"><b>📮 Открытки с экскурсий · '+k+' из '+maxC()+'</b><small>виды всех пройденных глав — отправить родным</small></button>';},
mount:function(el){var b=el.querySelector('.zm-path');if(b)b.onclick=function(){M.tap();M.ev('zcard',{a:'open'});ZB.go('zcards');};}});
ZB.safe('zm-cards:ref',function(){var on=document.querySelector('.screen.on');if(on&&on.id==='zb-path')ZB.go('path');});
})();
