/* RB:UX — «звон» улова, категории редкости на карточке и в итогах, короче цепочка окон после рыбалки (буст 08.10.2026).
   - карточка улова: плашка категории (цвет RAR), рамка цвета категории, вес крупно (56 px) с прокруткой цифр, «+N 💰» крупно и монеты летят в счётчик,
     строка «Личный рекорд! Было …», от редкой и выше — вспышка цвета категории (звук прежний, в спокойном режиме вспышки и полёта нет);
   - итоги: у рыб редкой и выше — цветная подпись категории, точка категории у каждой рыбы;
   - звонок жены без лишнего касания: если «Ещё 3 заброса» не предлагается — жена говорит в облачке, через 1,6 с (или по касанию) сразу итоги.
   Данные — RAR/rarOf из js/places.js (NORTH). Механику и экономику не трогает. */
(function(){
'use strict';
if(typeof showCatch!=='function')return;
var $=function(id){return document.getElementById(id);};
function R(k){return (typeof RAR!=='undefined'&&RAR[k])||{o:0,n:'Обычная',en:'Common',c:'#9aa3a8'};}
function rk(id){try{return typeof rarOf==='function'?rarOf(id):'common';}catch(e){return 'common';}}
function loud(k){try{return typeof rarLoud==='function'?rarLoud(k):R(k).o>=2;}catch(e){return false;}}
function quiet(){try{return calm()||(typeof LOW!=='undefined'&&LOW);}catch(e){return false;}}
window.uiRarPill=function(k,small){var r=R(k);return '<span class="ui-rar'+(small?' sm':'')+' rr-'+k+'" style="--rc:'+r.c+'"><i></i>'+esc(L(r.n,r.en))+'</span>';};

/* ---------- карточка улова ---------- */
var sc=showCatch;
showCatch=function(){var pk=G&&G.pk,prev=0,id=pk&&pk.f&&pk.f.id;if(id&&S.alb[id])prev=S.alb[id].mx||0;
  var r=sc.apply(this,arguments);
  try{if(pk&&pk.f&&!pk.junk)deco(pk,prev);}catch(e){}
  return r;};
function deco(pk,prev){var box=$('catch');if(!box||!box.classList.contains('on'))return;var f=pk.f,k=rk(f.id),rr=R(k);
  box.classList.add('ui-cc');box.style.setProperty('--rc',rr.c);box.setAttribute('data-rar',k);
  var h3=box.querySelector('h3');if(h3&&!box.querySelector('.ui-rar'))h3.insertAdjacentHTML('afterend','<div class="ui-rarw">'+uiRarPill(k)+(f.rel?'<span class="ui-rar rb">📷 '+L('сфотографировал и отпустил','photo & release')+'</span>':'')+'</div>');
  var w=box.querySelector('.w'),coin=$('cCoin'),img=$('cImg');
  if(w&&coin&&img){var t=kgTxt(pk.w),sp=t.lastIndexOf(' '),num=t.slice(0,sp),unit=t.slice(sp+1);
    var big=document.createElement('div');big.className='ui-big';
    big.innerHTML='<b class="ui-kg"><span id="uiKg">'+esc(num)+'</span><small>'+esc(unit)+'</small></b><span class="ui-cn"></span>';
    big.querySelector('.ui-cn').appendChild(coin);img.parentNode.insertBefore(big,img.nextSibling);w.style.display='none';
    if(!quiet())rollKg($('uiKg'),pk.w,num);}
  // «Личный рекорд! Было …»
  if(prev&&pk.w*1000>prev&&!box.querySelector('.ui-rec')){var tg=box.querySelector('.tags');var p=document.createElement('div');p.className='ui-rec';
    p.textContent=L('Личный рекорд! Было ','Personal best! Was ')+kgTxt(prev/1000);(tg||big).parentNode.insertBefore(p,tg?tg.nextSibling:null);
    var gl=tg&&[].slice.call(tg.children).find(function(s){return /рекорд|best/i.test(s.textContent);});if(gl)gl.remove();}
  try{fotoBtn(box,pk,k);}catch(e){}
  if(window.LOOK&&LOOK.walk)try{LOOK.walk(box);}catch(e){}
  if(loud(k)&&!quiet())flash(rr.c,rr.glow||k==='legend'||k==='tsar');
  if(!quiet())setTimeout(flyCoins,350);}
/* «Фото с трофеем» (MGC, js/mg-foto.js): кнопка фото в карточке зовёт mgcFoto; Красная книга — главная кнопка «Сфотографировать и отпустить» */
function fotoBtn(box,pk,k){if(typeof window.mgcFoto!=='function')return;var f=pk.f,rb=k==='rb'||k==='redbook'||!!f.rel,p={id:f.id,w:pk.w,pi:G.pi,k:f.leg?'leg':rb?'rb':'tr',rb:rb?1:0},nx=$('cNext');
  var ph=$('cPhoto');
  if(rb&&nx){nx.innerHTML='📷 '+L('Сфотографировать и отпустить','Photo & release');nx.classList.add('ui-rbgo');
    nx.onclick=function(){SND.tap();var g=G,ok=false;try{ok=window.mgcFoto(p,function(){if(G===g&&G&&G.phase==='card')nextCast();});}catch(e){}if(!ok)nextCast();};
    if(ph)ph.remove();return;}
  if(ph){ph.innerHTML='📷 '+L('Фото с трофеем','Trophy photo');ph.onclick=function(){SND.tap();var ok=false;try{ok=window.mgcFoto(p,function(){ph.innerHTML='📷 ✓';});}catch(e){}};}}
function rollKg(el,w,fin){if(!el)return;var t0=performance.now(),D=650;
  function st(now){var p=Math.min(1,(now-t0)/D),e=1-Math.pow(1-p,3),v=w*e,t=kgTxt(Math.max(.001,v));el.textContent=p<1?t.slice(0,t.lastIndexOf(' ')):fin;if(p<1&&document.body.contains(el))requestAnimationFrame(st);}
  requestAnimationFrame(st);}
function flash(c,gold){var s=$('scr-fish');if(!s)return;var d=document.createElement('div');d.className='ui-flash'+(gold?' gold':'');d.style.setProperty('--rc',c);s.appendChild(d);setTimeout(function(){d.remove();},1100);}
function flyCoins(){var from=$('cCoin'),to=$('fCoins');if(!from||!to)return;var a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),app=$('app').getBoundingClientRect();if(!a.width||!b.width)return;
  for(var i=0;i<6;i++)(function(i){var c=document.createElement('span');c.className='ui-fly';c.innerHTML=window.LOOK&&LOOK.coin?LOOK.coin():'💰';
    c.style.left=(a.left-app.left+a.width/2-11+(i-2.5)*8)+'px';c.style.top=(a.top-app.top+a.height/2-11)+'px';$('app').appendChild(c);
    setTimeout(function(){c.style.transform='translate('+(b.left+b.width/2-a.left-a.width/2-(i-2.5)*8)+'px,'+(b.top+b.height/2-a.top-a.height/2)+'px) scale(.6)';c.style.opacity='.2';},40+i*70);
    setTimeout(function(){c.remove();try{var p=$('fCoins');if(p){p.classList.remove('ui-bump');void p.offsetWidth;p.classList.add('ui-bump');}}catch(e){}},760+i*70);})(i);}

/* ---------- итоги: категории у рыб ---------- */
var fin=finish;finish=function(){var r=fin.apply(this,arguments);try{resRar();oneAsk();}catch(e){}return r;};
// одна просьба за раз: если в итогах стоит плашка из гнезда resultSlots (Уха и т.п.) — «×2 за рекламу» не показываем (плашка может разрешить: ad:true)
function oneAsk(){var box=$('rSlots'),x2=$('rX2');if(!box||!x2)return;var on=[].slice.call(box.querySelectorAll('.slot[data-slot]')).some(function(el){var o=(window.resultSlots||[]).find(function(x){return x.id===el.dataset.slot;});return !(o&&o.ad);});
  if(on){var row=x2.parentNode;x2.remove();if(row&&row.classList.contains('row')&&!row.textContent.trim()&&!row.children.length)row.remove();}}
function resRar(){var card=$('mcard');if(!card||!$('rWin'))return;card.classList.add('ui-res');
  // крупный итог: вес и монеты — сразу под заголовком
  var cw=card.querySelector('.coins-won'),h=$('rWin'),rc=$('rCoins');
  if(cw&&h&&rc&&!card.querySelector('.ui-rsum')){var t=cw.textContent,m=/([\d.,]+\s*(?:кг|г|kg|g))/.exec(t);var sm=document.createElement('div');sm.className='ui-rsum';
    sm.innerHTML='<b class="ui-rkg">'+(m?esc(m[1]):'')+'</b><span class="ui-rcn"></span>';sm.querySelector('.ui-rcn').appendChild(rc);h.parentNode.insertBefore(sm,h.nextSibling);cw.style.display='none';}
  // прогноз на завтра — одной строкой-кнопкой
  var fo=card.querySelector('.fbrf');if(fo&&!fo.classList.contains('ui-fo')){fo.classList.add('ui-fo');try{var o=a3Fore(dayNum()+1);if(o)fo.innerHTML='🔮 <b>'+L('Завтра','Tomorrow')+':</b> '+a3ForeTxt(o,true)+' <i class="ui-chev">›</i>';if(window.LOOK&&LOOK.walk)LOOK.walk(fo);}catch(e){}fo.setAttribute('role','button');fo.onclick=function(){SND.tap();openFore(function(){hideModal();});};}
  card.querySelectorAll('.lkfi[data-f]').forEach(function(e){var k=rk(e.dataset.f),rr=R(k),td=e.parentNode;if(!td||td.querySelector('.ui-rd'))return;
    e.style.setProperty('--rc',rr.c);e.classList.add('ui-rf');
    var d=document.createElement('i');d.className='ui-rd';d.style.background=rr.c;d.title=L(rr.n,rr.en);td.insertBefore(d,e.nextSibling);
    if(rr.o>=2){var s=document.createElement('span');s.className='ui-rl';s.style.color=rr.c;s.textContent=L(rr.n,rr.en);var br=td.querySelector('small');td.insertBefore(s,br||null);}});}

/* ---------- звонок жены — без лишнего окна ---------- */
var es=endSession;
endSession=function(){try{if(G&&!G.over){var canExtra=!G.tourn&&!G.extra&&adOk()&&(S.sessions||0)>=3&&(S.sessions||0)%2===0&&!interSoon();
    if(!canExtra){G.phase='done';hint('');SND.phone();buzz([100,80,100]);var g=G,done=false;
      say('wife',pick(PH.wife),2600);var e=$('say');if(e)e.classList.add('ui-wife');
      var go=function(){if(done)return;done=true;document.removeEventListener('pointerdown',tap,true);if(e)e.classList.remove('ui-wife');if(G===g&&!g.over){e&&e.classList.remove('on');finish();}};
      var tap=function(){go();};setTimeout(function(){document.addEventListener('pointerdown',tap,true);},250);
      setTimeout(go,1600);return;}}}catch(err){}
  return es.apply(this,arguments);};
})();
