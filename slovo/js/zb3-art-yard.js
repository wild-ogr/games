'use strict';
(function(){
var A=window.Z3ART=window.Z3ART||{};
var TIME='day',SEAS='sum',EVE=false,NIGHT=false,AUT=false,FESTO=[];
var SP={
sum:{grass:'#a7d775',patch:'#b9e086',far:'#a9cf8a',m:['#d9ebc2','#c3e09c','#a9d37e'],sky:['#8fc9ec','#cfe9f4','#fbf1df'],
t:{round:['#4f9e46','#6fbd52','#9ad86c'],birch:['#7fb84a','#9fd25c','#c9ea84'],apple:['#4f9e46','#6fbd52','#9ad86c'],lilac:['#7a5bb5','#9b7fd3','#c4aee9'],bush:['#4f9e46','#6fbd52','#9ad86c']}},
aut:{grass:'#c6cc72',patch:'#dcc566',far:'#d2b36a',m:['#efe2bc','#ddd094','#c9c475'],sky:['#a8c3d6','#dbe2e2','#f6e2c0'],
t:{round:['#c8741a','#e89a2a','#f7c955'],birch:['#d99a1a','#f2c33a','#ffe17a'],apple:['#b8641a','#e08a2a','#f5c060'],lilac:['#a8603a','#cf8a4a','#efb870'],bush:['#b8742a','#d99a3a','#f0c060']}},
spr:{grass:'#b4dc7e',patch:'#c9e79a',far:'#bcd99a',m:['#e4f0cc','#cfe6a8','#b6da86'],sky:['#93cdef','#d6edf6','#fdf3e4'],
t:{round:['#6fb352','#93cf63','#c3e88e'],birch:['#9ccf5a','#bfe27a','#e2f4a8'],apple:['#f2b8c8','#f8cfdb','#fff0f4'],lilac:['#8f6cc5','#b394df','#d8c6f2'],bush:['#6fb352','#93cf63','#c3e88e']}},
win:{grass:'#eef3f8',patch:'#ffffff',far:'#dbe4ee',m:['#f4f7fb','#e8eef5','#dce5ef'],sky:['#a9cbe6','#dcebf5','#f6f2ec'],
t:{round:['#6f7f74','#8a998c','#a9b5aa'],birch:['#b9b0a2','#d0c8bb','#e6e0d6'],apple:['#8a7e70','#a59a8c','#c2b8aa'],lilac:['#8a7e70','#a59a8c','#c2b8aa'],bush:['#7d8a7f','#97a398','#b4bdb4']}}
};
function TP(){return SP[SEAS]||SP.sum;}
function SPAL(k){var t=TP().t;return t[k]||t.round;}
function norm(o){var t=o.time,s=o.season;if(s==='summer')s='sum';if(s==='autumn')s='aut';if(s==='winter')s='win';if(s==='spring')s='spr';
if(!t||!s){var sc=A.scene();t=t||sc.time;s=s||sc.season;}
TIME=(t==='eve'||t==='night')?t:'day';SEAS=SP[s]?s:'sum';EVE=TIME!=='day';NIGHT=TIME==='night';AUT=SEAS==='aut';FESTO=o.fest||[];}
A.scene=function(qs){if(window.Z3&&Z3.scene)return Z3.scene(qs);var q={};try{var u=new URLSearchParams(location.search);q={t:u.get('time'),s:u.get('season'),off:u.get('off')||''};}catch(e){}
var d=new Date();try{if(typeof nowMs==='function')d=new Date(nowMs());}catch(e){}
var h=d.getHours(),m=d.getMonth(),off=/(^|,)z3time(,|$)/.test(q.off||'');
try{if(window.ZB2&&ZB2.off&&(ZB2.off('z3time')||ZB2.off('zb3')))off=true;}catch(e){}
var t=off?'day':(h>=22||h<7?'night':h>=18?'eve':'day'),s=off?'sum':(m===11||m<=1?'win':m<=4?'spr':m<=7?'sum':'aut');
if(q.t==='day'||q.t==='eve'||q.t==='night')t=q.t;if(SP[q.s])s=q.s;
if(qs){if(qs.t==='eve'||qs.t==='day'||qs.t==='night')t=qs.t;if(qs.s==='autumn')s='aut';else if(qs.s==='summer')s='sum';else if(SP[qs.s])s=qs.s;}
return{time:t,season:s};};
var seed=7;function RS(){seed=(seed*16807)%2147483647;return seed/2147483647;}
var LITW=[],YW={ch:'',lt:''},LAMPS=[[11.2,6.1],[15.2,6.1],[5.2,9.4]];
function winLit(r){return NIGHT?(r===2||r===4||r===7):r<7;}
const U=40,CX=.866*U,CY=.5*U;
const P=(x,y,z=0)=>[(x-y)*CX,(x+y)*CY-z*U];
const pts=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
const poly=(a,fill,ex='')=>`<polygon points="${pts(a)}" fill="${fill}" ${ex}/>`;
const line=(a,b,c,w,ex='')=>`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
const faceL=(x0,Y,zT,inner,ex='')=>{const o=P(x0,Y,zT);return`<g transform="matrix(${CX} ${CY} 0 ${U} ${o[0].toFixed(1)} ${o[1].toFixed(1)})" ${ex}>${inner}</g>`};
const faceR=(X,y1,zT,inner,ex='')=>{const o=P(X,y1,zT);return`<g transform="matrix(${CX} ${-CY} 0 ${U} ${o[0].toFixed(1)} ${o[1].toFixed(1)})" ${ex}>${inner}</g>`};
const ground=(x0,y0,z,inner,ex='')=>{const o=P(x0,y0,z);return`<g transform="matrix(${CX} ${CY} ${-CX} ${CY} ${o[0].toFixed(1)} ${o[1].toFixed(1)})" ${ex}>${inner}</g>`};
function hull(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}for(const q of p.reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}return lo.slice(0,-1).concat(up.slice(0,-1))}
const SH=[.62,-.3];
function shadow(x,y,w,d,h,op=.16){const f=[[x,y],[x+w,y],[x+w,y+d],[x,y+d]];const s=f.map(([a,b])=>[a+SH[0]*h,b+SH[1]*h]);return poly(hull(f.concat(s)).map(([a,b])=>P(a,b,0.01)),`rgba(43,42,64,${op})`)}
function box(x,y,z,w,d,h,c,o={}){
const t=[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)];
const l=[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)];
const r=[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)];
let s=(o.noTop?'':poly(t,c.t))+poly(l,c.l)+poly(r,c.r);
if(o.ao!==false&&h>.6){s+=faceL(x,y+d,z+h,`<rect width="${w}" height="${h}" fill="url(#gAO)"/>`)+faceR(x+w,y+d,z+h,`<rect width="${d}" height="${h}" fill="url(#gAO)"/>`)}
if(o.edge!==false)s+=`<polyline points="${pts([P(x,y+d,z+h),P(x+w,y+d,z+h),P(x+w,y,z+h)])}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6" stroke-linejoin="round"/>`;
return s;
}
function tree(x,y,k='round',s=1){
const b=P(x,y,0);const h=(k==='bush'?.2:k==='lilac'?.4:2.2)*s*U;const r=(k==='bush'?.9:k==='lilac'?1.05:1.35)*s*U;
const pal=SPAL(k);
const cx=b[0],cy=b[1]-h-r*.55;
let s2=`<ellipse cx="${cx+r*.55}" cy="${b[1]+2}" rx="${r*1.1}" ry="${r*.42}" fill="rgba(43,42,64,.16)"/>`;
if(k!=='bush'&&k!=='lilac'){const tw=r*.16;s2+=`<path d="M${cx-tw} ${b[1]} L${cx-tw*.6} ${cy} L${cx+tw*.6} ${cy} L${cx+tw} ${b[1]}Z" fill="${k==='birch'?'#f1ede4':'#8a5a3c'}"/>`+(k==='birch'?`<path d="M${cx-tw*.8} ${b[1]-h*.3} h${tw*.9} M${cx} ${b[1]-h*.6} h${tw*.8} M${cx-tw*.6} ${b[1]-h*.85} h${tw*.7}" stroke="#4a4038" stroke-width="2.4"/>`:`<path d="M${cx+tw*.2} ${b[1]} L${cx+tw*.5} ${cy} L${cx+tw} ${b[1]}Z" fill="#6e452c"/>`)}
const cl=k==='birch'?[[0,0,.75],[-.55,.3,.5],[.55,.28,.52],[0,-.55,.55],[-.35,-.3,.45],[.38,-.32,.45]]:[[0,0,.8],[-.6,.25,.55],[.6,.25,.55],[0,-.5,.6],[-.4,-.25,.5],[.42,-.28,.5]];
const g=(dx,dy,rr,c)=>`<circle cx="${(cx+dx*r).toFixed(1)}" cy="${(cy+dy*r).toFixed(1)}" r="${(rr*r).toFixed(1)}" fill="${c}"/>`;
let cr=cl.map(([a,b2,rr])=>g(a,b2+.06,rr,pal[0])).join('')+cl.map(([a,b2,rr])=>g(a-.06,b2-.06,rr*.86,pal[1])).join('')+cl.slice(3).map(([a,b2,rr])=>g(a-.14,b2-.16,rr*.5,pal[2])).join('')+g(-.3,-.45,.22,pal[2]);
if(k==='apple')[[-.4,.1],[.3,-.2],[.5,.3],[-.1,.45],[0,-.6],[-.6,-.25]].forEach(([a,b2])=>cr+=`<circle cx="${cx+a*r}" cy="${cy+b2*r}" r="${r*.09}" fill="#e2463b"/><circle cx="${cx+a*r-r*.03}" cy="${cy+b2*r-r*.03}" r="${r*.03}" fill="#fff" opacity=".8"/>`);
if(k==='lilac')[[-.4,0],[.3,-.3],[.5,.2],[-.1,.35],[0,-.55]].forEach(([a,b2])=>cr+=`<circle cx="${cx+a*r}" cy="${cy+b2*r}" r="${r*.13}" fill="#e7dbff" opacity=".85"/>`);
if(k==='bush')[[-.4,0],[.3,-.3],[.5,.25],[-.1,.35],[0,-.5],[-.6,-.3]].forEach(([a,b2],i)=>cr+=`<circle cx="${cx+a*r}" cy="${cy+b2*r}" r="${r*.1}" fill="${['#ff8fb0','#ffd54a','#fff'][i%3]}"/>`);
return s2+`<g class="z3a-sway" style="animation-delay:${(-RS()*4).toFixed(2)}s">${cr}</g>`;
}
function lamp(x,y){const a=P(x,y,0),b=P(x,y,2.5);return`<ellipse cx="${a[0]+12}" cy="${a[1]+2}" rx="14" ry="5" fill="rgba(43,42,64,.15)"/>`+line(a,b,'#4a4f63',4)+`<path d="M${b[0]} ${b[1]} q12 -10 22 0" fill="none" stroke="#4a4f63" stroke-width="4" stroke-linecap="round"/><path d="M${b[0]+14} ${b[1]-1} h16 l-3 8 h-10z" fill="#4a4f63"/><ellipse cx="${b[0]+22}" cy="${b[1]+8}" rx="6" ry="3" fill="#fff4b8" class="z3a-glow"/>`}
function flowers(x0,x1,y,z){let s='';for(let x=x0+.15;x<x1-.1;x+=.28){const p=P(x,y+RS()*.4,z);const c=['#e2463b','#f5b72d','#ff8fb0','#fff','#9b7fd3'][Math.floor(RS()*5)];s+=`<circle cx="${p[0]}" cy="${p[1]+2}" r="5" fill="#5aa84a"/><circle cx="${p[0]}" cy="${p[1]-4}" r="4.2" fill="${c}"/><circle cx="${p[0]}" cy="${p[1]-4}" r="1.6" fill="#ffd54a"/>`}return s}
const HOUSE={x:5,y:.8,w:16,d:3.2,h:10};
const COLS=[5.7,7.3,8.9,10.5,14.4,16.0,17.6,19.2];
const KIT={x:10.5,k:1};
function winEl(u,w,o={}){
const ww=1,hh=1.25;let s=`<rect x="${u-.07}" y="${w-.07}" width="${ww+.14}" height="${hh+.14}" rx=".07" fill="#fffaf2"/>`;
s+=`<rect x="${u+.05}" y="${w+.05}" width="${ww-.1}" height="${hh-.1}" rx=".03" fill="${o.lit?'url(#gWarm)':'url(#gGlass)'}"/>`;
s+=`<rect x="${u+.05}" y="${w+.05}" width="${ww-.1}" height=".12" fill="rgba(0,0,0,.14)"/>`;
if(o.cur)s+=`<path d="M${u+.05} ${w+.05} h.3 q-.12 .55 0 1.1 h-.3z" fill="${o.cur}"/><path d="M${u+ww-.05} ${w+.05} h-.3 q.12 .55 0 1.1 h.3z" fill="${o.cur}"/>`;
if(o.plant)s+=`<circle cx="${u+.72}" cy="${w+1.0}" r=".14" fill="#5aa84a"/><rect x="${u+.62}" y="${w+1.04}" width=".2" height=".14" fill="#c96a3a"/>`;
s+=`<path d="M${u+.12} ${w+.75} L${u+.55} ${w+.12} L${u+.75} ${w+.12} L${u+.12} ${w+1.05}Z" fill="#fff" opacity="${o.lit?.2:.35}"/>`;
s+=`<rect x="${u+ww/2-.025}" y="${w+.05}" width=".05" height="${hh-.1}" fill="#fffaf2"/><rect x="${u+.05}" y="${w+.45}" width="${ww-.1}" height=".05" fill="#fffaf2"/>`;
s+=`<rect x="${u-.12}" y="${w+hh+.04}" width="${ww+.24}" height=".09" fill="#fff" opacity=".85"/>`;
if(o.box)s+=`<rect x="${u-.04}" y="${w+hh+.12}" width="${ww+.08}" height=".2" rx=".04" fill="#c96a3a"/>`+[.1,.3,.5,.7,.9].map((d,i)=>`<circle cx="${u+d}" cy="${w+hh+.1}" r=".09" fill="${['#e2463b','#ff8fb0','#f5b72d'][i%3]}"/>`).join('');
return s;
}
function facade(){
const H=HOUSE;let s='';const L=H.w;
for(let k=1;k<5;k++)s+=`<rect x="0" y="${H.h-2*k-.02}" width="${L}" height=".04" fill="rgba(160,100,70,.16)"/>`;
for(let u=3.2;u<L;u+=3.2)s+=`<rect x="${u-.02}" y="0" width=".04" height="${H.h}" fill="rgba(160,100,70,.12)"/>`;
s+=`<rect x="0" y="0" width="${L}" height=".28" fill="#fde6d4"/><rect x="0" y="${H.h-.5}" width="${L}" height=".5" fill="#e3b394"/>`;
const cur=['#e2463b','#2f6fd6','#f5b72d','#ff8fb0','#34a853','#9b7fd3'];
for(let k=0;k<5;k++)COLS.forEach((x,i)=>{
const u=x-H.x,w=H.h-(.6+2*k)-1.25;if(k===KIT.k&&x===KIT.x)return;
const r=(k*7+i*3)%10;const lt=EVE?winLit(r):(r===2||r===7);if(EVE&&lt)LITW.push([u,w]);s+=winEl(u,w,{lit:lt,cur:r%3===0?cur[(i+k)%6]:'',box:(k+i)%4===1,plant:r===5});
});
for(let k=1;k<5;k++)s+=`<rect x="${12.65-H.x-.22}" y="${H.h-(1.6+2*k)-.75}" width=".44" height=".8" rx=".05" fill="url(#gGlass)"/><rect x="${12.65-H.x-.28}" y="${H.h-(1.6+2*k)-.81}" width=".56" height=".92" rx=".07" fill="none" stroke="#fffaf2" stroke-width=".07"/>`;
const du=12.1-H.x;s+=`<rect x="${du-.12}" y="${H.h-2.05}" width="1.34" height="2.05" rx=".08" fill="#e9c3a4"/><rect x="${du}" y="${H.h-1.95}" width="1.1" height="1.95" rx=".05" fill="#2a8f8a"/><rect x="${du+.54}" y="${H.h-1.95}" width=".03" height="1.95" fill="#1e6f6b"/>
    <rect x="${du+.12}" y="${H.h-1.8}" width=".32" height=".7" rx=".04" fill="url(#gGlass)"/><rect x="${du+.66}" y="${H.h-1.8}" width=".32" height=".7" rx=".04" fill="url(#gGlass)"/><circle cx="${du+.46}" cy="${H.h-.9}" r=".04" fill="#f5b72d"/><circle cx="${du+.64}" cy="${H.h-.9}" r=".04" fill="#f5b72d"/>`;
s+=`<circle cx="${12.65-H.x}" cy="${H.h-2.95}" r=".3" fill="#2f6fd6"/><text x="${12.65-H.x}" y="${H.h-2.82}" text-anchor="middle" font-family="Rubik" font-weight="900" font-size=".38" fill="#fff">7</text>`;
s+=`<rect x=".4" y=".55" width="2.3" height=".52" rx=".1" fill="#2f6fd6"/><text x="1.55" y=".93" text-anchor="middle" font-family="Rubik" font-weight="800" font-size=".32" fill="#fff">Садовая, 7</text>`;
s+=`<rect x="0" y="0" width="${L}" height="${H.h}" fill="url(#gAO)" opacity=".7"/>`;
return s;
}
function endWall(){
const D=HOUSE.d;let r='';for(let i=0;i<12;i++){const a=i*Math.PI/6;r+=`<path d="M${D/2} 4.2 L${D/2+Math.cos(a-.12)*1.2} ${4.2+Math.sin(a-.12)*1.2} L${D/2+Math.cos(a+.12)*1.2} ${4.2+Math.sin(a+.12)*1.2}Z" fill="#f5b72d" opacity=".75"/>`}
return`<rect x=".35" y="2.2" width="${D-.7}" height="5.2" rx=".2" fill="#cfe6f2" opacity=".55"/>${r}<circle cx="${D/2}" cy="4.2" r=".7" fill="#f5b72d"/><path d="M.35 6.4 q.8 -.6 1.3 0 t1.3 0 V7.4 H.35z" fill="#7fb6d9" opacity=".8"/><text x="${D/2}" y="7.05" text-anchor="middle" font-family="Rubik" font-weight="900" font-size=".42" fill="#fff" opacity=".9">1975</text>`;
}
function yardWorld(opt={}){
seed=11;const H=HOUSE;let s='';let CHL='';LITW=[];const TPS=TP();
const CH={t:'#efe4d4',l:'#f7d4b8',r:'#d9a98d'};
[[-9,-14,3,3,6],[-4,-15,4,3,7],[2,-14,3.5,3,5],[8,-15,5,3,7],[16,-14.5,3,3,5],[22,-15,5,3,7],[-15,-8,3,4,6]].forEach(([x,y,w,d,h])=>{s+=`<g opacity=".42">${box(x,y,0,w,d,h,{t:'#eef1f6',l:'#dfe6f0',r:'#c9d3e2'},{ao:false,edge:false})}${faceL(x,y+d,h,[...Array(Math.floor(h/1.5))].map((_,k)=>[...Array(Math.floor(w/1))].map((_,i)=>`<rect x="${i+.3}" y="${k*1.5+.5}" width=".45" height=".6" fill="#b8c6dc"/>`).join('')).join(''))}</g>`});
[[-2,-7],[5,-7.5],[12,-8],[19,-7],[26,-7.5],[-8,-4]].forEach(([x,y])=>{const p=P(x,y,0);s+=`<g opacity=".6">${[[0,-40,34],[-26,-24,24],[26,-22,26]].map(([a,b,r])=>`<circle cx="${p[0]+a}" cy="${p[1]+b}" r="${r}" fill="${TP().far}"/>`).join('')}</g>`});
s+=box(0,0,-.35,26,14,.35,{t:TPS.grass,l:'#e3dccd',r:'#c7bea9'},{ao:false});
s+=ground(0,0,0,`<g fill="${TPS.patch}" opacity=".7">${[[3,9,2.2,1.2],[16,11,3,1.4],[22,4,2,1],[8,12,2,1]].map(([a,b,c,d])=>`<ellipse cx="${a}" cy="${b}" rx="${c}" ry="${d}"/>`).join('')}</g>`);
if(AUT)s+=ground(0,0,.01,leafDots());
s+=ground(4.5,4.7,.01,`<rect width="17" height="1.1" fill="#e9e1d2"/><rect y="1.05" width="17" height=".08" fill="#d7ccb7"/>`);
s+=ground(11.8,5.8,.01,`<rect width="1.7" height="8.2" fill="#eee6d6"/>${[...Array(16)].map((_,i)=>`<rect x="0" y="${i*.5+.48}" width="1.7" height=".04" fill="#dcd0bb"/>`).join('')}<rect x=".84" y="0" width=".03" height="8.2" fill="#dcd0bb"/>`);
s+=ground(4.4,6.6,.01,`<rect width="7.4" height="1" fill="#eee6d6"/><rect x="9.1" width="11" height="1" fill="#eee6d6"/>`);
const Sx=.8,Sy=6,Sw=3.4,Sd=7,Sh=6;
s+=shadow(Sx,Sy,Sw,Sd,Sh,.14);
s+=box(Sx,Sy,0,Sw,Sd,Sh,{t:'#e7cf9c',l:'#f2d498',r:'#d6b072'});
s+=faceR(Sx+Sw,Sy+Sd,Sh,(()=>{let f='';[[.5,0],[1.7,0],[4.5,0],[5.7,0]].forEach(([u])=>[0,1,2].forEach(k=>{const w=Sh-(.5+2*k)-1.2;f+=`<rect x="${u-.06}" y="${w-.06}" width=".92" height="1.32" rx=".06" fill="#fffaf2"/><rect x="${u+.04}" y="${w+.04}" width=".72" height="1.12" fill="url(#gGlass)"/><rect x="${u+.38}" y="${w+.04}" width=".05" height="1.12" fill="#fffaf2"/><rect x="${u+.04}" y="${w+.42}" width=".72" height=".05" fill="#fffaf2"/>`}));
f+=`<rect x="2.85" y="0" width="1.3" height="${Sh}" fill="#f7e2b4"/><path d="M3.05 ${Sh} V${Sh-1.2} q.45 -.55 .9 0 V${Sh}z" fill="#2f6fd6"/><rect x="3.48" y="${Sh-1.45}" width=".04" height="1.45" fill="#1d4fa3"/>`;
f+=`<rect x="2.35" y="2.4" width="2.3" height=".58" rx=".08" fill="#3d4a6b"/><text x="3.5" y="2.81" text-anchor="middle" font-family="Rubik" font-weight="800" font-size=".34" fill="#fff">ШКОЛА №7</text>`;
f+=`<rect x="0" y="${Sh-.4}" width="7" height=".4" fill="#c9a064"/><rect x="0" y="0" width="7" height="${Sh}" fill="url(#gAO)" opacity=".6"/>`;return f})());
s+=faceL(Sx,Sy+Sd,Sh,`<rect x=".45" y="1.3" width=".9" height="1.2" fill="#fffaf2"/><rect x=".55" y="1.4" width=".7" height="1" fill="url(#gGlass)"/><rect x="2.05" y="1.3" width=".9" height="1.2" fill="#fffaf2"/><rect x="2.15" y="1.4" width=".7" height="1" fill="url(#gGlass)"/><rect x=".45" y="3.6" width=".9" height="1.2" fill="#fffaf2"/><rect x=".55" y="3.7" width=".7" height="1" fill="url(#gGlass)"/><rect x="2.05" y="3.6" width=".9" height="1.2" fill="#fffaf2"/><rect x="2.15" y="3.7" width=".7" height="1" fill="url(#gGlass)"/>
     <polygon points="-.15,0 ${Sw+.15},0 ${Sw/2},-1.6" fill="#f7dca6"/><circle cx="${Sw/2}" cy="-.6" r=".38" fill="#fff"/><path d="M${Sw/2} -.6 V-.86 M${Sw/2} -.6 L${Sw/2+.18} -.5" stroke="#27324a" stroke-width=".06" stroke-linecap="round"/>`);
s+=poly([P(Sx+Sw+.25,Sy-.25,Sh-.1),P(Sx+Sw+.25,Sy+Sd+.25,Sh-.1),P(Sx+Sw/2,Sy+Sd+.25,Sh+1.6),P(Sx+Sw/2,Sy-.25,Sh+1.6)],'#9a6a52');
s+=poly([P(Sx+Sw+.25,Sy+Sd+.25,Sh-.1),P(Sx+Sw/2,Sy+Sd+.25,Sh+1.6),P(Sx-.25,Sy+Sd+.25,Sh-.1),P(Sx-.25,Sy+Sd+.05,Sh-.1),P(Sx+Sw/2,Sy+Sd+.05,Sh+1.45),P(Sx+Sw+.25,Sy+Sd+.05,Sh-.1)],'#7a5040');
for(let i=1;i<7;i++)s+=line(P(Sx+Sw+.2,Sy+i,Sh-.05),P(Sx+Sw/2,Sy+i,Sh+1.55),'rgba(0,0,0,.08)',2);
{const a=P(Sx+Sw/2,Sy+1.2,Sh+1.6),b=P(Sx+Sw/2,Sy+1.2,Sh+3.2);s+=line(a,b,'#8c94a8',3)+`<path d="M${b[0]} ${b[1]} h30 q-6 9 0 18 h-30z" fill="#e2463b" class="z3a-sway"/>`}
s+=shadow(H.x,H.y,H.w,H.d,H.h,.12);
s+=box(H.x,H.y,0,H.w,H.d,H.h,CH,{ao:false});
s+=faceL(H.x,H.y+H.d,H.h,facade());
s+=faceR(H.x+H.w,H.y+H.d,H.h,endWall()+`<rect x="0" y="0" width="${H.d}" height="${H.h}" fill="url(#gAO)" opacity=".6"/>`);
s+=box(H.x,H.y+H.d-.18,H.h,H.w,.18,.3,{t:'#f7efe2',l:'#f2d2b8',r:'#d9a98d'},{ao:false,edge:false});
s+=box(H.x+H.w-.18,H.y,H.h,.18,H.d,.3,{t:'#f7efe2',l:'#f2d2b8',r:'#d9a98d'},{ao:false,edge:false});
s+=box(18.6,1.3,H.h,1.6,1.5,1.2,{t:'#efe4d4',l:'#e9c8ad',r:'#cf9f84'});
s+=box(8,1.6,H.h,.8,.8,.6,{t:'#efe4d4',l:'#e9c8ad',r:'#cf9f84'})+box(13.5,1.6,H.h,.8,.8,.6,{t:'#efe4d4',l:'#e9c8ad',r:'#cf9f84'});
[[7,2.4],[11,2.2],[15.6,2.6]].forEach(([x,y])=>{const a=P(x,y,H.h),b=P(x,y,H.h+1.6);s+=line(a,b,'#7d8396',2.4)+line([b[0]-14,b[1]+8],[b[0]+14,b[1]-6],'#7d8396',2.4)+line([b[0]-10,b[1]+16],[b[0]+10,b[1]+5],'#7d8396',2.4)});
{const p=P(10,3.6,H.h+.3);s+=`<g><ellipse cx="${p[0]}" cy="${p[1]}" rx="9" ry="6" fill="#b9bfd0"/><circle cx="${p[0]+7}" cy="${p[1]-5}" r="4.6" fill="#b9bfd0"/><path d="M${p[0]+11} ${p[1]-5} l4 1 l-4 2z" fill="#f5b72d"/></g>`}
[[6,11.4],[14,20.6]].forEach(([a,b])=>{s+=box(a,4,0,b-a,.65,.22,{t:'#8a5a3c',l:'#f4efe6',r:'#d9d2c3'},{ao:false})+flowers(a,b,4.05,.25)});
s+=box(11.7,4,0,1.9,.6,.14,{t:'#e9e4da',l:'#d6d0c4',r:'#bfb7a8'},{ao:false});
s+=line(P(11.85,4.85,0),P(11.85,4.85,2.15),'#c7bea9',3)+line(P(13.45,4.85,0),P(13.45,4.85,2.15),'#c7bea9',3);
s+=box(11.7,4,2.15,1.9,.95,.2,{t:'#f26b5e',l:'#e2463b',r:'#b83228'},{ao:false});
{const p=P(12.65,4,2.6);s+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="9" ry="5" fill="#fff6c8" class="z3a-glow"/>`}
{const u=KIT.x-H.x,w=H.h-(.6+2*KIT.k)-1.25;
CHL+=faceL(H.x,H.y+H.d,H.h,`<ellipse cx="${u+.5}" cy="${w+.6}" rx="1.6" ry="1.3" fill="url(#gGlowW)" class="z3a-glow"/>`+winEl(u,w,{lit:1})+`<path d="M${u+.05} ${w+.05} h.3 q-.12 .55 0 1.1 h-.3z M${u+.95} ${w+.05} h-.3 q.12 .55 0 1.1 h.3z" fill="url(#pDots)"/><path d="M${u-.1} ${w-.1} h1.2 v.2 q-.1 .12 -.2 0 q-.1 .12 -.2 0 q-.1 .12 -.2 0 q-.1 .12 -.2 0 q-.1 .12 -.2 0 q-.1 .12 -.2 0z" fill="#e2463b"/>`);
const c=P(KIT.x+.5,H.y+H.d+.05,(.6+2*KIT.k)+1.25*.55);const zw=2.3*U;
const sill=P(KIT.x+.5,H.y+H.d,(.6+2*KIT.k)+.06);
CHL+=`<clipPath id="kitClip"><polygon points="${pts([P(KIT.x-.6,H.y+H.d,(.6+2*KIT.k)+.07),P(KIT.x+1.6,H.y+H.d,(.6+2*KIT.k)+.07),P(KIT.x+1.6,H.y+H.d,(.6+2*KIT.k)+3.5),P(KIT.x-.6,H.y+H.d,(.6+2*KIT.k)+3.5)])}"/></clipPath>
     <g clip-path="url(#kitClip)"><g class="z3a-bobz">${zinaSVG('happy').replace('<svg',`<svg x="${(c[0]-zw/2).toFixed(1)}" y="${(sill[1]-zw*.86).toFixed(1)}" width="${zw}" height="${zw}"`)}</g></g>`;
CHL+=faceL(H.x,H.y+H.d,H.h,`<rect x="${u-.18}" y="${w+1.27}" width="1.36" height=".12" fill="#fff"/><rect x="${u-.05}" y="${w+1.38}" width="1.1" height=".24" rx=".05" fill="#c96a3a"/>`+[.1,.32,.55,.78,.95].map((d,i)=>`<circle cx="${u+d}" cy="${w+1.33}" r=".11" fill="${['#e2463b','#ff8fb0','#f5b72d'][i%3]}"/><circle cx="${u+d+.06}" cy="${w+1.42}" r=".08" fill="#5aa84a"/>`).join(''));
}
{const bx=15.75,bz=.6+2*2-.15;s+=box(bx+.6,H.y+H.d+.12,bz+.15,.62,.45,.72,{t:'#c98a5a',l:'#a9673a',r:'#8a5030'},{ao:false})+faceL(bx+.6,H.y+H.d+.57,bz+.87,`<rect x=".06" y=".1" width=".5" height=".2" rx=".04" fill="#e8b47a"/><rect x=".06" y=".38" width=".5" height=".2" rx=".04" fill="#e8b47a"/>`);
s+=box(bx+.68,H.y+H.d+.2,bz+.87,.44,.3,.08,{t:'#9b63e0',l:'#7d45c7',r:'#5b2e9a'},{ao:false,edge:false});
s+=box(bx,H.y+H.d,bz,1.9,.95,.15,{t:'#f4ece0',l:'#e3cdb8',r:'#c9ab92'},{ao:false});
s+=faceL(bx,H.y+H.d+.95,bz+.95,`<rect x="0" y="0" width="1.9" height=".08" fill="#fff"/>${[...Array(10)].map((_,i)=>`<rect x="${i*.2+.02}" y=".05" width=".05" height=".8" fill="#fff" opacity=".95"/>`).join('')}`);
s+=faceR(bx+1.9,H.y+H.d+.95,bz+.95,`<rect x="0" y="0" width=".95" height=".08" fill="#eee"/>${[...Array(5)].map((_,i)=>`<rect x="${i*.2+.02}" y=".05" width=".05" height=".8" fill="#e6e6e6"/>`).join('')}`);}
{const lx=21.6,ly=1.2,lw=2,ld=2,lh=12.6;
s+=shadow(lx,ly,lw,ld,lh*.6,.08);
s+=line(P(lx,ly,0),P(lx,ly,lh),'#e3a21a',5)+line(P(lx+lw,ly,0),P(lx+lw,ly,lh),'#e3a21a',5)+line(P(lx,ly+ld,0),P(lx,ly+ld,lh),'#e3a21a',5);
s+=`<g class="z3a-lift">${box(lx+.25,ly+.25,1.1,1.5,1.5,1.9,{t:'#7fe0d6',l:'#2fb3a8',r:'#1e8a82'})}${faceL(lx+.25,ly+1.75,3.0,`<rect x=".25" y=".3" width="1" height=".7" rx=".08" fill="url(#gGlass)"/>`)}</g>`;
let br='';for(let z=0;z<lh-.2;z+=1.4)br+=`<path d="M0 ${z} L${lw} ${z+1.4} M${lw} ${z} L0 ${z+1.4}" stroke="#f5b72d" stroke-width=".09"/><rect x="0" y="${z-.04}" width="${lw}" height=".1" fill="#f5b72d"/>`;
s+=faceL(lx,ly+ld,lh,br)+faceR(lx+lw,ly+ld,lh,br);
s+=line(P(lx+lw,ly+ld,0),P(lx+lw,ly+ld,lh),'#f5b72d',6);
s+=box(lx-.1,ly-.1,lh,lw+.2,ld+.2,.2,{t:'#ffd25e',l:'#f5b72d',r:'#d48c10'},{ao:false,edge:false});
const m0=P(24.6,2.2,0),m1=P(24.6,2.2,15.2);s+=line(m0,m1,'#e3a21a',8)+line(P(24.85,2.2,0),P(24.85,2.2,15.2),'#f5b72d',3);
const j0=P(16.8,2.2,15.2),j1=P(26.4,2.2,15.2);s+=line(j0,j1,'#f5b72d',7)+line(P(24.6,2.2,16.6),j0,'#c9cfdc',2)+line(P(24.6,2.2,16.6),j1,'#c9cfdc',2)+line(m1,P(24.6,2.2,16.6),'#e3a21a',5);
s+=box(25.6,1.9,14.7,.9,.7,.6,{t:'#c9cfdc',l:'#9aa3b8',r:'#7d8396'},{ao:false,edge:false})+box(24.2,1.8,14.3,.8,.8,.7,{t:'#8fc6ff',l:'#2f6fd6',r:'#1d4fa3'},{ao:false});
const hk=P(19.2,2.2,15.2),hb=P(19.2,2.2,11.6);s+=`<g class="z3a-hook">${line(hk,hb,'#4a4f63',1.6)}<g transform="translate(${hb[0]-20} ${hb[1]})"><rect width="40" height="30" rx="5" fill="#c98a5a"/><rect y="0" width="40" height="8" rx="4" fill="#e3a36a"/><path d="M20 9 l3.5 7 l7.5 1 l-5.5 5 l1.5 7.5 l-7 -4 l-7 4 l1.5 -7.5 l-5.5 -5 l7.5 -1z" fill="#ffe08a"/></g></g>`;
s+=faceL(20.8,4.1,.55,`<rect width="3.6" height=".42" rx=".1" fill="url(#pStripe)"/><rect x=".2" y=".42" width=".08" height=".2" fill="#8c94a8"/><rect x="3.3" y=".42" width=".08" height=".2" fill="#8c94a8"/>`);
[[24.6,4.6],[25.1,3.9]].forEach(([x,y])=>{const p=P(x,y,0);s+=`<path d="M${p[0]-8} ${p[1]} L${p[0]} ${p[1]-26} L${p[0]+8} ${p[1]}Z" fill="#ff7a2a"/><path d="M${p[0]-5} ${p[1]-9} h10 M${p[0]-3} ${p[1]-17} h6" stroke="#fff" stroke-width="3"/>`});
}
{const a=P(5.4,6.4,0),b=P(5.4,6.4,2.2),c=P(8.4,6.4,0),d=P(8.4,6.4,2.2);s+=line(a,b,'#8c94a8',3)+line(c,d,'#8c94a8',3);
s+=faceL(5.4,6.4,2.2,`<path d="M0 .1 Q1.5 .45 3 .1" fill="none" stroke="#fff" stroke-width=".035"/>
     <g class="z3a-cloth"><rect x=".35" y=".2" width=".7" height=".9" fill="#ffd2dc"/><rect x=".35" y=".2" width=".7" height=".12" fill="#ffb3c4"/></g>
     <g class="z3a-cloth" style="animation-delay:-.8s"><path d="M1.25 .27 h.7 l.18 .25 l-.16 .1 v.6 h-.74 v-.6 l-.16 -.1z" fill="#8fc6ff"/></g>
     <g class="z3a-cloth" style="animation-delay:-1.4s"><rect x="2.15" y=".22" width=".55" height=".75" fill="#fff8e6"/><path d="M2.15 .5 h.55 M2.15 .7 h.55" stroke="#e2463b" stroke-width=".05"/></g>`)}
{const bx=8.6,by=6.7;s+=shadow(bx,by-.1,2.2,.15,2.6,.12)+line(P(bx+.1,by,0),P(bx+.1,by,2.5),'#8a5a3c',4)+line(P(bx+2.1,by,0),P(bx+2.1,by,2.5),'#8a5a3c',4);
s+=box(bx-.1,by-.25,2.45,2.4,.4,.14,{t:'#f26b5e',l:'#e2463b',r:'#b83228'},{ao:false,edge:false});
s+=faceL(bx,by,2.45,`<rect x="0" y=".05" width="2.2" height="1.5" rx=".08" fill="#a8693c"/><rect x=".1" y=".15" width="2" height="1.3" rx=".05" fill="#e2b47c"/>
     <g transform="rotate(-3 .7 .8)"><rect x=".2" y=".22" width="1.05" height="1.15" fill="#fffaf0"/><text x=".72" y=".46" text-anchor="middle" font-family="Lobster" font-size=".22" fill="#d0342c">Вечёрка</text><rect x=".28" y=".53" width=".42" height=".32" fill="#9fd0ec"/><path d="M.3 .85 l.15 -.17 l.1 .1 l.08 -.06 l.08 .13z" fill="#5aa84a"/>${[.58,.66,.74,.82].map(y=>`<rect x=".76" y="${y}" width=".42" height=".035" fill="#bdae98"/>`).join('')}${[.95,1.03,1.11,1.19,1.27].map(y=>`<rect x=".28" y="${y}" width=".9" height=".035" fill="#bdae98"/>`).join('')}</g>
     <rect x="1.42" y=".25" width=".55" height=".5" fill="#fff27a" transform="rotate(6 1.7 .5)"/><rect x="1.42" y=".85" width=".55" height=".48" fill="#ffc2e0" transform="rotate(-5 1.7 1.1)"/><circle cx=".72" cy=".24" r=".06" fill="#e2463b"/><circle cx="1.7" cy=".27" r=".05" fill="#2f6fd6"/>`);}
{const mx=14.3,my=5.75;s+=line(P(mx+.3,my+.2,0),P(mx+.3,my+.2,1),'#7d8396',4);
s+=box(mx,my,1,.65,.45,.85,{t:'#7fb0f5',l:'#2f6fd6',r:'#1d4fa3'},{ao:false});
s+=faceL(mx,my+.45,1.85,`<rect x=".1" y=".12" width=".45" height=".06" rx=".03" fill="#123f80"/><circle cx=".33" cy=".52" r=".16" fill="#f5b72d"/><path d="M.24 .47 h.18 v.12 h-.18z M.24 .47 l.09 .06 l.09 -.06" fill="#fff8e0" stroke="#b9860f" stroke-width=".02"/>`);
const e=P(mx+.32,my+.2,1.9);s+=`<g class="z3a-env"><rect x="${e[0]-9}" y="${e[1]-14}" width="18" height="13" rx="2" fill="#fffaf0" transform="rotate(-10 ${e[0]} ${e[1]})"/><circle cx="${e[0]}" cy="${e[1]-8}" r="2.5" fill="#e2463b"/></g>`;}
{const x=16.4,y=8,w=2.6,d=2.6;s+=box(x,y,0,w,.18,.32,{t:'#e9b27a',l:'#c98a5a',r:'#a96a3a'},{ao:false,edge:false})+box(x,y,0,.18,d,.32,{t:'#e9b27a',l:'#c98a5a',r:'#a96a3a'},{ao:false,edge:false});
s+=ground(x+.18,y+.18,.22,`<rect width="${w-.36}" height="${d-.36}" fill="#f6dea2"/><circle cx=".7" cy="1.4" r=".25" fill="#efd08a"/><circle cx="1.6" cy=".7" r=".2" fill="#efd08a"/>`);
s+=box(x,y+d-.18,0,w,.18,.32,{t:'#e9b27a',l:'#c98a5a',r:'#a96a3a'},{ao:false,edge:false})+box(x+w-.18,y,0,.18,d,.32,{t:'#e9b27a',l:'#c98a5a',r:'#a96a3a'},{ao:false,edge:false});
const a=P(x+1.3,y+1.3,0),b=P(x+1.3,y+1.3,1.7);s+=`<ellipse cx="${a[0]+30}" cy="${a[1]}" rx="34" ry="12" fill="rgba(43,42,64,.14)"/>`+line(a,b,'#f4efe6',6)+`<path d="M${b[0]-40} ${b[1]+8} Q${b[0]} ${b[1]-38} ${b[0]+40} ${b[1]+8} Q${b[0]} ${b[1]+18} ${b[0]-40} ${b[1]+8}Z" fill="#e2463b"/><path d="M${b[0]-40} ${b[1]+8} Q${b[0]} ${b[1]+18} ${b[0]+40} ${b[1]+8} Q${b[0]} ${b[1]+24} ${b[0]-40} ${b[1]+8}Z" fill="#b83228"/>`+[[-22,-4,4],[2,-16,5],[22,-3,4],[-6,2,3.5]].map(([dx,dy,r])=>`<circle cx="${b[0]+dx}" cy="${b[1]+dy}" r="${r}" fill="#fff"/>`).join('');
const s0=P(19.8,6.6,0),s1=P(19.8,6.6,2.3),s2=P(21.4,6.6,0),s3=P(21.4,6.6,2.3);s+=line(s0,s1,'#2f6fd6',4)+line(s2,s3,'#2f6fd6',4)+line(s1,s3,'#2f6fd6',4);
const sm=P(20.6,6.6,2.3);s+=`<g class="z3a-swing"><path d="M${sm[0]-6} ${sm[1]} v40 M${sm[0]+6} ${sm[1]-4} v40" stroke="#7d8396" stroke-width="1.6"/><rect x="${sm[0]-12}" y="${sm[1]+38}" width="24" height="6" rx="2" fill="#e2463b"/></g>`;}
{const bx=12.2,by=9.6;s+=shadow(bx,by-.4,2.6,.6,.9,.12);
s+=box(bx,by-.45,.55,2.6,.12,.62,{t:'#5bbf6a',l:'#3fa155',r:'#2e7d40'},{ao:false,edge:false});
s+=box(bx,by-.32,.45,2.6,.6,.1,{t:'#6fd07c',l:'#3fa155',r:'#2e7d40'},{ao:false,edge:false});
[[bx+.15,by+.15],[bx+2.4,by+.15]].forEach(([x,y])=>s+=line(P(x,y,0),P(x,y,.45),'#3b3f52',4));
const cp=P(bx+2.15,by-.05,.55);const cw=1.05*U;CHL+=`<g class="z3a-breath">${catSVG().replace('<svg',`<svg x="${cp[0]-cw/2}" y="${cp[1]-cw*.92}" width="${cw}" height="${cw}"`)}</g>`;
[[1,bx+.55],[2,bx+1.35]].forEach(([i,x],k)=>{const p=P(x,by,1.85);const r=.62*U;CHL+=`<g class="z3a-bobz" style="animation-delay:-${k*1.3}s"><circle cx="${p[0]}" cy="${p[1]}" r="${r+4}" fill="#fff"/><path d="M${p[0]-7} ${p[1]+r} l7 12 l7 -12z" fill="#fff"/>${sosFace(i).replace('<svg',`<svg x="${p[0]-r}" y="${p[1]-r}" width="${2*r}" height="${2*r}"`)}</g>`});}
{const x=21,y=9.4,w=2.6,d=2.2,h=2.6;s+=shadow(x,y,w,d,h,.13);
s+=box(x,y,0,w,d,h,{t:'#e2f6ee',l:'#8fdcc2',r:'#5fb89c'});
s+=faceL(x,y+d,h,`<rect x=".25" y=".7" width="2.1" height="1.05" rx=".08" fill="#fffaf2"/><rect x=".33" y=".78" width="1.94" height=".9" fill="url(#gGlass)"/>
     <rect x=".45" y="1.25" width=".3" height=".4" rx=".06" fill="#ffb3c4"/><rect x=".82" y="1.15" width=".32" height=".5" rx=".07" fill="#ffe08a"/><ellipse cx="1.5" cy="1.5" rx=".3" ry=".15" fill="#e8a65c"/><circle cx="2" cy="1.48" r=".15" fill="#ff8a3d"/>
     <rect x=".15" y="1.72" width="2.3" height=".16" rx=".04" fill="#c98a5a"/><circle cx=".7" cy="1.7" r=".1" fill="url(#gCoin)"/>`);
s+=box(x-.12,y-.12,h,w+.24,d+.24,.22,{t:'#fff6e6',l:'#f2e3cc',r:'#d9c6a8'},{ao:false});
const o=P(x,y+d,h-.15);s+=`<g transform="matrix(${CX} ${CY} ${-CX*.8} ${CY*.8+.62*U} ${o[0]} ${o[1]})"><rect width="${w}" height="1" fill="url(#pStripe)"/><path d="M0 1 ${[...Array(10)].map(()=>`q.065 .14 .13 0`).join(' ')} ${[...Array(10)].map(()=>`q.065 .14 .13 0`).join(' ')}" fill="#e2463b"/></g>`;
s+=faceL(x+.3,y+d/2,h+1.05,`<rect width="2" height=".7" rx=".14" fill="#f5b72d"/><text x="1" y=".5" text-anchor="middle" font-family="Rubik" font-weight="900" font-size=".42" fill="#7a4a00">ЛАРЁК</text>`)+line(P(x+.6,y+d/2,h+.22),P(x+.6,y+d/2,h+.4),'#8c94a8',3)+line(P(x+2,y+d/2,h+.22),P(x+2,y+d/2,h+.4),'#8c94a8',3);}
{const x=1.6,y=12.5;s+=shadow(x,y,2.7,1.2,.9,.14);
s+=box(x,y,.25,2.7,1.2,.55,{t:'#f26b5e',l:'#e2463b',r:'#b83228'},{ao:false});
s+=box(x+.7,y+.08,.8,1.3,1.04,.5,{t:'#f6dcd8',l:'#9fd0ec',r:'#6fa9d6'},{ao:false});
s+=box(x+.7,y+.08,1.3,1.3,1.04,.06,{t:'#f26b5e',l:'#e2463b',r:'#b83228'},{ao:false,edge:false});
[[x+.5,y+1.2],[x+2.15,y+1.2]].forEach(([a,b])=>{const p=P(a,b,.25);s+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="9" ry="10" fill="#2b2a40"/><ellipse cx="${p[0]}" cy="${p[1]}" rx="4" ry="4.4" fill="#c9cfdc"/>`});
s+=faceR(x+2.7,y+1.2,.75,`<circle cx=".25" cy=".2" r=".11" fill="#fff6c8"/><circle cx=".95" cy=".2" r=".11" fill="#fff6c8"/><rect x=".38" y=".12" width=".44" height=".14" rx=".03" fill="#d7dbe6"/>`);}
const T=[[1.6,1.6,'birch',1.15],[3.4,4.1,'round',1],[.9,4.6,'lilac',1],[24.1,6.2,'round',1.15],[25.2,8.9,'birch',1],[24.6,12.8,'apple',1.05],[6.8,13.2,'round',.95],[5.2,13.3,'bush',1],[10.2,13.4,'bush',.9],[15.6,13.4,'apple',.9],[21.2,13.3,'bush',.9],[18.6,12.8,'lilac',.9]];
T.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
T.forEach(t=>s+=tree(...t));
s+=lamp(11.2,6.1)+lamp(15.2,6.1)+lamp(5.2,9.4);
[[13.2,11.4],[13.6,11.8],[12.6,11.9]].forEach(([x,y],i)=>{const p=P(x,y,0);s+=`<g transform="translate(${p[0]} ${p[1]})"><ellipse cx="0" cy="-5" rx="7" ry="5" fill="#b9bfd0"/><circle cx="${i%2?6:-6}" cy="-10" r="3.6" fill="#9aa3b8"/><ellipse cx="0" cy="0" rx="6" ry="2" fill="rgba(43,42,64,.12)"/></g>`});
YW.ch=CHL;YW.lt=lightsLayer();return s;
}
const YLBL=[
['level','Кухня Зины','kitchen','#ffe3dc',[KIT.x+.5,HOUSE.y+HOUSE.d,.6+2*KIT.k+3.0],'',1],
['paper','Вечёрка','paper','#ffe9c8',[9.7,6.7,3.15],'1'],
['mail','Почта','mail','#dbe8ff',[14.6,5.95,2.45],'2'],
['','Стройка','crane','#fff1c8',[22.6,2.2,13.4],''],
['','Подъезд','bench','#dcf3df',[13.1,9.6,3.7],'5'],
['','Школа №7','school','#f6e4c0',[2.5,9.5,8.4],''],
['','Ларёк','kiosk','#d6f3e8',[22.3,10.5,4.4],''],
['','Альбом','album','#ece2ff',[16.7,4.4,6.5],''],
];
function leafDots(){var s='';for(var i=0;i<90;i++){var x=RS()*26,y=RS()*14;s+='<ellipse cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" rx=".11" ry=".06" fill="'+['#e8a030','#d9731a','#f5c84a','#c2561a'][i%4]+'" transform="rotate('+((RS()*180)|0)+' '+x.toFixed(2)+' '+y.toFixed(2)+')"/>';}return s;}
function lightsLayer(){
if(!EVE)return'';const H=HOUSE;let s='';
s+=faceL(H.x,H.y+H.d,H.h,LITW.map(([u,w],i)=>`<rect x="${u+.05}" y="${w+.05}" width=".9" height="1.15" fill="url(#gWarm)"/>${i%3===0?`<path d="M${u+.05} ${w+.05} h.28 q-.1 .55 0 1.1 h-.28z M${u+.95} ${w+.05} h-.28 q.1 .55 0 1.1 h.28z" fill="#f08a5a" opacity=".85"/>`:''}${i%4===1?`<path d="M${u+.3} ${w+1.2} q0 -.32 .14 -.38 q-.08 -.2 .06 -.26 q.14 .06 .06 .26 q.14 .06 .14 .38z" fill="#7a4a3a" opacity=".55"/>`:''}<rect x="${u+.475}" y="${w+.05}" width=".05" height="1.15" fill="#9a6a44" opacity=".6"/><rect x="${u+.05}" y="${w+.45}" width=".9" height=".05" fill="#9a6a44" opacity=".6"/>`).join(''));
LITW.forEach(([u,w])=>{const p=P(H.x+u+.5,H.y+H.d,H.h-w-.6);s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="36" fill="url(#gGlowW)" opacity=".33"/>`});
s+=faceR(4.2,13,6,[[.5,1],[4.5,1],[5.7,2],[1.7,2]].map(([u,k])=>{const w=6-(.5+2*k)-1.2;return`<rect x="${u+.04}" y="${w+.04}" width=".72" height="1.12" fill="url(#gWarm)"/>`}).join(''));
LAMPS.forEach(([x,y])=>{const b=P(x,y,2.5);const hx=b[0]+22,hy=b[1]+8;const g=P(x,y,0);s+=`<polygon points="${hx-6},${hy} ${hx+6},${hy} ${g[0]+70},${g[1]+16} ${g[0]-22},${g[1]+16}" fill="url(#gCone)"/><ellipse cx="${g[0]+24}" cy="${g[1]+12}" rx="60" ry="22" fill="url(#gGlowW)" opacity=".55"/><circle cx="${hx}" cy="${hy}" r="7" fill="#fff8d0"/><circle cx="${hx}" cy="${hy}" r="30" fill="url(#gGlowW)"/>`});
{const p=P(12.65,4.4,2.4);s+=`<circle cx="${p[0]}" cy="${p[1]}" r="46" fill="url(#gGlowW)" opacity=".9"/><circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#fff8d0"/>`}
s+=faceL(21,11.6,2.6,`<rect x=".33" y=".78" width="1.94" height=".9" fill="url(#gWarm)"/><rect x=".45" y="1.25" width=".3" height=".4" rx=".06" fill="#c97a8a" opacity=".7"/><ellipse cx="1.5" cy="1.5" rx=".3" ry=".15" fill="#b8763c" opacity=".7"/>`);
{const p=P(22.3,10.5,3.6);s+=`<circle cx="${p[0]}" cy="${p[1]}" r="50" fill="url(#gGlowW)" opacity=".45"/>`}
s+=faceL(21.3,10.5,3.65,`<rect width="2" height=".7" rx=".14" fill="#ffcf5a"/><text x="1" y=".5" text-anchor="middle" font-family="Rubik" font-weight="900" font-size=".42" fill="#7a4a00">ЛАРЁК</text>`);
let gl='';for(let i=0;i<=12;i++){const t=i/12;const p=P(20.8+3.6*t,4.1,1.15+Math.sin(t*Math.PI)*-.25);gl+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.4" fill="${['#ffe08a','#ff8f6a','#9fd8ff'][i%3]}" class="z3a-glow" style="animation-delay:-${(i*.3).toFixed(1)}s"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="12" fill="url(#gGlowW)" opacity=".35"/>`}
for(let i=0;i<=8;i++){const t=i/8;const p=P(5.4+3*t,6.4,2.2-.1-Math.sin(t*Math.PI)*.35);gl+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${['#ffe08a','#ff8f6a','#9fd8ff'][i%3]}" class="z3a-glow" style="animation-delay:-${(i*.4).toFixed(1)}s"/>`}
return s+gl;
}
function skyBg(vb,k){const[x,y,w,h]=vb;const S=NIGHT?['#070b24','#141c46','#2c3466']:EVE?['#1b2352','#5a4a8c','#f2956c']:TP().sky;
return`<defs><linearGradient id="sk${k}" gradientUnits="userSpaceOnUse" x1="0" y1="${Math.min(y,-700)}" x2="0" y2="-300"><stop offset="0" stop-color="${S[0]}"/><stop offset=".62" stop-color="${S[1]}"/><stop offset="1" stop-color="${S[2]}"/></linearGradient></defs><rect x="${x-60}" y="${y-60}" width="${w+120}" height="${h+120}" fill="url(#sk${k})"/>`}
function meadow(vb,k){const[x,y,w,h]=vb;const M=TP().m;
return`<defs><linearGradient id="md${k}" gradientUnits="userSpaceOnUse" x1="0" y1="-330" x2="0" y2="${Math.max(y+h,600)}"><stop offset="0" stop-color="${M[0]}"/><stop offset=".3" stop-color="${M[1]}"/><stop offset="1" stop-color="${M[2]}"/></linearGradient></defs><rect x="${x-60}" y="-330" width="${w+120}" height="${Math.max(y+h+400,1200)}" fill="url(#md${k})"/><rect x="${x-60}" y="-345" width="${w+120}" height="30" fill="${NIGHT?'#3a4070':EVE?'#f6c09a':'#fbf1df'}" opacity=".8" filter="url(#fBlur)"/>`}
function starsMoon(vb,k){const[x,y,w,h]=vb;seed=3;let s='';for(let i=0;i<60;i++){s+=`<circle cx="${(x+RS()*w).toFixed(0)}" cy="${(Math.min(y,-700)+RS()*(-380-Math.min(y,-700))).toFixed(0)}" r="${(RS()*1.8+.6).toFixed(1)}" fill="#fff" opacity="${(RS()*.6+.3).toFixed(2)}" ${i%5===0?'class="z3a-glow"':''}/>`}
const mx=x+w*.8,my=Math.max(y+110,-620);
return s+`<defs><mask id="mm${k}"><circle cx="${mx}" cy="${my}" r="40" fill="#fff"/><circle cx="${mx+16}" cy="${my-10}" r="36" fill="#000"/></mask></defs><circle cx="${mx}" cy="${my}" r="110" fill="#fff6d8" opacity=".12"/><circle cx="${mx}" cy="${my}" r="40" fill="#fff3cf" mask="url(#mm${k})"/>`}
function clouds(vb){const[x,y,w]=vb;const c=NIGHT?['#3a4272','.35','#2c335e']:EVE?['#f5b6ab','.4','#e6908a']:(AUT||SEAS==='win')?['#fffaf0','.92','#e9e2d4']:['#fff','1','#dbeaf5'];let s='';
[[.1,.06,1],[.55,.02,1.3],[.85,.1,.8],[.3,.13,.7]].forEach(([a,b,kk],i)=>{const cx=x+w*a,cy=Math.max(y+60,-760)+b*600;s+=`<g class="z3a-drift" style="animation-duration:${50+i*17}s" opacity="${c[1]}"><g transform="translate(${cx} ${cy}) scale(${kk})">${[[0,0,46],[-50,14,32],[52,12,36],[90,24,22],[-88,26,20]].map(([a2,b2,r])=>`<circle cx="${a2}" cy="${b2}" r="${r}" fill="${c[0]}"/>`).join('')}<rect x="-108" y="26" width="220" height="22" rx="11" fill="${c[0]}"/><path d="M-100 40 h200" stroke="${c[2]}" stroke-width="10" stroke-linecap="round"/></g></g>`});return s}
function birdsG(vb){const[x,y]=vb;return`<g class="z3a-bird" style="animation-duration:30s"><g transform="translate(${x} ${Math.max(y+150,-600)})"><path class="z3a-wing" d="M0 0 q8 -9 14 0 q6 -9 14 0" fill="none" stroke="#5d6781" stroke-width="3" stroke-linecap="round"/><path class="z3a-wing" style="animation-delay:-.2s" d="M40 16 q6 -8 11 0 q5 -8 11 0" fill="none" stroke="#5d6781" stroke-width="3" stroke-linecap="round"/></g></g>`}
function tint(vb,k){const[x,y,w,h]=vb;
if(EVE)return`<defs><radialGradient id="tn${k}" gradientUnits="userSpaceOnUse" cx="${x+w*.5}" cy="-330" r="${w*.8}"><stop offset="0" stop-color="#ff9a6a" stop-opacity="${NIGHT?.06:.22}"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient></defs><rect x="${x-60}" y="${y-60}" width="${w+120}" height="${h+120}" fill="url(#tn${k})"/>`;
const c=AUT?['#ffcf8a','.95','#a05a2a','.28']:['#fff2c4','.9','#5a4a8a','.25'];
return`<defs><radialGradient id="tn${k}" gradientUnits="userSpaceOnUse" cx="${x+w*.12}" cy="${y+h*.05}" r="${w*.9}"><stop offset="0" stop-color="${c[0]}" stop-opacity="${c[1]}"/><stop offset=".6" stop-color="${c[0]}" stop-opacity=".2"/><stop offset="1" stop-color="${c[2]}" stop-opacity="${c[3]}"/></radialGradient></defs><rect x="${x-60}" y="${y-60}" width="${w+120}" height="${h+120}" fill="url(#tn${k})" style="mix-blend-mode:soft-light"/>`}
A.yardFx=A.yardFx||[];
A.iso={P:P,U:U,box:box,faceL:faceL,faceR:faceR,ground:ground,line:line,poly:poly,shadow:shadow,pts:pts,HOUSE:HOUSE,KIT:KIT,COLS:COLS};
A.yardLt=A.yardLt||[];A.yardRev=A.yardRev||0;
A.yardHas={1:{t:'Лавочка',at:[12.2,9.6]},3:{t:'Лифт (леса с краном — это и есть стройка лифта)',at:[21.6,1.2]},5:{t:'Качели',at:[19.8,6.6]},7:{t:'Песочница с грибком',at:[16.4,8]},
12:{t:'Фонари (три)',at:[11.2,6.1]},14:{t:'Бельевые верёвки',at:[5.4,6.4]},16:{t:'Доска «Вечёрка»',at:[8.6,6.7]},21:{t:'Дорожка к подъезду',at:[11.8,5.8]}};
A.yardBuild=A.yardBuild||null;
function bld(){if(typeof A.yardBuild!=='function')return'';try{return A.yardBuild(CTX)||'';}catch(e){return'';}}
A.yardRedraw=function(){A.yardRev++;try{window.dispatchEvent(new Event('resize'));}catch(e){}};
function festKeys(o){var f=o.fest;if(!f)try{f=window.Z3&&Z3.fest?Z3.fest():[];}catch(e){f=[];}return f||[];}
var festLd=0;function festNeed(fk){if(!fk.length||A.festOn||festLd||!window.Z3||!Z3.artLoad)return;festLd=1;Z3.artLoad('fest').then(function(){A.yardRedraw();},function(){});}
function sOff(){try{return!!(window.ZB2&&ZB2.off&&ZB2.off('z3season'));}catch(e){return false;}}
var SNOW={t:'#ffffff',l:'#eef4fb',r:'#d8e4f2'};
function drift(x,y,rx,ry){var p=P(x,y,0);return'<ellipse cx="'+p[0].toFixed(1)+'" cy="'+(p[1]+3).toFixed(1)+'" rx="'+(rx+4)+'" ry="'+(ry+2)+'" fill="#c9d8ea" opacity=".6"/><ellipse cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" rx="'+rx+'" ry="'+ry+'" fill="#fff"/>';}
function frost(){var H=HOUSE,s='';COLS.forEach(function(x){for(var k=0;k<5;k++){var u=x-H.x,w=H.h-(.6+2*k)-1.25;
s+='<path d="M'+(u+.05)+' '+(w+1.2)+' q.12 -.28 .3 -.22 q.1 -.2 .22 -.04 q.14 -.12 .2 .26z M'+(u+.95)+' '+(w+1.2)+' q-.1 -.24 -.26 -.18 q-.1 -.18 -.2 0 l-.04 .18z" fill="#fff" opacity=".85"/>';}});
return faceL(H.x,H.y+H.d,H.h,s);}
function winter(){var H=HOUSE,s='',Sx=.8,Sy=6,Sw=3.4,Sd=7,Sh=6;
s+=poly([P(H.x,H.y,H.h+.31),P(H.x+H.w,H.y,H.h+.31),P(H.x+H.w,H.y+H.d,H.h+.31),P(H.x,H.y+H.d,H.h+.31)],'#fff');
s+=poly([P(H.x,H.y+H.d,H.h+.31),P(H.x+H.w,H.y+H.d,H.h+.31),P(H.x+H.w,H.y+H.d,H.h+.12),P(H.x+H.w*.7,H.y+H.d,H.h+.02),P(H.x+H.w*.4,H.y+H.d,H.h+.1),P(H.x,H.y+H.d,H.h+.04)],'#eef4fb');
s+=poly([P(Sx+Sw+.25,Sy-.25,Sh-.05),P(Sx+Sw+.25,Sy+Sd+.25,Sh-.05),P(Sx+Sw/2,Sy+Sd+.25,Sh+1.62),P(Sx+Sw/2,Sy-.25,Sh+1.62)],'#f4f8fc');
s+=poly([P(Sx+Sw+.25,Sy+Sd+.25,Sh-.05),P(Sx+Sw/2,Sy+Sd+.25,Sh+1.62),P(Sx-.25,Sy+Sd+.25,Sh-.05),P(Sx-.25,Sy+Sd+.12,Sh-.05),P(Sx+Sw/2,Sy+Sd+.12,Sh+1.5),P(Sx+Sw+.25,Sy+Sd+.12,Sh-.05)],'#dfe9f4');
s+=box(20.88,9.28,2.82,2.84,2.44,.16,SNOW,{ao:false,edge:false});
s+=box(11.7,4,2.35,1.9,.95,.12,SNOW,{ao:false,edge:false});
s+=frost();
[[5.2,5.2,46,14],[9,5.4,34,11],[16.5,5.3,40,12],[3.2,12.4,50,15],[23.6,13.2,46,14],[19.2,9,30,10],[14.6,12.8,36,11],[1,9.8,30,10]].forEach(function(d){s+=drift(d[0],d[1],d[2],d[3]);});
{var a=P(18.2,11.2,1.2),b=P(18.6,11.2,1.2),c=P(20.6,11.2,0),dd=P(20.2,11.2,0),l0=P(17.6,11.2,0),l1=P(17.6,11.2,1.2);
s+=line(l0,l1,'#7d8396',3)+line(P(18.2,11.2,0),a,'#7d8396',3)+'<polygon points="'+pts([P(17.6,11.2,1.2),a,P(18.2,11.6,1.2),P(17.6,11.6,1.2)])+'" fill="#c98a5a"/>';
s+='<polygon points="'+pts([a,b,c,dd])+'" fill="#bfe3ff"/><polygon points="'+pts([b,P(18.6,11.6,1.2),P(20.6,11.6,0),c])+'" fill="#9fd0f2"/><path d="M'+a[0]+' '+a[1]+' L'+dd[0]+' '+dd[1]+'" stroke="#fff" stroke-width="3" opacity=".8"/>';}
{var g=P(8.6,10.6,0);s+='<g transform="translate('+g[0].toFixed(1)+' '+g[1].toFixed(1)+')"><ellipse cx="4" cy="2" rx="30" ry="9" fill="#c9d8ea" opacity=".7"/><circle cx="0" cy="-20" r="22" fill="#fff"/><circle cx="0" cy="-54" r="16" fill="#fff"/><circle cx="0" cy="-80" r="12" fill="#fff"/>'+
'<path d="M-12 -86 h24 l-3 -14 h-18z" fill="#2f6fd6"/><rect x="-14" y="-88" width="28" height="4" rx="2" fill="#1d4fa3"/><circle cx="-4" cy="-82" r="1.8" fill="#27324a"/><circle cx="4" cy="-82" r="1.8" fill="#27324a"/><path d="M0 -78 l12 3 l-12 2z" fill="#f08a3a"/>'+
'<path d="M-14 -68 q14 6 28 0 v5 q-14 6 -28 0z" fill="#e2463b"/><path d="M8 -64 l3 14 l6 -2 l-4 -12z" fill="#e2463b"/><circle cx="0" cy="-56" r="1.8" fill="#27324a"/><circle cx="0" cy="-48" r="1.8" fill="#27324a"/>'+
'<path d="M-15 -56 l-16 -10 M15 -56 l16 -12" stroke="#8a5530" stroke-width="2.4" stroke-linecap="round"/></g>';}
seed=21;for(var i=0;i<26;i++){var x=-14+RS()*44,y=-12+RS()*28,q=P(x,y,4+RS()*10);s+='<circle cx="'+q[0].toFixed(0)+'" cy="'+q[1].toFixed(0)+'" r="'+(2+RS()*2.5).toFixed(1)+'" fill="#fff" opacity=".85" class="z3a-snow" style="animation-delay:-'+(RS()*6).toFixed(1)+'s"/>';}
return s;}
function spring(){var H=HOUSE,s='';
var ic='';for(var x=.4;x<H.w;x+=.7){var l=.25+((x*7)%5)/12;ic+='<path d="M'+x.toFixed(2)+' 0 l.08 '+l.toFixed(2)+' l.08 -'+l.toFixed(2)+'z" fill="#d9f0ff"/>';
if(((x*10)|0)%3===0)ic+='<ellipse cx="'+(x+.08).toFixed(2)+'" cy="'+(l+.35).toFixed(2)+'" rx=".04" ry=".07" fill="#8fc6ff" class="z3a-drop" style="animation-delay:-'+(x%2).toFixed(1)+'s"/>';}
s+=faceL(H.x,H.y+H.d,H.h,ic);
s+=ground(0,0,.02,'<path d="M6.2 4.6 q.6 1.6 -.2 3 q-.9 1.6 .4 3.2 q1 1.2 -.6 3.4" fill="none" stroke="#8fc6ff" stroke-width=".22" stroke-linecap="round" opacity=".9"/><path d="M19.4 4.6 q-.5 1.4 .5 2.6 q1 1.2 .2 2.8" fill="none" stroke="#8fc6ff" stroke-width=".18" stroke-linecap="round" opacity=".85"/>'+
'<ellipse cx="7" cy="12.2" rx=".9" ry=".4" fill="#9fd0f2" opacity=".85"/><ellipse cx="20" cy="10.6" rx=".7" ry=".3" fill="#9fd0f2" opacity=".85"/>');
{var v=P(3.6,12.2,0);var br='';[[-14,-58],[-6,-70],[4,-66],[12,-54],[-20,-40]].forEach(function(e,j){br+='<path d="M0 0 Q'+(e[0]/2)+' '+(e[1]/2)+' '+e[0]+' '+e[1]+'" stroke="#8a4f3a" stroke-width="2" fill="none"/>';for(var t=.35;t<1;t+=.18)br+='<ellipse cx="'+(e[0]*t).toFixed(1)+'" cy="'+(e[1]*t).toFixed(1)+'" rx="2.6" ry="3.6" fill="#e9e6ee"/>';});
s+='<g transform="translate('+v[0].toFixed(1)+' '+v[1].toFixed(1)+')">'+br+'<ellipse cx="0" cy="0" rx="14" ry="5" fill="#8a5a3c"/></g>';}
{var a=P(2.6,3.2,0),b=P(2.6,3.2,4.2);s+=line(a,b,'#8a5a3c',3)+'<g transform="translate('+b[0].toFixed(1)+' '+b[1].toFixed(1)+')"><path d="M-12 -2 L0 -14 L12 -2z" fill="#b83228"/><rect x="-9" y="-2" width="18" height="20" fill="#c98a5a"/><circle cx="0" cy="6" r="3.6" fill="#3b2a20"/><rect x="-2" y="12" width="4" height="4" fill="#8a5a3c"/></g>';}
return s;}
function summer(){var s='';
{var c=P(8.2,11.2,0);s+=ground(7.2,10.6,.02,'<ellipse cx="1" cy=".6" rx="1.1" ry=".7" fill="#8a5a3c"/><ellipse cx="1" cy=".6" rx=".95" ry=".58" fill="#6b4630"/>');
seed=31;s+=flowers(7.4,9,10.9,.15)+flowers(7.6,8.8,11.3,.15);}
[[11,7.5,4],[16,10.6,3.2]].forEach(function(b,i){var q=P(b[0],b[1],b[2]);s+='<g class="z3a-fly" style="animation-delay:-'+(i*1.3)+'s"><g transform="translate('+q[0].toFixed(0)+' '+q[1].toFixed(0)+')"><path d="M0 0 q-10 -12 -12 0 q2 8 12 0 q10 -12 12 0 q-2 8 -12 0z" fill="'+(i?'#f5b72d':'#ff8fb0')+'"/><path d="M0 -4 v8" stroke="#27324a" stroke-width="1.6"/></g></g>';});
return s;}
A.yardFx.push(function(c){if(sOff())return'';return c.season==='win'?winter():c.season==='spr'?spring():c.season==='sum'?summer():'';});
var CTX={};function fx(L){var s='';(L||A.yardFx).forEach(function(f){try{s+=f(CTX)||'';}catch(e){}});return s;}
var VB={tall:[-200,-430,720,1160],sq:[-600,-400,1560,1180]};
var ID={level:'kitchen',paper:'paper',mail:'mail',crane:'build',bench:'bench',school:'school',kiosk:'kiosk',album:'album'};
function lay(k){var p={};YLBL.forEach(function(r){var q=P(r[4][0],r[4][1],r[4][2]);p[ID[r[2]]||r[2]]=[q[0],q[1],'u'];});
var H=HOUSE,z=.6+2*KIT.k,a=P(KIT.x,H.y+H.d,z+1.25),b=P(KIT.x+1,H.y+H.d,z);
var w=[Math.min(a[0],b[0]),a[1],Math.abs(b[0]-a[0]),b[1]-a[1]+20];
var cp=P(12.2+2.15,9.6-.05,.55),kx=p.kitchen[0],ky=p.kitchen[1];
return{vb:VB[k],pts:p,win:w,cat:[cp[0]-21,cp[1]-40,42],say:k==='tall'?[kx-150,ky-70]:[kx+40,ky+150]};}
A.yardLay={tall:lay('tall'),sq:lay('sq')};
var YK=0;
function falling(vb){if(!AUT)return'';var s='',x=vb[0],y=vb[1],w=vb[2],h=vb[3];seed=5;
for(var i=0;i<16;i++){var lx=x+RS()*w,sz=14+RS()*14,c=['#e8a030','#d9731a','#f5c84a','#c2561a','#f0b84a'][i%5];
s+='<g class="z3a-fall" style="animation-duration:'+(7+RS()*6).toFixed(1)+'s;animation-delay:-'+(RS()*13).toFixed(1)+'s;--fh:'+(h+80).toFixed(0)+'px"><g transform="translate('+lx.toFixed(0)+' '+(y-40)+') scale('+(sz/20).toFixed(2)+')"><g class="z3a-spin"><path d="M10 1 C16 4 18 10 10 19 C2 10 4 4 10 1Z" fill="'+c+'"/><path d="M10 3 V18" stroke="rgba(120,50,10,.35)" stroke-width="1"/></g></g></g>';}
return s;}
A.yard=function(o){o=o||{};norm(o);var L=A.yardLay[o.lay]||A.yardLay.tall,vb=L.vb,k='y'+(++YK),s='';
var base=yardWorld();CTX={time:TIME,season:SEAS,fest:FESTO,fk:festKeys(o),iso:A.iso,eve:EVE,night:NIGHT,vb:vb};festNeed(CTX.fk);
s+='<svg xmlns="http://www.w3.org/2000/svg" class="z3ya z3t-'+TIME+' z3s-'+SEAS+'" viewBox="'+vb.join(' ')+'" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
s+='<defs>  <linearGradient id="gAO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a28" stop-opacity="0"/><stop offset="1" stop-color="#5a3a28" stop-opacity=".22"/></linearGradient>  <linearGradient id="gGlass" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#d9f1fb"/><stop offset=".5" stop-color="#9fd0ec"/><stop offset="1" stop-color="#6fa9d6"/></linearGradient>  <radialGradient id="gWarm" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fff6cf"/><stop offset=".6" stop-color="#ffd77a"/><stop offset="1" stop-color="#f5a84a"/></radialGradient>  <radialGradient id="gGlowW"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf60" stop-opacity="0"/></radialGradient>  <radialGradient id="gShadow"><stop offset="0" stop-color="#2b2a40" stop-opacity=".32"/><stop offset="1" stop-color="#2b2a40" stop-opacity="0"/></radialGradient>  <radialGradient id="gCoin" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#f8c63c"/><stop offset="1" stop-color="#e09412"/></radialGradient>  <linearGradient id="gStarL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f5b72d"/></linearGradient>  <linearGradient id="gStarD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7c443"/><stop offset="1" stop-color="#e0921a"/></linearGradient>  <linearGradient id="gChestF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9773f"/><stop offset="1" stop-color="#9a4f24"/></linearGradient>  <radialGradient id="gChestGlow"><stop offset="0" stop-color="#fffbd6"/><stop offset=".5" stop-color="#ffd860" stop-opacity=".8"/><stop offset="1" stop-color="#ffb300" stop-opacity="0"/></radialGradient>  <linearGradient id="gRib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f05c4f"/><stop offset="1" stop-color="#d0342c"/></linearGradient>  <pattern id="pDots" width=".26" height=".26" patternUnits="userSpaceOnUse"><rect width=".26" height=".26" fill="#e2463b"/><circle cx=".13" cy=".13" r=".045" fill="#fff"/></pattern>  <pattern id="pDotsB" width=".26" height=".26" patternUnits="userSpaceOnUse"><rect width=".26" height=".26" fill="#2f6fd6"/><circle cx=".13" cy=".13" r=".045" fill="#fff"/></pattern>  <pattern id="pStripe" width=".5" height="1" patternUnits="userSpaceOnUse"><rect width=".5" height="1" fill="#fff"/><rect width=".25" height="1" fill="#e2463b"/></pattern>  <pattern id="pWallK" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="3" fill="#e9c9a8" opacity=".5"/><circle cx="48" cy="48" r="3" fill="#e9c9a8" opacity=".5"/><path d="M48 8 q5 6 0 12 q-5 -6 0 -12z" fill="#b9d6a0" opacity=".5"/><path d="M16 40 q5 6 0 12 q-5 -6 0 -12z" fill="#b9d6a0" opacity=".5"/></pattern>  <pattern id="pTile" width="40" height="30" patternUnits="userSpaceOnUse"><rect width="40" height="30" fill="#e6f2ef"/><path d="M0 .5 H40 M.5 0 V30" stroke="#c9ddd8" stroke-width="2"/></pattern>  <filter id="fBlur"><feGaussianBlur stdDeviation="8"/></filter>  <filter id="fSoft" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#27324a" flood-opacity=".22"/></filter><linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0" stop-opacity=".55"/><stop offset="1" stop-color="#ffd870" stop-opacity="0"/></linearGradient><filter id="fNight" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".36 .05 .04 0 0  .04 .34 .09 0 0  .10 .13 .62 0 .03  0 0 0 1 0"/></filter><filter id="fNight2" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".22 .03 .03 0 0  .03 .22 .06 0 0  .07 .10 .46 0 .03  0 0 0 1 0"/></filter></defs>';
s+=skyBg(vb,k)+(EVE?starsMoon(vb,k):'')+clouds(vb)+(EVE?'':birdsG(vb));
s+='<g'+(EVE?' filter="url(#'+(NIGHT?'fNight2':'fNight')+')"':'')+'>'+meadow(vb,k)+base+bld()+fx()+'</g>'+YW.lt+fx(A.yardLt)+YW.ch+tint(vb,k)+falling(vb);
var hot=o.hot||{};Object.keys(hot).forEach(function(id){var p=L.pts[id];if(p)s+='<circle cx="'+p[0]+'" cy="'+(p[1]+40)+'" r="70" fill="#ffe08a" class="z3a-hot"/>';});
return s+'</svg>';};
A.yardCss='.z3ya .z3a-bobz{animation:z3abobz 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}@keyframes z3abobz{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.6deg) translateY(-1px)}}.z3ya .z3a-breath{animation:z3abreath 3s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}@keyframes z3abreath{0%,100%{transform:scale(1,1)}50%{transform:scale(1.015,.985)}}.z3ya .z3a-sway{animation:z3asway 4.5s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}@keyframes z3asway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1.2deg)}}.z3ya .z3a-cloth{animation:z3acloth 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}@keyframes z3acloth{0%,100%{transform:skewX(-4deg)}50%{transform:skewX(5deg)}}.z3ya .z3a-lift{animation:z3alift 7s ease-in-out infinite}@keyframes z3alift{0%,12%{transform:translateY(0)}50%,62%{transform:translateY(-190px)}100%{transform:translateY(0)}}.z3ya .z3a-hook{animation:z3ahook 4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}@keyframes z3ahook{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}.z3ya .z3a-swing{animation:z3aswingS 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}@keyframes z3aswingS{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(14deg)}}.z3ya .z3a-drift{animation:z3adrift 60s linear infinite alternate}@keyframes z3adrift{from{transform:translateX(-60px)}to{transform:translateX(80px)}}.z3ya .z3a-glow{animation:z3aglow 2.6s ease-in-out infinite}@keyframes z3aglow{0%,100%{opacity:.5}50%{opacity:1}}.z3ya .z3a-env{animation:z3aenv 2.2s ease-in-out infinite}@keyframes z3aenv{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.z3ya .z3a-bird{animation:z3abird 26s linear infinite}@keyframes z3abird{from{transform:translateX(-200px)}to{transform:translateX(2400px)}}.z3ya .z3a-wing{animation:z3awing .45s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}@keyframes z3awing{from{transform:scaleY(1)}to{transform:scaleY(-.5)}}@media (prefers-reduced-motion:reduce){.z3ya *{animation:none!important}}'+'.z3ya .z3a-hot{opacity:.35;animation:z3aglow 1.6s ease-in-out infinite}'+
'.z3ya .z3a-fall{animation:z3afall 9s linear infinite}.z3ya .z3a-spin{animation:z3aspin 3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}'+
'@keyframes z3afall{from{transform:translate(0,0)}to{transform:translate(120px,var(--fh))}}@keyframes z3aspin{from{transform:rotate(-40deg)}to{transform:rotate(60deg)}}'+
'.z3ya .z3a-snow{animation:z3asnow 6s linear infinite}@keyframes z3asnow{from{transform:translateY(-30px)}to{transform:translateY(60px)}}'+
'.z3ya .z3a-drop{animation:z3adrop 1.6s ease-in infinite}@keyframes z3adrop{0%{transform:translateY(0);opacity:1}80%{opacity:1}100%{transform:translateY(.9px);opacity:0}}'+
'.z3ya .z3a-fly{animation:z3afly 3s ease-in-out infinite alternate}@keyframes z3afly{from{transform:translate(0,0)}to{transform:translate(18px,-10px)}}'+
'@media (prefers-reduced-motion:reduce){.z3ya .z3a-fall{display:none}}';
})();
