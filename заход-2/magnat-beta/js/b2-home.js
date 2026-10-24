/* b2-home.js — HOME «Магнат 2.0»: Улица и новое «Сегодня», шапка в 2 ряда, деньги «капают», мелкие награды значком в ★. Стартовый (≤ 8 КБ).
   По требованию: js/b2-home-street.js (Улица; ДОГОВОР УЛИЦЫ — в его шапке и в logs/HOME.md), js/b2-home-fx.js («капает», награды в ★).
   API для других потоков (есть сразу): B2.street.add/scene/pop/dirty, B2.now.add; гнёзда 'top' (HOME), 'home' (строки под целью). */
(function(){'use strict';
B2.off.home=0;
if(B2.off('home'))return;
const D=typeof document!=='undefined';
const reg={add:[],scene:[],now:[]},st={dirty:1,pq:[]};
const byP=(a,b)=>b.p-a.p;
B2.street={add(id,fn,p){reg.add.push({id,fn,p:p==null?50:+p});reg.add.sort(byP);st.dirty=1;},
  scene(id,fn,p){reg.scene.push({id,fn,p:p==null?50:+p});reg.scene.sort(byP);st.dirty=1;},
  pop(t,o){st.pq.push([t,o||{}]);if(window.B2H&&B2H.pop)B2H.pop();},
  dirty(){st.dirty=1;},_r:reg,_s:st};
B2.now={add(id,fn){reg.now.push({id,fn});}};
const s=()=>B2.s('h');
if(!D)return;
/* ---------- стиль: шапка в 2 ряда (телефон < 700 px), «капает», награда в ★ ---------- */
const css=`
html.b2hh #hdr#hdr{display:flex;flex-wrap:wrap;align-items:center}
html.b2hh #hdr#hdr .h1,html.b2hh #hdr#hdr .h2{display:contents}
html.b2hh #hdr#hdr .hname{display:none}
html.b2hh #hdr#hdr .hcash{order:1;flex:1 1 0;min-width:0;margin:0 6px 0 0;position:relative}
html.b2hh #hdr#hdr .hcash small{display:none}
html.b2hh #hdr#hdr .hcash b{display:block;overflow:hidden;font-size:28px}
html.b2hh #hdr#hdr #rkBtn{order:2;margin:0 0 0 6px}html.b2hh #hdr#hdr #crBtn{order:3}html.b2hh #hdr#hdr #btnSet{order:4}
html.b2hh #hdr#hdr .hbr{display:block;order:5;flex:0 0 100%;height:0;margin:0}
html.b2hh #hdr#hdr #psBtn{order:6;margin:6px 6px 0 0;align-self:center}html.b2hh #hdr#hdr #spdBtn{order:7;margin:6px 6px 0 0;align-self:center}
html.b2hh #hdr#hdr .hmon{order:8;flex:1 1 0;min-width:0;max-width:none;margin:6px 0 0 4px}
html.b2hh #hdr#hdr .hmon small{text-align:left;margin-top:3px}
html.b2hh #hdr#hdr #phBtn{order:9;margin:6px 0 0 6px}html.b2hh #hdr#hdr #advMin{order:10;margin:6px 0 0 6px}
html.b2hh #hdr#hdr .hbtn{margin-left:6px}
html.b2td #bzGoal .gv{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}html.b2td #bzGoal .gp2,html.b2td #bzGoal .bz-ck .ok,html.b2td #bzGoal .bz-ck small{display:none}
.b2now .bz-li{width:100%;text-align:left}
@media (max-width:420px){html.b2hh #hdr#hdr #spdBtn .hb-cap{display:none}html.b2hh #hdr#hdr #spdBtn{min-width:48px;font-size:17px}}
`;
document.documentElement.classList.add('b2td');   /* «Сегодня» HOME: цель компактно (выполненное и пояснения — в окне цели) */
const se=document.createElement('style');se.id='b2hCss';se.textContent=css;document.head.appendChild(se);
const ok=()=>window.innerWidth<700&&cashCheck.off!==window.innerWidth+'|'+(S.bigF|0);
function hdrMode(){const on=ok();const h=document.documentElement;if(h.classList.contains('b2hh')!==on){h.classList.toggle('b2hh',on);try{UI.refresh&&UI.hdr?UI.hdr():0;}catch(e){}}}
hdrMode();addEventListener('resize',()=>{clearTimeout(hdrMode.t);hdrMode.t=setTimeout(hdrMode,150);});
/* сумма в шапке слишком мелкая (крупный шрифт на узком телефоне) — для этой ширины старая шапка */
function cashCheck(){const c=document.getElementById('hCash'),h=document.documentElement;if(!c||!h.classList.contains('b2hh'))return;   /* только инлайн-размер от fitCash — без вёрстки */
  const fs=parseFloat(c.style.fontSize);if(fs&&fs<20){cashCheck.off=window.innerWidth+'|'+(S.bigF|0);h.classList.remove('b2hh');B2.ev('home','hd0',{w:window.innerWidth,b:S.bigF|0});}}
/* ---------- «Сегодня»: верх (Улица + «Сейчас») ---------- */
const FN={owl:['Соня','Sonya'],beav:['Борис','Boris'],bars:['Пётр','Pyotr'],vit:['Витя','Vitya'],bear:['Топтыгин','Toptygin']};
const eh=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* «Гонка 11 „Б“» строкой: место по капиталу (STORY.standings) и кто рядом */
function race(W){if(!window.STORY||!STORY.standings||!W.fr||!W.fr.v||W.st==='quarry')return '';let st;try{st=STORY.standings(W);}catch(e){return '';}if(!st||st.length<2)return '';
  const i=st.findIndex(x=>x.id==='you');if(i<0)return '';const o=i>0?st[i-1]:st[1],d=Math.abs(o.v-st[i].v),n=FN[o.id]?L(FN[o.id][0],FN[o.id][1]):o.id;
  const t=i>0?L('впереди ','ahead: ')+n+' (+'+FMT.money(d)+')':n+L(' отстаёт на ',' is behind by ')+FMT.money(d);
  return `<button class="card tap bz-li b2rc noenter" data-frt="1"><span class="bz-ic">🏁</span><span class="f1"><b>${L('Гонка 11 «Б»: вы ','Class 11B race: you’re ')+(i+1)+L('-е из ',' of ')+st.length}</b><small>${eh(t)}</small></span><span class="chev">›</span></button>`;}
/* «Сейчас»: до 3 дел от потоков (B2.now.add), по важности */
function now(W){const it=[];for(const x of reg.now){if(B2.off(x.id))continue;try{(x.fn(W)||[]).forEach(o=>{if(o&&o.t)it.push(o);});}catch(e){}}if(!it.length)return '';
  it.sort((a,b)=>(b.pr||0)-(a.pr||0));return `<div class="card b2now"><div class="bz-lab">⚡ ${L('Сейчас','Right now')}</div>`+it.slice(0,3).map(o=>`<button class="bz-li noenter" data-b2="${eh(o.tap||'')}"><span class="bz-ic">${eh(o.ico||'•')}</span><span class="f1"><b>${eh(o.t)}</b>${o.s?`<small>${eh(o.s)}</small>`:''}</span><span class="chev">›</span></button>`).join('')+'</div>';}
B2.slot('top','home',ctx=>{const W=ctx.W;if(!W||W.ned)return '';return '<div id="b2St" class="b2st" data-keep="1" aria-label="'+L('Улица','Street')+'"></div>'+now(W);},90);
B2.slot('goal','home',ctx=>{const W=ctx.W;if(!W||W.ned)return '';return B2.html('home',ctx)+race(W);},50);
let ld=null;const need=()=>ld||(ld=Promise.all([B2.need('b2-home-street.js')]).catch(e=>{ld=null;throw e;}));
B2.on('today',el=>{cashCheck();hdrMode();const W=GAME.W;if(!W||W.ned)return;need().then(()=>{if(window.B2H)B2H.draw(el,W);}).catch(()=>{});});
B2.on('ready',()=>{need().catch(()=>{});B2.need('b2-home-fx.js').catch(()=>{});if(GAME.on){GAME.on('day',()=>{const W=GAME.W;if(window.B2HF)B2HF.day(W);if(window.B2H&&B2H.day)B2H.day(W);});
  B2.on('rival',()=>{st.dirty=1;});const rs=()=>{st.dirty=1;if(window.B2HF)B2HF.reset();};GAME.on('ipo',rs);GAME.on('reset',rs);GAME.on('rollback',rs);}
  setTimeout(()=>{if(!cashCheck.off)cashCheck();},1500);});
})();
