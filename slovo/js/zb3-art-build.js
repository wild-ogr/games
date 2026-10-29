'use strict';
(function(){
var A=window.Z3ART=window.Z3ART||{};
var U=40,CX=.866*U,CY=.5*U;
function P(x,y,z){return[(x-y)*CX,(x+y)*CY-(z||0)*U];}
function pts(a){return a.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');}
function poly(a,f,ex){return'<polygon points="'+pts(a)+'" fill="'+f+'"'+(ex||'')+'/>';}
function sh(c,k){var m=/^#([0-9a-f]{6})$/i.exec(c);if(!m)return c;var v=parseInt(m[1],16),r=v>>16,g=v>>8&255,b=v&255;
function f(x){return Math.max(0,Math.min(255,Math.round(k>1?x+(255-x)*(k-1):x*k)));}return'rgb('+f(r)+','+f(g)+','+f(b)+')';}
function C3(c){return{t:sh(c,1.25),l:c,r:sh(c,.78)};}
function box(x,y,z,w,d,h,c,edge){var t=[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],l=[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],r=[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)];
if(typeof c==='string')c=C3(c);var s=poly(t,c.t)+poly(l,c.l)+poly(r,c.r);
if(edge!==false)s+='<polyline points="'+pts([P(x,y+d,z+h),P(x+w,y+d,z+h),P(x+w,y,z+h)])+'" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.4" stroke-linejoin="round"/>';return s;}
function faceL(x0,Y,zT,inner){var o=P(x0,Y,zT);return'<g transform="matrix('+CX+' '+CY+' 0 '+U+' '+o[0].toFixed(1)+' '+o[1].toFixed(1)+')">'+inner+'</g>';}
function ground(x0,y0,z,inner){var o=P(x0,y0,z);return'<g transform="matrix('+CX+' '+CY+' '+(-CX)+' '+CY+' '+o[0].toFixed(1)+' '+o[1].toFixed(1)+')">'+inner+'</g>';}
function line(a,b,c,w){return'<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>';}
function post(x,y,z,h,c,w){return line(P(x,y,z),P(x,y,z+h),c||'#6b4a34',w||4);}
function shadow(x,y,w,d,op){var a=P(x+w/2,y+d/2,0);return'<ellipse cx="'+(a[0]+10).toFixed(1)+'" cy="'+(a[1]+3).toFixed(1)+'" rx="'+((w+d)*CX*.62).toFixed(1)+'" ry="'+((w+d)*CY*.5).toFixed(1)+'" fill="rgba(43,42,64,'+(op||.15)+')"/>';}
function roof2(x,y,z,w,d,h,c){var a=P(x,y+d,z),b=P(x+w,y+d,z),e=P(x+w,y,z),f=P(x,y,z),m1=P(x+w/2,y+d,z+h),m2=P(x+w/2,y,z+h);
return poly([f,m2,m1,a],sh(c,1.15))+poly([m2,e,b,m1],sh(c,.8))+poly([a,m1,b],sh(c,.95));}
function at(x,y,z,inner,k){var p=P(x,y,z||0);return'<g transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')'+(k?' scale('+k+')':'')+'">'+inner+'</g>';}
var WD='#a9673a',WD2='#c98a5a',IRON='#4a4f63';
A.bldPos=[[8.2,9.6,0,'bench'],[10.2,8.4,0,'bed'],[13.9,4.3,2.6,'lift'],[9,11.6,0,'fountain'],[19.8,6.6,0,'swing'],[14.8,11.9,0,'fir'],
[6.6,11.2,0,'sand'],[20.6,8.8,0,'slide'],[19.4,11.6,0,'gazebo'],[3.4,4.1,2.6,'nest'],[15.4,5.2,0,'mbox'],[10.9,10.6,0,'lamp'],
[21.8,7.1,0,'bar'],[17.4,12.2,0,'rope'],[7,5,0,'bikes'],[8.6,5.1,0,'board'],[21.4,12.6,0,'green'],[11,12.5,0,'chess'],
[5.6,8.6,0,'well'],[17.2,4,6.6,'clock'],[12.2,12.4,0,'path'],[1.6,8.2,0,'shed'],[14.2,9.1,0,'cathouse'],[3.8,11.9,0,'pond'],[18.6,13.2,0,'veranda'],[12.6,13.8,0,'arch']];
var HAS={0:1,2:1,4:1,6:1,11:1,13:1,15:1,20:1};
function flowers(x,y,w,d){var s='',i,c=['#e2463b','#f5b72d','#ff8fb0','#fff','#9b7fd3'];for(i=0;i<Math.round(w*d*8);i++){var fx=x+.12+((i*37)%100)/100*(w-.24),fy=y+.12+((i*61)%100)/100*(d-.24),p=P(fx,fy,.22);
s+='<circle cx="'+p[0].toFixed(1)+'" cy="'+(p[1]+2).toFixed(1)+'" r="4.4" fill="#5aa84a"/><circle cx="'+p[0].toFixed(1)+'" cy="'+(p[1]-3).toFixed(1)+'" r="3.6" fill="'+c[i%5]+'"/>';}return s;}
function draw(k,x,y,z,o){var s='';switch(k){
case'bench':return shadow(x,y,1.6,.5)+box(x,y-.4,.5,1.6,.1,.5,'#3fa155',false)+box(x,y-.3,.42,1.6,.55,.08,'#5bbf6a',false)+post(x+.1,y+.2,0,.42,IRON,3)+post(x+1.5,y+.2,0,.42,IRON,3);
case'bed':return shadow(x,y,1.4,.9)+box(x,y,0,1.4,.9,.22,{t:'#7a4e30',l:'#f4efe6',r:'#d9d2c3'},false)+flowers(x,y,1.4,.9);
case'lift':return box(x,y,z,.9,.08,.55,'#7fe0d6')+faceL(x,y+.08,z+.55,'<rect x=".1" y=".08" width=".7" height=".3" rx=".05" fill="#fff"/><text x=".45" y=".3" text-anchor="middle" font-family="ZRubik,sans-serif" font-weight="900" font-size=".2" fill="#1e8a82">ЛИФТ</text>');
case'fountain':return shadow(x,y,1.6,1.6,.12)+box(x,y,0,1.6,1.6,.3,'#d9d2c3',false)+ground(x+.15,y+.15,.3,'<rect width="1.3" height="1.3" rx=".2" fill="#8fc6ff"/><rect x=".1" y=".1" width="1.1" height=".5" rx=".2" fill="#bfe3ff" opacity=".7"/>')+
box(x+.65,y+.65,.3,.3,.3,.55,'#e9e3d6')+at(x+.8,y+.8,.85,'<path d="M0 0 q-14 -26 -24 6 M0 0 q14 -26 24 6 M0 0 v-22" stroke="#bfe3ff" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="0" cy="-24" r="4" fill="#dff1ff"/>');
case'swing':return post(x,y,0,1.8,'#2f6fd6')+post(x+1.4,y,0,1.8,'#2f6fd6')+line(P(x,y,1.8),P(x+1.4,y,1.8),'#2f6fd6',4)+line(P(x+.5,y,1.8),P(x+.5,y,.5),'#7d8396',1.6)+line(P(x+.9,y,1.8),P(x+.9,y,.5),'#7d8396',1.6)+box(x+.4,y-.12,.45,.6,.25,.06,'#e2463b',false);
case'fir':s=shadow(x-.4,y-.4,.8,.8)+box(x-.08,y-.08,0,.16,.16,.35,'#8a5a3c',false);var b=P(x,y,.35);
[[0,-110,26,40],[0,-80,36,44],[0,-48,46,46]].forEach(function(t){s+='<path d="M'+b[0]+' '+(b[1]+t[1]+46)+' l'+t[2]+' '+t[3]+' h-'+(t[2]*2)+'z" fill="#2f8a4a"/><path d="M'+b[0]+' '+(b[1]+t[1]+46)+' l'+t[2]+' '+t[3]+' h-'+t[2]+'z" fill="#247a3e"/>';});
return s+'<path d="M'+b[0]+' '+(b[1]-72)+' l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z" fill="#f5b72d"/>';
case'sand':return shadow(x,y,1.4,1.4)+box(x,y,0,1.4,1.4,.25,'#e9b27a',false)+ground(x+.12,y+.12,.25,'<rect width="1.16" height="1.16" fill="#f6dea2"/><circle cx=".4" cy=".6" r=".15" fill="#efd08a"/>');
case'slide':return shadow(x,y,1.8,.6)+box(x,y,0,.5,.6,1.2,'#f5b72d')+poly([P(x+.5,y,1.2),P(x+1.8,y,.05),P(x+1.8,y+.6,.05),P(x+.5,y+.6,1.2)],'#e2463b')+poly([P(x+.5,y+.6,1.2),P(x+1.8,y+.6,.05),P(x+1.8,y+.6,.18),P(x+.5,y+.6,1.32)],'#b83228')+
line(P(x,y+.6,0),P(x,y+.6,1.6),'#2f6fd6',3)+line(P(x+.5,y+.6,0),P(x+.5,y+.6,1.6),'#2f6fd6',3);
case'gazebo':return shadow(x,y,1.6,1.6)+box(x,y,0,1.6,1.6,.15,'#d9a774',false)+post(x+.08,y+1.52,.15,1.1,WD)+post(x+1.52,y+1.52,.15,1.1,WD)+post(x+1.52,y+.08,.15,1.1,WD)+post(x+.08,y+.08,.15,1.1,WD)+
faceL(x,y+1.6,.75,'<path d="M.1 .1 h1.4 M.1 .3 h1.4" stroke="#c98a5a" stroke-width=".06"/>')+roof2(x-.15,y-.15,1.25,1.9,1.9,.8,'#3fa155');
case'nest':return post(x+.15,y+.15,z-2.6,2.6,'#8a5a3c',3)+box(x,y,z,.3,.3,.38,'#c98a5a',false)+roof2(x-.04,y-.04,z+.38,.38,.38,.2,'#b83228')+faceL(x,y+.3,z+.38,'<circle cx=".15" cy=".14" r=".06" fill="#3b2a20"/>');
case'mbox':return post(x+.25,y+.2,0,.9,IRON,4)+box(x,y,.9,.55,.4,.7,{t:'#ffb08a',l:'#e2463b',r:'#b83228'})+faceL(x,y+.4,1.6,'<rect x=".1" y=".12" width=".35" height=".05" fill="#7a1a10"/><circle cx=".28" cy=".42" r=".11" fill="#f5b72d"/>');
case'lamp':s=line(P(x,y,0),P(x,y,2.5),IRON,4);var a=P(x,y,2.5);return s+'<path d="M'+a[0]+' '+a[1]+' q12 -10 22 0" fill="none" stroke="'+IRON+'" stroke-width="4"/><path d="M'+(a[0]+14)+' '+a[1]+' h16 l-3 8 h-10z" fill="#ffe08a"/>';
case'bar':return shadow(x,y,1.4,.2)+post(x,y,0,1.7,'#7d8396')+post(x+1.3,y,0,1.7,'#7d8396')+line(P(x,y,1.7),P(x+1.3,y,1.7),'#e2463b',3)+line(P(x+.4,y,1.15),P(x+.9,y,1.15),'#f5b72d',3);
case'rope':return post(x,y,0,1.6,'#8c94a8',3)+post(x+2,y,0,1.6,'#8c94a8',3)+faceL(x,y,1.6,'<path d="M0 .05 Q1 .3 2 .05" fill="none" stroke="#fff" stroke-width=".03"/><rect x=".3" y=".15" width=".4" height=".5" fill="#ffd2dc"/><rect x=".9" y=".2" width=".5" height=".6" fill="#8fc6ff"/><rect x="1.5" y=".15" width=".35" height=".45" fill="#fff8e6"/>');
case'bikes':s=shadow(x,y,1.6,.4)+box(x,y,0,1.6,.08,.32,'#7d8396',false);[[.35,'#2f6fd6'],[1.05,'#e2463b']].forEach(function(b){var c1=P(x+b[0]-.2,y+.3,.22),c2=P(x+b[0]+.25,y+.3,.22);
s+='<circle cx="'+c1[0].toFixed(1)+'" cy="'+c1[1].toFixed(1)+'" r="9" fill="none" stroke="#27324a" stroke-width="2.4"/><circle cx="'+c2[0].toFixed(1)+'" cy="'+c2[1].toFixed(1)+'" r="9" fill="none" stroke="#27324a" stroke-width="2.4"/>'+
'<path d="M'+c1[0].toFixed(1)+' '+c1[1].toFixed(1)+' L'+((c1[0]+c2[0])/2).toFixed(1)+' '+(c1[1]-12).toFixed(1)+' L'+c2[0].toFixed(1)+' '+c2[1].toFixed(1)+'" stroke="'+b[1]+'" stroke-width="3" fill="none"/>';});return s;
case'board':return post(x+.1,y,0,1.5,WD)+post(x+1.1,y,0,1.5,WD)+box(x,y-.05,.6,1.2,.08,.85,'#e2b47c')+faceL(x,y+.03,1.45,'<rect x=".1" y=".08" width=".45" height=".55" fill="#fffaf0"/><rect x=".62" y=".1" width=".45" height=".3" fill="#fff27a"/><rect x=".64" y=".46" width=".4" height=".3" fill="#ffc2e0"/>');
case'green':return shadow(x,y,1.6,1.1)+box(x,y,0,1.6,1.1,.75,{t:'#e8f6fb',l:'#bfe3ee',r:'#9fcfdf'})+roof2(x,y,.75,1.6,1.1,.45,'#cfeaf3')+
faceL(x,y+1.1,.75,'<path d="M.4 0 v.75 M.8 0 v.75 M1.2 0 v.75" stroke="#fff" stroke-width=".04"/><circle cx=".25" cy=".6" r=".12" fill="#e2463b"/><circle cx=".6" cy=".55" r=".1" fill="#4f9e46"/><circle cx="1" cy=".6" r=".12" fill="#e2463b"/><circle cx="1.35" cy=".58" r=".1" fill="#4f9e46"/>');
case'chess':return shadow(x,y,.8,.8)+post(x+.4,y+.4,0,.5,WD,6)+box(x,y,.5,.8,.8,.08,WD2,false)+ground(x+.1,y+.1,.58,(function(){var g='',i,j;for(i=0;i<4;i++)for(j=0;j<4;j++)g+='<rect x="'+(i*.15)+'" y="'+(j*.15)+'" width=".15" height=".15" fill="'+((i+j)%2?'#3b2a20':'#f4e6c8')+'"/>';return g;})())+
box(x-.5,y+.2,0,.3,.4,.3,'#3fa155',false)+box(x+1,y+.2,0,.3,.4,.3,'#3fa155',false);
case'well':return shadow(x,y,.8,.8)+box(x,y,0,.8,.8,.5,{t:'#8a6a52',l:'#c9a07a',r:'#a37e5c'})+ground(x+.1,y+.1,.5,'<rect width=".6" height=".6" fill="#2b3a52"/>')+post(x+1.1,y+.4,0,1.3,WD)+
line(P(x-.4,y+.4,1.6),P(x+1.6,y+.4,1.0),'#8a5a3c',4)+line(P(x-.4,y+.4,1.6),P(x-.4,y+.4,.6),'#7d8396',1.6)+box(x-.5,y+.3,.45,.2,.2,.2,'#7d8396',false);
case'clock':var c=P(x,y,z);return'<circle cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="19" fill="#a9673a"/><circle cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="15" fill="#fffaf0"/><path d="M'+c[0].toFixed(1)+' '+c[1].toFixed(1)+' v-10 M'+c[0].toFixed(1)+' '+c[1].toFixed(1)+' l7 4" stroke="#27324a" stroke-width="2.4" stroke-linecap="round"/>';
case'path':return ground(x,y,.02,'<rect width="1.2" height="2.4" rx=".1" fill="#eee6d6"/><path d="M0 .6 h1.2 M0 1.2 h1.2 M0 1.8 h1.2" stroke="#dcd0bb" stroke-width=".04"/>');
case'shed':return shadow(x,y,1.6,1.2)+box(x+.15,y+.15,0,.45,.6,.6,'#3fa155')+box(x+.85,y+.15,0,.45,.6,.6,'#2f6fd6')+post(x,y+1.2,0,1.1,IRON)+post(x+1.6,y+1.2,0,1.1,IRON)+post(x+1.6,y,0,1.1,IRON)+box(x-.1,y-.1,1.1,1.8,1.4,.08,'#c7cfdc',false);
case'cathouse':return shadow(x,y,.7,.7)+box(x,y,0,.7,.7,.5,'#f5b72d')+roof2(x-.06,y-.06,.5,.82,.82,.38,'#e2463b')+faceL(x,y+.7,.5,'<path d="M.22 .5 v-.2 q.13 -.16 .26 0 v.2z" fill="#5a3a20"/>')+
at(x+.35,y+.85,0,'<path d="M-6 -2 q6 -10 12 0" fill="#f08a3a"/><path d="M-6 -2 l1 -6 l3 4 M6 -2 l-1 -6 l-3 4" fill="#f08a3a"/>');
case'pond':return ground(x,y,.02,'<ellipse cx=".9" cy=".6" rx=".95" ry=".62" fill="#d9d2c3"/><ellipse cx=".9" cy=".6" rx=".82" ry=".52" fill="#6fb2e8"/><ellipse cx=".7" cy=".45" rx=".3" ry=".12" fill="#bfe3ff" opacity=".7"/><path d="M1.2 .65 q.18 -.1 .3 0 q-.12 .08 -.3 0z" fill="#3b6b4a"/>')+
at(x+1.6,y+.2,0,'<path d="M0 0 v-30 M4 0 v-24 M-4 0 v-20" stroke="#4f9e46" stroke-width="2.4"/><ellipse cx="0" cy="-32" rx="2.6" ry="6" fill="#8a5a3c"/>');
case'veranda':return shadow(x,y,2,1.4)+box(x,y,0,2,1.4,.18,'#d9a774',false)+post(x+.06,y+1.34,.18,1.2,'#fff',4)+post(x+1.94,y+1.34,.18,1.2,'#fff',4)+post(x+1.94,y+.06,.18,1.2,'#fff',4)+
faceL(x,y+1.4,.62,'<path d="M.1 .1 h1.8" stroke="#fff" stroke-width=".06"/>'+'<path d="M.15 .1 v.42 M.35 .1 v.42 M.55 .1 v.42 M1.45 .1 v.42 M1.65 .1 v.42 M1.85 .1 v.42" stroke="#fff" stroke-width=".04"/>')+
box(x+.7,y+.45,.18,.6,.5,.3,WD2,false)+at(x+1,y+.7,.48,'<path d="M-7 0 h14 l-2 -14 h-10z" fill="#d9a441"/><rect x="-4" y="-18" width="8" height="4" fill="#b9861f"/><circle cx="0" cy="-20" r="2.4" fill="#b9861f"/><path d="M7 -6 h5" stroke="#b9861f" stroke-width="2"/>')+roof2(x-.15,y-.15,1.38,2.3,1.7,.55,'#e2463b');
case'arch':return box(x,y,0,.3,.3,2.1,'#e2463b')+box(x+1.9,y,0,.3,.3,2.1,'#e2463b')+box(x-.05,y-.02,2.1,2.3,.34,.38,'#f5b72d')+
faceL(x,y+.32,2.48,'<text x="1.15" y=".28" text-anchor="middle" font-family="ZRubik,sans-serif" font-weight="900" font-size=".24" fill="#7a1a10">ДОМ №7</text>');}
return box(x,y,0,.8,.8,.8,'#e8a24a');}
function wip(x,y,z){var t=P(x+.5,y+.5,z+2.4);return'<g opacity=".95">'+post(x+.5,y+.5,z,2.4,'#f5b72d',3)+'<path d="M'+t[0].toFixed(1)+' '+t[1].toFixed(1)+' h26 l-6 7 l6 7 h-26z" fill="#e2463b"/>'+
line(P(x-.1,y+1,z),P(x+1.1,y+1,z+1),'#f5b72d',3)+line(P(x+1.1,y+1,z),P(x-.1,y+1,z+1),'#f5b72d',3)+'</g>';}
function one(i,o,pos){var p=A.bldPos[i];if(!p)return'';var x=pos?pos[0]:p[0],y=pos?pos[1]:p[1],z=pos?pos[2]:p[2],s=draw(p[3],x,y,z,o||{});if(o&&o.wip)s='<g opacity=".55">'+s+'</g>'+wip(x,y,z);return s;}
A.bld=function(i,o){if(HAS[i]&&!(o&&o.wip))return'';return'<g class="z3h-bld" data-z3y="build-'+i+'">'+one(i,o)+'</g>';};
A.bldLayer=function(done,o){var L=(done||[]).filter(function(i){return A.bldPos[i]&&!HAS[i];}).slice().sort(function(a,b){var p=A.bldPos[a],q=A.bldPos[b];return(p[0]+p[1])-(q[0]+q[1]);});
return'<g class="z3h-layer">'+L.map(function(i){return A.bld(i,o);}).join('')+'</g>';};
function iconArt(i,o){var p=A.bldPos[i],k=p[3];if(k==='lift')return box(-.7,-.7,0,1,1,1.6,{t:'#7fe0d6',l:'#2fb3a8',r:'#1e8a82'})+faceL(-.7,.3,1.4,'<rect x=".2" y=".2" width=".6" height=".5" rx=".06" fill="#bfe3ff"/>')+post(-.9,.5,0,2.2,'#f5b72d',4)+post(.5,.5,0,2.2,'#f5b72d',4)+line(P(-.9,.5,2.2),P(.5,.5,2.2),'#f5b72d',4);
if(k==='clock')return'<g transform="translate(0 -30) scale(2.4)">'+draw('clock',0,0,0)+'</g>';if(k==='path')return one(i,o,[-.9,-1.6,0]);if(k==='nest')return one(i,o,[-.4,-.4,2]);return one(i,o,[-.6,-.6,0]);}
A.bldIcon=function(i,o){var p=A.bldPos[i];if(!p)return'';
return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -140 180 180" aria-hidden="true"><ellipse cx="10" cy="20" rx="80" ry="24" fill="#a7d775"/><ellipse cx="10" cy="18" rx="70" ry="18" fill="#b9e086"/>'+iconArt(i,o||{})+(o&&o.wip&&(p[3]==='lift'||p[3]==='clock')?wip(-.6,-.6,0):'')+'</svg>';};
})();
