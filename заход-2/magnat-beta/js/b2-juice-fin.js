/* b2-juice-fin.js — JUICE: Финансы → «Итоги» сначала картинкой (грузится по требованию; крючок — fin.js renderFin → B2.emit('finSum', el, w)).
   Сверху: лицо Людмилы по итогу + одна строка («+968 тыс. ₽ · лучший месяц за год ▲»), столбики прибыли за 12 месяцев,
   «Куда ушла выручка» — водопад полосками. Абзац Людмилы — под «▼» (термины и отчёты не трогаем: БДР/ДДС/Баланс — ниже, как были).
   Только чтение мира: последний отчёт W.reps и W.hist. Без движения. */
(function(){'use strict';
if(typeof window==='undefined'||typeof document==='undefined')return;const J=window.B2J;if(!J)return;
const T=J.T,E=()=>window.ECON;
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const css=document.createElement('style');css.id='b2jCssFin';
css.textContent=[
'.b2j-fv{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center}',
'.b2j-fv .pp{-webkit-flex:none;flex:none;width:64px;height:64px;margin-right:12px}.b2j-fv .pp svg{width:64px;height:64px;display:block}',
'.b2j-fv b.big{display:block;font-size:26px;line-height:1.15;font-weight:800}.b2j-fv .ln{font-size:16px;color:var(--muted,#4f5d72);margin-top:2px}',
'.b2j-pos{color:var(--good,#0a7a3a)}.b2j-neg{color:var(--bad,#c62828)}',
'.b2j-bars{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:flex-end;align-items:flex-end;height:74px;margin:12px 0 2px}',
'.b2j-bars .cb{-webkit-box-flex:1;-webkit-flex:1;flex:1;height:100%;margin:0 2px;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;-webkit-justify-content:flex-end;justify-content:flex-end;-webkit-align-items:center;align-items:center}',
'.b2j-bars .cb i{display:block;width:100%;max-width:22px;min-height:2px;border-radius:4px 4px 0 0;background:var(--good,#0a7a3a);opacity:.45}',
'.b2j-bars .cb i.neg{background:var(--bad,#c62828)}.b2j-bars .cb i.last{opacity:1}',
'.b2j-bars .cb span{font-size:14px;color:var(--muted,#4f5d72);line-height:18px;height:18px}',
'.b2j-cap{text-align:center;font-size:14px;color:var(--muted,#4f5d72)}',
'.b2j-wf .t{font-weight:700;margin:0 0 6px}',
'.b2j-wr{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;min-height:34px}',
'.b2j-wr .wl{-webkit-flex:0 0 42%;flex:0 0 42%;font-size:15px;line-height:1.2;padding-right:6px}',
'.b2j-wr .wt{-webkit-box-flex:1;-webkit-flex:1;flex:1;height:14px;border-radius:7px;background:var(--track,var(--line,#e3e8ee));overflow:hidden;position:relative}',
'.b2j-wr .wt i{position:absolute;top:0;height:100%;border-radius:7px;background:var(--bad,#c62828);opacity:.75}',
'.b2j-wr .wt i.rev{background:var(--blue,#1f5f99);opacity:.8}.b2j-wr .wt i.pr{background:var(--good,#0a7a3a);opacity:1}',
'.b2j-wr b{-webkit-flex:0 0 auto;flex:0 0 auto;min-width:86px;text-align:right;font-size:15px;padding-left:6px;white-space:nowrap}',
'details.b2j-sd>summary{cursor:pointer;min-height:48px;line-height:48px;padding:0 14px;font-weight:700;color:var(--blue,#1f5f99)}',
'details.b2j-sd{margin-bottom:10px}details.b2j-sd>.f-say{margin-top:0}'
].join('\n');
(document.head||document.documentElement).appendChild(css);

const money=x=>FMT.money(x),sg=x=>(x>0?'+':x<0?'−':'')+money(Math.abs(x));
J.fin=function(el,w){if(!el||!w||el.querySelector('.b2j-fv'))return;const R=w.reps&&w.reps[w.reps.length-1];if(!R||!R.pl)return;
  const say=el.querySelector('.f-say');if(!say)return;
  const q=R.pl,net=E().netOf(q),rev=q.rev||0,hs=(w.hist||[]).slice(-12),P=w.reps[w.reps.length-2];
  const prev=hs.filter(x=>x.m!==R.m).map(x=>x.np),best=prev.length>=3&&net>0&&net>Math.max.apply(null,prev);
  let ln=FMT.date(R.m);
  if(best)ln+=' · '+T('лучший месяц за год ▲','best month of the year ▲');
  else if(P&&P.pl){const d=net-E().netOf(P.pl);if(Math.abs(d)>=1)ln+=' · '+(d>0?'▲ ':'▼ ')+sg(d)+T(' к прошлому',' vs last month');}
  const mood=net>0?(best?'wow':'happy'):rev>0?'worry':'calm';
  let face='';try{face=(window.UI&&UI.face)?UI.face(mood):advisorSvg(mood);}catch(e){}
  // столбики прибыли за 12 месяцев
  let bars='';if(hs.length>=2){const mx=Math.max.apply(null,hs.map(x=>Math.abs(x.np)))||1;
    bars='<div class="b2j-bars" aria-hidden="true">'+hs.map((x,i)=>'<div class="cb"><i class="'+(x.np<0?'neg ':'')+(i===hs.length-1?'last':'')+'" style="height:'+Math.max(3,Math.round(Math.abs(x.np)/mx*56))+'px"></i><span>'+esc(FMT.mon(x.m).charAt(0))+'</span></div>').join('')+'</div>'
      +'<div class="b2j-cap">'+esc(T('прибыль за '+hs.length+' '+pl(hs.length,'месяц','месяца','месяцев','month','months'),'profit over '+hs.length+' months'))+'</div>';}
  const top=document.createElement('div');top.className='f-card';
  top.innerHTML='<div class="b2j-fv"><span class="pp">'+face+'</span><div><b class="big b2-num '+(net>=0?'b2j-pos':'b2j-neg')+'">'+esc(sg(net))+'</b><div class="ln">'+esc(ln)+'</div></div></div>'+bars;
  // «Куда ушла выручка»: выручка → товар → аренда/зарплаты/расходы → амортизация → налог и проценты → прочее → прибыль
  let wf='';if(rev>0){const n=k=>Math.max(0,q[k]||0),cg=n('cogs'),op=n('fix')+n('log')+n('adm')+n('expl'),dp=n('dep'),ti=n('tax')+n('int');
    const oth=net-(rev-cg-op-dp-ti);   // прочее со знаком: доходы/расходы вне строк (СП, дивиденды старого холдинга…) — сводит ровно к чистой
    const rows=[[T('Выручка','Revenue'),rev,'rev'],[T('Товар и сырьё','Goods and materials'),-cg],[T('Аренда и зарплаты','Rent and wages'),-op],[T('Амортизация','Depreciation'),-dp],[T('Налог и проценты','Tax and interest'),-ti],[T('Прочее','Other'),oth],[T('Чистая прибыль','Net profit'),net,'pr']].filter((r,i)=>i===0||i===6||Math.abs(r[1])>=rev*.005);
    let lvl=rev;const pc=x=>Math.max(0,Math.min(100,x/rev*100));
    wf='<div class="f-card b2j-wf"><div class="t">'+esc(T('Куда ушла выручка','Where the revenue went'))+'</div>'+rows.map(r=>{let a,b,cls=r[2]||'';
      if(cls==='rev'){a=0;b=rev;}else if(cls==='pr'){a=0;b=Math.max(0,net);}else{const to=lvl+r[1];a=Math.min(lvl,to);b=Math.max(lvl,to);lvl=to;if(r[1]>0)cls='pr';}
      return '<div class="b2j-wr"><span class="wl">'+esc(r[0])+'</span><span class="wt"><i class="'+cls+'" style="left:'+pc(a).toFixed(1)+'%;width:'+Math.max(.8,pc(b)-pc(a)).toFixed(1)+'%"></i></span><b class="b2-num '+(cls==='rev'?'':r[1]<0?'b2j-neg':'b2j-pos')+'">'+esc(cls==='rev'?money(rev):sg(r[1]))+'</b></div>';}).join('')+'</div>';}
  const d=document.createElement('details');d.className='b2j-sd';d.innerHTML='<summary>▼ '+esc(T('Что говорит Людмила Санна','What Lyudmila Sanna says'))+'</summary>';
  say.parentNode.insertBefore(top,say);if(wf)top.insertAdjacentHTML('afterend',wf);
  const after=wf?top.nextElementSibling:top;after.parentNode.insertBefore(d,after.nextSibling);d.appendChild(say);};
})();
