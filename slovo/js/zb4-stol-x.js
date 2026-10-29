'use strict';
(function(){
var L=window.Z4L;if(!L||window.Z4LX)return;
var esc=L.esc,cur=null;
function pc(){try{return!!(window.ZMG&&ZMG.pc&&ZMG.pc());}catch(e){return false;}}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function hold(t){t=String(t||'');var n=t.length;return t.indexOf('😂')>=0?Math.min(30000,8000+200*n):Math.min(20000,5000+120*n);}
function scene(id){if(cur)cur.close();var g=L.G4[id],root=document.createElement('div');root.id='z4lHost';root.className='z4l z4l-'+id+(calm()?' z4l-calm':'')+(pc()?' z4l-pc':'');
root.innerHTML='<div class="z4l-head"><span class="z4l-ic">'+g.ic+'</span><b class="z4l-nm">'+esc(g.t)+'</b><span class="z4l-top"></span>'+
'<button class="z4l-xb" aria-label="Закрыть">✕</button></div><div class="z4l-el"></div>';
document.body.appendChild(root);var qs=[],ks=[],dead=0,said=0,sayT=0;
var sc={id:id,root:root,el:root.querySelector('.z4l-el'),pc:pc(),calm:calm(),done:0,
top:function(t){root.querySelector('.z4l-top').textContent=t==null?'':String(t);},
onClose:function(f){qs.push(f);},keys:function(f){ks.unshift(f);},
close:function(){if(dead)return;dead=1;if(cur===sc)cur=null;document.removeEventListener('keydown',kd,true);root.remove();
qs.forEach(function(f){try{f();}catch(e){console.error(e);}});if(!sc.done)Z4.ev('z4l',{a:'quit',id:id});try{ZB.refresh&&ZB.refresh();}catch(e){}},
dead:function(){return dead;},
say:function(who,t,m){return'<div class="z4l-say"><span class="z4l-sf">'+L.face(who,m)+'</span><p class="z4l-sb">'+esc(t)+'</p></div>';},
talk:function(el,who,t,force){if(!el||!t)return;var w=Date.now()-said;function put(){if(dead)return;said=Date.now();sayT=hold(t);el.innerHTML=sc.say(who,t);}
if(force||w>=sayT)put();else setTimeout(put,Math.min(sayT-w,4000));},
panel:function(who,t,btns,extra){var d=document.createElement('div');d.className='z4l-panel';
d.innerHTML=sc.say(who,t)+(extra||'')+'<div class="z4l-btns">'+btns.map(function(b,i){return'<button class="btn '+(b.cls||'green')+'" data-i="'+i+'">'+esc(b.t)+
(sc.pc&&i<9?' <kbd class="z4l-kc">'+(btns.length>1?i+1:'Enter')+'</kbd>':'')+'</button>';}).join('')+'</div>';
sc.el.innerHTML='';sc.el.appendChild(d);var used=0;
function hit(i){if(used||!btns[i])return;used=1;try{SND.tap();}catch(e){}btns[i].f();}
d.querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){hit(+b.getAttribute('data-i'));};});
sc.keys(function(k){if(used||!d.parentNode)return false;if(k==='Enter'&&btns.length===1){hit(0);return true;}if(/^[1-9]$/.test(k)&&btns.length>1){hit(+k-1);return true;}return false;});
return d;}};
function kd(e){if(dead)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();sc.close();return;}
for(var i=0;i<ks.length;i++){var r=false;try{r=ks[i](e.key,e);}catch(x){console.error(x);}if(r){e.preventDefault();e.stopPropagation();return;}}}
document.addEventListener('keydown',kd,true);
root.querySelector('.z4l-xb').onclick=function(){try{SND.tap();}catch(e){}sc.close();};
cur=sc;return sc;}
var WL=null;
function dictOk(){try{return typeof dictReady==='function'&&dictReady();}catch(e){return false;}}
function isW(w){try{return w.length>=3&&typeof isWord==='function'&&isWord(w);}catch(e){return false;}}
function words(){if(WL)return WL;if(!dictOk())return[];var a=[],seen={};
[typeof DICT_MAIN==='string'?DICT_MAIN:'',typeof DICT_EXTRA==='string'?DICT_EXTRA:''].forEach(function(s){s.split(' ').forEach(function(w){
if(w.length>=3&&w.length<=8&&!seen[w]&&/^[а-я]+$/.test(w)){seen[w]=1;a.push(w);}});});
WL=a.filter(isW);return WL;}
function cnt(w){var o={};for(var i=0;i<w.length;i++)o[w[i]]=(o[w[i]]||0)+1;return o;}
function fits(w,have){var c={},i,ch;for(i=0;i<w.length;i++){ch=w[i];c[ch]=(c[ch]||0)+1;if(c[ch]>(have[ch]||0))return false;}return true;}
function dict(){return new Promise(function(ok,no){var t0=Date.now();(function w(){if(dictOk())return ok();if(Date.now()-t0>20000)return no(new Error('dict'));
try{if(typeof ensureDict==='function')ensureDict();}catch(e){}setTimeout(w,300);})();});}
var V={а:1,б:3,в:2,г:3,д:2,е:1,ж:5,з:5,и:1,й:4,к:2,л:2,м:2,н:1,о:1,п:2,р:2,с:2,т:2,у:3,ф:10,х:5,ц:5,ч:5,ш:8,щ:10,ъ:10,ы:4,ь:3,э:8,ю:8,я:3};
var FR={а:8,б:2,в:4,г:2,д:3,е:8,ж:1,з:2,и:6,й:1,к:4,л:4,м:3,н:5,о:9,п:3,р:5,с:5,т:5,у:3,ф:1,х:1,ц:1,ч:1,ш:1,щ:1,ы:2,ь:2,э:1,ю:1,я:2};
var VOW='аеиоуыэюя';
function rng(seed){var a=seed>>>0||1;return function(){a=(a*1664525+1013904223)>>>0;return a/4294967296;};}
function pick(r,vow){var s=0,k,x;for(k in FR)if(vow==null||(VOW.indexOf(k)>=0)===vow)s+=FR[k];x=r()*s;
for(k in FR)if(vow==null||(VOW.indexOf(k)>=0)===vow){x-=FR[k];if(x<0)return k;}return'а';}
function bag(n,r){var a=[],k;r=r||Math.random;for(k in FR)for(var i=0;i<FR[k];i++)a.push(k);while(a.length<n)a=a.concat(a);shuffle(a,r);return a.slice(0,n);}
function shuffle(a,r){r=r||Math.random;for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pl(n,a,b,c){return typeof plural==='function'?plural(n,a,b,c):c;}
function coinTxt(c){return c?' · +'+c+' '+(typeof COIN_I!=='undefined'?COIN_I:'монет'):'';}
function finish(sc,id,o,who,text,more){sc.done=1;var c=L.fin(id,o);try{if(window.SND)(c?SND.coin:SND.win)();}catch(e){}sc.top('');
sc.panel(who,text,[{t:'Ещё партию',f:function(){run(id);}},{t:'Закрыть',cls:'',f:function(){sc.close();}}],
'<p class="z4l-res">'+(more||'')+coinTxt(c)+'</p>');}
function run(id){var f=window.Z4LX.games[id];if(!f)return null;var sc=scene(id);
sc.el.innerHTML='<p class="z4l-wait">Раскладываем буквы…</p>';
dict().then(function(){if(sc.dead())return;try{f(sc);}catch(e){console.error(e);sc.close();}},function(){if(sc.dead())return;
sc.panel('zina','Словарь не догрузился — проверь интернет и зайди ещё раз.',[{t:'Закрыть',f:function(){sc.close();}}]);});return sc;}
window.Z4LX={games:{},scene:scene,run:run,finish:finish,hold:hold,isW:isW,words:words,cnt:cnt,fits:fits,V:V,VOW:VOW,pick:pick,bag:bag,shuffle:shuffle,rng:rng,pl:pl,esc:esc};
})();
