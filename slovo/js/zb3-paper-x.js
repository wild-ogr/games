'use strict';
(function(){
var P=window.Z3PAPER;if(!P||P.ui)return;
var Z=P.Z,BIT=P.BIT,DOW=P.DOW,ev=P.ev,E0=20260105,N0=20261023,REW=10,AR_REW=3,AR_DAY=5;
var MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
var WDN=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
var RN={sv:'Связи у Зины',sh:'Шифровка',rp:'Красная ручка',fw:'Филворд',vy:'Вышивка',bb:'Барабан',sk:'Сканворд деда Семёна',zg:'Зина загадала',ef:'10 слов вечера'};
var RI={sv:'🧩',sh:'🔢',rp:'🖍',fw:'🔤',vy:'🧵',bb:'🎡',sk:'📰',zg:'🟩',ef:'📻'};
var RS={sv:'Разложи 16 слов на 4 кучки',sh:'Цифры вместо букв — открой шутку',rp:'Найди ошибку в объявлении',fw:'Найди слова темы и главное слово',
vy:'Вышей картинку по числам',bb:'Крути барабан, угадывай слово',sk:'Большой сканворд на выходные',zg:'Угадай слово дня за 6 попыток',ef:'Эфир с 19 до 22 — десять вопросов'};
var ZMGID={bb:'baraban',sk:'vecherka',zg:'zagadala'};
RN.ff='Праздничный филворд';RI.ff='🎉';RS.ff='Тема — к празднику';RN.pe='Золотое перо';RI.pe='🖋';
var FSP={ny:'праздник',sep1:'перемена',uch:'перемена',may:'дачница',mas:'чаепитие',mar:'застолье',feb23:'рыбалка',hw:'грибник'};
function festKey(){var d=D(),fe=d&&d.fe||{},L=[];try{L=Z3.fest?Z3.fest():[];}catch(e){}for(var i=0;i<L.length;i++)if(fe[L[i]])return L[i];return'';}
function festTx(k,part){var d=D(),x=d&&d.fe&&d.fe[k]&&d.fe[k][part];if(!x||!x.length)return'';return x[h32(k+tk())%x.length];}
function D(){return window.Z3PD||null;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function snd(){try{SND.tap();}catch(e){}}
function sv(){try{save();}catch(e){}}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function tk(){return Z3.tk();}
function now(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}}
function hour(){return new Date(now()).getHours();}
function dnOf(k){return Z3.days(E0,k||tk());}
function keyOf(dn){var d=new Date(Date.UTC(2026,0,5)+dn*864e5);return d.getUTCFullYear()*1e4+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function today(){return dnOf();}
function issueNo(k){return Math.max(1,Z3.days(N0,k||tk()));}
function dateTxt(k){return(k%100)+' '+MON[Math.floor(k/100)%100-1];}
function dowOf(dn){return((dn%7)+8)%7;}
function rubOf(dn){return DOW[dowOf(dn)];}
function h32(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuf(L,r){L=L.slice();for(var i=L.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=L[i];L[i]=L[j];L[j]=t;}return L;}
function coin(){try{return COIN_I;}catch(e){return'💰';}}
function lsG(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function give(n){var k=0;try{if(window.ZBECO&&ZBECO.give)k=ZBECO.give('z3p',n,'mg');else if(typeof addCoins==='function'){addCoins(n,'mg');k=n;}}catch(e){}
try{if(typeof updCoins==='function')updCoins();}catch(e){}return k;}
function zina(m){try{return zinaSVG(m||'happy');}catch(e){return'';}}
function srvGet(kind,q){try{return Z3.srv.get(kind,q).then(function(o){return o||{};},function(){return{};});}catch(e){return Promise.resolve({});}}
function srvSend(kind,d){try{Z3.srv.send(kind,d);}catch(e){}}
function markRead(bit){var z=Z();if(z.o&bit)return;z.o|=bit;
if(bit===1){var t=tk();z.n++;if(!z.d1)z.d1=t;if(z.d!==t){z.r=z.d&&Z3.days(z.d,t)===1?z.r+1:1;z.d=t;z.b=Math.max(z.b,z.r);}ev('read',{n:z.n,r:z.r,d:Math.min(Z3.day(),99)});}
else ev('read',{b:bit});sv();}
function arDone(){return lsG('z3-pa',{});}
function isDone(r,dn){var z=Z();if(dn===today()){if(z.s&BIT[r])return true;
if(r==='zg'){var m=S.zmg&&S.zmg.m&&S.zmg.m.zagadala;return!!(m&&+m.k===tk()&&+m.e);}
if(r==='sv'||r==='sh'||r==='rp'){try{return!!(window.ZBNUM&&ZBNUM.done&&ZBNUM.done(r));}catch(e){}}
return false;}
return!!arDone()[r+dn];}
function solved(r,dn,res,own){var z=Z(),out={c:0};if(!res||!res.ok){ev('fail',{r:r,m:res&&res.m|0,ar:dn===today()?0:1});return out;}
if(dn===today()){var first=!(z.s&BIT[r]);z.s|=BIT[r];if(first){z.t++;try{if(P.evAdd)P.evAdd(5,'rub');}catch(e){}}
if(own&&!(z.w&BIT[r])){z.w|=BIT[r];out.c=give(REW);}}
else{var a=arDone();if(!a[r+dn]){a[r+dn]=1;var ks=Object.keys(a);if(ks.length>400)delete a[ks[0]];lsS('z3-pa',a);z.t++;
if(own){if(z.ar.d!==tk()){z.ar={d:tk(),c:0};}if(z.ar.c<AR_DAY){z.ar.c++;out.c=give(AR_REW);}}}}
sv();ev('solve',{r:r,m:res.m|0,t:res.s|0,ar:dn===today()?0:1,c:out.c});if(out.c)ev('rew',{r:r,c:out.c});return out;}
function front(k,cb){var d=D(),pp=d&&d.pp||[],x=pp.length?pp[(issueNo(k)-1)%pp.length]:null;var t=x&&x.front||'Стройка двора идёт: собрано {n} звёзд из {goal}.';
srvGet('build').then(function(b){var n=+b.st||0,g=+b.goal||0,l=+b.left||0;
var lt=l>86400?Math.round(l/86400)+' '+pl(Math.round(l/86400),'день','дня','дней'):Math.max(1,Math.round(l/3600))+' ч';
cb(g?t.replace('{n}',n).replace('{goal}',g).replace('{left}',lt):'');});}
var CUR={el:null,op:{}};
function hdr(title,sub,back){return'<div class="z3p-hd"><button type="button" class="btn ghost small z3p-back" data-go="'+back+'">‹ '+(back==='home'?'Двор':back==='arch'?'Архив':back==='ev'?'Вечер':'Номер')+'</button>'+
'<div class="z3p-mast"><b>'+title+'</b><small>'+sub+'</small></div></div>';}
function row(id,ic,t,sub,st,cls){return'<button type="button" class="z3p-row'+(cls?' '+cls:'')+'" data-p="'+id+'"><span class="z3p-ri">'+ic+'</span><span class="z3p-rt"><b>'+esc(t)+'</b><small>'+esc(sub)+'</small></span><em>'+st+'</em></button>';}
function stTxt(r,dn,own){return isDone(r,dn)?'✓':own?'+'+(dn===today()?REW:AR_REW)+' '+coin():'';}
function issueHtml(dn){var k=keyOf(dn),td=dn===today(),r=rubOf(dn),h='',ev19=td&&hour()>=19,fk=td?festKey():'';
h+=hdr('Вечёрка у Зины','№ '+issueNo(k)+' · '+dateTxt(k)+(fk?' · '+festTx(fk,'head'):td?(ev19?' · вечерний выпуск':' · утренний выпуск'):' · архив'),td?'home':'arch');
h+='<div class="scroll z3p-body"><div class="z3p-sheet">';
var en=td&&!fk?evNow():null,er=td&&!fk&&!en?evRes():null,eh=en?evTx(en.id,'head'):'',enote=en?evTx(en.id,en.half||en.done?'s2':en.c?'s1':'note',en):'';
h+='<div class="z3p-front'+(fk?' z3p-fest z3p-f-'+fk:en?' z3p-evf':'')+'"><div class="z3p-av">'+zina('happy')+'</div><div><h3>'+(fk?esc(festTx(fk,'head')):en?esc(en.ic+' '+eh):'Первая полоса')+'</h3>'+(fk?'<p class="z3p-fn">'+esc(festTx(fk,'note'))+'</p>':en?'<p class="z3p-fn">'+esc(enote)+'</p>':'')+'<p class="z3p-fr">…</p></div></div>';
if(en)h+=row('pg:evn',en.ic,en.sh,'событие двора · ещё '+en.left+' '+pl(en.left,'день','дня','дней'),en.done?'✓':Math.min(99,Math.floor(100*en.c/en.goal))+'%',' z3p-evr');
else if(er)h+=row('pg:evn',er.ic,'Итог: '+er.sh,er.c?'у вас '+Math.min(er.c,er.goal)+' из '+er.goal:'событие двора закончилось',er.done?'🏆':'',' z3p-evr');
if(fk&&FSP[fk]&&FSP[fk])h+=row('r:ff',RI.ff,RN.ff,RS.ff,stTxt('ff',dn,true),' z3p-festr');
if(td)h+=row('zg',RI.zg,'Слово дня: «Зина загадала»','одно слово на весь дом',stTxt('zg',dn));
h+=row('r:'+r,RI[r],RN[r],WDN[dowOf(dn)]+' · '+RS[r],stTxt(r,dn,r==='fw'||r==='vy'));
if(r!=='rp')h+=row('r:rp',RI.rp,RN.rp,RS.rp,stTxt('rp',dn));
if(td){var z=Z();h+=row('pg:rid','🧩','Загадки читателей','соседи загадали — разгадай',z.rc?z.rc+' из 3':'');
h+=row('pg:se','📺','Из жизни двора','серия дня и голосование всего дома',z.o&8?'✓':'');}
h+=row('pg:hu','📌','Двор говорит','гороскоп Ятя, сплетня Гали, объявления',(td&&Z().o&16)?'✓':'');
if(ev19)h+=row('pg:ev','🌙','Вечерний выпуск','итоги голосования · эфир «10 слов вечера»',Z().o&2?'✓':'',' z3p-eve');
h+='</div>';
if(td){var z2=Z();h+='<p class="z3p-note">'+(z2.r>1?'🔥 Читаешь '+z2.r+' '+pl(z2.r,'день','дня','дней')+' подряд':'Заглядывай каждый день — Люся носит свежий номер')+'</p>';}
h+='<button type="button" class="btn ghost z3p-arb" data-go="arch">📚 Архив номеров</button></div>';return h;}
function archHtml(){var t=today(),h=hdr('Архив номеров','решай прошлые — без спешки','home')+'<div class="scroll z3p-body"><div class="z3p-alist">';
for(var i=1;i<=30;i++){var dn=t-i,k=keyOf(dn),r=rubOf(dn),n=(isDone(r,dn)?1:0)+(r!=='rp'&&isDone('rp',dn)?1:0),of=r==='rp'?1:2;
h+='<button type="button" class="z3p-ai" data-dn="'+dn+'"><b>№ '+issueNo(k)+'</b><small>'+dateTxt(k)+' · '+RN[r]+'</small><em>'+(n?n+' из '+of+' ✓':'')+'</em></button>';}
h+='</div>';if(document.getElementById('zb-vech'))h+='<button type="button" class="btn ghost z3p-arb" data-go="vech">🗄 Запас задачек Зины</button>';
return h+'</div>';}
function bind(el){
[].forEach.call(el.querySelectorAll('[data-go]'),function(b){b.onclick=function(){snd();var a=b.getAttribute('data-go');
if(a==='home'){try{if(typeof openMenu==='function')openMenu();else ZB.go('home');}catch(e){}}
else if(a==='arch')ZB.go('z3paper',{arch:1});else if(a==='vech')ZB.go('vech',{arch:1});
else if(a==='ev')ZB.go('z3paper',{pg:'ev'});else ZB.go('z3paper',{dn:CUR.op.dn!=null&&CUR.op.dn!==today()?CUR.op.dn:undefined});};});
[].forEach.call(el.querySelectorAll('[data-p]'),function(b){b.onclick=function(){snd();var p=b.getAttribute('data-p'),dn=CUR.op.dn!=null?CUR.op.dn:today();
if(p==='zg'){openRub('zg',dn);return;}
if(p.indexOf('r:')===0){openRub(p.slice(2),dn);return;}
if(p.indexOf('pg:')===0)ZB.go('z3paper',{pg:p.slice(3),dn:dn});};});
[].forEach.call(el.querySelectorAll('.z3p-ai'),function(b){b.onclick=function(){snd();ZB.go('z3paper',{dn:+b.getAttribute('data-dn')});};});}
function openRub(r,dn){if(ZMGID[r]){P.play(r,document.createElement('div'),{from:dn===today()?'paper':'arch',dn:dn,done:function(){if(ZB.cur==='z3paper')P.render(CUR.el,CUR.op);}});return;}
ZB.go('z3paper',{r:r,dn:dn});}
P.render=function(el,op){css();op=op||{};if(!D()&&!op.nd){ZB.load('js/zb3-paper-data.js').then(function(){if(ZB.cur==='z3paper')P.render(el,op);},function(){op.nd=1;if(ZB.cur==='z3paper')P.render(el,op);});
el.innerHTML='<div class="z3p-scr"><p class="z3p-sm" style="padding:30px;text-align:center">📰 Люся несёт номер…</p></div>';return;}
if(!op.r&&!window.Z3ART.desk&&!NODESK&&Z3.artLoad){Z3.artLoad('desk').then(function(){if(ZB.cur==='z3paper')P.render(el,op);},function(){NODESK=1;if(ZB.cur==='z3paper')P.render(el,op);});
if(!el.querySelector('.z3p-scr'))el.innerHTML='<div class="z3p-scr"><p class="z3p-sm" style="padding:30px;text-align:center">📰 Люся несёт номер…</p></div>';return;}
CUR.el=el;CUR.op=op;var td=today(),dn=op.dn!=null?op.dn:td,h;
if(op.arch){el.innerHTML='<div class="z3p-scr">'+archHtml()+'</div>';ev('arch',{});bind(el);desk(el);return;}
if(op.r){var r=op.r;el.innerHTML='<div class="z3p-scr">'+hdr(RI[r]+' '+RN[r],dn===td?'№ '+issueNo(keyOf(dn))+' · '+dateTxt(keyOf(dn)):'архив · '+dateTxt(keyOf(dn)),'issue')+
'<div class="scroll z3p-body"><div class="z3p-game"></div></div></div>';bind(el);
var g=el.querySelector('.z3p-game');ev('rub',{r:r,ar:dn===td?0:1});
P.play(r,g,{from:dn===td?'paper':'arch',dn:dn,done:function(res){if(ZB.cur==='z3paper'&&CUR.op===op)ZB.go('z3paper',{dn:dn===td?undefined:dn});}});return;}
if(op.pg){if(PG[op.pg]){PG[op.pg](el,dn);desk(el);}else P.render(el,{});return;}
el.innerHTML='<div class="z3p-scr">'+issueHtml(dn)+'</div>';bind(el);desk(el,1);if(dn===td){peroRow(el);thanksBlk(el);}
if(dn===td){markRead(1);ev('show',{d:Math.min(Z3.day(),99),left:P.left()});}
front(keyOf(dn),function(t){var e=el.querySelector('.z3p-fr');if(e)e.textContent=t||'Двор живёт, стройка идёт, Галя всё знает.';});
try{var sc=el.querySelector('.z3p-body');if(sc)sc.scrollTop=0;}catch(e){}};
var NODESK=0,dkCss=0,dkT=0;
function desk(el,main){var A=window.Z3ART;if(!A||!A.desk||!A.deskFree)return;var scr=el.querySelector('.z3p-scr'),hd=el.querySelector('.z3p-hd'),body=el.querySelector('.z3p-body');if(!scr||!hd||!body)return;
if(!dkCss&&A.deskCss){dkCss=1;var st=document.createElement('style');st.setAttribute('data-z3p-desk','1');st.textContent=A.deskCss;document.head.appendChild(st);}
var W=Math.max(200,el.clientWidth||innerWidth),H=Math.max(300,el.clientHeight||innerHeight),pc=W>=860,f=A.deskFree('paper',W,H,pc);
var t=hd.querySelector('.z3p-mast b'),sub=hd.querySelector('.z3p-mast small'),back=hd.querySelector('.z3p-back'),bg=document.createElement('div');
bg.className='z3p-dkbg';bg.innerHTML=Z3.art('desk',{kind:'paper',w:W,h:H,pc:pc});
var sh=document.createElement('div');sh.className='z3-sheet z3p-dks';sh.style.cssText='left:'+Math.round(f[0])+'px;top:'+Math.round(f[1])+'px;width:'+Math.round(f[2])+'px;height:'+Math.round(f[3])+'px';
var subT=sub?sub.textContent:'',m=/^(№ \d+ · \d+ \S+)(?: · (.*))?$/.exec(subT);
sh.innerHTML='<div class="z3-mast"><div class="t">Вечёрка</div><div class="row"><span>'+esc(m?m[1]:subT)+'</span><span>'+esc(m?m[2]||'':'')+'</span></div></div>'+
(main||!t?'':'<h2 class="z3p-dkh">'+esc(t.textContent)+(m?'':'')+'</h2>');
sh.appendChild(body);scr.classList.add('z3p-dk');scr.innerHTML='';scr.appendChild(bg);if(back){back.classList.add('z3p-dkback');scr.appendChild(back);}scr.appendChild(sh);
if(!m&&subT&&!main){var r2=sh.querySelector('.z3-mast .row span');if(r2)r2.textContent=subT;}}
window.addEventListener('resize',function(){clearTimeout(dkT);dkT=setTimeout(function(){if(ZB.cur==='z3paper'&&CUR.el&&!CUR.op.r&&CUR.el.querySelector('.z3p-dk'))ZB.safe('z3p-rz',function(){P.render(CUR.el,CUR.op);});},250);});
function rated(){return lsG('z3-rt',[]);}
function rate(id){var r=rated();if(r.indexOf(id)>=0)return'';return'<span class="z3p-rate" data-id="'+esc(id)+'"><button type="button" data-v="1" aria-label="Смешно">😂</button><button type="button" data-v="0" aria-label="Не смешно">😐</button></span>';}
function bindRate(el){[].forEach.call(el.querySelectorAll('.z3p-rate button'),function(b){b.onclick=function(){var s=b.parentNode,id=s.getAttribute('data-id'),v=+b.getAttribute('data-v');
var r=rated();if(r.indexOf(id)<0){r.push(id);if(r.length>300)r=r.slice(-300);lsS('z3-rt',r);Z3.ev('jk',{a:'r',id:String(id).slice(0,40),v:v,s:'paper'});}s.innerHTML=v?'<i>😂 спасибо!</i>':'<i>учту</i>';};});}
var PG={};
PG.hu=function(el,dn){var k=keyOf(dn),d=D(),pp=d&&d.pp||[],n=issueNo(k),x=pp.length?pp[(n-1)%pp.length]:null,h=hdr('📌 Двор говорит','№ '+n+' · '+dateTxt(k),'issue')+'<div class="scroll z3p-body"><div class="z3p-sheet">';
if(!x)h+='<p>Номер ещё печатается…</p>';
else{var id='p'+(((n-1)%pp.length)+1);
h+='<div class="z3p-blk"><h4>⭐ Гороскоп от Ятя</h4><p>'+esc(x.horo)+'</p>'+rate(id+'h')+'</div>';
h+='<div class="z3p-blk"><h4>🗣 Сплетня Гали</h4><p>'+esc(x.gossip)+'</p>'+rate(id+'g')+'</div>';
h+='<div class="z3p-blk"><h4>📌 Объявления двора</h4>'+(x.ad||[]).map(function(a,i){return'<p class="z3p-ad">'+esc(a)+' '+rate(id+'a'+i)+'</p>';}).join('')+'</div>';
if(x.joke)h+='<div class="z3p-blk"><h4>😂 Анекдот номера</h4><p>'+esc(x.joke)+'</p>'+rate(id+'j')+'</div>';}
el.innerHTML='<div class="z3p-scr">'+h+'</div></div></div>';bind(el);bindRate(el);if(dn===today())markRead(16);};
function serAt(dn){var wk=Math.floor(dn/7),sw=((wk%8)+8)%8,s=sw<4?1:2,w=sw%4+1;return{wk:wk,s:s,w:w,e:dowOf(dn)===0?7:dowOf(dn),f:'s'+s+'-w'+w+'-'+wk};}
function opts(s,w){var d=D(),se=d&&d.se||{},o=[];['A','B','C','D'].forEach(function(x){var t=se['s'+s+'.w'+w+'.fork.opt'+x];if(t)o.push(t);});return o;}
function winner(n,cnt){var b=0;for(var i=1;i<cnt;i++)if((+n[i]||0)>(+n[b]||0))b=i;return b;}
function after(cur,cb){var d=D(),se=d&&d.se||{},pw=cur.wk-1,pr=serAt(pw*7),f=pr.f,cnt=opts(pr.s,pr.w).length;if(!cnt){cb('');return;}
srvGet('vote',{f:f}).then(function(v){var X='ABCD'.charAt(winner(v.n||[],cnt)),pre=cur.w===1?'s'+pr.s+'.epi.'+X+'.':'s'+cur.s+'.w'+cur.w+'.after'+X+'.',L=[];
for(var i=1;i<=4;i++)if(se[pre+i])L.push(se[pre+i]);cb(L.length?L[h32(f)%L.length]:'');});}
function epi(t){return esc(t).split(' / ').map(function(x){var m=/^([А-ЯЁ][а-яё]+(?: [А-ЯЁ][а-яё]+)?):\s(.*)$/.exec(x);return'<p>'+(m?'<b>'+m[1]+':</b> '+m[2]:x)+'</p>';}).join('');}
PG.se=function(el,dn){var c=serAt(dn),d=D(),se=d&&d.se||{},z=Z(),k=keyOf(dn),t=se['s'+c.s+'.w'+c.w+'.e'+c.e]||'',q=se['s'+c.s+'.w'+c.w+'.fork.q']||'',O=opts(c.s,c.w);
var h=hdr('📺 Из жизни двора','сезон '+c.s+' · неделя '+c.w+' · серия '+c.e,'issue')+'<div class="scroll z3p-body"><div class="z3p-sheet">';
if(c.e===1)h+='<div class="z3p-blk z3p-prev"><h4>Чем кончилось голосование</h4><div class="z3p-aft">…</div></div>';
h+='<div class="z3p-blk z3p-ep"><h4>Серия '+c.e+'</h4>'+(t?epi(t):'<p>Серию ещё пишут.</p>')+rate('se'+c.s+c.w+c.e)+'</div>';
if(q&&O.length){var my=z.vf===c.f?z.vo:-1;h+='<div class="z3p-blk z3p-vote"><h4>Голосует весь дом</h4><p class="z3p-q">'+esc(q)+'</p><div class="z3p-vo">'+
O.map(function(o,i){return'<button type="button" class="z3p-vb'+(my===i?' on':'')+'" data-o="'+i+'">'+esc(o)+'<span class="z3p-pc"></span></button>';}).join('')+'</div>'+
'<p class="z3p-sm">'+(c.e===7?'Итог — сегодня в вечернем выпуске, продолжение — в понедельник.':'Голосование до воскресенья. Итог — в вечернем выпуске воскресенья.')+'</p></div>';}
el.innerHTML='<div class="z3p-scr">'+h+'</div></div></div>';bind(el);bindRate(el);if(dn===today())markRead(8);
if(c.e===1)after(c,function(a){var e=el.querySelector('.z3p-aft');if(e)e.innerHTML=a?epi(a):'<p>Двор ещё спорит.</p>';});
function showPc(){srvGet('vote',{f:c.f}).then(function(v){var n=v.n||[],all=0;n.forEach(function(x){all+=+x||0;});if(Z().vf!==c.f||!all||v._sim)return;
[].forEach.call(el.querySelectorAll('.z3p-vb'),function(b,i){var p=Math.round(100*(+n[i]||0)/all);b.querySelector('.z3p-pc').textContent=' · '+p+'%';});});}
if(z.vf===c.f)showPc();
[].forEach.call(el.querySelectorAll('.z3p-vb'),function(b){b.onclick=function(){snd();var o=+b.getAttribute('data-o'),zz=Z();zz.vf=c.f;zz.vo=o;sv();
srvSend('vote',{f:c.f,o:o});ev('vote',{f:c.f,o:o});[].forEach.call(el.querySelectorAll('.z3p-vb'),function(x){x.classList.toggle('on',x===b);});setTimeout(showPc,60);};});};
function thanksBlk(el){var H=window.Z3H;if(!H||!H.thanks)return;var pr;try{pr=H.thanks();}catch(e){return;}if(!pr||!pr.then)return;
pr.then(function(L){L=(L||[]).filter(function(x){return x&&typeof x==='string';}).slice(0,5);if(!L.length||ZB.cur!=='z3paper')return;
var sh=el.querySelector('.z3p-sheet');if(!sh||sh.querySelector('.z3p-thx'))return;
var me=L.indexOf('вы')>=0,oth=[],t='';L.forEach(function(x){x=x.replace(/\s*\(\d+\)$/,'');if(x!=='вы'&&oth.indexOf(x)<0)oth.push(x);});
if(oth.length)t=oth.map(esc).join(', ')+(me?' — и вы!':'.');else t='Вы! Три подсказки 💡 соседям за неделю. Галя столько не дарит даже на юбилеи.';
sh.insertAdjacentHTML('beforeend','<div class="z3p-blk z3p-thx"><h4>🙏 Благодарности</h4><p class="z3p-sm">«Добрые соседки» недели — дарили 💡 соседям:</p><p>'+t+'</p></div>');
ev('thx',{n:L.length,me:me?1:0});},function(){});}
var MONS=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
function monTxt(m){return MONS[(m%100)-1]||'';}
function peroGet(){return srvGet('pero',{m:Math.floor(tk()/100)}).then(function(o){if(!o||o._sim||!((o.top&&o.top.length)||o.win))return null;
var w=o.win,z=Z();if(w&&w.me&&+w.m&&+w.m>z.gm){z.gm=+w.m;z.gp++;sv();ev('pero_win',{m:+w.m});}return o;});}
function peroRow(el){peroGet().then(function(o){if(!o||ZB.cur!=='z3paper')return;var sh=el.querySelector('.z3p-sheet');if(!sh||sh.querySelector('[data-p="pg:pe"]'))return;
var w=o.win,sub=w?'победитель за '+monTxt(+w.m)+': '+(w.me?'это вы!':String(w.by||'читатель')):'конкурс загадок месяца';
sh.insertAdjacentHTML('beforeend',row('pg:pe',RI.pe,RN.pe,sub,w&&w.me?'🏆':''));bind(sh);ev('pero_show');});}
PG.pe=function(el){var h=hdr('🖋 Золотое перо','загадки месяца по разгадываниям','issue')+'<div class="scroll z3p-body"><div class="z3p-sheet"><div class="z3p-pe">…</div></div></div>';
el.innerHTML='<div class="z3p-scr">'+h+'</div>';bind(el);
peroGet().then(function(o){var b=el.querySelector('.z3p-pe');if(!b)return;
if(!o){b.innerHTML='<p>Конкурс «Золотое перо» подводим, когда дом на связи. Загляни позже.</p>';return;}
var x='',w=o.win;
if(w){x+='<div class="z3p-blk z3p-gold"><h4>🏆 Победитель за '+esc(monTxt(+w.m))+'</h4><p class="z3p-hint">'+esc(glue(w.p)||gl(w.w))+'</p>'+
'<p class="z3p-sm">Ответ: <b>'+esc(String(w.w||'').toUpperCase())+'</b> · разгадали '+(+w.n||0)+' · '+(w.me?'загадка ваша — «Золотое перо» в комоде!':'загадка от: '+esc(w.by||'читатель'))+'</p></div>';}
var T=(o.top||[]).slice(0,3);
if(T.length)x+='<div class="z3p-blk"><h4>Лидеры '+esc(MON[((+o.m||Math.floor(tk()/100))%100)-1]||'месяца')+'</h4>'+T.map(function(t,i){return'<p>'+(i+1)+'. '+esc(glue(t.p)||gl(t.w))+' <span class="z3p-sm">— '+esc(t.by||'читатель')+', разгадали '+(+t.n||0)+'</span></p>';}).join('')+
'<p class="z3p-sm">Ответы лидеров — после конца месяца. Загадать своё слово можно после уровня.</p></div>';
b.innerHTML=x;ev('pero_open');});};
function evNow(){try{return P.evNow?P.evNow():null;}catch(e){return null;}}
function evRes(){try{return P.evRes?P.evRes():null;}catch(e){return null;}}
function evTx(id,part,o){var d=D(),L=d&&d.ev&&d.ev[id]&&d.ev[id][part]||[];if(!L.length)return'';var x=L[h32(id+part+tk())%L.length];
return x.replace(/\{t\}/g,o&&o.t||'').replace(/\{n\}/g,o&&o.c||0).replace(/\{goal\}/g,o&&o.goal||0);}
function dmy(k){return(k%100)+' '+MON[Math.floor(k/100)%100-1];}
PG.evn=function(el){var e=evNow(),r=e?null:evRes(),o=e||r;if(!o){P.render(el,{});return;}
var h=hdr(o.ic+' '+esc(o.sh),'событие двора · '+dmy(o.from)+' — '+dmy(o.to),'issue')+'<div class="scroll z3p-body"><div class="z3p-sheet">',p=Math.min(100,Math.floor(100*o.c/o.goal));
h+='<div class="z3p-blk"><h4>'+esc(evTx(o.id,'head')||o.t)+'</h4><p>'+esc(evTx(o.id,e?(o.half||o.done?'s2':o.c?'s1':'note'):'s3',o))+'</p></div>';
h+='<div class="z3p-blk"><h4>'+(e?'Задание':'Итог')+'</h4><div class="z3p-evbar"><i style="width:'+p+'%"></i></div><p><b>'+o.c+' из '+o.goal+'</b> очков'+(e?' · ещё '+e.left+' '+pl(e.left,'день','дня','дней'):'')+'</p>';
if(e)h+='<p class="z3p-sm">Слово в уровне — 1 очко, слово темы — 3, рубрика номера — 5.</p>';
h+='<p class="z3p-sm">Половина — +15 '+coin()+(o.half||o.g&1?' ✓':'')+' · всё — +40 '+coin()+' и 💡'+(o.done?' ✓':'')+'</p><p class="z3p-dom z3p-sm"></p></div>';
if(e)h+='<div class="z3p-blk"><h4>Слова темы</h4><p class="z3p-evw">'+o.w.map(function(w){return'<span>'+esc(w)+'</span>';}).join('')+'</p></div>';
h+='</div></div>';el.innerHTML='<div class="z3p-scr">'+h+'</div>';bind(el);ev('evo',{e:o.id,c:o.c,end:e?0:1});
srvGet('ev',{e:o.key}).then(function(x){var b=el.querySelector('.z3p-dom');if(!b||x._sim||!(+x.p>1))return;
b.textContent='Весь дом: '+(+x.n||0)+' очков, участвуют '+(+x.p)+' '+pl(+x.p,'сосед','соседа','соседей')+'.';});};
PG.ev=function(el,dn){var c=serAt(today()),d=D(),se=d&&d.se||{},O=opts(c.s,c.w),q=se['s'+c.s+'.w'+c.w+'.fork.q']||'',hr=hour();
var h=hdr('🌙 Вечерний выпуск',dateTxt(tk())+' · с 19:00','issue')+'<div class="scroll z3p-body"><div class="z3p-sheet">';
h+='<div class="z3p-blk z3p-efb"><h4>📻 Эфир «10 слов вечера»</h4><p>'+(hr<19?'Эфир начнётся в 19:00.':hr>=22?'Эфир окончен.':'Сейчас в эфире! Десять вопросов — одни на весь дом.')+'</p>'+
(hr>=19&&hr<22&&!(Z().s&BIT.ef)?'<button type="button" class="btn green z3p-efgo">В эфир ▶</button>':'')+'<p class="z3p-efres"></p></div>';
if(q)h+='<div class="z3p-blk"><h4>Голосование: '+esc(q)+'</h4><div class="z3p-vres">…</div></div>';
h+='<div class="z3p-blk"><h4>✉ Письма в редакцию</h4><div class="z3p-mine">…</div></div>';
el.innerHTML='<div class="z3p-scr">'+h+'</div></div></div>';bind(el);markRead(2);
var g=el.querySelector('.z3p-efgo');if(g)g.onclick=function(){snd();ZB.go('z3paper',{r:'ef'});};
var er=lsG('z3-ef',null);if(er&&er.k===tk())el.querySelector('.z3p-efres').textContent='Твой результат: '+er.n+' из 10.';
if(q)srvGet('vote',{f:c.f}).then(function(v){var n=v.n||[],all=0,e=el.querySelector('.z3p-vres');n.forEach(function(x){all+=+x||0;});if(!e)return;
if(v._sim){var zv=Z();e.innerHTML='<p>'+(zv.vf===c.f&&O[zv.vo]?'Твой выбор: «'+esc(O[zv.vo])+'».':'Ты ещё не голосовал — загляни в «Из жизни двора».')+'</p><p class="z3p-sm">'+(c.e===7?'Чем кончилось — в понедельник, в новой серии.':'Голосование идёт до воскресенья, итог — в понедельник.')+'</p>';return;}
if(!all){e.textContent='Голосов пока нет.';return;}
e.innerHTML=O.map(function(o,i){var p=Math.round(100*(+n[i]||0)/all);return'<div class="z3p-bar"><span>'+esc(o)+'</span><i style="width:'+p+'%"></i><b>'+p+'%</b></div>';}).join('')+
'<p class="z3p-sm">'+(c.e===7?'Голосование закрыто — продолжение в понедельник.':'Голосование идёт до воскресенья.')+'</p>';});
srvGet('rid').then(function(r){var e=el.querySelector('.z3p-mine'),L=r.mine||[];if(!e)return;
e.innerHTML=L.length?L.map(function(x){var W2=esc(String(x.w||'').toUpperCase());return r._sim?'<p>Вашу загадку про «'+W2+'» напечатали в номере.</p>':'<p>Вашу загадку про «'+W2+'» разгадали '+(+x.n||0)+' '+pl(+x.n||0,'сосед','соседа','соседей')+'.</p>';}).join(''):
'<p>Своих загадок пока нет. Загадать слово можно после уровня — кнопкой «✍ Загадать».</p>';});};
function part(id){var d=D(),rp=d&&d.rp||{};return rp[id]||'';}
function partIds(){var d=D(),rp=d&&d.rp||{};return Object.keys(rp);}
function glue(ids){var out='';(ids||[]).forEach(function(id){var q=part(id);if(!q)return;
if(!out)out=q;else if(/[…:—-]$/.test(out))out+=' '+q;else if(/^[А-ЯЁ]/.test(q))out=out.replace(/[,;]?$/,'').replace(/([^.!?…])$/,'$1.')+' '+q;else out+=', '+q;});
if(out&&!/[.!?…]$/.test(out))out+='.';return out;}
function gl(w){try{var g=window.GLOSS||(typeof GLOSS!=='undefined'?GLOSS:null);return g&&g[w]||'';}catch(e){return'';}}
function ridSolved(){var o=lsG('z3-prs',{d:0,ids:[]});if(o.d!==tk())o={d:tk(),ids:[]};return o;}
PG.rid=function(el){var h=hdr('🧩 Загадки читателей','соседи загадали — ты разгадай','issue')+'<div class="scroll z3p-body"><div class="z3p-rl">Люся раскладывает загадки…</div></div>';
el.innerHTML='<div class="z3p-scr">'+h+'</div>';bind(el);markRead(32);
srvGet('rid').then(function(r){var real=!r._sim,L=(r.list||[]).filter(function(x){return x&&/^[а-я]{3,12}$/.test(String(x.w||''));});
var d=D();if(!L.length&&d&&d.rq)L=d.rq.map(function(x,i){return{id:'q'+i,w:x[0],p:x[1],by:x[2]||'Зина',b:1,n:0};});
var sd=ridSolved(),rr=rng(tk()),pick=shuf(L.filter(function(x){return!x.b;}),rr).concat(shuf(L.filter(function(x){return x.b;}),rr)).slice(0,3),box=el.querySelector('.z3p-rl');if(!box)return;
if(!pick.length){box.textContent='Сегодня загадок нет — загадай свою после уровня!';return;}
box.innerHTML=pick.map(function(x,i){var done=sd.ids.indexOf(String(x.id))>=0,hint=glue(x.p),g=gl(x.w);
return'<div class="z3p-blk z3p-rd'+(done?' ok':'')+'" data-i="'+i+'"><h4>Загадка №'+(i+1)+(real&&!x.b&&+x.n?' · '+(+x.n)+' '+pl(+x.n,'разгадал','разгадали','разгадали'):'')+'</h4>'+
'<p class="z3p-hint">'+esc(hint||g)+'</p>'+(hint&&g?'<p class="z3p-sm">Зина подсказывает: '+esc(g)+'</p>':'')+
'<p class="z3p-sm">Загадка от: '+esc(x.by||'читатель')+' · '+x.w.length+' '+pl(x.w.length,'буква','буквы','букв')+'</p>'+
(done?'<p class="z3p-ans">✓ '+esc(x.w.toUpperCase())+'</p>':'<div class="z3p-lt"></div>')+'</div>';}).join('');
pick.forEach(function(x,i){if(sd.ids.indexOf(String(x.id))>=0)return;var b=box.querySelector('.z3p-rd[data-i="'+i+'"] .z3p-lt');letters(b,x.w,h32(x.id+tk()),function(ok){
var s2=ridSolved();s2.ids.push(String(x.id));lsS('z3-prs',s2);var z=Z();if(ok){z.rc++;sv();}
srvSend('sol',{id:x.id,ok:ok?1:0});ev('sol',{ok:ok?1:0,b:x.b?1:0});var c=0;if(ok&&z.rc<=3)c=give(3);
b.innerHTML='<p class="z3p-ans">'+(ok?'✓ ':'Ответ: ')+esc(x.w.toUpperCase())+(c?' · +'+c+' '+coin():'')+'</p>';});});});};
function letters(box,w,seed,cb){var r=rng(seed),ab='аеиоуклмнпрст',L=w.split('');L.push(ab.charAt(Math.floor(r()*ab.length)),ab.charAt(Math.floor(r()*ab.length)));L=shuf(L,r);
var cur=[];function draw(){var h='<div class="z3p-slots">';for(var i=0;i<w.length;i++)h+='<span>'+(cur[i]!=null?esc(L[cur[i]].toUpperCase()):'')+'</span>';h+='</div><div class="z3p-tiles">';
L.forEach(function(c,i){h+='<button type="button" data-i="'+i+'"'+(cur.indexOf(i)>=0?' disabled':'')+'>'+esc(c.toUpperCase())+'</button>';});
h+='</div><div class="z3p-row2"><button type="button" class="btn ghost small" data-a="bk">⌫</button><button type="button" class="btn ghost small" data-a="gv">Сдаюсь</button></div>';box.innerHTML=h;
[].forEach.call(box.querySelectorAll('.z3p-tiles button'),function(b){b.onclick=function(){if(cur.length>=w.length)return;snd();cur.push(+b.getAttribute('data-i'));
if(cur.length===w.length){var s=cur.map(function(i){return L[i];}).join('');if(s===w){try{SND.word(w.length,1);}catch(e){}cb(true);return;}
try{SND.bad();}catch(e){}draw();var sl=box.querySelector('.z3p-slots');if(sl)sl.classList.add('bad');setTimeout(function(){cur=[];draw();},700);return;}draw();};});
box.querySelector('[data-a="bk"]').onclick=function(){snd();cur.pop();draw();};
box.querySelector('[data-a="gv"]').onclick=function(){snd();cb(false);};}
draw();}
P.mk=function(w,cb){css();if(!D()){ZB.load('js/zb3-paper-data.js').then(function(){if(D())P.mk(w,cb);},function(){if(cb)cb(false);});return;}var z=Z();if(z.q>=3){try{toast('Сегодня ты уже загадал три слова — хватит на целый номер!',3000);}catch(e){}return;}
var all=partIds();if(!all.length){if(cb)cb(false);return;}
var r=rng(h32(w+tk())),st=shuf(all.filter(function(i){return i.charAt(0)==='s';}),r).slice(0,5),
mid=shuf(all.filter(function(i){return/^[czpatm]/.test(i);}),r).slice(0,7),en=shuf(all.filter(function(i){return i.charAt(0)==='e';}),r).slice(0,3),
s0='',sel=[],d=document.createElement('div');d.className='z3p-ov';
function btn(id,on){return'<button type="button" class="'+(on?'on':'')+'" data-id="'+id+'">'+esc(part(id))+'</button>';}
function ids(){return(s0?[s0]:[]).concat(sel);}
function draw(){var g=gl(w),pre=glue(ids());d.innerHTML='<div class="z3p-ovp"><h3>✍ Загадка для соседей</h3><p>Слово: <b>'+esc(w.toUpperCase())+'</b>. Начни загадку и добавь до двух подсказок.</p>'+
'<p class="z3p-sm">Начало</p><div class="z3p-parts" data-g="s">'+st.map(function(id){return btn(id,id===s0);}).join('')+'</div>'+
'<p class="z3p-sm">Подсказки (до двух)</p><div class="z3p-parts" data-g="m">'+mid.concat(en).map(function(id){return btn(id,sel.indexOf(id)>=0);}).join('')+'</div>'+
(pre?'<p class="z3p-pre">«'+esc(pre)+'»</p>':'')+(g?'<p class="z3p-sm">Зина добавит своё: '+esc(g)+'</p>':'')+
'<div class="z3p-row2"><button type="button" class="btn green" data-a="ok"'+(s0&&sel.length?'':' disabled')+'>В номер!</button><button type="button" class="btn ghost" data-a="no">Не сейчас</button></div></div>';
[].forEach.call(d.querySelectorAll('.z3p-parts button'),function(b){b.onclick=function(){snd();var id=b.getAttribute('data-id');
if(b.parentNode.getAttribute('data-g')==='s')s0=s0===id?'':id;else{var i=sel.indexOf(id);if(i>=0)sel.splice(i,1);else if(sel.length<2)sel.push(id);}draw();};});
d.querySelector('[data-a="no"]').onclick=function(){snd();d.remove();ev('rid',{s:'no'});if(cb)cb(false);};
d.querySelector('[data-a="ok"]').onclick=function(){if(!s0||!sel.length)return;snd();var zz=Z();zz.q++;zz.qn++;sv();srvSend('rid',{w:w,p:ids()});ev('rid',{s:'send',n:ids().length,l:w.length});
d.querySelector('.z3p-ovp').innerHTML='<div class="z3p-av">'+zina('happy')+'</div><h3>Загадка в номере!</h3><p>Завтра соседи будут ломать голову. Вечером узнаешь, сколько разгадали.</p><div class="z3p-row2"><button type="button" class="btn green" data-a="x">Хорошо</button></div>';
d.querySelector('[data-a="x"]').onclick=function(){snd();d.remove();if(cb)cb(true);};};}
draw();document.body.appendChild(d);ev('rid',{s:'open'});};
P.lazy=function(r){if(r==='fw'||r==='ff')return window.Z3FW?Promise.resolve():ZB.load('js/zb3-paper-fw.js');
if(r==='vy'||r==='ef')return D()?Promise.resolve():ZB.load('js/zb3-paper-data.js');
if(r==='sv'||r==='sh'||r==='rp')return window.ZBNUM?ZBNUM.x():Promise.reject(new Error('num'));
if(ZMGID[r])return window.ZMG&&ZMG.load?ZMG.load(ZMGID[r]):Promise.reject(new Error('zmg'));
return Promise.resolve();};
function dnFor(o){return o.from==='arch'&&o.dn!=null?o.dn:today();}
P.play=function(r,el,o){o=o||{};var from=o.from||'paper',dn=dnFor(o),t0=Date.now(),own=r==='fw'||r==='vy'||r==='ef'||r==='ff';
function fin(res){res=res||{ok:false,m:0};if(res.s==null)res.s=Math.round((Date.now()-t0)/1000);
if(from!=='level'&&!res.again){var out=solved(r,dn,res,own);res.c=out.c;}if(o.done)o.done(res);}
el.innerHTML='<p class="z3p-sm" style="padding:16px;text-align:center">Загружаю…</p>';
P.lazy(r).then(function(){ZB.safe('z3p-'+r,function(){
if(r==='sv'||r==='sh'||r==='rp'){var W=window.ZBNUM,ndn=from==='level'?W.IL0+((o.seed>>>0)%90000):from==='arch'?dn:W.dn();W.rub(el,r,{dn:ndn,done:fin});return;}
if(ZMGID[r]){zmg(r,el,o,from,dn,fin);return;}
if(r==='ff'){GAME.fw(el,dn,from,fin,FSP[festKey()]||'праздник');return;}
GAME[r](el,from==='level'?(o.seed>>>0):dn,from,fin);});},
function(){el.innerHTML='<p style="padding:16px">Не загрузилось — проверь интернет.</p>';fin({ok:false,m:0,err:1});});};
function zmg(r,el,o,from,dn,fin){var id=ZMGID[r],md=from==='level'?'node':from==='arch'?'cab':'home',ctx={};if(from==='arch')ctx.arch=1;if(from==='level')ctx.idx=o.idx|0;
var seed=from==='level'?(o.seed>>>0):ZMG.seed(id,keyOf(dn)),done=0;
el.innerHTML='<div class="z3p-blk" style="text-align:center"><p>'+RI[r]+' «'+esc(RN[r])+'» открыт.</p><button type="button" class="btn ghost small">Вернуться</button></div>';
el.querySelector('button').onclick=function(){if(done++)return;fin({ok:false,m:0});};
ZMG.open(id,{mode:md,seed:seed,ctx:ctx,train:from==='arch',back:function(res){if(done++)return;fin({ok:!!(res&&res.tier>=1),m:res?3-(res.tier|0):0,st:res?res.tier|0:0});}});}
var GAME={};
var AB='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV',FC=6,FR=8;
function adj(a,b){var ra=Math.floor(a/FC),ca=a%FC,rb=Math.floor(b/FC),cb=b%FC;return a!==b&&Math.abs(ra-rb)<=1&&Math.abs(ca-cb)<=1;}
GAME.fw=function(el,n,from,fin,th){var F=window.Z3FW;if(!F||!F.f.length){fin({ok:false});return;}
var fi=((n*7)%F.f.length+F.f.length)%F.f.length;
if(th){var FL=[];F.f.forEach(function(x,i){if(F.t[x[0]][1]===th)FL.push(i);});if(FL.length)fi=FL[((n%FL.length)+FL.length)%FL.length];}
var f=F.f[fi],T=F.t[f[0]],g=f[1];
var W=[{w:T[1],c:f[2].split('').map(function(ch){return AB.indexOf(ch);}),sp:1}].concat(f[3].map(function(x){return{w:x[0],c:x[1].split('').map(function(ch){return AB.indexOf(ch);})};}));
var key='z3-fw-'+(from==='level'?'l':th?'f':'')+n,st=lsG(key,{f:[],h:0,x:[],k:0});if(st.k!==tk()&&from!=='paper'&&from!=='arch')st={f:[],h:0,x:[],k:tk()};
var sel=[],hint=-1,ended=false,dn=0;
el.innerHTML='<div class="z3f"><div class="z3f-top"><div class="z3f-th"><small>Тема</small><b>'+esc(T[0])+'</b></div><div class="z3f-ct"></div></div>'+
'<div class="z3f-cur">&nbsp;</div><div class="z3f-wrap"><svg class="z3f-ln"></svg><div class="z3f-g">'+g.split('').map(function(ch,i){return'<div class="z3f-c" data-i="'+i+'"><b>'+esc(ch.toUpperCase())+'</b></div>';}).join('')+'</div></div>'+
'<div class="z3f-bar"><button type="button" class="btn ghost small z3f-h">💡 Подсказка</button><button type="button" class="btn green small z3f-ok">Проверить</button></div>'+
'<p class="z3p-sm z3f-rule">Веди пальцем по буквам (можно наискосок) или нажимай по одной. Все буквы поля — слова темы, а одно главное слово тянется от края до края. Три любых своих слова по 4+ букв — подсказка.</p></div>';
var G=el.querySelector('.z3f-g'),svg=el.querySelector('.z3f-ln'),cells=G.children,curE=el.querySelector('.z3f-cur'),ct=el.querySelector('.z3f-ct'),hb=el.querySelector('.z3f-h');
function found(i){return st.f.indexOf(i)>=0;}
function cellOwner(c){for(var i=0;i<W.length;i++)if(found(i)&&W[i].c.indexOf(c)>=0)return i;return-1;}
function center(c){var e=cells[c];return[e.offsetLeft+e.offsetWidth/2,e.offsetTop+e.offsetHeight/2];}
function line(L,cls){if(L.length<2)return'';return'<polyline class="'+cls+'" points="'+L.map(function(c){return center(c).join(',');}).join(' ')+'"/>';}
function draw(){var hs=0;for(var c=0;c<FC*FR;c++){var o=cellOwner(c),e=cells[c];e.className='z3f-c'+(o>=0?(W[o].sp?' sp':' th'):'')+(sel.indexOf(c)>=0?' on':'')+(hint>=0&&!found(hint)&&W[hint].c.indexOf(c)>=0?' hn':'');}
var s='';W.forEach(function(x,i){if(found(i))s+=line(x.c,x.sp?'sp':'th');});s+=line(sel,'on');svg.innerHTML=s;svg.setAttribute('width',G.offsetWidth);svg.setAttribute('height',G.offsetHeight);
var nf=st.f.length;ct.textContent=nf+' из '+W.length;hs=Math.min(3,st.x.length%3===0&&st.x.length&&hintFree()?3:st.x.length%3);
hb.textContent='💡 Подсказка'+(hintFree()?'':' '+(st.x.length%3)+'/3');hb.disabled=!hintFree()||ended;
curE.textContent=sel.length?sel.map(function(c){return g.charAt(c).toUpperCase();}).join(''):' ';}
function hintFree(){return Math.floor(st.x.length/3)>st.h;}
function saveSt(){if(from!=='level')st.k=tk();lsS(key,st);}
function say(t,cls){curE.textContent=t;curE.className='z3f-cur '+(cls||'');clearTimeout(say.t);say.t=setTimeout(function(){curE.className='z3f-cur';draw();},1400);}
function submit(){if(ended||sel.length<2){sel=[];draw();return;}var w=sel.map(function(c){return g.charAt(c);}).join(''),ks=sel.slice().sort(function(a,b){return a-b;}).join(','),hit=-1;
W.forEach(function(x,i){if(!found(i)&&x.w===w&&x.c.slice().sort(function(a,b){return a-b;}).join(',')===ks)hit=i;});sel=[];
if(hit>=0){st.f.push(hit);if(hit===hint)hint=-1;saveSt();try{SND.word(w.length,st.f.length);}catch(e){}
say(W[hit].sp?'Главное слово! «'+w.toUpperCase()+'»':'Есть! «'+w.toUpperCase()+'»','ok');if(st.f.length===W.length)end();else draw();return;}
var ok=false;try{ok=w.length>=4&&typeof isWord==='function'&&isWord(w);}catch(e){}
if(ok&&st.x.indexOf(w)<0){st.x.push(w);saveSt();say('«'+w.toUpperCase()+'» — слово, но не по теме. '+(st.x.length%3?'':'Подсказка готова!'),'warn');}
else{try{SND.bad();}catch(e){}say(w.length<4&&!ok?'Короткое. Ищи слова темы.':'Такого слова тут нет.','bad');}draw();}
function end(){ended=true;draw();var L=['Всё поле разобрано! Ять проверил — ни одной лишней буквы.','Садись, пять! Даже Галя так быстро не нашла.','Готово! Главное слово с первого взгляда видно — если знать, куда смотреть.'];
el.querySelector('.z3f-bar').innerHTML='<div class="z3p-fin"><div class="z3p-av">'+zina('happy')+'</div><p>'+L[n%3<0?0:n%3]+(st.h?' Подсказок: '+st.h+'.':'')+'</p><button type="button" class="btn green z3f-nx">Дальше ▶</button></div>';
el.querySelector('.z3f-nx').onclick=function(){snd();fin({ok:true,m:st.h});};}
hb.onclick=function(){if(!hintFree())return;snd();st.h++;saveSt();for(var i=1;i<W.length;i++)if(!found(i)){hint=i;break;}if(hint<0&&!found(0))hint=0;draw();};
el.querySelector('.z3f-ok').onclick=function(){snd();submit();};
var down=false,moved=false,start=-1;
function hitAt(x,y){var e=document.elementFromPoint(x,y);if(!e)return-1;if(e.tagName!=='B')return-1;var c=e.parentNode;return c&&c.getAttribute?+c.getAttribute('data-i'):-1;}
function add(c){if(c<0)return;var i=sel.indexOf(c);if(i>=0){if(i===sel.length-2){sel.pop();draw();}return;}
if(sel.length&&!adj(sel[sel.length-1],c))return;sel.push(c);draw();}
G.addEventListener('pointerdown',function(e){if(ended)return;var c=hitAt(e.clientX,e.clientY);if(c<0){var t=e.target.closest&&e.target.closest('.z3f-c');c=t?+t.getAttribute('data-i'):-1;}if(c<0)return;
e.preventDefault();down=true;moved=false;start=c;try{G.setPointerCapture(e.pointerId);}catch(x){}
if(sel.length&&sel[sel.length-1]===c){return;}
if(sel.length&&adj(sel[sel.length-1],c)&&sel.indexOf(c)<0){sel.push(c);draw();return;}
sel=[c];draw();});
G.addEventListener('pointermove',function(e){if(!down)return;var c=hitAt(e.clientX,e.clientY);if(c>=0&&c!==sel[sel.length-1]){moved=true;add(c);}});
function up(){if(!down)return;down=false;if(moved){submit();return;}if(sel.length>1&&start===sel[sel.length-1]&&sel.length&&sel.indexOf(start)===sel.length-1&&upTap.last===start){submit();upTap.last=-1;return;}upTap.last=start;}
function upTap(){}upTap.last=-1;
G.addEventListener('pointerup',up);G.addEventListener('pointercancel',function(){down=false;});G.style.touchAction='none';
if(st.f.length===W.length)end();else{draw();setTimeout(draw,50);}
var rz=function(){if(!document.body.contains(G)){window.removeEventListener('resize',rz);return;}draw();};window.addEventListener('resize',rz);};
function clues(a){var o=[],c=0;for(var i=0;i<a.length;i++){if(a[i])c++;else if(c){o.push(c);c=0;}}if(c)o.push(c);return o.length?o:[0];}
GAME.vy=function(el,n,from,fin){var d=D(),V=d&&d.vy||[];if(!V.length){fin({ok:false});return;}
var vi=from==='level'?n%V.length:((Math.floor(n/7)%V.length)+V.length)%V.length,pic=V[vi],sol=pic[2].split('').map(Number),N=10;
var key='z3-vy-'+(from==='level'?'l':'')+n,st=lsG(key,{c:'',m:0});var g=(st.c||'').length===100?st.c.split('').map(Number):sol.map(function(){return 0;});
var mode=1,ended=false,R=[],C=[];for(var i=0;i<N;i++){R.push(clues(sol.slice(i*N,i*N+N)));var col=[];for(var j=0;j<N;j++)col.push(sol[j*N+i]);C.push(clues(col));}
var h='<div class="z3v"><p class="z3p-sm">Числа у ряда — сколько крестиков подряд. Нажимай клетки или веди пальцем. Ошибся — Зина поправит.</p><div class="z3v-tb">'+
'<button type="button" class="btn small z3v-m on" data-m="1">✚ Вышивать</button><button type="button" class="btn ghost small z3v-m" data-m="2">· Пусто</button><span class="z3v-er"></span></div>'+
'<div class="z3v-grid"><div class="z3v-corner"></div>';
for(i=0;i<N;i++)h+='<div class="z3v-cc">'+C[i].map(function(x){return'<i>'+x+'</i>';}).join('')+'</div>';
for(var r=0;r<N;r++){h+='<div class="z3v-rc">'+R[r].join(' ')+'</div>';for(var c=0;c<N;c++)h+='<div class="z3v-c" data-i="'+(r*N+c)+'"></div>';}
h+='</div><div class="z3v-end"></div></div>';el.innerHTML=h;
var cells=el.querySelectorAll('.z3v-c'),er=el.querySelector('.z3v-er');
function paint(i){var e=cells[i];e.className='z3v-c'+(g[i]===1?' x':g[i]===2?' o':'')+(g[i]===3?' bad':'');}
function all(){for(var i=0;i<100;i++)paint(i);er.textContent=st.m?'поправок: '+st.m:'';}
function save2(){st.c=g.join('');if(from!=='level')lsS(key,st);}
function won(){for(var i=0;i<100;i++)if(sol[i]&&g[i]!==1)return false;return true;}
function set(i){if(ended||i<0)return;var want=mode;if(g[i]===want||g[i]===3)return;
if(want===1&&!sol[i]){g[i]=3;st.m++;try{SND.bad();}catch(e){}paint(i);er.textContent='поправок: '+st.m;save2();return;}
if(want===2&&sol[i]){st.m++;g[i]=1;try{SND.bad();}catch(e){}}else g[i]=want;paint(i);save2();if(won())end();}
function end(){ended=true;for(var i=0;i<100;i++)if(!sol[i])g[i]=0;all();el.querySelector('.z3v-grid').classList.add('done');
var r2=rng(n*31+7),opts=shuf([pic].concat(shuf(V.filter(function(x){return x!==pic;}),r2).slice(0,2)),r2),box=el.querySelector('.z3v-end');
box.innerHTML='<div class="z3p-blk"><h4>Что вышила Зина?</h4><div class="z3p-vo">'+opts.map(function(x){return'<button type="button" class="z3p-vb" data-w="'+esc(x[0])+'">'+esc(x[1])+'</button>';}).join('')+'</div></div>';
[].forEach.call(box.querySelectorAll('.z3p-vb'),function(b){b.onclick=function(){snd();var ok=b.getAttribute('data-w')===pic[0];if(!ok)st.m++;
box.innerHTML='<div class="z3p-fin"><div class="z3p-av">'+zina('happy')+'</div><p>'+(ok?'Верно — «'+esc(pic[1])+'»! Повешу на кухне, рядом с прошлой.':'Это «'+esc(pic[1])+'». Ничего, вышивка от этого хуже не стала.')+'</p><button type="button" class="btn green z3v-nx">Дальше ▶</button></div>';
box.querySelector('.z3v-nx').onclick=function(){snd();if(from!=='level')lsS(key,{c:'',m:0,ok:1});fin({ok:true,m:st.m});};};});}
[].forEach.call(el.querySelectorAll('.z3v-m'),function(b){b.onclick=function(){snd();mode=+b.getAttribute('data-m');[].forEach.call(el.querySelectorAll('.z3v-m'),function(x){x.classList.toggle('on',x===b);x.classList.toggle('ghost',x!==b);});};});
var gr=el.querySelector('.z3v-grid'),down=false;
function at(e){var t=document.elementFromPoint(e.clientX,e.clientY);return t&&t.classList&&t.classList.contains('z3v-c')?+t.getAttribute('data-i'):-1;}
gr.addEventListener('pointerdown',function(e){var i=at(e);if(i<0)return;e.preventDefault();down=true;try{gr.setPointerCapture(e.pointerId);}catch(x){}
if(g[i]===mode&&mode!==3){g[i]=0;paint(i);save2();down=false;return;}set(i);});
gr.addEventListener('pointermove',function(e){if(down)set(at(e));});
gr.addEventListener('pointerup',function(){down=false;});gr.addEventListener('pointercancel',function(){down=false;});gr.style.touchAction='none';
all();if(lsG(key,{}).ok&&from!=='level'){g=sol.slice();end();}};
function efQs(k){var r=rng(h32('ef'+k)),Lv=typeof LEVELS!=='undefined'?LEVELS:[],lim=Math.max(20,Math.min(Lv.length,(+S.lv||0)+1)),pool=[],seen={},deny={};
try{if(typeof ZINA_DENY==='string')ZINA_DENY.split(' ').forEach(function(w){deny[w]=1;});}catch(e){}
for(var i=0;i<lim;i++)(Lv[i]&&Lv[i].w||[]).forEach(function(x){var w=x[0];if(!seen[w]&&!deny[w]&&/^[а-я]{4,8}$/.test(w)&&gl(w)&&gl(w).toLowerCase().indexOf(w.slice(0,4))<0){seen[w]=1;pool.push(w);}});
pool=shuf(pool,r);var Q=[];for(var q=0;q<10&&q<pool.length;q++){var w=pool[q],o=[w];for(var j=10;o.length<4&&j<pool.length;j++){var c=pool[(q*7+j)%pool.length];if(o.indexOf(c)<0)o.push(c);}Q.push({w:w,t:gl(w),o:shuf(o,r)});}
return Q;}
GAME.ef=function(el,n,from,fin){var k=from==='level'?n:keyOf(n),Q=efQs(k),i=0,ok=0;if(!Q.length){fin({ok:false});return;}
function q(){var x=Q[i];el.innerHTML='<div class="z3e"><div class="z3e-top"><b>📻 В эфире</b><span>вопрос '+(i+1)+' из '+Q.length+' · верно '+ok+'</span></div><p class="z3e-q">'+esc(x.t)+'</p><div class="z3p-vo">'+
x.o.map(function(w){return'<button type="button" class="z3p-vb" data-w="'+esc(w)+'">'+esc(w.toUpperCase())+'</button>';}).join('')+'</div></div>';
[].forEach.call(el.querySelectorAll('.z3p-vb'),function(b){b.onclick=function(){var w=b.getAttribute('data-w'),good=w===x.w;if(good){ok++;try{SND.word(4,ok);}catch(e){}}else{try{SND.bad();}catch(e){}}
[].forEach.call(el.querySelectorAll('.z3p-vb'),function(y){y.disabled=true;if(y.getAttribute('data-w')===x.w)y.classList.add('ok');else if(y===b)y.classList.add('no');});
setTimeout(function(){i++;if(i<Q.length)q();else end();},650);};});}
function end(){if(from!=='level')lsS('z3-ef',{k:tk(),n:ok});ev('ef',{n:ok});
el.innerHTML='<div class="z3p-fin"><div class="z3p-av">'+zina(ok>=7?'happy':'norm')+'</div><p>'+ok+' из '+Q.length+'! '+(ok>=9?'Умница вечера — это про тебя.':ok>=6?'Хороший эфир. Галя бы позвонила поздравить.':'Эфир — дело живое. Завтра в семь — снова.')+'</p>'+
'<button type="button" class="btn green z3e-nx">Дальше ▶</button></div>';
el.querySelector('.z3e-nx').onclick=function(){snd();var c=0;if(from==='paper'){var z=Z();if(!(z.w&BIT.ef)){z.w|=BIT.ef;if(!(z.s&BIT.ef)){z.s|=BIT.ef;z.t++;}c=give(Math.max(1,ok));sv();}}fin({ok:ok>=5,m:Q.length-ok});};}
q();};
var cssOn=0;
function css(){if(cssOn)return;cssOn=1;var s=document.createElement('style');s.setAttribute('data-z3p','1');s.textContent=
'.z3p-scr{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--z3-bg);color:var(--z3-ink);font-family:var(--z3-font)}'+
'.z3p-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:3px double var(--z3-ink);background:var(--z3-paper)}.z3p-back{white-space:nowrap;flex:0 0 auto;min-height:44px}'+
'.z3p-mast{display:flex;flex-direction:column;min-width:0;line-height:1.15}.z3p-mast b{font:700 21px var(--z3-font-head);color:var(--z3-ink)}.z3p-mast small{font-size:13.5px;color:var(--z3-ink2)}'+
'.z3p-body{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px 12px 28px;max-width:640px;width:100%;margin:0 auto;box-sizing:border-box}'+
'.z3p-sheet{background:var(--z3-paper);border:1px solid var(--z3-line);border-radius:6px;padding:10px 12px;box-shadow:var(--z3-shadow)}'+
'.z3p-front{display:flex;gap:10px;align-items:center;padding-bottom:8px;border-bottom:1px dashed var(--z3-line)}.z3p-front h3{margin:0 0 2px;font:700 16px var(--z3-font-head)}.z3p-front p{margin:0;font-size:15px;line-height:1.35}'+
'.z3p-av{flex:0 0 58px;width:58px;height:58px}.z3p-av svg{width:100%;height:100%}'+
'.z3p-row{display:flex;align-items:center;gap:10px;width:100%;margin:8px 0 0;padding:9px 12px;min-height:56px;border:1.5px solid var(--z3-line);border-radius:var(--z3-rb);background:var(--z3-paper);text-align:left;cursor:pointer;font:inherit;color:inherit}'+
'.z3p-row.z3p-eve{border-color:var(--z3-blue)}.z3p-ri{font-size:24px;flex:0 0 auto}.z3p-rt{flex:1;display:flex;flex-direction:column;line-height:1.25;min-width:0}'+
'.z3p-rt b{font:700 16.5px var(--z3-font-head);color:var(--z3-ink)}.z3p-rt small{font-size:13.5px;color:var(--z3-ink2)}.z3p-row em{font-style:normal;font-weight:700;font-size:14px;color:var(--z3-ok);white-space:nowrap}'+
'.z3p-evbar{height:12px;background:var(--z3-line);border-radius:6px;overflow:hidden;margin:6px 0}.z3p-evbar i{display:block;height:100%;background:var(--z3-acc)}.z3p-evw span{display:inline-block;margin:3px 4px 3px 0;padding:2px 8px;border:1px solid var(--z3-line);border-radius:10px;font-size:14px}'+
'.z3p-note{font-size:14.5px;color:var(--z3-ink2);text-align:center;margin:12px 4px}.z3p-arb{display:block;margin:12px auto 0;min-height:44px}.z3p-sm{font-size:13.5px;color:var(--z3-ink2);margin:6px 0}'+
'.z3p-blk{margin:0 0 12px;padding-bottom:10px;border-bottom:1px dashed var(--z3-line)}.z3p-blk:last-child{border-bottom:0}.z3p-blk h4{margin:0 0 6px;font:700 16px var(--z3-font-head)}.z3p-blk p{margin:4px 0;font-size:15px;line-height:1.4}'+
'.z3p-ad{font-style:italic}.z3p-ep p b{color:var(--z3-acc)}'+
'.z3p-rate{display:inline-flex;gap:6px;vertical-align:middle;margin-left:4px}.z3p-rate button{min-width:44px;min-height:36px;border:1px solid var(--z3-line);border-radius:18px;background:var(--z3-paper);font-size:17px;cursor:pointer}.z3p-rate i{font-size:13.5px;color:var(--z3-ink2)}'+
'.z3p-vo{display:flex;flex-direction:column;gap:8px;margin:8px 0}.z3p-vb{min-height:48px;padding:8px 12px;border:1.5px solid var(--z3-line);border-radius:var(--z3-rb);background:var(--z3-paper);font:inherit;font-size:15.5px;color:var(--z3-ink);text-align:left;cursor:pointer}'+
'.z3p-vb.on{border-color:var(--z3-acc);font-weight:700}.z3p-vb.ok{border-color:var(--z3-ok);color:var(--z3-ok);font-weight:700}.z3p-vb.no{border-color:var(--z3-acc);color:var(--z3-acc)}.z3p-pc{color:var(--z3-ink2);font-weight:400}.z3p-q{font-weight:700}'+
'.z3p-bar{position:relative;display:flex;align-items:center;gap:8px;margin:6px 0;font-size:14px}.z3p-bar span{flex:1}.z3p-bar i{display:block;height:10px;max-width:40%;background:var(--z3-acc);border-radius:5px}.z3p-bar b{width:40px;text-align:right}'+
'.z3p-alist{display:flex;flex-direction:column;gap:6px}.z3p-ai{display:flex;align-items:baseline;gap:10px;min-height:48px;padding:8px 12px;border:1px solid var(--z3-line);border-radius:var(--z3-rb);background:var(--z3-paper);font:inherit;color:inherit;text-align:left;cursor:pointer}'+
'.z3p-ai b{font-family:var(--z3-font-head)}.z3p-ai small{flex:1;color:var(--z3-ink2);font-size:13.5px}.z3p-ai em{font-style:normal;color:var(--z3-ok);font-weight:700;font-size:14px}'+
'.z3p-rd.ok h4{color:var(--z3-ok)}.z3p-hint{font-size:16px!important;font-weight:600}.z3p-ans{font-weight:700;color:var(--z3-ok);font-size:16px!important}'+
'.z3p-slots{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}.z3p-slots span{width:34px;height:40px;border-bottom:3px solid var(--z3-ink);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px}.z3p-slots.bad span{border-color:var(--z3-acc);color:var(--z3-acc)}'+
'.z3p-tiles{display:flex;gap:6px;flex-wrap:wrap}.z3p-tiles button{min-width:44px;min-height:44px;border:1.5px solid var(--z3-line);border-radius:10px;background:var(--z3-paper);font:700 18px var(--z3-font);color:var(--z3-ink);cursor:pointer}.z3p-tiles button:disabled{opacity:.3}'+
'.z3p-row2{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px}.z3p-row2 .btn{min-height:44px}'+
'.z3p-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;background:rgba(30,22,10,.55);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}'+
'.z3p-ovp{background:var(--z3-paper);color:var(--z3-ink);border-radius:var(--z3-r);padding:14px;max-width:440px;width:100%;max-height:100%;overflow-y:auto;box-sizing:border-box;box-shadow:var(--z3-shadow);text-align:center}'+
'.z3p-ovp h3{margin:4px 0 8px;font:700 19px var(--z3-font-head)}.z3p-ovp p{font-size:15px;line-height:1.35;margin:6px 0}.z3p-ovp .z3p-av{margin:0 auto}'+
'.z3p-parts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0}.z3p-parts button{min-height:44px;padding:6px 10px;border:1.5px solid var(--z3-line);border-radius:22px;background:var(--z3-paper);font:inherit;font-size:14px;color:var(--z3-ink);cursor:pointer}'+
'.z3p-parts button.on{border-color:var(--z3-acc);background:var(--z3-acc);color:var(--z3-acc-ink)}.z3p-pre{font-style:italic;font-weight:600}'+
'.z3p-fin{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;padding:10px 0}.z3p-fin p{margin:0;font-size:15.5px;line-height:1.35}.z3p-fin .btn{min-height:46px;min-width:160px}'+
'.z3p-scr.z3p-dk{position:relative;overflow:hidden;background:var(--z3-bg)}.z3p-dkbg{position:absolute;left:0;top:0;right:0;bottom:0;z-index:0}.z3p-dkbg svg{display:block;width:100%;height:100%}'+
'.z3p-dkback{position:absolute!important;left:10px;top:10px;z-index:3}'+
'.z3p-dks{position:absolute;z-index:2;display:flex;flex-direction:column;box-sizing:border-box;padding:10px 12px 0;min-height:0}.z3p-dks .z3-mast .t{font-size:44px}'+
'.z3p-dks .z3p-body{flex:1;min-height:0;padding:8px 2px 20px;max-width:none}.z3p-dks .z3p-sheet{background:transparent;border:0;box-shadow:none;padding:0;max-width:640px;margin:0 auto}'+
'.z3p-dks .z3p-body>*{max-width:640px;margin-left:auto;margin-right:auto}.z3p-dkh{margin:8px 0 0;text-align:center;font:700 19px var(--z3-font-head);color:var(--z3-ink)}'+
'.z3p-thx{margin-top:12px;border-bottom:0}.z3p-thx h4{color:var(--z3-acc)}'+
'.z3p-front.z3p-fest h3{color:var(--z3-red)}.z3p-fn{font-style:italic;margin:2px 0 4px!important}.z3p-row.z3p-festr{border-color:var(--z3-red)}.z3p-gold h4{color:var(--z3-acc)}'+
'.z3f-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.z3f-th{display:flex;flex-direction:column;line-height:1.2}.z3f-th small{font-size:13.5px;color:var(--z3-ink2)}.z3f-th b{font:700 17px var(--z3-font-head)}'+
'.z3f-ct{font-weight:700;color:var(--z3-ink2);font-size:14px;white-space:nowrap}.z3f-cur{min-height:26px;text-align:center;font-weight:700;font-size:18px;letter-spacing:2px;margin:6px 0}.z3f-cur.ok{color:var(--z3-ok)}.z3f-cur.bad{color:var(--z3-acc)}.z3f-cur.warn{color:var(--z3-blue);letter-spacing:0;font-size:15px}'+
'.z3f-wrap{position:relative;max-width:330px;max-width:min(330px,calc((100vh - 250px)*.75));min-width:240px;margin:0 auto}.z3f-ln{position:absolute;left:0;top:0;pointer-events:none;z-index:1}.z3f-ln polyline{fill:none;stroke-width:14;stroke-linecap:round;stroke-linejoin:round;opacity:.45}'+
'.z3f-ln .on{stroke:var(--z3-ink2)}.z3f-ln .th{stroke:var(--z3-blue)}.z3f-ln .sp{stroke:var(--z3-acc)}'+
'.z3f-g{position:relative;z-index:2;display:grid;grid-template-columns:repeat(6,1fr);gap:2px;touch-action:none;user-select:none;-webkit-user-select:none}'+
'.z3f-c{display:flex;align-items:center;justify-content:center;aspect-ratio:1/1}.z3f-c b{display:flex;align-items:center;justify-content:center;width:76%;height:76%;border-radius:50%;font:700 19px var(--z3-font);color:var(--z3-ink);cursor:pointer}'+
'.z3f-c.on b{background:var(--z3-line)}.z3f-c.th b{background:var(--z3-blue);color:#fff}.z3f-c.sp b{background:var(--z3-acc);color:var(--z3-acc-ink)}.z3f-c.hn b{box-shadow:0 0 0 3px var(--z3-blue) inset}'+
'.z3f-bar{display:flex;gap:8px;justify-content:center;margin-top:10px}.z3f-bar .btn{min-height:44px}.z3f-rule{text-align:center}'+
'.z3v-tb{display:flex;gap:8px;align-items:center;justify-content:center;margin:6px 0}.z3v-tb .btn{min-height:44px}.z3v-er{font-size:13.5px;color:var(--z3-ink2)}'+
'.z3v-grid{display:grid;grid-template-columns:auto repeat(10,minmax(0,1fr));gap:1px;max-width:380px;margin:0 auto;touch-action:none;user-select:none;-webkit-user-select:none}'+
'.z3v-corner{}.z3v-cc{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:13.5px;line-height:1.05;font-weight:700;color:var(--z3-ink);padding-bottom:2px}.z3v-cc i{font-style:normal}'+
'.z3v-rc{display:flex;align-items:center;justify-content:flex-end;font-size:13.5px;font-weight:700;padding-right:4px;white-space:nowrap}'+
'.z3v-c{aspect-ratio:1/1;background:var(--z3-paper);border:1px solid var(--z3-line);box-sizing:border-box;position:relative;cursor:pointer}.z3v-c:nth-child(11n+7){border-left-color:var(--z3-ink2)}'+
'.z3v-c.x{background:var(--z3-acc)}.z3v-c.o::after{content:"·";position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;color:var(--z3-ink2)}'+
'.z3v-c.bad{background:var(--z3-line)}.z3v-c.bad::after{content:"✕";position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;color:var(--z3-acc);font-size:12px}'+
'.z3v-grid.done .z3v-c{border-color:transparent}.z3v-end{margin-top:10px}'+
'.z3e-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:14px;color:var(--z3-ink2)}.z3e-top b{color:var(--z3-acc);font-size:16px}.z3e-q{font-size:17px;line-height:1.4;font-weight:600;margin:12px 0}';
document.head.appendChild(s);}
P.ui=1;
})();
