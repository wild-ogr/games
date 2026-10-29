'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||ZB.mgr)return;
var ON_NODE=!ZB2.off('node'),ON_AUTO=!ZB2.off('autonajdi'),DEF={r:0,k:0,ni:-1,ng:'',sk:-1,a:0,ad:0,nq:0,nn:0,nf:0};
function Z(){if(!S.z2g||typeof S.z2g!=='object')S.z2g=JSON.parse(JSON.stringify(DEF));return S.z2g;}
var M=function(){return window.ZMG||null;},shot=function(){return typeof SHOT!=='undefined'&&SHOT;};
var NOT=['vecherka','loto','najdi'],KIND={lovit:1};
function kindOf(id){var m=M(),i=m&&m.info(id);if(i&&i.k)return i.k==='l'?1:0;return KIND[id]?1:0;}
function isNode(idx){return idx>=4&&idx%10===4;}
function nodeOk(){return ON_NODE&&!!M()&&!shot();}
function pick(idx){var m=M(),z=Z();if(z.ni===idx&&z.ng&&m.avail(z.ng))return z.ng;
var L=m.openList().filter(function(g){return NOT.indexOf(g.id)<0;});if(!L.length)return'';
var want=z.r?1-z.k:1,C=L.filter(function(g){return kindOf(g.id)===want;});if(!C.length)C=L;
var zm=m.Z();C.sort(function(a,b){return(zm.n[a.num]|0)-(zm.n[b.num]|0)||a.num-b.num;});z.ni=idx;z.ng=C[0].id;return z.ng;}
function nodeFor(idx){if(!nodeOk()||!isNode(idx)||idx!==(+S.lv||0)||Z().sk===idx)return'';return pick(idx);}
function UI(){return window.ZBNODEUI?Promise.resolve(window.ZBNODEUI):ZB.load('js/zb2-node-ui.js').then(function(){return window.ZBNODEUI;});}
var X=ZB.mgr={Z:Z,M:M,kindOf:kindOf,nodeLevel:function(c){return!!(c&&c.g&&c.g.zrNode);}};
ZB.startHook.push(function(info){if(!info||info.daily||info.mode||!nodeOk()||!isNode(info.idx)||info.idx!==(+S.lv||0))return;
if(M().busy)return;var id=nodeFor(info.idx),g=typeof G!=='undefined'?G:null;if(!id||!g||g.idx!==info.idx||g.won)return;
g.zrNode=id;save();UI().then(function(U){setTimeout(function(){ZB.safe('node:card',function(){U.card(g,id);});},250);},function(){g.zrNode='';});});
function nextNode(from,to){for(var i=Math.max(from,+S.lv||0);i<=to;i++)if(isNode(i))return i;return-1;}
ZB.add(ZB.pathSlots,{id:'zr-node',order:20,zone:'node',
render:function(c){if(!c||!c.cur||!nodeOk())return'';var i=nextNode(c.from,c.to);if(i<0)return'';var id=Z().sk===i?'':pick(i),inf=id&&M().info(id);
return'<button type="button" class="zr-pb" data-i="'+i+'" style="display:block;margin-top:6px;border:0;border-radius:12px;background:#fff1c7;color:#7a4b00;font:inherit;font-weight:800;font-size:13.5px;padding:7px 9px;min-height:36px;text-align:left">🔔 Ур. '+(i+1)+' — Перемена'+(inf?': '+ZB.esc(inf.t):'')+'</button>';},
mount:function(el){var b=el.querySelector('.zr-pb');if(b)b.onclick=function(e){e.stopPropagation();try{SND.tap();}catch(x){}var i=+b.getAttribute('data-i'),l=+S.lv||0;
if(i>l){toast('Сначала пройди уровень '+(l+1));return;}maybeInterstitial(function(){startLevel(i);});};}});
if(typeof openLevels==='function'){var ol=window.openLevels;window.openLevels=function(){ol.apply(this,arguments);ZB.safe('node:levels',function(){if(!nodeOk()||!M().openList().length)return;
[].forEach.call(document.querySelectorAll('#lvList .lv[data-i]'),function(b){var i=+b.getAttribute('data-i');if(isNode(i)&&i>=(+S.lv||0)){b.style.position='relative';
b.insertAdjacentHTML('beforeend','<span class="zr-lb" style="position:absolute;right:-4px;top:-6px;font-size:16px">🔔</span>');}});});};}
function autoDue(g,again){var m=M();if(!ON_AUTO||!m||again||!g||g.daily||shot()||(m.isOff&&m.isOff('najdi')))return false;return Z().a<Math.floor(g.idx/CH_LEN)+1;}
if(typeof openChapFinale==='function'){var of=window.openChapFinale;window.openChapFinale=function(g,r,nextI,again){of.apply(this,arguments);
ZB.safe('auto:najdi',function(){if(!autoDue(g,again))return;var b=document.getElementById('mGo');if(!b)return;var h=b.onclick,c=Math.floor(g.idx/CH_LEN);
b.onclick=function(){if(!autoDue(g,false))return h.apply(this,arguments);Z().a=c+1;save();hideModal();try{SND.tap();}catch(x){}
var go=function(){h.call(b);};UI().then(function(U){U.count(c,go);},go);};});};}
if(nodeOk()&&(+S.lv||0)>=4)setTimeout(function(){UI().catch(function(){});},6000);
ZB.refresh();
})();
