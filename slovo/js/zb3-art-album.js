'use strict';
(function(){
var A=window.Z3ART=window.Z3ART||{},K=0;
A.album=function(){var k='za'+(++K),s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 96" aria-hidden="true" preserveAspectRatio="xMidYMax meet">'+
'<defs><linearGradient id="'+k+'v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b8fd0"/><stop offset="1" stop-color="#3f6fb3"/></linearGradient></defs>';
s+='<path d="M40 90 Q180 70 320 90 L316 96 L44 96Z" fill="#fffdf6"/>';
for(var i=0;i<14;i++)s+='<circle cx="'+(48+i*20)+'" cy="94" r="6" fill="#fffdf6"/><circle cx="'+(48+i*20)+'" cy="94" r="2.2" fill="#e9dfc8"/>';
s+='<g transform="translate(46 62)"><rect x="0" y="16" width="70" height="10" rx="2" fill="#efe6d2"/><rect x="4" y="8" width="66" height="10" rx="2" fill="#f7f0de"/>'+
'<rect x="-2" y="0" width="68" height="10" rx="2" fill="#fbf7ec"/><path d="M6 4 H40 M6 7 H56" stroke="#9aa3b8" stroke-width="1.6"/><path d="M6 20 H60 M10 12 H52" stroke="#c9bfa8" stroke-width="1.4"/></g>';
s+='<g transform="translate(168 6)">';
[[-18,10,-24],[0,0,0],[18,8,22],[-8,16,-10],[10,18,12]].forEach(function(f){var x=12+f[0],y=f[1];
s+='<path d="M12 64 Q'+(12+f[0]/2)+' 40 '+x+' '+(y+10)+'" stroke="#5f9b46" stroke-width="2.4" fill="none"/>';
for(var j=0;j<8;j++){var a=j*Math.PI/4;s+='<ellipse cx="'+(x+Math.cos(a)*6).toFixed(1)+'" cy="'+(y+10+Math.sin(a)*6).toFixed(1)+'" rx="4" ry="2.2" transform="rotate('+(j*45)+' '+(x+Math.cos(a)*6).toFixed(1)+' '+(y+10+Math.sin(a)*6).toFixed(1)+')" fill="#fff"/>';}
s+='<circle cx="'+x+'" cy="'+(y+10)+'" r="3.4" fill="#f5b72d"/>';});
s+='<path d="M-4 56 H28 L24 86 Q12 92 0 86Z" fill="url(#'+k+'v)"/><path d="M0 64 H24" stroke="#fff" stroke-width="2" opacity=".6"/></g>';
s+='<g transform="translate(262 34)"><rect x="0" y="8" width="52" height="50" rx="10" fill="#8a5130"/><rect x="4" y="12" width="44" height="42" rx="8" fill="#a9673a"/>'+
'<circle cx="26" cy="33" r="16" fill="#fffdf6"/><path d="M26 33 V22 M26 33 L34 37" stroke="#27324a" stroke-width="2.4" stroke-linecap="round"/>'+
'<rect x="6" y="56" width="8" height="6" rx="2" fill="#6b3d22"/><rect x="38" y="56" width="8" height="6" rx="2" fill="#6b3d22"/><circle cx="26" cy="6" r="5" fill="#f5b72d"/></g>';
return s+'</svg>';};
A.albumVy=function(o){o=o||{};var b=String(o.bits||''),w=o.w||240,c=11,ox=30,oy=40,s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 240" width="'+w+'" aria-hidden="true">';
s+='<rect x="8" y="6" width="154" height="220" rx="4" fill="#fffdf6" stroke="#e6dcc8"/>';
[16,196].forEach(function(y){s+='<rect x="8" y="'+y+'" width="154" height="16" fill="#fffdf6"/>';
for(var x=14;x<158;x+=12)s+='<path d="M'+x+' '+(y+8)+' l6 -6 l6 6 l-6 6z" fill="none" style="stroke:var(--z3-a-stitch)" stroke-width="1.8"/>';
s+='<path d="M8 '+y+' H162 M8 '+(y+16)+' H162" style="stroke:var(--z3-a-stitch)" stroke-width="1.4"/>';});
for(var x=12;x<160;x+=5)s+='<path d="M'+x+' 226 V236" stroke="#e6dcc8" stroke-width="2"/>';
for(var i=0;i<100;i++)if(b.charAt(i)==='1'){var X=ox+(i%10)*c+(c-9)/2,Y=oy+Math.floor(i/10)*c+40+(c-9)/2;
s+='<path d="M'+X+' '+Y+' l9 9 M'+(X+9)+' '+Y+' l-9 9" style="stroke:var(--z3-a-stitch)" stroke-width="2.2" stroke-linecap="round"/>';}
return s+'</svg>';};
})();
