'use strict';
/* ===== ДОГОВОР ZAP (перенесён из zb2-zap.js ради веса старта) =====
   Всегда висят 3 записки-цели (у новичка первые дни — 2); выполнил — награда и сразу следующая. Разбор 02 §2.10, макет EVENT.html разд. 7.
   Файлы: zb2-zap.js (этот, грузится сразу: флаги, поле S.z2z, ловля событий игры, ZB2ZAP.hook) → после 'ready' лениво
          js/zb2-zap-data.js (шаблоны и тексты) и js/zb2-zap-ui.js (генератор, холодильник на Доме, окна) + css/zb2-zap.css.
   ДОГОВОР ДЛЯ ДРУГИХ ПОТОКОВ:
     ZB2ZAP.hook(type, n, o) — засчитать действие игрока в записки. Без ZAP (файл не загрузился / флаг выключен) — тихо ничего.
       Звать так: if(window.ZB2ZAP)ZB2ZAP.hook('mg',1,{id:'muha'});   n — сколько (по умолчанию 1), o — подробности (id игры и т.п.).
       type: 'mg' сыграл мини-игру (o.id) · 'mgwin' выиграл/рекорд в мини-игре (o.id) · 'rec' побил свой рекорд (o.id) · 'wd' угадал «Слово дня» ·
             'cal' открыл листок календаря · 'cab' ремонт кабинета (o.id) · 'buf' забрал пирожки в столовой · 'yat' покормил Ятя ·
             'sos' заглянул к соседкам · 'sosup' обогнал соседку · 'five' «5» в дневник · 'diary' открыл дневник · 'dict' открыл словарь ·
             'shop' купил у тёти Вали/Толика · 'note' заметка в стенгазету · 'card' открытка другу. Неизвестный type — игнор.
       Многое ZAP ловит и сам (ZB.on 'zmg'/'cab'/'cabbuf'/'five'/'screen'), повторный hook того же действия не страшен — записка про одно дело.
     ZB2ZAP.list() → [{id, t (текст), p, g, f (готово)}] — записки сейчас (для календаря/недели: «Ять повесил новую записку»).
     ZB2ZAP.open() — показать холодильник (Дом). ZB2ZAP.total() — выполнено записок всего (миссии VK, TECH). ZB2ZAP.on — включено ли.
   ФЛАГИ: 'zap' — всё (выкл. → игра как v3.0, поле S.z2z не трогается); 'zapchain' — связки героев в 3-м месте (выкл. → там средняя).
   ПОЛЕ: S.z2z {n закрыто всего, k:[{i шаблон, g цель, p сделано, x параметр, s место 1–3, t начало (с), f 1 — готова}], h последние шаблоны,
          sd день даровой замены, sw платных замен всего, m средних, tu обучение (биты), d0 первый день, nb новичок, cn конфет, c связка, mg магнитики}.
   STAT: 'zap' {a:'new'|'done'|'swap'|'claim'|'chain'|'chest'|'cap', t, id, s, n, c, ms, lv, f}; монеты — ZBECO.give('zap') (STAT earn 'zap').
*/
/* zb2-zap-ui — «Записки на холодильнике»: генератор, награды, холодильник на Доме, окно записки и замена, строка в окне победы (поток ZAP).
   Грузится лениво из zb2-zap.js (после 'ready'), шаблоны — window.ZB2ZAP_DATA (zb2-zap-data.js). Договор и поле S.z2z — шапка zb2-zap.js.
   Места: 1 — короткая, 2 — средняя, 3 — связка героя (флаг zapchain; выключен/нет связок — средняя). Новичку первые 3 дня — 2 места.
   Цель = база × (1 + закрыто/150), не выше потолка шаблона и не больше, чем дают ближайшие уровни игрока (всегда выполнима).
   Шаблон не возвращается раньше чем через 6 записок; два одинаковых не висят; первые 10 записок новичка — обучение (DATA.TUT).
   Награды — числа ZBECO.zap (у себя только запасные), монеты через ZBECO.give('zap') с потолком дня; упёрлись — «конфета» (+очко сезона). */
(function(){
var ZB=window.ZB,Z=window.ZB2ZAP,D=window.ZB2ZAP_DATA;
if(!ZB||!Z||!Z.on||!D||Z._init)return;
var T=D.T,SAY=D.SAY,ACTIVE=1;
var LVLK={w_lvl:1,w_combo:1,w_long2:1,b_lvl:1};   // цель «за один уровень» — прогресс с начала каждого уровня
var REC=6;                                        // шаблон не повторяется раньше, чем через столько записок
function E(){var e=window.ZBECO,z=e&&e.zap;return z&&z.sp?z:{short:5,mid:10,chain:10,big:25,chest:40,chest5:80,chestHb:1,midHb:5,swap:20,swapFree:1,
  sp:{short:1,mid:2,chain:2,big:5,chest:5,chest5:10,candy:1}};}
function zz(){if(typeof S==='undefined')return null;var z=S.z2z;if(!z||typeof z!=='object'){z=S.z2z={n:0,k:[],h:'',sd:0,sw:0,m:0,tu:0,d0:0,nb:0,cn:0,c:null,mg:''};}
  if(!Array.isArray(z.k))z.k=[];return z;}
function nowT(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}}
function dayK(){try{return typeof todayKey==='function'?todayKey():0;}catch(e){return 0;}}
function dayN(){var t=nowT(),d=new Date(t);return Math.floor((t-d.getTimezoneOffset()*6e4)/864e5);}
function lv(){return typeof S!=='undefined'?(+S.lv||0):0;}
function pl(n,f){if(!f)return '';n=Math.abs(n)%100;var a=n%10;return f[n>10&&n<20?2:a===1?0:a>=2&&a<=4?1:2];}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function rnd(n){return Math.floor(Math.random()*n);}
function sv(){try{save();}catch(e){}}
function st(a,o){try{o=o||{};o.a=a;o.lv=lv();if(window.STATZB&&STATZB.z2)STATZB.z2('zap',o);else if(window.STAT&&STAT.ev)STAT.ev('zap',o);}catch(e){}} // TECH: STATZB.z2 (zb2-tech)
function coinI(){return typeof COIN_I!=='undefined'?COIN_I:'💰';}

/* ---------- ближайшие уровни игрока: что в них можно найти ---------- */
var upC={k:-1,r:null};
function up(){var L=typeof LEVELS!=='undefined'?LEVELS.length:0,key=lv();if(upC.k===key&&upC.r)return upC.r;var r=[];
  if(L&&typeof levelData==='function')for(var i=0;i<15;i++){var idx=Math.min(key,L-1)+i;
    try{var d=levelData(idx%L,false);if(d&&d.w)r.push({w:d.w.map(function(x){return x[0];}),l:String(d.l||'')});}catch(e){}}
  if(!r.length)r=[{w:['кот','сок','рот','нос','сон','ток'],l:'котнсро'}];
  upC={k:key,r:r};return r;}
function words(n){var r=[];up().slice(0,n||15).forEach(function(v){r=r.concat(v.w);});return r;}
// частоты: f(слово) → список ключей (буквы); вернёт [[буква, сколько слов], …] по убыванию
function freq(ws,f){var m={};ws.forEach(function(w){var seen={};f(w).forEach(function(c){if(!c||seen[c]||/[ьъый]/.test(c))return;seen[c]=1;m[c]=(m[c]||0)+1;});});
  return Object.keys(m).map(function(k){return [k,m[k]];}).sort(function(a,b){return b[1]-a[1];});}
function hasF(L,x,g){if(!x)return null;for(var i=0;i<L.length;i++)if(L[i][0]===x)return L[i][1]>=g?x:null;return null;}
function pickFreq(L,g){var ok=L.filter(function(x){return x[1]>=Math.ceil(g*1.3);});if(!ok.length)ok=L.filter(function(x){return x[1]>=g;});
  if(!ok.length)return null;ok=ok.slice(0,6);return ok[rnd(ok.length)][0];}

/* ---------- сборка записки по шаблону ---------- */
function goal(t,si,N){var b=t.b[si]||0,m=t.mx[si]||b;if(!b)return 0;return Math.max(1,Math.min(m,Math.max(b,Math.round(b*(1+N/150)))));}
function actOk(x){try{
  if(x==='diary')return !!(ZB._scr&&ZB._scr.diary);
  if(x==='dict')return typeof openDict==='function';
  if(x==='mg')return !!(window.ZMG&&ZMG.openList&&ZMG.openList().length);
  if(x==='cabv')return !!(window.ZBCAB&&ZBCAB.open&&ZBCAB.open('russkij'));
  if(x==='sos')return typeof openSosedki==='function'&&lv()>=10;
  if(x==='buf')return !!(window.ZBCAB&&ZBCAB.lv&&ZBCAB.lv('stolovaya')>0);
  if(x==='shopv')return typeof openShop==='function';
  if(x==='five')return !!(window.ZBTD&&ZB._scr&&ZB._scr.diary);
  if(x==='rec')return !!(window.ZMGREC&&window.ZMG&&ZMG.openList&&ZMG.openList().length);
  if(x==='wd')return !!window.ZB2WD;}catch(e){}return false;}
// шаблон записки: обычный (T) или шаг связки ('c<связка>_<шаг>', o.a — запасной шаг)
var chC={};
function chStep(ci,st,alt){var key=ci+'_'+st+(alt?'a'+alt:'');if(chC[key])return chC[key];var c=D.CH[ci];if(!c)return null;var s0=c.steps[st];if(!s0)return null;var s=alt&&s0.alt?s0.alt:s0;
  if(alt===2)s={k:'l_win',b:s0.big?5:2,u:['уровень','уровня','уровней'],t:'Пройди {n} {u} — '+(s0.big?'большое дело':'помоги, пожалуйста'),t1:'Пройди уровень — помоги, пожалуйста',j:s0.j};
  var b=s.b||1,t={k:s.k,gr:'c',who:c.who,t:s.t,t1:s.t1,u:s.u,ux:s.ux,x:s.x,j:[s.j||''],b:[b,b],mx:[b*3,b*3],big:s0.big,cab:s.cab,need:s.need,from:0,ch:c};
  return (chC[key]=t);}
function tp(o){if(!o)return null;var m=/^c(\d+)_(\d+)$/.exec(o.i);return m?chStep(+m[1],+m[2],o.a):T[o.i];}
function tOk(t){if(!t)return false;if(t.need&&!window[t.need])return false;if(t.k==='act'&&!actOk(t.x))return false;return true;}
function build(id,si,g0,x0,t0){var t=t0||T[id];if(!t||!tOk(t))return null;if(t.xf){x0=t.xf();if(!x0)return null;} /* zb2-WEEK: буква недели/праздника */var z=zz(),N=z?z.n:0,g=g0||goal(t,si,N),x=x0,ws,L,i;if(!g)return null;
  switch(t.k){
    case 'w_start':ws=words(15);L=freq(ws,function(w){return [w[0]];});x=hasF(L,x0,g)||pickFreq(L,g);if(!x){g=L.length?Math.min(g,L[0][1]):0;x=L.length?L[0][0]:'';}break;
    case 'w_has':ws=words(15);L=freq(ws,function(w){return w.split('');});x=hasF(L,x0,g)||pickFreq(L,g);if(!x)return null;break;
    case 'w_end':ws=words(15);L=freq(ws,function(w){return [w[w.length-1]];});x=hasF(L,x0,g)||pickFreq(L,g);if(!x){g=L.length?Math.min(g,L[0][1]):0;x=L.length?L[0][0]:'';}break;
    case 'w_dbl':ws=words(15);L=freq(ws,function(w){var r=[],m={};w.split('').forEach(function(c){m[c]=(m[c]||0)+1;});for(var c in m)if(m[c]>=2)r.push(c);return r;});
      x=x0||pickFreq(L,g);if(!x){if(!L.length)return null;g=Math.min(g,L[0][1]);x=L[0][0];}break;
    case 'w_len':{var mxL=0;up().slice(0,5).forEach(function(v){v.w.forEach(function(w){mxL=Math.max(mxL,w.length);});});
      var K=x0||Math.min(Math.max(4,mxL),4+Math.floor(N/50)+(si?1:0));if(K>mxL)K=Math.max(3,mxL);x=K;
      var cnt=words(10).filter(function(w){return w.length>=K;}).length;if(cnt<g)g=Math.max(1,Math.min(g,cnt));if(!cnt)return null;break;}
    case 'w_soft':ws=words(15);i=ws.filter(function(w){return w.indexOf('ь')>=0;}).length;if(i<g)g=i;break;
    case 'w_short':ws=words(10);i=ws.filter(function(w){return w.length===3;}).length;if(i<g)g=i;break;
    case 'w_lvl':case 'w_combo':{var c=up().slice(0,5).map(function(v){return v.w.length;}).sort(function(a,b){return a-b;}),med=c[Math.floor(c.length/2)]||3;
      g=Math.min(g,t.k==='w_lvl'?med+1:Math.max(2,med-1));break;}
    case 'w_long2':i=0;up().slice(0,5).forEach(function(v){i=Math.max(i,v.w.filter(function(w){return w.length>=5;}).length);});g=Math.min(g,i);break;
    case 'b_len':x=x0||(4+(N>=120?1:0));break;
    case 'b_def':try{if(typeof DEFS!=='undefined'){var all=Object.keys(DEFS).length,got=Object.keys(S.dict||{}).length;if(all-got<30)return null;}}catch(e){}break;
    case 'l_new':if(typeof LEVELS!=='undefined'&&lv()+g>=LEVELS.length&&!(window.ZBCH&&ZBCH.total&&lv()+g<ZBCH.total()))return null;break;
    case 'l_fast':{var aw=0,ul=up().slice(0,3);ul.forEach(function(v){aw+=v.w.length;});aw=aw/Math.max(1,ul.length);
      x=x0||Math.max(2,(N<30?4:N<150?3:2)+(aw>8?1:0));break;}
    case 'act':if(!actOk(t.x))return null;x=t.x;g=g0||1;break;
    case 'coins':{var c0=+S.coins||0;x=x0||Math.min(Math.ceil((c0+200)/50)*50,Math.max(100,Math.round((c0+100*(1+N/300))/50)*50));g=1;break;}}
  if(!g||g<1)return null;if(t.xf&&x!==x0)return null; /* zb2-WEEK */
  var o={i:id,g:g,p:0,s:si+1,t:Math.floor(nowT()/1000),f:0};if(x!==undefined&&x!==null&&x!=='')o.x=x;return o;}

/* ---------- генератор ---------- */
var GRW={w:4,b:2.5,l:3,h:.6,a:.8,m:.8};
function recent(){var z=zz();return z&&z.h?z.h.split(','):[];}
function pushRecent(id){var z=zz(),r=recent();r.push(id);z.h=r.slice(-REC).join(',');}
function slots(){var z=zz();return z&&z.nb&&dayN()-z.d0<3&&lv()<25?2:3;}
function tutOn(){var z=zz();return !!(z&&z.nb&&z.n<25&&z.tu<(1<<D.TUT.length)-1);}
function chainOn(){return !ZB2.off('zapchain')&&slots()===3&&!tutOn()&&lv()>=5&&!!(D.CH&&D.CH.length);}
function chainNote(){var z=zz();if(!z.c||typeof z.c!=='object')z.c={i:0,st:0,n:0};var c=z.c,ci=(c.i|0)%D.CH.length,st=Math.min(4,c.st|0),id='c'+ci+'_'+st,o=null,a=0;
  var t=chStep(ci,st,0);o=build(id,1,0,t&&t.x,t);
  if(!o&&D.CH[ci].steps[st].alt){a=1;t=chStep(ci,st,1);o=build(id,1,0,t&&t.x,t);}
  if(!o){a=2;t=chStep(ci,st,2);o=build(id,1,0,null,t);}
  if(!o)return null;o.c=1;if(a)o.a=a;return o;}
function gen(si){var z=zz(),act=z.k.map(function(o){return o.i;}),o=null,i;
  if(si===2&&chainOn()){o=chainNote();if(o){o.s=3;st('new',{t:(tp(o)||{}).k,id:o.i,s:3,n:z.n+1,c:o.i});return o;}}
  // обучение новичка: первая доступная по порядку
  if(tutOn())for(i=0;i<D.TUT.length&&!o;i++){if(z.tu&(1<<i))continue;var tt=D.TUT[i],tq=T[tt[0]];if(!tq||act.indexOf(tt[0])>=0||tq.from>lv())continue;
    if(tq.k==='act'&&!actOk(tq.x))continue;o=build(tt[0],si===0?0:1,tt[1],tt[2]);if(o){o.u=1;z.tu|=1<<i;}}
  if(!o){var rec=recent(),sj=si===0?0:1,grAct={};z.k.forEach(function(n){var t=tp(n);if(t)grAct[t.gr]=(grAct[t.gr]||0)+1;});
    var C=Object.keys(T).filter(function(id){var t=T[id];return !t.tut&&t.b[sj]>0&&(t.from||0)<=lv()&&act.indexOf(id)<0&&!((t.gr==='m'||t.gr==='a')&&grAct[t.gr]);});
    var fresh=C.filter(function(id){return rec.indexOf(id)<0;});if(fresh.length)C=fresh;
    for(var tries=0;tries<12&&C.length&&!o;tries++){var tot=0,w=C.map(function(id){var t=T[id],v=(t.wt||GRW[t.gr]||1)/(1+2*(grAct[t.gr]||0))/* zb2-WEEK: t.wt */;tot+=v;return v;}),r=Math.random()*tot,k=0;
      for(;k<C.length-1;k++){r-=w[k];if(r<=0)break;}o=build(C[k],sj);if(!o)C.splice(k,1);}
    if(!o)o=build('wc',sj)||{i:'wc',g:5,p:0,s:si+1,t:Math.floor(nowT()/1000),f:0};}
  o.s=si+1;st('new',{t:(tp(o)||{}).k,id:o.i,s:o.s,n:z.n+1,c:o.c?o.i:''});return o;}
function ensure(){var z=zz();if(!z||!ACTIVE)return;var ch=0;
  if(!z.d0){z.d0=dayN();if(!z.n&&!z.k.length&&!z.h){z.nb=lv()<20?1:0;if(!z.nb)z.tu=(1<<D.TUT.length)-1;}ch=1;}
  var n=slots();for(var s=1;s<=n;s++){if(!z.k.some(function(o){return o.s===s;})){z.k.push(gen(s-1));ch=1;}}
  z.k.sort(function(a,b){return a.s-b.s;});if(ch)sv();}

/* ---------- тексты ---------- */
function txt(o,short){var t=tp(o);if(!t)return '';var s=(o.g===1&&t.t1)?t.t1:(t.t||t.t1),X=o.x!=null?String(o.x).toUpperCase():'';
  return s.replace('{n}',o.g).replace('{u}',pl(o.g,t.u)).replace('{X}','«'+X+'»').replace('{x}',o.x).replace('{ux}',pl(+o.x,t.ux));}
function joke(o){var t=tp(o);if(!t||!t.j||!t.j.length)return '';var X=o.x!=null?String(o.x).toUpperCase():'';return t.j[(o.t||0)%t.j.length].replace(/\{X\}/g,X);}
function who(o){var t=tp(o);return t&&D.WHO[t.who]||'баба Зина';}
function prog(o){var t=tp(o);if(t&&t.k==='b_jar'&&!o.f){var js=typeof JAR_SIZE!=='undefined'?JAR_SIZE:15;return {a:+S.jar||0,b:js,txt:'в банке '+(+S.jar||0)+' из '+js};}
  if(t&&t.k==='coins'&&!o.f){var c=Math.min(+S.coins||0,+o.x||0);return {a:c,b:+o.x||1,txt:c+' из '+o.x};}
  return {a:o.p,b:o.g,txt:o.p+' из '+o.g};}
function kindOf(o){if(o.c){var t=tp(o);return t&&t.big?'big':'chain';}return o.s===1?'short':'mid';}
function reward(o){var e=E();return +e[kindOf(o)]||0;}

/* ---------- счёт событий ---------- */
var Lv={w:0,b:0,l5:0,miss:0,shuf:0,shT:0};
function inLevel(){try{return typeof G!=='undefined'&&G&&!G.won&&document.getElementById('game').classList.contains('on');}catch(e){return false;}}
function done(o){if(o.f)return;o.p=o.g;o.f=1;var z=zz();st('done',{t:(tp(o)||{}).k,id:o.i,s:o.s,n:z.n+1,ms:Math.max(0,Math.floor(nowT()/1000)-(o.t||0))*1000});
  var msg='📌 '+SAY.done[rnd(SAY.done.length)]+' +'+reward(o);
  if(quietDone)return;try{if(inLevel())toast(msg,2600);else{toast(msg+' — забери на холодильнике',3200);ZB.refresh();}}catch(e){}}
var quietDone=0;
function add(o,n){if(o.f||!(n>0))return;o.p=Math.min(o.g,o.p+n);if(o.p>=o.g)done(o);}
function onEv(type,d){var z=zz();if(!z||!ACTIVE)return;var ch=0;quietDone=type==='level'&&d.end==='win'?1:0;
  if(type==='start'){Lv={w:0,b:0,l5:0,miss:0,shuf:0,shT:0};z.k.forEach(function(o){var t=tp(o);if(t&&LVLK[t.k]&&!o.f&&o.p){o.p=0;ch=1;}});if(ch)sv();return;}
  z.k.forEach(function(o){if(o.f)return;var t=tp(o);if(!t)return;var k=t.k,w=d.w||'',p0=o.p;
    if(k==='coins'){if((+S.coins||0)>=+o.x)add(o,1);return;}
    if(type==='word'){
      if(k==='w_start'&&w[0]===o.x)add(o,1);else if(k==='w_has'&&w.indexOf(o.x)>=0)add(o,1);else if(k==='w_end'&&w[w.length-1]===o.x)add(o,1);
      else if(k==='w_len'&&w.length>=+o.x)add(o,1);else if(k==='w_cnt')add(o,1);else if(k==='w_soft'&&w.indexOf('ь')>=0)add(o,1);
      else if(k==='w_letters')add(o,w.length);else if(k==='w_short'&&w.length===3)add(o,1);
      else if(k==='w_dbl'&&w.split(o.x).length-1>=2)add(o,1);
      else if(k==='w_lvl')add(o,Lv.w+1-o.p);else if(k==='w_long2'&&w.length>=5)add(o,Lv.l5+1-o.p);
      else if(k==='w_combo'&&(+d.c||0)>o.p)add(o,(+d.c||0)-o.p);
      else if(k==='h_shuf'&&Lv.shT&&Date.now()-Lv.shT<15000)add(o,1);}
    else if(type==='bonus'){if(k==='b_cnt')add(o,1);else if(k==='b_len'&&w.length>=+o.x)add(o,1);else if(k==='b_lvl')add(o,Lv.b+1-o.p);else if(k==='w_lvl')add(o,Lv.w+1-o.p);}
    else if(type==='jar'){if(k==='b_jar')add(o,1);}
    else if(type==='def'){if(k==='b_def')add(o,1);}
    else if(type==='hintc'){if(k==='h_letter')add(o,1);}
    else if(type==='act'){var a=d.t;if(k==='act'&&(a===o.x||(o.x==='cabv'&&a==='cab')||(o.x==='diary'&&a==='five')))add(o,d.n||1);}
    else if(type==='level'&&d.end==='win'){var ok=true;
      if(k==='l_win')add(o,1);else if(k==='l_new'&&d.first&&!d.daily)add(o,1);else if(k==='l_clean'&&!d.hinted)add(o,1);
      else if(k==='l_row'){if(d.hinted){if(o.p){o.p=0;ch=1;}}else add(o,1);}
      else if(k==='l_fast'&&d.s>=0&&d.s<=(+o.x||3)*60)add(o,1);else if(k==='l_nomiss'&&!Lv.miss)add(o,1);else if(k==='l_noshuf'&&!Lv.shuf)add(o,1);
      else ok=false;}
    if(o.p!==p0)ch=1;});
  if(type==='word'){Lv.w++;if((d.w||'').length>=5)Lv.l5++;if(Lv.shT&&Date.now()-Lv.shT<15000)Lv.shT=0;}
  else if(type==='bonus'){Lv.b++;Lv.w++;}
  else if(type==='miss')Lv.miss++;
  else if(type==='shuf'){Lv.shuf++;Lv.shT=Date.now();}
  else if(type==='level'){
    // цели «за один уровень» — заново; выполненные в победном уровне — сразу в награду (улетают в окне победы)
    z.k.forEach(function(o){var t=tp(o);if(t&&LVLK[t.k]&&!o.f&&o.p){o.p=0;ch=1;}});
    if(d.end==='win'){var fl=[];z.k.slice().forEach(function(o){if(o.f){var r=claim(o,1);if(r)fl.push(r);}});lastWin={k:d.key,fl:fl,t:Date.now()};if(fl.length)ch=1;}
    Lv={w:0,b:0,l5:0,miss:0,shuf:0,shT:0};}
  if(ch)sv();}
var lastWin=null;

/* ---------- награда ---------- */
var capSaid=0;
function give(n){if(!(n>0))return 0;try{if(window.ZBECO&&typeof ZBECO.give==='function')return ZBECO.give('zap',n,'zap');}catch(e){}try{addCoins(n,'zap');}catch(e){}return n;}
function claim(o,quiet){var z=zz(),i=z.k.indexOf(o);if(i<0||!o.f)return null;var e=E(),kd=kindOf(o),c0=+e[kd]||0,c=give(c0),sp=+(e.sp&&e.sp[kd])||0,hb=0,candy=0;
  if(c<c0){candy=1;z.cn++;sp+=+(e.sp&&e.sp.candy)||1;st('cap',{id:o.i,s:o.s,c:c});
    if(capSaid!==dayK()){capSaid=dayK();try{setTimeout(function(){toast(SAY.cap,4200);},quiet?2500:300);}catch(x){}}}
  if(kd==='mid'){z.m++;if(e.midHb>0&&z.m%e.midHb===0){hb=1;try{hbAdd(1,'zap');}catch(x){S.hb=(+S.hb||0)+1;}}}
  try{if(sp>0&&window.ZBSEA&&ZBSEA.addPts)ZBSEA.addPts(sp,'zap');}catch(x){}
  z.n++;if(!o.c)pushRecent(o.i);z.k.splice(i,1);
  st('claim',{t:(tp(o)||{}).k,id:o.i,s:o.s,n:z.n,c:c});
  var ch=null;if(o.c)ch=chainNext(o,quiet);
  var nw=gen(o.s-1);z.k.push(nw);z.k.sort(function(a,b){return a.s-b.s;});
  try{if(typeof SND!=='undefined'&&SND.coin&&!quiet)SND.coin();}catch(x){}
  sv();return {o:o,c:c,hb:hb,sp:sp,candy:candy,nw:nw,chest:ch};}
/* ---------- связки, сундук, магнитики ---------- */
function mgHas(i){var m=zz().mg||'';return m.charAt(i)==='1';}
function mgCount(){return (zz().mg||'').split('').filter(function(c){return c==='1';}).length;}
function mgSet(i){var z=zz(),m=z.mg||'';while(m.length<D.MAG.length)m+='0';z.mg=m.slice(0,i)+'1'+m.slice(i+1);}
function chainNext(o,quiet){var z=zz(),c=z.c||(z.c={i:0,st:0,n:0}),m=/^c(\d+)_(\d+)$/.exec(o.i),ci=m?+m[1]:c.i%D.CH.length;
  c.st=(c.st|0)+1;if(c.st<5)return null;
  // сундук связки
  var e=E(),ch=D.CH[ci]||{},n=(c.n|0)+1,five=n%5===0,kd=five?'chest5':'chest',c0=+e[kd]||0,got=give(c0),sp=+(e.sp&&e.sp[kd])||0,hb=+e.chestHb||0,mag=-1;
  if(got<c0){z.cn++;sp+=+(e.sp&&e.sp.candy)||1;}
  if(hb>0){try{hbAdd(hb,'zap');}catch(x){S.hb=(+S.hb||0)+hb;}}
  try{if(sp>0&&window.ZBSEA&&ZBSEA.addPts)ZBSEA.addPts(sp,'zap');}catch(x){}
  if(typeof ch.m==='number'&&!mgHas(ch.m))mag=ch.m;else for(var i=0;i<D.MAG.length;i++)if(!mgHas(i)){mag=i;break;}
  if(mag>=0)mgSet(mag);
  c.n=n;c.st=0;c.i=((c.i|0)+1)%D.CH.length;
  st('chain',{c:ch.id,n:n});st('chest',{c:ch.id,n:n,f:mag,id:kd});
  if(mag>=0&&mgCount()>=D.MAG.length)st('gold',{n:n});
  return {name:ch.n,c:got,c0:c0,hb:hb,mag:mag,five:five,gold:mag>=0&&mgCount()>=D.MAG.length};}
function chestHtml(r){var m=r.mag>=0?D.MAG[r.mag]:null;
  return '<div class="zz-chest">🎁</div><h2>Сундук: «'+esc(r.name)+'»</h2>'+(m?'<div class="zz-chm">'+m[0]+'</div><p>Магнитик «'+esc(m[1])+'» — на холодильник!</p>':'')+
    '<p class="zz-rw"><b>+'+r.c+'</b> '+coinI()+(r.hb?' и 💡 +'+r.hb:'')+(r.c<r.c0?' · 🍬 конфета (монеты на сегодня кончились)':'')+'</p>'+
    (r.gold?'<p><b>⭐ '+SAY.gold+'</b> Все 40 магнитиков!</p>':'')+'<div class="btns"><button class="btn green" id="zzChOk">Ура!</button></div>';}
function chestModal(r){if(typeof modal!=='function')return;modal(chestHtml(r));var mc=document.getElementById('mcard');if(mc)mc.classList.add('zz-m');
  try{SND.coin();}catch(e){}var b=document.getElementById('zzChOk');if(b)b.onclick=function(){hideModal();ZB.refresh();};}

/* ---------- замена ---------- */
function swapFree(){var z=zz();return (E().swapFree||0)>0&&z.sd!==dayK();}  // sd — день последней даровой замены, sw — платных замен всего
function swap(o,how){var z=zz(),i=z.k.indexOf(o);if(i<0)return false;
  if(how==='free')z.sd=dayK();else z.sw++;
  if(o.c){var t2=chStep(+o.i.slice(1).split('_')[0],+o.i.split('_')[1],2),nc=build(o.i,1,0,null,t2);if(!nc)return false;nc.c=1;nc.a=2;nc.s=o.s;z.k[i]=nc;
    st('swap',{t:'chain',id:o.i,s:o.s,n:z.n,f:how});sv();return nc;}
  pushRecent(o.i);z.k.splice(i,1);var nw=gen(o.s-1);z.k.push(nw);z.k.sort(function(a,b){return a.s-b.s;});
  st('swap',{t:(tp(o)||{}).k,id:o.i,s:o.s,n:z.n,f:how});sv();return nw;}

/* ---------- стили ---------- */
var cssOn=0;function css(){if(cssOn)return;cssOn=1;try{var l=document.createElement('link');l.rel='stylesheet';l.href='css/zb2-zap.css';document.head.appendChild(l);}catch(e){}}

/* ---------- холодильник на Доме ---------- */
function bar(a,b,cls){var p=Math.max(0,Math.min(100,Math.round(a/Math.max(1,b)*100)));return '<span class="zz-bar'+(cls?' '+cls:'')+'"><i style="width:'+p+'%"></i></span>';}
function chLbl(o){var m=/^c(\d+)_(\d+)$/.exec(o.i);if(!m)return '';var c=D.CH[+m[1]];return (c?c.n:'')+' · '+(+m[2]+1)+' из 5 🎁';}
function noteHtml(o){var p=prog(o),r=reward(o);
  return '<button type="button" class="zz-nt zz-c'+o.s+(o.f?' zz-done':'')+'" data-s="'+o.s+'">'+
    (o.f?'<em class="zz-take">✓ забрать +'+r+'</em>':'')+
    (o.c?'<span class="zz-chain">'+esc(chLbl(o))+'</span>':'')+'<b>'+esc(txt(o))+'</b><small>'+esc(who(o))+(o.f?'':' · '+p.txt)+'</small>'+(o.f?'':bar(p.a,p.b))+'</button>';}
function homeHtml(){var z=zz();if(!z||!ACTIVE)return '';ensure();css();
  var h='<div class="zz-fr" id="zzFr"><div class="zz-fh"><span>📌 '+SAY.title+'</span>'+magHtml()+'</div><div class="zz-notes">'+z.k.map(noteHtml).join('')+'</div></div>';
  return h;}
function magHtml(){var z=zz(),n=mgCount();if(!n)return '';var L=[];for(var i=0;i<D.MAG.length;i++)if(mgHas(i))L.push(D.MAG[i][0]);
  if(n>=D.MAG.length)return '<span class="zz-mags zz-gold">⭐ Отличник</span>';
  return '<span class="zz-mags">'+L.slice(-6).join('')+'<small>'+n+' из '+D.MAG.length+'</small></span>';}
function homeMount(el){[].forEach.call(el.querySelectorAll('.zz-nt'),function(b){b.onclick=function(){var s=+b.getAttribute('data-s'),z=zz(),o=null;
  z.k.forEach(function(x){if(x.s===s)o=x;});if(!o)return;try{SND.tap();}catch(e){}
  if(o.f){b.classList.add('zz-fly');var r=claim(o);setTimeout(function(){ZB.refresh();if(r&&r.chest)chestModal(r.chest);else if(r)say(r);},420);}else card(o);};});}
function say(r){var t='📌 +'+r.c+' '+(r.hb?'и 💡 ':'')+'— '+SAY.done[rnd(SAY.done.length)];if(r.candy&&!r.c)t='🍬 Конфета! +'+r.sp+' очк. четверти';try{toast(t,2600);}catch(e){}}

/* ---------- окно записки ---------- */
function goAct(x){try{if(x==='diary'){if(window.ZBTD&&ZBTD.openDiary)ZBTD.openDiary();else ZB.go('diary');return true;}
  if(x==='dict'){openDict();return true;}
  if(x==='mg'){for(var i=0;i<ZB.navSlots.length;i++)if(ZB.navSlots[i].id==='mg'&&ZB.navSlots[i].go){ZB.navSlots[i].go();return true;}ZB.go('mg');return true;}
  if(x==='cabv'){if(window.ZBCAB&&ZBCAB.go)ZBCAB.go('russkij');else ZB.go('cab',{id:'russkij'});return true;}
  if(x==='sos'){openSosedki();return true;}}catch(e){}return false;}
function play(o){var t=tp(o);if(t&&t.k==='act'&&goAct(t.x))return;var b=document.getElementById('btnPlay');if(b)b.click();}
function card(o){if(typeof modal!=='function')return;var z=zz(),e=E(),p=prog(o),r=reward(o),fr=swapFree(),ad=false,noSw=o.c&&o.a===2;
  try{ad=typeof adsOk==='function'&&adsOk();}catch(x){}
  var hbN=o.s!==1&&e.midHb>0?e.midHb-(z.m%e.midHb):0;
  var h='<div class="zz-card"><div class="zz-nt zz-big zz-c'+o.s+'"><b>'+esc(txt(o))+'</b><small>«'+esc(joke(o))+'» — '+esc(who(o))+'</small>'+
    '<small>'+p.txt+'</small>'+bar(p.a,p.b)+'</div>'+
    '<p class="zz-rw">Награда: <b>+'+r+'</b> '+coinI()+(hbN===1?' и 💡':'')+'</p>'+(fr?'<p class="zz-sw">'+SAY.swapFree+'? '+SAY.swapFreeS+'</p>':'')+
    (o.c?'<p class="zz-sw">'+esc(chLbl(o))+' — в конце сундук и магнитик</p>':'')+
    '<div class="btns"><button class="btn green" id="zzGo">Играть</button>'+
    (noSw?'':fr?'<button class="btn blue" id="zzSw">🔁 Другая записка — даром</button>':
      '<button class="btn ghost" id="zzSwC"'+(S.coins<e.swap?' disabled':'')+'>🔁 Другая записка за '+e.swap+' '+coinI()+'</button>'+
      (ad?'<button class="btn blue zbad" id="zzSwAd">🎬 Другая записка за рекламу</button>':''))+
    '<button class="btn ghost" id="zzNo">Закрыть</button></div></div>';
  modal(h);var mc=document.getElementById('mcard');if(mc)mc.classList.add('zz-m');
  function $(id){return document.getElementById(id);}
  function after(nw){hideModal();ZB.refresh();try{toast('📌 '+SAY.swapNew[rnd(SAY.swapNew.length)],2600);}catch(x){}}
  $('zzGo').onclick=function(){hideModal();play(o);};
  $('zzNo').onclick=function(){hideModal();try{SND.tap();}catch(x){}};
  if($('zzSw'))$('zzSw').onclick=function(){var nw=swap(o,'free');if(nw)after(nw);};
  if($('zzSwC'))$('zzSwC').onclick=function(){if(S.coins<e.swap)return;try{addCoins(-e.swap);STAT.ev('spend',{k:'zapswap',c:e.swap});}catch(x){}var nw=swap(o,'coin');if(nw)after(nw);};
  var b=$('zzSwAd');if(b)b.onclick=function(){if(b.disabled)return;b.disabled=true;var paid=false;try{STAT.place('zapswap');}catch(x){}
    function doIt(){if(paid)return '';paid=true;if(zz().k.indexOf(o)<0)return '';var nw=swap(o,'ad');return nw?'меняю записку':'';}
    try{showRewarded(function(){if(doIt())after();},function(){b.disabled=false;},function(){var mine=document.body.contains(b);var r=doIt();if(r&&mine)after();else if(r)ZB.refresh();return r;});}catch(x){b.disabled=false;}};}

/* ---------- окно победы: улетевшая записка и ближайшая ---------- */
function winHtml(ctx){var z=zz();if(!z||!ACTIVE)return '';css();var h='',g=ctx&&ctx.g;
  var fl=lastWin&&g&&lastWin.k===g.key&&Date.now()-lastWin.t<20000?lastWin.fl:[];
  if(fl.length===1){var r1=fl[0];h+='<div class="zz-wfly">📌 '+esc(txt(r1.o))+' ✓ <b>+'+r1.c+'</b>'+(r1.hb?' 💡':'')+(r1.candy&&!r1.c?' 🍬':'')+'</div>';}
  else if(fl.length>1){var sc=0,hb=0;fl.forEach(function(r){sc+=r.c;hb+=r.hb;});h+='<div class="zz-wfly zz-sum">📌 Записок выполнено: '+fl.length+' ✓ <b>+'+sc+'</b>'+(hb?' 💡':'')+'</div>';}
  fl.forEach(function(r){if(r.chest){var m=r.chest.mag>=0?D.MAG[r.chest.mag][0]:'';h+='<div class="zz-wn zz-new">🎁 Сундук «'+esc(r.chest.name)+'»: <b>+'+r.chest.c+'</b>'+(r.chest.hb?' 💡':'')+(m?' и магнитик '+m:'')+'</div>';}});
  if(fl.length){var nw=fl[0].nw;if(nw)h+='<div class="zz-wn zz-new">📌 <b>Новая:</b> '+esc(txt(nw))+'</div>';}
  else{var best=null,bv=0;z.k.forEach(function(o){if(o.f)return;var p=prog(o),v=p.a/Math.max(1,p.b);if(p.a>0&&v>bv){bv=v;best=o;}});
    if(best){var p=prog(best),rem=p.b-p.a;h+='<div class="zz-wn">📌 '+(rem===1?'<b>Ещё 1</b> — и записка готова: ':'')+esc(txt(best))+' · '+p.txt+bar(p.a,p.b)+'</div>';}}
  return h?'<div class="zz-win">'+h+'</div>':'';}

/* ---------- наружу ---------- */
Z.list=function(){var z=zz();return z?z.k.map(function(o){return {id:o.i,t:txt(o),p:o.p,g:o.g,f:o.f,s:o.s};}):[];};
Z.open=function(){try{if(typeof openMenu==='function')openMenu();setTimeout(function(){var e=document.getElementById('zzFr');if(e&&e.scrollIntoView)e.scrollIntoView({block:'center'});},300);}catch(e){}};
Z._t={tp:tp,chainOn:chainOn,gen:gen,build:build,claim:claim,swap:swap,ensure:ensure,txt:txt,up:up,zz:zz,onEv:onEv,slots:slots,goal:goal,lastWin:function(){return lastWin;},Lv:function(){return Lv;},
  reset:function(){upC.k=-1;}};
Z._init=function(){
  ZB.add(ZB.homeSlots,{id:'zap',order:10,zone:'side',render:homeHtml,mount:homeMount});
  /* zb2-MERGE: плашка холодильника в ряду chips (договор NEWB «Порядок Дома»: ZAP 30) — вход повыше; сам холодильник остаётся в side */
  ZB.add(ZB.homeSlots,{id:'zap-chip',order:30,zone:'chips',render:function(){var z=zz();if(!z||!ACTIVE||!(window.ZB2&&ZB2._reg.homefit&&!ZB2.off('homefit')))return '';
    var f=z.k.filter(function(o){return o.f;}).length;
    return '<button type="button" class="zn-chip zz-chip"'+(f?' data-zn-tag="🎁"':'')+'><i>📌</i><b>Записки</b><small>'+(f?'забери '+f:z.k.length+' дела')+'</small></button>';},
    mount:function(el){var b=el.querySelector('.zz-chip')||el;b.onclick=function(){Z.open();};}});
  ZB.add(ZB.winSlots,{id:'zap',order:60,zone:'ladder',render:winHtml}); // без fit: главный крючок «ещё уровень» — прячется второстепенное (fitWin)
  Z._on=onEv;var q=Z._q.splice(0);q.forEach(function(e){ZB.safe('zap:q',function(){onEv(e[0],e[1]);});});
  ZB.on('home',function(){ZB.safe('zap:ens',ensure);});
  ensure();ZB.refresh();};
})();
