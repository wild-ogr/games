'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.IGR||window.Z4IX)return;
var X=Z.IGR,esc=X.esc,D=document;
var IX=window.Z4IX={};
if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4i==null)ZBECO.cap.z4i=15;
function $$(id){return D.getElementById(id);}
function give(n,why){var k=0;try{k=window.ZBECO&&ZBECO.give?ZBECO.give('z4i',n,'quest'):0;}catch(e){}if(k)try{updCoins();}catch(e){}if(k)X.ev('rw',{c:k,w:why});return k;}
function snd(k){try{SND[k]();}catch(e){}}
function face(m){try{return zinaSVG(m||'happy');}catch(e){return'';}}
function T(k,c,d){return Z.txt(k,c)||d||'';}
function sv(){try{save();}catch(e){}}
function rnd(a){return a[Math.random()*a.length|0];}
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.random()*(i+1)|0,t=a[i];a[i]=a[j];a[j]=t;}return a;}
function calm(){try{return typeof CALM==='function'&&CALM();}catch(e){return false;}}
var POOL=null,PSET=null;
IX.pool=function(){if(POOL)return POOL;var u={},r=[];
try{for(var i=0;i<LEVELS.length;i++){var w=LEVELS[i].w;for(var j=0;j<w.length;j++){var s=w[j][0];if(s.length>=3&&s.length<=8&&!u[s]&&!/ё/.test(s)){u[s]=1;r.push(s);}}}}catch(e){}
PSET=u;return(POOL=r);};
function cnt(w){var c={};for(var i=0;i<w.length;i++)c[w[i]]=(c[w[i]]||0)+1;return c;}
function fits(w,c){var m={};for(var i=0;i<w.length;i++){var ch=w[i];m[ch]=(m[ch]||0)+1;if(m[ch]>(c[ch]||0))return false;}return true;}
function subs(base,pool){var c=cnt(base);return pool.filter(function(w){return w!==base&&w.length<=base.length&&fits(w,c);});}
function lay(words,maxw,maxh,want,tries){var best=null;tries=tries||40;want=Math.min(want||words.length,words.length);
for(var t=0;t<tries;t++){
var order=[words[0]].concat(words.slice(1).map(function(w){return[w,-w.length+Math.random()*2.5];}).sort(function(a,b){return a[1]-b[1];}).map(function(x){return x[0];}));
var grid={},placed=[];
var cell=function(x,y){return grid[x+','+y];};
var can=function(w,x,y,d){var dx=d?0:1,dy=d?1:0,cr=0;if(cell(x-dx,y-dy)||cell(x+dx*w.length,y+dy*w.length))return-1;
for(var i=0;i<w.length;i++){var cx=x+dx*i,cy=y+dy*i,g=cell(cx,cy);
if(g){if(g[0]!==w[i]||g[1]&(1<<d))return-1;cr++;}else if(cell(cx+dy,cy+dx)||cell(cx-dy,cy-dx))return-1;}return cr;};
var put=function(w,x,y,d){var dx=d?0:1,dy=d?1:0;for(var i=0;i<w.length;i++){var k=(x+dx*i)+','+(y+dy*i),g=grid[k];grid[k]=[w[i],(g?g[1]:0)|(1<<d)];}placed.push([w,x,y,d]);};
var box=function(ex){var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(var k in grid){var p=k.split(','),a=+p[0],b=+p[1];if(a<x0)x0=a;if(a>x1)x1=a;if(b<y0)y0=b;if(b>y1)y1=b;}
if(ex){x0=Math.min(x0,ex[0]);x1=Math.max(x1,ex[1]);y0=Math.min(y0,ex[2]);y1=Math.max(y1,ex[3]);}return[x0,x1,y0,y1];};
var w0=order[0],d0=w0.length>maxw?1:w0.length>maxh?0:(Math.random()<.5?0:1);if(w0.length>(d0?maxh:maxw))return null;
put(w0,0,0,d0);
for(var oi=1;oi<order.length&&placed.length<want;oi++){var w=order[oi],opts=[];
for(var key in grid){var gg=grid[key],pp=key.split(','),gx=+pp[0],gy=+pp[1];
for(var d=0;d<2;d++){if(gg[1]&(1<<d))continue;
for(var i=0;i<w.length;i++){if(w[i]!==gg[0])continue;var x=d?gx:gx-i,y=d?gy-i:gy,cr=can(w,x,y,d);if(cr<=0)continue;
var b=box([x,x+(d?0:w.length-1),y,y+(d?w.length-1:0)]),bw=b[1]-b[0]+1,bh=b[3]-b[2]+1;if(bw>maxw||bh>maxh)continue;
opts.push([cr*3-bw*bh*.08-Math.abs(bw-bh)*.3+Math.random(),x,y,d]);}}}
if(!opts.length)continue;opts.sort(function(a,b){return b[0]-a[0];});var o=Math.random()<.7?opts[0]:opts[Math.min(opts.length-1,Math.random()*3|0)];put(w,o[1],o[2],o[3]);}
if(placed.length<want)continue;
var bb=box(),bw=bb[1]-bb[0]+1,bh=bb[3]-bb[2]+1,n=0;for(var q in grid)n++;var sc=bw*bh+Math.abs(bw-bh)*2-n*.5;
if(!best||sc<best.sc)best={sc:sc,g:[bw,bh],w:placed.map(function(p){return[p[0],p[1]-bb[0],p[2]-bb[2],p[3]];})};}
return best;}
IX.lay=lay;
var VOW='аеёиоуыэюя';
function syl(w){var v=[],i,r=[],s=0;for(i=0;i<w.length;i++)if(VOW.indexOf(w[i])>=0)v.push(i);if(v.length<2)return[w];
for(i=0;i<v.length-1;i++){var a=v[i],b=v[i+1],c=b-a-1,cut;
if(c===0)cut=a+1;else if(c===1)cut=w[a+1]==='й'?a+2:a+1;else{cut=a+2;}
while(cut<b&&/[ьъ]/.test(w[cut]))cut++;if(cut<b&&w[cut-1]!=='й'&&w[cut]==='й')cut++;
r.push(w.slice(s,cut));s=cut;}
r.push(w.slice(s));return r;}
IX.syl=syl;
function chapWords(){var r=[],u={};try{var c=Math.floor(Math.min(+S.lv||0,LEVELS.length-1)/20)*20;
for(var i=c;i<c+20&&i<LEVELS.length;i++)LEVELS[i].w.forEach(function(x){if(!u[x[0]]){u[x[0]]=1;r.push(x[0]);}});}catch(e){}return r;}
function mk(l,L,extra){var o={l:l,w:L.w,g:L.g};for(var k in extra)o[k]=extra[k];return o;}
IX.gen={};
IX.gen.big=function(){var P=IX.pool(),C=chapWords(),tries=0;
var seeds=shuf(C.filter(function(w){return w.length===5&&PSET[w];})).concat(shuf(P.filter(function(w){return w.length===5;})),shuf(P.filter(function(w){return w.length===4;})));
for(var i=0;i<seeds.length&&tries<60;i++){var sd=seeds[i],sb=subs(sd,P);if(sb.length<3)continue;tries++;
var L=lay([sd].concat(shuf(sb).slice(0,8)),6,6,Math.min(6,1+sb.length),30);if(L&&L.w.length>=4)return mk(shuf(sd.split('')).join(''),L,{d:sd,k:'big'});}
return null;};
IX.gen.two=function(){var P=IX.pool(),seeds=shuf(P.filter(function(w){return w.length===7||w.length===6;})),tries=0;
for(var i=0;i<seeds.length&&tries<250;i++){var sd=seeds[i],sb=subs(sd,P);if(sb.length<6)continue;tries++;
var all=shuf(sb),tw=null;for(var j=0;j<all.length;j++)if(all[j].length>=4){tw=all[j];break;}if(!tw)continue;
var rest=all.filter(function(w){return w!==tw;}),h=Math.ceil(rest.length/2),A=[sd].concat(rest.slice(0,h)),B=[tw].concat(rest.slice(h));
var LA=lay([sd,tw].concat(A.slice(1)),8,3,5,30);if(!LA||LA.w.length<3)continue;
var inA={};LA.w.forEach(function(x){inA[x[0]]=1;});if(!inA[tw])continue;
var BB=[tw].concat(rest.filter(function(w){return!inA[w];}));if(BB.length<3)continue;
var LB=lay(BB,8,3,5,30);if(!LB||LB.w.length<3)continue;
var gw=Math.max(LA.g[0],LB.g[0]),ax=(gw-LA.g[0])>>1,bx=(gw-LB.g[0])>>1,by=LA.g[1]+1;
var W=LA.w.map(function(x){return[x[0],x[1]+ax,x[2],x[3]];}).concat(LB.w.map(function(x){return[x[0],x[1]+bx,x[2]+by,x[3]];}));
return{l:shuf(sd.split('')).join(''),w:W,g:[gw,by+LB.g[1]],d:sd,k:'two',tw:tw,by:by,na:LA.w.length};}
return null;};
var SY=null;
function syIdx(){if(SY)return SY;var P=IX.pool(),r=[];P.forEach(function(w){var s=syl(w);if(s.length>=2&&s.length<=3&&s.every(function(x){return x.length<=4&&/[аеёиоуыэюя]/.test(x);}))r.push([w,s]);});return(SY=r);}
function fromP(s,pc){var c={};pc.forEach(function(p){c[p]=(c[p]||0)+1;});for(var i=0;i<s.length;i++){if(!c[s[i]])return false;c[s[i]]--;}return true;}
IX.gen.slog=function(){var I=syIdx(),seeds=shuf(I.filter(function(x){return x[1].length===3;})),tries=0;
for(var i=0;i<seeds.length&&tries<80;i++){tries++;var pc=seeds[i][1].slice();
while(pc.length<6){var best=null,bn=-1;
var cand={};I.forEach(function(x){if(x[1].some(function(s){return pc.indexOf(s)>=0;}))x[1].forEach(function(s){cand[s]=1;});});
var I2=I.filter(function(x){return x[1].every(function(y){return pc.indexOf(y)>=0||cand[y];});});
for(var s in cand){var t=pc.concat([s]),n=0;for(var j=0;j<I2.length;j++)if(fromP(I2[j][1],t))n++;if(n>bn||(n===bn&&Math.random()<.3)){bn=n;best=s;}}
if(!best)break;pc.push(best);}
var ws=I.filter(function(x){return fromP(x[1],pc);}).map(function(x){return x[0];});
var sd=seeds[i][0];ws=[sd].concat(shuf(ws.filter(function(w){return w!==sd;})));if(ws.length<4)continue;
var L=lay(ws.slice(0,9),8,7,Math.min(6,ws.length),30);if(!L||L.w.length<4)continue;
pc=shuf(pc);return mk(pc.join(''),L,{d:sd,k:'slog',s:pc});}
return null;};
var P=null,wrapped=0,TIT={two:'Две тетради',slog:'Слово-половинки',big:'Чашка чая'},SUB={two:'📒📒 Слово-двойник — в обе тетради',slog:'✂️ Слова из кусочков',big:'☕ Крупно и коротко'},
RC={two:'#e1eaf7',slog:'#f3e6d6',big:'#e6efdc'},RW={two:6,slog:6,big:3};
function css(){if($$('z4i-css'))return;var e=D.createElement('style');e.id='z4i-css';
e.textContent='body.z4i-two #grid .cell.z4i-b{box-shadow:inset 0 0 0 2px var(--z3-blue,#2563c9)}'+
'body.z4i-slog #wheel .let{letter-spacing:-.03em;text-transform:uppercase}'+
'body.z4i-big #preview .w{font-size:1.25em}'+
'.z4i-scr .z4i-bl{position:relative;margin:6px auto}.z4i-scr .z4i-l{position:absolute;border-radius:50%;border:0;font:700 26px var(--z3-font);text-transform:uppercase;'+
'background:var(--z3-card,#fff);color:var(--z3-ink,#27324a);box-shadow:var(--z3-shadow);cursor:pointer;padding:0}'+
'.z4i-scr .z4i-l.on{background:var(--z3-acc,#c2410c);color:var(--z3-acc-ink,#fff)}.z4i-scr .z4i-l.nw{animation:z4idrop .45s ease-out}'+
'@keyframes z4idrop{from{transform:translateY(-40px);opacity:0}to{transform:none;opacity:1}}'+
'@media (prefers-reduced-motion:reduce){.z4i-scr .z4i-l.nw{animation:none}}'+
'.z4i-scr .z4i-shelf{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;min-height:36px;max-height:118px;overflow-y:auto;margin:6px 0}'+
'.z4i-scr .z4i-shelf span{padding:5px 10px;border-radius:10px;background:var(--z3-paper,#fbf7ec);border:1px solid var(--z3-line,#e6dcc8);font-size:16px;text-transform:uppercase}'+
'.z4i-scr .z4i-pv{min-height:40px;font:700 26px var(--z3-font);letter-spacing:.08em;text-transform:uppercase;margin:4px 0}'+
'.z4i-scr .z4i-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:6px 0}.z4i-scr .z4i-btns .btn{min-height:48px;font-size:17px}';
D.head.appendChild(e);}
function relay(){if(typeof G==='undefined'||!G||!G.z4i||G.z4i.k!=='slog')return;var n=G.letters.length;
D.querySelectorAll('#wheel .let').forEach(function(e,i){var t=G.letters[i]||'',ls=parseFloat(e.style.width)||60;e.style.fontSize=Math.round(ls*(t.length>=4?.3:t.length===3?.37:t.length===2?.48:.6))+'px';});}
function wrap(){if(wrapped)return;wrapped=1;css();
var oLD=levelData;levelData=function(){if(P&&P.arm)return P.lv;return oLD.apply(this,arguments);};
var oLK=levelKey;levelKey=function(){if(P&&P.arm)return'I4';return oLK.apply(this,arguments);};
var oRb=ribbon;ribbon=function(){oRb.apply(this,arguments);var f=P&&P.arm?P:typeof G!=='undefined'&&G&&G.z4i;if(!f)return;
var r=$$('gRib'),gs=$$('gSub'),gt=$$('gTitle'),c=RC[f.k];if(!r||!gs)return;
r.style.setProperty('--rc',c);r.style.setProperty('--rb',typeof shade==='function'?shade(c,.28):c);
gs.dataset.full=SUB[f.k];gs.dataset.short=SUB[f.k].split(' ')[0];gs.title='';if(gt)gt.textContent=TIT[f.k];if(typeof fitSub==='function')fitSub();};
var oLW=layoutWheel;layoutWheel=function(){var r=oLW.apply(this,arguments);try{relay();}catch(e){}return r;};
ZB.startHook.unshift(function(info){if(P&&P.arm)info.mode='z4i';else D.body.classList.remove('z4i-two','z4i-slog','z4i-big');});
var oFin=finishLevel;finishLevel=function(g){if(!g||!g.z4i)return oFin.apply(this,arguments);return fin(g);};
var oWin=winModal;winModal=function(g,r,again){if(!g||!g.z4i)return oWin.apply(this,arguments);return win(g,r,again);};
ZB.on('screen',function(sc){if(sc!=='game')D.body.classList.remove('z4i-two','z4i-slog','z4i-big');});
Z.onWord(function(o){var g=o.G;if(!g||!g.z4i||g.z4i.k!=='two'||o.bonus||g.won)return;
var tw=g.words.filter(function(x){return x.w===o.w&&!x.found;});if(!tw.length)return;
tw.forEach(function(wd){wd.found=true;wordCells(wd).forEach(function(c,i){openCell(c,250+i*70,'z4i-tw');});});
try{Z.score.add(o.w.length*10,'z4i.twin');}catch(e){}g.z4i.tw=1;X.ev('twin',{w:o.w.length});
setTimeout(function(){if(G!==g||g.won)return;try{zina(T('z4i.two.twin',{w:o.w},'Слово-двойник! «'+o.w+'» — сразу в обе тетради. Двойная радость.'),'wow',6);}catch(e){}
try{saveCur();checkAutoFound();checkWin();}catch(e){}},250+o.w.length*70+60);});}
function play(k,again){var lv=null;for(var gi=0;gi<3&&!lv;gi++)try{lv=IX.gen[k]();}catch(e){lv=null;}
if(!lv){try{toast('Зина не нашла слов для такого уровня — попробуй позже',3000);}catch(e){}return;}
wrap();
var go=function(){P={k:k,lv:lv,arm:true};try{delete S.curs.I4;}catch(e){}var oL=STAT.lvl;STAT.lvl=function(){return oL.call(STAT,(+S.lv||0)+1,'z4i',{e:k});};
try{startLevel(Math.max(0,Math.min(+S.lv||0,LEVELS.length-1)),false);}finally{STAT.lvl=oL;if(P)P.arm=false;}
if(typeof G==='undefined'||!G||G.lv!==lv)return;
G.z4i={k:k};G.mode='z4i';D.body.classList.remove('z4i-two','z4i-slog','z4i-big');D.body.classList.add('z4i-'+k);
if(G.rid){try{wordCells(G.rid).forEach(function(c){c.el.classList.remove('rid');});}catch(e){}G.rid=null;}
if(k==='slog'){G.letters=lv.s.slice();try{buildWheel();}catch(e){}}
if(k==='two')G.cells.forEach(function(c){if(c.y>=lv.by&&c.el)c.el.classList.add('z4i-b');});
X.ev('lv',{k:k,n:lv.w.length,r:again?1:0});
var s={two:T('z4i.two.start',0,'Две тетради сразу проверяю. Одно слово стоит в обеих — найдёшь его, и обе тетради скажут спасибо.'),
slog:T('z4i.slog.start',0,'Сегодня в круге не буквы, а кусочки слов. Собирай слово из кусочков: ПО-ДУШ-КА.'),
big:T('z4i.big.start',0,'Уровень на одну чашку чая. Буквы крупные, слов немного — успеешь, пока не остыл.')}[k];
try{zina(s,'happy',9);}catch(e){}ribbon(G.idx,false);};
if(!again&&typeof maybeInterstitial==='function')maybeInterstitial(go);else go();}
IX.play=play;
function fin(g){var k=g.z4i.k,z=X.zz(),t=X.tk(),first=false,rw=0;
if(k==='two'){first=+z.td!==t;if(first){z.td=t;z.tn=(+z.tn||0)+1;}}
else if(k==='big'){first=+z.bd!==t;if(first){z.bd=t;z.bn=(+z.bn||0)+1;}}
else{var c=X.chap();first=+z.sc<c;if(first){z.sc=c;z.sn=(+z.sn||0)+1;}}
try{delete S.curs[g.key];}catch(e){}rw=first?give(RW[k],k):0;sv();try{cloudSoon();}catch(e){}
X.ev('end',{k:k,f:first?1:0,c:rw,s:Math.round((Date.now()-(g.t0||Date.now()))/1000),tw:g.z4i.tw?1:0});
return{first:first,reward:rw,base:rw,dw:null,isNew:false,streak:0,sbonus:0,exc:!g.hinted,exBonus:0,exLoud:false,week:0,chap:0,dk:0,rankUp:'',test:false,z4i:k};}
function win(g,r,again){var k=g.z4i.k,n=g.words.length,h={two:'Обе тетради проверены!',slog:'Сложилось!',big:'Чай допит — уровень тоже!'}[k];
var body='<div style="width:96px;height:96px;margin:4px auto">'+face('happy')+'</div><p style="font-size:17px">'+
esc(k==='two'?T('z4i.two.win',{n:n},g.z4i.tw?'Двойник нашёлся — пятёрка в обе тетради.':'Пятёрка в обе тетради. Двойник, правда, сам вписался.'):
k==='slog'?T('z4i.slog.win',{n:n},'Из кусочков — целые слова. Как я из обрезков — лоскутное одеяло.'):
T('z4i.big.win',{n:n},'Быстро и крупно. Ещё по чашечке?'))+'</p>'+
(k==='slog'&&r.first?'<p class="tmr">Следующие половинки — в новой главе.</p>':'');
modal('<div class="'+(again?'':'win')+' z4iwin"><h2>'+esc(h)+'</h2>'+body+
(r.reward?'<div class="reward big" id="mRew">+'+r.reward+' <span class="coin"></span></div>':'<p class="money">Сегодня уже было — без монет</p>')+
'<div class="btns"><button class="btn green" id="mNext">К уровню '+((+S.lv||0)+1)+' ▶</button>'+
(k!=='slog'?'<button class="btn ghost" id="z4iMore" style="min-height:44px">Ещё такой</button>':'')+
'<button class="wmenu" id="mMenu">В меню</button></div></div>');
if(typeof fitWin==='function')fitWin();
if(!again&&r.reward){snd('coin');try{coinBurst($$('mRew'),r.reward);}catch(e){}}
$$('mNext').onclick=function(){hideModal();snd('tap');try{if(typeof maybeInterstitial==='function')maybeInterstitial(function(){startLevel(S.lv,false);});else startLevel(S.lv,false);}catch(e){openMenu();}};
var m=$$('z4iMore');if(m)m.onclick=function(){hideModal();snd('tap');X.ev('more',{k:k});
if(typeof maybeInterstitial==='function')maybeInterstitial(function(){play(k,1);});else play(k,1);};
$$('mMenu').onclick=function(){hideModal();snd('tap');try{if(typeof maybeInterstitial==='function')maybeInterstitial(openMenu);else openMenu();}catch(e){openMenu();}};}
var FREQ='оооооооооееееееееаааааааааииииииинннннннттттттсссссссррррррвввввлллллккккккмммммддддппппуууууяяыыььззббггччйххжшюцщэф';
var DW=null;
function dw(){if(DW)return DW;var r=[];try{var a=DICT_MAIN.split(' ').concat(DICT_EXTRA.split(' '));if(typeof ZINA_MORE==='string'&&ZINA_MORE)a=a.concat(ZINA_MORE.split(' '));
var u={};for(var i=0;i<a.length;i++){var w=a[i];if(w&&w.length>=3&&w.length<=7&&!u[w]&&!/ё/.test(w)&&isWord(w)){u[w]=1;r.push(w);}}}catch(e){}return(DW=r);}
function avail(L,used){var c=cnt(L.join('')),n=0,W=dw();for(var i=0;i<W.length;i++)if(!used[W[i]]&&fits(W[i],c))n++;return n;}
function nv(L){var n=0;L.forEach(function(x){if(VOW.indexOf(x)>=0)n++;});return n;}
function drop(L,pos,used){var best=[];for(var t=0;t<14;t++){var ch=FREQ[Math.random()*FREQ.length|0],M=L.slice();M[pos]=ch;var v=nv(M);if(v<2||v>4)continue;
best.push([avail(M,used),ch]);}
if(!best.length)return VOW.indexOf(L[pos])>=0?'а':'т';best.sort(function(a,b){return b[0]-a[0];});return best[Math.min(best.length-1,Math.random()*3|0)][1];}
function fill(used){for(var t=0;t<40;t++){var L=[];while(L.length<7)L.push(FREQ[Math.random()*FREQ.length|0]);var v=nv(L);if(v<2||v>4)continue;if(avail(L,used)>=6)return L;}
return shuf('каторнс'.split(''));}
var B=null,keyFn=null,cur=null;
D.addEventListener('keydown',function(e){if(keyFn&&cur&&ZB.cur==='z4i')ZB.safe('z4i-key',function(){if(keyFn(e.key,e))e.preventDefault();});});
ZB.screen('z4i',{title:'Мешок букв',render:function(el){css();cur={el:el};el.innerHTML='';el.className='screen zb-scr z4i-scr';
el.style.cssText='background:var(--z3-bg,#f6f1e6);color:var(--z3-ink,#27324a);font-family:var(--z3-font);overflow-y:auto;-webkit-overflow-scrolling:touch;text-align:center';
var w=D.createElement('div');w.style.cssText='max-width:560px;margin:0 auto;padding:10px 16px 24px;box-sizing:border-box';el.appendChild(w);cur.w=w;
bagNew();}});
function bagNew(){var z=X.zz();B={L:fill({}),used:{},shelf:[],sel:[],sh:0,nw:{}};z.kn=(+z.kn||0)+1;if(+z.kd!==X.tk()){z.kd=X.tk();z.kc=0;}sv();X.ev('bag',{a2:'go',n:z.kn});
B.av=avail(B.L,B.used);bagDraw(T('z4i.bag.start',0,'Мешок букв! Слово встаёт на полку, его первая буква уходит — из мешка падает новая. Держись, пока есть слова.'),'happy');}
function bagDraw(say,mood){if(!cur||!B)return;var w=cur.w,z=X.zz(),sz=Math.min(300,Math.max(240,(cur.el.clientWidth||360)-60)),R=sz/2-36,ls=60;
var h='<div style="display:flex;align-items:center;gap:8px"><button type="button" class="btn ghost small" id="z4iBack" style="min-height:44px">← Дом</button>'+
'<b style="flex:1;font-size:18px">👜 Мешок букв</b><span style="min-width:70px;text-align:right;font-size:15px">Рекорд: '+(+z.kb||0)+'</span></div>'+
'<div style="display:flex;gap:10px;align-items:center;margin:8px 0;text-align:left"><div style="width:56px;height:56px;flex:none">'+face(mood||'norm')+'</div>'+
'<p id="z4iSay" style="flex:1;margin:0;font-size:16px;line-height:1.35">'+esc(say||'')+'</p></div>'+
'<div style="font-size:15px;color:var(--z3-ink2,#5d6781)">На полке: <b id="z4iN">'+B.shelf.length+'</b> · в круге ещё слов: <b>'+B.av+'</b></div>'+
'<div class="z4i-shelf">'+B.shelf.slice().reverse().map(function(x){return'<span>'+esc(x)+'</span>';}).join('')+'</div>'+
'<div class="z4i-pv" id="z4iPv">'+esc(B.sel.map(function(i){return B.L[i];}).join(''))+'</div>'+
'<div class="z4i-bl" style="width:'+sz+'px;height:'+sz+'px">';
for(var i=0;i<B.L.length;i++){var a=-Math.PI/2+i*2*Math.PI/B.L.length,x=sz/2+Math.cos(a)*R-ls/2,y=sz/2+Math.sin(a)*R-ls/2;
h+='<button type="button" class="z4i-l'+(B.sel.indexOf(i)>=0?' on':'')+(B.nw[i]&&!calm()?' nw':'')+'" data-i="'+i+'" style="left:'+x+'px;top:'+y+'px;width:'+ls+'px;height:'+ls+'px">'+esc(B.L[i])+'</button>';}
h+='</div><div class="z4i-btns"><button type="button" class="btn ghost" id="z4iX">✕ Стереть</button><button type="button" class="btn green" id="z4iOk">✓ Слово</button></div>'+
'<div class="z4i-btns"><button type="button" class="btn ghost" id="z4iSh">🔀 Встряхнуть мешок · 5 <span class="coin"></span></button><button type="button" class="btn ghost" id="z4iEnd">Хватит</button></div>';
w.innerHTML=h;B.nw={};
$$('z4iBack').onclick=function(){snd('tap');bagEnd(1);};
w.querySelectorAll('.z4i-l').forEach(function(b){b.onclick=function(){tapL(+b.getAttribute('data-i'));};});
$$('z4iX').onclick=function(){B.sel=[];snd('tap');bagDraw($$('z4iSay').textContent);};
$$('z4iOk').onclick=bagSubmit;$$('z4iSh').onclick=bagShake;$$('z4iEnd').onclick=function(){snd('tap');bagEnd(0);};
keyFn=function(k){k=String(k||'').toLowerCase();if(k==='enter'){bagSubmit();return true;}if(k==='backspace'){B.sel.pop();bagDraw($$('z4iSay').textContent);return true;}
if(k==='escape'){B.sel=[];bagDraw($$('z4iSay').textContent);return true;}
if(k.length===1)for(var j=0;j<B.L.length;j++)if(B.L[j]===k&&B.sel.indexOf(j)<0){tapL(j);return true;}return false;};}
function tapL(i){var p=B.sel.indexOf(i);if(p>=0){if(p===B.sel.length-1)B.sel.pop();else return;}else B.sel.push(i);snd('tap');
var pv=$$('z4iPv');if(pv)pv.textContent=B.sel.map(function(j){return B.L[j];}).join('');
cur.w.querySelectorAll('.z4i-l').forEach(function(b){b.classList.toggle('on',B.sel.indexOf(+b.getAttribute('data-i'))>=0);b.classList.remove('nw');});}
function bagSubmit(){if(!B||!B.sel.length)return;var w=B.sel.map(function(i){return B.L[i];}).join(''),say='',m='norm';
if(w.length<3)say=T('z4i.bag.short',0,'Короче трёх букв — это не слово, это вздох.');
else if(B.used[w])say=T('z4i.bag.old',{w:w},'«'+w+'» уже на полке. Два одинаковых — это уже склад.');
else if(!isWord(w)){say=T('z4i.bag.bad',{w:w},'«'+w+'»? Такого в моей тетради нет.');snd('bad');}
else{B.used[w]=1;B.shelf.push(w);var pos=B.sel[0];B.L[pos]=drop(B.L,pos,B.used);B.nw[pos]=1;snd('word');m='happy';
var z=X.zz(),n=B.shelf.length;if(n>(+z.kb||0))z.kb=n;
if(n%5===0&&(+z.kc||0)<5){var k=give(1,'bag');z.kc=(+z.kc||0)+k;}
sv();say=n%10===0?T('z4i.bag.ten',{n:n},n+' слов на полке! Полка гнётся, я горжусь.'):T('z4i.bag.ok',{w:w},'«'+w+'» — на полку. А буква «'+w[0]+'» ушла в мешок.');}
B.sel=[];B.av=avail(B.L,B.used);
if(!B.av){say=T('z4i.bag.dead',0,'Всё, в круге слов не осталось. Встряхнём мешок — или по домам?');m='stern';}
bagDraw(say,m);}
function bagShake(){if(!B)return;if((+S.coins||0)<5){try{toast('Не хватает монет',2500);}catch(e){}return;}
try{addCoins(-5);STAT.ev('spend',{k:'z4i',c:5});}catch(e){}B.sh++;X.ev('shake',{n:B.shelf.length});
B.L=fill(B.used);B.sel=[];for(var i=0;i<7;i++)B.nw[i]=1;B.av=avail(B.L,B.used);snd('shuffle');
bagDraw(T('z4i.bag.shake',0,'Встряхнула! Мешок старый, но буквы в нём ещё бодрые.'),'happy');}
function bagEnd(back){if(!B)return;var n=B.shelf.length,z=X.zz();X.ev('bag',{a2:'end',n:n,sh:B.sh,b:back?1:0});sv();try{cloudSoon();}catch(e){}
if(back||!n){B=null;keyFn=null;cur=null;try{openMenu();}catch(e){}return;}
var best=n>=(+z.kb||0);
cur.w.innerHTML='<div style="width:110px;height:110px;margin:16px auto 6px">'+face(best?'wow':'happy')+'</div>'+
'<h2 style="margin:4px 0">На полке — '+n+' '+(n%10===1&&n%100!==11?'слово':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'слова':'слов')+'</h2>'+
'<p style="font-size:16px">'+esc(best?T('z4i.bag.rec',{n:n},'Новый рекорд! Запишу на холодильник, рядом с телефоном Валерки.'):'Рекорд пока — '+(+z.kb||0)+'. Мешок никуда не денется.')+'</p>'+
'<div class="z4i-btns"><button type="button" class="btn green" id="z4iAg">Ещё мешок</button><button type="button" class="btn ghost" id="z4iHome">← Дом</button></div>';
B=null;keyFn=null;
$$('z4iAg').onclick=function(){snd('tap');bagNew();};$$('z4iHome').onclick=function(){snd('tap');cur=null;try{openMenu();}catch(e){}};}
IX.open=function(k,o){if(k==='bag'){try{dw();}catch(e){}if(typeof dictReady==='function'&&!dictReady()){try{ensureDict();toast('Достаю тетрадку со словами… нажми ещё раз через секунду',3000);}catch(e){}return;}
ZB.go('z4i',{from:(o&&o.from)||''});return;}play(k);};
})();
