(function(W0,D){'use strict';
if(!W0.V3||!V3.reg('rs.words',{s:'RS-П4',t:'слова: одно название — одна вещь'}))return;
var C='А-Яа-яЁё';
var W=[
['Гаражи — мини-игры','Отдых — игры Толика'],
['Гаражи Толика','Гаражный ряд'],
['Гараж Толика','Мастерская Толика'],
['Заведи «Москвич»','Завести мотор'],
['Перегазуешь — зальёшь свечи','Отпусти, когда стрелка в зелёном'],
['Кто угнал «Москвич» деда?','Расследование во дворе'],
['Кто угнал «Москвич»?','Расследование во дворе'],
['Двор на ночь','Вечерний двор'],
['двор на ночь','вечерний двор'],
['Затея дня','Игра дня'],
['Задание дня','Двор дня'],
['Смена: ','Пять дворов подряд: '],
['Смена — ','«Пять дворов подряд» — '],
['Смена не дотянута','Пять дворов подряд не пройдены'],
['Смена закрыта','Пять дворов подряд пройдены'],
['Смена растёт','Дворов подряд — больше'],
['«Смена»','«Пять дворов подряд»'],
['Отдохнуть','Лёгкий двор'],
['5 секунд счастья','×2 за ролик'],
[/Протокол № ?\d+/g,'Фото двора'],
['Домофон','Позвать соседа'],
['ларёк тёти Вали','тётя Валя и баба Шура'],
['Лавка Шуры','Лавка'],
['Ларёк','Лавка'],
['Сундук дня','Сундучок дня'],
['Сезон: ступень ','Сезон: '],
['Лига соседей','Соседи'],
['Ещё новости','Новости двора'],
['Водительское удостоверение','Права'],
['В гараж','К машинам'],
[new RegExp('(^|[^'+C+'])([Дд])етал(ь|и|ей|ями|ям|ях)(?=[^'+C+']|$)','g'),function(m,a,d,e){return a+(d==='Д'?'Запчаст':'запчаст')+e;}]];
var X={'Гаражи':'Отдых','Гараж':'Мои машины','Лига':'Соседи'};
var RX=W.map(function(p){if(typeof p[0]!=='string')return p;var e=p[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
return[new RegExp(e+(/[А-Яа-яЁё]$/.test(p[0])?'(?![А-Яа-яЁё])':''),'g'),p[1]];});
function ru(){try{return typeof LANG==='undefined'||LANG==='ru';}catch(e){return true;}}
function fix(t){var v=t.nodeValue,o=v;if(!v||v.length<4&&!X[v.trim()])return;var tr=v.trim();
if(X[tr]){t.nodeValue=v.replace(tr,X[tr]);return;}
for(var i=0;i<RX.length;i++){if(typeof RX[i][0].test==='function'){RX[i][0].lastIndex=0;v=v.replace(RX[i][0],RX[i][1]);}}
if(v!==o)t.nodeValue=v;}
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,NOSCRIPT:1,CANVAS:1};
function walk(n){if(!n)return;if(n.nodeType===3){var p=n.parentNode;if(p&&!SKIP[p.nodeName])fix(n);return;}
if(n.nodeType!==1||SKIP[n.nodeName])return;var w=D.createTreeWalker(n,4,null,false),t;while((t=w.nextNode())){var pp=t.parentNode;if(pp&&!SKIP[pp.nodeName])fix(t);}}
var busy=false;
function onMut(ms){if(busy||!ru())return;busy=true;try{for(var i=0;i<ms.length;i++){var m=ms[i];
if(m.type==='characterData')walk(m.target);else for(var j=0;j<m.addedNodes.length;j++)walk(m.addedNodes[j]);}}catch(e){}busy=false;}
function names(){try{if(!W0.VYMG||!ru())return;var i=VYMG.INFO[1];if(i&&i.id==='zavedi'){i.n='Завести мотор';i.a='Держи ключ — отпусти, когда стрелка в зелёном';}
var g=VYMG.REG&&VYMG.REG.by&&VYMG.REG.by.zavedi;if(g)g.n='Завести мотор';}catch(e){}}
function start(){if(!D.body||start.on)return;start.on=1;if(ru())walk(D.body);
try{new MutationObserver(onMut).observe(D.body,{childList:true,subtree:true,characterData:true});}catch(e){}names();}
if(D.body)start();else D.addEventListener('DOMContentLoaded',start);
W0.addEventListener('vy-late',names);W0.addEventListener('load',names);
(function(R){R.fix=function(el){walk(el||D.body);};R.list=W;})(W0.RSW=W0.RSW||{});
})(window,document);