'use strict';
/* ================= upd0910 — праздники FEST и «Кощеева неделя» (Хэллоуин 26.10–02.11.2026; образец — js/meta-fest.js «Тридевятой обороны») =================
   Модуль праздников — js/fest.js (общий, ~/Projects/hobby-analytics/fest; обновлять: fest-sync.sh js/fest.js). Тут — запуск и награды Богатыря.
   Праздник hw26 (по таблице модуля 26.10–02.11 по Москве; FEST.name: в VK «Кощеева неделя», на Яндексе «Осенний вечер», en «Spooky week»). Включается сам по дате.
   - ночное оформление меню (FEST deco:'night'; на время похода слой #festFx спрятан), в походе — лунная дымка и болотные огоньки (крючок DRAW, не в «мало эффектов»);
   - задание праздника: одолей FEST_GOAL нечисти (любые походы) → облик «Кощеев» всем богатырям навсегда (FEST.give('hw26','main'));
   - «лунный сундук» раз в день: первая победа в главе за день — +30 % золота похода (не меньше 100);
   - 04.11 «Выходной во дворе» (vyh26) — награда за вход ×2 (ui.js, loginReward).
   Без праздника ничего не видно; облик «Кощеев» без праздника виден только тем, у кого он есть.
   Сейв: S.fest (модуль FEST: застали/выдано), S.festK {hw26: одолено за праздник}, S.festN {hw26: день последнего лунного сундука}. Облако — объединение/максимум.
   Мак: ?fest=hw26 (включить) или ?festday=2026-10-31 («сегодня» по Москве) — только localhost/LAN. */
(function(){
const HW='hw26',GOAL=2500;
let festSt=null;
function on(){return typeof FEST!=='undefined'&&FEST.on(HW);}
function nm(){return FEST.name(HW)||L('Кощеева неделя','Spooky week');}
function K(){return (S.festK&&S.festK[HW])|0;}
function nightGot(){return !!(S.festN&&S.festN[HW]===FEST.today());}
/* облик «Кощеев»: тёмный кафтан, лунно-зелёная отделка (для всех богатырей; виден в праздник или если уже есть) */
try{if(typeof SKINS!=='undefined'&&typeof HERO_ART!=='undefined'&&!SKINS.some(s=>s.id==='koshei')){
  const P={body:'#2b2742',cloak:'#4a1f5c',helm:'#5c6070',rim:'#9aff8a',cap:'#3a2a52',fur:'#3c3c4c',kok:'#7a3adf',belt:'#9aff8a',boots:'#18161f',hair:'#2a2a36'};
  for(const h in HERO_ART){const pal={};for(const k in P)if(typeof HERO_ART[h][k]==='string'&&HERO_ART[h][k][0]==='#')pal[k]=P[k];
    SKINS.push({id:'koshei',hero:h,pal,fest:HW,get name(){return L('Кощеев','Deathless');},get src(){return L('задание праздника «'+nm()+'»','the “'+nm()+'” holiday task');}});
    const hh=Object.assign({},HERO_ART[h],pal),k=h+'@koshei';for(const f of[0,1])art('h_'+k+'_'+f,80,g=>drawHero(g,hh,f));art('hp_'+k,66,g=>{g.translate(0,3);drawHero(g,hh,0);});}}}catch(e){console.error(e);}
window.festSkinVis=function(sk,key){return !sk.fest||!!(S.skins||{})[key]||typeof FEST!=='undefined'&&FEST.on(sk.fest);};
function skinAll(){S.skins=S.skins||{};for(const s of SKINS)if(s.id==='koshei')S.skins[s.hero+'@koshei']=1;S.skin=S.skin||{};S.skin[S.hero||'dob']='koshei';}
/* задание выполнено — выдать облик (вне похода: в END и при входе в меню) */
function check(){if(!on()||K()<GOAL||FEST.got(HW,'main'))return '';if(!FEST.give(HW,'main'))return '';
  skinAll();save();return L('🌙 Облик «Кощеев» — твой! Надет на богатыря, есть у всех.','🌙 The “Deathless” outfit is yours! Worn now, unlocked for every hero.');}
function nightGold(G){return Math.max(100,Math.round((G.reward||0)*.3));}
function open(){if(!on())return;STAT.screen('fest');const k=Math.min(GOAL,K()),got=FEST.got(HW,'main'),left=FEST.left(HW),ng=nightGot();
  showModal('<h3>🌙 '+nm()+'</h3><p class="sub">'+L('Нечисть разгулялась по Руси! Праздник идёт '+(left<=1?'последний день':'ещё '+left+' '+plu(left,'день','дня','дней')),'Monsters roam the land! The holiday lasts '+(left<=1?'one last day':left+' more days'))+'.</p>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic('hp_'+(S.hero||'dob')+'@koshei',112)+'" alt=""><div class="t"><b>'+L('Одолей '+fmtNum(GOAL)+' нечисти','Defeat '+fmtNum(GOAL)+' monsters')+'</b><span>'+
      (got?L('✅ Облик «Кощеев» твой — навсегда!','✅ The “Deathless” outfit is yours — forever!'):L('Награда: облик «Кощеев» для всех богатырей, навсегда. Считаются любые походы.','Reward: the “Deathless” outfit for every hero, forever. Any run counts.'))+'</span>'+
      '<span><b>'+fmtNum(k)+' / '+fmtNum(GOAL)+'</b></span></div></div></div>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic('chest',112)+'" alt=""><div class="t"><b>'+L('🌙 Лунный сундук','🌙 Moon chest')+'</b><span>'+
      (ng?L('Сегодня взят — новый завтра.','Taken today — a new one tomorrow.'):L('Первая победа в главе за день — +30 % золота похода.','Your first chapter win of the day — +30% run gold.'))+'</span></div></div></div>'+
    '<div class="btns"><button class="btn ghost" id="fsX">'+L('Закрыть','Close')+'</button></div>');
  on2('fsX',hideModal);try{STAT.ev('fest',{e:HW,a:'open'});}catch(e){}}
function on2(id,f){const b=document.getElementById(id);if(b)b.onclick=f;}
window.festOpen=open;
/* ночь в походе: лунная дымка и болотные огоньки вокруг богатыря (мировые координаты) */
function draw(c,G){if(typeof qLow==='function'&&qLow())return;const t=G.t||0,hx=G.hero?G.hero.x:0,hy=G.hero?G.hero.y:0;c.save();
  c.setTransform(1,0,0,1,0,0);c.globalAlpha=.22;c.fillStyle='#1a1a5a';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.restore();c.save();
  for(let i=0;i<7;i++){const x=hx+Math.sin(t*.37+i*2.1)*260+Math.cos(i*1.3)*120,y=hy+Math.cos(t*.29+i*1.7)*200+Math.sin(i*2.7)*90,a=.35+.3*Math.sin(t*2+i);
    c.globalAlpha=a*.35;c.fillStyle=i%2?'#9aff8a':'#ffe27a';c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.fill();c.globalAlpha=a;c.beginPath();c.arc(x,y,4.5,0,Math.PI*2);c.fill();}
  c.restore();}
function init(){if(typeof FEST==='undefined')return;try{
  FEST.init(S,{g:'bogatyr',plat:PLAT,lang:LANG,save:()=>save(),now:()=>nowMs(),cls:'btn',modal:h=>{showModal(h);return document.getElementById('mBody');},close:()=>hideModal(),
    low:()=>document.body.classList.contains('lite')||(typeof qLow==='function'&&qLow())});festSt=S.fest;
  if(!document.getElementById('bgFestCss')){const s=document.createElement('style');s.id='bgFestCss';s.textContent='body.run #festFx{display:none}';document.head.appendChild(s);}}catch(e){META_ERR('fest.init',e);}}
function fix(s){for(const k of['festK','festN'])if(s[k]!=null&&(typeof s[k]!=='object'||Array.isArray(s[k])))s[k]={};}
META_MODS.push({id:'fest',
  FIX:fix,
  MERGE(d,o){if(typeof FEST==='undefined'||!festSt)return;FEST.merge(o.fest);FEST.merge(d.fest);o.fest=festSt; // модуль держит ссылку на свой S.fest — сливаем в него (как Оборона)
    const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};const a=ob(o.festK),b=ob(d.festK),m={};for(const id in Object.assign({},a,b))m[id]=Math.max(a[id]|0,b[id]|0);o.festK=m;
    const na=ob(o.festN),nb=ob(d.festN),n={};for(const id in Object.assign({},na,nb))n[id]=(na[id]||'')>(nb[id]||'')?na[id]:nb[id];o.festN=n;},
  KILL(e){if(!on()||!G||!e||(EN[e.type]||{}).prop)return;const m=S.festK||(S.festK={});m[HW]=(m[HW]|0)+1;},
  DRAW(c,G){if(on())draw(c,G);},
  END(G,win){if(!on())return;FEST.use(HW,'run');let h='';
    if(win&&!G.endless&&!G.daily&&!G.weekly&&!nightGot()){const g=nightGold(G);(S.festN||(S.festN={}))[HW]=FEST.today();S.gold+=g;ern('chest',g);FEST.give(HW,'m'+FEST.today().slice(5).replace('-',''));
      h+='<p class="sub">🌙 '+L('Лунный сундук: ','Moon chest: ')+'<b>+'+fmtNum(g)+goldW()+'</b></p>';}
    const s=check();if(s)h+='<p class="sub"><b>'+s+'</b></p>';else if(!FEST.got(HW,'main'))h+='<p class="sub">🌙 '+nm()+': '+fmtNum(Math.min(GOAL,K()))+' / '+fmtNum(GOAL)+L(' нечисти',' monsters')+'</p>';
    if(h)G.metaHtml=(G.metaHtml||'')+h;},
  TODAY(TL){if(!on()||(S.runs|0)<3)return;const hot=!nightGot()||K()>=GOAL&&!FEST.got(HW,'main');
    TL.unshift({k:'fest',ic:'hp_'+(S.hero||'dob')+'@koshei',t:'🌙 '+nm(),s:FEST.got(HW,'main')?L('Лунный сундук — за первую победу дня','Moon chest for your first win today'):fmtNum(Math.min(GOAL,K()))+' / '+fmtNum(GOAL)+L(' нечисти → облик «Кощеев»',' monsters → “Deathless” outfit'),ready:hot,b:L('Открыть','Open'),always:1,fn:()=>{hideModal();open();}});},
  CHIPS(a){if(on())a.push('<i class="hot">🌙 '+L('праздник','holiday')+'</i>');}});
fix(S);init();
/* на входе в меню — выдать облик, если задание выполнено на другом устройстве */
setTimeout(()=>{try{const s=check();if(s)toast(s);}catch(e){}},4000);
})();
