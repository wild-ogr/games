'use strict';
/* rb2-event — поток EVENT буста 2.0 Рыбалки (13.10.2026). Описание, флаги, поле S.r2e, крючки — журнал hobby-analytics/release-i/rybak-boost2/logs/EVENT.md.
   Флаги: zap (Записки на мостках), klev (клёв недели), tkr (турниры по кругу), zor (Зорька), wkr (итог недели), nb (конверты новичка). Окна — лениво js/rb2-event-ui.js.
   Крючки старого кода (метка rb2-EVENT): r2eTs, r2eFmt, r2eBot, r2eBotTod. Синтаксис — старый (WebView Chrome 92). */
(function(){
var W=window;
if(typeof R2==='undefined')return;
R2.reg('zap',{s:'EVENT',t:'Записки на мостках вместо Заказов соседей, значки на кепку Петровича'});
R2.reg('klev',{s:'EVENT',t:'Клёв недели: рыба недели ×1,3 на одном месте'});
R2.reg('tkr',{s:'EVENT',t:'Турниры недели по кругу: вес, крупная, число, виды'});
R2.reg('zor',{s:'EVENT',t:'Зорька выходного дня — утренний турнир с соседями лиги'});
R2.reg('wkr',{s:'EVENT',t:'Итог недели в понедельник — окно входа'});
R2.reg('nb',{s:'EVENT',t:'Неделя новичка: конверты в окне «Утро у Петровича»'});
function on(id){return !R2.off(id);}
function st(n,o){try{STAT.ev(n,o);}catch(e){}}
function E(){return W.RECO||null;}
function trip(){try{return TRIP_C[topPlace()]||30;}catch(e){return 30;}}
function cR(a){var e=E();if(e&&e.c)return e.c(a[0],a[1]);return Math.max(a[1]||0,Math.round(a[0]*trip()/5)*5);}
function num(k,d){var e=E(),p=k.split('.'),x=e;for(var i=0;i<p.length&&x;i++)x=x[p[i]];return x||d;}
function give(src,n){var e=E();if(e&&e.give)return e.give(src,n);n=Math.round(n||0);if(n>0){S.coins+=ern(src,n);save();try{updCoins();}catch(x){}}return n;}
function day(){return dayNum();}
function wdy(d){return ((d+3)%7+7)%7;} // 0 — понедельник
function isO(o){return !!o&&typeof o==='object'&&!Array.isArray(o);}
function fx(v){v=+v;return isFinite(v)&&v>=0?Math.floor(v):0;}
function R5(n){return Math.round(n/5)*5;}

/* ================= календарь (неделя 2964 = 19–25.10.2026, понедельник) ================= */
var W0=2964;
// [кандидаты «клёва недели» по порядку, вид турнира, время турнира]
var CAL=[[['shuka','okun'],'kg'],[['som','nalim','shuka'],'kg','night'],[['sudak','shuka'],'big'],[['nalim','ersh'],'cnt'],
  [['ryapushka','sig','plotva'],'vid'],[['ersh','okun'],'kg'],[['okun','plotva'],'big'],[['nalim','ersh'],'cnt'],
  [['navaga','nalim','ersh'],'vid'],[['sig','nalim'],'kg'],[['karasz'],'vid'],[['nalim','ersh'],'kg'],
  [['snetok','ersh'],'big'],[['nalim','navaga'],'cnt'],[['navaga','nalim'],'vid'],[['ersh_nos','ersh'],'kg']];
var TT={kg:['На вес','Total weight','общий вес улова за 5 забросов','total weight of 5 casts','⚖'],
  big:['Самая крупная','Biggest fish','вес одной, самой крупной рыбы','weight of your single biggest fish','🐋'],
  cnt:['На число','Most fish','сколько рыб поймаешь за 5 забросов','how many fish in 5 casts','🔢'],
  vid:['На виды','Most species','сколько разных видов за 5 забросов','how many different species in 5 casts','🎨']};
function calOf(w){var i=w-W0;return i>=0&&i<CAL.length?CAL[i]:null;}
function wkType(w){if(R2.off('tkr'))return 'kg';var c=calOf(w);if(c)return c[1];var i=w-W0;if(i<0)return 'kg';return ['big','cnt','vid','kg'][i%4];}
function wkTod(w){if(R2.off('tkr'))return '';var c=calOf(w);return c&&c[2]||'';}
function ttName(t){var x=TT[t]||TT.kg;return L(x[0],x[1]);}

/* ================= поле S.r2e ================= */
var HN=7; // героев связок
function def(){return {v:1,z:[],zn:0,zk:0,zc:0,zs:0,ch:[0,0],hc:[0,0,0,0,0,0,0],sp:0,rc:'',kl:{w:0,n:0,d:0},zr:{d:0,b:0,s:0},nb:0,nd:0,mig:0,tv:0,ld:0};}
var NT={sp:1,kg:1,one:1,big:1,junk:1,tod:1,night:1,vid:1,nw:1,trip:1,tn:1,mg:1,uha:1,small:1};
function fixNote(n){if(!isO(n)||!NT[n.t])return null;var o={t:n.t,h:Math.min(HN-1,Math.max(-1,Math.floor(+n.h)||0)),s:Math.min(2,fx(n.s)),f:typeof n.f==='string'?n.f.slice(0,16):'',p:Math.floor(+n.p),n:Math.max(1,fx(n.n)),g:fx(n.g),c:fx(n.c),b:fx(n.b),x:fx(n.x)?1:0,k:fx(n.k)};
  if(!(o.p>=0&&o.p<PLACES.length))o.p=-1;if(n.h==null||+n.h<0)o.h=-1;return o;}
function fixE(o){var d=def();for(var k in d)if(o[k]==null)o[k]=d[k];
  ['zn','zk','zc','zs','sp','nb','nd','mig','tv','ld','v'].forEach(function(k){o[k]=fx(o[k]);});
  if(!Array.isArray(o.z))o.z=[];var z=[];for(var i=0;i<o.z.length&&z.length<3;i++){var n=fixNote(o.z[i]);if(n)z.push(n);}o.z=z;
  if(!Array.isArray(o.ch)||o.ch.length!==2)o.ch=[0,0];o.ch=[Math.min(HN-1,fx(o.ch[0])),Math.min(4,fx(o.ch[1]))];
  if(!Array.isArray(o.hc))o.hc=[];var hc=[];for(var j=0;j<HN;j++)hc.push(Math.min(999,fx(o.hc[j])));o.hc=hc;
  if(typeof o.rc!=='string')o.rc='';o.rc=o.rc.slice(0,40);
  ['kl','zr'].forEach(function(k){if(!isO(o[k]))o[k]=d[k];for(var q in d[k])o[k][q]=fx(o[k][q]);for(var q2 in o[k])if(d[k][q2]==null)delete o[k][q2];});
  for(var x in o)if(d[x]==null)delete o[x];}
function mergeE(a,b){fixE(b);
  if(b.zn>a.zn||(b.zn===a.zn&&b.zc>a.zc)){['z','zn','zk','zc','zs','ch','rc'].forEach(function(k){a[k]=b[k];});}
  for(var j=0;j<HN;j++)a.hc[j]=Math.max(a.hc[j]||0,b.hc[j]||0);
  a.sp=(a.sp|b.sp)>>>0;['nb','nd','mig','tv','ld','v'].forEach(function(k){a[k]=Math.max(a[k]||0,b[k]||0);});
  if(b.kl.w>a.kl.w)a.kl=b.kl;else if(b.kl.w===a.kl.w){a.kl.n=Math.max(a.kl.n,b.kl.n);a.kl.d=Math.max(a.kl.d,b.kl.d);}
  if(b.zr.d>a.zr.d)a.zr=b.zr;else if(b.zr.d===a.zr.d){a.zr.b=Math.max(a.zr.b,b.zr.b);a.zr.s=Math.max(a.zr.s,b.zr.s);}
  fixE(a);}
R2.field('e',{id:'r2e',def:def,fix:function(o){fixE(o);},merge:mergeE});
function X(){var o=S.r2e;if(!isO(o)){o=S.r2e=def();}return o;}

/* ================= значки на кепку Петровича: 7 героев × 5 + 5 особых = 40 ================= */
// герои: [id, имя, имя en, связка, связка en, цвет значка]
var HER=[['mit','Дед Митяй','Grandpa Mityai','Байка на спор','A fishing bet','#d9a441'],
  ['vas','Кот Васька','Vaska the cat','Кот хочет рыбки','The cat wants fish','#ec9440'],
  ['zho','Жора-перекупщик','Zhora the dealer','Заказ на рынок','Market order','#5a8fd8'],
  ['val','Тётя Валя-проводница','Aunt Valya','Рыбка к поезду','Fish for the train','#c23b5a'],
  ['wif','Жена Петровича','Petrovich\'s wife','Уха к ужину','Fish soup for dinner','#e2725b'],
  ['mih','Михалыч с лодкой','Mikhalych with a boat','Почини лодку','Fix the boat','#3f8f6a'],
  ['pet','Петрович','Petrovich','Наука','Lessons','#6a5acd']];
var SPB=[['Значок новичка','Newcomer','#7cc04a'],['Клёв недели','Bite of the week','#2f7de1'],['Зорька','Dawn contest','#f2b632'],['Четыре турнира','Four contests','#9a4fd0'],['Праздничная записка','Holiday note','#d23a32']];
function bits(n){var c=0;while(n){c+=n&1;n>>>=1;}return c;}
function badgeN(){var o=X(),n=0;for(var j=0;j<HN;j++)n+=Math.min(5,o.hc[j]||0);return n+bits(o.sp&31);}
function badgeCols(){var o=X(),c=[];for(var i=0;i<5;i++)if(o.sp&(1<<i))c.push(SPB[i][2]);for(var j=0;j<HN;j++)for(var k=0;k<Math.min(5,o.hc[j]||0);k++)c.push(HER[j][5]);return c;}
function spGive(i){var o=X();if(o.sp&(1<<i))return false;o.sp|=1<<i;save();st('zap',{a:'badge',c:'s'+i,n:badgeN()});return true;}

/* ================= «Записки на мостках» ================= */
function mo(){try{return moNow();}catch(e){return new Date().getMonth();}}
function fm(f){var a=f&&f.a2;return a&&a.m?a.m[mo()]:1;}
function opens(){var r=[];for(var i=0;i<PLACES.length;i++)if(S.open[i])r.push(i);return r;}
function baitOk(f){if((f.b.worm||0)>0)return true;for(var k in f.b)if((f.b[k]||0)>0&&(S.bait[k]||0)>0)return true;return false;}
// рыбы открытых мест «в сезоне» и на доступную наживку
function pool(flt){var out=[];opens().forEach(function(pi){PLACES[pi].fish.forEach(function(id){var f=FISH[id];if(!f||f.rar==='rb'||f.leg)return;var m=fm(f);if(m<.8||!baitOk(f))return;if(flt&&!flt(f,pi))return;out.push({id:id,pi:pi,w:f.r*m*(pi===topPlace()?2:1)});});});return out;}
function wpick(a){var t=0,i;for(i=0;i<a.length;i++)t+=a[i].w;var u=Math.random()*t;for(i=0;i<a.length;i++){u-=a[i].w;if(u<0)return a[i];}return a[a.length-1];}
function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function cntFor(f,big){var r=f.rar;return r==='common'?rnd(3,5)+(big?2:0):r==='uncommon'?rnd(2,3)+(big?1:0):r==='rare'?rnd(1,2)+(big?1:0):1;}
function kgTrip(pi){var P=PLACES[pi],s=0,n=0;P.fish.forEach(function(id){var f=FISH[id];if(f){s+=f.w[0]+(f.w[1]-f.w[0])*.2;n++;}});return n?s/n*3.2:1;}
function mgOk(){try{return !!(W.MG&&MG.dvorOpen&&MG.dvorOpen());}catch(e){return false;}}
function mgSum(id){try{var c=S.mg&&S.mg.cnt;if(!c)return 0;if(id)return +c[id]||0;var s=0;for(var k in c)s+=+c[k]||0;return s;}catch(e){return 0;}}
function albN(){var n=0;try{for(var k in S.alb)n++;}catch(e){}return n;}
function newLeft(){return pool(function(f){return !S.alb[f.id];}).length>0;}
function festFish(){var r=null;try{opens().forEach(function(pi){(PLACES[pi].evf||[]).forEach(function(id){var f=FISH[id];if(f&&evOn(f.fest)&&!r)r={id:id,pi:pi};});});}catch(e){}return r;}
// цель (сколько нужно) — у «бинарных» записок 1
function goal(n){return n.t==='big'||n.t==='tn'?1:n.t==='tod'?2:n.n;}
function done(n){return n.t==='tod'?n.g>=3:n.t==='big'?n.g>=1:n.g>=goal(n);}
function prog(n){return n.t==='tod'?bits(n.g&3):n.t==='big'?(n.g?1:0):Math.min(n.g,goal(n));}
function need(n){return n.t==='tod'||n.t==='big'?(n.t==='tod'?2:1):goal(n);}
var KEY={sp:1,kg:2,one:3,big:4,junk:5,tod:6,night:7,vid:8,nw:9,trip:10,tn:11,mg:12,uha:13,small:14};
function mk(t,o){var n={t:t,h:-1,s:0,f:'',p:-1,n:1,g:0,c:0,b:0,x:0,k:KEY[t]};for(var k in o)n[k]=o[k];return n;}
function nSp(big,flt){var a=pool(flt);if(!a.length)return null;var x=wpick(a),f=FISH[x.id];return mk('sp',{f:x.id,p:x.pi,n:cntFor(f,big)});}
function nBig(q){var a=pool(function(f){return f.w[1]>=.3;});if(!a.length)return null;var x=wpick(a),f=FISH[x.id];var g=(f.w[0]+(f.w[1]-f.w[0])*q)*1000;g=g>=1000?Math.round(g/100)*100:Math.round(g/10)*10;return mk('big',{f:x.id,p:-1,n:Math.max(50,g)});}
function nKg(m){var o=opens(),pi=o.indexOf(topPlace())>=0&&Math.random()<.6?topPlace():o[rnd(0,o.length-1)];var k=Math.max(.5,Math.round(kgTrip(pi)*m*2)/2);return mk('kg',{p:pi,n:Math.round(k*1000)});}
function nSmall(n){return mk('small',{n:n});}
function nOne(n){return mk('one',{n:n});}
function nVid(n){return mk('vid',{n:n});}
// короткая (одна рыбалка)
function genShort(){var r=Math.random();
  if(r<.45)return nSp(false,function(f){return f.rar==='common'||f.rar==='uncommon';});
  if(r<.6)return nOne(3);if(r<.72)return mk('junk',{n:1});if(r<.86)return nSmall(2);return nBig(.15);}
// средняя (2–4 рыбалки)
function genMid(){var r=Math.random();
  if(r<.3)return nKg(2.5);if(r<.45)return mk('tod',{n:2});if(r<.58&&newLeft())return mk('nw',{n:1,b:albN()});
  if(r<.7){var o=opens(),pi=o[rnd(0,o.length-1)];return mk('trip',{p:pi,n:rnd(2,3)});}
  if(r<.8)return mk('night',{n:rnd(2,4)});
  return nSp(true,function(f){return f.rar!=='common';})||nKg(2);}
// записка из связки героя h, шаг s (0..4; 4 — большая)
function genHero(h,s){var big=s===4,n=null,v=['shuka','okun','sudak','ersh','nalim','plotva','lesh','karas','ryapushka','sig','omul','treska','navaga'];
  switch(HER[h][0]){
  case 'mit':n=nBig(big?.5:.25+.05*s);break;
  case 'vas':n=Math.random()<.5?nSmall(big?8:rnd(3,4)):nSp(big,function(f){return f.w[0]<.15;});if(!n)n=nSmall(big?8:3);break;
  case 'zho':n=big?nKg(3):nSp(false);break;
  case 'val':n=big?nVid(3):nSp(false,function(f,pi){return ['vobla','chehon','lesh','gustera','ryapushka','koryushka','omul','snetok','navaga','seld_bel'].indexOf(f.id)>=0;})||nSp(false);break;
  case 'wif':if(big)n=(function(){try{if(W.MG&&MG.isOpen&&MG.isOpen('uha'))return mk('uha',{n:1,b:mgSum('uha')});}catch(e){}return nVid(3);})();
    else n=Math.random()<.5?nVid(2):nSp(false,function(f){return v.indexOf(f.id)>=0;});if(!n)n=nVid(2);break;
  case 'mih':n=mk('mg',{n:big?3:rnd(1,2),b:mgSum()});break;
  case 'pet':n=big?mk('tn',{n:1}):[nOne(3+(s>1?1:0)),mk('tod',{n:2}),mk('junk',{n:1}),newLeft()?mk('nw',{n:1,b:albN()}):nOne(3)][s%4];break;}
  if(!n)n=nOne(3);n.h=h;n.s=2;return n;}
function heroOk(h){return HER[h][0]!=='mih'||mgOk();}
function nextHero(o){var h=o.ch[0];for(var i=0;i<HN;i++){if(heroOk(h))return h;h=(h+1)%HN;}return 6;}
function recent(o,k){return (','+o.rc+',').indexOf(','+k+',')>=0;}
function pushRc(o,k){var a=o.rc?o.rc.split(','):[];a.push(String(k));while(a.length>6)a.shift();o.rc=a.join(',');}
function gen(o,slot){var n=null,tries=0;
  do{if(slot===2){o.ch[0]=nextHero(o);n=genHero(o.ch[0],o.ch[1]);}
    else{var ff=slot===1&&festFish();if(ff&&!o.z.some(function(z){return z&&z.x;})&&Math.random()<.7)n=mk('sp',{f:ff.id,p:ff.pi,n:1,x:1});
      else n=slot===0?genShort():genMid();}
    tries++;}while(n&&tries<6&&slot!==2&&(recent(o,n.t+(n.f||''))||o.z.some(function(z){return z&&z.s!==slot&&z.t===n.t&&z.f===n.f;})));
  if(!n)n=nOne(3);n.s=slot;if(slot!==2)n.h=n.x?-1:[2,1,0,3,4,6][Math.floor(Math.random()*6)];pushRc(o,n.t+(n.f||''));st('zap',{a:'new',t:n.t,s:slot+1,c:n.h});return n;}
function ensure(){var o=X();if(!S.open||!(S.sessions>0))return o;var ch=false;
  if(!o.mig){o.mig=1;ch=true;try{var od=S.ord;if(isO(od)&&od.d===dayNum()&&Array.isArray(od.l))for(var i=0;i<od.l.length;i++){var q=od.l[i];if(q&&q.g<q.n&&FISH[q.f]&&S.open[q.pi]){o.z[0]=mk('sp',{f:q.f,p:q.pi,n:q.n,g:q.g,c:q.c,h:2,s:0});break;}}}catch(e){}}
  for(var s=0;s<3;s++){var has=false;for(var j=0;j<o.z.length;j++)if(o.z[j]&&o.z[j].s===s)has=true;if(!has){o.z.push(gen(o,s));ch=true;}}
  o.z.sort(function(a,b){return a.s-b.s;});if(o.z.length>3)o.z=o.z.slice(0,3);
  if(ch)save();return o;}
function dayRoll(o){var d=day();if(o.zk!==d){o.zk=d;o.zc=0;}}
// Трескучие морозы 17–19.01: награды записок ×2 (по дате)
function frost(){try{if(W.RSEZ&&RSEZ.mul)return RSEZ.mul('zap')>=2;}catch(e){}var d=new Date(nowMs());return d.getMonth()===0&&d.getDate()>=17&&d.getDate()<=19;}
// записка выполнена: монеты (≤ perDay в день, потолок RECO 'zap'), связка, новая записка в то же место
function complete(o,n){dayRoll(o);var c=0,per=num('zap.perDay',5);
  if(o.zc<per){c=n.c||cR(num('zap.note',[.15,20]));if(frost())c*=2;c=give('zap',c);if(c||!E())o.zc++;}
  o.zn++;var res={n:n,c:c,pack:0,badge:null};
  if(n.x)spGive(4);
  if(n.s===2){o.ch[1]++;if(o.ch[1]>=5){var h=o.ch[0];o.hc[h]=(o.hc[h]||0)+1;o.ch[1]=0;o.ch[0]=(h+1)%HN;var pc=cR(num('zap.pack',[.6,60]));if(frost())pc*=2;res.pack=give('zap',pc);
      if(o.hc[h]<=5)res.badge=[h,o.hc[h]-1];st('zap',{a:o.hc[h]>5?'chest':'pack',c:h,n:badgeN(),ms:res.pack});}}
  st('zap',{a:'done',t:n.t,s:n.s+1,c:n.h,n:o.zn,ms:c});try{R2.emit('zap',{t:n.t,s:n.s+1,h:n.h,pack:res.pack?1:0,c:c});}catch(e){}try{if(W.RSEZ&&RSEZ.add)RSEZ.add('zap',n.s===2?(res.pack?5:3):n.s===1?2:1);}catch(e){}if(!c&&o.zc>=per)st('zap',{a:'cap',n:o.zn});
  var k=o.z.indexOf(n);var nn=gen(o,n.s);if(k>=0)o.z[k]=nn;else o.z.push(nn);return res;}
// итоги рыбалки → прогресс записок, клёв недели, Зорька. Идемпотентно по объекту рыбалки.
var LAST=null,DONE=[];
function evalTrip(g){if(!g||g.r2e)return;g.r2e=1;DONE=[];if(g.guest&&!g.catch)return;
  var fish=(g.catch||[]).filter(function(c){return c.id&&!c.lost;}),lost=(g.catch||[]).filter(function(c){return c.lost;}).length,junk=(g.catch||[]).filter(function(c){return c.junk;}).length;
  var tod=g.cond&&g.cond.tod,tn=!!g.tourn;
  if(on('klev')&&!tn)try{klevTrip(g,fish);}catch(e){}
  if(on('zor')&&g.zor)try{zorTrip(g,fish);}catch(e){}
  if(on('tkr')&&g.tourn==='week')try{var o2=X(),t=wkType(weekNum());o2.tv|=({kg:1,big:2,cnt:4,vid:8})[t]||0;if((o2.tv&15)===15)spGive(3);}catch(e){}
  if(R2.off('zap')||!(S.sessions>0))return;
  var o=ensure();dayRoll(o);
  for(var i=0;i<o.z.length;i++){var n=o.z[i];if(!n)continue;
    switch(n.t){
    case 'sp':if(!tn)fish.forEach(function(c){if(c.id===n.f&&(n.p<0||n.p===g.pi))n.g++;});break;
    case 'kg':if(!tn&&g.pi===n.p)fish.forEach(function(c){n.g+=Math.round(c.w*1000);});break;
    case 'one':if(!tn&&!lost)n.g=Math.max(n.g,fish.length);break;
    case 'big':if(!tn)fish.forEach(function(c){if((!n.f||c.id===n.f)&&Math.round(c.w*1000)>=n.n)n.g=1;});break;
    case 'junk':if(!tn)n.g+=junk;break;
    case 'tod':if(!tn&&fish.length)n.g|=tod==='morning'?1:tod==='evening'?2:0;break;
    case 'night':if(!tn&&(tod==='night'||tod==='evening'))n.g+=fish.length;break;
    case 'vid':if(!tn){var sp={},k=0;fish.forEach(function(c){if(!sp[c.id]){sp[c.id]=1;k++;}});n.g=Math.max(n.g,k);}break;
    case 'nw':n.g=Math.max(n.g,albN()-n.b);break;
    case 'trip':if(!tn&&g.pi===n.p)n.g++;break;
    case 'tn':if(g.tourn==='week')n.g=1;break;
    case 'small':if(!tn)fish.forEach(function(c){var f=fishOf(c.id);if(c.w<.25&&!(f&&f.leg))n.g++;});break;}}
  sweep(o);LAST=g;}
// мини-игры: прогресс по счётчику S.mg.cnt (работает и без MGREC)
function evalMg(){if(R2.off('zap'))return;var o=X(),ch=false;for(var i=0;i<o.z.length;i++){var n=o.z[i];if(!n)continue;
    if(n.t==='mg'){var v=Math.max(0,mgSum()-n.b);if(v>n.g){n.g=v;ch=true;}}else if(n.t==='uha'){var u=Math.max(0,mgSum('uha')-n.b);if(u>n.g){n.g=u;ch=true;}}}
  if(ch){var r=sweep(o);if(r.length)setTimeout(function(){r.forEach(function(x){toast('📌 '+L('Записка выполнена','Note done')+': '+heroN(x.n.h)+(x.c?' +'+coinsTxt(x.c):''),3200,true);});},300);}}
function sweep(o){var out=[];for(var i=0;i<o.z.length;i++){var n=o.z[i];if(n&&done(n)){var r=complete(o,n);out.push(r);DONE.push(r);i=-1;}}save();return out;}
function heroN(h){return h>=0?L(HER[h][1],HER[h][2]):L('Праздник','Holiday');}
// текст записки: [задание, где/подсказка]
function fN(id){var f=fishOf(id)||FISH[id];return f?nm(f).toLowerCase():id;}
function plN(p){return p>=0&&PLACES[p]?nm(PLACES[p]):'';}
function kgS(g){if(g<1000)return g+(LANG==='en'?' g':' г');var x=Math.round(g/100)/10;return String(x).replace('.',LANG==='en'?'.':',')+(LANG==='en'?' kg':' кг');}
// короткая подпись для ленты на главном (2 строки по 16 px)
function nShort(n){var c=n.n>1?' ×'+n.n:'',f=n.f?fN(n.f):'';f=f.charAt(0).toUpperCase()+f.slice(1);
  switch(n.t){case 'sp':return '🐟 '+f+c;case 'kg':return '⚖ '+kgS(n.n);case 'one':return '🎣 '+n.n+' '+L('без схода','no losses');case 'big':return '📏 '+(f||L('Рыба','Fish'))+' '+kgS(n.n)+'+';
  case 'junk':return '🥾 '+L('Находка','A find');case 'tod':return '🌅 '+L('Утро и вечер','Dawn & dusk');case 'night':return '🌙 '+L('Ночью','At night')+c;case 'vid':return '🎨 '+n.n+' '+pl(n.n,'вид','вида','видов','species','species');
  case 'nw':return '📖 '+L('Новый вид','New species');case 'trip':return '🚗 '+plN(n.p)+c;case 'tn':return '🏆 '+L('Турнир','Contest');case 'mg':return '🎲 '+L('Двор','Yard')+c;case 'uha':return '🍲 '+L('Уха','Fish soup');case 'small':return '🐈 '+L('Мелочь','Small fry')+c;}return '📌';}

/* ---- старые «Заказы соседей»: при записках — выключены (их прогресс перенесён в первую записку), вход ведёт в записки ---- */
var ao0=W.a2Orders,aol0=W.a2OrdLeft,oo0=W.openOrders;
if(typeof ao0==='function')W.a2Orders=function(){if(R2.off('zap'))return ao0.apply(this,arguments);return {d:dayNum(),l:[]};};
if(typeof aol0==='function')W.a2OrdLeft=function(){if(R2.off('zap'))return aol0.apply(this,arguments);return 0;};
if(typeof oo0==='function')W.openOrders=function(){if(R2.off('zap'))return oo0.apply(this,arguments);openZap();};
try{a2Orders=W.a2Orders;a2OrdLeft=W.a2OrdLeft;openOrders=W.openOrders;}catch(e){}

/* ================= «Клёв недели» ================= */
var KLC={};
function klevOf(w){if(R2.off('klev'))return null;w=w==null?weekNum():w;var mk_=w+':'+opens().join('.')+':'+mo();if(KLC[mk_]!==undefined)return KLC[mk_];
  var c=calOf(w),cand=c?c[0]:[],r=null;
  function at(id){var f=FISH[id];if(!f||fm(f)<.6)return -1;var best=-1;for(var i=0;i<PLACE_ORD.length;i++){var pi=PLACE_ORD[i];if(S.open[pi]&&PLACES[pi].fish.indexOf(id)>=0)best=pi;}return best;}
  for(var i=0;i<cand.length&&!r;i++){var p=at(cand[i]);if(p>=0)r={f:cand[i],pi:p};}
  if(!r){var a=pool(function(f){return fm(f)>=1.2&&f.rar!=='trophy';});a.sort(function(x,y){return x.id<y.id?-1:x.id>y.id?1:x.pi-y.pi;});if(a.length){var x=a[(w*7)%a.length];r={f:x.id,pi:at(x.id)>=0?at(x.id):x.pi};}}
  KLC[mk_]=r;return r;}
var KMUL=1.3;
var am0=W.a2Mul;
if(typeof am0==='function'){W.a2Mul=function(f,o){var x=am0.apply(this,arguments);try{if(G&&!G.tourn&&f&&!R2.off('klev')){var mn=Math.floor(Date.now()/6e4),k=G.r2kl&&G.r2kl.m===mn?G.r2kl.k:(G.r2kl={m:mn,k:klevOf()}).k;if(k&&k.f===f.id&&G.pi===k.pi)x*=KMUL; /*rb2-MERGE: klevOf один раз на рыбалку в минуту — a2Mul зовётся на каждую рыбу*/}}catch(e){}return x;};try{a2Mul=W.a2Mul;}catch(e){}}
function klevTrip(g,fish){var k=klevOf();if(!k||g.pi!==k.pi)return;var n=0;fish.forEach(function(c){if(c.id===k.f)n++;});if(!n)return;
  var o=X(),w=weekNum();if(o.kl.w!==w){o.kl={w:w,n:0,d:0};}o.kl.n+=n;st('klev',{a:'hit',f:k.f,p:k.pi,n:o.kl.n});
  if(o.kl.n>=3&&!o.kl.d){o.kl.d=1;var c=give('zap',cR(num('zap.note',[.15,20])));var b=spGive(1);st('klev',{a:'done',f:k.f,n:o.kl.n,c:c});try{R2.emit('klev',{f:k.f,pi:k.pi});}catch(e){}try{if(W.RSEZ&&RSEZ.add)RSEZ.add('klev',2);}catch(e){}
    DONE.push({kl:1,c:c,badge:b?1:null});}
  save();}

/* ================= турниры по кругу ================= */
function score(t,fish){var s=0,sp={};if(t==='cnt')return fish.length;if(t==='vid'){fish.forEach(function(c){if(!sp[c.id]){sp[c.id]=1;s++;}});return s;}
  if(t==='big'){fish.forEach(function(c){s=Math.max(s,Math.round(c.w*1000));});return s;}fish.forEach(function(c){s+=Math.round(c.w*1000);});return s;}
function fmtT(t,v){v=+v||0;if(t==='cnt')return v+' '+pl(v,'рыба','рыбы','рыб','fish','fish');if(t==='vid')return v+' '+pl(v,'вид','вида','видов','species','species');return kgTxt(v/1000);}
W.r2eTs=function(g,kg){var t=wkType(weekNum());if(t==='kg')return Math.round(kg*1000);var fish=(g.catch||[]).filter(function(c){return c.id&&!c.lost;});var s=score(t,fish);st('tkr',{a:'end',t:t,s:s});return s;};
W.r2eFmt=function(w,v){return fmtT(wkType(w==null?weekNum():w),v);};
W.r2eBot=function(w,cs,g){var t=wkType(w);if(t==='kg')return g;return score(t,cs.map(function(r){return {id:r.f.id,w:r.w};}));};
W.r2eBotTod=function(w,tod){return wkTod(w)||tod;};
// нормативы вида: по модели соседей (botCast, казённая снасть) с поправкой к TOURN_NORM места
var NC={};
function sim(w,pi,t){var R=rng(w*131+pi*7919+3),tod0=wkTod(w),a=[],k=[];
  try{if(W.META)META.botting=true;for(var q=0;q<160;q++){var sk=.25+R()*.45,tod=tod0||TODS[Math.floor(R()*4)],wx=WXS[Math.floor(R()*5)],cs=[];
    for(var c=0;c<5;c++){var r=botCast(pi,'worm',tod,wx,TOURN_TK,false,sk,R);if(r&&r.kind==='fish'&&r.f&&!r.f.leg)cs.push({id:r.f.id,w:r.w});}
    a.push(score(t,cs));k.push(score('kg',cs));}}catch(e){}finally{try{if(W.META)META.botting=false;}catch(e){}}
  a.sort(function(x,y){return x-y;});k.sort(function(x,y){return x-y;});return [a,k];}
function qt(a,q){return a.length?a[Math.min(a.length-1,Math.floor(q*a.length))]:0;}
function norms(w,pi){var t=wkType(w),base=TOURN_NORM[pi]||TOURN_NORM[0];if(t==='kg'&&!wkTod(w))return base;var key=w+':'+pi;if(NC[key])return NC[key];
  var s=sim(w,pi,t),a=s[0],k=s[1],Q=[.4,.75,.92],n=[];
  if(t==='cnt'||t==='vid'){for(var i=0;i<3;i++)n.push(Math.max(1,Math.ceil(qt(a,Q[i]))));n[1]=Math.max(n[1],n[0]+1);n[2]=Math.max(n[2],n[1]+1);var mx=t==='cnt'?5:4;while(n[2]>mx){n[0]--;n[1]--;n[2]--;}n[0]=Math.max(1,n[0]);}
  else{var r=0,m=0;for(var j=0;j<3;j++){var kq=qt(k,Q[j]);if(kq>0){r+=base[j]/kq;m++;}}r=m?r/m:1;for(var i2=0;i2<3;i2++)n.push(Math.max(10,Math.round(qt(a,Q[i2])*r/10)*10));n[1]=Math.max(n[1],n[0]+10);n[2]=Math.max(n[2],n[1]+10);}
  return (NC[key]=n);}
// окна старого турнира: на время показа — нормативы и подпись вида недели
var CTXW=null;
function withWeek(w,pi,fn){var t=wkType(w);if(t==='kg'&&!wkTod(w))return fn();var nb=TOURN_NORM[pi],k0=kgTxt,r;TOURN_NORM[pi]=norms(w,pi);
  if(t!=='kg'&&t!=='big')kgTxt=function(x){return fmtT(t,Math.round((+x||0)*1000));};
  try{r=fn();}finally{TOURN_NORM[pi]=nb;kgTxt=k0;}return r;}
function rulesFix(w){try{var t=wkType(w),mc=$('mcard');if(!mc)return;var x=TT[t];
  var hd=mc.querySelector('.uw-plc')||mc.querySelector('h2');if(hd&&!mc.querySelector('.r2e-tt')){var b=document.createElement('p');b.className='r2e-tt';
    b.innerHTML=x[4]+' <b>'+esc(ttName(t))+'</b> — '+esc(L(x[2],x[3]))+(wkTod(w)==='night'?' · 🌙 '+L('ночной','at night'):'');hd.parentNode.insertBefore(b,hd.nextSibling);}
  mc.querySelectorAll('p').forEach(function(p){if(t!=='kg'&&/общий вес улова|total weight counts/.test(p.innerHTML))p.innerHTML=p.innerHTML.replace(/в зачёт — общий вес улова/,'в зачёт — '+L(x[2],x[3])).replace(/total weight counts/,L(x[2],x[3])+' counts');});}catch(e){}}
var ow0=W.openWeek;
if(typeof ow0==='function'){W.openWeek=function(){var a=arguments,self=this,w=weekNum(),pi=weekPlace(w);var r=withWeek(w,pi,function(){return ow0.apply(self,a);});
    if(on('tkr'))rulesFix(w);if(on('zor'))try{zorWeekBtn();}catch(e){}return r;};try{openWeek=W.openWeek;}catch(e){}}
var wc0=W.weekClaim;
if(typeof wc0==='function'){W.weekClaim=function(){var p=weekPending();if(!p)return wc0.apply(this,arguments);var a=arguments,self=this;
    return withWeek(p.w,weekPlace(p.w),function(){var r=wc0.apply(self,a);if(r&&on('tkr'))rulesFix(p.w);return r;});};try{weekClaim=W.weekClaim;}catch(e){}}
// ночной турнир (по календарю): время — ночь; Зорька — утро и пометка рыбалки
var ZPEND=0;
var sf0=W.startFish;
if(typeof sf0==='function'){W.startFish=function(pi,opt){opt=opt||{};if(opt.tourn===true){if(ZPEND)opt.tod='morning';else{var tw=wkTod(weekNum());if(tw&&!opt.tod)opt.tod=tw;}}return sf0.call(this,pi,opt);};try{startFish=W.startFish;}catch(e){}}
R2.on('run',function(g){if(ZPEND){if(g&&g.tourn==='week')g.zor=1;ZPEND=0;}if(g)g.r2a=albN();},'r2e');

/* ================= «Зорька выходного дня» ================= */
function zorDay(d){var dt=new Date(nowMs());var m=dt.getMonth(),dd=dt.getDate();if(m===11&&dd>=25||m===0&&dd<=10)return true;var x=wdy(d);return x===5||x===6;}
function zorNow(){if(R2.off('zor')||(S.sessions||0)<3)return false;var h=hourNow();return zorDay(day())&&h>=5&&h<11;}
function zorBots(d){var M=W.META&&META.league;if(!M)return [];var l=Math.min(2,S.lgL||0),bs=M.bots[l],out=[],pi=weekPlace();
  try{if(W.META)META.botting=true;for(var j=0;j<bs.length;j++){var R=rng(d*977+j*131+l*17),wx=WXS[Math.floor(R()*5)],g=0;
      for(var c=0;c<5;c++){var r=botCast(pi,'worm','morning',wx,TOURN_TK,false,bs[j].sk,R);if(r&&r.kind==='fish'&&r.f&&!r.f.leg)g+=Math.round(r.w*1000);}
      out.push({j:j,g:g,b:bs[j]});}}catch(e){}finally{try{if(W.META)META.botting=false;}catch(e){}}
  return out;}
function zorTable(d,my){var t=zorBots(d);t.push({me:1,g:my||0});t.sort(function(a,b){return b.g-a.g||(a.me?-1:b.me?1:a.j-b.j);});return t;}
function zorPlace(d,my){var t=zorTable(d,my);for(var i=0;i<t.length;i++)if(t[i].me)return i+1;return 8;}
function zorTrip(g,fish){var o=X(),d=day(),s=score('kg',fish);if(o.zr.d!==d)o.zr={d:d,b:0,s:0};var nb=s>o.zr.b;if(nb)o.zr.b=s;save();st('zor',{a:'end',g:s,p:zorPlace(d,o.zr.b)});
  DONE.push({zor:1,g:s,nb:nb,p:zorPlace(d,o.zr.b)});}
function zorGo(){ZPEND=1;st('zor',{a:'go'});try{hideModal();}catch(e){}startFish(weekPlace(),{tourn:true,tod:'morning'});}
// итог Зорьки — после 11:00 или на следующий день: место, монеты (1–3 место), первая победа — значок
function zorSettle(){if(R2.off('zor'))return;var o=X(),z=o.zr;if(!z.d||z.s===z.d||!z.b)return;if(z.d===day()&&hourNow()<11)return;
  var p=zorPlace(z.d,z.b),pay=num('zor.pay',[.5,.3,.2]),c=0;z.s=z.d;
  if(p<=3){c=give('zor',Math.max(10,R5(trip()*pay[p-1])));}var b=p===1&&spGive(2);save();st('zor',{a:'res',p:p,c:c});try{R2.emit('zor',{p:p});}catch(e){}
  setTimeout(function(){toast('🌅 '+L('Итог Зорьки','Dawn contest')+': '+p+L('-е место из 8',' of 8')+(c?' · +'+coinsTxt(c):'')+(b?' · 🎖 '+L('значок на кепку!','a badge for the cap!'):''),4200,true);},1200);}
function zorWeekBtn(){if(!zorNow())return;var mc=$('mcard');if(!mc||$('r2eZw'))return;var b=document.createElement('button');b.className='btn accent noenter';b.id='r2eZw';
  b.innerHTML='🌅 '+L('Зорька выходного дня — до 11:00','Weekend dawn contest — till 11:00');var g=$('wGo');if(g&&g.parentNode)g.parentNode.parentNode.insertBefore(b,g.parentNode.nextSibling);else mc.appendChild(b);
  b.onclick=function(){SND.tap();ui(function(U){U.zor();});};}

/* ================= «Неделя новичка» — конверты в «Утре у Петровича» (FIRSTFIX) ================= */
var NB=[null,null,
  [function(){return give('newb',cR(num('newb.day',[.3,30])));},['Открылись «Записки на мостках»','“Pier notes” are open']],
  [function(){var b=a3BestBait(topPlace());S.bait[b]=(S.bait[b]||0)+10;return 0;},['Васька знакомится · во Дворе — мини-игры','Meet Vaska · mini-games in the yard'],1],
  [function(){return give('newb',cR(num('newb.day',[.3,30])));},['Турнир и Лига: у всех одна снасть','Contest and league: same tackle for all']],
  [function(){return give('newb',cR(num('newb.day',[.3,30])));},['Наука Петровича: первое звание','Petrovich\'s science: your first rank']],
  [function(){var b=a3BestBait(topPlace());S.bait[b]=(S.bait[b]||0)+10;return give('newb',cR(num('newb.day',[.3,30])));},['Клёв недели — спроси Петровича','Bite of the week — ask Petrovich'],1],
  [function(){spGive(0);return give('newb',cR(num('newb.d7',[1,100])));},['«Значок новичка» — на кепку Петровича!','“Newcomer” badge — on Petrovich\'s cap!']]];
R2.on('morning',function(rows){var f=S.r2f,o=X(),t=day();if(!f||!(f.d0>1)||o.nb>=7||o.nd===t||t-f.d0>21)return;
  var k=Math.max(2,o.nb+1),x=NB[k];if(!x)return;var c=0;try{c=x[0]()||0;}catch(e){}o.nb=k;o.nd=t;save();
  var sub=L(x[1][0],x[1][1]);if(k===6){var kl=klevOf();if(kl)sub=L('Клёв недели: ','Bite of the week: ')+fN(kl.f)+' · '+plN(kl.pi);}
  if(x[2]){var b=a3BestBait(topPlace());sub+=' · '+BAIT[b].ic+' +10';}
  rows.push({ic:'✉',t:L('Конверт '+k+' из 7','Envelope '+k+' of 7'),sub:esc(sub),right:c?'+'+coinsTxt(c):'',pri:70});
  st('nb',{a:'open',d:k,dn:t-f.d0+1,c:c});},'nb');
// клёв недели — строкой в «Утре» (первое утро недели)
R2.on('morning',function(rows){var o=X(),w=weekNum();if(o.ld===w)return;var k=klevOf();if(!k)return;o.ld=w;save();
  rows.push({ic:'🐟',t:L('Клёв недели: ','Bite of the week: ')+esc(fN(k.f)),sub:esc(plN(k.pi))+' · ×1,3',right:'',pri:30});},'klev');

/* ================= итог недели в понедельник (окно входа prio 250) ================= */
R2.enter('wkr',250,function(){if(!weekPending())return false;var r=weekClaim();if(!r)return false;
  try{var w=weekNum(),t=wkType(w),k=klevOf(w),mc=$('mcard'),row=mc.querySelector('.row:last-of-type'),h='<div class="r2e-nw"><b>☀ '+L('Новая неделя у Петровича','A new week at Petrovich\'s')+'</b>'
      +'<small>🏆 '+L('Турнир','Contest')+': '+esc(ttName(t))+(wkTod(w)==='night'?' · 🌙':'')+' · 📍 '+esc(plN(weekPlace(w)))+'</small>'+(k?'<small>🐟 '+L('Клёв недели','Bite of the week')+': '+esc(fN(k.f))+' · '+esc(plN(k.pi))+'</small>':'')+'</div>';
    if(row)row.insertAdjacentHTML('beforebegin',h);else mc.insertAdjacentHTML('beforeend',h);st('wkr',{a:'show',t:t,l:S.lgL||0});}catch(e){}
  return true;});

/* ================= гнёзда: главный экран, итоги рыбалки ================= */
var CSS='.r2e-strip{display:block;width:100%;text-align:left;border:0;margin:0;padding:6px 5px 6px;border-radius:12px;background:linear-gradient(#8a6a44,#6f5233);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 2px 6px rgba(0,0,0,.18);color:#fff;font:inherit;cursor:pointer}'
 +'.r2e-n3{display:flex;align-items:center}.r2e-pin{flex:none;font-size:18px;margin-right:4px}.r2e-nt{flex:1 1 0;min-width:0;margin-left:5px;position:relative;background:#fbf6e6;color:#3a2e1e;border-radius:3px 3px 7px 3px;padding:6px 3px 4px;box-shadow:0 2px 3px rgba(0,0,0,.25);transform:rotate(-1deg)}.r2e-nt:first-child{margin-left:0}.r2e-nt:before{content:"";position:absolute;top:-3px;left:50%;width:12px;height:6px;margin-left:-6px;border-radius:2px;background:#c9a46a}'
 +'.r2e-nt:nth-child(2){transform:rotate(1deg);background:#fff9d8}.r2e-nt:nth-child(3){transform:rotate(-.4deg);background:#eef6ff}'
 +'.r2e-nt b{display:block;font-size:15px;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#3a2e1e!important}.r2e-nt i{display:block;height:4px;border-radius:2px;background:rgba(0,0,0,.12);margin-top:3px;overflow:hidden}.r2e-nt i u{display:block;height:100%;background:#4caf50}'
 +'.r2e-kl{display:block;font-size:16px;font-weight:600;opacity:.95;margin:6px 2px 0}.r2e-res{display:flex;align-items:center;width:100%;text-align:left;border:0;background:#fbf6e6;color:#3a2e1e;border-radius:10px;padding:8px 10px;font:inherit;font-size:17px;margin:4px 0;cursor:pointer}'
 +'.r2e-res b{font-weight:700}.r2e-tt{margin:4px 0;font-size:17px}.r2e-nw{background:rgba(255,255,255,.12);border-radius:10px;padding:8px 10px;margin:8px 0}.r2e-nw b,.r2e-nw small{display:block}.r2e-nw small{font-size:17px;opacity:.95;margin-top:3px}'
 +'.r2e-zor{display:flex;align-items:center;width:100%;min-height:44px;border:0;border-radius:12px;padding:5px 10px;margin:6px 0 0;color:#3a2410;font:inherit;font-size:17px;text-align:left;background:linear-gradient(90deg,#ffd27a,#ffb36b);cursor:pointer;white-space:nowrap}.r2e-zor>span{margin-right:8px}.r2e-zor>span:nth-child(2){flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}.r2e-zor b{font-weight:700}.r2e-zor small{font-size:17px;opacity:.85;margin-left:6px}'
 +'.r2e-nb{display:flex;align-items:center;width:100%;border:0;border-radius:12px;padding:4px 6px;margin:0;background:#fbf6e6;font:inherit;cursor:pointer}.r2e-nb b{flex:none;font-size:18px;margin-right:4px;color:#3a2e1e!important}.r2e-nb i{flex:1;margin-left:4px;height:28px;border-radius:5px;background:#e8dcc0;color:#3a2e1e!important;font-style:normal;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center}.r2e-nb i.on{background:#7cc04a;color:#fff!important}.r2e-nb i.nx{background:#f2b632;color:#fff!important}';
function css(){if(document.getElementById('r2eCss'))return;var s=document.createElement('style');s.id='r2eCss';s.textContent=CSS;document.head.appendChild(s);}
function klevLine(){var k=klevOf();if(!k)return '';var kl=X().kl,kn=kl.w===weekNum()?kl.n:0;return '<span class="r2e-kl">🐟 '+L('Клёв недели','Bite of the week')+': '+esc(fN(k.f))+' · '+esc(plN(k.pi))+' · '+Math.min(3,kn)+'/3</span>';}
// лента на главном — одна строка ≤48 px (зона HOME 80–99): 📌 + 3 записки; клёв недели — значком HOME «Ещё» (R2H.icon), без HOME — второй строкой
function stripHtml(){var o=ensure(),h='<button class="r2e-strip noenter" data-r2e="zap" aria-label="'+L('Записки на мостках','Pier notes')+'"><span class="r2e-n3">';
  o.z.forEach(function(n){var p=prog(n),q=need(n);h+='<span class="r2e-nt"><b>'+esc(nShort(n))+'</b><i><u style="width:'+Math.max(4,Math.round(p/q*100))+'%"></u></i></span>';});
  h+='</span>';if(!(W.R2H&&R2H.icon))h+=klevLine();return h+'</button>';}
function zapOk(){return !R2.off('zap')&&(S.sessions||0)>=2&&(S.caught||0)>=1;}
R2.slot('home','zap',{pri:90,when:function(){return zapOk()&&(!W.R2H||!R2H.open||R2H.open('zap'));},html:function(){css();try{evalMg();}catch(e){}return stripHtml();},
  bind:function(el){var b=el.querySelector('[data-r2e=zap]');if(b)b.onclick=function(){SND.tap();openZap();};}});
R2.slot('home','zor',{pri:95,when:function(){return zorNow()&&(!W.R2H||!R2H.open||R2H.open('tour'));},html:function(){css();var o=X(),d=day(),my=o.zr.d===d?o.zr.b:0;
    return '<button class="r2e-zor noenter" data-r2e="zor"><span style="font-size:22px">🌅</span><span><b>'+L('Зорька выходного дня','Weekend dawn')+'</b><small>'+(my?L('ты ','you are ')+zorPlace(d,my)+L('-й из 8',' of 8'):L('до 11:00','till 11:00'))+'</small></span><span style="margin:0">›</span></button>';},/* rb2-MERGE: Зорька одной строкой */
  bind:function(el){var b=el.querySelector('[data-r2e=zor]');if(b)b.onclick=function(){SND.tap();ui(function(U){U.zor();});};}});
// «Неделя новичка»: полоска 7 конвертов под «Сегодня» (первые 7 дней); конверт открывается утром в окне «Утро у Петровича»
function nbOn(){var f=S.r2f,o=X();return !R2.off('nb')&&!!f&&f.d0>1&&(S.sessions||0)>=1&&o.nb<7&&day()-f.d0<8;}
R2.slot('home','nb',{pri:105,when:function(){return nbOn();},html:function(){css();var o=X(),k=Math.max(1,o.nb),h='<button class="r2e-nb noenter" data-r2e="nb" aria-label="'+L('Неделя новичка','Newcomer week')+'"><b>✉</b>';
    for(var i=1;i<=7;i++)h+='<i class="'+(i<=k?'on':i===k+1?'nx':'')+'">'+(i<=k?'✓':i===7?'🎖':i)+'</i>';return h+'</button>';},
  bind:function(el){var b=el.querySelector('[data-r2e=nb]');if(b)b.onclick=function(){SND.tap();toast('✉ '+L('Неделя новичка: каждое утро у Петровича — конверт с подарком и новым делом. 7-й — «Значок новичка» на кепку!','Newcomer week: every morning Petrovich has an envelope with a gift and something new. The 7th is the Newcomer badge for his cap!'),3800);};}});
// итоги рыбалки: выполненная записка / «ещё чуть-чуть» (главный крючок «ещё раз»)
R2.slot('res','zap',{pri:30,when:function(c){if(!c||!c.g)return false;evalTrip(c.g);if(c.g.zor||DONE.length)return true;if(R2.off('zap')||c.g.tourn||!zapOk())return false;return !!near();},
  html:function(c){css();var d=DONE[0],t;
    if(d&&d.zor)t='🌅 <b>'+L('Зорька','Dawn')+':</b> '+kgTxt(d.g/1000)+' · '+L('ты ','you are ')+d.p+L('-й из 8',' of 8')+(d.nb?'':'')+' · '+L('итог в 11:00','results at 11:00');
    else if(d&&d.kl)t='🐟 <b>'+L('Клёв недели пойман!','Bite of the week done!')+'</b>'+(d.c?' +'+coinsTxt(d.c):'')+(d.badge?' · 🎖 '+L('значок на кепку','a cap badge'):'');
    else if(d&&d.n)t='📌 <b>'+L('Записка выполнена','Note done')+'</b> · '+esc(heroN(d.n.h))+(d.c?' +'+coinsTxt(d.c):'')+(d.pack?' · '+L('связка','set')+' +'+coinsTxt(d.pack):'')+(d.badge?' · 🎖 '+L('значок на кепку','a cap badge'):'')+(DONE.length>1?' · +'+(DONE.length-1):'');
    else{var n=near();if(!n)return '';var left=need(n)-prog(n);t='📌 '+(LANG==='en'?'':'Ещё ')+(n.t==='kg'?kgTxt((n.n-n.g)/1000):left)+L(' — и записка готова',' more — and the note is done')+': <b>'+esc(nShort(n))+'</b>';}
    return '<button class="r2e-res noenter" data-r2e="zr">'+t+'</button>';},
  bind:function(el,c){var b=el.querySelector('[data-r2e=zr]');if(b)b.onclick=function(){SND.tap();try{hideModal();G=null;openMap();}catch(e){}openZap();};}});
// записка ближе всех к концу (по доле)
function near(){var o=X(),best=null,bv=-1;o.z.forEach(function(n){if(n.t==='mg'||n.t==='uha'||n.t==='tn'||n.t==='nw')return;var v=prog(n)/need(n);if(v>bv&&v<1){bv=v;best=n;}});return bv>0?best:null;}
R2.on('end',function(g){evalTrip(g);if(DONE.length)setTimeout(function(){try{updCoins();}catch(e){}},50);},'r2e');
// главный экран: подписи старых кнопок «Заказы соседей» → «Записки», итог Зорьки, мини-игры
R2.on('home',function(){try{zorSettle();}catch(e){}try{evalMg();}catch(e){}
  if(R2.off('zap'))return;try{['uhOrd','uhOrd2'].forEach(function(id){var b=$(id);if(b){if(!zapOk()){b.style.display='none';return;}b.innerHTML=id==='uhOrd'?'📌 '+L('Записки','Notes')+' ›':'<span>📌</span><span><b>'+L('Записки на мостках','Pier notes')+'</b> · 🧢 '+badgeN()+'/40</span><i>›</i>';b.onclick=function(){SND.tap();openZap();};}});
    var c=document.querySelector('[data-b1=a2Ord]');if(c)c.textContent='📌 '+L('Записки','Notes');}catch(e){}},'r2e');

// HOME: клёв недели — значком в строке «Ещё»; SEASON: строка «Записка на мостках» в окне сезона
function homeHooks(){try{if(W.R2H&&R2H.icon)R2H.icon('klev',{pri:35,when:function(){return !!klevOf();},ic:'🐟',t:function(){return L('Клёв','Bite');},
    sub:function(){var kl=X().kl;return Math.min(3,kl.w===weekNum()?kl.n:0)+'/3';},dot:function(){var kl=X().kl;return kl.w!==weekNum();},go:function(){openZap();}});}catch(e){}
  if(!R2.off('zap'))W.RSEZ_ZAP=true;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',homeHooks);else homeHooks();

/* ================= кепка Петровича со значками — в сцене рыбалки ================= */
var dp0=W.drawPetr;
if(typeof dp0==='function'){W.drawPetr=function(g,t){dp0.apply(this,arguments);if(R2.off('zap'))return;try{var n=badgeN();if(!n)return;
    var y0=GEO.yOf(9),yb=y0+(GEO.shY-y0)*.2,x=GEO.W*.1,s=GEO.H*.12*GEO.ps(8)*1.7,PP=a1PetrPose(t);if(PP.cap)return;var cs=badgeCols(),gold=n>=40;
    g.save();g.translate(PP.hx*s,PP.hy*s);
    if(gold){g.fillStyle='rgba(242,201,76,.9)';g.beginPath();g.ellipse(x+s*.02,yb-s*1.11,s*.16,s*.08,0,Math.PI,0);g.fill();g.fillRect(x+s*.05,yb-s*1.12,s*.2,s*.03);}
    var m=Math.min(7,cs.length),r=Math.max(1,s*.022);for(var i=0;i<m;i++){var a=Math.PI*(1.12+.76*(i+.5)/m),px=x+s*.02+Math.cos(a)*s*.115,py=yb-s*1.115+Math.sin(a)*s*.05;
      g.fillStyle=cs[i];g.beginPath();g.arc(px,py,r,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(px-r*.3,py-r*.3,r*.35,0,7);g.fill();}
    g.restore();}catch(e){}};try{drawPetr=W.drawPetr;}catch(e){}}

/* ================= окна — лениво ================= */
var UIP=null;
function ui(fn){if(!UIP)UIP=Promise.all([R2.need('js/rb2-event-ui.js'),R2.css('css/rb2-event.css')]).then(function(){return W.R2E_UI;});
  UIP.then(function(U){if(U)fn(U);},function(){UIP=null;toast(L('Нет связи — попробуй ещё раз','No connection — try again'));});}
function openZap(){try{R2.mark('t:zap');}catch(e){}ensure();st('zap',{a:'open',n:X().zn});ui(function(U){U.zap();});}

/* ---- открытый интерфейс (для окон и проверок) ---- */
W.R2E={X:X,ensure:ensure,nShort:nShort,prog:prog,need:need,heroN:heroN,HER:HER,SPB:SPB,badgeN:badgeN,badgeCols:badgeCols,
  klevOf:klevOf,wkType:wkType,wkTod:wkTod,ttName:ttName,TT:TT,CAL:CAL,W0:W0,norms:norms,fmtT:fmtT,score:score,zorNow:zorNow,zorTable:zorTable,zorPlace:zorPlace,zorGo:zorGo,zorDay:zorDay,
  gen:gen,complete:complete,sweep:sweep,evalTrip:evalTrip,evalMg:evalMg,openZap:openZap,ui:ui,cR:cR,num:num,give:give,spGive:spGive,mgOk:mgOk,frost:frost,css:css,on:on,st:st,fN:fN,plN:plN};
})();
