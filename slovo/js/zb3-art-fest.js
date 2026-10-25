'use strict';
/* zb3-art-fest — праздничные слои двора (поток SKIN; СОБРАН z3-skin-tools/art_port.py из festfx.js — руками не править).
   Грузится лениво из js/zb3-art-yard.js, только когда Z3.fest() не пуст. Изометрия — Z3ART.iso (из рисунка двора). */
(function(){var A=window.Z3ART;if(!A||!A.iso||A.festOn)return;A.festOn=1;var I=A.iso,P=I.P,faceL=I.faceL,faceR=I.faceR,ground=I.ground,box=I.box,poly=I.poly,line=I.line,pts=I.pts,HOUSE=I.HOUSE,KIT=I.KIT,COLS=I.COLS;
  var seed=7;function RS(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  /* ===== ПРАЗДНИКИ двора (SKIN, этап 5): слои по датам общего календаря FEST (js/fest.js; второго календаря нет).
     Z3ART.fest() → ключи слоёв из FEST.list(true): ny (ny/kan/sng — Новый год), hw (Осенний вечер), feb23 (bog), mar (8 Марта), mas (Масленица),
     may (Майские; салют — только 9 мая), sep1 (shk — 1 сентября), uch (День учителя — главный у Зины). Стенд: ?fest=ny27 (FEST, только localhost).
     Флаги: ?off=z3fest — все слои; ?off=z3f-<ключ> — один (z3f-ny, z3f-uch…). Каждый слой: g — во дворе (под фильтром вечера), lt — огни (над ним). ===== */
  var FK={ny:'ny',kan:'ny',sng:'ny',hw:'hw',bog:'feb23',mar:'mar',mas:'mas',may:'may',shk:'sep1',uch:'uch'};
  A.fest=function(){try{return window.Z3&&Z3.fest?Z3.fest():[];}catch(e){return [];}};
  function fOff(k){try{return !!(window.ZB2&&ZB2.off&&(ZB2.off('z3fest')||ZB2.off('z3f-'+k)));}catch(e){return false;}}
  function at(x,y,z,k,inner){var p=P(x,y,z||0);return '<g transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')'+(k&&k!==1?' scale('+k+')':'')+'">'+inner+'</g>';}
  function txt(x,y,s,sz,c,w){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="ZRubik,Rubik,sans-serif" font-weight="'+(w||900)+'" font-size="'+sz+'" fill="'+c+'">'+s+'</text>';}
  function sills(fn){var H=HOUSE,s='';COLS.forEach(function(x,i){for(var k=0;k<5;k++){if(x===KIT.x&&k===KIT.k)continue;var u=x-H.x,w=H.h-(.6+2*k)-1.25;if((i*3+k*5)%4===0)s+=fn(u,w,i+k);}});return faceL(H.x,H.y+H.d,H.h,s);}
  function bunt(y,cols,step){var H=HOUSE,s='<path d="M.2 '+y+' Q'+(H.w/2)+' '+(y+.5)+' '+(H.w-.2)+' '+y+'" stroke="#8c94a8" stroke-width=".03" fill="none"/>';
    for(var x=.4,i=0;x<H.w-.4;x+=step||.55,i++){var t=x/H.w,yy=y+.5*4*t*(1-t)*.5*2;s+='<path d="M'+x.toFixed(2)+' '+yy.toFixed(2)+' l.18 .34 l.18 -.34z" fill="'+cols[i%cols.length]+'"/>';}
    return faceL(H.x,H.y+H.d,H.h,s);}
  function balloons(x,y,z,cols){var s='';[[-14,-70],[0,-84],[14,-72],[-6,-96],[10,-100]].forEach(function(b,i){s+='<path d="M0 0 Q'+(b[0]/2)+' '+(b[1]/2)+' '+b[0]+' '+(b[1]+12)+'" stroke="#8c94a8" stroke-width="1.2" fill="none"/><ellipse cx="'+b[0]+'" cy="'+b[1]+'" rx="9" ry="11" fill="'+cols[i%cols.length]+'"/><ellipse cx="'+(b[0]-3)+'" cy="'+(b[1]-4)+'" rx="2.5" ry="3.5" fill="#fff" opacity=".5"/>';});return at(x,y,z,1,s);}
  function bouquet(c){return '<path d="M-6 0 l6 -18 l6 18z" fill="#fff6e6"/><path d="M-6 0 l6 -18 l6 18" stroke="#e3cdb8" fill="none"/>'+[[-6,-22],[0,-27],[6,-22],[-3,-17],[4,-16]].map(function(p,i){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4.4" fill="'+c[i%c.length]+'"/>';}).join('')+'<path d="M-3 -10 l3 4 l3 -4" stroke="#e2463b" stroke-width="2" fill="none"/>';}
  function lights(y,amp){var H=HOUSE,s='';for(var i=0;i<=24;i++){var t=i/24,x=H.w*t,yy=y+Math.sin(t*Math.PI*4)*.12+amp*4*t*(1-t);var p=P(H.x+x,H.y+H.d,H.h-yy);
      s+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.4" fill="'+['#ffe08a','#ff8f6a','#9fd8ff','#b8f28a'][i%4]+'" class="z3a-glow" style="animation-delay:-'+(i*.27).toFixed(1)+'s"/><circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="11" fill="url(#gGlowW)" opacity=".4"/>';}return s;}
  function tulips(x0,x1,y){var s='';for(var x=x0;x<x1;x+=.3){var p=P(x,y,.22),c=['#e2463b','#f5b72d','#ff8fb0'][Math.round(x*10)%3];s+='<path d="M'+p[0]+' '+(p[1]+2)+' v-12" stroke="#4f9e46" stroke-width="2"/><path d="M'+(p[0]-4)+' '+(p[1]-10)+' q0 -8 4 -8 q4 0 4 8 l-2 -3 l-2 3 l-2 -3z" fill="'+c+'"/>';}return s;}
  function salute(vb){var s='',c=['#ffd54a','#ff6b6b','#8fd0ff','#b8f28a'],x=vb[0],y=vb[1],w=vb[2];[[.25,.12,46],[.62,.07,58],[.85,.16,40]].forEach(function(b,i){var cx=x+w*b[0],cy=Math.max(y+80,-760)+b[1]*500,r=b[2],k;
      s+='<g class="z3a-glow" style="animation-delay:-'+(i*.8)+'s">';for(k=0;k<14;k++){var a=k/14*6.283;s+='<line x1="'+(cx+Math.cos(a)*r*.3).toFixed(0)+'" y1="'+(cy+Math.sin(a)*r*.3).toFixed(0)+'" x2="'+(cx+Math.cos(a)*r).toFixed(0)+'" y2="'+(cy+Math.sin(a)*r).toFixed(0)+'" stroke="'+c[(i+k)%4]+'" stroke-width="3" stroke-linecap="round"/><circle cx="'+(cx+Math.cos(a)*r*1.1).toFixed(0)+'" cy="'+(cy+Math.sin(a)*r*1.1).toFixed(0)+'" r="2.6" fill="'+c[(i+k+1)%4]+'"/>';}s+='</g>';});return s;}
  var FX={
    ny:{g:function(){var s='';
        // ёлка во дворе
        s+=at(6.2,11.6,0,1,'<ellipse cx="6" cy="2" rx="40" ry="11" fill="rgba(43,42,64,.16)"/><rect x="-5" y="-14" width="10" height="16" fill="#8a5a3c"/>'+
          [[0,-110,26,40],[0,-80,36,44],[0,-48,46,46]].map(function(t){return '<path d="M'+t[0]+' '+t[1]+' l'+t[2]+' '+t[3]+' h-'+(t[2]*2)+'z" fill="#2f8a4a"/><path d="M'+t[0]+' '+t[1]+' l'+t[2]+' '+t[3]+' h-'+t[2]+'z" fill="#247a3e"/>';}).join('')+
          '<path d="M-36 -40 q36 14 70 -8 M-28 -72 q30 12 56 -6" stroke="#ffd54a" stroke-width="2.4" fill="none"/>'+
          [[-20,-36,'#e2463b'],[16,-30,'#2f6fd6'],[-8,-62,'#f5b72d'],[12,-74,'#e2463b'],[-28,-14,'#9b63e0'],[28,-12,'#f5b72d'],[0,-96,'#2f6fd6']].map(function(b){return '<circle cx="'+b[0]+'" cy="'+b[1]+'" r="5" fill="'+b[2]+'"/><circle cx="'+(b[0]-1.5)+'" cy="'+(b[1]-1.5)+'" r="1.6" fill="#fff" opacity=".7"/>';}).join('')+
          '<path d="M0 -128 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z" fill="#f5b72d"/>'+
          '<rect x="-30" y="-8" width="16" height="12" fill="#e2463b"/><rect x="-23" y="-8" width="2" height="12" fill="#ffd54a"/><rect x="14" y="-6" width="14" height="10" fill="#2f6fd6"/><rect x="20" y="-6" width="2" height="10" fill="#fff"/>');
        // Дед Мороз у подъезда
        s+=at(13.9,5.6,0,1,'<ellipse cx="4" cy="2" rx="20" ry="6" fill="rgba(43,42,64,.16)"/><path d="M-14 0 l6 -46 h16 l6 46z" fill="#d0342c"/><path d="M-14 0 h28 v-6 h-28z M-2 -46 v46" fill="#fff" stroke="#fff" stroke-width="3"/>'+
          '<circle cx="0" cy="-54" r="10" fill="#f6c9a8"/><path d="M-10 -52 q10 26 20 0 q-4 6 -10 6 q-6 0 -10 -6z" fill="#fff"/><path d="M-11 -58 q11 -20 22 0z" fill="#d0342c"/><path d="M-12 -58 h24" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'+
          '<circle cx="-3.5" cy="-56" r="1.4" fill="#3a2a22"/><circle cx="3.5" cy="-56" r="1.4" fill="#3a2a22"/><circle cx="0" cy="-52" r="2" fill="#f2a08a"/>'+
          '<path d="M16 6 V-62" stroke="#c9cfdc" stroke-width="3"/><circle cx="16" cy="-64" r="4" fill="#9fd8ff"/><path d="M-30 -2 q-6 -22 10 -26 q14 4 8 26z" fill="#8a5a3c"/><path d="M-26 -26 q4 -4 8 0" stroke="#5a3a20" stroke-width="2" fill="none"/>');
        // мандарины на подоконниках
        s+=sills(function(u,w){return '<circle cx="'+(u+.3)+'" cy="'+(w+1.12)+'" r=".09" fill="#f08a1a"/><circle cx="'+(u+.48)+'" cy="'+(w+1.13)+'" r=".09" fill="#f5a13a"/><circle cx="'+(u+.4)+'" cy="'+(w+1.05)+'" r=".08" fill="#f08a1a"/>';});
        return s;},
      lt:function(){return lights(.35,.5)+lights(4.4,.35)+at(6.2,11.6,0,1,'<circle cx="0" cy="-124" r="22" fill="url(#gGlowW)" opacity=".8"/>');}},
    hw:{g:function(){var s='';[[12.2,5.2,1],[13.4,5.3,.8],[9.4,6.3,.9],[15.6,10.2,.75],[21,12,1]].forEach(function(p){s+=at(p[0],p[1],0,p[2],'<ellipse cx="0" cy="-10" rx="16" ry="12" fill="#f08a1a"/><path d="M-6 -21 q6 -2 12 0 M-10 -16 q2 8 0 14 M10 -16 q-2 8 0 14 M0 -22 v20" stroke="#d06a0a" stroke-width="2" fill="none"/><path d="M0 -22 q2 -8 6 -9" stroke="#4f7a2a" stroke-width="3" fill="none" stroke-linecap="round"/>'+
        '<path d="M-8 -13 l3 -4 l3 4z M2 -13 l3 -4 l3 4z M-7 -6 q7 5 14 0 l-3 2 l-2 -2 l-2 2 l-2 -2 l-2 2z" fill="#5a2a0a"/>');});return s;},
      lt:function(){var s='';[[12.2,5.2,1],[13.4,5.3,.8],[9.4,6.3,.9],[15.6,10.2,.75],[21,12,1]].forEach(function(p){s+=at(p[0],p[1],0,p[2],'<path d="M-8 -13 l3 -4 l3 4z M2 -13 l3 -4 l3 4z M-7 -6 q7 5 14 0 l-3 2 l-2 -2 l-2 2 l-2 -2 l-2 2z" fill="#ffd54a"/><circle cx="0" cy="-10" r="22" fill="url(#gGlowW)" opacity=".45"/>');});
        // бумажные фонарики между фонарями
        var a=P(11.2,6.1,2.4),b=P(15.2,6.1,2.4);s+='<path d="M'+a[0]+' '+a[1]+' Q'+((a[0]+b[0])/2)+' '+((a[1]+b[1])/2+30)+' '+b[0]+' '+b[1]+'" stroke="#5a4636" stroke-width="1.5" fill="none"/>';
        for(var i=1;i<6;i++){var t=i/6,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t+30*4*t*(1-t)*.5*2*.5;s+='<ellipse cx="'+x.toFixed(0)+'" cy="'+(y+8).toFixed(0)+'" rx="6" ry="8" fill="'+['#ff8a3d','#ffd54a','#e2463b'][i%3]+'" class="z3a-glow"/><circle cx="'+x.toFixed(0)+'" cy="'+(y+8).toFixed(0)+'" r="14" fill="url(#gGlowW)" opacity=".5"/>';}
        return s;}},
    feb23:{g:function(){return bunt(.35,['#2f6fd6','#fff','#2f6fd6','#8fc6ff'])+faceL(8.6,6.7,2.45,'<rect x=".5" y=".3" width="1.2" height=".9" fill="#fff" transform="rotate(4 1.1 .75)"/>'+txt(1.12,1,'23',.5,'#2f6fd6'));}},
    mar:{g:function(){var s=tulips(6.1,11.3,4.1)+tulips(14.1,20.5,4.1);
        s+=sills(function(u,w){return '<path d="M'+(u+.4)+' '+(w+1.15)+' v-.3" stroke="#6f9a3a" stroke-width=".04"/>'+[[.3,.85],[.42,.8],[.52,.88],[.36,.95],[.48,.96]].map(function(p){return '<circle cx="'+(u+p[0])+'" cy="'+(w+p[1])+'" r=".07" fill="#ffd93a"/>';}).join('');});
        s+=faceL(8.6,6.7,2.45,'<rect x=".5" y=".3" width="1.2" height=".9" fill="#fff" transform="rotate(4 1.1 .75)"/>'+txt(1.12,1,'8',.62,'#e2463b')+'<circle cx="1.45" cy=".5" r=".1" fill="#ffd93a"/><circle cx="1.55" cy=".58" r=".08" fill="#ffd93a"/>');
        return s;}},
    mas:{g:function(){var s='';
        // чучело Масленицы
        s+=at(9.8,11,0,1,'<path d="M0 4 V-70" stroke="#8a5a3c" stroke-width="4"/><path d="M-26 -50 h52" stroke="#8a5a3c" stroke-width="4"/><path d="M-14 -50 l-6 46 h40 l-6 -46z" fill="#e2463b"/><path d="M-20 -4 h40" stroke="#ffd54a" stroke-width="4"/>'+
          '<circle cx="0" cy="-60" r="11" fill="#f2d8a8"/><path d="M-12 -62 q12 -18 24 0 q-2 6 -4 10 q-8 -8 -16 0 q-2 -4 -4 -10z" fill="#f5b72d"/><path d="M-30 -50 l-6 10 M30 -50 l6 10 M-28 -52 l-8 2 M28 -52 l8 2" stroke="#e8c86a" stroke-width="3" stroke-linecap="round"/>'+
          '<circle cx="-4" cy="-60" r="1.5" fill="#8a5a3c"/><circle cx="4" cy="-60" r="1.5" fill="#8a5a3c"/><path d="M-4 -55 q4 3 8 0" stroke="#e2463b" stroke-width="1.5" fill="none"/>');
        // блины стопкой на лавочке + столб с лентами
        s+=at(12.7,9.3,.7,1,'<ellipse cx="0" cy="0" rx="18" ry="6" fill="#fff"/>'+[0,1,2,3,4].map(function(i){return '<ellipse cx="0" cy="'+(-2-i*2.4)+'" rx="14" ry="4.6" fill="'+(i%2?'#e8a24a':'#f2b864')+'"/>';}).join('')+'<rect x="-3" y="-15" width="6" height="3" rx="1" fill="#fff3c4"/>');
        s+=at(19,12,0,1,'<path d="M0 4 V-96" stroke="#c98a5a" stroke-width="4"/><circle cx="0" cy="-98" r="5" fill="#f5b72d"/>'+['#e2463b','#2f6fd6','#f5b72d','#4f9e46'].map(function(c,i){return '<path d="M0 -94 q'+(-20+i*13)+' 40 '+(-28+i*18)+' 90" stroke="'+c+'" stroke-width="3" fill="none"/>';}).join(''));
        return s;}},
    may:{g:function(){var s=bunt(.35,['#e2463b','#f5b72d','#e2463b','#fff']);
        s+=at(11.9,5.1,0,1,bouquet(['#e2463b','#e2463b','#fff']))+at(13.5,5.1,0,1,bouquet(['#e2463b','#ff8fb0','#e2463b']));return s;},
      lt:function(c){var d='';try{d=window.FEST&&window.FEST.today?window.FEST.today():'';}catch(e){}return /-05-09$/.test(d)?salute(c.vb):'';}},
    sep1:{g:function(){var s='',Sx=.8,Sy=6,Sw=3.4,Sd=7,Sh=6;
        s+=faceR(Sx+Sw,Sy+Sd,Sh,'<rect x="1.4" y="1.05" width="4.2" height=".7" rx=".12" fill="#fff"/><rect x="1.4" y="1.05" width="4.2" height=".7" rx=".12" fill="none" stroke="#2f6fd6" stroke-width=".05"/>'+txt(3.5,1.55,'1 СЕНТЯБРЯ',.4,'#2f6fd6'));
        // банты на двери школы и букеты на крыльце
        s+=faceR(Sx+Sw,Sy+Sd,Sh,'<path d="M3.2 '+(Sh-1.35)+' q-.3 -.25 -.3 .02 q0 .25 .3 .02 q.3 -.25 .3 .02 q0 .25 -.3 -.02z" fill="#fff"/><path d="M3.8 '+(Sh-1.35)+' q-.3 -.25 -.3 .02 q0 .25 .3 .02 q.3 -.25 .3 .02 q0 .25 -.3 -.02z" fill="#fff"/>');
        s+=at(4.6,9.8,0,1,bouquet(['#e2463b','#f5b72d','#9b63e0']))+at(4.7,8.6,0,1,bouquet(['#fff','#ff8fb0','#e2463b']));
        s+=balloons(4.5,10.8,0,['#fff','#2f6fd6','#e2463b']);return s;}},
    uch:{g:function(){var s='',Sx=.8,Sy=6,Sw=3.4,Sd=7,Sh=6;
        s+=faceR(Sx+Sw,Sy+Sd,Sh,'<rect x=".9" y=".95" width="5.2" height=".8" rx=".14" fill="#e2463b"/>'+txt(3.5,1.5,'С ДНЁМ УЧИТЕЛЯ!',.38,'#fff'));
        s+=balloons(4.5,10.8,0,['#e2463b','#f5b72d','#2f6fd6','#9b63e0'])+balloons(4.4,7.4,0,['#f5b72d','#e2463b','#fff']);
        s+=at(4.6,9.8,0,1.1,bouquet(['#e2463b','#f5b72d','#ff8fb0']))+at(4.7,8.6,0,1.1,bouquet(['#9b63e0','#fff','#e2463b']))+at(4.8,9.2,0,1,'<circle cx="0" cy="-6" r="6" fill="#e2463b"/><path d="M0 -12 q2 -4 5 -4" stroke="#4f7a2a" stroke-width="2" fill="none"/>');
        // большая «5» на доске «Вечёрки» и цветы у Зины на окне
        s+=faceL(8.6,6.7,2.45,'<rect x=".45" y=".25" width="1.3" height="1" fill="#fff" transform="rotate(-4 1.1 .75)"/>'+txt(1.1,1.1,'5',.8,'#e2463b'));
        var u=KIT.x-HOUSE.x,w=HOUSE.h-(.6+2*KIT.k)-1.25;s+=faceL(HOUSE.x,HOUSE.y+HOUSE.d,HOUSE.h,'<g transform="translate('+(u+1.05)+' '+(w+1.18)+') scale(.012)">'+bouquet(['#e2463b','#f5b72d','#ff8fb0'])+'</g>');
        // гирлянда из осенних листьев на доме и конфетти
        var lv='';for(var x=.4,i=0;x<HOUSE.w-.4;x+=.42,i++){var t=x/HOUSE.w,yy=.38+.5*4*t*(1-t)*.5;lv+='<path d="M'+x.toFixed(2)+' '+yy.toFixed(2)+' c.1 -.1 .22 -.04 .2 .12 c-.1 .1 -.2 .04 -.2 -.12z" fill="'+['#e8a030','#d9731a','#f5c84a','#c2561a'][i%4]+'"/>';}
        s+=faceL(HOUSE.x,HOUSE.y+HOUSE.d,HOUSE.h,'<path d="M.2 .38 Q'+(HOUSE.w/2)+' .88 '+(HOUSE.w-.2)+' .38" stroke="#8a5a3c" stroke-width=".03" fill="none"/>'+lv);
        seed=41;for(var k=0;k<40;k++){var q=P(2+RS()*20,6+RS()*7,1+RS()*4);s+='<rect x="'+q[0].toFixed(0)+'" y="'+q[1].toFixed(0)+'" width="5" height="3" fill="'+['#e2463b','#f5b72d','#2f6fd6','#4f9e46','#ff8fb0'][k%5]+'" transform="rotate('+((RS()*180)|0)+' '+q[0].toFixed(0)+' '+q[1].toFixed(0)+')"/>';}
        return s;}}
  };
  function fk(c){return (c.fk||[]).filter(function(k){return FX[k]&&!fOff(k);});}
  A.yardFx.push(function(c){return fk(c).map(function(k){return FX[k].g(c)||'';}).join('');});
  A.yardLt=A.yardLt||[];A.yardLt.push(function(c){return fk(c).map(function(k){return FX[k].lt?FX[k].lt(c)||'':'';}).join('');});
  A.festLayers=function(){return Object.keys(FX);};
})();
