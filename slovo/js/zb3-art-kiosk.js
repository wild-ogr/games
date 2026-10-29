'use strict';
(function(){
var A=window.Z3ART=window.Z3ART||{};
var SH='<ellipse cx="40" cy="73" rx="27" ry="4" fill="#000" opacity=".12"/>';
function sv(vb,b){return'<svg viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+b+'</svg>';}
A['kiosk-front']=function(){var st='';for(var i=0;i<8;i++)st+='<path d="M'+(14+i*29)+' 30h29v14c0 8-29 8-29 0z" fill="'+(i%2?'#fffdf6':'var(--z3-acc,#c2410c)')+'"/>';
return sv('0 0 260 120','<rect x="0" y="104" width="260" height="16" fill="var(--z3-grass,#b9d98c)"/>'+
'<rect x="18" y="38" width="224" height="70" rx="6" fill="#7fb7a4"/><rect x="18" y="38" width="224" height="8" fill="#5e9884"/>'+
'<rect x="34" y="52" width="140" height="44" rx="4" fill="#dff1f7" stroke="#fffdf6" stroke-width="4"/>'+
'<path d="M40 90h128" stroke="var(--z3-wood,#8a5a32)" stroke-width="6"/>'+
'<g><rect x="46" y="70" width="14" height="18" rx="2" fill="#f5b400"/><rect x="64" y="66" width="12" height="22" rx="2" fill="#d0342c"/><rect x="80" y="72" width="16" height="16" rx="3" fill="#2563c9"/>'+
'<path d="M140 88c0-10 5-16 12-16s12 6 12 16z" fill="#f29bb0"/><circle cx="160" cy="80" r="1.6" fill="#8a3a50"/></g>'+
'<rect x="186" y="52" width="44" height="52" rx="3" fill="#5e9884"/><circle cx="222" cy="80" r="2.5" fill="#f5b400"/>'+
'<rect x="8" y="16" width="244" height="16" rx="4" fill="var(--z3-wood,#8a5a32)"/><text x="130" y="28.5" font-size="11" font-weight="800" text-anchor="middle" fill="#fffdf6" font-family="Georgia,serif" letter-spacing="1">УЧИТЕЛЬСКАЯ</text>'+st);};
A['kiosk-vech']=function(){return sv('0 0 80 80',SH+'<g transform="rotate(-8 40 40)"><rect x="12" y="16" width="52" height="54" rx="3" fill="#fffdf6" stroke="#cfc3a6" stroke-width="2"/>'+
'<rect x="16" y="20" width="44" height="9" fill="#27324a"/><text x="38" y="27.3" font-size="7" font-weight="800" text-anchor="middle" fill="#fffdf6" font-family="Georgia,serif">ВЕЧЁРКА</text>'+
'<path d="M18 35h20M18 41h20M18 47h20M18 53h40M18 59h34" stroke="#9aa6bd" stroke-width="2.5" stroke-linecap="round"/><rect x="42" y="33" width="16" height="16" fill="#f3e3c2"/></g>'+
'<path d="M52 44l14 0 0 26-7-5-7 5z" fill="#d0342c"/><circle cx="59" cy="44" r="9" fill="#f5b400" stroke="#c98a00" stroke-width="2"/><text x="59" y="48" font-size="10" font-weight="900" text-anchor="middle" fill="#7a4a00" font-family="Arial">30</text>');};
A['kiosk-pig']=function(o){var f=Math.max(0,Math.min(1,+(o&&o.f)||0)),h=Math.round(30*f);
return sv('0 0 80 80','<rect x="4" y="66" width="72" height="8" rx="2" fill="var(--z3-wood,#8a5a32)"/>'+
'<defs><clipPath id="z3kpc"><ellipse cx="38" cy="44" rx="26" ry="20"/></clipPath></defs>'+
'<ellipse cx="38" cy="44" rx="26" ry="20" fill="#f7c3cf"/>'+
(h?'<g clip-path="url(#z3kpc)"><rect x="10" y="'+(64-h)+'" width="56" height="'+h+'" fill="#f5b400" opacity=".75"/></g>':'')+
'<ellipse cx="38" cy="44" rx="26" ry="20" fill="none" stroke="#e98aa2" stroke-width="2.5"/>'+
'<circle cx="62" cy="44" r="7" fill="#ee8aa2"/><circle cx="60" cy="43" r="1.5" fill="#8a3a50"/><circle cx="64" cy="43" r="1.5" fill="#8a3a50"/><circle cx="51" cy="36" r="2.2" fill="#27324a"/>'+
'<path d="M22 28l-3-9 9 5M42 26l4-9 2 10" fill="#ee8aa2"/><rect x="32" y="25" width="12" height="3" rx="1.5" fill="#8a3a50"/>'+
'<path d="M22 60v6M50 60v6" stroke="#ee8aa2" stroke-width="6" stroke-linecap="round"/>'+(f>=1?'<circle cx="38" cy="14" r="8" fill="#f5b400" stroke="#c98a00" stroke-width="2.5"/>':''));};
A['kiosk-uz']=function(){return sv('0 0 80 80',SH+'<path d="M14 66c-2-18 6-30 26-30s28 12 26 30z" fill="#d0342c"/><g fill="#fff" opacity=".9"><circle cx="24" cy="52" r="3"/><circle cx="38" cy="60" r="3"/><circle cx="52" cy="50" r="3"/><circle cx="56" cy="62" r="3"/><circle cx="30" cy="44" r="2.5"/></g>'+
'<path d="M30 38c-6-10-2-20 4-22 4 6 4 14 6 20M50 38c6-10 2-20-4-22-4 6-4 14-6 20" fill="#b3261e"/><circle cx="40" cy="36" r="6" fill="#b3261e"/>');};
A['kiosk-look']=function(){return sv('0 0 80 80',SH+'<path d="M40 12c16 0 30 11 30 26 0 9-7 12-13 12-5 0-7 3-5 7 3 6-2 11-12 11-16 0-28-13-28-28s12-28 28-28z" fill="#f3e3c2" stroke="#c98a4b" stroke-width="2"/>'+
'<circle cx="26" cy="34" r="6" fill="#d0342c"/><circle cx="38" cy="22" r="6" fill="#f5b400"/><circle cx="54" cy="26" r="6" fill="#237a3b"/><circle cx="26" cy="50" r="6" fill="#2563c9"/>');};
A['kiosk-shelf']=function(){return sv('0 0 80 80',SH+'<rect x="10" y="18" width="60" height="52" rx="3" fill="#c98a4b"/><rect x="14" y="22" width="52" height="20" fill="#f3e3c2"/><rect x="14" y="46" width="52" height="20" fill="#f3e3c2"/>'+
'<rect x="18" y="28" width="8" height="14" rx="1" fill="#2563c9"/><rect x="28" y="25" width="7" height="17" rx="1" fill="#d0342c"/><circle cx="46" cy="36" r="6" fill="#f5b400" stroke="#c98a00" stroke-width="2"/><rect x="55" y="30" width="8" height="12" rx="2" fill="#237a3b"/>'+
'<path d="M18 66c0-8 4-12 10-12s10 4 10 12z" fill="#d0342c"/><rect x="44" y="52" width="16" height="14" rx="2" fill="#3b7be0"/><rect x="47" y="55" width="10" height="4" fill="#fbf7ec"/>');};
A['kiosk-fair']=function(){return sv('0 0 80 80',SH+'<path d="M10 34l30-20 30 20z" fill="#f08c00"/><path d="M10 34h60v6H10z" fill="#e03131"/><path d="M14 40h52v30H14z" fill="#fff3d6"/>'+
'<path d="M14 40v30M66 40v30" stroke="#9b6a3c" stroke-width="3"/><circle cx="28" cy="58" r="7" fill="#f5b400"/><rect x="40" y="50" width="16" height="14" rx="3" fill="#2f9e44"/><text x="48" y="61" font-size="9" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">%</text>');};
})();
