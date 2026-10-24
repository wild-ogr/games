/* b2-juice-fx.js — JUICE: сцены главных моментов (грузится по требованию из b2-juice.js через B2.need).
   chap(st)       — окно новой главы (biz-ui openChapter): фото главы крупно со «вспышкой», печать ИП/ООО, подарки плашками.
   ipoPre()       — окно «Колокол биржи» (ui.js openIpo): список «что уходит / что остаётся» — под «▼».
   ipoScene(a,q)  — окно «Холдинг на бирже!» (story-ui openIpoScene): бегущая строка, колокол качается и звенит, фото «звонок на бирже», шутка Бориса.
   rank(o)        — окно звания «Магнат» (cab-ui show): грамота крупно.
   Только DOM уже открытого окна (#mcard), рисунки — ART (js/art.js, только чтение). Движение — transform/opacity. */
(function(){'use strict';
if(typeof window==='undefined'||typeof document==='undefined')return;const J=window.B2J;if(!J)return;
const T=J.T,A=()=>window.ART||null;
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const card=()=>document.getElementById('mcard');
const css=document.createElement('style');css.id='b2jCssFx';
const AN='html.lk-a:not(.b2-still):not(.b2j-lite) body.lk-anim:not(.calm)';   // движение только тут; html.b2j-lite и reduced-motion — выкл.
css.textContent=[
'.b2j-ph{position:relative;display:block;width:300px;max-width:84%;margin:8px auto 6px;background:var(--card,#fff);padding:5px;border-radius:6px;box-shadow:0 6px 18px rgba(20,30,50,.22);-webkit-transform:rotate(-1.5deg);transform:rotate(-1.5deg)}',
'.b2j-phw{overflow:hidden;padding:4px 0 14px;margin:0 -2px}',
'.b2j-ph svg{display:block;width:100%;height:auto;border-radius:3px}',
'.b2j-fl{position:absolute;left:0;top:0;width:100%;height:100%;border-radius:6px;background:#fff;opacity:0;pointer-events:none}',
'.b2j-st{position:absolute;right:2px;bottom:-10px;max-width:70%;padding:5px 9px 4px;border:3px double var(--bad,#c62828);border-radius:6px;color:var(--bad,#c62828);background:var(--card,#fff);font:900 19px/1.05 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;text-align:center;letter-spacing:.5px;-webkit-transform:rotate(-11deg);transform:rotate(-11deg);pointer-events:none}',
'.b2j-st small{display:block;font-size:10.5px;font-weight:800;letter-spacing:.6px}',
'.b2j-gift{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-justify-content:center;justify-content:center;margin:6px 0 4px}',
'.b2j-gift span{margin:3px;padding:7px 12px;border-radius:999px;background:var(--lk-app,#eef2f8);color:var(--ink,#1d2733);font-weight:700;font-size:16px;line-height:1.2;white-space:nowrap}',
'.b2j-tk{overflow:hidden;margin:-4px 56px 8px -4px;border-radius:8px;background:#1f2a44;color:#e8eefc;font:700 15px/32px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;white-space:nowrap;height:32px}',
'.b2j-tk b{color:#43d17a}.b2j-tki{display:inline-block;padding-left:10px}',
'.b2j-ih{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;margin:2px 0 4px}',
'.b2j-ih h2{margin:0 0 2px!important;font-size:22px}.b2j-ih p{margin:0;color:var(--muted,#4f5d72);font-size:16px}',
'.b2j-bell{-webkit-flex:none;flex:none;width:56px;height:56px;margin-right:12px;-webkit-transform-origin:50% 8%;transform-origin:50% 8%}.b2j-bell svg{display:block;width:100%;height:100%}',
'.b2j-bor{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-justify-content:center;justify-content:center;text-align:center;margin:10px 0 2px;font-size:16px;color:var(--muted,#4f5d72)}',
'.b2j-gr{display:block;width:120px;margin:4px auto 2px}.b2j-gr svg{display:block;width:100%;height:auto}',
'details.b2j-ipl>summary{cursor:pointer;min-height:48px;line-height:48px;font-weight:700;color:var(--blue,#1f5f99)}',
AN+' .b2j-ph.go{-webkit-animation:b2jPop .5s cubic-bezier(.2,.9,.3,1.25) both;animation:b2jPop .5s cubic-bezier(.2,.9,.3,1.25) both}',
AN+' .b2j-ph.go .b2j-fl{-webkit-animation:b2jFl .55s ease-out .08s both;animation:b2jFl .55s ease-out .08s both}',
AN+' .b2j-ph.go .b2j-st{-webkit-animation:b2jSt .32s cubic-bezier(.3,.6,.4,1.4) .65s both;animation:b2jSt .32s cubic-bezier(.3,.6,.4,1.4) .65s both}',
AN+' .b2j-gift.go span{-webkit-animation:b2jUp .35s ease-out both;animation:b2jUp .35s ease-out both}',
AN+' .b2j-gift.go span:nth-child(2){-webkit-animation-delay:.1s;animation-delay:.1s}'+AN+' .b2j-gift.go span:nth-child(3){-webkit-animation-delay:.2s;animation-delay:.2s}',
AN+' .b2j-tk.go .b2j-tki{padding-left:100%;-webkit-animation:b2jTk 14s linear .3s 3 both;animation:b2jTk 14s linear .3s 3 both}',
AN+' .b2j-bell.go{-webkit-animation:b2jBell .62s ease-in-out 3 both;animation:b2jBell .62s ease-in-out 3 both}',
AN+' .b2j-gr.go{-webkit-animation:b2jPop .5s cubic-bezier(.2,.9,.3,1.25) both;animation:b2jPop .5s cubic-bezier(.2,.9,.3,1.25) both}',
'@-webkit-keyframes b2jPop{0%{opacity:0;-webkit-transform:scale(.6) rotate(-7deg)}100%{opacity:1;-webkit-transform:scale(1) rotate(-1.5deg)}}',
'@keyframes b2jPop{0%{opacity:0;transform:scale(.6) rotate(-7deg)}100%{opacity:1;transform:scale(1) rotate(-1.5deg)}}',
'@-webkit-keyframes b2jFl{0%{opacity:.95}100%{opacity:0}}@keyframes b2jFl{0%{opacity:.95}100%{opacity:0}}',
'@-webkit-keyframes b2jSt{0%{opacity:0;-webkit-transform:scale(2.6) rotate(-20deg)}100%{opacity:1;-webkit-transform:scale(1) rotate(-11deg)}}',
'@keyframes b2jSt{0%{opacity:0;transform:scale(2.6) rotate(-20deg)}100%{opacity:1;transform:scale(1) rotate(-11deg)}}',
'@-webkit-keyframes b2jUp{0%{opacity:0;-webkit-transform:translateY(10px)}100%{opacity:1;-webkit-transform:none}}@keyframes b2jUp{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}',
'@-webkit-keyframes b2jTk{0%{-webkit-transform:translateX(0)}100%{-webkit-transform:translateX(-100%)}}@keyframes b2jTk{0%{transform:translateX(0)}100%{transform:translateX(-100%)}}',
'@-webkit-keyframes b2jBell{0%,100%{-webkit-transform:rotate(0)}25%{-webkit-transform:rotate(16deg)}75%{-webkit-transform:rotate(-16deg)}}@keyframes b2jBell{0%,100%{transform:rotate(0)}25%{transform:rotate(16deg)}75%{transform:rotate(-16deg)}}',
'@media (prefers-reduced-motion:reduce){.b2j-ph.go,.b2j-ph.go .b2j-fl,.b2j-ph.go .b2j-st,.b2j-gift.go span,.b2j-tk.go .b2j-tki,.b2j-bell.go,.b2j-gr.go{-webkit-animation:none!important;animation:none!important}.b2j-tk .b2j-tki{padding-left:10px!important}}',
'html.b2j-lite .b2j-ph.go,html.b2j-lite .b2j-ph.go *,html.b2j-lite .b2j-gift.go span,html.b2j-lite .b2j-bell.go,html.b2j-lite .b2j-gr.go{-webkit-animation:none!important;animation:none!important}html.b2j-lite .b2j-tk .b2j-tki{-webkit-animation:none!important;animation:none!important;padding-left:10px!important}',
'body.calm .b2j-tk .b2j-tki{padding-left:10px}',
'body.th-dark .b2j-fl{background:#fff}'
].join('\n');
(document.head||document.documentElement).appendChild(css);

/* ------------- праздник главы ------------- */
const SC={small:'ph_small',mid:'ph_mid',quarry:'ph_quarry',nedra:'ph_nedra'};
const STAMP={small:()=>[T('ИП','SOLE TRADER'),T('ЗАРЕГИСТРИРОВАНО','REGISTERED')],mid:()=>[T('ООО','LLC'),T('ЗАРЕГИСТРИРОВАНО','REGISTERED')]};
const ACHK={mid:'z_ooo',quarry:'z_quarry',nedra:'z_nedra'};
const seen={};   // звук и движение — один раз на показ главы (перерисовка при смене языка — без повторов)
J.chap=function(st){const m=card(),A0=A();if(!m||!A0||!SC[st])return;const box=m.querySelector('.bz-ch');if(!box||m.querySelector('.b2j-ph'))return;
  const h2=box.querySelector('h2');if(!h2)return;
  const sp=STAMP[st]?STAMP[st]():null;
  const ph=document.createElement('div');ph.className='b2j-ph';
  ph.innerHTML=A0.scene(SC[st],{hero:A0.me()})+'<i class="b2j-fl"></i>'+(sp?'<span class="b2j-st">'+esc(sp[0])+'<small>'+esc(sp[1])+'</small></span>':'');
  const wr=document.createElement('div');wr.className='b2j-phw';wr.appendChild(ph);h2.parentNode.insertBefore(wr,h2.nextSibling);   // обёртка режет «удар» печати и наклон — без прокрутки вбок
  // подарки — плашками вместо строки «📷 На Стену почёта — фото «…» · ★ +3» (саму маленькую фотографию CAB.chLine убираем: она теперь крупно)
  const sm=m.querySelector('.cb-chp');if(sm)sm.parentNode.removeChild(sm);
  const ln=m.querySelector('p.cb-mut');let cr=0;try{const k=ACHK[st];if(k&&S.crE&&S.crE[k]&&ECON.BIZ_ACH)cr=ECON.BIZ_ACH[k]||0;}catch(e){}
  if(ln&&/★/.test(ln.textContent)){const g=document.createElement('div');g.className='b2j-gift';
    g.innerHTML='<span>📷 '+esc(T('Фото на Стену','Photo for the Wall'))+'</span><span>★ +3</span>'+(cr?'<span>💎 +'+cr+'</span>':'');ln.parentNode.replaceChild(g,ln);}
  const k=st+':'+((GAME.W&&GAME.W.t)|0),first=!seen[k];seen[k]=1;
  if(first&&J.anim()){ph.classList.add('go');const g=m.querySelector('.b2j-gift');if(g)g.classList.add('go');}
  if(first&&sp)setTimeout(()=>J.play('stamp'),780);   // глава уже звучит фанфарой (SND.win) — печать только у ИП/ООО
  try{B2.ev('juice','chap',{st});}catch(e){}};

/* ------------- IPO: окно перед колоколом ------------- */
J.ipoPre=function(){const m=card();if(!m||m.querySelector('.b2j-ipl'))return;const tip=[].slice.call(m.querySelectorAll('.tip')).find(x=>x.querySelector('ul'));if(!tip)return;
  const d=document.createElement('details');d.className='b2j-ipl';d.innerHTML='<summary>📦 '+esc(T('Что уходит со старым холдингом и что остаётся','What stays with the old holding and what you keep'))+'</summary>';
  tip.parentNode.insertBefore(d,tip);d.appendChild(tip);};

/* ------------- IPO: «Холдинг на бирже!» ------------- */
const BELL='<svg viewBox="0 0 60 60" aria-hidden="true"><rect x="27" y="2" width="6" height="8" rx="2" fill="#8a6a1a"/><path d="M12 44 Q12 14 30 10 Q48 14 48 44 Z" fill="#e8b830"/><path d="M18 40 Q18 18 30 14 Q24 20 23 40 Z" fill="#f7d774" opacity=".8"/><rect x="8" y="42" width="44" height="6" rx="3" fill="#b8860b"/><circle cx="30" cy="52" r="5" fill="#8a6a1a"/></svg>';
function ipoPct(eq){const x=Math.abs(Math.round((eq||0)/1e6))%71;return (8+x/10).toFixed(1).replace('.',T(',','.'));}   // «первый день торгов»: +8,0…+15,0 % — от суммы, без случайности
J.ipoScene=function(a,qid){const m=card(),A0=A();if(!m||!A0||m.querySelector('.b2j-tk'))return;a=a||{};
  const h2=m.querySelector('h2');if(!h2)return;
  const eq=a.eq||0,hd=a.h0||1,mny=FMT.money(eq),p=ipoPct(eq),tick=T('МАГН','MAGN');
  const item=T(`<b>${tick} ▲ +${p} %</b> · ${mny} · Холдинг №${hd} на бирже · Людмила Санна плачет от счастья · Борис: «Ну ладно. Ладно!» · `,`<b>${tick} ▲ +${p}%</b> · ${mny} · Holding No. ${hd} is listed · Lyudmila Sanna is crying with joy · Boris: “Fine. Fine!” · `);
  const tk=document.createElement('div');tk.className='b2j-tk';tk.setAttribute('aria-hidden','true');tk.innerHTML='<span class="b2j-tki">'+item+item+'</span>';
  const ih=document.createElement('div');ih.className='b2j-ih';
  ih.innerHTML='<span class="b2j-bell">'+BELL+'</span><div><h2>'+esc(T('Дзынь! Вы на бирже','Ding! You’re public'))+'</h2><p>'+esc(T('Холдинг №'+hd+' · '+mny,'Holding No. '+hd+' · '+mny))+'</p></div>';
  const ph=document.createElement('div');ph.className='b2j-ph';ph.innerHTML=A0.scene('ph_ipo',{hero:A0.me()})+'<i class="b2j-fl"></i>';
  const bo=document.createElement('p');bo.className='b2j-bor';bo.textContent=T('Борис просил передать: «Ну ладно. Ладно!»','Boris asked to pass on: “Fine. Fine!”');   // текст прямо во flex — словарик его не размечает (там «про…» не термин)
  const par=h2.parentNode,wr=document.createElement('div');wr.className='b2j-phw';wr.appendChild(ph);par.insertBefore(tk,h2);par.insertBefore(ih,h2);par.insertBefore(wr,h2);par.insertBefore(bo,h2);par.removeChild(h2);
  const k='ipo:'+(qid||hd),first=!seen[k];seen[k]=1;
  if(J.anim()){tk.classList.add('go');if(first){ih.querySelector('.b2j-bell').classList.add('go');ph.classList.add('go');}}
  if(first){setTimeout(()=>J.play('bell'),250);try{B2.ev('juice','ipo',{h:hd});}catch(e){}}};

/* ------------- звание «Магнат»: грамота крупно ------------- */
J.rank=function(o){const m=card(),A0=A();if(!m||!A0||m.querySelector('.b2j-gr'))return;const e=m.querySelector('.rw-e');if(!e)return;
  const g=document.createElement('span');g.className='b2j-gr';g.innerHTML=A0.gram('👑');e.parentNode.replaceChild(g,e);
  const k='rk:'+(S.rk|0),first=!seen[k];seen[k]=1;if(first&&J.anim())g.classList.add('go');};   // звук — фанфара окна звания (один звук на событие)
})();
