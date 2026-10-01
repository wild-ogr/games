/* ================= «Из ларька в магнаты: бизнес» — интерфейс (UI): шапка, меню, карта, регион, объекты, логистика, окна, советник, обучение =================
   Зона UI-1. Модель — ECON (econ.js), клей — GAME/FMT/NM (game.js), обвес — shell.js (L, pl, S, modal, toast, SND, реклама, PAY…).
   Рынок и Финансы рисует fin.js (FIN.renderMarket/renderFin, ADV.*) — зовём через проверку наличия.
   Все клики по экранам — делегирование по data-a (экраны перерисовываются целиком по событиям GAME). */
(function(){
'use strict';
const E=ECON;
const w=()=>GAME.W;
const $$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
// род героя из пролога (window.HERO от сюжета); без сюжета — мужской
const hg=(m,f)=>{try{return window.HERO&&HERO.g?HERO.g(m,f):m;}catch(e){return m;}};
const M=x=>FMT.money(x);
const pendT=[];function tst(t,ms){if(typeof modalOn!=='undefined'&&modalOn){if(pendT.indexOf(t)<0)pendT.push(t);return;}toast(t,ms);}
const snd=k=>{try{if(SND&&SND[k])SND[k]();}catch(e){}};
const hasFin=f=>typeof FIN!=='undefined'&&FIN&&typeof FIN[f]==='function';
const hasAdv=f=>typeof ADV!=='undefined'&&ADV&&typeof ADV[f]==='function';
const days=n=>n+' '+pl(n,'день','дня','дней','day','days');
const mons=n=>n+' '+pl(n,'месяц','месяца','месяцев','month','months');
const plotNo=p=>L('Участок ','Plot ')+(parseInt(String(p.id).slice(p.r.length),10)+1);
const botCol=id=>(E.BOTS.find(b=>b.id===id)||{}).col||'var(--muted)';
const low=s=>LANG==='en'?String(s).toLowerCase():String(s).charAt(0).toLowerCase()+String(s).slice(1);
const RIN={kuz:'в Кузбассе',ural:'на Урале',kar:'в Карелии'},RFROM={kuz:'из Кузбасса',ural:'с Урала',kar:'из Карелии'},RTO={kuz:'в Кузбасс',ural:'на Урал',kar:'в Карелию'};
const regIn=r=>L(RIN[r]||NM.reg(r),'in '+NM.reg(r)),regFrom=r=>L(RFROM[r]||NM.reg(r),'from '+NM.reg(r)),regTo=r=>L(RTO[r]||NM.reg(r),'to '+NM.reg(r));
const GEN={cuore:'медной руды',cucon:'медного концентрата',cu:'меди',wire:'катанки',coal:'угля',ore:'руды',lime:'известняка',wood:'леса',lumber:'пиломатериалов',pig:'чугуна',steel:'стали',roll:'проката'};
const gGen=g=>L(GEN[g]||NM.good(g),low(NM.good(g)));
const ppu=(r,g)=>FMT.num(E.price(w(),r,g))+' ₽/'+NM.unit(g);
const rub=x=>FMT.num(Math.round(x))+' ₽';

/* ================= перерисовка «на месте» (morph): не пересоздаём кнопки под пальцем ================= */
// Новый HTML сравнивается со старым деревом: совпадающие узлы остаются (меняются только текст и атрибуты) —
// нажатие, начатое до смены дня, не теряется, фокус и место экранного диктора сохраняются. data-keep — содержимое не трогаем (дорисовывает другой модуль).
function morphKids(a,b){const bn=Array.prototype.slice.call(b.childNodes);
  for(let i=0;i<bn.length;i++){const x=a.childNodes[i],y=bn[i];
    if(!x){a.appendChild(y);continue;}
    if(x.nodeType!==y.nodeType||x.nodeName!==y.nodeName||(x.nodeType===1&&(x.id||'')!==(y.id||''))){a.replaceChild(y,x);continue;}
    if(x.nodeType!==1){if(x.nodeValue!==y.nodeValue)x.nodeValue=y.nodeValue;continue;}
    const xa=x.attributes,ya=y.attributes;for(let k=xa.length-1;k>=0;k--){const n=xa[k].name;if(!y.hasAttribute(n))x.removeAttribute(n);}
    for(let k=0;k<ya.length;k++){const n=ya[k].name,v=ya[k].value;if(x.getAttribute(n)!==v){x.setAttribute(n,v);if(n==='value'&&'value' in x&&document.activeElement!==x)x.value=v;}}
    if(x.nodeName==='BUTTON'||x.nodeName==='INPUT')x.disabled=y.hasAttribute('disabled');
    if(y.hasAttribute('data-keep'))continue;
    morphKids(x,y);}
  while(a.childNodes.length>bn.length)a.removeChild(a.lastChild);}
function morphHTML(el,html){const t=document.createElement('div');t.innerHTML=html;morphKids(el,t);}
window.morphHTML=morphHTML;
const put=(el,h)=>{if(el.firstChild){try{morphHTML(el,h);return;}catch(e){console.error(e);}}el.innerHTML=h;};

/* ================= значки (свои SVG: не зависят от эмодзи старых телефонов) ================= */
const SV=(vb,body)=>`<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;
/* ---- значки товаров: стиль Г — тонкий контур в светлом круге, цвет товара — лёгкой заливкой ---- */
const GD={
 coal:{c:'#3d424a',p:[['b','M7 28L12 15L21 10L31 14L35 27L26 33L13 33Z'],['l','M12 15L21 10L23 19L14 22Z'],['d','M26 33L35 27L31 14L23 19Z']]},
 ore:{c:'#b3583b',p:[['b','M6 27C6 17 13 11 21 11C30 11 35 18 34 26C33 32 27 34 20 34C12 34 6 32 6 27Z'],['l','M15 19a3 3 0 1 0 .1 0ZM25 17a2 2 0 1 0 .1 0ZM24 25a2.4 2.4 0 1 0 .1 0Z']]},
 lime:{c:'#c9b98f',p:[['b','M6 22h14v11H6zM20 22h14v11H20zM13 11h14v11H13z'],['l','M6 22h14v3H6zM20 22h14v3H20zM13 11h14v3H13z']]},
 wood:{c:'#9b6a3a',p:[['d','M13 19a7.5 7.5 0 1 0 .1 0ZM27 19a7.5 7.5 0 1 0 .1 0ZM20 6.5a7.5 7.5 0 1 0 .1 0Z'],['l','M13 21.5a5 5 0 1 0 .1 0ZM27 21.5a5 5 0 1 0 .1 0ZM20 9a5 5 0 1 0 .1 0Z']]},
 lumber:{c:'#d9a55b',p:[['b','M5 13h30v6H5zM5 20h30v6H5zM5 27h30v6H5z'],['l','M5 13h30v2H5zM5 20h30v2H5zM5 27h30v2H5z']]},
 pig:{c:'#6d7480',p:[['b','M5 31L10 19H30L35 31Z'],['l','M10 19H30L27 13H13Z']]},
 steel:{c:'#4f86bd',p:[['b','M6 12h28v6H23v6h11v6H6v-6h11v-6H6z'],['l','M6 12h28v2H6zM6 24h11v2H6zM23 24h11v2H23z']]},
 roll:{c:'#7d8a97',p:[['b','M20 7a13 13 0 1 0 .1 0Z'],['l','M20 10a10 10 0 1 0 .1 0Z'],['b','M20 15a5 5 0 1 0 .1 0Z']]},
 cuore:{c:'#3f9e84',p:[['b','M6 27C6 17 13 11 21 11C30 11 35 18 34 26C33 32 27 34 20 34C12 34 6 32 6 27Z'],['l','M14 20a3 3 0 1 0 .1 0ZM25 18a2.2 2.2 0 1 0 .1 0ZM22 26a2.6 2.6 0 1 0 .1 0Z']]},
 cucon:{c:'#b9793f',p:[['b','M4 32C8 20 14 14 20 14S32 20 36 32Z'],['l','M12 26a1.8 1.8 0 1 0 .1 0ZM20 21a1.8 1.8 0 1 0 .1 0ZM27 27a1.8 1.8 0 1 0 .1 0Z']]},
 cu:{c:'#c8662e',p:[['b','M11 9h18v25H11z'],['l','M11 9h18v4H11z'],['b','M17 5h6v4h-6z']]},
 wire:{c:'#c8662e',p:[['b','M20 7a13 12 0 1 0 .1 0Z'],['l','M20 11a9 8 0 1 0 .1 0Z'],['b','M20 15a5 4 0 1 0 .1 0Z']]}};
function gSvg(g){const G=GD[g];if(!G)return '<circle cx="20" cy="20" r="20" style="fill:var(--icbg)"/>';
  let s='<circle cx="20" cy="20" r="20" style="fill:var(--icbg)"/><g transform="translate(6.8 6.8) scale(.66)">';
  for(const [t,p] of G.p)s+=`<path d="${p}" fill="${t==='l'?G.c:'none'}" fill-opacity="${t==='l'?.3:0}" style="stroke:var(--icln)" stroke-width="1.8" stroke-linejoin="round"/>`;
  return s+'</g>';}
const gIco=g=>SV('0 0 40 40',gSvg(g));
/* ---- значки объектов: плоские иллюстрации в 2–3 тона (стиль «Б») в светлом круге ---- */
const TONE={coal:['#5b6470','#3a414b','#8a939e'],ore:['#c98d4e','#8f5b2c','#e9c08b'],lime:['#d8cdb0','#ab9c76','#f3ecd9'],cuore:['#5f9e8a','#3d6f60','#9fd0bf'],
  wood:['#9b6a3a','#6b4424','#e5bb7e'],forest:['#3f8f55','#2b6a3d','#a36f3c'],fire:['#6c7784','#3f4852','#f2a33a'],steel:['#4f86bd','#2f5c8a','#a9cbea'],
  cu:['#c8662e','#8e4219','#f0a36a'],store:['#b0773f','#7d4f24','#e9c08b'],wag:['#8a5a2b','#5e3b1b','#8b97a4'],grey:['#7d8a97','#4b5763','#c6ced7']};
const pit=g=>[TONE[g],[['d','M2 40h44v4H2z'],['b','M4 40L10 30H38L44 40Z'],['l','M10 30L15 22H33L38 30Z'],['b','M15 22L19 16H29L33 22Z'],['d','M30 11h9v4h-9zM31 16a2 2 0 1 0 .1 0ZM38 16a2 2 0 1 0 .1 0Z']]];
const OG={
 coalpit:()=>pit('coal'),orepit:()=>pit('ore'),limepit:()=>pit('lime'),cupit:()=>pit('cuore'),
 logging:()=>[TONE.forest,[['b','M14 5L5 27h18z'],['d','M14 5V27h9z'],['b','M32 9L24 29h16z'],['l','M12 27h4v8h-4zM30 29h4v6h-4z'],['l','M6 38h36v5H6z']]],
 sawmill:()=>[TONE.wood,[['b','M5 42V22l10-6v6l10-6v26z'],['d','M5 42h20v3H5z'],['l','M9 29h5v5H9zM17 29h5v5h-5z'],['l','M36 21a9 9 0 1 0 .1 0Z'],['d','M36 27a3 3 0 1 0 .1 0Z'],['d','M27 42h18v3H27z']]],
 furnace:()=>[TONE.fire,[['b','M14 44L17 16H29L32 44Z'],['d','M29 44V26h12v18z'],['d','M34 26V8h4v18z'],['l','M20 36h6v8h-6z'],['l','M17 16c1-6 5-8 6-12c2 4 5 6 6 12z']]],
 steel:()=>[TONE.steel,[['b','M5 44V20h26v24z'],['d','M5 20l13-8 13 8z'],['d','M30 21h13l-2 10h-9z'],['l','M35 31h3v13h-3z'],['l','M10 30h6v6h-6zM20 30h6v6h-6z']]],
 rolling:()=>[TONE.steel,[['b','M4 34V20h40v14z'],['d','M4 20l6-6h28l6 6z'],['l','M9 24h6v5H9zM21 24h6v5h-6zM33 24h6v5h-6z'],['d','M12 40a3.5 3.5 0 1 0 .1 0ZM24 40a3.5 3.5 0 1 0 .1 0ZM36 40a3.5 3.5 0 1 0 .1 0Z'],['l','M3 42h42v3H3z']]],
 cuconc:()=>[TONE.cuore,[['b','M4 44V24h20v20z'],['d','M4 24l10-7 10 7z'],['l','M8 30h5v5H8zM15 30h5v5h-5z'],['l','M34 22a9 9 0 1 0 .1 0Z'],['d','M26 32h16v12H26z']]],
 smelter:()=>[TONE.cu,[['d','M30 6h5v20h-5z'],['b','M5 44V26l12-8h16v26z'],['d','M5 44h28v2H5z'],['l','M11 33h12v11H11z'],['b','M36 37h9v7h-9z'],['l','M36 37h9v2h-9z']]],
 wiremill:()=>[TONE.steel,[['b','M4 44V18h30v26z'],['d','M4 18l7-6h16l7 6z'],['l','M9 24h7v5H9zM20 24h7v5h-7z'],['cb','M38 28a8 7 0 1 0 .1 0Z'],['cl','M38 31a4.5 4 0 1 0 .1 0Z']]],
 store:()=>[TONE.store,[['b','M6 22L24 10l18 12v22H6z'],['d','M3 23L24 8l21 15-2 2L24 12 5 25z'],['l','M17 28h14v16H17z'],['d','M17 32h14v1.5H17zM17 37h14v1.5H17z']]],
 wagon:()=>[TONE.wag,[['b','M5 15h38v17H5z'],['d','M5 21h38v2H5zM15 15h2v17h-2zM31 15h2v17h-2z'],['d','M13 36a3.5 3.5 0 1 0 .1 0ZM35 36a3.5 3.5 0 1 0 .1 0Z'],['l','M3 40h42v2.5H3z']]]};
function oSvg(t){const f=OG[t];let s='<circle cx="24" cy="24" r="24" style="fill:var(--icbg)"/>';if(!f)return s;const [c,P]=f(),col={b:c[0],d:c[1],l:c[2],cb:TONE.cu[0],cl:TONE.cu[2]};
  s+='<g transform="translate(6 6) scale(.75)">';for(const [k,p] of P)s+=`<path d="${p}" fill="${col[k]}"/>`;return s+'</g>';}
const oIco=t=>SV('0 0 48 48',oSvg(t));
/* ---- главбух: плоский спокойный портрет (Г) и дуотон в золотом кольце (тёмная тема, А) ---- */
let fcN=0;
function faceG(m){const id='lsc'+(++fcN),mouth=m==='happy'?'M28.6 35q3.4 2.6 6.8 0':m==='worry'?'M29 36q3-1.4 6 0':m==='strict'?'M29 35.4h6':m==='wow'?'':'M29 35q3 1.3 6 0';
  const brows=m==='worry'?'<path d="M24 23.2l5-1.3M40 23.2l-5-1.3" stroke="#6b7280" stroke-width="1.1" stroke-linecap="round"/>':m==='strict'?'<path d="M24 22.6h5.4M34.6 22.6H40" stroke="#6b7280" stroke-width="1.2" stroke-linecap="round"/>':'';
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#${id})"><rect width="64" height="64" fill="#e9edf5"/>
    <path d="M8 66c1-14 11-20 24-20s23 6 24 20z" fill="#2b3445"/><path d="M27 46l5 7 5-7z" fill="#f5f6f8"/><path d="M29 47.5l3 4 3-4" fill="none" stroke="#c8a96a" stroke-width="1"/>
    <rect x="28.5" y="37" width="7" height="10" rx="3" fill="#dcae8e"/><ellipse cx="32" cy="28" rx="11" ry="12.5" fill="#ebc3a3"/>
    <path d="M20.5 27c-1-13 24-14 23 0-3-6-7-7.5-11.5-7.5S23.5 21 20.5 27z" fill="#9aa1ab"/><circle cx="32" cy="12.5" r="6" fill="#9aa1ab"/>
    <rect x="23.5" y="26.2" width="7.2" height="5" rx="2.4" fill="none" stroke="#2b3445" stroke-width="1.1"/><rect x="33.3" y="26.2" width="7.2" height="5" rx="2.4" fill="none" stroke="#2b3445" stroke-width="1.1"/><path d="M30.7 28.2h2.6" stroke="#2b3445" stroke-width="1"/>
    <circle cx="27.1" cy="28.8" r=".95" fill="#2b3445"/><circle cx="36.9" cy="28.8" r=".95" fill="#2b3445"/>${brows}
    ${m==='wow'?'<ellipse cx="32" cy="35.6" rx="1.8" ry="2.2" fill="#a55a52"/>':`<path d="${mouth}" stroke="#a55a52" stroke-width="1.3" fill="none" stroke-linecap="round"/>`}</g></svg>`;}
function faceA(m){const k=m==='happy'?3:m==='worry'?-1.2:m==='strict'?0:1.5;
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#1f2935"/><circle cx="32" cy="32" r="30.5" fill="none" stroke="#f5b23d" stroke-width="1.5" opacity=".9"/>
    <path d="M12 60c2-12 10-16 20-16s18 4 20 16a30 30 0 01-40 0z" fill="#3b4b62"/><path d="M27 44l5 6 5-6" fill="#e8eef5"/>
    <circle cx="32" cy="13" r="6" fill="#a9b1bc"/><ellipse cx="32" cy="29" rx="10.5" ry="12" fill="#e9c4a2"/>
    <path d="M21 27c0-10 22-10 22 0-3-5-7-6-11-6s-8 1-11 6z" fill="#a9b1bc"/>
    <rect x="23.5" y="27" width="7" height="5" rx="2" fill="none" stroke="#f5b23d" stroke-width="1.4"/><rect x="33.5" y="27" width="7" height="5" rx="2" fill="none" stroke="#f5b23d" stroke-width="1.4"/><path d="M30.5 29h3" stroke="#f5b23d" stroke-width="1.2"/>
    ${m==='wow'?'<ellipse cx="32" cy="37" rx="1.8" ry="2.2" fill="#9c4a44"/>':`<path d="M28.5 36.5q3.5 ${k} 7 0" stroke="#9c4a44" stroke-width="1.5" fill="none" stroke-linecap="round"/>`}</svg>`;}
/* ---- иллюстрация региона (сцена «карьер, завод, ж/д») — цвета из темы ---- */
function scene(r){const g=topGoods(r,1)[0],T=TONE[g==='wood'?'wood':g==='coal'?'coal':g==='cuore'?'cuore':'ore'],trees=g==='wood';
  return `<svg viewBox="0 0 360 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="height:110px"><rect width="360" height="110" style="fill:var(--sc-sky1)"/><rect y="40" width="360" height="70" style="fill:var(--sc-sky2)" opacity=".6"/>
  <circle cx="306" cy="28" r="12" style="fill:var(--sc-sun)"/>
  <path d="M0 72L40 48L78 64L120 36L170 60L210 44L260 64L300 46L360 62V110H0z" style="fill:var(--sc-h1)"/><path d="M0 86L60 70L130 82L200 68L270 80L360 72V110H0z" style="fill:var(--sc-h2)"/>
  ${trees?'<path d="M40 104L56 70L72 104zM70 104L84 76L98 104zM100 104L116 66L132 104zM130 104L142 82L154 104z" style="fill:var(--sc-tree)"/>'
   :`<path d="M28 110L50 88H146L168 110z" fill="${T[1]}"/><path d="M50 88L66 78H130L146 88z" fill="${T[0]}"/><path d="M66 78L78 70H118L130 78z" fill="${T[2]}"/>
  <rect x="102" y="63" width="12" height="6" rx="1.5" style="fill:var(--sc-acc)"/><circle cx="105" cy="70" r="2" style="fill:var(--sc-pl1)"/><circle cx="112" cy="70" r="2" style="fill:var(--sc-pl1)"/>`}
  <path d="M196 110V66h10v-8h6v8h8v44z" style="fill:var(--sc-pl1)"/><path d="M226 110V54l14-8 14 8v56z" style="fill:var(--sc-pl2)"/><rect x="258" y="30" width="7" height="80" style="fill:var(--sc-pl1)"/><rect x="270" y="40" width="7" height="70" style="fill:var(--sc-pl2)"/>
  <rect x="236" y="70" width="8" height="10" style="fill:var(--sc-acc)" opacity=".9"/><path d="M261 28c-6-6 4-10-2-16" style="stroke:var(--sc-smoke)" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M0 104H360" style="stroke:var(--sc-pl1)" stroke-width="1.6"/><path d="M0 108H360" style="stroke:var(--sc-pl1)" stroke-width="1.6" stroke-dasharray="3 5"/>
  <path d="M296 104v-9h28v9zM328 104v-9h26v9z" style="fill:var(--sc-acc)"/></svg>`;}

/* ================= карта: силуэт России (x=(lon−26)·5,8, y=(78−lat)·11,5) ================= */
const OUT=[[30,69.5],[41,67],[44,68],[54,68.5],[60,69.8],[68,72.5],[80,73.5],[90,75.5],[104,77.7],[113,73.8],[130,71.5],[140,72.5],[160,69.8],[180,68.8],[190,65.5],[179,62.5],[170,60],[163,58.5],[156.7,51],[156,57],[152,59.5],[141,59],[135,55],[141,52],[140,48],[132,43],[131,45],[134,48.5],[127,49.5],[120,53.3],[116,50],[107,50],[98,50],[88,49.5],[82,50.5],[69,55],[61,54],[60,51],[52,51.5],[48,46.5],[47.5,41.5],[40,43.5],[37,45],[39.5,47.5],[40,50],[35,52],[32,52.5],[31.5,55.5],[28,56.5],[27.5,58],[28,59.5],[30,61],[29.5,63]];
const PX=(lon,lat)=>[(lon-26)*5.8,(78-lat)*11.5];
const LAND=(()=>{const P=OUT.map(p=>PX(p[0],p[1])),n=P.length,f=p=>p[0].toFixed(1)+','+p[1].toFixed(1),t=.17;let d='M'+f(P[0]);
  for(let i=0;i<n;i++){const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];
    d+='C'+f([p1[0]+(p2[0]-p0[0])*t,p1[1]+(p2[1]-p0[1])*t])+' '+f([p2[0]-(p3[0]-p1[0])*t,p2[1]-(p3[1]-p1[1])*t])+' '+f(p2);}return d+'Z';})();
const MOSCOW=PX(37.6,55.75);

/* ================= тексты по умолчанию (если fin.js не дал своих) ================= */
function evText(e){if(!e)return '';const r=e.r?NM.reg(e.r):'',o=e.t?NM.obj(e.t):'';
  const T={steelup:L('Металл дорожает: стройки по стране растут.','Metal prices rise: construction is booming.'),steeldn:L('Металл дешевеет: спрос упал.','Metal prices fall: demand is down.'),
    buildup:L('Стройматериалы в цене: лес, пиломатериалы и известняк дорожают.','Building materials are in demand: timber, lumber and limestone go up.'),winter:L('Холодная зима — уголь дорожает.','A cold winter — coal prices rise.'),
    export:L('Экспорт леса ограничили — лес дешевеет.','Timber exports are limited — timber gets cheaper.'),orecn:L('Спрос на руду растёт — руда дорожает.','Ore demand grows — ore prices rise.'),
    keyup:L('ЦБ поднял ключевую ставку — кредиты дороже.','The central bank raised the key rate — loans cost more.'),keydn:L('ЦБ снизил ключевую ставку — кредиты дешевле.','The central bank cut the key rate — loans are cheaper.'),
    acc:L(`Авария: ${o} ${RIN[e.r]||r} стоит 10 дней, ремонт — ${M(e.c||0)}.`,`Accident: ${o} in ${r} is down for 10 days, repairs cost ${M(e.c||0)}.`),
    flood:L(`Паводок ${RIN[e.r]||r}: поезда идут дольше, лес валить трудно.`,`Flooding in ${r}: trains are slower, logging is hard.`),
    tariff:L('Железная дорога подняла тарифы на 5 %.','Railway tariffs are up 5%.'),wagons:L('Нехватка вагонов: аренда подорожала в 1,5 раза.','Wagon shortage: rent is 1.5× higher.'),
    plot:L(`${r}: геологи отметили новый участок для разведки.`,`${r}: geologists marked a new plot to explore.`)};
  return T[e.k]||'';}
function newsText(n){if(hasAdv('news')){try{const t=ADV.news(n);if(t)return t;}catch(e){}}
  const a=n.a||{},g=a.g?low(NM.good(a.g)):'',r=a.r?NM.reg(a.r):'',t=a.t?NM.obj(a.t):'',b=a.b?NM.bot(a.b):'';
  switch(n.k){
    case 'start':return L(`Холдинг основан. Уставный капитал — ${M(a.c)}.`,`The holding is founded. Share capital: ${M(a.c)}.`);
    case 'empty':return L(`${r}: разведанный участок оказался пустым.`,`${r}: the explored plot turned out empty.`);
    case 'found':return L(`${r}: геологи нашли ${g}!`,`${r}: geologists found ${g}!`);
    case 'auction':return L(`${r}: торги за участок (${g}).`,`${r}: auction for a plot (${g}).`);
    case 'won':return L(`Лицензия ваша: ${g}, ${r}, за ${M(a.pr)}.`,`Licence is yours: ${g}, ${r}, for ${M(a.pr)}.`);
    case 'lost':return L(`${b} купил лицензию (${g}, ${r}) за ${M(a.pr)}.`,`${b} bought a licence (${g}, ${r}) for ${M(a.pr)}.`);
    case 'reimb':return L(`Вам вернули затраты на разведку: ${M(a.c)}.`,`Exploration costs refunded: ${M(a.c)}.`);
    case 'nobid':return L('На торги никто не пришёл — участок можно взять без торгов.','Nobody came to the auction — you can take the plot directly.');
    case 'build':return L(`Начата стройка: ${t}, ${r}.`,`Construction started: ${t}, ${r}.`);
    case 'built':return L(`Запущен: ${t}, ${r}.`,`Up and running: ${t}, ${r}.`);
    case 'upgrade':return L(`Началась модернизация: ${t}, ${r}.`,`Upgrade started: ${t}, ${r}.`);
    case 'upgraded':return L(`Модернизация завершена: ${t}, ${r}.`,`Upgrade finished: ${t}, ${r}.`);
    case 'off':return L(`Законсервирован: ${t}, ${r}.`,`Mothballed: ${t}, ${r}.`);
    case 'on':return L(`Снова работает: ${t}, ${r}.`,`Back at work: ${t}, ${r}.`);
    case 'wagons':return L(`Куплено вагонов: ${a.n}.`,`Wagons bought: ${a.n}.`);
    case 'loan':return L(`Взят кредит ${M(a.a)} под ${FMT.pct(a.r,1)}.`,`Loan taken: ${M(a.a)} at ${FMT.pct(a.r,1)}.`);
    case 'contract':return L(`Подписан контракт: ${g}, ${FMT.qty(a.q,a.g)}.`,`Contract signed: ${g}, ${FMT.qty(a.q,a.g)}.`);
    case 'penalty':return L(`Штраф за недопоставку (${g}): ${M(a.pen)}.`,`Penalty for short delivery (${g}): ${M(a.pen)}.`);
    case 'cdone':return L(`Контракт выполнен: ${g}.`,`Contract fulfilled: ${g}.`);
    case 'od':return L(`Денег не хватило — банк дал овердрафт ${M(a.a)}.`,`Cash ran out — the bank gave an overdraft of ${M(a.a)}.`);
    case 'san':return L('Санация: банк продал часть активов и свёл долги в один кредит.','Restructuring: the bank sold some assets and merged debts into one loan.');
    case 'ev':return evText(a);
    case 'botbuild':return L(`${b} строит: ${t}, ${r}.`,`${b} is building: ${t}, ${r}.`);
    case 'botsell':return L(`${b} продал актив: ${t}, ${r}.`,`${b} sold an asset: ${t}, ${r}.`);}
  return '';}
function advText(x){if(hasAdv('text')){try{const t=ADV.text(x,w());if(t&&typeof t==='string')return t;}catch(e){}}
  const a=x.a||{},r=a.r?NM.reg(a.r):'',o=a.t?NM.obj(a.t):'',g=a.g?low(NM.good(a.g)):'';
  if(x.k.indexOf('ev_')===0)return evText(a);
  const T={san:L('Банк провёл санацию: продал часть активов и свёл долги в один кредит. Начинаем осторожно.','The bank restructured us: sold some assets and merged debts. Let’s go carefully.'),
    od:L('Денег не хватило — банк дал овердрафт под высокий процент. Продайте запасы и не начинайте новых строек.','Cash ran out — the bank gave an expensive overdraft. Sell stock and don’t start new projects.'),
    cash:L(`Денег хватит примерно на ${mons(a.n||0)}. Пока не начинайте новых строек.`,`Cash will last about ${mons(a.n||0)}. Hold off on new projects.`),
    full:L(`Склад ${RIN[a.r]||r} почти полон — продайте товар или постройте склад.`,`The warehouse in ${r} is almost full — sell or build storage.`),
    input:L(`${o} ${RIN[a.r]||r}: не хватает ${GEN[a.g]||g}. Включите автозакупку или проложите маршрут.`,`${o} in ${r} is short of ${g}. Turn on auto-buy or set up a route.`),
    depleted:L(`${o} ${RIN[a.r]||r}: запасы кончились. Законсервируйте его, чтобы не платить лишнего.`,`${o} in ${r} is depleted. Mothball it to save money.`),
    halt:L(`Стройка стоит: ${o} ${RIN[a.r]||r} — не хватает денег.`,`Construction stopped: ${o} in ${r} — not enough money.`),
    lev:L('Долг великоват для нашей прибыли. Больше не занимайте, гасите понемногу.','Debt is high for our earnings. Don’t borrow more, repay bit by bit.'),
    cons:L(`По контракту (${g}) отстаём — за недопоставку штраф 20 %.`,`We’re behind on a contract (${g}) — the penalty is 20% of the shortfall.`),
    auc:L('Идут торги за участки — загляните в регионы.','Plot auctions are on — take a look at the regions.'),
    myauc:L(`Найденный вами участок (${g}) на торгах — решите, сколько готовы заплатить.`,`The plot you found (${g}) is up for auction — decide how much to pay.`),
    grow:L(`Прибыль выросла на ${FMT.pct(a.x||0)}. Так держать!`,`Profit grew by ${FMT.pct(a.x||0)}. Keep it up!`),
    loss:L('Месяц в убытке. Посмотрите цены и постоянные расходы.','A loss-making month. Check prices and fixed costs.'),
    up:L(`${NM.good(a.g)} подорожал на ${FMT.pct(Math.abs(a.x||0))} — хорошее время продавать.`,`${NM.good(a.g)} is up ${FMT.pct(Math.abs(a.x||0))} — a good time to sell.`),
    down:L(`${NM.good(a.g)} подешевел на ${FMT.pct(Math.abs(a.x||0))}.`,`${NM.good(a.g)} is down ${FMT.pct(Math.abs(a.x||0))}.`),
    idle:L('Деньги лежат без дела — разведайте участок.','Money is sitting idle — explore a plot.'),
    lazy:L('Денег много, а строек нет. Пора расти: новый участок или завод.','Plenty of cash and nothing under construction. Time to grow: a new plot or a plant.'),
    ok:L('Месяц прибыльный. Всё идёт по плану.','A profitable month. All according to plan.'),
    meh:L('Пока без прибыли — в начале это нормально: стройка окупится.','No profit yet — normal at the start: construction pays off later.')};
  return T[x.k]||'';}
const WHY_GO={full:x=>go('reg',x.a.r),input:()=>go('obj'),depleted:()=>go('obj'),halt:()=>go('obj'),cash:()=>go('fin'),od:()=>go('fin'),san:()=>go('fin'),lev:()=>go('fin'),loss:()=>go('fin'),
  grow:()=>go('fin'),ok:()=>go('fin'),meh:()=>go('fin'),auc:()=>{const a=w().auc[0];if(a)go('reg',a.r);else go('map');},myauc:()=>go('map'),cons:()=>go('market'),up:()=>go('market'),down:()=>go('market'),idle:()=>go('map'),lazy:()=>go('map')};
function whyTxt(o){const y=o.why||'';if(!y)return '';
  if(y.indexOf('in:')===0){const g=y.slice(3);return L('нет '+(GEN[g]||NM.good(g)),'no '+low(NM.good(g)));}
  return ({full:L('склад полон','warehouse full'),acc:L('авария, ремонт','accident, repairs'),empty:L('запасы кончились','deposit depleted'),cash:L('нет денег','no money')})[y]||y;}
const MPREP=['январе','феврале','марте','апреле','мае','июне','июле','августе','сентябре','октябре','ноябре','декабре'];
const face=m=>document.body.classList.contains('th-office')?faceA(m||'calm'):faceG(m||'calm');
const ADV_NAME=()=>L('Людмила Санна · главбух','Lyudmila Sanna · chief accountant');

/* ================= состояние экрана ================= */
/* нижнее меню — одним списком: id, значок, подпись, условие видимости (вкладки можно открывать по мере роста) */
const TAB_DEF=[
  {id:'map',ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',ru:'Карта',en:'Map',show:()=>true},
  {id:'obj',ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20V10l5 3V10l5 3V6h4l1 14z"/><path d="M3 20h18"/></svg>',ru:'Объекты',en:'Assets',show:()=>true},
  {id:'market',ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-5 4 3 8-8"/><path d="M15 7h5v5"/></svg>',ru:'Рынок',en:'Market',show:()=>true},
  {id:'logi',ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="11" rx="2"/><path d="M4 11h16M8 16l-2 3M16 16l2 3"/><circle cx="8" cy="13.5" r=".6"/><circle cx="16" cy="13.5" r=".6"/></svg>',ru:'Логистика',en:'Logistics',show:()=>true},
  {id:'fin',ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M10 17V8h3.5a2.5 2.5 0 010 5H9M9 15h5"/></svg>',ru:'Финансы',en:'Finance',show:()=>true}];
const BZ=()=>window.BIZUI&&BIZUI.ready?BIZUI:null,HOME=()=>{const b=BZ();return b?b.home():'map';};
const TABS_ON=()=>TAB_DEF.filter(t=>{try{return t.show();}catch(e){return true;}}).map(t=>t.id);
function buildNav(){const n=$$('nav'),on=TABS_ON(),key=on.join()+LANG;if(n.dataset.k===key)return;n.dataset.k=key;
  n.innerHTML=TAB_DEF.filter(t=>on.indexOf(t.id)>=0).map(t=>`<button data-tab="${t.id}"${cur===t.id||(cur==='reg'&&t.id==='map')?' class="on"':''}>${t.ico}<span>${L(t.ru,t.en)}</span></button>`).join('');
  // телефон на узком экране закрывает весь экран: другая вкладка меню сначала закрывает его (на широком он сбоку — не трогаем)
  n.querySelectorAll('button').forEach(b=>b.onclick=()=>{snd('tap');if(b.dataset.tab!=='phone'&&window.PHONE&&PHONE.isOpen&&innerWidth<900)PHONE.close();go(b.dataset.tab);});}
let cur='map',curReg='kuz',hlSel=null,hlTut=false,hlScroll=false;const scrollMem={};const Q=[];const watch={};

// история экранов для «Назад» (кнопка Android, Esc, свайп от левого края, «←»): возвращает на предыдущий экран, а не всегда на главный
const navStack=[];let navBack=false;
function go(tab,r){
  // «Телефон» — не экран, а шторка поверх экрана (phone-ui.js): открыть/закрыть её, текущий экран не меняем (клавиша 1–9, UI.go('phone'))
  if(tab==='phone'){if(window.PHONE){if(PHONE.isOpen)PHONE.close();else{STAT.screen('phone');PHONE.open();}}return;}
  STAT.screen(tab); // статистика: какие экраны открывают (раз за сеанс на экран)
  const prev=cur,prevReg=curReg;if(tab==='reg'&&r)curReg=r;if(!hlTut)hlSel=null;if(tab!==cur)advStale();
  if(!navBack&&(tab!==prev||(tab==='reg'&&curReg!==prevReg))){navStack.push({t:prev,r:prevReg});if(navStack.length>30)navStack.shift();}
  const m=$$('main');scrollMem[cur+(cur==='reg'?curReg:'')]=m.scrollTop;cur=tab;
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id==='scr-'+tab));
  // плавный переход: вглубь — выезд справа, назад — слева, смена вкладки — лёгкое проявление (в спокойном режиме — без движения)
  const sc=$$('scr-'+tab);if(sc&&tab!==prev){sc.classList.remove('push','pop','fade');if(!calm()){void sc.offsetWidth;sc.classList.add(navBack?'pop':tab==='reg'?'push':'fade');}}
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab||(tab==='reg'&&b.dataset.tab==='map')));
  if(hlSel&&hlSel.indexOf('data-tab="'+tab+'"')>=0){hlSel=null;}
  render('go');m.scrollTop=scrollMem[tab+(tab==='reg'?curReg:'')]||0;tutTick();}
function render(ev){const W=w();if(!W)return;
  try{if(BZ()&&BZ().render(cur,ev)){}else if(cur==='map')rMap();else if(cur==='reg')rReg();else if(cur==='obj')rObj();else if(cur==='logi')rLogi();
    else if(cur==='market'){const el=$$('scr-market');if(ev&&ev!=='go'&&hasFin('refresh')&&el.firstChild){if(ev!=='day')FIN.refresh();}else if(hasFin('renderMarket'))FIN.renderMarket(el);else el.innerHTML='<div class="card mut">'+L('Рынок загружается…','Market is loading…')+'</div>';}
    else if(cur==='fin'){const el=$$('scr-fin');if(ev&&ev!=='go'&&hasFin('refresh')&&el.firstChild){if(ev!=='day')FIN.refresh();}else if(hasFin('renderFin'))FIN.renderFin(el);else el.innerHTML='<div class="card mut">'+L('Финансы загружаются…','Finance is loading…')+'</div>';}
  }catch(e){console.error(e);}
  navDots();applyHl();if(BZ())try{BZ().after(cur,ev);}catch(e){console.error(e);}}
// пока палец на экране — смену дня не рисуем (дорисуем сразу после отпускания): нажатие не попадает в перерисовку
let ptrDown=0,pendDay=false;
['pointerdown','touchstart'].forEach(t=>document.addEventListener(t,()=>{ptrDown=Date.now();},{capture:true,passive:true}));
['pointerup','pointercancel','touchend','touchcancel'].forEach(t=>document.addEventListener(t,()=>{ptrDown=0;if(pendDay){pendDay=false;setTimeout(()=>refresh('day'),150);}},{capture:true,passive:true}));
function refresh(ev){if(!w())return;if(ev==='day'&&ptrDown&&Date.now()-ptrDown<5000){pendDay=true;hdr();return;}if(advCur&&advCur.key==='wait'&&tutStep()==='wait')advShow(TUT.wait());for(const a of w().auc)if(a.you||a.finder==='you')watch[a.id]={g:a.g,r:a.r,p:a.p};hdr();render(ev||'change');tutTick();}

/* ================= шапка ================= */
const COMPACT=()=>window.innerHeight<700&&window.innerWidth<700;
// сумма в шапке не обрезается: если не влезает — шрифт меньше (до 17 px)
// узкий телефон и много кнопок справа: название главы/холдинга не показываем обрезанным «Хо…» (деньги и так видны)
function hnameFit(){const hn=document.querySelector('#hdr .hname');if(!hn)return;if(window.innerWidth>=700){hn.classList.remove('tiny');return;}let bw=0;
  document.querySelectorAll('#hdr .h1 .hbtn').forEach(b=>{if(b.offsetParent!==null)bw+=b.offsetWidth+8;});hn.classList.toggle('tiny',window.innerWidth-28-bw<74);}
let fitW=0;function fitCash(c){fitW=window.innerWidth;c.style.fontSize='';let fs=parseFloat(getComputedStyle(c).fontSize)||30,n=0;while(c.scrollWidth>c.clientWidth+1&&fs>17&&n++<14){fs-=1.5;c.style.fontSize=fs+'px';}}
function hdr(){const W=w();if(!W)return;hnameFit();
  {const ch=BZ()&&BZ().hname(W);$$('hName').textContent=ch?ch:holdName(W)+' ✎';}spdBtnUpd();
  $$('hDate').textContent=FMT.date(W.m);
  const c=$$('hCash'),ct=M(W.cash);if(!cashHold&&cashShown==null&&(c.textContent!==ct||fitW!==window.innerWidth)){c.textContent=ct;fitCash(c);}c.classList.toggle('neg',W.cash<0);
  const run=GAME.running(),fr=Math.min(1,(W.d+GAME.dayFrac())/E.DAYS);
  $$('hBar').style.width=(fr*100).toFixed(1)+'%';
  $$('hdr').classList.toggle('stop',!run);
  $$('hMon').textContent=FMT.date(W.m);const nar=window.innerWidth<700,dn=(nar&&window.innerWidth>=380?FMT.mon(W.m)+' · ':'')+(window.innerWidth<370||(nar&&!run)?L('день ','day ')+(W.d+1)+'/'+E.DAYS:L('день ','day ')+(W.d+1)+L(' из ',' of ')+E.DAYS);const hn0=document.querySelector('#hdr .hname'),chN=hn0&&hn0.classList.contains('tiny')&&BZ()&&BZ().hname(W);$$('hLeft').textContent=(chN?chN+' · ':'')+(run?dn:'⏸ '+dn);   // на 320 px название главы не влезает в шапку — пишем его у дня (аудит M3)
  const cr=$$('crCnt');if(cr)cr.textContent=GAME.cr();}
function navDots(){const W=w();if(!W)return;buildNav();
  const bad=W.obj.some(o=>(o.st==='b'&&o.halt)||(o.up&&o.up.halt)||(o.st==='w'&&!o.off&&o.why&&o.why!=='acc'));
  const auc=W.auc.some(a=>a.finder==='you'||(a.lead&&a.lead!=='you'&&a.you));
  const set=(t,on)=>{const b=document.querySelector('#nav [data-tab="'+t+'"]');if(!b)return;let d=b.querySelector('.dot');if(on&&!d){d=document.createElement('i');d.className='dot';b.appendChild(d);}else if(!on&&d)d.remove();};
  const nof=W.offers.some(o=>!offSeen[o.id]);if(cur==='market')for(const o of W.offers)offSeen[o.id]=1;
  set('obj',bad);set('map',auc&&cur!=='map'&&cur!=='reg');set('market',nof&&cur!=='market');}
const offSeen={};

/* ================= карта ================= */
function regStats(W,r){const P=W.plots[r];let ex=0,mine=0;for(const p of P){if(p.st!=='hid'&&p.st!=='exp'&&p.st!=='bex')ex++;if(p.own==='you')mine++;}
  const objs=W.obj.filter(o=>o.r===r);return {n:P.length,ex,mine,objs,st:E.stockR(W,r),cap:E.storR(W,r)};}
function topGoods(r,n){const p=E.REGS[r].p;return Object.keys(p).sort((a,b)=>p[b]-p[a]).slice(0,n);}
function mapSvg(W){const mw=$$('main').clientWidth||360,wide=mw>=700;
  const cw=window.innerWidth>=900?(mw-48)*1.3/2.3:mw-28,vb=wide?[-4,70,500,270]:[4,80,470,270],k=vb[2]/Math.max(280,cw),u=px=>+(px*k).toFixed(1);
  let s=`<svg viewBox="${vb.join(' ')}" role="img" aria-label="${L('Карта России','Map of Russia')}">`;
  s+=`<path d="${LAND}" class="map-land" stroke-width="${u(1.4)}" stroke-linejoin="round"/>`;
  const pairs=[['kar','ural'],['ural','kuz'],['kar','kuz']];
  for(const [a,b] of pairs){const A=PX(...E.REGS[a].xy),B=PX(...E.REGS[b].xy),arc=a==='kar'&&b==='kuz';
    const C=arc?[(A[0]+B[0])/2,Math.min(A[1],B[1])-(wide?80:64)]:null;
    const d=arc?`M${A[0]},${A[1]} Q${C[0]},${C[1]} ${B[0]},${B[1]}`:`M${A[0]},${A[1]} L${B[0]},${B[1]}`;
    s+=`<path d="${d}" fill="none" class="${arc?'map-arc':'map-rail'}" stroke-width="${u(2)}" stroke-linecap="round"${arc?` stroke-dasharray="${u(4)} ${u(5)}" opacity=".75"`:''}/>`;
    const km=E.km(a,b),dd=E.transitDays(W,a,b),lb=`${FMT.num(km)} ${L('км','km')} · ${dd} ${L('дн.','d')}`;
    const tt=a==='kar'?.38:.64;let m=arc?[(A[0]+2*C[0]+B[0])/4,(A[1]+2*C[1]+B[1])/4-u(10)]:[A[0]+(B[0]-A[0])*tt,A[1]+(B[1]-A[1])*tt];
    if(!arc){const dx=B[0]-A[0],dy=B[1]-A[1],ln=Math.hypot(dx,dy),sg=a==='kar'?1:-1;m=[m[0]-dy/ln*u(24)*sg,m[1]+dx/ln*u(24)*sg];}else m[0]+=u(wide?30:24);
    const tw=u(lb.length*6.9+16);
    s+=`<g transform="translate(${m[0].toFixed(1)} ${m[1].toFixed(1)})"><rect x="${-tw/2}" y="${-u(12)}" width="${tw}" height="${u(23)}" rx="${u(11.5)}" class="map-tag" stroke-width="${u(1)}"/><text y="${u(4.5)}" text-anchor="middle" class="map-tagt" font-size="${u(12.5)}">${lb}</text></g>`;}
  s+=`<circle cx="${MOSCOW[0]}" cy="${MOSCOW[1]}" r="${u(3.5)}" class="map-city"/><text x="${(MOSCOW[0]+u(7)).toFixed(1)}" y="${(MOSCOW[1]+u(16)).toFixed(1)}" font-size="${u(13)}" class="map-cityt">${L('Москва','Moscow')}</text>`;
  for(const r of E.REG){const P=PX(...E.REGS[r].xy),st=regStats(W,r),g=topGoods(r,1)[0],R=u(22),auc=W.auc.some(a=>a.r===r&&!a.done),sel=cur==='reg'&&curReg===r;
    s+=`<g class="rg${sel||auc?' sel':''}" data-a="reg" data-r="${r}"><circle cx="${P[0]}" cy="${P[1]}" r="${(R+u(12)).toFixed(1)}" class="map-halo"/><circle cx="${P[0]}" cy="${P[1]}" r="${R}" class="map-mk" stroke-width="${u(2.4)}"/>`;
    s+=`<svg x="${(P[0]-R*.78).toFixed(1)}" y="${(P[1]-R*.78).toFixed(1)}" width="${(R*1.56).toFixed(1)}" height="${(R*1.56).toFixed(1)}" viewBox="0 0 40 40">${gSvg(g)}</svg>`;
    if(st.objs.length)s+=`<circle cx="${(P[0]+R*.82).toFixed(1)}" cy="${(P[1]-R*.82).toFixed(1)}" r="${u(10)}" class="map-badge" stroke-width="${u(2)}"/><text x="${(P[0]+R*.82).toFixed(1)}" y="${(P[1]-R*.82+u(4.5)).toFixed(1)}" text-anchor="middle" font-size="${u(13)}" class="map-badget">${st.objs.length}</text>`;
    if(auc)s+=`<g transform="translate(${(P[0]-R*1.1).toFixed(1)} ${(P[1]-R*1.25).toFixed(1)})"><rect x="${-u(32)}" y="${-u(12)}" width="${u(64)}" height="${u(22)}" rx="${u(6)}" class="map-aucb"/><text y="${u(4.5)}" text-anchor="middle" font-size="${u(12)}" class="map-auct">${L('ТОРГИ','AUCTION')}</text></g>`;
    const ly=r==='kar'?P[1]-R-u(10):P[1]+R+u(19);
    s+=`<text x="${P[0]}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="${u(16)}" class="map-rgn">${NM.reg(r)}</text></g>`;}
  return s+'</svg>';}
function newsList(W,n){const L2=W.news.slice(-n).reverse();if(!L2.length)return '';const adv=hasAdv('news');
  return L2.map(x=>{let t=newsText(x);if(!t)return '';return adv?`<div class="n"><span>${esc(t)}</span></div>`:`<div class="n"><i>${FMT.mon(x.m)}</i><span>${esc(t)}</span></div>`;}).join('');}
function regCard(W,r){const st=regStats(W,r),g=topGoods(r,2),full=st.st/st.cap,auc=W.auc.some(a=>a.r===r&&!a.done);
  const mine=st.objs.length?st.objs.slice(0,4).map(o=>`<span title="${esc(NM.obj(o.t))}">${oIco(o.t)}</span>`).join('')+(st.objs.length>4?` +${st.objs.length-4}`:''):'';
  return `<button class="card tap regc" id="rc-${r}" data-a="reg" data-r="${r}"><div class="rico">${gIco(g[0])}</div><div class="f1" style="flex:1;min-width:0">
    <b class="t">${NM.reg(r)}</b> <span class="mut">· ${NM.city(r)}</span>
    <div class="ln">${L('В недрах','Mostly')}: <b>${g.map(x=>low(NM.good(x))).join(', ')}</b></div>
    <div class="chips">${auc?`<span class="chip a">${L('Идут торги','Auction on')}</span>`:''}<span class="chip">${L('Участков','Plots')} ${st.n} · ${L('ваших','yours')} ${st.mine}</span>${st.objs.length?`<span class="chip">${L('Объектов','Assets')} ${st.objs.length} <span class="mini">${mine}</span></span>`:''}</div>
    <div class="bar${full>.85?' warn':''}"><i style="width:${Math.min(100,full*100).toFixed(0)}%"></i></div>
    <div class="ln">${L('Склад','Storage')} ${FMT.num(Math.round(st.st/100)/10)} ${L('из','of')} ${FMT.num(Math.round(st.cap/1000))} ${L('тыс. мест','k units')}</div>
    </div><span class="chev">›</span></button>`;}
function rMap(){const W=w(),el=$$('scr-map'),v=GAME.value(),ready=GAME.ipoReady(),last=W.hist[W.hist.length-1],prev=W.hist[W.hist.length-2];
  let h=`<div class="mcols"><div><div class="card mapc">${mapSvg(W)}</div>`;
  // стоимость и прибыль — крупно
  h+=`<div class="card strip"><div><span>${L('Стоимость компании','Company value')}</span><b>${M(v)}</b>${prev?`<span class="${last.eq>=prev.eq?'up':'dn'}">${last.eq>=prev.eq?'▲':'▼'} ${FMT.pct(Math.abs(last.eq/Math.max(1,prev.eq)-1),1)} ${L('за месяц','a month')}</span>`:''}</div>
    <div><span>${last?L('Прибыль за '+FMT.date(last.m).split(' ')[0].toLowerCase(),'Profit, '+FMT.date(last.m).split(' ')[0]):L('Прибыль','Profit')}</span><b class="${last&&last.np<0?'dn':''}">${last?M(last.np):'—'}</b>${prev?`<span class="${last.np>=prev.np?'up':'dn'}">${last.np>=prev.np?'▲':'▼'} ${M(Math.abs(last.np-prev.np))}</span>`:''}</div></div>`;
  h+=`</div><div><h3 class="rgh">${L('Регионы','Regions')}</h3>`+E.REG.map(r=>regCard(W,r)).join('')+'</div></div>';
  // «Планёрка» (подарок дня, задачи), цель квартала, вехи, буст продаж — js/meta-ui.js дорисовывает слот сам (META.card), как на «Сегодня»
  h+='<div id="metaMap" data-keep="1"></div>';
  // IPO
  h+=`<h3>${L('Путь к IPO','Road to IPO')}</h3><div class="card">`;
  if(ready)h+=`<p><b>${L('Холдинг готов к выходу на биржу!','The holding is ready to go public!')}</b></p><button class="btn accent w" data-a="ipo">🔔 ${L('Выйти на биржу (IPO)','Go public (IPO)')}</button>`;
  else{const hs=W.hist.slice(-12),np=hs.reduce((a,x)=>a+x.np,0);
    h+=`<div class="flex"><span class="f1 mut">${L('Стоимость компании','Company value')}</span><b>${M(v)} <span class="mut" style="font-weight:400">/ ${M(E.IPO_EQ)}</span></b></div><div class="bar blue"><i style="width:${Math.max(1,Math.min(100,v/E.IPO_EQ*100)).toFixed(1)}%"></i></div>
      <p class="mut" style="font-size:15px">${L(`Для IPO нужно: стоимость от ${M(E.IPO_EQ)} и прибыль за последние 12 месяцев (сейчас ${hs.length<12?'месяцев отчётов: '+hs.length:M(np)}).`,`IPO needs: value from ${M(E.IPO_EQ)} and a profit over the last 12 months (now ${hs.length<12?'months reported: '+hs.length:M(np)}).`)}</p>`;}
  h+='</div>';
  const rows=[{n:L('Вы','You'),v,c:'var(--accent)',me:1}].concat(W.bots.map(b=>({n:NM.bot(b.id),v:E.botValue(W,b),c:botCol(b.id)}))).sort((a,b)=>b.v-a.v);
  h+=`<div class="cols"><div><h3>${L('Вы и соперники','You vs rivals')}</h3><div class="card">`+
    rows.map((x,i)=>`<div class="rv${x.me?' me':''}"><span class="mut" style="width:26px;flex:none">${i+1}</span><i class="sw" style="background:${x.c}"></i><span class="f1">${esc(x.n)}</span><b>${M(x.v)}</b></div>`).join('')+'</div></div>';
  const nl=newsList(W,8);h+=nl?`<div><h3>${L('Новости','News')}</h3><div class="card news">${nl}</div></div>`:'';h+='</div>';
  if(S.fame&&S.fame.length)h+=`<p class="mut" style="text-align:center;font-size:15px">🏛 ${L('Прошлые холдинги','Past holdings')}: ${S.fame.map(f=>'№'+f.hold+' — '+M(f.eq)).join(' · ')}</p>`;
  if(typeof socMoreHtml==='function')h+=socMoreHtml(); // VK с мостом: «🎲 Ещё игры во дворе»
  put(el,h);
  const ms=$$('metaMap');if(ms&&window.META&&typeof META.card==='function'){try{META.card(ms);}catch(e){console.error(e);}}}

/* ================= регион ================= */
function tutPlotFast(W,p){return p.tut&&W.obj.length===0&&!W.ach.expl;}
function plotTile(W,p){const no=plotNo(p);let c='plot',h='';const d=p.dep;
  switch(p.st){
    case 'hid':{c+=' hid';const cost=E.explCost(W,p.r),dd=tutPlotFast(W,p)?6:E.explDays(W);
      h=`<div class="pn">${no}</div><div class="q">?</div><div class="pt">${L('Не разведан','Unexplored')}</div>
        <button class="btn accent sm noenter" data-a="expl" data-id="${p.id}">${L('Разведать','Explore')}<small>${M(cost)} · ${days(dd)}</small></button>`;
      if(adOk()&&GAME.freeExplOk())h+=`<button class="btn sm noenter" data-a="explAd" data-id="${p.id}">📺 ${L('Бесплатно за рекламу','Free for an ad')}</button>`;break;}
    case 'exp':h=`<div class="pn">${no}</div><div class="pt">🔎 ${L('Идёт разведка','Exploring')}</div><p>${L('Осталось','Left')}: <b>${days(p.left)}</b></p>
        <button class="btn cr noenter" data-a="explNow" data-id="${p.id}">💎 ${GAME.CR.expl} — ${L('узнать сразу','find out now')}</button>`;break;
    case 'bex':c+=' bot';h=`<div class="pn">${no}</div><div class="pt">🔎 ${L('Разведывает соперник','A rival is exploring')}</div>`;break;
    case 'empty':c+=' empty';h=`<div class="pn">${no}</div><div class="pt">${L('Пусто','Empty')}</div><p style="font-size:15px">${L('Полезного не нашли','Nothing useful found')}</p>`;break;
    case 'found':{c+=' wide mine';const V=E.depVal(W,p.r,d);
      h=`<div class="pn">${no} · ${L('найдено','found')}</div><div class="flex" style="margin:4px 0"><span class="ico">${gIco(d.g)}</span><div class="f1" style="margin-left:10px"><div class="pt" style="margin:0">${NM.good(d.g)}</div></div></div>`+depFacts(W,p)+
        `<div class="tip">${L(`Оценка участка — <b>${M(V)}</b>. Выгодно, если лицензия не дороже ~0,6 оценки (≈ ${M(V*.6)}).`,`Plot estimate: <b>${M(V)}</b>. Worth it if the licence costs no more than ~0.6 of that (≈ ${M(V*.6)}).`)}</div>`;
      if(p.direct)h+=`<button class="btn green noenter" data-a="buyD" data-id="${p.id}">${L('Купить лицензию без торгов','Buy the licence directly')}<small>${M(p.direct)}</small></button>
        <button class="btn sm noenter" data-a="passD" data-id="${p.id}">${L('Отказаться (выставить на торги)','Decline (put up for auction)')}</button>`;
      break;}
    case 'auc':{c+=' wide auc';const a=W.auc.find(x=>x.p===p.id);if(!a){h=`<div class="pn">${no}</div>`;break;}
      const lead=a.lead==='you'?L('вы','you'):a.lead?NM.bot(a.lead):L('пока никого','no one yet');
      h=`<div class="pn">${no} · ${L('торги','auction')}</div><div class="flex" style="margin:4px 0"><span class="ico">${gIco(a.g)}</span><div class="f1" style="margin-left:10px"><div class="pt" style="margin:0">🔨 ${NM.good(a.g)}</div>
        <div style="font-size:16px">${L('Цена','Price')}: <b>${M(a.pr)}</b> · ${L('лидер','leader')}: <b>${esc(lead)}</b> · ${L('ещё','left')} ${days(Math.max(0,a.end-W.t))}</div></div></div>
        <button class="btn accent noenter" data-a="auc" data-id="${a.id}">${L('Открыть торги','Open the auction')}</button>`;break;}
    case 'lic':{if(p.own==='you'){const o=W.obj.find(x=>x.plot===p.id);c+=' mine';
        if(!o){c+=' wide';const t=E.MINE_OF[d.g],cap=E.capexOf(W,t,p.r,p.id),mo=W.tut&&t==='coalpit'&&!W.obj.length?1:E.OBJ[t].mo;
          h=`<div class="pn">${no} · ${L('ваша лицензия','your licence')}</div><div class="flex" style="margin:4px 0"><span class="ico">${oIco(t)}</span><div class="f1" style="margin-left:10px"><div class="pt" style="margin:0">${NM.good(d.g)}</div></div></div>`+depFacts(W,p)+
          `<p style="font-size:16px">${L(`Выпуск — ${FMT.qty(E.OBJ[t].cap,d.g)} в месяц, постоянные расходы — ${M(E.OBJ[t].fix)} в месяц.`,`Output: ${FMT.qty(E.OBJ[t].cap,d.g)} a month, fixed costs ${M(E.OBJ[t].fix)} a month.`)}</p>
          <button class="btn green noenter" data-a="bmine" data-id="${p.id}">${L('Построить','Build')}: ${low(NM.obj(t))}<small>${M(cap)} · ${mons(mo)}</small></button>`;}
        else h=`<div class="pn">${no} · ${L('ваш','yours')}</div><div class="flex"><span class="ico">${oIco(o.t)}</span></div><div class="pt">${NM.obj(o.t)}</div>
          ${o.st==='b'?`<p style="font-size:15px;margin:2px 0">${o.halt?L('стройка стоит — нет денег','stopped — no money'):L('строится, ещё ','building, ')+days(o.left)+L('',' left')}</p><div class="bar"><i style="width:${((o.tot-o.left)/o.tot*100).toFixed(0)}%"></i></div>`+spdBtn(o)
            :o.up?`<p style="font-size:15px;margin:2px 0">${L('модернизация, ещё ','upgrading, ')+days(o.up.left)+L('',' left')}</p>`+spdBtn(o):`<p style="font-size:15px">${L('запас','reserve')}: ${FMT.qty(d.res,d.g)}</p>`}`;}
      else{c+=' bot';h=`<div class="pn">${no}</div><div class="own"><i style="background:${botCol(p.own)}"></i>${esc(NM.bot(p.own))}</div><div class="flex" style="margin-top:6px"><span class="ico sm">${gIco(d.g)}</span><span style="margin-left:6px">${NM.good(d.g)}</span></div><p class="mut" style="font-size:15px">${L('лицензия соперника','rival’s licence')}</p>`;}
      break;}}
  return `<div class="${c}" id="pl-${p.id}">${h}</div>`;}
function depFacts(W,p){const d=p.dep;return `<div class="facts"><span>${L('Запас','Reserve')}</span><b>${FMT.qty(d.res,d.g)}</b>
  <span>${L('Добыча обойдётся','Mining cost')}</span><b>${FMT.num(d.vc)} ₽/${NM.unit(d.g)}</b>
  <span>${L('Цена на месте','Local price')}</span><b>${ppu(p.r,d.g)}</b>
  <span>${L('Стройка здесь','Build cost here')}</span><b>${d.cm>1.005?L('дороже на ','+')+FMT.pct(d.cm-1):L('обычная','standard')}</b></div>`;}
function rReg(){const W=w(),r=curReg,el=$$('scr-reg'),st=regStats(W,r),full=st.st/st.cap;
  let h=`<div class="rh"><button class="back" data-a="back">← ${L('Карта','Map')}</button><h2>${NM.reg(r)}<small>${NM.city(r)} · ${L('в недрах чаще','mostly')} ${topGoods(r,2).map(g=>low(NM.good(g))).join(', ')}</small></h2></div>`;
  h+=`<div class="card hero">${scene(r)}</div>`;
  // склад
  const gs=E.GL.filter(g=>W.inv[r][g].q>=1);const inb=W.tr.filter(x=>x.to===r);
  h+=`<div class="card"><div class="flex" style="flex-wrap:wrap"><b class="f1" style="margin-right:10px">${L('Склад','Warehouse')}</b><span style="white-space:nowrap">${FMT.num(Math.round(st.st))} ${L('из','of')} ${FMT.num(st.cap)} ${L('мест','units')}</span></div>
    <div class="bar${full>.85?' warn':''}"><i style="width:${Math.min(100,full*100).toFixed(0)}%"></i></div>
    ${gs.length?'<div class="gl">'+gs.map(g=>`<span class="g">${gIco(g)}${NM.good(g)} <b>${FMT.qty(W.inv[r][g].q,g)}</b></span>`).join('')+'</div>':`<p class="mut">${L('Склад пуст','Empty')}</p>`}
    ${inb.length?`<p style="font-size:16px">🚂 ${L('Едет сюда','Inbound')}: ${inb.map(x=>FMT.qty(x.q,x.g)+' '+low(NM.good(x.g))).join(', ')}</p>`:''}
    ${full>.85?`<div class="tip">${L('Склад почти полон: добыча встанет. Продайте товар на рынке или постройте склад (+30 тыс. мест).','Almost full: production will stop. Sell on the market or build a warehouse (+30k units).')}</div>`:''}</div>`;
  // цены
  h+=`<h3>${L('Цены на месте','Local prices')}</h3><div class="card"><div class="prices">`;
  for(const g of E.GL){const ph=W.mk[g].ph,prev=ph.length?ph[ph.length-1]:1,d=W.mk[g].i/prev-1;
    h+=`<div class="p">${gIco(g)}<div><span>${NM.good(g)}</span><b>${FMT.num(E.price(W,r,g))} ₽</b>${Math.abs(d)>.01?`<i class="${d>0?'up':'dn'}" style="font-style:normal;margin-left:4px">${d>0?'▲':'▼'}</i>`:''}</div></div>`;}
  h+=`</div><p class="mut" style="font-size:15px;margin-top:8px">${L('За тонну (лес — за кубометр). Стрелка — цена за месяц выросла или упала.','Per tonne (timber per m³). Arrow — price change over the month.')}</p></div>`;
  // участки
  h+=`<h3>${L('Участки недр','Plots')} <small>${L('с «?» — не разведаны','“?” — not explored')}</small></h3><div class="plots">`+W.plots[r].map(p=>plotTile(W,p)).join('')+'</div>';
  // заводы
  h+=`<h3>${L('Заводы и склады','Plants and warehouses')}</h3><div class="card"><p style="margin-top:0">${L('Завод можно поставить в любом регионе. Сырьё покупают на месте (дороже на 6 %) или везут по железной дороге со своих рудников.','A plant can go in any region. Raw materials are bought locally (6% dearer) or brought by rail from your mines.')}</p>
    <button class="btn accent w noenter" data-a="bfac">🏭 ${L('Построить завод или склад','Build a plant or warehouse')} ${regIn(r)}</button>`;
  const lines=E.REG.filter(x=>x!==r).map(x=>{const t=E.tariff(W,x,r),g=topGoods(x,1)[0];return `<li>${L(`${NM.good(g)} ${RFROM[x]} ${RTO[r]}: ${rub(t)}/т + аренда вагонов ${rub(E.rentRate(W))}/т, в пути ${days(E.transitDays(W,x,r))}`,`${NM.good(g)} from ${NM.reg(x)} to ${NM.reg(r)}: ${rub(t)}/t + wagon rent ${rub(E.rentRate(W))}/t, ${days(E.transitDays(W,x,r))} on the way`)}</li>`;}).join('');
  h+=`<p class="mut" style="font-size:16px;margin-bottom:0">🚂 ${L('Перевозка','Freight')}:</p><ul style="margin:4px 0 0;padding-left:20px;font-size:16px">${lines}</ul></div>`;
  const objs=W.obj.filter(o=>o.r===r);
  if(objs.length)h+=`<h3>${L('Ваши объекты здесь','Your assets here')}</h3><div class="card">`+objs.map(o=>`<div class="rt">${oIco(o.t)}<div class="f1"><b>${NM.obj(o.t)}</b><span>${objStatus(o)}</span></div></div>`).join('')+`<button class="btn w" data-a="tab" data-t="obj" style="margin-top:8px">${L('Все объекты','All assets')} ›</button></div>`;
  put(el,h);}
function objStatus(o){if(o.st==='b')return o.halt?L('стройка стоит — нет денег','construction stopped — no money'):L('строится, осталось ','building, ')+days(o.left)+L('',' left');
  if(o.off)return L('законсервирован','mothballed');const y=whyTxt(o);if(y)return L('простой: ','idle: ')+y;
  const O=E.OBJ[o.t];if(o.t==='store')return L('+30 тыс. мест на складе','+30k storage');return L('работает: ','working: ')+FMT.qty(E.objCap(o),O.out)+L(' в месяц',' a month');}

/* ---- ускорение за 💎 (стройка/модернизация −15 дней, раз на объект) ---- */
// + «📺 на 5 дней раньше за рекламу» — раз на стройку/модернизацию, отдельно от 💎 (E.objAdSpeed), лимит в день — GAME.adLeft('build')
function adL(k){try{return adOk()&&GAME.adLeft(k)>0;}catch(e){return false;}}
function adRun(k,name,args,ok){STAT.place(k);showRewarded(()=>{let r=null;try{r=GAME.adAct(k,name,...args);}catch(e){console.error(e);}
  if(r==='day'){tst(L('На сегодня этот бонус закончился — загляните завтра','That bonus is used up for today — come back tomorrow'));return;}
  if(r&&r!=='no'&&r!=='cash')ok(r);setTimeout(nextQ,60);},()=>setTimeout(nextQ,60));}
function spdBtn(o){const j=o.st==='b'?o:o.up;if(!j)return '';const W=w(),ad=adL('build')&&E.objAdSpeedOk&&E.objAdSpeedOk(W,o.id);
  const adB=ad?`<button class="btn w noenter" data-a="spdAd" data-id="${o.id}" style="margin-top:6px">📺 ${L('на 5 дней раньше — за рекламу','5 days sooner — for an ad')}</button>`:'';
  if(o.sp)return `<p class="mut" style="font-size:15px;margin:6px 0 0">⚡ ${L('уже ускорено','already sped up')}</p>`+adB;
  return `<button class="btn cr w noenter" data-a="spd" data-id="${o.id}">💎 ${GAME.CR.speed} — ${L('ускорить','speed up')}<small>${L('готово на 15 дней раньше','done 15 days sooner')}</small></button>`+adB;}
function crAsk(n,what,fn){const c=GAME.cr();if(c<n)return crNo();
  modal(`<h2>💎 ${L('Потратить кристаллы?','Spend crystals?')}</h2><p style="text-align:center">${what}</p><p style="text-align:center;font-size:20px">${L('Потратить','Spend')} <b>${n} 💎</b>? ${L('Останется','Left')}: <b>${c-n} 💎</b></p>
    <div class="row"><button class="btn cr noenter" id="caYes">💎 ${L('Да, потратить','Yes, spend')} ${n}</button><button class="btn" id="caNo" data-esc>${L('Нет','No')}</button></div>`);
  $$('caYes').onclick=()=>{hideModal();fn();setTimeout(nextQ,60);};$$('caNo').onclick=()=>{snd('tap');closeM();};}
function crNo(){snd('no');const lb=adOk()&&GAME.ladLabel?GAME.ladLabel():'',ad=!!lb;
  modal(`<h2>💎 ${L('Не хватает кристаллов','Not enough crystals')}</h2><p>${L(`У вас ${GAME.cr()} 💎. Кристаллы даются за первые шаги, каждый игровой год, в Планёрке, за «Ролики дня» (2, 3, 3, 4 и 6 💎 — каждый следующий щедрее) и в магазине.`,`You have ${GAME.cr()} 💎. Crystals come for first steps, every game year, in the Briefing, for daily videos (2, 3, 3, 4 and 6 💎 — each one more generous) and in the shop.`)}</p>
    <div class="row">${ad?`<button class="btn accent noenter" id="crAd">${lb}</button>`:''}<button class="btn noenter" id="crShop">🛒 ${L('Магазин','Shop')}</button><button class="btn" id="crClose" data-esc>${L('Закрыть','Close')}</button></div>${typeof adDayHtml==='function'?adDayHtml():''}`);
  try{modalRe=crNo;}catch(e){}
  if($$('crAd'))$$('crAd').onclick=()=>{hideModal();GAME.ladWatch();setTimeout(nextQ,60);};
  $$('crShop').onclick=()=>{snd('tap');try{openShop();}catch(e){}};
  $$('crClose').onclick=()=>{snd('tap');closeM();};}

/* ---- подтверждение крупной траты (>30 % денег или уводит в минус) ---- */
function fixM(W){let f=1.5e6;for(const o of W.obj)if(o.st==='w'){f+=E.objFix(o)+4e5;}return f;}
function spendOk(cost,mo,what,fn,nf){const W=w(),cash=W.cash;if(tutStep()||(cost<=cash*.3&&cost<=cash))return fn();
  const left=cash-cost,fm=fixM(W),mm=left>0?Math.floor(left/fm):0,add=nf?`${L(' После пуска добавится ещё ',' After launch, add ')}${M(nf)}${L(' в месяц.',' a month.')}`:'';
  modal(`<h2>💰 ${L('Крупная трата','A big spend')}</h2>
    <p>${what}: <b>${M(cost)}</b>${mo?L(` — сразу ${M(cost*.2)}, остальное — по ходу стройки (${mons(mo)}).`,` — ${M(cost*.2)} now, the rest during construction (${mons(mo)}).`):'.'}</p>
    <div class="tiles"><div class="tile"><span>${L('Сейчас на счёте','In the account')}</span><b>${M(cash)}</b></div><div class="tile ${left<0?'neg':mm<2?'neg':'pos'}"><span>${left<0?L('Не хватит','Short by'):L('Останется','Left over')}</span><b>${M(Math.abs(left))}</b></div></div>
    <div class="say">${face(left<0||mm<2?'worry':'calm')}<div><p>${left<0?L('Денег не хватит: стройка встанет, а если деньги кончатся совсем — банк даст овердрафт под высокий процент. Надёжнее сначала взять кредит.','Not enough money: construction will stall, and if cash runs out the bank gives an expensive overdraft. Safer to take a loan first.')
      :mm<2?L(`После этого денег хватит примерно на ${mons(mm)} постоянных расходов (${M(fm)} в месяц). Рискованно.`,`After that, cash covers about ${mons(mm)} of fixed costs (${M(fm)} a month). Risky.`)
      :L(`Постоянные расходы сейчас (офис и работающие объекты) — около ${M(fm)} в месяц: запаса хватит примерно на ${mons(mm)}.`,`Current fixed costs (office and running assets) are about ${M(fm)} a month: the cushion lasts about ${mons(mm)}.`)}${add}</p></div></div>
    <div class="row"><button class="btn ${left<0?'':'green'} noenter" id="spYes">${L('Да, тратим','Yes, spend it')}</button>${left<0||mm<2?`<button class="btn blue noenter" id="spBank">🏦 ${L('Сначала в банк','Bank first')}</button>`:''}<button class="btn" id="spNo" data-esc>${L('Отмена','Cancel')}</button></div>`);
  $$('spYes').onclick=()=>{hideModal();fn();setTimeout(nextQ,60);};
  if($$('spBank'))$$('spBank').onclick=()=>{snd('tap');closeM();goFin('bank')();};
  $$('spNo').onclick=()=>{snd('tap');closeM();};}

/* ---- окно «построить завод» ---- */
const FAC=Object.keys(E.OBJ).filter(t=>E.OBJ[t].in).concat(E.OBJ.store?['store']:[]);
function facEcon(W,t,r){const O=E.OBJ[t];if(!O.out)return null;let c=O.vc||0;for(const g in O.in)c+=O.in[g]*E.buyPrice(W,r,g,O.cap*O.in[g]);const p=E.price(W,r,O.out);return {p,c,m:(p-c)*O.cap-O.fix};}
function openFac(r){const W=w();let h=`<h2>🏭 ${L('Завод','Plant')} ${regIn(r)}</h2><p class="mut" style="text-align:center">${L('Сразу нужно 20 % цены, остальное платится по ходу стройки.','20% of the price is needed up front, the rest is paid during construction.')}</p>`;
  for(const t of FAC){const O=E.OBJ[t],cap=E.capexOf(W,t,r),ec=facEcon(W,t,r),ok=W.cash>=cap*.2;
    h+=`<div class="card" style="background:var(--soft);box-shadow:none"><div class="flex"><span class="ico">${oIco(t)}</span><b class="f1" style="margin-left:10px;font-size:19px">${NM.obj(t)}</b></div><div class="facts">`;
    if(O.in)h+=`<span>${L('Сырьё на 1 ','Input per 1 ')}${NM.unit(O.out)}</span><b>${Object.keys(O.in).map(g=>FMT.num(O.in[g],1)+' '+NM.unit(g)+' '+(LANG==='en'?low(NM.good(g)):GEN[g])).join(' + ')}</b>
      <span>${L('Выпуск в месяц','Output a month')}</span><b>${FMT.qty(O.cap,O.out)} ${LANG==='en'?low(NM.good(O.out)):GEN[O.out]}</b>`;
    else h+=`<span>${L('Вместимость','Capacity')}</span><b>+${FMT.num(O.stor)} ${L('мест','units')}</b>`;
    h+=`<span>${L('Стройка','Build')}</span><b>${M(cap)} · ${mons(O.mo)}</b><span>${L('Постоянные','Fixed costs')}</span><b>${M(O.fix)} ${L('в мес.','a month')}</b></div>`;
    if(ec)h+=`<p style="font-size:16px;margin:4px 0">${L('По нынешним ценам','At today’s prices')}: ${L('продажа','sell')} ${rub(ec.p)}, ${L('сырьё (покупка на месте) и передел','inputs (bought locally) and processing')} ${rub(ec.c)} → <b class="${ec.m>=0?'good':'bad'}">${ec.m>=0?'+':''}${M(ec.m)} ${L('в месяц','a month')}</b></p>`;
    h+=`<button class="btn ${ok?'green':''} w noenter" data-fac="${t}"${ok?'':' disabled'}>${ok?L('Построить','Build'):L('Не хватает денег','Not enough money')}<small>${M(cap)}</small></button></div>`;}
  h+=`<div class="row"><button class="btn" id="fClose" data-esc>${L('Закрыть','Close')}</button></div>`;
  modal(h);try{modalRe=()=>openFac(r);}catch(e){}
  $$('fClose').onclick=()=>{snd('tap');closeM();};
  document.querySelectorAll('#mcard [data-fac]').forEach(b=>b.onclick=()=>{const t=b.dataset.fac;hideModal();spendOk(E.capexOf(w(),t,r),E.OBJ[t].mo,NM.obj(t),()=>{const res=act('build',t,r,null);if(res==='ok'){snd('build');tst(L('Стройка началась: ','Construction started: ')+low(NM.obj(t)));tutRoute(t,r);}setTimeout(nextQ,60);},E.OBJ[t].fix);});}

/* ================= объекты ================= */
// «Объекты»: компактные строки (значок, название, состояние) — подробности открываются нажатием; фильтр «⚠ проблемы», проблемные — первыми
const objOpen={};let objF='all';
function objProb(o){return (o.st==='b'&&o.halt)||(o.up&&o.up.halt)||(o.st==='w'&&!o.off&&!!o.why&&o.why!=='acc');}
function objLine(o){const O=E.OBJ[o.t];
  if(o.st==='b')return o.halt?`<span class="bad">⚠ ${L('стройка стоит — нет денег','construction stopped — no money')}</span>`:L('строится, ещё ','building, ')+days(o.left)+L('',' left');
  if(o.off)return L('законсервирован','mothballed');
  const y=whyTxt(o);if(y&&o.why!=='acc')return `<span class="bad">⚠ ${L('простой','idle')}: ${esc(y)}</span>`;
  if(o.up)return o.up.halt?`<span class="bad">⚠ ${L('модернизация стоит','upgrade stopped')}</span>`:L('модернизация, ещё ','upgrading, ')+days(o.up.left)+L('',' left');
  return O.out?L('работает · ','running · ')+FMT.qty(E.objCap(o),O.out)+L(' в мес.',' a month'):O.stor?L('склад · +','storage · +')+FMT.num(O.stor):L('работает','running');}
function rObj(){const W=w(),el=$$('scr-obj');let h='';
  if(!W.obj.length){el.innerHTML=`<div class="card" style="text-align:center"><div style="width:90px;height:90px;margin:6px auto">${oIco('coalpit')}</div><p><b>${L('Объектов пока нет','No assets yet')}</b></p><p class="mut">${L('Разведайте участок, получите лицензию и постройте рудник — или поставьте завод.','Explore a plot, get a licence and build a mine — or set up a plant.')}</p><button class="btn accent w" data-a="tab" data-t="map">${L('К карте','To the map')}</button></div>`;return;}
  const out={};for(const o of W.obj){const O=E.OBJ[o.t];if(o.st==='w'&&!o.off&&O.out)out[O.out]=(out[O.out]||0)+E.objCap(o);}
  let fix=0;for(const o of W.obj)if(o.st==='w')fix+=E.objFix(o);
  h+=`<div class="card sum"><b>${L('Можем производить в месяц','Monthly capacity')}</b>${Object.keys(out).length?'<div class="gl">'+Object.keys(out).map(g=>`<span class="g">${gIco(g)}${NM.good(g)} <b>${FMT.qty(out[g],g)}</b></span>`).join('')+'</div>':`<p class="mut">${L('Заводы и карьеры недр пока не работают','No mines or plants are running yet')}</p>`}
    <p class="mut" style="font-size:16px;margin-bottom:0">${L('Постоянные расходы объектов','Fixed costs of assets')}: <b>${M(fix)}</b> ${L('в месяц','a month')}</p></div>`;
  const nP=W.obj.filter(objProb).length,nB=W.obj.filter(o=>o.st==='b'||o.up).length;if(objF==='prob'&&!nP&&!objOpen._keep)objF='all';
  h+=`<div class="fchips" role="tablist"><button class="chip${objF==='all'?' a':''}" data-a="objf" data-v="all" role="tab" aria-selected="${objF==='all'}">${L('Все','All')} ${W.obj.length}</button><button class="chip${objF==='prob'?' a':''}${nP?' warn':''}" data-a="objf" data-v="prob" role="tab" aria-selected="${objF==='prob'}">⚠ ${L('Проблемы','Problems')} ${nP}</button>${nB?`<button class="chip${objF==='b'?' a':''}" data-a="objf" data-v="b" role="tab" aria-selected="${objF==='b'}">🏗 ${L('Стройка','Building')} ${nB}</button>`:''}</div>`;
  const ok=o=>objF==='prob'?objProb(o):objF==='b'?(o.st==='b'||!!o.up):true;let any=false;
  for(const r of E.REG){const os=W.obj.filter(o=>o.r===r&&ok(o)).sort((a,b)=>(objProb(b)?1:0)-(objProb(a)?1:0));if(!os.length)continue;any=true;h+=`<h3 class="rgh">${NM.reg(r)} <small>· ${os.length}</small></h3>`;
    h+='<div class="cols">'+os.map(o=>objCard(W,o)).join('')+'</div>';}
  if(!any)h+=`<div class="card mut" style="text-align:center">${objF==='prob'?L('Проблем нет — всё работает 👍','No problems — everything runs 👍'):L('Сейчас ничего не строится','Nothing is being built now')}</div>`;
  put(el,h);}
function objCard(W,o){const O=E.OBJ[o.t],open=!!objOpen[o.id];let h=`<div class="card oc orow${open?' open':''}${objProb(o)?' prob':''}" id="ob-${o.id}"><button class="oh" data-a="obx" data-id="${o.id}" aria-expanded="${open}">${oIco(o.t)}<span class="f1"><b>${NM.obj(o.t)}${o.lv?` <span class="tag">${L('ур.','lv')} ${o.lv+1}</span>`:''}</b><span class="mut">${objLine(o)}</span></span><span class="chev">${open?'⌄':'›'}</span></button>`;
  if(!open)return h+'</div>';
  h+=`<p class="mut" style="font-size:15px;margin:6px 0 0">${NM.reg(o.r)}${o.plot?' · '+plotNo(E.plotById(W,o.plot)):''}</p>`;
  if(o.st==='b'){const f=(o.tot-o.left)/o.tot;
    h+=`<div class="st">${o.halt?`<span class="tag no">${L('Стоит — нет денег','Stopped — no money')}</span>`:`<span class="tag st">${L('Строится','Under construction')}</span>`} ${L('осталось','left')} <b>${days(o.left)}</b></div>
      <div class="bar"><i style="width:${(f*100).toFixed(0)}%"></i></div><p class="mut" style="font-size:15px;margin:2px 0">${L('Вложено','Invested')} ${M(o.paid)} ${L('из','of')} ${M(o.cost)}</p>`;
    h+=spdBtn(o);
    return h+'</div>';}
  const y=whyTxt(o);
  h+=`<div class="st">${o.off?`<span class="tag">${L('Законсервирован','Mothballed')}</span>`:y?`<span class="tag st">${L('Простой','Idle')}: ${y}</span>`:`<span class="tag go">${L('Работает','Working')}</span>`}</div>`;
  h+='<div class="facts">';
  if(O.out)h+=`<span>${L('Выпуск','Output')}</span><b>${FMT.qty(E.objCap(o),O.out)} ${L('в мес.','a month')}</b>`;
  if(O.stor)h+=`<span>${L('Вместимость','Capacity')}</span><b>+${FMT.num(O.stor)}</b>`;
  if(o.plot){const p=E.plotById(W,o.plot);if(p&&p.dep)h+=`<span>${L('Запас','Reserve')}</span><b>${FMT.qty(p.dep.res,p.dep.g)}</b><span>${L('Себестоимость','Unit cost')}</span><b>${FMT.num(o.vc)} ₽/${NM.unit(p.dep.g)}</b>`;}
  if(O.in)h+=`<span>${L('Сырьё','Input')}</span><b>${Object.keys(O.in).map(g=>low(NM.good(g))+' '+FMT.qty(E.objCap(o)*O.in[g],g)).join(', ')}</b>`;
  h+=`<span>${L('Постоянные','Fixed')}</span><b>${M(E.objFix(o))} ${L('в мес.','a month')}</b></div>`;
  if(o.up){const f=(o.up.tot-o.up.left)/o.up.tot;h+=`<div class="st">${o.up.halt?`<span class="tag no">${L('Модернизация стоит — нет денег','Upgrade stopped — no money')}</span>`:`<span class="tag st">${L('Модернизация','Upgrading')}</span>`} ${L('осталось','left')} <b>${days(o.up.left)}</b></div><div class="bar"><i style="width:${(f*100).toFixed(0)}%"></i></div>`;
    h+=spdBtn(o);}
  else if(o.t!=='store'&&o.lv<E.UP_MAX){const c=E.upCost(W,o),mo=Math.ceil(O.mo/2)+1;
    h+=`<div class="btns"><button class="btn blue noenter" data-a="up" data-id="${o.id}">⬆ ${L('Модернизировать: +50 % выпуска','Upgrade: +50% output')}<small>${M(c)} · ${mons(mo)}</small></button></div>`;}
  if(o.t!=='store')h+=`<button class="sw noenter" data-a="mb" data-id="${o.id}"><span>${o.off?L('Остановлен','Stopped'):L('Работает','Running')}<br><small class="mut">${o.off?L('запустить — снова выпуск и полные расходы','start — output and full costs return'):L(`остановить — экономия ${M(E.objFix(o)*.7)} в месяц`,`stop — saves ${M(E.objFix(o)*.7)} a month`)}</small></span><i class="${o.off?'off':''}">${o.off?L('выкл','off'):L('вкл','on')}</i></button>`;
  if(O.in)h+=`<button class="sw noenter" data-a="ab" data-id="${o.id}"><span>${L('Автозакупка сырья','Auto-buy inputs')}<br><small class="mut">${L('докупать на месте, если не хватает (+6 %)','buy locally when short (+6%)')}</small></span><i class="${o.ab?'':'off'}">${o.ab?L('вкл','on'):L('выкл','off')}</i></button>`;
  return h+'</div>';}

/* ================= логистика ================= */
function rLogi(){const W=w(),el=$$('scr-logi'),free=E.wagFree(W);let h='';
  // вагоны
  h+=`<div class="card"><div class="flex"><span class="ico">${oIco('wagon')}</span><div class="f1" style="margin-left:12px"><b style="font-size:19px">${L('Свои вагоны','Own wagons')}: ${W.wag.n}</b><div class="mut" style="font-size:16px">${L('свободно','free')} ${free} · ${L('в рейсе','on the road')} ${W.wag.n-free}</div></div></div>
    <p style="font-size:16px">${L(`Своими вагонами — без аренды (${rub(E.rentRate(W))} за тонну). Один вагон берёт ${E.WAG_T} т. Обслуживание — 20 тыс. ₽ в месяц за вагон.`,`With your own wagons there’s no rent (${rub(E.rentRate(W))} per tonne). One wagon carries ${E.WAG_T} t. Upkeep: 20k ₽ a month per wagon.`)}</p>
    <button class="btn blue w noenter" data-a="wag">${L('Купить 10 вагонов','Buy 10 wagons')}<small>${M(10*E.WAG_COST)}</small></button></div>`;
  // маршруты
  h+=`<h3>${L('Постоянные маршруты','Regular routes')}</h3><div class="card">`;
  if(!W.routes.length)h+=`<p class="mut" style="margin-top:0">${L('Маршрут сам каждый день отправляет товар с одного склада на другой — например, уголь из Кузбасса на завод на Урале.','A route ships goods every day from one warehouse to another — e.g. coal from Kuzbass to a plant in the Urals.')}</p>`;
  for(const z of W.routes){const c=E.tariff(W,z.from,z.to);
    h+=`<div class="rt">${gIco(z.g)}<div class="f1"><b>${NM.good(z.g)}: ${NM.reg(z.from)} → ${NM.reg(z.to)}</b><span>${FMT.qty(z.q,z.g)} ${L('в месяц','a month')} · ${rub(c)}/${NM.unit(z.g)}${free?'':' + '+L('аренда','rent')} · ${days(E.transitDays(W,z.from,z.to))} ${L('в пути','on the way')}</span></div><button class="xb noenter" data-a="rdel" data-id="${z.id}" aria-label="${L('Удалить','Delete')}">✕</button></div>`;}
  h+=`<div class="btns"><button class="btn accent noenter" data-a="rnew">+ ${L('Новый маршрут','New route')}</button><button class="btn noenter" data-a="ship">🚂 ${L('Отправить разово','One-off shipment')}</button></div></div>`;
  // в пути
  h+=`<h3>${L('Грузы в пути','In transit')}</h3><div class="card">`;
  if(!W.tr.length)h+=`<p class="mut" style="margin:0">${L('Сейчас ничего не едет.','Nothing on the way right now.')}</p>`;
  const tr=W.tr.slice().sort((a,b)=>a.arr-b.arr).slice(0,12);
  for(const x of tr)h+=`<div class="rt">${gIco(x.g)}<div class="f1"><b>${FMT.qty(x.q,x.g)} ${low(NM.good(x.g))}</b><span>${NM.reg(x.from)} → ${NM.reg(x.to)} · ${L('прибудет через','arrives in')} ${days(Math.max(1,x.arr-W.t))}</span></div></div>`;
  if(W.tr.length>12)h+=`<p class="mut">${L('и ещё','and')} ${W.tr.length-12}…</p>`;
  // «📺 Экспресс»: все грузы в пути — вдвое быстрее, раз в игровой месяц
  if(E.expressOk&&E.expressOk(W)&&adL('exp'))h+=`<button class="btn w noenter" data-a="expr" style="margin-top:10px">📺 ${L('Экспресс: всё в пути — вдвое быстрее, за рекламу','Express: all in transit twice as fast, for an ad')}<small>${L('раз в месяц','once a month')}</small></button>`;
  h+='</div>';
  // расстояния
  h+=`<h3>${L('Железная дорога','Railway')}</h3><div class="card">`;
  for(const [a,b] of [['kar','ural'],['ural','kuz'],['kar','kuz']])h+=`<div class="rv"><span class="f1">${NM.reg(a)} ↔ ${NM.reg(b)}</span><b>${FMT.num(E.km(a,b))} ${L('км','km')} · ${days(E.transitDays(W,a,b))} · ${rub(E.tariff(W,a,b))}/${L("т","t")}</b></div>`;
  h+=`<p class="mut" style="font-size:15px;margin-bottom:0">${L('Тариф — за тонну; с чужими вагонами добавляется аренда.','Tariff per tonne; rented wagons add rent on top.')}</p></div>`;
  put(el,h);}
// окно маршрута / разовой отправки
const RS={g:null,from:null,to:null,q:3000};
function rsInit(W,ship){let best=null,bq=-1;for(const r of E.REG)for(const g of E.GL){const q=W.inv[r][g].q;if(q>bq){bq=q;best=[g,r];}}
  if(!RS.g||bq<=0&&!RS.g){RS.g='coal';RS.from='kuz';}else if(!RS.from||(ship&&W.inv[RS.from][RS.g].q<1)){RS.g=best[0];RS.from=best[1];}
  if(!RS.to||RS.to===RS.from)RS.to=E.REG.find(r=>r!==RS.from);}
function openRoute(ship){const W=w();rsInit(W,ship);if(ship&&!RS.inited){RS.inited=1;}
  const have=W.inv[RS.from][RS.g].q,maxQ=ship?Math.floor(have):60000;if(ship)RS.q=Math.max(0,Math.min(RS.q,maxQ));
  const pk=(k,list,lbl)=>'<div class="pick">'+list.map(v=>`<button class="noenter${RS[k]===v?' on':''}" data-k="${k}" data-v="${v}"${k==='to'&&v===RS.from?' disabled':''}>${lbl(v)}</button>`).join('')+'</div>';
  const fc=RS.q>0?E.freightCost(W,RS.from,RS.to,RS.q):{c:0},per=RS.q>0?fc.c/RS.q:0,dd=E.transitDays(W,RS.from,RS.to);
  const need=Math.ceil(RS.q/30/E.WAG_T)*2*dd;
  let h=`<h2>${ship?'🚂 '+L('Разовая отправка','One-off shipment'):'🛤 '+L('Новый маршрут','New route')}</h2>
    <div class="lbl">${L('Что везём','Goods')}</div>${pk('g',E.GL,g=>gIco(g)+NM.good(g))}
    <div class="lbl">${L('Откуда','From')}</div>${pk('from',E.REG,r=>NM.reg(r))}
    <div class="lbl">${L('Куда','To')}</div>${pk('to',E.REG,r=>NM.reg(r))}
    <div class="lbl">${ship?L('Сколько','How much'):L('Сколько в месяц','How much a month')}${ship?` <span class="mut" style="font-weight:600">(${L('на складе','in stock')} ${FMT.qty(have,RS.g)})</span>`:''}</div>
    <div class="qty"><button class="noenter" data-q="-1">−</button><b>${FMT.qty(RS.q,RS.g)}</b><button class="noenter" data-q="1">+</button></div>
    <div class="tip">${RS.q>0?L(`Перевозка ≈ <b>${rub(per)}/${NM.unit(RS.g)}</b> (тариф ${rub(E.tariff(W,RS.from,RS.to))}${per>E.tariff(W,RS.from,RS.to)+1?' + аренда вагонов':''}), ${ship?'всего':'в месяц'} ≈ <b>${M(fc.c)}</b>. В пути ${days(dd)}.`,`Freight ≈ <b>${rub(per)}/${NM.unit(RS.g)}</b> (tariff ${rub(E.tariff(W,RS.from,RS.to))}${per>E.tariff(W,RS.from,RS.to)+1?' + wagon rent':''}), ${ship?'total':'a month'} ≈ <b>${M(fc.c)}</b>. ${days(dd)} on the way.`):L('Выберите количество.','Choose the amount.')}
    ${ship?'':'<br>'+L(`Своих вагонов, чтобы не платить аренду, нужно около ${need}.`,`To avoid rent you need about ${need} own wagons.`)}</div>
    <div class="row"><button class="btn green noenter" id="rsGo"${RS.q>0&&RS.from!==RS.to?'':' disabled'}>${ship?L('Отправить','Ship'):L('Создать маршрут','Create route')}</button><button class="btn" id="rsClose" data-esc>${L('Отмена','Cancel')}</button></div>`;
  modal(h);try{modalRe=()=>openRoute(ship);}catch(e){}
  document.querySelectorAll('#mcard [data-k]').forEach(b=>b.onclick=()=>{snd('tap');RS[b.dataset.k]=b.dataset.v;if(b.dataset.k==='g'&&!ship)RS.q=E.GOODS[RS.g].V>=100000?3000:100;if(RS.to===RS.from)RS.to=E.REG.find(r=>r!==RS.from);openRoute(ship);});
  document.querySelectorAll('#mcard [data-q]').forEach(b=>b.onclick=()=>{snd('tap');const b0=E.GOODS[RS.g].V>=100000?500:50,st=RS.q>=20*b0?4*b0:RS.q>=6*b0?2*b0:b0;RS.q=Math.max(0,Math.min(maxQ,RS.q+st*+b.dataset.q));if(!ship)RS.q=Math.max(b0,RS.q);openRoute(ship);});
  $$('rsClose').onclick=()=>{snd('tap');closeM();};
  $$('rsGo').onclick=()=>{if(ship){const q=act('ship',RS.g,RS.from,RS.to,RS.q);if(q>0){snd('coin');closeM();tst(L('Поезд ушёл: ','Train is off: ')+FMT.qty(q,RS.g)+' → '+NM.reg(RS.to));}else tst(L('Не отправили: не хватает денег или товара','Not shipped: not enough money or goods'));}
    else{const r=act('addRoute',RS.g,RS.from,RS.to,RS.q);if(r==='ok'){snd('coin');closeM();tst(L('Маршрут создан','Route created'));}}};}

/* ================= действия ================= */
function act(name,...a){let r;try{r=GAME.act(name,...a);}catch(e){console.error(e);return null;}
  if(r==='cash'){snd('no');toast(L('Не хватает денег','Not enough money'));}
  else if(r==='plot'){snd('no');tst(L('Сначала нужна лицензия на участок','You need a licence for the plot first'));}
  else if(r==='limit'){snd('no');tst(L('Банк больше не даёт','The bank won’t lend more'));}
  return r;}
function closeM(){hideModal();setTimeout(nextQ,60);}
function showQ(fn){if(modalOn||adOn())Q.push(fn);else fn();}
function nextQ(){if(!modalOn&&!adOn()&&Q.length){const f=Q.shift();try{f();}catch(e){console.error(e);}}}
const adOn=()=>{const a=$$('ad');return !!(a&&a.classList.contains('on'))||(typeof paused!=='undefined'&&paused&&!document.hidden);};
function onClick(e){const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,id=b.dataset.id,W=w();
  if(hlSel&&!hlTut){try{if(b.matches(hlSel))hlSel=null;}catch(er){}}
  if(a!=='reg'&&a!=='tab'&&a!=='back')snd('tap');
  switch(a){
    case 'reg':snd('tap');go('reg',b.dataset.r);break;
    case 'back':snd('tap');back();break;
    case 'tab':if(!b.dataset.t)break;snd('tap');go(b.dataset.t);break;
    case 'obx':objOpen[id]=!objOpen[id];render('obj');break;
    case 'objf':objF=b.dataset.v||'all';render('obj');break;
    case 'expl':{const r=act('explore',id);if(r==='ok'){const p=E.plotById(W,id);tst(L('Геологи выехали: ','Geologists are on their way: ')+days(p.left));}break;}
    case 'explAd':STAT.place('expl');showRewarded(()=>{const r=GAME.freeExplore(id);if(r==='ok'){snd('coin');tst(L('Разведка за счёт спонсора!','Exploration on the sponsor!'));}else if(r==='cash')tst(L('Не получилось','Didn’t work'));});break;
    case 'explNow':crAsk(GAME.CR.expl,L('Узнать итог разведки сразу','Get the survey result now'),()=>{const r=GAME.instantExpl(id);if(r==='cr')crNo();});break;
    case 'buyD':{const p=E.plotById(W,id);spendOk(p.direct,0,L('Лицензия','Licence'),()=>{const r=act('buyDirect',id);if(r==='ok'){snd('coin');tst(L('Лицензия ваша!','The licence is yours!'));}});break;}
    case 'passD':act('passDirect',id);tst(L('Участок выставлен на торги','The plot is up for auction'));break;
    case 'auc':openAuc(id);break;
    case 'bmine':{const p=E.plotById(W,id),t=E.MINE_OF[p.dep.g];spendOk(E.capexOf(W,t,p.r,id),E.OBJ[t].mo,NM.obj(t),()=>{const r=act('build',t,p.r,id);if(r==='ok'){snd('build');tst(L('Стройка началась: ','Construction started: ')+low(NM.obj(t)));tutCip(id);}},E.OBJ[t].fix);break;}
    case 'bfac':openFac(curReg);break;
    case 'up':{const o=W.obj.find(x=>x.id===id);spendOk(E.upCost(W,o),Math.ceil(E.OBJ[o.t].mo/2)+1,L('Модернизация','Upgrade'),()=>{const r=act('upgrade',id);if(r==='ok'){snd('build');tst(L('Модернизация началась','Upgrade started'));}},E.OBJ[o.t].fix*.3);break;}
    case 'spd':{const o=W.obj.find(x=>x.id===id);crAsk(GAME.CR.speed,(o?NM.obj(o.t)+': ':'')+L('готово на 15 дней раньше','done 15 days sooner'),()=>{const r=GAME.speedBuild(id);if(r==='cr')crNo();else if(r==='ok'){snd('build');tst(L('Ускорили: на 15 дней раньше','Sped up: 15 days sooner'));}});break;}
    case 'spdAd':adRun('build','objAdSpeed',[id],()=>{snd('build');tst(L('Ускорили: на 5 дней раньше','Sped up: 5 days sooner'));});break;
    case 'expr':adRun('exp','express',[],()=>{snd('coin');tst(L('Экспресс: грузы в пути придут вдвое быстрее','Express: goods in transit arrive twice as fast'));});break;
    case 'mb':{const o=W.obj.find(x=>x.id===id);if(o)act('mothball',id,!o.off);break;}
    case 'ab':{const o=W.obj.find(x=>x.id===id);if(o)act('autoBuy',id,!o.ab);break;}
    case 'wag':{const r=act('buyWagons',10);if(r==='ok'){snd('coin');tst(L('Куплено 10 вагонов','10 wagons bought'));}break;}
    case 'rdel':act('delRoute',id);break;
    case 'rnew':openRoute(false);break;
    case 'ship':RS.q=Math.min(RS.q,3000);openRoute(true);break;
    case 'ipo':openIpo();break;}}

/* ================= окно: закрытие месяца ================= */
function openClose(rep){if(BZ()&&BZ().openClose&&BZ().openClose(rep))return;const W=w(),p=rep.pl,net=E.netOf(p),cost=p.rev-net;snd('close');
  S.pendRep=rep.m;save();
  let say='',pro='';if(hasAdv('month')&&W.m>=12){try{const m=ADV.month(rep);if(m&&m.proHtml)pro=m.proHtml;else if(m&&m.pro)pro=esc(m.pro);}catch(e){}}
  const pr0=W.reps.find(x=>x.m===rep.m-1),dn=pr0?net-E.netOf(pr0.pl):null;
  const st=tutStep();
  if(st){const d=document.createElement('div');d.innerHTML=TUT[st]().html;say=d.textContent;}
  else{const its=advRel(W);let pick=its.slice(0,its[1]&&its[1].pri>=40&&its[0].pri<70?2:1),t=pick.map(advText).filter((x,i,a)=>x&&a.indexOf(x)===i).join(' ');
    if(t&&t===S.lastSay&&its.length>pick.length)t=its.slice(pick.length).map(advText).filter(Boolean)[0]||t;say=t;}
  S.lastSay=say;
  const inv=-((rep.cf.capex||0)+(rep.cf.lic||0)+(rep.cf.wag||0));
  const newOff=W.offers.filter(o=>!offSeen[o.id]);
  const mood=rep.san?'strict':W.odM>0||net<0&&p.rev>0?'worry':net>0?'happy':'calm';
  let tut='';
  if(tutOn()&&!S.tut.c1&&ragsW()){S.tut.c1=1;save();if(net<0)tut+=`<p>${L('Первый месяц в недрах. Убыток — это разведка и офис: вложение в поиск, окупится, когда заработает разрез. Своё дело по-прежнему приносит прибыль — оно во вкладке «Объекты».','Our first month in mining. The loss is exploration and the office: an investment in the search that pays off once the pit runs. Your business still earns — see the Assets tab.')}</p>`;}
  if(tutOn()&&!S.tut.c1){S.tut.c1=1;save();tut+=`<p>${L(`Это первый отчёт. <b>Выручка</b> — сколько получили за проданное. <b>Затраты</b> — добыча, зарплаты, перевозки, офис, проценты и налог. <b>Прибыль</b> = выручка − затраты. <b>Деньги на конец</b> отличаются от прибыли: стройка тратит деньги, но расходом не считается — это вложение в имущество.`,`This is your first report. <b>Revenue</b> is what we got for sales. <b>Costs</b> are mining, wages, freight, office, interest and tax. <b>Profit</b> = revenue − costs. <b>Cash at month end</b> differs from profit: construction spends cash but isn’t an expense — it’s an investment in assets.`)}</p><p>${L(`Баланс сошёлся: имущество = долги + капитал, расхождение — ${rub(rep.bal.diff)}. У меня всегда так.`,`The balance sheet balances: assets = debt + equity, difference ${rub(rep.bal.diff)}. Always, with me.`)}</p>`;}
  if(tutOn()&&rep.m%12===11&&!S.tut.year){S.tut.year=1;save();tut+=`<p><b>${L('Первый год позади!','The first year is behind us!')}</b> ${L('Вы прошли весь путь: разведка, лицензия, стройка, продажи, отчёты. Дальше — сами: растите, стройте заводы, а при стоимости от '+M(E.IPO_EQ)+' — IPO.','You’ve walked the whole path: exploration, licence, construction, sales, reports. Now it’s up to you: grow, build plants and at '+M(E.IPO_EQ)+' of value — IPO.')}</p>`;}
  const tile=(t,v,c)=>`<div class="tile ${c||''}"><span>${t}</span><b>${M(v)}</b></div>`;
  modal(`<h2>${L('Закрытие месяца','Month closed')}: ${LANG==='en'?FMT.date(rep.m):low(FMT.date(rep.m))}</h2><p class="mut" style="text-align:center;margin-top:-6px;font-size:15px">${L('Людмила Санна свела отчёты','Lyudmila Sanna has closed the books')}</p>
    <div class="chero"><div class="mut">${net>=0?L('Чистая прибыль за месяц','Net profit for the month'):L('Убыток за месяц','Loss for the month')}</div><div class="cbig ${net>=0?'up':'dn'}">${net>0?'+':''}${M(net)}</div>${dn!=null?`<div class="mut">${dn>=0?'▲':'▼'} ${L(`на ${M(Math.abs(dn))} ${dn>=0?'больше':'меньше'}, чем в ${MPREP[pr0.m%12]}`,`${M(Math.abs(dn))} ${dn>=0?'more':'less'} than in ${FMT.date(pr0.m).split(' ')[0]}`)}</div>`:''}</div>
    <div class="clist"><div><span>${L('Выручка','Revenue')}</span><b>${M(p.rev)}</b></div><div><span>${L('Затраты','Costs')}</span><b>${M(cost)}</b></div><div><span>${L('Деньги на конец','Cash at month end')}</span><b class="${rep.c1<0?'dn':''}">${M(rep.c1)}</b></div></div>
    ${inv>0?`<p style="font-size:16px">🏗 ${W.ned?L('Вложено в стройку, лицензии и вагоны','Invested in construction, licences and wagons'):L('Вложено в своё дело','Invested in the business')}: <b>${M(inv)}</b> — ${L('это не затраты, а имущество','not a cost but an asset')}</p>`:''}
    ${rep.ev?`<p style="font-size:16px">📰 ${esc(evText(rep.ev))}</p>`:''}
    ${newOff.length?`<div class="tip">🤝 ${L(`Пришло предложение: «${esc(newOff[0].b)}» купит ${FMT.qty(newOff[0].q,newOff[0].g)} (${low(NM.good(newOff[0].g))}) по ${rub(newOff[0].p)}.`,`New offer: “${esc(newOff[0].be)}” will buy ${FMT.qty(newOff[0].q,newOff[0].g)} of ${low(NM.good(newOff[0].g))} at ${rub(newOff[0].p)}.`)} <button class="btn sm noenter" id="cOff" style="margin-top:6px">${L('Посмотреть','Take a look')}</button></div>`:''}
    <div class="say">${face(mood)}<div>${say?`<p>${esc(say)}</p>`:''}${tut}${pro&&!tut?`<div class="mut" style="font-size:14px;margin-top:6px">${pro}</div>`:''}</div></div>
    ${BZ()?BZ().closeExtra(rep):''}${closeTeaser()}<div class="row"><button class="btn green" id="cGo">${L('Продолжить ▶','Continue ▶')}</button>${hasFin('openReport')?`<button class="btn noenter" id="cMore">📊 ${L('Подробнее','Details')}</button>`:''}</div>`);
  try{modalRe=()=>openClose(rep);}catch(e){}
  try{if(typeof socOffer==='function')socOffer(adDue()&&adReady()&&(!BZ()||BZ().adAllowed()));}catch(e){} // VK: одно предложение SOC за сессию — строкой под кнопками
  {const cb=document.querySelector('#mcard .cbig');if(cb&&!calm())tweenNum(cb,0,Math.round(net),800,v=>(v>0?'+':'')+M(v));}
  if($$('cMore'))$$('cMore').onclick=()=>{snd('tap');FIN.openReport(rep.m);};
  if($$('cOff'))$$('cOff').onclick=()=>{snd('tap');delete S.pendRep;save();closeM();goMk('con')();};
  $$('cGo').onclick=()=>{snd('tap');delete S.pendRep;save();const fr=$$('cGo').getBoundingClientRect();hideModal();if(net>0)fly({x:fr.left+fr.width/2,y:fr.top},0);
    const after=()=>{try{offerReturn();}catch(e){}afterClose(rep);setTimeout(nextQ,60);};
    if(adDue()&&adReady()&&(!BZ()||BZ().adAllowed()))showInterstitial(after);else after();};}
// «🔮 Завтра…» из сюжета — одна строка в окне закрытия месяца
function closeTeaser(){try{const t=window.STORYUI&&STORYUI.teaser&&STORYUI.teaser();return t&&t.tx?`<p class="mut" style="font-size:16px">🔮 ${esc(t.tx)}</p>`:'';}catch(e){return '';}}
// советы по ситуации: без «начните с разведки», если уже есть находка; без вагонов/тарифов/цен, пока нечего возить
function advRel(W){const has=W.obj.some(o=>o.st==='w'&&E.OBJ[o.t].out),busy=E.REG.some(r=>W.plots[r].some(p=>p.own==='you'||p.st==='exp'||(p.st==='found'&&p.direct)));
  return E.advise(W).filter(x=>!(x.k==='idle'&&busy)&&!(!has&&['ev_wagons','ev_tariff','up','down','full','cons','lazy'].indexOf(x.k)>=0));}
function afterClose(rep){const W=w();if(tutOn()){const good=W.hist.filter(h=>h.np>0).length;
    if(good>=2&&!S.tut.ideas){tutOnce('ideas',L('Два месяца с прибылью — вы в деле! Идеи на вырост: разведать ещё участок (уголь в Кузбассе, руда на Урале), лесозаготовка в Карелии — дёшево и быстро, или кредит на завод — вкладка «Финансы» → банк.','Two profitable months — you’re in business! Ideas: explore another plot (coal in Kuzbass, ore in the Urals), logging in Karelia — cheap and quick, or a loan for a plant — Finance → bank.'),'happy');return;}}
  const it=advRel(W)[0];if(it&&it.pri>=70&&!tutActive())advShow({html:esc(advText(it)),mood:it.k==='san'?'strict':'worry',go:WHY_GO[it.k]?()=>WHY_GO[it.k](it):null});}

/* ================= окно: пока вас не было ================= */
function openOffline(s){if(BZ()&&BZ().offline(s))return;const W=w(),mo=s.months||0;snd('close');
  const list=o=>Object.keys(o).filter(g=>o[g]>=1).map(g=>`<span class="g">${gIco(g)}${NM.good(g)} <b>${FMT.qty(o[g],g)}</b></span>`).join('');
  const pr=list(s.prod),so=list(s.sold);
  let h=`<h2>${s.ext?'⏱ '+L('Смена продлена','Shift extended'):'👋 '+L('Пока вас не было','While you were away')}</h2>
    <div class="say">${face(s.np>=0?'happy':'worry')}<div><p>${L(`Управляющий вёл дела ${mo?mons(mo):days(s.days)}: добывал, перерабатывал и продавал. Новых решений без вас не принимал.`,`The manager ran things for ${mo?mons(mo):days(s.days)}: mining, processing and selling. No new decisions without you.`)}</p></div></div>
    <div class="tiles"><div class="tile"><span>${L('Выручка','Revenue')}</span><b>${M(s.rev)}</b></div><div class="tile ${s.np>=0?'pos':'neg'}"><span>${s.np>=0?L('Прибыль','Profit'):L('Убыток','Loss')}</span><b>${M(s.np)}</b></div>
    <div class="tile" style="grid-column:1/-1"><span>${L('Деньги','Cash')}</span><b>${M(s.cash0)} → ${M(s.cash1)}</b></div><div class="tile" style="grid-column:1/-1"><span>${L('Стоимость компании','Company value')}</span><b>${M(s.eq0)} → ${M(s.eq1)}</b></div></div>`;
  if(pr)h+=`<div class="lbl">${L('Добыто и выпущено','Produced')}</div><div class="gl">${pr}</div>`;
  if(so)h+=`<div class="lbl">${L('Продано','Sold')}</div><div class="gl">${so}</div>`;
  if(s.debt1!=null&&(s.debt0||s.debt1))h+=`<div class="tile ${s.debt1>s.debt0+1e6?'neg':''}" style="margin-top:10px"><span>${L('Долг','Debt')}</span><b>${M(s.debt0)} → ${M(s.debt1)}</b></div>${s.debt1>s.debt0+1e6?`<p style="font-size:16px" class="bad">${L('Долг вырос: денег не хватало, банк дал овердрафт под высокий процент. Продайте запасы и не начинайте новых строек.','Debt grew: cash ran short and the bank gave an expensive overdraft. Sell stock and hold off on new projects.')}</p>`:''}`;
  if(s.auc&&s.auc.length)h+=`<div class="lbl">${L('Торги без вас','Auctions while away')}</div>`+s.auc.slice(-6).map(n=>`<p style="font-size:16px">🔨 ${esc(newsText(n))}</p>`).join('');
  if(s.ev&&s.ev.length)h+=`<div class="lbl">${L('События','Events')}</div>`+s.ev.map(e=>`<p style="font-size:16px">📰 ${esc(evText(e))}</p>`).join('');
  if(s.built&&s.built.length)h+=`<p style="font-size:16px">🏗 ${L('Достроено','Completed')}: ${s.built.map(id=>{const o=W.obj.find(x=>x.id===id);return o?NM.obj(o.t):'';}).filter(Boolean).join(', ')}</p>`;
  const more=GAME.offMore(),canPay=typeof PAY!=='undefined'&&PAY.on&&!PAY.own('manager');
  h+=`<p class="mut" style="font-size:16px">${L(`Смена управляющего — ${GAME.shiftH()} ч`,`The manager’s shift is ${GAME.shiftH()} h`)}${canPay?L(', с «Управляющим» — '+GAME.SHIFT_MGR_H+' ч',', with the “Manager” — 8 h'):''}.</p>`;
  h+=`${window.STORYUI&&STORYUI.awayHtml?STORYUI.awayHtml():''}<div class="row">${more>0&&adOk()?`<button class="btn accent noenter" id="oExt">📺 ${L('Продлить смену за рекламу','Extend the shift for an ad')}<small>+${days(more)}</small></button>`:''}
    <button class="btn green" id="oOk">${L('К делам','Back to work')}</button>${canPay?`<button class="btn noenter" id="oShop">🛒 ${L('Управляющий на '+GAME.SHIFT_MGR_H+' ч',GAME.SHIFT_MGR_H+'-hour manager')}</button>`:''}</div>`;
  modal(h);try{modalRe=()=>openOffline(s);}catch(e){}
  $$('oOk').onclick=()=>{snd('tap');closeM();if(!s.ext&&BZ()&&BZ().offAd)BZ().offAd();};
  if($$('oExt'))$$('oExt').onclick=()=>{hideModal();STAT.place('shift');showRewarded(()=>{const r=GAME.extendShift();if(!r)setTimeout(nextQ,60);},()=>setTimeout(nextQ,60));};
  if($$('oShop'))$$('oShop').onclick=()=>{snd('tap');try{openShop('pack');}catch(e){}};}

/* ================= окно: торги ================= */
function openAuc(aid){const W=w(),a=E.aucById(W,aid);if(!a||a.done){tst(L('Торги уже закончились','The auction is over'));return;}
  const p=E.plotById(W,a.p),left=Math.max(0,a.end-W.t),lim=a.V*.6,next=a.lead?a.pr+a.step:a.pr;
  const lead=a.lead==='you'?L('вы','you'):a.lead?NM.bot(a.lead):L('пока никого','no one yet');
  const bots=a.bots.map(b=>`<span><i style="background:${botCol(b.id)}"></i>${esc(NM.bot(b.id))}</span>`).join('');
  const over=next>lim,mt=E.MINE_OF[a.g],mc=mt?E.capexOf(W,mt,a.r,a.p):0,after=W.cash-next;
  const warn=a.lead==='you'||!mc?'':after<mc*.2?`<div class="tip" style="border-color:var(--bad)">⚠️ ${L(`После ставки останется ${M(after)} — на стройку рудника (${M(mc)}, сразу нужно ${M(mc*.2)}) не хватит. Понадобится кредит.`,`After this bid you’d have ${M(after)} — not enough to build the mine (${M(mc)}, ${M(mc*.2)} up front). You’ll need a loan.`)}</div>`
    :after<mc?`<div class="tip">${L(`После ставки останется ${M(after)}: на рудник (${M(mc)}) хватит на начало стройки, остальное — из выручки или кредита.`,`After this bid you’d have ${M(after)}: enough to start the mine (${M(mc)}), the rest from revenue or a loan.`)}</div>`:'';
  const msg=aucMsg[aid]?`<div class="tip">${aucMsg[aid]}</div>`:'';
  modal(`<h2>🔨 ${L('Торги','Auction')}: ${NM.good(a.g)}</h2>
    <p class="mut" style="text-align:center;margin-top:-4px">${NM.reg(a.r)} · ${plotNo(p)} · ${L('до конца','ends in')} ${days(left)}</p>
    <div class="bidp"><span class="mut">${L('Текущая цена','Current price')}</span><b class="pr">${M(a.pr)}</b><span>${L('Лидер','Leader')}: <b>${esc(lead)}</b></span></div>${msg}
    ${depFacts(W,p)}
    <div class="lbl" style="text-align:center">${L('Кто торгуется','Bidders')}</div><div class="who">${bots||`<span>${L('соперников нет','no rivals')}</span>`}</div>
    <div class="say">${face(over?'worry':'calm')}<div><p>${L(`Оценка участка — ${M(a.V)}. Разумный предел — около 0,6 оценки: <b>${M(lim)}</b>. Дороже — рудник будет окупаться слишком долго.`,`The plot is estimated at ${M(a.V)}. A sensible limit is about 0.6 of that: <b>${M(lim)}</b>. Higher, and the mine takes too long to pay off.`)}</p></div></div>
    <div class="row">${a.lead==='you'?`<p class="good" style="text-align:center;margin:0"><b>${L('Вы лидируете!','You’re leading!')}</b> ${L('Если никто не перебьёт до конца торгов — лицензия ваша.','If nobody outbids you by the end, the licence is yours.')}</p><button class="btn green noenter" id="aPass">✅ ${L('Забрать лицензию за ','Take the licence for ')}${M(a.pr)}</button>`
      :`<button class="btn ${over?'':'accent'} noenter" id="aUp">${a.lead?L('Поднять до ','Raise to '):L('Вступить: ','Bid: ')}${M(next)}${over?`<small>${L('дороже разумного предела','above the sensible limit')}</small>`:''}</button>${a.lead?`<button class="btn noenter" id="aPass">${L('Пас — выйти из торгов','Pass — leave the auction')}</button>`:''}`}
    ${warn}<button class="btn" id="aLater" data-esc>${L('Решить позже','Decide later')}</button></div>`);
  try{modalRe=()=>openAuc(aid);}catch(e){}
  $$('aLater').onclick=()=>{snd('tap');closeM();};
  const info={p:a.p,r:a.r,g:a.g};
  if($$('aUp'))$$('aUp').onclick=()=>{snd('gavel');const r=act('bidRaise',aid);
    if(r==='bot'){const b=E.aucById(w(),aid);aucMsg[aid]=`🔨 <b>${esc(NM.bot(b.last||b.lead))}</b> ${L('перебил: теперь','outbid you: now')} <b>${M(b.pr)}</b>`;openAuc(aid);}
    else if(r==='won'){hideModal();aucResult('won',info);}
    else if(r==='cash'){aucMsg[aid]=`<span class="bad">${L('Не хватает денег на эту ставку','Not enough money for this bid')}</span>`;openAuc(aid);}
    else openAuc(aid);};
  if($$('aPass'))$$('aPass').onclick=()=>{snd('gavel');const r=act('bidPass',aid);hideModal();
    if(r==='won'||r==='lost')aucResult(r,info);else{if(r==='none')tst(L('Торги не состоялись','The auction fell through'));setTimeout(nextQ,60);}};}
const aucMsg={};
// итог торгов, в которых вы участвовали: окно с «что дальше»
function aucResult(res,x){const W=w(),p=E.plotById(W,x.p);
  if(res==='won'){snd('win');const t=E.MINE_OF[x.g],pr=p&&p.lic?p.lic.g:0,c=t?E.capexOf(W,t,x.r,x.p):0;
    modal(`<h2>🎉 ${L('Участок ваш!','The plot is yours!')}</h2><div style="width:96px;height:96px;margin:0 auto">${gIco(x.g)}</div>
      <p style="text-align:center">${NM.good(x.g)} · ${NM.reg(x.r)} · ${L('лицензия за','licence for')} <b>${M(pr)}</b></p>
      ${t?`<div class="say">${face('happy')}<div><p>${L(`Что дальше: стройте объект «${NM.obj(t)}» — ${M(c)}, ${mons(E.OBJ[t].mo)}. На счёте ${M(W.cash)}.`,`Next: build a ${low(NM.obj(t))} — ${M(c)}, ${mons(E.OBJ[t].mo)}. Cash: ${M(W.cash)}.`)}</p></div></div>`:''}
      <div class="row">${t?`<button class="btn green noenter" id="arBuild">${L('Построить','Build')} «${NM.obj(t)}»<small>${M(c)}</small></button>`:''}<button class="btn" id="arOk" data-esc>${L('К участку','To the plot')}</button></div>`);
    if($$('arBuild'))$$('arBuild').onclick=()=>{hideModal();go('reg',x.r);spendOk(c,E.OBJ[t].mo,NM.obj(t),()=>{const r=act('build',t,x.r,x.p);if(r==='ok'){snd('build');tst(L('Стройка началась: ','Construction started: ')+low(NM.obj(t)));}setTimeout(nextQ,60);},E.OBJ[t].fix);};
    $$('arOk').onclick=()=>{snd('tap');closeM();go('reg',x.r);};return;}
  const n=W.news.slice().reverse().find(v=>v.k==='lost'&&v.a.p===x.p),rb=W.news.slice().reverse().find(v=>v.k==='reimb'&&v.a.p===x.p);
  modal(`<h2>🔨 ${L('Торги закончились','The auction is over')}</h2>
    <div class="say">${n&&n.a.b?whoFace(n.a.b):face('calm')}<div><p>${n?L(`Участок (${low(NM.good(x.g))}, ${NM.reg(x.r)}) купил «${esc(NM.bot(n.a.b))}» за ${M(n.a.pr)}.`,`The plot (${low(NM.good(x.g))}, ${NM.reg(x.r)}) went to “${esc(NM.bot(n.a.b))}” for ${M(n.a.pr)}.`):L('Участок ушёл сопернику.','The plot went to a rival.')}</p>
    ${rb?`<p>${L('Затраты на разведку вам вернули','Your exploration costs were refunded')}: <b>${M(rb.a.c)}</b>.</p>`:''}<p class="mut">${L('Людмила Санна: не беда — участков в России много, а деньги целы.','Lyudmila Sanna: never mind — Russia has plenty of plots, and our money is safe.')}</p></div></div>
    <div class="row"><button class="btn green" id="arOk">${L('Понятно','Got it')}</button></div>`);
  $$('arOk').onclick=()=>{snd('tap');closeM();};}

/* ================= окно: IPO ================= */
function openIpo(){const W=w();if(!GAME.ipoReady())return;const v=GAME.value(),hs=W.hist.slice(-12),np=hs.reduce((a,x)=>a+x.np,0);snd('tap');
  modal(`<h2>🔔 ${L('Колокол биржи','The exchange bell')}</h2>
    <div class="say">${face('wow')}<div><p>${L(`Холдинг №${W.hold} готов к IPO! Стоимость компании — <b>${M(v)}</b>, прибыль за год — <b>${M(np)}</b>. ${ragsW()&&W.hold===1?'Мы начинали с 5 000 ₽ и комнаты в общежитии. Помните листовки у метро?':`Мы начинали с ${M(W.cap)} уставного капитала.`}`,`Holding No. ${W.hold} is ready for an IPO! Company value: <b>${M(v)}</b>, profit over the year: <b>${M(np)}</b>. ${ragsW()&&W.hold===1?'We started with 5,000 ₽ and a dorm room. Remember the flyers by the metro?':`We started with ${M(W.cap)} of share capital.`}`)}</p></div></div>
    <p>${L(`После IPO вы основаете новый холдинг с репутацией ${W.rep+1}: кредиты дешевле, разведка быстрее и дешевле, стартовый капитал больше. Этот холдинг попадёт в «Прошлые холдинги».`,`After the IPO you found a new holding with reputation ${W.rep+1}: cheaper loans, faster and cheaper exploration, more starting capital. This holding goes to “Past holdings”.`)}</p>
    ${window.META&&META.ipoHtml?META.ipoHtml():''}
    <div class="row"><button class="btn green noenter" id="iGo">🔔 ${L('Позвонить в колокол — основать новый холдинг','Ring the bell — found a new holding')}</button><button class="btn" id="iLater" data-esc>${L('Позже','Later')}</button></div>`);
  $$('iLater').onclick=()=>{snd('tap');closeM();};
  $$('iGo').onclick=()=>{const rec=GAME.doIpo();if(!rec){closeM();return;}snd('win');salute();
    // сюжет покажет IPO тремя кадрами (событие ipo) — вместо второго окна короткий тост, чтобы не было 5 окон подряд
    if(window.STORYUI&&STORYUI.openIpoScene){hideModal();go('map');toast('🎉 '+L(`Холдинг №${rec.hold} на бирже: ${M(rec.eq)}. Новый холдинг №${w().hold} — капитал ${M(w().cap)}`,`Holding No. ${rec.hold} is listed: ${M(rec.eq)}. New holding No. ${w().hold} — capital ${M(w().cap)}`),5000);return;}
    modal(`<h2>🎉 ${L('Поздравляем!','Congratulations!')}</h2><div class="say">${face('wow')}<div><p>${L(`Холдинг №${rec.hold} на бирже: ${M(rec.eq)}. Новый холдинг №${w().hold} ждёт вас — капитал ${M(w().cap)}, репутация ${w().rep}.`,`Holding No. ${rec.hold} is listed: ${M(rec.eq)}. New holding No. ${w().hold} awaits — capital ${M(w().cap)}, reputation ${w().rep}.`)}</p></div></div>${typeof socBragHtml==='function'?socBragHtml('ipo'):''}<div class="row"><button class="btn green" id="iOk">${L('За дело!','Let’s go!')}</button></div>`);
    $$('iOk').onclick=()=>{snd('tap');closeM();go('map');};};}

/* ================= окно: как играть ================= */
// «Как играть»: по главам (текст M9 3.1), темп текущей главы считаем сами; в «Недрах» — подробно про недра
function openHow(){const W=w(),mm=GAME.DAY_BASE*30/60000,mmT=String(Math.round(mm*10)/10).replace('.',LANG==='en'?'.':','),ch=n=>`<b>${L('Глава '+n,'Chapter '+n)}.</b>`;
  const top=`<p class="mut" style="font-size:16px!important">${L(`Сейчас 1 игровой месяц = ${mmT} ${pl(mm,'минута','минуты','минут','minute','minutes')}. Кнопка ×1 в шапке — вдвое быстрее (×2) или пауза (⏸).`,`Right now 1 game month = ${mmT} ${mm===1?'minute':'minutes'}. The ×1 button in the header doubles the speed (×2) or pauses (⏸).`)}</p>`;
  const cr=`<p><b>💎 ${L('Кристаллы','Crystals')}</b> — ${L('за главы, вехи, достижения и ролики. Ими можно немного ускорить дело, взять ещё руку или силы, купить украшения. Ускорения чуть сказываются и на рейтинге недели, но само место не продаётся.','for chapters, milestones, achievements and videos. They speed things up a little, buy an extra hand or energy, or decorations. Speed-ups count a little towards the weekly ranking, but a place can’t be bought.')}</p>`;
  const body=W&&W.ned?`
  <p>1. <b>${L('Разведка','Exploration')}</b> — ${L('на карте откройте регион и разведайте участок с «?».','open a region on the map and explore a “?” plot.')}</p>
  <p>2. <b>${L('Лицензия','Licence')}</b> — ${L('нашли полезное — берите лицензию: без торгов или на торгах с соперниками. Разумная цена — до 0,6 оценки.','found something — get the licence: directly or at an auction against rivals. A sensible price is up to 0.6 of the estimate.')}</p>
  <p>3. <b>${L('Стройка','Construction')}</b> — ${L('разрез, ГОК, карьер или лесозаготовка на участке; заводы — в любом регионе.','a pit, mine, quarry or logging camp on the plot; plants go in any region.')}</p>
  <p>4. <b>${L('Продажа','Sales')}</b> — ${L('товар копится на складе и продаётся сам (автопродажа на «Рынке»), можно заключать контракты или везти сырьё на свой завод по железной дороге.','goods pile up and sell automatically (auto-sell on the Market); you can sign contracts or ship raw materials to your plant by rail.')}</p>
  <p>5. <b>${L('Отчёты','Reports')}</b> — ${L('в конце месяца главбух показывает выручку, прибыль и деньги. 1 месяц = '+mmT+' '+pl(mm,'минута','минуты','минут','minute','minutes')+' игры.','at month end the chief accountant shows revenue, profit and cash. 1 month = '+mmT+' '+(mm===1?'minute':'minutes')+' of play.')}</p>
  <p>6. <b>${L('Без вас','While away')}</b> — ${L(`управляющий ведёт дела до ${GAME.shiftH()} ч: 1 игровой месяц за час отсутствия — добывает и продаёт, но нового не строит и кредитов не берёт.`,`the manager runs things for up to ${GAME.shiftH()} h at 1 game month per hour away: mines and sells, but builds nothing new and takes no loans.`)}</p>
  <p>7. <b>${L('Кредиты','Loans')}</b> — ${L('во вкладке «Финансы». Банк сам скажет, сколько даст. Берите на заводы, но следите, чтобы платежи по долгу не съедали прибыль.','in Finance. The bank tells you how much it will lend. Borrow for plants, but don’t let debt payments eat your profit.')}</p>
  <p>8. <b>IPO</b> — ${L('стоимость от '+M(E.IPO_EQ)+' и год с прибылью: выводите холдинг на биржу и начинайте новый, с репутацией выше.','value from '+M(E.IPO_EQ)+' and a profitable year: take the holding public and start a new one with a better reputation.')}</p>
`:`
  <p>${ch(1)} <b>${L('Карьера','Career')}</b> — ${L('у вас 5 000 ₽ и работа кладовщиком. Берите заказы на вкладке «Заказы» — они выполняются сами, нажимать не нужно. ✋ Руки — сколько дел сразу; ⚡ силы тратятся на заказы и восстанавливаются сном и выходным.','you have 5,000 ₽ and a storekeeper’s job. Take jobs in the Orders tab — they get done by themselves, no tapping needed. ✋ Hands are how many jobs you can do at once; ⚡ energy is spent on jobs and comes back with sleep and a day off.')}</p>
  <p>${ch(2)} <b>${L('Своё дело','My business')}</b> — ${L('накопили — оформляйте ИП и открывайте точку на вкладке «Бизнес». Кофейный автомат работает сам, а в ларьке стоите вы, пока не наймёте управляющего. Точки приносят выручку каждый день.','once you’ve saved up, register as a sole trader and open an outlet in the Business tab. A coffee machine runs by itself; at a kiosk you stand yourself until you hire a manager. Outlets earn every day.')}</p>
  <p>${ch(3)} <b>${L('Сеть','Network')}</b> — ${L(`капитал от ${M(E.OOO_EQ)}, 4 точки, хотя бы один управляющий и кредитная история от 50 — регистрируйте ООО. Склад и опт, стройбаза, самосвалы, второй город.`,`equity from ${M(E.OOO_EQ)}, 4 outlets, at least one manager and a credit history of 50+ — register an LLC. Wholesale, a builders’ yard, dump trucks, a second city.`)}</p>
  <p>${ch(4)} <b>${L('Карьер','Quarry')}</b> — ${L(`капитал от ${M(E.QUARRY_EQ)} и стройбаза или 2 самосвала: торги за участки с песком и щебнем, свой карьер вместо закупки.`,`equity from ${M(E.QUARRY_EQ)} and a builders’ yard or 2 dump trucks: auctions for sand and gravel plots, your own quarry instead of buying.`)}</p>
  <p>${ch(5)} <b>${L('Недра','Mining')}</b> — ${L(`капитал от ${M(E.NEDRA_EQ)} и свой карьер: партнёр входит в долю, а вы разведываете участки в Кузбассе, на Урале и в Карелии, торгуетесь за лицензии, строите разрезы, заводы и возите товар по железной дороге.`,`equity from ${M(E.NEDRA_EQ)} and your own quarry: a partner buys in, and you survey plots in Kuzbass, the Urals and Karelia, bid for licences, build pits and plants and ship goods by rail.`)}</p>
  <p><b>IPO</b> — ${L(`стоимость от ${M(E.IPO_EQ)} и прибыль за последние 12 месяцев: холдинг выходит на биржу, вы выбираете улучшение навсегда и начинаете новый — планка выше.`,`value from ${M(E.IPO_EQ)} and a profit over the last 12 months: the holding goes public, you pick a permanent upgrade and start a new one — with a higher bar.`)}</p>
  <p><b>${L('Каждый день','Every day')}</b> — ${L('«Планёрка» у Людмилы Санны: подарок дня, поручения, вехи главы. В конце месяца — отчёт: выручка, прибыль и деньги.','the morning meeting with Lyudmila Sanna: a daily gift, tasks, chapter milestones. At month end — the report: revenue, profit and cash.')}</p>
  <p><b>📱 ${L('Телефон','Phone')}</b> — ${L('сообщения друзей из 11 «Б», банк, новости. Со 2-й главы — недвижимость: квартиры под аренду, ипотека, помещения.','messages from your Class 11B friends, the bank, news. From chapter 2 — real estate: flats to rent out, mortgages, commercial units.')}</p>
  <p><b>${L('Без вас','While away')}</b> — ${L(`1 игровой месяц за час, до ${GAME.shiftH()} ч: точки торгуют, начатые заказы доделываются${W&&W.me&&W.me.job?', зарплата капает':''}. Новое без вас не открывается.`,`1 game month per hour away, up to ${GAME.shiftH()} h: outlets trade, started jobs get finished${W&&W.me&&W.me.job?', the wage comes in':''}. Nothing new is opened without you.`)}</p>`;
  modal(`<h2>❓ ${L('Как играть','How to play')}</h2>${top}${body}${cr}
  <p class="mut" style="font-size:15px!important">${L('На компьютере: 1–5 — вкладки, Esc — назад или закрыть.','On a computer: 1–5 switch tabs, Esc goes back or closes.')}</p>
  <div class="row"><button class="btn green" id="hClose">${L('Понятно','Got it')}</button></div>`);
  try{modalRe=openHow;}catch(e){}$$('hClose').onclick=()=>{snd('tap');closeM();};}

/* ================= советник: пузырь над меню ================= */
let advCur=null,advT=0;
// подсказки без обучения не «протухают»: уходят сами через 25 с, при смене экрана и когда открылось окно (закрытие месяца, «Пока вас не было»…) — следующая будет свежей
function advStale(){if(advCur&&!advCur.tut)advHide();}
function advShow(o){advCur=o;const el=$$('adv');clearTimeout(advT);try{if(o.hold)GAME.hold.add('advb');else GAME.hold.delete('advb');}catch(e){}if(!o.tut)advT=setTimeout(()=>{if(advCur===o)advHide();},25000);
  const bt=[];if(o.go)bt.push(`<button class="btn${o.okMain?'':' accent'} sm" id="advGo">${o.goLbl||L('Показать','Show me')}</button>`);
  bt[o.okMain?'unshift':'push'](`<button class="btn sm${o.okMain?' accent':o.go?'':' green'}" id="advOk">${o.okLbl||L('Понятно','Got it')}</button>`);
  if(o.tut)bt.push(`<button class="btn sm" id="advOff">${L(hg('Я сам','Я сама'),'I’ll manage')}</button>`);
  el.innerHTML=`<div class="ah">${o.who?whoFace(o.who):face(o.mood)}<div class="f1" style="flex:1;min-width:0"><div class="an">${o.who?esc(NM.who(o.who)+' · '+NM.bot(o.who)):ADV_NAME()}</div><div class="at">${o.html}${o.hold?`<div class="mut advpz">⏸ ${L('Время стоит, пока вы читаете','Time is paused while you read')}</div>`:''}</div></div></div><div class="btns">${bt.join('')}</div>`;
  el.classList.add('on');document.body.classList.add('advon');document.body.style.setProperty('--advh',el.offsetHeight+'px');
  const seen=()=>{if(o.tut&&o.key&&!S.tut['v_'+o.key]){S.tut['v_'+o.key]=1;save();}};
  $$('advOk').onclick=()=>{snd('tap');seen();advHide();if(o.ok)o.ok();};
  if($$('advGo'))$$('advGo').onclick=()=>{snd('tap');seen();advHide();o.go();};
  if($$('advOff'))$$('advOff').onclick=()=>{snd('tap');tutOffAsk();};}
// в главах 1–2 (подработки, свои точки) окно 💎 объясняет траты этих глав; в недрах — как было
function crCh1(){try{const W=w();if(!W||W.ned||!W.me||E.stI(W)>1)return;const p=document.querySelector('#mcard p');if(!p)return;
  p.innerHTML=L(`У вас <b>${S.cr} 💎</b>. Их дают за достижения и рекламу. Тратятся на: «Второе дыхание» (+50 сил), «Срочный заказ» (оплата ×1,5), «+1 рука» и «+20 сил» навсегда. Рейтинг недели они двигают лишь чуть-чуть — само место в нём не продаётся.`,`You have <b>${S.cr} 💎</b>. You get them for achievements and ads. Spend them on: “Second wind” (+50 energy), “Urgent order” (pay ×1.5), “+1 hand” and “+20 energy” for good. They move the weekly leaderboard only a little — a place in it isn’t sold.`);}catch(e){}}
function advHide(){try{GAME.hold.delete('advb');}catch(e){}$$('adv').classList.remove('on');document.body.classList.remove('advon');advCur=null;holdTut();}
function advOpen(){snd('tap');const W=w();if(!W)return;if($$('adv').classList.contains('on')){advHide();return;}
  if(BZ()&&!W.ned){BZ().advOpen();return;}
  const st=tutStep();if(st){const m=TUT[st]();advShow(m);return;}
  const it=E.advise(W)[0];
  if(!it){advShow({html:esc(L('Я рядом. Загляну с отчётом в конце месяца — а пока разведывайте и стройте.','I’m here. I’ll drop by with the report at month end — meanwhile, explore and build.')),mood:'calm'});return;}
  advShow({html:esc(advText(it)),mood:it.k==='ok'||it.k==='grow'?'happy':it.pri>=70?'worry':'calm',go:WHY_GO[it.k]?()=>WHY_GO[it.k](it):null});}

/* ================= обучение первого года (S.tut) ================= */
const SHOT=/[?&]shot=1/.test(location.search);
// мир «из ларька в магнаты» (игрок пришёл в недра из своего дела): без азов про время и «первый отчёт»
function ragsW(){const W=w();return !!(W&&W.fr&&W.fr.rags);}
function tutOn(){const W=w();return !SHOT&& !!W&&!!W.tut&&W.hold===1&&!S.tut.off;}
function tutPlot(){const W=w();return W?W.plots.kuz.find(p=>p.tut):null;}
function tutStep(){if(!tutOn())return null;const W=w(),t=S.tut,p=tutPlot();if(!t.hi)return 'hi';if(!p)return null;
  if(p.st==='hid')return cur==='reg'&&curReg==='kuz'?'expl':'expl0';
  if(p.st==='exp')return 'wait';
  if(p.st==='found'&&p.direct)return inKuz()?'lic':'lic0';
  if(p.own==='you'&&!W.obj.some(o=>o.plot===p.id))return inKuz()?'build':'build0';
  return null;}
const inKuz=()=>cur==='reg'&&curReg==='kuz';
const toKuz=()=>cur==='map'?'#rc-kuz':cur==='reg'?'#scr-reg .back':'#nav [data-tab="map"]';
const TUT={
  hi:()=>({key:'hi',tut:1,mood:'happy',hl:'#rc-kuz',okLbl:L('Открыть Кузбасс','Open Kuzbass'),ok:()=>{S.tut.hi=1;save();GAME.hold.delete('tut');go('reg','kuz');},
    html:w().partner?`<p>${L(`Добро пожаловать в недра! Помните, как мы считали ларёк? Здесь то же самое, только нули другие. Капитал — <b>${M(E.equity(w()))}</b>, из них ваша доля — ${Math.round(w().partner.sh*100)} %.`,`Welcome to mining! Remember how we did the sums for the kiosk? Same here, just more zeros. Equity is <b>${M(E.equity(w()))}</b>; your share is ${Math.round(w().partner.sh*100)}%.`)}</p><p>${L('Начнём с Кузбасса — там много угля.','Let’s start in Kuzbass — there’s plenty of coal there.')}</p>`:`<p>${L(`Здравствуйте! Я Людмила Санна, главный бухгалтер. У нас уставный капитал — <b>${M(w().cap)}</b>: это деньги акционеров на старт.`,`Hello! I’m Lyudmila Sanna, the chief accountant. Our share capital is <b>${M(w().cap)}</b> — the shareholders’ money to get started.`)}</p><p>${L('Начнём с Кузбасса — там много угля.','Let’s start in Kuzbass — there’s plenty of coal there.')}</p>`}),
  expl0:()=>({key:'expl0',tut:1,hl:toKuz(),go:()=>go('reg','kuz'),goLbl:L('Открыть Кузбасс','Open Kuzbass'),html:L('Откройте Кузбасс — там нас ждёт первый участок.','Open Kuzbass — our first plot is waiting there.')}),
  expl:()=>({key:'expl',tut:1,hl:'#pl-'+tutPlot().id+' [data-a="expl"]',go:()=>tutClick('#pl-'+tutPlot().id+' [data-a="expl"]'),goLbl:'🔎 '+L('Разведать участок 1','Explore plot 1'),html:`<p>${L('Участки с «?» ещё не разведаны: что в недрах — неизвестно. Разведка стоит денег, идёт несколько недель, и находка не гарантирована.','Plots marked “?” are unexplored: nobody knows what’s inside. Exploration costs money, takes weeks, and a find isn’t guaranteed.')}</p><p>${L('Для начала я присмотрела <b>участок 1</b> — там разведка займёт всего 6 дней.','For a start I’ve picked <b>plot 1</b> — exploration there takes only 6 days.')}</p>`}),
  wait:()=>({key:'wait',tut:1,hl:'#pl-'+tutPlot().id+' [data-a="explNow"]',html:ragsW()?L(`Геологи работают, осталось ${days(tutPlot().left)}. Можно подождать или узнать сразу за 💎.`,`The geologists are at work, ${days(tutPlot().left)} left. Wait, or find out now for 💎.`):L(`Геологи работают, осталось ${days(tutPlot().left)}. Время в игре идёт само: 1 день — 10 секунд, месяц — 5 минут. Можно подождать или узнать сразу за 💎.`,`The geologists are at work, ${days(tutPlot().left)} left. Time runs by itself: 1 day is 10 seconds, a month is 5 minutes. Wait, or find out now for 💎.`)}),
  lic0:()=>({key:'lic0',tut:1,mood:'happy',hl:toKuz(),go:()=>go('reg','kuz'),goLbl:L('Открыть Кузбасс','Open Kuzbass'),html:L('Геологи нашли уголь! Откройте Кузбасс — оформим лицензию.','The geologists found coal! Open Kuzbass — let’s get the licence.')}),
  lic:()=>{const p=tutPlot();return {key:'lic',tut:1,mood:'happy',hl:'#pl-'+p.id+' [data-a="buyD"]',go:()=>tutClick('#pl-'+p.id+' [data-a="buyD"]'),goLbl:L('Взять лицензию','Take the licence'),html:`<p>${L(`Нашли уголь: ${FMT.qty(p.dep.res,'coal')}! Обычно участок идёт на торги с соперниками, но первую лицензию дают без торгов — за <b>${M(p.direct)}</b>. Это дёшево, берите.`,`We found coal: ${FMT.qty(p.dep.res,'coal')}! Usually a plot goes to auction against rivals, but the first licence comes without one — for <b>${M(p.direct)}</b>. That’s cheap, take it.`)}</p>`};},
  build0:()=>({key:'build0',tut:1,hl:toKuz(),go:()=>go('reg','kuz'),goLbl:L('Открыть Кузбасс','Open Kuzbass'),html:L('Лицензия наша. Откройте Кузбасс — будем строить разрез.','The licence is ours. Open Kuzbass — let’s build the pit.')}),
  build:()=>({key:'build',tut:1,hl:'#pl-'+tutPlot().id+' [data-a="bmine"]',go:()=>tutClick('#pl-'+tutPlot().id+' [data-a="bmine"]'),goLbl:L('Построить разрез','Build the pit'),html:L('Лицензия наша! Теперь стройте угольный разрез. Первый построим быстро — за 1 месяц.','The licence is ours! Now build a coal pit. The first one goes up fast — in 1 month.')})};
function tutActive(){return !!tutStep();}
function tutClick(sel){const e=document.querySelector(sel);if(e)e.click();}
function tutOffAsk(){modal(`<h2>🎓 ${L('Выключить подсказки?','Turn off the tips?')}</h2><p>${L('Людмила Санна перестанет вести вас по шагам. Вернуть обучение можно в ⚙ → «Обучение заново».','Lyudmila Sanna will stop guiding you step by step. You can bring it back in ⚙ → “Restart tutorial”.')}</p>
  <div class="row"><button class="btn green" id="toNo" data-esc>${L('Нет, пусть подсказывает','No, keep the tips')}</button><button class="btn noenter" id="toYes">${L(hg('Да, я сам','Да, я сама'),'Yes, I’ll manage')}</button></div>`);
  $$('toNo').onclick=()=>{snd('tap');closeM();};
  $$('toYes').onclick=()=>{snd('tap');S.tut.off=1;save();hlSel=null;hlTut=false;GAME.hold.delete('tut');advHide();applyHl();closeM();};}
function restartTut(){S.tut={};save();hlSel=null;hlTut=false;advCur=null;const W=w();
  if(W&&!(W.tut&&W.hold===1)){tst(L('Обучение — только для первого холдинга, а вы уже опытный магнат!','The tutorial is for the first holding only — you’re a seasoned tycoon!'));return;}
  const p=tutPlot();if(p&&p.st!=='hid')S.tut.hi=1;save();tutTick();if(!tutStep())advOpen();}
function tutTick(){if(!w())return;const st=tutStep();
  if(!st){if(hlTut&&!tutOnceHl){hlSel=null;hlTut=false;applyHl();}holdTut();return;}
  const m=TUT[st]();if(m.hl!==hlSel){hlSel=m.hl||null;hlScroll=true;}hlTut=true;tutOnceHl=false;
  if(!S.tut['v_'+m.key]&&!(advCur&&advCur.key===m.key))advShow(m);
  holdTut();applyHl();}
let tutOnceHl=false;
function tutOnce(key,html,mood,hl,go){if(!tutOn()||S.tut[key])return;S.tut[key]=1;save();
  if(hl){hlSel=hl;hlTut=true;tutOnceHl=true;hlScroll=true;}advShow({key,tut:1,html,mood:mood||'calm',go});applyHl();}
function tutCip(pid){tutOnce('cip',L('Деньги на стройку уходят в «незавершённое строительство». Это не расход, а наше имущество: прибыль от стройки не падает. А если не терпится — жмите «💎 ускорить»: разрез будет готов на 15 дней раньше. Кристаллы дают за первые шаги, так что пара штук у нас есть.','Money for construction goes into “construction in progress”. It isn’t an expense but our asset: profit doesn’t drop. If you can’t wait, press “💎 speed up”: the pit will be ready 15 days sooner. Crystals come for first steps, so we have a few.'),'happy','#pl-'+pid+' [data-a="spd"]');}
function tutRoute(t,r){const O=E.OBJ[t],W=w();if(!O.in||!tutOn()||S.tut.route)return;
  for(const g in O.in){if(W.obj.some(o=>o.r===r&&E.OBJ[o.t].out===g))continue;const src=W.obj.find(o=>o.r!==r&&E.OBJ[o.t].out===g&&o.st==='w');if(!src)continue;
    tutOnce('route',L(`Сырьё для завода — ${NM.good(g).toLowerCase()} — у нас ${RIN[src.r]}. Проложите маршрут во вкладке «Логистика»: поезд идёт ${days(E.transitDays(W,src.r,r))}, тариф ${rub(E.tariff(W,src.r,r))}/т. Свои вагоны экономят ${rub(E.rentRate(W))}/т аренды. Или включите автозакупку на месте — дороже на 6 %.`,`The plant’s input — ${low(NM.good(g))} — is ours in ${NM.reg(src.r)}. Set up a route in Logistics: the train takes ${days(E.transitDays(W,src.r,r))}, tariff ${rub(E.tariff(W,src.r,r))}/t. Own wagons save ${rub(E.rentRate(W))}/t of rent. Or turn on local auto-buy — 6% dearer.`),'calm','#nav [data-tab="logi"]',()=>go('logi'));return;}}
function holdTut(){const need=tutOn()&&!S.tut.hi;if(need)GAME.hold.add('tut');else GAME.hold.delete('tut');}
function applyHl(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));if(!hlSel)return;const el=document.querySelector(hlSel);
  if(el&&el.offsetParent!==null){el.classList.add('hl');if(hlScroll){hlScroll=false;const m=$$('main');if(m.contains(el)){const tg=el.closest('.plot,.card')||el,d0=tg.getBoundingClientRect(),d=(d0.height<m.clientHeight*.55?d0.top+10:el.getBoundingClientRect().top)-m.getBoundingClientRect().top-70;try{m.scrollTo({top:m.scrollTop+d,behavior:calm()?'auto':'smooth'});}catch(e){m.scrollTop+=d;}}}}}

/* ================= события игры ================= */
function onFound(pid){const W=w(),p=E.plotById(W,pid);if(!p)return;
  if(p.st==='empty'){snd('no');tst(L('Участок оказался пустым. Так бывает — затраты на разведку списаны.','The plot turned out empty. It happens — exploration costs are written off.'));return;}
  snd('found');buzz(40);
  if((p.st==='found'&&p.direct)||p.st==='auc')showQ(()=>celebrate(pid));}
// первая радость: находка — окном с цифрами (для торгов — совет по пределу)
function celebrate(pid){const W=w(),p=E.plotById(W,pid);if(!p||!p.dep)return;const d=p.dep,a=W.auc.find(x=>x.p===p.id),V=E.depVal(W,p.r,d);snd('found');
  modal(`<h2>🎉 ${L('Нашли','Found')}: ${low(NM.good(d.g))}!</h2><div style="width:110px;height:110px;margin:0 auto">${gIco(d.g)}</div>
    <p style="text-align:center;font-size:22px;margin:4px 0"><b>${FMT.qty(d.res,d.g)}</b></p><p style="text-align:center" class="mut">${NM.reg(p.r)} · ${plotNo(p)}</p>
    <div class="facts" style="justify-content:center"><span>${L('Оценка участка','Plot estimate')}</span><b>${M(V)}</b><span>${L('Добыча обойдётся','Mining cost')}</span><b>${FMT.num(d.vc)} ₽/${NM.unit(d.g)}</b></div>
    ${a?`<div class="say">${face('happy')}<div><p>${L(`Участок идёт на торги (${days(Math.max(0,a.end-W.t))}). Разумно платить до ${M(V*.6)}. Проиграем — затраты на разведку вернут.`,`The plot goes to auction (${days(Math.max(0,a.end-W.t))}). Pay up to ${M(V*.6)}. If we lose, exploration costs are refunded.`)}</p></div></div>`:''}
    <div class="row"><button class="btn green" id="fdGo">${a?L('К торгам','To the auction'):L('К участку','To the plot')}</button></div>`);
  $$('fdGo').onclick=()=>{snd('tap');hideModal();if(a&&E.aucById(w(),a.id))openAuc(a.id);else{go('reg',p.r);setTimeout(nextQ,60);}};}
function onBuilt(oid){const W=w(),o=W.obj.find(x=>x.id===oid);if(!o)return;liveT=Date.now();snd('build');buzz(40);salute(true);
  tst(L(`Объект «${NM.obj(o.t)}» ${RIN[o.r]} заработал!`,`${NM.obj(o.t)} in ${NM.reg(o.r)} is up and running!`));
  if(E.OBJ[o.t].dep)tutOnce('work',L('Разрез заработал! Уголь идёт на склад Кузбасса и продаётся сам — автопродажу можно выключить на «Рынке». Цены плавают каждый день: следите за стрелками ▲▼.','The pit is running! Coal goes to the Kuzbass warehouse and sells by itself — auto-sell can be turned off on the Market. Prices move daily: watch the ▲▼ arrows.'),'happy','#nav [data-tab="market"]',()=>go('market'));}
function onAuc(aid,res){const x=watch[aid];delete watch[aid];delete aucMsg[aid];if(!x)return;
  if(res==='won'||res==='lost')showQ(()=>aucResult(res,x));
  else if(res==='cash')tst(L('Не хватило денег оплатить лицензию','Not enough money to pay for the licence'));}
const CR_WHY={expl:['за первую разведку','for your first exploration'],lic:['за первую лицензию','for your first licence'],profit:['за первую прибыль','for your first profit'],year:['за первый год','for your first year'],yearclose:['за закрытый год','for a closed year'],ipo:['за IPO','for the IPO'],
  z_gig1:['за первый заказ','for your first order'],z_rt48:['за рейтинг 4,8','for a 4.8 rating'],z_ip:['за ИП','for going sole trader'],z_biz1:['за первое своё дело','for your first business'],z_quit:[()=>hg('за «Сам себе начальник»','за «Сама себе начальница»'),'for being your own boss'],z_mgr1:['за первого управляющего','for your first manager'],
  z_ooo:['за ООО','for the LLC'],z_chain:['за первую сеть','for your first chain'],z_truck:['за первый самосвал','for your first truck'],z_opi:['за лицензию на карьер','for the quarry licence'],z_quarry:['за первый карьер','for your first quarry'],z_nedra:['за выход в недра','for entering mining'],mile:['за веху','for a milestone'],quarter:['за цель квартала','for the quarter goal'],reunion:['за встречу друзей','for the reunion'],lesson:['за урок Людмилы','for Lyudmila’s lesson']};
const crPend=[];let crT=0;
function crWhy(why){if(CR_WHY[why])return L(...CR_WHY[why].map(x=>typeof x==='function'?x():x));if(why&&why.indexOf('b_')===0){const t=why.slice(2);return L(`за первый объект «${NM.obj(t)}»`,`for your first ${low(NM.obj(t))}`);}return '';}
function onCr(n,why){const c=$$('crCnt');if(c)c.textContent=GAME.cr();if(!(n>0)||why==='ad'||why==='rew')return;   // rew — окно награды само показывает сумму
  crPend.push([n,why]);clearTimeout(crT);crT=setTimeout(()=>{const a=crPend.splice(0);if(!a.length)return;const sum=a.reduce((x,y)=>x+y[0],0);
    const ws=[...new Set(a.map(x=>crWhy(x[1])).filter(Boolean))];   // без пустых причин (подарок, посылка, спонсор и т. п. — просто «+N 💎»)
    tst('+'+sum+' 💎'+(!ws.length?'':ws.length===1?' '+ws[0]:' '+L('за первые шаги: ','for first steps: ')+ws.map(x=>x.replace(/^за |^for (your )?/,'')).join(', ')),4000);},1200);}


/* ================= помощник при бездействии: одна подсказка по делу (не чаще раза в 60 с, в спокойном режиме — 120 с) ================= */
let lastIn=Date.now(),lastIdle=0,idleLast='';const idleSeen={};
const rndIdle=()=>25000+Math.random()*15000;let idleWait=rndIdle();
const RIV={bold:[['Пока вы думаете, я уже копаю. Кто не рискует — тот не звонит в колокол биржи!','While you think, I’m already digging. No risk, no ringing the exchange bell!'],['Участки сами себя не разведают, коллега. Хотя мои — почти.','Plots don’t explore themselves, colleague. Although mine almost do.']],
  cautious:[['Не спешите, коллега. Но и не спите: участки не резиновые.','No rush, colleague. But don’t doze off: plots don’t stretch.'],['Мой батюшка говорил: тише едешь — дальше будешь. Но не настолько же тихо!','My father used to say: slow and steady. But not THIS slow!']],
  calc:[['По моим расчётам, у вас простаивает капитал. Мне бы ваши деньги…','By my calculations your capital is idle. If only I had your money…'],['Я всё посчитала: ваш ход. Время — тоже деньги, и они тикают.','I’ve done the maths: your move. Time is money too, and it’s ticking.']],
  wood:[['Лес растёт медленно, а конкуренты — быстро. Ну, вы поняли.','Forests grow slowly, rivals grow fast. You get the idea.'],['Эх, мне бы вашу решительность… впрочем, её пока тоже не видно!','Oh, to have your decisiveness… though I don’t see it yet either!']]};
function whoFace(id){const col=botCol(id),n=NM.who(id)||NM.bot(id);return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="${col}"/><text x="32" y="42" text-anchor="middle" font-size="28" font-weight="800" style="fill:var(--badge-ink)">${esc(n.charAt(0))}</text></svg>`;}
function goHl(tab,r,sel){return ()=>{if(sel&&sel.indexOf('#ob-')===0){objOpen[sel.slice(4).split(/[ \[]/)[0]]=true;objF='all';}go(tab,r);if(sel){hlSel=sel;hlTut=false;hlScroll=true;applyHl();}};}
function goFin(tab){return ()=>{go('fin');try{if(hasFin('renderFin'))FIN.renderFin($$('scr-fin'),tab);}catch(e){}};}
function goMk(tab){return ()=>{go('market');try{if(hasFin('renderMarket'))FIN.renderMarket($$('scr-market'),tab);}catch(e){}};}
function idleTips(){const W=w(),c=[],DO=L('Сделать','Do it'),SH=L('Показать','Show me');
  if(BZ()&&!W.ned)return BZ().idle();
  const add=(k,pri,html,g,lbl,mood)=>c.push({k,pri,o:{html,go:g,goLbl:g?(lbl||SH):null,mood:mood||'calm',key:'idle_'+k}});
  if(GAME.ipoReady())add('ipo',100,L('Пора звонить в колокол: холдинг готов к IPO! Я уже погладила парадный пиджак.','Time to ring the bell: the holding is ready for an IPO! I’ve already pressed my best jacket.'),openIpo,DO,'wow');
  const halt=W.obj.find(o=>(o.st==='b'&&o.halt)||(o.up&&o.up.halt));
  if(halt)add('halt',95,L(`Стройка стоит: ${low(NM.obj(halt.t))} ${RIN[halt.r]} — кончились деньги. Банк даст кредит, загляните в «Финансы».`,`Construction stopped: ${low(NM.obj(halt.t))} in ${NM.reg(halt.r)} — out of money. The bank will lend; see Finance.`),goFin('bank'),SH,'worry');
  const adv=E.advise(W),cash=adv.find(x=>x.k==='cash');if(cash)add('cash',92,advText(cash),goFin('sum'),SH,'worry');
  for(const r of E.REG)for(const p of W.plots[r]){
    if(p.st==='found'&&p.direct)add('direct',88,L(`Лицензия ${RIN[r]} (${low(NM.good(p.dep.g))}) ждёт вас без торгов — всего ${M(p.direct)}. Такие подарки долго не лежат.`,`A licence in ${NM.reg(r)} (${low(NM.good(p.dep.g))}) awaits, no auction — just ${M(p.direct)}. Gifts like that don’t wait.`),goHl('reg',r,'#pl-'+p.id+' [data-a="buyD"]'),DO,'happy');
    if(p.own==='you'&&p.st==='lic'&&!W.obj.some(o=>o.plot===p.id))add('nobuild',80,L(`Лицензия ${RIN[r]} есть, а ${low(NM.obj(E.MINE_OF[p.dep.g]))} — нет. Участок скучает, я тоже.`,`We hold a licence in ${NM.reg(r)} but no ${low(NM.obj(E.MINE_OF[p.dep.g]))}. The plot is bored, and so am I.`),goHl('reg',r,'#pl-'+p.id+' [data-a="bmine"]'),DO);}
  const au=W.auc.find(a=>!a.done&&a.finder==='you')||W.auc.find(a=>!a.done);
  if(au)add('auc',au.finder==='you'?86:62,L(`Идут торги ${RIN[au.r]}: ${low(NM.good(au.g))}, цена ${M(au.pr)}, лидер — ${au.lead==='you'?'вы':au.lead?NM.bot(au.lead):'пока никто'}. Ещё ${days(Math.max(0,au.end-W.t))}.`,`Auction in ${NM.reg(au.r)}: ${low(NM.good(au.g))}, price ${M(au.pr)}, leader: ${au.lead==='you'?'you':au.lead?NM.bot(au.lead):'nobody yet'}. ${days(Math.max(0,au.end-W.t))} left.`),()=>openAuc(au.id),SH);
  for(const r of E.REG)if(E.stockR(W,r)>E.storR(W,r)*.9){add('full',78,L(`Склад ${RIN[r]} почти полон — ещё чуть-чуть, и добыча встанет. Продайте или постройте склад.`,`The ${NM.reg(r)} warehouse is almost full — production will stop soon. Sell or build storage.`),goMk('px'),SH,'worry');break;}
  const inp=W.obj.find(o=>o.st==='w'&&!o.off&&o.why&&o.why.indexOf('in:')===0);
  if(inp)add('input',75,L(`${NM.obj(inp.t)} ${RIN[inp.r]} простаивает: ${whyTxt(inp)}. Включите автозакупку или проложите маршрут.`,`${NM.obj(inp.t)} in ${NM.reg(inp.r)} is idle: ${whyTxt(inp)}. Turn on auto-buy or set up a route.`),goHl('obj',null,'#ob-'+inp.id),SH,'worry');
  const of=W.offers[0];if(of)add('offer',60,L(`Покупатель «${of.b}» хочет ${FMT.qty(of.q,of.g)} (${low(NM.good(of.g))}) по ${rub(of.p)} — дороже рынка. Солидные люди!`,`“${of.be}” wants ${FMT.qty(of.q,of.g)} of ${low(NM.good(of.g))} at ${rub(of.p)} — above market. Solid folks!`),goMk('con'),SH,'happy');
  const bo=W.obj.find(o=>(o.st==='b'||o.up)&&!o.sp);
  if(bo&&GAME.cr()>=GAME.CR.speed)add('crspeed',55,L(`У нас ${GAME.cr()} 💎 — хватит, чтобы ${low(NM.obj(bo.t))} ${RIN[bo.r]} был готов на 15 дней раньше.`,`We have ${GAME.cr()} 💎 — enough to finish the ${low(NM.obj(bo.t))} in ${NM.reg(bo.r)} 15 days sooner.`),goHl('obj',null,'#ob-'+bo.id+' [data-a="spd"]'),SH);
  const so=W.obj.find(o=>o.st==='b'&&!o.halt&&o.left<=5);
  if(so)add('soon',50,L(`${NM.obj(so.t)} ${RIN[so.r]} будет готов через ${days(so.left)}. Уже слышу, как гудят моторы!`,`The ${low(NM.obj(so.t))} in ${NM.reg(so.r)} will be ready in ${days(so.left)}. I can already hear the engines!`),goHl('obj',null,'#ob-'+so.id),SH,'happy');
  const hr=E.REG.filter(r=>W.plots[r].some(p=>p.st==='hid'&&W.cash>E.explCost(W,r)+60e6));
  if(hr.length){const r=hr[Math.floor(Math.random()*hr.length)],p=W.plots[r].find(x=>x.st==='hid');
    add('explore',45,L(`Денег хватает — можно разведать участок ${RIN[r]}: там чаще ${topGoods(r,2).map(g=>low(NM.good(g))).join(' и ')}. Геологи уже чистят сапоги.`,`We can afford to explore a plot in ${NM.reg(r)}: mostly ${topGoods(r,2).map(g=>low(NM.good(g))).join(' and ')}. The geologists are polishing their boots.`),goHl('reg',r,'#pl-'+p.id+' [data-a="expl"]'),DO);}
  if(W.obj.length>=2){let best=null;for(const r of E.REG)for(const t of FAC){const ec=facEcon(W,t,r);if(!ec||ec.m<=0)continue;const c=E.capexOf(W,t,r);
      if(!best||ec.m/c>best.m/best.c)best={t,r,m:ec.m,c,mo:E.OBJ[t].mo};}
    if(best&&!W.obj.some(o=>o.t===best.t&&o.r===best.r&&o.st==='b'))add('goal',58,L(`Что дальше? По нынешним ценам выгоднее всего ${low(NM.obj(best.t))} ${RIN[best.r]}: +${M(best.m)} в месяц, стройка ${M(best.c)} (${mons(best.mo)}), окупится примерно за ${mons(Math.ceil(best.c/best.m))}. На счёте ${M(W.cash)}${W.cash<best.c*.2?' — понадобится кредит':''}.`,`What next? At today’s prices the best bet is a ${low(NM.obj(best.t))} in ${NM.reg(best.r)}: +${M(best.m)} a month, build cost ${M(best.c)} (${mons(best.mo)}), pays back in about ${mons(Math.ceil(best.c/best.m))}. Cash: ${M(W.cash)}${W.cash<best.c*.2?' — you’ll need a loan':''}.`),goHl('reg',best.r,'[data-a="bfac"]'),SH,'happy');
    const v=GAME.value();if(!GAME.ipoReady())add('ipogoal',36,L(`Цель — IPO: стоимость компании ${M(v)} из ${M(E.IPO_EQ)} (${FMT.pct(v/E.IPO_EQ)}) и год с прибылью.`,`Goal — IPO: company value ${M(v)} of ${M(E.IPO_EQ)} (${FMT.pct(v/E.IPO_EQ)}) and a profitable year.`),()=>go('map'),SH);}
  const dl=E.DAYS-W.d;if(dl<=3)add('close',30,L(`Через ${days(dl)} закрытие месяца — я уже точу карандаши.`,`Month closes in ${days(dl)} — I’m sharpening my pencils.`),null);
  const top=adv[0];if(top&&!c.some(x=>x.k===top.k))add('a_'+top.k,10,advText(top),WHY_GO[top.k]?()=>WHY_GO[top.k](top):null,SH);
  return c;}
function idleTick(){const now=Date.now();if(!w()||now-lastIn<idleWait)return;
  if(modalOn||adOn()||!GAME.running()||$$('adv').classList.contains('on')||tutStep())return;
  if(now-lastIdle<(calm()?120000:60000))return;
  lastIn=now;idleWait=rndIdle();
  const c=idleTips().filter(x=>x.k!==idleLast&&x.o.html&&x.o.html!==S.lastSay&&(!idleSeen[x.k]||now-idleSeen[x.k]>300000)).sort((a,b)=>b.pri-a.pri);if(!c.length)return;
  const t=c[0];lastIdle=now;idleSeen[t.k]=now;idleLast=t.k;S.lastSay=t.o.html;
  if(['explore','auc','nobuild','direct','close'].indexOf(t.k)>=0&&Math.random()<.3&&w().bots.length){const b=w().bots[Math.floor(Math.random()*w().bots.length)],d=E.BOTS.find(x=>x.id===b.id),ln=RIV[d.ch]||RIV.calc,x=ln[Math.floor(Math.random()*ln.length)];
    t.o=Object.assign({},t.o,{who:b.id,html:esc(L(x[0],x[1]))+(t.o.html?`<p class="mut" style="font-size:15px;margin-top:4px">${L('Людмила Санна шепчет','Lyudmila Sanna whispers')}: ${t.o.html}</p>`:'')});}
  snd('tap');advShow(t.o);}

/* ================= живость: короткие реплики на события (не чаще раза в 20 с) ================= */
let liveT=0,newsT=0,prevTr=[];const pxDay=[],pxT={};
function liveSync(){const W=w();if(!W)return;newsT=W.t;prevTr=W.tr.slice();pxDay.length=0;}
function live(t){const n=Date.now();if(n-liveT<20000||modalOn||adOn())return false;liveT=n;tst(t);return true;}
const RL={lost:{bold:['Кто смел — тот и съел!','Fortune favours the bold!'],cautious:['Потихоньку, полегоньку — и участок наш.','Slowly but surely — the plot is ours.'],calc:['Цифры не врут: этот участок стоил каждого рубля.','The numbers don’t lie: worth every ruble.'],wood:['Терпение и труд всё перетрут!','Patience and hard work win the day!']},
  botbuild:{bold:['Строим с размахом!','We build big!'],cautious:['Строим на свои, без кредитов.','Building with our own money, no loans.'],calc:['Посчитала — окупится за три года.','Ran the numbers — pays off in three years.'],wood:['Ещё немного — и вся Карелия в опилках!','A bit more and all Karelia is in sawdust!']}};
function onDayLive(){const W=w();if(!W)return;const out=[];
  const arr=prevTr.filter(x=>W.tr.indexOf(x)<0&&x.arr<=W.t);prevTr=W.tr.slice();
  for(const x of arr)out.push('🚂 '+L(`Поезд: ${FMT.qty(x.q,x.g)} (${GEN[x.g]}) прибыл ${RTO[x.to]}`,`Train arrived in ${NM.reg(x.to)}: ${FMT.qty(x.q,x.g)} of ${low(NM.good(x.g))}`));
  const fresh=W.news.filter(n=>n.t>newsT);newsT=W.t;
  for(const n of fresh)if((n.k==='lost'||n.k==='botbuild')&&n.a.b){const d=E.BOTS.find(x=>x.id===n.a.b);if(!d)continue;const q=(RL[n.k][d.ch]||RL[n.k].calc);
    out.push(`${NM.bot(d.id)}: «${L(q[0],q[1])}» (${n.k==='lost'?L('выиграл торги','won an auction'):L('строит','building')+' '+low(NM.obj(n.a.t))})`);}
  pxDay.push(E.GL.map(g=>W.mk[g].i));if(pxDay.length>8)pxDay.shift();
  if(pxDay.length>=8){const mine={};for(const o of W.obj){const O=E.OBJ[o.t];if(o.st==='w'&&O.out)mine[O.out]=1;}
    E.GL.forEach((g,i)=>{if(!mine[g]||(pxT[g]&&W.t-pxT[g]<7))return;const d=W.mk[g].i/pxDay[0][i]-1;if(Math.abs(d)>.05){pxT[g]=W.t;
      out.push((d>0?'📈 ':'📉 ')+NM.good(g)+' '+L((d>0?'подорожал':'подешевел')+' на '+FMT.pct(Math.abs(d))+' за неделю',(d>0?'up ':'down ')+FMT.pct(Math.abs(d))+' this week'));}});}
  if(out.length)live(out[0]);}

/* ================= окна: защита от нажатия «под пальцем» (400 мс) и крестик у длинных ================= */
let mBlock=0;
function modalWatch(){const m=$$('modal'),mc=$$('mcard');if(!m||!mc||typeof MutationObserver==='undefined')return;let was=false;
  const chk=()=>{const on=m.classList.contains('on');if(on&&!was)mBlock=Date.now()+400;was=on;if(on)setTimeout(addX,30);};
  new MutationObserver(chk).observe(m,{attributes:true,attributeFilter:['class']});new MutationObserver(()=>{if(m.classList.contains('on'))setTimeout(addX,30);}).observe(mc,{childList:true});
  const stop=e=>{if(e.isTrusted&&Date.now()<mBlock&&m.classList.contains('on')&&(m.contains(e.target)||e.type==='keydown')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation&&e.stopImmediatePropagation();}};
  ['click','pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','keydown'].forEach(t=>document.addEventListener(t,stop,{capture:true,passive:false}));}
const ESC_IDS=['mCancel','lbClose','shClose','stClose','abBack','hBack','hClose'];
// нижний лист: свайп вниз по «ручке»/верху (или по всему листу, если он не прокручен) закрывает; тап по затемнению — тоже (только окна с кнопкой «закрыть/позже»)
function sheetSwipe(){const m=$$('modal'),c=$$('mcard');if(!m||!c)return;let y0=null,x0=0,dy=0,drag=false;
  const escB=()=>c.querySelector('[data-esc]')||ESC_IDS.map($$).find(x=>x&&c.contains(x));
  const closeIt=()=>{const e=escB();if(e)e.click();};
  c.addEventListener('touchstart',e=>{y0=null;if(window.innerWidth>=700||e.touches.length!==1||Date.now()<mBlock)return;const t=e.touches[0],r=c.getBoundingClientRect();
    if(c.scrollTop>2&&t.clientY-r.top>48)return;if(e.target.closest('input,textarea,.f-rng,input[type=range]'))return;y0=t.clientY;x0=t.clientX;dy=0;drag=false;},{passive:true});
  c.addEventListener('touchmove',e=>{if(y0==null)return;const t=e.touches[0];dy=t.clientY-y0;
    if(!drag){if(dy>10&&Math.abs(t.clientX-x0)<dy&&c.scrollTop<=2)drag=true;else if(dy<-6||Math.abs(t.clientX-x0)>14){y0=null;return;}else return;}
    if(e.cancelable)e.preventDefault();c.style.transition='none';c.style.transform='translateY('+Math.max(0,escB()?dy:dy*.2)+'px)';},{passive:false});
  const end=()=>{if(y0==null)return;y0=null;if(!drag)return;drag=false;c.style.transition='';
    if(dy>90&&escB()){c.style.transform='translateY(100%)';setTimeout(()=>{closeIt();c.style.transform='';},170);}else c.style.transform='';};
  c.addEventListener('touchend',end,{passive:true});c.addEventListener('touchcancel',end,{passive:true});
  m.addEventListener('click',e=>{if(e.target===m&&Date.now()>mBlock&&escB()){snd('tap');closeIt();}});}
function addX(){const mc=$$('mcard');if(!mc||mc.querySelector('.mx'))return;if(mc.scrollHeight<window.innerHeight*.72)return;
  const b=document.createElement('button');b.className='mx';b.setAttribute('aria-label',L('Закрыть','Close'));b.textContent='✕';
  b.onclick=()=>{snd('tap');const e=mc.querySelector('[data-esc]')||ESC_IDS.map($$).find(x=>x&&mc.contains(x));if(e)e.click();else closeM();};mc.insertBefore(b,mc.firstChild);}

/* ================= «сочность» (этап 3): деньги летят в счётчик, счётчик докручивается, салют на главах и IPO =================
   В спокойном режиме (calm) — без полёта и салюта: только цифры. Всё на Web Animations / canvas, без библиотек. */
let cashHold=0,cashShown=null;
function pulseEl(el){if(!el||calm())return;el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');}
function tweenNum(el,from,to,ms,fmt){if(!el)return;if(calm()||!window.requestAnimationFrame||from===to){el.textContent=fmt(to);return;}const t0=performance.now();
  const st=t=>{const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)requestAnimationFrame(st);};requestAnimationFrame(st);}
// полёт значков из точки from (элемент или {x,y}) в цель (#hCash — деньги, #crBtn — 💎); amount — подпись «+1 200 ₽» у цели
function fly(from,amount,kind){const cr=kind==='cr',tg=$$(cr?'crBtn':'hCash');if(!tg)return;const W=w();
  const done=()=>{if(!cr){cashHold=0;const c=$$('hCash');if(c&&W){const a=cashShown!=null?cashShown:W.cash;tweenNum(c,a,Math.round(W.cash),520,v=>M(v));setTimeout(()=>{cashShown=null;hdr();},560);}}pulseEl(tg);
    if(amount){const r=tg.getBoundingClientRect(),t=document.createElement('div');t.className='flyt'+(amount<0?' neg':'');t.textContent=(amount>0?'+':'−')+(cr?Math.abs(amount)+' 💎':M(Math.abs(amount)));
      t.style.left=(r.left+r.width/2)+'px';t.style.top=(r.bottom+2)+'px';document.body.appendChild(t);setTimeout(()=>t.remove(),1300);}};
  if(calm()||(typeof modalOn!=='undefined'&&modalOn)||!document.body.animate||!tg.offsetParent){if(!cr&&W){cashHold=0;}done();return;}
  if(!cr&&!cashHold){const c=$$('hCash');cashShown=W?Math.round(W.cash-(amount||0)):null;if(c&&cashShown!=null)c.textContent=M(cashShown);cashHold=Date.now();}
  const tr=tg.getBoundingClientRect();let fx=window.innerWidth/2,fy=window.innerHeight*.55;
  if(from&&from.getBoundingClientRect&&from.offsetParent){const r=from.getBoundingClientRect();fx=r.left+r.width/2;fy=r.top+r.height/2;}else if(from&&from.x!=null){fx=from.x;fy=from.y;}
  const tx=tr.left+tr.width*(cr?.3:.3),ty=tr.top+tr.height/2,n=cr?4:Math.max(3,Math.min(7,3+Math.floor(Math.log10(Math.max(10,Math.abs(amount||100)))-2)));let left=n;
  for(let i=0;i<n;i++){const e=document.createElement('div');e.className='flyc'+(cr?' cr':'');e.textContent=cr?'💎':'₽';document.body.appendChild(e);
    const sx=fx+(Math.random()-.5)*60,sy=fy+(Math.random()-.5)*30;e.style.left=sx+'px';e.style.top=sy+'px';
    const mx=(sx+tx)/2+(Math.random()-.5)*90-sx,my=Math.min(sy,ty)-50-Math.random()*70-sy;
    let a;try{a=e.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:0},{transform:'translate(-50%,-50%) scale(1.15)',opacity:1,offset:.14},
      {transform:`translate(calc(-50% + ${mx}px),calc(-50% + ${my}px)) scale(1)`,opacity:1,offset:.55},{transform:`translate(calc(-50% + ${tx-sx}px),calc(-50% + ${ty-sy}px)) scale(.55)`,opacity:.85}],
      {duration:620+i*40,delay:i*70,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'});}catch(x){e.remove();if(--left===0)done();continue;}
    a.onfinish=()=>{e.remove();if(i===0)snd('coin');if(--left===0)done();};}
  setTimeout(()=>{if(cashHold&&Date.now()-cashHold>2500){cashHold=0;cashShown=null;hdr();}},2600);}
// салют: canvas поверх всего на ~1,6 с; small — маленький «хлопок» (открылась точка, достроили объект)
function salute(small){if(calm()||!window.requestAnimationFrame)return;const cv=document.createElement('canvas'),dpr=Math.min(2,window.devicePixelRatio||1),W0=window.innerWidth,H0=window.innerHeight;
  cv.className='salute';cv.width=W0*dpr;cv.height=H0*dpr;document.body.appendChild(cv);const x=cv.getContext('2d');if(!x){cv.remove();return;}x.scale(dpr,dpr);
  const cs=getComputedStyle(document.body),col=['--accent','--good','--gold','--bad','--cr1'].map(v=>cs.getPropertyValue(v).trim()||'#2e5bff').concat(['#ffd98a']);
  const P=[],bursts=small?[[W0/2,H0*.42]]:[[W0*.3,H0*.32],[W0*.7,H0*.28],[W0*.5,H0*.45]];
  bursts.forEach((b,k)=>{for(let i=0;i<(small?36:60);i++){const a=Math.random()*Math.PI*2,v=(small?2.2:3)+Math.random()*(small?3:4.5);P.push({x:b[0],y:b[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.5,c:col[(i+k)%col.length],s:3+Math.random()*4,r:Math.random()*6,d:k*9});}});
  let f=0;const T=small?60:100;const st=()=>{f++;x.clearRect(0,0,W0,H0);for(const p of P){if(f<p.d)continue;p.vy+=.09;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=.2;
      x.globalAlpha=Math.max(0,1-(f-p.d)/T);x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore();}
    if(f<T+20)requestAnimationFrame(st);else cv.remove();};requestAnimationFrame(st);}

/* ================= имя холдинга ================= */
function holdName(W){W=W||w();return S.hn&&S.hn.h===W.hold&&S.hn.n?S.hn.n:L('Холдинг №','Holding No. ')+W.hold;}
function openRename(){const W=w();modal(`<h2>✎ ${L('Название холдинга','Holding name')}</h2><p>${L('Как назовём компанию? Имя увидите в шапке и в отчётах.','What shall we call the company? You’ll see it in the header and reports.')}</p>
  <input id="hnIn" class="inp" maxlength="24" value="${esc(S.hn&&S.hn.h===W.hold?S.hn.n:'')}" placeholder="${esc(L('Холдинг №','Holding No. ')+W.hold)}">
  <div class="row"><button class="btn green" id="hnOk">${L('Сохранить','Save')}</button><button class="btn" id="hnNo" data-esc>${L('Отмена','Cancel')}</button></div>`);
  const i=$$('hnIn');setTimeout(()=>{try{i.focus();}catch(e){}},450);
  const ok=()=>{const v=String(i.value||'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,24);S.hn={h:W.hold,n:v};save();closeM();hdr();};
  $$('hnOk').onclick=ok;i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();ok();}};$$('hnNo').onclick=()=>{snd('tap');closeM();};}

/* ================= скорость времени: ⏸ / ×1 / ×2 (GAME.setSpeed, если есть) ================= */
function spdNow(){try{return typeof GAME.speed==='function'?GAME.speed():1;}catch(e){return 1;}}
function spdBtnUpd(){const b=$$('spdBtn');if(!b)return;const ok=typeof GAME.setSpeed==='function';b.style.display=ok?'':'none';if(!ok)return;
  const v=spdNow();b.textContent=v===0?'⏸':v===2?'×2':'×1';b.classList.toggle('on2',v===2);b.classList.toggle('on0',v===0);
  b.setAttribute('aria-label',v===0?L('Время стоит — нажмите, чтобы пошло','Time is paused — tap to run'):v===2?L('Быстрее вдвое','Double speed'):L('Обычная скорость','Normal speed'));}
function spdCycle(){if(typeof GAME.setSpeed!=='function')return;const v=spdNow(),n=v===1?2:v===2?0:1;GAME.setSpeed(n);snd('tap');spdBtnUpd();hdr();
  tst(n===0?L('⏸ Время остановлено','⏸ Time paused'):n===2?L('⏩ Время идёт вдвое быстрее','⏩ Double speed'):L('▶ Обычная скорость','▶ Normal speed'),1500);}

/* ================= крупный шрифт (S.big) ================= */
function applyBig(){document.body.classList.toggle('big',!!S.big);}

/* ================= клавиши ПК: 1–5 — вкладки, Esc — назад ================= */
function onKey(e){if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||modalOn||adOn())return;
  if(e.key==='Escape'){back();e.preventDefault();}
  else if(/^[1-9]$/.test(e.key)){const t=TABS_ON()[+e.key-1];if(t){snd('tap');go(t);}}}

/* ================= запуск ================= */
function init(){
  if(window.BIZUI)try{BIZUI.init();}catch(e){console.error(e);}
  buildNav();
  $$('crBtn').onclick=()=>{snd('tap');try{openShop();crCh1();}catch(e){}};
  $$('btnSet').onclick=()=>{snd('tap');try{openSettings();}catch(e){}};
  $$('main').addEventListener('click',onClick);applyBig();modalWatch();
  const hn=document.querySelector('.hname');if(hn){hn.style.cursor='pointer';hn.onclick=()=>{if(BZ()&&BZ().hname(w()))return;snd('tap');openRename();};}
  if($$('spdBtn'))$$('spdBtn').onclick=spdCycle;
  $$('advMin').innerHTML=face('calm');$$('advMin').onclick=advOpen;
  GAME.on('change',()=>refresh('change'));GAME.on('day',()=>refresh('day'));
  GAME.on('close',rep=>{refresh('close');showQ(()=>openClose(rep));});
  GAME.on('offline',s=>{liveSync();const sh=()=>{if(Date.now()-lastIn<1200){setTimeout(sh,700);return;}showQ(()=>openOffline(s));};sh();});
  GAME.on('day',onDayLive);GAME.on('ipo',liveSync);
  GAME.on('found',onFound);GAME.on('built',onBuilt);GAME.on('auc',onAuc);GAME.on('cr',onCr);
  GAME.on('upgraded',oid=>{const o=w().obj.find(x=>x.id===oid);snd('build');if(o)tst(L('Модернизация завершена: ','Upgrade finished: ')+low(NM.obj(o.t)));});
  GAME.on('ipo',()=>{hlSel=null;refresh();});
  window.uiRefresh=()=>{try{$$('advMin').innerHTML=face('calm');if(advCur){const o=advCur;advCur=null;const st=tutStep();if(o.tut&&st)advShow(TUT[st]());else advHide();}refresh();}catch(e){console.error(e);}};
  document.addEventListener('keydown',onKey);
  // пузырь советника прячем, пока открыто окно (без CSS :has — в старых WebView он не работает)
  {const md=$$('modal'),ad=$$('adv');if(md&&ad){const sync=()=>{ad.style.visibility=md.classList.contains('on')?'hidden':'';};sync();try{new MutationObserver(sync).observe(md,{attributes:true,attributeFilter:['class']});}catch(e){setInterval(sync,300);}}}
  setInterval(()=>{hdr();{const ob=$$('advOff');if(ob){const t=L(hg('Я сам','Я сама'),'I’ll manage');if(ob.textContent!==t)ob.textContent=t;}}if(modalOn)advStale();nextQ();idleTick();if(!modalOn&&pendT.length)toast(pendT.shift());if(GAME.hold.has('tut')&&!advCur&&!modalOn&&tutStep()==='hi')advShow(TUT.hi());},500);
  ['pointerdown','keydown','touchstart','wheel'].forEach(t=>document.addEventListener(t,()=>{lastIn=Date.now();},{capture:true,passive:true}));
  let rt=0;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(cur==='map')render();},200);});
  GAME.start();liveSync();
  if(S.pendRep!=null){const r=w().reps.find(x=>x.m===S.pendRep);if(r)showQ(()=>openClose(r));else delete S.pendRep;}
  // ⚙: пункт «Обучение заново» (только в первом холдинге)
  const os=window.openSettings;if(typeof os==='function')window.openSettings=function(){os.apply(this,arguments);try{const W=w(),h=$$('stHow');
    const cb=$$('stCalm');if(cb&&!$$('stBig')){const b=document.createElement('button');b.className='set';b.id='stBig';b.innerHTML=`<span>🔠 ${L('Крупный шрифт','Large text')}<br><small>${L('всё на экране крупнее','everything a bit bigger')}</small></span>${S.big?'<i>'+L('вкл','on')+'</i>':'<i class="off">'+L('выкл','off')+'</i>'}`;cb.parentNode.insertBefore(b,cb.nextSibling);b.onclick=()=>{S.big=!S.big;save();applyBig();window.openSettings();};}
    const bb=$$('stBig');if(bb&&!$$('stLes')&&W&&!W.ned){const b=document.createElement('button');b.className='set';b.id='stLes';b.innerHTML=`<span>📘 ${L('Уроки Людмилы Санны','Lyudmila Sanna’s lessons')}<br><small>${L('предлагать новый урок после отчёта месяца','offer a new lesson after the month report')}</small></span>${!S.lesOff?'<i>'+L('вкл','on')+'</i>':'<i class="off">'+L('выкл','off')+'</i>'}`;bb.parentNode.insertBefore(b,bb.nextSibling);b.onclick=()=>{S.lesOff=!S.lesOff;save();snd('tap');window.openSettings();};}
    if(h&&!$$('stTut')&&W&&W.tut&&W.hold===1){const b=document.createElement('button');b.className='btn noenter';b.id='stTut';b.textContent='🎓 '+L('Обучение заново','Restart tutorial');h.parentNode.insertBefore(b,h);b.onclick=()=>{snd('tap');hideModal();restartTut();};}}catch(e){}};
  go(HOME());
  // заставка уходит после первого кадра игры
  requestAnimationFrame(()=>{document.body.classList.add('ready');setTimeout(()=>{const sp=$$('splash');if(sp)sp.remove();},450);});
  sheetSwipe();}

// «Назад» Android: пузырь советника → регион → карта; на карте — false (обёртка решит сама)
function back(){if($$('adv').classList.contains('on')){advHide();return true;}if(BZ()&&BZ().back())return true;
  const okT=t=>t==='reg'||TABS_ON().indexOf(t)>=0||(BZ()&&['today','gigs','biz','net','pit'].indexOf(t)>=0);
  while(navStack.length){const p=navStack.pop();if(p.t===cur&&(p.t!=='reg'||p.r===curReg))continue;if(!okT(p.t))continue;navBack=true;try{go(p.t,p.r);}finally{navBack=false;}return true;}
  if(cur!==HOME()){navBack=true;try{go(HOME());}finally{navBack=false;}return true;}return false;}
// свайп от левого края экрана — «назад» (как в iOS)
(function(){let x0=-1,y0=0,t0=0;
  document.addEventListener('pointerdown',e=>{x0=-1;if(e.clientX<24&&!(typeof modalOn!=='undefined'&&modalOn)&&!e.target.closest('#modal,#phone,.ph-body')){x0=e.clientX;y0=e.clientY;t0=Date.now();}},{passive:true});
  document.addEventListener('pointerup',e=>{if(x0<0)return;const dx=e.clientX-x0,dy=Math.abs(e.clientY-y0);x0=-1;if(dx>80&&dy<60&&Date.now()-t0<800){snd('tap');back();}},{passive:true});
  document.addEventListener('pointercancel',()=>{x0=-1;},{passive:true});})();
window.UI={fly,salute,pulse:pulseEl,tweenNum,face,TAB_DEF,buildNav,init,refresh,go,back,restartTut,idleTest:()=>{lastIn=0;lastIdle=0;idleWait=0;idleTick();return advCur&&advCur.key;},show:t=>go(t),openRegion:r=>go('reg',r),render,openHow,openAuc,openClose,openOffline,openIpo,openFac,openRoute,adv:advShow,advOpen,tutStep,
  get cur(){return cur;},get reg(){return curReg;}};
init();
})();
