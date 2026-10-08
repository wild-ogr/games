/* ================= OB:META1 — праздники FEST и «Ночь нечисти» (Выпуск 1; план 03-meta.md §4.3) =================
   Модуль праздников — js/fest.js (общий, ~/Projects/hobby-analytics/fest; обновлять fest-sync.sh js/fest.js). Тут — запуск и награды Обороны.
   «Ночь нечисти» = праздник hw26 (26.10–02.11; на Яндексе FEST.name → «Осенний вечер», в VK — «Ночь нечисти»):
   - ночное оформление меню (FEST deco:'night'), в бою — лунная дымка и болотные огоньки (крючок DRAW; во время боя слой #festFx спрятан);
   - «Испытание ночи» раз в день: пройденный уровень по дате (не босс), нечисти вдвое больше; первая победа за день — «лунный сундук» (золото как у испытания дня);
   - задание праздника: одолей 1000 нечисти (любые бои) → облик «Полуночный» на все заставы навсегда (FEST.give('hw26','main')).
   - 04.11 «Выходной во дворе» (vyh26) — двойная награда за вход (js/meta-ret.js, loginGive).
   Сейв: S.fest (модуль FEST: застали/выдано), S.festK {hw26: одолено за праздник}, S.festN {hw26: день последнего лунного сундука}. Облако — объединение/максимум. */
const FEST_HW='hw26',FEST_GOAL=1000;
let festSt=null,festPend=null;
function festName(){return PLAT==='vk'&&LANG!=='en'?'Ночь нечисти':FEST.name(FEST_HW);}
function festOn(){return typeof FEST!=='undefined'&&FEST.on(FEST_HW);}
function festK(){return (S.festK&&S.festK[FEST_HW])|0;}
/* уровень «Испытания ночи» — по дню праздника из пройденных (как испытание дня: без боссов и «стен» DCH_SKIP) */
function festLevel(){const done=Object.keys(S.stars).filter(k=>{if(!S.stars[k]||!/^\d+-\d+$/.test(k))return false;const q=k.split('-').map(Number);return dchLevelOk(q[0],q[1]);}).sort();
  if(!done.length)return null;const R=mulberry(+FEST.today().replace(/-/g,'')*13+7);R();const q=done[Math.floor(R()*done.length)].split('-').map(Number);return {c:q[0],l:q[1]};}
function festNightGot(){return !!(S.festN&&S.festN[FEST_HW]===FEST.today());}
function festStart(){const L=festLevel();if(!L)return;hideModal();festPend={c:L.c,l:L.l};FEST.use(FEST_HW,'night');startLevel(L.c,L.l);
  voice(Lg('Ночь нечисти! Нечисти сегодня вдвое больше — держи заставу до рассвета!','Night of monsters! Twice as many monsters tonight — hold the outpost till dawn!'),VOEV(),'voevoda',6);}
function festOpen(){if(!festOn())return;STAT.screen('fest');const k=Math.min(FEST_GOAL,festK()),got=FEST.got(FEST_HW,'main'),L=festLevel(),ng=festNightGot(),left=FEST.left(FEST_HW);
  showModal('<h3>🌙 '+festName()+'</h3><p class="sub">'+Lg('Нечисть разгулялась! Праздник идёт '+(left<=1?'последний день':'ещё '+left+' '+plural(left,'день','дня','дней'))+'.','The monsters are on the loose! The holiday lasts '+(left<=1?'one last day':left+' more days')+'.')+'</p>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic('ti_arch_3~night',112)+'" alt=""><div class="t"><b>'+Lg('Одолей '+fmtNum(FEST_GOAL)+' нечисти','Defeat '+fmtNum(FEST_GOAL)+' monsters')+'</b><span>'+
      (got?Lg('✅ Облик «Полуночный» твой — навсегда!','✅ The “Midnight” look is yours — forever!'):Lg('Награда: облик «Полуночный» на все заставы, навсегда. Считаются любые бои.','Reward: the “Midnight” look for all outposts, forever. Any battle counts.'))+'</span>'+
      '<div class="bar"><i style="width:'+Math.round(k/FEST_GOAL*100)+'%"></i></div><span>'+fmtNum(k)+' / '+fmtNum(FEST_GOAL)+'</span></div></div></div>'+
    (L?'<div class="card"><b>'+Lg('⚔ Испытание ночи','⚔ Night trial')+' · '+CH[L.c].levels[L.l]+'</b><br><span class="note">'+Lg('Нечисти вдвое больше. ','Twice as many monsters. ')+(ng?Lg('Лунный сундук сегодня взят — новое испытание завтра.','Today’s moon chest is taken — a new trial tomorrow.'):Lg('Первая победа за день — лунный сундук: +'+fmtGold(dchGold()),'First win of the day — a moon chest: +'+fmtGold(dchGold())))+'</span>'+
      '<div class="btns" style="margin-top:8px"><button class="btn big" id="fsGo">'+swordImg()+Lg(' Принять вызов',' Accept the challenge')+'</button></div></div>':'')+
    '<div class="btns"><button class="btn ghost" id="fsX">'+Lg('Закрыть','Close')+'</button></div>');
  on('fsGo',festStart);on('fsX',hideModal);try{STAT.ev('fest',{e:FEST_HW,a:'open'});}catch(e){}}
/* задание выполнено — выдать облик (зовём вне боя: в END и при входе) */
function festCheck(){if(!festOn()||festK()<FEST_GOAL||FEST.got(FEST_HW,'main'))return '';if(!FEST.give(FEST_HW,'main'))return '';
  retSkinAll('night');for(const t of TW_ORDER)S.skin[t]='night';save();return Lg('🌙 Облик «Полуночный» — твой! Надет на все заставы.','🌙 The “Midnight” look is yours! Put on all outposts.');}
/* ночь в бою: лунная дымка и болотные огоньки (мировые координаты, после нечисти) */
function festDraw(c,G){const k=G.festN?1:.55,t=G.t||0;c.save();c.globalCompositeOperation='source-over';c.setTransform(1,0,0,1,0,0);c.globalAlpha=.3*k;c.fillStyle='#141450';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.globalAlpha=1;worldT();
  for(let i=0;i<6;i++){const x=(i*67+40+Math.sin(t*.5+i)*30)%WW,y=(i*131+80+Math.cos(t*.4+i*1.7)*24)%WH,a=(.45+.35*Math.sin(t*2+i))*k;glowDot(c,x,y,7,i%2?'#9aff8a':'#ffe27a',a);}
  c.restore();}
function festInit(){if(typeof FEST==='undefined')return;try{
  FEST.init(S,{g:'oborona',plat:PLAT,lang:LANG,save:()=>save(),now:()=>nowMs(),cls:'btn',modal:h=>{showModal(h);return $('mBody');},close:()=>hideModal(),
    low:()=>document.body.classList.contains('lite')});festSt=S.fest;
  if(!document.getElementById('obFestCss')){const s=document.createElement('style');s.id='obFestCss';s.textContent='body.run #festFx{display:none}';document.head.appendChild(s);}}catch(e){META_ERR('fest.init',e);}}
function festFix(s){for(const k of['festK','festN'])if(s[k]!=null&&(typeof s[k]!=='object'||Array.isArray(s[k])))s[k]={};}
META_MODS.push({id:'fest',
  FIX:festFix,
  MERGE(x,o){if(typeof FEST==='undefined'||!festSt)return;FEST.merge(o.fest);FEST.merge(x.fest);o.fest=festSt; // модуль держит ссылку на свой S.fest — сливаем в него (как SOC)
    const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};const a=ob(o.festK),b=ob(x.festK),m={};for(const id in Object.assign({},a,b))m[id]=Math.max(a[id]|0,b[id]|0);o.festK=m;
    const na=ob(o.festN),nb=ob(x.festN),n={};for(const id in Object.assign({},na,nb))n[id]=(na[id]||'')>(nb[id]||'')?na[id]:nb[id];o.festN=n;},
  RUN(G){if(festPend&&!G.endless&&!G.rule&&G.ci===festPend.c&&G.li===festPend.l){G.festN=1;    // «Испытание ночи»: нечисти вдвое больше (кроме боссов и вожаков)
      for(const w of G.waves)for(const g of w.g)if(!g.lead&&!EN[g.t].boss)g.n=Math.max(1,Math.round(g.n*2));}festPend=null;},
  KILL(e){if(!festOn()||!G||e.type==='egg')return;const m=S.festK||(S.festK={});m[FEST_HW]=(m[FEST_HW]|0)+1;},
  DRAW(c,G){if(festOn())festDraw(c,G);},
  END(G,win){if(!festOn())return;FEST.use(FEST_HW,'battle');let msg='';
    if(G.festN&&win&&!festNightGot()){const g=dchGold();(S.festN||(S.festN={}))[FEST_HW]=FEST.today();S.gold+=g;ern('chest',g);FEST.give(FEST_HW,'n'+FEST.today().replace(/-/g,''));
      msg=Lg('🌙 Лунный сундук: +','🌙 Moon chest: +')+fmtGold(g);}
    const s=festCheck();if(s)msg=msg?msg+' · '+s:s;if(msg){save();setTimeout(()=>toast(msg),900);}},
  TODAY(a){if(!festOn())return;a.unshift({id:'fest',hot:!festNightGot()||festK()>=FEST_GOAL&&!FEST.got(FEST_HW,'main'),t:'🌙 '+festName(),fn:festOpen});},
  MENU(){const s=festCheck();if(s){toast(s);return false;}return false;}});
festFix(S);festInit();
