'use strict';
(function(){
var so=false;try{so=localStorage.getItem('rs-off')==='1';}catch(e){}
var Z=window.ZB2,R=window.RS={v:1,soff:so,ON:false};
if(!Z||!Z.reg){R.on=R.reg=function(){return false;};return;}
var ON=R.ON=Z.reg('rs',{t:'Реструктуризация 30.10',who:'RS',on:!so});
var T={home:'Дом, Двор, панель',today:'Сегодня у Зины',drip:'Открытие по дням и событие недели',level:'Чистый уровень',
win:'Окно победы и проигрыша',sect:'Разделы (Игры, Школа, Газета, Ларёк…)',words:'Слова (одно название — одна вещь)'};
function id(p){p=String(p||'');return p.indexOf('rs.')===0?p:'rs.'+p;}
R.reg=function(p,o){var k=id(p);if(!Z._reg[k])Z.reg(k,{t:o&&o.t||T[k.slice(3)]||k,who:o&&o.who||'RS'});return R.on(k);};
R.on=function(p){if(!ON)return false;if(!p)return true;var k=id(p);if(!Z._reg[k])Z.reg(k,{t:T[k.slice(3)]||k,who:'RS'});return!Z.off(k);};
var c=document.documentElement.classList;
Object.keys(T).forEach(function(p){if(R.reg(p))c.add('rs-'+p);});
if(ON)c.add('rs');
})();
