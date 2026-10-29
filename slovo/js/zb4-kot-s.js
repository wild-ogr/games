'use strict';
(function(){
var Z4=window.Z4,X=window.Z4K;if(!Z4||!Z4.on||!X||X._s)return;X._s=1;
var F=X.F,ZB=window.ZB,DATA='js/zb4-kot-data.js',Q=location.search,QD=/[?&]z4kd=(\d{8})/.exec(Q);
function Z(){return typeof S!=='undefined'&&S&&S.z4k||{};}
function tk(){if(QD)return+QD[1];try{return+todayKey();}catch(e){return 0;}}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function ev(a,p){var o={a:a},k;for(k in p||{})o[k]=p[k];Z4.ev('z4k',o);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function h32(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function T(k){var L=window.Z4T&&Z4T[k];return L&&L.length?L:[];}
function pick(k,seed,c){var L=T(k),t=L.length?L[h32(seed)%L.length]:'';return t.replace(/\{(\w+)\}/g,function(m,x){return c&&c[x]!=null?c[x]:m;});}
function tx(k,c){return Z4.txt(k,c);}
function data(){return window.Z4K_DATA?Promise.resolve():ZB.load(DATA);}
function say(t,m,s){try{if(typeof zina==='function'&&t)zina(t,m||'norm',s||5);}catch(e){}}
function refresh(){try{if(ZB.refresh)ZB.refresh();}catch(e){}}
function dnum(t){t=t||tk();return Math.round(Date.UTC(Math.floor(t/1e4),Math.floor(t/100)%100-1,t%100)/864e5);}
function keyOf(d){var x=new Date(d*864e5);return x.getUTCFullYear()*1e4+(x.getUTCMonth()+1)*100+x.getUTCDate();}
function gl(){return typeof G!=='undefined'&&G?G:null;}
function cat(){try{return typeof catSVG==='function'?catSVG():'🐈';}catch(e){return'🐈';}}
if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4k==null)ZBECO.cap.z4k=8;
function give(k){try{return window.ZBECO&&ZBECO.give?ZBECO.give('z4k',k,'gift'):0;}catch(e){return 0;}}
data().then(null,function(){});
function css(){if(document.getElementById('z4kCss'))return;var s=document.createElement('style');s.id='z4kCss';s.textContent=
'.let.z4k-st{opacity:.35}'+
'.z4k-vc{position:absolute;z-index:6;border:0;padding:0;margin:0;background:none;cursor:pointer;min-width:56px;min-height:56px;-webkit-tap-highlight-color:transparent}'+
'.z4k-vc svg{width:100%;height:100%;display:block}'+
'.z4k-vc b{position:absolute;right:-4px;bottom:2px;min-width:30px;height:30px;line-height:30px;border-radius:9px;background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);border:2px solid var(--z3-acc,#c2410c);font-size:19px;font-weight:700;text-transform:uppercase}'+
'.z4k-in{animation:z4kin .35s ease-out}@keyframes z4kin{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}'+
'.z4k-kc{position:absolute;z-index:4;pointer-events:none;transition:left .35s,top .35s}.z4k-kc svg{width:120%;height:120%;margin:-10% 0 0 -10%;display:block}'+
'html.z4k-away #zbCat{visibility:hidden}'+
'html.z4k-san .zina .av .face.on:not(.z4k-av){display:none}html.z4k-san .zina .av .face.z4k-av{display:block}'+
'html.z4k-san #hLet .lbl:after,html.z4k-san #hWord .lbl:after{content:" 🐟"}'+
'.z4k-c{font-size:15px;line-height:1.4;color:var(--z3-ink,#27324a)}.z4k-c h4{margin:0 0 4px;font-size:16px;font-family:var(--z3-font-head,inherit)}.z4k-c p{margin:4px 0}'+
'.z4k-sm{font-size:13.5px;color:var(--z3-ink2,#5d6781)}'+
'.z4k-bt{display:inline-block;min-height:44px;min-width:44px;margin:6px 6px 0 0;padding:8px 14px;border-radius:10px;border:1px solid var(--z3-acc-edge,#9a3412);background:var(--z3-acc,#c2410c);color:#fff;font-size:15px;cursor:pointer}'+
'.z4k-bt.g{background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);border-color:var(--z3-line,#e6dcc8)}'+
'.z4k-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:80;background:rgba(20,24,36,.55);display:flex;align-items:center;justify-content:center;padding:12px}'+
'.z4k-nb{width:100%;max-width:420px;max-height:96%;overflow:auto;background:var(--z3-paper,#fbf7ec);color:var(--z3-ink,#27324a);border-radius:var(--z3-r,12px);padding:14px 14px 12px;'+
'background-image:repeating-linear-gradient(transparent 0 33px,rgba(37,99,201,.18) 33px 34px);box-shadow:0 8px 30px rgba(0,0,0,.3)}'+
'.z4k-nb h3{margin:0 0 6px;font-size:18px;font-family:var(--z3-font-head,inherit)}.z4k-nb .cat{float:right;width:56px;height:56px}.z4k-nb .cat svg{width:100%;height:100%}'+
'.z4k-w{display:flex;align-items:center;width:100%;min-height:46px;margin:4px 0;padding:6px 10px;border:1px solid var(--z3-line,#e6dcc8);border-radius:10px;background:var(--z3-card,#fff);'+
'color:var(--z3-ink,#27324a);font-size:19px;letter-spacing:1px;text-align:left;cursor:pointer;font-family:inherit}'+
'.z4k-w i{margin-left:auto;font-style:normal;color:#b91c1c;font-weight:700;font-size:20px}.z4k-w.on{border-color:#b91c1c;text-decoration:line-through;text-decoration-color:#b91c1c}'+
'.z4k-w.ok i{color:#237a3b}.z4k-w .fx{margin-left:10px;color:#b91c1c;font-size:16px;text-decoration:none;display:inline-block}'+
'.z4k-pap{margin:10px 0;padding:10px 12px;border:1px dashed var(--z3-line,#e6dcc8);border-radius:var(--z3-r,12px);background:var(--z3-paper,#fbf7ec);color:var(--z3-ink,#27324a);font-size:15px;line-height:1.4}'+
'.z4k-pap h4{margin:2px 0 4px;font-size:16px;font-family:var(--z3-font-head,inherit)}.z4k-pap p{margin:4px 0}';
document.head.appendChild(s);}
css();
var lw=Date.now();
Z4.onStart(function(){lw=Date.now();});
Z4.onWord(function(o){if(!o.bonus)lw=Date.now();});
Z4.onWin(function(){var z=Z(),t=tk();if(t&&z.lp!==t){z.lp=t;sv();}});
function mine(c){return!!c&&!c.open&&!c.lock&&!c.zk&&!c.z4c;}
function freeCell(g,skip,rnd){var C=[];g.words.forEach(function(w){if(w.found)return;wordCells(w).forEach(function(c){if(mine(c)&&c!==skip&&C.indexOf(c)<0)C.push(c);});});
if(!C.length)return null;return rnd?C[Math.random()*C.length|0]:C[0];}
function putLetter(g){if(gl()!==g||g.won)return false;
var ws=g.words.filter(function(x){return!x.found&&wordCells(x).some(mine);})
.sort(function(a,b){return wordCells(a).filter(function(c){return c.open;}).length/a.w.length-wordCells(b).filter(function(c){return c.open;}).length/b.w.length;});
var c=ws.length&&wordCells(ws[0]).filter(mine)[0];if(!c)return false;
openCell(c,0,'cat');try{SND.open();}catch(e){}try{checkAutoFoundAndWin();saveCur();}catch(e){}return true;}
var VOR=null;
function vorRun(g,done,info){var tries=0;
(function go(){if(gl()!==g||g.won){done();return;}
if(typeof dragging!=='undefined'&&dragging&&tries++<8){setTimeout(go,700);return;}
var wh=document.getElementById('wheel'),els=wh?wh.querySelectorAll('.let'):[];if(!els.length){done();return;}
var i=Math.random()*els.length|0,el=els[i],ch=String(g.letters[i]||el.textContent||''),z=Z();z.vl=info.lv;z.vn=(z.vn|0)+1;sv();
var D=wh.clientWidth||200,sz=Math.max(60,Math.round(D*.36)),b=document.createElement('button');b.type='button';b.className='z4k-vc'+(calm()?'':' z4k-in');
b.setAttribute('aria-label','Кот Ять держит букву — нажми, отдаст');b.style.width=b.style.height=sz+'px';b.style.left=b.style.top=Math.round((D-sz)/2)+'px';
b.innerHTML=cat()+'<b>'+esc(ch.toUpperCase())+'</b>';
var fin=function(tap){if(!VOR)return;clearTimeout(VOR.t);clearInterval(VOR.iv);VOR=null;if(b.parentNode)b.parentNode.removeChild(b);el.classList.remove('z4k-st');
var live=gl()===g&&!g.won;ev('vor',{r:tap?'tap':live?'self':'end',lv:info.lv});
if(live){if(tap&&putLetter(g))say(tx('z4k.vorok',{ch:ch.toUpperCase()}),'happy',6);else if(tap!==null)say(tx('z4k.vorself',{ch:ch.toUpperCase()}),'norm',5);}
done();};
var stop=function(e){e.stopPropagation();};b.addEventListener('pointerdown',stop);b.addEventListener('mousedown',stop);b.addEventListener('touchstart',stop,{passive:true});
b.addEventListener('click',function(e){e.stopPropagation();fin(true);});
wh.appendChild(b);el.classList.add('z4k-st');try{SND.meow();}catch(e){}
VOR={g:g,b:b,t:setTimeout(function(){fin(false);},(info.ok?25:15)*1000),
iv:setInterval(function(){if(gl()!==g||g.won||!b.parentNode||el.textContent!==ch&&el.textContent!==ch.toUpperCase()&&el.textContent.toLowerCase()!==ch.toLowerCase())fin(null);},400)};
data().then(function(){if(VOR&&VOR.b===b)say(tx('z4k.vor',{ch:ch.toUpperCase()}),'wow',8);},function(){});})();}
Z4.lvlEvent.add({id:'z4k.vor',who:'KOT',w:1,ok:function(i){if(!F.vor)return false;var z=Z();return!z.vl||i.lv-z.vl>=(i.ok?16:10);},run:vorRun});
var KR=null;
function krPos(){var k=KR;if(!k)return;var s=k.c.el.style,o=k.d.style;o.left=s.left;o.top=s.top;o.width=s.width;o.height=s.height;}
function krSit(c){var k=KR;if(k.c&&k.c.__z4k){k.c.lock=false;k.c.__z4k=0;}k.c=c;c.lock=true;c.__z4k=1;krPos();}
function krEnd(how){var k=KR;if(!k)return;KR=null;clearInterval(k.iv);if(k.d.parentNode)k.d.parentNode.removeChild(k.d);if(k.c&&k.c.__z4k){if(!k.c.open)k.c.lock=false;k.c.__z4k=0;}
var live=gl()===k.g&&!k.g.won;ev('kr',{r:how,j:k.j,lv:k.lv});
if(live&&how==='word'){if(Math.random()<.35&&putLetter(k.g))say(tx('z4k.krg'),'happy',6);else say(tx('z4k.krl'),'norm',5);}
else if(live&&how==='idle')say(tx('z4k.krl'),'norm',5);
k.done();}
function krRun(g,done,info){if(gl()!==g||g.won||Date.now()-lw>30000){done();return;}
var left=g.words.filter(function(w){return!w.found;}).length,c=freeCell(g,null,true),grid=document.getElementById('grid');
if(left<2||!c||!grid){done();return;}var z=Z();z.kl=info.lv;z.kn=(z.kn|0)+1;sv();
var d=document.createElement('div');d.className='z4k-kc'+(calm()?'':' z4k-in');d.setAttribute('aria-hidden','true');d.innerHTML=cat();
KR={g:g,c:null,d:d,j:0,lv:info.lv,done:done,iv:0};grid.appendChild(d);krSit(c);
KR.iv=setInterval(function(){var k=KR;if(!k)return;if(gl()!==k.g||k.g.won||!d.parentNode){krEnd('end');return;}
if(Date.now()-lw>30000){krEnd('idle');return;}if(k.c.open)krMove();else krPos();},400);
data().then(function(){if(KR&&KR.d===d)say(tx('z4k.kr'),'wow',8);},function(){});}
function krMove(){var k=KR;if(!k)return;var left=k.g.words.filter(function(w){return!w.found;}).length,c=k.j<2&&left>=2?freeCell(k.g,k.c,true):null;
if(!c){krEnd('word');return;}k.j++;krSit(c);say(tx('z4k.krj'),'happy',5);}
Z4.onWord(function(o){var k=KR;if(!k||o.G!==k.g||o.bonus||!k.c.open)return;setTimeout(function(){if(KR===k)krMove();},0);});
Z4.onWin(function(){if(KR)krEnd('end');});
Z4.lvlEvent.add({id:'z4k.kr',who:'KOT',w:1,ok:function(i){if(!F.kr)return false;var z=Z();return!z.kl||i.lv-z.kl>=(i.ok?16:8);},run:krRun});
var VOW={'о':'а','а':'о','е':'и','и':'е','я':'е','у':'ю','ы':'и'};
function typo(w,s){var a=w.split(''),k=s%4,i,L=a.length;
if(k===0){for(i=0;i<L-1;i++){var j=(i+s)%(L-1);if(a[j]!==a[j+1]){var t=a[j];a[j]=a[j+1];a[j+1]=t;return a.join('');}}}
if(k<=1){for(i=0;i<L;i++){var q=(i+s)%L;if(VOW[a[q]]){a[q]=VOW[a[q]];return a.join('');}}}
if(k===2){for(i=0;i<L;i++){var p=(i+s)%L;if(!VOW[a[p]]&&/[бвгджзклмнпрстфхцчшщ]/.test(a[p])){a.splice(p,0,a[p]);return a.join('');}}}
if(L>=4){a.splice(1+s%(L-2),1);return a.join('');}
return w+w.charAt(L-1);}
function realWord(x){try{return typeof dictReady==='function'&&dictReady()&&typeof isWord==='function'&&isWord(x);}catch(e){return false;}}
function tetWords(){var t=tk(),out=[],seen={};
for(var b=1;b<=4&&out.length<6;b++){var idx=+S.lv-b;if(idx<0)break;var lv=null;try{lv=levelData(idx);}catch(e){}if(!lv||!lv.w)continue;
var W=lv.w.map(function(x){return String(x[0]||'').toLowerCase();}).filter(function(x){return x.length>=3&&!seen[x];});
W.sort(function(a,b){return h32(t+a)%97-h32(t+b)%97;});W.forEach(function(x){if(out.length<6&&!seen[x]){seen[x]=1;out.push(x);}});}
if(out.length<4)return null;var nb=Math.min(out.length-1,2+h32('n'+t)%3),R=out.map(function(w){return{w:w,s:w,bad:0};});
var ord=R.map(function(r,i){return i;}).sort(function(a,b){return h32('o'+t+a)%89-h32('o'+t+b)%89;});
for(var k=0;k<ord.length&&nb>0;k++){var r=R[ord[k]];for(var a=0;a<6;a++){var x=typo(r.w,h32(t+r.w+a));if(x!==r.w&&!realWord(x)&&!seen[x]){r.s=x;r.bad=1;nb--;break;}}}
return R;}
function tetDue(){var z=Z(),t=tk();return F.tet&&Z4.open('z4k.tet')&&t&&z.tq===t&&z.td!==t&&+S.lv>=4;}
function tetOpen(){var R=tetWords();if(!R){var z=Z();z.td=tk();sv();refresh();return;}css();ev('tetc',{});
var ov=document.createElement('div');ov.className='z4k-ov';
var rows=R.map(function(r,i){return'<button type="button" class="z4k-w" data-i="'+i+'"><span>'+esc(r.s.toUpperCase())+'</span><i></i></button>';}).join('');
ov.innerHTML='<div class="z4k-nb" role="dialog" aria-label="Тетрадка Ятя"><div class="cat">'+cat()+'</div><h3>📓 Тетрадка Ятя</h3><p class="z4k-sm">'+esc(tx('z4k.teth'))+'</p>'+
rows+'<div class="z4k-res"></div><button type="button" class="z4k-bt" data-a="ok">✍️ Проверено</button><button type="button" class="z4k-bt g" data-a="x">Потом</button></div>';
document.body.appendChild(ov);var fin=0;
function close(){if(ov.parentNode)ov.parentNode.removeChild(ov);refresh();}
ov.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b){if(e.target===ov&&fin)close();return;}
if(b.dataset.i!=null){if(fin)return;b.classList.toggle('on');b.querySelector('i').textContent=b.classList.contains('on')?'✗':'';return;}
if(b.dataset.a==='x'){close();return;}
if(b.dataset.a==='ok'){if(fin){close();return;}fin=1;var good=0;
[].forEach.call(ov.querySelectorAll('.z4k-w'),function(e){var r=R[+e.dataset.i],m=e.classList.contains('on');if(m===!!r.bad)good++;
e.querySelector('i').textContent=r.bad?(m?'✗ ✓':'✗ пропущено'):(m?'верно было':'✓');if(!r.bad&&!m)e.classList.add('ok');
if(r.bad){e.classList.add('on');var f=document.createElement('span');f.className='fx';f.textContent='→ '+r.w.toUpperCase();e.querySelector('span').appendChild(f);}});
var z=Z(),all=good===R.length,c=all?give(5):good===R.length-1?give(2):0;z.td=tk();z.tn=(z.tn|0)+1;if(all)z.tg=(z.tg|0)+1;sv();
ev('tet',{g:good,of:R.length,c:c});
ov.querySelector('.z4k-res').innerHTML='<p><b>'+esc(tx(all?'z4k.tet2':good===R.length-1?'z4k.tet1':'z4k.tet0'))+'</b>'+(c?' +'+c+' монет':'')+'</p>';
b.textContent='Закрыть';var p=ov.querySelector('[data-a="x"]');if(p)p.parentNode.removeChild(p);}});}
function begState(t){t=t||tk();if(!F.beg||!Z4.open('z4k.beg')||!t)return null;var d=dnum(t),ph=(d+5)%24;if(ph>2)return null;var e=d-ph;
for(var k=-1;k<=3;k++)if(sanOn(keyOf(e+k)))return null;return{away:ph<2,back:ph===2,e:e,d:d};}
function sanIdx(t){var m=Math.floor(t/100)%100,y=Math.floor(t/1e4),d=t%100;if(m!==1&&m!==4&&m!==7&&m!==10)return-1;
var wd=new Date(Date.UTC(y,m-1,15)).getUTCDay(),mon=15-((wd+6)%7);return d>=mon&&d<=mon+6?d-mon:-1;}
function sanOn(t){return sanIdx(t)>=0;}
function san(){var t=tk();return F.san&&Z4.open('z4k.san')&&t&&sanOn(t);}
var avMO=null;
function sanAv(){var av=document.getElementById('zAv');if(!av)return;
if(!av.querySelector('.z4k-av')){var i=document.createElement('i');i.className='face z4k-av';i.innerHTML=cat();av.appendChild(i);}
if(!avMO&&window.MutationObserver){avMO=new MutationObserver(function(){if(san()&&!av.querySelector('.z4k-av'))sanAv();});avMO.observe(av,{childList:true});}}
var sw=0;
function later(t,g){setTimeout(function(){if(gl()===g&&!g.won&&t)say(t,'happy',5);},0);}
Z4.onWord(function(o){if(!san()||o.bonus||!window.Z4K_DATA)return;if(o.byHint){later(tx('z4k.sfish'),o.G);return;}
if(o.left>0&&++sw%3===0)later(tx('z4k.sw'),o.G);});
function papInject(el,op){op=op||{};if(!san()||!el||op.r||op.arch||op.pg||op.dn!=null)return;var sh=el.querySelector('.z3p-sheet');if(!sh)return;
if(!window.Z4K_DATA){data().then(function(){if(ZB.cur==='z3paper')papInject(el,op);},function(){});return;}
var old=sh.querySelector('.z4k-pap');if(old)old.parentNode.removeChild(old);var t=tk(),L=T('z4k.sp'),a=h32('sp'+t)%L.length,b=(a+1+h32('sq'+t)%(L.length-1))%L.length;
var d=document.createElement('div');d.className='z4k-pap';d.innerHTML='<h4>🐾 Мурчёрка</h4><p class="z4k-sm">Выпуск ведёт Ять, пока Зина в санатории.</p><p>'+esc(L[a])+'</p><p>'+esc(L[b])+'</p>';
var fr=sh.querySelector('.z3p-front');if(fr&&fr.nextSibling)sh.insertBefore(d,fr.nextSibling);else sh.insertBefore(d,sh.firstChild);ev('san',{w:'paper'});}
function papHook(){var P=window.Z3PAPER;if(!P||!P.render||P.render._z4k)return;var o=P.render;
P.render=function(el,op){var r=o.apply(this,arguments);ZB.safe('z4k-pap',function(){papInject(el,op);});return r;};for(var k in o)P.render[k]=o[k];P.render._z4k=1;}
function papLate(){var el=document.getElementById('zb-z3paper');if(el&&ZB.cur==='z3paper'&&!el.querySelector('.z4k-pap')&&!el.querySelector('.z3p-game'))papInject(el,{});}
ZB.on('screen',function(id){if(id!=='zb-z3paper'||!san())return;papHook();var P=window.Z3PAPER;
if(P&&P.x&&!P.ui)P.x().then(function(){ZB.safe('z4k-pap',function(){papHook();setTimeout(function(){ZB.safe('z4k-pap',papLate);},80);});},function(){});
setTimeout(function(){ZB.safe('z4k-pap',function(){papHook();papLate();});},80);});
var CK='';
function cardKind(){var b=begState();if(san())return'san';if(b&&b.away)return'away';if(b&&b.back&&Z().bm!==b.e)return'back';if(tetDue())return'tet';return'';}
function cardHtml(){var t=tk(),b=begState(),k=CK;
if(k==='san'){var i=sanIdx(t);return'<div class="z4k-c"><h4>💌 Открытка из Кисловодска</h4><p>'+esc(T('z4k.sc')[i]||'')+'</p><p class="z4k-sm">Твоя Зина. Санаторий, день '+(i+1)+' из 7. Пока меня нет — за главного Ять.</p></div>';}
if(k==='away')return'<div class="z4k-c"><h4>🐾 Ять в бегах</h4><p>'+esc(pick('z4k.beg','b'+b.e))+'</p><p class="z4k-sm">'+esc(pick('z4k.begs','s'+t))+'</p></div>';
if(k==='back')return'<div class="z4k-c"><h4>🐈 Ять вернулся!</h4><p>'+esc(pick('z4k.begb','r'+b.e))+'</p><button type="button" class="z4k-bt" data-z4k="milk">🥛 Налить молока</button></div>';
if(k==='tet')return'<div class="z4k-c"><h4>📓 Тетрадка Ятя</h4><p>'+esc(pick('z4k.tetc','t'+t))+'</p><button type="button" class="z4k-bt" data-z4k="tet">✍️ Проверить</button></div>';
return'';}
Z4.card.add({id:'z4k',order:function(){return CK==='san'||cardKind()==='san'?35:CK==='tet'?55:45;},show:function(){CK=cardKind();return!!CK;},
html:function(){css();if(!window.Z4K_DATA){data().then(refresh,function(){});return'';}return cardHtml();},
mount:function(el){if(!el)return;var k=CK;if(k==='san'||k==='away')ev(k==='san'?'san':'beg',{w:'card'});
[].forEach.call(el.querySelectorAll('[data-z4k]'),function(b){b.addEventListener('click',function(){var a=b.dataset.z4k;
if(a==='tet')tetOpen();
if(a==='milk'){var s=begState(),z=Z();if(!s||z.bm===s.e)return;z.bm=s.e;var c=give(3);sv();ev('milk',{c:c});
say(tx('z4k.begm'),'happy',6);try{toast('🥛 Ять доволен'+(c?': +'+c+' монет':''),2500);}catch(e){}refresh();}});});}});
Z4.winLine.add({id:'z4k',order:50,txt:function(i){var b=begState();if(!b||!b.away||!window.Z4K_DATA||i.daily)return'';return'🐾 '+pick('z4k.begs','w'+tk()+'-'+i.lv);}});
function mark(){var b=begState(),h=document.documentElement.classList;h.toggle('z4k-away',!!(b&&b.away));h.toggle('z4k-san',!!san());if(san())sanAv();}
Z3.whenReady(function(){ZB.safe('z4k-ready',function(){var z=Z(),t=tk();if(F.tet&&t&&z.lp&&z.lp<t&&z.tq!==t){z.tq=t;sv();}mark();refresh();});});
Z4.onStart(function(){ZB.safe('z4k-mark',mark);});
X.dbg={tetWords:tetWords,typo:typo,begState:begState,sanIdx:sanIdx,cardKind:cardKind,kr:function(){return KR;},vor:function(){return VOR;},lw:function(x){lw=+x||Date.now();}};
})();
