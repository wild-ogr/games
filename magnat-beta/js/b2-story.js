/* b2-story.js — STORY: сериал «11 „Б“» (сезоны и серии), арки краёв №2–№5, финал «Корпорация», «Вестник района», «Итоги года». 18.10.2026.
   По требованию: b2-story-txt.js (серии, тексты арок), b2-story-news.js (вырезка, итоги года), b2-story-fin.js (финал).
   ДОГОВОР: KRAI — край W.b2.krai.id (или B2.krai.id(W)): yak|nor|sah|alt, финал corp (запасной путь — W.b2.krai.id; если B2.krai есть,
   а id нет — по номеру холдинга: 2 Якутия … 5 Алтай). Финал — W.hold ≥ 6 или B2.emit('final'). Шина: B2.emit('story-ep',{k,n}), 'story-final'.
   Мир: W.b2.story {nh:[последние вырезки]}. Устройство: S.b2s {r:номер «заново», n:серий, e:{сцена:номер*100+сезон}, c:{сцена:ответ}, f:финал}. */
(function(root){'use strict';
const B2=root.B2;B2.off.story=0;if(B2.off('story'))return;
const DOM=typeof document!=='undefined';
const KR=['yak','nor','sak','alt'];
// арки краёв: [кто, большая, месяц от начала холдинга | 'i' — перед IPO края, ❤ за «а», ❤ за «б»]
const KA={yak:[['vit',1,1,6,2],['bars',0,5,6,3],['owl',0,10,5,3],['beav',0,15,6,2],['bear',1,'i',0,0]],
  nor:[['bars',1,1,6,2],['vit',0,5,6,3],['lud',0,10,0,0],['owl',0,15,6,2],['beav',1,'i',5,5]],
  sak:[['beav',1,1,6,2],['vit',0,5,6,2],['bars',0,10,6,3],['owl',0,15,5,3],['bear',1,'i',0,0]],
  alt:[['owl',1,1,6,2],['lud',0,5,0,0],['vit',0,10,6,3],['bars',0,15,6,2],['beav',1,'i',6,6]]};
const SER_X={rq:1,reu:1,pro:1,ipo:1};const SPEC={mem:1,ludcall:1,help:1};
let TX=null,NEWS=null,FIN=null;const fin={on:0};
function st(){const s=B2.s('s');let r=0;try{r=typeof S!=='undefined'&&S?S.rst|0:0;}catch(e){}
  if(s.r!==r||typeof s.e!=='object'||!s.e){for(const k in s)delete s[k];s.r=r;s.n=0;s.e={};s.c={};}if(!s.c||typeof s.c!=='object')s.c={};return s;}
function pick(k,o){try{if(typeof S!=='undefined'&&S)st().c[k]=o;}catch(e){}}
function kraiId(W){if(!W)return '';let x='';try{if(B2.krai&&typeof B2.krai.id==='function')x=B2.krai.id(W)||'';}catch(e){}
  if(!x&&W.b2&&W.b2.krai&&typeof W.b2.krai.id==='string')x=W.b2.krai.id;
  if(!x&&B2.krai&&!B2.off('krai')&&W.hold>=2&&W.hold<=5)x=KR[W.hold-2];x=String(x).slice(0,3).toLowerCase();if(x==='sah')x='sak';return KR.indexOf(x)>=0?x:'';}
const isCorp=W=>!!(W&&W.b2&&W.b2.krai&&W.b2.krai.id==='corp');
function mH(W,F){return W.m-(typeof F.h0==='number'?F.h0:W.m);}
function ipoNear(W){const E=root.ECON;try{return E.equity(W)>=E.ipoEq(W)*.7;}catch(e){return false;}}
// сцены арок — в модель сюжета (story.js); тексты — STORYUI.SC из b2-story-txt.js
function reg(){const Y=root.STORY;if(!Y||!Y.SC||Y.SC.yak1)return;
  for(const K of KR)KA[K].forEach((x,i)=>{const k=K+(i+1),w=x[0],big=x[1],at=x[2];
    Y.SC[k]={w,big,when:(W,F)=>kraiId(W)===K&&(at==='i'?ipoNear(W)&&mH(W,F)>=6:mH(W,F)>=at),
      o:{a:{fx:(W,F)=>{pick(k,'a');if(Y.yes&&Y.FR.indexOf(w)>=0)Y.yes(F,w);return Y.tr?Y.tr(F,w,x[3]):0;}},b:{fx:(W,F)=>{pick(k,'b');return Y.tr?Y.tr(F,w,x[4]):0;}}}};
    if(Y.ORDER.indexOf(k)<0)Y.ORDER.push(k);});}
reg();
/* сезон: главы 1–5, края, финал */
const CH=[['Подработка','Side jobs'],['Своё дело','My own business'],['Сеть','The chain'],['Карьер','The quarry'],['Недра','Mining']];
const KN={yak:['Якутия','Yakutia'],nor:['Норильск','Norilsk'],sak:['Сахалин','Sakhalin'],alt:['Алтай','Altai']};
function season(W){if(!W)return null;let n,x;
  if(!W.ned){n=Math.max(0,['gig','small','mid','quarry'].indexOf(W.st||'gig'))+1;x=CH[n-1];}
  else if((W.hold||1)<=1){n=5;x=CH[4];}
  else{n=Math.min(9,4+W.hold);const k=kraiId(W);x=KN[k]||['Холдинг №'+W.hold,'Holding No. '+W.hold];}
  return {n,ru:x[0],en:x[1]};}
const L_=(r,e)=>typeof L==='function'?L(r,e):r;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function need(f){return B2.need(f).catch(()=>{});}
function loadTx(){return need('b2-story-txt.js');}
function epNum(q){const s=st();if(!s.n){try{const F=root.GAME.W.fr;for(const k in F.dn)if(F.dn[k]>=0&&root.STORY.SC[k]&&!SPEC[k])s.n++;}catch(e){}}
  if(!s.e[q.k]){const se=season(root.GAME&&GAME.W);s.n++;s.e[q.k]=s.n*100+(se?se.n:0);B2.ev('story','ep',{k:q.k,n:s.n});B2.emit('story-ep',{k:q.k,n:s.n});}
  return Math.floor(s.e[q.k]/100);}
/* крючки story-ui: шапка серии и «В следующей серии…» */
function ep(q,title,h){if(!q||SER_X[q.k])return h;const se=season(root.GAME&&GAME.W);if(!se)return h;
  const t=TX&&TX.title(q.k);let k='📺 '+L_('Сезон '+se.n+' «'+se.ru+'» · ','Season '+se.n+' “'+se.en+'” · ');
  k+=SPEC[q.k]?L_('спецвыпуск','special'):L_('Серия','Episode')+' '+epNum(q);
  return '<p class="b2s-ep">'+esc(k)+'</p>'+(!title&&t?'<h2>'+esc(t)+'</h2>':'')+h;}
function nx(q){if(!DOM||!q||SER_X[q.k]||!TX)return;const t=TX.next(root.GAME&&GAME.W,q);if(!t)return;
  const c=document.getElementById('mcard');if(!c)return;const rows=c.querySelectorAll('.row'),r=rows[rows.length-1];if(!r)return;
  r.insertAdjacentHTML('beforebegin','<p class="b2s-nx">🎬 <b>'+esc(L_('В следующей серии','Next time'))+':</b> '+esc(t)+'</p>');}
/* финал «Корпорация» — после 5-го края (W.hold ≥ 6) */
function finDue(){const W=root.GAME&&GAME.W;return !!W&&(W.hold>=6||fin.on||isCorp(W))&&!st().f;}
function finOpen(re){return need('b2-story-fin.js').then(()=>{FIN=B2.storyFin;if(FIN)FIN.open(re);});}
B2.on('final',()=>{fin.on=1;});
B2.win({id:'story-final',o:'story',prio:70,after:true,ok:finDue,show:()=>finOpen()});
function finWatch(){if(!DOM||!finDue())return;let t0=Date.now(),free=0;const tk=()=>{if(!finDue()||Date.now()-t0>240000)return;
  const busy=(typeof modalOn!=='undefined'&&modalOn)||(root.GAME&&GAME.hold&&GAME.hold.size);free=busy?0:free+1;if(free>=3)return finOpen();setTimeout(tk,700);};setTimeout(tk,2500);}
/* «Вестник района» и «Итоги года» — в окне «Закрытие месяца» */
B2.slot('close','story',c=>{if(!NEWS){need('b2-story-news.js');return '';}return NEWS.html(c.W,c.rep);},20);
B2.slot('cab','story',c=>{const s=st();if(!s.n&&!s.f)return '';loadTx();
  return '<button class="btn w noenter" data-b2="story:list">📺 '+esc(L_('Сериал «11 „Б“»','The 11B series'))+' · '+s.n+' '+esc(L_('серий','episodes'))+'</button>'+(s.f?'<button class="btn w noenter" data-b2="story:fin">🎓 '+esc(L_('Встреча 11 «Б» — пересмотреть финал','Class 11B reunion — replay the finale'))+'</button>':'');},15);
B2.click('story',a=>{if(a==='fin')finOpen(1);else if(a==='list')loadTx().then(()=>{if(TX)TX.list(st());});});
B2.mig('story',(W,o)=>{if(!Array.isArray(o.nh))o.nh=[];if(o.nh.length>12)o.nh=o.nh.slice(-12);});
let warm=0;function warmUp(){if(warm)return;warm=1;loadTx();need('b2-story-news.js');}
if(root.GAME&&GAME.on){GAME.on('day',warmUp);GAME.on('ipo',()=>setTimeout(finWatch,1500));}
B2.on('enter',()=>{if(finDue())need('b2-story-fin.js');});
/* «Итоги года» по настоящей дате: 28.12–10.01, один раз за год — окно при входе (вид — b2-story-news.js) */
function realYear(){const d=new Date(root.nowMs?root.nowMs():Date.now()),mo=d.getMonth(),dd=d.getDate();return mo===11&&dd>=28?d.getFullYear():mo===0&&dd<=10?d.getFullYear()-1:0;}
B2.win({id:'story-year',o:'story',prio:55,ok:()=>{const y=realYear(),W=root.GAME&&GAME.W;return !!y&&!!W&&(W.hist||[]).length>=6&&st().yr!==y;},
  show:()=>need('b2-story-news.js').then(()=>{const y=realYear();st().yr=y;if(NEWS)NEWS.yearWin(y);})});
B2.story={v:1,ep,nx,season,kraiId,KR,KA,st,pick,mH,set:(k,o)=>{if(k==='tx')TX=o;else if(k==='news')NEWS=o;},esc,L:L_,finDue};
})(typeof window!=='undefined'?window:globalThis);
