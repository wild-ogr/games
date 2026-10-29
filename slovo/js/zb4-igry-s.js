'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.IGR||Z.IGR.s)return;
var X=Z.IGR,O=X.on;X.s=1;
var FK=(/[?&]z4i=([a-z]+)/.exec(location.search)||[])[1]||'';
var LV={two:100,bag:60,slog:40,big:20};
function tk(){try{return+todayKey();}catch(e){return 0;}}
function zz(){if(typeof S==='undefined'||!S)return{};if(!S.z4i||typeof S.z4i!=='object')S.z4i={};return S.z4i;}
function lv(){return typeof S!=='undefined'&&S?+S.lv||0:0;}
function ev(a,o){o=o||{};o.a=a;Z.ev('z4i',o);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pcOk(){try{return!!window.OK&&!TOUCH;}catch(e){return false;}}
X.tk=tk;X.zz=zz;X.ev=ev;X.esc=esc;X.FK=FK;
X.chap=function(){return Math.floor(lv()/20)+1;};
X.x=function(){return Promise.all([window.Z4IX?Promise.resolve():ZB.load('js/zb4-igry-x.js'),ZB.load('js/zb4-igry-data.js').catch(function(){})]);};
X.open=function(k,o){ev('open',{k:k,f:(o&&o.from)||''});X.x().then(function(){if(window.Z4IX)Z4IX.open(k,o||{});},function(){try{toast('Не загрузилось — попробуй ещё раз',3000);}catch(e){}});};
function can(k){return!!O[k]&&Z.open('z4i.'+k)&&(lv()>=LV[k]||X.FK===k);}
X.can=can;
function due(k){var z=zz(),t=tk();if(!can(k))return false;if(X.FK)return X.FK===k;
if(k==='two')return+z.td!==t;if(k==='bag')return+z.kd!==t;if(k==='big')return+z.bd!==t;if(k==='slog')return+z.sc<X.chap();return false;}
X.due=due;
function ord(){var big=(typeof S!=='undefined'&&S&&S.big)||pcOk();return big?['big','slog','two','bag']:['slog','two','bag','big'];}
function first(skip){var L=ord();for(var i=0;i<L.length;i++)if(L[i]!==skip&&due(L[i]))return L[i];return'';}
X.first=first;
var CH={two:['📒','Две тетради','z4i.two.card','Два кроссворда на одном круге — ищи слово-двойник'],
bag:['👜','Мешок букв','z4i.bag.card','Без кроссворда: слово съедает букву, из мешка падает новая'],
slog:['✂️','Слово-половинки','z4i.slog.card','В круге не буквы, а кусочки: ПО, ДУШ, КА'],
big:['☕','Уровень на чашку чая','z4i.big.card','Крупно, 4–5 букв, пара минут — как раз к чаю']};
X.CH=CH;
var shown='';
Z.card.add({id:'z4i',order:50,show:function(){return!!first();},
html:function(){var k=first(),c=CH[k];if(!c)return'';if(shown!==k+tk()){shown=k+tk();ev('show',{k:k});}
return'<div class="z4i-c" style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;border-radius:var(--z3-rb,16px);background:var(--z3-card,#fff);box-shadow:var(--z3-shadow);color:var(--z3-ink,#27324a);font-family:var(--z3-font)">'+
'<span style="font-size:30px;line-height:1">'+c[0]+'</span><span style="flex:1;min-width:0;text-align:left"><b style="display:block;font-size:16px">'+esc(c[1])+'</b>'+
'<small style="display:block;font-size:14px;color:var(--z3-ink2,#5d6781)">'+esc(Z.txt(c[2])||c[3])+'</small></span>'+
'<button type="button" class="btn green small z4i-cb" data-k="'+k+'" style="min-height:44px">Играть</button></div>';},
mount:function(el){var b=el&&el.querySelector('.z4i-cb');if(!b)return;b.onclick=function(){try{SND.tap();}catch(e){}X.open(b.getAttribute('data-k'),{from:'card'});};}});
if(['two','bag','slog','big'].some(can))try{ZB.load('js/zb4-igry-data.js').catch(function(){});}catch(e){}
var wlK='',wlG=null;
Z.winLine.add({id:'z4i',order:50,txt:function(i){wlK='';wlG=null;if(i.daily||i.mode||!i.G)return'';
var k=first();if(!k)return'';wlK=k;wlG=i.G;
return'🎲 '+(Z.txt('z4i.wl',{t:CH[k][1]})||CH[k][1]+' — новый вид уровня')+' ›';}});
document.addEventListener('click',function(e){var t=e.target;while(t&&t!==document&&!(t.classList&&t.classList.contains('z4wl')))t=t.parentNode;
if(!t||t===document||!wlK||typeof G==='undefined'||G!==wlG||String(t.textContent).indexOf('🎲')!==0)return;
var k=wlK;wlK='';try{SND.tap();}catch(x){}try{hideModal();}catch(x){}X.open(k,{from:'win'});},true);
})();
