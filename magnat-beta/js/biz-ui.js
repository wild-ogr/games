/* ================= «Из ларька в магнаты: бизнес» — экраны ранних глав «из грязи в князи» (Biz-UI) =================
   Главы W.st: gig «Карьера» (подработка) → small «Своё дело» → mid «Сеть» → quarry «Карьер» → nedra (экраны ui.js).
   Модель — js/biz.js (ECON: GIGS, BIZ, hands, gigTake, bizOpen, bizForecast, opiBid, bizGoNedra…), действия — только через GAME.act.
   Грузится ДО ui.js: определяет window.BIZUI, а ui.js зовёт хуки (BIZUI.init/render/after/home/hname/openClose/closeExtra/adAllowed/offline/advOpen/idle/back).
   Экраны: #scr-today «Сегодня», #scr-gigs «Заказы», #scr-biz «Бизнес» (список → каталог → точка), #scr-net «Сеть», #scr-pit «Карьер».
   Вход снаружи (телефон, сюжет): BIZUI.open(tab), BIZUI.openGigs(), BIZUI.openBiz(id).
   Клики — делегирование по data-b (data-a занят ui.js). Свой CSS вставляется <style id="bzCss">, только переменные темы. */
(function(){
'use strict';
const E=window.ECON;
if(!E||!E.bizInit){window.BIZUI={ready:false};return;}
const w=()=>GAME.W;
// род героя из пролога (window.HERO от сюжета); без сюжета — мужской
const hg=(m,f)=>{try{return window.HERO&&HERO.g?HERO.g(m,f):m;}catch(e){return m;}};
const $$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const M=x=>FMT.money(x);
const snd=k=>{try{if(SND&&SND[k])SND[k]();}catch(e){}};
const days=n=>n+' '+pl(n,'день','дня','дней','day','days');
const mons=n=>n+' '+pl(n,'месяц','месяца','месяцев','month','months');
const T=a=>a?L(a[0],a[1]):'';
const low=s=>LANG==='en'?String(s).toLowerCase():String(s).charAt(0).toLowerCase()+String(s).slice(1);
const num=(x,d)=>FMT.num(x,d);
const ICO_FIX={tire:'🔩'};                       // 🛞 — Emoji 14, на старых Android не рисуется
const bico=t=>ICO_FIX[t]||(E.BIZ[t]&&E.BIZ[t].ico)||'🏪';
const bn=t=>E.BIZ[t]?L(E.BIZ[t].n,E.BIZ[t].en):t;
const gn=t=>t==='santa'?hg(L('Дед Мороз на праздник','Father Frost for a party'),L('Снегурочка на праздник','Snow Maiden for a party')):E.GIGS[t]?L(E.GIGS[t].n,E.GIGS[t].en):t;
const opv=o=>L(o[1],o[2]);
const cityN=c=>{try{return NM.city(c);}catch(e){return c;}};
const stI=()=>E.stI(w());
const early=()=>{const W=w();return !!W&&!W.ned;};
const OOO_EQ=()=>E.OOO_EQ||10e6,Q_EQ=()=>E.QUARRY_EQ||80e6,N_EQ=()=>E.NEDRA_EQ||300e6;
// прогнозы — круглыми числами (до 100 ₽ / 1 000 ₽)
const Mr=x=>M(Math.round(x/(Math.abs(x)>=1e5?1000:100))*(Math.abs(x)>=1e5?1000:100));
const isPit=t=>E.PITS.indexOf(t)>=0,isMid=t=>E.MID.indexOf(t)>=0;
const SCR=['today','gigs','biz','net','pit'];
const V={biz:'list',id:null,from:'biz',city:null};   // состояние вкладки «Бизнес»
let drag=false,hlQ=null,newsT=-1,gigIds=null,lastSt=null,ipSeen=null,bootT=Date.now();

/* ---------------- CSS (стиль Г «Лёгкость», только переменные темы; без inset и gap) ---------------- */
const CSS=`
.bz-top{margin:0 4px 14px}.bz-sub{color:var(--muted);font-size:16px;font-weight:500}
.bz-h1{font-size:28px;font-weight:700;letter-spacing:-.02em;margin:2px 0 0;line-height:1.15}
.bz-lab{color:var(--muted);font-size:16px;font-weight:500}
.bz-big{font-size:40px;font-weight:600;line-height:1.1;margin:4px 0 2px;font-family:var(--numfont);font-variant-numeric:tabular-nums;letter-spacing:-.02em;word-break:break-word}
.bz-big.neg{color:var(--bad)}
.bz-debt{border-left:5px solid var(--bad);background:var(--bad-t,#fdecec)}.bz-debt{display:block;width:100%;text-align:left}.bz-debt .gh{display:flex;justify-content:space-between;align-items:baseline;margin:2px 0 6px}.bz-debt .gh b{color:var(--bad);font-size:22px}.bz-debt .gh span{color:var(--muted);font-size:16px;margin-left:8px}.bz-d{font-size:16px;font-weight:600}.bz-d.up{color:var(--good)}.bz-d.dn{color:var(--bad)}.bz-d.eq{color:var(--muted)}
.bz-spark{display:block;width:100%;height:64px;margin-top:10px}
.bz-stat{display:flex;flex-wrap:wrap;margin:10px -4px 0}
.bz-stat>span{margin:4px;background:var(--soft);border-radius:999px;padding:6px 12px;font-size:16px;font-weight:500;white-space:nowrap}
.bz-stat>span.lo{background:var(--bad-t);color:var(--bad)}
.bz-goal{display:block;width:100%;text-align:left}
.bz-goal .gh{display:flex;align-items:baseline;justify-content:space-between}
.bz-goal .gh b{font-size:19px;margin-right:10px}.bz-goal .gh span{font-weight:600;color:var(--accent);white-space:nowrap}
.bz-goal small{display:block;color:var(--muted);font-size:15px}
.bz-sec{font-size:15px;font-weight:600;color:var(--muted);margin:20px 4px 10px}
.bz-hands{display:flex;flex-wrap:wrap;margin:-4px}
.bz-hand{flex:1 1 28%;min-width:92px;margin:4px;border-radius:16px;background:var(--soft);padding:10px 6px;text-align:center;min-height:84px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.bz-hand i{font-style:normal;font-size:26px;line-height:1.1}
.bz-hand b{display:block;font-size:15px;font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bz-hand small{display:block;font-size:15px;color:var(--muted)}
.bz-hand.free{background:var(--accent-t);color:var(--accent);box-shadow:inset 0 0 0 1.5px var(--accent)}
.bz-hand.free small{color:var(--accent)}
.bz-list{padding:4px 18px}
.bz-li{display:flex;align-items:center;width:100%;text-align:left;padding:12px 0;border-top:1px solid var(--line);min-height:68px;color:var(--ink)}
.bz-li:first-child{border-top:0}
.bz-li .f1{flex:1;min-width:0;margin:0 10px 0 12px}
.bz-li .f1 b{display:block;font-size:17px;font-weight:600}
.bz-li .f1 small{display:block;color:var(--muted);font-size:15px;line-height:1.3}
.bz-li .v{font-weight:600;white-space:nowrap;text-align:right;font-family:var(--numfont);font-variant-numeric:tabular-nums}
.bz-li .v small{display:block;font-weight:500;font-size:15px;color:var(--muted);font-family:var(--font)}
.bz-li.lock{opacity:.55}
.bz-ic{width:48px;height:48px;border-radius:50%;background:var(--icbg);display:flex;align-items:center;justify-content:center;font-size:25px;flex:none;position:relative}
.bz-ic.lg{width:64px;height:64px;font-size:34px}
.bz-ic i{position:absolute;right:0;top:0;width:13px;height:13px;border-radius:50%;background:var(--bad);box-shadow:0 0 0 2px var(--card)}
.bz-pills{display:flex;flex-wrap:wrap;margin:8px -3px 4px}
.bz-gd{margin:8px 0 4px}
.bz-gd button{display:block;width:100%;text-align:left;min-height:56px;padding:10px 14px;margin:0 0 8px;border:1.5px solid var(--line2);border-radius:14px;background:var(--card);color:var(--ink);font:inherit;font-size:17px;cursor:pointer}
.bz-gd button.on{border-color:var(--accent);background:var(--accent-t)}
.bz-gd button b{display:block;font-weight:600}.bz-gd button small{display:block;color:var(--muted);font-size:15px;margin-top:3px;line-height:1.35}
.bz-gd button .pf{float:right;font-weight:600;margin-left:8px}.bz-gd button .pf.good{color:var(--good)}.bz-gd button .pf.bad{color:var(--bad)}
.bz-pills span{margin:3px;background:var(--soft);border-radius:999px;padding:5px 11px;font-size:15px;font-weight:500;white-space:nowrap;color:var(--ink2)}
.bz-pills span.a{background:var(--accent-t);color:var(--accent)}.bz-pills span.w{background:var(--warn-t);color:var(--warn)}
.bz-gig.gone{opacity:.6}.bz-gig .gh{display:flex;align-items:flex-start}.bz-gig .gh .f1{flex:1;min-width:0;margin:0 10px 0 12px}
.bz-gig .gh .f1 b{display:block;font-size:17px;font-weight:600;line-height:1.25}.bz-gig .gh .f1 small{display:block;color:var(--muted);font-size:15px}
.bz-pay{font-size:22px;font-weight:600;color:var(--good);white-space:nowrap;text-align:right;font-family:var(--numfont)}
.bz-pay small{display:block;font-size:15px;color:var(--muted);font-weight:500;font-family:var(--font)}
.bz-risk{font-size:15px;color:var(--muted);margin:4px 0 10px}.bz-risk.bad{color:var(--bad)}
.bz-note{font-size:15px;color:var(--muted);margin:6px 0 0}
.bz-prog{height:8px;border-radius:8px;background:var(--track);overflow:hidden;margin:8px 0 2px}.bz-prog i{display:block;height:100%;background:var(--accent);border-radius:8px}
.bz-back{display:flex;align-items:center;margin:0 0 12px}
.bz-knob input[type=range]{width:100%;height:48px;margin:6px 0 0;accent-color:var(--accent)}
.bz-kv{display:flex;justify-content:space-between;align-items:baseline;font-size:17px}
.bz-kv b{font-size:22px;color:var(--accent);font-family:var(--numfont)}
.bz-fc{background:var(--accent-t);border-radius:16px;padding:12px 14px;margin-top:10px;font-size:16px;color:var(--ink2)}
.bz-fc b{color:var(--ink);font-size:18px;font-family:var(--numfont);white-space:nowrap}
.bz-ck{margin:8px 0}.bz-ck div{display:flex;align-items:flex-start;padding:6px 0;font-size:16px}
.bz-ck div i{font-style:normal;flex:none;width:28px;font-weight:700}.bz-ck div.ok i{color:var(--good)}.bz-ck div.no i{color:var(--muted)}
.bz-bars{display:block;width:100%;height:110px;margin-top:8px}
.bz-hd{display:flex;align-items:center}.bz-hd .f1{flex:1;min-width:0;margin-left:14px}
.bz-hd h2{font-size:26px;margin:0;line-height:1.15}.bz-hd small{display:block;color:var(--muted);font-size:15px}.bz-hd .f1 b{display:block}
.bz-ch{text-align:center}.bz-ch .n{color:var(--accent);font-weight:600;font-size:16px;letter-spacing:.02em;text-transform:uppercase}
.bz-ch h2{font-size:30px;margin:4px 0 10px}
.bz-ch ul{list-style:none;padding:0;margin:10px 0;text-align:left}.bz-ch li{padding:9px 0 9px 32px;position:relative;border-top:1px solid var(--line);font-size:17px}
.bz-ch li:before{content:'✓';position:absolute;left:6px;color:var(--good);font-weight:700}
.bz-q button{display:block;width:100%;margin-top:8px;text-align:left}
.bz-q button.ok{background:var(--good-t);color:var(--good)}.bz-q button.nok{background:var(--bad-t);color:var(--bad)}
#mcard .bz-li{min-height:56px}
button.bz-li{display:flex}
/* закреплённая панель ранних глав: ⚡ ✋ ⭐ 🛌 — прилипает к верху экрана */
.pbar{position:-webkit-sticky;position:sticky;top:0;z-index:4;display:flex;align-items:stretch;margin:-16px -16px 10px;padding:7px 13px;background:var(--bg);border-bottom:1px solid var(--line)}
.pbar>button{flex:1 1 0;min-width:0;margin:0 3px;min-height:54px;border-radius:14px;background:var(--card);box-shadow:var(--sh);padding:5px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;color:var(--ink)}
.pbar .pb b{font-size:18px;font-weight:700;white-space:nowrap;font-family:var(--numfont);font-variant-numeric:tabular-nums}
.pbar .pb em{font-style:normal;font-weight:500;font-size:15px;color:var(--muted)}
.pbar .pb small{font-size:15px;color:var(--muted);white-space:nowrap;margin-top:1px}
.pbar .pb u{display:block;width:78%;height:4px;border-radius:4px;background:var(--track);margin-top:3px;overflow:hidden}.pbar .pb u i{display:block;height:100%;background:var(--good);border-radius:4px}
.pbar .pb.lo b{color:var(--bad)}.pbar .pb.lo u i{background:var(--bad)}
.pbar .pb-rest{background:var(--accent);color:var(--on-accent);box-shadow:var(--btnsh);font-weight:600;font-size:15px}
.pbar .pb-rest i{font-style:normal;font-size:21px;line-height:1.1}
.pbar .pb-rest span{white-space:nowrap;line-height:1.15;text-align:center}
.pbar .pb-rest.off{background:var(--card);color:var(--ink2);box-shadow:var(--sh);font-size:15px;font-weight:500}.pbar .pb-rest.calm{background:var(--card);color:var(--ink);box-shadow:var(--sh)}
body.th-office .pbar>button{border:1px solid var(--line)}
/* доска заказов: строка в 1–2 строки, «Взять» справа */
.glist{padding:2px 12px 2px 14px}
.gr{display:flex;align-items:center;border-top:1px solid var(--line);min-height:66px}
.glist>.gr:first-child,.glist>.gw:first-child .gr{border-top:0}
.gw{border-top:1px solid var(--line)}.gw .gr{border-top:0}.gw .bz-prog{margin:0 0 8px 52px}
.gr .gi{flex:1;min-width:0;display:flex;align-items:center;text-align:left;padding:8px 0;min-height:64px;color:var(--ink)}
.gr .bz-ic{width:42px;height:42px;font-size:22px}
.gr .f1{flex:1;min-width:0;margin:0 8px 0 10px}
.gr .f1 b{display:block;font-size:17px;font-weight:600;line-height:1.2}
.gr .f1 small{display:block;font-size:15px;color:var(--muted);line-height:1.3;margin-top:1px}
.gr .f1 small b.gp{display:inline;color:var(--good);font-size:16px;font-weight:700;font-family:var(--numfont)}
.gr .v{flex:none;font-weight:600;white-space:nowrap;font-family:var(--numfont)}
.gr>.btn.sm{flex:none;min-width:88px;padding:8px 12px;box-shadow:none}
.gr.gone .gi{opacity:.5}.gr .gst{flex:none;min-width:88px;text-align:center;font-weight:600;color:var(--muted);font-size:15px}
.gr .w{color:var(--warn)}.gr .a{color:var(--accent)}
.bz-best{margin-bottom:4px;min-height:52px}
.bz-sec small{font-weight:500;font-size:15px}
.hr{height:1px;background:var(--line);margin:14px 0}
/* цель и деньги месяца */
.bz-goal .gp2{margin-top:2px}
.bz-goal .gv{margin-top:8px;font-size:16px;color:var(--ink2);background:var(--soft2);border-radius:12px;padding:8px 10px}
.bz-month .mh{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap}
.bz-month .mh .bz-d small{font-weight:500;font-size:15px}
.bz-month .mr{display:flex;align-items:center;padding:8px 0;border-top:1px solid var(--line)}
.bz-month .mrs{margin-top:8px}.bz-month .mrs .mr:first-child{border-top:0}
.bz-month .mr .bz-ic{width:40px;height:40px;font-size:21px}
.bz-month .mr .f1{flex:1;min-width:0;margin:0 8px 0 10px}.bz-month .mr .f1 b{display:block;font-size:17px;font-weight:600}.bz-month .mr .f1 small{display:block;font-size:15px;color:var(--muted);line-height:1.25}
.bz-month .mr .v{font-weight:600;white-space:nowrap;font-family:var(--numfont);font-variant-numeric:tabular-nums}
.bz-month .mt{display:flex;align-items:baseline;justify-content:space-between;margin-top:6px;padding-top:10px;border-top:2px solid var(--line);font-weight:600}
.bz-month .mt b{font-size:22px;font-family:var(--numfont);white-space:nowrap}
.bz-hand{min-height:70px}
`;
function css(){if($$('bzCss'))return;const s=document.createElement('style');s.id='bzCss';s.textContent=CSS;document.head.appendChild(s);}

/* ---------------- мелкие помощники ---------------- */
function act(name,...a){let r;try{r=GAME.act(name,...a);}catch(e){console.error(e);return null;}
  if(typeof r==='string'&&r!=='ok'&&MSG[r]){snd('no');toast(MSG[r]());}return r;}
const MSG={cash:()=>L('Не хватает денег','Not enough money'),hand:()=>L('Нет свободных рук ✋','No free hands ✋'),en:()=>L('Мало сил ⚡ — отдохните','Too little energy ⚡ — take a rest'),
  req:()=>L('Условия ещё не выполнены','Requirements not met yet'),rest:()=>L('У вас выходной','You’re on a day off'),out:()=>L('Вы на больничном','You’re on sick leave'),
  wait:()=>L('Эта настройка откроется после 3 месяцев работы','This setting unlocks after 3 months of work'),month:()=>L('Режим налога меняют раз в 12 месяцев','The tax regime can be changed once every 12 months'),
  no:()=>L('Сейчас нельзя','Not possible right now'),ip:()=>L('Сначала нужно оформить ИП','Register as a sole trader first'),ooo:()=>L('Сначала нужно ООО','You need an LLC first'),
  max:()=>L('В городе уже много таких точек','The city already has plenty of these'),stage:()=>L('Откроется в следующей главе','Unlocks in the next chapter'),
  have:()=>L('Сначала откройте предыдущее дело','Open the previous business first'),cap:()=>L('Нужен капитал побольше','You need more capital'),city:()=>L('В этом городе у вас нет представительства','You have no office in that city')};
function crAsk(n,what,fn,own,k){if(GAME.cr()<n){crNo(n);return;}
  modal(`<h2>💎 ${esc(what)}</h2><p style="text-align:center">${L('Потратить','Spend')} <b>${n} 💎</b>? ${L('У вас','You have')} ${GAME.cr()} 💎.</p>
    <div class="row"><button class="btn cr noenter" id="bzCrY">${L('Да, потратить','Yes, spend')} ${n} 💎</button><button class="btn" id="bzCrN" data-esc>${L('Отмена','Cancel')}</button></div>`);
  $$('bzCrN').onclick=()=>{snd('tap');hideModal();};$$('bzCrY').onclick=()=>{hideModal();if(own){fn();return;}if(GAME.spend(n,k||'biz')){fn();}};}  // own — fn спишет 💎 сам (GAME.buyHand/buyEn)
// окно «Не хватает кристаллов» (как crNo в ui.js): 📺 +3 💎 за рекламу (adOk и дневной лимит), магазин, закрыть
function crNo(need){snd('no');let lb='';try{lb=adOk()&&GAME.ladLabel?GAME.ladLabel():'';}catch(e){}const ad=!!lb,c=GAME.cr();
  modal(`<h2>💎 ${L('Не хватает кристаллов','Not enough crystals')}</h2><p>${need?L(`Нужно ${need} 💎, а у вас ${c} 💎.`,`You need ${need} 💎 and you have ${c} 💎.`)+' ':''}${L(`Кристаллы даются за первые шаги, в Планёрке, за «Ролики дня» (2, 3, 3, 4 и 6 💎 — каждый следующий щедрее) и в магазине.`,`Crystals come for first steps, in the Briefing, for daily videos (2, 3, 3, 4 and 6 💎 — each one more generous) and in the shop.`)}</p>
    <div class="row">${ad?`<button class="btn accent noenter" id="bzCnAd">${lb}</button>`:''}${typeof openShop==='function'?`<button class="btn noenter" id="bzCnShop">🛒 ${L('Магазин','Shop')}</button>`:''}<button class="btn" id="bzCnX" data-esc>${L('Закрыть','Close')}</button></div>${typeof adDayHtml==='function'?adDayHtml():''}`);
  try{modalRe=()=>crNo(need);}catch(e){}
  if($$('bzCnAd'))$$('bzCnAd').onclick=()=>{hideModal();GAME.ladWatch();};
  if($$('bzCnShop'))$$('bzCnShop').onclick=()=>{snd('tap');try{openShop();}catch(e){}};
  $$('bzCnX').onclick=()=>{snd('tap');hideModal();};}
// награды за рекламу: кнопка только при adOk() и остатке дневного лимита; награда — только в колбэке досмотра (GAME.adAct)
const adL=k=>{try{return adOk()&&GAME.adLeft(k)>0;}catch(e){return false;}};
function adRun(k,name,args,ok){STAT.place(k);showRewarded(()=>{let r=null;try{r=GAME.adAct(k,name,...args);}catch(e){console.error(e);}
  if(r==='day'){toast(L('На сегодня этот бонус закончился — загляните завтра','That bonus is used up for today — come back tomorrow'));return;}
  if(r&&r!=='no'&&r!=='cash')ok(r);},()=>{});}
function prog(p){return `<div class="bz-prog"><i style="width:${Math.max(0,Math.min(100,p*100)).toFixed(1)}%"></i></div>`;}
function money0(x){return (x>0?'+':'')+M(x);}
function chW(ch){return [L('нет истории','no history'),L('плохая','poor'),L('средняя','fair'),L('хорошая','good'),L('отличная','excellent')][E.chWord(ch)];}
function lastPm(b){return b.pm&&b.pm.length?b.pm[b.pm.length-1]:null;}
function bizDot(W,b){const B=E.BIZ[b.t];if(!B)return false;if(b.st==='b')return !!b.halt;if(b.down>0)return true;
  if(b.pm.length>=2&&b.pm.slice(-2).every(x=>x<0))return true;if(B.sd&&b.t!=='flow'&&b.st==='w'&&(b.stk||0)<=0&&W.cash<5000)return true;return false;}
function bizState(W,b){const B=E.BIZ[b.t];
  if(b.st==='b')return b.halt?L('стройка стоит — нет денег','construction stopped — no money'):(isPit(b.t)?L('строится','building'):L('открывается','opening'))+', '+L('ещё ','')+days(b.left)+L('',' left');
  if(b.down>0)return L('закрыта ещё ','closed for ')+days(b.down);
  const who=W.opd[b.t]?L('опердиректор','ops director'):b.mgr?L('управляющий','manager'):B.hand?L('стоите сами','you run it'):L('работает без вас','runs itself');
  return who+' · ⭐ '+num(b.rt||0,1)+(W.cities.length>1?' · '+cityN(b.c):'');}
function sparkSvg(v,h){if(!v||v.length<2)return '';const W0=300,H=h||64,mn=Math.min(...v),mx=Math.max(...v),d=mx-mn||1;
  const pts=v.map((x,i)=>[i/(v.length-1)*(W0-8)+4,H-6-(x-mn)/d*(H-14)]);const p=pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' L');
  const last=pts[pts.length-1];
  return `<svg class="bz-spark" viewBox="0 0 ${W0} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="M${pts[0][0]},${H} L${p} L${last[0]},${H} Z" style="fill:var(--accent-t)"/><path d="M${p}" fill="none" style="stroke:var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="5" style="fill:var(--accent)"/></svg>`;}
function barsSvg(v){if(!v||!v.length)return '';const W0=300,H=110,mx=Math.max(1,...v.map(Math.abs)),n=Math.max(6,v.length),bw=W0/n,z=v.some(x=>x<0)?H/2:H-18;
  return `<svg class="bz-bars" viewBox="0 0 ${W0} ${H}" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="${W0}" y1="${z}" y2="${z}" style="stroke:var(--line2)" stroke-width="1"/>`+
    v.map((x,i)=>{const hh=Math.abs(x)/mx*(z-6),y=x>=0?z-hh:z;return `<rect x="${(i+(n-v.length))*bw+bw*.18}" y="${y}" width="${bw*.64}" height="${Math.max(1,hh)}" rx="4" style="fill:${x>=0?'var(--good)':'var(--bad)'}"/>`;}).join('')+'</svg>';}
// история денег по игровым дням (для «▲ за сегодня» и мини-линии)
function cashHist(){const W=w();if(!Array.isArray(S.bzh))S.bzh=[];const h=S.bzh;
  if(!h.length||h[h.length-1][0]!==W.t){if(h.length&&h[h.length-1][0]>W.t)h.length=0;h.push([W.t,Math.round(W.cash)]);if(h.length>31)h.shift();}else h[h.length-1][1]=Math.round(W.cash);return h;}
// изменение за один игровой день; после офлайна (скачок больше дня) — не показываем, чтобы «за день» не включало всю смену
function dayGain(){const h=cashHist();if(h.length<2||h[h.length-1][0]-h[h.length-2][0]!==1)return null;return h[h.length-1][1]-h[h.length-2][1];}
function avgGain(){const h=cashHist();if(h.length<3)return 0;const k=Math.min(10,h.length-1);return (h[h.length-1][1]-h[h.length-1-k][1])/(h[h.length-1][0]-h[h.length-1-k][0]||1);}

/* ---------------- глава и шапка ---------------- */
const CH_NAME={gig:['Карьера','Career'],small:['Своё дело','My business'],mid:['Сеть','Network'],quarry:['Карьер','Quarry'],nedra:['Недра','Mining']};
const CH_TITLE={gig:['Мой день','My day'],small:['Мой бизнес','My business'],mid:['Моя сеть','My network'],quarry:['Мой карьер','My quarry']};
function statusLine(W){const n=W.biz.filter(b=>!isPit(b.t)).length;
  if(W.ooo)return L('ООО','LLC')+' · '+n+' '+pl(n,'точка','точки','точек','outlet','outlets')+(W.cities.length>1?' · '+W.cities.length+' '+pl(W.cities.length,'город','города','городов','city','cities'):'');
  if(W.ip){const y=Math.floor(E.ipMonths(W)/12)+1;return L('ИП · ','Sole trader · ')+L(y+'-й год',ordEn(y)+' year')+(n?' · '+n+' '+pl(n,'точка','точки','точек','outlet','outlets'):'');}
  return hg(L('Самозанятый · день ','Self-employed · day '),L('Самозанятая · день ','Self-employed · day '))+(W.t+1);}
function ordEn(n){return n+(n%10===1&&n%100!==11?'st':n%10===2&&n%100!==12?'nd':n%10===3&&n%100!==13?'rd':'th');}
function hname(W){if(!W||W.ned)return null;return T(CH_NAME[W.st]||CH_NAME.gig);}

/* ================= «Сегодня» ================= */
// экран перерисовывается «на месте» (morphHTML из ui.js): кнопки под пальцем не пересоздаются, фокус и прокрутка остаются
function put(el,h){if(window.morphHTML&&el.firstChild){try{window.morphHTML(el,h);return;}catch(e){console.error(e);}}el.innerHTML=h;}
const dayS=()=>{try{return Math.round((GAME.DAY_BASE||10000)/1000);}catch(e){return 10;}};
/* ---- закреплённая панель ранних глав: ⚡ силы, ✋ руки, ⭐ рейтинг, 🛌 выходной (всегда видна на «Сегодня» и «Заказах») ---- */
function pinBar(W){const M0=W.me;if(!M0||stI()>1)return '';const H=E.hands(W),en=Math.round(M0.en),lo=en<30;
  const bt=M0.out>0?`<button class="pb-rest off noenter" data-b="pinfo" data-k="out"><i>🤕</i><span>${L('больничный','sick leave')}<br>${days(M0.out)}</span></button>`
    :M0.rest>0?`<button class="pb-rest off noenter" data-b="pinfo" data-k="rest"><i>🛌</i><span>${L('отдыхаем','resting')}<br>${days(M0.rest)}</span></button>`
    :`<button class="pb-rest${en>50?' calm':''} noenter" data-b="rest"><i>🛌</i><span>${L('выходной','day off')}</span></button>`;
  return `<div class="pbar" id="bzPin"><button class="pb${lo?' lo':''} noenter" data-b="pinfo" data-k="en" aria-label="${esc(L('Силы','Energy'))}"><b>⚡ ${en}</b><small>${L('силы','energy')}</small><u><i style="width:${Math.max(0,Math.min(100,en/E.enMax(W)*100)).toFixed(1)}%"></i></u></button>`+
    `<button class="pb${H.free<1?' lo':''} noenter" data-b="pinfo" data-k="hand" aria-label="${esc(L('Руки','Hands'))}"><b>✋ ${H.free}<em>/${H.tot}</em></b><small>${L('свободно','free')}</small></button>`+
    `<button class="pb noenter" data-b="pinfo" data-k="rt" aria-label="${esc(L('Рейтинг','Rating'))}"><b>⭐ ${num(M0.rt,2)}</b><small>${L('рейтинг','rating')}</small></button>${bt}</div>`;}
function pinInfo(k){const W=w(),M0=W&&W.me;if(!M0)return;const H=E.hands(W);let t='',h='',btn='';
  if(k==='en'){const mx=E.enMax(W);t='⚡ '+L('Силы','Energy')+': '+Math.round(M0.en)+L(' из ',' of ')+mx;
    const eb=E.enBonus?E.enBonus(W):0,rg=E.rg?E.rg(W):0,lx=E.luxEn?E.luxEn(W):0;   // M17: «Режим дня» (💎) и вещи дают больше сил за ночь
    h=L(`Каждый заказ отнимает силы — сколько, написано в заказе. За ночь сон возвращает +${30+eb}${eb?` (обычно 30${rg?`, режим дня +${rg*E.REG_STEP}`:''}${lx?`, вещи +${lx}`:''})`:''}${M0.job?', а работа на складе забирает 5':''}. Выходной — 1 день, силы до максимума.`,`Every order takes energy — the amount is shown on the order. A night’s sleep gives back +${30+eb}${eb?` (base 30${rg?`, daily routine +${rg*E.REG_STEP}`:''}${lx?`, things +${lx}`:''})`:''}${M0.job?', the warehouse job takes 5':''}. A day off — 1 day, energy back to full.`)+'</p><p>'+L('Когда сил меньше 30, риск сорвать заказ вдвое выше. Больше сил за ночь дают удобная кровать, бассейн и дача (Кабинет → вещи).','Below 30 energy the risk of failing an order doubles. A comfy bed, a pool pass and a dacha give more energy per night (Office → things).')+'</p>'+pkRegHtml()+pkEnHtml()+'<p>';
    if(M0.rest<=0&&M0.out<=0)btn=`<button class="btn green noenter" data-b="restgo">🛌 ${L('Взять выходной: силы до максимума','Take a day off: energy back to full')}</button>`;}
  else if(k==='hand'){t='✋ '+L('Руки','Hands')+': '+L(`свободно ${H.free} из ${H.tot}`,`${H.free} of ${H.tot} free`);
    h=L('Руки — сколько дел вы ведёте одновременно. Каждый заказ занимает одну руку, пока не будет готов; работа на складе — тоже одну.','Hands are how many things you do at once. Each order takes a hand until it’s done; the warehouse job takes one too.')+
      (M0.gigs.length?'</p><p>'+L('Сейчас в работе: ','In progress: ')+M0.gigs.map(g=>esc(low(gShort(g.t)))+' ('+days(g.left)+')').join(', ')+'.':'')+'</p>'+pkHandHtml()+'<p>';
    if(stI()<=1&&H.free>0&&M0.rest<=0&&M0.out<=0&&UI.cur!=='gigs')btn=`<button class="btn green" data-b="tab" data-t="gigs">📋 ${L('К заказам','To the orders')}</button>`;}
  else if(k==='rt'){t='⭐ '+L('Рейтинг','Rating')+' '+num(M0.rt,2);
    h=L('Растёт за заказы без замечаний (+0,03), падает за опоздания и срывы. С ⭐ 4,7 — репетиторство и постоянные клиенты, с 4,85 — премиум-заказы на 25 % дороже.','Goes up for orders done well (+0.03), down for being late or failing. From ⭐ 4.7 — tutoring and regular clients; from 4.85 — premium orders paying 25% more.');}
  else if(k==='rest'){t='🛌 '+L('Выходной','Day off');h=L(`Ещё ${days(M0.rest)}. Силы восстанавливаются быстрее, новые заказы не берём.`,`${days(M0.rest)} left. Energy recovers faster; no new orders.`);}
  else if(k==='out'){t='🤕 '+L('Больничный','Sick leave');h=L(`Ещё ${days(M0.out)}. Заказы брать нельзя — поправляйтесь.`,`${days(M0.out)} left. No orders — get well.`);}
  modal(`<h2>${t}</h2><p>${h}</p><div class="row">${btn}<button class="btn" id="bzPiOk" data-esc>${L('Понятно','Got it')}</button></div>`);
  try{modalRe=()=>pinInfo(k);}catch(e){}$$('bzPiOk').onclick=()=>{snd('tap');hideModal();};}
/* покупки за 💎 навсегда: ✋ +1 рука (E.HAND_CR) и ⚡ +20 к запасу сил (E.EN_CR) — кнопка data-b="pkbuy" data-k="hand|en", подтверждение — crAsk (при нехватке — «нужно N 💎» и магазин) */
function pkHandHtml(){try{const n=GAME.handNext&&GAME.handNext();if(!n)return GAME.handLv&&GAME.handLv()?`<p class="bz-note">✋ ${L('Все руки за 💎 уже куплены.','All 💎 hands are bought.')}</p>`:'';
  return `<button class="btn cr w noenter" data-b="pkbuy" data-k="hand" id="bzPkHand">✋ ${L('+1 рука навсегда','+1 hand for good')} <span style="white-space:nowrap">— ${n}&nbsp;💎</span></button>`;}catch(e){return '';}}
function pkEnHtml(){try{const n=GAME.enNext&&GAME.enNext();if(!n)return GAME.enLv&&GAME.enLv()?`<p class="bz-note">⚡ ${L('Запас сил уже самый большой.','Your energy reserve is already at its largest.')}</p>`:'';
  return `<button class="btn cr w noenter" data-b="pkbuy" data-k="en" id="bzPkEn">⚡ ${L('+'+E.EN_STEP+' к запасу сил навсегда','+'+E.EN_STEP+' to your energy reserve for good')} <span style="white-space:nowrap">— ${n}&nbsp;💎</span></button>`;}catch(e){return '';}}
// M17: «Режим дня» — восстановление сил за 💎 навсегда: +10 ⚡ за ночь за ступень (E.REG_CR: 40 / 90 / 160 💎)
function pkRegHtml(){try{const n=GAME.regNext&&GAME.regNext();if(!n)return GAME.regLv&&GAME.regLv()?`<p class="bz-note">🌅 ${L('«Режим дня» — все ступени уже ваши.','“Daily routine” — all steps are yours.')}</p>`:'';
  return `<button class="btn cr w noenter" data-b="pkbuy" data-k="reg" id="bzPkReg">🌅 ${L('Режим дня: +'+E.REG_STEP+' ⚡ за ночь навсегда','Daily routine: +'+E.REG_STEP+' ⚡ per night for good')} <span style="white-space:nowrap">— ${n}&nbsp;💎</span></button>`;}catch(e){return '';}}
function pkBuy(k){if(k==='reg'){const n=GAME.regNext();if(!n)return;crAsk(n,L(`Режим дня: +${E.REG_STEP} ⚡ за ночь — навсегда`,`Daily routine: +${E.REG_STEP} ⚡ per night — for good`),()=>{const r=GAME.buyReg();
    if(r==='ok'){snd('win');buzz(20);toast('🌅 '+L(`Теперь за ночь +${30+E.enBonus(w())} ⚡`,`Now +${30+E.enBonus(w())} ⚡ per night`),2600);try{GAME.emit('o2',{k:'reg',n:GAME.regLv()});}catch(e){}try{render();}catch(e){}}else if(r==='cr')crNo(n);},true);return;}
  const hand=k==='hand',n=hand?GAME.handNext():GAME.enNext();if(!n)return;
  crAsk(n,hand?L('Ещё одна рука — навсегда','One more hand — for good'):L(`Запас сил +${E.EN_STEP} — навсегда`,`Energy reserve +${E.EN_STEP} — for good`),()=>{
    const r=hand?GAME.buyHand():GAME.buyEn();
    if(r==='ok'){snd('win');buzz(20);toast(hand?'✋ '+L('Теперь у вас на одну руку больше!','You now have one more hand!'):'⚡ '+L(`Запас сил теперь ${E.enMax(w())}`,`Energy reserve is now ${E.enMax(w())}`),2600);try{render();}catch(e){}}
    else if(r==='cr')crNo(n);},true);}
function openRest(){const W=w(),M0=W&&W.me;if(!M0)return;if(M0.rest>0||M0.out>0){pinInfo(M0.out>0?'out':'rest');return;}
  modal(`<h2>🛌 ${L('Выходной на день','A day off')}</h2><div class="say">${UI.face('happy')}<div><p>${L(`Отдыхать — тоже работа. За день силы восстановятся до максимума (сейчас ${Math.round(M0.en)} из ${E.enMax(W)}). Новые заказы в этот день не берём.`,`Resting is work too. In one day your energy comes back to full (now ${Math.round(M0.en)} of ${E.enMax(W)}). No new orders that day.`)}</p></div></div>
    <div class="row"><button class="btn green noenter" id="bzRY">🛌 ${L('Отдохнуть день','Rest for a day')}</button><button class="btn" id="bzRN" data-esc>${L('Не сейчас','Not now')}</button></div>`);
  try{modalRe=openRest;}catch(e){}
  $$('bzRN').onclick=()=>{snd('tap');hideModal();};$$('bzRY').onclick=()=>{hideModal();if(act('gigRest')==='ok'){snd('tap');toast(L('Выходной: завтра силы — до максимума','Day off: full energy tomorrow'));}};}
function rToday(el){const W=w(),M0=W.me,st=W.st;let h='';
  h+=pinBar(W);
  h+=`<div class="bz-sec" style="margin-top:0">${esc(statusLine(W))}</div>`;
  // главное сверху: цель → (планёрка/вехи META) → деньги месяца → работа
  h+=debtCard(W);
  h+=(window.OWNUI?OWNUI.evCard(W):'');   // M17: событие с выбором (js/owner-ui.js)
  h+=goalCard(W);
  h+='<div id="metaSlot" data-keep="1"></div>';
  h+=monthCard(W);
  if(M0&&stI()<=1)h+=jobCard(W);
  if(window.FRUI&&FRUI.todayCard)h+=FRUI.todayCard(W);   // M20: «Друзья» — кто ждёт ответа (js/friends-ui.js)
  // урок Школы
  const les=lesDue(W);if(les)h+=`<button class="card tap bz-li" data-b="les" data-n="${les.n}" style="padding:14px 18px"><span class="bz-ic">📘<i></i></span><span class="f1"><b>${L('Школа Людмилы: урок ','Lyudmila’s school: lesson ')+les.n}</b><small>${esc(LES[les.n].t())}</small></span><span class="chev">›</span></button>`;
  if(M0)h+=handsCard(W);
  if(M0)h+=(window.OWNUI?OWNUI.ownCard(W)+OWNUI.eduCard(W):'');   // M17: дела хозяина и учёба
  if(W.biz.length)h+=incomeCard(W);
  h+=taxCard(W);
  h+=oooCard(W);
  if(W.st==='quarry'&&E.nedraOk(W))h+=`<div class="card"><b>🎉 ${L('Можно в недра!','Ready for mining!')}</b><p class="bz-note">${L('Капитал и карьер готовы. Партнёр ждёт звонка.','Capital and quarry are ready. The partner is waiting for your call.')}</p><button class="btn accent w noenter" data-b="nedra" style="margin-top:10px">${L('Перейти в недра','Go to mining')}</button></div>`;
  // «Подарок дня» теперь в Планёрке (META, #metaSlot) — старую карточку giftCard() здесь не рисуем (был дубль)
  h+=borrowCard(W);
  if(typeof socMoreHtml==='function')h+=socMoreHtml(); // VK с мостом: «🎲 Ещё игры во дворе»
  put(el,h);
  // карточка «Планёрки»/вех (js/meta-ui.js, помощник Economy): META.card(el) сам перерисовывает содержимое слота
  const ms=$$('metaSlot');if(ms&&window.META&&typeof META.card==='function'){try{META.card(ms);}catch(e){console.error(e);}}}
// деньги этого месяца понятными словами: зарплата, заказы, точки, жизнь → сколько останется
function monthCard(W){const M0=W.me,sg=W.mon.sg||{},d=W.d,DN=E.DAYS||30,dg=dayGain();const rows=[];
  const row=(ic,t,s,v,cls)=>rows.push(`<div class="mr"><span class="bz-ic">${ic}</span><span class="f1"><b>${t}</b>${s?`<small>${s}</small>`:''}</span><span class="v ${cls||''}">${v}</span></div>`);
  let total=null,tl='';
  if(M0&&stI()===0){const jp=M0.job?(M0.jb?Math.round(E.JOB_PAY*45/52):E.JOB_PAY):0,sal=M0.job&&d>=16?jp/2:0,gr=(sg.gig&&sg.gig.rev)||0,gnet=sg.gig?(sg.gig.e||0)-Math.max(0,gr-sal)*(E.NPD||.04):0,gigs=Math.round(gnet-sal),life=(E.LIFE&&E.LIFE.gig)||38000;
    if(M0.job)row('🏭',L('Зарплата','Wage'),L('склад: половина 15-го, половина в конце месяца','warehouse: half on the 15th, half at month end'),'+'+M(jp),'good');
    row('🧾',L('Заказы','Orders'),L('на руки — после расходов и налога','take-home — after costs and tax'),(gigs>0?'+':'')+M(gigs),gigs>0?'good':'');
    row('🏠',L('Комната и еда','Room and food'),L('спишется в последний день месяца','charged on the last day of the month'),'−'+M(life),'bad');
    const pace=d>=3?gigs/d*DN:gigs;total=Math.round((jp+pace-life)/100)*100;tl=L('Останется за месяц ≈','Left over this month ≈');}
  else{const last=W.reps&&W.reps.length?W.reps[W.reps.length-1]:null;let pts=0,n=0;for(const b of W.biz)if(b.st==='w'){pts+=(b.m&&b.m.e)||0;n++;}
    if(n)row('🏪',L('Точки','Outlets')+' ('+n+')',L('прибыль с начала месяца','profit so far this month'),(pts>0?'+':'')+M(pts),pts>=0?'good':'bad');
    const gr=(sg.gig&&sg.gig.rev)||0;if(gr)row('🧾',M0&&M0.job?L('Зарплата и заказы','Wage and orders'):L('Заказы','Orders'),L('с начала месяца','so far this month'),'+'+M(gr),'good');
    const life=(E.LIFE&&E.LIFE[W.st])||45000;row('🏠',L('Жизнь и взносы','Living costs and fees'),L('спишутся в конце месяца','charged at month end'),'−'+M(life+(W.ip&&!W.ooo?4750:0)),'bad');
    if(window.OWNUI&&W.biz.length)rows.push(OWNUI.pasRow(W));   // M17: «живу на пассиве»
    if(last){let np=0;try{np=E.netOf(last.pl);}catch(e){}total=np;tl=L('Прибыль прошлого месяца','Last month’s profit');}}
  const hd=`<div class="mh"><span class="bz-lab">💰 ${L('Этот месяц','This month')} · ${L('день ','day ')}${d+1}${L(' из ',' of ')}${DN}</span>${dg!=null&&dg!==0?`<span class="bz-d ${dg>0?'up':'dn'}">${dg>0?'▲ +':'▼ −'}${M(Math.abs(dg))}<small> ${L('за день','today')}</small></span>`:''}</div>`;
  return `<div class="card bz-month">${hd}<div class="mrs">${rows.join('')}</div>${total!=null?`<div class="mt"><span>${tl}</span><b class="${total>=0?'good':'bad'}">${total>0?'+':''}${M(total)}</b></div>`:''}</div>`;}
// ближайшая цель лестницей (ECON.goal) — нажатие ведёт к действию
const GOALS={bike:['Купить велосипед','Buy a bicycle'],vend:['Купить кофейный автомат','Buy a coffee vending machine'],kiosk:['Открыть вторую точку — ларёк','Open a second outlet — a kiosk'],
  mgr:['Нанять первого управляющего','Hire your first manager'],ooo:()=>[M(OOO_EQ())+' — ООО и своя сеть',M(OOO_EQ())+' — an LLC and your own network'],base:['Стройбаза','Builders’ yard'],
  quarry:()=>[M(Q_EQ())+' — торги за карьер',M(Q_EQ())+' — bidding for a quarry'],opi:['Выиграть торги за карьер','Win a quarry auction'],nedra:()=>[M(N_EQ())+' — в недра',M(N_EQ())+' — into mining']};
const gT=k=>{const g=GOALS[k];return T(typeof g==='function'?g():g);};
// что даст цель — одной строкой, на числах игрока
function goalGive(W,k){const fp=t=>{try{return E.bizForecast(W,t).prof;}catch(e){return 0;}};
  switch(k){case 'bike':return EQ_WHY.bike();
    case 'vend':return L(`работает сам, рук ✋ не занимает — примерно +${Mr(fp('vend'))} в месяц`,`runs by itself, needs no hands ✋ — about +${Mr(fp('vend'))} a month`);
    case 'kiosk':return L(`ещё примерно +${Mr(fp('kiosk'))} в месяц, но стоять в нём нужно самому (рука ✋) — или нанять управляющего`,`about +${Mr(fp('kiosk'))} more a month, but you run it yourself (a hand ✋) — or hire a manager`);
    case 'ooo':return L('сети со скидкой на закупку, склад и опт, второй город, кредиты для бизнеса','chains with purchase discounts, wholesale, a second city, business loans');
    case 'base':return L('стройбаза продаёт песок и щебень стройкам — первый шаг к своему карьеру','a builders’ yard sells sand and gravel to builders — the first step to your own quarry');
    case 'quarry':case 'opi':return L('свой карьер добывает втрое дешевле, чем покупать у Боброва','your own quarry mines three times cheaper than buying from Bobrov');
    case 'nedra':return L('недра: уголь, руда, металл — и партнёр вкладывает деньги','mining: coal, ore, metal — and a partner invests');}
  return '';}
// срок до цели: игровые дни/месяцы и реальные минуты при нынешнем темпе
function etaTxt(left){const a=avgGain();if(!(a>0)||!(left>0))return '';const dd=Math.ceil(left/a);let min=dd*(GAME.DAY_MS||10000)/60000;
  const real=min<90?L(`≈ ${Math.max(1,Math.round(min))} мин игры`,`≈ ${Math.max(1,Math.round(min))} min of play`):(()=>{const hh=Math.round(min/60);return L(`≈ ${hh} ${pl(hh,'час','часа','часов','hour','hours')} игры`,`≈ ${hh} ${pl(hh,'час','часа','часов','hour','hours')} of play`);})();
  return L('примерно ','about ')+(dd>60?mons(Math.round(dd/30)):days(dd))+' ('+real+')';}
// долг банку (овердрафт и др.): сумма, ставка, что делать — заметно, но спокойно
function odInfo(W){let a=0,r=0,n=0;for(const l of (W.loans||[])){if(l.k==='od'||W.odM>0){a+=l.a;r=Math.max(r,l.r);n++;}}return a>0?{a,r,n}:null;}
function debtCard(W){const d=odInfo(W);if(!d||W.ned)return '';
  return `<button class="card tap bz-debt noenter" data-b="tab" data-t="fin"><div class="bz-lab">🏦 ${L('Долг банку','Bank debt')}</div><div class="gh"><b>−${M(d.a)}</b><span>${Math.round(d.r*100)}${L(' % годовых',' % a year')}</span></div><small>${L('Овердрафт растёт с процентами. Что делать: берите заказы, не тратьте лишнее, а как появятся деньги — погасите в «Финансах» → «Банк». Пока долг есть, копить на цель рано.','The overdraft grows with interest. What to do: take orders, hold back on spending, and repay it in Finance → Bank as soon as you have money. While the debt stands, saving for the goal can wait.')}</small></button>`;}
function goalCard(W){const g=E.goal(W);if(!g||!GOALS[g.k])return '';
  {const d=odInfo(W);if(d)return `<div class="card bz-goal"><div class="bz-lab">🎯 ${L('Цель','Goal')}</div><div class="gh"><b>${L('Сначала закрыть долг банку','First, repay the bank debt')}</b></div><small>${L(`Осталось вернуть ${M(d.a)}, у вас на руках ${M(Math.max(0,W.cash))}. Потом вернёмся к цели «${gT(g.k)}».`,`${M(d.a)} left to repay, you hold ${M(Math.max(0,W.cash))}. Then back to “${gT(g.k)}”.`)}</small></div>`;}const auc=W.opi.some(x=>x.st==='auc'),p=g.k==='opi'?(auc?.5:0):Math.max(0,Math.min(1,g.cur/g.need));let sub;
  const give=String(goalGive(W,g.k)).replace(/(\d) (\d)/g,'$1\u00a0$2'),gv=give?`<div class="gv">✨ ${L('Что даст: ','What it gives: ')}${esc(give)}</div>`:'';
  if(g.k==='mgr'){const c=mgrCand(W);
    if(c)return `<button class="card tap bz-goal noenter" data-b="goal" data-k="mgr" id="bzGoal"><div class="bz-lab">🎯 ${L('Цель','Goal')}</div><div class="gh"><b>${gT('mgr')}</b></div><small>${L(`Нанять в «${bn(c.b.t)}» за 30 % прибыли (~${Mr(c.w)} в месяц). Вам останется ~${Mr(c.p)}, а рука ✋ освободится для новой точки.`,`Hire for “${bn(c.b.t)}” for 30% of the profit (~${Mr(c.w)} a month). You keep ~${Mr(c.p)}, and a hand ✋ frees up for a new outlet.`)}</small><span class="btn accent sm" style="margin-top:10px;display:inline-flex">${L('Нанять','Hire')}</span></button>`;
    return `<button class="card tap bz-goal" data-b="goal" data-k="mgr" id="bzGoal"><div class="bz-lab">🎯 ${L('Цель','Goal')}</div><div class="gh"><b>${gT('mgr')}</b></div><small>${L('Откройте точку, где стоите сами (ларёк, шаурма…), — туда и нужен управляющий','Open an outlet you run yourself (a kiosk, shawarma…) — that’s where a manager helps')}</small></button>`;}
  const left=Math.max(0,g.need-g.cur);
  if(p>=1)sub=`${M(Math.max(0,g.cur))} ${L('из','of')} ${M(g.need)} · <b class="good">${L('хватает — нажмите','enough — tap here')}</b>`;
  else{sub=`${M(Math.max(0,g.cur))} ${L('из','of')} ${M(g.need)} · ${L('осталось ','to go: ')}<b>${M(left)}</b>`;const et=etaTxt(left);if(et)sub+='<br>'+et;}
  let parts='';if((g.k==='vend'||g.k==='kiosk')&&p<1){const B=E.BIZ[g.k],r=g.need-B.cap;if(r>0)parts=`<small class="gp2">${L(`${M(B.cap)} — ${g.k==='vend'?'автомат':'ларёк'}, ${M(r)} — запас на жизнь до конца месяца`,`${M(B.cap)} for the ${g.k==='vend'?'machine':'kiosk'}, ${M(r)} kept for living costs till month end`)}</small>`;}
  if(g.k==='opi'||g.k==='nedra'&&E.nedraOk(W))sub=g.k==='opi'?(auc?L('идут торги — во вкладке «Карьер»','an auction is on — see the Quarry tab'):L('перечень участков — во вкладке «Карьер»','the plot list is in the Quarry tab')):L('всё готово — нажмите','all set — tap here');
  return `<button class="card tap bz-goal" data-b="goal" data-k="${g.k}" id="bzGoal"><div class="bz-lab">🎯 ${L('Цель — на что копим','Goal — what we’re saving for')}</div><div class="gh"><b>${gT(g.k)}</b><span>${Math.floor(p*100)}${L(' %','%')}</span></div>${prog(p)}<small>${sub}</small>${parts}${gv}</button>`;}
// кандидат на первого управляющего: точка, где вы стоите сами, с лучшей прибылью при управляющем
function mgrCand(W){let best=null;for(const b of W.biz){const B=E.BIZ[b.t];if(!B||b.st!=='w'||b.mgr||!B.hand||!B.mw||W.opd[b.t])continue;const x=E.mgrProf(W,b);if(!x)continue;if(!best||x.mgr>best.p)best={b,p:x.mgr,w:x.mw};}return best;}   // M17: w — доля управляющего в месяц (30 %)
function goalGo(k){const W=w();
  if(k==='bike'){UI.go('gigs');hlQ='#bzEq-bike';return;}
  if(k==='vend'||k==='kiosk'){if(!W.ip&&!W.reg){openIP();return;}openBizModal(k);return;}
  if(k==='mgr'){const c=mgrCand(W);if(!c){V.biz='list';UI.go('biz');return;}
    modalYes(L('Нанять управляющего — ','Hire a manager — ')+bn(c.b.t),L(`Он берёт 30 % прибыли точки (~${Mr(c.w)} в месяц; в плохой месяц — оклад 15 000 ₽, но не больше прибыли). Вам останется ~${Mr(c.p)} в месяц, а рука освободится для новой точки.`,`He takes 30% of the outlet’s profit (~${Mr(c.w)} a month; in a bad month a 15,000 ₽ wage, never more than the profit). You keep ~${Mr(c.p)} a month, and your hand frees up for a new outlet.`),L('Нанять','Hire'),()=>{if(act('bizMgr',c.b.id,true)==='ok'){snd('coin');toast(L('Управляющий нанят — рука свободна','Manager hired — a hand is free'));}});return;}
  if(k==='ooo'){openOOO();return;}
  if(k==='base'||k==='quarry'){UI.go('net');return;}
  if(k==='opi'){UI.go(stI()>=3?'pit':'net');return;}
  if(k==='nedra'){if(E.nedraOk(W))openNedra();else UI.go(stI()>=3?'pit':'net');}}
// руки: работа, заказы, точки без управляющего, свободные
function handsCard(W){const M0=W.me,H=E.hands(W),it=[];
  if(M0.job)it.push(`<div class="bz-hand"><i>🏭</i><b>${L('Склад','Warehouse')}</b><small>${L('работа','job')}</small></div>`);
  for(const g of M0.gigs)it.push(`<button class="bz-hand" data-b="tab" data-t="gigs"><i>${E.GIGS[g.t].ico}</i><b>${esc(gShort(g.t))}</b><small>${days(g.left)}</small></button>`);
  for(const b of W.biz){const B=E.BIZ[b.t];if(!B||b.mgr||!B.hand||W.opd[b.t])continue;it.push(`<button class="bz-hand" data-b="bpt" data-id="${b.id}"><i>${bico(b.t)}</i><b>${esc(bShort(b.t))}</b><small>${B.hand<1?L('полруки','half a hand'):L('стоите сами','you run it')}</small></button>`);}
  for(const t in W.opd)if(W.opd[t])it.push(`<button class="bz-hand" data-b="tab" data-t="net"><i>${bico(t)}</i><b>${L('Сеть','Network')}</b><small>${L('руководите','you lead')}</small></button>`);
  const busy=M0.rest>0||M0.out>0;
  for(let i=0;i<H.free;i++)it.push(busy?`<div class="bz-hand"><i>${M0.out>0?'🤕':'🛌'}</i><b>${L('Отдыхает','Resting')}</b><small>${days(Math.max(M0.rest,M0.out))}</small></div>`
    :`<button class="bz-hand free" data-b="tab" data-t="${stI()<=1?'gigs':'biz'}" id="bzFree${i}"><i>＋</i><b>${L('Свободно','Free')}</b><small>${stI()<=1?L('взять заказ','take a job'):L('открыть дело','open a business')}</small></button>`);
  return `<div class="bz-sec">✋ ${L('Ваши руки','Your hands')} · ${L('занято','busy')} ${Math.ceil(H.used-1e-9)} ${L('из','of')} ${H.tot}</div><div class="card"><div class="bz-hands">${it.join('')}</div>${stI()>=1&&H.free<1?`<p class="bz-note">${L('Все руки заняты. Наймите управляющего в точку — рука освободится.','All hands are busy. Hire a manager for an outlet to free a hand.')}</p>`:''}${H.free<1&&GAME.handNext&&GAME.handNext()?`<div style="margin-top:10px">${pkHandHtml()}</div>`:''}</div>`;}   // на «Сегодня» — только когда все руки заняты; всегда — в окне «✋ Руки»
const G_SHORT={flyer:['Листовки','Flyers'],courier:['Курьер','Courier'],article:['Статья','Article'],taxi:['Такси','Taxi'],loader:['Грузчик','Mover'],handy:['Мастер','Handyman'],tutor:['Репетитор','Tutor'],resale:['Перепродажа','Resale'],
  night:['Ночная смена','Night shift'],dog:['Выгул собак','Dog walking'],nurse:['Помощь соседке','Helping a neighbour'],wed:['Официант','Waiter'],photo:['Фотосъёмка','Photo shoot'],phone:['Ремонт телефонов','Phone repairs'],
  dacha:['Дача','Garden work'],online:['Урок онлайн','Online lesson'],furn:['Сборка мебели','Furniture assembly']};
function gShort(t){if(t==='santa')return hg(L('Дед Мороз','Father Frost'),L('Снегурочка','Snow Maiden'));return T(G_SHORT[t])||gn(t);}
const B_SHORT={barber:['Барбершоп','Barbershop'],bakery:['Пекарня','Bakery'],canteen:['Столовая','Canteen'],hard:['Хозмаг','Hardware shop'],pharm:['Аптека','Pharmacy'],club:['Клуб','Club'],clean:['Химчистка','Dry cleaner'],truckf:['Фудтрак','Food truck'],vend:['Автомат','Machine'],kiosk:['Ларёк','Kiosk'],shaw:['Шаурма','Shawarma'],flow:['Цветы','Flowers'],pvz:['ПВЗ','Pick-up'],coffee:['Кофе','Coffee'],wash:['Мойка','Car wash'],tire:['Шины','Tyres'],sto:['Автосервис','Car service'],gazel:['Газель','Van'],whs:['Склад','Warehouse'],base:['Стройбаза','Yard'],truck:['Самосвал','Truck'],sandpit:['Песок','Sand'],gravpit:['Щебень','Gravel']};
function bShort(t){return T(B_SHORT[t])||bn(t);}
function incomeCard(W){const rows=[],sg=W.mon.sg||{},M0=W.me;
  if(M0&&(M0.job||(sg.gig&&sg.gig.rev))){rows.push(`<button class="bz-li" data-b="tab" data-t="${stI()<=1?'gigs':'today'}"><span class="bz-ic">${M0.job?'🏭':'🧾'}</span><span class="f1"><b>${M0.job?L('Работа и подработка','Job and side jobs'):L('Подработка','Side jobs')}</b><small>${M0.job?L('зарплата 15-го и в конце месяца','pay on the 15th and at month end'):L('заказы','orders')}${M0.gigs.length?' · '+L('в работе: ','in progress: ')+M0.gigs.length:''}</small></span><span class="v good">${money0((sg.gig&&sg.gig.rev)||0)}<small>${L('с начала месяца','this month')}</small></span></button>`);}
  const pts=W.biz.slice().sort((a,b)=>(lastPm(b)||0)-(lastPm(a)||0));
  // одинаковые работающие точки — одной строкой: «☕ Кофейный автомат × 9 · прибыль за месяц»
  const grp={};for(const b of pts)if(b.st==='w')(grp[b.t]=grp[b.t]||[]).push(b);
  const it=[];const seen={};for(const b of pts){const g=grp[b.t];if(b.st==='w'&&g&&g.length>1){if(seen[b.t])continue;seen[b.t]=1;it.push({g});}else it.push({b});}
  for(const x of it.slice(0,8)){if(x.g){const t=x.g[0].t;let s=0,k=0;for(const b of x.g){const p=lastPm(b);if(p!=null){s+=p;k++;}}
      rows.push(`<button class="bz-li" data-b="tab" data-t="${isMid(t)?'net':isPit(t)?'pit':'biz'}"><span class="bz-ic">${bico(t)}${x.g.some(b=>bizDot(W,b))?'<i></i>':''}</span><span class="f1"><b>${esc(bn(t))} × ${x.g.length}</b><small>${x.g.length} ${pl(x.g.length,'точка','точки','точек','outlet','outlets')}</small></span><span class="v ${k?s>=0?'good':'bad':''}">${k?money0(s):'—'}<small>${k?L('прибыль за месяц','profit last month'):''}</small></span></button>`);continue;}
    const b=x.b;const p=lastPm(b);rows.push(`<button class="bz-li" data-b="bpt" data-id="${b.id}"><span class="bz-ic">${bico(b.t)}${bizDot(W,b)?'<i></i>':''}</span><span class="f1"><b>${esc(bn(b.t))}</b><small>${esc(bizState(W,b))}</small></span><span class="v ${p==null?'':p>=0?'good':'bad'}">${b.st==='w'?(p==null?money0(b.m.e):money0(p)):'—'}<small>${b.st!=='w'?'':p==null?L('с начала месяца','this month'):L('прибыль за месяц','profit last month')}</small></span></button>`);}
  if(it.length>8)rows.push(`<button class="bz-li" data-b="tab" data-t="biz"><span class="bz-ic">…</span><span class="f1"><b>${L('Все точки','All outlets')} (${pts.length})</b></span><span class="chev">›</span></button>`);
  if(!rows.length)return '';
  return `<div class="bz-sec">${L('Доходы','Income')}</div><div class="card bz-list">${rows.join('')}</div>`;}
function taxCard(W){let t,sub='',btn='';
  if(W.taxm==='npd'){t=L('Самозанятый: налог 4 % с заказов','Self-employed: 4% tax on orders');sub=L('Зарплату кладовщика облагает работодатель. Для своей точки нужно ИП: перепродавать товар самозанятым нельзя.','Your employer taxes the warehouse wage. A business needs sole-trader status: the self-employed can’t resell goods.');}
  else if(W.taxm==='usn6'||W.taxm==='usn15'){t=W.taxm==='usn6'?L('ИП, УСН 6 % с доходов','Sole trader, 6% tax on revenue'):L('ИП, УСН 15 % с прибыли','Sole trader, 15% tax on profit');
    sub=W.ooo?L('ООО на упрощёнке; бухгалтер — 90 000 ₽ в месяц.','LLC on the simplified tax; accountant 90,000 ₽ a month.'):(W.taxm==='usn6'?L('Взносы ИП — 4 750 ₽ в месяц, они уменьшают налог 6 %.','Sole-trader contributions are 4,750 ₽ a month; they reduce the 6% tax.'):L('Взносы ИП — 4 750 ₽ в месяц, они входят в расходы и уменьшают прибыль для налога 15 %.','Sole-trader contributions are 4,750 ₽ a month; they count as expenses and reduce the profit taxed at 15%.'));
    if(E.taxOk(W)){const c=E.taxCmp(W),ad=E.taxAdv?E.taxAdv(W):null;sub+=' '+(c.n?L(`За ${mons(c.n)} налог был бы: 6 % — ${M(c.usn6)}, 15 % — ${M(c.usn15)}.`,`Over ${mons(c.n)} the tax would be: 6% — ${M(c.usn6)}, 15% — ${M(c.usn15)}.`):'')+(ad?' '+L(`Людмила: на ваших точках за год ${ad.best==='usn6'?'6 %':'15 %'} выгоднее (${M(ad.u6)} против ${M(ad.u15)}).`,`Lyudmila: for your outlets over a year ${ad.best==='usn6'?'6%':'15%'} is cheaper (${M(ad.u6)} vs ${M(ad.u15)}).`):'')+' '+L('Сейчас можно выбрать режим на год:','You can choose the regime for the year now:');
      btn=`<div class="pick"><button data-b="taxm" data-v="usn6" class="noenter${W.taxm==='usn6'?' on':''}">6 % ${L('с доходов','of revenue')}</button><button data-b="taxm" data-v="usn15" class="noenter${W.taxm==='usn15'?' on':''}">15 % ${L('с прибыли','of profit')}</button></div>`;}
    else{const n=E.taxNext?E.taxNext(W):0;sub+=' '+L(`Сменить режим можно раз в 12 месяцев — ещё ${mons(Math.max(1,n))}.`,`You can switch once every 12 months — ${mons(Math.max(1,n))} to go.`);}}
  else return '';
  if(!W.ip){if(W.reg&&W.reg.k==='ip')btn=`<div class="tip">📄 ${L('ИП оформляется: ещё ','Registration in progress: ')+days(Math.max(1,W.reg.t-W.t))+L('',' left')}</div>`;
    else btn=`<button class="btn${E.goal(W)&&E.goal(W).k==='vend'?' accent':''} w noenter" data-b="ip" style="margin-top:10px" id="bzIP">📄 ${L('Оформить ИП — 0 ₽, 3 дня','Register as a sole trader — 0 ₽, 3 days')}</button>`;}
  return `<div class="bz-sec">${L('Налоги','Taxes')}</div><div class="card"><b>🧾 ${t}</b><p class="bz-note">${sub}</p>${btn}</div>`;}
function jobCard(W){const M0=W.me;
  if(M0.job){const pay=M0.jb?Math.round(E.JOB_PAY*45/52):E.JOB_PAY;let pts=0;for(const b of W.biz){const p=lastPm(b);if(p)pts+=p;}
    return `<div class="card bz-job"><div class="bz-hd"><span class="bz-ic">🏭</span><div class="f1"><b>${L('Основная работа: кладовщик','Main job: storekeeper')}</b><small>${L(`${M(pay)} в месяц · 1 рука ✋ · −5 ⚡ в день`,`${M(pay)} a month · 1 hand ✋ · −5 ⚡ a day`)}</small></div></div>
      <p class="bz-note">${W.biz.length?L(`Точки за прошлый месяц: ${M(pts)}. Увольняться стоит, когда точки два месяца подряд приносят больше зарплаты.`,`Outlets last month: ${M(pts)}. Quit once outlets out-earn the wage two months running.`):L('Зарплата — надёжные деньги, пока нет своего дела. Уволитесь — освободится рука ✋ и +5 ⚡ в день.','The wage is safe money until you have a business. Quit and you free a hand ✋ and +5 ⚡ a day.')}</p>
      <button class="btn w noenter" data-b="quit" style="margin-top:10px">🚪 ${L('Уволиться…','Quit…')}</button></div>`;}
  if(E.jobBackOk(W))return `<div class="card bz-job"><div class="bz-hd"><span class="bz-ic">🏭</span><div class="f1"><b>${L('Вернуться на склад?','Back to the warehouse?')}</b><small>${L('45 000 ₽ в месяц · займёт 1 руку ✋','45,000 ₽ a month · takes 1 hand ✋')}</small></div></div><button class="btn w noenter" data-b="jobback" style="margin-top:10px">🏭 ${L('Вернуться на работу','Go back to work')}</button></div>`;
  return '';}
function oooCard(W){if(!W.ip||W.ooo||W.biz.length<2)return '';
  if(W.reg&&W.reg.k==='ooo')return `<div class="card"><b>🏢 ${L('ООО оформляется','LLC registration in progress')}</b><p class="bz-note">${L('Ещё ','')}${days(Math.max(1,W.reg.t-W.t))}${L('',' left')}</p></div>`;
  const q=E.oooReq(W),all=q.eq&&q.pts&&q.mgr&&q.ch;
  return `<div class="card"><b>🏢 ${L('Следующая глава — «Сеть» (ООО)','Next chapter — Network (LLC)')}</b>${oooList(W,q)}${all?`<button class="btn accent w noenter" data-b="ooo" style="margin-top:6px">${L('Оформить ООО — 0 ₽, 5 дней','Register an LLC — 0 ₽, 5 days')}</button>`:''}</div>`;}
function ck(ok,t){return `<div class="${ok?'ok':'no'}"><i>${ok?'✓':'○'}</i><span>${t}</span></div>`;}
function oooList(W,q){return `<div class="bz-ck">${ck(q.eq,L('Капитал от ','Equity from ')+M(OOO_EQ())+L(' — сейчас ',' — now ')+M(q.eqv))}${ck(q.pts,L(`Не меньше 4 точек — сейчас ${q.ptsn}`,`At least 4 outlets — now ${q.ptsn}`))}${ck(q.mgr,L('Хотя бы в одной точке управляющий','A manager in at least one outlet'))}${ck(q.ch,L('Кредитная история не ниже «хорошей» (50 из 100) — сейчас ','Credit history “good” or better (50 of 100) — now ')+Math.floor(W.ch||0)+L(', «',', “')+chW(W.ch)+L('»','”'))}</div>${q.ch?'':chHelp(W)}`;}
// кредитная история для ООО: прогресс, срок и как ускорить (без кредитов растёт только на 1,5 в месяц — ~33 месяца с нуля)
function chHelp(W){const c=E.chInfo(W);let t;
  if(c.per<0)t=L('В этом месяце был овердрафт: −25. Выправьте деньги — потом история снова пойдёт вверх.','There was an overdraft this month: −25. Fix your cash first — then the history grows again.');
  else if(c.loan)t=L(`Кредит платится вовремя: +3 в месяц — «хорошая» через ~${mons(c.eta)}. Закроете досрочно — ещё +10.`,`The loan is paid on time: +3 a month — “good” in ~${mons(c.eta)}. Repay early — another +10.`);
  else t=L(`Без кредитов история растёт медленно: +1,5 в месяц — ещё ~${mons(Math.max(1,c.eta))}. Быстрее: взять небольшой кредит${c.card?' или кредитную карту':''} и платить вовремя — +3 в месяц, а досрочное погашение — ещё +10. Овердрафт — −25.`,`Without loans it grows slowly: +1.5 a month — ~${mons(Math.max(1,c.eta))} more. Faster: take a small loan${c.card?' or a credit card':''} and pay on time — +3 a month, and repaying early — another +10. An overdraft is −25.`);
  return `<div class="bz-lab" style="margin-top:6px">🏦 ${L('Кредитная история','Credit history')}: ${Math.floor(c.ch)} / ${c.need}</div>${prog(c.ch/c.need)}<p class="bz-note">${t}</p>`;}
function borrowCard(W){if(W.ned||stI()>1)return '';const lim=E.cardLimit(W),hasCard=W.loans.some(l=>l.card),mfo=W.loans.some(l=>l.mfo);let r='';
  if(lim&&!hasCard)r+=`<button class="bz-li" data-b="card"><span class="bz-ic">💳</span><span class="f1"><b>${L('Кредитная карта до ','Credit card up to ')+M(lim)}</b><small>${L('3 месяца без процентов, потом 36 % годовых','3 months interest-free, then 36% a year')}</small></span><span class="chev">›</span></button>`;
  if(!mfo&&W.cash<20000)r+=`<button class="bz-li" data-b="mfo"><span class="bz-ic">⚠️</span><span class="f1"><b>${L('Микрозайм 30 000 ₽','Payday loan 30,000 ₽')}</b><small>${L('0,8 % в день — Людмила против','0.8% a day — Lyudmila is against it')}</small></span><span class="chev">›</span></button>`;
  const ch=`<button class="bz-li" data-b="tab" data-t="fin"><span class="bz-ic">🏦</span><span class="f1"><b>${L('Кредитная история: ','Credit history: ')+chW(W.ch)} · ${Math.floor(W.ch||0)}/100</b><small>${W.ip&&!W.ooo&&(W.ch||0)<E.CH_OOO?L(`для ООО нужно ${E.CH_OOO}; `,`an LLC needs ${E.CH_OOO}; `):''}${L('растёт, если платить вовремя; банк — в «Финансах»','grows when you pay on time; the bank is in Finance')}</small></span><span class="chev">›</span></button>`;
  return `<div class="bz-sec">${L('Деньги в долг','Borrowing')}</div><div class="card bz-list">${r}${ch}</div>`;}

/* ================= «Заказы» ================= */
// доска заказов не прыгает под пальцем: пока игрок на экране «Заказы», карточки стоят на своих местах —
// взятая остаётся на месте с пометкой «в работе», ушедшая — «заказ ушёл», новые — только в конец. Всё, что меняет высоту, — ниже доски.
let gbKeep=null;
function rGigs(el){const W=w(),M0=W.me;if(!M0){el.innerHTML='';return;}const H=E.hands(W);let h=pinBar(W);
  const live=M0.board,best=bestGig(W);
  if(!gbKeep)gbKeep={ids:live.slice().sort((a,b)=>(b.urg||0)-(a.urg||0)).map(g=>g.id),g:{},x:{},tk:{}};
  for(const g of live){gbKeep.g[g.id]=g;if(gbKeep.ids.indexOf(g.id)<0)gbKeep.ids.push(g.id);}
  // ушедшая/взятая строка стоит серой на своём месте до конца следующего игрового дня, потом убирается
  for(const id of gbKeep.ids.slice())if(!live.some(x=>x.id===id)){if(gbKeep.x[id]===undefined)gbKeep.x[id]=W.t;else if(W.t-gbKeep.x[id]>=2){gbKeep.ids.splice(gbKeep.ids.indexOf(id),1);delete gbKeep.g[id];}}
  // «Взять лучший» — всегда на месте и одной высоты (без свободной руки — неактивна с причиной): список под ней не сдвигается
  const soon=M0.gigs.length?Math.min(...M0.gigs.map(g=>g.left)):0;
  const bwhy=M0.out>0?WHY_G.out():M0.rest>0?WHY_G.rest():H.free<1?WHY_G.hand()+(soon?L(' — освободится через ',' — free in ')+days(soon):''):!live.length?L('Заказов пока нет','No jobs yet'):live.every(g=>E.gigCanTake(W,g)!=='ok')&&live.some(g=>E.gigCanTake(W,g)==='en')?L('Мало сил ⚡ — возьмите выходной 🛌','Low energy ⚡ — take a day off 🛌'):L('Нет подходящих заказов','No suitable jobs');
  const lowEn=!best&&M0.rest<=0&&M0.out<=0&&H.free>0&&live.some(g=>E.gigCanTake(W,g)==='en');
  h+=lowEn?`<button class="btn w noenter bz-best" data-b="rest" id="bzBest">🛌 ${L('Сил мало — взять выходной: силы до максимума','Low energy — take a day off: back to full')}</button>`
    :`<button class="btn green w noenter bz-best" data-b="gbest" id="bzBest"${best?'':' disabled'}>✋ ${best?(window.innerWidth<380?L('Лучший','Best'):L('Взять лучший','Take the best'))+`: ${esc(low(gShort(best.t)))}, ${M(best.pay)}`:esc(bwhy)}</button>`;
  // просьба друга из «Телефона» — карточкой над доской, чтобы не истекала молча
  try{const F=W.fr,pq=F&&F.q&&F.q.find(q=>!q.big&&window.STORYUI&&STORYUI.openAsk&&FRN[q.w]);
    if(pq)h+=`<button class="card tap bz-li noenter" data-b="fask" data-id="${pq.id}" style="padding:12px 16px;margin-bottom:8px"><span class="bz-ic">📱</span><span class="f1"><b>${esc(T(FRN[pq.w]))}${L(' просит помощи',' asks for help')}</b><small>${L('ответьте — просьба не ждёт вечно','reply — the request won’t wait forever')}</small></span><span class="chev">›</span></button>`;}catch(e){}
  h+=`<div class="bz-sec">${L('Доска заказов','Job board')} <small>· ${L('ждут несколько дней','they wait a few days')}</small></div><div class="card glist">`;
  if(!gbKeep.ids.length)h+=`<div class="gr"><span class="mut">${L('Новые заказы появятся завтра.','New orders will appear tomorrow.')}</span></div>`;
  for(const id of gbKeep.ids){const g=gbKeep.g[id];if(!g)continue;const lv=live.find(x=>x.id===id);
    if(lv){h+=gigRow(W,lv);continue;}
    const tk=M0.gigs.some(x=>x.id===id);if(tk)gbKeep.tk[id]=1;h+=gigRow(W,g,tk?'took':gbKeep.tk[id]?'done':'gone');}
  h+='</div>';
  if(M0.gigs.length){h+=`<div class="bz-sec">${L('В работе','In progress')}</div><div class="card glist">`+M0.gigs.map(g=>`<div class="gw"><div class="gr"><span class="gi"><span class="bz-ic">${E.GIGS[g.t].ico}</span><span class="f1"><b>${esc(gShort(g.t))}</b><small>${L('готово через ','done in ')+days(g.left)}${g.auto?' · '+L('постоянный клиент','regular client'):''}${g.o&&E.GIGS[g.t].ch?' · '+esc(low(opv(E.GIGS[g.t].ch.find(c=>c[0]===g.o)||E.GIGS[g.t].ch[0]))):''}</small></span></span><span class="v good">${g.t==='resale'?'~'+M(Math.round(g.inv*(1+g.ret))):'+'+M(g.pay)}</span></div>${prog((g.days-g.left)/g.days)}${adL('x2')&&E.gigX2Ok(W,g.id)?`<button class="btn sm w noenter" data-b="gx2" data-id="${g.id}" style="margin:6px 0 4px">📺 ${L('×2 за рекламу','×2 for an ad')}: +${M(g.pay)} → +${M(g.pay*2)}</button>`:g.x2?`<div class="bz-note good" style="margin:4px 0">✓ ${L('Заказчик заплатил вдвое','The client paid double')}</div>`:''}</div>`).join('')+'</div>';}
  if(M0.out>0)h+=`<div class="tip">🤕 ${L('Больничный ещё ','Sick leave: ')+days(M0.out)+L('. Заказы брать нельзя.',' left. You can’t take orders.')}</div>`;
  else if(M0.rest>0)h+=`<div class="tip">🛌 ${L('Выходной ещё ','Day off: ')+days(M0.rest)+L('. Силы восстанавливаются.',' left. Energy is recovering.')}</div>`;
  else if(M0.en<30)h+=`<div class="tip">⚡ ${L('Сил мало — риск сорвать заказ вдвое выше. Возьмите выходной (кнопка 🛌 вверху).','Low energy — twice the risk of failing an order. Take a day off (the 🛌 button at the top).')}</div>`;
  // второе дыхание и срочный заказ — одной карточкой
  const bOk=E.breathOk(W),uOk=E.urgentGigOk(W);
  h+=`<div class="bz-sec">${L('Ускорители','Boosts')}</div><div class="card"><b>⚡ ${L('Второе дыхание: +50 сил','Second wind: +50 energy')}</b><p class="bz-note">${bOk?L('Раз в игровую неделю.','Once per game week.'):L('Уже было на этой неделе.','Already used this week.')}</p><div class="btns">
    <button class="btn cr sm noenter" data-b="brCr"${bOk?'':' disabled'}>💎 ${E.CR_BIZ.breath}</button>${adL('breath')?`<button class="btn sm noenter" data-b="brAd"${bOk?'':' disabled'}>📺 ${L('бесплатно за рекламу','free for an ad')}</button>`:''}</div>
    <div class="hr"></div><b>🔥 ${L('Срочный заказ: оплата ×1,5','Urgent order: pay ×1.5')}</b><p class="bz-note">${uOk?L('Раз в игровой месяц появится на доске.','Once a game month it appears on the board.'):L('В этом месяце уже был.','Already used this month.')}</p><div class="btns"><button class="btn cr sm noenter" data-b="urgCr"${uOk?'':' disabled'}>💎 ${E.CR_BIZ.urgent} — ${L('найти','find one')}</button>${adL('urg')?`<button class="btn sm noenter" data-b="urgAd"${uOk?'':' disabled'}>📺 ${L('бесплатно за рекламу','free for an ad')}</button>`:''}</div></div>`;
  // постоянный клиент
  const au=E.GL2.filter(t=>E.autoOk(W,t)||M0.auto[t]);
  h+=`<div class="bz-sec">${L('Постоянный клиент','Regular client')}</div><div class="card">`+(au.length?`<p class="bz-note" style="margin-top:0">${L('Когда рука свободна и сил больше 40, игра сама берёт такой заказ — и пока вас нет. Один клиент — одна рука: новый заказ он даст, когда закончится прежний. Платит 85 %, с 6-го уровня опыта — 89 %, с 9-го — 93 %.','When a hand is free and energy is over 40, the game takes such an order for you — even while you’re away. One client takes one hand: the next order comes when the previous one is done. Pays 85%, from experience lv 6 — 89%, from lv 9 — 93%.')}</p>`+au.map(t=>`<button class="sw noenter" data-b="gauto" data-t="${t}"><span>${E.GIGS[t].ico} ${esc(gn(t))} <small class="mut">· ${Math.round(E.autoPay(W,t)*100)}${L(' %','%')}${E.gigSeason(W,t)?'':' · '+L('не сезон','off season')}</small></span>${M0.auto[t]?`<i>${L('вкл','on')}</i>`:`<i class="off">${L('выкл','off')}</i>`}</button>`).join('')
    :`<p class="bz-note" style="margin-top:0">${L('Откроется после 5 заказов одного вида при рейтинге ⭐ 4,7 и выше.','Unlocks after 5 orders of one kind with a ⭐ 4.7+ rating.')}</p>`)+'</div>';
  // снаряжение
  h+=`<div class="bz-sec">${L('Покупки для работы','Gear for work')}</div><div class="card bz-list">`+Object.keys(E.EQ).map(k=>eqRow(W,k)).join('')+'</div>';
  // опыт
  const xp=E.GL2.filter(t=>(M0.n[t]||0)>0);
  if(xp.length)h+=`<div class="bz-sec">${L('Опыт','Experience')}</div><div class="card"><div class="bz-pills">`+xp.map(t=>{const l=E.lvl(W,t),nx=E.lvlNext(W,t);return `<span${l>=6?' class="a"':''}>${E.GIGS[t].ico} ${esc(gShort(t))} — ${L('ур. ','lv ')+l}/${E.LV_MAX}${nx?` · ${M0.n[t]}/${nx}`:' ★'}</span>`;}).join('')+`</div><p class="bz-note">${L('Уровень растёт с числом заказов одного вида (до 5-го — каждые 5, дальше — 30, 42, 56, 72, 90) — платят больше. С 6-го уровня постоянный клиент платит 89 %, с 7-го — премиум-заказы +25 %, с 8-го риск вдвое ниже, с 9-го клиент платит 93 %, 10-й — мастер своего дела.','Level grows with orders of one kind (every 5 up to lv 5, then 30, 42, 56, 72, 90) — better pay. From lv 6 a regular client pays 89%, lv 7 — premium orders +25%, lv 8 — half the risk, lv 9 — the client pays 93%, lv 10 — a master of the trade.')}</p></div>`;
  put(el,h);}
const G_RISK={flyer:()=>L('без риска — учебный заказ','no risk — a training job'),courier:g=>(g.v==='car'?L('на машине','by car'):g.v==='bike'?L('на велосипеде','by bicycle'):L('пешком','on foot'))+' · '+L('опоздание 10 % — штраф 300 ₽','late 10% — 300 ₽ fine'),
  article:g=>(g.days<3?L('с ноутбуком быстрее','faster with a laptop')+' · ':'')+L('отказ заказчика 5 % — без оплаты','client rejects 5% — no pay'),
  taxi:g=>L(`касса ~9 000, комиссия 26 %, бензин${g.v==='own'?'':' и аренда машины'} — на руки ${M(g.pay)} · ДТП 2 %`,`takings ~9,000, 26% commission, fuel${g.v==='own'?'':' and car rent'} — you keep ${M(g.pay)} · crash 2%`),
  loader:()=>{const W=w(),e1=W&&!W.biz.length&&W.me&&W.me.ng<30;return e1?L('нужно 50+ сил · ушиб 5 %: день без заказов','needs 50+ energy · bruise 5%: a day off'):L('нужно 50+ сил · травма 5 %: 3 дня без заказов','needs 50+ energy · injury 5%: 3 days off');},handy:()=>L('испортил вещь 5 % — возмещение 3 000 ₽','damage 5% — 3,000 ₽ compensation'),
  tutor:()=>L('отмена 10 % — оплата на четверть меньше','cancellation 10% — a quarter less pay'),
  night:g=>L('пересорт 5 % — штраф 1 500 ₽','a mix-up 5% — 1,500 ₽ fine')+(E.gigHi(w(),'night')?' · '+L('сезон распродаж: +20 %','sales season: +20%'):''),
  dog:()=>L('собака сорвалась с поводка 5 % — половина оплаты','a dog slips its lead 5% — half pay'),nurse:()=>L('не всё успели 5 % — оплата на 20 % меньше','not everything done 5% — 20% less pay'),
  wed:()=>L('разбили посуду 5 % — 1 000 ₽','broken dishes 5% — 1,000 ₽'),photo:()=>L('сбой карты памяти 4 % — половина оплаты','a memory-card glitch 4% — half pay'),
  phone:()=>L('возврат 5 % — 2 000 ₽','a return 5% — 2,000 ₽'),dacha:()=>L('нужно 50+ сил · сорвали спину 4 %: 2 дня без заказов','needs 50+ energy · a strained back 4%: 2 days off'),
  santa:()=>L('аренда костюма 1 500 ₽ уже вычтена · опоздание 8 % — оплата на 30 % меньше','costume hire 1,500 ₽ already deducted · late 8% — 30% less pay'),
  online:()=>L('отмена 10 % — оплата на четверть меньше','cancellation 10% — a quarter less pay'),furn:()=>L('поцарапали мебель 5 % — 2 500 ₽','scratched furniture 5% — 2,500 ₽'),
  resale:g=>{const rk=Math.round((g.chk&&typeof g.rk==='number'?g.rk:.15)*100),lo=M(Math.round(g.inv*.2)),back=M(Math.round(g.inv*(1+g.ret)));return L(`вложить ${M(g.inv)} — вернётся ~${back} · шанс, что не продастся, ${g.chk?'(проверено) ':'обычно '}— ${rk} из 100: тогда потеряете ${lo}`,`invest ${M(g.inv)} — get back ~${back} · chance it won’t sell ${g.chk?'(checked) ':'is usually '}${rk} in 100: then you lose ${lo}`);}};
// «Людмила проверит сделку»: вердикт по точному риску
function dealSay(g){const r=typeof g.rk==='number'?g.rk:.15,p=Math.round(r*100);
  return r<=.1?L(`Людмила: риск не продать — ${p} %. Товар ходовой, берите.`,`Lyudmila: the risk it won’t sell is ${p}%. It sells well — go for it.`)
    :r<=.18?L(`Людмила: риск — ${p} %, как обычно. Решайте по деньгам.`,`Lyudmila: the risk is ${p}%, about usual. Decide on the money.`)
    :L(`Людмила: риск — ${p} %, высокий. Я бы не брала.`,`Lyudmila: the risk is ${p}%, high. I’d pass.`);}
const WHY_G={out:()=>L('Вы на больничном','You’re on sick leave'),rest:()=>L('У вас выходной','You’re on a day off'),hand:()=>L('Нет свободной руки','No free hand'),en:()=>L('Мало сил','Too little energy'),cash:()=>L('Не хватает денег на закупку','Not enough money to buy stock'),no:()=>L('Нельзя','Unavailable')};
function gigReq(W,t){if(t==='tutor')return L('нужно ⭐ 4,7 и 10 заказов','needs ⭐ 4.7 and 10 orders');if(t==='handy')return L('нужен инструмент','needs a tool kit');
  const q=E.GIGS[t]&&E.GIGS[t].req;if(!q)return '';const M0=W.me,a=[];
  if(q.eq&&!M0.eq[q.eq])a.push(L('нужен ','needs ')+low(L(E.EQ[q.eq].n,E.EQ[q.eq].en)));if(q.rt&&M0.rt<q.rt)a.push(L('нужно ⭐ ','needs ⭐ ')+num(q.rt,1));
  if(q.n&&M0.ng<q.n)a.push(L(`${q.n} заказов всего`,`${q.n} orders in total`));if(q.lv&&E.lvl(W,q.lv[0])<q.lv[1])a.push(L(`опыт «${gShort(q.lv[0])}» ур. ${q.lv[1]}`,`“${gShort(q.lv[0])}” experience lv ${q.lv[1]}`));
  return a.join(', ');}
// снаряжение, которого не хватает заказу (кнопка «купить» прямо в строке)
function reqEq(W,t){if(t==='handy')return W.me.eq.tool?'':'tool';const q=E.GIGS[t]&&E.GIGS[t].req;return q&&q.eq&&!W.me.eq[q.eq]?q.eq:'';}
// варианты заказа (мини-решение): выбранный в окне — до взятия
const gSel={};
function optTxt(g,o){const x=E.gigOpt(g,o[0]);return M(x.pay)+' · ⚡'+x.e+' · '+days(x.days)+(x.rm>1?' · '+L('риск ×','risk ×')+num(x.rm,1):'');}
// лучший заказ — больше денег на единицу сил (без перепродажи: там вложение)
const FRN={owl:['Соня','Sonya'],beav:['Борис','Boris'],bars:['Пётр','Pyotr'],vit:['Витя','Vitya'],bear:['Топтыгин','Toptygin']};
// «Лучший»: больше ₽ за день занятой руки (дни считаются), при равенстве — за силы; слишком дешёвое (< 1000 ₽/день) не предлагаем; пока идёт шаг обучения «листовки» — тот же заказ, что советует Людмила
function bestGig(W){const ok=W.me.board.filter(g=>g.t!=='resale'&&E.gigCanTake(W,g)==='ok');
  try{if(tutStep()==='take1'){const f=ok.find(g=>g.t==='flyer');if(f)return f;}}catch(e){}
  const day=g=>g.pay/Math.max(1,g.days||1);
  return ok.filter(g=>day(g)>=1000).sort((a,b)=>day(b)-day(a)||b.pay/b.e-a.pay/a.e)[0]||null;}
// строка заказа: 1–2 строки, «Взять» справа; нажатие на строку — подробности листом
const WHY_S={en:()=>L('мало сил','low energy'),cash:()=>L('не хватает денег','not enough money'),no:()=>L('нельзя','unavailable')};
const MO_S=[['янв','Jan'],['фев','Feb'],['мар','Mar'],['апр','Apr'],['май','May'],['июн','Jun'],['июл','Jul'],['авг','Aug'],['сен','Sep'],['окт','Oct'],['ноя','Nov'],['дек','Dec']];
function moTxt(mo){const a=mo.slice().sort((x,y)=>x-y);return a.length===1?T(MO_S[a[0]]):T(MO_S[a[0]])+'–'+T(MO_S[a[a.length-1]]);}
function gigRow(W,g,gone){const t=g.t,G=E.GIGS[t],ok=gone?'gone':E.gigCanTake(W,g),left=Math.max(0,g.exp-W.t);
  const why=gone||ok==='ok'||ok==='hand'||ok==='rest'||ok==='out'?'':ok==='req'?gigReq(W,t):(WHY_S[ok]||WHY_S.no)();
  const pay=t==='resale'?`<span style="white-space:nowrap">${M(g.inv)}</span> <span style="white-space:nowrap">→ +${Math.round(g.ret*100)}${L(' %','%')}</span>`:`<span style="white-space:nowrap">${M(g.pay)}</span>`;
  const meta=[`<b class="gp">${pay}</b>`,`<span style="white-space:nowrap">${days(g.days)}</span>`,`⚡${g.e}`];   // цена и срок не рвутся (на 320 px «Перепродажа» была в 3 строки)
  if(!gone&&left<=1)meta.push(`<span class="w">${L('уйдёт завтра','leaves tomorrow')}</span>`);
  if(g.prem)meta.push(`<span class="a">+25 %</span>`);if(!gone&&E.gigHi(W,t))meta.push(`<span class="a">${L('сезон','season')}</span>`);else if(!gone&&G.mo&&G.mo.length<12)meta.push(`<span>🗓 ${esc(moTxt(G.mo))}</span>`);if(E.GIGS[t].ch&&!gone)meta.push(`<span class="a">${L('2 варианта','2 options')}</span>`);
  const btn=gone?`<span class="gst">${gone==='took'?'✓ '+L('взят','taken'):gone==='done'?'✓ '+L('выполнен','done'):L('ушёл','gone')}</span>`
    :t==='resale'?`<button class="btn sm noenter" data-b="gdet" data-id="${g.id}" id="bzTake-${g.id}">${L('Смотреть','View')}</button>`
    :ok==='req'&&reqEq(W,t)?`<button class="btn sm noenter" data-b="eqask" data-k="${reqEq(W,t)}" id="bzTake-${g.id}">${E.EQ[reqEq(W,t)].ico} ${M(E.EQ[reqEq(W,t)].c)}</button>`
    :`<button class="btn sm accent" data-b="gtake" data-id="${g.id}" id="bzTake-${g.id}"${ok==='ok'?'':' disabled'}>${L('Взять','Take')}</button>`;
  return `<div class="gr${gone?' gone':''}" id="bzG-${g.id}"><button class="gi"${gone?' tabindex="-1"':` data-b="gdet" data-id="${g.id}"`}><span class="bz-ic">${G.ico}</span><span class="f1"><b>${esc(gShort(t))}${g.urg?' 🔥':''}</b><small>${meta.join(' · ')}${why?` · <span class="bad">${esc(why)}</span>`:''}</small></span></button>${btn}</div>`;}
// подробности заказа — нижним листом: кто платит, риск, срок; для перепродажи — проверка сделки
function openGig(id){const W=w(),g=W&&W.me&&W.me.board.find(x=>x.id===id);if(!g){hideModal();return;}const t=g.t,G=E.GIGS[t],o=G.ch?(gSel[id]||G.ch[0][0]):'',x=G.ch?E.gigOpt(g,o):g,ok=E.gigCanTake(W,g,o||undefined),left=Math.max(0,g.exp-W.t);
  const opts=G.ch?`<div class="bz-lab" style="margin-top:12px">${L('Как работаем — выберите','How to do it — choose')}</div><div class="bz-gd">`+G.ch.map(c=>`<button class="noenter${c[0]===o?' on':''}" data-b="gopt" data-id="${g.id}" data-o="${c[0]}"><b>${c[0]===o?'● ':'○ '}${esc(opv(c))}</b><small>${esc(optTxt(g,c))}</small></button>`).join('')+'</div>':'';
  const why=ok==='ok'?'':ok==='req'?gigReq(W,t):(WHY_G[ok]||WHY_G.no)();
  const chk=t!=='resale'?'':g.chk?`<div class="bz-note${g.rk>.18?' bad':''}" style="margin-top:6px">🔍 ${esc(dealSay(g))}</div>`:E.dealChkOk(W,g.id)?`<div class="btns">${adL('chk')?`<button class="btn sm noenter" data-b="gchk" data-id="${g.id}">📺 ${L('Людмила проверит сделку — за рекламу','Lyudmila will check the deal — for an ad')}</button>`:''}<button class="btn cr sm noenter" data-b="gchkCr" data-id="${g.id}">🔍 ${L('Проверить','Check')} — 💎 2</button></div>`:'';
  modal(`<div class="bz-hd"><span class="bz-ic lg">${G.ico}</span><div class="f1"><h2 style="text-align:left;margin:0">${esc(gn(t))}${g.urg?' 🔥':''}</h2><small>${esc(T(G.who))}</small></div></div>
    <div class="facts" style="margin-top:12px">${t==='resale'?`<span>${L('Вложить','Invest')}</span><b>${M(g.inv)}</b><span>${L('Вернётся','Returns')}</span><b class="good">~${M(Math.round(g.inv*(1+g.ret)))}</b>`:`<span>${L('На руки','Take-home')}</span><b class="good">${M(x.pay)}</b>`}
      <span>${L('Срок','Takes')}</span><b>${days(x.days)}</b><span>${L('Силы','Energy')}</span><b>⚡ ${x.e} ${L('из ваших','of your')} ${Math.round(W.me.en)}</b><span>${L('Ждёт на доске','Waits on the board')}</span><b>${days(left)}</b></div>
    <p class="bz-risk${W.me.en<30?' bad':''}">${esc((G_RISK[t]||(()=>''))(g))}${W.me.en<30?' · '+L('сил мало — риск ×2','low energy — risk ×2'):''}${E.lvl(W,t)>=8?' · '+L('опыт ур. 8+: риск вдвое ниже','lv 8+ experience: half the risk'):''}</p>${opts}${chk}
    <div class="row"><button class="btn accent${t==='resale'?' noenter':''}" id="bzGT"${ok==='ok'?'':' disabled'}>${ok==='ok'?(t==='resale'?L('Вложить ','Invest ')+M(g.inv):L('Взять заказ','Take the job')):esc(why)}</button><button class="btn" id="bzGN" data-esc>${L('Закрыть','Close')}</button></div>`);
  try{modalRe=()=>openGig(id);}catch(e){}
  $$('bzGN').onclick=()=>{snd('tap');hideModal();};$$('bzGT').onclick=()=>{hideModal();takeGig(id,o||undefined);};}
function takeGig(id,o){const W=w(),g=W.me.board.find(x=>x.id===id);const r=o?act('gigTake',id,o):act('gigTake',id);
  if(r==='ok'){delete gSel[id];snd('coin');buzz(15);toast(L('Взято: ','Taken: ')+low(gShort(g?g.t:''))+L(' — готово через ',' — done in ')+days(g?g.days:1),2200);}return r;}
const EQ_WHY={bike:()=>L('курьер на велосипеде: 3 700 вместо 3 100 за смену — окупится за ~30 смен','bicycle courier: 3,700 instead of 3,100 a shift — pays back in ~30 shifts'),
  laptop:()=>L('статьи пишутся за 2 дня вместо 3','articles take 2 days instead of 3'),tool:()=>L('открывает заказы «Мастер на час» — 4 500 за день','unlocks handyman jobs — 4,500 a day'),
  car:()=>L('такси на своей машине: 5 000 вместо 2 700 за смену; курьер — 5 000','taxi in your own car: 5,000 instead of 2,700 a shift; courier — 5,000'),
  camera:()=>L('открывает фотосъёмки — 6 000 за 2 дня','unlocks photo shoots — 6,000 for 2 days')};
function eqRow(W,k){const q=E.EQ[k],has=W.me.eq[k];
  return `<div class="bz-li" id="bzEq-${k}"><span class="bz-ic">${q.ico}</span><span class="f1"><b>${esc(L(q.n,q.en))}</b><small>${esc(EQ_WHY[k]?EQ_WHY[k]():'')}</small></span>${has?`<span class="v good">✓ ${L('есть','owned')}</span>`:`<button class="btn sm noenter" data-b="eq" data-k="${k}"${W.cash<q.c?' disabled':''}>${M(q.c)}</button>`}</div>`;}

/* ================= «Бизнес»: список, каталог, точка ================= */
function rBiz(el){const W=w();if(V.biz==='pt'){const b=W.biz.find(x=>x.id===V.id);if(b){el.innerHTML=ptView(W,b);return;}V.biz='list';}
  if(V.biz==='cat'){el.innerHTML=catView(W);return;}
  const pts=W.biz.filter(b=>!isPit(b.t)&&!isMid(b.t));let h='';let s=0,n=0;for(const b of pts){const p=lastPm(b);if(p!=null){s+=p;n++;}}
  h+=`<div class="bz-top"><div class="bz-sub">${pts.length} ${pl(pts.length,'точка','точки','точек','outlet','outlets')}${n?' · '+L('прибыль за месяц ','profit last month ')+money0(s):''}</div><div class="bz-h1">${L('Своё дело','My business')}</div></div>`;
  if(W.ned)h+=`<div class="bz-back"><button class="back" data-b="tab" data-t="obj">← ${L('Объекты','Assets')}</button></div>`;
  if(!W.ip&&!W.ned){h+=`<div class="card"><b>📄 ${L('Сначала — ИП','First — sole-trader status')}</b><p class="bz-note">${L('Перепродавать товар самозанятым нельзя. ИП оформляется бесплатно за 3 дня; налог — на выбор: 6 % с выручки или 15 % с прибыли.','The self-employed can’t resell goods. Registration is free and takes 3 days; the tax is your choice: 6% of revenue or 15% of profit.')}</p>${W.reg?`<div class="tip">📄 ${L('Оформляется: ещё ','In progress: ')+days(Math.max(1,W.reg.t-W.t))+L('',' left')}</div>`:`<button class="btn accent w noenter" data-b="ip" style="margin-top:10px">${L('Оформить ИП','Register')}</button>`}</div>`;}
  if(pts.length)h+=`<div class="card bz-list">`+pts.map(b=>ptRow(W,b)).join('')+'</div>';
  else h+=`<div class="card mut">${L(`Пока ни одной точки. Первое дело — кофейный автомат: ${M(E.BIZ.vend.cap)}, руки не занимает.`,`No outlets yet. The first business is a coffee vending machine: ${M(E.BIZ.vend.cap)} and it needs no hands.`)}</div>`;
  if(!W.ned)h+=`<button class="btn accent w" data-b="bnew" id="bzNew" style="margin:4px 0 14px">＋ ${L('Открыть новое дело','Open a new business')}</button>`;
  h+=`<p class="bz-note" style="margin:0 4px">${L('Точка без управляющего занимает руку ✋ и приносит больше (хозяйский глаз); пока вас нет — на 10 % меньше. Управляющий освобождает руку и берёт 30 % прибыли точки.','An outlet without a manager takes a hand ✋ and earns more (the owner’s eye); while you’re away — 10% less. A manager frees the hand and takes 30% of the outlet’s profit.')}</p>`;
  if(!W.ned)h+=(window.OWNUI?OWNUI.bizCards(W):'');   // M17: маркетинг города
  el.innerHTML=h;}
function ptRow(W,b){const p=lastPm(b);return `<button class="bz-li" data-b="bpt" data-id="${b.id}"><span class="bz-ic">${bico(b.t)}${bizDot(W,b)?'<i></i>':''}</span><span class="f1"><b>${esc(bn(b.t))}</b><small>${esc(bizState(W,b))}</small></span><span class="v ${p==null?'':p>=0?'good':'bad'}">${b.st==='w'&&p!=null?money0(p):'—'}<small>${b.st==='w'&&p!=null?L('за месяц','a month'):''}</small></span></button>`;}
const NEED_WHY={stage:()=>L('откроется в следующей главе','unlocks in the next chapter'),ip:()=>L('нужно ИП','needs sole-trader status'),max:()=>L('в городе уже максимум','city limit reached'),city:()=>L('нет представительства в городе','no office in this city'),no:()=>L('недоступно','unavailable')};
function needTxt(W,t,r){const B=E.BIZ[t],n=B.need||{};
  if(r==='have')return L('сначала откройте «','first open the “')+bn(n.have)+L('»','”')+(n.or?L(' или капитал от ',' or equity from ')+M(n.or):'');
  if(r==='cap')return L('откроется с капиталом ','unlocks at equity ')+M(n.cap);
  if(r==='cash')return L('не хватает ','short by ')+M(B.cap-W.cash);
  return (NEED_WHY[r]||NEED_WHY.no)();}
function catRow(W,t,c){const B=E.BIZ[t],r=E.bizCan(W,t,c),f=E.bizForecast(W,t),lock=r!=='ok'&&r!=='cash'&&r!=='ip';
  const hand=!B.hand?L('без рук','no hands'):B.hand<1?L('½ руки','½ hand'):L('1 рука','1 hand');
  const sat=window.OWNUI?OWNUI.catLine(W,t,c):'';   // M17: насыщение рынка
  const line=`${L('вложения','invest')} ${M(B.cap)} · ${L('прибыль','profit')} ~${Mr(f.prof)}${L('/мес','/mo')}${f.prof>0?' · '+L('окупится за ~','pays back in ~')+mons(Math.ceil(f.pay)):''} · ${hand}${sat?' · '+sat:''}`;
  return `<button class="bz-li${lock?' lock':''}" data-b="bcat" data-t="${t}" id="bzCat-${t}"><span class="bz-ic">${bico(t)}</span><span class="f1"><b>${esc(bn(t))}</b><small>${esc(line)}</small>${r!=='ok'?`<small style="color:${lock?'var(--muted)':'var(--warn)'}">${lock?'🔒 ':''}${esc(needTxt(W,t,r))}</small>`:''}</span><span class="chev">›</span></button>`;}
function catView(W){const c=V.city||W.home||'kuz';let h=`<div class="bz-back"><button class="back" data-b="bback">← ${L('Мои точки','My outlets')}</button></div>
  <div class="bz-top"><div class="bz-sub">${L('Прогноз Людмилы — при средних условиях','Lyudmila’s forecast — under average conditions')}</div><div class="bz-h1">${L('Открыть дело','Open a business')}</div></div>`;
  if(W.cities.length>1)h+=`<div class="pick">${W.cities.map(x=>`<button data-b="bcity" data-c="${x}" class="${x===c?'on':''}">${esc(cityN(x))}</button>`).join('')}</div>`;
  const ts=E.SMALL.slice().sort((a,b)=>{const ra=E.bizCan(W,a,c),rb=E.bizCan(W,b,c),ka=ra==='ok'?0:ra==='cash'||ra==='ip'?1:2,kb=rb==='ok'?0:rb==='cash'||rb==='ip'?1:2;return ka-kb||E.BIZ[a].cap-E.BIZ[b].cap;});
  // закрытые дела: 3 ближайших, остальные — свёрнуты (аудит M3: в главе 1 было 20+ карточек почти все 🔒)
  const opn=ts.filter(t=>{const r=E.bizCan(W,t,c);return r==='ok'||r==='cash'||r==='ip';}),lk=ts.filter(t=>opn.indexOf(t)<0),nl=V.catAll?lk.length:Math.min(3,lk.length);
  h+=`<div class="card bz-list">`+opn.concat(lk.slice(0,nl)).map(t=>catRow(W,t,c)).join('')+'</div>';
  if(lk.length>nl)h+=`<button class="btn w noenter" data-b="bcatall" style="margin:4px 0 14px">🔒 ${L(`Ещё ${lk.length-nl} ${pl(lk.length-nl,'дело','дела','дел','business','businesses')} — откроются позже`,`${lk.length-nl} more ${pl(lk.length-nl,'дело','дела','дел','business','businesses')} — unlock later`)} ›</button>`;
  else if(V.catAll&&lk.length>3)h+=`<button class="btn w noenter" data-b="bcatall" style="margin:4px 0 14px">${L('Свернуть закрытые','Collapse locked')}</button>`;
  return h;}
// окно открытия дела
function openBizModal(t,c){const W=w(),B=E.BIZ[t];if(!B)return;c=c||V.city||W.home||'kuz';const r=E.bizCan(W,t,c),f=E.bizForecast(W,t),H=E.hands(W);
  const needMgr=B.hand&&H.free<B.hand&&!W.opd[t];
  let h=`<div class="bz-hd"><span class="bz-ic lg">${bico(t)}</span><div class="f1"><h2>${esc(bn(t))}</h2><small>${esc(cityN(c))}</small></div></div>
    <div class="facts" style="margin-top:12px"><span>${L('Вложения','Investment')}</span><b>${M(B.cap)}</b><span>${L('Откроется через','Opens in')}</span><b>${days(B.days)}</b>
    <span>${L('Выручка','Revenue')}</span><b>~${Mr(f.rev)}${L('/мес','/mo')}</b><span>${L('Расходы','Costs')}</span><b>~${Mr(f.vc+f.f+f.risk)}${L('/мес','/mo')}</b>
    <span>${L('Прибыль','Profit')}</span><b class="${f.prof>=0?'good':'bad'}">~${Mr(f.prof)}${L('/мес','/mo')}</b>${f.prof>0?`<span>${L('Окупаемость','Payback')}</span><b>~${mons(Math.ceil(f.pay))}</b>`:''}
    <span>${L('Руки','Hands')}</span><b>${!B.hand?L('не занимает','none'):B.hand<1?L('полруки','half a hand'):L('одна рука ✋','one hand ✋')}</b></div>
    ${window.OWNUI?OWNUI.passport(W,t,c):''}<p class="bz-note">${KNOB_TIP[t]?esc(KNOB_TIP[t]())+' '+L('Это настроите после открытия — в карточке точки.','You’ll set this after opening — on the outlet card.'):''}</p>`+(t==='vend'&&E.vendOps&&E.vendOps(W,1)>E.vendOps(W)?`<div class="tip">🧰 ${L(`С этим автоматом понадобится оператор: +${M(E.VEND_OP)} в месяц на 10 автоматов.`,`With this machine you’ll need an operator: +${M(E.VEND_OP)} a month per 10 machines.`)}</div>`:'');
  // M17: управляющий — 30 % прибыли точки (прогноз с ним — той же формулой, что в модели)
  const pm=B.mw?E.bizForecast(W,{t,c,rt:3.5,k:E.defKnob(t),mgr:1,wm:3,ev:{},lv:1}).prof:f.prof;
  if(needMgr&&B.mw)h+=`<div class="tip${pm<0?' bad':''}">✋ ${L(`Свободных рук нет — точка откроется сразу с управляющим: он берёт 30 % прибыли, вам останется ~${Mr(pm)} в месяц.`,`No free hands — the outlet opens with a manager: he takes 30% of the profit, you keep ~${Mr(pm)} a month.`)}${pm<0?' '+L('С управляющим она в минусе. Сначала освободите руку: закончите заказ, уволитесь со склада или поставьте управляющего в точку побольше.','With a manager it loses money. Free a hand first: finish an order, quit the warehouse, or put a manager into a bigger outlet.'):''}</div>`;
  // запас на жизнь: после покупки должно остаться ~1,5 месяца обязательных расходов (иначе — овердрафт в конце месяца)
  let wait=false;if(r==='ok'&&!W.ooo&&!W.ned){const left=W.cash-B.cap,res=E.bizRes(W);if(left<res){wait=true;
    h+=`<div class="tip bad">⚠️ ${L(`После покупки останется ${M(left)}, а в конце месяца платить за жизнь и взносы ~${M(Math.round(res/1.5/1000)*1000)}. Людмила советует накопить ещё ${M(res-left)} — иначе овердрафт и плохая кредитная история.`,`After buying you’ll have ${M(left)} left, but living costs and contributions at month end are ~${M(Math.round(res/1.5/1000)*1000)}. Lyudmila advises saving another ${M(res-left)} — otherwise an overdraft and a bad credit history.`)}</div>`;}}
  let btn='';
  if(r==='ok')btn=`<button class="btn ${wait?'':'green '}noenter" id="bzOpen">${L('Открыть за ','Open for ')+M(B.cap)}</button>${!needMgr&&B.hand&&B.mw?`<button class="btn noenter" id="bzOpenM">${L('Открыть сразу с управляющим','Open with a manager')} <small class="${pm<0?'bad':''}">${L('30 % прибыли · вам ~','30% of profit · you keep ~')+Mr(pm)}</small></button>`:''}`;
  else if(r==='ip')btn=W.reg?`<div class="tip">📄 ${L('ИП оформляется: ещё ','Registration: ')+days(Math.max(1,W.reg.t-W.t))+L('. Потом можно открывать.',' left. Then you can open.')}</div>`:`<div class="tip">📄 ${L('Нужно ИП: бесплатно, 3 дня.','You need sole-trader status: free, 3 days.')}</div><button class="btn green noenter" id="bzIP2">${L('Оформить ИП','Register as a sole trader')}</button>`;
  else{const nt=needTxt(W,t,r);h+=`<div class="tip">🔒 ${esc(nt.charAt(0).toUpperCase()+nt.slice(1))}</div>`;}
  modal(h+`<div class="row">${btn}<button class="btn${wait?' green':''}" id="bzNo" data-esc>${wait?L('Подожду','I’ll wait'):L('Закрыть','Close')}</button></div>`);
  try{modalRe=()=>openBizModal(t,c);}catch(e){}
  $$('bzNo').onclick=()=>{snd('tap');hideModal();};
  const go=mgr=>{hideModal();const x=act('bizOpen',t,{c,mgr});if(x==='ok'){snd('build');const b=w().biz[w().biz.length-1];toast(L('Открываем: ','Opening: ')+low(bn(t))+L(' — через ',' — in ')+days(B.days));V.biz='pt';V.id=b.id;V.from=isMid(t)?'net':'biz';UI.go(isMid(t)?'net':'biz');
    // отклик на покупку: деньги уходят из счётчика, карточка новой точки «вспыхивает»
    try{const c0=$$('hCash');if(c0)UI.pulse(c0);const el=$$('scr-'+(isMid(t)?'net':'biz'));const cd=el&&el.querySelector('.card');if(cd&&!calm()){cd.classList.remove('newrow');void cd.offsetWidth;cd.classList.add('newrow');}}catch(x){}}};
  if($$('bzOpen'))$$('bzOpen').onclick=()=>go(false);if($$('bzOpenM'))$$('bzOpenM').onclick=()=>go(true);
  if($$('bzIP2'))$$('bzIP2').onclick=()=>{hideModal();doIP();};}
const KNOB_TIP={vend:()=>L('Главное — место: дорогое не всегда лучше. На вокзале выручка выше, но бывает вандализм.','Location is everything: pricier isn’t always better. The station earns more but suffers vandalism.'),
  kiosk:()=>L('Главное — ассортимент и наценка: выше наценка — меньше покупателей.','It’s all about range and mark-up: a higher mark-up means fewer customers.'),
  shaw:()=>L('Главное — запас мяса: мало — упущенные продажи, много — списания.','It’s all about meat stock: too little loses sales, too much gets thrown out.'),
  flow:()=>L('Главное — закупка к праздникам: 14 февраля, 8 Марта, 1 сентября, Новый год. Угадали — прибыль, перебрали — порча.','It’s all about holiday stock: Feb 14, Mar 8, Sep 1, New Year. Guess right — profit; overbuy — waste.'),
  pvz:()=>L('Доход — процент от выданного. Выбираете, чей пункт: ставка против оборота и штрафов.','Income is a share of parcels handed out. You choose whose point: rate vs volume and fines.'),
  coffee:()=>L('Главное — место: у метро людно, но дорого; в бизнес-центре пусто по выходным.','Location is key: by the metro it’s busy but pricey; the business centre is empty at weekends.'),
  wash:()=>L('Главное — цена минуты: дёшево — очереди, дорого — пусто. Зимой мойка почти стоит.','It’s all about the price per minute: cheap means queues, dear means empty. In winter it barely works.'),
  tire:()=>L('Сезон — апрель-май и октябрь-ноябрь. Можно закупить шины к сезону: деньги заморожены, но наценка 25 %.','Seasons are April–May and October–November. Stock tyres for the season: money is tied up but the mark-up is 25%.'),
  sto:()=>L('Главное — процент мастерам: меньше — уходят и уводят клиентов, больше — выше качество.','It’s all about the mechanics’ share: less and they leave with clients, more and quality rises.'),
  gazel:()=>L('Где брать заказы: агрегатор даёт загрузку за комиссию; свои клиенты растут полгода, зато без комиссии.','Where to get orders: an app gives volume for a commission; own clients take half a year to grow but pay no fee.'),
  whs:()=>L('Опт: больше отсрочка покупателям — больше продаж, но деньги приходят позже и бывают безнадёжные долги.','Wholesale: longer credit to buyers means more sales, but cash comes later and some debts go bad.'),
  base:()=>L('Щебень и песок у чужого карьера с доставкой. Свои самосвалы возят дешевле наёмных.','Gravel and sand from someone else’s quarry, delivered. Your own trucks haul cheaper than hired ones.'),
  truck:()=>L('Самосвал на рынке окупается долго. Выгоднее всего — возить щебень своей стройбазы.','A truck for hire pays back slowly. It pays best hauling your own yard’s gravel.'),
  barber:()=>L('Главное — уровень цен: эконом берёт числом, премиум — рейтингом ⭐ и кофе гостям. Бывает, лучший мастер уходит и уводит клиентов.','It’s all about the price level: budget wins on volume, premium on ⭐ rating and coffee for guests. Sometimes the best barber leaves and takes clients along.'),
  bakery:()=>L('Главное — сколько печь: мало — к обеду пустые полки, много — вечером списания. Иногда ломается печь.','It’s all about how much to bake: too little — empty shelves by lunch, too much — waste in the evening. Sometimes the oven breaks.'),
  canteen:()=>L('Главное — меню и цена обеда. Через 3 месяца можно договориться с заводом: скидка 12 %, зато гостей намного больше. Бывают заказы на банкеты.','It’s all about the menu and the lunch price. After 3 months you can strike a deal with the factory: 12% off, but many more diners. Banquet orders happen too.'),
  hard:()=>L('Главное — ассортимент и запас: деньги лежат на полке, зато покупатель находит всё. Весной и летом берут всё для дачи.','It’s all about range and stock: money sits on the shelf, but customers find everything. In spring and summer garden goods sell.'),
  pharm:()=>L('Главное — уклон: рецептурные лекарства — оборот, витамины и уход — наценка, скидка пенсионерам — очередь. Бывают проверки.','It’s all about the focus: prescription drugs bring turnover, vitamins and care bring mark-up, a pensioner discount brings queues. Inspections happen.'),
  club:()=>L('Главное — часы работы: круглосуточно — больше гостей, но и расходы выше. Зимой людно, летом пусто. Иногда горят компьютеры.','It’s all about opening hours: round the clock means more guests but higher costs. Busy in winter, quiet in summer. Sometimes computers burn out.'),
  clean:()=>L('Главное — как работаем: свой цех, только приёмка или цех с доставкой на дом. Пик — весной и осенью. Бывает, испортят вещь — платим клиенту.','It’s all about the set-up: own workshop, drop-off only, or workshop with home delivery. Peaks in spring and autumn. Sometimes an item gets ruined — we pay the client.'),
  truckf:()=>L('Главное — где стоим: у парка летом людно, у стройки ровно круглый год, на ярмарках выручка выше, но и риск. В дождь торговля хуже.','It’s all about the spot: the park is busy in summer, a building site is steady all year, fairs pay more but are riskier. Rain hurts trade.')};
const KNOB_T={place:['Место','Location'],set:['Ассортимент','Product range'],meat:['Запас мяса','Meat stock'],buy:['Закупка к праздникам','Holiday stock'],mkt:['Чей пункт выдачи','Whose pick-up point'],
  src:['Где брать заказы','Where to get orders'],stock:['Шины к сезону','Tyres for the season'],pct:['Процент мастерам','Mechanics’ share'],def:['Отсрочка покупателям','Credit to buyers'],win:['Зимний запас щебня','Winter gravel stock'],
  san:['Санитария','Hygiene'],cam:['Камеры','Cameras'],bar:['Бариста','Baristas'],mk:['Наценка','Mark-up'],pr:['Цена минуты','Price per minute'],
  lvl:['Уровень цен','Price level'],bake:['Сколько печём','How much we bake'],menu:['Меню','Menu'],deal:['Договор с заводом','Factory deal'],range:['Ассортимент и запас','Range & stock'],
  kind:['Уклон аптеки','Pharmacy focus'],hours:['Часы работы','Opening hours'],mode:['Как работаем','How we work'],spot:['Где стоим','Where we park'],cat:['Чем торгуем оптом','What we sell wholesale']};
// сезон спроса (E.SEA) — коротко для подписи варианта
const SEA_T={ice:['летом больше','more in summer'],hol:['к праздникам больше','more for holidays'],dacha:['весной больше','more in spring'],summer:['летом больше','more in summer'],
  build:['весна–осень','spring to autumn'],club:['зимой больше','more in winter'],clean:['весной и осенью больше','more in spring and autumn'],park:['летом больше','more in summer']};
const EVT={bobrov:['Бобров открыл ларёк напротив — покупателей меньше','Bobrov opened a kiosk opposite — fewer customers'],cut:['Маркетплейс снизил ставку','The marketplace cut its rate'],
  rival:['Рядом открылся конкурент','A competitor opened nearby'],bean:['Зерно подорожало на 20 %','Coffee beans are 20% dearer'],left:['Лучший мастер ушёл к конкуренту','Your best mechanic left for a rival'],
  fleet:['Таксопарк — постоянный клиент: +30 % загрузки','A taxi fleet is a regular client: +30% load'],truck:['Задержка фуры с цветами','The flower truck is delayed'],
  master:['Лучший мастер ушёл — клиентов меньше','Your best barber left — fewer clients'],order:['Заказы на банкеты: +30 %','Banquet orders: +30%'],rain:['Дожди — покупателей меньше','Rainy spell — fewer customers']};
// список вариантов (ассортимент ларька/хозмага, «чем торгуем оптом»): крупные строки с наценкой, запасом, сезоном и прогнозом прибыли на каждый вариант
function gdList(W,b,K){return `<div class="bz-gd">`+K.o.map(o=>{const x=o[3]||{},on=b.k[K.k]===o[0],d=[];let pf=null;
    try{pf=E.bizForecast(W,b,Object.assign({},b.k,{[K.k]:o[0]})).prof;}catch(e){}
    if(x.m0)d.push(L('наценка ','mark-up ')+Math.round(x.m0*100)+L(' %','%'));
    if(x.sd)d.push(L('запас на ','stock for ')+days(x.sd));
    if(x.sp)d.push(L('порча ','spoilage ')+Math.round(x.sp*100)+L(' %','%'));
    if(x.sea&&SEA_T[x.sea]&&opv(o).toLowerCase().indexOf(T(SEA_T[x.sea]))<0)d.push('🗓 '+T(SEA_T[x.sea]));
    return `<button class="noenter${on?' on':''}" data-b="knob" data-k="${K.k}" data-v="${o[0]}">${pf!=null?`<span class="pf ${pf>=0?'good':'bad'}">~${Mr(pf)}${L('/мес','/mo')}</span>`:''}<b>${on?'● ':'○ '}${esc(opv(o))}</b>${d.length?`<small>${esc(d.join(' · '))}</small>`:''}</button>`;}).join('')+'</div>'+
  `<p class="bz-note" style="margin-top:0">${L('Справа — прибыль в месяц в среднем за год, до налога.','On the right — profit a month, yearly average, before tax.')}</p>`;}
function fcCard(W,b,k){const f=E.bizForecast(W,b,k),n=f.now;
  return `<div class="bz-fc" id="bzFc">${L('Прогноз на этот месяц','Forecast for this month')}: ${L('выручка','revenue')} <b>~${Mr(n.rev)}</b>, ${L('прибыль','profit')} <b class="${n.prof>=0?'good':'bad'}">~${Mr(n.prof)}</b>${Math.abs(n.prof-f.prof)>Math.max(3000,Math.abs(f.prof)*.15)?`<br><span class="mut">${L('в среднем за год','yearly average')}: ~${Mr(f.prof)}${L('/мес','/mo')}</span>`:''}<br><span class="mut" style="font-size:14px">${L('до налога и износа','before tax and depreciation')}</span></div>`;}
function vendNote(W,b){if(!E.vendOps)return '';const n=W.biz.filter(x=>x.t==='vend').length,ops=E.vendOps(W),sp=E.satOf?1:b?E.vendSpot(W,b):E.vendSpot(W,{t:'vend',c:W.home||'kuz'});   // M17: «лучшие места» — теперь насыщение рынка (строка «Рынок насыщен» выше)
  return `<p class="bz-note">🧰 ${L(`Автоматов: ${n}. До ${E.VEND_SELF} обслуживаете сами, без рук; дальше нужен оператор — ${M(E.VEND_OP)} в месяц на каждые 10 автоматов`,`Machines: ${n}. Up to ${E.VEND_SELF} you service them yourself, no hands; beyond that you need an operator — ${M(E.VEND_OP)} a month per 10 machines`)}${ops?L(` (сейчас ${ops})`,` (now ${ops})`):''}.${sp<.995?' '+L(`Лучшие места уже заняты: у этого спрос ниже на ${FMT.pct(1-sp)}.`,`The best spots are taken: this one has ${FMT.pct(1-sp)} less demand.`):''}</p>`;}
// «📺 Реклама точки»: +20 % покупателей на 15 дней, раз в игровой месяц на точку
function promoCard(W,b,inner){if(b.st!=='w'||E.SMALL.indexOf(b.t)<0)return '';const on=b.ad>W.t;if(!on&&!adOk())return '';   // inner — только содержимое (M17: строкой в «Маркетинге точки»)
  const pc=Math.round(E.PROMO_K*100);let body;
  if(on)body=`<p class="bz-note" style="color:var(--good)">✓ ${L(`Реклама идёт ещё ${days(b.ad-W.t)}: покупателей больше на ${pc} %.`,`The ad runs ${days(b.ad-W.t)} more: ${pc}% more customers.`)}</p>`;
  else if(E.bizPromoOk(W,b.id)&&adL('promo'))body=`<p class="bz-note">${L(`Листовки, вывеска и объявления в районе: +${pc} % покупателей на ${days(E.PROMO_D)}. Раз в месяц.`,`Flyers, a sign and local listings: +${pc}% customers for ${days(E.PROMO_D)}. Once a month.`)}</p><button class="btn sm w noenter" data-b="promo" data-id="${b.id}" style="margin-top:8px">📺 ${L('Запустить рекламу точки — за рекламу','Run the outlet ad — for an ad')}</button>`;
  else body=`<p class="bz-note">${b.adM===W.m?L('В этом месяце реклама уже была — следующая в новом месяце.','The outlet was advertised this month — next time next month.'):L('На сегодня реклама точек закончилась — загляните завтра.','No more outlet ads today — come back tomorrow.')}</p>`;
  if(inner)return `<div style="padding:6px 0 10px"><b>📺 ${L('Реклама точки за ролик','Outlet ad for a video')}</b>${body}</div>`;
  return `<div class="card"><b>📣 ${L('Реклама точки','Outlet ad')}</b>${body}</div>`;}
// прогноз прибыли с управляющим: строка для карточки точки (красным — если с ним в минусе)
function mgrLine(W,b){const x=E.mgrProf(W,b);if(!x)return '';const bad=x.mgr<0,thin=!bad&&x.mgr<x.dep;
  return `${window.OWNUI?OWNUI.tip('mgr'):''}<p class="bz-note${bad?' bad':''}" style="margin:0 0 10px">📊 ${L('Прибыль в месяц: с управляющим ~','Profit a month: with a manager ~')+Mr(x.mgr)+L(' (он берёт 30 %, не меньше 15 000 ₽, но не больше прибыли), самому ~',' (he takes 30%, at least 15,000 ₽ but never more than the profit), yourself ~')+Mr(x.self)}${bad?'. '+L('С ним точка в минусе — лучше стоять самому или поставить управляющего в точку побольше.','With him the outlet loses money — better run it yourself or put the manager into a bigger outlet.'):thin?'. '+L('С ним точка едва окупает износ.','With him the outlet barely covers depreciation.'):''}</p>`;}
function ptView(W,b){const B=E.BIZ[b.t],from=V.from;let h=`<div class="bz-back"><button class="back" data-b="bback">← ${from==='net'?L('Сеть','Network'):from==='pit'?L('Карьер','Quarry'):from==='today'?L('Сегодня','Today'):L('Мои точки','My outlets')}</button></div>`;
  h+=`<div class="card"><div class="bz-hd"><span class="bz-ic lg">${bico(b.t)}</span><div class="f1"><h2>${esc(bn(b.t))}</h2><small>⭐ ${num(b.rt||0,2)} · ${esc(cityN(b.c))}${b.wm?' · '+L('работает ','open ')+mons(b.wm):''}</small></div></div>`;
  if(b.st==='b'){const tot=b.tot||B.days;h+=`<p class="bz-note">${esc(bizState(W,b))}</p>${prog((tot-b.left)/tot)}`;
    const sp1=E.bizSpeedOk(W,b.id),sp2=adL('open')&&E.bizAdSpeedOk(W,b.id);
    if(sp1||sp2)h+=`<div class="btns">${sp1?`<button class="btn cr sm noenter" data-b="bspd" data-id="${b.id}">💎 ${isPit(b.t)?E.CR_BIZ.pit:E.CR_BIZ.open} — ${isPit(b.t)?L('на 15 дней раньше','15 days sooner'):L('на 5 дней раньше','5 days sooner')}</button>`:''}${sp2?`<button class="btn sm noenter" data-b="bspdAd" data-id="${b.id}">📺 ${L('на 5 дней раньше — за рекламу','5 days sooner — for an ad')}</button>`:''}</div>`;}
  else{if(b.down>0)h+=`<div class="tip">⛔ ${L('Закрыта ещё ','Closed for ')+days(b.down)}</div>`;
    const pm=b.pm||[];h+=`<div class="bz-lab" style="margin-top:12px">${L('Прибыль по месяцам','Profit by month')}${pm.length?' · '+L('последний ','last ')+money0(pm[pm.length-1]):''}</div>`+(pm.length?barsSvg(pm):`<p class="bz-note">${L('Первые цифры — после закрытия месяца. С начала месяца: выручка ','First figures at month end. This month so far: revenue ')+M(b.m.r)}</p>`);
    for(const k in b.ev){const e=b.ev[k];if(e&&e[0]>W.m&&EVT[k])h+=`<div class="tip">📰 ${esc(T(EVT[k]))} — ${L('ещё ','for ')+mons(e[0]-W.m)}</div>`;}
    if(b.stk>0)h+=`<p class="bz-note">📦 ${L('Товар на полке: ','Stock on the shelf: ')+M(b.stk)} — ${L('это не расход, а запас','not a cost but stock')}</p>`;}
  h+='</div>'+(window.OWNUI?'':promoCard(W,b));   // M17: реклама за ролик — строкой в «Маркетинге точки» (js/owner-ui.js)
  // главная ручка
  if(B.knob||B.sl){h+=`<div class="card bz-knob">`;
    if(B.knob){h+=`<b>${T(KNOB_T[B.knob.k])}</b>`+(B.knob.list?gdList(W,b,B.knob):`<div class="pick">`+B.knob.o.map(o=>`<button data-b="knob" data-k="${B.knob.k}" data-v="${o[0]}" class="noenter${b.k[B.knob.k]===o[0]?' on':''}">${esc(opv(o))}</button>`).join('')+'</div>');
      if(b.t==='coffee'&&b.st==='w')h+=`<p class="bz-note">${L('Переезд на новое место — 50 000 ₽.','Moving to a new spot costs 50,000 ₽.')}</p>`;}
    if(B.sl){const v=b.k[B.sl.k]!=null?b.k[B.sl.k]:B.sl.def;h+=`<div class="bz-kv" style="margin-top:${B.knob?10:0}px"><span>${T(KNOB_T[B.sl.k])}</span><b id="bzSlV">${B.sl.k==='mk'?v+L(' %','%'):v+' ₽'}</b></div><input type="range" id="bzSl" data-id="${b.id}" data-k="${B.sl.k}" min="${B.sl.min}" max="${B.sl.max}" step="1" value="${v}" aria-label="${esc(T(KNOB_T[B.sl.k]))}">`;}
    h+=fcCard(W,b)+`<p class="bz-note">${esc(KNOB_TIP[b.t]?KNOB_TIP[b.t]():'')}</p>`+(b.t==='vend'?vendNote(W,b):'');
    if(B.k2){h+=`<b style="display:block;margin-top:14px">${T(KNOB_T[B.k2.k])}</b>`;
      if((b.wm||0)>=3)h+=`<div class="pick">`+B.k2.o.map(o=>`<button data-b="knob" data-k="${B.k2.k}" data-v="${o[0]}" class="noenter${b.k[B.k2.k]===o[0]?' on':''}">${esc(opv(o))}</button>`).join('')+'</div>';
      else h+=`<p class="bz-note">🔒 ${L('Откроется после 3 месяцев работы — ещё ','Unlocks after 3 months of work — ')+mons(3-(b.wm||0))+L('',' to go')}</p>`;}
    if(B.gd)h+=`<b style="display:block;margin-top:14px">${T(KNOB_T[B.gd.k])}</b>`+gdList(W,b,B.gd)+`<p class="bz-note">${L('Менять можно когда угодно: запас подстроится со следующей закупки.','You can switch any time: stock adjusts from the next purchase.')}</p>`;
    h+='</div>';}
  else if(!isPit(b.t))h+=`<div class="card">${fcCard(W,b)}<p class="bz-note">${esc(KNOB_TIP[b.t]?KNOB_TIP[b.t]():'')}</p></div>`;
  if(window.OWNUI)h+=OWNUI.ptCards(W,b,promoCard(W,b,true));   // M17: рынок, уровни, маркетинг, обучение — после главной настройки
  // управление
  let rows='';
  if(W.opd[b.t])rows+=`<div class="bz-li"><span class="bz-ic">👔</span><span class="f1"><b>${L('Сетью управляет опердиректор','An ops director runs the network')}</b><small>${L('управляющие точек не нужны','outlets need no managers')}</small></span></div>`;
  else if(B.mw){if(b.mgr){rows+=`<div class="bz-li"><span class="bz-ic">👔</span><span class="f1"><b>${L('Управляющий','Manager')} · ${b.mp?M(b.mp)+L(' за прошлый месяц',' last month'):L('30 % прибыли','30% of profit')}</b><small>${L('рука свободна; держит настройки, хитрых решений не принимает','your hand is free; keeps the settings, no clever decisions')}</small></span><button class="btn sm noenter" data-b="mgr" data-id="${b.id}" data-v="0">${L('Встать самому','Run it myself')}</button></div>`+mgrLine(W,b);
      rows+=`<div class="bz-li"><span class="bz-ic">🔍</span><span class="f1"><b>${L('Ревизия Людмилы','Lyudmila’s audit')}</b><small>${L('проверит, не тает ли выручка','checks whether takings go missing')}${b.aud!=null?' · '+L('была в ','last in ')+FMT.mon(b.aud):''}</small></span><span style="display:flex;flex-direction:column"><button class="btn sm noenter" data-b="audit" data-id="${b.id}">${M(E.AUDIT)}</button>${adL('audit')?`<button class="btn sm noenter" data-b="auditAd" data-id="${b.id}" style="margin-top:6px">📺 ${L('за рекламу','for an ad')}</button>`:''}</span></div>`;}
    else rows+=`<div class="bz-li"><span class="bz-ic">✋</span><span class="f1"><b>${B.hand?L('Вы стоите сами','You run it yourself'):L('Без управляющего','No manager')}</b><small>${B.hand?L('+5 % «хозяйский глаз», но занята рука','+5% “owner’s eye”, but a hand is busy'):''}</small></span><button class="btn sm noenter" data-b="mgr" data-id="${b.id}" data-v="1" id="bzMgr">${L('Нанять','Hire')} · 30 %</button></div>`+(b.st==='w'?mgrLine(W,b):'');}
  rows+=(window.OWNUI?OWNUI.ptRows(W,b):'');   // M17: проверка точки, встать за прилавок
  if(!(isPit(b.t)&&W.st==='quarry'&&W.biz.filter(x=>isPit(x.t)).length<=1))rows+=`<div class="bz-li"><span class="bz-ic">🤝</span><span class="f1"><b>${L('Продать','Sell')}</b><small>${L('покупатель даст ~','a buyer offers ~')+M(E.bizSellPrice(W,b))}</small></span><button class="btn sm noenter" data-b="sell" data-id="${b.id}">${L('Продать','Sell')}</button></div>`;
  if(rows)h+=`<div class="card bz-list">${rows}</div>`;
  return h;}

/* ================= «Сеть» ================= */
function rNet(el){const W=w();if(V.biz==='pt'&&V.from==='net'){const b=W.biz.find(x=>x.id===V.id);if(b){el.innerHTML=ptView(W,b);return;}V.biz='list';}
  let h=`<div class="bz-top"><div class="bz-sub">${esc(statusLine(W))}</div><div class="bz-h1">${L('Сеть','Network')}</div></div>`;
  // сети по типам
  const ts=E.SMALL.filter(t=>E.chainN(W,t)>0);
  h+=`<div class="bz-sec">${L('Сети точек','Chains')}</div><div class="card bz-list">`+(ts.length?ts.map(t=>{const n=E.chainN(W,t),d=E.chainDisc(W,t),od=!!W.opd[t];
    return `<div class="bz-li" style="flex-wrap:wrap"><span class="bz-ic">${bico(t)}</span><span class="f1"><b>${esc(bn(t))} · ${n}</b><small>${n>=3?L('скидка на закупку ','purchase discount ')+FMT.pct(d):L('сеть — от 3 точек','a chain starts at 3 outlets')}${od?' · '+L('опердиректор','ops director'):''}</small></span>${n>=3&&W.ooo&&(E.BIZ[t].hand||od)?`<button class="btn sm noenter" data-b="opd" data-t="${t}" style="flex:1 0 100%;margin:8px 0 0 58px;max-width:calc(100% - 58px)">${od?L('Уволить директора','Dismiss director'):L('Опердиректор','Ops director')}</button>`:''}</div>`;}).join(''):`<div class="bz-li"><span class="f1"><small>${L('Пока нет точек','No outlets yet')}</small></span></div>`)+
    `</div><p class="bz-note" style="margin:0 4px">${L(`Операционный директор — ${M(E.OPD_WAGE||150000)} в месяц: одна ваша рука на всю сеть, управляющие точек не нужны.`,`An operations director costs ${M(E.OPD_WAGE||150000)} a month: one of your hands for the whole chain, no outlet managers needed.`)}</p>`;
  // склад, стройбаза, самосвалы
  h+=`<div class="bz-sec">${L('Опт, стройматериалы, транспорт','Wholesale, building materials, transport')}</div><div class="card bz-list">`;
  for(const b of W.biz.filter(x=>isMid(x.t)))h+=ptRow(W,b).replace('data-b="bpt"','data-b="bpt" data-from="net"');
  for(const t of E.MID)h+=catRow(W,t,W.home||'kuz');
  h+='</div>';
  const rec=W.rec.reduce((a,x)=>a+x.a,0);
  if(rec>0)h+=`<div class="card"><b>🧾 ${L('Покупатели должны: ','Receivables: ')+M(rec)}</b><p class="bz-note">${L('Прибыль уже в отчёте, а денег ещё нет. Факторинг: получить всё сразу за 3 % — ','The profit is booked but the cash isn’t in yet. Factoring: get it all now for 3% — ')+M(Math.round(rec*.03))}.</p><button class="btn w noenter" data-b="factor" style="margin-top:10px">${L('Получить деньги сейчас','Get the cash now')}</button></div>`;
  if(W.bobr)h+=`<div class="card"><b>⛰ ${L('Бобров поднял цену щебня','Bobrov raised the gravel price')}</b><p class="bz-note">${L('Карьер-поставщик — Боброва. Мы платим ему по 1 300 ₽ за тонну и больше, а свой карьер добывал бы по 450–650. Пора в «Карьер».','The supplying quarry is Bobrov’s. We pay him 1,300 ₽ a tonne and up; our own quarry would mine at 450–650. Time for the Quarry chapter.')}</p></div>`;
  // города
  const cs=Object.keys(E.CITY);h+=`<div class="bz-sec">${L('Города','Cities')}</div><div class="card bz-list">`+cs.map(c=>{const has=W.cities.indexOf(c)>=0;
    return `<div class="bz-li"><span class="bz-ic">🏙</span><span class="f1"><b>${esc(cityN(c))}</b><small>${has?(c===(W.home||'kuz')?L('родной город','home town'):L('представительство открыто','office open')):L('аренда ×','rent ×')+num(E.CITY[c].rent,2)+' · '+L('спрос ×','demand ×')+num(E.CITY[c].dem,2)}</small></span>${has?'<span class="v good">✓</span>':`<button class="btn sm noenter" data-b="city" data-c="${c}"${W.ooo?'':' disabled'}>${L('Открыть','Open')} · ${M(1e6)}</button>`}</div>`;}).join('')+'</div>';
  if(W.st==='mid'){const eq=E.equity(W),has=W.biz.some(b=>b.t==='base')||W.biz.filter(b=>b.t==='truck').length>=2;
    h+=`<div class="card"><b>⛏ ${L('Следующая глава — «Карьер»','Next chapter — Quarry')}</b><div class="bz-ck">${ck(eq>=Q_EQ(),L('Капитал от ','Equity from ')+M(Q_EQ())+L(' — сейчас ',' — now ')+M(eq))}${ck(has,L('Свой сбыт щебня: стройбаза или 2 самосвала','Your own gravel sales: a builders’ yard or 2 trucks'))}${ck(W.ch>=50,L('Кредитная история «хорошая» — сейчас «','Credit history “good” — now “')+chW(W.ch)+L('»','”'))}</div></div>`;}
  el.innerHTML=h;}

/* ================= «Карьер» ================= */
const PG={sand:['песок','sand'],grav:['щебень','gravel']};
function rivN(id){if(id==='you')return L('вы','you');const r=E.RIVALS.find(x=>x.id===id);return r?L(r.n,r.en):L('соперник','a rival');}
function rPit(el){const W=w();if(V.biz==='pt'&&V.from==='pit'){const b=W.biz.find(x=>x.id===V.id);if(b){el.innerHTML=ptView(W,b);return;}V.biz='list';}
  let h=`<div class="bz-top"><div class="bz-sub">${L('Перечень участков ОПИ · ','Local mineral plots · ')+cityN(W.home||'kuz')}</div><div class="bz-h1">${L('Карьер','Quarry')}</div></div>`;
  const pits=W.biz.filter(b=>isPit(b.t));
  if(pits.length){h+=`<div class="bz-sec">${L('Ваши карьеры','Your quarries')}</div><div class="card bz-list">`+pits.map(b=>{const B=E.BIZ[b.t],p=lastPm(b);
      return `<button class="bz-li" data-b="bpt" data-id="${b.id}" data-from="pit"><span class="bz-ic">${bico(b.t)}${b.halt?'<i></i>':''}</span><span class="f1"><b>${esc(bn(b.t))}</b><small>${b.st==='b'?esc(bizState(W,b)):L(`${num(B.q/1000,0)} тыс. т в месяц · себестоимость ${B.vc} ₽/т`,`${num(B.q/1000,0)}k t a month · cost ${B.vc} ₽/t`)}</small>${b.st==='b'?prog(((b.tot||B.days)-b.left)/(b.tot||B.days)):''}</span><span class="v ${p==null?'':p>=0?'good':'bad'}">${p!=null?money0(p):'—'}</span></button>`;}).join('')+'</div>';}
  if(pits.some(b=>b.halt)){let mx=0;try{mx=E.loanOffer(W).max;}catch(x){}
    h+=`<div class="tip bad">🏗 ${L('Стройка карьера стоит — не хватает денег.','Quarry construction has stopped — not enough money.')}${mx>0?' '+L(`Банк даст до ${M(mx)}.`,`The bank will lend up to ${M(mx)}.`):''}<button class="btn sm w noenter" data-b="tab" data-t="fin" style="margin-top:8px">🏦 ${L('В банк','To the bank')}</button></div>`;}
  h+=`<div class="bz-sec">${L('Участки','Plots')}</div>`;
  if(!W.opi.length)h+=`<div class="card mut">${L('Перечень участков откроется в главе «Карьер».','The plot list opens in the Quarry chapter.')}</div>`;
  for(const p of W.opi)h+=opiCard(W,p);
  h+=`<p class="bz-note" style="margin:0 4px 14px">${L('Совет Людмилы: лицензия ОПИ окупается, если заплатить не больше четверти оценки участка. Проиграли — следующий участок через 3–6 месяцев.','Lyudmila’s tip: a local licence pays off if you pay no more than a quarter of the plot’s estimate. Lost — the next plot comes in 3–6 months.')}</p>`;
  if(W.st==='quarry'){const q=E.nedraReq(W);
    h+=`<div class="card"><b>🏔 ${L('Следующая глава — «Недра»','Next chapter — Mining')}</b><div class="bz-ck">${ck(q.eq,L('Капитал от ','Equity from ')+M(N_EQ())+L(' — сейчас ',' — now ')+M(q.eqv))}${ck(q.pit,L('Карьер работает 6 месяцев','A quarry has worked 6 months'))}${ck(q.od,L('Полгода без просрочек и овердрафта','Six months without overdraft'))}</div>${E.nedraOk(W)?`<button class="btn accent w noenter" data-b="nedra" id="bzNedra">${L('Перейти в недра','Go to mining')}</button>`:''}</div>`;}
  el.innerHTML=h;}
function opiCard(W,p){const g=T(PG[p.g]),nm=T(p.nm),fair=Math.round(p.V*E.OPI_ADV);let h=`<div class="card" id="bzO-${p.id}"><div class="bz-hd"><span class="bz-ic">${p.g==='sand'?'⛏':'⛰'}</span><div class="f1"><b style="font-size:19px">«${esc(nm)}» · ${esc(g)}</b><br><small>${L('до города ','to town ')+p.km+L(' км',' km')} · ${L('оценка ','estimate ')+M(p.V)}</small></div></div>`;
  if(p.st==='list'){const d=p.day-W.t;h+=`<p class="bz-note">${W.st!=='quarry'?L('Торги — в главе «Карьер».','Auctions come in the Quarry chapter.'):d>0?L('Торги через ','Auction in ')+days(d):L('Торги скоро — ждём очереди','Auction soon — waiting its turn')} · ${L('старт ','start ')+M(p.start)}</p>`;}
  else if(p.st==='auc'){const nx=p.lead?p.pr+p.step:p.pr,me=p.lead==='you';
    h+=`<div class="facts" style="margin-top:10px"><span>${L('Цена','Price')}</span><b>${M(p.pr)}</b><span>${L('Лидер','Leader')}</span><b class="${me?'good':''}">${p.lead?esc(rivN(p.lead)):L('пока никто','nobody yet')}</b><span>${L('Итог через','Ends in')}</span><b>${days(Math.max(0,p.end-W.t))}</b><span>${L('Разумный предел','Sensible limit')}</span><b>${M(fair)}</b></div>
      <div class="btns">${me||nx>fair?'':`<button class="btn accent noenter" data-b="oauto" data-id="${p.id}"${W.cash<nx?' disabled':''}>🔨 ${L('Торговаться до ','Bid up to ')+M(Math.min(fair,W.cash))}</button>`}${me?'':`<button class="btn noenter" data-b="obid" data-id="${p.id}"${W.cash<nx?' disabled':''}>${L('Одна ставка: ','One bid: ')+M(nx)}</button>`}<button class="btn noenter" data-b="opass" data-id="${p.id}">${me?L('Забрать участок','Take the plot'):L('Выйти из торгов','Leave the auction')}</button></div>
      ${nx>fair&&!me?`<p class="bz-note" style="color:var(--warn)">${L('Дороже разумного предела — окупится хуже.','Above the sensible limit — worse payback.')}</p>`:''}`;}
  else if(p.st==='lic'&&p.own==='you'){const built=W.biz.some(b=>b.pid===p.id),t=p.g==='sand'?'sandpit':'gravpit',B=E.BIZ[t];
    h+=`<p class="bz-note good">✓ ${L('Лицензия ваша','The licence is yours')}${p.pr?' · '+M(p.pr):''}</p>`+(built?'':`<p class="bz-note">${L(`${bn(t)}: ${M(B.cap)}, стройка ${mons(Math.round(B.days/30))}; сразу нужно 20 % — ${M(B.cap*.2)}, остальное — по ходу стройки.`,`${bn(t)}: ${M(B.cap)}, ${mons(Math.round(B.days/30))} to build; 20% up front — ${M(B.cap*.2)}, the rest as it goes.`)}</p><button class="btn accent w noenter" data-b="pbuild" data-id="${p.id}" style="margin-top:8px">${L('Строить карьер','Build the quarry')}</button>`);}
  else if(p.own&&p.own!=='you')h+=`<p class="bz-note">${L('Участок ушёл: ','Plot taken by ')+esc(rivN(p.own))}${p.pr?' · '+M(p.pr):''}</p>`;
  return h+'</div>';}

/* ================= окна: ИП, ООО, увольнение, кредиты, недра, главы ================= */
function doIP(){const r=act('regIP');if(r==='ok'){snd('coin');toast(L('Документы поданы: ИП будет через 3 дня','Papers filed: registration in 3 days'));}}
function openIP(){const W=w();if(W.ip)return;if(window.OWNUI&&OWNUI.openIP)return OWNUI.openIP();   // M17: окно ИП с выбором налога
  modal(`<h2>📄 ${L('Своё ИП','Sole trader')}</h2><div class="say">${UI.face('happy')}<div><p>${L('Для своей точки нужно ИП: самозанятым перепродавать товар нельзя. Оформим бесплатно, за 3 дня. Налог — 6 % с доходов, взносы 4 750 ₽ в месяц, в январе можно выбрать 15 % с прибыли.','A business needs sole-trader status: the self-employed can’t resell goods. It’s free and takes 3 days. Tax is 6% of revenue, contributions 4,750 ₽ a month; in January you can switch to 15% of profit.')}</p><p>${L('Бухгалтерию возьму на себя — за пирожки.','I’ll keep the books — for some pies.')}</p></div></div>
    <div class="row">${W.reg?`<div class="tip">📄 ${L('Уже оформляется: ещё ','Already in progress: ')+days(Math.max(1,W.reg.t-W.t))}</div>`:`<button class="btn green noenter" id="bzIpY">📄 ${L('Оформить ИП','Register')}</button>`}<button class="btn" id="bzIpN" data-esc>${L('Позже','Later')}</button></div>`);
  try{modalRe=openIP;}catch(e){}if($$('bzIpY'))$$('bzIpY').onclick=()=>{hideModal();doIP();};$$('bzIpN').onclick=()=>{snd('tap');hideModal();};}
function openOOO(){const W=w(),q=E.oooReq(W),all=q.eq&&q.pts&&q.mgr&&q.ch;
  modal(`<h2>🏢 ${L('ООО и своя сеть','An LLC and your own network')}</h2>${oooList(W,q)}<div class="say">${UI.face('calm')}<div><p>${L('С ООО откроются сети, склад и опт, стройбаза, второй город и кредиты для бизнеса. Берите меня на полставки — 90 000 ₽ в месяц: я вам нужнее, чем внукам.','An LLC unlocks chains, wholesale, a builders’ yard, a second city and business loans. Take me on part-time — 90,000 ₽ a month: you need me more than my grandchildren do.')}</p></div></div>
    <div class="row">${all&&!W.reg&&W.ip&&!W.ooo?`<button class="btn green noenter" id="bzOooY">${L('Оформить ООО — 5 дней','Register the LLC — 5 days')}</button>`:''}<button class="btn" id="bzOooN" data-esc>${L('Закрыть','Close')}</button></div>`);
  try{modalRe=openOOO;}catch(e){}if($$('bzOooY'))$$('bzOooY').onclick=()=>{hideModal();const r=act('regOOO');if(r==='ok'){snd('coin');toast(L('Документы поданы: ООО будет через 5 дней','Papers filed: the LLC in 5 days'));}};$$('bzOooN').onclick=()=>{snd('tap');hideModal();};}
function openQuit(){const W=w();let pts=0;for(const b of W.biz){const p=lastPm(b);if(p)pts+=p;}
  modal(`<h2>🏭 ${L('Уволиться со склада?','Quit the warehouse?')}</h2><div class="say">${UI.face(pts>E.JOB_PAY?'happy':'worry')}<div><p>${L('Совет: увольняйтесь, когда точки приносят больше зарплаты два месяца подряд. ','Advice: quit when your outlets earn more than the wage two months in a row. ')}${L(`Сейчас точки дали ${M(pts)} за месяц, зарплата — ${M(E.JOB_PAY)}.`,`Last month outlets made ${M(pts)}; the wage is ${M(E.JOB_PAY)}.`)}</p><p>${L('Уволитесь — освободится рука и +5 сил в день, но зарплаты не будет. Вернуться можно через полгода и на 45 000.','Quit and you free a hand and +5 energy a day, but lose the wage. You can come back in six months at 45,000.')}</p></div></div>
    <div class="row"><button class="btn" id="bzQN" data-esc>${L('Остаюсь','I’ll stay')}</button><button class="btn noenter" id="bzQY" style="color:var(--bad)">${L('Уволиться','Quit')}</button></div>`);
  $$('bzQN').onclick=()=>{snd('tap');hideModal();};$$('bzQY').onclick=()=>{hideModal();if(act('jobQuit')==='ok'){snd('win');toast(L(hg('Сам себе начальник!','Сама себе начальница!'),'Your own boss!'));}};}
function openCard(){const W=w(),lim=E.cardLimit(W);
  modal(`<h2>💳 ${L('Кредитная карта','Credit card')}</h2><div class="facts"><span>${L('Лимит','Limit')}</span><b>${M(lim)}</b><span>${L('Без процентов','Interest-free')}</span><b>${mons(3)}</b><span>${L('Потом','Then')}</span><b>36 %</b></div>
    <div class="say">${UI.face('calm')}<div><p>${L('Удобный мостик до зарплаты, если вернуть за три месяца. Возвращать — в «Финансах» → «Банк».','A handy bridge to payday if you repay within three months. Repay in Finance → Bank.')}</p></div></div>
    <div class="row"><button class="btn" id="bzCN" data-esc>${L('Не надо','No thanks')}</button><button class="btn green noenter" id="bzCY">${L('Взять ','Take ')+M(lim)}</button></div>`);
  $$('bzCN').onclick=()=>{snd('tap');hideModal();};$$('bzCY').onclick=()=>{hideModal();if(act('cardTake',lim)==='ok'){snd('coin');toast(L('Деньги на счёте: ','Money in the account: ')+M(lim));}};}
function openMfo(){modal(`<h2>⚠️ ${L('Микрозайм','Payday loan')}</h2><div class="say">${UI.face('strict')}<div><p>${L('Через месяц отдадите 37 тысяч вместо 30 — это 292 % годовых. Не надо. Лучше выходной и пара заказов.','In a month you’ll repay 37 thousand instead of 30 — that’s 292% a year. Don’t. Better take a day off and a couple of orders.')}</p></div></div>
    <div class="row"><button class="btn green" id="bzMN" data-esc>${L('Вы правы, не беру','You’re right, no')}</button><button class="btn noenter" id="bzMY">${L('Всё равно взять','Take it anyway')}</button></div>`);
  $$('bzMN').onclick=()=>{snd('tap');hideModal();};$$('bzMY').onclick=()=>{hideModal();if(act('microLoan')==='ok')toast(L('+30 000 ₽. Вернуть — 37 000 через месяц','+30,000 ₽. Repay 37,000 in a month'));};}
function openNedra(){const W=w();if(!E.nedraOk(W))return;const Eq=E.equity(W),a=Math.min(E.PARTNER_MAX,Math.max(0,E.NEDRA_CAP-Eq)),sh=Math.round(Eq/(Eq+a)*100);
  modal(`<div class="bz-ch"><div class="n">${L('Глава 5','Chapter 5')}</div><h2>🏔 ${L('Недра','Mining')}</h2></div>
    <p>${L('Роснедра приглашают к федеральным торгам. ','The federal agency invites you to national auctions. ')+(pn=>pn.charAt(0).toUpperCase()+pn.slice(1))(window.STORYUI&&STORYUI.partner?STORYUI.partner().n:L('фонд Сони «Сова Инвест»','Sonya’s Owl Invest fund'))+L(' верит в вас и входит партнёром:',' believes in you and joins as a partner:')}</p>
    <div class="facts"><span>${L('Ваш капитал','Your equity')}</span><b>${M(Eq)}</b><span>${L('Взнос партнёра','Partner’s stake')}</span><b>${M(a)}</b><span>${L('Ваша доля','Your share')}</span><b>${sh}${L(' %','%')}</b></div>
    <div class="bz-ch"><ul><li>${L('Три региона: Кузбасс, Урал, Карелия — разведка и торги','Three regions: Kuzbass, Urals, Karelia — surveys and auctions')}</li><li>${L('Уголь, руда, лес, металл, медь; ж/д логистика','Coal, ore, timber, metal, copper; rail logistics')}</li><li>${L('Налог — 25 % с прибыли; ваши точки и карьер остаются в портфеле','Tax — 25% of profit; your outlets and quarry stay in the portfolio')}</li></ul></div>
    <div class="say">${UI.face('wow')}<div><p>${L('Помните, как мы считали ларёк? Здесь то же самое, только нули другие.','Remember how we did the sums for the kiosk? Same here, just more zeros.')}</p></div></div>
    <div class="row"><button class="btn green noenter" id="bzNY">${L('Поехали','Let’s go')}</button><button class="btn" id="bzNN" data-esc>${L('Ещё подумаю','Not yet')}</button></div>`);
  try{modalRe=openNedra;}catch(e){}
  $$('bzNN').onclick=()=>{snd('tap');hideModal();};
  $$('bzNY').onclick=()=>{hideModal();let r=null;try{r=GAME.goNedra();}catch(e){console.error(e);}
    if(r&&!r.err){snd('win');buzz(60);S.bzSt='nedra';save();UI.go('map');toast(L('Добро пожаловать в недра!','Welcome to mining!'));}else toast(L('Пока не получилось — условия не выполнены','Not yet — conditions not met'));};}
const CHAP={
  gig:{n:1,t:['Карьера','Career'],li:[['У вас 5 000 ₽, комната и работа кладовщиком','You have 5,000 ₽, a room and a storekeeper’s job'],['Берите заказы вечерами — они выполняются сами, нажимать не нужно','Take jobs in the evenings — they get done by themselves, no tapping needed'],['✋ Руки — сколько дел сразу, ⚡ силы — тратятся на заказы и восстанавливаются сами','✋ Hands — how many jobs at once; ⚡ energy — spent on jobs and recovers by itself']],
    say:['Здравствуйте! Помню вас ещё со сдачи денег на выпускной. Соня говорит, вы теперь сами по себе? Давайте так: будете брать заказы по вечерам, а я научу считать деньги. Бухгалтеру без дела скучно.','Hello! I remember you from collecting money for the prom. Sonya says you’re on your own now? Here’s the deal: you take orders in the evenings, and I’ll teach you to count money. An accountant gets bored without work.'],
    // после пролога Людмила уже знакома — не представляется заново
    sayFn:()=>(S.tut&&S.tut.b_pro)||(window.STORYUI&&STORYUI.prologueDue&&w()&&w().fr&&w().fr.hero&&w().fr.hero.set&&STORYUI.prologueDue()===false)?['Ну что, начнём? Заказы — на доске, я рядом.','Well, shall we start? The orders are on the board — I’m right here.']:null,
    btn:['Посмотреть заказы','See the orders'],tab:'gigs'},
  small:{n:2,t:['Своё дело','My business'],li:[['Точки работают сами — выручка каждый день','Outlets work by themselves — revenue every day'],['Руки ✋ нужны точкам: управляющий освобождает руку за 30 % прибыли','Outlets need hands ✋: a manager frees one for 30% of the profit'],['Улучшения точек, маркетинг, курсы и дела хозяина','Outlet upgrades, marketing, courses and owner’s tasks'],['Разные дела выгоднее одинаковых: рынок города не резиновый','Different businesses beat identical ones: a city’s market has limits']],
    say:['Первое своё дело! Автомат работает сам и рук не занимает — заказы можно брать как раньше. А у ларька придётся стоять самому: тогда таксовать некогда, берём заказы, пока есть свободные руки. Книги веду я.','Your first business! The machine runs by itself and needs no hands — keep taking orders. A kiosk you’ll have to run yourself: then there’s no time for taxi shifts, so take orders only while you have free hands. I’ll keep the books.'],btn:['Поехали','Let’s go'],tab:'biz'},
  mid:{n:3,t:['Сеть','Network'],li:[['Сети: от 3 точек — скидка на закупку и опердиректор','Chains: from 3 outlets — purchase discount and an ops director'],['Склад и опт, стройбаза, самосвалы','Wholesale, a builders’ yard, dump trucks'],['Второй город: Екатеринбург или Петрозаводск','A second city: Yekaterinburg or Petrozavodsk']],
    say:['ООО готово! Берите меня на полставки — я вам нужнее, чем внукам. Теперь мы управляем не точками, а системой.','The LLC is ready! Take me on part-time — you need me more than my grandchildren do. Now we run a system, not outlets.'],btn:['Поехали','Let’s go'],tab:'net'},
  quarry:{n:4,t:['Карьер','Quarry'],li:[['Перечень участков: песок и щебень','The plot list: sand and gravel'],['Торги с местными — Бобров не отступит','Auctions with locals — Bobrov won’t back down'],['Свой карьер: добыча вместо закупки','Your own quarry: mine instead of buy']],
    say:['Мы отдаём Боброву по 1 300 за тонну. Свой карьер добывал бы втрое дешевле. Сначала карьера, потом карьер — помните?','We pay Bobrov 1,300 a tonne. Our own quarry would mine it three times cheaper. First a career, then a quarry — remember?'],btn:['Поехали','Let’s go'],tab:'pit'}};
// итог главы 1 — на цифрах игрока
function ch1Sum(){try{const W=w(),M0=W&&W.me;if(!W||!M0)return '';let rev=(W.mon&&W.mon.sg&&W.mon.sg.gig&&W.mon.sg.gig.rev)||0;for(const r of (W.reps||[]))rev+=(r.pl&&r.pl.rev)||0;
  const d=Math.max(1,Math.round(W.t||0)),n=M0.ng||0;
  return `<div class="bz-note" style="margin:8px 0 2px"><b>${L('Итог главы 1','Chapter 1 recap')}:</b> ${L(`${d} ${pl(d,'день','дня','дней','day','days')}`,`${d} ${pl(d,'день','дня','дней','day','days')}`)} · ${n} ${pl(n,'заказ','заказа','заказов','order','orders')} · ${L('заработано','earned')} ${M(rev)} · ${L('ИП оформлено','sole-trader status done')} · ${L('первый кофейный автомат','your first coffee machine')}</div>`;}catch(e){return '';}}
function openChapter(st,stH){const c=CHAP[st];if(!c)return;if(stH===undefined){snd(st==='gig'?'tap':'win');if(st!=='gig'){try{UI.salute();}catch(x){}}
    // предложение «Стартового набора» (META, один раз — S.ask.starter): считаем до modal и храним для перерисовки при смене языка
    stH='';try{if(st==='small'&&window.META&&META.starterHtml)stH=META.starterHtml()||'';}catch(x){}}
  modal(`<div class="bz-ch"><div class="n">${L('Глава ','Chapter ')+c.n}</div><h2>${T(c.t)}</h2><ul>${c.li.map(x=>`<li>${T(x)}</li>`).join('')}</ul>${st==='small'?ch1Sum():''}</div>
    <div class="say">${UI.face('happy')}<div><p>${T(c.sayFn?c.sayFn()||c.say:c.say)}</p></div></div>${stH||''}${window.CAB&&CAB.chLine?CAB.chLine(st):''}<div class="row"><button class="btn green" id="bzChGo">${T(c.btn)}</button></div>`);
  try{modalRe=()=>openChapter(st,stH);}catch(e){}
  $$('bzChGo').onclick=()=>{snd('tap');hideModal();if(st==='gig'){S.tut.b_hi=1;save();}V.biz='list';UI.go(c.tab);};}

/* ================= Школа Людмилы (8 уроков на числах игрока) ================= */
const LES={
  1:{t:()=>L('Личный бюджет','Personal budget'),b:d=>L(`В прошлом месяце вы заработали ${M(d.earn)}, а потратили ${M(d.spend)} — комната, еда, налог. Отложили ${M(d.save)}. Это и есть ваш первый отчёт: доходы − расходы = сколько отложили.`,`Last month you earned ${M(d.earn)} and spent ${M(d.spend)} — room, food, tax. You saved ${M(d.save)}. That’s your first report: income − spending = savings.`),
    q:()=>L('Что такое «отложили»?','What does “saved” mean?'),a:()=>[L('Доходы минус расходы','Income minus spending'),L('Все доходы месяца','All the month’s income'),L('Только зарплата','Just the wage')],ok:0},
  2:{t:()=>L('Выручка ≠ прибыль','Revenue ≠ profit'),b:d=>L(`Автомат наторговал ${M(d.rev)}. Но ингредиенты, место и поломки съели ${M(d.cost)}. Прибыль — ${M(d.prof)}. Выручка — это все деньги от покупателей, прибыль — то, что осталось.`,`The machine took ${M(d.rev)}. But ingredients, the spot and breakdowns ate ${M(d.cost)}. Profit is ${M(d.prof)}. Revenue is all the money from customers; profit is what’s left.`),
    q:()=>L('Сколько автомат на самом деле заработал?','How much did the machine really earn?'),a:d=>[M(d.rev||0),M(d.prof||0),'0 ₽'],ok:1},
  3:{t:()=>L('Прибыль ≠ деньги','Profit ≠ cash'),b:d=>L(`Прибыль за месяц — ${M(d.np)}, а денег на счёте прибавилось на ${M(d.dc)}. Часть денег лежит товаром на полке: ${M(d.stk)}. Это не расход, а запас — он станет деньгами, когда продадим.`,`Profit for the month was ${M(d.np)}, while cash changed by ${M(d.dc)}. Part of the money sits on the shelf as stock: ${M(d.stk)}. It isn’t a cost but inventory — it turns into cash when sold.`),
    q:()=>L('Куда делась часть денег?','Where did part of the money go?'),a:()=>[L('Лежит в товаре на полке','It’s in the stock on the shelf'),L('Ушла в налог','It went on tax'),L('Потерялась','It got lost')],ok:0},
  4:{t:()=>L('Баланс','Balance sheet'),b:d=>L(`Всё, что у вас есть (${M(d.a)}), = долги (${M(d.debt)}) + своё (${M(d.eq)}). Ларёк и автомат — не расход, а имущество: ${M(d.fa)}. Баланс всегда сходится.`,`Everything you own (${M(d.a)}) = debts (${M(d.debt)}) + your own equity (${M(d.eq)}). The kiosk and the machine aren’t costs but assets: ${M(d.fa)}. The balance always adds up.`),
    q:()=>L('Ларёк за 450 тысяч — это…','A 450,000 kiosk is…'),a:()=>[L('Расход месяца','A monthly cost'),L('Имущество','An asset'),L('Долг','A debt')],ok:1},
  5:{t:()=>L('Амортизация','Depreciation'),b:d=>L(`Каждый месяц точка «стареет» на ${M(d.dep)} — это износ, расход в отчёте о прибыли. Но деньги со счёта не уходят: их потратили один раз, при покупке (${M(d.g)}).`,`Every month the outlet “ages” by ${M(d.dep)} — depreciation, a cost in the P&L. But no cash leaves the account: it was spent once, at purchase (${M(d.g)}).`),
    q:()=>L('Амортизация уменьшает…','Depreciation reduces…'),a:()=>[L('Деньги на счёте','Cash in the account'),L('Прибыль, но не деньги','Profit, but not cash'),L('Ничего','Nothing')],ok:1},
  6:{t:()=>L('Проценты и тело кредита','Interest and principal'),b:d=>L(`Долг ${M(d.a)}. В этом месяце проценты — ${M(d.int)}, тело — ${M(d.body)}. Проценты — это расход, они уменьшают прибыль. Тело — просто возврат долга: деньги уходят, а прибыль не меняется.`,`Debt ${M(d.a)}. This month interest is ${M(d.int)}, principal ${M(d.body)}. Interest is a cost that cuts profit. Principal is just repaying the debt: cash goes out, profit stays the same.`),
    q:()=>L('Что попадает в расходы отчёта о прибыли?','What goes into P&L costs?'),a:()=>[L('Проценты','Interest'),L('Тело кредита','Principal'),L('И то, и другое','Both')],ok:0},
  7:{t:()=>L('УСН 6 % или 15 %','Tax: 6% or 15%'),b:d=>L(`За год налог был бы: 6 % с доходов — ${M(d.usn6)}, 15 % с прибыли — ${M(d.usn15)}. Если маржа маленькая (как у ларька) — выгоднее 15 %; если большая (как у ПВЗ) — 6 %. Выбираем раз в год, в январе.`,`Over the year the tax would be: 6% of revenue — ${M(d.usn6)}, 15% of profit — ${M(d.usn15)}. With a thin margin (a kiosk) 15% wins; with a fat one (a pick-up point) 6% wins. You choose once a year, in January.`),
    q:()=>L('Какой режим выгоднее по вашим цифрам?','Which regime is better for your numbers?'),a:()=>[L('6 % с доходов','6% of revenue'),L('15 % с прибыли','15% of profit')],ok:d=>d.usn6<=d.usn15?0:1},
  8:{t:()=>L('Дебиторка и кассовый разрыв','Receivables and cash gaps'),b:d=>L(`Покупатели должны нам ${M(d.rec)}, а на счёте ${M(d.cash)}. Прибыль в отчёте есть, а денег нет — они у покупателей. Выручают факторинг (деньги сразу за 3 %) или овердрафт.`,`Buyers owe us ${M(d.rec)}, and we have ${M(d.cash)} in the bank. The P&L shows profit, but the cash is with the buyers. Factoring (cash now for 3%) or an overdraft helps.`),
    q:()=>L('Прибыль есть, а денег нет — почему?','Profit but no cash — why?'),a:()=>[L('Покупатели ещё не заплатили','Buyers haven’t paid yet'),L('Ошибка бухгалтера','An accounting error'),L('Всё ушло в налог','It all went on tax')],ok:0}};
function lesDue(W){if(!W||W.ned||!E.lessons)return null;if(S.lesOff)return null;try{return E.lessons(W).find(x=>x.due&&!x.done&&LES[x.n])||null;}catch(e){return null;}}
function openLesson(n){const W=w(),x=E.lessons(W).find(y=>y.n===n);if(!x||!LES[n])return;const Ls=LES[n],d=x.d||{},ok=typeof Ls.ok==='function'?Ls.ok(d):Ls.ok,ans=Ls.a(d);
  modal(`<div class="bz-ch"><div class="n">📘 ${L('Школа Людмилы · урок ','Lyudmila’s School · lesson ')+n}</div><h2 style="font-size:24px">${Ls.t()}</h2></div>
    <div class="say">${UI.face('calm')}<div><p>${Ls.b(d)}</p></div></div><b>${Ls.q()}</b><div class="bz-q">${ans.map((a,i)=>`<button class="btn noenter" data-i="${i}">${esc(a)}</button>`).join('')}</div>
    <div class="row"><button class="btn" id="bzLesN" data-esc>${L('Потом','Later')}</button></div>`);
  try{modalRe=()=>openLesson(n);}catch(e){}
  $$('bzLesN').onclick=()=>{snd('tap');hideModal();};
  document.querySelectorAll('#mcard .bz-q button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,good=i===ok;snd(good?'coin':'no');
    let cr=0;try{cr=GAME.act('lessonDone',n,good)||0;}catch(e){}if(cr>0){GAME.addCr(cr,'lesson');try{UI.fly(b,cr,'cr');}catch(x){}}
    document.querySelectorAll('#mcard .bz-q button').forEach(q=>{q.disabled=true;if(+q.dataset.i===ok)q.classList.add('ok');else if(q===b)q.classList.add('nok');});
    const r=$$('bzLesN');r.textContent=L('Дальше','Next');r.classList.add('green');
    const p=document.createElement('p');p.style.textAlign='center';p.innerHTML=good?`<b class="good">${L('Верно!','Correct!')}</b>${cr?' +'+cr+' 💎':''}`:`<b>${L('Не совсем.','Not quite.')}</b> ${L('Правильный ответ отмечен зелёным.','The right answer is marked green.')}`;
    r.parentNode.parentNode.insertBefore(p,r.parentNode);
    if(n===7&&E.taxOk(W)){const m=ok===0?'usn6':'usn15';if(W.taxm!==m){const bb=document.createElement('button');bb.className='btn green noenter';bb.textContent=L('Выбрать ','Choose ')+(ok===0?'6 %':'15 %')+L(' на этот год',' for this year');bb.onclick=()=>{if(act('taxSet',m)==='ok'){snd('coin');toast(L('Режим налога сменён','Tax regime switched'));}hideModal();};r.parentNode.insertBefore(bb,r);}}});}

/* ================= офлайн и закрытие месяца на ранних главах ================= */
function offline(s){const W=w();if(!W||W.ned)return false;const mo=s.months||0;snd('close');
  const segs=Object.keys(s.sg||{}).filter(k=>Math.round(s.sg[k].e)).map(k=>`<div><span>${esc(SEG[k]?T(SEG[k]):k)}</span><b class="${s.sg[k].e>=0?'':'dn'}">${money0(s.sg[k].e)}</b></div>`).join('');
  const pts=W.biz.length,mg=W.biz.some(b=>b.mgr);
  // строки сходятся с «Стали богаче»: разница (налог, износ, проценты) — отдельной строкой (аудит M3: 58 458 − 38 000 ≠ 16 971)
  // суммируем так, как показано на экране (132 тыс. ₽ — это 132 000), чтобы столбик сходился глазами
  const shown=x=>{let t=String(M(x)).replace(/[\s\u00a0\u202f]/g,'').replace('−','-');t=LANG==='en'?t.replace(/,/g,''):t.replace(',','.');const v=parseFloat(t)||0;return Math.round(v*(/млрд|bn/.test(t)?1e9:/млн|m₽/.test(t)?1e6:/тыс|k₽/.test(t)?1e3:1));};
  const sgSum=Object.keys(s.sg||{}).filter(k=>Math.round(s.sg[k].e)).reduce((a,k)=>a+shown(s.sg[k].e),0),rest=segs?shown(s.np)-sgSum:0;
  // честная подсказка: вживую выгоднее (темп до ухода — по дневной истории денег; без неё — общими словами)
  const live=(()=>{if(s.ext||!(s.days>0))return '';let r=0;try{const t0=W.t-s.days,h=(S.bzh||[]).filter(x=>x[0]<=t0);if(h.length>=3){const a=h[Math.max(0,h.length-11)],b=h[h.length-1];if(b[0]>a[0])r=(b[1]-a[1])/(b[0]-a[0]);}}catch(e){}
    const est=Math.round(r*s.days/1000)*1000;
    if(est>0&&est>s.np*1.3)return L(`Вживую за такой срок у вас выходило бы примерно +${M(est)}: без вас заказы берут только постоянные клиенты${pts?', а точки работают тише':''}.`,`Playing live, this stretch would bring about +${M(est)}: while you’re away only regular clients’ orders get done${pts?' and outlets run quieter':''}.`);
    return pts?L('Вживую выгоднее: без вас заказы берут только постоянные клиенты, а точки работают тише.','Playing live pays more: while you’re away only regular clients’ orders get done and outlets run quieter.'):L('Вживую выгоднее: без вас заказы берут только постоянные клиенты.','Playing live pays more: while you’re away only regular clients’ orders get done.');})();
  let h=`<h2>👋 ${s.ext?L('Смена продлена','Shift extended'):L('Пока вас не было','While you were away')}</h2><div class="say">${UI.face(s.np>=0?'happy':'worry')}<div><p>${L(`${(mo||s.days)%10===1&&(mo||s.days)%100!==11?'Прошёл':'Прошло'} ${mo?mons(mo):days(s.days)}.`,`${mo?mons(mo):days(s.days)} went by.`)} ${pts?L(`Точки работали без хозяина (на 10 % тише)${mg?', управляющие держали настройки':''}.`,`Outlets ran without the owner (10% quieter)${mg?', managers kept the settings':''}.`):W.me&&W.me.job?L('Склад платил зарплату, жизнь шла своим чередом.','The warehouse paid your wage; life went on.'):''} ${s.gigs?L(`Пока вас не было, ${s.gigs%10===1&&s.gigs%100!==11?'выполнен':'выполнено'} ${s.gigs} ${pl(s.gigs,'заказ','заказа','заказов','order','orders')}.`,`${s.gigs} ${pl(s.gigs,'заказ','заказа','заказов','order','orders')} got done while you were away.`):''}</p></div></div>
    <div class="tiles"><div class="tile ${s.np>=0?'pos':'neg'}"><span>${s.np>=0?L('Стали богаче','Richer by'):L('Стали беднее','Poorer by')}</span><b>${M(Math.abs(s.np))}</b></div><div class="tile"><span>${L('Деньги','Cash')}</span><b>${M(s.cash1)}</b></div></div>
    ${segs?`<div class="lbl">${L('Прибыль по направлениям','Profit by segment')}</div><div class="clist">${segs}${rest?`<div><span>${L('Налоги, неполные месяцы и прочее','Taxes, partial months and other')}</span><b class="${rest>=0?'':'dn'}">${money0(rest)}</b></div>`:''}</div>`:''}
    ${live?`<p class="mut bz-live">💡 ${live}</p>`:''}`;
  const more=GAME.offMore();
  h+=`${window.STORYUI&&STORYUI.awayHtml?STORYUI.awayHtml():''}<div class="row">${more>0&&adOk()?`<button class="btn accent noenter" id="bzOx">📺 ${L('Продлить смену за рекламу','Extend the shift for an ad')}<small> +${days(more)}</small></button>`:''}<button class="btn green" id="bzOk">${L('К делам','Back to work')}</button></div>`;
  modal(h);try{modalRe=()=>offline(s);}catch(e){}
  $$('bzOk').onclick=()=>{snd('tap');hideModal();if(!s.ext)offAd();};
  if($$('bzOx'))$$('bzOx').onclick=()=>{hideModal();STAT.place('shift');showRewarded(()=>{GAME.extendShift();},()=>{});};
  return true;}
// межэкранная после окна «Пока вас не было» — только при флаге ad_off=1 и по обычным правилам (adDue/adReady: при запуске не бывает)
function offAd(){try{if(typeof adOffOn==='function'&&adOffOn()&&adDue()&&adReady()&&adAllowed())showInterstitial(()=>{});}catch(e){}}
const SEG={gig:['Подработка и зарплата','Side jobs & wage'],retail:['Розница и общепит','Retail & food'],serv:['Услуги','Services'],trade:['Опт и стройматериалы','Wholesale & building materials'],logi:['Грузоперевозки','Haulage'],quarry:['Нерудные (карьеры)','Aggregates'],re:['Недвижимость','Real estate'],hq:['Жизнь и общие расходы','Living costs & overheads'],
  mine:['Добыча','Mining'],wood:['Лес','Timber'],steel:['Металлургия','Steel'],copper:['Медь','Copper'],infra:['Склады','Storage']};
function closeExtra(rep){const W=w();if(!W||W.ned)return '';let h='';const sg=rep.sg||{};const ks=Object.keys(sg).filter(k=>sg[k].rev||sg[k].e);
  // строка «Налог и прочее» — чтобы сумма по направлениям сходилась с прибылью месяца
  if(ks.length>1){let sum=0;for(const k of ks)sum+=sg[k].e;let net=0;try{net=E.netOf(rep.pl);}catch(e){net=sum;}const rest=Math.round(net-sum),tax=Math.round(rep.pl.tax||0);
    h+=`<div class="lbl">${L('Прибыль по направлениям','Profit by segment')}</div><div class="clist">`+ks.map(k=>`<div><span>${esc(SEG[k]?T(SEG[k]):k)}</span><b class="${sg[k].e>=0?'':'dn'}">${M(sg[k].e)}</b></div>`).join('')
      +(Math.abs(rest)>=1?(()=>{const P=rep.pl,it=[[L('Износ точек и вещей','Depreciation'),-(P.dep||0)],[L('Проценты по кредитам','Loan interest'),-(P.int||0)],[L('Налог','Tax'),-tax]].filter(x=>Math.abs(x[1])>=1);   // M19: остаток — по статьям (сумма = прибыль, сверено с ECON.netOf)
        const o=Math.round(rest-it.reduce((a,x)=>a+x[1],0));if(Math.abs(o)>=1)it.push([L('Прочее','Other'),o]);return it.map(x=>`<div><span>${x[0]}</span><b class="${x[1]>=0?'':'dn'}">${M(x[1])}</b></div>`).join('');})():'')
      +`<div><span><b>${L('Итого прибыль','Total profit')}</b></span><b class="${net>=0?'':'dn'}">${M(net)}</b></div></div>`;}
  if(window.OWNUI)h+=OWNUI.closeLines(rep);   // M17: «до Сети», «живу на пассиве», итог рекламы
  if(window.STORYUI&&STORYUI.closeLine)h+=STORYUI.closeLine(rep);   // M20: «💬 Друзья за месяц: сэкономили N ₽» (js/story-ui.js)
  // урок — кнопкой прямо здесь, без отдельного пузыря «Первый месяц позади» (было 3 окна подряд: итог → пузырь → урок; аудит M3)
  const les=lesDue(W);if(les){if(S.tut&&!S.tut.b_money){S.tut.b_money=1;save();}
    h+=`<div class="tip">📘 ${L('Урок Людмилы на ваших цифрах: ','Lyudmila’s lesson on your own numbers: ')}${esc(LES[les.n].t())}<br><button class="btn sm noenter" data-b="cles" data-n="${les.n}" style="margin-top:8px">📘 ${L('Открыть урок','Open the lesson')}</button> <span class="mut" style="font-size:15px">${L('или позже — на «Сегодня»','or later — on Today')}</span></div>`;}
  return h;}
// межэкранная в ранних главах — не раньше первой точки и 6-го игрового месяца (флаг Яндекса ad_from: 5–12)
function adAllowed(){const W=w();if(!W)return true;return W.ned||(W.biz.length>0&&W.m>=(typeof adFrom==='function'?adFrom():5));}

/* ================= советы Людмилы (bizAdvise → ADV.text) и помощник при бездействии ================= */
const ZTXT={z_od:()=>L('Денег не хватило — банк дал овердрафт под высокий процент, кредитная история страдает. Продайте лишнее и не открывайте новое, пока не выправимся.','We ran short — the bank gave an expensive overdraft and our credit history suffers. Sell what’s idle and open nothing new until we recover.'),
  z_tired:a=>L(`Сил ${Math.round(a.en||0)} — возьмите выходной, иначе рейтинг пострадает.`,`Energy ${Math.round(a.en||0)} — take a day off, or your rating will suffer.`),
  z_gig:a=>L(`Рука свободна — есть заказ на ${M(a.pay||0)}. Взять?`,`A hand is free — there’s an order for ${M(a.pay||0)}. Take it?`),
  z_ip:()=>L('Скоро хватит на кофейный автомат. Оформим ИП заранее — это бесплатно и 3 дня.','You’ll soon afford a coffee machine. Let’s register as a sole trader now — free, 3 days.'),
  z_vend:()=>L('Хватает на автомат. Купим?','We can afford the machine. Shall we buy it?'),
  z_mgrloss:a=>L(`«${bn(a.bt)}» с управляющим в минусе: ~${Mr(a.mgr)} в месяц, а без него ~${Mr(a.self)}. Может, встать самому?`,`“${bn(a.bt)}” loses money with a manager: ~${Mr(a.mgr)} a month, ~${Mr(a.self)} without. Run it yourself?`),
  z_loss:a=>L(`«${bn(a.bt)}» второй месяц в минусе. Загляните — поправим главную настройку.`,`“${bn(a.bt)}” is in the red for the second month. Let’s adjust its main setting.`),
  z_ooo:()=>L('Всё готово для ООО — дальше сети, склад и стройбаза.','All set for an LLC — chains, a warehouse and a builders’ yard come next.'),
  z_opi:()=>L('Идут торги за участок. Бобров точно пойдёт — решайте, сколько готовы дать.','A plot auction is on. Bobrov will surely bid — decide how much you’re willing to pay.'),
  z_nedra:()=>L('Капитал и карьер готовы — пора в недра!','Capital and quarry are ready — time for mining!'),
  z_factor:()=>L('Покупатели должны, а денег на счёте нет. Факторинг даст деньги сразу за 3 %.','Buyers owe us and the account is empty. Factoring gives cash now for 3%.'),
  z_ev:()=>L('Случилось кое-что — нужно ваше решение. Карточка на «Сегодня».','Something came up and needs your decision. The card is on Today.'),
  z_tax:a=>L(`На ваших точках «${a.m==='usn6'?'6 % с выручки':'15 % с прибыли'}» выгоднее примерно на ${M(a.save)} в год. Сменить режим?`,`For your outlets “${a.m==='usn6'?'6% of revenue':'15% of profit'}” is about ${M(a.save)} a year cheaper. Switch the regime?`),
  z_up:a=>L(`«${a.ru}» в «${bn(a.bt)}» окупится за ${mons(Math.max(1,Math.ceil(a.pay)))}: ≈ +${Mr(a.g)} в месяц. Берём?`,`“${a.en}” for “${bn(a.bt)}” pays back in ${mons(Math.max(1,Math.ceil(a.pay)))}: ≈ +${Mr(a.g)} a month. Shall we?`),
  z_sat:a=>L(`У нас уже ${a.n} «${bn(a.bt)}» — рынок насыщен на ${Math.round(a.p*100)} %. Следующую точку лучше другого вида или в другом городе.`,`We already have ${a.n} “${bn(a.bt)}” — the market is ${Math.round(a.p*100)}% saturated. Make the next outlet a different kind, or in another city.`),
  z_hand:()=>L('Рука свободна — займите её делом хозяина: переговоры, проверка, поиск места.','A hand is free — give it an owner’s task: negotiation, an inspection, scouting.'),
  ok:()=>L('Всё идёт по плану. Время работает на нас.','All goes to plan. Time is on our side.')};
function zGo(it){const W=w(),a=it.a||{};switch(it.k){
  case 'z_od':return ()=>UI.go('fin');case 'z_tired':return ()=>{if(act('gigRest')==='ok')toast(L('Выходной: завтра силы — до максимума','Day off: full energy tomorrow'));};
  case 'z_gig':return ()=>{if(act('gigTake',a.id)==='ok'){snd('coin');toast(L('Заказ взят','Order taken'));}};
  case 'z_ip':return openIP;case 'z_vend':return ()=>openBizModal('vend');
  case 'z_loss':case 'z_mgrloss':return ()=>BIZUI.openBiz(a.id);
  case 'z_ev':return ()=>{UI.go('today');setTimeout(()=>{const e=$$('owEv');if(e)e.scrollIntoView({block:'center'});},60);};case 'z_tax':return ()=>{if(act('taxSet',a.m)==='ok'){snd('coin');toast(L('Режим налога сменён','Tax regime switched'));}};
  case 'z_up':return ()=>BIZUI.openBiz(a.id);case 'z_sat':return ()=>{V.biz='cat';UI.go('biz');};case 'z_hand':return ()=>{if(window.OWNUI)OWNUI.openJobs();};case 'z_ooo':return openOOO;case 'z_opi':return ()=>UI.go('pit');case 'z_nedra':return openNedra;case 'z_factor':return ()=>UI.go('net');}return null;}
function advOpen(){const W=w();const it=(E.advise(W)||[])[0]||{k:'ok'};const f=ZTXT[it.k];const g=zGo(it);
  UI.adv({html:esc(f?f(it.a||{}):ZTXT.ok()),mood:it.pri>=70?'worry':it.k==='ok'?'happy':'calm',go:g,goLbl:g?L('Сделать','Do it'):null});}
function idle(){const W=w(),c=[],DO=L('Сделать','Do it'),SH=L('Показать','Show me');
  const add=(k,pri,html,g,lbl,mood)=>c.push({k,pri,o:{html:esc(html),go:g,goLbl:g?(lbl||SH):null,mood:mood||'calm',key:'bz_'+k}});
  for(const it of E.advise(W)||[]){if(it.k==='ok'||!ZTXT[it.k])continue;if(it.k==='z_gig'&&W.me&&W.me.gigs.length)continue;if(it.k==='z_gig'){const bg=bestGig(W);if(!bg)continue;it.a={id:bg.id,pay:bg.pay};}   // «Спокойный день»: свободная рука не подгоняет, пока что-то в работе
   const g=zGo(it);add(it.k,it.pri,ZTXT[it.k](it.a||{}),g,it.k==='z_gig'||it.k==='z_tired'||it.k==='z_ip'?DO:SH,it.pri>=70?'worry':'calm');}
  const M0=W.me;
  if(M0&&stI()>=1){const self=W.biz.find(b=>b.st==='w'&&!b.mgr&&E.BIZ[b.t].hand&&E.BIZ[b.t].mw&&!W.opd[b.t]);
    if(self&&E.hands(W).free<1)add('mgr',50,L(`Вы стоите в «${bn(self.t)}» сами, а могли бы открыть ещё точку. Нанять управляющего?`,`You run “${bn(self.t)}” yourself, but could open another outlet. Hire a manager?`),()=>BIZUI.openBiz(self.id));}
  const les=lesDue(W);if(les)add('les',58,L('Урок в Школе Людмилы готов: ','A lesson in Lyudmila’s School is ready: ')+LES[les.n].t()+L(' — на ваших цифрах.',' — on your own numbers.'),()=>openLesson(les.n),L('Открыть','Open'),'happy');
  const g=E.goal(W);if(g&&GOALS[g.k]&&g.cur<g.need&&g.k!=='mgr'){const a=avgGain();add('goal',30,L(`До цели «${gT(g.k)}» осталось ${M(g.need-g.cur)}`,`${M(g.need-g.cur)} to go for “${gT(g.k)}”`)+(a>0?L(` — примерно ${days(Math.ceil((g.need-g.cur)/a))}.`,` — about ${days(Math.ceil((g.need-g.cur)/a))}.`):'.'),null);}
  if(W.st==='quarry'){const au=W.opi.find(p=>p.st==='auc');if(au)add('auc',86,L(`Торги по участку «${T(au.nm)}»: цена ${M(au.pr)}, лидер — ${au.lead?rivN(au.lead):'пока никто'}. Бобров точно пойдёт.`,`Auction for “${T(au.nm)}”: price ${M(au.pr)}, leader — ${au.lead?rivN(au.lead):'nobody yet'}. Bobrov will bid for sure.`),()=>UI.go('pit'));}
  const dl=E.DAYS-W.d;if(dl<=3)add('close',20,L(`Через ${days(dl)} закрытие месяца — я уже точу карандаши.`,`Month closes in ${days(dl)} — I’m sharpening my pencils.`),null);
  return c;}

/* ================= обучение главы 1 (5 шагов, S.tut.b_*) ================= */
function tutOn(){const W=w();return !!W&&!W.ned&&W.hold===1&&!S.tut.off&&W.st==='gig'&&!/[?&]shot=1/.test(location.search);}
function tutStep(){if(!tutOn())return null;const W=w(),M0=W.me,t=S.tut;if(!M0)return null;
  if(!t.b_hi)return 'hi';
  if(M0.ng===0&&!M0.gigs.length)return 'take1';
  if(M0.ng===0)return 'wait1';
  if(!t.b_t2&&(W.t>8||W.reps.length)){S.tut.b_t2=1;save();}
  if(!t.b_t2&&M0.gigs.length<2&&E.hands(W).free>=1&&M0.board.some(g=>E.gigCanTake(W,g)==='ok'))return 'take2';
  if(!t.b_t2)S.tut.b_t2=1;
  if(W.reps.length&&!t.b_money&&!(W.les&&W.les[1]))return 'money';
  if(!W.ip&&!W.reg&&W.cash>=E.BIZ.vend.cap*.7)return 'ip';
  if(W.ip&&!W.biz.length&&W.cash>=E.BIZ.vend.cap+E.bizRes(W))return 'vend';
  return null;}
function firstTakeSel(){const W=w();const g=W.me.board.slice().sort((a,b)=>(b.urg||0)-(a.urg||0)).find(g=>E.gigCanTake(W,g)==='ok'&&(W.me.ng>0||g.t==='flyer'));return g?'#bzTake-'+g.id:null;}
const TUT={
  take1:()=>({key:'b_take1',html:L('Это доска заказов. Начнём с простого — раздать листовки: один день, без риска. Жмите «Взять».','This is the job board. Let’s start simple — hand out flyers: one day, no risk. Tap “Take it”.'),tab:'gigs',hold:1,hl:firstTakeSel(),goLbl:L('Взять листовки','Take the flyers'),go:()=>{const cl=()=>{const s=firstTakeSel();const e=s&&document.querySelector(s);if(e)e.click();};if(UI.cur!=='gigs'){UI.go('gigs');setTimeout(cl,80);}else cl();}}),
  wait1:()=>({key:'b_wait1',html:L(`Заказ идёт сам: 1 игровой день — ${dayS()} секунд. Нажимать ничего не нужно — деньги придут на счёт. Время можно ускорить кнопкой «×1» в шапке.`,`The order runs by itself: 1 game day is ${dayS()} seconds. No tapping — the money lands in your account. You can speed time up with the “×1” button at the top.`),mood:'happy'}),
  take2:()=>({key:'b_take2',html:L('Готово — первые деньги! Руки ✋, силы ⚡ и выходной 🛌 — всегда на панели вверху. Свободных рук две: можно вести два заказа сразу. Заказы ждут на доске несколько дней — выбирайте спокойно.','Done — your first money! Hands ✋, energy ⚡ and the day off 🛌 are always on the bar at the top. You have two free hands: two orders at once. Orders wait on the board for a few days — choose calmly.'),tab:'gigs',hold:1,hl:firstTakeSel(),mood:'happy',ok:()=>{S.tut.b_t2=1;save();}}),
  money:()=>({key:'b_money',html:L('Первый месяц позади. Загляните в «Финансы» — там отчёт, а на экране «Сегодня» — мой первый урок.','The first month is behind us. Look into Finance for the report, and on Today there’s my first lesson.'),goLbl:L('Открыть урок','Open the lesson'),go:()=>{S.tut.b_money=1;save();const l=lesDue(w());if(l)openLesson(l.n);else UI.go('fin');},ok:()=>{S.tut.b_money=1;save();}}),
  ip:()=>({key:'b_ip',html:L(`Скоро накопим на кофейный автомат — ${M(E.BIZ.vend.cap)}. Для своей точки нужно ИП: бесплатно, 3 дня. Оформим заранее?`,`Soon we’ll have ${M(E.BIZ.vend.cap)} for a coffee machine. A business needs sole-trader status: free, 3 days. Register now?`),goLbl:L('Оформить ИП','Register'),go:openIP}),
  vend:()=>({key:'b_vend',html:L(`Хватает на кофейный автомат — и ${M(E.bizRes(w()))} останется на жизнь до конца месяца. Он не занимает рук: стоит в поликлинике и продаёт сам.`,`We can afford a coffee machine — and ${M(E.bizRes(w()))} stays for living costs till month end. It needs no hands: it stands in a clinic and sells by itself.`),goLbl:L('Купить автомат','Buy the machine'),go:()=>openBizModal('vend'),mood:'happy'})};
let tutShown=null,chapQ=0;const tutSess={};
// новая игра «с нуля»: сначала пролог помощника Story (кто я, 11 «Б», Людмила, цель), потом окно главы 1; время стоит
let proOn=false;
function startCh1(){const W=w(),pro=window.STORYUI&&typeof STORYUI.prologue==='function';
  if(pro&&!S.tut.b_pro&&W&&W.t<=3&&W.hold===1&&!W.biz.length){proOn=true;GAME.hold.add('pro');let done=false;STAT.ev('pro',{a:'open'});
    const fin=()=>{if(done)return;done=true;proOn=false;S.tut.b_pro=1;save();GAME.hold.delete('pro');if(!S.tut.b_hi&&tutStep()==='hi')queue(()=>openChapter('gig'));};
    try{STORYUI.prologue(fin);}catch(e){console.error(e);fin();}return;}
  openChapter('gig');}
function tutTick(cur){const st=tutStep();if(st==='hi'){if(!chapQ&&!proOn){chapQ=1;queue(()=>{chapQ=0;if(!S.tut.b_hi&&!proOn&&tutStep()==='hi')startCh1();});}return;}
  if(!st||tutShown&&TUT[st]&&TUT[st]().key!==tutShown){const a=$$('adv');if(tutShown&&a&&a.classList.contains('on')&&a.dataset.bz===tutShown){a.classList.remove('on');document.body.classList.remove('advon');try{GAME.hold.delete('advb');}catch(e){}}if(!st){tutShown=null;hlQ=null;return;}}
  const m=TUT[st]();
  if(m.tab&&cur!==m.tab)hlQ='#nav [data-tab="'+m.tab+'"]';else hlQ=m.hl||null;
  if(S.tut['v_'+m.key]||modalOn)return;
  // пузырь-подсказка про доску живёт только на «Заказах»; на других вкладках не ездит — подсвечена вкладка «Заказы»
  if(m.hold&&cur!==m.tab){const a0=$$('adv');if(tutShown===m.key&&a0&&a0.dataset.bz===m.key&&a0.classList.contains('on')){a0.classList.remove('on');document.body.classList.remove('advon');try{GAME.hold.delete('advb');}catch(e){}}tutShown=null;return;}
  // «Готово — первые деньги!» — один раз: показан в прошлом сеансе и не закрыт — после перезагрузки не повторяем (аудит M3)
  if(m.key==='b_take2'){if(S.tut.sh_b_take2&&!tutSess[m.key]){S.tut.v_b_take2=1;save();return;}if(!S.tut.sh_b_take2){S.tut.sh_b_take2=1;save();}tutSess[m.key]=1;}
  const adv=$$('adv');if(adv&&adv.classList.contains('on')&&tutShown===m.key)return;
  tutShown=m.key;const av=$$('adv');if(av)av.dataset.bz=m.key;UI.adv({key:m.key,tut:1,hold:m.hold,html:m.html,mood:m.mood||'calm',go:m.go||(m.tab&&cur!==m.tab?()=>UI.go(m.tab):null),goLbl:m.goLbl||(m.tab&&cur!==m.tab?L('Показать','Show me'):null),ok:m.ok});}

/* ================= события дня: новости, заказы, главы ================= */
const NEWS={open:null,built:a=>'🎉 '+L('Открылась точка: ','Now open: ')+low(bn(a.bt)),ip:()=>'📄 '+L('ИП оформлено — можно открывать своё дело','Registered as a sole trader — you can open a business'),
  opi:a=>'🔨 '+L('Лицензия на участок ваша! ','The plot licence is yours! ')+M(a.pr),opilost:a=>'🔨 '+L('Участок ушёл: ','Plot taken by ')+rivN(a.who)+' · '+M(a.pr),
  bobr:()=>'⛰ '+L('Бобров поднял цену щебня на 15 %','Bobrov raised the gravel price by 15%'),demol:a=>'🚧 '+L('Точку снесли, выплатили компенсацию: ','Outlet demolished, compensation paid: ')+low(bn(a.bt))};
const BEV={brk:a=>(a.bt==='vend'?L('Автомат сломался: 3 дня простоя','The machine broke down: 3 days idle'):a.bt==='gazel'?L('Газель в ремонте: 5 дней','The van is in repair: 5 days'):L('Самосвал сломался','The truck broke down'))+(a.c?' · '+M(a.c):''),
  bobrov:()=>L('Бобров открыл ларёк напротив!','Bobrov opened a kiosk opposite!'),demol:a=>L('Ларёк под снос — переезд ','The kiosk is being demolished — moving costs ')+M(a.c||0),insp:a=>L('Проверка санитарии: штраф ','Hygiene inspection: fine ')+M(a.c||0)+L(' и 7 дней закрыто',' and closed 7 days'),
  fine:a=>L('Штраф маркетплейса: ','Marketplace fine: ')+M(a.c||0),cut:()=>L('Маркетплейс снизил ставку на 3 месяца','The marketplace cut its rate for 3 months'),rival:()=>L('Рядом с ПВЗ открылся конкурент','A competitor opened near your pick-up point'),
  bean:()=>L('Кофейное зерно подорожало на 20 %','Coffee beans are 20% dearer'),viral:()=>L('Вирусный отзыв — ⭐ кофейни выросла!','A viral review — the coffee spot’s ⭐ went up!'),pump:a=>L('Сломался насос на мойке: ','The car-wash pump broke: ')+M(a.c||0),
  warr:a=>L('Гарантийный случай в автосервисе: ','Warranty claim at the car service: ')+M(a.c||0),left:()=>L('Лучший мастер ушёл к конкуренту','Your best mechanic left for a rival'),fleet:()=>L('Таксопарк стал постоянным клиентом: +30 %','A taxi fleet became a regular client: +30%'),truck:()=>L('Задержка фуры с цветами','The flower truck is delayed'),
  master:()=>L('Лучший мастер барбершопа ушёл и увёл клиентов','Your best barber left and took clients along'),oven:a=>L('Сломалась печь в пекарне: ремонт ','The bakery oven broke: repair ')+M(a.c||0)+L(', 2 дня закрыто',', closed 2 days'),
  order:()=>L('Столовой заказали банкеты: +30 % на 2 месяца','The canteen got banquet orders: +30% for 2 months'),check:a=>L('Проверка в аптеке: штраф ','Pharmacy inspection: fine ')+M(a.c||0),
  pcbrk:a=>L('В клубе сгорели компьютеры: ','Computers burnt out at the club: ')+M(a.c||0)+L(', 2 дня закрыто',', closed 2 days'),ruin:a=>L('Химчистка испортила вещь — платим клиенту ','The dry cleaner ruined an item — we pay the client ')+M(a.c||0),
  rain:()=>L('Дожди — у фудтрака меньше покупателей','Rainy spell — fewer customers at the food truck')};
const GIG_WHY={late:['опоздание, штраф 300\u00a0₽','late, 300\u00a0₽ fine'],refused:['заказчик отказался — без оплаты','the client rejected it — no pay'],crash:['ДТП: штраф 10\u00a0000\u00a0₽ и 3 дня без заказов','a crash: 10,000\u00a0₽ and 3 days off'],injury:['травма: 3 дня без заказов','an injury: 3 days off'],injury1:['ушиб: день без заказов, отдохните','a bruise: one day off, rest up'],crash1:['ДТП: штраф 10\u00a0000\u00a0₽ и день без заказов','a crash: 10,000\u00a0₽ and a day off'],back1:['потянули спину: день без заказов','pulled your back: a day off'],damage:['испортили вещь: возмещение 3\u00a0000\u00a0₽','damaged an item: 3,000\u00a0₽ compensation'],cancel:['отмена, оплата меньше','cancelled, less pay'],fail:['сорвали — сил не хватило','failed — not enough energy'],unsold:['не продалось, продали с потерей','didn’t sell, sold at a loss'],
  mix:['пересорт — штраф 1\u00a0500\u00a0₽','a mix-up — 1,500\u00a0₽ fine'],leash:['собака сорвалась с поводка — половина оплаты','a dog slipped its lead — half pay'],short:['не всё успели — оплата меньше','not everything done — less pay'],
  dish:['разбили посуду — 1\u00a0000\u00a0₽','broke some dishes — 1,000\u00a0₽'],card:['сбой карты памяти — половина оплаты','memory-card glitch — half pay'],ret:['возврат — 2\u00a0000\u00a0₽','a return — 2,000\u00a0₽'],
  back:['сорвали спину: 2 дня без заказов','strained your back: 2 days off'],late2:['опоздали — оплата меньше','late — less pay'],scratch:['поцарапали мебель — 2\u00a0500\u00a0₽','scratched the furniture — 2,500\u00a0₽']};
let qT=null;const Q=[],TQ=[];let tqT=0;
function tst(t,ms){if(TQ.length>=3)TQ.shift();TQ.push([t,ms]);}
setInterval(()=>{if(!TQ.length||(typeof modalOn!=='undefined'&&modalOn)||Date.now()-tqT<1600)return;const [t,ms]=TQ.shift();tqT=Date.now();try{toast(t,ms||2600);}catch(e){}},400);
function queue(fn){Q.push(fn);if(!qT)qT=setInterval(()=>{if(modalOn||(typeof paused!=='undefined'&&paused&&!document.hidden))return;const f=Q.shift();if(f)try{f();}catch(e){console.error(e);}if(!Q.length){clearInterval(qT);qT=null;}},600);}
function onDay(){const W=w();if(!W)return;cashHist();
  if(W.ned){newsT=W.t;return;}
  const fresh=W.news.filter(n=>n.t>newsT);if(newsT>=0)for(const n of fresh){let t=null;try{if(n.k==='biz'&&NEWS[n.a.k])t=NEWS[n.a.k](n.a);else if(n.k==='bizev'&&BEV[n.a.k])t=(n.a.k==='viral'?'🌟 ':'📰 ')+BEV[n.a.k](n.a);else if(n.k==='san')t='🏦 '+L('Банк продал часть точек и свёл долги в один кредит','The bank sold some outlets and merged the debts into one loan');}catch(e){}
    if(t){if(n.a.k==='built'||n.a.k==='ip'||n.a.k==='opi'){snd('win');try{UI.salute(true);}catch(x){}}tst(t,3200);}}
  newsT=W.t;
  // итог заказа — из события модели (GAME 'gig'): причина из GIG_WHY и сумма
  // цель на «Сегодня» сменилась — сказать об этом (раньше велосипед молча сменялся автоматом)
  {const g=E.goal(W),k=g&&GOALS[g.k]?g.k:null;if(k&&S.bzGk&&k!==S.bzGk){const bk=S.bzGk==='bike'&&!(W.me&&W.me.eq&&W.me.eq.bike);
      if(bk&&k==='vend')bikeAsk(W);else tst('🎯 '+L('Новая цель: ','New goal: ')+gT(k),4200);}
    if(k!==S.bzGk){S.bzGk=k;save();}}
  stageCheck();}
// денег хватило на велосипед — выбор, а не молчаливая смена цели (аудит M3 п.12): Людмила предлагает, игрок решает
function bikeAsk(W){const q=E.EQ.bike;let vp=0;try{vp=E.bizForecast(W,'vend').prof;}catch(e){}const vc=(E.BIZ&&E.BIZ.vend&&E.BIZ.vend.cap)||0;
  const go=()=>{if(act('eqBuy','bike')==='ok'){snd('coin');toast('🚲 '+L('Куплено: велосипед. Следующая цель — кофейный автомат','Bought: a bicycle. Next goal — a coffee machine'),3600);}};
  const ok=()=>tst('🎯 '+L('Цель: кофейный автомат — велосипед можно купить позже в «Заказах»','Goal: a coffee machine — you can buy the bicycle later in “Orders”'),4200);
  queue(()=>{if(!w()||w().cash<q.c)return ok();try{UI.adv({hold:1,mood:'calm',html:esc(L(`Хватает на велосипед (${M(q.c)}): курьеру платят 3 700 вместо 3 100 за смену, окупится за ~30 смен. А кофейный автомат${vc?' ('+M(vc)+')':''} работает сам и рук не занимает${vp>0?' — примерно +'+Mr(vp)+' в месяц':''}. Я бы копила на автомат. Решайте сами.`,`You can afford a bicycle (${M(q.c)}): couriers get 3,700 instead of 3,100 a shift, it pays back in ~30 shifts. A coffee machine${vc?' ('+M(vc)+')':''} runs by itself and needs no hands${vp>0?' — about +'+Mr(vp)+' a month':''}. I’d save for the machine. Your call.`)),go,goLbl:'🚲 '+L('Купить велосипед','Buy the bicycle'),okLbl:'☕ '+L('Копить на автомат','Save for the machine'),okMain:1,ok});}catch(e){ok();}});}
function gigRes(e){if(!e||!e.t)return;const w0=GIG_WHY[e.why],good=e.ok&&!e.why,n=Math.round(e.acc!=null?e.acc:(e.net||0));   // тост = сколько пришло на счёт (аудит M3 п.18), налог — в конце месяца
  let tx='';if(e.acc!=null&&e.acc>0&&e.acc!==e.net&&(S.bzTx||0)<3){S.bzTx=(S.bzTx||0)+1;tx=' · '+L('налог 4 % спишется в конце месяца','4% tax is charged at month end');}
  snd(good?'coin':'no');if(good)buzz(10);
  // деньги за заказ летят в счётчик (из строки заказа, если она на экране)
  if(n>0&&UI&&UI.fly){try{UI.fly($$('bzG-'+e.id)||$$('bzPin'),n);}catch(x){}}
  tst((good?'✅ ':'⚠️ ')+gShort(e.t)+(w0?': '+T(w0):'')+' · '+(n>=0?'+':'−')+M(Math.abs(n))+tx,w0||tx?4200:2600);
  if(e.lv)tst('🎓 '+L('Новый уровень опыта: ','New experience level: ')+low(gShort(e.t))+' — '+L('ур. ','lv ')+e.lv+'/'+E.LV_MAX,3500);}
function stageCheck(){const W=w();if(!W)return;const st=W.st;if(!S.bzSt){S.bzSt=st;save();return;}
  const i0=E.STAGES.indexOf(S.bzSt),i1=E.STAGES.indexOf(st);if(i1>i0&&CHAP[st]){S.bzSt=st;save();queue(()=>openChapter(st));}else if(i1!==i0){S.bzSt=st;save();}}

/* ================= клики ================= */
function onClick(e){const b=e.target.closest('[data-b]');if(!b||b.disabled)return;const a=b.dataset.b,id=b.dataset.id,W=w();if(!W)return;
  // кнопка внутри окна-листа, ведущая на экран или делающая действие, сначала закрывает окно
  if(b.closest('#modal')&&(a==='tab'||a==='restgo'))hideModal();
  switch(a){
    case 'tab':snd('tap');if(b.dataset.t==='biz'||b.dataset.t==='net'||b.dataset.t==='pit')V.biz='list';UI.go(b.dataset.t);break;
    case 'goal':snd('tap');goalGo(b.dataset.k);break;
    case 'les':snd('tap');openLesson(+b.dataset.n);break;
    case 'cles':snd('tap');delete S.pendRep;save();openLesson(+b.dataset.n);break;   // урок из окна закрытия месяца
    case 'gtake':takeGig(id);break;
    case 'gdet':snd('tap');openGig(id);break;
    case 'gopt':snd('tap');gSel[id]=b.dataset.o;openGig(id);break;
    case 'rest':snd('tap');openRest();break;
    case 'restgo':if(act('gigRest')==='ok'){snd('tap');toast(L('Выходной: завтра силы — до максимума','Day off: full energy tomorrow'));}break;
    case 'pinfo':snd('tap');pinInfo(b.dataset.k);break;
    case 'pkbuy':snd('tap');pkBuy(b.dataset.k);break;
    case 'fask':{try{STORYUI.openAsk(id);}catch(x){}break;}
    case 'gbest':{const g=bestGig(W);if(!g)break;const r=act('gigTake',g.id);if(r==='ok'){snd('coin');buzz(15);toast(L('Взято: ','Taken: ')+low(gShort(g.t))+L(' — готово через ',' — done in ')+days(g.days),2200);}break;}
    case 'grest':if(act('gigRest')==='ok'){snd('tap');toast(L('Выходной: завтра силы — до максимума','Day off: full energy tomorrow'));}break;
    case 'gauto':{const t=b.dataset.t;act('gigAuto',t,!W.me.auto[t]);snd('tap');break;}
    case 'brCr':crAsk(E.CR_BIZ.breath,L('Второе дыхание: +50 сил','Second wind: +50 energy'),()=>{if(act('breath')==='ok')snd('coin');},0,'breath');break;
    case 'gift':{const n=GAME.gift(false);if(n){snd('coin');toast('+'+n+' 💎');try{UI.fly(b,n,'cr');}catch(x){}}break;}
    case 'giftAd':STAT.place('gift');showRewarded(()=>{const n=GAME.gift(true);if(n){snd('coin');toast('+'+n+' 💎');try{UI.fly(null,n,'cr');}catch(x){}}},()=>{});break;
    case 'gchkCr':crAsk(2,L('Людмила проверит сделку','Lyudmila will check the deal'),()=>{const r=act('dealChk',id);if(r){snd('tap');const g=w().me.board.find(x=>x.id===id);if(g){toast(dealSay(g),3500);openGig(id);}}},0,'dealchk');break;
    case 'brAd':adRun('breath','breath',[],()=>{snd('coin');toast(L('+50 сил!','+50 energy!'));});break;
    case 'urgAd':adRun('urg','urgentGig',[],g=>{snd('coin');toast(L('Срочный заказ на доске: ','Urgent order on the board: ')+M(g.pay));});break;
    case 'gx2':adRun('x2','gigX2',[id],p=>{snd('coin');buzz(15);toast(L('Заказчик доплатил: +','The client paid extra: +')+M(p));});break;
    case 'gchk':adRun('chk','dealChk',[id],()=>{snd('tap');const g=w().me.board.find(x=>x.id===id);if(g){toast(dealSay(g),3500);openGig(id);}});break;
    case 'promo':adRun('promo','bizPromo',[id],()=>{snd('coin');toast(L(`Реклама запущена: +${Math.round(E.PROMO_K*100)} % покупателей на ${days(E.PROMO_D)}`,`Ad is running: +${Math.round(E.PROMO_K*100)}% customers for ${days(E.PROMO_D)}`));});break;
    case 'bspdAd':adRun('open','bizAdSpeed',[id],()=>{snd('build');toast(L('Ускорили на 5 дней!','5 days sooner!'));});break;
    case 'urgCr':crAsk(E.CR_BIZ.urgent,L('Срочный заказ ×1,5','Urgent order ×1.5'),()=>{let g=null;try{g=GAME.act('urgentGig');}catch(x){}if(g){snd('coin');toast(L('Срочный заказ на доске: ','Urgent order on the board: ')+M(g.pay));}},0,'urggig');break;
    case 'eqask':{const k=b.dataset.k,q=E.EQ[k];if(!q)break;snd('tap');modalYes(q.ico+' '+L(q.n,q.en)+' — '+M(q.c),EQ_WHY[k]?EQ_WHY[k]().replace(/^./,c=>c.toUpperCase())+'.':'',L('Купить за ','Buy for ')+M(q.c),()=>{if(act('eqBuy',k)==='ok'){snd('coin');toast(L('Куплено: ','Bought: ')+low(L(q.n,q.en)));}});break;}
    case 'eq':{const k=b.dataset.k,q=E.EQ[k];if(act('eqBuy',k)==='ok'){snd('coin');toast(L('Куплено: ','Bought: ')+low(L(q.n,q.en)));}break;}
    case 'quit':snd('tap');openQuit();break;
    case 'jobback':if(act('jobBack')==='ok'){snd('coin');toast(L('Снова на складе: 45 000 ₽ в месяц','Back at the warehouse: 45,000 ₽ a month'));}break;
    case 'ip':snd('tap');openIP();break;
    case 'taxm':if(act('taxSet',b.dataset.v)==='ok'){snd('coin');toast(L('Режим налога выбран на год','Tax regime chosen for the year'));}break;
    case 'card':snd('tap');openCard();break;case 'mfo':snd('tap');openMfo();break;
    case 'ooo':snd('tap');openOOO();break;
    case 'bnew':snd('tap');V.biz='cat';UI.render();document.getElementById('main').scrollTop=0;break;
    case 'bcity':snd('tap');V.city=b.dataset.c;UI.render();break;
    case 'bcatall':snd('tap');V.catAll=!V.catAll;UI.render();break;
    case 'bcat':snd('tap');openBizModal(b.dataset.t,isMid(b.dataset.t)?W.home:null);break;
    case 'bpt':snd('tap');BIZUI.openBiz(id,b.dataset.from);break;
    case 'bback':snd('tap');back();break;
    case 'knob':{const bb=W.biz.find(x=>x.id===V.id);if(!bb)break;const r=act('bizKnob',bb.id,b.dataset.k,b.dataset.v);if(r==='ok')snd('tap');break;}
    case 'mgr':{const r=act('bizMgr',id,b.dataset.v==='1');if(r==='ok'){snd('coin');toast(b.dataset.v==='1'?L('Управляющий нанят — рука свободна','Manager hired — a hand is free'):L('Теперь вы стоите сами','Now you run it yourself'));}break;}
    case 'audit':case 'auditAd':{const run=free=>{let r=null;try{r=GAME.act('bizAudit',id,free);}catch(x){}if(r==='cash'){snd('no');toast(MSG.cash());return;}if(r&&typeof r==='object')auditRes(id,r);};
      if(a==='auditAd')adRun('audit','bizAudit',[id,true],r=>{if(typeof r==='object')auditRes(id,r);});else run(false);break;}
    case 'bspd':{const bb=W.biz.find(x=>x.id===id);if(!bb)break;const n=isPit(bb.t)?E.CR_BIZ.pit:E.CR_BIZ.open;crAsk(n,bn(bb.t)+': '+(isPit(bb.t)?L('на 15 дней раньше','15 days sooner'):L('на 5 дней раньше','5 days sooner')),()=>{if(act('bizSpeed',id)==='ok'){snd('build');toast(L('Ускорили!','Sped up!'));}},0,'bizspd');break;}
    case 'sell':openSell(id);break;
    case 'opd':{const t=b.dataset.t,r=act('opdHire',t,!W.opd[t]);if(r==='ok'){snd('coin');toast(W.opd[t]?L('Опердиректор нанят: одна рука на всю сеть','Ops director hired: one hand for the whole chain'):L('Опердиректор уволен','Ops director dismissed'));}break;}
    case 'city':{const c=b.dataset.c;modalYes(L('Открыть представительство — ','Open an office in ')+cityN(c),L('Поиск помещений и люди на месте — 1 млн ₽ разово. Потом можно открывать там точки: аренда и спрос другие.','Finding premises and local staff — 1 m ₽ once. Then you can open outlets there: rent and demand differ.'),L('Открыть за ','Open for ')+M(1e6),()=>{if(act('cityOpen',c)==='ok'){snd('coin');toast(L('Новый город: ','New city: ')+cityN(c));}});break;}
    case 'factor':if(act('factor')==='ok'){snd('coin');toast(L('Деньги получены, комиссия 3 %','Cash received, 3% fee'));}break;
    case 'obid':{const r=act('opiBid',id);const p=W.opi.find(x=>x.id===id);if(r==='bot'){snd('gavel');toast(L('Соперник перебил: ','Outbid by ')+rivN(p.lead)+' · '+M(p.pr));}else if(r==='won'){snd('win');toast(L('Участок ваш!','The plot is yours!'));}else if(r==='ok'||r==='you')snd('gavel');break;}
    case 'oauto':{const p=W.opi.find(x=>x.id===id);if(!p)break;const lim=Math.min(Math.round(p.V*E.OPI_ADV),W.cash);let r=null,n=0;
      while(p.st==='auc'&&p.lead!=='you'&&(p.lead?p.pr+p.step:p.pr)<=lim&&n++<500){r=act('opiBid',id);if(r!=='bot')break;}
      if(r==='won'||p.own==='you'){snd('win');toast(L('Участок ваш!','The plot is yours!'));}else if(p.lead==='you'){snd('gavel');toast(L('Вы лидируете: ','You lead: ')+M(p.pr));}else{snd('no');const nx=p.lead?p.pr+p.step:p.pr;
        // упёрлись в деньги, а не в разумный предел — сказать честно и предложить банк
        if(nx>W.cash&&nx<=Math.round(p.V*E.OPI_ADV)){let mx=0;try{mx=E.loanOffer(W).max;}catch(x){}
          modalYes(L('Не хватило денег','Not enough money'),L(`${rivN(p.lead)} ведёт с ${M(p.pr)}, а следующая ставка — ${M(nx)}: на счёте ${M(W.cash)}. Разумный предел — ${M(Math.round(p.V*E.OPI_ADV))}.`,`${rivN(p.lead)} leads at ${M(p.pr)}; the next bid is ${M(nx)}, and you have ${M(W.cash)}. The sensible limit is ${M(Math.round(p.V*E.OPI_ADV))}.`)+(mx>0?' '+L(`Банк даст до ${M(mx)}.`,`The bank will lend up to ${M(mx)}.`):''),L('В банк','To the bank'),()=>UI.go('fin'),L('Понятно','Got it'));}
        else toast(L('Соперник дал больше разумного предела: ','A rival went above the sensible limit: ')+rivN(p.lead)+' · '+M(p.pr));}break;}
    case 'opass':{const r=act('opiPass',id);const p=W.opi.find(x=>x.id===id);if(r==='won'){snd('win');toast(L('Участок ваш!','The plot is yours!'));}else if(r==='lost'){snd('no');toast(L('Участок ушёл: ','Plot taken by ')+rivN(p.own));}else if(r==='none')toast(L('Никто не дал цену — торги перенесли','No bids — the auction is postponed'));break;}
    case 'pbuild':if(act('pitBuild',id)==='ok'){snd('build');toast(L('Стройка карьера началась','Quarry construction started'));}break;
    case 'nedra':snd('tap');openNedra();break;}}
function modalYes(title,text,yes,fn,no){modal(`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="row"><button class="btn" id="bzYN" data-esc>${no||L('Отмена','Cancel')}</button><button class="btn green noenter" id="bzYY">${esc(yes)}</button></div>`);
  $$('bzYN').onclick=()=>{snd('tap');hideModal();};$$('bzYY').onclick=()=>{hideModal();fn();};}
function openSell(id){const W=w(),b=W.biz.find(x=>x.id===id);if(!b)return;const pr=E.bizSellPrice(W,b),bk=E.bizBook(b);
  modal(`<h2>🤝 ${L('Продать','Sell')}: ${esc(bn(b.t))}?</h2><div class="facts"><span>${L('Покупатель даёт','Buyer offers')}</span><b>${M(pr)}</b><span>${L('По учёту стоит','Book value')}</span><b>${M(bk)}</b><span>${pr>=bk?L('Сверху (гудвилл)','Goodwill on top'):L('Потеря','Loss')}</span><b class="${pr>=bk?'good':'bad'}">${M(Math.abs(pr-bk))}</b></div>
    <p class="bz-note">${L('Прибыльную точку с хорошим рейтингом покупают дороже учётной стоимости — разница идёт в прочие доходы.','A profitable, well-rated outlet sells above book value — the difference is other income.')}</p>
    <div class="row"><button class="btn" id="bzSN" data-esc>${L('Оставить','Keep it')}</button><button class="btn noenter" id="bzSY" style="color:var(--bad)">${L('Продать за ','Sell for ')+M(pr)}</button></div>`);
  $$('bzSN').onclick=()=>{snd('tap');hideModal();};$$('bzSY').onclick=()=>{hideModal();if(act('bizSell',id)==='ok'){snd('coin');toast(L('Продано: +','Sold: +')+M(pr));V.biz='list';UI.render();}};}
function auditRes(id,r){const W=w(),b=W.biz.find(x=>x.id===id);snd(r.ok?'coin':'alert');
  modal(`<h2>🔍 ${L('Ревизия','Audit')}: ${esc(b?bn(b.t):'')}</h2><div class="say">${UI.face(r.ok?'happy':'strict')}<div><p>${r.ok?L('Всё сходится до копейки. Управляющий честный.','Everything adds up to the kopeck. The manager is honest.'):L(`Недостача ${M(r.th)} за время работы. Управляющий подворовывает. Сменить?`,`A shortfall of ${M(r.th)} over time. The manager is skimming. Replace him?`)}</p></div></div>
    <div class="row">${r.ok?'':`<button class="btn green noenter" id="bzFire">${L('Сменить управляющего','Replace the manager')}</button>`}<button class="btn" id="bzAudOk" data-esc>${L('Понятно','Got it')}</button></div>`);
  $$('bzAudOk').onclick=()=>{snd('tap');hideModal();};if($$('bzFire'))$$('bzFire').onclick=()=>{hideModal();if(act('bizFire',id)==='ok')toast(L('Новый управляющий вышел на работу','A new manager has started'));};}
function back(){if(!UI)return false;const cur=UI.cur;if((cur==='biz'||cur==='net'||cur==='pit')&&V.biz!=='list'){const f=V.biz==='pt'?V.from:'biz';V.biz='list';if(f&&f!==cur&&SCR.indexOf(f)>=0)UI.go(f);else UI.render();return true;}
  if(cur==='biz'&&w()&&w().ned){UI.go('obj');return true;}return false;}
// ползунок: прогноз меняется сразу, действие — по отпусканию
function onInput(e){const t=e.target;if(t.id!=='bzSl')return;drag=true;const W=w(),b=W.biz.find(x=>x.id===t.dataset.id);if(!b)return;const k=Object.assign({},b.k,{[t.dataset.k]:+t.value});
  const v=$$('bzSlV');if(v)v.textContent=t.dataset.k==='mk'?t.value+L(' %','%'):t.value+' ₽';const fc=$$('bzFc');if(fc){const d=document.createElement('div');d.innerHTML=fcCard(W,b,k);fc.replaceWith(d.firstChild);}}
function onChange(e){const t=e.target;if(t.id!=='bzSl')return;drag=false;act('bizKnob',t.dataset.id,t.dataset.k,+t.value);}

/* ================= хуки для ui.js ================= */
function render(cur,ev){const W=w();if(!W)return false;const mine=SCR.indexOf(cur)>=0;
  if(!W.ned&&!mine&&cur!=='fin'){setTimeout(()=>UI.go(home()),0);return true;}
  if(W.ned&&mine&&!(cur==='biz'&&W.biz.length)){setTimeout(()=>UI.go('map'),0);return true;}
  if(!mine)return false;
  const def=UI.TAB_DEF.find(t=>t.id===cur);if(def&&!(cur==='biz'&&W.ned)){let ok=true;try{ok=def.show();}catch(e){}if(!ok){setTimeout(()=>UI.go(home()),0);return true;}}
  if(drag&&ev==='day')return true;
  const el=$$('scr-'+cur);if(!el)return true;
  if(cur!=='gigs')gbKeep=null;
  if(cur==='today')rToday(el);else if(cur==='gigs')rGigs(el);else if(cur==='biz')rBiz(el);else if(cur==='net')rNet(el);else if(cur==='pit')rPit(el);
  return true;}
function after(cur,ev){const W=w();if(!W)return;
  if(W.ned){if(cur==='obj'&&W.biz.length){const el=$$('scr-obj');if(el&&!$$('bzObjCard')){let s=0;for(const b of W.biz){const p=lastPm(b);if(p)s+=p;}
      const d=document.createElement('button');d.id='bzObjCard';d.className='card tap bz-li';d.style.padding='14px 18px';d.dataset.b='tab';d.dataset.t='biz';
      d.innerHTML=`<span class="bz-ic">🏪</span><span class="f1"><b>${L('Своё дело: ','My business: ')+W.biz.length+' '+pl(W.biz.length,'точка','точки','точек','outlet','outlets')}</b><small>${L('прибыль за месяц ','profit last month ')+money0(s)}</small></span><span class="chev">›</span>`;el.insertBefore(d,el.firstChild);}}
    return;}
  // точки на вкладках
  const set=(t,on)=>{const b=document.querySelector('#nav [data-tab="'+t+'"]');if(!b)return;let d=b.querySelector('.dot');if(on&&!d){d=document.createElement('i');d.className='dot';b.appendChild(d);}else if(!on&&d)d.remove();};
  const M0=W.me,H=E.hands(W);
  set('gigs',cur!=='gigs'&&!!M0&&H.free>0&&M0.rest<=0&&M0.out<=0&&M0.board.some(g=>E.gigCanTake(W,g)==='ok'));
  set('biz',cur!=='biz'&&W.biz.some(b=>bizDot(W,b)&&!isMid(b.t)&&!isPit(b.t)));
  set('pit',cur!=='pit'&&W.opi.some(p=>p.st==='auc'));
  set('today',cur!=='today'&&!!lesDue(W));
  const nv=$$('nav');if(nv&&nv.dataset.bzk!==W.st+LANG){nv.dataset.bzk=W.st+LANG;nv.dataset.k='';UI.buildNav();}
  if(ev==='day'||ev==='change'||ev==='go'||ev==='close')onDay();
  tutTick(cur);
  document.querySelectorAll('.bzhl').forEach(x=>{x.classList.remove('hl','bzhl');});
  if(hlQ){const e=document.querySelector(hlQ);if(e&&e.offsetParent!==null){e.classList.add('hl','bzhl');}}}
function home(){const W=w();return W&&!W.ned?'today':'map';}
function tabDefs(){const D=UI.TAB_DEF,sv=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ned=()=>{const W=w();return !W||W.ned;};
  for(const t of D)if(['map','obj','market','logi'].indexOf(t.id)>=0){const s0=t.show;t.show=()=>ned()&&(s0?s0():true);}
  // «Финансы» — одно название во всех главах (раньше в главе 1 было «Деньги»: игрок 45+ искал вкладку по старому имени)
  const mine=[
    {id:'today',ico:sv('<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>'),ru:'Сегодня',en:'Today',show:()=>!ned()},
    {id:'gigs',ico:sv('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h5"/>'),ru:'Заказы',en:'Orders',show:()=>!ned()&&stI()<=1&&!!w().me},
    {id:'biz',ico:sv('<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v1.5a2.7 2.7 0 01-5.3 0 2.7 2.7 0 01-5.4 0A2.7 2.7 0 014 10.5z"/><path d="M5.5 13v7h13v-7M10 20v-4h4v4"/>'),ru:'Бизнес',en:'Business',show:()=>{const W=w();return !ned()&&(stI()>=1||!!W.ip||!!W.reg||W.biz.length>0||W.cash>=E.BIZ.vend.cap*.6);}},
    {id:'net',ico:sv('<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M11 7l-5 9M13 7l5 9M7.2 18h9.6"/>'),ru:'Сеть',en:'Network',show:()=>!ned()&&stI()>=2},
    {id:'pit',ico:sv('<path d="M3 20l6-10 4 6 3-4 5 8z"/><path d="M14 4l4 4M18 4l-4 4"/>'),ru:'Карьер',en:'Quarry',show:()=>!ned()&&stI()>=3}];
  for(let i=mine.length-1;i>=0;i--)if(!D.some(t=>t.id===mine[i].id))D.unshift(mine[i]);}
function init(){css();const m=$$('main');
  for(const id of SCR)if(!$$('scr-'+id)){const s=document.createElement('section');s.id='scr-'+id;s.className='screen';m.appendChild(s);}
  tabDefs();
  document.addEventListener('click',e=>{if(e.target.closest('#main,#modal,#adv'))onClick(e);});
  m.addEventListener('input',onInput);m.addEventListener('change',onChange);
  ['pointerup','touchend','mouseup'].forEach(t=>document.addEventListener(t,()=>{if(drag)setTimeout(()=>{drag=false;},50);},{passive:true}));
  // тексты советов малого бизнеса (bizAdvise → ADV.text)
  if(typeof ADV!=='undefined'&&ADV&&ADV.text){const t0=ADV.text;ADV.text=function(it){if(it&&ZTXT[it.k]&&(it.k!=='ok'||early()))try{return ZTXT[it.k](it.a||{});}catch(e){return '';}return t0.apply(this,arguments);};}
  // суммы до 100 тыс. — точно («48 200 ₽», а не «48 тыс. ₽»): на ранних главах это главные деньги
  if(!FMT.money.bz){const m0=FMT.money;FMT.money=function(x){const a=Math.abs(Math.round(x||0));if(a>=1000&&a<1e5)return (x<0?'−':'')+FMT.num(a)+' ₽';return m0(x);};FMT.money.bz=1;}
  GAME.on('reset',()=>{V.biz='list';S.bzSt=null;S.bzh=[];gigIds=null;gbKeep=null;newsT=-1;setTimeout(()=>{try{UI.go(home());}catch(e){}},0);});
  GAME.on('nedra',()=>{S.bzSt='nedra';});
  GAME.on('gig',gigRes);
  window.BIZUI.ready=true;}
window.BIZUI={ready:false,openChapter,init,render,after,home,hname,back,
  openClose:()=>false,closeExtra,adAllowed,offAd,offline,advOpen,idle,
  // вход снаружи: телефон и сюжет
  open(tab){if(!UI)return;const W=w();if(tab==='biz'||tab==='net'||tab==='pit')V.biz='list';UI.go(tab||home());},
  openGigs(){const W=w();if(!W||W.ned||!W.me)return false;UI.go('gigs');return true;},
  openBiz(id,from){const W=w(),b=W&&W.biz.find(x=>x.id===id);if(!b){this.open('biz');return;}V.biz='pt';V.id=id;const f=from||(isPit(b.t)?'pit':isMid(b.t)?'net':'biz');V.from=f==='today'?'biz':f;UI.go(V.from==='pit'&&!W.ned?'pit':V.from==='net'&&!W.ned?'net':'biz');try{$$('main').scrollTop=0;}catch(e){}},
  openLesson,openIP,openOOO,openNedra,openBizModal,tutStep};
})();
