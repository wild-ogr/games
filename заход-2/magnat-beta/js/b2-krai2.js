/* b2-krai2.js — KRAI2: края №4 Сахалин (sah), №5 Алтай (alt), финал «Корпорация» (corp). Стартовый файл потока «krai2». Журнал — logs/KRAI2.md.
   Данные краёв — в разделе KRAI2 файла js/b2-krai-data.js (формат KRAI v1 + поля rule.ss/s0/tip). Здесь только:
   KRAI2.sea(W,D) — сезон края по rule.ss (строка правила и плашка карты в b2-krai-ui.js, крючки /* b2-krai2 *\/);
   советы Людмилы: «распутица близко — склад или кредит» (край с правилом sale, Якутия) и rule.tip по месяцам; текст новостей событий края (ev).
   Флаг B2.off.krai2: выкл. — новых краёв нет в выборе (данные: no=0), советов нет; сезонные строки остаются (миры краёв играют как были). */
(function(root){'use strict';
const B2=root.B2;
const T=(r,e)=>typeof L==='function'?L(r,e):r,t2=a=>a?T(a[0],a[1]):'',mo=W=>((W.m%12)+12)%12;
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const K2=root.KRAI2={v:1};
// сезон: {c (класс строки), h (строка правила), lb (плашка карты), dk (тёмное небо)}
K2.sea=function(W,D){const R=D&&D.rule;if(!R||!R.ss)return null;const of=m=>R.ss.find(x=>x.m.indexOf(m)>=0)||R.s0,m=mo(W),cur=of(m);
  let n=0,mm=m;while(n<12&&of(mm)===cur){mm=(mm+1)%12;n++;}const nx=of(mm);
  const un=n>=12?'':T(` до 1 ${MONG[mm]}`,` until ${MON[mm]} 1`),then=n>=12||!nx||nx===cur?'':` ${T('Дальше','Next')}: ${nx.ico} ${t2(nx.n).toLowerCase()}.`;
  return {c:cur===R.s0?'':cur.dk?'cl':'op',dk:!!cur.dk,lb:`${cur.ico} ${t2(cur.n)}`,h:`${cur.ico} <b>${t2(cur.n)}</b>${un}: ${t2(cur.t)}.${then}`};};
if(!B2||B2.off('krai2'))return;
const E=root.ECON,KR=()=>root.KRAI&&root.KRAI.on&&root.KRAI.on()?root.KRAI.cur():null;
/* ---- советы Людмилы ---- */
if(E&&E.advise&&!E.advise.k2){const a0=E.advise;E.advise=function(W){const o=a0.apply(this,arguments);try{const P=W&&W.ned&&KR();if(!P)return o;const m=mo(W),R=P.D.rule||{};
    // распутица через месяц: сколько добудем, пока вывоза нет, и хватит ли склада
    const S=P.sale;if(S&&S.open.indexOf(m)>=0&&S.open.indexOf((m+1)%12)<0){let len=0;while(len<12&&S.open.indexOf((m+1+len)%12)<0)len++;
      for(const r of S.r){let q=0;for(const x of W.obj){const O=E.OBJ[x.t];if(x.r===r&&x.st==='w'&&!x.off&&O.dep&&!(S.free&&S.free.indexOf(O.out)>=0))q+=E.objCap(x);}
        if(q<=0)continue;const room=Math.max(0,E.storR(W,r)-E.stockR(W,r)),need=Math.round(q*len-room);
        o.push({k:'kr_mud',pri:52,a:{r,len,q:Math.round(q*len),room:Math.round(room),need:Math.max(0,need),n:Math.max(0,Math.ceil(need/((E.OBJ.store&&E.OBJ.store.stor)||30000)))}});break;}}
    (R.tip||[]).forEach((x,i)=>{if(x.m.indexOf(m)>=0&&(!x.o||W.obj.some(b=>x.o.indexOf(b.t)>=0&&b.st==='w')))o.push({k:'kr_tip',pri:45,a:{id:P.id,i}});});
    o.sort((a,b)=>b.pri-a.pri);}catch(e){}return o;};E.advise.k2=1;}
const M=v=>root.FMT?FMT.money(v):Math.round(v)+' ₽',Q=(q,g)=>root.FMT?FMT.qty(q,g):String(Math.round(q)),RG=r=>root.NM?NM.reg(r):r;
const mn=n=>T(n+' '+(n%10===1&&n%100!==11?'месяц':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'месяца':'месяцев'),n+(n===1?' month':' months'));
function advTxt(it){const a=it.a||{};
  if(it.k==='kr_mud'){const st=E.OBJ.store,lead=T(`Через месяц распутица: ${mn(a.len)} из района ${RG(a.r)} тяжёлое не вывезти. Рудники за это время дадут ≈ ${Q(a.q,'ore')}, а свободного места на складе — ${Q(a.room,'ore')}.`,
      `The mud season starts next month: for ${mn(a.len)} nothing heavy leaves ${RG(a.r)}. The mines will produce ≈ ${Q(a.q,'ore')} in that time, and the warehouse has room for ${Q(a.room,'ore')}.`);
    if(a.need>0)return lead+' '+T(`Не влезет ≈ ${Q(a.need,'ore')} — рудник встанет. Два выхода: поставить ${a.n>1?a.n+' склада':'склад'} (${M((st?st.capex:40e6)*a.n)}, месяц стройки) или продать запас сейчас, пока дорога открыта. А если денег впритык — короткий кредит переждёт распутицу: потом склад уйдёт по полной цене.`,
      `About ${Q(a.need,'ore')} won’t fit — the mine will stop. Two ways out: build ${a.n>1?a.n+' warehouses':'a warehouse'} (${M((st?st.capex:40e6)*a.n)}, one month) or sell stock now while the road is open. And if cash is tight, a short loan will tide you over: afterwards the stock sells at full price.`);
    return lead+' '+T('Склад вместит, но денег от продаж не будет до конца распутицы — держите запас на зарплаты и проценты или возьмите короткий кредит.','The warehouse will hold it, but no sales money will come until the mud season ends — keep a reserve for wages and interest, or take a short loan.');}
  if(it.k==='kr_tip'){const D=root.KRAI&&KRAI.data(a.id),x=D&&D.rule.tip&&D.rule.tip[a.i];return x?t2(x.t):'';}
  return null;}
function newsTxt(n){if(n.k!=='krai')return null;const P=KR(),e=P&&(P.D.rule.ev||[]).find(x=>x.k===(n.a&&n.a.k));return e?(root.FMT?FMT.mon(n.m)+' · ':'')+'⚡ '+t2(e.n)+'.':'';}
function wrap(){const A=root.ADV;if(!A){if(typeof setTimeout==='function'&&typeof document!=='undefined')setTimeout(wrap,400);return;}if(A.__k2)return;A.__k2=1;
  const t0=A.text,n0=A.news;A.text=function(it){const x=it&&advTxt(it);return x!=null?x:t0.apply(this,arguments);};A.news=function(n){const x=n&&newsTxt(n);return x!=null?x:n0.apply(this,arguments);};}
wrap();
})(typeof window!=='undefined'?window:globalThis);
