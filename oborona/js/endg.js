'use strict';
/* ================= OB:ENDG — «куда тратить после кампании» (решение владельца 08.10, журнал release-i/oborona-boost/logs/ENDG.md) =================
   Беда: когда деревня отстроена, золоту на силу идти некуда — оно копится без смысла, а игрок как раз идёт на ⚔/🔥.
   1) «Мастерство» (за ЗОЛОТО): после прохождения ВСЕЙ кампании на Обычном (боссы всех земель) каждая строка кузницы (I/II/III — по заставам,
      чары и запасы, «на все заставы») и каждая боевая постройка деревни (I/II, Оружейная палата), докачанная до конца, растёт дальше бесконечными
      уровнями: маленький шаг (+1 % своего эффекта или равноценное), цена каждого следующего ×MST.g (старт — от цены последнего обычного уровня;
      звёзды кузницы считаем по MST.star золотых за ★). Хозяйственные постройки (Мытный двор, Амбар, Копь, Мельница) — нет: давали бы золото за золото (ферма).
   2) «Богатырские ступени» (за звёзды ⚔ Сложного и 🔥 Адского, S.dst): конечные ступени на все заставы. Звёзды кампании сюда не идут.
   Оба стока — только после всей кампании (Обычный не меняется вообще). Действуют в кампании, ⚔/🔥, осаде и испытании дня;
   НЕ действуют в Боссе недели и «Заставе дня» (их таблицы — честные: все в равных условиях с одной кузницей/деревней).
   Поля сохранения: S.mst {id: уровень}, S.bgs {k: ступень} — чинит FIX, облако — максимум (MERGE). */
const MST={g:1.15,star:2500,first:1.15,soft:0,f:1,bf:1};   // f, bf — общий множитель шага мастерства и ступеней (для подбора на стенде)   // g — рост цены; star — золотых за ★ строки кузницы; first — старт = цена последнего уровня × first; soft — после скольких уровней шаг вдвое меньше (0 — нет)
// виды шага: dmg — урон +1 %, rate — стреляют на 1 % чаще, rng — дальность +1 %, cost — цена застав −1 %, life — +1 жизнь, coin — +10 монет, scd — перезарядка чар −1 % (scdT — Гром, scdC — Кот)
const MST_KIND={dmg1:'dmg',dmg2:'dmg',dmg3:'dmg',sp:'dmg',sp2:'dmg',rng:'rng',gem:'rate',cheap:'cost'};
const MST_X={thunder:'scdT',cat:'scdC',lives:'life',coins:'coin',bul:'dmg',skor:'rate'};
const MST_V={fair:'coin',smith:'cost',range:'dmg',herb:'scd',wall:'life',dubl:'scd',arsn:'dmg'};
const MST_STEP={dmg:.5,rate:.5,rng:.5,cost:.5,life:.25,coin:5,scd:.5,scdT:1,scdC:1};   // жизнь — +1 за каждые 4 уровня (дробь не считается)
const MST_L=[];   // {id, t (застава или ''), kind, p0, own(), name(), ic}
function mstR(v){return v<2000?Math.round(v/10)*10:Math.round(v/50)*50;}
(function(){
  for(const t of TW_ORDER)for(const [k,c] of FORGE_ORDER[t])MST_L.push({id:'f.'+t+'.'+k,t,k,kind:MST_KIND[k]||'dmg',p0:mstR(MST.star*c*MST.first),own:()=>fHas(t,k),name:()=>{const f=forgeInfo(t,k);return f&&f.n||k;},ic:'ti_'+t+'_3'});
  for(const x of FORGE_EXTRA)if(MST_X[x.k])MST_L.push({id:'x.'+x.k,t:'',k:x.k,kind:MST_X[x.k],p0:mstR(MST.star*x.cost[x.cost.length-1]*MST.first),own:()=>forgeN(x.k)>=x.cost.length,name:()=>x.n,ic:x.ic});
  for(const b of BLD)if(MST_V[b.id])MST_L.push({id:'v.'+b.id,t:'',k:b.id,kind:MST_V[b.id],p0:mstR(b.cost[b.cost.length-1]*MST.first),own:()=>(S.village[b.id]||0)>=b.cost.length,name:()=>b.name,ic:b.ic,v:1});
})();
function mstOpen(){for(const c of CH_ORDER)if(!S.stars[c+'-5'])return false;return true;}   // вся кампания на Обычном (боссы всех земель; Логова не нужны)
// в этом бою действует? (вне боя — для показа — да)
function mstOn(){return mstOpen()&&!(typeof G!=='undefined'&&G&&(G.wk||G.dly));}
function mstN(id){const v=S.mst&&S.mst[id];return v>0?Math.floor(v):0;}
function mstPrice(L,n){if(n==null)n=mstN(L.id);return mstR(L.p0*Math.pow(MST.g,n));}
function mstEff(n){return MST.soft&&n>MST.soft?MST.soft+(n-MST.soft)/2:n;}   // уровни → «шагов»
// суммы шагов по видам: для заставы type (её строки + общие) — только у купленных до конца строк
function mstSum(kind,type){let n=0;for(const L of MST_L)if(L.kind===kind&&(!L.t||L.t===type)){const m=mstN(L.id);if(m&&L.own())n+=mstEff(m);}return n*MST_STEP[kind]*MST.f;}
/* ---------- богатырские ступени (за звёзды ⚔/🔥) ---------- */
const BGS=[
  {k:'sila',n:'Богатырская сила',ic:'ti_arch_3',kind:'dmg',step:1,cost:[15,20,25,30,40],d:'+1% урона всем заставам'},
  {k:'vyuch',n:'Богатырская выучка',ic:'ti_pushka_3',kind:'rate',step:1,cost:[20,25,30,40],d:'все заставы стреляют на 1% чаще'},
  {k:'dozor',n:'Богатырский дозор',ic:'ti_mag_3',kind:'rng',step:1,cost:[20,30,40],d:'+1% дальности всем заставам'}];
langReg(BGS,[{n:'Bogatyr Might',d:'+1% damage for all outposts'},{n:'Bogatyr Drill',d:'all outposts fire 1% more often'},{n:'Bogatyr Watch',d:'+1% range for all outposts'}]);
function bgsN(k){const v=S.bgs&&S.bgs[k];return v>0?Math.floor(v):0;}
function bgsStars(){return (typeof difStarsN==='function')?difStarsN('s')+difStarsN('h'):0;}
function bgsSpent(){let n=0;for(const b of BGS)for(let i=0;i<bgsN(b.k)&&i<b.cost.length;i++)n+=b.cost[i];return n;}
function bgsFree(){return Math.max(0,bgsStars()-bgsSpent());}
function bgsSum(kind){let n=0;for(const b of BGS)if(b.kind===kind)n+=b.step*Math.min(bgsN(b.k),b.cost.length);return n*(MST.bf||1);}
/* ---------- действие в бою ---------- */
function endgST(o,type){if(!o||!mstOn())return;
  const dm=1+.01*(mstSum('dmg',type)+bgsSum('dmg')),rt=1+.01*(mstSum('rate',type)+bgsSum('rate')),rg=1+.01*(mstSum('rng',type)+bgsSum('rng'));
  if(dm!==1){if(o.dmg!=null)o.dmg*=dm;if(o.dps!=null)o.dps*=dm;if(o.fire)o.fire*=dm;}
  if(rt!==1&&o.cd)o.cd/=rt;if(rg!==1&&o.rng)o.rng*=rg;}
function endgRUN(g){if(!g||!mstOn())return;const L=Math.floor(mstSum('life')+1e-9),C=Math.round(mstSum('coin'));if(L){g.lives+=L;g.maxLives+=L;}if(C)g.coins+=C;}
// цена застав и перезарядка чар — обёртки (крючков нет; game.js не трогаем)
{const cm0=costMul;costMul=function(type){const k=cm0(type);if(!mstOn())return k;const n=mstSum('cost',type);return n?k*Math.pow(.99,n):k;};}
{const sc0=spellCd;spellCd=function(k){const v=sc0(k);if(!mstOn())return v;const n=mstSum('scd')+mstSum(k==='thunder'?'scdT':'scdC');return n?v*Math.pow(.99,n):v;};}
// реклама «удвоить золото» нужна, пока золоту есть куда идти: после кампании — всегда (мастерство бесконечно)
{const gw0=goldWanted;goldWanted=function(){return gw0()||mstOpen();};}
/* ---------- сохранение ---------- */
function ENDG_FIX(s){s=s||S;for(const k of ['mst','bgs']){const v=s[k];if(!v||typeof v!=='object'||Array.isArray(v)){s[k]={};continue;}for(const q in v){const n=Math.floor(+v[q]);if(!(n>0))delete v[q];else v[q]=Math.min(n,999);}}}
function ENDG_MERGE(other,o){const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};for(const k of ['mst','bgs']){const a=Object.assign({},obj(o[k])),b=obj(other&&other[k]);for(const q in b)a[q]=Math.max(+a[q]||0,+b[q]||0);o[k]=a;}}
ENDG_FIX(S);
/* ---------- покупки ---------- */
function mstBuy(id){const L=MST_L.find(q=>q.id===id);if(!L||!mstOpen()||!L.own())return false;const n=mstN(id),c=mstPrice(L,n);if(S.gold<c)return false;
  S.gold-=c;S.mst[id]=n+1;try{STAT.ev('spend',{k:'m:'+id+'.'+(n+1),c:c});}catch(e){}save();return true;}
function bgsBuy(k){const b=BGS.find(q=>q.k===k);if(!b||!mstOpen())return false;const n=bgsN(k);if(n>=b.cost.length||bgsFree()<b.cost[n])return false;
  S.bgs[k]=n+1;try{STAT.ev('spend',{k:'bg:'+k+(n+1),c:b.cost[n],v:'dst'});}catch(e){}save();return true;}
function mstCheapest(){let best=null;for(const L of MST_L){if(!L.own())continue;const c=mstPrice(L);if(!best||c<best.c)best={L,c};}return best;}
/* ---------- тексты ---------- */
function mstKindTxt(kind,v){const p=dnum(String(Math.round(v*10)/10));return ({dmg:Lg('урон +'+p+'%','damage +'+p+'%'),rate:Lg('чаще на '+p+'%',p+'% faster'),rng:Lg('дальность +'+p+'%','range +'+p+'%'),
  cost:Lg('цена −'+p+'%','cost −'+p+'%'),life:v<1?Lg('+1 жизнь за 4 уровня','+1 life per 4 levels'):Lg('+'+Math.floor(v+1e-9)+' жизн.','+'+Math.floor(v+1e-9)+' lives'),coin:Lg('+'+p+' монет','+'+p+' coins'),scd:Lg('чары быстрее на '+p+'%','spells '+p+'% faster'),scdT:Lg('Гром быстрее на '+p+'%','Thunder '+p+'% faster'),scdC:Lg('Кот быстрее на '+p+'%','Bayun '+p+'% faster')})[kind];}
function mstWho(L){return L.t?TW[L.t].n:Lg('все заставы','all outposts');}
function mstBonusTxt(){const d=mstSum('dmg',''),r=mstSum('rate',''),o=[];if(d)o.push(mstKindTxt('dmg',d));if(r)o.push(mstKindTxt('rate',r));return o.join(', ');}
/* ---------- окно «Мастерство» (одно на всё; открывается из кузницы и деревни) ---------- */
const MSTO={};
function mstRowHTML(L){const n=mstN(L.id),own=L.own(),c=mstPrice(L,n),st=MST_STEP[L.kind];
  return '<div class="card mstr"><div class="row"><img class="ic" src="'+ic(L.ic,80)+'" alt=""'+(own?'':' style="filter:grayscale(1) opacity(.5)"')+'><div class="t"><b>'+L.name()+(n?' · '+Lg('ур. ','lvl ')+n:'')+'</b><span>'+
    (own?(n?Lg('сейчас: ','now: ')+mstKindTxt(L.kind,mstEff(n)*st)+' · ':'')+Lg('шаг: ','step: ')+mstKindTxt(L.kind,st):Lg('🔒 сначала докачай до конца','🔒 max it out first'))+'</span></div>'+
    (own?'<button class="btn gold" data-mst="'+L.id+'" '+(S.gold<c?'disabled':'')+'><img src="'+ic('ingot',40)+'">'+fmtNum(c)+'</button>':'')+'</div></div>';}
function openMst(keep){const box=$('mBody'),sc=keep&&box?box.scrollTop:0;const ch=mstCheapest(),all=MST_L.filter(L=>!L.t);
  let h='<h3>'+Lg('⚒ Мастерство','⚒ Mastery')+'</h3><p class="sub">'+Lg('Каждая докачанная строка кузницы и деревни растёт дальше за золото — понемногу, без конца. Каждый следующий уровень дороже. Действует в кампании, ⚔/🔥 и осаде; в Боссе недели и «Заставе дня» — нет (там все на равных).','Every maxed forge and village line keeps growing for gold — a little at a time, forever. Each next level costs more. Works in the campaign, ⚔/🔥 and the siege; not in the Boss of the Week or the Daily Outpost (everyone is equal there).')+'</p>'+
    '<div class="power"><span>'+Lg('🪙 Золото','🪙 Gold')+'</span><b>'+fmtNum(S.gold)+'</b></div>'+
    (ch?'<button class="btn big gold" id="mstCh" '+(S.gold<ch.c?'disabled':'')+'>'+Lg('⚡ Самое дешёвое: ','⚡ Cheapest: ')+ch.L.name()+(ch.L.t?' ('+TW[ch.L.t].n+')':'')+' — '+fmtNum(ch.c)+'</button>':'')+
    '<h4>'+Lg('На все заставы, чары и запасы','All outposts, spells and supplies')+'</h4>'+all.map(mstRowHTML).join('');
  for(const t of TW_ORDER){const rows=MST_L.filter(L=>L.t===t),lv=rows.reduce((a,L)=>a+mstN(L.id),0);
    h+='<details class="card fgc" data-mt="'+t+'"'+(MSTO[t]?' open':'')+'><summary><img class="ic" src="'+ic('ti_'+t+'_3',112)+'" alt=""><span class="t"><b>'+TW[t].n+'</b><span>'+Lg('уровней мастерства: ','mastery levels: ')+lv+'</span></span><u>'+Lg('Строки','Lines')+'</u></summary>'+rows.map(mstRowHTML).join('')+'</details>';}
  h+='<div class="btns stick"><button class="btn ghost big" id="mstX">'+Lg('Закрыть','Close')+'</button></div>';
  showModal(h,'mst');if(sc)box.scrollTop=sc;try{STAT.screen('mst');}catch(e){}   // OB:FINAL STAT: экран «Мастерство»
  for(const d of box.querySelectorAll('[data-mt]'))d.addEventListener('toggle',()=>{MSTO[d.getAttribute('data-mt')]=d.open?1:0;});
  const buy=id=>{const L=MST_L.find(q=>q.id===id),n=mstN(id);if(mstBuy(id)){SND.up();toast(L.name()+(L.t?' ('+TW[L.t].n+')':'')+': '+Lg('мастерство ','mastery ')+(n+1)+' · '+mstKindTxt(L.kind,mstEff(n+1)*MST_STEP[L.kind]));setPills();openMst(true);}};
  for(const b of box.querySelectorAll('[data-mst]'))b.onclick=()=>buy(b.dataset.mst);
  on('mstCh',()=>{const c=mstCheapest();if(c)buy(c.L.id);});on('mstX',()=>{hideModal();if(curTab==='Forge')renderForge();else if(curTab==='Village')renderVillage();});}
// карточка-вход: в кузнице и в деревне
function mstCardHTML(){if(!S.stars[F3_LOCK+'-5'])return '';const op=mstOpen(),tot=MST_L.reduce((a,L)=>a+mstN(L.id),0);
  return '<div class="card mstc'+(op?' next':'')+'"><div class="row"><img class="ic" src="'+ic('ti_arch_3',80)+'" alt=""'+(op?'':' style="filter:grayscale(1) opacity(.5)"')+'><div class="t"><b>'+Lg('⚒ Мастерство','⚒ Mastery')+'</b><span>'+
    (op?(tot?Lg('уровней: ','levels: ')+tot+(mstBonusTxt()?' · '+Lg('все заставы: ','all outposts: ')+mstBonusTxt():''):Lg('Докачанные строки растут дальше за золото — без конца.','Maxed lines keep growing for gold — forever.'))
      :Lg('🔒 Откроется, когда пройдёшь всю кампанию на Обычном: докачанные строки кузницы и деревни будут расти дальше за золото.','🔒 Opens once you finish the whole campaign on Normal: maxed forge and village lines will keep growing for gold.'))+'</span></div>'+
    (op?'<button class="btn gold" id="mstGo">'+Lg('Открыть','Open')+'</button>':'')+'</div></div>';}
function bgsHTML(){if(!S.stars[F3_LOCK+'-5'])return '';const op=mstOpen(),free=bgsFree();
  let h=mstCardHTML()+'<h2>'+Lg('Богатырские ступени','Bogatyr steps')+'</h2><p class="sub">'+(op?Lg('За звёзды ⚔ Сложного и 🔥 Адского: ступени на все заставы. Есть: <b style="color:var(--gold)">'+free+'</b> из '+bgsStars()+' ★.','For ⚔ Hard and 🔥 Hell stars: steps for all outposts. Available: <b style="color:var(--gold)">'+free+'</b> of '+bgsStars()+' ★.')
    :Lg('🔒 Откроются, когда пройдёшь всю кампанию на Обычном. Платишь звёздами ⚔ Сложного и 🔥 Адского (звёзды кампании — в кузнице).','🔒 Open once you finish the whole campaign on Normal. Paid with ⚔ Hard and 🔥 Hell stars (campaign stars go to the forge).'))+'</p><div class="g2">';
  for(const b of BGS){const n=bgsN(b.k),max=b.cost.length;
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic(b.ic)+'"'+(op?'':' style="filter:grayscale(1) opacity(.5)"')+'><div class="t"><b>'+b.n+'</b><span>'+(n<max?Lg('Дальше: ','Next: ')+b.d:Lg('Всё пройдено!','All done!'))+(n?' · '+Lg('сейчас ','now ')+mstKindTxt(b.kind,b.step*n):'')+'</span><div class="pips">'+b.cost.map((_,i)=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</div></div>'+
      (!op?'<span class="tag">🔒</span>':n<max?'<button class="btn gold" data-bg="'+b.k+'" '+(free<b.cost[n]?'disabled':'')+'>⚔🔥 '+b.cost[n]+'★</button>':'<span class="tag ok">'+Lg('Готово','Done')+'</span>')+'</div></div>';}
  return h+'</div>';}
function endgForgeBind(el){for(const b of el.querySelectorAll('[data-bg]'))b.onclick=()=>{const x=BGS.find(q=>q.k===b.dataset.bg),n=bgsN(x.k);if(bgsBuy(x.k)){SND.up();toast(x.n+': '+mstKindTxt(x.kind,x.step*(n+1)));renderForge();setPills();}};
  on('mstGo',()=>openMst());}
function endgVIL(el){try{if(!el||!S.stars[F3_LOCK+'-5'])return;const d=document.createElement('div');d.innerHTML=mstCardHTML();const c=d.firstChild;if(!c)return;
  const at=el.querySelector('#bnBox');if(at)el.insertBefore(c,at);else el.appendChild(c);on('mstGo',()=>openMst());}catch(e){console.warn('endg vil',e);}}
if(typeof META_MODS!=='undefined')META_MODS.push({id:'endg',FIX:ENDG_FIX,MERGE:ENDG_MERGE,ST:endgST,RUN:endgRUN,VIL:endgVIL});
(function(){const st=document.createElement('style');st.textContent='.mstr{padding:6px 8px;margin:4px 0}.mstr .ic{width:40px;height:40px}.mstr .t span{font-size:13px}#mBody h4{margin:10px 0 4px}#mstCh{width:100%;margin:6px 0}';document.head.appendChild(st);})();
// «Сила застав» (только показ): +1 за уровень мастерства, +1 за ★ богатырских ступеней
{const pw0=powerNow;powerNow=function(){let n=pw0();for(const L of MST_L)n+=mstN(L.id);return n+bgsSpent();};}
/* ---------- осада: золото за день (решение владельца 08.10 — закрыть «ферму осады»: запойный набивал ≈1,8 млн за 8 недель) ----------
   Первые SG.full забегов осады за день — полное золото, дальше ×SG.k. Рекорд, Слава, ускорение, задания — без изменений.
   Множитель берётся в начале забега (G.sgK), «ещё попытка» в том же забеге — тот же. Счёт — S.sgD {d: день, n: забегов}. */
const SG={full:3,k:.25};
function sgToday(){const d=S.sgD;return d&&d.d===dayKey()?(+d.n||0):0;}
function sgK(){return sgToday()<SG.full?1:SG.k;}
function sgNote(){if(!G||!G.endless||G.wk||G.dly)return '';const left=SG.full-sgToday();
  return '<br><span style="font-size:13px">'+(G.sgK<1?Lg('Сегодня полное золото осады уже взято — дальше четверть. Завтра снова полное.','Full siege gold for today is taken — a quarter from now on. Full again tomorrow.')
    :left>0?Lg('Полное золото осады сегодня — ещё '+left+' '+plw(left,'забег','забега','забегов','',''),'Full siege gold today: '+left+' more run'+(left===1?'':'s')):Lg('Дальше сегодня — четверть золота осады','From now on today — a quarter of the siege gold'))+'</span>';}
function sgRUN(g){if(g&&g.endless&&!g.wk&&!g.dly)g.sgK=sgK();}
function sgEND(g){if(!g||!g.endless||g.wk||g.dly||g.sgC)return;g.sgC=1;const t=dayKey();S.sgD={d:t,n:sgToday()+1};}
function SG_FIX(s){s=s||S;const d=s.sgD;if(!d||typeof d!=='object'||typeof d.d!=='string')s.sgD={d:'',n:0};else s.sgD={d:d.d,n:Math.max(0,Math.floor(+d.n||0))};}
function SG_MERGE(other,o){const a=o.sgD,b=other&&other.sgD;if(b&&typeof b==='object'&&typeof b.d==='string'){if(!a||typeof a!=='object'||b.d>a.d)o.sgD={d:b.d,n:+b.n||0};else if(b.d===a.d)o.sgD={d:a.d,n:Math.max(+a.n||0,+b.n||0)};}}
SG_FIX(S);
if(typeof META_MODS!=='undefined')META_MODS.push({id:'sg',FIX:SG_FIX,MERGE:SG_MERGE,RUN:sgRUN,END:sgEND});
