var ZOR=(function(){'use strict';const VER=1;function tx(p){return typeof L==='function'?L(p[0],p[1]):p[0];}
const Z={force:null};function on(){if(Z.force!=null)return!!Z.force;try{const q=typeof location!=='undefined'?location.search||'':'';if(/[?&]off=([^&#]*,)?r3(,|&|#|$)/.test(q))return false;if(typeof R3!=='undefined'&&R3&&typeof R3.off==='function')return!R3.off('zorka');if(/[?&]r3z=1/.test(q))return true;}catch(e){}
return false;}
function onFor(g){return on()&&!(g&&(g.tourn||g.cup||g.guest||g.demo||g.day));}
const ZC={legs:4,legsNew:3,cpl:3,cplNew:2,newDays:3,stepT:4};function zNew(ctx,goal,R){const n0=(ctx.d0||0)<1;return{v:VER,pi:ctx.pi,ctx,goal:goal||null,legs:n0?ZC.legsNew:ZC.legs,cpl:n0?ZC.cplNew:ZC.cpl,leg:-1,cast:0,spot:null,signs:[],got:[],lost:0,net:0,who:{n:0,ok:0},hit:0,t:0,R:R||rng(((ctx.dn||1)*131+ctx.pi*17)>>>0)};}
function zSpots(s){const P=PLACES[s.pi],R=s.R,out=[{k:'open',x:.25,d:Math.round(TACKLE.rod.dist[(s.ctx.tk||{rod:0}).rod]*.6)}];for(const z of(P.pz||[]))out.push({k:z.k,x:z.x,d:z.d});for(const sp of out)sp.sign=signsAt(s.pi,sp.k,s.ctx,R);return out;}
function zLeg(s,sp){if(s.leg+1>=s.legs)return-1;s.leg++;s.cast=0;s.spot=sp;s.t+=ZC.stepT;return s.leg;}
function zCast(s,r){s.cast++;if(r&&r.kind==='fish'){s.got.push({id:r.f.id,w:r.w,leg:s.leg,v:r.v||''});if(s.goal&&goalHit(s.goal,r.f))s.hit++;}
if(r&&r.kind==='off')s.lost++;return s.cast>=s.cpl;}
function zLast(s){return s.leg>=s.legs-1&&s.cast>=s.cpl;}
function zEnd(s){let kg=0,best=null;for(const c of s.got){kg+=c.w;if(!best||c.w>best.w)best=c;}
return{pi:s.pi,legs:s.leg+1,n:s.got.length,kg:Math.round(kg*1000)/1000,best,goal:s.goal&&s.goal.id,hit:s.hit,lost:s.lost,net:s.net,who:s.who};}
const SIGN={gull:{ic:'🐦',n:['Чайки бьют малька','Gulls diving on fry'],h:['Хищник гоняет малька поверху','A predator is chasing fry up top']},boil:{ic:'🌀',n:['Бурун у коряги','A swirl by the snag'],h:['Хищник стоит в засаде','A predator lies in ambush']},bub:{ic:'💭',n:['Пузыри со дна','Bubbles from the bottom'],h:['Кормится у дна — крупная мирная','Bottom feeders at work']},ring:{ic:'⭕',n:['Круги и всплески','Rings and splashes'],h:['Стайка мелочи у поверхности','A school of small fish']},quiet:{ic:'🤫',n:['Тишина','All quiet'],h:['Ни шороха. Или пусто, или кто-то большой затаился','Not a ripple. Empty — or something big lurking']},leg:{ic:'🌊',n:['Тень под водой','A shadow below'],h:['Что-то огромное прошло у дна…','Something huge passed along the bottom…']}};const SIGN_K=1.6,SIGN_W=.75;const SIGN_OV={zhereh:'gull',chehon:'gull',okun:'boil',shuka:'boil',sudak:'boil',som:'boil',nalim:'boil'};function isPred(f){return((f.b.spoon||0)+(f.b.live||0))>=1.5;}
function signOf(f){if(SIGN_OV[f.id])return SIGN_OV[f.id];const a=f.a2,top=a?a.d.top:1,bot=a?a.d.bot:1;if(isPred(f))return(top>=1.6||f.st==='jump')?'gull':'boil';if(bot>=1.6&&f.w[1]>=1)return'bub';return'ring';}
function act(f,pi,z,c){const o={z:z,mo:c.mo,px:c.px};let x=f.r*(f.t&&f.t[c.tod]!=null?f.t[c.tod]:1)*a2Mul(f,o,c.tod,c.wx);const pf=PLACES[pi].pfx;if(pf&&pf[f.id]!=null)x*=pf[f.id];return x;}
function zoneKinds(pi,z,c){const by={},ids={};let tot=0;for(const id of PLACES[pi].fish){const f=FISH[id],x=act(f,pi,z,c),k=signOf(f);by[k]=(by[k]||0)+x;(ids[k]=ids[k]||[]).push(id);tot+=x;}
return{by,ids,tot};}
function signsAt(pi,z,c,R){const Z=zoneKinds(pi,z,c);if(Z.tot<=0)return{k:'quiet',s:0,ids:[]};const all={};let at=0;for(const zz of['open'].concat(PZ[pi]?PZ[pi].map(q=>q.k):[])){const q=zoneKinds(pi,zz,c);for(const k in q.by){all[k]=(all[k]||0)+q.by[k];at+=q.by[k];}}
let best='quiet',bv=0,lift='',lv=1.15;for(const k in Z.by){const sh=Z.by[k]/Z.tot;if(sh>bv){bv=sh;best=k;}const r=at>0&&all[k]>0?sh/(all[k]/at):0;if(sh>=.15&&r>lv){lv=r;lift=k;}}
if(lift){best=lift;bv=Z.by[lift]/Z.tot;}
if(!R||R()>clamp(bv*1.3+(lift?.25:0),.2,.95))return{k:'quiet',s:0,ids:[]};return{k:best,s:Math.round(bv*100)/100,ids:Z.ids[best]};}
function signMul(f,sign){return sign&&sign.k!=='quiet'&&sign.k!=='leg'&&signOf(f)===sign.k?SIGN_K:1;}
const G_RAR={uncommon:1,rare:2,trophy:3};function goals(pi,c){const P=PLACES[pi],out=[{id:'any',k:'any',n:['Любая рыба','Any fish']}];const fs=P.fish.map(id=>FISH[id]).filter(f=>G_RAR[f.rar]).sort((a,b)=>G_RAR[b.rar]-G_RAR[a.rar]||a.r-b.r);const nw=(c.d0||0)<ZC.newDays;for(const f of nw?fs.filter(f=>f.rar==='uncommon').slice(0,1):fs.slice(0,4))out.push({id:f.id,k:'fish',n:[f.n,f.en||f.n],rar:f.rar});if(!nw&&P.leg&&LEG[P.leg])out.push({id:P.leg,k:'leg',n:[LEG[P.leg].n,LEG[P.leg].en||LEG[P.leg].n],rar:'legend'});return out;}
function goalHit(g,f){return!!g&&(g.k==='any'||g.id===f.id);}
function bestBait(f){let b='worm',v=0;for(const k in f.b)if(f.b[k]>v){v=f.b[k];b=k;}return b;}
const CL_T={z:{weed:['Любит траву — ищи у травы','Likes weeds — look by the weed bed'],pit:['Стоит в яме, на глубине','Holds in the deep hole'],snag:['Прячется в коряжнике','Hides among the snags'],edge:['Ходит по бровке','Patrols the drop-off'],open:['Гуляет по чистой воде','Roams open water']},d:{top:['Берёт поверху','Takes near the top'],mid:['Держится в полводы','Stays mid-water'],bot:['Берёт у самого дна','Takes right on the bottom']},t:{morning:['Её время — утро','Her time is morning'],day:['Клюёт и днём','Bites in the daytime too'],evening:['Выходит под вечер','Comes out at dusk'],night:['Ночная рыба — затемно','A night fish — come after dark']},b:{worm:['Червя не побрезгует','Won\'t say no to a worm'],maggot:['Опарыш ей по вкусу','Fond of maggots'],dough:['На тесто идёт','Goes for dough'],blood:['Мотыля любит','Loves bloodworm'],corn:['Кукурузу уважает','Respects sweet corn'],live:['Живца берёт — хищница','A predator — takes live bait'],spoon:['На блесну кидается','Strikes at a spoon']},p:{rise:['Берёт, когда давление растёт','Bites when pressure rises'],high:['Любит высокое давление','Likes high pressure'],fall:['Оживает, когда давление падает','Wakes up when pressure falls'],low:['Берёт на низком давлении','Bites at low pressure']},n:{shake:['Клюёт мелкой дрожью','Bites with a tiny shake'],dip:['Топит поплавок коротко','Dips the float briefly'],lift:['Поднимает поплавок','Lifts the float'],lay:['Кладёт поплавок набок','Lays the float flat'],drag:['Тащит поплавок в сторону','Drags the float away'],dive:['Утапливает резко','Pulls it under fast'],dance:['Пляшет поплавком','Makes the float dance']},w:{sun:['В ясную погоду бойчее','Livelier when sunny'],cloud:['Любит пасмурно','Likes it overcast'],rain:['В дождик оживает','Wakes up in the rain'],wind:['В ветер выходит к бровке','Wind brings her out'],fog:['В туман смелеет','Bolder in fog']}};function facts(f){const out=[];const b=typeof a2Best==='function'?a2Best(f):null;if(f.leg){out.push({k:'b',v:f.bait});for(const t of f.tod||[])out.push({k:'t',v:t});return out;}
if(b){if(b.z[0])out.push({k:'z',v:b.z[0]});if(b.d[0])out.push({k:'d',v:b.d[0]});if(b.t[0])out.push({k:'t',v:b.t[0]});}
out.push({k:'b',v:bestBait(f)});if(f.a2){let w='',m=0;for(const k in f.a2.w)if(f.a2.w[k]>m){m=f.a2.w[k];w=k;}if(m>=1.6)out.push({k:'w',v:w});let p='',pm=0;for(const k in f.a2.p)if(f.a2.p[k]>pm){pm=f.a2.p[k];p=k;}if(pm>=1.6)out.push({k:'p',v:p});}
if(f.bite)out.push({k:'n',v:f.bite});return out;}
function clueKey(c){return c.k==='b'?'':c.k==='n'?'hunt.b.'+c.v:'hunt.'+c.k+'.'+(c.k==='z'&&c.v==='weed'?'grass':c.v);}
function clues(id,n,R,skip){const f=FISH[id]||LEG[id];if(!f)return[];const all=facts(f).filter(c=>!skip||skip.indexOf(c.k+':'+c.v)<0),out=[];while(out.length<n&&all.length){const i=Math.floor((R?R():0)*all.length);const c=all.splice(i,1)[0];c.t=(CL_T[c.k]||{})[c.v]||['',''];out.push(c);}
return out;}
function clueN(c,bought){return((c.d0||0)<ZC.newDays?2:1)+(bought||0);}
function goalShare(g,pi,bait,c,o,sign){if(!g||g.k==='any')return 1;const P=PLACES[pi];if(g.k==='leg'){const L=LEG[g.id];return L&&bait===L.bait&&L.tod.indexOf(c.tod)>=0?1/30:0;}
const ws=fishW(pi,bait,c.tod,c.wx,.8,o);let tot=0,me=0;P.fish.forEach((id,i)=>{const x=ws[i]*signMul(FISH[id],sign);tot+=x;if(id===g.id)me=x;});return tot>0?me/tot:0;}
function warm(a,b){return b>a*1.25+.01?1:b<a*.8-.01?-1:0;}
const WAY={float:{ic:'🎣',n:['Поплавок','Float']},led:{ic:'🔔',n:['Донка','Ledger']},otv:{ic:'⚓',n:['Отвес','Drop line']},spin:{ic:'🌀',n:['Спиннинг','Spinning']},mormy:{ic:'❄',n:['Мормышка','Ice jig']},zherl:{ic:'🚩',n:['Жерлицы','Tip-ups']}};function ways(pi,own,ice){const P=PLACES[pi],o=own||{},out=['float'];if(ice){out.push('mormy');if(P.fish.some(id=>(FISH[id].b.live||0)>=1.5))out.push('zherl');return out;}
if(LED_AT[pi]&&(P.boat?o.otv:o.led))out.push(P.boat?'otv':'led');if(o.spin&&P.fish.some(id=>(FISH[id].b.spoon||0)>0))out.push('spin');return out;}
const SPIN_ST={even:['Ровно','Steady'],pause:['Ровно с паузами','Stop-and-go'],step:['Ступенькой по дну','Bottom hopping'],twitch:['Рывками','Twitching'],fast:['Быстро поверху','Fast and high']};function spinStyle(s){if(!s)return'';if(s.tw>=3)return'twitch';if(s.bt>=2&&s.tw<2)return'step';if(s.hf>.9&&s.dep<.3)return'fast';if(s.hf>.88)return'even';if(s.hf>.45&&s.tw<2&&s.dep<.75)return'pause';return'';}
function spinSum(pts,taps,bots,t,win){win=win||2.5;const h=pts.filter(p=>p.t>t-win);if(h.length<10)return null;let hf=0,dep=0;for(const p of h){if(p.h)hf++;dep+=p.y;}
return{hf:hf/h.length,dep:dep/h.length,tw:taps.filter(x=>x>t-win).length,bt:bots.filter(x=>x>t-win*1.6).length};}
const SPIN_OV={shuka:'pause',sudak:'step',okun:'twitch',zhereh:'fast',chehon:'fast',golavl:'even',som:'step',nalim:'step'};function spinPref(f){if(SPIN_OV[f.id])return SPIN_OV[f.id];if(f.st==='jump')return'fast';if(f.st==='deep')return'step';if(f.st==='dart')return f.w[1]<2?'twitch':'pause';return'even';}
const SPIN_DP={even:'mid',pause:'mid',step:'bot',twitch:'mid',fast:'top'};function spinMul(f,sty){if(!sty)return.3;const p=spinPref(f);return p===sty?3:(p==='pause'&&sty==='even'||p==='even'&&sty==='pause')?0.6:.1;}
function huntNew(pi,c,o,bait,pref,R){const ws=fishW(pi,bait,c.tod,c.wx,.8,o||{z:'open',mo:c.mo,px:c.px}),P=PLACES[pi],cand=[];let mx=0;P.fish.forEach((id,i)=>{if(ws[i]>0){cand.push({id,w:ws[i],it:0});mx=Math.max(mx,ws[i]);}});for(const x of cand)x.w=x.w/mx;return{pi,c,o,R,bait,pref,cand,sty:'',strike:null,t:0};}
function huntTick(st,sty,dt,win){st.t+=dt;st.sty=sty;let best=null;for(const x of st.cand){const m=sty?(st.pref(FISH[x.id])===sty?1:.15):0;x.it=clamp(x.it+(m>0?dt*.42*m*(.5+.5*x.w):-dt*.25),0,1);if(!best||x.it>best.it)best=x;}
if(best&&best.it>=1&&!st.strike)st.strike={id:best.id,win:win};return{best:best&&best.it>.08?best.id:'',it:best?best.it:0,sty,strike:st.strike};}
function huntCatch(st){if(!st.strike)return null;const f=FISH[st.strike.id],df=.8,big=st.bait==='spoon'||st.bait==='live'?.35:0,e=Math.max(.8,2.5-.9*df-big+szK(st.o||{})),w=f.w[0]+(f.w[1]-f.w[0])*Math.pow(st.R(),e);return{f,w:Math.max(.005,Math.round(w*1000)/1000)};}
function spinNew(pi,c,o,R){return huntNew(pi,c,o,'spoon',spinPref,R);}
function spinTick(st,sum,dt){return huntTick(st,spinStyle(sum),dt,.75);}
function spinCatch(st){return huntCatch(st);}
const MORM_ST={shiver:['Частая дрожь у дна','Fast shiver at the bottom'],tap:['Редкие тычки с паузами','Slow taps with pauses'],lift:['Медленный подъём','Slow lift'],hang:['Стоит на месте','Dead still']};function mormStyle(s){if(!s)return'';if(s.f>=3&&s.ht<.3)return'shiver';if(s.hf>.35&&s.f<1&&s.ht<.5)return'lift';if(s.f>=.8&&s.f<=2.4&&s.ht>.15&&s.ht<.6)return'tap';if(s.f<.5&&s.hf<.2)return'hang';return'';}
const MORM_OV={okun:'shiver',ersh:'shiver',ryapushka:'tap',plotva:'tap',lesh:'lift',gustera:'lift'};function mormPref(f){if(MORM_OV[f.id])return MORM_OV[f.id];const b=f.bite;return b==='shake'||b==='dance'?'shiver':b==='lay'||b==='lift'?'lift':b==='dip'?'tap':f.st==='deep'?'lift':'hang';}
function mormNod(f){const p=mormPref(f);return p==='lift'?'up':p==='tap'?'down':'stop';}
function mormSum(pts,taps,t,win){win=win||2;const h=pts.filter(p=>p.t>t-win);if(h.length<10)return null;let hf=0,ht=0;for(const p of h){if(p.h)hf++;ht+=p.y;}
return{f:taps.filter(x=>x>t-win).length/win,hf:hf/h.length,ht:ht/h.length};}
function mormNew(pi,c,o,R){return huntNew(pi,c,o,'blood',mormPref,R);}
function mormTick(st,sum,dt){return huntTick(st,mormStyle(sum),dt,.8);}
function mormCatch(st){return huntCatch(st);}
function mormMul(f,sty){return!sty?0.2:mormPref(f)===sty?3:.12;}
const ZH_MAX=3,ZH_P=.004,ZH_T=6;function zherlNew(pi,c,spots){return{pi,c,fl:(spots||[]).slice(0,ZH_MAX).map(sp=>({k:sp.k,up:false,t:0}))};}
function zherlTick(st,dt,R){const P=PLACES[st.pi],c=st.c;for(let i=0;i<st.fl.length;i++){const fl=st.fl[i];if(fl.up)continue;fl.t+=dt;const o={z:fl.k,dp:'bot',mo:c.mo,px:c.px},ws=fishW(st.pi,'live',c.tod,c.wx,.8,o);let tot=0;for(const x of ws)tot+=x;if(tot>0&&R()<dt*ZH_P*clamp(tot/ZH_T,.3,2.5)){let u=R()*tot,k=0;for(;k<ws.length-1;k++){u-=ws[k];if(u<0)break;}
const f=FISH[P.fish[k]],w=f.w[0]+(f.w[1]-f.w[0])*Math.pow(R(),Math.max(.8,1.4+szK(o)));fl.up=true;return{i,f,w:Math.round(w*1000)/1000};}}
return null;}
function echo(pi,z,c){const out={top:[0,0],mid:[0,0],bot:[0,0]};let tot=0;for(const id of PLACES[pi].fish){const f=FISH[id],a=act(f,pi,z,c);tot+=a;if(!f.a2)continue;let md='mid',mv=0;for(const d in f.a2.d)if(f.a2.d[d]>mv){mv=f.a2.d[d];md=d;}
out[md][0]+=a;out[md][1]=Math.max(out[md][1],f.w[1]>5?3:f.w[1]>1.5?2:1);}
return['top','mid','bot'].map(d=>({d,n:tot>0?Math.min(3,Math.round(out[d][0]/tot*4)):0,s:out[d][1]}));}
const FK={jump:.8,side:.9,deep:.5,deepHold:1.3,gr:.35,troph:.05,weakP:.12,weakHk:.45,luckP:.1,luckT:.6,legK:1.5,calmK:.5,pumpGain:.7,pumpMin:.25,pumpMax:1.6};const FS0=fightStep;function fNew(f,w,dist,tk,calm,R,easy,o){return attach(a2Fight(fightNew(f,w,dist,tk,calm,R,easy),o),f,w,calm,R);}
function attach(ft,f,w,calm,R){const tr=!!(f.leg||w>=trophyW(f));const weak=tr&&!ft.small&&R()<FK.weakP*(calm?FK.calmK:1);const luck=tr&&!ft.small&&R()<FK.luckP*(calm?FK.calmK:1)*(f.leg?FK.legK:1)?2+R()*8:0;ft.zk={hk:weak?FK.weakHk:1,weak,luck,lk:0,ev:'',pre:'',age:0,dir:0,hT:0,rT:0,pumps:0,troph:tr,calm:!!calm,why:''};return ft;}
function fStep(ft,f,inp,dt,R,tk){if(ft.res)return ft.res;const z=ft.zk,hold=!!inp.hold;const wasR=ft.rush>0,res=FS0(ft,f,hold,dt,R,tk);if(res)return res;if(ft.small)return null;const K=(z.calm?FK.calmK:1)*(f.leg?FK.legK:1);if(f.st==='dart'&&ft.warn&&!z.pre&&!z.ev){z.pre='side';z.dir=R()<.5?-1:1;}
if(!wasR&&ft.rush>0){z.age=0;if(f.st==='jump'&&ft.jump>0)z.ev='jump';else if(f.st==='dart'){z.ev='side';if(!z.pre)z.dir=R()<.5?-1:1;}
else if(f.st==='deep')z.ev='down';z.pre='';}
if(z.ev){z.age+=dt;const g=z.age>FK.gr;if(z.ev==='jump'){if(hold&&g){z.hk-=dt*FK.jump*K;z.why='jump';}if(ft.jump<=0)z.ev='';}
else if(z.ev==='side'){const d=inp.dir||0,good=z.calm||d===-z.dir,bad=!good&&g&&(d===z.dir?1:hold?.6:0);if(bad){z.hk-=dt*FK.side*K*bad;z.why='side';ft.D+=dt*.5*bad;}else if(good)ft.D=Math.max(0,ft.D-dt*.3);if(ft.rush<=0)z.ev='';}
else if(z.ev==='down'){if(hold){z.hT+=dt;if(z.hT>FK.deepHold){z.hk-=dt*FK.deep*K;z.why='deep';}}else z.hT=0;if(ft.rush<=0)z.ev='';}}
if(f.st==='deep'){if(!hold)z.rT+=dt;else{if(z.rT>=FK.pumpMin&&z.rT<=FK.pumpMax){ft.D=Math.max(0,ft.D-FK.pumpGain);z.pumps++;}z.rT=0;}}
if(z.troph)z.hk-=dt*FK.troph*K*(ft.rush>0?1:.3)*ft.T;if(z.luck&&ft.t>=z.luck){if(ft.T>FK.luckT||z.lk>=2){z.hk=0;z.why='luck';}else{z.lk++;z.luck+=2;}}
if(z.hk<=0){ft.res='off';if(!z.why)z.why='luck';}
return ft.res;}
function fCue(ft){return ft&&ft.zk&&(ft.zk.ev||ft.zk.pre)||'';}
function netOk(s,f,w,why){return!!s&&s.net<1&&!!(f.leg||w>=trophyW(f))&&(why==='off'||why==='break'||why==='gone'||why==='slack');}
function netUse(s){if(s)s.net++;}
const WHO_T={jump:['Свечки над водой!','Leaping clear of the water!'],dart:['Рывки в сторону','Darting sideways'],deep:['Упёрлась и ушла на дно','Bulldogging to the bottom'],calm:['Тянет ровно, без фокусов','A steady, honest pull']};function whoSig(f,w){return{st:f.st,t:WHO_T[f.st]||WHO_T.calm,hv:w>=trophyW(f)?3:w>=.6?2:1};}
function whoOpts(f,pi,R){const P=PLACES[pi],pool=P.fish.filter(id=>id!==f.id);const sc=id=>{const g=FISH[id];return(g.st===f.st?0:2)+Math.abs(Math.log((g.w[0]+g.w[1])/(f.w[0]+f.w[1])))+(R?R()*.8:0);};const out=pool.sort((a,b)=>sc(a)-sc(b)).slice(0,2);out.push(f.id);for(let i=out.length-1;i>0;i--){const j=Math.floor((R?R():0)*(i+1));const t=out[i];out[i]=out[j];out[j]=t;}return out;}
function whoAns(s,f,id){const ok=id===f.id;if(s){s.who.n++;if(ok)s.who.ok++;}return ok;}
const VAR={gold:{p:1/300,k:3,ic:'✨',n:['Золотая','Golden']},alb:{p:1/700,k:2.5,ic:'🤍',n:['Альбинос','Albino']},tag:{p:1/180,k:1.5,ic:'🏷',n:['Меченая','Tagged']}};function variety(f,R){if(!f||f.leg||f.rel||f.fest||f.rar==='tsar'||f.rar==='rb')return'';const u=R();let a=0;for(const k in VAR){a+=VAR[k].p;if(u<a)return k;}return'';}
const LEG_N=3,LEG_EV_P=.45;function lgOf(st,pi){st.lg=st.lg||{};return st.lg[pi]=st.lg[pi]||{n:0,d:0,c:0};}
function legTrace(st,pi,c,bait,df){const P=PLACES[pi],Lg=P.leg&&LEG[P.leg];if(!Lg||!st)return false;const g=lgOf(st,pi);if(g.d===c.dn||g.n>=LEG_N||bait!==Lg.bait||Lg.tod.indexOf(c.tod)<0||df<=.55)return false;g.n++;g.d=c.dn;return true;}
function legAdd(st,pi,n){const g=lgOf(st,pi);g.n=Math.min(LEG_N,g.n+(n||1));}
function legReady(st,pi){const P=PLACES[pi];return!!(st&&P.leg&&LEG[P.leg]&&lgOf(st,pi).n>=LEG_N);}
function legHot(st,pi,c){const P=PLACES[pi];return legReady(st,pi)&&LEG[P.leg].tod.indexOf(c.tod)>=0;}
function legCaught(st,pi){const g=lgOf(st,pi);g.n=0;g.c++;}
function legSpot(spots){let b=null;for(const sp of spots)if(!b||sp.k==='pit'&&b.k!=='pit'||sp.k===b.k&&sp.d>b.d||b.k!=='pit'&&sp.d>b.d)b=sp;if(b)b.sign={k:'leg',s:1,ids:[]};return b;}
const ZH_K=2.5;function pick(pi,bait,tod,wx,df,R,o,zx){if(!zx)return pickFish(pi,bait,tod,wx,df,R,o);const P=PLACES[pi];if(zx.leg&&zx.sign&&zx.sign.k==='leg'){const Lg=LEG[P.leg];if(Lg&&bait===Lg.bait&&Lg.tod.indexOf(tod)>=0&&R()<LEG_EV_P)return{f:Lg,w:Math.round((Lg.w[0]+(Lg.w[1]-Lg.w[0])*R())*1000)/1000,ev:'leg'};}
if(o&&o.tsar&&P.tsar){const T=LEG[P.tsar];if(bait===T.bait&&T.tod.indexOf(tod)>=0&&df>.55&&R()<(T.p||1/8))return{f:T,w:Math.round((T.w[0]+(T.w[1]-T.w[0])*R())*1000)/1000};}
const Lg=LEG[P.leg];if(Lg&&bait===Lg.bait&&Lg.tod.indexOf(tod)>=0&&df>.55&&R()<1/30)return{f:Lg,w:Math.round((Lg.w[0]+(Lg.w[1]-Lg.w[0])*R())*1000)/1000};if(o&&P.evf&&P.evf.length&&typeof evPick==='function'){const e=evPick(pi,bait,tod,R);if(e)return e;}
let tot=0;const ws=fishW(pi,bait,tod,wx,df,o);for(let i=0;i<ws.length;i++){const f=FISH[P.fish[i]];let m=signMul(f,zx.sign);if(zx.sty)m*=spinMul(f,zx.sty);if(zx.msty)m*=mormMul(f,zx.msty);if(zx.zh&&f.id===zx.zh)m*=zx.zhK||ZH_K;ws[i]*=m;tot+=ws[i];}
if(tot<=0)return null;if(R()<(o&&o.z==='snag'?JUNK_P*3:JUNK_P)&&bait!=='spoon'){const ks=Object.keys(JUNK);return{junk:ks[Math.floor(R()*ks.length)]};}
let u=R()*tot,k=0;for(;k<ws.length-1;k++){u-=ws[k];if(u<0)break;}
const f=FISH[P.fish[k]],big=bait==='live'||bait==='corn'||bait==='spoon'?0.35:0;const e=o?Math.max(.8,2.5-.9*df-big+szK(o)):Math.max(1.1,2.5-.9*df-big),w=f.w[0]+(f.w[1]-f.w[0])*Math.pow(R(),e);return{f,w:Math.max(.005,Math.round(w*1000)/1000)};}
function waitMul(zx){return zx&&zx.sign&&zx.sign.k!=='quiet'?SIGN_W:1;}
function fixZ(x){x=x&&typeof x==='object'?x:{};x.v=VER;if(!x.lg||typeof x.lg!=='object')x.lg={};for(const k in x.lg){const g=x.lg[k];if(!g||typeof g!=='object'){delete x.lg[k];continue;}g.n=clamp(+g.n||0,0,LEG_N);g.d=+g.d||0;g.c=+g.c||0;}
x.wn=+x.wn||0;x.wk=Math.min(x.wn,+x.wk||0);x.gd=+x.gd||0;x.g=typeof x.g==='string'?x.g:'';x.gp=+x.gp||0;x.wy=x.wy==='spin'||x.wy==='mormy'?x.wy:'';if(!x.vr||typeof x.vr!=='object')x.vr={};return x;}
function mergeZ(a,b){a=fixZ(a);b=fixZ(b);const o=fixZ(JSON.parse(JSON.stringify(a)));for(const k in b.lg){const p=o.lg[k]||{n:0,d:0,c:0},q=b.lg[k];o.lg[k]={n:Math.max(p.n,q.n),d:Math.max(p.d,q.d),c:Math.max(p.c,q.c)};if(q.c>p.c)o.lg[k].n=q.n;}
o.wn=Math.max(a.wn,b.wn);o.wk=Math.max(a.wk,b.wk);if(b.gd>a.gd){o.gd=b.gd;o.g=b.g;}
for(const id in b.vr){o.vr[id]=o.vr[id]||{};for(const k in b.vr[id])o.vr[id][k]=Math.max(o.vr[id][k]||0,b.vr[id][k]||0);}
return o;}
return{VER,Z,ZC,on,onFor,tx,zNew,zSpots,zLeg,zCast,zLast,zEnd,SIGN,SIGN_K,signOf,signsAt,signMul,act,isPred,goals,goalHit,bestBait,clues,clueKey,clueN,facts,goalShare,warm,CL_T,WAY,ways,SPIN_ST,spinStyle,spinSum,spinPref,spinMul,spinNew,spinTick,spinCatch,SPIN_DP,MORM_ST,mormStyle,mormPref,mormNod,mormMul,mormSum,mormNew,mormTick,mormCatch,huntNew,huntTick,huntCatch,zherlNew,zherlTick,echo,ZH_MAX,FK,fNew,attach,fStep,fCue,netOk,netUse,WHO_T,whoSig,whoOpts,whoAns,VAR,variety,LEG_N,LEG_EV_P,legTrace,legAdd,legReady,legHot,legCaught,legSpot,lgOf,pick,waitMul,fixZ,mergeZ};})();if(typeof window!=='undefined')window.ZOR=ZOR;