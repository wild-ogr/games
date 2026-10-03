/* ================= «Из ларька в магнаты: бизнес» — рынок, финансы, советник (FIN, ADV) =================
   Зона UI-2. Экраны рисуются в переданный элемент: FIN.renderMarket(el[, 'px'|'con']), FIN.renderFin(el[, 'sum'|'rep'|'bank'|'riv']).
   FIN.openReport(m) — окно с отчётами месяца m (БДР/ДДС/Баланс). FIN.refresh() — перерисовать то, что сейчас на экране.
   ADV — тексты главбуха Людмилы Санны: ADV.text(item), ADV.month(rep), ADV.news(n), ADV.ev(a).
   Свой CSS — в <style id="finCss">. Суммы в таблицах и графиках — в единице по размеру чисел этой таблицы/графика (FMT.unitOf → FMT.inU, подпись FMT.uName); одиночные суммы — FMT.money, количества — FMT.qty. */
(function(){
'use strict';
const E=ECON;
const Wd=()=>GAME.W;
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const num=(x,d)=>FMT.num(x,d);
const mm=(x,u)=>{x=Math.round(x||0);return x===0?'—':FMT.inU(x,u);};      // ячейка таблицы в единице u этой таблицы
// единица графика — по тем же числам, что рисуем (подпись, ось и подсказки совпадают)
const hUnit=(hs,ks)=>{const a=[];for(const x of hs||[])for(const k of ks)a.push(x[k]);return FMT.unitOf(a);};
let dThr=5e4;   // изменение меньше — серая стрелка «•»; в главах 1–2 порог меньше (от единицы сумм)
const sgnMoney=x=>(x>0?'+':'')+FMT.money(x);
const setRe=f=>{try{modalRe=f;}catch(e){}};
const snd=k=>{try{typeof SND!=='undefined'&&SND[k]&&SND[k]();}catch(e){}};
const toastS=t=>{try{toast(t);}catch(e){}};
// «📺 Отсрочка по контракту» (+10 дней без штрафа, раз на контракт; модель — ECON.conExt; M31: пауза места — GAME.adWait('con'), дневного лимита нет)
function conAdOk(w,c){try{return typeof adOk==='function'&&adOk()&&!!ECON.conExtOk&&ECON.conExtOk(w,c.id);}catch(e){return false;}}
const conW=()=>{try{return GAME.adWait('con')>0;}catch(e){return false;}};
const INPUTS=(()=>{const s={};for(const t in E.OBJ){const i=E.OBJ[t].in;if(i)for(const g in i)s[g]=1;}return s;})();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

/* ---------------- падежи для фраз ---------------- */
const REG_IN={kuz:['в Кузбассе','in Kuzbass'],ural:['на Урале','in the Urals'],kar:['в Карелии','in Karelia']};
const REG_FROM={kuz:'из Кузбасса',ural:'с Урала',kar:'из Карелии'},REG_TO={kuz:'в Кузбасс',ural:'на Урал',kar:'в Карелию'};
const regIn=r=>REG_IN[r]?L(REG_IN[r][0],REG_IN[r][1]):NM.reg(r);
const rIn=(r,i)=>REG_IN[r]?REG_IN[r][i]:(i?'in ':'в регионе ')+NM.reg(r);
const G_ACC={coal:'уголь',ore:'руду',lime:'известняк',wood:'лес',lumber:'пиломатериалы',pig:'чугун',steel:'сталь',roll:'прокат',cuore:'медную руду',cucon:'медный концентрат',cu:'медь',wire:'кабель'};
const G_GEN={coal:'угля',ore:'руды',lime:'известняка',wood:'леса',lumber:'пиломатериалов',pig:'чугуна',steel:'стали',roll:'проката',cuore:'медной руды',cucon:'медного концентрата',cu:'меди',wire:'кабеля'};
const gAcc=g=>en()?NM.good(g).toLowerCase():(G_ACC[g]||NM.good(g));
const gGen=g=>en()?NM.good(g).toLowerCase():(G_GEN[g]||NM.good(g));
const oLow=t=>{const s=NM.obj(t);return en()?s:s.charAt(0).toLowerCase()+s.slice(1);};
const low1=t=>t.charAt(0).toLowerCase()+t.slice(1);
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------------- значки товаров (свои SVG) ---------------- */
const ICO={
  coal:'<path d="M5 25l5-10 7-3 6 4 5-2 4 8-3 7-10 2-9-1z" fill="#2b2b2b"/><path d="M10 15l7-3 2 6-6 3z" fill="#555"/><path d="M23 16l5-2 2 5-5 1z" fill="#444"/>',
  ore:'<path d="M4 24l6-11 9-4 9 5 4 9-6 8H10z" fill="#8a4b32"/><circle cx="14" cy="18" r="2" fill="#c9a07a"/><circle cx="22" cy="23" r="2.2" fill="#5a2d1c"/><circle cx="24" cy="15" r="1.6" fill="#c9a07a"/>',
  lime:'<path d="M5 14l8-6h14l5 6v14H5z" fill="#d9d4c7" stroke="#a39d8e" stroke-width="1.5"/><path d="M5 14h27M13 8v6" stroke="#a39d8e" stroke-width="1.5"/>',
  wood:'<rect x="4" y="12" width="22" height="13" rx="3" fill="#9c6b3c"/><ellipse cx="27" cy="18.5" rx="5.5" ry="6.5" fill="#e0b77f" stroke="#7a4f27" stroke-width="1.4"/><ellipse cx="27" cy="18.5" rx="2.4" ry="3" fill="none" stroke="#b58449" stroke-width="1.2"/>',
  lumber:'<rect x="4" y="9" width="28" height="5" fill="#e3b574" stroke="#9c6b3c"/><rect x="4" y="15.5" width="28" height="5" fill="#d9a862" stroke="#9c6b3c"/><rect x="4" y="22" width="28" height="5" fill="#e3b574" stroke="#9c6b3c"/>',
  pig:'<path d="M5 26l4-11h18l4 11z" fill="#4b4f55"/><path d="M9 15h18l-2-4H11z" fill="#6c7178"/>',
  steel:'<path d="M5 26l4-11h18l4 11z" fill="#7d93a8"/><path d="M9 15h18l-2-4H11z" fill="#a9bccd"/><path d="M12 19h10" stroke="#e8f0f7" stroke-width="2" stroke-linecap="round"/>',
  roll:'<circle cx="18" cy="18" r="13" fill="#5c7a96"/><circle cx="18" cy="18" r="9" fill="none" stroke="#88a3bb" stroke-width="1.5"/><circle cx="18" cy="18" r="5" fill="#eef1f4" stroke="#3e5670" stroke-width="1.5"/>'};
ICO.cuore='<path d="M4 24l6-11 9-4 9 5 4 9-6 8H10z" fill="#6b5a4a"/><circle cx="13" cy="18" r="2.4" fill="#3fae8c"/><circle cx="22" cy="23" r="2" fill="#2e8b6e"/><circle cx="24" cy="14.5" r="1.8" fill="#d98a4a"/>';
ICO.cucon='<path d="M3 29c3-9 8-15 15-15s12 6 15 15z" fill="#a8643a"/><path d="M11 21c2-3 4-4 7-4" stroke="#d8955f" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="23" cy="23" r="1.2" fill="#6e3d1f"/><circle cx="15" cy="25" r="1.2" fill="#6e3d1f"/>';
ICO.cu='<path d="M12 4h12v5H12z" fill="#7d5a3c"/><rect x="6" y="9" width="24" height="23" rx="2" fill="#c8733a"/><path d="M9 13h18" stroke="#eba36e" stroke-width="2"/><path d="M11 18v10M18 18v10M25 18v10" stroke="#a85b2a" stroke-width="1.2"/>';
ICO.wire='<circle cx="18" cy="18" r="13" fill="#2f3a45"/><circle cx="18" cy="18" r="10" fill="none" stroke="#e08a3c" stroke-width="3"/><circle cx="18" cy="18" r="5.5" fill="none" stroke="#c8733a" stroke-width="2.5"/><circle cx="18" cy="18" r="2" fill="#eef1f4"/><path d="M29 22c3 2 4 5 4 9" stroke="#e08a3c" stroke-width="3" fill="none" stroke-linecap="round"/>';
const icon=(g,s)=>`<svg class="f-ico" width="${s||36}" height="${s||36}" viewBox="0 0 36 36" aria-hidden="true">${ICO[g]||''}</svg>`;

/* ---------------- CSS ---------------- */
const CSS=`
/* стиль Г «Лёгкость»: переменные — из css/theme.css (UI-1), здесь только запасные значения */
.fin{font-size:var(--fs,17px);color:var(--ink,#0e1320);line-height:1.35;padding-bottom:12px;letter-spacing:-.005em}
.fin *{box-sizing:border-box}
.fin h3,.f-sec{font-size:16px;font-weight:600;margin:22px 4px 10px;color:var(--ink,#0e1320)}
.f-num,.f-kpi .kv,.f-rr .cv,.f-kv b,.f-big,.f-pr{font-family:var(--numfont,inherit);font-variant-numeric:tabular-nums;letter-spacing:var(--numls,-.01em)}
.f-tabs{display:grid;grid-template-columns:repeat(2,1fr);padding:4px;border-radius:14px;background:var(--segbg,#eef0f4);margin:4px 0 14px}
.f-tabs.n3{grid-template-columns:repeat(3,1fr)}.f-tabs.n4{grid-template-columns:repeat(4,1fr)}
.f-tab{min-height:46px;border:0;background:none;color:var(--muted,#667085);border-radius:11px;font:inherit;font-size:16px;font-weight:600;padding:2px 4px;cursor:pointer;line-height:1.15}
.f-tab.on{background:var(--segon,var(--card,#fff));color:var(--segonc,var(--ink,#0e1320));box-shadow:0 1px 3px rgba(16,24,40,.14)}
.f-card{background:var(--card,#fff);border-radius:20px;padding:16px;margin:0 0 12px;box-shadow:var(--sh,0 1px 2px rgba(16,24,40,.04),0 6px 24px rgba(16,24,40,.06));border:0}
.f-mut{color:var(--muted,#667085);font-size:15px}
.f-note{color:var(--muted,#667085);font-size:15px;margin:6px 4px 12px}
.f-good .f-gh{display:grid;grid-template-columns:48px 1fr auto;grid-gap:10px;gap:10px;align-items:center}
.f-ico{display:block}
.f-good .f-gh>.f-ico,.f-icw{width:48px;height:48px;border-radius:50%;background:var(--icbg,#f2f4f7);padding:6px}
.f-gn b{display:block;font-size:18px;font-weight:600}
.f-pr{font-size:19px;font-weight:600}
.f-ch{font-size:15px;font-weight:600;white-space:nowrap}
.f-up{color:var(--good,#12a150)}.f-dn{color:var(--bad,#e5484d)}.f-eq{color:var(--muted,#667085)}
.f-gs{margin:10px 0 2px;font-size:16px}.f-gs b{font-weight:600}
.f-b2{display:grid;grid-template-columns:1fr 1fr;grid-gap:8px;gap:8px;margin-top:10px}
.f-b1{display:grid;grid-template-columns:1fr;margin-top:10px}
.fin .btn{min-height:50px;width:100%;margin:0}
.f-sw{display:grid;grid-template-columns:1fr auto;align-items:center;width:100%;min-height:50px;margin-top:10px;border:0;background:var(--icbg,#f2f4f7);border-radius:14px;font:inherit;font-size:16px;color:var(--ink,#0e1320);padding:4px 12px;text-align:left;cursor:pointer}
.f-sw i{font-style:normal;font-weight:600;padding:4px 12px;border-radius:10px;background:var(--good,#12a150);color:#fff;margin-left:8px}
.f-sw i.off{background:var(--muted,#667085)}
.f-bar{height:8px;border-radius:4px;background:var(--track,#e4e7ec);overflow:hidden;margin:10px 0 6px}
.f-bar i{display:block;height:100%;background:var(--accent,#2e5bff);border-radius:4px}
.f-kv{display:grid;grid-template-columns:1fr auto;grid-gap:6px 10px;gap:6px 10px;margin:10px 0;font-size:16px}
.f-kv b{text-align:right;white-space:nowrap;font-weight:600}
.f-big{font-size:28px;font-weight:600;text-align:center;margin:8px 0 4px}
.f-rng{width:100%;height:40px;margin:4px 0;accent-color:var(--accent,#2e5bff)}
.f-chips{display:grid;grid-template-columns:repeat(3,1fr);grid-gap:6px;gap:6px;margin:4px 0 10px}
.f-chips.n4{grid-template-columns:repeat(4,1fr)}.f-chips.n2{grid-template-columns:repeat(2,1fr)}
.f-chip{min-height:48px;border:0;background:var(--icbg,#f2f4f7);border-radius:12px;font:inherit;font-size:16px;font-weight:600;color:var(--ink,#0e1320);cursor:pointer;padding:2px}
.f-chip.on{background:var(--accent,#2e5bff);color:#fff}
.f-chip[disabled]{opacity:.4}
.f-chip small{display:block;font-size:14px;font-weight:500;opacity:.8;line-height:1.1}
.f-leg{display:flex;flex-wrap:wrap;font-size:15px;color:var(--muted,#667085);margin:6px 0 4px}
.f-leg span{margin:0 14px 4px 0;white-space:nowrap}
.f-leg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:1px}
.f-leg i.ln{width:14px;height:4px;border-radius:2px;vertical-align:3px}
.f-ch2{width:100%;overflow:hidden}
.f-ok{color:var(--good,#12a150);font-weight:600;margin:10px 4px}
.f-bad{color:var(--bad,#e5484d);font-weight:600;margin:10px 4px}
.f-tip{background:var(--icbg,#f2f4f7);border-radius:14px;padding:12px 14px;margin:12px 0;font-size:16px;color:var(--ink,#0e1320)}
.f-warn{background:rgba(229,72,77,.08);border-radius:14px;padding:12px 14px;margin:12px 0;font-size:16px}
.f-riv{display:grid;grid-template-columns:14px 1fr auto;grid-gap:10px;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line,#eceef2)}
.f-riv .dot{width:12px;height:12px;border-radius:50%}
.f-riv b{display:block;font-weight:600}.f-riv small{display:block;color:var(--muted,#667085);font-size:14px}
.f-riv .v{text-align:right;font-weight:600;white-space:nowrap}.f-riv .v small{font-weight:400}
.f-riv.me{background:var(--key,#f3f6ff);border-radius:12px;padding-left:6px;padding-right:6px}
.f-met{display:block;width:100%;text-align:left;font:inherit;color:inherit;background:none;border:0;border-bottom:1px solid var(--line,#eceef2);padding:12px 2px;min-height:50px;cursor:pointer}
.f-met div{display:grid;grid-template-columns:1fr auto;grid-gap:8px;gap:8px;align-items:center}.f-met b{font-weight:600;font-size:18px}
.f-met.on{background:var(--sub,#fafbfc)}
.f-met small{display:block;color:var(--muted,#667085);font-size:15px;margin-top:6px;line-height:1.35}
.f-q{display:inline-block;font-style:normal;width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;background:var(--icbg,#f2f4f7);color:var(--muted,#667085);font-size:14px;font-weight:600;margin-left:4px}
.f-new{display:inline-block;font-style:normal;background:var(--bad,#e5484d);color:#fff;border-radius:9px;padding:1px 7px;font-size:13px;font-weight:600;margin-left:4px;vertical-align:1px}
.f-hdr{display:grid;grid-template-columns:1fr auto;align-items:baseline;grid-gap:8px;gap:8px}
.f-rp{font-size:15px;margin:2px 0 0}.f-rp span{display:inline-block;margin:0 10px 2px 0;white-space:nowrap;color:var(--muted,#667085)}.f-rp span.me{font-weight:600;color:var(--ink,#0e1320)}.f-rp i{font-style:normal}
.f-pro{font-size:17px;line-height:1.45;margin:8px 0}.f-pro b{white-space:nowrap;font-weight:600}
.f-proq{font:inherit;font-size:16px;font-weight:600;display:inline-block;box-sizing:border-box;vertical-align:middle;color:var(--accent,#2e5bff);background:var(--icbg,#f2f4f7);border:0;border-radius:10px;padding:2px 14px;min-height:48px;min-width:48px;margin:4px 0 0 6px;cursor:pointer}
.f-prox{font-size:16px;color:var(--ink,#0e1320);background:var(--icbg,#f2f4f7);border-radius:12px;padding:8px 12px;margin-top:6px}.f-prox p{margin:4px 0}
/* заголовок экрана и «назад» */
.f-top{display:flex;align-items:center;margin:2px 0 14px}
.f-back{flex:none;height:48px;padding:0 14px;margin-right:12px;border:0;border-radius:14px;background:var(--card,#fff);color:var(--accent,#2e5bff);font:inherit;font-size:17px;font-weight:600;box-shadow:var(--sh,0 1px 2px rgba(16,24,40,.04),0 6px 24px rgba(16,24,40,.06));cursor:pointer;white-space:nowrap}
.f-tt{min-width:0}.f-ttl{font-size:26px;font-weight:700;letter-spacing:-.025em;line-height:1.15}.f-ttl .ab{font-size:14px;font-weight:600;color:var(--muted,#667085);background:var(--icbg,#f2f4f7);border-radius:8px;padding:3px 8px;vertical-align:middle;letter-spacing:0}
.f-sub{color:var(--muted,#667085);font-size:15px;margin-top:2px}
/* главбух */
.f-say{display:flex;align-items:flex-start}.f-say .pp{flex:none;width:64px;height:64px;margin-right:14px;border-radius:50%;background:var(--icbg,#f2f4f7);overflow:hidden}.f-say .pp svg{width:64px;height:64px;display:block}
.f-say .st{flex:1;min-width:0;font-size:17px}.f-say .sn{font-size:14px;font-weight:600;color:var(--muted,#667085);margin-bottom:2px}
/* карточки итогов */
.f-kpis{display:flex;flex-wrap:wrap;margin:-5px -5px 7px}
.f-kpi{display:block;width:calc(50% - 10px);margin:5px;text-align:left;font:inherit;color:inherit;cursor:pointer;padding:14px 14px 10px;min-height:150px}
.f-kpi .kl{font-size:15px;font-weight:500;color:var(--muted,#667085)}
.f-kpi .kv{font-size:24px;font-weight:600;letter-spacing:-.02em;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.f-kpi .kd{font-size:14px;font-weight:500;margin-top:2px}
.f-kpi .spk{margin-top:8px;height:36px}.f-kpi .spk svg{width:100%;height:36px}
.f-kpi.hot{box-shadow:var(--sh,0 1px 2px rgba(16,24,40,.04),0 6px 24px rgba(16,24,40,.06)),0 0 0 2px var(--accent,#2e5bff)}
/* список-входы */
.f-lst{padding:4px 0}
.f-lst button{display:flex;align-items:center;width:100%;min-height:72px;padding:12px 16px;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.f-lst button+button{border-top:1px solid var(--line,#eceef2)}
.f-lst button.sel{background:var(--key,#f3f6ff)}
.f-lst .lic{flex:none;width:48px;height:48px;border-radius:50%;background:var(--icbg,#f2f4f7);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;color:var(--ink,#0e1320)}
.f-lst button.sel .lic{background:var(--accent,#2e5bff);color:#fff}
.f-lst .lic svg{width:26px;height:26px}
.f-lst .li{flex:1;min-width:0;margin-left:14px}.f-lst .li b{display:block;font-size:18px;font-weight:600}.f-lst .li span{display:block;font-size:15px;color:var(--muted,#667085)}
.f-lst .li .v2{color:var(--ink,#0e1320);margin-top:4px;font-size:16px}.f-lst .li .v2 b{display:inline;font-size:17px}
.f-lst .chev{font-size:26px;color:var(--muted,#667085);margin-left:8px}
/* переключатель месяцев */
.f-msw{display:flex;align-items:center;justify-content:space-between;padding:6px;touch-action:pan-y}
.f-msw button{width:56px;height:52px;border:0;border-radius:14px;background:var(--icbg,#f2f4f7);font-size:20px;color:var(--ink,#0e1320);cursor:pointer;flex:none}
.f-msw button[disabled]{opacity:.3}
.f-msw div{text-align:center;min-width:0}.f-msw b{display:block;font-size:19px;font-weight:600}.f-msw span{font-size:15px;color:var(--muted,#667085)}
/* строки отчёта: на телефоне название — строкой, под ним крупные числа */
.f-rt{padding:0;overflow:hidden;touch-action:pan-y}
.f-rh{display:flex;font-size:15px;font-weight:500;color:var(--muted,#667085);padding:10px 14px;border-bottom:1px solid var(--line,#eceef2)}
.f-rh .c0{flex:1}.f-rh .cv,.f-rr .cv{width:84px;text-align:right;flex:none}
.f-rr{display:block;width:100%;text-align:left;font:inherit;color:inherit;background:none;border:0;padding:10px 14px;border-bottom:1px solid var(--line,#eceef2)}
.f-rr[data-a]{cursor:pointer}
.f-rr .rn{font-size:16px}
.f-rr .rv{display:flex;margin-top:2px}.f-rr .rv .c0{flex:1}
.f-rr .cv{font-size:18px;font-weight:600;white-space:nowrap}.f-rr .cv.p{color:var(--muted,#667085);font-weight:400}
.f-rr.s .cv.neg:not(.p),.f-rr.b .cv.neg:not(.p){color:var(--bad,#e5484d)}
.f-rr.s{background:var(--sub,#fafbfc)}.f-rr.s .rn{font-weight:600}
.f-rr.b{background:var(--key,#f3f6ff)}.f-rr.b .rn{font-weight:600}.f-rr.b .cv{font-size:19px}
.f-rr.n .rn{font-weight:500}
.f-rr.h{font-weight:600;font-size:15px;color:var(--ink,#0e1320);padding-top:16px;border-bottom:0}
.f-rr .tg{display:inline-block;margin-left:6px;color:var(--muted,#667085);font-style:normal;font-size:13px;font-weight:600;width:20px;height:20px;line-height:20px;text-align:center;border-radius:50%;background:var(--icbg,#f2f4f7)}
.f-rr .exp{font-size:15px;color:var(--muted,#667085);margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--bg,#f5f6f8)}
@media (min-width:600px){.f-rr{display:flex;align-items:center;flex-wrap:wrap}.f-rr .rn{flex:1;min-width:0}.f-rr .rv{margin-top:0}.f-rr .rv .c0{display:none}.f-rr .exp{flex-basis:100%}}
.f-nxt{display:block;width:100%;text-align:left;font:inherit;color:inherit;border:0;cursor:pointer;padding:16px 18px}.f-nxt span{display:block;color:var(--muted,#667085);font-size:15px}.f-nxt b{font-size:18px;font-weight:600;color:var(--accent,#2e5bff)}
/* водопад и мост */
.f-wf .wr{padding:7px 0}.f-wf .wl{display:flex;font-size:16px}.f-wf .wl b{margin-left:auto;font-weight:600;white-space:nowrap;padding-left:10px}
.f-wf .wb{position:relative;height:10px;margin-top:5px;background:var(--bg,#f5f6f8);border-radius:5px}.f-wf .wb i{position:absolute;top:0;height:10px;border-radius:5px;min-width:4px}
.f-brg .br{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--line,#eceef2);font-size:16px}.f-brg .br b{font-size:18px;font-weight:600;white-space:nowrap;padding-left:10px}.f-brg .br.tot{border-bottom:0;font-weight:600}
/* колонки на ПК */
.f-cols{display:flex;align-items:flex-start}.f-cols>.col{flex:1;min-width:0}.f-cols>.col+.col{margin-left:18px}.f-cols>.col.w2{flex:1.45}.f-cols>.col.w08{flex:.8}
.f-wide .f-kpi{width:calc(25% - 10px)}
.f-wide .f-rl .li>span:not(.v2){display:none}.f-wide .f-msw span{display:none}.f-wide .f-cols>.col.w08{flex:1}
.f-ich{position:relative;touch-action:none;-ms-touch-action:none;-webkit-user-select:none;user-select:none;cursor:crosshair;-webkit-tap-highlight-color:transparent;outline:none}
.f-ich svg{display:block}.f-ich:focus-visible{box-shadow:0 0 0 3px var(--accent,#2e5bff);border-radius:6px}
.f-cur{position:absolute;top:0;bottom:0;width:0;border-left:2px solid var(--ink,#0e1320);opacity:.5;display:none;pointer-events:none}
.f-ich.sm{padding:2px;border-radius:10px;background:var(--sub,#fafbfc)}
#finTip{position:fixed;z-index:60;display:none;pointer-events:none;background:var(--ink,#0e1320);color:var(--card,#fff);border-radius:12px;padding:8px 12px;font-size:16px;line-height:1.35;max-width:300px;box-shadow:0 8px 24px rgba(16,24,40,.25);font-family:inherit}
#finTip b{font-size:17px;font-weight:600}#finTip div{white-space:nowrap}#finTip i{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:6px;border:1px solid rgba(255,255,255,.6)}
#finTip .t-up{color:var(--tip-up,#6ee7a0);font-weight:600}#finTip .t-dn{color:var(--tip-dn,#ff9a9d);font-weight:600}#finTip .t-mut{opacity:.8;font-size:15px}
#finTip .t-mk{white-space:normal;margin-top:4px;font-size:15px;max-width:276px}
.f-st3{display:grid;grid-template-columns:repeat(3,1fr);grid-gap:6px;gap:6px;margin:4px 0 10px}
.f-st3 div{background:var(--icbg,#f2f4f7);border-radius:14px;padding:8px 6px;text-align:center}
.f-st3 span{display:block;font-size:14px;color:var(--muted,#667085)}.f-st3 b{display:block;font-size:17px;font-weight:600;line-height:1.2;margin-top:2px;word-break:break-word}
#finBig h2,#finRep h2{margin-top:0}
@supports not (inset:0){.f-leg span{margin-right:14px}}
`;
function css(){chartEvents();if(document.getElementById('finCss'))return;const s=document.createElement('style');s.id='finCss';s.textContent=CSS;document.head.appendChild(s);}

/* ---------------- состояние экранов ---------------- */
const st={mt:'px',r:'kuz',fv:'sum',rn:12,hx:null,rm:null,rk:'pl',exp:false,la:null,ln:24,lk:'ann',lg:0};
let lastM=null,lastF=null;
const tabs=(list,cur,key)=>`<div class="f-tabs n${list.length}">`+list.map(([id,t])=>`<button class="f-tab${id===cur?' on':''}" data-a="tab" data-k="${key}" data-v="${id}">${t}</button>`).join('')+'</div>';
const vis=el=>!!(el&&el.isConnected&&el.offsetParent!==null);
const wOf=el=>{let w=el&&el.clientWidth;if(w){const cs=getComputedStyle(el);w-=(parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0);}return Math.max(260,Math.min(1100,(w||Math.min(innerWidth,700)-24)-2));};

/* ---------------- графики: рисование и «просмотр» (ведите пальцем/мышью — линия и подпись; нажатие — крупно) ----------------
   Каждый график — спецификация sp = {title, kind:'line'|'bar', lbl:[месяцы], cur (последняя точка — «сейчас»), ser:[{name,col,v,fmt,chg,w}],
   zero, marks:[{i,g,t}], ref:{v,t}, si (главный ряд для мин/макс/средней)}, её строит функция mk(n) (n — месяцев, 0 — вся история).
   Цвета — только CSS-переменные (ребрендинг): CV. */
const CV={grid:'var(--line,#eceef2)',axis:'var(--muted,#98a2b3)',txt:'var(--muted,#667085)',rev:'var(--c1,var(--accent,#2e5bff))',np:'var(--c2,var(--ink,#0e1320))',good:'var(--good,#12a150)',bad:'var(--bad,#e5484d)',
  cash:'var(--accent,#2e5bff)',eq:'var(--gold,#c8773a)',debt:'var(--muted,#98a2b3)',cost:'var(--gold,#c8773a)',ink:'var(--ink,#0e1320)'};
const botCol=id=>{const d=E.BOTS.find(x=>x.id===id)||{};return `var(--bot-${id},${d.col||'#888'})`;};
function ticks(mn,mx){if(mn===mx){mx=mn+1;}const raw=(mx-mn)/4,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p,step=(f<1.5?1:f<3?2:f<7?5:10)*p;
  const lo=Math.floor(mn/step+1e-9)*step,hi=Math.ceil(mx/step-1e-9)*step,t=[];for(let v=lo;v<=hi+step/2;v+=step)t.push(Math.round(v/step)*step);return {lo,hi,t,step};}
const tickLbl=(v,step)=>num(v,step<1?(step<.1?2:1):0);
const colOf=(s,v)=>typeof s.col==='function'?s.col(v):s.col;
function draw(sp,w,H,o){o=o||{};const sm=!!o.spark,n=sp.lbl.length,bar=sp.kind==='bar',mk=sm?[]:(sp.marks||[]);
  let mn=Infinity,mx=-Infinity;for(const s of sp.ser)for(const v of s.v)if(v!=null){mn=Math.min(mn,v);mx=Math.max(mx,v);}
  if(sp.ref&&!sm){mn=Math.min(mn,sp.ref.v);mx=Math.max(mx,sp.ref.v);}
  if(!isFinite(mn)){mn=0;mx=1;}if(sp.zero||bar){mn=Math.min(0,mn);mx=Math.max(0,mx);}
  let T;if(sm){const pad=(mx-mn)*.1||Math.abs(mx)*.03||1;T={lo:mn-pad,hi:mx+pad,t:[],step:1};}else T=ticks(mn,mx);
  const fs=o.big?16:14,lw=sm?0:Math.max(40,8+fs*.62*Math.max(...T.t.map(v=>tickLbl(v,T.step).length))),pl=sm?3:lw,pr=sm?4:10,pt=sm?5:(mk.length?26:10),pb=sm?5:fs+18;
  const y=v=>pt+(T.hi-v)/(T.hi-T.lo)*(H-pt-pb),gw=(w-pl-pr)/Math.max(1,n);
  const x=i=>bar?pl+gw*i+gw/2:(n<2?pl+(w-pl-pr)/2:pl+2+i/(n-1)*(w-pl-pr-4));
  let s=`<svg width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" font-family="inherit" aria-hidden="true">`;
  if(!sm){for(const v of T.t)s+=`<line x1="${pl}" x2="${w-pr}" y1="${y(v)}" y2="${y(v)}" style="stroke:${v===0?CV.axis:CV.grid}" stroke-width="${v===0?1.5:1}"/><text x="${pl-6}" y="${y(v)+5}" text-anchor="end" font-size="${fs}" style="fill:${CV.txt}">${tickLbl(v,T.step)}</text>`;
    const every=Math.max(1,Math.ceil(n/Math.max(1,Math.floor((w-pl)/(fs*4.6)))));
    for(let i=0;i<n;i++)if((n-1-i)%every===0){const xi=x(i),t=sp.cur&&i===n-1?L('сейчас','now'):FMT.mon(sp.lbl[i]),an=xi+fs*2>w?'end':xi-fs*2<pl-20?'start':'middle';
      s+=`<text x="${an==='end'?w-2:an==='start'?Math.max(2,xi-8):xi}" y="${H-6}" text-anchor="${an}" font-size="${fs}" style="fill:${CV.txt}">${t}</text>`;}
    for(const m of mk){const xi=x(m.i);s+=`<line x1="${xi}" x2="${xi}" y1="${pt-4}" y2="${H-pb}" style="stroke:${CV.eq}" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7"/><text x="${xi}" y="${pt-8}" text-anchor="middle" font-size="${fs+2}">${m.g}</text>`;}
    if(sp.ref){const yr=y(sp.ref.v);s+=`<line x1="${pl}" x2="${w-pr}" y1="${yr}" y2="${yr}" style="stroke:${CV.cost}" stroke-width="2.5" stroke-dasharray="8 5"/>`;}}
  if(bar){const k=sp.ser.length,bw=Math.min(o.big?28:22,gw*.8/k);
    for(let i=0;i<n;i++){const x0=pl+gw*i+(gw-bw*k)/2;sp.ser.forEach((se,j)=>{const v=se.v[i];if(v==null)return;const y0=y(Math.max(0,v)),y1=y(Math.min(0,v));
      s+=`<rect x="${(x0+j*bw).toFixed(1)}" y="${y0.toFixed(1)}" width="${Math.max(1,bw-1).toFixed(1)}" height="${Math.max(1,y1-y0).toFixed(1)}" style="fill:${colOf(se,v)}" rx="2"/>`;});}}
  else for(const se of sp.ser){let d='',on=false;se.v.forEach((v,i)=>{if(v==null){on=false;return;}d+=(on?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1);on=true;});
    const c=colOf(se,se.v[se.v.length-1]);s+=`<path d="${d}" fill="none" style="stroke:${c}" stroke-width="${sm?2.4:(se.w||3)}" stroke-linejoin="round" stroke-linecap="round"/>`;
    const li=se.v.length-1;if(se.v[li]!=null)s+=`<circle cx="${x(li)}" cy="${y(se.v[li])}" r="${sm?3:4}" style="fill:${c}"/>`;
    if(n===1&&se.v[0]!=null)s+=`<circle cx="${x(0)}" cy="${y(se.v[0])}" r="5" style="fill:${c}"/>`;}
  return {svg:s+'</svg>',geo:{bar,pl,gw,x0:x(0),x1:x(Math.max(0,n-1)),n}};}
const leg=items=>'<div class="f-leg">'+items.map(([c,t,ln])=>`<span><i class="${ln?'ln':''}" style="background:${c}"></i>${t}</span>`).join('')+'</div>';
const CH={};
// коробка графика: key — имя в реестре, mk(n) — спецификация, n — месяцев, w×H — размер, o:{spark,big}
function chartBox(key,mk,n,w,H,o){o=o||{};const sp=mk(n,!!o.big);if(!sp||!sp.lbl.length)return '';CH[key]={mk,sp,n};const d=draw(sp,w,H,o),g=d.geo;
  return `<div class="f-ich${o.spark?' sm':''}" data-ch="${key}" data-w="${w}" data-bar="${g.bar?1:0}" data-pl="${g.pl}" data-gw="${g.gw}" data-x0="${g.x0}" data-x1="${g.x1}" data-n="${g.n}"${o.big?' data-big="1"':''} tabindex="0" role="button" aria-label="${esc(sp.title||'')}">${d.svg}<i class="f-cur"></i></div>`;}
function tipHtml(sp,i){let h=`<b>${sp.cur&&i===sp.lbl.length-1?L('Сейчас','Now')+' · '+FMT.date(sp.lbl[i]):FMT.date(sp.lbl[i])}</b>`;
  for(const s of sp.ser){const v=s.v[i];if(v==null)continue;let c='';
    if(s.chg&&i>0&&s.v[i-1]){const d=v/s.v[i-1]-1,z=Math.abs(d)<.0005;c=` <span class="${z?'':d>0?'t-up':'t-dn'}">${z?'•':d>0?'▲':'▼'} ${FMT.pct(Math.abs(d),1)}</span>`;}
    h+=`<div><i style="background:${colOf(s,v)}"></i>${s.name?esc(s.name)+': ':''}<b>${s.fmt(v)}</b>${c}</div>`;}
  if(sp.ref)h+=`<div class="t-mut">${esc(sp.ref.t)}: ${sp.ser[0].fmt(sp.ref.v)}</div>`;
  for(const m of sp.marks||[])if(m.i===i)h+=`<div class="t-mk">${m.g} ${esc(m.t)}</div>`;
  return h;}
let drag=null,tipT=0,hov=null;
function tipEl(){let t=document.getElementById('finTip');if(!t){t=document.createElement('div');t.id='finTip';document.body.appendChild(t);}return t;}
function hideTip(){const t=document.getElementById('finTip');if(t)t.style.display='none';document.querySelectorAll('.f-cur').forEach(c=>c.style.display='none');hov=null;}
function showAt(box,cx){const R=CH[box.dataset.ch];if(!R)return;const sp=R.sp,r=box.getBoundingClientRect(),k=r.width/(+box.dataset.w||r.width)||1,n=+box.dataset.n,bar=box.dataset.bar==='1';
  const pl=+box.dataset.pl,gw=+box.dataset.gw,x0=+box.dataset.x0,x1=+box.dataset.x1,lx=(cx-r.left)/k;
  let i=bar?Math.floor((lx-pl)/gw):(n<2?0:Math.round((lx-x0)/((x1-x0)||1)*(n-1)));i=clamp(i,0,n-1);
  const px=(bar?pl+gw*(i+.5):(n<2?x0:x0+(x1-x0)*i/(n-1)))*k;
  document.querySelectorAll('.f-cur').forEach(c=>{if(c.parentNode!==box)c.style.display='none';});
  const cur=box.querySelector('.f-cur');if(cur){cur.style.left=(px-1)+'px';cur.style.display='block';}
  const t=tipEl();t.innerHTML=tipHtml(sp,i);t.style.display='block';const tw=t.offsetWidth,th=t.offsetHeight;
  const left=clamp(r.left+px-tw/2,6,Math.max(6,innerWidth-tw-6));let top=r.top-th-8;if(top<6)top=Math.min(r.bottom+8,innerHeight-th-6);
  t.style.left=left+'px';t.style.top=Math.max(6,top)+'px';hov=box;}
function chartEvents(){if(chartEvents.on)return;chartEvents.on=1;
  document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.f-ich');if(!b){if(hov)hideTip();return;}
    drag={b,x:e.clientX,y:e.clientY,t:Date.now(),mv:false,id:e.pointerId};try{b.setPointerCapture(e.pointerId);}catch(x){}clearTimeout(tipT);showAt(b,e.clientX);},{passive:true});
  document.addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id){if(Math.abs(e.clientX-drag.x)>8||Math.abs(e.clientY-drag.y)>8)drag.mv=true;showAt(drag.b,e.clientX);return;}
    if(e.pointerType==='mouse'){const b=e.target.closest&&e.target.closest('.f-ich');if(b)showAt(b,e.clientX);else if(hov)hideTip();}},{passive:true});
  const up=e=>{if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;
    if(e.type==='pointerup'&&!d.mv&&Date.now()-d.t<600&&!d.b.dataset.big){hideTip();snd('tap');openChart(d.b.dataset.ch);return;}
    if(e.pointerType!=='mouse'){clearTimeout(tipT);tipT=setTimeout(hideTip,2500);}};
  document.addEventListener('pointerup',up,{passive:true});document.addEventListener('pointercancel',up,{passive:true});
  document.addEventListener('keydown',e=>{const b=e.target&&e.target.closest&&e.target.closest('.f-ich');if(b&&(e.key==='Enter'||e.key===' ')&&!b.dataset.big){e.preventDefault();e.stopPropagation();openChart(b.dataset.ch);}},true);
  document.addEventListener('scroll',()=>{if(hov&&!drag)hideTip();},true);}
// крупный график в окне: периоды 6 мес / 1 год / всё, мин/макс/средняя, отметки, себестоимость
let bigN=0;
function openChart(key){key=String(key).replace(/#big$/,'');const R=CH[key];if(!R)return;const n0=R.bigN!=null?R.bigN:0;R.bigN=n0;
  const sp0=R.mk(n0,true);if(!sp0)return;
  modal(`<div id="finBig" class="fin"><h2>${esc(sp0.title)}</h2>${sp0.sub?`<p class="f-mut" style="text-align:center;margin-top:-4px">${esc(sp0.sub)}</p>`:''}
    <div class="f-chips">${[[6,L('6 мес.','6 mo')],[12,L('1 год','1 year')],[0,L('всё','all')]].map(([v,t])=>`<button class="f-chip${n0===v?' on':''}" data-n="${v}">${t}</button>`).join('')}</div>
    <div id="fbBody"></div><div class="row"><button class="btn" id="mCancel" data-esc>${L('Закрыть','Close')}</button></div></div>`);
  setRe(()=>openChart(key));
  const box=document.getElementById('finBig'),body=document.getElementById('fbBody');
  const W=Math.max(260,body.clientWidth||300),H=clamp(Math.round(innerHeight*.42),230,360);
  const sp=R.mk(n0,true),si=sp.si||0,ms=sp.ser[si],vals=ms.v.filter(v=>v!=null);let h='';
  if(vals.length){const mn=Math.min(...vals),mx=Math.max(...vals),av=vals.reduce((a,b)=>a+b,0)/vals.length;
    h+=`<div class="f-st3"><div><span>${L('Минимум','Min')}</span><b>${ms.fmt(mn)}</b></div><div><span>${L('Максимум','Max')}</span><b>${ms.fmt(mx)}</b></div><div><span>${L('Среднее','Average')}</span><b>${ms.fmt(av)}</b></div></div>`;
    if(sp.ser.length>1)h+=`<p class="f-mut" style="margin:2px 0 6px">${L('Цифры — по ряду','Figures for')} «${esc(ms.name)}»</p>`;}
  const lg=sp.ser.filter(s=>s.name).map(s=>[colOf(s,1),esc(s.name),sp.kind!=='bar']);if(sp.kind==='bar'&&sp.neg)lg.push([CV.bad,esc(sp.neg)]);
  if(sp.ref)lg.push([CV.cost,esc(sp.ref.t),1]);
  if(lg.length)h+=leg(lg);
  h+=chartBox(key+'#big',R.mk,n0,W,H,{big:true});
  if(sp.ref)h+=`<p class="f-note">${esc(sp.ref.t)}: <b>${ms.fmt(sp.ref.v)}</b>. ${esc(sp.ref.note||'')}</p>`;
  if(sp.marks&&sp.marks.length)h+=`<p class="f-note">⚡ ${L('— событие на рынке,','— market event,')} ▲▼ ${L('— скачок цены больше 8 % за месяц.','— a price jump of over 8% in a month.')}</p>`;
  h+=`<p class="f-note">👆 ${L('Ведите пальцем по графику — увидите цифры по месяцам.','Slide your finger along the chart to see each month.')}</p>`;
  body.innerHTML=h;
  box.querySelectorAll('.f-chip').forEach(b=>b.onclick=()=>{R.bigN=+b.dataset.n;snd('tap');openChart(key);});
  document.getElementById('mCancel').onclick=()=>{hideTip();hideModal();};}

/* ---- спецификации графиков ---- */
function pxHist(w,g){const out=[];for(const h of w.hist)if(h.px&&h.px[g]!=null)out.push({m:h.m,i:h.px[g]});
  const ph=w.mk[g].ph||[];if(out.length<ph.length){out.length=0;ph.forEach((v,j)=>out.push({m:w.m-ph.length+j,i:v}));}
  out.push({m:w.m,i:w.mk[g].i});return out;}
function evMonths(w,g){const ks={};for(const e of E.EVENTS||[])if(e.g&&e.g.indexOf(g)>=0)ks[e.k]=1;const out={};
  for(const r of w.reps)if(r.ev&&ks[r.ev.k])out[r.m]=r.ev;
  for(const n of w.news)if(n.k==='ev'&&n.a&&ks[n.a.k])out[n.m]=n.a;return out;}
function costOf(w,g){let s=0,c=0;const mines=w.obj.filter(o=>o.st==='w'&&E.OBJ[o.t].out===g&&E.OBJ[o.t].dep);
  if(mines.length){for(const o of mines){s+=o.vc;c++;}return {v:s/c,t:L('Ваша себестоимость добычи','Your mining cost'),note:L('Переменная: без постоянных расходов и амортизации.','Variable: excluding fixed costs and depreciation.')};}
  if(w.obj.some(o=>o.st==='w'&&E.OBJ[o.t].out===g)){let q=0,v=0;for(const r of E.REG){const x=w.inv[r][g];if(x){q+=x.q;v+=x.v;}}
    if(q>=1)return {v:v/q,t:L('Ваша себестоимость','Your unit cost'),note:L('Стоимость запаса на складах за единицу: сырьё и передел.','Stock value per unit: materials and processing.')};}
  return null;}
function priceSpec(g,r,n,spark){const w=Wd();if(!w||!w.mk[g])return null;let a=pxHist(w,g);if(n)a=a.slice(-(n+1));
  const k=(E.REGS[r].k&&E.REGS[r].k[g])||1,base=E.GOODS[g].p*k,v=a.map(x=>Math.round(base*x.i)),u=NM.unit(g);
  const up=v[v.length-1]>=v[0],marks=[];
  if(!spark){const ev=evMonths(w,g);a.forEach((x,i)=>{const gl=[],t=[];if(ev[x.m]){gl.push('⚡');t.push(ADV.ev(ev[x.m]));}
      if(i>0){const d=x.i/a[i-1].i-1;if(Math.abs(d)>.08){gl.push(d>0?'▲':'▼');t.push(L('скачок цены','price jump')+' '+(d>0?'+':'−')+FMT.pct(Math.abs(d)));}}
      if(gl.length)marks.push({i,g:gl[0],t:t.join('; ')});});}
  const c=spark?null:costOf(w,g);
  return {title:NM.good(g)+' · '+NM.reg(r),sub:L('Цена за единицу','Price per unit')+', ₽/'+u,kind:'line',lbl:a.map(x=>x.m),cur:true,
    ser:[{name:L('Цена','Price'),col:spark?(up?CV.good:CV.bad):CV.cash,v,chg:true,fmt:x=>num(x)+' ₽/'+u,w:3.5}],marks,ref:c};}
const uFmt=u=>v=>FMT.money(v*u);
function revSpec(n){const w=Wd(),hs=n?w.hist.slice(-n):w.hist,u=hUnit(hs,['rev','np']);return {u,title:L('Выручка и чистая прибыль','Revenue and net profit'),sub:FMT.uName(u)+' '+L('по месяцам','by month'),kind:'bar',lbl:hs.map(x=>x.m),zero:true,neg:L('Убыток','Loss'),
  ser:[{name:L('Выручка','Revenue'),col:CV.rev,v:hs.map(x=>x.rev/u),fmt:uFmt(u)},{name:L('Чистая прибыль','Net profit'),col:v=>v>=0?CV.np:CV.bad,v:hs.map(x=>x.np/u),fmt:uFmt(u)}]};}
function cashSpec(n){const w=Wd(),hs=n?w.hist.slice(-n):w.hist,u=hUnit(hs,['debt','cash','eq']);return {u,title:L('Деньги, капитал и долг','Cash, equity and debt'),sub:FMT.uName(u)+' '+L('на конец месяца','at month end'),kind:'line',lbl:hs.map(x=>x.m),zero:true,si:1,
  ser:[{name:L('Долг','Debt'),col:CV.debt,v:hs.map(x=>x.debt/u),fmt:uFmt(u),w:2.5},{name:L('Деньги','Cash'),col:CV.cash,v:hs.map(x=>x.cash/u),fmt:uFmt(u)},{name:L('Капитал','Equity'),col:CV.eq,v:hs.map(x=>x.eq/u),fmt:uFmt(u)}]};}
function rivSpec(n){const w=Wd();const N=Math.max(1,Math.min(n||72,Math.max(w.hist.length,...w.bots.map(b=>b.v.length))));const lbl=[];for(let i=0;i<N;i++)lbl.push(w.m-N+i);
  const al=a=>{const o=[];for(let i=0;i<N;i++){const j=a.length-N+i;o.push(j>=0?a[j]:null);}return o;};
  // стоимость ботов хранится в млн (b.v), своя — в рублях; единица — по всем линиям графика
  const bv=w.bots.map(b=>al(b.v).map(x=>x==null?null:x*1e6)),yv=al(w.hist.map(x=>x.eq)),u=FMT.unitOf([].concat(yv,...bv)),dv=a=>a.map(x=>x==null?null:x/u);
  const ser=w.bots.map((b,i)=>({name:NM.bot(b.id),col:botCol(b.id),v:dv(bv[i]),fmt:uFmt(u),w:2.5}));
  ser.push({name:L('Вы','You'),col:CV.eq,v:dv(yv),fmt:uFmt(u),w:4});
  return {u,title:L('Стоимость компаний','Company values'),sub:FMT.uName(u)+' '+L('на конец месяца','at month end'),kind:'line',lbl,si:ser.length-1,ser};}

/* ================= РЫНОК ================= */
function stockHtml(w,r,g){const tot=stockAll(w,g),here=w.inv[r][g].q;return tot>=1?`${L('На складах','In stock')}: <b>${FMT.qty(tot,g)}</b>, ${regIn(r)}: <b>${FMT.qty(here,g)}</b>`:'';}   // M30: без «На складах нет» у каждой строки
function stockAll(w,g){let s=0;for(const r of E.REG)s+=w.inv[r][g].q;return s;}
function chgOf(w,g){const M=w.mk[g],ph=M.ph;if(!ph.length)return null;return M.i/ph[ph.length-1]-1;}
function chgHtml(d){if(d==null)return '';const p=Math.abs(d)<.0005?0:d;const cls=p>0?'f-up':p<0?'f-dn':'f-eq',ar=p>0?'▲':p<0?'▼':'•';
  return `<span class="f-ch ${cls}">${ar} ${FMT.pct(Math.abs(p),Math.abs(p)<.1?1:0)}</span>`;}
function mkPrices(w){const r=st.r;let h=tabs(E.REG.map(x=>[x,NM.reg(x)]),r,'r');
  h+=`<p class="f-note">${L('Цена за единицу','Price per unit')} ${regIn(r)}. ${L('Стрелка — изменение за месяц. Ведите пальцем по графику — цена по месяцам; нажмите — крупно.','The arrow is the change over a month. Slide along a chart for monthly prices; tap it to enlarge.')}</p>`;
  // M30: сначала «ваши» товары — что производите, держите на складе, везёте, покупаете для заводов или продаёте по контракту; остальные — под «▼ Все товары»
  const mine=g=>stockAll(w,g)>=1||w.obj.some(o=>{const O=E.OBJ[o.t];return O&&(O.out===g||(O.in&&O.in[g]));})||w.cons.some(c=>c.g===g)||w.tr.some(x=>x.g===g);
  let my=E.GL.filter(mine);if(!my.length)my=E.GL.filter(g=>E.REGS[r].p[g]);const rest=E.GL.filter(g=>my.indexOf(g)<0);
  const list=st.mAll?my.concat(rest):my;
  for(const g of list){const pr=E.price(w,r,g),tot=stockAll(w,g),here=w.inv[r][g].q,res=E.reserve(w,r,g),on=!!w.auto[r][g];
    h+=`<div class="f-card f-good"><div class="f-gh">${icon(g)}<div class="f-gn"><b>${NM.good(g)}</b><span class="f-pr" data-gp="${g}">${num(pr)} ₽/${NM.unit(g)}</span> <span data-gc="${g}">${chgHtml(chgOf(w,g))}</span></div>${chartBox('px:'+g,(n,big)=>priceSpec(g,r,n,!big),24,112,48,{spark:true})}</div>
      <div class="f-gs" data-gs="${g}">${stockHtml(w,r,g)}</div>
      ${res>=1?`<div class="f-mut">${L('Держим для заводов и маршрутов','Kept for plants and routes')}: ${FMT.qty(res,g)}</div>`:''}
      <button class="f-sw" data-a="auto" data-g="${g}"><span>${L('Автопродажа','Auto-sell')} ${regIn(r)}</span><i class="${on?'':'off'}">${on?L('вкл','on'):L('выкл','off')}</i></button>
      <div class="${INPUTS[g]?'f-b2':'f-b1'}"><button class="btn noenter" data-a="sell" data-g="${g}"${here<1?' disabled':''}>${L('Продать…','Sell…')}</button>${INPUTS[g]?`<button class="btn noenter" data-a="buy" data-g="${g}">${L('Купить…','Buy…')}</button>`:''}</div></div>`;}
  if(rest.length)h+=`<button class="btn w noenter" data-a="mall" style="margin:8px 0">${st.mAll?'▲ '+L('Только ваши товары','Only your goods'):'▼ '+L(`Все товары (${E.GL.length})`,`All goods (${E.GL.length})`)}</button>`;
  h+=`<p class="f-note">${L('Автопродажа продаёт всё, что сверх нужд заводов и маршрутов, по цене дня. Выключите — товар будет копиться на складе (например, под контракт или рост цены).','Auto-sell sells everything above what your plants and routes need, at the day’s price. Turn it off to keep goods in stock (e.g. for a contract or a price rise).')}</p>`;
  return h;}
function spotOf(w,g){return E.GOODS[g].p*w.mk[g].i;}
function ownQ(w,g){try{const s=stockAll(w,g);if(E.ownQ)return Math.min(s,E.ownQ(w,g));if(w.own)return Math.min(s,w.own[g]||0);}catch(e){}return null;}   // M30: своей продукции не больше, чем лежит на складах (заводы её тратят)
// цена товара по регионам; mine — товар у игрока там есть или производится
function regPx(w,g){return E.REG.map(r=>({r,p:E.price(w,r,g),mine:(w.inv[r][g]&&w.inv[r][g].q>=1)||w.obj.some(o=>o.r===r&&o.st==='w'&&E.OBJ[o.t].out===g)}));}
// M30: «потянем ли контракт»: свой выпуск за срок + своя продукция на складах − то, что ещё должны по другим контрактам
function conFit(w,o){let cap=0;for(const x of w.obj)if(x.st==='w'&&!x.off&&E.OBJ[x.t].out===o.g)cap+=E.objCap(x);const own=ownQ(w,o.g)||0;let owe=0;for(const c of w.cons)if(c.g===o.g)owe+=Math.max(0,c.q-c.done);
  const can=Math.max(0,own+cap*o.days/E.DAYS-owe),short=Math.max(0,o.q-can),ok=short<1;
  return `<div class="${ok?'f-tip':'f-warn'}" style="margin:6px 0">${cap>0?L(`Ваш выпуск ≈ ${FMT.qty(cap,o.g)} в месяц → за ${o.days} ${pl(o.days,'день','дня','дней','day','days')} ≈ ${FMT.qty(cap*o.days/E.DAYS,o.g)}`,`Your output ≈ ${FMT.qty(cap,o.g)} a month → in ${o.days} days ≈ ${FMT.qty(cap*o.days/E.DAYS,o.g)}`):L('Своего выпуска этого товара нет','You don’t produce this good')}${own>=1?L(`, на складах своей ${FMT.qty(own,o.g)}`,`, own stock ${FMT.qty(own,o.g)}`):''}${owe>=1?L(`, другим покупателям ещё должны ${FMT.qty(owe,o.g)}`,`, still owed to other buyers ${FMT.qty(owe,o.g)}`):''}: <b>${ok?L('✅ хватит','✅ enough'):L(`⚠ не хватит ≈ ${FMT.qty(short,o.g)} — штраф ≈ ${FMT.money(short*o.p*o.pen)}`,`⚠ short by ≈ ${FMT.qty(short,o.g)} — penalty ≈ ${FMT.money(short*o.p*o.pen)}`)}</b>
    <br><span class="f-mut">💰 ${L('Деньги приходят каждый день, по мере отгрузки. Штраф — при закрытии месяца, если к сроку не довезли. Автопродажу выключать не нужно: контракт забирает товар первым.','Money comes in daily as goods ship. A penalty is charged at month end if the deadline is missed. No need to turn off auto-sell: the contract takes goods first.')}</span></div>`;}
function mkCons(w){let h='';const cr=GAME.cr(),uOk=!E.urgentOk||E.urgentOk(w),uLeft=Math.max(1,(w.urgM|0)+3-w.m);
  h+=`<p class="f-note">${L('Контракт — продажа по твёрдой цене: товар уходит сам с любых складов (сверх нужд заводов). Не успели в срок — штраф 20 % от стоимости недопоставки.','A contract is a sale at a fixed price: goods ship by themselves from any warehouse (above what plants need). Miss the deadline — a 20% penalty on the undelivered part.')}</p>`;
  h+=`<h3>${L('Предложения','Offers')}</h3>`;
  if(!w.offers.length)h+=`<div class="f-card f-mut">${L('Пока предложений нет. Покупатели приходят к тем, кто производит от 500 единиц в месяц.','No offers yet. Buyers come to those who produce at least 500 units a month.')}</div>`;
  for(const o of w.offers){const rp=regPx(w,o.g),best=rp.filter(x=>x.mine).sort((a,b)=>b.p-a.p)[0]||rp.slice().sort((a,b)=>b.p-a.p)[0],d=o.p/best.p-1,left=Math.max(0,o.exp-w.t),stk=stockAll(w,o.g),own=ownQ(w,o.g);
    h+=`<div class="f-card"><div class="f-hdr"><div>${icon(o.g,30)} <b>${NM.good(o.g)}</b>${o.urg?' ⚡':''}</div><span class="f-mut">${L('истекает через','expires in')} ${left} ${pl(left,'день','дня','дней','day','days')}</span></div>
      <div class="f-mut" style="margin:4px 0">${esc(en()?o.be:o.b)}</div>
      <div class="f-kv"><span>${L('Объём','Volume')}</span><b>${FMT.qty(o.q,o.g)}</b>
      <span>${L('Цена за единицу','Price per unit')}</span><b>${num(o.p)} ₽/${NM.unit(o.g)}</b>
      <span>${L('К цене','Vs price')} ${regIn(best.r)}</span><b class="${d>=0?'f-up':'f-dn'}">${d>=0?'+':'−'}${FMT.pct(Math.abs(d))}</b>
      <span>${L('Сумма контракта','Contract value')}</span><b>${FMT.money(o.q*o.p)}</b>
      <span>${L('Срок поставки','Delivery time')}</span><b>${o.days} ${pl(o.days,'день','дня','дней','day','days')}</b>
      <span>${L('Штраф за недопоставку','Shortfall penalty')}</span><b>${FMT.pct(o.pen)}</b>
      <span>${L('У вас на складах','In your stock')}</span><b>${FMT.qty(stk,o.g)}</b>${own!=null?`<span>${L('Из них своей продукции','Of which your own output')}</span><b>${FMT.qty(own,o.g)}</b>`:''}</div>
      <div class="f-rp">${rp.map(x=>`<span${x.mine?' class="me"':''}>${NM.reg(x.r)}: ${num(x.p)} ₽ <i class="${o.p>=x.p?'f-up':'f-dn'}">(${o.p>=x.p?'+':'−'}${FMT.pct(Math.abs(o.p/x.p-1))})</i></span>`).join('')}</div>
      ${conFit(w,o)}
      <p class="f-note" style="margin:4px 0 8px">${L('Сравниваем с ценой на месте: контракт забирает товар с вашего склада. Жирным — регионы, где товар есть у вас. В зачёт идёт только ваша продукция — купленный товар по контракту не отгружается.','Compared with local prices: the buyer collects from your warehouse. Bold — regions where you have the goods. Only your own output counts — bought goods are not shipped under a contract.')}</p>
      <button class="btn green noenter" data-a="sign" data-id="${o.id}">✍ ${L('Подписать','Sign')}</button></div>`;}
  h+=`<div class="f-card"><b>⚡ ${L('Срочный покупатель','Urgent buyer')}</b><p class="f-mut" style="margin:4px 0 8px">${L('Найдём покупателя на вашу продукцию: цена на 6–9 % выше средней по стране (к цене на вашем складе бывает и больше), объём — не больше половины месячного выпуска, срок — месяц. Не чаще раза в 3 месяца. Покупной товар не подходит — только своё.','We’ll find a buyer for your own output: 6–9% above the national average (vs your local price it can be more), up to half a month’s production, one month to deliver. Once every 3 months at most. Bought goods don’t count — only your own.')}</p>
    ${uOk?`<button class="btn accent noenter" data-a="urgent">${L('Найти за','Find for')} 💎${GAME.CR.urgent}</button>`:`<button class="btn" disabled>${L('Следующий — через','Next one in')} ${uLeft} ${pl(uLeft,'месяц','месяца','месяцев','month','months')}</button>`}
    <div class="f-mut" style="margin-top:6px">${L('У вас','You have')} ${cr} 💎</div></div>`;
  h+=`<h3>${L('Действующие контракты','Active contracts')}</h3>`;
  if(!w.cons.length)h+=`<div class="f-card f-mut">${L('Нет действующих контрактов.','No active contracts.')}</div>`;
  for(const c of w.cons){const left=Math.max(0,c.end-w.t),p=clamp(c.done/c.q,0,1),risk=p<1&&left<=10&&p<.6;
    h+=`<div class="f-card"><div class="f-hdr"><div>${icon(c.g,30)} <b>${NM.good(c.g)}</b></div><span class="${risk?'f-dn':'f-mut'}" style="font-weight:700">${left} ${pl(left,'день','дня','дней','day','days')} ${L('до срока','left')}</span></div>
      <div class="f-mut" style="margin:4px 0">${esc(en()?c.be:c.b)} · ${num(c.p)} ₽/${NM.unit(c.g)}</div>
      <div class="f-bar"><i style="width:${(p*100).toFixed(1)}%;${risk?'background:var(--bad,#c62828)':''}"></i></div>
      <div>${L('Поставлено','Delivered')} <b>${FMT.qty(c.done,c.g)}</b> ${L('из','of')} <b>${FMT.qty(c.q,c.g)}</b> <span style="white-space:nowrap">(${FMT.pct(p)})</span></div>
      ${risk?`<div class="f-dn" style="font-size:15px;margin-top:4px">${L('Можно не успеть: штраф','May miss the deadline: penalty')} ≈ ${FMT.money((c.q-c.done)*c.p*c.pen)}</div>`:''}${c.ext?`<div class="f-mut" style="font-size:15px;margin-top:4px">✓ ${L('Срок уже продлён на 10 дней','Deadline already extended by 10 days')}</div>`:conAdOk(w,c)?`<button class="btn w noenter" data-a="conext" data-id="${c.id}" style="margin-top:8px"${conW()?' disabled':''}>📺 ${L('Отсрочка +10 дней без штрафа — за рекламу','+10 days, no penalty — for an ad')}${conW()?'<small>'+GAME.adTxt('con')+'</small>':''}</button>`:''}</div>`;}
  return h;}
function seenList(){return (typeof S!=='undefined'&&Array.isArray(S.seenOff))?S.seenOff:[];}
function newOffers(w){w=w||Wd();if(!w)return 0;const sn=seenList();return w.offers.filter(o=>sn.indexOf(o.id)<0).length;}
function markSeen(w){if(typeof S==='undefined'||!newOffers(w))return;const sn=seenList().filter(id=>w.offers.some(o=>o.id===id)||w.cons.some(c=>c.id===id));
  for(const o of w.offers)if(sn.indexOf(o.id)<0)sn.push(o.id);S.seenOff=sn.slice(-40);try{save();}catch(e){}}
function renderMarket(el,tab){if(!el)return;css();lastM=el;if(tab)st.mt=tab;const w=Wd();if(!w){el.innerHTML='';return;}
  const nOff=w.offers.length;if(st.mt==='con')markSeen(w);const nNew=newOffers(w);
  el.innerHTML='<div class="fin"><div class="f-top"><div class="f-tt"><div class="f-ttl">'+L('Рынок','Market')+'</div><div class="f-sub">'+L('цены за единицу, ваши склады и контракты','unit prices, your stock and contracts')+'</div></div></div>'+tabs([['px',L('Цены','Prices')],['con',L('Контракты','Contracts')+(nOff?' ('+nOff+')':'')+(nNew?`<i class="f-new">${L('новое','new')}</i>`:'')]],st.mt,'mt')+(st.mt==='con'?mkCons(w):mkPrices(w))+'</div>';
  el.onclick=e=>{const b=e.target.closest('[data-a]');if(!b||!el.contains(b)||b.disabled)return;const a=b.dataset.a,g=b.dataset.g;snd('tap');
    if(a==='tab'){st[b.dataset.k]=b.dataset.v;renderMarket(el);}
    else if(a==='auto'){GAME.act('setAuto',st.r,g,!Wd().auto[st.r][g]);renderMarket(el);}
    else if(a==='mall'){st.mAll=!st.mAll;renderMarket(el);}
    else if(a==='sell')openSell(st.r,g);
    else if(a==='buy')openBuy(st.r,g);
    else if(a==='sign'){const r=GAME.act('acceptOffer',b.dataset.id);if(r==='ok'){snd('coin');toastS(L('Контракт подписан — товар пойдёт покупателю сам','Contract signed — goods will ship by themselves'));}renderMarket(el);}
    else if(a==='urgent')urgentAsk(el);
    else if(a==='conext'){const id=b.dataset.id;if(conW()){toastS('📺 '+GAME.adTxt('con'));return;}STAT.place('conext');showRewarded(()=>{const r=GAME.adAct('con','conExt',id);if(r==='ok'){snd('coin');toastS(L('Покупатель согласился подождать: +10 дней, без штрафа','The buyer agreed to wait: +10 days, no penalty'));}else if(r==='wait')toastS('📺 '+GAME.adTxt('con'));renderMarket(el);},()=>{});}};}
function urgentAsk(el){if(GAME.cr()<GAME.CR.urgent){urgent(el);return;}
  modal(`<div id="finDlg"><h2>⚡ ${L('Срочный покупатель','Urgent buyer')}</h2>
    <p>${L('Потратить','Spend')} <b>💎${GAME.CR.urgent}</b> ${L('(у вас','(you have')} ${GAME.cr()} 💎)?</p>
    <p class="f-mut">${L('Цена на 6–9 % выше средней по стране, объём — до половины месячного выпуска, срок — месяц. Только ваша продукция. Если продавать нечего — кристаллы не спишутся.','6–9% above the national average, up to half a month’s output, one month. Only your own output. If there’s nothing to sell, no crystals are spent.')}</p>
    <div class="row"><button class="btn accent noenter" id="fdGo">${L('Найти за','Find for')} 💎${GAME.CR.urgent}</button><button class="btn" id="mCancel" data-esc>${L('Отмена','Cancel')}</button></div></div>`);
  setRe(()=>urgentAsk(el));
  document.getElementById('mCancel').onclick=hideModal;document.getElementById('fdGo').onclick=()=>{hideModal();urgent(el);};}
function urgent(el){const r=GAME.urgent();
  if(r==='cr'){toastS(L('💎 не хватает','Not enough 💎'));if(typeof openShop==='function')openShop();return;}
  if(!r&&E.urgentOk&&!E.urgentOk(Wd())){snd('no');toastS(L('Срочного покупателя можно искать раз в 3 месяца. Кристаллы не списаны.','You can look for an urgent buyer once every 3 months. No crystals spent.'));return;}
  if(!r){snd('no');toastS(L('Нечего предложить покупателю: нужно хотя бы 500 единиц своей продукции (на складах или в выпуске месяца). Кристаллы не списаны.','Nothing to offer: you need at least 500 units of your own output (in stock or this month). No crystals spent.'));return;}
  snd('coin');toastS(L('Покупатель найден: ','Buyer found: ')+NM.good(r.g)+', '+FMT.qty(r.q,r.g));st.mt='con';renderMarket(el||lastM);}

/* окно продажи */
function openSell(r,g){const w=Wd(),s=w.inv[r][g],max=s.q;if(max<1){toastS(L('На этом складе пусто','This warehouse is empty'));return;}
  let pct=100;const res=E.reserve(w,r,g);
  const qOf=()=>pct>=100?max:Math.max(1,Math.round(max*pct/100));
  modal(`<div id="finDlg"><h2>${icon(g,32)} ${L('Продать','Sell')}: ${NM.good(g)}</h2>
    <p class="f-mut">${L('Склад','Warehouse')} ${regIn(r)}: ${FMT.qty(max,g)}</p>
    <div class="f-big" id="fdQ"></div>
    <input type="range" class="f-rng" id="fdR" min="1" max="100" step="1" value="100" aria-label="${L('Сколько продать','How much to sell')}">
    <div class="f-chips"><button class="f-chip" data-p="25">25 %</button><button class="f-chip" data-p="50">50 %</button><button class="f-chip" data-p="100">100 %</button></div>
    <div class="f-kv"><span>${L('Цена за единицу','Price per unit')}</span><b id="fdP"></b><span>${L('Выручка','Revenue')}</span><b id="fdV"></b>
      <span>${L('Себестоимость','Cost')}</span><b id="fdC"></b><span>${L('Прибыль от сделки','Profit on the deal')}</span><b id="fdM"></b></div>
    <p class="f-mut">${L('Чем больше продаёте разом, тем ниже цена: рынок не любит, когда его заваливают.','The more you sell at once, the lower the price: the market dislikes being flooded.')}</p>
    ${res>=1?`<p class="f-dn" style="font-size:15px">${L('Для заводов и маршрутов здесь нужно','Plants and routes here need')} ${FMT.qty(res,g)} — ${L('продадите всё, и они встанут.','sell it all and they will stop.')}</p>`:''}
    <div class="row"><button class="btn accent noenter" id="fdGo">${L('Продать','Sell')}</button><button class="btn" id="mCancel" data-esc>${L('Отмена','Cancel')}</button></div></div>`);
  setRe(()=>openSell(r,g));
  const upd=()=>{const q=qOf(),p=E.sellPrice(w,r,g,q),v=p*q,c=s.q?s.v*q/s.q:0;
    document.getElementById('fdQ').textContent=FMT.qty(q,g);document.getElementById('fdR').value=pct;
    document.getElementById('fdP').textContent=num(p)+' ₽/'+NM.unit(g);document.getElementById('fdV').textContent=FMT.money(v);
    document.getElementById('fdC').textContent=FMT.money(c);const m=document.getElementById('fdM');m.textContent=FMT.money(v-c);m.className=v-c>=0?'f-up':'f-dn';
    document.querySelectorAll('#finDlg .f-chip').forEach(b=>b.classList.toggle('on',+b.dataset.p===pct));};
  document.getElementById('fdR').oninput=e=>{pct=+e.target.value;upd();};
  document.querySelectorAll('#finDlg .f-chip').forEach(b=>b.onclick=()=>{pct=+b.dataset.p;snd('tap');upd();});
  document.getElementById('mCancel').onclick=()=>{hideModal();};
  document.getElementById('fdGo').onclick=()=>{const rev=GAME.act('sell',r,g,qOf());hideModal();
    if(rev>0){snd('coin');toastS(L('Продано на ','Sold for ')+FMT.money(rev));}FIN.refresh();};
  upd();}
/* окно покупки */
function needOf(w,r,g){let s=0;for(const o of w.obj){const O=E.OBJ[o.t];if(o.r===r&&O.in&&O.in[g]&&o.st==='w'&&!o.off)s+=E.objCap(o)*O.in[g];}return s;}
function openBuy(r,g){const w=Wd(),room=Math.max(0,E.storR(w,r)-E.stockR(w,r));
  let lo=0,hi=room;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(E.buyPrice(w,r,g,m)*m<=w.cash)lo=m;else hi=m;}
  const max=Math.floor(lo),need=needOf(w,r,g);
  if(max<1){toastS(room<1?L('Склад полон — купить некуда','The warehouse is full — nowhere to put it'):L('Не хватает денег','Not enough money'));return;}
  let q=Math.min(max,need>0?Math.round(need):Math.round(max/2));if(q<1)q=max;
  const chips=[[25,Math.round(max*.25)],[50,Math.round(max*.5)],[100,max]];
  modal(`<div id="finDlg"><h2>${icon(g,32)} ${L('Купить','Buy')}: ${NM.good(g)}</h2>
    <p class="f-mut">${L('На склад','To the warehouse')} ${regIn(r)}. ${L('Свободно','Free space')}: ${FMT.qty(room,g)}${need>0?`. ${L('Заводам здесь нужно в месяц','Plants here need per month')}: ${FMT.qty(need,g)}`:''}</p>
    <div class="f-big" id="fdQ"></div>
    <input type="range" class="f-rng" id="fdR" min="1" max="${max}" step="1" value="${q}" aria-label="${L('Сколько купить','How much to buy')}">
    <div class="f-chips${need>0&&need<=max?' n4':''}">${chips.map(c=>`<button class="f-chip" data-q="${c[1]}">${c[0]} %</button>`).join('')}${need>0&&need<=max?`<button class="f-chip" data-q="${Math.round(need)}">${L('месяц','month')}</button>`:''}</div>
    <div class="f-kv"><span>${L('Цена за единицу','Price per unit')}</span><b id="fdP"></b><span>${L('Всего заплатим','Total cost')}</span><b id="fdV"></b><span>${L('Останется денег','Money left')}</span><b id="fdC"></b></div>
    <p class="f-mut">${L('Покупка чуть дороже цены продажи (+6 %) и дорожает с объёмом.','Buying costs a bit more than selling (+6%) and gets pricier with volume.')}</p>
    <div class="row"><button class="btn blue noenter" id="fdGo">${L('Купить','Buy')}</button><button class="btn" id="mCancel" data-esc>${L('Отмена','Cancel')}</button></div></div>`);
  setRe(()=>openBuy(r,g));
  const upd=()=>{const p=E.buyPrice(w,r,g,q),v=p*q;document.getElementById('fdQ').textContent=FMT.qty(q,g);document.getElementById('fdR').value=q;
    document.getElementById('fdP').textContent=num(p)+' ₽/'+NM.unit(g);document.getElementById('fdV').textContent=FMT.money(v);document.getElementById('fdC').textContent=FMT.money(w.cash-v);
    document.querySelectorAll('#finDlg .f-chip').forEach(b=>b.classList.toggle('on',+b.dataset.q===q));};
  document.getElementById('fdR').oninput=e=>{q=+e.target.value;upd();};
  document.querySelectorAll('#finDlg .f-chip').forEach(b=>b.onclick=()=>{q=+b.dataset.q;snd('tap');upd();});
  document.getElementById('mCancel').onclick=()=>{hideModal();};
  document.getElementById('fdGo').onclick=()=>{const c=GAME.act('buy',r,g,q);hideModal();
    if(c>0){snd('coin');toastS(L('Куплено: ','Bought: ')+FMT.qty(q,g)+' — '+FMT.money(c));}else{snd('no');toastS(L('Не хватает денег','Not enough money'));}FIN.refresh();};
  upd();}

/* ================= ОТЧЁТЫ ================= */
function curRep(w){const b=E.bal(w),M=w.mon;return {m:w.m,cur:true,pl:Object.assign({},M.pl),cf:Object.assign({},M.cf),c0:M.c0,c1:w.cash,
  bal:{cash:b.cash,inv:b.inv,rec:b.rec,cip:b.cip,fa:b.fa,lic:b.lic,jv:b.jv,lend:b.lend,re:b.re,A:b.A,debt:b.debt,cap:b.cap,ret:b.ret+b.cur,drw:b.drw||0,E:b.E,diff:b.diff},prod:M.prod,sold:M.sold};}
function repList(w){const a=w.reps.slice();a.push(curRep(w));return a;}
const mLbl=r=>r.cur?L('Сейчас · ','Now · ')+FMT.date(r.m):FMT.date(r.m);
const plSum=list=>{const s={rev:0,cogs:0,fix:0,log:0,adm:0,expl:0,dep:0,oth:0,int:0,tax:0};for(const x of list)for(const k in s)s[k]+=x.pl[k]||0;return s;};
const CF_LBL={sales:['Поступления от продаж','Receipts from sales'],supp:['Закупка сырья и товара','Purchases of materials and goods'],prod:['Затраты на производство','Production costs'],
  fix:['Постоянные расходы','Fixed costs'],log:['Логистика (ж/д, вагоны)','Logistics (rail, wagons)'],adm:['Офис и управление','Office & management'],expl:['Геологоразведка','Exploration'],
  oth:['Прочие (штрафы, аварии, возмещения)','Other (penalties, accidents, refunds)'],int:['Проценты по кредитам *','Interest on loans *'],tax:['Налог на прибыль','Income tax'],
  capex:['Стройка и модернизация','Construction & upgrades'],lic:['Лицензии','Licences'],wag:['Вагоны','Wagons'],asale:['Продажа активов','Asset sales'],jvin:['Вклады в совместные дела (и продажа доли)','Joint ventures: investment & exit'],div:['Дивиденды от совместных дел','Dividends from joint ventures'],lend:['Займы друзьям: выдача и возврат','Loans to friends: issued & repaid'],
  loan:['Кредиты получены','Loans received'],repay:['Кредиты погашены','Loans repaid'],eqin:['Взнос в уставный капитал','Share capital paid in'],drw:['Личные покупки собственника','Owner’s personal purchases']};
function cfRows(r,o2){const out=[['n',L('Остаток денег на начало','Opening cash'),r.c0]];
  const sec=[['o',L('Операционная деятельность','Operating activities'),L('Итого операционная','Total operating')],['i',L('Инвестиционная деятельность','Investing activities'),L('Итого инвестиционная','Total investing')],['f',L('Финансовая деятельность','Financing activities'),L('Итого финансовая','Total financing')]];
  let all=0;for(const [k,t,tt] of sec){out.push(['h',t,null]);for(const x of E.CFG[k]){const v=r.cf[x]||0;if(v||(o2&&o2.cf[x])||x==='sales')out.push(['i',L(CF_LBL[x][0],CF_LBL[x][1]),v,x]);}
    const s=E.sumCF(r.cf,k);all+=s;out.push(['s',tt,s,'_'+k]);}
  out.push(['s',L('Изменение денег за месяц','Net change in cash'),all,'_all']);out.push(['b',L('Остаток денег на конец','Closing cash'),r.c1,'_c1']);return out;}
/* ---- отчёт строками (стиль Г): на телефоне название — отдельной строкой, под ним крупные числа; «?» — пояснение ---- */
const HINT={
  'pl:rev':['Деньги за проданное за месяц — по цене сделки (спот, автопродажа, контракты).','What was sold this month, at the deal price (spot, auto-sell, contracts).'],
  'pl:cogs':['Переменные затраты именно на проданный товар: добыча, передел, сырьё. Непроданное лежит на складе как запас.','Variable cost of the goods actually sold: mining, processing, materials. Unsold goods sit in inventory.'],
  'pl:marg':['Выручка минус переменная себестоимость — сколько приносит сам товар.','Revenue minus variable cost — what the goods themselves bring in.'],
  'pl:fix':['Зарплата, ремонт и охрана объектов — платим, даже если объект стоит. Законсервированный объект — на 70 % дешевле.','Wages, repairs and security — paid even if a site is idle. A mothballed site costs 70% less.'],
  'pl:log':['Ж/д тариф, аренда и содержание вагонов.','Rail tariff, wagon rent and upkeep.'],
  'pl:adm':['Офис холдинга: растёт с каждым новым объектом.','The holding’s office: grows with each new site.'],
  'pl:expl':['Геологоразведка участков. Если найденный участок уйдёт другому на торгах — затраты вернут.','Plot exploration. If a plot you found goes to someone else, the cost is refunded.'],
  'pl:ebitda':['Прибыль от самой работы — до амортизации, процентов и налога. Главный показатель для банка.','Profit from operations — before depreciation, interest and tax. The bank’s key figure.'],
  'pl:dep':['Стройка и лицензии «списываются» частями за срок службы. Это расход без денег: деньги ушли раньше, при покупке.','Construction and licences are expensed in parts over their life. A non-cash cost: the money left earlier, at purchase.'],
  'pl:oth':['Штрафы по контрактам, аварии, возмещение разведки, убыток от продажи активов при санации.','Contract penalties, accidents, exploration refunds, losses on asset sales in restructuring.'],
  'pl:int':['Проценты банку за месяц по всем кредитам.','Interest paid to the bank for the month on all loans.'],
  'pl:tax':['25 % с прибыли до налога. Убытки прошлых месяцев уменьшают налог, но не больше чем наполовину.','25% of profit before tax. Past losses reduce the tax, but by no more than half.'],
  'cf:sales':['Живые деньги от покупателей.','Cash received from buyers.'],'cf:supp':['Сырьё, купленное на рынке.','Raw materials bought on the market.'],
  'cf:prod':['Переменные затраты на выпуск: добыча и передел.','Variable production costs: mining and processing.'],
  'cf:capex':['Платежи строителям — растягиваются на весь срок стройки.','Payments to builders — spread over the construction period.'],
  'cf:loan':['Новые кредиты и овердрафт.','New loans and overdraft.'],'cf:repay':['Возврат тела кредитов по графику и досрочно.','Principal repaid on schedule and early.'],
  'bs:inv':['Товар на складах и в пути — по себестоимости, а не по цене продажи.','Goods in stock and in transit — at cost, not at selling price.'],
  'bs:cip':['Сколько уже заплачено за незаконченную стройку.','What has been paid so far for unfinished construction.'],
  'bs:fa':['Заводы, разрезы и вагоны за вычетом амортизации.','Plants, mines and wagons net of depreciation.'],
  'bs:ret':['Вся заработанная и не выведенная прибыль с начала холдинга.','All profit earned and kept since the holding began.'],'bs:drw':['Деньги, которые вы взяли из дела на личные вещи (Кабинет → «Вещи»). Прибыль месяца они не уменьшают, а капитал — да: деньги ушли из компании.','Money you took out of the business for personal things (Office → “Things”). They don’t reduce monthly profit, but they do reduce equity: the money left the company.'],'cf:drw':['Личные вещи героя: смартфон, машина, дача… Это не расход дела, а изъятие собственника.','The hero’s personal things: phone, car, dacha… Not a business expense but an owner’s drawing.']};
const hintOf=(tag,id)=>{const w2=window.FDT&&FDT.whatOf(tag,id);if(w2)return w2;const h=HINT[tag+':'+id];return h?L(h[0],h[1]):'';};
// M25: строку можно раскрыть (▸) — под ней «что это» и разбивка по делам/точкам/кредитам (js/fin-dt.js)
const dxOk=(tag,key,rep)=>!!(rep&&key&&window.FDT&&FDT.canOpen(tag,key));
const earlyW=()=>{const w=Wd();return !!w&&w.ned===false;};
function plRows(p){const E1=E.ebitdaOf(p),N=E.netOf(p),ea=earlyW();
  return [['n',L('Выручка','Revenue'),p.rev,'rev'],['i',L('Себестоимость проданного (переменная)','Cost of goods sold (variable)'),-p.cogs,'cogs'],
    ['s',L('Маржинальная прибыль','Contribution margin'),p.rev-p.cogs,'marg'],
    ['i',ea?L('Аренда и зарплаты','Rent & wages'):L('Постоянные расходы производства','Fixed production costs'),-p.fix,'fix'],['i',ea?L('Доставка','Delivery'):L('Логистика (ж/д)','Logistics (rail)'),-p.log,'log'],
    ['i',ea?L('Жизнь, взносы, бухгалтер','Living costs, contributions, accountant'):L('Офис и управление','Office & management'),-p.adm,'adm'],['i',L('Геологоразведка','Exploration'),-p.expl,'expl'],
    ['b','EBITDA',E1,'ebitda'],['i',L('Амортизация ОС и лицензий','Depreciation & amortisation'),-p.dep,'dep'],
    ['i',L('Прочие доходы и расходы (штрафы, аварии, возмещения, продажа активов)','Other income & expenses (penalties, accidents, refunds, asset sales)'),p.oth,'oth'],
    ['i',L('Проценты по кредитам','Interest on loans'),-p.int,'int'],['s',L('Прибыль до налога','Profit before tax'),N+p.tax-(p.jv||0),'ebt'],
    ['i',ea?L('Налог (НПД или УСН)','Tax (self-employed or simplified)'):L('Налог на прибыль 25 %','Income tax 25%'),-p.tax,'tax'],...(p.jv?[['i',L('Доля в прибыли совместных дел (без налога)','Share of joint-venture profit (tax-free)'),p.jv,'jv']]:[]),['b',L('Чистая прибыль','Net profit'),N,'net']];}
function bsRows(b,o){const has=k=>!!(b[k]||o&&o[k]);return [['h',L('Активы','Assets'),null],['i',L('Деньги','Cash'),b.cash,'cash'],['i',L('Запасы (на складах и в пути, по себестоимости)','Inventory (in stock and in transit, at cost)'),b.inv,'inv'],
  ['i',L('Незавершённое строительство','Construction in progress'),b.cip,'cip'],['i',L('Основные средства (остаточная стоимость)','Fixed assets (net book value)'),b.fa,'fa'],['i',L('Лицензии (нематериальные активы)','Licences (intangible assets)'),b.lic,'lic'],
  ...[['rec',L('Нам должны (покупатели)','Receivables')],['re',L('Недвижимость (по цене покупки)','Investment property (at cost)')],['jv',L('Вложения в совместные дела','Investments in joint ventures')],['lend',L('Займы друзьям','Loans to friends')]].filter(x=>has(x[0])).map(x=>['i',x[1],b[x[0]]||0,x[0]]),
  ['b',L('Итого активы','Total assets'),b.A,'A'],['h',L('Обязательства','Liabilities'),null],['i',L('Кредиты банка','Bank loans'),b.debt,'debt'],
  ['h',L('Капитал','Equity'),null],['i',L('Уставный капитал','Share capital'),b.cap,'cap'],['i',L('Нераспределённая прибыль','Retained earnings'),b.ret,'ret'],...(has('drw')?[['i',L('Изъято на личные покупки собственника','Owner’s personal purchases (drawings)'),-(b.drw||0),'drw']]:[]),['s',L('Итого капитал','Total equity'),b.E,'E'],
  ['b',L('Итого пассивы (кредиты + капитал)','Total liabilities & equity'),b.debt+b.E,'LE']];}
// rows: [вид, название, значение, ключ]; cols — функции (row) → число; tag — pl|cf|bs (для пояснений)
function table(heads,rows,cols,tag,rep){const all=[];for(const row of rows)if(row[0]!=='h')for(const f of cols)all.push(f(row));const u=FMT.unitOf(all);
  let h=`<div class="f-card f-rt"><div class="f-rh"><span class="c0">${FMT.uName(u)}</span>${heads.map(x=>`<span class="cv">${x}</span>`).join('')}</div>`;
  for(const row of rows){const [k,t]=row;if(k==='h'){h+=`<div class="f-rr h">${t}</div>`;continue;}
    const id=tag+':'+row[3],hint=hintOf(tag,row[3]),dx=dxOk(tag,row[3],rep),can=hint||dx,open=can&&st.hx===id;
    let more='';if(open){const d=dx?FDT.rowHtml(rep,tag,row[3],row[2]):'';more=`<div class="dtx" data-a="nop">${hint?`<div class="exp">${hint}</div>`:''}${d}</div>`;}
    h+=`<div class="f-rr ${k}${open?' open':''}"${can?` data-a="hx" data-v="${id}" role="button" tabindex="0" aria-expanded="${!!open}"`:''}><div class="rn">${dx?`<span class="dt-m" aria-hidden="true">${open?'▾':'▸'}</span>`:''}${t}${hint&&!dx?`<i class="tg">${open?'▴':'?'}</i>`:''}</div><div class="rv"><span class="c0"></span>${cols.map((f,j)=>{const v=f(row);return `<span class="cv${j?' p':''}${v<0?' neg':''}">${v==null?'':mm(v,u)}</span>`;}).join('')}</div>${more}</div>`;}
  return h+'</div>';}
const RK={pl:[['Прибыли и убытки','Profit & loss'],['БДР','P&L'],['Заработали ли мы за месяц','Did we earn money this month']],
  cf:[['Движение денег','Cash flow'],['ДДС','CF'],['Откуда пришли и куда ушли деньги','Where money came from and went']],
  bs:[['Баланс','Balance sheet'],['Баланс','BS'],['Что у холдинга есть и кому он должен','What the holding owns and owes']],
  mx:[['Показатели для знатока','Ratios for experts'],['%','%'],['Маржа, ROE, долг/EBITDA — с пояснениями','Margins, ROE, debt/EBITDA — explained']],
  hist:[['История по месяцам','History by month'],['≡','≡'],['Выручка, прибыль и деньги за все месяцы','Revenue, profit and cash for every month']]};
const RK_ORD=['pl','cf','bs','mx','hist'];
const rkT=k=>L(RK[k][0][0],RK[k][0][1]),rkA=k=>L(RK[k][1][0],RK[k][1][1]),rkD=k=>L(RK[k][2][0],RK[k][2][1]);
const REP_TIP={pl:['БДР отвечает на главный вопрос — заработали мы или нет. Стройка сюда не попадает: она списывается амортизацией частями.','The P&L answers the main question — did we make money. Construction isn’t here: it is expensed in parts as depreciation.'],
  cf:['ДДС — живые деньги. Прибыль и деньги не одно и то же: стройка съедает деньги, но не прибыль.','Cash flow is real money. Profit and cash differ: construction eats cash, not profit.'],
  bs:['Баланс — снимок на конец месяца: чем владеем и на чьи деньги. Обе половины всегда равны.','The balance sheet is a month-end snapshot: what we own and who funded it. Both halves are always equal.']};
function repBody(list,i,kind){const r=list[i],prev=list[i-1]||null,w=Wd();let h='';
  if(kind==='mx')return mxHtml(w);
  if(kind==='hist')return histHtml(w);
  if(kind==='pl'){const yr=Math.floor(r.m/12),ytd=plSum(list.filter(x=>Math.floor(x.m/12)===yr&&x.m<=r.m));
    const rows=plRows(r.pl),rp=prev?plRows(prev.pl):null,ry=plRows(ytd);
    const heads=[r.cur?L('сейчас','now'):FMT.mon(r.m)];if(rp)heads.push(r.cur||!prev?L('прошлый','previous'):FMT.mon(prev.m));heads.push(L('с начала года','year to date'));
    const by=(t,row)=>{const x=t.find(y=>y[3]===row[3]);return x?x[2]:0;};const cols=[row=>row[2]];if(rp)cols.push(row=>by(rp,row));cols.push(row=>by(ry,row));   // по ключу строки: строка «Доля в совместных делах» есть не в каждом месяце (M24: падало в «Недрах» с друзьями)
    h+=table(heads,rows,cols,'pl',r);
    if(r.cur)h+=`<p class="f-note">${L('Месяц ещё идёт: постоянные расходы, амортизация, проценты и налог начислятся при закрытии.','The month is still running: fixed costs, depreciation, interest and tax are booked at month end.')}</p>`;}
  else if(kind==='cf'){const rows=cfRows(r,prev),rp=prev?cfRows(prev,r):null;
    const heads=[r.cur?L('сейчас','now'):FMT.mon(r.m)];if(rp)heads.push(FMT.mon(prev.m));
    const val=(rs,row)=>{if(row[0]==='n')return rs[0][2];const f=rs.find(x=>x[3]&&x[3]===row[3]);return f?f[2]:0;};
    const cols=[row=>row[2]];if(rp)cols.push(row=>row[0]==='h'?null:val(rp,row));
    h+=table(heads,rows,cols,'cf',r);
    const d=r.c1-r.c0-(E.sumCF(r.cf,'o')+E.sumCF(r.cf,'i')+E.sumCF(r.cf,'f'));
    h+=`<p class="f-note">* ${L('Проценты по кредитам — в операционной деятельности (как в РСБУ).','Interest is shown in operating activities (as under Russian accounting rules).')}</p>`;
    h+=d===0?`<div class="f-ok">✓ ${L('Остаток на конец = начало + движение за месяц','Closing = opening + net change')}</div>`:`<div class="f-bad">⚠ ${L('Расхождение ДДС','Cash flow mismatch')}: ${FMT.money(d)}</div>`;}
  else{const b=r.bal,pb=prev?prev.bal:null,rows=bsRows(b,pb),rp=pb?bsRows(pb,b):null;
    const heads=[r.cur?L('сейчас','now'):L('на конец','closing')];if(rp)heads.push(L('на начало','opening'));
    const cols=[row=>row[2]];if(rp)cols.push(row=>rp[rows.indexOf(row)][2]);
    h+=table(heads,rows,cols,'bs',r);
    h+=b.diff===0?`<div class="f-ok">✓ ${L('Актив = Пассив','Assets = Liabilities + Equity')}</div>`:`<div class="f-bad">⚠ ${L('Баланс не сходится на','Balance is off by')} ${FMT.money(b.diff)}</div>`;}
  h+=`<div class="f-tip">💡 ${L(REP_TIP[kind][0],REP_TIP[kind][1])}</div>`;
  return h;}
function mswHtml(list,i){return `<div class="f-card f-msw" data-swipe="1"><button data-a="rprev"${i<=0?' disabled':''} aria-label="${L('Раньше','Earlier')}">◀</button><div><b>${mLbl(list[i])}</b><span>${L('листайте пальцем ← →','swipe ← →')}</span></div><button data-a="rnext"${i>=list.length-1?' disabled':''} aria-label="${L('Позже','Later')}">▶</button></div>`;}
// модальное окно отчётов (из окна закрытия месяца): переключатель БДР/ДДС/Баланс и месяцы
function repBlock(list,i,kind){return mswHtml(list,i)+tabs([['pl',L('БДР','P&L')],['cf',L('ДДС','Cash flow')],['bs',L('Баланс','Balance')]],kind,'rk')+repBody(list,i,kind);}
function mxHtml(w){const mt=E.metrics(w);if(!mt)return `<div class="f-card f-mut">${L('Показатели появятся после первого закрытого месяца.','Ratios appear after the first month closes.')}</div>`;
  const it=[
    ['e12','EBITDA '+L('за 12 мес.','(12 m)'),FMT.money(mt.e12),L('EBITDA — прибыль от самой работы: выручка минус все текущие затраты, но до амортизации, процентов и налога. Растёт — дело идёт; меньше нуля — работа убыточна. Если месяцев меньше 12 — пересчитано на год.','EBITDA is profit from operations: revenue minus running costs, before depreciation, interest and tax. Growing — good; below zero — operations lose money. Annualised if fewer than 12 months.')],
    ['em',L('Маржа EBITDA','EBITDA margin'),FMT.pct(mt.em,1),L('Какая доля выручки остаётся до амортизации, процентов и налога. У горняков 25–40 % — хорошо, меньше 10 % — тонко.','Share of revenue left before depreciation, interest and tax. 25–40% is good for miners, under 10% is thin.')],
    ['nm',L('Чистая маржа','Net margin'),FMT.pct(mt.nm,1),L('Сколько копеек чистой прибыли остаётся с каждого рубля выручки после всех расходов и налога.','Kopecks of net profit left from each rouble of revenue after all costs and tax.')],
    ['n12',L('Чистая прибыль за 12 мес.','Net profit (12 m)'),FMT.money(mt.n12),L('Итог года после амортизации, процентов и налога. Если месяцев меньше 12 — пересчитано на год.','The year’s bottom line after depreciation, interest and tax. Annualised if fewer than 12 months.')],
    ['roe',L('ROE (годовая)','ROE (annual)'),FMT.pct(mt.roe,1),L('Доходность капитала: сколько процентов в год приносят деньги владельца (чистая прибыль ÷ капитал). Выше ключевой ставки — бизнес выгоднее вклада; ниже — хуже.','Return on equity: how many percent a year the owner’s money earns. Above the key rate — better than a deposit; below — worse.')],
    ['de',L('Долг / EBITDA','Debt / EBITDA'),mt.de>=99?'—':num(mt.de,1),(mt.de>=99?L('EBITDA нет — показатель не считается. ','No EBITDA — the ratio can’t be calculated. '):'')+L('За сколько лет можно погасить весь долг из EBITDA. До 2 — спокойно, 2–3,5 — внимательно, больше 3,5 — банк повышает ставку, больше 4 при овердрафтах — риск санации.','Years of EBITDA to repay all debt. Under 2 — calm, 2–3.5 — watch it, above 3.5 the bank raises the rate, above 4 with overdrafts — restructuring risk.')],
    ['icr',L('Покрытие процентов','Interest cover'),mt.icr>=99?L('нет процентов','no interest'):num(mt.icr,1),L('Во сколько раз EBITDA больше процентов по кредитам. Больше 4 — спокойно, меньше 2 — опасно.','How many times EBITDA covers loan interest. Above 4 is calm, below 2 is risky.')],
    ['invd',L('Оборачиваемость запасов','Inventory days'),num(Math.min(999,mt.invd))+' '+pl(Math.round(Math.min(999,mt.invd)),'день','дня','дней','day','days'),L('На сколько дней продаж лежит товара на складах. Много — деньги заморожены в запасах.','Days of sales sitting in stock. Too many — cash is frozen in inventory.')]];
  return '<div class="f-card"><p class="f-note" style="margin-top:0">'+L('Нажмите на показатель — объясню, что он значит.','Tap a ratio to see what it means.')+'</p>'+it.map(x=>`<button class="f-met${st.mx===x[0]?' on':''}" data-a="mx" data-v="${x[0]}" aria-expanded="${st.mx===x[0]}"><div><span>${x[1]} <i class="f-q">?</i></span><b>${x[2]}</b></div>${st.mx===x[0]?`<small>${x[3]}</small>`:''}</button>`).join('')+'</div>';}
function histHtml(w){const hs=w.hist.slice(-24).reverse();if(!hs.length)return `<div class="f-card f-mut">${L('История появится после первого закрытого месяца.','History appears after the first month closes.')}</div>`;
  const rows=hs.map(x=>['i',FMT.date(x.m),x.rev,x]),cols=[r=>r[3].rev,r=>r[3].np,r=>r[3].cash];
  const u=hUnit(hs,['rev','np','cash']);
  let h=`<div class="f-card f-rt"><div class="f-rh"><span class="c0">${FMT.uName(u)}</span><span class="cv">${L('выручка','revenue')}</span><span class="cv">${L('прибыль','profit')}</span><span class="cv">${L('деньги','cash')}</span></div>`;
  for(const r of rows)h+=`<div class="f-rr"><div class="rn">${r[1]}</div><div class="rv"><span class="c0"></span>${cols.map((f,j)=>{const v=f(r);return `<span class="cv${j===1?'':' p'}${v<0?' neg':''}">${mm(v,u)}</span>`;}).join('')}</div></div>`;
  return h+`</div><p class="f-note">${L('Графики по месяцам — на экране «Итоги»: нажмите на график, чтобы увидеть всю историю.','Monthly charts are on the Summary screen: tap a chart to see the full history.')}</p>`;}

/* ================= ФИНАНСЫ (стиль Г): Итоги → Отчёты → отчёт; Банк и Соперники — отдельные входы ================= */
const MON_GEN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MON_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const monGen=m=>en()?MON_EN[m%12]:MON_GEN[m%12];
const LIC={doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>',
  bank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>',
  cup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8M9 18h6"/></svg>'};
const isWide=el=>innerWidth>=900&&(!el||el.clientWidth>=640);
const topBar=(back,title,sub)=>`<div class="f-top">${back?`<button class="f-back" data-a="go" data-v="${back}">← ${back==='reps'?L('Отчёты','Reports'):L('Итоги','Summary')}</button>`:''}<div class="f-tt"><div class="f-ttl">${title}</div>${sub?`<div class="f-sub">${sub}</div>`:''}</div></div>`;
function sayBox(t,mood){let svg='';try{svg=(window.UI&&UI.face)?UI.face(mood||'calm'):typeof advisorSvg==='function'?advisorSvg(mood||'calm'):'';}catch(e){}
  return `<div class="f-card f-say"><div class="pp">${svg}</div><div class="st"><div class="sn">${ADV.name()}, ${L('главбух','chief accountant')}</div>${t}</div></div>`;}
function sparkSvg(v,w){if(v.length<2)return '';return draw({lbl:v.map((x,i)=>i),kind:'line',ser:[{v,col:CV.cash}]},Math.max(80,Math.round(w)),36,{spark:true}).svg;}
const sgnM=x=>(x>0?'+':x<0?'−':'')+FMT.money(Math.abs(x));
function kpi(k,label,v,dHtml,sp,hot){return `<button class="f-card f-kpi${hot?' hot':''}" data-a="kpi" data-v="${k}"><div class="kl">${label}</div><div class="kv">${FMT.money(v)}</div><div class="kd">${dHtml||'&nbsp;'}</div><div class="spk">${sp}</div></button>`;}
const dArrow=(d,good,txt)=>{if(d==null)return '';const cls=Math.abs(d)<dThr||good==null?'f-eq':(d>0)===good?'f-up':'f-dn';return `<span class="${cls}">${d>0?'▲':d<0?'▼':'•'} ${sgnM(d)}${txt?' '+txt:''}</span>`;};
function finSum(w,el){const wide=isWide(el),r=w.reps[w.reps.length-1],p=w.reps[w.reps.length-2],cur=!r,R=r||curRep(w);
  const net=E.netOf(R.pl),hs=w.hist.slice(-12),cw=wOf(el),kw=wide?(cw-40)/4-28:(cw-10)/2-28;dThr=Math.min(5e4,hUnit(hs,['np','cash','debt','eq'])*.05);
  const title=cur?L('Этот месяц','This month'):(en()?MON_EN[R.m%12]+' results':'Итоги '+monGen(R.m));
  const sub=cur?L('первый отчёт будет в конце месяца','the first report comes at month end'):L('нажмите на карточку — разберём подробно','tap a card for details');
  const mt=E.metrics(w),de=mt?mt.de:0,debt=R.bal.debt;
  const calm=debt<=0?L('долгов нет','no debt'):de>=99?'':de<2?L('· спокойно','· calm'):de<3.5?L('· внимательно','· watch it'):L('· много','· too much');
  const K=kpi('np',L('Чистая прибыль','Net profit'),net,p?dArrow(net-E.netOf(p.pl),true,L('к прошлому месяцу','vs last month')):'',sparkSvg(hs.map(x=>x.np),kw),true)
    +kpi('cash',L('Деньги на счёте','Cash in the bank'),R.c1,p?dArrow(R.c1-p.c1,null):'',sparkSvg(hs.map(x=>x.cash),kw))
    +kpi('debt',L('Долг банку','Bank debt'),debt,p?dArrow(debt-p.bal.debt,false,calm):(debt<=0?`<span class="f-eq">${calm}</span>`:''),sparkSvg(hs.map(x=>x.debt),kw))
    +kpi('val',!w.ned&&!w.ip&&w.st==='gig'?L('Накоплено','Savings'):L('Стоимость компании','Company value'),R.bal.E,p&&p.bal.E>0?`<span class="${R.bal.E>=p.bal.E?'f-up':'f-dn'}">${R.bal.E>=p.bal.E?'▲ +':'▼ −'}${FMT.pct(Math.abs(R.bal.E/p.bal.E-1),1)}</span>`:'',sparkSvg(hs.map(x=>x.eq),kw));
  const kp=`<div class="f-kpis">${K}</div>`;
  let say='';try{const m=ADV.month(R);say=m.t;}catch(e){}
  const say1=sayBox(say||L('Первый месяц — присматриваемся. Итоги подведём при закрытии.','The first month — we’re getting our bearings. Results at month end.'),net>0?'happy':net<0&&R.pl.rev>0?'worry':'calm');
  const early=!w.ned&&w.st==='gig';const o=E.loanOffer(w);let pay=0;for(const l of w.loans)pay+=Math.round(l.a*l.r/12)+Math.min(l.a,Math.round(E.loanPay(l)));
  const rv=[{v:GAME.value(),me:1}].concat(w.bots.map(b=>({v:E.botValue(w,b)}))).sort((a,b)=>b.v-a.v),pos=rv.findIndex(x=>x.me)+1;
  const lst=`<div class="f-card f-lst">
    ${window.CASHUI?`<button data-a="go" data-v="cash"><span class="lic">📅</span><div class="li"><b>${L('Деньги на 30 дней','Money for 30 days')}</b><span>${CASHUI.finSub(w)}</span></div><span class="chev">›</span></button>`:''}
    <button data-a="go" data-v="reps"><span class="lic">${LIC.doc}</span><div class="li"><b>${L('Полные отчёты','Full reports')}</b><span>${L('БДР, ДДС, баланс, показатели, история','P&L, cash flow, balance, ratios, history')}</span></div><span class="chev">›</span></button>
    ${early?`<div class="f-lock" style="padding:12px 14px;color:var(--muted);font-size:16px">🔒 ${L('Банк и соперники откроются со своим делом — в главе 2. Пока копим и берём заказы.','Bank and rivals open with your own business — in chapter 2. For now we save and take jobs.')}</div>`:''}
    ${early?'':`<button data-a="go" data-v="bank"><span class="lic">${LIC.bank}</span><div class="li"><b>${L('Банк и кредиты','Bank & loans')}</b><span>${w.loans.length?`${L('Долг','Debt')} ${FMT.money(debtOfW(w))} · ${L('платёж','payment')} ${FMT.money(pay)} ${L('в конце месяца','at month end')}`:`${L('Долгов нет · банк даст до','No debt · the bank lends up to')} ${FMT.money(o.max)}`}</span></div><span class="chev">›</span></button>`}
    ${early?'':`<button data-a="go" data-v="riv"><span class="lic">${LIC.cup}</span><div class="li"><b>${L('Соперники и рейтинг','Rivals & leaderboard')}</b><span>${rv.length>1?L('Вы','You are')+' '+pos+L('-й из',' of')+' '+rv.length:L('соперники появятся в «Недрах»','rivals appear in Mining')} · ${L('стоимость','value')} ${FMT.money(GAME.value())}</span></div><span class="chev">›</span></button>`}</div>`;
  const rng=[[3,L('3 мес','3 mo')],[6,L('6 мес','6 mo')],[12,L('Год','Year')],[0,L('Всё','All')]];
  const chW=wide?Math.round((cw-18)*1.45/2.45)-34:cw-34;
  const ch=w.hist.length?`<div class="f-card"><div class="f-hdr"><b style="font-weight:600">${L('Выручка и прибыль','Revenue and profit')}</b><span class="f-mut">${FMT.uName(revSpec(st.rn).u)}</span></div>
    <div class="f-tabs n4" style="margin:10px 0 6px">${rng.map(([n,t])=>`<button class="f-tab${st.rn===n?' on':''}" data-a="rn" data-v="${n}">${t}</button>`).join('')}</div>
    <div class="f-ch2">${chartBox('fin:rev',revSpec,st.rn,chW,wide?240:210)}</div>${leg([[CV.rev,L('Выручка','Revenue')],[CV.np,L('Чистая прибыль','Net profit')],[CV.bad,L('Убыток','Loss')]])}
    <div class="f-mut" style="font-size:14px">${L('ведите пальцем — цифры, нажмите — крупно','slide for figures, tap to enlarge')}</div></div>`:'';
  const top=`<div class="f-top"><div class="f-tt"><div class="f-ttl">${title}</div><div class="f-sub">${sub}</div></div></div>`;
  if(wide)return `${top}${kp}<div class="f-cols"><div class="col w2">${ch}</div><div class="col">${say1}${lst}${anBtn()}</div></div>`;
  return `${top}${say1}${kp}${lst}${anBtn()}${ch}`;}
const anBtn=()=>{try{return window.FDT?FDT.btnHtml():'';}catch(e){return '';}};
function debtOfW(w){let d=0;for(const l of w.loans)d+=l.a;return d;}
// «Откуда прибыль»: водопад выручка → чистая, мост прибыль → деньги
function finProfit(w,el){const wide=isWide(el),list=repList(w),R=w.reps[w.reps.length-1]||curRep(w),P=w.reps[w.reps.length-2]||null,p=R.pl,net=E.netOf(p),ea=w.ned===false;
  const rows0=[[L('Выручка','Revenue'),p.rev,'t'],[L('Сырьё и переменные затраты','Materials & variable costs'),-p.cogs],[ea?L('Аренда и зарплаты','Rent & wages'):L('Постоянные расходы','Fixed costs'),-p.fix],[ea?L('Доставка','Delivery'):L('Логистика (ж/д)','Logistics (rail)'),-p.log],
    [ea?L('Жизнь, взносы, бухгалтер','Living costs, contributions, accountant'):L('Офис','Office'),-p.adm],[L('Разведка','Exploration'),-p.expl],[L('Амортизация','Depreciation'),-p.dep],[L('Прочие доходы и расходы','Other income & expenses'),p.oth],[L('Проценты банку','Interest'),-p.int],[ea?L('Налог','Tax'):L('Налог 25 %','Tax 25%'),-p.tax],[L('Чистая прибыль','Net profit'),net,'t']]
  ;// одна единица на весь экран (водопад и мост); строка прячется, только если в этой единице она меньше 0,05
  const dInv=R.bal.inv-(P?P.bal.inv:0),inv=E.sumCF(R.cf,'i'),fin=E.sumCF(R.cf,'f'),dc=R.c1-R.c0,oth=dc-(net+p.dep-dInv+inv+fin);
  const u=FMT.unitOf(rows0.map(x=>x[1]).concat([dInv,inv,fin,dc,oth])),rows=rows0.filter(x=>x[2]||Math.abs(x[1])>=u*.05);
  let run=0,lo=0,hi=Math.max(1,p.rev);const seg=[];for(const [n,v,t] of rows){let a,b;if(t){a=Math.min(0,v);b=Math.max(0,v);run=v;}else{a=Math.min(run,run+v);b=Math.max(run,run+v);run+=v;}seg.push([a,b]);lo=Math.min(lo,a);hi=Math.max(hi,b);}
  const sc=x=>(x-lo)/(hi-lo)*100;
  const wf='<div class="f-wf">'+rows.map(([n,v,t],i)=>{const [a,b]=seg[i],col=t?(i===0?'var(--accent,#2e5bff)':v>=0?'var(--good,#12a150)':'var(--bad,#e5484d)'):v>=0?'var(--good,#12a150)':'var(--wneg,#f4b4b6)';
    return `<div class="wr"><div class="wl"><span>${n}</span><b class="${t?'':v<0?'f-dn':'f-up'}">${t?FMT.inU(v,u):(v>0?'+':'')+FMT.inU(v,u)}</b></div><div class="wb"><i style="left:${sc(a).toFixed(2)}%;width:${Math.max(.8,sc(b)-sc(a)).toFixed(2)}%;background:${col}"></i></div></div>`;}).join('')+'</div>';
  // мост: прибыль → деньги
  const br=[[L('Чистая прибыль','Net profit'),net],[L('+ Амортизация (расход без денег)','+ Depreciation (non-cash cost)'),p.dep],
    [dInv>0?L('− Деньги ушли в запасы на складах','− Cash tied up in inventory'):L('+ Склад уменьшился','+ Inventory went down'),-dInv],
    [inv<=0?L('− Стройка, лицензии, вагоны','− Construction, licences, wagons'):L('+ Продажа активов','+ Asset sales'),inv],
    [fin>=0?L('+ Кредиты и взносы в капитал','+ Loans and capital paid in'):L('− Вернули банку','− Repaid to the bank'),fin],
    [L('± Прочее (расчёты, налоги)','± Other (settlements, taxes)'),oth],[dc>=0?L('= Денег стало больше на','= Cash went up by'):L('= Денег стало меньше на','= Cash went down by'),dc]]
    .filter((x,i)=>i===0||i===6||Math.abs(x[1])>=u*.05);
  const brg=`<div class="f-brg">${br.map(([n,v],i)=>`<div class="br${i===br.length-1?' tot':''}"><span>${n}</span><b class="${v<0?'f-dn':i===br.length-1?'f-up':''}">${(v>0?'+':'')+FMT.inU(v,u)}</b></div>`).join('')}</div>`;
  const costs=rows.filter(x=>!x[2]&&x[1]<0).sort((a,b)=>a[1]-b[1]),big=costs[0];
  const per=p.rev?Math.round(net/p.rev*100):0;
  const say=!p.rev?L('Выручки пока нет — продавать нечего. Прибыль появится, когда заработает добыча.','No revenue yet — nothing to sell. Profit will come once production starts.')
    :(per>=0?L(`Из каждых 100 ₽ выручки нам остаётся <b>${per} ₽</b>.`,`Out of every 100 ₽ of revenue we keep <b>${per} ₽</b>.`):L(`С каждых 100 ₽ выручки мы теряем <b>${-per} ₽</b>.`,`We lose <b>${-per} ₽</b> on every 100 ₽ of revenue.`))
      +(big?' '+L(`Больше всего съедает статья «${esc(big[0])}».`,`The biggest bite is “${esc(big[0])}”.`):'');
  const top=topBar('sum',L('Откуда прибыль','Where profit comes from'),(R.cur?L('Сейчас · ','Now · '):'')+FMT.date(R.m)+' · '+FMT.uName(u));
  const cardW=`<div class="f-card">${wf}</div>`,cardB=`<div class="f-card"><b style="font-size:18px;font-weight:600">${L('Почему деньги изменились не так, как прибыль','Why cash changed differently from profit')}</b>${brg}</div>`,
    btn=`<button class="f-card f-nxt" data-a="rep" data-v="pl"><span>${L('Все строки','All lines')}</span><b>${L('Полный отчёт БДР →','Full P&L report →')}</b></button>`;
  if(wide)return `${top}<div class="f-cols"><div class="col w2">${cardW}</div><div class="col">${sayBox(say,per>=0?'calm':'worry')}${cardB}${btn}</div></div>`;
  return `${top}${sayBox(say,per>=0?'calm':'worry')}${cardW}${cardB}${btn}`;}
function repIdx(w,list){let i=st.rm==null?(w.reps.length?w.reps.length-1:0):list.findIndex(x=>x.m===st.rm);if(i<0)i=list.length-1;return i;}
function repListHtml(list,i,sel){const r=list[i],net=E.netOf(r.pl),dc=r.c1-r.c0,mt=E.metrics(Wd());
  const v={pl:`${L('Чистая прибыль','Net profit')} <b class="${net>=0?'f-up':'f-dn'}">${sgnM(net)}</b>`,cf:`${L('За месяц','This month')} <b class="${dc>=0?'f-up':'f-dn'}">${sgnM(dc)}</b>`,
    bs:`${L('Капитал','Equity')} <b>${FMT.money(r.bal.E)}</b>`,mx:mt?`ROE <b>${FMT.pct(mt.roe)}</b> · ${L('долг/EBITDA','debt/EBITDA')} <b>${mt.de>=99?'—':num(mt.de,1)}</b>`:'',
    hist:`<b>${Wd().hist.length}</b> ${pl(Wd().hist.length,'месяц','месяца','месяцев','month','months')}`};
  return `<div class="f-card f-lst f-rl">${RK_ORD.map(k=>`<button class="${sel===k?'sel':''}" data-a="rep" data-v="${k}"><span class="lic">${rkA(k)}</span><div class="li"><b>${rkT(k)}</b><span>${rkD(k)}</span>${v[k]?`<span class="v2">${v[k]}</span>`:''}</div><span class="chev">›</span></button>`).join('')}</div>`;}
function nextBtn(k){const n=RK_ORD[(RK_ORD.indexOf(k)+1)%RK_ORD.length];return `<button class="f-card f-nxt" data-a="rep" data-v="${n}"><span>${L('Следующий отчёт','Next report')}</span><b>${rkT(n)} →</b></button>`;}
function finReps(w,el){const list=repList(w),i=repIdx(w,list),wide=isWide(el);
  if(wide){const k=st.rk||'pl';return topBar('sum',L('Отчёты','Reports'),L('выберите отчёт слева','pick a report on the left'))
    +`<div class="f-cols"><div class="col w08">${mswHtml(list,i)}${repListHtml(list,i,k)}${anBtn()}</div><div class="col w2"><div class="f-ttl" style="font-size:22px;margin:4px 4px 10px">${rkT(k)} <span class="ab">${rkA(k)}</span></div>${repBody(list,i,k)}${nextBtn(k)}</div></div>`;}
  return topBar('sum',L('Отчёты','Reports'),L('выберите отчёт — откроется на весь экран','pick a report — it opens full screen'))+mswHtml(list,i)+repListHtml(list,i,null)+anBtn()
    +sayBox(L('Начните с БДР: он отвечает на главный вопрос — заработали мы или нет.','Start with the P&L: it answers the main question — did we make money.'),'calm');}
function finRep1(w,el){const list=repList(w),i=repIdx(w,list),k=st.rk||'pl';
  return topBar('reps',`${rkT(k)} <span class="ab">${rkA(k)}</span>`,rkD(k))+(k==='mx'||k==='hist'?'':mswHtml(list,i))+repBody(list,i,k)+nextBtn(k);}

const grOf=(n,g)=>Math.max(0,Math.min(12,g|0,n-6));
function loanFirst(a,n,k,rate,g){const i=rate/12;g=grOf(n,g);if(g>0)return {int:a*i,body:0};if(k==='eq')return {int:a*i,body:a/n};const t=a*i/(1-Math.pow(1+i,-n));return {int:a*i,body:t-a*i};}
function loanAfter(a,n,k,rate,g){const i=rate/12,m=n-grOf(n,g);if(k==='eq')return a/m+a*i;return a*i/(1-Math.pow(1+i,-m));}
function loanOver(a,n,k,rate,g){const i=rate/12;g=grOf(n,g);const m=n-g;return a*i*g+(k==='eq'?a*i*(m+1)/2:a*i/(1-Math.pow(1+i,-m))*m-a);}
// шаг суммы кредита — от лимита: до 3 млн — 10 тыс., до 30 млн — 100 тыс., дальше — 1 млн (не мельче шага банка ECON.loanUnit)
function loanStep(w,max){const lu=E.loanUnit?E.loanUnit(w):1e6;return Math.max(lu,max<3e6?1e4:max<3e7?1e5:1e6);}
function loanCard(w,l){const i=Math.round(l.a*l.r/12),b=Math.min(l.a,Math.round(E.loanPay(l)));
    const nm=l.k==='mort'?L('Ипотека','Mortgage'):l.k==='fr'?L('Займ друга, без процентов','Loan from a friend, interest-free'):l.k==='od'?L('Овердрафт','Overdraft'):l.san?L('Кредит санации','Restructured loan'):l.k==='eq'?L('Кредит, равными долями','Loan, equal principal'):L('Кредит, аннуитет','Loan, annuity');
    return `<div class="f-card"><b>${nm}</b><div class="f-kv"><span>${L('Остаток долга','Outstanding')}</span><b>${FMT.money(l.a)}</b><span>${L('Ставка','Rate')}</span><b>${FMT.pct(l.r,1)}</b>
      <span>${L('Осталось','Remaining')}</span><b>${l.n} ${pl(l.n,'месяц','месяца','месяцев','month','months')}</b>
      <span>${L('Платёж в конце месяца','Payment at month end')}</span><b>${FMT.money(i+b)}</b><span class="f-mut">${L('проценты + долг','interest + principal')}</span><b class="f-mut">${FMT.money(i)} + ${FMT.money(b)}</b></div>
      ${l.gr>0?`<div class="f-mut">${L('Отсрочка долга ещё','Principal grace for')} ${l.gr} ${pl(l.gr,'месяц','месяца','месяцев','month','months')} — ${L('платим только проценты.','interest only.')}</div>`:''}
      ${l.k==='od'?`<div class="f-mut">${L('Овердрафт гасится целиком в конце месяца.','An overdraft is repaid in full at month end.')}</div>`:''}
      <button class="btn noenter" data-a="repay" data-id="${l.id}"${w.cash<=0?' disabled':''}>${L('Погасить досрочно…','Repay early…')}</button></div>`;}
function finBank(w){let h='';const o=E.loanOffer(w);let dB=0;for(const l of w.loans)if(l.k!=='mort'&&l.k!=='fr')dB+=l.a;const lim=dB+o.max;
  // полоса «взято X из лимита Y» и кредитная история (главы 1–4: нужна 50 для ООО, с кредитом растёт вдвое быстрее)
  // M30: один «лимит» вместо двух чисел рядом; отсрочка 6 мес. по умолчанию, если идёт стройка (кредит берут на неё)
  const bld=w.ned&&w.obj.some(o=>o.st==='b'||o.up);if(!st.lgU){st.lg=bld?6:0;if(bld&&!st.lnU)st.ln=36;}
  const limBar=lim>0?`<div class="f-mut" style="margin-top:10px">${L('Лимит банка','Bank limit')} <b>${FMT.money(lim)}</b>: ${L('взято','used')} <b>${FMT.money(dB)}</b>, ${L('можно ещё','available')} <b>${FMT.money(o.max)}</b></div><div class="f-bar"><i style="width:${Math.max(dB>0?1.5:0,Math.min(100,dB/lim*100)).toFixed(1)}%"></i></div>`:'';
  let chH='';if(!w.ned&&E.chInfo){try{const c=E.chInfo(w),n=Math.floor(c.ch);
    chH=`<div class="f-mut" style="margin-top:8px">${L('Кредитная история','Credit history')} <b>${n}</b> ${c.ok?L('из 100 · для ООО нужно ','of 100 · an LLC needs ')+c.need+' ✓':L('из','of')+` <b>${c.need}</b>`}</div><div class="f-bar"><i style="width:${Math.min(100,c.ch/c.need*100).toFixed(1)}%;background:var(--good,#12a150)"></i></div>`
      +`<div class="f-mut" style="font-size:15px">${c.per<0?L('Минус на счёте в конце месяца (овердрафт) — история падает на 25.','A negative balance at month end (overdraft) cuts the history by 25.'):c.loan?L('Кредит есть — история растёт на 3 в месяц; погасите кредит досрочно — ещё +10.','You have a loan — the history grows by 3 a month; repay it early for +10 more.'):L('Без кредита история растёт на 1,5 в месяц, с кредитом — вдвое быстрее (3 в месяц).','Without a loan the history grows by 1.5 a month, with a loan twice as fast (3 a month).')}`
      +` ${L('Чем она выше, тем больше лимит и ниже ставка; 50 нужно, чтобы открыть ООО.','The higher it is, the bigger the limit and the lower the rate; 50 is needed to open an LLC.')}${!c.ok&&c.eta>0?' '+L('Дойдёт до 50 примерно через','It will reach 50 in about')+' '+c.eta+' '+pl(c.eta,'месяц','месяца','месяцев','month','months')+'.':''}</div>`;}catch(e){}}
  h+=`<div class="f-card"><div class="f-kv"><span>${L('Ключевая ставка ЦБ','Central bank key rate')}</span><b>${FMT.pct(w.key,2)}</b>
    ${o.max>0||w.ned?`${limBar?'':`<span>${L('Банк даст до','Bank will lend up to')}</span><b>${FMT.money(o.max)}</b>`}<span>${L('Под','At')}</span><b>${FMT.pct(o.rate,1)} ${L('годовых','a year')}</b>`:''}</div>${o.max>0||w.ned?'':`<p class="f-mut">${L('Пока банк кредит не даст: нужен доход от своего дела и кредитная история.','The bank won’t lend yet: it needs income from your own business and a credit history.')}</p>`}
    ${w.ned?`<details class="f-mut"><summary>${L('Как банк считает лимит','How the bank sets the limit')}</summary>${L('Лимит: большее из 300 млн ₽ и 3,5 годовой EBITDA (средняя за 3 месяца × 12), плюс 70 % оставшейся стройки, но не больше 1,5 собственного капитала — минус текущий долг. Ставка = ключевая + 3 %; чем больше долг к EBITDA, тем выше ставка.','Limit: the larger of 300m ₽ and 3.5× annual EBITDA (3-month average × 12), plus 70% of remaining construction, but no more than 1.5× equity — minus current debt. Rate = key + 3%; the higher debt to EBITDA, the higher the rate.')}</details>`:''}${limBar}${chH}</div>`;
  const lu=loanStep(w,o.max);
  if(o.max>0){if(st.la==null||st.la>o.max)st.la=Math.min(o.max,Math.max(lu,Math.round(o.max/2/lu)*lu));
    const a=st.la,gr=grOf(st.ln,st.lg),f=loanFirst(a,st.ln,st.lk,o.rate,gr),ov=loanOver(a,st.ln,st.lk,o.rate,gr);
    h+=`<div class="f-card" id="finLoan"><b>${L('Новый кредит','New loan')}</b><div class="f-big" id="flA">${FMT.money(a)}</div>
      <input type="range" class="f-rng" id="flR" min="1" max="${Math.ceil(o.max/lu)}" step="1" value="${Math.min(Math.ceil(o.max/lu),Math.round(a/lu))}" aria-label="${L('Сумма кредита','Loan amount')}">
      <div class="f-chips">${[25,50,100].map(p=>`<button class="f-chip" data-a="la" data-v="${p===100?o.max:Math.min(o.max,Math.max(lu,Math.round(o.max*p/100/lu)*lu))}">${p} %</button>`).join('')}</div>
      <div class="f-mut">${L('Срок','Term')}</div><div class="f-chips n4">${[12,24,36,60].map(n=>`<button class="f-chip${st.ln===n?' on':''}" data-a="ln" data-v="${n}"><small>${L('срок','term')}</small>${n} ${L('мес.','mo')}</button>`).join('')}</div>
      <div class="f-mut">${L('График','Schedule')}</div><div class="f-chips n2"><button class="f-chip${st.lk==='ann'?' on':''}" data-a="lk" data-v="ann">${L('Аннуитет','Annuity')}</button><button class="f-chip${st.lk==='eq'?' on':''}" data-a="lk" data-v="eq">${L('Равными долями','Equal principal')}</button></div>
      <div class="f-mut" style="margin-bottom:6px">${st.lk==='ann'?L('Аннуитет — платёж каждый месяц одинаковый.','Annuity — the same payment every month.'):L('Равными долями — долг гасится поровну, платёж сначала больше, потом меньше; переплата ниже.','Equal principal — debt is repaid in equal parts; payments start higher and fall; less interest overall.')}</div>
      <div class="f-mut">${L('Отсрочка долга','Principal grace period')}</div><div class="f-chips">${[0,6,12].map(g=>`<button class="f-chip${(st.lg|0)===g?' on':''}" data-a="lg" data-v="${g}"${g>st.ln-6?' disabled':''}><small>${L('отсрочка','grace')}</small>${g?g+' '+L('мес.','mo'):L('нет','none')}</button>`).join('')}</div>
      <div class="f-mut" style="margin-bottom:6px">${w.ned?L('Проектный кредит на время стройки: первые месяцы платите только проценты, долг — когда завод заработает.','A project loan for the build period: pay only interest at first, and the principal once the plant is running.'):L('Отсрочка долга: первые месяцы платите только проценты, долг — когда новое дело заработает.','Principal grace: pay only interest at first, and the principal once the new business is running.')}</div>${w.ned?'':`<div class="f-mut" style="margin-bottom:6px">💬 ${L(`Людмила: ${FMT.pct(o.rate,1)} годовых — это ≈ ${FMT.pct(o.rate/12,1)} в месяц. Берите под дело, которое даёт больше (улучшения точек, новая точка, склад), и вкладывайте сразу; если деньги просто лежат на счёте — это переплата ${FMT.money(ov)} за срок.`,`Lyudmila: ${FMT.pct(o.rate,1)} a year is ≈ ${FMT.pct(o.rate/12,1)} a month. Borrow for something that earns more (outlet upgrades, a new outlet, a warehouse) and invest at once; money just sitting in the account costs ${FMT.money(ov)} in interest over the term.`)}</div>`}
      <div class="f-kv"><span>${L('Первый платёж','First payment')}</span><b id="flP">${FMT.money(f.int+f.body)}</b><span>${L('из них проценты','of which interest')}</span><b id="flI">${FMT.money(f.int)}</b>
        ${gr?`<span>${L('После отсрочки','After the grace period')}</span><b id="flG">${FMT.money(loanAfter(a,st.ln,st.lk,o.rate,gr))}</b>`:''}
        <span>${L('Переплата за весь срок','Total interest')}</span><b id="flO">${FMT.money(ov)}</b></div>
      <button class="btn blue noenter" data-a="take">🏦 ${L('Взять кредит','Take the loan')}</button></div>`;}
  else if(dB>0)h+=`<div class="f-warn">${L('Сейчас банк новых денег не даст: лимит исчерпан. Лимит растёт вместе с EBITDA и капиталом.','The bank won’t lend more right now: the limit is used up. It grows with EBITDA and equity.')}</div>`;
  h+=`<h3>${L('Ваши кредиты','Your loans')}</h3>`;
  if(!w.loans.length)h+=`<div class="f-card f-mut">${L('Долгов нет — спим спокойно.','No debt — sleeping soundly.')}</div>`;
  // M30: больше трёх кредитов — крупные и овердрафт сверху, мелкие старые свёрнуты в одну строку
  let lsh=w.loans;if(w.loans.length>3&&!st.lAll){const so=w.loans.slice().sort((x,y)=>((y.k==='od')-(x.k==='od'))||y.a-x.a);lsh=so.slice(0,2);const rest=so.slice(2);let ra=0,rp=0;for(const l of rest){ra+=l.a;rp+=Math.round(l.a*l.r/12)+Math.min(l.a,Math.round(E.loanPay(l)));}
    h+=lsh.map(l=>loanCard(w,l)).join('')+`<button class="f-card f-rr noenter" data-a="lall" style="width:100%;text-align:left;font-size:17px">${L(`Ещё ${rest.length} ${pl(rest.length,'кредит','кредита','кредитов','loan','loans')} · ${FMT.money(ra)} · платёж ${FMT.money(rp)} в месяц`,`${rest.length} more ${rest.length===1?'loan':'loans'} · ${FMT.money(ra)} · payment ${FMT.money(rp)} a month`)} ▾</button>`;lsh=[];}
  else if(w.loans.length>3)h+=`<button class="f-chip" data-a="lall" style="margin-bottom:8px">▴ ${L('Свернуть мелкие','Collapse small ones')}</button>`;
  for(const l of lsh)h+=loanCard(w,l);
  h+=`<div class="${w.odM>0?'f-warn':'f-tip'}">☂ ${L('Если при закрытии месяца денег не хватит, банк сам даст овердрафт на месяц (ключевая + 8 %). Санация — только если овердрафт нужен третий месяц подряд, долг больше 4 годовых EBITDA (или EBITDA не больше нуля) и больше четверти капитала: тогда банк продаст часть активов за 60 % цены и сведёт долги в один кредит на 5 лет. Игра продолжится.','If cash runs short at month end, the bank gives an automatic one-month overdraft (key rate + 8%). Restructuring happens only if an overdraft is needed for the third month in a row, debt exceeds 4× annual EBITDA (or EBITDA is zero or less) and is over a quarter of equity: then the bank sells some assets at 60% and rolls debts into one 5-year loan. The game goes on.')}</div>`;
  return h;}
const BOT_CH={cautious:['Осторожный семейный бизнес: без долгов и резких движений.','A cautious family business: no debt, no sudden moves.'],
  bold:['Напористый: берёт кредиты, строит много и давит ценой.','Pushy: borrows, builds a lot and undercuts on price.'],
  calc:['Расчётливая: торгуется до последнего, но не переплачивает.','Calculating: bargains hard but never overpays.'],
  wood:['Лесной и мирный: пилит лес в Карелии и никого не трогает.','Woodland and peaceful: saws timber in Karelia and bothers no one.']};
function finRiv(w,el){let h=topBar('sum',L('Соперники и рейтинг','Rivals & leaderboard'),L('стоимость компании = капитал','company value = equity'));
  const me={you:1,n:L('Вы','You'),who:L('ваш холдинг','your holding'),v:GAME.value(),k:w.obj.length,col:CV.eq};
  const rows=[me].concat(w.bots.map(b=>{const d=E.BOTS.find(x=>x.id===b.id)||{};return {id:b.id,n:NM.bot(b.id),who:NM.who(b.id),v:E.botValue(w,b),k:b.as.length,col:botCol(b.id),ch:d.ch};}));
  rows.sort((a,b)=>b.v-a.v);
  const tbl='<div class="f-card">'+rows.map((r,i)=>`<div class="f-riv${r.you?' me':''}"><span class="dot" style="background:${r.col}"></span><div><b>${i+1}. ${esc(r.n)}</b><small>${esc(r.who)}${r.ch&&BOT_CH[r.ch]?' — '+low1(L(BOT_CH[r.ch][0],BOT_CH[r.ch][1])):''}</small></div><div class="v">${FMT.money(r.v)}<small>${r.k} ${pl(r.k,'объект','объекта','объектов','site','sites')}</small></div></div>`).join('')
    +`<p class="f-note" style="margin-bottom:0">${L('Стоимость = капитал: деньги и имущество за вычетом долгов.','Value = equity: cash and assets minus debt.')}</p></div>`;
  const wide=isWide(el),cw=wOf(el),chW=wide?Math.round((cw-18)/2)-34:cw-34;
  const ch=(w.hist.length||w.bots.some(b=>b.v.length))?`<div class="f-card"><b style="font-weight:600">${L('Стоимость по месяцам','Value by month')}</b>`+leg([[CV.eq,L('Вы','You'),1]].concat(w.bots.map(b=>[botCol(b.id),NM.bot(b.id),1])))
    +`<div class="f-ch2">${chartBox('riv',rivSpec,24,chW,220)}</div><div class="f-mut" style="font-size:14px">${FMT.uName(rivSpec(24).u)} · ${L('ведите пальцем — цифры, нажмите — крупно','slide for figures, tap to enlarge')}</div></div>`:'';
  const wgx=GAME.weekGain(),wg=wgx.gain,lbOk=typeof LB!=='undefined'&&LB.ok&&LB.ok();
  const lb=lbOk?`<div class="f-card"><b style="font-weight:600">🏆 ${L('Лучшая неделя','Best week')}</b><div class="f-mut" style="margin:4px 0">${L('Рейтинг игроков: на сколько процентов выросла стоимость компании за календарную неделю — честно и для новичка. Сейчас','Players’ leaderboard: by what percentage company value grew over a calendar week — fair for newcomers too. Now')}: <b>+${LB.pct?LB.pct(wgx.score):FMT.pct(wgx.pct)}</b> (${sgnMoney(wg)})</div><div class="f-b1"><button class="btn noenter" data-a="lb">${L('Открыть рейтинг','Open leaderboard')}</button></div></div>`:'';
  const fame=(typeof S!=='undefined'&&Array.isArray(S.fame))?S.fame:[];
  const fm=`<div class="f-sec">🏛 ${L('Зал славы IPO','IPO Hall of Fame')}</div>`+(!fame.length?`<div class="f-card f-mut">${L('Пока пусто. Выведите холдинг на биржу — и он займёт здесь место.','Empty so far. Take your holding public and it will take its place here.')}</div>`
    :'<div class="f-card">'+fame.map(f=>`<div class="f-riv"><span class="dot" style="background:var(--gold,#c8773a)"></span><div><b>${L('Холдинг №','Holding #')}${f.hold}</b><small>IPO — ${FMT.date(f.m)}${f.fs?' · '+L('доля основателя','founder shares')+': '+f.fs:''}</small></div><div class="v">${FMT.money(f.eq)}</div></div>`).join('')+'</div>');
  if(wide)return h+`<div class="f-cols"><div class="col">${tbl}${lb}</div><div class="col">${ch}${fm}</div></div>`;
  return h+tbl+ch+lb+fm;}
const VIEWS={sum:'sum',rep:'reps',reps:'reps',rep1:'rep',bank:'bank',riv:'riv',profit:'profit',cash:'cash'};
function scrollTop0(el){let p=el;while(p&&p!==document.body){const oy=getComputedStyle(p).overflowY;if(p.scrollHeight>p.clientHeight&&(oy==='auto'||oy==='scroll')){p.scrollTop=0;break;}p=p.parentElement;}try{if(document.scrollingElement)document.scrollingElement.scrollTop=0;}catch(e){}}
function go(el,v){const was=st.fv;st.fv=v;renderFin(el);if(was!==v)scrollTop0(el);}
function renderFin(el,tab){if(!el)return;css();lastF=el;if(tab)st.fv=VIEWS[tab]||tab;const w=Wd();if(!w){el.innerHTML='';return;}
  let v=st.fv||'sum';if(v==='rep'&&isWide(el))v='reps';if(v==='reps'&&!isWide(el)&&st.fv==='rep')v='rep';
  const body=v==='cash'&&window.CASHUI?topBar('sum','📅 '+L('Деньги на 30 дней','Money for 30 days'),L('что придёт и что уйдёт — по дням','what comes in and goes out — day by day'))+CASHUI.finHtml(w):v==='profit'?finProfit(w,el):v==='reps'?finReps(w,el):v==='rep'?finRep1(w,el):v==='bank'?topBar('sum',L('Банк и кредиты','Bank & loans'),L('ставки, лимит и ваши кредиты','rates, limit and your loans'))+finBank(w):v==='riv'?finRiv(w,el):finSum(w,el);
  el.innerHTML=`<div class="fin${isWide(el)?' f-wide':''}">${body}</div>`;
  el.onclick=e=>{const b=e.target.closest('[data-a]');if(!b||!el.contains(b)||b.disabled)return;const a=b.dataset.a;if(a==='nop')return;snd('tap');
    if(a==='go'){go(el,b.dataset.v);}
    else if(a==='kpi'){const k=b.dataset.v;if(k==='np')go(el,'profit');else if(k==='debt')go(el,'bank');else if(k==='val')go(el,'riv');else{CH['fin:cash']=CH['fin:cash']||{mk:cashSpec};openChart('fin:cash');}}
    else if(a==='rep'){st.rk=b.dataset.v;go(el,isWide(el)?'reps':'rep');}
    else if(a==='rn'){st.rn=+b.dataset.v;renderFin(el);}
    else if(a==='hx'){st.hx=st.hx===b.dataset.v?null:b.dataset.v;renderFin(el);}
    else if(a==='rprev'||a==='rnext')monthStep(el,a==='rprev'?-1:1);
    else if(a==='mx'){st.mx=st.mx===b.dataset.v?null:b.dataset.v;renderFin(el);}
    else if(a==='lb'){try{LB.show();}catch(x){}}
    else if(a==='la'){st.la=+b.dataset.v;renderFin(el);}
    else if(a==='ln'){st.ln=+b.dataset.v;st.lnU=1;st.lg=grOf(st.ln,st.lg);st.lgU=1;renderFin(el);}
    else if(a==='lk'){st.lk=b.dataset.v;renderFin(el);}
    else if(a==='lg'){st.lg=+b.dataset.v;st.lgU=1;renderFin(el);}
    else if(a==='lall'){st.lAll=!st.lAll;renderFin(el);}
    else if(a==='take'){const r=GAME.act('takeLoan',st.la,st.ln,st.lk,grOf(st.ln,st.lg));if(r==='ok'){snd('coin');toastS(L('Деньги на счёте: ','Money in the account: ')+FMT.money(st.la));st.la=null;}else{snd('no');toastS(L('Банк отказал: лимит исчерпан','The bank declined: limit reached'));}renderFin(el);}
    else if(a==='repay')openRepay(b.dataset.id);};
  el.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.f-rr[data-a]')){e.preventDefault();e.target.click();}};
  swipe(el,d=>monthStep(el,d));
  const rg=el.querySelector('#flR');if(rg)rg.oninput=()=>{const o=E.loanOffer(Wd());st.la=Math.min(o.max,+rg.value*loanStep(Wd(),o.max));const gr=grOf(st.ln,st.lg),f=loanFirst(st.la,st.ln,st.lk,o.rate,gr);const gg=el.querySelector('#flG');if(gg)gg.textContent=FMT.money(loanAfter(st.la,st.ln,st.lk,o.rate,gr));
    el.querySelector('#flA').textContent=FMT.money(st.la);el.querySelector('#flP').textContent=FMT.money(f.int+f.body);el.querySelector('#flI').textContent=FMT.money(f.int);el.querySelector('#flO').textContent=FMT.money(loanOver(st.la,st.ln,st.lk,o.rate,gr));};}
function monthStep(el,d){const w=Wd(),list=repList(w);let i=repIdx(w,list);const j=clamp(i+d,0,list.length-1);if(j===i)return;st.rm=list[j].m;renderFin(el);}
// свайп влево/вправо по переключателю месяцев и по отчёту — соседний месяц
function swipe(el,fn){if(el._sw)return;el._sw=1;let s=null;
  el.addEventListener('pointerdown',e=>{const z=e.target.closest&&e.target.closest('[data-swipe],.f-rt');if(!z||e.target.closest('.f-ich'))return;s={x:e.clientX,y:e.clientY,t:Date.now()};},{passive:true});
  el.addEventListener('pointerup',e=>{if(!s)return;const dx=e.clientX-s.x,dy=e.clientY-s.y,dt=Date.now()-s.t;s=null;if(Math.abs(dx)>70&&Math.abs(dy)<Math.abs(dx)*.6&&dt<700){fn(dx<0?1:-1);}},{passive:true});
  el.addEventListener('pointercancel',()=>{s=null;},{passive:true});}

function openRepay(id){const w=Wd(),l=w.loans.find(x=>x.id===id);if(!l)return;const max=Math.min(l.a,Math.max(0,w.cash));if(max<=0){toastS(L('Нет свободных денег','No spare cash'));return;}
  const opts=[.25,.5,1].map(k=>Math.round(max*k)).filter((v,i,a)=>v>0&&a.indexOf(v)===i);
  modal(`<div id="finDlg"><h2>${L('Погасить досрочно','Repay early')}</h2><p>${L('Остаток долга','Outstanding')}: <b>${FMT.money(l.a)}</b>. ${L('На счёте','In the account')}: <b>${FMT.money(w.cash)}</b>.</p>
    <p class="f-mut">${L('Досрочное погашение без штрафов; проценты дальше считаются с меньшего остатка. Не отдавайте последние деньги — зарплату и сырьё платить нечем будет.','No early repayment fee; interest is then charged on the smaller balance. Don’t hand over your last money — you still need to pay for wages and materials.')}</p>
    <div class="f-chips${opts.length===2?' n2':''}">${opts.map(v=>`<button class="f-chip" data-v="${v}">${v>=l.a?L('Всё','All')+' · ':''}${FMT.money(v)}</button>`).join('')}</div>
    <div class="row"><button class="btn" id="mCancel" data-esc>${L('Отмена','Cancel')}</button></div></div>`);
  setRe(()=>openRepay(id));
  document.querySelectorAll('#finDlg .f-chip').forEach(b=>b.onclick=()=>{const r=GAME.act('repay',id,+b.dataset.v);hideModal();if(r==='ok'){snd('coin');toastS(L('Погашено: ','Repaid: ')+FMT.money(+b.dataset.v));}FIN.refresh();});
  document.getElementById('mCancel').onclick=hideModal;}

/* окно отчётов месяца (зовёт UI-1 из окна закрытия месяца) */
function openReport(m,kind){const w=Wd();if(!w)return;css();const list=repList(w);let i=list.findIndex(x=>x.m===m);if(i<0)i=Math.max(0,w.reps.length-1);
  let k=kind||'pl';
  const draw=()=>{modal(`<div id="finRep" class="fin"><h2>${L('Отчёты','Reports')}</h2>${repBlock(list,i,k)}${anBtn()}<div class="row"><button class="btn" id="mCancel" data-esc>${L('Закрыть','Close')}</button></div></div>`);
    setRe(()=>openReport(list[i].m,k));
    const box=document.getElementById('finRep');box.onclick=e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled||b.dataset.a==='nop')return;snd('tap');
      if(b.dataset.a==='tab'){k=b.dataset.v;draw();}else if(b.dataset.a==='hx'){st.hx=st.hx===b.dataset.v?null:b.dataset.v;draw();}else if(b.dataset.a==='rprev'&&i>0){i--;draw();}else if(b.dataset.a==='rnext'&&i<list.length-1){i++;draw();}};
    document.getElementById('mCancel').onclick=e=>{e.stopPropagation();hideModal();};};
  draw();}

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-finpro]');if(!b)return;e.preventDefault();e.stopPropagation();const x=b.parentNode.querySelector('.f-prox');if(x){x.hidden=!x.hidden;b.setAttribute('aria-expanded',!x.hidden);}},true);
// каждый игровой день: на «Рынке» обновляем только цифры (склад, цена, стрелка), без перерисовки
function dayUpd(){if(!vis(lastM))return;const w=Wd();if(!w)return;if(st.mt==='con'){if(!document.querySelector('#finDlg'))renderMarket(lastM);return;}const r=st.r;
  for(const g of E.GL){const e=lastM.querySelector(`[data-gs="${g}"]`);if(e)e.innerHTML=stockHtml(w,r,g);
    const p=lastM.querySelector(`[data-gp="${g}"]`);if(p)p.innerHTML=`${num(E.price(w,r,g))} ₽/${NM.unit(g)}`;
    const c=lastM.querySelector(`[data-gc="${g}"]`);if(c)c.innerHTML=chgHtml(chgOf(w,g));
    const sb=lastM.querySelector(`[data-a="sell"][data-g="${g}"]`);if(sb)sb.disabled=w.inv[r][g].q<1;}}
try{GAME.on('day',dayUpd);}catch(e){}
function refresh(){if(vis(lastM))renderMarket(lastM);if(vis(lastF))renderFin(lastF);}
let rsT=0;window.addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{if(vis(lastF))renderFin(lastF);},250);});
window.FIN={bankFor(a){st.fv='bank';if(a>0)st.la=a;},   // M30: «Кредит на оборотку» из карточки склада — открыть «Банк» с суммой
  renderMarket,renderFin,openReport,refresh,openSell,openBuy,icon,newOffers,
  chart:{box:chartBox,open:openChart,hide:hideTip,price:priceSpec,rev:revSpec,cash:cashSpec,riv:rivSpec,CV},
  get state(){return st;}};

/* ================= ГЛАВБУХ ЛЮДМИЛА САННА ================= */
const P=(ru,e)=>({ru,en:e});
const A={
  san:a=>[P('Банк провёл санацию: часть имущества продана, долги сведены в один кредит. Ничего, выдохнем и начнём аккуратнее — главное, мы в деле.','The bank restructured us: some assets sold, debts rolled into one loan. Deep breath, we start again more carefully — we’re still in business.'),
    P('Санация — не конец, а урок. Долг теперь один и на пять лет. Больше не рискуем последними деньгами, договорились?','Restructuring isn’t the end, it’s a lesson. One loan now, over five years. No more gambling our last money, deal?')],
  od:a=>[P('Мы в овердрафте — это самый дорогой кредит (ключевая + 8 %). Если идёт стройка, возьмём проектный кредит с отсрочкой на полгода: он дешевле, а овердрафт вернём в конце месяца. Три месяца подряд в минусе при большом долге — и банк начнёт продавать имущество.','We’re on an overdraft — the most expensive loan (key rate + 8%). If we’re building, let’s take a project loan with a six-month grace period: it’s cheaper, and the overdraft is repaid at month end. Three months in the red with heavy debt and the bank starts selling assets.'),
    P('Счёт в минусе, банк выручил овердрафтом. Его доброта не бесконечна — давайте поправим деньги, пока не поздно.','The account is negative; the bank covered us with an overdraft. Its kindness has limits — let’s fix cash while we can.')],
  cash:a=>a.n<1?[P('Деньги на исходе: до конца месяца может не хватить. Продайте запасы или возьмите кредит, пока не поздно.','Cash is running out: it may not last the month. Sell stock or take a loan while there’s time.'),
      P('Касса почти пустая, а платежи впереди. Я уже пью валерьянку — давайте что-нибудь продадим.','The till is nearly empty and payments are ahead. I’m reaching for the valerian — let’s sell something.')]
    :[P(`Денег хватит примерно на ${a.n} ${plural(a.n,'месяц','месяца','месяцев')}. Пора подумать о продажах или кредите.`,`Cash will last about ${a.n} ${a.n===1?'month':'months'}. Time to think about sales or a loan.`),
      P(`По моим подсчётам, запаса денег — на ${a.n} ${plural(a.n,'месяц','месяца','месяцев')}. Не пугаю, но календарь держу под рукой.`,`By my count we have cash for ${a.n} ${a.n===1?'month':'months'}. Not scaring you, but I keep the calendar handy.`)],
  full:a=>[P(`Склад ${rIn(a.r,0)} почти полон — продавайте или стройте ещё склад, иначе добыча встанет.`,`The warehouse ${rIn(a.r,1)} is almost full — sell or build another one, or mining will stop.`),
    P(`${cap(rIn(a.r,0))} склад трещит по швам. Товар, который лежит, денег не приносит.`,`The warehouse ${rIn(a.r,1)} is bursting. Goods lying around earn nothing.`)],
  input:a=>[P(`${NM.obj(a.t)} ${regIn(a.r)} стоит: не хватает ${gGen(a.g)}. Включите автозакупку или привезите поездом.`,`The ${NM.obj(a.t).toLowerCase()} ${regIn(a.r)} is idle: short of ${gGen(a.g)}. Turn on auto-buy or ship it in by rail.`),
    P(`Завод без сырья — как борщ без свёклы. ${NM.obj(a.t)} ${regIn(a.r)} ждёт ${gAcc(a.g)}.`,`A plant without raw materials is like borscht without beetroot. The ${NM.obj(a.t).toLowerCase()} ${regIn(a.r)} is waiting for ${gAcc(a.g)}.`)],
  depleted:a=>[P(`${NM.obj(a.t)} ${regIn(a.r)} выработан до дна. Законсервируйте его, чтобы не платить лишнего, и ищите новый участок.`,`The ${NM.obj(a.t).toLowerCase()} ${regIn(a.r)} is exhausted. Mothball it to save costs and look for a new plot.`),
    P(`Недра ${regIn(a.r)} своё отдали: ${oLow(a.t)} пуст. Спасибо ему — и в консервацию.`,`The ground ${regIn(a.r)} has given all it had: the ${NM.obj(a.t).toLowerCase()} is empty. Thank it — and mothball it.`)],
  halt:a=>[P(`Стройка встала (${oLow(a.t)}, ${NM.reg(a.r)}) — не хватает денег. Проектный кредит с отсрочкой на полгода её сдвинет: кнопка — в «Объектах».`,`Construction has stopped (${NM.obj(a.t).toLowerCase()}, ${NM.reg(a.r)}) — not enough cash. A project loan with a six-month grace period gets it moving: the button is in Assets.`),
    P(`Строители курят у забора: ${oLow(a.t)} ${regIn(a.r)} ждёт денег.`,`The builders are idling by the fence: the ${NM.obj(a.t).toLowerCase()} ${regIn(a.r)} is waiting for cash.`)],
  lev:a=>a.x>=99?[P('EBITDA пока нет, а долг есть — долг/EBITDA не считается. Сначала запустим добычу, новые кредиты подождут.','No EBITDA yet, but there is debt — debt/EBITDA can’t be calculated. Let’s get production going first; new loans can wait.')]:[P(`Долг уже ${num(a.x,1)} годовых EBITDA. Банки нервничают, я тоже — давайте гасить.`,`Debt is already ${num(a.x,1)}× annual EBITDA. Banks are nervous, and so am I — let’s repay.`),
    P(`Долг/EBITDA — ${num(a.x,1)}. Выше 3,5 я плохо сплю. Новые кредиты пока не берём.`,`Debt/EBITDA is ${num(a.x,1)}. Above 3.5 I sleep badly. No new loans for now.`)],
  cons:a=>[P(`Контракт на ${gAcc(a.g)} под угрозой: поставили мало, а срок близко. Штраф — 20 % недопоставки.`,`The ${gAcc(a.g)} contract is at risk: little delivered and the deadline is near. Penalty — 20% of the shortfall.`),
    P(`Покупатель ${gGen(a.g)} уже звонил. Своего выпуска не хватает — можно попросить отсрочку или докупить мощность: модернизация даёт +50 %.`,`The ${gAcc(a.g)} buyer has called already. Our output falls short — ask for more time or add capacity: an upgrade gives +50%.`)],
  route:a=>[P(`Возить ${gAcc(a.g)} ${REG_FROM[a.from]||''} ${REG_TO[a.to]||''} дороже, чем продать на месте и купить там. Уберите маршрут или купите свои вагоны.`,`Shipping ${gAcc(a.g)} from ${rIn(a.from,1).slice(3)} to ${rIn(a.to,1).slice(3)} costs more than selling locally and buying there. Drop the route or buy your own wagons.`),
    P(`Считала-пересчитала: ${gAcc(a.g)} выгоднее продать ${regIn(a.from)} и купить ${regIn(a.to)}, чем катать поездом. Железная дорога нам не родня.`,`I ran the numbers twice: it’s cheaper to sell ${gAcc(a.g)} ${rIn(a.from,1)} and buy it ${rIn(a.to,1)} than to ship it by rail. The railway isn’t family.`)],
  auc:a=>[P('Идут торги за участок — загляните, вдруг выгодно.','A plot auction is on — take a look, it might be a bargain.'),
    P('На торгах новый участок. Я бы посмотрела на оценку, прежде чем махать табличкой.','A new plot is at auction. I’d check the valuation before raising the paddle.')],
  myauc:a=>[P(`Наша разведка нашла ${gAcc(a.g)}, участок на торгах. Не упустите! А если проиграем — нам вернут затраты на разведку.`,`Our survey found ${gAcc(a.g)}, the plot is at auction. Don’t miss it! If we lose, exploration costs are refunded.`),
    P(`Наш участок с ${en()?gAcc(a.g):G_INS(a.g)} на торгах. Выгодно, если лицензия не дороже 0,6 оценки.`,`Our ${gAcc(a.g)} plot is at auction. Worth it if the licence costs under 0.6 of the valuation.`)],
  grow:a=>[P(`Прибыль выросла на ${FMT.pct(a.x)}. Так держать! Премию себе я уже мысленно выписала.`,`Profit is up ${FMT.pct(a.x)}. Keep it up! I’ve already mentally written myself a bonus.`),
    P(`Плюс ${FMT.pct(a.x)} к прибыли! Даже кактус на моём столе зацвёл.`,`Profit up ${FMT.pct(a.x)}! Even the cactus on my desk has bloomed.`)],
  loss:a=>[P('Месяц в убытке. Загляните в БДР: где утекает — постоянные расходы или цены?','A loss this month. Check the P&L: where is it leaking — fixed costs or prices?'),
    P('Убыток. Не беда, если это стройка и старт. Беда, если так три месяца подряд.','A loss. Fine if it’s start-up and construction. Not fine if it’s three months running.')],
  up:a=>[P(`Цена на ${gAcc(a.g)} выросла на ${FMT.pct(a.x)} — хорошее время продавать.`,`The ${gAcc(a.g)} price is up ${FMT.pct(a.x)} — a good time to sell.`),
    P(`${NM.good(a.g)} подорожал${G_F[a.g]||''} на ${FMT.pct(a.x)}. Кто держал запасы — молодец.`,`${cap(gAcc(a.g))} is up ${FMT.pct(a.x)}. Whoever kept stock — well done.`)],
  down:a=>[P(`Цена на ${gAcc(a.g)} упала на ${FMT.pct(-a.x)}. Может, придержать товар или продать по контракту?`,`The ${gAcc(a.g)} price fell ${FMT.pct(-a.x)}. Hold the goods or sell under a contract?`),
    P(`${NM.good(a.g)} подешевел${G_F[a.g]||''} на ${FMT.pct(-a.x)}. Не паникуем: рынок как погода — меняется.`,`${cap(gAcc(a.g))} is down ${FMT.pct(-a.x)}. No panic: markets are like weather — they change.`)],
  plant:a=>[P(`Скажу честно: ${oLow(a.t)} окупится года за два, а ещё один рудник — примерно за год. Пока рудников ${a.n}, выгоднее сначала довести их до 3–4, а завод строить с капиталом от 2 млрд.`,`Honestly: the ${NM.obj(a.t).toLowerCase()} will pay back in about two years, another mine — in about one. With ${a.n} ${a.n===1?'mine':'mines'} it pays to reach 3–4 first and build the plant with equity over 2 bn.`),
    P('Завод — мечта, понимаю. Но свои рудники кормят быстрее: сначала сырьё, потом передел. Своё сырьё на своём заводе в том же регионе не нужно везти и покупать — вот тогда завод и выгоден.','A plant is the dream, I get it. But mines feed you faster: raw materials first, processing later. Your own ore at your own plant in the same region needs no freight or purchases — that’s when a plant pays.')],
  idle:a=>[P('Деньги лежат, а недра ждут. Начните с разведки — это недорого.','The money is idle and the ground is waiting. Start with exploration — it’s cheap.'),
    P('Уставный капитал скучает на счёте. Пойдёмте искать уголь!','Share capital is bored in the account. Let’s go find some coal!')],
  lazy:a=>[P('На счёте больше 400 млн, а мы ничего не строим. Деньги должны работать!','Over 400m in the account and nothing under construction. Money should work!'),
    P('Столько денег без дела — даже неловко. Завод, модернизация, новый участок?','So much idle cash it’s awkward. A plant, an upgrade, a new plot?')],
  ok:a=>[P('Месяц в плюсе — отчёты сходятся, и я спокойна.','A profitable month — the books balance and I’m calm.'),
    P('Прибыль есть, баланс сошёлся. Можно пить чай с баранками.','Profit is in, the balance ties out. Time for tea and biscuits.'),
    P('Хороший месяц. Я бы так и записала в годовой отчёт.','A good month. I’d put it just like that in the annual report.')],
  meh:a=>[P('Пока без прибыли, но на старте это нормально. Главное — не бросать.','No profit yet, but that’s normal at the start. The key is not to give up.'),
    P('Прибыли нет, но и паники нет. Смотрим, где деньги, и работаем.','No profit, but no panic either. Let’s see where the money is and keep working.')]};
const G_F={ore:'а',steel:'а',lumber:'и',cuore:'а',cu:'а'};
const G_INS_M={cuore:'медной рудой',cucon:'медным концентратом',cu:'медью',wire:'кабелем',coal:'углём',ore:'рудой',lime:'известняком',wood:'лесом',lumber:'пиломатериалами',pig:'чугуном',steel:'сталью',roll:'прокатом'};
function G_INS(g){return G_INS_M[g]||NM.good(g);}
function cap(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
// события: [короткая новость, фраза главбуха]
const EV={
  steelup:a=>[P('Спрос на сталь растёт','Steel demand is rising'),P('Металлурги в почёте: сталь, чугун и прокат дорожают. Если есть — продавайте.','Metals are in demand: steel, pig iron and rolled steel are up. Sell if you have them.')],
  steeldn:a=>[P('Сталь дешевеет','Steel prices are falling'),P('Сталь подешевела. Прокат пока держится лучше — подумайте, что выгоднее выпускать.','Steel got cheaper. Rolled steel holds up better — think about what’s best to make.')],
  buildup:a=>[P('Стройка в стране оживилась','Construction is booming'),P('Стройки оживились: известняк, лес и пиломатериалы в цене.','Construction is booming: limestone, timber and lumber are up.')],
  winter:a=>[P('Холодная зима: уголь в цене','A cold winter: coal is up'),P('Зима лютая, котельные просят угля. Для угольщиков — хорошая пора.','A harsh winter, boiler houses want coal. A good season for miners.')],
  export:a=>[P('Экспорт леса ограничили','Timber exports restricted'),P('Экспорт леса прикрыли — лес дешевеет. Пиломатериалы выгоднее кругляка.','Timber exports were cut — timber is cheaper. Lumber pays better than logs.')],
  orecn:a=>[P('Спрос на руду за рубежом вырос','Foreign demand for ore is up'),P('Руду покупают охотно — цена пошла вверх.','Ore is selling well — the price went up.')],
  keyup:a=>[P('ЦБ поднял ключевую ставку','The central bank raised the key rate'),P('Ключевую подняли — новые кредиты дороже. Не спешим занимать.','The key rate went up — new loans cost more. No rush to borrow.')],
  keydn:a=>[P('ЦБ снизил ключевую ставку','The central bank cut the key rate'),P('Ключевую снизили — кредиты дешевеют. Хорошее время для большой стройки.','The key rate was cut — loans get cheaper. A good time for a big project.')],
  acc:a=>[P(`Авария: ${a.t?oLow(a.t):''}${a.r?' ('+NM.reg(a.r)+')':''}`,`Accident: ${a.t?NM.obj(a.t).toLowerCase():''}${a.r?' ('+NM.reg(a.r)+')':''}`),P(`Авария на объекте${a.t?' «'+NM.obj(a.t)+'»':''}: ремонт ${a.c?FMT.money(a.c):''}, 10 дней простоя. Люди целы — это главное.`,`An accident${a.t?' at the '+NM.obj(a.t).toLowerCase():''}: repairs ${a.c?FMT.money(a.c):''}, 10 days of downtime. Nobody hurt — that’s what matters.`)],
  flood:a=>[P(`Паводок ${a.r?regIn(a.r):''}`,`Flooding ${a.r?regIn(a.r):''}`),P(`Паводок ${a.r?regIn(a.r):''}: поезда идут дольше, лесозаготовка работает вполсилы.`,`Flooding ${a.r?regIn(a.r):''}: trains are slower, logging runs at half capacity.`)],
  tariff:a=>[P('Ж/д тарифы выросли на 5 %','Rail tariffs up 5%'),P('Железная дорога подняла тарифы. Возить далеко стало дороже — считайте маршруты.','Railways raised tariffs. Long hauls cost more — check your routes.')],
  wagons:a=>[P('Нехватка вагонов','Wagon shortage'),P('Вагонов не хватает, аренда подорожала в полтора раза. Свои вагоны сейчас очень кстати.','Wagons are scarce, rent is up 50%. Own wagons come in handy now.')],
  plot:a=>[P(`Новый участок ${a.r?regIn(a.r):''}`,`A new plot ${a.r?regIn(a.r):''}`),P(`Геологи открыли новый участок ${a.r?regIn(a.r):''} — можно разведать.`,`Geologists opened a new plot ${a.r?regIn(a.r):''} — you can explore it.`)]};
const tx=p=>en()?p.en:p.ru;
const ADV={
  name:()=>L('Людмила Санна','Lyudmila Sanna'),role:()=>L('главный бухгалтер','chief accountant'),
  text(item){if(!item)return '';const a=item.a||{};try{
      if(item.k&&item.k.indexOf('ev_')===0){const f=EV[item.k.slice(3)];return f?tx(f(a)[1]):'';}
      const f=A[item.k];return f?tx(pick(f(a))):'';}catch(e){console.error(e);return '';}},
  // итоги месяца: 1–2 самых важных совета + строка показателей для знатока
  month(rep){const w=Wd();const it=w?E.advise(w):[];let top=it.filter(x=>x.k!=='ok'&&x.k!=='meh');
    const pick2=top.length?top.slice(0,top[1]&&top[1].pri>=40?2:1):it.slice(0,1);
    const t=pick2.map(x=>ADV.text(x)).filter((x,i,a)=>x&&a.indexOf(x)===i).join(' ');   // два одинаковых совета (две точки одного вида) — одной фразой
    const mt=w?E.metrics(w):null;let pro='';
    if(mt)pro=`${L('Маржа EBITDA','EBITDA margin')} ${FMT.pct(mt.em)} · ${L('чистая маржа','net margin')} ${FMT.pct(mt.nm)} · ROE ${FMT.pct(mt.roe)} · ${L('долг/EBITDA','debt/EBITDA')} ${mt.de>=99?'—':num(mt.de,1)}`;
    return {t,pro,proHtml:ADV.proHtml(),items:pick2,toString(){return t;}};},
  // строка показателей для окна закрытия месяца: крупно, с кнопкой «что это?» (раскрывает пояснение на месте)
  proHtml(){const w=Wd(),mt=w?E.metrics(w):null;if(!mt)return '';css();
    const it=[[L('Маржа EBITDA','EBITDA margin'),FMT.pct(mt.em),L('доля выручки, что остаётся от самой работы (до амортизации, процентов и налога). 25–40 % — хорошо.','share of revenue left from operations (before depreciation, interest, tax). 25–40% is good.')],
      [L('Чистая маржа','Net margin'),FMT.pct(mt.nm),L('сколько копеек чистой прибыли с рубля выручки.','kopecks of net profit per rouble of revenue.')],
      ['ROE',FMT.pct(mt.roe),L('сколько процентов в год приносят деньги владельца. Выше ключевой ставки — лучше вклада.','how many percent a year the owner’s money earns. Above the key rate — better than a deposit.')],
      [L('Долг/EBITDA','Debt/EBITDA'),mt.de>=99?'—':num(mt.de,1),mt.de>=99?L('EBITDA нет — показатель не считается.','no EBITDA — the ratio can’t be calculated.'):L('за сколько лет гасится долг из заработка. До 2 — спокойно, больше 3,5 — опасно.','years of earnings to repay the debt. Under 2 is calm, above 3.5 is risky.')]];
    return `<div class="f-pro">${it.map(x=>`${x[0]} <b>${x[1]}</b>`).join(' · ')} <button class="f-proq noenter" data-finpro="1" type="button">${L('что это?','what’s this?')}</button><div class="f-prox" hidden>${it.map(x=>`<p><b>${x[0]}</b> — ${x[2]}</p>`).join('')}</div></div>`;},
  news(n){if(!n)return '';const a=n.a||{},d=FMT.mon(n.m)+' · ';let s='';
    const R=r=>r?regIn(r):'',G=g=>g?NM.good(g):'',O=t=>t?NM.obj(t):'';
    switch(n.k){
      case 'start':s=a.pa?L(`Партнёр вложил ${FMT.money(a.c)} — холдинг выходит в недра.`,`The partner invested ${FMT.money(a.c)} — the holding goes into mining.`):L(`Холдинг основан. Уставный капитал — ${FMT.money(a.c)}.`,`Holding founded. Share capital — ${FMT.money(a.c)}.`);break;
      case 'empty':s=L(`Разведка ${R(a.r)}: пусто. Бывает.`,`Survey ${R(a.r)}: nothing. It happens.`);break;
      case 'found':s=a.leg?L(`Наследство репутации: участок ${R(a.r)} (${G(a.g).toLowerCase()}) — лицензия без торгов.`,`Reputation legacy: a plot ${R(a.r)} (${G(a.g).toLowerCase()}) — licence without an auction.`):L(`Разведка ${R(a.r)} нашла: ${G(a.g).toLowerCase()}!`,`Survey ${R(a.r)} found ${G(a.g).toLowerCase()}!`);break;
      case 'boost':{const n=Math.max(1,Math.round((a.d||90)/30));s=L(`Людмила Санна договорилась с покупателями: +10 % к цене продаж на ${n} ${plural(n,'месяц','месяца','месяцев')}.`,`Lyudmila Sanna struck a deal with buyers: +10% on sale prices for ${n} ${n===1?'month':'months'}.`);break;}
      case 'qgoal':s=a.ok?L(`Цель квартала выполнена — совет директоров доволен (+${a.cr} 💎).`,`Quarter goal achieved — the board is pleased (+${a.cr} 💎).`):L('Цель квартала не выполнена. Совет директоров ждёт новую.','The quarter goal was missed. The board awaits a new one.');break;
      case 'auction':s=L(`Торги за участок: ${G(a.g).toLowerCase()}, ${NM.reg(a.r)}.`,`Plot auction: ${G(a.g).toLowerCase()}, ${NM.reg(a.r)}.`);break;
      case 'won':s=L(`Лицензия наша: ${G(a.g).toLowerCase()}, ${NM.reg(a.r)}, за ${FMT.money(a.pr)}.`,`The licence is ours: ${G(a.g).toLowerCase()}, ${NM.reg(a.r)}, for ${FMT.money(a.pr)}.`);break;
      case 'lost':s=L(`Участок (${G(a.g).toLowerCase()}, ${NM.reg(a.r)}) ушёл «${NM.bot(a.b)}» за ${FMT.money(a.pr)}.`,`The plot (${G(a.g).toLowerCase()}, ${NM.reg(a.r)}) went to ${NM.bot(a.b)} for ${FMT.money(a.pr)}.`);break;
      case 'reimb':s=L(`Нам возместили разведку: ${FMT.money(a.c)}.`,`Exploration refunded: ${FMT.money(a.c)}.`);break;
      case 'nobid':s=L('На торги никто не пришёл — участок можно взять по стартовой цене.','Nobody bid — you can take the plot at the starting price.');break;
      case 'build':s=L(`Начали стройку: ${oLow(a.t)}, ${NM.reg(a.r)}.`,`Construction started: ${O(a.t).toLowerCase()}, ${NM.reg(a.r)}.`);break;
      case 'built':s=L(`Построено: ${oLow(a.t)}, ${NM.reg(a.r)}.`,`Completed: ${O(a.t).toLowerCase()}, ${NM.reg(a.r)}.`);break;
      case 'upgrade':s=L(`Модернизация началась: ${oLow(a.t)}, ${NM.reg(a.r)}.`,`Upgrade started: ${O(a.t).toLowerCase()}, ${NM.reg(a.r)}.`);break;
      case 'upgraded':s=L(`Модернизация завершена: ${oLow(a.t)}, уровень ${a.lv}.`,`Upgrade complete: ${O(a.t).toLowerCase()}, level ${a.lv}.`);break;
      case 'off':s=L(`Законсервирован: ${oLow(a.t)}, ${NM.reg(a.r)}.`,`Mothballed: ${O(a.t).toLowerCase()}, ${NM.reg(a.r)}.`);break;
      case 'on':s=L(`Снова в работе: ${oLow(a.t)}, ${NM.reg(a.r)}.`,`Back in operation: ${O(a.t).toLowerCase()}, ${NM.reg(a.r)}.`);break;
      case 'wagons':s=L(`Куплено ${a.n} ${plural(a.n,'вагон','вагона','вагонов')}.`,`Bought ${a.n} ${a.n===1?'wagon':'wagons'}.`);break;
      case 'loan':s=L(`Кредит ${FMT.money(a.a)} под ${FMT.pct(a.r,1)} на ${a.n} мес.`,`Loan ${FMT.money(a.a)} at ${FMT.pct(a.r,1)} for ${a.n} months.`);break;
      case 'contract':s=L(`Подписан контракт: ${FMT.qty(a.q,a.g)} (${G(a.g).toLowerCase()}) по ${num(a.p)} ₽.`,`Contract signed: ${FMT.qty(a.q,a.g)} of ${G(a.g).toLowerCase()} at ${num(a.p)} ₽.`);break;
      case 'penalty':s=L(`Штраф за недопоставку (${G(a.g).toLowerCase()}, ${FMT.qty(a.q,a.g)}): ${FMT.money(a.pen)}.`,`Shortfall penalty (${G(a.g).toLowerCase()}, ${FMT.qty(a.q,a.g)}): ${FMT.money(a.pen)}.`);break;
      case 'cdone':s=L(`Контракт исполнен: ${FMT.qty(a.q,a.g)} (${G(a.g).toLowerCase()}).`,`Contract fulfilled: ${FMT.qty(a.q,a.g)} of ${G(a.g).toLowerCase()}.`);break;
      case 'od':s=L(`Банк дал овердрафт: ${FMT.money(a.a)}.`,`The bank gave an overdraft: ${FMT.money(a.a)}.`);break;
      case 'san':{const k=(a.sold||[]).length;s=L(`Санация: продано ${k} ${plural(k,'актив','актива','активов')}, долг сведён в один кредит — ${FMT.money(a.debt)}.`,`Restructuring: ${k} ${k===1?'asset':'assets'} sold, debt rolled into one loan — ${FMT.money(a.debt)}.`);break;}
      case 'ev':{const f=EV[a.k];s=f?tx(f(a)[0])+'.':'';break;}
      case 'botbuild':s=L(`«${NM.bot(a.b)}» строит: ${oLow(a.t)}, ${NM.reg(a.r)}.`,`${NM.bot(a.b)} is building: ${O(a.t).toLowerCase()}, ${NM.reg(a.r)}.`);break;
      case 'lux':{const x=E.luxOf&&E.luxOf(a.id);s=x?L(`Для себя: ${x.ico} ${x.ru} — ${FMT.money(a.p)} (личная покупка, из капитала).`,`For yourself: ${x.ico} ${x.en} — ${FMT.money(a.p)} (personal purchase, from equity).`):'';break;}
      case 'botsell':s=L(`«${NM.bot(a.b)}» продаёт актив: ${oLow(a.t)}, ${NM.reg(a.r)}.`,`${NM.bot(a.b)} is selling an asset: ${O(a.t).toLowerCase()}, ${NM.reg(a.r)}.`);break;
      default:s='';}
    return s?d+s:'';},
  // короткий заголовок события (для окна закрытия месяца)
  ev(a){const f=a&&EV[a.k];return f?tx(f(a)[0]):'';}};
window.ADV=ADV;
})();
