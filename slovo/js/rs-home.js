'use strict';
(function(){
if(!window.RS||!RS.on('home')||typeof ZB==='undefined'||!ZB.vw)return;
var DE=document.documentElement,c=DE.classList,t=0,k=0;
function off(){if(!window.RSH)c.remove('rs-home-on','rs-yard');c.remove('rs-wait');}
function un(){if(++k<2)return;clearTimeout(t);c.remove('rs-wait');}
c.add('rs-home-on','rs-wait');t=setTimeout(off,6000);
var s=document.createElement('style');s.textContent='html.rs-wait #menu>*{visibility:hidden}';document.head.appendChild(s);
var l=document.createElement('link');l.rel='stylesheet';l.href='css/rs-home.css';l.onload=un;l.onerror=function(){k=-9;off();};document.head.appendChild(l);
window.RSH0={done:un};
ZB.load('js/rs-home-x.js').then(function(){if(!window.RSH)off();},off);
})();
