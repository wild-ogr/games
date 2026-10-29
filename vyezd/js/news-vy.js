(function(){
'use strict';
var W=window;
if(!W.NEWS||!W.UI||!W.homeSlots)return;
function $(id){return document.getElementById(id);}
function Sv(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
function lang(){try{return LANG;}catch(e){return'ru';}}
function on(id){var e=$(id);return!!(e&&e.classList.contains('on'));}
function day1(){try{return!!(W.V3&&V3.fix('news1')&&V3.day()<=1&&!V3.vet());}catch(e){return false;}}
function ready(){var s=Sv();
return!day1()&&UI.cur==='home'&&!on('modal')&&!on('ad')&&!document.querySelector('.uxtut')&&!!s&&(+s.unlocked||1)>=2;}
homeSlots.push({id:'news',order:1,zone:'top',render:function(){return day1()?null:NEWS.lineHtml()||null;}});
NEWS.init({g:'vyezd',lang:lang,ready:ready,cls:'noenter',
hero:{i:'👵',n:VY.L('Выезд со двора','Yard Exit')},head:VY.L('Вести со двора','Yard news'),
theme:{card:'#fff',ink:'#17324a',sub:'#4d6a80',accent:'#ff5a6e',accentInk:'#fff',line:'#e2edf2',btnShadow:'0 4px 0 #d63d52',lineBg:'#fff',
font:'Rubik,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'},
onList:function(){UI.refresh();},onClose:function(){UI.refresh();}});
})();