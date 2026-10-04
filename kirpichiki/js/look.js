/* K1: НОВЫЙ ВИД И ТЕМЫ ОФОРМЛЕНИЯ «Кирпичиков» (03.10).
   Основной вид — Г «Летний двор» (мармеладные кирпичики, стеклянное поле, двор в солнце по времени суток).
   Темы — реестр THEMES (как в «Магнате», js/themes.js): у каждой свой «набор рисования» KIT (кирпичик, поле, предмет, эффекты, двор, карта)
   и свои цвета интерфейса (css/look.css — основа, js/th-*.js — тема). Тема «Прежний вид» (classic) — старый вид игры без изменений.
   Грузится ПЕРЕД основным скриптом index.html; общие имена игры (S, G, LY, VARS, rr, mkR, portrait, ITEM_IMG, THB, drawBrick, save, L, PAY…)
   берутся только во время вызова. Кирпичики рисуются один раз в кэш картинок (спрайты) — 60 кадров на слабых телефонах.
   Сохранение: S.th — выбранная тема, S.thU — открытые {id:1} (облако — объединение), S.adTot — роликов за награду всего (облако — максимум),
   S.lkV — версия вида (1), S.lkOld — когда старый игрок впервые увидел новый вид (мс; «Прежний вид» доступен 14 дней).
   API: window.THEME (list, owned, cur, set, get, buy, open, apply, check, bought, trial, previewCanvas), window.LK (рисование для index.html). */
(function(){
'use strict';
var W=window,DOC=document;
function T(ru,en){return typeof L==='function'?L(ru,en):ru;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function DPR(){return Math.min(2,W.devicePixelRatio||1);}
function clamp(x){return x<0?0:x>1?1:x;}
function ease(t){return 1-Math.pow(1-t,3);}
function hex2(h){var n=parseInt(h.slice(1),16);return [n>>16,n>>8&255,n&255];}
function mixHex(h,k){var c=hex2(h);function f(v){return Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));}return '#'+c.map(function(v){return ('0'+f(v).toString(16)).slice(-2);}).join('');}
function rgba(h,a){var c=hex2(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
function RR(g,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function R0(s){s=s|0;return function(){s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function canvas(w,h){var c=DOC.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
function svgUri(s){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);}
function pURI(id,m){return svgUri(portrait(id,m||'happy'));}

/* ================= наборы рисования (KIT) ================= */
var KITS={};
/* ---------- Г «Летний двор»: мармелад — свет насквозь, цветная тень, глянцевая полоса, пузырёк ---------- */
var PALG=['#ff4f6a','#ff9a2e','#ffc21a','#7cc93f','#22bfae','#3f86ff','#9b5de5','#ff6fae'];
function jelly(g,x,y,s,c){var m=s*.055,w=s-2*m,r=s*.28,gr;
  g.fillStyle=rgba(c,.38);RR(g,x+m+s*.03,y+m+s*.05,w-s*.06,w,r);g.fill();
  gr=g.createLinearGradient(0,y+m,0,y+m+w);gr.addColorStop(0,mixHex(c,.42));gr.addColorStop(.5,c);gr.addColorStop(1,mixHex(c,-.06));g.fillStyle=gr;RR(g,x+m,y+m,w,w,r);g.fill();
  gr=g.createRadialGradient(x+s*.5,y+s*.5,s*.26,x+s*.5,y+s*.5,s*.62);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,rgba(mixHex(c,-.4),.38));g.fillStyle=gr;RR(g,x+m,y+m,w,w,r);g.fill();
  gr=g.createRadialGradient(x+s*.5,y+s*.76,s*.02,x+s*.5,y+s*.7,s*.36);gr.addColorStop(0,'rgba(255,255,235,.9)');gr.addColorStop(.45,rgba(mixHex(c,.55),.45));gr.addColorStop(1,rgba(mixHex(c,.55),0));g.fillStyle=gr;RR(g,x+m,y+m,w,w,r);g.fill();
  gr=g.createLinearGradient(0,y+m+s*.06,0,y+m+s*.34);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,.05)');g.fillStyle=gr;RR(g,x+m+s*.13,y+m+s*.06,w-s*.26,s*.24,s*.12);g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(x+s*.73,y+s*.7,s*.05,0,7);g.fill();g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x+s*.715,y+s*.685,s*.018,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=Math.max(1,s*.022);RR(g,x+m+.5,y+m+.5,w-1,w-1,r);g.stroke();}
function stoneG(g,x,y,s){var m=s*.06,w=s-2*m,r=s*.24,gr;g.fillStyle='rgba(60,80,70,.25)';RR(g,x+m,y+m+s*.05,w,w,r);g.fill();
  gr=g.createLinearGradient(0,y+m,0,y+m+w);gr.addColorStop(0,'#e6e1d6');gr.addColorStop(1,'#b9b1a2');g.fillStyle=gr;RR(g,x+m,y+m,w,w,r);g.fill();
  g.strokeStyle='rgba(110,95,75,.55)';g.lineWidth=Math.max(1,s*.035);g.lineCap='round';g.beginPath();g.moveTo(x+s*.28,y+s*.22);g.lineTo(x+s*.45,y+s*.44);g.lineTo(x+s*.36,y+s*.7);g.moveTo(x+s*.45,y+s*.44);g.lineTo(x+s*.74,y+s*.52);g.stroke();
  g.fillStyle='#7cc93f';g.beginPath();g.ellipse(x+s*.7,y+s*.8,s*.13,s*.05,0,0,7);g.fill();
  g.fillStyle='#fff';for(var i=0;i<5;i++){g.beginPath();g.ellipse(x+s*.74+Math.cos(i*1.256)*s*.05,y+s*.68+Math.sin(i*1.256)*s*.05,s*.035,s*.02,i*1.256,0,7);g.fill();}g.fillStyle='#ffc21a';g.beginPath();g.arc(x+s*.74,y+s*.68,s*.025,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.5)';RR(g,x+m+s*.12,y+m+s*.06,w-s*.24,s*.12,s*.06);g.fill();}
KITS.g={
  id:'g',pal:PALG,frK:.34,
  brick:function(g,x,y,s,col){if(col===20)return stoneG(g,x,y,s);jelly(g,x,y,s,PALG[(col-1)%PALG.length]);},
  // подложка поля: белое «стекло» с мягкими лунками. (0,0) — левый верх рамки, клетки начинаются с (fr,fr); ширина поля B, высота Bh (по умолчанию B)
  board:function(g,B,cs,fr,Bh){var S=B+2*fr,H=(Bh||B)+2*fr,rad=Math.min(S,H)*.07,gr;
    g.fillStyle='rgba(30,90,70,.10)';RR(g,-2,8,S+4,H+6,rad+3);g.fill();g.fillStyle='rgba(30,90,70,.12)';RR(g,0,4,S,H+2,rad);g.fill();
    gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(240,250,246,.93)');g.fillStyle=gr;RR(g,0,0,S,H,rad);g.fill();
    gr=g.createRadialGradient(S*.3,H*.1,S*.05,S*.3,H*.1,S*.9);gr.addColorStop(0,'rgba(255,250,220,.55)');gr.addColorStop(1,'rgba(255,250,220,0)');g.fillStyle=gr;RR(g,0,0,S,H,rad);g.fill();
    g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2;RR(g,1,1,S-2,H-2,rad);g.stroke();},
  empty:function(g,x,y,cs,r,c){var m=cs*.07,w=cs-2*m;g.fillStyle='rgba(90,150,120,.17)';RR(g,x+m,y+m,w,w,cs*.26);g.fill();
    g.fillStyle=((r+c)%2)?'#f1f8f2':'#f6faf4';RR(g,x+m+cs*.02,y+m+cs*.035,w-cs*.04,w-cs*.045,cs*.24);g.fill();},
  item:function(g,k,x,y,s){var cx=x+s*.5,cy=y+s*.48,r=s*.31;g.fillStyle='rgba(255,255,255,.92)';g.beginPath();g.arc(cx,cy,r,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=s*.04;g.beginPath();g.arc(cx,cy,r+s*.03,0,7);g.stroke();
    var im=ITEM_IMG[k];if(im&&im.complete&&im.naturalWidth)g.drawImage(im,cx-r*.84,cy-r*.84,r*1.68,r*1.68);},
  tray:function(g,x,y,w,h){g.fillStyle='rgba(30,90,70,.10)';RR(g,x,y+6,w,h,26);g.fill();g.fillStyle='rgba(255,255,255,.74)';RR(g,x,y,w,h,26);g.fill();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.5;RR(g,x+.75,y+.75,w-1.5,h-1.5,26);g.stroke();},
  traySel:'rgba(255,214,90,.42)',
  // эффект сбора клетки: дрожь → лопается, кольцо брызг (e 0…1 за FX_MS)
  fx:function(g,x,y,cs,col,it,e,draw){var c=col===20?'#b9b1a2':PALG[(col-1)%PALG.length];
    if(e<.3){g.save();g.globalAlpha=(1-e/.3)*.85;var gr=g.createRadialGradient(x+cs/2,y+cs/2,cs*.1,x+cs/2,y+cs/2,cs*.8);gr.addColorStop(0,'rgba(255,253,220,1)');gr.addColorStop(1,'rgba(255,253,220,0)');g.fillStyle=gr;g.fillRect(x-cs*.3,y-cs*.3,cs*1.6,cs*1.6);g.restore();}
    var k=clamp((e-.12)/.3);if(k<1){var wob=Math.sin(e*40)*.09*(1-k),sx=1+wob+.3*k,sy=1-wob+.3*k;g.save();g.globalAlpha=1-k;g.translate(x+cs/2,y+cs*.9);g.scale(sx,sy);g.translate(0,-cs*.4);draw(-cs/2,-cs/2);g.restore();}
    var p=clamp((e-.3)/.7);if(p>0&&p<1){g.save();g.globalAlpha=(1-p)*.8;g.strokeStyle=c;g.lineWidth=cs*.08*(1-p);g.beginPath();g.arc(x+cs/2,y+cs/2,cs*(.3+.6*ease(p)),0,7);g.stroke();g.restore();}},
  fxMs:600,
  partCol:function(col){return col===20?'#cfc6b6':PALG[(col-1)%PALG.length];},
  // частица: капля сока с бликом или белая искра
  part:function(g,p,x,y,a){if(p.t===1){g.fillStyle='#fff';g.save();g.translate(x,y);g.rotate(p.rot);g.beginPath();for(var i=0;i<8;i++){var r2=i%2?p.s*.3:p.s*1.1;g.lineTo(Math.cos(i*Math.PI/4)*r2,Math.sin(i*Math.PI/4)*r2);}g.fill();g.restore();return;}
    g.fillStyle=p.c;g.beginPath();g.arc(x,y,p.s,0,7);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(x-p.s*.35,y-p.s*.35,p.s*.35,0,7);g.fill();},
  // крупные слова: белая кайма, коралловый (или свой) градиент, цветная мягкая тень
  text:function(g,t,size,kind){g.font='800 '+size+'px KF,-apple-system,Roboto,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
    var C={clean:['#b5ec6a','#3fb34f','#1f8a3c'],gold:['#ffe07a','#ffb800','#f07a12'],combo:['#ffb057','#ff5a5f','#e8326e'],rec:['#ffe07a','#ffb800','#f07a12'],pts:['#ff7a8a','#e8326e','#c41f5a']}[kind]||['#ffb057','#ff5a5f','#e8326e'];
    if(kind!=='pts'){g.fillStyle=rgba(C[2],.3);g.fillText(t,0,size*.11);}
    g.lineWidth=size*(kind==='pts'?.26:.22);g.strokeStyle='#fff';g.strokeText(t,0,0);
    var gr=g.createLinearGradient(0,-size*.42,0,size*.42);gr.addColorStop(0,C[0]);gr.addColorStop(.55,C[1]);gr.addColorStop(1,C[2]);g.fillStyle=gr;g.fillText(t,0,0);},
  conf:PALG,
  yard:function(tod){return yardG(tod);},
  map:{bg:'#8fd16a',stripe:'#9fdc78',edge:'#6fb553',path:'#f7e6c4',mid:'#fff6e0',crown:['#b8ec7a','#5fb84a','#2a7f3f'],ink:'#163b3a',ink2:'#4c6b69',done:'#eaf8e2',doneTx:'#2a8a3c',cur:['#ffa08a','#ff4f6a','#e02b57'],lockTx:'#5d8a76',flower:'#ffc21a',ring:'#ff8a5c'},
  prev:{bg:'#bfe8f6',bg2:'#8fd16a'}
};

/* ---------- летний двор: солнце, дымка, хрущёвки в пастели, липы, сирень, бельё, пятна света; tod: day | eve | night ---------- */
var YC={};
function yardG(tod){if(YC[tod])return YC[tod];var R=R0(21),night=tod==='night',eve=tod==='eve';
 var sky=night?['#0f2346','#27406e','#4a5d8c','#6d6f92']:eve?['#5d7fc8','#c99ac8','#ffc2a0','#ffe3b8']:['#6cc6f2','#aee2f7','#e9f7f4','#fff2d6'];
 var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice"><defs>'+
 '<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky[0]+'"/><stop offset=".38" stop-color="'+sky[1]+'"/><stop offset=".62" stop-color="'+sky[2]+'"/><stop offset=".75" stop-color="'+sky[3]+'"/></linearGradient>'+
 '<radialGradient id="sun"><stop offset="0" stop-color="#fffbe8"/><stop offset=".18" stop-color="#fff3c0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffe9a0" stop-opacity=".35"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="leaf" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#b8ec7a"/><stop offset=".45" stop-color="#6cc34f"/><stop offset="1" stop-color="#2f8a43"/></radialGradient>'+
 '<radialGradient id="leaf2" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#9fdc6a"/><stop offset=".5" stop-color="#4fab48"/><stop offset="1" stop-color="#237338"/></radialGradient>'+
 '<radialGradient id="fg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#1f6b3a" stop-opacity=".95"/><stop offset=".7" stop-color="#2f8a43" stop-opacity=".75"/><stop offset="1" stop-color="#2f8a43" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="bok"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".7" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="lamp"><stop offset="0" stop-color="#fff3c0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="wA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe7d6"/><stop offset="1" stop-color="#f6cdb4"/></linearGradient>'+
 '<linearGradient id="wB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dff3e8"/><stop offset="1" stop-color="#bfe2d1"/></linearGradient>'+
 '<linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6e57a"/><stop offset="1" stop-color="#77c25a"/></linearGradient>'+
 '<linearGradient id="path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeed6"/><stop offset="1" stop-color="#f1dcb8"/></linearGradient>'+
 '<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="'+(night?'#3a4b78':eve?'#ffe0c8':'#f4fbf7')+'" stop-opacity=".85"/></linearGradient>'+
 '</defs><rect width="1200" height="800" fill="url(#sk)"/>';
 if(night){for(var i=0;i<70;i++)s+='<circle cx="'+(R()*1200).toFixed(0)+'" cy="'+(R()*330).toFixed(0)+'" r="'+(.8+R()*1.8).toFixed(1)+'" fill="#fff" opacity="'+(.4+R()*.6).toFixed(2)+'"/>';
   s+='<circle cx="900" cy="120" r="44" fill="#fff8dc"/><circle cx="918" cy="108" r="40" fill="#27406e"/><circle cx="880" cy="128" r="70" fill="#fff8dc" opacity=".08"/>';}
 else{var sx=eve?980:860,sy=eve?330:120;
   s+='<g opacity="'+(eve?.3:.5)+'">';for(var j=0;j<14;j++){var a=j/14*Math.PI*2+.1,a2=a+.07;s+='<path d="M'+sx+' '+sy+'L'+(sx+Math.cos(a)*900).toFixed(0)+' '+(sy+Math.sin(a)*900).toFixed(0)+'L'+(sx+Math.cos(a2)*900).toFixed(0)+' '+(sy+Math.sin(a2)*900).toFixed(0)+'z" fill="#fff8d8" opacity=".35"/>';}s+='</g>';
   s+='<circle cx="'+sx+'" cy="'+sy+'" r="300" fill="url(#sun)"/><circle cx="'+sx+'" cy="'+sy+'" r="46" fill="'+(eve?'#ffd59a':'#fffdf2')+'"/>';}
 function cloud(x,y,k){return '<g fill="'+(night?'#5b6b94':eve?'#ffe6d6':'#fff')+'" opacity="'+(night?.45:1)+'"><ellipse cx="'+x+'" cy="'+y+'" rx="'+70*k+'" ry="'+20*k+'"/><ellipse cx="'+(x-28*k)+'" cy="'+(y-12*k)+'" rx="'+34*k+'" ry="'+24*k+'"/><ellipse cx="'+(x+20*k)+'" cy="'+(y-20*k)+'" rx="'+40*k+'" ry="'+30*k+'"/></g>';}
 s+=cloud(240,150,1.1)+cloud(600,70,.8)+cloud(1080,210,.9);
 var far=night?'#33456f':eve?'#c9b5c8':'#cfe3ee',farw=night?'#2a3a60':eve?'#b9a4bb':'#bcd5e3';
 [[60,140,300],[250,120,260],[470,160,320],[690,130,280],[930,150,310],[1090,120,250]].forEach(function(q){var x=q[0],w=q[1],h=q[2];s+='<rect x="'+x+'" y="'+(560-h)+'" width="'+w+'" height="'+h+'" rx="4" fill="'+far+'"/>';
   for(var r=0;r<9;r++)for(var c=0;c<5;c++){var lit=(night||eve)&&R()<(night?.35:.22);s+='<rect x="'+(x+10+c*w/5.3).toFixed(1)+'" y="'+(560-h+14+r*30)+'" width="10" height="13" rx="2" fill="'+(lit?'#ffd98a':farw)+'"/>';}});
 s+='<rect x="0" y="240" width="1200" height="330" fill="url(#haze)"/>';
 function house(x,y,w,fl,cols,wid,trim){var fh=48,h=fl*fh+20,t='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#'+wid+')"/>'+(night?'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#1d2b55" opacity=".55"/>':eve?'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#ff9a6a" opacity=".12"/>':'')+'<rect x="'+(x-8)+'" y="'+(y-12)+'" width="'+(w+16)+'" height="14" rx="4" fill="'+trim+'"/>';
   for(var f=1;f<fl;f++)t+='<rect x="'+x+'" y="'+(y+14+f*fh)+'" width="'+w+'" height="3" fill="#fff" opacity="'+(night?.12:.45)+'"/>';
   var cw=w/cols;for(f=0;f<fl;f++)for(var c=0;c<cols;c++){var wx=x+c*cw+cw*.2,wy=y+22+f*fh,ww=cw*.6,wh=28,lit=(night&&R()<.5)||(eve&&R()<.38);
     t+='<rect x="'+(wx-3)+'" y="'+(wy-3)+'" width="'+(ww+6)+'" height="'+(wh+6)+'" rx="5" fill="'+(night?'#c9cfe0':'#fff')+'"/><rect x="'+wx+'" y="'+wy+'" width="'+ww+'" height="'+wh+'" rx="3" fill="'+(lit?(R()<.5?'#ffd98a':'#ffe9b0'):night?'#2c3b66':'#8fcbe8')+'"/>'+(lit?'':'<path d="M'+(wx+3)+' '+(wy+wh-4)+'l'+(ww*.5)+' -'+(wh-8)+'" stroke="#fff" stroke-width="5" opacity="'+(night?.12:.45)+'"/>')+'<rect x="'+(wx+ww/2-1)+'" y="'+wy+'" width="2" height="'+wh+'" fill="'+(night?'#c9cfe0':'#fff')+'"/>';
     if(R()<.4)t+='<rect x="'+(wx+1)+'" y="'+(wy+1)+'" width="'+(ww*.24)+'" height="'+(wh-2)+'" rx="2" fill="'+(R()<.5?'#ffd2c4':'#fff2b3')+'" opacity="'+(night?.6:1)+'"/>';
     if(f>0&&R()<.35){t+='<rect x="'+(wx-4)+'" y="'+(wy+wh+1)+'" width="'+(ww+8)+'" height="8" rx="3" fill="#b9805a"/>';for(var k=0;k<4;k++)t+='<circle cx="'+(wx+2+k*ww/3.3).toFixed(1)+'" cy="'+(wy+wh)+'" r="4.2" fill="'+(R()<.6?'#ff4f6a':'#ff9a2e')+'"/>';}}
   return t;}
 s+=house(-30,300,500,5,7,'wA','#e8b49a')+house(730,290,500,5,7,'wB','#9fcfb8');
 [[140,'#2ec4b6'],[350,'#ff8a5c'],[860,'#4d7cff'],[1060,'#ff4f6a']].forEach(function(q){var x=q[0];s+='<rect x="'+(x-34)+'" y="506" width="68" height="10" rx="3" fill="#fff"/><rect x="'+(x-24)+'" y="516" width="48" height="64" rx="4" fill="'+q[1]+'"/><rect x="'+(x-18)+'" y="522" width="16" height="22" rx="2" fill="#fff" opacity=".45"/>'+((night||eve)?'<circle cx="'+x+'" cy="500" r="5" fill="#fff3c0"/><circle cx="'+x+'" cy="520" r="50" fill="url(#lamp)" opacity=".7"/>':'');});
 if(!night)for(var i2=0;i2<12;i2++)s+='<ellipse cx="'+(R()<.5?R()*450:760+R()*440).toFixed(0)+'" cy="'+(320+R()*200).toFixed(0)+'" rx="'+(30+R()*40).toFixed(0)+'" ry="'+(16+R()*18).toFixed(0)+'" fill="#3d6b4f" opacity=".07"/>';
 function tree(x,y,k,gid){return '<rect x="'+(x-7*k)+'" y="'+(y-20)+'" width="'+14*k+'" height="'+(600-y+20)+'" rx="5" fill="#8a6141"/><circle cx="'+x+'" cy="'+(y-60*k)+'" r="'+70*k+'" fill="url(#'+gid+')"/><circle cx="'+(x-48*k)+'" cy="'+(y-26*k)+'" r="'+46*k+'" fill="url(#'+gid+')"/><circle cx="'+(x+44*k)+'" cy="'+(y-30*k)+'" r="'+48*k+'" fill="url(#'+gid+')"/><circle cx="'+(x+8*k)+'" cy="'+(y-112*k)+'" r="'+40*k+'" fill="url(#'+gid+')"/>';}
 s+=tree(40,560,1.2,'leaf2')+tree(520,540,.95,'leaf')+tree(1170,560,1.2,'leaf2');
 function lilac(x,y,k){var t='<ellipse cx="'+x+'" cy="'+(y+26*k)+'" rx="'+92*k+'" ry="'+46*k+'" fill="url(#leaf2)"/>';for(var i=0;i<6;i++){var a=x-62*k+i*25*k,b=y-2*k+Math.sin(i*1.7)*12*k;for(var j=0;j<9;j++){var yy=b-26*k+j*6*k,ww=(2+j*1.3)*k;t+='<circle cx="'+(a+(R()-.5)*ww*2).toFixed(1)+'" cy="'+yy.toFixed(1)+'" r="'+(4.5*k).toFixed(1)+'" fill="'+(R()<.5?'#c58ce8':(R()<.5?'#e2bdf7':'#a46ad6'))+'"/>';}}return t;}
 s+=lilac(640,560,1)+lilac(820,575,.9)+lilac(330,585,.8);
 s+='<path d="M930 470l-36 130M1010 470l36 130M920 470h100" stroke="#ff7a59" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M955 470v86M985 470v86" stroke="#7d8b8a" stroke-width="2.5"/><rect x="946" y="554" width="48" height="9" rx="4" fill="#ffd23a"/>';
 if(!night)s+='<path d="M600 420q90 26 180 0" stroke="#7d8b8a" stroke-width="2" fill="none"/>'+[[618,'#fff'],[660,'#ffe2ea'],[706,'#fff'],[748,'#dff3ff']].map(function(q,i){var x=q[0];return '<path d="M'+x+' '+(424+(i==1||i==2?6:2))+'h'+(i%2?32:28)+'v'+(36+i*4)+'q-'+(i%2?16:14)+' 6 -'+(i%2?32:28)+' 0z" fill="'+q[1]+'" stroke="#e1ece9" stroke-width="1.5"/>';}).join('');
 s+='<path d="M0 588q300-14 600 0t600 0V800H0z" fill="url(#lawn)"/>';
 for(var i3=0;i3<60;i3++){var x3=R()*1200,y3=596+R()*30;s+='<path d="M'+x3.toFixed(0)+' '+y3.toFixed(0)+'l3-9 3 9" fill="#5fb24a" opacity=".6"/>';}
 s+='<path d="M-20 650q620-30 1240 0V800H-20z" fill="url(#path)"/>';
 for(var i4=0;i4<22;i4++)s+='<ellipse cx="'+(R()*1200).toFixed(0)+'" cy="'+(670+R()*130).toFixed(0)+'" rx="'+(20+R()*46).toFixed(0)+'" ry="'+(7+R()*12).toFixed(0)+'" fill="#6f8f62" opacity=".06"/>';
 if(!night)for(var i5=0;i5<14;i5++)s+='<ellipse cx="'+(R()*1200).toFixed(0)+'" cy="'+(670+R()*130).toFixed(0)+'" rx="'+(10+R()*20).toFixed(0)+'" ry="'+(4+R()*6).toFixed(0)+'" fill="#fffbe6" opacity=".7"/>';
 s+='<ellipse cx="190" cy="636" rx="70" ry="22" fill="#4d7cff"/><ellipse cx="190" cy="630" rx="58" ry="15" fill="#6e4a33"/>';for(var i6=0;i6<9;i6++)s+='<circle cx="'+(140+i6*12)+'" cy="'+(622-Math.sin(i6)*4).toFixed(0)+'" r="7" fill="'+['#ff9a2e','#ffd23a','#ff4f6a'][i6%3]+'"/>';
 for(var i7=0;i7<18;i7++){var x7=R()*1200,y7=600+R()*40;s+='<circle cx="'+x7.toFixed(0)+'" cy="'+y7.toFixed(0)+'" r="4" fill="#fff"/><circle cx="'+x7.toFixed(0)+'" cy="'+y7.toFixed(0)+'" r="1.6" fill="#ffc21a"/>';}
 if(night||eve){[[300,620],[900,615]].forEach(function(q){s+='<rect x="'+(q[0]-3)+'" y="'+(q[1]-150)+'" width="6" height="150" fill="#4a5568"/><circle cx="'+q[0]+'" cy="'+(q[1]-152)+'" r="9" fill="#fff3c0"/><circle cx="'+q[0]+'" cy="'+(q[1]-140)+'" r="110" fill="url(#lamp)"/>';});}
 s+='<ellipse cx="330" cy="-10" rx="150" ry="110" fill="url(#fg)"/><ellipse cx="850" cy="-30" rx="130" ry="90" fill="url(#fg)" opacity=".8"/><ellipse cx="-10" cy="300" rx="120" ry="200" fill="url(#fg)" opacity=".7"/><ellipse cx="1210" cy="320" rx="120" ry="200" fill="url(#fg)" opacity=".7"/>';
 if(!night)for(var i8=0;i8<16;i8++)s+='<circle cx="'+(R()*1200).toFixed(0)+'" cy="'+(R()*420).toFixed(0)+'" r="'+(8+R()*22).toFixed(0)+'" fill="url(#bok)"/>';
 if(night)s+='<rect width="1200" height="800" fill="#0b1630" opacity=".18"/>';
 return YC[tod]=s+'</svg>';}

/* ================= реестр тем ================= */
// unlock.t: free — сразу; pay — покупка PAY_ITEMS[pay]; coins — за монеты; ads — n роликов за награду всего (S.adTot); rk — звание S.rk ≥ n (звёзды); old — «Прежний вид» для старых игроков 14 дней
var THEMES=[
 {id:'g',ru:'Летний двор',en:'Summer yard',d:'Мармеладные кирпичики, двор в солнце',de:'Jelly bricks, sunny yard',prev:{bg:'#bfe8f6',card:'#ffffff',ink:'#163b3a',acc:'#ff5a6e'},unlock:{t:'free'}},
 {id:'retro',ru:'Карманная 90-х',en:'90s handheld',d:'Жёлтая карманная игра и ЖК-экран',de:'Yellow handheld with LCD',prev:{bg:'#7a1f24',card:'#ffe57a',ink:'#22301f',acc:'#e03131'},unlock:{t:'free'}},
 {id:'a',ru:'Глянцевый двор',en:'Glossy yard',d:'Кирпичики-леденцы на ореховом столе',de:'Candy bricks on a walnut table',prev:{bg:'#9fd3ee',card:'#fff8ec',ink:'#3b2416',acc:'#e8553f'},unlock:{t:'pay',pay:'look_glossy'}},
 {id:'d',ru:'Игрушечный двор',en:'Toy yard',d:'Всё из пластилина: мягко и тепло',de:'All made of plasticine',prev:{bg:'#f6e6cf',card:'#fffaf2',ink:'#4a2e22',acc:'#ef6f4f'},unlock:{t:'coins',c:1500}},
 {id:'e',ru:'Двор-мозаика',en:'Mosaic yard',d:'Изразцы, смальта и гжель',de:'Tiles, smalt and gzhel',prev:{bg:'#f3ead8',card:'#fffdf7',ink:'#1e2a44',acc:'#2a4fa8'},unlock:{t:'rk',n:4}},
 {id:'b',ru:'Тёплая открытка',en:'Warm postcard',d:'Акварель, тетрадь в клетку, штамп «Отлично!»',de:'Watercolour and a squared notebook',prev:{bg:'#f6eedf',card:'#fffaf0',ink:'#3d322c',acc:'#c8283a'},unlock:{t:'ads',n:15}},
 {id:'classic',ru:'Прежний вид',en:'Classic look',d:'Как было до обновления',de:'As before the update',prev:{bg:'#9fd3ee',card:'#fffdf7',ink:'#2d3436',acc:'#e8590c'},unlock:{t:'old'},hide:1}
];
var BY={};THEMES.forEach(function(t){BY[t.id]=t;});
var OLD_DAYS=14,TRIAL=null,DEV=W.LK_TH0&&/[?&]theme=/.test(location.search)?W.LK_TH0:null;
function thU(){if(!isO(S.thU))S.thU={};return S.thU;}
function payOwn(id){try{return typeof PAY!=='undefined'&&!!PAY.own(id);}catch(e){return false;}}
function oldLeft(){var t=+S.lkOld||0;return t?Math.max(0,OLD_DAYS*864e5-(Date.now()-t)):0;}
function rkNow(){try{return Math.max(S.rk|0,rankOf(starsTot()));}catch(e){return S.rk|0;}}
function earned(t){var u=t.unlock;switch(u.t){case 'free':return true;case 'pay':return payOwn(u.pay);case 'ads':return (S.adTot|0)>=u.n;case 'rk':return rkNow()>=u.n;case 'old':return oldLeft()>0;default:return false;}}
function owned(id){var t=BY[id];if(!t)return false;if(t.unlock.t==='old')return oldLeft()>0;return !!thU()[id]||earned(t);}
function cur(){if(TRIAL&&BY[TRIAL])return TRIAL;if(DEV&&BY[DEV])return DEV;var id=typeof S!=='undefined'&&S&&S.th;return id&&BY[id]&&owned(id)?id:'g';}
function kit(){var id=cur();return KITS[id]||KITS.g;}
function on(){return /\blk\b/.test(DOC.documentElement.className);}
function rkLabel(n){try{return T(RANKS[n][1],RANKS[n][2])+' ('+RANKS[n][0]+'★)';}catch(e){return '';}}
function progress(id){var t=BY[id],u=t.unlock,o=owned(id);
  if(u.t==='free')return {have:1,need:1,txt:T('Бесплатно','Free')};
  if(u.t==='pay'){var it=null;try{it=PAY.on&&PAY.item(u.pay);}catch(e){}return {have:o?1:0,need:1,txt:o?T('Куплено','Purchased'):T('Покупка навсегда','Yours forever'),price:it?PAY.price(it):''};}
  if(u.t==='coins')return {have:o?1:0,need:1,txt:o?T('Открыто','Unlocked'):T('За '+u.c+' монет','For '+u.c+' coins')};
  if(u.t==='ads'){var n=Math.min(S.adTot|0,u.n);return {have:o?u.n:n,need:u.n,txt:o?T('Открыто','Unlocked'):T('Роликов: '+n+' из '+u.n,'Videos: '+n+' of '+u.n)};}
  if(u.t==='rk'){var st=0;try{st=starsTot();}catch(e){}var need=0;try{need=RANKS[u.n][0];}catch(e){}return {have:o?need:Math.min(st,need),need:need,txt:o?T('Открыто','Unlocked'):T('Звание «','Rank “')+(function(){try{return T(RANKS[u.n][1],RANKS[u.n][2]);}catch(e){return '';}})()+T('»: ★ ','”: ★ ')+Math.min(st,need)+T(' из ',' of ')+need};}
  if(u.t==='old'){var d=Math.ceil(oldLeft()/864e5);return {have:1,need:1,txt:T('Ещё '+d+' дн.','Still '+d+' days')};}
  return {have:0,need:1,txt:''};}
function how(id){var u=BY[id].unlock;return {free:T('бесплатно','free'),pay:T('покупка','purchase'),coins:T('за монеты','for coins'),ads:T('за ролики','for videos'),rk:T('за звёзды','for stars'),old:T('для давних игроков','for old players')}[u.t]||'';}
function list(){return THEMES.filter(function(t){return !t.hide||(t.id==='classic'&&oldLeft()>0);}).map(function(t){return {id:t.id,ru:t.ru,en:t.en,name:T(t.ru,t.en),dark:!!t.dark,prev:t.prev,unlock:t.unlock,owned:owned(t.id),cur:cur()===t.id,progress:progress(t.id),how:how(t.id)};});}

/* ================= кэш картинок: кирпичики, предметы, подложка поля ================= */
var SPR={},SPRN=0,BASE=null,BASEK='';
function skinT(){try{var t=theme();return t&&t.id!=='yard'&&t.id!=='retro'?t:null;}catch(e){return null;}}
function sprite(col,s){var K=kit(),sk=skinT(),d=DPR(),px=Math.round(s*d),key=(sk?sk.id:K.id)+'|'+col+'|'+px;var c=SPR[key];if(c)return c;
  if(++SPRN>600){SPR={};SPRN=1;}
  c=canvas(px+2,px+2);var g=c.getContext('2d');g.scale(px/s,px/s);
  if(sk)drawBrick(g,0,0,s,col,sk);else K.brick(g,0,0,s,col);
  return SPR[key]=c;}
function put(g,x,y,s,col,base){var sp=sprite(col,base||s),k=s/(base||s);g.drawImage(sp,x,y,sp.width/(sp.width-2)*s,sp.height/(sp.height-2)*s);}
function itemSpr(k,s){var K=kit(),d=DPR(),px=Math.round(s*d),key='it|'+K.id+'|'+k+'|'+px,c=SPR[key];if(c)return c;var im=ITEM_IMG[k];
  c=canvas(px,px);var g=c.getContext('2d');g.scale(px/s,px/s);(K.item||KITS.g.item)(g,k,0,0,s);if(im&&im.complete&&im.naturalWidth)SPR[key]=c;return c;}
function putItem(g,k,x,y,s,base){var c=itemSpr(k,base||s);g.drawImage(c,x,y,s,s);}
// K2: особые клетки поверх кирпичика: 2 — «лёд» (собрать дважды), 3 — «ящик». Тема может дать свой spec(g,x,y,s,o); иначе — вид Г
function specG(g,x,y,s,o){var m=s*.06,w=s-2*m,gr;
  if(o===2){gr=g.createLinearGradient(x,y,x+s,y+s);gr.addColorStop(0,'rgba(235,250,255,.78)');gr.addColorStop(.5,'rgba(190,232,255,.62)');gr.addColorStop(1,'rgba(150,210,245,.7)');g.fillStyle=gr;RR(g,x+m,y+m,w,w,s*.26);g.fill();
    g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=Math.max(1.2,s*.05);g.lineCap='round';g.beginPath();g.moveTo(x+s*.24,y+s*.64);g.lineTo(x+s*.46,y+s*.3);g.moveTo(x+s*.46,y+s*.7);g.lineTo(x+s*.64,y+s*.44);g.stroke();
    g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x+s*.72,y+s*.26,s*.05,0,7);g.fill();g.strokeStyle='rgba(80,160,215,.7)';g.lineWidth=Math.max(1,s*.035);RR(g,x+m,y+m,w,w,s*.26);g.stroke();return;}
  g.fillStyle='rgba(90,55,25,.3)';RR(g,x+m,y+m+s*.05,w,w,s*.16);g.fill();
  gr=g.createLinearGradient(0,y+m,0,y+m+w);gr.addColorStop(0,'#f2c48a');gr.addColorStop(1,'#c98f4c');g.fillStyle=gr;RR(g,x+m,y+m,w,w,s*.16);g.fill();
  g.strokeStyle='#a2692e';g.lineWidth=Math.max(1.5,s*.07);RR(g,x+s*.15,y+s*.15,s*.7,s*.7,s*.08);g.stroke();
  g.beginPath();g.moveTo(x+s*.2,y+s*.2);g.lineTo(x+s*.8,y+s*.8);g.moveTo(x+s*.8,y+s*.2);g.lineTo(x+s*.2,y+s*.8);g.stroke();
  g.fillStyle='rgba(255,255,255,.45)';RR(g,x+s*.16,y+s*.1,s*.68,s*.08,s*.04);g.fill();}
function putSpec(g,x,y,s,o){var K=kit(),d=DPR(),px=Math.round(s*d),key='sp|'+K.id+'|'+o+'|'+px,c=SPR[key];
  if(!c){c=canvas(px,px);var cg=c.getContext('2d');cg.scale(px/s,px/s);(K.spec||specG)(cg,0,0,s,o);SPR[key]=c;}g.drawImage(c,x,y,s,s);}
function clearCache(){SPR={};SPRN=0;BASE=null;BASEK='';}
// подложка: лоток и поле с рамкой и пустыми клетками — один раз на размер/тему
function base(){var d=DPR(),sk=skinT(),key=[cur(),sk?sk.id:'',LY.W,LY.H,LY.cs,LY.bx,LY.by,LY.fr,LY.land,d].join('|');if(BASE&&BASEK===key)return BASE;
  var K=kit(),c=canvas(LY.W*d,LY.H*d),g=c.getContext('2d');g.scale(d,d);
  var s0=LY.slots[0],s2=LY.slots[2],tl=Math.min(s0.x,s2.x),tt=s0.y,tw=LY.land?s0.w:s2.x+s2.w-s0.x,th=LY.land?s2.y+s2.h-s0.y:s0.h;
  (K.tray||KITS.g.tray)(g,tl+2,tt+2,tw-4,th-4,LY);
  g.save();g.translate(LY.bx-LY.fr,LY.by-LY.fr);K.board(g,LY.B,LY.cs,LY.fr);g.restore();
  for(var k=0;k<64;k++){var r=k>>3,cc=k&7,x=LY.bx+cc*LY.cs,y=LY.by+r*LY.cs;if(sk){if(cc===0&&r===0){g.fillStyle=sk.bg;RR(g,LY.bx-2,LY.by-2,LY.B+4,LY.B+4,LY.fr*.4);g.fill();}drawEmpty(g,x,y,LY.cs,sk);}else K.empty(g,x,y,LY.cs,r,cc);}
  BASE=c;BASEK=key;return c;}

/* ================= рисование игры (вместо старого render при html.lk) ================= */
function pp(g,v,x,y,s,col,alpha,ik,it,bs){g.globalAlpha=alpha;for(var j=0;j<v.cs.length;j++){var q=v.cs[j],xx=x+q[1]*s,yy=y+q[0]*s;put(g,xx,yy,s,col,bs);if(ik&&j===it)putItem(g,ik,xx,yy,s,bs);}g.globalAlpha=1;}
function shadowP(g,v,x,y,s,a){g.fillStyle='rgba(20,60,50,'+a+')';for(var j=0;j<v.cs.length;j++){var q=v.cs[j];RR(g,x+q[1]*s+s*.1,y+q[0]*s+s*.3,s*.84,s*.84,s*.26);g.fill();}}
function render(now){var g=cv.getContext('2d'),st=G.st,cs=LY.cs,B=LY.B,bx=LY.bx,by=LY.by,fr=LY.fr,K=kit(),i,e;
  g.setTransform(LY.dpr,0,0,LY.dpr,0,0);g.clearRect(0,0,LY.W,LY.H);
  if(G.shake){e=(now-G.shake)/260;if(e>=1)G.shake=0;else g.translate(Math.sin(now*.09)*5*(1-e),Math.cos(now*.07)*3*(1-e));}
  if(G.zoom){e=(now-G.zoom)/240;if(e>=1)G.zoom=0;else{var z=1+.04*Math.sin(e*Math.PI),zx=bx+B/2,zy=by+B/2;g.translate(zx,zy);g.scale(z,z);g.translate(-zx,-zy);}}
  g.drawImage(base(),0,0,LY.W,LY.H);
  var pl=G.placed&&now-G.placed.t0<220?G.placed:null;
  for(var k=0;k<64;k++){if(!st.b[k])continue;var r=k>>3,c=k&7,x=bx+c*cs,y=by+r*cs;
    if(pl&&pl.ks.indexOf(k)>=0){e=(now-pl.t0)/220;var sx=1+.16*Math.sin(e*Math.PI),sy=1-.1*Math.sin(e*Math.PI*2)*(1-e);g.save();g.translate(x+cs/2,y+cs);g.scale(sx,sy);put(g,-cs/2,-cs,cs,st.b[k]);if(st.it[k])putItem(g,st.it[k],-cs/2,-cs,cs);g.restore();}
    else{put(g,x,y,cs,st.b[k]);if(st.old&&st.old[k]>1)putSpec(g,x,y,cs,st.old[k]);if(st.it[k])putItem(g,st.it[k],x,y,cs);}}
  if(G.flash){e=(now-G.flash)/300;if(e>=1)G.flash=0;else{g.fillStyle='rgba(255,255,255,'+(.5*(1-e)).toFixed(3)+')';RR(g,bx-2,by-2,B+4,B+4,fr*.5);g.fill();}}
  if(G.kc&&G.sel>=0&&st.tray[G.sel]&&!G.drag){var sp=tapSpot(G.sel,G.kc.r,G.kc.c),p0=st.tray[G.sel];if(sp)pp(g,VARS[p0.v],bx+sp.c*cs,by+sp.r*cs,cs,VARS[p0.v].b+1,.5,p0.ik,p0.it);
    g.strokeStyle='#ffb800';g.lineWidth=3;RR(g,bx+G.kc.c*cs+2,by+G.kc.r*cs+2,cs-4,cs-4,cs*.26);g.stroke();}
  if(G.hint&&st.tray[G.hint.ti]&&!G.drag){var ph=st.tray[G.hint.ti];pp(g,VARS[ph.v],bx+G.hint.c*cs,by+G.hint.r*cs,cs,VARS[ph.v].b+1,.35+.3*Math.sin(now/180),ph.ik,ph.it);}
  var d=G.drag;
  if(d&&d.ghost){var pd=st.tray[d.ti],v=VARS[pd.v],col=v.b+1,lines=wouldClear(st,d.ti,d.ghost.r,d.ghost.c);
    if(lines.length){var a=.3+.14*Math.sin(now/90);g.fillStyle='rgba(255,236,150,'+a+')';for(i=0;i<lines.length;i++){var L1=lines[i];if(L1.r!=null){RR(g,bx,by+L1.r*cs,B,cs,cs*.28);g.fill();}else{RR(g,bx+L1.c*cs,by,cs,B,cs*.28);g.fill();}}
      g.globalAlpha=.55+.25*Math.sin(now/90);for(i=0;i<lines.length;i++){var L2=lines[i];for(var j=0;j<8;j++){var rr2=L2.r!=null?L2.r:j,cc2=L2.c!=null?L2.c:j;if(!st.b[rr2*8+cc2])put(g,bx+cc2*cs,by+rr2*cs,cs,col);}}g.globalAlpha=1;}
    pp(g,v,bx+d.ghost.c*cs,by+d.ghost.r*cs,cs,col,.42,pd.ik,pd.it);}
  var fxMs=K.fxMs||KITS.g.fxMs,fx=K.fx||KITS.g.fx;
  for(i=G.flashes.length-1;i>=0;i--){var f=G.flashes[i];e=(now-f.t0)/fxMs;if(e>=1){G.flashes.splice(i,1);continue;}var fx0=bx+(f.k&7)*cs,fy0=by+(f.k>>3)*cs;
    if(e<0){put(g,fx0,fy0,cs,f.col);if(f.it)putItem(g,f.it,fx0,fy0,cs);continue;}
    (function(f){fx(g,fx0,fy0,cs,f.col,f.it,e,function(xx,yy){put(g,xx,yy,cs,f.col);if(f.it)putItem(g,f.it,xx,yy,cs);});})(f);}
  if(G.curtain){e=Math.max(0,(now-G.curtain.t0)/650);var n=Math.min(8,Math.floor(e*8)+(e>0?1:0));g.globalAlpha=.94;for(var r3=7;r3>=8-n;r3--)for(var c3=0;c3<8;c3++)put(g,bx+c3*cs,by+r3*cs,cs,20);g.globalAlpha=1;if(e>1.4)G.curtain=null;}
  for(var ti=0;ti<3;ti++){if(d&&d.ti===ti)continue;if(G.back&&G.back.ti===ti)continue;var q=trayGeom(ti,now);if(!q)continue;
    var can=trayMoves(st,ti)>0,sel=G.sel===ti,hint=G.hint&&G.hint.ti===ti;
    if(sel||hint||G.tool==='rot'){var sl=LY.slots[ti];g.fillStyle=sel?(K.traySel||KITS.g.traySel):G.tool==='rot'?'rgba(255,255,255,'+(.4+.2*Math.sin(now/200))+')':'rgba(255,240,170,'+(.25+.2*Math.sin(now/180))+')';RR(g,sl.x+6,sl.y+6,sl.w-12,sl.h-12,20);g.fill();}
    if(can||st.over)shadowP(g,q.v,q.x,q.y,q.s,.08);
    pp(g,q.v,q.x,q.y,q.s,q.v.b+1,can||st.over?1:.35,q.p.ik,q.p.it,cs);
    if(G.tool==='rot'){var rx=q.x+q.v.w*q.s,ry=q.y;g.fillStyle='#3f86ff';g.beginPath();g.arc(rx,ry,13,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=2.5;g.stroke();g.fillStyle='#fff';g.font='800 16px KF,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('↻',rx,ry+1);}}
  if(G.back){var b=G.back,eb=Math.min(1,(now-b.t0)/170),qb=trayGeom(b.ti,now);if(eb>=1||!qb){G.back=null;if(qb)pp(g,qb.v,qb.x,qb.y,qb.s,qb.v.b+1,trayMoves(st,b.ti)>0||st.over?1:.35,qb.p.ik,qb.p.it,cs);}
    else{var s2=cs+(qb.s-cs)*eb;pp(g,qb.v,b.x+(qb.x-b.x)*eb,b.y+(qb.y-b.y)*eb,s2,qb.v.b+1,1,qb.p.ik,qb.p.it,cs);}}
  drawParts(g,now);
  if(d){var pq=st.tray[d.ti];if(pq){var vq=VARS[pq.v],tl2=pieceTL(d);shadowP(g,vq,tl2.x+cs*.12,tl2.y+cs*.18,cs,.16);pp(g,vq,tl2.x,tl2.y,cs,vq.b+1,1,pq.ik,pq.it);}}
  for(i=G.pops.length-1;i>=0;i--){var p=G.pops[i];e=(now-p.t0)/p.dur;if(e<0)continue;if(e>=1){G.pops.splice(i,1);continue;}
    var kind=p.kind||({'#8ce99a':'clean','#ffd43b':'gold','#ff922b':'combo'}[p.c])||'pts';
    var sc=p.big?(e<.18?1.35*Math.sin(e/.18*Math.PI/2)-(e/.18)*.35:1):1;g.save();g.globalAlpha=e<.75?1:(1-e)/.25;g.translate(p.x,p.y-e*(p.big?cs*.35:44));if(p.big)g.rotate(-.05);g.scale(sc,sc);
    (K.text||KITS.g.text)(g,p.t,p.size,kind);g.restore();}}

/* ---- частицы: брызги и искры (тип у темы), конфетти ---- */
function burst(cells,t0){if(calm())return;var K=kit(),pc=K.partCol||KITS.g.partCol;
  for(var i=0;i<cells.length;i++){var x=cells[i],col=pc(x.col),cx=LY.bx+((x.k&7)+.5)*LY.cs,cy=LY.by+((x.k>>3)+.5)*LY.cs,n=K.partN||5;
    for(var j=0;j<n;j++){var a=Math.random()*6.283,sp=70+Math.random()*190,star=j===n-1&&Math.random()<.7;
      G.parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-150,s:LY.cs*(star?.14:.07+Math.random()*.07),c:col,t:star?1:0,rot:Math.random()*6,w:(Math.random()-.5)*8,t0:t0+(x.dl||0)+120,life:.55+Math.random()*.3});}}
  if(G.parts.length>360)G.parts.splice(0,G.parts.length-360);}
function confetti(){if(calm()||!G)return;var K=kit(),P=K.conf||PALG,now=performance.now();
  for(var i=0;i<60;i++)G.parts.push({x:Math.random()*LY.W,y:-10,vx:(Math.random()-.5)*80,vy:40+Math.random()*120,gr:160,s:5+Math.random()*5,c:P[i%P.length],t:2,rot:Math.random()*6,w:(Math.random()-.5)*6,t0:now+Math.random()*500,life:2.2});kick();}
function drawParts(g,now){var K=kit(),part=K.part||KITS.g.part;
  for(var i=G.parts.length-1;i>=0;i--){var p=G.parts[i],t=(now-p.t0)/1000;if(t<0)continue;if(t>p.life){G.parts.splice(i,1);continue;}
    var a=1-t/p.life,x=p.x+p.vx*t,y=p.y+p.vy*t+(p.gr||560)*t*t;g.globalAlpha=a;
    if(p.t===2){g.save();g.translate(x,y);g.rotate(p.rot+p.w*t);g.fillStyle=p.c;RR(g,-p.s,-p.s*.6,p.s*2,p.s*1.2,p.s*.45);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(-p.s*.4,-p.s*.15,p.s*.25,0,7);g.fill();g.restore();}
    else{p.rot+=0;part(g,{t:p.t,s:p.s,c:p.c,rot:p.rot+p.w*t},x,y,a);}}
  g.globalAlpha=1;}

/* ---- огонёк серии: «×N» и три точки — сколько ходов серия ещё живёт ---- */
function comboSvg(n,left,K){var c=(K&&K.comboCol)||['#ffc21a','#ff9d00','#fffbe6','#e8475f','#ff3d6e'];var dots='';for(var i=0;i<3;i++)dots+='<circle cx="'+(22+i*13)+'" cy="74" r="4.2" fill="'+(i<left?c[4]:'#fff')+'" stroke="'+(i<left?'#fff':'#ffb3c4')+'" stroke-width="1.6"/>';
  return '<svg viewBox="0 0 70 80"><circle cx="35" cy="36" r="31" fill="'+c[1]+'" opacity=".25"/><circle cx="35" cy="34" r="31" fill="'+c[0]+'"/><circle cx="35" cy="34" r="26.5" fill="'+c[2]+'"/><circle cx="35" cy="34" r="23" fill="'+c[0]+'"/>'+
    [0,1,2,3,4,5,6,7].map(function(i){return '<path d="M35 34L'+(35+22*Math.cos(i*Math.PI/4)).toFixed(1)+' '+(34+22*Math.sin(i*Math.PI/4)).toFixed(1)+'" stroke="'+c[2]+'" stroke-width="2.4" opacity=".8"/>';}).join('')+
    '<text x="35" y="43" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="24" fill="#fff" stroke="'+c[3]+'" stroke-width="5" paint-order="stroke">×'+n+'</text>'+dots+'</svg>';}
function hud(){var el=DOC.getElementById('lkCombo');if(!on()||!G||!LY){if(el)el.className='';return;}
  if(!el){el=DOC.createElement('div');el.id='lkCombo';DOC.getElementById('field').appendChild(el);}
  var st=G.st,n=st.combo>1?st.combo:0;if(!n){el.className='';el.dataset.n='';return;}
  el.style.left=Math.round(Math.min(LY.W-72,LY.bx+LY.B+LY.fr-58))+'px';el.style.top=Math.round(Math.max(0,LY.by-LY.fr-40))+'px';
  var left=Math.max(0,3-(st.since||0)),key=n+'|'+left;if(el.dataset.n!==key){var bump=String(el.dataset.n||'').split('|')[0]!==String(n);var K0=kit();el.innerHTML=(K0.comboSvg||comboSvg)(n,left,K0);el.dataset.n=key;el.className='on';if(bump&&!calm()){void el.offsetWidth;el.className='on bump';}}}

/* ================= двор на фоне (по времени суток), герой меню ================= */
function tod(){var h=new Date().getHours();return h>=6&&h<18?'day':h>=18&&h<22?'eve':'night';}
var BGK='';
function yard(force){var app=DOC.getElementById('app');if(!app)return;if(!on()){if(BGK!=='old'){BGK='old';app.style.backgroundImage='url("'+svgUri(yardSvg())+'")';DOC.body.style.backgroundImage='';}return;}
  var K=kit(),t=tod(),key=K.id+'|'+t;if(!force&&BGK===key)return;BGK=key;var hc=DOC.documentElement.classList;['day','eve','night'].forEach(function(x){hc.toggle('tod-'+x,x===t);}); /* время суток: html.tod-day|tod-eve|tod-night */var s=(K.yard||KITS.g.yard)(t);
  var u=s?'url("'+svgUri(s)+'")':'none',dl='';try{dl=LK.dreamUrl?LK.dreamUrl(t):'';}catch(e){}if(dl)u=dl+','+u; /* K2: вещи «Двора мечты» слоем поверх двора */app.style.backgroundImage=u;DOC.body.style.backgroundImage=u;DOC.body.style.backgroundSize='cover';DOC.body.style.backgroundPosition='50% 100%';var hb=K.bgc||(t==='night'?'#27406e':t==='eve'?'#f0c9b0':'#bfe8f6');DOC.documentElement.style.setProperty('--bgc',hb);}
setInterval(function(){try{if(on())yard();}catch(e){}},600000);
// меню: маленькое поле в стиле темы с фигурой «в полёте» (вместо карманной игры; у «Карманной 90-х» — сама игра)
var HERO_P=['......','.33...','.3..5.','11.255','1442.5'];
function hero(cvh){var K=kit();if(K.hero)return K.hero(cvh);var d=DPR(),w=230,h=200;cvh.width=w*d;cvh.height=h*d;var g=cvh.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  var cs=27,n=6,fr=10,B=cs*n,x0=(w-B)/2-fr,y0=h-B*5/6-2*fr-6;g.save();g.translate(x0,y0);g.translate(B/2,B/2);g.rotate(-.05);g.translate(-B/2,-B/2);K.board(g,B,cs,fr);
  for(var r=0;r<5;r++)for(var c=0;c<6;c++){var ch=HERO_P[r][c],x=fr+c*cs,y=fr+(r+1)*cs;if(ch==='.')K.empty(g,x,y,cs,r,c);else{K.brick(g,x,y,cs,+ch);if(r===2&&c===4)(K.item||KITS.g.item)(g,1,x,y,cs);}}
  for(c=0;c<6;c++)K.empty(g,fr+c*cs,fr,cs,9,c);
  g.restore();
  // фигура над полем
  g.save();g.translate(w/2+40,30);g.rotate(.18);g.fillStyle='rgba(20,60,50,.12)';RR(g,-cs+4,10,cs*2,cs*2-4,cs*.3);g.fill();K.brick(g,-cs,-cs*.6,cs,7);K.brick(g,0,-cs*.6,cs,7);K.brick(g,0,cs*.4,cs,7);g.restore();
  g.save();g.translate(38,38);g.rotate(-.25);K.brick(g,-cs/2,-cs/2,cs,3);g.restore();}

/* ================= карта: дорожка через двор (SVG), уровни — «пуговицы», вывески глав с хозяином, места глав ================= */
var PLACE={
 yard:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#e8f7ef"/><ellipse cx="-14" cy="22" rx="34" ry="12" fill="#f1d9a8"/><path d="M-40 20h52" stroke="#c9a46a" stroke-width="3"/><path d="M18 -26l-12 48M46 -26l12 48M14 -26h36" stroke="#ff7a59" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M28-26v30M38-26v30" stroke="#7d8b8a" stroke-width="2"/><rect x="24" y="4" width="18" height="5" rx="2.5" fill="#ffd23a"/><circle cx="-26" cy="14" r="5" fill="#ff4f6a"/><rect x="-10" y="8" width="10" height="10" rx="2" fill="#3f86ff"/>',
 hall:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#eef1fb"/><rect x="-44" y="-30" width="88" height="70" fill="#f6cdb4"/><rect x="-28" y="-30" width="56" height="8" rx="3" fill="#fff"/><rect x="-16" y="-8" width="32" height="48" rx="3" fill="#2ec4b6"/><circle cx="10" cy="16" r="2.5" fill="#fff"/><rect x="-38" y="-16" width="14" height="16" rx="2" fill="#8fcbe8"/><rect x="24" y="-16" width="14" height="16" rx="2" fill="#8fcbe8"/><rect x="-6" y="-26" width="12" height="9" rx="2" fill="#163b3a"/><text x="0" y="-19" text-anchor="middle" font-family="KF" font-size="8" font-weight="800" fill="#fff">3</text>',
 shop:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#fff6e0"/><rect x="-52" y="-26" width="104" height="66" fill="#fff"/>'+[0,1,2,3,4,5,6].map(function(i){return '<path d="M'+(-52+i*15)+' -26h15l-3 12h-9z" fill="'+(i%2?'#fff':'#22bfae')+'"/>';}).join('')+'<rect x="-44" y="-6" width="44" height="34" rx="3" fill="#bfe6f7"/><rect x="10" y="-6" width="24" height="46" rx="3" fill="#ff9a2e"/><circle cx="-34" cy="18" r="6" fill="#ff4f6a"/><circle cx="-22" cy="18" r="6" fill="#ffc21a"/><circle cx="-10" cy="18" r="6" fill="#7cc93f"/>',
 garage:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#e8f7ef"/>'+[0,1,2].map(function(i){return '<rect x="'+(-50+i*34)+'" y="-20" width="32" height="50" rx="3" fill="'+['#7fd1c3','#ffd2a6','#b9c9ff'][i]+'"/><text x="'+(-34+i*34)+'" y="-6" text-anchor="middle" font-family="KF" font-size="11" font-weight="800" fill="#163b3a">'+(12+i)+'</text>';}).join('')+'<rect x="20" y="14" width="34" height="14" rx="6" fill="#ff4f6a"/><rect x="26" y="8" width="20" height="9" rx="4" fill="#ffd2c4"/><circle cx="28" cy="30" r="5" fill="#163b3a"/><circle cx="48" cy="30" r="5" fill="#163b3a"/>',
 school:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#e6f4ff"/><rect x="-46" y="-12" width="92" height="50" fill="#fff5e8"/><path d="M-54-12h108l-54-26z" fill="#ff7a59"/>'+[-34,-14,14,34].map(function(x){return '<rect x="'+(x-6)+'" y="0" width="12" height="16" rx="2" fill="#8fcbe8"/>';}).join('')+'<rect x="-7" y="18" width="14" height="20" rx="2" fill="#4d7cff"/><circle cx="0" cy="-20" r="7" fill="#fff" stroke="#163b3a" stroke-width="2"/>',
 dacha:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#eef9e2"/><rect x="-40" y="-8" width="50" height="40" fill="#ffe2b8"/><path d="M-46-6l30-24 30 24z" fill="#ff4f6a"/><rect x="-28" y="4" width="14" height="14" rx="2" fill="#8fcbe8"/><rect x="-6" y="12" width="10" height="20" rx="2" fill="#b9805a"/>'+[0,1,2,3,4].map(function(i){return '<rect x="'+(18+i*7)+'" y="8" width="5" height="26" rx="2" fill="#fff" stroke="#d7e4e0"/>';}).join('')+'<circle cx="34" cy="-16" r="12" fill="#7cc93f"/><circle cx="30" cy="-18" r="3" fill="#ff4f6a"/><circle cx="38" cy="-12" r="3" fill="#ff4f6a"/>',
 market:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#fff4ea"/><path d="M-50-20h100l-6-12h-88z" fill="#ff9a2e"/>'+[0,1,2,3,4].map(function(i){return '<path d="M'+(-50+i*20)+' -20a10 7 0 0 0 20 0z" fill="'+(i%2?'#fff':'#ff4f6a')+'"/>';}).join('')+'<rect x="-46" y="10" width="92" height="22" rx="4" fill="#c98f5a"/><circle cx="-30" cy="6" r="7" fill="#7cc93f"/><circle cx="-14" cy="6" r="7" fill="#ffc21a"/><circle cx="2" cy="6" r="7" fill="#ff4f6a"/><circle cx="18" cy="6" r="7" fill="#9b5de5"/><circle cx="34" cy="6" r="7" fill="#ff9a2e"/>',
 build:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#eef3f8"/><path d="M-30 36V-30h4V36zM-28-30h62v4h-62z" fill="#ffc21a"/><path d="M28-26v18" stroke="#7d8b8a" stroke-width="1.5"/><rect x="20" y="-8" width="16" height="10" rx="2" fill="#ff4f6a"/><rect x="-8" y="10" width="44" height="26" fill="#f6cdb4"/>'+[0,1,2].map(function(i){return '<rect x="'+(-4+i*14)+'" y="16" width="8" height="8" rx="1" fill="#8fcbe8"/>';}).join('')+'<rect x="-50" y="28" width="16" height="8" rx="2" fill="#ff4f6a"/><rect x="-48" y="22" width="16" height="7" rx="2" fill="#ffc21a"/>',
 park:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#e9f8ee"/><circle cx="-34" cy="-12" r="18" fill="#7cc93f"/><rect x="-36" y="4" width="4" height="22" fill="#8a6141"/><ellipse cx="14" cy="24" rx="34" ry="10" fill="#8fcbe8"/><rect x="11" y="-4" width="6" height="28" fill="#cfe0ea"/><path d="M14-6c-8-6-16 2-12 10M14-6c8-6 16 2 12 10" stroke="#8fcbe8" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="-50" y="26" width="30" height="5" rx="2" fill="#ff9a2e"/>',
 mira:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#eef4fb"/><rect x="-52" y="-30" width="40" height="60" fill="#f6cdb4"/><rect x="12" y="-24" width="40" height="54" fill="#bfe2d1"/>'+[0,1,2].map(function(i){return '<rect x="-46" y="'+(-24+i*16)+'" width="10" height="10" rx="2" fill="#8fcbe8"/><rect x="-28" y="'+(-24+i*16)+'" width="10" height="10" rx="2" fill="#8fcbe8"/><rect x="18" y="'+(-18+i*15)+'" width="10" height="10" rx="2" fill="#8fcbe8"/><rect x="34" y="'+(-18+i*15)+'" width="10" height="10" rx="2" fill="#8fcbe8"/>';}).join('')+'<rect x="-56" y="30" width="112" height="8" rx="3" fill="#cfe8ff"/><path d="M-50 33h20M-20 33h20M10 33h20M40 33h12" stroke="#fff" stroke-width="2"/><circle cx="-6" cy="-30" r="5" fill="#fff"/><circle cx="2" cy="-34" r="4" fill="#fff"/>',
 vokzal:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#fff6e8"/><rect x="-46" y="-12" width="92" height="44" fill="#ffd9a8"/><path d="M-52-12h104l-10-14h-84z" fill="#3f86ff"/><rect x="-10" y="-38" width="20" height="16" rx="3" fill="#ffd9a8"/><circle cx="0" cy="-30" r="5.5" fill="#fff" stroke="#163b3a" stroke-width="1.5"/><path d="M0-33v3h2.5" stroke="#163b3a" stroke-width="1.2" fill="none"/>'+[-34,-16,16,34].map(function(x){return '<rect x="'+(x-6)+'" y="-2" width="12" height="18" rx="6" fill="#8fcbe8"/>';}).join('')+'<rect x="-7" y="10" width="14" height="22" rx="2" fill="#b9805a"/><rect x="-56" y="34" width="112" height="4" fill="#7d8b8a"/>',
 fest:'<rect x="-60" y="-40" width="120" height="84" rx="12" fill="#fff0f6"/><path d="M-56-28q56 24 112 0" stroke="#7d8b8a" stroke-width="1.5" fill="none"/>'+[0,1,2,3,4,5,6].map(function(i){var x=-48+i*16,y=-28+Math.sin((i+.5)/7*Math.PI)*12;return '<path d="M'+x+' '+y+'l6 12 6-12z" fill="'+PALG[i]+'"/>';}).join('')+'<circle cx="-30" cy="10" r="11" fill="#ff4f6a"/><path d="M-30 21v16" stroke="#7d8b8a" stroke-width="1.5"/><circle cx="-12" cy="4" r="11" fill="#3f86ff"/><path d="M-12 15v22" stroke="#7d8b8a" stroke-width="1.5"/><circle cx="30" cy="14" r="20" fill="#ffc21a"/><path d="M18 14h24M30 2v24" stroke="#fff" stroke-width="3"/>'
};
var STARP='M40 7c2 0 3 1 4 3l8 16 18 3c4 1 5 5 2 8l-13 12 3 18c1 4-3 6-6 5l-16-9-16 9c-3 2-7-1-6-5l3-18-13-12c-3-3-2-7 2-8l18-3 8-16c1-2 2-3 4-3z';
function chA(ch){return typeof CH_A!=='undefined'&&CH_A[ch]?CH_A[ch]:ch*10+1;}
function chN(ch){return ch+1<CHAPTERS.length?chA(ch+1)-chA(ch):NLV-chA(ch)+1;}
function chOfL(n){if(typeof chOf==='function')return chOf(n);return Math.floor((n-1)/10);}
function mapHtml(){var K=kit();if(K.mapHtml)return K.mapHtml();var M=K.map||KITS.g.map,Wd=400,R=R0(5),NL=NLV,CH=CHAPTERS.length;
  var yOf=[],y=120,pts=[];for(var n=NL;n>=1;n--){if(n<NL&&chOfL(n)!==chOfL(n+1))y+=160;yOf[n]=y;y+=64;}var H=y+150;
  for(n=1;n<=NL;n++){var i=NL-n;pts[n]=[200+Math.sin(i*.62+.8)*110,yOf[n]];}
  var s='<svg class="lkmap" viewBox="0 0 '+Wd+' '+H+'" xmlns="http://www.w3.org/2000/svg"><defs>'+
   '<radialGradient id="mcr" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="'+M.crown[0]+'"/><stop offset=".5" stop-color="'+M.crown[1]+'"/><stop offset="1" stop-color="'+M.crown[2]+'"/></radialGradient>'+
   '<radialGradient id="mcur"><stop offset="0" stop-color="#fff2a8" stop-opacity=".95"/><stop offset="1" stop-color="#fff2a8" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="mjl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+M.cur[0]+'"/><stop offset=".55" stop-color="'+M.cur[1]+'"/><stop offset="1" stop-color="'+M.cur[2]+'"/></linearGradient>'+
   '<clipPath id="mcp0"><circle cx="0" cy="0" r="23"/></clipPath><clipPath id="mcps"><circle cx="-126" cy="0" r="24"/></clipPath></defs>';
  s+='<rect width="'+Wd+'" height="'+H+'" fill="'+M.bg+'"/>';
  if(M.stripe)for(var k=-10;k<Math.ceil(H/60)+10;k++)s+='<path d="M'+(k*60)+' 0l-'+(H*.4).toFixed(0)+' '+H+'h30l'+(H*.4).toFixed(0)+' -'+H+'z" fill="'+M.stripe+'" opacity=".55"/>';
  var d='M'+pts[NL][0]+' '+(pts[NL][1]-60);for(n=NL;n>=1;n--){var p0=n<NL?pts[n+1]:[pts[NL][0],pts[NL][1]-60],p1=pts[n];d+=' C'+p0[0]+' '+(p0[1]+26)+' '+p1[0]+' '+(p1[1]-26)+' '+p1[0]+' '+p1[1];}d+=' L'+pts[1][0]+' '+(H+10);
  s+='<path d="'+d+'" stroke="'+M.edge+'" stroke-width="58" fill="none" stroke-linecap="round" opacity=".6"/><path d="'+d+'" stroke="'+M.path+'" stroke-width="46" fill="none" stroke-linecap="round"/><path d="'+d+'" stroke="'+M.mid+'" stroke-width="20" fill="none" stroke-linecap="round" opacity=".7"/>';
  function crown(x,y,r){return '<circle cx="'+(x+r*.25)+'" cy="'+(y+r*.3)+'" r="'+r+'" fill="#1d4a2a" opacity=".22"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="url(#mcr)"/><circle cx="'+(x-r*.3)+'" cy="'+(y-r*.3)+'" r="'+(r*.35)+'" fill="#fff" opacity=".22"/>';}
  for(var t=0;t<H/260;t++){var side=t%2,yy=80+t*260+R()*80;s+=crown(side?370+R()*20:20+R()*16,yy,34+R()*12);}
  for(var f=0;f<H/22;f++){var fx=R()*Wd,fy=R()*H;s+='<circle cx="'+fx.toFixed(0)+'" cy="'+fy.toFixed(0)+'" r="3.4" fill="#fff" opacity=".9"/><circle cx="'+fx.toFixed(0)+'" cy="'+fy.toFixed(0)+'" r="1.3" fill="'+M.flower+'"/>';}
  // места глав (картинки) и вывески
  var tot=0,nl=nextLevel();
  for(var ch=0;ch<CH;ch++){var a=chA(ch),cn=chN(ch),lock=a>S.unlocked,stc=0;for(var q=a;q<a+cn;q++)stc+=S.lv[q]||0;tot+=stc;
    var hm=a+Math.floor(cn/2)-1,mid=(yOf[hm]+yOf[hm+1])/2,px=pts[hm][0]>200?90:310;
    s+='<g transform="translate('+px+' '+mid+')"'+(lock?' opacity=".55"':'')+'><rect x="-74" y="-54" width="148" height="108" rx="20" fill="#1d4a2a" opacity=".16" transform="translate(0 6)"/><rect x="-74" y="-54" width="148" height="108" rx="20" fill="#fff"/>'+(PLACE[CHAPTERS[ch].id]||PLACE.yard)+'</g>';
    var sy=ch>0?(yOf[a]+yOf[a-1])/2:yOf[1]+92,C=CHAPTERS[ch],cg=S.chest[ch]||0,sub=lock?T('откроется после «','opens after “')+chName(ch-1)+T('»','”'):'★ '+stc+T(' из ',' of ')+cn*3+(cg<CHEST.length?' · '+T('сундук за ','chest at ')+Math.round(CHEST[cg][0]*cn/10)+'★':' · '+T('сундуки открыты','chests open'));
    s+='<g transform="translate(200 '+sy+')"'+(lock?' opacity=".9"':'')+'><rect x="-160" y="-30" width="320" height="68" rx="34" fill="#1d4a2a" opacity=".16"/><rect x="-160" y="-34" width="320" height="68" rx="34" fill="#fff"/><circle cx="-126" cy="0" r="27" fill="'+(lock?'#cfd8d6':M.ring)+'"/><circle cx="-126" cy="0" r="24.5" fill="#fff"/><image clip-path="url(#mcps)" href="'+pURI(C.host,lock?'norm':'happy')+'" x="-150" y="-24" width="48" height="48"/>'+
      '<text x="-90" y="-5" font-family="KF,sans-serif" font-weight="800" font-size="20" fill="'+M.ink+'">'+(ch+1)+'. '+esc(chName(ch))+'</text><text x="-90" y="18" font-family="KF,sans-serif" font-weight="600" font-size="15" fill="'+M.ink2+'">'+esc(sub)+'</text>'+
      (lock?'<g transform="translate(134 0)"><rect x="-10" y="-4" width="20" height="16" rx="4" fill="#9fb2b0"/><path d="M-6-4v-5a6 6 0 0 1 12 0v5" stroke="#9fb2b0" stroke-width="3.4" fill="none"/></g>':'')+'</g>';}
  for(n=1;n<=NL;n++){var x=pts[n][0],y2=pts[n][1],done=!!S.lv[n],isCur=n===nl&&!S.lv[n],lk=n>S.unlocked,boss=n===NL||chOfL(n)!==chOfL(n+1);
    s+='<g data-l="'+n+'">';
    if(isCur){s+='<circle cx="'+x+'" cy="'+y2+'" r="64" fill="url(#mcur)"/><circle cx="'+x+'" cy="'+(y2+4)+'" r="34" fill="#1d4a2a" opacity=".18"/><circle cx="'+x+'" cy="'+y2+'" r="34" fill="url(#mjl)"/><circle cx="'+x+'" cy="'+y2+'" r="34" fill="none" stroke="#fff" stroke-width="5"/><ellipse cx="'+(x-6)+'" cy="'+(y2-17)+'" rx="18" ry="7" fill="#fff" opacity=".55"/><text x="'+x+'" y="'+(y2+10)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="28" fill="#fff">'+n+'</text>'+
      '<g transform="translate('+(x+(x>200?62:-62))+' '+(y2-34)+')"><circle r="29" fill="#1d4a2a" opacity=".16" transform="translate(0 4)"/><circle r="28" fill="'+M.ring+'"/><circle r="25" fill="#fff"/><image clip-path="url(#mcp0)" href="'+pURI(CHAPTERS[chOfL(n)].host,'happy')+'" x="-23" y="-23" width="46" height="46"/></g>';}
    else if(done){var stv=S.lv[n]||0;s+='<circle cx="'+x+'" cy="'+(y2+4)+'" r="25" fill="#1d4a2a" opacity=".16"/><circle cx="'+x+'" cy="'+y2+'" r="25" fill="#fff"/><circle cx="'+x+'" cy="'+y2+'" r="20" fill="'+M.done+'"/><text x="'+x+'" y="'+(y2+7)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="20" fill="'+M.doneTx+'">'+n+'</text>';
      for(var kk=0;kk<3;kk++)s+='<path transform="translate('+(x-17+kk*17-6.8)+' '+(y2+17+(kk===1?3:0))+') scale(.17)" d="'+STARP+'" fill="'+(kk<stv?'#ffc21a':'#dfe9e6')+'" stroke="#fff" stroke-width="7"/>';}
    else if(lk)s+='<circle cx="'+x+'" cy="'+y2+'" r="22" fill="rgba(255,255,255,.3)" stroke="#fff" stroke-width="3" stroke-dasharray="5 5"/><text x="'+x+'" y="'+(y2+7)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="700" font-size="19" fill="'+M.lockTx+'">'+n+'</text>';
    else s+='<circle cx="'+x+'" cy="'+(y2+4)+'" r="25" fill="#1d4a2a" opacity=".16"/><circle cx="'+x+'" cy="'+y2+'" r="25" fill="#fff"/><text x="'+x+'" y="'+(y2+7)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="20" fill="'+M.ink+'">'+n+'</text>';
    if(boss&&!isCur)s+='<g transform="translate('+(x+(x>200?-40:40))+' '+(y2+14)+') scale(.6)">'+'<circle r="20" fill="#fff"/><path d="M0-14c2 6 10 9 10 17a10 10 0 0 1-20 0c0-5 3-7 4-10 1 2 2 4 3 4-1-4 0-8 3-11z" fill="#ff6a3d"/></g>';
    s+='<circle cx="'+x+'" cy="'+y2+'" r="30" fill="transparent"/></g>';
}
  return {svg:s+'</svg>',tot:tot,y:function(n){return pts[n][1]/H;}};}
function esc(t){return String(t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
function openMap(){var ml=DOC.getElementById('mapList'),m=mapHtml();ml.innerHTML=m.svg;
  /* сведение (K2): вход в «Двор мечты» вверху карты нового вида */
  try{if(typeof openDream==='function'&&S.wins>0){ml.insertAdjacentHTML('afterbegin','<button class="trow lk-mapdream" id="mapDream"><span class="ic">🏡</span><span>'+T('Двор мечты: ','Dream yard: ')+dreamCnt()+'/'+DR_N+'</span><i>›</i></button>');
    DOC.getElementById('mapDream').onclick=function(e){e.stopPropagation();SND.tap();openDream();};}}catch(e){}
  var K=kit();ml.style.setProperty('--mapbg',(K.map||KITS.g.map).bg);
  DOC.getElementById('mapSub').textContent=W.innerWidth<430?'⭐ '+m.tot+' / '+NLV*3:T('Звёзд: ','Stars: ')+m.tot+' / '+NLV*3+' · '+rankName(rankOf(m.tot)); /* сведение: на телефоне короче — строка не обрезается */
  ml.onclick=function(e){var t=e.target;while(t&&t!==ml&&!(t.getAttribute&&t.getAttribute('data-l')))t=t.parentNode;if(!t||t===ml)return;var i=+t.getAttribute('data-l');
    if(i>S.unlocked){SND.no();toast(T('Сначала пройди предыдущие уровни','Finish the previous levels first'));return;}SND.tap();startLevel(i);};
  var nl=nextLevel();setTimeout(function(){var all=ml.querySelectorAll('svg'),svg=null,sh=0,q;for(q=0;q<all.length;q++){var hh=all[q].getBoundingClientRect().height;if(hh>sh){sh=hh;svg=all[q];}}/* сведение: самый высокий svg — карта (в строке «Двор мечты» свой значок) */if(!svg)return;var md=DOC.getElementById('mapDream');ml.scrollTop=Math.max(0,sh*m.y(nl)+(md?md.offsetHeight:0)-ml.clientHeight*.55);},30);}

/* ================= превью темы (картинка для окна «Оформление» и магазина) ================= */
var PV_P=['##..#.','#.###.','..#.##','20##..'];
function previewCanvas(id,w,h){var K=KITS[id]||KITS.g,t=BY[id]||BY.g,c=canvas(w*2,h*2),g=c.getContext('2d');g.scale(2,2);
  if(id==='classic'){var th=THB.yard;g.fillStyle='#9fd3ee';g.fillRect(0,0,w,h);var s=Math.floor((h-24)/4),x0=(w-s*6)/2,y0=(h-s*4)/2;g.fillStyle=th.fr[0];RR(g,x0-8,y0-8,s*6+16,s*4+16,12);g.fill();g.fillStyle=th.bg;g.fillRect(x0-2,y0-2,s*6+4,s*4+4);
    for(var r=0;r<4;r++)for(var q=0;q<6;q++){var ch=PV_P[r][q],x=x0+q*s,y=y0+r*s;if(ch==='#')drawBrick(g,x,y,s,1+((r*3+q)%13),th);else if(ch==='2')drawBrick(g,x,y,s,20,th);else if(ch==='0'){drawBrick(g,x,y,s,7,th);drawItem(g,1,x,y,s);}else drawEmpty(g,x,y,s,th);}return c;}
  if(K.preview)return K.preview(c,g,w,h),c;
  var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,t.prev.bg);gr.addColorStop(1,(K.prev&&K.prev.bg2)||t.prev.bg);g.fillStyle=gr;g.fillRect(0,0,w,h);
  var cs=Math.floor((h-30)/4),fr=Math.round(cs*.3),B=cs*6,bx=(w-B)/2,by=(h-cs*4)/2;g.save();g.translate(bx-fr,by-fr);
  K.board(g,B,cs,fr,cs*4);g.restore();
  for(var r2=0;r2<4;r2++)for(var q2=0;q2<6;q2++){var ch2=PV_P[r2][q2],x2=bx+q2*cs,y2=by+r2*cs;if(ch2==='.')K.empty(g,x2,y2,cs,r2,q2);else if(ch2==='2')K.brick(g,x2,y2,cs,20);else{K.brick(g,x2,y2,cs,ch2==='0'?7:1+((r2*3+q2)%8));if(ch2==='0')(K.item||KITS.g.item)(g,1,x2,y2,cs);}}
  return c;}

/* ================= THEME: выбор, открытие, окно «Оформление» ================= */
function apply(){var id=cur();if(W.LK_setCls)W.LK_setCls(id);clearCache();BGK='';
  if(typeof ICONS!=='undefined'){if(on())ICONS.scan(DOC.body);else ICONS.revert();}
  var K=kit();if(on()&&K.css&&!DOC.getElementById('lkcss-'+K.id)){var st=DOC.createElement('style');st.id='lkcss-'+K.id;st.textContent=K.css;DOC.head.appendChild(st);}
  try{yard(true);}catch(e){}
  try{if(G&&DOC.getElementById('scr-game').classList.contains('on')){layout();render();kick();if(typeof setHud==='function')setHud();}
    else if(DOC.getElementById('scr-menu').classList.contains('on'))renderMenu();else if(DOC.getElementById('scr-map').classList.contains('on'))W.openMap();else if(DOC.getElementById('scr-shop').classList.contains('on'))openShop();}catch(e){}}
function set(id){if(!BY[id]||!owned(id))return false;S.th=id;if(id!=='classic'&&id!=='retro')S.th0g=id;TRIAL=null;save();apply();try{STAT.ev('mod',{m:'theme',a:'set',k:id});}catch(e){}return true;}
function bought(payId){THEMES.forEach(function(t){if(t.unlock.t==='pay'&&t.unlock.pay===payId){thU()[t.id]=1;set(t.id);}});}
function grant(id,quiet){if(thU()[id])return false;thU()[id]=1;save();if(!quiet)setTimeout(function(){toast(T('🎨 Открыта тема «','🎨 New theme unlocked: “')+T(BY[id].ru,BY[id].en)+T('» — в «Оформлении»','” — see Looks'),3800);},600);return true;}
function check(){if(typeof S==='undefined')return;var got=0;THEMES.forEach(function(t){var u=t.unlock;if((u.t==='ads'||u.t==='rk')&&earned(t)&&!thU()[t.id]){grant(t.id);got++;}});return got;}
function buy(id,after){var t=BY[id];if(!t)return;var u=t.unlock;after=after||function(){open();};
  if(owned(id)){set(id);after();return;}
  if(u.t==='pay'){if(!(PAY.on&&PAY.item(u.pay))){toast(T('Покупки сейчас недоступны','Purchases are unavailable now'));return;}PAY.re=function(){after();};PAY.buy(u.pay);return;}
  if(u.t==='coins'){if(S.coins<u.c){SND.no();toast(T('Не хватает монет: нужно ','Not enough coins: need ')+u.c+' 💰');return;}
    modal('<h2>🎨 '+T('Тема «','Theme “')+T(t.ru,t.en)+T('»','”')+'</h2><p>'+T(t.d,t.de)+'</p><div class="row"><button class="btn green noenter" id="thYes">'+T('Открыть за ','Unlock for ')+u.c+' 💰</button><button class="btn" id="thNo">'+T('Отмена','Cancel')+'</button></div>');
    DOC.getElementById('thNo').onclick=function(){after();};
    DOC.getElementById('thYes').onclick=function(){if(S.coins<u.c)return;S.coins-=u.c;try{STAT.ev('spend',{k:'th:'+id,c:u.c});}catch(e){}thU()[id]=1;updCoins();SND.coin();set(id);toast(T('Новая тема: ','New theme: ')+T(t.ru,t.en));after();};return;}
  if(u.t==='ads'){if(!adOk()){toast(AD_FAIL);return;}try{STAT.place('theme');}catch(e){}showRewarded(function(){try{STAT.ev('thad',{th:id,n:Math.min(S.adTot|0,u.n)});}catch(e){}toast(T('Ролик засчитан: ','Video counted: ')+Math.min(S.adTot|0,u.n)+T(' из ',' of ')+u.n);check();after();},function(){after();},
    function(){try{STAT.ev('thad',{th:id,n:Math.min(S.adTot|0,u.n)});}catch(e){}check();return T('ролик засчитан: ','video counted: ')+Math.min(S.adTot|0,u.n)+T(' из ',' of ')+u.n;});return;} /* adt: поздний досмотр — всегда +1 к счётчику (S.adTot — в showRewarded), окна не трогаем */
  if(u.t==='rk'){toast(progress(id).txt,3500);return;}}
function trial(id){TRIAL=id&&BY[id]?id:null;apply();}
function open(back){try{STAT.screen('look');}catch(e){}if(typeof inGame==='function'&&inGame())YG.stop();var L0=list(),h='',ig=typeof inGame==='function'&&inGame();
  L0.forEach(function(t){var p=t.progress,bt;
    if(t.cur)bt='<button class="btn" disabled>✓ '+T('Выбрано','Selected')+'</button>';
    else if(t.owned)bt='<button class="btn green" data-th="set:'+t.id+'">'+T('Выбрать','Select')+'</button>';
    else if(t.unlock.t==='pay')bt=ig||!(PAY.on&&PAY.item(t.unlock.pay))?'<button class="btn" disabled>'+T('Покупка — в меню','Buy in the menu')+'</button>':'<button class="btn accent noenter" data-th="buy:'+t.id+'">'+PAY.price(PAY.item(t.unlock.pay))+'</button>';
    else if(t.unlock.t==='coins')bt='<button class="btn accent noenter" data-th="buy:'+t.id+'">'+t.unlock.c+' 💰</button>';
    else if(t.unlock.t==='ads')bt=adBtnOk()?'<button class="btn accent noenter adb" data-th="buy:'+t.id+'">📺 '+T('Смотреть ролик','Watch a video')+'</button>':'<button class="btn" disabled>'+T('Ролики — позже','Videos later')+'</button>';
    else bt='<button class="btn" disabled>'+T('Нужно больше ★','Need more ★')+'</button>';
    var bar=(t.unlock.t==='ads'||t.unlock.t==='rk')&&!t.owned?'<div class="chbar"><i style="width:'+Math.round(100*p.have/Math.max(1,p.need))+'%"></i><span>'+esc(p.txt)+'</span></div>':'<small>'+esc(t.owned?(t.id==='classic'?p.txt:T(BY[t.id].d,BY[t.id].de)):p.txt)+'</small>';
    var tr=!t.owned&&!ig&&typeof W.k3TryHtml==='function'?W.k3TryHtml(t):''; /* K3: «📺 Примерить на партию» */
    h+='<div class="thc'+(t.cur?' cur':'')+'" data-tc="'+t.id+'">'+(t.owned?'':'<span class="lock">🔒</span>')+'<b>'+esc(t.name)+'</b>'+bar+bt+tr+'</div>';});
  modal('<h2>🎨 '+T('Оформление','Looks')+'</h2><p>'+T('Вид двора, поля и кирпичиков. Новые темы открываются за звёзды, ролики, монеты или покупкой.','How the yard, board and bricks look. New themes open for stars, videos, coins or a purchase.')+'</p><div class="thgrid">'+h+'</div>'+
    '<button class="trow" id="thSkins"><span class="ic">🧱</span><span>'+T('Кирпичики: стена, ящики, домино…','Bricks: wall, crates, dominoes…')+'<small>'+T('сейчас: ','now: ')+esc(theme().id==='yard'?T('как в теме','theme bricks'):T(theme().n,theme().en))+'</small></span><i>›</i></button>'+
    '<div class="row"><button class="btn green" id="thClose">'+T('Готово','Done')+'</button></div>');
  var mc=DOC.getElementById('mcard');mc.querySelectorAll('[data-tc]').forEach(function(el){var cvp=previewCanvas(el.getAttribute('data-tc'),300,170);el.insertBefore(cvp,el.querySelector('b'));});
  mc.querySelectorAll('[data-th]').forEach(function(b){b.onclick=function(){var a=b.getAttribute('data-th').split(':');SND.tap();if(a[0]==='set'){set(a[1]);open(back);}else buy(a[1],function(){open(back);});};});
  if(typeof W.k3TryBind==='function')W.k3TryBind(mc);
  DOC.getElementById('thSkins').onclick=function(){hideModal();openShop();};
  DOC.getElementById('thClose').onclick=function(){hideModal();if(back)back();else if(ig)YG.start();};}

/* ---- миграция сохранения (один раз) и подготовка ---- */
function init(){if(typeof S==='undefined')return;if(!isO(S.thU))S.thU={};if(typeof S.adTot!=='number'||!isFinite(S.adTot))S.adTot=0;
  if(!S.lkV){if(S.theme==='retro'){if(!S.th)S.th='retro';S.theme=S.th0&&S.th0!=='retro'&&THB[S.th0]?S.th0:'yard';}
    if((S.wins||0)>0||(S.games||0)>0||(S.done||0)>0)S.lkOld=Date.now();S.lkV=1;}
  if(S.th==='classic'&&!owned('classic'))S.th='g';
  if(DEV!==W.LK_TH0)DEV=W.LK_TH0&&/[?&]theme=/.test(location.search)?W.LK_TH0:null;
  W.LK_setCls(cur());var K=kit();if(on()&&K.css&&!DOC.getElementById('lkcss-'+K.id)){var st=DOC.createElement('style');st.id='lkcss-'+K.id;st.textContent=K.css;DOC.head.appendChild(st);}}
var fontsOk=false;try{if(DOC.fonts&&DOC.fonts.load)Promise.all([DOC.fonts.load('800 30px KF','Чисто 0A'),DOC.fonts.load('600 20px KF','Чисто 0A')]).then(function(){fontsOk=true;clearCache();try{if(G)kick();}catch(e){}}).catch(function(){});}catch(e){}

W.THEME={list:list,owned:owned,cur:cur,set:set,get:function(id){return BY[id];},buy:buy,open:open,apply:apply,check:check,bought:bought,trial:trial,previewCanvas:previewCanvas,progress:progress,oldLeft:oldLeft,grant:grant,THEMES:THEMES};
W.LK={on:on,kit:kit,kits:KITS,reg:function(id,k){KITS[id]=k;},render:render,burst:burst,confetti:confetti,hud:hud,yard:yard,hero:hero,openMap:openMap,mapHtml:mapHtml,
  frK:function(){return kit().frK||.3;},clearCache:clearCache,init:init,sprite:sprite,put:put,putItem:putItem,PLACE:PLACE,yardG:yardG,jelly:jelly,RR:RR,mixHex:mixHex,rgba:rgba,R0:R0,ease:ease,clamp:clamp,svgUri:svgUri,STARP:STARP,comboSvg:comboSvg};
})();
