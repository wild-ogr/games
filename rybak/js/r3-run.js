var RUN=(function(){'use strict';var VER=1;function num(v,d){v=+v;return isFinite(v)?v:(d||0);}
function rng(s){s=(s>>>0)||1;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function hash(a){var h=2166136261>>>0;for(var i=0;i<a.length;i++){h^=(a[i]>>>0)&0xffffffff;h=Math.imul(h,16777619)>>>0;}return h;}
function E(){try{if(typeof R3E!=='undefined'&&R3E&&R3E.run)return R3E.run;}catch(e){}return DEF;}
var DEF={from:3,condFrom:4,jokFrom:7,legs:4,deckMin:5,deckMax:12,jokMax:2,rv:.45,lie:[1.4,2.2],sayEvery:2,bet:50,betPerDay:1,bossX:2,condX:2,dblWin:2,dblLose:.5,chest:[3000,10000,30000],chestDay:2,chestBait:[5,10,15],windK:.6};var CARDS={worm:{ic:'🐛',n:'Червь',b:'worm'},maggot:{ic:'⚪',n:'Опарыш',b:'maggot'},dough:{ic:'🍞',n:'Тесто',b:'dough'},blood:{ic:'🔴',n:'Мотыль',b:'blood'},corn:{ic:'🌽',n:'Кукуруза',b:'corn'},live:{ic:'🐟',n:'Живец',b:'live'},j_pelm:{ic:'🥟',n:'Пельмень жены',b:'dough',j:1,d:'каждая 3-я рыба забега ×2'},j_nosok:{ic:'🧦',n:'Носок Кума',b:'worm',j:1,d:'сошедшая рыба — очки как пойманной; мелочь до 250 г — без очков (Васька не подходит)'},j_suhar:{ic:'🥨',n:'Сухарь из кармана',b:'dough',j:1,d:'рыба от 1 кг +100 очков'},j_karam:{ic:'🍬',n:'Карамелька «Рыбка»',b:'maggot',j:1,d:'первая рыба каждого захода ×2'}};var BASE=['worm','worm','worm','maggot','maggot','dough','dough','blood'];function isJ(id){return!!(CARDS[id]&&CARDS[id].j);}
function jokN(dk){var n=0;for(var i=0;i<dk.length;i++)if(isJ(dk[i]))n++;return n;}
function deckNew(){return BASE.slice();}
function shuffle(a,R){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pileNew(dk,R){return{pile:shuffle(dk,R),i:0,R:R};}
function draw(p,works){var n=p.pile.length;for(var k=0;k<n;k++){if(p.i>=n){p.pile=shuffle(p.pile,p.R);p.i=0;}var id=p.pile[p.i++];if(!works||works(CARDS[id].b))return id;}return'worm';}
function peek(p,works){var n=p.pile.length,i=p.i,pile=p.pile;for(var k=0;k<n;k++){if(i>=n)return null;var id=pile[i++];if(!works||works(CARDS[id].b))return id;}return null;}
function offer(dk,day,R,works){var e=E(),pool=[];for(var id in CARDS){var c=CARDS[id];if(c.j){if(day<e.jokFrom||jokN(dk)>=e.jokMax||dk.indexOf(id)>=0)continue;}
else if(works&&!works(c.b))continue;pool.push(id);}
var out=[];while(out.length<3&&pool.length){var k=Math.floor(R()*pool.length);out.push(pool[k]);pool.splice(k,1);}
if(day>=e.jokFrom&&jokN(dk)<e.jokMax&&!out.some(isJ)){var js=Object.keys(CARDS).filter(function(id){return isJ(id)&&dk.indexOf(id)<0;});if(js.length)out[2]=js[Math.floor(R()*js.length)];}
return out;}
function add(dk,id){var e=E();if(!CARDS[id]||dk.length>=e.deckMax)return false;if(isJ(id)&&(jokN(dk)>=e.jokMax||dk.indexOf(id)>=0))return false;dk.push(id);return true;}
function drop(dk,id){var e=E(),i=dk.indexOf(id);if(i<0||dk.length<=e.deckMin)return false;dk.splice(i,1);return true;}
var ZN={weed:{ic:'🌾',n:'Камыш'},pit:{ic:'🕳',n:'Яма'},edge:{ic:'〰',n:'Бровка'},snag:{ic:'🌳',n:'Коряжник'},open:{ic:'💧',n:'Плёс'}};function topFish(pi,z,c,big){var P=PLACES[pi],best=null,bv=0;for(var i=0;i<P.fish.length;i++){var f=FISH[P.fish[i]];if(!f||f.leg)continue;var x=ZOR.act(f,pi,z,c);if(big)x*=Math.sqrt(f.w[1]||1);if(x>bv){bv=x;best=f;}}return best;}
function zonesOf(pi){var o=['open'];try{(PZ[pi]||[]).forEach(function(q){if(o.indexOf(q.k)<0)o.push(q.k);});}catch(e){}return o;}
function zNode(pi,z,c){var sg=null;try{sg=ZOR.signsAt(pi,z,c,function(){return 0;});}catch(e){}var f=null,bv=0;if(sg&&sg.k!=='quiet'&&sg.ids)for(var i=0;i<sg.ids.length;i++){var x=FISH[sg.ids[i]];if(!x||x.leg)continue;var a=ZOR.act(x,pi,z,c);if(a>bv){bv=a;f=x;}}
if(!f)f=topFish(pi,z,c,false);if(!f)return null;return{k:'z',z:z,f:f.id,ic:ZN[z].ic,n:ZN[z].n,sk:ZOR.signOf(f)};}
function trail(pi,c,legs,R){var zs=zonesOf(pi),rows=[],bz=['snag','pit','edge','weed','open'].filter(function(z){return zs.indexOf(z)>=0;})[0]||'open';var bf=topFish(pi,bz,c,true),boss={k:'boss',z:bz,f:bf?bf.id:'',ic:'🪵',n:'Коряга Хозяина',sk:bf?ZOR.signOf(bf):'quiet'};var zn=[];zs.forEach(function(z){var n=zNode(pi,z,c);if(n)zn.push(n);});var kost=0,mit=0;for(var r=0;r<legs-1;r++){var opts=shuffle(zn,R).slice(0,2);if(r>0&&!kost&&R()<.6){opts[1]={k:'kost',ic:'🔥',n:'Костёр',z:opts[0].z};kost=1;}
else if(r>0&&!mit&&R()<.6){opts[1]={k:'mit',ic:'❓',n:'Митяй машет',z:opts[0].z};mit=1;}
if(opts.length<2)opts.push({k:'kost',ic:'🔥',n:'Костёр',z:opts[0]?opts[0].z:'open'});rows.push(opts);}
rows.push([boss]);return rows;}
function pathDef(rows){return rows.map(function(){return 0;});}
function mitGift(R){var u=R();return u<.4?'card':u<.75?'cast':'sign';}
var COND=[{id:'wind',ic:'🌬',n:'Ветер в лицо',d:'дальний заброс не долетает',ok:function(){return true;}},{id:'dough',ic:'🍞',n:'Мотыль кончился',d:'вся колода играет тестом',ok:function(x){return!!(x.works&&x.works('dough'));}},{id:'wife',ic:'⏱',n:'Жена дала 20 минут',d:'на один заход меньше',ok:function(x){return(x.legs||4)>=3;}}];var CBY={};COND.forEach(function(c){CBY[c.id]=c;});function cond(dk,pi,x){var ok=COND.filter(function(c){return c.ok(x||{});});if(!ok.length)return null;return ok[hash([dk,pi,77])%ok.length];}
function fishMod(run,e,leg){var o={x:1,c:0,zero:false,tr:[]},dk=run.dk||[],ee=E();run.n=(run.n||0)+1;if(leg===run.bossLeg&&e.z===run.boss.z){o.x*=ee.bossX;o.tr.push(['🪵','Коряга ×'+ee.bossX]);}
if(dk.indexOf('j_pelm')>=0&&run.n%3===0){o.x*=2;o.tr.push(['🥟','Пельмень ×2']);}
if(dk.indexOf('j_karam')>=0&&e.leg0){o.x*=2;o.tr.push(['🍬','Карамелька ×2']);}
if(dk.indexOf('j_suhar')>=0&&e.w>=1){o.c+=100;o.tr.push(['🥨','Сухарь +100']);}
if(dk.indexOf('j_nosok')>=0&&e.small){o.zero=true;o.tr=[['🧦','Васька не подходит: 0']];}
return o;}
function lostPts(run,e){if((run.dk||[]).indexOf('j_nosok')<0||!e)return 0;try{return BOX.base(e);}catch(x){return 0;}}
function endX(run){var ee=E(),xs=[];if(run.cid&&CBY[run.cid])xs.push([CBY[run.cid].ic,'Условие дня',ee.condX]);if(run.dx)xs.push(run.dx>1?['🎲','Вдвое!',run.dx]:['🐈','Половина Ваське',run.dx]);return xs;}
function rivalNew(R){return{p:0,kg:0,R:R,said:0,cast:0};}
function rivalCast(rv,R){rv.cast++;var u=(R||rv.R)();if(u<E().rv){rv.p++;rv.kg+=.2+(R||rv.R)()*1.1;return true;}return false;}
function rivalSay(rv,me){var ee=E();if(rv.cast-rv.said<ee.sayEvery)return'';rv.said=rv.cast;if(rv.cast>=3&&rv.R()<.25)return'run.rv.lie';return rv.p>me?'run.rv.ahead':rv.p<me?'run.rv.behind':'run.rv.tie';}
function rivalEnd(rv,me){return me>rv.p?'run.rv.win':me<rv.p?'run.rv.lose':'run.rv.draw';}
function lieW(rv){var l=E().lie;return Math.round(rv.kg*(l[0]+(l[1]-l[0])*rv.R())*10)/10||1.5;}
function betOk(st,dk,coins){var e=E();return st.bd!==dk&&coins>=e.bet;}
function betWon(fishId,caught){for(var i=0;i<caught.length;i++)if(caught[i].id===fishId&&!caught[i].lost)return true;return false;}
function dblRes(last){var e=E();return last&&last.id&&!last.lost&&!last.miss&&!last.junk?e.dblWin:e.dblLose;}
function chestTier(score){var t=E().chest,k=0;for(var i=0;i<t.length;i++)if(score>=t[i])k=i+1;return k;}
function chestItems(tier,x){if(tier<1)return[];var e=E(),R=x.R,out=[];var bs=['maggot','dough','blood','corn','live'].filter(function(b){return!x.works||x.works(b);});var b=bs.length?bs[Math.floor(R()*bs.length)]:'maggot';out.push({t:'bait',id:b,n:e.chestBait[tier-1]});var its=x.its||[];if(its.length)out.push({t:'it',id:its[Math.floor(R()*its.length)]});var ps=x.parts||[];if(ps.length)out.push({t:'part',id:ps[tier>=3?0:Math.floor(R()*Math.min(ps.length,3))]});else out.push({t:'coins',n:10*tier});return out;}
function fix(o){o=o&&typeof o==='object'?o:{};o.v=VER;['d','n','w','bd','bw','cd','cn','rec','t'].forEach(function(k){o[k]=Math.max(0,Math.floor(num(o[k])));});var e=E(),dk=Array.isArray(o.dk)?o.dk.filter(function(id){return typeof id==='string'&&!!CARDS[id];}):[];var j=0;dk=dk.filter(function(id){if(!isJ(id))return true;j++;return j<=e.jokMax;});dk=dk.filter(function(id,i){return!isJ(id)||dk.indexOf(id)===i;}).slice(0,e.deckMax);if(dk.length<e.deckMin)dk=deckNew();o.dk=dk;o.it=typeof o.it==='string'&&o.it.length<=12?o.it:'';return o;}
function merge(a,b){a=fix(a);b=fix(b);if(b.t>a.t){a.dk=b.dk.slice();a.it=b.it;a.t=b.t;}
['n','w','bw','rec'].forEach(function(k){a[k]=Math.max(a[k],b[k]);});a.d=Math.max(a.d,b.d);a.bd=Math.max(a.bd,b.bd);if(b.cd>a.cd){a.cd=b.cd;a.cn=b.cn;}else if(b.cd===a.cd)a.cn=Math.max(a.cn,b.cn);return fix(a);}
return{VER:VER,DEF:DEF,E:E,CARDS:CARDS,BASE:BASE,isJ:isJ,jokN:jokN,deckNew:deckNew,shuffle:shuffle,pileNew:pileNew,draw:draw,peek:peek,offer:offer,add:add,drop:drop,ZN:ZN,topFish:topFish,zonesOf:zonesOf,trail:trail,pathDef:pathDef,mitGift:mitGift,COND:COND,CBY:CBY,cond:cond,fishMod:fishMod,lostPts:lostPts,endX:endX,rivalNew:rivalNew,rivalCast:rivalCast,rivalSay:rivalSay,rivalEnd:rivalEnd,lieW:lieW,betOk:betOk,betWon:betWon,dblRes:dblRes,chestTier:chestTier,chestItems:chestItems,fix:fix,merge:merge,rng:rng,hash:hash};})();if(typeof window!=='undefined')window.RUN=RUN;