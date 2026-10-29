(function(){
'use strict';
var W=window;
if(!W.ZB||!ZB.homeSlots||!ZB.load)return;
if(W.ZB2&&!ZB2.reg('news',{t:'Объявления игрокам при входе (NEWS, «Вести со двора»)',who:'REL'}))return;
function $(id){return document.getElementById(id);}
function on(id){var e=$(id);return!!(e&&e.classList.contains('on'));}
function lv(){try{return+S.lv||0;}catch(e){return 0;}}
function ready(){return on('menu')&&!on('modal')&&!on('ad')&&!document.hidden&&lv()>=1;}
function redraw(){try{if(on('menu')&&!on('modal'))ZB.refresh();}catch(e){}}
ZB.load('js/news.js').then(function(){if(!W.NEWS)return;
ZB.add(ZB.homeSlots,{id:'news',order:1,zone:'top',render:function(){return NEWS.lineHtml()||'';}});
NEWS.init({g:'slovo',lang:function(){return'ru';},ready:ready,cls:'noenter',
hero:{i:'👵',n:'Баба Зина'},head:'Вести со двора',
theme:{card:'#fbf7ec',ink:'#27324a',sub:'#5d6781',accent:'#c2410c',accentInk:'#fff',line:'#e6dcc8',btnShadow:'0 4px 0 #8f2c06',lineBg:'rgba(255,255,255,.94)',
font:'"ZRubik",-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'},
stat:function(n,p){try{STAT.ev(n,p);}catch(e){}},
onList:function(n){if(n)redraw();},onClose:redraw});
},function(){});
})();
