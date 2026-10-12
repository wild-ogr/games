'use strict';
/* ================= gb-lvl2 — генератор уровней v2 «Командировка по Союзу» (поток LVL) =================
   БЕЗ DOM. Грузится игрой (под <!-- gb:LVL -->), сторожем заморозки и автопрогоном (tools/freeze/files.txt) ПОСЛЕ блока LOGIC
   и после gb-goods-data.js (GBG), gb-obst-rules.js (GBOB), gb-union.js (GBU). Функции LOGIC зовёт, но не меняет.
   Сложность «средне» (решение владельца 10.10): терпение 4 + 2,5·(ходов на тройку) с 11-го, 1–10 — мягче; лёд с 4-го,
   коробка «Дефицит» с 5-го, меньше пустых мест. Кривая без плато до 1500-го: рост раз в республику; внутри республики
   города 1–3 «вход» (новая помеха), 4–7 микс, 8–10 трудные; 10-й уровень города — Ревизия, 100-й республики — «Главк».
   После 1500-го — «Сверхплан» (бесконечно, максимум сложности, случайные помехи, своё зерно).

   ДОГОВОР:
   GBL2.v = 2;  GBL2.gen(i, rareId) → уровень (i с 0; rareId — номер карточки «Дефицита» или -1), как genLevel v1 + поля
                lv.gbx (отпечаток нового: помехи и т. п.), lv.v2=1, lv.glavk, lv.sp, lv.obs (какие помехи поставлены)
   GBL2.day(ГГГГММДД, rareId)  → задание дня (сложность — как 28-й уровень по новой кривой, своё зерно дня, без новых помех)
   GBL2.params(i)              → параметры уровня (для «Пути», режимов MODE, проверок)
   GBL2.seed(i)                → зерно уровня
   GBL2.DAILY_IDX = 27
   GB_FREEZE_GEN(i) / GB_FREEZE_DAY(ds) — то же самое для сторожа tools/freeze.sh.
   Местные товары — GBU.goods(rep) (GOODS); помехи — GBOB.place(lv, id, R, pow) (OBST; нет GBOB — помех нет; выключенная флагом
   GBOB.on(id)=false — не ставится; place=false — попытка раскладки выбрасывается).
   В игре включается флагом GB.flag('lvl2') (js/gb-lvl.js); выключен → старые уровни v1.
*/
var GBL2=(function(){
  var ON=function(name){return typeof GB==='undefined'||!GB.flag||GB.flag(name);}; // в jsc (сторож) GB нет — всё включено
  var SAW=[0,1,2,1,3,4,2,5,6,7];
  var WAVE=[0,1,1,2,2,3,3,4,4,4]; // республика 2–15: размер по городу (1–3 «вход», 4–7 микс, 8–10 трудные)
  function seed(i){return i>=1500?(i*104729+99991)>>>0:i*7919+17;}
  // параметры уровня. j — «место на кривой» (в Сверхплане — трудные города последней республики)
  function params(i){
    if(i===0)return{tut:1,K:1};
    if(i===1)return{S:4,D:2,T:3,E:4,ice:0,box:0,K:2,pt:30,r:0,ci:0,k:1};
    if(i===2)return{S:4,D:2,T:4,E:3,ice:0,box:0,K:3,pt:8,r:0,ci:0,k:2};
    var sp=i>=1500,j=sp?1470+(i-1500)%30:i,r=Math.floor(j/100),ci=Math.floor(j%100/10),k=j%10,boss=k===9,glavk=!sp&&j%100===99,saw=SAW[k];
    var cc=r===0?Math.min(7,ci+(i>=10?1:0)):3+WAVE[ci],d=cc*2+saw;
    var S=Math.min(10,4+Math.floor(d/3)+(boss?1:0)),D=Math.min(4,2+Math.floor(d/7))+(boss?1:0);
    if(glavk){S=10;D=5;}
    var T=Math.min(15,3+Math.floor(d/2)+(boss?1:0)+(r>0?Math.min(2,Math.floor(r/5)):0)+(glavk?1:0));
    var E=Math.max(3,Math.ceil(S/2)+1-Math.floor(saw/3)-(i>=3?1:0)-(r>=6?1:0));
    var ice,box,rare;
    if(r===0){
      ice=i===3?1:i>=5?Math.min(4,Math.floor((saw+cc)/3)+(boss?1:0)):0;
      box=i>=11?Math.min(3,(saw>=3?1:0)+(cc>=3?1:0)+(boss?1:0)):i===4?1:i===9?1:0;
      rare=i===4||i===9||(i>=11&&(i%3===1||boss));
    }else{ // со 2-й республики трудность дают помехи — лёда и коробок меньше
      ice=Math.min(3,Math.floor((saw+WAVE[ci])/4)+(boss?1:0));
      box=Math.min(2,(saw>=4?1:0)+(boss?1:0));
      rare=i%3===1||boss;
    }
    var K=Math.min(12,3+Math.floor(d/3)+(boss?2:0));if(glavk)K=14;
    // терпение: v2 = 4 + 2,5·мпт + pt. 1–10 — мягче (первое «почти ушёл» на 6–8-м), Ревизии +2
    var pt=i<5?10:i<10?6:0;pt+=boss?2:0;
    return{r:r,ci:ci,k:k,boss:boss,glavk:glavk,sp:sp,c:Math.floor(i/10),S:S,D:D,T:T,E:E,ice:ice,box:box,rare:rare,K:K,pt:pt};}
  // дружелюбие: v1 «пила» по номеру в городе; дальше — строже по республике и части
  function need(i,P){if(i<3)return .9;var b=[.85,.8,.7,.75,.6,.55,.7,.5,.45,.35][P.k];
    if(P.r===0)return b-Math.min(.1,Math.floor(i/10)*.015);
    return Math.max(.25,b-.1-Math.min(.08,P.r*.006)-(P.ci>=7?.04:0)-(P.glavk?.05:0));}
  // помехи уровня: [{id,pow}] — новая помеха республики + (в миксе) прежние; республики 14–15 и Сверхплан — смесь
  function obsFor(i,P){if(!P.r||P.tut)return [];var U=typeof GBU!=='undefined'?GBU:null;if(!U)return [];
    var R=rng(seed(i)*3+11),all=U.obs(14),out=[],nw=U.REPS[P.r].ob,prev=U.obs(P.r).filter(function(x){return x!==nw;});
    function pick(list,n){list=list.slice();var o=[];while(n-->0&&list.length){var k=Math.floor(R()*list.length);o.push(list.splice(k,1)[0]);}return o;}
    var ids;
    if(nw&&!P.sp){var extra=P.ci<3?0:P.ci<7?(R()<.5?1:0):1+(R()<.4?1:0);if(P.boss)extra++;ids=[nw].concat(pick(prev,Math.min(2,extra)));}
    else ids=pick(all,1+(P.ci>=3?1:0)+(P.ci>=7||P.boss?1:0));
    if(P.boss){var n0=ids.length;ids=ids.filter(function(x){return x!==7;});if(ids.length<n0&&prev.length)ids=ids.concat(pick(prev.filter(function(x){return x!==7&&ids.indexOf(x)<0;}),1));} // «Подвоз» на Ревизии — тупик на тупике (sim: 50 %+)
    for(var k=0;k<ids.length;k++){var id=ids[k];
      var pw=id===nw&&P.ci===0?1:P.ci<7?2:3;if(id===7)pw=1;if(id===10)pw=1; /* «Склочный» — сила 1 (каждый 4-й): сильнее — Казахстан 20 % проигрышей, 3★ 21 % (sim-c) */ /* «Подвоз» на полную силу — тупик за тупиком (sim) */
      out.push({id:id,pow:pw});}
    return out;}
  // набор товаров уровня: старые 22 по порядку появления + местные товары республики (1–2 вида на уровне, с 11-го)
  function pool(i,P,R){var poolN=Math.min(GOOD_ORDER.length,Math.max(P.T,6+Math.floor(i/2)));var base=shuffle(GOOD_ORDER.slice(0,poolN),R);
    var loc=[];if(i>=10&&typeof GBU!=='undefined'&&ON('goods'))loc=shuffle(GBU.goods(P.sp?Math.floor(R()*15):P.r).slice(),R);
    var nl=Math.min(loc.length,P.T>=6?2:1,Math.max(0,P.T-2));return loc.slice(0,nl).concat(base);}
  // = buildLevel из LOGIC, но набор товаров — свой (pool), а не только GOOD_ORDER
  function build(P,R,i,rareId){
    var S=P.S,nb=[],sz=[],s,k,a,x,n;
    for(s=0;s<S;s++){n=P.D-1-(R()<.35?1:0);n=Math.max(0,n);nb.push(n);a=[];for(k=0;k<n;k++){x=R();a.push(x<.65?3:x<.95?2:1);}sz.push(a);}
    var fr=[];for(s=0;s<S;s++)fr.push(3);var E=P.E,g=0;
    while(E>0&&g++<500){s=Math.floor(R()*S);if(fr[s]>(nb[s]?1:0)){fr[s]--;E--;}}
    var N=0;for(s=0;s<S;s++){N+=fr[s];for(k=0;k<sz[s].length;k++)N+=sz[s][k];}
    g=0;while(N%3&&g++<200){s=Math.floor(R()*S);a=sz[s];if(a.length){k=Math.floor(R()*a.length);if(a[k]>1){a[k]--;N--;}}else if(fr[s]>1){fr[s]--;N--;}}
    if(N%3)return null;
    var M=N/3,pl=pool(i,P,R),T=Math.min(P.T,M),types=pl.slice(0,T);
    var tri=types.slice();while(tri.length<M)tri.push(types[Math.floor(R()*T)]);
    if(P.rare&&rareId>=0&&M>=4){k=-1;for(var q0=0;q0<tri.length&&k<0;q0++)if(tri.indexOf(tri[q0])!==q0)k=q0;tri[k>=0?k:0]=RARE0+rareId;}
    var items=[];for(k=0;k<tri.length;k++)items.push(tri[k],tri[k],tri[k]);shuffle(items,R);
    var sh=[],q=0;
    for(s=0;s<S;s++){var L=[],f=[0,0,0],pos=shuffle([0,1,2],R);for(k=0;k<fr[s];k++)f[pos[k]]=items[q++];L.push(f);
      for(var m=0;m<sz[s].length;m++){var rr=[0,0,0],ps=shuffle([0,1,2],R);for(k=0;k<sz[s][m];k++)rr[ps[k]]=items[q++];L.push(rr);}sh.push(L);}
    var all=[];sh.forEach(function(L,s1){L.forEach(function(r,k1){r.forEach(function(c,j){if(c)all.push([s1,k1,j]);});});});
    for(var it=0;it<400;it++){var bad=null;sh.forEach(function(L){L.forEach(function(r,k1){if(!bad&&tripleT(r)&&(k1===0||R()<.8))bad=r;});});if(!bad)break;
      var j=Math.floor(R()*3),o=all[Math.floor(R()*all.length)],r2=sh[o[0]][o[1]],t=bad[j];bad[j]=r2[o[2]];r2[o[2]]=t;}
    var cand=all.filter(function(c){return c[1]<=1;});shuffle(cand,R);var used={};
    var nb2=P.box||0;if(P.rare&&nb2<1&&tri.some(function(t){return t>=RARE0;}))nb2=1;
    var cs=cand.slice().sort(function(x1,y1){return (sh[y1[0]][y1[1]][y1[2]]>=RARE0)-(sh[x1[0]][x1[1]][x1[2]]>=RARE0);});
    for(k=0;k<cs.length;k++){if(nb2<=0)break;var c1=cs[k],key=c1[0]+':'+c1[1];if(used[key])continue;
      if(c1[1]===0&&sh[c1[0]][0].filter(Boolean).length<2)continue;used[key]=1;sh[c1[0]][c1[1]][c1[2]]|=BOXF;nb2--;}
    var ni=P.ice||0;for(k=0;k<cand.length;k++){if(ni<=0)break;var c2=cand[k],key2=c2[0]+':'+c2[1];if(used[key2])continue;var cv=sh[c2[0]][c2[1]][c2[2]];if(cv&BOXF)continue;
      used[key2]=1;sh[c2[0]][c2[1]][c2[2]]=cv|((2+Math.floor(R()*3)+c2[1])<<8);ni--;}
    return{S:S,sh:sh,items:N,types:types.slice(),rare:tri.some(function(t){return t>=RARE0;})?RARE0+rareId:0,K:P.K,boss:!!P.boss,idx:i};}
  // = genLevel из LOGIC: до 120 попыток, решатель (уровень всегда проходим), отбор по дружелюбию; терпение v2
  /* ---- помехи уровня и поправки (общие для полного поиска и таблицы). rx — «послабление» (0–2): если ни одна раскладка
     не влезла в цель (проигрыши/тупики), поиск повторяется с меньшим числом помех, видов, льда, коробок и покупателей ---- */
  function prep(i,P,rx){var obs=P.noob?[]:obsFor(i,P);if(typeof GBOB==='undefined'||!GBOB||typeof GBOB.place!=='function')obs=[];
    if(obs.some(function(o){return o.id===7;})){obs=obs.slice(0,1);P.E=Math.max(P.E+2,Math.ceil(P.S/2)+1);} // «Подвоз» сам заполняет витрину: места свободнее и без других помех (sim: с «Уборщицей» 44 % тупиков)
    if(rx){obs=obs.slice(0,Math.max(obs.length?1:0,obs.length-rx));P.T=Math.max(3,P.T-rx);P.ice=Math.max(0,(P.ice||0)-rx);P.box=Math.max(0,(P.box||0)-rx);if(P.K>8)P.K-=2*rx;P.E=Math.min(6,P.E+rx);}
    return obs;}
  /* ---- таблица-подсказка js/gb-lvl2-tab.js (GBL2_TAB, снимает tools/lvl_tab.sh make): для уровня 1..N — какая попытка k
     полного поиска победила, E (пустых мест) на ней, терпение P (после калибровки), pd и хэш раскладки. Игра строит ровно эту
     попытку (без решателя, партий и калибровки — доли секунды). Хэш не сошёлся (правила/товары/флаги поменялись) — полный поиск. ---- */
  var B36='0123456789abcdefghijklmnopqrstuvwxyz';
  function h32(s,h){h=h>>>0;for(var k=0;k<s.length;k++){h^=s.charCodeAt(k);h=Math.imul(h,16777619)>>>0;}return h;}
  function lhash(lv){var sh=lv.sh.map(function(L){return L.map(function(r){return r.map(function(c){return (c&255)>=RARE0?(c&~255)|RARE0:c;});});});
    var x=h32(JSON.stringify([lv.S,sh,lv.types,lv.K,lv.gbx||'']),2166136261)%46656;return B36[Math.floor(x/1296)]+B36[Math.floor(x/36)%36]+B36[x%36];}
  function n36(s){return parseInt(s,36);}
  function tabEntry(lv){if(!lv||!lv.v2||lv.gE==null)return null;var k=lv.try+(lv.gR?120:0)+240*(lv.rx||0);
    return B36[Math.floor(k/36)]+B36[k%36]+B36[lv.gE]+B36[Math.floor(lv.P/36)]+B36[lv.P%36]+B36[lv.pd]+lhash(lv);}
  function fast(i,rareId){var T=typeof GBL2_TAB!=='undefined'?GBL2_TAB:null;if(!T||!T.d||i<1||i>=T.n)return null;
    var e=T.d.substr(i*9,9);if(e.length<9||e==='---------')return null;
    var k=n36(e.substr(0,2)),rx=Math.floor(k/240),rs=k%240>=120;k=k%120;var P=params(i),obs=prep(i,P,rx);if(rs)obs=[];P.E=n36(e[2]);
    var R=rng(seed(i)+rx*500009+k*1013),lv=build(P,R,i,rareId==null?-1:rareId);if(!lv)return null;
    lv.gbx='v2'+(P.glavk?'g':'')+(P.sp?'s':'');
    var put=[];for(var o=0;o<obs.length;o++){if(!GBOB.on(obs[o].id))continue;if(GBOB.place(lv,obs[o].id,R,obs[o].pow))put.push(obs[o].id);else return null;}
    if(lhash(lv)!==e.substr(6,3))return null;
    lv.try=k;lv.P=n36(e.substr(3,2));lv.pd=n36(e[5]);lv.v2=1;lv.glavk=P.glavk?1:0;lv.sp=P.sp?1:0;lv.obs=put;lv.rx=rx;lv.tab=1;return lv;}
  function gen(i,rareId,sd,P0,slow,rx){if(sd==null&&!P0&&!slow){var fl=fast(i,rareId);if(fl)return fl;}
    rx=rx||0;var P=P0||params(i);if(P.tut)return tutLevel();var nd=need(i,P),best=null,bc=null,nc=0,s0=(sd==null?seed(i):sd)+rx*500009,rs=0;
    var obs=prep(i,P,rx);
    if(obs.some(function(o){return o.id===7;})){obs=obs.slice(0,1);P.E=Math.max(P.E+2,Math.ceil(P.S/2)+1);} // «Подвоз» сам заполняет витрину: места свободнее, без других помех (с «Уборщицей» и т. п. — 44 % тупиков) (иначе тупики, sim-b: 12 %) // «Подвоз» сам заполняет витрину — места свободнее (иначе тупики, sim-b: 12 %)
    for(var k=0;k<120;k++){if(k===60&&!best&&!bc&&obs.length){obs=[];rs=1;} // помехи не встают ни на одну раскладку — уровень без них (не бывает пустых)
      var R=rng(s0+k*1013),lv=build(P,R,i,rareId==null?-1:rareId);if(!lv)continue;
      lv.gE=P.E;lv.gR=rs;lv.rx=rx;lv.gbx='v2'+(P.glavk?'g':'')+(P.sp?'s':''); // свои поля отпечатка — ДО GBOB.place (он дописывает '|ob:…')
      var put=[],okp=true;for(var o=0;o<obs.length&&okp;o++){if(!GBOB.on(obs[o].id))continue;if(GBOB.place(lv,obs[o].id,R,obs[o].pow))put.push(obs[o].id);else okp=false;}
      if(!okp)continue; // помеха на эту раскладку не встала (нет холодных/развесных и т.п.) — следующая попытка
      var st=mkState(lv);settle(lv,st,lv.sh.map(function(_,j){return j;}));var sol=solve(lv,st,30000);if(!sol)continue;
      lv.sol=sol.length;lv.try=k;lv.fr=friendly(lv,16,rng(s0+k));
      var mp=Math.max(2.2,Math.min(4.5,lv.mpt));
      lv.P=Math.round(4+2.5*mp)+(P.pt||0)+2*put.length;lv.pd=1+Math.round(mp/2);if(P.pt>=30){lv.P=40;lv.pd=0;}
      lv.v2=1;lv.glavk=P.glavk?1:0;lv.sp=P.sp?1:0;lv.obs=put;
      if(lv.fr>=nd){ // дружелюбный: подгоняем терпение; не влез в цель даже с запасом +8 — «лабиринт», ищем другой (до 6 раз)
        if(P.pt>=30||P.sp)return lv;nc++; /* Сверхплан — без калибровки: таблицы нет, строится в игре (терпение по формуле, это «максимум») */if(calib(lv,i,P,s0)&&botOk(lv,i,sd))return lv;if(!bc||(lv.cal[5]>15)<(bc.cal[5]>15)||((lv.cal[5]>15)===(bc.cal[5]>15)&&lv.cal[3]<bc.cal[3]))bc=lv;if(nc>=6)break;continue;}
      if(!best||lv.fr>best.fr)best=lv;
      if(k%30===29&&P.E<6)P.E++;}
    var res=bc;if(!res){res=best;if(best&&!(P.pt>=30)&&!P.sp)calib(best,i,P,s0);}
    // не влезло в цель даже лучшее (проигрышей на 10 % выше цели или тупиков > 25 %) — послабление и новый поиск (кроме заданий дня)
    if(res&&res.cal&&sd==null&&!P0&&rx<2){var b=band(i,params(i));if(res.cal[3]>100*b[1]+5||res.cal[5]>25||!botOk(res,i,sd)){var r2=gen(i,rareId,null,null,true,rx+1);if(r2)return r2;}}
    return res;}
  /* ---- терпение под цель: «человек с очередью» (как tools/lvl_sim.js) играет уровень; проигрышей больше цели — терпения +1,
     меньше — −1 (не ниже 4+2,5·2,2). Цели (решение владельца «средне»): 1–10 — почти без проигрышей, обычные 3–15 %,
     трудные места «пилы» до 20 %, Ревизии 18–32 %, «Главк» 22–38 %. Зерно своё — результат один и тот же у всех ---- */
  // одна партия при «бесконечном» терпении: для каждого покупателя — сколько ходов без тройки он прождал (w) и его надбавка (e);
  // с терпением P он ушёл бы, если w ≥ P+e. Проигрыш при P — трое таких (уход меняет дальнейшую очередь слабо — сверяем lvl_sim)
  var BIG=100000;
  function sim(lv0,R,Pr){var lv={};for(var kk in lv0)lv[kk]=lv0[kk];lv.sh=lv0.sh.map(function(L){return L.map(function(r){return r.slice();});});lv.live=1;lv.P=Pr||BIG;
    var st=mkState(lv);settle(lv,st,lv.sh.map(function(_,j){return j;}));var q=qInit(lv,R);qFill(lv,st,q);var seen={},steps=0,table=0,cs=[],done={};seen[keyOf(st)]=1;
    function reg(){for(var z=0;z<q.vis.length;z++){var v=q.vis[z];if(!done[v.id]){done[v.id]=v;cs.push(v);}}}
    reg();
    while(st.n>0&&steps++<700){var want=q.vis.map(function(v){return v.t;}),mv=listMoves(lv,st,want),ok=[],m,s1,ev,k1;
      for(var a=0;a<mv.length&&ok.length<4;a++){m=mv[a];s1=cloneSt(st);ev=[];doMove(lv,s1,m[1],m[2],m[3],m[4],ev);k1=keyOf(s1);if(!seen[k1])ok.push([s1,k1,ev]);}
      if(!ok.length){var mm=mv.slice(0,4);
        if(!mm.length){for(var a2=0;a2<lv.S;a2++)for(var sa=0;sa<3;sa++)if(movable(st,st.F[a2][sa]))for(var b=0;b<lv.S;b++){var fs=freeSlot(st.F[b]);if(b!==a2&&fs>=0)mm.push([0,a2,sa,b,fs]);}
          if(!mm.length){if(table)break;table=1;lv.sh.push([[0,0,0]]);lv.S++;st.p.push(0);st.F.push([0,0,0]);continue;}
          mm=[mm[Math.floor(R()*mm.length)]];}
        for(var c=0;c<mm.length;c++){m=mm[c];s1=cloneSt(st);ev=[];doMove(lv,s1,m[1],m[2],m[3],m[4],ev);ok.push([s1,keyOf(s1),ev]);}}
      var x=R(),pk=ok[x<.62||ok.length<2?0:x<.87||ok.length<3?1:Math.floor(R()*ok.length)];
      for(var kq in pk[0])st[kq]=pk[0][kq];seen[pk[1]]=1;
      var cl=0;for(var e=0;e<pk[2].length;e++)if(pk[2][e].k==='clear'){cl++;qClear(q,pk[2][e].t);}
      if(!cl){qTick(q);if(Pr&&q.angry>=3)return{lose:1};}
      qFill(lv,st,q);reg();}
    if(Pr)return{lose:0,z:q.angry===0,stuck:st.n>0};
    return cs.map(function(v){return [v.max-v.pat,v.max-BIG];});}
  // [проигрыши от, до, доля 3★ не меньше] — 3★ поднимает терпение, если покупатели уходят слишком часто (Склочный: sim-b 3★ 6 %)
  function band(i,P){if(i<10)return[0,.04,.8];if(P.glavk)return[.22,.38,.1];if(P.boss)return P.r===0&&i<20?[.05,.2,.35]:[.18,.32,.2];
    if(P.r===0&&i<20)return[.02,.1,.5];return P.k>=7?[.05,.2,.35]:[.03,.15,.45];}
  var CAL_N=16,HON_N=24;
  function calib(lv,i,P,s0){var b=band(i,P),sk=lv.obs&&lv.obs.indexOf(10)>=0,floor=Math.round(4+2.5*2.2),Pf=lv.P,R=rng(s0*7+5),plays=[];
    for(var k=0;k<CAL_N;k++)plays.push(sim(lv,R));
    if(sk)b=[b[0],b[1],0]; // склочный почти всегда уходит недовольным — 3★ на таких уровнях реже (так задумано)
    function res(Pv){var n=0,z=0;for(var k2=0;k2<plays.length;k2++){var g=0,cs=plays[k2];for(var j=0;j<cs.length;j++)if(cs[j][0]>=Pv+cs[j][1])g++;if(g>=3)n++;if(!g)z++;}return[n/plays.length,z/plays.length];}
    function bad(x){return x[0]>b[1]||x[1]<b[2];}
    var Pv=Pf;if(bad(res(Pv))){while(Pv<Pf+8&&bad(res(Pv)))Pv++;}
    else{while(Pv>floor&&res(Pv)[0]<b[0]&&!bad(res(Pv-1)))Pv--;}
    // «Склочный»: уходы сами меняют очередь (новые склочные приходят чаще) — модель «без уходов» врёт; проверяем честными партиями
    // проверка честными партиями (уходы меняют очередь: «Склочный», часы «Обеда/Уборщицы» — модель «без уходов» ошибается):
    // проигрышей больше цели — терпения +2 (до 4 раз). Заодно тупики (второй тупик после «Столика»): больше 15 % — раскладка плохая
    var nl=0,ns=0,HN=P.boss?40:HON_N;if(i>=10)for(var rd=0;rd<7;rd++){var R2=rng(s0*7+9+rd);nl=0;ns=0;
      for(var k3=0;k3<HN;k3++){var o3=sim(lv,R2,Pv);if(o3.lose)nl++;else if(o3.stuck)ns++;}
      if(nl/HN>b[1]-(P.boss?.06:0)&&rd<6)Pv+=2; /* Ревизии — с запасом: 24 партии шумят, а перебор там больнее всего */else break;}
    var x=res(Pv),hl=i>=10?nl/HN:x[0],hs=ns/HN;lv.P=Pv;
    lv.cal=[Pf,Math.round(res(Pf)[0]*100),Pv,Math.round(hl*100),Math.round(x[1]*100),Math.round(hs*100)];return hl<=b[1]&&hs<=.15;}
  // автопрогон tools/check.sh гоняет бота botPlay (LOGIC) с зерном уровня — раскладку, где бот не справляется за 800 ходов, не берём
  function botOk(lv,i,sd){if(sd!=null||i>=1500||typeof botPlay!=='function')return true;var c={};for(var k in lv)c[k]=lv[k];c.live=1;
    try{return !!botPlay(c,seed(i)).ok;}catch(e){return true;}}
  var DAILY_IDX=27;
  function day(ds,rareId){var P=params(DAILY_IDX);P.noob=1;return gen(DAILY_IDX,rareId==null?0:rareId,ds*13+5,P);}
  return{v:2,_sim:sim,tabEntry:tabEntry,gen:gen,day:day,params:params,seed:seed,need:need,obsFor:obsFor,DAILY_IDX:DAILY_IDX};
})();
function GB_FREEZE_GEN(i){var p=GBL2.params(i);return GBL2.gen(i,p.rare?(i%NRARE):-1);}
function GB_FREEZE_DAY(ds){return GBL2.day(ds,0);}
if(typeof window!=='undefined')window.GBL2=GBL2;
