/* RB:UX — «Журнал рыбака» и трофейная стена (поток UX-alb, буст 08.10.2026).
   Слой поверх старого альбома: переопределяет openAlb (вкладки Рыбы/Трофеи/Фото), albWall, fishInfo присваиванием.
   Рыбы — ТОЛЬКО из реестра js/places.js (FISH, LEG, PLACES[i].fish/.leg/.tsar, CHAPTERS, PLACE_ORD, RAR, RAR_KEYS, rarOf).
   Старые функции и поля сохранения (S.alb, S.legs, S.sets, S.gild, S.mnt, S.cups, claimSet, buyMnt, mntPrice/mntCan, gildPrice) — как есть.
   Своё поле сохранения: S.uiAlb = {g:'p'|'r' группировка, f:'all'|<ключ RAR> фильтр, wa:0|1 все пустые места стены}. Фото (a1AlbPhotos) не трогаем. */
(function(){
'use strict';
if(typeof openAlb!=='function'||typeof RAR==='undefined')return;
var $=function(id){return document.getElementById(id);};
function E(t){return esc(t==null?'':t);}
function hexA(h,a){h=String(h||'#999').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var n=parseInt(h,16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
function rk(id){var k=rarOf(id);return RAR[k]?k:'common';}
function rv(id){var c=RAR[rk(id)].c;return '--rc:'+c+';--rcA:'+hexA(c,.5)+';--rcB:'+hexA(c,.22)+';--rcG:'+hexA(c,.6);}
function rn(k){return LANG==='en'?RAR[k].en:RAR[k].n;}
// «Редких 3/12» — родительный падеж множественного
var RGEN={common:['Обычных','Common'],uncommon:['Необычных','Uncommon'],rare:['Редких','Rare'],trophy:['Трофейных','Trophy'],legend:['Легенд','Legends'],redbook:['Красная книга','Red Book'],rb:['Красная книга','Red Book']/*MERGE: ключ NORTH — 'rb'*/,tsar:['Царь-рыба','Tsar fish']};
function rgen(k){var g=RGEN[k];return g?L(g[0],g[1]):rn(k);}
function st(){if(!S.uiAlb||typeof S.uiAlb!=='object')S.uiAlb={};var u=S.uiAlb;if(u.g!=='r')u.g='p';if(u.f!=='all'&&!RAR[u.f])u.f='all';return u;}

/* ---- реестр: порядок мест, виды, легенды, Царь-рыбы ---- */
function ord(){var o=typeof PLACE_ORD!=='undefined'?PLACE_ORD.slice():[];PLACES.forEach(function(p,i){if(o.indexOf(i)<0)o.push(i);});return o;}
function species(){var s=[],o=ord();o.forEach(function(i){(PLACES[i].fish||[]).forEach(function(id){if(FISH[id]&&s.indexOf(id)<0)s.push(id);});});return s;}
function tsarsOf(){var t=[];ord().forEach(function(i){var x=PLACES[i].tsar;if(x&&LEG[x]&&t.indexOf(x)<0)t.push(x);});
  if(typeof CHAPTERS!=='undefined')CHAPTERS.forEach(function(c){if(c.tsar&&LEG[c.tsar]&&t.indexOf(c.tsar)<0)t.push(c.tsar);});return t;}
function legends(){var t=tsarsOf(),l=[];ord().forEach(function(i){var x=PLACES[i].leg;if(x&&LEG[x]&&l.indexOf(x)<0)l.push(x);});
  Object.keys(LEG).forEach(function(id){if(l.indexOf(id)<0&&t.indexOf(id)<0)l.push(id);});return l;}
function fest(){return Object.keys(FISH).filter(function(id){return FISH[id].fest&&S.alb[id];});}
function got(id){return !!S.alb[id]||!!(LEG[id]&&S.legs[id]);}
function placeOfLeg(id){for(var i=0;i<PLACES.length;i++)if(PLACES[i].leg===id||PLACES[i].tsar===id)return i;
  var r=LEG[id];if(r&&r.pl&&r.pl.length&&typeof placeIdx==='function')return placeIdx(r.pl[0]);return -1;}
function wherePl(id){if(LEG[id]){var i=placeOfLeg(id);return i>=0?[i]:[];}var o=[];ord().forEach(function(i){if((PLACES[i].fish||[]).indexOf(id)>=0||(PLACES[i].evf||[]).indexOf(id)>=0)o.push(i);});return o;}
function placeOrdIdx(id){var w=wherePl(id);return w.length?ord().indexOf(w[0]):999;}
function cnt(ids){var n=0;ids.forEach(function(id){if(got(id))n++;});return n;}
function rel(id){var f=fishOf(id);return !!(f&&(f.rel||(rk(id)==='rb'||rk(id)==='redbook')));}

/* ---- карточка рыбы ---- */
function stars(n){var k=mastOf(n),h='<span class="ua-st" aria-label="'+k+'/3">';for(var i=0;i<3;i++)h+='<i class="'+(i<k?'on':'')+'">★</i>';return h+'</span>';}
function card(id){var f=fishOf(id),a=S.alb[id],g=got(id),k=rk(id),big=!!LEG[id],b=document.createElement('button');
  b.className='ua-c noenter'+(g?'':' no')+(big?' big':'')+(S.gild[id]?' gd':'')+(k==='rb'||k==='redbook'?' rb':'')+(k==='tsar'?' ts':'');b.setAttribute('style',rv(id));
  var ph=document.createElement('span');ph.className='ua-ph';ph.appendChild(fishImg(id,120,!g));b.appendChild(ph);
  var sub=g&&a?kgTxt(a.mx/1000)+' · ×'+a.n:(big?rn(k):L('не поймана','not caught'));
  b.insertAdjacentHTML('beforeend','<i class="ua-dot"></i>'+(a&&a.tr?'<span class="ua-tr">🏆</span>':'')
    +'<b>'+(g||!big?E(nm(f)):'???')+'</b><small>'+E(sub)+'</small>'+(big?'':stars(a?a.n:0))
    +(k==='rb'||k==='redbook'?'<span class="ua-rbt">'+L('Красная книга','Red Book')+'</span>':''));
  b.onclick=function(){SND.tap();fishInfo(id);};return b;}
function grid(ids){var g=document.createElement('div');g.className='ua-g';ids.forEach(function(id){g.appendChild(card(id));});return g;}

/* ---- наборы места (как было: setReward/setDone, «Забрать» = claimSet) ---- */
function setRow(kind,i){var p=PLACES[i],r=setReward(kind,i),n=p.fish.filter(function(id){return S.alb[id]&&(kind==='sp'||S.alb[id].tr);}).length,key=kind+i,
  ttl=kind==='sp'?'🐟 '+L('Все виды','All species'):'🏆 '+L('Все трофеи','All trophies');
  if(S.sets[key])return '<div class="ua-set done"><span>'+ttl+'</span><em>✓ '+L('получено','claimed')+'</em></div>';
  if(n>=p.fish.length)return '<div class="ua-set rdy"><span>'+ttl+' — '+L('собрано!','done!')+'</span><button class="btn green noenter" data-set="'+key+'">🎁 '+L('Забрать','Claim')+' +'+coinsTxt(r)+'</button></div>';
  return '<div class="ua-set"><span>'+ttl+' <b>'+n+'/'+p.fish.length+'</b></span><em>+'+coinsTxt(r)+'</em><i class="ua-sb"><i style="width:'+Math.round(n/p.fish.length*100)+'%"></i></i></div>';}

/* ---- «Журнал рыбака» ---- */
function head(box){var sp=species(),lg=legends(),ts=tsarsOf(),u=st(),all=sp.concat(lg,ts),
  tr=sp.filter(function(id){return S.alb[id]&&S.alb[id].tr;}).length,sn=cnt(sp),ln=cnt(lg),tn=cnt(ts);
  var h='<div class="ua-top"><div class="ua-big"><b>'+sn+'</b><span>'+L('из '+sp.length+' '+plural(sp.length,'вида','видов','видов'),'of '+sp.length+' species')+'</span></div>'
    +'<div class="ua-big"><b>'+tr+'</b><span>'+pl(tr,'трофей','трофея','трофеев','trophy','trophies')+'</span></div>'
    +'<div class="ua-big gl"><b>'+ln+'</b><span>'+L('из '+lg.length+' '+plural(lg.length,'легенды','легенд','легенд'),'of '+lg.length+' legends')+'</span></div>'
    +(ts.length?'<div class="ua-big ts"><b>'+tn+'</b><span>'+L('из '+ts.length+' Царь-рыб','of '+ts.length+' tsar fish')+'</span></div>':'')
    +'<span class="ua-bar"><i style="width:'+Math.round(cnt(all)/Math.max(1,all.length)*100)+'%"></i></span></div>';
  // плашки категорий — они же фильтр
  h+='<div class="ua-chips" role="group" aria-label="'+L('Редкость','Rarity')+'"><button class="ua-chip noenter'+(u.f==='all'?' on':'')+'" data-f="all"><span>'+L('Все','All')+'</span> <b>'+cnt(all)+'/'+all.length+'</b></button>';
  RAR_KEYS.forEach(function(k){var ids=all.filter(function(id){return rk(id)===k;});if(!ids.length)return;var c=RAR[k].c;
    h+='<button class="ua-chip noenter'+(u.f===k?' on':'')+'" data-f="'+k+'" style="--rc:'+c+';--rcB:'+hexA(c,.22)+';--rcA:'+hexA(c,.55)+'"><i class="ua-dot"></i><span>'+E(rgen(k))+'</span> <b>'+cnt(ids)+'/'+ids.length+'</b></button>';});
  h+='</div><div class="ua-seg" role="tablist"><button class="noenter'+(u.g==='p'?' on':'')+'" data-g="p">📍 '+L('По местам','By place')+'</button><button class="noenter'+(u.g==='r'?' on':'')+'" data-g="r">✨ '+L('По редкости','By rarity')+'</button></div>';
  box.insertAdjacentHTML('beforeend',h);}
function okF(id){var f=st().f;return f==='all'||rk(id)===f;}
function byPlace(box){var u=st(),seen={},o=ord(),chs=typeof CHAPTERS!=='undefined'&&CHAPTERS.length>1?CHAPTERS:null,any=false;
  var groups=chs?chs.map(function(c){return {c:c,pl:o.filter(function(i){return PLACES[i].ch===c.id;})};}):[{c:null,pl:o}];
  if(chs){var rest=o.filter(function(i){return !groups.some(function(g){return g.pl.indexOf(i)>=0;});});if(rest.length)groups[groups.length-1].pl=groups[groups.length-1].pl.concat(rest);}
  groups.forEach(function(gr){var chHtml=gr.c?'<div class="ua-ch">'+E(LANG==='en'&&gr.c.en?gr.c.en:gr.c.n)+'</div>':'',chShown=false;
    gr.pl.forEach(function(i){var p=PLACES[i],ids=(p.fish||[]).filter(function(id){return FISH[id];});if(p.leg&&LEG[p.leg])ids.push(p.leg);if(p.tsar&&LEG[p.tsar])ids.push(p.tsar);
      ids.forEach(function(id){seen[id]=1;});var vis=ids.filter(okF);if(!vis.length)return;any=true;
      if(!chShown&&chHtml){box.insertAdjacentHTML('beforeend',chHtml);chShown=true;}
      var n=cnt(ids),op=!!S.open[i];
      box.insertAdjacentHTML('beforeend','<div class="ua-ph2'+(op?'':' lk')+'"><span class="ua-pi">'+(p.ic||'📍')+'</span><span class="ua-pn"><b>'+E(nm(p))+'</b><small>'+(op?E(LANG==='en'?p.regE||'':p.reg||''):'🔒 '+L('место ещё закрыто','not open yet'))+'</small></span><span class="ua-pc">'+n+'/'+ids.length+'</span></div>'
        +(u.f==='all'?'<div class="ua-sets">'+setRow('sp',i)+setRow('tr',i)+'</div>':''));
      box.appendChild(grid(vis));});
    if(gr.c&&gr.c.tsar&&LEG[gr.c.tsar]&&!seen[gr.c.tsar]&&okF(gr.c.tsar)){seen[gr.c.tsar]=1;any=true;if(!chShown&&chHtml){box.insertAdjacentHTML('beforeend',chHtml);chShown=true;}box.appendChild(grid([gr.c.tsar]));}});
  var rest2=legends().concat(tsarsOf()).filter(function(id){return !seen[id]&&okF(id);});if(rest2.length){any=true;box.appendChild(grid(rest2));}
  var fe=fest().filter(okF);if(fe.length){any=true;box.insertAdjacentHTML('beforeend','<div class="ua-ph2"><span class="ua-pi">✨</span><span class="ua-pn"><b>'+L('Праздничные рыбы','Festive fish')+'</b></span><span class="ua-pc">'+fe.length+'</span></div>');box.appendChild(grid(fe));}
  return any;}
function byRar(box){var all=species().concat(legends(),tsarsOf(),fest()),f=st().f,any=false;
  RAR_KEYS.forEach(function(k){if(f!=='all'&&f!==k)return;var ids=all.filter(function(id){return rk(id)===k;});if(!ids.length)return;any=true;
    ids.sort(function(a,b){return placeOrdIdx(a)-placeOrdIdx(b);});var c=RAR[k].c;
    box.insertAdjacentHTML('beforeend','<div class="ua-rh" style="--rc:'+c+';--rcB:'+hexA(c,.22)+'"><i class="ua-dot"></i><b>'+E(rn(k))+'</b><span>'+cnt(ids)+'/'+ids.length+'</span></div>');
    box.appendChild(grid(ids));});return any;}
function junk(box){var ks=Object.keys(JUNK),n=ks.filter(function(k){return S.junk[k];}).length;
  box.insertAdjacentHTML('beforeend','<div class="ua-ph2"><span class="ua-pi">📦</span><span class="ua-pn"><b>'+L('Находки','Finds')+'</b></span><span class="ua-pc">'+n+'/'+ks.length+'</span></div>');
  var g=document.createElement('div');g.className='ua-g';ks.forEach(function(k){var j=JUNK[k],gt=S.junk[k];
    g.insertAdjacentHTML('beforeend','<div class="ua-c ua-j'+(gt?'':' no')+'"><span class="ua-ph"><span class="ua-ji">'+(gt?j.ic:'❔')+'</span></span><b>'+(gt?E(nm(j)):'???')+'</b><small>'+(gt?'×'+gt:'—')+'</small></div>');});box.appendChild(g);}
function journal(){var box=$('alList'),u=st(),sp=species();box.innerHTML='';
  $('alSub').textContent=L('Журнал рыбака','Angler\'s journal')+' · '+cnt(sp)+' / '+sp.length;
  head(box);var ok=u.g==='r'?byRar(box):byPlace(box);
  if(!ok)box.insertAdjacentHTML('beforeend','<p class="ua-empty">'+L('Таких рыб пока нет.','No such fish yet.')+'</p>');
  if(u.f==='all')junk(box);
  box.querySelectorAll('[data-set]').forEach(function(b){b.onclick=function(){claimSet(b.dataset.set,b);};});
  box.querySelectorAll('[data-f]').forEach(function(b){b.onclick=function(){SND.tap();var s=st();s.f=b.dataset.f;try{save();}catch(e){}var y=box.scrollTop;journal();box.scrollTop=y;};});
  box.querySelectorAll('[data-g]').forEach(function(b){b.onclick=function(){SND.tap();var s=st();s.g=b.dataset.g;try{save();}catch(e){}var y=box.scrollTop;journal();box.scrollTop=y;};});}

/* ---- вкладки ---- */
var oldAlb=openAlb;
openAlb=function(tab){if(tab==='f'||tab==='w'||tab==='p')albTab=tab;var sc=$('scr-alb');
  sc.classList.remove('ua-f','ua-w');if(albTab!=='p')sc.classList.add(albTab==='w'?'ua-w':'ua-f');
  if(albTab==='p'){oldAlb('p');return;}
  STAT.screen(albTab==='w'?'wall':'alb');show('scr-alb');var tb=$('alTabs'),wn=Object.keys(S.mnt).length+Object.keys(S.cups).length;tb.style.display='';
  tb.innerHTML='<button data-k="f" class="'+(albTab==='f'?'on':'')+'">🐟 '+L('Рыбы','Fish')+'</button><button data-k="w" class="'+(albTab==='w'?'on':'')+'">🏆 '+L('Трофеи','Trophies')+(wn?'<i class="ua-tn">'+wn+'</i>':'')+'</button><button data-k="p" class="'+(albTab==='p'?'on':'')+'">📷 '+L('Фото','Photos')+'</button>';
  tb.querySelectorAll('button').forEach(function(b){b.onclick=function(){SND.tap();openAlb(b.dataset.k);$('alList').scrollTop=0;};});
  if(albTab==='w'){albWall();return;}journal();};

/* ---- трофейная стена ---- */
function mountable(){return species().concat(legends(),tsarsOf());}
function plaque(id,kind){var f=fishOf(id),k=rk(id),a=S.alb[id],m=S.mnt[id],big=!!LEG[id],d=document.createElement('button');
  var rec=m&&a&&m>=a.mx;d.className='ua-pq noenter '+kind+(big||k==='tsar'?' gold':'')+(rec&&kind==='on'?' rec':'');d.setAttribute('style',rv(id));
  var ph=document.createElement('span');ph.className='ua-pqi';ph.appendChild(fishImg(id,150,kind!=='on'));d.appendChild(ph);
  var nmT=got(id)||!big?nm(f):'???',sub=kind==='on'?kgTxt(m/1000)+(rec?' · '+L('рекорд','record'):''):kind==='can'?L('можно сделать','can be made'):(big?rn(k):'—');
  d.insertAdjacentHTML('beforeend','<i class="ua-dot"></i><b>'+E(nmT)+'</b><small>'+E(sub)+'</small>'+(kind==='on'&&mntCan(id)?'<span class="ua-up">⬆</span>':''));
  d.onclick=function(){SND.tap();fishInfo(id);};return d;}
albWall=function(){var box=$('alList'),all=mountable(),extra=Object.keys(S.mnt).filter(function(id){return fishOf(id)&&all.indexOf(id)<0;}),u=st();
  var mt=all.concat(extra).filter(function(id){return S.mnt[id]&&fishOf(id);}),kg=mt.reduce(function(s,id){return s+S.mnt[id];},0);box.innerHTML='';
  $('alSub').textContent=L('Трофейная стена','Trophy wall')+' · '+mt.length+' / '+all.length;
  box.insertAdjacentHTML('beforeend','<div class="ua-wh"><div class="ua-big"><b>'+mt.length+'</b><span>'+L('из '+all.length+' на стене','of '+all.length+' on the wall')+'</span></div>'
    +(mt.length?'<div class="ua-big"><b>'+E(kgTxt(kg/1000))+'</b><span>'+L('общий вес','total weight')+'</span></div>':'')+'<p>'+L('Домик Петровича: чучела рекордных рыб','Petrovich\'s cabin: record fish mounts')+'</p></div>');
  var wall=document.createElement('div');wall.className='ua-wall';var g=document.createElement('div');g.className='ua-wg';
  mt.sort(function(a,b){return (LEG[b]?1:0)-(LEG[a]?1:0)||S.mnt[b]-S.mnt[a];}).forEach(function(id){g.appendChild(plaque(id,'on'));});
  var can=all.filter(function(id){return !S.mnt[id]&&mntCan(id);}),nope=all.filter(function(id){return !S.mnt[id]&&!mntCan(id);}),
    empt=can.concat(nope),lim=u.wa?empt.length:Math.max(4,6-mt.length%2),sh=empt.slice(0,lim);
  sh.forEach(function(id){g.appendChild(plaque(id,can.indexOf(id)>=0?'can':'off'));});wall.appendChild(g);
  if(empt.length>sh.length||u.wa&&empt.length>4)wall.insertAdjacentHTML('beforeend','<button class="ua-more noenter" id="uaWa">'+(u.wa?L('Свернуть пустые места','Hide empty spots'):L('Все пустые места','All empty spots')+' · '+empt.length)+'</button>');
  box.appendChild(wall);
  var cs=Object.keys(S.mnt).filter(function(id){return fishOf(id);}).concat(Object.keys(S.alb).filter(function(id){return fishOf(id)&&!S.mnt[id];})).filter(mntCan).sort(function(a,b){return mntPrice(a)-mntPrice(b);});
  if(cs.length){box.insertAdjacentHTML('beforeend','<div class="ua-ph2"><span class="ua-pi">🏆</span><span class="ua-pn"><b>'+L('Можно сделать','You can make')+'</b><small>'+L('побил рекорд — чучело за полцены','beat the record — half price')+'</small></span><span class="ua-pc">'+cs.length+'</span></div>');
    var lst=document.createElement('div');lst.className='ua-ml';
    cs.forEach(function(id){var p=mntPrice(id),up=!!S.mnt[id],r=document.createElement('div');r.className='ua-mr'+(S.coins>=p?' rdy':'');r.setAttribute('style',rv(id));
      var ic=document.createElement('span');ic.className='ua-mri';ic.appendChild(fishImg(id,80));r.appendChild(ic);
      r.insertAdjacentHTML('beforeend','<span class="ua-mrt"><b><i class="ua-dot"></i>'+E(nm(fishOf(id)))+'</b><small>'+E(kgTxt(S.alb[id].mx/1000))+(up?' · '+L('новый рекорд','new record'):'')+'</small></span><button class="btn noenter'+(S.coins>=p?' green':'')+'" data-mnt="'+id+'">'+(up?'⬆':'🏆')+' '+coinsTxt(p)+'</button>');lst.appendChild(r);});
    box.appendChild(lst);}
  else if(!mt.length)box.insertAdjacentHTML('beforeend','<p class="ua-empty">'+L('Поймай рыбу — и можно делать чучело.','Catch a fish to make a mount.')+'</p>');
  var ws=Object.keys(S.cups).map(Number).filter(function(w){return w>0;}).sort(function(a,b){return b-a;});
  box.insertAdjacentHTML('beforeend','<div class="ua-ph2"><span class="ua-pi">🏅</span><span class="ua-pn"><b>'+L('Кубки турнира недели','Weekly contest cups')+'</b></span><span class="ua-pc">'+ws.length+'</span></div>');
  if(ws.length){var sf=document.createElement('div');sf.className='ua-shelf';ws.forEach(function(w){var c=cupOf(S.cups[w]),d0=new Date((w*7-3)*864e5),pi=weekPlace(w);
      sf.insertAdjacentHTML('beforeend','<div class="ua-cup k'+c.k+'"><b>'+(c.k>=2?MEDAL[c.k-2]:'🎖')+'</b><span>'+E(LANG==='en'?nm(PLACES[pi]):P_SH[pi])+'</span><small>'+E(kgTxt(c.g/1000))+'</small><small>'+d0.getUTCDate()+'.'+('0'+(d0.getUTCMonth()+1)).slice(-2)+'</small></div>');});box.appendChild(sf);}
  else box.insertAdjacentHTML('beforeend','<p class="ua-empty">'+L('Участвуй в турнире недели — в понедельник здесь появится кубок.','Take part in the weekly contest — a cup appears here on Monday.')+'</p>');
  box.querySelectorAll('[data-mnt]').forEach(function(b){b.onclick=function(){buyMnt(b.dataset.mnt);};});
  var wa=$('uaWa');if(wa)wa.onclick=function(){SND.tap();var s=st();s.wa=s.wa?0:1;try{save();}catch(e){}var y=box.scrollTop;albWall();box.scrollTop=y;};};

/* ---- окно рыбы ---- */
fishInfo=function(id){var f=fishOf(id);if(!f)return;var a=S.alb[id],g=!!a,big=!!LEG[id],k=rk(id),c=RAR[k].c;
  var where=wherePl(id),known=g||!big||where.some(function(i){return (S.visit[i]||0)>=3;});
  var baits=big?[f.bait]:Object.keys(f.b||{}).filter(function(b){return f.b[b]>=.5;}).sort(function(x,y){return f.b[y]-f.b[x];});
  var tods=big?(f.tod||[]):f.t?Object.keys(f.t).filter(function(x){return f.t[x]>1;}):[];
  var img=fishImg(id,300,!g);img.className='fish';
  var tile=function(ic,t,v){return '<div class="ua-ft"><span>'+ic+' '+t+'</span><b>'+v+'</b></div>';};
  var h='<div class="ua-fi" style="'+rv(id)+'"><div class="ua-fh"><span class="ua-pill"><i class="ua-dot"></i>'+E(rn(k))+'</span><h2>'+(g||!big?E(nm(f)):'???')+'</h2></div><div id="fiImg" class="ua-fimg"></div>';
  if(rel(id))h+='<div class="ua-rbb"><b>📖 '+L('Красная книга','Red Book')+'</b><span>'+L('Сфотографировался и отпустил — награда полная','Photo and release — full reward')+'</span></div>';
  if(g){var mk=mastOf(a.n);h+='<div class="ua-rec"><div><b>'+E(kgTxt(a.mx/1000))+'</b><span>'+L('рекорд','record')+'</span></div><div><b>×'+a.n+'</b><span>'+L('поймано','caught')+'</span></div>'+(a.tr?'<div><b>🏆</b><span>'+L('трофей','trophy')+'</span></div>':'')+'</div>';
    if(!big)h+='<div class="ua-mast">'+stars(a.n)+'<span>'+(mk<3?L('до звезды ещё ','next star: ')+(MAST[mk][0]-a.n)+' · +'+coinsTxt(MAST[mk][1]):L('мастер по этой рыбе!','mastered!'))+'</span></div>';}
  h+='<div class="ua-fts">'+tile('📍',L('Где','Where'),where.map(function(i){return E(nm(PLACES[i]));}).join(', ')||'—');
  if(known){var bt=baits.map(function(b){return BAIT[b]?E(L(BAIT[b].acc,nm(BAIT[b]).toLowerCase())):'';}).filter(Boolean).join(', ')||'—';
    if(tods.length)h+=tile('🎣',L('На что','Bait'),bt)+tile('🕑',L('Когда','When'),tods.map(function(x){return L(TOD_N[x][0],TOD_N[x][1]).toLowerCase();}).join(', '));
    else h+='<div class="ua-ft wide"><span>🎣 '+L('На что','Bait')+'</span><b>'+bt+'</b></div>';}
  else h+='<div class="ua-ft wide"><span>🎣 '+L('На что','Bait')+'</span><b>'+L('порыбачь здесь ещё — местные расскажут','fish here more — locals will tell')+'</b></div>';
  if(!big)h+='<div class="ua-ft wide"><span>🐟 '+L('Вес','Weight')+'</span><b>'+E(kgTxt(f.w[0])+' – '+kgTxt(f.w[1]))+' <em>· 🏆 '+L('трофей от','trophy from')+' '+E(kgTxt(trophyW(f)))+'</em></b></div>';
  h+='</div>'+(big?'':a2FishInfo(id))+(g&&LANG!=='en'&&f.f?'<p class="ua-q">'+E(f.f)+'</p>':'');
  h+='<div class="row ua-fb">'+(g?(S.gild[id]?'<p class="ua-ok">🖼 '+L('Золотая рамка — в альбоме','Golden frame — in the album')+'</p>':'<button class="btn buy '+(S.coins>=gildPrice(id)?'green':'')+'" id="fiGild">🖼 '+L('Золотая рамка','Golden frame')+' — '+coinsTxt(gildPrice(id))+'</button>'):'')
    +(g&&mntCan(id)?'<button class="btn buy '+(S.coins>=mntPrice(id)?'green':'')+'" id="fiMnt">🏆 '+(S.mnt[id]?L('Обновить чучело','Update the mount'):L('Чучело на стену','Mount it on the wall'))+' — '+coinsTxt(mntPrice(id))+'</button>':g&&S.mnt[id]?'<p class="ua-ok">🏆 '+L('Чучело на стене','On the wall')+': '+E(kgTxt(S.mnt[id]/1000))+'</p>':'')
    +'<button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div></div>';
  modal(h);$('mcard').classList.add('ua-mc');$('fiImg').appendChild(img);$('mCancel').onclick=hideModal;
  if($('fiMnt'))$('fiMnt').onclick=function(){var had=S.mnt[id]||0;buyMnt(id);if((S.mnt[id]||0)>had)fishInfo(id);};
  if($('fiGild'))$('fiGild').onclick=function(){var pr=gildPrice(id);if(S.gild[id])return;if(S.coins<pr){notEnough(pr);return;}S.coins-=pr;S.gild[id]=1;STAT.ev('spend',{k:'gild',c:pr});save();updCoins();checkAch();SND.buy();buzz(20);FX.burst(.5,.3,30,'star');
    if($('scr-alb').classList.contains('on')){var y=$('alList').scrollTop;openAlb();$('alList').scrollTop=y;}fishInfo(id);toast('🖼 '+nm(f)+': '+L('золотая рамка!','golden frame!'),2200);};};
// окно — общее (#mcard): снимаем свой класс, когда открывается любое другое
var om=modal;modal=function(){try{$('mcard').classList.remove('ua-mc');}catch(e){}return om.apply(this,arguments);};
try{if(window.__test){window.__test.openAlb=function(t){return openAlb(t);};window.__test.fishInfo=function(id){return fishInfo(id);};}}catch(e){}
window.uiAlb={species:species,legends:legends,tsars:tsarsOf};
// ?demo=alb открывает альбом до загрузки слоя — перерисовать
try{var sa=$('scr-alb');if(sa&&sa.classList.contains('on')&&albTab!=='p')openAlb();}catch(e){}
})();
