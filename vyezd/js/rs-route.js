(function(W,D){'use strict';
if(!W.V3||!W.UI||!V3.is('rs.sect'))return;
function L(r,e){try{return VY.L(r,e);}catch(x){return r;}}
function ok(f,d){try{return f();}catch(e){if(++wn<=6)try{console.warn('rs-route',e);}catch(x){}return d;}}
var wn=0;
function $(id){return D.getElementById(id);}
function esc(s){return UI.esc(s);}
function S_(){return VY.S;}
function isO(v){return!!v&&typeof v==='object'&&!Array.isArray(v);}
function tap(){ok(function(){SND.tap();});}
function done(){return Math.max(0,(+S_().unlocked||1)-1);}
function slotObj(arr,id,ctx){var a=UI.list(arr||[]).filter(function(x){return x.id===id;})[0];return a&&a.render?ok(function(){return a.render(ctx||{});},null):null;}
function line(ic,t,s,id,cls){return'<button class="rpLine'+(cls?' '+cls:'')+'" data-rr="'+id+'"><span class="rpLi">'+ic+'</span><span class="rpLt"><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+'</span><i class="rpLg">›</i></button>';}
D.documentElement.classList.add('rpRoute');
function rights(){var r=ok(function(){return CAR.rank();},null);if(!r)return'';var f=ok(function(){return CAR.finState();},null),nx=r.next,s='';
if(f&&f.ready)s=L('финал района ждёт!','the district final is waiting!');
else if(nx&&!nx.fin)s=L('до «','to “')+esc(nx.name)+L('» — ещё ','” — ')+nx.left+L(' очков',' pts');
else if(f)s=L('впереди финал района','a district final is ahead');
var d=done(),from=Math.floor(d/10)*10,inR=d-from,rg=ok(function(){return VYREG.at(d);},null);
s+=(s?' · ':'')+L('свет в окнах','lights on')+(rg&&rg.name?L(' края «',' in “')+esc(typeof LANG!=='undefined'&&LANG==='en'&&rg.en?rg.en:rg.name)+L('»','”'):'')+': '+inR+' '+L('из','of')+' 10';
return line('🏅',L('Права: ','Licence: ')+esc(r.name),s,'rights',f&&f.ready?'hot':'');}
function modeRows(){var o=[];[].forEach.call(D.querySelectorAll('#mapList [data-slot="lvl-modes"]'),function(sl){var bs=sl.querySelectorAll('button');if(!bs.length)return;
var reg=sl.closest('.region')||sl.previousElementSibling,t='';var p=sl;while(p&&!t){p=p.previousElementSibling;if(p&&p.classList&&p.classList.contains('region'))t=p.innerText;}
if(!t){var r=sl.closest('[class*=reg]');t=r?(r.querySelector('.region')||{}).innerText||'':'';}
o.push({t:(t||'').replace(/^\s*🗺\s*/,'').trim(),b:[].slice.call(bs)});});return o;}
function openModes(){var rows=modeRows();if(!rows.length){ok(function(){toast(L('Режимы откроются с 20-го двора','Modes open from yard 20'));});return;}
var h='<h2>⏰ '+L('Режимы','Modes')+'</h2><p class="rpNote">'+L('Особые дворы: Час пик, Гололёд и другие. Выбери край.','Special yards: Rush hour, Ice and more. Pick a region.')+'</p><div class="rpModes">';
rows.forEach(function(r,i){h+='<div class="rpMr"><b>'+esc(r.t)+'</b><div class="rpMb">'+r.b.map(function(b,j){return'<button class="btn sec noenter" data-m="'+i+':'+j+'">'+esc(b.innerText.replace(/\s+/g,' ').trim())+'</button>';}).join('')+'</div></div>';});
h+='</div><div class="row"><button class="btn" id="rpMx">'+L('Закрыть','Close')+'</button></div>';
var m=VY.modal(h);if(!m)return;
[].forEach.call(m.querySelectorAll('[data-m]'),function(b){b.onclick=function(){var k=b.getAttribute('data-m').split(':'),x=rows[+k[0]].b[+k[1]];VY.hide();tap();if(x)setTimeout(function(){x.click();},30);};});
$('rpMx').onclick=function(){VY.hide();};}
function attic(){return slotObj(W.homeSlots,'th-attic',{});}
function routeHtml(){var h=rights(),d=done();
if(d>=19)h+=line('⏰',L('Режимы','Modes'),L('Час пик, Гололёд и другие — по краям','Rush hour, Ice and more — by region'),'modes');
var a=attic();
if(a&&a.go&&d>=29){if(d>=210)h+=line('🏚',L('Чердак','Attic'),L('горка, лифт, Луна и «Пять дворов подряд»','hill, lift, Moon and “Five yards in a row”'),'attic');
else h+=line('🚚',L('Пять дворов подряд','Five yards in a row'),L('три ❤️ на всю серию — дворы один за другим','three ❤️ for the whole run — yard after yard'),'attic');}
return h?'<div class="rpRt">'+h+'</div>':null;}
function routeMount(el){[].forEach.call(el.querySelectorAll('[data-rr]'),function(b){b.onclick=function(){tap();var k=b.getAttribute('data-rr');
if(k==='rights')ok(function(){var f=CAR.finState();if(f&&f.ready)CAR.openFinal();else CAR.openCareer();});
else if(k==='modes')openModes();
else if(k==='attic'){var a=attic();if(a&&a.go)ok(function(){a.go();});}};});}
function slots(){if(!Array.isArray(W.mapSlots))return;
mapSlots.push({id:'rp-route',order:1,zone:'top',render:routeHtml,mount:routeMount});
mapSlots.push({id:'vymg-map',order:30,zone:'top',render:function(){return null;}});
mapSlots.push({id:'vypark-map',order:35,zone:'top',render:function(){return null;}});}
slots();
W.addEventListener('vy-late',function(){slots();ok(function(){UI.refresh();});});
(function(){var om=W.openMap;if(typeof om!=='function'||om.__rp)return;W.openMap=function(){ok(function(){var c=W.FESTVY&&FESTVY.cur&&FESTVY.cur();var S=S_();
if(c&&c.id){if(!isO(S.fst))S.fst={};if(!isO(S.fst.seen))S.fst.seen={};S.fst.seen[c.id]=1;}});var r=om.apply(this,arguments);ok(fitRoute);return r;};W.openMap.__rp=1;})();
var SHORT={rights:['🏅','Права','Licence'],modes:['⏰','Режимы','Modes'],attic:null};
function fitRoute(){var sc=$('mapScroll'),rt=sc&&sc.querySelector('.rpRt');if(!rt)return;
var cur=$('mapList').querySelector('.cur')||$('mapList').querySelector('.mycar');if(cur&&cur.tagName==='CANVAS')cur=cur.parentNode;
var sr=sc.getBoundingClientRect(),y0=rt.getBoundingClientRect().top-sr.top+sc.scrollTop,vis=sc.clientHeight-(parseFloat(getComputedStyle(sc).paddingBottom)||0);
if(cur){var cr=cur.getBoundingClientRect(),y1=cr.bottom-sr.top+sc.scrollTop+12;if(y1-y0<=vis)sc.scrollTop=Math.max(0,y0-6);}
bar(sc,rt);}
function bar(sc,rt){var b=$('rpBar');if(!b){b=D.createElement('div');b.id='rpBar';b.className='rpBar';}
if(b.parentNode!==sc||sc.firstChild!==b)sc.insertBefore(b,sc.firstChild);
var h='';[].forEach.call(rt.querySelectorAll('[data-rr]'),function(x){var k=x.getAttribute('data-rr'),m=SHORT[k],t;
if(m)t=m[0]+' '+L(m[1],m[2]);else{var ic=(x.querySelector('.rpLi')||{}).textContent||'',bb=(x.querySelector('.rpLt b')||{}).textContent||'';t=ic+' '+(/Пять/.test(bb)?L('5 подряд','5 in a row'):bb);}
h+='<button class="rpChip noenter'+(x.classList.contains('hot')?' hot':'')+'" data-rr="'+k+'">'+esc(t)+'</button>';});
b.innerHTML='<div class="rpBarIn">'+h+'</div>';routeMount(b);
function upd(){var r=rt.getBoundingClientRect(),s=sc.getBoundingClientRect();b.classList.toggle('on',!!rt.isConnected&&r.bottom<s.top+8);}
if(sc.__rpS)sc.removeEventListener('scroll',sc.__rpS);sc.__rpS=upd;sc.addEventListener('scroll',upd,{passive:true});upd();}
function my(){var S=S_();if(!isO(S.v3sect))S.v3sect={};return S.v3sect;}
function xl(){var S=S_();return!!(S&&isO(S.v3sect)&&S.v3sect.xl);}
function xlApply(){D.documentElement.classList.toggle('rpXL',xl());}
function onTxt(v){return v?'<i>'+L('вкл','on')+'</i>':'<i class="off">'+L('выкл','off')+'</i>';}
function call(){var r=slotObj(W.homeSlots,'th-intercom',{});return r&&r.go?r:null;}
function grp(t,nodes){if(!nodes.length)return null;var g=D.createElement('div');g.className='rpSetG';var h=D.createElement('h3');h.className='rpSetH';h.textContent=t;g.appendChild(h);nodes.forEach(function(n){g.appendChild(n);});return g;}
function btn(id,ic,t,s,right){var b=D.createElement('button');b.className='set';b.id=id;b.innerHTML='<span>'+ic+' '+t+(s?'<br><small>'+s+'</small>':'')+'</span>'+(right||'<i class="go">›</i>');return b;}
function setFix(){var c=$('mcard');if(!c||!$('stSnd')||c.__rp===$('stSnd'))return;c.__rp=$('stSnd');c.classList.add('rpSet');
var h2=c.querySelector('h2'),row=null,kids=[].slice.call(c.children),by={},rest=[];
kids.forEach(function(k){if(k===h2)return;if(k.classList&&k.classList.contains('row')&&k.querySelector('#stClose')){row=k;return;}if(k.id)by[k.id]=k;else rest.push(k);});
var used={};function take(id){var n=by[id];if(n){used[id]=1;return n;}return null;}
var bx=btn('rpXl','🔠',L('Крупный текст','Large text'),L('всё на экранах и в окнах крупнее','everything on screens and in windows bigger'),onTxt(xl()));
bx.onclick=function(){my().xl=xl()?0:1;if(!my().xl)delete my().xl;ok(function(){save();});xlApply();tap();ok(function(){openSettings();});};
var nb=[],cl=call(),soc=by.stSoc;
if(cl&&!(soc&&cl.go===W.openSocial)){var bc=btn('rpCall','📞',L('Позвать соседа','Call a neighbour'),cl.t&&!/Позвать|Call/.test(cl.t)?esc(cl.t):L('позвать в игру, весточка от бабы Шуры','invite to the game, a note from Granny Shura'));
bc.onclick=function(){tap();ok(function(){cl.go();});};nb.push(bc);}
else if(soc){var sp=soc.querySelector('span');if(sp)sp.innerHTML='📞 '+L('Позвать соседа','Call a neighbour')+'<br><small>'+L('друзья и приглашения','friends and invitations')+'</small>';}
if(W.VYMAIL&&VYMAIL.open){var bm=btn('rpMail','✉️',L('Письмо бабе Шуре','Write to Granny Shura'),L('пожелание, вопрос, ошибка — прочитаем','a wish, a question, a bug — we read them'));
bm.onclick=function(){tap();ok(function(){VYMAIL.open('about',function(){ok(function(){openSettings();});});});};nb.push(bm);}
if(soc){used.stSoc=1;nb.push(soc);}
var g=[grp(L('Звук','Sound'),[take('stSnd'),take('stMus'),take('stVib')].filter(Boolean)),
grp(L('Вид','Display'),[take('stCalm'),bx,take('stLang')].filter(Boolean)),
grp(L('Соседи и письма','Neighbours & letters'),nb)];
var more=[];kids.forEach(function(k){if(k===h2||k===row)return;if(k.id&&used[k.id])return;if(k.id==='stSnd'||k.id==='stMus'||k.id==='stVib'||k.id==='stCalm'||k.id==='stLang')return;more.push(k);});
if(g[0])g[0].classList.add('rpSnd');
g.push(grp(L('Ещё','More'),more));
var frag=D.createDocumentFragment();if(h2)frag.appendChild(h2);g.forEach(function(x){if(x)frag.appendChild(x);});if(row)frag.appendChild(row);
c.innerHTML='';c.appendChild(frag);}
function setWatch(){var c=$('mcard');if(!c||c.__rpw)return;c.__rpw=1;try{new MutationObserver(function(){if($('stSnd'))ok(setFix);}).observe(c,{childList:true});}catch(e){}}
function boot(){xlApply();setWatch();}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
V3.sub('cloud',function(){xlApply();},'rs.sect');
W.RSR={modes:openModes,xl:xl};
})(window,document);