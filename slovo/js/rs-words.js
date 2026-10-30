'use strict';
(function(){
if(typeof ZB==='undefined'||!window.RS||!RS.on||!RS.on('words'))return;
(function(){if(document.querySelector('link[data-rss]'))return;var l=document.createElement('link');l.rel='stylesheet';l.href='css/rs-sect.css';l.setAttribute('data-rss','1');document.head.appendChild(l);})();
var Y='(^|[^А-Яа-яЁё])',E='(?![А-Яа-яЁё])';
function w(a,b,f){return[new RegExp(Y+a+E,f||'g'),function(m,p){return p+(typeof b==='function'?b.apply(null,[].slice.call(arguments,2)):b);}];}
var L=[
[/кабинет русского языка · Перемена/g,'игры на пять минут'],
w('Красный уголок','Игры'),w('Красном уголке','Играх'),w('Красного уголка','Игр'),
w('Затея дня','Игра дня'),w('Затею дня','Игру дня'),w('Затеи дня','Игры дня'),w('Новая затея!','Новая игра!'),
w('В меню','Домой'),
w('Путешествие Зины','Путь'),
[/Подрасти до (\d+) класса — откроем\.?/g,function(m,n){return'Откроется '+(n==='2'?'во ':'в ')+n+' классе.';}],
[/ЗАКРЫТО на учёт/gi,'Скоро откроется'],
[/✉?\s*Напиши(?:те)? бабе Зине пару слов/g,'✉ Написать Зине'],w('Написать бабе Зине','Написать Зине'),w('Напиши бабе Зине','Написать Зине'),w('Напиши Зине','Написать Зине'),
w('ступень','шаг'),w('Ступень','Шаг'),w('ступени','шага'),w('Ступени','Шага'),w('ступеней','шагов'),
[/Ларёк «Учительская»/g,'Ларёк'],[/в «Обликах»/g,'в Ларьке'],[/«Облики»/g,'«Ларёк»'],w('Соседки по подъезду','Соседки недели'),w('Живой подъезд','Соседки недели · весь подъезд'),
w('Живая лига','Соседки недели'),w('Живой лиги','Соседок недели'),
w('кляссер','альбом'),w('Кляссер','Альбом'),w('подшивка','альбом'),w('Подшивка','Альбом'),w('подшивку','альбом'),w('подшивке','альбоме'),w('подшивки','альбома'),
w('мутанты','чудные слова'),w('Мутанты','Чудные слова'),w('мутации','чудные слова'),
w('Вечёрка у Зины','Вечёрка'),w('Вечерка у Зины','Вечёрка'),
w('Вести со двора','Новости двора'),w('Из жизни двора','Новости двора'),
w('Школа кабинеты','Школа'),w('Дневник 1 класс','Школа')
];
var EXACT={'Перемена':'Игры','🔔 Перемена':'🎲 Игры','zZ':'Зина отдыхает'};
var BACK={'←':1,'‹ Двор':1,'← Двор':1,'← Домой':1,'‹ Назад':1,'‹':1,'← В меню':1};
function W(t){if(!t||typeof t!=='string')return t;var s=t,k=s.trim();if(EXACT[k])return s.replace(k,EXACT[k]);
for(var i=0;i<L.length;i++)if(L[i][0].test(s)){L[i][0].lastIndex=0;s=s.replace(L[i][0],L[i][1]);}else L[i][0].lastIndex=0;return s;}
var SKIP='#game,.zmg,script,style,textarea,input,svg,canvas';
function skip(n){var e=n.nodeType===1?n:n.parentElement;return!e||!!(e.closest&&e.closest(SKIP));}
function back(b){if(!b||b.getAttribute('data-rsb'))return;var t=(b.textContent||'').trim();if(!BACK[t])return;
b.setAttribute('data-rsb','1');b.classList.add('rs-back');b.textContent='← Назад';b.setAttribute('aria-label','Назад');}
function fix(root){if(!root||skip(root))return;
if(root.nodeType===3){var v=root.nodeValue,n=W(v);if(n!==v)root.nodeValue=n;var p=root.parentElement;if(p&&p.tagName==='BUTTON')back(p);return;}
if(root.nodeType!==1)return;
var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),x,A=[];while((x=tw.nextNode()))A.push(x);
A.forEach(function(t){if(skip(t))return;var v=t.nodeValue,n=W(v);if(n!==v)t.nodeValue=n;});
if(root.tagName==='BUTTON')back(root);
[].forEach.call(root.querySelectorAll('button,.ibtn'),function(b){if(!skip(b))back(b);});
if(root.getAttribute&&root.getAttribute('title')){var tt=root.getAttribute('title'),nt=W(tt);if(nt!==tt)root.setAttribute('title',nt);}}
function regs(){ZB.safe('rsw-reg',function(){(ZB.navSlots||[]).forEach(function(s){if(!s)return;if(s.id==='mg'){s.t='Игры';s.ic='🎲';}});
if(ZB._scr&&ZB._scr.mg)ZB._scr.mg.title='Игры';if(ZB._scr&&ZB._scr.path)ZB._scr.path.title='Путь';
if(typeof ZB.navRender==='function')ZB.navRender();});}
regs();ZB.on('ready',regs);ZB.on('z3late',regs);
var Q=[],raf=0;
function run(){raf=0;var q=Q.splice(0);for(var i=0;i<q.length;i++)try{if(q[i].isConnected)fix(q[i]);}catch(e){}}
function push(n){Q.push(n);if(!raf)raf=(window.requestAnimationFrame||setTimeout)(run);}
var mo=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];
if(m.type==='characterData'){if(!skip(m.target))push(m.target);continue;}
for(var j=0;j<m.addedNodes.length;j++){var n=m.addedNodes[j];if(n.nodeType===1||n.nodeType===3)push(n);}}});
function start(){try{fix(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
RS.words={fix:fix,W:W,list:L,exact:EXACT};
})();
