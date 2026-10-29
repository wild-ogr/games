'use strict';
(function(){var R=window.ZMGREC;if(!R||R.ui)return;
var esc=function(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return{'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});};
function pl(n,a,b,c){return typeof plural==='function'?plural(n,a,b,c):c;}
function ev(n,p){try{STAT.ev(n,p);}catch(e){}}
function snd(k){try{SND[k]();}catch(e){}}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
var T=R.T,P=R.P,BOARD=!(window.ZB2&&ZB2.off('recboard'));
function day(){return typeof todayKey==='function'?+todayKey():20260101;}
function dn(k){k=+k||0;return Math.floor(Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)/864e5);}
function wk(){return Math.floor((dn(day())+3)/7);}
function rn(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h=Math.imul(h^h>>>15,1|h);h^=h+Math.imul(h^h>>>7,61|h);return((h^h>>>14)>>>0)/4294967296;}
var CFG={park:{u:['кг','кг','кг'],mid:110,md:[70,130,170],max:300,nm:'Тележке'},samolet:{u:['парта','парты','парт'],mid:14,md:[10,20,35],nm:'Самолётике'},
stopka:{u:['учебник','учебника','учебников'],mid:20,md:[14,24,35],nm:'Стопке учебников'},skakalka:{u:['прыжок','прыжка','прыжков'],mid:30,md:[20,36,60],nm:'Скакалке'},
brys:{u:['раз','раза','раз'],mid:22,md:[15,25,35],nm:'Брысь со стола'},foto:{u:['балл','балла','баллов'],mid:80,md:[70,85,100],max:100,nm:'Фото класса'},
kompot:{u:['стакан','стакана','стаканов'],mid:12,md:[8,15,25],nm:'Компоте'},dezhur:{u:['рисунок','рисунка','рисунков'],mid:45,md:[25,42,55],nm:'Дежурном'},
klubok:{u:['буква','буквы','букв'],mid:15,md:[10,20,32],nm:'Клубке Яти'},pirozhki:{u:['пирожок','пирожка','пирожков'],mid:14,md:[10,18,25],nm:'Пирожках'}};
function cf(id){return CFG[id]||{u:['очко','очка','очков'],mid:10,md:[8,15,25]};}
function Z(){if(!S.z2r||typeof S.z2r!=='object')S.z2r={r:{},wk:0,nw:'',nd:0,nt:0};var z=S.z2r,w=wk();if(!z.r)z.r={};
if(z.wk!==w){for(var k in z.r){var t=T(z.r[k]);t.w=0;z.r[k]=P(t);}z.wk=w;}return z;}
function get(id){return T(Z().r[id]);}
function set(id,t){Z().r[id]=P(t);}
function galyaBase(id,b){var c=cf(id),g=Math.max(Math.round(c.mid*.9),Math.ceil(b*(1.05+.1*rn(id+'|g|'+day())))+1);return c.max?Math.min(c.max,g):g;}
function tick(){var z=Z(),d=day(),best=null;
for(var id in z.r){var t=T(z.r[id]);if(!t.b||t.gd>=d)continue;
if(t.b>=t.g&&rn(id+'|bk|'+d)<.65){t.g=galyaBase(id,t.b);if(t.g>t.b&&(!best||t.n>best.n))best={id:id,n:t.n};}t.gd=d;z.r[id]=P(t);}
if(best){z.nw=best.id;z.nd=d;}}
function news(){var z=Z();if(!z.nw||dn(day())-dn(z.nd)>3)return null;var t=get(z.nw);return t.g>t.b?{id:z.nw,g:t.g}:null;}
function opened(id){try{return ZMG.isOpen(id)||get(id).n>0;}catch(e){return get(id).n>0;}}
function ids(){var a=Object.keys(CFG).filter(opened);for(var k in Z().r)if(a.indexOf(k)<0&&get(k).n>0)a.push(k);return a;}
var NB={galya:['Галя с третьего','Гали',1],tamara:['Тамара из 15-й','Тамары',.92],valerka:['Валерка','Валерки',.86],lyusya:['Люся-почтальонка','Люси',.8],
semyon:['Дед Семён','деда Семёна',.62],nina:['Нина Аркадьевна','Нины Аркадьевны',.74],mityai:['Дед Митяй','деда Митяя',.68]};
var NBK=['tamara','valerka','lyusya','semyon','nina','mityai'],MD=['','🥉 Бронза','🥈 Серебро','🥇 Золото'],agN=0,agId='';
function unit(id,n){var u=cf(id).u;return n+' '+pl(n,u[0],u[1],u[2]);}
function gNow(id){var t=get(id);return t.g||galyaBase(id,t.b);}
function table(id){var t=get(id),c=cf(id),base=Math.max(t.b,Math.round(c.mid*.8)),w=wk(),out=[{who:'galya',nm:NB.galya[0],sc:gNow(id)}];
NBK.slice().sort(function(a,b){return rn(id+a)-rn(id+b);}).slice(0,3).forEach(function(k){
var s=Math.round(base*NB[k][2]*(.85+.3*rn(id+'|'+k+'|'+w)));if(c.max)s=Math.min(c.max,s);out.push({who:k,nm:NB[k][0],sc:Math.max(1,s)});});
out.push({who:'me',nm:'Ты',sc:t.b,me:true});out.sort(function(a,b){return b.sc-a.sc||(a.me?-1:b.me?1:0);});return out;}
function gap(id){var L=table(id),i=0;for(;i<L.length;i++)if(L[i].me)break;if(!i)return null;var u=L[i-1];return{who:u.who,nm:u.nm,n:u.sc-L[i].sc+1};}
function medal(id){var b=get(id).b,m=cf(id).md,k=0;for(var i=0;i<3;i++)if(b>=m[i])k=i+1;return k;}
function put(id,sc){sc=Math.max(0,Math.round(+sc||0));var t=get(id),prev=t.b,c=cf(id),z=Z();t.n++;if(sc>t.w)t.w=sc;
if(!t.g)t.g=galyaBase(id,prev);if(!t.gd)t.gd=day();var g0=t.g;if(sc>prev)t.b=sc;set(id,t);
var m=0;for(var i=0;i<3;i++)if(prev<c.md[i]&&sc>=c.md[i])m=i+1;
var L=table(id),p=1;for(var j=0;j<L.length;j++)if(L[j].me){p=j+1;break;}
var r={rec:sc>prev&&sc>0,first:!prev&&sc>0,best:t.b,prev:prev,place:p,of:L.length,gap:gap(id),medal:m,beat:prev<=g0&&sc>g0,sc:sc};
if(z.nw===id&&r.beat)z.nw='';
if(r.rec){ev('rec',{id:id,sc:sc,pl:p});note(id);}if(r.rec&&prev>0&&window.ZB2ZAP)try{ZB2ZAP.hook("rec",1,{id:id});}catch(e){}sv();return r;}
function note(id){var z=Z(),d=day();if(z.nt===d||!window.ZMG||!ZMG.giveNote)return;try{if(ZMG.Z().d.nt>=ZMG.RW().nt)return;z.nt=d;ZMG.giveNote('rec:'+id);}catch(e){}}
function tblHtml(id,n){var L=table(id),m=0;for(var i=0;i<L.length;i++)if(L[i].me)m=i;var a=0,b=L.length;if(n&&n<L.length){a=Math.max(0,Math.min(L.length-n,m-1));b=a+n;}
return'<ol class="zl-tb">'+L.slice(a,b).map(function(x,i){return'<li'+(x.me?' class="me"':'')+'><span>'+(a+i+1)+'</span><b>'+esc(x.nm)+'</b><i>'+unit(id,x.sc)+'</i></li>';}).join('')+'</ol>';}
function gameName(id){try{var i=ZMG.info(id);if(i)return i.t;}catch(e){}return id;}
function again(host,r){var id=host.id;r=r||{};var n=0;(function f(){var v=host.root&&host.root.querySelector('.zmg-res');if(v)deco(v,host,id,r);else if(++n<8)setTimeout(f,60);})();}
function deco(v,host,id,r){var p=v.querySelector('.zmg-panel');if(!p||p.querySelector('.zl-res'))return;css();var g=gap(id),bs=p.querySelector('.zmg-btns');
var h='<div class="zl-res"><p class="zl-best">'+(r.rec&&!r.first?'🏆 Новый рекорд: ':'Рекорд: ')+'<b>'+unit(id,get(id).b)+'</b>'+(r.sc!=null&&!r.rec?' · сейчас '+r.sc:'')+'</p>'+
(r.medal?'<p class="zl-md">'+MD[r.medal]+' в игре «'+esc(gameName(id))+'»!</p>':'')+
(r.beat?'<p class="zl-gap ok">Галя позади! Посмотрим, что она скажет завтра…</p>':g?'<p class="zl-gap">До '+esc(NB[g.who]?NB[g.who][1]:'соседки')+' — '+unit(id,g.n)+'. Ещё разок?</p>':'<p class="zl-gap ok">Первое место во всём подъезде!</p>')+
tblHtml(id,(window.innerHeight||800)<760?3:0)+'</div>';
if(bs)bs.insertAdjacentHTML('beforebegin',h);else p.insertAdjacentHTML('beforeend',h);
var ag=p.querySelector('[data-k="again"]'),nx=p.querySelector('[data-k="nx"]');if(!ag||!bs)return;
var nb=document.createElement('button');nb.className='btn green zl-ag';nb.setAttribute('data-k','zl-again');nb.innerHTML='↻ Ещё разок'+(host.pc?' <kbd class="zmg-kc zmg-kn">Enter</kbd>':'');
ag.parentNode.removeChild(ag);bs.insertBefore(nb,bs.firstChild);nb.onclick=function(){go(host,id);};
if(nx){nx.className='btn sec';var k=nx.querySelector('.zmg-kn');if(k)k.textContent='2';}
[].forEach.call(p.querySelectorAll('[data-k="ok"]'),function(b){b.className='btn ghost small zl-no';b.setAttribute('data-esc','1');b.innerHTML='Хватит'+(host.pc?' <kbd class="zmg-kc zmg-kn">Esc</kbd>':'');});}
function go(host,id){snd('tap');var c=window.ZMG&&ZMG.cur,op=c&&c.opt||{},o=host.o||{};agN=agId===id?agN+1:1;agId=id;ev('again',{id:id,n:agN});
ZMG.close();ZMG.open(id,{mode:o.mode==='cab'?'cab':'again',train:!!o.train,fast:true,back:op.back,next:op.next,ctx:op.ctx});}
function finish(host,x){x=x||{};var r=put(host.id,x.sc);host.finish({sc:x.sc,st:x.st,h:x.h,label:x.label});again(host,r);return r;}
function play(id,m){ev('recb',{a:'go',id:id,m:m});if(window.ZMG)ZMG.open(id,{mode:m,back:function(){ZB.refresh();}});}
function board(el){css();var L=ids(),h='<div class="zl-scr"><div class="zl-hd"><button class="btn ghost small" data-zl="back">‹ Дом</button><h2>🏅 Доска рекордов</h2></div><div class="scroll zl-list">';
if(!L.length)h+='<p class="zl-empty">Здесь будут рекорды игр на ловкость — они открываются на переменах.</p>';
L.forEach(function(id){var t=get(id),g=gap(id),md=medal(id);
h+='<div class="zl-card"><div class="zl-ct"><b>'+esc(gameName(id))+'</b>'+(md?'<span>'+MD[md]+'</span>':'')+'</div><p>Твой рекорд: <b>'+unit(id,t.b)+'</b>'+
(g?' · до '+esc(NB[g.who]?NB[g.who][1]:'соседки')+' '+unit(id,g.n):t.b?' · первое место!':'')+'</p>'+tblHtml(id)+'<button class="btn green zl-go" data-id="'+id+'">▶ Играть</button></div>';});
el.innerHTML=h+'</div></div>';
var b=el.querySelector('[data-zl="back"]');if(b)b.onclick=function(){snd('tap');ZB.go('home');};
[].forEach.call(el.querySelectorAll('.zl-go'),function(x){x.onclick=function(){snd('tap');play(x.getAttribute('data-id'),'gym');};});}
function css(){if(document.getElementById('zl-css'))return;var s=document.createElement('style');s.id='zl-css';s.textContent=
'.zl-res{margin:6px 0 4px}.zl-best,.zl-gap,.zl-md{margin:4px 0;font-size:16px;text-align:center}.zl-gap{color:#8a4b00;font-weight:600}.zl-gap.ok{color:#2b8a3e}.zl-md{font-weight:700}'+
'.zl-tb{list-style:none;margin:6px auto;padding:0;max-width:360px;font-size:15px;text-align:left}.zl-tb li{display:flex;gap:8px;align-items:center;padding:2px 8px;border-radius:8px}'+
'.zl-tb li span{width:18px;opacity:.6}.zl-tb li b{flex:1;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zl-tb li i{font-style:normal;font-weight:700;white-space:nowrap}.zl-tb li.me{background:#fff3bf}'+
'.zmg-btns .btn.zl-ag{font-size:20px;min-height:58px;flex:1 1 100%}'+
'.zl-strip{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;border:0;border-radius:16px;padding:10px 14px;margin:6px 0;background:#fff;box-shadow:0 3px 0 #ddd3bd;font:inherit;color:inherit;text-align:left;cursor:pointer}'+
'.zl-strip.zl-nw{background:#fff8e1;box-shadow:0 3px 0 #f0d58a}.zl-ic{font-size:26px}.zl-tx{flex:1;min-width:0}.zl-tx b{display:block;font-size:15px}.zl-tx small{display:block;opacity:.7;font-size:13px}.zl-strip i{font-style:normal;font-size:20px;opacity:.6}'+
'.zl-scr{display:flex;flex-direction:column;height:100%;max-width:640px;margin:0 auto}.zl-hd{display:flex;align-items:center;gap:8px;padding:8px 12px}.zl-hd h2{margin:0;font-size:20px}'+
'.zl-list{flex:1;overflow:auto;padding:0 12px 16px}.zl-card{background:#fffdf7;border-radius:16px;padding:10px 12px;margin:8px 0;box-shadow:0 2px 0 #e2dccb}'+
'.zl-ct{display:flex;justify-content:space-between;gap:8px;font-size:17px}.zl-card p{margin:4px 0;font-size:15px}.zl-card .zl-go{width:100%;min-height:48px}.zl-empty{text-align:center;opacity:.7;padding:30px 10px}'+
'@media (max-height:600px){.zl-tb{font-size:13px}.zl-tb li{padding:0 8px}.zl-best,.zl-gap,.zl-md{font-size:14px;margin:2px 0}}';
document.head.appendChild(s);}
if(BOARD){
ZB.add(ZB.homeSlots,{id:'zl-board',order:59,zone:'school',
render:function(){var nw=news(),L=ids();if(!L.length)return'';css();
return'<button class="zl-strip'+(nw?' zl-nw':'')+'" type="button"'+(nw?' data-id="'+nw.id+'"':'')+'><span class="zl-ic">'+(nw?'😤':'🏅')+'</span><span class="zl-tx"><b>'+
(nw?'Галя побила твой рекорд в «'+esc(cf(nw.id).nm||gameName(nw.id))+'»: '+nw.g+'!':'Доска рекордов')+'</b><small>'+(nw?'Отыграйся — одна партия':'кто кого в подъезде')+'</small></span><i>'+(nw?'▶':'›')+'</i></button>';},
mount:function(el){var b=el.querySelector('.zl-strip');if(!b)return;var id=b.getAttribute('data-id')||'';if(!b.__s){b.__s=1;ev('recb',{a:'show',id:id});}
b.onclick=function(){snd('tap');if(id)play(id,'home');else ZB.go('rec');};}});
ZB.screen('rec',{title:'Доска рекордов',render:function(el){board(el);}});
}
R.ui=1;R.cfg=function(id,o){CFG[id]=o;};R.CFG=CFG;R.cf=cf;R.get=get;R.tick=tick;R.news=news;R.ids=ids;R.put=put;R.table=table;R.gap=gap;R.medal=medal;R.unit=unit;R.again=again;R.finish=finish;R.play=play;R.board=board;R.galya=gNow;R.css=css;
ZB.safe('zl-tick',tick);ZB.on('home',function(){ZB.safe('zl-home',tick);});
if(R._q)for(var q in R._q)CFG[q]=R._q[q];
if(BOARD&&ids().length&&!(window.ZMG&&ZMG.busy))ZB.safe('zl-refresh',ZB.refresh);
})();
