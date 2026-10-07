'use strict';
/* ================= МЕТА slava: «Слава богатыря» + дорожка наград (п.14), Древо талантов «Богатырская удаль» (п.15), «Сказ месяца» (п.20) =================
   План — release-i/bogatyr-meta/plan.md; договор модулей — ENGINE-API.md §15; журнал — release-h/bogatyr-chapters/logs/M-slava.md.
   Подключение: META_MODS.push({id:'slava',…}). Флаг: ?meta=all или ?meta=slava (как Подворье, metaOn из meta.js); выкл. — модуль молчит, S.slava не создаётся.
   Сейв — только S.slava (+ трофеи TRO_ADD, + облик в S.skins при получении — как награда за вход):
     {x: опыт славы всего, cl: дорожка забрана до уровня, t:{талант:ранг}, it:{rr: свитки перебора, ban: обереги изгнания},
      ss:{id: № сказа, p: очки, u: очки «Удалой», cl/cu: забрано ступеней, d: день, dp: очки за день, ad: день ролика}, c:{…счётчики}, ts}
   Правила: золотом не платим (трофеи, припасы, облики); таланты — только в походах по главам (не поход дня/неделя/сеча), не в 1-м походе;
   сила талантов: максимум slPw ≈ ×1,087 при 60 очках (×1,062 при 30; растяжка прокачек 07.10, журнал PROG.md) — оценка и темп в журнале. Новичку (первые 3 похода) ничего не показываем. */
const SL_ON=typeof metaOn==='function'&&metaOn('slava');
function slErr(w,x){slErr.n=(slErr.n||0)+1;if(slErr.n<=5)console.warn('meta slava '+w+': '+(x&&x.message||x));}
function slEv(a,x){try{const p={a:a};if(x)for(const i in x)p[i]=x[i];STAT.ev('slava',p);}catch(e){}}

/* ---------- слава ---------- */
const SLV={tal:60,base:50,step:10,dif:{s:1.3,h:1.6},sk:[10,20,30,40],max:999};
function slNeed(l){return SLV.base+SLV.step*l;} // опыт с уровня l на l+1
function slLv(x){let l=1;x=Math.max(0,x|0);while(l<SLV.max&&x>=slNeed(l)){x-=slNeed(l);l++;}return {l:l,cur:x,need:slNeed(l)};}
// опыт за поход: 8 + 6 в минуту (до 15 мин) + 25 за победу; ×1,3 Сложная, ×1,6 Адская
function slRunXp(G,win){const m=Math.min(G.t||0,900)/60;return Math.round((8+6*m+(win?25:0))*(SLV.dif[G.dif]||1));}

/* ---------- таланты ---------- */
// растяжка 07.10 (PROG.md): рангов ×2, за ранг ≈ ×0,45 (итог узла ≈ ×0,9), пороги веток ×2, очков до 60 (1 за уровень славы). Старый сейв (без tv) — ранги ×2 (talMig)
// b — ветка, m — рангов, q — нужно очков в ветке, f — развилка (из пары с одной f берётся одна), x — за ранг: might/hp/spd/cd(+ быстрее)/area/magnet/xp/luck/regen(в сек)/amount/rr/ban
const TAL=[
  {id:'ruka',b:'s',m:10,q:0,x:{might:.0009},get n(){return L('Тяжёлая рука','Heavy hand');}},
  {id:'plechi',b:'s',m:6,q:0,x:{area:.0035},get n(){return L('Широкие плечи','Broad shoulders');}},
  {id:'pleche',b:'s',m:2,q:6,f:'s1',x:{might:.007,area:-.05},get n(){return L('Удар с плеча','Shoulder blow');}},
  {id:'zdr',b:'s',m:2,q:6,f:'s1',x:{hp:.007,spd:-.025},get n(){return L('Богатырское здоровье','Hero’s health');}},
  {id:'krep',b:'s',m:4,q:10,x:{regen:.011},get n(){return L('Крепость','Toughness');}},
  {id:'molot',b:'s',m:1,q:16,f:'s2',x:{amount:1,might:-.15},get n(){return L('Тяжёлый молот','Heavy hammer');}},
  {id:'razmah',b:'s',m:2,q:16,f:'s2',x:{area:.025,cd:-.025},get n(){return L('Размах','Wide swing');}},
  {id:'post',b:'u',m:6,q:0,x:{spd:.0022},get n(){return L('Лёгкая поступь','Light step');}},
  {id:'bystr',b:'u',m:6,q:0,x:{cd:.0011},get n(){return L('Быстрая рука','Quick hand');}},
  {id:'vihr',b:'u',m:2,q:6,f:'u1',x:{spd:.009,hp:-.025},get n(){return L('Вихрем','Like a whirlwind');}},
  {id:'stoy',b:'u',m:2,q:6,f:'u1',x:{regen:.022,spd:-.02},get n(){return L('Стойкий','Steadfast');}},
  {id:'chut',b:'u',m:6,q:10,x:{magnet:.0135},get n(){return L('Чутьё','Keen sense');}},
  {id:'udalec',b:'u',m:2,q:16,f:'u2',x:{cd:.009,area:-.06},get n(){return L('Удалец','Daredevil');}},
  {id:'dyh',b:'u',m:2,q:16,f:'u2',x:{hp:.007,cd:-.02},get n(){return L('Второе дыхание','Second wind');}},
  {id:'uch',b:'m',m:10,q:0,x:{xp:.0022},get n(){return L('Учёность','Learning');}},
  {id:'udacha',b:'m',m:6,q:0,x:{luck:.0045},get n(){return L('Удача','Luck');}},
  {id:'izg',b:'m',m:1,q:6,f:'m1',x:{ban:1},get n(){return L('Изгоняющий','Banisher');}},
  {id:'pereb',b:'m',m:1,q:6,f:'m1',x:{rr:1},get n(){return L('Перебор','Second look');}},
  {id:'kladez',b:'m',m:6,q:10,x:{xp:.0022},get n(){return L('Кладезь мудрости','Fount of wisdom');}},
  {id:'mudr',b:'m',m:2,q:16,f:'m2',x:{xp:.0068},get n(){return L('Мудрость','Wisdom');}},
  {id:'nahod',b:'m',m:1,q:16,f:'m2',x:{rr:1,ban:1},get n(){return L('Находчивость','Resourcefulness');}}];
const TAL_BY={};for(const t of TAL)TAL_BY[t.id]=t;
const TAL_BR={s:{ic:'sl_sila',get n(){return L('Сила','Might');},get d(){return L('урон, здоровье, размах','damage, health, reach');}},
  u:{ic:'sl_udal',get n(){return L('Удаль','Daring');},get d(){return L('скорость, перезарядка, чутьё','speed, cooldown, pickup');}},
  m:{ic:'sl_smek',get n(){return L('Смекалка','Wits');},get d(){return L('опыт, удача, переборы','XP, luck, rerolls');}}};
const pn=v=>{const a=Math.round(Math.abs(v)*10000)/100;return dec(a,Math.abs(a*10-Math.round(a*10))>1e-6?2:a%1?1:0);},pc=v=>(v>0?'+':'−')+pn(v)+' %';
function talFxText(x,r){r=r||1;const a=[];
  for(const k in x){const v=x[k]*r;
    if(k==='might')a.push(pc(v)+L(' урона',' damage'));else if(k==='hp')a.push(pc(v)+L(' здоровья',' health'));else if(k==='spd')a.push(pc(v)+L(' скорости',' speed'));
    else if(k==='cd')a.push(v>0?L('перезарядка быстрее на ','cooldown −')+pn(v)+' %':L('перезарядка медленнее на ','cooldown +')+pn(v)+' %');
    else if(k==='area')a.push(pc(v)+L(' размера ударов',' attack size'));else if(k==='magnet')a.push(pc(v)+L(' притяжения',' pickup range'));
    else if(k==='xp')a.push(pc(v)+L(' опыта',' XP'));else if(k==='luck')a.push(pc(v)+L(' удачи',' luck'));
    else if(k==='regen')a.push('+'+pn(v*.6)+L(' здоровья в минуту',' health per minute'));
    else if(k==='amount')a.push('+'+v+L(' снаряд',' projectile'));else if(k==='rr')a.push('+'+v+L(' перебор карточек',' card reroll'));else if(k==='ban')a.push('+'+v+L(' изгнание',' banish'));}
  return a.join(', ');}

/* ---------- припасы и облики (награды) ---------- */
const SL_IT={rr:{ic:'sl_scroll',get n(){return L('Свиток перебора','Reroll scroll');},get d(){return L('+1 перебор карточек','+1 card reroll');}},
  ban:{ic:'sl_ban',get n(){return L('Оберег изгнания','Banish charm');},get d(){return L('+1 изгнание карточки','+1 card banish');}}};
// облики славы (ур. 10/20/30/40) и Сказа (верх, ступень 30) — те же рисунки богатырей, другие цвета; силы не дают
const SL_SKINS=[
  {id:'slava',hero:'dob',nm:()=>L('Былинный витязь','Epic Knight'),pal:{body:'#2f5ab0',cloak:'#e6b53a',helm:'#e8eef6',rim:'#e6b53a',belt:'#e6b53a'}},
  {id:'slava',hero:'ale',nm:()=>L('Удалой стрелец','Daring Archer'),pal:{body:'#1f8a7a',cloak:'#e6b53a',cap:'#c0392b',fur:'#f4f0e0'}},
  {id:'slava',hero:'ily',nm:()=>L('Муромский дуб','Murom Oak'),pal:{body:'#6a4a2a',cloak:'#3a6a2a',helm:'#c8a050',rim:'#e6b53a'}},
  {id:'slava',hero:'vas',nm:()=>L('Василиса Премудрая','Vasilisa the Wise'),pal:{body:'#5a2a8a',kok:'#e6b53a',hair:'#3a2a1a',belt:'#e6b53a'}},
  {id:'zhar',hero:'mik',nm:()=>L('Жаркий пахарь','Fiery Ploughman'),pal:{body:'#e0703a',cap:'#ffd84a',belt:'#c0392b'}},
  {id:'moroz',hero:'mar',nm:()=>L('Морозная королевна','Frost Maiden'),pal:{body:'#bfe6ff',cloak:'#2a5fc2',helm:'#f4f8ff',rim:'#6ab8ff',kok:'#6ab8ff'}},
  {id:'lyag',hero:'vol',nm:()=>L('Болотный волк','Marsh Wolf'),pal:{body:'#4a8a3a',cloak:'#2a5a2a',fur:'#a8d86e'}}];
const SL_FAME_SK=['dob@slava','ale@slava','ily@slava','vas@slava'];
const SAGA=[{nm:()=>L('Сказ о Жар-птице','Tale of the Firebird'),sk:'mik@zhar'},{nm:()=>L('Сказ о Морозко','Tale of Morozko'),sk:'mar@moroz'},{nm:()=>L('Сказ о Царевне-лягушке','Tale of the Frog Princess'),sk:'vol@lyag'}];
const SAGA_D=28,SAGA_N=30,SAGA_P=25; // дней в сказе, ступеней, очков на ступень
if(SL_ON)try{for(const s of SL_SKINS){const fi=SL_FAME_SK.indexOf(s.hero+'@'+s.id),o={id:s.id,hero:s.hero,pal:s.pal,fame:1,get name(){return s.nm();},
    get src(){return fi>=0?L('уровень славы '+SLV.sk[fi],'fame level '+SLV.sk[fi]):L('«Сказ месяца»: верхняя дорожка, ступень '+SAGA_N,'“Tale of the Month”: upper track, step '+SAGA_N);}};SKINS.push(o);
  const h=Object.assign({},HERO_ART[s.hero],s.pal),k=s.hero+'@'+s.id;for(const f of[0,1])art('h_'+k+'_'+f,80,g=>drawHero(g,h,f));art('hp_'+k,66,g=>{g.translate(0,3);drawHero(g,h,0);});}}catch(e){slErr('skins',e);}
function slSkName(key){const sk=SKINS.find(k=>k.hero+'@'+k.id===key);return sk?sk.name:key;}
// трофеи: виды задаёт модуль tro (TRO_DEF, id 'tr_'+тема); здесь — только какие темы уже открыты игроком
const SL_TRN={les:()=>L('Клык','Fang'),bol:()=>L('Тина','Swamp weed'),pole:()=>L('Воронье перо','Raven feather'),kosh:()=>L('Косточка','Bone'),med:()=>L('Самоцвет','Gem'),gory:()=>L('Льдинка','Ice shard'),
  more:()=>L('Жемчуг','Pearl'),luk:()=>L('Золотой жёлудь','Golden acorn'),ogon:()=>L('Уголёк','Ember'),vihr:()=>L('Облачко','Cloud puff'),lih:()=>L('Тень','Shadow')};
function slThemes(){const a=[];for(const r of CAMP)if(S.done&&S.done[r.slot]&&a.indexOf(r.th)<0)a.push(r.th);return a.length?a:['les'];}
function slTroId(i){const t=slThemes();return 'tr_'+t[((i|0)%t.length+t.length)%t.length];}
function slTroName(id){const D=typeof TRO_DEF!=='undefined'&&TRO_DEF[id];if(D)return L(D.n,D.en||D.n);const t=SL_TRN[id.slice(3)];return t?t():id;}
function slTroIc(id){return typeof ART!=='undefined'&&ART[id]?id:'sl_tro';}

/* награды: {tr:n,i:индекс темы} трофеи · {it:'rr'|'ban',n} припас · {sk:'hero@id'} облик · {fx:n} опыт славы */
function famRw(l){if(l<2)return null;const k=SLV.sk.indexOf(l);if(k>=0)return {sk:SL_FAME_SK[k]};
  if(l>50)return l%5?null:{tr:12,i:l};if(l%5===0)return {it:'rr',n:1};if(l%10===7)return {it:'ban',n:1};return {tr:3+Math.floor(l/6),i:l};}
function sagaRw(s,up){if(!up){if(s%10===0)return {tr:10,i:s};if(s%5===0)return {it:'rr',n:1};if(s%10===3)return {it:'ban',n:1};if(s%10===8)return {fx:40};return {tr:2+Math.floor(s/10),i:s};}
  if(s%10===0)return {tr:15,i:s+1};if(s%5===0)return {it:'rr',n:1};if(s%3===0)return {fx:60};if(s%7===0)return {it:'ban',n:1};return {tr:4+Math.floor(s/10),i:s+1};}
function rwIc(r){return r.sk?'hp_'+r.sk:r.it?SL_IT[r.it].ic:r.fx?'sl_fame':slTroIc(slTroId(r.i));}
function rwText(r){if(!r)return '—';if(r.sk)return L('облик ','outfit ')+qt(slSkName(r.sk));if(r.it)return SL_IT[r.it].n+' ×'+r.n;if(r.fx)return L('слава +','fame +')+r.fx;return slTroName(slTroId(r.i))+' ×'+r.tr;}
// выдать награду (сохраняет вызывающий); облик уже есть — вместо него 15 трофеев
function rwGive(r,src){const s=SL();if(!s||!r)return;
  if(r.sk){if(!S.skins)S.skins={};if(S.skins[r.sk]){TRO_ADD(slTroId(0),15);}else S.skins[r.sk]=1;}
  else if(r.it)s.it[r.it]=(s.it[r.it]||0)+r.n;else if(r.fx)slAddXp(r.fx,src);else if(r.tr)TRO_ADD(slTroId(r.i),r.tr);}

/* ---------- сейв ---------- */
function slNew(){return {tv:2,x:0,cl:1,t:{},it:{rr:0,ban:0},ss:{id:-1,p:0,u:0,cl:0,cu:0,d:'',dp:0,ad:'',an:0,b:0},c:{},ts:0};}
function slFixO(s){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),n=v=>typeof v==='number'&&isFinite(v)?v:0;
  s.x=Math.max(0,n(s.x)|0);s.cl=Math.max(1,n(s.cl)|0);s.ts=n(s.ts);for(const k of['t','it','ss','c'])if(!ob(s[k]))s[k]={};
  if((s.tv|0)<2)talMig(s);
  for(const k in s.t){const T=TAL_BY[k];if(!T)delete s.t[k];else s.t[k]=Math.max(0,Math.min(T.m,n(s.t[k])|0));if(!s.t[k])delete s.t[k];}
  for(const k of['rr','ban'])s.it[k]=Math.max(0,n(s.it[k])|0);for(const k in s.c)s.c[k]=n(s.c[k]);
  const q=s.ss;q.id=n(q.id)|0||(q.id===0?0:-1);for(const k of['p','u','cl','cu','dp','an','b'])q[k]=Math.max(0,n(q[k])|0);for(const k of['d','ad'])if(typeof q[k]!=='string')q[k]='';
  if(!talOk(s))s.t={}; // очков меньше, чем вложено (облако/правка) — бесплатный сброс
  return s;}
const TAL_M1={molot:1,izg:1,pereb:1,nahod:1}; // узлы, где рангов не прибавилось (1 ранг: снаряд, изгнание, перебор)
function talMig(s){try{const t=s.t;for(const k in t){const T=TAL_BY[k],r=+t[k]|0;if(!T||r<=0){delete t[k];continue;}t[k]=Math.min(T.m,TAL_M1[k]?r:r*2);}
  const pts=talPts(s);let sp=talSpent(s);while(sp>pts){let mk='',mr=0;for(const k in t)if(t[k]>mr&&!TAL_BY[k].f){mr=t[k];mk=k;}
    if(!mk)for(const k in t)if(t[k]>mr){mr=t[k];mk=k;}if(!mk)break;t[mk]--;if(!t[mk])delete t[mk];sp--;}}catch(e){slErr('mig',e);}s.tv=2;}
function SL_FIX(S){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(S.slava!=null&&!ob(S.slava))S.slava=null;
  if(!S.slava){if(!SL_ON)return;S.slava=slNew();}slFixO(S.slava);}catch(e){slErr('fix',e);}}
SL_FIX(S); // при самой первой загрузке META_HK('FIX') ещё не звали — чиним сами
// облако: опыт/забранное/сказ — максимум; таланты и припасы — из более нового (ts)
function SL_MERGE(d,o){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),b=ob(d)&&ob(d.slava)?d.slava:null;if(!b)return;
  const a=ob(o.slava)?o.slava:null;if(!a){o.slava=JSON.parse(JSON.stringify(b));return;}
  const pk=(+b.ts||0)>(+a.ts||0)?b:a,ol=pk===a?b:a,nw=JSON.parse(JSON.stringify(pk));
  nw.x=Math.max(+a.x||0,+b.x||0);nw.cl=Math.max(+a.cl||1,+b.cl||1);
  const qa=ob(a.ss)?a.ss:{},qb=ob(b.ss)?b.ss:{};
  if((+qa.id|0)===(+qb.id|0)){const q=nw.ss=ob(nw.ss)?nw.ss:{};for(const k of['p','u','cl','cu'])q[k]=Math.max(+qa[k]||0,+qb[k]||0);
    if(qa.d===qb.d)q.dp=Math.max(+qa.dp||0,+qb.dp||0);if(qa.ad>q.ad)q.ad=qa.ad;if(qb.ad>q.ad)q.ad=qb.ad;
    q.an=Math.max(qa.ad===q.ad?+qa.an||0:0,qb.ad===q.ad?+qb.an||0:0);q.b=Math.max(+qa.b||0,+qb.b||0)?1:0;}
  else nw.ss=JSON.parse(JSON.stringify((+qa.id|0)>(+qb.id|0)?qa:qb));
  const oc=ob(ol.c)?ol.c:{};nw.c=ob(nw.c)?nw.c:{};for(const k in oc)nw.c[k]=Math.max(+nw.c[k]||0,+oc[k]||0);
  o.slava=slFixO(nw);}catch(e){slErr('merge',e);}}
function SL(){return SL_ON&&S.slava||null;}
function slTouch(){const s=SL();if(s)s.ts=Date.now();}
function slVis(){return !!SL()&&(S.runs|0)>=3;} // новичку (первые 3 похода) — не показываем

/* ---------- слава: опыт, уровень, дорожка ---------- */
function slAddXp(n,src){const s=SL();if(!s||n<=0)return 0;const l0=slLv(s.x).l;s.x+=Math.round(n);const l1=slLv(s.x).l;
  for(let l=l0+1;l<=l1;l++)slEv('lvl',{l:l,k:src||'run'});return l1-l0;}
function famReady(s){const l=slLv(s.x).l;for(let i=s.cl+1;i<=l;i++)if(famRw(i))return true;return false;}
function famClaim(){const s=SL();if(!s)return 0;const l=slLv(s.x).l;let n=0;for(let i=s.cl+1;i<=l;i++){const r=famRw(i);if(r){rwGive(r,'fam');n++;}}
  s.cl=Math.max(s.cl,l);if(n)slEv('claim',{k:'fam',l:l,n:n});slTouch();save();return n;}

/* ---------- таланты: очки, проверки ---------- */
function talPts(s){return Math.min(SLV.tal,slLv(s.x).l-1);}
function talSpent(s,b){let n=0;for(const k in s.t)if(!b||TAL_BY[k].b===b)n+=s.t[k];return n;}
function talOk(s){if(talSpent(s)>talPts(s))return false;for(const k in s.t){const T=TAL_BY[k];if(T.f&&TAL.some(o=>o.f===T.f&&o.id!==k&&s.t[o.id]))return false;}return true;}
function talWhy(s,T){const r=s.t[T.id]||0;if(r>=T.m)return 'max';if(T.f){const o=TAL.find(o=>o.f===T.f&&o.id!==T.id);if(o&&s.t[o.id])return 'fork';}
  if(talSpent(s,T.b)<T.q)return 'q';if(talSpent(s)>=talPts(s))return 'pts';return '';}
function talAdd(id){const s=SL(),T=TAL_BY[id];if(!s||!T||talWhy(s,T))return;s.t[id]=(s.t[id]||0)+1;slTouch();save();SND.click();slEv('tal',{k:id,r:s.t[id],t:talSpent(s)});}
function talReset(){const s=SL();if(!s)return;const n=talSpent(s);s.t={};slTouch();save();SND.click();slEv('reset',{t:n});}
// суммарные поправки по раскладке
function talFx(s){const f={};for(const k in s.t){const T=TAL_BY[k],r=s.t[k];for(const x in T.x)f[x]=(f[x]||0)+T.x[x]*r;}return f;}

/* ---------- Сказ месяца ---------- */
function slSagaId(){return Math.floor(dayIdx()/SAGA_D);}
function slSagaLeft(){return SAGA_D-(((dayIdx()%SAGA_D)+SAGA_D)%SAGA_D);} // дней до конца, включая сегодня
// текущий сказ; сменился — несобранное выдаём сами (ничего не пропадает) и начинаем заново
function slSaga(){const s=SL();if(!s)return {id:0,p:0,u:0,cl:0,cu:0,d:'',dp:0,ad:'',an:0,b:0};const q=s.ss,id=slSagaId();
  if(q.id!==id){if(q.id>=0){let n=0;const old=q.id;q.id=old;
      for(let i=q.cl+1;i<=Math.min(SAGA_N,Math.floor(q.p/SAGA_P));i++){rwGive(sagaRwAt(i,false,old),'saga');n++;}
      for(let i=q.cu+1;i<=Math.min(SAGA_N,Math.floor(q.u/SAGA_P));i++){rwGive(sagaRwAt(i,true,old),'saga');n++;}
      if(n){s.c.auto=(s.c.auto||0)+n;slEv('saga',{k:'auto',n:n,s:old});}}
    s.ss={id:id,p:0,u:0,cl:0,cu:0,d:'',dp:0,ad:'',an:0,b:0};slTouch();try{save();}catch(e){}}
  return s.ss;}
function sagaRwAt(i,up,id){if(up&&i===SAGA_N)return {sk:SAGA[id%SAGA.length].sk};return sagaRw(i,up);}
function sagaDay(q){const dk=dayKey();if(q.d!==dk){q.d=dk;q.dp=0;}return dk;}
function sagaUd(q){return !!q.b||q.ad===dayKey();} // «Удалая» открыта: куплена на сезон или ролик сегодня
const SAGA_AD={n:5,bonus:5}; // роликов в день всего; 2-й…5-й (купившему — 1-й…4-й) — +5 очков Сказа, только после первого похода дня (расчёт — журнал)
function sagaAdN(q){return q.ad===dayKey()?Math.max(1,q.an|0):0;}
function sagaBonusLeft(q){const n=sagaAdN(q);return q.b?Math.max(0,SAGA_AD.n-1-n):n?Math.max(0,SAGA_AD.n-n):0;}
function sagaStep(p){return Math.min(SAGA_N,Math.floor(p/SAGA_P));}
function sagaReady(q){return sagaStep(q.p)>q.cl||sagaStep(q.u)>q.cu;}
function sagaClaim(){const s=SL();if(!s)return 0;const q=slSaga();let n=0;
  for(let i=q.cl+1;i<=sagaStep(q.p);i++){rwGive(sagaRwAt(i,false,q.id),'saga');n++;}q.cl=Math.max(q.cl,sagaStep(q.p));
  for(let i=q.cu+1;i<=sagaStep(q.u);i++){rwGive(sagaRwAt(i,true,q.id),'saga');n++;}q.cu=Math.max(q.cu,sagaStep(q.u));
  if(n)slEv('claim',{k:'saga',s:q.cl,u:q.cu,n:n});slTouch();save();return n;}
// ролик: «Удалая дорожка» на сегодня — очки дня (и уже набранные сегодня) идут и в верхнюю дорожку
function sagaAd(){const s=SL();if(!s)return false;const q=slSaga();sagaDay(q);if(sagaUd(q))return false;q.ad=dayKey();q.an=1;q.u+=q.dp;s.c.ad=(s.c.ad||0)+1;slTouch();save();slEv('ad',{s:sagaStep(q.p),u:sagaStep(q.u)});return true;}
// ролики 2–5: +5 очков Сказа (и в «Удалую», если открыта)
function sagaBonus(){const s=SL();if(!s)return false;const q=slSaga();sagaDay(q);if(!q.dp||sagaBonusLeft(q)<=0)return false;const n=sagaAdN(q);q.ad=dayKey();q.an=n+1;
  const b=SAGA_AD.bonus;q.p+=b;q.dp+=b;if(sagaUd(q))q.u+=b;s.c.adb=(s.c.adb||0)+1;slTouch();save();slEv('adb',{n:q.an,s:sagaStep(q.p)});return true;}
// покупка VK (js/pay.js PAY_ITEMS.saga_pass / saga_pass10 → give): «Удалая» на текущий сказ (всё набранное — и в верх), pass10 — ещё +10 ступеней
function slSagaBuy(id){try{const s=SL()||(SL_FIX(S),S.slava);if(!s)return;const q=slSaga();q.b=1;q.u=Math.max(q.u,q.p);
  if(id==='saga_pass10'){const a=10*SAGA_P;q.p+=a;q.u+=a;}s.c.buy=(s.c.buy||0)+1;slTouch();slEv('buy',{k:id,s:q.id});}catch(e){slErr('buy',e);}}

/* ---------- что ждёт игрока ---------- */
function slReady(){const s=SL();if(!s||!slVis())return false;return famReady(s)||talSpent(s)<talPts(s)||sagaReady(slSaga());}
function slStatus(){const s=SL(),lv=slLv(s.x),a=[L('ур. ','lvl ')+lv.l];
  if(famReady(s))a.push(L('награда ждёт','reward waiting'));const f=talPts(s)-talSpent(s);if(f>0)a.push(L('очков талантов: ','talent points: ')+f);
  const q=slSaga();if(sagaReady(q))a.push(L('Сказ: награда','Tale: reward'));else a.push(L('Сказ: ступень ','Tale: step ')+sagaStep(q.p)+'/'+SAGA_N);
  return a.join(' · ');}

/* ---------- окно «Слава богатыря» ---------- */
let slSeg='fam',slBr='s',slRes=0;
const slSec=t=>'<div style="font-weight:900;font-size:18px;margin:14px 4px 6px">'+t+'</div>';
function slBar(c,n){return '<div class="bar"><i style="width:'+Math.round(Math.min(1,c/Math.max(1,n))*100)+'%"></i></div>';}
function slRow(icon,b,sp,right,cls){return '<div class="card'+(cls?' '+cls:'')+'"><div class="row"><img class="ic" src="'+ic(icon,96)+'"><div class="t"><b>'+b+'</b>'+(sp?'<span>'+sp+'</span>':'')+'</div>'+(right||'')+'</div></div>';}
function slItems(s){const a=[];for(const k in SL_IT)if(s.it[k])a.push('<span class="slIt"><img src="'+ic(SL_IT[k].ic,40)+'">'+SL_IT[k].n+' ×'+s.it[k]+'</span>');
  return a.length?'<div class="card slItems">'+a.join('')+'<div class="slNote">'+L('По одному каждого уходит с тобой в поход по главе.','One of each goes with you on every chapter run.')+'</div></div>':'';}
function slFamHTML(s){const lv=slLv(s.x),pts=talPts(s),fr=pts-talSpent(s);let h='';
  h+='<div class="card slHead"><div class="row"><img class="ic" src="'+ic('sl_fame',120)+'"><div class="t"><b>'+L('Уровень славы ','Fame level ')+lv.l+'</b><span>'+fmtNum(lv.cur)+' / '+fmtNum(lv.need)+L(' до следующего',' to next')+'</span>'+slBar(lv.cur,lv.need)+'</div></div>'+
    '<p class="slNote">'+L('Слава копится за каждый поход — даже проигранный. Каждый уровень — награда и очко таланта (до '+SLV.tal+').','Fame grows with every run — even a lost one. Each level gives a reward and a talent point (up to '+SLV.tal+').')+'</p></div>';
  if(fr>0)h+='<div class="btns"><button class="btn gold" id="slToTal">'+L('🌳 Свободных очков талантов: ','🌳 Free talent points: ')+fr+'</button></div>';
  if(famReady(s))h+='<div class="btns"><button class="btn big gold" id="slFamGet">'+L('🎁 Забрать награды','🎁 Collect rewards')+'</button></div>';
  h+=slItems(s)+slSec(L('Дорожка наград','Reward track'));
  const a=Math.max(2,Math.min(s.cl,lv.l)-1),b=Math.max(a+7,lv.l+4);
  for(let l=a;l<=b;l++){const r=famRw(l),got=l<=s.cl,rch=l<=lv.l;
    h+='<div class="card slStep'+(got?' got':rch?' ready':' lock')+'"><div class="row"><div class="slN">'+l+'</div><img class="ic" src="'+ic(r?rwIc(r):'sl_fame',72)+'"><div class="t"><b>'+(r?rwText(r):L('очко таланта','talent point'))+'</b>'+
      (l<=SLV.tal+1?'<span>'+L('+1 очко таланта','+1 talent point')+'</span>':'')+'</div><span class="tag'+(got?' ok':'')+'">'+(got?'✓':rch?'🎁':'🔒')+'</span></div></div>';}
  return h;}
function slTalHTML(s){const pts=talPts(s),sp=talSpent(s),fr=pts-sp;let h='';
  h+='<div class="card slHead"><div class="row"><img class="ic" src="'+ic(TAL_BR[slBr].ic,120)+'"><div class="t"><b>'+L('Очки талантов: ','Talent points: ')+fr+L(' свободно',' free')+'</b><span>'+L('вложено ','spent ')+sp+' / '+pts+L(' (1 очко за уровень славы, до '+SLV.tal+')',' (1 per fame level, up to '+SLV.tal+')')+'</span></div></div>'+
    '<p class="slNote">'+L('Таланты работают в походах по главам. Развилки — «или–или»: передумал — сброс бесплатный.','Talents work on chapter runs. Forks are either–or. Changed your mind? Reset is free.')+'</p></div>';
  h+='<div class="slTabs">'+Object.keys(TAL_BR).map(b=>'<button class="btn '+(b===slBr?'gold':'ghost')+'" data-slb="'+b+'"><img src="'+ic(TAL_BR[b].ic,48)+'">'+TAL_BR[b].n+' '+talSpent(s,b)+'</button>').join('')+'</div>';
  h+='<p class="sub" style="margin:4px 4px 0">'+TAL_BR[slBr].d+'</p>';
  const list=TAL.filter(t=>t.b===slBr);let lastF='';
  for(const T of list){const r=s.t[T.id]||0,w=talWhy(s,T);
    if(T.f&&T.f===lastF)h+='<div class="slOr">'+L('— или —','— or —')+'</div>';else if(T.f)h+='<div class="slFork">'+L('Развилка: от ','Fork: from ')+T.q+L(' очков в ветке',' points in branch')+'</div>';lastF=T.f||'';
    const why=w==='fork'?L('выбран другой путь','other path chosen'):w==='q'?L('нужно '+T.q+' очк. в ветке','needs '+T.q+' pts in branch'):'';
    h+='<div class="card slTal'+(r?' on':'')+(w==='fork'||w==='q'?' lock':'')+'"><div class="row"><img class="ic" src="'+ic(TAL_BR[T.b].ic,72)+'"><div class="t"><b>'+T.n+' <span class="slR">'+r+'/'+T.m+'</span></b><span>'+
      (T.m>1?L('за ранг: ','per rank: '):'')+talFxText(T.x)+(r&&T.m>1?'<br>'+L('сейчас: ','now: ')+talFxText(T.x,r):'')+(why?'<br><i>'+why+'</i>':'')+'</span></div>'+
      (w===''?'<button class="btn gold slPlus" data-slt="'+T.id+'">+1</button>':w==='max'?'<span class="tag ok">✓</span>':'')+'</div></div>';}
  if(sp)h+='<div class="btns"><button class="btn ghost" id="slReset">'+(slRes?L('Точно сбросить все таланты?','Really reset all talents?'):L('↺ Сбросить таланты (бесплатно)','↺ Reset talents (free)'))+'</button></div>';
  return h;}
// платная «Удалая» — только где работают покупки VK (в Яндексе/ОК — нет: PAY.v только в VK, в ОК PAY.init не зовётся)
function slPayOk(){return typeof PAY!=='undefined'&&PAY.on&&!!PAY.v&&!G&&!!PAY.item('saga_pass')&&!!PAY.item('saga_pass10');}
function slSagaHTML(s){const q=slSaga();sagaDay(q);const nm=SAGA[q.id%SAGA.length],st=sagaStep(q.p),su=sagaStep(q.u),ud=sagaUd(q);let h='';
  h+='<div class="card slHead"><div class="row"><img class="ic" src="'+ic('sl_saga',120)+'"><div class="t"><b>'+nm.nm()+'</b><span>'+L('ступень ','step ')+st+' / '+SAGA_N+' · '+L('осталось дней: ','days left: ')+slSagaLeft()+'</span>'+
    (st<SAGA_N?slBar(q.p%SAGA_P,SAGA_P):slBar(1,1))+'</div></div>'+
    '<p class="slNote">'+L('Очки Сказа — за походы: +10 за поход, +5 за победу, +10 за первый поход дня. Нижняя дорожка — всем. Верхняя «Удалая» — очки удваиваются в неё в дни, когда смотришь ролик. После похода — ещё до 4 роликов в день по +'+SAGA_AD.bonus+' очков.','Tale points come from runs: +10 per run, +5 for a win, +10 for the first run of the day. The lower track is for everyone. The upper “Daring” track gets your points on days you watch an ad. After a run — up to 4 more ads a day, +'+SAGA_AD.bonus+' points each.')+'</p></div>';
  if(ud)h+='<div class="card slUd on"><b>'+(q.b?L('🔥 Удалая дорожка твоя на весь сказ','🔥 Daring track is yours for the whole tale'):L('🔥 Удалая дорожка открыта до конца дня','🔥 Daring track is open until the end of the day'))+'</b><span>'+L('Удалая: ступень ','Daring: step ')+su+' / '+SAGA_N+'</span></div>';
  else if(adOk())h+='<div class="btns"><button class="btn ad" id="slSagaAd">'+L('🎬 Очки Сказа ×2 на сегодня','🎬 Tale points ×2 today')+'</button></div><p class="sub" style="text-align:center">'+L('Удалая: ступень ','Daring: step ')+su+' / '+SAGA_N+(q.dp?L(' · сегодняшние ',' · today’s ')+q.dp+L(' очк. тоже засчитаются',' pts count too'):'')+'</p>';
  const bl=sagaBonusLeft(q);if(ud&&bl>0&&adOk())h+=q.dp?'<div class="btns"><button class="btn ad" id="slSagaAd2">'+L('🎬 +'+SAGA_AD.bonus+' очков Сказа за рекламу','🎬 +'+SAGA_AD.bonus+' Tale points for an ad')+' · '+bl+'</button></div>':'<p class="sub" style="text-align:center">'+L('Ещё ролики за очки Сказа — после первого похода дня','More ads for Tale points — after your first run of the day')+'</p>';
  if(!q.b&&slPayOk()&&slSagaLeft()>3)h+='<div class="btns"><button class="btn gold" id="slBuy1">'+L('🔥 Удалая на весь сказ','🔥 Daring for the whole tale')+' · '+PAY.price({id:'saga_pass'})+'</button><button class="btn gold" id="slBuy2">'+L('🔥 Удалая + 10 ступеней','🔥 Daring + 10 steps')+' · '+PAY.price({id:'saga_pass10'})+'</button></div>';
  if(sagaReady(q))h+='<div class="btns"><button class="btn big gold" id="slSagaGet">'+L('🎁 Забрать награды','🎁 Collect rewards')+'</button></div>';
  h+=slItems(s)+'<div class="slSagaHd"><span></span><b>'+L('Всем','Everyone')+'</b><b>'+L('🔥 Удалая','🔥 Daring')+'</b></div>';
  const a=Math.max(1,Math.min(q.cl,q.cu)),b=Math.min(SAGA_N,Math.max(a+7,st+3));
  const cell=(i,up)=>{const r=sagaRwAt(i,up,q.id),got=i<=(up?q.cu:q.cl),rch=i<=(up?su:st);return '<div class="slCell'+(got?' got':rch?' ready':' lock')+'"><img src="'+ic(rwIc(r),64)+'"><span>'+rwText(r)+'</span><i>'+(got?'✓':rch?'🎁':'')+'</i></div>';};
  for(let i=a;i<=b;i++)h+='<div class="slSagaRow"><div class="slN">'+i+'</div>'+cell(i,false)+cell(i,true)+'</div>';
  if(b<SAGA_N)h+='<div class="slSagaRow"><div class="slN">'+SAGA_N+'</div>'+cell(SAGA_N,false)+cell(SAGA_N,true)+'</div>';
  return h;}
function openSlava(seg){const s=SL();if(!s)return;if(seg)slSeg=seg;STAT.screen(slSeg==='tal'?'tal':slSeg==='saga'?'saga':'fame');
  const keep=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='slava'&&!seg?$('mBody').scrollTop:0;
  const T=[['fam',L('⭐ Слава','⭐ Fame')],['tal',L('🌳 Таланты','🌳 Talents')],['saga',L('📜 Сказ','📜 Tale')]];
  let h='<h3>'+L('Слава богатыря','Hero’s fame')+'</h3><div class="slTabs top">'+T.map(([k,n])=>'<button class="btn '+(k===slSeg?'gold':'ghost')+'" data-sls="'+k+'">'+n+'</button>').join('')+'</div>';
  h+=slSeg==='tal'?slTalHTML(s):slSeg==='saga'?slSagaHTML(s):slFamHTML(s);
  h+='<div class="btns"><button class="btn big" id="slBack">'+L('Назад','Back')+'</button></div>';
  showModal(h,'slava');if(keep)$('mBody').scrollTop=keep;
  const re=()=>openSlava();
  on('slBack',closeSlava);on('slToTal',()=>openSlava('tal'));
  on('slFamGet',()=>{const n=famClaim();if(n){SND.chest();toast(L('Награды получены: ','Rewards collected: ')+n);}re();});
  on('slSagaGet',()=>{const n=sagaClaim();if(n){SND.chest();toast(L('Награды Сказа: ','Tale rewards: ')+n);}re();});
  on('slReset',()=>{if(!slRes){slRes=1;re();return;}slRes=0;talReset();toast(L('Таланты сброшены — очки вернулись','Talents reset — points returned'));re();});
  for(const b of $('mBody').querySelectorAll('[data-sls]'))b.onclick=()=>{SND.click();slRes=0;openSlava(b.dataset.sls);};
  for(const b of $('mBody').querySelectorAll('[data-slb]'))b.onclick=()=>{SND.click();slBr=b.dataset.slb;slRes=0;re();};
  for(const b of $('mBody').querySelectorAll('[data-slt]'))b.onclick=()=>{talAdd(b.dataset.slt);re();};
  on('slBuy1',()=>PAY.buy('saga_pass'));on('slBuy2',()=>PAY.buy('saga_pass10'));if(typeof PAY!=='undefined')PAY.re=re;
  onAd('slSagaAd2','saga2',()=>showRewarded(()=>{if(sagaBonus()){SND.coin();toast('+'+SAGA_AD.bonus+L(' очков Сказа',' Tale points'));}if(modalHas($('slBack')))re();},null,
    ()=>{if(!sagaBonus())return '';if(modalHas($('slBack')))re();else lateRe();return '+'+SAGA_AD.bonus+L(' очков Сказа',' Tale points');}));
  onAd('slSagaAd','saga',()=>showRewarded(()=>{if(sagaAd())SND.chest();if(modalHas($('slBack')))re();},null,
    ()=>{if(!sagaAd())return '';if(modalHas($('slBack')))re();else lateRe();return L('Удалая дорожка открыта на сегодня','Daring track open for today');}));}
function closeSlava(){slRes=0;hideModal();if(typeof curTab!=='undefined'&&curTab==='Village'&&!G)try{renderVillage();}catch(e){}}

/* ---------- крючки (META_MODS) ---------- */
// начало похода: таланты + припасы (только главы, не 1-й поход)
function slRun(G){if(!SL_ON||!G)return;const s=SL();if(!s||G.endless||G.daily||G.weekly||G.first)return;
  const f=talFx(s),msg=[];let rr=f.rr||0,bn=f.ban||0;
  if(s.it.rr>0){s.it.rr--;rr++;msg.push(SL_IT.rr.n);}if(s.it.ban>0){s.it.ban--;bn++;msg.push(SL_IT.ban.n);}
  if(rr)G.rerolls+=rr;if(bn)G.banN+=bn;if(msg.length){slTouch();save();}
  const st={};let any=false;for(const k in f)if(k!=='rr'&&k!=='ban'&&f[k]){st[k]=f[k];any=true;}
  slEv('run',{t:talSpent(s),l:slLv(s.x).l,rr:rr,bn:bn});
  if(any){const hp0=G.hero.hp,lock=G.hpLock===hp0;G.slT=st;computeStats();if(lock)G.hpLock=G.hero.hp;}
  if(msg.length&&typeof banner==='function')banner(L('🎒 Припасы славы','🎒 Fame supplies'),msg.join(', '),2);}
// характеристики похода: таланты (G.slT ставит slRun)
function slSt(st){const f=G&&G.slT;if(!f)return;
  if(f.might)st.might*=1+f.might;if(f.hp)st.maxHp*=1+f.hp;if(f.spd)st.spd*=1+f.spd;if(f.cd)st.cd*=1-f.cd;if(f.area)st.area*=1+f.area;
  if(f.magnet)st.magnet*=1+f.magnet;if(f.xp)st.xp*=1+f.xp;if(f.luck)st.luck*=1+f.luck;if(f.regen)st.regen+=f.regen;if(f.amount)st.amount+=f.amount;}
// конец похода (≥ 30 с, любой режим, и при поражении): слава и очки Сказа; строка в итогах
function slEnd(G,win){if(!SL_ON||!G)return;const s=SL();if(!s||(G.t||0)<30)return;
  const xp=slRunXp(G,win),l0=slLv(s.x).l;slAddXp(xp,'run');const l1=slLv(s.x).l;G.slX=xp;
  const q=slSaga();sagaDay(q);const sp=10+(win?5:0)+(q.dp?0:10);
  const st0=sagaStep(q.p);q.p+=sp;q.dp+=sp;if(sagaUd(q))q.u+=sp;s.c.runs=(s.c.runs||0)+1;slTouch();
  if(!slVis())return;
  G.slHtml='<p class="sub slRes">⭐ '+L('Слава ','Fame ')+'<b>+'+xp+'</b>'+(l1>l0?' · <b style="color:var(--cGold)">'+L('уровень ','level ')+l1+'!</b>':'')+' · 📜 '+L('Сказ ','Tale ')+'+'+sp+(sagaUd(q)?' ×2':'')+(sagaStep(q.p)>st0?' · '+L('новая ступень!','new step!'):'')+'</p>';
  G.metaHtml=(G.metaHtml||'')+G.slHtml;}
// ×2 золота за ролик в итогах — и ×2 славы тем же роликом (план 7.4.1). Нужен крючок движка META_HK('X2',G) — просьба в журнале
function slX2(G){const s=SL();if(!s||!G||!G.slX||G.slX2)return;G.slX2=1;slAddXp(G.slX,'x2');s.c.x2=(s.c.x2||0)+1;slTouch();save();}
// деревня: карточка под рисунком деревни (после подворья)
function slVil(el){if(!slVis()||!el)return;const s=SL(),lv=slLv(s.x),rd=slReady();
  const d=document.createElement('div');d.className='card slCard'+(rd?' next':'');d.id='slCard';
  d.innerHTML='<div class="row"><img class="ic" src="'+ic('sl_fame',96)+'"><div class="t"><b>'+L('⭐ Слава богатыря','⭐ Hero’s fame')+'</b><span>'+slStatus()+'</span>'+slBar(lv.cur,lv.need)+'</div><button class="btn gold" id="slGo">'+L('Открыть','Open')+'</button></div>';
  const y=el.querySelector('#yardCard'),cv=y||el.querySelector('#village');if(cv&&cv.nextSibling)el.insertBefore(d,cv.nextSibling);else el.appendChild(d);
  on('slGo',()=>openSlava(famReady(s)?'fam':talPts(s)>talSpent(s)?'tal':sagaReady(slSaga())?'saga':null));}
function slToday(TL){if(!slVis())return;const s=SL();if(!slReady())return;
  TL.push({k:'slava',ic:'sl_fame',t:L('Слава богатыря','Hero’s fame'),s:slStatus(),ready:true,b:L('Открыть','Open'),fn:()=>{hideModal();openSlava(famReady(s)?'fam':talPts(s)>talSpent(s)?'tal':'saga');}});}
// «Сила богатыря» (powerScore, крючок PW): таланты — постоянный бонус; те же веса, что в формуле powerScore (размер ударов и снаряды она не считает)
function slPw(){const s=SL();if(!s)return 1;const f=talFx(s);let q=(1+(f.hp||0))*(1+(f.might||0))/(1-(f.cd||0));
  q*=1+.5*(f.spd||0);q*=1+.25*(f.xp||0);q*=1+.04*(f.magnet||0);q*=1+.1*(f.luck||0);q*=1+.25*(f.regen||0);return q>0?q:1;}
function slChips(a){if(slReady())a.push('<i class="hot">⭐ '+L('слава: награда','fame: reward')+'</i>');}
if(SL_ON)META_MODS.push({id:'slava',RUN:slRun,ST:slSt,END:slEnd,X2:slX2,VIL:slVil,TODAY:slToday,CHIPS:slChips,PW:slPw,FIX:SL_FIX,MERGE:SL_MERGE});

/* ---------- рисунки (стиль art.js) ---------- */
function slStar(g,r,r2,n){g.beginPath();for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,q=i%2?r2:r;g.lineTo(Math.cos(a)*q,Math.sin(a)*q);}g.closePath();}
// слава: золотая звезда в лавровом венке
art('sl_fame',64,g=>{for(const s of[-1,1])for(let i=0;i<6;i++){const a=Math.PI/2+s*(.35+i*.36),x=Math.cos(a)*22,y=Math.sin(a)*22;ell(g,x,y,5,2.6,'#5aa447',{rot:a+s*1.2,hl:.45,lw:.7});}
  glow(g,0,-2,24,'#ffe680');slStar(g,17,7.5,5);g.fillStyle=grad(g,0,-2,17,'#f2c230',.5,-.35);g.fill();outline(g,'#e0a82a',1.4);
  slStar(g,9,4,5);g.fillStyle='rgba(255,255,255,.35)';g.fill();shine(g,-4,-8,3,1.6,.6);});
// Сила: булава
art('sl_sila',64,g=>{ln(g,[-16,18,6,-4],'#7a4a22',5);ln(g,[-16,18,6,-4],'#a8733d',2.4);ell(g,-17,19,3.5,3.5,'#e6b53a');
  for(let i=0;i<8;i++){const a=i/8*TAU;poly(g,[8+Math.cos(a)*8,-6+Math.sin(a)*8,8+Math.cos(a+.25)*15,-6+Math.sin(a+.25)*15,8+Math.cos(a+.5)*8,-6+Math.sin(a+.5)*8],'#9aa4b4',{lw:.8});}
  ell(g,8,-6,10,10,'#c2ccd8',{hl:.5});shine(g,4,-10,3.5,2,.6);});
// Удаль: сапог с крылышком
art('sl_udal',64,g=>{shp(g,'#ffffff',{hl:.2},[-22,-14,-2,6],()=>{g.moveTo(-6,-8);g.quadraticCurveTo(-18,-16,-24,-10);g.quadraticCurveTo(-16,-8,-20,-3);g.quadraticCurveTo(-12,-2,-14,3);g.quadraticCurveTo(-6,2,-6,-8);});
  shp(g,'#c0392b',{hl:.4},[-8,-18,20,20],()=>{g.moveTo(-6,-18);g.lineTo(8,-18);g.lineTo(8,6);g.quadraticCurveTo(20,7,21,14);g.lineTo(21,18);g.lineTo(-7,18);g.closePath();});
  ln(g,[-6,-13,8,-13],'#e6b53a',2.2);ln(g,[-7,15,21,15],'#5a2a1a',3);shine(g,-1,-6,2.5,5,.4);});
// Смекалка: сова
art('sl_smek',64,g=>{ell(g,0,4,17,19,'#a8733d',{hl:.35});ell(g,0,9,10,12,'#f2dfb0',{ol:false});
  for(const s of[-1,1]){poly(g,[s*8,-12,s*15,-24,s*16,-10],'#8a5a2e',{lw:.8});ell(g,s*7,-5,7,7,'#fff6d8',{lw:.9});eye(g,s*7,-5,3.6,{px:0});}
  poly(g,[-3,1,3,1,0,6],'#e6a32a',{lw:.7});for(const x of[-5,0,5])ln(g,[x-2,10,x,13,x+2,10],'#a8733d',1.1);ln(g,[-8,22,8,22],'#5a3a1a',2);});
// свиток перебора
art('sl_scroll',56,g=>{rrect(g,-14,-16,28,32,3);g.fillStyle=grad(g,0,0,18,'#f4e2b0',.3,-.25);g.fill();outline(g,'#c8a060',1.2);
  for(const y of[-16,16]){ell(g,0,y,17,4,'#c8964a',{hl:.4,lw:.9});}for(const y of[-8,-3,2,7])ln(g,[-9,y,9,y],'rgba(120,80,40,.55)',1.3);
  g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#c0392b';g.fillText('⟳',0,0);});
// оберег изгнания
art('sl_ban',56,g=>{ln(g,[-10,-20,0,-10,10,-20],'#7a4a22',1.6);ell(g,0,2,15,15,'#3a7ad8',{hl:.5});ell(g,0,2,10,10,'#f4f8ff',{ol:false});ell(g,0,2,6,6,'#2f5ab0',{ol:false});ell(g,0,2,2.6,2.6,'#101828',{ol:false});
  shine(g,-5,-4,3,1.6,.7);});
// Сказ: раскрытая книга
art('sl_saga',64,g=>{for(const s of[-1,1])shp(g,'#f4e8c8',{hl:.25},[s<0?-26:0,-16,s<0?0:26,18],()=>{g.moveTo(0,-12);g.quadraticCurveTo(s*12,-18,s*25,-14);g.lineTo(s*25,16);g.quadraticCurveTo(s*12,12,0,18);g.closePath();});
  ln(g,[0,-12,0,18],'#a8733d',1.6);for(const s of[-1,1])for(const y of[-6,-1,4,9])ln(g,[s*5,y,s*20,y-2],'rgba(120,80,40,.5)',1.1);
  glow(g,12,-16,9,'#ffb347');poly(g,[10,-24,14,-16,20,-20,15,-12],'#e0453a',{lw:.7});});
// трофеи (если у tro нет своего рисунка): мешочек
art('sl_tro',48,g=>{shp(g,'#a8733d',{hl:.35},[-14,-8,14,16],()=>{g.moveTo(-6,-8);g.quadraticCurveTo(-16,2,-12,12);g.quadraticCurveTo(0,18,12,12);g.quadraticCurveTo(16,2,6,-8);g.closePath();});
  ln(g,[-7,-8,7,-8],'#e6b53a',2.4);poly(g,[-4,-9,-8,-16,0,-12,8,-16,4,-9],'#8a5a2e',{lw:.7});ell(g,0,4,4,4,'#f2c230',{hl:.6,lw:.6});});

/* ---------- для проверки на своей машине: SLAVA.xp(n), SLAVA.day(n) ---------- */
const SLAVA={on:SL_ON,open:openSlava,lv:()=>SL()&&slLv(SL().x),
  xp(n){if(!LOCAL||!SL())return;slAddXp(n,'dev');slTouch();save();},
  pts(n){if(!LOCAL||!SL())return;const q=slSaga();q.p+=n;sagaDay(q);q.dp+=n;if(sagaUd(q))q.u+=n;slTouch();save();}};
