'use strict';
(function(){
var X=window.Z4M;if(!X||X.render)return;
var esc=X.esc,snd=X.snd,T=X.T,hh=X.hh,Z=X.Z,ev=X.ev;
function rnd(n){return Math.random()*n|0;}
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function any(k,def){var L=T(k);return L.length?L[rnd(L.length)]:def||'';}
function fill(s,o){return String(s||'').replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?String(o[k]):m;});}
function name(){return X.nm()||'внучек';}
function zina(m){try{return zinaSVG(m||'happy');}catch(e){return'';}}
function say(t,m){return'<div class="z4m-say"><span class="z4m-av">'+zina(m)+'</span><p>'+esc(t)+'</p></div>';}
function hdr(t,back){return'<div class="z4m-hd"><button type="button" class="btn ghost small z4m-back">‹ '+(back==='paper'?'Газета':'Двор')+'</button><b>'+esc(t)+'</b></div>';}
function bindBack(el,op){[].forEach.call(el.querySelectorAll('.z4m-back,.z4m-home'),function(b){b.onclick=function(){snd();if(op&&op.back==='paper')try{ZB.go('z3paper',{});return;}catch(e){}X.home();};});}
function share(k,txt){ev('share',{k:k});try{if(window.SHR&&SHR.post){SHR.post(txt,{k:'z4m'});return;}}catch(e){}X.tst('Не вышло — попробуй позже');}
function page(el,op,title,body){css();el.innerHTML='<div class="z4m-scr">'+hdr(title,op.back)+'<div class="z4m-body">'+body+'</div></div>';bindBack(el,op);return el.querySelector('.z4m-body');}
var V={};
X.render=function(el,op){op=op||{};var v=op.v;if(!V[v]){X.home();return;}V[v](el,op);};
var NM=['Анечка','Танечка','Леночка','Светочка','Ниночка','Оленька','Людочка','Наташенька','Ирочка','Валечка','Любочка','Надюша',
'Сашенька','Серёжа','Володя','Миша','Коля','Витя','Толя','Юра'];
var BAD=/(дура|дурак|дебил|идиот|урод|тварь|козел|козёл|скотин|жоп|хрен|черт|чёрт|сволоч|гад)/i;
function okName(s){s=String(s||'').replace(/\s+/g,' ').trim();if(!/^[А-Яа-яЁё][А-Яа-яЁё\- ]{1,15}$/.test(s)||BAD.test(s))return'';
var bad=0;s.toLowerCase().split(/[\s-]+/).forEach(function(w){if(w&&!X.clean(w)&&w.length>=3)bad=1;});if(bad)return'';
return s.charAt(0).toUpperCase()+s.slice(1);}
V.nm=function(el,op){var b=page(el,op,'Как тебя звать?','');
b.innerHTML=say(any('z4m.nmq','Сорок лет по журналу всех звала. А тебя — не знаю. Непорядок.'),'think')+
'<div class="z4m-nl">'+NM.map(function(n){return'<button type="button" class="z4m-nb" data-n="'+esc(n)+'">'+esc(n)+'</button>';}).join('')+'</div>'+
'<label class="z4m-lab">Или своё имя<input id="z4mIn" class="z4m-in" maxlength="16" autocomplete="off"></label><p class="z4m-msg" id="z4mMsg"></p>'+
'<button type="button" class="btn green" id="z4mOwn">Так и зови</button>'+
'<div class="z4m-row"><button type="button" class="btn ghost" id="z4mNo">Не называй по имени</button><button type="button" class="btn ghost" id="z4mLater">Потом</button></div>'+
'<p class="z4m-sm">Имя знает только Зина: другим игрокам его не видно.</p>';
function done(n,s){var z=Z(),m=S.z3m;if(m&&typeof m==='object')m.nm=n.slice(0,20);z.nq=1;z.nn=0;X.sv();ev('nm',{s:s});
b.innerHTML=say(fill(any('z4m.nmok','{name}! Запишу в журнал. Карандашом — вдруг передумаешь.'),{name:n}),'happy')+'<button type="button" class="btn green z4m-home">Хорошо, бабуль!</button>';bindBack(el,{});}
[].forEach.call(b.querySelectorAll('.z4m-nb'),function(x){x.onclick=function(){snd();done(x.getAttribute('data-n'),'list');};});
el.querySelector('#z4mOwn').onclick=function(){snd();var n=okName(el.querySelector('#z4mIn').value);if(!n){el.querySelector('#z4mMsg').textContent='Такого имени в журнале не бывает. Перепиши, а?';return;}done(n,'own');};
el.querySelector('#z4mNo').onclick=function(){snd();var z=Z();z.nn=1;z.nq=1;X.sv();ev('nm',{s:'no'});
b.innerHTML=say(any('z4m.nmno','Как скажешь. Буду звать «внучек». Валерку я тоже по имени не звала.'),'norm')+'<button type="button" class="btn green z4m-home">Хорошо</button>';bindBack(el,{});};
el.querySelector('#z4mLater').onclick=function(){snd();Z().nq=X.tk();X.sv();ev('nm',{s:'later'});X.home();};};
function vnItem(){var L=T('z4m.vn'),z=Z();if(!L.length)return null;var p=String(L[(+z.vk||0)%L.length]).split('|');
return{sl:p[0],a:String(p[1]||'').toUpperCase().replace(/[^А-ЯЁ]/g,''),t:p[2]||'',z:p[3]||''};}
V.vn=function(el,op){var b=page(el,op,'Бабушкин переводчик',''),it=vnItem(),z=Z(),t=X.tk();
if(!it||!it.a){b.innerHTML=say('Тёма ушёл гулять. Переводить некого.','norm');return;}
if(z.vd===t||!X.visit()){b.innerHTML=say(z.vd===t?'На сегодня Тёма всё сказал. Завтра снова будет говорить загадками.':'Тёма уехал домой. Приедет на выходные — бери словарь.','happy')+
'<button type="button" class="btn green z4m-home">Во двор</button>';bindBack(el,op);return;}
var A=it.a.split(''),tiles=shuf(A),pos=[];if(tiles.join('')===it.a&&A.length>1)tiles=tiles.slice(1).concat(tiles[0]);
b.innerHTML='<div class="z4m-tm"><span class="z4m-tf">👦</span><p>Тёма: «Ба, это прям <b>'+esc(it.sl)+'</b>».</p></div>'+
say('Внучек, переведи. Что это по-нашему? '+A.length+' '+(A.length<5?'буквы':'букв')+'.','think')+
'<div class="z4m-slots"></div><div class="z4m-tiles"></div><p class="z4m-msg"></p>'+
'<div class="z4m-row"><button type="button" class="btn ghost z4m-clr">⌫ Стереть</button><button type="button" class="btn ghost z4m-give">Сдаюсь</button></div>';
var sl=b.querySelector('.z4m-slots'),tl=b.querySelector('.z4m-tiles'),msg=b.querySelector('.z4m-msg');
function draw(){sl.innerHTML=A.map(function(c,i){return'<i class="z4m-sl">'+(pos[i]!=null?esc(tiles[pos[i]]):'')+'</i>';}).join('');
tl.innerHTML=tiles.map(function(c,i){return'<button type="button" class="z4m-tl"'+(pos.indexOf(i)>=0?' disabled':'')+' data-i="'+i+'">'+esc(c)+'</button>';}).join('');
[].forEach.call(tl.querySelectorAll('.z4m-tl'),function(x){x.onclick=function(){snd();pos.push(+x.getAttribute('data-i'));draw();check();};});}
function fin(ok){var z=Z();z.vd=X.tk();z.vk=(+z.vk||0)+1;if(ok)z.vn=(+z.vn||0)+1;X.sv();ev('vn',{r:ok?'ok':'give',n:+z.vn||0});var c=ok?X.give(5):0;
b.innerHTML='<div class="z4m-tm"><span class="z4m-tf">👦</span><p>'+esc(ok?any('z4m.vnok','Ба, ты топ! Ой. Бабушка, вы молодец.'):any('z4m.vnno','Ба, это «'+it.a.toLowerCase()+'». Ну ты чего.'))+'</p></div>'+
'<p class="z4m-ans">'+esc(it.sl)+' = <b>'+esc(it.a)+'</b></p>'+(it.t?'<div class="z4m-tm"><span class="z4m-tf">👦</span><p>'+esc(it.t)+'</p></div>':'')+
(it.z?say(it.z,'happy'):'')+(c?'<p class="z4m-sm">+'+c+' <span class="coin"></span> от Зины за перевод</p>':'')+
'<button type="button" class="btn green z4m-home">'+(op.back==='paper'?'В газету':'Во двор')+'</button>';bindBack(el,op);}
function check(){if(pos.length<A.length)return;var w=pos.map(function(i){return tiles[i];}).join('');
if(w===it.a){fin(true);return;}msg.textContent='Тёма: «Не, ба, не то». Сотри и попробуй ещё.';}
b.querySelector('.z4m-clr').onclick=function(){snd();pos.pop();msg.textContent='';draw();};
b.querySelector('.z4m-give').onclick=function(){snd();fin(false);};draw();};
function chapters(){var L=String(Z().mw||'').split(',').filter(Boolean),M=T('z4m.mem'),n0=Math.max(0,(+Z().mc||0)-L.length);
return L.map(function(w,i){var t=M.length?M[hh('m'+w)%M.length]:'Слово «{w}» я помню с первого урока.';return{n:n0+i+1,w:w,t:fill(t,{w:w,W:w.toUpperCase()})};});}
function memHtml(){var C=chapters();if(!C.length)return say('Пока пишу предисловие. Найди длинное слово — будет первая глава.','think');
return say(any('z4m.memh','Пишу мемуары. Мой спросил, будет ли он там. Будет. В сносках.'),'happy')+'<div class="z4m-book"><h3>Моя жизнь</h3><p class="z4m-sm">мемуары бабы Зины · глав: '+C.length+'</p>'+
C.slice().reverse().map(function(c){return'<div class="z4m-ch"><h4>Глава '+c.n+'. '+esc(c.w.toUpperCase())+'</h4><p>'+esc(c.t)+'</p>'+
'<button type="button" class="btn ghost small z4m-shm" data-n="'+c.n+'">✉️ Переслать страницу</button></div>';}).join('')+'</div>';}
function memBind(box){[].forEach.call(box.querySelectorAll('.z4m-shm'),function(x){x.onclick=function(){snd();var n=+x.getAttribute('data-n'),C=chapters();
for(var i=0;i<C.length;i++)if(C[i].n===n){share('mem','Из мемуаров бабы Зины. Глава '+n+'. '+C[i].w.toUpperCase()+'.\n'+C[i].t);return;}};});}
function memRead(){var z=Z();if((+z.mv||0)<(+z.mc||0)){z.mv=+z.mc||0;X.sv();}ev('memo',{n:+z.mc||0});}
V.mem=function(el,op){var b=page(el,op,'Мемуары Зины','');b.innerHTML=memHtml();memBind(b);memRead();};
function three(k,salt){var L=T(k),n=L.length,o=[],s=hh(salt+X.tk());if(!n)return o;for(var i=0;i<n&&o.length<3;i++){var j=(s+i*7)%n;if(o.indexOf(j)<0)o.push(j);}return o;}
V.fut=function(el,op){var b=page(el,op,'Письмо в будущее',''),z=Z();
if(+z.fs===1){var left=Math.max(0,30-Z3.days(z.ft,X.tk()));b.innerHTML=say('Письмо запечатано и лежит в комоде. Люся принесёт его через '+left+' '+(left%10===1&&left%100!==11?'день':left%10>=2&&left%10<=4&&(left%100<12||left%100>14)?'дня':'дней')+'. Не подглядывай.','happy')+
'<button type="button" class="btn green z4m-home">Во двор</button>';bindBack(el,op);return;}
var lv=Math.ceil(((+S.lv||0)+40)/10)*10,G=[['z4m.fa','Как начнём?'],['z4m.fb','Что обещаем?'],['z4m.fc','Что пожелаем?']],sel=[-1,-1,-1];
b.innerHTML=say('Напиши письмо себе. Я его спрячу и через месяц вручу. Посмотрим, что ты обещаешь.','think')+
G.map(function(g,gi){return'<p class="z4m-q">'+esc(g[1])+'</p><div class="z4m-vo">'+three(g[0],'g'+gi).map(function(i){
return'<button type="button" class="z4m-vb" data-g="'+gi+'" data-i="'+i+'">'+esc(String(T(g[0])[i]).replace(/\{lv\}/g,lv))+'</button>';}).join('')+'</div>';}).join('')+
'<button type="button" class="btn green z4m-seal" disabled>Запечатать ✉️</button>';
var seal=b.querySelector('.z4m-seal');
[].forEach.call(b.querySelectorAll('.z4m-vb'),function(x){x.onclick=function(){snd();var g=+x.getAttribute('data-g');sel[g]=+x.getAttribute('data-i');
[].forEach.call(b.querySelectorAll('.z4m-vb[data-g="'+g+'"]'),function(y){y.classList.toggle('on',y===x);});seal.disabled=sel.indexOf(-1)>=0;};});
seal.onclick=function(){if(sel.indexOf(-1)>=0)return;snd();var z=Z();z.fs=1;z.ft=X.tk();z.fg=lv;z.fl=+S.lv||0;z.fp=sel.join(',');z.fw=0;X.sv();ev('fut',{s:'seal',g:lv});
b.innerHTML=say(any('z4m.fw','Запечатала. Через тридцать дней Люся принесёт. Сама не знаю, что там. Знаю.'),'happy')+'<button type="button" class="btn green z4m-home">Во двор</button>';bindBack(el,op);};};
function essay(W){var w=shuf(W),S0=shuf(T('z4m.sos')),t=any('z4m.sot','Как я провёл лето'),L=[],i;
if(!S0.length)S0=['Летом главное — это {w}.','Мама говорит, что {w} — не игрушка.','А ещё у нас есть {w}. Бабушка говорит, к счастью.'];
for(i=0;i<3;i++)L.push(fill(S0[i%S0.length],{w:w[i%w.length],W:w[i%w.length].toUpperCase()}));
return{t:fill(t,{w:w[3%w.length]||w[0],W:(w[3%w.length]||w[0]).toUpperCase()}),b:L,v:any('z4m.sov','5 за фантазию, 2 за смысл.')};}
function chep(W){var w=shuf(W),t=any('z4m.chep','Здравствуй, {1}! У нас всё хорошо: {2} растёт, {3} стоит. Приезжай.'),o={};
for(var i=1;i<=4;i++)o[i]=w[(i-1)%w.length];return{b:fill(t,o),v:any('z4m.chepv','Отправлять не буду. Галя на почте прочитает и поверит.')};}
function ov(inner){css();var d=document.createElement('div');d.className='z4m-ov';d.innerHTML='<div class="z4m-ovb"><button type="button" class="z4m-x" aria-label="закрыть">✕</button>'+inner+'</div>';
document.body.appendChild(d);function close(){snd();if(d.parentNode)d.parentNode.removeChild(d);}
d.querySelector('.z4m-x').onclick=close;d.onclick=function(e){if(e.target===d)close();};return d;}
X.ovo=function(k,o){if(k==='mem'){var d0=ov('<div class="z4m-ovc">'+memHtml()+'</div>');memBind(d0);memRead();return;}
var W=(o.w||[]).filter(X.clean);if(W.length<2)W=W.concat(['кот','пирог','скамейка']);var mode='so',sn=0,d=ov('<div class="z4m-ovc"></div>'),c=d.querySelector('.z4m-ovc'),txt='';
function draw(){var h;if(mode==='so'){var e=essay(W);txt='Сочинение «'+e.t+'»\n'+e.b.join(' ')+'\n— '+e.v;
h='<div class="z4m-ess"><h3>'+esc(e.t)+'</h3><p>'+e.b.map(esc).join(' ')+'</p><p class="z4m-red">'+esc(e.v)+'</p></div>';}
else{var p=chep(W);txt=p.b+'\n— '+p.v;h='<div class="z4m-ess z4m-let"><p>'+esc(p.b)+'</p></div>'+say(p.v,'happy');}
c.innerHTML='<p class="z4m-sm">'+(mode==='so'?'Сочинение из твоих слов, уровень '+(o.lv||'')+':':'«Чепуха» — письмо, где пропуски — твои слова:')+'</p>'+h+
'<div class="z4m-row"><button type="button" class="btn ghost z4m-again">🔄 Ещё</button><button type="button" class="btn ghost z4m-alt">'+(mode==='so'?'✉️ Чепуха':'📝 Сочинение')+'</button></div>'+
'<button type="button" class="btn ghost small z4m-sh">Переслать другу</button>';
c.querySelector('.z4m-again').onclick=function(){snd();draw();};
c.querySelector('.z4m-alt').onclick=function(){snd();mode=mode==='so'?'chep':'so';ev('so',{k:mode});draw();};
c.querySelector('.z4m-sh').onclick=function(){snd();share(mode,txt);};
if(!sn++){var z=Z();z.sn=(+z.sn||0)+1;X.sv();}}
draw();};
var c0=0;function css(){if(c0)return;c0=1;var s=document.createElement('style');s.setAttribute('data-z4mx','1');s.textContent=
'.z4m-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--z3-paper,#fbf7ec);border-bottom:2px solid var(--z3-line,#e6dcc8)}.z4m-hd b{font-size:18px}.z4m-back{min-height:44px;white-space:nowrap}'+
'.z4m-body{flex:1 1 auto;overflow-y:auto;padding:12px 16px 24px;max-width:620px;width:100%;margin:0 auto;box-sizing:border-box;font-size:16px;line-height:1.45}'+
'.z4m-body>.btn,.z4m-ovc>.btn{min-height:46px;margin:12px auto 0;display:block}.z4m-sm{font-size:14px;color:var(--z3-ink2,#5d6781)}'+
'.z4m-say{display:flex;gap:10px;align-items:flex-start;margin:10px 0}.z4m-av{flex:0 0 64px;width:64px;height:64px}.z4m-av svg{width:64px;height:64px}'+
'.z4m-say p,.z4m-tm p{margin:0;background:var(--z3-card,#fff);border-radius:12px;padding:10px 12px;box-shadow:var(--z3-shadow)}'+
'.z4m-tm{display:flex;gap:10px;align-items:flex-start;margin:10px 0;flex-direction:row-reverse}.z4m-tf{flex:0 0 52px;font-size:44px;line-height:52px;text-align:center}'+
'.z4m-nl{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.z4m-nb,.z4m-vb{min-height:46px;font-size:16px;border-radius:12px;border:2px solid var(--z3-line,#e6dcc8);background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);padding:6px 12px;font-family:inherit;cursor:pointer}'+
'.z4m-vo{display:flex;flex-direction:column;gap:8px;margin:6px 0 10px}.z4m-vb{text-align:left}.z4m-vb.on{border-color:var(--z3-acc,#c2410c);font-weight:700}.z4m-q{margin:12px 0 4px;font-weight:700}'+
'.z4m-lab{display:block;margin:10px 0 0;font-size:15px}.z4m-in{display:block;width:100%;box-sizing:border-box;min-height:46px;font-size:17px;border-radius:12px;border:2px solid var(--z3-line,#e6dcc8);padding:6px 10px;margin-top:4px;font-family:inherit}'+
'.z4m-msg{min-height:20px;margin:6px 0;color:var(--z3-red,#b42318);font-size:15px}.z4m-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}.z4m-row .btn{min-height:46px}'+
'.z4m-slots{display:flex;justify-content:center;gap:6px;margin:12px 0}.z4m-sl{width:40px;height:46px;border-bottom:3px solid var(--z3-ink,#27324a);font:700 26px/46px var(--z3-font-head,inherit);text-align:center;font-style:normal}'+
'.z4m-tiles{display:flex;justify-content:center;flex-wrap:wrap;gap:8px}.z4m-tl{width:48px;height:48px;font:700 24px var(--z3-font-head,inherit);border-radius:12px;border:2px solid var(--z3-line,#e6dcc8);background:var(--z3-paper,#fbf7ec);color:var(--z3-ink,#27324a);cursor:pointer}'+
'.z4m-tl[disabled]{opacity:.35}.z4m-ans{text-align:center;font-size:20px;margin:10px 0}'+
'.z4m-book{background:var(--z3-paper,#fbf7ec);border:1px solid var(--z3-line,#e6dcc8);border-radius:8px;padding:12px 14px;box-shadow:var(--z3-shadow)}.z4m-book h3{margin:0;font:700 24px var(--z3-font-head,inherit);text-align:center}'+
'.z4m-ch{border-top:1px solid var(--z3-line,#e6dcc8);padding:8px 0}.z4m-ch h4{margin:4px 0;font-size:16px}.z4m-ch p{margin:4px 0;font-family:var(--z3-font-hand,inherit);font-size:19px;line-height:1.45}.z4m-ch .btn{min-height:44px}'+
'.z4m-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9000;background:rgba(20,24,36,.55);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}'+
'.z4m-ovb{position:relative;background:var(--z3-bg,#f6efe3);color:var(--z3-ink,#27324a);border-radius:16px;max-width:560px;width:100%;max-height:100%;overflow-y:auto;padding:14px 14px 16px;box-sizing:border-box;font-size:16px;line-height:1.45}'+
'.z4m-x{position:absolute;right:6px;top:6px;width:44px;height:44px;border:0;background:transparent;font-size:22px;color:var(--z3-ink,#27324a);cursor:pointer}'+
'.z4m-ess{background:var(--z3-paper,#fbf7ec);border:1px solid var(--z3-line,#e6dcc8);border-radius:6px;padding:12px 14px;font-family:var(--z3-font-hand,inherit);font-size:20px;line-height:1.5;box-shadow:var(--z3-shadow)}'+
'.z4m-ess h3{margin:0 0 6px;text-align:center;font-size:21px}.z4m-ess p{margin:4px 0}.z4m-red{color:var(--z3-red,#b42318);transform:rotate(-1deg)}';
document.head.appendChild(s);}
})();
