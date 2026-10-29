'use strict';
(function(){
var Z4=window.Z4;if(!Z4||!Z4.on||Z4._roman||typeof S==='undefined')return;Z4._roman=1;
var ZB=window.ZB,ZB2=window.ZB2,E0=20260105,CAP=15,Q=location.search,DATA='js/zb4-roman-data.js',ART='js/zb4-art-roman.js';
function on(k){return Z4.on&&!ZB2.off('z4n')&&!ZB2.off('z4n.'+k);}
if(!on('sem')&&!on('gal')&&!on('call')&&!on('cur')&&!on('blog')&&!on('wed')&&!on('pet'))return;
function Z(){return S.z4n||(S.z4n={});}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function sv(){try{save();}catch(e){}}
function snd(){try{SND.tap();}catch(e){}}
function tst(t,ms){try{if(t&&typeof toast==='function')toast(t,ms||3600);}catch(e){}}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function h32(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
var TD=(/[?&]z4nd=(\d{8})/.exec(Q)||[])[1];
function tk(){return TD?+TD:Z3.tk();}
function dn(){return Z3.days(E0,tk());}
function keyOf(d){var x=new Date(Date.UTC(2026,0,5)+d*864e5);return x.getUTCFullYear()*1e4+(x.getUTCMonth()+1)*100+x.getUTCDate();}
function ser(){var d=dn(),wk=Math.floor(d/7),sw=((wk%8)+8)%8,c0=wk-sw;return{d:d,wk:wk,sw:sw,cyc:c0+1,s:sw<4?1:2,sd:d-(c0+(sw<4?0:4))*7};}
function T(k){return window.Z4T&&Z4T[k]||[];}
function pick(k,seed){var L=T(k);return L.length?L[h32(seed)%L.length]:'';}
function day(){var z=Z(),t=tk();if(z.d!==t){z.d=t;z.lt=0;z.gb=0;z.gx=0;}return z;}
function give(n){var z=Z(),t=tk(),r=0;if(z.cd!==t){z.cd=t;z.cc=0;}var k=Math.min(n,CAP-z.cc);if(k<=0)return 0;
try{var E=window.ZBECO;if(E&&typeof E.give==='function'){if(E.cap&&!('z4n'in E.cap))E.cap.z4n=CAP;r=E.give('z4n',k,'quest');}else if(typeof addCoins==='function'){addCoins(k,'quest');r=k;}}catch(e){}
z.cc+=r;sv();return r;}
function nu(n){var a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'уровень':a>=2&&a<=4&&(b<12||b>14)?'уровня':'уровней');}
function coin(){try{return COIN_I;}catch(e){return'💰';}}
var ld=null;function load(){if(!ld)ld=Promise.all([ZB.load(DATA),ZB.load(ART)]).then(function(){try{ZB.refresh();}catch(e){}});return ld;}
load().catch(function(){});
function zina(m){try{return zinaSVG(m||'happy');}catch(e){return'';}}
function cat(){try{return catSVG();}catch(e){return'🐈';}}
var FACE={'Валентина Петровна':0,'Галя':1,'Семён':2,'Тамара':3,'Люся':4,'Нина Аркадьевна':5};
function face(who){if(who==='Зина')return zina('happy');var i=FACE[who];if(i!=null&&typeof sosFace==='function')try{return sosFace(i);}catch(e){}return who==='Валерка'?'👦':'🙂';}
var NSEM=24;
function semN(){return T('z4n.sem').length||NSEM;}
function semFix(c){var z=Z();if(z.sc!==c.cyc){z.sc=c.cyc;z.sn=0;z.sd=0;}return z;}
function curToday(){var z=Z(),t=tk();if(!on('cur'))return 0;
if(z.pd!==t&&(/[?&]z4ncur=1/.test(Q)||h32('cur'+t)%3===0)&&!(z.ps===2&&Z3.days(z.pd,t)<=3)){z.pd=t;z.ps=1;z.pw='';}
return z.pd===t&&z.ps===1;}
function what(){var c=ser(),z=Z(),t=tk();
if(on('call')&&z.cw!==c.wk+1)return'call';
if(on('sem')&&c.sw>=4&&z.vc===c.cyc&&z.vo&&z.rs!==c.cyc)return'res';
if(on('wed')&&c.sw===7&&z.ww!==c.cyc)return'wed';
if(curToday())return'cur';
if(on('sem')&&c.sw===3&&semFix(c).sn>=3&&z.vc!==c.cyc)return'vote';
if(on('sem')&&c.sw<4){semFix(c);if(z.sd!==t&&z.sn<semN())return'note';}
if(on('blog')&&z.bd!==t)return'blog';
return'';}
var CARD={call:['','Баба Зина звонит!','Нарисованный телефон звенит на весь двор','Снять трубку'],
res:['🖍','Чем кончилось у Семёна','двор голосовал — читай','Читать'],
wed:['💍','Свадьба Ятя и Муси','скажи тост — и поправь ошибки гостей','На свадьбу'],
cur:['📦','Курьер перепутал посылку','у тебя коробка Валентины Петровны','Посмотреть'],
vote:['🗳','Что скажет дед Семён?','решает весь двор — твой голос','Голосовать'],
note:['🖍','Записка деда Семёна','Нине Аркадьевне — проверь ошибки','Проверить'],
blog:['📱','Блог бабы Зины','Валерка выложил пост — загляни','Смотреть']};
var shown={};
Z4.card.add({id:'z4n',order:20,show:function(){return!!what();},
html:function(){css();var k=what(),c=CARD[k];if(!c)return'';var ic=k==='call'?Z3.art('z4-phone')||'📞':c[0];
if(k==='note'){var z=Z();c=c.slice();c[2]='записка '+(z.sn+1)+' · '+c[2];}
return'<div class="z4n-cd z4n-k-'+k+'" data-k="'+k+'"><span class="z4n-ci">'+ic+'</span><span class="z4n-ct"><b>'+esc(c[1])+'</b><small>'+esc(c[2])+'</small></span>'+
'<button type="button" class="btn z4n-go">'+esc(c[3])+'</button></div>';},
mount:function(el){var d=el&&el.querySelector('.z4n-cd');if(!d)return;var k=d.getAttribute('data-k');
if(!shown[k]){shown[k]=1;Z4.ev('z4n',{a:'card',k:k});}
d.onclick=function(){snd();ZB.go('z4n',{v:k});};}});
function hdr(t){return'<div class="z4n-hd"><button type="button" class="btn ghost small z4n-back">‹ Двор</button><b>'+t+'</b></div>';}
function home(){try{if(typeof openMenu==='function')openMenu();else ZB.go('home');}catch(e){}}
function bindBack(el){[].forEach.call(el.querySelectorAll('.z4n-back,.z4n-home'),function(b){b.onclick=function(){snd();home();};});}
var V={};
ZB.screen('z4n',{title:'Сериал двора',render:function(el,op){css();op=op||{};var v=op.v||what()||'blog';
if(!T('z4n.sem').length){el.innerHTML='<div class="z4n-scr">'+hdr('…')+'<p class="z4n-wait">Люся несёт новости…</p></div>';bindBack(el);
load().then(function(){if(ZB.cur==='z4n')ZB.safe('z4n:'+v,function(){V[v](el,op);});},function(){tst('Не загрузилось — попробуй ещё раз');home();});return;}
if(V[v])V[v](el,op);else home();}});
function parse(a){var P=[],re=/\{([^|{}]+)\|([^|{}]+)\}/g,i=0,m;while((m=re.exec(a))){if(m.index>i)P.push({t:a.slice(i,m.index)});P.push({w:m[1],r:m[2]});i=re.lastIndex;}
if(i<a.length)P.push({t:a.slice(i)});return P;}
function penHtml(a){var n=0;return parse(a).map(function(p){if(p.t!=null)return p.t.split(/(\s+)/).map(function(w){return/\S/.test(w)?'<span class="z4n-w">'+esc(w)+'</span>':w;}).join('');
return'<span class="z4n-w z4n-e" data-i="'+(n++)+'" data-r="'+esc(p.r)+'">'+esc(p.w)+'</span>';}).join('');}
function pen(box,done){var E=box.querySelectorAll('.z4n-e'),left=E.length,msg=box.parentNode.parentNode.querySelector('.z4n-pm');
[].forEach.call(box.querySelectorAll('.z4n-w'),function(w){w.onclick=function(ev){ev.stopPropagation();
if(!w.classList.contains('z4n-e')){if(msg&&!w.classList.contains('z4n-ok'))msg.textContent='Тут всё верно. Ищи дальше.';return;}
if(w.classList.contains('z4n-ok'))return;snd();w.classList.add('z4n-ok');w.innerHTML='<s>'+esc(w.textContent)+'</s> <b>'+esc(w.getAttribute('data-r'))+'</b>';left--;
if(msg)msg.textContent=left?'Ещё '+left+' '+(left===1?'ошибка':left<5?'ошибки':'ошибок')+'.':'';if(!left)done();};});
return left;}
V.note=function(el){var c=ser(),z=semFix(c),t=tk(),i=Math.min(z.sn,semN()-1),L=T('z4n.sem'),s=L[i]||'',p=s.split(' || '),done=z.sd===t||z.sn>=semN();
var h=hdr('🖍 Записка деда Семёна')+'<div class="z4n-body"><p class="z4n-sm">Семён пишет Нине Аркадьевне из хора. Перед тем как отдать — несёт Зине на проверку. Записка '+(i+1)+' из '+semN()+'.</p>';
if(done)h+='<div class="z4n-note"><p>Сегодня Семён уже отдал записку. Завтра принесёт новую — он пишет по одной, медленно и с чувством.</p></div><button type="button" class="btn z4n-home">Во двор</button>';
else h+='<div class="z4n-note"><div class="z4n-pen">'+penHtml(p[0])+'</div></div><p class="z4n-pm z4n-sm">Нажми на слово с ошибкой — красная ручка поправит.</p><div class="z4n-rep"></div>';
el.innerHTML='<div class="z4n-scr">'+h+'</div></div>';bindBack(el);if(done)return;
pen(el.querySelector('.z4n-pen'),function(){var zz=semFix(ser());if(zz.sd===t)return;zz.sn++;zz.sd=t;var g=give(5);sv();Z4.ev('z4n',{a:'note',n:zz.sn});
var r=el.querySelector('.z4n-rep');if(r)r.innerHTML='<div class="z4n-say"><span class="z4n-av">'+zina('happy')+'</span><p>'+esc(p[1]||'Зина: Отдавай. Теперь не стыдно.')+'</p></div>'+
(g?'<p class="z4n-sm">+'+g+' '+coin()+' за проверку</p>':'')+'<button type="button" class="btn z4n-home">Во двор</button>';bindBack(el);});};
function semF(c){return'v4n-sem-'+c;}
V.vote=function(el){var c=ser(),z=Z(),q=T('z4n.semq')[0]||'',O=T('z4n.semo');
var h=hdr('🗳 Что скажет дед Семён?')+'<div class="z4n-body"><p>'+esc(q)+'</p><div class="z4n-vo">'+O.map(function(o,i){return'<button type="button" class="z4n-vb'+(z.vc===c.cyc&&z.vo===i+1?' on':'')+'" data-o="'+i+'">'+esc(o)+'</button>';}).join('')+
'</div><p class="z4n-sm">Голосует весь двор до воскресенья. Чем кончилось — в понедельник, в сериале «Из жизни двора».</p><div class="z4n-rep"></div></div>';
el.innerHTML='<div class="z4n-scr">'+h+'</div>';bindBack(el);
[].forEach.call(el.querySelectorAll('.z4n-vb'),function(b){b.onclick=function(){snd();var o=+b.getAttribute('data-o'),zz=Z();zz.vc=c.cyc;zz.vo=o+1;sv();
Z4.srv.send('v4v',{f:semF(c.cyc),o:o});Z4.ev('z4n',{a:'vote',o:o});
[].forEach.call(el.querySelectorAll('.z4n-vb'),function(x){x.classList.toggle('on',x===b);});
var r=el.querySelector('.z4n-rep');if(r)r.innerHTML='<p>Голос принят. Семён гладит пиджак.</p><button type="button" class="btn z4n-home">Во двор</button>';bindBack(el);};});};
function semRes(c,cb){var z=Z(),mine=z.vc===c.cyc&&z.vo?z.vo-1:-1;
Z4.srv.get('vote',{f:semF(c.cyc)}).then(function(v){var n=v&&!v._sim&&v.n||[],a=+n[0]||0,b=+n[1]||0;cb(a+b?(b>a?1:0):mine,!!(a+b));},function(){cb(mine,false);});}
V.res=function(el){var c=ser(),z=Z();el.innerHTML='<div class="z4n-scr">'+hdr('🖍 Чем кончилось у Семёна')+'<div class="z4n-body"><div class="z4n-rep">…</div></div></div>';bindBack(el);
semRes(c,function(w,real){var r=el.querySelector('.z4n-rep');if(!r)return;var O=T('z4n.semo'),t=w<0?'':pick(w?'z4n.semrB':'z4n.semrA',c.cyc);
r.innerHTML=(w<0?'<p>Двор ещё спорит.</p>':'<p class="z4n-sm">'+(real?'Двор решил':'Двор решил — твой голос был решающим')+': '+esc(O[w]||'')+'</p><div class="z4n-say"><span class="z4n-av">'+zina('wow')+'</span><p>'+esc(t)+'</p></div>')+
'<button type="button" class="btn z4n-home">Во двор</button>';bindBack(el);
var zz=Z();if(zz.rs!==c.cyc){zz.rs=c.cyc;sv();Z4.ev('z4n',{a:'res',w:w,real:real?1:0});}});};
V.call=function(el){var c=ser(),L=T('z4n.call'),s=L[h32('call'+c.wk)%Math.max(1,L.length)]||'',lines=s.split(' / ');
el.innerHTML='<div class="z4n-scr">'+hdr('📞 Баба Зина звонит')+'<div class="z4n-body z4n-callb"><div class="z4n-ring"><span class="z4n-ph">'+Z3.art('z4-phone')+'</span><span class="z4n-zav">'+zina('happy')+'</span></div>'+
'<p class="z4n-sm">Старый телефон Зины в прихожей. Звонит тебе.</p><button type="button" class="btn z4n-up">Снять трубку</button><div class="z4n-dlg"></div></div></div>';bindBack(el);
el.querySelector('.z4n-up').onclick=function(){snd();this.style.display='none';var z=Z();if(z.cw!==c.wk+1){z.cw=c.wk+1;sv();Z4.ev('z4n',{a:'call'});}
var d=el.querySelector('.z4n-dlg'),i=0;function nx(){if(i>=lines.length){d.insertAdjacentHTML('beforeend','<button type="button" class="btn z4n-home">Положить трубку</button>');bindBack(el);return;}
var m=/^([А-ЯЁ][а-яё]+):\s(.*)$/.exec(lines[i]);d.insertAdjacentHTML('beforeend','<p class="z4n-ln">'+(m?'<b>'+esc(m[1])+':</b> '+esc(m[2]):esc(lines[i]))+'</p>');i++;setTimeout(nx,calm()?0:1100);}nx();};};
V.cur=function(el){var z=Z(),t=tk(),st=z.pd===t?z.ps:0;
var h=hdr('📦 Посылка не тебе')+'<div class="z4n-body"><div class="z4n-box">📦</div>';
if(st===1)h+='<p>'+esc(pick('z4n.curi',t))+'</p><div class="z4n-vo"><button type="button" class="z4n-vb z4n-carry">Отнести Валентине Петровне</button><button type="button" class="z4n-vb z4n-open">Одним глазком открыть</button></div>'+
'<p class="z4n-sm">Отнести — значит найти её слово в следующем уровне. Любой выбор — без штрафа.</p>';
else h+='<p>'+(st===2?'Посылка у тебя под мышкой. Её слово — в ближайшем уровне.':'С посылкой разобрались. Курьер обещал больше не путать. Врёт.')+'</p><button type="button" class="btn z4n-home">Во двор</button>';
el.innerHTML='<div class="z4n-scr">'+h+'</div></div>';bindBack(el);if(st!==1)return;
el.querySelector('.z4n-carry').onclick=function(){snd();var zz=Z();zz.ps=2;zz.pw='';sv();Z4.ev('z4n',{a:'cur',c:'carry'});tst('Несёшь посылку. Слово Валентины Петровны будет в уровне — найди его!',4200);home();};
el.querySelector('.z4n-open').onclick=function(){snd();var zz=Z();zz.ps=4;var g=give(5);sv();Z4.ev('z4n',{a:'cur',c:'open'});
el.querySelector('.z4n-body').innerHTML='<div class="z4n-box">📦</div><p>'+esc(pick('z4n.curg',t+'g'))+'</p><div class="z4n-say"><span class="z4n-av">'+zina('stern')+'</span><p>Зина: Заклеим скотчем. Скажем — курьер такой.</p></div>'+
(g?'<p class="z4n-sm">+'+g+' '+coin()+' — Люся дала за молчание</p>':'')+'<button type="button" class="btn z4n-home">Во двор</button>';bindBack(el);};};
V.blog=function(el){var c=ser(),z=Z(),t=tk(),L=T('z4n.blog'),s=L[((c.d%L.length)+L.length)%L.length]||'',p=s.split(' || '),C=(p[2]||'').split(' | ');
if(z.bd!==t){z.bd=t;sv();Z4.ev('z4n',{a:'blog'});}
var lk=z.bl===t,h=hdr('📱 Блог бабы Зины')+'<div class="z4n-body"><p class="z4n-sm">Ведёт Валерка. Зина не знает, что такое «блог», но подписчиков считает.</p>'+
'<div class="z4n-post"><div class="z4n-pic"><span class="z4n-pz">'+zina('wow')+'</span><span class="z4n-pe">'+esc(p[0]||'')+'</span></div><h4>'+esc(p[1]||'')+'</h4>'+
C.map(function(x){var m=/^([^:]{2,20}):\s(.*)$/.exec(x);return'<div class="z4n-cm"><span class="z4n-cf">'+(m?face(m[1]):'')+'</span><p>'+(m?'<b>'+esc(m[1])+'</b> ':'')+esc(m?m[2]:x)+'</p></div>';}).join('')+
'<div class="z4n-like"><button type="button" class="btn ghost small z4n-lb"'+(lk?' disabled':'')+'>'+(lk?'❤ Нравится':'♡ Нравится')+'</button><span class="z4n-sm z4n-sub">'+subs()+'</span></div></div>'+
'<button type="button" class="btn z4n-home">Во двор</button></div>';
el.innerHTML='<div class="z4n-scr">'+h+'</div>';bindBack(el);
el.querySelector('.z4n-lb').onclick=function(){var zz=Z();if(zz.bl===t)return;snd();zz.bl=t;zz.bn++;sv();Z4.ev('z4n',{a:'like',n:zz.bn});this.textContent='❤ Нравится';this.disabled=true;
el.querySelector('.z4n-sub').textContent=subs();};};
function subs(){var n=Z().bn||0;return'Подписчики: 6 соседок'+(n?' и ты — лайков '+n:'')+'. Зина пересчитывает каждый вечер.';}
function wedKey(c){return'z4nwed-'+keyOf((c-1)*7+49);}
function gifts(c){var z=Z();return z.gw===c&&z.wg?z.wg.split(','):[];}
V.wed=function(el){var c=ser(),z=Z(),done=z.ww===c.cyc,L=T('z4n.wedt').slice(),i=0,fixed=0,sec=isOK()?32:24,tm=0;
var h=hdr('💍 Свадьба Ятя и Муси')+'<div class="z4n-body"><div class="z4n-wpic"><span>'+cat()+'</span><span>'+Z3.art('z4-musya')+'</span></div><div class="z4n-wb"></div></div>';
el.innerHTML='<div class="z4n-scr">'+h+'</div>';bindBack(el);var B=el.querySelector('.z4n-wb');
function fin(){clearTimeout(tm);var zz=Z(),g=0;if(zz.ww!==c.cyc){zz.ww=c.cyc;g=give(15);sv();Z4.ev('z4n',{a:'wed',f:fixed,of:L.length});}
var G=gifts(c.cyc);B.innerHTML='<div class="z4n-say"><span class="z4n-av">'+zina('happy')+'</span><p>'+esc(pick('z4n.wedf',c.cyc))+'</p></div>'+
'<h4>Слова-подарки от дома</h4><p class="z4n-gf">'+(G.length?G.map(function(w){return'<span>'+esc(w)+'</span>';}).join(''):'Твои подарки — слова из уровней недели свадьбы. Их можно дарить и после.')+'</p><p class="z4n-sm z4n-hs"></p>'+
(g?'<p class="z4n-sm">+'+g+' '+coin()+' — с праздничного стола</p>':'')+'<button type="button" class="btn z4n-home">Во двор</button>';bindBack(el);
Z4.srv.get('ev',{e:wedKey(c.cyc)}).then(function(x){var b=el.querySelector('.z4n-hs');if(b&&x&&!x._sim&&+x.p>1)b.textContent='Весь дом подарил '+(+x.n||0)+' слов.';},function(){});}
if(done){fin();return;}
function next(){clearTimeout(tm);if(i>=L.length){fin();return;}var s=L[i++];
B.innerHTML='<p class="z4n-sm">Тост '+i+' из '+L.length+'. Поправь ошибки, пока гость говорит.</p><div class="z4n-tbar"><i></i></div><div class="z4n-note"><div class="z4n-pen">'+penHtml(s)+'</div></div><p class="z4n-pm z4n-sm"></p>';
var bar=B.querySelector('.z4n-tbar i');setTimeout(function(){bar.style.transition='width '+sec+'s linear';bar.style.width='0%';},30);
pen(B.querySelector('.z4n-pen'),function(){fixed++;clearTimeout(tm);var m=B.querySelector('.z4n-pm');if(m)m.textContent='Горько! Все ошибки поправлены.';tm=setTimeout(next,1300);});
tm=setTimeout(function(){var m=B.querySelector('.z4n-pm');if(m)m.textContent=pick('z4n.wedto',i);[].forEach.call(B.querySelectorAll('.z4n-w'),function(w){w.onclick=null;});tm=setTimeout(next,2600);},sec*1000);}
B.innerHTML='<div class="z4n-say"><span class="z4n-av">'+zina('wow')+'</span><p>Зина: Гости будут говорить тосты. С ошибками — я их знаю. Ты правь, я буду улыбаться.</p></div><button type="button" class="btn z4n-st">Начали!</button>';
B.querySelector('.z4n-st').onclick=function(){snd();next();};
var obs=setInterval(function(){if(ZB.cur!=='z4n'||!document.body.contains(B)){clearTimeout(tm);clearInterval(obs);}},1000);};
Z4.onWin(function(o){var z=day();z.lt++;var c=ser();
if(on('wed')&&(c.sw===6||c.sw===7)&&o&&o.G&&o.G.words){if(z.gw!==c.cyc){z.gw=c.cyc;z.wg='';}var G=gifts(c.cyc),b='';
o.G.words.forEach(function(w){var s=String(w.w||'');if(s.length>b.length&&G.indexOf(s)<0)b=s;});
if(b&&G.length<10){G.push(b);z.wg=G.join(',');Z4.srv.send('ev',{e:wedKey(c.cyc),n:1});}}});
function lvlOk(i){return i&&!i.daily&&!i.mode&&i.G&&i.G.words&&i.G.words.length;}
Z4.onStart(function(i){var z=Z(),t=tk();if(!on('cur')||z.ps!==2)return;if(Z3.days(z.pd,t)>3){z.ps=0;z.pw='';return;}if(!lvlOk(i))return;
var L=i.G.words.filter(function(w){return!w.found&&String(w.w||'').length>=3;});if(!L.length)return;var w=String(L[Math.floor(Math.random()*L.length)].w);z.pw=w;
setTimeout(function(){tst('📦 Посылка Валентины Петровны: её слово на «'+w.charAt(0).toUpperCase()+'», '+w.length+' '+(w.length<5?'буквы':'букв')+'. Найдёшь — отнесёшь.',4200);},calm()?400:1600);});
Z4.onWord(function(o){var z=Z();if(z.ps!==2||!z.pw||o.w!==z.pw)return;z.ps=3;var g=give(5);sv();Z4.ev('z4n',{a:'cur',c:'done'});
setTimeout(function(){tst('📦 '+(pick('z4n.curd',tk())||'Посылка отнесена!')+(g?' +'+g+' '+coin():''),4200);},700);});
Z4.winLine.add({id:'z4n.gal',order:40,txt:function(){if(!on('gal'))return'';var z=day(),t=tk();if(z.lt<1)return'';
if(!z.gb){var s=pick('z4n.gal',t);if(!s)return'';z.gb=z.lt+1+(h32('g'+t)%2);sv();Z4.ev('z4n',{a:'gal',x:0,n:z.gb});return s.replace('{nu}',nu(z.gb));}
if(z.lt>z.gb&&!z.gx){var x=pick('z4n.galx',t);if(!x)return'';z.gx=1;sv();Z4.ev('z4n',{a:'gal',x:1});return x;}return'';}});
Z4.winLine.add({id:'z4n.pet',order:60,txt:function(){if(!on('pet'))return'';var z=day(),t=tk();if(z.pt===t||z.lt<2||h32('pet'+t)%3)return'';
var s=pick('z4n.pet',t);if(!s)return'';z.pt=t;sv();Z4.ev('z4n',{a:'pet'});return s;}});
function serBlk(el,op){if(!op||op.pg!=='se'||(op.dn!=null&&op.dn!==dn()))return;var sh=el.querySelector('.z3p-sheet');if(!sh||sh.querySelector('.z4n-ser'))return;
if(!T('z4n.sem').length){load().then(function(){if(ZB.cur==='z3paper')serBlk(el,op);},function(){});return;}
css();var c=ser(),z=Z(),t=tk(),h='',b='';
if(c.s===1&&on('sem')){semFix(c);h='<h4>🖍 Тем временем: дед Семён</h4><p>Семён пишет записки Нине Аркадьевне из хора. Зина проверяет — Семён пишет с чувством, но не всегда правильно. Проверено записок: '+z.sn+'.</p>';
if(c.sw===3&&z.sn>=3&&z.vc!==c.cyc)b='<button type="button" class="btn z4n-sg" data-v="vote">Что скажет Семён? Голосуй</button>';
else if(z.sd!==t&&z.sn<semN())b='<button type="button" class="btn z4n-sg" data-v="note">Проверить записку</button>';}
else if(c.s===2){if(on('sem')&&c.sw===4&&z.vc===c.cyc&&z.vo)h='<h4>🖍 Чем кончилось у Семёна</h4><p class="z4n-sr">…</p>';
if(on('wed')){h+='<h4>💍 Тем временем: Ять</h4><p>'+esc(T('z4n.yat')[Math.min(c.sd,27)%Math.max(1,T('z4n.yat').length)]||'')+'</p>';
if(c.sw===7&&z.ww!==c.cyc)b='<button type="button" class="btn z4n-sg" data-v="wed">На свадьбу Ятя</button>';
else if(c.sw===6)h+='<p class="z4n-sm">Свадьба — на следующей неделе. Слова из уровней этой недели идут молодым в подарок.</p>';}}
if(!h)return;sh.insertAdjacentHTML('beforeend','<div class="z3p-blk z4n-ser">'+h+b+'</div>');
var g=sh.querySelector('.z4n-sg');if(g)g.onclick=function(){snd();ZB.go('z4n',{v:g.getAttribute('data-v')});};
var r=sh.querySelector('.z4n-sr');if(r)semRes(c,function(w){r.textContent=w<0?'Двор ещё спорит.':pick(w?'z4n.semrB':'z4n.semrA',c.cyc);});
Z4.ev('z4n',{a:'ser',s:c.s});}
function hookPaper(){var P=window.Z3PAPER,sc=ZB._scr&&ZB._scr.z3paper;
if(P&&typeof P.render==='function'&&!P.render.__z4n){var r0=P.render,w=function(el,op){var r=r0.apply(this,arguments);ZB.safe('z4n:ser',function(){serBlk(el,op);});return r;};for(var k in r0)w[k]=r0[k];w.__z4n=1;P.render=w;}
if(sc&&typeof sc.render==='function'&&!sc.render.__z4n){var s0=sc.render;sc.render=function(){hookPaper();return s0.apply(this,arguments);};sc.render.__z4n=1;}}
if(on('sem')||on('wed')){hookPaper();ZB.on('z3late',hookPaper);}
var c0=0;function css(){if(c0)return;c0=1;var s=document.createElement('style');s.setAttribute('data-z4n','1');s.textContent=
'.z4n-cd{display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;background:var(--z3-card,#fff);border-radius:var(--z3-rb,16px);box-shadow:var(--z3-shadow);color:var(--z3-ink,#27324a);cursor:pointer}'+
'.z4n-ci{flex:0 0 46px;width:46px;height:46px;display:flex;align-items:center;justify-content:center;font-size:30px}.z4n-ci svg{width:46px;height:40px}'+
'.z4n-ct{flex:1 1 auto;min-width:0;display:flex;flex-direction:column}.z4n-ct b{font-size:16px}.z4n-ct small{font-size:14px;color:var(--z3-ink2,#5d6781)}'+
'.z4n-go{flex:0 0 auto;min-height:44px;padding:0 14px;font-size:15px}'+
'.z4n-scr{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--z3-bg,#f6efe3);color:var(--z3-ink,#27324a);font-family:var(--z3-font)}'+
'.z4n-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--z3-paper,#fbf7ec);border-bottom:2px solid var(--z3-line,#e6dcc8)}.z4n-hd b{font-size:18px}.z4n-back{min-height:44px;white-space:nowrap}'+
'.z4n-body{flex:1 1 auto;overflow-y:auto;padding:12px 16px 24px;max-width:620px;width:100%;margin:0 auto;box-sizing:border-box;font-size:16px;line-height:1.45}'+
'.z4n-body .btn{min-height:46px;margin:12px auto 0;display:block}.z4n-wait{padding:40px 16px;text-align:center}'+
'.z4n-sm{font-size:14px;color:var(--z3-ink2,#5d6781)}'+
'.z4n-note{background:var(--z3-paper,#fbf7ec);border:1px solid var(--z3-line,#e6dcc8);border-radius:6px;padding:14px;box-shadow:var(--z3-shadow);font-family:var(--z3-font-hand);font-size:22px;line-height:1.6;transform:rotate(-.6deg)}'+
'.z4n-w{cursor:pointer;border-radius:4px;padding:0 1px}.z4n-ok s{color:var(--z3-ink2,#5d6781)}.z4n-ok b{color:var(--z3-red,#d0342c);font-weight:700}'+
'.z4n-say{display:flex;gap:10px;align-items:flex-start;margin:12px 0}.z4n-av{flex:0 0 64px;width:64px;height:64px}.z4n-av svg{width:64px;height:64px}.z4n-say p{margin:0;background:var(--z3-card,#fff);border-radius:12px;padding:10px 12px;box-shadow:var(--z3-shadow)}'+
'.z4n-vo{display:flex;flex-direction:column;gap:8px;margin:10px 0}.z4n-vb{min-height:48px;font-size:16px;border-radius:12px;border:2px solid var(--z3-line,#e6dcc8);background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);padding:8px 12px;text-align:left;font-family:inherit}'+
'.z4n-vb.on{border-color:var(--z3-acc,#c2410c);font-weight:700}'+
'.z4n-callb{text-align:center}.z4n-ring{display:flex;justify-content:center;align-items:flex-end;gap:8px}.z4n-ph svg{width:140px;height:116px}.z4n-zav svg{width:96px;height:96px}'+
'.z4n-dlg{text-align:left;margin-top:8px}.z4n-ln{background:var(--z3-card,#fff);border-radius:12px;padding:10px 12px;margin:8px 0;box-shadow:var(--z3-shadow)}'+
'.z4n-box{font-size:56px;text-align:center}'+
'.z4n-post{background:var(--z3-card,#fff);border-radius:var(--z3-rb,16px);box-shadow:var(--z3-shadow);padding:12px}.z4n-post h4{margin:8px 0;font-size:18px}'+
'.z4n-pic{position:relative;height:150px;background:var(--z3-sky,#cfe9f4);border-radius:10px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}.z4n-pz svg{width:130px;height:130px}.z4n-pe{position:absolute;right:16px;top:12px;font-size:52px}'+
'.z4n-cm{display:flex;gap:8px;align-items:flex-start;margin:8px 0}.z4n-cf{flex:0 0 36px;width:36px;height:36px;font-size:26px;text-align:center}.z4n-cf svg{width:36px;height:36px;display:block}.z4n-cm p{margin:0;font-size:15px}'+
'.z4n-like{display:flex;align-items:center;gap:10px;margin-top:8px}.z4n-like .btn{margin:0;min-height:44px}'+
'.z4n-wpic{display:flex;justify-content:center;gap:6px;background:var(--z3-paper,#fbf7ec);border-radius:12px;padding:6px}.z4n-wpic svg{width:110px;height:110px}'+
'.z4n-tbar{height:10px;background:var(--z3-line,#e6dcc8);border-radius:5px;overflow:hidden;margin:6px 0 10px}.z4n-tbar i{display:block;height:100%;width:100%;background:var(--z3-gold,#f5b72d)}'+
'.z4n-gf span{display:inline-block;margin:3px;padding:4px 10px;border-radius:10px;background:var(--z3-paper,#fbf7ec);border:1px solid var(--z3-line,#e6dcc8);font-weight:700;text-transform:uppercase}'+
'.z4n-ser .btn{min-height:44px;margin-top:8px}';
document.head.appendChild(s);}
try{ZB.refresh();}catch(e){}
})();
