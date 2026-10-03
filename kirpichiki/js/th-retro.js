/* K1: тема «Карманная 90-х» (retro, бесплатная; заменяет прежний «Ретро-экран»). Макет — kirp-look/c-retro90.html.
   Весь экран — жёлтый корпус карманной игры, за ним — ковёр на стене; поле — ЖК (серо-зелёный) с бледными «выключенными» клетками
   и тенью-«призраком» у кирпичиков; предметы — пиксельные 8×8 инверсией; сбор — мигание инверсией и исчезновение «лесенкой»,
   квадратные искры; крупные слова — пиксельным шрифтом (растр из Rubik), очки — 7-сегментными цифрами; карта — меню картриджа «9999 в 1».
   Набор рисования KIT для js/look.js (LK.reg). Общие имена игры (S, LY, portrait, hostName, chName, CHAPTERS, CHEST, nextLevel, L) — только при вызове. */
(function(){
'use strict';
var DOC=document,LK=window.LK,RR=LK.RR;
var INK='#22301f',LCD='#b4c28f',GH='rgba(34,48,31,.13)',OFF='rgba(34,48,31,.08)';
function T(ru,en){return typeof L==='function'?L(ru,en):ru;}
function DPR(){return Math.min(2,window.devicePixelRatio||1);}
function cnv(w,h){var c=DOC.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
function esc(t){return String(t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
function fontOk(){try{return !DOC.fonts||!DOC.fonts.check||DOC.fonts.check('800 11px KF','ЧA');}catch(e){return true;}}

/* ---------- ЖК-кирпичик: рамка + квадрат, тень-«призрак»; col 20 — старый кирпич (шахматка) ---------- */
function brick(g,x,y,s,col){var old=col===20;
  g.fillStyle=GH;g.fillRect(x+s*.12,y+s*.14,s*.84,s*.84);
  g.fillStyle=INK;g.fillRect(x+s*.06,y+s*.06,s*.84,s*.84);g.fillStyle=LCD;g.fillRect(x+s*.17,y+s*.17,s*.62,s*.62);g.fillStyle=INK;
  if(old){for(var i=0;i<3;i++)for(var j=0;j<3;j++)if((i+j)%2===0)g.fillRect(x+s*(.24+i*.18),y+s*(.24+j*.18),s*.12,s*.12);}
  else g.fillRect(x+s*.27,y+s*.27,s*.42,s*.42);}
function empty(g,x,y,s){g.fillStyle='rgba(34,48,31,.065)';g.fillRect(x+s*.06,y+s*.06,s*.84,s*.84);g.fillStyle=LCD;g.fillRect(x+s*.17,y+s*.17,s*.62,s*.62);
  g.fillStyle='rgba(34,48,31,.055)';g.fillRect(x+s*.27,y+s*.27,s*.42,s*.42);}
// предметы — пиксели 8×8 инверсией: 1 яблоко, 2 банка, 3 звезда, 4 гайка
var PIX={1:['....#...','...#....','.##.##..','#######.','#######.','#######.','.#####..','..#.#...'],
 2:['.######.','..####..','.######.','#......#','#.####.#','#.####.#','#......#','.######.'],
 3:['...##...','...##...','########','.######.','..####..','.######.','.##..##.','##....##'],
 4:['..####..','.######.','###..###','##....##','##....##','###..###','.######.','..####..']};
function item(g,k,x,y,s){var P=PIX[k]||PIX[3];g.fillStyle=GH;g.fillRect(x+s*.12,y+s*.14,s*.84,s*.84);g.fillStyle=INK;g.fillRect(x+s*.06,y+s*.06,s*.84,s*.84);
  var p=s*.84/9.4;g.fillStyle=LCD;for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(P[r][c]==='#')g.fillRect(x+s*.06+p*(c+.7),y+s*.06+p*(r+.7),p*.92,p*.92);}

/* ---------- 7-сегментные цифры (неактивные сегменты — бледные «восьмёрки») ---------- */
var SEG={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abcdfg','-':'g',' ':''};
function segR(w,h,t){return {a:[t,0,w-2*t,t],b:[w-t,t,t,h/2-t*1.5],c:[w-t,h/2+t*.5,t,h/2-t*1.5],d:[t,h-t,w-2*t,t],e:[0,h/2+t*.5,t,h/2-t*1.5],f:[0,t,t,h/2-t*1.5],g:[t,h/2-t/2,w-2*t,t]};}
function segW(str,h){var w=h*.55,gap=h*.18,n=0;for(var i=0;i<str.length;i++)n+=str[i]==='/'?w*.8:w+gap;return n-gap;}
function seg7(g,str,x,y,h,col,off){var w=h*.55,t=h*.13,gap=h*.18,cx=x,S=segR(w,h,t);
  for(var i=0;i<str.length;i++){var ch=str[i];
    if(ch==='+'){g.fillStyle=col;g.fillRect(cx,y+h/2-t/2,w*.8,t);g.fillRect(cx+w*.4-t/2,y+h*.24,t,h*.52);cx+=w+gap;continue;}
    if(ch==='/'){g.fillStyle=col;g.beginPath();g.moveTo(cx+w*.55,y);g.lineTo(cx+w*.72,y);g.lineTo(cx+w*.12,y+h);g.lineTo(cx-w*.05,y+h);g.fill();cx+=w*.8;continue;}
    var on=SEG[ch];if(on==null)on='';for(var k in S){var r=S[k],a=on.indexOf(k)>=0;if(!a&&!off)continue;g.fillStyle=a?col:off;g.fillRect(cx+r[0],y+r[1],r[2],r[3]);}cx+=w+gap;}
  return cx;}
function seg7svg(str,x,y,h,col,off){var w=h*.55,t=h*.13,gap=h*.18,cx=x,S=segR(w,h,t),s='';
  for(var i=0;i<str.length;i++){var on=SEG[str[i]]||'';for(var k in S){var r=S[k],a=on.indexOf(k)>=0;if(!a&&!off)continue;
    s+='<rect x="'+(cx+r[0]).toFixed(1)+'" y="'+(y+r[1]).toFixed(1)+'" width="'+r[2].toFixed(1)+'" height="'+r[3].toFixed(1)+'" fill="'+(a?col:off)+'"/>';}cx+=w+gap;}
  return s;}

/* ---------- пиксельный шрифт: текст растрируется из Rubik 11 px по порогу и рисуется квадратиками ЖК ---------- */
var PT={},PTN=0;
function raster(str){var m=PT[str];if(m)return m;var c=cnv(8,14),cg=c.getContext('2d');cg.font='800 11px KF,sans-serif';var w=Math.ceil(cg.measureText(str).width)+2,h=14;c.width=w;
  cg=c.getContext('2d');cg.font='800 11px KF,sans-serif';cg.fillStyle='#000';cg.textBaseline='alphabetic';cg.fillText(str,1,11);
  var d=cg.getImageData(0,0,w,h).data;m={w:w,h:h,p:[]};for(var i=0;i<w*h;i++)if(d[i*4+3]>110)m.p.push(i);
  if(fontOk()){if(++PTN>120){PT={};PTN=1;}PT[str]=m;}return m;}
function ptext(g,str,x,y,px,align,col,ghost){var m=raster(str),W=m.w*px,x0=align==='c'?x-W/2:align==='r'?x-W:x,i;
  if(ghost!==false){g.fillStyle=GH;for(i=0;i<m.p.length;i++){var q=m.p[i];g.fillRect(x0+(q%m.w)*px+px*.28,y+((q/m.w)|0)*px+px*.28,px*.9,px*.9);}}
  g.fillStyle=col||INK;for(i=0;i<m.p.length;i++){var q2=m.p[i];g.fillRect(x0+(q2%m.w)*px,y+((q2/m.w)|0)*px,px*.9,px*.9);}return W;}
function pstar(g,x,y,px,on){var P=['...#...','..###..','#######','.#####.','..#.#..','.#...#.'];g.fillStyle=on?INK:'rgba(34,48,31,.18)';
  for(var r=0;r<6;r++)for(var c=0;c<7;c++)if(P[r][c]==='#')g.fillRect(x+c*px,y+r*px,px*.9,px*.9);}
function scan(g,x,y,w,h){var gr=g.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'rgba(255,255,255,.16)');gr.addColorStop(.35,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(0,0,0,.07)');
  g.fillStyle=gr;g.fillRect(x,y,w,h);g.fillStyle='rgba(34,48,31,.035)';for(var yy=y;yy<y+h;yy+=3)g.fillRect(x,yy,w,1);}

/* ---------- крупные слова: в кэш (одна картинка на слово и размер), на кадр — только drawImage ---------- */
var TX={},TXN=0;
function txtCanvas(t,size,kind){var key=t+'|'+Math.round(size)+'|'+kind,c=TX[key];if(c)return c;var d=DPR(),s=String(t).toUpperCase(),px,pad,w,h,g;
  if(/^[+\-0-9 ]+$/.test(s)){var hh=size*1.15;pad=Math.round(size*.22);w=segW(s,hh)+pad*2;h=hh+pad*2;c=cnv(w*d,h*d);g=c.getContext('2d');g.scale(d,d);
    g.fillStyle='rgba(180,194,143,.92)';g.fillRect(0,0,w,h);seg7(g,s,pad+hh*.1,pad+hh*.1,hh,GH,null);seg7(g,s,pad,pad,hh,INK,OFF);}
  else{var m=raster(s);px=Math.max(1.6,size/10);pad=Math.round(px*(kind==='combo'?2.2:3.4));w=m.w*px+pad*2;h=m.h*px+pad*1.6;c=cnv(w*d,h*d);g=c.getContext('2d');g.scale(d,d);
    g.fillStyle=LCD;g.fillRect(0,0,w,h);var b=Math.max(2,px*.7);g.fillStyle=INK;
    g.fillRect(0,0,w,b);g.fillRect(0,h-b,w,b);g.fillRect(0,0,b,h);g.fillRect(w-b,0,b,h);
    if(kind!=='combo'){var l=Math.max(1,px*.35),o=b+px*.6;g.fillRect(o,o,w-2*o,l);g.fillRect(o,h-o-l,w-2*o,l);if(kind==='gold'||kind==='rec'){g.fillRect(o,o,l,h-2*o);g.fillRect(w-o-l,o,l,h-2*o);}}
    ptext(g,s,w/2,(h-m.h*px)/2+px*.6,px,'c',INK);}
  c._w=w;c._h=h;if(fontOk()){if(++TXN>60){TX={};TXN=1;}TX[key]=c;}return c;}

/* ---------- ковёр на стене (вместо двора): ромбы, бордюр; вечером и ночью — темнее ---------- */
var YC={};
function carpet(tod){if(YC[tod])return YC[tod];
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice"><defs><pattern id="cp" width="96" height="96" patternUnits="userSpaceOnUse">'+
  '<rect width="96" height="96" fill="#7a1f24"/><path d="M48 4L92 48 48 92 4 48z" fill="#1f3a5f"/><path d="M48 14L82 48 48 82 14 48z" fill="#8e2a2a"/><path d="M48 26L70 48 48 70 26 48z" fill="#e8d3a2"/><path d="M48 36L60 48 48 60 36 48z" fill="#1f3a5f"/>'+
  '<path d="M48 4L92 48 48 92 4 48z" fill="none" stroke="#d9b45a" stroke-width="3"/><circle cx="0" cy="0" r="8" fill="#d9b45a"/><circle cx="96" cy="0" r="8" fill="#d9b45a"/><circle cx="0" cy="96" r="8" fill="#d9b45a"/><circle cx="96" cy="96" r="8" fill="#d9b45a"/>'+
  '<path d="M44 48h8M48 44v8" stroke="#7a1f24" stroke-width="3"/></pattern>'+
  '<pattern id="br" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#e8d3a2"/><path d="M0 12L12 0 24 12 12 24z" fill="#1f3a5f"/></pattern></defs>'+
  '<rect width="1200" height="800" fill="url(#cp)"/><rect x="0" y="0" width="1200" height="800" fill="none" stroke="url(#br)" stroke-width="40"/>'+
  '<rect width="1200" height="800" fill="'+(tod==='night'?'#0c0a18':tod==='eve'?'#2a0c06':'#000')+'" opacity="'+(tod==='night'?.42:tod==='eve'?.26:.16)+'"/></svg>';
  return YC[tod]=s;}

/* ---------- карта: меню картриджа «9999 в 1» на ЖК (главы списком, уровни — сеткой, курсор-треугольник) ---------- */
var MW=400;
function svgStar(x,y,px,col){var P=['...#...','..###..','#######','.#####.','..#.#..','.#...#.'],s='';for(var r=0;r<6;r++)for(var c=0;c<7;c++)if(P[r][c]==='#')s+='M'+(x+c*px).toFixed(1)+' '+(y+r*px).toFixed(1)+'h'+(px*.9).toFixed(1)+'v'+(px*.9).toFixed(1)+'h-'+(px*.9).toFixed(1)+'z';
  return '<path d="'+s+'" fill="'+col+'"/>';}
function tx(x,y,size,t,o){o=o||{};var a=o.a||'start',col=o.c||INK,w=o.w||800,at='text-anchor="'+a+'" font-family="KF,sans-serif" font-weight="'+w+'" font-size="'+size+'" letter-spacing="'+(o.ls||0)+'"';
  return (o.ghost===false?'':'<text x="'+(x+2)+'" y="'+(y+2)+'" '+at+' fill="'+GH+'">'+esc(t)+'</text>')+'<text x="'+x+'" y="'+y+'" '+at+' fill="'+col+'">'+esc(t)+'</text>';}
function mapHtml(){var NL=NLV,CH=CHAPTERS.length,nl=nextLevel(),curCh=Math.floor((Math.min(nl,NL)-1)/10),y,s='',yOf=[],tot=0,box=62,gap=(MW-28-5*box)/4;
  s+='<rect x="14" y="14" width="'+(MW-28)+'" height="54" fill="'+INK+'"/>'+tx(MW/2,49,21,T('КАРТРИДЖ 9999 В 1','CARTRIDGE 9999 IN 1'),{a:'middle',c:LCD,ls:2,ghost:false});
  y=88;
  for(var ch=0;ch<CH;ch++){var a=ch*10+1,lock=a>S.unlocked,stc=0,C=CHAPTERS[ch],q;for(q=a;q<a+10;q++)stc+=S.lv[q]||0;tot+=stc;var cur=ch===curCh&&!lock,hy=y;
    if(cur)s+='<rect x="14" y="'+hy+'" width="'+(MW-28)+'" height="50" fill="'+INK+'"/><path d="M20 '+(hy+15)+'l12 10-12 10z" fill="'+LCD+'"/>';
    var px0=cur?38:20;s+='<rect x="'+px0+'" y="'+(hy+3)+'" width="44" height="44" fill="'+LCD+'"'+(cur?'':' stroke="'+INK+'" stroke-width="2"')+'/><image href="'+LK.svgUri(portrait(C.host,lock?'norm':'happy'))+'" x="'+(px0+2)+'" y="'+(hy+5)+'" width="40" height="40" filter="url(#lcdf)"'+(lock?' opacity=".45"':'')+'/>';
    s+=tx(px0+54,hy+33,21,(ch+1)+'. '+chName(ch).toUpperCase(),{c:cur?LCD:lock?'rgba(34,48,31,.5)':INK,ls:.5,ghost:!cur});
    if(lock)s+=tx(MW-22,hy+32,16,T('ЗАКРЫТО','LOCKED'),{a:'end',c:'rgba(34,48,31,.55)',ls:1});
    else{var sv=String(stc);s+=seg7svg(sv,MW-58-segW(sv,26),hy+12,26,cur?LCD:INK,cur?'rgba(180,194,143,.16)':OFF)+svgStar(MW-48,hy+17,3.4,cur?LCD:INK);}
    y=hy+58;
    var cg=S.chest&&S.chest[ch]||0,sub=lock?T('откроется после «','opens after “')+chName(ch-1)+T('»','”'):hostName(C.host)+' · ★ '+stc+T(' из 30',' of 30')+(cg<CHEST.length?' · '+T('сундук ','chest ')+CHEST[cg][0]+'★':'');
    s+=tx(22,y+18,16,sub,{c:lock?'rgba(34,48,31,.62)':'#3e4c33',w:700,ghost:false});
    if(lock){y+=40;for(q=a;q<a+10;q++)yOf[q]=hy;s+='<rect x="14" y="'+(y-2)+'" width="'+(MW-28)+'" height="2" fill="rgba(34,48,31,.3)"/>';y+=14;continue;}
    y+=36;
    for(var k=0;k<10;k++){var n=a+k,r=(k/5)|0,c=k%5,bx=14+c*(box+gap),by=y+r*(box+14),done=!!S.lv[n],isCur=n===nl&&!done,lk=n>S.unlocked,boss=n%10===0,num=String(n),nh=24,nx=bx+box/2-segW(num,nh)/2;
      yOf[n]=by;s+='<g data-l="'+n+'">';
      if(isCur){s+='<rect x="'+(bx-4)+'" y="'+(by-4)+'" width="'+(box+8)+'" height="'+(box+8)+'" fill="none" stroke="'+INK+'" stroke-width="3"><animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></rect>'+
        '<rect x="'+bx+'" y="'+by+'" width="'+box+'" height="'+box+'" fill="'+INK+'"/>'+seg7svg(num,nx,by+10,nh,'#d4e0ad','rgba(180,194,143,.1)')+'<path d="M'+(bx+box/2-7)+' '+(by+42)+'h14l-7 9z" fill="'+LCD+'"/>';}
      else{var col=lk?'rgba(34,48,31,.28)':INK;
        s+='<rect x="'+(bx+3)+'" y="'+(by+3)+'" width="'+box+'" height="'+box+'" fill="'+GH+'"/><rect x="'+(bx+1.5)+'" y="'+(by+1.5)+'" width="'+(box-3)+'" height="'+(box-3)+'" fill="'+LCD+'" stroke="'+col+'" stroke-width="3"/>'+
          (boss&&!lk?'<rect x="'+(bx+6)+'" y="'+(by+6)+'" width="'+(box-12)+'" height="'+(box-12)+'" fill="none" stroke="'+INK+'" stroke-width="1.5"/>':'')+
          seg7svg(num,nx,by+(done?8:19),nh,col,lk?null:OFF);
        if(done)for(var st=0;st<3;st++)s+=svgStar(bx+6+st*17.5,by+box-16,2.2,st<(S.lv[n]||0)?INK:'rgba(34,48,31,.2)');}
      s+='<rect x="'+bx+'" y="'+by+'" width="'+box+'" height="'+box+'" fill="transparent"/></g>';}
    y+=2*(box+14)+4;s+='<rect x="14" y="'+(y-2)+'" width="'+(MW-28)+'" height="2" fill="rgba(34,48,31,.3)"/>';y+=16;}
  var H=y+20,a0=.5725,b0=.439;
  var head='<svg class="lkmap" viewBox="0 0 '+MW+' '+H+'" xmlns="http://www.w3.org/2000/svg"><defs><filter id="lcdf" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="'+
    [.3*a0,.55*a0,.15*a0,0,.133, .3*a0,.55*a0,.15*a0,0,.188, .3*b0,.55*b0,.15*b0,0,.122, 0,0,0,1,0].map(function(v){return +v.toFixed(4);}).join(' ')+'"/></filter>'+
    '<pattern id="scl" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="rgba(34,48,31,.04)"/></pattern></defs><rect width="'+MW+'" height="'+H+'" fill="'+LCD+'"/>';
  return {svg:head+s+'<rect width="'+MW+'" height="'+H+'" fill="url(#scl)" pointer-events="none"/></svg>',tot:tot,y:function(n){return ((yOf[n]||0)+30)/H;}};}

/* ---------- герой меню: экран карманной игры (рамка, ЖК, надпись, поле, счёт 7 сегментами) ---------- */
var HP=['......','......','.##...','.#..#.','##.###','#.####'];
function hero(cvh){var d=DPR(),w=230,h=200;cvh.width=w*d;cvh.height=h*d;var g=cvh.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  g.fillStyle='#b88400';RR(g,0,4,w,h-4,18);g.fill();g.fillStyle='#3a3f44';RR(g,0,0,w,h-4,18);g.fill();
  var lx=11,ly=11,lw=w-22,lh=h-38,i,r,c;g.fillStyle=LCD;g.fillRect(lx,ly,lw,lh);
  ptext(g,T('КИРПИЧИКИ','BRICKIES'),lx+lw/2,ly+5,1.55,'c');
  var cs=21,fx=lx+10,fy=ly+30;g.fillStyle=INK;g.fillRect(fx-4,fy-4,cs*6+8,2);g.fillRect(fx-4,fy+cs*6+2,cs*6+8,2);g.fillRect(fx-4,fy-4,2,cs*6+8);g.fillRect(fx+cs*6+2,fy-4,2,cs*6+8);
  for(r=0;r<6;r++)for(c=0;c<6;c++){if(HP[r][c]==='#')brick(g,fx+c*cs,fy+r*cs,cs,1);else empty(g,fx+c*cs,fy+r*cs,cs);}
  brick(g,fx+3*cs,fy,cs,1);brick(g,fx+3*cs,fy+cs,cs,1);brick(g,fx+4*cs,fy+cs,cs,1);item(g,1,fx+4*cs,fy+3*cs,cs);
  var ix=fx+cs*6+12;ptext(g,T('ОЧКИ','SCORE'),ix,fy,1.25);seg7(g,'240',ix,fy+20,22,INK,OFF);
  ptext(g,T('СЕРИЯ','STREAK'),ix,fy+56,1.25);seg7(g,'3',ix,fy+76,22,INK,OFF);
  for(i=0;i<3;i++)pstar(g,ix+i*15,fy+112,1.9,1);
  scan(g,lx,ly,lw,lh);
  g.fillStyle='#c9c2a8';g.font='800 12px KF,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('9999 '+T('В','IN')+' 1',w/2,h-15);}

/* ---------- превью в «Оформлении»: ковёр, жёлтый корпус, ЖК с кирпичиками ---------- */
var PV=['##..#.','#.###.','..#.##','20##..'];
function preview(c,g,w,h){var i,j;g.fillStyle='#7a1f24';g.fillRect(0,0,w,h);
  for(i=-1;i<w/40+1;i++)for(j=-1;j<h/40+1;j++){var cx=i*40+20,cy=j*40+20;g.fillStyle='#1f3a5f';g.beginPath();g.moveTo(cx,cy-18);g.lineTo(cx+18,cy);g.lineTo(cx,cy+18);g.lineTo(cx-18,cy);g.fill();
    g.fillStyle='#e8d3a2';g.beginPath();g.moveTo(cx,cy-8);g.lineTo(cx+8,cy);g.lineTo(cx,cy+8);g.lineTo(cx-8,cy);g.fill();}
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,0,w,h);
  var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#ffe57a');gr.addColorStop(.5,'#f8c719');gr.addColorStop(1,'#efb000');g.fillStyle='#b88400';RR(g,10,10,w-20,h-16,18);g.fill();g.fillStyle=gr;RR(g,10,8,w-20,h-18,18);g.fill();
  g.fillStyle='#3a3f44';RR(g,20,16,w-40,h-34,10);g.fill();g.fillStyle=LCD;g.fillRect(27,22,w-54,h-46);
  var cs=Math.floor((h-60)/4),bx=Math.round((w-cs*6)/2),by=26+Math.round((h-50-cs*4)/2);
  for(var r=0;r<4;r++)for(var q=0;q<6;q++){var ch=PV[r][q],x=bx+q*cs,y=by+r*cs;if(ch==='.')empty(g,x,y,cs);else if(ch==='2')brick(g,x,y,cs,20);else if(ch==='0')item(g,1,x,y,cs);else brick(g,x,y,cs,1);}
  scan(g,27,22,w-54,h-46);}

/* ---------- CSS темы: корпус, кнопки корпуса, ЖК-панели, окна на ЖК в рамке корпуса ---------- */
var P='html.lk.th-retro ';
var MONO='filter:grayscale(1) brightness(.58) contrast(1.5);mix-blend-mode:multiply';
var LITE='filter:grayscale(1) brightness(1.6);mix-blend-mode:normal';
var LCDP='background:#b4c28f;color:#22301f;box-shadow:inset 0 0 0 2px #22301f,inset 0 0 0 4px #b4c28f,inset 0 0 0 5px rgba(34,48,31,.35)';
var GR='background:linear-gradient(180deg,#6c727a,#2f3337);color:#f3ecd2;box-shadow:0 4px 0 #15181a,0 7px 12px rgba(0,0,0,.28),inset 0 2px 0 rgba(255,255,255,.22)';
var RED='background:linear-gradient(180deg,#ff7a6a 0%,#e0281c 58%,#b3170f 100%);color:#fff;box-shadow:0 5px 0 #7a0c08,0 8px 14px rgba(0,0,0,.28),inset 0 3px 0 rgba(255,255,255,.35)';
var YEL='background:linear-gradient(180deg,#fff0a0,#ffd23a 55%,#f2b705);color:#3a2600;box-shadow:0 4px 0 #9a6c00,0 0 0 2px #9a6c00,0 7px 12px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.7)';
var STEEL='background:linear-gradient(180deg,#8aa2bb,#4c6886 60%,#3a536e);color:#fff;box-shadow:0 4px 0 #22344a,0 7px 12px rgba(0,0,0,.28),inset 0 2px 0 rgba(255,255,255,.3)';
var BODY='background:linear-gradient(160deg,#ffe57a 0%,#f8c719 45%,#efb000 100%)';
var GRID='background-image:linear-gradient(rgba(180,194,143,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(180,194,143,.4) 1px,transparent 1px);background-size:4px 4px';
function css(){var cp=LK.svgUri(carpet('day'));return [
P+'{--ink:#22301f;--ink2:#3e4c33;--muted:#3e4c33;--card:#b4c28f;--card2:#a9b784;--line:#7e8c60;--glass:#b4c28f;--glass2:#b4c28f;--acc1:#fff0a0;--acc:#ffd23a;--acc2:#f2b705;'+
  '--good1:#ff7a6a;--good:#e0281c;--good2:#b3170f;--blue1:#8aa2bb;--blue:#4c6886;--blue2:#3a536e;--gold:#22301f;--gold2:#22301f;--red:#c41a12;--mint:#a9b784;--mintL:#7e8c60;'+
  '--sh:rgba(80,40,0,.3);--dim:rgba(40,8,10,.62);--bgc:#6e1c20;--r:24px}',
P+'body{background:#6e1c20 url("'+cp+'") 50% 100%/cover no-repeat}',
P+'#app{background-color:#6e1c20}',
// корпус: каждый экран — жёлтая карманная игра
P+'.screen{top:6px;right:6px;bottom:6px;left:6px;border-radius:34px 34px 46px 34px;'+BODY+';box-shadow:0 0 0 2px #b88400,0 14px 30px rgba(0,0,0,.55),inset 0 3px 0 rgba(255,255,255,.55),inset 0 -6px 0 rgba(150,95,0,.35);overflow:hidden}',
P+'#scr-game{'+BODY+'}',
P+'.gh,'+P+'#scr-map .gh{background:transparent;box-shadow:none;color:#8a5a00}',
P+'.gt>div:first-child{color:#8a5a00;text-shadow:0 1px 0 rgba(255,255,255,.6),0 -1px 0 rgba(120,70,0,.35);letter-spacing:.02em}',
P+'.gh .sub{color:#6e4600;text-shadow:0 1px 0 rgba(255,255,255,.5)}',
// кнопки корпуса
P+'.icon{'+GR+';border-radius:50%;--ink:#f3ecd2}',
P+'.icon:active{transform:translateY(3px);box-shadow:0 1px 0 #15181a,inset 0 2px 0 rgba(255,255,255,.2)}',
P+'.pill{background:#b4c28f;color:#22301f;border-radius:10px;box-shadow:0 0 0 5px #2f3337,inset 0 2px 4px rgba(0,0,0,.25);font-variant-numeric:tabular-nums;letter-spacing:.03em;margin:0 3px 0 7px}',
P+'.pill.sm{padding:4px 9px 4px 4px;min-height:48px}',P+'.pill.sm lk-i{width:26px;height:26px;margin-right:3px}',P+'.gh>*+*{margin-left:6px}',
P+'.pill lk-i svg,'+P+'.chip lk-i svg,'+P+'.chip img{'+MONO+'}',
P+'.chip lk-i,'+P+'.chip img{background:transparent}',
P+'.btn{'+GR+';border-radius:26px;font-weight:800;letter-spacing:.01em;text-shadow:none}',
P+'.btn:active{transform:translateY(3px);box-shadow:0 1px 0 #15181a,0 2px 4px rgba(0,0,0,.2)}',
P+'.btn.green{'+RED+';text-shadow:0 1px 2px rgba(0,0,0,.3)}',
P+'.btn.accent{'+YEL+';text-shadow:0 1px 0 rgba(255,255,255,.5)}',
P+'.btn.blue{'+STEEL+';text-shadow:0 1px 2px rgba(0,0,0,.3)}',
P+'.btn.green:active,'+P+'.btn.blue:active,'+P+'.btn.accent:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.4)}',
P+'.btn[disabled]{opacity:.55}',
P+'.btn small{color:inherit}',
P+'.helpers .btn{padding:6px 2px;letter-spacing:0;border-radius:18px}',
P+'.btn .dot{background:radial-gradient(circle at 35% 35%,#ff9a9a,#e01010);box-shadow:0 0 0 2px #2f3337,0 0 8px #ff3030}',
// меню
P+'.today lk-i svg,'+P+'.kcard lk-i svg,'+P+'.card lk-i svg,'+P+'.tip lk-i svg,'+P+'.gban lk-i svg,'+P+'.gban img,'+P+'.hud lk-i svg,'+P+'.toast lk-i svg{'+MONO+'}',
P+'.logo{color:#a06a00;letter-spacing:.08em;text-transform:uppercase;font-size:23px;text-shadow:0 1px 0 rgba(255,255,255,.6),0 -1px 0 rgba(120,70,0,.4)}',
P+'.logo small{color:#8a5a00;letter-spacing:.2em;font-size:15px;text-shadow:0 1px 0 rgba(255,255,255,.55)}',
P+'.logo>lk-i{display:none}',
P+'.hsay{background:#b4c28f;color:#22301f;border-radius:8px;box-shadow:0 0 0 3px #22301f,0 0 0 7px #3a3f44,0 8px 16px rgba(0,0,0,.25);margin-left:7px}',
P+'.hsay b{color:#22301f;text-transform:uppercase;letter-spacing:.06em}',
P+'.hface,'+P+'.hav,'+P+'.card .av{background:#b4c28f;border-radius:14px;padding:4px;box-shadow:0 0 0 5px #3a3f44,0 6px 14px rgba(0,0,0,.3)}',
P+'.hface{margin:5px 0 0 5px}',
P+'.hface svg,'+P+'.hav svg,'+P+'.card .av svg{border-radius:8px;border:0;background:transparent;'+MONO+'}',
P+'.hface:after,'+P+'.hav:after,'+P+'.card .av:after{content:"";position:absolute;left:4px;top:4px;right:4px;bottom:4px;border-radius:8px;pointer-events:none;'+GRID+'}',
P+'.hav{position:relative;margin-left:4px}',
P+'.card .av{border-radius:18px}',
P+'.big{border-radius:40px;letter-spacing:.01em}',
P+'#bPlay{'+RED+'}',
P+'#bEnd{'+GR+'}',
P+'#bDaily{'+STEEL+'}',
P+'.big .ic{background:rgba(0,0,0,.18);box-shadow:inset 0 2px 4px rgba(0,0,0,.3),0 1px 0 rgba(255,255,255,.25)}',
P+'.nrow .btn{'+GR+';border-radius:20px}',
P+'.nrow .btn small{color:#f3ecd2}',
P+'.today,'+P+'.kcard{background:#b4c28f;border-radius:12px;box-shadow:0 0 0 7px #3a3f44,0 0 0 9px #b88400,0 10px 20px rgba(0,0,0,.25);margin:20px 9px 9px}',
P+'.today h3,'+P+'.kcard h3{color:#22301f;text-transform:uppercase;letter-spacing:.06em;font-size:18px}',
P+'.trow{background:transparent;color:#22301f;border-radius:6px;box-shadow:inset 0 0 0 2px #22301f}',
P+'.trow .ic{background:transparent;border-radius:4px;box-shadow:inset 0 0 0 2px rgba(34,48,31,.5)}',
P+'.trow small{color:#3e4c33}',P+'.trow i{color:#22301f}',
P+'.trow.hot{background:#22301f;color:#d4e0ad;box-shadow:none}',
P+'.trow.hot small,'+P+'.trow.hot i{color:#d4e0ad}',
P+'.trow.hot .ic{background:#b4c28f}',
P+'.trow.hot lk-i svg{'+LITE+'}',P+'.trow.hot .ic lk-i svg{'+MONO+'}',
P+'.card .btn lk-i svg,'+P+'.today .btn lk-i svg,'+P+'.kcard .btn lk-i svg{filter:none;mix-blend-mode:normal}',
// игра
P+'.hud{background:#b4c28f;border-radius:10px;margin:2px 14px 12px;box-shadow:0 0 0 7px #3a3f44,0 0 0 9px rgba(184,132,0,.6),inset 0 2px 6px rgba(0,0,0,.15)}',
P+'.chip{background:transparent;box-shadow:inset 0 0 0 2px rgba(34,48,31,.55);border-radius:8px;color:#22301f}',
P+'.chip.ok{background:#22301f;color:#d4e0ad;box-shadow:none}',
P+'.chip.ok lk-i svg,'+P+'.chip.ok img{'+LITE+'}',
P+'.scl{color:#22301f;text-shadow:2px 2px 0 rgba(34,48,31,.13);font-variant-numeric:tabular-nums}',
P+'.scl small{color:#3e4c33}',
P+'.movesl{color:#3e4c33;text-shadow:none}',
P+'.bub{background:#b4c28f;color:#22301f;border-radius:6px;box-shadow:inset 0 0 0 3px #22301f;text-transform:uppercase;letter-spacing:.02em;font-weight:800;font-size:16.5px}',
P+'.bub::before{border-right-color:#22301f}',
P+'.field{margin:0 8px 12px}',
P+'.tip{'+LCDP+';border-radius:6px}',
P+'.gban{'+LCDP+';border-radius:6px;box-shadow:inset 0 0 0 3px #22301f,inset 0 0 0 6px #b4c28f,inset 0 0 0 7.5px #22301f,0 10px 24px rgba(0,0,0,.35)}',
P+'.gban b,'+P+'.gban span{color:#22301f;text-transform:uppercase;letter-spacing:.04em}',
P+'.boost{padding:4px 6px 10px}',
P+'.boost button{background:transparent;box-shadow:none;border-radius:0;min-height:94px;max-width:104px;color:#7a4f00;padding:0 0 2px;overflow:visible}',
P+'.boost button lk-i{width:60px;height:60px;padding:15px;border-radius:50%;margin:0 auto 6px;background:radial-gradient(circle at 40% 30%,#6c727a,#2b2f33 70%)!important;box-shadow:0 5px 0 #15181a,0 8px 12px rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.25)}',
P+'.boost button[data-b=rot] lk-i{width:66px;height:66px;padding:16px;margin-top:-6px;background:radial-gradient(circle at 40% 30%,#ff6a5a,#c41a12 70%)!important;box-shadow:0 6px 0 #7a0c08,0 10px 14px rgba(0,0,0,.35),inset 0 3px 0 rgba(255,255,255,.35)}',
P+'.boost button lk-i svg{filter:brightness(0) invert(.94)}',
P+'.boost button:active lk-i{-webkit-transform:translateY(4px);transform:translateY(4px);box-shadow:0 1px 0 #15181a,0 2px 4px rgba(0,0,0,.3)}',
P+'.boost button small{font-size:15px;font-weight:800;color:#7a4f00;text-shadow:0 1px 0 rgba(255,255,255,.55);white-space:nowrap}',
P+'.boost button i{background:#b4c28f;color:#22301f;border:2px solid #2f3337;border-radius:6px;box-shadow:none;top:-6px;right:50%;margin-right:-46px;height:28px;line-height:24px;min-width:30px;padding:0 5px;font-size:16px}',
P+'.boost button i.free{background:#22301f;color:#d4e0ad}',
P+'.boost button.on{background:transparent;box-shadow:none}',
P+'.boost button.on lk-i{box-shadow:0 0 0 4px #b4c28f,0 0 0 7px #22301f,0 5px 0 4px #15181a}',
P+'.boost button[disabled]{opacity:.5}',
// карта
P+'#scr-map .map-scroll{border:9px solid #3a3f44;border-radius:14px 14px 34px 14px;margin:2px 10px 12px;box-shadow:0 0 0 2px #b88400,inset 0 3px 8px rgba(0,0,0,.25)}',
// окна — ЖК в рамке корпуса
P+'.card{background:#b4c28f;color:#22301f;border-radius:20px;border:9px solid #f5c518;box-shadow:inset 0 0 0 7px #3a3f44,inset 0 0 0 9px rgba(0,0,0,.25),0 0 0 2px #b88400,0 30px 60px rgba(0,0,0,.5);padding:24px 22px 20px}',
P+'.card.hasav{padding-top:6px}',P+'.card.hasav:before{background:none}',
P+'.card.hasav .av{margin-top:18px}',
P+'.card h2{color:#22301f;text-shadow:2px 2px 0 rgba(34,48,31,.13);letter-spacing:.02em}',
P+'.card p{color:#2f3d29}',P+'.card p b{color:#22301f}',
P+'.card.win:after{background:radial-gradient(circle,rgba(34,48,31,.1) 0,rgba(34,48,31,0) 60%)}',
'@supports (background:repeating-conic-gradient(red 0 1deg,blue 1deg 2deg)){'+P+'.card.win:after{background:repeating-conic-gradient(from 0deg,rgba(34,48,31,.09) 0 9deg,rgba(34,48,31,0) 9deg 20deg)}}',
P+'.big-stars{color:#22301f}',P+'.big-stars .e{color:rgba(34,48,31,.25)}',
P+'.big-stars lk-i svg{filter:grayscale(1) brightness(.45) contrast(2);mix-blend-mode:multiply}',
P+'.coins-won{color:#22301f!important;font-variant-numeric:tabular-nums}',
P+'.quote,'+P+'.plq,'+P+'.goal.tipl,'+P+'.plq.ok,'+P+'.goal.tmrw,'+P+'.plq.info,'+P+'.plq.gold{background:transparent;color:#22301f!important;border-radius:6px;box-shadow:inset 0 0 0 2px rgba(34,48,31,.6)}',
P+'.plq.warn{background:#22301f;color:#d4e0ad!important;box-shadow:none;border-radius:6px}',
P+'.plq.warn lk-i svg{'+LITE+'}',
P+'.goal{color:#22301f!important}',
P+'.bigsc{color:#22301f;font-variant-numeric:tabular-nums;text-shadow:3px 3px 0 rgba(34,48,31,.13)}',
P+'.rec{background:#22301f;color:#d4e0ad;border-radius:6px;box-shadow:none}',
P+'.aw{background:transparent;color:#22301f;border-radius:6px;box-shadow:inset 0 0 0 2px #22301f}',
P+'.aw.new{background:#22301f;color:#d4e0ad;box-shadow:none}',
P+'.aw.new lk-i svg{'+LITE+'}',
P+'.chbar{background:#9aa877;border-radius:4px;box-shadow:inset 0 0 0 2px #22301f}',
P+'.chbar i{border-radius:2px;background:repeating-linear-gradient(90deg,#22301f 0,#22301f 9px,rgba(34,48,31,0) 9px,rgba(34,48,31,0) 12px);margin:3px}',
P+'.chbar span{color:#f4f7e6;text-shadow:0 0 2px #22301f,0 0 2px #22301f,0 0 3px #22301f}',
P+'.set{background:transparent;color:#22301f;border-radius:8px;box-shadow:inset 0 0 0 2px #22301f}',
P+'.set small{color:#3e4c33}',
P+'.set i{background:#22301f;color:#d4e0ad;border-radius:6px;box-shadow:none;text-transform:uppercase;letter-spacing:.05em}',
P+'.set i.off{background:transparent;color:#3e4c33;box-shadow:inset 0 0 0 2px rgba(34,48,31,.5)}',
P+'.set i.go{background:transparent;color:#22301f}',
P+'.pay h3{color:#22301f;text-transform:uppercase;letter-spacing:.05em}',
P+'.sd{background:transparent;color:#22301f;border-radius:6px;box-shadow:inset 0 0 0 2px rgba(34,48,31,.6)}',
P+'.sd small{color:#3e4c33}',
P+'.sd.done{background:#22301f;color:#d4e0ad}',P+'.sd.done small,'+P+'.sd.done::after{color:#d4e0ad}',
P+'.sd.done lk-i svg{'+LITE+'}',
P+'.sd.today,'+P+'.sd.d7.today{'+RED+';border-radius:8px}',P+'.sd.today small{color:#fff}',
P+'.sd.today lk-i svg{filter:none;mix-blend-mode:normal}',
P+'.sd.d7{background:transparent;box-shadow:inset 0 0 0 3px #22301f}',
P+'.tabs2 button{'+GR+';border-radius:12px}',P+'.tabs2 button.on{'+RED+'}',
P+'.lbr{color:#22301f}',P+'.lbr.me{background:#22301f;color:#d4e0ad}',
P+'.rk{background:transparent;color:#2f3d29;border-radius:6px;box-shadow:inset 0 0 0 2px rgba(34,48,31,.35)}',
P+'.rk.cur{background:#22301f;color:#d4e0ad;box-shadow:none}',P+'.rk.done{color:#22301f}',
P+'.rk.cur lk-i svg{'+LITE+'}',
P+'.pan{background:transparent;border-radius:8px;box-shadow:inset 0 0 0 2px #22301f}',P+'.pan small{color:#22301f}',P+'.pan i{color:#22301f}',
P+'.pan img{'+MONO+'}',
P+'.week .wd{background:transparent;color:#3e4c33;border-radius:6px;box-shadow:inset 0 0 0 2px rgba(34,48,31,.4)}',
P+'.week .wd.done{background:#22301f;color:#d4e0ad}',P+'.week .wd.today{box-shadow:inset 0 0 0 3px #c41a12}',
P+'.toast{background:#b4c28f;color:#22301f;border-radius:8px;box-shadow:0 0 0 5px #3a3f44,0 10px 24px rgba(0,0,0,.35)}',
P+'.card .soc-o{background:transparent;color:#22301f;box-shadow:inset 0 0 0 2px rgba(34,48,31,.6);border-radius:8px}',
P+'.about,'+P+'.how p{color:#22301f}',
// сетки: «Оформление», магазин кирпичиков
P+'.thc,'+P+'.it{background:#a9b784;border-radius:10px;box-shadow:inset 0 0 0 2px #22301f}',
P+'.thc canvas,'+P+'.it canvas{border-radius:6px}',
P+'.thc b,'+P+'.it b{color:#22301f}',P+'.thc small,'+P+'.it small{color:#2f3d29}',
P+'.thc.cur,'+P+'.it.on{box-shadow:inset 0 0 0 2px #22301f,0 0 0 4px #c41a12}',
P+'.thc .lock{background:#b4c28f;box-shadow:0 0 0 2px #22301f;border-radius:6px}',
P+'.shop-pay{background:#b4c28f;border-radius:12px;box-shadow:0 0 0 6px #3a3f44}',
'@media (max-height:680px){'+P+'.boost button{min-height:78px}'+P+'.boost button lk-i{width:50px;height:50px;padding:12px;margin-bottom:4px}'+P+'.boost button[data-b=rot] lk-i{width:56px;height:56px;padding:14px;margin-top:-4px}}',
'@media (max-width:370px){'+P+'.boost button small{font-size:15px;letter-spacing:-.4px}'+P+'.logo{font-size:16px;letter-spacing:.04em}'+P+'.logo small{letter-spacing:.1em}}',
'@media (min-width:371px) and (max-width:430px){'+P+'.logo{font-size:19px;letter-spacing:.05em}}'
].join('\n');}

/* ---------- набор ---------- */
LK.reg('retro',{
  id:'retro',
  pal:['#22301f','#2a3826','#22301f','#2f3d29','#22301f','#26341f','#22301f','#2d3a28'],
  frK:.32,
  brick:brick,
  // рамка поля линией (ЖК под ней рисует tray — он идёт первым)
  board:function(g,B,cs,fr,Bh){var S=B+2*fr,H=(Bh||B)+2*fr,o=Math.max(2,fr*.42),t=Math.max(2,Math.round(cs*.07));
    g.fillStyle=INK;
    g.fillRect(o,o,S-2*o,t);g.fillRect(o,H-o-t,S-2*o,t);g.fillRect(o,o,t,H-2*o);g.fillRect(S-o-t,o,t,H-2*o);},
  empty:function(g,x,y,cs){empty(g,x,y,cs);},
  item:item,
  // подложка всего холста поля (вызывается первой): графитовая рамка экрана, ЖК, «стекло» и строки ЖК, линия над лотком
  tray:function(g,x,y,w,h,Y){if(!Y||!Y.W){g.fillStyle=LCD;g.fillRect(x,y,w,h);return;}
    var W=Y.W,H=Y.H,b=8;g.fillStyle='#3a3f44';RR(g,0,0,W,H,16);g.fill();
    g.fillStyle=LCD;g.fillRect(b,b,W-2*b,H-2*b);scan(g,b,b,W-2*b,H-2*b);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(b,b,W-2*b,3);
    g.fillStyle=INK;if(Y.land)g.fillRect(Y.slots[0].x-6,b+10,2,H-2*b-20);else g.fillRect(b+10,Y.slots[0].y-5,W-2*b-20,2);},
  traySel:'rgba(34,48,31,.14)',
  // сбор: мигание инверсией 3 раза → гаснет «лесенкой» (квадрат меньше в три шага)
  fx:function(g,x,y,cs,col,it,e,draw){
    if(e<.46){if(Math.floor(e/.077)%2===0){g.fillStyle=INK;g.fillRect(x+cs*.03,y+cs*.03,cs*.94,cs*.94);g.fillStyle=LCD;g.fillRect(x+cs*.27,y+cs*.27,cs*.46,cs*.46);}else draw(x,y);return;}
    var q=(e-.46)/.34;if(q>=1)return;var k=[.84,.56,.28][Math.min(2,Math.floor(q*3))],m=(cs-cs*k)/2;
    g.fillStyle=INK;g.fillRect(x+m,y+m,cs*k,cs*k);if(k>.5){g.fillStyle=LCD;g.fillRect(x+m+cs*k*.22,y+m+cs*k*.22,cs*k*.56,cs*k*.56);}},
  fxMs:720,
  partCol:function(){return INK;},partN:3,
  // частицы: квадратные пиксели по сетке ЖК, искра — «плюс» из пикселей
  part:function(g,p,x,y){var z=Math.max(2,Math.round(p.s*1.3));x=Math.round(x/z)*z;y=Math.round(y/z)*z;g.fillStyle=INK;
    if(p.t===1){g.fillRect(x-z*1.5,y-z*.5,z*3,z);g.fillRect(x-z*.5,y-z*1.5,z,z*3);return;}
    g.fillRect(x-z/2,y-z/2,z,z);},
  text:function(g,t,size,kind){var c=txtCanvas(t,size,kind);g.drawImage(c,-c._w/2,-c._h/2,c._w,c._h);},
  conf:['#22301f','#2f3d29','#22301f','#3e4c33','#22301f'],
  comboCol:['#22301f','#22301f','#b4c28f','#22301f','#22301f'],
  yard:carpet,bgc:'#6e1c20',
  map:{bg:LCD,stripe:null,edge:'#8c9a6c',path:'#a9b784',mid:LCD,crown:['#8c9a6c','#5d6b47','#22301f'],ink:INK,ink2:'#3e4c33',done:LCD,doneTx:INK,cur:[INK,INK,INK],lockTx:'#5d6b47',flower:INK,ring:INK},
  mapHtml:mapHtml,
  hero:hero,preview:preview,
  prev:{bg:'#7a1f24',bg2:'#7a1f24'},
  css:css()
});
})();
