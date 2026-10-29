'use strict';
(function(){
var W=window.Z4W,X=window.Z4WX;if(!W||!X)return;
var NF={C4:261.63,D4:293.66,E4:329.63,F4:349.23,'F#4':369.99,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33};
var MEL={bereza:'A4 A4 A4 A4 G4 F4 F4 E4 D4 A4 A4 G4 G4 F4 E4 E4 D4 E4 F4 G4 F4 E4 D4 C4 D4',
seni:'D4 F#4 F#4 E4 D4 A4 A4 B4 A4 G4 F#4 E4 D4 E4 F#4 G4 A4 G4 F#4 E4 D4'};
var VOL=[0,.06,.12];
function notes(m){return(MEL[m]||MEL.bereza).split(' ').map(function(n){return NF[n]||440;});}
function tn(f,d,v,delay){try{if(v>0&&typeof tone==='function')tone(f,d,'triangle',v,0,delay||0);}catch(e){}}
X.shows.kvart=function(sc){var L=window.Z4W_SONGS||[];if(!L.length){sc.panel('valerka','Валерка потерял тетрадку с песнями. Ищет под диваном у Яти.',[{t:'Закрыть',f:sc.close}]);return;}
var z=W.S()||{},t=W.tk(),dn=t?Math.floor(Date.UTC(Math.floor(t/10000),Math.floor(t/100)%100-1,t%100)/864e5):0,si=Math.floor(dn/7)%L.length,song=L[si];
var mel=W.F.pesnya?notes(song.mel):[],ni=0,played=[],li=0,score=0,perfect=0,lines=song.l.map(function(s){var m=/\[([а-яё]+)\]/.exec(s);return{s:s,w:m?m[1]:''};});
function vol(){return W.F.pesnya?VOL[Math.min(2,z.vol==null?2:z.vol)]:0;}
function note(){if(!mel.length)return;var f=mel[ni%mel.length];ni++;played.push(f);tn(f,.32,vol());}
function chord(){var v=vol();if(!v)return;[0,4,7].forEach(function(k,i){tn(NF.D4*Math.pow(2,k/12),.5,v*.6,i*.06);});}
function volBtn(){return W.F.pesnya?'<button class="z4w-vol" aria-label="Громкость мелодии">'+['🔇','🔉','🔊'][Math.min(2,z.vol==null?2:z.vol)]+'</button>':'';}
function mountVol(){var b=sc.el.querySelector('.z4w-vol');if(b)b.onclick=function(){z.vol=((z.vol==null?2:z.vol)+1)%3;b.textContent=['🔇','🔉','🔊'][z.vol];if(z.vol)tn(NF.A4,.2,vol());};}
function text(i,w){return W.esc(lines[i].s).replace(/\[[а-яё]+\]/,w);}
sc.panel('valerka',W.T('z4w.kvart.hi')||'Песню написал сам. Слова местами вылетели — подставь!',[{t:'Начать',f:verse}],
'<p class="z4w-ex">«'+W.esc(song.t)+'»'+(W.F.pesnya?' · буквы — ноты мелодии «'+(song.mel==='seni'?'Ах вы, сени, мои сени':'Во поле берёза стояла')+'» (народная)':'')+'</p>');
function verse(){if(li>=lines.length){end();return;}var w=lines[li].w.toUpperCase().split(''),got=0,miss=0,letters=X.shuffle(w.map(function(c,i){return{c:c,i:i};}));
sc.top((li+1)+'/'+lines.length);
var prev=lines.slice(0,li).map(function(x,i){return'<p class="z4w-ln done">'+text(i,'<b>'+W.esc(x.w)+'</b>')+'</p>';}).join('');
sc.el.innerHTML='<div class="z4w-song">'+W.face('valerka')+'<div class="z4w-lyr">'+prev+'<p class="z4w-ln cur">'+text(li,'<span class="z4w-gap">'+w.map(function(){return'<i>_</i>';}).join('')+'</span>')+'</p></div></div>'+
'<div class="z4w-tiles">'+letters.map(function(x,k){return'<button class="z4w-tile" data-k="'+k+'">'+W.esc(x.c)+'</button>';}).join('')+'</div>'+
'<div class="z4w-btns">'+volBtn()+'</div>'+(sc.pc?'<p class="z4w-hint">Можно печатать буквы на клавиатуре</p>':'');
mountVol();var gap=sc.el.querySelectorAll('.z4w-gap i'),tiles=sc.el.querySelectorAll('.z4w-tile');
function put(k){var x=letters[k],b=tiles[k];if(!b||b.disabled||got>=w.length)return;
if(x.c===w[got]){b.disabled=true;b.classList.add('ok');gap[got].textContent=x.c;got++;note();
if(got>=w.length){var ok=!miss;score+=ok?100:50;if(ok)perfect++;chord();
var p=document.createElement('p');p.className='z4w-ex';p.textContent=W.T('z4w.kvart.ok')||'Валерка: «Точно!»';sc.el.appendChild(p);
li++;setTimeout(function(){if(sc.root.parentNode)verse();},sc.calm?500:1100);}}
else{miss++;try{SND.old();}catch(e){}if(!sc.calm){b.classList.add('no');setTimeout(function(){b.classList.remove('no');},300);}}}
tiles.forEach(function(b){b.onclick=function(){put(+b.getAttribute('data-k'));};});
sc.keys(function(key){if(!tiles.length||!tiles[0].isConnected)return false;var c=String(key).toUpperCase();if(c==='Ё')c='Е';
for(var k=0;k<letters.length;k++){var lc=letters[k].c==='Ё'?'Е':letters[k].c;if(lc===c&&!tiles[k].disabled&&letters[k].c===w[got]){put(k);return true;}}
for(k=0;k<letters.length;k++){lc=letters[k].c==='Ё'?'Е':letters[k].c;if(lc===c&&!tiles[k].disabled){put(k);return true;}}return false;});}
function end(){sc.top('');sc.el.innerHTML='<div class="z4w-q"><p class="z4w-qt">Какую строчку — в стенгазету?</p></div>';
sc.el.appendChild(X.opts(sc,lines.map(function(x){return x.s.replace(/\[([а-яё]+)\]/,function(m,a){return a.toUpperCase();});}),function(i){
if(z)z.lw={i:si*10+i,w:lines[i].w,k:t};try{SND.tap();}catch(e){}
var more=(mel.length&&played.length?'<div class="z4w-btns"><button class="btn sec z4w-sing">🎵 Спеть целиком</button>'+volBtn()+'</div>':'');
X.finish(sc,'kvart',score,Math.min(6,2+perfect),'valerka',W.T('z4w.kvart.end')||'Спели! Строчку несу в стенгазету.',more);
var b=sc.el.querySelector('.z4w-sing');mountVol();if(b)b.onclick=function(){var v=vol();played.forEach(function(f,k){tn(f,.3,v,k*.28);});};}));}
sc.onClose(function(){if(li<lines.length)window.Z4&&Z4.ev('z4w',{a:'quit',id:'kvart',sc:score,t:li});});};
})();
