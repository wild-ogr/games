'use strict';
(function(){
var AL=window.Z3ALB;if(!AL||AL.card)return;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function snd(){try{SND.tap();}catch(e){}}
function T(k,ctx){return AL.T(k,ctx)||'';}
function qp(k){try{return new URLSearchParams(location.search).get(k)||'';}catch(e){return'';}}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function br(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&!!window.vkBridge&&typeof vkSend==='function';}
function cv(n,d){try{var v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||d;}catch(e){return d;}}
function toast2(t){try{toast(t,3000);}catch(e){}}
function name(){var n=AL.lsG('z3-nm','');if(n)return Promise.resolve(String(n).split(' ')[0].slice(0,16));
if(!br())return Promise.resolve('');
return vkSend('VKWebAppGetUserInfo',{},3000).then(function(u){var f=String(u&&u.first_name||'').slice(0,16);
if(u&&u.first_name)AL.lsS('z3-nm',(u.first_name+' '+(u.last_name||'')).trim());return f;},function(){return'';});}
function img(svg,w,h){return new Promise(function(ok){if(!svg)return ok(null);
if(svg.indexOf('xmlns=')<0)svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
svg=svg.replace(/<svg([^>]*?)\s(width|height)="[^"]*"/g,'<svg$1').replace(/<svg([^>]*?)\s(width|height)="[^"]*"/g,'<svg$1');
svg=svg.replace('<svg','<svg width="'+w+'" height="'+h+'"');
var i=new Image(),done=0,t=setTimeout(function(){if(!done){done=1;ok(null);}},4000);
i.onload=function(){if(!done){done=1;clearTimeout(t);ok(i);}};i.onerror=function(){if(!done){done=1;clearTimeout(t);ok(null);}};
i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});}
function yardSvg(){var A=window.Z3ART||{};
var f=function(){if(A.yard){var sc={};try{sc=A.scene?A.scene():{};}catch(e){}
var s=ZB.safe('z3a-card-yard',function(){return A.yard({lay:'sq',time:'day',season:sc.season||'sum'});})||'';
if(s&&A.yardCss)s=s.replace(/(<svg[^>]*>)/,'$1<style>'+A.yardCss.replace(/animation[^;}]*;?/g,'')+'</style>');return s;}
return A.album?Z3.art('album',{}):'';};
if(A.yard||!Z3.artLoad)return Promise.resolve(f());
return Z3.artLoad('yard').then(f,function(){return A.album?Z3.art('album',{}):(Z3.artLoad?Z3.artLoad('album').then(function(){return Z3.art('album',{});},function(){return'';}):'');});}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function wrap(c,t,x,y,maxW,lh,maxL,dry){var w=String(t).split(' '),L=[],s='';
w.forEach(function(x2){var tt=s?s+' '+x2:x2;if(c.measureText(tt).width>maxW&&s){L.push(s);s=x2;}else s=tt;});if(s)L.push(s);
L=L.slice(0,maxL||3);if(!dry)L.forEach(function(l,i){c.fillText(l,x,y+i*lh);});return L.length;}
function draw(rank,nm,pic){var W=720,H=1280;
return Promise.all([yardSvg().then(function(s){return img(s,W,640);}),img(ZB.safe('z3a-card-zina',function(){return zinaSVG('happy');})||'',300,300)]).then(function(a){
var c0=document.createElement('canvas');c0.width=W;c0.height=H;var c=c0.getContext('2d');
var bg=cv('--z3-bg','#fbf3e4'),pap=cv('--z3-paper','#fffaf0'),ink=cv('--z3-ink','#3a2a22'),ink2=cv('--z3-ink2','#6b5a4e'),gold=cv('--z3-gold','#e8b84a'),red=cv('--z3-red','#c8483a'),
edge=cv('--z3-a-edge','#a8714a'),fh=cv('--z3-font-head','Georgia, serif'),fb=cv('--z3-font','sans-serif'),fhd=cv('--z3-font-hand',fh);
c.fillStyle=bg;c.fillRect(0,0,W,H);
if(a[0]){c.save();rr(c,24,24,W-48,600,36);c.clip();c.drawImage(a[0],24,24,W-48,600);c.restore();}
c.lineWidth=6;c.strokeStyle=pap;rr(c,24,24,W-48,600,36);c.stroke();
var gx=48,gy=560,gw=W-96,gh=470;c.save();c.shadowColor='rgba(60,40,20,.25)';c.shadowBlur=24;c.shadowOffsetY=8;c.fillStyle=pap;rr(c,gx,gy,gw,gh,28);c.fill();c.restore();
c.lineWidth=5;c.strokeStyle=gold;rr(c,gx+14,gy+14,gw-28,gh-28,20);c.stroke();c.lineWidth=2;rr(c,gx+24,gy+24,gw-48,gh-48,14);c.stroke();
c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=red;c.font='900 52px '+fh;c.fillText('ГРАМОТА',W/2,gy+96);
c.fillStyle=ink2;c.font='600 26px '+fb;c.fillText('дом №7 на Садовой · звание',W/2,gy+140);
c.font='64px '+fb;c.fillText('🏅',W/2,gy+222);
c.fillStyle=ink;var fs=rank.length>18?46:rank.length>12?54:62;c.font='900 '+fs+'px '+fh;var n=wrap(c,'«'+rank+'»',W/2,gy+300,gw-80,fs+6,2);
c.fillStyle=ink2;c.font='600 30px '+fb;if(nm)c.fillText('вручается: '+nm,W/2,gy+300+n*(fs+6)+30);
if(a[1])c.drawImage(a[1],12,H-312,300,300);
if(pic){c.textAlign='left';c.font='30px '+fhd;var pl=wrap(c,pic,0,0,W-370,38,3,1),bh=pl*38+44;
c.save();c.fillStyle=pap;rr(c,290,H-90-bh,W-320,bh,24);c.fill();c.lineWidth=3;c.strokeStyle=edge;c.stroke();c.restore();
c.fillStyle=ink;c.textBaseline='top';wrap(c,pic,314,H-90-bh+22,W-370,38,3);c.textBaseline='alphabetic';}
c.textAlign='right';c.fillStyle=ink2;c.font='600 24px '+fb;c.fillText('Дом №7 на Садовой',W-36,H-40);
return c0;});}
var css0=0;function css(){if(css0)return;css0=1;var s=document.createElement('style');s.id='z3acCss';s.textContent=
'.z3ac-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;background:rgba(40,28,20,.55);display:flex;align-items:center;justify-content:center;padding:12px}'+
'.z3ac-w{background:var(--z3-paper);color:var(--z3-ink);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);width:100%;max-width:420px;max-height:100%;overflow-y:auto;padding:14px;font-family:var(--z3-font);text-align:center}'+
'.z3ac-w h3{margin:0 0 8px;font:900 20px/1.2 var(--z3-font-head)}.z3ac-im{display:block;margin:0 auto 10px;width:auto;max-width:100%;height:46vh;max-height:520px;border-radius:12px;background:var(--z3-line)}'+
'.z3ac-w p{margin:0 0 10px;font-size:15px;line-height:1.35}.z3ac-w .btn{display:block;width:100%;min-height:48px;margin:8px 0 0}'+
'.z3ac-w small{display:block;margin-top:8px;font-size:13.5px;color:var(--z3-ink2)}';document.head.appendChild(s);}
function close(ov){try{ov.remove();}catch(e){}}
AL.card=function(id){css();snd();var rank=AL.rname(id)||'Звание';AL.ev('card',{r:id,e:'open'});
var ov=document.createElement('div');ov.className='z3ac-ov';ov.innerHTML='<div class="z3ac-w" role="dialog" aria-label="Открытка-звание"><h3>Открытка-звание</h3>'+
'<div class="z3ac-im" style="display:flex;align-items:center;justify-content:center">рисую…</div></div>';document.body.appendChild(ov);
ov.addEventListener('click',function(e){if(e.target===ov)close(ov);});
var pic=T('card-pic'),say=T('card-say');
name().then(function(nm){return draw(rank,nm,pic);}).then(function(c0){if(!ov.isConnected)return;
var vk=br()&&!isOK(),ok=br()&&isOK(),jpg='',png='';try{jpg=c0.toDataURL('image/jpeg',.88);}catch(e){}
var msg=T('card-msg',{rank:rank})||('У меня звание «'+rank+'» от бабы Зины!');
var b=vk?'<button type="button" class="btn green z3ac-go" data-k="vks">📸 В историю ВКонтакте</button><button type="button" class="btn ghost z3ac-go" data-k="vkw">📨 Отправить ВКонтакте</button>':
ok?'<button type="button" class="btn green z3ac-go" data-k="okinv">📮 Отправить друзьям</button>':
'<button type="button" class="btn green z3ac-go" data-k="save">💾 Сохранить картинку</button>';
ov.firstChild.innerHTML='<h3>Открытка-звание</h3><img class="z3ac-im" alt="Открытка: звание «'+esc(rank)+'»" src="'+(jpg||'')+'">'+(say?'<p>'+esc(say)+'</p>':'')+b+
'<button type="button" class="btn ghost small z3ac-x">Закрыть</button>';
ov.querySelector('.z3ac-x').onclick=function(){snd();close(ov);};
[].forEach.call(ov.querySelectorAll('.z3ac-go'),function(x){x.onclick=function(){snd();var k=x.getAttribute('data-k'),a=qp('vk_app_id');
var fin=function(okk){AL.ev('card',{r:id,e:okk?k:'no'});};
if(k==='vks'){var p={background_type:'image',blob:jpg};if(a)p.attachment={text:'go_to',type:'url',url:'https://vk.com/app'+a};
vkSend('VKWebAppShowStoryBox',p,60000).then(function(r){fin(!r||r.result!==false);},function(e){fin(0);if(!SHR.isCancel(e))SHR.post(msg,{k:'zvan'});});return;}
if(k==='vkw'){SHR.post(msg,{k:'zvan',cb:function(h){fin(h==='vk'||h==='copy');}});return;}
if(k==='okinv'){vkSend('VKWebAppShowInviteBox',{message:msg},60000).then(function(r){fin(!r||r.success!==false);},function(e){fin(0);if(!SHR.isCancel(e))SHR.fallback(msg+(SHR.link('')?'\n'+SHR.link(''):''),'Окно не открылось — текст скопирован, вставь его другу');});return;}
if(k==='save'){try{png=png||c0.toDataURL('image/png');var l=document.createElement('a');l.href=png;l.download='zina-zvanie.png';document.body.appendChild(l);l.click();l.remove();fin(1);
toast2('Картинка сохранена — покажи соседям');}catch(e){fin(0);}}};});
},function(){if(ov.isConnected){ov.firstChild.innerHTML='<h3>Открытка-звание</h3><p>Открытка не нарисовалась. Карандаш сломался — мой точит.</p><button type="button" class="btn ghost z3ac-x">Закрыть</button>';
ov.querySelector('.z3ac-x').onclick=function(){close(ov);};}AL.ev('card',{r:id,e:'no'});});};
})();
