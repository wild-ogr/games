'use strict';
(function(){
var W=window.ZBWD;if(!W||W.win)return;
var BG=[3,7,14,30],Z=W.Z,P=W.P,dn=W.day,tk=W.tk,cur=W.cur,ev=W.ev,sv=W.sv;
function win(id,n){if(window.ZB2ZAP&&id==="zagadala")try{ZB2ZAP.hook("wd",1,{id:id});}catch(e){}var z=Z(),p=P[id]||P.zagadala,t=tk(),out={r:0,b:0,bg:[],hb:0,sh:0};
if(z[p[0]]===t){out.r=z[p[1]];out.b=z[p[2]];return out;}
var c=cur(id),g=z[p[0]]?dn(t)-dn(z[p[0]]):99;if(c&&g===2){z.sh=Math.floor(dn(t)/7);out.sh=1;}
z[p[1]]=c+1;z[p[0]]=t;z[p[2]]=Math.max(z[p[2]],z[p[1]]);out.r=z[p[1]];out.b=z[p[2]];
if(id==='zagadala'){z.n++;BG.forEach(function(x,i){if(z.r>=x&&!(z.bg&(1<<i))){z.bg|=1<<i;out.bg.push(x);}});
if(z.r%7===0&&z.hd!==t){z.hd=t;try{if(typeof hbAdd==='function'&&!(typeof hbN==='function'&&typeof HB_MAX!=='undefined'&&hbN()>=HB_MAX)){hbAdd(1,'wd');out.hb=1;}}catch(e){}}
ev({a:'win',n:n|0,sr:z.r});}
sv();ZB.safe('wd-td',function(){if(window.ZBTD&&ZBTD.check)ZBTD.check();});return out;}
function lose(id){var z=Z(),p=P[id]||P.zagadala;z[p[3]]=tk();z[p[1]]=0;if(id==='zagadala')ev({a:'lose',n:6,sr:0});sv();
ZB.safe('wd-td',function(){if(window.ZBTD&&ZBTD.check)ZBTD.check();});}
function share(txt,id){var br=typeof PLAT!=='undefined'&&PLAT==='vk'&&!!window.vkBridge&&typeof vkSend==='function',vk=br&&!(typeof OK!=='undefined'&&OK);
ev({id:id||'zagadala',ok:vk?'vk':'copy'},'share');
if(window.SHR){SHR.post(txt,{k:'wd'});return vk?'vk':'copy';}
if(vk){var a=new URLSearchParams(location.search).get('vk_app_id');vkSend('VKWebAppShowWallPostBox',{message:txt+(a?'\nhttps://vk.com/app'+a:'')},60000).catch(function(){});return'vk';}
var done=function(){try{toast('Скопировано — вставь другу в сообщение',3000);}catch(e){}};
try{if(br){vkSend('VKWebAppCopyText',{text:txt}).then(done,function(){cp(txt,done);});return'copy';}}catch(e){}
cp(txt,done);return'copy';}
function cp(t,done){var f=function(){try{var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();done();}catch(e){}};
try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,f);return;}}catch(e){}f();}
W.win=win;W.lose=lose;W.share=share;
var st=W.st,hoursLeft=W.hoursLeft,muhaDone=W.muhaDone,open=W.open;
if(!W.on)return;
function mOn(){var w=new Date(typeof nowMs==='function'?nowMs():Date.now()).getDay();return w>=2&&w<=6&&!ZB2.off('muha');}
ZB.add(ZB.todayTasks,{id:'wd',sub:'Слово дня',ic:'🔠',alt:'home',
get t(){return st().e&&mOn()?'Из мухи слона':'Зина загадала слово';},
off:function(){return ZB2.off('zagadala');},
done:function(){return!!st().e&&(!mOn()||muhaDone());},
go:function(){ev({a:'go',m:'day'});open(st().e&&mOn()?'muha':'zagadala','home');},
hint:function(){var s=st();return s.e&&mOn()?'задача дня — одна на весь подъезд':'одно слово на всех · '+(6-s.g.length)+' '+pl(6-s.g.length,'попытка','попытки','попыток');}});
function pl(n,a,b,c){return typeof plural==='function'?plural(n,a,b,c):c;}
function card(){if(ZB2.off('zagadala'))return'';var s=st(),r=cur('zagadala'),h=hoursLeft(),L=s.L,cells='';
for(var i=0;i<L;i++)cells+='<i class="'+(s.e===1?'g':s.e===2?'x':'')+'"></i>';
var t1,t2,btn;
if(!s.e){t1='Зина загадала слово';t2='осталось '+(6-s.g.length)+' '+pl(6-s.g.length,'попытка','попытки','попыток')+' · новое через '+h+' ч';btn='Угадать';}
else{t1=s.e===1?'Угадано с '+s.g.length+'-й попытки!':'Сегодня не вышло';t2=(r?'Серия 🔥'+r+' · ':'')+'новое через '+h+' ч';btn=s.e===1?'Похвастаться':'Посмотреть';}
return'<div class="zw-card" role="button" tabindex="0"><span class="zw-cells">'+cells+'</span><span class="zw-tx"><b>'+t1+'</b><small>'+t2+'</small></span>'+
'<span class="zw-btn">'+btn+'</span></div>';}
var shown=0;
function aft(){return!!document.getElementById('zbAfter');}
ZB.add(ZB.homeSlots,{id:'wordday',get order(){return aft()?10:70;},get zone(){return aft()?'after':'school';},
render:function(){var h=card();if(h)css();return h;},
mount:function(el){var c=el&&el.querySelector('.zw-card');if(!c)return;if(!shown){shown=1;ev({a:'show',n:st().g.length,sr:cur('zagadala')});}
c.onclick=function(){try{SND.tap();}catch(e){}var s=st();ev({a:'go',m:'home',n:s.g.length});
if(s.e===1&&window.ZMG&&ZMG.load)W.x().then(function(){return ZMG.load('zagadala');}).then(function(g){
return(window.ZMG_ZAGADALA?Promise.resolve():ZB.load('js/zmg-zagadala-data.js')).then(function(){if(!(g&&g.shareToday&&g.shareToday()))open('zagadala');});}).catch(function(){open('zagadala');});else open('zagadala','home');};
c.onkeydown=function(e){if(e.key==='Enter')c.onclick();};}});
ZB.on('zmg',function(d){if(d&&(d.id==='zagadala'||d.id==='muha'))ZB.safe('wd-ref',function(){ZB.refresh();});});
var cssOn=0;
function css(){if(cssOn)return;cssOn=1;var s=document.createElement('style');s.textContent=
'.zw-card{display:flex;align-items:center;gap:10px;margin:6px 0;padding:10px 12px;min-height:56px;box-sizing:border-box;border-radius:16px;background:var(--paper,#fbf7ec);'+
'box-shadow:0 2px 8px rgba(60,40,10,.12);cursor:pointer;border:2px solid #e6d9b8;text-align:left}'+
'.zw-cells{display:flex;gap:3px;flex:0 0 auto}.zw-cells i{width:13px;height:16px;border:1.5px solid #9bb3c9;border-radius:3px;background:#fff}'+
'.zw-cells i.g{background:#6abf69;border-color:#4c9a4b}.zw-cells i.x{background:#e8e2d4}'+
'.zw-tx{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.25}.zw-tx b{font-size:16px;color:#3b2a14}.zw-tx small{font-size:13px;color:#7a6a50}'+
'.zw-btn{flex:0 0 auto;background:#4f9a4d;color:#fff;font-weight:700;font-size:15px;padding:8px 12px;border-radius:12px;white-space:nowrap}'+
'@media (max-width:360px){.zw-cells i{width:10px;height:13px}.zw-btn{padding:8px 9px;font-size:14px}}';document.head.appendChild(s);}
})();
