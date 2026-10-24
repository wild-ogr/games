/* b2-rival.js — RIVAL: соперники. ДОГОВОР B2.rivals (HOME CUP KRAI QUARRY MG STORY); примеры — release-b/M50-boost/logs/RIVAL.md.
 Без DOM, синхронно; поток выкл. — on:0, пусто, k()=1. Модель — b2-rival-x.js, вид — b2-rival-ui.js (B2.need; в jsc сразу).
 B2.rivals(W) → {on,st,firms:[Firm],mkt:[{c,t,me,rv:{id:доля}}],move,race:[{id,n,en,v,me}],local}
  Firm={id,n,en,who,whoe,col,ico,sg,sge,ch,pts:{город:{вид:1}},np,mood:'calm'|'war'|'sell'}; гл.2 — beav, гл.3+ — beav bear ryad.
  move={f,k:'open'|'price'|'poach'|'sell',c,t,end,opts:[{k:'promo'|'cut'|'pay'|'buy'|'none',cost,gain}]}; race — «Гонка 11 Б».
 .firm(id) | .k(W,b) спрос ×0,85…1 | .street(W,c,max) вывески Улицы | .bots('cup',{W,wk})→pct | .bots('mg',{g,best,lo})→v
 .tender(W,'opi'|'build')→{f,agg} | .local(kid[,cfg]); край — бот 'loc' (W.bots) | .beat(W)→{me,them,ok} | .log(W) | шина B2.emit('rival',k).
 Мир W.b2.rival {sh:{'город.вид':{id:‰}},mv,nx,lg,md,loc,lc,cut,pn}; S.b2r. */
(function(){'use strict';
const E=typeof ECON!=='undefined'?ECON:null;
const F={beav:['Бобров и Ко','Beaver & Co','Борис Бобров','Boris Bobrov','#2e7d5b','🌲','У Бориса','Boris’s','friend'],
  bear:['Топтыгин Групп','Toptygin Group','Михаил Топтыгин','Mikhail Toptygin','#b03a2e','🐻','Топтыгин','Toptygin','big'],
  ryad:['Рядышком','Nearby','сеть «Рядышком»','the Nearby chain','#c0392b','🏪','Рядышком','Nearby','chain'],
  owl:['Сова Инвест','Owl Invest','Соня Совина','Sonya Sovina','#5b4b8a','🦉','','','friend'],
  bars:['Барсуков и сыновья','Barsukov & Sons','Пётр Барсуков','Pyotr Barsukov','#8e6b3a','🦡','','','friend'],
  vit:['ВитТранс','VitTrans','Витя Козлов','Vitya Kozlov','#d4802a','🐐','','','friend'],
  you:['Вы','You','Вы','You','#1565c0','⭐','','','me']};
const LOC={yak:['Алмаз-Север','Almaz-North','Семён Оленев','Semyon Olenev','#2b6cb0','🦌'],nor:['Таймыр-Металл','Taimyr Metal','Ирина Песцова','Irina Pestsova','#546e7a','🦊'],
  sah:['Островной улов','Island Catch','Гена Нерпин','Gena Nerpin','#00838f','🐟'],alt:['Алтай-Дар','Altai Gift','Тимур Маралов','Timur Maralov','#6d8b2f','🦅']};
const MAIN=['beav','bear','ryad'];
function card(id,a,ch){return a?{id,n:a[0],en:a[1],who:a[2],whoe:a[3],col:a[4],ico:a[5],sg:a[6]||a[0],sge:a[7]||a[1],ch:ch||a[8]||'local'}:null;}
function firm(id){const b=id==='loc'&&E&&E.BOTS&&E.BOTS.find(x=>x.id==='loc');return card(id,F[id])||card(id,LOC[id],'local')||(b?card(id,[b.n,b.en,b.who,b.whoe,b.col,'⛰'],'local'):null);}
// местный соперник края — 5-й бот недр id 'loc' (KRAI: D.rival → E.BOTS, W.bots)
const lb=W=>W&&Array.isArray(W.bots)&&W.ned&&W.bots.find(b=>b.id==='loc');
const sn=(f,e)=>{const w=(e?f.whoe:f.who).split(' ');return f.id==='bear'?w[1]:w[0];};
const stI=W=>E&&E.stI&&W?E.stI(W):0;
const o=W=>W&&W.b2?(W.b2.rival||(W.b2.rival={})):{};
function race(W){try{if(!W||typeof STORY==='undefined'||!STORY.standings)return [];
  return STORY.standings(W).map(x=>{const f=firm(x.id)||{};return {id:x.id,n:f.who?sn(f):x.id,en:f.whoe?sn(f,1):x.id,v:x.v,me:x.id==='you'};});}catch(e){return [];}}
let ON=0;
const shMax=()=>B2.eco?B2.eco.k('rival.share_max',.15):.15;
function k(W,b){if(!ON||!b||!W||!W.b2||!W.b2.rival)return 1;const s=W.b2.rival.sh;const m=s&&s[b.c+'.'+b.t];if(!m)return 1;
  let x=0;for(const i in m)x+=m[i];return 1-Math.min(shMax(),x/1000);}
function firmsOf(W){const st=stI(W);if(!ON||st<1)return [];const O=o(W),ids=st===1?['beav']:MAIN.slice();const L=lb(W)&&firm('loc');
  return ids.map(id=>{const f=firm(id),p={};let np=0;const sh=O.sh||{};for(const key in sh){if(sh[key][id]){const [c,t]=key.split('.');(p[c]||(p[c]={}))[t]=1;np++;}}
    f.pts=p;f.np=np;f.mood=(O.md&&O.md[id])||'calm';return f;}).concat(L?[Object.assign(L,{pts:{},np:0,mood:'calm'})]:[]);}
function mkt(W){if(!ON||!W||!W.biz)return [];const sh=o(W).sh||{},seen={},r=[];
  for(const b of W.biz){const key=b.c+'.'+b.t;if(seen[key])continue;seen[key]=1;const m=sh[key]||{},rv={};let x=0;for(const i in m){rv[i]=m[i]/1000;x+=rv[i];}
    r.push({c:b.c,t:b.t,me:Math.max(0,1-x),rv});}return r;}
function snap(W){return {on:ON,st:stI(W),firms:firmsOf(W),mkt:mkt(W),move:ON&&o(W).mv?Object.assign({opts:X()?X().opts(W):[]},o(W).mv):null,race:race(W),local:lb(W)?firm('loc'):null};}
function street(W,c,max){if(!ON||stI(W)<1)return [];max=max||4;const sh=o(W).sh||{},r=[];c=c||W.home||'kuz';
  const mine=new Set((W.biz||[]).filter(b=>b.c===c).map(b=>b.t));const keys=Object.keys(sh).filter(x=>x.split('.')[0]===c).sort((a,b)=>mine.has(b.split('.')[1])-mine.has(a.split('.')[1]));
  for(const key of keys)for(const id in sh[key]){if(r.length>=max)return r;const f=firm(id);r.push({id,t:key.split('.')[1],col:f.col,sg:f.sg,sge:f.sge,ico:f.ico});}
  if(!r.length&&stI(W)===1){const f=firm('beav');r.push({id:'beav',t:'kiosk',col:f.col,sg:f.sg,sge:f.sge,ico:f.ico});}return r;}
function hash(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
function bots(kind,a){a=a||{};
  if(kind==='cup'){const W=a.W,seed=(W&&W.seed||0)+'|'+(a.wk|0),st=stI(W);return MAIN.concat(lb(W)?['loc']:[]).map(id=>{const f=firm(id);
    const base={beav:3.5,bear:5,ryad:4}[id]||4;return {id,n:f.n,en:f.en,col:f.col,pct:Math.round((base*(.4+1.2*hash(seed+id)))*10)/10};});}
  if(kind==='mg'){const best=+a.best||0,lo=!!a.lo;return ['beav','owl','vit','bear'].map((id,i)=>{const f=firm(id),r=hash((a.g||'')+id+Math.round(best));
    const d=[.92,1.05,.8,1.15][i]*(.9+.2*r);const v=best>0?Math.max(1,Math.round(lo?best/d:best*d)):Math.round(10+30*r);return {id,n:sn(f),en:sn(f,1),col:f.col,v};});}
  return [];}
function tender(W,kind){const ids=kind==='build'?['beav','bear','ryad']:['beav','bear'];return ids.map(id=>{const f=firm(id);
  return {id,n:f.n,en:f.en,col:f.col,f:{beav:.6,bear:.75,ryad:.5}[id],agg:{beav:.5,bear:.8,ryad:.3}[id]};});}
function local(kid,cfg){if(cfg)LOC[kid]=[cfg.n,cfg.en,cfg.who,cfg.whoe,cfg.col,cfg.ico];return firm(kid);}
function beat(W){const b=lb(W),me=E&&E.equity?Math.round(E.equity(W)):0,them=b&&E.botValue?Math.round(E.botValue(W,b)):0;return {me,them,ok:!!b&&me>them};}
const X=()=>B2.rivalX;
const api=W=>snap(W);Object.assign(api,{firm,k,street,bots,tender,local,beat,log:W=>(ON&&o(W).lg)||[],FIRMS:F,LOCAL:LOC});
B2.rivals=api;
B2.off.rival=0;          // 1 — выключено по умолчанию
if(B2.off('rival'))return;
ON=1;
B2.mig('rival',(W,O)=>{if(!O.sh)O.sh={};if(!O.lg)O.lg=[];});
if(E){const p0=E.ptMod;if(p0)E.ptMod=function(W,b,m,nv){const r=p0(W,b,m,nv);if(W.b2&&W.b2.rival){r.d*=k(W,b);if(X())X().mod(W,b,m,r);}return r;};
  const c0=E.ownClose;if(c0)E.ownClose=function(W,M,off){c0(W,M,off);if(W.b2&&!W.ned&&stI(W)>=2){if(X())X().close(W,off);else ld();}};}
const U=()=>B2.rivalUI,ld=()=>{B2.need('b2-rival-x.js').then(()=>B2.need('b2-rival-ui.js')).catch(()=>{});};
if(B2.on)B2.on('ready',()=>{const W=typeof GAME!=='undefined'&&GAME.W;if(W&&stI(W)>=2)ld();});
B2.slot('today','rival',c=>U()?U().today(c.W):'',60);B2.slot('close','rival',c=>U()?U().close(c.W):'',40);B2.slot('riv','rival',c=>U()?U().riv(c.W):'',60);
const sr=()=>B2.s('r'),GW=()=>typeof GAME!=='undefined'&&GAME.W;
B2.vkm('rival',[{id:'rv_ans1',ok:()=>sr().a>=1},{id:'rv_ans5',ok:()=>sr().a>=5},{id:'rv_buy1',ok:()=>sr().buy>=1},
  {id:'rv_race1',ok:()=>{const W=GW();const r=W&&race(W);return !!(r&&r.length>2&&r[0].me);}},{id:'rv_beav',ok:()=>{const W=GW();return !!(W&&mkt(W).some(m=>(m.rv.beav||0)>0&&m.me>=.9));}}]);   /* b2-merge: VKT — rv_beat (дубль kr_rival) → rv_beav «Обойти «Бобров и Ко»»: в виде, где он есть, у вас ≥ 90 % */
B2.click('rival',(a,g,el)=>{if(U())U().click(a,g,el);});
})();
