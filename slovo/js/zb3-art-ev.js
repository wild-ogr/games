'use strict';
(function(){var A=window.Z3ART;if(!A||!A.iso||A.evOn)return;A.evOn=1;var I=A.iso,P=I.P,faceL=I.faceL,ground=I.ground,HOUSE=I.HOUSE,KIT=I.KIT,COLS=I.COLS;
var EVP=[7.2,8.7],EVK=1.5;
function at(x,y,z,k,inner){var p=P(x,y,z||0);return'<g transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')'+(k&&k!==1?' scale('+k+')':'')+'">'+inner+'</g>';}
function sh(rx,ry,dx){return'<ellipse cx="'+(dx||6)+'" cy="3" rx="'+rx+'" ry="'+(ry||rx*.3)+'" fill="rgba(43,42,64,.15)"/>';}
function txt(x,y,s,sz,c,w){return'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="ZRubik,Rubik,sans-serif" font-weight="'+(w||900)+'" font-size="'+sz+'" fill="'+c+'">'+s+'</text>';}
function sign(x,s,c,bg){return'<path d="M'+x+' 2 V-44" stroke="#8a5a3c" stroke-width="3"/><rect x="'+(x-24)+'" y="-62" width="48" height="20" rx="4" fill="'+(bg||'#fffaf0')+'"/>'+
'<rect x="'+(x-24)+'" y="-46" width="48" height="4" rx="2" fill="rgba(0,0,0,.08)"/>'+txt(x,-48,s,10,c||'#b83a0a');}
function SG(w,c){return at(EVP[0]+1.5,EVP[1]-.5,0,1,sign(0,w,c));}
function sills(fn){var H=HOUSE,s='';COLS.forEach(function(x,i){for(var k=0;k<5;k++){if(x===KIT.x&&k===KIT.k)continue;var u=x-H.x,w=H.h-(.6+2*k)-1.25;if((i*3+k*5)%3===0)s+=fn(u,w,i+k);}});return faceL(H.x,H.y+H.d,H.h,s);}
function jar(x,y,c,lid){return'<rect x="'+x+'" y="'+y+'" width="11" height="14" rx="3" fill="'+c+'"/><rect x="'+(x+2)+'" y="'+(y+3)+'" width="3" height="8" rx="1.5" fill="rgba(255,255,255,.35)"/>'+
'<rect x="'+(x-1)+'" y="'+(y-4)+'" width="13" height="5" rx="1.5" fill="'+(lid||'#fffaf0')+'"/><path d="M'+(x-1)+' '+(y-2)+' h13" stroke="#e2463b" stroke-width="1.2" stroke-dasharray="2 2"/>';}
function mush(x,y,k,cap){return'<g transform="translate('+x+' '+y+') scale('+k+')"><path d="M-3 0 q-1 -8 0 -10 h6 q1 2 0 10z" fill="#f6ead2"/><path d="M-10 -9 q10 -16 20 0z" fill="'+(cap||'#b8541f')+'"/>'+
(cap==='#e2463b'?'<circle cx="-3" cy="-13" r="1.6" fill="#fff"/><circle cx="4" cy="-12" r="1.3" fill="#fff"/>':'')+'</g>';}
function book(x,y,w,h,c){return'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1" fill="'+c+'"/><rect x="'+x+'" y="'+(y+3)+'" width="'+w+'" height="1.5" fill="rgba(255,255,255,.45)"/>';}
var FX={
chess:function(){var g='',i,j;for(i=0;i<4;i++)for(j=0;j<4;j++)g+='<rect x="'+(i*.25)+'" y="'+(j*.25)+'" width=".25" height=".25" fill="'+((i+j)%2?'#5a3a28':'#f6e6c8')+'"/>';
return SG('ТУРНИР','#27324a')+ground(EVP[0]-.2,EVP[1]-.2,.01,'<rect x="-.06" y="-.06" width="1.12" height="1.12" rx=".06" fill="#a3683e"/>'+g)+
at(EVP[0]+.15,EVP[1]+.15,0,1,sh(12,4,0)+'<path d="M-6 0 q0 -10 6 -14 q6 4 6 14z" fill="#fffaf0"/><circle cx="0" cy="-18" r="5" fill="#fffaf0"/><path d="M-3 -24 h6 M0 -27 v6" stroke="#fffaf0" stroke-width="2.4"/>')+
at(EVP[0]+.75,EVP[1]+.6,0,1,sh(10,3,0)+'<path d="M-5 0 q0 -8 5 -11 q5 3 5 11z" fill="#3a2a24"/><circle cx="0" cy="-14" r="4.4" fill="#3a2a24"/>')+
at(EVP[0]+1.4,EVP[1]-.2,0,1,sh(14,4)+'<path d="M-12 0 v-16 M12 0 v-16" stroke="#8a5a3c" stroke-width="3"/><rect x="-15" y="-20" width="30" height="6" rx="2" fill="#c98a5a"/>'+
'<rect x="-7" y="-30" width="14" height="10" rx="2" fill="#e2463b"/><circle cx="-3" cy="-25" r="2.6" fill="#fffaf0"/><circle cx="3.4" cy="-25" r="2.6" fill="#fffaf0"/><path d="M-3 -27 v2 M3.4 -27 l1 1.6" stroke="#27324a" stroke-width=".9"/>');},
vote:function(){return at(EVP[0]+1.5,EVP[1]-.5,0,1,'<path d="M0 2 V-58" stroke="#8a5a3c" stroke-width="3"/><rect x="-24" y="-80" width="48" height="34" rx="3" fill="#fffaf0"/>'+txt(0,-66,'ВЫБОРЫ',9.5,'#2f6fd6')+txt(0,-53,'старшей',8.5,'#b83a0a',700))+at(EVP[0]+.6,EVP[1]+.4,0,1,sh(26,7)+'<path d="M-20 0 v-18 M20 0 v-18" stroke="#8a5a3c" stroke-width="3"/><path d="M-24 -26 h48 v12 q-24 6 -48 0z" fill="#e2463b"/><rect x="-24" y="-28" width="48" height="5" rx="2" fill="#f3584c"/>'+
'<rect x="-12" y="-48" width="24" height="20" rx="2" fill="#fffaf0"/><rect x="-12" y="-48" width="24" height="5" fill="#2f6fd6"/><rect x="-6" y="-47" width="12" height="2" rx="1" fill="#1d3f8f"/>'+
'<path d="M-4 -43 l4 -9 l6 2 l-4 9z" fill="#fff"/><path d="M-6 -38 h12" stroke="#e2463b" stroke-width="1.6"/>')+
at(EVP[0]-.3,EVP[1]+.9,0,1,'<path d="M0 2 V-40" stroke="#7d8396" stroke-width="2"/><path d="M0 -40 h14 l-4 5 l4 5 h-14z" fill="#e2463b"/>');},
remont:function(){return at(EVP[0]+.5,EVP[1]+.3,0,1,sh(22,6)+'<path d="M-12 0 L-2 -54 M8 0 L-2 -54" stroke="#9aa3b8" stroke-width="3.4"/><path d="M-10 -10 h16 M-8 -22 h12 M-6 -34 h8" stroke="#9aa3b8" stroke-width="2.6"/>'+
'<rect x="-12" y="-62" width="20" height="6" rx="2" fill="#c9d0de"/><rect x="-8" y="-72" width="11" height="11" rx="2" fill="#2f6fd6"/><path d="M-8 -70 h11" stroke="#8fc6ff" stroke-width="2"/>')+
at(EVP[0]+1.2,EVP[1]+.8,0,1,sh(12,4,0)+'<path d="M-9 0 v-15 h18 v15z" fill="#f5b72d"/><ellipse cx="0" cy="-15" rx="9" ry="3" fill="#7fe0d6"/><path d="M-9 -9 h18" stroke="#fffaf0" stroke-width="3"/>'+
'<path d="M14 0 v-12 h10 v12z" fill="#e2463b"/><ellipse cx="19" cy="-12" rx="5" ry="1.8" fill="#ffb08a"/>')+
at(EVP[0]-.1,EVP[1]+1,0,1,'<rect x="-14" y="-6" width="22" height="6" rx="3" fill="#7fe0d6"/><path d="M8 -3 h8 v-14" stroke="#7d8396" stroke-width="2" fill="none"/>'+
'<rect x="-6" y="-24" width="8" height="22" rx="4" fill="#fbe3c0" transform="rotate(-70 -2 -13)"/><rect x="-2" y="-18" width="8" height="22" rx="4" fill="#ffd0dc" transform="rotate(-80 2 -7)"/>');},
bird:function(){function bh(x,y,c,r){return'<rect x="'+(x-8)+'" y="'+y+'" width="16" height="18" rx="1.5" fill="'+c+'"/><path d="M'+(x-11)+' '+(y+2)+' L'+x+' '+(y-8)+' L'+(x+11)+' '+(y+2)+'z" fill="'+r+'"/><circle cx="'+x+'" cy="'+(y+8)+'" r="3.2" fill="#3b2a20"/><path d="M'+(x-3)+' '+(y+14)+' h6" stroke="#8a5a3c" stroke-width="2"/>';}
return SG('КОНКУРС','#2f6fd6')+at(EVP[0]+.6,EVP[1]+.4,0,1,sh(30,7)+'<path d="M-26 0 V-46 M26 0 V-46" stroke="#8a5a3c" stroke-width="4"/><rect x="-32" y="-50" width="64" height="6" rx="2" fill="#c98a5a"/>'+
bh(-18,-76,'#f5b72d','#e2463b')+bh(2,-80,'#7fe0d6','#2f6fd6')+bh(22,-74,'#ffb3c4','#4f9e46')+
'<circle cx="-18" cy="-40" r="5" fill="#f5b72d"/>'+txt(-18,-37.4,'1',7,'#5a3a10')+'<circle cx="2" cy="-40" r="5" fill="#c9d0de"/>'+txt(2,-37.4,'2',7,'#27324a')+'<circle cx="22" cy="-40" r="5" fill="#d9a774"/>'+txt(22,-37.4,'3',7,'#5a3a10')+
'<path d="M-40 -96 q4 -4 8 0 q4 -4 8 0" stroke="#27324a" stroke-width="1.8" fill="none"/>');},
sub:function(){return at(EVP[0]+.5,EVP[1]+.4,0,1,sh(28,7)+'<path d="M-24 0 q-2 -10 6 -16 q10 -2 14 6 q2 8 -4 12z" fill="#7a9a4a"/><path d="M-18 -16 l2 -4 l4 3" stroke="#5a7a30" stroke-width="2" fill="none"/>'+
'<path d="M0 0 q-2 -14 8 -18 q12 0 12 10 q0 8 -6 10z" fill="#3fa155"/>'+
'<path d="M26 2 L14 -54" stroke="#c98a5a" stroke-width="3"/><path d="M8 -56 h14 M9 -56 v5 M13 -56 v5 M17 -56 v5 M21 -56 v5" stroke="#7d8396" stroke-width="2"/>'+
'<path d="M34 2 L38 -50" stroke="#c98a5a" stroke-width="3"/><path d="M30 2 q4 -14 8 -14 q4 0 8 14z" fill="#e8c86a"/>'+
'<path d="M-36 2 v-12 h12 v12z" fill="#9aa3b8"/><ellipse cx="-30" cy="-10" rx="6" ry="2" fill="#c9d0de"/>'+
[[-14,-4,'#e8742a'],[-6,2,'#f2b233'],[8,4,'#d0461e'],[-40,6,'#f2b233']].map(function(l){return'<path transform="translate('+l[0]+' '+l[1]+') rotate(20)" d="M0 -4 q4 1 3 5 q-3 1 -3 -1 q0 2 -3 1 q-1 -4 3 -5z" fill="'+l[2]+'"/>';}).join(''))+
at(EVP[0]+1.5,EVP[1]-.5,0,1,'<path d="M0 2 V-60" stroke="#7d8396" stroke-width="2.4"/><path d="M0 -60 q12 -4 22 2 v16 q-10 -6 -22 -2z" fill="#e2463b"/>'+txt(11,-48,'ВСЕ',7,'#fff'));},
balk:function(){var C=['#e2463b','#ff8fb0','#f5b72d','#fffaf0','#9b63e0'];return[sills(function(u,w,i){var s='<rect x="'+(u+.1)+'" y="'+(w+1.05)+'" width=".75" height=".16" rx=".03" fill="#a3683e"/>',k;
for(k=0;k<5;k++)s+='<circle cx="'+(u+.18+k*.15)+'" cy="'+(w+1.0)+'" r=".07" fill="#4f9e46"/><circle cx="'+(u+.18+k*.15)+'" cy="'+(w+.94)+'" r=".055" fill="'+C[(i+k)%5]+'"/>';return s;}),
SG('БАЛКОНЫ','#b83a0a')+at(EVP[0]+.8,EVP[1]+.6,0,1,sh(12,4,0)+'<path d="M-8 0 l2 -12 h12 l2 12z" fill="#c9673a"/><path d="M0 -12 v-10" stroke="#4f9e46" stroke-width="2"/>'+
'<circle cx="-5" cy="-22" r="5" fill="#e2463b"/><circle cx="5" cy="-24" r="5" fill="#ff8fb0"/><circle cx="0" cy="-30" r="5" fill="#e2463b"/><circle cx="0" cy="-25" r="2.4" fill="#f5b72d"/>')];},
ogor:function(){var s='',i;for(i=0;i<5;i++)s+='<path d="M'+(.15+i*.2)+' .2 l-.05 -.12 M'+(.15+i*.2)+' .2 l.05 -.12 M'+(.15+i*.2)+' .2 v-.15" stroke="#4f9e46" stroke-width=".04"/><circle cx="'+(.15+i*.2)+'" cy=".26" r=".05" fill="#f08a1a"/>';
for(i=0;i<3;i++)s+='<circle cx="'+(.25+i*.3)+'" cy=".7" r=".12" fill="#8fd06a"/><circle cx="'+(.25+i*.3)+'" cy=".7" r=".07" fill="#bfe8a0"/>';
return SG('ОГОРОД','#2a7a3a')+ground(EVP[0],EVP[1],.02,'<rect width="1.1" height=".95" rx=".08" fill="#8a5a3c"/><rect x=".04" y=".04" width="1.02" height=".87" rx=".06" fill="#a3683e"/>'+s)+
at(EVP[0]+1.4,EVP[1]+.4,0,1,sh(10,3,0)+'<path d="M-8 0 v-12 q0 -4 4 -4 h8 q4 0 4 4 v12z" fill="#2f9e8a"/><path d="M8 -10 l10 -8" stroke="#2f9e8a" stroke-width="3"/><path d="M-6 -16 q6 -8 12 0" stroke="#2f9e8a" stroke-width="2" fill="none"/>');},
jam:function(){return SG('ВАРЕНЬЕ','#c0283a')+at(EVP[0]+.7,EVP[1]+.4,0,1,sh(28,7)+'<path d="M-22 0 v-18 M22 0 v-18" stroke="#8a5a3c" stroke-width="3"/><path d="M-26 -26 h52 v10 q-26 5 -52 0z" fill="#fffaf0"/>'+
'<path d="M-26 -22 h52" stroke="#e2463b" stroke-width="2" stroke-dasharray="4 4"/><rect x="-26" y="-28" width="52" height="4" rx="2" fill="#fff"/>'+
jar(-22,-42,'#c0283a')+jar(-8,-44,'#e8742a')+jar(6,-42,'#6a2a5a','#ffd0dc')+
'<path d="M20 -28 q0 -12 12 -12 h6 q10 0 10 12z" fill="#d07a3a"/><ellipse cx="34" cy="-40" rx="14" ry="3.6" fill="#b8541f"/><ellipse cx="34" cy="-40" rx="11" ry="2.6" fill="#c0283a"/>'+
'<path d="M40 -46 l10 -12" stroke="#c9cfdc" stroke-width="2.4"/>');},
grib:function(){return SG('ГРИБЫ','#8a3a10')+at(EVP[0]+.6,EVP[1]+.4,0,1,sh(22,6)+'<path d="M-14 0 v-12 h28 v12z" fill="#a3683e"/><ellipse cx="0" cy="-12" rx="14" ry="4" fill="#d9a774"/><ellipse cx="0" cy="-12" rx="9" ry="2.4" fill="#c98a5a"/>'+
mush(-6,-24,1.1,'#b8541f')+mush(5,-25,1,'#e8742a')+mush(0,-28,.9,'#c0283a')+
'<path d="M-14 -16 q14 10 28 0 v-8 q-14 8 -28 0z" fill="#d9a774"/><path d="M-14 -20 q14 8 28 0" stroke="#b8803a" stroke-width="1.6" fill="none"/><path d="M-12 -18 q12 -26 24 0" stroke="#b8803a" stroke-width="2.4" fill="none"/>')+
at(EVP[0]+1.3,EVP[1]+.9,0,1,mush(0,0,1.1,'#e2463b')+mush(10,2,.8,'#b8541f'))+at(EVP[0]-.1,EVP[1]+1,0,1,mush(0,0,.9,'#b8541f'));},
book:function(){var s='';[['#2f6fd6',6],['#e2463b',5],['#f5b72d',7],['#4f9e46',5],['#9b63e0',6]].forEach(function(b,i){s+=book(-16+i*6.4,-50+(i%2),5.4,16-(i%2),b[0]);});
[['#e8742a'],['#2f9e8a'],['#c0283a'],['#27324a'],['#f5b72d']].forEach(function(b,i){s+=book(-16+i*6.4,-28+(i%3?0:1),5.4,15,b[0]);});
return SG('ОБМЕН','#2f6fd6')+at(EVP[0]+.6,EVP[1]+.4,0,1,sh(22,6)+'<path d="M-20 0 v-60 h40 v60z" fill="#c98a5a"/><path d="M-24 -60 L0 -76 L24 -60z" fill="#b83228"/><rect x="-17" y="-56" width="34" height="50" fill="#fbe3c0"/>'+
'<path d="M-17 -33 h34" stroke="#a3683e" stroke-width="2.4"/>'+s+txt(0,-62,'КНИГИ',7,'#fff'))+
at(EVP[0]+1.4,EVP[1]+.9,0,1,sh(10,3,0)+'<path d="M-8 0 v-10 M8 0 v-10" stroke="#8a5a3c" stroke-width="2.4"/><rect x="-10" y="-13" width="20" height="4" rx="1.5" fill="#c98a5a"/>'+
book(-8,-19,16,5,'#2f6fd6')+book(-7,-24,14,5,'#e2463b')+book(-8,-29,15,5,'#f5b72d'));},
cat:function(){function bow(x,y,c){return'<path d="M'+x+' '+y+' l-7 -4 v8z M'+x+' '+y+' l7 -4 v8z" fill="'+c+'"/><circle cx="'+x+'" cy="'+y+'" r="2" fill="'+c+'"/>';}
return SG('КОШКИ','#9b3a8a')+at(EVP[0]+.6,EVP[1]+.4,0,1,sh(32,7)+'<rect x="-10" y="-30" width="20" height="30" fill="#f5b72d"/><rect x="-30" y="-20" width="20" height="20" fill="#c9d0de"/><rect x="10" y="-14" width="20" height="14" fill="#d9a774"/>'+
'<rect x="-10" y="-30" width="20" height="4" fill="#ffd56a"/><rect x="-30" y="-20" width="20" height="4" fill="#e6eaf2"/><rect x="10" y="-14" width="20" height="4" fill="#ecc497"/>'+
txt(0,-10,'1',12,'#7a4a08')+txt(-20,-4,'2',10,'#4a5468')+txt(20,-1,'3',9,'#6a4220')+
'<ellipse cx="0" cy="-33" rx="9" ry="4" fill="#e2463b"/><ellipse cx="-20" cy="-23" rx="8" ry="3.4" fill="#2f6fd6"/><ellipse cx="20" cy="-17" rx="8" ry="3.4" fill="#9b63e0"/>'+bow(0,-44,'#e2463b'))+
at(EVP[0]+1.4,EVP[1]+1,0,1,'<ellipse cx="0" cy="0" rx="8" ry="3" fill="#e2463b"/><ellipse cx="0" cy="-1.4" rx="6" ry="2" fill="#fffaf0"/><ellipse cx="14" cy="3" rx="7" ry="2.6" fill="#2f6fd6"/><ellipse cx="14" cy="1.8" rx="5" ry="1.6" fill="#c9673a"/>');},
snow:function(){var s='',i,j;for(j=0;j<3;j++)for(i=0;i<5-j;i++)s+='<rect x="'+(-30+i*12+j*6)+'" y="'+(-10-j*10)+'" width="11" height="9" rx="2.5" fill="'+((i+j)%2?'#f4f8fc':'#e6eff9')+'"/>';
return ground(EVP[0]-.2,EVP[1]-.1,.01,'<ellipse cx=".9" cy=".7" rx="1.05" ry=".8" fill="#f4f8fc"/>')+
at(EVP[0]+.6,EVP[1]+.4,0,1,sh(30,6)+s+'<path d="M0 -30 V-58" stroke="#8a5a3c" stroke-width="2.4"/><path d="M0 -58 h14 l-3 5 l3 5 h-14z" fill="#e2463b"/>'+
'<circle cx="34" cy="-4" r="4" fill="#fff"/><circle cx="40" cy="-2" r="4" fill="#f4f8fc"/><circle cx="37" cy="-9" r="4" fill="#fff"/>')+
at(EVP[0]+1.5,EVP[1]+1,0,1,'<path d="M-14 0 h26 q4 0 4 -4" stroke="#c0283a" stroke-width="2.4" fill="none"/><rect x="-14" y="-6" width="24" height="4" rx="1.5" fill="#d9a774"/><path d="M-10 -2 v2 M6 -2 v2" stroke="#c0283a" stroke-width="2"/>');}
};
A.evIds=Object.keys(FX);
A.yardFx.push(function(c){if(c.fk&&c.fk.length)return'';try{if(window.ZB2&&ZB2.off&&ZB2.off('z3ev'))return'';}catch(e){}var id=A.evId?A.evId():'';var f=FX[id];if(!f)return'';var r=f(c),w='';if(typeof r!=='string'){w=r[0];r=r[1];}
var o=P(EVP[0]+.6,EVP[1]+.5,0),tx=(o[0]*(1-EVK)).toFixed(1)+' '+(o[1]*(1-EVK)).toFixed(1);
return'<g class="z3a-ev" data-ev="'+id+'" transform="translate('+tx+') scale('+EVK+')">'+r+'</g>'+(w?'<g class="z3a-ev">'+w+'</g>':'');});
})();
