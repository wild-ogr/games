'use strict';
(function(){
if(typeof ZB==='undefined'||typeof S==='undefined'||!window.RS||!RS.on||!RS.on('sect'))return;
var esc=ZB.esc||function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
function tap(){try{SND.tap();}catch(e){}}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function ev(a,o){try{o=o||{};o.a=a;STAT.ev('rs',o);}catch(e){}}
(function(){if(document.querySelector('link[data-rss]'))return;var l=document.createElement('link');l.rel='stylesheet';l.href='css/rs-sect.css';l.setAttribute('data-rss','1');document.head.appendChild(l);})();
function home(){if(ZB._scr.home)ZB.go('home');else try{openMenu();}catch(e){}}
function hd(t,sub){return'<div class="rs-hd"><button type="button" class="rs-back" data-rs="back">← Назад</button><div class="rs-ht"><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div></div>';}
function Z3y(id){var Y=window.Z3&&Z3.yard;if(!Y)return null;for(var i=0;i<Y.length;i++)if(Y[i]&&Y[i].id===id)return Y[i];return null;}
function yard(id){var y=Z3y(id);if(y&&y.go){ZB.safe('rs-yard:'+id,function(){y.go();});return true;}
if(window.Z3&&Z3.yardGo){ZB.safe('rs-yardgo:'+id,function(){Z3.yardGo(id);});return true;}return false;}
var OPEN={games:function(o){ZB.go('mg',o||{});},school:function(o){ZB.go('school',o||{});},path:function(){ZB.go('school',{tab:'path'});},
dict:function(){try{dictTab='mine';}catch(e){}try{openDict();}catch(e){}},
paper:function(){if(!yard('paper'))news('num');},news:function(){news('board');},
mail:function(){yard('mail');},podezd:function(){yard('bench');},stroika:function(){yard('build');},
shop:function(){if(!yard('kiosk'))try{openShop();}catch(e){}},komod:function(){if(!yard('album')&&ZB._scr.z3album)ZB.go('z3album',{});},
settings:function(){try{openSettings();}catch(e){}}};
var ALIAS={bench:'podezd',build:'stroika',kiosk:'shop',album:'komod',ugolok:'games'};
function open(id,o){id=ALIAS[id]||id;var f=OPEN[id];if(!f)return false;ev('open',{s:id});ZB.safe('rs-open:'+id,function(){f(o);});return true;}
var TOP6=['baraban','vecherka','zagadala','najdi','diktant','slova'];
var ROWS=[];
function Z4(){return window.Z4||null;}
function card(id){var Z=Z4();if(!Z||!Z.card||!Z.card.L)return null;for(var i=0;i<Z.card.L.length;i++)if(Z.card.L[i].id===id)return Z.card.L[i];return null;}
function cardOn(id){var c=card(id);return!!(c&&ZB.safe('rs-card:'+id,function(){return c.show();}));}
function kinds(X,L){if(!X||!X.s||typeof X.can!=='function')return[];return L.filter(function(k){return ZB.safe('rs-can',function(){return X.can(k[0]);});});}
ROWS.push({id:'show',ic:'📺',t:'Телешоу у Зины',sub:'Лото, Барабан, своя игра, песня',card:'z4w',show:function(){return!!window.Z4W;}});
ROWS.push({id:'stol',ic:'🍵',t:'За одним столом',sub:'банка, скрабл, внук',card:'z4l',show:function(){return!!window.Z4L;}});
ROWS.push({id:'kuh',ic:'🥘',t:'Кухня и дача',sub:'борщ, книга рецептов, грядка, банки',show:function(){return!!ZB._scr.z4kuh;},go:function(){ZB.go('z4kuh');}});
var ZAB=[['port','🎒','Портфель четверти'],['kontr','📝','Контрольная дня'],['tetr','📓','Бесконечная тетрадь']];
ROWS.push({id:'zabeg',ic:'🏃',t:'Забеги по пройденным',sub:'пройденные уровни заново — на время',ks:function(){var Z=Z4();return kinds(Z&&Z.ZAB,ZAB);},X:function(){var Z=Z4();return Z&&Z.ZAB;}});
function igrK(){var Z=Z4(),X=Z&&Z.IGR;if(!X||!X.CH)return[];return Object.keys(X.CH).map(function(k){return[k,X.CH[k][0],X.CH[k][1]];});}
ROWS.push({id:'igry',ic:'🧩',t:'Новые виды уровней',sub:'слог, две тетради, мешок букв',ks:function(){var Z=Z4();return kinds(Z&&Z.IGR,igrK());},X:function(){var Z=Z4();return Z&&Z.IGR;}});
function lvl(){return window.RS&&RS.lvl&&RS.lvl.play?RS.lvl:null;}
function lvCan(k){var L=lvl();return!!(L&&(!L.can||ZB.safe('rs-lvcan',function(){return L.can(k);})));}
[['int','🎯','Уровень на интерес','спор с Зиной: копилка серии, раз в день'],['sur','🎁','Уровень с сюрпризом','на уровне что-нибудь случится, раз в день']].forEach(function(x){
ROWS.push({id:'lv-'+x[0],ic:x[1],t:x[2],sub:function(){return lvCan(x[0])?x[3]:'сегодня сыграно — завтра снова';},show:function(){return!!lvl()&&!!(window.Z4&&window.Z4.on)&&(+S.lv||0)>=30;},
go:function(){if(lvCan(x[0]))lvl().play(x[0]);else try{toast('Сегодня уже сыграно — завтра снова',2400);}catch(e){}}});});
ROWS.push({id:'modes',ic:'⭐',t:'Особые уровни',sub:'«До последнего слова», «Сканворд деда Семёна», «Электричка»',show:function(){return!!ZB._scr.modes;},go:function(){ZB.go('modes');}});
var RSID={show:'show',stol:'stol',kuh:'kuhnya',zabeg:'zabeg',igry:'igry','lv-int':'interes','lv-sur':'surprise'};
function rowHtml(r,i){var R=window.RSD;if(RSID[r.id]&&R&&R.on&&R.open&&!ZB.safe('rs-rsd',function(){return R.open(RSID[r.id]);}))return'';
var ks=r.ks?r.ks():null;
if(r.show&&!ZB.safe('rs-row:'+r.id,r.show))return'';if(ks&&!ks.length)return'';
var body='';
if(r.card){var c=card(r.card);if(c&&cardOn(r.card)){var h=ZB.safe('rs-ch:'+r.id,function(){return c.html();});if(h)body='<div class="rs-rc" data-rc="'+r.card+'">'+h+'</div>';}
if(!body)body='<small class="rs-rs">Сегодня здесь тихо — загляни завтра</small>';}
else if(ks)body='<div class="rs-rk">'+ks.map(function(k){return'<button type="button" class="btn ghost rs-k" data-rk="'+i+'" data-k="'+k[0]+'">'+k[1]+' '+esc(k[2])+'</button>';}).join('')+'</div>';
var sub=typeof r.sub==='function'?ZB.safe('rs-sub',r.sub):r.sub;
return'<div class="rs-row" data-ri="'+i+'"><div class="rs-rh"'+(r.go?' role="button" tabindex="0" data-rg="'+i+'"':'')+'><span class="rs-ri">'+r.ic+'</span><span class="rs-rt"><b>'+esc(r.t)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</span>'+(r.go?'<span class="rs-ra">›</span>':'')+'</div>'+body+'</div>';}
function gTile(i,big){var z=ZMG.Z(),best=z.b[i.num]|0;
return'<button type="button" class="'+(big?'rs-gl':'rs-gt')+'" data-g="'+i.id+'"><span class="rs-gi">'+i.ic+'</span><span class="rs-gn"><b>'+esc(i.t)+'</b>'+(big?'<small>'+esc(ZMG.whoName(i.who))+(best?' · рекорд '+best:'')+'</small>':'')+'</span></button>';}
function gamesRender(el,op){op=op||{};var M=window.ZMG;if(!M)return false;
var z=M.Z(),all=Object.keys(M.INFO).map(function(n){return M.INFO[n];}).filter(function(i){return!(M.isOff&&M.isOff(i.id));}),
op1=all.filter(function(i){return M.isOpen(i.id);}),lock=all.length-op1.length,day=M.dayId(),di=day?M.info(day):null;
op1.sort(function(a,b){var x=TOP6.indexOf(a.id),y=TOP6.indexOf(b.id);x=x<0?99:x;y=y<0?99:y;return x-y||((z.n[b.num]|0)-(z.n[a.num]|0));});
var cap=ZB.safe('rs-cap',function(){var R=window.RSD;if(!R||!R.on||!R.kind||R.kind()!=='n')return 0;var d=+R.day()||1;return d<15?3:3+(d-14);});
if(cap){var NB3=['zagadala','najdi','slova'];op1.sort(function(a,b){var x=NB3.indexOf(a.id),y=NB3.indexOf(b.id);return(x<0?9:x)-(y<0?9:y);});}
if(cap&&op1.length>cap){lock+=op1.length-cap;op1=op1.slice(0,cap);}
var more=!!op.more,h='';
if(!more){
h+=di?'<div class="rs-day'+(z.d.z?' done':'')+'"><span class="rs-dav">'+M.face(di.who,'happy')+'</span><span class="rs-dt"><small>ИГРА ДНЯ</small><b>'+di.ic+' '+esc(di.t)+'</b><span>'+
(z.d.z?'Сыграно сегодня — завтра новая.':esc((M.zateyaSay&&M.zateyaSay(day))||'Монеты и заметка в стенгазету.'))+'</span></span>'+
'<button type="button" class="btn '+(z.d.z?'ghost':'green')+' rs-dp" data-g="'+day+'" data-m="'+(z.d.z?'cab':'day')+'">'+(z.d.z?'Ещё раз':'▶ Играть')+'</button></div>'
:'<div class="rs-day done"><span class="rs-dt"><small>ИГРА ДНЯ</small><b>Игры откроются '+((+S.lv||0)>=5?'после следующей победы':'на 5-м уровне')+'</b><span>Первым придёт Валерка со своим диктантом.</span></span></div>';
if(op1.length)h+='<div class="rs-shelf">'+op1.slice(0,6).map(function(i){return gTile(i,false);}).join('')+'</div>';
if(op1.length>6)h+='<button type="button" class="btn blue rs-more" data-rs="more">Ещё игры ('+(op1.length-6)+')</button>';
if(lock>0&&op1.length<=6)h+='<p class="rs-lk">Ещё '+lock+' '+pl(lock,'игра откроется','игры откроются','игр откроются')+' — по одной в день</p>';
var rh=ROWS.map(rowHtml).join('');if(rh)h+='<div class="rs-rows">'+rh+'</div>';
var a=M.noteAt(z.np);h+='<button type="button" class="rs-line" data-rs="old"><span>📰</span><b>'+(a.done?'Стенгазета: все выпуски собраны':'Стенгазета «'+esc(a.t)+'» · '+(a.k-1)+' из '+M.PER_ISS)+'</b><i>›</i></button>';
}else{
h+='<div class="rs-list">'+op1.map(function(i){return gTile(i,true);}).join('')+'</div>';
if(lock>0)h+='<p class="rs-lk">Ещё '+lock+' '+pl(lock,'игра откроется','игры откроются','игр откроются')+' — по одной в день</p>';
}
el.innerHTML='<div class="rs-sec rs-games">'+hd(more?'Все игры':'🎲 Игры',more?'открытых: '+op1.length:'')+'<div class="scroll rs-sc">'+h+'</div></div>';
el.querySelector('[data-rs="back"]').onclick=function(){tap();if(more)ZB.go('mg',{});else home();};
var mb=el.querySelector('[data-rs="more"]');if(mb)mb.onclick=function(){tap();ev('more');ZB.go('mg',{more:1});};
var ob=el.querySelector('[data-rs="old"]');if(ob)ob.onclick=function(){tap();ZB.go('mg',{old:1});};
[].forEach.call(el.querySelectorAll('[data-g]'),function(b){b.onclick=function(){tap();var id=b.getAttribute('data-g'),m=b.getAttribute('data-m')||'cab';
M.ev({a:'show',id:id,m:m,l:+S.lv||0});M.open(id,{mode:m,back:function(){if(ZB.cur==='mg')ZB.go('mg',op);}});};});
[].forEach.call(el.querySelectorAll('[data-rg]'),function(b){b.onclick=function(){tap();var r=ROWS[+b.getAttribute('data-rg')];ev('row',{r:r.id});ZB.safe('rs-go:'+r.id,r.go);};});
[].forEach.call(el.querySelectorAll('[data-rk]'),function(b){b.onclick=function(){tap();var r=ROWS[+b.getAttribute('data-rk')],X=r.X&&r.X();ev('row',{r:r.id,k:b.getAttribute('data-k')});
if(X&&X.open)X.open(b.getAttribute('data-k'),{from:'rs'});};});
[].forEach.call(el.querySelectorAll('[data-rc]'),function(d){var c=card(d.getAttribute('data-rc'));if(c&&c.mount)ZB.safe('rs-cm',function(){c.mount(d);});});
return true;}
function hookGames(){var o=ZB._scr.mg;if(!o||o.rsW||!window.ZMG)return;var orig=o.render;o.rsW=1;o.title='Игры';
o.render=function(el,op){if(op&&op.old){orig.call(o,el,op);return;}if(!gamesRender(el,op))orig.call(o,el,op);};}
var TABS=[['cls','Классы'],['path','Путь'],['dict','Словарь']];
var SHK=[['ege','🎓','Экзамен месяца'],['dk','✍️','Диктант дома'],['otl','👩‍🏫','У доски'],['ant','📒','Тетрадь 1975 года'],['yat','🐈','Уровень с ятем']];
function tabsHtml(t){return'<div class="rs-tabs" role="tablist">'+TABS.map(function(x){return'<button type="button" role="tab" class="rs-tab'+(x[0]===t?' on':'')+'" data-tab="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>';}
function hookSchool(){var o=ZB._scr.school,p=ZB._scr.path;if(!o||o.rsW||!o.render)return;var orig=o.render;o.rsW=1;
o.render=function(el,op){op=op||{};var t=op.tab==='path'&&p&&p.render?'path':'cls';
el.innerHTML='<div class="rs-sec rs-school">'+tabsHtml(t)+'<div class="rs-tabc"></div></div>';var c=el.querySelector('.rs-tabc');
if(t==='path')p.render(c,{});else{orig.call(o,c,op);ZB.safe('rs-shk',function(){var Z=Z4(),X=Z&&Z.SHK,ks=kinds(X,SHK);if(!ks.length)return;
var sc=c.querySelector('.scroll')||c,d=document.createElement('div');d.className='rs-row rs-shk';
d.innerHTML='<div class="rs-rh"><span class="rs-ri">📝</span><span class="rs-rt"><b>Экзамены и диктанты</b></span></div><div class="rs-rk">'+ks.map(function(k){return'<button type="button" class="btn ghost rs-k" data-k="'+k[0]+'">'+k[1]+' '+esc(k[2])+'</button>';}).join('')+'</div>';
sc.insertBefore(d,sc.firstChild);[].forEach.call(d.querySelectorAll('[data-k]'),function(b){b.onclick=function(){tap();X.open(b.getAttribute('data-k'),{from:'rs'});};});});}
[].forEach.call(el.querySelectorAll('[data-tab]'),function(b){b.onclick=function(){var k=b.getAttribute('data-tab');if(k===t)return;tap();ev('tab',{t:k});
if(k==='dict'){OPEN.dict();return;}ZB.go('school',{tab:k});};});};
if(p&&!p.rsW&&p.render){p.rsW=1;var pr=p.render;p.render=function(el,op){if(el&&el.id==='zb-path'&&ZB._scr.school&&ZB._scr.school.rsW){el.innerHTML='';setTimeout(function(){ZB.go('school',{tab:'path'});},0);return;}pr.call(p,el,op);};}}
function news(w){if(w==='board'){if(ZB._scr.z3paper)ZB.go('z3paper',{});else yard('paper');return;}
if(window.ZBNUM&&ZBNUM.x)ZBNUM.x().then(function(){if(ZB._scr.vech)ZB.go('vech',{});},function(){});}
function gzBar(el,w){if(!el||el.querySelector('.rs-gz'))return;var d=document.createElement('div');d.className='rs-gz';
d.innerHTML='<b>Газета «Вечёрка»</b><span><button type="button" class="rs-tab'+(w==='num'?' on':'')+'" data-gz="num">Номер дня</button><button type="button" class="rs-tab'+(w==='board'?' on':'')+'" data-gz="board">Новости двора</button></span>';
el.insertBefore(d,el.firstChild);[].forEach.call(d.querySelectorAll('[data-gz]'),function(b){b.onclick=function(){var k=b.getAttribute('data-gz');if(k===w)return;tap();ev('gz',{w:k});news(k);};});}
function hookPaper(){[['vech','num'],['z3paper','board']].forEach(function(x){var o=ZB._scr[x[0]];if(!o||o.rsW||!o.render)return;o.rsW=1;var r=o.render;
o.render=function(el,op){r.call(o,el,op);if(op&&(op.arch||op.r||op.dn))return;var put=function(){if(ZB.cur===x[0])ZB.safe('rs-gz',function(){gzBar(el,x[1]);});};put();
[300,1200,3000,6000].forEach(function(t){setTimeout(put,t);});};});
if(!(window.ZBNUM&&ZBNUM.on)||!window.Z3PAPER)document.documentElement.classList.add('rs-gz1');}
function hookAll(){hookGames();hookSchool();hookPaper();}
hookAll();ZB.on('ready',hookAll);ZB.on('z3late',hookAll);
var go0=ZB.go;ZB.go=function(){ZB.safe('rs-hook',hookAll);return go0.apply(this,arguments);};
RS.sect={open:open,rows:ROWS,games:gamesRender,news:news,OPEN:OPEN,ALIAS:ALIAS};
ZB.load('js/rs-shop.js').catch(function(){});
})();
