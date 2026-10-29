(function(){'use strict';
var W=window,D=document;
if(!W.V3UX||!W.V3UXL||!W.UI||!W.VY)return;
var X=V3UXL,UX=V3UX,on=UX.on;
function L(a,b){return VY.L(a,b);}
function ok(f,d){try{return f();}catch(e){return d;}}
function esc(s){return UI.esc(s);}
function $(id){return D.getElementById(id);}
function u(){return UX.u();}
function S_(){return VY.S||{};}
function tst(t){VY.toast(t,W.VYSAY?VYSAY.ms(t):4500);}
function dk(){return UX.dk();}
function hour(){return ok(function(){return new Date(nowMs()).getHours();},new Date().getHours());}
function en(){return ok(function(){return LANG==='en';},false);}
function isOK(){return ok(function(){return!!OK;},false);}
function T(){return W.V3T&&V3T.on&&V3T.on()?V3T:null;}
function bank(){var t=T();return t&&t.isReady&&t.isReady()&&t.ux?t.ux:null;}
function pick(a){return a&&a.length?a[Math.floor(Math.random()*a.length)]:null;}
function two(p){if(!p)return'';if(typeof p==='string')return en()?'':p;return en()?(p[1]||''):p[0];}
function line(path){var t=T();if(!t)return null;var r=ok(function(){return t.line(path);},null);return r&&typeof r.t==='string'?r:null;}
function jk(id,w){var t=T();return t&&id?t.jk(id,w):'';}
function ev(k,o){o=o||{};o.k=k;ok(function(){V3.ev('ux',o);});}
function say(t,who){ok(function(){if(W.V3SKIN&&V3SKIN.say)V3SKIN.say(t,who||'shura');else tst(t);});voice(t);}
function shuraH(t){return ok(function(){return shura(t);},'<p>'+esc(t)+'</p>');}
function modal(h){VY.modal('<div class="v3ux">'+h+'</div>');UI.bind($('mcard'));}
function closeBtn(){return'<div class="row"><button class="btn green noenter" id="v3uX">'+L('Хорошо','OK')+'</button></div>';}
function wireClose(){var b=$('v3uX');if(b)b.onclick=function(){VY.hide();};}
function stars(){var s=S_().stars||{},n=0;for(var k in s)n+=+s[k]||0;return n;}
function fillT(t,c){var x=T();return x?x.fill(t,c||{}):t;}
css();
if(on('week')&&UI.objs&&!UI.objs.__v3u){var o0=UI.objs;UI.objs=function(arr,ctx,zone,def){var r=o0.apply(this,arguments);
if(zone!=='thing'||arr!==W.homeSlots)return r;var out=[];for(var i=0;i<r.length;i++){var x=r[i];if(x&&x.at&&!UX.gate(x.at))continue;out.push(x);}return out;};UI.objs.__v3u=1;}
function stageCheck(){if(!on('stage'))return;var s=UX.stage(),m=u();if(s.k<=m.st&&m.st)return;var was=m.st;m.st=s.k;UX.note('st',s.name);
if(s.k===0&&!was&&V3.day()<=1){UX.sv();return;}
var t=T(),up=ok(function(){var a=t.stageOf(s.k).up;return pick(a);},null),th=s.thing;
setTimeout(function(){if(up)say(fillT(up));if(th)ok(function(){tst('🎁 '+(en()?s.name:th[0]));});},1500);
V3.emit('ux:stage',s.k);ev('stage',{s:s.k,d:s.days});UX.sv();}
V3.sub('boot',function(){T()&&T().ready(stageCheck);},'ux.stage');V3.sub('day',function(){T()&&T().ready(stageCheck);},'ux.stage');
function nbText(e){var b=bank(),tp=b&&b.nb?b.nb[e[1]]:null,d=new Date(e[0]*864e5),ds=('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2);
var x=e[2]||'';if(e[1]==='ct')x=ctName(x);
if(!tp||en())return ds+' · '+e[1]+(x?' · '+x:'');return tp.replace('{date}',ds).replace('{x}',x);}
function ctName(id){var a=ok(function(){return W.V3T?V3T.all('car_type'):[];},[])||[];for(var i=0;i<a.length;i++)if(a[i]&&a[i].id===id){var m=/«([^»]+)»/.exec(a[i].t||'');return m?m[1]:String(a[i].t||id);}return id;}
function openBook(){var m=u(),s=UX.stage(),h='<h2>📒 '+L('Тетрадка бабы Шуры','Granny Shura’s notebook')+'</h2>';
h+=shuraH(L('Тут всё про тебя. Карандашом — что может поменяться, ручкой — что навсегда.','It’s all about you here. Pencil — what may change, pen — forever.'));
h+='<div class="v3uBk"><p><b>'+esc(s.name)+'</b> · '+L('дней во дворе: ','days in the yard: ')+s.days+(s.next?' · '+L('до следующей ступени: ','to next rank: ')+s.next:'')+'</p>';
h+='<p>'+(UX.hold()?L('🪑 Сегодня Шура держит тебе место у подъезда (одна машина).','🪑 Today Shura holds a spot for you by the entrance (one car).'):L('🪑 Место у подъезда сегодня уже занято тобой.','🪑 You already used today’s held spot.'))+'</p>';
var bits=[];if(m.qn)bits.push('🤫 '+L('звёзд тишины: ','stars of silence: ')+m.qn);if(m.nt)bits.push('📝 '+L('записок: ','notes: ')+m.nt);if(m.fk)bits.push('🔧 '+L('Франкенштейнов: ','Frankensteins: ')+m.fk);
if(m.bn)bits.push('🐈 '+L('Барсик найден: ','Barsik found: ')+m.bn);if(bits.length)h+='<p>'+bits.join(' · ')+'</p>';
var rk=ok(function(){return W.CAR&&CAR.rank?CAR.rank():null;},null);if(rk&&rk.name)h+='<p>🚗 '+L('Звание водителя: ','Driver rank: ')+'<b>'+esc(rk.name)+'</b>'+(rk.lists?' · 📄 '+rk.lists:'')+'</p>';
var nb=(m.nb||[]).slice().reverse();if(nb.length){h+='<ul>';for(var i=0;i<nb.length&&i<12;i++)h+='<li>'+esc(nbText(nb[i]))+'</li>';h+='</ul>';}
else h+='<p><i>'+L('Пока чисто. Это ненадолго.','Clean so far. Not for long.')+'</i></p>';
h+='</div>'+closeBtn();modal(h);wireClose();ev('book',{n:nb.length});}
UX.openBook=openBook;
homeSlots.push({id:'v3u-book',zone:'feed',order:45,render:function(){if(!on('stage')||!isOK())return null;
return UI.tile({ic:'📒',t:L('Тетрадка Шуры','Shura’s notebook'),s:UX.stage().name,go:''});},mount:function(el){var b=el.querySelector('button');if(b)b.onclick=openBook;}});
function okOffer(){if(!on('stage')||!W.SOC||!SOC.offer||SOC.offer.__v3u)return;var f=SOC.offer;SOC.offer=function(){var o=f.apply(this,arguments);if(o&&isOK()&&o.k!=='ntf')return null;return o;};SOC.offer.__v3u=1;}
V3.sub('boot',okOffer,'ux.stage');
var MOODL={morning:['Утро у подъезда','Morning'],day:['Лавочка','Bench'],tea:['Обед — чай','Lunch — tea'],quiet:['Тихий час','Quiet hour'],paper:['Вечер — газета','Evening paper'],night:['Ночь — Барсик','Night — Barsik']};
function moodLine(){var b=bank(),m=X.benchMood(hour());return b?two(pick(b[m]))||'':'';}
function benchDue(){var m=u();return X.sceneDue(m.sc)||(m.rm<m.cr&&m.cr>0);}
W.homeSlots.push({id:'th-bench',zone:'thing',order:20,render:function(){if(!on('bench'))return null;var m=X.benchMood(hour());
return{at:'bench',t:L(MOODL[m][0],MOODL[m][1]),badge:benchDue()?'💬':'',go:openBench};}});
function openBench(){var t=T();if(t&&!t.isReady()){t.ready(openBench);return;}var m=u(),h='<h2>🪑 '+L('На лавочке','On the bench')+'</h2>',ml=moodLine(),ids=[];
if(ml)h+=shuraH(ml);
if(X.sceneDue(m.sc)&&t){var sc=ok(function(){return t.sceneNext();},null);if(sc){m.sc=0;h+='<div class="v3uSc"><b>'+esc(sc.t||'')+'</b>';
for(var i=0;i<sc.l.length;i++){var w=sc.l[i];h+='<p><i>'+esc(whoName(w[0]))+':</i> '+esc(w[1])+'</p>';}h+=jk(sc.id,'scene')+'</div>';ids.push('sc');}}
if(m.cr>m.rm&&t){var ep=ok(function(){return t.romanEp(m.rm+1);},'');if(ep){m.rm++;h+='<div class="v3uRm"><b>💘 '+L('Роман на парковке, серия ','Parking romance, ep. ')+m.rm+'</b><p>'+esc(ep)+'</p></div>';ids.push('rm');}}
var b=bank();if(b&&X.guestDue(m.gn,Math.random())){var g=en()?pick(b.guestEn):pick(b.guest);if(g){m.gn=0;m.gd=dk();h+='<div class="v3uGu">'+esc(en()?g[0]:g[1])+'</div>';ids.push('gu');}}
else if(t&&!ids.length&&!en()){var p=line('bl.petrovich');if(p&&Math.random()<.3)h+='<div class="v3uGu">🎣 '+esc(p.t)+'</div>';}
if(m.nt&&t){var nts=t.all('note');if(nts.length){var n=nts[(m.nt-1)%nts.length];if(n&&!en())h+='<div class="v3uNt">📝 «'+esc(n[0])+'» <small>— '+esc(n[1])+'</small></div>';}}
h+='<div class="row v3uRow"><button class="btn sec noenter" id="v3uBk">📒 '+L('Тетрадка','Notebook')+'</button>'+(W.TD&&TD.openToday?'<button class="btn sec noenter" id="v3uTd">📋 '+L('Дела во дворе','Yard chores')+'</button>':'')+
(on('voice')&&W.speechSynthesis?'<button class="btn sec noenter" id="v3uVo">'+(m.vo?'🔊 ':'🔈 ')+L('Голос Шуры','Shura’s voice')+'</button>':'')+'</div>'+closeBtn();
UX.sv();modal(h);wireClose();var bk=$('v3uBk');if(bk)bk.onclick=openBook;var td=$('v3uTd');if(td)td.onclick=function(){VY.hide();ok(function(){TD.openToday();});};var vo=$('v3uVo');if(vo)vo.onclick=function(){m.vo=m.vo?0:1;UX.sv();vo.innerHTML=(m.vo?'🔊 ':'🔈 ')+L('Голос Шуры','Shura’s voice');if(m.vo){var x=b&&two(pick(b.voiceOn));if(x)voice(x);}ev('voice',{v:m.vo});};
if(ml)voice(ml);ev('bench',{w:ids.join('')||'-',m:X.benchMood(hour())});}
UX.openBench=openBench;
function whoName(w){var N={shura:['Шура','Shura'],ded:['Мой','Husband'],tolik:['Толик','Tolik'],mihalych:['Михалыч','Mikhalych'],valerka:['Валерка','Valerka'],mityai:['Митяй','Mityai'],galya:['Галя','Galya'],valya:['Тётя Валя','Aunt Valya']};var n=N[w];return n?L(n[0],n[1]):w;}
function voice(t){if(!on('voice')||!u().vo||!t)return;ok(function(){var s=W.speechSynthesis;if(!s||ok(function(){return calm();},false))return;s.cancel();var x=new SpeechSynthesisUtterance(String(t).slice(0,220));x.lang=en()?'en-GB':'ru-RU';x.rate=.95;x.pitch=1.15;s.speak(x);});}
UX.voice=voice;
yardHook.push({id:'v3u',fn:function(i){if(!W.V3||!V3.is('ux'))return;var m=u(),c=+i.crashes||0;
if(i.end==='win'){m.sc++;m.gn++;}
if(c>0){m.cr++;m.fc++;
if(on('bench')&&m.pd!==dk()){m.pd=dk();m.nt++;UX.note('note',m.nt);}
if(on('gar')){var r=X.frankAdd(m,dk());m.fr=r.fr;m.fd=r.fd;m.fq=r.fq;m.fk=r.fk;if(r.got){var b=bank();
if(r.built){UX.note('frank',r.fk);V3.emit('ux:frank',r.fk);ev('frank',{n:r.fk});setTimeout(function(){var x=b&&two(pick(b.frankDone));if(x)say(x,'tolik');giveFrank();},1200);}
else if(m.fr===1||m.fr%4===0){var y=b&&two(pick(b.frank));if(y)setTimeout(function(){tst('🔧 '+y);},900);}}}}
else if(i.end==='win')m.fc=0;
if(on('bench')&&i.end==='win'&&!c&&X.quietHour(hour())&&m.qd!==dk()){m.qd=dk();m.qn++;UX.note('quiet','');var b2=bank();setTimeout(function(){var q=b2&&two(pick(b2.quietStar));tst('🤫 '+(q||L('Звезда тишины!','Star of silence!')));},1400);ev('quiet',{n:m.qn});}
UX.sv();}});
function giveFrank(){ok(function(){if(W.YARD&&YARD.giveCar)YARD.giveCar('frank','v3u');});}
function mailReady(){var m=u();return on('mail')&&m.md&&!m.mr&&X.mailReady(m.md,dk(),hour());}
function weekNo(){return Math.floor((dk()+3)/7);}
function weekDue(){var m=u();return on('mail')&&m.wk!==weekNo()&&(V3.day()>=2||V3.vet());}
function wrapMail(){if(!W.VYMAIL||!VYMAIL.send||VYMAIL.send.__v3u)return;var f=VYMAIL.send;VYMAIL.send=function(txt,o){var r=f.apply(this,arguments);
if(r>0&&on('mail')){var m=u();m.md=dk();m.mr=0;var tp=X.topicOf(txt,o&&o.k);ok(function(){localStorage.setItem('vyezd-v3u-tp',tp);});UX.sv();ev('mail',{a:'sent',t:tp});
setTimeout(function(){var p=D.querySelector('#mcard .vml-ok .shura p, #mcard .vml-ok p');if(p)p.textContent=L('Письмо у меня в кармане фартука. Прочитаю вечером на лавочке — к утру отвечу. Загляни в почтовый ящик.','Your letter is in my apron pocket. I’ll read it tonight on the bench and answer by morning. Check the mailbox.');},0);}
return r;};VYMAIL.send.__v3u=1;}
V3.sub('boot',function(){wrapMail();setTimeout(wrapMail,3000);},'ux.mail');
function openAnswer(){var t=T();if(t&&!t.isReady()){t.ready(openAnswer);return;}var m=u(),tp=ok(function(){return localStorage.getItem('vyezd-v3u-tp');},'')||'other';
var a=t?ok(function(){return t.letterAns(tp);},null):null,h='<h2>✉️ '+L('Ответ от бабы Шуры','A reply from Granny Shura')+'</h2>';
if(a){h+=shuraH(a.t);if(a.ps)h+='<p class="v3uPs">'+esc(a.ps)+'</p>';h+=jk(a.id,'letter');}else h+=shuraH(L('Письмо твоё прочитала. Спасибо. Всё передам, кому надо.','I read your letter. Thank you. I’ll pass it on.'));
m.mr=1;m.psn++;UX.note('mail','');if(a&&a.ps)UX.note('ps',a.ps.replace(/^P\.S\.\s*/,'').slice(0,16));UX.sv();
h+=closeBtn();modal(h);wireClose();voice(a&&a.t);ev('mail',{a:'read',t:tp});}
function openWeek(){var t=T();if(t&&!t.isReady()){t.ready(openWeek);return;}var m=u(),b=bank(),h='<h2>📬 '+L('Письмо недели','Letter of the week')+'</h2>';
var lt=UX.weekLetter||(b&&b.lettersWeek?b.lettersWeek[weekNo()%b.lettersWeek.length]:null);
if(lt&&!en()){var op=line('week.open'),cl=line('week.close');h+=shuraH(op?fillT(op.t,{name:lt.name,city:lt.city}):'');h+='<blockquote class="v3uLt">'+esc(lt.t)+'<small>— '+esc(lt.name)+', '+esc(lt.city)+'</small></blockquote>';if(cl)h+='<p class="v3uPs">'+esc(cl.t)+'</p>';}
else{var no=line('week.none');h+=shuraH(no?no.t:L('Писем на этой неделе нет. Напиши ты — будешь первым.','No letters this week. Write one — you’ll be first.'));}
m.wk=weekNo();UX.note('week','');UX.sv();
h+='<div class="row v3uRow">'+(W.VYMAIL&&VYMAIL.open?'<button class="btn sec noenter" id="v3uWr">✉️ '+L('Написать Шуре','Write to Shura')+'</button>':'')+'</div>'+closeBtn();
modal(h);wireClose();var wr=$('v3uWr');if(wr)wr.onclick=function(){VY.hide();ok(function(){VYMAIL.open('about');});};ev('mail',{a:'week'});}
W.homeSlots.push({id:'th-mail',zone:'thing',order:20,render:function(){if(!on('mail'))return null;var hasMail=!!(W.VYMAIL&&VYMAIL.open&&!W.__demo);
if(mailReady())return{at:'mail',t:L('Ответ от Шуры','Reply from Shura'),badge:'✉',go:openAnswer};
if(weekDue())return{at:'mail',t:L('Письмо недели','Letter of the week'),badge:'!',go:openWeek};
if(!hasMail)return null;return{at:'mail',t:L('Письмо бабе Шуре','Write to Granny Shura'),go:function(){ok(function(){VYMAIL.open('about');});}};}});
winSlots.push({id:'v3u-mail',zone:'extra',order:5,fit:3,render:function(){if(!mailReady())return null;
return'<p class="v3uWl">✉️ '+L('Шура ответила на твоё письмо.','Shura answered your letter.')+' <button class="btn sec sm noenter" id="v3uMl">'+L('Прочитать','Read')+'</button></p>';},
mount:function(el){el.setAttribute('data-keep','1');var b=el.querySelector('#v3uMl');if(b)b.onclick=function(){openAnswer();};}});
UX.lichno=function(txt){if(!txt)return;var t=T(),a=t?t.all('letter.lichno'):[],p=pick(a);var h='<h2>✍ '+L('Лично от бабы Шуры','Personally from Granny Shura')+'</h2>'+shuraH((p?fillT(p[0])+' ':'')+txt+(p?' '+p[1]:''))+closeBtn();modal(h);wireClose();ev('mail',{a:'lichno'});};
function zname(id){var b=bank(),z=b&&b.zones&&b.zones[id];return z?L(z[0],z[1]):id;}
function myCheck(){if(!on('my'))return;var m=u(),z=X.zonesFor(stars());if(z.n>m.z){var was=m.z;m.z=z.n;if(was){UX.note('zone',zname(X.ZONES[z.n-1][1]).slice(0,16));V3.emit('ux:zone',z.n);ev('zone',{n:z.n});}UX.sv();}
var bl=X.builds(m.z);for(var i=0;i<bl.length;i++)V3.emit('ux:build',bl[i]);}
UX.builds=function(){return on('my')?X.builds(u().z):[];};
V3.sub('boot',function(){T()&&T().ready(myCheck);},'ux.my');V3.sub('yard',function(){myCheck();},'ux.my');
W.homeSlots.push({id:'th-flowers',zone:'thing',order:20,render:function(){if(!on('my'))return null;var z=X.zonesFor(stars());
return{at:'flowers',t:L('Мой двор','My yard'),s:z.next?L('до «','to “')+zname(z.next)+L('» — ','” — ')+z.need+' ★':'',badge:z.n>u().z||UX.qNew?'!':'',go:openMy};}});
function openMy(){var t=T();if(t&&!t.isReady()){t.ready(openMy);return;}myCheck();var m=u(),st=stars(),z=X.zonesFor(st),h='<h2>🌷 '+L('Мой двор растёт','My yard grows')+'</h2>';
h+='<ul class="v3uZn">';for(var i=0;i<X.ZONES.length;i++){var Z=X.ZONES[i];if(i<z.n)h+='<li class="on">✅ '+esc(zname(Z[1]))+'</li>';else if(i===z.n)h+='<li class="nx">⭐ '+esc(zname(Z[1]))+' — '+L('ещё ','')+z.need+' ★'+L('',' more')+'</li>';}h+='</ul>';
var qt=ok(function(){return W.V3QS&&V3QS.things?V3QS.things():[];},[])||[];if(qt.length){h+='<p class="v3uQt">🧹 '+L('Вещи квартала: ','Neighbourhood things: ');
for(var qi=0;qi<qt.length;qi++)h+=(qi?' · ':'')+esc((qt[qi].ic?qt[qi].ic+' ':'')+(qt[qi].t||qt[qi].id));h+='</p>';}UX.qNew=0;
if(UX.visitors>0){var b=bank(),vl=b&&two(pick(b.visitors));if(vl)h+='<p>👣 '+esc(vl.replace('{n}',UX.visitors))+'</p>';}
var pieOk=m.pie!==dk();
h+='<div class="row v3uRow"><button class="btn sec noenter" id="v3uPie"'+(pieOk?'':' disabled')+'>🥟 '+L('Угостить Шуру пирожком','Treat Shura to a pie')+'</button>'+
(shareOk()?'<button class="btn sec noenter" id="v3uSh">📸 '+L('Мой двор в гости','Show my yard')+'</button>':'')+
(ok(function(){return UI.has('my');},false)?'<button class="btn sec noenter" data-go="my">🏡 '+L('Уют и постройки','Decor & buildings')+'</button>':'')+'</div>'+closeBtn();
modal(h);wireClose();
var pb=$('v3uPie');if(pb)pb.onclick=function(){if(u().pie===dk())return;u().pie=dk();var b=bank(),x=b&&two(pick(b.pie));UX.note('pie',L('капустой','cabbage'));UX.sv();pb.disabled=true;if(x)say(x);ev('pie');};
var sb=$('v3uSh');if(sb)sb.onclick=shareMy;ev('my',{n:z.n,s:st});}
function shareOk(){return ok(function(){return PLAT==='vk'&&W.SOC&&SOC.can&&(SOC.can('share')||SOC.can('inv'));},false);}
function snap(){var m=u();return'myd='+m.z+'.'+stars()+'.'+UX.stage().k;}
function shareMy(){ev('share');ok(function(){if(SOC.share)SOC.share({hash:snap(),text:L('Загляни в мой двор!','Visit my yard!')});else if(SOC.invite)SOC.invite();});}
V3.sub('boot',function(){var mm=/[#&?]myd=(\d+)\.(\d+)\.(\d)/.exec(location.hash+location.search);if(!mm||!on('my'))return;
setTimeout(function(){var n=+mm[1],h='<h2>🏡 '+L('Двор соседа','Neighbour’s yard')+'</h2><ul class="v3uZn">';for(var i=0;i<n&&i<X.ZONES.length;i++)h+='<li class="on">✅ '+esc(zname(X.ZONES[i][1]))+'</li>';
h+='</ul><p>★ '+(+mm[2])+'</p>'+closeBtn();T()&&T().ready(function(){modal(h);wireClose();});ev('guest');},2500);},'ux.my');
function scrHas(n){return ok(function(){return UI.has(n);},false);}
function findDue(){return u().fc>=3;}
W.homeSlots.push({id:'th-garages',zone:'thing',order:20,render:function(){if(!on('gar'))return null;var m=u();
return{at:'garages',t:L('Гаражи Толика','Tolik’s garages'),s:'🔧 '+m.fr+'/'+X.FR_NEED,badge:findDue()?'!':'',go:openGar};}});
var PART_PRICE=120;
function openGar(){var t=T();if(t&&!t.isReady()){t.ready(openGar);return;}var m=u(),h='<h2>🔧 '+L('Гараж № 7','Garage No. 7')+'</h2>';
h+=shuraH(L('Толик собирает «Франкенштейна» из деталей после аварий. Не больше двух деталей в день — «а то голова кругом».','Tolik builds a “Frankenstein” from crash parts. Two parts a day at most.'));
h+='<p class="v3uFr"><b>'+m.fr+' / '+X.FR_NEED+'</b> '+L('деталей','parts')+(m.fk?' · '+L('собрано: ','built: ')+m.fk:'')+'</p><i class="hsP"><b style="width:'+Math.round(100*m.fr/X.FR_NEED)+'%"></b></i>';
var mg=ok(function(){return!!(W.VYMG&&VYMG.INFO);},false);
h+='<div class="row v3uRow">'+(findDue()&&mg?'<button class="btn green noenter" id="v3uFd">🔍 '+L('Найди поломку','Find the fault')+'</button>':'')+
'<button class="btn sec noenter buy" id="v3uPt"'+((+S_().coins||0)>=PART_PRICE&&m.fr<X.FR_NEED-1?'':' disabled')+'>🔩 '+L('Деталь на рынке · ','Part at the market · ')+PART_PRICE+' 💰</button>'+
(scrHas('garazhi')?'<button class="btn sec noenter" data-go="garazhi">🏚 '+L('Гаражи и мини-игры','Garages & mini-games')+'</button>':'')+
(scrHas('album')?'<button class="btn sec noenter" data-go="album">📒 '+L('Автоальбом','Car album')+'</button>':'')+'</div>'+closeBtn();
modal(h);wireClose();
var fd=$('v3uFd');if(fd)fd.onclick=function(){VY.hide();u().fc=0;UX.sv();ev('find');ok(function(){VYMG_OPEN('polomka',{src:'v3u'});});};
var pt=$('v3uPt');if(pt)pt.onclick=function(){var S=S_();if((+S.coins||0)<PART_PRICE)return;
if(m.fr>=X.FR_NEED-1)return;ok(function(){setCoins(S.coins-PART_PRICE);STAT.ev('spend',{k:'v3part',c:PART_PRICE});});m.fr++;UX.sv();ev('part',{c:PART_PRICE});openGar();};
ev('gar',{f:m.fr,k:m.fk});}
V3.sub('yard-start',function(o){if(!on('map')||!o||o.daily)return;var idx=+o.idx||0,r=ok(function(){return VYREG.at(idx);},null);if(!r||idx!==r.from)return;
var m=u(),k=Math.floor(idx/10)+1;if(m.g7>=k)return;m.g7=k;UX.sv();var t=T();if(!t)return;
t.ready(function(){var a=t.all('garage7.'+r.id);if(!a.length||en())return;var b=bank(),hd=b&&b.g7Lead?two(b.g7Lead[0]):'';
setTimeout(function(){tst('📺 '+hd+' '+a[0]+' '+(a[1]||''));},1600);ev('g7',{r:r.id});});},'ux.map');
winSlots.push({id:'v3u-col',zone:'goal',order:4,fit:2,render:function(c){if(!on('col')||!c)return null;var G0=ok(function(){return G;},null);
if(!G0||!G0.v3k||!/col|kolon/i.test(String(G0.v3k.kind||G0.v3k.k||'')))return null;var n=ok(function(){return G0.vs.length;},0),cr=ok(function(){return G0.crashes;},0);
return'<p class="v3uCol">🚚 '+n+' '+L('машин','cars')+' × ★'+c.stars+(cr?'':' × '+L('чисто','clean'))+' = <b>+'+c.coins+' 💰</b></p>';},mount:function(el){el.setAttribute('data-keep','1');}});
function css(){if($('v3uxCss'))return;var s=D.createElement('style');s.id='v3uxCss';s.textContent=
'.v3ux h2{margin:.2em 0 .4em}.v3ux .v3uSc,.v3ux .v3uRm,.v3ux .v3uGu,.v3ux .v3uNt,.v3ux .v3uBk{background:rgba(255,255,255,.55);border-radius:12px;padding:8px 10px;margin:8px 0;text-align:left;font-size:1.02em;line-height:1.35}'+
'.v3ux .v3uSc p,.v3ux .v3uRm p{margin:.25em 0}.v3ux .v3uBk ul{margin:.3em 0;padding-left:1.1em;max-height:38vh;overflow:auto}.v3ux .v3uBk li{margin:.2em 0}'+
'.v3ux .v3uRow{flex-wrap:wrap;gap:6px;margin-top:6px}.v3ux .v3uRow .btn{margin:3px}.v3ux .v3uPs{font-style:italic;opacity:.85}'+
'.v3ux .v3uZn{list-style:none;padding:0;text-align:left}.v3ux .v3uZn li{padding:4px 0}.v3ux .v3uZn li.nx{opacity:.75}'+
'.v3ux blockquote{margin:8px 0;padding:8px 12px;border-left:4px solid #e0a43a;background:rgba(255,255,255,.55);text-align:left}.v3ux blockquote small{display:block;margin-top:4px;opacity:.75}'+
'.v3uWl,.v3uCol{margin:4px 0;font-size:1.02em}.v3uWl .btn{margin-left:6px}';D.head.appendChild(s);}
})();